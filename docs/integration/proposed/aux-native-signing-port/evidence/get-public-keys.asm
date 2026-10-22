/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift16cmdGetPublicKeysSSyF:
   418bc:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   418c0:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   418c4:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   418c8:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   418cc:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   418d0:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   418d4:	fd 43 01 91	add	x29, sp, #0x50
   418d8:	ff 43 0d d1	sub	sp, sp, #0x350
   418dc:	f3 03 00 91	mov	x19, sp
   418e0:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   418e4:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   418e8:	08 01 40 f9	ldr	x8, [x8]
   418ec:	a8 03 1a f8	stur	x8, [x29, #-0x60]
   418f0:	15 00 80 d2	mov	x21, #0x0
   418f4:	49 c8 ff 97	bl	_$s16AsideNativeSwift18requireInstallMetaAA0eF0VyKF
   418f8:	fb 03 15 aa	mov	x27, x21
   418fc:	35 10 00 b4	cbz	x21, 0x41b00
   41900:	ba 04 80 d2	mov	x26, #0x25
   41904:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   41908:	08 00 fc d2	mov	x8, #-0x2000000000000000
   4190c:	bf 23 39 a9	stp	xzr, x8, [x29, #-0x70]
   41910:	b4 c3 01 d1	sub	x20, x29, #0x70
   41914:	40 03 80 52	mov	w0, #0x1a
   41918:	5a 4b 13 94	bl	0x514680 ; symbol stub for: _$ss11_StringGutsV4growyySiF
   4191c:	a0 83 59 f8	ldur	x0, [x29, #-0x68]
   41920:	2f 50 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41924:	c8 26 00 b0	adrp	x8, 1241 ; 0x51a000
   41928:	08 41 02 91	add	x8, x8, #0x90 ; literal pool for: "get-public-keys failed: "
   4192c:	08 81 00 d1	sub	x8, x8, #0x20
   41930:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   41934:	49 37 00 d1	sub	x9, x26, #0xd
   41938:	a9 23 39 a9	stp	x9, x8, [x29, #-0x70]
   4193c:	61 02 02 91	add	x1, x19, #0x80
   41940:	62 a2 01 91	add	x2, x19, #0x68
   41944:	e0 03 1b aa	mov	x0, x27
   41948:	40 50 13 94	bl	0x515a48 ; symbol stub for: _swift_getErrorValue
   4194c:	74 82 46 a9	ldp	x20, x0, [x19, #0x68]
   41950:	61 3e 40 f9	ldr	x1, [x19, #0x78]
   41954:	8d 4b 13 94	bl	0x514788 ; symbol stub for: _$ss5ErrorP10FoundationE20localizedDescriptionSSvg
   41958:	f5 03 01 aa	mov	x21, x1
   4195c:	b4 c3 01 d1	sub	x20, x29, #0x70
   41960:	03 4b 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   41964:	e0 03 15 aa	mov	x0, x21
   41968:	1d 50 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4196c:	b7 5b 79 a9	ldp	x23, x22, [x29, #-0x70]
   41970:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   41974:	00 c0 12 91	add	x0, x0, #0x4b0
   41978:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   4197c:	21 a0 1c 91	add	x1, x1, #0x728
   41980:	cb 8a ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   41984:	a1 03 03 d1	sub	x1, x29, #0xc0
   41988:	3f 50 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   4198c:	f4 03 00 aa	mov	x20, x0
   41990:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   41994:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41998:	00 04 80 3d	str	q0, [x0, #0x10]
   4199c:	a8 4c 8e d2	mov	x8, #0x7265
   419a0:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   419a4:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   419a8:	f5 03 00 aa	mov	x21, x0
   419ac:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   419b0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   419b4:	18 37 00 f0	adrp	x24, 1763 ; 0x724000
   419b8:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   419bc:	18 24 00 f9	str	x24, [x0, #0x48]
   419c0:	08 dc 02 a9	stp	x8, x23, [x0, #0x28]
   419c4:	16 1c 00 f9	str	x22, [x0, #0x38]
   419c8:	e0 03 16 aa	mov	x0, x22
   419cc:	0a 50 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   419d0:	e0 03 14 aa	mov	x0, x20
   419d4:	50 2f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   419d8:	f7 03 00 aa	mov	x23, x0
   419dc:	e0 03 14 aa	mov	x0, x20
   419e0:	3e 50 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   419e4:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   419e8:	21 e0 12 91	add	x1, x1, #0x4b8
   419ec:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   419f0:	42 c0 1c 91	add	x2, x2, #0x730
   419f4:	e0 03 15 aa	mov	x0, x21
   419f8:	06 38 00 94	bl	_$sypSgWOhTm
   419fc:	08 38 00 90	adrp	x8, 1792 ; 0x741000
   41a00:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   41a04:	54 4f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   41a08:	f4 03 00 aa	mov	x20, x0
   41a0c:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   41a10:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   41a14:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   41a18:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   41a1c:	02 21 00 91	add	x2, x8, #0x8
   41a20:	e0 03 17 aa	mov	x0, x23
   41a24:	e1 03 18 aa	mov	x1, x24
   41a28:	b0 4a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   41a2c:	f5 03 00 aa	mov	x21, x0
   41a30:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   41a34:	a4 c3 01 d1	sub	x4, x29, #0x70
   41a38:	e0 03 14 aa	mov	x0, x20
   41a3c:	e2 03 15 aa	mov	x2, x21
   41a40:	03 00 80 d2	mov	x3, #0x0
   41a44:	97 56 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   41a48:	fd 03 1d aa	mov	x29, x29
   41a4c:	4b 4f 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   41a50:	f4 03 00 aa	mov	x20, x0
   41a54:	e0 03 15 aa	mov	x0, x21
   41a58:	42 4f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41a5c:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   41a60:	43 4f 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41a64:	54 13 00 b4	cbz	x20, 0x41ccc
   41a68:	e0 03 14 aa	mov	x0, x20
   41a6c:	be 49 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   41a70:	f8 03 00 aa	mov	x24, x0
   41a74:	f9 03 01 aa	mov	x25, x1
   41a78:	e0 03 14 aa	mov	x0, x20
   41a7c:	39 4f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41a80:	00 00 80 d2	mov	x0, #0x0
   41a84:	b1 4a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   41a88:	fc 03 00 91	mov	x28, sp
   41a8c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   41a90:	08 21 40 f9	ldr	x8, [x8, #0x40]
   41a94:	e9 03 08 aa	mov	x9, x8
   41a98:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41a9c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41aa0:	00 02 3f d6	blr	x16
   41aa4:	e9 03 00 91	mov	x9, sp
   41aa8:	08 3d 00 91	add	x8, x8, #0xf
   41aac:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41ab0:	34 01 08 cb	sub	x20, x9, x8
   41ab4:	9f 02 00 91	mov	sp, x20
   41ab8:	e8 03 14 aa	mov	x8, x20
   41abc:	a0 4a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   41ac0:	e0 03 18 aa	mov	x0, x24
   41ac4:	e1 03 19 aa	mov	x1, x25
   41ac8:	e2 03 14 aa	mov	x2, x20
   41acc:	99 4a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   41ad0:	f5 03 00 aa	mov	x21, x0
   41ad4:	f4 03 01 aa	mov	x20, x1
   41ad8:	e0 03 18 aa	mov	x0, x24
   41adc:	e1 03 19 aa	mov	x1, x25
   41ae0:	ee 2e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   41ae4:	9f 03 00 91	mov	sp, x28
   41ae8:	54 10 00 b4	cbz	x20, 0x41cf0
   41aec:	e0 03 1b aa	mov	x0, x27
   41af0:	d0 4f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   41af4:	e0 03 17 aa	mov	x0, x23
   41af8:	b9 4f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41afc:	70 00 00 14	b	0x41cbc
   41b00:	f4 03 00 aa	mov	x20, x0
   41b04:	28 38 00 90	adrp	x8, 1796 ; 0x745000
   41b08:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   41b0c:	1f 05 00 b1	cmn	x8, #0x1
   41b10:	61 ae 00 54	b.ne	0x430dc
   41b14:	08 38 00 f0	adrp	x8, 1795 ; 0x744000
   41b18:	08 61 39 91	add	x8, x8, #0xe58
   41b1c:	00 05 40 a9	ldp	x0, x1, [x8]
   41b20:	ab c5 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   41b24:	28 fc 7c d3	lsr	x8, x1, #60
   41b28:	1f 39 00 f1	cmp	x8, #0xe
   41b2c:	69 11 00 54	b.ls	0x41d58
   41b30:	ba 04 80 d2	mov	x26, #0x25
   41b34:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   41b38:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41b3c:	08 81 36 91	add	x8, x8, #0xda0 ; literal pool for: "Install signing key not found"
   41b40:	08 81 00 d1	sub	x8, x8, #0x20
   41b44:	16 01 41 b2	orr	x22, x8, #0x8000000000000000
   41b48:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   41b4c:	00 c0 12 91	add	x0, x0, #0x4b0
   41b50:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   41b54:	21 a0 1c 91	add	x1, x1, #0x728
   41b58:	55 8a ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   41b5c:	61 42 0a 91	add	x1, x19, #0x290
   41b60:	c9 4f 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   41b64:	f4 03 00 aa	mov	x20, x0
   41b68:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   41b6c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41b70:	00 04 80 3d	str	q0, [x0, #0x10]
   41b74:	a8 4c 8e d2	mov	x8, #0x7265
   41b78:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   41b7c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   41b80:	f5 03 00 aa	mov	x21, x0
   41b84:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   41b88:	17 37 00 f0	adrp	x23, 1763 ; 0x724000
   41b8c:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   41b90:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   41b94:	17 24 00 f9	str	x23, [x0, #0x48]
   41b98:	49 23 00 d1	sub	x9, x26, #0x8
   41b9c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   41ba0:	16 1c 00 f9	str	x22, [x0, #0x38]
   41ba4:	dc 2e 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   41ba8:	f6 03 00 aa	mov	x22, x0
   41bac:	e0 03 14 aa	mov	x0, x20
   41bb0:	ca 4f 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   41bb4:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   41bb8:	21 e0 12 91	add	x1, x1, #0x4b8
   41bbc:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   41bc0:	42 c0 1c 91	add	x2, x2, #0x730
   41bc4:	e0 03 15 aa	mov	x0, x21
   41bc8:	92 37 00 94	bl	_$sypSgWOhTm
   41bcc:	08 38 00 90	adrp	x8, 1792 ; 0x741000
   41bd0:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   41bd4:	e0 4e 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   41bd8:	f4 03 00 aa	mov	x20, x0
   41bdc:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   41be0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   41be4:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   41be8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   41bec:	02 21 00 91	add	x2, x8, #0x8
   41bf0:	e0 03 16 aa	mov	x0, x22
   41bf4:	e1 03 17 aa	mov	x1, x23
   41bf8:	3c 4a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   41bfc:	f5 03 00 aa	mov	x21, x0
   41c00:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   41c04:	a4 c3 01 d1	sub	x4, x29, #0x70
   41c08:	e0 03 14 aa	mov	x0, x20
   41c0c:	e2 03 15 aa	mov	x2, x21
   41c10:	03 00 80 d2	mov	x3, #0x0
   41c14:	23 56 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   41c18:	fd 03 1d aa	mov	x29, x29
   41c1c:	d7 4e 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   41c20:	f4 03 00 aa	mov	x20, x0
   41c24:	e0 03 15 aa	mov	x0, x21
   41c28:	ce 4e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41c2c:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   41c30:	cf 4e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41c34:	f4 1d 00 b4	cbz	x20, 0x41ff0
   41c38:	e0 03 14 aa	mov	x0, x20
   41c3c:	4a 49 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   41c40:	f7 03 00 aa	mov	x23, x0
   41c44:	f8 03 01 aa	mov	x24, x1
   41c48:	e0 03 14 aa	mov	x0, x20
   41c4c:	c5 4e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41c50:	00 00 80 d2	mov	x0, #0x0
   41c54:	3d 4a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   41c58:	f9 03 00 91	mov	x25, sp
   41c5c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   41c60:	08 21 40 f9	ldr	x8, [x8, #0x40]
   41c64:	e9 03 08 aa	mov	x9, x8
   41c68:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41c6c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41c70:	00 02 3f d6	blr	x16
   41c74:	e9 03 00 91	mov	x9, sp
   41c78:	08 3d 00 91	add	x8, x8, #0xf
   41c7c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41c80:	34 01 08 cb	sub	x20, x9, x8
   41c84:	9f 02 00 91	mov	sp, x20
   41c88:	e8 03 14 aa	mov	x8, x20
   41c8c:	2c 4a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   41c90:	e0 03 17 aa	mov	x0, x23
   41c94:	e1 03 18 aa	mov	x1, x24
   41c98:	e2 03 14 aa	mov	x2, x20
   41c9c:	25 4a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   41ca0:	f5 03 00 aa	mov	x21, x0
   41ca4:	f4 03 01 aa	mov	x20, x1
   41ca8:	e0 03 17 aa	mov	x0, x23
   41cac:	e1 03 18 aa	mov	x1, x24
   41cb0:	7a 2e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   41cb4:	3f 03 00 91	mov	sp, x25
   41cb8:	f4 1a 00 b4	cbz	x20, 0x42014
   41cbc:	e0 03 16 aa	mov	x0, x22
   41cc0:	47 4f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41cc4:	fa 03 15 aa	mov	x26, x21
   41cc8:	14 00 00 14	b	0x41d18
   41ccc:	f4 03 00 aa	mov	x20, x0
   41cd0:	e9 48 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   41cd4:	f8 03 00 aa	mov	x24, x0
   41cd8:	e0 03 14 aa	mov	x0, x20
   41cdc:	a1 4e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41ce0:	f5 03 18 aa	mov	x21, x24
   41ce4:	86 4f 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   41ce8:	e0 03 18 aa	mov	x0, x24
   41cec:	51 4f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   41cf0:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41cf4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   41cf8:	08 81 00 d1	sub	x8, x8, #0x20
   41cfc:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   41d00:	e0 03 1b aa	mov	x0, x27
   41d04:	4b 4f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   41d08:	e0 03 17 aa	mov	x0, x23
   41d0c:	34 4f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41d10:	e0 03 16 aa	mov	x0, x22
   41d14:	32 4f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   41d18:	a8 03 5a f8	ldur	x8, [x29, #-0x60]
   41d1c:	09 37 00 f0	adrp	x9, 1763 ; 0x724000
   41d20:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   41d24:	29 01 40 f9	ldr	x9, [x9]
   41d28:	3f 01 08 eb	cmp	x9, x8
   41d2c:	01 9f 00 54	b.ne	0x4310c
   41d30:	e0 03 1a aa	mov	x0, x26
   41d34:	e1 03 14 aa	mov	x1, x20
   41d38:	bf 43 01 d1	sub	sp, x29, #0x50
   41d3c:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   41d40:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   41d44:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   41d48:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   41d4c:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   41d50:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   41d54:	c0 03 5f d6	ret
   41d58:	f7 03 00 aa	mov	x23, x0
   41d5c:	f6 03 01 aa	mov	x22, x1
   41d60:	28 38 00 90	adrp	x8, 1796 ; 0x745000
   41d64:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   41d68:	1f 05 00 b1	cmn	x8, #0x1
   41d6c:	41 9c 00 54	b.ne	0x430f4
   41d70:	08 38 00 f0	adrp	x8, 1795 ; 0x744000
   41d74:	08 a1 39 91	add	x8, x8, #0xe68
   41d78:	00 05 40 a9	ldp	x0, x1, [x8]
   41d7c:	14 c5 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   41d80:	61 32 00 f9	str	x1, [x19, #0x60]
   41d84:	28 fc 7c d3	lsr	x8, x1, #60
   41d88:	1f 39 00 f1	cmp	x8, #0xe
   41d8c:	29 0d 00 54	b.ls	0x41f30
   41d90:	ba 04 80 d2	mov	x26, #0x25
   41d94:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   41d98:	c8 26 00 90	adrp	x8, 1240 ; 0x519000
   41d9c:	08 01 37 91	add	x8, x8, #0xdc0 ; literal pool for: "Install key agreement key not found"
   41da0:	08 81 00 d1	sub	x8, x8, #0x20
   41da4:	18 01 41 b2	orr	x24, x8, #0x8000000000000000
   41da8:	00 38 00 90	adrp	x0, 1792 ; 0x741000
   41dac:	00 c0 12 91	add	x0, x0, #0x4b0
   41db0:	41 27 00 b0	adrp	x1, 1257 ; 0x52a000
   41db4:	21 a0 1c 91	add	x1, x1, #0x728
   41db8:	bd 89 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   41dbc:	61 02 09 91	add	x1, x19, #0x240
   41dc0:	31 4f 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   41dc4:	f4 03 00 aa	mov	x20, x0
   41dc8:	48 27 00 b0	adrp	x8, 1257 ; 0x52a000
   41dcc:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   41dd0:	00 04 80 3d	str	q0, [x0, #0x10]
   41dd4:	a8 4c 8e d2	mov	x8, #0x7265
   41dd8:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   41ddc:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   41de0:	f5 03 00 aa	mov	x21, x0
   41de4:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   41de8:	19 37 00 f0	adrp	x25, 1763 ; 0x724000
   41dec:	39 27 41 f9	ldr	x25, [x25, #0x248] ; literal pool symbol address: _$sSSN
   41df0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   41df4:	19 24 00 f9	str	x25, [x0, #0x48]
   41df8:	49 0b 00 d1	sub	x9, x26, #0x2
   41dfc:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   41e00:	18 1c 00 f9	str	x24, [x0, #0x38]
   41e04:	44 2e 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   41e08:	f8 03 00 aa	mov	x24, x0
   41e0c:	e0 03 14 aa	mov	x0, x20
   41e10:	32 4f 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   41e14:	01 38 00 90	adrp	x1, 1792 ; 0x741000
   41e18:	21 e0 12 91	add	x1, x1, #0x4b8
   41e1c:	42 27 00 b0	adrp	x2, 1257 ; 0x52a000
   41e20:	42 c0 1c 91	add	x2, x2, #0x730
   41e24:	e0 03 15 aa	mov	x0, x21
   41e28:	fa 36 00 94	bl	_$sypSgWOhTm
   41e2c:	08 38 00 90	adrp	x8, 1792 ; 0x741000
   41e30:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   41e34:	48 4e 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   41e38:	f4 03 00 aa	mov	x20, x0
   41e3c:	08 37 00 f0	adrp	x8, 1763 ; 0x724000
   41e40:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   41e44:	03 37 00 f0	adrp	x3, 1763 ; 0x724000
   41e48:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   41e4c:	02 21 00 91	add	x2, x8, #0x8
   41e50:	e0 03 18 aa	mov	x0, x24
   41e54:	e1 03 19 aa	mov	x1, x25
   41e58:	a4 49 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   41e5c:	f5 03 00 aa	mov	x21, x0
   41e60:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   41e64:	a4 c3 01 d1	sub	x4, x29, #0x70
   41e68:	e0 03 14 aa	mov	x0, x20
   41e6c:	e2 03 15 aa	mov	x2, x21
   41e70:	03 00 80 d2	mov	x3, #0x0
   41e74:	8b 55 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   41e78:	fd 03 1d aa	mov	x29, x29
   41e7c:	3f 4e 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   41e80:	f4 03 00 aa	mov	x20, x0
   41e84:	e0 03 15 aa	mov	x0, x21
   41e88:	36 4e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41e8c:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   41e90:	37 4e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   41e94:	f4 11 00 b4	cbz	x20, 0x420d0
   41e98:	e0 03 14 aa	mov	x0, x20
   41e9c:	b2 48 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   41ea0:	f9 03 00 aa	mov	x25, x0
   41ea4:	fb 03 01 aa	mov	x27, x1
   41ea8:	e0 03 14 aa	mov	x0, x20
   41eac:	2d 4e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   41eb0:	00 00 80 d2	mov	x0, #0x0
   41eb4:	a5 49 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   41eb8:	fc 03 00 91	mov	x28, sp
   41ebc:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   41ec0:	08 21 40 f9	ldr	x8, [x8, #0x40]
   41ec4:	e9 03 08 aa	mov	x9, x8
   41ec8:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41ecc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41ed0:	00 02 3f d6	blr	x16
   41ed4:	e9 03 00 91	mov	x9, sp
   41ed8:	08 3d 00 91	add	x8, x8, #0xf
   41edc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41ee0:	34 01 08 cb	sub	x20, x9, x8
   41ee4:	9f 02 00 91	mov	sp, x20
   41ee8:	e8 03 14 aa	mov	x8, x20
   41eec:	94 49 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   41ef0:	e0 03 19 aa	mov	x0, x25
   41ef4:	e1 03 1b aa	mov	x1, x27
   41ef8:	e2 03 14 aa	mov	x2, x20
   41efc:	8d 49 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   41f00:	f5 03 00 aa	mov	x21, x0
   41f04:	f4 03 01 aa	mov	x20, x1
   41f08:	e0 03 19 aa	mov	x0, x25
   41f0c:	e1 03 1b aa	mov	x1, x27
   41f10:	e2 2d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   41f14:	9f 03 00 91	mov	sp, x28
   41f18:	f4 0e 00 b4	cbz	x20, 0x420f4
   41f1c:	e0 03 17 aa	mov	x0, x23
   41f20:	e1 03 16 aa	mov	x1, x22
   41f24:	d1 36 00 94	bl	0x4fa68
   41f28:	e0 03 18 aa	mov	x0, x24
   41f2c:	65 ff ff 17	b	0x41cc0
   41f30:	f9 03 00 aa	mov	x25, x0
   41f34:	88 1e 00 12	and	w8, w20, #0xff
   41f38:	1f 05 00 71	cmp	w8, #0x1
   41f3c:	a1 07 00 54	b.ne	0x42030
   41f40:	40 03 80 52	mov	w0, #0x1a
   41f44:	01 00 80 d2	mov	x1, #0x0
   41f48:	02 00 80 d2	mov	x2, #0x0
   41f4c:	00 4a 13 94	bl	0x51474c ; symbol stub for: _$ss26_stdlib_isOSVersionAtLeastyBi1_Bw_BwBwtF
   41f50:	40 0e 00 36	tbz	w0, #0x0, 0x42118
   41f54:	00 00 80 d2	mov	x0, #0x0
   41f58:	f5 48 13 94	bl	0x51432c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyVMa
   41f5c:	fc 03 00 aa	mov	x28, x0
   41f60:	e8 03 00 91	mov	x8, sp
   41f64:	68 2a 00 f9	str	x8, [x19, #0x50]
   41f68:	1a 80 5f f8	ldur	x26, [x0, #-0x8]
   41f6c:	48 23 40 f9	ldr	x8, [x26, #0x40]
   41f70:	e9 03 08 aa	mov	x9, x8
   41f74:	10 37 00 f0	adrp	x16, 1763 ; 0x724000
   41f78:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   41f7c:	00 02 3f d6	blr	x16
   41f80:	e9 03 00 91	mov	x9, sp
   41f84:	08 3d 00 91	add	x8, x8, #0xf
   41f88:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   41f8c:	38 01 08 cb	sub	x24, x9, x8
   41f90:	1f 03 00 91	mov	sp, x24
   41f94:	b7 5b 39 a9	stp	x23, x22, [x29, #-0x70]
   41f98:	e0 03 17 aa	mov	x0, x23
   41f9c:	e1 03 16 aa	mov	x1, x22
   41fa0:	8b 2e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   41fa4:	24 32 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   41fa8:	f4 03 00 aa	mov	x20, x0
   41fac:	02 37 00 f0	adrp	x2, 1763 ; 0x724000
   41fb0:	42 18 40 f9	ldr	x2, [x2, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   41fb4:	a0 c3 01 d1	sub	x0, x29, #0x70
   41fb8:	e8 03 18 aa	mov	x8, x24
   41fbc:	01 00 80 d2	mov	x1, #0x0
   41fc0:	e3 03 14 aa	mov	x3, x20
   41fc4:	f5 03 1b aa	mov	x21, x27
   41fc8:	d3 48 13 94	bl	0x514314 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV18dataRepresentation21authenticationContextAGx_So9LAContextCSgtKc10Foundation12DataProtocolRzlufC
   41fcc:	fb 03 15 aa	mov	x27, x21
   41fd0:	f5 1b 00 b4	cbz	x21, 0x4234c
   41fd4:	e0 03 17 aa	mov	x0, x23
   41fd8:	e1 03 16 aa	mov	x1, x22
   41fdc:	a3 36 00 94	bl	0x4fa68
   41fe0:	e0 03 19 aa	mov	x0, x25
   41fe4:	61 32 40 f9	ldr	x1, [x19, #0x60]
   41fe8:	a0 36 00 94	bl	0x4fa68
   41fec:	72 01 00 14	b	0x425b4
   41ff0:	f4 03 00 aa	mov	x20, x0
   41ff4:	20 48 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   41ff8:	f7 03 00 aa	mov	x23, x0
   41ffc:	e0 03 14 aa	mov	x0, x20
   42000:	d8 4d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42004:	f5 03 17 aa	mov	x21, x23
   42008:	bd 4e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   4200c:	e0 03 17 aa	mov	x0, x23
   42010:	88 4e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   42014:	e0 03 16 aa	mov	x0, x22
   42018:	71 4e 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4201c:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   42020:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   42024:	08 81 00 d1	sub	x8, x8, #0x20
   42028:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   4202c:	3b ff ff 17	b	0x41d18
   42030:	88 1e 18 12	and	w8, w20, #0xff00
   42034:	1f 01 04 71	cmp	w8, #0x100
   42038:	61 14 00 54	b.ne	0x422c4
   4203c:	00 00 80 d2	mov	x0, #0x0
   42040:	09 49 13 94	bl	0x514464 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyVMa
   42044:	fa 03 00 aa	mov	x26, x0
   42048:	f8 03 00 91	mov	x24, sp
   4204c:	1c 80 5f f8	ldur	x28, [x0, #-0x8]
   42050:	88 23 40 f9	ldr	x8, [x28, #0x40]
   42054:	e9 03 08 aa	mov	x9, x8
   42058:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   4205c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42060:	00 02 3f d6	blr	x16
   42064:	e9 03 00 91	mov	x9, sp
   42068:	08 3d 00 91	add	x8, x8, #0xf
   4206c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42070:	34 01 08 cb	sub	x20, x9, x8
   42074:	9f 02 00 91	mov	sp, x20
   42078:	b7 5b 39 a9	stp	x23, x22, [x29, #-0x70]
   4207c:	e0 03 17 aa	mov	x0, x23
   42080:	e1 03 16 aa	mov	x1, x22
   42084:	52 2e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   42088:	01 37 00 d0	adrp	x1, 1762 ; 0x724000
   4208c:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   42090:	02 37 00 d0	adrp	x2, 1762 ; 0x724000
   42094:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   42098:	a0 c3 01 d1	sub	x0, x29, #0x70
   4209c:	e8 03 14 aa	mov	x8, x20
   420a0:	f5 03 1b aa	mov	x21, x27
   420a4:	e7 48 13 94	bl	0x514440 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV17rawRepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   420a8:	fb 03 15 aa	mov	x27, x21
   420ac:	95 1a 00 b4	cbz	x21, 0x423fc
   420b0:	e0 03 17 aa	mov	x0, x23
   420b4:	e1 03 16 aa	mov	x1, x22
   420b8:	6c 36 00 94	bl	0x4fa68
   420bc:	e0 03 19 aa	mov	x0, x25
   420c0:	61 32 40 f9	ldr	x1, [x19, #0x60]
   420c4:	69 36 00 94	bl	0x4fa68
   420c8:	1f 03 00 91	mov	sp, x24
   420cc:	0d fe ff 17	b	0x41900
   420d0:	f4 03 00 aa	mov	x20, x0
   420d4:	e8 47 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   420d8:	f9 03 00 aa	mov	x25, x0
   420dc:	e0 03 14 aa	mov	x0, x20
   420e0:	a0 4d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   420e4:	f5 03 19 aa	mov	x21, x25
   420e8:	85 4e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   420ec:	e0 03 19 aa	mov	x0, x25
   420f0:	50 4e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   420f4:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   420f8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   420fc:	08 81 00 d1	sub	x8, x8, #0x20
   42100:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   42104:	e0 03 17 aa	mov	x0, x23
   42108:	e1 03 16 aa	mov	x1, x22
   4210c:	57 36 00 94	bl	0x4fa68
   42110:	e0 03 18 aa	mov	x0, x24
   42114:	00 ff ff 17	b	0x41d14
   42118:	79 2e 00 f9	str	x25, [x19, #0x58]
   4211c:	ba 04 80 d2	mov	x26, #0x25
   42120:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   42124:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   42128:	08 c1 35 91	add	x8, x8, #0xd70 ; literal pool for: "pq_v1 installation requires macOS 26 or newer"
   4212c:	08 81 00 d1	sub	x8, x8, #0x20
   42130:	19 01 41 b2	orr	x25, x8, #0x8000000000000000
   42134:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   42138:	00 c0 12 91	add	x0, x0, #0x4b0
   4213c:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   42140:	21 a0 1c 91	add	x1, x1, #0x728
   42144:	da 88 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   42148:	61 c2 07 91	add	x1, x19, #0x1f0
   4214c:	4e 4e 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   42150:	f4 03 00 aa	mov	x20, x0
   42154:	48 27 00 90	adrp	x8, 1256 ; 0x52a000
   42158:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   4215c:	00 04 80 3d	str	q0, [x0, #0x10]
   42160:	a8 4c 8e d2	mov	x8, #0x7265
   42164:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   42168:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   4216c:	f5 03 00 aa	mov	x21, x0
   42170:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   42174:	1c 37 00 d0	adrp	x28, 1762 ; 0x724000
   42178:	9c 27 41 f9	ldr	x28, [x28, #0x248] ; literal pool symbol address: _$sSSN
   4217c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   42180:	1c 24 00 f9	str	x28, [x0, #0x48]
   42184:	49 03 7d b2	orr	x9, x26, #0x8
   42188:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   4218c:	19 1c 00 f9	str	x25, [x0, #0x38]
   42190:	61 2d 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   42194:	fb 03 00 aa	mov	x27, x0
   42198:	e0 03 14 aa	mov	x0, x20
   4219c:	4f 4e 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   421a0:	e1 37 00 f0	adrp	x1, 1791 ; 0x741000
   421a4:	21 e0 12 91	add	x1, x1, #0x4b8
   421a8:	42 27 00 90	adrp	x2, 1256 ; 0x52a000
   421ac:	42 c0 1c 91	add	x2, x2, #0x730
   421b0:	e0 03 15 aa	mov	x0, x21
   421b4:	17 36 00 94	bl	_$sypSgWOhTm
   421b8:	e8 37 00 f0	adrp	x8, 1791 ; 0x741000
   421bc:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   421c0:	65 4d 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   421c4:	f4 03 00 aa	mov	x20, x0
   421c8:	08 37 00 d0	adrp	x8, 1762 ; 0x724000
   421cc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   421d0:	03 37 00 d0	adrp	x3, 1762 ; 0x724000
   421d4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   421d8:	02 21 00 91	add	x2, x8, #0x8
   421dc:	e0 03 1b aa	mov	x0, x27
   421e0:	e1 03 1c aa	mov	x1, x28
   421e4:	c1 48 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   421e8:	f5 03 00 aa	mov	x21, x0
   421ec:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   421f0:	a4 c3 01 d1	sub	x4, x29, #0x70
   421f4:	e0 03 14 aa	mov	x0, x20
   421f8:	e2 03 15 aa	mov	x2, x21
   421fc:	03 00 80 d2	mov	x3, #0x0
   42200:	a8 54 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   42204:	fd 03 1d aa	mov	x29, x29
   42208:	5c 4d 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   4220c:	f4 03 00 aa	mov	x20, x0
   42210:	e0 03 15 aa	mov	x0, x21
   42214:	53 4d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42218:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   4221c:	54 4d 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   42220:	d4 14 00 b4	cbz	x20, 0x424b8
   42224:	e0 03 14 aa	mov	x0, x20
   42228:	cf 47 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4222c:	fc 03 00 aa	mov	x28, x0
   42230:	f9 03 01 aa	mov	x25, x1
   42234:	e0 03 14 aa	mov	x0, x20
   42238:	4a 4d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   4223c:	00 00 80 d2	mov	x0, #0x0
   42240:	c2 48 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   42244:	f8 03 00 91	mov	x24, sp
   42248:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   4224c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   42250:	e9 03 08 aa	mov	x9, x8
   42254:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42258:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   4225c:	00 02 3f d6	blr	x16
   42260:	e9 03 00 91	mov	x9, sp
   42264:	08 3d 00 91	add	x8, x8, #0xf
   42268:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   4226c:	34 01 08 cb	sub	x20, x9, x8
   42270:	9f 02 00 91	mov	sp, x20
   42274:	e8 03 14 aa	mov	x8, x20
   42278:	b1 48 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   4227c:	e0 03 1c aa	mov	x0, x28
   42280:	e1 03 19 aa	mov	x1, x25
   42284:	e2 03 14 aa	mov	x2, x20
   42288:	aa 48 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   4228c:	f5 03 00 aa	mov	x21, x0
   42290:	f4 03 01 aa	mov	x20, x1
   42294:	e0 03 1c aa	mov	x0, x28
   42298:	e1 03 19 aa	mov	x1, x25
   4229c:	ff 2c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   422a0:	1f 03 00 91	mov	sp, x24
   422a4:	d4 11 00 b4	cbz	x20, 0x424dc
   422a8:	60 86 45 a9	ldp	x0, x1, [x19, #0x58]
   422ac:	ef 35 00 94	bl	0x4fa68
   422b0:	e0 03 17 aa	mov	x0, x23
   422b4:	e1 03 16 aa	mov	x1, x22
   422b8:	ec 35 00 94	bl	0x4fa68
   422bc:	e0 03 1b aa	mov	x0, x27
   422c0:	80 fe ff 17	b	0x41cc0
   422c4:	00 00 80 d2	mov	x0, #0x0
   422c8:	07 48 13 94	bl	0x5142e4 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyVMa
   422cc:	f8 03 00 aa	mov	x24, x0
   422d0:	f4 03 00 91	mov	x20, sp
   422d4:	1a 80 5f f8	ldur	x26, [x0, #-0x8]
   422d8:	48 23 40 f9	ldr	x8, [x26, #0x40]
   422dc:	e9 03 08 aa	mov	x9, x8
   422e0:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   422e4:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   422e8:	00 02 3f d6	blr	x16
   422ec:	e9 03 00 91	mov	x9, sp
   422f0:	08 3d 00 91	add	x8, x8, #0xf
   422f4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   422f8:	3c 01 08 cb	sub	x28, x9, x8
   422fc:	9f 03 00 91	mov	sp, x28
   42300:	e0 03 17 aa	mov	x0, x23
   42304:	e1 03 16 aa	mov	x1, x22
   42308:	b1 2d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   4230c:	e8 03 1c aa	mov	x8, x28
   42310:	e0 03 17 aa	mov	x0, x23
   42314:	e1 03 16 aa	mov	x1, x22
   42318:	02 00 80 d2	mov	x2, #0x0
   4231c:	f5 03 1b aa	mov	x21, x27
   42320:	e8 47 13 94	bl	0x5142c0 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV18dataRepresentation21authenticationContextAI10Foundation4DataV_So9LAContextCSgtKcfC
   42324:	fb 03 15 aa	mov	x27, x21
   42328:	15 0f 00 b4	cbz	x21, 0x42508
   4232c:	e0 03 19 aa	mov	x0, x25
   42330:	61 32 40 f9	ldr	x1, [x19, #0x60]
   42334:	cd 35 00 94	bl	0x4fa68
   42338:	e0 03 17 aa	mov	x0, x23
   4233c:	e1 03 16 aa	mov	x1, x22
   42340:	ca 35 00 94	bl	0x4fa68
   42344:	9f 02 00 91	mov	sp, x20
   42348:	6e fd ff 17	b	0x41900
   4234c:	7c 62 04 a9	stp	x28, x24, [x19, #0x40]
   42350:	77 6a 03 a9	stp	x23, x26, [x19, #0x30]
   42354:	00 00 80 d2	mov	x0, #0x0
   42358:	07 48 13 94	bl	0x514374 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyVMa
   4235c:	fa 03 00 aa	mov	x26, x0
   42360:	f7 03 00 91	mov	x23, sp
   42364:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   42368:	08 23 40 f9	ldr	x8, [x24, #0x40]
   4236c:	e9 03 08 aa	mov	x9, x8
   42370:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42374:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42378:	00 02 3f d6	blr	x16
   4237c:	e9 03 00 91	mov	x9, sp
   42380:	08 3d 00 91	add	x8, x8, #0xf
   42384:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42388:	35 01 08 cb	sub	x21, x9, x8
   4238c:	bf 02 00 91	mov	sp, x21
   42390:	61 32 40 f9	ldr	x1, [x19, #0x60]
   42394:	b9 07 39 a9	stp	x25, x1, [x29, #-0x70]
   42398:	e0 03 19 aa	mov	x0, x25
   4239c:	8c 2d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   423a0:	02 37 00 d0	adrp	x2, 1762 ; 0x724000
   423a4:	42 18 40 f9	ldr	x2, [x2, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   423a8:	a0 c3 01 d1	sub	x0, x29, #0x70
   423ac:	75 16 00 f9	str	x21, [x19, #0x28]
   423b0:	e8 03 15 aa	mov	x8, x21
   423b4:	01 00 80 d2	mov	x1, #0x0
   423b8:	e3 03 14 aa	mov	x3, x20
   423bc:	f5 03 1b aa	mov	x21, x27
   423c0:	ea 47 13 94	bl	0x514368 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV18dataRepresentation21authenticationContextAGx_So9LAContextCSgtKc10Foundation12DataProtocolRzlufC
   423c4:	f5 0f 00 b4	cbz	x21, 0x425c0
   423c8:	fb 03 15 aa	mov	x27, x21
   423cc:	68 86 43 a9	ldp	x8, x1, [x19, #0x38]
   423d0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   423d4:	60 26 40 f9	ldr	x0, [x19, #0x48]
   423d8:	00 01 3f d6	blr	x8
   423dc:	60 1a 40 f9	ldr	x0, [x19, #0x30]
   423e0:	e1 03 16 aa	mov	x1, x22
   423e4:	a1 35 00 94	bl	0x4fa68
   423e8:	e0 03 19 aa	mov	x0, x25
   423ec:	61 32 40 f9	ldr	x1, [x19, #0x60]
   423f0:	9e 35 00 94	bl	0x4fa68
   423f4:	ff 02 00 91	mov	sp, x23
   423f8:	6f 00 00 14	b	0x425b4
   423fc:	78 d2 04 a9	stp	x24, x20, [x19, #0x48]
   42400:	00 00 80 d2	mov	x0, #0x0
   42404:	06 48 13 94	bl	0x51441c ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0VMa
   42408:	f4 03 00 aa	mov	x20, x0
   4240c:	e8 03 00 91	mov	x8, sp
   42410:	68 22 00 f9	str	x8, [x19, #0x40]
   42414:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   42418:	08 23 40 f9	ldr	x8, [x24, #0x40]
   4241c:	e9 03 08 aa	mov	x9, x8
   42420:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42424:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42428:	00 02 3f d6	blr	x16
   4242c:	e9 03 00 91	mov	x9, sp
   42430:	08 3d 00 91	add	x8, x8, #0xf
   42434:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42438:	35 01 08 cb	sub	x21, x9, x8
   4243c:	bf 02 00 91	mov	sp, x21
   42440:	61 32 40 f9	ldr	x1, [x19, #0x60]
   42444:	b9 07 39 a9	stp	x25, x1, [x29, #-0x70]
   42448:	e0 03 19 aa	mov	x0, x25
   4244c:	60 2d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   42450:	01 37 00 d0	adrp	x1, 1762 ; 0x724000
   42454:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   42458:	02 37 00 d0	adrp	x2, 1762 ; 0x724000
   4245c:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   42460:	a0 c3 01 d1	sub	x0, x29, #0x70
   42464:	75 1e 00 f9	str	x21, [x19, #0x38]
   42468:	e8 03 15 aa	mov	x8, x21
   4246c:	f5 03 1b aa	mov	x21, x27
   42470:	e5 47 13 94	bl	0x514404 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V17rawRepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   42474:	d5 22 00 b4	cbz	x21, 0x428cc
   42478:	fb 03 15 aa	mov	x27, x21
   4247c:	88 07 40 f9	ldr	x8, [x28, #0x8]
   42480:	60 2a 40 f9	ldr	x0, [x19, #0x50]
   42484:	e1 03 1a aa	mov	x1, x26
   42488:	00 01 3f d6	blr	x8
   4248c:	e0 03 17 aa	mov	x0, x23
   42490:	e1 03 16 aa	mov	x1, x22
   42494:	75 35 00 94	bl	0x4fa68
   42498:	e0 03 19 aa	mov	x0, x25
   4249c:	61 32 40 f9	ldr	x1, [x19, #0x60]
   424a0:	72 35 00 94	bl	0x4fa68
   424a4:	68 22 40 f9	ldr	x8, [x19, #0x40]
   424a8:	1f 01 00 91	mov	sp, x8
   424ac:	68 26 40 f9	ldr	x8, [x19, #0x48]
   424b0:	1f 01 00 91	mov	sp, x8
   424b4:	13 fd ff 17	b	0x41900
   424b8:	f4 03 00 aa	mov	x20, x0
   424bc:	ee 46 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   424c0:	f9 03 00 aa	mov	x25, x0
   424c4:	e0 03 14 aa	mov	x0, x20
   424c8:	a6 4c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   424cc:	f5 03 19 aa	mov	x21, x25
   424d0:	8b 4d 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   424d4:	e0 03 19 aa	mov	x0, x25
   424d8:	56 4d 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   424dc:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   424e0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   424e4:	08 81 00 d1	sub	x8, x8, #0x20
   424e8:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   424ec:	60 86 45 a9	ldp	x0, x1, [x19, #0x58]
   424f0:	5e 35 00 94	bl	0x4fa68
   424f4:	e0 03 17 aa	mov	x0, x23
   424f8:	e1 03 16 aa	mov	x1, x22
   424fc:	5b 35 00 94	bl	0x4fa68
   42500:	e0 03 1b aa	mov	x0, x27
   42504:	04 fe ff 17	b	0x41d14
   42508:	74 2a 00 f9	str	x20, [x19, #0x50]
   4250c:	78 22 00 f9	str	x24, [x19, #0x40]
   42510:	00 00 80 d2	mov	x0, #0x0
   42514:	62 47 13 94	bl	0x51429c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0VMa
   42518:	e8 03 00 91	mov	x8, sp
   4251c:	68 26 00 f9	str	x8, [x19, #0x48]
   42520:	60 1a 00 f9	str	x0, [x19, #0x30]
   42524:	14 80 5f f8	ldur	x20, [x0, #-0x8]
   42528:	88 22 40 f9	ldr	x8, [x20, #0x40]
   4252c:	e9 03 08 aa	mov	x9, x8
   42530:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42534:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42538:	00 02 3f d6	blr	x16
   4253c:	e9 03 00 91	mov	x9, sp
   42540:	08 3d 00 91	add	x8, x8, #0xf
   42544:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42548:	38 01 08 cb	sub	x24, x9, x8
   4254c:	1f 03 00 91	mov	sp, x24
   42550:	e0 03 19 aa	mov	x0, x25
   42554:	75 32 40 f9	ldr	x21, [x19, #0x60]
   42558:	e1 03 15 aa	mov	x1, x21
   4255c:	1c 2d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   42560:	78 1e 00 f9	str	x24, [x19, #0x38]
   42564:	e8 03 18 aa	mov	x8, x24
   42568:	e0 03 19 aa	mov	x0, x25
   4256c:	e1 03 15 aa	mov	x1, x21
   42570:	02 00 80 d2	mov	x2, #0x0
   42574:	f5 03 1b aa	mov	x21, x27
   42578:	43 47 13 94	bl	0x514284 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V18dataRepresentation21authenticationContextAI10Foundation4DataV_So9LAContextCSgtKcfC
   4257c:	f5 33 00 b4	cbz	x21, 0x42bf8
   42580:	fb 03 15 aa	mov	x27, x21
   42584:	48 07 40 f9	ldr	x8, [x26, #0x8]
   42588:	e0 03 1c aa	mov	x0, x28
   4258c:	61 22 40 f9	ldr	x1, [x19, #0x40]
   42590:	00 01 3f d6	blr	x8
   42594:	e0 03 17 aa	mov	x0, x23
   42598:	e1 03 16 aa	mov	x1, x22
   4259c:	33 35 00 94	bl	0x4fa68
   425a0:	e0 03 19 aa	mov	x0, x25
   425a4:	61 32 40 f9	ldr	x1, [x19, #0x60]
   425a8:	30 35 00 94	bl	0x4fa68
   425ac:	68 26 40 f9	ldr	x8, [x19, #0x48]
   425b0:	1f 01 00 91	mov	sp, x8
   425b4:	68 2a 40 f9	ldr	x8, [x19, #0x50]
   425b8:	1f 01 00 91	mov	sp, x8
   425bc:	d1 fc ff 17	b	0x41900
   425c0:	7a de 01 a9	stp	x26, x23, [x19, #0x18]
   425c4:	78 0a 00 f9	str	x24, [x19, #0x10]
   425c8:	79 2e 00 f9	str	x25, [x19, #0x58]
   425cc:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   425d0:	00 c0 12 91	add	x0, x0, #0x4b0
   425d4:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   425d8:	21 a0 1c 91	add	x1, x1, #0x728
   425dc:	b4 87 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   425e0:	61 02 05 91	add	x1, x19, #0x140
   425e4:	28 4d 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   425e8:	fa 03 00 aa	mov	x26, x0
   425ec:	48 27 00 90	adrp	x8, 1256 ; 0x52a000
   425f0:	00 ad c1 3d	ldr	q0, [x8, #0x6b0]
   425f4:	00 04 80 3d	str	q0, [x0, #0x10]
   425f8:	68 6e 8c d2	mov	x8, #0x6373
   425fc:	08 ad ac f2	movk	x8, #0x6568, lsl #16
   42600:	a8 ad cc f2	movk	x8, #0x656d, lsl #32
   42604:	e9 03 00 aa	mov	x9, x0
   42608:	28 0d 02 f8	str	x8, [x9, #0x20]!
   4260c:	69 06 00 f9	str	x9, [x19, #0x8]
   42610:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   42614:	18 37 00 d0	adrp	x24, 1762 ; 0x724000
   42618:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   4261c:	09 2e 8e d2	mov	x9, #0x7170
   42620:	e9 cb ae f2	movk	x9, #0x765f, lsl #16
   42624:	29 06 c0 f2	movk	x9, #0x31, lsl #32
   42628:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   4262c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   42630:	08 1c 00 f9	str	x8, [x0, #0x38]
   42634:	68 2e 8d 52	mov	w8, #0x6973
   42638:	e8 0c a0 72	movk	w8, #0x67, lsl #16
   4263c:	18 a0 04 a9	stp	x24, x8, [x0, #0x48]
   42640:	17 60 fc d2	mov	x23, #-0x1d00000000000000
   42644:	17 2c 00 f9	str	x23, [x0, #0x58]
   42648:	00 00 80 d2	mov	x0, #0x0
   4264c:	9b 47 13 94	bl	0x5144b8 ; symbol stub for: _$s9CryptoKit7MLDSA65O9PublicKeyVMa
   42650:	fb 03 00 aa	mov	x27, x0
   42654:	e8 03 00 91	mov	x8, sp
   42658:	68 02 00 f9	str	x8, [x19]
   4265c:	19 80 5f f8	ldur	x25, [x0, #-0x8]
   42660:	28 23 40 f9	ldr	x8, [x25, #0x40]
   42664:	e9 03 08 aa	mov	x9, x8
   42668:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   4266c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42670:	00 02 3f d6	blr	x16
   42674:	e9 03 00 91	mov	x9, sp
   42678:	08 3d 00 91	add	x8, x8, #0xf
   4267c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42680:	35 01 08 cb	sub	x21, x9, x8
   42684:	bf 02 00 91	mov	sp, x21
   42688:	e8 03 15 aa	mov	x8, x21
   4268c:	74 26 40 f9	ldr	x20, [x19, #0x48]
   42690:	18 47 13 94	bl	0x5142f0 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV06publicG0AaDO06PublicG0Vvg
   42694:	f4 03 15 aa	mov	x20, x21
   42698:	85 47 13 94	bl	0x5144ac ; symbol stub for: _$s9CryptoKit7MLDSA65O9PublicKeyV17rawRepresentation10Foundation4DataVvg
   4269c:	f4 03 00 aa	mov	x20, x0
   426a0:	fc 03 01 aa	mov	x28, x1
   426a4:	28 07 40 f9	ldr	x8, [x25, #0x8]
   426a8:	e0 03 15 aa	mov	x0, x21
   426ac:	e1 03 1b aa	mov	x1, x27
   426b0:	00 01 3f d6	blr	x8
   426b4:	00 00 80 d2	mov	x0, #0x0
   426b8:	e1 03 14 aa	mov	x1, x20
   426bc:	e2 03 1c aa	mov	x2, x28
   426c0:	a6 46 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   426c4:	f5 03 00 aa	mov	x21, x0
   426c8:	fb 03 01 aa	mov	x27, x1
   426cc:	e0 03 14 aa	mov	x0, x20
   426d0:	e1 03 1c aa	mov	x1, x28
   426d4:	f1 2b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   426d8:	68 02 40 f9	ldr	x8, [x19]
   426dc:	1f 01 00 91	mov	sp, x8
   426e0:	55 6f 06 a9	stp	x21, x27, [x26, #0x60]
   426e4:	68 ad 8c 52	mov	w8, #0x656b
   426e8:	a8 0d a0 72	movk	w8, #0x6d, lsl #16
   426ec:	58 a3 07 a9	stp	x24, x8, [x26, #0x78]
   426f0:	57 47 00 f9	str	x23, [x26, #0x88]
   426f4:	00 00 80 d2	mov	x0, #0x0
   426f8:	79 47 13 94	bl	0x5144dc ; symbol stub for: _$s9CryptoKit8MLKEM768O9PublicKeyVMa
   426fc:	f5 03 00 aa	mov	x21, x0
   42700:	f7 03 00 91	mov	x23, sp
   42704:	19 80 5f f8	ldur	x25, [x0, #-0x8]
   42708:	28 23 40 f9	ldr	x8, [x25, #0x40]
   4270c:	e9 03 08 aa	mov	x9, x8
   42710:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42714:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42718:	00 02 3f d6	blr	x16
   4271c:	e9 03 00 91	mov	x9, sp
   42720:	08 3d 00 91	add	x8, x8, #0xf
   42724:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42728:	3b 01 08 cb	sub	x27, x9, x8
   4272c:	7f 03 00 91	mov	sp, x27
   42730:	e8 03 1b aa	mov	x8, x27
   42734:	74 16 40 f9	ldr	x20, [x19, #0x28]
   42738:	00 47 13 94	bl	0x514338 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV06publicG0AaDO06PublicG0Vvg
   4273c:	f4 03 1b aa	mov	x20, x27
   42740:	64 47 13 94	bl	0x5144d0 ; symbol stub for: _$s9CryptoKit8MLKEM768O9PublicKeyV17rawRepresentation10Foundation4DataVvg
   42744:	f4 03 00 aa	mov	x20, x0
   42748:	fc 03 01 aa	mov	x28, x1
   4274c:	28 07 40 f9	ldr	x8, [x25, #0x8]
   42750:	e0 03 1b aa	mov	x0, x27
   42754:	e1 03 15 aa	mov	x1, x21
   42758:	00 01 3f d6	blr	x8
   4275c:	00 00 80 d2	mov	x0, #0x0
   42760:	e1 03 14 aa	mov	x1, x20
   42764:	e2 03 1c aa	mov	x2, x28
   42768:	7c 46 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   4276c:	f5 03 00 aa	mov	x21, x0
   42770:	fb 03 01 aa	mov	x27, x1
   42774:	e0 03 14 aa	mov	x0, x20
   42778:	e1 03 1c aa	mov	x1, x28
   4277c:	c7 2b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42780:	ff 02 00 91	mov	sp, x23
   42784:	58 57 00 f9	str	x24, [x26, #0xa8]
   42788:	55 6f 09 a9	stp	x21, x27, [x26, #0x90]
   4278c:	e0 03 1a aa	mov	x0, x26
   42790:	e1 2b 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   42794:	fb 03 00 aa	mov	x27, x0
   42798:	e0 03 1a aa	mov	x0, x26
   4279c:	cf 4c 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   427a0:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   427a4:	00 e0 12 91	add	x0, x0, #0x4b8
   427a8:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   427ac:	21 c0 1c 91	add	x1, x1, #0x730
   427b0:	3f 87 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   427b4:	e2 03 00 aa	mov	x2, x0
   427b8:	60 06 40 f9	ldr	x0, [x19, #0x8]
   427bc:	61 00 80 52	mov	w1, #0x3
   427c0:	7e 4c 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   427c4:	e8 37 00 f0	adrp	x8, 1791 ; 0x741000
   427c8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   427cc:	e2 4b 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   427d0:	f4 03 00 aa	mov	x20, x0
   427d4:	08 37 00 d0	adrp	x8, 1762 ; 0x724000
   427d8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   427dc:	03 37 00 d0	adrp	x3, 1762 ; 0x724000
   427e0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   427e4:	02 21 00 91	add	x2, x8, #0x8
   427e8:	e0 03 1b aa	mov	x0, x27
   427ec:	e1 03 18 aa	mov	x1, x24
   427f0:	3e 47 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   427f4:	f5 03 00 aa	mov	x21, x0
   427f8:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   427fc:	a4 c3 01 d1	sub	x4, x29, #0x70
   42800:	e0 03 14 aa	mov	x0, x20
   42804:	e2 03 15 aa	mov	x2, x21
   42808:	03 00 80 d2	mov	x3, #0x0
   4280c:	25 53 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   42810:	fd 03 1d aa	mov	x29, x29
   42814:	d9 4b 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   42818:	f4 03 00 aa	mov	x20, x0
   4281c:	e0 03 15 aa	mov	x0, x21
   42820:	d0 4b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42824:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   42828:	d1 4b 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   4282c:	77 1a 40 f9	ldr	x23, [x19, #0x30]
   42830:	54 37 00 b4	cbz	x20, 0x42f18
   42834:	e0 03 14 aa	mov	x0, x20
   42838:	4b 46 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   4283c:	f5 03 00 aa	mov	x21, x0
   42840:	fc 03 01 aa	mov	x28, x1
   42844:	e0 03 14 aa	mov	x0, x20
   42848:	c6 4b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   4284c:	00 00 80 d2	mov	x0, #0x0
   42850:	3e 47 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   42854:	f9 03 00 91	mov	x25, sp
   42858:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   4285c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   42860:	e9 03 08 aa	mov	x9, x8
   42864:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42868:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   4286c:	00 02 3f d6	blr	x16
   42870:	e9 03 00 91	mov	x9, sp
   42874:	08 3d 00 91	add	x8, x8, #0xf
   42878:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   4287c:	34 01 08 cb	sub	x20, x9, x8
   42880:	9f 02 00 91	mov	sp, x20
   42884:	e8 03 14 aa	mov	x8, x20
   42888:	2d 47 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   4288c:	e0 03 15 aa	mov	x0, x21
   42890:	e1 03 1c aa	mov	x1, x28
   42894:	e2 03 14 aa	mov	x2, x20
   42898:	26 47 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   4289c:	fa 03 00 aa	mov	x26, x0
   428a0:	f4 03 01 aa	mov	x20, x1
   428a4:	e0 03 15 aa	mov	x0, x21
   428a8:	e1 03 1c aa	mov	x1, x28
   428ac:	7b 2b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   428b0:	3f 03 00 91	mov	sp, x25
   428b4:	79 1e 40 f9	ldr	x25, [x19, #0x38]
   428b8:	7c 0a 40 f9	ldr	x28, [x19, #0x10]
   428bc:	54 34 00 b4	cbz	x20, 0x42f44
   428c0:	e0 03 1b aa	mov	x0, x27
   428c4:	46 4c 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   428c8:	a7 01 00 14	b	0x42f64
   428cc:	78 d2 01 a9	stp	x24, x20, [x19, #0x18]
   428d0:	7c ea 02 a9	stp	x28, x26, [x19, #0x28]
   428d4:	79 2e 00 f9	str	x25, [x19, #0x58]
   428d8:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   428dc:	00 c0 12 91	add	x0, x0, #0x4b0
   428e0:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   428e4:	21 a0 1c 91	add	x1, x1, #0x728
   428e8:	f1 86 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   428ec:	01 16 80 52	mov	w1, #0xb0
   428f0:	e2 00 80 52	mov	w2, #0x7
   428f4:	2e 4c 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   428f8:	fa 03 00 aa	mov	x26, x0
   428fc:	48 27 00 90	adrp	x8, 1256 ; 0x52a000
   42900:	00 ad c1 3d	ldr	q0, [x8, #0x6b0]
   42904:	00 04 80 3d	str	q0, [x0, #0x10]
   42908:	68 6e 8c d2	mov	x8, #0x6373
   4290c:	08 ad ac f2	movk	x8, #0x6568, lsl #16
   42910:	a8 ad cc f2	movk	x8, #0x656d, lsl #32
   42914:	e9 03 00 aa	mov	x9, x0
   42918:	28 0d 02 f8	str	x8, [x9, #0x20]!
   4291c:	69 0a 00 f9	str	x9, [x19, #0x10]
   42920:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   42924:	18 37 00 d0	adrp	x24, 1762 ; 0x724000
   42928:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   4292c:	09 4e 86 d2	mov	x9, #0x3270
   42930:	a9 c6 a6 f2	movk	x9, #0x3635, lsl #16
   42934:	e9 cb ce f2	movk	x9, #0x765f, lsl #32
   42938:	29 06 e0 f2	movk	x9, #0x31, lsl #48
   4293c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   42940:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   42944:	08 1c 00 f9	str	x8, [x0, #0x38]
   42948:	68 2e 8d 52	mov	w8, #0x6973
   4294c:	e8 0c a0 72	movk	w8, #0x67, lsl #16
   42950:	18 a0 04 a9	stp	x24, x8, [x0, #0x48]
   42954:	08 60 fc d2	mov	x8, #-0x1d00000000000000
   42958:	08 2c 00 f9	str	x8, [x0, #0x58]
   4295c:	00 00 80 d2	mov	x0, #0x0
   42960:	cd 46 13 94	bl	0x514494 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyVMa
   42964:	fb 03 00 aa	mov	x27, x0
   42968:	e8 03 00 91	mov	x8, sp
   4296c:	68 06 00 f9	str	x8, [x19, #0x8]
   42970:	19 80 5f f8	ldur	x25, [x0, #-0x8]
   42974:	28 23 40 f9	ldr	x8, [x25, #0x40]
   42978:	e9 03 08 aa	mov	x9, x8
   4297c:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42980:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42984:	00 02 3f d6	blr	x16
   42988:	e9 03 00 91	mov	x9, sp
   4298c:	08 3d 00 91	add	x8, x8, #0xf
   42990:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42994:	35 01 08 cb	sub	x21, x9, x8
   42998:	bf 02 00 91	mov	sp, x21
   4299c:	e8 03 15 aa	mov	x8, x21
   429a0:	74 2a 40 f9	ldr	x20, [x19, #0x50]
   429a4:	a1 46 13 94	bl	0x514428 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV06publicF0AE06PublicF0Vvg
   429a8:	f4 03 15 aa	mov	x20, x21
   429ac:	b7 46 13 94	bl	0x514488 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyV18x963Representation10Foundation4DataVvg
   429b0:	f4 03 00 aa	mov	x20, x0
   429b4:	fc 03 01 aa	mov	x28, x1
   429b8:	28 07 40 f9	ldr	x8, [x25, #0x8]
   429bc:	e0 03 15 aa	mov	x0, x21
   429c0:	e1 03 1b aa	mov	x1, x27
   429c4:	00 01 3f d6	blr	x8
   429c8:	00 00 80 d2	mov	x0, #0x0
   429cc:	e1 03 14 aa	mov	x1, x20
   429d0:	e2 03 1c aa	mov	x2, x28
   429d4:	e1 45 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   429d8:	f5 03 00 aa	mov	x21, x0
   429dc:	fb 03 01 aa	mov	x27, x1
   429e0:	e0 03 14 aa	mov	x0, x20
   429e4:	e1 03 1c aa	mov	x1, x28
   429e8:	2c 2b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   429ec:	68 06 40 f9	ldr	x8, [x19, #0x8]
   429f0:	1f 01 00 91	mov	sp, x8
   429f4:	55 6f 06 a9	stp	x21, x27, [x26, #0x60]
   429f8:	68 ad 8c 52	mov	w8, #0x656b
   429fc:	a8 0d a0 72	movk	w8, #0x6d, lsl #16
   42a00:	58 a3 07 a9	stp	x24, x8, [x26, #0x78]
   42a04:	08 60 fc d2	mov	x8, #-0x1d00000000000000
   42a08:	48 47 00 f9	str	x8, [x26, #0x88]
   42a0c:	00 00 80 d2	mov	x0, #0x0
   42a10:	71 46 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   42a14:	f5 03 00 aa	mov	x21, x0
   42a18:	e8 03 00 91	mov	x8, sp
   42a1c:	68 06 00 f9	str	x8, [x19, #0x8]
   42a20:	19 80 5f f8	ldur	x25, [x0, #-0x8]
   42a24:	28 23 40 f9	ldr	x8, [x25, #0x40]
   42a28:	e9 03 08 aa	mov	x9, x8
   42a2c:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42a30:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42a34:	00 02 3f d6	blr	x16
   42a38:	e9 03 00 91	mov	x9, sp
   42a3c:	08 3d 00 91	add	x8, x8, #0xf
   42a40:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42a44:	3b 01 08 cb	sub	x27, x9, x8
   42a48:	7f 03 00 91	mov	sp, x27
   42a4c:	e8 03 1b aa	mov	x8, x27
   42a50:	74 1e 40 f9	ldr	x20, [x19, #0x38]
   42a54:	66 46 13 94	bl	0x5143ec ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V06publicD0AE06PublicD0Vvg
   42a58:	f4 03 1b aa	mov	x20, x27
   42a5c:	58 46 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   42a60:	f4 03 00 aa	mov	x20, x0
   42a64:	fc 03 01 aa	mov	x28, x1
   42a68:	28 07 40 f9	ldr	x8, [x25, #0x8]
   42a6c:	e0 03 1b aa	mov	x0, x27
   42a70:	e1 03 15 aa	mov	x1, x21
   42a74:	00 01 3f d6	blr	x8
   42a78:	00 00 80 d2	mov	x0, #0x0
   42a7c:	e1 03 14 aa	mov	x1, x20
   42a80:	e2 03 1c aa	mov	x2, x28
   42a84:	b5 45 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   42a88:	f5 03 00 aa	mov	x21, x0
   42a8c:	fb 03 01 aa	mov	x27, x1
   42a90:	e0 03 14 aa	mov	x0, x20
   42a94:	e1 03 1c aa	mov	x1, x28
   42a98:	00 2b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42a9c:	68 06 40 f9	ldr	x8, [x19, #0x8]
   42aa0:	1f 01 00 91	mov	sp, x8
   42aa4:	58 57 00 f9	str	x24, [x26, #0xa8]
   42aa8:	55 6f 09 a9	stp	x21, x27, [x26, #0x90]
   42aac:	e0 03 1a aa	mov	x0, x26
   42ab0:	19 2b 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   42ab4:	fb 03 00 aa	mov	x27, x0
   42ab8:	e0 03 1a aa	mov	x0, x26
   42abc:	07 4c 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   42ac0:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   42ac4:	00 e0 12 91	add	x0, x0, #0x4b8
   42ac8:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   42acc:	21 c0 1c 91	add	x1, x1, #0x730
   42ad0:	77 86 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   42ad4:	e2 03 00 aa	mov	x2, x0
   42ad8:	60 0a 40 f9	ldr	x0, [x19, #0x10]
   42adc:	61 00 80 52	mov	w1, #0x3
   42ae0:	b6 4b 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   42ae4:	e0 03 1a aa	mov	x0, x26
   42ae8:	01 04 80 52	mov	w1, #0x20
   42aec:	e2 00 80 52	mov	w2, #0x7
   42af0:	c7 4b 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   42af4:	e8 37 00 f0	adrp	x8, 1791 ; 0x741000
   42af8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   42afc:	16 4b 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   42b00:	f4 03 00 aa	mov	x20, x0
   42b04:	08 37 00 d0	adrp	x8, 1762 ; 0x724000
   42b08:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   42b0c:	03 37 00 d0	adrp	x3, 1762 ; 0x724000
   42b10:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   42b14:	02 21 00 91	add	x2, x8, #0x8
   42b18:	e0 03 1b aa	mov	x0, x27
   42b1c:	e1 03 18 aa	mov	x1, x24
   42b20:	72 46 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   42b24:	f5 03 00 aa	mov	x21, x0
   42b28:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   42b2c:	a4 c3 01 d1	sub	x4, x29, #0x70
   42b30:	e0 03 14 aa	mov	x0, x20
   42b34:	e2 03 15 aa	mov	x2, x21
   42b38:	03 00 80 d2	mov	x3, #0x0
   42b3c:	59 52 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   42b40:	fd 03 1d aa	mov	x29, x29
   42b44:	0d 4b 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   42b48:	f4 03 00 aa	mov	x20, x0
   42b4c:	e0 03 15 aa	mov	x0, x21
   42b50:	04 4b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42b54:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   42b58:	05 4b 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   42b5c:	74 22 00 b4	cbz	x20, 0x42fa8
   42b60:	e0 03 14 aa	mov	x0, x20
   42b64:	80 45 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   42b68:	f5 03 00 aa	mov	x21, x0
   42b6c:	fc 03 01 aa	mov	x28, x1
   42b70:	e0 03 14 aa	mov	x0, x20
   42b74:	fb 4a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42b78:	00 00 80 d2	mov	x0, #0x0
   42b7c:	73 46 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   42b80:	f9 03 00 91	mov	x25, sp
   42b84:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   42b88:	08 21 40 f9	ldr	x8, [x8, #0x40]
   42b8c:	e9 03 08 aa	mov	x9, x8
   42b90:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42b94:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42b98:	00 02 3f d6	blr	x16
   42b9c:	e9 03 00 91	mov	x9, sp
   42ba0:	08 3d 00 91	add	x8, x8, #0xf
   42ba4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42ba8:	34 01 08 cb	sub	x20, x9, x8
   42bac:	9f 02 00 91	mov	sp, x20
   42bb0:	e8 03 14 aa	mov	x8, x20
   42bb4:	62 46 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   42bb8:	e0 03 15 aa	mov	x0, x21
   42bbc:	e1 03 1c aa	mov	x1, x28
   42bc0:	e2 03 14 aa	mov	x2, x20
   42bc4:	5b 46 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   42bc8:	fa 03 00 aa	mov	x26, x0
   42bcc:	f4 03 01 aa	mov	x20, x1
   42bd0:	e0 03 15 aa	mov	x0, x21
   42bd4:	e1 03 1c aa	mov	x1, x28
   42bd8:	b0 2a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42bdc:	3f 03 00 91	mov	sp, x25
   42be0:	7c 0e 40 f9	ldr	x28, [x19, #0x18]
   42be4:	78 22 40 f9	ldr	x24, [x19, #0x40]
   42be8:	74 1f 00 b4	cbz	x20, 0x42fd4
   42bec:	e0 03 1b aa	mov	x0, x27
   42bf0:	7b 4b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   42bf4:	00 01 00 14	b	0x42ff4
   42bf8:	74 0e 00 f9	str	x20, [x19, #0x18]
   42bfc:	7a 16 00 f9	str	x26, [x19, #0x28]
   42c00:	79 2e 00 f9	str	x25, [x19, #0x58]
   42c04:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   42c08:	00 c0 12 91	add	x0, x0, #0x4b0
   42c0c:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   42c10:	21 a0 1c 91	add	x1, x1, #0x728
   42c14:	26 86 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   42c18:	61 42 02 91	add	x1, x19, #0x90
   42c1c:	9a 4b 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   42c20:	fa 03 00 aa	mov	x26, x0
   42c24:	48 27 00 90	adrp	x8, 1256 ; 0x52a000
   42c28:	00 ad c1 3d	ldr	q0, [x8, #0x6b0]
   42c2c:	00 04 80 3d	str	q0, [x0, #0x10]
   42c30:	68 6e 8c d2	mov	x8, #0x6373
   42c34:	08 ad ac f2	movk	x8, #0x6568, lsl #16
   42c38:	a8 ad cc f2	movk	x8, #0x656d, lsl #32
   42c3c:	e9 03 00 aa	mov	x9, x0
   42c40:	28 0d 02 f8	str	x8, [x9, #0x20]!
   42c44:	69 0a 00 f9	str	x9, [x19, #0x10]
   42c48:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   42c4c:	0a 37 00 d0	adrp	x10, 1762 ; 0x724000
   42c50:	4a 25 41 f9	ldr	x10, [x10, #0x248] ; literal pool symbol address: _$sSSN
   42c54:	09 4e 86 d2	mov	x9, #0x3270
   42c58:	a9 c6 a6 f2	movk	x9, #0x3635, lsl #16
   42c5c:	e9 cb ce f2	movk	x9, #0x765f, lsl #32
   42c60:	29 06 e0 f2	movk	x9, #0x31, lsl #48
   42c64:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   42c68:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   42c6c:	08 1c 00 f9	str	x8, [x0, #0x38]
   42c70:	68 2e 8d 52	mov	w8, #0x6973
   42c74:	e8 0c a0 72	movk	w8, #0x67, lsl #16
   42c78:	0a a0 04 a9	stp	x10, x8, [x0, #0x48]
   42c7c:	19 60 fc d2	mov	x25, #-0x1d00000000000000
   42c80:	19 2c 00 f9	str	x25, [x0, #0x58]
   42c84:	00 00 80 d2	mov	x0, #0x0
   42c88:	03 46 13 94	bl	0x514494 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyVMa
   42c8c:	f8 03 00 aa	mov	x24, x0
   42c90:	e8 03 00 91	mov	x8, sp
   42c94:	68 06 00 f9	str	x8, [x19, #0x8]
   42c98:	f4 03 1c aa	mov	x20, x28
   42c9c:	1c 80 5f f8	ldur	x28, [x0, #-0x8]
   42ca0:	88 23 40 f9	ldr	x8, [x28, #0x40]
   42ca4:	e9 03 08 aa	mov	x9, x8
   42ca8:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42cac:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42cb0:	00 02 3f d6	blr	x16
   42cb4:	e9 03 00 91	mov	x9, sp
   42cb8:	08 3d 00 91	add	x8, x8, #0xf
   42cbc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42cc0:	35 01 08 cb	sub	x21, x9, x8
   42cc4:	bf 02 00 91	mov	sp, x21
   42cc8:	e8 03 15 aa	mov	x8, x21
   42ccc:	74 12 00 f9	str	x20, [x19, #0x20]
   42cd0:	76 45 13 94	bl	0x5142a8 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV06publicH0AaDOAFO06PublicH0Vvg
   42cd4:	f4 03 15 aa	mov	x20, x21
   42cd8:	ec 45 13 94	bl	0x514488 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyV18x963Representation10Foundation4DataVvg
   42cdc:	f4 03 00 aa	mov	x20, x0
   42ce0:	fb 03 01 aa	mov	x27, x1
   42ce4:	88 07 40 f9	ldr	x8, [x28, #0x8]
   42ce8:	e0 03 15 aa	mov	x0, x21
   42cec:	e1 03 18 aa	mov	x1, x24
   42cf0:	00 01 3f d6	blr	x8
   42cf4:	00 00 80 d2	mov	x0, #0x0
   42cf8:	e1 03 14 aa	mov	x1, x20
   42cfc:	e2 03 1b aa	mov	x2, x27
   42d00:	16 45 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   42d04:	f5 03 00 aa	mov	x21, x0
   42d08:	fc 03 01 aa	mov	x28, x1
   42d0c:	e0 03 14 aa	mov	x0, x20
   42d10:	e1 03 1b aa	mov	x1, x27
   42d14:	61 2a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42d18:	68 06 40 f9	ldr	x8, [x19, #0x8]
   42d1c:	1f 01 00 91	mov	sp, x8
   42d20:	55 73 06 a9	stp	x21, x28, [x26, #0x60]
   42d24:	68 ad 8c 52	mov	w8, #0x656b
   42d28:	a8 0d a0 72	movk	w8, #0x6d, lsl #16
   42d2c:	18 37 00 d0	adrp	x24, 1762 ; 0x724000
   42d30:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   42d34:	58 a3 07 a9	stp	x24, x8, [x26, #0x78]
   42d38:	59 47 00 f9	str	x25, [x26, #0x88]
   42d3c:	00 00 80 d2	mov	x0, #0x0
   42d40:	a5 45 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   42d44:	f5 03 00 aa	mov	x21, x0
   42d48:	e8 03 00 91	mov	x8, sp
   42d4c:	68 06 00 f9	str	x8, [x19, #0x8]
   42d50:	19 80 5f f8	ldur	x25, [x0, #-0x8]
   42d54:	28 23 40 f9	ldr	x8, [x25, #0x40]
   42d58:	e9 03 08 aa	mov	x9, x8
   42d5c:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42d60:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42d64:	00 02 3f d6	blr	x16
   42d68:	e9 03 00 91	mov	x9, sp
   42d6c:	08 3d 00 91	add	x8, x8, #0xf
   42d70:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42d74:	3b 01 08 cb	sub	x27, x9, x8
   42d78:	7f 03 00 91	mov	sp, x27
   42d7c:	e8 03 1b aa	mov	x8, x27
   42d80:	74 1e 40 f9	ldr	x20, [x19, #0x38]
   42d84:	3a 45 13 94	bl	0x51426c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V06publicF0AaDOAFO06PublicF0Vvg
   42d88:	f4 03 1b aa	mov	x20, x27
   42d8c:	8c 45 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   42d90:	f4 03 00 aa	mov	x20, x0
   42d94:	fc 03 01 aa	mov	x28, x1
   42d98:	28 07 40 f9	ldr	x8, [x25, #0x8]
   42d9c:	e0 03 1b aa	mov	x0, x27
   42da0:	e1 03 15 aa	mov	x1, x21
   42da4:	00 01 3f d6	blr	x8
   42da8:	00 00 80 d2	mov	x0, #0x0
   42dac:	e1 03 14 aa	mov	x1, x20
   42db0:	e2 03 1c aa	mov	x2, x28
   42db4:	e9 44 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   42db8:	f5 03 00 aa	mov	x21, x0
   42dbc:	fb 03 01 aa	mov	x27, x1
   42dc0:	e0 03 14 aa	mov	x0, x20
   42dc4:	e1 03 1c aa	mov	x1, x28
   42dc8:	34 2a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42dcc:	68 06 40 f9	ldr	x8, [x19, #0x8]
   42dd0:	1f 01 00 91	mov	sp, x8
   42dd4:	58 57 00 f9	str	x24, [x26, #0xa8]
   42dd8:	55 6f 09 a9	stp	x21, x27, [x26, #0x90]
   42ddc:	e0 03 1a aa	mov	x0, x26
   42de0:	4d 2a 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   42de4:	fb 03 00 aa	mov	x27, x0
   42de8:	e0 03 1a aa	mov	x0, x26
   42dec:	3b 4b 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   42df0:	e0 37 00 f0	adrp	x0, 1791 ; 0x741000
   42df4:	00 e0 12 91	add	x0, x0, #0x4b8
   42df8:	41 27 00 90	adrp	x1, 1256 ; 0x52a000
   42dfc:	21 c0 1c 91	add	x1, x1, #0x730
   42e00:	ab 85 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   42e04:	e2 03 00 aa	mov	x2, x0
   42e08:	60 0a 40 f9	ldr	x0, [x19, #0x10]
   42e0c:	61 00 80 52	mov	w1, #0x3
   42e10:	ea 4a 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   42e14:	e8 37 00 f0	adrp	x8, 1791 ; 0x741000
   42e18:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   42e1c:	4e 4a 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   42e20:	f4 03 00 aa	mov	x20, x0
   42e24:	08 37 00 d0	adrp	x8, 1762 ; 0x724000
   42e28:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   42e2c:	03 37 00 d0	adrp	x3, 1762 ; 0x724000
   42e30:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   42e34:	02 21 00 91	add	x2, x8, #0x8
   42e38:	e0 03 1b aa	mov	x0, x27
   42e3c:	e1 03 18 aa	mov	x1, x24
   42e40:	aa 45 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   42e44:	f5 03 00 aa	mov	x21, x0
   42e48:	bf 03 19 f8	stur	xzr, [x29, #-0x70]
   42e4c:	a4 c3 01 d1	sub	x4, x29, #0x70
   42e50:	e0 03 14 aa	mov	x0, x20
   42e54:	e2 03 15 aa	mov	x2, x21
   42e58:	03 00 80 d2	mov	x3, #0x0
   42e5c:	91 51 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   42e60:	fd 03 1d aa	mov	x29, x29
   42e64:	45 4a 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   42e68:	f4 03 00 aa	mov	x20, x0
   42e6c:	e0 03 15 aa	mov	x0, x21
   42e70:	3c 4a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42e74:	a0 03 59 f8	ldur	x0, [x29, #-0x70]
   42e78:	3d 4a 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   42e7c:	34 0e 00 b4	cbz	x20, 0x43040
   42e80:	e0 03 14 aa	mov	x0, x20
   42e84:	b8 44 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   42e88:	f5 03 00 aa	mov	x21, x0
   42e8c:	fc 03 01 aa	mov	x28, x1
   42e90:	e0 03 14 aa	mov	x0, x20
   42e94:	33 4a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42e98:	00 00 80 d2	mov	x0, #0x0
   42e9c:	ab 45 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   42ea0:	f9 03 00 91	mov	x25, sp
   42ea4:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   42ea8:	08 21 40 f9	ldr	x8, [x8, #0x40]
   42eac:	e9 03 08 aa	mov	x9, x8
   42eb0:	10 37 00 d0	adrp	x16, 1762 ; 0x724000
   42eb4:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   42eb8:	00 02 3f d6	blr	x16
   42ebc:	e9 03 00 91	mov	x9, sp
   42ec0:	08 3d 00 91	add	x8, x8, #0xf
   42ec4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   42ec8:	34 01 08 cb	sub	x20, x9, x8
   42ecc:	9f 02 00 91	mov	sp, x20
   42ed0:	e8 03 14 aa	mov	x8, x20
   42ed4:	9a 45 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   42ed8:	e0 03 15 aa	mov	x0, x21
   42edc:	e1 03 1c aa	mov	x1, x28
   42ee0:	e2 03 14 aa	mov	x2, x20
   42ee4:	93 45 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   42ee8:	fa 03 00 aa	mov	x26, x0
   42eec:	f4 03 01 aa	mov	x20, x1
   42ef0:	e0 03 15 aa	mov	x0, x21
   42ef4:	e1 03 1c aa	mov	x1, x28
   42ef8:	e8 29 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   42efc:	3f 03 00 91	mov	sp, x25
   42f00:	78 66 44 a9	ldp	x24, x25, [x19, #0x40]
   42f04:	7c 1a 40 f9	ldr	x28, [x19, #0x30]
   42f08:	34 0b 00 b4	cbz	x20, 0x4306c
   42f0c:	e0 03 1b aa	mov	x0, x27
   42f10:	b3 4a 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   42f14:	5e 00 00 14	b	0x4308c
   42f18:	f4 03 00 aa	mov	x20, x0
   42f1c:	56 44 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   42f20:	fa 03 00 aa	mov	x26, x0
   42f24:	e0 03 14 aa	mov	x0, x20
   42f28:	0e 4a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42f2c:	f5 03 1a aa	mov	x21, x26
   42f30:	f3 4a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   42f34:	e0 03 1a aa	mov	x0, x26
   42f38:	be 4a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   42f3c:	79 1e 40 f9	ldr	x25, [x19, #0x38]
   42f40:	7c 0a 40 f9	ldr	x28, [x19, #0x10]
   42f44:	ba 04 80 d2	mov	x26, #0x25
   42f48:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   42f4c:	e0 03 1b aa	mov	x0, x27
   42f50:	a3 4a 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   42f54:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   42f58:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   42f5c:	08 81 00 d1	sub	x8, x8, #0x20
   42f60:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   42f64:	60 86 45 a9	ldp	x0, x1, [x19, #0x58]
   42f68:	75 62 44 a9	ldp	x21, x24, [x19, #0x40]
   42f6c:	bf 32 00 94	bl	0x4fa68
   42f70:	e0 03 17 aa	mov	x0, x23
   42f74:	e1 03 16 aa	mov	x1, x22
   42f78:	bc 32 00 94	bl	0x4fa68
   42f7c:	88 07 40 f9	ldr	x8, [x28, #0x8]
   42f80:	60 16 40 f9	ldr	x0, [x19, #0x28]
   42f84:	61 0e 40 f9	ldr	x1, [x19, #0x18]
   42f88:	00 01 3f d6	blr	x8
   42f8c:	28 07 40 f9	ldr	x8, [x25, #0x8]
   42f90:	e0 03 18 aa	mov	x0, x24
   42f94:	e1 03 15 aa	mov	x1, x21
   42f98:	00 01 3f d6	blr	x8
   42f9c:	68 12 40 f9	ldr	x8, [x19, #0x20]
   42fa0:	1f 01 00 91	mov	sp, x8
   42fa4:	4b 00 00 14	b	0x430d0
   42fa8:	f4 03 00 aa	mov	x20, x0
   42fac:	32 44 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   42fb0:	fa 03 00 aa	mov	x26, x0
   42fb4:	e0 03 14 aa	mov	x0, x20
   42fb8:	ea 49 13 94	bl	0x515760 ; symbol stub for: _objc_release
   42fbc:	f5 03 1a aa	mov	x21, x26
   42fc0:	cf 4a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   42fc4:	e0 03 1a aa	mov	x0, x26
   42fc8:	9a 4a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   42fcc:	7c 0e 40 f9	ldr	x28, [x19, #0x18]
   42fd0:	78 22 40 f9	ldr	x24, [x19, #0x40]
   42fd4:	ba 04 80 d2	mov	x26, #0x25
   42fd8:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   42fdc:	e0 03 1b aa	mov	x0, x27
   42fe0:	7f 4a 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   42fe4:	a8 26 00 f0	adrp	x8, 1239 ; 0x519000
   42fe8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   42fec:	08 81 00 d1	sub	x8, x8, #0x20
   42ff0:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   42ff4:	79 02 45 a9	ldp	x25, x0, [x19, #0x50]
   42ff8:	75 16 40 f9	ldr	x21, [x19, #0x28]
   42ffc:	61 32 40 f9	ldr	x1, [x19, #0x60]
   43000:	9a 32 00 94	bl	0x4fa68
   43004:	e0 03 17 aa	mov	x0, x23
   43008:	e1 03 16 aa	mov	x1, x22
   4300c:	97 32 00 94	bl	0x4fa68
   43010:	88 07 40 f9	ldr	x8, [x28, #0x8]
   43014:	60 1e 40 f9	ldr	x0, [x19, #0x38]
   43018:	61 12 40 f9	ldr	x1, [x19, #0x20]
   4301c:	00 01 3f d6	blr	x8
   43020:	a8 06 40 f9	ldr	x8, [x21, #0x8]
   43024:	e0 03 19 aa	mov	x0, x25
   43028:	61 1a 40 f9	ldr	x1, [x19, #0x30]
   4302c:	00 01 3f d6	blr	x8
   43030:	1f 03 00 91	mov	sp, x24
   43034:	68 26 40 f9	ldr	x8, [x19, #0x48]
   43038:	1f 01 00 91	mov	sp, x8
   4303c:	37 fb ff 17	b	0x41d18
   43040:	f4 03 00 aa	mov	x20, x0
   43044:	0c 44 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   43048:	fa 03 00 aa	mov	x26, x0
   4304c:	e0 03 14 aa	mov	x0, x20
   43050:	c4 49 13 94	bl	0x515760 ; symbol stub for: _objc_release
   43054:	f5 03 1a aa	mov	x21, x26
   43058:	a9 4a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   4305c:	e0 03 1a aa	mov	x0, x26
   43060:	74 4a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   43064:	78 66 44 a9	ldp	x24, x25, [x19, #0x40]
   43068:	7c 1a 40 f9	ldr	x28, [x19, #0x30]
   4306c:	ba 04 80 d2	mov	x26, #0x25
   43070:	1a 00 fa f2	movk	x26, #0xd000, lsl #48
   43074:	e0 03 1b aa	mov	x0, x27
   43078:	59 4a 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   4307c:	a8 26 00 d0	adrp	x8, 1238 ; 0x519000
   43080:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   43084:	08 81 00 d1	sub	x8, x8, #0x20
   43088:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   4308c:	60 86 45 a9	ldp	x0, x1, [x19, #0x58]
   43090:	75 12 40 f9	ldr	x21, [x19, #0x20]
   43094:	75 32 00 94	bl	0x4fa68
   43098:	e0 03 17 aa	mov	x0, x23
   4309c:	e1 03 16 aa	mov	x1, x22
   430a0:	72 32 00 94	bl	0x4fa68
   430a4:	68 0e 40 f9	ldr	x8, [x19, #0x18]
   430a8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   430ac:	60 1e 40 f9	ldr	x0, [x19, #0x38]
   430b0:	e1 03 1c aa	mov	x1, x28
   430b4:	00 01 3f d6	blr	x8
   430b8:	68 16 40 f9	ldr	x8, [x19, #0x28]
   430bc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   430c0:	e0 03 15 aa	mov	x0, x21
   430c4:	e1 03 18 aa	mov	x1, x24
   430c8:	00 01 3f d6	blr	x8
   430cc:	3f 03 00 91	mov	sp, x25
   430d0:	68 2a 40 f9	ldr	x8, [x19, #0x50]
   430d4:	1f 01 00 91	mov	sp, x8
   430d8:	10 fb ff 17	b	0x41d18
   430dc:	00 38 00 d0	adrp	x0, 1794 ; 0x745000
   430e0:	00 c0 07 91	add	x0, x0, #0x1f0
   430e4:	61 ff ff b0	adrp	x1, -19 ; 0x30000
   430e8:	21 90 21 91	add	x1, x1, #0x864
   430ec:	6f 4a 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   430f0:	89 fa ff 17	b	0x41b14
   430f4:	00 38 00 d0	adrp	x0, 1794 ; 0x745000
   430f8:	00 e0 07 91	add	x0, x0, #0x1f8
   430fc:	61 ff ff b0	adrp	x1, -19 ; 0x30000
   43100:	21 40 23 91	add	x1, x1, #0x8d0
   43104:	69 4a 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   43108:	1a fb ff 17	b	0x41d70
   4310c:	7e 48 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
