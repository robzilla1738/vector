
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
 37e3d7c: 52800034     	mov	w20, #0x1               ; =1
 37e3d80: 3914c6b4     	strb	w20, [x21, #0x531]
 37e3d84: f9428ea0     	ldr	x0, [x21, #0x518]
 37e3d88: f9400008     	ldr	x8, [x0]
 37e3d8c: f9405108     	ldr	x8, [x8, #0xa0]
 37e3d90: 52800001     	mov	w1, #0x0                ; =0
 37e3d94: d63f0100     	blr	x8
 37e3d98: f94296a0     	ldr	x0, [x21, #0x528]
 37e3d9c: 3954c2a8     	ldrb	w8, [x21, #0x530]
 37e3da0: f9400009     	ldr	x9, [x0]
 37e3da4: f9405129     	ldr	x9, [x9, #0xa0]
 37e3da8: 0a280281     	bic	w1, w20, w8
 37e3dac: d63f0120     	blr	x9
 37e3db0: f94292b4     	ldr	x20, [x21, #0x520]
 37e3db4: 3954c2a8     	ldrb	w8, [x21, #0x530]
 37e3db8: 37000308     	tbnz	w8, #0x0, 0x37e3e18 <_ChromeMain+0x37deb7c>
 37e3dbc: 3954c6a8     	ldrb	w8, [x21, #0x531]
 37e3dc0: 370002c8     	tbnz	w8, #0x0, 0x37e3e18 <_ChromeMain+0x37deb7c>
 37e3dc4: f9426aa8     	ldr	x8, [x21, #0x4d0]
 37e3dc8: f9429d08     	ldr	x8, [x8, #0x538]
 37e3dcc: f9403500     	ldr	x0, [x8, #0x68]
 37e3dd0: b4000240     	cbz	x0, 0x37e3e18 <_ChromeMain+0x37deb7c>
 37e3dd4: f9400008     	ldr	x8, [x0]
 37e3dd8: f940b908     	ldr	x8, [x8, #0x170]
 37e3ddc: d63f0100     	blr	x8
 37e3de0: b40001c0     	cbz	x0, 0x37e3e18 <_ChromeMain+0x37deb7c>
 37e3de4: aa0003f6     	mov	x22, x0
 37e3de8: b004b7c1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 37e3dec: 9102fc21     	add	x1, x1, #0xbf
 37e3df0: 52800322     	mov	w2, #0x19               ; =25
 37e3df4: 97336396     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 37e3df8: b4000100     	cbz	x0, 0x37e3e18 <_ChromeMain+0x37deb7c>
 37e3dfc: b004b7c1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 37e3e00: 9102fc21     	add	x1, x1, #0xbf
 37e3e04: aa1603e0     	mov	x0, x22
 37e3e08: 52800322     	mov	w2, #0x19               ; =25
 37e3e0c: 972c89bd     	bl	0x306500 <_ChromeMain+0x301264>
 37e3e10: aa0003e1     	mov	x1, x0
 37e3e14: 14000002     	b	0x37e3e1c <_ChromeMain+0x37deb80>
 37e3e18: 52800001     	mov	w1, #0x0                ; =0
 37e3e1c: f9400288     	ldr	x8, [x20]
 37e3e20: f9405108     	ldr	x8, [x8, #0xa0]
 37e3e24: aa1403e0     	mov	x0, x20
 37e3e28: d63f0100     	blr	x8
 37e3e2c: 395562a8     	ldrb	w8, [x21, #0x558]
 37e3e30: 34000048     	cbz	w8, 0x37e3e38 <_ChromeMain+0x37deb9c>
 37e3e34: 391562bf     	strb	wzr, [x21, #0x558]
 37e3e38: f94002a8     	ldr	x8, [x21]
 37e3e3c: f9418508     	ldr	x8, [x8, #0x308]
 37e3e40: aa1503e0     	mov	x0, x21
 37e3e44: d63f0100     	blr	x8
 37e3e48: aa1503e0     	mov	x0, x21
 37e3e4c: 52800001     	mov	w1, #0x0                ; =0
 37e3e50: 97393189     	bl	0x630474 <_ChromeMain+0x62b1d8>
 37e3e54: f8bfc320     	ldapr	x0, [x25]
 37e3e58: b400b720     	cbz	x0, 0x37e553c <_ChromeMain+0x37e02a0>
 37e3e5c: 52806201     	mov	w1, #0x310              ; =784
 37e3e60: d2800002     	mov	x2, #0x0                ; =0
 37e3e64: 97231dd3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3e68: aa0003f4     	mov	x20, x0
 37e3e6c: 976e2cb5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e3e70: 52802800     	mov	w0, #0x140              ; =320
 37e3e74: 9720ad3d     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3e78: aa0003f6     	mov	x22, x0
 37e3e7c: 97c8b1d5     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e3e80: aa1403e0     	mov	x0, x20
 37e3e84: aa1603e1     	mov	x1, x22
 37e3e88: 978e966c     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e3e8c: b940f2c8     	ldr	w8, [x22, #0xf0]
 37e3e90: 35005f48     	cbnz	w8, 0x37e4a78 <_ChromeMain+0x37df7dc>
 37e3e94: b9410ac8     	ldr	w8, [x22, #0x108]
 37e3e98: 7100051f     	cmp	w8, #0x1
 37e3e9c: 540000c0     	b.eq	0x37e3eb4 <_ChromeMain+0x37dec18>
 37e3ea0: 52800028     	mov	w8, #0x1                ; =1
 37e3ea4: b9010ac8     	str	w8, [x22, #0x108]
 37e3ea8: aa1603e0     	mov	x0, x22
 37e3eac: 52800021     	mov	w1, #0x1                ; =1
 37e3eb0: 978a0500     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 37e3eb4: 52800028     	mov	w8, #0x1                ; =1
 37e3eb8: b90103e8     	str	w8, [sp, #0x100]
 37e3ebc: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e3ec0: 9115a021     	add	x1, x1, #0x568
 37e3ec4: 910462c0     	add	x0, x22, #0x118
 37e3ec8: 910403e2     	add	x2, sp, #0x100
 37e3ecc: 978a04b6     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 37e3ed0: aa1403e0     	mov	x0, x20
 37e3ed4: d2c00301     	mov	x1, #0x1800000000       ; =103079215104
 37e3ed8: 52800022     	mov	w2, #0x1                ; =1
 37e3edc: 97bfb6e1     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 37e3ee0: aa1403e0     	mov	x0, x20
 37e3ee4: 52800021     	mov	w1, #0x1                ; =1
 37e3ee8: 9790c669     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 37e3eec: f9401288     	ldr	x8, [x20, #0x20]
 37e3ef0: b9400909     	ldr	w9, [x8, #0x8]
 37e3ef4: 7100093f     	cmp	w9, #0x2
 37e3ef8: 5400c0e0     	b.eq	0x37e5714 <_ChromeMain+0x37e0478>
 37e3efc: 39422909     	ldrb	w9, [x8, #0x8a]
 37e3f00: 340000a9     	cbz	w9, 0x37e3f14 <_ChromeMain+0x37dec78>
 37e3f04: 3902291f     	strb	wzr, [x8, #0x8a]
 37e3f08: f940b500     	ldr	x0, [x8, #0x168]
 37e3f0c: 52800001     	mov	w1, #0x0                ; =0
 37e3f10: 9757a70c     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 37e3f14: 3945a688     	ldrb	w8, [x20, #0x169]
 37e3f18: 3500c048     	cbnz	w8, 0x37e5720 <_ChromeMain+0x37e0484>
 37e3f1c: f942d660     	ldr	x0, [x19, #0x5a8]
 37e3f20: f940cc02     	ldr	x2, [x0, #0x198]
 37e3f24: aa1403e1     	mov	x1, x20
 37e3f28: 973e5535     	bl	0x7793fc <_ChromeMain+0x774160>
 37e3f2c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e3f30: f9404789     	ldr	x9, [x28, #0x88]
 37e3f34: eb09011f     	cmp	x8, x9
 37e3f38: 54000061     	b.ne	0x37e3f44 <_ChromeMain+0x37deca8>
 37e3f3c: aa1403e0     	mov	x0, x20
 37e3f40: 9720c0ef     	bl	0x142fc <_ChromeMain+0xf060>
 37e3f44: f942f260     	ldr	x0, [x19, #0x5e0]
 37e3f48: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3f4c: f9404789     	ldr	x9, [x28, #0x88]
 37e3f50: eb09011f     	cmp	x8, x9
 37e3f54: 54000041     	b.ne	0x37e3f5c <_ChromeMain+0x37decc0>
 37e3f58: 9720fab9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3f5c: f902f274     	str	x20, [x19, #0x5e0]
 37e3f60: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e3f64: f9404789     	ldr	x9, [x28, #0x88]
 37e3f68: eb09011f     	cmp	x8, x9
 37e3f6c: 54000061     	b.ne	0x37e3f78 <_ChromeMain+0x37decdc>
 37e3f70: aa1303e0     	mov	x0, x19
 37e3f74: 9720c0e2     	bl	0x142fc <_ChromeMain+0xf060>
 37e3f78: 52800700     	mov	w0, #0x38               ; =56
 37e3f7c: 9720acfb     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3f80: 52800028     	mov	w8, #0x1                ; =1
 37e3f84: b9000008     	str	w8, [x0]
 37e3f88: d0007268     	adrp	x8, 0x4631000 <_ChromeMain+0x462bd64>
 37e3f8c: 91146108     	add	x8, x8, #0x518
 37e3f90: d0003aa9     	adrp	x9, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e3f94: 913a012a     	add	x10, x9, #0xe80
 37e3f98: 105add49     	adr	x9, 0x3899b40 <_ChromeMain+0x38948a4>
 37e3f9c: d503201f     	nop
 37e3fa0: a900a40a     	stp	x10, x9, [x0, #0x8]
 37e3fa4: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e3fa8: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e3fac: f90083e0     	str	x0, [sp, #0x100]
 37e3fb0: 910403e0     	add	x0, sp, #0x100
 37e3fb4: 943933f3     	bl	0x4630f80 <_ChromeMain+0x462bce4>
 37e3fb8: aa0003f4     	mov	x20, x0
 37e3fbc: f94083e0     	ldr	x0, [sp, #0x100]
 37e3fc0: b50064e0     	cbnz	x0, 0x37e4c5c <_ChromeMain+0x37df9c0>
 37e3fc4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e3fc8: f9404789     	ldr	x9, [x28, #0x88]
 37e3fcc: eb09011f     	cmp	x8, x9
 37e3fd0: 54000061     	b.ne	0x37e3fdc <_ChromeMain+0x37ded40>
 37e3fd4: aa1403e0     	mov	x0, x20
 37e3fd8: 9720c0c9     	bl	0x142fc <_ChromeMain+0xf060>
 37e3fdc: f942d260     	ldr	x0, [x19, #0x5a0]
 37e3fe0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3fe4: f9404789     	ldr	x9, [x28, #0x88]
 37e3fe8: eb09011f     	cmp	x8, x9
 37e3fec: 54000041     	b.ne	0x37e3ff4 <_ChromeMain+0x37ded58>
 37e3ff0: 9720fa93     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3ff4: f902d274     	str	x20, [x19, #0x5a0]
 37e3ff8: 3945a6a8     	ldrb	w8, [x21, #0x169]
 37e3ffc: 3500b988     	cbnz	w8, 0x37e572c <_ChromeMain+0x37e0490>
 37e4000: f942d660     	ldr	x0, [x19, #0x5a8]
 37e4004: aa1503e1     	mov	x1, x21
 37e4008: d2800002     	mov	x2, #0x0                ; =0
 37e400c: 973e54fc     	bl	0x7793fc <_ChromeMain+0x774160>
 37e4010: 3945a688     	ldrb	w8, [x20, #0x169]
 37e4014: 3500b928     	cbnz	w8, 0x37e5738 <_ChromeMain+0x37e049c>
 37e4018: f942d660     	ldr	x0, [x19, #0x5a8]
 37e401c: f940cc02     	ldr	x2, [x0, #0x198]
 37e4020: aa1403e1     	mov	x1, x20
 37e4024: 973e54f6     	bl	0x7793fc <_ChromeMain+0x774160>
 37e4028: f9429f76     	ldr	x22, [x27, #0x538]
 37e402c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e4030: f9404789     	ldr	x9, [x28, #0x88]
 37e4034: eb09011f     	cmp	x8, x9
 37e4038: 54000061     	b.ne	0x37e4044 <_ChromeMain+0x37deda8>
 37e403c: aa1303e0     	mov	x0, x19
 37e4040: 9720c0af     	bl	0x142fc <_ChromeMain+0xf060>
 37e4044: 52800700     	mov	w0, #0x38               ; =56
 37e4048: 9720acc8     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e404c: aa0003f5     	mov	x21, x0
 37e4050: 52800028     	mov	w8, #0x1                ; =1
 37e4054: b9000008     	str	w8, [x0]
 37e4058: b0003aa8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e405c: 913a0109     	add	x9, x8, #0xe80
 37e4060: 105ad708     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e4064: d503201f     	nop
 37e4068: a900a009     	stp	x9, x8, [x0, #0x8]
 37e406c: a901e01a     	stp	x26, x24, [x0, #0x18]
 37e4070: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e4074: f8bfc320     	ldapr	x0, [x25]
 37e4078: b400a660     	cbz	x0, 0x37e5544 <_ChromeMain+0x37e02a8>
 37e407c: 52808001     	mov	w1, #0x400              ; =1024
 37e4080: d2800002     	mov	x2, #0x0                ; =0
 37e4084: 97231d4b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e4088: aa0003f4     	mov	x20, x0
 37e408c: f9442661     	ldr	x1, [x19, #0x848]
 37e4090: 9100a2c8     	add	x8, x22, #0x28
 37e4094: f10002df     	cmp	x22, #0x0
 37e4098: 9a8803e3     	csel	x3, xzr, x8, eq
 37e409c: f9401fe2     	ldr	x2, [sp, #0x38]
 37e40a0: aa1503e4     	mov	x4, x21
 37e40a4: 97f8f697     	bl	0x3621b00 <_ChromeMain+0x361c864>
 37e40a8: 3945a408     	ldrb	w8, [x0, #0x169]
 37e40ac: 3500b4c8     	cbnz	w8, 0x37e5744 <_ChromeMain+0x37e04a8>
 37e40b0: f940ce62     	ldr	x2, [x19, #0x198]
 37e40b4: aa1303e0     	mov	x0, x19
 37e40b8: aa1403e1     	mov	x1, x20
 37e40bc: 973e54d0     	bl	0x7793fc <_ChromeMain+0x774160>
 37e40c0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e40c4: f9404789     	ldr	x9, [x28, #0x88]
 37e40c8: eb09011f     	cmp	x8, x9
 37e40cc: 54000061     	b.ne	0x37e40d8 <_ChromeMain+0x37dee3c>
 37e40d0: aa1403e0     	mov	x0, x20
 37e40d4: 9720c08a     	bl	0x142fc <_ChromeMain+0xf060>
 37e40d8: f9437a60     	ldr	x0, [x19, #0x6f0]
 37e40dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e40e0: f9404789     	ldr	x9, [x28, #0x88]
 37e40e4: eb09011f     	cmp	x8, x9
 37e40e8: 54000041     	b.ne	0x37e40f0 <_ChromeMain+0x37dee54>
 37e40ec: 9720fa54     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e40f0: f9037a74     	str	x20, [x19, #0x6f0]
 37e40f4: 52800800     	mov	w0, #0x40               ; =64
 37e40f8: 9720ac9c     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e40fc: 52800028     	mov	w8, #0x1                ; =1
 37e4100: b9000008     	str	w8, [x0]
 37e4104: f0fec208     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 37e4108: 91260109     	add	x9, x8, #0x980
 37e410c: d0fe5868     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e4110: 91220108     	add	x8, x8, #0x880
 37e4114: a900a009     	stp	x9, x8, [x0, #0x8]
 37e4118: d0001a08     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e411c: 91310108     	add	x8, x8, #0xc40
 37e4120: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e4124: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e4128: 3c828000     	stur	q0, [x0, #0x28]
 37e412c: 3900e01f     	strb	wzr, [x0, #0x38]
 37e4130: f90083e0     	str	x0, [sp, #0x100]
 37e4134: 0f000420     	movi.2s	v0, #0x1
 37e4138: fd0087e0     	str	d0, [sp, #0x108]
 37e413c: 52800068     	mov	w8, #0x3                ; =3
 37e4140: b90113e8     	str	w8, [sp, #0x110]
 37e4144: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 37e4148: f9008fff     	str	xzr, [sp, #0x118]
 37e414c: b0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e4150: 91152021     	add	x1, x1, #0x548
 37e4154: 91036280     	add	x0, x20, #0xd8
 37e4158: 910403e2     	add	x2, sp, #0x100
 37e415c: 9790c08c     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e4160: 910403e0     	add	x0, sp, #0x100
 37e4164: 977d9af0     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e4168: f8bfc320     	ldapr	x0, [x25]
 37e416c: b4009f00     	cbz	x0, 0x37e554c <_ChromeMain+0x37e02b0>
 37e4170: 52806201     	mov	w1, #0x310              ; =784
 37e4174: d2800002     	mov	x2, #0x0                ; =0
 37e4178: 97231d0e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e417c: aa0003f4     	mov	x20, x0
 37e4180: 976e2bf0     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e4184: 3945a408     	ldrb	w8, [x0, #0x169]
 37e4188: 3500ae48     	cbnz	w8, 0x37e5750 <_ChromeMain+0x37e04b4>
 37e418c: f940ce62     	ldr	x2, [x19, #0x198]
 37e4190: aa1303e0     	mov	x0, x19
 37e4194: aa1403e1     	mov	x1, x20
 37e4198: 973e5499     	bl	0x7793fc <_ChromeMain+0x774160>
 37e419c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e41a0: f9404789     	ldr	x9, [x28, #0x88]
 37e41a4: eb09011f     	cmp	x8, x9
 37e41a8: 54000061     	b.ne	0x37e41b4 <_ChromeMain+0x37def18>
 37e41ac: aa1403e0     	mov	x0, x20
 37e41b0: 9720c053     	bl	0x142fc <_ChromeMain+0xf060>
 37e41b4: f9437e60     	ldr	x0, [x19, #0x6f8]
 37e41b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e41bc: f9404789     	ldr	x9, [x28, #0x88]
 37e41c0: eb09011f     	cmp	x8, x9
 37e41c4: 54000041     	b.ne	0x37e41cc <_ChromeMain+0x37def30>
 37e41c8: 9720fa1d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e41cc: 91146275     	add	x21, x19, #0x518
 37e41d0: f9037e74     	str	x20, [x19, #0x6f8]
 37e41d4: f8bfc320     	ldapr	x0, [x25]
 37e41d8: b4009be0     	cbz	x0, 0x37e5554 <_ChromeMain+0x37e02b8>
 37e41dc: 52806601     	mov	w1, #0x330              ; =816
 37e41e0: d2800002     	mov	x2, #0x0                ; =0
 37e41e4: 97231cf3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e41e8: aa0003f4     	mov	x20, x0
 37e41ec: f100027f     	cmp	x19, #0x0
 37e41f0: 9a9503e1     	csel	x1, xzr, x21, eq
 37e41f4: 97ded103     	bl	0x2f98600 <_ChromeMain+0x2f93364>
 37e41f8: d0057a28     	adrp	x8, 0xe72a000 <dyld_stub_binder+0xe72a000>
 37e41fc: 91014108     	add	x8, x8, #0x50
 37e4200: 910fa109     	add	x9, x8, #0x3e8
 37e4204: a9002408     	stp	x8, x9, [x0]
 37e4208: 91104109     	add	x9, x8, #0x410
 37e420c: f9000809     	str	x9, [x0, #0x10]
 37e4210: 91112109     	add	x9, x8, #0x448
 37e4214: 9111e10a     	add	x10, x8, #0x478
 37e4218: a906a809     	stp	x9, x10, [x0, #0x68]
 37e421c: 91132109     	add	x9, x8, #0x4c8
 37e4220: f9005809     	str	x9, [x0, #0xb0]
 37e4224: 9114a109     	add	x9, x8, #0x528
 37e4228: aa0003f5     	mov	x21, x0
 37e422c: f80d8ea9     	str	x9, [x21, #0xd8]!
 37e4230: 91156108     	add	x8, x8, #0x558
 37e4234: f9007c08     	str	x8, [x0, #0xf8]
 37e4238: f901941f     	str	xzr, [x0, #0x328]
 37e423c: 52800021     	mov	w1, #0x1                ; =1
 37e4240: 9790c593     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 37e4244: f9401288     	ldr	x8, [x20, #0x20]
 37e4248: b9400909     	ldr	w9, [x8, #0x8]
 37e424c: 7100093f     	cmp	w9, #0x2
 37e4250: 5400a860     	b.eq	0x37e575c <_ChromeMain+0x37e04c0>
 37e4254: 39422909     	ldrb	w9, [x8, #0x8a]
 37e4258: 340000a9     	cbz	w9, 0x37e426c <_ChromeMain+0x37defd0>
 37e425c: 3902291f     	strb	wzr, [x8, #0x8a]
 37e4260: f940b500     	ldr	x0, [x8, #0x168]
 37e4264: 52800001     	mov	w1, #0x0                ; =0
 37e4268: 9757a636     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 37e426c: 52802800     	mov	w0, #0x140              ; =320
 37e4270: 9720ac3e     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e4274: aa0003f6     	mov	x22, x0
 37e4278: 97c8b0d6     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 37e427c: aa1403e0     	mov	x0, x20
 37e4280: aa1603e1     	mov	x1, x22
 37e4284: 978e956d     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 37e4288: b940f2c8     	ldr	w8, [x22, #0xf0]
 37e428c: 7100051f     	cmp	w8, #0x1
 37e4290: 540044c1     	b.ne	0x37e4b28 <_ChromeMain+0x37df88c>
 37e4294: b9410ac8     	ldr	w8, [x22, #0x108]
