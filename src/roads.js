var Ro = {

    init: function (callback) {

        Ro.Session = Ro.Session = {};
        var writeImports = function() {

            var loader = document.querySelector ('ro-loader');
            if (loader) {
                loader.show();
            }

            var imports = document.querySelectorAll ('link[rel="import"]');
            var RoApp   = document.querySelector ('ro-app ro-scroll');


            for (var i = 0; i < imports.length; i++) {
                var view  = imports[i].import.body.querySelector ('ro-view');
                var clone = view.cloneNode(true);

                RoApp.appendChild (clone);
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

            document.addEventListener ("backbutton", function () {
                Ro.Globals.backButtonFunction ();
            }, false);

        }, false);

    },

    styleGenerator : function (styles) {

        var style = '';

        for (key in styles) {
            style += key + ': ' + styles[key] + '; ';
        }

        return style;

    },

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

    }
};