(function (){

  xtag.register ('ro-list', {
    lifecycle: {
      created: function () {
        this.xtag.item = this.querySelector ('ro-item');
        this.xtag.itemTemplate = this.querySelector ('ro-item').innerHTML;

        this.buttons = {};

        //Add default buttons
        this.addButton ({
          name: 'delete',
          action: function () {
            var button = document.createElement ('ro-button');
            button.innerHTML = 'DELETE';
            return button;
          }
        });

        this.addButton ({
          name: 'share',
          action: function () {
            var button = document.createElement ('ro-button');
            button.innerHTML = 'SHARE';
            return button;
          }
        });

      },
      inserted: function () {

        this.activeButtons = this.getButtonsInfo ();

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
    methods: {
      setData: function (data) {
        this.xtag.data = data;
        this.parseList ();
      },
      getData: function () {
        return this.xtag.data;
      },
      setAction: function (action) {
        this.action = action;
      },
      parseList: function () {

        var data = this.xtag.data;

        this.innerHTML = '';

        this.xtag.itemAction = this.action || this.xtag.item.getAttribute ('action');

        for (var i = 0; i < data.length; i++) {

          var roItem = document.createElement ('ro-item');
          var roContent = document.createElement ('ro-item-content');
          var action = new Function (Ro.templateEngine (this.xtag.itemAction, data[i]));

          roItem.setAttribute ('itemIndex', i);

          roContent.addEventListener ('click', action);
          roContent.innerHTML = Ro.templateEngine (this.xtag.itemTemplate, data[i]);

          if (this.getAttribute ('swipeable')) {
            roItem.appendChild (this.renderSwipeMenu ());
            this.addSwipeMenuActions (roItem, this);
          }

          for (var j = 0; j < this.activeButtons.length; j++) {
            roItem.appendChild (this.activeButtons[j]());
          };

          if (this.getAttribute ('selectable')) {
            roItem.appendChild (this.renderSelectableButton (data[i]));
          }

          roItem.appendChild (roContent);

          this.appendChild (roItem);

        };

      },

      getButtonsInfo: function () {

        var attribute = this.getAttribute ('actionButtons');
        var buttons = false;

        if (attribute) {
          var buttons = attribute.split(',').map(function (item){
             return this.buttons [item.trim()];
          }.bind (this));
        }

        return buttons;

      },

      addButton: function (button) {
        this.buttons[button.name] = button.action;
      },

      renderSelectableButton: function (data) {

        var cbox = document.createElement ('ro-checkbox');
        cbox.appendChild (this.renderes.selectableButton (data));
        cbox.addEventListener ('click', function (e) {
          if (cbox.querySelector ('input[type="checkbox"]').checked) {
            e.target.parentElement.parentElement.setAttribute ('checked', true);
            this.callbacks.didSelectedItem (e);
          } else {
            e.target.parentElement.parentElement.removeAttribute ('checked');
            this.callbacks.didUnSelectedItem (e);
          }
        }.bind (this));

        return cbox;
      },

      selectedItems: function () {
        return this.querySelectorAll('ro-item[checked="true"]');
      },

      callbacks: {
        didSelectedItem: function (e) {},
        didUnSelectedItem: function (e) {},
        didSwipeItem: function (e) {}
      },

      renderes: {
        selectableButton: function (data) {
          return document.createTextNode ('');
        }
      },

      setCallback: function (callback) {
        this.callbacks[callback.name] = callback.action;
      },

      setRenderer: function (renderer) {
        this.renderes[renderer.name] = renderer.action;
      },

      renderSwipeMenu: function () {

        var roItemSwipemenu = document.createElement ('ro-item-swipemenu');
        roItemSwipemenu.setAttribute ('swipeMenuLabel', this.getAttribute ('swipeMenuLabel'));

        return roItemSwipemenu;
      },

      addSwipeMenuActions: function (item, scope) {

        var items = this.querySelectorAll('ro-item ro-item-swipemenu');
        var hammertime = new Hammer(item);

        hammertime.on ('panright', function(e) {

          var menu = item.firstElementChild;

          if (menu && e.deltaX > (window.innerWidth / 2)) {

            menu.className = 'goMenu';

          } else if (menu && e.deltaX > 50) {

            menu.className = '';
            menu.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
            menu.style.transform = 'translateX(' + e.deltaX + 'px)';
          }

        });

        hammertime.on ('panend', function (e) {

          var menu = item.firstElementChild;

          if (e.deltaX < (window.innerWidth / 2) && menu) {
            menu.className = 'backMenu';
          } else {
            scope.callbacks.didSwipeItem (item);

            setTimeout ((function (item) {
              item.firstElementChild.className = 'backMenu';
            }(item)), 1000);
          }

        });

      }

    }
  });

})();