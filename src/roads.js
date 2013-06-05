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

            if (typeof window.Ro.routeList[hash] !== 'undefined') {
                if (typeof window.Ro.routeList[hash] === 'function') {
                    window.Ro.routeList[hash]();
                }
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
        this.roSuccess   = null;

        //callback for error
        this.error       = null;

        // do request
        this.send = function() {

            var request = new XMLHttpRequest();

            request.open(this.method, this.url, this.async);
            request.setRequestHeader('Content-Type', this.contentType);

            //closure
            request.onreadystatechange = (function (scope) {
                return function () {
                    scope.sendCallback(this, scope);
                };
            })(this);

            request.send(this.data);

        };

        this.sendCallback = function (xhr, scope) {

            if (xhr.readyState === 4) {

                if (xhr.status === 200) {

                    if (scope.roSuccess) {
                        scope.roSuccess(JSON.parse(xhr.responseText));
                    }

                    if (scope.success) {
                        scope.success(JSON.parse(xhr.responseText));
                    }

                } else {

                    if (scope.error) {
                        scope.error(xhr.responseText);
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

        // model name is used to make default RESTful requests and to identify
        // a model in store object
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

            var defaultReturn = {
                isValid: true,
                messages: []
            };

            return defaultReturn;
        };

        this.select = function (field) {

            var data;

            data = this.fields[field].data;

            return data;

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

            } else {

                return validation.messages;

            }

        };

        // add id to url and sent delete request to server
        this.delete = function (options) {

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

        this.deleteFromStore = function () {

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

        this.selectAll = function (modelName) {

            return this.data[modelName];

        };

        this.set = function (modelName, data) {

            var storedData     = this.selectAll(modelName);
            var dataLength     = data.length;
            var id;

            if (typeof storedData === 'undefined') {

                Ro.Store.data[modelName] = {};

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

            } else {

                if (data instanceof Array) {

                    for(var j = 0; j < dataLength; j++) {

                        id = data[j].id;
                        storedData[id].set(data[j]);

                    }

                } else {

                    id = data.id;

                    if (typeof storedData[id] === 'undefined') {
                        storedData[id] = new Ro.Store.models[modelName]();
                    }

                    storedData[id].set(data);

                }
            }

        };


        this.find = function (modelName, object) {

            var allData      = this.selectAll(modelName);
            var modelsFound  = [];
            var currentModel;

            for(var id in allData) {

                if (typeof id !== 'function') {

                    if (typeof allData[id] !== 'undefined') {

                        currentModel = allData[id];

                        for (var key in object) {

                            if (typeof object[key] !== 'udnefined') {

                                if (currentModel.fields[key].data === object[key]) {
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

            window.Ro.routeList[key] = referencedFunction;

        };

    };

    Ro.View = function () {



    };

    window.Ro = Ro;

    window.Ro.Store = new Ro.Store();
    window.Ro.routeList = {};
    window.Ro.Utils.AddRouterListeners();

})();