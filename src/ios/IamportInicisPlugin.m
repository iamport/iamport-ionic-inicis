#import "IamportInicisPlugin.h"
#import <Cordova/CDVPlugin.h>

@implementation IamportInicisPlugin

@synthesize viewController;

- (void)pluginInitialize
{
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(finishLaunching:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

- (void)handleOpenURL:(NSNotification*)notification
{
    // override to handle urls sent to your app
    // register your url schemes in your App-Info.plist

    NSURL* url = [notification object];

    if ([url isKindOfClass:[NSURL class]]) {
        NSString* scheme = [url scheme];
        NSString* query = [url query];
        NSString* MY_APP_URL_KEY = [self.commandDelegate.settings objectForKey:[@"IamportAppScheme" lowercaseString]]; //ionic plugin 설치 시 설정한 scheme을 그대로 사용

        if( scheme !=  nil && [scheme hasPrefix:MY_APP_URL_KEY] ) {
            //iOS의 경우 모바일 실시간계좌이체를 진행하였을 때 Bankpay에서 결제를 마친 후 Safari브라우저가 한 번 열렸다가 앱으로 복귀하게 됩니다. 
            //이 때 복귀하는 url은 iamportionic://?imp_uid={imp_uid}&m_redirect_url={m_redirect_url} 로 앱이 호출되어 이쪽으로 들어옵니다. 
            //때문에 다른 결제수단과의 일관성을 위해서는 m_redirect_url값을 활용해 다시 redirect처리해줘야합니다.
            
            //imp_uid를 추출
            NSDictionary* query_map = [self parseQueryString:query];
            NSString* imp_uid = query_map[@"imp_uid"];
            NSString* m_redirect_url = query_map[@"m_redirect_url"];

            NSLog(@"imp_uid is %@", imp_uid);
            NSLog(@"m_redirect_url is %@", m_redirect_url);
        }
    }
}

- (BOOL)shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    //ISP호출인지부터 체크
    NSString* URLString = [NSString stringWithString:[request.URL absoluteString]];
    //APP STORE URL 경우 openURL 함수를 통해 앱스토어 어플을 활성화 한다.
    BOOL bAppStoreURL = ([URLString rangeOfString:@"phobos.apple.com" options:NSCaseInsensitiveSearch].location != NSNotFound);
    BOOL bAppStoreURL2 = ([URLString rangeOfString:@"itunes.apple.com" options:NSCaseInsensitiveSearch].location != NSNotFound);
    if(bAppStoreURL || bAppStoreURL2) {
        [[UIApplication sharedApplication] openURL:request.URL];
        return NO;
    }
    
    //ISP 호출하는 경우
    if([URLString hasPrefix:@"ispmobile://"]) {
        NSURL *appURL = [NSURL URLWithString:URLString];
        if([[UIApplication sharedApplication] canOpenURL:appURL]) {
            [[UIApplication sharedApplication] openURL:appURL];
        } else {
            [self showAlertViewWithEvent:@"모바일 ISP가 설치되어 있지 않아\nApp Store로 이동합니다." tagNum:99];
            return NO;
        }
    }
    
    //기타(금결원 실시간계좌이체 등)
    NSString *strHttp = @"http://";
    NSString *strHttps = @"https://";
    NSString *strFiles = @"file://"; // index.html(local html file )
    NSString *reqUrl=[[request URL] absoluteString]; NSLog(@"webview 에 요청된 url==>%@",reqUrl);
    if (!([reqUrl hasPrefix:strHttp]) && !([reqUrl hasPrefix:strHttps]) && !([reqUrl hasPrefix:strFiles])) {
        [[UIApplication sharedApplication] openURL:[request URL]];
        return NO;
    }
    return YES;
}

- (void)finishLaunching:(NSNotification *)notification
{
    NSLog(@"finishLaunching");
    // iOS6에서 세션끊어지는 상황 방지하기 위해 쿠키 설정. (iOS설정에서 사파리 쿠키 사용 설정도 필요)
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];
}

-(void)showAlertViewWithEvent:(NSString*)_msg tagNum:(NSInteger)tag
{
    UIAlertView *v = [[UIAlertView alloc]initWithTitle:@"알림"
                                               message:_msg
                                               delegate:self cancelButtonTitle:@"확인"
                                      otherButtonTitles:nil];
    v.tag = tag;
    [v show];
}

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    if(alertView.tag == 99) {
        // ISP 앱 스토어로 이동
        NSString* URLString = @"https://itunes.apple.com/app/mobail-gyeolje-isp/id369125087?mt=8";
        NSURL* storeURL = [NSURL URLWithString:URLString]; [[UIApplication sharedApplication] openURL:storeURL];
    }
}

- (NSDictionary *)parseQueryString:(NSString *)query {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:6];
    NSArray *pairs = [query componentsSeparatedByString:@"&"];
    
    for (NSString *pair in pairs) {
        NSArray *elements = [pair componentsSeparatedByString:@"="];
        NSString *key = [[elements objectAtIndex:0] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        NSString *val = [[elements objectAtIndex:1] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        
        [dict setObject:val forKey:key];
    }
    return dict;
}

@end