(function (){

  xtag.register ('ro-layout', {
    lifecycle: {
      created: function () {
        this.template = this.innerHTML;
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
      setData: function (data) {
        this.xtag.data = data;
        this.parseLayout ();
      },
      parseLayout: function () {
          var data = this.xtag.data;
          xtag.innerHTML(this, Ro.templateEngine (this.template, data));
      }      
    }
  });

})();