Ro.UIComponents = {};

Ro.UIComponents.ButtonBar = function (id) {

    this.id       = id;
    this.el       = null;
    this.targetEl = null;

    this.addButton = function (button) {

        this.el.appendChild(button.el);

    };

    this.addToScreen = function (screen, component) {

        this.targetEl = document.querySelector(
            "div[screenname='" + screen.name + "'] " + component
        );

        this.targetEl.appendChild(this.el);
    };

    // create basic structure
    this.basicStructure = function () {

        var div = document.createElement("div");
        div.className = "button_bar";

        this.el = div;

    };

    this.basicStructure();

};

Ro.UIComponents.Button = function (id) {

    this.id     = id;
    this.text   = "";
    this.icon   = "";
    this.action = null;
    this.el     = null;

    this.setText = function (text) {

        var textHTML = document.createElement("span");

        this.text = text;

        textHTML.innerHTML = text;

        this.el.appendChild(textHTML);
    };

    this.setAction = function (actionFunction) {

        this.action = actionFunction;

        if(Ro.environment.isTouchDevice) {
            if(Ro.environment.isOldAndroid) {
                this.el.addEventListener('mousedown', this.action);
            } else {
                this.el.addEventListener('touchstart', this.action);
            }
        } else {
            this.el.addEventListener('click', this.action);
        }

    };

    this.setIcon = function (icon) {

        var childs = this.el.childNodes;
        var bkDiv  = document.createElement("div");

        if (childs.length > 0) {
            this.el.removeChild(this.el.childNodes[0]);
        }

        bkDiv.className = "btnIcon";

        bkDiv.style.width = "100%";
        bkDiv.style.height = "100%";
        bkDiv.style.background = icon + " no-repeat center center";
        bkDiv.style.backgroundSize = "45px";
        this.el.appendChild(bkDiv);

    };

    this.basicStructure = function () {

        var div = document.createElement("div");
        div.className = "button";

        this.el = div;

    };

    this.setFlexWidth = function (width) {

        this.el.style.webkitBoxFlex = width;
        this.el.style.MozBoxFlex = width;

    };

    this.basicStructure();

    return this;

};

Ro.UIComponents.ListView = function () {

    this.dataProvider   = null;
    this.listItemRender = Ro.UIComponents.ListViewDefaultItem;
    this.listItemAction = null;
    this.dataFilter     = null;
    this.el             = null;

    this.el = document.createElement('div');
    this.el.className = "table_list";
    this.el.tabindex  = -1;

    this.createList = function () {

        var data;

        var model = new this.dataProvider();

        if (this.dataFilter === null) {
          data = Ro.Store.selectAll(model.name);
        } else {
          data = this.dataFilter(model.name);
        }

        var render;

        for(var item in data) {
            if (typeof data[item] !== 'function') {

                render = new this.listItemRender(
                    data[item], this.listItemAction
                ).render();

                this.el.appendChild(render);

            }
        }

    };

    this.addToScreen = function (screen, component) {

        this.createList();

        this.targetEl = document.querySelector(
            "div[screenname='" + screen.name + "'] " + component
        );

        this.targetEl.appendChild(this.el);

    };


};

Ro.UIComponents.ListViewDefaultItem = function (data, itemAction) {

    this.id = data.select('id');

    var item = document.createElement('div');
    var content = document.createTextNode(data.select('name'));

    item.appendChild(content);

    item.className = 'listViewItem';

    if (typeof itemAction !== 'undefined') {

        item.addEventListener('click', itemAction);
    }

    this.render = function () {
        return item;
    };

};

Ro.UIComponents.ToastNotification = function (message) {

    this.message = document.createTextNode(message);
    this.el = document.createElement('div');
    this.el.className = 'toastNotification';
    this.el.appendChild(this.message);

    document.body.appendChild(this.el);

    setTimeout(function(){

        var toast = document.querySelector(".toastNotification");

        document.body.removeChild(toast);

    }, 1800);

};

Ro.UIComponents.Menu = function (items, screenName) {

    var screenFooter = document.querySelector("div.screen[screenname='" + screenName + "'] footer");
    var menu = document.querySelector("div.screen[screenname='" + screenName + "'] footer .roadMenu");

    if (menu !== null) {

        Ro.UIComponents.MenuRemove(screenName);

    } else {

        this.el = document.createElement('div');
        this.el.className = 'roadMenu';

        var baseUl = document.createElement('ul');

        if(items.length > 0) {
            baseUl.appendChild(
                Ro.UIComponents.MenuGenerateItems(items, screenName)
            );
        }

        this.el.appendChild(baseUl);

        screenFooter.appendChild(this.el);

    }

};

