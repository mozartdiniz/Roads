var Ro = (function () {

  var Roads = {

    init: function (callback) {

        Ro.Session = Ro.Session = {};
        var writeImports = function(e) {

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
            };

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

        }

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
        var filter, key, filterParameter, hasFilter = 0, keyToFind = '';

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

      Http: function () {

        // set defaults
        this.url         = '';
        this.method      = 'get';
        this.async       = true;
        this.data        = null;
        this.contentType = 'application/json';

        //callback for success
        this.success     = null;
        this.timeout     = 30000;
        this.ontimeout   = null;
        this.roSuccess   = null;

        //callback for error
        this.error       = null;

        // do request
        this.send = function() {

            var request = new XMLHttpRequest();

            request.open(this.method, this.url, this.async);
            request.setRequestHeader('Content-Type', this.contentType);
            request.setRequestHeader("Cache-Control", "no-cache");

            request.withCredentials = true;

            //closure
            request.onreadystatechange = this.sendCallback.bind(this);

            request.ontimeout = (function (scope) {
                return function () {
                    if (scope.ontimeout) {
                        scope.ontimeout (this, scope);
                    }
                };
            })(this);

            request.send(this.data);

            this.dropConnection = setTimeout((function(request){
                return function () {
                    request.abort();
                }
            })(request), this.timeout);

        };

        this.sendCallback = function (e) {

            var xhr = e.target;
            var parsedResponse = '';

            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201 || xhr.status === 204)) {

                clearInterval (this.dropConnection);

                if (this.success) {

                    if (xhr.responseText && this.contentType === 'application/json') {
                      parsedResponse = JSON.parse (xhr.responseText);
                    } else {
                      parsedResponse = xhr.responseText;
                    }

                    this.success (parsedResponse, xhr);
                }

            } else if (xhr.readyState === 4) {

                if (this.error) {
                    this.error (xhr);
                }

            }

        };

      },

      dateToIEandSafari: function (date) {

        return (date.substring(0, date.lastIndexOf("+") + 4) + 'Z').replace('+', '.');;

      }
  }

  Roads.Controller = function (viewID, methods) {

    var Controller = function () {

        this.view = document.querySelector ('[ro-controller="' + viewID + '"]');

        this.init ();

        if (this.show) {
            this.view.setShowFunction (this.show.bind (this));
        }

    }

    if (methods) {
      for (key in methods) {
        Controller.prototype[key] = methods[key];
      }
    }

    return Controller;

  }

  Roads.Environment = {
    isTouchDevice: !!('ontouchstart' in window),
      platform: {
        androidVersion: (function (){
            var isAndroid = navigator.userAgent.match(/Android([^;]*)/);
            if (isAndroid && isAndroid.length > 1) {
                return parseInt(isAndroid[1], 10);
            }
            return false;
        }()),
        isAndroid: navigator.userAgent.match('Android') === null ? false : true,
        isIPhone: navigator.userAgent.match('iPhone') === null ? false : true,
        isIPad: navigator.userAgent.match('iPad') === null ? false : true,
        isWPhone: navigator.userAgent.match(/Trident/) ? true : false,
        isIOS: (navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPad')) ? true : false,
        isFxOS: (navigator.userAgent.match(/Mozilla\/5.0 \(Mobile;/) || navigator.userAgent.match('iPad')) ? true : false
      }
  }

  Roads.Globals = {
    backButtonFunction: function () {
        alert('No back function defined');
    }
  }

  Roads.Events = {
    click: function () {
        return (Roads.Environment.isTouchDevice) ? 'touchstart' : 'click'
    }
  }

  Roads.Filter = {
    filters: {

        date: function (dateValue, key, dateFormat) {

            if (!dateValue) {
              throw 'Roads.Filter.date: dateValue is mandatory';
            }

            var format = dateFormat || Ro.i18n.defaults.date;
            var date   = new Date (dateValue);
            var year   = date.getFullYear();
            var day    = date.getUTCDate();
            var month  = date.getMonth()+1;

            format = format.replace(/yyyy/g, year);
            format = format.replace(/yy/g, String(year).substr(2,2));
            format = format.replace(/MM/g, (month < 10) ? '0' + month : month);
            format = format.replace(/M/g, month);
            format = format.replace(/dd/g, (day < 10) ? '0' + day : day);
            format = format.replace(/d/g, day);

            return format;

        },

        time: function (timeValue, key, timeFormat) {

            if (!timeValue) {
              throw 'Roads.Filter.date: timeValue is mandatory';
            }

            if (Ro.Environment.platform.isWPhone || Ro.Environment.platform.isIOS) {
                timeValue = Roads.dateToIEandSafari (timeValue);
            }

            var format  = timeFormat || Ro.i18n.defaults.time;
            var time    = new Date (timeValue);
            var hours24 = time.getHours();
            var hours12 = (hours24 + 11) % 12 + 1;
            var minutes = time.getMinutes();
            var seconds = time.getSeconds();
            var a       = (hours24 >= 12) ? 'pm' : 'am'

            format = format.replace(/HH/g, (hours24 < 10) ? "0" + hours24 : hours24);
            format = format.replace(/H/g, hours24);
            format = format.replace(/hh/g, (hours12 < 10) ? "0" + hours12 : hours12);
            format = format.replace(/h/g, hours12);
            format = format.replace(/mm/g, (minutes < 10) ? "0" + minutes : minutes);
            format = format.replace(/ss/g, seconds);
            format = format.replace(/a/g, a);

            return format;
        },

        float: function (value) {
            if (value) {
                return (value+'').replace('.', Ro.i18n.defaults.decimalSymbol) || '';
            }

            return '0';
        },

        i18n: function (i18nKey) {
            return Ro.i18n.translations[i18nKey] || i18nKey;
        }
    },
    register: function (filterName, filterImplementation) {

        if (!filterName) {
          throw 'Roads.Filter.register: filterName is mandatory';
        }

        this.filters[filterName] = filterImplementation;
    }
  }

  Roads.i18n = {
    defaults: {
        currency: "US$",
        date: "MM/dd/yyyy",
        decimalSymbol: ",",
        digitalGrouping: ".",
        language: "en",
        time: "HH:mm",
        systemOfMeasurement: "METRIC" // METRIC | IMPERIAL
    },
    translations: {},
    translateView: function (view) {

        var elements = view.querySelectorAll('[i18n]');
        for (var i = elements.length - 1; i >= 0; i--) {
            this.translateElement (elements[i]);
        };
    },
    translateElement: function (el) {
        var i18n = el.getAttribute('i18n');

        switch (i18n) {
            case '':
                el.innerHTML = Ro.templateEngine(el.getAttribute('i18nKey'));
                break;
            default:
                el.setAttribute(i18n, Ro.templateEngine(el.getAttribute('i18nKey')));
                break;
        }

    },

    getTranslationByKey : function(key){

        var value = Ro.i18n.translations[key];

        if (value){
            return value;
        }

        return key;
    },

    getTranslationByKeyOrAlternative : function (resourceId, alternativeValue){

        var message = Ro.i18n.getTranslationByKey (resourceId);

        if (alternativeValue && message === resourceId) {
            return alternativeValue;
        }

        return message;
    }

  }

  return Roads;

}());