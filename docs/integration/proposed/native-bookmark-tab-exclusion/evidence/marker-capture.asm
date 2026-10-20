
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45f4d28:      	ldr	x1, [x21, #0x90]
 45f4d2c:      	cbz	x1, 0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d30:      	ldr	x0, [x21]
 45f4d34:      	bl	0x38a52c <_ChromeMain+0x385290>
 45f4d38:      	tbz	w1, #0x0, 0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d3c:      	tbnz	w0, #0x1f, 0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d40:      	ldr	x8, [x21]
 45f4d44:      	ldr	w9, [x8, #0x18]
 45f4d48:      	cmp	w0, w9
 45f4d4c:      	b.ge	0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d50:      	and	x1, x0, #0x7fffffff
 45f4d54:      	mov	x0, x8
 45f4d58:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 45f4d5c:      	ldr	q0, [x0, #0x80]
 45f4d60:      	ldr	x8, [x0, #0x90]
 45f4d64:      	stur	x8, [x29, #-0x60]
 45f4d68:      	stur	q0, [x29, #-0x70]
 45f4d6c:      	and	x8, x8, #0xff
 45f4d70:      	tbz	w8, #0x0, 0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d74:      	ldr	x0, [x21, #0x8]
 45f4d78:      	sub	x1, x29, #0x70
 45f4d7c:      	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 45f4d80:      	ldurb	w8, [x29, #-0x60]
 45f4d84:      	tbz	w8, #0x0, 0x45f4d24 <_ChromeMain+0x45efa88>
 45f4d88:      	ldr	x24, [x0, #0x20]
 45f4d8c:      	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45f4d90:      	add	x1, x1, #0xf6c
 45f4d94:      	add	x0, x22, #0x8
 45f4d98:      	bl	0x53170 <_ChromeMain+0x4ded4>
 45f4d9c:      	cbz	x0, 0x45f4dcc <_ChromeMain+0x45efb30>
 45f4da0:      	mov	x0, x20
 45f4da4:      	bl	0x45f2388 <_ChromeMain+0x45ed0ec>
 45f4da8:      	b	0x45f46f0 <_ChromeMain+0x45ef454>
 45f4dac:      	ldp	x1, x2, [x24, #0x20]
 45f4db0:      	add	x0, x23, #0x20
 45f4db4:      	bl	0x18218 <_ChromeMain+0x12f7c>
 45f4db8:      	b	0x45f4e24 <_ChromeMain+0x45efb88>
 45f4dbc:      	ldp	x1, x2, [x24]
 45f4dc0:      	sub	x0, x29, #0xb0
 45f4dc4:      	bl	0x46bd0 <_ChromeMain+0x41934>
 45f4dc8:      	b	0x45f4df8 <_ChromeMain+0x45efb5c>
 45f4dcc:      	mov	w0, #0x60               ; =96
 45f4dd0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 45f4dd4:      	mov	x21, x0
 45f4dd8:      	ldur	q0, [x29, #-0x70]
 45f4ddc:      	str	q0, [sp, #0x10]
 45f4de0:      	ldrsb	w8, [x24, #0x17]
 45f4de4:      	tbnz	w8, #0x1f, 0x45f4dbc <_ChromeMain+0x45efb20>
 45f4de8:      	ldr	q0, [x24]
 45f4dec:      	ldr	x8, [x24, #0x10]
 45f4df0:      	stur	x8, [x29, #-0xa0]
 45f4df4:      	stur	q0, [x29, #-0xb0]
 45f4df8:      	sub	x23, x29, #0xb0
 45f4dfc:      	ldr	w8, [x24, #0x18]
 45f4e00:      	ldrb	w9, [x24, #0x1c]
 45f4e04:      	sturb	w9, [x29, #-0x94]
 45f4e08:      	stur	w8, [x29, #-0x98]
 45f4e0c:      	ldrsb	w8, [x24, #0x37]
 45f4e10:      	tbnz	w8, #0x1f, 0x45f4dac <_ChromeMain+0x45efb10>
 45f4e14:      	ldur	q0, [x24, #0x20]
 45f4e18:      	ldur	x8, [x24, #0x30]
 45f4e1c:      	stur	x8, [x23, #0x30]
 45f4e20:      	stur	q0, [x23, #0x20]
 45f4e24:      	ldrb	w8, [x24, #0x38]
 45f4e28:      	sturb	w8, [x29, #-0x78]
 45f4e2c:      	and	x9, x22, #0xfffffffc00000000
 45f4e30:      	ldr	x10, [x25, #0x88]
 45f4e34:      	cmp	x9, x10
 45f4e38:      	b.ne	0x45f4e48 <_ChromeMain+0x45efbac>
 45f4e3c:      	mov	x0, x22
 45f4e40:      	bl	0x142fc <_ChromeMain+0xf060>
 45f4e44:      	ldurb	w8, [x29, #-0x78]
 45f4e48:      	adrp	x9, 0xe507000 <dyld_stub_binder+0xe507000>
 45f4e4c:      	add	x9, x9, #0xda0
 45f4e50:      	stp	x9, x22, [x21]
 45f4e54:      	ldur	q0, [x29, #-0xb0]
 45f4e58:      	ldr	q1, [sp, #0x10]
 45f4e5c:      	stp	q1, q0, [x21, #0x10]
 45f4e60:      	ldur	x9, [x29, #-0xa0]
 45f4e64:      	str	x9, [x21, #0x30]
 45f4e68:      	stp	xzr, xzr, [x29, #-0xb0]
 45f4e6c:      	stur	xzr, [x29, #-0xa0]
 45f4e70:      	ldur	w9, [x23, #0x18]
 45f4e74:      	str	w9, [x21, #0x38]
 45f4e78:      	ldurb	w9, [x23, #0x1c]
 45f4e7c:      	strb	w9, [x21, #0x3c]
 45f4e80:      	ldur	q0, [x23, #0x20]
 45f4e84:      	str	q0, [x21, #0x40]
 45f4e88:      	ldur	x9, [x23, #0x30]
 45f4e8c:      	str	x9, [x21, #0x50]
 45f4e90:      	stp	xzr, xzr, [x23, #0x28]
 45f4e94:      	stur	xzr, [x23, #0x20]
 45f4e98:      	strb	w8, [x21, #0x58]
 45f4e9c:      	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45f4ea0:      	add	x1, x1, #0xf6c
 45f4ea4:      	add	x0, x22, #0x8
 45f4ea8:      	mov	x2, x21
 45f4eac:      	bl	0xf67d00 <_ChromeMain+0xf62a64>
 45f4eb0:      	ldursb	w8, [x29, #-0x79]
 45f4eb4:      	tbz	w8, #0x1f, 0x45f4ec8 <_ChromeMain+0x45efc2c>
 45f4eb8:      	ldur	x0, [x29, #-0x90]
 45f4ebc:      	ldur	x8, [x29, #-0x80]
 45f4ec0:      	and	x1, x8, #0x7fffffffffffffff
 45f4ec4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f4ec8:      	ldursb	w8, [x29, #-0x99]
 45f4ecc:      	tbz	w8, #0x1f, 0x45f4da0 <_ChromeMain+0x45efb04>
 45f4ed0:      	ldur	x0, [x29, #-0xb0]
 45f4ed4:      	ldur	x8, [x29, #-0xa0]
 45f4ed8:      	lsl	x1, x8, #1
 45f4edc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f4ee0:      	b	0x45f4da0 <_ChromeMain+0x45efb04>
