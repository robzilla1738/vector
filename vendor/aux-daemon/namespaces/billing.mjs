/** The `billing` tRPC namespace. Aux has no payments, so every action that would start one is
 * refused after the same input checks, as the supplied launch policy refuses it. The plan,
 * subscription and usage are read from the hosted Aux service with the same requests; usage rows
 * name the task they came from when it is still on this device. The authenticated API client and
 * the subscription cache stay the supplied ones. */
export function create({accountProcedure, z, billing: b}) {
  const refuse = () => { throw Error('Aux payments are not enabled.'); };
  const usage = async ({input}) => {
    const offset = input.cursor ?? 0, query = new URLSearchParams({end: input.end, limit: String(input.limit), offset: String(offset), start: input.start});
    const page = await b.fetchAuxAPIAuthenticated(input.accountId, `/billing/v2/usage?${query}`, {output: b.usageResponseSchema}), sessions = new Map();
    return {...page, items: page.items.map(item => {
      if (item.session_id && !sessions.has(item.session_id)) sessions.set(item.session_id, b.SessionStore.get(input.accountId, item.session_id));
      const session = item.session_id ? sessions.get(item.session_id) : undefined, memory = item.usage_kind === 'memory_extraction';
      return {...item, model_id: item.model_id ?? session?.model.modelId ?? 'unknown', model_provider: item.model_provider, task_available: !memory && !!session,
        task_title: memory ? 'Memory extraction' : session?.title ?? item.session_title};
    }), next_cursor: page.has_more ? offset + page.items.length : null};
  };
  const {lookupKeySchema, creditCentsSchema, autoReloadSchema} = b;
  return {
    getSummary: accountProcedure.query(({input}) => b.fetchAuxAPIAuthenticated(input.accountId, '/billing/v2/subscription', {output: b.summaryResponseSchema})),
    getSubscription: accountProcedure.input(z.object({fresh: z.boolean().optional()})).query(({input}) => b.fetchBillingSubscription(input.accountId, {fresh: input.fresh})),
    getUsage: accountProcedure.input(z.object({cursor: z.number().int().nonnegative().optional(), end: b.datetime(), limit: z.number().int().min(1).max(100).default(100), start: b.datetime()}))
      .query(usage),
    createPortal: accountProcedure.input(z.object({place: z.enum(['settings', 'plan-change']).optional(), returnUrl: z.string().url()})).mutation(refuse),
    createCheckout: accountProcedure.input(z.object({lookupKey: lookupKeySchema, returnUrl: z.string().url()})).mutation(refuse),
    createAddOnCheckout: accountProcedure.input(z.object({cancelUrl: z.string().url(), creditCents: creditCentsSchema, successUrl: z.string().url()})).mutation(refuse),
    setAutoReload: accountProcedure.input(autoReloadSchema).mutation(refuse),
  };
}
