/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift22biometricAccountPrefix_WZTm:
   30954:	ff 03 01 d1	sub	sp, sp, #0x40
   30958:	f6 57 01 a9	stp	x22, x21, [sp, #0x10]
   3095c:	f4 4f 02 a9	stp	x20, x19, [sp, #0x20]
   30960:	fd 7b 03 a9	stp	x29, x30, [sp, #0x30]
   30964:	fd c3 00 91	add	x29, sp, #0x30
   30968:	f3 03 04 aa	mov	x19, x4
   3096c:	f5 03 03 aa	mov	x21, x3
   30970:	f6 03 02 aa	mov	x22, x2
   30974:	e0 03 01 aa	mov	x0, x1
   30978:	a8 38 00 b0	adrp	x8, 1813 ; 0x745000
   3097c:	08 e1 40 f9	ldr	x8, [x8, #0x1c0]
   30980:	1f 05 00 b1	cmn	x8, #0x1
   30984:	c1 03 00 54	b.ne	0x309fc
   30988:	a8 38 00 90	adrp	x8, 1812 ; 0x744000
   3098c:	08 01 78 39	ldrb	w8, [x8, #0xe00]
   30990:	1f 05 00 71	cmp	w8, #0x1
   30994:	41 01 00 54	b.ne	0x309bc
   30998:	28 6c 8e d2	mov	x8, #0x7361
   3099c:	28 8d ac f2	movk	x8, #0x6469, lsl #16
   309a0:	a8 ac c5 f2	movk	x8, #0x2d65, lsl #32
   309a4:	68 2c ec f2	movk	x8, #0x6163, lsl #48
   309a8:	c9 2d 8c d2	mov	x9, #0x616e
   309ac:	49 2e af f2	movk	x9, #0x7972, lsl #16
   309b0:	c9 05 c0 f2	movk	x9, #0x2e, lsl #32
   309b4:	09 a0 fd f2	movk	x9, #0xed00, lsl #48
   309b8:	05 00 00 14	b	0x309cc
   309bc:	28 6c 8e d2	mov	x8, #0x7361
   309c0:	28 8d ac f2	movk	x8, #0x6469, lsl #16
   309c4:	a8 cc c5 f2	movk	x8, #0x2e65, lsl #32
   309c8:	09 c0 fc d2	mov	x9, #-0x1a00000000000000
   309cc:	e8 27 00 a9	stp	x8, x9, [sp]
   309d0:	f4 03 00 91	mov	x20, sp
   309d4:	e1 03 16 aa	mov	x1, x22
   309d8:	e5 8e 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   309dc:	e8 27 40 a9	ldp	x8, x9, [sp]
   309e0:	a8 02 00 f9	str	x8, [x21]
   309e4:	69 02 00 f9	str	x9, [x19]
   309e8:	fd 7b 43 a9	ldp	x29, x30, [sp, #0x30]
   309ec:	f4 4f 42 a9	ldp	x20, x19, [sp, #0x20]
   309f0:	f6 57 41 a9	ldp	x22, x21, [sp, #0x10]
   309f4:	ff 03 01 91	add	sp, sp, #0x40
   309f8:	c0 03 5f d6	ret
   309fc:	a8 38 00 b0	adrp	x8, 1813 ; 0x745000
   30a00:	08 01 07 91	add	x8, x8, #0x1c0
   30a04:	81 ff ff f0	adrp	x1, -13 ; 0x23000
   30a08:	21 20 3a 91	add	x1, x1, #0xe88
   30a0c:	f4 03 00 aa	mov	x20, x0
   30a10:	e0 03 08 aa	mov	x0, x8
   30a14:	25 94 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   30a18:	e0 03 14 aa	mov	x0, x20
   30a1c:	db ff ff 17	b	0x30988
