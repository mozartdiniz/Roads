/*! roads - v0.0.1 - 2015-07-20 */var Ro = {

	/**
	 * This is the very first function that Roads will run
	 * @param {function} callback What will run after everything is finished
	 *
	 */

    init: function (callback) {

        Ro.Session = Ro.Session = {};
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

            document.addEventListener ("backbutton", function () {
                Ro.Globals.backButtonFunction ();
            }, false);

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

    }
};
var Ro = Ro || {};

/**
 * Ro.i18n is responsible by translations and internationalization
 */

Ro.i18n = {
	defaults: {
		currency: "US$",
		date: "MM/dd/yyyy",
		decimalSymbol: ",",
		digitalGrouping: ".",
		language: "en",
		time: "HH:mm",
		systemOfMeasurement: "METRIC" // METRIC | IMPERIAL
	},

	/**
	 * Translations is a object that storage all text to be used as a translation
	 *
	 * {
	 *    'user.name': 'User name',
	 *    'user.pass': 'Password'
	 * }
	 *
	 */

	translations: {},

	/**
	 * Used to translante view layout
	 *
	 * @param {RoView} view Search for all DOM nodes with a [i18n] attribute and pass to translateElement()
	 */

	translateView: function (view) {

		var elements = view.querySelectorAll('[i18n]');
		for (var i = elements.length - 1; i >= 0; i--) {
			this.translateElement (elements[i]);
		}
	},

	/**
	 * Check what needs to be translated, fis is only a [i18n] attribute, the translated value will be added as
	 * innerHTML, but if i18n has a value this value will be used to set a attribute with translated text.
	 *
	 * @param {DOMObject} el
	 */

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

	/**
	 * Search translations by key, if there's no translations that match with this key, return
	 * the key. This is useful to check if there's no missing translations
	 *
	 * @param {string} key
	 */

	getTranslationByKey : function(key){

		var value = Ro.i18n.translations[key];

		if (value){
			return value;
		}

		return key;
	},

	/**
	 *
	 * Search translations by key, if there's no translations that match with this key, return
	 * the alternate value.
	 *
	 * @param {string} resourceId
	 * @param {string} alternativeValue
	 */

	getTranslationByKeyOrAlternative : function (resourceId, alternativeValue){

		var message = Ro.i18n.getTranslationByKey (resourceId);

		if (alternativeValue && message === resourceId) {
			return alternativeValue;
		}

		return message;
	}

};
var Ro = Ro || {};

/**
 * Ro.i18n is a helper to make your life easier when you need to make XMLHttpRequests
 */

