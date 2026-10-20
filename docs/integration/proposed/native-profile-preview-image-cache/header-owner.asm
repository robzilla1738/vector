
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e3b98: f8bfc320     	ldapr	x0, [x25]
 37e3b9c: b400cc80     	cbz	x0, 0x37e552c <_ChromeMain+0x37e0290>
 37e3ba0: 52806201     	mov	w1, #0x310              ; =784
 37e3ba4: d2800002     	mov	x2, #0x0                ; =0
 37e3ba8: 97231e82     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3bac: aa0003f4     	mov	x20, x0
 37e3bb0: 976e2d64     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e3bb4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3bb8: f9404789     	ldr	x9, [x28, #0x88]
 37e3bbc: eb09011f     	cmp	x8, x9
 37e3bc0: 54000061     	b.ne	0x37e3bcc <_ChromeMain+0x37de930>
 37e3bc4: aa1403e0     	mov	x0, x20
 37e3bc8: 9720c1cd     	bl	0x142fc <_ChromeMain+0xf060>
 37e3bcc: f942d660     	ldr	x0, [x19, #0x5a8]
 37e3bd0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3bd4: f9404789     	ldr	x9, [x28, #0x88]
 37e3bd8: eb09011f     	cmp	x8, x9
 37e3bdc: 54000041     	b.ne	0x37e3be4 <_ChromeMain+0x37de948>
 37e3be0: 9720fb97     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3be4: f902d674     	str	x20, [x19, #0x5a8]
 37e3be8: 52800400     	mov	w0, #0x20               ; =32
 37e3bec: 9720addf     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3bf0: aa0003e1     	mov	x1, x0
 37e3bf4: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 37e3bf8: b9000808     	str	w8, [x0, #0x8]
 37e3bfc: 52800028     	mov	w8, #0x1                ; =1
 37e3c00: 39003008     	strb	w8, [x0, #0xc]
 37e3c04: b0055b48     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 37e3c08: 91044108     	add	x8, x8, #0x110
 37e3c0c: f9000008     	str	x8, [x0]
 37e3c10: d004f808     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 37e3c14: d503201f     	nop
 37e3c18: 3dc05500     	ldr	q0, [x8, #0x150]
 37e3c1c: 3d800400     	str	q0, [x0, #0x10]
 37e3c20: f9400288     	ldr	x8, [x20]
 37e3c24: f9408908     	ldr	x8, [x8, #0x110]
 37e3c28: aa1403e0     	mov	x0, x20
 37e3c2c: d63f0100     	blr	x8
 37e3c30: f942d660     	ldr	x0, [x19, #0x5a8]
 37e3c34: d2c00541     	mov	x1, #0x2a00000000       ; =180388626432
 37e3c38: 52800022     	mov	w2, #0x1                ; =1
 37e3c3c: 97bfb789     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 37e3c40: f942d660     	ldr	x0, [x19, #0x5a8]
 37e3c44: 52800021     	mov	w1, #0x1                ; =1
 37e3c48: 9790c711     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 37e3c4c: f942d668     	ldr	x8, [x19, #0x5a8]
 37e3c50: f9401108     	ldr	x8, [x8, #0x20]
 37e3c54: b9400909     	ldr	w9, [x8, #0x8]
 37e3c58: 7100093f     	cmp	w9, #0x2
 37e3c5c: 5400d500     	b.eq	0x37e56fc <_ChromeMain+0x37e0460>
 37e3c60: 39422909     	ldrb	w9, [x8, #0x8a]
 37e3c64: 340000e9     	cbz	w9, 0x37e3c80 <_ChromeMain+0x37de9e4>
 37e3c68: 3902291f     	strb	wzr, [x8, #0x8a]
 37e3c6c: f940b500     	ldr	x0, [x8, #0x168]
 37e3c70: 52800001     	mov	w1, #0x0                ; =0
 37e3c74: 9757a7b3     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 37e3c78: f942d668     	ldr	x8, [x19, #0x5a8]
 37e3c7c: f9401108     	ldr	x8, [x8, #0x20]
 37e3c80: f940b500     	ldr	x0, [x8, #0x168]
 37e3c84: 52800035     	mov	w21, #0x1               ; =1
 37e3c88: 52800021     	mov	w1, #0x1                ; =1
 37e3c8c: 97a8d2ee     	bl	0x2218844 <_ChromeMain+0x22135a8>
 37e3c90: f942d676     	ldr	x22, [x19, #0x5a8]
 37e3c94: 52800800     	mov	w0, #0x40               ; =64
 37e3c98: 9720adb4     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3c9c: b9000015     	str	w21, [x0]
 37e3ca0: 90fec228     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 37e3ca4: 91260109     	add	x9, x8, #0x980
 37e3ca8: f0fe5868     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e3cac: 91220108     	add	x8, x8, #0x880
 37e3cb0: a900a009     	stp	x9, x8, [x0, #0x8]
 37e3cb4: f0001a08     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e3cb8: 91310108     	add	x8, x8, #0xc40
 37e3cbc: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e3cc0: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e3cc4: 3c828000     	stur	q0, [x0, #0x28]
 37e3cc8: 3900e01f     	strb	wzr, [x0, #0x38]
 37e3ccc: f90083e0     	str	x0, [sp, #0x100]
 37e3cd0: 0f000420     	movi.2s	v0, #0x1
 37e3cd4: fd0087e0     	str	d0, [sp, #0x108]
 37e3cd8: 52800068     	mov	w8, #0x3                ; =3
 37e3cdc: b90113e8     	str	w8, [sp, #0x110]
 37e3ce0: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 37e3ce4: f9008fff     	str	xzr, [sp, #0x118]
 37e3ce8: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e3cec: 91152021     	add	x1, x1, #0x548
 37e3cf0: 910362c0     	add	x0, x22, #0xd8
 37e3cf4: 910403e2     	add	x2, sp, #0x100
 37e3cf8: 9790c1a5     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e3cfc: 910403e0     	add	x0, sp, #0x100
 37e3d00: 977d9c09     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e3d04: 3945a688     	ldrb	w8, [x20, #0x169]
 37e3d08: 3500d008     	cbnz	w8, 0x37e5708 <_ChromeMain+0x37e046c>
 37e3d0c: f940ce62     	ldr	x2, [x19, #0x198]
 37e3d10: aa1303e0     	mov	x0, x19
 37e3d14: aa1403e1     	mov	x1, x20
 37e3d18: 973e55b9     	bl	0x7793fc <_ChromeMain+0x774160>
 37e3d1c: f8bfc320     	ldapr	x0, [x25]
 37e3d20: b400c0a0     	cbz	x0, 0x37e5534 <_ChromeMain+0x37e0298>
 37e3d24: 5280bd01     	mov	w1, #0x5e8              ; =1512
 37e3d28: d2800002     	mov	x2, #0x0                ; =0
 37e3d2c: 97231e21     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3d30: aa0003f5     	mov	x21, x0
 37e3d34: aa1b03e1     	mov	x1, x27
 37e3d38: aa1303e2     	mov	x2, x19
 37e3d3c: 9439e22d     	bl	0x465c5f0 <_ChromeMain+0x4657354>
 37e3d40: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3d44: f9404789     	ldr	x9, [x28, #0x88]
 37e3d48: eb09011f     	cmp	x8, x9
 37e3d4c: 54000061     	b.ne	0x37e3d58 <_ChromeMain+0x37deabc>
 37e3d50: aa1503e0     	mov	x0, x21
 37e3d54: 9720c16a     	bl	0x142fc <_ChromeMain+0xf060>
 37e3d58: f942ce60     	ldr	x0, [x19, #0x598]
 37e3d5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3d60: f9404789     	ldr	x9, [x28, #0x88]
 37e3d64: eb09011f     	cmp	x8, x9
 37e3d68: 54000041     	b.ne	0x37e3d70 <_ChromeMain+0x37dead4>
 37e3d6c: 9720fb34     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3d70: f902ce75     	str	x21, [x19, #0x598]
 37e3d74: 3954c6a8     	ldrb	w8, [x21, #0x531]
 37e3d78: 370006e8     	tbnz	w8, #0x0, 0x37e3e54 <_ChromeMain+0x37debb8>
