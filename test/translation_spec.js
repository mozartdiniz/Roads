describe('Translation engine tests', function () {

	it('Should translate text', function () {

		var template = '<div>{{hello.world | i18n}}</div>';
		var renderedTemplate = Ro.templateEngine(template);

		expect(renderedTemplate).toBe('<div>Olá Mundo!</div>');

	});

	it('Should get i18nKey, translate it, and add as innerHTML', function () {

		var container = document.createElement('div');
		container.innerHTML = '<div i18n i18nKey="{{hello.world | i18n}}"></div>';

		var e = container.querySelector('div');

		Ro.i18n.translateElement(e);

		expect(e.innerHTML).toBe('Olá Mundo!');

	});

	it('Should get i81n value, translate it, and replace attribute value with a translated text', function () {


		var e = document.createElement('div');
		e.setAttribute('i18n', 'test');
		e.setAttribute('i18nKey', '{{hello.world | i18n}}');

		Ro.i18n.translateElement(e);

		expect(e.getAttribute('test')).toBe('Olá Mundo!');

	});

});