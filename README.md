# iamport-ionic for KG이니시스(DEPRECATED)
해당 프로젝트는 아이오닉 상위 버전과 호환 및 외부 라이브러리 의존도를 해결하기 위해 [iamport-cordova](https://github.com/iamport/iamport-cordova) 플러그인으로 대체되어 DEPRECATED 되었습니다. `iamport-cordova` 플러그인으로 코르도바 프로젝트, 아이오닉 - 앵귤러 프로젝트에서 아임포트 일반/정기결제 및 본인인증 기능을 이용하실 수 있습니다. 아이오닉 - 리액트 프로젝트는 [iamport-capacitor](https://github.com/iamport/iamport-capacitor) 플러그인을 사용하시면 됩니다. 자세한 내용은 아래 매뉴얼을 참고해주세요.

- [코르도바 프로젝트에서 아임포트 연동하기](https://github.com/iamport/iamport-cordova/blob/master/README.md)
- [아이오닉 - 앵귤러 프로젝트에서 아임포트 연동하기](https://github.com/iamport/iamport-cordova/blob/master/manuals/IONIC.md)
- [아이오닉 - 리액트 프로젝트/캐패시터 프로젝트에서 아임포트 연동하기](https://github.com/iamport/iamport-capacitor/blob/master/README.md)

____________________________________________________________________

Cordova 또는 Ionic 환경에서 아임포트 결제모듈을 쉽게 연동하기 위한 Ionic Cordova 플러그인입니다.(KG이니시스용)  
외부주소로의 redirection이 포함되어있어 InAppBrowser를 활용하며, 외부주소에서 다시 앱 복귀를 위해 Custom URL Scheme을 사용합니다.  
(InAppBrowser는 URL처리가 가능하도록 fork된 버전을 사용하고 있습니다)  

휴대폰 본인인증도 적용 가능합니다.   

## Required

- [Custom URL scheme](https://github.com/EddyVerbruggen/Custom-URL-scheme)
- [Url Scheme InAppBrowser(fork 버전)](https://github.com/iamport/cordova-plugin-inappbrowser)

## Install

플러그인명세(plugin.xml)에 dependency가 정의되어있기 때문에 iamport-ionic-inicis을 설치하면 Custom URL Scheme 플러그인과 InAppBrowser 플러그인이 설치됩니다.  
Custom URL Scheme 플러그인 설치를 위해 URL_SCHEME파라메터를 전달받습니다. 앱에서 사용하실 고유한 URL Scheme값을 지정하시면 됩니다.  

### 1. NPM 설치
cordova plugin add iamport-ionic-inicis --variable URL_SCHEME=**ioniciamport**

### 2. Github 소스로 설치
cordova plugin add https://github.com/iamport/iamport-ionic-inicis --variable URL_SCHEME=**ioniciamport**


## Usage (Cordova 방식)
플러그인 설치가 되면 javascript module이 자동 복사/등록됩니다.(cordova-iamport.js)  
결제가 필요한 순간에 다음과 같이 javascript 호출을 통해 `inappbrowser`를 통해 결제 프로세스를 시작할 수 있습니다.  

```javascript
IonicIamportInicis.payment(user_code, param, callback)
```

### 1. 특징  
cordova 특성상 `inappbrowser`를 통해 결제프로세스가 진행되므로 모바일 브라우저 연동과는 다소 차이가 있습니다. 
`m_redirect_url`속성을 overwrite하여 `inappbrowser`결제를 구현하고 있기 때문에 다음과 같은 차이점이 있습니다.  
(참조 : [cordova-iamport.js](https://github.com/iamport/iamport-ionic-inicis/blob/master/www/js/cordova-iamport.js#L18-L19))  

- m\_redirect\_url속성을 선언할 필요가 없음(선언해도 overwrite됨)  
- callback에 전달되는 rsp속성이 제한됨(success, imp\_uid, merchant\_uid, error\_msg 뿐)  

### 2. 결제 Example  
```javascript
IonicIamportInicis.payment('imp68124833', {
    pay_method : 'card',
    merchant_uid : 'merchant_' + new Date().getTime(),
    name : '주문명:결제테스트',
    amount : 1400,
    buyer_email : 'iamport@siot.do',
    buyer_name : '구매자이름',
    buyer_tel : '010-1234-5678',
    buyer_addr : '서울특별시 강남구 삼성동',
    buyer_postcode : '123-456'
}, function(rsp) {
    if ( rsp.success ) {
        var msg = '결제가 완료되었습니다.';
        msg += '고유ID : ' + rsp.imp_uid;
        msg += '상점 거래ID : ' + rsp.merchant_uid;
    } else {
        var msg = '결제에 실패하였습니다.';
        msg += '에러내용 : ' + rsp.error_msg;
    }
    alert(msg);
});
```

### 3. 본인인증 Example  
```javascript
IonicIamportInicis.certification('가맹점 식별코드', {
    name : '홍길동'
}, function(rsp) {
    if ( rsp.success ) {
        var msg = '본인인증이 완료되었습니다.';
        msg += '고유ID : ' + rsp.imp_uid;
    } else {
        var msg = '본인인증에 실패하였습니다.';
        msg += '에러내용 : ' + rsp.error_msg;
    }
    alert(msg);
});
```


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

### 4. 본인인증 Example  
```javascript
angular.controller('SomethingCtrl', function($scope, $http, $cordovaIamport) {
	
	$scope.certification = function() {
		//do something
		
		//본인인증시작
		var iamport_user_code = 'imp12345678'; // https://admin.iamport.kr에 가입 후 발급
		var param = {
			phone : '010-1234-1234'
	    };
	
	    $cordovaIamport.certification(iamport_user_code, param).then(function(result) {
	    	//server에서 결제완료여부 최종 체크할 수 있도록 imp_uid전달
	    	$http.post('/certifications/confirm', {imp_uid:result.imp_uid}).then(function(rsp) {
	    		alert(result.imp_uid + '본인인증이 완료되었습니다.');
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
각 카드사별 앱카드 등 외부 scheme을 호출하는데 문제없도록 info.plist파일에 모든 scheme명세를 추가하였습니다.  

#### 알려진 문제점  
실시간계좌이체 결제는 결제완료 후 inappbrowser가 자동으로 닫히지 않는 문제가 있으므로 해당 이슈가 해결되기 전까지는 `IMP.request_pay(param, callback)` 호출 시 param.pay_method : 'trans'는 사용하지 않기를 권장드립니다.  

실시간 계좌이체의 경우 기본적인 KG이니시스 동작 순서가 다음과 같습니다. 

1. ionic앱에서 Bankpay호출
2. Bankpay앱에서 계좌정보 인증 및 이체
3. 이체 후 Safari브라우저 열림
4. Safari브라우저 화면에서 확인버튼 클릭 시 ionic앱으로 이동

KG이니시스 구조상 중간에 Safari브라우저가 호출되는 문제 때문에 inappbrowser가 자동으로 닫혀지지 않는 한계가 있습니다.  
