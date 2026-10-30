/** The `referrals` tRPC namespace. The hosted Aux service has no referral routes, so the supplied
 * requests always failed there; this answers as the service would without the round trip: a
 * signed-out account is asked to sign in (its 401), a signed-in one is told the endpoint is not
 * available (its 404). The status and code ride on the error as on the supplied API errors, so
 * clients see the same tRPC code and app code. */
export function create({accountProcedure, referrals: r}) {
  const refuse = ({input}) => {
    if (!r.AccountRegistry.getSession(input.accountId)) throw Object.assign(Error('Sign in to continue.'), {status: 401, code: 'ACCESS_TOKEN_INVALID'});
    throw Object.assign(Error('This Aux endpoint is not available.'), {status: 404, code: 'AUX_API_ERROR'});
  };
  return {
    getGuestPasses: accountProcedure.query(refuse),
    getCode: accountProcedure.mutation(refuse),
  };
}
