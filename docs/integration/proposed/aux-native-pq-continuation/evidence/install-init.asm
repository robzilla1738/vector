/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift14cmdInstallInitSSyF:
   34df4:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   34df8:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   34dfc:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   34e00:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   34e04:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   34e08:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   34e0c:	fd 43 01 91	add	x29, sp, #0x50
   34e10:	ff c3 08 d1	sub	sp, sp, #0x230
   34e14:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34e18:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   34e1c:	08 01 40 f9	ldr	x8, [x8]
   34e20:	a8 83 19 f8	stur	x8, [x29, #-0x68]
   34e24:	15 00 80 d2	mov	x21, #0x0
   34e28:	86 fe ff 97	bl	_$s16AsideNativeSwift32existingInstallationInitResponseSDySSypGSgyKF
   34e2c:	fa 03 15 aa	mov	x26, x21
   34e30:	b5 11 00 b4	cbz	x21, 0x35064
   34e34:	b9 04 80 d2	mov	x25, #0x25
   34e38:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   34e3c:	08 00 fc d2	mov	x8, #-0x2000000000000000
   34e40:	bf 23 34 a9	stp	xzr, x8, [x29, #-0xc0]
   34e44:	b4 03 03 d1	sub	x20, x29, #0xc0
   34e48:	e0 02 80 52	mov	w0, #0x17
   34e4c:	0d 7e 13 94	bl	0x514680 ; symbol stub for: _$ss11_StringGutsV4growyySiF
   34e50:	a0 83 54 f8	ldur	x0, [x29, #-0xb8]
   34e54:	e2 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   34e58:	28 27 00 b0	adrp	x8, 1253 ; 0x519000
   34e5c:	08 41 38 91	add	x8, x8, #0xe10 ; literal pool for: "install-init failed: "
   34e60:	08 81 00 d1	sub	x8, x8, #0x20
   34e64:	08 01 41 b2	orr	x8, x8, #0x8000000000000000
   34e68:	29 43 00 d1	sub	x9, x25, #0x10
   34e6c:	a9 23 34 a9	stp	x9, x8, [x29, #-0xc0]
   34e70:	a1 c3 04 d1	sub	x1, x29, #0x130
   34e74:	a2 23 05 d1	sub	x2, x29, #0x148
   34e78:	e0 03 1a aa	mov	x0, x26
   34e7c:	f3 82 13 94	bl	0x515a48 ; symbol stub for: _swift_getErrorValue
   34e80:	a8 23 01 d1	sub	x8, x29, #0x48
   34e84:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   34e88:	a8 03 01 d1	sub	x8, x29, #0x40
   34e8c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   34e90:	a8 e3 00 d1	sub	x8, x29, #0x38
   34e94:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   34e98:	3c 7e 13 94	bl	0x514788 ; symbol stub for: _$ss5ErrorP10FoundationE20localizedDescriptionSSvg
   34e9c:	f3 03 01 aa	mov	x19, x1
   34ea0:	b4 03 03 d1	sub	x20, x29, #0xc0
   34ea4:	b2 7d 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   34ea8:	e0 03 13 aa	mov	x0, x19
   34eac:	cc 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   34eb0:	b6 4f 74 a9	ldp	x22, x19, [x29, #-0xc0]
   34eb4:	60 38 00 b0	adrp	x0, 1805 ; 0x741000
   34eb8:	00 c0 12 91	add	x0, x0, #0x4b0
   34ebc:	a1 27 00 d0	adrp	x1, 1270 ; 0x52a000
   34ec0:	21 a0 1c 91	add	x1, x1, #0x728
   34ec4:	7a bd ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   34ec8:	01 0a 80 52	mov	w1, #0x50
   34ecc:	e2 00 80 52	mov	w2, #0x7
   34ed0:	b7 82 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   34ed4:	f4 03 00 aa	mov	x20, x0
   34ed8:	a8 27 00 d0	adrp	x8, 1270 ; 0x52a000
   34edc:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   34ee0:	00 04 80 3d	str	q0, [x0, #0x10]
   34ee4:	a8 4c 8e d2	mov	x8, #0x7265
   34ee8:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   34eec:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   34ef0:	f5 03 00 aa	mov	x21, x0
   34ef4:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   34ef8:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   34efc:	97 37 00 90	adrp	x23, 1776 ; 0x724000
   34f00:	f7 26 41 f9	ldr	x23, [x23, #0x248] ; literal pool symbol address: _$sSSN
   34f04:	17 24 00 f9	str	x23, [x0, #0x48]
   34f08:	08 d8 02 a9	stp	x8, x22, [x0, #0x28]
   34f0c:	13 1c 00 f9	str	x19, [x0, #0x38]
   34f10:	e0 03 13 aa	mov	x0, x19
   34f14:	b8 82 13 94	bl	0x5159f4 ; symbol stub for: _swift_bridgeObjectRetain
   34f18:	e0 03 14 aa	mov	x0, x20
   34f1c:	fe 61 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   34f20:	f6 03 00 aa	mov	x22, x0
   34f24:	e0 03 14 aa	mov	x0, x20
   34f28:	ec 82 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   34f2c:	61 38 00 b0	adrp	x1, 1805 ; 0x741000
   34f30:	21 e0 12 91	add	x1, x1, #0x4b8
   34f34:	a2 27 00 d0	adrp	x2, 1270 ; 0x52a000
   34f38:	42 c0 1c 91	add	x2, x2, #0x730
   34f3c:	e0 03 15 aa	mov	x0, x21
   34f40:	b4 6a 00 94	bl	_$sypSgWOhTm
   34f44:	e0 03 14 aa	mov	x0, x20
   34f48:	01 04 80 52	mov	w1, #0x20
   34f4c:	e2 00 80 52	mov	w2, #0x7
   34f50:	af 82 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   34f54:	68 38 00 b0	adrp	x8, 1805 ; 0x741000
   34f58:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   34f5c:	fe 81 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   34f60:	f4 03 00 aa	mov	x20, x0
   34f64:	88 37 00 90	adrp	x8, 1776 ; 0x724000
   34f68:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   34f6c:	83 37 00 90	adrp	x3, 1776 ; 0x724000
   34f70:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   34f74:	02 21 00 91	add	x2, x8, #0x8
   34f78:	e0 03 16 aa	mov	x0, x22
   34f7c:	e1 03 17 aa	mov	x1, x23
   34f80:	5a 7d 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   34f84:	f5 03 00 aa	mov	x21, x0
   34f88:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   34f8c:	a4 03 03 d1	sub	x4, x29, #0xc0
   34f90:	e0 03 14 aa	mov	x0, x20
   34f94:	e2 03 15 aa	mov	x2, x21
   34f98:	03 00 80 d2	mov	x3, #0x0
   34f9c:	41 89 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   34fa0:	fd 03 1d aa	mov	x29, x29
   34fa4:	f5 81 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   34fa8:	f4 03 00 aa	mov	x20, x0
   34fac:	e0 03 15 aa	mov	x0, x21
   34fb0:	ec 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34fb4:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   34fb8:	ed 81 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   34fbc:	54 0d 00 b4	cbz	x20, 0x35164
   34fc0:	e0 03 14 aa	mov	x0, x20
   34fc4:	68 7c 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   34fc8:	f7 03 00 aa	mov	x23, x0
   34fcc:	f8 03 01 aa	mov	x24, x1
   34fd0:	e0 03 14 aa	mov	x0, x20
   34fd4:	e3 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   34fd8:	00 00 80 d2	mov	x0, #0x0
   34fdc:	5b 7d 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   34fe0:	fb 03 00 91	mov	x27, sp
   34fe4:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   34fe8:	08 21 40 f9	ldr	x8, [x8, #0x40]
   34fec:	e9 03 08 aa	mov	x9, x8
   34ff0:	90 37 00 90	adrp	x16, 1776 ; 0x724000
   34ff4:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   34ff8:	00 02 3f d6	blr	x16
   34ffc:	e9 03 00 91	mov	x9, sp
   35000:	08 3d 00 91	add	x8, x8, #0xf
   35004:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35008:	34 01 08 cb	sub	x20, x9, x8
   3500c:	9f 02 00 91	mov	sp, x20
   35010:	e8 03 14 aa	mov	x8, x20
   35014:	4a 7d 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   35018:	e0 03 17 aa	mov	x0, x23
   3501c:	e1 03 18 aa	mov	x1, x24
   35020:	e2 03 14 aa	mov	x2, x20
   35024:	43 7d 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   35028:	f5 03 00 aa	mov	x21, x0
   3502c:	f4 03 01 aa	mov	x20, x1
   35030:	e0 03 17 aa	mov	x0, x23
   35034:	e1 03 18 aa	mov	x1, x24
   35038:	98 61 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3503c:	7f 03 00 91	mov	sp, x27
   35040:	54 0a 00 b4	cbz	x20, 0x35188
   35044:	e0 03 1a aa	mov	x0, x26
   35048:	7a 82 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3504c:	e0 03 16 aa	mov	x0, x22
   35050:	63 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   35054:	e0 03 13 aa	mov	x0, x19
   35058:	61 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3505c:	f9 03 15 aa	mov	x25, x21
   35060:	d1 00 00 14	b	0x353a4
   35064:	f3 03 00 aa	mov	x19, x0
   35068:	60 0a 00 b4	cbz	x0, 0x351b4
   3506c:	68 38 00 90	adrp	x8, 1804 ; 0x741000
   35070:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   35074:	b8 81 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   35078:	f4 03 00 aa	mov	x20, x0
   3507c:	68 37 00 f0	adrp	x8, 1775 ; 0x724000
   35080:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   35084:	61 37 00 f0	adrp	x1, 1775 ; 0x724000
   35088:	21 24 41 f9	ldr	x1, [x1, #0x248] ; literal pool symbol address: _$sSSN
   3508c:	63 37 00 f0	adrp	x3, 1775 ; 0x724000
   35090:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   35094:	02 21 00 91	add	x2, x8, #0x8
   35098:	e0 03 13 aa	mov	x0, x19
   3509c:	13 7d 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   350a0:	f5 03 00 aa	mov	x21, x0
   350a4:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   350a8:	a4 03 03 d1	sub	x4, x29, #0xc0
   350ac:	e0 03 14 aa	mov	x0, x20
   350b0:	e2 03 15 aa	mov	x2, x21
   350b4:	03 00 80 d2	mov	x3, #0x0
   350b8:	fa 88 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   350bc:	fd 03 1d aa	mov	x29, x29
   350c0:	ae 81 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   350c4:	f4 03 00 aa	mov	x20, x0
   350c8:	e0 03 15 aa	mov	x0, x21
   350cc:	a5 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   350d0:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   350d4:	a6 81 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   350d8:	54 14 00 b4	cbz	x20, 0x35360
   350dc:	e0 03 14 aa	mov	x0, x20
   350e0:	21 7c 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   350e4:	f5 03 00 aa	mov	x21, x0
   350e8:	f6 03 01 aa	mov	x22, x1
   350ec:	e0 03 14 aa	mov	x0, x20
   350f0:	9c 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   350f4:	00 00 80 d2	mov	x0, #0x0
   350f8:	14 7d 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   350fc:	f7 03 00 91	mov	x23, sp
   35100:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35104:	08 21 40 f9	ldr	x8, [x8, #0x40]
   35108:	e9 03 08 aa	mov	x9, x8
   3510c:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35110:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35114:	00 02 3f d6	blr	x16
   35118:	e9 03 00 91	mov	x9, sp
   3511c:	08 3d 00 91	add	x8, x8, #0xf
   35120:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35124:	34 01 08 cb	sub	x20, x9, x8
   35128:	9f 02 00 91	mov	sp, x20
   3512c:	e8 03 14 aa	mov	x8, x20
   35130:	03 7d 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   35134:	e0 03 15 aa	mov	x0, x21
   35138:	e1 03 16 aa	mov	x1, x22
   3513c:	e2 03 14 aa	mov	x2, x20
   35140:	fc 7c 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   35144:	f9 03 00 aa	mov	x25, x0
   35148:	f4 03 01 aa	mov	x20, x1
   3514c:	e0 03 15 aa	mov	x0, x21
   35150:	e1 03 16 aa	mov	x1, x22
   35154:	51 61 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35158:	ff 02 00 91	mov	sp, x23
   3515c:	74 02 00 b5	cbnz	x20, 0x351a8
   35160:	89 00 00 14	b	0x35384
   35164:	f4 03 00 aa	mov	x20, x0
   35168:	c3 7b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3516c:	f7 03 00 aa	mov	x23, x0
   35170:	e0 03 14 aa	mov	x0, x20
   35174:	7b 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35178:	f5 03 17 aa	mov	x21, x23
   3517c:	60 82 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   35180:	e0 03 17 aa	mov	x0, x23
   35184:	2b 82 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   35188:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   3518c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   35190:	08 81 00 d1	sub	x8, x8, #0x20
   35194:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   35198:	e0 03 1a aa	mov	x0, x26
   3519c:	25 82 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   351a0:	e0 03 16 aa	mov	x0, x22
   351a4:	0e 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   351a8:	e0 03 13 aa	mov	x0, x19
   351ac:	0c 82 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   351b0:	7d 00 00 14	b	0x353a4
   351b4:	d4 f9 ff 97	bl	_$s16AsideNativeSwift22hasAnyInstallArtifactsSbyF
   351b8:	60 11 00 36	tbz	w0, #0x0, 0x353e4
   351bc:	b9 04 80 d2	mov	x25, #0x25
   351c0:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   351c4:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   351c8:	08 81 3b 91	add	x8, x8, #0xee0 ; literal pool for: "Installation metadata missing but secure installation artifacts already exist"
   351cc:	08 81 00 d1	sub	x8, x8, #0x20
   351d0:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   351d4:	60 38 00 90	adrp	x0, 1804 ; 0x741000
   351d8:	00 c0 12 91	add	x0, x0, #0x4b0
   351dc:	a1 27 00 b0	adrp	x1, 1269 ; 0x52a000
   351e0:	21 a0 1c 91	add	x1, x1, #0x728
   351e4:	b2 bc ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   351e8:	01 0a 80 52	mov	w1, #0x50
   351ec:	e2 00 80 52	mov	w2, #0x7
   351f0:	ef 81 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   351f4:	f4 03 00 aa	mov	x20, x0
   351f8:	a8 27 00 b0	adrp	x8, 1269 ; 0x52a000
   351fc:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   35200:	00 04 80 3d	str	q0, [x0, #0x10]
   35204:	a8 4c 8e d2	mov	x8, #0x7265
   35208:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3520c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   35210:	f5 03 00 aa	mov	x21, x0
   35214:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   35218:	76 37 00 f0	adrp	x22, 1775 ; 0x724000
   3521c:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   35220:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   35224:	16 24 00 f9	str	x22, [x0, #0x48]
   35228:	29 a3 00 91	add	x9, x25, #0x28
   3522c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   35230:	13 1c 00 f9	str	x19, [x0, #0x38]
   35234:	38 61 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   35238:	f3 03 00 aa	mov	x19, x0
   3523c:	e0 03 14 aa	mov	x0, x20
   35240:	26 82 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   35244:	61 38 00 90	adrp	x1, 1804 ; 0x741000
   35248:	21 e0 12 91	add	x1, x1, #0x4b8
   3524c:	a2 27 00 b0	adrp	x2, 1269 ; 0x52a000
   35250:	42 c0 1c 91	add	x2, x2, #0x730
   35254:	e0 03 15 aa	mov	x0, x21
   35258:	ee 69 00 94	bl	_$sypSgWOhTm
   3525c:	e0 03 14 aa	mov	x0, x20
   35260:	01 04 80 52	mov	w1, #0x20
   35264:	e2 00 80 52	mov	w2, #0x7
   35268:	e9 81 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3526c:	68 38 00 90	adrp	x8, 1804 ; 0x741000
   35270:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   35274:	38 81 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   35278:	f4 03 00 aa	mov	x20, x0
   3527c:	68 37 00 f0	adrp	x8, 1775 ; 0x724000
   35280:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   35284:	63 37 00 f0	adrp	x3, 1775 ; 0x724000
   35288:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3528c:	02 21 00 91	add	x2, x8, #0x8
   35290:	e0 03 13 aa	mov	x0, x19
   35294:	e1 03 16 aa	mov	x1, x22
   35298:	94 7c 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3529c:	f5 03 00 aa	mov	x21, x0
   352a0:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   352a4:	a4 03 03 d1	sub	x4, x29, #0xc0
   352a8:	e0 03 14 aa	mov	x0, x20
   352ac:	e2 03 15 aa	mov	x2, x21
   352b0:	03 00 80 d2	mov	x3, #0x0
   352b4:	7b 88 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   352b8:	fd 03 1d aa	mov	x29, x29
   352bc:	2f 81 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   352c0:	f4 03 00 aa	mov	x20, x0
   352c4:	e0 03 15 aa	mov	x0, x21
   352c8:	26 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   352cc:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   352d0:	27 81 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   352d4:	54 2f 00 b4	cbz	x20, 0x358bc
   352d8:	e0 03 14 aa	mov	x0, x20
   352dc:	a2 7b 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   352e0:	f6 03 00 aa	mov	x22, x0
   352e4:	f7 03 01 aa	mov	x23, x1
   352e8:	e0 03 14 aa	mov	x0, x20
   352ec:	1d 81 13 94	bl	0x515760 ; symbol stub for: _objc_release
   352f0:	00 00 80 d2	mov	x0, #0x0
   352f4:	95 7c 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   352f8:	f8 03 00 91	mov	x24, sp
   352fc:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35300:	08 21 40 f9	ldr	x8, [x8, #0x40]
   35304:	e9 03 08 aa	mov	x9, x8
   35308:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   3530c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35310:	00 02 3f d6	blr	x16
   35314:	e9 03 00 91	mov	x9, sp
   35318:	08 3d 00 91	add	x8, x8, #0xf
   3531c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35320:	34 01 08 cb	sub	x20, x9, x8
   35324:	9f 02 00 91	mov	sp, x20
   35328:	e8 03 14 aa	mov	x8, x20
   3532c:	84 7c 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   35330:	e0 03 16 aa	mov	x0, x22
   35334:	e1 03 17 aa	mov	x1, x23
   35338:	e2 03 14 aa	mov	x2, x20
   3533c:	7d 7c 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   35340:	f5 03 00 aa	mov	x21, x0
   35344:	f4 03 01 aa	mov	x20, x1
   35348:	e0 03 16 aa	mov	x0, x22
   3534c:	e1 03 17 aa	mov	x1, x23
   35350:	d2 60 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35354:	1f 03 00 91	mov	sp, x24
   35358:	f4 e7 ff b5	cbnz	x20, 0x35054
   3535c:	0c 00 00 14	b	0x3538c
   35360:	f4 03 00 aa	mov	x20, x0
   35364:	44 7b 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   35368:	f6 03 00 aa	mov	x22, x0
   3536c:	e0 03 14 aa	mov	x0, x20
   35370:	fc 80 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35374:	f5 03 16 aa	mov	x21, x22
   35378:	e1 81 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3537c:	e0 03 16 aa	mov	x0, x22
   35380:	ac 81 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   35384:	b9 04 80 d2	mov	x25, #0x25
   35388:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3538c:	e0 03 13 aa	mov	x0, x19
   35390:	93 81 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   35394:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   35398:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3539c:	08 81 00 d1	sub	x8, x8, #0x20
   353a0:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   353a4:	a8 83 59 f8	ldur	x8, [x29, #-0x68]
   353a8:	69 37 00 f0	adrp	x9, 1775 ; 0x724000
   353ac:	29 fd 40 f9	ldr	x9, [x9, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
   353b0:	29 01 40 f9	ldr	x9, [x9]
   353b4:	3f 01 08 eb	cmp	x9, x8
   353b8:	c1 79 02 54	b.ne	0x3a2f0
   353bc:	e0 03 19 aa	mov	x0, x25
   353c0:	e1 03 14 aa	mov	x1, x20
   353c4:	bf 43 01 d1	sub	sp, x29, #0x50
   353c8:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   353cc:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   353d0:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   353d4:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   353d8:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   353dc:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   353e0:	c0 03 5f d6	ret
   353e4:	00 00 80 d2	mov	x0, #0x0
   353e8:	98 7b 13 94	bl	0x514248 ; symbol stub for: _$s9CryptoKit12SymmetricKeyVMa
   353ec:	f6 03 00 aa	mov	x22, x0
   353f0:	f8 03 00 91	mov	x24, sp
   353f4:	1b 80 5f f8	ldur	x27, [x0, #-0x8]
   353f8:	79 23 40 f9	ldr	x25, [x27, #0x40]
   353fc:	e9 03 19 aa	mov	x9, x25
   35400:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35404:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35408:	00 02 3f d6	blr	x16
   3540c:	e8 03 00 91	mov	x8, sp
   35410:	29 3f 00 91	add	x9, x25, #0xf
   35414:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   35418:	1c 01 09 cb	sub	x28, x8, x9
   3541c:	9f 03 00 91	mov	sp, x28
   35420:	00 00 80 d2	mov	x0, #0x0
   35424:	da 7b 13 94	bl	0x51438c ; symbol stub for: _$s9CryptoKit16SymmetricKeySizeVMa
   35428:	f4 03 00 91	mov	x20, sp
   3542c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35430:	08 21 40 f9	ldr	x8, [x8, #0x40]
   35434:	e9 03 08 aa	mov	x9, x8
   35438:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   3543c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35440:	00 02 3f d6	blr	x16
   35444:	e9 03 00 91	mov	x9, sp
   35448:	08 3d 00 91	add	x8, x8, #0xf
   3544c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35450:	33 01 08 cb	sub	x19, x9, x8
   35454:	7f 02 00 91	mov	sp, x19
   35458:	e8 03 13 aa	mov	x8, x19
   3545c:	c9 7b 13 94	bl	0x514380 ; symbol stub for: _$s9CryptoKit16SymmetricKeySizeV7bits256ACvgZ
   35460:	e8 03 1c aa	mov	x8, x28
   35464:	e0 03 13 aa	mov	x0, x19
   35468:	75 7b 13 94	bl	0x51423c ; symbol stub for: _$s9CryptoKit12SymmetricKeyV4sizeAcA0cD4SizeV_tcfC
   3546c:	9f 02 00 91	mov	sp, x20
   35470:	c0 00 00 d0	adrp	x0, 26 ; 0x4f000
   35474:	00 30 2e 91	add	x0, x0, #0xb8c
   35478:	62 37 00 f0	adrp	x2, 1775 ; 0x724000
   3547c:	42 18 40 f9	ldr	x2, [x2, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   35480:	a8 03 03 d1	sub	x8, x29, #0xc0
   35484:	01 00 80 d2	mov	x1, #0x0
   35488:	f4 03 1c aa	mov	x20, x28
   3548c:	f5 03 1a aa	mov	x21, x26
   35490:	68 7b 13 94	bl	0x514230 ; symbol stub for: _$s9CryptoKit12SymmetricKeyV15withUnsafeBytesyxxSWKXEKlF
   35494:	b7 53 74 a9	ldp	x23, x20, [x29, #-0xc0]
   35498:	6f 7b 13 94	bl	0x514254 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO11isAvailableSbvgZ
   3549c:	c0 07 00 36	tbz	w0, #0x0, 0x35594
   354a0:	40 03 80 52	mov	w0, #0x1a
   354a4:	01 00 80 d2	mov	x1, #0x0
   354a8:	02 00 80 d2	mov	x2, #0x0
   354ac:	a8 7c 13 94	bl	0x51474c ; symbol stub for: _$ss26_stdlib_isOSVersionAtLeastyBi1_Bw_BwBwtF
   354b0:	a0 21 00 36	tbz	w0, #0x0, 0x358e4
   354b4:	40 03 80 52	mov	w0, #0x1a
   354b8:	01 00 80 d2	mov	x1, #0x0
   354bc:	02 00 80 d2	mov	x2, #0x0
   354c0:	a3 7c 13 94	bl	0x51474c ; symbol stub for: _$ss26_stdlib_isOSVersionAtLeastyBi1_Bw_BwBwtF
   354c4:	a0 2a 00 36	tbz	w0, #0x0, 0x35a18
   354c8:	53 f8 ff 97	bl	_$s16AsideNativeSwift26createInstallAccessControlSo03SecfG3RefayKF
   354cc:	fa 03 15 aa	mov	x26, x21
   354d0:	15 21 00 b5	cbnz	x21, 0x358f0
   354d4:	a8 63 01 d1	sub	x8, x29, #0x58
   354d8:	18 01 10 f8	stur	x24, [x8, #-0x100]
   354dc:	a8 c3 01 d1	sub	x8, x29, #0x70
   354e0:	1b 01 10 f8	stur	x27, [x8, #-0x100]
   354e4:	a8 a3 02 d1	sub	x8, x29, #0xa8
   354e8:	17 01 10 f8	stur	x23, [x8, #-0x100]
   354ec:	a8 83 01 d1	sub	x8, x29, #0x60
   354f0:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   354f4:	f3 03 00 aa	mov	x19, x0
   354f8:	00 00 80 d2	mov	x0, #0x0
   354fc:	8c 7b 13 94	bl	0x51432c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyVMa
   35500:	fb 03 00 aa	mov	x27, x0
   35504:	fc 03 00 91	mov	x28, sp
   35508:	17 80 5f f8	ldur	x23, [x0, #-0x8]
   3550c:	e8 22 40 f9	ldr	x8, [x23, #0x40]
   35510:	e9 03 08 aa	mov	x9, x8
   35514:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35518:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3551c:	00 02 3f d6	blr	x16
   35520:	e9 03 00 91	mov	x9, sp
   35524:	08 3d 00 91	add	x8, x8, #0xf
   35528:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3552c:	38 01 08 cb	sub	x24, x9, x8
   35530:	1f 03 00 91	mov	sp, x24
   35534:	e0 03 13 aa	mov	x0, x19
   35538:	8d 80 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3553c:	f3 03 00 aa	mov	x19, x0
   35540:	e8 03 18 aa	mov	x8, x24
   35544:	01 00 80 d2	mov	x1, #0x0
   35548:	f5 03 1a aa	mov	x21, x26
   3554c:	6c 7b 13 94	bl	0x5142fc ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV13accessControl21authenticationContextAGSo09SecAccessI3Refa_So9LAContextCSgtKcfC
   35550:	fa 03 15 aa	mov	x26, x21
   35554:	f5 6e 00 b4	cbz	x21, 0x36330
   35558:	a8 c3 01 d1	sub	x8, x29, #0x70
   3555c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35560:	08 05 40 f9	ldr	x8, [x8, #0x8]
   35564:	a9 83 01 d1	sub	x9, x29, #0x60
   35568:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   3556c:	e1 03 16 aa	mov	x1, x22
   35570:	00 01 3f d6	blr	x8
   35574:	a8 a3 02 d1	sub	x8, x29, #0xa8
   35578:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3557c:	e1 03 14 aa	mov	x1, x20
   35580:	46 60 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35584:	e0 03 13 aa	mov	x0, x19
   35588:	76 80 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3558c:	9f 03 00 91	mov	sp, x28
   35590:	a1 04 00 14	b	0x36814
   35594:	a8 c3 01 d1	sub	x8, x29, #0x70
   35598:	1b 01 10 f8	stur	x27, [x8, #-0x100]
   3559c:	a8 43 01 d1	sub	x8, x29, #0x50
   355a0:	14 01 10 f8	stur	x20, [x8, #-0x100]
   355a4:	a8 83 01 d1	sub	x8, x29, #0x60
   355a8:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   355ac:	a8 a3 01 d1	sub	x8, x29, #0x68
   355b0:	16 01 10 f8	stur	x22, [x8, #-0x100]
   355b4:	a8 63 01 d1	sub	x8, x29, #0x58
   355b8:	18 01 10 f8	stur	x24, [x8, #-0x100]
   355bc:	00 00 80 d2	mov	x0, #0x0
   355c0:	a9 7b 13 94	bl	0x514464 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyVMa
   355c4:	e8 03 00 91	mov	x8, sp
   355c8:	a9 e3 01 d1	sub	x9, x29, #0x78
   355cc:	28 01 10 f8	stur	x8, [x9, #-0x100]
   355d0:	a8 23 02 d1	sub	x8, x29, #0x88
   355d4:	00 01 10 f8	stur	x0, [x8, #-0x100]
   355d8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   355dc:	a9 43 02 d1	sub	x9, x29, #0x90
   355e0:	28 01 10 f8	stur	x8, [x9, #-0x100]
   355e4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   355e8:	e9 03 08 aa	mov	x9, x8
   355ec:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   355f0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   355f4:	00 02 3f d6	blr	x16
   355f8:	e9 03 00 91	mov	x9, sp
   355fc:	08 3d 00 91	add	x8, x8, #0xf
   35600:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35604:	3c 01 08 cb	sub	x28, x9, x8
   35608:	9f 03 00 91	mov	sp, x28
   3560c:	e8 03 1c aa	mov	x8, x28
   35610:	20 00 80 52	mov	w0, #0x1
   35614:	8e 7b 13 94	bl	0x51444c ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV20compactRepresentableAGSb_tcfC
   35618:	00 00 80 d2	mov	x0, #0x0
   3561c:	80 7b 13 94	bl	0x51441c ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0VMa
   35620:	e8 03 00 91	mov	x8, sp
   35624:	a9 03 02 d1	sub	x9, x29, #0x80
   35628:	28 01 10 f8	stur	x8, [x9, #-0x100]
   3562c:	a8 63 02 d1	sub	x8, x29, #0x98
   35630:	00 01 10 f8	stur	x0, [x8, #-0x100]
   35634:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35638:	a9 83 02 d1	sub	x9, x29, #0xa0
   3563c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35640:	13 21 40 f9	ldr	x19, [x8, #0x40]
   35644:	e9 03 13 aa	mov	x9, x19
   35648:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   3564c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35650:	00 02 3f d6	blr	x16
   35654:	e8 03 00 91	mov	x8, sp
   35658:	69 3e 00 91	add	x9, x19, #0xf
   3565c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   35660:	18 01 09 cb	sub	x24, x8, x9
   35664:	1f 03 00 91	mov	sp, x24
   35668:	e8 03 18 aa	mov	x8, x24
   3566c:	20 00 80 52	mov	w0, #0x1
   35670:	68 7b 13 94	bl	0x514410 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V20compactRepresentableAGSb_tcfC
   35674:	88 38 00 90	adrp	x8, 1808 ; 0x745000
   35678:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   3567c:	1f 05 00 b1	cmn	x8, #0x1
   35680:	e1 a1 01 54	b.ne	0x38abc
   35684:	68 38 00 f0	adrp	x8, 1807 ; 0x744000
   35688:	08 61 39 91	add	x8, x8, #0xe58
   3568c:	1a 6d 40 a9	ldp	x26, x27, [x8]
   35690:	f4 03 1c aa	mov	x20, x28
   35694:	68 7b 13 94	bl	0x514434 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV17rawRepresentation10Foundation4DataVvg
   35698:	f4 03 00 aa	mov	x20, x0
   3569c:	f6 03 01 aa	mov	x22, x1
   356a0:	e0 03 1a aa	mov	x0, x26
   356a4:	e1 03 1b aa	mov	x1, x27
   356a8:	e2 03 14 aa	mov	x2, x20
   356ac:	e3 03 16 aa	mov	x3, x22
   356b0:	c5 f5 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   356b4:	fa 03 00 aa	mov	x26, x0
   356b8:	e0 03 14 aa	mov	x0, x20
   356bc:	e1 03 16 aa	mov	x1, x22
   356c0:	f6 5f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   356c4:	9a 12 00 36	tbz	w26, #0x0, 0x35914
   356c8:	88 38 00 90	adrp	x8, 1808 ; 0x745000
   356cc:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   356d0:	1f 05 00 b1	cmn	x8, #0x1
   356d4:	a1 d9 01 54	b.ne	0x39208
   356d8:	68 38 00 f0	adrp	x8, 1807 ; 0x744000
   356dc:	08 a1 39 91	add	x8, x8, #0xe68
   356e0:	16 69 40 a9	ldp	x22, x26, [x8]
   356e4:	f4 03 18 aa	mov	x20, x24
   356e8:	44 7b 13 94	bl	0x5143f8 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V17rawRepresentation10Foundation4DataVvg
   356ec:	f4 03 00 aa	mov	x20, x0
   356f0:	fb 03 01 aa	mov	x27, x1
   356f4:	e0 03 16 aa	mov	x0, x22
   356f8:	e1 03 1a aa	mov	x1, x26
   356fc:	e2 03 14 aa	mov	x2, x20
   35700:	e3 03 1b aa	mov	x3, x27
   35704:	b0 f5 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   35708:	f6 03 00 aa	mov	x22, x0
   3570c:	e0 03 14 aa	mov	x0, x20
   35710:	e1 03 1b aa	mov	x1, x27
   35714:	e1 5f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35718:	16 27 00 36	tbz	w22, #0x0, 0x35bf8
   3571c:	a8 83 03 d1	sub	x8, x29, #0xe0
   35720:	19 01 10 f8	stur	x25, [x8, #-0x100]
   35724:	a8 a3 02 d1	sub	x8, x29, #0xa8
   35728:	17 01 10 f8	stur	x23, [x8, #-0x100]
   3572c:	a8 c3 02 d1	sub	x8, x29, #0xb0
   35730:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   35734:	f4 03 18 aa	mov	x20, x24
   35738:	e8 03 00 91	mov	x8, sp
   3573c:	a9 e3 02 d1	sub	x9, x29, #0xb8
   35740:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35744:	e9 03 13 aa	mov	x9, x19
   35748:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   3574c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35750:	00 02 3f d6	blr	x16
   35754:	e8 03 00 91	mov	x8, sp
   35758:	69 3e 00 91	add	x9, x19, #0xf
   3575c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   35760:	1c 01 09 cb	sub	x28, x8, x9
   35764:	9f 03 00 91	mov	sp, x28
   35768:	e8 03 1c aa	mov	x8, x28
   3576c:	20 00 80 52	mov	w0, #0x1
   35770:	28 7b 13 94	bl	0x514410 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V20compactRepresentableAGSb_tcfC
   35774:	00 00 80 d2	mov	x0, #0x0
   35778:	ab 7a 13 94	bl	0x514224 ; symbol stub for: _$s9CryptoKit12SharedSecretVMa
   3577c:	e8 03 00 91	mov	x8, sp
   35780:	a9 03 03 d1	sub	x9, x29, #0xc0
   35784:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35788:	a8 63 03 d1	sub	x8, x29, #0xd8
   3578c:	00 01 10 f8	stur	x0, [x8, #-0x100]
   35790:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35794:	a9 43 03 d1	sub	x9, x29, #0xd0
   35798:	28 01 10 f8	stur	x8, [x9, #-0x100]
   3579c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   357a0:	e9 03 08 aa	mov	x9, x8
   357a4:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   357a8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   357ac:	00 02 3f d6	blr	x16
   357b0:	e9 03 00 91	mov	x9, sp
   357b4:	08 3d 00 91	add	x8, x8, #0xf
   357b8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   357bc:	36 01 08 cb	sub	x22, x9, x8
   357c0:	df 02 00 91	mov	sp, x22
   357c4:	00 00 80 d2	mov	x0, #0x0
   357c8:	03 7b 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   357cc:	f9 03 00 aa	mov	x25, x0
   357d0:	e8 03 00 91	mov	x8, sp
   357d4:	a9 23 03 d1	sub	x9, x29, #0xc8
   357d8:	28 01 10 f8	stur	x8, [x9, #-0x100]
   357dc:	1b 80 5f f8	ldur	x27, [x0, #-0x8]
   357e0:	77 23 40 f9	ldr	x23, [x27, #0x40]
   357e4:	e9 03 17 aa	mov	x9, x23
   357e8:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   357ec:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   357f0:	00 02 3f d6	blr	x16
   357f4:	e8 03 00 91	mov	x8, sp
   357f8:	e9 3e 00 91	add	x9, x23, #0xf
   357fc:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   35800:	13 01 09 cb	sub	x19, x8, x9
   35804:	7f 02 00 91	mov	sp, x19
   35808:	e8 03 13 aa	mov	x8, x19
   3580c:	f8 7a 13 94	bl	0x5143ec ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V06publicD0AE06PublicD0Vvg
   35810:	e8 03 16 aa	mov	x8, x22
   35814:	e0 03 13 aa	mov	x0, x19
   35818:	f4 03 1c aa	mov	x20, x28
   3581c:	f1 7a 13 94	bl	0x5143e0 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V016sharedSecretFromdE04withAA06SharedH0VAE06PublicD0V_tKF
   35820:	fa 03 15 aa	mov	x26, x21
   35824:	95 38 00 b4	cbz	x21, 0x35f34
   35828:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3582c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   35830:	a8 43 01 d1	sub	x8, x29, #0x50
   35834:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   35838:	98 5f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3583c:	68 07 40 f9	ldr	x8, [x27, #0x8]
   35840:	e0 03 13 aa	mov	x0, x19
   35844:	e1 03 19 aa	mov	x1, x25
   35848:	00 01 3f d6	blr	x8
   3584c:	a8 83 02 d1	sub	x8, x29, #0xa0
   35850:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35854:	13 05 40 f9	ldr	x19, [x8, #0x8]
   35858:	e0 03 1c aa	mov	x0, x28
   3585c:	a8 63 02 d1	sub	x8, x29, #0x98
   35860:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   35864:	e1 03 14 aa	mov	x1, x20
   35868:	60 02 3f d6	blr	x19
   3586c:	e0 03 18 aa	mov	x0, x24
   35870:	e1 03 14 aa	mov	x1, x20
   35874:	60 02 3f d6	blr	x19
   35878:	a8 43 02 d1	sub	x8, x29, #0x90
   3587c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35880:	08 05 40 f9	ldr	x8, [x8, #0x8]
   35884:	a9 c3 02 d1	sub	x9, x29, #0xb0
   35888:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   3588c:	a9 23 02 d1	sub	x9, x29, #0x88
   35890:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   35894:	00 01 3f d6	blr	x8
   35898:	a8 c3 01 d1	sub	x8, x29, #0x70
   3589c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   358a0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   358a4:	a9 83 01 d1	sub	x9, x29, #0x60
   358a8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   358ac:	a9 a3 01 d1	sub	x9, x29, #0x68
   358b0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   358b4:	00 01 3f d6	blr	x8
   358b8:	c8 03 00 14	b	0x367d8
   358bc:	f4 03 00 aa	mov	x20, x0
   358c0:	ed 79 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   358c4:	f6 03 00 aa	mov	x22, x0
   358c8:	e0 03 14 aa	mov	x0, x20
   358cc:	a5 7f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   358d0:	f5 03 16 aa	mov	x21, x22
   358d4:	8a 80 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   358d8:	e0 03 16 aa	mov	x0, x22
   358dc:	55 80 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   358e0:	ab fe ff 17	b	0x3538c
   358e4:	4c f7 ff 97	bl	_$s16AsideNativeSwift26createInstallAccessControlSo03SecfG3RefayKF
   358e8:	fa 03 15 aa	mov	x26, x21
   358ec:	75 2c 00 b4	cbz	x21, 0x35e78
   358f0:	68 07 40 f9	ldr	x8, [x27, #0x8]
   358f4:	e0 03 1c aa	mov	x0, x28
   358f8:	e1 03 16 aa	mov	x1, x22
   358fc:	00 01 3f d6	blr	x8
   35900:	e0 03 17 aa	mov	x0, x23
   35904:	e1 03 14 aa	mov	x1, x20
   35908:	64 5f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3590c:	1f 03 00 91	mov	sp, x24
   35910:	49 fd ff 17	b	0x34e34
   35914:	b9 04 80 d2	mov	x25, #0x25
   35918:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3591c:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   35920:	08 c1 38 91	add	x8, x8, #0xe30 ; literal pool for: "Failed to store install signing key"
   35924:	08 81 00 d1	sub	x8, x8, #0x20
   35928:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3592c:	60 38 00 90	adrp	x0, 1804 ; 0x741000
   35930:	00 c0 12 91	add	x0, x0, #0x4b0
   35934:	a1 27 00 b0	adrp	x1, 1269 ; 0x52a000
   35938:	21 a0 1c 91	add	x1, x1, #0x728
   3593c:	dc ba ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   35940:	01 0a 80 52	mov	w1, #0x50
   35944:	e2 00 80 52	mov	w2, #0x7
   35948:	19 80 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3594c:	f4 03 00 aa	mov	x20, x0
   35950:	a8 27 00 b0	adrp	x8, 1269 ; 0x52a000
   35954:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   35958:	00 04 80 3d	str	q0, [x0, #0x10]
   3595c:	a8 4c 8e d2	mov	x8, #0x7265
   35960:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   35964:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   35968:	f5 03 00 aa	mov	x21, x0
   3596c:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   35970:	76 37 00 f0	adrp	x22, 1775 ; 0x724000
   35974:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   35978:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3597c:	16 24 00 f9	str	x22, [x0, #0x48]
   35980:	29 0b 00 d1	sub	x9, x25, #0x2
   35984:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   35988:	13 1c 00 f9	str	x19, [x0, #0x38]
   3598c:	62 5f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   35990:	f3 03 00 aa	mov	x19, x0
   35994:	e0 03 14 aa	mov	x0, x20
   35998:	50 80 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3599c:	61 38 00 90	adrp	x1, 1804 ; 0x741000
   359a0:	21 e0 12 91	add	x1, x1, #0x4b8
   359a4:	a2 27 00 b0	adrp	x2, 1269 ; 0x52a000
   359a8:	42 c0 1c 91	add	x2, x2, #0x730
   359ac:	e0 03 15 aa	mov	x0, x21
   359b0:	18 68 00 94	bl	_$sypSgWOhTm
   359b4:	e0 03 14 aa	mov	x0, x20
   359b8:	01 04 80 52	mov	w1, #0x20
   359bc:	e2 00 80 52	mov	w2, #0x7
   359c0:	13 80 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   359c4:	68 38 00 90	adrp	x8, 1804 ; 0x741000
   359c8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   359cc:	62 7f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   359d0:	f4 03 00 aa	mov	x20, x0
   359d4:	68 37 00 f0	adrp	x8, 1775 ; 0x724000
   359d8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   359dc:	63 37 00 f0	adrp	x3, 1775 ; 0x724000
   359e0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   359e4:	02 21 00 91	add	x2, x8, #0x8
   359e8:	e0 03 13 aa	mov	x0, x19
   359ec:	e1 03 16 aa	mov	x1, x22
   359f0:	be 7a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   359f4:	f5 03 00 aa	mov	x21, x0
   359f8:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   359fc:	a4 03 03 d1	sub	x4, x29, #0xc0
   35a00:	e0 03 14 aa	mov	x0, x20
   35a04:	e2 03 15 aa	mov	x2, x21
   35a08:	03 00 80 d2	mov	x3, #0x0
   35a0c:	a5 86 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   35a10:	fd 03 1d aa	mov	x29, x29
   35a14:	b9 00 00 14	b	0x35cf8
   35a18:	a8 43 01 d1	sub	x8, x29, #0x50
   35a1c:	14 01 10 f8	stur	x20, [x8, #-0x100]
   35a20:	a8 a3 01 d1	sub	x8, x29, #0x68
   35a24:	16 01 10 f8	stur	x22, [x8, #-0x100]
   35a28:	b9 04 80 d2	mov	x25, #0x25
   35a2c:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   35a30:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   35a34:	08 c1 35 91	add	x8, x8, #0xd70 ; literal pool for: "pq_v1 installation requires macOS 26 or newer"
   35a38:	08 81 00 d1	sub	x8, x8, #0x20
   35a3c:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   35a40:	60 38 00 90	adrp	x0, 1804 ; 0x741000
   35a44:	00 c0 12 91	add	x0, x0, #0x4b0
   35a48:	a1 27 00 b0	adrp	x1, 1269 ; 0x52a000
   35a4c:	21 a0 1c 91	add	x1, x1, #0x728
   35a50:	97 ba ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   35a54:	01 0a 80 52	mov	w1, #0x50
   35a58:	e2 00 80 52	mov	w2, #0x7
   35a5c:	d4 7f 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   35a60:	f4 03 00 aa	mov	x20, x0
   35a64:	a8 27 00 b0	adrp	x8, 1269 ; 0x52a000
   35a68:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   35a6c:	00 04 80 3d	str	q0, [x0, #0x10]
   35a70:	a8 4c 8e d2	mov	x8, #0x7265
   35a74:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   35a78:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   35a7c:	f5 03 00 aa	mov	x21, x0
   35a80:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   35a84:	76 37 00 f0	adrp	x22, 1775 ; 0x724000
   35a88:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   35a8c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   35a90:	16 24 00 f9	str	x22, [x0, #0x48]
   35a94:	29 03 7d b2	orr	x9, x25, #0x8
   35a98:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   35a9c:	13 1c 00 f9	str	x19, [x0, #0x38]
   35aa0:	1d 5f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   35aa4:	f3 03 00 aa	mov	x19, x0
   35aa8:	e0 03 14 aa	mov	x0, x20
   35aac:	0b 80 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   35ab0:	61 38 00 90	adrp	x1, 1804 ; 0x741000
   35ab4:	21 e0 12 91	add	x1, x1, #0x4b8
   35ab8:	a2 27 00 b0	adrp	x2, 1269 ; 0x52a000
   35abc:	42 c0 1c 91	add	x2, x2, #0x730
   35ac0:	e0 03 15 aa	mov	x0, x21
   35ac4:	d3 67 00 94	bl	_$sypSgWOhTm
   35ac8:	e0 03 14 aa	mov	x0, x20
   35acc:	01 04 80 52	mov	w1, #0x20
   35ad0:	e2 00 80 52	mov	w2, #0x7
   35ad4:	ce 7f 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   35ad8:	68 38 00 90	adrp	x8, 1804 ; 0x741000
   35adc:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   35ae0:	1d 7f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   35ae4:	f4 03 00 aa	mov	x20, x0
   35ae8:	68 37 00 f0	adrp	x8, 1775 ; 0x724000
   35aec:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   35af0:	63 37 00 f0	adrp	x3, 1775 ; 0x724000
   35af4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   35af8:	02 21 00 91	add	x2, x8, #0x8
   35afc:	e0 03 13 aa	mov	x0, x19
   35b00:	e1 03 16 aa	mov	x1, x22
   35b04:	79 7a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   35b08:	f5 03 00 aa	mov	x21, x0
   35b0c:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   35b10:	a4 03 03 d1	sub	x4, x29, #0xc0
   35b14:	e0 03 14 aa	mov	x0, x20
   35b18:	e2 03 15 aa	mov	x2, x21
   35b1c:	03 00 80 d2	mov	x3, #0x0
   35b20:	60 86 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   35b24:	fd 03 1d aa	mov	x29, x29
   35b28:	14 7f 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   35b2c:	f4 03 00 aa	mov	x20, x0
   35b30:	e0 03 15 aa	mov	x0, x21
   35b34:	0b 7f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35b38:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   35b3c:	0c 7f 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   35b40:	54 35 00 b4	cbz	x20, 0x361e8
   35b44:	e0 03 14 aa	mov	x0, x20
   35b48:	87 79 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   35b4c:	f6 03 00 aa	mov	x22, x0
   35b50:	a8 63 01 d1	sub	x8, x29, #0x58
   35b54:	13 01 10 f8	stur	x19, [x8, #-0x100]
   35b58:	f3 03 1b aa	mov	x19, x27
   35b5c:	fb 03 17 aa	mov	x27, x23
   35b60:	f7 03 01 aa	mov	x23, x1
   35b64:	e0 03 14 aa	mov	x0, x20
   35b68:	fe 7e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35b6c:	00 00 80 d2	mov	x0, #0x0
   35b70:	76 7a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   35b74:	fa 03 18 aa	mov	x26, x24
   35b78:	f8 03 00 91	mov	x24, sp
   35b7c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35b80:	08 21 40 f9	ldr	x8, [x8, #0x40]
   35b84:	e9 03 08 aa	mov	x9, x8
   35b88:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35b8c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35b90:	00 02 3f d6	blr	x16
   35b94:	e9 03 00 91	mov	x9, sp
   35b98:	08 3d 00 91	add	x8, x8, #0xf
   35b9c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35ba0:	34 01 08 cb	sub	x20, x9, x8
   35ba4:	9f 02 00 91	mov	sp, x20
   35ba8:	e8 03 14 aa	mov	x8, x20
   35bac:	64 7a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   35bb0:	e0 03 16 aa	mov	x0, x22
   35bb4:	e1 03 17 aa	mov	x1, x23
   35bb8:	e2 03 14 aa	mov	x2, x20
   35bbc:	5d 7a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   35bc0:	f5 03 00 aa	mov	x21, x0
   35bc4:	f4 03 01 aa	mov	x20, x1
   35bc8:	e0 03 16 aa	mov	x0, x22
   35bcc:	e1 03 17 aa	mov	x1, x23
   35bd0:	f7 03 1b aa	mov	x23, x27
   35bd4:	fb 03 13 aa	mov	x27, x19
   35bd8:	a8 63 01 d1	sub	x8, x29, #0x58
   35bdc:	13 01 50 f8	ldur	x19, [x8, #-0x100]
   35be0:	ae 5e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35be4:	1f 03 00 91	mov	sp, x24
   35be8:	f8 03 1a aa	mov	x24, x26
   35bec:	14 31 00 b4	cbz	x20, 0x3620c
   35bf0:	f9 03 15 aa	mov	x25, x21
   35bf4:	8a 01 00 14	b	0x3621c
   35bf8:	b9 04 80 d2	mov	x25, #0x25
   35bfc:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   35c00:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   35c04:	08 81 39 91	add	x8, x8, #0xe60 ; literal pool for: "Failed to store install key agreement key"
   35c08:	08 81 00 d1	sub	x8, x8, #0x20
   35c0c:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   35c10:	60 38 00 90	adrp	x0, 1804 ; 0x741000
   35c14:	00 c0 12 91	add	x0, x0, #0x4b0
   35c18:	a1 27 00 b0	adrp	x1, 1269 ; 0x52a000
   35c1c:	21 a0 1c 91	add	x1, x1, #0x728
   35c20:	23 ba ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   35c24:	01 0a 80 52	mov	w1, #0x50
   35c28:	e2 00 80 52	mov	w2, #0x7
   35c2c:	60 7f 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   35c30:	f4 03 00 aa	mov	x20, x0
   35c34:	a8 27 00 b0	adrp	x8, 1269 ; 0x52a000
   35c38:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   35c3c:	00 04 80 3d	str	q0, [x0, #0x10]
   35c40:	a8 4c 8e d2	mov	x8, #0x7265
   35c44:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   35c48:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   35c4c:	f5 03 00 aa	mov	x21, x0
   35c50:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   35c54:	76 37 00 f0	adrp	x22, 1775 ; 0x724000
   35c58:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   35c5c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   35c60:	16 24 00 f9	str	x22, [x0, #0x48]
   35c64:	29 13 00 91	add	x9, x25, #0x4
   35c68:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   35c6c:	13 1c 00 f9	str	x19, [x0, #0x38]
   35c70:	a9 5e 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   35c74:	f3 03 00 aa	mov	x19, x0
   35c78:	e0 03 14 aa	mov	x0, x20
   35c7c:	97 7f 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   35c80:	61 38 00 90	adrp	x1, 1804 ; 0x741000
   35c84:	21 e0 12 91	add	x1, x1, #0x4b8
   35c88:	a2 27 00 b0	adrp	x2, 1269 ; 0x52a000
   35c8c:	42 c0 1c 91	add	x2, x2, #0x730
   35c90:	e0 03 15 aa	mov	x0, x21
   35c94:	5f 67 00 94	bl	_$sypSgWOhTm
   35c98:	e0 03 14 aa	mov	x0, x20
   35c9c:	01 04 80 52	mov	w1, #0x20
   35ca0:	e2 00 80 52	mov	w2, #0x7
   35ca4:	5a 7f 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   35ca8:	68 38 00 90	adrp	x8, 1804 ; 0x741000
   35cac:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   35cb0:	a9 7e 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   35cb4:	f4 03 00 aa	mov	x20, x0
   35cb8:	68 37 00 f0	adrp	x8, 1775 ; 0x724000
   35cbc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   35cc0:	63 37 00 f0	adrp	x3, 1775 ; 0x724000
   35cc4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   35cc8:	02 21 00 91	add	x2, x8, #0x8
   35ccc:	e0 03 13 aa	mov	x0, x19
   35cd0:	e1 03 16 aa	mov	x1, x22
   35cd4:	05 7a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   35cd8:	f5 03 00 aa	mov	x21, x0
   35cdc:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   35ce0:	a4 03 03 d1	sub	x4, x29, #0xc0
   35ce4:	e0 03 14 aa	mov	x0, x20
   35ce8:	e2 03 15 aa	mov	x2, x21
   35cec:	03 00 80 d2	mov	x3, #0x0
   35cf0:	ec 85 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   35cf4:	fd 03 1d aa	mov	x29, x29
   35cf8:	a0 7e 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   35cfc:	f4 03 00 aa	mov	x20, x0
   35d00:	e0 03 15 aa	mov	x0, x21
   35d04:	97 7e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35d08:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   35d0c:	98 7e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   35d10:	d4 04 00 b4	cbz	x20, 0x35da8
   35d14:	e0 03 14 aa	mov	x0, x20
   35d18:	13 79 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   35d1c:	f6 03 00 aa	mov	x22, x0
   35d20:	fa 03 01 aa	mov	x26, x1
   35d24:	e0 03 14 aa	mov	x0, x20
   35d28:	8e 7e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35d2c:	00 00 80 d2	mov	x0, #0x0
   35d30:	06 7a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   35d34:	fb 03 00 91	mov	x27, sp
   35d38:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   35d3c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   35d40:	e9 03 08 aa	mov	x9, x8
   35d44:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35d48:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35d4c:	00 02 3f d6	blr	x16
   35d50:	e9 03 00 91	mov	x9, sp
   35d54:	08 3d 00 91	add	x8, x8, #0xf
   35d58:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35d5c:	34 01 08 cb	sub	x20, x9, x8
   35d60:	9f 02 00 91	mov	sp, x20
   35d64:	e8 03 14 aa	mov	x8, x20
   35d68:	f5 79 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   35d6c:	e0 03 16 aa	mov	x0, x22
   35d70:	e1 03 1a aa	mov	x1, x26
   35d74:	e2 03 14 aa	mov	x2, x20
   35d78:	ee 79 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   35d7c:	f5 03 00 aa	mov	x21, x0
   35d80:	f4 03 01 aa	mov	x20, x1
   35d84:	e0 03 16 aa	mov	x0, x22
   35d88:	e1 03 1a aa	mov	x1, x26
   35d8c:	43 5e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35d90:	7f 03 00 91	mov	sp, x27
   35d94:	a8 c3 01 d1	sub	x8, x29, #0x70
   35d98:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   35d9c:	d4 01 00 b4	cbz	x20, 0x35dd4
   35da0:	f9 03 15 aa	mov	x25, x21
   35da4:	10 00 00 14	b	0x35de4
   35da8:	f4 03 00 aa	mov	x20, x0
   35dac:	b2 78 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   35db0:	f6 03 00 aa	mov	x22, x0
   35db4:	e0 03 14 aa	mov	x0, x20
   35db8:	6a 7e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35dbc:	f5 03 16 aa	mov	x21, x22
   35dc0:	4f 7f 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   35dc4:	e0 03 16 aa	mov	x0, x22
   35dc8:	1a 7f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   35dcc:	a8 c3 01 d1	sub	x8, x29, #0x70
   35dd0:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   35dd4:	28 27 00 90	adrp	x8, 1252 ; 0x519000
   35dd8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   35ddc:	08 81 00 d1	sub	x8, x8, #0x20
   35de0:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   35de4:	a8 a3 01 d1	sub	x8, x29, #0x68
   35de8:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   35dec:	e0 03 17 aa	mov	x0, x23
   35df0:	a8 43 01 d1	sub	x8, x29, #0x50
   35df4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   35df8:	28 5e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35dfc:	e0 03 13 aa	mov	x0, x19
   35e00:	f7 7e 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   35e04:	a8 83 02 d1	sub	x8, x29, #0xa0
   35e08:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35e0c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   35e10:	e0 03 18 aa	mov	x0, x24
   35e14:	a9 63 02 d1	sub	x9, x29, #0x98
   35e18:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   35e1c:	00 01 3f d6	blr	x8
   35e20:	a8 43 02 d1	sub	x8, x29, #0x90
   35e24:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35e28:	08 05 40 f9	ldr	x8, [x8, #0x8]
   35e2c:	e0 03 1c aa	mov	x0, x28
   35e30:	a9 23 02 d1	sub	x9, x29, #0x88
   35e34:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   35e38:	00 01 3f d6	blr	x8
   35e3c:	c8 06 40 f9	ldr	x8, [x22, #0x8]
   35e40:	a9 83 01 d1	sub	x9, x29, #0x60
   35e44:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   35e48:	e1 03 15 aa	mov	x1, x21
   35e4c:	00 01 3f d6	blr	x8
   35e50:	a8 03 02 d1	sub	x8, x29, #0x80
   35e54:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35e58:	1f 01 00 91	mov	sp, x8
   35e5c:	a8 e3 01 d1	sub	x8, x29, #0x78
   35e60:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35e64:	1f 01 00 91	mov	sp, x8
   35e68:	a8 63 01 d1	sub	x8, x29, #0x58
   35e6c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35e70:	1f 01 00 91	mov	sp, x8
   35e74:	4c fd ff 17	b	0x353a4
   35e78:	a8 63 01 d1	sub	x8, x29, #0x58
   35e7c:	18 01 10 f8	stur	x24, [x8, #-0x100]
   35e80:	a8 a3 02 d1	sub	x8, x29, #0xa8
   35e84:	17 01 10 f8	stur	x23, [x8, #-0x100]
   35e88:	a8 83 01 d1	sub	x8, x29, #0x60
   35e8c:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   35e90:	f3 03 00 aa	mov	x19, x0
   35e94:	00 00 80 d2	mov	x0, #0x0
   35e98:	13 79 13 94	bl	0x5142e4 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyVMa
   35e9c:	fc 03 00 aa	mov	x28, x0
   35ea0:	e8 03 00 91	mov	x8, sp
   35ea4:	a9 e3 01 d1	sub	x9, x29, #0x78
   35ea8:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35eac:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   35eb0:	08 23 40 f9	ldr	x8, [x24, #0x40]
   35eb4:	e9 03 08 aa	mov	x9, x8
   35eb8:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35ebc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35ec0:	00 02 3f d6	blr	x16
   35ec4:	e9 03 00 91	mov	x9, sp
   35ec8:	08 3d 00 91	add	x8, x8, #0xf
   35ecc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   35ed0:	37 01 08 cb	sub	x23, x9, x8
   35ed4:	ff 02 00 91	mov	sp, x23
   35ed8:	e0 03 13 aa	mov	x0, x19
   35edc:	24 7e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   35ee0:	f3 03 00 aa	mov	x19, x0
   35ee4:	e8 03 17 aa	mov	x8, x23
   35ee8:	20 00 80 52	mov	w0, #0x1
   35eec:	e1 03 13 aa	mov	x1, x19
   35ef0:	02 00 80 d2	mov	x2, #0x0
   35ef4:	f5 03 1a aa	mov	x21, x26
   35ef8:	f5 78 13 94	bl	0x5142cc ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV20compactRepresentable13accessControl21authenticationContextAISb_So09SecAccessL3RefaSo9LAContextCSgtKcfC
   35efc:	fa 03 15 aa	mov	x26, x21
   35f00:	b5 1a 00 b4	cbz	x21, 0x36254
   35f04:	68 07 40 f9	ldr	x8, [x27, #0x8]
   35f08:	a9 83 01 d1	sub	x9, x29, #0x60
   35f0c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   35f10:	e1 03 16 aa	mov	x1, x22
   35f14:	00 01 3f d6	blr	x8
   35f18:	e0 03 13 aa	mov	x0, x19
   35f1c:	11 7e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   35f20:	a8 a3 02 d1	sub	x8, x29, #0xa8
   35f24:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   35f28:	e1 03 14 aa	mov	x1, x20
   35f2c:	db 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   35f30:	36 02 00 14	b	0x36808
   35f34:	a8 23 04 d1	sub	x8, x29, #0x108
   35f38:	17 01 10 f8	stur	x23, [x8, #-0x100]
   35f3c:	a8 a3 03 d1	sub	x8, x29, #0xe8
   35f40:	16 01 10 f8	stur	x22, [x8, #-0x100]
   35f44:	a8 e3 03 d1	sub	x8, x29, #0xf8
   35f48:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   35f4c:	a8 c3 03 d1	sub	x8, x29, #0xf0
   35f50:	18 01 10 f8	stur	x24, [x8, #-0x100]
   35f54:	68 07 40 f9	ldr	x8, [x27, #0x8]
   35f58:	e0 03 13 aa	mov	x0, x19
   35f5c:	a9 03 04 d1	sub	x9, x29, #0x100
   35f60:	39 01 10 f8	stur	x25, [x9, #-0x100]
   35f64:	e1 03 19 aa	mov	x1, x25
   35f68:	a9 43 04 d1	sub	x9, x29, #0x110
   35f6c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35f70:	00 01 3f d6	blr	x8
   35f74:	a8 23 03 d1	sub	x8, x29, #0xc8
   35f78:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   35f7c:	1f 01 00 91	mov	sp, x8
   35f80:	e8 03 00 91	mov	x8, sp
   35f84:	a9 23 03 d1	sub	x9, x29, #0xc8
   35f88:	28 01 10 f8	stur	x8, [x9, #-0x100]
   35f8c:	a8 83 03 d1	sub	x8, x29, #0xe0
   35f90:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   35f94:	e9 03 0c aa	mov	x9, x12
   35f98:	70 37 00 f0	adrp	x16, 1775 ; 0x724000
   35f9c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   35fa0:	00 02 3f d6	blr	x16
   35fa4:	e8 03 00 91	mov	x8, sp
   35fa8:	89 3d 00 91	add	x9, x12, #0xf
   35fac:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   35fb0:	16 01 09 cb	sub	x22, x8, x9
   35fb4:	df 02 00 91	mov	sp, x22
   35fb8:	00 00 80 d2	mov	x0, #0x0
   35fbc:	39 79 13 94	bl	0x5144a0 ; symbol stub for: _$s9CryptoKit6SHA256VMa
   35fc0:	f3 03 00 aa	mov	x19, x0
   35fc4:	a8 27 00 b0	adrp	x8, 1269 ; 0x52a000
   35fc8:	00 b5 c1 3d	ldr	q0, [x8, #0x6d0]
   35fcc:	a8 03 03 d1	sub	x8, x29, #0xc0
   35fd0:	00 01 80 3d	str	q0, [x8]
   35fd4:	88 38 00 90	adrp	x8, 1808 ; 0x745000
   35fd8:	08 05 41 f9	ldr	x8, [x8, #0x208]
   35fdc:	1f 05 00 b1	cmn	x8, #0x1
   35fe0:	c1 e2 01 54	b.ne	0x39c38
   35fe4:	60 38 00 90	adrp	x0, 1804 ; 0x741000
   35fe8:	00 c0 1e 91	add	x0, x0, #0x7b0
   35fec:	61 37 00 f0	adrp	x1, 1775 ; 0x724000
   35ff0:	21 30 40 f9	ldr	x1, [x1, #0x60] ; literal pool symbol address: _$s9CryptoKit6SHA256VMa
   35ff4:	62 37 00 f0	adrp	x2, 1775 ; 0x724000
   35ff8:	42 2c 40 f9	ldr	x2, [x2, #0x58] ; literal pool symbol address: _$s9CryptoKit6SHA256VAA12HashFunctionAAMc
   35ffc:	4f 62 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   36000:	f4 03 00 aa	mov	x20, x0
   36004:	0c 62 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   36008:	f5 03 00 aa	mov	x21, x0
   3600c:	e0 03 bf a9	stp	x0, x0, [sp, #-0x10]!
   36010:	7c 38 00 d0	adrp	x28, 1806 ; 0x744000
   36014:	9c 23 3a 91	add	x28, x28, #0xe88
   36018:	79 37 00 d0	adrp	x25, 1774 ; 0x724000
   3601c:	39 1b 40 f9	ldr	x25, [x25, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   36020:	a1 03 03 d1	sub	x1, x29, #0xc0
   36024:	e8 03 16 aa	mov	x8, x22
   36028:	e0 03 13 aa	mov	x0, x19
   3602c:	e2 03 1c aa	mov	x2, x28
   36030:	03 04 80 52	mov	w3, #0x20
   36034:	e4 03 13 aa	mov	x4, x19
   36038:	e5 03 19 aa	mov	x5, x25
   3603c:	e6 03 19 aa	mov	x6, x25
   36040:	e7 03 14 aa	mov	x7, x20
   36044:	a9 a3 03 d1	sub	x9, x29, #0xe8
   36048:	38 01 50 f8	ldur	x24, [x9, #-0x100]
   3604c:	f4 03 18 aa	mov	x20, x24
   36050:	72 78 13 94	bl	0x514218 ; symbol stub for: _$s9CryptoKit12SharedSecretV23hkdfDerivedSymmetricKey5using4salt10sharedInfo15outputByteCountAA0gH0Vxm_q_q0_SitAA12HashFunctionRz10Foundation12DataProtocolR_AlMR0_r1_lF
   36054:	ff 43 00 91	add	sp, sp, #0x10
   36058:	a0 07 74 a9	ldp	x0, x1, [x29, #-0xc0]
   3605c:	8f 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36060:	a8 a3 02 d1	sub	x8, x29, #0xa8
   36064:	09 01 50 f8	ldur	x9, [x8, #-0x100]
   36068:	a8 43 01 d1	sub	x8, x29, #0x50
   3606c:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   36070:	a9 df 38 a9	stp	x9, x23, [x29, #-0x78]
   36074:	40 38 00 f0	adrp	x0, 1803 ; 0x741000
   36078:	00 60 1e 91	add	x0, x0, #0x798
   3607c:	a1 27 00 90	adrp	x1, 1268 ; 0x52a000
   36080:	21 e0 1d 91	add	x1, x1, #0x778
   36084:	0a b9 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   36088:	e8 03 00 91	mov	x8, sp
   3608c:	a9 83 03 d1	sub	x9, x29, #0xe0
   36090:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36094:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   36098:	09 21 40 f9	ldr	x9, [x8, #0x40]
   3609c:	28 3d 00 91	add	x8, x9, #0xf
   360a0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   360a4:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   360a8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   360ac:	00 02 3f d6	blr	x16
   360b0:	e9 03 00 91	mov	x9, sp
   360b4:	34 01 08 cb	sub	x20, x9, x8
   360b8:	9f 02 00 91	mov	sp, x20
   360bc:	00 00 80 d2	mov	x0, #0x0
   360c0:	47 78 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   360c4:	f3 03 00 aa	mov	x19, x0
   360c8:	1b 80 5f f8	ldur	x27, [x0, #-0x8]
   360cc:	68 1f 40 f9	ldr	x8, [x27, #0x38]
   360d0:	e0 03 14 aa	mov	x0, x20
   360d4:	21 00 80 52	mov	w1, #0x1
   360d8:	22 00 80 52	mov	w2, #0x1
   360dc:	e3 03 13 aa	mov	x3, x19
   360e0:	00 01 3f d6	blr	x8
   360e4:	a0 e3 01 d1	sub	x0, x29, #0x78
   360e8:	e1 03 16 aa	mov	x1, x22
   360ec:	e2 03 14 aa	mov	x2, x20
   360f0:	e3 03 1c aa	mov	x3, x28
   360f4:	e4 03 19 aa	mov	x4, x25
   360f8:	e5 03 19 aa	mov	x5, x25
   360fc:	e6 03 15 aa	mov	x6, x21
   36100:	e7 03 15 aa	mov	x7, x21
   36104:	f5 03 1a aa	mov	x21, x26
   36108:	2c 78 13 94	bl	0x5141b8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4seal_5using5nonce14authenticatingAC9SealedBoxVx_AA12SymmetricKeyVAC5NonceVSgq_tK10Foundation12DataProtocolRzAoPR_r0_lFZ
   3610c:	fa 03 15 aa	mov	x26, x21
   36110:	a8 c3 03 d1	sub	x8, x29, #0xf0
   36114:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   36118:	a8 c3 02 d1	sub	x8, x29, #0xb0
   3611c:	19 01 50 f8	ldur	x25, [x8, #-0x100]
   36120:	95 17 00 b4	cbz	x21, 0x36410
   36124:	41 38 00 f0	adrp	x1, 1803 ; 0x741000
   36128:	21 60 1e 91	add	x1, x1, #0x798
   3612c:	a2 27 00 90	adrp	x2, 1268 ; 0x52a000
   36130:	42 e0 1d 91	add	x2, x2, #0x778
   36134:	e0 03 14 aa	mov	x0, x20
   36138:	36 66 00 94	bl	_$sypSgWOhTm
   3613c:	a8 c3 01 d1	sub	x8, x29, #0x70
   36140:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36144:	13 05 40 f9	ldr	x19, [x8, #0x8]
   36148:	e0 03 16 aa	mov	x0, x22
   3614c:	a8 a3 01 d1	sub	x8, x29, #0x68
   36150:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   36154:	e1 03 15 aa	mov	x1, x21
   36158:	60 02 3f d6	blr	x19
   3615c:	a8 43 03 d1	sub	x8, x29, #0xd0
   36160:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36164:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36168:	e0 03 18 aa	mov	x0, x24
   3616c:	a9 63 03 d1	sub	x9, x29, #0xd8
   36170:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36174:	00 01 3f d6	blr	x8
   36178:	a8 83 02 d1	sub	x8, x29, #0xa0
   3617c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36180:	14 05 40 f9	ldr	x20, [x8, #0x8]
   36184:	a8 e3 03 d1	sub	x8, x29, #0xf8
   36188:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3618c:	a8 63 02 d1	sub	x8, x29, #0x98
   36190:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   36194:	e1 03 16 aa	mov	x1, x22
   36198:	80 02 3f d6	blr	x20
   3619c:	e0 03 1c aa	mov	x0, x28
   361a0:	e1 03 16 aa	mov	x1, x22
   361a4:	80 02 3f d6	blr	x20
   361a8:	a8 43 02 d1	sub	x8, x29, #0x90
   361ac:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   361b0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   361b4:	e0 03 19 aa	mov	x0, x25
   361b8:	a9 23 02 d1	sub	x9, x29, #0x88
   361bc:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   361c0:	00 01 3f d6	blr	x8
   361c4:	a8 83 01 d1	sub	x8, x29, #0x60
   361c8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   361cc:	e1 03 15 aa	mov	x1, x21
   361d0:	60 02 3f d6	blr	x19
   361d4:	a8 a3 02 d1	sub	x8, x29, #0xa8
   361d8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   361dc:	e1 03 17 aa	mov	x1, x23
   361e0:	2e 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   361e4:	7a 01 00 14	b	0x367cc
   361e8:	f4 03 00 aa	mov	x20, x0
   361ec:	a2 77 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   361f0:	f6 03 00 aa	mov	x22, x0
   361f4:	e0 03 14 aa	mov	x0, x20
   361f8:	5a 7d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   361fc:	f5 03 16 aa	mov	x21, x22
   36200:	3f 7e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   36204:	e0 03 16 aa	mov	x0, x22
   36208:	0a 7e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3620c:	08 27 00 f0	adrp	x8, 1251 ; 0x519000
   36210:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   36214:	08 81 00 d1	sub	x8, x8, #0x20
   36218:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3621c:	a8 a3 01 d1	sub	x8, x29, #0x68
   36220:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   36224:	e0 03 17 aa	mov	x0, x23
   36228:	a8 43 01 d1	sub	x8, x29, #0x50
   3622c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36230:	1a 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36234:	e0 03 13 aa	mov	x0, x19
   36238:	e9 7d 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3623c:	68 07 40 f9	ldr	x8, [x27, #0x8]
   36240:	e0 03 1c aa	mov	x0, x28
   36244:	e1 03 15 aa	mov	x1, x21
   36248:	00 01 3f d6	blr	x8
   3624c:	1f 03 00 91	mov	sp, x24
   36250:	55 fc ff 17	b	0x353a4
   36254:	a8 63 02 d1	sub	x8, x29, #0x98
   36258:	18 01 10 f8	stur	x24, [x8, #-0x100]
   3625c:	a8 03 02 d1	sub	x8, x29, #0x80
   36260:	17 01 10 f8	stur	x23, [x8, #-0x100]
   36264:	a8 23 02 d1	sub	x8, x29, #0x88
   36268:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   3626c:	00 00 80 d2	mov	x0, #0x0
   36270:	0b 78 13 94	bl	0x51429c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0VMa
   36274:	fc 03 00 aa	mov	x28, x0
   36278:	e8 03 00 91	mov	x8, sp
   3627c:	a9 43 02 d1	sub	x9, x29, #0x90
   36280:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36284:	17 80 5f f8	ldur	x23, [x0, #-0x8]
   36288:	e8 22 40 f9	ldr	x8, [x23, #0x40]
   3628c:	e9 03 08 aa	mov	x9, x8
   36290:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36294:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36298:	00 02 3f d6	blr	x16
   3629c:	e9 03 00 91	mov	x9, sp
   362a0:	08 3d 00 91	add	x8, x8, #0xf
   362a4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   362a8:	38 01 08 cb	sub	x24, x9, x8
   362ac:	1f 03 00 91	mov	sp, x24
   362b0:	e0 03 13 aa	mov	x0, x19
   362b4:	2e 7d 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   362b8:	f3 03 00 aa	mov	x19, x0
   362bc:	e8 03 18 aa	mov	x8, x24
   362c0:	20 00 80 52	mov	w0, #0x1
   362c4:	e1 03 13 aa	mov	x1, x19
   362c8:	02 00 80 d2	mov	x2, #0x0
   362cc:	f5 03 1a aa	mov	x21, x26
   362d0:	f0 77 13 94	bl	0x514290 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V20compactRepresentable13accessControl21authenticationContextAISb_So09SecAccessL3RefaSo9LAContextCSgtKcfC
   362d4:	fa 03 15 aa	mov	x26, x21
   362d8:	75 2a 00 b4	cbz	x21, 0x36824
   362dc:	a8 a3 02 d1	sub	x8, x29, #0xa8
   362e0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   362e4:	e1 03 14 aa	mov	x1, x20
   362e8:	ec 5c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   362ec:	e0 03 13 aa	mov	x0, x19
   362f0:	1c 7d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   362f4:	a8 63 02 d1	sub	x8, x29, #0x98
   362f8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   362fc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36300:	a9 03 02 d1	sub	x9, x29, #0x80
   36304:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36308:	a9 23 02 d1	sub	x9, x29, #0x88
   3630c:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36310:	00 01 3f d6	blr	x8
   36314:	68 07 40 f9	ldr	x8, [x27, #0x8]
   36318:	a9 83 01 d1	sub	x9, x29, #0x60
   3631c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36320:	e1 03 16 aa	mov	x1, x22
   36324:	00 01 3f d6	blr	x8
   36328:	a8 43 02 d1	sub	x8, x29, #0x90
   3632c:	35 01 00 14	b	0x36800
   36330:	a8 43 02 d1	sub	x8, x29, #0x90
   36334:	1b 01 10 f8	stur	x27, [x8, #-0x100]
   36338:	a8 e3 01 d1	sub	x8, x29, #0x78
   3633c:	18 01 10 f8	stur	x24, [x8, #-0x100]
   36340:	a8 23 02 d1	sub	x8, x29, #0x88
   36344:	17 01 10 f8	stur	x23, [x8, #-0x100]
   36348:	a8 03 02 d1	sub	x8, x29, #0x80
   3634c:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   36350:	00 00 80 d2	mov	x0, #0x0
   36354:	08 78 13 94	bl	0x514374 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyVMa
   36358:	fb 03 00 aa	mov	x27, x0
   3635c:	f8 03 00 91	mov	x24, sp
   36360:	1c 80 5f f8	ldur	x28, [x0, #-0x8]
   36364:	88 23 40 f9	ldr	x8, [x28, #0x40]
   36368:	e9 03 08 aa	mov	x9, x8
   3636c:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36370:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36374:	00 02 3f d6	blr	x16
   36378:	e9 03 00 91	mov	x9, sp
   3637c:	08 3d 00 91	add	x8, x8, #0xf
   36380:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   36384:	37 01 08 cb	sub	x23, x9, x8
   36388:	ff 02 00 91	mov	sp, x23
   3638c:	e0 03 13 aa	mov	x0, x19
   36390:	f7 7c 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   36394:	f3 03 00 aa	mov	x19, x0
   36398:	e8 03 17 aa	mov	x8, x23
   3639c:	01 00 80 d2	mov	x1, #0x0
   363a0:	f5 03 1a aa	mov	x21, x26
   363a4:	eb 77 13 94	bl	0x514350 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV13accessControl21authenticationContextAGSo09SecAccessI3Refa_So9LAContextCSgtKcfC
   363a8:	fa 03 15 aa	mov	x26, x21
   363ac:	95 39 00 b4	cbz	x21, 0x36adc
   363b0:	a8 a3 02 d1	sub	x8, x29, #0xa8
   363b4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   363b8:	e1 03 14 aa	mov	x1, x20
   363bc:	b7 5c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   363c0:	e0 03 13 aa	mov	x0, x19
   363c4:	e7 7c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   363c8:	a8 23 02 d1	sub	x8, x29, #0x88
   363cc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   363d0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   363d4:	a9 e3 01 d1	sub	x9, x29, #0x78
   363d8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   363dc:	a9 43 02 d1	sub	x9, x29, #0x90
   363e0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   363e4:	00 01 3f d6	blr	x8
   363e8:	a8 c3 01 d1	sub	x8, x29, #0x70
   363ec:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   363f0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   363f4:	a9 83 01 d1	sub	x9, x29, #0x60
   363f8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   363fc:	e1 03 16 aa	mov	x1, x22
   36400:	00 01 3f d6	blr	x8
   36404:	1f 03 00 91	mov	sp, x24
   36408:	a8 03 02 d1	sub	x8, x29, #0x80
   3640c:	00 01 00 14	b	0x3680c
   36410:	a8 83 04 d1	sub	x8, x29, #0x120
   36414:	16 01 10 f8	stur	x22, [x8, #-0x100]
   36418:	f9 03 01 aa	mov	x25, x1
   3641c:	41 38 00 f0	adrp	x1, 1803 ; 0x741000
   36420:	21 60 1e 91	add	x1, x1, #0x798
   36424:	a2 27 00 90	adrp	x2, 1268 ; 0x52a000
   36428:	42 e0 1d 91	add	x2, x2, #0x778
   3642c:	fc 03 00 aa	mov	x28, x0
   36430:	e0 03 14 aa	mov	x0, x20
   36434:	77 65 00 94	bl	_$sypSgWOhTm
   36438:	f6 03 00 91	mov	x22, sp
   3643c:	68 23 40 f9	ldr	x8, [x27, #0x40]
   36440:	e9 03 08 aa	mov	x9, x8
   36444:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36448:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3644c:	00 02 3f d6	blr	x16
   36450:	e9 03 00 91	mov	x9, sp
   36454:	08 3d 00 91	add	x8, x8, #0xf
   36458:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3645c:	34 01 08 cb	sub	x20, x9, x8
   36460:	9f 02 00 91	mov	sp, x20
   36464:	e8 03 14 aa	mov	x8, x20
   36468:	e0 03 1c aa	mov	x0, x28
   3646c:	e1 03 19 aa	mov	x1, x25
   36470:	67 77 13 94	bl	0x51420c ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonceAC5NonceVvg
   36474:	c0 00 00 b0	adrp	x0, 25 ; 0x4f000
   36478:	00 80 2e 91	add	x0, x0, #0xba0
   3647c:	a8 83 04 d1	sub	x8, x29, #0x120
   36480:	01 00 80 d2	mov	x1, #0x0
   36484:	78 37 00 d0	adrp	x24, 1774 ; 0x724000
   36488:	18 1b 40 f9	ldr	x24, [x24, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3648c:	e2 03 18 aa	mov	x2, x24
   36490:	f5 03 1a aa	mov	x21, x26
   36494:	4c 77 13 94	bl	0x5141c4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV15withUnsafeBytesyxxSWKXEKlF
   36498:	68 07 40 f9	ldr	x8, [x27, #0x8]
   3649c:	e0 03 14 aa	mov	x0, x20
   364a0:	e1 03 13 aa	mov	x1, x19
   364a4:	00 01 3f d6	blr	x8
   364a8:	df 02 00 91	mov	sp, x22
   364ac:	a8 83 00 d1	sub	x8, x29, #0x20
   364b0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   364b4:	a9 63 04 d1	sub	x9, x29, #0x118
   364b8:	28 01 10 f8	stur	x8, [x9, #-0x100]
   364bc:	a8 63 00 d1	sub	x8, x29, #0x18
   364c0:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   364c4:	e0 03 1c aa	mov	x0, x28
   364c8:	e1 03 19 aa	mov	x1, x25
   364cc:	47 77 13 94	bl	0x5141e8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV10ciphertext10Foundation4DataVvg
   364d0:	f3 03 00 aa	mov	x19, x0
   364d4:	f4 03 01 aa	mov	x20, x1
   364d8:	a8 c3 04 d1	sub	x8, x29, #0x130
   364dc:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   364e0:	e0 03 1c aa	mov	x0, x28
   364e4:	a8 a3 04 d1	sub	x8, x29, #0x128
   364e8:	19 01 10 f8	stur	x25, [x8, #-0x100]
   364ec:	e1 03 19 aa	mov	x1, x25
   364f0:	41 77 13 94	bl	0x5141f4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV3tag10Foundation4DataVvg
   364f4:	f6 03 00 aa	mov	x22, x0
   364f8:	fa 03 01 aa	mov	x26, x1
   364fc:	b3 53 33 a9	stp	x19, x20, [x29, #-0xd0]
   36500:	68 37 00 d0	adrp	x8, 1774 ; 0x724000
   36504:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   36508:	a9 23 00 d1	sub	x9, x29, #0x8
   3650c:	38 01 10 f8	stur	x24, [x9, #-0x100]
   36510:	a8 03 10 f8	stur	x8, [x29, #-0x100]
   36514:	a8 83 00 d1	sub	x8, x29, #0x20
   36518:	00 01 10 f8	stur	x0, [x8, #-0x100]
   3651c:	a8 63 00 d1	sub	x8, x29, #0x18
   36520:	01 01 10 f8	stur	x1, [x8, #-0x100]
   36524:	a0 83 04 d1	sub	x0, x29, #0x120
   36528:	e1 03 18 aa	mov	x1, x24
   3652c:	48 5d 00 94	bl	___swift_project_boxed_opaque_existential_1
   36530:	19 6c 40 a9	ldp	x25, x27, [x0]
   36534:	e0 03 13 aa	mov	x0, x19
   36538:	e1 03 14 aa	mov	x1, x20
   3653c:	24 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   36540:	e0 03 16 aa	mov	x0, x22
   36544:	e1 03 1a aa	mov	x1, x26
   36548:	21 5d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   3654c:	a2 43 03 d1	sub	x2, x29, #0xd0
   36550:	e0 03 19 aa	mov	x0, x25
   36554:	e1 03 1b aa	mov	x1, x27
   36558:	7c 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationO15withUnsafeBytesyxxSWKXEKlFyt_Tg5015$s10Foundation4B57V6append10contentsOfyx_tSTRzs5UInt8V7ElementRtzlFySWXEfU_ACTf1ncn_n
   3655c:	e0 03 16 aa	mov	x0, x22
   36560:	e1 03 1a aa	mov	x1, x26
   36564:	4d 5c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36568:	e0 03 13 aa	mov	x0, x19
   3656c:	e1 03 14 aa	mov	x1, x20
   36570:	4a 5c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36574:	a0 83 04 d1	sub	x0, x29, #0x120
   36578:	bf 60 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   3657c:	fa 03 00 91	mov	x26, sp
   36580:	bc 6f 73 a9	ldp	x28, x27, [x29, #-0xd0]
   36584:	a8 23 04 d1	sub	x8, x29, #0x108
   36588:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   3658c:	e9 03 0c aa	mov	x9, x12
   36590:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36594:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36598:	00 02 3f d6	blr	x16
   3659c:	e8 03 00 91	mov	x8, sp
   365a0:	89 3d 00 91	add	x9, x12, #0xf
   365a4:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   365a8:	13 01 09 cb	sub	x19, x8, x9
   365ac:	7f 02 00 91	mov	sp, x19
   365b0:	e8 03 13 aa	mov	x8, x19
   365b4:	a9 e3 03 d1	sub	x9, x29, #0xf8
   365b8:	38 01 50 f8	ldur	x24, [x9, #-0x100]
   365bc:	f4 03 18 aa	mov	x20, x24
   365c0:	8b 77 13 94	bl	0x5143ec ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V06publicD0AE06PublicD0Vvg
   365c4:	f4 03 13 aa	mov	x20, x19
   365c8:	7d 77 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   365cc:	f4 03 00 aa	mov	x20, x0
   365d0:	f6 03 01 aa	mov	x22, x1
   365d4:	e0 03 13 aa	mov	x0, x19
   365d8:	a8 03 04 d1	sub	x8, x29, #0x100
   365dc:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   365e0:	a8 43 04 d1	sub	x8, x29, #0x110
   365e4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   365e8:	00 01 3f d6	blr	x8
   365ec:	00 00 80 d2	mov	x0, #0x0
   365f0:	e1 03 14 aa	mov	x1, x20
   365f4:	e2 03 16 aa	mov	x2, x22
   365f8:	d8 76 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   365fc:	f3 03 00 aa	mov	x19, x0
   36600:	f9 03 01 aa	mov	x25, x1
   36604:	e0 03 14 aa	mov	x0, x20
   36608:	e1 03 16 aa	mov	x1, x22
   3660c:	23 5c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36610:	5f 03 00 91	mov	sp, x26
   36614:	00 00 80 d2	mov	x0, #0x0
   36618:	a8 63 04 d1	sub	x8, x29, #0x118
   3661c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36620:	a8 e3 04 d1	sub	x8, x29, #0x138
   36624:	17 01 10 f8	stur	x23, [x8, #-0x100]
   36628:	e2 03 17 aa	mov	x2, x23
   3662c:	cb 76 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   36630:	f4 03 00 aa	mov	x20, x0
   36634:	f6 03 01 aa	mov	x22, x1
   36638:	00 00 80 d2	mov	x0, #0x0
   3663c:	e1 03 1c aa	mov	x1, x28
   36640:	e2 03 1b aa	mov	x2, x27
   36644:	c5 76 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   36648:	bf 03 14 38	sturb	wzr, [x29, #-0xc0]
   3664c:	88 6c 8d 52	mov	w8, #0x6b64
   36650:	09 40 fc d2	mov	x9, #-0x1e00000000000000
   36654:	a8 a7 34 a9	stp	x8, x9, [x29, #-0xb8]
   36658:	b3 e7 35 a9	stp	x19, x25, [x29, #-0xa8]
   3665c:	b4 db 36 a9	stp	x20, x22, [x29, #-0x98]
   36660:	a0 87 37 a9	stp	x0, x1, [x29, #-0x88]
   36664:	00 00 80 d2	mov	x0, #0x0
   36668:	68 76 13 94	bl	0x514008 ; symbol stub for: _$s10Foundation11JSONEncoderCMa
   3666c:	f9 03 00 aa	mov	x25, x0
   36670:	01 30 40 b9	ldr	w1, [x0, #0x30]
   36674:	02 68 40 79	ldrh	w2, [x0, #0x34]
   36678:	cd 7c 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3667c:	f4 03 00 aa	mov	x20, x0
   36680:	5f 76 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   36684:	f4 03 00 aa	mov	x20, x0
   36688:	a9 03 03 d1	sub	x9, x29, #0xc0
   3668c:	20 05 41 ad	ldp	q0, q1, [x9, #0x20]
   36690:	a0 07 38 ad	stp	q0, q1, [x29, #-0x100]
   36694:	a8 03 58 f8	ldur	x8, [x29, #-0x80]
   36698:	a8 03 12 f8	stur	x8, [x29, #-0xe0]
   3669c:	21 01 40 ad	ldp	q1, q0, [x9]
   366a0:	a8 43 00 d1	sub	x8, x29, #0x10
   366a4:	00 01 90 3c	stur	q0, [x8, #-0x100]
   366a8:	a8 83 00 d1	sub	x8, x29, #0x20
   366ac:	01 01 90 3c	stur	q1, [x8, #-0x100]
   366b0:	b2 60 00 94	bl	_$s16AsideNativeSwift13WrappedDkP256VACSEAAWl
   366b4:	e2 03 00 aa	mov	x2, x0
   366b8:	61 37 00 d0	adrp	x1, 1774 ; 0x724000
   366bc:	21 60 31 91	add	x1, x1, #0xc58
   366c0:	a0 83 04 d1	sub	x0, x29, #0x120
   366c4:	4b 76 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   366c8:	fa 03 15 aa	mov	x26, x21
   366cc:	d5 32 00 b4	cbz	x21, 0x36d24
   366d0:	a8 a3 02 d1	sub	x8, x29, #0xa8
   366d4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   366d8:	a8 43 01 d1	sub	x8, x29, #0x50
   366dc:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   366e0:	ee 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   366e4:	e0 03 14 aa	mov	x0, x20
   366e8:	f3 7c 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   366ec:	e0 03 1c aa	mov	x0, x28
   366f0:	e1 03 1b aa	mov	x1, x27
   366f4:	e9 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   366f8:	a8 63 04 d1	sub	x8, x29, #0x118
   366fc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36700:	a8 e3 04 d1	sub	x8, x29, #0x138
   36704:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36708:	e4 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3670c:	a8 c3 04 d1	sub	x8, x29, #0x130
   36710:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36714:	a8 a3 04 d1	sub	x8, x29, #0x128
   36718:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3671c:	df 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36720:	a8 c3 01 d1	sub	x8, x29, #0x70
   36724:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36728:	13 05 40 f9	ldr	x19, [x8, #0x8]
   3672c:	a8 83 04 d1	sub	x8, x29, #0x120
   36730:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36734:	a8 a3 01 d1	sub	x8, x29, #0x68
   36738:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   3673c:	e1 03 15 aa	mov	x1, x21
   36740:	60 02 3f d6	blr	x19
   36744:	a8 43 03 d1	sub	x8, x29, #0xd0
   36748:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3674c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36750:	a9 a3 03 d1	sub	x9, x29, #0xe8
   36754:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36758:	a9 63 03 d1	sub	x9, x29, #0xd8
   3675c:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36760:	00 01 3f d6	blr	x8
   36764:	a8 83 02 d1	sub	x8, x29, #0xa0
   36768:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3676c:	14 05 40 f9	ldr	x20, [x8, #0x8]
   36770:	e0 03 18 aa	mov	x0, x24
   36774:	a8 63 02 d1	sub	x8, x29, #0x98
   36778:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   3677c:	e1 03 16 aa	mov	x1, x22
   36780:	80 02 3f d6	blr	x20
   36784:	a8 c3 03 d1	sub	x8, x29, #0xf0
   36788:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3678c:	e1 03 16 aa	mov	x1, x22
   36790:	80 02 3f d6	blr	x20
   36794:	a8 43 02 d1	sub	x8, x29, #0x90
   36798:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3679c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   367a0:	a9 c3 02 d1	sub	x9, x29, #0xb0
   367a4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   367a8:	a9 23 02 d1	sub	x9, x29, #0x88
   367ac:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   367b0:	00 01 3f d6	blr	x8
   367b4:	a8 83 01 d1	sub	x8, x29, #0x60
   367b8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   367bc:	e1 03 15 aa	mov	x1, x21
   367c0:	60 02 3f d6	blr	x19
   367c4:	a0 03 03 d1	sub	x0, x29, #0xc0
   367c8:	43 60 00 94	bl	0x4e8d4
   367cc:	a8 83 03 d1	sub	x8, x29, #0xe0
   367d0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   367d4:	1f 01 00 91	mov	sp, x8
   367d8:	a8 23 03 d1	sub	x8, x29, #0xc8
   367dc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   367e0:	1f 01 00 91	mov	sp, x8
   367e4:	a8 03 03 d1	sub	x8, x29, #0xc0
   367e8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   367ec:	1f 01 00 91	mov	sp, x8
   367f0:	a8 e3 02 d1	sub	x8, x29, #0xb8
   367f4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   367f8:	1f 01 00 91	mov	sp, x8
   367fc:	a8 03 02 d1	sub	x8, x29, #0x80
   36800:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36804:	1f 01 00 91	mov	sp, x8
   36808:	a8 e3 01 d1	sub	x8, x29, #0x78
   3680c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36810:	1f 01 00 91	mov	sp, x8
   36814:	a8 63 01 d1	sub	x8, x29, #0x58
   36818:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3681c:	1f 01 00 91	mov	sp, x8
   36820:	85 f9 ff 17	b	0x34e34
   36824:	a8 c3 02 d1	sub	x8, x29, #0xb0
   36828:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   3682c:	a8 03 03 d1	sub	x8, x29, #0xc0
   36830:	13 01 10 f8	stur	x19, [x8, #-0x100]
   36834:	a8 e3 02 d1	sub	x8, x29, #0xb8
   36838:	17 01 10 f8	stur	x23, [x8, #-0x100]
   3683c:	a8 83 02 d1	sub	x8, x29, #0xa0
   36840:	18 01 10 f8	stur	x24, [x8, #-0x100]
   36844:	a8 43 01 d1	sub	x8, x29, #0x50
   36848:	14 01 10 f8	stur	x20, [x8, #-0x100]
   3684c:	68 38 00 f0	adrp	x8, 1807 ; 0x745000
   36850:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   36854:	1f 05 00 b1	cmn	x8, #0x1
   36858:	a1 e2 01 54	b.ne	0x3a4ac
   3685c:	68 38 00 d0	adrp	x8, 1806 ; 0x744000
   36860:	08 61 39 91	add	x8, x8, #0xe58
   36864:	13 55 40 a9	ldp	x19, x21, [x8]
   36868:	a8 03 02 d1	sub	x8, x29, #0x80
   3686c:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   36870:	91 76 13 94	bl	0x5142b4 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV18dataRepresentation10Foundation4DataVvg
   36874:	f4 03 00 aa	mov	x20, x0
   36878:	f8 03 01 aa	mov	x24, x1
   3687c:	e0 03 13 aa	mov	x0, x19
   36880:	e1 03 15 aa	mov	x1, x21
   36884:	e2 03 14 aa	mov	x2, x20
   36888:	e3 03 18 aa	mov	x3, x24
   3688c:	4e f1 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   36890:	f3 03 00 aa	mov	x19, x0
   36894:	e0 03 14 aa	mov	x0, x20
   36898:	e1 03 18 aa	mov	x1, x24
   3689c:	7f 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   368a0:	a8 23 02 d1	sub	x8, x29, #0x88
   368a4:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   368a8:	b3 32 00 36	tbz	w19, #0x0, 0x36efc
   368ac:	68 38 00 f0	adrp	x8, 1807 ; 0x745000
   368b0:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   368b4:	1f 05 00 b1	cmn	x8, #0x1
   368b8:	a8 c3 02 d1	sub	x8, x29, #0xb0
   368bc:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   368c0:	c1 eb 01 54	b.ne	0x3a638
   368c4:	68 38 00 d0	adrp	x8, 1806 ; 0x744000
   368c8:	08 a1 39 91	add	x8, x8, #0xe68
   368cc:	13 55 40 a9	ldp	x19, x21, [x8]
   368d0:	a8 83 02 d1	sub	x8, x29, #0xa0
   368d4:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   368d8:	68 76 13 94	bl	0x514278 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V18dataRepresentation10Foundation4DataVvg
   368dc:	f4 03 00 aa	mov	x20, x0
   368e0:	f8 03 01 aa	mov	x24, x1
   368e4:	e0 03 13 aa	mov	x0, x19
   368e8:	e1 03 15 aa	mov	x1, x21
   368ec:	e2 03 14 aa	mov	x2, x20
   368f0:	e3 03 18 aa	mov	x3, x24
   368f4:	34 f1 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   368f8:	f3 03 00 aa	mov	x19, x0
   368fc:	e0 03 14 aa	mov	x0, x20
   36900:	e1 03 18 aa	mov	x1, x24
   36904:	65 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36908:	b3 3e 00 36	tbz	w19, #0x0, 0x370dc
   3690c:	00 00 80 d2	mov	x0, #0x0
   36910:	c3 76 13 94	bl	0x51441c ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0VMa
   36914:	e8 03 00 91	mov	x8, sp
   36918:	a9 43 03 d1	sub	x9, x29, #0xd0
   3691c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36920:	a8 63 03 d1	sub	x8, x29, #0xd8
   36924:	00 01 10 f8	stur	x0, [x8, #-0x100]
   36928:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3692c:	a9 83 03 d1	sub	x9, x29, #0xe0
   36930:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36934:	08 21 40 f9	ldr	x8, [x8, #0x40]
   36938:	e9 03 08 aa	mov	x9, x8
   3693c:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36940:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36944:	00 02 3f d6	blr	x16
   36948:	e9 03 00 91	mov	x9, sp
   3694c:	08 3d 00 91	add	x8, x8, #0xf
   36950:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   36954:	3c 01 08 cb	sub	x28, x9, x8
   36958:	9f 03 00 91	mov	sp, x28
   3695c:	e8 03 1c aa	mov	x8, x28
   36960:	20 00 80 52	mov	w0, #0x1
   36964:	ab 76 13 94	bl	0x514410 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V20compactRepresentableAGSb_tcfC
   36968:	00 00 80 d2	mov	x0, #0x0
   3696c:	2e 76 13 94	bl	0x514224 ; symbol stub for: _$s9CryptoKit12SharedSecretVMa
   36970:	e8 03 00 91	mov	x8, sp
   36974:	a9 23 03 d1	sub	x9, x29, #0xc8
   36978:	28 01 10 f8	stur	x8, [x9, #-0x100]
   3697c:	a8 e3 03 d1	sub	x8, x29, #0xf8
   36980:	00 01 10 f8	stur	x0, [x8, #-0x100]
   36984:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   36988:	a9 03 04 d1	sub	x9, x29, #0x100
   3698c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36990:	08 21 40 f9	ldr	x8, [x8, #0x40]
   36994:	e9 03 08 aa	mov	x9, x8
   36998:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   3699c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   369a0:	00 02 3f d6	blr	x16
   369a4:	e9 03 00 91	mov	x9, sp
   369a8:	08 3d 00 91	add	x8, x8, #0xf
   369ac:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   369b0:	35 01 08 cb	sub	x21, x9, x8
   369b4:	bf 02 00 91	mov	sp, x21
   369b8:	00 00 80 d2	mov	x0, #0x0
   369bc:	86 76 13 94	bl	0x5143d4 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0VMa
   369c0:	f7 03 00 aa	mov	x23, x0
   369c4:	e8 03 00 91	mov	x8, sp
   369c8:	a9 a3 03 d1	sub	x9, x29, #0xe8
   369cc:	28 01 10 f8	stur	x8, [x9, #-0x100]
   369d0:	18 80 5f f8	ldur	x24, [x0, #-0x8]
   369d4:	0c 23 40 f9	ldr	x12, [x24, #0x40]
   369d8:	e9 03 0c aa	mov	x9, x12
   369dc:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   369e0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   369e4:	00 02 3f d6	blr	x16
   369e8:	e8 03 00 91	mov	x8, sp
   369ec:	a9 23 04 d1	sub	x9, x29, #0x108
   369f0:	2c 01 10 f8	stur	x12, [x9, #-0x100]
   369f4:	89 3d 00 91	add	x9, x12, #0xf
   369f8:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   369fc:	13 01 09 cb	sub	x19, x8, x9
   36a00:	7f 02 00 91	mov	sp, x19
   36a04:	e8 03 13 aa	mov	x8, x19
   36a08:	a9 83 02 d1	sub	x9, x29, #0xa0
   36a0c:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   36a10:	17 76 13 94	bl	0x51426c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V06publicF0AaDOAFO06PublicF0Vvg
   36a14:	a8 c3 03 d1	sub	x8, x29, #0xf0
   36a18:	15 01 10 f8	stur	x21, [x8, #-0x100]
   36a1c:	e8 03 15 aa	mov	x8, x21
   36a20:	e0 03 13 aa	mov	x0, x19
   36a24:	f4 03 1c aa	mov	x20, x28
   36a28:	f5 03 1a aa	mov	x21, x26
   36a2c:	6d 76 13 94	bl	0x5143e0 ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V016sharedSecretFromdE04withAA06SharedH0VAE06PublicD0V_tKF
   36a30:	fa 03 15 aa	mov	x26, x21
   36a34:	75 72 00 b4	cbz	x21, 0x37880
   36a38:	a8 a3 02 d1	sub	x8, x29, #0xa8
   36a3c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36a40:	a8 43 01 d1	sub	x8, x29, #0x50
   36a44:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36a48:	14 5b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36a4c:	a8 03 03 d1	sub	x8, x29, #0xc0
   36a50:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36a54:	43 7b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   36a58:	08 07 40 f9	ldr	x8, [x24, #0x8]
   36a5c:	e0 03 13 aa	mov	x0, x19
   36a60:	e1 03 17 aa	mov	x1, x23
   36a64:	00 01 3f d6	blr	x8
   36a68:	a8 83 03 d1	sub	x8, x29, #0xe0
   36a6c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36a70:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36a74:	e0 03 1c aa	mov	x0, x28
   36a78:	a9 63 03 d1	sub	x9, x29, #0xd8
   36a7c:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36a80:	00 01 3f d6	blr	x8
   36a84:	a8 e3 02 d1	sub	x8, x29, #0xb8
   36a88:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36a8c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36a90:	a9 83 02 d1	sub	x9, x29, #0xa0
   36a94:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36a98:	a9 c3 02 d1	sub	x9, x29, #0xb0
   36a9c:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36aa0:	00 01 3f d6	blr	x8
   36aa4:	a8 63 02 d1	sub	x8, x29, #0x98
   36aa8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36aac:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36ab0:	a9 03 02 d1	sub	x9, x29, #0x80
   36ab4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36ab8:	a9 23 02 d1	sub	x9, x29, #0x88
   36abc:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36ac0:	00 01 3f d6	blr	x8
   36ac4:	68 07 40 f9	ldr	x8, [x27, #0x8]
   36ac8:	a9 83 01 d1	sub	x9, x29, #0x60
   36acc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36ad0:	e1 03 16 aa	mov	x1, x22
   36ad4:	00 01 3f d6	blr	x8
   36ad8:	ef 07 00 14	b	0x38a94
   36adc:	a8 83 02 d1	sub	x8, x29, #0xa0
   36ae0:	18 01 10 f8	stur	x24, [x8, #-0x100]
   36ae4:	a8 e3 02 d1	sub	x8, x29, #0xb8
   36ae8:	13 01 10 f8	stur	x19, [x8, #-0x100]
   36aec:	a8 c3 02 d1	sub	x8, x29, #0xb0
   36af0:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   36af4:	a8 63 02 d1	sub	x8, x29, #0x98
   36af8:	17 01 10 f8	stur	x23, [x8, #-0x100]
   36afc:	a8 43 01 d1	sub	x8, x29, #0x50
   36b00:	14 01 10 f8	stur	x20, [x8, #-0x100]
   36b04:	a8 a3 01 d1	sub	x8, x29, #0x68
   36b08:	16 01 10 f8	stur	x22, [x8, #-0x100]
   36b0c:	68 38 00 f0	adrp	x8, 1807 ; 0x745000
   36b10:	08 f9 40 f9	ldr	x8, [x8, #0x1f0]
   36b14:	1f 05 00 b1	cmn	x8, #0x1
   36b18:	a8 e3 01 d1	sub	x8, x29, #0x78
   36b1c:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   36b20:	81 d9 01 54	b.ne	0x3a650
   36b24:	68 38 00 d0	adrp	x8, 1806 ; 0x744000
   36b28:	08 61 39 91	add	x8, x8, #0xe58
   36b2c:	13 55 40 a9	ldp	x19, x21, [x8]
   36b30:	f4 03 17 aa	mov	x20, x23
   36b34:	f5 75 13 94	bl	0x514308 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV18dataRepresentation10Foundation4DataVvg
   36b38:	f4 03 00 aa	mov	x20, x0
   36b3c:	f6 03 01 aa	mov	x22, x1
   36b40:	e0 03 13 aa	mov	x0, x19
   36b44:	e1 03 15 aa	mov	x1, x21
   36b48:	e2 03 14 aa	mov	x2, x20
   36b4c:	e3 03 16 aa	mov	x3, x22
   36b50:	9d f0 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   36b54:	f3 03 00 aa	mov	x19, x0
   36b58:	e0 03 14 aa	mov	x0, x20
   36b5c:	e1 03 16 aa	mov	x1, x22
   36b60:	ce 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36b64:	a8 83 02 d1	sub	x8, x29, #0xa0
   36b68:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   36b6c:	f8 03 1b aa	mov	x24, x27
   36b70:	13 39 00 36	tbz	w19, #0x0, 0x37290
   36b74:	68 38 00 f0	adrp	x8, 1807 ; 0x745000
   36b78:	08 fd 40 f9	ldr	x8, [x8, #0x1f8]
   36b7c:	1f 05 00 b1	cmn	x8, #0x1
   36b80:	a1 e3 01 54	b.ne	0x3a7f4
   36b84:	68 38 00 d0	adrp	x8, 1806 ; 0x744000
   36b88:	08 a1 39 91	add	x8, x8, #0xe68
   36b8c:	13 55 40 a9	ldp	x19, x21, [x8]
   36b90:	a8 63 02 d1	sub	x8, x29, #0x98
   36b94:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   36b98:	f1 75 13 94	bl	0x51435c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV18dataRepresentation10Foundation4DataVvg
   36b9c:	f4 03 00 aa	mov	x20, x0
   36ba0:	f6 03 01 aa	mov	x22, x1
   36ba4:	e0 03 13 aa	mov	x0, x19
   36ba8:	e1 03 15 aa	mov	x1, x21
   36bac:	e2 03 14 aa	mov	x2, x20
   36bb0:	e3 03 16 aa	mov	x3, x22
   36bb4:	84 f0 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   36bb8:	f3 03 00 aa	mov	x19, x0
   36bbc:	e0 03 14 aa	mov	x0, x20
   36bc0:	e1 03 16 aa	mov	x1, x22
   36bc4:	b5 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36bc8:	33 58 00 36	tbz	w19, #0x0, 0x376cc
   36bcc:	00 00 80 d2	mov	x0, #0x0
   36bd0:	f8 75 13 94	bl	0x5143b0 ; symbol stub for: _$s9CryptoKit3KEMO19EncapsulationResultVMa
   36bd4:	e8 03 00 91	mov	x8, sp
   36bd8:	a9 23 03 d1	sub	x9, x29, #0xc8
   36bdc:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36be0:	a8 63 03 d1	sub	x8, x29, #0xd8
   36be4:	00 01 10 f8	stur	x0, [x8, #-0x100]
   36be8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   36bec:	a9 83 03 d1	sub	x9, x29, #0xe0
   36bf0:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36bf4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   36bf8:	e9 03 08 aa	mov	x9, x8
   36bfc:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36c00:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36c04:	00 02 3f d6	blr	x16
   36c08:	e9 03 00 91	mov	x9, sp
   36c0c:	08 3d 00 91	add	x8, x8, #0xf
   36c10:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   36c14:	35 01 08 cb	sub	x21, x9, x8
   36c18:	bf 02 00 91	mov	sp, x21
   36c1c:	00 00 80 d2	mov	x0, #0x0
   36c20:	2f 76 13 94	bl	0x5144dc ; symbol stub for: _$s9CryptoKit8MLKEM768O9PublicKeyVMa
   36c24:	fc 03 00 aa	mov	x28, x0
   36c28:	e8 03 00 91	mov	x8, sp
   36c2c:	a9 43 03 d1	sub	x9, x29, #0xd0
   36c30:	28 01 10 f8	stur	x8, [x9, #-0x100]
   36c34:	16 80 5f f8	ldur	x22, [x0, #-0x8]
   36c38:	cc 22 40 f9	ldr	x12, [x22, #0x40]
   36c3c:	e9 03 0c aa	mov	x9, x12
   36c40:	70 37 00 d0	adrp	x16, 1774 ; 0x724000
   36c44:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   36c48:	00 02 3f d6	blr	x16
   36c4c:	e8 03 00 91	mov	x8, sp
   36c50:	a9 a3 03 d1	sub	x9, x29, #0xe8
   36c54:	2c 01 10 f8	stur	x12, [x9, #-0x100]
   36c58:	89 3d 00 91	add	x9, x12, #0xf
   36c5c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   36c60:	13 01 09 cb	sub	x19, x8, x9
   36c64:	7f 02 00 91	mov	sp, x19
   36c68:	e8 03 13 aa	mov	x8, x19
   36c6c:	a9 63 02 d1	sub	x9, x29, #0x98
   36c70:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   36c74:	b1 75 13 94	bl	0x514338 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV06publicG0AaDO06PublicG0Vvg
   36c78:	fb 03 15 aa	mov	x27, x21
   36c7c:	e8 03 15 aa	mov	x8, x21
   36c80:	f4 03 13 aa	mov	x20, x19
   36c84:	f5 03 1a aa	mov	x21, x26
   36c88:	0f 76 13 94	bl	0x5144c4 ; symbol stub for: _$s9CryptoKit8MLKEM768O9PublicKeyV11encapsulateAA3KEMO19EncapsulationResultVyKF
   36c8c:	fa 03 15 aa	mov	x26, x21
   36c90:	75 ac 00 b4	cbz	x21, 0x3821c
   36c94:	a8 a3 02 d1	sub	x8, x29, #0xa8
   36c98:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36c9c:	a8 43 01 d1	sub	x8, x29, #0x50
   36ca0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36ca4:	7d 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36ca8:	a8 e3 02 d1	sub	x8, x29, #0xb8
   36cac:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36cb0:	ac 7a 13 94	bl	0x515760 ; symbol stub for: _objc_release
   36cb4:	c8 06 40 f9	ldr	x8, [x22, #0x8]
   36cb8:	e0 03 13 aa	mov	x0, x19
   36cbc:	e1 03 1c aa	mov	x1, x28
   36cc0:	00 01 3f d6	blr	x8
   36cc4:	a8 c3 02 d1	sub	x8, x29, #0xb0
   36cc8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36ccc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36cd0:	a9 63 02 d1	sub	x9, x29, #0x98
   36cd4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36cd8:	e1 03 18 aa	mov	x1, x24
   36cdc:	00 01 3f d6	blr	x8
   36ce0:	a8 23 02 d1	sub	x8, x29, #0x88
   36ce4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36ce8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36cec:	e0 03 17 aa	mov	x0, x23
   36cf0:	a9 43 02 d1	sub	x9, x29, #0x90
   36cf4:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36cf8:	00 01 3f d6	blr	x8
   36cfc:	a8 c3 01 d1	sub	x8, x29, #0x70
   36d00:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36d04:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36d08:	a9 83 01 d1	sub	x9, x29, #0x60
   36d0c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36d10:	a9 a3 01 d1	sub	x9, x29, #0x68
   36d14:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36d18:	00 01 3f d6	blr	x8
   36d1c:	a8 43 03 d1	sub	x8, x29, #0xd0
   36d20:	5c 08 00 14	b	0x38e90
   36d24:	a8 23 05 d1	sub	x8, x29, #0x148
   36d28:	00 01 10 f8	stur	x0, [x8, #-0x100]
   36d2c:	a8 03 05 d1	sub	x8, x29, #0x140
   36d30:	01 01 10 f8	stur	x1, [x8, #-0x100]
   36d34:	a8 43 05 d1	sub	x8, x29, #0x150
   36d38:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   36d3c:	a8 63 05 d1	sub	x8, x29, #0x158
   36d40:	1b 01 10 f8	stur	x27, [x8, #-0x100]
   36d44:	e0 03 14 aa	mov	x0, x20
   36d48:	5b 7b 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   36d4c:	a0 03 03 d1	sub	x0, x29, #0xc0
   36d50:	e1 5e 00 94	bl	0x4e8d4
   36d54:	68 38 00 f0	adrp	x8, 1807 ; 0x745000
   36d58:	08 01 41 f9	ldr	x8, [x8, #0x200]
   36d5c:	1f 05 00 b1	cmn	x8, #0x1
   36d60:	a8 a3 02 d1	sub	x8, x29, #0xa8
   36d64:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   36d68:	a8 c3 01 d1	sub	x8, x29, #0x70
   36d6c:	13 01 50 f8	ldur	x19, [x8, #-0x100]
   36d70:	a8 63 03 d1	sub	x8, x29, #0xd8
   36d74:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   36d78:	a8 a3 03 d1	sub	x8, x29, #0xe8
   36d7c:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   36d80:	a8 43 03 d1	sub	x8, x29, #0xd0
   36d84:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   36d88:	01 c7 01 54	b.ne	0x3a668
   36d8c:	68 38 00 d0	adrp	x8, 1806 ; 0x744000
   36d90:	08 e1 39 91	add	x8, x8, #0xe78
   36d94:	00 05 40 a9	ldp	x0, x1, [x8]
   36d98:	a8 23 05 d1	sub	x8, x29, #0x148
   36d9c:	02 01 50 f8	ldur	x2, [x8, #-0x100]
   36da0:	a8 03 05 d1	sub	x8, x29, #0x140
   36da4:	03 01 50 f8	ldur	x3, [x8, #-0x100]
   36da8:	07 f0 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   36dac:	a8 43 05 d1	sub	x8, x29, #0x150
   36db0:	1b 01 50 f8	ldur	x27, [x8, #-0x100]
   36db4:	a0 34 00 36	tbz	w0, #0x0, 0x37448
   36db8:	21 33 40 b9	ldr	w1, [x25, #0x30]
   36dbc:	22 6b 40 79	ldrh	w2, [x25, #0x34]
   36dc0:	e0 03 19 aa	mov	x0, x25
   36dc4:	fa 7a 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   36dc8:	f4 03 00 aa	mov	x20, x0
   36dcc:	8c 74 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   36dd0:	f4 03 00 aa	mov	x20, x0
   36dd4:	08 20 80 52	mov	w8, #0x100
   36dd8:	a9 83 00 d1	sub	x9, x29, #0x20
   36ddc:	28 01 10 78	sturh	w8, [x9, #-0x100]
   36de0:	c6 5e 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSEAAWl
   36de4:	e2 03 00 aa	mov	x2, x0
   36de8:	61 37 00 d0	adrp	x1, 1774 ; 0x724000
   36dec:	21 20 2b 91	add	x1, x1, #0xac8
   36df0:	a0 83 04 d1	sub	x0, x29, #0x120
   36df4:	f5 03 1a aa	mov	x21, x26
   36df8:	7e 74 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   36dfc:	fa 03 15 aa	mov	x26, x21
   36e00:	a8 a3 01 d1	sub	x8, x29, #0x68
   36e04:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   36e08:	7a 6a 00 b4	cbz	x26, 0x37b54
   36e0c:	e0 03 17 aa	mov	x0, x23
   36e10:	a8 43 01 d1	sub	x8, x29, #0x50
   36e14:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36e18:	20 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36e1c:	e0 03 14 aa	mov	x0, x20
   36e20:	25 7b 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   36e24:	a8 23 05 d1	sub	x8, x29, #0x148
   36e28:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36e2c:	a8 03 05 d1	sub	x8, x29, #0x140
   36e30:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36e34:	19 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36e38:	e0 03 1b aa	mov	x0, x27
   36e3c:	a8 63 05 d1	sub	x8, x29, #0x158
   36e40:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36e44:	15 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36e48:	a8 63 04 d1	sub	x8, x29, #0x118
   36e4c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36e50:	a8 e3 04 d1	sub	x8, x29, #0x138
   36e54:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36e58:	10 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36e5c:	a8 c3 04 d1	sub	x8, x29, #0x130
   36e60:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36e64:	a8 a3 04 d1	sub	x8, x29, #0x128
   36e68:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   36e6c:	0b 5a 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   36e70:	73 06 40 f9	ldr	x19, [x19, #0x8]
   36e74:	a8 83 04 d1	sub	x8, x29, #0x120
   36e78:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36e7c:	e1 03 15 aa	mov	x1, x21
   36e80:	60 02 3f d6	blr	x19
   36e84:	08 07 40 f9	ldr	x8, [x24, #0x8]
   36e88:	e0 03 16 aa	mov	x0, x22
   36e8c:	e1 03 1c aa	mov	x1, x28
   36e90:	00 01 3f d6	blr	x8
   36e94:	a8 83 02 d1	sub	x8, x29, #0xa0
   36e98:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36e9c:	14 05 40 f9	ldr	x20, [x8, #0x8]
   36ea0:	a8 e3 03 d1	sub	x8, x29, #0xf8
   36ea4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36ea8:	a8 63 02 d1	sub	x8, x29, #0x98
   36eac:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   36eb0:	e1 03 16 aa	mov	x1, x22
   36eb4:	80 02 3f d6	blr	x20
   36eb8:	a8 c3 03 d1	sub	x8, x29, #0xf0
   36ebc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36ec0:	e1 03 16 aa	mov	x1, x22
   36ec4:	80 02 3f d6	blr	x20
   36ec8:	a8 43 02 d1	sub	x8, x29, #0x90
   36ecc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   36ed0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   36ed4:	a9 c3 02 d1	sub	x9, x29, #0xb0
   36ed8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   36edc:	a9 23 02 d1	sub	x9, x29, #0x88
   36ee0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   36ee4:	00 01 3f d6	blr	x8
   36ee8:	a8 83 01 d1	sub	x8, x29, #0x60
   36eec:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   36ef0:	e1 03 15 aa	mov	x1, x21
   36ef4:	60 02 3f d6	blr	x19
   36ef8:	35 fe ff 17	b	0x367cc
   36efc:	b9 04 80 d2	mov	x25, #0x25
   36f00:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   36f04:	08 27 00 f0	adrp	x8, 1251 ; 0x519000
   36f08:	08 c1 38 91	add	x8, x8, #0xe30 ; literal pool for: "Failed to store install signing key"
   36f0c:	08 81 00 d1	sub	x8, x8, #0x20
   36f10:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   36f14:	40 38 00 f0	adrp	x0, 1803 ; 0x741000
   36f18:	00 c0 12 91	add	x0, x0, #0x4b0
   36f1c:	a1 27 00 90	adrp	x1, 1268 ; 0x52a000
   36f20:	21 a0 1c 91	add	x1, x1, #0x728
   36f24:	62 b5 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   36f28:	01 0a 80 52	mov	w1, #0x50
   36f2c:	e2 00 80 52	mov	w2, #0x7
   36f30:	9f 7a 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   36f34:	f4 03 00 aa	mov	x20, x0
   36f38:	a8 27 00 90	adrp	x8, 1268 ; 0x52a000
   36f3c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   36f40:	00 04 80 3d	str	q0, [x0, #0x10]
   36f44:	a8 4c 8e d2	mov	x8, #0x7265
   36f48:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   36f4c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   36f50:	f5 03 00 aa	mov	x21, x0
   36f54:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   36f58:	78 37 00 d0	adrp	x24, 1774 ; 0x724000
   36f5c:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   36f60:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   36f64:	18 24 00 f9	str	x24, [x0, #0x48]
   36f68:	29 0b 00 d1	sub	x9, x25, #0x2
   36f6c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   36f70:	13 1c 00 f9	str	x19, [x0, #0x38]
   36f74:	e8 59 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   36f78:	f3 03 00 aa	mov	x19, x0
   36f7c:	e0 03 14 aa	mov	x0, x20
   36f80:	d6 7a 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   36f84:	41 38 00 f0	adrp	x1, 1803 ; 0x741000
   36f88:	21 e0 12 91	add	x1, x1, #0x4b8
   36f8c:	a2 27 00 90	adrp	x2, 1268 ; 0x52a000
   36f90:	42 c0 1c 91	add	x2, x2, #0x730
   36f94:	e0 03 15 aa	mov	x0, x21
   36f98:	9e 62 00 94	bl	_$sypSgWOhTm
   36f9c:	e0 03 14 aa	mov	x0, x20
   36fa0:	01 04 80 52	mov	w1, #0x20
   36fa4:	e2 00 80 52	mov	w2, #0x7
   36fa8:	99 7a 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   36fac:	48 38 00 f0	adrp	x8, 1803 ; 0x741000
   36fb0:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   36fb4:	e8 79 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   36fb8:	f4 03 00 aa	mov	x20, x0
   36fbc:	68 37 00 d0	adrp	x8, 1774 ; 0x724000
   36fc0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   36fc4:	63 37 00 d0	adrp	x3, 1774 ; 0x724000
   36fc8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   36fcc:	02 21 00 91	add	x2, x8, #0x8
   36fd0:	a8 a3 01 d1	sub	x8, x29, #0x68
   36fd4:	13 01 10 f8	stur	x19, [x8, #-0x100]
   36fd8:	e0 03 13 aa	mov	x0, x19
   36fdc:	e1 03 18 aa	mov	x1, x24
   36fe0:	42 75 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   36fe4:	f5 03 00 aa	mov	x21, x0
   36fe8:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   36fec:	a4 03 03 d1	sub	x4, x29, #0xc0
   36ff0:	e0 03 14 aa	mov	x0, x20
   36ff4:	e2 03 15 aa	mov	x2, x21
   36ff8:	03 00 80 d2	mov	x3, #0x0
   36ffc:	29 81 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   37000:	fd 03 1d aa	mov	x29, x29
   37004:	dd 79 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   37008:	f4 03 00 aa	mov	x20, x0
   3700c:	e0 03 15 aa	mov	x0, x21
   37010:	d4 79 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37014:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   37018:	d5 79 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3701c:	a8 e3 01 d1	sub	x8, x29, #0x78
   37020:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   37024:	b4 2e 00 b4	cbz	x20, 0x375f8
   37028:	e0 03 14 aa	mov	x0, x20
   3702c:	4e 74 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   37030:	f8 03 00 aa	mov	x24, x0
   37034:	fa 03 01 aa	mov	x26, x1
   37038:	e0 03 14 aa	mov	x0, x20
   3703c:	c9 79 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37040:	00 00 80 d2	mov	x0, #0x0
   37044:	41 75 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   37048:	f7 03 1b aa	mov	x23, x27
   3704c:	fb 03 16 aa	mov	x27, x22
   37050:	f6 03 00 91	mov	x22, sp
   37054:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   37058:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3705c:	e9 03 08 aa	mov	x9, x8
   37060:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37064:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   37068:	00 02 3f d6	blr	x16
   3706c:	e9 03 00 91	mov	x9, sp
   37070:	08 3d 00 91	add	x8, x8, #0xf
   37074:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   37078:	34 01 08 cb	sub	x20, x9, x8
   3707c:	9f 02 00 91	mov	sp, x20
   37080:	e8 03 14 aa	mov	x8, x20
   37084:	2e 75 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   37088:	e0 03 18 aa	mov	x0, x24
   3708c:	e1 03 1a aa	mov	x1, x26
   37090:	e2 03 14 aa	mov	x2, x20
   37094:	27 75 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   37098:	f5 03 00 aa	mov	x21, x0
   3709c:	f4 03 01 aa	mov	x20, x1
   370a0:	e0 03 18 aa	mov	x0, x24
   370a4:	e1 03 1a aa	mov	x1, x26
   370a8:	7c 59 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   370ac:	df 02 00 91	mov	sp, x22
   370b0:	f6 03 1b aa	mov	x22, x27
   370b4:	fb 03 17 aa	mov	x27, x23
   370b8:	a8 e3 01 d1	sub	x8, x29, #0x78
   370bc:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   370c0:	a8 43 02 d1	sub	x8, x29, #0x90
   370c4:	13 01 50 f8	ldur	x19, [x8, #-0x100]
   370c8:	a8 e3 02 d1	sub	x8, x29, #0xb8
   370cc:	1a 01 50 f8	ldur	x26, [x8, #-0x100]
   370d0:	f4 2a 00 b4	cbz	x20, 0x3762c
   370d4:	f9 03 15 aa	mov	x25, x21
   370d8:	59 01 00 14	b	0x3763c
   370dc:	b9 04 80 d2	mov	x25, #0x25
   370e0:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   370e4:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   370e8:	08 81 39 91	add	x8, x8, #0xe60 ; literal pool for: "Failed to store install key agreement key"
   370ec:	08 81 00 d1	sub	x8, x8, #0x20
   370f0:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   370f4:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   370f8:	00 c0 12 91	add	x0, x0, #0x4b0
   370fc:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   37100:	21 a0 1c 91	add	x1, x1, #0x728
   37104:	ea b4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   37108:	01 0a 80 52	mov	w1, #0x50
   3710c:	e2 00 80 52	mov	w2, #0x7
   37110:	27 7a 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   37114:	f4 03 00 aa	mov	x20, x0
   37118:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   3711c:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   37120:	00 04 80 3d	str	q0, [x0, #0x10]
   37124:	a8 4c 8e d2	mov	x8, #0x7265
   37128:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3712c:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   37130:	f5 03 00 aa	mov	x21, x0
   37134:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   37138:	78 37 00 b0	adrp	x24, 1773 ; 0x724000
   3713c:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   37140:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   37144:	18 24 00 f9	str	x24, [x0, #0x48]
   37148:	29 13 00 91	add	x9, x25, #0x4
   3714c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   37150:	13 1c 00 f9	str	x19, [x0, #0x38]
   37154:	70 59 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   37158:	f3 03 00 aa	mov	x19, x0
   3715c:	e0 03 14 aa	mov	x0, x20
   37160:	5e 7a 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   37164:	41 38 00 d0	adrp	x1, 1802 ; 0x741000
   37168:	21 e0 12 91	add	x1, x1, #0x4b8
   3716c:	82 27 00 f0	adrp	x2, 1267 ; 0x52a000
   37170:	42 c0 1c 91	add	x2, x2, #0x730
   37174:	e0 03 15 aa	mov	x0, x21
   37178:	26 62 00 94	bl	_$sypSgWOhTm
   3717c:	e0 03 14 aa	mov	x0, x20
   37180:	01 04 80 52	mov	w1, #0x20
   37184:	e2 00 80 52	mov	w2, #0x7
   37188:	21 7a 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3718c:	48 38 00 d0	adrp	x8, 1802 ; 0x741000
   37190:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   37194:	70 79 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   37198:	f4 03 00 aa	mov	x20, x0
   3719c:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   371a0:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   371a4:	63 37 00 b0	adrp	x3, 1773 ; 0x724000
   371a8:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   371ac:	02 21 00 91	add	x2, x8, #0x8
   371b0:	a8 a3 01 d1	sub	x8, x29, #0x68
   371b4:	13 01 10 f8	stur	x19, [x8, #-0x100]
   371b8:	e0 03 13 aa	mov	x0, x19
   371bc:	e1 03 18 aa	mov	x1, x24
   371c0:	ca 74 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   371c4:	f5 03 00 aa	mov	x21, x0
   371c8:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   371cc:	a4 03 03 d1	sub	x4, x29, #0xc0
   371d0:	e0 03 14 aa	mov	x0, x20
   371d4:	e2 03 15 aa	mov	x2, x21
   371d8:	03 00 80 d2	mov	x3, #0x0
   371dc:	b1 80 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   371e0:	fd 03 1d aa	mov	x29, x29
   371e4:	65 79 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   371e8:	f4 03 00 aa	mov	x20, x0
   371ec:	e0 03 15 aa	mov	x0, x21
   371f0:	5c 79 13 94	bl	0x515760 ; symbol stub for: _objc_release
   371f4:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   371f8:	5d 79 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   371fc:	fc 03 17 aa	mov	x28, x23
   37200:	14 67 00 b4	cbz	x20, 0x37ee0
   37204:	e0 03 14 aa	mov	x0, x20
   37208:	d7 73 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3720c:	f8 03 00 aa	mov	x24, x0
   37210:	fa 03 01 aa	mov	x26, x1
   37214:	e0 03 14 aa	mov	x0, x20
   37218:	52 79 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3721c:	00 00 80 d2	mov	x0, #0x0
   37220:	ca 74 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   37224:	f3 03 00 91	mov	x19, sp
   37228:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3722c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   37230:	e9 03 08 aa	mov	x9, x8
   37234:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37238:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3723c:	00 02 3f d6	blr	x16
   37240:	e9 03 00 91	mov	x9, sp
   37244:	08 3d 00 91	add	x8, x8, #0xf
   37248:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3724c:	34 01 08 cb	sub	x20, x9, x8
   37250:	9f 02 00 91	mov	sp, x20
   37254:	e8 03 14 aa	mov	x8, x20
   37258:	b9 74 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3725c:	e0 03 18 aa	mov	x0, x24
   37260:	e1 03 1a aa	mov	x1, x26
   37264:	e2 03 14 aa	mov	x2, x20
   37268:	b2 74 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3726c:	f5 03 00 aa	mov	x21, x0
   37270:	f4 03 01 aa	mov	x20, x1
   37274:	e0 03 18 aa	mov	x0, x24
   37278:	e1 03 1a aa	mov	x1, x26
   3727c:	07 59 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37280:	7f 02 00 91	mov	sp, x19
   37284:	14 64 00 b4	cbz	x20, 0x37f04
   37288:	f9 03 15 aa	mov	x25, x21
   3728c:	22 03 00 14	b	0x37f14
   37290:	a8 03 03 d1	sub	x8, x29, #0xc0
   37294:	18 01 10 f8	stur	x24, [x8, #-0x100]
   37298:	a8 43 02 d1	sub	x8, x29, #0x90
   3729c:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   372a0:	b9 04 80 d2	mov	x25, #0x25
   372a4:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   372a8:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   372ac:	08 c1 38 91	add	x8, x8, #0xe30 ; literal pool for: "Failed to store install signing key"
   372b0:	08 81 00 d1	sub	x8, x8, #0x20
   372b4:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   372b8:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   372bc:	00 c0 12 91	add	x0, x0, #0x4b0
   372c0:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   372c4:	21 a0 1c 91	add	x1, x1, #0x728
   372c8:	79 b4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   372cc:	01 0a 80 52	mov	w1, #0x50
   372d0:	e2 00 80 52	mov	w2, #0x7
   372d4:	b6 79 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   372d8:	f4 03 00 aa	mov	x20, x0
   372dc:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   372e0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   372e4:	00 04 80 3d	str	q0, [x0, #0x10]
   372e8:	a8 4c 8e d2	mov	x8, #0x7265
   372ec:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   372f0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   372f4:	f5 03 00 aa	mov	x21, x0
   372f8:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   372fc:	76 37 00 b0	adrp	x22, 1773 ; 0x724000
   37300:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   37304:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   37308:	16 24 00 f9	str	x22, [x0, #0x48]
   3730c:	29 0b 00 d1	sub	x9, x25, #0x2
   37310:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   37314:	13 1c 00 f9	str	x19, [x0, #0x38]
   37318:	ff 58 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3731c:	f3 03 00 aa	mov	x19, x0
   37320:	e0 03 14 aa	mov	x0, x20
   37324:	ed 79 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   37328:	41 38 00 d0	adrp	x1, 1802 ; 0x741000
   3732c:	21 e0 12 91	add	x1, x1, #0x4b8
   37330:	82 27 00 f0	adrp	x2, 1267 ; 0x52a000
   37334:	42 c0 1c 91	add	x2, x2, #0x730
   37338:	e0 03 15 aa	mov	x0, x21
   3733c:	b5 61 00 94	bl	_$sypSgWOhTm
   37340:	e0 03 14 aa	mov	x0, x20
   37344:	01 04 80 52	mov	w1, #0x20
   37348:	e2 00 80 52	mov	w2, #0x7
   3734c:	b0 79 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   37350:	48 38 00 d0	adrp	x8, 1802 ; 0x741000
   37354:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   37358:	ff 78 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3735c:	f4 03 00 aa	mov	x20, x0
   37360:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   37364:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   37368:	63 37 00 b0	adrp	x3, 1773 ; 0x724000
   3736c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   37370:	02 21 00 91	add	x2, x8, #0x8
   37374:	e0 03 13 aa	mov	x0, x19
   37378:	e1 03 16 aa	mov	x1, x22
   3737c:	5b 74 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   37380:	f5 03 00 aa	mov	x21, x0
   37384:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   37388:	a4 03 03 d1	sub	x4, x29, #0xc0
   3738c:	e0 03 14 aa	mov	x0, x20
   37390:	e2 03 15 aa	mov	x2, x21
   37394:	03 00 80 d2	mov	x3, #0x0
   37398:	42 80 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3739c:	fd 03 1d aa	mov	x29, x29
   373a0:	f6 78 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   373a4:	f4 03 00 aa	mov	x20, x0
   373a8:	e0 03 15 aa	mov	x0, x21
   373ac:	ed 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   373b0:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   373b4:	ee 78 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   373b8:	54 60 00 b4	cbz	x20, 0x37fc0
   373bc:	e0 03 14 aa	mov	x0, x20
   373c0:	69 73 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   373c4:	f6 03 00 aa	mov	x22, x0
   373c8:	fa 03 01 aa	mov	x26, x1
   373cc:	e0 03 14 aa	mov	x0, x20
   373d0:	e4 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   373d4:	00 00 80 d2	mov	x0, #0x0
   373d8:	5c 74 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   373dc:	f8 03 00 91	mov	x24, sp
   373e0:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   373e4:	08 21 40 f9	ldr	x8, [x8, #0x40]
   373e8:	e9 03 08 aa	mov	x9, x8
   373ec:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   373f0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   373f4:	00 02 3f d6	blr	x16
   373f8:	e9 03 00 91	mov	x9, sp
   373fc:	08 3d 00 91	add	x8, x8, #0xf
   37400:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   37404:	34 01 08 cb	sub	x20, x9, x8
   37408:	9f 02 00 91	mov	sp, x20
   3740c:	e8 03 14 aa	mov	x8, x20
   37410:	4b 74 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   37414:	e0 03 16 aa	mov	x0, x22
   37418:	e1 03 1a aa	mov	x1, x26
   3741c:	e2 03 14 aa	mov	x2, x20
   37420:	44 74 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   37424:	f5 03 00 aa	mov	x21, x0
   37428:	f4 03 01 aa	mov	x20, x1
   3742c:	e0 03 16 aa	mov	x0, x22
   37430:	e1 03 1a aa	mov	x1, x26
   37434:	99 58 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37438:	1f 03 00 91	mov	sp, x24
   3743c:	54 5d 00 b4	cbz	x20, 0x37fe4
   37440:	f9 03 15 aa	mov	x25, x21
   37444:	ec 02 00 14	b	0x37ff4
   37448:	b9 04 80 d2	mov	x25, #0x25
   3744c:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   37450:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   37454:	08 41 3a 91	add	x8, x8, #0xe90 ; literal pool for: "Failed to store wrapped DK"
   37458:	08 81 00 d1	sub	x8, x8, #0x20
   3745c:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   37460:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   37464:	00 c0 12 91	add	x0, x0, #0x4b0
   37468:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   3746c:	21 a0 1c 91	add	x1, x1, #0x728
   37470:	0f b4 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   37474:	01 0a 80 52	mov	w1, #0x50
   37478:	e2 00 80 52	mov	w2, #0x7
   3747c:	4c 79 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   37480:	f4 03 00 aa	mov	x20, x0
   37484:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   37488:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3748c:	00 04 80 3d	str	q0, [x0, #0x10]
   37490:	a8 4c 8e d2	mov	x8, #0x7265
   37494:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   37498:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3749c:	f5 03 00 aa	mov	x21, x0
   374a0:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   374a4:	76 37 00 b0	adrp	x22, 1773 ; 0x724000
   374a8:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   374ac:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   374b0:	16 24 00 f9	str	x22, [x0, #0x48]
   374b4:	29 2f 00 d1	sub	x9, x25, #0xb
   374b8:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   374bc:	13 1c 00 f9	str	x19, [x0, #0x38]
   374c0:	95 58 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   374c4:	f3 03 00 aa	mov	x19, x0
   374c8:	e0 03 14 aa	mov	x0, x20
   374cc:	83 79 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   374d0:	41 38 00 d0	adrp	x1, 1802 ; 0x741000
   374d4:	21 e0 12 91	add	x1, x1, #0x4b8
   374d8:	82 27 00 f0	adrp	x2, 1267 ; 0x52a000
   374dc:	42 c0 1c 91	add	x2, x2, #0x730
   374e0:	e0 03 15 aa	mov	x0, x21
   374e4:	4b 61 00 94	bl	_$sypSgWOhTm
   374e8:	e0 03 14 aa	mov	x0, x20
   374ec:	01 04 80 52	mov	w1, #0x20
   374f0:	e2 00 80 52	mov	w2, #0x7
   374f4:	46 79 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   374f8:	48 38 00 d0	adrp	x8, 1802 ; 0x741000
   374fc:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   37500:	95 78 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   37504:	f4 03 00 aa	mov	x20, x0
   37508:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   3750c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   37510:	63 37 00 b0	adrp	x3, 1773 ; 0x724000
   37514:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   37518:	02 21 00 91	add	x2, x8, #0x8
   3751c:	e0 03 13 aa	mov	x0, x19
   37520:	e1 03 16 aa	mov	x1, x22
   37524:	f1 73 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   37528:	f5 03 00 aa	mov	x21, x0
   3752c:	a8 83 00 d1	sub	x8, x29, #0x20
   37530:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   37534:	a4 83 04 d1	sub	x4, x29, #0x120
   37538:	e0 03 14 aa	mov	x0, x20
   3753c:	e2 03 15 aa	mov	x2, x21
   37540:	03 00 80 d2	mov	x3, #0x0
   37544:	d7 7f 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   37548:	fd 03 1d aa	mov	x29, x29
   3754c:	8b 78 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   37550:	f4 03 00 aa	mov	x20, x0
   37554:	e0 03 15 aa	mov	x0, x21
   37558:	82 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3755c:	a8 83 00 d1	sub	x8, x29, #0x20
   37560:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37564:	82 78 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   37568:	f4 59 00 b4	cbz	x20, 0x380a4
   3756c:	e0 03 14 aa	mov	x0, x20
   37570:	fd 72 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   37574:	f6 03 00 aa	mov	x22, x0
   37578:	fa 03 01 aa	mov	x26, x1
   3757c:	e0 03 14 aa	mov	x0, x20
   37580:	78 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37584:	00 00 80 d2	mov	x0, #0x0
   37588:	f0 73 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3758c:	fb 03 00 91	mov	x27, sp
   37590:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   37594:	08 21 40 f9	ldr	x8, [x8, #0x40]
   37598:	e9 03 08 aa	mov	x9, x8
   3759c:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   375a0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   375a4:	00 02 3f d6	blr	x16
   375a8:	e9 03 00 91	mov	x9, sp
   375ac:	08 3d 00 91	add	x8, x8, #0xf
   375b0:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   375b4:	34 01 08 cb	sub	x20, x9, x8
   375b8:	9f 02 00 91	mov	sp, x20
   375bc:	e8 03 14 aa	mov	x8, x20
   375c0:	df 73 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   375c4:	e0 03 16 aa	mov	x0, x22
   375c8:	e1 03 1a aa	mov	x1, x26
   375cc:	e2 03 14 aa	mov	x2, x20
   375d0:	d8 73 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   375d4:	f5 03 00 aa	mov	x21, x0
   375d8:	f4 03 01 aa	mov	x20, x1
   375dc:	e0 03 16 aa	mov	x0, x22
   375e0:	e1 03 1a aa	mov	x1, x26
   375e4:	2d 58 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   375e8:	7f 03 00 91	mov	sp, x27
   375ec:	f4 56 00 b4	cbz	x20, 0x380c8
   375f0:	f9 03 15 aa	mov	x25, x21
   375f4:	b9 02 00 14	b	0x380d8
   375f8:	f4 03 00 aa	mov	x20, x0
   375fc:	9e 72 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   37600:	f8 03 00 aa	mov	x24, x0
   37604:	e0 03 14 aa	mov	x0, x20
   37608:	56 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3760c:	f5 03 18 aa	mov	x21, x24
   37610:	3b 79 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   37614:	e0 03 18 aa	mov	x0, x24
   37618:	06 79 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3761c:	a8 43 02 d1	sub	x8, x29, #0x90
   37620:	13 01 50 f8	ldur	x19, [x8, #-0x100]
   37624:	a8 e3 02 d1	sub	x8, x29, #0xb8
   37628:	1a 01 50 f8	ldur	x26, [x8, #-0x100]
   3762c:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   37630:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   37634:	08 81 00 d1	sub	x8, x8, #0x20
   37638:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3763c:	a8 63 01 d1	sub	x8, x29, #0x58
   37640:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   37644:	a8 03 02 d1	sub	x8, x29, #0x80
   37648:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   3764c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   37650:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37654:	a8 43 01 d1	sub	x8, x29, #0x50
   37658:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3765c:	0f 58 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37660:	a8 03 03 d1	sub	x8, x29, #0xc0
   37664:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37668:	3e 78 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3766c:	a8 a3 01 d1	sub	x8, x29, #0x68
   37670:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37674:	da 78 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   37678:	48 07 40 f9	ldr	x8, [x26, #0x8]
   3767c:	a9 83 02 d1	sub	x9, x29, #0xa0
   37680:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37684:	a9 c3 02 d1	sub	x9, x29, #0xb0
   37688:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   3768c:	00 01 3f d6	blr	x8
   37690:	a8 63 02 d1	sub	x8, x29, #0x98
   37694:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37698:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3769c:	e0 03 18 aa	mov	x0, x24
   376a0:	e1 03 1c aa	mov	x1, x28
   376a4:	00 01 3f d6	blr	x8
   376a8:	68 07 40 f9	ldr	x8, [x27, #0x8]
   376ac:	a9 83 01 d1	sub	x9, x29, #0x60
   376b0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   376b4:	e1 03 16 aa	mov	x1, x22
   376b8:	00 01 3f d6	blr	x8
   376bc:	7f 02 00 91	mov	sp, x19
   376c0:	ff 02 00 91	mov	sp, x23
   376c4:	bf 02 00 91	mov	sp, x21
   376c8:	37 f7 ff 17	b	0x353a4
   376cc:	f7 03 18 aa	mov	x23, x24
   376d0:	a8 43 02 d1	sub	x8, x29, #0x90
   376d4:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   376d8:	b9 04 80 d2	mov	x25, #0x25
   376dc:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   376e0:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   376e4:	08 81 39 91	add	x8, x8, #0xe60 ; literal pool for: "Failed to store install key agreement key"
   376e8:	08 81 00 d1	sub	x8, x8, #0x20
   376ec:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   376f0:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   376f4:	00 c0 12 91	add	x0, x0, #0x4b0
   376f8:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   376fc:	21 a0 1c 91	add	x1, x1, #0x728
   37700:	6b b3 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   37704:	01 0a 80 52	mov	w1, #0x50
   37708:	e2 00 80 52	mov	w2, #0x7
   3770c:	a8 78 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   37710:	f4 03 00 aa	mov	x20, x0
   37714:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   37718:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3771c:	00 04 80 3d	str	q0, [x0, #0x10]
   37720:	a8 4c 8e d2	mov	x8, #0x7265
   37724:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   37728:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3772c:	f5 03 00 aa	mov	x21, x0
   37730:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   37734:	76 37 00 b0	adrp	x22, 1773 ; 0x724000
   37738:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   3773c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   37740:	16 24 00 f9	str	x22, [x0, #0x48]
   37744:	29 13 00 91	add	x9, x25, #0x4
   37748:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3774c:	13 1c 00 f9	str	x19, [x0, #0x38]
   37750:	f1 57 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   37754:	fb 03 00 aa	mov	x27, x0
   37758:	e0 03 14 aa	mov	x0, x20
   3775c:	df 78 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   37760:	41 38 00 d0	adrp	x1, 1802 ; 0x741000
   37764:	21 e0 12 91	add	x1, x1, #0x4b8
   37768:	82 27 00 f0	adrp	x2, 1267 ; 0x52a000
   3776c:	42 c0 1c 91	add	x2, x2, #0x730
   37770:	e0 03 15 aa	mov	x0, x21
   37774:	a7 60 00 94	bl	_$sypSgWOhTm
   37778:	e0 03 14 aa	mov	x0, x20
   3777c:	01 04 80 52	mov	w1, #0x20
   37780:	e2 00 80 52	mov	w2, #0x7
   37784:	a2 78 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   37788:	48 38 00 d0	adrp	x8, 1802 ; 0x741000
   3778c:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   37790:	f1 77 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   37794:	f4 03 00 aa	mov	x20, x0
   37798:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   3779c:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   377a0:	63 37 00 b0	adrp	x3, 1773 ; 0x724000
   377a4:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   377a8:	02 21 00 91	add	x2, x8, #0x8
   377ac:	e0 03 1b aa	mov	x0, x27
   377b0:	e1 03 16 aa	mov	x1, x22
   377b4:	4d 73 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   377b8:	f5 03 00 aa	mov	x21, x0
   377bc:	bf 03 14 f8	stur	xzr, [x29, #-0xc0]
   377c0:	a4 03 03 d1	sub	x4, x29, #0xc0
   377c4:	e0 03 14 aa	mov	x0, x20
   377c8:	e2 03 15 aa	mov	x2, x21
   377cc:	03 00 80 d2	mov	x3, #0x0
   377d0:	34 7f 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   377d4:	fd 03 1d aa	mov	x29, x29
   377d8:	e8 77 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   377dc:	f4 03 00 aa	mov	x20, x0
   377e0:	e0 03 15 aa	mov	x0, x21
   377e4:	df 77 13 94	bl	0x515760 ; symbol stub for: _objc_release
   377e8:	a0 03 54 f8	ldur	x0, [x29, #-0xc0]
   377ec:	e0 77 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   377f0:	b4 62 00 b4	cbz	x20, 0x38444
   377f4:	e0 03 14 aa	mov	x0, x20
   377f8:	5b 72 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   377fc:	f6 03 00 aa	mov	x22, x0
   37800:	fa 03 01 aa	mov	x26, x1
   37804:	e0 03 14 aa	mov	x0, x20
   37808:	d6 77 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3780c:	00 00 80 d2	mov	x0, #0x0
   37810:	4e 73 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   37814:	f3 03 00 91	mov	x19, sp
   37818:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3781c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   37820:	e9 03 08 aa	mov	x9, x8
   37824:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37828:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3782c:	00 02 3f d6	blr	x16
   37830:	e9 03 00 91	mov	x9, sp
   37834:	08 3d 00 91	add	x8, x8, #0xf
   37838:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3783c:	34 01 08 cb	sub	x20, x9, x8
   37840:	9f 02 00 91	mov	sp, x20
   37844:	e8 03 14 aa	mov	x8, x20
   37848:	3d 73 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3784c:	e0 03 16 aa	mov	x0, x22
   37850:	e1 03 1a aa	mov	x1, x26
   37854:	e2 03 14 aa	mov	x2, x20
   37858:	36 73 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3785c:	f5 03 00 aa	mov	x21, x0
   37860:	f4 03 01 aa	mov	x20, x1
   37864:	e0 03 16 aa	mov	x0, x22
   37868:	e1 03 1a aa	mov	x1, x26
   3786c:	8b 57 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37870:	7f 02 00 91	mov	sp, x19
   37874:	b4 5f 00 b4	cbz	x20, 0x38468
   37878:	f9 03 15 aa	mov	x25, x21
   3787c:	ff 02 00 14	b	0x38478
   37880:	a8 43 04 d1	sub	x8, x29, #0x110
   37884:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   37888:	a8 c3 01 d1	sub	x8, x29, #0x70
   3788c:	1b 01 10 f8	stur	x27, [x8, #-0x100]
   37890:	a8 a3 01 d1	sub	x8, x29, #0x68
   37894:	16 01 10 f8	stur	x22, [x8, #-0x100]
   37898:	08 07 40 f9	ldr	x8, [x24, #0x8]
   3789c:	e0 03 13 aa	mov	x0, x19
   378a0:	a9 e3 04 d1	sub	x9, x29, #0x138
   378a4:	37 01 10 f8	stur	x23, [x9, #-0x100]
   378a8:	e1 03 17 aa	mov	x1, x23
   378ac:	a9 03 05 d1	sub	x9, x29, #0x140
   378b0:	28 01 10 f8	stur	x8, [x9, #-0x100]
   378b4:	00 01 3f d6	blr	x8
   378b8:	a8 a3 03 d1	sub	x8, x29, #0xe8
   378bc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   378c0:	1f 01 00 91	mov	sp, x8
   378c4:	e8 03 00 91	mov	x8, sp
   378c8:	a9 a3 03 d1	sub	x9, x29, #0xe8
   378cc:	28 01 10 f8	stur	x8, [x9, #-0x100]
   378d0:	e9 03 19 aa	mov	x9, x25
   378d4:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   378d8:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   378dc:	00 02 3f d6	blr	x16
   378e0:	e8 03 00 91	mov	x8, sp
   378e4:	29 3f 00 91	add	x9, x25, #0xf
   378e8:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   378ec:	17 01 09 cb	sub	x23, x8, x9
   378f0:	ff 02 00 91	mov	sp, x23
   378f4:	00 00 80 d2	mov	x0, #0x0
   378f8:	ea 72 13 94	bl	0x5144a0 ; symbol stub for: _$s9CryptoKit6SHA256VMa
   378fc:	f4 03 00 aa	mov	x20, x0
   37900:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   37904:	00 b5 c1 3d	ldr	q0, [x8, #0x6d0]
   37908:	a8 03 03 d1	sub	x8, x29, #0xc0
   3790c:	00 01 80 3d	str	q0, [x8]
   37910:	68 38 00 d0	adrp	x8, 1806 ; 0x745000
   37914:	08 05 41 f9	ldr	x8, [x8, #0x208]
   37918:	1f 05 00 b1	cmn	x8, #0x1
   3791c:	81 77 01 54	b.ne	0x3a80c
   37920:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   37924:	00 c0 1e 91	add	x0, x0, #0x7b0
   37928:	61 37 00 b0	adrp	x1, 1773 ; 0x724000
   3792c:	21 30 40 f9	ldr	x1, [x1, #0x60] ; literal pool symbol address: _$s9CryptoKit6SHA256VMa
   37930:	62 37 00 b0	adrp	x2, 1773 ; 0x724000
   37934:	42 2c 40 f9	ldr	x2, [x2, #0x58] ; literal pool symbol address: _$s9CryptoKit6SHA256VAA12HashFunctionAAMc
   37938:	00 5c 00 94	bl	_$sSo10CFErrorRefaABs5Error10FoundationWlTm
   3793c:	f8 03 00 aa	mov	x24, x0
   37940:	bd 5b 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   37944:	f5 03 00 aa	mov	x21, x0
   37948:	e0 03 bf a9	stp	x0, x0, [sp, #-0x10]!
   3794c:	76 38 00 b0	adrp	x22, 1805 ; 0x744000
   37950:	d6 22 3a 91	add	x22, x22, #0xe88
   37954:	79 37 00 b0	adrp	x25, 1773 ; 0x724000
   37958:	39 1b 40 f9	ldr	x25, [x25, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   3795c:	a1 03 03 d1	sub	x1, x29, #0xc0
   37960:	e8 03 17 aa	mov	x8, x23
   37964:	e0 03 14 aa	mov	x0, x20
   37968:	e2 03 16 aa	mov	x2, x22
   3796c:	03 04 80 52	mov	w3, #0x20
   37970:	e4 03 14 aa	mov	x4, x20
   37974:	e5 03 19 aa	mov	x5, x25
   37978:	e6 03 19 aa	mov	x6, x25
   3797c:	e7 03 18 aa	mov	x7, x24
   37980:	a9 c3 03 d1	sub	x9, x29, #0xf0
   37984:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   37988:	24 72 13 94	bl	0x514218 ; symbol stub for: _$s9CryptoKit12SharedSecretV23hkdfDerivedSymmetricKey5using4salt10sharedInfo15outputByteCountAA0gH0Vxm_q_q0_SitAA12HashFunctionRz10Foundation12DataProtocolR_AlMR0_r1_lF
   3798c:	ff 43 00 91	add	sp, sp, #0x10
   37990:	a0 07 74 a9	ldp	x0, x1, [x29, #-0xc0]
   37994:	41 57 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37998:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3799c:	09 01 50 f8	ldur	x9, [x8, #-0x100]
   379a0:	a8 43 01 d1	sub	x8, x29, #0x50
   379a4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   379a8:	a9 a3 38 a9	stp	x9, x8, [x29, #-0x78]
   379ac:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   379b0:	00 60 1e 91	add	x0, x0, #0x798
   379b4:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   379b8:	21 e0 1d 91	add	x1, x1, #0x778
   379bc:	bc b2 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   379c0:	e8 03 00 91	mov	x8, sp
   379c4:	a9 63 04 d1	sub	x9, x29, #0x118
   379c8:	28 01 10 f8	stur	x8, [x9, #-0x100]
   379cc:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   379d0:	09 21 40 f9	ldr	x9, [x8, #0x40]
   379d4:	28 3d 00 91	add	x8, x9, #0xf
   379d8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   379dc:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   379e0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   379e4:	00 02 3f d6	blr	x16
   379e8:	e9 03 00 91	mov	x9, sp
   379ec:	34 01 08 cb	sub	x20, x9, x8
   379f0:	9f 02 00 91	mov	sp, x20
   379f4:	00 00 80 d2	mov	x0, #0x0
   379f8:	f9 71 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   379fc:	f8 03 00 aa	mov	x24, x0
   37a00:	13 80 5f f8	ldur	x19, [x0, #-0x8]
   37a04:	68 1e 40 f9	ldr	x8, [x19, #0x38]
   37a08:	e0 03 14 aa	mov	x0, x20
   37a0c:	21 00 80 52	mov	w1, #0x1
   37a10:	22 00 80 52	mov	w2, #0x1
   37a14:	e3 03 18 aa	mov	x3, x24
   37a18:	00 01 3f d6	blr	x8
   37a1c:	a0 e3 01 d1	sub	x0, x29, #0x78
   37a20:	a8 83 04 d1	sub	x8, x29, #0x120
   37a24:	17 01 10 f8	stur	x23, [x8, #-0x100]
   37a28:	e1 03 17 aa	mov	x1, x23
   37a2c:	e2 03 14 aa	mov	x2, x20
   37a30:	e3 03 16 aa	mov	x3, x22
   37a34:	e4 03 19 aa	mov	x4, x25
   37a38:	e5 03 19 aa	mov	x5, x25
   37a3c:	e6 03 15 aa	mov	x6, x21
   37a40:	e7 03 15 aa	mov	x7, x21
   37a44:	f5 03 1a aa	mov	x21, x26
   37a48:	dc 71 13 94	bl	0x5141b8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4seal_5using5nonce14authenticatingAC9SealedBoxVx_AA12SymmetricKeyVAC5NonceVSgq_tK10Foundation12DataProtocolRzAoPR_r0_lFZ
   37a4c:	a8 a3 04 d1	sub	x8, x29, #0x128
   37a50:	00 01 10 f8	stur	x0, [x8, #-0x100]
   37a54:	a8 c3 04 d1	sub	x8, x29, #0x130
   37a58:	01 01 10 f8	stur	x1, [x8, #-0x100]
   37a5c:	fa 03 15 aa	mov	x26, x21
   37a60:	b5 62 00 b4	cbz	x21, 0x386b4
   37a64:	a8 03 03 d1	sub	x8, x29, #0xc0
   37a68:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37a6c:	3d 77 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37a70:	41 38 00 d0	adrp	x1, 1802 ; 0x741000
   37a74:	21 60 1e 91	add	x1, x1, #0x798
   37a78:	82 27 00 f0	adrp	x2, 1267 ; 0x52a000
   37a7c:	42 e0 1d 91	add	x2, x2, #0x778
   37a80:	e0 03 14 aa	mov	x0, x20
   37a84:	e3 5f 00 94	bl	_$sypSgWOhTm
   37a88:	a8 c3 01 d1	sub	x8, x29, #0x70
   37a8c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37a90:	13 05 40 f9	ldr	x19, [x8, #0x8]
   37a94:	a8 83 04 d1	sub	x8, x29, #0x120
   37a98:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37a9c:	a8 a3 01 d1	sub	x8, x29, #0x68
   37aa0:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   37aa4:	e1 03 14 aa	mov	x1, x20
   37aa8:	60 02 3f d6	blr	x19
   37aac:	a8 03 04 d1	sub	x8, x29, #0x100
   37ab0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37ab4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   37ab8:	a9 c3 03 d1	sub	x9, x29, #0xf0
   37abc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37ac0:	a9 e3 03 d1	sub	x9, x29, #0xf8
   37ac4:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   37ac8:	00 01 3f d6	blr	x8
   37acc:	a8 83 03 d1	sub	x8, x29, #0xe0
   37ad0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37ad4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   37ad8:	a9 43 04 d1	sub	x9, x29, #0x110
   37adc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37ae0:	a9 63 03 d1	sub	x9, x29, #0xd8
   37ae4:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   37ae8:	00 01 3f d6	blr	x8
   37aec:	a8 e3 02 d1	sub	x8, x29, #0xb8
   37af0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37af4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   37af8:	a9 83 02 d1	sub	x9, x29, #0xa0
   37afc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37b00:	a9 c3 02 d1	sub	x9, x29, #0xb0
   37b04:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   37b08:	00 01 3f d6	blr	x8
   37b0c:	a8 63 02 d1	sub	x8, x29, #0x98
   37b10:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37b14:	08 05 40 f9	ldr	x8, [x8, #0x8]
   37b18:	a9 03 02 d1	sub	x9, x29, #0x80
   37b1c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37b20:	a9 23 02 d1	sub	x9, x29, #0x88
   37b24:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   37b28:	00 01 3f d6	blr	x8
   37b2c:	a8 83 01 d1	sub	x8, x29, #0x60
   37b30:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37b34:	e1 03 14 aa	mov	x1, x20
   37b38:	60 02 3f d6	blr	x19
   37b3c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   37b40:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37b44:	a8 43 01 d1	sub	x8, x29, #0x50
   37b48:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   37b4c:	d3 56 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37b50:	ce 03 00 14	b	0x38a88
   37b54:	f9 03 01 aa	mov	x25, x1
   37b58:	a8 83 05 d1	sub	x8, x29, #0x160
   37b5c:	00 01 10 f8	stur	x0, [x8, #-0x100]
   37b60:	e0 03 14 aa	mov	x0, x20
   37b64:	d4 77 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   37b68:	68 38 00 d0	adrp	x8, 1806 ; 0x745000
   37b6c:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   37b70:	1f 05 00 b1	cmn	x8, #0x1
   37b74:	81 65 01 54	b.ne	0x3a824
   37b78:	68 38 00 b0	adrp	x8, 1805 ; 0x744000
   37b7c:	08 21 39 91	add	x8, x8, #0xe48
   37b80:	00 05 40 a9	ldp	x0, x1, [x8]
   37b84:	a8 83 05 d1	sub	x8, x29, #0x160
   37b88:	02 01 50 f8	ldur	x2, [x8, #-0x100]
   37b8c:	a8 a3 05 d1	sub	x8, x29, #0x168
   37b90:	19 01 10 f8	stur	x25, [x8, #-0x100]
   37b94:	e3 03 19 aa	mov	x3, x25
   37b98:	8b ec ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   37b9c:	40 4b 00 36	tbz	w0, #0x0, 0x38504
   37ba0:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   37ba4:	00 c0 12 91	add	x0, x0, #0x4b0
   37ba8:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   37bac:	21 a0 1c 91	add	x1, x1, #0x728
   37bb0:	3f b2 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   37bb4:	01 1c 80 52	mov	w1, #0xe0
   37bb8:	e2 00 80 52	mov	w2, #0x7
   37bbc:	7c 77 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   37bc0:	f9 03 00 aa	mov	x25, x0
   37bc4:	88 27 00 f0	adrp	x8, 1267 ; 0x52a000
   37bc8:	00 b9 c1 3d	ldr	q0, [x8, #0x6e0]
   37bcc:	00 04 80 3d	str	q0, [x0, #0x10]
   37bd0:	68 ae 8e d2	mov	x8, #0x7573
   37bd4:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   37bd8:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   37bdc:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   37be0:	f7 03 00 aa	mov	x23, x0
   37be4:	e8 0e 02 f8	str	x8, [x23, #0x20]!
   37be8:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   37bec:	08 14 00 f9	str	x8, [x0, #0x28]
   37bf0:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   37bf4:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   37bf8:	29 00 80 52	mov	w9, #0x1
   37bfc:	09 c0 00 39	strb	w9, [x0, #0x30]
   37c00:	69 6e 8c d2	mov	x9, #0x6373
   37c04:	09 ad ac f2	movk	x9, #0x6568, lsl #16
   37c08:	a9 ad cc f2	movk	x9, #0x656d, lsl #32
   37c0c:	08 a4 04 a9	stp	x8, x9, [x0, #0x48]
   37c10:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   37c14:	7c 37 00 b0	adrp	x28, 1773 ; 0x724000
   37c18:	9c 27 41 f9	ldr	x28, [x28, #0x248] ; literal pool symbol address: _$sSSN
   37c1c:	09 4e 86 d2	mov	x9, #0x3270
   37c20:	a9 c6 a6 f2	movk	x9, #0x3635, lsl #16
   37c24:	e9 cb ce f2	movk	x9, #0x765f, lsl #32
   37c28:	29 06 e0 f2	movk	x9, #0x31, lsl #48
   37c2c:	08 a4 05 a9	stp	x8, x9, [x0, #0x58]
   37c30:	09 e0 fc d2	mov	x9, #-0x1900000000000000
   37c34:	09 34 00 f9	str	x9, [x0, #0x68]
   37c38:	68 2e 8d d2	mov	x8, #0x6973
   37c3c:	e8 ec ab f2	movk	x8, #0x5f67, lsl #16
   37c40:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   37c44:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   37c48:	1c a0 07 a9	stp	x28, x8, [x0, #0x78]
   37c4c:	09 44 00 f9	str	x9, [x0, #0x88]
   37c50:	18 e0 fc d2	mov	x24, #-0x1900000000000000
   37c54:	00 00 80 d2	mov	x0, #0x0
   37c58:	0f 72 13 94	bl	0x514494 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyVMa
   37c5c:	f3 03 00 aa	mov	x19, x0
   37c60:	fa 03 00 91	mov	x26, sp
   37c64:	15 80 5f f8	ldur	x21, [x0, #-0x8]
   37c68:	a8 22 40 f9	ldr	x8, [x21, #0x40]
   37c6c:	e9 03 08 aa	mov	x9, x8
   37c70:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37c74:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   37c78:	00 02 3f d6	blr	x16
   37c7c:	e9 03 00 91	mov	x9, sp
   37c80:	08 3d 00 91	add	x8, x8, #0xf
   37c84:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   37c88:	36 01 08 cb	sub	x22, x9, x8
   37c8c:	df 02 00 91	mov	sp, x22
   37c90:	e8 03 16 aa	mov	x8, x22
   37c94:	a9 c3 02 d1	sub	x9, x29, #0xb0
   37c98:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   37c9c:	e3 71 13 94	bl	0x514428 ; symbol stub for: _$s9CryptoKit4P256O7SigningO10PrivateKeyV06publicF0AE06PublicF0Vvg
   37ca0:	f4 03 16 aa	mov	x20, x22
   37ca4:	f9 71 13 94	bl	0x514488 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyV18x963Representation10Foundation4DataVvg
   37ca8:	f4 03 00 aa	mov	x20, x0
   37cac:	fb 03 01 aa	mov	x27, x1
   37cb0:	a8 06 40 f9	ldr	x8, [x21, #0x8]
   37cb4:	e0 03 16 aa	mov	x0, x22
   37cb8:	e1 03 13 aa	mov	x1, x19
   37cbc:	00 01 3f d6	blr	x8
   37cc0:	00 00 80 d2	mov	x0, #0x0
   37cc4:	e1 03 14 aa	mov	x1, x20
   37cc8:	e2 03 1b aa	mov	x2, x27
   37ccc:	23 71 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   37cd0:	f3 03 00 aa	mov	x19, x0
   37cd4:	f6 03 01 aa	mov	x22, x1
   37cd8:	e0 03 14 aa	mov	x0, x20
   37cdc:	e1 03 1b aa	mov	x1, x27
   37ce0:	6e 56 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37ce4:	5f 03 00 91	mov	sp, x26
   37ce8:	f5 03 00 91	mov	x21, sp
   37cec:	33 5b 09 a9	stp	x19, x22, [x25, #0x90]
   37cf0:	68 ad 8c d2	mov	x8, #0x656b
   37cf4:	a8 ed ab f2	movk	x8, #0x5f6d, lsl #16
   37cf8:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   37cfc:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   37d00:	3c a3 0a a9	stp	x28, x8, [x25, #0xa8]
   37d04:	38 5f 00 f9	str	x24, [x25, #0xb8]
   37d08:	a8 23 04 d1	sub	x8, x29, #0x108
   37d0c:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   37d10:	e9 03 0c aa	mov	x9, x12
   37d14:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37d18:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   37d1c:	00 02 3f d6	blr	x16
   37d20:	e8 03 00 91	mov	x8, sp
   37d24:	89 3d 00 91	add	x9, x12, #0xf
   37d28:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   37d2c:	13 01 09 cb	sub	x19, x8, x9
   37d30:	7f 02 00 91	mov	sp, x19
   37d34:	e8 03 13 aa	mov	x8, x19
   37d38:	a9 c3 03 d1	sub	x9, x29, #0xf0
   37d3c:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   37d40:	ab 71 13 94	bl	0x5143ec ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V06publicD0AE06PublicD0Vvg
   37d44:	f4 03 13 aa	mov	x20, x19
   37d48:	9d 71 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   37d4c:	f4 03 00 aa	mov	x20, x0
   37d50:	f6 03 01 aa	mov	x22, x1
   37d54:	e0 03 13 aa	mov	x0, x19
   37d58:	a8 03 04 d1	sub	x8, x29, #0x100
   37d5c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   37d60:	a8 43 04 d1	sub	x8, x29, #0x110
   37d64:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37d68:	00 01 3f d6	blr	x8
   37d6c:	00 00 80 d2	mov	x0, #0x0
   37d70:	e1 03 14 aa	mov	x1, x20
   37d74:	e2 03 16 aa	mov	x2, x22
   37d78:	f8 70 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   37d7c:	f3 03 00 aa	mov	x19, x0
   37d80:	fb 03 01 aa	mov	x27, x1
   37d84:	e0 03 14 aa	mov	x0, x20
   37d88:	e1 03 16 aa	mov	x1, x22
   37d8c:	43 56 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37d90:	bf 02 00 91	mov	sp, x21
   37d94:	3c 6f 00 f9	str	x28, [x25, #0xd8]
   37d98:	33 6f 0c a9	stp	x19, x27, [x25, #0xc0]
   37d9c:	e0 03 19 aa	mov	x0, x25
   37da0:	5d 56 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   37da4:	f3 03 00 aa	mov	x19, x0
   37da8:	e0 03 19 aa	mov	x0, x25
   37dac:	4b 77 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   37db0:	40 38 00 d0	adrp	x0, 1802 ; 0x741000
   37db4:	00 e0 12 91	add	x0, x0, #0x4b8
   37db8:	81 27 00 f0	adrp	x1, 1267 ; 0x52a000
   37dbc:	21 c0 1c 91	add	x1, x1, #0x730
   37dc0:	bb b1 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   37dc4:	e2 03 00 aa	mov	x2, x0
   37dc8:	e0 03 17 aa	mov	x0, x23
   37dcc:	81 00 80 52	mov	w1, #0x4
   37dd0:	fa 76 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   37dd4:	e0 03 19 aa	mov	x0, x25
   37dd8:	01 04 80 52	mov	w1, #0x20
   37ddc:	e2 00 80 52	mov	w2, #0x7
   37de0:	0b 77 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   37de4:	48 38 00 d0	adrp	x8, 1802 ; 0x741000
   37de8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   37dec:	5a 76 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   37df0:	f4 03 00 aa	mov	x20, x0
   37df4:	68 37 00 b0	adrp	x8, 1773 ; 0x724000
   37df8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   37dfc:	63 37 00 b0	adrp	x3, 1773 ; 0x724000
   37e00:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   37e04:	02 21 00 91	add	x2, x8, #0x8
   37e08:	e0 03 13 aa	mov	x0, x19
   37e0c:	e1 03 1c aa	mov	x1, x28
   37e10:	b6 71 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   37e14:	f5 03 00 aa	mov	x21, x0
   37e18:	a8 83 00 d1	sub	x8, x29, #0x20
   37e1c:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   37e20:	a4 83 04 d1	sub	x4, x29, #0x120
   37e24:	e0 03 14 aa	mov	x0, x20
   37e28:	e2 03 15 aa	mov	x2, x21
   37e2c:	03 00 80 d2	mov	x3, #0x0
   37e30:	9c 7d 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   37e34:	fd 03 1d aa	mov	x29, x29
   37e38:	50 76 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   37e3c:	f4 03 00 aa	mov	x20, x0
   37e40:	e0 03 15 aa	mov	x0, x21
   37e44:	47 76 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37e48:	a8 83 00 d1	sub	x8, x29, #0x20
   37e4c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37e50:	47 76 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   37e54:	14 64 00 b4	cbz	x20, 0x38ad4
   37e58:	e0 03 14 aa	mov	x0, x20
   37e5c:	c2 70 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   37e60:	f5 03 00 aa	mov	x21, x0
   37e64:	f6 03 01 aa	mov	x22, x1
   37e68:	e0 03 14 aa	mov	x0, x20
   37e6c:	3d 76 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37e70:	00 00 80 d2	mov	x0, #0x0
   37e74:	b5 71 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   37e78:	fa 03 00 91	mov	x26, sp
   37e7c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   37e80:	08 21 40 f9	ldr	x8, [x8, #0x40]
   37e84:	e9 03 08 aa	mov	x9, x8
   37e88:	70 37 00 b0	adrp	x16, 1773 ; 0x724000
   37e8c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   37e90:	00 02 3f d6	blr	x16
   37e94:	e9 03 00 91	mov	x9, sp
   37e98:	08 3d 00 91	add	x8, x8, #0xf
   37e9c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   37ea0:	34 01 08 cb	sub	x20, x9, x8
   37ea4:	9f 02 00 91	mov	sp, x20
   37ea8:	e8 03 14 aa	mov	x8, x20
   37eac:	a4 71 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   37eb0:	e0 03 15 aa	mov	x0, x21
   37eb4:	e1 03 16 aa	mov	x1, x22
   37eb8:	e2 03 14 aa	mov	x2, x20
   37ebc:	9d 71 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   37ec0:	f9 03 00 aa	mov	x25, x0
   37ec4:	f4 03 01 aa	mov	x20, x1
   37ec8:	e0 03 15 aa	mov	x0, x21
   37ecc:	e1 03 16 aa	mov	x1, x22
   37ed0:	f2 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37ed4:	5f 03 00 91	mov	sp, x26
   37ed8:	b4 80 00 b5	cbnz	x20, 0x38eec
   37edc:	07 03 00 14	b	0x38af8
   37ee0:	f4 03 00 aa	mov	x20, x0
   37ee4:	64 70 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   37ee8:	f8 03 00 aa	mov	x24, x0
   37eec:	e0 03 14 aa	mov	x0, x20
   37ef0:	1c 76 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37ef4:	f5 03 18 aa	mov	x21, x24
   37ef8:	01 77 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   37efc:	e0 03 18 aa	mov	x0, x24
   37f00:	cc 76 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   37f04:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   37f08:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   37f0c:	08 81 00 d1	sub	x8, x8, #0x20
   37f10:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   37f14:	a8 63 01 d1	sub	x8, x29, #0x58
   37f18:	13 01 50 f8	ldur	x19, [x8, #-0x100]
   37f1c:	a8 03 02 d1	sub	x8, x29, #0x80
   37f20:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   37f24:	a8 63 02 d1	sub	x8, x29, #0x98
   37f28:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   37f2c:	a8 83 02 d1	sub	x8, x29, #0xa0
   37f30:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   37f34:	a8 e3 02 d1	sub	x8, x29, #0xb8
   37f38:	1a 01 50 f8	ldur	x26, [x8, #-0x100]
   37f3c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   37f40:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37f44:	a8 43 01 d1	sub	x8, x29, #0x50
   37f48:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   37f4c:	d3 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   37f50:	a8 03 03 d1	sub	x8, x29, #0xc0
   37f54:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37f58:	02 76 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37f5c:	a8 a3 01 d1	sub	x8, x29, #0x68
   37f60:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   37f64:	9e 76 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   37f68:	48 07 40 f9	ldr	x8, [x26, #0x8]
   37f6c:	e0 03 18 aa	mov	x0, x24
   37f70:	e1 03 1c aa	mov	x1, x28
   37f74:	00 01 3f d6	blr	x8
   37f78:	e8 06 40 f9	ldr	x8, [x23, #0x8]
   37f7c:	e0 03 15 aa	mov	x0, x21
   37f80:	a9 23 02 d1	sub	x9, x29, #0x88
   37f84:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   37f88:	00 01 3f d6	blr	x8
   37f8c:	68 07 40 f9	ldr	x8, [x27, #0x8]
   37f90:	a9 83 01 d1	sub	x9, x29, #0x60
   37f94:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   37f98:	e1 03 16 aa	mov	x1, x22
   37f9c:	00 01 3f d6	blr	x8
   37fa0:	a8 43 02 d1	sub	x8, x29, #0x90
   37fa4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37fa8:	1f 01 00 91	mov	sp, x8
   37fac:	a8 e3 01 d1	sub	x8, x29, #0x78
   37fb0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   37fb4:	1f 01 00 91	mov	sp, x8
   37fb8:	7f 02 00 91	mov	sp, x19
   37fbc:	fa f4 ff 17	b	0x353a4
   37fc0:	f4 03 00 aa	mov	x20, x0
   37fc4:	2c 70 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   37fc8:	f6 03 00 aa	mov	x22, x0
   37fcc:	e0 03 14 aa	mov	x0, x20
   37fd0:	e4 75 13 94	bl	0x515760 ; symbol stub for: _objc_release
   37fd4:	f5 03 16 aa	mov	x21, x22
   37fd8:	c9 76 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   37fdc:	e0 03 16 aa	mov	x0, x22
   37fe0:	94 76 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   37fe4:	08 27 00 d0	adrp	x8, 1250 ; 0x519000
   37fe8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   37fec:	08 81 00 d1	sub	x8, x8, #0x20
   37ff0:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   37ff4:	a8 63 01 d1	sub	x8, x29, #0x58
   37ff8:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   37ffc:	a8 a3 01 d1	sub	x8, x29, #0x68
   38000:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   38004:	a8 03 02 d1	sub	x8, x29, #0x80
   38008:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   3800c:	a8 23 02 d1	sub	x8, x29, #0x88
   38010:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   38014:	a8 c3 02 d1	sub	x8, x29, #0xb0
   38018:	1a 01 50 f8	ldur	x26, [x8, #-0x100]
   3801c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   38020:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38024:	a8 43 01 d1	sub	x8, x29, #0x50
   38028:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3802c:	9b 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38030:	a8 e3 02 d1	sub	x8, x29, #0xb8
   38034:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38038:	ca 75 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3803c:	e0 03 13 aa	mov	x0, x19
   38040:	67 76 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   38044:	48 07 40 f9	ldr	x8, [x26, #0x8]
   38048:	a9 63 02 d1	sub	x9, x29, #0x98
   3804c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38050:	a9 03 03 d1	sub	x9, x29, #0xc0
   38054:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38058:	00 01 3f d6	blr	x8
   3805c:	e8 06 40 f9	ldr	x8, [x23, #0x8]
   38060:	a9 e3 01 d1	sub	x9, x29, #0x78
   38064:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38068:	e1 03 1c aa	mov	x1, x28
   3806c:	00 01 3f d6	blr	x8
   38070:	a8 c3 01 d1	sub	x8, x29, #0x70
   38074:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38078:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3807c:	a9 83 01 d1	sub	x9, x29, #0x60
   38080:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38084:	e1 03 16 aa	mov	x1, x22
   38088:	00 01 3f d6	blr	x8
   3808c:	a8 83 02 d1	sub	x8, x29, #0xa0
   38090:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38094:	1f 01 00 91	mov	sp, x8
   38098:	1f 03 00 91	mov	sp, x24
   3809c:	bf 02 00 91	mov	sp, x21
   380a0:	c1 f4 ff 17	b	0x353a4
   380a4:	f4 03 00 aa	mov	x20, x0
   380a8:	f3 6f 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   380ac:	f6 03 00 aa	mov	x22, x0
   380b0:	e0 03 14 aa	mov	x0, x20
   380b4:	ab 75 13 94	bl	0x515760 ; symbol stub for: _objc_release
   380b8:	f5 03 16 aa	mov	x21, x22
   380bc:	90 76 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   380c0:	e0 03 16 aa	mov	x0, x22
   380c4:	5b 76 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   380c8:	08 27 00 b0	adrp	x8, 1249 ; 0x519000
   380cc:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   380d0:	08 81 00 d1	sub	x8, x8, #0x20
   380d4:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   380d8:	a8 a3 01 d1	sub	x8, x29, #0x68
   380dc:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   380e0:	a8 c3 01 d1	sub	x8, x29, #0x70
   380e4:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   380e8:	a8 e3 02 d1	sub	x8, x29, #0xb8
   380ec:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   380f0:	a8 03 03 d1	sub	x8, x29, #0xc0
   380f4:	1a 01 50 f8	ldur	x26, [x8, #-0x100]
   380f8:	a8 e3 03 d1	sub	x8, x29, #0xf8
   380fc:	1b 01 50 f8	ldur	x27, [x8, #-0x100]
   38100:	e0 03 17 aa	mov	x0, x23
   38104:	a8 43 01 d1	sub	x8, x29, #0x50
   38108:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3810c:	63 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38110:	a8 23 05 d1	sub	x8, x29, #0x148
   38114:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38118:	a8 03 05 d1	sub	x8, x29, #0x140
   3811c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38120:	5e 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38124:	a8 43 05 d1	sub	x8, x29, #0x150
   38128:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3812c:	a8 63 05 d1	sub	x8, x29, #0x158
   38130:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38134:	59 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38138:	a8 63 04 d1	sub	x8, x29, #0x118
   3813c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38140:	a8 e3 04 d1	sub	x8, x29, #0x138
   38144:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38148:	54 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3814c:	a8 c3 04 d1	sub	x8, x29, #0x130
   38150:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38154:	a8 a3 04 d1	sub	x8, x29, #0x128
   38158:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3815c:	4f 55 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38160:	e0 03 13 aa	mov	x0, x19
   38164:	1e 76 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   38168:	b3 06 40 f9	ldr	x19, [x21, #0x8]
   3816c:	a8 83 04 d1	sub	x8, x29, #0x120
   38170:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38174:	e1 03 16 aa	mov	x1, x22
   38178:	60 02 3f d6	blr	x19
   3817c:	a8 43 03 d1	sub	x8, x29, #0xd0
   38180:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38184:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38188:	a9 a3 03 d1	sub	x9, x29, #0xe8
   3818c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38190:	e1 03 1c aa	mov	x1, x28
   38194:	00 01 3f d6	blr	x8
   38198:	a8 83 02 d1	sub	x8, x29, #0xa0
   3819c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   381a0:	15 05 40 f9	ldr	x21, [x8, #0x8]
   381a4:	e0 03 1b aa	mov	x0, x27
   381a8:	a8 63 02 d1	sub	x8, x29, #0x98
   381ac:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   381b0:	e1 03 17 aa	mov	x1, x23
   381b4:	a0 02 3f d6	blr	x21
   381b8:	a8 c3 03 d1	sub	x8, x29, #0xf0
   381bc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   381c0:	e1 03 17 aa	mov	x1, x23
   381c4:	a0 02 3f d6	blr	x21
   381c8:	a8 43 02 d1	sub	x8, x29, #0x90
   381cc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   381d0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   381d4:	a9 c3 02 d1	sub	x9, x29, #0xb0
   381d8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   381dc:	a9 23 02 d1	sub	x9, x29, #0x88
   381e0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   381e4:	00 01 3f d6	blr	x8
   381e8:	a8 83 01 d1	sub	x8, x29, #0x60
   381ec:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   381f0:	e1 03 16 aa	mov	x1, x22
   381f4:	60 02 3f d6	blr	x19
   381f8:	a8 83 03 d1	sub	x8, x29, #0xe0
   381fc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38200:	1f 01 00 91	mov	sp, x8
   38204:	a8 23 03 d1	sub	x8, x29, #0xc8
   38208:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3820c:	1f 01 00 91	mov	sp, x8
   38210:	5f 03 00 91	mov	sp, x26
   38214:	1f 03 00 91	mov	sp, x24
   38218:	0e f7 ff 17	b	0x35e50
   3821c:	a8 03 03 d1	sub	x8, x29, #0xc0
   38220:	18 01 10 f8	stur	x24, [x8, #-0x100]
   38224:	c8 06 40 f9	ldr	x8, [x22, #0x8]
   38228:	e0 03 13 aa	mov	x0, x19
   3822c:	a9 43 04 d1	sub	x9, x29, #0x110
   38230:	3c 01 10 f8	stur	x28, [x9, #-0x100]
   38234:	e1 03 1c aa	mov	x1, x28
   38238:	a9 63 04 d1	sub	x9, x29, #0x118
   3823c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   38240:	00 01 3f d6	blr	x8
   38244:	a8 43 03 d1	sub	x8, x29, #0xd0
   38248:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3824c:	1f 01 00 91	mov	sp, x8
   38250:	e8 03 00 91	mov	x8, sp
   38254:	a9 e3 03 d1	sub	x9, x29, #0xf8
   38258:	28 01 10 f8	stur	x8, [x9, #-0x100]
   3825c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   38260:	09 01 50 f8	ldur	x9, [x8, #-0x100]
   38264:	a8 43 01 d1	sub	x8, x29, #0x50
   38268:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3826c:	a9 a3 38 a9	stp	x9, x8, [x29, #-0x78]
   38270:	e9 03 19 aa	mov	x9, x25
   38274:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   38278:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3827c:	00 02 3f d6	blr	x16
   38280:	e8 03 00 91	mov	x8, sp
   38284:	29 3f 00 91	add	x9, x25, #0xf
   38288:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3828c:	19 01 09 cb	sub	x25, x8, x9
   38290:	3f 03 00 91	mov	sp, x25
   38294:	e8 03 19 aa	mov	x8, x25
   38298:	a9 43 03 d1	sub	x9, x29, #0xd0
   3829c:	3b 01 10 f8	stur	x27, [x9, #-0x100]
   382a0:	f4 03 1b aa	mov	x20, x27
   382a4:	40 70 13 94	bl	0x5143a4 ; symbol stub for: _$s9CryptoKit3KEMO19EncapsulationResultV12sharedSecretAA12SymmetricKeyVvg
   382a8:	40 38 00 b0	adrp	x0, 1801 ; 0x741000
   382ac:	00 60 1e 91	add	x0, x0, #0x798
   382b0:	81 27 00 d0	adrp	x1, 1266 ; 0x52a000
   382b4:	21 e0 1d 91	add	x1, x1, #0x778
   382b8:	7d b0 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   382bc:	e8 03 00 91	mov	x8, sp
   382c0:	a9 c3 03 d1	sub	x9, x29, #0xf0
   382c4:	28 01 10 f8	stur	x8, [x9, #-0x100]
   382c8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   382cc:	09 21 40 f9	ldr	x9, [x8, #0x40]
   382d0:	28 3d 00 91	add	x8, x9, #0xf
   382d4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   382d8:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   382dc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   382e0:	00 02 3f d6	blr	x16
   382e4:	e9 03 00 91	mov	x9, sp
   382e8:	34 01 08 cb	sub	x20, x9, x8
   382ec:	9f 02 00 91	mov	sp, x20
   382f0:	00 00 80 d2	mov	x0, #0x0
   382f4:	ba 6f 13 94	bl	0x5141dc ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceVMa
   382f8:	f3 03 00 aa	mov	x19, x0
   382fc:	16 80 5f f8	ldur	x22, [x0, #-0x8]
   38300:	c8 1e 40 f9	ldr	x8, [x22, #0x38]
   38304:	e0 03 14 aa	mov	x0, x20
   38308:	21 00 80 52	mov	w1, #0x1
   3830c:	22 00 80 52	mov	w2, #0x1
   38310:	e3 03 13 aa	mov	x3, x19
   38314:	00 01 3f d6	blr	x8
   38318:	68 38 00 b0	adrp	x8, 1805 ; 0x745000
   3831c:	08 05 41 f9	ldr	x8, [x8, #0x208]
   38320:	1f 05 00 b1	cmn	x8, #0x1
   38324:	c1 28 01 54	b.ne	0x3a83c
   38328:	43 59 00 94	bl	_$s10Foundation4DataVAcA0B8ProtocolAAWl
   3832c:	e6 03 00 aa	mov	x6, x0
   38330:	63 38 00 90	adrp	x3, 1804 ; 0x744000
   38334:	63 20 3a 91	add	x3, x3, #0xe88
   38338:	7b 37 00 90	adrp	x27, 1772 ; 0x724000
   3833c:	7b 1b 40 f9	ldr	x27, [x27, #0x30] ; literal pool symbol address: _$s10Foundation4DataVN
   38340:	a0 e3 01 d1	sub	x0, x29, #0x78
   38344:	e1 03 19 aa	mov	x1, x25
   38348:	e2 03 14 aa	mov	x2, x20
   3834c:	e4 03 1b aa	mov	x4, x27
   38350:	e5 03 1b aa	mov	x5, x27
   38354:	e7 03 06 aa	mov	x7, x6
   38358:	f5 03 1a aa	mov	x21, x26
   3835c:	97 6f 13 94	bl	0x5141b8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO4seal_5using5nonce14authenticatingAC9SealedBoxVx_AA12SymmetricKeyVAC5NonceVSgq_tK10Foundation12DataProtocolRzAoPR_r0_lFZ
   38360:	a8 23 04 d1	sub	x8, x29, #0x108
   38364:	00 01 10 f8	stur	x0, [x8, #-0x100]
   38368:	a8 03 04 d1	sub	x8, x29, #0x100
   3836c:	01 01 10 f8	stur	x1, [x8, #-0x100]
   38370:	fa 03 15 aa	mov	x26, x21
   38374:	95 3c 00 b4	cbz	x21, 0x38b04
   38378:	a8 e3 02 d1	sub	x8, x29, #0xb8
   3837c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38380:	f8 74 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38384:	41 38 00 b0	adrp	x1, 1801 ; 0x741000
   38388:	21 60 1e 91	add	x1, x1, #0x798
   3838c:	82 27 00 d0	adrp	x2, 1266 ; 0x52a000
   38390:	42 e0 1d 91	add	x2, x2, #0x778
   38394:	e0 03 14 aa	mov	x0, x20
   38398:	9e 5d 00 94	bl	_$sypSgWOhTm
   3839c:	a8 c3 01 d1	sub	x8, x29, #0x70
   383a0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   383a4:	13 05 40 f9	ldr	x19, [x8, #0x8]
   383a8:	e0 03 19 aa	mov	x0, x25
   383ac:	a8 a3 01 d1	sub	x8, x29, #0x68
   383b0:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   383b4:	e1 03 14 aa	mov	x1, x20
   383b8:	60 02 3f d6	blr	x19
   383bc:	a8 83 03 d1	sub	x8, x29, #0xe0
   383c0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   383c4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   383c8:	a9 43 03 d1	sub	x9, x29, #0xd0
   383cc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   383d0:	a9 63 03 d1	sub	x9, x29, #0xd8
   383d4:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   383d8:	00 01 3f d6	blr	x8
   383dc:	a8 c3 02 d1	sub	x8, x29, #0xb0
   383e0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   383e4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   383e8:	a9 63 02 d1	sub	x9, x29, #0x98
   383ec:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   383f0:	a9 03 03 d1	sub	x9, x29, #0xc0
   383f4:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   383f8:	00 01 3f d6	blr	x8
   383fc:	a8 23 02 d1	sub	x8, x29, #0x88
   38400:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38404:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38408:	a9 e3 01 d1	sub	x9, x29, #0x78
   3840c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38410:	a9 43 02 d1	sub	x9, x29, #0x90
   38414:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38418:	00 01 3f d6	blr	x8
   3841c:	a8 83 01 d1	sub	x8, x29, #0x60
   38420:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38424:	e1 03 14 aa	mov	x1, x20
   38428:	60 02 3f d6	blr	x19
   3842c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   38430:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38434:	a8 43 01 d1	sub	x8, x29, #0x50
   38438:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3843c:	97 54 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38440:	90 02 00 14	b	0x38e80
   38444:	f4 03 00 aa	mov	x20, x0
   38448:	0b 6f 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3844c:	f6 03 00 aa	mov	x22, x0
   38450:	e0 03 14 aa	mov	x0, x20
   38454:	c3 74 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38458:	f5 03 16 aa	mov	x21, x22
   3845c:	a8 75 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   38460:	e0 03 16 aa	mov	x0, x22
   38464:	73 75 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   38468:	08 27 00 b0	adrp	x8, 1249 ; 0x519000
   3846c:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   38470:	08 81 00 d1	sub	x8, x8, #0x20
   38474:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   38478:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3847c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38480:	a8 43 01 d1	sub	x8, x29, #0x50
   38484:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38488:	84 54 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3848c:	a8 e3 02 d1	sub	x8, x29, #0xb8
   38490:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38494:	b3 74 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38498:	e0 03 1b aa	mov	x0, x27
   3849c:	50 75 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   384a0:	a8 c3 02 d1	sub	x8, x29, #0xb0
   384a4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   384a8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   384ac:	a9 63 02 d1	sub	x9, x29, #0x98
   384b0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   384b4:	e1 03 17 aa	mov	x1, x23
   384b8:	00 01 3f d6	blr	x8
   384bc:	a8 23 02 d1	sub	x8, x29, #0x88
   384c0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   384c4:	08 05 40 f9	ldr	x8, [x8, #0x8]
   384c8:	a9 e3 01 d1	sub	x9, x29, #0x78
   384cc:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   384d0:	e1 03 18 aa	mov	x1, x24
   384d4:	00 01 3f d6	blr	x8
   384d8:	a8 c3 01 d1	sub	x8, x29, #0x70
   384dc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   384e0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   384e4:	a9 83 01 d1	sub	x9, x29, #0x60
   384e8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   384ec:	a9 a3 01 d1	sub	x9, x29, #0x68
   384f0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   384f4:	00 01 3f d6	blr	x8
   384f8:	9f 03 00 91	mov	sp, x28
   384fc:	a8 03 02 d1	sub	x8, x29, #0x80
   38500:	58 f6 ff 17	b	0x35e60
   38504:	b9 04 80 d2	mov	x25, #0x25
   38508:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3850c:	08 27 00 b0	adrp	x8, 1249 ; 0x519000
   38510:	08 c1 3a 91	add	x8, x8, #0xeb0 ; literal pool for: "Failed to store install metadata"
   38514:	08 81 00 d1	sub	x8, x8, #0x20
   38518:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3851c:	40 38 00 b0	adrp	x0, 1801 ; 0x741000
   38520:	00 c0 12 91	add	x0, x0, #0x4b0
   38524:	81 27 00 d0	adrp	x1, 1266 ; 0x52a000
   38528:	21 a0 1c 91	add	x1, x1, #0x728
   3852c:	e0 af ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   38530:	01 0a 80 52	mov	w1, #0x50
   38534:	e2 00 80 52	mov	w2, #0x7
   38538:	1d 75 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3853c:	f4 03 00 aa	mov	x20, x0
   38540:	88 27 00 d0	adrp	x8, 1266 ; 0x52a000
   38544:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   38548:	00 04 80 3d	str	q0, [x0, #0x10]
   3854c:	a8 4c 8e d2	mov	x8, #0x7265
   38550:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   38554:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   38558:	f5 03 00 aa	mov	x21, x0
   3855c:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   38560:	76 37 00 90	adrp	x22, 1772 ; 0x724000
   38564:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   38568:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3856c:	16 24 00 f9	str	x22, [x0, #0x48]
   38570:	29 17 00 d1	sub	x9, x25, #0x5
   38574:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   38578:	13 1c 00 f9	str	x19, [x0, #0x38]
   3857c:	66 54 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   38580:	f3 03 00 aa	mov	x19, x0
   38584:	e0 03 14 aa	mov	x0, x20
   38588:	54 75 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3858c:	41 38 00 b0	adrp	x1, 1801 ; 0x741000
   38590:	21 e0 12 91	add	x1, x1, #0x4b8
   38594:	82 27 00 d0	adrp	x2, 1266 ; 0x52a000
   38598:	42 c0 1c 91	add	x2, x2, #0x730
   3859c:	e0 03 15 aa	mov	x0, x21
   385a0:	1c 5d 00 94	bl	_$sypSgWOhTm
   385a4:	e0 03 14 aa	mov	x0, x20
   385a8:	01 04 80 52	mov	w1, #0x20
   385ac:	e2 00 80 52	mov	w2, #0x7
   385b0:	17 75 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   385b4:	48 38 00 b0	adrp	x8, 1801 ; 0x741000
   385b8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   385bc:	66 74 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   385c0:	f4 03 00 aa	mov	x20, x0
   385c4:	68 37 00 90	adrp	x8, 1772 ; 0x724000
   385c8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   385cc:	63 37 00 90	adrp	x3, 1772 ; 0x724000
   385d0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   385d4:	02 21 00 91	add	x2, x8, #0x8
   385d8:	e0 03 13 aa	mov	x0, x19
   385dc:	e1 03 16 aa	mov	x1, x22
   385e0:	c2 6f 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   385e4:	f5 03 00 aa	mov	x21, x0
   385e8:	a8 83 00 d1	sub	x8, x29, #0x20
   385ec:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   385f0:	a4 83 04 d1	sub	x4, x29, #0x120
   385f4:	e0 03 14 aa	mov	x0, x20
   385f8:	e2 03 15 aa	mov	x2, x21
   385fc:	03 00 80 d2	mov	x3, #0x0
   38600:	a8 7b 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   38604:	fd 03 1d aa	mov	x29, x29
   38608:	5c 74 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3860c:	f4 03 00 aa	mov	x20, x0
   38610:	e0 03 15 aa	mov	x0, x21
   38614:	53 74 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38618:	a8 83 00 d1	sub	x8, x29, #0x20
   3861c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38620:	53 74 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   38624:	b4 44 00 b4	cbz	x20, 0x38eb8
   38628:	e0 03 14 aa	mov	x0, x20
   3862c:	ce 6e 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   38630:	f6 03 00 aa	mov	x22, x0
   38634:	fa 03 01 aa	mov	x26, x1
   38638:	e0 03 14 aa	mov	x0, x20
   3863c:	49 74 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38640:	00 00 80 d2	mov	x0, #0x0
   38644:	c1 6f 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   38648:	fb 03 00 91	mov	x27, sp
   3864c:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   38650:	08 21 40 f9	ldr	x8, [x8, #0x40]
   38654:	e9 03 08 aa	mov	x9, x8
   38658:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   3865c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   38660:	00 02 3f d6	blr	x16
   38664:	e9 03 00 91	mov	x9, sp
   38668:	08 3d 00 91	add	x8, x8, #0xf
   3866c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   38670:	34 01 08 cb	sub	x20, x9, x8
   38674:	9f 02 00 91	mov	sp, x20
   38678:	e8 03 14 aa	mov	x8, x20
   3867c:	b0 6f 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   38680:	e0 03 16 aa	mov	x0, x22
   38684:	e1 03 1a aa	mov	x1, x26
   38688:	e2 03 14 aa	mov	x2, x20
   3868c:	a9 6f 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   38690:	f5 03 00 aa	mov	x21, x0
   38694:	f4 03 01 aa	mov	x20, x1
   38698:	e0 03 16 aa	mov	x0, x22
   3869c:	e1 03 1a aa	mov	x1, x26
   386a0:	fe 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   386a4:	7f 03 00 91	mov	sp, x27
   386a8:	b4 41 00 b4	cbz	x20, 0x38edc
   386ac:	f9 03 15 aa	mov	x25, x21
   386b0:	0f 02 00 14	b	0x38eec
   386b4:	41 38 00 b0	adrp	x1, 1801 ; 0x741000
   386b8:	21 60 1e 91	add	x1, x1, #0x798
   386bc:	82 27 00 d0	adrp	x2, 1266 ; 0x52a000
   386c0:	42 e0 1d 91	add	x2, x2, #0x778
   386c4:	e0 03 14 aa	mov	x0, x20
   386c8:	d2 5c 00 94	bl	_$sypSgWOhTm
   386cc:	fc 03 00 91	mov	x28, sp
   386d0:	68 22 40 f9	ldr	x8, [x19, #0x40]
   386d4:	e9 03 08 aa	mov	x9, x8
   386d8:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   386dc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   386e0:	00 02 3f d6	blr	x16
   386e4:	e9 03 00 91	mov	x9, sp
   386e8:	08 3d 00 91	add	x8, x8, #0xf
   386ec:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   386f0:	34 01 08 cb	sub	x20, x9, x8
   386f4:	9f 02 00 91	mov	sp, x20
   386f8:	e8 03 14 aa	mov	x8, x20
   386fc:	a9 a3 04 d1	sub	x9, x29, #0x128
   38700:	3b 01 50 f8	ldur	x27, [x9, #-0x100]
   38704:	e0 03 1b aa	mov	x0, x27
   38708:	a9 c3 04 d1	sub	x9, x29, #0x130
   3870c:	36 01 50 f8	ldur	x22, [x9, #-0x100]
   38710:	e1 03 16 aa	mov	x1, x22
   38714:	be 6e 13 94	bl	0x51420c ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonceAC5NonceVvg
   38718:	00 00 00 d0	adrp	x0, 2 ; 0x3a000
   3871c:	00 d0 22 91	add	x0, x0, #0x8b4
   38720:	a8 83 04 d1	sub	x8, x29, #0x120
   38724:	01 00 80 d2	mov	x1, #0x0
   38728:	e2 03 19 aa	mov	x2, x25
   3872c:	f5 03 1a aa	mov	x21, x26
   38730:	a5 6e 13 94	bl	0x5141c4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV15withUnsafeBytesyxxSWKXEKlF
   38734:	f7 03 15 aa	mov	x23, x21
   38738:	68 06 40 f9	ldr	x8, [x19, #0x8]
   3873c:	e0 03 14 aa	mov	x0, x20
   38740:	e1 03 18 aa	mov	x1, x24
   38744:	00 01 3f d6	blr	x8
   38748:	9f 03 00 91	mov	sp, x28
   3874c:	a8 83 00 d1	sub	x8, x29, #0x20
   38750:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38754:	a9 23 05 d1	sub	x9, x29, #0x148
   38758:	28 01 10 f8	stur	x8, [x9, #-0x100]
   3875c:	a8 63 00 d1	sub	x8, x29, #0x18
   38760:	1c 01 50 f8	ldur	x28, [x8, #-0x100]
   38764:	e0 03 1b aa	mov	x0, x27
   38768:	e1 03 16 aa	mov	x1, x22
   3876c:	9f 6e 13 94	bl	0x5141e8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV10ciphertext10Foundation4DataVvg
   38770:	f3 03 00 aa	mov	x19, x0
   38774:	f4 03 01 aa	mov	x20, x1
   38778:	e0 03 1b aa	mov	x0, x27
   3877c:	e1 03 16 aa	mov	x1, x22
   38780:	9d 6e 13 94	bl	0x5141f4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV3tag10Foundation4DataVvg
   38784:	f8 03 00 aa	mov	x24, x0
   38788:	fa 03 01 aa	mov	x26, x1
   3878c:	b3 53 33 a9	stp	x19, x20, [x29, #-0xd0]
   38790:	68 37 00 90	adrp	x8, 1772 ; 0x724000
   38794:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   38798:	a9 23 00 d1	sub	x9, x29, #0x8
   3879c:	39 01 10 f8	stur	x25, [x9, #-0x100]
   387a0:	a8 03 10 f8	stur	x8, [x29, #-0x100]
   387a4:	a8 83 00 d1	sub	x8, x29, #0x20
   387a8:	00 01 10 f8	stur	x0, [x8, #-0x100]
   387ac:	a8 63 00 d1	sub	x8, x29, #0x18
   387b0:	01 01 10 f8	stur	x1, [x8, #-0x100]
   387b4:	a0 83 04 d1	sub	x0, x29, #0x120
   387b8:	e1 03 19 aa	mov	x1, x25
   387bc:	a4 54 00 94	bl	___swift_project_boxed_opaque_existential_1
   387c0:	19 54 40 a9	ldp	x25, x21, [x0]
   387c4:	e0 03 13 aa	mov	x0, x19
   387c8:	e1 03 14 aa	mov	x1, x20
   387cc:	80 54 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   387d0:	e0 03 18 aa	mov	x0, x24
   387d4:	e1 03 1a aa	mov	x1, x26
   387d8:	7d 54 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   387dc:	a2 43 03 d1	sub	x2, x29, #0xd0
   387e0:	e0 03 19 aa	mov	x0, x25
   387e4:	e1 03 15 aa	mov	x1, x21
   387e8:	f5 03 17 aa	mov	x21, x23
   387ec:	d7 52 00 94	bl	_$s10Foundation4DataV15_RepresentationO15withUnsafeBytesyxxSWKXEKlFyt_Tg5015$s10Foundation4B57V6append10contentsOfyx_tSTRzs5UInt8V7ElementRtzlFySWXEfU_ACTf1ncn_n
   387f0:	e0 03 18 aa	mov	x0, x24
   387f4:	e1 03 1a aa	mov	x1, x26
   387f8:	a8 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   387fc:	e0 03 13 aa	mov	x0, x19
   38800:	e1 03 14 aa	mov	x1, x20
   38804:	a5 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38808:	a0 83 04 d1	sub	x0, x29, #0x120
   3880c:	1a 58 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   38810:	fa 03 00 91	mov	x26, sp
   38814:	b7 5b 73 a9	ldp	x23, x22, [x29, #-0xd0]
   38818:	a8 23 04 d1	sub	x8, x29, #0x108
   3881c:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   38820:	e9 03 0c aa	mov	x9, x12
   38824:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   38828:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3882c:	00 02 3f d6	blr	x16
   38830:	e8 03 00 91	mov	x8, sp
   38834:	89 3d 00 91	add	x9, x12, #0xf
   38838:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   3883c:	13 01 09 cb	sub	x19, x8, x9
   38840:	7f 02 00 91	mov	sp, x19
   38844:	e8 03 13 aa	mov	x8, x19
   38848:	a9 43 04 d1	sub	x9, x29, #0x110
   3884c:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   38850:	e7 6e 13 94	bl	0x5143ec ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO07PrivateD0V06publicD0AE06PublicD0Vvg
   38854:	f4 03 13 aa	mov	x20, x19
   38858:	d9 6e 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   3885c:	f4 03 00 aa	mov	x20, x0
   38860:	f8 03 01 aa	mov	x24, x1
   38864:	e0 03 13 aa	mov	x0, x19
   38868:	a8 e3 04 d1	sub	x8, x29, #0x138
   3886c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38870:	a8 03 05 d1	sub	x8, x29, #0x140
   38874:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38878:	00 01 3f d6	blr	x8
   3887c:	00 00 80 d2	mov	x0, #0x0
   38880:	e1 03 14 aa	mov	x1, x20
   38884:	e2 03 18 aa	mov	x2, x24
   38888:	34 6e 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   3888c:	f3 03 00 aa	mov	x19, x0
   38890:	f9 03 01 aa	mov	x25, x1
   38894:	e0 03 14 aa	mov	x0, x20
   38898:	e1 03 18 aa	mov	x1, x24
   3889c:	7f 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   388a0:	5f 03 00 91	mov	sp, x26
   388a4:	00 00 80 d2	mov	x0, #0x0
   388a8:	a8 23 05 d1	sub	x8, x29, #0x148
   388ac:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   388b0:	a8 43 05 d1	sub	x8, x29, #0x150
   388b4:	1c 01 10 f8	stur	x28, [x8, #-0x100]
   388b8:	e2 03 1c aa	mov	x2, x28
   388bc:	27 6e 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   388c0:	f4 03 00 aa	mov	x20, x0
   388c4:	f8 03 01 aa	mov	x24, x1
   388c8:	00 00 80 d2	mov	x0, #0x0
   388cc:	fb 03 17 aa	mov	x27, x23
   388d0:	e1 03 17 aa	mov	x1, x23
   388d4:	fc 03 16 aa	mov	x28, x22
   388d8:	e2 03 16 aa	mov	x2, x22
   388dc:	1f 6e 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   388e0:	bf 03 14 38	sturb	wzr, [x29, #-0xc0]
   388e4:	88 6c 8d 52	mov	w8, #0x6b64
   388e8:	09 40 fc d2	mov	x9, #-0x1e00000000000000
   388ec:	a8 a7 34 a9	stp	x8, x9, [x29, #-0xb8]
   388f0:	b3 e7 35 a9	stp	x19, x25, [x29, #-0xa8]
   388f4:	b4 e3 36 a9	stp	x20, x24, [x29, #-0x98]
   388f8:	a0 87 37 a9	stp	x0, x1, [x29, #-0x88]
   388fc:	00 00 80 d2	mov	x0, #0x0
   38900:	c2 6d 13 94	bl	0x514008 ; symbol stub for: _$s10Foundation11JSONEncoderCMa
   38904:	f9 03 00 aa	mov	x25, x0
   38908:	01 30 40 b9	ldr	w1, [x0, #0x30]
   3890c:	02 68 40 79	ldrh	w2, [x0, #0x34]
   38910:	27 74 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   38914:	f4 03 00 aa	mov	x20, x0
   38918:	b9 6d 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   3891c:	f4 03 00 aa	mov	x20, x0
   38920:	a9 03 03 d1	sub	x9, x29, #0xc0
   38924:	20 05 41 ad	ldp	q0, q1, [x9, #0x20]
   38928:	a0 07 38 ad	stp	q0, q1, [x29, #-0x100]
   3892c:	a8 03 58 f8	ldur	x8, [x29, #-0x80]
   38930:	a8 03 12 f8	stur	x8, [x29, #-0xe0]
   38934:	21 01 40 ad	ldp	q1, q0, [x9]
   38938:	a8 43 00 d1	sub	x8, x29, #0x10
   3893c:	00 01 90 3c	stur	q0, [x8, #-0x100]
   38940:	a8 83 00 d1	sub	x8, x29, #0x20
   38944:	01 01 90 3c	stur	q1, [x8, #-0x100]
   38948:	0c 58 00 94	bl	_$s16AsideNativeSwift13WrappedDkP256VACSEAAWl
   3894c:	e2 03 00 aa	mov	x2, x0
   38950:	61 37 00 90	adrp	x1, 1772 ; 0x724000
   38954:	21 60 31 91	add	x1, x1, #0xc58
   38958:	a0 83 04 d1	sub	x0, x29, #0x120
   3895c:	a5 6d 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   38960:	a8 63 05 d1	sub	x8, x29, #0x158
   38964:	01 01 10 f8	stur	x1, [x8, #-0x100]
   38968:	fa 03 15 aa	mov	x26, x21
   3896c:	f5 36 00 b4	cbz	x21, 0x39048
   38970:	e0 03 14 aa	mov	x0, x20
   38974:	50 74 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   38978:	e0 03 1b aa	mov	x0, x27
   3897c:	e1 03 1c aa	mov	x1, x28
   38980:	46 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38984:	a8 23 05 d1	sub	x8, x29, #0x148
   38988:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3898c:	a8 43 05 d1	sub	x8, x29, #0x150
   38990:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38994:	41 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38998:	a8 a3 04 d1	sub	x8, x29, #0x128
   3899c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   389a0:	a8 c3 04 d1	sub	x8, x29, #0x130
   389a4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   389a8:	3c 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   389ac:	a8 a3 02 d1	sub	x8, x29, #0xa8
   389b0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   389b4:	a8 43 01 d1	sub	x8, x29, #0x50
   389b8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   389bc:	37 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   389c0:	a8 03 03 d1	sub	x8, x29, #0xc0
   389c4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   389c8:	66 73 13 94	bl	0x515760 ; symbol stub for: _objc_release
   389cc:	a8 c3 01 d1	sub	x8, x29, #0x70
   389d0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   389d4:	13 05 40 f9	ldr	x19, [x8, #0x8]
   389d8:	a8 83 04 d1	sub	x8, x29, #0x120
   389dc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   389e0:	a8 a3 01 d1	sub	x8, x29, #0x68
   389e4:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   389e8:	e1 03 14 aa	mov	x1, x20
   389ec:	60 02 3f d6	blr	x19
   389f0:	a8 03 04 d1	sub	x8, x29, #0x100
   389f4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   389f8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   389fc:	a9 c3 03 d1	sub	x9, x29, #0xf0
   38a00:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38a04:	a9 e3 03 d1	sub	x9, x29, #0xf8
   38a08:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38a0c:	00 01 3f d6	blr	x8
   38a10:	a8 83 03 d1	sub	x8, x29, #0xe0
   38a14:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38a18:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38a1c:	a9 43 04 d1	sub	x9, x29, #0x110
   38a20:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38a24:	a9 63 03 d1	sub	x9, x29, #0xd8
   38a28:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38a2c:	00 01 3f d6	blr	x8
   38a30:	a8 e3 02 d1	sub	x8, x29, #0xb8
   38a34:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38a38:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38a3c:	a9 83 02 d1	sub	x9, x29, #0xa0
   38a40:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38a44:	a9 c3 02 d1	sub	x9, x29, #0xb0
   38a48:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38a4c:	00 01 3f d6	blr	x8
   38a50:	a8 63 02 d1	sub	x8, x29, #0x98
   38a54:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38a58:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38a5c:	a9 03 02 d1	sub	x9, x29, #0x80
   38a60:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38a64:	a9 23 02 d1	sub	x9, x29, #0x88
   38a68:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38a6c:	00 01 3f d6	blr	x8
   38a70:	a8 83 01 d1	sub	x8, x29, #0x60
   38a74:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38a78:	e1 03 14 aa	mov	x1, x20
   38a7c:	60 02 3f d6	blr	x19
   38a80:	a0 03 03 d1	sub	x0, x29, #0xc0
   38a84:	94 57 00 94	bl	0x4e8d4
   38a88:	a8 63 04 d1	sub	x8, x29, #0x118
   38a8c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38a90:	1f 01 00 91	mov	sp, x8
   38a94:	a8 a3 03 d1	sub	x8, x29, #0xe8
   38a98:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38a9c:	1f 01 00 91	mov	sp, x8
   38aa0:	a8 23 03 d1	sub	x8, x29, #0xc8
   38aa4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38aa8:	1f 01 00 91	mov	sp, x8
   38aac:	a8 43 03 d1	sub	x8, x29, #0xd0
   38ab0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38ab4:	1f 01 00 91	mov	sp, x8
   38ab8:	1c f6 ff 17	b	0x36328
   38abc:	60 38 00 b0	adrp	x0, 1805 ; 0x745000
   38ac0:	00 c0 07 91	add	x0, x0, #0x1f0
   38ac4:	c1 ff ff 90	adrp	x1, -8 ; 0x30000
   38ac8:	21 90 21 91	add	x1, x1, #0x864
   38acc:	f7 73 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   38ad0:	ed f2 ff 17	b	0x35684
   38ad4:	f5 03 00 aa	mov	x21, x0
   38ad8:	67 6d 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   38adc:	f4 03 00 aa	mov	x20, x0
   38ae0:	e0 03 15 aa	mov	x0, x21
   38ae4:	1f 73 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38ae8:	f5 03 14 aa	mov	x21, x20
   38aec:	04 74 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   38af0:	e0 03 14 aa	mov	x0, x20
   38af4:	cf 73 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   38af8:	b9 04 80 d2	mov	x25, #0x25
   38afc:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   38b00:	f7 00 00 14	b	0x38edc
   38b04:	41 38 00 b0	adrp	x1, 1801 ; 0x741000
   38b08:	21 60 1e 91	add	x1, x1, #0x798
   38b0c:	82 27 00 d0	adrp	x2, 1266 ; 0x52a000
   38b10:	42 e0 1d 91	add	x2, x2, #0x778
   38b14:	e0 03 14 aa	mov	x0, x20
   38b18:	be 5b 00 94	bl	_$sypSgWOhTm
   38b1c:	a8 c3 01 d1	sub	x8, x29, #0x70
   38b20:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38b24:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38b28:	e0 03 19 aa	mov	x0, x25
   38b2c:	a9 a3 01 d1	sub	x9, x29, #0x68
   38b30:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38b34:	a9 c3 01 d1	sub	x9, x29, #0x70
   38b38:	28 01 10 f8	stur	x8, [x9, #-0x100]
   38b3c:	00 01 3f d6	blr	x8
   38b40:	f9 03 00 91	mov	x25, sp
   38b44:	c8 22 40 f9	ldr	x8, [x22, #0x40]
   38b48:	e9 03 08 aa	mov	x9, x8
   38b4c:	70 37 00 90	adrp	x16, 1772 ; 0x724000
   38b50:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   38b54:	00 02 3f d6	blr	x16
   38b58:	e9 03 00 91	mov	x9, sp
   38b5c:	08 3d 00 91	add	x8, x8, #0xf
   38b60:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   38b64:	34 01 08 cb	sub	x20, x9, x8
   38b68:	9f 02 00 91	mov	sp, x20
   38b6c:	e8 03 14 aa	mov	x8, x20
   38b70:	a9 23 04 d1	sub	x9, x29, #0x108
   38b74:	37 01 50 f8	ldur	x23, [x9, #-0x100]
   38b78:	e0 03 17 aa	mov	x0, x23
   38b7c:	a9 03 04 d1	sub	x9, x29, #0x100
   38b80:	3c 01 50 f8	ldur	x28, [x9, #-0x100]
   38b84:	e1 03 1c aa	mov	x1, x28
   38b88:	a1 6d 13 94	bl	0x51420c ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV5nonceAC5NonceVvg
   38b8c:	a0 00 00 f0	adrp	x0, 23 ; 0x4f000
   38b90:	00 d0 2e 91	add	x0, x0, #0xbb4
   38b94:	a8 83 04 d1	sub	x8, x29, #0x120
   38b98:	01 00 80 d2	mov	x1, #0x0
   38b9c:	e2 03 1b aa	mov	x2, x27
   38ba0:	f5 03 1a aa	mov	x21, x26
   38ba4:	88 6d 13 94	bl	0x5141c4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO5NonceV15withUnsafeBytesyxxSWKXEKlF
   38ba8:	a8 83 04 d1	sub	x8, x29, #0x120
   38bac:	15 01 10 f8	stur	x21, [x8, #-0x100]
   38bb0:	c8 06 40 f9	ldr	x8, [x22, #0x8]
   38bb4:	e0 03 14 aa	mov	x0, x20
   38bb8:	e1 03 13 aa	mov	x1, x19
   38bbc:	00 01 3f d6	blr	x8
   38bc0:	3f 03 00 91	mov	sp, x25
   38bc4:	a8 83 00 d1	sub	x8, x29, #0x20
   38bc8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38bcc:	a9 a3 04 d1	sub	x9, x29, #0x128
   38bd0:	28 01 10 f8	stur	x8, [x9, #-0x100]
   38bd4:	a8 63 00 d1	sub	x8, x29, #0x18
   38bd8:	18 01 50 f8	ldur	x24, [x8, #-0x100]
   38bdc:	e0 03 17 aa	mov	x0, x23
   38be0:	e1 03 1c aa	mov	x1, x28
   38be4:	81 6d 13 94	bl	0x5141e8 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV10ciphertext10Foundation4DataVvg
   38be8:	f3 03 00 aa	mov	x19, x0
   38bec:	f4 03 01 aa	mov	x20, x1
   38bf0:	e0 03 17 aa	mov	x0, x23
   38bf4:	e1 03 1c aa	mov	x1, x28
   38bf8:	7f 6d 13 94	bl	0x5141f4 ; symbol stub for: _$s9CryptoKit03ChaC4PolyO9SealedBoxV3tag10Foundation4DataVvg
   38bfc:	f6 03 00 aa	mov	x22, x0
   38c00:	f9 03 01 aa	mov	x25, x1
   38c04:	b3 53 33 a9	stp	x19, x20, [x29, #-0xd0]
   38c08:	68 37 00 90	adrp	x8, 1772 ; 0x724000
   38c0c:	08 15 40 f9	ldr	x8, [x8, #0x28] ; literal pool symbol address: _$s10Foundation4DataVAA15ContiguousBytesAAWP
   38c10:	a9 23 00 d1	sub	x9, x29, #0x8
   38c14:	3b 01 10 f8	stur	x27, [x9, #-0x100]
   38c18:	a8 03 10 f8	stur	x8, [x29, #-0x100]
   38c1c:	a8 83 00 d1	sub	x8, x29, #0x20
   38c20:	00 01 10 f8	stur	x0, [x8, #-0x100]
   38c24:	a8 63 00 d1	sub	x8, x29, #0x18
   38c28:	01 01 10 f8	stur	x1, [x8, #-0x100]
   38c2c:	a0 83 04 d1	sub	x0, x29, #0x120
   38c30:	e1 03 1b aa	mov	x1, x27
   38c34:	86 53 00 94	bl	___swift_project_boxed_opaque_existential_1
   38c38:	1a 54 40 a9	ldp	x26, x21, [x0]
   38c3c:	e0 03 13 aa	mov	x0, x19
   38c40:	e1 03 14 aa	mov	x1, x20
   38c44:	62 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   38c48:	e0 03 16 aa	mov	x0, x22
   38c4c:	e1 03 19 aa	mov	x1, x25
   38c50:	5f 53 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOy
   38c54:	a2 43 03 d1	sub	x2, x29, #0xd0
   38c58:	e0 03 1a aa	mov	x0, x26
   38c5c:	e1 03 15 aa	mov	x1, x21
   38c60:	a8 83 04 d1	sub	x8, x29, #0x120
   38c64:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   38c68:	b8 51 00 94	bl	_$s10Foundation4DataV15_RepresentationO15withUnsafeBytesyxxSWKXEKlFyt_Tg5015$s10Foundation4B57V6append10contentsOfyx_tSTRzs5UInt8V7ElementRtzlFySWXEfU_ACTf1ncn_n
   38c6c:	e0 03 16 aa	mov	x0, x22
   38c70:	e1 03 19 aa	mov	x1, x25
   38c74:	89 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38c78:	e0 03 13 aa	mov	x0, x19
   38c7c:	e1 03 14 aa	mov	x1, x20
   38c80:	86 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38c84:	a0 83 04 d1	sub	x0, x29, #0x120
   38c88:	fb 56 00 94	bl	___swift_destroy_boxed_opaque_existential_0Tm
   38c8c:	bb 6b 73 a9	ldp	x27, x26, [x29, #-0xd0]
   38c90:	a8 43 03 d1	sub	x8, x29, #0xd0
   38c94:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   38c98:	c0 6d 13 94	bl	0x514398 ; symbol stub for: _$s9CryptoKit3KEMO19EncapsulationResultV12encapsulated10Foundation4DataVvg
   38c9c:	f3 03 00 aa	mov	x19, x0
   38ca0:	f4 03 01 aa	mov	x20, x1
   38ca4:	00 00 80 d2	mov	x0, #0x0
   38ca8:	e1 03 13 aa	mov	x1, x19
   38cac:	e2 03 14 aa	mov	x2, x20
   38cb0:	2a 6d 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   38cb4:	f6 03 00 aa	mov	x22, x0
   38cb8:	f9 03 01 aa	mov	x25, x1
   38cbc:	e0 03 13 aa	mov	x0, x19
   38cc0:	e1 03 14 aa	mov	x1, x20
   38cc4:	75 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38cc8:	00 00 80 d2	mov	x0, #0x0
   38ccc:	a8 a3 04 d1	sub	x8, x29, #0x128
   38cd0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38cd4:	fc 03 01 aa	mov	x28, x1
   38cd8:	a8 83 04 d1	sub	x8, x29, #0x120
   38cdc:	18 01 10 f8	stur	x24, [x8, #-0x100]
   38ce0:	e2 03 18 aa	mov	x2, x24
   38ce4:	1d 6d 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   38ce8:	f3 03 00 aa	mov	x19, x0
   38cec:	f4 03 01 aa	mov	x20, x1
   38cf0:	00 00 80 d2	mov	x0, #0x0
   38cf4:	f7 03 1b aa	mov	x23, x27
   38cf8:	e1 03 1b aa	mov	x1, x27
   38cfc:	f8 03 1a aa	mov	x24, x26
   38d00:	e2 03 1a aa	mov	x2, x26
   38d04:	15 6d 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   38d08:	28 00 80 52	mov	w8, #0x1
   38d0c:	a8 03 14 38	sturb	w8, [x29, #-0xc0]
   38d10:	88 6c 8d 52	mov	w8, #0x6b64
   38d14:	09 40 fc d2	mov	x9, #-0x1e00000000000000
   38d18:	a8 a7 34 a9	stp	x8, x9, [x29, #-0xb8]
   38d1c:	b6 e7 35 a9	stp	x22, x25, [x29, #-0xa8]
   38d20:	b3 d3 36 a9	stp	x19, x20, [x29, #-0x98]
   38d24:	a0 87 37 a9	stp	x0, x1, [x29, #-0x88]
   38d28:	00 00 80 d2	mov	x0, #0x0
   38d2c:	b7 6c 13 94	bl	0x514008 ; symbol stub for: _$s10Foundation11JSONEncoderCMa
   38d30:	f3 03 00 aa	mov	x19, x0
   38d34:	01 30 40 b9	ldr	w1, [x0, #0x30]
   38d38:	02 68 40 79	ldrh	w2, [x0, #0x34]
   38d3c:	1c 73 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   38d40:	f4 03 00 aa	mov	x20, x0
   38d44:	ae 6c 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   38d48:	f4 03 00 aa	mov	x20, x0
   38d4c:	a9 03 03 d1	sub	x9, x29, #0xc0
   38d50:	20 05 41 ad	ldp	q0, q1, [x9, #0x20]
   38d54:	a0 07 38 ad	stp	q0, q1, [x29, #-0x100]
   38d58:	a8 03 58 f8	ldur	x8, [x29, #-0x80]
   38d5c:	a8 03 12 f8	stur	x8, [x29, #-0xe0]
   38d60:	21 01 40 ad	ldp	q1, q0, [x9]
   38d64:	a8 43 00 d1	sub	x8, x29, #0x10
   38d68:	00 01 90 3c	stur	q0, [x8, #-0x100]
   38d6c:	a8 83 00 d1	sub	x8, x29, #0x20
   38d70:	01 01 90 3c	stur	q1, [x8, #-0x100]
   38d74:	c8 56 00 94	bl	_$s16AsideNativeSwift11WrappedDkPqVACSEAAWl
   38d78:	e2 03 00 aa	mov	x2, x0
   38d7c:	61 37 00 90	adrp	x1, 1772 ; 0x724000
   38d80:	21 e0 35 91	add	x1, x1, #0xd78
   38d84:	a0 83 04 d1	sub	x0, x29, #0x120
   38d88:	9a 6c 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   38d8c:	a8 c3 04 d1	sub	x8, x29, #0x130
   38d90:	00 01 10 f8	stur	x0, [x8, #-0x100]
   38d94:	a8 e3 04 d1	sub	x8, x29, #0x138
   38d98:	01 01 10 f8	stur	x1, [x8, #-0x100]
   38d9c:	fa 03 15 aa	mov	x26, x21
   38da0:	15 24 00 b4	cbz	x21, 0x39220
   38da4:	a8 a3 02 d1	sub	x8, x29, #0xa8
   38da8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38dac:	a8 43 01 d1	sub	x8, x29, #0x50
   38db0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38db4:	39 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38db8:	e0 03 14 aa	mov	x0, x20
   38dbc:	3e 73 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   38dc0:	e0 03 17 aa	mov	x0, x23
   38dc4:	e1 03 18 aa	mov	x1, x24
   38dc8:	34 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38dcc:	e0 03 1c aa	mov	x0, x28
   38dd0:	a8 83 04 d1	sub	x8, x29, #0x120
   38dd4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38dd8:	30 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38ddc:	a8 23 04 d1	sub	x8, x29, #0x108
   38de0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38de4:	a8 03 04 d1	sub	x8, x29, #0x100
   38de8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38dec:	2b 52 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38df0:	a8 e3 02 d1	sub	x8, x29, #0xb8
   38df4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38df8:	5a 72 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38dfc:	a8 83 03 d1	sub	x8, x29, #0xe0
   38e00:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e04:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38e08:	a9 43 03 d1	sub	x9, x29, #0xd0
   38e0c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38e10:	a9 63 03 d1	sub	x9, x29, #0xd8
   38e14:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38e18:	00 01 3f d6	blr	x8
   38e1c:	a8 c3 02 d1	sub	x8, x29, #0xb0
   38e20:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e24:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38e28:	a9 63 02 d1	sub	x9, x29, #0x98
   38e2c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38e30:	a9 03 03 d1	sub	x9, x29, #0xc0
   38e34:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38e38:	00 01 3f d6	blr	x8
   38e3c:	a8 23 02 d1	sub	x8, x29, #0x88
   38e40:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e44:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38e48:	a9 e3 01 d1	sub	x9, x29, #0x78
   38e4c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38e50:	a9 43 02 d1	sub	x9, x29, #0x90
   38e54:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38e58:	00 01 3f d6	blr	x8
   38e5c:	a8 83 01 d1	sub	x8, x29, #0x60
   38e60:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38e64:	a8 a3 01 d1	sub	x8, x29, #0x68
   38e68:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38e6c:	a8 c3 01 d1	sub	x8, x29, #0x70
   38e70:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e74:	00 01 3f d6	blr	x8
   38e78:	a0 03 03 d1	sub	x0, x29, #0xc0
   38e7c:	96 56 00 94	bl	0x4e8d4
   38e80:	a8 c3 03 d1	sub	x8, x29, #0xf0
   38e84:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e88:	1f 01 00 91	mov	sp, x8
   38e8c:	a8 e3 03 d1	sub	x8, x29, #0xf8
   38e90:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38e94:	1f 01 00 91	mov	sp, x8
   38e98:	a8 23 03 d1	sub	x8, x29, #0xc8
   38e9c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38ea0:	1f 01 00 91	mov	sp, x8
   38ea4:	a8 83 02 d1	sub	x8, x29, #0xa0
   38ea8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38eac:	1f 01 00 91	mov	sp, x8
   38eb0:	a8 03 02 d1	sub	x8, x29, #0x80
   38eb4:	56 f6 ff 17	b	0x3680c
   38eb8:	f5 03 00 aa	mov	x21, x0
   38ebc:	6e 6c 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   38ec0:	f4 03 00 aa	mov	x20, x0
   38ec4:	e0 03 15 aa	mov	x0, x21
   38ec8:	26 72 13 94	bl	0x515760 ; symbol stub for: _objc_release
   38ecc:	f5 03 14 aa	mov	x21, x20
   38ed0:	0b 73 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   38ed4:	e0 03 14 aa	mov	x0, x20
   38ed8:	d6 72 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   38edc:	08 27 00 b0	adrp	x8, 1249 ; 0x519000
   38ee0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   38ee4:	08 81 00 d1	sub	x8, x8, #0x20
   38ee8:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   38eec:	a8 a3 02 d1	sub	x8, x29, #0xa8
   38ef0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38ef4:	a8 43 01 d1	sub	x8, x29, #0x50
   38ef8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38efc:	e7 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f00:	a8 83 05 d1	sub	x8, x29, #0x160
   38f04:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f08:	a8 a3 05 d1	sub	x8, x29, #0x168
   38f0c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38f10:	e2 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f14:	a8 23 05 d1	sub	x8, x29, #0x148
   38f18:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f1c:	a8 03 05 d1	sub	x8, x29, #0x140
   38f20:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38f24:	dd 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f28:	a8 43 05 d1	sub	x8, x29, #0x150
   38f2c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f30:	a8 63 05 d1	sub	x8, x29, #0x158
   38f34:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38f38:	d8 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f3c:	a8 63 04 d1	sub	x8, x29, #0x118
   38f40:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f44:	a8 e3 04 d1	sub	x8, x29, #0x138
   38f48:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38f4c:	d3 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f50:	a8 c3 04 d1	sub	x8, x29, #0x130
   38f54:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f58:	a8 a3 04 d1	sub	x8, x29, #0x128
   38f5c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   38f60:	ce 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   38f64:	e0 03 13 aa	mov	x0, x19
   38f68:	9d 72 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   38f6c:	a8 c3 01 d1	sub	x8, x29, #0x70
   38f70:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38f74:	13 05 40 f9	ldr	x19, [x8, #0x8]
   38f78:	a8 83 04 d1	sub	x8, x29, #0x120
   38f7c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38f80:	a8 a3 01 d1	sub	x8, x29, #0x68
   38f84:	16 01 50 f8	ldur	x22, [x8, #-0x100]
   38f88:	e1 03 16 aa	mov	x1, x22
   38f8c:	60 02 3f d6	blr	x19
   38f90:	a8 43 03 d1	sub	x8, x29, #0xd0
   38f94:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38f98:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38f9c:	a9 a3 03 d1	sub	x9, x29, #0xe8
   38fa0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38fa4:	a9 63 03 d1	sub	x9, x29, #0xd8
   38fa8:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   38fac:	00 01 3f d6	blr	x8
   38fb0:	a8 83 02 d1	sub	x8, x29, #0xa0
   38fb4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38fb8:	15 05 40 f9	ldr	x21, [x8, #0x8]
   38fbc:	a8 e3 03 d1	sub	x8, x29, #0xf8
   38fc0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38fc4:	a8 63 02 d1	sub	x8, x29, #0x98
   38fc8:	17 01 50 f8	ldur	x23, [x8, #-0x100]
   38fcc:	e1 03 17 aa	mov	x1, x23
   38fd0:	a0 02 3f d6	blr	x21
   38fd4:	a8 c3 03 d1	sub	x8, x29, #0xf0
   38fd8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   38fdc:	e1 03 17 aa	mov	x1, x23
   38fe0:	a0 02 3f d6	blr	x21
   38fe4:	a8 43 02 d1	sub	x8, x29, #0x90
   38fe8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   38fec:	08 05 40 f9	ldr	x8, [x8, #0x8]
   38ff0:	a9 c3 02 d1	sub	x9, x29, #0xb0
   38ff4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   38ff8:	a9 23 02 d1	sub	x9, x29, #0x88
   38ffc:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39000:	00 01 3f d6	blr	x8
   39004:	a8 83 01 d1	sub	x8, x29, #0x60
   39008:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3900c:	e1 03 16 aa	mov	x1, x22
   39010:	60 02 3f d6	blr	x19
   39014:	a8 83 03 d1	sub	x8, x29, #0xe0
   39018:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3901c:	1f 01 00 91	mov	sp, x8
   39020:	a8 23 03 d1	sub	x8, x29, #0xc8
   39024:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39028:	1f 01 00 91	mov	sp, x8
   3902c:	a8 03 03 d1	sub	x8, x29, #0xc0
   39030:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39034:	1f 01 00 91	mov	sp, x8
   39038:	a8 e3 02 d1	sub	x8, x29, #0xb8
   3903c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39040:	1f 01 00 91	mov	sp, x8
   39044:	83 f3 ff 17	b	0x35e50
   39048:	f7 03 00 aa	mov	x23, x0
   3904c:	e0 03 14 aa	mov	x0, x20
   39050:	99 72 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   39054:	a0 03 03 d1	sub	x0, x29, #0xc0
   39058:	1f 56 00 94	bl	0x4e8d4
   3905c:	68 38 00 90	adrp	x8, 1804 ; 0x745000
   39060:	08 01 41 f9	ldr	x8, [x8, #0x200]
   39064:	1f 05 00 b1	cmn	x8, #0x1
   39068:	61 bf 00 54	b.ne	0x3a854
   3906c:	48 38 00 f0	adrp	x8, 1803 ; 0x744000
   39070:	08 e1 39 91	add	x8, x8, #0xe78
   39074:	00 05 40 a9	ldp	x0, x1, [x8]
   39078:	e2 03 17 aa	mov	x2, x23
   3907c:	a8 63 05 d1	sub	x8, x29, #0x158
   39080:	03 01 50 f8	ldur	x3, [x8, #-0x100]
   39084:	50 e7 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   39088:	20 19 00 36	tbz	w0, #0x0, 0x393ac
   3908c:	21 33 40 b9	ldr	w1, [x25, #0x30]
   39090:	22 6b 40 79	ldrh	w2, [x25, #0x34]
   39094:	e0 03 19 aa	mov	x0, x25
   39098:	45 72 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3909c:	f4 03 00 aa	mov	x20, x0
   390a0:	d7 6b 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   390a4:	f4 03 00 aa	mov	x20, x0
   390a8:	a8 83 00 d1	sub	x8, x29, #0x20
   390ac:	1f 01 10 78	sturh	wzr, [x8, #-0x100]
   390b0:	12 56 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSEAAWl
   390b4:	e2 03 00 aa	mov	x2, x0
   390b8:	41 37 00 f0	adrp	x1, 1771 ; 0x724000
   390bc:	21 20 2b 91	add	x1, x1, #0xac8
   390c0:	a0 83 04 d1	sub	x0, x29, #0x120
   390c4:	f5 03 1a aa	mov	x21, x26
   390c8:	ca 6b 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   390cc:	a8 a3 05 d1	sub	x8, x29, #0x168
   390d0:	00 01 10 f8	stur	x0, [x8, #-0x100]
   390d4:	a8 83 05 d1	sub	x8, x29, #0x160
   390d8:	01 01 10 f8	stur	x1, [x8, #-0x100]
   390dc:	d5 31 00 b4	cbz	x21, 0x39714
   390e0:	fa 03 15 aa	mov	x26, x21
   390e4:	e0 03 14 aa	mov	x0, x20
   390e8:	73 72 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   390ec:	e0 03 17 aa	mov	x0, x23
   390f0:	a8 63 05 d1	sub	x8, x29, #0x158
   390f4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   390f8:	68 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   390fc:	e0 03 1b aa	mov	x0, x27
   39100:	e1 03 1c aa	mov	x1, x28
   39104:	65 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39108:	a8 23 05 d1	sub	x8, x29, #0x148
   3910c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39110:	a8 43 05 d1	sub	x8, x29, #0x150
   39114:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39118:	60 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3911c:	a8 a3 04 d1	sub	x8, x29, #0x128
   39120:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39124:	a8 c3 04 d1	sub	x8, x29, #0x130
   39128:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3912c:	5b 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39130:	a8 a3 02 d1	sub	x8, x29, #0xa8
   39134:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39138:	a8 43 01 d1	sub	x8, x29, #0x50
   3913c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39140:	56 51 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39144:	a8 03 03 d1	sub	x8, x29, #0xc0
   39148:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3914c:	85 71 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39150:	a8 c3 01 d1	sub	x8, x29, #0x70
   39154:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39158:	13 05 40 f9	ldr	x19, [x8, #0x8]
   3915c:	a8 83 04 d1	sub	x8, x29, #0x120
   39160:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39164:	a8 a3 01 d1	sub	x8, x29, #0x68
   39168:	14 01 50 f8	ldur	x20, [x8, #-0x100]
   3916c:	e1 03 14 aa	mov	x1, x20
   39170:	60 02 3f d6	blr	x19
   39174:	a8 03 04 d1	sub	x8, x29, #0x100
   39178:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3917c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39180:	a9 c3 03 d1	sub	x9, x29, #0xf0
   39184:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39188:	a9 e3 03 d1	sub	x9, x29, #0xf8
   3918c:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39190:	00 01 3f d6	blr	x8
   39194:	a8 83 03 d1	sub	x8, x29, #0xe0
   39198:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3919c:	08 05 40 f9	ldr	x8, [x8, #0x8]
   391a0:	a9 43 04 d1	sub	x9, x29, #0x110
   391a4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   391a8:	a9 63 03 d1	sub	x9, x29, #0xd8
   391ac:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   391b0:	00 01 3f d6	blr	x8
   391b4:	a8 e3 02 d1	sub	x8, x29, #0xb8
   391b8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   391bc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   391c0:	a9 83 02 d1	sub	x9, x29, #0xa0
   391c4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   391c8:	a9 c3 02 d1	sub	x9, x29, #0xb0
   391cc:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   391d0:	00 01 3f d6	blr	x8
   391d4:	a8 63 02 d1	sub	x8, x29, #0x98
   391d8:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   391dc:	08 05 40 f9	ldr	x8, [x8, #0x8]
   391e0:	a9 03 02 d1	sub	x9, x29, #0x80
   391e4:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   391e8:	a9 23 02 d1	sub	x9, x29, #0x88
   391ec:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   391f0:	00 01 3f d6	blr	x8
   391f4:	a8 83 01 d1	sub	x8, x29, #0x60
   391f8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   391fc:	e1 03 14 aa	mov	x1, x20
   39200:	60 02 3f d6	blr	x19
   39204:	21 fe ff 17	b	0x38a88
   39208:	60 38 00 90	adrp	x0, 1804 ; 0x745000
   3920c:	00 e0 07 91	add	x0, x0, #0x1f8
   39210:	a1 ff ff f0	adrp	x1, -9 ; 0x30000
   39214:	21 40 23 91	add	x1, x1, #0x8d0
   39218:	24 72 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3921c:	2f f1 ff 17	b	0x356d8
   39220:	e0 03 14 aa	mov	x0, x20
   39224:	24 72 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   39228:	a0 03 03 d1	sub	x0, x29, #0xc0
   3922c:	aa 55 00 94	bl	0x4e8d4
   39230:	68 38 00 90	adrp	x8, 1804 ; 0x745000
   39234:	08 01 41 f9	ldr	x8, [x8, #0x200]
   39238:	1f 05 00 b1	cmn	x8, #0x1
   3923c:	81 b1 00 54	b.ne	0x3a86c
   39240:	48 38 00 f0	adrp	x8, 1803 ; 0x744000
   39244:	08 e1 39 91	add	x8, x8, #0xe78
   39248:	00 05 40 a9	ldp	x0, x1, [x8]
   3924c:	a8 c3 04 d1	sub	x8, x29, #0x130
   39250:	02 01 50 f8	ldur	x2, [x8, #-0x100]
   39254:	a8 e3 04 d1	sub	x8, x29, #0x138
   39258:	03 01 50 f8	ldur	x3, [x8, #-0x100]
   3925c:	da e6 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   39260:	00 18 00 36	tbz	w0, #0x0, 0x39560
   39264:	61 32 40 b9	ldr	w1, [x19, #0x30]
   39268:	62 6a 40 79	ldrh	w2, [x19, #0x34]
   3926c:	e0 03 13 aa	mov	x0, x19
   39270:	cf 71 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   39274:	f4 03 00 aa	mov	x20, x0
   39278:	61 6b 13 94	bl	0x513ffc ; symbol stub for: _$s10Foundation11JSONEncoderCACycfc
   3927c:	f4 03 00 aa	mov	x20, x0
   39280:	28 00 80 52	mov	w8, #0x1
   39284:	a9 83 00 d1	sub	x9, x29, #0x20
   39288:	28 01 10 78	sturh	w8, [x9, #-0x100]
   3928c:	9b 55 00 94	bl	_$s16AsideNativeSwift11InstallMetaVACSEAAWl
   39290:	e2 03 00 aa	mov	x2, x0
   39294:	41 37 00 f0	adrp	x1, 1771 ; 0x724000
   39298:	21 20 2b 91	add	x1, x1, #0xac8
   3929c:	a0 83 04 d1	sub	x0, x29, #0x120
   392a0:	f5 03 1a aa	mov	x21, x26
   392a4:	53 6b 13 94	bl	0x513ff0 ; symbol stub for: _$s10Foundation11JSONEncoderC6encodeyAA4DataVxKSERzlFTj
   392a8:	a8 23 05 d1	sub	x8, x29, #0x148
   392ac:	00 01 10 f8	stur	x0, [x8, #-0x100]
   392b0:	a8 03 05 d1	sub	x8, x29, #0x140
   392b4:	01 01 10 f8	stur	x1, [x8, #-0x100]
   392b8:	d5 4c 00 b4	cbz	x21, 0x39c50
   392bc:	fa 03 15 aa	mov	x26, x21
   392c0:	a8 a3 02 d1	sub	x8, x29, #0xa8
   392c4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   392c8:	a8 43 01 d1	sub	x8, x29, #0x50
   392cc:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   392d0:	f2 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   392d4:	e0 03 14 aa	mov	x0, x20
   392d8:	f7 71 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   392dc:	a8 c3 04 d1	sub	x8, x29, #0x130
   392e0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   392e4:	a8 e3 04 d1	sub	x8, x29, #0x138
   392e8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   392ec:	eb 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   392f0:	e0 03 17 aa	mov	x0, x23
   392f4:	e1 03 18 aa	mov	x1, x24
   392f8:	e8 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   392fc:	e0 03 1c aa	mov	x0, x28
   39300:	a8 83 04 d1	sub	x8, x29, #0x120
   39304:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39308:	e4 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3930c:	a8 23 04 d1	sub	x8, x29, #0x108
   39310:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39314:	a8 03 04 d1	sub	x8, x29, #0x100
   39318:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3931c:	df 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39320:	a8 e3 02 d1	sub	x8, x29, #0xb8
   39324:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39328:	0e 71 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3932c:	a8 83 03 d1	sub	x8, x29, #0xe0
   39330:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39334:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39338:	a9 43 03 d1	sub	x9, x29, #0xd0
   3933c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39340:	a9 63 03 d1	sub	x9, x29, #0xd8
   39344:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39348:	00 01 3f d6	blr	x8
   3934c:	a8 c3 02 d1	sub	x8, x29, #0xb0
   39350:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39354:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39358:	a9 63 02 d1	sub	x9, x29, #0x98
   3935c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39360:	a9 03 03 d1	sub	x9, x29, #0xc0
   39364:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39368:	00 01 3f d6	blr	x8
   3936c:	a8 23 02 d1	sub	x8, x29, #0x88
   39370:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39374:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39378:	a9 e3 01 d1	sub	x9, x29, #0x78
   3937c:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39380:	a9 43 02 d1	sub	x9, x29, #0x90
   39384:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39388:	00 01 3f d6	blr	x8
   3938c:	a8 83 01 d1	sub	x8, x29, #0x60
   39390:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39394:	a8 a3 01 d1	sub	x8, x29, #0x68
   39398:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3939c:	a8 c3 01 d1	sub	x8, x29, #0x70
   393a0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   393a4:	00 01 3f d6	blr	x8
   393a8:	b6 fe ff 17	b	0x38e80
   393ac:	b9 04 80 d2	mov	x25, #0x25
   393b0:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   393b4:	08 27 00 90	adrp	x8, 1248 ; 0x519000
   393b8:	08 41 3a 91	add	x8, x8, #0xe90 ; literal pool for: "Failed to store wrapped DK"
   393bc:	08 81 00 d1	sub	x8, x8, #0x20
   393c0:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   393c4:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   393c8:	00 c0 12 91	add	x0, x0, #0x4b0
   393cc:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   393d0:	21 a0 1c 91	add	x1, x1, #0x728
   393d4:	36 ac ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   393d8:	01 0a 80 52	mov	w1, #0x50
   393dc:	e2 00 80 52	mov	w2, #0x7
   393e0:	73 71 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   393e4:	f4 03 00 aa	mov	x20, x0
   393e8:	88 27 00 b0	adrp	x8, 1265 ; 0x52a000
   393ec:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   393f0:	00 04 80 3d	str	q0, [x0, #0x10]
   393f4:	a8 4c 8e d2	mov	x8, #0x7265
   393f8:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   393fc:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   39400:	f5 03 00 aa	mov	x21, x0
   39404:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   39408:	58 37 00 f0	adrp	x24, 1771 ; 0x724000
   3940c:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   39410:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   39414:	18 24 00 f9	str	x24, [x0, #0x48]
   39418:	29 2f 00 d1	sub	x9, x25, #0xb
   3941c:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   39420:	13 1c 00 f9	str	x19, [x0, #0x38]
   39424:	bc 50 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   39428:	f3 03 00 aa	mov	x19, x0
   3942c:	e0 03 14 aa	mov	x0, x20
   39430:	aa 71 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   39434:	41 38 00 90	adrp	x1, 1800 ; 0x741000
   39438:	21 e0 12 91	add	x1, x1, #0x4b8
   3943c:	82 27 00 b0	adrp	x2, 1265 ; 0x52a000
   39440:	42 c0 1c 91	add	x2, x2, #0x730
   39444:	e0 03 15 aa	mov	x0, x21
   39448:	72 59 00 94	bl	_$sypSgWOhTm
   3944c:	e0 03 14 aa	mov	x0, x20
   39450:	01 04 80 52	mov	w1, #0x20
   39454:	e2 00 80 52	mov	w2, #0x7
   39458:	6d 71 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3945c:	48 38 00 90	adrp	x8, 1800 ; 0x741000
   39460:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   39464:	bc 70 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   39468:	f4 03 00 aa	mov	x20, x0
   3946c:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   39470:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   39474:	43 37 00 f0	adrp	x3, 1771 ; 0x724000
   39478:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3947c:	02 21 00 91	add	x2, x8, #0x8
   39480:	f6 03 13 aa	mov	x22, x19
   39484:	e0 03 13 aa	mov	x0, x19
   39488:	e1 03 18 aa	mov	x1, x24
   3948c:	17 6c 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   39490:	f5 03 00 aa	mov	x21, x0
   39494:	a8 83 00 d1	sub	x8, x29, #0x20
   39498:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   3949c:	a4 83 04 d1	sub	x4, x29, #0x120
   394a0:	e0 03 14 aa	mov	x0, x20
   394a4:	e2 03 15 aa	mov	x2, x21
   394a8:	03 00 80 d2	mov	x3, #0x0
   394ac:	fd 77 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   394b0:	fd 03 1d aa	mov	x29, x29
   394b4:	b1 70 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   394b8:	f4 03 00 aa	mov	x20, x0
   394bc:	e0 03 15 aa	mov	x0, x21
   394c0:	a8 70 13 94	bl	0x515760 ; symbol stub for: _objc_release
   394c4:	a8 83 00 d1	sub	x8, x29, #0x20
   394c8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   394cc:	a8 70 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   394d0:	f4 2e 00 b4	cbz	x20, 0x39aac
   394d4:	e0 03 14 aa	mov	x0, x20
   394d8:	23 6b 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   394dc:	f8 03 00 aa	mov	x24, x0
   394e0:	fa 03 01 aa	mov	x26, x1
   394e4:	e0 03 14 aa	mov	x0, x20
   394e8:	9e 70 13 94	bl	0x515760 ; symbol stub for: _objc_release
   394ec:	00 00 80 d2	mov	x0, #0x0
   394f0:	16 6c 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   394f4:	f3 03 00 91	mov	x19, sp
   394f8:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   394fc:	08 21 40 f9	ldr	x8, [x8, #0x40]
   39500:	e9 03 08 aa	mov	x9, x8
   39504:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39508:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3950c:	00 02 3f d6	blr	x16
   39510:	e9 03 00 91	mov	x9, sp
   39514:	08 3d 00 91	add	x8, x8, #0xf
   39518:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3951c:	34 01 08 cb	sub	x20, x9, x8
   39520:	9f 02 00 91	mov	sp, x20
   39524:	e8 03 14 aa	mov	x8, x20
   39528:	05 6c 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3952c:	e0 03 18 aa	mov	x0, x24
   39530:	e1 03 1a aa	mov	x1, x26
   39534:	e2 03 14 aa	mov	x2, x20
   39538:	fe 6b 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3953c:	f5 03 00 aa	mov	x21, x0
   39540:	f4 03 01 aa	mov	x20, x1
   39544:	e0 03 18 aa	mov	x0, x24
   39548:	e1 03 1a aa	mov	x1, x26
   3954c:	53 50 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39550:	7f 02 00 91	mov	sp, x19
   39554:	f4 2b 00 b4	cbz	x20, 0x39ad0
   39558:	f9 03 15 aa	mov	x25, x21
   3955c:	61 01 00 14	b	0x39ae0
   39560:	b9 04 80 d2	mov	x25, #0x25
   39564:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   39568:	08 27 00 90	adrp	x8, 1248 ; 0x519000
   3956c:	08 41 3a 91	add	x8, x8, #0xe90 ; literal pool for: "Failed to store wrapped DK"
   39570:	08 81 00 d1	sub	x8, x8, #0x20
   39574:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   39578:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   3957c:	00 c0 12 91	add	x0, x0, #0x4b0
   39580:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   39584:	21 a0 1c 91	add	x1, x1, #0x728
   39588:	c9 ab ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3958c:	01 0a 80 52	mov	w1, #0x50
   39590:	e2 00 80 52	mov	w2, #0x7
   39594:	06 71 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   39598:	f4 03 00 aa	mov	x20, x0
   3959c:	88 27 00 b0	adrp	x8, 1265 ; 0x52a000
   395a0:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   395a4:	00 04 80 3d	str	q0, [x0, #0x10]
   395a8:	a8 4c 8e d2	mov	x8, #0x7265
   395ac:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   395b0:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   395b4:	f5 03 00 aa	mov	x21, x0
   395b8:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   395bc:	56 37 00 f0	adrp	x22, 1771 ; 0x724000
   395c0:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   395c4:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   395c8:	16 24 00 f9	str	x22, [x0, #0x48]
   395cc:	29 2f 00 d1	sub	x9, x25, #0xb
   395d0:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   395d4:	13 1c 00 f9	str	x19, [x0, #0x38]
   395d8:	4f 50 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   395dc:	f3 03 00 aa	mov	x19, x0
   395e0:	e0 03 14 aa	mov	x0, x20
   395e4:	3d 71 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   395e8:	41 38 00 90	adrp	x1, 1800 ; 0x741000
   395ec:	21 e0 12 91	add	x1, x1, #0x4b8
   395f0:	82 27 00 b0	adrp	x2, 1265 ; 0x52a000
   395f4:	42 c0 1c 91	add	x2, x2, #0x730
   395f8:	e0 03 15 aa	mov	x0, x21
   395fc:	05 59 00 94	bl	_$sypSgWOhTm
   39600:	e0 03 14 aa	mov	x0, x20
   39604:	01 04 80 52	mov	w1, #0x20
   39608:	e2 00 80 52	mov	w2, #0x7
   3960c:	00 71 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   39610:	48 38 00 90	adrp	x8, 1800 ; 0x741000
   39614:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   39618:	4f 70 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3961c:	f4 03 00 aa	mov	x20, x0
   39620:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   39624:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   39628:	43 37 00 f0	adrp	x3, 1771 ; 0x724000
   3962c:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   39630:	02 21 00 91	add	x2, x8, #0x8
   39634:	fb 03 13 aa	mov	x27, x19
   39638:	e0 03 13 aa	mov	x0, x19
   3963c:	e1 03 16 aa	mov	x1, x22
   39640:	aa 6b 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   39644:	f5 03 00 aa	mov	x21, x0
   39648:	a8 83 00 d1	sub	x8, x29, #0x20
   3964c:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   39650:	a4 83 04 d1	sub	x4, x29, #0x120
   39654:	e0 03 14 aa	mov	x0, x20
   39658:	e2 03 15 aa	mov	x2, x21
   3965c:	03 00 80 d2	mov	x3, #0x0
   39660:	90 77 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   39664:	fd 03 1d aa	mov	x29, x29
   39668:	44 70 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3966c:	f4 03 00 aa	mov	x20, x0
   39670:	e0 03 15 aa	mov	x0, x21
   39674:	3b 70 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39678:	a8 83 00 d1	sub	x8, x29, #0x20
   3967c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39680:	3b 70 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   39684:	34 4b 00 b4	cbz	x20, 0x39fe8
   39688:	e0 03 14 aa	mov	x0, x20
   3968c:	b6 6a 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   39690:	f6 03 00 aa	mov	x22, x0
   39694:	fa 03 01 aa	mov	x26, x1
   39698:	e0 03 14 aa	mov	x0, x20
   3969c:	31 70 13 94	bl	0x515760 ; symbol stub for: _objc_release
   396a0:	00 00 80 d2	mov	x0, #0x0
   396a4:	a9 6b 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   396a8:	f3 03 00 91	mov	x19, sp
   396ac:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   396b0:	08 21 40 f9	ldr	x8, [x8, #0x40]
   396b4:	e9 03 08 aa	mov	x9, x8
   396b8:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   396bc:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   396c0:	00 02 3f d6	blr	x16
   396c4:	e9 03 00 91	mov	x9, sp
   396c8:	08 3d 00 91	add	x8, x8, #0xf
   396cc:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   396d0:	34 01 08 cb	sub	x20, x9, x8
   396d4:	9f 02 00 91	mov	sp, x20
   396d8:	e8 03 14 aa	mov	x8, x20
   396dc:	98 6b 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   396e0:	e0 03 16 aa	mov	x0, x22
   396e4:	e1 03 1a aa	mov	x1, x26
   396e8:	e2 03 14 aa	mov	x2, x20
   396ec:	91 6b 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   396f0:	f5 03 00 aa	mov	x21, x0
   396f4:	f4 03 01 aa	mov	x20, x1
   396f8:	e0 03 16 aa	mov	x0, x22
   396fc:	e1 03 1a aa	mov	x1, x26
   39700:	e6 4f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39704:	7f 02 00 91	mov	sp, x19
   39708:	34 48 00 b4	cbz	x20, 0x3a00c
   3970c:	f9 03 15 aa	mov	x25, x21
   39710:	43 02 00 14	b	0x3a01c
   39714:	e0 03 14 aa	mov	x0, x20
   39718:	e7 70 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   3971c:	68 38 00 90	adrp	x8, 1804 ; 0x745000
   39720:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   39724:	1f 05 00 b1	cmn	x8, #0x1
   39728:	e1 8a 00 54	b.ne	0x3a884
   3972c:	48 38 00 f0	adrp	x8, 1803 ; 0x744000
   39730:	08 21 39 91	add	x8, x8, #0xe48
   39734:	00 05 40 a9	ldp	x0, x1, [x8]
   39738:	a8 a3 05 d1	sub	x8, x29, #0x168
   3973c:	02 01 50 f8	ldur	x2, [x8, #-0x100]
   39740:	a8 83 05 d1	sub	x8, x29, #0x160
   39744:	03 01 50 f8	ldur	x3, [x8, #-0x100]
   39748:	9f e5 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   3974c:	60 4f 00 36	tbz	w0, #0x0, 0x3a138
   39750:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   39754:	00 c0 12 91	add	x0, x0, #0x4b0
   39758:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   3975c:	21 a0 1c 91	add	x1, x1, #0x728
   39760:	53 ab ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   39764:	01 1c 80 52	mov	w1, #0xe0
   39768:	e2 00 80 52	mov	w2, #0x7
   3976c:	90 70 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   39770:	f9 03 00 aa	mov	x25, x0
   39774:	88 27 00 b0	adrp	x8, 1265 ; 0x52a000
   39778:	00 b9 c1 3d	ldr	q0, [x8, #0x6e0]
   3977c:	00 04 80 3d	str	q0, [x0, #0x10]
   39780:	68 ae 8e d2	mov	x8, #0x7573
   39784:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   39788:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   3978c:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   39790:	e9 03 00 aa	mov	x9, x0
   39794:	28 0d 02 f8	str	x8, [x9, #0x20]!
   39798:	a8 c3 05 d1	sub	x8, x29, #0x170
   3979c:	09 01 10 f8	stur	x9, [x8, #-0x100]
   397a0:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   397a4:	08 14 00 f9	str	x8, [x0, #0x28]
   397a8:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   397ac:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   397b0:	29 00 80 52	mov	w9, #0x1
   397b4:	09 c0 00 39	strb	w9, [x0, #0x30]
   397b8:	69 6e 8c d2	mov	x9, #0x6373
   397bc:	09 ad ac f2	movk	x9, #0x6568, lsl #16
   397c0:	a9 ad cc f2	movk	x9, #0x656d, lsl #32
   397c4:	08 a4 04 a9	stp	x8, x9, [x0, #0x48]
   397c8:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   397cc:	56 37 00 f0	adrp	x22, 1771 ; 0x724000
   397d0:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   397d4:	09 4e 86 d2	mov	x9, #0x3270
   397d8:	a9 c6 a6 f2	movk	x9, #0x3635, lsl #16
   397dc:	e9 cb ce f2	movk	x9, #0x765f, lsl #32
   397e0:	29 06 e0 f2	movk	x9, #0x31, lsl #48
   397e4:	08 a4 05 a9	stp	x8, x9, [x0, #0x58]
   397e8:	09 e0 fc d2	mov	x9, #-0x1900000000000000
   397ec:	09 34 00 f9	str	x9, [x0, #0x68]
   397f0:	68 2e 8d d2	mov	x8, #0x6973
   397f4:	e8 ec ab f2	movk	x8, #0x5f67, lsl #16
   397f8:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   397fc:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   39800:	16 a0 07 a9	stp	x22, x8, [x0, #0x78]
   39804:	09 44 00 f9	str	x9, [x0, #0x88]
   39808:	00 00 80 d2	mov	x0, #0x0
   3980c:	22 6b 13 94	bl	0x514494 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyVMa
   39810:	f3 03 00 aa	mov	x19, x0
   39814:	e8 03 00 91	mov	x8, sp
   39818:	a9 e3 05 d1	sub	x9, x29, #0x178
   3981c:	28 01 10 f8	stur	x8, [x9, #-0x100]
   39820:	1a 80 5f f8	ldur	x26, [x0, #-0x8]
   39824:	48 23 40 f9	ldr	x8, [x26, #0x40]
   39828:	e9 03 08 aa	mov	x9, x8
   3982c:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39830:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   39834:	00 02 3f d6	blr	x16
   39838:	e9 03 00 91	mov	x9, sp
   3983c:	08 3d 00 91	add	x8, x8, #0xf
   39840:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   39844:	38 01 08 cb	sub	x24, x9, x8
   39848:	1f 03 00 91	mov	sp, x24
   3984c:	e8 03 18 aa	mov	x8, x24
   39850:	a9 03 02 d1	sub	x9, x29, #0x80
   39854:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   39858:	94 6a 13 94	bl	0x5142a8 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O7SigningO10PrivateKeyV06publicH0AaDOAFO06PublicH0Vvg
   3985c:	f4 03 18 aa	mov	x20, x24
   39860:	0a 6b 13 94	bl	0x514488 ; symbol stub for: _$s9CryptoKit4P256O7SigningO9PublicKeyV18x963Representation10Foundation4DataVvg
   39864:	f4 03 00 aa	mov	x20, x0
   39868:	f5 03 01 aa	mov	x21, x1
   3986c:	48 07 40 f9	ldr	x8, [x26, #0x8]
   39870:	e0 03 18 aa	mov	x0, x24
   39874:	e1 03 13 aa	mov	x1, x19
   39878:	00 01 3f d6	blr	x8
   3987c:	00 00 80 d2	mov	x0, #0x0
   39880:	e1 03 14 aa	mov	x1, x20
   39884:	e2 03 15 aa	mov	x2, x21
   39888:	34 6a 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   3988c:	f3 03 00 aa	mov	x19, x0
   39890:	f8 03 01 aa	mov	x24, x1
   39894:	e0 03 14 aa	mov	x0, x20
   39898:	e1 03 15 aa	mov	x1, x21
   3989c:	7f 4f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   398a0:	a8 e3 05 d1	sub	x8, x29, #0x178
   398a4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   398a8:	1f 01 00 91	mov	sp, x8
   398ac:	fa 03 00 91	mov	x26, sp
   398b0:	33 63 09 a9	stp	x19, x24, [x25, #0x90]
   398b4:	68 ad 8c d2	mov	x8, #0x656b
   398b8:	a8 ed ab f2	movk	x8, #0x5f6d, lsl #16
   398bc:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   398c0:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   398c4:	36 a3 0a a9	stp	x22, x8, [x25, #0xa8]
   398c8:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   398cc:	28 5f 00 f9	str	x8, [x25, #0xb8]
   398d0:	a8 23 04 d1	sub	x8, x29, #0x108
   398d4:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   398d8:	e9 03 0c aa	mov	x9, x12
   398dc:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   398e0:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   398e4:	00 02 3f d6	blr	x16
   398e8:	e8 03 00 91	mov	x8, sp
   398ec:	89 3d 00 91	add	x9, x12, #0xf
   398f0:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   398f4:	13 01 09 cb	sub	x19, x8, x9
   398f8:	7f 02 00 91	mov	sp, x19
   398fc:	e8 03 13 aa	mov	x8, x19
   39900:	a9 83 02 d1	sub	x9, x29, #0xa0
   39904:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   39908:	59 6a 13 94	bl	0x51426c ; symbol stub for: _$s9CryptoKit13SecureEnclaveO4P256O12KeyAgreementO07PrivateF0V06publicF0AaDOAFO06PublicF0Vvg
   3990c:	f4 03 13 aa	mov	x20, x19
   39910:	ab 6a 13 94	bl	0x5143bc ; symbol stub for: _$s9CryptoKit4P256O12KeyAgreementO06PublicD0V18x963Representation10Foundation4DataVvg
   39914:	f4 03 00 aa	mov	x20, x0
   39918:	f5 03 01 aa	mov	x21, x1
   3991c:	e0 03 13 aa	mov	x0, x19
   39920:	a8 e3 04 d1	sub	x8, x29, #0x138
   39924:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39928:	a8 03 05 d1	sub	x8, x29, #0x140
   3992c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39930:	00 01 3f d6	blr	x8
   39934:	00 00 80 d2	mov	x0, #0x0
   39938:	e1 03 14 aa	mov	x1, x20
   3993c:	e2 03 15 aa	mov	x2, x21
   39940:	06 6a 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   39944:	f3 03 00 aa	mov	x19, x0
   39948:	f8 03 01 aa	mov	x24, x1
   3994c:	e0 03 14 aa	mov	x0, x20
   39950:	e1 03 15 aa	mov	x1, x21
   39954:	51 4f 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39958:	5f 03 00 91	mov	sp, x26
   3995c:	36 6f 00 f9	str	x22, [x25, #0xd8]
   39960:	33 63 0c a9	stp	x19, x24, [x25, #0xc0]
   39964:	e0 03 19 aa	mov	x0, x25
   39968:	6b 4f 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3996c:	f3 03 00 aa	mov	x19, x0
   39970:	e0 03 19 aa	mov	x0, x25
   39974:	59 70 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   39978:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   3997c:	00 e0 12 91	add	x0, x0, #0x4b8
   39980:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   39984:	21 c0 1c 91	add	x1, x1, #0x730
   39988:	c9 aa ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3998c:	e2 03 00 aa	mov	x2, x0
   39990:	a8 c3 05 d1	sub	x8, x29, #0x170
   39994:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39998:	81 00 80 52	mov	w1, #0x4
   3999c:	07 70 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   399a0:	e0 03 19 aa	mov	x0, x25
   399a4:	01 04 80 52	mov	w1, #0x20
   399a8:	e2 00 80 52	mov	w2, #0x7
   399ac:	18 70 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   399b0:	48 38 00 90	adrp	x8, 1800 ; 0x741000
   399b4:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   399b8:	67 6f 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   399bc:	f4 03 00 aa	mov	x20, x0
   399c0:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   399c4:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   399c8:	43 37 00 f0	adrp	x3, 1771 ; 0x724000
   399cc:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   399d0:	02 21 00 91	add	x2, x8, #0x8
   399d4:	e0 03 13 aa	mov	x0, x19
   399d8:	e1 03 16 aa	mov	x1, x22
   399dc:	c3 6a 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   399e0:	f5 03 00 aa	mov	x21, x0
   399e4:	a8 83 00 d1	sub	x8, x29, #0x20
   399e8:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   399ec:	a4 83 04 d1	sub	x4, x29, #0x120
   399f0:	e0 03 14 aa	mov	x0, x20
   399f4:	e2 03 15 aa	mov	x2, x21
   399f8:	03 00 80 d2	mov	x3, #0x0
   399fc:	a9 76 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   39a00:	fd 03 1d aa	mov	x29, x29
   39a04:	5d 6f 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   39a08:	f4 03 00 aa	mov	x20, x0
   39a0c:	e0 03 15 aa	mov	x0, x21
   39a10:	54 6f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39a14:	a8 83 00 d1	sub	x8, x29, #0x20
   39a18:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39a1c:	54 6f 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   39a20:	34 55 00 b4	cbz	x20, 0x3a4c4
   39a24:	e0 03 14 aa	mov	x0, x20
   39a28:	cf 69 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   39a2c:	f5 03 00 aa	mov	x21, x0
   39a30:	f8 03 01 aa	mov	x24, x1
   39a34:	e0 03 14 aa	mov	x0, x20
   39a38:	4a 6f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39a3c:	00 00 80 d2	mov	x0, #0x0
   39a40:	c2 6a 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   39a44:	fa 03 00 91	mov	x26, sp
   39a48:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   39a4c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   39a50:	e9 03 08 aa	mov	x9, x8
   39a54:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39a58:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   39a5c:	00 02 3f d6	blr	x16
   39a60:	e9 03 00 91	mov	x9, sp
   39a64:	08 3d 00 91	add	x8, x8, #0xf
   39a68:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   39a6c:	34 01 08 cb	sub	x20, x9, x8
   39a70:	9f 02 00 91	mov	sp, x20
   39a74:	e8 03 14 aa	mov	x8, x20
   39a78:	b1 6a 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   39a7c:	e0 03 15 aa	mov	x0, x21
   39a80:	e1 03 18 aa	mov	x1, x24
   39a84:	e2 03 14 aa	mov	x2, x20
   39a88:	aa 6a 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   39a8c:	f9 03 00 aa	mov	x25, x0
   39a90:	f4 03 01 aa	mov	x20, x1
   39a94:	e0 03 15 aa	mov	x0, x21
   39a98:	e1 03 18 aa	mov	x1, x24
   39a9c:	ff 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39aa0:	5f 03 00 91	mov	sp, x26
   39aa4:	f4 52 00 b5	cbnz	x20, 0x3a500
   39aa8:	90 02 00 14	b	0x3a4e8
   39aac:	f5 03 00 aa	mov	x21, x0
   39ab0:	71 69 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   39ab4:	f4 03 00 aa	mov	x20, x0
   39ab8:	e0 03 15 aa	mov	x0, x21
   39abc:	29 6f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39ac0:	f5 03 14 aa	mov	x21, x20
   39ac4:	0e 70 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   39ac8:	e0 03 14 aa	mov	x0, x20
   39acc:	d9 6f 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   39ad0:	08 27 00 90	adrp	x8, 1248 ; 0x519000
   39ad4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   39ad8:	08 81 00 d1	sub	x8, x8, #0x20
   39adc:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   39ae0:	e0 03 17 aa	mov	x0, x23
   39ae4:	a8 63 05 d1	sub	x8, x29, #0x158
   39ae8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39aec:	eb 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39af0:	e0 03 1b aa	mov	x0, x27
   39af4:	e1 03 1c aa	mov	x1, x28
   39af8:	e8 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39afc:	a8 23 05 d1	sub	x8, x29, #0x148
   39b00:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39b04:	a8 43 05 d1	sub	x8, x29, #0x150
   39b08:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39b0c:	e3 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39b10:	a8 a3 04 d1	sub	x8, x29, #0x128
   39b14:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39b18:	a8 c3 04 d1	sub	x8, x29, #0x130
   39b1c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39b20:	de 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39b24:	a8 a3 02 d1	sub	x8, x29, #0xa8
   39b28:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39b2c:	a8 43 01 d1	sub	x8, x29, #0x50
   39b30:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39b34:	d9 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39b38:	a8 03 03 d1	sub	x8, x29, #0xc0
   39b3c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39b40:	08 6f 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39b44:	e0 03 16 aa	mov	x0, x22
   39b48:	a5 6f 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   39b4c:	a8 c3 01 d1	sub	x8, x29, #0x70
   39b50:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39b54:	13 05 40 f9	ldr	x19, [x8, #0x8]
   39b58:	a8 83 04 d1	sub	x8, x29, #0x120
   39b5c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39b60:	a8 a3 01 d1	sub	x8, x29, #0x68
   39b64:	15 01 50 f8	ldur	x21, [x8, #-0x100]
   39b68:	e1 03 15 aa	mov	x1, x21
   39b6c:	60 02 3f d6	blr	x19
   39b70:	a8 03 04 d1	sub	x8, x29, #0x100
   39b74:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39b78:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39b7c:	a9 c3 03 d1	sub	x9, x29, #0xf0
   39b80:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39b84:	a9 e3 03 d1	sub	x9, x29, #0xf8
   39b88:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39b8c:	00 01 3f d6	blr	x8
   39b90:	a8 83 03 d1	sub	x8, x29, #0xe0
   39b94:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39b98:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39b9c:	a9 43 04 d1	sub	x9, x29, #0x110
   39ba0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39ba4:	a9 63 03 d1	sub	x9, x29, #0xd8
   39ba8:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39bac:	00 01 3f d6	blr	x8
   39bb0:	a8 e3 02 d1	sub	x8, x29, #0xb8
   39bb4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39bb8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39bbc:	a9 83 02 d1	sub	x9, x29, #0xa0
   39bc0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39bc4:	a9 c3 02 d1	sub	x9, x29, #0xb0
   39bc8:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39bcc:	00 01 3f d6	blr	x8
   39bd0:	a8 63 02 d1	sub	x8, x29, #0x98
   39bd4:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39bd8:	08 05 40 f9	ldr	x8, [x8, #0x8]
   39bdc:	a9 03 02 d1	sub	x9, x29, #0x80
   39be0:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   39be4:	a9 23 02 d1	sub	x9, x29, #0x88
   39be8:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   39bec:	00 01 3f d6	blr	x8
   39bf0:	a8 83 01 d1	sub	x8, x29, #0x60
   39bf4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39bf8:	e1 03 15 aa	mov	x1, x21
   39bfc:	60 02 3f d6	blr	x19
   39c00:	a8 63 04 d1	sub	x8, x29, #0x118
   39c04:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39c08:	1f 01 00 91	mov	sp, x8
   39c0c:	a8 a3 03 d1	sub	x8, x29, #0xe8
   39c10:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39c14:	1f 01 00 91	mov	sp, x8
   39c18:	a8 23 03 d1	sub	x8, x29, #0xc8
   39c1c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39c20:	1f 01 00 91	mov	sp, x8
   39c24:	a8 43 03 d1	sub	x8, x29, #0xd0
   39c28:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39c2c:	1f 01 00 91	mov	sp, x8
   39c30:	a8 43 02 d1	sub	x8, x29, #0x90
   39c34:	88 f0 ff 17	b	0x35e54
   39c38:	60 38 00 90	adrp	x0, 1804 ; 0x745000
   39c3c:	00 20 08 91	add	x0, x0, #0x208
   39c40:	a1 ff ff f0	adrp	x1, -9 ; 0x30000
   39c44:	21 80 29 91	add	x1, x1, #0xa60
   39c48:	98 6f 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   39c4c:	e6 f0 ff 17	b	0x35fe4
   39c50:	e0 03 14 aa	mov	x0, x20
   39c54:	98 6f 13 94	bl	0x515ab4 ; symbol stub for: _swift_release
   39c58:	68 38 00 90	adrp	x8, 1804 ; 0x745000
   39c5c:	08 f5 40 f9	ldr	x8, [x8, #0x1e8]
   39c60:	1f 05 00 b1	cmn	x8, #0x1
   39c64:	c1 61 00 54	b.ne	0x3a89c
   39c68:	48 38 00 f0	adrp	x8, 1803 ; 0x744000
   39c6c:	08 21 39 91	add	x8, x8, #0xe48
   39c70:	00 05 40 a9	ldp	x0, x1, [x8]
   39c74:	a8 23 05 d1	sub	x8, x29, #0x148
   39c78:	02 01 50 f8	ldur	x2, [x8, #-0x100]
   39c7c:	a8 03 05 d1	sub	x8, x29, #0x140
   39c80:	03 01 50 f8	ldur	x3, [x8, #-0x100]
   39c84:	50 e4 ff 97	bl	_$s16AsideNativeSwift11installSave7account4dataSbSS_10Foundation4DataVtF
   39c88:	60 33 00 36	tbz	w0, #0x0, 0x3a2f4
   39c8c:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   39c90:	00 c0 12 91	add	x0, x0, #0x4b0
   39c94:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   39c98:	21 a0 1c 91	add	x1, x1, #0x728
   39c9c:	04 aa ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   39ca0:	01 1c 80 52	mov	w1, #0xe0
   39ca4:	e2 00 80 52	mov	w2, #0x7
   39ca8:	41 6f 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   39cac:	f5 03 00 aa	mov	x21, x0
   39cb0:	88 27 00 b0	adrp	x8, 1265 ; 0x52a000
   39cb4:	00 b9 c1 3d	ldr	q0, [x8, #0x6e0]
   39cb8:	00 04 80 3d	str	q0, [x0, #0x10]
   39cbc:	68 ae 8e d2	mov	x8, #0x7573
   39cc0:	68 6c ac f2	movk	x8, #0x6363, lsl #16
   39cc4:	a8 6c ce f2	movk	x8, #0x7365, lsl #32
   39cc8:	68 0e e0 f2	movk	x8, #0x73, lsl #48
   39ccc:	e9 03 00 aa	mov	x9, x0
   39cd0:	28 0d 02 f8	str	x8, [x9, #0x20]!
   39cd4:	a8 43 05 d1	sub	x8, x29, #0x150
   39cd8:	09 01 10 f8	stur	x9, [x8, #-0x100]
   39cdc:	09 e0 fc d2	mov	x9, #-0x1900000000000000
   39ce0:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   39ce4:	08 35 41 f9	ldr	x8, [x8, #0x268] ; literal pool symbol address: _$sSbN
   39ce8:	09 14 00 f9	str	x9, [x0, #0x28]
   39cec:	0b e0 fc d2	mov	x11, #-0x1900000000000000
   39cf0:	29 00 80 52	mov	w9, #0x1
   39cf4:	09 c0 00 39	strb	w9, [x0, #0x30]
   39cf8:	69 6e 8c d2	mov	x9, #0x6373
   39cfc:	09 ad ac f2	movk	x9, #0x6568, lsl #16
   39d00:	a9 ad cc f2	movk	x9, #0x656d, lsl #32
   39d04:	08 a4 04 a9	stp	x8, x9, [x0, #0x48]
   39d08:	08 c0 fc d2	mov	x8, #-0x1a00000000000000
   39d0c:	5b 37 00 f0	adrp	x27, 1771 ; 0x724000
   39d10:	7b 27 41 f9	ldr	x27, [x27, #0x248] ; literal pool symbol address: _$sSSN
   39d14:	09 2e 8e d2	mov	x9, #0x7170
   39d18:	e9 cb ae f2	movk	x9, #0x765f, lsl #16
   39d1c:	29 06 c0 f2	movk	x9, #0x31, lsl #32
   39d20:	08 a4 05 a9	stp	x8, x9, [x0, #0x58]
   39d24:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   39d28:	08 34 00 f9	str	x8, [x0, #0x68]
   39d2c:	68 2e 8d d2	mov	x8, #0x6973
   39d30:	e8 ec ab f2	movk	x8, #0x5f67, lsl #16
   39d34:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   39d38:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   39d3c:	1b a0 07 a9	stp	x27, x8, [x0, #0x78]
   39d40:	0b 44 00 f9	str	x11, [x0, #0x88]
   39d44:	00 00 80 d2	mov	x0, #0x0
   39d48:	dc 69 13 94	bl	0x5144b8 ; symbol stub for: _$s9CryptoKit7MLDSA65O9PublicKeyVMa
   39d4c:	f3 03 00 aa	mov	x19, x0
   39d50:	e8 03 00 91	mov	x8, sp
   39d54:	a9 63 05 d1	sub	x9, x29, #0x158
   39d58:	28 01 10 f8	stur	x8, [x9, #-0x100]
   39d5c:	1a 80 5f f8	ldur	x26, [x0, #-0x8]
   39d60:	48 23 40 f9	ldr	x8, [x26, #0x40]
   39d64:	e9 03 08 aa	mov	x9, x8
   39d68:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39d6c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   39d70:	00 02 3f d6	blr	x16
   39d74:	e9 03 00 91	mov	x9, sp
   39d78:	08 3d 00 91	add	x8, x8, #0xf
   39d7c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   39d80:	36 01 08 cb	sub	x22, x9, x8
   39d84:	df 02 00 91	mov	sp, x22
   39d88:	e8 03 16 aa	mov	x8, x22
   39d8c:	a9 e3 01 d1	sub	x9, x29, #0x78
   39d90:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   39d94:	57 69 13 94	bl	0x5142f0 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO7MLDSA65O10PrivateKeyV06publicG0AaDO06PublicG0Vvg
   39d98:	f4 03 16 aa	mov	x20, x22
   39d9c:	c4 69 13 94	bl	0x5144ac ; symbol stub for: _$s9CryptoKit7MLDSA65O9PublicKeyV17rawRepresentation10Foundation4DataVvg
   39da0:	f4 03 00 aa	mov	x20, x0
   39da4:	f9 03 01 aa	mov	x25, x1
   39da8:	48 07 40 f9	ldr	x8, [x26, #0x8]
   39dac:	e0 03 16 aa	mov	x0, x22
   39db0:	e1 03 13 aa	mov	x1, x19
   39db4:	00 01 3f d6	blr	x8
   39db8:	00 00 80 d2	mov	x0, #0x0
   39dbc:	e1 03 14 aa	mov	x1, x20
   39dc0:	e2 03 19 aa	mov	x2, x25
   39dc4:	e5 68 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   39dc8:	f3 03 00 aa	mov	x19, x0
   39dcc:	f6 03 01 aa	mov	x22, x1
   39dd0:	e0 03 14 aa	mov	x0, x20
   39dd4:	e1 03 19 aa	mov	x1, x25
   39dd8:	30 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39ddc:	a8 63 05 d1	sub	x8, x29, #0x158
   39de0:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39de4:	1f 01 00 91	mov	sp, x8
   39de8:	fa 03 00 91	mov	x26, sp
   39dec:	b3 5a 09 a9	stp	x19, x22, [x21, #0x90]
   39df0:	68 ad 8c d2	mov	x8, #0x656b
   39df4:	a8 ed ab f2	movk	x8, #0x5f6d, lsl #16
   39df8:	08 ae ce f2	movk	x8, #0x7570, lsl #32
   39dfc:	48 0c e0 f2	movk	x8, #0x62, lsl #48
   39e00:	bb a2 0a a9	stp	x27, x8, [x21, #0xa8]
   39e04:	08 e0 fc d2	mov	x8, #-0x1900000000000000
   39e08:	a8 5e 00 f9	str	x8, [x21, #0xb8]
   39e0c:	a8 a3 03 d1	sub	x8, x29, #0xe8
   39e10:	0c 01 50 f8	ldur	x12, [x8, #-0x100]
   39e14:	e9 03 0c aa	mov	x9, x12
   39e18:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39e1c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   39e20:	00 02 3f d6	blr	x16
   39e24:	e8 03 00 91	mov	x8, sp
   39e28:	89 3d 00 91	add	x9, x12, #0xf
   39e2c:	29 ed 7c 92	and	x9, x9, #0xfffffffffffffff0
   39e30:	13 01 09 cb	sub	x19, x8, x9
   39e34:	7f 02 00 91	mov	sp, x19
   39e38:	e8 03 13 aa	mov	x8, x19
   39e3c:	a9 63 02 d1	sub	x9, x29, #0x98
   39e40:	34 01 50 f8	ldur	x20, [x9, #-0x100]
   39e44:	3d 69 13 94	bl	0x514338 ; symbol stub for: _$s9CryptoKit13SecureEnclaveO8MLKEM768O10PrivateKeyV06publicG0AaDO06PublicG0Vvg
   39e48:	f4 03 13 aa	mov	x20, x19
   39e4c:	a1 69 13 94	bl	0x5144d0 ; symbol stub for: _$s9CryptoKit8MLKEM768O9PublicKeyV17rawRepresentation10Foundation4DataVvg
   39e50:	f4 03 00 aa	mov	x20, x0
   39e54:	f6 03 01 aa	mov	x22, x1
   39e58:	e0 03 13 aa	mov	x0, x19
   39e5c:	a8 43 04 d1	sub	x8, x29, #0x110
   39e60:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   39e64:	a8 63 04 d1	sub	x8, x29, #0x118
   39e68:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   39e6c:	00 01 3f d6	blr	x8
   39e70:	00 00 80 d2	mov	x0, #0x0
   39e74:	e1 03 14 aa	mov	x1, x20
   39e78:	e2 03 16 aa	mov	x2, x22
   39e7c:	b7 68 13 94	bl	0x514158 ; symbol stub for: _$s10Foundation4DataV19base64EncodedString7optionsSSSo27NSDataBase64EncodingOptionsV_tF
   39e80:	f3 03 00 aa	mov	x19, x0
   39e84:	f9 03 01 aa	mov	x25, x1
   39e88:	e0 03 14 aa	mov	x0, x20
   39e8c:	e1 03 16 aa	mov	x1, x22
   39e90:	02 4e 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39e94:	5f 03 00 91	mov	sp, x26
   39e98:	bb 6e 00 f9	str	x27, [x21, #0xd8]
   39e9c:	b3 66 0c a9	stp	x19, x25, [x21, #0xc0]
   39ea0:	e0 03 15 aa	mov	x0, x21
   39ea4:	1c 4e 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   39ea8:	f3 03 00 aa	mov	x19, x0
   39eac:	e0 03 15 aa	mov	x0, x21
   39eb0:	0a 6f 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   39eb4:	40 38 00 90	adrp	x0, 1800 ; 0x741000
   39eb8:	00 e0 12 91	add	x0, x0, #0x4b8
   39ebc:	81 27 00 b0	adrp	x1, 1265 ; 0x52a000
   39ec0:	21 c0 1c 91	add	x1, x1, #0x730
   39ec4:	7a a9 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   39ec8:	e2 03 00 aa	mov	x2, x0
   39ecc:	a8 43 05 d1	sub	x8, x29, #0x150
   39ed0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39ed4:	81 00 80 52	mov	w1, #0x4
   39ed8:	b8 6e 13 94	bl	0x5159b8 ; symbol stub for: _swift_arrayDestroy
   39edc:	e0 03 15 aa	mov	x0, x21
   39ee0:	01 04 80 52	mov	w1, #0x20
   39ee4:	e2 00 80 52	mov	w2, #0x7
   39ee8:	c9 6e 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   39eec:	48 38 00 90	adrp	x8, 1800 ; 0x741000
   39ef0:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   39ef4:	18 6e 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   39ef8:	f4 03 00 aa	mov	x20, x0
   39efc:	48 37 00 f0	adrp	x8, 1771 ; 0x724000
   39f00:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   39f04:	43 37 00 f0	adrp	x3, 1771 ; 0x724000
   39f08:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   39f0c:	02 21 00 91	add	x2, x8, #0x8
   39f10:	e0 03 13 aa	mov	x0, x19
   39f14:	e1 03 1b aa	mov	x1, x27
   39f18:	74 69 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   39f1c:	f5 03 00 aa	mov	x21, x0
   39f20:	a8 83 00 d1	sub	x8, x29, #0x20
   39f24:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   39f28:	a4 83 04 d1	sub	x4, x29, #0x120
   39f2c:	e0 03 14 aa	mov	x0, x20
   39f30:	e2 03 15 aa	mov	x2, x21
   39f34:	03 00 80 d2	mov	x3, #0x0
   39f38:	5a 75 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   39f3c:	fd 03 1d aa	mov	x29, x29
   39f40:	0e 6e 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   39f44:	f4 03 00 aa	mov	x20, x0
   39f48:	e0 03 15 aa	mov	x0, x21
   39f4c:	05 6e 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39f50:	a8 83 00 d1	sub	x8, x29, #0x20
   39f54:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   39f58:	05 6e 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   39f5c:	34 39 00 b4	cbz	x20, 0x3a680
   39f60:	e0 03 14 aa	mov	x0, x20
   39f64:	80 68 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   39f68:	f5 03 00 aa	mov	x21, x0
   39f6c:	f6 03 01 aa	mov	x22, x1
   39f70:	e0 03 14 aa	mov	x0, x20
   39f74:	fb 6d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39f78:	00 00 80 d2	mov	x0, #0x0
   39f7c:	73 69 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   39f80:	fa 03 00 91	mov	x26, sp
   39f84:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   39f88:	08 21 40 f9	ldr	x8, [x8, #0x40]
   39f8c:	e9 03 08 aa	mov	x9, x8
   39f90:	50 37 00 f0	adrp	x16, 1771 ; 0x724000
   39f94:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   39f98:	00 02 3f d6	blr	x16
   39f9c:	e9 03 00 91	mov	x9, sp
   39fa0:	08 3d 00 91	add	x8, x8, #0xf
   39fa4:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   39fa8:	34 01 08 cb	sub	x20, x9, x8
   39fac:	9f 02 00 91	mov	sp, x20
   39fb0:	e8 03 14 aa	mov	x8, x20
   39fb4:	62 69 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   39fb8:	e0 03 15 aa	mov	x0, x21
   39fbc:	e1 03 16 aa	mov	x1, x22
   39fc0:	e2 03 14 aa	mov	x2, x20
   39fc4:	5b 69 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   39fc8:	f9 03 00 aa	mov	x25, x0
   39fcc:	f4 03 01 aa	mov	x20, x1
   39fd0:	e0 03 15 aa	mov	x0, x21
   39fd4:	e1 03 16 aa	mov	x1, x22
   39fd8:	b0 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   39fdc:	5f 03 00 91	mov	sp, x26
   39fe0:	f4 36 00 b5	cbnz	x20, 0x3a6bc
   39fe4:	b0 01 00 14	b	0x3a6a4
   39fe8:	f5 03 00 aa	mov	x21, x0
   39fec:	22 68 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   39ff0:	f4 03 00 aa	mov	x20, x0
   39ff4:	e0 03 15 aa	mov	x0, x21
   39ff8:	da 6d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   39ffc:	f5 03 14 aa	mov	x21, x20
   3a000:	bf 6e 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3a004:	e0 03 14 aa	mov	x0, x20
   3a008:	8a 6e 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3a00c:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a010:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3a014:	08 81 00 d1	sub	x8, x8, #0x20
   3a018:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3a01c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3a020:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a024:	a8 43 01 d1	sub	x8, x29, #0x50
   3a028:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a02c:	9b 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a030:	a8 c3 04 d1	sub	x8, x29, #0x130
   3a034:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a038:	a8 e3 04 d1	sub	x8, x29, #0x138
   3a03c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a040:	96 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a044:	e0 03 17 aa	mov	x0, x23
   3a048:	e1 03 18 aa	mov	x1, x24
   3a04c:	93 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a050:	e0 03 1c aa	mov	x0, x28
   3a054:	a8 83 04 d1	sub	x8, x29, #0x120
   3a058:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a05c:	8f 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a060:	a8 23 04 d1	sub	x8, x29, #0x108
   3a064:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a068:	a8 03 04 d1	sub	x8, x29, #0x100
   3a06c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a070:	8a 4d 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a074:	a8 e3 02 d1	sub	x8, x29, #0xb8
   3a078:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a07c:	b9 6d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a080:	e0 03 1b aa	mov	x0, x27
   3a084:	56 6e 13 94	bl	0x5159dc ; symbol stub for: _swift_bridgeObjectRelease
   3a088:	a8 83 03 d1	sub	x8, x29, #0xe0
   3a08c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a090:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3a094:	a9 43 03 d1	sub	x9, x29, #0xd0
   3a098:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   3a09c:	a9 63 03 d1	sub	x9, x29, #0xd8
   3a0a0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   3a0a4:	00 01 3f d6	blr	x8
   3a0a8:	a8 c3 02 d1	sub	x8, x29, #0xb0
   3a0ac:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a0b0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3a0b4:	a9 63 02 d1	sub	x9, x29, #0x98
   3a0b8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   3a0bc:	a9 03 03 d1	sub	x9, x29, #0xc0
   3a0c0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   3a0c4:	00 01 3f d6	blr	x8
   3a0c8:	a8 23 02 d1	sub	x8, x29, #0x88
   3a0cc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a0d0:	08 05 40 f9	ldr	x8, [x8, #0x8]
   3a0d4:	a9 e3 01 d1	sub	x9, x29, #0x78
   3a0d8:	20 01 50 f8	ldur	x0, [x9, #-0x100]
   3a0dc:	a9 43 02 d1	sub	x9, x29, #0x90
   3a0e0:	21 01 50 f8	ldur	x1, [x9, #-0x100]
   3a0e4:	00 01 3f d6	blr	x8
   3a0e8:	a8 83 01 d1	sub	x8, x29, #0x60
   3a0ec:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a0f0:	a8 a3 01 d1	sub	x8, x29, #0x68
   3a0f4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a0f8:	a8 c3 01 d1	sub	x8, x29, #0x70
   3a0fc:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a100:	00 01 3f d6	blr	x8
   3a104:	a8 c3 03 d1	sub	x8, x29, #0xf0
   3a108:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a10c:	1f 01 00 91	mov	sp, x8
   3a110:	a8 e3 03 d1	sub	x8, x29, #0xf8
   3a114:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a118:	1f 01 00 91	mov	sp, x8
   3a11c:	a8 23 03 d1	sub	x8, x29, #0xc8
   3a120:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a124:	1f 01 00 91	mov	sp, x8
   3a128:	a8 83 02 d1	sub	x8, x29, #0xa0
   3a12c:	08 01 50 f8	ldur	x8, [x8, #-0x100]
   3a130:	1f 01 00 91	mov	sp, x8
   3a134:	f2 f8 ff 17	b	0x384fc
   3a138:	b9 04 80 d2	mov	x25, #0x25
   3a13c:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3a140:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a144:	08 c1 3a 91	add	x8, x8, #0xeb0 ; literal pool for: "Failed to store install metadata"
   3a148:	08 81 00 d1	sub	x8, x8, #0x20
   3a14c:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3a150:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3a154:	00 c0 12 91	add	x0, x0, #0x4b0
   3a158:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3a15c:	21 a0 1c 91	add	x1, x1, #0x728
   3a160:	d3 a8 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3a164:	01 0a 80 52	mov	w1, #0x50
   3a168:	e2 00 80 52	mov	w2, #0x7
   3a16c:	10 6e 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3a170:	f4 03 00 aa	mov	x20, x0
   3a174:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3a178:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3a17c:	00 04 80 3d	str	q0, [x0, #0x10]
   3a180:	a8 4c 8e d2	mov	x8, #0x7265
   3a184:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3a188:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3a18c:	f5 03 00 aa	mov	x21, x0
   3a190:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   3a194:	58 37 00 d0	adrp	x24, 1770 ; 0x724000
   3a198:	18 27 41 f9	ldr	x24, [x24, #0x248] ; literal pool symbol address: _$sSSN
   3a19c:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3a1a0:	18 24 00 f9	str	x24, [x0, #0x48]
   3a1a4:	29 17 00 d1	sub	x9, x25, #0x5
   3a1a8:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3a1ac:	13 1c 00 f9	str	x19, [x0, #0x38]
   3a1b0:	59 4d 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3a1b4:	f3 03 00 aa	mov	x19, x0
   3a1b8:	e0 03 14 aa	mov	x0, x20
   3a1bc:	47 6e 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3a1c0:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3a1c4:	21 e0 12 91	add	x1, x1, #0x4b8
   3a1c8:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3a1cc:	42 c0 1c 91	add	x2, x2, #0x730
   3a1d0:	e0 03 15 aa	mov	x0, x21
   3a1d4:	0f 56 00 94	bl	_$sypSgWOhTm
   3a1d8:	e0 03 14 aa	mov	x0, x20
   3a1dc:	01 04 80 52	mov	w1, #0x20
   3a1e0:	e2 00 80 52	mov	w2, #0x7
   3a1e4:	0a 6e 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3a1e8:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3a1ec:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3a1f0:	59 6d 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3a1f4:	f4 03 00 aa	mov	x20, x0
   3a1f8:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3a1fc:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3a200:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3a204:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3a208:	02 21 00 91	add	x2, x8, #0x8
   3a20c:	a8 23 04 d1	sub	x8, x29, #0x108
   3a210:	13 01 10 f8	stur	x19, [x8, #-0x100]
   3a214:	e0 03 13 aa	mov	x0, x19
   3a218:	e1 03 18 aa	mov	x1, x24
   3a21c:	b3 68 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3a220:	f5 03 00 aa	mov	x21, x0
   3a224:	a8 83 00 d1	sub	x8, x29, #0x20
   3a228:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   3a22c:	a4 83 04 d1	sub	x4, x29, #0x120
   3a230:	e0 03 14 aa	mov	x0, x20
   3a234:	e2 03 15 aa	mov	x2, x21
   3a238:	03 00 80 d2	mov	x3, #0x0
   3a23c:	99 74 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3a240:	fd 03 1d aa	mov	x29, x29
   3a244:	4d 6d 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3a248:	f4 03 00 aa	mov	x20, x0
   3a24c:	e0 03 15 aa	mov	x0, x21
   3a250:	44 6d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a254:	a8 83 00 d1	sub	x8, x29, #0x20
   3a258:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a25c:	44 6d 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3a260:	14 19 00 b4	cbz	x20, 0x3a580
   3a264:	e0 03 14 aa	mov	x0, x20
   3a268:	bf 67 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3a26c:	f8 03 00 aa	mov	x24, x0
   3a270:	fa 03 01 aa	mov	x26, x1
   3a274:	e0 03 14 aa	mov	x0, x20
   3a278:	3a 6d 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a27c:	00 00 80 d2	mov	x0, #0x0
   3a280:	b2 68 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3a284:	f3 03 00 91	mov	x19, sp
   3a288:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3a28c:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3a290:	e9 03 08 aa	mov	x9, x8
   3a294:	50 37 00 d0	adrp	x16, 1770 ; 0x724000
   3a298:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3a29c:	00 02 3f d6	blr	x16
   3a2a0:	e9 03 00 91	mov	x9, sp
   3a2a4:	08 3d 00 91	add	x8, x8, #0xf
   3a2a8:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3a2ac:	34 01 08 cb	sub	x20, x9, x8
   3a2b0:	9f 02 00 91	mov	sp, x20
   3a2b4:	e8 03 14 aa	mov	x8, x20
   3a2b8:	a1 68 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3a2bc:	e0 03 18 aa	mov	x0, x24
   3a2c0:	e1 03 1a aa	mov	x1, x26
   3a2c4:	e2 03 14 aa	mov	x2, x20
   3a2c8:	9a 68 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3a2cc:	f5 03 00 aa	mov	x21, x0
   3a2d0:	f4 03 01 aa	mov	x20, x1
   3a2d4:	e0 03 18 aa	mov	x0, x24
   3a2d8:	e1 03 1a aa	mov	x1, x26
   3a2dc:	ef 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a2e0:	7f 02 00 91	mov	sp, x19
   3a2e4:	14 16 00 b4	cbz	x20, 0x3a5a4
   3a2e8:	f9 03 15 aa	mov	x25, x21
   3a2ec:	b2 00 00 14	b	0x3a5b4
   3a2f0:	05 6c 13 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
   3a2f4:	b9 04 80 d2	mov	x25, #0x25
   3a2f8:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3a2fc:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a300:	08 c1 3a 91	add	x8, x8, #0xeb0 ; literal pool for: "Failed to store install metadata"
   3a304:	08 81 00 d1	sub	x8, x8, #0x20
   3a308:	13 01 41 b2	orr	x19, x8, #0x8000000000000000
   3a30c:	20 38 00 f0	adrp	x0, 1799 ; 0x741000
   3a310:	00 c0 12 91	add	x0, x0, #0x4b0
   3a314:	81 27 00 90	adrp	x1, 1264 ; 0x52a000
   3a318:	21 a0 1c 91	add	x1, x1, #0x728
   3a31c:	64 a8 ff 97	bl	___swift_instantiateConcreteTypeFromMangledNameV2
   3a320:	01 0a 80 52	mov	w1, #0x50
   3a324:	e2 00 80 52	mov	w2, #0x7
   3a328:	a1 6d 13 94	bl	0x5159ac ; symbol stub for: _swift_allocObject
   3a32c:	f4 03 00 aa	mov	x20, x0
   3a330:	88 27 00 90	adrp	x8, 1264 ; 0x52a000
   3a334:	00 a5 c1 3d	ldr	q0, [x8, #0x690]
   3a338:	00 04 80 3d	str	q0, [x0, #0x10]
   3a33c:	a8 4c 8e d2	mov	x8, #0x7265
   3a340:	48 ee ad f2	movk	x8, #0x6f72, lsl #16
   3a344:	48 0e c0 f2	movk	x8, #0x72, lsl #32
   3a348:	f5 03 00 aa	mov	x21, x0
   3a34c:	a8 0e 02 f8	str	x8, [x21, #0x20]!
   3a350:	56 37 00 d0	adrp	x22, 1770 ; 0x724000
   3a354:	d6 26 41 f9	ldr	x22, [x22, #0x248] ; literal pool symbol address: _$sSSN
   3a358:	08 a0 fc d2	mov	x8, #-0x1b00000000000000
   3a35c:	16 24 00 f9	str	x22, [x0, #0x48]
   3a360:	29 17 00 d1	sub	x9, x25, #0x5
   3a364:	08 a4 02 a9	stp	x8, x9, [x0, #0x28]
   3a368:	13 1c 00 f9	str	x19, [x0, #0x38]
   3a36c:	ea 4c 00 94	bl	_$sSD17dictionaryLiteralSDyxq_Gx_q_td_tcfCSS_ypTt0g5Tf4g_n
   3a370:	f3 03 00 aa	mov	x19, x0
   3a374:	e0 03 14 aa	mov	x0, x20
   3a378:	d8 6d 13 94	bl	0x515ad8 ; symbol stub for: _swift_setDeallocating
   3a37c:	21 38 00 f0	adrp	x1, 1799 ; 0x741000
   3a380:	21 e0 12 91	add	x1, x1, #0x4b8
   3a384:	82 27 00 90	adrp	x2, 1264 ; 0x52a000
   3a388:	42 c0 1c 91	add	x2, x2, #0x730
   3a38c:	e0 03 15 aa	mov	x0, x21
   3a390:	a0 55 00 94	bl	_$sypSgWOhTm
   3a394:	e0 03 14 aa	mov	x0, x20
   3a398:	01 04 80 52	mov	w1, #0x20
   3a39c:	e2 00 80 52	mov	w2, #0x7
   3a3a0:	9b 6d 13 94	bl	0x515a0c ; symbol stub for: _swift_deallocClassInstance
   3a3a4:	28 38 00 f0	adrp	x8, 1799 ; 0x741000
   3a3a8:	00 ed 41 f9	ldr	x0, [x8, #0x3d8] ; Objc class ref: _OBJC_CLASS_$_NSJSONSerialization
   3a3ac:	ea 6c 13 94	bl	0x515754 ; symbol stub for: _objc_opt_self
   3a3b0:	f4 03 00 aa	mov	x20, x0
   3a3b4:	48 37 00 d0	adrp	x8, 1770 ; 0x724000
   3a3b8:	08 69 41 f9	ldr	x8, [x8, #0x2d0] ; literal pool symbol address: _$sypN
   3a3bc:	43 37 00 d0	adrp	x3, 1770 ; 0x724000
   3a3c0:	63 28 41 f9	ldr	x3, [x3, #0x250] ; literal pool symbol address: _$sSSSHsWP
   3a3c4:	02 21 00 91	add	x2, x8, #0x8
   3a3c8:	a8 a3 03 d1	sub	x8, x29, #0xe8
   3a3cc:	13 01 10 f8	stur	x19, [x8, #-0x100]
   3a3d0:	e0 03 13 aa	mov	x0, x19
   3a3d4:	e1 03 16 aa	mov	x1, x22
   3a3d8:	44 68 13 94	bl	0x5144e8 ; symbol stub for: _$sSD10FoundationE19_bridgeToObjectiveCSo12NSDictionaryCyF
   3a3dc:	f5 03 00 aa	mov	x21, x0
   3a3e0:	a8 83 00 d1	sub	x8, x29, #0x20
   3a3e4:	1f 01 10 f8	stur	xzr, [x8, #-0x100]
   3a3e8:	a4 83 04 d1	sub	x4, x29, #0x120
   3a3ec:	e0 03 14 aa	mov	x0, x20
   3a3f0:	e2 03 15 aa	mov	x2, x21
   3a3f4:	03 00 80 d2	mov	x3, #0x0
   3a3f8:	2a 74 13 94	bl	"_objc_msgSend$dataWithJSONObject:options:error:"
   3a3fc:	fd 03 1d aa	mov	x29, x29
   3a400:	de 6c 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   3a404:	f4 03 00 aa	mov	x20, x0
   3a408:	e0 03 15 aa	mov	x0, x21
   3a40c:	d5 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a410:	a8 83 00 d1	sub	x8, x29, #0x20
   3a414:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a418:	d5 6c 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   3a41c:	14 19 00 b4	cbz	x20, 0x3a73c
   3a420:	e0 03 14 aa	mov	x0, x20
   3a424:	50 67 13 94	bl	0x514164 ; symbol stub for: _$s10Foundation4DataV36_unconditionallyBridgeFromObjectiveCyACSo6NSDataCSgFZ
   3a428:	f6 03 00 aa	mov	x22, x0
   3a42c:	fa 03 01 aa	mov	x26, x1
   3a430:	e0 03 14 aa	mov	x0, x20
   3a434:	cb 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a438:	00 00 80 d2	mov	x0, #0x0
   3a43c:	43 68 13 94	bl	0x514548 ; symbol stub for: _$sSS10FoundationE8EncodingVMa
   3a440:	f3 03 00 91	mov	x19, sp
   3a444:	08 80 5f f8	ldur	x8, [x0, #-0x8]
   3a448:	08 21 40 f9	ldr	x8, [x8, #0x40]
   3a44c:	e9 03 08 aa	mov	x9, x8
   3a450:	50 37 00 d0	adrp	x16, 1770 ; 0x724000
   3a454:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   3a458:	00 02 3f d6	blr	x16
   3a45c:	e9 03 00 91	mov	x9, sp
   3a460:	08 3d 00 91	add	x8, x8, #0xf
   3a464:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   3a468:	34 01 08 cb	sub	x20, x9, x8
   3a46c:	9f 02 00 91	mov	sp, x20
   3a470:	e8 03 14 aa	mov	x8, x20
   3a474:	32 68 13 94	bl	0x51453c ; symbol stub for: _$sSS10FoundationE8EncodingV4utf8ACvgZ
   3a478:	e0 03 16 aa	mov	x0, x22
   3a47c:	e1 03 1a aa	mov	x1, x26
   3a480:	e2 03 14 aa	mov	x2, x20
   3a484:	2b 68 13 94	bl	0x514530 ; symbol stub for: _$sSS10FoundationE4data8encodingSSSgAA4DataVh_SSAAE8EncodingVtcfC
   3a488:	f5 03 00 aa	mov	x21, x0
   3a48c:	f4 03 01 aa	mov	x20, x1
   3a490:	e0 03 16 aa	mov	x0, x22
   3a494:	e1 03 1a aa	mov	x1, x26
   3a498:	80 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a49c:	7f 02 00 91	mov	sp, x19
   3a4a0:	14 16 00 b4	cbz	x20, 0x3a760
   3a4a4:	f9 03 15 aa	mov	x25, x21
   3a4a8:	b2 00 00 14	b	0x3a770
   3a4ac:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a4b0:	00 c0 07 91	add	x0, x0, #0x1f0
   3a4b4:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a4b8:	21 90 21 91	add	x1, x1, #0x864
   3a4bc:	7b 6d 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a4c0:	e7 f0 ff 17	b	0x3685c
   3a4c4:	f5 03 00 aa	mov	x21, x0
   3a4c8:	eb 66 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3a4cc:	f4 03 00 aa	mov	x20, x0
   3a4d0:	e0 03 15 aa	mov	x0, x21
   3a4d4:	a3 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a4d8:	f5 03 14 aa	mov	x21, x20
   3a4dc:	88 6d 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3a4e0:	e0 03 14 aa	mov	x0, x20
   3a4e4:	53 6d 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3a4e8:	b9 04 80 d2	mov	x25, #0x25
   3a4ec:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3a4f0:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a4f4:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3a4f8:	08 81 00 d1	sub	x8, x8, #0x20
   3a4fc:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3a500:	a8 a3 05 d1	sub	x8, x29, #0x168
   3a504:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a508:	a8 83 05 d1	sub	x8, x29, #0x160
   3a50c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a510:	62 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a514:	e0 03 17 aa	mov	x0, x23
   3a518:	a8 63 05 d1	sub	x8, x29, #0x158
   3a51c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a520:	5e 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a524:	e0 03 1b aa	mov	x0, x27
   3a528:	e1 03 1c aa	mov	x1, x28
   3a52c:	5b 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a530:	a8 23 05 d1	sub	x8, x29, #0x148
   3a534:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a538:	a8 43 05 d1	sub	x8, x29, #0x150
   3a53c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a540:	56 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a544:	a8 a3 04 d1	sub	x8, x29, #0x128
   3a548:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a54c:	a8 c3 04 d1	sub	x8, x29, #0x130
   3a550:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a554:	51 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a558:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3a55c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a560:	a8 43 01 d1	sub	x8, x29, #0x50
   3a564:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a568:	4c 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a56c:	a8 03 03 d1	sub	x8, x29, #0xc0
   3a570:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a574:	7b 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a578:	e0 03 13 aa	mov	x0, x19
   3a57c:	73 fd ff 17	b	0x39b48
   3a580:	f5 03 00 aa	mov	x21, x0
   3a584:	bc 66 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3a588:	f4 03 00 aa	mov	x20, x0
   3a58c:	e0 03 15 aa	mov	x0, x21
   3a590:	74 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a594:	f5 03 14 aa	mov	x21, x20
   3a598:	59 6d 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3a59c:	e0 03 14 aa	mov	x0, x20
   3a5a0:	24 6d 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3a5a4:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a5a8:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3a5ac:	08 81 00 d1	sub	x8, x8, #0x20
   3a5b0:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3a5b4:	a8 a3 05 d1	sub	x8, x29, #0x168
   3a5b8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a5bc:	a8 83 05 d1	sub	x8, x29, #0x160
   3a5c0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a5c4:	35 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a5c8:	e0 03 17 aa	mov	x0, x23
   3a5cc:	a8 63 05 d1	sub	x8, x29, #0x158
   3a5d0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a5d4:	31 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a5d8:	e0 03 1b aa	mov	x0, x27
   3a5dc:	e1 03 1c aa	mov	x1, x28
   3a5e0:	2e 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a5e4:	a8 23 05 d1	sub	x8, x29, #0x148
   3a5e8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a5ec:	a8 43 05 d1	sub	x8, x29, #0x150
   3a5f0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a5f4:	29 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a5f8:	a8 a3 04 d1	sub	x8, x29, #0x128
   3a5fc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a600:	a8 c3 04 d1	sub	x8, x29, #0x130
   3a604:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a608:	24 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a60c:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3a610:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a614:	a8 43 01 d1	sub	x8, x29, #0x50
   3a618:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a61c:	1f 4c 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a620:	a8 03 03 d1	sub	x8, x29, #0xc0
   3a624:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a628:	4e 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a62c:	a8 23 04 d1	sub	x8, x29, #0x108
   3a630:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a634:	45 fd ff 17	b	0x39b48
   3a638:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a63c:	00 e0 07 91	add	x0, x0, #0x1f8
   3a640:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a644:	21 40 23 91	add	x1, x1, #0x8d0
   3a648:	18 6d 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a64c:	9e f0 ff 17	b	0x368c4
   3a650:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a654:	00 c0 07 91	add	x0, x0, #0x1f0
   3a658:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a65c:	21 90 21 91	add	x1, x1, #0x864
   3a660:	12 6d 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a664:	30 f1 ff 17	b	0x36b24
   3a668:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a66c:	00 00 08 91	add	x0, x0, #0x200
   3a670:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a674:	21 f0 24 91	add	x1, x1, #0x93c
   3a678:	0c 6d 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a67c:	c4 f1 ff 17	b	0x36d8c
   3a680:	f5 03 00 aa	mov	x21, x0
   3a684:	7c 66 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3a688:	f4 03 00 aa	mov	x20, x0
   3a68c:	e0 03 15 aa	mov	x0, x21
   3a690:	34 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a694:	f5 03 14 aa	mov	x21, x20
   3a698:	19 6d 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3a69c:	e0 03 14 aa	mov	x0, x20
   3a6a0:	e4 6c 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3a6a4:	b9 04 80 d2	mov	x25, #0x25
   3a6a8:	19 00 fa f2	movk	x25, #0xd000, lsl #48
   3a6ac:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a6b0:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3a6b4:	08 81 00 d1	sub	x8, x8, #0x20
   3a6b8:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3a6bc:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3a6c0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a6c4:	a8 43 01 d1	sub	x8, x29, #0x50
   3a6c8:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a6cc:	f3 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a6d0:	a8 23 05 d1	sub	x8, x29, #0x148
   3a6d4:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a6d8:	a8 03 05 d1	sub	x8, x29, #0x140
   3a6dc:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a6e0:	ee 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a6e4:	a8 c3 04 d1	sub	x8, x29, #0x130
   3a6e8:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a6ec:	a8 e3 04 d1	sub	x8, x29, #0x138
   3a6f0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a6f4:	e9 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a6f8:	e0 03 17 aa	mov	x0, x23
   3a6fc:	e1 03 18 aa	mov	x1, x24
   3a700:	e6 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a704:	e0 03 1c aa	mov	x0, x28
   3a708:	a8 83 04 d1	sub	x8, x29, #0x120
   3a70c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a710:	e2 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a714:	a8 23 04 d1	sub	x8, x29, #0x108
   3a718:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a71c:	a8 03 04 d1	sub	x8, x29, #0x100
   3a720:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a724:	dd 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a728:	a8 e3 02 d1	sub	x8, x29, #0xb8
   3a72c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a730:	0c 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a734:	e0 03 13 aa	mov	x0, x19
   3a738:	53 fe ff 17	b	0x3a084
   3a73c:	f5 03 00 aa	mov	x21, x0
   3a740:	4d 66 13 94	bl	0x514074 ; symbol stub for: _$s10Foundation22_convertNSErrorToErrorys0E0_pSo0C0CSgF
   3a744:	f4 03 00 aa	mov	x20, x0
   3a748:	e0 03 15 aa	mov	x0, x21
   3a74c:	05 6c 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a750:	f5 03 14 aa	mov	x21, x20
   3a754:	ea 6c 13 94	bl	0x515afc ; symbol stub for: _swift_willThrow
   3a758:	e0 03 14 aa	mov	x0, x20
   3a75c:	b5 6c 13 94	bl	0x515a30 ; symbol stub for: _swift_errorRelease
   3a760:	e8 26 00 f0	adrp	x8, 1247 ; 0x519000
   3a764:	08 81 1e 91	add	x8, x8, #0x7a0 ; literal pool for: "{\"error\":\"JSON serialization failed\"}"
   3a768:	08 81 00 d1	sub	x8, x8, #0x20
   3a76c:	14 01 41 b2	orr	x20, x8, #0x8000000000000000
   3a770:	a8 a3 02 d1	sub	x8, x29, #0xa8
   3a774:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a778:	a8 43 01 d1	sub	x8, x29, #0x50
   3a77c:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a780:	c6 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a784:	a8 23 05 d1	sub	x8, x29, #0x148
   3a788:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a78c:	a8 03 05 d1	sub	x8, x29, #0x140
   3a790:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a794:	c1 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a798:	a8 c3 04 d1	sub	x8, x29, #0x130
   3a79c:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a7a0:	a8 e3 04 d1	sub	x8, x29, #0x138
   3a7a4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a7a8:	bc 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a7ac:	e0 03 17 aa	mov	x0, x23
   3a7b0:	e1 03 18 aa	mov	x1, x24
   3a7b4:	b9 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a7b8:	e0 03 1c aa	mov	x0, x28
   3a7bc:	a8 83 04 d1	sub	x8, x29, #0x120
   3a7c0:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a7c4:	b5 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a7c8:	a8 23 04 d1	sub	x8, x29, #0x108
   3a7cc:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a7d0:	a8 03 04 d1	sub	x8, x29, #0x100
   3a7d4:	01 01 50 f8	ldur	x1, [x8, #-0x100]
   3a7d8:	b0 4b 00 94	bl	_$s10Foundation4DataV15_RepresentationOWOe
   3a7dc:	a8 e3 02 d1	sub	x8, x29, #0xb8
   3a7e0:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a7e4:	df 6b 13 94	bl	0x515760 ; symbol stub for: _objc_release
   3a7e8:	a8 a3 03 d1	sub	x8, x29, #0xe8
   3a7ec:	00 01 50 f8	ldur	x0, [x8, #-0x100]
   3a7f0:	25 fe ff 17	b	0x3a084
   3a7f4:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a7f8:	00 e0 07 91	add	x0, x0, #0x1f8
   3a7fc:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a800:	21 40 23 91	add	x1, x1, #0x8d0
   3a804:	a9 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a808:	df f0 ff 17	b	0x36b84
   3a80c:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a810:	00 20 08 91	add	x0, x0, #0x208
   3a814:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a818:	21 80 29 91	add	x1, x1, #0xa60
   3a81c:	a3 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a820:	40 f4 ff 17	b	0x37920
   3a824:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a828:	00 a0 07 91	add	x0, x0, #0x1e8
   3a82c:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a830:	21 e0 1f 91	add	x1, x1, #0x7f8
   3a834:	9d 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a838:	d0 f4 ff 17	b	0x37b78
   3a83c:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a840:	00 20 08 91	add	x0, x0, #0x208
   3a844:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a848:	21 80 29 91	add	x1, x1, #0xa60
   3a84c:	97 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a850:	b6 f6 ff 17	b	0x38328
   3a854:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a858:	00 00 08 91	add	x0, x0, #0x200
   3a85c:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a860:	21 f0 24 91	add	x1, x1, #0x93c
   3a864:	91 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a868:	01 fa ff 17	b	0x3906c
   3a86c:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a870:	00 00 08 91	add	x0, x0, #0x200
   3a874:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a878:	21 f0 24 91	add	x1, x1, #0x93c
   3a87c:	8b 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a880:	70 fa ff 17	b	0x39240
   3a884:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a888:	00 a0 07 91	add	x0, x0, #0x1e8
   3a88c:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a890:	21 e0 1f 91	add	x1, x1, #0x7f8
   3a894:	85 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a898:	a5 fb ff 17	b	0x3972c
   3a89c:	40 38 00 f0	adrp	x0, 1803 ; 0x745000
   3a8a0:	00 a0 07 91	add	x0, x0, #0x1e8
   3a8a4:	a1 ff ff d0	adrp	x1, -10 ; 0x30000
   3a8a8:	21 e0 1f 91	add	x1, x1, #0x7f8
   3a8ac:	7f 6c 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   3a8b0:	ee fc ff 17	b	0x39c68
