
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620af0:      	sub	sp, sp, #0x60
 4620af4:      	stp	x24, x23, [sp, #0x20]
 4620af8:      	stp	x22, x21, [sp, #0x30]
 4620afc:      	stp	x20, x19, [sp, #0x40]
 4620b00:      	stp	x29, x30, [sp, #0x50]
 4620b04:      	add	x29, sp, #0x50
 4620b08:      	ldrb	w8, [x0, #0x444]
 4620b0c:      	cbz	w8, 0x4620b18 <_ChromeMain+0x461b87c>
 4620b10:      	ldrb	w8, [x0, #0x448]
 4620b14:      	cbnz	w8, 0x4620b34 <_ChromeMain+0x461b898>
 4620b18:      	strb	wzr, [x0, #0x444]
 4620b1c:      	ldp	x29, x30, [sp, #0x50]
 4620b20:      	ldp	x20, x19, [sp, #0x40]
 4620b24:      	ldp	x22, x21, [sp, #0x30]
 4620b28:      	ldp	x24, x23, [sp, #0x20]
 4620b2c:      	add	sp, sp, #0x60
 4620b30:      	ret
 4620b34:      	ldr	x19, [x0, #0x3d0]
 4620b38:      	cbz	x19, 0x4620b18 <_ChromeMain+0x461b87c>
 4620b3c:      	cbz	x0, 0x4620b1c <_ChromeMain+0x461b880>
 4620b40:      	ldr	x8, [x19, #0x700]
 4620b44:      	cmp	x8, x0
 4620b48:      	b.ne	0x4620b1c <_ChromeMain+0x461b880>
 4620b4c:      	ldr	x20, [x19, #0x6f8]
 4620b50:      	cbz	x20, 0x4620b1c <_ChromeMain+0x461b880>
 4620b54:      	ldrb	w8, [x19, #0x740]
 4620b58:      	cbz	w8, 0x4620b80 <_ChromeMain+0x461b8e4>
 4620b5c:      	ldr	w8, [x20, #0xf8]
 4620b60:      	ldr	x9, [x19, #0x7c0]
 4620b64:      	cmp	w8, #0x0
 4620b68:      	ccmp	x9, x20, #0x0, eq
 4620b6c:      	b.ne	0x4620b80 <_ChromeMain+0x461b8e4>
 4620b70:      	ldr	x8, [x19, #0x6d8]
 4620b74:      	cmp	x8, #0x0
 4620b78:      	cset	w21, ne
 4620b7c:      	b	0x4620b84 <_ChromeMain+0x461b8e8>
 4620b80:      	mov	w21, #0x0               ; =0
 4620b84:      	and	x8, x20, #0xfffffffc00000000
 4620b88:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4620b8c:      	ldr	x9, [x22, #0x88]
 4620b90:      	cmp	x8, x9
 4620b94:      	b.ne	0x4620ba4 <_ChromeMain+0x461b908>
 4620b98:      	mov	x0, x20
 4620b9c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4620ba0:      	ldr	x0, [x19, #0x700]
 4620ba4:      	str	xzr, [x19, #0x6f8]
 4620ba8:      	and	x8, x0, #0xfffffffc00000000
 4620bac:      	ldr	x9, [x22, #0x88]
 4620bb0:      	cmp	x8, x9
 4620bb4:      	b.ne	0x4620bbc <_ChromeMain+0x461b920>
 4620bb8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4620bbc:      	str	xzr, [x19, #0x700]
 4620bc0:      	strb	wzr, [x19, #0x740]
 4620bc4:      	add	x23, x19, #0x7a8
 4620bc8:      	ldr	x0, [x19, #0x7a8]
 4620bcc:      	and	x8, x0, #0xfffffffc00000000
 4620bd0:      	ldr	x9, [x22, #0x88]
 4620bd4:      	cmp	x8, x9
 4620bd8:      	b.ne	0x4620be0 <_ChromeMain+0x461b944>
 4620bdc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4620be0:      	stp	xzr, xzr, [x23]
 4620be4:      	strb	wzr, [x23, #0x10]
 4620be8:      	ldr	x0, [x19, #0x7c0]
 4620bec:      	and	x8, x0, #0xfffffffc00000000
 4620bf0:      	ldr	x9, [x22, #0x88]
 4620bf4:      	cmp	x8, x9
 4620bf8:      	b.ne	0x4620c00 <_ChromeMain+0x461b964>
 4620bfc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4620c00:      	str	xzr, [x19, #0x7c0]
 4620c04:      	mov	x0, x19
 4620c08:      	mov	w1, #0x1                ; =1
 4620c0c:      	bl	0x46155c0 <_ChromeMain+0x4610324>
 4620c10:      	ldr	x8, [x19, #0x5d8]
 4620c14:      	lsl	x22, x8, #4
 4620c18:      	cbz	x22, 0x4620c48 <_ChromeMain+0x461b9ac>
 4620c1c:      	ldr	x8, [x19, #0x5d0]
 4620c20:      	add	x23, x8, #0x8
 4620c24:      	b	0x4620c38 <_ChromeMain+0x461b99c>
 4620c28:      	str	wzr, [x0, #0x454]
 4620c2c:      	bl	0x5a117c <_ChromeMain+0x59bee0>
 4620c30:      	subs	x22, x22, #0x10
 4620c34:      	b.eq	0x4620c48 <_ChromeMain+0x461b9ac>
 4620c38:      	ldr	x0, [x23], #0x10
 4620c3c:      	ldr	w8, [x0, #0x454]
 4620c40:      	cbz	w8, 0x4620c30 <_ChromeMain+0x461b994>
 4620c44:      	b	0x4620c28 <_ChromeMain+0x461b98c>
 4620c48:      	stp	xzr, xzr, [sp, #0x10]
 4620c4c:      	stp	xzr, xzr, [sp]
 4620c50:      	add	x2, sp, #0x18
 4620c54:      	mov	x3, sp
 4620c58:      	mov	x0, x19
 4620c5c:      	mov	w1, #0x0                ; =0
 4620c60:      	mov	w4, #0x0                ; =0
 4620c64:      	bl	0x461bc0c <_ChromeMain+0x4616970>
 4620c68:      	ldrsb	w8, [sp, #0x17]
 4620c6c:      	tbz	w8, #0x1f, 0x4620c80 <_ChromeMain+0x461b9e4>
 4620c70:      	ldr	x0, [sp]
 4620c74:      	ldr	x8, [sp, #0x10]
 4620c78:      	lsl	x1, x8, #1
 4620c7c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4620c80:      	tbz	w21, #0x0, 0x4620cd8 <_ChromeMain+0x461ba3c>
 4620c84:      	ldr	x21, [x19, #0x6d8]
 4620c88:      	cbz	x21, 0x4620d44 <_ChromeMain+0x461baa8>
 4620c8c:      	mov	w8, #0x1                ; =1
 4620c90:      	ldadd	w8, w8, [x21]
 4620c94:      	cmp	w8, #0x0
 4620c98:      	b.le	0x4620d50 <_ChromeMain+0x461bab4>
 4620c9c:      	mov	w9, #0x7fffffff         ; =2147483647
 4620ca0:      	cmp	w8, w9
 4620ca4:      	b.eq	0x4620d5c <_ChromeMain+0x461bac0>
 4620ca8:      	ldr	x8, [x19, #0x6d8]
 4620cac:      	ldr	x8, [x8, #0x8]
 4620cb0:      	mov	x0, x21
 4620cb4:      	mov	x1, x20
 4620cb8:      	blr	x8
 4620cbc:      	mov	w8, #-0x1               ; =-1
 4620cc0:      	ldaddal	w8, w8, [x21]
 4620cc4:      	cmp	w8, #0x1
 4620cc8:      	b.ne	0x4620cd8 <_ChromeMain+0x461ba3c>
 4620ccc:      	ldr	x8, [x21, #0x10]
 4620cd0:      	mov	x0, x21
 4620cd4:      	blr	x8
 4620cd8:      	ldr	x20, [x19, #0x6e0]
 4620cdc:      	cbz	x20, 0x4620b1c <_ChromeMain+0x461b880>
 4620ce0:      	mov	w8, #0x1                ; =1
 4620ce4:      	ldadd	w8, w8, [x20]
 4620ce8:      	cmp	w8, #0x0
 4620cec:      	b.le	0x4620d2c <_ChromeMain+0x461ba90>
 4620cf0:      	mov	w9, #0x7fffffff         ; =2147483647
 4620cf4:      	cmp	w8, w9
 4620cf8:      	b.eq	0x4620d38 <_ChromeMain+0x461ba9c>
 4620cfc:      	ldr	x8, [x19, #0x6e0]
 4620d00:      	ldr	x8, [x8, #0x8]
 4620d04:      	mov	x0, x20
 4620d08:      	blr	x8
 4620d0c:      	mov	w8, #-0x1               ; =-1
 4620d10:      	ldaddal	w8, w8, [x20]
 4620d14:      	cmp	w8, #0x1
 4620d18:      	b.ne	0x4620b1c <_ChromeMain+0x461b880>
 4620d1c:      	ldr	x8, [x20, #0x10]
 4620d20:      	mov	x0, x20
 4620d24:      	blr	x8
 4620d28:      	b	0x4620b1c <_ChromeMain+0x461b880>
 4620d2c:      	brk	#0
 4620d30:      	hlt	#0
 4620d34:      	brk	#0x1
 4620d38:      	brk	#0
 4620d3c:      	hlt	#0
 4620d40:      	brk	#0x1
 4620d44:      	brk	#0
 4620d48:      	hlt	#0
 4620d4c:      	brk	#0x1
 4620d50:      	brk	#0
 4620d54:      	hlt	#0
 4620d58:      	brk	#0x1
 4620d5c:      	brk	#0
 4620d60:      	hlt	#0
 4620d64:      	brk	#0x1
