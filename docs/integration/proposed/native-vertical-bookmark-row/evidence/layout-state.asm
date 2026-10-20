
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4623b6c:      	sub	sp, sp, #0x30
 4623b70:      	stp	x20, x19, [sp, #0x10]
 4623b74:      	stp	x29, x30, [sp, #0x20]
 4623b78:      	add	x29, sp, #0x20
 4623b7c:      	mov	x19, x0
 4623b80:      	ldr	x0, [x0, #0x3d8]
 4623b84:      	cbz	x0, 0x4623c18 <_ChromeMain+0x461e97c>
 4623b88:      	ldrb	w8, [x19, #0x446]
 4623b8c:      	ldr	w9, [x0, #0x108]
 4623b90:      	cmp	w9, w8
 4623b94:      	b.eq	0x4623bc0 <_ChromeMain+0x461e924>
 4623b98:      	str	w8, [x0, #0x108]
 4623b9c:      	mov	w1, #0x1                ; =1
 4623ba0:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4623ba4:      	ldrb	w8, [x19, #0x446]
 4623ba8:      	tbnz	w8, #0x0, 0x4623bc4 <_ChromeMain+0x461e928>
 4623bac:      	ldr	w8, [x19, #0x3e8]
 4623bb0:      	mov	w9, #0xe                ; =14
 4623bb4:      	mov	w10, #0x8               ; =8
 4623bb8:      	madd	w8, w8, w9, w10
 4623bbc:      	b	0x4623bc8 <_ChromeMain+0x461e92c>
 4623bc0:      	tbz	w8, #0x0, 0x4623bac <_ChromeMain+0x461e910>
 4623bc4:      	mov	w8, #0x8                ; =8
 4623bc8:      	ldr	x0, [x19, #0x3d8]
 4623bcc:      	adds	w9, w8, #0x8
 4623bd0:      	mov	w10, #0x7fffffff        ; =2147483647
 4623bd4:      	csel	w9, w10, w9, vs
 4623bd8:      	subs	w9, w9, w8
 4623bdc:      	asr	w10, w9, #31
 4623be0:      	eor	w10, w10, #0x80000000
 4623be4:      	csel	w9, w10, w9, vs
 4623be8:      	ldr	w10, [x0, #0xf8]
 4623bec:      	cmp	w10, #0x6
 4623bf0:      	b.ne	0x4623cf4 <_ChromeMain+0x461ea58>
 4623bf4:      	ldr	w10, [x0, #0xfc]
 4623bf8:      	cmp	w10, w8
 4623bfc:      	b.ne	0x4623cf4 <_ChromeMain+0x461ea58>
 4623c00:      	ldr	w10, [x0, #0x100]
 4623c04:      	cmp	w10, #0x6
 4623c08:      	b.ne	0x4623cf4 <_ChromeMain+0x461ea58>
 4623c0c:      	ldr	w10, [x0, #0x104]
 4623c10:      	cmp	w10, w9
 4623c14:      	b.ne	0x4623cf4 <_ChromeMain+0x461ea58>
 4623c18:      	ldr	x8, [x19, #0x420]
 4623c1c:      	cbz	x8, 0x4623c70 <_ChromeMain+0x461e9d4>
 4623c20:      	ldrb	w9, [x19, #0x446]
 4623c24:      	cmp	w9, #0x0
 4623c28:      	mov	x9, #0x800000000        ; =34359738368
 4623c2c:      	csel	x9, xzr, x9, ne
 4623c30:      	stp	xzr, x9, [sp]
 4623c34:      	ldr	x10, [x8, #0xe8]!
 4623c38:      	cbz	x10, 0x4623c5c <_ChromeMain+0x461e9c0>
 4623c3c:      	adrp	x11, 0xea05000 <dyld_stub_binder+0xea05000>
 4623c40:      	add	x11, x11, #0x488
 4623c44:      	ldr	x12, [x10, #0x20]
 4623c48:      	cmp	x12, x11
 4623c4c:      	b.hi	0x4623cac <_ChromeMain+0x461ea10>
 4623c50:      	b.hs	0x4623cb8 <_ChromeMain+0x461ea1c>
 4623c54:      	ldr	x10, [x10, #0x8]
 4623c58:      	cbnz	x10, 0x4623c44 <_ChromeMain+0x461e9a8>
 4623c5c:      	sub	x0, x8, #0x10
 4623c60:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4623c64:      	add	x1, x1, #0x488
 4623c68:      	mov	x2, sp
 4623c6c:      	bl	0x31af9c4 <_ChromeMain+0x31aa728>
 4623c70:      	ldr	x0, [x19, #0x428]
 4623c74:      	cbz	x0, 0x4623c9c <_ChromeMain+0x461ea00>
 4623c78:      	ldrb	w8, [x19, #0x446]
 4623c7c:      	eor	w8, w8, #0x1
 4623c80:      	and	w1, w8, #0x1
 4623c84:      	ldrb	w8, [x0, #0x1c8]
 4623c88:      	cmp	w1, w8
 4623c8c:      	b.eq	0x4623c9c <_ChromeMain+0x461ea00>
 4623c90:      	ldr	x8, [x0]
 4623c94:      	ldr	x8, [x8, #0xa0]
 4623c98:      	blr	x8
 4623c9c:      	ldp	x29, x30, [sp, #0x20]
 4623ca0:      	ldp	x20, x19, [sp, #0x10]
 4623ca4:      	add	sp, sp, #0x30
 4623ca8:      	ret
 4623cac:      	ldr	x10, [x10]
 4623cb0:      	cbnz	x10, 0x4623c44 <_ChromeMain+0x461e9a8>
 4623cb4:      	b	0x4623c5c <_ChromeMain+0x461e9c0>
 4623cb8:      	cmp	x10, x8
 4623cbc:      	b.eq	0x4623c5c <_ChromeMain+0x461e9c0>
 4623cc0:      	ldr	x10, [x10, #0x30]
 4623cc4:      	cbz	x10, 0x4623c5c <_ChromeMain+0x461e9c0>
 4623cc8:      	ldr	w11, [x10]
 4623ccc:      	cbnz	w11, 0x4623c5c <_ChromeMain+0x461e9c0>
 4623cd0:      	ldr	w11, [x10, #0x4]
 4623cd4:      	cbnz	w11, 0x4623c5c <_ChromeMain+0x461e9c0>
 4623cd8:      	ldr	w11, [x10, #0x8]
 4623cdc:      	cbnz	w11, 0x4623c5c <_ChromeMain+0x461e9c0>
 4623ce0:      	lsr	x9, x9, #32
 4623ce4:      	ldr	w10, [x10, #0xc]
 4623ce8:      	cmp	w10, w9
 4623cec:      	b.eq	0x4623c70 <_ChromeMain+0x461e9d4>
 4623cf0:      	b	0x4623c5c <_ChromeMain+0x461e9c0>
 4623cf4:      	mov	w10, #0x6               ; =6
 4623cf8:      	orr	x9, x10, x9, lsl #32
 4623cfc:      	lsl	x8, x8, #32
 4623d00:      	orr	x8, x8, #0x6
 4623d04:      	stp	x8, x9, [x0, #0xf8]
 4623d08:      	mov	w1, #0x1                ; =1
 4623d0c:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4623d10:      	b	0x4623c18 <_ChromeMain+0x461e97c>
 4623d14:      	nop
 4623d18:      	nop
 4623d1c:      	nop
 4623d20:      	nop
 4623d24:      	nop
 4623d28:      	nop
 4623d2c:      	nop
		...
