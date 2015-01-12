(function (){

  xtag.register ('ro-list', {
    lifecycle: {
      created: function () {
        this.xtag.item = this.querySelector ('ro-item');
        this.xtag.itemTemplate = this.querySelector ('ro-item').innerHTML;
        this.xtag.itemAction = this.xtag.item.getAttribute ('action');
      },
      inserted: function () {

        var nextElement = this.parentElement.nextElementSibling;

        if (nextElement && nextElement.tagName === "RO-FOOTER") {
        
          this.style.cssText = Ro.styleGenerator ({
              'height': '-webkit-calc(100% - 100px)',
              'height': '-moz-calc(100% - 100px)',
              'height': 'calc(100% - 100px)'
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
      data: []   
    },
    methods: {
      setData: function (data) {
        this.xtag.data = data;
        this.parseList ();
      },
      parseList: function () {

        var data = this.xtag.data;

        this.innerHTML = '';

        for (var i = 0; i < data.length; i++) {

          var roItem = document.createElement ('ro-item');
          var action = new Function (Ro.templateEngine (this.xtag.itemAction, data[i]));
          roItem.addEventListener ('click', action);
          roItem.innerHTML = Ro.templateEngine (this.xtag.itemTemplate, data[i]);
          this.appendChild (roItem);

        };

      }      
    }
  });

})();