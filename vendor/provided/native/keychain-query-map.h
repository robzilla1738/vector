#import <Foundation/Foundation.h>
#import <Security/Security.h>

// Pure transformation. No Keychain/Secure Enclave call is made by this module.
// scope is SHA256(canonical AUX_HOME), encoded as exactly 64 lowercase hex digits.
NSDictionary* AuxMapKeychainQuery(NSDictionary* input, NSString* scope);
NSDictionary* AuxMapKeychainUpdate(NSDictionary* attributes, NSString* scope);
