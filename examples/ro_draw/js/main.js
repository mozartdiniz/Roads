/**
 * Created by adaltojunior on 8/17/15.
 */
var RoDrawExample = RoDrawExample || {};
RoDrawExample.Controllers = RoDrawExample.Controllers || {};

Ro.init(function () {

    RoApp.putViewsInFirstPosition();
    RoApp.Draw = new RoDrawExample.Controllers.Draw();

});
