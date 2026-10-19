// Disposable generated-key fixtures only; never loads a supplied binding or
// carrier.
#include "base/at_exit.h"
#include "base/base64.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/devtools/aux_cdp_authority.h"
#include "crypto/keypair.h"
#include "crypto/sign.h"
#include "net/base/ip_address.h"

namespace {
bool Check(crypto::keypair::PrivateKey private_key,
           crypto::sign::SignatureKind kind, const char *scheme) {
  const auto public_key =
      crypto::keypair::PublicKey::FromPrivateKey(private_key);
  const auto raw = private_key.IsEcP256()
                       ? private_key.ToUncompressedX962Point()
                       : private_key.ToMldsa65PublicKey();
  base::DictValue public_json;
  public_json.Set("scheme", scheme);
  public_json.Set("sig", base::Base64Encode(raw));
  auto imported =
      aux::ParseInstallationPublicKey(*base::WriteJson(public_json));
  if (!imported)
    return false;
  const std::string bytes(32, 'x');
  const std::string challenge = base::Base64Encode(bytes);
  auto sign = [&](std::string_view message) {
    return base::Base64Encode(
        crypto::sign::Sign(kind, private_key, base::as_byte_span(message)));
  };
  const auto raw_signature = sign(bytes);
  const auto http_signature =
      sign(std::string("Aux Daemon Auth v1\0", 19) + bytes);
  if (!aux::VerifyCdpChallenge(*imported, challenge, raw_signature) ||
      aux::VerifyInstallationChallenge(*imported, challenge, raw_signature) ||
      !aux::VerifyInstallationChallenge(*imported, challenge, http_signature) ||
      aux::VerifyCdpChallenge(*imported, challenge, http_signature) ||
      aux::VerifyCdpChallenge(
          *imported, base::Base64Encode(std::string(32, 'y')), raw_signature) ||
      aux::VerifyCdpChallenge(*imported, base::Base64Encode("short"),
                              raw_signature))
    return false;
  auto tampered = *base::Base64Decode(raw_signature);
  tampered.back() ^= 1;
  if (aux::VerifyCdpChallenge(*imported, challenge,
                              base::Base64Encode(tampered)))
    return false;
  public_json.Set("scheme", private_key.IsEcP256() ? "pq_v1" : "p256_v1");
  if (aux::ParseInstallationPublicKey(*base::WriteJson(public_json)))
    return false;
  aux::CdpAuthority authority(public_key, 45203, {});
  net::HttpServerRequestInfo request;
  request.peer = net::IPEndPoint(net::IPAddress::IPv4Localhost(), 40000);
  request.headers["host"] = "127.0.0.1:45203";
  request.method = "GET";
  request.path = "/json/challenge";
  auto response = authority.Filter(request, false);
  if (!response || response->status != 200)
    return false;
  auto issued =
      base::JSONReader::ReadDict(response->body, base::JSON_PARSE_RFC);
  if (!issued || !issued->FindString("challenge") ||
      !issued->FindString("challengeId"))
    return false;
  auto issued_bytes = base::Base64Decode(*issued->FindString("challenge"));
  if (!issued_bytes)
    return false;
  base::DictValue session;
  session.Set("challengeId", *issued->FindString("challengeId"));
  session.Set("signedChallenge",
              sign(std::string_view(
                  reinterpret_cast<const char *>(issued_bytes->data()),
                  issued_bytes->size())));
  request.method = "POST";
  request.path = "/json/auth/session";
  request.data = *base::WriteJson(session);
  response = authority.Filter(request, false);
  if (!response || response->status != 200)
    return false;
  response = authority.Filter(request, false);
  return response && response->status == 401;
}
} // namespace
int main() {
  base::AtExitManager at_exit;
  return Check(crypto::keypair::PrivateKey::GenerateEcP256(),
               crypto::sign::ECDSA_SHA256, "p256_v1") &&
                 Check(crypto::keypair::PrivateKey::GenerateMldsa65(),
                       crypto::sign::MLDSA_65, "pq_v1")
             ? 0
             : 1;
}
