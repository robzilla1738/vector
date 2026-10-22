#!/usr/bin/env python3
"""Source-only check. Never loads the addon or calls Security/Keychain APIs."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
manifest=json.loads((ROOT/'source-pins.json').read_text())
for item in manifest['files']:
    data=(ROOT/item['path']).read_bytes()
    assert len(data)<=1024*1024 and hashlib.sha256(data).hexdigest()==item['sha256']
source=(ROOT/'source/InstallationSecurityExecutor.swift').read_text()
assert re.findall(r'\b(SecItem\w+)\s*\(',source)==['SecItemCopyMatching','SecItemAdd']
assert not re.search(r'FileHandle|FileManager|Data\(contentsOf|SecAccessControlCreateWithFlags\s*\(|PrivateKey\(',source)
assert 'if status==errSecItemNotFound{return .missing}' in source
assert 'guard status==errSecSuccess else{return .securityFailure(status)}' in source
assert 'CFGetTypeID(result)==CFDataGetTypeID()' in source
assert source.index('count<=16_384')<source.index('Data(bytes:pointer,count:count)')
assert 'request.selector==review.binding(role).target' in source
assert 'query[kSecUseAuthenticationUI as String]=kSecUseAuthenticationUIFail' in source
assert 'return SecItemAdd(query as CFDictionary,nil)' in source
queries=(ROOT/'../aux-native-install-storage-port/source/RecoveredInstallStorageQueries.swift').read_text()
for recipe in ['kSecClass as String: kSecClassGenericPassword','kSecAttrService as String: selector.service','kSecAttrAccount as String: selector.account','kSecAttrAccessGroup as String: selector.accessGroup','kSecUseDataProtectionKeychain as String: true','query[kSecReturnData as String] = true','query[kSecMatchLimit as String] = kSecMatchLimitOne','query[kSecValueData as String] = data','query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly']:
    assert recipe in queries
print('PASS: pinned selector-bound read/create-only source, recovered DP/attribute recipes, exact status/type distinctions. No Security execution.')
