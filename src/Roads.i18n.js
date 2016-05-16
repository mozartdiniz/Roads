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
            this.translateElement(elements[i]);
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

    getTranslationByKey: function (key) {

        var value = Ro.i18n.translations[key];

        if (value) {
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

    getTranslationByKeyOrAlternative: function (resourceId, alternativeValue) {

        var message = Ro.i18n.getTranslationByKey(resourceId);

        if (alternativeValue && message === resourceId) {
            return alternativeValue;
        }

        return message;
    }

};