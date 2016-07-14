# iamport-ionic for KG이니시스
Cordova 또는 Ionic 환경에서 아임포트 결제모듈을 쉽게 연동하기 위한 Ionic Cordova 플러그인입니다.(KG이니시스용)  
외부주소로의 redirection이 포함되어있어 InAppBrowser를 활용하며, 외부주소에서 다시 앱 복귀를 위해 Custom URL Scheme을 사용합니다.  

(현재 iOS버전은 준비 중입니다)  

## Required

- [Custom URL scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme)
- [InAppBrowser](https://github.com/apache/cordova-plugin-inappbrowser)

## Install

플러그인명세(plugin.xml)에 dependency가 정의되어있기 때문에 iamport-ionic-inicis을 설치하면 Custom URL Scheme 플러그인과 InAppBrowser 플러그인이 설치됩니다.  
Custom URL Scheme 플러그인 설치를 위해 URL_SCHEME파라메터를 전달받습니다. 앱에서 사용하실 고유한 URL Scheme값을 지정하시면 됩니다.  

### 1. NPM 설치
cordova plugin add iamport-ionic-inicis --variable URL_SCHEME=**ioniciamport**

### 2. Github 소스로 설치
cordova plugin add https://github.com/iamport/iamport-ionic-inicis --variable URL_SCHEME=**ioniciamport**


## Usage (Cordova 방식)
모바일 브라우저의 아임포트 결제모듈 연동방식과 동일합니다.  
javascript에서 `IMP.request_pay(param, callback)`을 호출함으로써 결제가 시작됩니다.  

## Usage (Ionic 방식)
### 1. javascript 선언  
플러그인 설치가 되면 ng-cordova-iamport.js가 platform 폴더에 자동으로 복사가 됩니다.  
때문에, ionic 기본 페이지인 index.html에서 script를 선언만 해주시면 됩니다. 
(단, `app.js`, `controllers.js` 보다 앞에 추가해주셔야 `ng-cordova-iamport.js`가 제공하는 angular module과 factory 사용이 가능합니다.  

```html
<script src="js/ng-cordova-iamport.js"></script>
```

### 2. use module (`ngCordovaIamport`)  

```javascript
angular.module('starter.controllers', ['ngCordovaIamport'])
```
### 3. inject factory(`$cordovaIamport`) & call `payment` function

```javascript
angular.controller('SomethingCtrl', function($scope, $http, $cordovaIamport) {
	
	$scope.checkout = function() {
		//do something
		
		//결제시작
		var iamport_user_code = 'imp12345678'; // https://admin.iamport.kr에 가입 후 발급
		var param = {
			pay_method : 'card',
			merchant_uid : 'my_service_oid_' + (new Date()).getTime(),
			amount : 1004,
			name : '아이오닉 상품결제',
			buyer_name : '아임포트',
			buyer_email : 'iamport@siot.do',
			buyer_tel : '010-1234-5678',
			app_scheme : 'ioniciamport' //URL_SCHEME과 동일한 값 사용
	    };
	
	    $cordovaIamport.payment(iamport_user_code, param).then(function(result) {
	    	//server에서 결제완료여부 최종 체크할 수 있도록 imp_uid전달
	    	$http.post('/payments/confirm', {imp_uid:result.imp_uid}).then(function(rsp) {
	    		alert(result.imp_uid + '주문이 완료되었습니다.');
	    	}, function(err) {
	    		//do error handling
	    	})
	    }, function(err) {
	    	alert(err);
	    });
	}
	
});
```

## 특이사항  
### Android
[cordova-plugin-whitelist](https://github.com/apache/cordova-plugin-whitelist)에 의해 PG사 페이지 navigation 과정에서 앱을 벗어나 Chrome브라우저 새창이 열리는 경우가 발생할 수 있음 *(ex. location.href = 'http://some.domain.com')*  
브라우저로 새창열림을 방지하기 위해 `config.xml`에 `<allow-navigation href="*" />`가 추가되도록 플러그인 명세 `plugin.xml`를 작성하였습니다.  

### iOS
개발 중