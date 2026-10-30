/** The chat-app connection store: connections, their paired senders (principals), pairing
 * requests and per-connection policy, in the account's state.db. The functions have the supplied
 * names and arguments, since the channel manager and pairing flow call them too. A connection's
 * secrets are not here; they stay in the supplied secret store. Queries use the supplied query
 * builder and tables. */
export function create({stateDb, stores: {channels: c}}) {
  const {ChannelConnectionTable: connections, ChannelPrincipalTable: principals, ChannelPairingRequestTable: requests,
    ChannelPolicyTable: policies, ChannelConversationTable: conversations} = c.tables;
  const {eq, and, isNotNull, desc} = c.operators;
  const db = accountId => stateDb(accountId);
  const principal = (connectionId, senderId) => and(eq(principals.connectionId, connectionId), eq(principals.senderId, senderId));

  const listPairingRequests = (accountId, connectionId) => db(accountId).select().from(requests).where(eq(requests.connectionId, connectionId)).all();
  /** When a sender last wrote through the connection, or null. */
  const getConnectionLastUsedAt = (accountId, connectionId) => db(accountId).select({lastUsedAt: conversations.lastInboundAt}).from(conversations)
    .where(and(eq(conversations.connectionId, connectionId), isNotNull(conversations.lastInboundAt))).orderBy(desc(conversations.lastInboundAt)).get()?.lastUsedAt ?? null;

  return {
    listConnections: accountId => db(accountId).select().from(connections).all(),
    getConnection: (accountId, connectionId) => db(accountId).select().from(connections).where(eq(connections.id, connectionId)).get(),
    insertConnection: (accountId, values) => db(accountId).insert(connections).values(values).returning().get(),
    updateConnection(accountId, connectionId, changes) {
      db(accountId).update(connections).set({...changes, updatedAt: new Date()}).where(eq(connections.id, connectionId)).run();
    },
    deleteConnection(accountId, connectionId) {
      db(accountId).delete(connections).where(eq(connections.id, connectionId)).run();
    },
    listPrincipals: (accountId, connectionId) => db(accountId).select().from(principals).where(eq(principals.connectionId, connectionId)).all(),
    getPrincipal: (accountId, connectionId, senderId) => db(accountId).select().from(principals).where(principal(connectionId, senderId)).get(),
    /** A sender paired now, or renamed if already paired. */
    upsertPrincipal(accountId, {connectionId, senderId, displayName}) {
      db(accountId).insert(principals).values({connectionId, senderId, displayName: displayName ?? null, pairedAt: new Date()})
        .onConflictDoUpdate({target: [principals.connectionId, principals.senderId], set: {displayName: displayName ?? null}}).run();
    },
    deletePrincipal(accountId, connectionId, senderId) {
      db(accountId).delete(principals).where(principal(connectionId, senderId)).run();
    },
    setPrincipalPairingApproval(accountId, connectionId, senderId, canApprovePairing) {
      db(accountId).update(principals).set({canApprovePairing}).where(principal(connectionId, senderId)).run();
    },
    /** The stored policy, or the default when there is none or it no longer parses. */
    getConnectionPolicy(accountId, connectionId) {
      const row = db(accountId).select().from(policies).where(eq(policies.connectionId, connectionId)).get();
      return row ? c.policySchema.safeParse(row.policyJson).data ?? c.defaultPolicy : c.defaultPolicy;
    },
    setConnectionPolicy(accountId, connectionId, policy) {
      db(accountId).insert(policies).values({connectionId, policyJson: policy, updatedAt: new Date()})
        .onConflictDoUpdate({target: policies.connectionId, set: {policyJson: policy, updatedAt: new Date()}}).run();
    },
    listPairingRequests,
    getPairingRequest: (accountId, requestId) => db(accountId).select().from(requests).where(eq(requests.id, requestId)).get(),
    deletePairingRequest(accountId, requestId) {
      db(accountId).delete(requests).where(eq(requests.id, requestId)).run();
    },
    getConnectionLastUsedAt,
    /** A connection as clients see it: no secrets, its last use and how many pairing requests are still open. */
    toPublicConnection(accountId, connection) {
      const config = c.connectionConfigSchema.safeParse(connection.configJson).data, lastUsedAt = getConnectionLastUsedAt(accountId, connection.id), now = Date.now();
      return {id: connection.id, platform: connection.platform, displayName: connection.displayName, enabled: connection.enabled, status: connection.status,
        botUserId: connection.botUserId, botName: connection.botName, projectId: config?.projectId ?? null,
        applicationId: config?.platform === 'discord' ? config.applicationId : null, publicKey: config?.platform === 'discord' ? config.publicKey : null,
        statusCode: connection.statusCode, statusMessage: connection.statusMessage, lastUsedAt: lastUsedAt?.getTime() ?? null,
        pendingPairingCount: listPairingRequests(accountId, connection.id).filter(request => request.expiresAt > now).length};
    },
  };
}
