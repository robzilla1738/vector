/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift18requireInstallMetaAA0eF0VyKF:
   33a18:	ff 43 02 d1	sub	sp, sp, #0x90
   33a1c:	f8 2b 00 f9	str	x24, [sp, #0x50]
   33a20:	f7 5b 06 a9	stp	x23, x22, [sp, #0x60]
   33a24:	f4 4f 07 a9	stp	x20, x19, [sp, #0x70]
   33a28:	fd 7b 08 a9	stp	x29, x30, [sp, #0x80]
   33a2c:	fd 03 02 91	add	x29, sp, #0x80
   33a30:	f3 03 15 aa	mov	x19, x21
   33a34:	88 38 00 d0	adrp	x8, 1810 ; 0x745000
   33a38:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   33a3c:	1f 05 00 b1	cmn	x8, #0x1
   33a40:	21 0f 00 54	b.ne	0x33c24
   33a44:	88 38 00 b0	adrp	x8, 1809 ; 0x744000
   33a48:	08 21 39 91	add	x8, x8, #0xe48
   33a4c:	00 05 40 a9	ldp	x0, x1, [x8]
   33a50:	df fd ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   33a54:	28 fc 7c d3	lsr	x8, x1, #60
   33a58:	1f 39 00 f1	cmp	x8, #0xe
   33a5c:	c9 09 00 54	b.ls	0x33b94
   33a60:	28 27 00 d0	adrp	x8, 1254 ; 0x519000
   33a64:	08 c1 34 91	add	x8, x8, #0xd30 ; literal pool for: "AsideBiometricHelper"
   33a68:	18 81 00 d1	sub	x24, x8, #0x20
   33a6c:	60 38 00 d0	adrp	x0, 1806 ; 0x741000
   33a70:	00 c0 12 91	add	x0, x0, #0x4b0
   33a74:	a1 27 00 f0	adrp	x1, 1271 ; 0x52a000
   33a78:	21 a0 1c 91	add	x1, x1, #0x728
   33a7c:	8c c2 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   33a80:	e1 03 00 91	mov	x1, sp
   33a84:	00 88 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   33a88:	f3 03 00 aa	mov	x19, x0
   33a8c:	a8 27 00 f0	adrp	x8, 1271 ; 0x52a000
   33a90:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   33a94:	00 04 80 3d	str	q0, [x0, #0x10]
   33a98:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   33a9c:	08 25 40 f9	ldr	x8, [x8, #0x48] ; literal pool symbol address: _NSLocalizedDescriptionKey
   33aa0:	00 01 40 f9	ldr	x0, [x8]
   33aa4:	a0 82 13 94	bl	0x514524 ; symbol stub for: _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
   33aa8:	f4 03 13 aa	mov	x20, x19
   33aac:	80 0e 02 f8	str	x0, [x20, #0x20]!
   33ab0:	96 37 00 b0	adrp	x22, 1777 ; 0x724000
   33ab4:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   33ab8:	76 26 00 f9	str	x22, [x19, #0x48]
   33abc:	c8 ed 8d d2	mov	x8, #0x6f6e
   33ac0:	88 0e a4 f2	movk	x8, #0x2074, lsl #16
   33ac4:	28 cd cd f2	movk	x8, #0x6e69, lsl #32
   33ac8:	68 8e ee f2	movk	x8, #0x7473, lsl #48
   33acc:	61 a2 02 a9	stp	x1, x8, [x19, #0x28]
   33ad0:	28 8c 8d d2	mov	x8, #0x6c61
   33ad4:	88 ad ac f2	movk	x8, #0x656c, lsl #16
   33ad8:	88 0c c0 f2	movk	x8, #0x64, lsl #32
   33adc:	08 a0 fd f2	movk	x8, #0xed00, lsl #48
   33ae0:	68 1e 00 f9	str	x8, [x19, #0x38]
   33ae4:	e0 03 13 aa	mov	x0, x19
   33ae8:	0b 67 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   33aec:	f7 03 00 aa	mov	x23, x0
   33af0:	e0 03 13 aa	mov	x0, x19
   33af4:	f9 87 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   33af8:	61 38 00 d0	adrp	x1, 1806 ; 0x741000
   33afc:	21 e0 12 91	add	x1, x1, #0x4b8
   33b00:	a2 27 00 f0	adrp	x2, 1271 ; 0x52a000
   33b04:	42 c0 1c 91	add	x2, x2, #0x730
   33b08:	e0 03 14 aa	mov	x0, x20
   33b0c:	c1 6f 00 94	bl	_$sypSgWOhTm
   33b10:	68 38 00 d0	adrp	x8, 1806 ; 0x741000
   33b14:	00 fd 41 f9	ldr	x0, [x8, #0x3f8] ; Objc class ref: _OBJC_CLASS_$_NSError
   33b18:	0c 87 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   33b1c:	f3 03 00 aa	mov	x19, x0
   33b20:	01 03 41 b2	orr	x1, x24, #0x8000000000000000
   33b24:	80 02 80 d2	mov	x0, #0x14
   33b28:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   33b2c:	75 82 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   33b30:	f4 03 00 aa	mov	x20, x0
   33b34:	88 37 00 b0	adrp	x8, 1777 ; 0x724000
   33b38:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   33b3c:	83 37 00 b0	adrp	x3, 1777 ; 0x724000
   33b40:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   33b44:	02 21 00 91	add	x2, x8, #0x8
   33b48:	e0 03 17 aa	mov	x0, x23
   33b4c:	e1 03 16 aa	mov	x1, x22
   33b50:	66 82 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   33b54:	f6 03 00 aa	mov	x22, x0
   33b58:	e0 03 17 aa	mov	x0, x23
   33b5c:	a0 87 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   33b60:	e0 03 13 aa	mov	x0, x19
   33b64:	e2 03 14 aa	mov	x2, x20
   33b68:	03 00 80 92	mov	x3, #-0x1
   33b6c:	e4 03 16 aa	mov	x4, x22
   33b70:	b4 8e 13 94	bl	"_objc_msgSend$initWithDomain:code:userInfo:"
   33b74:	f3 03 00 aa	mov	x19, x0
   33b78:	e0 03 14 aa	mov	x0, x20
   33b7c:	f9 86 13 94	bl	0x515760 ; symbol stub for: _objc_release
   33b80:	e0 03 16 aa	mov	x0, x22
   33b84:	f7 86 13 94	bl	0x515760 ; symbol stub for: _objc_release
   33b88:	f5 03 13 aa	mov	x21, x19
   33b8c:	dc 87 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   33b90:	1e 00 00 14	b	0x33c08
   33b94:	f6 03 00 aa	mov	x22, x0
   33b98:	00 00 80 d2	mov	x0, #0x0
   33b9c:	f7 03 01 aa	mov	x23, x1
   33ba0:	11 81 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   33ba4:	01 30 40 b9	ldr	w1, [x0, #0x30]
   33ba8:	02 68 40 79	ldrh	w2, [x0, #0x34]
   33bac:	80 87 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   33bb0:	f4 03 00 aa	mov	x20, x0
   33bb4:	09 81 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   33bb8:	f4 03 00 aa	mov	x20, x0
   33bbc:	0e 6b 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSeAAWl
   33bc0:	e4 03 00 aa	mov	x4, x0
   33bc4:	80 37 00 b0	adrp	x0, 1777 ; 0x724000
   33bc8:	00 20 2b 91	add	x0, x0, #0xac8
   33bcc:	a8 8b 00 d1	sub	x8, x29, #0x22
   33bd0:	e1 03 16 aa	mov	x1, x22
   33bd4:	e2 03 17 aa	mov	x2, x23
   33bd8:	e3 03 00 aa	mov	x3, x0
   33bdc:	f5 03 13 aa	mov	x21, x19
   33be0:	fb 80 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   33be4:	f3 03 15 aa	mov	x19, x21
   33be8:	e0 03 16 aa	mov	x0, x22
   33bec:	e1 03 17 aa	mov	x1, x23
   33bf0:	9e 6f 00 94	bl	0x4fa68
   33bf4:	e0 03 14 aa	mov	x0, x20
   33bf8:	af 87 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   33bfc:	53 00 00 b4	cbz	x19, 0x33c04
   33c00:	02 00 00 14	b	0x33c08
   33c04:	a0 e3 5d 78	ldurh	w0, [x29, #-0x22]
   33c08:	f5 03 13 aa	mov	x21, x19
   33c0c:	fd 7b 48 a9	ldp	x29, x30, [sp, #0x80]
   33c10:	f4 4f 47 a9	ldp	x20, x19, [sp, #0x70]
   33c14:	f7 5b 46 a9	ldp	x23, x22, [sp, #0x60]
   33c18:	f8 2b 40 f9	ldr	x24, [sp, #0x50]
   33c1c:	ff 43 02 91	add	sp, sp, #0x90
   33c20:	c0 03 5f d6	ret
   33c24:	80 38 00 d0	adrp	x0, 1810 ; 0x745000
   33c28:	00 a0 07 91	add	x0, x0, #0x1e8
   33c2c:	e1 ff ff b0	adrp	x1, -3 ; 0x30000
   33c30:	21 e0 1f 91	add	x1, x1, #0x7f8
   33c34:	9d 87 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   33c38:	83 ff ff 17	b	0x33a44
