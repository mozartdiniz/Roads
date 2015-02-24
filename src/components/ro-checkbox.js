(function (){

  xtag.register ('ro-checkbox', {
    lifecycle: {
      created: function () {

        if (!this.firstElementChild) {
          this.checkInput = document.createElement ('input');
          this.checkInput.addEventListener ('click', function (e) {
            e.preventDefault ();
          });
          this.setAttribute ('checked', false);
          this.addEventListener ('click', this.toggleCheck);
          this.checkInput.type = 'checkbox';
          this.appendChild (this.checkInput);          
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
      addListeners: function () {
        var action = new Function (this.getAttribute('action'));
        this.addEventListener ('click', action);
      },

      toggleCheck: function () {

        if (this.checkInput.checked) {
          this.uncheck ();
        } else {
          this.check ();
        }

      },

      check: function () {
        this.checkInput.checked = true;
        this.setAttribute ('checked', true);
      },

      uncheck: function () {
        this.checkInput.checked = false;
        this.setAttribute ('checked', false);
      },

      value: function () {
        if (this.checkInput.checked) {
          return true;
        }
        return false;
      }
    }
  });

})();