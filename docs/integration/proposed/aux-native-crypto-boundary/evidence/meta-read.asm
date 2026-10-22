/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift18cmdInstallMetaReadSSyF:
   3b660:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   3b664:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   3b668:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   3b66c:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   3b670:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   3b674:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   3b678:	fd 43 01 91	add	x29, sp, #0x50
   3b67c:	ff 03 04 d1	sub	sp, sp, #0x100
   3b680:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b684:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3b688:	08 01 40 f9	ldr	x8, [x8]
   3b68c:	a8 03 1a f8	stur	x8, [x29, #-0x60]
   3b690:	00 00 80 d2	mov	x0, #0x0
   3b694:	ad 63 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3b698:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3b69c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3b6a0:	e9 03 08 aa	mov	x9, x8
   3b6a4:	50 37 00 b0	adrp	x16, 1769 ; 0x724000
   3b6a8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3b6ac:	00 02 3f d6	blr	x16
   3b6b0:	e9 03 00 91	mov	x9, sp
   3b6b4:	08 3d 00 91	add	x8, x8, #0xf
   3b6b8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3b6bc:	33 01 08 cb	sub	x19, x9, x8
   3b6c0:	7f 02 00 91	mov	sp, x19
   3b6c4:	48 38 00 d0	adrp	x8, 1802 ; 0x745000
   3b6c8:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   3b6cc:	1f 05 00 b1	cmn	x8, #0x1
   3b6d0:	41 2d 00 54	b.ne	0x3bc78
   3b6d4:	48 38 00 b0	adrp	x8, 1801 ; 0x744000
   3b6d8:	08 21 39 91	add	x8, x8, #0xe48
   3b6dc:	00 05 40 a9	ldp	x0, x1, [x8]
   3b6e0:	bb de ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3b6e4:	28 fc 7c d3	lsr	x8, x1, #60
   3b6e8:	1f 39 00 f1	cmp	x8, #0xe
   3b6ec:	29 0b 00 54	b.ls	0x3b850
   3b6f0:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b6f4:	00 c0 12 91	add	x0, x0, #0x4b0
   3b6f8:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b6fc:	21 a0 1c 91	add	x1, x1, #0x728
   3b700:	6b a3 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b704:	a1 c3 02 d1	sub	x1, x29, #0xb0
   3b708:	df 68 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3b70c:	f5 03 00 aa	mov	x21, x0
   3b710:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3b714:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3b718:	00 04 80 3d	str	q0, [x0, #0x10]
   3b71c:	a8 4c 8e d2	mov	x8, #0x7265
   3b720:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3b724:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3b728:	f6 03 00 aa	mov	x22, x0
   3b72c:	c8 0e 02 f8	str	x8, [x22, #0x20]!
   3b730:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3b734:	57 37 00 b0	adrp	x23, 1769 ; 0x724000
   3b738:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   3b73c:	17 24 00 f9	str	x23, [x0, #0x48]
   3b740:	c9 ed 8d d2	mov	x9, #0x6f6e
   3b744:	89 0e a4 f2	movk	x9, #0x2074, lsl #16
   3b748:	29 cd cd f2	movk	x9, #0x6e69, lsl #32
   3b74c:	69 8e ee f2	movk	x9, #0x7473, lsl #48
   3b750:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3b754:	28 8c 8d d2	mov	x8, #0x6c61
   3b758:	88 ad ac f2	movk	x8, #0x656c, lsl #16
   3b75c:	88 0c c0 f2	movk	x8, #0x64, lsl #32
   3b760:	08 a0 fd f2	movk	x8, #0xed00, lsl #48
   3b764:	08 1c 00 f9	str	x8, [x0, #0x38]
   3b768:	eb 47 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3b76c:	f4 03 00 aa	mov	x20, x0
   3b770:	e0 03 15 aa	mov	x0, x21
   3b774:	d9 68 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3b778:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3b77c:	21 e0 12 91	add	x1, x1, #0x4b8
   3b780:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3b784:	42 c0 1c 91	add	x2, x2, #0x730
   3b788:	e0 03 16 aa	mov	x0, x22
   3b78c:	a1 50 00 94	bl	_$sypSgWOhTm
   3b790:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3b794:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3b798:	ef 67 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3b79c:	f5 03 00 aa	mov	x21, x0
   3b7a0:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b7a4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3b7a8:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3b7ac:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3b7b0:	02 21 00 91	add	x2, x8, #0x8
   3b7b4:	e0 03 14 aa	mov	x0, x20
   3b7b8:	e1 03 17 aa	mov	x1, x23
   3b7bc:	4b 63 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3b7c0:	f6 03 00 aa	mov	x22, x0
   3b7c4:	bf 03 13 f8	stur	xzr, [x29, #-0xd0]
   3b7c8:	a4 43 03 d1	sub	x4, x29, #0xd0
   3b7cc:	e0 03 15 aa	mov	x0, x21
   3b7d0:	e2 03 16 aa	mov	x2, x22
   3b7d4:	03 00 80 d2	mov	x3, #0x0
   3b7d8:	32 6f 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3b7dc:	fd 03 1d aa	mov	x29, x29
   3b7e0:	e6 67 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3b7e4:	f5 03 00 aa	mov	x21, x0
   3b7e8:	e0 03 16 aa	mov	x0, x22
   3b7ec:	dd 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b7f0:	a0 03 53 f8	ldur	x0, [x29, #-0xd0]
   3b7f4:	de 67 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3b7f8:	95 0e 00 b4	cbz	x21, 0x3b9c8
   3b7fc:	e0 03 15 aa	mov	x0, x21
   3b800:	59 62 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3b804:	f6 03 00 aa	mov	x22, x0
   3b808:	f8 03 01 aa	mov	x24, x1
   3b80c:	e0 03 15 aa	mov	x0, x21
   3b810:	d4 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b814:	e8 03 13 aa	mov	x8, x19
   3b818:	49 63 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3b81c:	e0 03 16 aa	mov	x0, x22
   3b820:	e1 03 18 aa	mov	x1, x24
   3b824:	e2 03 13 aa	mov	x2, x19
   3b828:	42 63 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3b82c:	f7 03 00 aa	mov	x23, x0
   3b830:	f3 03 01 aa	mov	x19, x1
   3b834:	e0 03 16 aa	mov	x0, x22
   3b838:	e1 03 18 aa	mov	x1, x24
   3b83c:	97 47 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3b840:	73 0d 00 b4	cbz	x19, 0x3b9ec
   3b844:	e0 03 14 aa	mov	x0, x20
   3b848:	65 68 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b84c:	fb 00 00 14	b	0x3bc38
   3b850:	f6 03 00 aa	mov	x22, x0
   3b854:	f4 03 01 aa	mov	x20, x1
   3b858:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3b85c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3b860:	bd 67 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3b864:	f8 03 00 aa	mov	x24, x0
   3b868:	e0 03 16 aa	mov	x0, x22
   3b86c:	e1 03 14 aa	mov	x1, x20
   3b870:	37 62 13 94	bl	0x51414c ; symbol stub for: _$s10Foundation4DataV19_bridgeToObjectiveCSo6NSDataCyF
   3b874:	f7 03 00 aa	mov	x23, x0
   3b878:	a8 43 01 d1	sub	x8, x29, #0x50
   3b87c:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   3b880:	a4 43 05 d1	sub	x4, x29, #0x150
   3b884:	e0 03 18 aa	mov	x0, x24
   3b888:	e2 03 17 aa	mov	x2, x23
   3b88c:	03 00 80 d2	mov	x3, #0x0
   3b890:	94 6e 13 94	bl	"_objc_msgSend$JSONObjectWithData:options:error:"
   3b894:	fd 03 1d aa	mov	x29, x29
   3b898:	b8 67 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3b89c:	f5 03 00 aa	mov	x21, x0
   3b8a0:	e0 03 17 aa	mov	x0, x23
   3b8a4:	af 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b8a8:	a8 43 01 d1	sub	x8, x29, #0x50
   3b8ac:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3b8b0:	af 67 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3b8b4:	5c 37 00 b0	adrp	x28, 1769 ; 0x724000
   3b8b8:	9c 6b 41 f9	ldr	x28, [x28, #0x2d0] ; literal pool symbol address: _$sypN
   3b8bc:	b5 0a 00 b4	cbz	x21, 0x3ba10
   3b8c0:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3b8c4:	e0 03 15 aa	mov	x0, x21
   3b8c8:	62 63 13 94	bl	0x514650 ; symbol stub for: _$ss018_bridgeAnyObjectToB0yypyXlSgF
   3b8cc:	e0 03 15 aa	mov	x0, x21
   3b8d0:	85 68 13 94	bl	0x515ae4 ; symbol stub for: _swift_unknownObjectRelease
   3b8d4:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3b8d8:	a1 43 03 d1	sub	x1, x29, #0xd0
   3b8dc:	de 47 00 94	bl	_$sypWOb
   3b8e0:	a0 43 03 d1	sub	x0, x29, #0xd0
   3b8e4:	a1 c3 03 d1	sub	x1, x29, #0xf0
   3b8e8:	7c 47 00 94	bl	_$sypWOc
   3b8ec:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b8f0:	00 a0 12 91	add	x0, x0, #0x4a8
   3b8f4:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b8f8:	21 80 1c 91	add	x1, x1, #0x720
   3b8fc:	ec a2 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b900:	e3 03 00 aa	mov	x3, x0
   3b904:	a0 43 05 d1	sub	x0, x29, #0x150
   3b908:	a1 c3 03 d1	sub	x1, x29, #0xf0
   3b90c:	82 23 00 91	add	x2, x28, #0x8
   3b910:	c4 00 80 52	mov	w4, #0x6
   3b914:	44 68 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   3b918:	00 09 00 36	tbz	w0, #0x0, 0x3ba38
   3b91c:	a8 43 01 d1	sub	x8, x29, #0x50
   3b920:	19 01 50 f8	ldur	x25, [x8, #-0x100]
   3b924:	41 37 00 b0	adrp	x1, 1769 ; 0x724000
   3b928:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   3b92c:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3b930:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3b934:	82 23 00 91	add	x2, x28, #0x8
   3b938:	e0 03 19 aa	mov	x0, x25
   3b93c:	eb 62 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3b940:	f7 03 00 aa	mov	x23, x0
   3b944:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3b948:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3b94c:	e0 03 18 aa	mov	x0, x24
   3b950:	e2 03 17 aa	mov	x2, x23
   3b954:	03 00 80 d2	mov	x3, #0x0
   3b958:	d2 6e 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3b95c:	fd 03 1d aa	mov	x29, x29
   3b960:	86 67 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3b964:	f5 03 00 aa	mov	x21, x0
   3b968:	e0 03 17 aa	mov	x0, x23
   3b96c:	7d 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b970:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3b974:	7e 67 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3b978:	55 13 00 b4	cbz	x21, 0x3bbe0
   3b97c:	e0 03 15 aa	mov	x0, x21
   3b980:	f9 61 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3b984:	f8 03 00 aa	mov	x24, x0
   3b988:	fa 03 01 aa	mov	x26, x1
   3b98c:	e0 03 15 aa	mov	x0, x21
   3b990:	74 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b994:	e8 03 13 aa	mov	x8, x19
   3b998:	e9 62 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3b99c:	e0 03 18 aa	mov	x0, x24
   3b9a0:	e1 03 1a aa	mov	x1, x26
   3b9a4:	e2 03 13 aa	mov	x2, x19
   3b9a8:	e2 62 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3b9ac:	f7 03 00 aa	mov	x23, x0
   3b9b0:	f3 03 01 aa	mov	x19, x1
   3b9b4:	e0 03 18 aa	mov	x0, x24
   3b9b8:	e1 03 1a aa	mov	x1, x26
   3b9bc:	37 47 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3b9c0:	f3 12 00 b5	cbnz	x19, 0x3bc1c
   3b9c4:	90 00 00 14	b	0x3bc04
   3b9c8:	f3 03 00 aa	mov	x19, x0
   3b9cc:	aa 61 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3b9d0:	f6 03 00 aa	mov	x22, x0
   3b9d4:	e0 03 13 aa	mov	x0, x19
   3b9d8:	62 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b9dc:	f5 03 16 aa	mov	x21, x22
   3b9e0:	47 68 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3b9e4:	e0 03 16 aa	mov	x0, x22
   3b9e8:	12 68 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b9ec:	b7 04 80 d2	mov	x23, #0x25
   3b9f0:	17 00 fa f2	movk	x23, #0xd000, lsl #48
   3b9f4:	e0 03 14 aa	mov	x0, x20
   3b9f8:	f9 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b9fc:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3ba00:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3ba04:	08 81 00 d1	sub	x8, x8, #0x20
   3ba08:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3ba0c:	8b 00 00 14	b	0x3bc38
   3ba10:	f5 03 00 aa	mov	x21, x0
   3ba14:	98 61 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3ba18:	f7 03 00 aa	mov	x23, x0
   3ba1c:	e0 03 15 aa	mov	x0, x21
   3ba20:	50 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ba24:	f5 03 17 aa	mov	x21, x23
   3ba28:	35 68 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3ba2c:	e0 03 17 aa	mov	x0, x23
   3ba30:	00 68 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3ba34:	03 00 00 14	b	0x3ba40
   3ba38:	a0 43 03 d1	sub	x0, x29, #0xd0
   3ba3c:	8e 4b 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3ba40:	b7 04 80 d2	mov	x23, #0x25
   3ba44:	17 00 fa f2	movk	x23, #0xd000, lsl #48
   3ba48:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3ba4c:	08 c1 3c 91	add	x8, x8, #0xf30 ; literal pool for: "Invalid install metadata"
   3ba50:	08 81 00 d1	sub	x8, x8, #0x20
   3ba54:	19 01 41 b2	orr	x25, x8, #0x8000000000000000
   3ba58:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3ba5c:	00 c0 12 91	add	x0, x0, #0x4b0
   3ba60:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3ba64:	21 a0 1c 91	add	x1, x1, #0x728
   3ba68:	91 a2 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3ba6c:	a1 03 05 d1	sub	x1, x29, #0x140
   3ba70:	05 68 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3ba74:	f5 03 00 aa	mov	x21, x0
   3ba78:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3ba7c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3ba80:	00 04 80 3d	str	q0, [x0, #0x10]
   3ba84:	a8 4c 8e d2	mov	x8, #0x7265
   3ba88:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3ba8c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3ba90:	fa 03 00 aa	mov	x26, x0
   3ba94:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3ba98:	5b 37 00 b0	adrp	x27, 1769 ; 0x724000
   3ba9c:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   3baa0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3baa4:	1b 24 00 f9	str	x27, [x0, #0x48]
   3baa8:	e9 36 00 d1	sub	x9, x23, #0xd
   3baac:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3bab0:	19 1c 00 f9	str	x25, [x0, #0x38]
   3bab4:	18 47 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3bab8:	f9 03 00 aa	mov	x25, x0
   3babc:	e0 03 15 aa	mov	x0, x21
   3bac0:	06 68 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3bac4:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3bac8:	21 e0 12 91	add	x1, x1, #0x4b8
   3bacc:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3bad0:	42 c0 1c 91	add	x2, x2, #0x730
   3bad4:	e0 03 1a aa	mov	x0, x26
   3bad8:	ce 4f 00 94	bl	_$sypSgWOhTm
   3badc:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3bae0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3bae4:	82 23 00 91	add	x2, x28, #0x8
   3bae8:	e0 03 19 aa	mov	x0, x25
   3baec:	e1 03 1b aa	mov	x1, x27
   3baf0:	7e 62 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3baf4:	fa 03 00 aa	mov	x26, x0
   3baf8:	bf 03 13 f8	stur	xzr, [x29, #-0xd0]
   3bafc:	a4 43 03 d1	sub	x4, x29, #0xd0
   3bb00:	e0 03 18 aa	mov	x0, x24
   3bb04:	e2 03 1a aa	mov	x2, x26
   3bb08:	03 00 80 d2	mov	x3, #0x0
   3bb0c:	65 6e 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3bb10:	fd 03 1d aa	mov	x29, x29
   3bb14:	19 67 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3bb18:	f5 03 00 aa	mov	x21, x0
   3bb1c:	e0 03 1a aa	mov	x0, x26
   3bb20:	10 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3bb24:	a0 03 53 f8	ldur	x0, [x29, #-0xd0]
   3bb28:	11 67 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3bb2c:	55 03 00 b4	cbz	x21, 0x3bb94
   3bb30:	e0 03 15 aa	mov	x0, x21
   3bb34:	8c 61 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3bb38:	f8 03 00 aa	mov	x24, x0
   3bb3c:	fa 03 01 aa	mov	x26, x1
   3bb40:	e0 03 15 aa	mov	x0, x21
   3bb44:	07 67 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3bb48:	e8 03 13 aa	mov	x8, x19
   3bb4c:	7c 62 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3bb50:	e0 03 18 aa	mov	x0, x24
   3bb54:	e1 03 1a aa	mov	x1, x26
   3bb58:	e2 03 13 aa	mov	x2, x19
   3bb5c:	75 62 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3bb60:	f5 03 00 aa	mov	x21, x0
   3bb64:	f3 03 01 aa	mov	x19, x1
   3bb68:	e0 03 18 aa	mov	x0, x24
   3bb6c:	e1 03 1a aa	mov	x1, x26
   3bb70:	ca 46 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3bb74:	33 02 00 b4	cbz	x19, 0x3bbb8
   3bb78:	e0 03 16 aa	mov	x0, x22
   3bb7c:	e1 03 14 aa	mov	x1, x20
   3bb80:	ba 4f 00 94	bl	0x4fa68
   3bb84:	e0 03 19 aa	mov	x0, x25
   3bb88:	95 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bb8c:	f7 03 15 aa	mov	x23, x21
   3bb90:	2a 00 00 14	b	0x3bc38
   3bb94:	f3 03 00 aa	mov	x19, x0
   3bb98:	37 61 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3bb9c:	f8 03 00 aa	mov	x24, x0
   3bba0:	e0 03 13 aa	mov	x0, x19
   3bba4:	ef 66 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3bba8:	f5 03 18 aa	mov	x21, x24
   3bbac:	d4 67 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3bbb0:	e0 03 18 aa	mov	x0, x24
   3bbb4:	9f 67 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3bbb8:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3bbbc:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3bbc0:	08 81 00 d1	sub	x8, x8, #0x20
   3bbc4:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3bbc8:	e0 03 16 aa	mov	x0, x22
   3bbcc:	e1 03 14 aa	mov	x1, x20
   3bbd0:	a6 4f 00 94	bl	0x4fa68
   3bbd4:	e0 03 19 aa	mov	x0, x25
   3bbd8:	81 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bbdc:	17 00 00 14	b	0x3bc38
   3bbe0:	f3 03 00 aa	mov	x19, x0
   3bbe4:	24 61 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3bbe8:	f7 03 00 aa	mov	x23, x0
   3bbec:	e0 03 13 aa	mov	x0, x19
   3bbf0:	dc 66 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3bbf4:	f5 03 17 aa	mov	x21, x23
   3bbf8:	c1 67 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3bbfc:	e0 03 17 aa	mov	x0, x23
   3bc00:	8c 67 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3bc04:	b7 04 80 d2	mov	x23, #0x25
   3bc08:	17 00 fa f2	movk	x23, #0xd000, lsl #48
   3bc0c:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3bc10:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3bc14:	08 81 00 d1	sub	x8, x8, #0x20
   3bc18:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3bc1c:	e0 03 16 aa	mov	x0, x22
   3bc20:	e1 03 14 aa	mov	x1, x20
   3bc24:	91 4f 00 94	bl	0x4fa68
   3bc28:	e0 03 19 aa	mov	x0, x25
   3bc2c:	6c 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bc30:	a0 43 03 d1	sub	x0, x29, #0xd0
   3bc34:	10 4b 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3bc38:	a8 03 5a f8	ldur	x8, [x29, #-0x60]
   3bc3c:	49 37 00 b0	adrp	x9, 1769 ; 0x724000
   3bc40:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3bc44:	29 01 40 f9	ldr	x9, [x9]
   3bc48:	3f 01 08 eb	cmp	x9, x8
   3bc4c:	21 02 00 54	b.ne	0x3bc90
   3bc50:	e0 03 17 aa	mov	x0, x23
   3bc54:	e1 03 13 aa	mov	x1, x19
   3bc58:	bf 43 01 d1	sub	sp, x29, #0x50
   3bc5c:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   3bc60:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   3bc64:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   3bc68:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   3bc6c:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   3bc70:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   3bc74:	c0 03 5f d6	ret
   3bc78:	40 38 00 d0	adrp	x0, 1802 ; 0x745000
   3bc7c:	00 a0 07 91	add	x0, x0, #0x1e8
   3bc80:	a1 ff ff b0	adrp	x1, -11 ; 0x30000
   3bc84:	21 e0 1f 91	add	x1, x1, #0x7f8
   3bc88:	88 67 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3bc8c:	92 fe ff 17	b	0x3b6d4
   3bc90:	9d 65 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
