
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4127a80:      	stp	x22, x21, [sp, #-0x30]!
 4127a84:      	stp	x20, x19, [sp, #0x10]
 4127a88:      	stp	x29, x30, [sp, #0x20]
 4127a8c:      	add	x29, sp, #0x20
 4127a90:      	cbz	x1, 0x4127c10 <_ChromeMain+0x4122974>
 4127a94:      	mov	x19, x1
 4127a98:      	mov	x20, x0
 4127a9c:      	ldr	x8, [x1]
 4127aa0:      	ldr	x8, [x8, #0x58]
 4127aa4:      	mov	x0, x1
 4127aa8:      	blr	x8
 4127aac:      	mov	x21, x0
 4127ab0:      	bl	0x78af2c4 <_ChromeMain+0x78aa028>
 4127ab4:      	cmp	x21, #0x0
 4127ab8:      	cset	w8, ne
 4127abc:      	cmp	x21, x0
 4127ac0:      	ccmp	x21, #0x0, #0x4, ne
 4127ac4:      	b.eq	0x4127adc <_ChromeMain+0x4122840>
 4127ac8:      	ldr	x21, [x21, #0x48]
 4127acc:      	cmp	x21, #0x0
 4127ad0:      	cset	w8, ne
 4127ad4:      	ccmp	x21, x0, #0x4, ne
 4127ad8:      	b.ne	0x4127ac8 <_ChromeMain+0x412282c>
 4127adc:      	cbz	w8, 0x4127b68 <_ChromeMain+0x41228cc>
 4127ae0:      	ldr	x0, [x20, #0x360]
 4127ae4:      	and	x8, x0, #0xfffffffc00000000
 4127ae8:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127aec:      	ldr	x9, [x9, #0x88]
 4127af0:      	cmp	x8, x9
 4127af4:      	b.ne	0x4127afc <_ChromeMain+0x4122860>
 4127af8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127afc:      	str	xzr, [x20, #0x360]
 4127b00:      	ldrb	w8, [x20, #0x369]
 4127b04:      	cbz	w8, 0x4127b50 <_ChromeMain+0x41228b4>
 4127b08:      	ldr	x8, [x19, #0x188]
 4127b0c:      	cmp	x8, x20
 4127b10:      	b.ne	0x4127b50 <_ChromeMain+0x41228b4>
 4127b14:      	ldrb	w8, [x19, #0x169]
 4127b18:      	cbnz	w8, 0x4127c1c <_ChromeMain+0x4122980>
 4127b1c:      	mov	x0, x20
 4127b20:      	mov	x1, x19
 4127b24:      	mov	w2, #0x1                ; =1
 4127b28:      	mov	w3, #0x0                ; =0
 4127b2c:      	mov	x4, #0x0                ; =0
 4127b30:      	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 4127b34:      	ldr	x8, [x19]
 4127b38:      	ldr	x1, [x8, #0x50]
 4127b3c:      	mov	x0, x19
 4127b40:      	ldp	x29, x30, [sp, #0x20]
 4127b44:      	ldp	x20, x19, [sp, #0x10]
 4127b48:      	ldp	x22, x21, [sp], #0x30
 4127b4c:      	br	x1
 4127b50:      	ldr	x0, [x20, #0x358]
 4127b54:      	mov	x1, #0x0                ; =0
 4127b58:      	ldp	x29, x30, [sp, #0x20]
 4127b5c:      	ldp	x20, x19, [sp, #0x10]
 4127b60:      	ldp	x22, x21, [sp], #0x30
 4127b64:      	b	0xa6a4fc0 <_ChromeMain+0xa69fd24>
 4127b68:      	ldr	x8, [x19]
 4127b6c:      	ldr	x8, [x8, #0x58]
 4127b70:      	mov	x0, x19
 4127b74:      	blr	x8
 4127b78:      	mov	x21, x0
 4127b7c:      	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 4127b80:      	cmp	x21, #0x0
 4127b84:      	cset	w8, ne
 4127b88:      	cmp	x21, x0
 4127b8c:      	ccmp	x21, #0x0, #0x4, ne
 4127b90:      	b.eq	0x4127ba8 <_ChromeMain+0x412290c>
 4127b94:      	ldr	x21, [x21, #0x48]
 4127b98:      	cmp	x21, #0x0
 4127b9c:      	cset	w8, ne
 4127ba0:      	ccmp	x21, x0, #0x4, ne
 4127ba4:      	b.ne	0x4127b94 <_ChromeMain+0x41228f8>
 4127ba8:      	cbz	w8, 0x4127c10 <_ChromeMain+0x4122974>
 4127bac:      	ldr	x21, [x20, #0x338]
 4127bb0:      	ldr	x0, [x21, #0x570]
 4127bb4:      	and	x8, x0, #0xfffffffc00000000
 4127bb8:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4127bbc:      	ldr	x9, [x22, #0x88]
 4127bc0:      	cmp	x8, x9
 4127bc4:      	b.ne	0x4127bcc <_ChromeMain+0x4122930>
 4127bc8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127bcc:      	str	xzr, [x21, #0x570]
 4127bd0:      	ldr	x0, [x20, #0x338]
 4127bd4:      	and	x8, x0, #0xfffffffc00000000
 4127bd8:      	ldr	x9, [x22, #0x88]
 4127bdc:      	cmp	x8, x9
 4127be0:      	b.ne	0x4127be8 <_ChromeMain+0x412294c>
 4127be4:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4127be8:      	str	xzr, [x20, #0x338]
 4127bec:      	ldrb	w8, [x20, #0x369]
 4127bf0:      	cbz	w8, 0x4127c08 <_ChromeMain+0x412296c>
 4127bf4:      	ldr	x0, [x19, #0x188]
 4127bf8:      	cbz	x0, 0x4127c08 <_ChromeMain+0x412296c>
 4127bfc:      	ldrb	w8, [x19, #0x169]
 4127c00:      	cbz	w8, 0x4127b20 <_ChromeMain+0x4122884>
 4127c04:      	b	0x4127c28 <_ChromeMain+0x412298c>
 4127c08:      	ldr	x0, [x20, #0x330]
 4127c0c:      	b	0x4127b54 <_ChromeMain+0x41228b8>
 4127c10:      	brk	#0
 4127c14:      	hlt	#0
 4127c18:      	brk	#0x1
 4127c1c:      	brk	#0
 4127c20:      	hlt	#0
 4127c24:      	brk	#0x1
 4127c28:      	brk	#0
 4127c2c:      	hlt	#0
 4127c30:      	brk	#0x1
 4127c34:      	ldr	x8, [x0, #0x328]
 4127c38:      	cbz	x8, 0x4127cb8 <_ChromeMain+0x4122a1c>
 4127c3c:      	stp	x24, x23, [sp, #-0x40]!
 4127c40:      	stp	x22, x21, [sp, #0x10]
 4127c44:      	stp	x20, x19, [sp, #0x20]
 4127c48:      	stp	x29, x30, [sp, #0x30]
 4127c4c:      	add	x29, sp, #0x30
 4127c50:      	mov	x19, x1
 4127c54:      	ldr	w9, [x8, #0xe0]
 4127c58:      	cmp	w9, #0x2
 4127c5c:      	b.ne	0x4127c80 <_ChromeMain+0x41229e4>
 4127c60:      	ldr	x9, [x8, #0x110]
 4127c64:      	lsl	x10, x9, #3
 4127c68:      	cbz	x10, 0x4127ca8 <_ChromeMain+0x4122a0c>
 4127c6c:      	ldr	x22, [x8, #0x108]
 4127c70:      	add	x23, x22, x9, lsl #3
 4127c74:      	b	0x4127cd8 <_ChromeMain+0x4122a3c>
 4127c78:      	cbnz	x8, 0x4127c60 <_ChromeMain+0x41229c4>
 4127c7c:      	b	0x4127ca8 <_ChromeMain+0x4122a0c>
 4127c80:      	ldr	x9, [x8, #0x110]
 4127c84:      	lsl	x9, x9, #3
 4127c88:      	cbz	x9, 0x4127ca8 <_ChromeMain+0x4122a0c>
 4127c8c:      	ldr	x10, [x8, #0x108]
 4127c90:      	ldr	x8, [x10], #0x8
 4127c94:      	ldr	w11, [x8, #0xe0]
 4127c98:      	cmp	w11, #0x2
 4127c9c:      	b.eq	0x4127c78 <_ChromeMain+0x41229dc>
 4127ca0:      	subs	x9, x9, #0x8
 4127ca4:      	b.ne	0x4127c90 <_ChromeMain+0x41229f4>
 4127ca8:      	ldp	x29, x30, [sp, #0x30]
 4127cac:      	ldp	x20, x19, [sp, #0x20]
 4127cb0:      	ldp	x22, x21, [sp, #0x10]
 4127cb4:      	ldp	x24, x23, [sp], #0x40
 4127cb8:      	ret
 4127cbc:      	cbz	w8, 0x4127ccc <_ChromeMain+0x4122a30>
 4127cc0:      	mov	x0, x20
 4127cc4:      	mov	x1, x19
 4127cc8:      	bl	0x412299c <_ChromeMain+0x411d700>
 4127ccc:      	add	x22, x22, #0x8
 4127cd0:      	cmp	x22, x23
 4127cd4:      	b.eq	0x4127ca8 <_ChromeMain+0x4122a0c>
 4127cd8:      	ldr	x8, [x22]
 4127cdc:      	ldr	x20, [x8, #0x140]
 4127ce0:      	cbz	x20, 0x4127ccc <_ChromeMain+0x4122a30>
 4127ce4:      	ldr	x8, [x20]
 4127ce8:      	ldr	x8, [x8, #0x58]
 4127cec:      	mov	x0, x20
 4127cf0:      	blr	x8
 4127cf4:      	mov	x21, x0
 4127cf8:      	bl	0x78a7a44 <_ChromeMain+0x78a27a8>
 4127cfc:      	cmp	x21, #0x0
 4127d00:      	cset	w8, ne
 4127d04:      	cmp	x21, x0
 4127d08:      	ccmp	x21, #0x0, #0x4, ne
 4127d0c:      	b.eq	0x4127cbc <_ChromeMain+0x4122a20>
 4127d10:      	ldr	x21, [x21, #0x48]
 4127d14:      	cmp	x21, #0x0
 4127d18:      	cset	w8, ne
 4127d1c:      	ccmp	x21, x0, #0x4, ne
 4127d20:      	b.ne	0x4127d10 <_ChromeMain+0x4122a74>
 4127d24:      	b	0x4127cbc <_ChromeMain+0x4122a20>
