(function (){

  xtag.register ('ro-app', {
    lifecycle: {
      created: function () {

        this.innerHTML = '<ro-scroll></ro-scroll>'

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

          firstView.style.zIndex = 1;
          firstView.style.webkitTransition = '10ms';
          firstView.style.transition = '10ms';
          firstView.style.webkitTransform = 'translateX(0)';
          firstView.style.transform = 'translateX(0)';  

          RoApp.activeView = firstView.id;

        }

        if (views) {
          for (var i = 0, l = views.length; i < l; i++) {

            views[i].style.zIndex = 2;            
            views[i].style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
            views[i].style.transform = 'translateX(' + window.innerWidth + 'px)';                         
            views[i].style.webkitTransition = '10ms';
            views[i].style.transition = '10ms';

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

        to.style.transition = '10ms';

        to.style.zIndex = 2;
        to.style.transition = '300ms';
        to.style.transitionTimingFunction = 'linear';        
        to.style.webkitTransform = 'translateX(0)';
        to.style.transform = 'translateX(0)';         

        from.style.transition = '10ms';
        from.style.zIndex = 3;
        from.style.transition = '300ms';
        from.style.transitionTimingFunction = 'linear';        
        from.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px)';
        from.style.transform = 'translateX(-' + window.innerWidth + 'px)'; 
               
        Ro.i18n.translateView (to);

        this.activeView = toID;        

        xtag.fireEvent(to, 'show');

      },

      backtoView: function (fromID, toID) {

        var from, to;

        from = document.getElementById (fromID);
        to   = document.getElementById (toID);

        if (!from) {
          throw 'ro-view: "From" view can not be found';
        }

        if (!to) {
          throw 'ro-view: "To" view can not be found';
        }        

        to.transition = '10ms';
        to.style.zIndex = 3;
        to.transition = '300ms';
        to.style.transitionTimingFunction = 'linear';        
        to.style.webkitTransform = 'translateX(0)';
        to.style.transform = 'translateX(0)'; 
               

        from.transition = '10ms';
        from.style.zIndex = 2;
        from.transition = '300ms';
        from.style.transitionTimingFunction = 'linear';        
        from.style.webkitTransform = 'translateX(' + window.innerWidth + 'px)';
        from.style.transform = 'translateX(' + window.innerWidth + 'px)'; 

        Ro.i18n.translateView (to);

        this.activeView = toID;

        xtag.fireEvent (to, 'show');        

      }
    }
  });

})();