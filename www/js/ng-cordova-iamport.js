(function() {
  'use strict';

  angular.module('ngCordova.plugins.iamport', [])
    .factory('$cordovaIamport', iamport);

    function iamport($q, $http) {
      return { payment : iamportPayment };

      function parseQuery(query) {
        var obj = {},
            arr = query.split('&');
        for (var i = 0; i < arr.length; i++) {
            var pair = arr[i].split('=');

            obj[ decodeURIComponent(pair[0]) ] = decodeURIComponent(pair[1]);
        }

        return obj;
      }

      function iamportPayment(user_code, param) {
        var deferred = $q.defer();

        if( cordova.InAppBrowser ) {
          var payment_url = 'iamport-checkout.html#' + Math.floor(Math.random()*100000),
              m_redirect_url = 'http://localhost/iamport';

          param.m_redirect_url = m_redirect_url;//강제로 변환

          var inAppBrowserRef = cordova.InAppBrowser.open(payment_url, '_blank', 'location=no');

          inAppBrowserRef.addEventListener('loadstart', function(event) {
            if( (event.url).indexOf(m_redirect_url) === 0 ) { //결제 끝.
              var query = (event.url).substring( m_redirect_url.length + 1 ) // m_redirect_url+? 뒤부터 자름
              var data = parseQuery(query); //query data

              deferred.resolve(data);
              setTimeout(function() {
                inAppBrowserRef.close();
              }, 10);
            }
          });

          inAppBrowserRef.addEventListener('loadstop', function(event) {
            if ( (event.url).indexOf(payment_url) > -1 ) {
              var iamport_script = "IMP.init('" + user_code + "');\n";
                  iamport_script += "IMP.request_pay(" + JSON.stringify(param) + ")";

              inAppBrowserRef.executeScript({
                code : iamport_script
              });
            }
          });
          inAppBrowserRef.addEventListener('exit', function(event) {
            deferred.reject("사용자가 결제를 취소하였습니다.");
          });

          inAppBrowserRef.show();

        } else {
          deferred.reject("InAppBrowser plugin을 필요로 합니다. InAppBrowser plugin를 찾을 수 없습니다.");
        }

        return deferred.promise;
      }
    }

    iamport.$inject = ['$q', '$http'];

  //external
  angular.module('ngCordovaIamport', ['ngCordova.plugins.iamport']);
})();