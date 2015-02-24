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

      setCenter: function () {

      },

      addMarker: function () {

      },

      addMarkers: function () {

      },

      markerFocus: function () {
        
      }
    }
  });

})();