(function (){

  xtag.register ('ro-tabs', {
    lifecycle: {
      created: function () {
        
        var tabsLabels = this.querySelector ('ro-tabs-labels');
        var tabs = this.querySelectorAll ('ro-tab');

        if (!tabsLabels) {

          this.tabsLabelGroup = document.createElement ('ro-tabs-labels');

          for (var i = 0; i < tabs.length; i++) {

            var tabLabel = document.createElement ('ro-tab-label');
            tabLabel.innerHTML = tabs[i].getAttribute ('label');

            tabLabel.setAttribute ('tabIndex', i);
            tabs[i].setAttribute ('tabIndex', i);

            if (tabs[i].getAttribute ('selected')) {
              tabs[i].style.display = 'block';              
              tabLabel.setAttribute ('selected', true);
            } else {
              tabs[i].style.display = 'none';
            }

            this.tabsLabelGroup.appendChild (tabLabel);
          };

          this.insertBefore (this.tabsLabelGroup, tabs[0]);
        }

      },
      inserted: function () {

        var tabLabels = this.querySelectorAll ('ro-tabs-labels ro-tab-label');
        var tabs = this.querySelectorAll ('ro-tab');

        for (var i = 0; i < tabLabels.length; i++) {
          
            tabLabels[i].addEventListener ('click', (function (scope, label, tab){
              return function () {

                scope.setActive (label, tab);

              };
            }(this, tabLabels[i], tabs[i])));

        };
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
      setActive: function (tabLabel, tab) {

        this.hideOtherTabs ();

        tabLabel.setAttribute ('selected', true);

        tab.style.display = 'block';

      },
      hideOtherTabs: function () {

        var tabsLabels = this.querySelectorAll ('ro-tab-label');
        var tabs = this.querySelectorAll ('ro-tab');

        for (var i = 0; i < tabsLabels.length; i++) {
            tabsLabels[i].removeAttribute ('selected');
            tabs[i].style.display = 'none';
        };

      }    
    }
  });

})();