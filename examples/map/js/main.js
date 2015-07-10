var RoMapExample = RoMapExample || {};
RoMapExample.Controllers = RoMapExample.Controllers || {};

Ro.init(function () {

    RoApp.putViewsInFirstPosition();

    RoMapExample.Map = new RoMapExample.Controllers.Map();

});