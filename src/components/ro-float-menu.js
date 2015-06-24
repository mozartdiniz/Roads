(function () {

    xtag.register('ro-float-menu', {
        lifecycle: {

            created: function () {
            },

            inserted: function () {
                this.create();
            },
            removed: function () {
            }
        },
        events: {
            reveal: function () {
            }
        },
        accessors: {},
        methods: {

            create: function () {

                this.xtag.itemsAreVisible = false;
                this.xtag.click = true;

                this.insert();
                this.parseList();

            },

            insert: function () {

                var existingOverlay = this.parentElement.querySelector('ro-overlay');

                if (!existingOverlay) {

                    var overlay = document.createElement('ro-overlay');
                    var hitArea = document.createElement('ro-hitarea');

                    hitArea.setAttribute('onclick', 'this.parentNode.toggleMenu ()');

                    this.parentElement.appendChild(overlay);
                    this.appendChild(hitArea);

                }

            },

            recreate: function () {

                var overlay = this.parentElement.querySelector('ro-overlay');
                var hitArea = this.querySelector('ro-hitarea');

                if (overlay) {
                    overlay.parentElement.removeChild(overlay);
                }

                if (hitArea) {
                    hitArea.parentElement.removeChild(hitArea);
                }

                this.create();
            },

            addItem: function (item) {
            },
            removeItem: function (item) {
            },

            toggleMenu: function () {
                if (this.xtag.click) {
                    this.xtag.click = false;
                    setTimeout(function () {
                        if (this.xtag.itemsAreVisible) {
                            this.hideItems();
                            this.xtag.click = true;
                        } else {
                            this.showItems();
                            this.xtag.click = true;
                        }
                    }.bind(this), 100);
                }

            },

            hideItems: function () {
                this.setAttribute('state', 'hideItems');
                this.nextElementSibling.setAttribute('state', 'hideItems');
                this.xtag.itemsAreVisible = false;
            },

            showItems: function () {
                this.setAttribute('state', 'showItems');
                this.nextElementSibling.setAttribute('state', 'showItems');
                this.xtag.itemsAreVisible = true;
            },

            parseList: function () {
                var items = this.querySelectorAll('ro-item');

                for (var i = 0; i < items.length; i++) {

                    var itemActionFunction = new Function(items[i].getAttribute('action'));
                    var action = (function (scope, func) {
                        return function () {
                            func();
                            scope.hideItems();
                        };
                    }(this, itemActionFunction));

                    items[i].addEventListener('click', action);
                    items[i].setAttribute('text', Ro.templateEngine(items[i].getAttribute('i18nKey')));
                }
            }
        }
    });

})();