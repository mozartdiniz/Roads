(function (){

  xtag.register ('ro-list', {
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
      data: []   
    },
    methods: {
      setData: function (data) {
        this.xtag.data = data;
        this.parseList ();
      },
      parseList: function () {

        var roItemBase = this.querySelector ('ro-item');
        var data = this.xtag.data;
        var template = roItemBase.innerHTML;

        this.innerHTML = '';

        for (var i = 0; i < data.length; i++) {

          var roItem = document.createElement ('ro-item');
          roItem.setAttribute ('onclick', roItemBase.getAttribute ('action'));
          roItem.innerHTML = Ro.templateEngine (template, data[i]);
          this.appendChild (roItem);

        };

      }      
    }
  });

})();