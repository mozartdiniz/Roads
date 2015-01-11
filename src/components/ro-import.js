(function (){

  xtag.register ('ro-import', {
    lifecycle: {
      created: function () {
        console.log (this);

        var request = new Ro.Http();        
        request.url = this.getAttribute('url'); 
        this.contentType = 'text/xml';      
        request.method = 'get';  
        request.success = function (x) {
          console.log (x);
        }
        request.send();        

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
    }
  });

})();