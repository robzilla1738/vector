
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42a5a28:      	sub	sp, sp, #0x170
 42a5a2c:      	stp	x24, x23, [sp, #0x130]
 42a5a30:      	stp	x22, x21, [sp, #0x140]
 42a5a34:      	stp	x20, x19, [sp, #0x150]
 42a5a38:      	stp	x29, x30, [sp, #0x160]
 42a5a3c:      	add	x29, sp, #0x160
 42a5a40:      	ldr	w8, [x0, #0x390]
 42a5a44:      	cmp	w8, #0x1
 42a5a48:      	b.ne	0x42a5a58 <_ChromeMain+0x42a07bc>
 42a5a4c:      	mov	x19, x0
 42a5a50:      	ldr	x8, [x0, #0x190]
 42a5a54:      	cbz	x8, 0x42a5a70 <_ChromeMain+0x42a07d4>
 42a5a58:      	ldp	x29, x30, [sp, #0x160]
 42a5a5c:      	ldp	x20, x19, [sp, #0x150]
 42a5a60:      	ldp	x22, x21, [sp, #0x140]
 42a5a64:      	ldp	x24, x23, [sp, #0x130]
 42a5a68:      	add	sp, sp, #0x170
 42a5a6c:      	ret
 42a5a70:      	add	x0, x19, #0x2b8
 42a5a74:      	bl	0x72e718 <_ChromeMain+0x72947c>
 42a5a78:      	ldr	x8, [x19, #0x398]
 42a5a7c:      	cbz	x8, 0x42a5a98 <_ChromeMain+0x42a07fc>
 42a5a80:      	ldapurb	w8, [x8, #0x4]
 42a5a84:      	cbnz	w8, 0x42a5a98 <_ChromeMain+0x42a07fc>
 42a5a88:      	ldr	x1, [x19, #0x3a0]
 42a5a8c:      	cbz	x1, 0x42a5a98 <_ChromeMain+0x42a07fc>
 42a5a90:      	mov	x0, x19
 42a5a94:      	bl	0x42a4148 <_ChromeMain+0x429eeac>
 42a5a98:      	mov	x0, x19
 42a5a9c:      	bl	0x42abc18 <_ChromeMain+0x42a697c>
 42a5aa0:      	mov	x20, x0
 42a5aa4:      	cbz	w0, 0x42a5b00 <_ChromeMain+0x42a0864>
 42a5aa8:      	ldrb	w8, [x19, #0x3a8]
 42a5aac:      	tbz	w8, #0x0, 0x42a5b00 <_ChromeMain+0x42a0864>
 42a5ab0:      	mov	x0, x19
 42a5ab4:      	ldp	x29, x30, [sp, #0x160]
 42a5ab8:      	ldp	x20, x19, [sp, #0x150]
 42a5abc:      	ldp	x22, x21, [sp, #0x140]
 42a5ac0:      	ldp	x24, x23, [sp, #0x130]
 42a5ac4:      	add	sp, sp, #0x170
 42a5ac8:      	b	0x42abe9c <_ChromeMain+0x42a6c00>
 42a5acc:      	ldr	x8, [x19, #0x188]
 42a5ad0:      	cbnz	x8, 0x42a5b28 <_ChromeMain+0x42a088c>
 42a5ad4:      	ldr	x8, [x19, #0x180]
 42a5ad8:      	cbnz	x8, 0x42a5b28 <_ChromeMain+0x42a088c>
 42a5adc:      	ldr	x0, [x19, #0x288]
 42a5ae0:      	cbnz	x0, 0x42a5c68 <_ChromeMain+0x42a09cc>
 42a5ae4:      	ldrsb	x8, [x19, #0x16f]
 42a5ae8:      	tbz	x8, #0x3f, 0x42a5af0 <_ChromeMain+0x42a0854>
 42a5aec:      	ldr	x8, [x19, #0x160]
 42a5af0:      	cbnz	x8, 0x42a5b28 <_ChromeMain+0x42a088c>
 42a5af4:      	ldrb	w8, [x19, #0x3a8]
 42a5af8:      	cbz	w8, 0x42a5d64 <_ChromeMain+0x42a0ac8>
 42a5afc:      	b	0x42a5c9c <_ChromeMain+0x42a0a00>
 42a5b00:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 42a5b04:      	ldr	x8, [x8, #0xd18]
 42a5b08:      	blr	x8
 42a5b0c:      	ldr	x8, [x19, #0x388]
 42a5b10:      	cmp	x0, x8
 42a5b14:      	b.ge	0x42a5bc0 <_ChromeMain+0x42a0924>
 42a5b18:      	ldrsb	x8, [x19, #0xf7]
 42a5b1c:      	tbz	x8, #0x3f, 0x42a5b24 <_ChromeMain+0x42a0888>
 42a5b20:      	ldr	x8, [x19, #0xe8]
 42a5b24:      	cbz	x8, 0x42a5acc <_ChromeMain+0x42a0830>
 42a5b28:      	adrp	x0, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5b2c:      	add	x0, x0, #0xbee
 42a5b30:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5b34:      	add	x1, x1, #0x193
 42a5b38:      	mov	x8, sp
 42a5b3c:      	mov	w2, #0x6ef              ; =1775
 42a5b40:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a5b44:      	ldr	x20, [x19, #0x420]
 42a5b48:      	cbz	x20, 0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5b4c:      	mov	w8, #0x1                ; =1
 42a5b50:      	ldadd	w8, w8, [x20]
 42a5b54:      	mov	w9, #0x7fffffff         ; =2147483647
 42a5b58:      	cmp	w8, w9
 42a5b5c:      	b.eq	0x42a5ec8 <_ChromeMain+0x42a0c2c>
 42a5b60:      	ldr	x21, [x19, #0x428]
 42a5b64:      	mov	w0, #0x40               ; =64
 42a5b68:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42a5b6c:      	mov	x3, x0
 42a5b70:      	mov	w8, #0x1                ; =1
 42a5b74:      	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 42a5b78:      	add	x9, x9, #0x700
 42a5b7c:      	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 42a5b80:      	add	x10, x10, #0x440
 42a5b84:      	str	w8, [x0]
 42a5b88:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 42a5b8c:      	add	x8, x8, #0x280
 42a5b90:      	adr	x11, 0x42a5a28 <_ChromeMain+0x42a078c>
 42a5b94:      	nop
 42a5b98:      	stp	x9, x10, [x0, #0x8]
 42a5b9c:      	stp	x8, x11, [x0, #0x18]
 42a5ba0:      	stp	xzr, x20, [x0, #0x28]
 42a5ba4:      	str	x21, [x0, #0x38]
 42a5ba8:      	add	x0, x19, #0x2b8
 42a5bac:      	mov	x1, sp
 42a5bb0:      	mov	w2, #0xd090             ; =53392
 42a5bb4:      	movk	w2, #0x3, lsl #16
 42a5bb8:      	bl	0x4aa504 <_ChromeMain+0x4a5268>
 42a5bbc:      	b	0x42a5a58 <_ChromeMain+0x42a07bc>
 42a5bc0:      	cbnz	w20, 0x42a5be0 <_ChromeMain+0x42a0944>
 42a5bc4:      	mov	x0, x19
 42a5bc8:      	ldp	x29, x30, [sp, #0x160]
 42a5bcc:      	ldp	x20, x19, [sp, #0x150]
 42a5bd0:      	ldp	x22, x21, [sp, #0x140]
 42a5bd4:      	ldp	x24, x23, [sp, #0x130]
 42a5bd8:      	add	sp, sp, #0x170
 42a5bdc:      	b	0x42ac060 <_ChromeMain+0x42a6dc4>
 42a5be0:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42a5be4:      	ldr	w8, [x8, #0xb0]
 42a5be8:      	cmp	w8, #0x1
 42a5bec:      	b.gt	0x42a5c40 <_ChromeMain+0x42a09a4>
 42a5bf0:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 42a5bf4:      	ldr	w8, [x8, #0xb88]
 42a5bf8:      	cbnz	w8, 0x42a5c08 <_ChromeMain+0x42a096c>
 42a5bfc:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42a5c00:      	ldr	x8, [x8, #0xb8]
 42a5c04:      	cbz	x8, 0x42a5c40 <_ChromeMain+0x42a09a4>
 42a5c08:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5c0c:      	add	x1, x1, #0x193
 42a5c10:      	mov	x20, sp
 42a5c14:      	mov	x0, sp
 42a5c18:      	mov	w2, #0x72e              ; =1838
 42a5c1c:      	mov	w3, #0x1                ; =1
 42a5c20:      	bl	0x60914c <_ChromeMain+0x603eb0>
 42a5c24:      	adrp	x1, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42a5c28:      	add	x1, x1, #0x14c
 42a5c2c:      	add	x0, x20, #0x10
 42a5c30:      	mov	w2, #0x87               ; =135
 42a5c34:      	bl	0x254bc <_ChromeMain+0x20220>
 42a5c38:      	mov	x0, sp
 42a5c3c:      	bl	0x609080 <_ChromeMain+0x603de4>
 42a5c40:      	adrp	x0, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42a5c44:      	add	x0, x0, #0x14c
 42a5c48:      	mov	w1, #0x87               ; =135
 42a5c4c:      	bl	0x42adc74 <_ChromeMain+0x42a89d8>
 42a5c50:      	mov	x0, x19
 42a5c54:      	bl	0x42abe9c <_ChromeMain+0x42a6c00>
 42a5c58:      	b	0x42a5a58 <_ChromeMain+0x42a07bc>
 42a5c5c:      	blr	x8
 42a5c60:      	tbnz	w0, #0x0, 0x42a5b28 <_ChromeMain+0x42a088c>
 42a5c64:      	b	0x42a5ae4 <_ChromeMain+0x42a0848>
 42a5c68:      	ldr	x8, [x0]
 42a5c6c:      	ldr	x8, [x8, #0x10]
 42a5c70:      	adr	x9, 0x42c88ec <_ChromeMain+0x42c3650>
 42a5c74:      	nop
 42a5c78:      	cmp	x8, x9
 42a5c7c:      	b.ne	0x42a5c5c <_ChromeMain+0x42a09c0>
 42a5c80:      	ldr	x8, [x0, #0x20]
 42a5c84:      	cbz	x8, 0x42a5ae4 <_ChromeMain+0x42a0848>
 42a5c88:      	ldr	x8, [x0, #0x18]
 42a5c8c:      	ldapr	w8, [x8]
 42a5c90:      	cmp	w8, #0x1
 42a5c94:      	b.eq	0x42a5ae4 <_ChromeMain+0x42a0848>
 42a5c98:      	b	0x42a5b28 <_ChromeMain+0x42a088c>
 42a5c9c:      	strb	wzr, [x19, #0x3a8]
 42a5ca0:      	adrp	x0, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5ca4:      	add	x0, x0, #0xbee
 42a5ca8:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5cac:      	add	x1, x1, #0x193
 42a5cb0:      	mov	x8, sp
 42a5cb4:      	mov	w2, #0x6ef              ; =1775
 42a5cb8:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a5cbc:      	ldr	x20, [x19, #0x420]
 42a5cc0:      	cbz	x20, 0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5cc4:      	mov	w8, #0x1                ; =1
 42a5cc8:      	ldadd	w8, w8, [x20]
 42a5ccc:      	mov	w9, #0x7fffffff         ; =2147483647
 42a5cd0:      	cmp	w8, w9
 42a5cd4:      	b.ne	0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5cd8:      	brk	#0
 42a5cdc:      	hlt	#0
 42a5ce0:      	brk	#0x1
 42a5ce4:      	adrp	x0, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5ce8:      	add	x0, x0, #0xbee
 42a5cec:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5cf0:      	add	x1, x1, #0x193
 42a5cf4:      	mov	x8, sp
 42a5cf8:      	mov	w2, #0x6ef              ; =1775
 42a5cfc:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a5d00:      	ldr	x20, [x19, #0x420]
 42a5d04:      	cbz	x20, 0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5d08:      	mov	w8, #0x1                ; =1
 42a5d0c:      	ldadd	w8, w8, [x20]
 42a5d10:      	mov	w9, #0x7fffffff         ; =2147483647
 42a5d14:      	cmp	w8, w9
 42a5d18:      	b.ne	0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5d1c:      	b	0x42a5ee0 <_ChromeMain+0x42a0c44>
 42a5d20:      	adrp	x0, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5d24:      	add	x0, x0, #0xbee
 42a5d28:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42a5d2c:      	add	x1, x1, #0x193
 42a5d30:      	mov	x8, sp
 42a5d34:      	mov	w2, #0x6ef              ; =1775
 42a5d38:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42a5d3c:      	ldr	x20, [x19, #0x420]
 42a5d40:      	cbz	x20, 0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5d44:      	mov	w8, #0x1                ; =1
 42a5d48:      	ldadd	w8, w8, [x20]
 42a5d4c:      	mov	w9, #0x7fffffff         ; =2147483647
 42a5d50:      	cmp	w8, w9
 42a5d54:      	b.ne	0x42a5b60 <_ChromeMain+0x42a08c4>
 42a5d58:      	b	0x42a5ed4 <_ChromeMain+0x42a0c38>
 42a5d5c:      	mov	x22, x8
 42a5d60:      	b	0x42a5dbc <_ChromeMain+0x42a0b20>
 42a5d64:      	ldrsb	x8, [x19, #0xc7]
 42a5d68:      	tbz	x8, #0x3f, 0x42a5d70 <_ChromeMain+0x42a0ad4>
 42a5d6c:      	ldr	x8, [x19, #0xb8]
 42a5d70:      	cbz	x8, 0x42a5ce4 <_ChromeMain+0x42a0a48>
 42a5d74:      	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42a5d78:      	ldr	x8, [x8, #0xcf8]
 42a5d7c:      	cbz	x8, 0x42a5d20 <_ChromeMain+0x42a0a84>
 42a5d80:      	adrp	x20, 0xef00000 <dyld_stub_binder+0xef00000>
 42a5d84:      	ldr	x0, [x20, #0x8f8]
 42a5d88:      	cbz	x0, 0x42a5eec <_ChromeMain+0x42a0c50>
 42a5d8c:      	bl	0x2cc1274 <_ChromeMain+0x2cbbfd8>
 42a5d90:      	cbz	x0, 0x42a5d20 <_ChromeMain+0x42a0a84>
 42a5d94:      	mov	x20, x0
 42a5d98:      	bl	0x42a3a04 <_ChromeMain+0x429e768>
 42a5d9c:      	mov	x8, x0
 42a5da0:      	ldr	x0, [x19, #0x190]
 42a5da4:      	str	x8, [x19, #0x190]
 42a5da8:      	cbz	x0, 0x42a5d5c <_ChromeMain+0x42a0ac0>
 42a5dac:      	bl	0x162db98 <_ChromeMain+0x16288fc>
 42a5db0:      	mov	w1, #0x228              ; =552
 42a5db4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42a5db8:      	ldr	x22, [x19, #0x190]
 42a5dbc:      	ldr	x8, [x19, #0x420]
 42a5dc0:      	cbz	x8, 0x42a5dd8 <_ChromeMain+0x42a0b3c>
 42a5dc4:      	mov	w9, #0x1                ; =1
 42a5dc8:      	ldadd	w9, w9, [x8]
 42a5dcc:      	mov	w10, #0x7fffffff        ; =2147483647
 42a5dd0:      	cmp	w9, w10
 42a5dd4:      	b.eq	0x42a5f0c <_ChromeMain+0x42a0c70>
 42a5dd8:      	ldr	x19, [x19, #0x428]
 42a5ddc:      	mov	w0, #0x40               ; =64
 42a5de0:      	mov	x23, x8
 42a5de4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42a5de8:      	mov	x21, x0
 42a5dec:      	mov	w8, #0x1                ; =1
 42a5df0:      	str	w8, [x0]
 42a5df4:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 42a5df8:      	add	x8, x8, #0x1ac
 42a5dfc:      	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 42a5e00:      	add	x9, x9, #0x440
 42a5e04:      	stp	x8, x9, [x0, #0x8]
 42a5e08:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 42a5e0c:      	add	x8, x8, #0x280
 42a5e10:      	adr	x9, 0x42ac274 <_ChromeMain+0x42a6fd8>
 42a5e14:      	nop
 42a5e18:      	stp	x8, x9, [x0, #0x18]
 42a5e1c:      	stp	xzr, x23, [x0, #0x28]
 42a5e20:      	str	x19, [x0, #0x38]
 42a5e24:      	mov	x19, x22
 42a5e28:      	ldr	x23, [x22, #0x28]
 42a5e2c:      	mov	w0, #0x78               ; =120
 42a5e30:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42a5e34:      	mov	x22, x0
 42a5e38:      	and	x8, x19, #0xfffffffc00000000
 42a5e3c:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42a5e40:      	ldr	x9, [x9, #0x88]
 42a5e44:      	cmp	x8, x9
 42a5e48:      	b.ne	0x42a5e54 <_ChromeMain+0x42a0bb8>
 42a5e4c:      	mov	x0, x19
 42a5e50:      	bl	0x142fc <_ChromeMain+0xf060>
 42a5e54:      	cmp	x23, #0x0
 42a5e58:      	cset	w8, ne
 42a5e5c:      	strb	w8, [x22, #0x10]
 42a5e60:      	adrp	x8, 0xe2fe000 <dyld_stub_binder+0xe2fe000>
 42a5e64:      	add	x8, x8, #0xa50
 42a5e68:      	stp	x8, x19, [x22]
 42a5e6c:      	add	x8, x8, #0x50
 42a5e70:      	mov	w9, #0x4000             ; =16384
 42a5e74:      	stp	x8, x9, [x22, #0x18]
 42a5e78:      	strb	wzr, [x22, #0x28]
 42a5e7c:      	strb	wzr, [x22, #0x40]
 42a5e80:      	str	x21, [x22, #0x48]
 42a5e84:      	ldr	q0, [x19, #0x60]
 42a5e88:      	ldr	w8, [x19, #0x70]
 42a5e8c:      	str	w8, [x22, #0x60]
 42a5e90:      	str	q0, [x22, #0x50]
 42a5e94:      	ldr	x8, [x19, #0x78]
 42a5e98:      	stp	x8, xzr, [x22, #0x68]
 42a5e9c:      	ldr	x0, [x19, #0xb0]
 42a5ea0:      	str	x22, [x19, #0xb0]
 42a5ea4:      	cbnz	x0, 0x42a5f18 <_ChromeMain+0x42a0c7c>
 42a5ea8:      	mov	x0, x19
 42a5eac:      	mov	x1, x20
 42a5eb0:      	ldp	x29, x30, [sp, #0x160]
 42a5eb4:      	ldp	x20, x19, [sp, #0x150]
 42a5eb8:      	ldp	x22, x21, [sp, #0x140]
 42a5ebc:      	ldp	x24, x23, [sp, #0x130]
 42a5ec0:      	add	sp, sp, #0x170
 42a5ec4:      	b	0x2195d00 <_ChromeMain+0x2190a64>
 42a5ec8:      	brk	#0
 42a5ecc:      	hlt	#0
 42a5ed0:      	brk	#0x1
 42a5ed4:      	brk	#0
 42a5ed8:      	hlt	#0
 42a5edc:      	brk	#0x1
 42a5ee0:      	brk	#0
 42a5ee4:      	hlt	#0
 42a5ee8:      	brk	#0x1
 42a5eec:      	bl	0x2a79b5c <_ChromeMain+0x2a748c0>
 42a5ef0:      	ldr	x0, [x20, #0x8f8]
 42a5ef4:      	cbnz	x0, 0x42a5d8c <_ChromeMain+0x42a0af0>
 42a5ef8:      	bl	0x16cc0 <_ChromeMain+0x11a24>
 42a5efc:      	tbz	w0, #0x0, 0x42a5f28 <_ChromeMain+0x42a0c8c>
 42a5f00:      	ldr	x0, [x20, #0x8f8]
