// Approval-gated exact-selector DP metadata/cleanup only. Never enumerate.
#include "dp-scope-policy.h"
#import <Foundation/Foundation.h>
#import <Security/Security.h>
#include <CommonCrypto/CommonDigest.h>
#include <node_api.h>
#include <dlfcn.h>
#include <sys/stat.h>
#include <unistd.h>
#include <limits.h>
#include <cstdlib>
#include <cstring>
#include <string>
namespace {
napi_value Fail(napi_env env) { napi_throw_error(env,nullptr,"Fixed DP probe scope/approval refused"); return nullptr; }
bool Gate() {
  const char *approved=getenv("AUX_DP_PROBE_APPROVED"),*home=getenv("AUX_HOME"),*scope=getenv("AUX_NATIVE_KEYCHAIN_SCOPE"),*probe=getenv("AUX_PROVIDED_DP_PROBE"),*enabled=getenv("AUX_ENABLE_PROVIDED_NATIVE_CARRIER");
  char canonical[PATH_MAX]; struct stat s;
  if(!approved||strcmp(approved,kDpProbeApprovalId)||!home||!realpath(home,canonical)||strcmp(canonical,kDpProbeHome)||stat(canonical,&s)||!S_ISDIR(s.st_mode)||s.st_uid!=geteuid()||(s.st_mode&07777)!=0700||!scope||strcmp(scope,kDpProbeScope)||!probe||strcmp(probe,"1")||!enabled||strcmp(enabled,"1")||getenv("AUX_PROVIDED_NATIVE_LOAD_ONLY"))return false;
  using Validate=bool(*)(const void*,const void*,const void*,const void*,const void*);using Denied=bool(*)();
  auto validate=reinterpret_cast<Validate>(dlsym(RTLD_DEFAULT,"AuxNativeBoundaryValidate"));auto denied=reinterpret_cast<Denied>(dlsym(RTLD_DEFAULT,"AuxNativeBoundaryIsDenyAll"));
  return validate&&denied&&!denied()&&validate((const void*)(unsigned long)&SecItemAdd,(const void*)(unsigned long)&SecItemCopyMatching,(const void*)(unsigned long)&SecItemDelete,(const void*)(unsigned long)&SecItemUpdate,(const void*)(unsigned long)&SecKeyCreateRandomKey);
}
napi_value Run(napi_env env,napi_callback_info info) {
  size_t count=1,length=0;napi_value input;
  if(napi_get_cb_info(env,info,&count,&input,nullptr,nullptr)!=napi_ok||count!=1||napi_get_value_string_utf8(env,input,nullptr,0,&length)!=napi_ok||length>16||!Gate())return Fail(env);
  char op[17]={};if(napi_get_value_string_utf8(env,input,op,sizeof(op),&length)!=napi_ok)return Fail(env);
  const bool cleanup=!strcmp(op,"cleanup");if(!cleanup&&strcmp(op,"baseline")&&strcmp(op,"inspect"))return Fail(env);
  @autoreleasepool {
    NSString *prefix=[NSString stringWithFormat:@"aux.%s.",kDpProbeScope];
    NSString *service=[prefix stringByAppendingString:@"aside.install"];
    NSArray *accounts=@[@"aside.install.meta",@"aside.install.sig",@"aside.install.kem",@"aside.dk"];
    napi_value result,statuses,groups;napi_create_object(env,&result);napi_create_array_with_length(env,4,&statuses);napi_create_array_with_length(env,4,&groups);
    for(uint32_t i=0;i<4;i++) {
      NSMutableDictionary *query=[@{(__bridge id)kSecClass:(__bridge id)kSecClassGenericPassword,(__bridge id)kSecAttrService:service,(__bridge id)kSecAttrAccount:[prefix stringByAppendingString:accounts[i]],(__bridge id)kSecUseDataProtectionKeychain:@YES,(__bridge id)kSecUseAuthenticationUI:(__bridge id)kSecUseAuthenticationUIFail} mutableCopy];
      OSStatus status;CFTypeRef attrs=nullptr;
      if(cleanup)status=SecItemDelete((__bridge CFDictionaryRef)query);
      else {query[(__bridge id)kSecReturnAttributes]=@YES;query[(__bridge id)kSecMatchLimit]=(__bridge id)kSecMatchLimitOne;status=SecItemCopyMatching((__bridge CFDictionaryRef)query,&attrs);}
      napi_value number,group;napi_create_int32(env,status,&number);napi_set_element(env,statuses,i,number);napi_get_null(env,&group);
      if(attrs&&CFGetTypeID(attrs)==CFDictionaryGetTypeID()) {
        id value=((__bridge NSDictionary*)attrs)[(__bridge id)kSecAttrAccessGroup];
        if([value isKindOfClass:[NSString class]]) {NSData *bytes=[value dataUsingEncoding:NSUTF8StringEncoding];unsigned char digest[CC_SHA256_DIGEST_LENGTH];CC_SHA256(bytes.bytes,(CC_LONG)bytes.length,digest);char hex[65];for(int j=0;j<32;j++)snprintf(hex+j*2,3,"%02x",digest[j]);napi_create_string_utf8(env,hex,64,&group);}
      }
      if(attrs)CFRelease(attrs);napi_set_element(env,groups,i,group);
    }
    napi_set_named_property(env,result,"statuses",statuses);napi_set_named_property(env,result,"accessGroupHashes",groups);return result;
  }
}
napi_value Init(napi_env env,napi_value exports) {napi_value run;napi_create_function(env,"run",NAPI_AUTO_LENGTH,Run,nullptr,&run);napi_set_named_property(env,exports,"run",run);return exports;}
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,Init)