Ro.Http = function () {

	// set defaults
	this.url         = '';
	this.method      = 'get';
	this.async       = true;
	this.data        = null;
	this.contentType = 'application/json';
	this.customHeader = null;

	//callback for success
	this.success     = null;
	this.timeout     = 30000;
	this.ontimeout   = null;
	this.roSuccess   = null;
	this.multipart   = null;

	//callback for error
	this.error       = null;

	// do request
	this.send = function() {

		var request = new XMLHttpRequest();

		request.open(this.method, this.url, this.async);
		if (!this.multipart) {
			request.setRequestHeader('Content-Type', this.contentType);
		}
		request.setRequestHeader("Cache-Control", "no-cache");
		request.setRequestHeader("Pragma", "no-cache");

		if (this.customHeader) {
			request.setRequestHeader(this.customHeader.key, this.customHeader.value);
		}

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

};
var Ro = Ro || {};

Ro.Globals = {
	backButtonFunction: function () {
		console.log('No back function defined');
	}
};
var Ro = Ro || {};

/**
 * Filters are functions that will be used to evaluate the value when templateEngine() is replacing data in a
 * template string. Roads come with some basic filters but is also easy create and use new ones.
 *
 */

Ro.Filter = {
	filters: {

		date: function (dateValue, key, dateFormat) {

			if (!dateValue) {
				throw 'Roads.Filter.date: dateValue is mandatory';
			}

			var format = dateFormat || Ro.i18n.defaults.date;
			var date   = new Date (dateValue);
			var year   = date.getUTCFullYear();
			var day    = date.getUTCDate();
			var month  = date.getUTCMonth()+1;

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
				timeValue = Ro.dateToIEandSafari (timeValue);
			}

			var format  = timeFormat || Ro.i18n.defaults.time;
			var time    = new Date (timeValue);
			var hours24 = time.getHours();
			var hours12 = (hours24 + 11) % 12 + 1;
			var minutes = time.getMinutes();
			var seconds = time.getSeconds();
			var a       = (hours24 >= 12) ? 'pm' : 'am';

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

	// Used to add a new filter
	register: function (filterName, filterImplementation) {

		if (!filterName) {
			throw 'Roads.Filter.register: filterName is mandatory';
		}

		this.filters[filterName] = filterImplementation;
	}
};
var Ro = Ro || {};

Ro.Events = {
	click: function () {
		return (Ro.Environment.isTouchDevice) ? 'touchstart' : 'click'
	}
};
var Ro = Ro || {};

/**
 * Ro.Environment is used to check in what platform your app is running, Roads check these values when
 * need to decide if a back-button will be showed, or something like that
 */

Ro.Environment = {
	isTouchDevice: !!('ontouchstart' in window),
	platform: {
		androidVersion: (function (){
			var isAndroid = navigator.userAgent.match(/Android([^;]*)/);
			if (isAndroid && isAndroid.length > 1) {
				return parseInt(isAndroid[1], 10);
			}
			return false;
		}()),
		isAndroid: navigator.userAgent.match('Android') !== null,
		isIPhone: navigator.userAgent.match('iPhone') !== null,
		isIPad: navigator.userAgent.match('iPad') !== null,
		isWPhone: navigator.userAgent.match(/Trident/) ? true : false,
		isIOS: (navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPad')) ? true : false,
		isFxOS: (navigator.userAgent.match(/Mozilla\/5.0 \(Mobile;/) || navigator.userAgent.match('iPad')) ? true : false
	}
};
var Ro = Ro || {};

/**
 * Controllers are simples classes that are be used to manipulates view layouts, if you need get new data from
 * a REST service you will add a function with this call in a controller, that will pass the data for the
 * Road component TAG. If you need a user interaction, you will implement a function in controller and call the
 * specific method from a view tag.
 *
 *
 * @param {string} viewID
 * @param {object} methods
 * @returns {Function}
 *
 * @constructor
 */

Ro.Controller = function (viewID, methods) {

	var Controller = function () {

		//Relate a view layout with this controller
		this.view = document.querySelector ('[ro-controller="' + viewID + '"]');

		this.init ();

		// If there's a view method in the controller pass to related view, so RoApp will can run this
		// function every time that this view become visible
		if (this.show) {
			this.view.setShowFunction (this.show.bind (this));
		}

	};

	if (methods) {
		for (key in methods) {
			Controller.prototype[key] = methods[key];
		}
	}

	return Controller;

};
(function () {

    xtag.register('ro-app', {
        lifecycle: {
            created: function () {

                this.innerHTML = '<ro-scroll></ro-scroll>';

                // Create style to calc correct ro-view heights
                var updateStyle = function () {

                    var roadStyles = document.querySelector('style#roViewStyles');

                    if (!roadStyles) {
                        roadStyles = document.createElement('style');
                        roadStyles.id = 'roViewStyles';
                        document.head.appendChild(roadStyles);
                    }

                    roadStyles.innerHTML = 'ro-view { height: ' + window.innerHeight + 'px}';
                };

                document.addEventListener("deviceready", function () {

                    setTimeout(updateStyle, 500);

                });

                window.addEventListener('orientationchange', function () {

                    setTimeout(updateStyle, 500);

                });

            },

            inserted: function () {

                this.putViewsInFirstPosition();

                setTimeout(function () {
                    var loader = document.querySelector('ro-loader');
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
        accessors: {},
        methods: {

            putViewsInFirstPosition: function () {

                var views = document.querySelectorAll('ro-view:not([mainPage])');
                var firstView = document.querySelector('ro-view[mainPage]');

                if (firstView) {

                    Ro.i18n.translateView(firstView);

                    firstView.style.zIndex = 1;
                    firstView.style.webkitTransition = '10ms';
                    firstView.style.transition = '10ms';
                    firstView.style.webkitTransform = 'translateX(0)';
                    firstView.style.transform = 'translateX(0)';

                    RoApp.activeView = firstView.id;

                }

                if (views) {
                    for (var i = 0, l = views.length; i < l; i++) {

                        views[i].style.zIndex = 2;
                        views[i].style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
                        views[i].style.transform = 'translateX(' + window.innerWidth + 'px)';
                        views[i].style.webkitTransition = '10ms';
                        views[i].style.transition = '10ms';

                    }
                }

            },

            gotoView: function (fromID, toID) {

                var from, to;

                from = document.getElementById(fromID);
                to = document.getElementById(toID);

                if (!from) {
                    throw 'ro-view: "From" view can not be found';
                }

                if (!to) {
                    throw 'ro-view: "To" view can not be found';
                }

                if (to === from) {
                    throw 'ro-view: "To" and "From" can not be the same';
                }

                to.show(fromID);

                to.removeAttribute('from');
                to.setAttribute('to', 'true');

                if (Ro.Environment.platform.isWPhone) {
                    to.style.cssText = Ro.styleGenerator ({
                        'transition': '200ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(0)',
                        'transform': 'translateX(0)'
                    });
                } else {
                    to.style.transition = '300ms';
                    to.style.transitionTimingFunction = 'linear';
                    to.style.webkitTransform = 'translateX(0)';
                    to.style.transform = 'translateX(0)';
                }


                from.removeAttribute('to');
                from.setAttribute('from', 'true');

                if (Ro.Environment.platform.isWPhone) {
                    from.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(-' + window.innerWidth + 'px)',
                        'transform': 'translateX(-' + window.innerWidth + 'px)'
                    });
                } else {
                    from.style.transition = '300ms';
                    from.style.transitionTimingFunction = 'linear';
                    from.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px)';
                    from.style.transform = 'translateX(-' + window.innerWidth + 'px)';
                }

                Ro.i18n.translateView(to);

                setTimeout ((function (to, from) {
                    return function () {
                        to.style.zIndex = 2;
                        from.style.zIndex = 3;
                    };
                }(to, from)), 50);

                this.activeView = toID;

            },

            backtoView: function (fromID, toID) {

                var from, to;

                from = document.getElementById(fromID);
                to = document.getElementById(toID);

                if (!from) {
                    throw 'ro-view: "From" view can not be found';
                }

                if (!to) {
                    throw 'ro-view: "To" view can not be found';
                }

                if (to === from) {
                    throw 'ro-view: "To" and "From" can not be the same';
                }

                to.removeAttribute('from');
                to.setAttribute('to', 'true');

                if (Ro.Environment.platform.isWPhone) {
                    to.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(0)',
                        'transform': 'translateX(0)'
                    });
                } else {
                    to.style.transition = '300ms';
                    to.style.transitionTimingFunction = 'linear';
                    to.style.webkitTransform = 'translateX(0)';
                    to.style.transform = 'translateX(0)';
                }


                from.removeAttribute('to');
                from.setAttribute('from', 'true');

                if (Ro.Environment.platform.isWPhone) {
                    from.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(-' + window.innerWidth + 'px)',
                        'transform': 'translateX(-' + window.innerWidth + 'px)'
                    });
                } else {
                    from.style.transition = '300ms';
                    from.style.transitionTimingFunction = 'linear';
                    from.style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
                    from.style.transform = 'translateX(' + window.innerWidth + 'px)';
                }

                Ro.i18n.translateView(to);

                setTimeout ((function (to, from) {
                    return function () {
                        to.style.zIndex = 3;
                        from.style.zIndex = 2;
                    };
                }(to, from)), 50);

                this.activeView = toID;

                to.show(fromID);

            }
        }
    });

})();
(function () {

    xtag.register('ro-back-button', {
        lifecycle: {
            created: function () {
                this.addListeners();
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
        accessors: {},
        methods: {
            addListeners: function () {
                this.addEventListener('click', function () {
                    Ro.Globals.backButtonFunction();
                }, true);
            },
            registerBackAction: function (callback) {
                Ro.Globals = Ro.Globals || {};
                Ro.Globals.backButtonFunction = callback;
            }
        }
    });

})();
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
(function () {

    xtag.register('ro-checkbox', {
        lifecycle: {
            created: function () {

                if (!this.firstElementChild) {
                    this.checkInput = document.createElement('input');
                    this.checkInput.addEventListener('click', function (e) {
                        e.preventDefault();
                    });
                    this.setAttribute('checked', false);
                    this.addEventListener('click', this.toggleCheck);
                    this.checkInput.type = 'checkbox';
                    this.appendChild(this.checkInput);
                }

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
            addListeners: function () {
                var action = new Function(this.getAttribute('action'));
                this.addEventListener('click', action);
            },

            toggleCheck: function () {

                if (this.checkInput.checked) {
                    this.uncheck();
                } else {
                    this.check();
                }

            },

            check: function () {
                this.checkInput.checked = true;
                this.setAttribute('checked', true);
            },

            uncheck: function () {
                this.checkInput.checked = false;
                this.setAttribute('checked', false);
            },

            value: function () {
                if (this.checkInput.checked) {
                    return true;
                }
                return false;
            }
        }
    });

})();
(function () {

    xtag.register('ro-float-menu', {
        lifecycle: {

            created: function () {
            },

            inserted: function () {
                this.create();
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

            create: function () {

                this.xtag.itemsAreVisible = false;
                this.xtag.click = true;

                this.insert();
                this.parseList();

            },

            insert: function () {

                var existingOverlay = this.parentElement.querySelector('ro-overlay');

                if (!existingOverlay) {

                    var overlay = document.createElement('ro-overlay');
                    var hitArea = document.createElement('ro-hitarea');

                    hitArea.setAttribute('onclick', 'this.parentNode.toggleMenu ()');

                    this.parentElement.appendChild(overlay);
                    this.appendChild(hitArea);

                }

            },

            recreate: function () {

                var overlay = this.parentElement.querySelector('ro-overlay');
                var hitArea = this.querySelector('ro-hitarea');

                if (overlay) {
                    overlay.parentElement.removeChild(overlay);
                }

                if (hitArea) {
                    hitArea.parentElement.removeChild(hitArea);
                }

                this.create();
            },

            addItem: function (item) {
            },
            removeItem: function (item) {
            },

            toggleMenu: function () {
                if (this.xtag.click) {
                    this.xtag.click = false;
                    setTimeout(function () {
                        if (this.xtag.itemsAreVisible) {
                            this.hideItems();
                            this.xtag.click = true;
                        } else {
                            this.showItems();
                            this.xtag.click = true;
                        }
                    }.bind(this), 100);
                }

            },

            hideItems: function () {
                this.setAttribute('state', 'hideItems');
                this.nextElementSibling.setAttribute('state', 'hideItems');
                this.xtag.itemsAreVisible = false;
            },

            showItems: function () {
                this.setAttribute('state', 'showItems');
                this.nextElementSibling.setAttribute('state', 'showItems');
                this.xtag.itemsAreVisible = true;
            },

            parseList: function () {

                var items = this.querySelectorAll('ro-item');
                var text  = '';

                for (var i = 0; i < items.length; i++) {

                    var itemActionFunction = new Function(items[i].getAttribute('action'));
                    var action = (function (scope, func) {
                        return function () {
                            func();
                            scope.hideItems();
                        };
                    }(this, itemActionFunction));

                    text = items[i].getAttribute('i18nKey') || items[i].getAttribute('text');

                    items[i].addEventListener('click', action);
                    items[i].setAttribute('text', Ro.templateEngine(text));
                }
            }
        }
    });

})();
(function () {

    xtag.register('ro-header', {
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
        events: {},
        accessors: {},
        methods: {}
    });

})();
(function () {
    xtag.register('ro-inline-menu', {
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
            hideAllMenus: function () {
                var getRoList = function (roInlineMenu) {
                    var node = roInlineMenu;
                    var nodeName = node.nodeName.toLowerCase();

                    while (nodeName !== 'ro-list') {
                        node = node.parentNode;
                        nodeName = node.nodeName.toLocaleLowerCase();
                        if (node === 'body') {
                            break;
                        }
                    }

                    return node;
                };
                var roList = getRoList(this);
                var roInlineMenus = roList.querySelectorAll('ro-inline-menu[state="showItems"]');

                for (var i = 0, j = roInlineMenus.length; i < j; i++) {
                    var roInlineMenu = roInlineMenus[i];
                    roInlineMenu.hide();
                }
            },
            show: function () {

                var viewSingletonMenu = this.getAttribute('viewSingletonMenu');

                if (viewSingletonMenu) {
                    this.hideAllMenus();
                }

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
                var renderHideMenu = this.getAttribute('buttonHideMenu');
                var items = this.querySelectorAll('ro-item');
                var itemsLength = items.length;
                //var magicNumber = (renderHideMenu) ? 20 : 0;
                //var widthItem = parseInt((this.clientWidth - magicNumber) / itemsLength) + 'px';

                var renderHideButton = function () {

                    var hideButton = document.createElement('ro-item');
                    hideButton.setAttribute('icon', '');
                    hideButton.setAttribute('class', 'hideInlineMenu');
                    //hideButton.style.width = magicNumber + 'px';

                    return hideButton;

                };

                for (var i = 0; i < itemsLength; i++) {

                    var item = items[i];
                    //item.style.width = widthItem;
                    item.setAttribute('text', Ro.templateEngine(item.getAttribute('i18nKey')));

                }

                if (renderHideMenu) {
                    this.appendChild(renderHideButton());
                }

                this.parentNode.className = this.parentNode.className.replace('hasMenuInline').trim();
                this.parentNode.className += ' hasMenuInline';

            }
        }


    });
}());

(function () {

    xtag.register('ro-input', {
        lifecycle: {
            created: function () {
                if (!this.innerHTML.trim()) {

                    this.xtag.field = document.createElement('input');
                    this.xtag.field.type = this.getAttribute('type');
                    this.xtag.field.value = this.getAttribute('value');
                    this.xtag.field.setAttribute('i18n', this.getAttribute('i18n'));
                    this.xtag.field.setAttribute('i18nKey', this.getAttribute('i18nKey'));
                    this.xtag.field.placeholder = this.getAttribute('placeholder');
                    this.xtag.field.name = this.getAttribute('name');

                    this.xtag.icon = document.createElement('ro-icon');
                    this.xtag.icon.setAttribute('iconName', this.getAttribute('icon'));

                    this.appendChild(this.xtag.icon);
                    this.appendChild(this.xtag.field);

                    this.removeAttribute('i18n');

                }
            },
            inserted: function () {
            },
            removed: function () {
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });

})();
(function () {

    xtag.register('ro-layout', {
        lifecycle: {
            created: function () {
                this.template = this.innerHTML;
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
            setData: function (data) {
                this.xtag.data = data;
                this.parseLayout();
            },
            parseLayout: function () {
                var data = this.xtag.data;
                xtag.innerHTML(this, Ro.templateEngine(this.template, data));
            }
        }
    });

})();
(function () {

    xtag.register('ro-list', {
        lifecycle: {
            created: function () {
                this.xtag.item = this.querySelector('ro-item');
                this.xtag.itemTemplate = this.querySelector('ro-item').innerHTML;
                this.buttons = {};

                //Add default buttons
                this.addButton({
                    name: 'delete',
                    action: function () {
                        var button = document.createElement('ro-button');
                        button.innerHTML = 'DELETE';
                        return button;
                    }
                });

                this.addButton({
                    name: 'share',
                    action: function () {
                        var button = document.createElement('ro-button');
                        button.innerHTML = 'SHARE';
                        return button;
                    }
                });

                this.xtag.callbacks = {
                    didSelectedItem: function (e) {
                    },
                    didUnSelectedItem: function (e) {
                    },
                    didSwipeItem: function (e) {
                    }
                }

            },
            inserted: function () {

                this.activeButtons = this.getButtonsInfo();

                var nextElement = this.parentElement.nextElementSibling;

                if (nextElement && nextElement.tagName === "RO-FOOTER") {

                    this.style.cssText = Ro.styleGenerator({
                        'height': '-webkit-calc(100% - 100px)',
                        'height': '-moz-calc(100% - 100px)',
                        'height': 'calc(100% - 100px)'
                    });
                }

            },
            removed: function () {
            }
        },
        methods: {
            setData: function (data) {
                this.xtag.data = data;
                this.parseList();
            },
            addData: function (newItem) {
                this.xtag.data.push (newItem);
            },
            removeDataItem: function (index) {
                this.xtag.data.splice(index,1);
            },
            getData: function () {
                return this.xtag.data;
            },
            setAction: function (action) {
                this.action = action;
            },
            parseList: function () {

                var data = this.xtag.data;

                this.innerHTML = '';

                this.xtag.itemAction = this.action || this.xtag.item.getAttribute('action');

                for (var i = 0; i < data.length; i++) {

                    this.renderItem (data[i], i);

                }

            },

            renderItem: function (data, i) {

                var roItem    = document.createElement('ro-item');
                var roContent = document.createElement('ro-item-content');
                var action    = new Function(Ro.templateEngine(this.xtag.itemAction, data));

                data.itemIndex = i;
                roItem.setAttribute('itemIndex', i);

                roContent.addEventListener('click', action);
                roContent.innerHTML = Ro.templateEngine(this.xtag.itemTemplate, data);

                if (this.getAttribute('swipeable')) {
                    roItem.appendChild(this.renderSwipeMenu());
                    this.addSwipeMenuActions(roItem, this);
                }

                if (this.activeButtons) {
                    for (var j = 0; j < this.activeButtons.length; j++) {
                        roItem.appendChild(this.activeButtons[j]());
                    }
                }

                if (this.getAttribute('selectable')) {
                    roItem.appendChild(this.renderSelectableButton(data));
                }

                roItem.appendChild(roContent);

                this.appendChild(roItem);

            },

            getButtonsInfo: function () {

                var attribute = this.getAttribute('actionButtons');
                var buttons = false;

                if (attribute) {
                    buttons = attribute.split(',').map(function (item) {
                        return this.buttons [item.trim()];
                    }.bind(this));
                }

                return buttons;

            },

            addButton: function (button) {
                this.buttons[button.name] = button.action;
            },

            renderSelectableButton: function (data) {

                var cbox = document.createElement('ro-checkbox');
                cbox.appendChild(this.renderes.selectableButton(data));
                cbox.addEventListener('click', function (e) {
                    if (cbox.querySelector('input[type="checkbox"]').checked) {
                        e.target.parentElement.parentElement.setAttribute('checked', true);
                        this.xtag.callbacks.didSelectedItem(e);
                    } else {
                        e.target.parentElement.parentElement.removeAttribute('checked');
                        this.xtag.callbacks.didUnSelectedItem(e);
                    }
                }.bind(this));

                return cbox;
            },

            selectedItems: function () {
                return this.querySelectorAll('ro-item[checked="true"]');
            },

            renderes: {
                selectableButton: function () {
                    return document.createTextNode('');
                }
            },

            setCallback: function (callback) {
                this.xtag.callbacks[callback.name] = callback.action;
            },

            setRenderer: function (renderer) {
                this.renderes[renderer.name] = renderer.action;
            },

            renderSwipeMenu: function () {

                var roItemSwipemenu = document.createElement('ro-item-swipemenu');
                roItemSwipemenu.setAttribute('swipeMenuLabel', Ro.templateEngine(this.getAttribute('i18nKey')));

                return roItemSwipemenu;
            },

            addSwipeMenuActions: function (item, scope) {

                var items = this.querySelectorAll('ro-item ro-item-swipemenu');
                var hammertime = new Hammer(item);

                hammertime.on('panright', function (e) {

                    var menu = item.firstElementChild;

                    if (menu && e.deltaX > (window.innerWidth / 2)) {

                        menu.className = 'goMenu';

                    } else if (menu && e.deltaX > 50) {

                        menu.className = '';
                        menu.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
                        menu.style.transform = 'translateX(' + e.deltaX + 'px)';
                    }

                });

                hammertime.on('panend', function (e) {

                    var menu = item.firstElementChild;

                    if (e.deltaX < (window.innerWidth / 2) && menu) {
                        menu.className = 'backMenu';
                    } else {
                        scope.xtag.callbacks.didSwipeItem(item);

                        setTimeout((function (item) {
                            item.firstElementChild.className = 'backMenu';
                        }(item)), 1000);
                    }

                });

            }

        }
    });

})();
(function () {

    xtag.register('ro-loader', {
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
            show: function () {

                this.style.cssText = Ro.styleGenerator({
                    'display': 'block',
                    'width': '100vw',
                    'height': '100vh'
                });

            },
            hide: function () {

                this.style.cssText = Ro.styleGenerator({
                    'display': 'none',
                    'width': '0',
                    'height': '0'
                });

            }
        }
    });

})();
(function () {

    xtag.register('ro-map', {
        lifecycle: {
            created: function () {
                Ro.Session.Map = Ro.Session.Map = {};
            },
            inserted: function () {

                if (!this.querySelector ('ro-map-canvas') && this.querySelector ('ro-layer')) {
                    this.parse();
                }

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

            parse: function () {

                this.map = document.createElement('ro-map-canvas');
                this.appendChild(this.map);

                this.parseLayers();

                if (this.getAttribute('layerGroup')) {
                    this.createLayerGroup();
                }

                this.crs             = this.getAttribute('projection') || "EPSG:3857";

                var initialLatitude  = this.getAttribute('latitude') || "0";
                var initialLongitude = this.getAttribute('longitude') || "0";
                var initialZoom      = this.getAttribute('zoom') || "1";
                var maxZoom          = this.getAttribute('maxZoom') || "22";
                var minZoom          = this.getAttribute('minZoom') || "1";
                var center           = [parseFloat(initialLongitude), parseFloat(initialLatitude)];
                var viewOpt          = {
                    center: center,
                    projection: this.crs,
                    zoom: parseInt(initialZoom),
                    maxZoom: parseInt(maxZoom),
                    minZoom: parseInt(minZoom)
                };

                if (this.crs !== 'EPSG:3857') {
                    viewOpt.projection = this.crs;
                }

                this.olMap = new ol.Map({
                    layers: this.olLayers,
                    target: this.map,
                    renderer: 'canvas',
                    view: new ol.View(viewOpt)
                });

            },

            parseLayers: function () {

                this.olLayers = [];
                this.roLayers = this.querySelectorAll('ro-layer');

                for (var i = 0; i < this.roLayers.length; i++) {
                    this.olLayers.push(this.layerBuilder(this.roLayers[i]));
                }

            },

            layerBuilder: function (layer) {

                var type       = layer.getAttribute('source') || 'OSM';
                var imagerySet = layer.getAttribute('imagerySet') || '';
                var visible    = (layer.getAttribute('visible')) ? true : false;
                var url        = layer.getAttribute('url') || '';
                var format     = layer.getAttribute('format') || 'image/png8';
                var layersName = layer.getAttribute('layers') || '';
                var serverType = layer.getAttribute('servertype') || 'geoserver';
                var tileSize   = layer.getAttribute('tilesize') || '512';
                var CQL_FILTER = layer.getAttribute('CQL_FILTER') || '';
                var version    = layer.getAttribute('version') || '1.1.1';
                var resultLayer;

                switch (type) {
                    case 'OSM':
                        return new ol.layer.Tile({
                            source: new ol.source.OSM(),
                            visible: visible
                        });
                        break;
                    case 'Bing':
                        return new ol.layer.Tile({
                            source: new ol.source.BingMaps({
                                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                                imagerySet: imagerySet,
                                visible: visible
                            })
                        });
                        break;
                    case 'Google':

                        this.layerCrs = 'EPSG:3857';

                        return new ol.layer.Tile({
                            source: new ol.source.OSM({
                                url: this.googleURLSwich(imagerySet)
                            })
                        });

                        break;
                    case 'WMS':

                        var projection       = ol.proj.get('EPSG:4326');
                        var projectionExtent = projection.getExtent();
                        var resolutions      = new Array(16);
                        var maxResolution    = ol.extent.getWidth(projectionExtent) / (parseInt(tileSize));

                        var z;
                        for (z = 0; z < 16; ++z) {
                            resolutions[z] = maxResolution / Math.pow(2, z);
                        }

                        this.layerCrs = 'EPSG:4326';

                        resultLayer = new ol.layer.Tile({
                            source: new ol.source.TileWMS({
                                url: url,
                                params: {
                                    LAYERS: layersName,
                                    FORMAT: format,
                                    TRANSPARENT: 'true',
                                    VERSION: version,
                                    CQL_FILTER: CQL_FILTER,
                                    FORMAT_OPTIONS: '',
                                    TILED: true
                                },
                                serverType: serverType
                            })
                        });

                        return resultLayer;

                    default:
                        return new ol.layer.Tile({
                            source: new ol.source.OSM(),
                            resolutions: resolutions,
                            visible: visible
                        });
                }
            },

            googleURLSwich: function (imagerySet) {
                switch (imagerySet) {
                    case 'streets':
                        return 'http://mt1.google.com/vt/lyrs=m@146&hl=en&x={x}&y={y}&z={z}';
                    case 'traffic':
                        return 'http://mt1.googleapis.com/vt?lyrs=m@226070730,traffic&src=apiv3&hl=en-US&x={x}&y={y}&z={z}&apistyle=s.t:49|s.e:g|p.h:#ff0022|p.s:60|p.l:-20,s.t:50|p.h:#2200ff|p.l:-40|p.v:simplified|p.s:30,s.t:51|p.h:#f6ff00|p.s:50|p.g:0.7|p.v:simplified,s.t:6|s.e:g|p.s:40|p.l:40,s.t:49|s.e:l|p.v:on|p.s:98,s.t:19|s.e:l|p.h:#0022ff|p.s:50|p.l:-10|p.g:0.9,s.t:65|s.e:g|p.h:#ff0000|p.v:on|p.l:-70&style=59,37|smartmaps';
                    case 'bicycling':
                        return 'http://mt1.google.com/vt/lyrs=m@121,bike&hl=en&x={x}&y={y}&z={z}';
                    case 'transit':
                        return 'http://mt1.google.com/vt/lyrs=m@121,transit|vm:1&hl=en&opts=r&x={x}&y={y}&z={z}';
                    case 'aerialLand':
                        return 'https://khms0.googleapis.com/kh?v=142&hl=en-US&x={x}&y={y}&z={z}';
                    case 'aerielStreets':
                        return 'https://mts1.google.com/vt/lyrs=h@245180971&hl=pt-BR&src=app&x={x}&y={y}&z={z}&s=Galileo';
                    default:
                        return 'http://mt1.google.com/vt/lyrs=m@146&hl=en&x={x}&y={y}&z={z}';
                }
            },

            showLayer: function (index) {

                for (var i = 0; i < this.olLayers.length; i++) {
                    this.olLayers[i].setVisible(false);
                }

                this.olLayers[index].setVisible(true);
            },

            createLayerGroup: function () {

                this.layerGroup = document.createElement('ro-map-layer-group');
                this.layerGroup.setAttribute('visible', 'false');

                for (var i = 0; i < this.olLayers.length; i++) {
                    var layerItem = document.createElement('ro-item');
                    layerItem.innerHTML = this.roLayers[i].getAttribute('label');
                    layerItem.addEventListener('click', this.showLayer.bind(this, i));
                    this.layerGroup.appendChild(layerItem);
                }

                this.layerGroup.addEventListener('click', this.toggleLayerGroup.bind(this));

                this.appendChild(this.layerGroup);

            },

            toggleLayerGroup: function () {

                if (this.layerGroup.getAttribute('visible') === 'true') {
                    this.hideLayerGroup();
                } else {
                    this.showLayerGroup();
                }

            },

            showLayerGroup: function () {
                this.layerGroup.setAttribute('visible', true);
            },

            hideLayerGroup: function () {
                this.layerGroup.setAttribute('visible', false);
            },

            setCenter: function (position) {

                var view   = this.olMap.getView();
                var latlng = this.convertProjection (position);

                view.setCenter(latlng);

            },

            setZoom: function (zoom) {

                var view = this.olMap.getView();
                view.setZoom(zoom);

            },

            convertProjection: function (coordinates)  {

                if (this.layerCrs && this.crs !== this.layerCrs) {
                    var ll = ol.proj.transform (
                        [coordinates.longitude, coordinates.latitude], this.crs, this.layerCrs
                    );
                } else {
                    ll = [coordinates.longitude, coordinates.latitude];
                }

                return ll;

            },

            addMarker: function (position, markerContent) {

                if (position.longitude && position.latitude && this.olMap) {

                    var markerEl = document.createElement('div');
                    var ll = this.convertProjection (position);

                    markerEl.className = 'roMarker';

                    if (markerContent) {
                        markerEl.appendChild(markerContent);
                    }

                    var marker = new ol.Overlay({
                        element: markerEl,
                        positioning: 'buttom-left',
                        stopEvent: false
                    });

                    marker.setPosition(ll);

                    this.olMap.addOverlay(marker);

                } else {
                    console.log('latitude and longitude are mandatory');
                }

            },

            addMarkers: function () {

            },

            markerFocus: function (position) {

                var focusEl = document.createElement('div');
                var ll = this.convertProjection (position);

                var marker = new ol.Overlay({
                    element: focusEl,
                    positioning: 'buttom-left',
                    stopEvent: false
                });

                var callbackToTimeout = (function (scope, marker) {
                    return function () {
                        scope.olMap.removeOverlay(marker);
                    };
                }(this, marker));

                if (Ro.Session.Map.timeOutMarkerFocus) {
                    this.olMap.removeOverlay(Ro.Session.Map.previousMarkerFocused);
                    clearTimeout(Ro.Session.Map.timeOutMarkerFocus);
                    Ro.Session.Map.timeOutMarkerFocus = null;
                    Ro.Session.Map.previousMarkerFocused = null;
                }

                focusEl.className = 'focusMaker';
                marker.setPosition(ll);
                this.olMap.addOverlay(marker);
                Ro.Session.Map.previousMarkerFocused = marker;
                Ro.Session.Map.timeOutMarkerFocus = setTimeout(callbackToTimeout, 1000);

            },

            /* Get map features and focuses them */

            fitToBound: function () {

                var o = this.olMap.getOverlays();
                var v = this.olMap.getView();
                var a = o.getArray();
                var p = [];

                for (var i = 0, l = a.length; i < l; i++) {
                    if (a[i].getPosition() && !a[i].currentPosition) {
                        p.push(a[i].getPosition())
                    }
                }

                if (p.length) {
                    var l = p[0][1],
                        r = p[0][1],
                        t = p[0][0],
                        b = p[0][0];

                    for (var i = 0, pl = p.length; i < pl; i++) {

                        if (l < p[i][1]) {
                            l = p[i][1];
                        }
                        if (r > p[i][1]) {
                            r = p[i][1];
                        }
                        if (t < p[i][0]) {
                            t = p[i][0]
                        }
                        if (b > p[i][0]) {
                            b = p[i][0];
                        }
                    }

                    featureMultiLine = new ol.Feature();

                    var ml = new ol.geom.LineString([
                        [b, l],
                        [t, l],
                        [t, r],
                        [b, r]
                    ]);

                    v.fitExtent(ml.getExtent(), this.olMap.getSize());
                }

            },

            clear: function () {

                if (this.olMap) {
                    var overlays = this.olMap.getOverlays().getArray();
                    var map = this.olMap;

                    for (var l = overlays.length; l > 0; l--) {

                        if (overlays[l - 1] && !overlays[l - 1].currentPosition) {
                            map.removeOverlay(overlays[l - 1]);
                        }
                    }
                }

            },

            getOLMap: function () {
                return this.olMap;
            }
        }
    });

})();
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

(function () {

  xtag.register ('ro-tabs', {

    lifecycle: {

      created: function () {
      },

      inserted: function () {
      },

      removed: function () {
      }

    },
    events: {
      'tap:delegate(ro-tabs-labels ro-tab-label)': function () {

        var mainTabTag = this.parentElement.parentElement.parentElement;

        if (mainTabTag.tagName !== "RO-TABS") {
          mainTabTag = this.parentElement.parentElement;
        }

        var tabLabelIndex = this.getAttribute('tabindex');
        var tab = mainTabTag.querySelector('ro-tab[tabindex="' + tabLabelIndex + '"]');

        mainTabTag.tabClickCallback(this, tab);
      }
    },

    accessors: {},

    methods: {

      render: function () {

        var newTabs = [];
        var tabsLabels = this.querySelector('ro-tabs-labels');
        var tabs = this.querySelectorAll('ro-tab');
        var tabsWidth = this.getAttribute('tabwidth');
        var tabLabelTemplate = this.querySelector('ro-tab-label-template');
        var tabLabelsWrapper = document.createElement('div');
        var tabContentWrapper = document.createElement('div');

        tabLabelsWrapper.className = 'roTabLabelsWrapper';
        tabContentWrapper.className = 'roTabContentWrapper';

        if (!tabsLabels) {

          this.getTabLabelTemplate();

          for (var i = 0; i < tabs.length; i++) {
            newTabs.push(tabs[i].cloneNode(true));
          }

          this.tabsLabelGroup = document.createElement('ro-tabs-labels');
          this.tabsContentGroup = document.createElement('ro-tabs-contents');

          if (tabsWidth) {
            this.innerHTML = '';
          }

          for (var i = 0; i < newTabs.length; i++) {

            var tabLabel = document.createElement('ro-tab-label');

            if (tabLabelTemplate) {
              xtag.innerHTML (tabLabel, Ro.templateEngine(this.xtag.labelTemplate));
            } else {
              tabLabel.setAttribute('i18nKey', newTabs[i].getAttribute('label'));
              tabLabel.setAttribute('i18n', '');
              tabLabel.innerHTML = Ro.i18n.getTranslationByKey (tabLabel.getAttribute('i18nKey'));
            }

            tabLabel.setAttribute('tabIndex', i);
            newTabs[i].setAttribute('tabIndex', i);

            if (newTabs[i].getAttribute('selected')) {
              newTabs[i].style.display = 'block';
              tabLabel.setAttribute('selected', true);
            } else {
              newTabs[i].style.display = 'none';
            }

            if (tabsWidth) {

              this.tabsLabelGroup.setAttribute('style', 'overflow: hidden');
              this.tabsContentGroup.setAttribute('style', 'overflow: hidden');

              tabLabel.setAttribute('style', 'width: ' + tabsWidth);
              newTabs[i].setAttribute('style', 'width: ' + window.innerWidth + 'px');

              tabLabelsWrapper.appendChild(tabLabel);
              tabContentWrapper.appendChild(newTabs[i]);

            } else {
              this.tabsLabelGroup.appendChild(tabLabel);
            }

          }

          if (tabsWidth) {

            this.tabsLabelGroup.appendChild(tabLabelsWrapper);
            this.tabsContentGroup.appendChild(tabContentWrapper);

            this.appendChild(this.tabsLabelGroup);
            this.appendChild(this.tabsContentGroup);

            this.scrollBehavior();

          } else {
            this.insertBefore(this.tabsLabelGroup, tabs[0]);
          }

        }

      },

      scrollBehavior: function () {

        var tabLabels = this.querySelectorAll('ro-tabs-labels ro-tab-label');
        var tabs = this.querySelectorAll('ro-tab');
        var tabsWidth = this.getAttribute('tabwidth');
        var addedTabs = this.querySelectorAll('ro-tab-label');
        var wrapper = this.querySelector('.roTabLabelsWrapper');
        var cWrapper = this.querySelector('.roTabContentWrapper');
        var scrollE = this.querySelector('ro-tabs-labels');
        var contScrE = this.querySelector('ro-tabs-contents');
        var scrollContentOptions = {
          scrollbars: false,
          scrollX: true,
          scrollY: false,
          mouseWheel: false,
          disableMouse: false,
          disablePointer: true,
          disableTouch: true,
          probeType: 1,
          click: true,
          snap: true,
          preventDefault: true
        };

        if (tabsWidth) {

          var all = 0,
              allContent = addedTabs.length * window.innerWidth;

          for (var i = 0; i < addedTabs.length; i++) {
            all += addedTabs[i].getBoundingClientRect().width;
          }

          wrapper.style.width = all + 'px';
          cWrapper.style.width = allContent + 'px';

          setTimeout(function setTimeoutTabIScroll(scope, e, contentE, tabs) {

            return function setTimeoutTabIScrollReturn () {

              scope.myScroll = new IScroll(e, {
                scrollbars: false,
                scrollX: true,
                scrollY: false,
                mouseWheel: false,
                probeType: 1,
                click: true,
                preventDefault: true,
                snap: 'ro-tab-label'
              });

              if (Ro.Environment.platform.isWPhone) {
                scrollContentOptions.disableMouse = true;
              }

              scope.contentScroll = new IScroll(contentE, scrollContentOptions);

              scope.contentScrollTab = {};

              for (var i = 0; i < tabs.length; i++) {
                setTimeout ((function (scope, i, tab) {
                  scope.contentScrollTab[i + 'scroll'] = new IScroll(tab, {
                    scrollbars: false,
                    scrollX: false,
                    scrollY: true,
                    mouseWheel: false,
                    disableMouse: false,
                    disablePointer: true,
                    disableTouch: false,
                    probeType: 1,
                    click: true,
                    snap: false,
                    preventDefault: true
                  });
                }(scope, i, tabs[i])), 100);
              }

              scope.myScroll.on('scroll', function () {
                // do something
              });

              scope.myScroll.on('scrollEnd', function () {
                this.tabClickCallback(this.eligibleTab());
              }.bind(scope));

            }

          }(this, scrollE, contScrE, tabs), 100);

        }

      },

      tabClickCallback: function (label) {

        var roTabs, tab;
        var parentNode = label.parentNode;

        if (parentNode) {

          roTabs = label.parentNode.parentNode.parentNode;

          if (roTabs.tagName !== "RO-TABS") {
            roTabs = label.parentNode.parentNode;
          }

          tab = roTabs.querySelector('ro-tab[tabindex="' + label.getAttribute('tabindex') + '"]');

          this.setActive(label, tab);
        }

      },

      setActive: function (tabLabel, tab) {

        var tabsWidth = this.getAttribute('tabwidth');

        if (tabsWidth) {
          this.scrollToTab(tabLabel);
        }

        this.hideOtherTabs();

        tabLabel.setAttribute('selected', true);
        tab.setAttribute('selected', true);

        tab.style.display = 'block';

      },

      hideOtherTabs: function () {

        var tabsLabels = this.querySelectorAll('ro-tab-label');
        var tabs = this.querySelectorAll('ro-tab');

        for (var i = 0; i < tabsLabels.length; i++) {
          tabsLabels[i].removeAttribute('selected');
          tabs[i].removeAttribute('selected');
        }

      },

      getActive: function () {

        var tab = this.querySelector('ro-tab-label[selected="true"]');

        if (!tab) {
          tab = this.querySelector('ro-tab-label[tabindex="0"]');
        }

        return tab;

      },

      goToNextTab: function () {
        var active = this.getActive ();
        var nextTab = active.nextElementSibling;

        if (nextTab) {
          this.tabClickCallback (nextTab);
        }
      },

      goToPreviousTab: function () {
        var active = this.getActive ();
        var previusTab = active.previousElementSibling;

        if (previusTab) {
          this.tabClickCallback (previusTab);
        }
      },

      scrollToTab: function (tab) {

        var tabBouding = tab.getBoundingClientRect();
        var parentWidth = tab.parentNode.getBoundingClientRect().width;
        var activeTab = this.getActive();
        var activeTabBouding = activeTab.getBoundingClientRect();
        var i = parseInt(tab.getAttribute('tabindex'));
        var whereToGo = tabBouding.width * i - parseInt(tabBouding.width / 3);
        var coefficient = -1;

        if (whereToGo < 0) {
          whereToGo = 0;
        }

        if (whereToGo + tabBouding.width + parseInt(tabBouding.width / 3) === parentWidth) {
          whereToGo = (tabBouding.width * i) - (window.innerWidth - tabBouding.width);
        }

        if (tabBouding.left > 0 && tabBouding.left < activeTabBouding.left) {
          coefficient = 1;
        }

        if (activeTab.getAttribute('tabindex') !== tab.getAttribute('tabindex')) {
          setTimeout(function (scope, left, c, i) {
            return function () {
              scope.myScroll.scrollTo(left * c, 0, 300);
              scope.contentScroll.scrollTo(i * window.innerWidth * c, 0, 300);
            };
          }(this, whereToGo, coefficient, i), 100);
        }

      },

      eligibleTab: function () {

        var tabsLabels = this.querySelectorAll('ro-tab-label');
        var width = window.innerWidth;
        var position = {};

        for (var i = 0; i < tabsLabels.length; i++) {

          position = tabsLabels[i].getBoundingClientRect();

          if (position.left > 0 && position.right < width) {
            return tabsLabels[i];
          }

        }

        return false;

      },

      getTabLabelTemplate: function () {

        var template = this.querySelector('ro-tab-label-template');

        if (template) {

          this.xtag.template = template.cloneNode(true);
          this.xtag.labelTemplate = template.innerHTML;
          this.labelTemplate = template.innerHTML;
        }

      },

      setTabLabelData: function (data) {

        var tabLabelTemplate = this.xtag.labelTemplate;
        var tabLabels = this.querySelectorAll('ro-tab-label');

        for (var i = 0; i < tabLabels.length; i++) {
          xtag.innerHTML (tabLabels[i], Ro.templateEngine(tabLabelTemplate, data[i]));
        }

      },

      removeTabByIndex: function (index) {

        var tabLabel = this.querySelector('ro-tab-label[tabindex="' + index + '"]');
        var tab = this.querySelector('ro-tab[tabindex="' + index + '"]');
        var tabWrapper = this.querySelector('div.roTabContentWrapper');
        var labelWrapper = this.querySelector('div.roTabLabelsWrapper');
        var activeTabBouding = tabLabel.getBoundingClientRect();

        tabLabel.parentNode.removeChild(tabLabel);
        tab.parentNode.removeChild(tab);

        var remainingTabLabels = this.querySelectorAll('ro-tab-label');
        var remainingTabs = this.querySelectorAll('ro-tab');

        for (var i = 0; i < remainingTabs.length; i++) {
          remainingTabs[i].setAttribute('tabindex', i);
          remainingTabLabels[i].setAttribute('tabindex', i);
        }

        labelWrapper.style.width = remainingTabs.length * activeTabBouding.width + 'px';
        tabWrapper.style.width = remainingTabs.length * window.innerWidth + 'px';

        this.setActive(remainingTabLabels[0], remainingTabs[0]);

        try {
          this.contentScroll.refresh();
          this.myScroll.refresh();
        }
        catch (err) {
          // do something
        }

      }
    }
  });

})();
(function () {

    xtag.register('ro-title', {
        lifecycle: {
            created: function () {
            },
            inserted: function () {
            },
            removed: function () {
            }
        },
        events: {},
        accessors: {},
        methods: {}
    });

})();
(function () {

    xtag.register('ro-view', {
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