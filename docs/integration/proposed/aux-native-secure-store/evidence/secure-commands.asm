
out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000002f6ec <_$s16AsideNativeSwift13cmdSecureSaveSSyF>:
   2f6ec: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
   2f6f0: a90167fa     	stp	x26, x25, [sp, #0x10]
   2f6f4: a9025ff8     	stp	x24, x23, [sp, #0x20]
   2f6f8: a90357f6     	stp	x22, x21, [sp, #0x30]
   2f6fc: a9044ff4     	stp	x20, x19, [sp, #0x40]
   2f700: a9057bfd     	stp	x29, x30, [sp, #0x50]
   2f704: 910143fd     	add	x29, sp, #0x50
   2f708: d10503ff     	sub	sp, sp, #0x140
   2f70c: 910003f3     	mov	x19, sp
   2f710: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2f714: f940fd08     	ldr	x8, [x8, #0x1f8]
   2f718: f9400108     	ldr	x8, [x8]
   2f71c: f81a83a8     	stur	x8, [x29, #-0x58]
   2f720: d2800000     	mov	x0, #0x0                ; =0
   2f724: 94139389     	bl	 <dyld_stub_binder+0x514548>
   2f728: f85f8008     	ldur	x8, [x0, #-0x8]
   2f72c: f9402108     	ldr	x8, [x8, #0x40]
   2f730: aa0803e9     	mov	x9, x8
   2f734: b00037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   2f738: f940fa10     	ldr	x16, [x16, #0x1f0]
   2f73c: d63f0200     	blr	x16
   2f740: 910003e9     	mov	x9, sp
   2f744: 91003d08     	add	x8, x8, #0xf
   2f748: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   2f74c: cb080135     	sub	x21, x9, x8
   2f750: 910002bf     	mov	sp, x21
   2f754: 97ffd3d2     	bl	 <_$s16AsideNativeSwift13readStdinJsonSDySSypGSgyF>
   2f758: b00037ba     	adrp	x26, 0x724000 <dyld_stub_binder+0x724000>
   2f75c: f9416b5a     	ldr	x26, [x26, #0x2d0]
   2f760: b4000680     	cbz	x0,  <L3>
   2f764: aa0003f4     	mov	x20, x0
   2f768: f9400808     	ldr	x8, [x0, #0x10]
   2f76c: b40005e8     	cbz	x8,  <L1>
   2f770: aa1403e0     	mov	x0, x20
   2f774: 941398a0     	bl	 <dyld_stub_binder+0x5159f4>
   2f778: 528cad60     	mov	w0, #0x656b             ; =25963
   2f77c: 72a00f20     	movk	w0, #0x79, lsl #16
   2f780: d2fc6001     	mov	x1, #-0x1d00000000000000 ; =-2089670227099910144
   2f784: 940069fb     	bl	 <_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5>
   2f788: 360004c1     	tbz	w1, #0x0,  <L0>
   2f78c: f9401e88     	ldr	x8, [x20, #0x38]
   2f790: 8b001500     	add	x0, x8, x0, lsl #5
   2f794: 91030261     	add	x1, x19, #0xc0
   2f798: 940077d0     	bl	 <_$sypWOc>
   2f79c: aa1403e0     	mov	x0, x20
   2f7a0: 9413988f     	bl	 <dyld_stub_binder+0x5159dc>
   2f7a4: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2f7a8: f9412463     	ldr	x3, [x3, #0x248]
   2f7ac: 91002260     	add	x0, x19, #0x8
   2f7b0: 91030261     	add	x1, x19, #0xc0
   2f7b4: 91002342     	add	x2, x26, #0x8
   2f7b8: 528000c4     	mov	w4, #0x6                ; =6
   2f7bc: 9413989a     	bl	 <dyld_stub_binder+0x515a24>
   2f7c0: 36000340     	tbz	w0, #0x0,  <L1>
   2f7c4: a940da78     	ldp	x24, x22, [x19, #0x8]
   2f7c8: 9240bf08     	and	x8, x24, #0xffffffffffff
   2f7cc: d378eec9     	ubfx	x9, x22, #56, #4
   2f7d0: f24302df     	tst	x22, #0x2000000000000000
   2f7d4: 9a890108     	csel	x8, x8, x9, eq
   2f7d8: b4001168     	cbz	x8,  <L8>
   2f7dc: 91030277     	add	x23, x19, #0xc0
   2f7e0: f9400a88     	ldr	x8, [x20, #0x10]
   2f7e4: b40011c8     	cbz	x8,  <L10>
   2f7e8: aa1403e0     	mov	x0, x20
   2f7ec: 94139882     	bl	 <dyld_stub_binder+0x5159f4>
   2f7f0: 528c2c80     	mov	w0, #0x6164             ; =24932
   2f7f4: 72ac2e80     	movk	w0, #0x6174, lsl #16
   2f7f8: d2fc8001     	mov	x1, #-0x1c00000000000000 ; =-2017612633061982208
   2f7fc: 940069dd     	bl	 <_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5>
   2f800: 360010a1     	tbz	w1, #0x0,  <L9>
   2f804: f9401e88     	ldr	x8, [x20, #0x38]
   2f808: 8b001500     	add	x0, x8, x0, lsl #5
   2f80c: 91030261     	add	x1, x19, #0xc0
   2f810: 940077b2     	bl	 <_$sypWOc>
   2f814: aa1403e0     	mov	x0, x20
   2f818: 94139871     	bl	 <dyld_stub_binder+0x5159dc>
   2f81c: 14000082     	b	 <L11>
<L0>:
   2f820: aa1403e0     	mov	x0, x20
   2f824: 9413986e     	bl	 <dyld_stub_binder+0x5159dc>
<L1>:
   2f828: aa1403e0     	mov	x0, x20
<L2>:
   2f82c: 9413986c     	bl	 <dyld_stub_binder+0x5159dc>
<L3>:
   2f830: b00037b7     	adrp	x23, 0x724000 <dyld_stub_binder+0x724000>
   2f834: f94126f7     	ldr	x23, [x23, #0x248]
   2f838: d28004b4     	mov	x20, #0x25              ; =37
   2f83c: f2fa0014     	movk	x20, #0xd000, lsl #48
   2f840: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2f844: 912e4108     	add	x8, x8, #0xb90
   2f848: d1008108     	sub	x8, x8, #0x20
   2f84c: b2410116     	orr	x22, x8, #0x8000000000000000
   2f850: d0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2f854: 9112c000     	add	x0, x0, #0x4b0
   2f858: f00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2f85c: 911ca021     	add	x1, x1, #0x728
   2f860: 97ffd313     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2f864: d102a3a1     	sub	x1, x29, #0xa8
   2f868: 94139887     	bl	 <dyld_stub_binder+0x515a84>
   2f86c: aa0003f8     	mov	x24, x0
   2f870: f00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2f874: 3dc1a500     	ldr	q0, [x8, #0x690]
   2f878: 3d800400     	str	q0, [x0, #0x10]
   2f87c: d28e4ca8     	mov	x8, #0x7265             ; =29285
   2f880: f2adee48     	movk	x8, #0x6f72, lsl #16
   2f884: f2c00e48     	movk	x8, #0x72, lsl #32
   2f888: aa0003f9     	mov	x25, x0
   2f88c: f8020f28     	str	x8, [x25, #0x20]!
   2f890: d2fca008     	mov	x8, #-0x1b00000000000000 ; =-1945555039024054272
   2f894: f9002417     	str	x23, [x0, #0x48]
   2f898: d1000a89     	sub	x9, x20, #0x2
   2f89c: a902a408     	stp	x8, x9, [x0, #0x28]
   2f8a0: f9001c16     	str	x22, [x0, #0x38]
   2f8a4: 9400779c     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   2f8a8: aa0003f6     	mov	x22, x0
   2f8ac: aa1803e0     	mov	x0, x24
   2f8b0: 9413988a     	bl	 <dyld_stub_binder+0x515ad8>
   2f8b4: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2f8b8: 9112e021     	add	x1, x1, #0x4b8
   2f8bc: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2f8c0: 911cc042     	add	x2, x2, #0x730
   2f8c4: aa1903e0     	mov	x0, x25
   2f8c8: 94008052     	bl	 <_$sypSgWOhTm>
   2f8cc: d0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   2f8d0: f941ed00     	ldr	x0, [x8, #0x3d8]
   2f8d4: 941397a0     	bl	 <dyld_stub_binder+0x515754>
   2f8d8: aa0003f8     	mov	x24, x0
   2f8dc: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2f8e0: f9412863     	ldr	x3, [x3, #0x250]
   2f8e4: 91002342     	add	x2, x26, #0x8
   2f8e8: aa1603e0     	mov	x0, x22
   2f8ec: aa1703e1     	mov	x1, x23
   2f8f0: 941392fe     	bl	 <dyld_stub_binder+0x5144e8>
   2f8f4: aa0003f9     	mov	x25, x0
   2f8f8: f900627f     	str	xzr, [x19, #0xc0]
   2f8fc: 91030264     	add	x4, x19, #0xc0
   2f900: aa1803e0     	mov	x0, x24
   2f904: aa1903e2     	mov	x2, x25
   2f908: d2800003     	mov	x3, #0x0                ; =0
   2f90c: 94139ee5     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   2f910: aa1d03fd     	mov	x29, x29
<L4>:
   2f914: 94139799     	bl	 <dyld_stub_binder+0x515778>
   2f918: aa0003f7     	mov	x23, x0
   2f91c: aa1903e0     	mov	x0, x25
   2f920: 94139790     	bl	 <dyld_stub_binder+0x515760>
   2f924: f9406260     	ldr	x0, [x19, #0xc0]
   2f928: 94139791     	bl	 <dyld_stub_binder+0x51576c>
   2f92c: b40002f7     	cbz	x23,  <L5>
   2f930: aa1703e0     	mov	x0, x23
   2f934: 9413920c     	bl	 <dyld_stub_binder+0x514164>
   2f938: aa0003f8     	mov	x24, x0
   2f93c: aa0103f9     	mov	x25, x1
   2f940: aa1703e0     	mov	x0, x23
   2f944: 94139787     	bl	 <dyld_stub_binder+0x515760>
   2f948: aa1503e8     	mov	x8, x21
   2f94c: 941392fc     	bl	 <dyld_stub_binder+0x51453c>
   2f950: aa1803e0     	mov	x0, x24
   2f954: aa1903e1     	mov	x1, x25
   2f958: aa1503e2     	mov	x2, x21
   2f95c: 941392f5     	bl	 <dyld_stub_binder+0x514530>
   2f960: aa0003f7     	mov	x23, x0
   2f964: aa0103f5     	mov	x21, x1
   2f968: aa1803e0     	mov	x0, x24
   2f96c: aa1903e1     	mov	x1, x25
   2f970: 9400774a     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   2f974: b40001d5     	cbz	x21,  <L6>
   2f978: aa1603e0     	mov	x0, x22
   2f97c: 94139818     	bl	 <dyld_stub_binder+0x5159dc>
   2f980: aa1703f4     	mov	x20, x23
   2f984: 14000010     	b	 <L7>
<L5>:
   2f988: aa0003f5     	mov	x21, x0
   2f98c: 941391ba     	bl	 <dyld_stub_binder+0x514074>
   2f990: aa0003f7     	mov	x23, x0
   2f994: aa1503e0     	mov	x0, x21
   2f998: 94139772     	bl	 <dyld_stub_binder+0x515760>
   2f99c: aa1703f5     	mov	x21, x23
   2f9a0: 94139857     	bl	 <dyld_stub_binder+0x515afc>
   2f9a4: aa1703e0     	mov	x0, x23
   2f9a8: 94139822     	bl	 <dyld_stub_binder+0x515a30>
<L6>:
   2f9ac: aa1603e0     	mov	x0, x22
   2f9b0: 9413980b     	bl	 <dyld_stub_binder+0x5159dc>
   2f9b4: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2f9b8: 911e8108     	add	x8, x8, #0x7a0
   2f9bc: d1008108     	sub	x8, x8, #0x20
   2f9c0: b2410115     	orr	x21, x8, #0x8000000000000000
<L7>:
   2f9c4: f85a83a8     	ldur	x8, [x29, #-0x58]
   2f9c8: b00037a9     	adrp	x9, 0x724000 <dyld_stub_binder+0x724000>
   2f9cc: f940fd29     	ldr	x9, [x9, #0x1f8]
   2f9d0: f9400129     	ldr	x9, [x9]
   2f9d4: eb08013f     	cmp	x9, x8
   2f9d8: 54001961     	b.ne	 <L17>
   2f9dc: aa1403e0     	mov	x0, x20
   2f9e0: aa1503e1     	mov	x1, x21
   2f9e4: d10143bf     	sub	sp, x29, #0x50
   2f9e8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
   2f9ec: a9444ff4     	ldp	x20, x19, [sp, #0x40]
   2f9f0: a94357f6     	ldp	x22, x21, [sp, #0x30]
   2f9f4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
   2f9f8: a94167fa     	ldp	x26, x25, [sp, #0x10]
   2f9fc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
   2fa00: d65f03c0     	ret
<L8>:
   2fa04: aa1403e0     	mov	x0, x20
   2fa08: 941397f5     	bl	 <dyld_stub_binder+0x5159dc>
   2fa0c: aa1603e0     	mov	x0, x22
   2fa10: 17ffff87     	b	 <L2>
<L9>:
   2fa14: aa1403e0     	mov	x0, x20
   2fa18: 941397f1     	bl	 <dyld_stub_binder+0x5159dc>
<L10>:
   2fa1c: 6f00e400     	movi.2d	v0, #0000000000000000
   2fa20: ad0002e0     	stp	q0, q0, [x23]
<L11>:
   2fa24: aa1403e0     	mov	x0, x20
   2fa28: 941397ed     	bl	 <dyld_stub_binder+0x5159dc>
   2fa2c: f9406e68     	ldr	x8, [x19, #0xd8]
   2fa30: b4000cc8     	cbz	x8,  <L12>
   2fa34: b00037b7     	adrp	x23, 0x724000 <dyld_stub_binder+0x724000>
   2fa38: f94126f7     	ldr	x23, [x23, #0x248]
   2fa3c: 91002260     	add	x0, x19, #0x8
   2fa40: 91030261     	add	x1, x19, #0xc0
   2fa44: 91002342     	add	x2, x26, #0x8
   2fa48: aa1703e3     	mov	x3, x23
   2fa4c: 528000c4     	mov	w4, #0x6                ; =6
   2fa50: 941397f5     	bl	 <dyld_stub_binder+0x515a24>
   2fa54: 36000cc0     	tbz	w0, #0x0,  <L13>
   2fa58: a940d262     	ldp	x2, x20, [x19, #0x8]
   2fa5c: aa1803e0     	mov	x0, x24
   2fa60: aa1603e1     	mov	x1, x22
   2fa64: aa1403e3     	mov	x3, x20
   2fa68: 97fffe73     	bl	 <_$s16AsideNativeSwift17secureStorageSave3key4dataSbSS_SStF>
   2fa6c: aa0003f8     	mov	x24, x0
   2fa70: aa1603e0     	mov	x0, x22
   2fa74: 941397da     	bl	 <dyld_stub_binder+0x5159dc>
   2fa78: aa1403e0     	mov	x0, x20
   2fa7c: 941397d8     	bl	 <dyld_stub_binder+0x5159dc>
   2fa80: 36000bb8     	tbz	w24, #0x0,  <L14>
   2fa84: d0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fa88: 9112c000     	add	x0, x0, #0x4b0
   2fa8c: f00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fa90: 911ca021     	add	x1, x1, #0x728
   2fa94: 97ffd286     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2fa98: 91008261     	add	x1, x19, #0x20
   2fa9c: 941397fa     	bl	 <dyld_stub_binder+0x515a84>
   2faa0: aa0003f4     	mov	x20, x0
   2faa4: f00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2faa8: 3dc1a500     	ldr	q0, [x8, #0x690]
   2faac: 3d800400     	str	q0, [x0, #0x10]
   2fab0: d28eae68     	mov	x8, #0x7573             ; =30067
   2fab4: f2ac6c68     	movk	x8, #0x6363, lsl #16
   2fab8: f2ce6ca8     	movk	x8, #0x7365, lsl #32
   2fabc: f2e00e68     	movk	x8, #0x73, lsl #48
   2fac0: aa0003f7     	mov	x23, x0
   2fac4: f8020ee8     	str	x8, [x23, #0x20]!
   2fac8: d2fce008     	mov	x8, #-0x1900000000000000 ; =-1801439850948198400
   2facc: f9001408     	str	x8, [x0, #0x28]
   2fad0: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2fad4: f9413508     	ldr	x8, [x8, #0x268]
   2fad8: f9002408     	str	x8, [x0, #0x48]
   2fadc: 52800028     	mov	w8, #0x1                ; =1
   2fae0: 3900c008     	strb	w8, [x0, #0x30]
   2fae4: 9400770c     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   2fae8: aa0003f6     	mov	x22, x0
   2faec: aa1403e0     	mov	x0, x20
   2faf0: 941397fa     	bl	 <dyld_stub_binder+0x515ad8>
   2faf4: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2faf8: 9112e021     	add	x1, x1, #0x4b8
   2fafc: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fb00: 911cc042     	add	x2, x2, #0x730
   2fb04: aa1703e0     	mov	x0, x23
   2fb08: 94007fc2     	bl	 <_$sypSgWOhTm>
   2fb0c: d0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fb10: f941ed00     	ldr	x0, [x8, #0x3d8]
   2fb14: 94139710     	bl	 <dyld_stub_binder+0x515754>
   2fb18: aa0003f4     	mov	x20, x0
   2fb1c: b00037a1     	adrp	x1, 0x724000 <dyld_stub_binder+0x724000>
   2fb20: f9412421     	ldr	x1, [x1, #0x248]
   2fb24: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2fb28: f9412863     	ldr	x3, [x3, #0x250]
   2fb2c: 91002342     	add	x2, x26, #0x8
   2fb30: aa1603e0     	mov	x0, x22
   2fb34: 9413926d     	bl	 <dyld_stub_binder+0x5144e8>
   2fb38: aa0003f7     	mov	x23, x0
   2fb3c: f900627f     	str	xzr, [x19, #0xc0]
   2fb40: 91030264     	add	x4, x19, #0xc0
   2fb44: aa1403e0     	mov	x0, x20
   2fb48: aa1703e2     	mov	x2, x23
   2fb4c: d2800003     	mov	x3, #0x0                ; =0
   2fb50: 94139e54     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   2fb54: aa1d03fd     	mov	x29, x29
   2fb58: 94139708     	bl	 <dyld_stub_binder+0x515778>
   2fb5c: aa0003f4     	mov	x20, x0
   2fb60: aa1703e0     	mov	x0, x23
   2fb64: 941396ff     	bl	 <dyld_stub_binder+0x515760>
   2fb68: f9406260     	ldr	x0, [x19, #0xc0]
   2fb6c: 94139700     	bl	 <dyld_stub_binder+0x51576c>
   2fb70: b4000b34     	cbz	x20,  <L15>
   2fb74: aa1403e0     	mov	x0, x20
   2fb78: 9413917b     	bl	 <dyld_stub_binder+0x514164>
   2fb7c: aa0003f7     	mov	x23, x0
   2fb80: aa0103f8     	mov	x24, x1
   2fb84: aa1403e0     	mov	x0, x20
   2fb88: 941396f6     	bl	 <dyld_stub_binder+0x515760>
   2fb8c: aa1503e8     	mov	x8, x21
   2fb90: 9413926b     	bl	 <dyld_stub_binder+0x51453c>
   2fb94: aa1703e0     	mov	x0, x23
   2fb98: aa1803e1     	mov	x1, x24
   2fb9c: aa1503e2     	mov	x2, x21
   2fba0: 94139264     	bl	 <dyld_stub_binder+0x514530>
   2fba4: aa0003f4     	mov	x20, x0
   2fba8: aa0103f5     	mov	x21, x1
   2fbac: aa1703e0     	mov	x0, x23
   2fbb0: aa1803e1     	mov	x1, x24
   2fbb4: 940076b9     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   2fbb8: b4000a15     	cbz	x21,  <L16>
   2fbbc: aa1603e0     	mov	x0, x22
   2fbc0: 94139787     	bl	 <dyld_stub_binder+0x5159dc>
   2fbc4: 17ffff80     	b	 <L7>
<L12>:
   2fbc8: aa1603e0     	mov	x0, x22
   2fbcc: 94139784     	bl	 <dyld_stub_binder+0x5159dc>
   2fbd0: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fbd4: 91124021     	add	x1, x1, #0x490
   2fbd8: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fbdc: 911c4042     	add	x2, x2, #0x710
   2fbe0: 91030260     	add	x0, x19, #0xc0
   2fbe4: 94007f8b     	bl	 <_$sypSgWOhTm>
   2fbe8: 17ffff12     	b	 <L3>
<L13>:
   2fbec: aa1603e0     	mov	x0, x22
   2fbf0: 17ffff0f     	b	 <L2>
<L14>:
   2fbf4: d28004b4     	mov	x20, #0x25              ; =37
   2fbf8: f2fa0014     	movk	x20, #0xd000, lsl #48
   2fbfc: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2fc00: 912f0108     	add	x8, x8, #0xbc0
   2fc04: d1008108     	sub	x8, x8, #0x20
   2fc08: b2410116     	orr	x22, x8, #0x8000000000000000
   2fc0c: d0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fc10: 9112c000     	add	x0, x0, #0x4b0
   2fc14: f00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fc18: 911ca021     	add	x1, x1, #0x728
   2fc1c: 97ffd224     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2fc20: 9101c261     	add	x1, x19, #0x70
   2fc24: 94139798     	bl	 <dyld_stub_binder+0x515a84>
   2fc28: aa0003f8     	mov	x24, x0
   2fc2c: f00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fc30: 3dc1a500     	ldr	q0, [x8, #0x690]
   2fc34: 3d800400     	str	q0, [x0, #0x10]
   2fc38: d28e4ca8     	mov	x8, #0x7265             ; =29285
   2fc3c: f2adee48     	movk	x8, #0x6f72, lsl #16
   2fc40: f2c00e48     	movk	x8, #0x72, lsl #32
   2fc44: aa0003f9     	mov	x25, x0
   2fc48: f8020f28     	str	x8, [x25, #0x20]!
   2fc4c: d2fca008     	mov	x8, #-0x1b00000000000000 ; =-1945555039024054272
   2fc50: f9002417     	str	x23, [x0, #0x48]
   2fc54: d1000e89     	sub	x9, x20, #0x3
   2fc58: a902a408     	stp	x8, x9, [x0, #0x28]
   2fc5c: f9001c16     	str	x22, [x0, #0x38]
   2fc60: 940076ad     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   2fc64: aa0003f6     	mov	x22, x0
   2fc68: aa1803e0     	mov	x0, x24
   2fc6c: 9413979b     	bl	 <dyld_stub_binder+0x515ad8>
   2fc70: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fc74: 9112e021     	add	x1, x1, #0x4b8
   2fc78: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fc7c: 911cc042     	add	x2, x2, #0x730
   2fc80: aa1903e0     	mov	x0, x25
   2fc84: 94007f63     	bl	 <_$sypSgWOhTm>
   2fc88: d0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fc8c: f941ed00     	ldr	x0, [x8, #0x3d8]
   2fc90: 941396b1     	bl	 <dyld_stub_binder+0x515754>
   2fc94: aa0003f8     	mov	x24, x0
   2fc98: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2fc9c: f9412863     	ldr	x3, [x3, #0x250]
   2fca0: 91002342     	add	x2, x26, #0x8
   2fca4: aa1603e0     	mov	x0, x22
   2fca8: aa1703e1     	mov	x1, x23
   2fcac: 9413920f     	bl	 <dyld_stub_binder+0x5144e8>
   2fcb0: aa0003f9     	mov	x25, x0
   2fcb4: f900627f     	str	xzr, [x19, #0xc0]
   2fcb8: 91030264     	add	x4, x19, #0xc0
   2fcbc: aa1803e0     	mov	x0, x24
   2fcc0: aa1903e2     	mov	x2, x25
   2fcc4: d2800003     	mov	x3, #0x0                ; =0
   2fcc8: 94139df6     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   2fccc: aa1d03fd     	mov	x29, x29
   2fcd0: 17ffff11     	b	 <L4>
<L15>:
   2fcd4: aa0003f4     	mov	x20, x0
   2fcd8: 941390e7     	bl	 <dyld_stub_binder+0x514074>
   2fcdc: aa0003f7     	mov	x23, x0
   2fce0: aa1403e0     	mov	x0, x20
   2fce4: 9413969f     	bl	 <dyld_stub_binder+0x515760>
   2fce8: aa1703f5     	mov	x21, x23
   2fcec: 94139784     	bl	 <dyld_stub_binder+0x515afc>
   2fcf0: aa1703e0     	mov	x0, x23
   2fcf4: 9413974f     	bl	 <dyld_stub_binder+0x515a30>
<L16>:
   2fcf8: d28004b4     	mov	x20, #0x25              ; =37
   2fcfc: f2fa0014     	movk	x20, #0xd000, lsl #48
   2fd00: 17ffff2b     	b	 <L6>
<L17>:
   2fd04: 94139580     	bl	 <dyld_stub_binder+0x515304>

000000000002fd08 <_$s16AsideNativeSwift13cmdSecureReadSSyF>:
   2fd08: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
   2fd0c: a90167fa     	stp	x26, x25, [sp, #0x10]
   2fd10: a9025ff8     	stp	x24, x23, [sp, #0x20]
   2fd14: a90357f6     	stp	x22, x21, [sp, #0x30]
   2fd18: a9044ff4     	stp	x20, x19, [sp, #0x40]
   2fd1c: a9057bfd     	stp	x29, x30, [sp, #0x50]
   2fd20: 910143fd     	add	x29, sp, #0x50
   2fd24: d10543ff     	sub	sp, sp, #0x150
   2fd28: 910003f3     	mov	x19, sp
   2fd2c: d10243b6     	sub	x22, x29, #0x90
   2fd30: b00037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   2fd34: f940fd08     	ldr	x8, [x8, #0x1f8]
   2fd38: f9400108     	ldr	x8, [x8]
   2fd3c: f81983a8     	stur	x8, [x29, #-0x68]
   2fd40: d2800000     	mov	x0, #0x0                ; =0
   2fd44: 94139201     	bl	 <dyld_stub_binder+0x514548>
   2fd48: f85f8008     	ldur	x8, [x0, #-0x8]
   2fd4c: f9402108     	ldr	x8, [x8, #0x40]
   2fd50: aa0803e9     	mov	x9, x8
   2fd54: b00037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   2fd58: f940fa10     	ldr	x16, [x16, #0x1f0]
   2fd5c: d63f0200     	blr	x16
   2fd60: 910003e9     	mov	x9, sp
   2fd64: 91003d08     	add	x8, x8, #0xf
   2fd68: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   2fd6c: cb080135     	sub	x21, x9, x8
   2fd70: 910002bf     	mov	sp, x21
   2fd74: 97ffd24a     	bl	 <_$s16AsideNativeSwift13readStdinJsonSDySSypGSgyF>
   2fd78: b00037bb     	adrp	x27, 0x724000 <dyld_stub_binder+0x724000>
   2fd7c: f9416b7b     	ldr	x27, [x27, #0x2d0]
   2fd80: b40005e0     	cbz	x0,  <L1>
   2fd84: aa0003f4     	mov	x20, x0
   2fd88: f9400808     	ldr	x8, [x0, #0x10]
   2fd8c: b40004e8     	cbz	x8,  <L0>
   2fd90: 528cad60     	mov	w0, #0x656b             ; =25963
   2fd94: 72a00f20     	movk	w0, #0x79, lsl #16
   2fd98: d2fc6001     	mov	x1, #-0x1d00000000000000 ; =-2089670227099910144
   2fd9c: 94006875     	bl	 <_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5>
   2fda0: 36000441     	tbz	w1, #0x0,  <L0>
   2fda4: f9401e88     	ldr	x8, [x20, #0x38]
   2fda8: 8b001500     	add	x0, x8, x0, lsl #5
   2fdac: d10243a1     	sub	x1, x29, #0x90
   2fdb0: 9400764a     	bl	 <_$sypWOc>
   2fdb4: aa1403e0     	mov	x0, x20
   2fdb8: 94139709     	bl	 <dyld_stub_binder+0x5159dc>
   2fdbc: f85883a8     	ldur	x8, [x29, #-0x78]
   2fdc0: b4000428     	cbz	x8,  <L2>
   2fdc4: b00037b4     	adrp	x20, 0x724000 <dyld_stub_binder+0x724000>
   2fdc8: f9412694     	ldr	x20, [x20, #0x248]
   2fdcc: 91002260     	add	x0, x19, #0x8
   2fdd0: d10243a1     	sub	x1, x29, #0x90
   2fdd4: 91002362     	add	x2, x27, #0x8
   2fdd8: aa1403e3     	mov	x3, x20
   2fddc: 528000c4     	mov	w4, #0x6                ; =6
   2fde0: 94139711     	bl	 <dyld_stub_binder+0x515a24>
   2fde4: 360003c0     	tbz	w0, #0x0,  <L3>
   2fde8: a940da60     	ldp	x0, x22, [x19, #0x8]
   2fdec: 9240bc08     	and	x8, x0, #0xffffffffffff
   2fdf0: d378eec9     	ubfx	x9, x22, #56, #4
   2fdf4: f24302df     	tst	x22, #0x2000000000000000
   2fdf8: 9a890108     	csel	x8, x8, x9, eq
   2fdfc: b40011a8     	cbz	x8,  <L7>
   2fe00: 528c2c9c     	mov	w28, #0x6164            ; =24932
   2fe04: 72ac2e9c     	movk	w28, #0x6174, lsl #16
   2fe08: aa1603e1     	mov	x1, x22
   2fe0c: 97fffc77     	bl	 <_$s16AsideNativeSwift21secureStorageReadData3key10Foundation0G0VSgSS_tF>
   2fe10: d37cfc28     	lsr	x8, x1, #60
   2fe14: f100391f     	cmp	x8, #0xe
   2fe18: 54001129     	b.ls	 <L8>
   2fe1c: aa1603e0     	mov	x0, x22
   2fe20: 941396ef     	bl	 <dyld_stub_binder+0x5159dc>
   2fe24: 140000c7     	b	 <L9>
<L0>:
   2fe28: 6f00e400     	movi.2d	v0, #0000000000000000
   2fe2c: ad0002c0     	stp	q0, q0, [x22]
   2fe30: aa1403e0     	mov	x0, x20
   2fe34: 941396ea     	bl	 <dyld_stub_binder+0x5159dc>
   2fe38: 14000003     	b	 <L2>
<L1>:
   2fe3c: 6f00e400     	movi.2d	v0, #0000000000000000
   2fe40: ad0002c0     	stp	q0, q0, [x22]
<L2>:
   2fe44: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fe48: 91124021     	add	x1, x1, #0x490
   2fe4c: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fe50: 911c4042     	add	x2, x2, #0x710
   2fe54: d10243a0     	sub	x0, x29, #0x90
   2fe58: 94007eee     	bl	 <_$sypSgWOhTm>
<L3>:
   2fe5c: b00037b7     	adrp	x23, 0x724000 <dyld_stub_binder+0x724000>
   2fe60: f94126f7     	ldr	x23, [x23, #0x248]
   2fe64: d28004b4     	mov	x20, #0x25              ; =37
   2fe68: f2fa0014     	movk	x20, #0xd000, lsl #48
   2fe6c: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2fe70: 912fc108     	add	x8, x8, #0xbf0
   2fe74: d1008108     	sub	x8, x8, #0x20
   2fe78: b2410116     	orr	x22, x8, #0x8000000000000000
   2fe7c: d0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fe80: 9112c000     	add	x0, x0, #0x4b0
   2fe84: f00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fe88: 911ca021     	add	x1, x1, #0x728
   2fe8c: 97ffd188     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   2fe90: 91030261     	add	x1, x19, #0xc0
   2fe94: 941396fc     	bl	 <dyld_stub_binder+0x515a84>
   2fe98: aa0003f8     	mov	x24, x0
   2fe9c: f00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2fea0: 3dc1a500     	ldr	q0, [x8, #0x690]
   2fea4: 3d800400     	str	q0, [x0, #0x10]
   2fea8: d28e4ca8     	mov	x8, #0x7265             ; =29285
   2feac: f2adee48     	movk	x8, #0x6f72, lsl #16
   2feb0: f2c00e48     	movk	x8, #0x72, lsl #32
   2feb4: aa0003f9     	mov	x25, x0
   2feb8: f8020f28     	str	x8, [x25, #0x20]!
   2febc: d2fca008     	mov	x8, #-0x1b00000000000000 ; =-1945555039024054272
   2fec0: f9002417     	str	x23, [x0, #0x48]
   2fec4: d1000a89     	sub	x9, x20, #0x2
   2fec8: a902a408     	stp	x8, x9, [x0, #0x28]
   2fecc: f9001c16     	str	x22, [x0, #0x38]
   2fed0: 94007611     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   2fed4: aa0003f6     	mov	x22, x0
   2fed8: aa1803e0     	mov	x0, x24
   2fedc: 941396ff     	bl	 <dyld_stub_binder+0x515ad8>
   2fee0: d0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fee4: 9112e021     	add	x1, x1, #0x4b8
   2fee8: f00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   2feec: 911cc042     	add	x2, x2, #0x730
   2fef0: aa1903e0     	mov	x0, x25
   2fef4: 94007ec7     	bl	 <_$sypSgWOhTm>
   2fef8: d0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   2fefc: f941ed00     	ldr	x0, [x8, #0x3d8]
   2ff00: 94139615     	bl	 <dyld_stub_binder+0x515754>
   2ff04: aa0003f8     	mov	x24, x0
   2ff08: b00037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   2ff0c: f9412863     	ldr	x3, [x3, #0x250]
   2ff10: 91002362     	add	x2, x27, #0x8
   2ff14: aa1603e0     	mov	x0, x22
   2ff18: aa1703e1     	mov	x1, x23
   2ff1c: 94139173     	bl	 <dyld_stub_binder+0x5144e8>
   2ff20: aa0003f9     	mov	x25, x0
   2ff24: f81703bf     	stur	xzr, [x29, #-0x90]
   2ff28: d10243a4     	sub	x4, x29, #0x90
   2ff2c: aa1803e0     	mov	x0, x24
   2ff30: aa1903e2     	mov	x2, x25
   2ff34: d2800003     	mov	x3, #0x0                ; =0
   2ff38: 94139d5a     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   2ff3c: aa1d03fd     	mov	x29, x29
   2ff40: 9413960e     	bl	 <dyld_stub_binder+0x515778>
   2ff44: aa0003f7     	mov	x23, x0
   2ff48: aa1903e0     	mov	x0, x25
   2ff4c: 94139605     	bl	 <dyld_stub_binder+0x515760>
   2ff50: f85703a0     	ldur	x0, [x29, #-0x90]
   2ff54: 94139606     	bl	 <dyld_stub_binder+0x51576c>
   2ff58: b40002f7     	cbz	x23,  <L4>
   2ff5c: aa1703e0     	mov	x0, x23
   2ff60: 94139081     	bl	 <dyld_stub_binder+0x514164>
   2ff64: aa0003f8     	mov	x24, x0
   2ff68: aa0103f9     	mov	x25, x1
   2ff6c: aa1703e0     	mov	x0, x23
   2ff70: 941395fc     	bl	 <dyld_stub_binder+0x515760>
   2ff74: aa1503e8     	mov	x8, x21
   2ff78: 94139171     	bl	 <dyld_stub_binder+0x51453c>
   2ff7c: aa1803e0     	mov	x0, x24
   2ff80: aa1903e1     	mov	x1, x25
   2ff84: aa1503e2     	mov	x2, x21
   2ff88: 9413916a     	bl	 <dyld_stub_binder+0x514530>
   2ff8c: aa0003f7     	mov	x23, x0
   2ff90: aa0103f5     	mov	x21, x1
   2ff94: aa1803e0     	mov	x0, x24
   2ff98: aa1903e1     	mov	x1, x25
   2ff9c: 940075bf     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   2ffa0: b40001d5     	cbz	x21,  <L5>
   2ffa4: aa1603e0     	mov	x0, x22
   2ffa8: 9413968d     	bl	 <dyld_stub_binder+0x5159dc>
   2ffac: aa1703f4     	mov	x20, x23
   2ffb0: 14000010     	b	 <L6>
<L4>:
   2ffb4: aa0003f5     	mov	x21, x0
   2ffb8: 9413902f     	bl	 <dyld_stub_binder+0x514074>
   2ffbc: aa0003f7     	mov	x23, x0
   2ffc0: aa1503e0     	mov	x0, x21
   2ffc4: 941395e7     	bl	 <dyld_stub_binder+0x515760>
   2ffc8: aa1703f5     	mov	x21, x23
   2ffcc: 941396cc     	bl	 <dyld_stub_binder+0x515afc>
   2ffd0: aa1703e0     	mov	x0, x23
   2ffd4: 94139697     	bl	 <dyld_stub_binder+0x515a30>
<L5>:
   2ffd8: aa1603e0     	mov	x0, x22
   2ffdc: 94139680     	bl	 <dyld_stub_binder+0x5159dc>
   2ffe0: d0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   2ffe4: 911e8108     	add	x8, x8, #0x7a0
   2ffe8: d1008108     	sub	x8, x8, #0x20
   2ffec: b2410115     	orr	x21, x8, #0x8000000000000000
<L6>:
   2fff0: f85983a8     	ldur	x8, [x29, #-0x68]
   2fff4: b00037a9     	adrp	x9, 0x724000 <dyld_stub_binder+0x724000>
   2fff8: f940fd29     	ldr	x9, [x9, #0x1f8]
   2fffc: f9400129     	ldr	x9, [x9]
   30000: eb08013f     	cmp	x9, x8
   30004: 54001621     	b.ne	 <L13>
   30008: aa1403e0     	mov	x0, x20
   3000c: aa1503e1     	mov	x1, x21
   30010: d10143bf     	sub	sp, x29, #0x50
   30014: a9457bfd     	ldp	x29, x30, [sp, #0x50]
   30018: a9444ff4     	ldp	x20, x19, [sp, #0x40]
   3001c: a94357f6     	ldp	x22, x21, [sp, #0x30]
   30020: a9425ff8     	ldp	x24, x23, [sp, #0x20]
   30024: a94167fa     	ldp	x26, x25, [sp, #0x10]
   30028: a8c66ffc     	ldp	x28, x27, [sp], #0x60
   3002c: d65f03c0     	ret
<L7>:
   30030: aa1603e0     	mov	x0, x22
   30034: 9413966a     	bl	 <dyld_stub_binder+0x5159dc>
   30038: 17ffff89     	b	 <L3>
<L8>:
   3003c: aa1503e8     	mov	x8, x21
   30040: aa0003f9     	mov	x25, x0
   30044: aa0103fa     	mov	x26, x1
   30048: 9413913d     	bl	 <dyld_stub_binder+0x51453c>
   3004c: aa1903e0     	mov	x0, x25
   30050: aa1a03e1     	mov	x1, x26
   30054: aa1503e2     	mov	x2, x21
   30058: 94139136     	bl	 <dyld_stub_binder+0x514530>
   3005c: aa0003f7     	mov	x23, x0
   30060: aa0103f8     	mov	x24, x1
   30064: aa1603e0     	mov	x0, x22
   30068: 9413965d     	bl	 <dyld_stub_binder+0x5159dc>
   3006c: aa1903e0     	mov	x0, x25
   30070: aa1a03e1     	mov	x1, x26
   30074: 94007e7d     	bl	 <_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufc8IteratorQz_SitSwXEfU1_SS8UTF8ViewV_TG5TA+0x18>
   30078: b4000658     	cbz	x24,  <L9>
   3007c: b0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   30080: 9112c000     	add	x0, x0, #0x4b0
   30084: d00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30088: 911ca021     	add	x1, x1, #0x728
   3008c: 97ffd108     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   30090: 91008261     	add	x1, x19, #0x20
   30094: 9413967c     	bl	 <dyld_stub_binder+0x515a84>
   30098: aa0003f9     	mov	x25, x0
   3009c: d00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   300a0: 3dc1a500     	ldr	q0, [x8, #0x690]
   300a4: aa0003fa     	mov	x26, x0
   300a8: f8020f5c     	str	x28, [x26, #0x20]!
   300ac: 3d800400     	str	q0, [x0, #0x10]
   300b0: d2fc8008     	mov	x8, #-0x1c00000000000000 ; =-2017612633061982208
   300b4: f9002414     	str	x20, [x0, #0x48]
   300b8: a902dc08     	stp	x8, x23, [x0, #0x28]
   300bc: f9001c18     	str	x24, [x0, #0x38]
   300c0: 94007595     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   300c4: aa0003f6     	mov	x22, x0
   300c8: aa1903e0     	mov	x0, x25
   300cc: 94139683     	bl	 <dyld_stub_binder+0x515ad8>
   300d0: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   300d4: 9112e021     	add	x1, x1, #0x4b8
   300d8: d00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   300dc: 911cc042     	add	x2, x2, #0x730
   300e0: aa1a03e0     	mov	x0, x26
   300e4: 94007e4b     	bl	 <_$sypSgWOhTm>
   300e8: b0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   300ec: f941ed00     	ldr	x0, [x8, #0x3d8]
   300f0: 94139599     	bl	 <dyld_stub_binder+0x515754>
   300f4: aa0003f7     	mov	x23, x0
   300f8: 900037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   300fc: f9412863     	ldr	x3, [x3, #0x250]
   30100: 91002362     	add	x2, x27, #0x8
   30104: aa1603e0     	mov	x0, x22
   30108: aa1403e1     	mov	x1, x20
   3010c: 941390f7     	bl	 <dyld_stub_binder+0x5144e8>
   30110: aa0003f8     	mov	x24, x0
   30114: f81703bf     	stur	xzr, [x29, #-0x90]
   30118: d10243a4     	sub	x4, x29, #0x90
   3011c: aa1703e0     	mov	x0, x23
   30120: aa1803e2     	mov	x2, x24
   30124: d2800003     	mov	x3, #0x0                ; =0
   30128: 94139cde     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   3012c: aa1d03fd     	mov	x29, x29
   30130: 94139592     	bl	 <dyld_stub_binder+0x515778>
   30134: aa0003f4     	mov	x20, x0
   30138: aa1803e0     	mov	x0, x24
   3013c: 1400003e     	b	 <L10>
<L9>:
   30140: b0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   30144: 9112c000     	add	x0, x0, #0x4b0
   30148: d00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   3014c: 911ca021     	add	x1, x1, #0x728
   30150: 97ffd0d7     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   30154: 9101c261     	add	x1, x19, #0x70
   30158: 9413964b     	bl	 <dyld_stub_binder+0x515a84>
   3015c: aa0003f4     	mov	x20, x0
   30160: d00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30164: 3dc1a500     	ldr	q0, [x8, #0x690]
   30168: aa0003f7     	mov	x23, x0
   3016c: f8020efc     	str	x28, [x23, #0x20]!
   30170: 3d800400     	str	q0, [x0, #0x10]
   30174: d2fc8008     	mov	x8, #-0x1c00000000000000 ; =-2017612633061982208
   30178: f9001408     	str	x8, [x0, #0x28]
   3017c: b0003896     	adrp	x22, 0x741000 <__PROTOCOL_NSObject+0x48>
   30180: 910fc2d6     	add	x22, x22, #0x3f0
   30184: f94002c0     	ldr	x0, [x22]
   30188: 94139570     	bl	 <dyld_stub_binder+0x515748>
   3018c: 94139d1d     	bl	 <_objc_msgSend$init>
   30190: aa0003f8     	mov	x24, x0
   30194: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   30198: 9113c021     	add	x1, x1, #0x4f0
   3019c: d2800000     	mov	x0, #0x0                ; =0
   301a0: aa1603e2     	mov	x2, x22
   301a4: 9400761a     	bl	 <_$sSo9LAContextCMaTm>
   301a8: f9002680     	str	x0, [x20, #0x48]
   301ac: f9001a98     	str	x24, [x20, #0x30]
   301b0: aa1403e0     	mov	x0, x20
   301b4: 94007558     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   301b8: aa0003f6     	mov	x22, x0
   301bc: aa1403e0     	mov	x0, x20
   301c0: 94139646     	bl	 <dyld_stub_binder+0x515ad8>
   301c4: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   301c8: 9112e021     	add	x1, x1, #0x4b8
   301cc: d00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   301d0: 911cc042     	add	x2, x2, #0x730
   301d4: aa1703e0     	mov	x0, x23
   301d8: 94007e0e     	bl	 <_$sypSgWOhTm>
   301dc: b0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   301e0: f941ed00     	ldr	x0, [x8, #0x3d8]
   301e4: 9413955c     	bl	 <dyld_stub_binder+0x515754>
   301e8: aa0003f4     	mov	x20, x0
   301ec: 900037a1     	adrp	x1, 0x724000 <dyld_stub_binder+0x724000>
   301f0: f9412421     	ldr	x1, [x1, #0x248]
   301f4: 900037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   301f8: f9412863     	ldr	x3, [x3, #0x250]
   301fc: 91002362     	add	x2, x27, #0x8
   30200: aa1603e0     	mov	x0, x22
   30204: 941390b9     	bl	 <dyld_stub_binder+0x5144e8>
   30208: aa0003f7     	mov	x23, x0
   3020c: f81703bf     	stur	xzr, [x29, #-0x90]
   30210: d10243a4     	sub	x4, x29, #0x90
   30214: aa1403e0     	mov	x0, x20
   30218: aa1703e2     	mov	x2, x23
   3021c: d2800003     	mov	x3, #0x0                ; =0
   30220: 94139ca0     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   30224: aa1d03fd     	mov	x29, x29
   30228: 94139554     	bl	 <dyld_stub_binder+0x515778>
   3022c: aa0003f4     	mov	x20, x0
   30230: aa1703e0     	mov	x0, x23
<L10>:
   30234: 9413954b     	bl	 <dyld_stub_binder+0x515760>
   30238: f85703a0     	ldur	x0, [x29, #-0x90]
   3023c: 9413954c     	bl	 <dyld_stub_binder+0x51576c>
   30240: b40002d4     	cbz	x20,  <L11>
   30244: aa1403e0     	mov	x0, x20
   30248: 94138fc7     	bl	 <dyld_stub_binder+0x514164>
   3024c: aa0003f7     	mov	x23, x0
   30250: aa0103f8     	mov	x24, x1
   30254: aa1403e0     	mov	x0, x20
   30258: 94139542     	bl	 <dyld_stub_binder+0x515760>
   3025c: aa1503e8     	mov	x8, x21
   30260: 941390b7     	bl	 <dyld_stub_binder+0x51453c>
   30264: aa1703e0     	mov	x0, x23
   30268: aa1803e1     	mov	x1, x24
   3026c: aa1503e2     	mov	x2, x21
   30270: 941390b0     	bl	 <dyld_stub_binder+0x514530>
   30274: aa0003f4     	mov	x20, x0
   30278: aa0103f5     	mov	x21, x1
   3027c: aa1703e0     	mov	x0, x23
   30280: aa1803e1     	mov	x1, x24
   30284: 94007505     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   30288: b40001b5     	cbz	x21,  <L12>
   3028c: aa1603e0     	mov	x0, x22
   30290: 941395d3     	bl	 <dyld_stub_binder+0x5159dc>
   30294: 17ffff57     	b	 <L6>
<L11>:
   30298: aa0003f4     	mov	x20, x0
   3029c: 94138f76     	bl	 <dyld_stub_binder+0x514074>
   302a0: aa0003f7     	mov	x23, x0
   302a4: aa1403e0     	mov	x0, x20
   302a8: 9413952e     	bl	 <dyld_stub_binder+0x515760>
   302ac: aa1703f5     	mov	x21, x23
   302b0: 94139613     	bl	 <dyld_stub_binder+0x515afc>
   302b4: aa1703e0     	mov	x0, x23
   302b8: 941395de     	bl	 <dyld_stub_binder+0x515a30>
<L12>:
   302bc: d28004b4     	mov	x20, #0x25              ; =37
   302c0: f2fa0014     	movk	x20, #0xd000, lsl #48
   302c4: 17ffff45     	b	 <L5>
<L13>:
   302c8: 9413940f     	bl	 <dyld_stub_binder+0x515304>

00000000000302cc <_$s16AsideNativeSwift14cmdSecureClearSSyF>:
   302cc: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
   302d0: a9015ff8     	stp	x24, x23, [sp, #0x10]
   302d4: a90257f6     	stp	x22, x21, [sp, #0x20]
   302d8: a9034ff4     	stp	x20, x19, [sp, #0x30]
   302dc: a9047bfd     	stp	x29, x30, [sp, #0x40]
   302e0: 910103fd     	add	x29, sp, #0x40
   302e4: d103c3ff     	sub	sp, sp, #0xf0
   302e8: d101c3b5     	sub	x21, x29, #0x70
   302ec: 900037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   302f0: f940fd08     	ldr	x8, [x8, #0x1f8]
   302f4: f9400108     	ldr	x8, [x8]
   302f8: f81b83a8     	stur	x8, [x29, #-0x48]
   302fc: d2800000     	mov	x0, #0x0                ; =0
   30300: 94139092     	bl	 <dyld_stub_binder+0x514548>
   30304: f85f8008     	ldur	x8, [x0, #-0x8]
   30308: f9402108     	ldr	x8, [x8, #0x40]
   3030c: aa0803e9     	mov	x9, x8
   30310: 900037b0     	adrp	x16, 0x724000 <dyld_stub_binder+0x724000>
   30314: f940fa10     	ldr	x16, [x16, #0x1f0]
   30318: d63f0200     	blr	x16
   3031c: 910003e9     	mov	x9, sp
   30320: 91003d08     	add	x8, x8, #0xf
   30324: 927ced08     	and	x8, x8, #0xfffffffffffffff0
   30328: cb080133     	sub	x19, x9, x8
   3032c: 9100027f     	mov	sp, x19
   30330: 97ffd0db     	bl	 <_$s16AsideNativeSwift13readStdinJsonSDySSypGSgyF>
   30334: 900037b9     	adrp	x25, 0x724000 <dyld_stub_binder+0x724000>
   30338: f9416b39     	ldr	x25, [x25, #0x2d0]
   3033c: b4001140     	cbz	x0,  <L1>
   30340: aa0003f4     	mov	x20, x0
   30344: f9400808     	ldr	x8, [x0, #0x10]
   30348: b4001048     	cbz	x8,  <L0>
   3034c: 528cad60     	mov	w0, #0x656b             ; =25963
   30350: 72a00f20     	movk	w0, #0x79, lsl #16
   30354: d2fc6001     	mov	x1, #-0x1d00000000000000 ; =-2089670227099910144
   30358: 94006706     	bl	 <_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5>
   3035c: 36000fa1     	tbz	w1, #0x0,  <L0>
   30360: f9401e88     	ldr	x8, [x20, #0x38]
   30364: 8b001500     	add	x0, x8, x0, lsl #5
   30368: d101c3a1     	sub	x1, x29, #0x70
   3036c: 940074db     	bl	 <_$sypWOc>
   30370: aa1403e0     	mov	x0, x20
   30374: 9413959a     	bl	 <dyld_stub_binder+0x5159dc>
   30378: f85a83a8     	ldur	x8, [x29, #-0x58]
   3037c: b4000f88     	cbz	x8,  <L2>
   30380: 900037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   30384: f9412463     	ldr	x3, [x3, #0x248]
   30388: d104a3a0     	sub	x0, x29, #0x128
   3038c: d101c3a1     	sub	x1, x29, #0x70
   30390: 91002322     	add	x2, x25, #0x8
   30394: 528000c4     	mov	w4, #0x6                ; =6
   30398: 941395a3     	bl	 <dyld_stub_binder+0x515a24>
   3039c: 36000f40     	tbz	w0, #0x0,  <L3>
   303a0: d100a3a8     	sub	x8, x29, #0x28
   303a4: f8500100     	ldur	x0, [x8, #-0x100]
   303a8: d10083a8     	sub	x8, x29, #0x20
   303ac: f8500116     	ldur	x22, [x8, #-0x100]
   303b0: 9240bc08     	and	x8, x0, #0xffffffffffff
   303b4: d378eec9     	ubfx	x9, x22, #56, #4
   303b8: f24302df     	tst	x22, #0x2000000000000000
   303bc: 9a890108     	csel	x8, x8, x9, eq
   303c0: b4001ca8     	cbz	x8,  <L7>
   303c4: aa1603e1     	mov	x1, x22
   303c8: 97fffa2f     	bl	 <_$s16AsideNativeSwift22secureStorageBaseQuery3keySDySSypGSS_tF>
   303cc: aa0003f7     	mov	x23, x0
   303d0: 900037b4     	adrp	x20, 0x724000 <dyld_stub_binder+0x724000>
   303d4: f9412694     	ldr	x20, [x20, #0x248]
   303d8: 900037b5     	adrp	x21, 0x724000 <dyld_stub_binder+0x724000>
   303dc: f9412ab5     	ldr	x21, [x21, #0x250]
   303e0: 91002322     	add	x2, x25, #0x8
   303e4: aa1403e1     	mov	x1, x20
   303e8: aa1503e3     	mov	x3, x21
   303ec: 9413903f     	bl	 <dyld_stub_binder+0x5144e8>
   303f0: aa0003f8     	mov	x24, x0
   303f4: aa1703e0     	mov	x0, x23
   303f8: 94139579     	bl	 <dyld_stub_binder+0x5159dc>
   303fc: aa1803e0     	mov	x0, x24
   30400: 94139166     	bl	 <dyld_stub_binder+0x514998>
   30404: aa1603e0     	mov	x0, x22
   30408: 94139575     	bl	 <dyld_stub_binder+0x5159dc>
   3040c: aa1803e0     	mov	x0, x24
   30410: 941394d4     	bl	 <dyld_stub_binder+0x515760>
   30414: b0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   30418: 9112c000     	add	x0, x0, #0x4b0
   3041c: d00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30420: 911ca021     	add	x1, x1, #0x728
   30424: 97ffd022     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   30428: d10443a1     	sub	x1, x29, #0x110
   3042c: 94139596     	bl	 <dyld_stub_binder+0x515a84>
   30430: aa0003f7     	mov	x23, x0
   30434: d00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30438: 3dc1a500     	ldr	q0, [x8, #0x690]
   3043c: 3d800400     	str	q0, [x0, #0x10]
   30440: d28eae68     	mov	x8, #0x7573             ; =30067
   30444: f2ac6c68     	movk	x8, #0x6363, lsl #16
   30448: f2ce6ca8     	movk	x8, #0x7365, lsl #32
   3044c: f2e00e68     	movk	x8, #0x73, lsl #48
   30450: aa0003f8     	mov	x24, x0
   30454: f8020f08     	str	x8, [x24, #0x20]!
   30458: d2fce008     	mov	x8, #-0x1900000000000000 ; =-1801439850948198400
   3045c: f9001408     	str	x8, [x0, #0x28]
   30460: 900037a8     	adrp	x8, 0x724000 <dyld_stub_binder+0x724000>
   30464: f9413508     	ldr	x8, [x8, #0x268]
   30468: f9002408     	str	x8, [x0, #0x48]
   3046c: 52800028     	mov	w8, #0x1                ; =1
   30470: 3900c008     	strb	w8, [x0, #0x30]
   30474: 940074a8     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   30478: aa0003f6     	mov	x22, x0
   3047c: aa1703e0     	mov	x0, x23
   30480: 94139596     	bl	 <dyld_stub_binder+0x515ad8>
   30484: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   30488: 9112e021     	add	x1, x1, #0x4b8
   3048c: d00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30490: 911cc042     	add	x2, x2, #0x730
   30494: aa1803e0     	mov	x0, x24
   30498: 94007d5e     	bl	 <_$sypSgWOhTm>
   3049c: b0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   304a0: f941ed00     	ldr	x0, [x8, #0x3d8]
   304a4: 941394ac     	bl	 <dyld_stub_binder+0x515754>
   304a8: aa0003f7     	mov	x23, x0
   304ac: 91002322     	add	x2, x25, #0x8
   304b0: aa1603e0     	mov	x0, x22
   304b4: aa1403e1     	mov	x1, x20
   304b8: aa1503e3     	mov	x3, x21
   304bc: 9413900b     	bl	 <dyld_stub_binder+0x5144e8>
   304c0: aa0003f5     	mov	x21, x0
   304c4: f81903bf     	stur	xzr, [x29, #-0x70]
   304c8: d101c3a4     	sub	x4, x29, #0x70
   304cc: aa1703e0     	mov	x0, x23
   304d0: aa1503e2     	mov	x2, x21
   304d4: d2800003     	mov	x3, #0x0                ; =0
   304d8: 94139bf2     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   304dc: aa1d03fd     	mov	x29, x29
   304e0: 941394a6     	bl	 <dyld_stub_binder+0x515778>
   304e4: aa0003f4     	mov	x20, x0
   304e8: aa1503e0     	mov	x0, x21
   304ec: 9413949d     	bl	 <dyld_stub_binder+0x515760>
   304f0: f85903a0     	ldur	x0, [x29, #-0x70]
   304f4: 9413949e     	bl	 <dyld_stub_binder+0x51576c>
   304f8: b4001354     	cbz	x20,  <L8>
   304fc: aa1403e0     	mov	x0, x20
   30500: 94138f19     	bl	 <dyld_stub_binder+0x514164>
   30504: aa0003f5     	mov	x21, x0
   30508: aa0103f7     	mov	x23, x1
   3050c: aa1403e0     	mov	x0, x20
   30510: 94139494     	bl	 <dyld_stub_binder+0x515760>
   30514: aa1303e8     	mov	x8, x19
   30518: 94139009     	bl	 <dyld_stub_binder+0x51453c>
   3051c: aa1503e0     	mov	x0, x21
   30520: aa1703e1     	mov	x1, x23
   30524: aa1303e2     	mov	x2, x19
   30528: 94139002     	bl	 <dyld_stub_binder+0x514530>
   3052c: aa0003f4     	mov	x20, x0
   30530: aa0103f3     	mov	x19, x1
   30534: aa1503e0     	mov	x0, x21
   30538: aa1703e1     	mov	x1, x23
   3053c: 94007457     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   30540: b4001233     	cbz	x19,  <L9>
   30544: aa1603e0     	mov	x0, x22
   30548: 94139525     	bl	 <dyld_stub_binder+0x5159dc>
   3054c: 14000073     	b	 <L6>
<L0>:
   30550: 6f00e400     	movi.2d	v0, #0000000000000000
   30554: ad0002a0     	stp	q0, q0, [x21]
   30558: aa1403e0     	mov	x0, x20
   3055c: 94139520     	bl	 <dyld_stub_binder+0x5159dc>
   30560: 14000003     	b	 <L2>
<L1>:
   30564: 6f00e400     	movi.2d	v0, #0000000000000000
   30568: ad0002a0     	stp	q0, q0, [x21]
<L2>:
   3056c: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   30570: 91124021     	add	x1, x1, #0x490
   30574: d00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30578: 911c4042     	add	x2, x2, #0x710
   3057c: d101c3a0     	sub	x0, x29, #0x70
   30580: 94007d24     	bl	 <_$sypSgWOhTm>
<L3>:
   30584: 900037b5     	adrp	x21, 0x724000 <dyld_stub_binder+0x724000>
   30588: f94126b5     	ldr	x21, [x21, #0x248]
   3058c: d28004b4     	mov	x20, #0x25              ; =37
   30590: f2fa0014     	movk	x20, #0xd000, lsl #48
   30594: b0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   30598: 91308108     	add	x8, x8, #0xc20
   3059c: d1008108     	sub	x8, x8, #0x20
   305a0: b2410116     	orr	x22, x8, #0x8000000000000000
   305a4: b0003880     	adrp	x0, 0x741000 <__PROTOCOL_NSObject+0x48>
   305a8: 9112c000     	add	x0, x0, #0x4b0
   305ac: d00027c1     	adrp	x1, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   305b0: 911ca021     	add	x1, x1, #0x728
   305b4: 97ffcfbe     	bl	 <___swift_instantiateConcreteTypeFromMangledNameV2>
   305b8: d10303a1     	sub	x1, x29, #0xc0
   305bc: 94139532     	bl	 <dyld_stub_binder+0x515a84>
   305c0: aa0003f7     	mov	x23, x0
   305c4: d00027c8     	adrp	x8, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   305c8: 3dc1a500     	ldr	q0, [x8, #0x690]
   305cc: 3d800400     	str	q0, [x0, #0x10]
   305d0: d28e4ca8     	mov	x8, #0x7265             ; =29285
   305d4: f2adee48     	movk	x8, #0x6f72, lsl #16
   305d8: f2c00e48     	movk	x8, #0x72, lsl #32
   305dc: aa0003f8     	mov	x24, x0
   305e0: f8020f08     	str	x8, [x24, #0x20]!
   305e4: d2fca008     	mov	x8, #-0x1b00000000000000 ; =-1945555039024054272
   305e8: f9002415     	str	x21, [x0, #0x48]
   305ec: d1000689     	sub	x9, x20, #0x1
   305f0: a902a408     	stp	x8, x9, [x0, #0x28]
   305f4: f9001c16     	str	x22, [x0, #0x38]
   305f8: 94007447     	bl	 <_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n>
   305fc: aa0003f6     	mov	x22, x0
   30600: aa1703e0     	mov	x0, x23
   30604: 94139535     	bl	 <dyld_stub_binder+0x515ad8>
   30608: b0003881     	adrp	x1, 0x741000 <__PROTOCOL_NSObject+0x48>
   3060c: 9112e021     	add	x1, x1, #0x4b8
   30610: d00027c2     	adrp	x2, 0x52a000 <__ZL34_indic_syllable_machine_trans_keys+0x162>
   30614: 911cc042     	add	x2, x2, #0x730
   30618: aa1803e0     	mov	x0, x24
   3061c: 94007cfd     	bl	 <_$sypSgWOhTm>
   30620: b0003888     	adrp	x8, 0x741000 <__PROTOCOL_NSObject+0x48>
   30624: f941ed00     	ldr	x0, [x8, #0x3d8]
   30628: 9413944b     	bl	 <dyld_stub_binder+0x515754>
   3062c: aa0003f7     	mov	x23, x0
   30630: 900037a3     	adrp	x3, 0x724000 <dyld_stub_binder+0x724000>
   30634: f9412863     	ldr	x3, [x3, #0x250]
   30638: 91002322     	add	x2, x25, #0x8
   3063c: aa1603e0     	mov	x0, x22
   30640: aa1503e1     	mov	x1, x21
   30644: 94138fa9     	bl	 <dyld_stub_binder+0x5144e8>
   30648: aa0003f8     	mov	x24, x0
   3064c: f81903bf     	stur	xzr, [x29, #-0x70]
   30650: d101c3a4     	sub	x4, x29, #0x70
   30654: aa1703e0     	mov	x0, x23
   30658: aa1803e2     	mov	x2, x24
   3065c: d2800003     	mov	x3, #0x0                ; =0
   30660: 94139b90     	bl	 <_objc_msgSend$dataWithJSONObject:options:error:>
   30664: aa1d03fd     	mov	x29, x29
   30668: 94139444     	bl	 <dyld_stub_binder+0x515778>
   3066c: aa0003f5     	mov	x21, x0
   30670: aa1803e0     	mov	x0, x24
   30674: 9413943b     	bl	 <dyld_stub_binder+0x515760>
   30678: f85903a0     	ldur	x0, [x29, #-0x70]
   3067c: 9413943c     	bl	 <dyld_stub_binder+0x51576c>
   30680: b40002f5     	cbz	x21,  <L4>
   30684: aa1503e0     	mov	x0, x21
   30688: 94138eb7     	bl	 <dyld_stub_binder+0x514164>
   3068c: aa0003f7     	mov	x23, x0
   30690: aa0103f8     	mov	x24, x1
   30694: aa1503e0     	mov	x0, x21
   30698: 94139432     	bl	 <dyld_stub_binder+0x515760>
   3069c: aa1303e8     	mov	x8, x19
   306a0: 94138fa7     	bl	 <dyld_stub_binder+0x51453c>
   306a4: aa1703e0     	mov	x0, x23
   306a8: aa1803e1     	mov	x1, x24
   306ac: aa1303e2     	mov	x2, x19
   306b0: 94138fa0     	bl	 <dyld_stub_binder+0x514530>
   306b4: aa0003f5     	mov	x21, x0
   306b8: aa0103f3     	mov	x19, x1
   306bc: aa1703e0     	mov	x0, x23
   306c0: aa1803e1     	mov	x1, x24
   306c4: 940073f5     	bl	 <_$s10Foundation4DataV15_RepresentationOWOe>
   306c8: b40001d3     	cbz	x19,  <L5>
   306cc: aa1603e0     	mov	x0, x22
   306d0: 941394c3     	bl	 <dyld_stub_binder+0x5159dc>
   306d4: aa1503f4     	mov	x20, x21
   306d8: 14000010     	b	 <L6>
<L4>:
   306dc: aa0003f3     	mov	x19, x0
   306e0: 94138e65     	bl	 <dyld_stub_binder+0x514074>
   306e4: aa0003f7     	mov	x23, x0
   306e8: aa1303e0     	mov	x0, x19
   306ec: 9413941d     	bl	 <dyld_stub_binder+0x515760>
   306f0: aa1703f5     	mov	x21, x23
   306f4: 94139502     	bl	 <dyld_stub_binder+0x515afc>
   306f8: aa1703e0     	mov	x0, x23
   306fc: 941394cd     	bl	 <dyld_stub_binder+0x515a30>
<L5>:
   30700: aa1603e0     	mov	x0, x22
   30704: 941394b6     	bl	 <dyld_stub_binder+0x5159dc>
   30708: b0002748     	adrp	x8, 0x519000 <dyld_stub_binder+0x519000>
   3070c: 911e8108     	add	x8, x8, #0x7a0
   30710: d1008108     	sub	x8, x8, #0x20
   30714: b2410113     	orr	x19, x8, #0x8000000000000000
<L6>:
   30718: f85b83a8     	ldur	x8, [x29, #-0x48]
   3071c: 900037a9     	adrp	x9, 0x724000 <dyld_stub_binder+0x724000>
   30720: f940fd29     	ldr	x9, [x9, #0x1f8]
   30724: f9400129     	ldr	x9, [x9]
   30728: eb08013f     	cmp	x9, x8
   3072c: 54000321     	b.ne	 <L10>
   30730: aa1403e0     	mov	x0, x20
   30734: aa1303e1     	mov	x1, x19
   30738: d10103bf     	sub	sp, x29, #0x40
   3073c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
   30740: a9434ff4     	ldp	x20, x19, [sp, #0x30]
   30744: a94257f6     	ldp	x22, x21, [sp, #0x20]
   30748: a9415ff8     	ldp	x24, x23, [sp, #0x10]
   3074c: a8c567fa     	ldp	x26, x25, [sp], #0x50
   30750: d65f03c0     	ret
<L7>:
   30754: aa1603e0     	mov	x0, x22
   30758: 941394a1     	bl	 <dyld_stub_binder+0x5159dc>
   3075c: 17ffff8a     	b	 <L3>
<L8>:
   30760: aa0003f3     	mov	x19, x0
   30764: 94138e44     	bl	 <dyld_stub_binder+0x514074>
   30768: aa0003f4     	mov	x20, x0
   3076c: aa1303e0     	mov	x0, x19
   30770: 941393fc     	bl	 <dyld_stub_binder+0x515760>
   30774: aa1403f5     	mov	x21, x20
   30778: 941394e1     	bl	 <dyld_stub_binder+0x515afc>
   3077c: aa1403e0     	mov	x0, x20
   30780: 941394ac     	bl	 <dyld_stub_binder+0x515a30>
<L9>:
   30784: d28004b4     	mov	x20, #0x25              ; =37
   30788: f2fa0014     	movk	x20, #0xd000, lsl #48
   3078c: 17ffffdd     	b	 <L5>
<L10>:
   30790: 941392dd     	bl	 <dyld_stub_binder+0x515304>

0000000000030794 <_$s16AsideNativeSwift14installService_WZ>:
   30794: 900038a3     	adrp	x3, 0x744000 <_SupportedTags+0x1770>
   30798: 9138e063     	add	x3, x3, #0xe38
   3079c: d28dcd21     	mov	x1, #0x6e69             ; =28265
   307a0: f2ae8e61     	movk	x1, #0x7473, lsl #16
   307a4: f2cd8c21     	movk	x1, #0x6c61, lsl #32
   307a8: f2e00d81     	movk	x1, #0x6c, lsl #48
   307ac: 91002064     	add	x4, x3, #0x8
   307b0: d2fce002     	mov	x2, #-0x1900000000000000 ; =-1801439850948198400
   307b4: 14000068     	b	 <_$s16AsideNativeSwift22biometricAccountPrefix_WZTm>

00000000000307b8 <_$s16AsideNativeSwift14installServiceSSvau>:
   307b8: b00038a8     	adrp	x8, 0x745000 <__hb_CrapPool+0xd8>
   307bc: f940f108     	ldr	x8, [x8, #0x1e0]
   307c0: b100051f     	cmn	x8, #0x1
   307c4: 54000081     	b.ne	 <L1>
<L0>:
   307c8: 900038a0     	adrp	x0, 0x744000 <_SupportedTags+0x1770>
   307cc: 9138e000     	add	x0, x0, #0xe38
   307d0: d65f03c0     	ret
<L1>:
   307d4: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
   307d8: 910003fd     	mov	x29, sp
   307dc: b00038a0     	adrp	x0, 0x745000 <__hb_CrapPool+0xd8>
   307e0: 91078000     	add	x0, x0, #0x1e0
   307e4: 90000001     	adrp	x1, 0x30000 <_$s16AsideNativeSwift13cmdSecureReadSSyF+0x2f8>
   307e8: 911e5021     	add	x1, x1, #0x794
   307ec: 941394af     	bl	 <dyld_stub_binder+0x515aa8>
   307f0: a8c17bfd     	ldp	x29, x30, [sp], #0x10
   307f4: 17fffff5     	b	 <L0>

00000000000307f8 <_$s16AsideNativeSwift11metaAccount_WZ>:
   307f8: 900038a3     	adrp	x3, 0x744000 <_SupportedTags+0x1770>
   307fc: 91392063     	add	x3, x3, #0xe48
   30800: d28dcd21     	mov	x1, #0x6e69             ; =28265
   30804: f2ae8e61     	movk	x1, #0x7473, lsl #16
   30808: f2cd8c21     	movk	x1, #0x6c61, lsl #32
   3080c: f2e5cd81     	movk	x1, #0x2e6c, lsl #48
   30810: d28cada2     	mov	x2, #0x656d             ; =25965
   30814: f2ac2e82     	movk	x2, #0x6174, lsl #16
   30818: f2fd8002     	movk	x2, #0xec00, lsl #48
   3081c: 91002064     	add	x4, x3, #0x8
   30820: 1400004d     	b	 <_$s16AsideNativeSwift22biometricAccountPrefix_WZTm>

0000000000030824 <_$s16AsideNativeSwift11metaAccountSSvau>:
   30824: b00038a8     	adrp	x8, 0x745000 <__hb_CrapPool+0xd8>
   30828: f940f508     	ldr	x8, [x8, #0x1e8]
   3082c: b100051f     	cmn	x8, #0x1
   30830: 54000081     	b.ne	 <L1>
<L0>:
   30834: 900038a0     	adrp	x0, 0x744000 <_SupportedTags+0x1770>
   30838: 91392000     	add	x0, x0, #0xe48
   3083c: d65f03c0     	ret
<L1>:
   30840: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
   30844: 910003fd     	mov	x29, sp
   30848: b00038a0     	adrp	x0, 0x745000 <__hb_CrapPool+0xd8>
   3084c: 9107a000     	add	x0, x0, #0x1e8
   30850: 90000001     	adrp	x1, 0x30000 <_$s16AsideNativeSwift13cmdSecureReadSSyF+0x2f8>
   30854: 911fe021     	add	x1, x1, #0x7f8
   30858: 94139494     	bl	 <dyld_stub_binder+0x515aa8>
   3085c: a8c17bfd     	ldp	x29, x30, [sp], #0x10
   30860: 17fffff5     	b	 <L0>

0000000000030864 <_$s16AsideNativeSwift10sigAccount_WZ>:
   30864: 900038a3     	adrp	x3, 0x744000 <_SupportedTags+0x1770>
   30868: 91396063     	add	x3, x3, #0xe58
   3086c: d28dcd21     	mov	x1, #0x6e69             ; =28265
   30870: f2ae8e61     	movk	x1, #0x7473, lsl #16
   30874: f2cd8c21     	movk	x1, #0x6c61, lsl #32
   30878: f2e5cd81     	movk	x1, #0x2e6c, lsl #48
   3087c: d28d2e62     	mov	x2, #0x6973             ; =26995
   30880: f2a00ce2     	movk	x2, #0x67, lsl #16
   30884: f2fd6002     	movk	x2, #0xeb00, lsl #48
   30888: 91002064     	add	x4, x3, #0x8
   3088c: 14000032     	b	 <_$s16AsideNativeSwift22biometricAccountPrefix_WZTm>

0000000000030890 <_$s16AsideNativeSwift10sigAccountSSvau>:
   30890: b00038a8     	adrp	x8, 0x745000 <__hb_CrapPool+0xd8>
   30894: f940f908     	ldr	x8, [x8, #0x1f0]
   30898: b100051f     	cmn	x8, #0x1
   3089c: 54000081     	b.ne	 <L1>
<L0>:
   308a0: 900038a0     	adrp	x0, 0x744000 <_SupportedTags+0x1770>
   308a4: 91396000     	add	x0, x0, #0xe58
   308a8: d65f03c0     	ret
<L1>:
   308ac: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
   308b0: 910003fd     	mov	x29, sp
   308b4: b00038a0     	adrp	x0, 0x745000 <__hb_CrapPool+0xd8>
   308b8: 9107c000     	add	x0, x0, #0x1f0
   308bc: 90000001     	adrp	x1, 0x30000 <_$s16AsideNativeSwift13cmdSecureReadSSyF+0x2f8>
   308c0: 91219021     	add	x1, x1, #0x864
   308c4: 94139479     	bl	 <dyld_stub_binder+0x515aa8>
   308c8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
   308cc: 17fffff5     	b	 <L0>

00000000000308d0 <_$s16AsideNativeSwift10kemAccount_WZ>:
   308d0: 900038a3     	adrp	x3, 0x744000 <_SupportedTags+0x1770>
   308d4: 9139a063     	add	x3, x3, #0xe68
   308d8: d28dcd21     	mov	x1, #0x6e69             ; =28265
   308dc: f2ae8e61     	movk	x1, #0x7473, lsl #16
