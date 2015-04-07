(function (){

  xtag.register ('ro-tabs', {

    lifecycle: {

      created: function () {
      },

      inserted: function () {
      },

      removed: function () {
      }

    },
    events: {
      'tap:delegate(ro-tabs-labels ro-tab-label)': function (e){

        var mainTabTag    = this.parentElement.parentElement.parentElement;

        if (mainTabTag.tagName !== "RO-TABS") {
          mainTabTag = this.parentElement.parentElement;
        }

        var tabLabelIndex = this.getAttribute ('tabindex');
        var tab           = mainTabTag.querySelector ('ro-tab[tabindex="' + tabLabelIndex + '"]');

        mainTabTag.tabClickCallback (this, tab);
      }
    },
    accessors: {
      enabled: 'coisa'
    },
    methods: {

      render: function () {

        var tabsLabels        = this.querySelector ('ro-tabs-labels');
        var tabs              = this.querySelectorAll ('ro-tab');
        var newTabs           = [];
        var tabsWidth         = this.getAttribute ('tabwidth');
        var tabLabelsWrapper  = document.createElement ('div');
        var tabContentWrapper = document.createElement ('div');
        var tabWrapperWidth   = parseInt (tabsWidth + 20) * tabs.length;
        var tabLabelTemplate  = this.querySelector ('ro-tab-label-template');

        tabLabelsWrapper.className = 'roTabLabelsWrapper';
        tabContentWrapper.className = 'roTabContentWrapper';

        if (!tabsLabels) {

          this.getTabLabelTemplate ();

          for (var i = 0; i < tabs.length; i++) {
            newTabs.push (tabs[i].cloneNode(true));
          };

          this.tabsLabelGroup   = document.createElement ('ro-tabs-labels');
          this.tabsContentGroup = document.createElement ('ro-tabs-contents');

          if (tabsWidth) {
            this.innerHTML = '';
          }

          for (var i = 0; i < newTabs.length; i++) {

            var tabLabel = document.createElement ('ro-tab-label');

            if (tabLabelTemplate) {
              tabLabel.innerHTML = Ro.templateEngine (this.xtag.labelTemplate);
            } else {
              tabLabel.innerHTML = newTabs[i].getAttribute ('label');
            }

            tabLabel.setAttribute ('tabIndex', i);
            newTabs[i].setAttribute ('tabIndex', i);

            if (newTabs[i].getAttribute ('selected')) {
              newTabs[i].style.display = 'block';
              tabLabel.setAttribute ('selected', true);
            } else {
              newTabs[i].style.display = 'none';
            }

            if (tabsWidth) {

              this.tabsLabelGroup.setAttribute ('style', 'overflow: hidden');
              this.tabsContentGroup.setAttribute ('style', 'overflow: hidden');

              tabLabel.setAttribute ('style', 'width: ' + tabsWidth);
              newTabs[i].setAttribute ('style', 'width: ' + window.innerWidth + 'px');

              tabLabelsWrapper.appendChild (tabLabel);
              tabContentWrapper.appendChild (newTabs[i]);

            } else {
              this.tabsLabelGroup.appendChild (tabLabel);
            }

          };

          if (tabsWidth) {

            this.tabsLabelGroup.appendChild (tabLabelsWrapper);
            this.tabsContentGroup.appendChild (tabContentWrapper);

            this.appendChild (this.tabsLabelGroup);
            this.appendChild (this.tabsContentGroup);

            this.scrollBehavior ();

          } else {
            this.insertBefore (this.tabsLabelGroup, tabs[0]);
          }

        }

      },

      scrollBehavior: function () {

        var tabLabels = this.querySelectorAll ('ro-tabs-labels ro-tab-label');
        var tabs      = this.querySelectorAll ('ro-tab');
        var tabsWidth = this.getAttribute ('tabwidth');
        var addedTabs = this.querySelectorAll ('ro-tab-label');
        var wrapper   = this.querySelector ('.roTabLabelsWrapper');
        var cWrapper  = this.querySelector ('.roTabContentWrapper');
        var scrollE   = this.querySelector ('ro-tabs-labels');
        var contScrE  = this.querySelector ('ro-tabs-contents');

        if (tabsWidth) {

          var all = 0,
              allContent = addedTabs.length * window.innerWidth;

          for (var i=0; i < addedTabs.length; i++) {
             all += addedTabs[i].getBoundingClientRect().width;
          }

          wrapper.style.width  = all + 'px';
          cWrapper.style.width = allContent + 'px';

          setTimeout (function (scope, e, contentE) {

            return function () {

              scope.myScroll = new IScroll (e, {
                  scrollbars: false,
                  scrollX: true,
                  scrollY: false,
                  mouseWheel: false,
                  probeType: 1,
                  click: true,
                  snap: true,
                  preventDefault: true,
                  snap: 'ro-tab-label'
              });

              scope.contentScroll = new IScroll (contentE, {
                  scrollbars: false,
                  scrollX: true,
                  scrollY: false,
                  mouseWheel: false,
                  disableMouse: true,
                  disablePointer: true,
                  disableTouch: true,
                  probeType: 1,
                  click: true,
                  snap: true,
                  preventDefault: true
              });

              scope.myScroll.on('scroll', function () {
                // do something
              });

              scope.myScroll.on('scrollEnd', function () {
                this.tabClickCallback (this.eligibleTab ());
              }.bind (scope));

            }

          }(this, scrollE, contScrE), 100);

        }

      },

      tabClickCallback: function (label) {

        var roTabs, tab;
        var parentNode = label.parentNode;

        if (parentNode) {

          roTabs = label.parentNode.parentNode.parentNode;

          if (roTabs.tagName !== "RO-TABS") {
            roTabs = label.parentNode.parentNode;
          }

          tab    = roTabs.querySelector ('ro-tab[tabindex="' + label.getAttribute ('tabindex') + '"]');

          this.setActive (label, tab);
        }

      },

      setActive: function (tabLabel, tab) {

        var tabsWidth = this.getAttribute ('tabwidth');

        if (tabsWidth) {
          this.scrollToTab (tabLabel);
        }

        this.hideOtherTabs ();

        tabLabel.setAttribute ('selected', true);
        tab.setAttribute ('selected', true);

        tab.style.display = 'block';

      },

      hideOtherTabs: function () {

        var tabsLabels = this.querySelectorAll ('ro-tab-label');
        var tabs       = this.querySelectorAll ('ro-tab');

        for (var i = 0; i < tabsLabels.length; i++) {
            tabsLabels[i].removeAttribute ('selected');
            tabs[i].removeAttribute ('selected');
        };

      },

      getActive: function () {

        return this.querySelector ('ro-tab-label[selected="true"]');

      },

      scrollToTab: function (tab) {

        var tabBouding        = tab.getBoundingClientRect ();
        var parentWidth       = tab.parentNode.getBoundingClientRect ().width;
        var activeTab         = this.getActive ();
        var activeTabBouding  = activeTab.getBoundingClientRect ();
        var i                 = parseInt (tab.getAttribute ('tabindex'));
        var whereToGo         = tabBouding.width * i - parseInt (tabBouding.width/3);
        var coefficient       = -1;

        if (whereToGo < 0) {
          whereToGo = 0;
        }

        if (whereToGo + tabBouding.width + parseInt (tabBouding.width/3) === parentWidth) {
          whereToGo = (tabBouding.width * i) - (window.innerWidth - tabBouding.width);
        }

        if (tabBouding.left > 0 && tabBouding.left < activeTabBouding.left) {
          coefficient = 1;
        }

        if (activeTab.getAttribute ('tabindex') !== tab.getAttribute ('tabindex')) {
          setTimeout (function (scope, left, c, i){
            return function () {
              scope.myScroll.scrollTo(left * c, 0, 300);
              scope.contentScroll.scrollTo(i * window.innerWidth * c, 0, 300);
            };
          }(this, whereToGo, coefficient, i), 100);
        }

      },

      eligibleTab: function () {

        var tabsLabels = this.querySelectorAll ('ro-tab-label');
        var tabs       = this.querySelectorAll ('ro-tab');
        var width      = window.innerWidth;
        var position   = {};

        for (var i = 0; i < tabsLabels.length; i++) {

          position = tabsLabels[i].getBoundingClientRect();

          if (position.left > 0 && position.right < width) {
            return tabsLabels[i];
          }

        };

        return false;

      },

      getTabLabelTemplate: function () {

        var template = this.querySelector ('ro-tab-label-template');

        if (template) {

          this.xtag.template      = template.cloneNode (true);
          this.xtag.labelTemplate = template.innerHTML;
          this.labelTemplate      = template.innerHTML;
        }

      },

      setTabLabelData: function (data) {

        var tabLabelTemplate = this.xtag.labelTemplate;
        var tabLabels        = this.querySelectorAll ('ro-tab-label');

        for (var i = 0; i < tabLabels.length; i++) {
          tabLabels[i].innerHTML = Ro.templateEngine (tabLabelTemplate, data[i]);
        };

      }
    }
  });

})();