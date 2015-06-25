Todo.Controllers.Tasks = new Ro.Controller('tasks', {

	init: function () {

		this.allTasks = [{
			category_id: 1,
			id: 1,
			description: 'Call the boss and talk about my vacation'
		}, {
			category_id: 2,
			id: 20,
			description: 'Go to the gym'
		}, {
			category_id: 2,
			id: 20,
			description: 'Buy bacon'
		}, {
			category_id: 4,
			id: 34,
			description: 'Call Mom'
		}];

	},

	show: function () {

		var bkButton = this.view.querySelector('ro-back-button');

		bkButton.registerBackAction(function () {
			RoApp.backtoView('tasks', 'categories');
		});

	},

	taskByCategory: function (categoryId) {

		var roList = this.view.querySelector('ro-list');
		roList.setData(this.findTasks(categoryId));

	},

	findTasks: function (categoryId) {

		var data = [];

		for (var i = 0; i < this.allTasks.length; i++) {
			if (this.allTasks[i].category_id === categoryId) {
				data.push(this.allTasks[i]);
			}
		}

		return data;

	}
});