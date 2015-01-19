Todo.Controllers.UserList = new Ro.Controller ('userList', {
  
  init: function () {

    this.data = {
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      duedate: '2015-01-08',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam molestie nec est pulvinar vulputate. Mauris varius magna ac risus volutpat venenatis. Aenean pellentesque, felis vitae interdum consectetur, mauris arcu convallis arcu, id pellentesque ex metus quis enim. Etiam in luctus leo, nec volutpat nibh. Ut felis enim, porta eget tellus posuere, convallis interdum sem. Maecenas aliquet suscipit lacinia. Phasellus blandit luctus ipsum vel consequat.'
    }

  },

  show: function () {
    var layout = this.view.querySelector ('ro-layout');
    layout.setData (this.data);     
  }

});