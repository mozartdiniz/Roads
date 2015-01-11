var Todo = Todo || {} ;
Todo.Controllers = Todo.Controllers || {};

Ro.init (function () {

    RoApp.putViewsInFirstPosition ();

    Todo.categories = new Todo.Controllers.Categories ();
    Todo.tasks  = new Todo.Controllers.Tasks ();

});