Ro.UIComponents.MenuGenerateItems = function (items, screenName) {

    var li = null;
    var fragment = document.createDocumentFragment();
    var defaultRemoveMenu = (function (sName) {
        return function () {
            Ro.UIComponents.MenuRemove(sName);
        }
    })(screenName);

    for (var i = 0; i < items.length; i++) {

        li = document.createElement('li');
        li.id = 'RoadMenuItem-' + items[i].id;
        li.innerHTML = items[i].text;

        if (typeof items[i].action !== "undefined") {
            if(Ro.environment.isTouchDevice) {
                if(Ro.environment.isOldAndroid) {
                    li.addEventListener("mousedown", items[i].action);
                } else {
                    li.addEventListener("touchstart", items[i].action);
                }
            } else {
                li.addEventListener("click", items[i].action);
            }
        }

        if(Ro.environment.isTouchDevice) {
            if(Ro.environment.isOldAndroid) {
                li.addEventListener("mousedown", defaultRemoveMenu);
            } else {
                li.addEventListener("touchstart", defaultRemoveMenu);
            }
        } else {
            li.addEventListener("click", defaultRemoveMenu);
        }

        fragment.appendChild(li);
    }

    return fragment;

};

Ro.UIComponents.MenuRemove = function (screenName) {

    var screenFooter = document.querySelector("div.screen[screenname='" + screenName + "'] footer");
    var menu         = document.querySelector("div.screen[screenname='" + screenName + "'] footer .roadMenu");

    screenFooter.removeChild(menu);

};

Ro.UIComponents.ScrenLayout = {};

Ro.UIComponents.ScrenLayout.GroupedList = function (layout) {

    this.el = document.createElement("div");
    this.el.className = "ScrenLayout-GroupedList";

    this.lineItemRender = function (data) {

        var lineItem         = document.createElement("div");
        lineItem.className   = "ScrenLayout-GroupedList-lineItemRender";

        if (typeof data.action !== "undefined") {

            lineItem.addEventListener("click", data.action);

        }

        var contentElement       = document.createElement("div");

        contentElement.className = "ScrenLayout-contentElement";
        contentElement.innerHTML = data.content;

        if (typeof data.label !== "undefined") {

            var contentLabelText     = document.createTextNode(data.label);
            var contentLabel         = document.createElement("div");
            contentLabel.className   = "ScrenLayout-contentHeader";

            contentLabel.appendChild(contentLabelText);

            lineItem.appendChild(contentLabel);

        } else {
            contentElement.style.width = "100%";
        }

        lineItem.appendChild(contentElement);

        return lineItem;

    };

    this.headerItemRender = function (data) {

        var headerItem       = document.createElement("div");
        headerItem.className = "ScrenLayout-GroupedList-headerItemRender";

        if (typeof data.action !== "undefined") {
            headerItem.addEventListener("click", data.action);
        }

        var headerTag     = document.createElement("h1");

        headerTag.innerHTML = data.title;

        if (typeof data.icon !== "undefined") {

            headerItem.appendChild(data.icon);
        }

        headerItem.appendChild(headerTag);

        return headerItem;

    };

    if (typeof layout !== "undefined") {

        for (var i = 0; i < layout.length; i++) {

            this.el.appendChild(this.headerItemRender(layout[i].header));

            if (layout[i].items.length > 0) {

                for (var j = 0; j < layout[i].items.length; j++) {
                    this.el.appendChild(this.lineItemRender(layout[i].items[j]));
                }

            }

        }

    }

    return this.el;

};

Ro.UIComponents.Icon = function (conf) {

    this.el = document.createElement('div');
    this.el.className = "UIComponents-Icon";
    this.el.style.backgroundImage = "url(" + conf.url + ")";

    if (typeof conf.action !== "undefined") {

        if(Ro.environment.isTouchDevice) {
            if(Ro.environment.isOldAndroid) {
                this.el.addEventListener("mousedown", conf.action);
            } else {
                this.el.addEventListener("touchstart", conf.action);
            }
        } else {
            this.el.addEventListener("click", conf.action);
        }

    }

    return this.el;


};

Ro.UIComponents.Map = function (conf) {

};

Ro.UIComponents.SearchBar = function (placeHolder) {

    this.el = document.createElement('div');
    this.input = document.createElement('input');

    this.el.className = 'UIComponents-SearchBar';
    this.input.type = 'text';

    if (typeof placeHolder === 'undefined') {
        placeHolder = 'Search...';
    }

    this.input.placeholder = placeHolder;

    this.el.appendChild(this.input);

    return this.el;

};