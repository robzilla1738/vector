
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4630b48:      	sub	sp, sp, #0x120
 4630b4c:      	stp	x28, x27, [sp, #0xc0]
 4630b50:      	stp	x26, x25, [sp, #0xd0]
 4630b54:      	stp	x24, x23, [sp, #0xe0]
 4630b58:      	stp	x22, x21, [sp, #0xf0]
 4630b5c:      	stp	x20, x19, [sp, #0x100]
 4630b60:      	stp	x29, x30, [sp, #0x110]
 4630b64:      	add	x29, sp, #0x110
 4630b68:      	mov	x19, x0
 4630b6c:      	ldr	x8, [x0]
 4630b70:      	ldr	x8, [x8, #0x60]
 4630b74:      	adrp	x20, 0x66c000 <_ChromeMain+0x666d64>
 4630b78:      	add	x20, x20, #0xe50
 4630b7c:      	cmp	x8, x20
 4630b80:      	b.ne	0x4630e1c <_ChromeMain+0x462bb80>
 4630b84:      	ldr	x0, [x19, #0x180]
 4630b88:      	cbz	x0, 0x4630dfc <_ChromeMain+0x462bb60>
 4630b8c:      	ldr	x8, [x19]
 4630b90:      	ldr	x8, [x8, #0x60]
 4630b94:      	cmp	x8, x20
 4630b98:      	b.ne	0x4630e3c <_ChromeMain+0x462bba0>
 4630b9c:      	ldr	x0, [x19, #0x180]
 4630ba0:      	ldr	x8, [x0, #0xe0]
 4630ba4:      	cbz	x8, 0x4630e58 <_ChromeMain+0x462bbbc>
 4630ba8:      	ldapurb	w8, [x8, #0x4]
 4630bac:      	cbnz	w8, 0x4630e58 <_ChromeMain+0x462bbbc>
 4630bb0:      	ldr	x8, [x0, #0xe8]
 4630bb4:      	cbz	x8, 0x4630e58 <_ChromeMain+0x462bbbc>
 4630bb8:      	ldr	x8, [x0, #0xe0]
 4630bbc:      	cbz	x8, 0x4630e70 <_ChromeMain+0x462bbd4>
 4630bc0:      	ldapurb	w8, [x8, #0x4]
 4630bc4:      	cbnz	w8, 0x4630e70 <_ChromeMain+0x462bbd4>
 4630bc8:      	ldr	x8, [x0, #0xe8]
 4630bcc:      	ldr	x8, [x8, #0x48]
 4630bd0:      	cbz	x8, 0x4630eac <_ChromeMain+0x462bc10>
 4630bd4:      	ldr	x20, [x8, #0x148]
 4630bd8:      	mov	x0, x20
 4630bdc:      	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4630be0:      	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4630be4:      	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4630be8:      	mov	w0, #0x8                ; =8
 4630bec:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630bf0:      	mov	x21, x0
 4630bf4:      	str	xzr, [x0]
 4630bf8:      	mov	x1, x20
 4630bfc:      	bl	0x866c100 <_ChromeMain+0x8666e64>
 4630c00:      	mov	x0, x20
 4630c04:      	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4630c08:      	mov	x0, x20
 4630c0c:      	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4630c10:      	mov	x0, x20
 4630c14:      	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4630c18:      	stp	x21, x20, [x29, #-0x68]
 4630c1c:      	adrp	x24, 0xef0f000 <dyld_stub_binder+0xef0f000>
 4630c20:      	ldr	x0, [x24, #0xde8]
 4630c24:      	cbz	x0, 0x4630e7c <_ChromeMain+0x462bbe0>
 4630c28:      	stp	xzr, xzr, [x29, #-0x80]
 4630c2c:      	stur	xzr, [x29, #-0x70]
 4630c30:      	sub	x20, x29, #0x80
 4630c34:      	sub	x8, x29, #0x80
 4630c38:      	mov	w1, #0x2c30             ; =11312
 4630c3c:      	bl	0x12b46dc <_ChromeMain+0x12af440>
 4630c40:      	ldursb	x8, [x29, #-0x69]
 4630c44:      	ldp	x9, x10, [x29, #-0x80]
 4630c48:      	cmp	x8, #0x0
 4630c4c:      	csel	x20, x9, x20, mi
 4630c50:      	cmp	w8, #0x0
 4630c54:      	csel	x21, x10, x8, mi
 4630c58:      	ldr	x0, [x24, #0xde8]
 4630c5c:      	cbz	x0, 0x4630e88 <_ChromeMain+0x462bbec>
 4630c60:      	stp	xzr, xzr, [sp, #0x78]
 4630c64:      	str	xzr, [sp, #0x88]
 4630c68:      	add	x22, sp, #0x78
 4630c6c:      	add	x8, sp, #0x78
 4630c70:      	mov	w1, #0x2c31             ; =11313
 4630c74:      	bl	0x12b46dc <_ChromeMain+0x12af440>
 4630c78:      	ldrsb	x8, [sp, #0x8f]
 4630c7c:      	ldp	x9, x10, [sp, #0x78]
 4630c80:      	cmp	x8, #0x0
 4630c84:      	csel	x22, x9, x22, mi
 4630c88:      	cmp	w8, #0x0
 4630c8c:      	csel	x23, x10, x8, mi
 4630c90:      	ldr	x0, [x24, #0xde8]
 4630c94:      	cbz	x0, 0x4630e94 <_ChromeMain+0x462bbf8>
 4630c98:      	stp	xzr, xzr, [sp, #0x60]
 4630c9c:      	str	xzr, [sp, #0x70]
 4630ca0:      	add	x24, sp, #0x60
 4630ca4:      	add	x8, sp, #0x60
 4630ca8:      	mov	w1, #0x2c32             ; =11314
 4630cac:      	bl	0x12b46dc <_ChromeMain+0x12af440>
 4630cb0:      	ldrsb	x8, [sp, #0x77]
 4630cb4:      	ldp	x9, x10, [sp, #0x60]
 4630cb8:      	cmp	x8, #0x0
 4630cbc:      	csel	x24, x9, x24, mi
 4630cc0:      	cmp	w8, #0x0
 4630cc4:      	csel	x25, x10, x8, mi
 4630cc8:      	stp	xzr, xzr, [sp, #0x48]
 4630ccc:      	str	xzr, [sp, #0x58]
 4630cd0:      	stp	xzr, xzr, [sp, #0x30]
 4630cd4:      	str	xzr, [sp, #0x40]
 4630cd8:      	ldr	x26, [x19, #0x1408]
 4630cdc:      	cbz	x26, 0x4630cf4 <_ChromeMain+0x462ba58>
 4630ce0:      	mov	w8, #0x1                ; =1
 4630ce4:      	ldadd	w8, w8, [x26]
 4630ce8:      	mov	w9, #0x7fffffff         ; =2147483647
 4630cec:      	cmp	w8, w9
 4630cf0:      	b.eq	0x4630ea0 <_ChromeMain+0x462bc04>
 4630cf4:      	add	x27, sp, #0x48
 4630cf8:      	add	x28, sp, #0x30
 4630cfc:      	ldr	x19, [x19, #0x1410]
 4630d00:      	mov	w0, #0x38               ; =56
 4630d04:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630d08:      	mov	w8, #0x1                ; =1
 4630d0c:      	str	w8, [x0]
 4630d10:      	adr	x8, 0x4679580 <_ChromeMain+0x46742e4>
 4630d14:      	nop
 4630d18:      	adrp	x9, 0x4047000 <_ChromeMain+0x4041d64>
 4630d1c:      	add	x9, x9, #0x580
 4630d20:      	stp	x8, x9, [x0, #0x8]
 4630d24:      	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4630d28:      	add	x8, x8, #0xb00
 4630d2c:      	str	x8, [x0, #0x18]
 4630d30:      	stp	x26, x19, [x0, #0x28]
 4630d34:      	stp	xzr, x0, [sp, #0x18]
 4630d38:      	sub	x0, x29, #0x68
 4630d3c:      	stp	xzr, x28, [sp, #0x8]
 4630d40:      	str	x27, [sp]
 4630d44:      	mov	x1, x20
 4630d48:      	mov	x2, x21
 4630d4c:      	mov	x3, x22
 4630d50:      	mov	x4, x23
 4630d54:      	mov	w5, #0x1                ; =1
 4630d58:      	mov	x6, x24
 4630d5c:      	mov	x7, x25
 4630d60:      	bl	0x4216dfc <_ChromeMain+0x4211b60>
 4630d64:      	ldrsb	w8, [sp, #0x47]
 4630d68:      	tbz	w8, #0x1f, 0x4630d7c <_ChromeMain+0x462bae0>
 4630d6c:      	ldr	x0, [sp, #0x30]
 4630d70:      	ldr	x8, [sp, #0x40]
 4630d74:      	lsl	x1, x8, #1
 4630d78:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630d7c:      	ldrsb	w8, [sp, #0x5f]
 4630d80:      	tbz	w8, #0x1f, 0x4630d94 <_ChromeMain+0x462baf8>
 4630d84:      	ldr	x0, [sp, #0x48]
 4630d88:      	ldr	x8, [sp, #0x58]
 4630d8c:      	lsl	x1, x8, #1
 4630d90:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630d94:      	ldrsb	w8, [sp, #0x77]
 4630d98:      	tbz	w8, #0x1f, 0x4630dac <_ChromeMain+0x462bb10>
 4630d9c:      	ldr	x0, [sp, #0x60]
 4630da0:      	ldr	x8, [sp, #0x70]
 4630da4:      	lsl	x1, x8, #1
 4630da8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630dac:      	ldrsb	w8, [sp, #0x8f]
 4630db0:      	tbz	w8, #0x1f, 0x4630dc4 <_ChromeMain+0x462bb28>
 4630db4:      	ldr	x0, [sp, #0x78]
 4630db8:      	ldr	x8, [sp, #0x88]
 4630dbc:      	lsl	x1, x8, #1
 4630dc0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630dc4:      	ldursb	w8, [x29, #-0x69]
 4630dc8:      	tbz	w8, #0x1f, 0x4630ddc <_ChromeMain+0x462bb40>
 4630dcc:      	ldur	x0, [x29, #-0x80]
 4630dd0:      	ldur	x8, [x29, #-0x70]
 4630dd4:      	lsl	x1, x8, #1
 4630dd8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630ddc:      	ldur	x19, [x29, #-0x68]
 4630de0:      	stur	xzr, [x29, #-0x68]
 4630de4:      	cbz	x19, 0x4630dfc <_ChromeMain+0x462bb60>
 4630de8:      	mov	x0, x19
 4630dec:      	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4630df0:      	mov	x0, x19
 4630df4:      	mov	w1, #0x8                ; =8
 4630df8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630dfc:      	ldp	x29, x30, [sp, #0x110]
 4630e00:      	ldp	x20, x19, [sp, #0x100]
 4630e04:      	ldp	x22, x21, [sp, #0xf0]
 4630e08:      	ldp	x24, x23, [sp, #0xe0]
 4630e0c:      	ldp	x26, x25, [sp, #0xd0]
 4630e10:      	ldp	x28, x27, [sp, #0xc0]
 4630e14:      	add	sp, sp, #0x120
 4630e18:      	ret
 4630e1c:      	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4630e20:      	add	x9, x9, #0x830
 4630e24:      	cmp	x8, x9
 4630e28:      	b.eq	0x4630b84 <_ChromeMain+0x462b8e8>
 4630e2c:      	mov	x0, x19
 4630e30:      	blr	x8
 4630e34:      	cbnz	x0, 0x4630b8c <_ChromeMain+0x462b8f0>
 4630e38:      	b	0x4630dfc <_ChromeMain+0x462bb60>
 4630e3c:      	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4630e40:      	add	x9, x9, #0x830
 4630e44:      	cmp	x8, x9
 4630e48:      	b.eq	0x4630b9c <_ChromeMain+0x462b900>
 4630e4c:      	mov	x0, x19
 4630e50:      	blr	x8
 4630e54:      	b	0x4630ba0 <_ChromeMain+0x462b904>
 4630e58:      	mov	w0, #0x8                ; =8
 4630e5c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630e60:      	mov	x21, x0
 4630e64:      	mov	x20, #0x0               ; =0
 4630e68:      	str	xzr, [x0]
 4630e6c:      	b	0x4630c18 <_ChromeMain+0x462b97c>
 4630e70:      	brk	#0
 4630e74:      	hlt	#0
 4630e78:      	brk	#0x1
 4630e7c:      	brk	#0
 4630e80:      	hlt	#0
 4630e84:      	brk	#0x1
 4630e88:      	brk	#0
 4630e8c:      	hlt	#0
 4630e90:      	brk	#0x1
 4630e94:      	brk	#0
 4630e98:      	hlt	#0
 4630e9c:      	brk	#0x1
 4630ea0:      	brk	#0
 4630ea4:      	hlt	#0
 4630ea8:      	brk	#0x1
 4630eac:      	mov	x0, #0x0                ; =0
 4630eb0:      	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4630eb4:      	mov	x0, #0x0                ; =0
 4630eb8:      	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4630ebc:      	mov	w0, #0x8                ; =8
 4630ec0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630ec4:      	mov	x21, x0
 4630ec8:      	str	xzr, [x0]
 4630ecc:      	mov	x1, #0x0                ; =0
 4630ed0:      	bl	0x866c100 <_ChromeMain+0x8666e64>
 4630ed4:      	mov	x20, #0x0               ; =0
 4630ed8:      	b	0x4630c08 <_ChromeMain+0x462b96c>
