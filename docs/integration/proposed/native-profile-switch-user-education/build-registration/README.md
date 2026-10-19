# User education migration header dependency

Expose `//chrome/browser:buildflags` through the existing Views user-education
public target because the actual interface implementation header now uses the
Aux build flag. The source patch is pinned independently of the service migration
and is included in composition v80. No new target, promo or service is created.
