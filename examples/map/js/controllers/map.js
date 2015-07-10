RoMapExample.Controllers.Map = new Ro.Controller('map', {

    init: function () {

        var map     = document.querySelector ('ro-map');
        var marker  = document.createElement ('div');
        var marker2 = document.createElement ('div');

        map.addMarker ({
            latitude: 4973510.283137566,
            longitude: -8236201.88684357
        }, marker);

        map.addMarker ({
            latitude: 4973560.283137566,
            longitude: -8236231.88684357
        }, marker2);

    },

    show: function () {


    }

});