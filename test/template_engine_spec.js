describe('Template engine tests', function () {

	it('Should replace string', function () {

		var template = '{{id}}';
		var renderedTemplate = Ro.templateEngine(template, {
			id: 'hello!'
		});

		expect(renderedTemplate).toBe('hello!');

	});

	it('Should replace a object key', function () {

		var template = '{{test.id}}';
		var renderedTemplate = Ro.templateEngine(template, {
			test: {
				id: 2
			}
		});

		expect(renderedTemplate).toBe('2');

	});

});