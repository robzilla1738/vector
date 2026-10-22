/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift20cmdGenerateThumbnailSSyF:
   44928:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   4492c:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   44930:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   44934:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   44938:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   4493c:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   44940:	fd 43 01 91	add	x29, sp, #0x50
   44944:	ff 83 05 d1	sub	sp, sp, #0x160
   44948:	f3 03 00 91	mov	x19, sp
   4494c:	08 37 00 90	adrp	x8, 1760 ; 0x724000
   44950:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   44954:	08 01 40 f9	ldr	x8, [x8]
   44958:	a8 83 19 f8	stur	x8, [x29, #-0x68]
   4495c:	b6 04 80 d2	mov	x22, #0x25
   44960:	16 00 fa f2	movk	x22, #0xd000, lsl #48
   44964:	00 00 80 d2	mov	x0, #0x0
   44968:	f8 3e 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   4496c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   44970:	08 21 40 f9	ldr	x8, [x8, #0x40]
   44974:	e9 03 08 aa	mov	x9, x8
   44978:	10 37 00 90	adrp	x16, 1760 ; 0x724000
   4497c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   44980:	00 02 3f d6	blr	x16
   44984:	e9 03 00 91	mov	x9, sp
   44988:	08 3d 00 91	add	x8, x8, #0xf
   4498c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   44990:	35 01 08 cb	sub	x21, x9, x8
   44994:	bf 02 00 91	mov	sp, x21
   44998:	41 7f ff 97	bl	_$s16AsideNativeSwift13readStdinJsonSDySSypGSgyF
   4499c:	1b 37 00 90	adrp	x27, 1760 ; 0x724000
   449a0:	7b 6b 41 f9	ldr	x27, [x27, #0x2d0] ; literal pool symbol address: _$sypN
   449a4:	e0 0a 00 b4	cbz	x0, 0x44b00
   449a8:	f4 03 00 aa	mov	x20, x0
   449ac:	08 08 40 f9	ldr	x8, [x0, #0x10]
   449b0:	48 0a 00 b4	cbz	x8, 0x44af8
   449b4:	e0 03 14 aa	mov	x0, x20
   449b8:	0f 44 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   449bc:	c0 2c 8d d2	mov	x0, #0x6966
   449c0:	80 ad ac f2	movk	x0, #0x656c, lsl #16
   449c4:	00 2a cc f2	movk	x0, #0x6150, lsl #32
   449c8:	80 0e ed f2	movk	x0, #0x6874, lsl #48
   449cc:	01 00 fd d2	mov	x1, #-0x1800000000000000
   449d0:	68 15 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   449d4:	e1 08 00 36	tbz	w1, #0x0, 0x44af0
   449d8:	88 1e 40 f9	ldr	x8, [x20, #0x38]
   449dc:	00 15 00 8b	add	x0, x8, x0, lsl #5
   449e0:	61 42 03 91	add	x1, x19, #0xd0
   449e4:	3d 23 00 94	bl	_$sypWOc
   449e8:	e0 03 14 aa	mov	x0, x20
   449ec:	fc 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   449f0:	03 37 00 90	adrp	x3, 1760 ; 0x724000
   449f4:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   449f8:	60 22 00 91	add	x0, x19, #0x8
   449fc:	61 42 03 91	add	x1, x19, #0xd0
   44a00:	62 23 00 91	add	x2, x27, #0x8
   44a04:	c4 00 80 52	mov	w4, #0x6
   44a08:	07 44 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   44a0c:	60 07 00 36	tbz	w0, #0x0, 0x44af8
   44a10:	77 0a 40 f9	ldr	x23, [x19, #0x10]
   44a14:	88 0a 40 f9	ldr	x8, [x20, #0x10]
   44a18:	48 06 00 b4	cbz	x8, 0x44ae0
   44a1c:	78 06 40 f9	ldr	x24, [x19, #0x8]
   44a20:	e0 03 14 aa	mov	x0, x20
   44a24:	f4 43 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   44a28:	20 6d 8c d2	mov	x0, #0x6369
   44a2c:	e0 cd ad f2	movk	x0, #0x6e6f, lsl #16
   44a30:	e0 a9 ce f2	movk	x0, #0x754f, lsl #32
   44a34:	80 0e ee f2	movk	x0, #0x7074, lsl #48
   44a38:	a1 8e 8e d2	mov	x1, #0x7475
   44a3c:	01 2a ac f2	movk	x1, #0x6150, lsl #16
   44a40:	81 0e cd f2	movk	x1, #0x6874, lsl #32
   44a44:	01 c0 fd f2	movk	x1, #0xee00, lsl #48
   44a48:	4a 15 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   44a4c:	e1 04 00 36	tbz	w1, #0x0, 0x44ae8
   44a50:	88 1e 40 f9	ldr	x8, [x20, #0x38]
   44a54:	00 15 00 8b	add	x0, x8, x0, lsl #5
   44a58:	61 42 03 91	add	x1, x19, #0xd0
   44a5c:	1f 23 00 94	bl	_$sypWOc
   44a60:	e0 03 14 aa	mov	x0, x20
   44a64:	de 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44a68:	03 37 00 90	adrp	x3, 1760 ; 0x724000
   44a6c:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   44a70:	60 22 00 91	add	x0, x19, #0x8
   44a74:	61 42 03 91	add	x1, x19, #0xd0
   44a78:	62 23 00 91	add	x2, x27, #0x8
   44a7c:	c4 00 80 52	mov	w4, #0x6
   44a80:	e9 43 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   44a84:	e0 02 00 36	tbz	w0, #0x0, 0x44ae0
   44a88:	7c 42 03 91	add	x28, x19, #0xd0
   44a8c:	7a e6 40 a9	ldp	x26, x25, [x19, #0x8]
   44a90:	88 0a 40 f9	ldr	x8, [x20, #0x10]
   44a94:	c8 11 00 b4	cbz	x8, 0x44ccc
   44a98:	79 02 00 f9	str	x25, [x19]
   44a9c:	f9 03 1a aa	mov	x25, x26
   44aa0:	a8 26 00 d0	adrp	x8, 1238 ; 0x51a000
   44aa4:	08 01 04 91	add	x8, x8, #0x100 ; literal pool for: "thumbnailOutputPath"
   44aa8:	1a 81 00 d1	sub	x26, x8, #0x20
   44aac:	e0 03 14 aa	mov	x0, x20
   44ab0:	d1 43 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   44ab4:	c0 4a 00 d1	sub	x0, x22, #0x12
   44ab8:	41 03 41 b2	orr	x1, x26, #0x8000000000000000
   44abc:	2d 15 00 94	bl	_$ss22__RawDictionaryStorageC4findys10_HashTableV6BucketV6bucket_Sb5foundtxSHRzlFSS_Tg5
   44ac0:	c1 10 00 36	tbz	w1, #0x0, 0x44cd8
   44ac4:	88 1e 40 f9	ldr	x8, [x20, #0x38]
   44ac8:	00 15 00 8b	add	x0, x8, x0, lsl #5
   44acc:	61 42 03 91	add	x1, x19, #0xd0
   44ad0:	02 23 00 94	bl	_$sypWOc
   44ad4:	e0 03 14 aa	mov	x0, x20
   44ad8:	c1 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44adc:	83 00 00 14	b	0x44ce8
   44ae0:	e0 03 17 aa	mov	x0, x23
   44ae4:	04 00 00 14	b	0x44af4
   44ae8:	e0 03 17 aa	mov	x0, x23
   44aec:	bc 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44af0:	e0 03 14 aa	mov	x0, x20
   44af4:	ba 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44af8:	e0 03 14 aa	mov	x0, x20
   44afc:	b8 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44b00:	17 37 00 90	adrp	x23, 1760 ; 0x724000
   44b04:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   44b08:	a8 26 00 d0	adrp	x8, 1238 ; 0x51a000
   44b0c:	08 c1 02 91	add	x8, x8, #0xb0 ; literal pool for: "generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath"
   44b10:	08 81 00 d1	sub	x8, x8, #0x20
   44b14:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   44b18:	e0 37 00 b0	adrp	x0, 1789 ; 0x741000
   44b1c:	00 c0 12 91	add	x0, x0, #0x4b0
   44b20:	21 27 00 d0	adrp	x1, 1254 ; 0x52a000
   44b24:	21 a0 1c 91	add	x1, x1, #0x728
   44b28:	61 7e ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   44b2c:	a1 e3 02 d1	sub	x1, x29, #0xb8
   44b30:	d5 43 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   44b34:	f8 03 00 aa	mov	x24, x0
   44b38:	28 27 00 d0	adrp	x8, 1254 ; 0x52a000
   44b3c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   44b40:	00 04 80 3d	str	q0, [x0, #0x10]
   44b44:	a8 4c 8e d2	mov	x8, #0x7265
   44b48:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   44b4c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   44b50:	f9 03 00 aa	mov	x25, x0
   44b54:	28 0f 02 f8	str	x8, [x25, #0x20]!
   44b58:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   44b5c:	17 24 00 f9	str	x23, [x0, #0x48]
   44b60:	c9 a2 00 91	add	x9, x22, #0x28
   44b64:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   44b68:	14 1c 00 f9	str	x20, [x0, #0x38]
   44b6c:	ea 22 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   44b70:	f4 03 00 aa	mov	x20, x0
   44b74:	e0 03 18 aa	mov	x0, x24
   44b78:	d8 43 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   44b7c:	e1 37 00 b0	adrp	x1, 1789 ; 0x741000
   44b80:	21 e0 12 91	add	x1, x1, #0x4b8
   44b84:	22 27 00 d0	adrp	x2, 1254 ; 0x52a000
   44b88:	42 c0 1c 91	add	x2, x2, #0x730
   44b8c:	e0 03 19 aa	mov	x0, x25
   44b90:	a0 2b 00 94	bl	_$sypSgWOhTm
   44b94:	e8 37 00 b0	adrp	x8, 1789 ; 0x741000
   44b98:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   44b9c:	ee 42 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   44ba0:	f8 03 00 aa	mov	x24, x0
   44ba4:	03 37 00 90	adrp	x3, 1760 ; 0x724000
   44ba8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   44bac:	62 23 00 91	add	x2, x27, #0x8
   44bb0:	e0 03 14 aa	mov	x0, x20
   44bb4:	e1 03 17 aa	mov	x1, x23
   44bb8:	4c 3e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   44bbc:	f9 03 00 aa	mov	x25, x0
   44bc0:	7f 6a 00 f9	str	xzr, [x19, #0xd0]
   44bc4:	64 42 03 91	add	x4, x19, #0xd0
   44bc8:	e0 03 18 aa	mov	x0, x24
   44bcc:	e2 03 19 aa	mov	x2, x25
   44bd0:	03 00 80 d2	mov	x3, #0x0
   44bd4:	33 4a 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   44bd8:	fd 03 1d aa	mov	x29, x29
   44bdc:	e7 42 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   44be0:	f7 03 00 aa	mov	x23, x0
   44be4:	e0 03 19 aa	mov	x0, x25
   44be8:	de 42 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44bec:	60 6a 40 f9	ldr	x0, [x19, #0xd0]
   44bf0:	df 42 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   44bf4:	f7 02 00 b4	cbz	x23, 0x44c50
   44bf8:	e0 03 17 aa	mov	x0, x23
   44bfc:	5a 3d 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   44c00:	f8 03 00 aa	mov	x24, x0
   44c04:	f9 03 01 aa	mov	x25, x1
   44c08:	e0 03 17 aa	mov	x0, x23
   44c0c:	d5 42 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44c10:	e8 03 15 aa	mov	x8, x21
   44c14:	4a 3e 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   44c18:	e0 03 18 aa	mov	x0, x24
   44c1c:	e1 03 19 aa	mov	x1, x25
   44c20:	e2 03 15 aa	mov	x2, x21
   44c24:	43 3e 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   44c28:	f7 03 00 aa	mov	x23, x0
   44c2c:	f5 03 01 aa	mov	x21, x1
   44c30:	e0 03 18 aa	mov	x0, x24
   44c34:	e1 03 19 aa	mov	x1, x25
   44c38:	98 22 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   44c3c:	d5 01 00 b4	cbz	x21, 0x44c74
   44c40:	e0 03 14 aa	mov	x0, x20
   44c44:	66 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44c48:	f6 03 17 aa	mov	x22, x23
   44c4c:	10 00 00 14	b	0x44c8c
   44c50:	f5 03 00 aa	mov	x21, x0
   44c54:	08 3d 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   44c58:	f7 03 00 aa	mov	x23, x0
   44c5c:	e0 03 15 aa	mov	x0, x21
   44c60:	c0 42 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44c64:	f5 03 17 aa	mov	x21, x23
   44c68:	a5 43 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   44c6c:	e0 03 17 aa	mov	x0, x23
   44c70:	70 43 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   44c74:	e0 03 14 aa	mov	x0, x20
   44c78:	59 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44c7c:	a8 26 00 b0	adrp	x8, 1237 ; 0x519000
   44c80:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   44c84:	08 81 00 d1	sub	x8, x8, #0x20
   44c88:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   44c8c:	a8 83 59 f8	ldur	x8, [x29, #-0x68]
   44c90:	09 37 00 90	adrp	x9, 1760 ; 0x724000
   44c94:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   44c98:	29 01 40 f9	ldr	x9, [x9]
   44c9c:	3f 01 08 eb	cmp	x9, x8
   44ca0:	c1 11 00 54	b.ne	0x44ed8
   44ca4:	e0 03 16 aa	mov	x0, x22
   44ca8:	e1 03 15 aa	mov	x1, x21
   44cac:	bf 43 01 d1	sub	sp, x29, #0x50
   44cb0:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   44cb4:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   44cb8:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   44cbc:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   44cc0:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   44cc4:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   44cc8:	c0 03 5f d6	ret
   44ccc:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   44cd0:	80 03 00 ad	stp	q0, q0, [x28]
   44cd4:	07 00 00 14	b	0x44cf0
   44cd8:	e0 03 14 aa	mov	x0, x20
   44cdc:	40 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44ce0:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   44ce4:	80 03 00 ad	stp	q0, q0, [x28]
   44ce8:	fa 03 19 aa	mov	x26, x25
   44cec:	79 02 40 f9	ldr	x25, [x19]
   44cf0:	e0 03 14 aa	mov	x0, x20
   44cf4:	3a 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44cf8:	68 76 40 f9	ldr	x8, [x19, #0xe8]
   44cfc:	08 0d 00 b4	cbz	x8, 0x44e9c
   44d00:	03 37 00 90	adrp	x3, 1760 ; 0x724000
   44d04:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   44d08:	60 22 00 91	add	x0, x19, #0x8
   44d0c:	61 42 03 91	add	x1, x19, #0xd0
   44d10:	62 23 00 91	add	x2, x27, #0x8
   44d14:	c4 00 80 52	mov	w4, #0x6
   44d18:	43 43 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   44d1c:	60 0d 00 36	tbz	w0, #0x0, 0x44ec8
   44d20:	64 d2 40 a9	ldp	x4, x20, [x19, #0x8]
   44d24:	e0 03 18 aa	mov	x0, x24
   44d28:	e1 03 17 aa	mov	x1, x23
   44d2c:	e2 03 1a aa	mov	x2, x26
   44d30:	e3 03 19 aa	mov	x3, x25
   44d34:	e5 03 14 aa	mov	x5, x20
   44d38:	78 fc ff 97	bl	_$s16AsideNativeSwift33generateQuickLookThumbnailAndIcon33_4DF3DD086191C68B6697891E23221139LL8filePath010iconOutputP009thumbnailrP0AA0eF16GenerationResultVSS_S2StF
   44d3c:	1a 3c 00 12	and	w26, w0, #0xffff
   44d40:	e0 03 17 aa	mov	x0, x23
   44d44:	26 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44d48:	e0 03 19 aa	mov	x0, x25
   44d4c:	24 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44d50:	e0 03 14 aa	mov	x0, x20
   44d54:	22 43 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44d58:	5f ff 03 71	cmp	w26, #0xff
   44d5c:	f4 97 9f 1a	cset	w20, hi
   44d60:	e0 37 00 b0	adrp	x0, 1789 ; 0x741000
   44d64:	00 c0 12 91	add	x0, x0, #0x4b0
   44d68:	21 27 00 d0	adrp	x1, 1254 ; 0x52a000
   44d6c:	21 a0 1c 91	add	x1, x1, #0x728
   44d70:	cf 7d ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   44d74:	61 82 00 91	add	x1, x19, #0x20
   44d78:	43 43 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   44d7c:	f7 03 00 aa	mov	x23, x0
   44d80:	28 27 00 d0	adrp	x8, 1254 ; 0x52a000
   44d84:	00 ad c1 3d	ldr	q0, [x8, #0x6b0]
   44d88:	00 04 80 3d	str	q0, [x0, #0x10]
   44d8c:	68 ae 8e d2	mov	x8, #0x7573
   44d90:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   44d94:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   44d98:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   44d9c:	f8 03 00 aa	mov	x24, x0
   44da0:	08 0f 02 f8	str	x8, [x24, #0x20]!
   44da4:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   44da8:	08 14 00 f9	str	x8, [x0, #0x28]
   44dac:	08 37 00 90	adrp	x8, 1760 ; 0x724000
   44db0:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   44db4:	14 c0 00 39	strb	w20, [x0, #0x30]
   44db8:	a9 26 00 d0	adrp	x9, 1238 ; 0x51a000
   44dbc:	29 81 04 91	add	x9, x9, #0x120 ; literal pool for: "thumbnailGenerated"
   44dc0:	29 81 00 d1	sub	x9, x9, #0x20
   44dc4:	29 01 41 b2	orr	x9, x9, #0x8000000000000000
   44dc8:	ca 4e 00 d1	sub	x10, x22, #0x13
   44dcc:	08 a8 04 a9	stp	x8, x10, [x0, #0x48]
   44dd0:	09 2c 00 f9	str	x9, [x0, #0x58]
   44dd4:	49 03 00 12	and	w9, w26, #0x1
   44dd8:	09 80 01 39	strb	w9, [x0, #0x60]
   44ddc:	29 6d 8c d2	mov	x9, #0x6369
   44de0:	e9 cd ad f2	movk	x9, #0x6e6f, lsl #16
   44de4:	e9 a8 cc f2	movk	x9, #0x6547, lsl #32
   44de8:	c9 ad ec f2	movk	x9, #0x656e, lsl #48
   44dec:	08 a4 07 a9	stp	x8, x9, [x0, #0x78]
   44df0:	49 2e 8c d2	mov	x9, #0x6172
   44df4:	89 ae ac f2	movk	x9, #0x6574, lsl #16
   44df8:	89 0c c0 f2	movk	x9, #0x64, lsl #32
   44dfc:	09 a0 fd f2	movk	x9, #0xed00, lsl #48
   44e00:	09 44 00 f9	str	x9, [x0, #0x88]
   44e04:	08 54 00 f9	str	x8, [x0, #0xa8]
   44e08:	14 40 02 39	strb	w20, [x0, #0x90]
   44e0c:	42 22 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   44e10:	f4 03 00 aa	mov	x20, x0
   44e14:	e0 03 17 aa	mov	x0, x23
   44e18:	30 43 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   44e1c:	e0 37 00 b0	adrp	x0, 1789 ; 0x741000
   44e20:	00 e0 12 91	add	x0, x0, #0x4b8
   44e24:	21 27 00 d0	adrp	x1, 1254 ; 0x52a000
   44e28:	21 c0 1c 91	add	x1, x1, #0x730
   44e2c:	a0 7d ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   44e30:	e2 03 00 aa	mov	x2, x0
   44e34:	e0 03 18 aa	mov	x0, x24
   44e38:	61 00 80 52	mov	w1, #0x3
   44e3c:	df 42 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   44e40:	e8 37 00 b0	adrp	x8, 1789 ; 0x741000
   44e44:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   44e48:	43 42 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   44e4c:	f7 03 00 aa	mov	x23, x0
   44e50:	01 37 00 90	adrp	x1, 1760 ; 0x724000
   44e54:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   44e58:	03 37 00 90	adrp	x3, 1760 ; 0x724000
   44e5c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   44e60:	62 23 00 91	add	x2, x27, #0x8
   44e64:	e0 03 14 aa	mov	x0, x20
   44e68:	a0 3d 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   44e6c:	f8 03 00 aa	mov	x24, x0
   44e70:	7f 6a 00 f9	str	xzr, [x19, #0xd0]
   44e74:	64 42 03 91	add	x4, x19, #0xd0
   44e78:	e0 03 17 aa	mov	x0, x23
   44e7c:	e2 03 18 aa	mov	x2, x24
   44e80:	03 00 80 d2	mov	x3, #0x0
   44e84:	87 49 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   44e88:	fd 03 1d aa	mov	x29, x29
   44e8c:	3b 42 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   44e90:	f7 03 00 aa	mov	x23, x0
   44e94:	e0 03 18 aa	mov	x0, x24
   44e98:	54 ff ff 17	b	0x44be8
   44e9c:	e0 03 19 aa	mov	x0, x25
   44ea0:	cf 42 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44ea4:	e0 03 17 aa	mov	x0, x23
   44ea8:	cd 42 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44eac:	e1 37 00 b0	adrp	x1, 1789 ; 0x741000
   44eb0:	21 40 12 91	add	x1, x1, #0x490
   44eb4:	22 27 00 d0	adrp	x2, 1254 ; 0x52a000
   44eb8:	42 40 1c 91	add	x2, x2, #0x710
   44ebc:	60 42 03 91	add	x0, x19, #0xd0
   44ec0:	d4 2a 00 94	bl	_$sypSgWOhTm
   44ec4:	0f ff ff 17	b	0x44b00
   44ec8:	e0 03 19 aa	mov	x0, x25
   44ecc:	c4 42 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   44ed0:	e0 03 17 aa	mov	x0, x23
   44ed4:	0a ff ff 17	b	0x44afc
   44ed8:	0b 41 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
