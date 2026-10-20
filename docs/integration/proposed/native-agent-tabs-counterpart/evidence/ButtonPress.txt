
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4684c18: d103c3ff     	sub	sp, sp, #0xf0
 4684c1c: a9096ffc     	stp	x28, x27, [sp, #0x90]
 4684c20: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 4684c24: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 4684c28: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 4684c2c: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 4684c30: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 4684c34: 910383fd     	add	x29, sp, #0xe0
 4684c38: aa0003f3     	mov	x19, x0
 4684c3c: f942ac00     	ldr	x0, [x0, #0x558]
 4684c40: b4000140     	cbz	x0, 0x4684c68 <_ChromeMain+0x467f9cc>
 4684c44: 52800001     	mov	w1, #0x0                ; =0
 4684c48: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 4684c4c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 4684c50: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4684c54: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 4684c58: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 4684c5c: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 4684c60: 9103c3ff     	add	sp, sp, #0xf0
 4684c64: 179661c9     	b	0x2c1d388 <_ChromeMain+0x2c180ec>
 4684c68: 3954e268     	ldrb	w8, [x19, #0x538]
 4684c6c: 34000068     	cbz	w8, 0x4684c78 <_ChromeMain+0x467f9dc>
 4684c70: f9428668     	ldr	x8, [x19, #0x508]
 4684c74: b5000288     	cbnz	x8, 0x4684cc4 <_ChromeMain+0x467fa28>
 4684c78: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 4684c7c: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 4684c80: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4684c84: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 4684c88: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 4684c8c: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 4684c90: 9103c3ff     	add	sp, sp, #0xf0
 4684c94: d65f03c0     	ret
 4684c98: b900f2d8     	str	w24, [x22, #0xf0]
 4684c9c: aa1603e0     	mov	x0, x22
 4684ca0: 52800021     	mov	w1, #0x1                ; =1
 4684ca4: 974f8183     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4684ca8: 140000a3     	b	0x4684f34 <_ChromeMain+0x467fc98>
 4684cac: 52800028     	mov	w8, #0x1                ; =1
 4684cb0: b900f2a8     	str	w8, [x21, #0xf0]
 4684cb4: aa1503e0     	mov	x0, x21
 4684cb8: 52800021     	mov	w1, #0x1                ; =1
 4684cbc: 974f817d     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4684cc0: 14000075     	b	0x4684e94 <_ChromeMain+0x467fbf8>
 4684cc4: d0054439     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4684cc8: 91120339     	add	x25, x25, #0x480
 4684ccc: f8bfc320     	ldapr	x0, [x25]
 4684cd0: b40062c0     	cbz	x0, 0x4685928 <_ChromeMain+0x468068c>
 4684cd4: 5280fd01     	mov	w1, #0x7e8              ; =2024
 4684cd8: d2800002     	mov	x2, #0x0                ; =0
 4684cdc: 96e89a35     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684ce0: aa0003f4     	mov	x20, x0
 4684ce4: f9428276     	ldr	x22, [x19, #0x500]
 4684ce8: f9428675     	ldr	x21, [x19, #0x508]
 4684cec: f9429678     	ldr	x24, [x19, #0x528]
 4684cf0: f9429a7a     	ldr	x26, [x19, #0x530]
 4684cf4: aa1303e1     	mov	x1, x19
 4684cf8: d2800002     	mov	x2, #0x0                ; =0
 4684cfc: 52800003     	mov	w3, #0x0                ; =0
 4684d00: 94d40722     	bl	0x7b86988 <_ChromeMain+0x7b816ec>
 4684d04: 6f00e400     	movi.2d	v0, #0000000000000000
 4684d08: 3d81ec00     	str	q0, [x0, #0x7b0]
 4684d0c: 911ec008     	add	x8, x0, #0x7b0
 4684d10: f903d408     	str	x8, [x0, #0x7a8]
 4684d14: f0050568     	adrp	x8, 0xe733000 <dyld_stub_binder+0xe733000>
 4684d18: 911fc108     	add	x8, x8, #0x7f0
 4684d1c: 91110109     	add	x9, x8, #0x440
 4684d20: a9002408     	stp	x8, x9, [x0]
 4684d24: 9111a109     	add	x9, x8, #0x468
 4684d28: f9000809     	str	x9, [x0, #0x10]
 4684d2c: 91128109     	add	x9, x8, #0x4a0
 4684d30: 9113410a     	add	x10, x8, #0x4d0
 4684d34: a906a809     	stp	x9, x10, [x0, #0x68]
 4684d38: 91148109     	add	x9, x8, #0x520
 4684d3c: f9005809     	str	x9, [x0, #0xb0]
 4684d40: 91160109     	add	x9, x8, #0x580
 4684d44: f9006c09     	str	x9, [x0, #0xd8]
 4684d48: 9116c109     	add	x9, x8, #0x5b0
 4684d4c: f9007c09     	str	x9, [x0, #0xf8]
 4684d50: 91176109     	add	x9, x8, #0x5d8
 4684d54: f9018809     	str	x9, [x0, #0x310]
 4684d58: 911f4109     	add	x9, x8, #0x7d0
 4684d5c: f903b009     	str	x9, [x0, #0x760]
 4684d60: 912f4108     	add	x8, x8, #0xbd0
 4684d64: f903d008     	str	x8, [x0, #0x7a0]
 4684d68: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4684d6c: d0052977     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4684d70: f94046e9     	ldr	x9, [x23, #0x88]
 4684d74: eb09011f     	cmp	x8, x9
 4684d78: 54000061     	b.ne	0x4684d84 <_ChromeMain+0x467fae8>
 4684d7c: aa1603e0     	mov	x0, x22
 4684d80: 96e63d5f     	bl	0x142fc <_ChromeMain+0xf060>
 4684d84: f903e296     	str	x22, [x20, #0x7c0]
 4684d88: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4684d8c: f94046e9     	ldr	x9, [x23, #0x88]
 4684d90: eb09011f     	cmp	x8, x9
 4684d94: 54000061     	b.ne	0x4684da0 <_ChromeMain+0x467fb04>
 4684d98: aa1503e0     	mov	x0, x21
 4684d9c: 96e63d58     	bl	0x142fc <_ChromeMain+0xf060>
 4684da0: f903e695     	str	x21, [x20, #0x7c8]
 4684da4: f903ea98     	str	x24, [x20, #0x7d0]
 4684da8: f903ee9a     	str	x26, [x20, #0x7d8]
 4684dac: f903f29f     	str	xzr, [x20, #0x7e0]
 4684db0: b944ea88     	ldr	w8, [x20, #0x4e8]
 4684db4: 340000c8     	cbz	w8, 0x4684dcc <_ChromeMain+0x467fb30>
 4684db8: b904ea9f     	str	wzr, [x20, #0x4e8]
 4684dbc: 9115c280     	add	x0, x20, #0x570
 4684dc0: d2800001     	mov	x1, #0x0                ; =0
 4684dc4: 52800022     	mov	w2, #0x1                ; =1
 4684dc8: 95819f96     	bl	0xa6ecc20 <_ChromeMain+0xa6e7984>
 4684dcc: 91126288     	add	x8, x20, #0x498
 4684dd0: 6f00e400     	movi.2d	v0, #0000000000000000
 4684dd4: 3d800100     	str	q0, [x8]
 4684dd8: 52801c28     	mov	w8, #0xe1               ; =225
 4684ddc: b904ca88     	str	w8, [x20, #0x4c8]
 4684de0: 52800148     	mov	w8, #0xa                ; =10
 4684de4: b904de88     	str	w8, [x20, #0x4dc]
 4684de8: 52800028     	mov	w8, #0x1                ; =1
 4684dec: 39138288     	strb	w8, [x20, #0x4e0]
 4684df0: 391a0688     	strb	w8, [x20, #0x681]
 4684df4: b9002bff     	str	wzr, [sp, #0x28]
 4684df8: 3900b3e8     	strb	w8, [sp, #0x2c]
 4684dfc: 910c4280     	add	x0, x20, #0x310
 4684e00: 9100a3e1     	add	x1, sp, #0x28
 4684e04: 957f8bf7     	bl	0xa667de0 <_ChromeMain+0xa662b44>
 4684e08: 52800400     	mov	w0, #0x20               ; =32
 4684e0c: 96e62957     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684e10: 91007809     	add	x9, x0, #0x1e
 4684e14: eb00013f     	cmp	x9, x0
 4684e18: 54005683     	b.lo	0x46858e8 <_ChromeMain+0x468064c>
 4684e1c: aa0003f5     	mov	x21, x0
 4684e20: b0048308     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4684e24: 910d6908     	add	x8, x8, #0x35a
 4684e28: eb08013f     	cmp	x9, x8
 4684e2c: fa488002     	ccmp	x0, x8, #0x2, hi
 4684e30: 540055c9     	b.ls	0x46858e8 <_ChromeMain+0x468064c>
 4684e34: 3dc00100     	ldr	q0, [x8]
 4684e38: 3d8002a0     	str	q0, [x21]
 4684e3c: 3cc0e100     	ldur	q0, [x8, #0xe]
 4684e40: 3c80e2a0     	stur	q0, [x21, #0xe]
 4684e44: 39007abf     	strb	wzr, [x21, #0x1e]
 4684e48: 39cefe88     	ldrsb	w8, [x20, #0x3bf]
 4684e4c: 37f85508     	tbnz	w8, #0x1f, 0x46858ec <_ChromeMain+0x4680650>
 4684e50: 910ea280     	add	x0, x20, #0x3a8
 4684e54: aa1503e1     	mov	x1, x21
 4684e58: 528003c2     	mov	w2, #0x1e               ; =30
 4684e5c: 96f88f16     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4684e60: aa1503e0     	mov	x0, x21
 4684e64: 52800401     	mov	w1, #0x20               ; =32
 4684e68: 96e61014     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4684e6c: 52802800     	mov	w0, #0x140              ; =320
 4684e70: 96e6293e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684e74: aa0003f5     	mov	x21, x0
 4684e78: 978e2dd6     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4684e7c: aa1403e0     	mov	x0, x20
 4684e80: aa1503e1     	mov	x1, x21
 4684e84: 9754126d     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4684e88: b940f2a8     	ldr	w8, [x21, #0xf0]
 4684e8c: 7100051f     	cmp	w8, #0x1
 4684e90: 54fff0e1     	b.ne	0x4684cac <_ChromeMain+0x467fa10>
 4684e94: f8bfc320     	ldapr	x0, [x25]
 4684e98: b40054c0     	cbz	x0, 0x4685930 <_ChromeMain+0x4680694>
 4684e9c: 52806201     	mov	w1, #0x310              ; =784
 4684ea0: d2800002     	mov	x2, #0x0                ; =0
 4684ea4: 96e899c3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684ea8: aa0003f5     	mov	x21, x0
 4684eac: 9733a8a5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4684eb0: 3945a408     	ldrb	w8, [x0, #0x169]
 4684eb4: 350055a8     	cbnz	w8, 0x4685968 <_ChromeMain+0x46806cc>
 4684eb8: f940ce82     	ldr	x2, [x20, #0x198]
 4684ebc: aa1403e0     	mov	x0, x20
 4684ec0: aa1503e1     	mov	x1, x21
 4684ec4: 9703d14e     	bl	0x7793fc <_ChromeMain+0x774160>
 4684ec8: 52800400     	mov	w0, #0x20               ; =32
 4684ecc: 96e62927     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684ed0: aa0003e1     	mov	x1, x0
 4684ed4: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4684ed8: b9000808     	str	w8, [x0, #0x8]
 4684edc: 52800038     	mov	w24, #0x1               ; =1
 4684ee0: 39003018     	strb	w24, [x0, #0xc]
 4684ee4: 9004e65a     	adrp	x26, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4684ee8: 9104435a     	add	x26, x26, #0x110
 4684eec: f900001a     	str	x26, [x0]
 4684ef0: f004c608     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4684ef4: 3dc2ad00     	ldr	q0, [x8, #0xab0]
 4684ef8: 3d800400     	str	q0, [x0, #0x10]
 4684efc: f94002a8     	ldr	x8, [x21]
 4684f00: f9408908     	ldr	x8, [x8, #0x110]
 4684f04: aa1503e0     	mov	x0, x21
 4684f08: d63f0100     	blr	x8
 4684f0c: 52802800     	mov	w0, #0x140              ; =320
 4684f10: 96e62916     	bl	0xf368 <_ChromeMain+0xa0cc>
 4684f14: aa0003f6     	mov	x22, x0
 4684f18: 978e2dae     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4684f1c: aa1503e0     	mov	x0, x21
 4684f20: aa1603e1     	mov	x1, x22
 4684f24: 97541245     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4684f28: b940f2c8     	ldr	w8, [x22, #0xf0]
 4684f2c: 7100051f     	cmp	w8, #0x1
 4684f30: 54ffeb41     	b.ne	0x4684c98 <_ChromeMain+0x467f9fc>
 4684f34: 52800148     	mov	w8, #0xa                ; =10
 4684f38: 39019fe8     	strb	w8, [sp, #0x67]
 4684f3c: 910143e8     	add	x8, sp, #0x50
 4684f40: 91005109     	add	x9, x8, #0x14
 4684f44: b0048318     	adrp	x24, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4684f48: 910b8318     	add	x24, x24, #0x2e0
 4684f4c: eb18013f     	cmp	x9, x24
 4684f50: fa588102     	ccmp	x8, x24, #0x2, hi
 4684f54: 54004ca9     	b.ls	0x46858e8 <_ChromeMain+0x468064c>
 4684f58: 52800c48     	mov	w8, #0x62               ; =98
 4684f5c: 72a00e68     	movk	w8, #0x73, lsl #16
 4684f60: b90063e8     	str	w8, [sp, #0x60]
 4684f64: 3dc00300     	ldr	q0, [x24]
 4684f68: 3d8003e0     	str	q0, [sp]
 4684f6c: 3d8017e0     	str	q0, [sp, #0x50]
 4684f70: 7900cbff     	strh	wzr, [sp, #0x64]
 4684f74: f8bfc320     	ldapr	x0, [x25]
 4684f78: b4004e00     	cbz	x0, 0x4685938 <_ChromeMain+0x468069c>
 4684f7c: 52808c01     	mov	w1, #0x460              ; =1120
 4684f80: d2800002     	mov	x2, #0x0                ; =0
 4684f84: 96e8998b     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4684f88: aa0003f6     	mov	x22, x0
 4684f8c: 39819fe8     	ldrsb	x8, [sp, #0x67]
 4684f90: 910143e9     	add	x9, sp, #0x50
 4684f94: a9452fea     	ldp	x10, x11, [sp, #0x50]
 4684f98: f100011f     	cmp	x8, #0x0
 4684f9c: 9a894141     	csel	x1, x10, x9, mi
 4684fa0: 7100011f     	cmp	w8, #0x0
 4684fa4: 9a884162     	csel	x2, x11, x8, mi
 4684fa8: 528000a3     	mov	w3, #0x5                ; =5
 4684fac: 52820004     	mov	w4, #0x1000             ; =4096
 4684fb0: 52800005     	mov	w5, #0x0                ; =0
 4684fb4: 9754164b     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4684fb8: 3945a408     	ldrb	w8, [x0, #0x169]
 4684fbc: 35004dc8     	cbnz	w8, 0x4685974 <_ChromeMain+0x46806d8>
 4684fc0: f940cea2     	ldr	x2, [x21, #0x198]
 4684fc4: aa1503e0     	mov	x0, x21
 4684fc8: aa1603e1     	mov	x1, x22
 4684fcc: 9703d10c     	bl	0x7793fc <_ChromeMain+0x774160>
 4684fd0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4684fd4: 36f800a8     	tbz	w8, #0x1f, 0x4684fe8 <_ChromeMain+0x467fd4c>
 4684fd8: f9402be0     	ldr	x0, [sp, #0x50]
 4684fdc: f94033e8     	ldr	x8, [sp, #0x60]
 4684fe0: d37ff901     	lsl	x1, x8, #1
 4684fe4: 96e60fb5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4684fe8: aa1603e0     	mov	x0, x22
 4684fec: 52801ba1     	mov	w1, #0xdd               ; =221
 4684ff0: 528001c2     	mov	w2, #0xe                ; =14
 4684ff4: 52803e83     	mov	w3, #0x1f4              ; =500
 4684ff8: 52800284     	mov	w4, #0x14               ; =20
 4684ffc: 94000291     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 4685000: 52800800     	mov	w0, #0x40               ; =64
 4685004: 96e628d9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685008: f9002be0     	str	x0, [sp, #0x50]
 468500c: b004c5a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4685010: 3dc2ed00     	ldr	q0, [x8, #0xbb0]
 4685014: 3c8583e0     	stur	q0, [sp, #0x58]
 4685018: 9100f809     	add	x9, x0, #0x3e
 468501c: eb00013f     	cmp	x9, x0
 4685020: 54004643     	b.lo	0x46858e8 <_ChromeMain+0x468064c>
 4685024: 90048308     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4685028: 910de908     	add	x8, x8, #0x37a
 468502c: eb08013f     	cmp	x9, x8
 4685030: fa488002     	ccmp	x0, x8, #0x2, hi
 4685034: 540045a9     	b.ls	0x46858e8 <_ChromeMain+0x468064c>
 4685038: ad400500     	ldp	q0, q1, [x8]
 468503c: ad000400     	stp	q0, q1, [x0]
 4685040: 3dc00900     	ldr	q0, [x8, #0x20]
 4685044: 3d800800     	str	q0, [x0, #0x20]
 4685048: 3cc2e100     	ldur	q0, [x8, #0x2e]
 468504c: 3c82e000     	stur	q0, [x0, #0x2e]
 4685050: 79007c1f     	strh	wzr, [x0, #0x3e]
 4685054: f8bfc320     	ldapr	x0, [x25]
 4685058: b4004740     	cbz	x0, 0x4685940 <_ChromeMain+0x46806a4>
 468505c: 52808c01     	mov	w1, #0x460              ; =1120
 4685060: d2800002     	mov	x2, #0x0                ; =0
 4685064: 96e89953     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4685068: aa0003f6     	mov	x22, x0
 468506c: 39819fe8     	ldrsb	x8, [sp, #0x67]
 4685070: 910143e9     	add	x9, sp, #0x50
 4685074: a9452fea     	ldp	x10, x11, [sp, #0x50]
 4685078: f100011f     	cmp	x8, #0x0
 468507c: 9a894141     	csel	x1, x10, x9, mi
 4685080: 7100011f     	cmp	w8, #0x0
 4685084: 9a884162     	csel	x2, x11, x8, mi
 4685088: 528000a3     	mov	w3, #0x5                ; =5
 468508c: 52820004     	mov	w4, #0x1000             ; =4096
 4685090: 52800005     	mov	w5, #0x0                ; =0
 4685094: 97541613     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4685098: 3945a408     	ldrb	w8, [x0, #0x169]
 468509c: 35004728     	cbnz	w8, 0x4685980 <_ChromeMain+0x46806e4>
 46850a0: f940cea2     	ldr	x2, [x21, #0x198]
 46850a4: aa1503e0     	mov	x0, x21
 46850a8: aa1603e1     	mov	x1, x22
 46850ac: 9703d0d4     	bl	0x7793fc <_ChromeMain+0x774160>
 46850b0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 46850b4: 36f800a8     	tbz	w8, #0x1f, 0x46850c8 <_ChromeMain+0x467fe2c>
 46850b8: f9402be0     	ldr	x0, [sp, #0x50]
 46850bc: f94033e8     	ldr	x8, [sp, #0x60]
 46850c0: d37ff901     	lsl	x1, x8, #1
 46850c4: 96e60f7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46850c8: aa1603e0     	mov	x0, x22
 46850cc: 52801c41     	mov	w1, #0xe2               ; =226
 46850d0: 52800182     	mov	w2, #0xc                ; =12
 46850d4: 52803203     	mov	w3, #0x190              ; =400
 46850d8: 52800244     	mov	w4, #0x12               ; =18
 46850dc: 94000259     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 46850e0: aa1403e0     	mov	x0, x20
 46850e4: 940008a6     	bl	0x468737c <_ChromeMain+0x46820e0>
 46850e8: f8bfc320     	ldapr	x0, [x25]
 46850ec: b40042e0     	cbz	x0, 0x4685948 <_ChromeMain+0x46806ac>
 46850f0: 52806201     	mov	w1, #0x310              ; =784
 46850f4: d2800002     	mov	x2, #0x0                ; =0
 46850f8: 96e8992e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46850fc: aa0003f5     	mov	x21, x0
 4685100: 9733a810     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4685104: 3945a408     	ldrb	w8, [x0, #0x169]
 4685108: 35004428     	cbnz	w8, 0x468598c <_ChromeMain+0x46806f0>
 468510c: f940ce82     	ldr	x2, [x20, #0x198]
 4685110: aa1403e0     	mov	x0, x20
 4685114: aa1503e1     	mov	x1, x21
 4685118: 9703d0b9     	bl	0x7793fc <_ChromeMain+0x774160>
 468511c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4685120: f94046e9     	ldr	x9, [x23, #0x88]
 4685124: eb09011f     	cmp	x8, x9
 4685128: 54000061     	b.ne	0x4685134 <_ChromeMain+0x467fe98>
 468512c: aa1503e0     	mov	x0, x21
 4685130: 96e63c73     	bl	0x142fc <_ChromeMain+0xf060>
 4685134: f943f280     	ldr	x0, [x20, #0x7e0]
 4685138: 925e7408     	and	x8, x0, #0xfffffffc00000000
 468513c: f94046e9     	ldr	x9, [x23, #0x88]
 4685140: eb09011f     	cmp	x8, x9
 4685144: 54000041     	b.ne	0x468514c <_ChromeMain+0x467feb0>
 4685148: 96e6763d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 468514c: f903f295     	str	x21, [x20, #0x7e0]
 4685150: 52800400     	mov	w0, #0x20               ; =32
 4685154: 96e62885     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685158: aa0003e1     	mov	x1, x0
 468515c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4685160: b9000808     	str	w8, [x0, #0x8]
 4685164: 5280003b     	mov	w27, #0x1               ; =1
 4685168: 3900301b     	strb	w27, [x0, #0xc]
 468516c: f900001a     	str	x26, [x0]
 4685170: 4f000480     	movi.4s	v0, #0x4
 4685174: 3d800400     	str	q0, [x0, #0x10]
 4685178: f94002a8     	ldr	x8, [x21]
 468517c: f9408908     	ldr	x8, [x8, #0x110]
 4685180: aa1503e0     	mov	x0, x21
 4685184: d63f0100     	blr	x8
 4685188: f943f296     	ldr	x22, [x20, #0x7e0]
 468518c: 52802800     	mov	w0, #0x140              ; =320
 4685190: 96e62876     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685194: aa0003f5     	mov	x21, x0
 4685198: 978e2d0e     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 468519c: aa1603e0     	mov	x0, x22
 46851a0: aa1503e1     	mov	x1, x21
 46851a4: 975411a5     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46851a8: b940f2a8     	ldr	w8, [x21, #0xf0]
 46851ac: 7100051f     	cmp	w8, #0x1
 46851b0: 54001281     	b.ne	0x4685400 <_ChromeMain+0x4680164>
 46851b4: aa1403e0     	mov	x0, x20
 46851b8: 94000871     	bl	0x468737c <_ChromeMain+0x46820e0>
 46851bc: f8bfc320     	ldapr	x0, [x25]
 46851c0: b4003c80     	cbz	x0, 0x4685950 <_ChromeMain+0x46806b4>
 46851c4: 52806201     	mov	w1, #0x310              ; =784
 46851c8: d2800002     	mov	x2, #0x0                ; =0
 46851cc: 96e898f9     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46851d0: aa0003f5     	mov	x21, x0
 46851d4: 9733a7db     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 46851d8: 3945a408     	ldrb	w8, [x0, #0x169]
 46851dc: 35003de8     	cbnz	w8, 0x4685998 <_ChromeMain+0x46806fc>
 46851e0: f940ce82     	ldr	x2, [x20, #0x198]
 46851e4: aa1403e0     	mov	x0, x20
 46851e8: aa1503e1     	mov	x1, x21
 46851ec: 9703d084     	bl	0x7793fc <_ChromeMain+0x774160>
 46851f0: 52800400     	mov	w0, #0x20               ; =32
 46851f4: 96e6285d     	bl	0xf368 <_ChromeMain+0xa0cc>
 46851f8: aa0003e1     	mov	x1, x0
 46851fc: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4685200: b9000808     	str	w8, [x0, #0x8]
 4685204: 3900301b     	strb	w27, [x0, #0xc]
 4685208: f900001a     	str	x26, [x0]
 468520c: 4f000480     	movi.4s	v0, #0x4
 4685210: 3d800400     	str	q0, [x0, #0x10]
 4685214: f94002a8     	ldr	x8, [x21]
 4685218: f9408908     	ldr	x8, [x8, #0x110]
 468521c: aa1503e0     	mov	x0, x21
 4685220: d63f0100     	blr	x8
 4685224: 52802800     	mov	w0, #0x140              ; =320
 4685228: 96e62850     	bl	0xf368 <_ChromeMain+0xa0cc>
 468522c: aa0003f6     	mov	x22, x0
 4685230: 978e2ce8     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4685234: aa1503e0     	mov	x0, x21
 4685238: aa1603e1     	mov	x1, x22
 468523c: 9754117f     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4685240: b940f2c8     	ldr	w8, [x22, #0xf0]
 4685244: 7100051f     	cmp	w8, #0x1
 4685248: 54000e61     	b.ne	0x4685414 <_ChromeMain+0x4680178>
 468524c: 52800128     	mov	w8, #0x9                ; =9
 4685250: 39009fe8     	strb	w8, [sp, #0x27]
 4685254: 910043e9     	add	x9, sp, #0x10
 4685258: 9100492a     	add	x10, x9, #0x12
 468525c: 90048308     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4685260: 910ee908     	add	x8, x8, #0x3ba
 4685264: eb08015f     	cmp	x10, x8
 4685268: fa488122     	ccmp	x9, x8, #0x2, hi
 468526c: 540033e9     	b.ls	0x46858e8 <_ChromeMain+0x468064c>
 4685270: 52800d89     	mov	w9, #0x6c               ; =108
 4685274: b90023e9     	str	w9, [sp, #0x20]
 4685278: 3dc00100     	ldr	q0, [x8]
 468527c: 3d8007e0     	str	q0, [sp, #0x10]
 4685280: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4685284: f94046e9     	ldr	x9, [x23, #0x88]
 4685288: eb09011f     	cmp	x8, x9
 468528c: 54000061     	b.ne	0x4685298 <_ChromeMain+0x467fffc>
 4685290: aa1403e0     	mov	x0, x20
 4685294: 96e63c1a     	bl	0x142fc <_ChromeMain+0xf060>
 4685298: 52800700     	mov	w0, #0x38               ; =56
 468529c: 96e62833     	bl	0xf368 <_ChromeMain+0xa0cc>
 46852a0: aa0003f7     	mov	x23, x0
 46852a4: 5280003c     	mov	w28, #0x1               ; =1
 46852a8: f0ffc728     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 46852ac: 91270108     	add	x8, x8, #0x9c0
 46852b0: f0fea1e9     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 46852b4: 91180129     	add	x9, x9, #0x600
 46852b8: b900001c     	str	w28, [x0]
 46852bc: 90fef6db     	adrp	x27, 0x255d000 <_ChromeMain+0x2557d64>
 46852c0: 912c037b     	add	x27, x27, #0xb00
 46852c4: 10010f4a     	adr	x10, 0x46874ac <_ChromeMain+0x4682210>
 46852c8: d503201f     	nop
 46852cc: a900a408     	stp	x8, x9, [x0, #0x8]
 46852d0: a901a81b     	stp	x27, x10, [x0, #0x18]
 46852d4: a902d01f     	stp	xzr, x20, [x0, #0x28]
 46852d8: f8bfc320     	ldapr	x0, [x25]
 46852dc: b40033e0     	cbz	x0, 0x4685958 <_ChromeMain+0x46806bc>
 46852e0: 52809601     	mov	w1, #0x4b0              ; =1200
 46852e4: d2800002     	mov	x2, #0x0                ; =0
 46852e8: 96e898b2     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46852ec: aa0003f6     	mov	x22, x0
 46852f0: 3dc007e0     	ldr	q0, [sp, #0x10]
 46852f4: 3d800fe0     	str	q0, [sp, #0x30]
 46852f8: f94013e8     	ldr	x8, [sp, #0x20]
 46852fc: f90023e8     	str	x8, [sp, #0x40]
 4685300: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4685304: f90013ff     	str	xzr, [sp, #0x20]
 4685308: f81a03b7     	stur	x23, [x29, #-0x60]
 468530c: 381a83bc     	sturb	w28, [x29, #-0x58]
 4685310: d10183a1     	sub	x1, x29, #0x60
 4685314: 9733a45b     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4685318: 385a83a8     	ldurb	w8, [x29, #-0x58]
 468531c: 7103fd1f     	cmp	w8, #0xff
 4685320: 54000060     	b.eq	0x468532c <_ChromeMain+0x4680090>
 4685324: f85a03a0     	ldur	x0, [x29, #-0x60]
 4685328: b5000860     	cbnz	x0, 0x4685434 <_ChromeMain+0x4680198>
 468532c: 52801fe8     	mov	w8, #0xff               ; =255
 4685330: 381a83a8     	sturb	w8, [x29, #-0x58]
 4685334: f0050568     	adrp	x8, 0xe734000 <dyld_stub_binder+0xe734000>
 4685338: 9111c108     	add	x8, x8, #0x470
 468533c: 91118109     	add	x9, x8, #0x460
 4685340: a90026c8     	stp	x8, x9, [x22]
 4685344: 91122109     	add	x9, x8, #0x488
 4685348: f9000ac9     	str	x9, [x22, #0x10]
 468534c: 91130109     	add	x9, x8, #0x4c0
 4685350: 9113c10a     	add	x10, x8, #0x4f0
 4685354: a906aac9     	stp	x9, x10, [x22, #0x68]
 4685358: 91150109     	add	x9, x8, #0x540
 468535c: f9005ac9     	str	x9, [x22, #0xb0]
 4685360: 91168109     	add	x9, x8, #0x5a0
 4685364: f9006ec9     	str	x9, [x22, #0xd8]
 4685368: 91174109     	add	x9, x8, #0x5d0
 468536c: f9007ec9     	str	x9, [x22, #0xf8]
 4685370: 9117e109     	add	x9, x8, #0x5f8
 4685374: f9018ac9     	str	x9, [x22, #0x310]
 4685378: 9119e109     	add	x9, x8, #0x678
 468537c: f9018ec9     	str	x9, [x22, #0x318]
 4685380: 911ce108     	add	x8, x8, #0x738
 4685384: f90192c8     	str	x8, [x22, #0x320]
 4685388: 52800037     	mov	w23, #0x1               ; =1
 468538c: aa1603e0     	mov	x0, x22
 4685390: 52800021     	mov	w1, #0x1                ; =1
 4685394: 973ac912     	bl	0x15377dc <_ChromeMain+0x1532540>
 4685398: 52800400     	mov	w0, #0x20               ; =32
 468539c: 96e627f3     	bl	0xf368 <_ChromeMain+0xa0cc>
 46853a0: aa0003e1     	mov	x1, x0
 46853a4: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 46853a8: b9000808     	str	w8, [x0, #0x8]
 46853ac: 39003017     	strb	w23, [x0, #0xc]
 46853b0: f900001a     	str	x26, [x0]
 46853b4: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 46853b8: 4e080d00     	dup.2d	v0, x8
 46853bc: 3d800400     	str	q0, [x0, #0x10]
 46853c0: f94002c8     	ldr	x8, [x22]
 46853c4: f9408908     	ldr	x8, [x8, #0x110]
 46853c8: aa1603e0     	mov	x0, x22
 46853cc: d63f0100     	blr	x8
 46853d0: aa1603e9     	mov	x9, x22
 46853d4: f84e8d28     	ldr	x8, [x9, #0xe8]!
 46853d8: b40005c8     	cbz	x8, 0x4685490 <_ChromeMain+0x46801f4>
 46853dc: f0051bea     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 46853e0: 9123414a     	add	x10, x10, #0x8d0
 46853e4: f940110b     	ldr	x11, [x8, #0x20]
 46853e8: eb0a017f     	cmp	x11, x10
 46853ec: 540001e8     	b.hi	0x4685428 <_ChromeMain+0x468018c>
 46853f0: 540004a2     	b.hs	0x4685484 <_ChromeMain+0x46801e8>
 46853f4: f9400508     	ldr	x8, [x8, #0x8]
 46853f8: b5ffff68     	cbnz	x8, 0x46853e4 <_ChromeMain+0x4680148>
 46853fc: 14000025     	b	0x4685490 <_ChromeMain+0x46801f4>
 4685400: b900f2bb     	str	w27, [x21, #0xf0]
 4685404: aa1503e0     	mov	x0, x21
 4685408: 52800021     	mov	w1, #0x1                ; =1
 468540c: 974f7fa9     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4685410: 17ffff69     	b	0x46851b4 <_ChromeMain+0x467ff18>
 4685414: b900f2db     	str	w27, [x22, #0xf0]
 4685418: aa1603e0     	mov	x0, x22
 468541c: 52800021     	mov	w1, #0x1                ; =1
 4685420: 974f7fa4     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4685424: 17ffff8a     	b	0x468524c <_ChromeMain+0x467ffb0>
 4685428: f9400108     	ldr	x8, [x8]
 468542c: b5fffdc8     	cbnz	x8, 0x46853e4 <_ChromeMain+0x4680148>
 4685430: 14000018     	b	0x4685490 <_ChromeMain+0x46801f4>
 4685434: 12800008     	mov	w8, #-0x1               ; =-1
 4685438: b8e80008     	ldaddal	w8, w8, [x0]
 468543c: 7100051f     	cmp	w8, #0x1
 4685440: 54fff761     	b.ne	0x468532c <_ChromeMain+0x4680090>
 4685444: f9400808     	ldr	x8, [x0, #0x10]
 4685448: d63f0100     	blr	x8
 468544c: 17ffffb8     	b	0x468532c <_ChromeMain+0x4680090>
 4685450: f9400008     	ldr	x8, [x0]
 4685454: f9400508     	ldr	x8, [x8, #0x8]
 4685458: d63f0100     	blr	x8
 468545c: 14000011     	b	0x46854a0 <_ChromeMain+0x4680204>
 4685460: b900f2ff     	str	wzr, [x23, #0xf0]
 4685464: aa1703e0     	mov	x0, x23
 4685468: 52800021     	mov	w1, #0x1                ; =1
 468546c: 974f7f91     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4685470: 1400001a     	b	0x46854d8 <_ChromeMain+0x468023c>
 4685474: a9430be1     	ldp	x1, x2, [sp, #0x30]
 4685478: 910143e0     	add	x0, sp, #0x50
 468547c: 96e705d5     	bl	0x46bd0 <_ChromeMain+0x41934>
 4685480: 14000068     	b	0x4685620 <_ChromeMain+0x4680384>
 4685484: eb09011f     	cmp	x8, x9
 4685488: 54002a00     	b.eq	0x46859c8 <_ChromeMain+0x468072c>
 468548c: f9401908     	ldr	x8, [x8, #0x30]
 4685490: b900111f     	str	wzr, [x8, #0x10]
 4685494: f9401d00     	ldr	x0, [x8, #0x38]
 4685498: f9001d1f     	str	xzr, [x8, #0x38]
 468549c: b5fffda0     	cbnz	x0, 0x4685450 <_ChromeMain+0x46801b4>
 46854a0: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 46854a4: 910143e1     	add	x1, sp, #0x50
 46854a8: aa1603e0     	mov	x0, x22
 46854ac: 52800102     	mov	w2, #0x8                ; =8
 46854b0: 97aa99aa     	bl	0x312bb58 <_ChromeMain+0x31268bc>
 46854b4: 52802800     	mov	w0, #0x140              ; =320
 46854b8: 96e627ac     	bl	0xf368 <_ChromeMain+0xa0cc>
 46854bc: aa0003f7     	mov	x23, x0
 46854c0: 978e2c44     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46854c4: aa1603e0     	mov	x0, x22
 46854c8: aa1703e1     	mov	x1, x23
 46854cc: 975410db     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46854d0: b940f2e8     	ldr	w8, [x23, #0xf0]
 46854d4: 35fffc68     	cbnz	w8, 0x4685460 <_ChromeMain+0x46801c4>
 46854d8: 52800028     	mov	w8, #0x1                ; =1
 46854dc: b90053e8     	str	w8, [sp, #0x50]
 46854e0: 90051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46854e4: 9115a021     	add	x1, x1, #0x568
 46854e8: 910462e0     	add	x0, x23, #0x118
 46854ec: 910143e2     	add	x2, sp, #0x50
 46854f0: 974f7f2d     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 46854f4: f004c5c8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 46854f8: 3dc02500     	ldr	q0, [x8, #0x90]
 46854fc: 3d8017e0     	str	q0, [sp, #0x50]
 4685500: 90051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4685504: 91122021     	add	x1, x1, #0x488
 4685508: 910462e0     	add	x0, x23, #0x118
 468550c: 910143e2     	add	x2, sp, #0x50
 4685510: 9751a254     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4685514: f8bfc320     	ldapr	x0, [x25]
 4685518: b4002240     	cbz	x0, 0x4685960 <_ChromeMain+0x46806c4>
 468551c: 52808c01     	mov	w1, #0x460              ; =1120
 4685520: d2800002     	mov	x2, #0x0                ; =0
 4685524: 96e89823     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4685528: aa0003f7     	mov	x23, x0
 468552c: 39811fe8     	ldrsb	x8, [sp, #0x47]
 4685530: 9100c3e9     	add	x9, sp, #0x30
 4685534: a9432fea     	ldp	x10, x11, [sp, #0x30]
 4685538: f100011f     	cmp	x8, #0x0
 468553c: 9a894141     	csel	x1, x10, x9, mi
 4685540: 7100011f     	cmp	w8, #0x0
 4685544: 9a884162     	csel	x2, x11, x8, mi
 4685548: 528000a3     	mov	w3, #0x5                ; =5
 468554c: 52820004     	mov	w4, #0x1000             ; =4096
 4685550: 52800005     	mov	w5, #0x0                ; =0
 4685554: 975414e3     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4685558: 3945a408     	ldrb	w8, [x0, #0x169]
 468555c: 35002248     	cbnz	w8, 0x46859a4 <_ChromeMain+0x4680708>
 4685560: f940cec2     	ldr	x2, [x22, #0x198]
 4685564: aa1603e0     	mov	x0, x22
 4685568: aa1703e1     	mov	x1, x23
 468556c: 9703cfa4     	bl	0x7793fc <_ChromeMain+0x774160>
 4685570: aa1703e0     	mov	x0, x23
 4685574: 52801ba1     	mov	w1, #0xdd               ; =221
 4685578: 528001c2     	mov	w2, #0xe                ; =14
 468557c: 52803203     	mov	w3, #0x190              ; =400
 4685580: 52800284     	mov	w4, #0x14               ; =20
 4685584: 9400012f     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 4685588: 52800800     	mov	w0, #0x40               ; =64
 468558c: 96e62777     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685590: 52800028     	mov	w8, #0x1                ; =1
 4685594: b9000008     	str	w8, [x0]
 4685598: d0fe4d08     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 468559c: 91260108     	add	x8, x8, #0x980
 46855a0: b0fde369     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 46855a4: 91220129     	add	x9, x9, #0x880
 46855a8: a900a408     	stp	x8, x9, [x0, #0x8]
 46855ac: b0ffa508     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 46855b0: 91310108     	add	x8, x8, #0xc40
 46855b4: a901a01b     	stp	x27, x8, [x0, #0x18]
 46855b8: f004c5c8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 46855bc: 3dc1e100     	ldr	q0, [x8, #0x780]
 46855c0: 3c828000     	stur	q0, [x0, #0x28]
 46855c4: 3900e01f     	strb	wzr, [x0, #0x38]
 46855c8: f9002be0     	str	x0, [sp, #0x50]
 46855cc: 0f000420     	movi.2s	v0, #0x1
 46855d0: fd002fe0     	str	d0, [sp, #0x58]
 46855d4: 52800068     	mov	w8, #0x3                ; =3
 46855d8: b90063e8     	str	w8, [sp, #0x60]
 46855dc: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 46855e0: f90037ff     	str	xzr, [sp, #0x68]
 46855e4: 90051c01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46855e8: 91152021     	add	x1, x1, #0x548
 46855ec: 910362e0     	add	x0, x23, #0xd8
 46855f0: 910143e2     	add	x2, sp, #0x50
 46855f4: 97563b66     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 46855f8: 910143e0     	add	x0, sp, #0x50
 46855fc: 974315ca     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4685600: f94166d7     	ldr	x23, [x22, #0x2c8]
 4685604: b4001597     	cbz	x23, 0x46858b4 <_ChromeMain+0x4680618>
 4685608: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 468560c: 37fff348     	tbnz	w8, #0x1f, 0x4685474 <_ChromeMain+0x46801d8>
 4685610: 3dc00fe0     	ldr	q0, [sp, #0x30]
 4685614: 3d8017e0     	str	q0, [sp, #0x50]
 4685618: f94023e8     	ldr	x8, [sp, #0x40]
 468561c: f90033e8     	str	x8, [sp, #0x60]
 4685620: 910143e1     	add	x1, sp, #0x50
 4685624: aa1703e0     	mov	x0, x23
 4685628: 972ba0ac     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 468562c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4685630: 36f800a8     	tbz	w8, #0x1f, 0x4685644 <_ChromeMain+0x46803a8>
 4685634: f9402be0     	ldr	x0, [sp, #0x50]
 4685638: f94033e8     	ldr	x8, [sp, #0x60]
 468563c: d37ff901     	lsl	x1, x8, #1
 4685640: 96e60e1e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4685644: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4685648: 36f800a8     	tbz	w8, #0x1f, 0x468565c <_ChromeMain+0x46803c0>
 468564c: f9401be0     	ldr	x0, [sp, #0x30]
 4685650: f94023e8     	ldr	x8, [sp, #0x40]
 4685654: d37ff901     	lsl	x1, x8, #1
 4685658: 96e60e18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 468565c: 3945a6c8     	ldrb	w8, [x22, #0x169]
 4685660: 35001a88     	cbnz	w8, 0x46859b0 <_ChromeMain+0x4680714>
 4685664: f940cea2     	ldr	x2, [x21, #0x198]
 4685668: aa1503e0     	mov	x0, x21
 468566c: aa1603e1     	mov	x1, x22
 4685670: 9703cf63     	bl	0x7793fc <_ChromeMain+0x774160>
 4685674: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4685678: 36f800a8     	tbz	w8, #0x1f, 0x468568c <_ChromeMain+0x46803f0>
 468567c: f9400be0     	ldr	x0, [sp, #0x10]
 4685680: f94013e8     	ldr	x8, [sp, #0x20]
 4685684: d37ff901     	lsl	x1, x8, #1
 4685688: 96e60e0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 468568c: f9416680     	ldr	x0, [x20, #0x2c8]
 4685690: b4000f20     	cbz	x0, 0x4685874 <_ChromeMain+0x46805d8>
 4685694: 52800f41     	mov	w1, #0x7a               ; =122
 4685698: 97402392     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 468569c: f9416680     	ldr	x0, [x20, #0x2c8]
 46856a0: b4000fa0     	cbz	x0, 0x4685894 <_ChromeMain+0x46805f8>
 46856a4: 52800148     	mov	w8, #0xa                ; =10
 46856a8: 39019fe8     	strb	w8, [sp, #0x67]
 46856ac: 910143e8     	add	x8, sp, #0x50
 46856b0: 91005109     	add	x9, x8, #0x14
 46856b4: eb18013f     	cmp	x9, x24
 46856b8: fa588102     	ccmp	x8, x24, #0x2, hi
 46856bc: 54001169     	b.ls	0x46858e8 <_ChromeMain+0x468064c>
 46856c0: 52800c48     	mov	w8, #0x62               ; =98
 46856c4: 72a00e68     	movk	w8, #0x73, lsl #16
 46856c8: b90063e8     	str	w8, [sp, #0x60]
 46856cc: 3dc003e0     	ldr	q0, [sp]
 46856d0: 3d8017e0     	str	q0, [sp, #0x50]
 46856d4: 7900cbff     	strh	wzr, [sp, #0x64]
 46856d8: 910143e1     	add	x1, sp, #0x50
 46856dc: 972ba07f     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 46856e0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 46856e4: 36f800a8     	tbz	w8, #0x1f, 0x46856f8 <_ChromeMain+0x468045c>
 46856e8: f9402be0     	ldr	x0, [sp, #0x50]
 46856ec: f94033e8     	ldr	x8, [sp, #0x60]
 46856f0: d37ff901     	lsl	x1, x8, #1
 46856f4: 96e60df1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46856f8: aa1403e0     	mov	x0, x20
 46856fc: 940007c8     	bl	0x468761c <_ChromeMain+0x4682380>
 4685700: f943e695     	ldr	x21, [x20, #0x7c8]
 4685704: 910082a0     	add	x0, x21, #0x20
 4685708: 911e8281     	add	x1, x20, #0x7a0
 468570c: 974f9dc1     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 4685710: 911e8280     	add	x0, x20, #0x7a0
 4685714: aa1503e1     	mov	x1, x21
 4685718: 974f9e0e     	bl	0x1a6cf50 <_ChromeMain+0x1a67cb4>
 468571c: b4001014     	cbz	x20, 0x468591c <_ChromeMain+0x4680680>
 4685720: f9400288     	ldr	x8, [x20]
 4685724: f9402d08     	ldr	x8, [x8, #0x58]
 4685728: aa1403e0     	mov	x0, x20
 468572c: d63f0100     	blr	x8
 4685730: aa0003f5     	mov	x21, x0
 4685734: 940011a9     	bl	0x4689dd8 <_ChromeMain+0x4684b3c>
 4685738: f10002bf     	cmp	x21, #0x0
 468573c: 1a9f07e8     	cset	w8, ne
 4685740: eb0002bf     	cmp	x21, x0
 4685744: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4685748: 540000c0     	b.eq	0x4685760 <_ChromeMain+0x46804c4>
 468574c: f94026b5     	ldr	x21, [x21, #0x48]
 4685750: f10002bf     	cmp	x21, #0x0
 4685754: 1a9f07e8     	cset	w8, ne
 4685758: fa4012a4     	ccmp	x21, x0, #0x4, ne
 468575c: 54ffff81     	b.ne	0x468574c <_ChromeMain+0x46804b0>
 4685760: 36000de8     	tbz	w8, #0x0, 0x468591c <_ChromeMain+0x4680680>
 4685764: 910c4280     	add	x0, x20, #0x310
 4685768: 52800001     	mov	w1, #0x0                ; =0
 468576c: d2800002     	mov	x2, #0x0                ; =0
 4685770: 97f57a94     	bl	0x43e41c0 <_ChromeMain+0x43def24>
 4685774: aa0003f5     	mov	x21, x0
 4685778: f942ae60     	ldr	x0, [x19, #0x558]
 468577c: f902ae75     	str	x21, [x19, #0x558]
 4685780: b40000a0     	cbz	x0, 0x4685794 <_ChromeMain+0x46804f8>
 4685784: f9400008     	ldr	x8, [x0]
 4685788: f9400508     	ldr	x8, [x8, #0x8]
 468578c: d63f0100     	blr	x8
 4685790: f942ae75     	ldr	x21, [x19, #0x558]
 4685794: f942b274     	ldr	x20, [x19, #0x560]
 4685798: b40000d4     	cbz	x20, 0x46857b0 <_ChromeMain+0x4680514>
 468579c: 52800028     	mov	w8, #0x1                ; =1
 46857a0: b8280288     	ldadd	w8, w8, [x20]
 46857a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46857a8: 6b09011f     	cmp	w8, w9
 46857ac: 54001080     	b.eq	0x46859bc <_ChromeMain+0x4680720>
 46857b0: f942b676     	ldr	x22, [x19, #0x568]
 46857b4: 52800800     	mov	w0, #0x40               ; =64
 46857b8: 96e626ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 46857bc: 52800028     	mov	w8, #0x1                ; =1
 46857c0: b9000008     	str	w8, [x0]
 46857c4: 90ff17a8     	adrp	x8, 0x2979000 <_ChromeMain+0x2973d64>
 46857c8: 91340108     	add	x8, x8, #0xd00
 46857cc: f0ffc729     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 46857d0: 912b0129     	add	x9, x9, #0xac0
 46857d4: a900a408     	stp	x8, x9, [x0, #0x8]
 46857d8: b0ffd148     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 46857dc: 911b0108     	add	x8, x8, #0x6c0
 46857e0: 1000d029     	adr	x9, 0x46871e4 <_ChromeMain+0x4681f48>
 46857e4: d503201f     	nop
 46857e8: a901a408     	stp	x8, x9, [x0, #0x18]
 46857ec: a902d01f     	stp	xzr, x20, [x0, #0x28]
 46857f0: f9001c16     	str	x22, [x0, #0x38]
 46857f4: f94146b4     	ldr	x20, [x21, #0x288]
 46857f8: f90146a0     	str	x0, [x21, #0x288]
 46857fc: b50000d4     	cbnz	x20, 0x4685814 <_ChromeMain+0x4680578>
 4685800: f942ae60     	ldr	x0, [x19, #0x558]
 4685804: 97b4f16b     	bl	0x33c1db0 <_ChromeMain+0x33bcb14>
 4685808: aa1303e0     	mov	x0, x19
 468580c: 96fc6e5c     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4685810: 17fffd1a     	b	0x4684c78 <_ChromeMain+0x467f9dc>
 4685814: 12800008     	mov	w8, #-0x1               ; =-1
 4685818: b8e80288     	ldaddal	w8, w8, [x20]
 468581c: 7100051f     	cmp	w8, #0x1
 4685820: 54ffff01     	b.ne	0x4685800 <_ChromeMain+0x4680564>
 4685824: f9400a88     	ldr	x8, [x20, #0x10]
 4685828: 90fe4909     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 468582c: 91190129     	add	x9, x9, #0x640
 4685830: eb09011f     	cmp	x8, x9
 4685834: 54000140     	b.eq	0x468585c <_ChromeMain+0x46805c0>
 4685838: f0ff9729     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 468583c: 91180129     	add	x9, x9, #0x600
 4685840: aa1403e0     	mov	x0, x20
 4685844: eb09011f     	cmp	x8, x9
 4685848: 54000060     	b.eq	0x4685854 <_ChromeMain+0x46805b8>
 468584c: d63f0100     	blr	x8
 4685850: 17ffffec     	b	0x4685800 <_ChromeMain+0x4680564>
 4685854: 52800701     	mov	w1, #0x38               ; =56
 4685858: 14000005     	b	0x468586c <_ChromeMain+0x46805d0>
 468585c: f9401a80     	ldr	x0, [x20, #0x30]
 4685860: b5000500     	cbnz	x0, 0x4685900 <_ChromeMain+0x4680664>
 4685864: aa1403e0     	mov	x0, x20
 4685868: 52800901     	mov	w1, #0x48               ; =72
 468586c: 96e60d93     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4685870: 17ffffe4     	b	0x4685800 <_ChromeMain+0x4680564>
 4685874: 97218223     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4685878: 35000ac0     	cbnz	w0, 0x46859d0 <_ChromeMain+0x4680734>
 468587c: aa1403e0     	mov	x0, x20
 4685880: 97316375     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4685884: f9416688     	ldr	x8, [x20, #0x2c8]
 4685888: f9016680     	str	x0, [x20, #0x2c8]
 468588c: b4fff048     	cbz	x8, 0x4685694 <_ChromeMain+0x46803f8>
 4685890: 1400005a     	b	0x46859f8 <_ChromeMain+0x468075c>
 4685894: 9721821b     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4685898: 35000a60     	cbnz	w0, 0x46859e4 <_ChromeMain+0x4680748>
 468589c: aa1403e0     	mov	x0, x20
 46858a0: 9731636d     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 46858a4: f9416688     	ldr	x8, [x20, #0x2c8]
 46858a8: f9016680     	str	x0, [x20, #0x2c8]
 46858ac: b4ffefc8     	cbz	x8, 0x46856a4 <_ChromeMain+0x4680408>
 46858b0: 14000058     	b	0x4685a10 <_ChromeMain+0x4680774>
 46858b4: 97218213     	bl	0xee6100 <_ChromeMain+0xee0e64>
 46858b8: 35000b80     	cbnz	w0, 0x4685a28 <_ChromeMain+0x468078c>
 46858bc: aa1603e0     	mov	x0, x22
 46858c0: 97316365     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 46858c4: aa0003f7     	mov	x23, x0
 46858c8: f94166c0     	ldr	x0, [x22, #0x2c8]
 46858cc: f90166d7     	str	x23, [x22, #0x2c8]
 46858d0: b4ffe9c0     	cbz	x0, 0x4685608 <_ChromeMain+0x468036c>
 46858d4: f9400008     	ldr	x8, [x0]
 46858d8: f9400508     	ldr	x8, [x8, #0x8]
 46858dc: d63f0100     	blr	x8
 46858e0: f94166d7     	ldr	x23, [x22, #0x2c8]
 46858e4: 17ffff49     	b	0x4685608 <_ChromeMain+0x468036c>
 46858e8: d4200020     	brk	#0x1
 46858ec: 910ea280     	add	x0, x20, #0x3a8
 46858f0: aa1503e1     	mov	x1, x21
 46858f4: 528003c2     	mov	w2, #0x1e               ; =30
 46858f8: 96f88cc2     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46858fc: 17fffd59     	b	0x4684e60 <_ChromeMain+0x467fbc4>
 4685900: 12800008     	mov	w8, #-0x1               ; =-1
 4685904: b8e80008     	ldaddal	w8, w8, [x0]
 4685908: 7100051f     	cmp	w8, #0x1
 468590c: 54fffac1     	b.ne	0x4685864 <_ChromeMain+0x46805c8>
 4685910: 52800101     	mov	w1, #0x8                ; =8
 4685914: 96e60d69     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4685918: 17ffffd3     	b	0x4685864 <_ChromeMain+0x46805c8>
 468591c: d4200000     	brk	#0
 4685920: d4400000     	hlt	#0
 4685924: d4200020     	brk	#0x1
 4685928: 97f13774     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468592c: 17fffcea     	b	0x4684cd4 <_ChromeMain+0x467fa38>
 4685930: 97f13772     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4685934: 17fffd5a     	b	0x4684e9c <_ChromeMain+0x467fc00>
 4685938: 97f13770     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468593c: 17fffd90     	b	0x4684f7c <_ChromeMain+0x467fce0>
 4685940: 97f1376e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4685944: 17fffdc6     	b	0x468505c <_ChromeMain+0x467fdc0>
 4685948: 97f1376c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468594c: 17fffde9     	b	0x46850f0 <_ChromeMain+0x467fe54>
 4685950: 97f1376a     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4685954: 17fffe1c     	b	0x46851c4 <_ChromeMain+0x467ff28>
 4685958: 97f13768     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 468595c: 17fffe61     	b	0x46852e0 <_ChromeMain+0x4680044>
 4685960: 97f13766     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4685964: 17fffeee     	b	0x468551c <_ChromeMain+0x4680280>
 4685968: d4200000     	brk	#0
 468596c: d4400000     	hlt	#0
 4685970: d4200020     	brk	#0x1
 4685974: d4200000     	brk	#0
 4685978: d4400000     	hlt	#0
 468597c: d4200020     	brk	#0x1
 4685980: d4200000     	brk	#0
 4685984: d4400000     	hlt	#0
 4685988: d4200020     	brk	#0x1
 468598c: d4200000     	brk	#0
 4685990: d4400000     	hlt	#0
 4685994: d4200020     	brk	#0x1
 4685998: d4200000     	brk	#0
 468599c: d4400000     	hlt	#0
 46859a0: d4200020     	brk	#0x1
 46859a4: d4200000     	brk	#0
 46859a8: d4400000     	hlt	#0
 46859ac: d4200020     	brk	#0x1
 46859b0: d4200000     	brk	#0
 46859b4: d4400000     	hlt	#0
 46859b8: d4200020     	brk	#0x1
 46859bc: d4200000     	brk	#0
 46859c0: d4400000     	hlt	#0
 46859c4: d4200020     	brk	#0x1
 46859c8: d2800008     	mov	x8, #0x0                ; =0
 46859cc: 17fffeb1     	b	0x4685490 <_ChromeMain+0x46801f4>
 46859d0: 52803600     	mov	w0, #0x1b0              ; =432
 46859d4: 96e62665     	bl	0xf368 <_ChromeMain+0xa0cc>
 46859d8: aa1403e1     	mov	x1, x20
 46859dc: 97218069     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 46859e0: 17ffffa9     	b	0x4685884 <_ChromeMain+0x46805e8>
 46859e4: 52803600     	mov	w0, #0x1b0              ; =432
 46859e8: 96e62660     	bl	0xf368 <_ChromeMain+0xa0cc>
 46859ec: aa1403e1     	mov	x1, x20
 46859f0: 97218064     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 46859f4: 17ffffac     	b	0x46858a4 <_ChromeMain+0x4680608>
 46859f8: f9400109     	ldr	x9, [x8]
 46859fc: f9400529     	ldr	x9, [x9, #0x8]
 4685a00: aa0803e0     	mov	x0, x8
 4685a04: d63f0120     	blr	x9
 4685a08: f9416680     	ldr	x0, [x20, #0x2c8]
 4685a0c: 17ffff22     	b	0x4685694 <_ChromeMain+0x46803f8>
 4685a10: f9400109     	ldr	x9, [x8]
 4685a14: f9400529     	ldr	x9, [x9, #0x8]
 4685a18: aa0803e0     	mov	x0, x8
 4685a1c: d63f0120     	blr	x9
 4685a20: f9416680     	ldr	x0, [x20, #0x2c8]
 4685a24: 17ffff20     	b	0x46856a4 <_ChromeMain+0x4680408>
 4685a28: 52803600     	mov	w0, #0x1b0              ; =432
 4685a2c: 96e6264f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685a30: aa0003f7     	mov	x23, x0
 4685a34: aa1603e1     	mov	x1, x22
 4685a38: 97218052     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4685a3c: 17ffffa3     	b	0x46858c8 <_ChromeMain+0x468062c>
