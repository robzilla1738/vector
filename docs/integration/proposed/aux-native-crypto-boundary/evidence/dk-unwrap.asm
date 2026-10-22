/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift11cmdDkUnwrapSSyF:
   3bc94:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   3bc98:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   3bc9c:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   3bca0:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   3bca4:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   3bca8:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   3bcac:	fd 43 01 91	add	x29, sp, #0x50
   3bcb0:	ff 83 09 d1	sub	sp, sp, #0x260
   3bcb4:	f3 03 00 91	mov	x19, sp
   3bcb8:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3bcbc:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3bcc0:	08 01 40 f9	ldr	x8, [x8]
   3bcc4:	a8 83 19 f8	stur	x8, [x29, #-0x68]
   3bcc8:	15 00 80 d2	mov	x21, #0x0
   3bccc:	53 df ff 97	bl	_$s16AsideNativeSwift18requireInstallMetaAA0eF0VyKF
   3bcd0:	fa 03 15 aa	mov	x26, x21
   3bcd4:	35 11 00 b4	cbz	x21, 0x3bef8
   3bcd8:	bb 04 80 d2	mov	x27, #0x25
   3bcdc:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3bce0:	08 00 fc d2	mov	x8, #-0x2000000000000000
   3bce4:	bf 23 35 a9	stp	xzr, x8, [x29, #-0xb0]
   3bce8:	b4 c3 02 d1	sub	x20, x29, #0xb0
   3bcec:	80 02 80 52	mov	w0, #0x14
   3bcf0:	64 62 13 94	bl	0x514680 ; symbol stub for: _$ss11_StringGutsV4growyySiF
   3bcf4:	a0 83 55 f8	ldur	x0, [x29, #-0xa8]
   3bcf8:	39 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bcfc:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3bd00:	08 41 3d 91	add	x8, x8, #0xf50 ; literal pool for: "dk-unwrap failed: "
   3bd04:	08 81 00 d1	sub	x8, x8, #0x20
   3bd08:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   3bd0c:	69 4f 00 d1	sub	x9, x27, #0x13
   3bd10:	a9 23 35 a9	stp	x9, x8, [x29, #-0xb0]
   3bd14:	61 42 05 91	add	x1, x19, #0x150
   3bd18:	62 e2 04 91	add	x2, x19, #0x138
   3bd1c:	e0 03 1a aa	mov	x0, x26
   3bd20:	4a 67 13 94	bl	0x515a48 ; symbol stub for: _swift_getErrorValue
   3bd24:	74 82 53 a9	ldp	x20, x0, [x19, #0x138]
   3bd28:	61 a6 40 f9	ldr	x1, [x19, #0x148]
   3bd2c:	97 62 13 94	bl	0x514788 ; symbol stub for: _$ss5ErrorP10FoundationE20localizedDescriptionSSvg
   3bd30:	f5 03 01 aa	mov	x21, x1
   3bd34:	b4 c3 02 d1	sub	x20, x29, #0xb0
   3bd38:	0d 62 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   3bd3c:	e0 03 15 aa	mov	x0, x21
   3bd40:	27 67 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bd44:	b6 53 75 a9	ldp	x22, x20, [x29, #-0xb0]
   3bd48:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3bd4c:	00 c0 12 91	add	x0, x0, #0x4b0
   3bd50:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3bd54:	21 a0 1c 91	add	x1, x1, #0x728
   3bd58:	d5 a1 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3bd5c:	01 0a 80 52	mov	w1, #0x50
   3bd60:	e2 00 80 52	mov	w2, #0x7
   3bd64:	12 67 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3bd68:	f5 03 00 aa	mov	x21, x0
   3bd6c:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3bd70:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3bd74:	00 04 80 3d	str	q0, [x0, #0x10]
   3bd78:	a8 4c 8e d2	mov	x8, #0x7265
   3bd7c:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3bd80:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3bd84:	f7 03 00 aa	mov	x23, x0
   3bd88:	e8 0e 02 f8	str	x8, [x23, #0x20]!
   3bd8c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3bd90:	58 37 00 b0	adrp	x24, 1769 ; 0x724000
   3bd94:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   3bd98:	18 24 00 f9	str	x24, [x0, #0x48]
   3bd9c:	08 d8 02 a9	stp	x8, x22, [x0, #0x28]
   3bda0:	14 1c 00 f9	str	x20, [x0, #0x38]
   3bda4:	e0 03 14 aa	mov	x0, x20
   3bda8:	13 67 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   3bdac:	e0 03 15 aa	mov	x0, x21
   3bdb0:	59 46 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3bdb4:	f6 03 00 aa	mov	x22, x0
   3bdb8:	e0 03 15 aa	mov	x0, x21
   3bdbc:	47 67 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3bdc0:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3bdc4:	21 e0 12 91	add	x1, x1, #0x4b8
   3bdc8:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3bdcc:	42 c0 1c 91	add	x2, x2, #0x730
   3bdd0:	e0 03 17 aa	mov	x0, x23
   3bdd4:	0f 4f 00 94	bl	_$sypSgWOhTm
   3bdd8:	e0 03 15 aa	mov	x0, x21
   3bddc:	01 04 80 52	mov	w1, #0x20
   3bde0:	e2 00 80 52	mov	w2, #0x7
   3bde4:	0a 67 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3bde8:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3bdec:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3bdf0:	59 66 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3bdf4:	f5 03 00 aa	mov	x21, x0
   3bdf8:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3bdfc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3be00:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3be04:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3be08:	02 21 00 91	add	x2, x8, #0x8
   3be0c:	e0 03 16 aa	mov	x0, x22
   3be10:	e1 03 18 aa	mov	x1, x24
   3be14:	b5 61 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3be18:	f7 03 00 aa	mov	x23, x0
   3be1c:	bf 03 15 f8	stur	xzr, [x29, #-0xb0]
   3be20:	a4 c3 02 d1	sub	x4, x29, #0xb0
   3be24:	e0 03 15 aa	mov	x0, x21
   3be28:	e2 03 17 aa	mov	x2, x23
   3be2c:	03 00 80 d2	mov	x3, #0x0
   3be30:	9c 6d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3be34:	fd 03 1d aa	mov	x29, x29
   3be38:	50 66 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3be3c:	f5 03 00 aa	mov	x21, x0
   3be40:	e0 03 17 aa	mov	x0, x23
   3be44:	47 66 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3be48:	a0 03 55 f8	ldur	x0, [x29, #-0xb0]
   3be4c:	48 66 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3be50:	55 14 00 b4	cbz	x21, 0x3c0d8
   3be54:	e0 03 15 aa	mov	x0, x21
   3be58:	c3 60 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3be5c:	f8 03 00 aa	mov	x24, x0
   3be60:	f9 03 01 aa	mov	x25, x1
   3be64:	e0 03 15 aa	mov	x0, x21
   3be68:	3e 66 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3be6c:	00 00 80 d2	mov	x0, #0x0
   3be70:	b6 61 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3be74:	fc 03 00 91	mov	x28, sp
   3be78:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3be7c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3be80:	e9 03 08 aa	mov	x9, x8
   3be84:	50 37 00 b0	adrp	x16, 1769 ; 0x724000
   3be88:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3be8c:	00 02 3f d6	blr	x16
   3be90:	e9 03 00 91	mov	x9, sp
   3be94:	08 3d 00 91	add	x8, x8, #0xf
   3be98:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3be9c:	35 01 08 cb	sub	x21, x9, x8
   3bea0:	bf 02 00 91	mov	sp, x21
   3bea4:	e8 03 15 aa	mov	x8, x21
   3bea8:	a5 61 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3beac:	e0 03 18 aa	mov	x0, x24
   3beb0:	e1 03 19 aa	mov	x1, x25
   3beb4:	e2 03 15 aa	mov	x2, x21
   3beb8:	9e 61 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3bebc:	f7 03 00 aa	mov	x23, x0
   3bec0:	f5 03 01 aa	mov	x21, x1
   3bec4:	e0 03 18 aa	mov	x0, x24
   3bec8:	e1 03 19 aa	mov	x1, x25
   3becc:	f3 45 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3bed0:	9f 03 00 91	mov	sp, x28
   3bed4:	55 11 00 b4	cbz	x21, 0x3c0fc
   3bed8:	e0 03 1a aa	mov	x0, x26
   3bedc:	d5 66 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3bee0:	e0 03 16 aa	mov	x0, x22
   3bee4:	be 66 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bee8:	e0 03 14 aa	mov	x0, x20
   3beec:	bc 66 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3bef0:	fb 03 17 aa	mov	x27, x23
   3bef4:	8c 00 00 14	b	0x3c124
   3bef8:	f4 03 00 aa	mov	x20, x0
   3befc:	48 38 00 d0	adrp	x8, 1802 ; 0x745000
   3bf00:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   3bf04:	1f 05 00 b1	cmn	x8, #0x1
   3bf08:	41 ee 00 54	b.ne	0x3dcd0
   3bf0c:	48 38 00 b0	adrp	x8, 1801 ; 0x744000
   3bf10:	08 a1 39 91	add	x8, x8, #0xe68
   3bf14:	00 05 40 a9	ldp	x0, x1, [x8]
   3bf18:	ad dc ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3bf1c:	28 fc 7c d3	lsr	x8, x1, #60
   3bf20:	1f 39 00 f1	cmp	x8, #0xe
   3bf24:	09 12 00 54	b.ls	0x3c164
   3bf28:	bb 04 80 d2	mov	x27, #0x25
   3bf2c:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3bf30:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3bf34:	08 01 37 91	add	x8, x8, #0xdc0 ; literal pool for: "Install key agreement key not found"
   3bf38:	08 81 00 d1	sub	x8, x8, #0x20
   3bf3c:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3bf40:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3bf44:	00 c0 12 91	add	x0, x0, #0x4b0
   3bf48:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3bf4c:	21 a0 1c 91	add	x1, x1, #0x728
   3bf50:	57 a1 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3bf54:	01 0a 80 52	mov	w1, #0x50
   3bf58:	e2 00 80 52	mov	w2, #0x7
   3bf5c:	94 66 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3bf60:	f5 03 00 aa	mov	x21, x0
   3bf64:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3bf68:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3bf6c:	00 04 80 3d	str	q0, [x0, #0x10]
   3bf70:	a8 4c 8e d2	mov	x8, #0x7265
   3bf74:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3bf78:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3bf7c:	f6 03 00 aa	mov	x22, x0
   3bf80:	c8 0e 02 f8	str	x8, [x22, #0x20]!
   3bf84:	57 37 00 b0	adrp	x23, 1769 ; 0x724000
   3bf88:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   3bf8c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3bf90:	17 24 00 f9	str	x23, [x0, #0x48]
   3bf94:	69 0b 00 d1	sub	x9, x27, #0x2
   3bf98:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3bf9c:	14 1c 00 f9	str	x20, [x0, #0x38]
   3bfa0:	dd 45 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3bfa4:	f4 03 00 aa	mov	x20, x0
   3bfa8:	e0 03 15 aa	mov	x0, x21
   3bfac:	cb 66 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3bfb0:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3bfb4:	21 e0 12 91	add	x1, x1, #0x4b8
   3bfb8:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3bfbc:	42 c0 1c 91	add	x2, x2, #0x730
   3bfc0:	e0 03 16 aa	mov	x0, x22
   3bfc4:	93 4e 00 94	bl	_$sypSgWOhTm
   3bfc8:	e0 03 15 aa	mov	x0, x21
   3bfcc:	01 04 80 52	mov	w1, #0x20
   3bfd0:	e2 00 80 52	mov	w2, #0x7
   3bfd4:	8e 66 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3bfd8:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3bfdc:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3bfe0:	dd 65 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3bfe4:	f5 03 00 aa	mov	x21, x0
   3bfe8:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3bfec:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3bff0:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3bff4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3bff8:	02 21 00 91	add	x2, x8, #0x8
   3bffc:	e0 03 14 aa	mov	x0, x20
   3c000:	e1 03 17 aa	mov	x1, x23
   3c004:	39 61 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3c008:	f6 03 00 aa	mov	x22, x0
   3c00c:	bf 03 15 f8	stur	xzr, [x29, #-0xb0]
   3c010:	a4 c3 02 d1	sub	x4, x29, #0xb0
   3c014:	e0 03 15 aa	mov	x0, x21
   3c018:	e2 03 16 aa	mov	x2, x22
   3c01c:	03 00 80 d2	mov	x3, #0x0
   3c020:	20 6d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3c024:	fd 03 1d aa	mov	x29, x29
   3c028:	d4 65 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3c02c:	f5 03 00 aa	mov	x21, x0
   3c030:	e0 03 16 aa	mov	x0, x22
   3c034:	cb 65 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c038:	a0 03 55 f8	ldur	x0, [x29, #-0xb0]
   3c03c:	cc 65 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3c040:	15 22 00 b4	cbz	x21, 0x3c480
   3c044:	e0 03 15 aa	mov	x0, x21
   3c048:	47 60 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3c04c:	f7 03 00 aa	mov	x23, x0
   3c050:	f8 03 01 aa	mov	x24, x1
   3c054:	e0 03 15 aa	mov	x0, x21
   3c058:	c2 65 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c05c:	00 00 80 d2	mov	x0, #0x0
   3c060:	3a 61 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3c064:	f9 03 00 91	mov	x25, sp
   3c068:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3c06c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3c070:	e9 03 08 aa	mov	x9, x8
   3c074:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c078:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c07c:	00 02 3f d6	blr	x16
   3c080:	e9 03 00 91	mov	x9, sp
   3c084:	08 3d 00 91	add	x8, x8, #0xf
   3c088:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c08c:	35 01 08 cb	sub	x21, x9, x8
   3c090:	bf 02 00 91	mov	sp, x21
   3c094:	e8 03 15 aa	mov	x8, x21
   3c098:	29 61 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3c09c:	e0 03 17 aa	mov	x0, x23
   3c0a0:	e1 03 18 aa	mov	x1, x24
   3c0a4:	e2 03 15 aa	mov	x2, x21
   3c0a8:	22 61 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3c0ac:	f6 03 00 aa	mov	x22, x0
   3c0b0:	f5 03 01 aa	mov	x21, x1
   3c0b4:	e0 03 17 aa	mov	x0, x23
   3c0b8:	e1 03 18 aa	mov	x1, x24
   3c0bc:	77 45 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3c0c0:	3f 03 00 91	mov	sp, x25
   3c0c4:	15 1f 00 b4	cbz	x21, 0x3c4a4
   3c0c8:	e0 03 14 aa	mov	x0, x20
   3c0cc:	44 66 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c0d0:	fb 03 16 aa	mov	x27, x22
   3c0d4:	14 00 00 14	b	0x3c124
   3c0d8:	f5 03 00 aa	mov	x21, x0
   3c0dc:	e6 5f 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3c0e0:	f7 03 00 aa	mov	x23, x0
   3c0e4:	e0 03 15 aa	mov	x0, x21
   3c0e8:	9e 65 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c0ec:	f5 03 17 aa	mov	x21, x23
   3c0f0:	83 66 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3c0f4:	e0 03 17 aa	mov	x0, x23
   3c0f8:	4e 66 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3c0fc:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c100:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3c104:	08 81 00 d1	sub	x8, x8, #0x20
   3c108:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3c10c:	e0 03 1a aa	mov	x0, x26
   3c110:	48 66 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3c114:	e0 03 16 aa	mov	x0, x22
   3c118:	31 66 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c11c:	e0 03 14 aa	mov	x0, x20
   3c120:	2f 66 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c124:	a8 83 59 f8	ldur	x8, [x29, #-0x68]
   3c128:	49 37 00 90	adrp	x9, 1768 ; 0x724000
   3c12c:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3c130:	29 01 40 f9	ldr	x9, [x9]
   3c134:	3f 01 08 eb	cmp	x9, x8
   3c138:	01 b9 01 54	b.ne	0x3f858
   3c13c:	e0 03 1b aa	mov	x0, x27
   3c140:	e1 03 15 aa	mov	x1, x21
   3c144:	bf 43 01 d1	sub	sp, x29, #0x50
   3c148:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   3c14c:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   3c150:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   3c154:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   3c158:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   3c15c:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   3c160:	c0 03 5f d6	ret
   3c164:	f7 03 00 aa	mov	x23, x0
   3c168:	f6 03 01 aa	mov	x22, x1
   3c16c:	48 38 00 b0	adrp	x8, 1801 ; 0x745000
   3c170:	08 01 41 f9	ldr	x8, [x8, #0x200]
   3c174:	1f 05 00 b1	cmn	x8, #0x1
   3c178:	c1 f4 00 54	b.ne	0x3e010
   3c17c:	48 38 00 90	adrp	x8, 1800 ; 0x744000
   3c180:	08 e1 39 91	add	x8, x8, #0xe78
   3c184:	00 05 40 a9	ldp	x0, x1, [x8]
   3c188:	11 dc ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3c18c:	28 fc 7c d3	lsr	x8, x1, #60
   3c190:	1f 39 00 f1	cmp	x8, #0xe
   3c194:	09 0e 00 54	b.ls	0x3c354
   3c198:	bb 04 80 d2	mov	x27, #0x25
   3c19c:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3c1a0:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c1a4:	08 c1 37 91	add	x8, x8, #0xdf0 ; literal pool for: "Wrapped DK not found"
   3c1a8:	08 81 00 d1	sub	x8, x8, #0x20
   3c1ac:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3c1b0:	20 38 00 b0	adrp	x0, 1797 ; 0x741000
   3c1b4:	00 c0 12 91	add	x0, x0, #0x4b0
   3c1b8:	61 27 00 d0	adrp	x1, 1262 ; 0x52a000
   3c1bc:	21 a0 1c 91	add	x1, x1, #0x728
   3c1c0:	bb a0 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3c1c4:	01 0a 80 52	mov	w1, #0x50
   3c1c8:	e2 00 80 52	mov	w2, #0x7
   3c1cc:	f8 65 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c1d0:	f5 03 00 aa	mov	x21, x0
   3c1d4:	68 27 00 d0	adrp	x8, 1262 ; 0x52a000
   3c1d8:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3c1dc:	00 04 80 3d	str	q0, [x0, #0x10]
   3c1e0:	a8 4c 8e d2	mov	x8, #0x7265
   3c1e4:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3c1e8:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3c1ec:	f8 03 00 aa	mov	x24, x0
   3c1f0:	08 0f 02 f8	str	x8, [x24, #0x20]!
   3c1f4:	59 37 00 90	adrp	x25, 1768 ; 0x724000
   3c1f8:	39 27 41 f9	ldr	x25, [x25, #0x248] ; literal pool symbol address: _$sSSN
   3c1fc:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3c200:	19 24 00 f9	str	x25, [x0, #0x48]
   3c204:	69 47 00 d1	sub	x9, x27, #0x11
   3c208:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3c20c:	14 1c 00 f9	str	x20, [x0, #0x38]
   3c210:	41 45 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3c214:	f4 03 00 aa	mov	x20, x0
   3c218:	e0 03 15 aa	mov	x0, x21
   3c21c:	2f 66 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3c220:	21 38 00 b0	adrp	x1, 1797 ; 0x741000
   3c224:	21 e0 12 91	add	x1, x1, #0x4b8
   3c228:	62 27 00 d0	adrp	x2, 1262 ; 0x52a000
   3c22c:	42 c0 1c 91	add	x2, x2, #0x730
   3c230:	e0 03 18 aa	mov	x0, x24
   3c234:	f7 4d 00 94	bl	_$sypSgWOhTm
   3c238:	e0 03 15 aa	mov	x0, x21
   3c23c:	01 04 80 52	mov	w1, #0x20
   3c240:	e2 00 80 52	mov	w2, #0x7
   3c244:	f2 65 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3c248:	28 38 00 b0	adrp	x8, 1797 ; 0x741000
   3c24c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3c250:	41 65 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3c254:	f5 03 00 aa	mov	x21, x0
   3c258:	48 37 00 90	adrp	x8, 1768 ; 0x724000
   3c25c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3c260:	43 37 00 90	adrp	x3, 1768 ; 0x724000
   3c264:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3c268:	02 21 00 91	add	x2, x8, #0x8
   3c26c:	e0 03 14 aa	mov	x0, x20
   3c270:	e1 03 19 aa	mov	x1, x25
   3c274:	9d 60 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3c278:	f8 03 00 aa	mov	x24, x0
   3c27c:	bf 03 15 f8	stur	xzr, [x29, #-0xb0]
   3c280:	a4 c3 02 d1	sub	x4, x29, #0xb0
   3c284:	e0 03 15 aa	mov	x0, x21
   3c288:	e2 03 18 aa	mov	x2, x24
   3c28c:	03 00 80 d2	mov	x3, #0x0
   3c290:	84 6c 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3c294:	fd 03 1d aa	mov	x29, x29
   3c298:	38 65 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3c29c:	f5 03 00 aa	mov	x21, x0
   3c2a0:	e0 03 18 aa	mov	x0, x24
   3c2a4:	2f 65 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c2a8:	a0 03 55 f8	ldur	x0, [x29, #-0xb0]
   3c2ac:	30 65 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3c2b0:	95 15 00 b4	cbz	x21, 0x3c560
   3c2b4:	e0 03 15 aa	mov	x0, x21
   3c2b8:	ab 5f 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3c2bc:	f9 03 00 aa	mov	x25, x0
   3c2c0:	fa 03 01 aa	mov	x26, x1
   3c2c4:	e0 03 15 aa	mov	x0, x21
   3c2c8:	26 65 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c2cc:	00 00 80 d2	mov	x0, #0x0
   3c2d0:	9e 60 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3c2d4:	fc 03 00 91	mov	x28, sp
   3c2d8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3c2dc:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3c2e0:	e9 03 08 aa	mov	x9, x8
   3c2e4:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c2e8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c2ec:	00 02 3f d6	blr	x16
   3c2f0:	e9 03 00 91	mov	x9, sp
   3c2f4:	08 3d 00 91	add	x8, x8, #0xf
   3c2f8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c2fc:	35 01 08 cb	sub	x21, x9, x8
   3c300:	bf 02 00 91	mov	sp, x21
   3c304:	e8 03 15 aa	mov	x8, x21
   3c308:	8d 60 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3c30c:	e0 03 19 aa	mov	x0, x25
   3c310:	e1 03 1a aa	mov	x1, x26
   3c314:	e2 03 15 aa	mov	x2, x21
   3c318:	86 60 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3c31c:	f8 03 00 aa	mov	x24, x0
   3c320:	f5 03 01 aa	mov	x21, x1
   3c324:	e0 03 19 aa	mov	x0, x25
   3c328:	e1 03 1a aa	mov	x1, x26
   3c32c:	db 44 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3c330:	9f 03 00 91	mov	sp, x28
   3c334:	95 12 00 b4	cbz	x21, 0x3c584
   3c338:	e0 03 17 aa	mov	x0, x23
   3c33c:	e1 03 16 aa	mov	x1, x22
   3c340:	ca 4d 00 94	bl	0x4fa68
   3c344:	e0 03 14 aa	mov	x0, x20
   3c348:	a5 65 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c34c:	fb 03 18 aa	mov	x27, x24
   3c350:	75 ff ff 17	b	0x3c124
   3c354:	f9 03 01 aa	mov	x25, x1
   3c358:	88 1e 00 12	and	w8, w20, #0xff
   3c35c:	1f 05 00 71	cmp	w8, #0x1
   3c360:	60 92 00 f9	str	x0, [x19, #0x120]
   3c364:	e1 0a 00 54	b.ne	0x3c4c0
   3c368:	40 03 80 52	mov	w0, #0x1a
   3c36c:	01 00 80 d2	mov	x1, #0x0
   3c370:	02 00 80 d2	mov	x2, #0x0
   3c374:	f6 60 13 94	bl	0x51474c ; symbol stub for: _$ss26_stdlib_isOSVersionAtLeastyBi1_Bw_BwBwtF
   3c378:	60 11 00 36	tbz	w0, #0x0, 0x3c5a4
   3c37c:	79 8e 00 f9	str	x25, [x19, #0x118]
   3c380:	00 00 80 d2	mov	x0, #0x0
   3c384:	fc 5f 13 94	bl	0x514374 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyVMa
   3c388:	f4 03 00 aa	mov	x20, x0
   3c38c:	f9 03 00 91	mov	x25, sp
   3c390:	1b 80 5f f8	ldur	x27, [x0, #-0x8]
   3c394:	68 23 40 f9	ldr	x8, [x27, #0x40]
   3c398:	e9 03 08 aa	mov	x9, x8
   3c39c:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c3a0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c3a4:	00 02 3f d6	blr	x16
   3c3a8:	e9 03 00 91	mov	x9, sp
   3c3ac:	08 3d 00 91	add	x8, x8, #0xf
   3c3b0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c3b4:	3c 01 08 cb	sub	x28, x9, x8
   3c3b8:	9f 03 00 91	mov	sp, x28
   3c3bc:	b7 5b 35 a9	stp	x23, x22, [x29, #-0xb0]
   3c3c0:	e0 03 17 aa	mov	x0, x23
   3c3c4:	e1 03 16 aa	mov	x1, x22
   3c3c8:	81 45 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3c3cc:	1a 49 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   3c3d0:	f8 03 00 aa	mov	x24, x0
   3c3d4:	42 37 00 90	adrp	x2, 1768 ; 0x724000
   3c3d8:	42 18 40 f9	ldr	x2, [x2, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3c3dc:	a0 c3 02 d1	sub	x0, x29, #0xb0
   3c3e0:	e8 03 1c aa	mov	x8, x28
   3c3e4:	01 00 80 d2	mov	x1, #0x0
   3c3e8:	e3 03 18 aa	mov	x3, x24
   3c3ec:	f5 03 1a aa	mov	x21, x26
   3c3f0:	de 5f 13 94	bl	0x514368 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV18dataRepresentation21authenticationContextAGx_So9LAContextCSgtKc10Foundation12DataProtocolRzlufC
   3c3f4:	fa 03 15 aa	mov	x26, x21
   3c3f8:	75 1f 00 b5	cbnz	x21, 0x3c7e4
   3c3fc:	7c de 0f a9	stp	x28, x23, [x19, #0xf8]
   3c400:	79 8a 00 f9	str	x25, [x19, #0x110]
   3c404:	7b d2 0e a9	stp	x27, x20, [x19, #0xe8]
   3c408:	00 00 80 d2	mov	x0, #0x0
   3c40c:	f6 5e 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   3c410:	01 30 40 b9	ldr	w1, [x0, #0x30]
   3c414:	02 68 40 79	ldrh	w2, [x0, #0x34]
   3c418:	65 65 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c41c:	f4 03 00 aa	mov	x20, x0
   3c420:	ee 5e 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   3c424:	f4 03 00 aa	mov	x20, x0
   3c428:	64 49 00 94	bl	_$s16AsideNativeSwift11WrappedDkPqVACSeAAWl
   3c42c:	e4 03 00 aa	mov	x4, x0
   3c430:	40 37 00 90	adrp	x0, 1768 ; 0x724000
   3c434:	00 e0 35 91	add	x0, x0, #0xd78
   3c438:	a8 c3 02 d1	sub	x8, x29, #0xb0
   3c43c:	79 f2 51 a9	ldp	x25, x28, [x19, #0x118]
   3c440:	e1 03 1c aa	mov	x1, x28
   3c444:	e2 03 19 aa	mov	x2, x25
   3c448:	e3 03 00 aa	mov	x3, x0
   3c44c:	f5 03 1a aa	mov	x21, x26
   3c450:	df 5e 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   3c454:	fa 03 15 aa	mov	x26, x21
   3c458:	15 28 00 b4	cbz	x21, 0x3c958
   3c45c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3c460:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3c464:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3c468:	00 01 3f d6	blr	x8
   3c46c:	60 82 40 f9	ldr	x0, [x19, #0x100]
   3c470:	e1 03 16 aa	mov	x1, x22
   3c474:	7d 4d 00 94	bl	0x4fa68
   3c478:	e0 03 1c aa	mov	x0, x28
   3c47c:	30 01 00 14	b	0x3c93c
   3c480:	f5 03 00 aa	mov	x21, x0
   3c484:	fc 5e 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3c488:	f6 03 00 aa	mov	x22, x0
   3c48c:	e0 03 15 aa	mov	x0, x21
   3c490:	b4 64 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c494:	f5 03 16 aa	mov	x21, x22
   3c498:	99 65 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3c49c:	e0 03 16 aa	mov	x0, x22
   3c4a0:	64 65 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3c4a4:	e0 03 14 aa	mov	x0, x20
   3c4a8:	4d 65 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c4ac:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c4b0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3c4b4:	08 81 00 d1	sub	x8, x8, #0x20
   3c4b8:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3c4bc:	1a ff ff 17	b	0x3c124
   3c4c0:	88 1e 18 12	and	w8, w20, #0xff00
   3c4c4:	1f 01 04 71	cmp	w8, #0x100
   3c4c8:	81 15 00 54	b.ne	0x3c778
   3c4cc:	00 00 80 d2	mov	x0, #0x0
   3c4d0:	d3 5f 13 94	bl	0x51441c ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0VMa
   3c4d4:	fb 03 00 aa	mov	x27, x0
   3c4d8:	fc 03 00 91	mov	x28, sp
   3c4dc:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   3c4e0:	08 23 40 f9	ldr	x8, [x24, #0x40]
   3c4e4:	e9 03 08 aa	mov	x9, x8
   3c4e8:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c4ec:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c4f0:	00 02 3f d6	blr	x16
   3c4f4:	e9 03 00 91	mov	x9, sp
   3c4f8:	08 3d 00 91	add	x8, x8, #0xf
   3c4fc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c500:	34 01 08 cb	sub	x20, x9, x8
   3c504:	9f 02 00 91	mov	sp, x20
   3c508:	b7 5b 35 a9	stp	x23, x22, [x29, #-0xb0]
   3c50c:	e0 03 17 aa	mov	x0, x23
   3c510:	e1 03 16 aa	mov	x1, x22
   3c514:	2e 45 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3c518:	41 37 00 90	adrp	x1, 1768 ; 0x724000
   3c51c:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3c520:	42 37 00 90	adrp	x2, 1768 ; 0x724000
   3c524:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3c528:	a0 c3 02 d1	sub	x0, x29, #0xb0
   3c52c:	e8 03 14 aa	mov	x8, x20
   3c530:	f5 03 1a aa	mov	x21, x26
   3c534:	b4 5f 13 94	bl	0x514404 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V17rawRepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   3c538:	fa 03 15 aa	mov	x26, x21
   3c53c:	35 16 00 b4	cbz	x21, 0x3c800
   3c540:	e0 03 17 aa	mov	x0, x23
   3c544:	e1 03 16 aa	mov	x1, x22
   3c548:	48 4d 00 94	bl	0x4fa68
   3c54c:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3c550:	e1 03 19 aa	mov	x1, x25
   3c554:	45 4d 00 94	bl	0x4fa68
   3c558:	9f 03 00 91	mov	sp, x28
   3c55c:	df fd ff 17	b	0x3bcd8
   3c560:	f5 03 00 aa	mov	x21, x0
   3c564:	c4 5e 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3c568:	f8 03 00 aa	mov	x24, x0
   3c56c:	e0 03 15 aa	mov	x0, x21
   3c570:	7c 64 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c574:	f5 03 18 aa	mov	x21, x24
   3c578:	61 65 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3c57c:	e0 03 18 aa	mov	x0, x24
   3c580:	2c 65 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3c584:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c588:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3c58c:	08 81 00 d1	sub	x8, x8, #0x20
   3c590:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3c594:	e0 03 17 aa	mov	x0, x23
   3c598:	e1 03 16 aa	mov	x1, x22
   3c59c:	33 4d 00 94	bl	0x4fa68
   3c5a0:	df fe ff 17	b	0x3c11c
   3c5a4:	76 86 00 f9	str	x22, [x19, #0x108]
   3c5a8:	f6 03 17 aa	mov	x22, x23
   3c5ac:	f7 03 19 aa	mov	x23, x25
   3c5b0:	bb 04 80 d2	mov	x27, #0x25
   3c5b4:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3c5b8:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c5bc:	08 c1 35 91	add	x8, x8, #0xd70 ; literal pool for: "pq_v1 installation requires macOS 26 or newer"
   3c5c0:	08 81 00 d1	sub	x8, x8, #0x20
   3c5c4:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3c5c8:	20 38 00 b0	adrp	x0, 1797 ; 0x741000
   3c5cc:	00 c0 12 91	add	x0, x0, #0x4b0
   3c5d0:	61 27 00 d0	adrp	x1, 1262 ; 0x52a000
   3c5d4:	21 a0 1c 91	add	x1, x1, #0x728
   3c5d8:	b5 9f ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3c5dc:	01 0a 80 52	mov	w1, #0x50
   3c5e0:	e2 00 80 52	mov	w2, #0x7
   3c5e4:	f2 64 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c5e8:	f5 03 00 aa	mov	x21, x0
   3c5ec:	68 27 00 d0	adrp	x8, 1262 ; 0x52a000
   3c5f0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3c5f4:	00 04 80 3d	str	q0, [x0, #0x10]
   3c5f8:	a8 4c 8e d2	mov	x8, #0x7265
   3c5fc:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3c600:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3c604:	fa 03 00 aa	mov	x26, x0
   3c608:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3c60c:	5c 37 00 90	adrp	x28, 1768 ; 0x724000
   3c610:	9c 27 41 f9	ldr	x28, [x28, #0x248] ; literal pool symbol address: _$sSSN
   3c614:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3c618:	1c 24 00 f9	str	x28, [x0, #0x48]
   3c61c:	69 03 7d b2	orr	x9, x27, #0x8
   3c620:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3c624:	14 1c 00 f9	str	x20, [x0, #0x38]
   3c628:	3b 44 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3c62c:	f4 03 00 aa	mov	x20, x0
   3c630:	e0 03 15 aa	mov	x0, x21
   3c634:	29 65 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3c638:	21 38 00 b0	adrp	x1, 1797 ; 0x741000
   3c63c:	21 e0 12 91	add	x1, x1, #0x4b8
   3c640:	62 27 00 d0	adrp	x2, 1262 ; 0x52a000
   3c644:	42 c0 1c 91	add	x2, x2, #0x730
   3c648:	e0 03 1a aa	mov	x0, x26
   3c64c:	f1 4c 00 94	bl	_$sypSgWOhTm
   3c650:	e0 03 15 aa	mov	x0, x21
   3c654:	01 04 80 52	mov	w1, #0x20
   3c658:	e2 00 80 52	mov	w2, #0x7
   3c65c:	ec 64 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3c660:	28 38 00 b0	adrp	x8, 1797 ; 0x741000
   3c664:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3c668:	3b 64 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3c66c:	f5 03 00 aa	mov	x21, x0
   3c670:	48 37 00 90	adrp	x8, 1768 ; 0x724000
   3c674:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3c678:	43 37 00 90	adrp	x3, 1768 ; 0x724000
   3c67c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3c680:	02 21 00 91	add	x2, x8, #0x8
   3c684:	e0 03 14 aa	mov	x0, x20
   3c688:	e1 03 1c aa	mov	x1, x28
   3c68c:	97 5f 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3c690:	fa 03 00 aa	mov	x26, x0
   3c694:	bf 03 15 f8	stur	xzr, [x29, #-0xb0]
   3c698:	a4 c3 02 d1	sub	x4, x29, #0xb0
   3c69c:	e0 03 15 aa	mov	x0, x21
   3c6a0:	e2 03 1a aa	mov	x2, x26
   3c6a4:	03 00 80 d2	mov	x3, #0x0
   3c6a8:	7e 6b 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3c6ac:	fd 03 1d aa	mov	x29, x29
   3c6b0:	32 64 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3c6b4:	f5 03 00 aa	mov	x21, x0
   3c6b8:	e0 03 1a aa	mov	x0, x26
   3c6bc:	29 64 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c6c0:	a0 03 55 f8	ldur	x0, [x29, #-0xb0]
   3c6c4:	2a 64 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3c6c8:	75 0d 00 b4	cbz	x21, 0x3c874
   3c6cc:	e0 03 15 aa	mov	x0, x21
   3c6d0:	a5 5e 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3c6d4:	fc 03 00 aa	mov	x28, x0
   3c6d8:	f9 03 01 aa	mov	x25, x1
   3c6dc:	e0 03 15 aa	mov	x0, x21
   3c6e0:	20 64 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c6e4:	00 00 80 d2	mov	x0, #0x0
   3c6e8:	98 5f 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3c6ec:	f8 03 00 91	mov	x24, sp
   3c6f0:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3c6f4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3c6f8:	e9 03 08 aa	mov	x9, x8
   3c6fc:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c700:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c704:	00 02 3f d6	blr	x16
   3c708:	e9 03 00 91	mov	x9, sp
   3c70c:	08 3d 00 91	add	x8, x8, #0xf
   3c710:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c714:	35 01 08 cb	sub	x21, x9, x8
   3c718:	bf 02 00 91	mov	sp, x21
   3c71c:	e8 03 15 aa	mov	x8, x21
   3c720:	87 5f 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3c724:	e0 03 1c aa	mov	x0, x28
   3c728:	e1 03 19 aa	mov	x1, x25
   3c72c:	e2 03 15 aa	mov	x2, x21
   3c730:	80 5f 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3c734:	fa 03 00 aa	mov	x26, x0
   3c738:	f5 03 01 aa	mov	x21, x1
   3c73c:	e0 03 1c aa	mov	x0, x28
   3c740:	e1 03 19 aa	mov	x1, x25
   3c744:	d5 43 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3c748:	1f 03 00 91	mov	sp, x24
   3c74c:	75 0a 00 b4	cbz	x21, 0x3c898
   3c750:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3c754:	e1 03 17 aa	mov	x1, x23
   3c758:	c4 4c 00 94	bl	0x4fa68
   3c75c:	e0 03 16 aa	mov	x0, x22
   3c760:	61 86 40 f9	ldr	x1, [x19, #0x108]
   3c764:	c1 4c 00 94	bl	0x4fa68
   3c768:	e0 03 14 aa	mov	x0, x20
   3c76c:	9c 64 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3c770:	fb 03 1a aa	mov	x27, x26
   3c774:	6c fe ff 17	b	0x3c124
   3c778:	79 8e 00 f9	str	x25, [x19, #0x118]
   3c77c:	00 00 80 d2	mov	x0, #0x0
   3c780:	c7 5e 13 94	bl	0x51429c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0VMa
   3c784:	f4 03 00 aa	mov	x20, x0
   3c788:	f9 03 00 91	mov	x25, sp
   3c78c:	1c 80 5f f8	ldur	x28, [x0, #-0x8]
   3c790:	88 23 40 f9	ldr	x8, [x28, #0x40]
   3c794:	e9 03 08 aa	mov	x9, x8
   3c798:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3c79c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3c7a0:	00 02 3f d6	blr	x16
   3c7a4:	e9 03 00 91	mov	x9, sp
   3c7a8:	08 3d 00 91	add	x8, x8, #0xf
   3c7ac:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3c7b0:	38 01 08 cb	sub	x24, x9, x8
   3c7b4:	1f 03 00 91	mov	sp, x24
   3c7b8:	e0 03 17 aa	mov	x0, x23
   3c7bc:	e1 03 16 aa	mov	x1, x22
   3c7c0:	83 44 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3c7c4:	e8 03 18 aa	mov	x8, x24
   3c7c8:	e0 03 17 aa	mov	x0, x23
   3c7cc:	e1 03 16 aa	mov	x1, x22
   3c7d0:	02 00 80 d2	mov	x2, #0x0
   3c7d4:	f5 03 1a aa	mov	x21, x26
   3c7d8:	ab 5e 13 94	bl	0x514284 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V18dataRepresentation21authenticationContextAI10Foundation4DataV_So9LAContextCSgtKcfC
   3c7dc:	fa 03 15 aa	mov	x26, x21
   3c7e0:	15 07 00 b4	cbz	x21, 0x3c8c0
   3c7e4:	e0 03 17 aa	mov	x0, x23
   3c7e8:	e1 03 16 aa	mov	x1, x22
   3c7ec:	9f 4c 00 94	bl	0x4fa68
   3c7f0:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3c7f4:	9d 4c 00 94	bl	0x4fa68
   3c7f8:	3f 03 00 91	mov	sp, x25
   3c7fc:	37 fd ff 17	b	0x3bcd8
   3c800:	74 de 0f a9	stp	x20, x23, [x19, #0xf8]
   3c804:	78 ee 0e a9	stp	x24, x27, [x19, #0xe8]
   3c808:	7c 8a 00 f9	str	x28, [x19, #0x110]
   3c80c:	00 00 80 d2	mov	x0, #0x0
   3c810:	f5 5d 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   3c814:	01 30 40 b9	ldr	w1, [x0, #0x30]
   3c818:	02 68 40 79	ldrh	w2, [x0, #0x34]
   3c81c:	64 64 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c820:	f4 03 00 aa	mov	x20, x0
   3c824:	ed 5d 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   3c828:	f4 03 00 aa	mov	x20, x0
   3c82c:	73 48 00 94	bl	_$s16AsideNativeSwift13WrappedDkP256VACSeAAWl
   3c830:	e4 03 00 aa	mov	x4, x0
   3c834:	40 37 00 90	adrp	x0, 1768 ; 0x724000
   3c838:	00 60 31 91	add	x0, x0, #0xc58
   3c83c:	a8 c3 02 d1	sub	x8, x29, #0xb0
   3c840:	61 92 40 f9	ldr	x1, [x19, #0x120]
   3c844:	e2 03 19 aa	mov	x2, x25
   3c848:	e3 03 00 aa	mov	x3, x0
   3c84c:	f5 03 1a aa	mov	x21, x26
   3c850:	df 5d 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   3c854:	fa 03 15 aa	mov	x26, x21
   3c858:	b5 18 00 b4	cbz	x21, 0x3cb6c
   3c85c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3c860:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3c864:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3c868:	00 01 3f d6	blr	x8
   3c86c:	60 82 40 f9	ldr	x0, [x19, #0x100]
   3c870:	30 00 00 14	b	0x3c930
   3c874:	f5 03 00 aa	mov	x21, x0
   3c878:	ff 5d 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3c87c:	f9 03 00 aa	mov	x25, x0
   3c880:	e0 03 15 aa	mov	x0, x21
   3c884:	b7 63 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3c888:	f5 03 19 aa	mov	x21, x25
   3c88c:	9c 64 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3c890:	e0 03 19 aa	mov	x0, x25
   3c894:	67 64 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3c898:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c89c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3c8a0:	08 81 00 d1	sub	x8, x8, #0x20
   3c8a4:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3c8a8:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3c8ac:	e1 03 17 aa	mov	x1, x23
   3c8b0:	6e 4c 00 94	bl	0x4fa68
   3c8b4:	e0 03 16 aa	mov	x0, x22
   3c8b8:	61 86 40 f9	ldr	x1, [x19, #0x108]
   3c8bc:	38 ff ff 17	b	0x3c59c
   3c8c0:	79 8a 00 f9	str	x25, [x19, #0x110]
   3c8c4:	7c d2 0e a9	stp	x28, x20, [x19, #0xe8]
   3c8c8:	78 7e 00 f9	str	x24, [x19, #0xf8]
   3c8cc:	00 00 80 d2	mov	x0, #0x0
   3c8d0:	c5 5d 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   3c8d4:	01 30 40 b9	ldr	w1, [x0, #0x30]
   3c8d8:	02 68 40 79	ldrh	w2, [x0, #0x34]
   3c8dc:	34 64 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c8e0:	f4 03 00 aa	mov	x20, x0
   3c8e4:	bd 5d 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   3c8e8:	f4 03 00 aa	mov	x20, x0
   3c8ec:	43 48 00 94	bl	_$s16AsideNativeSwift13WrappedDkP256VACSeAAWl
   3c8f0:	e4 03 00 aa	mov	x4, x0
   3c8f4:	40 37 00 90	adrp	x0, 1768 ; 0x724000
   3c8f8:	00 60 31 91	add	x0, x0, #0xc58
   3c8fc:	a8 c3 02 d1	sub	x8, x29, #0xb0
   3c900:	79 86 51 a9	ldp	x25, x1, [x19, #0x118]
   3c904:	e2 03 19 aa	mov	x2, x25
   3c908:	e3 03 00 aa	mov	x3, x0
   3c90c:	f5 03 1a aa	mov	x21, x26
   3c910:	af 5d 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   3c914:	fa 03 15 aa	mov	x26, x21
   3c918:	55 23 00 b4	cbz	x21, 0x3cd80
   3c91c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3c920:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3c924:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3c928:	00 01 3f d6	blr	x8
   3c92c:	e0 03 17 aa	mov	x0, x23
   3c930:	e1 03 16 aa	mov	x1, x22
   3c934:	4d 4c 00 94	bl	0x4fa68
   3c938:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3c93c:	e1 03 19 aa	mov	x1, x25
   3c940:	4a 4c 00 94	bl	0x4fa68
   3c944:	e0 03 14 aa	mov	x0, x20
   3c948:	5b 64 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3c94c:	68 8a 40 f9	ldr	x8, [x19, #0x110]
   3c950:	1f 01 00 91	mov	sp, x8
   3c954:	e1 fc ff 17	b	0x3bcd8
   3c958:	e0 03 14 aa	mov	x0, x20
   3c95c:	56 64 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3c960:	a9 03 04 d1	sub	x9, x29, #0x100
   3c964:	20 85 43 ad	ldp	q0, q1, [x9, #0x70]
   3c968:	60 06 0c ad	stp	q0, q1, [x19, #0x180]
   3c96c:	a8 03 59 f8	ldur	x8, [x29, #-0x70]
   3c970:	68 d2 00 f9	str	x8, [x19, #0x1a0]
   3c974:	21 81 42 ad	ldp	q1, q0, [x9, #0x50]
   3c978:	61 02 0b ad	stp	q1, q0, [x19, #0x160]
   3c97c:	60 86 57 a9	ldp	x0, x1, [x19, #0x178]
   3c980:	02 00 80 d2	mov	x2, #0x0
   3c984:	e3 5d 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3c988:	28 fc 7c d3	lsr	x8, x1, #60
   3c98c:	1f 39 00 f1	cmp	x8, #0xe
   3c990:	77 82 40 f9	ldr	x23, [x19, #0x100]
   3c994:	09 30 00 54	b.ls	0x3cf94
   3c998:	bb 04 80 d2	mov	x27, #0x25
   3c99c:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3c9a0:	60 82 05 91	add	x0, x19, #0x160
   3c9a4:	cc 47 00 94	bl	0x4e8d4
   3c9a8:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3c9ac:	08 c1 3d 91	add	x8, x8, #0xf70 ; literal pool for: "Invalid wrapped DK encapsulated key"
   3c9b0:	08 81 00 d1	sub	x8, x8, #0x20
   3c9b4:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3c9b8:	20 38 00 b0	adrp	x0, 1797 ; 0x741000
   3c9bc:	00 c0 12 91	add	x0, x0, #0x4b0
   3c9c0:	61 27 00 d0	adrp	x1, 1262 ; 0x52a000
   3c9c4:	21 a0 1c 91	add	x1, x1, #0x728
   3c9c8:	b9 9e ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3c9cc:	01 0a 80 52	mov	w1, #0x50
   3c9d0:	e2 00 80 52	mov	w2, #0x7
   3c9d4:	f6 63 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3c9d8:	f5 03 00 aa	mov	x21, x0
   3c9dc:	68 27 00 d0	adrp	x8, 1262 ; 0x52a000
   3c9e0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3c9e4:	00 04 80 3d	str	q0, [x0, #0x10]
   3c9e8:	a8 4c 8e d2	mov	x8, #0x7265
   3c9ec:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3c9f0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3c9f4:	fa 03 00 aa	mov	x26, x0
   3c9f8:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3c9fc:	54 37 00 90	adrp	x20, 1768 ; 0x724000
   3ca00:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3ca04:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3ca08:	14 24 00 f9	str	x20, [x0, #0x48]
   3ca0c:	69 0b 00 d1	sub	x9, x27, #0x2
   3ca10:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3ca14:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3ca18:	3f 43 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3ca1c:	f8 03 00 aa	mov	x24, x0
   3ca20:	e0 03 15 aa	mov	x0, x21
   3ca24:	2d 64 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3ca28:	21 38 00 b0	adrp	x1, 1797 ; 0x741000
   3ca2c:	21 e0 12 91	add	x1, x1, #0x4b8
   3ca30:	62 27 00 d0	adrp	x2, 1262 ; 0x52a000
   3ca34:	42 c0 1c 91	add	x2, x2, #0x730
   3ca38:	e0 03 1a aa	mov	x0, x26
   3ca3c:	f5 4b 00 94	bl	_$sypSgWOhTm
   3ca40:	e0 03 15 aa	mov	x0, x21
   3ca44:	01 04 80 52	mov	w1, #0x20
   3ca48:	e2 00 80 52	mov	w2, #0x7
   3ca4c:	f0 63 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3ca50:	28 38 00 b0	adrp	x8, 1797 ; 0x741000
   3ca54:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3ca58:	3f 63 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3ca5c:	f5 03 00 aa	mov	x21, x0
   3ca60:	48 37 00 90	adrp	x8, 1768 ; 0x724000
   3ca64:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3ca68:	43 37 00 90	adrp	x3, 1768 ; 0x724000
   3ca6c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3ca70:	02 21 00 91	add	x2, x8, #0x8
   3ca74:	78 86 00 f9	str	x24, [x19, #0x108]
   3ca78:	e0 03 18 aa	mov	x0, x24
   3ca7c:	e1 03 14 aa	mov	x1, x20
   3ca80:	9a 5e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3ca84:	f4 03 00 aa	mov	x20, x0
   3ca88:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3ca8c:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3ca90:	e0 03 15 aa	mov	x0, x21
   3ca94:	e2 03 14 aa	mov	x2, x20
   3ca98:	03 00 80 d2	mov	x3, #0x0
   3ca9c:	81 6a 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3caa0:	fd 03 1d aa	mov	x29, x29
   3caa4:	35 63 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3caa8:	f5 03 00 aa	mov	x21, x0
   3caac:	e0 03 14 aa	mov	x0, x20
   3cab0:	2c 63 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3cab4:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3cab8:	2d 63 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3cabc:	35 38 00 b4	cbz	x21, 0x3d1c0
   3cac0:	e0 03 15 aa	mov	x0, x21
   3cac4:	a8 5d 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3cac8:	f4 03 00 aa	mov	x20, x0
   3cacc:	fc 03 01 aa	mov	x28, x1
   3cad0:	e0 03 15 aa	mov	x0, x21
   3cad4:	23 63 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3cad8:	00 00 80 d2	mov	x0, #0x0
   3cadc:	9b 5e 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3cae0:	f8 03 16 aa	mov	x24, x22
   3cae4:	f6 03 17 aa	mov	x22, x23
   3cae8:	f7 03 19 aa	mov	x23, x25
   3caec:	f9 03 00 91	mov	x25, sp
   3caf0:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3caf4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3caf8:	e9 03 08 aa	mov	x9, x8
   3cafc:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3cb00:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3cb04:	00 02 3f d6	blr	x16
   3cb08:	e9 03 00 91	mov	x9, sp
   3cb0c:	08 3d 00 91	add	x8, x8, #0xf
   3cb10:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3cb14:	35 01 08 cb	sub	x21, x9, x8
   3cb18:	bf 02 00 91	mov	sp, x21
   3cb1c:	e8 03 15 aa	mov	x8, x21
   3cb20:	87 5e 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3cb24:	e0 03 14 aa	mov	x0, x20
   3cb28:	e1 03 1c aa	mov	x1, x28
   3cb2c:	e2 03 15 aa	mov	x2, x21
   3cb30:	80 5e 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3cb34:	fa 03 00 aa	mov	x26, x0
   3cb38:	f5 03 01 aa	mov	x21, x1
   3cb3c:	e0 03 14 aa	mov	x0, x20
   3cb40:	e1 03 1c aa	mov	x1, x28
   3cb44:	d5 42 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3cb48:	3f 03 00 91	mov	sp, x25
   3cb4c:	f9 03 17 aa	mov	x25, x23
   3cb50:	f7 03 16 aa	mov	x23, x22
   3cb54:	f6 03 18 aa	mov	x22, x24
   3cb58:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3cb5c:	7c 76 40 f9	ldr	x28, [x19, #0xe8]
   3cb60:	75 34 00 b4	cbz	x21, 0x3d1ec
   3cb64:	fb 03 1a aa	mov	x27, x26
   3cb68:	a5 01 00 14	b	0x3d1fc
   3cb6c:	e0 03 14 aa	mov	x0, x20
   3cb70:	d1 63 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3cb74:	bc 03 04 d1	sub	x28, x29, #0x100
   3cb78:	80 87 43 ad	ldp	q0, q1, [x28, #0x70]
   3cb7c:	60 06 0c ad	stp	q0, q1, [x19, #0x180]
   3cb80:	a8 03 59 f8	ldur	x8, [x29, #-0x70]
   3cb84:	68 d2 00 f9	str	x8, [x19, #0x1a0]
   3cb88:	81 83 42 ad	ldp	q1, q0, [x28, #0x50]
   3cb8c:	61 02 0b ad	stp	q1, q0, [x19, #0x160]
   3cb90:	60 86 57 a9	ldp	x0, x1, [x19, #0x178]
   3cb94:	02 00 80 d2	mov	x2, #0x0
   3cb98:	5e 5d 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3cb9c:	28 fc 7c d3	lsr	x8, x1, #60
   3cba0:	1f 39 00 f1	cmp	x8, #0xe
   3cba4:	77 82 40 f9	ldr	x23, [x19, #0x100]
   3cba8:	29 25 00 54	b.ls	0x3d04c
   3cbac:	bb 04 80 d2	mov	x27, #0x25
   3cbb0:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3cbb4:	60 82 05 91	add	x0, x19, #0x160
   3cbb8:	47 47 00 94	bl	0x4e8d4
   3cbbc:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3cbc0:	08 81 3f 91	add	x8, x8, #0xfe0 ; literal pool for: "Invalid wrapped DK ephemeral public key"
   3cbc4:	08 81 00 d1	sub	x8, x8, #0x20
   3cbc8:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3cbcc:	20 38 00 b0	adrp	x0, 1797 ; 0x741000
   3cbd0:	00 c0 12 91	add	x0, x0, #0x4b0
   3cbd4:	61 27 00 d0	adrp	x1, 1262 ; 0x52a000
   3cbd8:	21 a0 1c 91	add	x1, x1, #0x728
   3cbdc:	34 9e ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3cbe0:	01 0a 80 52	mov	w1, #0x50
   3cbe4:	e2 00 80 52	mov	w2, #0x7
   3cbe8:	71 63 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3cbec:	f5 03 00 aa	mov	x21, x0
   3cbf0:	68 27 00 d0	adrp	x8, 1262 ; 0x52a000
   3cbf4:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3cbf8:	00 04 80 3d	str	q0, [x0, #0x10]
   3cbfc:	a8 4c 8e d2	mov	x8, #0x7265
   3cc00:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3cc04:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3cc08:	fa 03 00 aa	mov	x26, x0
   3cc0c:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3cc10:	54 37 00 90	adrp	x20, 1768 ; 0x724000
   3cc14:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3cc18:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3cc1c:	14 24 00 f9	str	x20, [x0, #0x48]
   3cc20:	69 03 7f b2	orr	x9, x27, #0x2
   3cc24:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3cc28:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3cc2c:	ba 42 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3cc30:	f8 03 00 aa	mov	x24, x0
   3cc34:	e0 03 15 aa	mov	x0, x21
   3cc38:	a8 63 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3cc3c:	21 38 00 b0	adrp	x1, 1797 ; 0x741000
   3cc40:	21 e0 12 91	add	x1, x1, #0x4b8
   3cc44:	62 27 00 d0	adrp	x2, 1262 ; 0x52a000
   3cc48:	42 c0 1c 91	add	x2, x2, #0x730
   3cc4c:	e0 03 1a aa	mov	x0, x26
   3cc50:	70 4b 00 94	bl	_$sypSgWOhTm
   3cc54:	e0 03 15 aa	mov	x0, x21
   3cc58:	01 04 80 52	mov	w1, #0x20
   3cc5c:	e2 00 80 52	mov	w2, #0x7
   3cc60:	6b 63 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3cc64:	28 38 00 b0	adrp	x8, 1797 ; 0x741000
   3cc68:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3cc6c:	ba 62 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3cc70:	f5 03 00 aa	mov	x21, x0
   3cc74:	48 37 00 90	adrp	x8, 1768 ; 0x724000
   3cc78:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3cc7c:	43 37 00 90	adrp	x3, 1768 ; 0x724000
   3cc80:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3cc84:	02 21 00 91	add	x2, x8, #0x8
   3cc88:	78 8e 00 f9	str	x24, [x19, #0x118]
   3cc8c:	e0 03 18 aa	mov	x0, x24
   3cc90:	e1 03 14 aa	mov	x1, x20
   3cc94:	15 5e 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3cc98:	f4 03 00 aa	mov	x20, x0
   3cc9c:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3cca0:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3cca4:	e0 03 15 aa	mov	x0, x21
   3cca8:	e2 03 14 aa	mov	x2, x20
   3ccac:	03 00 80 d2	mov	x3, #0x0
   3ccb0:	fc 69 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3ccb4:	fd 03 1d aa	mov	x29, x29
   3ccb8:	b0 62 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3ccbc:	f5 03 00 aa	mov	x21, x0
   3ccc0:	e0 03 14 aa	mov	x0, x20
   3ccc4:	a7 62 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ccc8:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3cccc:	a8 62 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3ccd0:	f5 2a 00 b4	cbz	x21, 0x3d22c
   3ccd4:	e0 03 15 aa	mov	x0, x21
   3ccd8:	23 5d 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3ccdc:	f4 03 00 aa	mov	x20, x0
   3cce0:	fc 03 01 aa	mov	x28, x1
   3cce4:	e0 03 15 aa	mov	x0, x21
   3cce8:	9e 62 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ccec:	00 00 80 d2	mov	x0, #0x0
   3ccf0:	16 5e 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3ccf4:	f8 03 16 aa	mov	x24, x22
   3ccf8:	f6 03 17 aa	mov	x22, x23
   3ccfc:	f7 03 19 aa	mov	x23, x25
   3cd00:	f9 03 00 91	mov	x25, sp
   3cd04:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3cd08:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3cd0c:	e9 03 08 aa	mov	x9, x8
   3cd10:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3cd14:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3cd18:	00 02 3f d6	blr	x16
   3cd1c:	e9 03 00 91	mov	x9, sp
   3cd20:	08 3d 00 91	add	x8, x8, #0xf
   3cd24:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3cd28:	35 01 08 cb	sub	x21, x9, x8
   3cd2c:	bf 02 00 91	mov	sp, x21
   3cd30:	e8 03 15 aa	mov	x8, x21
   3cd34:	02 5e 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3cd38:	e0 03 14 aa	mov	x0, x20
   3cd3c:	e1 03 1c aa	mov	x1, x28
   3cd40:	e2 03 15 aa	mov	x2, x21
   3cd44:	fb 5d 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3cd48:	fa 03 00 aa	mov	x26, x0
   3cd4c:	f5 03 01 aa	mov	x21, x1
   3cd50:	e0 03 14 aa	mov	x0, x20
   3cd54:	e1 03 1c aa	mov	x1, x28
   3cd58:	50 42 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3cd5c:	3f 03 00 91	mov	sp, x25
   3cd60:	f9 03 17 aa	mov	x25, x23
   3cd64:	f7 03 16 aa	mov	x23, x22
   3cd68:	f6 03 18 aa	mov	x22, x24
   3cd6c:	7c 8a 40 f9	ldr	x28, [x19, #0x110]
   3cd70:	78 d2 4e a9	ldp	x24, x20, [x19, #0xe8]
   3cd74:	35 27 00 b4	cbz	x21, 0x3d258
   3cd78:	fb 03 1a aa	mov	x27, x26
   3cd7c:	3b 01 00 14	b	0x3d268
   3cd80:	e0 03 14 aa	mov	x0, x20
   3cd84:	4c 63 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3cd88:	a9 03 04 d1	sub	x9, x29, #0x100
   3cd8c:	20 85 43 ad	ldp	q0, q1, [x9, #0x70]
   3cd90:	60 06 0c ad	stp	q0, q1, [x19, #0x180]
   3cd94:	a8 03 59 f8	ldur	x8, [x29, #-0x70]
   3cd98:	68 d2 00 f9	str	x8, [x19, #0x1a0]
   3cd9c:	21 81 42 ad	ldp	q1, q0, [x9, #0x50]
   3cda0:	61 02 0b ad	stp	q1, q0, [x19, #0x160]
   3cda4:	60 86 57 a9	ldp	x0, x1, [x19, #0x178]
   3cda8:	02 00 80 d2	mov	x2, #0x0
   3cdac:	d9 5c 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3cdb0:	28 fc 7c d3	lsr	x8, x1, #60
   3cdb4:	1f 39 00 f1	cmp	x8, #0xe
   3cdb8:	69 1a 00 54	b.ls	0x3d104
   3cdbc:	bb 04 80 d2	mov	x27, #0x25
   3cdc0:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3cdc4:	60 82 05 91	add	x0, x19, #0x160
   3cdc8:	c3 46 00 94	bl	0x4e8d4
   3cdcc:	e8 26 00 b0	adrp	x8, 1245 ; 0x519000
   3cdd0:	08 81 3f 91	add	x8, x8, #0xfe0 ; literal pool for: "Invalid wrapped DK ephemeral public key"
   3cdd4:	08 81 00 d1	sub	x8, x8, #0x20
   3cdd8:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3cddc:	20 38 00 b0	adrp	x0, 1797 ; 0x741000
   3cde0:	00 c0 12 91	add	x0, x0, #0x4b0
   3cde4:	61 27 00 d0	adrp	x1, 1262 ; 0x52a000
   3cde8:	21 a0 1c 91	add	x1, x1, #0x728
   3cdec:	b0 9d ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3cdf0:	01 0a 80 52	mov	w1, #0x50
   3cdf4:	e2 00 80 52	mov	w2, #0x7
   3cdf8:	ed 62 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3cdfc:	f5 03 00 aa	mov	x21, x0
   3ce00:	68 27 00 d0	adrp	x8, 1262 ; 0x52a000
   3ce04:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3ce08:	00 04 80 3d	str	q0, [x0, #0x10]
   3ce0c:	a8 4c 8e d2	mov	x8, #0x7265
   3ce10:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3ce14:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3ce18:	fa 03 00 aa	mov	x26, x0
   3ce1c:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3ce20:	54 37 00 90	adrp	x20, 1768 ; 0x724000
   3ce24:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3ce28:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3ce2c:	14 24 00 f9	str	x20, [x0, #0x48]
   3ce30:	69 03 7f b2	orr	x9, x27, #0x2
   3ce34:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3ce38:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3ce3c:	36 42 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3ce40:	f8 03 00 aa	mov	x24, x0
   3ce44:	e0 03 15 aa	mov	x0, x21
   3ce48:	24 63 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3ce4c:	21 38 00 b0	adrp	x1, 1797 ; 0x741000
   3ce50:	21 e0 12 91	add	x1, x1, #0x4b8
   3ce54:	62 27 00 d0	adrp	x2, 1262 ; 0x52a000
   3ce58:	42 c0 1c 91	add	x2, x2, #0x730
   3ce5c:	e0 03 1a aa	mov	x0, x26
   3ce60:	ec 4a 00 94	bl	_$sypSgWOhTm
   3ce64:	e0 03 15 aa	mov	x0, x21
   3ce68:	01 04 80 52	mov	w1, #0x20
   3ce6c:	e2 00 80 52	mov	w2, #0x7
   3ce70:	e7 62 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3ce74:	28 38 00 b0	adrp	x8, 1797 ; 0x741000
   3ce78:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3ce7c:	36 62 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3ce80:	f5 03 00 aa	mov	x21, x0
   3ce84:	48 37 00 90	adrp	x8, 1768 ; 0x724000
   3ce88:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3ce8c:	43 37 00 90	adrp	x3, 1768 ; 0x724000
   3ce90:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3ce94:	02 21 00 91	add	x2, x8, #0x8
   3ce98:	78 86 00 f9	str	x24, [x19, #0x108]
   3ce9c:	e0 03 18 aa	mov	x0, x24
   3cea0:	e1 03 14 aa	mov	x1, x20
   3cea4:	91 5d 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3cea8:	f4 03 00 aa	mov	x20, x0
   3ceac:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3ceb0:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3ceb4:	e0 03 15 aa	mov	x0, x21
   3ceb8:	e2 03 14 aa	mov	x2, x20
   3cebc:	03 00 80 d2	mov	x3, #0x0
   3cec0:	78 69 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3cec4:	fd 03 1d aa	mov	x29, x29
   3cec8:	2c 62 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3cecc:	f5 03 00 aa	mov	x21, x0
   3ced0:	e0 03 14 aa	mov	x0, x20
   3ced4:	23 62 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ced8:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3cedc:	24 62 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3cee0:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3cee4:	f5 1d 00 b4	cbz	x21, 0x3d2a0
   3cee8:	e0 03 15 aa	mov	x0, x21
   3ceec:	9e 5c 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3cef0:	f4 03 00 aa	mov	x20, x0
   3cef4:	fc 03 01 aa	mov	x28, x1
   3cef8:	e0 03 15 aa	mov	x0, x21
   3cefc:	19 62 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3cf00:	00 00 80 d2	mov	x0, #0x0
   3cf04:	91 5d 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3cf08:	f8 03 16 aa	mov	x24, x22
   3cf0c:	f6 03 17 aa	mov	x22, x23
   3cf10:	f7 03 19 aa	mov	x23, x25
   3cf14:	f9 03 00 91	mov	x25, sp
   3cf18:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3cf1c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3cf20:	e9 03 08 aa	mov	x9, x8
   3cf24:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3cf28:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3cf2c:	00 02 3f d6	blr	x16
   3cf30:	e9 03 00 91	mov	x9, sp
   3cf34:	08 3d 00 91	add	x8, x8, #0xf
   3cf38:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3cf3c:	35 01 08 cb	sub	x21, x9, x8
   3cf40:	bf 02 00 91	mov	sp, x21
   3cf44:	e8 03 15 aa	mov	x8, x21
   3cf48:	7d 5d 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3cf4c:	e0 03 14 aa	mov	x0, x20
   3cf50:	e1 03 1c aa	mov	x1, x28
   3cf54:	e2 03 15 aa	mov	x2, x21
   3cf58:	76 5d 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3cf5c:	fa 03 00 aa	mov	x26, x0
   3cf60:	f5 03 01 aa	mov	x21, x1
   3cf64:	e0 03 14 aa	mov	x0, x20
   3cf68:	e1 03 1c aa	mov	x1, x28
   3cf6c:	cb 41 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3cf70:	3f 03 00 91	mov	sp, x25
   3cf74:	f9 03 17 aa	mov	x25, x23
   3cf78:	f7 03 16 aa	mov	x23, x22
   3cf7c:	f6 03 18 aa	mov	x22, x24
   3cf80:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3cf84:	7c 7e 40 f9	ldr	x28, [x19, #0xf8]
   3cf88:	15 1a 00 b4	cbz	x21, 0x3d2c8
   3cf8c:	fb 03 1a aa	mov	x27, x26
   3cf90:	d2 00 00 14	b	0x3d2d8
   3cf94:	f5 03 00 aa	mov	x21, x0
   3cf98:	f4 03 01 aa	mov	x20, x1
   3cf9c:	00 00 80 d2	mov	x0, #0x0
   3cfa0:	aa 5c 13 94	bl	0x514248 ; symbol stub for: _$s9CryptoKit12SymmetricKeyVMa
   3cfa4:	f7 03 00 91	mov	x23, sp
   3cfa8:	fc 03 18 aa	mov	x28, x24
   3cfac:	60 6a 00 f9	str	x0, [x19, #0xd0]
   3cfb0:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   3cfb4:	08 23 40 f9	ldr	x8, [x24, #0x40]
   3cfb8:	e9 03 08 aa	mov	x9, x8
   3cfbc:	50 37 00 90	adrp	x16, 1768 ; 0x724000
   3cfc0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3cfc4:	00 02 3f d6	blr	x16
   3cfc8:	e9 03 00 91	mov	x9, sp
   3cfcc:	08 3d 00 91	add	x8, x8, #0xf
   3cfd0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3cfd4:	3b 01 08 cb	sub	x27, x9, x8
   3cfd8:	7f 03 00 91	mov	sp, x27
   3cfdc:	b5 53 31 a9	stp	x21, x20, [x29, #-0xf0]
   3cfe0:	41 37 00 90	adrp	x1, 1768 ; 0x724000
   3cfe4:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3cfe8:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3cfec:	e8 03 1b aa	mov	x8, x27
   3cff0:	e2 03 1c aa	mov	x2, x28
   3cff4:	75 d2 0d a9	stp	x21, x20, [x19, #0xd8]
   3cff8:	74 7e 40 f9	ldr	x20, [x19, #0xf8]
   3cffc:	f5 03 1a aa	mov	x21, x26
   3d000:	d1 5c 13 94	bl	0x514344 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV11decapsulateyAA09SymmetricG0VxK10Foundation12DataProtocolRzlF
   3d004:	fa 03 15 aa	mov	x26, x21
   3d008:	95 18 00 b4	cbz	x21, 0x3d318
   3d00c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d010:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d014:	e0 03 14 aa	mov	x0, x20
   3d018:	00 01 3f d6	blr	x8
   3d01c:	60 82 40 f9	ldr	x0, [x19, #0x100]
   3d020:	e1 03 16 aa	mov	x1, x22
   3d024:	91 4a 00 94	bl	0x4fa68
   3d028:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d02c:	e1 03 19 aa	mov	x1, x25
   3d030:	8e 4a 00 94	bl	0x4fa68
   3d034:	60 82 05 91	add	x0, x19, #0x160
   3d038:	27 46 00 94	bl	0x4e8d4
   3d03c:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3d040:	8a 4a 00 94	bl	0x4fa68
   3d044:	ff 02 00 91	mov	sp, x23
   3d048:	41 fe ff 17	b	0x3c94c
   3d04c:	f4 03 00 aa	mov	x20, x0
   3d050:	f5 03 01 aa	mov	x21, x1
   3d054:	00 00 80 d2	mov	x0, #0x0
   3d058:	df 5c 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   3d05c:	e8 03 00 91	mov	x8, sp
   3d060:	68 72 00 f9	str	x8, [x19, #0xe0]
   3d064:	60 6a 00 f9	str	x0, [x19, #0xd0]
   3d068:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   3d06c:	08 23 40 f9	ldr	x8, [x24, #0x40]
   3d070:	e9 03 08 aa	mov	x9, x8
   3d074:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d078:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d07c:	00 02 3f d6	blr	x16
   3d080:	e9 03 00 91	mov	x9, sp
   3d084:	08 3d 00 91	add	x8, x8, #0xf
   3d088:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d08c:	3b 01 08 cb	sub	x27, x9, x8
   3d090:	7f 03 00 91	mov	sp, x27
   3d094:	b4 57 31 a9	stp	x20, x21, [x29, #-0xf0]
   3d098:	e0 03 14 aa	mov	x0, x20
   3d09c:	e1 03 15 aa	mov	x1, x21
   3d0a0:	4b 42 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3d0a4:	21 37 00 f0	adrp	x1, 1767 ; 0x724000
   3d0a8:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3d0ac:	22 37 00 f0	adrp	x2, 1767 ; 0x724000
   3d0b0:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3d0b4:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3d0b8:	e8 03 1b aa	mov	x8, x27
   3d0bc:	75 6e 00 f9	str	x21, [x19, #0xd8]
   3d0c0:	f5 03 1a aa	mov	x21, x26
   3d0c4:	c1 5c 13 94	bl	0x5143c8 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963RepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   3d0c8:	fa 03 15 aa	mov	x26, x21
   3d0cc:	75 21 00 b4	cbz	x21, 0x3d4f8
   3d0d0:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d0d4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d0d8:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3d0dc:	00 01 3f d6	blr	x8
   3d0e0:	e0 03 17 aa	mov	x0, x23
   3d0e4:	e1 03 16 aa	mov	x1, x22
   3d0e8:	60 4a 00 94	bl	0x4fa68
   3d0ec:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d0f0:	e1 03 19 aa	mov	x1, x25
   3d0f4:	5d 4a 00 94	bl	0x4fa68
   3d0f8:	e0 03 14 aa	mov	x0, x20
   3d0fc:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3d100:	2c 00 00 14	b	0x3d1b0
   3d104:	f4 03 00 aa	mov	x20, x0
   3d108:	fc 03 01 aa	mov	x28, x1
   3d10c:	00 00 80 d2	mov	x0, #0x0
   3d110:	b1 5c 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   3d114:	e8 03 00 91	mov	x8, sp
   3d118:	60 a2 0d a9	stp	x0, x8, [x19, #0xd8]
   3d11c:	1b 80 5f f8	ldur	x27, [x0, #-0x8]
   3d120:	68 23 40 f9	ldr	x8, [x27, #0x40]
   3d124:	e9 03 08 aa	mov	x9, x8
   3d128:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d12c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d130:	00 02 3f d6	blr	x16
   3d134:	e9 03 00 91	mov	x9, sp
   3d138:	08 3d 00 91	add	x8, x8, #0xf
   3d13c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d140:	38 01 08 cb	sub	x24, x9, x8
   3d144:	1f 03 00 91	mov	sp, x24
   3d148:	b4 73 31 a9	stp	x20, x28, [x29, #-0xf0]
   3d14c:	e0 03 14 aa	mov	x0, x20
   3d150:	e1 03 1c aa	mov	x1, x28
   3d154:	1e 42 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3d158:	21 37 00 f0	adrp	x1, 1767 ; 0x724000
   3d15c:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3d160:	22 37 00 f0	adrp	x2, 1767 ; 0x724000
   3d164:	42 14 40 f9	ldr	x2, [x2, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3d168:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3d16c:	e8 03 18 aa	mov	x8, x24
   3d170:	f5 03 1a aa	mov	x21, x26
   3d174:	95 5c 13 94	bl	0x5143c8 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963RepresentationAGx_tKc10Foundation15ContiguousBytesRzlufC
   3d178:	fa 03 15 aa	mov	x26, x21
   3d17c:	f5 21 00 b4	cbz	x21, 0x3d5b8
   3d180:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d184:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d188:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3d18c:	00 01 3f d6	blr	x8
   3d190:	e0 03 17 aa	mov	x0, x23
   3d194:	e1 03 16 aa	mov	x1, x22
   3d198:	34 4a 00 94	bl	0x4fa68
   3d19c:	e0 03 14 aa	mov	x0, x20
   3d1a0:	e1 03 1c aa	mov	x1, x28
   3d1a4:	31 4a 00 94	bl	0x4fa68
   3d1a8:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d1ac:	e1 03 19 aa	mov	x1, x25
   3d1b0:	2e 4a 00 94	bl	0x4fa68
   3d1b4:	60 82 05 91	add	x0, x19, #0x160
   3d1b8:	c7 45 00 94	bl	0x4e8d4
   3d1bc:	2d 01 00 14	b	0x3d670
   3d1c0:	f4 03 00 aa	mov	x20, x0
   3d1c4:	ac 5b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3d1c8:	fa 03 00 aa	mov	x26, x0
   3d1cc:	e0 03 14 aa	mov	x0, x20
   3d1d0:	64 61 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d1d4:	f5 03 1a aa	mov	x21, x26
   3d1d8:	49 62 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3d1dc:	e0 03 1a aa	mov	x0, x26
   3d1e0:	14 62 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3d1e4:	7c 76 40 f9	ldr	x28, [x19, #0xe8]
   3d1e8:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3d1ec:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3d1f0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3d1f4:	08 81 00 d1	sub	x8, x8, #0x20
   3d1f8:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3d1fc:	74 6a 4f a9	ldp	x20, x26, [x19, #0xf0]
   3d200:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d204:	e1 03 19 aa	mov	x1, x25
   3d208:	18 4a 00 94	bl	0x4fa68
   3d20c:	60 86 40 f9	ldr	x0, [x19, #0x108]
   3d210:	f3 61 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3d214:	e0 03 17 aa	mov	x0, x23
   3d218:	e1 03 16 aa	mov	x1, x22
   3d21c:	13 4a 00 94	bl	0x4fa68
   3d220:	88 07 40 f9	ldr	x8, [x28, #0x8]
   3d224:	e0 03 1a aa	mov	x0, x26
   3d228:	38 00 00 14	b	0x3d308
   3d22c:	f4 03 00 aa	mov	x20, x0
   3d230:	91 5b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3d234:	fa 03 00 aa	mov	x26, x0
   3d238:	e0 03 14 aa	mov	x0, x20
   3d23c:	49 61 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d240:	f5 03 1a aa	mov	x21, x26
   3d244:	2e 62 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3d248:	e0 03 1a aa	mov	x0, x26
   3d24c:	f9 61 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3d250:	78 d2 4e a9	ldp	x24, x20, [x19, #0xe8]
   3d254:	7c 8a 40 f9	ldr	x28, [x19, #0x110]
   3d258:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3d25c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3d260:	08 81 00 d1	sub	x8, x8, #0x20
   3d264:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3d268:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d26c:	e1 03 19 aa	mov	x1, x25
   3d270:	fe 49 00 94	bl	0x4fa68
   3d274:	60 8e 40 f9	ldr	x0, [x19, #0x118]
   3d278:	d9 61 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3d27c:	e0 03 17 aa	mov	x0, x23
   3d280:	e1 03 16 aa	mov	x1, x22
   3d284:	f9 49 00 94	bl	0x4fa68
   3d288:	08 07 40 f9	ldr	x8, [x24, #0x8]
   3d28c:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3d290:	e1 03 14 aa	mov	x1, x20
   3d294:	00 01 3f d6	blr	x8
   3d298:	9f 03 00 91	mov	sp, x28
   3d29c:	a2 fb ff 17	b	0x3c124
   3d2a0:	f4 03 00 aa	mov	x20, x0
   3d2a4:	74 5b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3d2a8:	fa 03 00 aa	mov	x26, x0
   3d2ac:	e0 03 14 aa	mov	x0, x20
   3d2b0:	2c 61 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d2b4:	f5 03 1a aa	mov	x21, x26
   3d2b8:	11 62 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3d2bc:	e0 03 1a aa	mov	x0, x26
   3d2c0:	dc 61 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3d2c4:	7c 7e 40 f9	ldr	x28, [x19, #0xf8]
   3d2c8:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3d2cc:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3d2d0:	08 81 00 d1	sub	x8, x8, #0x20
   3d2d4:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3d2d8:	74 7a 40 f9	ldr	x20, [x19, #0xf0]
   3d2dc:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d2e0:	e1 03 19 aa	mov	x1, x25
   3d2e4:	e1 49 00 94	bl	0x4fa68
   3d2e8:	60 86 40 f9	ldr	x0, [x19, #0x108]
   3d2ec:	bc 61 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3d2f0:	e0 03 17 aa	mov	x0, x23
   3d2f4:	e1 03 16 aa	mov	x1, x22
   3d2f8:	dc 49 00 94	bl	0x4fa68
   3d2fc:	68 76 40 f9	ldr	x8, [x19, #0xe8]
   3d300:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d304:	e0 03 1c aa	mov	x0, x28
   3d308:	e1 03 14 aa	mov	x1, x20
   3d30c:	00 01 3f d6	blr	x8
   3d310:	1f 03 00 91	mov	sp, x24
   3d314:	84 fb ff 17	b	0x3c124
   3d318:	78 de 0b a9	stp	x24, x23, [x19, #0xb8]
   3d31c:	7c 5a 00 f9	str	x28, [x19, #0xb0]
   3d320:	7b 66 00 f9	str	x27, [x19, #0xc8]
   3d324:	60 86 58 a9	ldp	x0, x1, [x19, #0x188]
   3d328:	02 00 80 d2	mov	x2, #0x0
   3d32c:	79 5b 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3d330:	28 fc 7c d3	lsr	x8, x1, #60
   3d334:	1f 39 00 f1	cmp	x8, #0xe
   3d338:	29 1a 00 54	b.ls	0x3d67c
   3d33c:	bb 04 80 d2	mov	x27, #0x25
   3d340:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3d344:	60 82 05 91	add	x0, x19, #0x160
   3d348:	63 45 00 94	bl	0x4e8d4
   3d34c:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3d350:	08 81 3e 91	add	x8, x8, #0xfa0 ; literal pool for: "Invalid wrapped DK nonce"
   3d354:	08 81 00 d1	sub	x8, x8, #0x20
   3d358:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3d35c:	20 38 00 90	adrp	x0, 1796 ; 0x741000
   3d360:	00 c0 12 91	add	x0, x0, #0x4b0
   3d364:	61 27 00 b0	adrp	x1, 1261 ; 0x52a000
   3d368:	21 a0 1c 91	add	x1, x1, #0x728
   3d36c:	50 9c ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3d370:	01 0a 80 52	mov	w1, #0x50
   3d374:	e2 00 80 52	mov	w2, #0x7
   3d378:	8d 61 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3d37c:	f5 03 00 aa	mov	x21, x0
   3d380:	68 27 00 b0	adrp	x8, 1261 ; 0x52a000
   3d384:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3d388:	00 04 80 3d	str	q0, [x0, #0x10]
   3d38c:	a8 4c 8e d2	mov	x8, #0x7265
   3d390:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3d394:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3d398:	fa 03 00 aa	mov	x26, x0
   3d39c:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3d3a0:	34 37 00 f0	adrp	x20, 1767 ; 0x724000
   3d3a4:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3d3a8:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3d3ac:	14 24 00 f9	str	x20, [x0, #0x48]
   3d3b0:	69 37 00 d1	sub	x9, x27, #0xd
   3d3b4:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3d3b8:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3d3bc:	d6 40 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3d3c0:	f8 03 00 aa	mov	x24, x0
   3d3c4:	e0 03 15 aa	mov	x0, x21
   3d3c8:	c4 61 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3d3cc:	21 38 00 90	adrp	x1, 1796 ; 0x741000
   3d3d0:	21 e0 12 91	add	x1, x1, #0x4b8
   3d3d4:	62 27 00 b0	adrp	x2, 1261 ; 0x52a000
   3d3d8:	42 c0 1c 91	add	x2, x2, #0x730
   3d3dc:	e0 03 1a aa	mov	x0, x26
   3d3e0:	8c 49 00 94	bl	_$sypSgWOhTm
   3d3e4:	e0 03 15 aa	mov	x0, x21
   3d3e8:	01 04 80 52	mov	w1, #0x20
   3d3ec:	e2 00 80 52	mov	w2, #0x7
   3d3f0:	87 61 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3d3f4:	28 38 00 90	adrp	x8, 1796 ; 0x741000
   3d3f8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3d3fc:	d6 60 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3d400:	f5 03 00 aa	mov	x21, x0
   3d404:	28 37 00 f0	adrp	x8, 1767 ; 0x724000
   3d408:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3d40c:	23 37 00 f0	adrp	x3, 1767 ; 0x724000
   3d410:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3d414:	02 21 00 91	add	x2, x8, #0x8
   3d418:	78 86 00 f9	str	x24, [x19, #0x108]
   3d41c:	e0 03 18 aa	mov	x0, x24
   3d420:	e1 03 14 aa	mov	x1, x20
   3d424:	31 5c 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3d428:	f4 03 00 aa	mov	x20, x0
   3d42c:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3d430:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3d434:	e0 03 15 aa	mov	x0, x21
   3d438:	e2 03 14 aa	mov	x2, x20
   3d43c:	03 00 80 d2	mov	x3, #0x0
   3d440:	18 68 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3d444:	fd 03 1d aa	mov	x29, x29
   3d448:	cc 60 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3d44c:	f5 03 00 aa	mov	x21, x0
   3d450:	e0 03 14 aa	mov	x0, x20
   3d454:	c3 60 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d458:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3d45c:	c4 60 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3d460:	77 82 40 f9	ldr	x23, [x19, #0x100]
   3d464:	35 44 00 b4	cbz	x21, 0x3dce8
   3d468:	e0 03 15 aa	mov	x0, x21
   3d46c:	3e 5b 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3d470:	f4 03 00 aa	mov	x20, x0
   3d474:	fa 03 01 aa	mov	x26, x1
   3d478:	e0 03 15 aa	mov	x0, x21
   3d47c:	b9 60 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d480:	00 00 80 d2	mov	x0, #0x0
   3d484:	31 5c 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3d488:	fc 03 00 91	mov	x28, sp
   3d48c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3d490:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3d494:	e9 03 08 aa	mov	x9, x8
   3d498:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d49c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d4a0:	00 02 3f d6	blr	x16
   3d4a4:	e9 03 00 91	mov	x9, sp
   3d4a8:	08 3d 00 91	add	x8, x8, #0xf
   3d4ac:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d4b0:	35 01 08 cb	sub	x21, x9, x8
   3d4b4:	bf 02 00 91	mov	sp, x21
   3d4b8:	e8 03 15 aa	mov	x8, x21
   3d4bc:	20 5c 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3d4c0:	e0 03 14 aa	mov	x0, x20
   3d4c4:	e1 03 1a aa	mov	x1, x26
   3d4c8:	e2 03 15 aa	mov	x2, x21
   3d4cc:	19 5c 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3d4d0:	60 5a 00 f9	str	x0, [x19, #0xb0]
   3d4d4:	f5 03 01 aa	mov	x21, x1
   3d4d8:	e0 03 14 aa	mov	x0, x20
   3d4dc:	e1 03 1a aa	mov	x1, x26
   3d4e0:	6e 40 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3d4e4:	9f 03 00 91	mov	sp, x28
   3d4e8:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3d4ec:	35 41 00 b4	cbz	x21, 0x3dd10
   3d4f0:	7b 5a 40 f9	ldr	x27, [x19, #0xb0]
   3d4f4:	0b 02 00 14	b	0x3dd20
   3d4f8:	74 e2 0b a9	stp	x20, x24, [x19, #0xb8]
   3d4fc:	00 00 80 d2	mov	x0, #0x0
   3d500:	49 5b 13 94	bl	0x514224 ; symbol stub for: _$s9CryptoKit12SharedSecretVMa
   3d504:	e9 03 00 aa	mov	x9, x0
   3d508:	e0 03 1b aa	mov	x0, x27
   3d50c:	e8 03 00 91	mov	x8, sp
   3d510:	68 66 00 f9	str	x8, [x19, #0xc8]
   3d514:	69 5a 00 f9	str	x9, [x19, #0xb0]
   3d518:	38 81 5f f8	ldur	x24, [x9, #-0x8]
   3d51c:	08 23 40 f9	ldr	x8, [x24, #0x40]
   3d520:	e9 03 08 aa	mov	x9, x8
   3d524:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d528:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d52c:	00 02 3f d6	blr	x16
   3d530:	e9 03 00 91	mov	x9, sp
   3d534:	08 3d 00 91	add	x8, x8, #0xf
   3d538:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d53c:	3b 01 08 cb	sub	x27, x9, x8
   3d540:	7f 03 00 91	mov	sp, x27
   3d544:	e8 03 1b aa	mov	x8, x27
   3d548:	f7 03 00 aa	mov	x23, x0
   3d54c:	74 7e 40 f9	ldr	x20, [x19, #0xf8]
   3d550:	f5 03 1a aa	mov	x21, x26
   3d554:	a3 5b 13 94	bl	0x5143e0 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V016sharedSecretFromdE04withAA06SharedH0VAE06PublicD0V_tKF
   3d558:	fa 03 15 aa	mov	x26, x21
   3d55c:	95 10 00 b4	cbz	x21, 0x3d76c
   3d560:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d564:	e1 03 19 aa	mov	x1, x25
   3d568:	40 49 00 94	bl	0x4fa68
   3d56c:	60 82 05 91	add	x0, x19, #0x160
   3d570:	d9 44 00 94	bl	0x4e8d4
   3d574:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3d578:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3d57c:	3b 49 00 94	bl	0x4fa68
   3d580:	60 82 40 f9	ldr	x0, [x19, #0x100]
   3d584:	e1 03 16 aa	mov	x1, x22
   3d588:	38 49 00 94	bl	0x4fa68
   3d58c:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3d590:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d594:	e0 03 17 aa	mov	x0, x23
   3d598:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3d59c:	00 01 3f d6	blr	x8
   3d5a0:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d5a4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d5a8:	e0 03 14 aa	mov	x0, x20
   3d5ac:	00 01 3f d6	blr	x8
   3d5b0:	68 66 40 f9	ldr	x8, [x19, #0xc8]
   3d5b4:	2e 00 00 14	b	0x3d66c
   3d5b8:	74 72 0b a9	stp	x20, x28, [x19, #0xb0]
   3d5bc:	7b 62 00 f9	str	x27, [x19, #0xc0]
   3d5c0:	00 00 80 d2	mov	x0, #0x0
   3d5c4:	18 5b 13 94	bl	0x514224 ; symbol stub for: _$s9CryptoKit12SharedSecretVMa
   3d5c8:	fb 03 00 aa	mov	x27, x0
   3d5cc:	e0 03 18 aa	mov	x0, x24
   3d5d0:	e8 03 00 91	mov	x8, sp
   3d5d4:	68 6a 00 f9	str	x8, [x19, #0xd0]
   3d5d8:	78 83 5f f8	ldur	x24, [x27, #-0x8]
   3d5dc:	08 23 40 f9	ldr	x8, [x24, #0x40]
   3d5e0:	e9 03 08 aa	mov	x9, x8
   3d5e4:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d5e8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d5ec:	00 02 3f d6	blr	x16
   3d5f0:	e9 03 00 91	mov	x9, sp
   3d5f4:	08 3d 00 91	add	x8, x8, #0xf
   3d5f8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d5fc:	3c 01 08 cb	sub	x28, x9, x8
   3d600:	9f 03 00 91	mov	sp, x28
   3d604:	e8 03 1c aa	mov	x8, x28
   3d608:	60 66 00 f9	str	x0, [x19, #0xc8]
   3d60c:	74 7e 40 f9	ldr	x20, [x19, #0xf8]
   3d610:	f5 03 1a aa	mov	x21, x26
   3d614:	13 5b 13 94	bl	0x514260 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V016sharedSecretFromfG04withAA06SharedJ0VAaDOAFO06PublicF0V_tKF
   3d618:	fa 03 15 aa	mov	x26, x21
   3d61c:	35 20 00 b4	cbz	x21, 0x3da20
   3d620:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d624:	e1 03 19 aa	mov	x1, x25
   3d628:	10 49 00 94	bl	0x4fa68
   3d62c:	60 82 05 91	add	x0, x19, #0x160
   3d630:	a9 44 00 94	bl	0x4e8d4
   3d634:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3d638:	0c 49 00 94	bl	0x4fa68
   3d63c:	e0 03 17 aa	mov	x0, x23
   3d640:	e1 03 16 aa	mov	x1, x22
   3d644:	09 49 00 94	bl	0x4fa68
   3d648:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3d64c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d650:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3d654:	00 01 3f d6	blr	x8
   3d658:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d65c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d660:	e0 03 14 aa	mov	x0, x20
   3d664:	00 01 3f d6	blr	x8
   3d668:	68 6a 40 f9	ldr	x8, [x19, #0xd0]
   3d66c:	1f 01 00 91	mov	sp, x8
   3d670:	68 72 40 f9	ldr	x8, [x19, #0xe0]
   3d674:	1f 01 00 91	mov	sp, x8
   3d678:	b5 fc ff 17	b	0x3c94c
   3d67c:	fb 03 00 aa	mov	x27, x0
   3d680:	00 00 80 d2	mov	x0, #0x0
   3d684:	fc 03 01 aa	mov	x28, x1
   3d688:	d5 5a 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   3d68c:	f8 03 00 aa	mov	x24, x0
   3d690:	e8 03 00 91	mov	x8, sp
   3d694:	68 56 00 f9	str	x8, [x19, #0xa8]
   3d698:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3d69c:	68 52 00 f9	str	x8, [x19, #0xa0]
   3d6a0:	0c 21 40 f9	ldr	x12, [x8, #0x40]
   3d6a4:	e9 03 0c aa	mov	x9, x12
   3d6a8:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d6ac:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d6b0:	00 02 3f d6	blr	x16
   3d6b4:	e8 03 00 91	mov	x8, sp
   3d6b8:	6c 4a 00 f9	str	x12, [x19, #0x90]
   3d6bc:	89 3d 00 91	add	x9, x12, #0xf
   3d6c0:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3d6c4:	15 01 09 cb	sub	x21, x8, x9
   3d6c8:	bf 02 00 91	mov	sp, x21
   3d6cc:	bb 73 31 a9	stp	x27, x28, [x29, #-0xf0]
   3d6d0:	e0 03 1b aa	mov	x0, x27
   3d6d4:	e1 03 1c aa	mov	x1, x28
   3d6d8:	bd 40 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3d6dc:	21 37 00 f0	adrp	x1, 1767 ; 0x724000
   3d6e0:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3d6e4:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3d6e8:	75 4e 00 f9	str	x21, [x19, #0x98]
   3d6ec:	e8 03 15 aa	mov	x8, x21
   3d6f0:	62 5a 40 f9	ldr	x2, [x19, #0xb0]
   3d6f4:	f5 03 1a aa	mov	x21, x26
   3d6f8:	b6 5a 13 94	bl	0x5141d0 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV4dataAEx_tKc10Foundation12DataProtocolRzlufC
   3d6fc:	fa 03 15 aa	mov	x26, x21
   3d700:	77 82 40 f9	ldr	x23, [x19, #0x100]
   3d704:	f5 33 00 b4	cbz	x21, 0x3dd80
   3d708:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3d70c:	e1 03 19 aa	mov	x1, x25
   3d710:	d6 48 00 94	bl	0x4fa68
   3d714:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3d718:	d4 48 00 94	bl	0x4fa68
   3d71c:	60 82 05 91	add	x0, x19, #0x160
   3d720:	6d 44 00 94	bl	0x4e8d4
   3d724:	e0 03 1b aa	mov	x0, x27
   3d728:	e1 03 1c aa	mov	x1, x28
   3d72c:	cf 48 00 94	bl	0x4fa68
   3d730:	e0 03 17 aa	mov	x0, x23
   3d734:	e1 03 16 aa	mov	x1, x22
   3d738:	cc 48 00 94	bl	0x4fa68
   3d73c:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3d740:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d744:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3d748:	00 01 3f d6	blr	x8
   3d74c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3d750:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3d754:	e0 03 14 aa	mov	x0, x20
   3d758:	00 01 3f d6	blr	x8
   3d75c:	68 56 40 f9	ldr	x8, [x19, #0xa8]
   3d760:	1f 01 00 91	mov	sp, x8
   3d764:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3d768:	c3 ff ff 17	b	0x3d674
   3d76c:	78 46 00 f9	str	x24, [x19, #0x88]
   3d770:	7b 56 00 f9	str	x27, [x19, #0xa8]
   3d774:	77 4e 00 f9	str	x23, [x19, #0x98]
   3d778:	00 00 80 d2	mov	x0, #0x0
   3d77c:	b3 5a 13 94	bl	0x514248 ; symbol stub for: _$s9CryptoKit12SymmetricKeyVMa
   3d780:	e8 03 00 91	mov	x8, sp
   3d784:	68 4a 00 f9	str	x8, [x19, #0x90]
   3d788:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3d78c:	68 82 07 a9	stp	x8, x0, [x19, #0x78]
   3d790:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3d794:	e9 03 08 aa	mov	x9, x8
   3d798:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d79c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d7a0:	00 02 3f d6	blr	x16
   3d7a4:	e9 03 00 91	mov	x9, sp
   3d7a8:	08 3d 00 91	add	x8, x8, #0xf
   3d7ac:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d7b0:	3b 01 08 cb	sub	x27, x9, x8
   3d7b4:	7f 03 00 91	mov	sp, x27
   3d7b8:	00 00 80 d2	mov	x0, #0x0
   3d7bc:	39 5b 13 94	bl	0x5144a0 ; symbol stub for: _$s9CryptoKit6SHA256VMa
   3d7c0:	f4 03 00 aa	mov	x20, x0
   3d7c4:	68 27 00 b0	adrp	x8, 1261 ; 0x52a000
   3d7c8:	00 b5 c1 3d	ldr	q0, [x8, #0x6d0]
   3d7cc:	80 07 80 3d	str	q0, [x28, #0x10]
   3d7d0:	48 38 00 90	adrp	x8, 1800 ; 0x745000
   3d7d4:	08 05 41 f9	ldr	x8, [x8, #0x208]
   3d7d8:	1f 05 00 b1	cmn	x8, #0x1
   3d7dc:	c1 32 01 54	b.ne	0x3fe34
   3d7e0:	20 38 00 90	adrp	x0, 1796 ; 0x741000
   3d7e4:	00 c0 1e 91	add	x0, x0, #0x7b0
   3d7e8:	21 37 00 f0	adrp	x1, 1767 ; 0x724000
   3d7ec:	21 30 40 f9	ldr	x1, [x1, #0x60] ; literal pool symbol address: _$s9CryptoKit6SHA256VMa
   3d7f0:	22 37 00 f0	adrp	x2, 1767 ; 0x724000
   3d7f4:	42 2c 40 f9	ldr	x2, [x2, #0x58] ; literal pool symbol address: _$s9CryptoKit6SHA256VAA12HashFunctionAAMc
   3d7f8:	50 44 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   3d7fc:	f5 03 00 aa	mov	x21, x0
   3d800:	0d 44 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   3d804:	f8 03 00 aa	mov	x24, x0
   3d808:	e0 03 bf a9	stp	x0, x0, [sp, #-0x10]!
   3d80c:	22 38 00 f0	adrp	x2, 1799 ; 0x744000
   3d810:	42 20 3a 91	add	x2, x2, #0xe88
   3d814:	25 37 00 f0	adrp	x5, 1767 ; 0x724000
   3d818:	a5 18 40 f9	ldr	x5, [x5, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3d81c:	a1 c3 03 d1	sub	x1, x29, #0xf0
   3d820:	7b 52 00 f9	str	x27, [x19, #0xa0]
   3d824:	e8 03 1b aa	mov	x8, x27
   3d828:	e0 03 14 aa	mov	x0, x20
   3d82c:	03 04 80 52	mov	w3, #0x20
   3d830:	e4 03 14 aa	mov	x4, x20
   3d834:	e6 03 05 aa	mov	x6, x5
   3d838:	e7 03 15 aa	mov	x7, x21
   3d83c:	74 56 40 f9	ldr	x20, [x19, #0xa8]
   3d840:	76 5a 13 94	bl	0x514218 ; symbol stub for: _$s9CryptoKit12SharedSecretV23hkdfDerivedSymmetricKey5using4salt10sharedInfo15outputByteCountAA0gH0Vxm_q_q0_SitAA12HashFunctionRz10Foundation12DataProtocolR_AlMR0_r1_lF
   3d844:	ff 43 00 91	add	sp, sp, #0x10
   3d848:	a0 07 71 a9	ldp	x0, x1, [x29, #-0xf0]
   3d84c:	93 3f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3d850:	60 86 58 a9	ldp	x0, x1, [x19, #0x188]
   3d854:	02 00 80 d2	mov	x2, #0x0
   3d858:	2e 5a 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3d85c:	28 fc 7c d3	lsr	x8, x1, #60
   3d860:	1f 39 00 f1	cmp	x8, #0xe
   3d864:	89 2b 00 54	b.ls	0x3ddd4
   3d868:	77 82 40 f9	ldr	x23, [x19, #0x100]
   3d86c:	bb 04 80 d2	mov	x27, #0x25
   3d870:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3d874:	60 82 05 91	add	x0, x19, #0x160
   3d878:	17 44 00 94	bl	0x4e8d4
   3d87c:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3d880:	08 81 3e 91	add	x8, x8, #0xfa0 ; literal pool for: "Invalid wrapped DK nonce"
   3d884:	08 81 00 d1	sub	x8, x8, #0x20
   3d888:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3d88c:	20 38 00 90	adrp	x0, 1796 ; 0x741000
   3d890:	00 c0 12 91	add	x0, x0, #0x4b0
   3d894:	61 27 00 b0	adrp	x1, 1261 ; 0x52a000
   3d898:	21 a0 1c 91	add	x1, x1, #0x728
   3d89c:	04 9b ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3d8a0:	01 0a 80 52	mov	w1, #0x50
   3d8a4:	e2 00 80 52	mov	w2, #0x7
   3d8a8:	41 60 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3d8ac:	f5 03 00 aa	mov	x21, x0
   3d8b0:	68 27 00 b0	adrp	x8, 1261 ; 0x52a000
   3d8b4:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3d8b8:	00 04 80 3d	str	q0, [x0, #0x10]
   3d8bc:	a8 4c 8e d2	mov	x8, #0x7265
   3d8c0:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3d8c4:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3d8c8:	fa 03 00 aa	mov	x26, x0
   3d8cc:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3d8d0:	34 37 00 f0	adrp	x20, 1767 ; 0x724000
   3d8d4:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3d8d8:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3d8dc:	14 24 00 f9	str	x20, [x0, #0x48]
   3d8e0:	69 37 00 d1	sub	x9, x27, #0xd
   3d8e4:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3d8e8:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3d8ec:	8a 3f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3d8f0:	fc 03 00 aa	mov	x28, x0
   3d8f4:	e0 03 15 aa	mov	x0, x21
   3d8f8:	78 60 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3d8fc:	21 38 00 90	adrp	x1, 1796 ; 0x741000
   3d900:	21 e0 12 91	add	x1, x1, #0x4b8
   3d904:	62 27 00 b0	adrp	x2, 1261 ; 0x52a000
   3d908:	42 c0 1c 91	add	x2, x2, #0x730
   3d90c:	e0 03 1a aa	mov	x0, x26
   3d910:	40 48 00 94	bl	_$sypSgWOhTm
   3d914:	e0 03 15 aa	mov	x0, x21
   3d918:	01 04 80 52	mov	w1, #0x20
   3d91c:	e2 00 80 52	mov	w2, #0x7
   3d920:	3b 60 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3d924:	28 38 00 90	adrp	x8, 1796 ; 0x741000
   3d928:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3d92c:	8a 5f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3d930:	f5 03 00 aa	mov	x21, x0
   3d934:	28 37 00 f0	adrp	x8, 1767 ; 0x724000
   3d938:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3d93c:	23 37 00 f0	adrp	x3, 1767 ; 0x724000
   3d940:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3d944:	02 21 00 91	add	x2, x8, #0x8
   3d948:	f8 03 1c aa	mov	x24, x28
   3d94c:	e0 03 1c aa	mov	x0, x28
   3d950:	e1 03 14 aa	mov	x1, x20
   3d954:	e5 5a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3d958:	f4 03 00 aa	mov	x20, x0
   3d95c:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3d960:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3d964:	e0 03 15 aa	mov	x0, x21
   3d968:	e2 03 14 aa	mov	x2, x20
   3d96c:	03 00 80 d2	mov	x3, #0x0
   3d970:	cc 66 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3d974:	fd 03 1d aa	mov	x29, x29
   3d978:	80 5f 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3d97c:	f5 03 00 aa	mov	x21, x0
   3d980:	e0 03 14 aa	mov	x0, x20
   3d984:	77 5f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d988:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3d98c:	78 5f 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3d990:	d5 34 00 b4	cbz	x21, 0x3e028
   3d994:	e0 03 15 aa	mov	x0, x21
   3d998:	f3 59 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3d99c:	f4 03 00 aa	mov	x20, x0
   3d9a0:	fa 03 01 aa	mov	x26, x1
   3d9a4:	e0 03 15 aa	mov	x0, x21
   3d9a8:	6e 5f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3d9ac:	00 00 80 d2	mov	x0, #0x0
   3d9b0:	e6 5a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3d9b4:	fc 03 00 91	mov	x28, sp
   3d9b8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3d9bc:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3d9c0:	e9 03 08 aa	mov	x9, x8
   3d9c4:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3d9c8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3d9cc:	00 02 3f d6	blr	x16
   3d9d0:	e9 03 00 91	mov	x9, sp
   3d9d4:	08 3d 00 91	add	x8, x8, #0xf
   3d9d8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3d9dc:	35 01 08 cb	sub	x21, x9, x8
   3d9e0:	bf 02 00 91	mov	sp, x21
   3d9e4:	e8 03 15 aa	mov	x8, x21
   3d9e8:	d5 5a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3d9ec:	e0 03 14 aa	mov	x0, x20
   3d9f0:	e1 03 1a aa	mov	x1, x26
   3d9f4:	e2 03 15 aa	mov	x2, x21
   3d9f8:	ce 5a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3d9fc:	60 8e 00 f9	str	x0, [x19, #0x118]
   3da00:	f5 03 01 aa	mov	x21, x1
   3da04:	e0 03 14 aa	mov	x0, x20
   3da08:	e1 03 1a aa	mov	x1, x26
   3da0c:	23 3f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3da10:	9f 03 00 91	mov	sp, x28
   3da14:	d5 31 00 b4	cbz	x21, 0x3e04c
   3da18:	7b 8e 40 f9	ldr	x27, [x19, #0x118]
   3da1c:	90 01 00 14	b	0x3e05c
   3da20:	78 ee 08 a9	stp	x24, x27, [x19, #0x88]
   3da24:	7c 56 00 f9	str	x28, [x19, #0xa8]
   3da28:	00 00 80 d2	mov	x0, #0x0
   3da2c:	07 5a 13 94	bl	0x514248 ; symbol stub for: _$s9CryptoKit12SymmetricKeyVMa
   3da30:	e8 03 00 91	mov	x8, sp
   3da34:	68 4e 00 f9	str	x8, [x19, #0x98]
   3da38:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3da3c:	68 82 07 a9	stp	x8, x0, [x19, #0x78]
   3da40:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3da44:	e9 03 08 aa	mov	x9, x8
   3da48:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3da4c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3da50:	00 02 3f d6	blr	x16
   3da54:	e9 03 00 91	mov	x9, sp
   3da58:	08 3d 00 91	add	x8, x8, #0xf
   3da5c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3da60:	3b 01 08 cb	sub	x27, x9, x8
   3da64:	7f 03 00 91	mov	sp, x27
   3da68:	00 00 80 d2	mov	x0, #0x0
   3da6c:	8d 5a 13 94	bl	0x5144a0 ; symbol stub for: _$s9CryptoKit6SHA256VMa
   3da70:	f4 03 00 aa	mov	x20, x0
   3da74:	68 27 00 b0	adrp	x8, 1261 ; 0x52a000
   3da78:	00 b5 c1 3d	ldr	q0, [x8, #0x6d0]
   3da7c:	a8 03 04 d1	sub	x8, x29, #0x100
   3da80:	00 05 80 3d	str	q0, [x8, #0x10]
   3da84:	48 38 00 90	adrp	x8, 1800 ; 0x745000
   3da88:	08 05 41 f9	ldr	x8, [x8, #0x208]
   3da8c:	1f 05 00 b1	cmn	x8, #0x1
   3da90:	e1 1d 01 54	b.ne	0x3fe4c
   3da94:	20 38 00 90	adrp	x0, 1796 ; 0x741000
   3da98:	00 c0 1e 91	add	x0, x0, #0x7b0
   3da9c:	21 37 00 f0	adrp	x1, 1767 ; 0x724000
   3daa0:	21 30 40 f9	ldr	x1, [x1, #0x60] ; literal pool symbol address: _$s9CryptoKit6SHA256VMa
   3daa4:	22 37 00 f0	adrp	x2, 1767 ; 0x724000
   3daa8:	42 2c 40 f9	ldr	x2, [x2, #0x58] ; literal pool symbol address: _$s9CryptoKit6SHA256VAA12HashFunctionAAMc
   3daac:	a3 43 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   3dab0:	f5 03 00 aa	mov	x21, x0
   3dab4:	60 43 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   3dab8:	f8 03 00 aa	mov	x24, x0
   3dabc:	e0 03 bf a9	stp	x0, x0, [sp, #-0x10]!
   3dac0:	22 38 00 f0	adrp	x2, 1799 ; 0x744000
   3dac4:	42 20 3a 91	add	x2, x2, #0xe88
   3dac8:	25 37 00 f0	adrp	x5, 1767 ; 0x724000
   3dacc:	a5 18 40 f9	ldr	x5, [x5, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3dad0:	a1 c3 03 d1	sub	x1, x29, #0xf0
   3dad4:	7b 52 00 f9	str	x27, [x19, #0xa0]
   3dad8:	e8 03 1b aa	mov	x8, x27
   3dadc:	e0 03 14 aa	mov	x0, x20
   3dae0:	03 04 80 52	mov	w3, #0x20
   3dae4:	e4 03 14 aa	mov	x4, x20
   3dae8:	e6 03 05 aa	mov	x6, x5
   3daec:	e7 03 15 aa	mov	x7, x21
   3daf0:	74 56 40 f9	ldr	x20, [x19, #0xa8]
   3daf4:	c9 59 13 94	bl	0x514218 ; symbol stub for: _$s9CryptoKit12SharedSecretV23hkdfDerivedSymmetricKey5using4salt10sharedInfo15outputByteCountAA0gH0Vxm_q_q0_SitAA12HashFunctionRz10Foundation12DataProtocolR_AlMR0_r1_lF
   3daf8:	ff 43 00 91	add	sp, sp, #0x10
   3dafc:	a0 07 71 a9	ldp	x0, x1, [x29, #-0xf0]
   3db00:	e6 3e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3db04:	60 86 58 a9	ldp	x0, x1, [x19, #0x188]
   3db08:	02 00 80 d2	mov	x2, #0x0
   3db0c:	81 59 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3db10:	28 fc 7c d3	lsr	x8, x1, #60
   3db14:	1f 39 00 f1	cmp	x8, #0xe
   3db18:	09 1f 00 54	b.ls	0x3def8
   3db1c:	bb 04 80 d2	mov	x27, #0x25
   3db20:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3db24:	60 82 05 91	add	x0, x19, #0x160
   3db28:	6b 43 00 94	bl	0x4e8d4
   3db2c:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3db30:	08 81 3e 91	add	x8, x8, #0xfa0 ; literal pool for: "Invalid wrapped DK nonce"
   3db34:	08 81 00 d1	sub	x8, x8, #0x20
   3db38:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3db3c:	20 38 00 90	adrp	x0, 1796 ; 0x741000
   3db40:	00 c0 12 91	add	x0, x0, #0x4b0
   3db44:	61 27 00 b0	adrp	x1, 1261 ; 0x52a000
   3db48:	21 a0 1c 91	add	x1, x1, #0x728
   3db4c:	58 9a ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3db50:	01 0a 80 52	mov	w1, #0x50
   3db54:	e2 00 80 52	mov	w2, #0x7
   3db58:	95 5f 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3db5c:	f5 03 00 aa	mov	x21, x0
   3db60:	68 27 00 b0	adrp	x8, 1261 ; 0x52a000
   3db64:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3db68:	00 04 80 3d	str	q0, [x0, #0x10]
   3db6c:	a8 4c 8e d2	mov	x8, #0x7265
   3db70:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3db74:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3db78:	fa 03 00 aa	mov	x26, x0
   3db7c:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3db80:	34 37 00 f0	adrp	x20, 1767 ; 0x724000
   3db84:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3db88:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3db8c:	14 24 00 f9	str	x20, [x0, #0x48]
   3db90:	69 37 00 d1	sub	x9, x27, #0xd
   3db94:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3db98:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3db9c:	de 3e 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3dba0:	fc 03 00 aa	mov	x28, x0
   3dba4:	e0 03 15 aa	mov	x0, x21
   3dba8:	cc 5f 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3dbac:	21 38 00 90	adrp	x1, 1796 ; 0x741000
   3dbb0:	21 e0 12 91	add	x1, x1, #0x4b8
   3dbb4:	62 27 00 b0	adrp	x2, 1261 ; 0x52a000
   3dbb8:	42 c0 1c 91	add	x2, x2, #0x730
   3dbbc:	e0 03 1a aa	mov	x0, x26
   3dbc0:	94 47 00 94	bl	_$sypSgWOhTm
   3dbc4:	e0 03 15 aa	mov	x0, x21
   3dbc8:	01 04 80 52	mov	w1, #0x20
   3dbcc:	e2 00 80 52	mov	w2, #0x7
   3dbd0:	8f 5f 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3dbd4:	28 38 00 90	adrp	x8, 1796 ; 0x741000
   3dbd8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3dbdc:	de 5e 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3dbe0:	f5 03 00 aa	mov	x21, x0
   3dbe4:	28 37 00 f0	adrp	x8, 1767 ; 0x724000
   3dbe8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3dbec:	23 37 00 f0	adrp	x3, 1767 ; 0x724000
   3dbf0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3dbf4:	02 21 00 91	add	x2, x8, #0x8
   3dbf8:	f8 03 1c aa	mov	x24, x28
   3dbfc:	e0 03 1c aa	mov	x0, x28
   3dc00:	e1 03 14 aa	mov	x1, x20
   3dc04:	39 5a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3dc08:	f4 03 00 aa	mov	x20, x0
   3dc0c:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3dc10:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3dc14:	e0 03 15 aa	mov	x0, x21
   3dc18:	e2 03 14 aa	mov	x2, x20
   3dc1c:	03 00 80 d2	mov	x3, #0x0
   3dc20:	20 66 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3dc24:	fd 03 1d aa	mov	x29, x29
   3dc28:	d4 5e 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3dc2c:	f5 03 00 aa	mov	x21, x0
   3dc30:	e0 03 14 aa	mov	x0, x20
   3dc34:	cb 5e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3dc38:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3dc3c:	cc 5e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3dc40:	95 24 00 b4	cbz	x21, 0x3e0d0
   3dc44:	e0 03 15 aa	mov	x0, x21
   3dc48:	47 59 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3dc4c:	f4 03 00 aa	mov	x20, x0
   3dc50:	fa 03 01 aa	mov	x26, x1
   3dc54:	e0 03 15 aa	mov	x0, x21
   3dc58:	c2 5e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3dc5c:	00 00 80 d2	mov	x0, #0x0
   3dc60:	3a 5a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3dc64:	fc 03 00 91	mov	x28, sp
   3dc68:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3dc6c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3dc70:	e9 03 08 aa	mov	x9, x8
   3dc74:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3dc78:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3dc7c:	00 02 3f d6	blr	x16
   3dc80:	e9 03 00 91	mov	x9, sp
   3dc84:	08 3d 00 91	add	x8, x8, #0xf
   3dc88:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3dc8c:	35 01 08 cb	sub	x21, x9, x8
   3dc90:	bf 02 00 91	mov	sp, x21
   3dc94:	e8 03 15 aa	mov	x8, x21
   3dc98:	29 5a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3dc9c:	e0 03 14 aa	mov	x0, x20
   3dca0:	e1 03 1a aa	mov	x1, x26
   3dca4:	e2 03 15 aa	mov	x2, x21
   3dca8:	22 5a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3dcac:	60 86 00 f9	str	x0, [x19, #0x108]
   3dcb0:	f5 03 01 aa	mov	x21, x1
   3dcb4:	e0 03 14 aa	mov	x0, x20
   3dcb8:	e1 03 1a aa	mov	x1, x26
   3dcbc:	77 3e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3dcc0:	9f 03 00 91	mov	sp, x28
   3dcc4:	95 21 00 b4	cbz	x21, 0x3e0f4
   3dcc8:	7b 86 40 f9	ldr	x27, [x19, #0x108]
   3dccc:	0e 01 00 14	b	0x3e104
   3dcd0:	40 38 00 90	adrp	x0, 1800 ; 0x745000
   3dcd4:	00 e0 07 91	add	x0, x0, #0x1f8
   3dcd8:	81 ff ff f0	adrp	x1, -13 ; 0x30000
   3dcdc:	21 40 23 91	add	x1, x1, #0x8d0
   3dce0:	72 5f 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3dce4:	8a f8 ff 17	b	0x3bf0c
   3dce8:	f4 03 00 aa	mov	x20, x0
   3dcec:	e2 58 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3dcf0:	fa 03 00 aa	mov	x26, x0
   3dcf4:	e0 03 14 aa	mov	x0, x20
   3dcf8:	9a 5e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3dcfc:	f5 03 1a aa	mov	x21, x26
   3dd00:	7f 5f 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3dd04:	e0 03 1a aa	mov	x0, x26
   3dd08:	4a 5f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3dd0c:	78 8a 40 f9	ldr	x24, [x19, #0x110]
   3dd10:	e8 26 00 90	adrp	x8, 1244 ; 0x519000
   3dd14:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3dd18:	08 81 00 d1	sub	x8, x8, #0x20
   3dd1c:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3dd20:	74 6a 4f a9	ldp	x20, x26, [x19, #0xf0]
   3dd24:	7c 76 40 f9	ldr	x28, [x19, #0xe8]
   3dd28:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3dd2c:	e1 03 19 aa	mov	x1, x25
   3dd30:	4e 47 00 94	bl	0x4fa68
   3dd34:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3dd38:	4c 47 00 94	bl	0x4fa68
   3dd3c:	60 86 40 f9	ldr	x0, [x19, #0x108]
   3dd40:	27 5f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3dd44:	e0 03 17 aa	mov	x0, x23
   3dd48:	e1 03 16 aa	mov	x1, x22
   3dd4c:	47 47 00 94	bl	0x4fa68
   3dd50:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3dd54:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dd58:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3dd5c:	00 01 3f d6	blr	x8
   3dd60:	88 07 40 f9	ldr	x8, [x28, #0x8]
   3dd64:	e0 03 1a aa	mov	x0, x26
   3dd68:	e1 03 14 aa	mov	x1, x20
   3dd6c:	00 01 3f d6	blr	x8
   3dd70:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3dd74:	1f 01 00 91	mov	sp, x8
   3dd78:	1f 03 00 91	mov	sp, x24
   3dd7c:	ea f8 ff 17	b	0x3c124
   3dd80:	7b f2 07 a9	stp	x27, x28, [x19, #0x78]
   3dd84:	78 46 00 f9	str	x24, [x19, #0x88]
   3dd88:	78 56 40 f9	ldr	x24, [x19, #0xa8]
   3dd8c:	b4 03 04 d1	sub	x20, x29, #0x100
   3dd90:	76 86 00 f9	str	x22, [x19, #0x108]
   3dd94:	60 86 59 a9	ldp	x0, x1, [x19, #0x198]
   3dd98:	02 00 80 d2	mov	x2, #0x0
   3dd9c:	dd 58 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3dda0:	fb 03 00 aa	mov	x27, x0
   3dda4:	f9 03 01 aa	mov	x25, x1
   3dda8:	60 82 05 91	add	x0, x19, #0x160
   3ddac:	ca 42 00 94	bl	0x4e8d4
   3ddb0:	28 ff 7c d3	lsr	x8, x25, #60
   3ddb4:	1f 39 00 f1	cmp	x8, #0xe
   3ddb8:	28 25 00 54	b.hi	0x3e25c
   3ddbc:	28 ff 7e d3	lsr	x8, x25, #62
   3ddc0:	1f 05 00 71	cmp	w8, #0x1
   3ddc4:	cc 21 00 54	b.gt	0x3e1fc
   3ddc8:	68 22 00 35	cbnz	w8, 0x3e214
   3ddcc:	29 df 70 d3	ubfx	x9, x25, #48, #8
   3ddd0:	15 01 00 14	b	0x3e224
   3ddd4:	fb 03 00 aa	mov	x27, x0
   3ddd8:	fc 03 01 aa	mov	x28, x1
   3dddc:	00 00 80 d2	mov	x0, #0x0
   3dde0:	ff 58 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   3dde4:	e8 03 00 91	mov	x8, sp
   3dde8:	68 3a 00 f9	str	x8, [x19, #0x70]
   3ddec:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3ddf0:	68 02 05 a9	stp	x8, x0, [x19, #0x50]
   3ddf4:	0c 21 40 f9	ldr	x12, [x8, #0x40]
   3ddf8:	e9 03 0c aa	mov	x9, x12
   3ddfc:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3de00:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3de04:	00 02 3f d6	blr	x16
   3de08:	e8 03 00 91	mov	x8, sp
   3de0c:	6c 22 00 f9	str	x12, [x19, #0x40]
   3de10:	89 3d 00 91	add	x9, x12, #0xf
   3de14:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3de18:	15 01 09 cb	sub	x21, x8, x9
   3de1c:	bf 02 00 91	mov	sp, x21
   3de20:	bb 73 31 a9	stp	x27, x28, [x29, #-0xf0]
   3de24:	7b 72 06 a9	stp	x27, x28, [x19, #0x60]
   3de28:	e0 03 1b aa	mov	x0, x27
   3de2c:	e1 03 1c aa	mov	x1, x28
   3de30:	e7 3e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3de34:	3b 37 00 f0	adrp	x27, 1767 ; 0x724000
   3de38:	7b 1b 40 f9	ldr	x27, [x27, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3de3c:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3de40:	75 26 00 f9	str	x21, [x19, #0x48]
   3de44:	e8 03 15 aa	mov	x8, x21
   3de48:	e1 03 1b aa	mov	x1, x27
   3de4c:	fc 03 18 aa	mov	x28, x24
   3de50:	e2 03 18 aa	mov	x2, x24
   3de54:	f5 03 1a aa	mov	x21, x26
   3de58:	de 58 13 94	bl	0x5141d0 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV4dataAEx_tKc10Foundation12DataProtocolRzlufC
   3de5c:	fa 03 15 aa	mov	x26, x21
   3de60:	95 18 00 b4	cbz	x21, 0x3e170
   3de64:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3de68:	e1 03 19 aa	mov	x1, x25
   3de6c:	ff 46 00 94	bl	0x4fa68
   3de70:	60 82 05 91	add	x0, x19, #0x160
   3de74:	98 42 00 94	bl	0x4e8d4
   3de78:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3de7c:	fb 46 00 94	bl	0x4fa68
   3de80:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3de84:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3de88:	f8 46 00 94	bl	0x4fa68
   3de8c:	60 82 40 f9	ldr	x0, [x19, #0x100]
   3de90:	e1 03 16 aa	mov	x1, x22
   3de94:	f5 46 00 94	bl	0x4fa68
   3de98:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3de9c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dea0:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3dea4:	00 01 3f d6	blr	x8
   3dea8:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3deac:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3deb0:	e0 03 14 aa	mov	x0, x20
   3deb4:	61 5a 40 f9	ldr	x1, [x19, #0xb0]
   3deb8:	00 01 3f d6	blr	x8
   3debc:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3dec0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dec4:	60 4e 40 f9	ldr	x0, [x19, #0x98]
   3dec8:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3decc:	00 01 3f d6	blr	x8
   3ded0:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3ded4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3ded8:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3dedc:	00 01 3f d6	blr	x8
   3dee0:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3dee4:	1f 01 00 91	mov	sp, x8
   3dee8:	68 4a 40 f9	ldr	x8, [x19, #0x90]
   3deec:	1f 01 00 91	mov	sp, x8
   3def0:	68 66 40 f9	ldr	x8, [x19, #0xc8]
   3def4:	de fd ff 17	b	0x3d66c
   3def8:	fb 03 00 aa	mov	x27, x0
   3defc:	fc 03 01 aa	mov	x28, x1
   3df00:	00 00 80 d2	mov	x0, #0x0
   3df04:	b6 58 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   3df08:	e8 03 00 91	mov	x8, sp
   3df0c:	68 3a 00 f9	str	x8, [x19, #0x70]
   3df10:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3df14:	68 02 05 a9	stp	x8, x0, [x19, #0x50]
   3df18:	0c 21 40 f9	ldr	x12, [x8, #0x40]
   3df1c:	e9 03 0c aa	mov	x9, x12
   3df20:	30 37 00 f0	adrp	x16, 1767 ; 0x724000
   3df24:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3df28:	00 02 3f d6	blr	x16
   3df2c:	e8 03 00 91	mov	x8, sp
   3df30:	6c 22 00 f9	str	x12, [x19, #0x40]
   3df34:	89 3d 00 91	add	x9, x12, #0xf
   3df38:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3df3c:	15 01 09 cb	sub	x21, x8, x9
   3df40:	bf 02 00 91	mov	sp, x21
   3df44:	bb 73 31 a9	stp	x27, x28, [x29, #-0xf0]
   3df48:	7b 72 06 a9	stp	x27, x28, [x19, #0x60]
   3df4c:	e0 03 1b aa	mov	x0, x27
   3df50:	e1 03 1c aa	mov	x1, x28
   3df54:	9e 3e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3df58:	3b 37 00 f0	adrp	x27, 1767 ; 0x724000
   3df5c:	7b 1b 40 f9	ldr	x27, [x27, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3df60:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3df64:	75 26 00 f9	str	x21, [x19, #0x48]
   3df68:	e8 03 15 aa	mov	x8, x21
   3df6c:	e1 03 1b aa	mov	x1, x27
   3df70:	fc 03 18 aa	mov	x28, x24
   3df74:	e2 03 18 aa	mov	x2, x24
   3df78:	f5 03 1a aa	mov	x21, x26
   3df7c:	95 58 13 94	bl	0x5141d0 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV4dataAEx_tKc10Foundation12DataProtocolRzlufC
   3df80:	fa 03 15 aa	mov	x26, x21
   3df84:	b5 11 00 b4	cbz	x21, 0x3e1b8
   3df88:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3df8c:	e1 03 19 aa	mov	x1, x25
   3df90:	b6 46 00 94	bl	0x4fa68
   3df94:	60 82 05 91	add	x0, x19, #0x160
   3df98:	4f 42 00 94	bl	0x4e8d4
   3df9c:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3dfa0:	b2 46 00 94	bl	0x4fa68
   3dfa4:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3dfa8:	b0 46 00 94	bl	0x4fa68
   3dfac:	e0 03 17 aa	mov	x0, x23
   3dfb0:	e1 03 16 aa	mov	x1, x22
   3dfb4:	ad 46 00 94	bl	0x4fa68
   3dfb8:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3dfbc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dfc0:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3dfc4:	00 01 3f d6	blr	x8
   3dfc8:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3dfcc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dfd0:	e0 03 14 aa	mov	x0, x20
   3dfd4:	61 4a 40 f9	ldr	x1, [x19, #0x90]
   3dfd8:	00 01 3f d6	blr	x8
   3dfdc:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3dfe0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dfe4:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3dfe8:	00 01 3f d6	blr	x8
   3dfec:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3dff0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3dff4:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3dff8:	00 01 3f d6	blr	x8
   3dffc:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3e000:	1f 01 00 91	mov	sp, x8
   3e004:	68 4e 40 f9	ldr	x8, [x19, #0x98]
   3e008:	1f 01 00 91	mov	sp, x8
   3e00c:	97 fd ff 17	b	0x3d668
   3e010:	20 38 00 f0	adrp	x0, 1799 ; 0x745000
   3e014:	00 00 08 91	add	x0, x0, #0x200
   3e018:	81 ff ff d0	adrp	x1, -14 ; 0x30000
   3e01c:	21 f0 24 91	add	x1, x1, #0x93c
   3e020:	a2 5e 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3e024:	56 f8 ff 17	b	0x3c17c
   3e028:	f4 03 00 aa	mov	x20, x0
   3e02c:	12 58 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3e030:	fa 03 00 aa	mov	x26, x0
   3e034:	e0 03 14 aa	mov	x0, x20
   3e038:	ca 5d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e03c:	f5 03 1a aa	mov	x21, x26
   3e040:	af 5e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3e044:	e0 03 1a aa	mov	x0, x26
   3e048:	7a 5e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3e04c:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e050:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3e054:	08 81 00 d1	sub	x8, x8, #0x20
   3e058:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3e05c:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3e060:	e1 03 19 aa	mov	x1, x25
   3e064:	81 46 00 94	bl	0x4fa68
   3e068:	e0 03 18 aa	mov	x0, x24
   3e06c:	5c 5e 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3e070:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3e074:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3e078:	7c 46 00 94	bl	0x4fa68
   3e07c:	e0 03 17 aa	mov	x0, x23
   3e080:	e1 03 16 aa	mov	x1, x22
   3e084:	79 46 00 94	bl	0x4fa68
   3e088:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3e08c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e090:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3e094:	00 01 3f d6	blr	x8
   3e098:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3e09c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e0a0:	60 86 4a a9	ldp	x0, x1, [x19, #0xa8]
   3e0a4:	00 01 3f d6	blr	x8
   3e0a8:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3e0ac:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e0b0:	60 4e 40 f9	ldr	x0, [x19, #0x98]
   3e0b4:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3e0b8:	00 01 3f d6	blr	x8
   3e0bc:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3e0c0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e0c4:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3e0c8:	00 01 3f d6	blr	x8
   3e0cc:	1b 02 00 14	b	0x3e938
   3e0d0:	f4 03 00 aa	mov	x20, x0
   3e0d4:	e8 57 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3e0d8:	fa 03 00 aa	mov	x26, x0
   3e0dc:	e0 03 14 aa	mov	x0, x20
   3e0e0:	a0 5d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e0e4:	f5 03 1a aa	mov	x21, x26
   3e0e8:	85 5e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3e0ec:	e0 03 1a aa	mov	x0, x26
   3e0f0:	50 5e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3e0f4:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e0f8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3e0fc:	08 81 00 d1	sub	x8, x8, #0x20
   3e100:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3e104:	60 92 40 f9	ldr	x0, [x19, #0x120]
   3e108:	e1 03 19 aa	mov	x1, x25
   3e10c:	57 46 00 94	bl	0x4fa68
   3e110:	e0 03 18 aa	mov	x0, x24
   3e114:	32 5e 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3e118:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3e11c:	53 46 00 94	bl	0x4fa68
   3e120:	e0 03 17 aa	mov	x0, x23
   3e124:	e1 03 16 aa	mov	x1, x22
   3e128:	50 46 00 94	bl	0x4fa68
   3e12c:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3e130:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e134:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3e138:	00 01 3f d6	blr	x8
   3e13c:	68 86 48 a9	ldp	x8, x1, [x19, #0x88]
   3e140:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e144:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3e148:	00 01 3f d6	blr	x8
   3e14c:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3e150:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e154:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3e158:	00 01 3f d6	blr	x8
   3e15c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3e160:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e164:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3e168:	00 01 3f d6	blr	x8
   3e16c:	a2 02 00 14	b	0x3ebf4
   3e170:	76 86 00 f9	str	x22, [x19, #0x108]
   3e174:	79 8e 00 f9	str	x25, [x19, #0x118]
   3e178:	60 86 59 a9	ldp	x0, x1, [x19, #0x198]
   3e17c:	02 00 80 d2	mov	x2, #0x0
   3e180:	e4 57 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3e184:	f9 03 00 aa	mov	x25, x0
   3e188:	f8 03 01 aa	mov	x24, x1
   3e18c:	60 82 05 91	add	x0, x19, #0x160
   3e190:	d1 41 00 94	bl	0x4e8d4
   3e194:	08 ff 7c d3	lsr	x8, x24, #60
   3e198:	1f 39 00 f1	cmp	x8, #0xe
   3e19c:	c8 29 00 54	b.hi	0x3e6d4
   3e1a0:	08 ff 7e d3	lsr	x8, x24, #62
   3e1a4:	1f 05 00 71	cmp	w8, #0x1
   3e1a8:	ac 17 00 54	b.gt	0x3e49c
   3e1ac:	08 27 00 35	cbnz	w8, 0x3e68c
   3e1b0:	09 df 70 d3	ubfx	x9, x24, #48, #8
   3e1b4:	3a 01 00 14	b	0x3e69c
   3e1b8:	77 5a 10 a9	stp	x23, x22, [x19, #0x100]
   3e1bc:	60 86 59 a9	ldp	x0, x1, [x19, #0x198]
   3e1c0:	02 00 80 d2	mov	x2, #0x0
   3e1c4:	d3 57 13 94	bl	0x514110 ; symbol stub for: _$s10Foundation4DataV13base64Encoded7optionsACSgSSh_So27NSDataBase64DecodingOptionsVtcfC
   3e1c8:	f9 03 00 aa	mov	x25, x0
   3e1cc:	f8 03 01 aa	mov	x24, x1
   3e1d0:	60 82 05 91	add	x0, x19, #0x160
   3e1d4:	c0 41 00 94	bl	0x4e8d4
   3e1d8:	08 ff 7c d3	lsr	x8, x24, #60
   3e1dc:	1f 39 00 f1	cmp	x8, #0xe
   3e1e0:	88 3d 00 54	b.hi	0x3e990
   3e1e4:	08 ff 7e d3	lsr	x8, x24, #62
   3e1e8:	1f 05 00 71	cmp	w8, #0x1
   3e1ec:	4c 16 00 54	b.gt	0x3e4b4
   3e1f0:	c8 3a 00 35	cbnz	w8, 0x3e948
   3e1f4:	09 df 70 d3	ubfx	x9, x24, #48, #8
   3e1f8:	d8 01 00 14	b	0x3e958
   3e1fc:	1f 09 00 71	cmp	w8, #0x2
   3e200:	81 02 00 54	b.ne	0x3e250
   3e204:	6a 27 41 a9	ldp	x10, x9, [x27, #0x10]
   3e208:	29 01 0a eb	subs	x9, x9, x10
   3e20c:	c7 00 00 54	b.vc	0x3e224
   3e210:	20 00 20 d4	brk	#0x1
   3e214:	69 ff 60 d3	lsr	x9, x27, #32
   3e218:	29 01 1b 6b	subs	w9, w9, w27
   3e21c:	66 e2 00 54	b.vs	0x3fe68
   3e220:	29 7d 40 93	sxtw	x9, w9
   3e224:	3f 45 00 f1	cmp	x9, #0x11
   3e228:	4b 01 00 54	b.lt	0x3e250
   3e22c:	1f 09 00 71	cmp	w8, #0x2
   3e230:	e0 14 00 54	b.eq	0x3e4cc
   3e234:	1f 05 00 71	cmp	w8, #0x1
   3e238:	21 15 00 54	b.ne	0x3e4dc
   3e23c:	68 ff 60 d3	lsr	x8, x27, #32
   3e240:	08 01 1b 6b	subs	w8, w8, w27
   3e244:	46 e2 00 54	b.vs	0x3fe8c
   3e248:	08 7d 40 93	sxtw	x8, w8
   3e24c:	a5 00 00 14	b	0x3e4e0
   3e250:	e0 03 1b aa	mov	x0, x27
   3e254:	e1 03 19 aa	mov	x1, x25
   3e258:	04 46 00 94	bl	0x4fa68
   3e25c:	bb 04 80 d2	mov	x27, #0x25
   3e260:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3e264:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e268:	08 01 3f 91	add	x8, x8, #0xfc0 ; literal pool for: "Invalid wrapped DK ciphertext"
   3e26c:	08 81 00 d1	sub	x8, x8, #0x20
   3e270:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3e274:	00 38 00 f0	adrp	x0, 1795 ; 0x741000
   3e278:	00 c0 12 91	add	x0, x0, #0x4b0
   3e27c:	61 27 00 90	adrp	x1, 1260 ; 0x52a000
   3e280:	21 a0 1c 91	add	x1, x1, #0x728
   3e284:	8a 98 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3e288:	01 0a 80 52	mov	w1, #0x50
   3e28c:	e2 00 80 52	mov	w2, #0x7
   3e290:	c7 5d 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3e294:	f5 03 00 aa	mov	x21, x0
   3e298:	68 27 00 90	adrp	x8, 1260 ; 0x52a000
   3e29c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3e2a0:	00 04 80 3d	str	q0, [x0, #0x10]
   3e2a4:	a8 4c 8e d2	mov	x8, #0x7265
   3e2a8:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3e2ac:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3e2b0:	fa 03 00 aa	mov	x26, x0
   3e2b4:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3e2b8:	34 37 00 d0	adrp	x20, 1766 ; 0x724000
   3e2bc:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3e2c0:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3e2c4:	14 24 00 f9	str	x20, [x0, #0x48]
   3e2c8:	69 23 00 d1	sub	x9, x27, #0x8
   3e2cc:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3e2d0:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3e2d4:	10 3d 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3e2d8:	f9 03 00 aa	mov	x25, x0
   3e2dc:	e0 03 15 aa	mov	x0, x21
   3e2e0:	fe 5d 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3e2e4:	01 38 00 f0	adrp	x1, 1795 ; 0x741000
   3e2e8:	21 e0 12 91	add	x1, x1, #0x4b8
   3e2ec:	62 27 00 90	adrp	x2, 1260 ; 0x52a000
   3e2f0:	42 c0 1c 91	add	x2, x2, #0x730
   3e2f4:	e0 03 1a aa	mov	x0, x26
   3e2f8:	c6 45 00 94	bl	_$sypSgWOhTm
   3e2fc:	e0 03 15 aa	mov	x0, x21
   3e300:	01 04 80 52	mov	w1, #0x20
   3e304:	e2 00 80 52	mov	w2, #0x7
   3e308:	c1 5d 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3e30c:	08 38 00 f0	adrp	x8, 1795 ; 0x741000
   3e310:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3e314:	10 5d 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3e318:	f5 03 00 aa	mov	x21, x0
   3e31c:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3e320:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3e324:	23 37 00 d0	adrp	x3, 1766 ; 0x724000
   3e328:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3e32c:	02 21 00 91	add	x2, x8, #0x8
   3e330:	e0 03 19 aa	mov	x0, x25
   3e334:	e1 03 14 aa	mov	x1, x20
   3e338:	6c 58 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3e33c:	f4 03 00 aa	mov	x20, x0
   3e340:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3e344:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3e348:	e0 03 15 aa	mov	x0, x21
   3e34c:	e2 03 14 aa	mov	x2, x20
   3e350:	03 00 80 d2	mov	x3, #0x0
   3e354:	53 64 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3e358:	fd 03 1d aa	mov	x29, x29
   3e35c:	07 5d 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3e360:	f5 03 00 aa	mov	x21, x0
   3e364:	e0 03 14 aa	mov	x0, x20
   3e368:	fe 5c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e36c:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3e370:	ff 5c 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3e374:	95 04 00 b4	cbz	x21, 0x3e404
   3e378:	e0 03 15 aa	mov	x0, x21
   3e37c:	7a 57 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3e380:	f4 03 00 aa	mov	x20, x0
   3e384:	fa 03 01 aa	mov	x26, x1
   3e388:	e0 03 15 aa	mov	x0, x21
   3e38c:	f5 5c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e390:	00 00 80 d2	mov	x0, #0x0
   3e394:	6d 58 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3e398:	fc 03 00 91	mov	x28, sp
   3e39c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3e3a0:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3e3a4:	e9 03 08 aa	mov	x9, x8
   3e3a8:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3e3ac:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3e3b0:	00 02 3f d6	blr	x16
   3e3b4:	e9 03 00 91	mov	x9, sp
   3e3b8:	08 3d 00 91	add	x8, x8, #0xf
   3e3bc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3e3c0:	35 01 08 cb	sub	x21, x9, x8
   3e3c4:	bf 02 00 91	mov	sp, x21
   3e3c8:	e8 03 15 aa	mov	x8, x21
   3e3cc:	5c 58 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3e3d0:	e0 03 14 aa	mov	x0, x20
   3e3d4:	e1 03 1a aa	mov	x1, x26
   3e3d8:	e2 03 15 aa	mov	x2, x21
   3e3dc:	55 58 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3e3e0:	f6 03 00 aa	mov	x22, x0
   3e3e4:	f5 03 01 aa	mov	x21, x1
   3e3e8:	e0 03 14 aa	mov	x0, x20
   3e3ec:	e1 03 1a aa	mov	x1, x26
   3e3f0:	aa 3c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3e3f4:	9f 03 00 91	mov	sp, x28
   3e3f8:	95 01 00 b4	cbz	x21, 0x3e428
   3e3fc:	fb 03 16 aa	mov	x27, x22
   3e400:	0e 00 00 14	b	0x3e438
   3e404:	f4 03 00 aa	mov	x20, x0
   3e408:	1b 57 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3e40c:	fa 03 00 aa	mov	x26, x0
   3e410:	e0 03 14 aa	mov	x0, x20
   3e414:	d3 5c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e418:	f5 03 1a aa	mov	x21, x26
   3e41c:	b8 5d 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3e420:	e0 03 1a aa	mov	x0, x26
   3e424:	83 5d 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3e428:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e42c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3e430:	08 81 00 d1	sub	x8, x8, #0x20
   3e434:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3e438:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3e43c:	8b 45 00 94	bl	0x4fa68
   3e440:	e0 03 19 aa	mov	x0, x25
   3e444:	66 5d 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3e448:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3e44c:	87 45 00 94	bl	0x4fa68
   3e450:	60 86 47 a9	ldp	x0, x1, [x19, #0x78]
   3e454:	85 45 00 94	bl	0x4fa68
   3e458:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3e45c:	83 45 00 94	bl	0x4fa68
   3e460:	60 a2 49 a9	ldp	x0, x8, [x19, #0x98]
   3e464:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e468:	61 46 40 f9	ldr	x1, [x19, #0x88]
   3e46c:	00 01 3f d6	blr	x8
   3e470:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3e474:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e478:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3e47c:	00 01 3f d6	blr	x8
   3e480:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3e484:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e488:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3e48c:	00 01 3f d6	blr	x8
   3e490:	1f 03 00 91	mov	sp, x24
   3e494:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3e498:	dc 01 00 14	b	0x3ec08
   3e49c:	1f 09 00 71	cmp	w8, #0x2
   3e4a0:	41 11 00 54	b.ne	0x3e6c8
   3e4a4:	2a 27 41 a9	ldp	x10, x9, [x25, #0x10]
   3e4a8:	29 01 0a eb	subs	x9, x9, x10
   3e4ac:	87 0f 00 54	b.vc	0x3e69c
   3e4b0:	20 00 20 d4	brk	#0x1
   3e4b4:	1f 09 00 71	cmp	w8, #0x2
   3e4b8:	61 26 00 54	b.ne	0x3e984
   3e4bc:	2a 27 41 a9	ldp	x10, x9, [x25, #0x10]
   3e4c0:	29 01 0a eb	subs	x9, x9, x10
   3e4c4:	a7 24 00 54	b.vc	0x3e958
   3e4c8:	20 00 20 d4	brk	#0x1
   3e4cc:	69 23 41 a9	ldp	x9, x8, [x27, #0x10]
   3e4d0:	08 01 09 eb	subs	x8, x8, x9
   3e4d4:	67 00 00 54	b.vc	0x3e4e0
   3e4d8:	20 00 20 d4	brk	#0x1
   3e4dc:	28 df 70 d3	ubfx	x8, x25, #48, #8
   3e4e0:	15 41 00 f1	subs	x21, x8, #0x10
   3e4e4:	06 cc 00 54	b.vs	0x3fe64
   3e4e8:	e0 03 1b aa	mov	x0, x27
   3e4ec:	e1 03 19 aa	mov	x1, x25
   3e4f0:	37 3d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3e4f4:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3e4f8:	e0 03 15 aa	mov	x0, x21
   3e4fc:	e1 03 1b aa	mov	x1, x27
   3e500:	e2 03 19 aa	mov	x2, x25
   3e504:	74 06 00 94	bl	_$sSlsE6prefixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3e508:	b5 73 71 a9	ldp	x21, x28, [x29, #-0xf0]
   3e50c:	e0 03 1b aa	mov	x0, x27
   3e510:	e1 03 19 aa	mov	x1, x25
   3e514:	2e 3d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3e518:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3e51c:	00 02 80 52	mov	w0, #0x10
   3e520:	e1 03 1b aa	mov	x1, x27
   3e524:	e2 03 19 aa	mov	x2, x25
   3e528:	bc 06 00 94	bl	_$sSKsE6suffixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3e52c:	e8 03 00 91	mov	x8, sp
   3e530:	68 2e 00 f9	str	x8, [x19, #0x58]
   3e534:	a9 23 71 a9	ldp	x9, x8, [x29, #-0xf0]
   3e538:	69 a2 06 a9	stp	x9, x8, [x19, #0x68]
   3e53c:	6c 4a 40 f9	ldr	x12, [x19, #0x90]
   3e540:	e9 03 0c aa	mov	x9, x12
   3e544:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3e548:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3e54c:	00 02 3f d6	blr	x16
   3e550:	e8 03 00 91	mov	x8, sp
   3e554:	89 3d 00 91	add	x9, x12, #0xf
   3e558:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3e55c:	00 01 09 cb	sub	x0, x8, x9
   3e560:	1f 00 00 91	mov	sp, x0
   3e564:	61 a2 49 a9	ldp	x1, x8, [x19, #0x98]
   3e568:	08 09 40 f9	ldr	x8, [x8, #0x10]
   3e56c:	60 2a 00 f9	str	x0, [x19, #0x50]
   3e570:	62 46 40 f9	ldr	x2, [x19, #0x88]
   3e574:	00 01 3f d6	blr	x8
   3e578:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3e57c:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3e580:	21 37 00 d0	adrp	x1, 1766 ; 0x724000
   3e584:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3e588:	a1 a3 32 a9	stp	x1, x8, [x29, #-0xd8]
   3e58c:	75 4a 00 f9	str	x21, [x19, #0x90]
   3e590:	b5 73 31 a9	stp	x21, x28, [x29, #-0xf0]
   3e594:	7c 32 00 f9	str	x28, [x19, #0x60]
   3e598:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3e59c:	2c 3d 00 94	bl	___swift_project_boxed_opaque_existential_1
   3e5a0:	08 54 40 a9	ldp	x8, x21, [x0]
   3e5a4:	a9 fe 7e d3	lsr	x9, x21, #62
   3e5a8:	3f 05 00 71	cmp	w9, #0x1
   3e5ac:	cc 04 00 54	b.gt	0x3e644
   3e5b0:	49 33 00 35	cbnz	w9, 0x3ec18
   3e5b4:	09 fd 48 d3	lsr	x9, x8, #8
   3e5b8:	a8 03 10 38	sturb	w8, [x29, #-0x100]
   3e5bc:	0a fd 50 d3	lsr	x10, x8, #16
   3e5c0:	0b fd 58 d3	lsr	x11, x8, #24
   3e5c4:	a9 13 10 38	sturb	w9, [x29, #-0xff]
   3e5c8:	aa 23 10 38	sturb	w10, [x29, #-0xfe]
   3e5cc:	09 fd 60 d3	lsr	x9, x8, #32
   3e5d0:	0a fd 68 d3	lsr	x10, x8, #40
   3e5d4:	ab 33 10 38	sturb	w11, [x29, #-0xfd]
   3e5d8:	a9 43 10 38	sturb	w9, [x29, #-0xfc]
   3e5dc:	09 fd 70 d3	lsr	x9, x8, #48
   3e5e0:	08 fd 78 d3	lsr	x8, x8, #56
   3e5e4:	aa 53 10 38	sturb	w10, [x29, #-0xfb]
   3e5e8:	a9 63 10 38	sturb	w9, [x29, #-0xfa]
   3e5ec:	a9 fe 48 d3	lsr	x9, x21, #8
   3e5f0:	aa fe 50 d3	lsr	x10, x21, #16
   3e5f4:	a8 73 10 38	sturb	w8, [x29, #-0xf9]
   3e5f8:	b5 83 10 38	sturb	w21, [x29, #-0xf8]
   3e5fc:	a8 fe 58 d3	lsr	x8, x21, #24
   3e600:	ab fe 60 d3	lsr	x11, x21, #32
   3e604:	a9 93 10 38	sturb	w9, [x29, #-0xf7]
   3e608:	aa a3 10 38	sturb	w10, [x29, #-0xf6]
   3e60c:	a9 fe 68 d3	lsr	x9, x21, #40
   3e610:	aa fe 70 d3	lsr	x10, x21, #48
   3e614:	a8 b3 10 38	sturb	w8, [x29, #-0xf5]
   3e618:	ab c3 10 38	sturb	w11, [x29, #-0xf4]
   3e61c:	a8 03 04 d1	sub	x8, x29, #0x100
   3e620:	a9 d3 10 38	sturb	w9, [x29, #-0xf3]
   3e624:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3e628:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3e62c:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3e630:	e7 3c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3e634:	a8 03 03 d1	sub	x8, x29, #0xc0
   3e638:	a0 03 04 d1	sub	x0, x29, #0x100
   3e63c:	e1 03 14 aa	mov	x1, x20
   3e640:	69 03 00 14	b	0x3f3e4
   3e644:	3f 09 00 71	cmp	w9, #0x2
   3e648:	61 31 00 54	b.ne	0x3ec74
   3e64c:	09 21 41 a9	ldp	x9, x8, [x8, #0x10]
   3e650:	68 26 04 a9	stp	x8, x9, [x19, #0x40]
   3e654:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3e658:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3e65c:	dc 3c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3e660:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3e664:	72 56 13 94	bl	0x51402c ; symbol stub for: _$s10Foundation13__DataStorageC6_bytesSvSgvg
   3e668:	40 4b 00 b4	cbz	x0, 0x3efd0
   3e66c:	f6 03 00 aa	mov	x22, x0
   3e670:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3e674:	77 56 13 94	bl	0x514050 ; symbol stub for: _$s10Foundation13__DataStorageC7_offsetSivg
   3e678:	68 26 40 f9	ldr	x8, [x19, #0x48]
   3e67c:	08 01 00 eb	subs	x8, x8, x0
   3e680:	26 c1 00 54	b.vs	0x3fea4
   3e684:	1c 01 16 8b	add	x28, x8, x22
   3e688:	53 02 00 14	b	0x3efd4
   3e68c:	29 ff 60 d3	lsr	x9, x25, #32
   3e690:	29 01 19 6b	subs	w9, w9, w25
   3e694:	e6 bf 00 54	b.vs	0x3fe90
   3e698:	29 7d 40 93	sxtw	x9, w9
   3e69c:	3f 45 00 f1	cmp	x9, #0x11
   3e6a0:	4b 01 00 54	b.lt	0x3e6c8
   3e6a4:	1f 09 00 71	cmp	w8, #0x2
   3e6a8:	80 2f 00 54	b.eq	0x3ec98
   3e6ac:	1f 05 00 71	cmp	w8, #0x1
   3e6b0:	41 30 00 54	b.ne	0x3ecb8
   3e6b4:	28 ff 60 d3	lsr	x8, x25, #32
   3e6b8:	08 01 19 6b	subs	w8, w8, w25
   3e6bc:	a6 bf 00 54	b.vs	0x3feb0
   3e6c0:	08 7d 40 93	sxtw	x8, w8
   3e6c4:	7e 01 00 14	b	0x3ecbc
   3e6c8:	e0 03 19 aa	mov	x0, x25
   3e6cc:	e1 03 18 aa	mov	x1, x24
   3e6d0:	e6 44 00 94	bl	0x4fa68
   3e6d4:	bb 04 80 d2	mov	x27, #0x25
   3e6d8:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3e6dc:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e6e0:	08 01 3f 91	add	x8, x8, #0xfc0 ; literal pool for: "Invalid wrapped DK ciphertext"
   3e6e4:	08 81 00 d1	sub	x8, x8, #0x20
   3e6e8:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3e6ec:	00 38 00 f0	adrp	x0, 1795 ; 0x741000
   3e6f0:	00 c0 12 91	add	x0, x0, #0x4b0
   3e6f4:	61 27 00 90	adrp	x1, 1260 ; 0x52a000
   3e6f8:	21 a0 1c 91	add	x1, x1, #0x728
   3e6fc:	6c 97 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3e700:	01 0a 80 52	mov	w1, #0x50
   3e704:	e2 00 80 52	mov	w2, #0x7
   3e708:	a9 5c 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3e70c:	f5 03 00 aa	mov	x21, x0
   3e710:	68 27 00 90	adrp	x8, 1260 ; 0x52a000
   3e714:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3e718:	00 04 80 3d	str	q0, [x0, #0x10]
   3e71c:	a8 4c 8e d2	mov	x8, #0x7265
   3e720:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3e724:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3e728:	fa 03 00 aa	mov	x26, x0
   3e72c:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3e730:	34 37 00 d0	adrp	x20, 1766 ; 0x724000
   3e734:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3e738:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3e73c:	14 24 00 f9	str	x20, [x0, #0x48]
   3e740:	69 23 00 d1	sub	x9, x27, #0x8
   3e744:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3e748:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3e74c:	f2 3b 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3e750:	f8 03 00 aa	mov	x24, x0
   3e754:	e0 03 15 aa	mov	x0, x21
   3e758:	e0 5c 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3e75c:	01 38 00 f0	adrp	x1, 1795 ; 0x741000
   3e760:	21 e0 12 91	add	x1, x1, #0x4b8
   3e764:	62 27 00 90	adrp	x2, 1260 ; 0x52a000
   3e768:	42 c0 1c 91	add	x2, x2, #0x730
   3e76c:	e0 03 1a aa	mov	x0, x26
   3e770:	a8 44 00 94	bl	_$sypSgWOhTm
   3e774:	e0 03 15 aa	mov	x0, x21
   3e778:	01 04 80 52	mov	w1, #0x20
   3e77c:	e2 00 80 52	mov	w2, #0x7
   3e780:	a3 5c 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3e784:	08 38 00 f0	adrp	x8, 1795 ; 0x741000
   3e788:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3e78c:	f2 5b 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3e790:	f5 03 00 aa	mov	x21, x0
   3e794:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3e798:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3e79c:	23 37 00 d0	adrp	x3, 1766 ; 0x724000
   3e7a0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3e7a4:	02 21 00 91	add	x2, x8, #0x8
   3e7a8:	e0 03 18 aa	mov	x0, x24
   3e7ac:	e1 03 14 aa	mov	x1, x20
   3e7b0:	4e 57 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3e7b4:	f4 03 00 aa	mov	x20, x0
   3e7b8:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3e7bc:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3e7c0:	e0 03 15 aa	mov	x0, x21
   3e7c4:	e2 03 14 aa	mov	x2, x20
   3e7c8:	03 00 80 d2	mov	x3, #0x0
   3e7cc:	35 63 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3e7d0:	fd 03 1d aa	mov	x29, x29
   3e7d4:	e9 5b 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3e7d8:	f5 03 00 aa	mov	x21, x0
   3e7dc:	e0 03 14 aa	mov	x0, x20
   3e7e0:	e0 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e7e4:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3e7e8:	e1 5b 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3e7ec:	95 04 00 b4	cbz	x21, 0x3e87c
   3e7f0:	e0 03 15 aa	mov	x0, x21
   3e7f4:	5c 56 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3e7f8:	f4 03 00 aa	mov	x20, x0
   3e7fc:	fa 03 01 aa	mov	x26, x1
   3e800:	e0 03 15 aa	mov	x0, x21
   3e804:	d7 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e808:	00 00 80 d2	mov	x0, #0x0
   3e80c:	4f 57 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3e810:	fc 03 00 91	mov	x28, sp
   3e814:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3e818:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3e81c:	e9 03 08 aa	mov	x9, x8
   3e820:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3e824:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3e828:	00 02 3f d6	blr	x16
   3e82c:	e9 03 00 91	mov	x9, sp
   3e830:	08 3d 00 91	add	x8, x8, #0xf
   3e834:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3e838:	35 01 08 cb	sub	x21, x9, x8
   3e83c:	bf 02 00 91	mov	sp, x21
   3e840:	e8 03 15 aa	mov	x8, x21
   3e844:	3e 57 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3e848:	e0 03 14 aa	mov	x0, x20
   3e84c:	e1 03 1a aa	mov	x1, x26
   3e850:	e2 03 15 aa	mov	x2, x21
   3e854:	37 57 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3e858:	f6 03 00 aa	mov	x22, x0
   3e85c:	f5 03 01 aa	mov	x21, x1
   3e860:	e0 03 14 aa	mov	x0, x20
   3e864:	e1 03 1a aa	mov	x1, x26
   3e868:	8c 3b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3e86c:	9f 03 00 91	mov	sp, x28
   3e870:	95 01 00 b4	cbz	x21, 0x3e8a0
   3e874:	fb 03 16 aa	mov	x27, x22
   3e878:	0e 00 00 14	b	0x3e8b0
   3e87c:	fa 03 00 aa	mov	x26, x0
   3e880:	fd 55 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3e884:	f4 03 00 aa	mov	x20, x0
   3e888:	e0 03 1a aa	mov	x0, x26
   3e88c:	b5 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3e890:	f5 03 14 aa	mov	x21, x20
   3e894:	9a 5c 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3e898:	e0 03 14 aa	mov	x0, x20
   3e89c:	65 5c 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3e8a0:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e8a4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3e8a8:	08 81 00 d1	sub	x8, x8, #0x20
   3e8ac:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3e8b0:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3e8b4:	6d 44 00 94	bl	0x4fa68
   3e8b8:	e0 03 18 aa	mov	x0, x24
   3e8bc:	48 5c 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3e8c0:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3e8c4:	69 44 00 94	bl	0x4fa68
   3e8c8:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3e8cc:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3e8d0:	66 44 00 94	bl	0x4fa68
   3e8d4:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3e8d8:	64 44 00 94	bl	0x4fa68
   3e8dc:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3e8e0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e8e4:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3e8e8:	00 01 3f d6	blr	x8
   3e8ec:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3e8f0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e8f4:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3e8f8:	00 01 3f d6	blr	x8
   3e8fc:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3e900:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e904:	60 86 4a a9	ldp	x0, x1, [x19, #0xa8]
   3e908:	00 01 3f d6	blr	x8
   3e90c:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3e910:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e914:	60 4e 40 f9	ldr	x0, [x19, #0x98]
   3e918:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3e91c:	00 01 3f d6	blr	x8
   3e920:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3e924:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3e928:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3e92c:	00 01 3f d6	blr	x8
   3e930:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3e934:	1f 01 00 91	mov	sp, x8
   3e938:	68 4a 40 f9	ldr	x8, [x19, #0x90]
   3e93c:	1f 01 00 91	mov	sp, x8
   3e940:	68 66 40 f9	ldr	x8, [x19, #0xc8]
   3e944:	af 00 00 14	b	0x3ec00
   3e948:	29 ff 60 d3	lsr	x9, x25, #32
   3e94c:	29 01 19 6b	subs	w9, w9, w25
   3e950:	26 aa 00 54	b.vs	0x3fe94
   3e954:	29 7d 40 93	sxtw	x9, w9
   3e958:	3f 45 00 f1	cmp	x9, #0x11
   3e95c:	4b 01 00 54	b.lt	0x3e984
   3e960:	1f 09 00 71	cmp	w8, #0x2
   3e964:	20 1a 00 54	b.eq	0x3eca8
   3e968:	1f 05 00 71	cmp	w8, #0x1
   3e96c:	e1 25 00 54	b.ne	0x3ee28
   3e970:	28 ff 60 d3	lsr	x8, x25, #32
   3e974:	08 01 19 6b	subs	w8, w8, w25
   3e978:	e6 a9 00 54	b.vs	0x3feb4
   3e97c:	08 7d 40 93	sxtw	x8, w8
   3e980:	2b 01 00 14	b	0x3ee2c
   3e984:	e0 03 19 aa	mov	x0, x25
   3e988:	e1 03 18 aa	mov	x1, x24
   3e98c:	37 44 00 94	bl	0x4fa68
   3e990:	bb 04 80 d2	mov	x27, #0x25
   3e994:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3e998:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3e99c:	08 01 3f 91	add	x8, x8, #0xfc0 ; literal pool for: "Invalid wrapped DK ciphertext"
   3e9a0:	08 81 00 d1	sub	x8, x8, #0x20
   3e9a4:	1c 01 41 b2	orr	x28, x8, #0x8000000000000000
   3e9a8:	00 38 00 f0	adrp	x0, 1795 ; 0x741000
   3e9ac:	00 c0 12 91	add	x0, x0, #0x4b0
   3e9b0:	61 27 00 90	adrp	x1, 1260 ; 0x52a000
   3e9b4:	21 a0 1c 91	add	x1, x1, #0x728
   3e9b8:	bd 96 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3e9bc:	01 0a 80 52	mov	w1, #0x50
   3e9c0:	e2 00 80 52	mov	w2, #0x7
   3e9c4:	fa 5b 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3e9c8:	f5 03 00 aa	mov	x21, x0
   3e9cc:	68 27 00 90	adrp	x8, 1260 ; 0x52a000
   3e9d0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3e9d4:	00 04 80 3d	str	q0, [x0, #0x10]
   3e9d8:	a8 4c 8e d2	mov	x8, #0x7265
   3e9dc:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3e9e0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3e9e4:	fa 03 00 aa	mov	x26, x0
   3e9e8:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3e9ec:	34 37 00 d0	adrp	x20, 1766 ; 0x724000
   3e9f0:	94 26 41 f9	ldr	x20, [x20, #0x248] ; literal pool symbol address: _$sSSN
   3e9f4:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3e9f8:	14 24 00 f9	str	x20, [x0, #0x48]
   3e9fc:	69 23 00 d1	sub	x9, x27, #0x8
   3ea00:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3ea04:	1c 1c 00 f9	str	x28, [x0, #0x38]
   3ea08:	43 3b 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3ea0c:	f8 03 00 aa	mov	x24, x0
   3ea10:	e0 03 15 aa	mov	x0, x21
   3ea14:	31 5c 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3ea18:	01 38 00 f0	adrp	x1, 1795 ; 0x741000
   3ea1c:	21 e0 12 91	add	x1, x1, #0x4b8
   3ea20:	62 27 00 90	adrp	x2, 1260 ; 0x52a000
   3ea24:	42 c0 1c 91	add	x2, x2, #0x730
   3ea28:	e0 03 1a aa	mov	x0, x26
   3ea2c:	f9 43 00 94	bl	_$sypSgWOhTm
   3ea30:	e0 03 15 aa	mov	x0, x21
   3ea34:	01 04 80 52	mov	w1, #0x20
   3ea38:	e2 00 80 52	mov	w2, #0x7
   3ea3c:	f4 5b 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3ea40:	08 38 00 f0	adrp	x8, 1795 ; 0x741000
   3ea44:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3ea48:	43 5b 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3ea4c:	f5 03 00 aa	mov	x21, x0
   3ea50:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3ea54:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3ea58:	23 37 00 d0	adrp	x3, 1766 ; 0x724000
   3ea5c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3ea60:	02 21 00 91	add	x2, x8, #0x8
   3ea64:	e0 03 18 aa	mov	x0, x24
   3ea68:	e1 03 14 aa	mov	x1, x20
   3ea6c:	9f 56 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3ea70:	f4 03 00 aa	mov	x20, x0
   3ea74:	bf 03 11 f8	stur	xzr, [x29, #-0xf0]
   3ea78:	a4 c3 03 d1	sub	x4, x29, #0xf0
   3ea7c:	e0 03 15 aa	mov	x0, x21
   3ea80:	e2 03 14 aa	mov	x2, x20
   3ea84:	03 00 80 d2	mov	x3, #0x0
   3ea88:	86 62 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3ea8c:	fd 03 1d aa	mov	x29, x29
   3ea90:	3a 5b 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3ea94:	f5 03 00 aa	mov	x21, x0
   3ea98:	e0 03 14 aa	mov	x0, x20
   3ea9c:	31 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3eaa0:	a0 03 51 f8	ldur	x0, [x29, #-0xf0]
   3eaa4:	32 5b 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3eaa8:	d5 04 00 b4	cbz	x21, 0x3eb40
   3eaac:	e0 03 15 aa	mov	x0, x21
   3eab0:	ad 55 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3eab4:	f4 03 00 aa	mov	x20, x0
   3eab8:	fa 03 01 aa	mov	x26, x1
   3eabc:	e0 03 15 aa	mov	x0, x21
   3eac0:	28 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3eac4:	00 00 80 d2	mov	x0, #0x0
   3eac8:	a0 56 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3eacc:	fc 03 00 91	mov	x28, sp
   3ead0:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3ead4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3ead8:	e9 03 08 aa	mov	x9, x8
   3eadc:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3eae0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3eae4:	00 02 3f d6	blr	x16
   3eae8:	e9 03 00 91	mov	x9, sp
   3eaec:	08 3d 00 91	add	x8, x8, #0xf
   3eaf0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3eaf4:	35 01 08 cb	sub	x21, x9, x8
   3eaf8:	bf 02 00 91	mov	sp, x21
   3eafc:	e8 03 15 aa	mov	x8, x21
   3eb00:	8f 56 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3eb04:	e0 03 14 aa	mov	x0, x20
   3eb08:	e1 03 1a aa	mov	x1, x26
   3eb0c:	e2 03 15 aa	mov	x2, x21
   3eb10:	88 56 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3eb14:	f6 03 00 aa	mov	x22, x0
   3eb18:	f5 03 01 aa	mov	x21, x1
   3eb1c:	e0 03 14 aa	mov	x0, x20
   3eb20:	e1 03 1a aa	mov	x1, x26
   3eb24:	dd 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3eb28:	9f 03 00 91	mov	sp, x28
   3eb2c:	d5 01 00 b4	cbz	x21, 0x3eb64
   3eb30:	e0 03 18 aa	mov	x0, x24
   3eb34:	aa 5b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3eb38:	fb 03 16 aa	mov	x27, x22
   3eb3c:	10 00 00 14	b	0x3eb7c
   3eb40:	fa 03 00 aa	mov	x26, x0
   3eb44:	4c 55 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3eb48:	f4 03 00 aa	mov	x20, x0
   3eb4c:	e0 03 1a aa	mov	x0, x26
   3eb50:	04 5b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3eb54:	f5 03 14 aa	mov	x21, x20
   3eb58:	e9 5b 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3eb5c:	e0 03 14 aa	mov	x0, x20
   3eb60:	b4 5b 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3eb64:	e0 03 18 aa	mov	x0, x24
   3eb68:	9d 5b 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3eb6c:	c8 26 00 f0	adrp	x8, 1243 ; 0x519000
   3eb70:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3eb74:	08 81 00 d1	sub	x8, x8, #0x20
   3eb78:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3eb7c:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3eb80:	ba 43 00 94	bl	0x4fa68
   3eb84:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3eb88:	b8 43 00 94	bl	0x4fa68
   3eb8c:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3eb90:	b6 43 00 94	bl	0x4fa68
   3eb94:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3eb98:	b4 43 00 94	bl	0x4fa68
   3eb9c:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3eba0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3eba4:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3eba8:	00 01 3f d6	blr	x8
   3ebac:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3ebb0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3ebb4:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3ebb8:	00 01 3f d6	blr	x8
   3ebbc:	68 86 48 a9	ldp	x8, x1, [x19, #0x88]
   3ebc0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3ebc4:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3ebc8:	00 01 3f d6	blr	x8
   3ebcc:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3ebd0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3ebd4:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3ebd8:	00 01 3f d6	blr	x8
   3ebdc:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3ebe0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3ebe4:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3ebe8:	00 01 3f d6	blr	x8
   3ebec:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3ebf0:	1f 01 00 91	mov	sp, x8
   3ebf4:	68 4e 40 f9	ldr	x8, [x19, #0x98]
   3ebf8:	1f 01 00 91	mov	sp, x8
   3ebfc:	68 6a 40 f9	ldr	x8, [x19, #0xd0]
   3ec00:	1f 01 00 91	mov	sp, x8
   3ec04:	68 72 40 f9	ldr	x8, [x19, #0xe0]
   3ec08:	1f 01 00 91	mov	sp, x8
   3ec0c:	68 8a 40 f9	ldr	x8, [x19, #0x110]
   3ec10:	1f 01 00 91	mov	sp, x8
   3ec14:	44 f5 ff 17	b	0x3c124
   3ec18:	16 7d 40 93	sxtw	x22, w8
   3ec1c:	08 fd 60 93	asr	x8, x8, #32
   3ec20:	1c 01 16 eb	subs	x28, x8, x22
   3ec24:	ab 93 00 54	b.lt	0x3fe98
   3ec28:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3ec2c:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3ec30:	67 3b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ec34:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3ec38:	fd 54 13 94	bl	0x51402c ; symbol stub for: _$s10Foundation13__DataStorageC6_bytesSvSgvg
   3ec3c:	00 3c 00 b4	cbz	x0, 0x3f3bc
   3ec40:	f7 03 00 aa	mov	x23, x0
   3ec44:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3ec48:	02 55 13 94	bl	0x514050 ; symbol stub for: _$s10Foundation13__DataStorageC7_offsetSivg
   3ec4c:	c8 02 00 eb	subs	x8, x22, x0
   3ec50:	c6 92 00 54	b.vs	0x3fea8
   3ec54:	16 01 17 8b	add	x22, x8, x23
   3ec58:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3ec5c:	fa 54 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3ec60:	56 3b 00 b4	cbz	x22, 0x3f3c8
   3ec64:	1f 00 1c eb	cmp	x0, x28
   3ec68:	08 b0 9c 9a	csel	x8, x0, x28, lt
   3ec6c:	01 01 16 8b	add	x1, x8, x22
   3ec70:	d7 01 00 14	b	0x3f3cc
   3ec74:	9f 62 00 f8	stur	xzr, [x20, #0x6]
   3ec78:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   3ec7c:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3ec80:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3ec84:	52 3b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ec88:	a8 03 03 d1	sub	x8, x29, #0xc0
   3ec8c:	a0 03 04 d1	sub	x0, x29, #0x100
   3ec90:	a1 03 04 d1	sub	x1, x29, #0x100
   3ec94:	d4 01 00 14	b	0x3f3e4
   3ec98:	29 23 41 a9	ldp	x9, x8, [x25, #0x10]
   3ec9c:	08 01 09 eb	subs	x8, x8, x9
   3eca0:	e7 00 00 54	b.vc	0x3ecbc
   3eca4:	20 00 20 d4	brk	#0x1
   3eca8:	29 23 41 a9	ldp	x9, x8, [x25, #0x10]
   3ecac:	08 01 09 eb	subs	x8, x8, x9
   3ecb0:	e7 0b 00 54	b.vc	0x3ee2c
   3ecb4:	20 00 20 d4	brk	#0x1
   3ecb8:	08 df 70 d3	ubfx	x8, x24, #48, #8
   3ecbc:	15 41 00 f1	subs	x21, x8, #0x10
   3ecc0:	66 8d 00 54	b.vs	0x3fe6c
   3ecc4:	e0 03 19 aa	mov	x0, x25
   3ecc8:	e1 03 18 aa	mov	x1, x24
   3eccc:	40 3b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ecd0:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3ecd4:	e0 03 15 aa	mov	x0, x21
   3ecd8:	e1 03 19 aa	mov	x1, x25
   3ecdc:	e2 03 18 aa	mov	x2, x24
   3ece0:	7d 04 00 94	bl	_$sSlsE6prefixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3ece4:	b5 53 71 a9	ldp	x21, x20, [x29, #-0xf0]
   3ece8:	e0 03 19 aa	mov	x0, x25
   3ecec:	e1 03 18 aa	mov	x1, x24
   3ecf0:	37 3b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ecf4:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3ecf8:	00 02 80 52	mov	w0, #0x10
   3ecfc:	e1 03 19 aa	mov	x1, x25
   3ed00:	e2 03 18 aa	mov	x2, x24
   3ed04:	c5 04 00 94	bl	_$sSKsE6suffixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3ed08:	e8 03 00 91	mov	x8, sp
   3ed0c:	68 16 00 f9	str	x8, [x19, #0x28]
   3ed10:	a9 23 71 a9	ldp	x9, x8, [x29, #-0xf0]
   3ed14:	69 22 03 a9	stp	x9, x8, [x19, #0x30]
   3ed18:	6c 22 40 f9	ldr	x12, [x19, #0x40]
   3ed1c:	e9 03 0c aa	mov	x9, x12
   3ed20:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3ed24:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3ed28:	00 02 3f d6	blr	x16
   3ed2c:	e8 03 00 91	mov	x8, sp
   3ed30:	89 3d 00 91	add	x9, x12, #0xf
   3ed34:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3ed38:	00 01 09 cb	sub	x0, x8, x9
   3ed3c:	1f 00 00 91	mov	sp, x0
   3ed40:	61 a2 44 a9	ldp	x1, x8, [x19, #0x48]
   3ed44:	08 09 40 f9	ldr	x8, [x8, #0x10]
   3ed48:	60 22 00 f9	str	x0, [x19, #0x40]
   3ed4c:	62 2e 40 f9	ldr	x2, [x19, #0x58]
   3ed50:	00 01 3f d6	blr	x8
   3ed54:	bb 83 12 f8	stur	x27, [x29, #-0xd8]
   3ed58:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3ed5c:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3ed60:	a8 03 13 f8	stur	x8, [x29, #-0xd0]
   3ed64:	75 d2 01 a9	stp	x21, x20, [x19, #0x18]
   3ed68:	b5 53 31 a9	stp	x21, x20, [x29, #-0xf0]
   3ed6c:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3ed70:	e1 03 1b aa	mov	x1, x27
   3ed74:	36 3b 00 94	bl	___swift_project_boxed_opaque_existential_1
   3ed78:	08 50 40 a9	ldp	x8, x20, [x0]
   3ed7c:	89 fe 7e d3	lsr	x9, x20, #62
   3ed80:	3f 05 00 71	cmp	w9, #0x1
   3ed84:	ac 04 00 54	b.gt	0x3ee18
   3ed88:	a9 13 00 35	cbnz	w9, 0x3effc
   3ed8c:	09 fd 48 d3	lsr	x9, x8, #8
   3ed90:	a8 03 10 38	sturb	w8, [x29, #-0x100]
   3ed94:	0a fd 50 d3	lsr	x10, x8, #16
   3ed98:	0b fd 58 d3	lsr	x11, x8, #24
   3ed9c:	a9 13 10 38	sturb	w9, [x29, #-0xff]
   3eda0:	aa 23 10 38	sturb	w10, [x29, #-0xfe]
   3eda4:	09 fd 60 d3	lsr	x9, x8, #32
   3eda8:	0a fd 68 d3	lsr	x10, x8, #40
   3edac:	ab 33 10 38	sturb	w11, [x29, #-0xfd]
   3edb0:	a9 43 10 38	sturb	w9, [x29, #-0xfc]
   3edb4:	09 fd 70 d3	lsr	x9, x8, #48
   3edb8:	08 fd 78 d3	lsr	x8, x8, #56
   3edbc:	aa 53 10 38	sturb	w10, [x29, #-0xfb]
   3edc0:	a9 63 10 38	sturb	w9, [x29, #-0xfa]
   3edc4:	89 fe 48 d3	lsr	x9, x20, #8
   3edc8:	8a fe 50 d3	lsr	x10, x20, #16
   3edcc:	a8 73 10 38	sturb	w8, [x29, #-0xf9]
   3edd0:	b4 83 10 38	sturb	w20, [x29, #-0xf8]
   3edd4:	88 fe 58 d3	lsr	x8, x20, #24
   3edd8:	8b fe 60 d3	lsr	x11, x20, #32
   3eddc:	a9 93 10 38	sturb	w9, [x29, #-0xf7]
   3ede0:	aa a3 10 38	sturb	w10, [x29, #-0xf6]
   3ede4:	89 fe 68 d3	lsr	x9, x20, #40
   3ede8:	8a fe 70 d3	lsr	x10, x20, #48
   3edec:	a8 b3 10 38	sturb	w8, [x29, #-0xf5]
   3edf0:	ab c3 10 38	sturb	w11, [x29, #-0xf4]
   3edf4:	a8 03 04 d1	sub	x8, x29, #0x100
   3edf8:	a9 d3 10 38	sturb	w9, [x29, #-0xf3]
   3edfc:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3ee00:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3ee04:	f2 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ee08:	a8 03 03 d1	sub	x8, x29, #0xc0
   3ee0c:	a0 03 04 d1	sub	x0, x29, #0x100
   3ee10:	e1 03 14 aa	mov	x1, x20
   3ee14:	8f 00 00 14	b	0x3f050
   3ee18:	3f 09 00 71	cmp	w9, #0x2
   3ee1c:	a1 10 00 54	b.ne	0x3f030
   3ee20:	16 55 41 a9	ldp	x22, x21, [x8, #0x10]
   3ee24:	7a 00 00 14	b	0x3f00c
   3ee28:	08 df 70 d3	ubfx	x8, x24, #48, #8
   3ee2c:	15 41 00 f1	subs	x21, x8, #0x10
   3ee30:	06 82 00 54	b.vs	0x3fe70
   3ee34:	e0 03 19 aa	mov	x0, x25
   3ee38:	e1 03 18 aa	mov	x1, x24
   3ee3c:	e4 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ee40:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3ee44:	e0 03 15 aa	mov	x0, x21
   3ee48:	e1 03 19 aa	mov	x1, x25
   3ee4c:	e2 03 18 aa	mov	x2, x24
   3ee50:	21 04 00 94	bl	_$sSlsE6prefixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3ee54:	b5 53 71 a9	ldp	x21, x20, [x29, #-0xf0]
   3ee58:	e0 03 19 aa	mov	x0, x25
   3ee5c:	e1 03 18 aa	mov	x1, x24
   3ee60:	db 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ee64:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3ee68:	00 02 80 52	mov	w0, #0x10
   3ee6c:	e1 03 19 aa	mov	x1, x25
   3ee70:	e2 03 18 aa	mov	x2, x24
   3ee74:	69 04 00 94	bl	_$sSKsE6suffixy11SubSequenceQzSiF10Foundation4DataV_Tg5
   3ee78:	e8 03 00 91	mov	x8, sp
   3ee7c:	68 16 00 f9	str	x8, [x19, #0x28]
   3ee80:	a9 23 71 a9	ldp	x9, x8, [x29, #-0xf0]
   3ee84:	69 22 03 a9	stp	x9, x8, [x19, #0x30]
   3ee88:	6c 22 40 f9	ldr	x12, [x19, #0x40]
   3ee8c:	e9 03 0c aa	mov	x9, x12
   3ee90:	30 37 00 d0	adrp	x16, 1766 ; 0x724000
   3ee94:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3ee98:	00 02 3f d6	blr	x16
   3ee9c:	e8 03 00 91	mov	x8, sp
   3eea0:	89 3d 00 91	add	x9, x12, #0xf
   3eea4:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3eea8:	00 01 09 cb	sub	x0, x8, x9
   3eeac:	1f 00 00 91	mov	sp, x0
   3eeb0:	61 a2 44 a9	ldp	x1, x8, [x19, #0x48]
   3eeb4:	08 09 40 f9	ldr	x8, [x8, #0x10]
   3eeb8:	60 22 00 f9	str	x0, [x19, #0x40]
   3eebc:	62 2e 40 f9	ldr	x2, [x19, #0x58]
   3eec0:	00 01 3f d6	blr	x8
   3eec4:	bb 83 12 f8	stur	x27, [x29, #-0xd8]
   3eec8:	28 37 00 d0	adrp	x8, 1766 ; 0x724000
   3eecc:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3eed0:	a8 03 13 f8	stur	x8, [x29, #-0xd0]
   3eed4:	75 d2 01 a9	stp	x21, x20, [x19, #0x18]
   3eed8:	b5 53 31 a9	stp	x21, x20, [x29, #-0xf0]
   3eedc:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3eee0:	e1 03 1b aa	mov	x1, x27
   3eee4:	da 3a 00 94	bl	___swift_project_boxed_opaque_existential_1
   3eee8:	08 54 40 a9	ldp	x8, x21, [x0]
   3eeec:	a9 fe 7e d3	lsr	x9, x21, #62
   3eef0:	3f 05 00 71	cmp	w9, #0x1
   3eef4:	ac 04 00 54	b.gt	0x3ef88
   3eef8:	49 12 00 35	cbnz	w9, 0x3f140
   3eefc:	09 fd 48 d3	lsr	x9, x8, #8
   3ef00:	a8 03 10 38	sturb	w8, [x29, #-0x100]
   3ef04:	0a fd 50 d3	lsr	x10, x8, #16
   3ef08:	0b fd 58 d3	lsr	x11, x8, #24
   3ef0c:	a9 13 10 38	sturb	w9, [x29, #-0xff]
   3ef10:	aa 23 10 38	sturb	w10, [x29, #-0xfe]
   3ef14:	09 fd 60 d3	lsr	x9, x8, #32
   3ef18:	0a fd 68 d3	lsr	x10, x8, #40
   3ef1c:	ab 33 10 38	sturb	w11, [x29, #-0xfd]
   3ef20:	a9 43 10 38	sturb	w9, [x29, #-0xfc]
   3ef24:	09 fd 70 d3	lsr	x9, x8, #48
   3ef28:	08 fd 78 d3	lsr	x8, x8, #56
   3ef2c:	aa 53 10 38	sturb	w10, [x29, #-0xfb]
   3ef30:	a9 63 10 38	sturb	w9, [x29, #-0xfa]
   3ef34:	a9 fe 48 d3	lsr	x9, x21, #8
   3ef38:	aa fe 50 d3	lsr	x10, x21, #16
   3ef3c:	a8 73 10 38	sturb	w8, [x29, #-0xf9]
   3ef40:	b5 83 10 38	sturb	w21, [x29, #-0xf8]
   3ef44:	a8 fe 58 d3	lsr	x8, x21, #24
   3ef48:	ab fe 60 d3	lsr	x11, x21, #32
   3ef4c:	a9 93 10 38	sturb	w9, [x29, #-0xf7]
   3ef50:	aa a3 10 38	sturb	w10, [x29, #-0xf6]
   3ef54:	a9 fe 68 d3	lsr	x9, x21, #40
   3ef58:	aa fe 70 d3	lsr	x10, x21, #48
   3ef5c:	a8 b3 10 38	sturb	w8, [x29, #-0xf5]
   3ef60:	ab c3 10 38	sturb	w11, [x29, #-0xf4]
   3ef64:	a8 03 04 d1	sub	x8, x29, #0x100
   3ef68:	a9 d3 10 38	sturb	w9, [x29, #-0xf3]
   3ef6c:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3ef70:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3ef74:	96 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3ef78:	a8 03 03 d1	sub	x8, x29, #0xc0
   3ef7c:	a0 03 04 d1	sub	x0, x29, #0x100
   3ef80:	e1 03 14 aa	mov	x1, x20
   3ef84:	4d 02 00 14	b	0x3f8b8
   3ef88:	3f 09 00 71	cmp	w9, #0x2
   3ef8c:	e1 10 00 54	b.ne	0x3f1a8
   3ef90:	09 21 41 a9	ldp	x9, x8, [x8, #0x10]
   3ef94:	68 26 00 a9	stp	x8, x9, [x19]
   3ef98:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3ef9c:	8c 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3efa0:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3efa4:	22 54 13 94	bl	0x51402c ; symbol stub for: _$s10Foundation13__DataStorageC6_bytesSvSgvg
   3efa8:	a0 45 00 b4	cbz	x0, 0x3f85c
   3efac:	f6 03 00 aa	mov	x22, x0
   3efb0:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3efb4:	27 54 13 94	bl	0x514050 ; symbol stub for: _$s10Foundation13__DataStorageC7_offsetSivg
   3efb8:	68 06 40 f9	ldr	x8, [x19, #0x8]
   3efbc:	08 01 00 eb	subs	x8, x8, x0
   3efc0:	66 78 00 54	b.vs	0x3fecc
   3efc4:	08 01 16 8b	add	x8, x8, x22
   3efc8:	68 0a 00 f9	str	x8, [x19, #0x10]
   3efcc:	25 02 00 14	b	0x3f860
   3efd0:	1c 00 80 d2	mov	x28, #0x0
   3efd4:	69 22 44 a9	ldp	x9, x8, [x19, #0x40]
   3efd8:	36 01 08 eb	subs	x22, x9, x8
   3efdc:	06 76 00 54	b.vs	0x3fe9c
   3efe0:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3efe4:	18 54 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3efe8:	9c 1f 00 b4	cbz	x28, 0x3f3d8
   3efec:	1f 00 16 eb	cmp	x0, x22
   3eff0:	08 b0 96 9a	csel	x8, x0, x22, lt
   3eff4:	01 01 1c 8b	add	x1, x8, x28
   3eff8:	f9 00 00 14	b	0x3f3dc
   3effc:	16 7d 40 93	sxtw	x22, w8
   3f000:	15 fd 60 93	asr	x21, x8, #32
   3f004:	bf 02 16 eb	cmp	x21, x22
   3f008:	8b 75 00 54	b.lt	0x3feb8
   3f00c:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f010:	6f 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f014:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f018:	82 f6 40 92	and	x2, x20, #0x3fffffffffffffff
   3f01c:	e0 03 16 aa	mov	x0, x22
   3f020:	e1 03 15 aa	mov	x1, x21
   3f024:	f5 03 1a aa	mov	x21, x26
   3f028:	39 39 00 94	bl	_$s10Foundation13__DataStorageC15withUnsafeBytes2in5applyxSnySiG_xSWKXEtKlFAA0B0V15_RepresentationO_Tg5015$s10Foundation4b38VyACxcSTRzs5UInt8V7ElementRtzlufcAC15_I8OSWXEfU_Tf1nncn_n
   3f02c:	0b 00 00 14	b	0x3f058
   3f030:	a8 03 04 d1	sub	x8, x29, #0x100
   3f034:	1f 61 00 f8	stur	xzr, [x8, #0x6]
   3f038:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   3f03c:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f040:	63 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f044:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f048:	a0 03 04 d1	sub	x0, x29, #0x100
   3f04c:	a1 03 04 d1	sub	x1, x29, #0x100
   3f050:	f5 03 1a aa	mov	x21, x26
   3f054:	cf 31 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f058:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f05c:	06 3e 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3f060:	a8 03 04 d1	sub	x8, x29, #0x100
   3f064:	00 11 c0 3d	ldr	q0, [x8, #0x40]
   3f068:	00 11 80 3d	str	q0, [x8, #0x40]
   3f06c:	bb 83 12 f8	stur	x27, [x29, #-0xd8]
   3f070:	28 37 00 b0	adrp	x8, 1765 ; 0x724000
   3f074:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3f078:	a8 03 13 f8	stur	x8, [x29, #-0xd0]
   3f07c:	69 22 43 a9	ldp	x9, x8, [x19, #0x30]
   3f080:	a9 23 31 a9	stp	x9, x8, [x29, #-0xf0]
   3f084:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f088:	e1 03 1b aa	mov	x1, x27
   3f08c:	70 3a 00 94	bl	___swift_project_boxed_opaque_existential_1
   3f090:	08 6c 40 a9	ldp	x8, x27, [x0]
   3f094:	69 ff 7e d3	lsr	x9, x27, #62
   3f098:	3f 05 00 71	cmp	w9, #0x1
   3f09c:	ac 04 00 54	b.gt	0x3f130
   3f0a0:	69 09 00 35	cbnz	w9, 0x3f1cc
   3f0a4:	09 fd 48 d3	lsr	x9, x8, #8
   3f0a8:	68 a2 04 39	strb	w8, [x19, #0x128]
   3f0ac:	0a fd 50 d3	lsr	x10, x8, #16
   3f0b0:	0b fd 58 d3	lsr	x11, x8, #24
   3f0b4:	69 a6 04 39	strb	w9, [x19, #0x129]
   3f0b8:	6a aa 04 39	strb	w10, [x19, #0x12a]
   3f0bc:	09 fd 60 d3	lsr	x9, x8, #32
   3f0c0:	0a fd 68 d3	lsr	x10, x8, #40
   3f0c4:	6b ae 04 39	strb	w11, [x19, #0x12b]
   3f0c8:	69 b2 04 39	strb	w9, [x19, #0x12c]
   3f0cc:	09 fd 70 d3	lsr	x9, x8, #48
   3f0d0:	08 fd 78 d3	lsr	x8, x8, #56
   3f0d4:	6a b6 04 39	strb	w10, [x19, #0x12d]
   3f0d8:	69 ba 04 39	strb	w9, [x19, #0x12e]
   3f0dc:	69 ff 48 d3	lsr	x9, x27, #8
   3f0e0:	6a ff 50 d3	lsr	x10, x27, #16
   3f0e4:	68 be 04 39	strb	w8, [x19, #0x12f]
   3f0e8:	7b c2 04 39	strb	w27, [x19, #0x130]
   3f0ec:	68 ff 58 d3	lsr	x8, x27, #24
   3f0f0:	6b ff 60 d3	lsr	x11, x27, #32
   3f0f4:	69 c6 04 39	strb	w9, [x19, #0x131]
   3f0f8:	6a ca 04 39	strb	w10, [x19, #0x132]
   3f0fc:	69 ff 68 d3	lsr	x9, x27, #40
   3f100:	6a ff 70 d3	lsr	x10, x27, #48
   3f104:	68 ce 04 39	strb	w8, [x19, #0x133]
   3f108:	6b d2 04 39	strb	w11, [x19, #0x134]
   3f10c:	68 a2 04 91	add	x8, x19, #0x128
   3f110:	69 d6 04 39	strb	w9, [x19, #0x135]
   3f114:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3f118:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f11c:	2c 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f120:	a8 03 04 d1	sub	x8, x29, #0x100
   3f124:	60 a2 04 91	add	x0, x19, #0x128
   3f128:	e1 03 14 aa	mov	x1, x20
   3f12c:	3c 00 00 14	b	0x3f21c
   3f130:	3f 09 00 71	cmp	w9, #0x2
   3f134:	41 06 00 54	b.ne	0x3f1fc
   3f138:	14 69 41 a9	ldp	x20, x26, [x8, #0x10]
   3f13c:	28 00 00 14	b	0x3f1dc
   3f140:	16 7d 40 93	sxtw	x22, w8
   3f144:	08 fd 60 93	asr	x8, x8, #32
   3f148:	08 01 16 eb	subs	x8, x8, x22
   3f14c:	68 06 00 f9	str	x8, [x19, #0x8]
   3f150:	6b 6b 00 54	b.lt	0x3febc
   3f154:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f158:	1d 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f15c:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f160:	b3 53 13 94	bl	0x51402c ; symbol stub for: _$s10Foundation13__DataStorageC6_bytesSvSgvg
   3f164:	60 0a 00 f9	str	x0, [x19, #0x10]
   3f168:	40 39 00 b4	cbz	x0, 0x3f890
   3f16c:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f170:	b8 53 13 94	bl	0x514050 ; symbol stub for: _$s10Foundation13__DataStorageC7_offsetSivg
   3f174:	c8 02 00 eb	subs	x8, x22, x0
   3f178:	c6 6a 00 54	b.vs	0x3fed0
   3f17c:	69 0a 40 f9	ldr	x9, [x19, #0x10]
   3f180:	16 01 09 8b	add	x22, x8, x9
   3f184:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f188:	af 53 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f18c:	e9 03 16 aa	mov	x9, x22
   3f190:	76 38 00 b4	cbz	x22, 0x3f89c
   3f194:	68 06 40 f9	ldr	x8, [x19, #0x8]
   3f198:	1f 00 08 eb	cmp	x0, x8
   3f19c:	08 b0 88 9a	csel	x8, x0, x8, lt
   3f1a0:	01 01 09 8b	add	x1, x8, x9
   3f1a4:	bf 01 00 14	b	0x3f8a0
   3f1a8:	a8 03 04 d1	sub	x8, x29, #0x100
   3f1ac:	1f 61 00 f8	stur	xzr, [x8, #0x6]
   3f1b0:	bf 03 10 f8	stur	xzr, [x29, #-0x100]
   3f1b4:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f1b8:	05 3a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f1bc:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f1c0:	a0 03 04 d1	sub	x0, x29, #0x100
   3f1c4:	a1 03 04 d1	sub	x1, x29, #0x100
   3f1c8:	bc 01 00 14	b	0x3f8b8
   3f1cc:	14 7d 40 93	sxtw	x20, w8
   3f1d0:	1a fd 60 93	asr	x26, x8, #32
   3f1d4:	5f 03 14 eb	cmp	x26, x20
   3f1d8:	4b 67 00 54	b.lt	0x3fec0
   3f1dc:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f1e0:	fb 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f1e4:	a8 03 04 d1	sub	x8, x29, #0x100
   3f1e8:	62 f7 40 92	and	x2, x27, #0x3fffffffffffffff
   3f1ec:	e0 03 14 aa	mov	x0, x20
   3f1f0:	e1 03 1a aa	mov	x1, x26
   3f1f4:	c6 38 00 94	bl	_$s10Foundation13__DataStorageC15withUnsafeBytes2in5applyxSnySiG_xSWKXEtKlFAA0B0V15_RepresentationO_Tg5015$s10Foundation4b38VyACxcSTRzs5UInt8V7ElementRtzlufcAC15_I8OSWXEfU_Tf1nncn_n
   3f1f8:	0a 00 00 14	b	0x3f220
   3f1fc:	68 be 00 91	add	x8, x19, #0x2f
   3f200:	1f f1 0f f8	stur	xzr, [x8, #0xff]
   3f204:	7f 96 00 f9	str	xzr, [x19, #0x128]
   3f208:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f20c:	f0 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f210:	a8 03 04 d1	sub	x8, x29, #0x100
   3f214:	60 a2 04 91	add	x0, x19, #0x128
   3f218:	61 a2 04 91	add	x1, x19, #0x128
   3f21c:	5d 31 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f220:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f224:	94 3d 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3f228:	a8 03 04 d1	sub	x8, x29, #0x100
   3f22c:	00 01 c0 3d	ldr	q0, [x8]
   3f230:	00 05 80 3d	str	q0, [x8, #0x10]
   3f234:	23 37 00 b0	adrp	x3, 1765 ; 0x724000
   3f238:	63 18 40 f9	ldr	x3, [x3, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3f23c:	a1 03 03 d1	sub	x1, x29, #0xc0
   3f240:	a2 c3 03 d1	sub	x2, x29, #0xf0
   3f244:	60 22 40 f9	ldr	x0, [x19, #0x40]
   3f248:	e4 03 03 aa	mov	x4, x3
   3f24c:	e5 03 1c aa	mov	x5, x28
   3f250:	e6 03 1c aa	mov	x6, x28
   3f254:	eb 53 13 94	bl	0x514200 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonce10ciphertext3tagAeC5NonceV_xq_tKc10Foundation12DataProtocolRzAkLR_r0_lufC
   3f258:	fa 03 15 aa	mov	x26, x21
   3f25c:	35 05 00 b4	cbz	x21, 0x3f300
   3f260:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3f264:	01 42 00 94	bl	0x4fa68
   3f268:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3f26c:	ff 41 00 94	bl	0x4fa68
   3f270:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3f274:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3f278:	fc 41 00 94	bl	0x4fa68
   3f27c:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3f280:	fa 41 00 94	bl	0x4fa68
   3f284:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f288:	04 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f28c:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f290:	02 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f294:	e0 03 19 aa	mov	x0, x25
   3f298:	e1 03 18 aa	mov	x1, x24
   3f29c:	f3 41 00 94	bl	0x4fa68
   3f2a0:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3f2a4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f2a8:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3f2ac:	00 01 3f d6	blr	x8
   3f2b0:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3f2b4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f2b8:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3f2bc:	00 01 3f d6	blr	x8
   3f2c0:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3f2c4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f2c8:	60 86 4a a9	ldp	x0, x1, [x19, #0xa8]
   3f2cc:	00 01 3f d6	blr	x8
   3f2d0:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3f2d4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f2d8:	60 4e 40 f9	ldr	x0, [x19, #0x98]
   3f2dc:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3f2e0:	00 01 3f d6	blr	x8
   3f2e4:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3f2e8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f2ec:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3f2f0:	00 01 3f d6	blr	x8
   3f2f4:	68 16 40 f9	ldr	x8, [x19, #0x28]
   3f2f8:	1f 01 00 91	mov	sp, x8
   3f2fc:	f9 fa ff 17	b	0x3dee0
   3f300:	fb 03 00 aa	mov	x27, x0
   3f304:	f4 03 01 aa	mov	x20, x1
   3f308:	68 16 40 f9	ldr	x8, [x19, #0x28]
   3f30c:	1f 01 00 91	mov	sp, x8
   3f310:	23 38 00 b0	adrp	x3, 1797 ; 0x744000
   3f314:	63 20 3a 91	add	x3, x3, #0xe88
   3f318:	24 37 00 b0	adrp	x4, 1765 ; 0x724000
   3f31c:	84 18 40 f9	ldr	x4, [x4, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3f320:	62 52 40 f9	ldr	x2, [x19, #0xa0]
   3f324:	e5 03 1c aa	mov	x5, x28
   3f328:	f5 03 1a aa	mov	x21, x26
   3f32c:	a0 53 13 94	bl	0x5141ac ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4open_5using14authenticating10Foundation4DataVAC9SealedBoxV_AA12SymmetricKeyVxtKAG0I8ProtocolRzlFZ
   3f330:	60 22 00 f9	str	x0, [x19, #0x40]
   3f334:	61 16 00 f9	str	x1, [x19, #0x28]
   3f338:	d5 23 00 b4	cbz	x21, 0x3f7b0
   3f33c:	fa 03 15 aa	mov	x26, x21
   3f340:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3f344:	c9 41 00 94	bl	0x4fa68
   3f348:	e0 03 1b aa	mov	x0, x27
   3f34c:	e1 03 14 aa	mov	x1, x20
   3f350:	d2 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f354:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3f358:	c4 41 00 94	bl	0x4fa68
   3f35c:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3f360:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3f364:	c1 41 00 94	bl	0x4fa68
   3f368:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3f36c:	bf 41 00 94	bl	0x4fa68
   3f370:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f374:	c9 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f378:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f37c:	c7 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f380:	e0 03 19 aa	mov	x0, x25
   3f384:	e1 03 18 aa	mov	x1, x24
   3f388:	b8 41 00 94	bl	0x4fa68
   3f38c:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3f390:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f394:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3f398:	00 01 3f d6	blr	x8
   3f39c:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3f3a0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f3a4:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3f3a8:	00 01 3f d6	blr	x8
   3f3ac:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3f3b0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f3b4:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3f3b8:	bf fa ff 17	b	0x3deb4
   3f3bc:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f3c0:	21 53 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f3c4:	16 00 80 d2	mov	x22, #0x0
   3f3c8:	01 00 80 d2	mov	x1, #0x0
   3f3cc:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f3d0:	e0 03 16 aa	mov	x0, x22
   3f3d4:	04 00 00 14	b	0x3f3e4
   3f3d8:	01 00 80 d2	mov	x1, #0x0
   3f3dc:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f3e0:	e0 03 1c aa	mov	x0, x28
   3f3e4:	f5 03 1a aa	mov	x21, x26
   3f3e8:	ea 30 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f3ec:	75 26 00 f9	str	x21, [x19, #0x48]
   3f3f0:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f3f4:	20 3d 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3f3f8:	a8 03 04 d1	sub	x8, x29, #0x100
   3f3fc:	00 11 c0 3d	ldr	q0, [x8, #0x40]
   3f400:	00 11 80 3d	str	q0, [x8, #0x40]
   3f404:	21 37 00 b0	adrp	x1, 1765 ; 0x724000
   3f408:	21 18 40 f9	ldr	x1, [x1, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3f40c:	a1 83 12 f8	stur	x1, [x29, #-0xd8]
   3f410:	28 37 00 b0	adrp	x8, 1765 ; 0x724000
   3f414:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3f418:	a8 03 13 f8	stur	x8, [x29, #-0xd0]
   3f41c:	69 a2 46 a9	ldp	x9, x8, [x19, #0x68]
   3f420:	a9 23 31 a9	stp	x9, x8, [x29, #-0xf0]
   3f424:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f428:	89 39 00 94	bl	___swift_project_boxed_opaque_existential_1
   3f42c:	08 68 40 a9	ldp	x8, x26, [x0]
   3f430:	49 ff 7e d3	lsr	x9, x26, #62
   3f434:	3f 05 00 71	cmp	w9, #0x1
   3f438:	ac 04 00 54	b.gt	0x3f4cc
   3f43c:	09 06 00 35	cbnz	w9, 0x3f4fc
   3f440:	09 fd 48 d3	lsr	x9, x8, #8
   3f444:	68 a2 04 39	strb	w8, [x19, #0x128]
   3f448:	0a fd 50 d3	lsr	x10, x8, #16
   3f44c:	0b fd 58 d3	lsr	x11, x8, #24
   3f450:	69 a6 04 39	strb	w9, [x19, #0x129]
   3f454:	6a aa 04 39	strb	w10, [x19, #0x12a]
   3f458:	09 fd 60 d3	lsr	x9, x8, #32
   3f45c:	0a fd 68 d3	lsr	x10, x8, #40
   3f460:	6b ae 04 39	strb	w11, [x19, #0x12b]
   3f464:	69 b2 04 39	strb	w9, [x19, #0x12c]
   3f468:	09 fd 70 d3	lsr	x9, x8, #48
   3f46c:	08 fd 78 d3	lsr	x8, x8, #56
   3f470:	6a b6 04 39	strb	w10, [x19, #0x12d]
   3f474:	69 ba 04 39	strb	w9, [x19, #0x12e]
   3f478:	49 ff 48 d3	lsr	x9, x26, #8
   3f47c:	4a ff 50 d3	lsr	x10, x26, #16
   3f480:	68 be 04 39	strb	w8, [x19, #0x12f]
   3f484:	7a c2 04 39	strb	w26, [x19, #0x130]
   3f488:	48 ff 58 d3	lsr	x8, x26, #24
   3f48c:	4b ff 60 d3	lsr	x11, x26, #32
   3f490:	69 c6 04 39	strb	w9, [x19, #0x131]
   3f494:	6a ca 04 39	strb	w10, [x19, #0x132]
   3f498:	49 ff 68 d3	lsr	x9, x26, #40
   3f49c:	4a ff 70 d3	lsr	x10, x26, #48
   3f4a0:	68 ce 04 39	strb	w8, [x19, #0x133]
   3f4a4:	6b d2 04 39	strb	w11, [x19, #0x134]
   3f4a8:	68 a2 04 91	add	x8, x19, #0x128
   3f4ac:	69 d6 04 39	strb	w9, [x19, #0x135]
   3f4b0:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3f4b4:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f4b8:	45 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f4bc:	a8 03 04 d1	sub	x8, x29, #0x100
   3f4c0:	60 a2 04 91	add	x0, x19, #0x128
   3f4c4:	e1 03 14 aa	mov	x1, x20
   3f4c8:	33 00 00 14	b	0x3f594
   3f4cc:	3f 09 00 71	cmp	w9, #0x2
   3f4d0:	61 04 00 54	b.ne	0x3f55c
   3f4d4:	14 55 41 a9	ldp	x20, x21, [x8, #0x10]
   3f4d8:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f4dc:	3c 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f4e0:	a8 03 04 d1	sub	x8, x29, #0x100
   3f4e4:	42 f7 40 92	and	x2, x26, #0x3fffffffffffffff
   3f4e8:	e0 03 14 aa	mov	x0, x20
   3f4ec:	e1 03 15 aa	mov	x1, x21
   3f4f0:	75 26 40 f9	ldr	x21, [x19, #0x48]
   3f4f4:	06 38 00 94	bl	_$s10Foundation13__DataStorageC15withUnsafeBytes2in5applyxSnySiG_xSWKXEtKlFAA0B0V15_RepresentationO_Tg5015$s10Foundation4b38VyACxcSTRzs5UInt8V7ElementRtzlufcAC15_I8OSWXEfU_Tf1nncn_n
   3f4f8:	29 00 00 14	b	0x3f59c
   3f4fc:	16 7d 40 93	sxtw	x22, w8
   3f500:	08 fd 60 93	asr	x8, x8, #32
   3f504:	1c 01 16 eb	subs	x28, x8, x22
   3f508:	cb 4c 00 54	b.lt	0x3fea0
   3f50c:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f510:	2f 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f514:	54 f7 40 92	and	x20, x26, #0x3fffffffffffffff
   3f518:	c5 52 13 94	bl	0x51402c ; symbol stub for: _$s10Foundation13__DataStorageC6_bytesSvSgvg
   3f51c:	20 03 00 b4	cbz	x0, 0x3f580
   3f520:	f5 03 00 aa	mov	x21, x0
   3f524:	54 f7 40 92	and	x20, x26, #0x3fffffffffffffff
   3f528:	ca 52 13 94	bl	0x514050 ; symbol stub for: _$s10Foundation13__DataStorageC7_offsetSivg
   3f52c:	c8 02 00 eb	subs	x8, x22, x0
   3f530:	e6 4b 00 54	b.vs	0x3feac
   3f534:	15 01 15 8b	add	x21, x8, x21
   3f538:	54 f7 40 92	and	x20, x26, #0x3fffffffffffffff
   3f53c:	c2 52 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f540:	1f 00 1c eb	cmp	x0, x28
   3f544:	08 b0 9c 9a	csel	x8, x0, x28, lt
   3f548:	08 01 15 8b	add	x8, x8, x21
   3f54c:	bf 02 00 f1	cmp	x21, #0x0
   3f550:	e0 03 95 9a	csel	x0, xzr, x21, eq
   3f554:	e1 03 88 9a	csel	x1, xzr, x8, eq
   3f558:	0e 00 00 14	b	0x3f590
   3f55c:	68 be 00 91	add	x8, x19, #0x2f
   3f560:	1f f1 0f f8	stur	xzr, [x8, #0xff]
   3f564:	7f 96 00 f9	str	xzr, [x19, #0x128]
   3f568:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f56c:	18 39 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f570:	a8 03 04 d1	sub	x8, x29, #0x100
   3f574:	60 a2 04 91	add	x0, x19, #0x128
   3f578:	61 a2 04 91	add	x1, x19, #0x128
   3f57c:	06 00 00 14	b	0x3f594
   3f580:	54 f7 40 92	and	x20, x26, #0x3fffffffffffffff
   3f584:	b0 52 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f588:	00 00 80 d2	mov	x0, #0x0
   3f58c:	01 00 80 d2	mov	x1, #0x0
   3f590:	a8 03 04 d1	sub	x8, x29, #0x100
   3f594:	75 26 40 f9	ldr	x21, [x19, #0x48]
   3f598:	7e 30 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f59c:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f5a0:	b5 3c 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3f5a4:	a8 03 04 d1	sub	x8, x29, #0x100
   3f5a8:	00 01 c0 3d	ldr	q0, [x8]
   3f5ac:	00 05 80 3d	str	q0, [x8, #0x10]
   3f5b0:	23 37 00 b0	adrp	x3, 1765 ; 0x724000
   3f5b4:	63 18 40 f9	ldr	x3, [x3, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3f5b8:	a1 03 03 d1	sub	x1, x29, #0xc0
   3f5bc:	a2 c3 03 d1	sub	x2, x29, #0xf0
   3f5c0:	60 2a 40 f9	ldr	x0, [x19, #0x50]
   3f5c4:	e4 03 03 aa	mov	x4, x3
   3f5c8:	65 5a 40 f9	ldr	x5, [x19, #0xb0]
   3f5cc:	e6 03 05 aa	mov	x6, x5
   3f5d0:	0c 53 13 94	bl	0x514200 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonce10ciphertext3tagAeC5NonceV_xq_tKc10Foundation12DataProtocolRzAkLR_r0_lufC
   3f5d4:	61 2a 00 f9	str	x1, [x19, #0x50]
   3f5d8:	fa 03 15 aa	mov	x26, x21
   3f5dc:	15 04 00 b4	cbz	x21, 0x3f65c
   3f5e0:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3f5e4:	21 41 00 94	bl	0x4fa68
   3f5e8:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3f5ec:	1f 41 00 94	bl	0x4fa68
   3f5f0:	60 86 47 a9	ldp	x0, x1, [x19, #0x78]
   3f5f4:	1d 41 00 94	bl	0x4fa68
   3f5f8:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3f5fc:	1b 41 00 94	bl	0x4fa68
   3f600:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3f604:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3f608:	24 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f60c:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f610:	22 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f614:	e0 03 1b aa	mov	x0, x27
   3f618:	e1 03 19 aa	mov	x1, x25
   3f61c:	13 41 00 94	bl	0x4fa68
   3f620:	60 a2 49 a9	ldp	x0, x8, [x19, #0x98]
   3f624:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f628:	61 46 40 f9	ldr	x1, [x19, #0x88]
   3f62c:	00 01 3f d6	blr	x8
   3f630:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3f634:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f638:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3f63c:	00 01 3f d6	blr	x8
   3f640:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3f644:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f648:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3f64c:	00 01 3f d6	blr	x8
   3f650:	68 2e 40 f9	ldr	x8, [x19, #0x58]
   3f654:	1f 01 00 91	mov	sp, x8
   3f658:	35 00 00 14	b	0x3f72c
   3f65c:	f4 03 00 aa	mov	x20, x0
   3f660:	68 2e 40 f9	ldr	x8, [x19, #0x58]
   3f664:	1f 01 00 91	mov	sp, x8
   3f668:	28 38 00 d0	adrp	x8, 1798 ; 0x745000
   3f66c:	08 05 41 f9	ldr	x8, [x8, #0x208]
   3f670:	1f 05 00 b1	cmn	x8, #0x1
   3f674:	01 40 00 54	b.ne	0x3fe74
   3f678:	23 38 00 b0	adrp	x3, 1797 ; 0x744000
   3f67c:	63 20 3a 91	add	x3, x3, #0xe88
   3f680:	24 37 00 b0	adrp	x4, 1765 ; 0x724000
   3f684:	84 18 40 f9	ldr	x4, [x4, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3f688:	e0 03 14 aa	mov	x0, x20
   3f68c:	61 2a 40 f9	ldr	x1, [x19, #0x50]
   3f690:	62 66 40 f9	ldr	x2, [x19, #0xc8]
   3f694:	65 5a 40 f9	ldr	x5, [x19, #0xb0]
   3f698:	f5 03 1a aa	mov	x21, x26
   3f69c:	c4 52 13 94	bl	0x5141ac ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4open_5using14authenticating10Foundation4DataVAC9SealedBoxV_AA12SymmetricKeyVxtKAG0I8ProtocolRzlFZ
   3f6a0:	60 22 00 f9	str	x0, [x19, #0x40]
   3f6a4:	61 16 00 f9	str	x1, [x19, #0x28]
   3f6a8:	95 04 00 b4	cbz	x21, 0x3f738
   3f6ac:	fa 03 15 aa	mov	x26, x21
   3f6b0:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3f6b4:	ed 40 00 94	bl	0x4fa68
   3f6b8:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3f6bc:	eb 40 00 94	bl	0x4fa68
   3f6c0:	e0 03 14 aa	mov	x0, x20
   3f6c4:	61 2a 40 f9	ldr	x1, [x19, #0x50]
   3f6c8:	f4 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f6cc:	60 86 47 a9	ldp	x0, x1, [x19, #0x78]
   3f6d0:	e6 40 00 94	bl	0x4fa68
   3f6d4:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3f6d8:	e4 40 00 94	bl	0x4fa68
   3f6dc:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3f6e0:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3f6e4:	ed 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f6e8:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f6ec:	eb 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f6f0:	e0 03 1b aa	mov	x0, x27
   3f6f4:	e1 03 19 aa	mov	x1, x25
   3f6f8:	dc 40 00 94	bl	0x4fa68
   3f6fc:	60 a2 49 a9	ldp	x0, x8, [x19, #0x98]
   3f700:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f704:	61 46 40 f9	ldr	x1, [x19, #0x88]
   3f708:	00 01 3f d6	blr	x8
   3f70c:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3f710:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f714:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3f718:	00 01 3f d6	blr	x8
   3f71c:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3f720:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f724:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3f728:	00 01 3f d6	blr	x8
   3f72c:	1f 03 00 91	mov	sp, x24
   3f730:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3f734:	d0 f7 ff 17	b	0x3d674
   3f738:	60 86 4d a9	ldp	x0, x1, [x19, #0xd8]
   3f73c:	cb 40 00 94	bl	0x4fa68
   3f740:	e0 03 14 aa	mov	x0, x20
   3f744:	61 2a 40 f9	ldr	x1, [x19, #0x50]
   3f748:	d4 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f74c:	60 86 47 a9	ldp	x0, x1, [x19, #0x78]
   3f750:	c6 40 00 94	bl	0x4fa68
   3f754:	60 4a 40 f9	ldr	x0, [x19, #0x90]
   3f758:	61 32 40 f9	ldr	x1, [x19, #0x60]
   3f75c:	cf 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f760:	60 86 46 a9	ldp	x0, x1, [x19, #0x68]
   3f764:	cd 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f768:	e0 03 1b aa	mov	x0, x27
   3f76c:	e1 03 19 aa	mov	x1, x25
   3f770:	be 40 00 94	bl	0x4fa68
   3f774:	60 a2 49 a9	ldp	x0, x8, [x19, #0x98]
   3f778:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f77c:	61 46 40 f9	ldr	x1, [x19, #0x88]
   3f780:	00 01 3f d6	blr	x8
   3f784:	68 5e 40 f9	ldr	x8, [x19, #0xb8]
   3f788:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f78c:	60 86 4c a9	ldp	x0, x1, [x19, #0xc8]
   3f790:	00 01 3f d6	blr	x8
   3f794:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3f798:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f79c:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3f7a0:	00 01 3f d6	blr	x8
   3f7a4:	1f 03 00 91	mov	sp, x24
   3f7a8:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3f7ac:	21 01 00 14	b	0x3fc30
   3f7b0:	e0 03 1b aa	mov	x0, x27
   3f7b4:	e1 03 14 aa	mov	x1, x20
   3f7b8:	b8 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f7bc:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3f7c0:	aa 40 00 94	bl	0x4fa68
   3f7c4:	60 5e 40 f9	ldr	x0, [x19, #0xb8]
   3f7c8:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3f7cc:	a7 40 00 94	bl	0x4fa68
   3f7d0:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3f7d4:	b1 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f7d8:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f7dc:	af 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3f7e0:	e0 03 19 aa	mov	x0, x25
   3f7e4:	e1 03 18 aa	mov	x1, x24
   3f7e8:	a0 40 00 94	bl	0x4fa68
   3f7ec:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3f7f0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f7f4:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3f7f8:	00 01 3f d6	blr	x8
   3f7fc:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3f800:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f804:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3f808:	00 01 3f d6	blr	x8
   3f80c:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3f810:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f814:	60 86 4a a9	ldp	x0, x1, [x19, #0xa8]
   3f818:	00 01 3f d6	blr	x8
   3f81c:	68 62 40 f9	ldr	x8, [x19, #0xc0]
   3f820:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f824:	60 4e 40 f9	ldr	x0, [x19, #0x98]
   3f828:	61 6a 40 f9	ldr	x1, [x19, #0xd0]
   3f82c:	00 01 3f d6	blr	x8
   3f830:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3f834:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3f838:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3f83c:	00 01 3f d6	blr	x8
   3f840:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3f844:	1f 01 00 91	mov	sp, x8
   3f848:	68 4a 40 f9	ldr	x8, [x19, #0x90]
   3f84c:	1f 01 00 91	mov	sp, x8
   3f850:	68 66 40 f9	ldr	x8, [x19, #0xc8]
   3f854:	f5 00 00 14	b	0x3fc28
   3f858:	ab 56 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   3f85c:	7f 0a 00 f9	str	xzr, [x19, #0x10]
   3f860:	69 22 40 a9	ldp	x9, x8, [x19]
   3f864:	36 01 08 eb	subs	x22, x9, x8
   3f868:	e6 32 00 54	b.vs	0x3fec4
   3f86c:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f870:	f5 51 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f874:	68 0a 40 f9	ldr	x8, [x19, #0x10]
   3f878:	a8 01 00 b4	cbz	x8, 0x3f8ac
   3f87c:	1f 00 16 eb	cmp	x0, x22
   3f880:	08 b0 96 9a	csel	x8, x0, x22, lt
   3f884:	69 0a 40 f9	ldr	x9, [x19, #0x10]
   3f888:	01 01 09 8b	add	x1, x8, x9
   3f88c:	09 00 00 14	b	0x3f8b0
   3f890:	b4 f6 40 92	and	x20, x21, #0x3fffffffffffffff
   3f894:	ec 51 13 94	bl	0x514044 ; symbol stub for: _$s10Foundation13__DataStorageC7_lengthSivg
   3f898:	09 00 80 d2	mov	x9, #0x0
   3f89c:	01 00 80 d2	mov	x1, #0x0
   3f8a0:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f8a4:	e0 03 09 aa	mov	x0, x9
   3f8a8:	04 00 00 14	b	0x3f8b8
   3f8ac:	01 00 80 d2	mov	x1, #0x0
   3f8b0:	a8 03 03 d1	sub	x8, x29, #0xc0
   3f8b4:	60 0a 40 f9	ldr	x0, [x19, #0x10]
   3f8b8:	f5 03 1a aa	mov	x21, x26
   3f8bc:	b5 2f 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f8c0:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f8c4:	ec 3b 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3f8c8:	a8 03 04 d1	sub	x8, x29, #0x100
   3f8cc:	00 11 c0 3d	ldr	q0, [x8, #0x40]
   3f8d0:	00 11 80 3d	str	q0, [x8, #0x40]
   3f8d4:	bb 83 12 f8	stur	x27, [x29, #-0xd8]
   3f8d8:	28 37 00 b0	adrp	x8, 1765 ; 0x724000
   3f8dc:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   3f8e0:	a8 03 13 f8	stur	x8, [x29, #-0xd0]
   3f8e4:	69 22 43 a9	ldp	x9, x8, [x19, #0x30]
   3f8e8:	a9 23 31 a9	stp	x9, x8, [x29, #-0xf0]
   3f8ec:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3f8f0:	e1 03 1b aa	mov	x1, x27
   3f8f4:	56 38 00 94	bl	___swift_project_boxed_opaque_existential_1
   3f8f8:	08 6c 40 a9	ldp	x8, x27, [x0]
   3f8fc:	69 ff 7e d3	lsr	x9, x27, #62
   3f900:	3f 05 00 71	cmp	w9, #0x1
   3f904:	ac 04 00 54	b.gt	0x3f998
   3f908:	09 05 00 35	cbnz	w9, 0x3f9a8
   3f90c:	09 fd 48 d3	lsr	x9, x8, #8
   3f910:	68 a2 04 39	strb	w8, [x19, #0x128]
   3f914:	0a fd 50 d3	lsr	x10, x8, #16
   3f918:	0b fd 58 d3	lsr	x11, x8, #24
   3f91c:	69 a6 04 39	strb	w9, [x19, #0x129]
   3f920:	6a aa 04 39	strb	w10, [x19, #0x12a]
   3f924:	09 fd 60 d3	lsr	x9, x8, #32
   3f928:	0a fd 68 d3	lsr	x10, x8, #40
   3f92c:	6b ae 04 39	strb	w11, [x19, #0x12b]
   3f930:	69 b2 04 39	strb	w9, [x19, #0x12c]
   3f934:	09 fd 70 d3	lsr	x9, x8, #48
   3f938:	08 fd 78 d3	lsr	x8, x8, #56
   3f93c:	6a b6 04 39	strb	w10, [x19, #0x12d]
   3f940:	69 ba 04 39	strb	w9, [x19, #0x12e]
   3f944:	69 ff 48 d3	lsr	x9, x27, #8
   3f948:	6a ff 50 d3	lsr	x10, x27, #16
   3f94c:	68 be 04 39	strb	w8, [x19, #0x12f]
   3f950:	7b c2 04 39	strb	w27, [x19, #0x130]
   3f954:	68 ff 58 d3	lsr	x8, x27, #24
   3f958:	6b ff 60 d3	lsr	x11, x27, #32
   3f95c:	69 c6 04 39	strb	w9, [x19, #0x131]
   3f960:	6a ca 04 39	strb	w10, [x19, #0x132]
   3f964:	69 ff 68 d3	lsr	x9, x27, #40
   3f968:	6a ff 70 d3	lsr	x10, x27, #48
   3f96c:	68 ce 04 39	strb	w8, [x19, #0x133]
   3f970:	6b d2 04 39	strb	w11, [x19, #0x134]
   3f974:	68 a2 04 91	add	x8, x19, #0x128
   3f978:	69 d6 04 39	strb	w9, [x19, #0x135]
   3f97c:	14 01 2a 8b	add	x20, x8, w10, uxtb
   3f980:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f984:	12 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f988:	a8 03 04 d1	sub	x8, x29, #0x100
   3f98c:	60 a2 04 91	add	x0, x19, #0x128
   3f990:	e1 03 14 aa	mov	x1, x20
   3f994:	19 00 00 14	b	0x3f9f8
   3f998:	3f 09 00 71	cmp	w9, #0x2
   3f99c:	e1 01 00 54	b.ne	0x3f9d8
   3f9a0:	14 69 41 a9	ldp	x20, x26, [x8, #0x10]
   3f9a4:	05 00 00 14	b	0x3f9b8
   3f9a8:	14 7d 40 93	sxtw	x20, w8
   3f9ac:	1a fd 60 93	asr	x26, x8, #32
   3f9b0:	5f 03 14 eb	cmp	x26, x20
   3f9b4:	ab 28 00 54	b.lt	0x3fec8
   3f9b8:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f9bc:	04 38 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f9c0:	a8 03 04 d1	sub	x8, x29, #0x100
   3f9c4:	62 f7 40 92	and	x2, x27, #0x3fffffffffffffff
   3f9c8:	e0 03 14 aa	mov	x0, x20
   3f9cc:	e1 03 1a aa	mov	x1, x26
   3f9d0:	cf 36 00 94	bl	_$s10Foundation13__DataStorageC15withUnsafeBytes2in5applyxSnySiG_xSWKXEtKlFAA0B0V15_RepresentationO_Tg5015$s10Foundation4b38VyACxcSTRzs5UInt8V7ElementRtzlufcAC15_I8OSWXEfU_Tf1nncn_n
   3f9d4:	0a 00 00 14	b	0x3f9fc
   3f9d8:	68 be 00 91	add	x8, x19, #0x2f
   3f9dc:	1f f1 0f f8	stur	xzr, [x8, #0xff]
   3f9e0:	7f 96 00 f9	str	xzr, [x19, #0x128]
   3f9e4:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3f9e8:	f9 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3f9ec:	a8 03 04 d1	sub	x8, x29, #0x100
   3f9f0:	60 a2 04 91	add	x0, x19, #0x128
   3f9f4:	61 a2 04 91	add	x1, x19, #0x128
   3f9f8:	66 2f 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufcAC15_RepresentationOSWXEfU_
   3f9fc:	a0 c3 03 d1	sub	x0, x29, #0xf0
   3fa00:	9d 3b 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3fa04:	a8 03 04 d1	sub	x8, x29, #0x100
   3fa08:	00 01 c0 3d	ldr	q0, [x8]
   3fa0c:	00 05 80 3d	str	q0, [x8, #0x10]
   3fa10:	23 37 00 b0	adrp	x3, 1765 ; 0x724000
   3fa14:	63 18 40 f9	ldr	x3, [x3, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3fa18:	a1 03 03 d1	sub	x1, x29, #0xc0
   3fa1c:	a2 c3 03 d1	sub	x2, x29, #0xf0
   3fa20:	60 22 40 f9	ldr	x0, [x19, #0x40]
   3fa24:	e4 03 03 aa	mov	x4, x3
   3fa28:	e5 03 1c aa	mov	x5, x28
   3fa2c:	e6 03 1c aa	mov	x6, x28
   3fa30:	f4 51 13 94	bl	0x514200 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonce10ciphertext3tagAeC5NonceV_xq_tKc10Foundation12DataProtocolRzAkLR_r0_lufC
   3fa34:	fa 03 15 aa	mov	x26, x21
   3fa38:	f5 04 00 b4	cbz	x21, 0x3fad4
   3fa3c:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3fa40:	0a 40 00 94	bl	0x4fa68
   3fa44:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3fa48:	08 40 00 94	bl	0x4fa68
   3fa4c:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3fa50:	06 40 00 94	bl	0x4fa68
   3fa54:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3fa58:	04 40 00 94	bl	0x4fa68
   3fa5c:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3fa60:	0e 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fa64:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3fa68:	0c 37 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fa6c:	e0 03 19 aa	mov	x0, x25
   3fa70:	e1 03 18 aa	mov	x1, x24
   3fa74:	fd 3f 00 94	bl	0x4fa68
   3fa78:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3fa7c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fa80:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3fa84:	00 01 3f d6	blr	x8
   3fa88:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3fa8c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fa90:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3fa94:	00 01 3f d6	blr	x8
   3fa98:	68 86 48 a9	ldp	x8, x1, [x19, #0x88]
   3fa9c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3faa0:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3faa4:	00 01 3f d6	blr	x8
   3faa8:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3faac:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fab0:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3fab4:	00 01 3f d6	blr	x8
   3fab8:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3fabc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fac0:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3fac4:	00 01 3f d6	blr	x8
   3fac8:	68 16 40 f9	ldr	x8, [x19, #0x28]
   3facc:	1f 01 00 91	mov	sp, x8
   3fad0:	4b f9 ff 17	b	0x3dffc
   3fad4:	fb 03 00 aa	mov	x27, x0
   3fad8:	f4 03 01 aa	mov	x20, x1
   3fadc:	68 16 40 f9	ldr	x8, [x19, #0x28]
   3fae0:	1f 01 00 91	mov	sp, x8
   3fae4:	23 38 00 b0	adrp	x3, 1797 ; 0x744000
   3fae8:	63 20 3a 91	add	x3, x3, #0xe88
   3faec:	24 37 00 b0	adrp	x4, 1765 ; 0x724000
   3faf0:	84 18 40 f9	ldr	x4, [x4, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3faf4:	62 52 40 f9	ldr	x2, [x19, #0xa0]
   3faf8:	e5 03 1c aa	mov	x5, x28
   3fafc:	f5 03 1a aa	mov	x21, x26
   3fb00:	ab 51 13 94	bl	0x5141ac ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4open_5using14authenticating10Foundation4DataVAC9SealedBoxV_AA12SymmetricKeyVxtKAG0I8ProtocolRzlFZ
   3fb04:	60 22 00 f9	str	x0, [x19, #0x40]
   3fb08:	61 16 00 f9	str	x1, [x19, #0x28]
   3fb0c:	15 04 00 b4	cbz	x21, 0x3fb8c
   3fb10:	fa 03 15 aa	mov	x26, x21
   3fb14:	e0 03 1b aa	mov	x0, x27
   3fb18:	e1 03 14 aa	mov	x1, x20
   3fb1c:	df 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fb20:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3fb24:	d1 3f 00 94	bl	0x4fa68
   3fb28:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3fb2c:	cf 3f 00 94	bl	0x4fa68
   3fb30:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3fb34:	cd 3f 00 94	bl	0x4fa68
   3fb38:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3fb3c:	cb 3f 00 94	bl	0x4fa68
   3fb40:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3fb44:	d5 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fb48:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3fb4c:	d3 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fb50:	e0 03 19 aa	mov	x0, x25
   3fb54:	e1 03 18 aa	mov	x1, x24
   3fb58:	c4 3f 00 94	bl	0x4fa68
   3fb5c:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3fb60:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fb64:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3fb68:	00 01 3f d6	blr	x8
   3fb6c:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3fb70:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fb74:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3fb78:	00 01 3f d6	blr	x8
   3fb7c:	68 46 40 f9	ldr	x8, [x19, #0x88]
   3fb80:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fb84:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3fb88:	13 f9 ff 17	b	0x3dfd4
   3fb8c:	e0 03 1b aa	mov	x0, x27
   3fb90:	e1 03 14 aa	mov	x1, x20
   3fb94:	c1 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fb98:	60 06 46 a9	ldp	x0, x1, [x19, #0x60]
   3fb9c:	b3 3f 00 94	bl	0x4fa68
   3fba0:	60 06 4b a9	ldp	x0, x1, [x19, #0xb0]
   3fba4:	b1 3f 00 94	bl	0x4fa68
   3fba8:	60 86 41 a9	ldp	x0, x1, [x19, #0x18]
   3fbac:	bb 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fbb0:	60 06 43 a9	ldp	x0, x1, [x19, #0x30]
   3fbb4:	b9 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fbb8:	e0 03 19 aa	mov	x0, x25
   3fbbc:	e1 03 18 aa	mov	x1, x24
   3fbc0:	aa 3f 00 94	bl	0x4fa68
   3fbc4:	60 a2 44 a9	ldp	x0, x8, [x19, #0x48]
   3fbc8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fbcc:	61 2e 40 f9	ldr	x1, [x19, #0x58]
   3fbd0:	00 01 3f d6	blr	x8
   3fbd4:	68 86 47 a9	ldp	x8, x1, [x19, #0x78]
   3fbd8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fbdc:	60 52 40 f9	ldr	x0, [x19, #0xa0]
   3fbe0:	00 01 3f d6	blr	x8
   3fbe4:	68 86 48 a9	ldp	x8, x1, [x19, #0x88]
   3fbe8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fbec:	60 56 40 f9	ldr	x0, [x19, #0xa8]
   3fbf0:	00 01 3f d6	blr	x8
   3fbf4:	68 02 4c a9	ldp	x8, x0, [x19, #0xc0]
   3fbf8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fbfc:	61 6e 40 f9	ldr	x1, [x19, #0xd8]
   3fc00:	00 01 3f d6	blr	x8
   3fc04:	68 86 4e a9	ldp	x8, x1, [x19, #0xe8]
   3fc08:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3fc0c:	60 7e 40 f9	ldr	x0, [x19, #0xf8]
   3fc10:	00 01 3f d6	blr	x8
   3fc14:	68 3a 40 f9	ldr	x8, [x19, #0x70]
   3fc18:	1f 01 00 91	mov	sp, x8
   3fc1c:	68 4e 40 f9	ldr	x8, [x19, #0x98]
   3fc20:	1f 01 00 91	mov	sp, x8
   3fc24:	68 6a 40 f9	ldr	x8, [x19, #0xd0]
   3fc28:	1f 01 00 91	mov	sp, x8
   3fc2c:	68 72 40 f9	ldr	x8, [x19, #0xe0]
   3fc30:	1f 01 00 91	mov	sp, x8
   3fc34:	68 8a 40 f9	ldr	x8, [x19, #0x110]
   3fc38:	1f 01 00 91	mov	sp, x8
   3fc3c:	00 38 00 d0	adrp	x0, 1794 ; 0x741000
   3fc40:	00 c0 12 91	add	x0, x0, #0x4b0
   3fc44:	41 27 00 f0	adrp	x1, 1259 ; 0x52a000
   3fc48:	21 a0 1c 91	add	x1, x1, #0x728
   3fc4c:	18 92 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3fc50:	01 0a 80 52	mov	w1, #0x50
   3fc54:	e2 00 80 52	mov	w2, #0x7
   3fc58:	55 57 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3fc5c:	f5 03 00 aa	mov	x21, x0
   3fc60:	48 27 00 f0	adrp	x8, 1259 ; 0x52a000
   3fc64:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3fc68:	00 04 80 3d	str	q0, [x0, #0x10]
   3fc6c:	88 6c 8d 52	mov	w8, #0x6b64
   3fc70:	f9 03 00 aa	mov	x25, x0
   3fc74:	28 0f 02 f8	str	x8, [x25, #0x20]!
   3fc78:	08 40 fc d2	mov	x8, #-0x1e00000000000000
   3fc7c:	08 14 00 f9	str	x8, [x0, #0x28]
   3fc80:	00 00 80 d2	mov	x0, #0x0
   3fc84:	61 22 40 f9	ldr	x1, [x19, #0x40]
   3fc88:	62 16 40 f9	ldr	x2, [x19, #0x28]
   3fc8c:	33 51 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   3fc90:	3a 37 00 b0	adrp	x26, 1765 ; 0x724000
   3fc94:	5a 27 41 f9	ldr	x26, [x26, #0x248] ; literal pool symbol address: _$sSSN
   3fc98:	ba 26 00 f9	str	x26, [x21, #0x48]
   3fc9c:	a0 06 03 a9	stp	x0, x1, [x21, #0x30]
   3fca0:	e0 03 15 aa	mov	x0, x21
   3fca4:	9c 36 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3fca8:	f4 03 00 aa	mov	x20, x0
   3fcac:	e0 03 15 aa	mov	x0, x21
   3fcb0:	8a 57 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3fcb4:	01 38 00 d0	adrp	x1, 1794 ; 0x741000
   3fcb8:	21 e0 12 91	add	x1, x1, #0x4b8
   3fcbc:	42 27 00 f0	adrp	x2, 1259 ; 0x52a000
   3fcc0:	42 c0 1c 91	add	x2, x2, #0x730
   3fcc4:	e0 03 19 aa	mov	x0, x25
   3fcc8:	52 3f 00 94	bl	_$sypSgWOhTm
   3fccc:	e0 03 15 aa	mov	x0, x21
   3fcd0:	01 04 80 52	mov	w1, #0x20
   3fcd4:	e2 00 80 52	mov	w2, #0x7
   3fcd8:	4d 57 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3fcdc:	08 38 00 d0	adrp	x8, 1794 ; 0x741000
   3fce0:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3fce4:	9c 56 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3fce8:	f5 03 00 aa	mov	x21, x0
   3fcec:	28 37 00 b0	adrp	x8, 1765 ; 0x724000
   3fcf0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3fcf4:	23 37 00 b0	adrp	x3, 1765 ; 0x724000
   3fcf8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3fcfc:	02 21 00 91	add	x2, x8, #0x8
   3fd00:	e0 03 14 aa	mov	x0, x20
   3fd04:	e1 03 1a aa	mov	x1, x26
   3fd08:	f8 51 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3fd0c:	f9 03 00 aa	mov	x25, x0
   3fd10:	bf 03 15 f8	stur	xzr, [x29, #-0xb0]
   3fd14:	a4 c3 02 d1	sub	x4, x29, #0xb0
   3fd18:	e0 03 15 aa	mov	x0, x21
   3fd1c:	e2 03 19 aa	mov	x2, x25
   3fd20:	03 00 80 d2	mov	x3, #0x0
   3fd24:	df 5d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3fd28:	fd 03 1d aa	mov	x29, x29
   3fd2c:	93 56 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3fd30:	f5 03 00 aa	mov	x21, x0
   3fd34:	e0 03 19 aa	mov	x0, x25
   3fd38:	8a 56 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3fd3c:	a0 03 55 f8	ldur	x0, [x29, #-0xb0]
   3fd40:	8b 56 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3fd44:	75 04 00 b4	cbz	x21, 0x3fdd0
   3fd48:	e0 03 15 aa	mov	x0, x21
   3fd4c:	06 51 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3fd50:	f9 03 00 aa	mov	x25, x0
   3fd54:	fa 03 01 aa	mov	x26, x1
   3fd58:	e0 03 15 aa	mov	x0, x21
   3fd5c:	81 56 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3fd60:	00 00 80 d2	mov	x0, #0x0
   3fd64:	f9 51 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3fd68:	f8 03 00 91	mov	x24, sp
   3fd6c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3fd70:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3fd74:	e9 03 08 aa	mov	x9, x8
   3fd78:	30 37 00 b0	adrp	x16, 1765 ; 0x724000
   3fd7c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3fd80:	00 02 3f d6	blr	x16
   3fd84:	e9 03 00 91	mov	x9, sp
   3fd88:	08 3d 00 91	add	x8, x8, #0xf
   3fd8c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3fd90:	35 01 08 cb	sub	x21, x9, x8
   3fd94:	bf 02 00 91	mov	sp, x21
   3fd98:	e8 03 15 aa	mov	x8, x21
   3fd9c:	e8 51 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3fda0:	e0 03 19 aa	mov	x0, x25
   3fda4:	e1 03 1a aa	mov	x1, x26
   3fda8:	e2 03 15 aa	mov	x2, x21
   3fdac:	e1 51 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3fdb0:	fb 03 00 aa	mov	x27, x0
   3fdb4:	f5 03 01 aa	mov	x21, x1
   3fdb8:	e0 03 19 aa	mov	x0, x25
   3fdbc:	e1 03 1a aa	mov	x1, x26
   3fdc0:	36 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fdc4:	1f 03 00 91	mov	sp, x24
   3fdc8:	35 02 00 b5	cbnz	x21, 0x3fe0c
   3fdcc:	0a 00 00 14	b	0x3fdf4
   3fdd0:	fa 03 00 aa	mov	x26, x0
   3fdd4:	a8 50 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3fdd8:	f9 03 00 aa	mov	x25, x0
   3fddc:	e0 03 1a aa	mov	x0, x26
   3fde0:	60 56 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3fde4:	f5 03 19 aa	mov	x21, x25
   3fde8:	45 57 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3fdec:	e0 03 19 aa	mov	x0, x25
   3fdf0:	10 57 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3fdf4:	bb 04 80 d2	mov	x27, #0x25
   3fdf8:	1b 00 fa f2	movk	x27, #0xd000, lsl #48
   3fdfc:	c8 26 00 d0	adrp	x8, 1242 ; 0x519000
   3fe00:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3fe04:	08 81 00 d1	sub	x8, x8, #0x20
   3fe08:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3fe0c:	61 82 51 a9	ldp	x1, x0, [x19, #0x118]
   3fe10:	16 3f 00 94	bl	0x4fa68
   3fe14:	e0 03 14 aa	mov	x0, x20
   3fe18:	f1 56 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3fe1c:	60 22 40 f9	ldr	x0, [x19, #0x40]
   3fe20:	61 16 40 f9	ldr	x1, [x19, #0x28]
   3fe24:	1d 36 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3fe28:	60 06 50 a9	ldp	x0, x1, [x19, #0x100]
   3fe2c:	0f 3f 00 94	bl	0x4fa68
   3fe30:	bd f0 ff 17	b	0x3c124
   3fe34:	20 38 00 d0	adrp	x0, 1798 ; 0x745000
   3fe38:	00 20 08 91	add	x0, x0, #0x208
   3fe3c:	81 ff ff b0	adrp	x1, -15 ; 0x30000
   3fe40:	21 80 29 91	add	x1, x1, #0xa60
   3fe44:	19 57 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3fe48:	66 f6 ff 17	b	0x3d7e0
   3fe4c:	20 38 00 d0	adrp	x0, 1798 ; 0x745000
   3fe50:	00 20 08 91	add	x0, x0, #0x208
   3fe54:	81 ff ff b0	adrp	x1, -15 ; 0x30000
   3fe58:	21 80 29 91	add	x1, x1, #0xa60
   3fe5c:	13 57 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3fe60:	0d f7 ff 17	b	0x3da94
   3fe64:	20 00 20 d4	brk	#0x1
   3fe68:	20 00 20 d4	brk	#0x1
   3fe6c:	20 00 20 d4	brk	#0x1
   3fe70:	20 00 20 d4	brk	#0x1
   3fe74:	20 38 00 d0	adrp	x0, 1798 ; 0x745000
   3fe78:	00 20 08 91	add	x0, x0, #0x208
   3fe7c:	81 ff ff b0	adrp	x1, -15 ; 0x30000
   3fe80:	21 80 29 91	add	x1, x1, #0xa60
   3fe84:	09 57 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3fe88:	fc fd ff 17	b	0x3f678
   3fe8c:	20 00 20 d4	brk	#0x1
   3fe90:	20 00 20 d4	brk	#0x1
   3fe94:	20 00 20 d4	brk	#0x1
   3fe98:	20 00 20 d4	brk	#0x1
   3fe9c:	20 00 20 d4	brk	#0x1
   3fea0:	20 00 20 d4	brk	#0x1
   3fea4:	20 00 20 d4	brk	#0x1
   3fea8:	20 00 20 d4	brk	#0x1
   3feac:	20 00 20 d4	brk	#0x1
   3feb0:	20 00 20 d4	brk	#0x1
   3feb4:	20 00 20 d4	brk	#0x1
   3feb8:	20 00 20 d4	brk	#0x1
   3febc:	20 00 20 d4	brk	#0x1
   3fec0:	20 00 20 d4	brk	#0x1
   3fec4:	20 00 20 d4	brk	#0x1
   3fec8:	20 00 20 d4	brk	#0x1
   3fecc:	20 00 20 d4	brk	#0x1
   3fed0:	20 00 20 d4	brk	#0x1
