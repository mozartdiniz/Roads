(function (){

  xtag.register ('ro-view', {
    lifecycle: {
      created: function () {        

        if (Ro.Environment.platform.isIOS && !this.className.match(/isIOS/)) {
          this.className += "isIOS ";
        }         

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
    }
  });

})();