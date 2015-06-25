describe('Template filters', function () {

	it('Should format date with american date format', function () {

		var template = '{{date | date}}';
		var renderedTemplate = Ro.templateEngine(template, {
			date: new Date('2015-06-03')
		});

		expect(renderedTemplate).toBe('06/03/2015');

	});

	it('Should return only the time part of date time', function () {

		var template = '{{date | time}}';
		var renderedTemplate = Ro.templateEngine(template, {
			date: new Date('2015-06-25T01:05:55.973Z')
		});

		expect(renderedTemplate).toBe('21:05');

	});

	it('Should translate resource', function () {

		Ro.i18n.translations['hello.world'] = 'Olá Mundo!';

		var template = '{{hello.world | i18n}}';
		var renderedTemplate = Ro.templateEngine(template);

		expect(renderedTemplate).toBe('Olá Mundo!');

	});

	it('Should change decimal symbol from . to ,', function () {

		var template = '{{money | float}}';
		var renderedTemplate = Ro.templateEngine(template, {
			money: '1234.56'
		});

		expect(renderedTemplate).toBe('1234,56');

	});

});