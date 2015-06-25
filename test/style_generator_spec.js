describe('Style generator tests', function () {

	it('Should generate styles', function () {

		var e = document.createElement('div');

		e.style.cssText = Ro.styleGenerator({
			border: '1px solid red',
			color: 'red',
			'font-size': '12px'
		});

		expect(e.style.color).toBe('red');
		expect(e.style.border).toBe('1px solid red');
		expect(e.style.fontSize).toBe('12px');

	});

});