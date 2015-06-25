describe('RO-LIST tests', function () {

	it('Should parse list', function () {

		var data = [{
			description: 'a'
		}, {
			description: 'b'
		},{
			description: 'c'
		}];

		var div  = document.createElement ('div');
		div.innerHTML = '<ro-list><ro-item>{{description}}</ro-item></ro-list>';

		var roList = div.querySelector ('ro-list');

		roList.setData (data);

		expect(roList.childNodes.length).toBe(3);
		expect(roList.childNodes[0].innerHTML).toBe('<ro-item-content>a</ro-item-content>');

	});

});