/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift18openAppDisplayName33_4DF3DD086191C68B6697891E23221139LL3forSS10Foundation3URLV_tF:
   44edc:	fc 6f ba a9	stp	x28, x27, [sp, #-0x60]!
   44ee0:	fa 67 01 a9	stp	x26, x25, [sp, #0x10]
   44ee4:	f8 5f 02 a9	stp	x24, x23, [sp, #0x20]
   44ee8:	f6 57 03 a9	stp	x22, x21, [sp, #0x30]
   44eec:	f4 4f 04 a9	stp	x20, x19, [sp, #0x40]
   44ef0:	fd 7b 05 a9	stp	x29, x30, [sp, #0x50]
   44ef4:	fd 43 01 91	add	x29, sp, #0x50
   44ef8:	ff 03 01 d1	sub	sp, sp, #0x40
   44efc:	f4 03 00 aa	mov	x20, x0
   44f00:	00 00 80 d2	mov	x0, #0x0
   44f04:	7d 3c 13 94	bl	0x5140f8 ; symbol stub for: _$s10Foundation3URLVMa
   44f08:	f3 03 00 aa	mov	x19, x0
   44f0c:	1a 80 5f f8	ldur	x26, [x0, #-0x8]
   44f10:	48 23 40 f9	ldr	x8, [x26, #0x40]
   44f14:	e9 03 08 aa	mov	x9, x8
   44f18:	10 37 00 90	adrp	x16, 1760 ; 0x724000
   44f1c:	10 fa 40 f9	ldr	x16, [x16, #0x1f0] ; literal pool symbol address: ___chkstk_darwin
   44f20:	00 02 3f d6	blr	x16
   44f24:	e9 03 00 91	mov	x9, sp
   44f28:	08 3d 00 91	add	x8, x8, #0xf
   44f2c:	08 ed 7c 92	and	x8, x8, #0xfffffffffffffff0
   44f30:	35 01 08 cb	sub	x21, x9, x8
   44f34:	bf 02 00 91	mov	sp, x21
   44f38:	e8 37 00 b0	adrp	x8, 1789 ; 0x741000
   44f3c:	00 11 42 f9	ldr	x0, [x8, #0x420] ; Objc class ref: _OBJC_CLASS_$_NSBundle
   44f40:	02 42 13 94	bl	0x515748 ; symbol stub for: _objc_allocWithZone
   44f44:	f6 03 00 aa	mov	x22, x0
   44f48:	5a 3c 13 94	bl	0x5140b0 ; symbol stub for: _$s10Foundation3URLV19_bridgeToObjectiveCSo5NSURLCyF
   44f4c:	f7 03 00 aa	mov	x23, x0
   44f50:	e0 03 16 aa	mov	x0, x22
   44f54:	e2 03 17 aa	mov	x2, x23
   44f58:	ca 49 13 94	bl	"_objc_msgSend$initWithURL:"
   44f5c:	f6 03 00 aa	mov	x22, x0
   44f60:	e0 03 17 aa	mov	x0, x23
   44f64:	ff 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44f68:	b6 03 00 b4	cbz	x22, 0x44fdc
   44f6c:	a8 26 00 d0	adrp	x8, 1238 ; 0x51a000
   44f70:	08 41 0d 91	add	x8, x8, #0x350 ; literal pool for: "CFBundleDisplayName"
   44f74:	18 81 00 d1	sub	x24, x8, #0x20
   44f78:	e0 03 16 aa	mov	x0, x22
   44f7c:	fc 41 13 94	bl	0x51576c ; symbol stub for: _objc_retain
   44f80:	f7 03 00 aa	mov	x23, x0
   44f84:	01 03 41 b2	orr	x1, x24, #0x8000000000000000
   44f88:	60 02 80 d2	mov	x0, #0x13
   44f8c:	00 00 fa f2	movk	x0, #0xd000, lsl #48
   44f90:	5c 3d 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   44f94:	f9 03 00 aa	mov	x25, x0
   44f98:	e0 03 17 aa	mov	x0, x23
   44f9c:	e2 03 19 aa	mov	x2, x25
   44fa0:	d0 49 13 94	bl	"_objc_msgSend$objectForInfoDictionaryKey:"
   44fa4:	fd 03 1d aa	mov	x29, x29
   44fa8:	f4 41 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   44fac:	f8 03 00 aa	mov	x24, x0
   44fb0:	e0 03 17 aa	mov	x0, x23
   44fb4:	eb 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44fb8:	e0 03 19 aa	mov	x0, x25
   44fbc:	e9 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   44fc0:	58 02 00 b4	cbz	x24, 0x45008
   44fc4:	a8 43 02 d1	sub	x8, x29, #0x90
   44fc8:	e0 03 18 aa	mov	x0, x24
   44fcc:	a1 3d 13 94	bl	0x514650 ; symbol stub for: _$ss018_bridgeAnyObjectToB0yypyXlSgF
   44fd0:	e0 03 18 aa	mov	x0, x24
   44fd4:	c4 42 13 94	bl	0x515ae4 ; symbol stub for: _swift_unknownObjectRelease
   44fd8:	0e 00 00 14	b	0x45010
   44fdc:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   44fe0:	a0 83 3c ad	stp	q0, q0, [x29, #-0x70]
   44fe4:	e1 37 00 b0	adrp	x1, 1789 ; 0x741000
   44fe8:	21 40 12 91	add	x1, x1, #0x490
   44fec:	22 27 00 d0	adrp	x2, 1254 ; 0x52a000
   44ff0:	42 40 1c 91	add	x2, x2, #0x710
   44ff4:	a0 c3 01 d1	sub	x0, x29, #0x70
   44ff8:	86 2a 00 94	bl	_$sypSgWOhTm
   44ffc:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   45000:	a0 83 3c ad	stp	q0, q0, [x29, #-0x70]
   45004:	42 00 00 14	b	0x4510c
   45008:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   4500c:	a0 83 3b ad	stp	q0, q0, [x29, #-0x90]
   45010:	a1 83 7b ad	ldp	q1, q0, [x29, #-0x90]
   45014:	a1 83 3c ad	stp	q1, q0, [x29, #-0x70]
   45018:	a8 83 5a f8	ldur	x8, [x29, #-0x58]
   4501c:	fb 36 00 f0	adrp	x27, 1759 ; 0x724000
   45020:	7b 6b 41 f9	ldr	x27, [x27, #0x2d0] ; literal pool symbol address: _$sypN
   45024:	48 01 00 b4	cbz	x8, 0x4504c
   45028:	e3 36 00 f0	adrp	x3, 1759 ; 0x724000
   4502c:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   45030:	a0 43 02 d1	sub	x0, x29, #0x90
   45034:	a1 c3 01 d1	sub	x1, x29, #0x70
   45038:	62 23 00 91	add	x2, x27, #0x8
   4503c:	c4 00 80 52	mov	w4, #0x6
   45040:	79 42 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   45044:	00 01 00 36	tbz	w0, #0x0, 0x45064
   45048:	2d 00 00 14	b	0x450fc
   4504c:	e1 37 00 90	adrp	x1, 1788 ; 0x741000
   45050:	21 40 12 91	add	x1, x1, #0x490
   45054:	22 27 00 b0	adrp	x2, 1253 ; 0x52a000
   45058:	42 40 1c 91	add	x2, x2, #0x710
   4505c:	a0 c3 01 d1	sub	x0, x29, #0x70
   45060:	6c 2a 00 94	bl	_$sypSgWOhTm
   45064:	60 c8 88 d2	mov	x0, #0x4643
   45068:	40 a8 ae f2	movk	x0, #0x7542, lsl #16
   4506c:	c0 8d cc f2	movk	x0, #0x646e, lsl #32
   45070:	80 ad ec f2	movk	x0, #0x656c, lsl #48
   45074:	c1 29 8c d2	mov	x1, #0x614e
   45078:	a1 ad ac f2	movk	x1, #0x656d, lsl #16
   4507c:	01 80 fd f2	movk	x1, #0xec00, lsl #48
   45080:	20 3d 13 94	bl	0x514500 ; symbol stub for: _$sSS10FoundationE19_bridgeToObjectiveCSo8NSStringCyF
   45084:	f9 03 00 aa	mov	x25, x0
   45088:	e0 03 17 aa	mov	x0, x23
   4508c:	e2 03 19 aa	mov	x2, x25
   45090:	94 49 13 94	bl	"_objc_msgSend$objectForInfoDictionaryKey:"
   45094:	fd 03 1d aa	mov	x29, x29
   45098:	b8 41 13 94	bl	0x515778 ; symbol stub for: _objc_retainAutoreleasedReturnValue
   4509c:	f8 03 00 aa	mov	x24, x0
   450a0:	e0 03 19 aa	mov	x0, x25
   450a4:	af 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   450a8:	f8 00 00 b4	cbz	x24, 0x450c4
   450ac:	a8 43 02 d1	sub	x8, x29, #0x90
   450b0:	e0 03 18 aa	mov	x0, x24
   450b4:	67 3d 13 94	bl	0x514650 ; symbol stub for: _$ss018_bridgeAnyObjectToB0yypyXlSgF
   450b8:	e0 03 18 aa	mov	x0, x24
   450bc:	8a 42 13 94	bl	0x515ae4 ; symbol stub for: _swift_unknownObjectRelease
   450c0:	03 00 00 14	b	0x450cc
   450c4:	00 e4 00 6f	movi.2d	v0, #0000000000000000
   450c8:	a0 83 3b ad	stp	q0, q0, [x29, #-0x90]
   450cc:	a1 83 7b ad	ldp	q1, q0, [x29, #-0x90]
   450d0:	a1 83 3c ad	stp	q1, q0, [x29, #-0x70]
   450d4:	a8 83 5a f8	ldur	x8, [x29, #-0x58]
   450d8:	a8 01 00 b4	cbz	x8, 0x4510c
   450dc:	e3 36 00 f0	adrp	x3, 1759 ; 0x724000
   450e0:	63 24 41 f9	ldr	x3, [x3, #0x248] ; literal pool symbol address: _$sSSN
   450e4:	a0 43 02 d1	sub	x0, x29, #0x90
   450e8:	a1 c3 01 d1	sub	x1, x29, #0x70
   450ec:	62 23 00 91	add	x2, x27, #0x8
   450f0:	c4 00 80 52	mov	w4, #0x6
   450f4:	4c 42 13 94	bl	0x515a24 ; symbol stub for: _swift_dynamicCast
   450f8:	60 01 00 36	tbz	w0, #0x0, 0x45124
   450fc:	b4 63 77 a9	ldp	x20, x24, [x29, #-0x90]
   45100:	e0 03 17 aa	mov	x0, x23
   45104:	97 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   45108:	13 00 00 14	b	0x45154
   4510c:	e1 37 00 90	adrp	x1, 1788 ; 0x741000
   45110:	21 40 12 91	add	x1, x1, #0x490
   45114:	22 27 00 b0	adrp	x2, 1253 ; 0x52a000
   45118:	42 40 1c 91	add	x2, x2, #0x710
   4511c:	a0 c3 01 d1	sub	x0, x29, #0x70
   45120:	3c 2a 00 94	bl	_$sypSgWOhTm
   45124:	e8 03 15 aa	mov	x8, x21
   45128:	e5 3b 13 94	bl	0x5140bc ; symbol stub for: _$s10Foundation3URLV21deletingPathExtensionACyF
   4512c:	f4 03 15 aa	mov	x20, x21
   45130:	dd 3b 13 94	bl	0x5140a4 ; symbol stub for: _$s10Foundation3URLV17lastPathComponentSSvg
   45134:	f4 03 00 aa	mov	x20, x0
   45138:	f8 03 01 aa	mov	x24, x1
   4513c:	e0 03 16 aa	mov	x0, x22
   45140:	88 41 13 94	bl	0x515760 ; symbol stub for: _objc_release
   45144:	48 07 40 f9	ldr	x8, [x26, #0x8]
   45148:	e0 03 15 aa	mov	x0, x21
   4514c:	e1 03 13 aa	mov	x1, x19
   45150:	00 01 3f d6	blr	x8
   45154:	e0 03 14 aa	mov	x0, x20
   45158:	e1 03 18 aa	mov	x1, x24
   4515c:	bf 43 01 d1	sub	sp, x29, #0x50
   45160:	fd 7b 45 a9	ldp	x29, x30, [sp, #0x50]
   45164:	f4 4f 44 a9	ldp	x20, x19, [sp, #0x40]
   45168:	f6 57 43 a9	ldp	x22, x21, [sp, #0x30]
   4516c:	f8 5f 42 a9	ldp	x24, x23, [sp, #0x20]
   45170:	fa 67 41 a9	ldp	x26, x25, [sp, #0x10]
   45174:	fc 6f c6 a8	ldp	x28, x27, [sp], #0x60
   45178:	c0 03 5f d6	ret
