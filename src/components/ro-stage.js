(function () {

    xtag.register('ro-stage', {
        lifecycle: {
            created: function () {

            },
            inserted: function () {
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
            showLoader: function () {
                this.setAttribute('loading', true);
            },
            hideLoader: function () {
                this.setAttribute('loading', false);
            }
        }
    });

})();