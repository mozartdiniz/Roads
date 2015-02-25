(function (){

  xtag.register ('ro-map', {
    lifecycle: {
      created: function () {               
      },
      inserted: function () {

        if (!this.querySelector ('ro-map-canvas')) {

          this.map = document.createElement ('ro-map-canvas');
          this.appendChild (this.map);

          this.parseLayers ();

          if (this.getAttribute ('layerGroup')) {
            this.createLayerGroup ();  
          }

          var initialLatitude = this.getAttribute ('latitude') || "0";
          var initialLongitude = this.getAttribute ('longitude') || "0";
          var initialZoom = this.getAttribute ('zoom') || "1";
          var maxZoom = this.getAttribute ('maxZoom') || "22";
          var minZoom = this.getAttribute ('minZoom') || "1";
          var center = ol.proj.transform ([parseFloat(initialLongitude), parseFloat(initialLatitude)], 'EPSG:4326', 'EPSG:3857')

          this.olMap = new ol.Map({
            layers: this.olLayers,
            target: this.map,
            renderer: 'canvas',
            view: new ol.View({
              center: center,
              zoom: parseInt(initialZoom),
              maxZoom: parseInt(maxZoom),
              minZoom: parseInt(minZoom)
            })
          });
        }

      },
      removed: function () {
      }
    },
    events: {
      reveal: function () {
      }
    },
    accessors: {     
    },
    methods: { 

      parseLayers: function () {

        this.olLayers = [];        
        this.roLayers = this.querySelectorAll ('ro-layer');

        for (var i = 0; i < this.roLayers.length; i++) {
          this.olLayers.push (this.layerBuilder (this.roLayers[i]));
        };

      },

      layerBuilder: function (layer) {

        var type       = layer.getAttribute ('source') || 'OSM';
        var imagerySet = layer.getAttribute ('imagerySet') || '';
        var visible    = (layer.getAttribute ('visible')) ? true : false;

        switch (type) {
          case 'OSM':
            return new ol.layer.Tile({
                  source: new ol.source.OSM(),
                  visible: visible
                });
            break;
          case 'Bing':
            return new ol.layer.Tile({
                  source: new ol.source.BingMaps({
                    key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                    imagerySet: imagerySet,
                    visible: visible
                  })
                });
            break;
          default:
            return new ol.layer.Tile({
                  source: new ol.source.OSM(),
                  visible: visible
                });                        
        }
      },

      showLayer: function (index) {

        for (var i = 0; i < this.olLayers.length; i++) {
          this.olLayers[i].setVisible (false);
        };

        this.olLayers[index].setVisible (true);
      },

      createLayerGroup: function () {

        this.layerGroup = document.createElement ('ro-map-layer-group');
        this.layerGroup.setAttribute ('visible', 'false');

        for (var i = 0; i < this.olLayers.length; i++) {
          var layerItem = document.createElement ('ro-item');
          layerItem.innerHTML = this.roLayers[i].getAttribute ('label');
          layerItem.addEventListener ('click', this.showLayer.bind (this, i));
          this.layerGroup.appendChild (layerItem);
        };

        this.layerGroup.addEventListener ('click', this.toggleLayerGroup.bind (this));

        this.appendChild (this.layerGroup);

      },

      toggleLayerGroup: function () {

        if (this.layerGroup.getAttribute ('visible') === 'true') {
          this.hideLayerGroup ();
        } else {
          this.showLayerGroup ();
        }

      },

      showLayerGroup: function () {
        this.layerGroup.setAttribute ('visible', true);  
      },

      hideLayerGroup: function () {
        this.layerGroup.setAttribute ('visible', false);
      },

      setCenter: function (position) {

        var view = this.olMap.getView ();
        var latlng = ol.proj.transform (
          [position.longitude, position.latitude], 'EPSG:4326', 'EPSG:3857'
        );
        view.setCenter (latlng);

      },

      setZoom: function (zoom) {

        var view = this.olMap.getView ();
        view.setZoom (zoom);

      },

      addMarker: function (position, markerContent) {

        if (position.longitude && position.latitude) {

          var markerEl = document.createElement('div');
          var ll = ol.proj.transform(
                      [position.longitude, position.latitude],
                      'EPSG:4326',
                      'EPSG:3857'
                    );

          markerEl.className = 'roMarker';

          if (markerContent) {
            markerEl.appendChild (markerContent);  
          }

          var marker = new ol.Overlay({
              element: markerEl,
              positioning: 'buttom-left',
              stopEvent: false
          });

          marker.setPosition(ll);

          this.olMap.addOverlay(marker);

        } else {
          console.log ('latitude and longitude are mandatory');
        }

      },

      addMarkers: function () {

      },

      markerFocus: function (position) {
        
        var focusEl = document.createElement ('div');
        focusEl.className = 'focusMaker';

        var ll = ol.proj.transform(
                    [position.longitude, position.latitude],
                    'EPSG:4326',
                    'EPSG:3857'
                  );        

        var marker = new ol.Overlay({
            element: focusEl,
            positioning: 'buttom-left',
            stopEvent: false
        });        

        marker.setPosition(ll);

        this.olMap.addOverlay(marker);

        setTimeout ((function (scope, marker) {
          return function () {
            scope.olMap.removeOverlay (marker);
          };
        }(this, marker)), 1000);

      },

      /* Get map features and focuses them */

      fitToBound: function () {

        var o = this.olMap.getOverlays();
        var v = this.olMap.getView();
        var a = o.getArray();
        var p = [];

        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i].getPosition() && !a[i].currentPosition) {
                p.push(a[i].getPosition())
            }
        }

        var l = p[0][1],
            r = p[0][1],
            t = p[0][0],
            b = p[0][0];

        for (var i = 0, pl = p.length; i < pl; i++) {

            if (l < p[i][1]) {
                l = p[i][1];
            }
            if (r > p[i][1]) {
                r = p[i][1];
            }
            if (t < p[i][0]) {
                t = p[i][0]
            }
            if (b > p[i][0]) {
                b = p[i][0];
            }
        }

        featureMultiLine = new ol.Feature();

        var ml = new ol.geom.LineString([
            [b, l],
            [t, l],
            [t, r],
            [b, r]
        ]);

        v.fitExtent(ml.getExtent(), this.olMap.getSize());

      }
    }
  });

})();