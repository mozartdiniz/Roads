/*! roads - v0.0.1 - 2015-02-11 */var Ro = (function () {

  var Roads = {

    init: function (callback) {

        var writeImports = function(e) {

            var loader = document.querySelector ('ro-loader');
            if (loader) {
                loader.show();    
            }               

            var imports = document.querySelectorAll ('link[rel="import"]');
            var RoApp   = document.querySelector ('ro-app');


            for (var i = 0; i < imports.length; i++) {
                var view  = imports[i].import.body.querySelector ('ro-view');
                var clone = view.cloneNode(true);

                RoApp.appendChild (clone);
            };

            setTimeout (callback, 100);

        }

        window.addEventListener ('HTMLImportsLoaded', writeImports.bind (this)); 

        document.addEventListener("deviceready", function (){
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

        while(match = re.exec(tpl)) {

            hasFilter = match[1].indexOf('|');

            if (hasFilter > 0) {
              filter = match[1].split('|')[1].trim(); 
              if (filter.indexOf(':') > 0) {
                filterParameter = filter.split(':')[1];
                filter = filter.split(':')[0];
              }
              key = match[1].split('|')[0].trim(); 
            } else {
              key = match[1];  
            }

            if (hasFilter && Ro.Filter.filters[filter]) {
              tpl = tpl.replace(match[0], Ro.Filter.filters[filter](this.findByKey (data, key) || key, filterParameter));
            } else {
              tpl = tpl.replace(match[0], this.findByKey (data, key));
            }
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

        return (sObj.length === 1) ? sObj.pop() : (sObj.length === 0) ? false : sObj;

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

        date: function (dateValue, dateFormat) {

            if (!dateValue) {
              throw 'Roads.Filter.date: dateValue is mandatory';
            } 

            if (Ro.Environment.platform.isWPhone || Ro.Environment.platform.isIOS) {
                dateValue = Roads.dateToIEandSafari (dateValue);
            }

            var format = dateFormat || Ro.i18n.defaults.date;
            var date   = new Date (dateValue);
            var year   = date.getFullYear();
            var day    = date.getDate ();
            var month  = date.getMonth()+1;

            format = format.replace(/yyyy/g, year);
            format = format.replace(/yy/g, String(year).substr(2,2));
            format = format.replace(/MM/g, (month < 10) ? '0' + month : month);
            format = format.replace(/M/g, month);
            format = format.replace(/dd/g, (day < 10) ? '0' + day : day);
            format = format.replace(/d/g, day);

            return format;

        },

        time: function (timeValue, timeFormat) {

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
                el.innerHTML = Ro.templateEngine(el.innerHTML);
                break;
            default:
                el.setAttribute(i18n, Ro.templateEngine(el.getAttribute(i18n)));
                break;
        }

    }
  }

  return Roads;

}());
(function (){

  xtag.register ('ro-app', {
    lifecycle: {
      created: function () {

        // Create style to calc correct ro-view heights
        var updateStyle = function () {

          var roadStyles = document.querySelector('style#roViewStyles');

          if (!roadStyles) {
            roadStyles = document.createElement('style');
            roadStyles.id = 'roViewStyles';
            document.head.appendChild (roadStyles);              
          }

          roadStyles.innerHTML = 'ro-view { height: ' + window.innerHeight + 'px}';            
        }

        document.addEventListener("deviceready", function () {

          setTimeout(updateStyle, 500);          

        });

        window.addEventListener('orientationchange', function () {

          setTimeout(updateStyle, 500);          

        }); 

      },

      inserted: function () {

        this.putViewsInFirstPosition ();

        setTimeout(function (){
          var loader  = document.querySelector ('ro-loader');
          loader.hide();
        }, 500);

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

          Ro.i18n.translateView (firstView);

          firstView.style.cssText = Ro.styleGenerator ({
              '-webkit-transition': '1ms',
              'transition': '1ms',                
              'transform': 'translateX(0)',          
              '-webkit-transform': 'translateX(0)'
          });
        }

        if (views) {
          for (var i = 0, l = views.length; i < l; i++) {
            views[i].style.cssText = Ro.styleGenerator ({
              '-webkit-transition': '1ms',
              'transition': '1ms',                  
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
          throw 'ro-view: "From" view can not be found';
        }

        if (!to) {
          throw 'ro-view: "To" view can not be found';
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

        Ro.i18n.translateView (to);

        xtag.fireEvent(to, 'show');

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

        Ro.i18n.translateView (to);

        xtag.fireEvent (to, 'show');        

      }
    }
  });

})();
(function (){

  xtag.register ('ro-back-button', {
    lifecycle: {
      created: function () {
        this.addListeners ();
      },
      inserted: function () {
        if (!Ro.Environment.platform.isIOS && !Ro.Environment.platform.isFxOS) {
          this.style.display = 'none';
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
    },
    methods: { 
      addListeners: function () {
        this.addEventListener (Ro.Events.click (), function () {
          Ro.Globals.backButtonFunction ();
        }, true);
      },
      registerBackAction: function (callback) {
        Ro.Globals = Ro.Globals || {};
        Ro.Globals.backButtonFunction = callback;
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
        var action = new Function (this.getAttribute('action'));
        this.addEventListener ('click', action);
      }    
    }
  });

})();
(function (){

  xtag.register ('ro-float-menu', {
    lifecycle: {
      created: function () {
        this.xtag.itemsAreVisible = false;

        this.xtag.overlay = document.createElement('ro-overlay');        
        this.xtag.hitArea = document.createElement('ro-hitarea');
      },
      inserted: function () {

        this.appendChild(this.xtag.hitArea);
        this.parentElement.appendChild (this.xtag.overlay);

        var clickCallback = function (e) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMenu ();                   
        }

        this.xtag.hitArea.onclick = clickCallback.bind(this);

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
      addItem: function (item) {
      },
      removeItem: function (item) {
      },
      toggleMenu: function () {
        if (this.xtag.itemsAreVisible) {
           this.hideItems ();
        } else {
          this.showItems ();
        }
      },
      hideItems: function () {
        this.setAttribute('state', 'hideItems');
        this.xtag.overlay.setAttribute('state', 'hideItems');

        this.xtag.itemsAreVisible = false;
      },
      showItems: function (items) {
        this.setAttribute('state', 'showItems');
        this.xtag.overlay.setAttribute('state', 'showItems');
        this.xtag.itemsAreVisible = true;
      },
      parseList: function () {
      }
    }
  });

})();
(function (){

  xtag.register ('ro-header', {
    lifecycle: {
      created: function () {
        if (Ro.Environment.platform.isIOS) {
          this.style.paddingTop = '20px';
        }
      },
      inserted: function () {
      },
      removed: function () {
      }
    },
    events: {
    },
    accessors: {     
    },
    methods: {       
    }
  });

})();
(function (){

  xtag.register ('ro-input', {
    lifecycle: {
      created: function () {             
        if (!this.innerHTML.trim()) {

          this.xtag.field = document.createElement('input');
          this.xtag.field.type = this.getAttribute('type');
          this.xtag.field.value = this.getAttribute('value');
          this.xtag.field.setAttribute('i18n', this.getAttribute('i18n'));
          this.xtag.field.placeholder = this.getAttribute('placeholder');
          this.xtag.field.name = this.getAttribute('name');

          this.xtag.icon = document.createElement('ro-icon');
          this.xtag.icon.setAttribute ('iconName', this.getAttribute('icon'));

          this.appendChild (this.xtag.icon);
          this.appendChild (this.xtag.field);

          this.removeAttribute('i18n');
        }
      },
      inserted: function () {
      },
      removed: function () {
      }
    },
    events: {
    },
    accessors: {     
    },
    methods: { 
    }
  });

})();
(function (){

  xtag.register ('ro-layout', {
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
    accessors: {   
    },
    methods: {
      setData: function (data) {
        this.xtag.data = data;
        this.parseLayout ();
      },
      parseLayout: function () {

        var data = this.xtag.data;

        this.innerHTML = Ro.templateEngine (this.innerHTML, data);

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
          var action = new Function (Ro.templateEngine (this.xtag.itemAction, data[i]));
          roItem.addEventListener ('click', action);
          roItem.innerHTML = Ro.templateEngine (this.xtag.itemTemplate, data[i]);
          this.appendChild (roItem);

        };

      }      
    }
  });

})();
(function (){

  xtag.register ('ro-loader', {
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
    accessors: {     
    },
    methods: { 
      show: function () {

        this.style.cssText = Ro.styleGenerator ({
          'display': 'block',
          'width': '100vw',
          'height': '100vh'
        });

      },
      hide: function () {

        this.style.cssText = Ro.styleGenerator ({
          'display': 'none',
          'width': '0',
          'height': '0'
        });
        
      } 
    }
  });

})();
(function (){

  xtag.register ('ro-title', {
    lifecycle: {
      created: function () {        
      },
      inserted: function () {
      },
      removed: function () {
      }
    },
    events: {
    },
    accessors: {     
    },
    methods: {       
    }
  });

})();
(function (){

  xtag.register ('ro-view', {
    lifecycle: {
      created: function () {        

        if (Ro.Environment.platform.isIOS && !this.className.match(/isIOS/)) {
          this.className += "isIOS ";
        }         

      },
      inserted: function () {
      },
      removed: function () {
      }
    },
    events: {
      show: function () {
        if (this.xtag.showFunction) {
          this.xtag.showFunction ();
        }  
      },
    },
    accessors: {     
    },
    methods: {  
      setShowFunction: function (callback) {
        this.xtag.showFunction = callback;
      } 
    }
  });

})();