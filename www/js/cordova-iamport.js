/*global cordova, module*/
(function() {
	function parseQuery(query) {
		var obj = {},
		arr = query.split('&');
		for (var i = 0; i < arr.length; i++) {
			var pair = arr[i].split('=');

			obj[ decodeURIComponent(pair[0]) ] = decodeURIComponent(pair[1]);
		}

		return obj;
	}

	module.exports = {
		payment : function (user_code, param, callback) {
			if( cordova.InAppBrowser ) {
				var payment_url = 'iamport-checkout.html?user-code=' + user_code,
					m_redirect_url = 'http://localhost/iamport';

				param.m_redirect_url = m_redirect_url;//강제로 변환

				var inAppBrowserRef = cordova.InAppBrowser.open(payment_url, '_blank', 'location=no'),
					paymentProgress = false;

				var startCallback = function(event) {
					if( (event.url).indexOf(m_redirect_url) === 0 ) { //결제 끝.
						var query = (event.url).substring( m_redirect_url.length + 1 ) // m_redirect_url+? 뒤부터 자름
						var data = parseQuery(query); //query data

						if ( typeof callback == 'function' ) {
							var rsp = {
								success : data.imp_success === 'true',
								imp_uid : data.imp_uid,
								merchant_uid : data.merchant_uid,
								error_msg : data.error_msg
							};

							callback.call(cordova, rsp);
						}

						finish();
					}
				};

				var stopCallback = function(event) {
					if ( !paymentProgress && (event.url).indexOf(payment_url) > -1 ) {
						var inlineCallback = "function(rsp) {if(rsp.success) {location.href = '" + m_redirect_url + "?imp_success=true&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid;} else {location.href = '" + m_redirect_url + "?imp_success=false&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid+'&error_msg='+rsp.error_msg;}}",
							iamport_script = "IMP.request_pay(" + JSON.stringify(param) + "," + inlineCallback + ")";

						inAppBrowserRef.executeScript({
							code : iamport_script
						}, function() {
							//executeScript 가 성공적으로 실행되었는지 체크한 다음 paymentProgress = true로 변경
							paymentProgress = true;
						});
					}
				};

				var exitCallback = function(event) {
					if ( typeof callback == 'function' ) {
						var rsp = {
							success : false,
							imp_uid : null,
							merchant_uid : param.merchant_uid,
							error_code : 'CANCEL',
							error_msg : '사용자가 결제를 취소하였습니다.'
						};

						callback.call(cordova, rsp);
					}
				};

				var finish = function() {
					inAppBrowserRef.removeEventListener('loadstart', startCallback);
					inAppBrowserRef.removeEventListener('loadstop', stopCallback);
					inAppBrowserRef.removeEventListener('exit', exitCallback);
					setTimeout(function() {
						inAppBrowserRef.close();
					}, 10);
				};


				inAppBrowserRef.addEventListener('loadstart', startCallback);
				inAppBrowserRef.addEventListener('loadstop', stopCallback);
				inAppBrowserRef.addEventListener('exit', exitCallback);

				//fallback
				var triggerFallback = function() {
					if (paymentProgress)	return;

					stopCallback({url: payment_url}); //Fake Trigger

					setTimeout(function() {
						triggerFallback();
					}, 500);
				};

				setTimeout(function() {
					triggerFallback();
				}, 1500); //loadstop 이 호출안되었는지 1.5s 기다려봄


				//for KakaoPay
				if ( param.app_scheme ) {
					var oldHandleOpenUrl = window.handleOpenURL;

					window.handleOpenURL = function(url) {
						if ( url == (param.app_scheme+'://process') ) {
							inAppBrowserRef.executeScript({
								code : "IMP.communicate({result:'process'})"
							});
						} else if ( url == (param.app_scheme+'://cancel') ) {
							inAppBrowserRef.executeScript({
								code : "IMP.communicate({result:'cancel'})"
							});
						} else {
							oldHandleOpenUrl(url);
						}
					}
				}

				inAppBrowserRef.show();
			} else {
				IMP.init(user_code);
				IMP.request_pay(param, callback);
			}
		},
		certification : function (user_code, param, callback) {
			if( cordova.InAppBrowser ) {
				var certification_url = 'iamport-checkout.html?user-code=' + user_code,
					m_redirect_url = 'http://localhost/iamport-certification';

				param.m_redirect_url = m_redirect_url;//강제로 변환

				var inAppBrowserRef = cordova.InAppBrowser.open(certification_url, '_blank', 'location=no'),
					progress = false;

				var startCallback = function(event) {
					if( (event.url).indexOf(m_redirect_url) === 0 ) { //본인인증 끝.
						var query = (event.url).substring( m_redirect_url.length + 1 ) // m_redirect_url+? 뒤부터 자름
						var data = parseQuery(query); //query data

						if ( typeof callback == 'function' ) {
							var rsp = {
								success : data.success === 'true',
								imp_uid : data.imp_uid,
								error_msg : data.error_msg
							};

							callback.call(cordova, rsp);
						}

						finish();
					}
				};

				var stopCallback = function(event) {
					if ( !progress && (event.url).indexOf(certification_url) > -1 ) {
						progress = true;

						var inlineCallback = "function(rsp) {if(rsp.success) {location.href = '" + m_redirect_url + "?success=true&imp_uid='+rsp.imp_uid;} else {location.href = '" + m_redirect_url + "?success=false&imp_uid='+rsp.imp_uid+'&error_msg='+rsp.error_msg;}}",
							iamport_script = "IMP.certification(" + JSON.stringify(param) + "," + inlineCallback + ")";

						inAppBrowserRef.executeScript({
							code : iamport_script
						});
					}
				};

				var exitCallback = function(event) {
					if ( typeof callback == 'function' ) {
						var rsp = {
							success : false,
							imp_uid : null,
							error_code : 'CANCEL',
							error_msg : '사용자가 본인인증을 취소하였습니다.'
						};

						callback.call(cordova, rsp);
					}
				};

				var finish = function() {
					inAppBrowserRef.removeEventListener('loadstart', startCallback);
					inAppBrowserRef.removeEventListener('loadstop', stopCallback);
					inAppBrowserRef.removeEventListener('exit', exitCallback);
					setTimeout(function() {
						inAppBrowserRef.close();
					}, 10);
				};


				inAppBrowserRef.addEventListener('loadstart', startCallback);
				inAppBrowserRef.addEventListener('loadstop', stopCallback);
				inAppBrowserRef.addEventListener('exit', exitCallback);

				inAppBrowserRef.show();
			} else {
				IMP.init(user_code);
				IMP.certification(param, callback);
			}
		}
	};
})();
