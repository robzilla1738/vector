#import <Foundation/Foundation.h>

// Blocking. Requires the separately accepted, scoped native query boundary.
// Returns the decoded original32-byte inbox key; never an installation key.
NSData *AuxLoadAgentInboxMasterKey();
