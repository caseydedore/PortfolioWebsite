$(function () {
    var itemsToDisplay = dataAccess.getContentItems();
    contentBuilder.setItemParent($(".content"));
    contentBuilder.setItemTemplate($("#template-content-item"));
    contentBuilder.setItemImageTemplate($("#template-content-item-image"));
    $.each(itemsToDisplay, function (index, value) {
        contentBuilder.addItemToPage(value);
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
        var items = [];
        var item = new this.ContentItem();
        item.title = "test";
        item.description = "description goes here";
        item.images = ["data/content/image/checkerboard.png", "data/content/image/checkerboard.png", "data/content/image/checkerboard.png"];
        items.push(item);
        return items;
    };

    var jsonToItem = function () {

    };

    var jsonToList = function () {

    };

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