(function (){

  xtag.register ('ro-header', {
    lifecycle: {
      created: function () {
        if (Ro.Environment.platform.isIOS) {
          this.style.paddingTop = '20px';
        }
      },
      inserted: function () {
      },
      removed: function () {
      }
    },
    events: {
    },
    accessors: {     
    },
    methods: {       
    }
  });

})();