#import <Foundation/Foundation.h>

// Pure query classification/mapping. These functions never access Keychain.
// scope must be SHA256(canonical AUX_HOME), exactly 64 lowercase hex digits.
// Classification includes malformed partial identities so callers can reject
// them without falling through to a less restrictive mapper.
bool AuxIsAgentInboxKeychainQuery(NSDictionary* input, NSString* scope);

// Returns nil unless input is exactly the supplied legacy generic-password read
// or add shape. Source and already-scoped identities are accepted; no other
// scope, mixed pair, extra attribute or opaque item handle is accepted.
NSDictionary* AuxMapAgentInboxKeychainQuery(NSDictionary* input,
                                            NSString* scope);
