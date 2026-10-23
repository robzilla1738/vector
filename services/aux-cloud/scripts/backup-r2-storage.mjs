import assert from 'node:assert/strict';

// Called only after an explicit command's exact recipient review is validated.
// No ambient AWS credential chain, endpoint override, automatic retries or ACLs.
export async function createR2Storage(review) {
  assert(/^[a-f0-9]{32}$/.test(review.accountId) && /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(review.bucket));
  const accessKeyId = process.env.AUX_BACKUP_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AUX_BACKUP_R2_SECRET_ACCESS_KEY;
  assert(accessKeyId && secretAccessKey, 'Explicit scoped R2 credentials required');
  const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({ endpoint: `https://${review.accountId}.r2.cloudflarestorage.com`, region: 'auto',
    credentials: { accessKeyId, secretAccessKey }, maxAttempts: 1, forcePathStyle: true,
    followRegionRedirects: false, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' });
  const send = (Constructor, input, signal) => client.send(new Constructor({ Bucket: review.bucket, ...input }), { abortSignal: signal });
  return {
    async get(Key, signal) {
      try { const value = await send(GetObjectCommand, { Key }, signal); return { body: value.Body, size: value.ContentLength }; }
      catch (error) { if (error?.$metadata?.httpStatusCode === 404) return null; throw error; }
    },
    put: (Key, Body, ContentLength, signal) => send(PutObjectCommand,
      { Key, Body, ContentLength, IfNoneMatch: '*', ContentType: 'application/octet-stream' }, signal),
    async list(Prefix, ContinuationToken, signal) {
      const value = await send(ListObjectsV2Command, { Prefix, ContinuationToken, MaxKeys: 1000 }, signal);
      assert(!value.IsTruncated || value.NextContinuationToken, 'Incomplete remote listing');
      const objects = (value.Contents ?? []).map(value => ({ key: value.Key, size: value.Size }));
      return { keys: objects.map(value => value.key), objects,
        next: value.IsTruncated ? value.NextContinuationToken : undefined };
    },
    delete: (Key, signal) => send(DeleteObjectCommand, { Key }, signal),
    destroy: () => client.destroy(),
  };
}
