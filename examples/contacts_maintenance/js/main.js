var Todo = Todo || {} ;
Todo.Controllers = Todo.Controllers || {};

Ro.init (function () {

    RoApp.putViewsInFirstPosition ();

    Todo.user  = new Todo.Controllers.EditUser ();
    Todo.users = new Todo.Controllers.UserList ();

});