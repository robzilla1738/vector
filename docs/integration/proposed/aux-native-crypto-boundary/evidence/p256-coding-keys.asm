/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
_$s16AsideNativeSwift13WrappedDkP256V10CodingKeysO11stringValueSSvg:
   31c3c:	08 1c 00 12	and	w8, w0, #0xff
   31c40:	09 c0 fc d2	mov	x9, #-0x1a00000000000000
   31c44:	6a 6e 8c d2	mov	x10, #0x6373
   31c48:	0a ad ac f2	movk	x10, #0x6568, lsl #16
   31c4c:	aa ad cc f2	movk	x10, #0x656d, lsl #32
   31c50:	4b 27 00 90	adrp	x11, 1256 ; 0x519000
   31c54:	6b 41 32 91	add	x11, x11, #0xc90 ; literal pool for: "ephemeral_public_key"
   31c58:	6b 81 00 d1	sub	x11, x11, #0x20
   31c5c:	6b 01 41 b2	orr	x11, x11, #0x8000000000000000
   31c60:	8c 02 80 d2	mov	x12, #0x14
   31c64:	0c 00 fa f2	movk	x12, #0xd000, lsl #48
   31c68:	1f 0d 00 71	cmp	w8, #0x3
   31c6c:	0d a0 fc d2	mov	x13, #-0x1b00000000000000
   31c70:	ce ed 8d d2	mov	x14, #0x6f6e
   31c74:	ce 6d ac f2	movk	x14, #0x636e, lsl #16
   31c78:	ae 0c c0 f2	movk	x14, #0x65, lsl #32
   31c7c:	0f 8f 8e d2	mov	x15, #0x7478
   31c80:	0f 40 fd f2	movk	x15, #0xea00, lsl #48
   31c84:	70 2c 8d d2	mov	x16, #0x6963
   31c88:	10 0e ad f2	movk	x16, #0x6870, lsl #16
   31c8c:	b0 4c ce f2	movk	x16, #0x7265, lsl #32
   31c90:	90 ae ec f2	movk	x16, #0x6574, lsl #48
   31c94:	ce 01 90 9a	csel	x14, x14, x16, eq
   31c98:	ad 01 8f 9a	csel	x13, x13, x15, eq
   31c9c:	1f 09 00 71	cmp	w8, #0x2
   31ca0:	8c 01 8e 9a	csel	x12, x12, x14, eq
   31ca4:	6b 01 8d 9a	csel	x11, x11, x13, eq
   31ca8:	0d e0 fc d2	mov	x13, #-0x1900000000000000
   31cac:	0e ae 8e d2	mov	x14, #0x7570
   31cb0:	4e 0e ae f2	movk	x14, #0x7072, lsl #16
   31cb4:	ee 6d ce f2	movk	x14, #0x736f, lsl #32
   31cb8:	ae 0c e0 f2	movk	x14, #0x65, lsl #48
   31cbc:	1f 01 00 71	cmp	w8, #0x0
   31cc0:	4a 01 8e 9a	csel	x10, x10, x14, eq
   31cc4:	29 01 8d 9a	csel	x9, x9, x13, eq
   31cc8:	1f 05 00 71	cmp	w8, #0x1
   31ccc:	80 c1 8a 9a	csel	x0, x12, x10, gt
   31cd0:	61 c1 89 9a	csel	x1, x11, x9, gt
   31cd4:	c0 03 5f d6	ret
