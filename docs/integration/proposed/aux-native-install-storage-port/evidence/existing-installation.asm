/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift32existingInstallationInitResponseSDySSypGSgyKF:
   34840:	ff 83 06 d1	sub	sp, sp, #0x1a0
   34844:	fc a3 00 f9	str	x28, [sp, #0x140]
   34848:	fb 6b 15 a9	stp	x27, x26, [sp, #0x150]
   3484c:	f9 63 16 a9	stp	x25, x24, [sp, #0x160]
   34850:	f7 5b 17 a9	stp	x23, x22, [sp, #0x170]
   34854:	f4 4f 18 a9	stp	x20, x19, [sp, #0x180]
   34858:	fd 7b 19 a9	stp	x29, x30, [sp, #0x190]
   3485c:	fd 43 06 91	add	x29, sp, #0x190
   34860:	f7 03 15 aa	mov	x23, x21
   34864:	88 38 00 b0	adrp	x8, 1809 ; 0x745000
   34868:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   3486c:	1f 05 00 b1	cmn	x8, #0x1
   34870:	21 29 00 54	b.ne	0x34d94
   34874:	88 38 00 90	adrp	x8, 1808 ; 0x744000
   34878:	08 21 39 91	add	x8, x8, #0xe48
   3487c:	00 05 40 a9	ldp	x0, x1, [x8]
   34880:	53 fa ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   34884:	28 fc 7c d3	lsr	x8, x1, #60
   34888:	1f 39 00 f1	cmp	x8, #0xe
   3488c:	69 00 00 54	b.ls	0x34898
   34890:	00 00 80 d2	mov	x0, #0x0
   34894:	17 01 00 14	b	0x34cf0
   34898:	f6 03 00 aa	mov	x22, x0
   3489c:	f3 03 01 aa	mov	x19, x1
   348a0:	00 00 80 d2	mov	x0, #0x0
   348a4:	d0 7d 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   348a8:	01 30 40 b9	ldr	w1, [x0, #0x30]
   348ac:	02 68 40 79	ldrh	w2, [x0, #0x34]
   348b0:	3f 84 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   348b4:	f4 03 00 aa	mov	x20, x0
   348b8:	c8 7d 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   348bc:	f4 03 00 aa	mov	x20, x0
   348c0:	cd 67 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSeAAWl
   348c4:	e4 03 00 aa	mov	x4, x0
   348c8:	80 37 00 90	adrp	x0, 1776 ; 0x724000
   348cc:	00 20 2b 91	add	x0, x0, #0xac8
   348d0:	e8 e3 01 91	add	x8, sp, #0x78
   348d4:	e1 03 16 aa	mov	x1, x22
   348d8:	e2 03 13 aa	mov	x2, x19
   348dc:	e3 03 00 aa	mov	x3, x0
   348e0:	f5 03 17 aa	mov	x21, x23
   348e4:	ba 7d 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   348e8:	f7 03 15 aa	mov	x23, x21
   348ec:	f5 00 00 b4	cbz	x21, 0x34908
   348f0:	e0 03 16 aa	mov	x0, x22
   348f4:	e1 03 13 aa	mov	x1, x19
   348f8:	5c 6c 00 94	bl	0x4fa68
   348fc:	e0 03 14 aa	mov	x0, x20
   34900:	6d 84 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   34904:	fb 00 00 14	b	0x34cf0
   34908:	e0 03 14 aa	mov	x0, x20
   3490c:	6a 84 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   34910:	fc e3 41 39	ldrb	w28, [sp, #0x78]
   34914:	f9 e7 41 39	ldrb	w25, [sp, #0x79]
   34918:	88 38 00 b0	adrp	x8, 1809 ; 0x745000
   3491c:	08 01 41 f9	ldr	x8, [x8, #0x200]
   34920:	1f 05 00 b1	cmn	x8, #0x1
   34924:	41 24 00 54	b.ne	0x34dac
   34928:	88 38 00 90	adrp	x8, 1808 ; 0x744000
   3492c:	08 e1 39 91	add	x8, x8, #0xe78
   34930:	00 05 40 a9	ldp	x0, x1, [x8]
   34934:	26 fa ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   34938:	f4 03 01 aa	mov	x20, x1
   3493c:	4b 6c 00 94	bl	0x4fa68
   34940:	88 fe 7c d3	lsr	x8, x20, #60
   34944:	1f 39 00 f1	cmp	x8, #0xe
   34948:	e9 03 00 54	b.ls	0x349c4
   3494c:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34950:	08 c1 34 91	add	x8, x8, #0xd30 ; literal pool for: "AsideBiometricHelper"
   34954:	1a 81 00 d1	sub	x26, x8, #0x20
   34958:	60 38 00 b0	adrp	x0, 1805 ; 0x741000
   3495c:	00 c0 12 91	add	x0, x0, #0x4b0
   34960:	a1 27 00 d0	adrp	x1, 1270 ; 0x52a000
   34964:	21 a0 1c 91	add	x1, x1, #0x728
   34968:	d1 be ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3496c:	e1 23 00 91	add	x1, sp, #0x8
   34970:	45 84 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   34974:	f4 03 00 aa	mov	x20, x0
   34978:	a8 27 00 d0	adrp	x8, 1270 ; 0x52a000
   3497c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   34980:	00 04 80 3d	str	q0, [x0, #0x10]
   34984:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34988:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   3498c:	00 01 40 f9	ldr	x0, [x8]
   34990:	e5 7e 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   34994:	f7 03 14 aa	mov	x23, x20
   34998:	e0 0e 02 f8	str	x0, [x23, #0x20]!
   3499c:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   349a0:	08 c1 37 91	add	x8, x8, #0xdf0 ; literal pool for: "Wrapped DK not found"
   349a4:	98 37 00 90	adrp	x24, 1776 ; 0x724000
   349a8:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   349ac:	08 81 00 d1	sub	x8, x8, #0x20
   349b0:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   349b4:	98 26 00 f9	str	x24, [x20, #0x48]
   349b8:	89 02 80 d2	mov	x9, #0x14
   349bc:	09 00 fa f2	movk	x9, #0xd000, lsl #48
   349c0:	2e 00 00 14	b	0x34a78
   349c4:	00 00 80 d2	mov	x0, #0x0
   349c8:	01 00 fe d2	mov	x1, #-0x1000000000000000
   349cc:	27 6c 00 94	bl	0x4fa68
   349d0:	88 38 00 b0	adrp	x8, 1809 ; 0x745000
   349d4:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   349d8:	1f 05 00 b1	cmn	x8, #0x1
   349dc:	41 1f 00 54	b.ne	0x34dc4
   349e0:	88 38 00 90	adrp	x8, 1808 ; 0x744000
   349e4:	08 61 39 91	add	x8, x8, #0xe58
   349e8:	00 05 40 a9	ldp	x0, x1, [x8]
   349ec:	f8 f9 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   349f0:	28 fc 7c d3	lsr	x8, x1, #60
   349f4:	1f 39 00 f1	cmp	x8, #0xe
   349f8:	c9 09 00 54	b.ls	0x34b30
   349fc:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34a00:	08 c1 34 91	add	x8, x8, #0xd30 ; literal pool for: "AsideBiometricHelper"
   34a04:	1a 81 00 d1	sub	x26, x8, #0x20
   34a08:	60 38 00 b0	adrp	x0, 1805 ; 0x741000
   34a0c:	00 c0 12 91	add	x0, x0, #0x4b0
   34a10:	a1 27 00 d0	adrp	x1, 1270 ; 0x52a000
   34a14:	21 a0 1c 91	add	x1, x1, #0x728
   34a18:	a5 be ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   34a1c:	a1 a3 02 d1	sub	x1, x29, #0xa8
   34a20:	19 84 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   34a24:	f4 03 00 aa	mov	x20, x0
   34a28:	a8 27 00 d0	adrp	x8, 1270 ; 0x52a000
   34a2c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   34a30:	00 04 80 3d	str	q0, [x0, #0x10]
   34a34:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34a38:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   34a3c:	00 01 40 f9	ldr	x0, [x8]
   34a40:	b9 7e 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   34a44:	f7 03 14 aa	mov	x23, x20
   34a48:	e0 0e 02 f8	str	x0, [x23, #0x20]!
   34a4c:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34a50:	08 81 36 91	add	x8, x8, #0xda0 ; literal pool for: "Install signing key not found"
   34a54:	29 01 80 52	mov	w9, #0x9
   34a58:	8a 02 80 d2	mov	x10, #0x14
   34a5c:	0a 00 fa f2	movk	x10, #0xd000, lsl #48
   34a60:	49 01 09 aa	orr	x9, x10, x9
   34a64:	98 37 00 90	adrp	x24, 1776 ; 0x724000
   34a68:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   34a6c:	08 81 00 d1	sub	x8, x8, #0x20
   34a70:	98 26 00 f9	str	x24, [x20, #0x48]
   34a74:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   34a78:	81 a6 02 a9	stp	x1, x9, [x20, #0x28]
   34a7c:	88 1e 00 f9	str	x8, [x20, #0x38]
   34a80:	e0 03 14 aa	mov	x0, x20
   34a84:	24 63 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   34a88:	f9 03 00 aa	mov	x25, x0
   34a8c:	e0 03 14 aa	mov	x0, x20
   34a90:	12 84 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   34a94:	61 38 00 b0	adrp	x1, 1805 ; 0x741000
   34a98:	21 e0 12 91	add	x1, x1, #0x4b8
   34a9c:	a2 27 00 d0	adrp	x2, 1270 ; 0x52a000
   34aa0:	42 c0 1c 91	add	x2, x2, #0x730
   34aa4:	e0 03 17 aa	mov	x0, x23
   34aa8:	da 6b 00 94	bl	_$sypSgWOhTm
   34aac:	68 38 00 b0	adrp	x8, 1805 ; 0x741000
   34ab0:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   34ab4:	25 83 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   34ab8:	f4 03 00 aa	mov	x20, x0
   34abc:	41 03 41 b2	orr	x1, x26, #0x8000000000000000
   34ac0:	80 02 80 d2	mov	x0, #0x14
   34ac4:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   34ac8:	8e 7e 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   34acc:	fa 03 00 aa	mov	x26, x0
   34ad0:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34ad4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   34ad8:	83 37 00 90	adrp	x3, 1776 ; 0x724000
   34adc:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   34ae0:	02 21 00 91	add	x2, x8, #0x8
   34ae4:	e0 03 19 aa	mov	x0, x25
   34ae8:	e1 03 18 aa	mov	x1, x24
   34aec:	7f 7e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   34af0:	f8 03 00 aa	mov	x24, x0
   34af4:	e0 03 19 aa	mov	x0, x25
   34af8:	b9 83 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   34afc:	e0 03 14 aa	mov	x0, x20
   34b00:	e2 03 1a aa	mov	x2, x26
   34b04:	03 00 80 92	mov	x3, #-0x1
   34b08:	e4 03 18 aa	mov	x4, x24
   34b0c:	cd 8a 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   34b10:	f7 03 00 aa	mov	x23, x0
   34b14:	e0 03 1a aa	mov	x0, x26
   34b18:	12 83 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34b1c:	e0 03 18 aa	mov	x0, x24
   34b20:	10 83 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34b24:	f5 03 17 aa	mov	x21, x23
   34b28:	f5 83 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   34b2c:	6e 00 00 14	b	0x34ce4
   34b30:	f4 03 00 aa	mov	x20, x0
   34b34:	f8 03 01 aa	mov	x24, x1
   34b38:	88 38 00 b0	adrp	x8, 1809 ; 0x745000
   34b3c:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   34b40:	1f 05 00 b1	cmn	x8, #0x1
   34b44:	c1 14 00 54	b.ne	0x34ddc
   34b48:	88 38 00 90	adrp	x8, 1808 ; 0x744000
   34b4c:	08 a1 39 91	add	x8, x8, #0xe68
   34b50:	00 05 40 a9	ldp	x0, x1, [x8]
   34b54:	9e f9 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   34b58:	28 fc 7c d3	lsr	x8, x1, #60
   34b5c:	1f 39 00 f1	cmp	x8, #0xe
   34b60:	e9 09 00 54	b.ls	0x34c9c
   34b64:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34b68:	08 c1 34 91	add	x8, x8, #0xd30 ; literal pool for: "AsideBiometricHelper"
   34b6c:	19 81 00 d1	sub	x25, x8, #0x20
   34b70:	60 38 00 b0	adrp	x0, 1805 ; 0x741000
   34b74:	00 c0 12 91	add	x0, x0, #0x4b0
   34b78:	a1 27 00 d0	adrp	x1, 1270 ; 0x52a000
   34b7c:	21 a0 1c 91	add	x1, x1, #0x728
   34b80:	4b be ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   34b84:	e1 63 02 91	add	x1, sp, #0x98
   34b88:	bf 83 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   34b8c:	b4 83 1b f8	stur	x20, [x29, #-0x48]
   34b90:	f4 03 00 aa	mov	x20, x0
   34b94:	a8 27 00 d0	adrp	x8, 1270 ; 0x52a000
   34b98:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   34b9c:	00 04 80 3d	str	q0, [x0, #0x10]
   34ba0:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34ba4:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   34ba8:	00 01 40 f9	ldr	x0, [x8]
   34bac:	5e 7e 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   34bb0:	f7 03 14 aa	mov	x23, x20
   34bb4:	e0 0e 02 f8	str	x0, [x23, #0x20]!
   34bb8:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34bbc:	08 01 37 91	add	x8, x8, #0xdc0 ; literal pool for: "Install key agreement key not found"
   34bc0:	08 81 00 d1	sub	x8, x8, #0x20
   34bc4:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   34bc8:	9a 37 00 90	adrp	x26, 1776 ; 0x724000
   34bcc:	5a 27 41 f9	ldr	x26, [x26, #0x248] ; literal pool symbol address: _$sSSN
   34bd0:	9a 26 00 f9	str	x26, [x20, #0x48]
   34bd4:	89 02 80 d2	mov	x9, #0x14
   34bd8:	09 00 fa f2	movk	x9, #0xd000, lsl #48
   34bdc:	29 3d 00 91	add	x9, x9, #0xf
   34be0:	81 a6 02 a9	stp	x1, x9, [x20, #0x28]
   34be4:	88 1e 00 f9	str	x8, [x20, #0x38]
   34be8:	e0 03 14 aa	mov	x0, x20
   34bec:	ca 62 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   34bf0:	fb 03 00 aa	mov	x27, x0
   34bf4:	e0 03 14 aa	mov	x0, x20
   34bf8:	b8 83 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   34bfc:	61 38 00 b0	adrp	x1, 1805 ; 0x741000
   34c00:	21 e0 12 91	add	x1, x1, #0x4b8
   34c04:	a2 27 00 d0	adrp	x2, 1270 ; 0x52a000
   34c08:	42 c0 1c 91	add	x2, x2, #0x730
   34c0c:	e0 03 17 aa	mov	x0, x23
   34c10:	80 6b 00 94	bl	_$sypSgWOhTm
   34c14:	68 38 00 b0	adrp	x8, 1805 ; 0x741000
   34c18:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   34c1c:	cb 82 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   34c20:	f4 03 00 aa	mov	x20, x0
   34c24:	21 03 41 b2	orr	x1, x25, #0x8000000000000000
   34c28:	80 02 80 d2	mov	x0, #0x14
   34c2c:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   34c30:	34 7e 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   34c34:	fc 03 00 aa	mov	x28, x0
   34c38:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34c3c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   34c40:	83 37 00 90	adrp	x3, 1776 ; 0x724000
   34c44:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   34c48:	02 21 00 91	add	x2, x8, #0x8
   34c4c:	e0 03 1b aa	mov	x0, x27
   34c50:	e1 03 1a aa	mov	x1, x26
   34c54:	25 7e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   34c58:	fa 03 00 aa	mov	x26, x0
   34c5c:	e0 03 1b aa	mov	x0, x27
   34c60:	5f 83 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   34c64:	e0 03 14 aa	mov	x0, x20
   34c68:	e2 03 1c aa	mov	x2, x28
   34c6c:	03 00 80 92	mov	x3, #-0x1
   34c70:	e4 03 1a aa	mov	x4, x26
   34c74:	73 8a 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   34c78:	f7 03 00 aa	mov	x23, x0
   34c7c:	e0 03 1c aa	mov	x0, x28
   34c80:	b8 82 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34c84:	e0 03 1a aa	mov	x0, x26
   34c88:	b6 82 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34c8c:	f5 03 17 aa	mov	x21, x23
   34c90:	9b 83 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   34c94:	a0 83 5b f8	ldur	x0, [x29, #-0x48]
   34c98:	11 00 00 14	b	0x34cdc
   34c9c:	fb 03 00 aa	mov	x27, x0
   34ca0:	fa 03 01 aa	mov	x26, x1
   34ca4:	80 23 19 2a	orr	w0, w28, w25, lsl #8
   34ca8:	e1 03 14 aa	mov	x1, x20
   34cac:	e2 03 18 aa	mov	x2, x24
   34cb0:	e3 03 1b aa	mov	x3, x27
   34cb4:	e4 03 1a aa	mov	x4, x26
   34cb8:	f5 03 17 aa	mov	x21, x23
   34cbc:	e0 fb ff 97	bl	_$s16AsideNativeSwift18publicKeysResponse4meta7sigData03kemI0SDySSypGAA11InstallMetaV_10Foundation0I0VAKtKF
   34cc0:	f9 03 14 aa	mov	x25, x20
   34cc4:	f7 03 15 aa	mov	x23, x21
   34cc8:	75 02 00 b4	cbz	x21, 0x34d14
   34ccc:	e0 03 1b aa	mov	x0, x27
   34cd0:	e1 03 1a aa	mov	x1, x26
   34cd4:	65 6b 00 94	bl	0x4fa68
   34cd8:	e0 03 19 aa	mov	x0, x25
   34cdc:	e1 03 18 aa	mov	x1, x24
   34ce0:	62 6b 00 94	bl	0x4fa68
   34ce4:	e0 03 16 aa	mov	x0, x22
   34ce8:	e1 03 13 aa	mov	x1, x19
   34cec:	5f 6b 00 94	bl	0x4fa68
   34cf0:	f5 03 17 aa	mov	x21, x23
   34cf4:	fd 7b 59 a9	ldp	x29, x30, [sp, #0x190]
   34cf8:	f4 4f 58 a9	ldp	x20, x19, [sp, #0x180]
   34cfc:	f7 5b 57 a9	ldp	x23, x22, [sp, #0x170]
   34d00:	f9 63 56 a9	ldp	x25, x24, [sp, #0x160]
   34d04:	fb 6b 55 a9	ldp	x27, x26, [sp, #0x150]
   34d08:	fc a3 40 f9	ldr	x28, [sp, #0x140]
   34d0c:	ff 83 06 91	add	sp, sp, #0x1a0
   34d10:	c0 03 5f d6	ret
   34d14:	f4 03 00 aa	mov	x20, x0
   34d18:	28 00 80 52	mov	w8, #0x1
   34d1c:	e8 63 01 39	strb	w8, [sp, #0x58]
   34d20:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34d24:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   34d28:	e8 3b 00 f9	str	x8, [sp, #0x70]
   34d2c:	e0 63 01 91	add	x0, sp, #0x58
   34d30:	e1 e3 01 91	add	x1, sp, #0x78
   34d34:	c8 62 00 94	bl	_$sypWOb
   34d38:	e0 03 14 aa	mov	x0, x20
   34d3c:	58 83 13 94	bl	0x515a9c ; symbol stub for: _swift_isUniquelyReferenced_nonNull_native
   34d40:	e3 03 00 aa	mov	x3, x0
   34d44:	f4 2f 00 f9	str	x20, [sp, #0x58]
   34d48:	61 ae 8e d2	mov	x1, #0x7573
   34d4c:	61 6c ac f2	movk	x1, #0x6363, lsl #16
   34d50:	a1 6c ce f2	movk	x1, #0x7365, lsl #32
   34d54:	61 0e e0 f2	movk	x1, #0x73, lsl #48
   34d58:	e0 e3 01 91	add	x0, sp, #0x78
   34d5c:	f4 63 01 91	add	x20, sp, #0x58
   34d60:	02 e0 fc d2	mov	x2, #-0x1900000000000000
   34d64:	73 55 00 94	bl	_$ss17_NativeDictionaryV8setValue_6forKey8isUniqueyq_n_xSbtFSS_ypTg5
   34d68:	e0 03 1b aa	mov	x0, x27
   34d6c:	e1 03 1a aa	mov	x1, x26
   34d70:	3e 6b 00 94	bl	0x4fa68
   34d74:	e0 03 19 aa	mov	x0, x25
   34d78:	e1 03 18 aa	mov	x1, x24
   34d7c:	3b 6b 00 94	bl	0x4fa68
   34d80:	e0 03 16 aa	mov	x0, x22
   34d84:	e1 03 13 aa	mov	x1, x19
   34d88:	38 6b 00 94	bl	0x4fa68
   34d8c:	e0 2f 40 f9	ldr	x0, [sp, #0x58]
   34d90:	d8 ff ff 17	b	0x34cf0
   34d94:	80 38 00 b0	adrp	x0, 1809 ; 0x745000
   34d98:	00 a0 07 91	add	x0, x0, #0x1e8
   34d9c:	e1 ff ff 90	adrp	x1, -4 ; 0x30000
   34da0:	21 e0 1f 91	add	x1, x1, #0x7f8
   34da4:	41 83 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   34da8:	b3 fe ff 17	b	0x34874
   34dac:	80 38 00 b0	adrp	x0, 1809 ; 0x745000
   34db0:	00 00 08 91	add	x0, x0, #0x200
   34db4:	e1 ff ff 90	adrp	x1, -4 ; 0x30000
   34db8:	21 f0 24 91	add	x1, x1, #0x93c
   34dbc:	3b 83 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   34dc0:	da fe ff 17	b	0x34928
   34dc4:	80 38 00 b0	adrp	x0, 1809 ; 0x745000
   34dc8:	00 c0 07 91	add	x0, x0, #0x1f0
   34dcc:	e1 ff ff 90	adrp	x1, -4 ; 0x30000
   34dd0:	21 90 21 91	add	x1, x1, #0x864
   34dd4:	35 83 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   34dd8:	02 ff ff 17	b	0x349e0
   34ddc:	80 38 00 b0	adrp	x0, 1809 ; 0x745000
   34de0:	00 e0 07 91	add	x0, x0, #0x1f8
   34de4:	e1 ff ff 90	adrp	x1, -4 ; 0x30000
   34de8:	21 40 23 91	add	x1, x1, #0x8d0
   34dec:	2f 83 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   34df0:	56 ff ff 17	b	0x34b48
