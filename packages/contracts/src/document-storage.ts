/** Internal storage identity shared by runtime deletion and portable Forget sanitization. */
export const DOCUMENT_BODY_PREFIX = "conversationDocumentBody:";
export const documentBodyPrefix = (chatId: string) => `${DOCUMENT_BODY_PREFIX}${encodeURIComponent(chatId)}:`;
export const documentBodyKey = (chatId: string, attachmentId: string) =>
  `${documentBodyPrefix(chatId)}${attachmentId}`;

export const DOCUMENT_COLLECTION_PREFIX = "conversationAttachments:";
export const documentCollectionKey = (chatId: string) => `${DOCUMENT_COLLECTION_PREFIX}${chatId}`;
export const documentExcerptIdentity = (chatId: string, attachmentId: string) => [
  `setting:${documentCollectionKey(chatId)}`,
  attachmentId,
];

export const DOCUMENT_COLLECTION_PROOF_PREFIX = "document_collection_protection_v1:";
export const documentCollectionProofKey = (key: string) => `${DOCUMENT_COLLECTION_PROOF_PREFIX}${key}`;
