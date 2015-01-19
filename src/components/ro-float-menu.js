(function (){

  xtag.register ('ro-float-menu', {
    lifecycle: {
      created: function () {
        this.xtag.itemsAreVisible = false;
      },
      inserted: function () {
        
      },
      removed: function () {
      }
    },
    events: {
      reveal: function () {
      },
      click: function () {
        this.toggleMenu ();
      }
    },
    accessors: {   
    },
    methods: {
      addItem: function (item) {
      },
      removeItem: function (item) {
      },
      toggleMenu: function () {
        if (this.xtag.itemsAreVisible) {
           this.hideItems ();
        } else {
          this.showItems ();
        }
      },
      hideItems: function () {
        this.setAttribute('state', 'hideItems');
        this.xtag.itemsAreVisible = false;
      },
      showItems: function (items) {
        this.setAttribute('state', 'showItems');
        this.xtag.itemsAreVisible = true;
      },
      parseList: function () {
      }
    }
  });

})();