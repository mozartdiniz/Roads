var Ro = (function () {

  var Roads = {

    init: function (callback) {

        var writeImports = function(e) {

            var imports = document.querySelectorAll ('link[rel="import"]');
            var RoApp   = document.querySelector ('ro-app');

            for (var i = 0; i < imports.length; i++) {
                var view  = imports[i].import.body.querySelector ('ro-view');
                var clone = view.cloneNode(true);

                RoApp.appendChild (clone);
            };

            setTimeout (callback, 100);

        }

        window.addEventListener('HTMLImportsLoaded', writeImports.bind (this));         

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

        while(match = re.exec(tpl)) {
            tpl = tpl.replace(match[0], this.findByKey (data, match[1]));
        }

        return tpl;

    },

    findByKey : function (obj, key) {

        var j, key = key || '', obj = obj || {}, keys = key.split("."), 
            sObj = [], ssObj = [], isSelector = !!(keys.length > 0);

        var findKey = function (obj, key) {
            var k;
            for (k in obj) {
                if (k === key) {
                    sObj.push(obj[k]);
                } else if (typeof obj[k] == 'object') {
                    findKey(obj[k], key);
                }
            }
        };

        if (isSelector) {
            var nKey = keys.shift();
            findKey(obj, nKey);

            while (keys.length > 0) {
                nKey = keys.shift();

                if (sObj.length > 0) {
                    ssObj = sObj.slice(0), sObj = [];
                    for (j in ssObj) {
                        findKey(ssObj[j], nKey);
                    }
                }
            }
        } else {
            findKey(obj, key);
        }

        return (sObj.length === 1) ? sObj.pop() : sObj;

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

            } else {

                if (this.error) {
                    this.error (xhr);
                }

            }

        };

      }
  }

  Roads.Controller = function (viewID, methods) {

    var Controller = function () {

        this.view = document.querySelector ('[ro-controller="' + viewID + '"]');    

        this.init ();

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
        isIOS: (navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPad')) ? true : false
      }
  }

  return Roads;

}());