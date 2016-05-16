var Ro = {

    /**
     * This is the very first function that Roads will run
     * @param {function} callback What will run after everything is finished
     *
     */
    controllers: {},

    init: function (callback) {

        Ro.Session = Ro.Session = {};
        Ro.Environment.platform.isWindowsPhoneUniversalApp = (window.WinJS && window.WinJS.Application) ? true : false;

        var writeImports = function() {

            // Show loader before load files
            var loader = document.querySelector ('ro-loader');

            if (loader) {
                loader.show();
            }

            /**
             * Search all link[rel="import"] tags, gets their contents and adds
             * inside of ro-app tag. Is how all views are added to project
             */

            var imports = document.querySelectorAll ('link[rel="import"]');
            var RoApp   = document.querySelector ('ro-app ro-scroll');

            Ro.views = {};

            for (var i = 0; i < imports.length; i++) {

                var view  = imports[i].import.body.querySelector ('ro-view');
                var clone = view.cloneNode(true);

                Ro.views[view.getAttribute('id')] = {
                    dom: clone,
                    controller: {}
                };

                if (view.getAttribute('mainpage') !== null) {
                    RoApp.appendChild (clone);

                    for (key in Ro.controllers) {

                        if (key === view.getAttribute('id')) {
                            Ro.controllers[key].view = view;
                        }
                    }

                    loader.hide();

                }

            }

            var stageToScroll = document.querySelector('ro-stage[scroll]');

            if (stageToScroll) {
                Ro.Globals.roAppScroll = new IScroll(stageToScroll, {
                    probeType:  3,
                    mouseWheel: true,
                    bounce: true,
                    keyBindings: true,
                    invertWheelDirection: false,
                    momentum: true,
                    fadeScrollbars: false,
                    scrollbars: false,
                    interactiveScrollbars: false,
                    resizeScrollbars: false,
                    shrinkScrollbars: false,
                    click: false,
                    preventDefaultException: { tagName:/.*/ }
                });
            }

            // This callback is delayed because look like that Trident, WP8 HTML engine, needs some time
            // to process all HTML, I'm not happy, but I still don't realize a better solution

            setTimeout (callback, 100);

        };

        window.addEventListener ('HTMLImportsLoaded', writeImports.bind (this));

        document.addEventListener ("deviceready", function (){

            var RoApp = document.querySelector ('ro-app');

            RoApp.style.webkitTransition = '10ms';
            RoApp.style.height = window.innerHeight + 'px';

            document.addEventListener ("showkeyboard", function () {

                setTimeout (function (){

                    var activeElementTop = document.activeElement.getBoundingClientRect().top + 50;
                    var innerHeight = window.innerHeight;

                    if (activeElementTop > innerHeight) {
                        var x = document.querySelector ('ro-view#' + RoApp.activeView);
                        x.style.webkitTransition = '1s';
                        x.style.webkitTransform = 'translateY(-200px)';
                    }

                },  100);

            }, false);

            document.addEventListener ("hidekeyboard", function () {

                var x = document.querySelector ('ro-view#' + RoApp.activeView);
                x.style.webkitTransition = '10ms';
                x.style.webkitTransform = 'translateY(0)';

            }, false);

            if (Ro.Environment.platform.isWindowsPhoneUniversalApp) {
                Windows.Phone.UI.Input.HardwareButtons.onbackpressed = function (e) {
                    e.handled = true;
                    Ro.Globals.backButtonFunction(e);
                };
            } else {
                document.addEventListener ("backbutton", function () {
                    Ro.Globals.backButtonFunction ();
                }, false);
            }
        }, false);

    },

    /**
     * Style Generator will create a css Text and you can use it to change all styles at the same time.
     * @param {object} styles The object that represents all styles that will be generated
     *
     *  {
     *      color: 'red',
     *      'background-color': '#ffeedd'
     *  }
     *
     */

    styleGenerator : function (styles) {

        var style = '';

        for (key in styles) {
            style += key + ': ' + styles[key] + '; ';
        }

        return style;

    },

    /**
     * Replace all content with a pattern {{}} by a value found in data parameter
     * @param {string} tpl The string that will have values replaced
     * @param {object} data Object with all data
     *
     *  "<div>SSN: {{user.info.ssn}}</div>"
     *
     *  {
	 *     user: {
	 *        info: {
	 *           ssn: 333-444-555
	 *        }
	 *     }
	 *  }
     *
     *
     */

    templateEngine : function (tpl, data) {

        var re = /{{([^}}]+)?}}/g;
        var filter, key, filterParameter, hasFilter = 0;

        if (tpl) {
            while(match = tpl.match(re)) {

                hasFilter = match[0].indexOf('|');

                if (hasFilter > 0) {
                    filter = match[0].split('|')[1].replace('}}','').trim();
                    if (filter.indexOf(':') > 0) {
                        filterParameter = filter.split(':')[1];
                        filter = filter.split(':')[0];
                    }
                    key = match[0].split('|')[0].replace('{{','').trim();
                } else {
                    key = match[0].replace('{{', '').replace('}}','').trim();
                }

                if (hasFilter > 0 && Ro.Filter.filters[filter]) {
                    if (data && filter !== 'i18n') {

                        // (data, key, filterParameter)
                        tpl = tpl.replace(match[0], Ro.Filter.filters[filter](this.findByKey (data, key), key, filterParameter));

                    } else {
                        tpl = tpl.replace(match[0], Ro.Filter.filters[filter](key, filterParameter));
                    }
                } else {
                    tpl = tpl.replace(match[0], this.findByKey (data, key));
                }
            }
        }

        return tpl;

    },

    /**
     * Search a specific value in a object by full path description
     * @param {object} data Object with all data
     * @param {string} key A full path representing where the value is 'data.users.data.ssn'
     *
     */

    findByKey : function (data, key) {

        var value  = data;
        var keys   = key.split('.');

        for(var x = 0, size = keys.length; x < size; x++){
            if (value) {
                value = value[keys[x]];
            }
        }

        return value || "";

    },


    dateToIEandSafari: function (date) {

        return (date.substring(0, date.lastIndexOf("+") + 4) + 'Z').replace('+', '.');

    },

    extend: function (a, b) {

        for (k in a) {
            if (!b[k]) {
                b[k] = a[k];
            }
        }

        return b;

    }
};