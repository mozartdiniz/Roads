var Ro = Ro || {};

/**
 * Controllers are simples classes that are be used to manipulates view layouts, if you need get new data from
 * a REST service you will add a function with this call in a controller, that will pass the data for the
 * Road component TAG. If you need a user interaction, you will implement a function in controller and call the
 * specific method from a view tag.
 *
 *
 * @param {string} controllerID
 * @param {object} methods
 * @returns {Function}
 *
 * @constructor
 */

Ro.Controller = function (controllerID, methods) {

	var Controller = function () {

	};

	if (methods) {
		for (key in methods) {
			Controller.prototype[key] = methods[key];
		}
	}

	return function (viewID) {

		Ro.controllers[controllerID] = new Controller ();

		if (viewID) {

			Controller.prototype.viewID = viewID;
			Controller.prototype.view   = Ro.views[viewID].dom;
			Ro.views[viewID].controller = Ro.controllers[controllerID];

		}

		Ro.controllers[controllerID].init ();

	}

};