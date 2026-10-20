
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4183b1c:      	sub	sp, sp, #0x90
 4183b20:      	stp	x24, x23, [sp, #0x50]
 4183b24:      	stp	x22, x21, [sp, #0x60]
 4183b28:      	stp	x20, x19, [sp, #0x70]
 4183b2c:      	stp	x29, x30, [sp, #0x80]
 4183b30:      	add	x29, sp, #0x80
 4183b34:      	mov	x19, x1
 4183b38:      	mov	x20, x0
 4183b3c:      	sturh	wzr, [x29, #-0x32]
 4183b40:      	str	xzr, [sp, #0x40]
 4183b44:      	movi.2d	v0, #0000000000000000
 4183b48:      	stp	q0, q0, [sp, #0x20]
 4183b4c:      	add	x23, sp, #0x20
 4183b50:      	add	x0, sp, #0x20
 4183b54:      	mov	w1, #0x0                ; =0
 4183b58:      	bl	0x1df31f4 <_ChromeMain+0x1dedf58>
 4183b5c:      	mov	w0, #0x40               ; =64
 4183b60:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4183b64:      	mov	x21, x0
 4183b68:      	mov	w8, #0x1                ; =1
 4183b6c:      	adr	x9, 0x4183ce4 <_ChromeMain+0x417ea48>
 4183b70:      	nop
 4183b74:      	str	w8, [x0]
 4183b78:      	adrp	x8, 0x3a2a000 <_ChromeMain+0x3a24d64>
 4183b7c:      	add	x8, x8, #0x6d0
 4183b80:      	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 4183b84:      	add	x10, x10, #0xb00
 4183b88:      	stp	x9, x8, [x0, #0x8]
 4183b8c:      	str	x10, [x0, #0x18]
 4183b90:      	and	x9, x23, #0xfffffffc00000000
 4183b94:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4183b98:      	ldr	x8, [x22, #0x88]
 4183b9c:      	cmp	x9, x8
 4183ba0:      	b.ne	0x4183bb0 <_ChromeMain+0x417e914>
 4183ba4:      	add	x0, sp, #0x20
 4183ba8:      	bl	0x142fc <_ChromeMain+0xf060>
 4183bac:      	ldr	x8, [x22, #0x88]
 4183bb0:      	str	x23, [x21, #0x28]
 4183bb4:      	sub	x23, x29, #0x31
 4183bb8:      	and	x9, x23, #0xfffffffc00000000
 4183bbc:      	cmp	x9, x8
 4183bc0:      	b.ne	0x4183bd0 <_ChromeMain+0x417e934>
 4183bc4:      	sub	x0, x29, #0x31
 4183bc8:      	bl	0x142fc <_ChromeMain+0xf060>
 4183bcc:      	ldr	x8, [x22, #0x88]
 4183bd0:      	str	x23, [x21, #0x30]
 4183bd4:      	sub	x23, x29, #0x32
 4183bd8:      	and	x9, x23, #0xfffffffc00000000
 4183bdc:      	cmp	x9, x8
 4183be0:      	b.ne	0x4183bec <_ChromeMain+0x417e950>
 4183be4:      	sub	x0, x29, #0x32
 4183be8:      	bl	0x142fc <_ChromeMain+0xf060>
 4183bec:      	str	x23, [x21, #0x38]
 4183bf0:      	mov	x0, x20
 4183bf4:      	mov	x1, x21
 4183bf8:      	blr	x19
 4183bfc:      	cbnz	w0, 0x4183c08 <_ChromeMain+0x417e96c>
 4183c00:      	mov	w19, #0x1               ; =1
 4183c04:      	b	0x4183c3c <_ChromeMain+0x417e9a0>
 4183c08:      	ldurb	w8, [x29, #-0x32]
 4183c0c:      	tbnz	w8, #0x0, 0x4183c38 <_ChromeMain+0x417e99c>
 4183c10:      	adrp	x0, 0xdad7000 <dyld_stub_binder+0xdad7000>
 4183c14:      	add	x0, x0, #0xb9b
 4183c18:      	adrp	x1, 0xdad7000 <dyld_stub_binder+0xdad7000>
 4183c1c:      	add	x1, x1, #0xb36
 4183c20:      	mov	x8, sp
 4183c24:      	mov	w2, #0xc0               ; =192
 4183c28:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4183c2c:      	add	x0, sp, #0x20
 4183c30:      	mov	x1, sp
 4183c34:      	bl	0x1df3978 <_ChromeMain+0x1dee6dc>
 4183c38:      	ldurb	w19, [x29, #-0x31]
 4183c3c:      	str	xzr, [sp, #0x40]
 4183c40:      	ldr	x8, [sp, #0x38]
 4183c44:      	cbz	x8, 0x4183c70 <_ChromeMain+0x417e9d4>
 4183c48:      	mov	w9, #0x1                ; =1
 4183c4c:      	stlurb	w9, [x8, #0x4]
 4183c50:      	ldr	x0, [sp, #0x38]
 4183c54:      	cbz	x0, 0x4183c70 <_ChromeMain+0x417e9d4>
 4183c58:      	mov	w8, #-0x1               ; =-1
 4183c5c:      	ldaddal	w8, w8, [x0]
 4183c60:      	cmp	w8, #0x1
 4183c64:      	b.ne	0x4183c70 <_ChromeMain+0x417e9d4>
 4183c68:      	mov	w1, #0x8                ; =8
 4183c6c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4183c70:      	ldr	x0, [sp, #0x30]
 4183c74:      	cbz	x0, 0x4183c8c <_ChromeMain+0x417e9f0>
 4183c78:      	add	x8, x0, #0x8
 4183c7c:      	mov	w9, #-0x1               ; =-1
 4183c80:      	ldaddal	w9, w8, [x8]
 4183c84:      	cmp	w8, #0x1
 4183c88:      	b.eq	0x4183cc0 <_ChromeMain+0x417ea24>
 4183c8c:      	ldr	x0, [sp, #0x20]
 4183c90:      	and	x8, x0, #0xfffffffc00000000
 4183c94:      	ldr	x9, [x22, #0x88]
 4183c98:      	cmp	x8, x9
 4183c9c:      	b.ne	0x4183ca4 <_ChromeMain+0x417ea08>
 4183ca0:      	bl	0x26a44 <_ChromeMain+0x217a8>
 4183ca4:      	and	w0, w19, #0x1
 4183ca8:      	ldp	x29, x30, [sp, #0x80]
 4183cac:      	ldp	x20, x19, [sp, #0x70]
 4183cb0:      	ldp	x22, x21, [sp, #0x60]
 4183cb4:      	ldp	x24, x23, [sp, #0x50]
 4183cb8:      	add	sp, sp, #0x90
 4183cbc:      	ret
 4183cc0:      	ldr	x9, [x0]
 4183cc4:      	ldr	x8, [x9, #0x18]
 4183cc8:      	adrp	x10, 0x42ca000 <_ChromeMain+0x42c4d64>
 4183ccc:      	add	x10, x10, #0xa8c
 4183cd0:      	cmp	x8, x10
 4183cd4:      	b.ne	0x4183cdc <_ChromeMain+0x417ea40>
 4183cd8:      	ldr	x8, [x9, #0x10]
 4183cdc:      	blr	x8
 4183ce0:      	b	0x4183c8c <_ChromeMain+0x417e9f0>
