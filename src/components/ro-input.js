(function (){

  xtag.register ('ro-input', {
    lifecycle: {
      created: function () {             
        if (!this.innerHTML.trim()) {

          this.xtag.field = document.createElement('input');
          this.xtag.field.type = this.getAttribute('type');
          this.xtag.field.value = this.getAttribute('value');
          this.xtag.field.placeholder = this.getAttribute('placeholder');
          this.xtag.field.name = this.getAttribute('name');

          this.xtag.icon = document.createElement('ro-icon');
          this.xtag.icon.setAttribute ('iconName', this.getAttribute('icon'));

          this.appendChild (this.xtag.icon);
          this.appendChild (this.xtag.field);
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