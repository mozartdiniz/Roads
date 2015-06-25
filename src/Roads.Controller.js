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