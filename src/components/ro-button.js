(function () {

    xtag.register('ro-button', {
        lifecycle: {
            created: function () {
                this.addListeners();
            },
            inserted: function () {
            },
            removed: function () {
            }
        },
        events: {
            reveal: function () {
            },
            'click': function () {
                if (this.clickCallback) {
                    this.clickCallback();
                }
            }
        },
        accessors: {},
        clickCallback: function () {
        },
        methods: {
            addListeners: function () {
                var action = new Function(this.getAttribute('action'));
                this.addEventListener('click', action);
            },
            setClickCallback: function (callback) {
                this.clickCallback = callback;
            }
        }
    });

})();