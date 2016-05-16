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

            saveAddView: function (view) {

                howManyScreensCanLeft = 0;

                if (RoApp.firstChild.childNodes.length > howManyScreensCanLeft) {
                    if (RoApp.firstChild.childNodes[0].id !== view.id) {
                        RoApp.firstChild.removeChild(RoApp.firstChild.childNodes[0]);
                    }
                }

                RoApp.firstChild.appendChild (xtag.clone (view));
            },

            putViewsInFirstPosition: function () {

                var views = document.querySelectorAll('ro-view:not([mainPage])');
                var firstView = document.querySelector('ro-view[mainPage]');

                if (firstView) {

                    Ro.i18n.translateView(firstView);

                    if (Ro.Environment.platform.isAndroid) {
                        firstView.setAttribute('animation', 'to');
                    } else {
                        firstView.style.zIndex = 1;
                        firstView.style.webkitTransition = '10ms';
                        firstView.style.transition = '10ms';
                        firstView.style.webkitTransform = 'translateX(0)';
                        firstView.style.transform = 'translateX(0)';
                    }

                    RoApp.activeView = firstView.id;
                }

                if (views) {
                    if (Ro.Environment.platform.isAndroid) {
                        for (var i = 0, l = views.length; i < l; i++) {
                            views[i].setAttribute('animation', 'from');
                        }
                    } else {
                        for (var i = 0, l = views.length; i < l; i++) {

                            views[i].style.zIndex = 2;
                            views[i].style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
                            views[i].style.transform = 'translateX(' + window.innerWidth + 'px)';
                            views[i].style.webkitTransition = '10ms';
                            views[i].style.transition = '10ms';

                        }
                    }
                }


            },

            showController: function (controller) {

                console.log ('controller.viewID: ' + controller.viewID);

                if (!controller) {
                    throw 'controller object is mandatory';
                }

                var from = document.getElementById(RoApp.activeView);
                var toController = controller;

                var appendedTo = document.getElementById(controller.viewID);

                if (!appendedTo) {
                    this.saveAddView (controller.view);
                }

                if (controller.show) {
                    controller.show (from);
                }

                if (Ro.Environment.platform.isWPhone) {
                    toController.view.style.cssText = Ro.styleGenerator ({
                        'transition': '200ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(0)',
                        'transform': 'translateX(0)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    toController.view.style.transition = '300ms';
                    toController.view.style.transitionTimingFunction = 'linear';
                    toController.view.style.webkitTransform = 'translateX(0)';
                    toController.view.style.transform = 'translateX(0)';
                } else {
                    toController.view.setAttribute('animation', 'to');
                }

                if (Ro.Environment.platform.isWPhone) {
                    from.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(-' + window.innerWidth + 'px)',
                        'transform': 'translateX(-' + window.innerWidth + 'px)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    from.style.transition = '300ms';
                    from.style.transitionTimingFunction = 'linear';
                    from.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px)';
                    from.style.transform = 'translateX(-' + window.innerWidth + 'px)';
                } else {
                    from.setAttribute('animation', 'from');
                }

                Ro.i18n.translateView(toController.view);

                setTimeout ((function (to) {
                    return function () {
                        to.style.zIndex = 2;
                    };
                }(toController.view)), 50);

                this.activeView = toController.viewID;

            },

            gotoView: function (fromID, toID) {

                var toController   = Ro.views[toID].controller,
                    fromController = Ro.views[fromID].controller;


                console.log ('from: ' + fromID + ' -> ' + toID);

                var toView = Ro.views[toID].dom;

                appendedTo = document.getElementById(toID);

                if (fromController.beforeDelete) {
                    fromController.beforeDelete ();
                }

                if (!appendedTo) {
                    toController.view = toView;
                    this.saveAddView (toView);
                }

                if (!fromController.view) {
                    throw 'ro-view: "From" view can not be found';
                }

                if (!toController.view) {
                    throw 'ro-view: "To" view can not be found';
                }

                if (fromID === toID) {
                    throw 'ro-view: "To" and "From" can not be the same';
                }

                var roMenus = document.querySelectorAll('ro-float-menu');

                if (roMenus && roMenus.length) {
                    for (var i = 0, l = roMenus.length; i<l; i++) {
                        roMenus[i].hideItems();
                    }
                }

                if (toController.show) {
                    toController.show(fromID);
                }

                if (Ro.Environment.platform.isWPhone) {
                    toController.view.style.cssText = Ro.styleGenerator ({
                        'transition': '200ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(0)',
                        'transform': 'translateX(0)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    toController.view.style.transition = '300ms';
                    toController.view.style.transitionTimingFunction = 'linear';
                    toController.view.style.webkitTransform = 'translateX(0)';
                    toController.view.style.transform = 'translateX(0)';
                } else {
                    toController.view.setAttribute('animation', 'to');
                }

                if (Ro.Environment.platform.isWPhone) {
                    fromController.view.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(-' + window.innerWidth + 'px)',
                        'transform': 'translateX(-' + window.innerWidth + 'px)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    fromController.view.style.transition = '300ms';
                    fromController.view.style.transitionTimingFunction = 'linear';
                    fromController.view.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px)';
                    fromController.view.style.transform = 'translateX(-' + window.innerWidth + 'px)';
                } else {
                    fromController.view.setAttribute('animation', 'from');
                }

                Ro.i18n.translateView(toController.view);

                setTimeout ((function (to, from) {
                    return function () {
                        to.style.zIndex = 2;
                        from.style.zIndex = 3;
                    };
                }(toController.view, fromController.view)), 50);

                this.activeView = toID;

                if (Ro.views[fromID] && Ro.views[fromID].dom) {
                    Ro.views[fromID].dom.setAttribute('background', 'true');
                }

                if (Ro.views[toID] && Ro.views[toID].dom) {
                    Ro.views[toID].dom.setAttribute('background', 'false');
                }

            },

            backtoView: function (fromID, toID) {

                console.log ('from: ' + fromID + ' -> ' + toID);

                var toController   = Ro.views[toID].controller,
                    fromController = Ro.views[fromID].controller;

                var toView = Ro.views[toID].dom;

                appendedTo = document.getElementById(toID);

                if (fromController.beforeDelete) {
                    fromController.beforeDelete ();
                }

                if (!appendedTo) {
                    toController.view = toView;
                    this.saveAddView (toView);
                }

                if (!fromController.view) {
                    throw 'ro-view: "From" view can not be found';
                }

                if (!toController.view) {
                    throw 'ro-view: "To" view can not be found';
                }

                if (fromID === toID) {
                    throw 'ro-view: "To" and "From" can not be the same';
                }

                if (toController.show) {
                    toController.show(fromID);
                }

                if (Ro.Environment.platform.isWPhone) {
                    toController.view.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(0)',
                        'transform': 'translateX(0)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    toController.view.style.transition = '300ms';
                    toController.view.style.transitionTimingFunction = 'linear';
                    toController.view.style.webkitTransform = 'translateX(0)';
                    toController.view.style.transform = 'translateX(0)';
                } else {
                    toController.view.setAttribute('animation', 'to');
                }

                if (Ro.Environment.platform.isWPhone) {
                    fromController.view.style.cssText = Ro.styleGenerator ({
                        'transition': '300ms',
                        'transitionTimingFunction': 'linear',
                        'webkitTransform': 'translateX(-' + window.innerWidth + 'px)',
                        'transform': 'translateX(-' + window.innerWidth + 'px)'
                    });
                } else if (Ro.Environment.platform.isIOS) {
                    fromController.view.style.transition = '300ms';
                    fromController.view.style.transitionTimingFunction = 'linear';
                    fromController.view.style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
                    fromController.view.style.transform = 'translateX(' + window.innerWidth + 'px)';
                } else {
                    fromController.view.setAttribute('animation', 'from');
                }

                Ro.i18n.translateView(toController.view);

                setTimeout ((function (to, from) {
                    return function () {
                        to.style.zIndex = 3;
                        from.style.zIndex = 2;
                    };
                }(toController.view, fromController.view)), 50);

                this.activeView = toID;

                if (Ro.views[fromID] && Ro.views[fromID].dom) {
                    Ro.views[fromID].dom.setAttribute('background', 'true');
                }

                if (Ro.views[toID] && Ro.views[toID].dom) {
                    Ro.views[toID].dom.setAttribute('background', 'false');
                }

            }
        }
    });

})();