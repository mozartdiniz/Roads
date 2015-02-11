(function (){

  xtag.register ('ro-app', {
    lifecycle: {
      created: function () {

        // Create style to calc correct ro-view heights
        var updateStyle = function () {

          var roadStyles = document.querySelector('style#roViewStyles');

          if (!roadStyles) {
            roadStyles = document.createElement('style');
            roadStyles.id = 'roViewStyles';
            document.head.appendChild (roadStyles);              
          }

          roadStyles.innerHTML = 'ro-view { height: ' + window.innerHeight + 'px}';            
        }

        document.addEventListener("deviceready", function () {

          setTimeout(updateStyle, 500);          

        });

        window.addEventListener('orientationchange', function () {

          setTimeout(updateStyle, 500);          

        }); 

      },

      inserted: function () {

        this.putViewsInFirstPosition ();

        setTimeout(function (){
          var loader  = document.querySelector ('ro-loader');
          loader.hide();
        }, 500);

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

      putViewsInFirstPosition: function () {

        var views = document.querySelectorAll ('ro-view:not([mainPage])');
        var firstView = document.querySelector ('ro-view[mainPage]');

        if (firstView) {

          Ro.i18n.translateView (firstView);

          firstView.style.cssText = Ro.styleGenerator ({
              'transform': 'translateX(0)',
              '-webkit-transform': 'translateX(0)'
          });
        }

        if (views) {
          for (var i = 0, l = views.length; i < l; i++) {
            views[i].style.cssText = Ro.styleGenerator ({
              'transform': 'translateX(2000px)',
              '-webkit-transform': 'translateX(2000px)',
              'transition': '10ms',
              '-webkit-transition': '10ms' 
            });
          };          
        }

      },

      gotoView: function (fromID, toID) {

        var from, to;

        from = document.getElementById (fromID);
        to   = document.getElementById (toID);

        if (!from) {
          throw 'ro-view: "From" view can not be found';
        }

        if (!to) {
          throw 'ro-view: "To" view can not be found';
        }

        to.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',
          '-webkit-transform': 'translateX(0px)',          
          'transform': 'translateX(0px)',
          'z-index': '2',
          '-webkit-transition-timing-function': 'ease',
          'transition-timing-function': 'ease'
        });

        from.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',
          'transition-delay': '500ms',          
          '-webkit-transform': 'translateX(2000px)',
          'transform': 'translateX(2000px)',
          'z-index': '1'
        });

        Ro.i18n.translateView (to);

        xtag.fireEvent(to, 'show');

      },

      backtoView: function (fromID, toID) {

        var from, to;

        from = document.getElementById (fromID);
        to   = document.getElementById (toID);

        to.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '2ms',
          'transition': '2ms',
          '-webkit-transform': 'translateX(0px)',          
          'transform': 'translateX(0px)',
          'z-index': '1',
          '-webkit-transition-timing-function': 'ease',
          'transition-timing-function': 'ease'
        });

        from.style.cssText = Ro.styleGenerator ({
          '-webkit-transition': '500ms',
          'transition': '500ms',         
          '-webkit-transform': 'translateX(2000px)',
          'transform': 'translateX(2000px)',
          'z-index': '2'
        }); 

        Ro.i18n.translateView (to);

        xtag.fireEvent (to, 'show');        

      }
    }
  });

})();