
out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000002ec84 <_$s16AsideNativeSwift22secureStorageBaseQuery3keySDySSypGSS_tF>:
   2ec84: d10583ff     	sub	sp, sp, #0x160
   2ec88: a9116ffc     	stp	x28, x27, [sp, #0x110]
   2ec8c: a9125ff8     	stp	x24, x23, [sp, #0x120]
   2ec90: a91357f6     	stp	x22, x21, [sp, #0x130]
   2ec94: a9144ff4     	stp	x20, x19, [sp, #0x140]
   2ec98: a9157bfd     	stp	x29, x30, [sp, #0x150]
   2ec9c: 910543fd     	add	x29, sp, #0x150
   2eca0: aa0103f3     	mov	x19, x1
   2eca4: aa0003f7     	mov	x23, x0
   2eca8: f0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2ecac: 9112c000     	add	x0, x0, #0x4b0
   2ecb0: 900027e1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2ecb4: 911ca021     	add	x1, x1, #0x728
   2ecb8: 97ffd5fd     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2ecbc: 910003e1     	mov	x1, sp
   2ecc0: 94139b71     	bl	 <dyld_stub_binder+0x515a84>
   2ecc4: aa0003f5     	mov	x21, x0
   2ecc8: 900027e8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2eccc: 3dc1a900     	ldr	q0, [x8, #0x6a0]
   2ecd0: 3d800400     	str	q0, [x0, #0x10]
   2ecd4: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ecd8: f9405108     	ldr	x8, [x8, #0xa0]
   2ecdc: f9400100     	ldr	x0, [x8]
   2ece0: 94139611     	bl	 <dyld_stub_binder+0x514524>
   2ece4: aa1503f4     	mov	x20, x21
   2ece8: f8020e80     	str	x0, [x20, #0x20]!
   2ecec: f90016a1     	str	x1, [x21, #0x28]
   2ecf0: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ecf4: f9405508     	ldr	x8, [x8, #0xa8]
   2ecf8: f9400116     	ldr	x22, [x8]
   2ecfc: d2800000     	mov	x0, #0x0                ; =0
   2ed00: 94007ad0     	bl	 <_$sSo11CFStringRefaMa>
   2ed04: f90026a0     	str	x0, [x21, #0x48]
   2ed08: f9001ab6     	str	x22, [x21, #0x30]
   2ed0c: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ed10: f9404d08     	ldr	x8, [x8, #0x98]
   2ed14: f9400100     	ldr	x0, [x8]
   2ed18: 94139603     	bl	 <dyld_stub_binder+0x514524>
   2ed1c: a90506a0     	stp	x0, x1, [x21, #0x50]
   2ed20: d00037b8     	adrp	x24, 0x724000 <dyld_stub_binder+0x724000>
   2ed24: f9412718     	ldr	x24, [x24, #0x248]
   2ed28: f9003eb8     	str	x24, [x21, #0x78]
   2ed2c: a9064eb7     	stp	x23, x19, [x21, #0x60]
   2ed30: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ed34: f9404908     	ldr	x8, [x8, #0x90]
   2ed38: f9400100     	ldr	x0, [x8]
   2ed3c: 941395fa     	bl	 <dyld_stub_binder+0x514524>
   2ed40: a90806a0     	stp	x0, x1, [x21, #0x80]
   2ed44: f90056b8     	str	x24, [x21, #0xa8]
   2ed48: a9094eb7     	stp	x23, x19, [x21, #0x90]
   2ed4c: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ed50: f9403908     	ldr	x8, [x8, #0x70]
   2ed54: f9400100     	ldr	x0, [x8]
   2ed58: 941395f3     	bl	 <dyld_stub_binder+0x514524>
   2ed5c: a90b06a0     	stp	x0, x1, [x21, #0xb0]
   2ed60: f0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2ed64: 9118c108     	add	x8, x8, #0x630
   2ed68: d1008108     	sub	x8, x8, #0x20
   2ed6c: b2410108     	orr	x8, x8, #0x8000000000000000
   2ed70: f9006eb8     	str	x24, [x21, #0xd8]
   2ed74: d28005c9     	mov	x9, #0x2e               ; =46
   2ed78: f2fa0009     	movk	x9, #0xd000, lsl #48
   2ed7c: a90c22a9     	stp	x9, x8, [x21, #0xc0]
   2ed80: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ed84: f9407108     	ldr	x8, [x8, #0xe0]
   2ed88: f9400100     	ldr	x0, [x8]
   2ed8c: 941395e6     	bl	 <dyld_stub_binder+0x514524>
   2ed90: a90e06a0     	stp	x0, x1, [x21, #0xe0]
   2ed94: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ed98: f9413508     	ldr	x8, [x8, #0x268]
   2ed9c: f90086a8     	str	x8, [x21, #0x108]
   2eda0: 52800028     	mov	w8, #0x1                ; =1
   2eda4: 3903c2a8     	strb	w8, [x21, #0xf0]
   2eda8: aa1303e0     	mov	x0, x19
   2edac: 52800041     	mov	w1, #0x2                ; =2
   2edb0: 94139b14     	bl	 <dyld_stub_binder+0x515a00>
   2edb4: aa1603e0     	mov	x0, x22
   2edb8: 94139a6d     	bl	 <dyld_stub_binder+0x51576c>
   2edbc: aa1503e0     	mov	x0, x21
   2edc0: 94007a55     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   2edc4: aa0003f3     	mov	x19, x0
   2edc8: aa1503e0     	mov	x0, x21
   2edcc: 94139b43     	bl	 <dyld_stub_binder+0x515ad8>
   2edd0: f0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2edd4: 9112e000     	add	x0, x0, #0x4b8
   2edd8: 900027e1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2eddc: 911cc021     	add	x1, x1, #0x730
   2ede0: 97ffd5b3     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2ede4: aa0003e2     	mov	x2, x0
   2ede8: aa1403e0     	mov	x0, x20
   2edec: 528000a1     	mov	w1, #0x5                ; =5
   2edf0: 94139af2     	bl	 <dyld_stub_binder+0x5159b8>
   2edf4: aa1303e0     	mov	x0, x19
   2edf8: a9557bfd     	ldp	x29, x30, [sp, #0x150]
   2edfc: a9544ff4     	ldp	x20, x19, [sp, #0x140]
   2ee00: a95357f6     	ldp	x22, x21, [sp, #0x130]
   2ee04: a9525ff8     	ldp	x24, x23, [sp, #0x120]
   2ee08: a9516ffc     	ldp	x28, x27, [sp, #0x110]
   2ee0c: 910583ff     	add	sp, sp, #0x160
   2ee10: d65f03c0     	ret

000000000002ee14 <_$s16AsideNativeSwift16secureStorageAdd3key4datas5Int32VSS_10Foundation4DataVtF>:
   2ee14: d10243ff     	sub	sp, sp, #0x90
   2ee18: a9055ff8     	stp	x24, x23, [sp, #0x50]
   2ee1c: a90657f6     	stp	x22, x21, [sp, #0x60]
   2ee20: a9074ff4     	stp	x20, x19, [sp, #0x70]
   2ee24: a9087bfd     	stp	x29, x30, [sp, #0x80]
   2ee28: 910203fd     	add	x29, sp, #0x80
   2ee2c: aa0303f3     	mov	x19, x3
   2ee30: aa0203f4     	mov	x20, x2
   2ee34: 97ffff94     	bl	 <_$s16AsideNativeSwift22secureStorageBaseQuery3keySDySSypGSS_tF>
   2ee38: aa0003f5     	mov	x21, x0
   2ee3c: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ee40: f9407508     	ldr	x8, [x8, #0xe8]
   2ee44: f9400100     	ldr	x0, [x8]
   2ee48: 941395b7     	bl	 <dyld_stub_binder+0x514524>
   2ee4c: aa0003f6     	mov	x22, x0
   2ee50: aa0103f7     	mov	x23, x1
   2ee54: a900cff4     	stp	x20, x19, [sp, #0x8]
   2ee58: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ee5c: f9401908     	ldr	x8, [x8, #0x30]
   2ee60: f90013e8     	str	x8, [sp, #0x20]
   2ee64: 910023e0     	add	x0, sp, #0x8
   2ee68: 9100a3e1     	add	x1, sp, #0x28
   2ee6c: 94007a7a     	bl	 <_$sypWOb>
   2ee70: aa1403e0     	mov	x0, x20
   2ee74: aa1303e1     	mov	x1, x19
   2ee78: 94007ad5     	bl	 <_$s10Foundation4DataV15_RepresentationOWOy>
   2ee7c: aa1503e0     	mov	x0, x21
   2ee80: 94139b07     	bl	 <dyld_stub_binder+0x515a9c>
   2ee84: aa0003e3     	mov	x3, x0
   2ee88: f90007f5     	str	x21, [sp, #0x8]
   2ee8c: 9100a3e0     	add	x0, sp, #0x28
   2ee90: 910023f4     	add	x20, sp, #0x8
   2ee94: aa1603e1     	mov	x1, x22
   2ee98: aa1703e2     	mov	x2, x23
   2ee9c: 94006d25     	bl	 <_$ss17_NativeDictionaryV8setValue_6forKey8isUniqueyq_n_xSbtFSS_ypTg5>
   2eea0: aa1703e0     	mov	x0, x23
   2eea4: 94139ace     	bl	 <dyld_stub_binder+0x5159dc>
   2eea8: f94007f4     	ldr	x20, [sp, #0x8]
   2eeac: f81c83b4     	stur	x20, [x29, #-0x38]
   2eeb0: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2eeb4: f9403d08     	ldr	x8, [x8, #0x78]
   2eeb8: f9400100     	ldr	x0, [x8]
   2eebc: 9413959a     	bl	 <dyld_stub_binder+0x514524>
   2eec0: aa0003f5     	mov	x21, x0
   2eec4: aa0103f3     	mov	x19, x1
   2eec8: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2eecc: f9404108     	ldr	x8, [x8, #0x80]
   2eed0: f9400116     	ldr	x22, [x8]
   2eed4: d2800000     	mov	x0, #0x0                ; =0
   2eed8: 94007a5a     	bl	 <_$sSo11CFStringRefaMa>
   2eedc: f90007f6     	str	x22, [sp, #0x8]
   2eee0: f90013e0     	str	x0, [sp, #0x20]
   2eee4: b4000260     	cbz	x0,  <L0>
   2eee8: 910023e0     	add	x0, sp, #0x8
   2eeec: 9100a3e1     	add	x1, sp, #0x28
   2eef0: 94007a59     	bl	 <_$sypWOb>
   2eef4: aa1603e0     	mov	x0, x22
   2eef8: 94139a1d     	bl	 <dyld_stub_binder+0x51576c>
   2eefc: aa1403e0     	mov	x0, x20
   2ef00: 94139ae7     	bl	 <dyld_stub_binder+0x515a9c>
   2ef04: aa0003e3     	mov	x3, x0
   2ef08: f90007f4     	str	x20, [sp, #0x8]
   2ef0c: 9100a3e0     	add	x0, sp, #0x28
   2ef10: 910023f4     	add	x20, sp, #0x8
   2ef14: aa1503e1     	mov	x1, x21
   2ef18: aa1303e2     	mov	x2, x19
   2ef1c: 94006d05     	bl	 <_$ss17_NativeDictionaryV8setValue_6forKey8isUniqueyq_n_xSbtFSS_ypTg5>
   2ef20: aa1303e0     	mov	x0, x19
   2ef24: 94139aae     	bl	 <dyld_stub_binder+0x5159dc>
   2ef28: f94007f3     	ldr	x19, [sp, #0x8]
   2ef2c: 14000017     	b	 <L1>
<L0>:
   2ef30: aa1603e0     	mov	x0, x22
   2ef34: 94139a0e     	bl	 <dyld_stub_binder+0x51576c>
   2ef38: f0003896     	adrp	x22, 0x741000 <__PROTOCOL_NSObject+0x48>
   2ef3c: 911242d6     	add	x22, x22, #0x490
   2ef40: 900027f7     	adrp	x23, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2ef44: 911c42f7     	add	x23, x23, #0x710
   2ef48: 910023e0     	add	x0, sp, #0x8
   2ef4c: aa1603e1     	mov	x1, x22
   2ef50: aa1703e2     	mov	x2, x23
   2ef54: 940082af     	bl	 <_$sypSgWOhTm>
   2ef58: 9100a3e8     	add	x8, sp, #0x28
   2ef5c: d100e3b4     	sub	x20, x29, #0x38
   2ef60: aa1503e0     	mov	x0, x21
   2ef64: aa1303e1     	mov	x1, x19
   2ef68: 94006cbe     	bl	 <_$sSD8_VariantV11removeValue6forKeyq_Sgx_tFSS_ypTg5>
   2ef6c: aa1303e0     	mov	x0, x19
   2ef70: 94139a9b     	bl	 <dyld_stub_binder+0x5159dc>
   2ef74: 9100a3e0     	add	x0, sp, #0x28
   2ef78: aa1603e1     	mov	x1, x22
   2ef7c: aa1703e2     	mov	x2, x23
   2ef80: 940082a4     	bl	 <_$sypSgWOhTm>
   2ef84: f85c83b3     	ldur	x19, [x29, #-0x38]
<L1>:
   2ef88: d00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2ef8c: f9416908     	ldr	x8, [x8, #0x2d0]
   2ef90: d00037a1     	adrp	x1, 0x724000 <dyld_stub_binder+0x724000>
   2ef94: f9412421     	ldr	x1, [x1, #0x248]
   2ef98: d00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2ef9c: f9412863     	ldr	x3, [x3, #0x250]
   2efa0: 91002102     	add	x2, x8, #0x8
   2efa4: aa1303e0     	mov	x0, x19
   2efa8: 94139550     	bl	 <dyld_stub_binder+0x5144e8>
   2efac: aa0003f4     	mov	x20, x0
   2efb0: d2800001     	mov	x1, #0x0                ; =0
   2efb4: 94139673     	bl	 <dyld_stub_binder+0x514980>
   2efb8: aa0003f5     	mov	x21, x0
   2efbc: aa1303e0     	mov	x0, x19
   2efc0: 94139a87     	bl	 <dyld_stub_binder+0x5159dc>
   2efc4: aa1403e0     	mov	x0, x20
   2efc8: 941399e6     	bl	 <dyld_stub_binder+0x515760>
   2efcc: aa1503e0     	mov	x0, x21
   2efd0: a9487bfd     	ldp	x29, x30, [sp, #0x80]
   2efd4: a9474ff4     	ldp	x20, x19, [sp, #0x70]
   2efd8: a94657f6     	ldp	x22, x21, [sp, #0x60]
   2efdc: a9455ff8     	ldp	x24, x23, [sp, #0x50]
   2efe0: 910243ff     	add	sp, sp, #0x90
   2efe4: d65f03c0     	ret

000000000002efe8 <_$s16AsideNativeSwift21secureStorageReadData3key10Foundation0G0VSgSS_tF>:
   2efe8: d10283ff     	sub	sp, sp, #0xa0
   2efec: a9065ff8     	stp	x24, x23, [sp, #0x60]
   2eff0: a90757f6     	stp	x22, x21, [sp, #0x70]
   2eff4: a9084ff4     	stp	x20, x19, [sp, #0x80]
   2eff8: a9097bfd     	stp	x29, x30, [sp, #0x90]
   2effc: 910243fd     	add	x29, sp, #0x90
   2f000: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f004: f940fd08     	ldr	x8, [x8, #0x1f8]
   2f008: f9400108     	ldr	x8, [x8]
   2f00c: f81c83a8     	stur	x8, [x29, #-0x38]
   2f010: 97ffff1d     	bl	 <_$s16AsideNativeSwift22secureStorageBaseQuery3keySDySSypGSS_tF>
   2f014: aa0003f3     	mov	x19, x0
   2f018: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f01c: f9406108     	ldr	x8, [x8, #0xc0]
   2f020: f9400100     	ldr	x0, [x8]
   2f024: 94139540     	bl	 <dyld_stub_binder+0x514524>
   2f028: aa0003f5     	mov	x21, x0
   2f02c: aa0103f6     	mov	x22, x1
   2f030: 52800028     	mov	w8, #0x1                ; =1
   2f034: 390063e8     	strb	w8, [sp, #0x18]
   2f038: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f03c: f9413508     	ldr	x8, [x8, #0x268]
   2f040: f9001be8     	str	x8, [sp, #0x30]
   2f044: 910063e0     	add	x0, sp, #0x18
   2f048: 9100e3e1     	add	x1, sp, #0x38
   2f04c: 94007a02     	bl	 <_$sypWOb>
   2f050: aa1303e0     	mov	x0, x19
   2f054: 94139a92     	bl	 <dyld_stub_binder+0x515a9c>
   2f058: aa0003e3     	mov	x3, x0
   2f05c: f9000ff3     	str	x19, [sp, #0x18]
   2f060: 9100e3e0     	add	x0, sp, #0x38
   2f064: 910063f4     	add	x20, sp, #0x18
   2f068: aa1503e1     	mov	x1, x21
   2f06c: aa1603e2     	mov	x2, x22
   2f070: 94006cb0     	bl	 <_$ss17_NativeDictionaryV8setValue_6forKey8isUniqueyq_n_xSbtFSS_ypTg5>
   2f074: aa1603e0     	mov	x0, x22
   2f078: 94139a59     	bl	 <dyld_stub_binder+0x5159dc>
   2f07c: f9400ff4     	ldr	x20, [sp, #0x18]
   2f080: f9000bf4     	str	x20, [sp, #0x10]
   2f084: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f088: f9405908     	ldr	x8, [x8, #0xb0]
   2f08c: f9400100     	ldr	x0, [x8]
   2f090: 94139525     	bl	 <dyld_stub_binder+0x514524>
   2f094: aa0003f5     	mov	x21, x0
   2f098: aa0103f3     	mov	x19, x1
   2f09c: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f0a0: f9405d08     	ldr	x8, [x8, #0xb8]
   2f0a4: f9400116     	ldr	x22, [x8]
   2f0a8: d2800000     	mov	x0, #0x0                ; =0
   2f0ac: 940079e5     	bl	 <_$sSo11CFStringRefaMa>
   2f0b0: f9000ff6     	str	x22, [sp, #0x18]
   2f0b4: f9001be0     	str	x0, [sp, #0x30]
   2f0b8: b4000260     	cbz	x0,  <L0>
   2f0bc: 910063e0     	add	x0, sp, #0x18
   2f0c0: 9100e3e1     	add	x1, sp, #0x38
   2f0c4: 940079e4     	bl	 <_$sypWOb>
   2f0c8: aa1603e0     	mov	x0, x22
   2f0cc: 941399a8     	bl	 <dyld_stub_binder+0x51576c>
   2f0d0: aa1403e0     	mov	x0, x20
   2f0d4: 94139a72     	bl	 <dyld_stub_binder+0x515a9c>
   2f0d8: aa0003e3     	mov	x3, x0
   2f0dc: f9000ff4     	str	x20, [sp, #0x18]
   2f0e0: 9100e3e0     	add	x0, sp, #0x38
   2f0e4: 910063f4     	add	x20, sp, #0x18
   2f0e8: aa1503e1     	mov	x1, x21
   2f0ec: aa1303e2     	mov	x2, x19
   2f0f0: 94006c90     	bl	 <_$ss17_NativeDictionaryV8setValue_6forKey8isUniqueyq_n_xSbtFSS_ypTg5>
   2f0f4: aa1303e0     	mov	x0, x19
   2f0f8: 94139a39     	bl	 <dyld_stub_binder+0x5159dc>
   2f0fc: f9400ff3     	ldr	x19, [sp, #0x18]
   2f100: 14000017     	b	 <L1>
<L0>:
   2f104: aa1603e0     	mov	x0, x22
   2f108: 94139999     	bl	 <dyld_stub_binder+0x51576c>
   2f10c: d0003896     	adrp	x22, 0x741000 <__PROTOCOL_NSObject+0x48>
   2f110: 911242d6     	add	x22, x22, #0x490
   2f114: f00027d7     	adrp	x23, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2f118: 911c42f7     	add	x23, x23, #0x710
   2f11c: 910063e0     	add	x0, sp, #0x18
   2f120: aa1603e1     	mov	x1, x22
   2f124: aa1703e2     	mov	x2, x23
   2f128: 9400823a     	bl	 <_$sypSgWOhTm>
   2f12c: 9100e3e8     	add	x8, sp, #0x38
   2f130: 910043f4     	add	x20, sp, #0x10
   2f134: aa1503e0     	mov	x0, x21
   2f138: aa1303e1     	mov	x1, x19
   2f13c: 94006c49     	bl	 <_$sSD8_VariantV11removeValue6forKeyq_Sgx_tFSS_ypTg5>
   2f140: aa1303e0     	mov	x0, x19
   2f144: 94139a26     	bl	 <dyld_stub_binder+0x5159dc>
   2f148: 9100e3e0     	add	x0, sp, #0x38
   2f14c: aa1603e1     	mov	x1, x22
   2f150: aa1703e2     	mov	x2, x23
   2f154: 9400822f     	bl	 <_$sypSgWOhTm>
   2f158: f9400bf3     	ldr	x19, [sp, #0x10]
<L1>:
   2f15c: f9000fff     	str	xzr, [sp, #0x18]
   2f160: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f164: f9416908     	ldr	x8, [x8, #0x2d0]
   2f168: b00037a1     	adrp	x1, 0x724000 <dyld_stub_binder+0x724000>
   2f16c: f9412421     	ldr	x1, [x1, #0x248]
   2f170: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2f174: f9412863     	ldr	x3, [x3, #0x250]
   2f178: 91002102     	add	x2, x8, #0x8
   2f17c: aa1303e0     	mov	x0, x19
   2f180: 941394da     	bl	 <dyld_stub_binder+0x5144e8>
   2f184: aa0003f4     	mov	x20, x0
   2f188: 910063e1     	add	x1, sp, #0x18
   2f18c: 94139600     	bl	 <dyld_stub_binder+0x51498c>
   2f190: aa0003f5     	mov	x21, x0
   2f194: aa1303e0     	mov	x0, x19
   2f198: 94139a11     	bl	 <dyld_stub_binder+0x5159dc>
   2f19c: aa1403e0     	mov	x0, x20
   2f1a0: 94139970     	bl	 <dyld_stub_binder+0x515760>
   2f1a4: 34000095     	cbz	w21,  <L2>
   2f1a8: d2800014     	mov	x20, #0x0               ; =0
   2f1ac: d2fe0013     	mov	x19, #-0x1000000000000000 ; =-1152921504606846976
   2f1b0: 14000015     	b	 <L4>
<L2>:
   2f1b4: f9400fe0     	ldr	x0, [sp, #0x18]
   2f1b8: d2fe0013     	mov	x19, #-0x1000000000000000 ; =-1152921504606846976
   2f1bc: b4000220     	cbz	x0,  <L3>
   2f1c0: f90007e0     	str	x0, [sp, #0x8]
   2f1c4: 94139a4b     	bl	 <dyld_stub_binder+0x515af0>
   2f1c8: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f1cc: f9416508     	ldr	x8, [x8, #0x2c8]
   2f1d0: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2f1d4: f9401863     	ldr	x3, [x3, #0x30]
   2f1d8: 9100e3e0     	add	x0, sp, #0x38
   2f1dc: 910023e1     	add	x1, sp, #0x8
   2f1e0: 91002102     	add	x2, x8, #0x8
   2f1e4: 528000c4     	mov	w4, #0x6                ; =6
   2f1e8: 94139a0f     	bl	 <dyld_stub_binder+0x515a24>
   2f1ec: a943a7e8     	ldp	x8, x9, [sp, #0x38]
   2f1f0: 7100001f     	cmp	w0, #0x0
   2f1f4: 9a9f1114     	csel	x20, x8, xzr, ne
   2f1f8: 9a931133     	csel	x19, x9, x19, ne
   2f1fc: 14000002     	b	 <L4>
<L3>:
   2f200: d2800014     	mov	x20, #0x0               ; =0
<L4>:
   2f204: f9400fe0     	ldr	x0, [sp, #0x18]
   2f208: 94139a37     	bl	 <dyld_stub_binder+0x515ae4>
   2f20c: f85c83a8     	ldur	x8, [x29, #-0x38]
   2f210: b00037a9     	adrp	x9, 0x724000 <dyld_stub_binder+0x724000>
   2f214: f940fd29     	ldr	x9, [x9, #0x1f8]
   2f218: f9400129     	ldr	x9, [x9]
   2f21c: eb08013f     	cmp	x9, x8
   2f220: 54000121     	b.ne	 <L5>
   2f224: aa1403e0     	mov	x0, x20
   2f228: aa1303e1     	mov	x1, x19
   2f22c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
   2f230: a9484ff4     	ldp	x20, x19, [sp, #0x80]
   2f234: a94757f6     	ldp	x22, x21, [sp, #0x70]
   2f238: a9465ff8     	ldp	x24, x23, [sp, #0x60]
   2f23c: 910283ff     	add	sp, sp, #0xa0
   2f240: d65f03c0     	ret
<L5>:
   2f244: 94139830     	bl	 <dyld_stub_binder+0x515304>

000000000002f248 <_$s16AsideNativeSwift23writeSecureStorageError_6statusySS_s5Int32VtF>:
   2f248: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
   2f24c: a90167fa     	stp	x26, x25, [sp, #0x10]
   2f250: a9025ff8     	stp	x24, x23, [sp, #0x20]
   2f254: a90357f6     	stp	x22, x21, [sp, #0x30]
   2f258: a9044ff4     	stp	x20, x19, [sp, #0x40]
   2f25c: a9057bfd     	stp	x29, x30, [sp, #0x50]
   2f260: 910143fd     	add	x29, sp, #0x50
   2f264: d10083ff     	sub	sp, sp, #0x20
   2f268: aa0203f8     	mov	x24, x2
   2f26c: aa0103f4     	mov	x20, x1
   2f270: aa0003fa     	mov	x26, x0
   2f274: d2800000     	mov	x0, #0x0                ; =0
   2f278: 941394b4     	bl	 <dyld_stub_binder+0x514548>
   2f27c: aa0003f3     	mov	x19, x0
   2f280: f85f801b     	ldur	x27, [x0, #-0x8]
   2f284: f9402368     	ldr	x8, [x27, #0x40]
   2f288: aa0803e9     	mov	x9, x8
   2f28c: b00037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   2f290: f940fa10     	ldr	x16, [x16, #0x1f0]
   2f294: d63f0200     	blr	x16
   2f298: 910003e9     	mov	x9, sp
   2f29c: 91003d08     	add	x8, x8, #0xf
   2f2a0: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   2f2a4: cb080135     	sub	x21, x9, x8
   2f2a8: 910002bf     	mov	sp, x21
   2f2ac: aa1803e0     	mov	x0, x24
   2f2b0: d2800001     	mov	x1, #0x0                ; =0
   2f2b4: 941395b0     	bl	 <dyld_stub_binder+0x514974>
   2f2b8: b4000100     	cbz	x0,  <L0>
   2f2bc: aa0003f6     	mov	x22, x0
   2f2c0: 94139499     	bl	 <dyld_stub_binder+0x514524>
   2f2c4: aa0003f9     	mov	x25, x0
   2f2c8: aa0103f7     	mov	x23, x1
   2f2cc: aa1603e0     	mov	x0, x22
   2f2d0: 94139924     	bl	 <dyld_stub_binder+0x515760>
   2f2d4: 14000006     	b	 <L1>
<L0>:
   2f2d8: d2fce017     	mov	x23, #-0x1900000000000000 ; =-1801439850948198400
   2f2dc: d28dceb9     	mov	x25, #0x6e75            ; =28277
   2f2e0: f2adcd79     	movk	x25, #0x6e6b, lsl #16
   2f2e4: f2ceedf9     	movk	x25, #0x776f, lsl #32
   2f2e8: f2e00dd9     	movk	x25, #0x6e, lsl #48
<L1>:
   2f2ec: d0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   2f2f0: f941f100     	ldr	x0, [x8, #0x3e0]
   2f2f4: 94139918     	bl	 <dyld_stub_binder+0x515754>
   2f2f8: 9413a09a     	bl	 <_objc_msgSend$fileHandleWithStandardError>
   2f2fc: aa1d03fd     	mov	x29, x29
   2f300: 9413991e     	bl	 <dyld_stub_binder+0x515778>
   2f304: aa0003f6     	mov	x22, x0
   2f308: a93a53ba     	stp	x26, x20, [x29, #-0x60]
   2f30c: aa1403e0     	mov	x0, x20
   2f310: 941399b9     	bl	 <dyld_stub_binder+0x5159f4>
   2f314: d10183b4     	sub	x20, x29, #0x60
   2f318: 52840740     	mov	w0, #0x203a             ; =8250
   2f31c: d2fc4001     	mov	x1, #-0x1e00000000000000 ; =-2161727821137838080
   2f320: 94139493     	bl	 <dyld_stub_binder+0x51456c>
   2f324: b819c3b8     	stur	w24, [x29, #-0x64]
   2f328: b00037a0     	adrp	x0, 0x724000 <dyld_stub_binder+0x724000>
   2f32c: f9415c00     	ldr	x0, [x0, #0x2b8]
   2f330: b00037a1     	adrp	x1, 0x724000 <dyld_stub_binder+0x724000>
   2f334: f9416021     	ldr	x1, [x1, #0x2c0]
   2f338: d10193b4     	sub	x20, x29, #0x64
   2f33c: 94139501     	bl	 <dyld_stub_binder+0x514740>
   2f340: aa0103f8     	mov	x24, x1
   2f344: d10183b4     	sub	x20, x29, #0x60
   2f348: 94139489     	bl	 <dyld_stub_binder+0x51456c>
   2f34c: aa1803e0     	mov	x0, x24
   2f350: 941399a3     	bl	 <dyld_stub_binder+0x5159dc>
   2f354: 52850400     	mov	w0, #0x2820             ; =10272
   2f358: d2fc4001     	mov	x1, #-0x1e00000000000000 ; =-2161727821137838080
   2f35c: 94139484     	bl	 <dyld_stub_binder+0x51456c>
   2f360: aa1903e0     	mov	x0, x25
   2f364: aa1703e1     	mov	x1, x23
   2f368: 94139481     	bl	 <dyld_stub_binder+0x51456c>
   2f36c: aa1703e0     	mov	x0, x23
   2f370: 9413999b     	bl	 <dyld_stub_binder+0x5159dc>
   2f374: 52814520     	mov	w0, #0xa29              ; =2601
   2f378: d2fc4001     	mov	x1, #-0x1e00000000000000 ; =-2161727821137838080
   2f37c: 9413947c     	bl	 <dyld_stub_binder+0x51456c>
   2f380: a97a63a8     	ldp	x8, x24, [x29, #-0x60]
   2f384: a93a63a8     	stp	x8, x24, [x29, #-0x60]
   2f388: aa1503e8     	mov	x8, x21
   2f38c: 9413946c     	bl	 <dyld_stub_binder+0x51453c>
   2f390: 940078b2     	bl	 <_$sS2SSysWl>
   2f394: aa0003e3     	mov	x3, x0
   2f398: b00037a2     	adrp	x2, 0x724000 <dyld_stub_binder+0x724000>
   2f39c: f9412442     	ldr	x2, [x2, #0x248]
   2f3a0: aa1503e0     	mov	x0, x21
   2f3a4: 52800001     	mov	w1, #0x0                ; =0
   2f3a8: 941394a7     	bl	 <dyld_stub_binder+0x514644>
   2f3ac: aa0003f4     	mov	x20, x0
   2f3b0: aa0103f7     	mov	x23, x1
   2f3b4: f9400768     	ldr	x8, [x27, #0x8]
   2f3b8: aa1503e0     	mov	x0, x21
   2f3bc: aa1303e1     	mov	x1, x19
   2f3c0: d63f0100     	blr	x8
   2f3c4: aa1803e0     	mov	x0, x24
   2f3c8: 94139985     	bl	 <dyld_stub_binder+0x5159dc>
   2f3cc: d37cfee8     	lsr	x8, x23, #60
   2f3d0: f100391f     	cmp	x8, #0xe
   2f3d4: 540002e8     	b.hi	 <L2>
   2f3d8: aa1403e0     	mov	x0, x20
   2f3dc: aa1703e1     	mov	x1, x23
   2f3e0: 9413935b     	bl	 <dyld_stub_binder+0x51414c>
   2f3e4: aa0003f3     	mov	x19, x0
   2f3e8: aa1403e0     	mov	x0, x20
   2f3ec: aa1703e1     	mov	x1, x23
   2f3f0: 9400819e     	bl	 <_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufc8IteratorQz_SitSwXEfU1_SS8UTF8ViewV_TG5TA+0x18>
   2f3f4: aa1603e0     	mov	x0, x22
   2f3f8: aa1303e2     	mov	x2, x19
   2f3fc: 9413a131     	bl	 <_objc_msgSend$writeData:>
   2f400: aa1603e0     	mov	x0, x22
   2f404: 941398d7     	bl	 <dyld_stub_binder+0x515760>
   2f408: aa1303e0     	mov	x0, x19
   2f40c: 941398d5     	bl	 <dyld_stub_binder+0x515760>
   2f410: d10143bf     	sub	sp, x29, #0x50
   2f414: a9457bfd     	ldp	x29, x30, [sp, #0x50]
   2f418: a9444ff4     	ldp	x20, x19, [sp, #0x40]
   2f41c: a94357f6     	ldp	x22, x21, [sp, #0x30]
   2f420: a9425ff8     	ldp	x24, x23, [sp, #0x20]
   2f424: a94167fa     	ldp	x26, x25, [sp, #0x10]
   2f428: a8c66ffc     	ldp	x28, x27, [sp], #0x60
   2f42c: d65f03c0     	ret
<L2>:
   2f430: d4200020     	brk	#0x1

000000000002f434 <_$s16AsideNativeSwift17secureStorageSave3key4dataSbSS_SStF>:
   2f434: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
   2f438: a90167fa     	stp	x26, x25, [sp, #0x10]
   2f43c: a9025ff8     	stp	x24, x23, [sp, #0x20]
   2f440: a90357f6     	stp	x22, x21, [sp, #0x30]
   2f444: a9044ff4     	stp	x20, x19, [sp, #0x40]
   2f448: a9057bfd     	stp	x29, x30, [sp, #0x50]
   2f44c: 910143fd     	add	x29, sp, #0x50
   2f450: d10083ff     	sub	sp, sp, #0x20
   2f454: aa0303f4     	mov	x20, x3
   2f458: aa0203fa     	mov	x26, x2
   2f45c: aa0103f6     	mov	x22, x1
   2f460: aa0003f7     	mov	x23, x0
   2f464: d2800000     	mov	x0, #0x0                ; =0
   2f468: 94139438     	bl	 <dyld_stub_binder+0x514548>
   2f46c: aa0003f8     	mov	x24, x0
   2f470: f85f8015     	ldur	x21, [x0, #-0x8]
   2f474: f94022a8     	ldr	x8, [x21, #0x40]
   2f478: aa0803e9     	mov	x9, x8
   2f47c: b00037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   2f480: f940fa10     	ldr	x16, [x16, #0x1f0]
   2f484: d63f0200     	blr	x16
   2f488: 910003e9     	mov	x9, sp
   2f48c: 91003d08     	add	x8, x8, #0xf
   2f490: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   2f494: cb080139     	sub	x25, x9, x8
   2f498: 9100033f     	mov	sp, x25
   2f49c: aa1703e0     	mov	x0, x23
   2f4a0: aa1603e1     	mov	x1, x22
   2f4a4: 97fffed1     	bl	 <_$s16AsideNativeSwift21secureStorageReadData3key10Foundation0G0VSgSS_tF>
   2f4a8: a93903a1     	stp	x1, x0, [x29, #-0x70]
   2f4ac: aa1703e0     	mov	x0, x23
   2f4b0: aa1603e1     	mov	x1, x22
   2f4b4: 97fffdf4     	bl	 <_$s16AsideNativeSwift22secureStorageBaseQuery3keySDySSypGSS_tF>
   2f4b8: aa0003fb     	mov	x27, x0
   2f4bc: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f4c0: f9416908     	ldr	x8, [x8, #0x2d0]
   2f4c4: b00037bc     	adrp	x28, 0x724000 <dyld_stub_binder+0x724000>
   2f4c8: f941279c     	ldr	x28, [x28, #0x248]
   2f4cc: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2f4d0: f9412863     	ldr	x3, [x3, #0x250]
   2f4d4: 91002102     	add	x2, x8, #0x8
   2f4d8: aa1c03e1     	mov	x1, x28
   2f4dc: 94139403     	bl	 <dyld_stub_binder+0x5144e8>
   2f4e0: aa0003f3     	mov	x19, x0
   2f4e4: aa1b03e0     	mov	x0, x27
   2f4e8: 9413993d     	bl	 <dyld_stub_binder+0x5159dc>
   2f4ec: aa1303e0     	mov	x0, x19
   2f4f0: 9413952a     	bl	 <dyld_stub_binder+0x514998>
   2f4f4: aa1303e0     	mov	x0, x19
   2f4f8: 9413989a     	bl	 <dyld_stub_binder+0x515760>
   2f4fc: a93a53ba     	stp	x26, x20, [x29, #-0x60]
   2f500: aa1903e8     	mov	x8, x25
   2f504: 9413940e     	bl	 <dyld_stub_binder+0x51453c>
   2f508: 94007854     	bl	 <_$sS2SSysWl>
   2f50c: aa0003e3     	mov	x3, x0
   2f510: d10183b4     	sub	x20, x29, #0x60
   2f514: aa1903e0     	mov	x0, x25
   2f518: 52800001     	mov	w1, #0x0                ; =0
   2f51c: aa1c03e2     	mov	x2, x28
   2f520: 94139449     	bl	 <dyld_stub_binder+0x514644>
   2f524: aa0003fa     	mov	x26, x0
   2f528: aa0103fb     	mov	x27, x1
   2f52c: f94006a8     	ldr	x8, [x21, #0x8]
   2f530: aa1903e0     	mov	x0, x25
   2f534: aa1803e1     	mov	x1, x24
   2f538: d63f0100     	blr	x8
   2f53c: d37cff68     	lsr	x8, x27, #60
   2f540: f100391f     	cmp	x8, #0xe
   2f544: 540006c8     	b.hi	 <L2>
   2f548: aa1703e0     	mov	x0, x23
   2f54c: aa1603e1     	mov	x1, x22
   2f550: aa1a03e2     	mov	x2, x26
   2f554: aa1b03e3     	mov	x3, x27
   2f558: 97fffe2f     	bl	 <_$s16AsideNativeSwift16secureStorageAdd3key4datas5Int32VSS_10Foundation4DataVtF>
   2f55c: aa0003f4     	mov	x20, x0
   2f560: aa1a03e0     	mov	x0, x26
   2f564: aa1b03e1     	mov	x1, x27
   2f568: 94008140     	bl	 <_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufc8IteratorQz_SitSwXEfU1_SS8UTF8ViewV_TG5TA+0x18>
   2f56c: f85903b3     	ldur	x19, [x29, #-0x70]
   2f570: 340003d4     	cbz	w20,  <L0>
   2f574: d2800348     	mov	x8, #0x1a               ; =26
   2f578: f2fa0008     	movk	x8, #0xd000, lsl #48
   2f57c: d0002749     	adrp	x9, 0x519000 <dyld_stub_binder+0x519000>
   2f580: 912d4129     	add	x9, x9, #0xb50
   2f584: d1008129     	sub	x9, x9, #0x20
   2f588: 91000d00     	add	x0, x8, #0x3
   2f58c: b2410121     	orr	x1, x9, #0x8000000000000000
   2f590: aa1403e2     	mov	x2, x20
   2f594: 97ffff2d     	bl	 <_$s16AsideNativeSwift23writeSecureStorageError_6statusySS_s5Int32VtF>
   2f598: d37cfe68     	lsr	x8, x19, #60
   2f59c: f100391f     	cmp	x8, #0xe
   2f5a0: 540002a8     	b.hi	 <L1>
   2f5a4: aa1703e0     	mov	x0, x23
   2f5a8: aa1603e1     	mov	x1, x22
   2f5ac: f85983a2     	ldur	x2, [x29, #-0x68]
   2f5b0: aa1303e3     	mov	x3, x19
   2f5b4: 97fffe18     	bl	 <_$s16AsideNativeSwift16secureStorageAdd3key4datas5Int32VSS_10Foundation4DataVtF>
   2f5b8: 128c5a48     	mov	w8, #-0x62d3            ; =-25299
   2f5bc: 6b08001f     	cmp	w0, w8
   2f5c0: 54000140     	b.eq	 <L0>
   2f5c4: aa0003e2     	mov	x2, x0
   2f5c8: 34000100     	cbz	w0,  <L0>
   2f5cc: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2f5d0: 912dc108     	add	x8, x8, #0xb70
   2f5d4: d1008108     	sub	x8, x8, #0x20
   2f5d8: b2410101     	orr	x1, x8, #0x8000000000000000
   2f5dc: d2800340     	mov	x0, #0x1a               ; =26
   2f5e0: f2fa0000     	movk	x0, #0xd000, lsl #48
   2f5e4: 97ffff19     	bl	 <_$s16AsideNativeSwift23writeSecureStorageError_6statusySS_s5Int32VtF>
<L0>:
   2f5e8: f85983a0     	ldur	x0, [x29, #-0x68]
   2f5ec: aa1303e1     	mov	x1, x19
   2f5f0: 9400811e     	bl	 <_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufc8IteratorQz_SitSwXEfU1_SS8UTF8ViewV_TG5TA+0x18>
<L1>:
   2f5f4: 7100029f     	cmp	w20, #0x0
   2f5f8: 1a9f17e0     	cset	w0, eq
   2f5fc: d10143bf     	sub	sp, x29, #0x50
   2f600: a9457bfd     	ldp	x29, x30, [sp, #0x50]
   2f604: a9444ff4     	ldp	x20, x19, [sp, #0x40]
   2f608: a94357f6     	ldp	x22, x21, [sp, #0x30]
   2f60c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
   2f610: a94167fa     	ldp	x26, x25, [sp, #0x10]
   2f614: a8c66ffc     	ldp	x28, x27, [sp], #0x60
   2f618: d65f03c0     	ret
<L2>:
   2f61c: d4200020     	brk	#0x1

000000000002f620 <_$s16AsideNativeSwift19secureStorageDelete3keyySS_tF>:
   2f620: f0ffffe2     	adrp	x2, 0x2e000 <_$s16AsideNativeSwift14cmdSessionSaveSSyF+0x698>
   2f624: 91321042     	add	x2, x2, #0xc84
   2f628: 14000dd1     	b	 <_$s16AsideNativeSwift19secureStorageDelete3keyySS_tFTm>

000000000002f62c <_$s16AsideNativeSwift17secureStorageRead3keySSSgSS_tF>:
   2f62c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
   2f630: a9014ff4     	stp	x20, x19, [sp, #0x10]
   2f634: a9027bfd     	stp	x29, x30, [sp, #0x20]
   2f638: 910083fd     	add	x29, sp, #0x20
   2f63c: aa0103f4     	mov	x20, x1
   2f640: aa0003f5     	mov	x21, x0
   2f644: d2800000     	mov	x0, #0x0                ; =0
   2f648: 941393c0     	bl	 <dyld_stub_binder+0x514548>
   2f64c: f85f8008     	ldur	x8, [x0, #-0x8]
   2f650: f9402108     	ldr	x8, [x8, #0x40]
   2f654: aa0803e9     	mov	x9, x8
   2f658: b00037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   2f65c: f940fa10     	ldr	x16, [x16, #0x1f0]
   2f660: d63f0200     	blr	x16
   2f664: 910003e9     	mov	x9, sp
   2f668: 91003d08     	add	x8, x8, #0xf
   2f66c: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   2f670: cb080133     	sub	x19, x9, x8
   2f674: 9100027f     	mov	sp, x19
   2f678: aa1503e0     	mov	x0, x21
   2f67c: aa1403e1     	mov	x1, x20
   2f680: 97fffe5a     	bl	 <_$s16AsideNativeSwift21secureStorageReadData3key10Foundation0G0VSgSS_tF>
   2f684: d2800003     	mov	x3, #0x0                ; =0
   2f688: d2800016     	mov	x22, #0x0               ; =0
   2f68c: d37cfc28     	lsr	x8, x1, #60
   2f690: f100391f     	cmp	x8, #0xe
   2f694: 540001e8     	b.hi	 <L0>
   2f698: aa1303e8     	mov	x8, x19
   2f69c: aa0003f4     	mov	x20, x0
   2f6a0: aa0103f5     	mov	x21, x1
   2f6a4: 941393a6     	bl	 <dyld_stub_binder+0x51453c>
   2f6a8: aa1403e0     	mov	x0, x20
   2f6ac: aa1503e1     	mov	x1, x21
   2f6b0: aa1303e2     	mov	x2, x19
   2f6b4: 9413939f     	bl	 <dyld_stub_binder+0x514530>
   2f6b8: aa0003f3     	mov	x19, x0
   2f6bc: aa0103f6     	mov	x22, x1
   2f6c0: aa1403e0     	mov	x0, x20
   2f6c4: aa1503e1     	mov	x1, x21
   2f6c8: 940080e8     	bl	 <_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufc8IteratorQz_SitSwXEfU1_SS8UTF8ViewV_TG5TA+0x18>
   2f6cc: aa1303e3     	mov	x3, x19
<L0>:
   2f6d0: aa0303e0     	mov	x0, x3
   2f6d4: aa1603e1     	mov	x1, x22
   2f6d8: d10083bf     	sub	sp, x29, #0x20
   2f6dc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
   2f6e0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
   2f6e4: a8c357f6     	ldp	x22, x21, [sp], #0x30
   2f6e8: d65f03c0     	ret
