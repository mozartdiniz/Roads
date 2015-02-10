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
      show: function () {
        if (this.xtag.showFunction) {
          this.xtag.showFunction ();
        }  
      },
    },
    accessors: {     
    },
    methods: {  
      setShowFunction: function (callback) {
        this.xtag.showFunction = callback;
      } 
    }
  });

})();