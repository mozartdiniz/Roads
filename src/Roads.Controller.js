var Ro = Ro || {};

Ro.Controller = function (viewID, methods) {

	var Controller = function () {

		this.view = document.querySelector ('[ro-controller="' + viewID + '"]');

		this.init ();

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