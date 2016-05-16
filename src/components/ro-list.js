(function () {

    xtag.register('ro-list', {
        lifecycle: {
            created: function () {

                var noDataItem = this.querySelector('ro-nodata-item');
                var itemTemplate = this.querySelector('ro-item');

                this.xtag.item = this.querySelector('ro-item');
                this.buttons = {};

                if (itemTemplate) {
                    this.xtag.itemTemplate = itemTemplate.innerHTML;
                }

                if (noDataItem) {
                    this.xtag.noDataItemTemplate = noDataItem.innerHTML;
                }

                //Add default buttons
                this.addButton({
                    name: 'delete',
                    action: function () {
                        var button = document.createElement('ro-button');
                        button.innerHTML = 'DELETE';
                        return button;
                    }
                });

                this.addButton({
                    name: 'share',
                    action: function () {
                        var button = document.createElement('ro-button');
                        button.innerHTML = 'SHARE';
                        return button;
                    }
                });

                this.xtag.callbacks = {
                    didSelectedItem: function (e) {
                    },
                    didUnSelectedItem: function (e) {
                    },
                    didSwipeItem: function (e) {
                    }
                };

                this.renderes = {
                    listItem: this.listItem
                };

                noDataItem = null;

            },
            inserted: function () {

                this.activeButtons = this.getButtonsInfo();

                var nextElement = this.parentElement.nextElementSibling;

                if (nextElement && nextElement.tagName === "RO-FOOTER") {

                    this.style.cssText = Ro.styleGenerator({
                        'height': '-webkit-calc(100% - 100px)',
                        'height': '-moz-calc(100% - 100px)',
                        'height': 'calc(100% - 100px)'
                    });
                }

                nextElement = null;

            },
            removed: function () {
            }
        },
        events: {
            'click:delegate(ro-item-content)': function (e) {

                var action = this.parentNode.getAttribute('action');

                if (action) {
                    new Function(action)(this);
                }

                e.stopImmediatePropagation();

                action = null;
            }
        },
        methods: {
            setData: function (data) {
                this.xtag.data = data;
                this.parseList();
            },
            addData: function (newItem) {
                this.xtag.data.push (newItem);
            },
            removeDataItem: function (index) {
                this.xtag.data.splice(index,1);
            },
            getData: function () {
                return this.xtag.data;
            },
            setAction: function (action) {
                this.action = action;
            },
            parseList: function () {

                var data = this.xtag.data;
                var dataLength = data.length;

                xtag.innerHTML (this, '');

                this.xtag.itemAction = this.action || this.xtag.item.getAttribute('action');

                if (dataLength) {
                    data.forEach(function (item, index) {
                        this.renderes['listItem'].apply (this, [item, index]);
                    }.bind(this));
                } else if (this.xtag.noDataItemTemplate)  {

                    var element = document.createElement('ro-nodata-item');
                    element.innerHTML = Ro.templateEngine(this.xtag.noDataItemTemplate, []);

                    this.appendChild(element);
                }

                data = null;
                dataLength = null;

            },

            getButtonsInfo: function () {

                var attribute = this.getAttribute('actionButtons');
                var buttons = false;

                if (attribute) {
                    buttons = attribute.split(',').map(function (item) {
                        return this.buttons [item.trim()];
                    }.bind(this));
                }

                attribute = null;

                return buttons;

            },

            addButton: function (button) {
                this.buttons[button.name] = button.action;
            },

            checkBoxAction: function (e) {

                if (e.target.parentElement.querySelector('input[type="checkbox"]').checked) {
                    e.target.parentElement.parentElement.setAttribute('checked', true);
                    this.xtag.callbacks.didSelectedItem(e);
                } else {
                    e.target.parentElement.parentElement.removeAttribute('checked');
                    this.xtag.callbacks.didUnSelectedItem(e);
                }
            },

            renderSelectableButton: function (data) {

                var cbox = document.createElement('ro-checkbox');
                cbox.appendChild(this.renderes.selectableButton(data));
                cbox.addEventListener('click', this.checkBoxAction.bind(this));

                return cbox;
            },

            selectedItems: function () {
                return this.querySelectorAll('ro-item[checked="true"]');
            },

            selectableButton: function () {
                return document.createTextNode('');
            },
            listItem: function (data, i) {

                var roItem    = document.createElement('ro-item');
                var roContent = document.createElement('ro-item-content');

                data.itemIndex = i;

                roItem.setAttribute('action', Ro.templateEngine(this.xtag.itemAction, data));
                roItem.setAttribute('itemIndex', i);

                roContent.innerHTML = Ro.templateEngine(this.xtag.itemTemplate, data);

                if (this.getAttribute('swipeable')) {
                    roItem.appendChild(this.renderSwipeMenu());
                    this.addSwipeMenuActions(roItem, this);
                }

                if (this.activeButtons) {
                    for (var j = 0; j < this.activeButtons.length; j++) {
                        roItem.appendChild(this.activeButtons[j]());
                    }
                }

                if (this.getAttribute('selectable')) {
                    roItem.appendChild(this.renderSelectableButton(data));
                }

                roItem.appendChild(roContent);

                this.appendChild(roItem);

                roItem = null;
                roContent = null;
            },

            setCallback: function (callback) {
                this.xtag.callbacks[callback.name] = callback.action;
            },

            setRenderer: function (renderer) {
                this.renderes[renderer.name] = renderer.action;
            },

            renderSwipeMenu: function () {

                var roItemSwipemenu = document.createElement('ro-item-swipemenu');
                roItemSwipemenu.setAttribute('swipeMenuLabel', Ro.templateEngine(this.getAttribute('i18nKey')));
                var swipeFlow = this.getAttribute('swipeflow');

                if (swipeFlow) {
                    roItemSwipemenu.setAttribute('pan', swipeFlow);
                }

                return roItemSwipemenu;
            },

            addSwipeMenuActions: function (item, scope) {

                var hammertime = new Hammer(item);
                var panFunction = function (e) {
                    var menu = item.firstElementChild;
                    var value = e.deltaX;
                    var positiveValue = value;

                    if (e.type === "panleft") {
                        positiveValue = value * -1;
                    }

                    if (menu && positiveValue > (window.innerWidth / 2)) {
                        menu.className = 'goMenu';
                    } else  if (menu && positiveValue > 50) {
                        menu.className = '';
                        menu.style.webkitTransform = 'translateX(' + value + 'px)';
                        menu.style.transform = 'translateX(' + value + 'px)';
                    }
                };
                var panEndFunction = function (e) {

                    var menu = item.firstElementChild;
                    var value = e.deltaX;
                    var positiveValue = value;

                    if (value < 0) {
                        positiveValue = value * -1;
                    }

                    if (menu && positiveValue < (window.innerWidth / 2)) {
                        menu.className = 'backMenu';
                    } else if (menu.className.indexOf('goMenu') !== -1) {

                        scope.xtag.callbacks.didSwipeItem(item);

                        setTimeout((function (item) {
                            item.firstElementChild.className = 'backMenu';
                        }(item)), 1000);
                    }

                };
                var swipeFlow = this.getAttribute('swipeflow');

                if (!swipeFlow) {
                    swipeFlow = 'panright';
                }

                hammertime.on(swipeFlow, panFunction);
                hammertime.on('panend', panEndFunction);

            },

            clear: function () {
                Ro.DOM.purge (this);
                Ro.DOM.vanish (this);
                this.innerHTML = '';
            }

        }
    });

})();