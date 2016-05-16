(function () {

    xtag.register('ro-view', {
        lifecycle: {
            created: function () {

                if (Ro.Environment.platform.isIOS && !this.className.match(/isIOS/)) {
                    this.className += "isIOS ";
                } else if (Ro.Environment.platform.isWPhone && !this.className.match(/isWPhone/)) {
                    this.className += "isWPhone ";
                }

            },
            inserted: function () {
            },
            removed: function () {
            }
        },
        events: {},
        accessors: {},
        methods: {
            show: function (fromId) {
                if (this.xtag.showFunction) {
                    this.xtag.showFunction(fromId);
                }
            },
            setShowFunction: function (callback) {
                this.xtag.showFunction = callback;
            }
        }
    });

})();