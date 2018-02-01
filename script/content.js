$(function () {
    var $imageContainer = null;
    dataAccess.getContentItems().pipe(function (items) {
        contentBuilder.setItemParent($(".content"));
        contentBuilder.setItemTemplate($("#template-content-item"));
        contentBuilder.setItemImageContainerSelector(".container-content-image");
        contentBuilder.setItemImageTemplate($("#template-content-item-image"));
        contentBuilder.setItemResourceContainerSelector(".container-content-resource");
        contentBuilder.setItemResourceTemplate($("#template-content-item-resource"));
        contentBuilder.setItemDownloadContainerSelector(".container-content-download");
        contentBuilder.setItemDownloadTemplate($("#template-content-item-download"));

        var imageLoadPromises = [];
        $.each(items, function (index, item) {
            var promise = contentBuilder.addItemToPage(item);
            imageLoadPromises.push(promise);
        });
        $.when.apply(null, imageLoadPromises).done(function () {
            $imageContainer = $('.container-content-image');
            initContainerLayout();
            initImageEvents();
        });
    });

    var initContainerLayout = function () {
        $imageContainer.masonry({
            itemSelector: '.content-image',
            stagger: 10,
            columnWidth: 32
        });
    }

    var initImageEvents = function () {
        $(".content-image").on("click", function () {
            $(this).toggleClass("content-image-large");
            $imageContainer.masonry();
        });
    }
});

var contentBuilder = function () {
    var $template = null;
    var selectorImageContainer = "";
    var $templateImage = null;
    var selectorResourceContainer = "";
    var $templateResource = null;
    var selectorDownloadContainer = "";
    var $templateDownload = null;
    var $parent = null;
    var isDeepCopy = true;

    var addItem = function (contentItem) {
        var $promise = $.Deferred();
        var promises = [];
        var clone = $template.prop("content").cloneNode(isDeepCopy);
        clone.querySelector("h3").innerText = contentItem.title;
        clone.querySelector("p").innerText = contentItem.description;
        promises = addImageSectionAsync(clone, contentItem.images);
        addResourceSection(clone, contentItem.resources);
        addDownloadSection(clone, contentItem.downloads);
        $parent.append(clone);
        $.when.apply(null, promises).done(function () {
            $promise.resolve();
        });
        return $promise.promise();
    };

    var addImageSectionAsync = function (itemClone, images) {
        var promises = [];
        var imageClone = null;
        $.each(images, function (index, value) {
            var $imageLoadPromise = $.Deferred();
            promises.push($imageLoadPromise);
            imageClone = $templateImage.prop("content").cloneNode(isDeepCopy);
            imageClone.querySelector("img").onload = function () {
                $imageLoadPromise.resolve();
            };
            imageClone.querySelector("img").setAttribute("src", value);
            itemClone.querySelector(selectorImageContainer).append(imageClone);
        });
        return promises;
    }

    var addResourceSection = function (itemClone, resources) {
        var resourceClone = null;
        $.each(resources, function (index, resource) {
            resourceClone = $templateResource.prop("content").cloneNode(isDeepCopy);
            resourceClone.querySelector("a").setAttribute("href", resource.resource);
            resourceClone.querySelector("a").innerText = resource.title;
            itemClone.querySelector(selectorResourceContainer).append(resourceClone);
        });
        if (resources.length <= 0) {
            $(itemClone.querySelector(selectorResourceContainer)).hide();
        }
    };

    var addDownloadSection = function (itemClone, downloads) {
        var downloadClone = null;
        $.each(downloads, function (index, download) {
            downloadClone = $templateDownload.prop("content").cloneNode(isDeepCopy);
            downloadClone.querySelector("a").setAttribute("href", download.resource);
            downloadClone.querySelector("a").innerText = download.title;
            itemClone.querySelector(selectorDownloadContainer).append(downloadClone);
        });
        if (downloads.length <= 0) {
            $(itemClone.querySelector(selectorDownloadContainer)).hide();
        }
    }

    var setTemplate = function ($itemTemplate) {
        $template = $itemTemplate;
    };

    var setImageContainerSelector = function (selector) {
        selectorImageContainer = selector;
    }

    var setImageTemplate = function ($imageTemplate) {
        $templateImage = $imageTemplate;
    }

    var setDownloadContainerSelector = function (selector) {
        selectorDownloadContainer = selector;
    }

    var setDownloadTemplate = function ($template) {
        $templateDownload = $template;
    }

    var setParent = function ($itemParent) {
        $parent = $itemParent;
    };

    return {
        addItemToPage: addItem,
        setItemTemplate: setTemplate,
        setItemImageContainerSelector: setImageContainerSelector,
        setItemImageTemplate: setImageTemplate,
        setItemResourceContainerSelector: function (selector) {
            selectorResourceContainer = selector;
        },
        setItemResourceTemplate: function($template) {
            $templateResource = $template;
        },
        setItemDownloadContainerSelector: setDownloadContainerSelector,
        setItemDownloadTemplate: setDownloadTemplate,
        setItemParent: setParent
    };
}();

var dataAccess = function () {
    var getContent = function () {
        var $promise = $.Deferred();
        getContentFiles()
            .pipe(getContentItemsForList)
            .pipe(function (items) {
                $promise.resolve(items);
            })
        return $promise.promise();
    };

    var getContentFiles = function () {
        var $promise = $.Deferred();
        $.ajax({
            url: "./data/content.json"
        }).done(function (content) {
            $promise.resolve(content.files);
        });
        return $promise.promise();
    }

    var getContentItemsForList = function (list) {
        var promises = [];
        var contentItems = [];
        var $promise = $.Deferred();
        var contentItem = null;
        var resource = null;
        $.each(list, function (index, file) {
            var $ajaxPromise = null;
            contentItem = new dataAccess.ContentItem();
            contentItem.position = index;
            contentItems.push(contentItem);
            $ajaxPromise = populateContentItemWithAjaxDataAsync(contentItem, file);
            promises.push($ajaxPromise);
        });
        $.when.apply(null, promises).done(function () {
            contentItems.sort(function (first, second) {
                first.position - second.position;
            });
            $promise.resolve(contentItems);
        });
        return $promise.promise();
    }

    var populateContentItemWithAjaxDataAsync = function (contentItem, contentDataName) {
        var $promise = $.Deferred();
        $.ajax({
            url: "./data/content/" + contentDataName
        }).done(function (item) {
            contentItem.title = item.title;
            contentItem.description = item.description;
            $.each(item.images, function (index, image) {
                contentItem.images.push("./data/content/image/" + image);
            });
            $.each(item.resources, function (index, link) {
                resource = new dataAccess.Resource();
                resource.title = link.title;
                resource.resource = link.resource;
                contentItem.resources.push(resource);
            });
            $.each(item.downloads, function (index, download) {
                resource = new dataAccess.Resource();
                resource.title = download.title;
                resource.resource = "./data/content/download/" + download.resource;
                contentItem.downloads.push(resource);
            });
            $promise.resolve();
        });
        return $promise.promise();
    }

    var item = function () {
        this.title = "";
        this.description = "";
        this.images = [];
        this.resources = [];
        this.downloads = [];
        this.position = 0;
    };

    var list = function () {
        this.files = [];
    };

    var resource = function () {
        this.title = "";
        this.resource = "";
    };

    return {
        getContentItems: getContent,
        ContentItem: item,
        Content: list,
        Resource: resource
    };
}();