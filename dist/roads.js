/*! roads - v0.0.1 - 2015-01-11 */var Ro = (function () {

  var Roads = {

    init: function (callback) {

        var writeImports = function(e) {

            var imports = document.querySelectorAll ('link[rel="import"]');
            var RoApp   = document.querySelector ('ro-app');

            for (var i = 0; i < imports.length; i++) {
                RoApp.innerHTML += imports[i].import.body.innerHTML;
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

  return Roads;

}());
(function (){

  xtag.register ('ro-app', {
    lifecycle: {
      created: function () {
      },
      inserted: function () {

        this.putViewsInFirstPosition ();

      },
      removed: function () {
      }
    },
    events: {
      reveal: function () {
        


      }
    },
    accessors: {      
    },
    methods: {

      putViewsInFirstPosition: function () {

        var views = document.querySelectorAll ('ro-view:not([mainPage])');
        var firstView = document.querySelector ('ro-view[mainPage]');

        if (firstView) {
          firstView.style.cssText = Ro.styleGenerator ({
              'transform': 'translateX(0)',
              '-webkit-transform': 'translateX(0)'
          });
        }

        if (views) {
          for (var i = 0, l = views.length; i < l; i++) {
            views[i].style.cssText = Ro.styleGenerator ({
              'transform': 'translateX(2000px)',
              '-webkit-transform': 'translateX(2000px)'
            });

          };          
        }

      },

      gotoView: function (fromID, toID) {

        var from, to;

        from = document.getElementById (fromID);
        to   = document.getElementById (toID);

        if (!from) {
          throw 'ro-view: "From" view can not be found'
        }

        if (!to) {
          throw 'ro-view: "To" view can not be found' 
        }

        to.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',
          '-webkit-transform': 'translateX(0px)',          
          'transform': 'translateX(0px)',
          'z-index': '2',
          '-webkit-transition-timing-function': 'ease',
          'transition-timing-function': 'ease'
        });

        from.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',
          'transition-delay': '500ms',          
          '-webkit-transform': 'translateX(2000px)',
          'transform': 'translateX(2000px)',
          'z-index': '1'
        });

      },

      backtoView: function (fromID, toID) {

        var from, to;

        from = document.getElementById (fromID);
        to   = document.getElementById (toID);

        to.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '2ms',
          'transition': '2ms',
          '-webkit-transform': 'translateX(0px)',          
          'transform': 'translateX(0px)',
          'z-index': '1',
          '-webkit-transition-timing-function': 'ease',
          'transition-timing-function': 'ease'
        });

        from.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',         
          '-webkit-transform': 'translateX(2000px)',
          'transform': 'translateX(2000px)',
          'z-index': '2'
        });         

      }
    }
  });

})();
(function (){

  xtag.register ('ro-button', {
    lifecycle: {
      created: function () {
        this.addListeners ();
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
    accessors: {     
    },
    methods: { 
      addListeners: function () {
        this.setAttribute ('onclick', this.getAttribute('action'));
      }    
    }
  });

})();
(function (){

  xtag.register ('ro-list', {
    lifecycle: {
      created: function () {
        this.xtag.item = this.querySelector ('ro-item');
        this.xtag.itemTemplate = this.querySelector ('ro-item').innerHTML;
        this.xtag.itemAction = this.xtag.item.getAttribute ('action');
      },
      inserted: function () {

        var nextElement = this.parentElement.nextElementSibling;

        if (nextElement && nextElement.tagName === "RO-FOOTER") {
        
          this.style.cssText = Ro.styleGenerator ({
              'height': '-webkit-calc(100% - 100px)',
              'height': '-moz-calc(100% - 100px)',
              'height': 'calc(100% - 100px)'
          });  
        }
        
      },
      removed: function () {
      }
    },
    events: {
      reveal: function () {
      }
    },
    accessors: {   
      data: []   
    },
    methods: {
      setData: function (data) {
        this.xtag.data = data;
        this.parseList ();
      },
      parseList: function () {

        var data = this.xtag.data;

        this.innerHTML = '';

        for (var i = 0; i < data.length; i++) {

          var roItem = document.createElement ('ro-item');
          roItem.setAttribute ('onclick', Ro.templateEngine (this.xtag.itemAction, data[i]));
          roItem.innerHTML = Ro.templateEngine (this.xtag.itemTemplate, data[i]);
          this.appendChild (roItem);

        };

      }      
    }
  });

})();