/**
 * Created by adaltojunior on 4/1/15.
 */
(function () {
    xtag.register('ro-inline-menu',{
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
            show: function () {
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
                var items = this.querySelectorAll('ro-item');
                var itemsLength = items.length;
                var magicNumber = 20;
                var widthItem = parseInt((this.clientWidth - magicNumber) / itemsLength) + 'px';
                var renderHideButton = function () {

                    var hideButton = document.createElement('ro-item');
                    hideButton.setAttribute('icon', '');
                    hideButton.setAttribute('class', 'hideInlineMenu');
                    hideButton.style.width = '20px';

                    return hideButton;

                };

                for (var i = 0; i < itemsLength; i++) {

                    var item = items[i];
                    item.style.width = widthItem;
                    item.setAttribute('text', Ro.templateEngine(item.getAttribute('i18nKey')));

                }

                this.appendChild(renderHideButton());

            }
        }


    });
}());
