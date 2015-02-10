(function (){

  xtag.register ('ro-back-button', {
    lifecycle: {
      created: function () {
        this.addListeners ();
      },
      inserted: function () {
        if (!Ro.Environment.platform.isIOS && !Ro.Environment.platform.isFxOS) {
          this.style.display = 'none';
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
      addListeners: function () {
        this.addEventListener (Ro.Events.click (), function () {
          Ro.Globals.backButtonFunction ();
        }, true);
      },
      registerBackAction: function (callback) {
        Ro.Globals = Ro.Globals || {};
        Ro.Globals.backButtonFunction = callback;
      }
    }
  });

})();