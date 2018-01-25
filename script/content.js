$(function () {
    var itemsToDisplay = dataAccess.getContentItems();
    contentBuilder.setItemParent($(".content"));
    contentBuilder.setItemTemplate($("#template-content-item"));
    $.each(itemsToDisplay, function (index, value) {
        contentBuilder.addItemToPage(value);
    });
});

var contentBuilder = function () {
    var $template = null;
    var $parent = null;
    var isDeepCopy = true;

    var addItem = function (contentItem) {
        var clone = $template.prop("content").cloneNode(isDeepCopy);
        clone.querySelector("h3").innerText = contentItem.title;
        clone.querySelector("p").innerText = contentItem.description;
        $parent.append(clone);
    };

    var setTemplate = function ($itemTemplate) {
        $template = $itemTemplate;
    };

    var setParent = function ($itemParent) {
        $parent = $itemParent;
    };

    return {
        addItemToPage: addItem,
        setItemTemplate: setTemplate,
        setItemParent: setParent
    };
}();

var dataAccess = function () {
    var getContent = function () {
        var items = [];
        var item = new this.ContentItem();
        item.title = "test";
        item.description = "description goes here";
        item.images = ["testcontent.png"];
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