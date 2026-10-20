
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e0df0:      	ldr	x0, [x19, #0x5b0]
 37e0df4:      	mov	w8, #0x2                ; =2
 37e0df8:      	str	w8, [x0, #0x440]
 37e0dfc:      	bl	0x43e9734 <_ChromeMain+0x43e4498>
 37e0e00:      	ldr	x23, [x19, #0x5b0]
 37e0e04:      	mov	w20, #0x1               ; =1
 37e0e08:      	add	x0, sp, #0x100
 37e0e0c:      	mov	w1, #0x1                ; =1
 37e0e10:      	mov	w2, #0x3                ; =3
 37e0e14:      	mov	w3, #0x2                ; =2
 37e0e18:      	mov	w4, #0x0                ; =0
 37e0e1c:      	mov	w5, #0x5                ; =5
 37e0e20:      	bl	0x3b271c0 <_ChromeMain+0x3b21f24>
 37e0e24:      	ldr	x8, [sp, #0x100]
 37e0e28:      	str	xzr, [sp, #0x80]
 37e0e2c:      	str	x8, [sp, #0x70]
 37e0e30:      	cbnz	x8, 0x37e4b7c <_ChromeMain+0x37df8e0>
 37e0e34:      	add	x24, sp, #0x70
 37e0e38:      	ldr	x8, [sp, #0x108]
 37e0e3c:      	stur	x8, [x24, #0x8]
 37e0e40:      	ldr	w8, [sp, #0x110]
 37e0e44:      	stur	w8, [x24, #0x10]
 37e0e48:      	stp	xzr, xzr, [sp, #0x90]
 37e0e4c:      	str	xzr, [sp, #0x88]
 37e0e50:      	ldr	x20, [sp, #0x120]
 37e0e54:      	cbnz	x20, 0x37e5844 <_ChromeMain+0x37e05a8>
 37e0e58:      	mov	w20, #0x1               ; =1
 37e0e5c:      	str	w20, [sp, #0x7c]
 37e0e60:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e0e64:      	add	x1, x1, #0x548
 37e0e68:      	add	x0, x23, #0xd8
 37e0e6c:      	add	x2, sp, #0x70
 37e0e70:      	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e0e74:      	add	x0, sp, #0x70
 37e0e78:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e0e7c:      	add	x0, sp, #0x100
 37e0e80:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e0e84:      	and	x8, x19, #0xfffffffc00000000
 37e0e88:      	ldr	x9, [x28, #0x88]
 37e0e8c:      	cmp	x8, x9
 37e0e90:      	b.ne	0x37e0e9c <_ChromeMain+0x37dbc00>
 37e0e94:      	mov	x0, x19
 37e0e98:      	bl	0x142fc <_ChromeMain+0xf060>
 37e0e9c:      	mov	w0, #0x38               ; =56
 37e0ea0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 37e0ea4:      	mov	x21, x0
 37e0ea8:      	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 37e0eac:      	add	x9, x9, #0x300
 37e0eb0:      	str	w20, [x0]
 37e0eb4:      	adr	x10, 0x3899b40 <_ChromeMain+0x38948a4>
 37e0eb8:      	nop
 37e0ebc:      	adrp	x8, 0x462b000 <_ChromeMain+0x4625d64>
 37e0ec0:      	add	x8, x8, #0xffc
 37e0ec4:      	stp	x9, x10, [x0, #0x8]
 37e0ec8:      	stp	x26, x8, [x0, #0x18]
 37e0ecc:      	stp	xzr, x19, [x0, #0x28]
 37e0ed0:      	ldapr	x0, [x25]
 37e0ed4:      	cbz	x0, 0x37e5484 <_ChromeMain+0x37e01e8>
 37e0ed8:      	mov	w1, #0x338              ; =824
 37e0edc:      	mov	x2, #0x0                ; =0
 37e0ee0:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e0ee4:      	mov	x20, x0
 37e0ee8:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e0eec:      	adrp	x8, 0xe724000 <dyld_stub_binder+0xe724000>
 37e0ef0:      	add	x8, x8, #0x750
 37e0ef4:      	add	x9, x8, #0x3e8
 37e0ef8:      	stp	x8, x9, [x0]
 37e0efc:      	add	x9, x8, #0x410
 37e0f00:      	str	x9, [x0, #0x10]
 37e0f04:      	add	x9, x8, #0x448
 37e0f08:      	add	x10, x8, #0x478
 37e0f0c:      	stp	x9, x10, [x0, #0x68]
 37e0f10:      	add	x9, x8, #0x4c8
 37e0f14:      	str	x9, [x0, #0xb0]
 37e0f18:      	add	x9, x8, #0x528
 37e0f1c:      	str	x9, [x0, #0xd8]
 37e0f20:      	add	x8, x8, #0x558
 37e0f24:      	str	x8, [x0, #0xf8]
 37e0f28:      	str	x21, [x0, #0x310]
 37e0f2c:      	add	x8, x0, #0x320
 37e0f30:      	str	xzr, [x0, #0x320]
 37e0f34:      	str	xzr, [x0, #0x330]
 37e0f38:      	str	xzr, [x0, #0x328]
 37e0f3c:      	str	x8, [x0, #0x318]
 37e0f40:      	mov	w0, #0x140              ; =320
 37e0f44:      	bl	0xf368 <_ChromeMain+0xa0cc>
 37e0f48:      	mov	x21, x0
 37e0f4c:      	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e0f50:      	mov	x0, x20
 37e0f54:      	mov	x1, x21
 37e0f58:      	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e0f5c:      	ldr	w8, [x21, #0xf0]
 37e0f60:      	cmp	w8, #0x1
 37e0f64:      	b.ne	0x37e4ae0 <_ChromeMain+0x37df844>
 37e0f68:      	ldrb	w8, [x21, #0xf4]
 37e0f6c:      	tbnz	w8, #0x0, 0x37e0f84 <_ChromeMain+0x37dbce8>
 37e0f70:      	mov	w8, #0x1                ; =1
 37e0f74:      	strb	w8, [x21, #0xf4]
 37e0f78:      	mov	x0, x21
 37e0f7c:      	mov	w1, #0x1                ; =1
 37e0f80:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 37e0f84:      	mov	w8, #0x3                ; =3
 37e0f88:      	str	w8, [sp, #0x70]
 37e0f8c:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
