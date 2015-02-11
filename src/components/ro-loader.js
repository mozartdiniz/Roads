(function (){

  xtag.register ('ro-loader', {
    lifecycle: {
      created: function () {
      },
      inserted: function () {
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
      show: function () {

        this.style.cssText = Ro.styleGenerator ({
          'display': 'block',
          'width': '100vw',
          'height': '100vh'
        });

      },
      hide: function () {

        this.style.cssText = Ro.styleGenerator ({
          'display': 'none',
          'width': '0',
          'height': '0'
        });
        
      } 
    }
  });

})();