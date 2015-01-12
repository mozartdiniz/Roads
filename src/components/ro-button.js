(function (){

  xtag.register ('ro-button', {
    lifecycle: {
      created: function () {
        this.addListeners ();
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
      addListeners: function () {
        var action = new Function (this.getAttribute('action'));
        this.addEventListener ('click', action);
      }    
    }
  });

})();