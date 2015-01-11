Todo.Controllers.Categories = new Ro.Controller ('categories', {

  init: function () {

    var list = this.view.querySelector ('ro-list');

    var data = [{
      id: 1,
      description: 'Professional'
    },{
      id: 2,
      description: 'Personal'
    },{
      id: 3,
      description: 'Financial activities'
    },{
      id: 4,
      description: 'Family'
    }];

    list.setData (data);

  }
});