var Ro = Ro || {};

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
	translations: {},
	translateView: function (view) {

		var elements = view.querySelectorAll('[i18n]');
		for (var i = elements.length - 1; i >= 0; i--) {
			this.translateElement (elements[i]);
		}
	},
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

	getTranslationByKey : function(key){

		var value = Ro.i18n.translations[key];

		if (value){
			return value;
		}

		return key;
	},

	getTranslationByKeyOrAlternative : function (resourceId, alternativeValue){

		var message = Ro.i18n.getTranslationByKey (resourceId);

		if (alternativeValue && message === resourceId) {
			return alternativeValue;
		}

		return message;
	}

};