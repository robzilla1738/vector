/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift16cmdInstallStatusSSyF:
   3a990:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   3a994:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   3a998:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   3a99c:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   3a9a0:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   3a9a4:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   3a9a8:	fd 43 01 91	add	x29, sp, #0x50
   3a9ac:	ff 03 0a d1	sub	sp, sp, #0x280
   3a9b0:	f3 03 00 91	mov	x19, sp
   3a9b4:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3a9b8:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3a9bc:	08 01 40 f9	ldr	x8, [x8]
   3a9c0:	a8 03 1a f8	stur	x8, [x29, #-0x60]
   3a9c4:	00 00 80 d2	mov	x0, #0x0
   3a9c8:	e0 66 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3a9cc:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3a9d0:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3a9d4:	e9 03 08 aa	mov	x9, x8
   3a9d8:	50 37 00 d0	adrp	x16, 1770 ; 0x724000
   3a9dc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3a9e0:	00 02 3f d6	blr	x16
   3a9e4:	e9 03 00 91	mov	x9, sp
   3a9e8:	08 3d 00 91	add	x8, x8, #0xf
   3a9ec:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3a9f0:	36 01 08 cb	sub	x22, x9, x8
   3a9f4:	df 02 00 91	mov	sp, x22
   3a9f8:	48 38 00 f0	adrp	x8, 1803 ; 0x745000
   3a9fc:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   3aa00:	1f 05 00 b1	cmn	x8, #0x1
   3aa04:	c1 5f 00 54	b.ne	0x3b5fc
   3aa08:	48 38 00 d0	adrp	x8, 1802 ; 0x744000
   3aa0c:	08 21 39 91	add	x8, x8, #0xe48
   3aa10:	00 05 40 a9	ldp	x0, x1, [x8]
   3aa14:	ee e1 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3aa18:	28 fc 7c d3	lsr	x8, x1, #60
   3aa1c:	1f 39 00 f1	cmp	x8, #0xe
   3aa20:	29 0b 00 54	b.ls	0x3ab84
   3aa24:	b8 e3 ff 97	bl	_$s16AsideNativeSwift22hasAnyInstallArtifactsSbyF
   3aa28:	60 19 00 36	tbz	w0, #0x0, 0x3ad54
   3aa2c:	b4 04 80 d2	mov	x20, #0x25
   3aa30:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3aa34:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3aa38:	08 81 3b 91	add	x8, x8, #0xee0 ; literal pool for: "Installation metadata missing but secure installation artifacts already exist"
   3aa3c:	08 81 00 d1	sub	x8, x8, #0x20
   3aa40:	17 01 41 b2	orr	x23, x8, #0x8000000000000000
   3aa44:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3aa48:	00 c0 12 91	add	x0, x0, #0x4b0
   3aa4c:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3aa50:	21 a0 1c 91	add	x1, x1, #0x728
   3aa54:	96 a6 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3aa58:	a1 03 04 d1	sub	x1, x29, #0x100
   3aa5c:	0a 6c 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3aa60:	f5 03 00 aa	mov	x21, x0
   3aa64:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3aa68:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3aa6c:	00 04 80 3d	str	q0, [x0, #0x10]
   3aa70:	a8 4c 8e d2	mov	x8, #0x7265
   3aa74:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3aa78:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3aa7c:	f8 03 00 aa	mov	x24, x0
   3aa80:	08 0f 02 f8	str	x8, [x24, #0x20]!
   3aa84:	59 37 00 d0	adrp	x25, 1770 ; 0x724000
   3aa88:	39 27 41 f9	ldr	x25, [x25, #0x248] ; literal pool symbol address: _$sSSN
   3aa8c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3aa90:	19 24 00 f9	str	x25, [x0, #0x48]
   3aa94:	89 a2 00 91	add	x9, x20, #0x28
   3aa98:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3aa9c:	17 1c 00 f9	str	x23, [x0, #0x38]
   3aaa0:	1d 4b 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3aaa4:	f7 03 00 aa	mov	x23, x0
   3aaa8:	e0 03 15 aa	mov	x0, x21
   3aaac:	0b 6c 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3aab0:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3aab4:	21 e0 12 91	add	x1, x1, #0x4b8
   3aab8:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3aabc:	42 c0 1c 91	add	x2, x2, #0x730
   3aac0:	e0 03 18 aa	mov	x0, x24
   3aac4:	d3 53 00 94	bl	_$sypSgWOhTm
   3aac8:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3aacc:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3aad0:	21 6b 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3aad4:	f5 03 00 aa	mov	x21, x0
   3aad8:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3aadc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3aae0:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3aae4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3aae8:	02 21 00 91	add	x2, x8, #0x8
   3aaec:	e0 03 17 aa	mov	x0, x23
   3aaf0:	e1 03 19 aa	mov	x1, x25
   3aaf4:	7d 66 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3aaf8:	f8 03 00 aa	mov	x24, x0
   3aafc:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3ab00:	64 22 00 91	add	x4, x19, #0x8
   3ab04:	e0 03 15 aa	mov	x0, x21
   3ab08:	e2 03 18 aa	mov	x2, x24
   3ab0c:	03 00 80 d2	mov	x3, #0x0
   3ab10:	64 72 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3ab14:	fd 03 1d aa	mov	x29, x29
   3ab18:	18 6b 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3ab1c:	f5 03 00 aa	mov	x21, x0
   3ab20:	e0 03 18 aa	mov	x0, x24
   3ab24:	0f 6b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ab28:	60 06 40 f9	ldr	x0, [x19, #0x8]
   3ab2c:	10 6b 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3ab30:	75 27 00 b4	cbz	x21, 0x3b01c
   3ab34:	e0 03 15 aa	mov	x0, x21
   3ab38:	8b 65 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3ab3c:	f8 03 00 aa	mov	x24, x0
   3ab40:	f9 03 01 aa	mov	x25, x1
   3ab44:	e0 03 15 aa	mov	x0, x21
   3ab48:	06 6b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ab4c:	e8 03 16 aa	mov	x8, x22
   3ab50:	7b 66 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3ab54:	e0 03 18 aa	mov	x0, x24
   3ab58:	e1 03 19 aa	mov	x1, x25
   3ab5c:	e2 03 16 aa	mov	x2, x22
   3ab60:	74 66 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3ab64:	f6 03 00 aa	mov	x22, x0
   3ab68:	f5 03 01 aa	mov	x21, x1
   3ab6c:	e0 03 18 aa	mov	x0, x24
   3ab70:	e1 03 19 aa	mov	x1, x25
   3ab74:	c9 4a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3ab78:	d5 27 00 b4	cbz	x21, 0x3b070
   3ab7c:	e0 03 17 aa	mov	x0, x23
   3ab80:	f7 01 00 14	b	0x3b35c
   3ab84:	f8 03 00 aa	mov	x24, x0
   3ab88:	f7 03 01 aa	mov	x23, x1
   3ab8c:	00 00 80 d2	mov	x0, #0x0
   3ab90:	15 65 13 94	bl	0x513fe4 ; symbol stub for: _$s10Foundation11JSONDecoderCMa
   3ab94:	01 30 40 b9	ldr	w1, [x0, #0x30]
   3ab98:	02 68 40 79	ldrh	w2, [x0, #0x34]
   3ab9c:	84 6b 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3aba0:	f4 03 00 aa	mov	x20, x0
   3aba4:	0d 65 13 94	bl	0x513fd8 ; symbol stub for: _$s10Foundation11JSONDecoderCACycfc
   3aba8:	fa 03 00 aa	mov	x26, x0
   3abac:	12 4f 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSeAAWl
   3abb0:	e4 03 00 aa	mov	x4, x0
   3abb4:	40 37 00 d0	adrp	x0, 1770 ; 0x724000
   3abb8:	00 20 2b 91	add	x0, x0, #0xac8
   3abbc:	68 22 00 91	add	x8, x19, #0x8
   3abc0:	e1 03 18 aa	mov	x1, x24
   3abc4:	e2 03 17 aa	mov	x2, x23
   3abc8:	e3 03 00 aa	mov	x3, x0
   3abcc:	f4 03 1a aa	mov	x20, x26
   3abd0:	15 00 80 d2	mov	x21, #0x0
   3abd4:	fe 64 13 94	bl	0x513fcc ; symbol stub for: _$s10Foundation11JSONDecoderC6decode_4fromxxm_AA4DataVtKSeRzlFTj
   3abd8:	35 16 00 b4	cbz	x21, 0x3ae9c
   3abdc:	f9 03 15 aa	mov	x25, x21
   3abe0:	b4 04 80 d2	mov	x20, #0x25
   3abe4:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3abe8:	e0 03 1a aa	mov	x0, x26
   3abec:	b2 6b 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3abf0:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3abf4:	08 c1 3c 91	add	x8, x8, #0xf30 ; literal pool for: "Invalid install metadata"
   3abf8:	08 81 00 d1	sub	x8, x8, #0x20
   3abfc:	1a 01 41 b2	orr	x26, x8, #0x8000000000000000
   3ac00:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3ac04:	00 c0 12 91	add	x0, x0, #0x4b0
   3ac08:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3ac0c:	21 a0 1c 91	add	x1, x1, #0x728
   3ac10:	27 a6 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3ac14:	61 02 06 91	add	x1, x19, #0x180
   3ac18:	9b 6b 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3ac1c:	f5 03 00 aa	mov	x21, x0
   3ac20:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3ac24:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3ac28:	00 04 80 3d	str	q0, [x0, #0x10]
   3ac2c:	a8 4c 8e d2	mov	x8, #0x7265
   3ac30:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3ac34:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3ac38:	fb 03 00 aa	mov	x27, x0
   3ac3c:	68 0f 02 f8	str	x8, [x27, #0x20]!
   3ac40:	5c 37 00 d0	adrp	x28, 1770 ; 0x724000
   3ac44:	9c 27 41 f9	ldr	x28, [x28, #0x248] ; literal pool symbol address: _$sSSN
   3ac48:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3ac4c:	1c 24 00 f9	str	x28, [x0, #0x48]
   3ac50:	89 36 00 d1	sub	x9, x20, #0xd
   3ac54:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3ac58:	1a 1c 00 f9	str	x26, [x0, #0x38]
   3ac5c:	ae 4a 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3ac60:	fa 03 00 aa	mov	x26, x0
   3ac64:	e0 03 15 aa	mov	x0, x21
   3ac68:	9c 6b 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3ac6c:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3ac70:	21 e0 12 91	add	x1, x1, #0x4b8
   3ac74:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3ac78:	42 c0 1c 91	add	x2, x2, #0x730
   3ac7c:	e0 03 1b aa	mov	x0, x27
   3ac80:	64 53 00 94	bl	_$sypSgWOhTm
   3ac84:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3ac88:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3ac8c:	b2 6a 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3ac90:	f5 03 00 aa	mov	x21, x0
   3ac94:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3ac98:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3ac9c:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3aca0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3aca4:	02 21 00 91	add	x2, x8, #0x8
   3aca8:	e0 03 1a aa	mov	x0, x26
   3acac:	e1 03 1c aa	mov	x1, x28
   3acb0:	0e 66 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3acb4:	fb 03 00 aa	mov	x27, x0
   3acb8:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3acbc:	64 22 00 91	add	x4, x19, #0x8
   3acc0:	e0 03 15 aa	mov	x0, x21
   3acc4:	e2 03 1b aa	mov	x2, x27
   3acc8:	03 00 80 d2	mov	x3, #0x0
   3accc:	f5 71 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3acd0:	fd 03 1d aa	mov	x29, x29
   3acd4:	a9 6a 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3acd8:	f5 03 00 aa	mov	x21, x0
   3acdc:	e0 03 1b aa	mov	x0, x27
   3ace0:	a0 6a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ace4:	60 06 40 f9	ldr	x0, [x19, #0x8]
   3ace8:	a1 6a 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3acec:	15 17 00 b4	cbz	x21, 0x3afcc
   3acf0:	e0 03 15 aa	mov	x0, x21
   3acf4:	1c 65 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3acf8:	fb 03 00 aa	mov	x27, x0
   3acfc:	fc 03 01 aa	mov	x28, x1
   3ad00:	e0 03 15 aa	mov	x0, x21
   3ad04:	97 6a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ad08:	e8 03 16 aa	mov	x8, x22
   3ad0c:	0c 66 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3ad10:	e0 03 1b aa	mov	x0, x27
   3ad14:	e1 03 1c aa	mov	x1, x28
   3ad18:	e2 03 16 aa	mov	x2, x22
   3ad1c:	05 66 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3ad20:	f6 03 00 aa	mov	x22, x0
   3ad24:	f5 03 01 aa	mov	x21, x1
   3ad28:	e0 03 1b aa	mov	x0, x27
   3ad2c:	e1 03 1c aa	mov	x1, x28
   3ad30:	5a 4a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3ad34:	f5 15 00 b4	cbz	x21, 0x3aff0
   3ad38:	e0 03 18 aa	mov	x0, x24
   3ad3c:	e1 03 17 aa	mov	x1, x23
   3ad40:	4a 53 00 94	bl	0x4fa68
   3ad44:	e0 03 19 aa	mov	x0, x25
   3ad48:	3a 6b 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3ad4c:	e0 03 1a aa	mov	x0, x26
   3ad50:	83 01 00 14	b	0x3b35c
   3ad54:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3ad58:	00 c0 12 91	add	x0, x0, #0x4b0
   3ad5c:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3ad60:	21 a0 1c 91	add	x1, x1, #0x728
   3ad64:	d2 a5 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3ad68:	a1 c3 02 d1	sub	x1, x29, #0xb0
   3ad6c:	46 6b 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3ad70:	f4 03 00 aa	mov	x20, x0
   3ad74:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3ad78:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3ad7c:	00 04 80 3d	str	q0, [x0, #0x10]
   3ad80:	28 cd 8d d2	mov	x8, #0x6e69
   3ad84:	68 8e ae f2	movk	x8, #0x7473, lsl #16
   3ad88:	28 8c cd f2	movk	x8, #0x6c61, lsl #32
   3ad8c:	88 ad ec f2	movk	x8, #0x656c, lsl #48
   3ad90:	f5 03 00 aa	mov	x21, x0
   3ad94:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   3ad98:	88 0c 80 d2	mov	x8, #0x64
   3ad9c:	08 20 fd f2	movk	x8, #0xe900, lsl #48
   3ada0:	08 14 00 f9	str	x8, [x0, #0x28]
   3ada4:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3ada8:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   3adac:	08 24 00 f9	str	x8, [x0, #0x48]
   3adb0:	1f c0 00 39	strb	wzr, [x0, #0x30]
   3adb4:	58 4a 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3adb8:	f7 03 00 aa	mov	x23, x0
   3adbc:	e0 03 14 aa	mov	x0, x20
   3adc0:	46 6b 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3adc4:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3adc8:	21 e0 12 91	add	x1, x1, #0x4b8
   3adcc:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3add0:	42 c0 1c 91	add	x2, x2, #0x730
   3add4:	e0 03 15 aa	mov	x0, x21
   3add8:	0e 53 00 94	bl	_$sypSgWOhTm
   3addc:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3ade0:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3ade4:	5c 6a 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3ade8:	f4 03 00 aa	mov	x20, x0
   3adec:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3adf0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3adf4:	41 37 00 d0	adrp	x1, 1770 ; 0x724000
   3adf8:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   3adfc:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3ae00:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3ae04:	02 21 00 91	add	x2, x8, #0x8
   3ae08:	e0 03 17 aa	mov	x0, x23
   3ae0c:	b7 65 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3ae10:	f5 03 00 aa	mov	x21, x0
   3ae14:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3ae18:	64 22 00 91	add	x4, x19, #0x8
   3ae1c:	e0 03 14 aa	mov	x0, x20
   3ae20:	e2 03 15 aa	mov	x2, x21
   3ae24:	03 00 80 d2	mov	x3, #0x0
   3ae28:	9e 71 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3ae2c:	fd 03 1d aa	mov	x29, x29
   3ae30:	52 6a 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3ae34:	f4 03 00 aa	mov	x20, x0
   3ae38:	e0 03 15 aa	mov	x0, x21
   3ae3c:	49 6a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ae40:	60 06 40 f9	ldr	x0, [x19, #0x8]
   3ae44:	4a 6a 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3ae48:	f4 0f 00 b4	cbz	x20, 0x3b044
   3ae4c:	e0 03 14 aa	mov	x0, x20
   3ae50:	c5 64 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3ae54:	f8 03 00 aa	mov	x24, x0
   3ae58:	f9 03 01 aa	mov	x25, x1
   3ae5c:	e0 03 14 aa	mov	x0, x20
   3ae60:	40 6a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3ae64:	e8 03 16 aa	mov	x8, x22
   3ae68:	b5 65 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3ae6c:	e0 03 18 aa	mov	x0, x24
   3ae70:	e1 03 19 aa	mov	x1, x25
   3ae74:	e2 03 16 aa	mov	x2, x22
   3ae78:	ae 65 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3ae7c:	f4 03 00 aa	mov	x20, x0
   3ae80:	f5 03 01 aa	mov	x21, x1
   3ae84:	e0 03 18 aa	mov	x0, x24
   3ae88:	e1 03 19 aa	mov	x1, x25
   3ae8c:	03 4a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3ae90:	d5 0e 00 b4	cbz	x21, 0x3b068
   3ae94:	e0 03 17 aa	mov	x0, x23
   3ae98:	45 01 00 14	b	0x3b3ac
   3ae9c:	e0 03 1a aa	mov	x0, x26
   3aea0:	05 6b 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3aea4:	79 22 40 39	ldrb	w25, [x19, #0x8]
   3aea8:	48 38 00 f0	adrp	x8, 1803 ; 0x745000
   3aeac:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   3aeb0:	1f 05 00 b1	cmn	x8, #0x1
   3aeb4:	01 3b 00 54	b.ne	0x3b614
   3aeb8:	48 38 00 d0	adrp	x8, 1802 ; 0x744000
   3aebc:	08 61 39 91	add	x8, x8, #0xe58
   3aec0:	00 05 40 a9	ldp	x0, x1, [x8]
   3aec4:	c2 e0 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3aec8:	f4 03 01 aa	mov	x20, x1
   3aecc:	e7 52 00 94	bl	0x4fa68
   3aed0:	88 fe 7c d3	lsr	x8, x20, #60
   3aed4:	1f 39 00 f1	cmp	x8, #0xe
   3aed8:	a9 0d 00 54	b.ls	0x3b08c
   3aedc:	b4 04 80 d2	mov	x20, #0x25
   3aee0:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3aee4:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3aee8:	08 81 36 91	add	x8, x8, #0xda0 ; literal pool for: "Install signing key not found"
   3aeec:	08 81 00 d1	sub	x8, x8, #0x20
   3aef0:	19 01 41 b2	orr	x25, x8, #0x8000000000000000
   3aef4:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3aef8:	00 c0 12 91	add	x0, x0, #0x4b0
   3aefc:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3af00:	21 a0 1c 91	add	x1, x1, #0x728
   3af04:	6a a5 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3af08:	61 42 00 91	add	x1, x19, #0x10
   3af0c:	de 6a 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3af10:	f5 03 00 aa	mov	x21, x0
   3af14:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3af18:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3af1c:	00 04 80 3d	str	q0, [x0, #0x10]
   3af20:	a8 4c 8e d2	mov	x8, #0x7265
   3af24:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3af28:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3af2c:	fa 03 00 aa	mov	x26, x0
   3af30:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3af34:	5b 37 00 d0	adrp	x27, 1770 ; 0x724000
   3af38:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   3af3c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3af40:	1b 24 00 f9	str	x27, [x0, #0x48]
   3af44:	89 22 00 d1	sub	x9, x20, #0x8
   3af48:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3af4c:	19 1c 00 f9	str	x25, [x0, #0x38]
   3af50:	f1 49 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3af54:	f9 03 00 aa	mov	x25, x0
   3af58:	e0 03 15 aa	mov	x0, x21
   3af5c:	df 6a 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3af60:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3af64:	21 e0 12 91	add	x1, x1, #0x4b8
   3af68:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3af6c:	42 c0 1c 91	add	x2, x2, #0x730
   3af70:	e0 03 1a aa	mov	x0, x26
   3af74:	a7 52 00 94	bl	_$sypSgWOhTm
   3af78:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3af7c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3af80:	f5 69 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3af84:	f5 03 00 aa	mov	x21, x0
   3af88:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3af8c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3af90:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3af94:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3af98:	02 21 00 91	add	x2, x8, #0x8
   3af9c:	e0 03 19 aa	mov	x0, x25
   3afa0:	e1 03 1b aa	mov	x1, x27
   3afa4:	51 65 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3afa8:	fa 03 00 aa	mov	x26, x0
   3afac:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3afb0:	64 22 00 91	add	x4, x19, #0x8
   3afb4:	e0 03 15 aa	mov	x0, x21
   3afb8:	e2 03 1a aa	mov	x2, x26
   3afbc:	03 00 80 d2	mov	x3, #0x0
   3afc0:	38 71 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3afc4:	fd 03 1d aa	mov	x29, x29
   3afc8:	c8 00 00 14	b	0x3b2e8
   3afcc:	f5 03 00 aa	mov	x21, x0
   3afd0:	29 64 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3afd4:	f6 03 00 aa	mov	x22, x0
   3afd8:	e0 03 15 aa	mov	x0, x21
   3afdc:	e1 69 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3afe0:	f5 03 16 aa	mov	x21, x22
   3afe4:	c6 6a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3afe8:	e0 03 16 aa	mov	x0, x22
   3afec:	91 6a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3aff0:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3aff4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3aff8:	08 81 00 d1	sub	x8, x8, #0x20
   3affc:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3b000:	e0 03 18 aa	mov	x0, x24
   3b004:	e1 03 17 aa	mov	x1, x23
   3b008:	98 52 00 94	bl	0x4fa68
   3b00c:	e0 03 19 aa	mov	x0, x25
   3b010:	88 6a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b014:	e0 03 1a aa	mov	x0, x26
   3b018:	e5 00 00 14	b	0x3b3ac
   3b01c:	f5 03 00 aa	mov	x21, x0
   3b020:	15 64 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3b024:	f6 03 00 aa	mov	x22, x0
   3b028:	e0 03 15 aa	mov	x0, x21
   3b02c:	cd 69 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b030:	f5 03 16 aa	mov	x21, x22
   3b034:	b2 6a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3b038:	e0 03 16 aa	mov	x0, x22
   3b03c:	7d 6a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b040:	0c 00 00 14	b	0x3b070
   3b044:	f4 03 00 aa	mov	x20, x0
   3b048:	0b 64 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3b04c:	f6 03 00 aa	mov	x22, x0
   3b050:	e0 03 14 aa	mov	x0, x20
   3b054:	c3 69 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b058:	f5 03 16 aa	mov	x21, x22
   3b05c:	a8 6a 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3b060:	e0 03 16 aa	mov	x0, x22
   3b064:	73 6a 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b068:	b4 04 80 d2	mov	x20, #0x25
   3b06c:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3b070:	e0 03 17 aa	mov	x0, x23
   3b074:	5a 6a 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b078:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3b07c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3b080:	08 81 00 d1	sub	x8, x8, #0x20
   3b084:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3b088:	ca 00 00 14	b	0x3b3b0
   3b08c:	00 00 80 d2	mov	x0, #0x0
   3b090:	01 00 fe d2	mov	x1, #-0x1000000000000000
   3b094:	75 52 00 94	bl	0x4fa68
   3b098:	48 38 00 d0	adrp	x8, 1802 ; 0x745000
   3b09c:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   3b0a0:	1f 05 00 b1	cmn	x8, #0x1
   3b0a4:	41 2c 00 54	b.ne	0x3b62c
   3b0a8:	48 38 00 b0	adrp	x8, 1801 ; 0x744000
   3b0ac:	08 a1 39 91	add	x8, x8, #0xe68
   3b0b0:	00 05 40 a9	ldp	x0, x1, [x8]
   3b0b4:	46 e0 ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3b0b8:	f4 03 01 aa	mov	x20, x1
   3b0bc:	6b 52 00 94	bl	0x4fa68
   3b0c0:	88 fe 7c d3	lsr	x8, x20, #60
   3b0c4:	1f 39 00 f1	cmp	x8, #0xe
   3b0c8:	a9 07 00 54	b.ls	0x3b1bc
   3b0cc:	b4 04 80 d2	mov	x20, #0x25
   3b0d0:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3b0d4:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3b0d8:	08 01 37 91	add	x8, x8, #0xdc0 ; literal pool for: "Install key agreement key not found"
   3b0dc:	08 81 00 d1	sub	x8, x8, #0x20
   3b0e0:	19 01 41 b2	orr	x25, x8, #0x8000000000000000
   3b0e4:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b0e8:	00 c0 12 91	add	x0, x0, #0x4b0
   3b0ec:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b0f0:	21 a0 1c 91	add	x1, x1, #0x728
   3b0f4:	ee a4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b0f8:	61 82 01 91	add	x1, x19, #0x60
   3b0fc:	62 6a 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3b100:	f5 03 00 aa	mov	x21, x0
   3b104:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3b108:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3b10c:	00 04 80 3d	str	q0, [x0, #0x10]
   3b110:	a8 4c 8e d2	mov	x8, #0x7265
   3b114:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3b118:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3b11c:	fa 03 00 aa	mov	x26, x0
   3b120:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3b124:	5b 37 00 b0	adrp	x27, 1769 ; 0x724000
   3b128:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   3b12c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3b130:	1b 24 00 f9	str	x27, [x0, #0x48]
   3b134:	89 0a 00 d1	sub	x9, x20, #0x2
   3b138:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3b13c:	19 1c 00 f9	str	x25, [x0, #0x38]
   3b140:	75 49 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3b144:	f9 03 00 aa	mov	x25, x0
   3b148:	e0 03 15 aa	mov	x0, x21
   3b14c:	63 6a 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3b150:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3b154:	21 e0 12 91	add	x1, x1, #0x4b8
   3b158:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3b15c:	42 c0 1c 91	add	x2, x2, #0x730
   3b160:	e0 03 1a aa	mov	x0, x26
   3b164:	2b 52 00 94	bl	_$sypSgWOhTm
   3b168:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3b16c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3b170:	79 69 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3b174:	f5 03 00 aa	mov	x21, x0
   3b178:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b17c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3b180:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3b184:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3b188:	02 21 00 91	add	x2, x8, #0x8
   3b18c:	e0 03 19 aa	mov	x0, x25
   3b190:	e1 03 1b aa	mov	x1, x27
   3b194:	d5 64 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3b198:	fa 03 00 aa	mov	x26, x0
   3b19c:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3b1a0:	64 22 00 91	add	x4, x19, #0x8
   3b1a4:	e0 03 15 aa	mov	x0, x21
   3b1a8:	e2 03 1a aa	mov	x2, x26
   3b1ac:	03 00 80 d2	mov	x3, #0x0
   3b1b0:	bc 70 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3b1b4:	fd 03 1d aa	mov	x29, x29
   3b1b8:	4c 00 00 14	b	0x3b2e8
   3b1bc:	00 00 80 d2	mov	x0, #0x0
   3b1c0:	01 00 fe d2	mov	x1, #-0x1000000000000000
   3b1c4:	29 52 00 94	bl	0x4fa68
   3b1c8:	48 38 00 d0	adrp	x8, 1802 ; 0x745000
   3b1cc:	08 01 41 f9	ldr	x8, [x8, #0x200]
   3b1d0:	1f 05 00 b1	cmn	x8, #0x1
   3b1d4:	81 23 00 54	b.ne	0x3b644
   3b1d8:	48 38 00 b0	adrp	x8, 1801 ; 0x744000
   3b1dc:	08 e1 39 91	add	x8, x8, #0xe78
   3b1e0:	00 05 40 a9	ldp	x0, x1, [x8]
   3b1e4:	fa df ff 97	bl	_$s16AsideNativeSwift11installRead7account10Foundation4DataVSgSS_tF
   3b1e8:	f4 03 01 aa	mov	x20, x1
   3b1ec:	1f 52 00 94	bl	0x4fa68
   3b1f0:	88 fe 7c d3	lsr	x8, x20, #60
   3b1f4:	1f 39 00 f1	cmp	x8, #0xe
   3b1f8:	c9 0f 00 54	b.ls	0x3b3f0
   3b1fc:	b4 04 80 d2	mov	x20, #0x25
   3b200:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3b204:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3b208:	08 c1 37 91	add	x8, x8, #0xdf0 ; literal pool for: "Wrapped DK not found"
   3b20c:	08 81 00 d1	sub	x8, x8, #0x20
   3b210:	19 01 41 b2	orr	x25, x8, #0x8000000000000000
   3b214:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b218:	00 c0 12 91	add	x0, x0, #0x4b0
   3b21c:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b220:	21 a0 1c 91	add	x1, x1, #0x728
   3b224:	a2 a4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b228:	61 c2 02 91	add	x1, x19, #0xb0
   3b22c:	16 6a 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3b230:	f5 03 00 aa	mov	x21, x0
   3b234:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3b238:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3b23c:	00 04 80 3d	str	q0, [x0, #0x10]
   3b240:	a8 4c 8e d2	mov	x8, #0x7265
   3b244:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3b248:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3b24c:	fa 03 00 aa	mov	x26, x0
   3b250:	48 0f 02 f8	str	x8, [x26, #0x20]!
   3b254:	5b 37 00 b0	adrp	x27, 1769 ; 0x724000
   3b258:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   3b25c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3b260:	1b 24 00 f9	str	x27, [x0, #0x48]
   3b264:	89 46 00 d1	sub	x9, x20, #0x11
   3b268:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3b26c:	19 1c 00 f9	str	x25, [x0, #0x38]
   3b270:	29 49 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3b274:	f9 03 00 aa	mov	x25, x0
   3b278:	e0 03 15 aa	mov	x0, x21
   3b27c:	17 6a 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3b280:	21 38 00 d0	adrp	x1, 1798 ; 0x741000
   3b284:	21 e0 12 91	add	x1, x1, #0x4b8
   3b288:	62 27 00 f0	adrp	x2, 1263 ; 0x52a000
   3b28c:	42 c0 1c 91	add	x2, x2, #0x730
   3b290:	e0 03 1a aa	mov	x0, x26
   3b294:	df 51 00 94	bl	_$sypSgWOhTm
   3b298:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3b29c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3b2a0:	2d 69 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3b2a4:	f5 03 00 aa	mov	x21, x0
   3b2a8:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b2ac:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3b2b0:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3b2b4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3b2b8:	02 21 00 91	add	x2, x8, #0x8
   3b2bc:	e0 03 19 aa	mov	x0, x25
   3b2c0:	e1 03 1b aa	mov	x1, x27
   3b2c4:	89 64 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3b2c8:	fa 03 00 aa	mov	x26, x0
   3b2cc:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3b2d0:	64 22 00 91	add	x4, x19, #0x8
   3b2d4:	e0 03 15 aa	mov	x0, x21
   3b2d8:	e2 03 1a aa	mov	x2, x26
   3b2dc:	03 00 80 d2	mov	x3, #0x0
   3b2e0:	70 70 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3b2e4:	fd 03 1d aa	mov	x29, x29
   3b2e8:	24 69 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3b2ec:	f5 03 00 aa	mov	x21, x0
   3b2f0:	e0 03 1a aa	mov	x0, x26
   3b2f4:	1b 69 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b2f8:	60 06 40 f9	ldr	x0, [x19, #0x8]
   3b2fc:	1c 69 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3b300:	55 03 00 b4	cbz	x21, 0x3b368
   3b304:	e0 03 15 aa	mov	x0, x21
   3b308:	97 63 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3b30c:	fa 03 00 aa	mov	x26, x0
   3b310:	fb 03 01 aa	mov	x27, x1
   3b314:	e0 03 15 aa	mov	x0, x21
   3b318:	12 69 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b31c:	e8 03 16 aa	mov	x8, x22
   3b320:	87 64 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3b324:	e0 03 1a aa	mov	x0, x26
   3b328:	e1 03 1b aa	mov	x1, x27
   3b32c:	e2 03 16 aa	mov	x2, x22
   3b330:	80 64 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3b334:	f6 03 00 aa	mov	x22, x0
   3b338:	f5 03 01 aa	mov	x21, x1
   3b33c:	e0 03 1a aa	mov	x0, x26
   3b340:	e1 03 1b aa	mov	x1, x27
   3b344:	d5 48 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3b348:	35 02 00 b4	cbz	x21, 0x3b38c
   3b34c:	e0 03 18 aa	mov	x0, x24
   3b350:	e1 03 17 aa	mov	x1, x23
   3b354:	c5 51 00 94	bl	0x4fa68
   3b358:	e0 03 19 aa	mov	x0, x25
   3b35c:	a0 69 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b360:	f4 03 16 aa	mov	x20, x22
   3b364:	13 00 00 14	b	0x3b3b0
   3b368:	f5 03 00 aa	mov	x21, x0
   3b36c:	42 63 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3b370:	f6 03 00 aa	mov	x22, x0
   3b374:	e0 03 15 aa	mov	x0, x21
   3b378:	fa 68 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b37c:	f5 03 16 aa	mov	x21, x22
   3b380:	df 69 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3b384:	e0 03 16 aa	mov	x0, x22
   3b388:	aa 69 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b38c:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3b390:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3b394:	08 81 00 d1	sub	x8, x8, #0x20
   3b398:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3b39c:	e0 03 18 aa	mov	x0, x24
   3b3a0:	e1 03 17 aa	mov	x1, x23
   3b3a4:	b1 51 00 94	bl	0x4fa68
   3b3a8:	e0 03 19 aa	mov	x0, x25
   3b3ac:	8c 69 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b3b0:	a8 03 5a f8	ldur	x8, [x29, #-0x60]
   3b3b4:	49 37 00 b0	adrp	x9, 1769 ; 0x724000
   3b3b8:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   3b3bc:	29 01 40 f9	ldr	x9, [x9]
   3b3c0:	3f 01 08 eb	cmp	x9, x8
   3b3c4:	c1 14 00 54	b.ne	0x3b65c
   3b3c8:	e0 03 14 aa	mov	x0, x20
   3b3cc:	e1 03 15 aa	mov	x1, x21
   3b3d0:	bf 43 01 d1	sub	sp, x29, #0x50
   3b3d4:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   3b3d8:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   3b3dc:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   3b3e0:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   3b3e4:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   3b3e8:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   3b3ec:	c0 03 5f d6	ret
   3b3f0:	00 00 80 d2	mov	x0, #0x0
   3b3f4:	01 00 fe d2	mov	x1, #-0x1000000000000000
   3b3f8:	9c 51 00 94	bl	0x4fa68
   3b3fc:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b400:	00 c0 12 91	add	x0, x0, #0x4b0
   3b404:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b408:	21 a0 1c 91	add	x1, x1, #0x728
   3b40c:	28 a4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b410:	61 02 04 91	add	x1, x19, #0x100
   3b414:	9c 69 13 94	bl	0x515a84 ; symbol stub for: _swift_initStackObject
   3b418:	f4 03 00 aa	mov	x20, x0
   3b41c:	68 27 00 f0	adrp	x8, 1263 ; 0x52a000
   3b420:	00 b1 c1 3d	ldr	q0, [x8, #0x6c0]
   3b424:	28 cd 8d d2	mov	x8, #0x6e69
   3b428:	68 8e ae f2	movk	x8, #0x7473, lsl #16
   3b42c:	28 8c cd f2	movk	x8, #0x6c61, lsl #32
   3b430:	88 ad ec f2	movk	x8, #0x656c, lsl #48
   3b434:	f5 03 00 aa	mov	x21, x0
   3b438:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   3b43c:	00 04 80 3d	str	q0, [x0, #0x10]
   3b440:	88 0c 80 d2	mov	x8, #0x64
   3b444:	08 20 fd f2	movk	x8, #0xe900, lsl #48
   3b448:	08 14 00 f9	str	x8, [x0, #0x28]
   3b44c:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b450:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   3b454:	29 00 80 52	mov	w9, #0x1
   3b458:	09 c0 00 39	strb	w9, [x0, #0x30]
   3b45c:	69 6e 8c d2	mov	x9, #0x6373
   3b460:	09 ad ac f2	movk	x9, #0x6568, lsl #16
   3b464:	a9 ad cc f2	movk	x9, #0x656d, lsl #32
   3b468:	08 a4 04 a9	stp	x8, x9, [x0, #0x48]
   3b46c:	3f 07 00 71	cmp	w25, #0x1
   3b470:	08 4e 86 d2	mov	x8, #0x3270
   3b474:	a8 c6 a6 f2	movk	x8, #0x3635, lsl #16
   3b478:	e8 cb ce f2	movk	x8, #0x765f, lsl #32
   3b47c:	28 06 e0 f2	movk	x8, #0x31, lsl #48
   3b480:	09 2e 8e d2	mov	x9, #0x7170
   3b484:	e9 cb ae f2	movk	x9, #0x765f, lsl #16
   3b488:	29 06 c0 f2	movk	x9, #0x31, lsl #32
   3b48c:	28 01 88 9a	csel	x8, x9, x8, eq
   3b490:	09 e0 fc d2	mov	x9, #-0x1900000000000000
   3b494:	0a a0 fc d2	mov	x10, #-0x1b00000000000000
   3b498:	5a 37 00 b0	adrp	x26, 1769 ; 0x724000
   3b49c:	5a 27 41 f9	ldr	x26, [x26, #0x248] ; literal pool symbol address: _$sSSN
   3b4a0:	49 01 89 9a	csel	x9, x10, x9, eq
   3b4a4:	0a c0 fc d2	mov	x10, #-0x1a00000000000000
   3b4a8:	1a 3c 00 f9	str	x26, [x0, #0x78]
   3b4ac:	0a a0 05 a9	stp	x10, x8, [x0, #0x58]
   3b4b0:	09 34 00 f9	str	x9, [x0, #0x68]
   3b4b4:	98 48 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3b4b8:	f9 03 00 aa	mov	x25, x0
   3b4bc:	e0 03 14 aa	mov	x0, x20
   3b4c0:	86 69 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3b4c4:	20 38 00 d0	adrp	x0, 1798 ; 0x741000
   3b4c8:	00 e0 12 91	add	x0, x0, #0x4b8
   3b4cc:	61 27 00 f0	adrp	x1, 1263 ; 0x52a000
   3b4d0:	21 c0 1c 91	add	x1, x1, #0x730
   3b4d4:	f6 a3 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3b4d8:	e2 03 00 aa	mov	x2, x0
   3b4dc:	e0 03 15 aa	mov	x0, x21
   3b4e0:	41 00 80 52	mov	w1, #0x2
   3b4e4:	35 69 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   3b4e8:	28 38 00 d0	adrp	x8, 1798 ; 0x741000
   3b4ec:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3b4f0:	99 68 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3b4f4:	f4 03 00 aa	mov	x20, x0
   3b4f8:	48 37 00 b0	adrp	x8, 1769 ; 0x724000
   3b4fc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3b500:	43 37 00 b0	adrp	x3, 1769 ; 0x724000
   3b504:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3b508:	02 21 00 91	add	x2, x8, #0x8
   3b50c:	e0 03 19 aa	mov	x0, x25
   3b510:	e1 03 1a aa	mov	x1, x26
   3b514:	f5 63 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3b518:	f5 03 00 aa	mov	x21, x0
   3b51c:	7f 06 00 f9	str	xzr, [x19, #0x8]
   3b520:	64 22 00 91	add	x4, x19, #0x8
   3b524:	e0 03 14 aa	mov	x0, x20
   3b528:	e2 03 15 aa	mov	x2, x21
   3b52c:	03 00 80 d2	mov	x3, #0x0
   3b530:	dc 6f 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3b534:	fd 03 1d aa	mov	x29, x29
   3b538:	90 68 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3b53c:	f4 03 00 aa	mov	x20, x0
   3b540:	e0 03 15 aa	mov	x0, x21
   3b544:	87 68 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b548:	60 06 40 f9	ldr	x0, [x19, #0x8]
   3b54c:	88 68 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3b550:	d4 02 00 b4	cbz	x20, 0x3b5a8
   3b554:	e0 03 14 aa	mov	x0, x20
   3b558:	03 63 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3b55c:	fa 03 00 aa	mov	x26, x0
   3b560:	fb 03 01 aa	mov	x27, x1
   3b564:	e0 03 14 aa	mov	x0, x20
   3b568:	7e 68 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b56c:	e8 03 16 aa	mov	x8, x22
   3b570:	f3 63 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3b574:	e0 03 1a aa	mov	x0, x26
   3b578:	e1 03 1b aa	mov	x1, x27
   3b57c:	e2 03 16 aa	mov	x2, x22
   3b580:	ec 63 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3b584:	f4 03 00 aa	mov	x20, x0
   3b588:	f5 03 01 aa	mov	x21, x1
   3b58c:	e0 03 1a aa	mov	x0, x26
   3b590:	e1 03 1b aa	mov	x1, x27
   3b594:	41 48 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3b598:	b5 01 00 b4	cbz	x21, 0x3b5cc
   3b59c:	e0 03 19 aa	mov	x0, x25
   3b5a0:	0f 69 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b5a4:	12 00 00 14	b	0x3b5ec
   3b5a8:	f4 03 00 aa	mov	x20, x0
   3b5ac:	b2 62 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3b5b0:	f6 03 00 aa	mov	x22, x0
   3b5b4:	e0 03 14 aa	mov	x0, x20
   3b5b8:	6a 68 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3b5bc:	f5 03 16 aa	mov	x21, x22
   3b5c0:	4f 69 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3b5c4:	e0 03 16 aa	mov	x0, x22
   3b5c8:	1a 69 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3b5cc:	b4 04 80 d2	mov	x20, #0x25
   3b5d0:	14 00 fa f2	movk	x20, #0xd000, lsl #48
   3b5d4:	e0 03 19 aa	mov	x0, x25
   3b5d8:	01 69 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3b5dc:	e8 26 00 d0	adrp	x8, 1246 ; 0x519000
   3b5e0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3b5e4:	08 81 00 d1	sub	x8, x8, #0x20
   3b5e8:	15 01 41 b2	orr	x21, x8, #0x8000000000000000
   3b5ec:	e0 03 18 aa	mov	x0, x24
   3b5f0:	e1 03 17 aa	mov	x1, x23
   3b5f4:	1d 51 00 94	bl	0x4fa68
   3b5f8:	6e ff ff 17	b	0x3b3b0
   3b5fc:	40 38 00 d0	adrp	x0, 1802 ; 0x745000
   3b600:	00 a0 07 91	add	x0, x0, #0x1e8
   3b604:	a1 ff ff b0	adrp	x1, -11 ; 0x30000
   3b608:	21 e0 1f 91	add	x1, x1, #0x7f8
   3b60c:	27 69 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3b610:	fe fc ff 17	b	0x3aa08
   3b614:	40 38 00 d0	adrp	x0, 1802 ; 0x745000
   3b618:	00 c0 07 91	add	x0, x0, #0x1f0
   3b61c:	a1 ff ff b0	adrp	x1, -11 ; 0x30000
   3b620:	21 90 21 91	add	x1, x1, #0x864
   3b624:	21 69 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3b628:	24 fe ff 17	b	0x3aeb8
   3b62c:	40 38 00 d0	adrp	x0, 1802 ; 0x745000
   3b630:	00 e0 07 91	add	x0, x0, #0x1f8
   3b634:	a1 ff ff b0	adrp	x1, -11 ; 0x30000
   3b638:	21 40 23 91	add	x1, x1, #0x8d0
   3b63c:	1b 69 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3b640:	9a fe ff 17	b	0x3b0a8
   3b644:	40 38 00 d0	adrp	x0, 1802 ; 0x745000
   3b648:	00 00 08 91	add	x0, x0, #0x200
   3b64c:	a1 ff ff b0	adrp	x1, -11 ; 0x30000
   3b650:	21 f0 24 91	add	x1, x1, #0x93c
   3b654:	15 69 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3b658:	e0 fe ff 17	b	0x3b1d8
   3b65c:	2a 67 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
