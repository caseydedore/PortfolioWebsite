$(function () {
    dataAccess.getContentItems().pipe(function (items) {
        contentBuilder.setItemParent($(".content"));
        contentBuilder.setItemTemplate($("#template-content-item"));
        contentBuilder.setItemImageTemplate($("#template-content-item-image"));
        $.each(items, function (index, item) {
            contentBuilder.addItemToPage(item);
        });
    });
});

var contentBuilder = function () {
    var $template = null;
    var $templateImage = null;
    var $parent = null;
    var isDeepCopy = true;

    var addItem = function (contentItem) {
        var clone = $template.prop("content").cloneNode(isDeepCopy);
        clone.querySelector("h3").innerText = contentItem.title;
        clone.querySelector("p").innerText = contentItem.description;
        if (contentItem.images.length > 0) {
            var imageClone = null;
            $.each(contentItem.images, function(index, value){
                imageClone = $templateImage.prop("content").cloneNode(isDeepCopy);
                imageClone.querySelector("img").setAttribute("src", value);
                clone.querySelector(".container-content-image").append(imageClone);
            });
        }
        $parent.append(clone);
    };

    var setTemplate = function ($itemTemplate) {
        $template = $itemTemplate;
    };

    var setImageTemplate = function ($imageTemplate) {
        $templateImage = $imageTemplate;
    }

    var setParent = function ($itemParent) {
        $parent = $itemParent;
    };

    return {
        addItemToPage: addItem,
        setItemTemplate: setTemplate,
        setItemImageTemplate: setImageTemplate,
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
        $.each(list, function (index, file) {
            var $ajaxPromise = $.Deferred();
            promises.push($ajaxPromise.promise());
            $.ajax({
                url: "./data/content/" + file
            }).done(function (item) {
                contentItem = new dataAccess.ContentItem();
                contentItem.title = item.title;
                contentItem.description = item.description;
                $.each(item.images, function (index, image) {
                    contentItem.images.push("./data/content/image/" + image);
                });
                contentItems.push(contentItem);
                $ajaxPromise.resolve();
            });
        });
        $.when.apply(null, promises).done(function(){
            $promise.resolve(contentItems);
        });
        return $promise.promise();
    }

    var item = function () {
        this.title = "";
        this.description = "";
        this.images = [];
    };

    var list = function () {
        this.files = [];
    };
    
    return {
        getContentItems: getContent,
        ContentItem: item,
        Content: list
    };
}();