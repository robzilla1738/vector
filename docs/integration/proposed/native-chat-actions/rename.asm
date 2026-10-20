
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4638cc8: d105c3ff     	sub	sp, sp, #0x170
 4638ccc: a9116ffc     	stp	x28, x27, [sp, #0x110]
 4638cd0: a91267fa     	stp	x26, x25, [sp, #0x120]
 4638cd4: a9135ff8     	stp	x24, x23, [sp, #0x130]
 4638cd8: a91457f6     	stp	x22, x21, [sp, #0x140]
 4638cdc: a9154ff4     	stp	x20, x19, [sp, #0x150]
 4638ce0: a9167bfd     	stp	x29, x30, [sp, #0x160]
 4638ce4: 910583fd     	add	x29, sp, #0x160
 4638ce8: aa0103f5     	mov	x21, x1
 4638cec: aa0003f6     	mov	x22, x0
 4638cf0: f9422c08     	ldr	x8, [x0, #0x458]
 4638cf4: b40002c8     	cbz	x8, 0x4638d4c <_ChromeMain+0x4633ab0>
 4638cf8: f9429d18     	ldr	x24, [x8, #0x538]
 4638cfc: 39805ea8     	ldrsb	x8, [x21, #0x17]
 4638d00: b7f802a8     	tbnz	x8, #0x3f, 0x4638d54 <_ChromeMain+0x4633ab8>
 4638d04: b4000158     	cbz	x24, 0x4638d2c <_ChromeMain+0x4633a90>
 4638d08: b4000128     	cbz	x8, 0x4638d2c <_ChromeMain+0x4633a90>
 4638d0c: f94002c8     	ldr	x8, [x22]
 4638d10: f9403108     	ldr	x8, [x8, #0x60]
 4638d14: 90fe01a9     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 4638d18: 91394129     	add	x9, x9, #0xe50
 4638d1c: eb09011f     	cmp	x8, x9
 4638d20: 54000201     	b.ne	0x4638d60 <_ChromeMain+0x4633ac4>
 4638d24: f940c2c0     	ldr	x0, [x22, #0x180]
 4638d28: b50002a0     	cbnz	x0, 0x4638d7c <_ChromeMain+0x4633ae0>
 4638d2c: a9567bfd     	ldp	x29, x30, [sp, #0x160]
 4638d30: a9554ff4     	ldp	x20, x19, [sp, #0x150]
 4638d34: a95457f6     	ldp	x22, x21, [sp, #0x140]
 4638d38: a9535ff8     	ldp	x24, x23, [sp, #0x130]
 4638d3c: a95267fa     	ldp	x26, x25, [sp, #0x120]
 4638d40: a9516ffc     	ldp	x28, x27, [sp, #0x110]
 4638d44: 9105c3ff     	add	sp, sp, #0x170
 4638d48: d65f03c0     	ret
 4638d4c: d2800018     	mov	x24, #0x0               ; =0
 4638d50: 17ffffeb     	b	0x4638cfc <_ChromeMain+0x4633a60>
 4638d54: f94006a8     	ldr	x8, [x21, #0x8]
 4638d58: b4fffeb8     	cbz	x24, 0x4638d2c <_ChromeMain+0x4633a90>
 4638d5c: 17ffffeb     	b	0x4638d08 <_ChromeMain+0x4633a6c>
 4638d60: 90fdffc9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4638d64: 9120c129     	add	x9, x9, #0x830
 4638d68: eb09011f     	cmp	x8, x9
 4638d6c: 54fffdc0     	b.eq	0x4638d24 <_ChromeMain+0x4633a88>
 4638d70: aa1603e0     	mov	x0, x22
 4638d74: d63f0100     	blr	x8
 4638d78: b4fffda0     	cbz	x0, 0x4638d2c <_ChromeMain+0x4633a90>
 4638d7c: d0054688     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4638d80: 91120108     	add	x8, x8, #0x480
 4638d84: f8bfc100     	ldapr	x0, [x8]
 4638d88: b40029a0     	cbz	x0, 0x46392bc <_ChromeMain+0x4634020>
 4638d8c: 910243f9     	add	x25, sp, #0x90
 4638d90: 5280cc01     	mov	w1, #0x660              ; =1632
 4638d94: d2800002     	mov	x2, #0x0                ; =0
 4638d98: 96e9ca06     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4638d9c: aa0003f3     	mov	x19, x0
 4638da0: 97abc8b0     	bl	0x312b060 <_ChromeMain+0x3125dc4>
 4638da4: f004ca74     	adrp	x20, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4638da8: 912f2294     	add	x20, x20, #0xbc8
 4638dac: aa1403e1     	mov	x1, x20
 4638db0: 528001a2     	mov	w2, #0xd                ; =13
 4638db4: 97d3af08     	bl	0x3b249d4 <_ChromeMain+0x3b1f738>
 4638db8: f9416677     	ldr	x23, [x19, #0x2c8]
 4638dbc: b40025b7     	cbz	x23, 0x4639270 <_ChromeMain+0x4633fd4>
 4638dc0: 52800400     	mov	w0, #0x20               ; =32
 4638dc4: 96e75969     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638dc8: f81983a0     	stur	x0, [x29, #-0x68]
 4638dcc: f004c828     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4638dd0: 3dc02d00     	ldr	q0, [x8, #0xb0]
 4638dd4: 3c870320     	stur	q0, [x25, #0x70]
 4638dd8: 91006808     	add	x8, x0, #0x1a
 4638ddc: eb00011f     	cmp	x8, x0
 4638de0: 54002623     	b.lo	0x46392a4 <_ChromeMain+0x4634008>
 4638de4: eb14011f     	cmp	x8, x20
 4638de8: fa548002     	ccmp	x0, x20, #0x2, hi
 4638dec: 540025c9     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4638df0: 3dc00280     	ldr	q0, [x20]
 4638df4: 3d800000     	str	q0, [x0]
 4638df8: 3cc0a280     	ldur	q0, [x20, #0xa]
 4638dfc: 3c80a000     	stur	q0, [x0, #0xa]
 4638e00: 7900341f     	strh	wzr, [x0, #0x1a]
 4638e04: d101a3a1     	sub	x1, x29, #0x68
 4638e08: aa1703e0     	mov	x0, x23
 4638e0c: 972cd2b3     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4638e10: 38daf3a8     	ldursb	w8, [x29, #-0x51]
 4638e14: 36f800a8     	tbz	w8, #0x1f, 0x4638e28 <_ChromeMain+0x4633b8c>
 4638e18: f85983a0     	ldur	x0, [x29, #-0x68]
 4638e1c: f85a83a8     	ldur	x8, [x29, #-0x58]
 4638e20: d37ff901     	lsl	x1, x8, #1
 4638e24: 96e74025     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4638e28: d2800408     	mov	x8, #0x20               ; =32
 4638e2c: f2c00108     	movk	x8, #0x8, lsl #32
 4638e30: f901c268     	str	x8, [x19, #0x380]
 4638e34: 5280a700     	mov	w0, #0x538              ; =1336
 4638e38: 96e7594c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638e3c: aa0003f4     	mov	x20, x0
 4638e40: d2800001     	mov	x1, #0x0                ; =0
 4638e44: 951c018a     	bl	0x8d3946c <_ChromeMain+0x8d341d0>
 4638e48: f81903a0     	stur	x0, [x29, #-0x70]
 4638e4c: f94a06d7     	ldr	x23, [x22, #0x1408]
 4638e50: b40000d7     	cbz	x23, 0x4638e68 <_ChromeMain+0x4633bcc>
 4638e54: 52800028     	mov	w8, #0x1                ; =1
 4638e58: b82802e8     	ldadd	w8, w8, [x23]
 4638e5c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4638e60: 6b09011f     	cmp	w8, w9
 4638e64: 54002300     	b.eq	0x46392c4 <_ChromeMain+0x4634028>
 4638e68: f94a0ada     	ldr	x26, [x22, #0x1410]
 4638e6c: 52800c00     	mov	w0, #0x60               ; =96
 4638e70: 96e7593e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638e74: aa0003f6     	mov	x22, x0
 4638e78: 52800028     	mov	w8, #0x1                ; =1
 4638e7c: b9000008     	str	w8, [x0]
 4638e80: 101b3608     	adr	x8, 0x466f540 <_ChromeMain+0x466a2a4>
 4638e84: d503201f     	nop
 4638e88: 101b3bc9     	adr	x9, 0x466f600 <_ChromeMain+0x466a364>
 4638e8c: d503201f     	nop
 4638e90: a900a408     	stp	x8, x9, [x0, #0x8]
 4638e94: d0ffd188     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4638e98: 910a0108     	add	x8, x8, #0x280
 4638e9c: 10010e89     	adr	x9, 0x463b06c <_ChromeMain+0x4635dd0>
 4638ea0: d503201f     	nop
 4638ea4: a901a408     	stp	x8, x9, [x0, #0x18]
 4638ea8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4638eac: f9001c1a     	str	x26, [x0, #0x38]
 4638eb0: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4638eb4: 37f80208     	tbnz	w8, #0x1f, 0x4638ef4 <_ChromeMain+0x4633c58>
 4638eb8: 3dc002a0     	ldr	q0, [x21]
 4638ebc: 3c8402c0     	stur	q0, [x22, #0x40]
 4638ec0: f9400aa8     	ldr	x8, [x21, #0x10]
 4638ec4: f80502c8     	stur	x8, [x22, #0x50]
 4638ec8: 1400000e     	b	0x4638f00 <_ChromeMain+0x4633c64>
 4638ecc: f9403280     	ldr	x0, [x20, #0x60]
 4638ed0: f9403a88     	ldr	x8, [x20, #0x70]
 4638ed4: d37ff901     	lsl	x1, x8, #1
 4638ed8: 96e73ff8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4638edc: 14000052     	b	0x4639024 <_ChromeMain+0x4633d88>
 4638ee0: f9401a80     	ldr	x0, [x20, #0x30]
 4638ee4: f9402288     	ldr	x8, [x20, #0x40]
 4638ee8: d37ff901     	lsl	x1, x8, #1
 4638eec: 96e73ff3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4638ef0: 14000034     	b	0x4638fc0 <_ChromeMain+0x4633d24>
 4638ef4: a9400aa1     	ldp	x1, x2, [x21]
 4638ef8: 910102c0     	add	x0, x22, #0x40
 4638efc: 96e77cc7     	bl	0x18218 <_ChromeMain+0x12f7c>
 4638f00: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4638f04: d0052bd7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4638f08: f94046e9     	ldr	x9, [x23, #0x88]
 4638f0c: eb09011f     	cmp	x8, x9
 4638f10: 54000061     	b.ne	0x4638f1c <_ChromeMain+0x4633c80>
 4638f14: aa1303e0     	mov	x0, x19
 4638f18: 96e76cf9     	bl	0x142fc <_ChromeMain+0xf060>
 4638f1c: f9002ed3     	str	x19, [x22, #0x58]
 4638f20: 52800400     	mov	w0, #0x20               ; =32
 4638f24: 96e75911     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638f28: 91006809     	add	x9, x0, #0x1a
 4638f2c: eb00013f     	cmp	x9, x0
 4638f30: 54001ba3     	b.lo	0x46392a4 <_ChromeMain+0x4634008>
 4638f34: aa0003f5     	mov	x21, x0
 4638f38: f004c488     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4638f3c: 912a8108     	add	x8, x8, #0xaa0
 4638f40: eb08013f     	cmp	x9, x8
 4638f44: fa488002     	ccmp	x0, x8, #0x2, hi
 4638f48: 54001ae9     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4638f4c: 3dc00100     	ldr	q0, [x8]
 4638f50: 3d8002a0     	str	q0, [x21]
 4638f54: 3cc0a100     	ldur	q0, [x8, #0xa]
 4638f58: 3c80a2a0     	stur	q0, [x21, #0xa]
 4638f5c: 39006abf     	strb	wzr, [x21, #0x1a]
 4638f60: 39c0be88     	ldrsb	w8, [x20, #0x2f]
 4638f64: 37f81a28     	tbnz	w8, #0x1f, 0x46392a8 <_ChromeMain+0x463400c>
 4638f68: f9000e95     	str	x21, [x20, #0x18]
 4638f6c: f004c808     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4638f70: 3dc11500     	ldr	q0, [x8, #0x450]
 4638f74: 3d800a80     	str	q0, [x20, #0x20]
 4638f78: 52800400     	mov	w0, #0x20               ; =32
 4638f7c: 96e758fb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638f80: 91005809     	add	x9, x0, #0x16
 4638f84: eb00013f     	cmp	x9, x0
 4638f88: 540018e3     	b.lo	0x46392a4 <_ChromeMain+0x4634008>
 4638f8c: aa0003f5     	mov	x21, x0
 4638f90: f004ca68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4638f94: 9129d108     	add	x8, x8, #0xa74
 4638f98: eb08013f     	cmp	x9, x8
 4638f9c: fa488002     	ccmp	x0, x8, #0x2, hi
 4638fa0: 54001829     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4638fa4: 3dc00100     	ldr	q0, [x8]
 4638fa8: 3d8002a0     	str	q0, [x21]
 4638fac: f840e108     	ldur	x8, [x8, #0xe]
 4638fb0: f800e2a8     	stur	x8, [x21, #0xe]
 4638fb4: 79002ebf     	strh	wzr, [x21, #0x16]
 4638fb8: 39c11e88     	ldrsb	w8, [x20, #0x47]
 4638fbc: 37fff928     	tbnz	w8, #0x1f, 0x4638ee0 <_ChromeMain+0x4633c44>
 4638fc0: f9001a95     	str	x21, [x20, #0x30]
 4638fc4: 9004c848     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4638fc8: 3dc3b100     	ldr	q0, [x8, #0xec0]
 4638fcc: 3c838280     	stur	q0, [x20, #0x38]
 4638fd0: 52800a00     	mov	w0, #0x50               ; =80
 4638fd4: 96e758e5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4638fd8: 91011009     	add	x9, x0, #0x44
 4638fdc: eb00013f     	cmp	x9, x0
 4638fe0: 54001623     	b.lo	0x46392a4 <_ChromeMain+0x4634008>
 4638fe4: aa0003f5     	mov	x21, x0
 4638fe8: f004ca68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4638fec: 912f9108     	add	x8, x8, #0xbe4
 4638ff0: eb08013f     	cmp	x9, x8
 4638ff4: fa488002     	ccmp	x0, x8, #0x2, hi
 4638ff8: 54001569     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4638ffc: 52800ca9     	mov	w9, #0x65               ; =101
 4639000: 72a005c9     	movk	w9, #0x2e, lsl #16
 4639004: b90042a9     	str	w9, [x21, #0x40]
 4639008: ad400500     	ldp	q0, q1, [x8]
 463900c: ad0006a0     	stp	q0, q1, [x21]
 4639010: ad410500     	ldp	q0, q1, [x8, #0x20]
 4639014: ad0106a0     	stp	q0, q1, [x21, #0x20]
 4639018: 79008abf     	strh	wzr, [x21, #0x44]
 463901c: 39c1de88     	ldrsb	w8, [x20, #0x77]
 4639020: 37fff568     	tbnz	w8, #0x1f, 0x4638ecc <_ChromeMain+0x4633c30>
 4639024: f9003295     	str	x21, [x20, #0x60]
 4639028: d004c828     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 463902c: 3dc0a900     	ldr	q0, [x8, #0x2a0]
 4639030: 3c868280     	stur	q0, [x20, #0x68]
 4639034: f81803b6     	stur	x22, [x29, #-0x80]
 4639038: 52800035     	mov	w21, #0x1               ; =1
 463903c: 381883b5     	sturb	w21, [x29, #-0x78]
 4639040: 390243f5     	strb	w21, [sp, #0x90]
 4639044: 3902f3ff     	strb	wzr, [sp, #0xbc]
 4639048: 6f00e400     	movi.2d	v0, #0000000000000000
 463904c: 3c808320     	stur	q0, [x25, #0x8]
 4639050: 3c818320     	stur	q0, [x25, #0x18]
 4639054: 3902e3ff     	strb	wzr, [sp, #0xb8]
 4639058: 390303f5     	strb	w21, [sp, #0xc0]
 463905c: a90d7fff     	stp	xzr, xzr, [sp, #0xd0]
 4639060: 9101e3e8     	add	x8, sp, #0x78
 4639064: 91002109     	add	x9, x8, #0x8
 4639068: d004ca6a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463906c: 9130a94a     	add	x10, x10, #0xc2a
 4639070: f90067ff     	str	xzr, [sp, #0xc8]
 4639074: eb0a013f     	cmp	x9, x10
 4639078: 52800089     	mov	w9, #0x4                ; =4
 463907c: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4639080: 39023fe9     	strb	w9, [sp, #0x8f]
 4639084: 54001109     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4639088: d2800a68     	mov	x8, #0x53               ; =83
 463908c: f2a00c28     	movk	x8, #0x61, lsl #16
 4639090: f2c00ec8     	movk	x8, #0x76, lsl #32
 4639094: f2e00ca8     	movk	x8, #0x65, lsl #48
 4639098: f9003fe8     	str	x8, [sp, #0x78]
 463909c: 790103ff     	strh	wzr, [sp, #0x80]
 46390a0: 910243e0     	add	x0, sp, #0x90
 46390a4: 9101e3e1     	add	x1, sp, #0x78
 46390a8: 951bff73     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 46390ac: aa0003e2     	mov	x2, x0
 46390b0: d101c3a0     	sub	x0, x29, #0x70
 46390b4: d10203a1     	sub	x1, x29, #0x80
 46390b8: 951c001f     	bl	0x8d39134 <_ChromeMain+0x8d33e98>
 46390bc: 3901c3ff     	strb	wzr, [sp, #0x70]
 46390c0: 390063f5     	strb	w21, [sp, #0x18]
 46390c4: 390113ff     	strb	wzr, [sp, #0x44]
 46390c8: 6f00e400     	movi.2d	v0, #0000000000000000
 46390cc: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46390d0: 390103ff     	strb	wzr, [sp, #0x40]
 46390d4: 390123f5     	strb	w21, [sp, #0x48]
 46390d8: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 46390dc: 910003e9     	mov	x9, sp
 46390e0: 9100312a     	add	x10, x9, #0xc
 46390e4: d004ca68     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 46390e8: 9130d108     	add	x8, x8, #0xc34
 46390ec: f9002bff     	str	xzr, [sp, #0x50]
 46390f0: eb08015f     	cmp	x10, x8
 46390f4: 528000ca     	mov	w10, #0x6               ; =6
 46390f8: fa488122     	ccmp	x9, x8, #0x2, hi
 46390fc: 39005fea     	strb	w10, [sp, #0x17]
 4639100: 54000d29     	b.ls	0x46392a4 <_ChromeMain+0x4634008>
 4639104: 52800ca9     	mov	w9, #0x65               ; =101
 4639108: 72a00d89     	movk	w9, #0x6c, lsl #16
 463910c: b9000be9     	str	w9, [sp, #0x8]
 4639110: f9400108     	ldr	x8, [x8]
 4639114: f90003e8     	str	x8, [sp]
 4639118: 79001bff     	strh	wzr, [sp, #0xc]
 463911c: 910063e0     	add	x0, sp, #0x18
 4639120: 910003e1     	mov	x1, sp
 4639124: 951bff54     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 4639128: aa0003e2     	mov	x2, x0
 463912c: d101c3a0     	sub	x0, x29, #0x70
 4639130: 9101a3e1     	add	x1, sp, #0x68
 4639134: 951c0062     	bl	0x8d392bc <_ChromeMain+0x8d34020>
 4639138: 52800400     	mov	w0, #0x20               ; =32
 463913c: 96e7588b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4639140: aa0003f5     	mov	x21, x0
 4639144: f004e888     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4639148: 912c2108     	add	x8, x8, #0xb08
 463914c: a9004c08     	stp	x8, x19, [x0]
 4639150: 52800028     	mov	w8, #0x1                ; =1
 4639154: b9001008     	str	w8, [x0, #0x10]
 4639158: 925e7668     	and	x8, x19, #0xfffffffc00000000
 463915c: f94046e9     	ldr	x9, [x23, #0x88]
 4639160: eb09011f     	cmp	x8, x9
 4639164: 54000061     	b.ne	0x4639170 <_ChromeMain+0x4633ed4>
 4639168: aa1303e0     	mov	x0, x19
 463916c: 96e76c64     	bl	0x142fc <_ChromeMain+0xf060>
 4639170: f9000eb3     	str	x19, [x21, #0x18]
 4639174: 900524f3     	adrp	x19, 0xead5000 <dyld_stub_binder+0xead5000>
 4639178: 91212273     	add	x19, x19, #0x848
 463917c: 91052280     	add	x0, x20, #0x148
 4639180: aa1503e1     	mov	x1, x21
 4639184: aa1303e2     	mov	x2, x19
 4639188: 951c0c37     	bl	0x8d3c264 <_ChromeMain+0x8d36fc8>
 463918c: f9412e88     	ldr	x8, [x20, #0x258]
 4639190: b5000a68     	cbnz	x8, 0x46392dc <_ChromeMain+0x4634040>
 4639194: f9012e93     	str	x19, [x20, #0x258]
 4639198: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463919c: 36f800a8     	tbz	w8, #0x1f, 0x46391b0 <_ChromeMain+0x4633f14>
 46391a0: f94003e0     	ldr	x0, [sp]
 46391a4: f9400be8     	ldr	x8, [sp, #0x10]
 46391a8: d37ff901     	lsl	x1, x8, #1
 46391ac: 96e73f43     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46391b0: 910063e0     	add	x0, sp, #0x18
 46391b4: 951bff10     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 46391b8: 3941c3e8     	ldrb	w8, [sp, #0x70]
 46391bc: 51000508     	sub	w8, w8, #0x1
 46391c0: 7103f51f     	cmp	w8, #0xfd
 46391c4: 54000068     	b.hi	0x46391d0 <_ChromeMain+0x4633f34>
 46391c8: f94037e0     	ldr	x0, [sp, #0x68]
 46391cc: b5000440     	cbnz	x0, 0x4639254 <_ChromeMain+0x4633fb8>
 46391d0: 52801fe8     	mov	w8, #0xff               ; =255
 46391d4: 3901c3e8     	strb	w8, [sp, #0x70]
 46391d8: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 46391dc: 36f800a8     	tbz	w8, #0x1f, 0x46391f0 <_ChromeMain+0x4633f54>
 46391e0: f9403fe0     	ldr	x0, [sp, #0x78]
 46391e4: f94047e8     	ldr	x8, [sp, #0x88]
 46391e8: d37ff901     	lsl	x1, x8, #1
 46391ec: 96e73f33     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46391f0: 910243e0     	add	x0, sp, #0x90
 46391f4: 951bff00     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 46391f8: 385883a8     	ldurb	w8, [x29, #-0x78]
 46391fc: 51000508     	sub	w8, w8, #0x1
 4639200: 7103f51f     	cmp	w8, #0xfd
 4639204: 54000068     	b.hi	0x4639210 <_ChromeMain+0x4633f74>
 4639208: f85803a0     	ldur	x0, [x29, #-0x80]
 463920c: b5000160     	cbnz	x0, 0x4639238 <_ChromeMain+0x4633f9c>
 4639210: 52801fe8     	mov	w8, #0xff               ; =255
 4639214: 381883a8     	sturb	w8, [x29, #-0x78]
 4639218: b4000694     	cbz	x20, 0x46392e8 <_ChromeMain+0x463404c>
 463921c: f81903bf     	stur	xzr, [x29, #-0x70]
 4639220: 9100a300     	add	x0, x24, #0x28
 4639224: aa1403e1     	mov	x1, x20
 4639228: 95b1974f     	bl	0xb29ef64 <_ChromeMain+0xb299cc8>
 463922c: f85903a8     	ldur	x8, [x29, #-0x70]
 4639230: b4ffd7e8     	cbz	x8, 0x4638d2c <_ChromeMain+0x4633a90>
 4639234: 14000027     	b	0x46392d0 <_ChromeMain+0x4634034>
 4639238: 12800008     	mov	w8, #-0x1               ; =-1
 463923c: b8e80008     	ldaddal	w8, w8, [x0]
 4639240: 7100051f     	cmp	w8, #0x1
 4639244: 54fffe61     	b.ne	0x4639210 <_ChromeMain+0x4633f74>
 4639248: f9400808     	ldr	x8, [x0, #0x10]
 463924c: d63f0100     	blr	x8
 4639250: 17fffff0     	b	0x4639210 <_ChromeMain+0x4633f74>
 4639254: 12800008     	mov	w8, #-0x1               ; =-1
 4639258: b8e80008     	ldaddal	w8, w8, [x0]
 463925c: 7100051f     	cmp	w8, #0x1
 4639260: 54fffb81     	b.ne	0x46391d0 <_ChromeMain+0x4633f34>
 4639264: f9400808     	ldr	x8, [x0, #0x10]
 4639268: d63f0100     	blr	x8
 463926c: 17ffffd9     	b	0x46391d0 <_ChromeMain+0x4633f34>
 4639270: 9722b3a4     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4639274: 35000400     	cbnz	w0, 0x46392f4 <_ChromeMain+0x4634058>
 4639278: aa1303e0     	mov	x0, x19
 463927c: 973294f6     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4639280: aa0003f7     	mov	x23, x0
 4639284: f9416660     	ldr	x0, [x19, #0x2c8]
 4639288: f9016677     	str	x23, [x19, #0x2c8]
 463928c: b4ffd9a0     	cbz	x0, 0x4638dc0 <_ChromeMain+0x4633b24>
 4639290: f9400008     	ldr	x8, [x0]
 4639294: f9400508     	ldr	x8, [x8, #0x8]
 4639298: d63f0100     	blr	x8
 463929c: f9416677     	ldr	x23, [x19, #0x2c8]
 46392a0: 17fffec8     	b	0x4638dc0 <_ChromeMain+0x4633b24>
 46392a4: d4200020     	brk	#0x1
 46392a8: f9400e80     	ldr	x0, [x20, #0x18]
 46392ac: f9401688     	ldr	x8, [x20, #0x28]
 46392b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46392b4: 96e73f01     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46392b8: 17ffff2c     	b	0x4638f68 <_ChromeMain+0x4633ccc>
 46392bc: 97f2690f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46392c0: 17fffeb3     	b	0x4638d8c <_ChromeMain+0x4633af0>
 46392c4: d4200000     	brk	#0
 46392c8: d4400000     	hlt	#0
 46392cc: d4200020     	brk	#0x1
 46392d0: d4200000     	brk	#0
 46392d4: d4400000     	hlt	#0
 46392d8: d4200020     	brk	#0x1
 46392dc: d4200000     	brk	#0
 46392e0: d4400000     	hlt	#0
 46392e4: d4200020     	brk	#0x1
 46392e8: d4200000     	brk	#0
 46392ec: d4400000     	hlt	#0
 46392f0: d4200020     	brk	#0x1
 46392f4: 52803600     	mov	w0, #0x1b0              ; =432
 46392f8: 96e7581c     	bl	0xf368 <_ChromeMain+0xa0cc>
 46392fc: aa0003f7     	mov	x23, x0
 4639300: aa1303e1     	mov	x1, x19
 4639304: 9722b21f     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4639308: 17ffffdf     	b	0x4639284 <_ChromeMain+0x4633fe8>
