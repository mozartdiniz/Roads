/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 5/27/13
 * Time: 8:10 PM
 */

/**
 * Roads is a framework for mobile web apps development
 */

(function(){

    var Ro = Ro || {};

    Ro.version = '0.1';

    Ro.Utils = {

        CallBackManager: function (request, options) {

            if (typeof options !== 'undefined') {

                if (typeof options.success !== 'undefined') {
                    request.success = options.success;
                }

                if (typeof options.error !== 'undefined') {
                    request.error = options.error;
                }
            }

            return this;
        },

        FindRoute: function () {

            var hash = window.location.hash;
            var rex;

            for (var key in window.Ro.routeList) {
                if (typeof window.Ro.routeList[key] !== 'function') {

                    rex = new RegExp(key);

                    if (hash.match(rex)) {
                        Ro.Utils.CallRouterFunction(hash, window.Ro.routeList[key]);
                    }
                }
            }

        },

        CallRouterFunction: function (hash, routeListItem) {

            var parameters = hash.match(/(\/\w+\/)|\/\w+$/g);

            if(parameters !== null) {
                parameters = parameters.map(function(x){
                    return x.replace("/", "").replace("/", "");
                });
            }

            if (parameters) {
                routeListItem.referencedFunction.apply(this, parameters);
            } else {
                routeListItem.referencedFunction();
            }

        },

        AddRouterListeners: function () {

            window.addEventListener('hashchange', Ro.Utils.FindRoute, false);

        }
    };

    /**
     * Ro.Ajax is a code wrapper for native XMLHttpRequests,
     * this make more comfortable do requests to server
     *
     * @constructor
     */
    Ro.Ajax = function () {

        // set defaults
        this.url         = '';
        this.method      = 'get';
        this.async       = true;
        this.data        = null;
        this.contentType = 'application/json';

        //callback for success
        this.success     = null;
        this.timeout     = Ro.globals.defaultTimeout;
        this.ontimeout   = null;
        this.roSuccess   = null;

        //callback for error
        this.error       = null;

        // do request
        this.send = function() {

            var request = new XMLHttpRequest();

            request.open(this.method, this.url, this.async);
            request.setRequestHeader('Content-Type', this.contentType);
			request.setRequestHeader('Cookie', window.cookie);

            //closure
            request.onreadystatechange = (function (scope) {
                return function () {
                    scope.sendCallback(this, scope);
                };
            })(this);

            request.ontimeout = (function (scope) {
                return function () {
                    scope.ontimeout(this, scope);
                };
            })(this);

            request.send(this.data);

            this.dropConnection = setTimeout((function(request){
                return function () {
                    request.abort();
                }
            })(request), Ro.globals.defaultTimeout);

        };

        this.sendCallback = function (xhr, scope) {

            if (xhr.readyState === 4) {

                if (xhr.status === 200) {

                    //clearInterval(scope.dropConnection);

                    if (scope.roSuccess) {
                        scope.roSuccess(JSON.parse(xhr.responseText), xhr);
                    }

                    if (scope.success) {
                        scope.success(JSON.parse(xhr.responseText), xhr);
                    }

                } else {

                    if (scope.error) {
                        scope.error(xhr);
                    }

                }
            }

        };

    };

    /**
     *
     * Model definition
     *
     * @constructor
     */

    Ro.Model = function () {

        // this is a model unique identifier
        this.id = null;

        // custom get is a replacement to default get method
        this.customGet = null;

        this.url = null;

        // model name is used to make default RESTful
        // requests and to identify a model in store object
        this.name = null;

        //fields defines name and type for used fields
        // [{name: 'phone', type: 'string', data: '+55 85 33556677'}]
        this.fields = {};

        this.setName = function (name) {
            this.name = name;

            this.createUrl();
        };

        this.setFields = function (fields) {
            this.fields = fields;
        };

        // do validation before create and update
        this.validate = function () {

            return {
                isValid: true,
                messages: []
            };
        };

        this.select = function (field) {

            var data;

            data = this.fields[field].data;

            return data;

        };

        this.getFieldType = function (field) {

            return this.fields[field].type

        };

        this.selectAll = function () {

            var filteredFields = {};

            for (var key in this.fields) {
                if (typeof this.fields[key] !== 'function') {

                    filteredFields[key] = this.fields[key].data;

                }
            }

            return filteredFields;
        };

        this.set = function (data) {

            for (var key in this.fields) {
                if (typeof data[key] !== 'function') {
                    if (typeof data[key] !== 'undefined') {

                        this.fields[key].data = data[key];

                        if (key === 'id') {
                            this.id = data[key];
                        }
                    }
                }
            }

        };

        // get data from server
        this.get = function (options) {

            if(this.customGet) {
                this.customGet(options);
            } else {
                this.defaultGet(options);
            }

        };

        this.defaultGet = function (options) {

            var getRequest;

            getRequest = new Ro.Ajax();

            getRequest.url = this.url;

            Ro.Utils.CallBackManager(getRequest, options);

            getRequest.roSuccess = function (scope) {

                return function (data) {

                    scope.set(data);

                    scope.addToStore();

                };

            }(this);

            getRequest.send();

            return true;

        };

        this.createUrl = function () {

            this.url = (this.id) ? this.name + '/' + this.id : this.name;

        };

        // send post with fields in request body
        this.save = function (options) {

            var validation = this.validate();
            var saveRequest;

            if (validation.isValid) {

                saveRequest = new Ro.Ajax();

                if (this.id) {
                    saveRequest.url = this.name + '/' + this.id;
                    saveRequest.method = 'put';
                } else {
                    saveRequest.url = this.name;
                    saveRequest.method = 'post';
                }

                Ro.Utils.CallBackManager(saveRequest, options);

                saveRequest.roSuccess = function (scope) {

                    return function (data) {

                        scope.set(data);

                        Ro.Store.set(scope.name, data);

                    };

                }(this);


                saveRequest.data = JSON.stringify(this.selectAll());
                saveRequest.send();

                return true;

            }

            return validation.messages;

        };

        // add id to url and sent delete request to server
        this.destroy = function (options) {

            var delRequest = new Ro.Ajax();

            if(this.id) {

                Ro.Utils.CallBackManager(delRequest, options);

                delRequest.url    = this.name + '/' + this.id;
                delRequest.method = 'delete';

                delRequest.roSuccess = function (scope) {

                    return function () {

                        scope.deleteFromStore();

                    };

                }(this);

                delRequest.send();

                return true;

            }

            return false;

        };

        this.addToStore = function () {

            if(this.name) {

                if (typeof window.Ro.Store.data[this.name] === 'undefined') {
                    window.Ro.Store.data[this.name] = {};
                }

                if (typeof this.id !== 'undefined' && this.id !== null) {
                    window.Ro.Store.data[this.name][this.id] = this;
                }

                if (typeof window.Ro.Store.models[this.name] === 'undefined') {
                    window.Ro.Store.models[this.name] = this;
                }

            } else {
                console.log('Can register model to Store without model name');
            }

        };

        this.destroyFromStore = function () {

            if(this.name) {

                if (typeof window.Ro.Store.data[this.name] === 'undefined') {
                    delete window.Ro.Store.data[this.name];
                }

            } else {
                console.log('Can delete model to Store without model name');
            }

        };

    };

    /**
     * Store definition
     * @constructor
     */

    Ro.Store = function () {

        this.data = {};
        this.models = {};

        this.selectAll = function (modelName) {

            return this.data[modelName];

        };

        this.selectById = function (modelName, id) {

            var allData = this.data[modelName];

            if (typeof allData === 'undefined') {
                return false;
            } else {
                if (typeof this.data[modelName][id] === 'undefined') {
                    return false;
                } else {
                    return this.data[modelName][id];
                }
            }

        };

        this.set = function (modelName, data) {

            var storedData     = this.selectAll(modelName);
            var dataLength     = data.length;
            var id;

            if (typeof storedData === 'undefined') {

                Ro.Store.data[modelName] = {};

            }

            if (data instanceof Array) {

                for(var i = 0; i < dataLength; i++) {

                    id = data[i].id;
                    Ro.Store.data[modelName][id] = new Ro.Store.models[modelName]();
                    Ro.Store.data[modelName][id].set(data[i]);

                }

            } else {

                id = data.id;
                Ro.Store.data[modelName][id] = new Ro.Store.models[modelName]();
                Ro.Store.data[modelName][id].set(data);

            }

        };


        this.find = function (modelName, object) {

            var allData      = this.selectAll(modelName);
            var modelsFound  = [];
            var currentModel, machResult;

            for(var id in allData) {

                if (typeof id !== 'function') {

                    if (typeof allData[id] !== 'undefined') {

                        currentModel = allData[id];

                        for (var key in object) {

                            if (typeof object[key] !== 'undefined') {

                                switch (currentModel.getFieldType(key)) {
                                    case "string":
                                        machResult = currentModel.select(key).match(object[key]);
                                        break;
                                    default:
                                        machResult = currentModel.select(key) === object[key];
                                        break;
                                }

                                if (machResult !== null && machResult !== false) {
                                    modelsFound.push(currentModel);
                                }

                            }

                        }

                    }

                }

            }

            return modelsFound;

        };

        this.sort = function (modelName, key) {

            var orderedData = [];

            var compare = function (a, b) {

                if (a[key] < b[key]) {
                    return -1;
                }

                if (a[key] > b[key]) {
                    return 1;
                }

                return 0;
            };

            for(var i in this.data[modelName]) {
                if (typeof this.data[modelName][i] !== 'undefined') {
                    orderedData.push(this.data[modelName][i]);
                }
            }

            orderedData.sort(compare);

            return orderedData;


        };

        this.get = function (modelName, options) {

            var model = new this.models[modelName]();
            var url   = model.url;
            var getRequest;

            getRequest = new Ro.Ajax();

            getRequest.url = url;

            Ro.Utils.CallBackManager(getRequest, options);

            getRequest.roSuccess = function (scope, modelName) {

                return function (data) {

                    scope.set(modelName, data);

                };

            }(this, modelName);

            getRequest.send();

            return true;

        };

        this.addModel = function(model) {

            var m = new model();

            this.models[m.name] = model;

        };


    };

    Ro.Controller = function () {

        this.routes = {};

        /**
         * Records the url which will call functions
         */
        this.setRoutes = function () {

            for (var key in this.routes) {
                if(typeof this.routes[key] === 'function') {
                    this.addRoute(key, this.routes[key]);
                }
            }

        };

        this.addRoute = function (key, referencedFunction) {

            this.saveRoute(key, referencedFunction);

        };

        this.saveRoute = function (key, referencedFunction) {

            var routePatterns = key.replace(/\//g, "\\/").replace(/(\(\?)?:\w+/gi, "\\w+") + "$";

            var objToSave = {
                fullRoute: key,
                referencedFunction: referencedFunction
            };

            window.Ro.routeList[routePatterns] = objToSave;

        };

    };

    Ro.ViewsManager = function () {

        this.putViewsInPosition = function () {

            var views = window.Ro.viewsList;

            for (var view in views) {
                if (typeof views[view] !== 'function') {

                    if (views[view].show === true) {
                        this.showView(view);
                    } else {
                        this.hideView(view);
                    }

                }
            }

        };

        this.showView = function (viewName) {

            var views = window.Ro.viewsList;

            views[viewName].el.style.left = '0';
            views[viewName].el.style.top  = '0';

        };

        this.hideView = function (viewName) {

            var views = window.Ro.viewsList;

            views[viewName].el.style.left = document.documentElement.clientWidth * 10 + 'px';
            views[viewName].el.style.top  = document.documentElement.clientHeight * 10 + 'px';

        };

        this.toggleViewVisibility = function (viewName) {

            var views = window.Ro.viewsList;

            for (var view in views) {
                if (typeof views[view] !== 'function') {

                    if (view === viewName) {
                        views[view].show = true;
                    } else {
                        views[view].show = false;
                    }
                }
            }

        };

        this.prepareToSlide = function (previusView, direction) {

            var views = window.Ro.viewsList;

            for (var view in views) {
                if (typeof views[view] !== 'function') {

                    if (views[view].show) {

                        views[view].el.style.webkitAnimation = '';
                        views[view].el.style.MozAnimation = '';
                        views[view].el.style.zIndex = 3;

                        switch (direction) {
                            case 'left':
                                views[view].el.style.left  = document.documentElement
                                                                        .clientWidth + 'px';
                                views[view].el.style.right = '';
                                views[view].el.style.top   = 0 + 'px';
                                break;
                            case 'right':
                                views[view].el.style.right = document.documentElement
                                                                        .clientWidth + 'px';
                                views[view].el.style.left  = '';
                                views[view].el.style.top  = 0 + 'px';
                                break;
                            case 'bottom':
                                views[view].el.style.left = 0 + 'px';
                                views[view].el.style.right = '';
                                views[view].el.style.top  = document.documentElement
                                                                        .clientHeight + 'px';
                                break;
                            default:
                                views[view].el.style.left = document.documentElement
                                                                        .clientWidth + 'px';
                                views[view].el.style.top  = 0 + 'px';
                                views[view].el.style.right = '';
                                break;
                        }

                    } else {

                        views[view].el.style.left = '0px';
                        views[view].el.style.top  = '0px';

                        views[view].el.style.webkitAnimation = '';
                        views[view].el.style.MozAnimation = '';

                        if (view === previusView) {
                            views[view].el.style.zIndex = 2;
                        } else {
                            views[view].el.style.zIndex = 1;
                        }

                    }

                }
            }

        };

        this.slideView = function (viewName, direction) {

            var views = window.Ro.viewsList;

            if (typeof direction === 'undefined') {
                direction = 'none';
            }

            switch (direction) {
                case 'left':
                    views[viewName].el.style.webkitAnimationDuration = '200ms';
                    views[viewName].el.style.webkitAnimationName = 'slideScreen';

                    views[viewName].el.style.MozAnimationDuration = '200ms';
                    views[viewName].el.style.MozAnimationName    = 'slideScreen';
                    break;
                case 'right':
                    views[viewName].el.style.webkitAnimationDuration = '200ms';
                    views[viewName].el.style.webkitAnimationName = 'slideScreenRight';

                    views[viewName].el.style.MozAnimationDuration = '200ms';
                    views[viewName].el.style.MozAnimationName    = 'slideScreenRight';
                    break;
                case 'bottom':
                    views[viewName].el.style.webkitAnimationDuration = '200ms';
                    views[viewName].el.style.webkitAnimationName = 'slideScreenBottom';

                    views[viewName].el.style.MozAnimationDuration = '200ms';
                    views[viewName].el.style.MozAnimationName    = 'slideScreenBottom';
                    break;
                default:
                    views[viewName].el.style.webkitAnimationDuration = '1ms';
                    views[viewName].el.style.webkitAnimationName = 'slideScreen';

                    views[viewName].el.style.MozAnimationDuration = '1ms';
                    views[viewName].el.style.MozAnimationName    = 'slideScreen';
                    break;
            }



        };

        this.getCurrentActiveViewName = function() {

            var views = window.Ro.viewsList;

            for (var view in views) {
                if (typeof views[view] !== 'function') {

                    if (views[view].show) {

                        return view;

                    }

                }
            }

        };

        this.slideToView = function (viewName, direction) {

            var views = window.Ro.viewsList;
            var currentView = this.getCurrentActiveViewName();

            this.toggleViewVisibility(viewName);
            this.prepareToSlide(currentView, direction);
            this.slideView(viewName, direction);

        };

        this.goToView = function (viewName) {

            var views = window.Ro.viewsList;
            var currentView = this.getCurrentActiveViewName();

            this.toggleViewVisibility(viewName);
            this.prepareToSlide(currentView);
            this.slideView(viewName);

        };

        this.toggleView = function (viewName, createMethod, updateMethod) {

            var x  = document.querySelector("div[screenname='" + viewName + "']");
            var xs = document.querySelectorAll(".screen");

            for (var i = 0; i < xs.length; i++) {
                xs[i].style.display = 'none';
                xs[i].style.zIndex = 1;
            }

            if(x !== null) {
                x.style.display = 'block';
                x.style.zIndex = 3;
            } else {
                createMethod();
            }

        };

    };

    /**
     *
     * @param screenName Will be used to identify your scren in screenLists
     * @param visible if true, view will be displayed before created
     * @constructor
     */
    Ro.View = function (screenName) {

        var roViewManager = new Ro.ViewsManager();

        this.el    = null;
        this.stage = null;

        if (typeof screenName === 'undefined') {
            this.name = 'view_' + parseInt(Math.random(9)*100, 10);
        } else {
            this.name = screenName;
        }

        this.createBaseStructure = function () {

            var baseDiv                   = document.createElement('div');
            var baseSection               = document.createElement('section');
            var baseSectionDefaultContent = document.createElement('section');

            this.stage = baseSectionDefaultContent;

            baseDiv.className = 'screen';
			baseDiv.id = screenName;
            baseDiv.setAttribute('screenName', screenName);

            baseSection.className = 'view';
            baseSectionDefaultContent.className = 'scroll';

            baseSection.appendChild(baseSectionDefaultContent);
            baseDiv.appendChild(baseSection);

            if (Ro.environment.browser.isOldAndroid === false) {
                baseSectionDefaultContent.style.top = '44px';
            }

            this.el = baseDiv;

            Ro.viewsList[screenName] = {
                show: false,
                el: this.el
            };

            document.body.appendChild(baseDiv);

        };

        this.addHeader = function (title) {

            var header  = document.createElement('header');
            var hGroup  = document.createElement('hgroup');
            var span    = document.createElement('span');
            var lImtem  = document.createElement('hgroup');
            var rImtem  = document.createElement('hgroup');

            lImtem.className = 'leftItem';
            rImtem.className = 'rightItem';

            var section = null;

            hGroup.className = 'centerItem';
            hGroup.appendChild(span);

            header.appendChild(lImtem);
            header.appendChild(hGroup);
            header.appendChild(rImtem);

            section = this.el.querySelector('section.view > section');
            section.parentNode.insertBefore(header, section);

            if (title !== 'undefined') {
                this.setHeaderTitle(title);
            }

        };

        this.setHeaderTitle = function (title) {

            var hTContainer = this.el.querySelector('header hgroup span');
            var titleEl = document.createTextNode(title);

            hTContainer.appendChild(titleEl);

        };

        this.addHeaderButton = function(obj) {

            var btn      = document.createElement('div');
            var btnPlace = this.getBtnPlace(obj.type);
            btn.className = this.getBtnClassName(obj.type);

            if (typeof obj.customClass !== 'undefined') {

                btn.className += ' ' + obj.customClass;

            }

            btn.setAttribute('data-title', obj.text);

            if (typeof obj.onClick !== 'undefined') {

                if(Ro.environment.isTouchDevice) {
                    if(Ro.environment.isOldAndroid) {
                        btn.addEventListener('mousedown', obj.onClick);
                    } else {
                        btn.addEventListener('touchstart', obj.onClick);
                    }
                } else {
                    btn.addEventListener('click', obj.onClick);
                }

            }

            btnPlace.appendChild(btn);

        };

        this.getBtnClassName = function (type) {

            switch (type) {
                case 'leftNav':
                    return 'left';
                case 'rightNav':
                    return 'right';
                case 'leftButton':
                    return 'button';
                case 'rightButton':
                    return 'button';
                default:
                    return 'button';
            }

        };

        this.getBtnPlace = function (type) {

            switch (type) {
                case 'leftNav':
                    return this.el.querySelector('header > hgroup.leftItem');
                case 'rightNav':
                    return this.el.querySelector('header > hgroup.rightItem');
                case 'leftButton':
                    return this.el.querySelector('header > hgroup.leftItem');
                case 'rightButton':
                    return this.el.querySelector('header > hgroup.rightItem');
                default:
                    return this.el.querySelector('header > hgroup.leftItem');
            }
        };


        this.addFooter = function () {

            var footer  = document.createElement('footer');
            var section = this.el.querySelector('section.view');

            section.appendChild(footer);

        };

        this.init = function () {
            this.createBaseStructure();
        };

        this.init();

    };

    window.Ro = Ro;

    window.Ro.Store = new Ro.Store();
    window.Ro.routeList = {};
    window.Ro.viewsList = {};
    window.Ro.globals   = {};

    window.Ro.globals.defaultTimeout = 500;

    window.Ro.Utils.AddRouterListeners();

    window.Ro.environment = {
        isTouchDevice: !!('ontouchstart' in window),
        browser: {
            isOldAndroid: navigator.userAgent.match('Android 2.3') === null ? false : true,
            isModernAndroid: navigator.userAgent.match('Android 4') === null ? false : true,
            isIPhone: navigator.userAgent.match('iPhone OS') === null ? false : true
        }
    };




})();