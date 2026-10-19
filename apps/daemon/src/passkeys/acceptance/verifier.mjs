import {
  createHash,
  createPublicKey,
  timingSafeEqual,
  verify,
} from 'node:crypto';

const hash = (value) => createHash('sha256').update(value).digest();
export function decode(value, maximum = 131072) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value))
    throw new Error('Invalid base64url field.');
  const result = Buffer.from(value, 'base64url');
  if (result.length > maximum || result.toString('base64url') !== value)
    throw new Error('Invalid base64url encoding or length.');
  return result;
}
export function readCbor(input, offset = 0, depth = 0) {
  if (depth > 8 || offset >= input.length) throw new Error('Invalid CBOR.');
  const first = input[offset++],
    major = first >> 5,
    additional = first & 31;
  let length;
  if (additional < 24) length = additional;
  else if (additional === 24 && offset < input.length) length = input[offset++];
  else if (additional === 25 && offset + 2 <= input.length) {
    length = input.readUInt16BE(offset);
    offset += 2;
  } else if (additional === 26 && offset + 4 <= input.length) {
    length = input.readUInt32BE(offset);
    offset += 4;
  } else throw new Error('Unsupported CBOR length.');
  if (major === 0 || major === 1)
    return { value: major ? -1 - length : length, offset };
  if (length > 131072) throw new Error('CBOR value is too large.');
  if (major === 2 || major === 3) {
    if (offset + length > input.length) throw new Error('Truncated CBOR.');
    const value = input.subarray(offset, offset + length);
    return {
      value:
        major === 2
          ? value
          : new TextDecoder('utf-8', { fatal: true }).decode(value),
      offset: offset + length,
    };
  }
  if (major !== 5 || length > 32) throw new Error('Unsupported CBOR value.');
  const value = new Map();
  for (let index = 0; index < length; index++) {
    const key = readCbor(input, offset, depth + 1);
    offset = key.offset;
    const entry = readCbor(input, offset, depth + 1);
    offset = entry.offset;
    if (value.has(key.value)) throw new Error('Duplicate CBOR map key.');
    value.set(key.value, entry.value);
  }
  return { value, offset };
}
function equal(actual, expected, message) {
  if (
    !Buffer.isBuffer(actual) ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  )
    throw new Error(message);
}
function common(result, ceremony) {
  if (
    result?.type !== 'public-key' ||
    result.authenticatorAttachment !== 'platform'
  )
    throw new Error('Expected an Aux platform credential.');
  const id = decode(result.rawId, 1024);
  if (result.id !== id.toString('base64url'))
    throw new Error('Credential ID mismatch.');
  const clientBytes = decode(result.response?.clientDataJSON);
  const client = JSON.parse(
    new TextDecoder('utf-8', { fatal: true }).decode(clientBytes),
  );
  if (
    client.type !== `webauthn.${ceremony.kind}` ||
    client.challenge !== ceremony.challenge ||
    client.origin !== ceremony.origin ||
    client.crossOrigin === true
  )
    throw new Error('Challenge, origin or ceremony type mismatch.');
  return { id, clientBytes };
}
function authenticatorData(data, ceremony, flags) {
  if (data.length < 37) throw new Error('Authenticator data is truncated.');
  equal(data.subarray(0, 32), hash(ceremony.rpId), 'RP hash mismatch.');
  if (data[32] !== flags)
    throw new Error('Expected exact UP/UV and single-device flags.');
  return data.readUInt32BE(33);
}
export function verifyRegistration(result, ceremony) {
  const { id } = common(result, ceremony);
  const attestation = decode(result.response.attestationObject);
  const parsed = readCbor(attestation);
  if (
    parsed.offset !== attestation.length ||
    !(parsed.value instanceof Map) ||
    parsed.value.get('fmt') !== 'none' ||
    !(parsed.value.get('attStmt') instanceof Map) ||
    parsed.value.get('attStmt').size !== 0
  )
    throw new Error('Expected none attestation.');
  const data = parsed.value.get('authData');
  if (!Buffer.isBuffer(data) || data.length < 55)
    throw new Error('Missing attested credential data.');
  const counter = authenticatorData(data, ceremony, 0x45);
  if (counter !== 0) throw new Error('Unexpected initial counter.');
  equal(
    data.subarray(37, 53),
    Buffer.alloc(16),
    'Expected none-attestation AAGUID.',
  );
  const idLength = data.readUInt16BE(53);
  if (idLength < 16 || idLength > 1024 || 55 + idLength >= data.length)
    throw new Error('Invalid credential ID length.');
  equal(
    data.subarray(55, 55 + idLength),
    id,
    'Attested credential ID mismatch.',
  );
  const cose = readCbor(data, 55 + idLength);
  if (
    cose.offset !== data.length ||
    !(cose.value instanceof Map) ||
    cose.value.get(1) !== 2 ||
    cose.value.get(3) !== -7 ||
    cose.value.get(-1) !== 1
  )
    throw new Error('Expected ES256 COSE EC2 public key.');
  const x = cose.value.get(-2),
    y = cose.value.get(-3);
  if (
    !Buffer.isBuffer(x) ||
    !Buffer.isBuffer(y) ||
    x.length !== 32 ||
    y.length !== 32
  )
    throw new Error('Invalid P-256 public coordinates.');
  const publicKey = createPublicKey({
    key: {
      kty: 'EC',
      crv: 'P-256',
      x: x.toString('base64url'),
      y: y.toString('base64url'),
    },
    format: 'jwk',
  });
  if (result.response.publicKeyAlgorithm !== -7)
    throw new Error('Public key algorithm mismatch.');
  equal(
    decode(result.response.publicKey),
    publicKey.export({ type: 'spki', format: 'der' }),
    'Public key DER does not match COSE.',
  );
  equal(
    decode(result.response.authenticatorData),
    data,
    'Authenticator data does not match attestation.',
  );
  if (result.clientExtensionResults?.credProps?.rk !== true)
    throw new Error('Discoverable credential was not confirmed.');
  return {
    id: id.toString('base64url'),
    publicKey,
    counter,
    userId: ceremony.userId,
  };
}
export function verifyAssertion(result, ceremony, credential) {
  const { id, clientBytes } = common(result, ceremony);
  if (id.toString('base64url') !== credential.id)
    throw new Error('Unexpected credential.');
  const data = decode(result.response.authenticatorData);
  const counter = authenticatorData(data, ceremony, 0x05);
  if (data.length !== 37 || counter <= credential.counter)
    throw new Error('Counter did not increase.');
  equal(
    decode(result.response.userHandle),
    decode(credential.userId),
    'User handle mismatch.',
  );
  if (
    !verify(
      'sha256',
      Buffer.concat([data, hash(clientBytes)]),
      credential.publicKey,
      decode(result.response.signature),
    )
  )
    throw new Error('ES256 assertion signature is invalid.');
  return { counter, flags: data[32], verified: true };
}
