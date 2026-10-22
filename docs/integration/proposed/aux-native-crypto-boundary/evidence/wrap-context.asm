/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift11wrapContext_WZ:
   30a60:	ff c3 00 d1	sub	sp, sp, #0x30
   30a64:	f4 4f 01 a9	stp	x20, x19, [sp, #0x10]
   30a68:	fd 7b 02 a9	stp	x29, x30, [sp, #0x20]
   30a6c:	fd 83 00 91	add	x29, sp, #0x20
   30a70:	a8 38 00 b0	adrp	x8, 1813 ; 0x745000
   30a74:	08 e1 40 f9	ldr	x8, [x8, #0x1c0]
   30a78:	1f 05 00 b1	cmn	x8, #0x1
   30a7c:	81 04 00 54	b.ne	0x30b0c
   30a80:	e0 4e 8e d2	mov	x0, #0x7277
   30a84:	20 0c ae f2	movk	x0, #0x7061, lsl #16
   30a88:	c0 85 cc f2	movk	x0, #0x642e, lsl #32
   30a8c:	60 cd e5 f2	movk	x0, #0x2e6b, lsl #48
   30a90:	a8 38 00 90	adrp	x8, 1812 ; 0x744000
   30a94:	08 01 78 39	ldrb	w8, [x8, #0xe00]
   30a98:	1f 05 00 71	cmp	w8, #0x1
   30a9c:	41 01 00 54	b.ne	0x30ac4
   30aa0:	28 6c 8e d2	mov	x8, #0x7361
   30aa4:	28 8d ac f2	movk	x8, #0x6469, lsl #16
   30aa8:	a8 ac c5 f2	movk	x8, #0x2d65, lsl #32
   30aac:	68 2c ec f2	movk	x8, #0x6163, lsl #48
   30ab0:	c9 2d 8c d2	mov	x9, #0x616e
   30ab4:	49 2e af f2	movk	x9, #0x7972, lsl #16
   30ab8:	c9 05 c0 f2	movk	x9, #0x2e, lsl #32
   30abc:	09 a0 fd f2	movk	x9, #0xed00, lsl #48
   30ac0:	05 00 00 14	b	0x30ad4
   30ac4:	28 6c 8e d2	mov	x8, #0x7361
   30ac8:	28 8d ac f2	movk	x8, #0x6469, lsl #16
   30acc:	a8 cc c5 f2	movk	x8, #0x2e65, lsl #32
   30ad0:	09 c0 fc d2	mov	x9, #-0x1a00000000000000
   30ad4:	e8 27 00 a9	stp	x8, x9, [sp]
   30ad8:	f4 03 00 91	mov	x20, sp
   30adc:	c1 2e 86 d2	mov	x1, #0x3176
   30ae0:	01 40 fd f2	movk	x1, #0xea00, lsl #48
   30ae4:	a2 8e 13 94	bl	0x51456c ; symbol stub for: _$sSS6appendyySSF
   30ae8:	e0 07 40 a9	ldp	x0, x1, [sp]
   30aec:	0e 00 00 94	bl	_$s10Foundation4DataVyACxcSTRzs5UInt8V7ElementRtzlufCSS8UTF8ViewV_Tt0g5
   30af0:	a8 38 00 90	adrp	x8, 1812 ; 0x744000
   30af4:	08 21 3a 91	add	x8, x8, #0xe88
   30af8:	00 05 00 a9	stp	x0, x1, [x8]
   30afc:	fd 7b 42 a9	ldp	x29, x30, [sp, #0x20]
   30b00:	f4 4f 41 a9	ldp	x20, x19, [sp, #0x10]
   30b04:	ff c3 00 91	add	sp, sp, #0x30
   30b08:	c0 03 5f d6	ret
   30b0c:	a0 38 00 b0	adrp	x0, 1813 ; 0x745000
   30b10:	00 00 07 91	add	x0, x0, #0x1c0
   30b14:	81 ff ff f0	adrp	x1, -13 ; 0x23000
   30b18:	21 20 3a 91	add	x1, x1, #0xe88
   30b1c:	e3 93 13 94	bl	0x515aa8 ; symbol stub for: _swift_once
   30b20:	d8 ff ff 17	b	0x30a80
