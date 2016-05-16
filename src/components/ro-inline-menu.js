(function () {
    xtag.register('ro-inline-menu', {
        lifecycle: {
            created: function () {
                this.hide();
            },
            inserted: function () {
                this.parseLayout();
            },
            removed: function () {

            },
            attributeChanged: function () {

            }
        },
        events: {
            'click:delegate(ro-inline-menu ro-item.hideInlineMenu)': function (e) {
                this.parentNode.hide();
                e.stopImmediatePropagation();
            },
            'click:delegate(ro-inline-menu ro-item)': function (e) {
                var action = this.getAttribute('action');

                if (action) {
                    action = new Function(action);
                    action.apply(action, [this]);
                }
                e.stopImmediatePropagation();
            }
        },
        methods: {
            hideAllMenus: function () {
                var getRoList = function (roInlineMenu) {
                    var node = roInlineMenu;
                    var nodeName = node.nodeName.toLowerCase();

                    while (nodeName !== 'ro-list') {
                        node = node.parentNode;
                        nodeName = node.nodeName.toLocaleLowerCase();
                        if (node === 'body') {
                            break;
                        }
                    }

                    return node;
                };
                var roList = getRoList(this);
                var roInlineMenus = roList.querySelectorAll('ro-inline-menu[state="showItems"]');

                for (var i = 0, j = roInlineMenus.length; i < j; i++) {
                    var roInlineMenu = roInlineMenus[i];
                    roInlineMenu.hide();
                }
            },
            show: function () {

                var viewSingletonMenu = this.getAttribute('viewSingletonMenu');

                if (viewSingletonMenu) {
                    this.hideAllMenus();
                }

                this.xtag.isVisible = true;
                this.setAttribute('state', 'showItems');
            },
            hide: function () {
                this.xtag.isVisible = false;
                this.setAttribute('state', 'hideItems');
            },
            toggle: function () {
                if (this.xtag.isVisible) {
                    this.hide();
                } else {
                    this.show();
                }
            },
            removeHideButton: function () {
                var hideButtonExists = this.querySelector('ro-item.hideInlineMenu');
                if (hideButtonExists) {
                    this.removeChild(hideButtonExists);
                }
            },
            parseLayout: function () {

                this.removeHideButton();
                var renderHideMenu = this.getAttribute('buttonHideMenu');
                var items = this.querySelectorAll('ro-item');
                var itemsLength = items.length;

                var renderHideButton = function () {

                    var hideButton = document.createElement('ro-item');
                    hideButton.setAttribute('icon', '');
                    hideButton.setAttribute('class', 'hideInlineMenu');

                    return hideButton;

                };

                for (var i = 0; i < itemsLength; i++) {

                    var item = items[i];
                    item.setAttribute('text', Ro.templateEngine(item.getAttribute('i18nKey')));

                }

                if (renderHideMenu) {
                    this.appendChild(renderHideButton());
                }

                this.parentNode.className = this.parentNode.className.replace('hasMenuInline').trim();
                this.parentNode.className += ' hasMenuInline';

            }
        }


    });
}());