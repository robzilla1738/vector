
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4241c00: d101c3ff     	sub	sp, sp, #0x70
 4241c04: a9016ffc     	stp	x28, x27, [sp, #0x10]
 4241c08: a90267fa     	stp	x26, x25, [sp, #0x20]
 4241c0c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4241c10: a90457f6     	stp	x22, x21, [sp, #0x40]
 4241c14: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4241c18: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4241c1c: 910183fd     	add	x29, sp, #0x60
 4241c20: aa0303f5     	mov	x21, x3
 4241c24: aa0203f6     	mov	x22, x2
 4241c28: aa0103f7     	mov	x23, x1
 4241c2c: aa0003f3     	mov	x19, x0
 4241c30: 9744b544     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4241c34: 90050868     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4241c38: 91094108     	add	x8, x8, #0x250
 4241c3c: f9018808     	str	x8, [x0, #0x310]
 4241c40: 390c601f     	strb	wzr, [x0, #0x318]
 4241c44: 52800100     	mov	w0, #0x8                ; =8
 4241c48: 96f735c8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4241c4c: b900001f     	str	wzr, [x0]
 4241c50: 3900101f     	strb	wzr, [x0, #0x4]
 4241c54: b40000c0     	cbz	x0, 0x4241c6c <_ChromeMain+0x423c9d0>
 4241c58: 52800028     	mov	w8, #0x1                ; =1
 4241c5c: b8280008     	ldadd	w8, w8, [x0]
 4241c60: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4241c64: 6b09011f     	cmp	w8, w9
 4241c68: 540038e0     	b.eq	0x4242384 <_ChromeMain+0x423d0e8>
 4241c6c: 910c4268     	add	x8, x19, #0x310
 4241c70: f9019260     	str	x0, [x19, #0x320]
 4241c74: f9019668     	str	x8, [x19, #0x328]
 4241c78: f0050528     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 4241c7c: 9132a108     	add	x8, x8, #0xca8
 4241c80: f9019a68     	str	x8, [x19, #0x330]
 4241c84: d00503bb     	adrp	x27, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 4241c88: 913c237b     	add	x27, x27, #0xf08
 4241c8c: f9019e7b     	str	x27, [x19, #0x338]
 4241c90: 52800100     	mov	w0, #0x8                ; =8
 4241c94: 96f735b5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4241c98: b900001f     	str	wzr, [x0]
 4241c9c: 3900101f     	strb	wzr, [x0, #0x4]
 4241ca0: b40000c0     	cbz	x0, 0x4241cb8 <_ChromeMain+0x423ca1c>
 4241ca4: 52800028     	mov	w8, #0x1                ; =1
 4241ca8: b8280008     	ldadd	w8, w8, [x0]
 4241cac: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4241cb0: 6b09011f     	cmp	w8, w9
 4241cb4: 540036e0     	b.eq	0x4242390 <_ChromeMain+0x423d0f4>
 4241cb8: 910ce27a     	add	x26, x19, #0x338
 4241cbc: f901a260     	str	x0, [x19, #0x340]
 4241cc0: f901a67a     	str	x26, [x19, #0x348]
 4241cc4: 90052248     	adrp	x8, 0xe689000 <dyld_stub_binder+0xe689000>
 4241cc8: 9127c108     	add	x8, x8, #0x9f0
 4241ccc: 910d427c     	add	x28, x19, #0x350
 4241cd0: 91108109     	add	x9, x8, #0x420
 4241cd4: a9002668     	stp	x8, x9, [x19]
 4241cd8: 91112109     	add	x9, x8, #0x448
 4241cdc: f9000a69     	str	x9, [x19, #0x10]
 4241ce0: 91120109     	add	x9, x8, #0x480
 4241ce4: 9112c10a     	add	x10, x8, #0x4b0
 4241ce8: a906aa69     	stp	x9, x10, [x19, #0x68]
 4241cec: 91140109     	add	x9, x8, #0x500
 4241cf0: f9005a69     	str	x9, [x19, #0xb0]
 4241cf4: 91158109     	add	x9, x8, #0x560
 4241cf8: aa1303f4     	mov	x20, x19
 4241cfc: f80d8e89     	str	x9, [x20, #0xd8]!
 4241d00: 91164109     	add	x9, x8, #0x590
 4241d04: f9007e69     	str	x9, [x19, #0xf8]
 4241d08: 9116e109     	add	x9, x8, #0x5b8
 4241d0c: f9018a69     	str	x9, [x19, #0x310]
 4241d10: 91178109     	add	x9, x8, #0x5e0
 4241d14: f9019a69     	str	x9, [x19, #0x330]
 4241d18: 91198109     	add	x9, x8, #0x660
 4241d1c: f9019e69     	str	x9, [x19, #0x338]
 4241d20: 911a6108     	add	x8, x8, #0x698
 4241d24: f901aa68     	str	x8, [x19, #0x350]
 4241d28: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4241d2c: b0054b98     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4241d30: f9404709     	ldr	x9, [x24, #0x88]
 4241d34: eb09011f     	cmp	x8, x9
 4241d38: 54000061     	b.ne	0x4241d44 <_ChromeMain+0x423caa8>
 4241d3c: aa1703e0     	mov	x0, x23
 4241d40: 96f7496f     	bl	0x142fc <_ChromeMain+0xf060>
 4241d44: f901ae77     	str	x23, [x19, #0x358]
 4241d48: b9036276     	str	w22, [x19, #0x360]
 4241d4c: 7906ca75     	strh	w21, [x19, #0x364]
 4241d50: 910da268     	add	x8, x19, #0x368
 4241d54: 6f00e400     	movi.2d	v0, #0000000000000000
 4241d58: 3d800100     	str	q0, [x8]
 4241d5c: 910de260     	add	x0, x19, #0x378
 4241d60: 910d4261     	add	x1, x19, #0x350
 4241d64: 52800782     	mov	w2, #0x3c               ; =60
 4241d68: 9744b3a6     	bl	0x136ec00 <_ChromeMain+0x1369964>
 4241d6c: 90050516     	adrp	x22, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 4241d70: 912402d6     	add	x22, x22, #0x900
 4241d74: f901be76     	str	x22, [x19, #0x378]
 4241d78: 925e7797     	and	x23, x28, #0xfffffffc00000000
 4241d7c: f9404708     	ldr	x8, [x24, #0x88]
 4241d80: eb0802ff     	cmp	x23, x8
 4241d84: 54000061     	b.ne	0x4241d90 <_ChromeMain+0x423caf4>
 4241d88: 910d4260     	add	x0, x19, #0x350
 4241d8c: 96f7495c     	bl	0x142fc <_ChromeMain+0xf060>
 4241d90: 529a9815     	mov	w21, #0xd4c0            ; =54464
 4241d94: 72a00035     	movk	w21, #0x1, lsl #16
 4241d98: f901e27c     	str	x28, [x19, #0x3c0]
 4241d9c: 52800039     	mov	w25, #0x1               ; =1
 4241da0: b903ca79     	str	w25, [x19, #0x3c8]
 4241da4: 390f327f     	strb	wzr, [x19, #0x3cc]
 4241da8: 390f427f     	strb	wzr, [x19, #0x3d0]
 4241dac: f901ee7f     	str	xzr, [x19, #0x3d8]
 4241db0: f901f67f     	str	xzr, [x19, #0x3e8]
 4241db4: f901f27f     	str	xzr, [x19, #0x3e0]
 4241db8: f901fa75     	str	x21, [x19, #0x3f0]
 4241dbc: d2e7fe18     	mov	x24, #0x3ff0000000000000 ; =4607182418800017408
 4241dc0: f901fe78     	str	x24, [x19, #0x3f8]
 4241dc4: 91100260     	add	x0, x19, #0x400
 4241dc8: 910d4261     	add	x1, x19, #0x350
 4241dcc: 52800782     	mov	w2, #0x3c               ; =60
 4241dd0: 9744b38c     	bl	0x136ec00 <_ChromeMain+0x1369964>
 4241dd4: f9020276     	str	x22, [x19, #0x400]
 4241dd8: b0054b88     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4241ddc: f9404508     	ldr	x8, [x8, #0x88]
 4241de0: eb0802ff     	cmp	x23, x8
 4241de4: 54000061     	b.ne	0x4241df0 <_ChromeMain+0x423cb54>
 4241de8: 910d4260     	add	x0, x19, #0x350
 4241dec: 96f74944     	bl	0x142fc <_ChromeMain+0xf060>
 4241df0: f902267c     	str	x28, [x19, #0x448]
 4241df4: b9045279     	str	w25, [x19, #0x450]
 4241df8: 3911527f     	strb	wzr, [x19, #0x454]
 4241dfc: 3911627f     	strb	wzr, [x19, #0x458]
 4241e00: f902327f     	str	xzr, [x19, #0x460]
 4241e04: f9023a7f     	str	xzr, [x19, #0x470]
 4241e08: f902367f     	str	xzr, [x19, #0x468]
 4241e0c: f9023e75     	str	x21, [x19, #0x478]
 4241e10: f9024278     	str	x24, [x19, #0x480]
 4241e14: b9048a7f     	str	wzr, [x19, #0x488]
 4241e18: 3912327f     	strb	wzr, [x19, #0x48c]
 4241e1c: f9024a7b     	str	x27, [x19, #0x490]
 4241e20: 52800100     	mov	w0, #0x8                ; =8
 4241e24: 96f73551     	bl	0xf368 <_ChromeMain+0xa0cc>
 4241e28: b900001f     	str	wzr, [x0]
 4241e2c: 3900101f     	strb	wzr, [x0, #0x4]
 4241e30: b40000c0     	cbz	x0, 0x4241e48 <_ChromeMain+0x423cbac>
 4241e34: 52800028     	mov	w8, #0x1                ; =1
 4241e38: b8280008     	ldadd	w8, w8, [x0]
 4241e3c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4241e40: 6b09011f     	cmp	w8, w9
 4241e44: 54002ac0     	b.eq	0x424239c <_ChromeMain+0x423d100>
 4241e48: 91124268     	add	x8, x19, #0x490
 4241e4c: f9024e60     	str	x0, [x19, #0x498]
 4241e50: f9025268     	str	x8, [x19, #0x4a0]
 4241e54: d0050528     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 4241e58: 91124108     	add	x8, x8, #0x490
 4241e5c: f9024a68     	str	x8, [x19, #0x490]
 4241e60: f902567f     	str	xzr, [x19, #0x4a8]
 4241e64: f9025e7f     	str	xzr, [x19, #0x4b8]
 4241e68: 52800400     	mov	w0, #0x20               ; =32
 4241e6c: 96f7353f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4241e70: f9000c1f     	str	xzr, [x0, #0x18]
 4241e74: aa0003e8     	mov	x8, x0
 4241e78: f8010d1f     	str	xzr, [x8, #0x10]!
 4241e7c: b0050849     	adrp	x9, 0xe34a000 <dyld_stub_binder+0xe34a000>
 4241e80: 91166129     	add	x9, x9, #0x598
 4241e84: a9002009     	stp	x9, x8, [x0]
 4241e88: f9026260     	str	x0, [x19, #0x4c0]
 4241e8c: 91132268     	add	x8, x19, #0x4c8
 4241e90: 6f00e400     	movi.2d	v0, #0000000000000000
 4241e94: ad000100     	stp	q0, q0, [x8]
 4241e98: f902767f     	str	xzr, [x19, #0x4e8]
 4241e9c: f9027e7f     	str	xzr, [x19, #0x4f8]
 4241ea0: f902867f     	str	xzr, [x19, #0x508]
 4241ea4: f902827f     	str	xzr, [x19, #0x500]
 4241ea8: 12800008     	mov	w8, #-0x1               ; =-1
 4241eac: b9051268     	str	w8, [x19, #0x510]
 4241eb0: 91146268     	add	x8, x19, #0x518
 4241eb4: ad000100     	stp	q0, q0, [x8]
 4241eb8: 900503c9     	adrp	x9, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 4241ebc: 91148129     	add	x9, x9, #0x520
 4241ec0: 3d800900     	str	q0, [x8, #0x20]
 4241ec4: f9027a69     	str	x9, [x19, #0x4f0]
 4241ec8: f902a67f     	str	xzr, [x19, #0x548]
 4241ecc: 925e7748     	and	x8, x26, #0xfffffffc00000000
 4241ed0: b0054b99     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4241ed4: f9404729     	ldr	x9, [x25, #0x88]
 4241ed8: eb09011f     	cmp	x8, x9
 4241edc: 54000081     	b.ne	0x4241eec <_ChromeMain+0x423cc50>
 4241ee0: 910ce260     	add	x0, x19, #0x338
 4241ee4: 96f74906     	bl	0x142fc <_ChromeMain+0xf060>
 4241ee8: 6f00e400     	movi.2d	v0, #0000000000000000
 4241eec: f902aa7a     	str	x26, [x19, #0x550]
 4241ef0: 91156268     	add	x8, x19, #0x558
 4241ef4: 3d800100     	str	q0, [x8]
 4241ef8: f0056628     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4241efc: f9401915     	ldr	x21, [x8, #0x30]
 4241f00: b0047f21     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4241f04: 910a4c21     	add	x1, x1, #0x293
 4241f08: aa1503e0     	mov	x0, x21
 4241f0c: 96fecd9c     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4241f10: 370001e0     	tbnz	w0, #0x0, 0x4241f4c <_ChromeMain+0x423ccb0>
 4241f14: b0047f21     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4241f18: 910ac021     	add	x1, x1, #0x2b0
 4241f1c: aa1503e0     	mov	x0, x21
 4241f20: 96fecd97     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4241f24: 370000e0     	tbnz	w0, #0x0, 0x4241f40 <_ChromeMain+0x423cca4>
 4241f28: f0056675     	adrp	x21, 0xef10000 <dyld_stub_binder+0xef10000>
 4241f2c: 394ca6a8     	ldrb	w8, [x21, #0x329]
 4241f30: 360021a8     	tbz	w8, #0x0, 0x4242364 <_ChromeMain+0x423d0c8>
 4241f34: f0056668     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4241f38: 394ca108     	ldrb	w8, [x8, #0x328]
 4241f3c: 37000088     	tbnz	w8, #0x0, 0x4241f4c <_ChromeMain+0x423ccb0>
 4241f40: 52927c08     	mov	w8, #0x93e0             ; =37856
 4241f44: 72a00088     	movk	w8, #0x4, lsl #16
 4241f48: 14000002     	b	0x4241f50 <_ChromeMain+0x423ccb4>
 4241f4c: d2800008     	mov	x8, #0x0                ; =0
 4241f50: f901fa68     	str	x8, [x19, #0x3f0]
 4241f54: f9023e68     	str	x8, [x19, #0x478]
 4241f58: 90053e21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4241f5c: 911a2021     	add	x1, x1, #0x688
 4241f60: d0054482     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 4241f64: 9112e042     	add	x2, x2, #0x4b8
 4241f68: aa1403e0     	mov	x0, x20
 4241f6c: 97674b25     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 4241f70: 52800860     	mov	w0, #0x43               ; =67
 4241f74: 970b0653     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4241f78: aa0003f4     	mov	x20, x0
 4241f7c: 52802400     	mov	w0, #0x120              ; =288
 4241f80: 96f734fa     	bl	0xf368 <_ChromeMain+0xa0cc>
 4241f84: aa0003f5     	mov	x21, x0
 4241f88: 97490dd6     	bl	0x14856e0 <_ChromeMain+0x1480444>
 4241f8c: b0050888     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 4241f90: 9117c108     	add	x8, x8, #0x5f0
 4241f94: f9000008     	str	x8, [x0]
 4241f98: 91036108     	add	x8, x8, #0xd8
 4241f9c: f9001408     	str	x8, [x0, #0x28]
 4241fa0: a90f7c1f     	stp	xzr, xzr, [x0, #0xf0]
 4241fa4: b901001f     	str	wzr, [x0, #0x100]
 4241fa8: b9010414     	str	w20, [x0, #0x104]
 4241fac: d2c00068     	mov	x8, #0x300000000        ; =12884901888
 4241fb0: a910fc08     	stp	x8, xzr, [x0, #0x108]
 4241fb4: 3904601f     	strb	wzr, [x0, #0x118]
 4241fb8: aa1303e0     	mov	x0, x19
 4241fbc: aa1503e1     	mov	x1, x21
 4241fc0: 97651e1e     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4241fc4: f0ffe95b     	adrp	x27, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4241fc8: 9127037b     	add	x27, x27, #0x9c0
 4241fcc: b9436268     	ldr	w8, [x19, #0x360]
 4241fd0: f0fec41c     	adrp	x28, 0x1ac4000 <_ChromeMain+0x1abed64>
 4241fd4: 9118039c     	add	x28, x28, #0x600
 4241fd8: 90ff18fa     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 4241fdc: 912c035a     	add	x26, x26, #0xb00
 4241fe0: 7100051f     	cmp	w8, #0x1
 4241fe4: 54000c41     	b.ne	0x424216c <_ChromeMain+0x423ced0>
 4241fe8: 394d9268     	ldrb	w8, [x19, #0x364]
 4241fec: 34000c08     	cbz	w8, 0x424216c <_ChromeMain+0x423ced0>
 4241ff0: f941ae68     	ldr	x8, [x19, #0x358]
 4241ff4: f9402100     	ldr	x0, [x8, #0x40]
 4241ff8: b4000ba0     	cbz	x0, 0x424216c <_ChromeMain+0x423ced0>
 4241ffc: 9785f90a     	bl	0x23c0424 <_ChromeMain+0x23bb188>
 4242000: b4000b60     	cbz	x0, 0x424216c <_ChromeMain+0x423ced0>
 4242004: b0054482     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 4242008: 910e8042     	add	x2, x2, #0x3a0
 424200c: aa1303e0     	mov	x0, x19
 4242010: 52802e61     	mov	w1, #0x173              ; =371
 4242014: 9793f34f     	bl	0x273ed50 <_ChromeMain+0x2739ab4>
 4242018: aa0003f4     	mov	x20, x0
 424201c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4242020: f9404729     	ldr	x9, [x25, #0x88]
 4242024: eb09011f     	cmp	x8, x9
 4242028: 54000061     	b.ne	0x4242034 <_ChromeMain+0x423cd98>
 424202c: aa1303e0     	mov	x0, x19
 4242030: 96f748b3     	bl	0x142fc <_ChromeMain+0xf060>
 4242034: 52800700     	mov	w0, #0x38               ; =56
 4242038: 96f734cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 424203c: aa0003f6     	mov	x22, x0
 4242040: 52800039     	mov	w25, #0x1               ; =1
 4242044: b9000019     	str	w25, [x0]
 4242048: a900f01b     	stp	x27, x28, [x0, #0x8]
 424204c: 10001ba8     	adr	x8, 0x42423c0 <_ChromeMain+0x423d124>
 4242050: d503201f     	nop
 4242054: a901a01a     	stp	x26, x8, [x0, #0x18]
 4242058: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 424205c: 52800200     	mov	w0, #0x10               ; =16
 4242060: 96f734c2     	bl	0xf368 <_ChromeMain+0xa0cc>
 4242064: aa0003f7     	mov	x23, x0
 4242068: f0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 424206c: 910e0108     	add	x8, x8, #0x380
 4242070: f9000008     	str	x8, [x0]
 4242074: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4242078: 90054b89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 424207c: f9404529     	ldr	x9, [x9, #0x88]
 4242080: eb09011f     	cmp	x8, x9
 4242084: 54000061     	b.ne	0x4242090 <_ChromeMain+0x423cdf4>
 4242088: aa1403e0     	mov	x0, x20
 424208c: 96f7489c     	bl	0x142fc <_ChromeMain+0xf060>
 4242090: f0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4242094: 910b6108     	add	x8, x8, #0x2d8
 4242098: a90052e8     	stp	x8, x20, [x23]
 424209c: 52800d00     	mov	w0, #0x68               ; =104
 42420a0: 96f734b2     	bl	0xf368 <_ChromeMain+0xa0cc>
 42420a4: aa0003f5     	mov	x21, x0
 42420a8: f90003f6     	str	x22, [sp]
 42420ac: 390023f9     	strb	w25, [sp, #0x8]
 42420b0: 910003e2     	mov	x2, sp
 42420b4: aa1403e1     	mov	x1, x20
 42420b8: aa1703e3     	mov	x3, x23
 42420bc: 979cca18     	bl	0x297491c <_ChromeMain+0x296f680>
 42420c0: 394023e8     	ldrb	w8, [sp, #0x8]
 42420c4: 7103fd1f     	cmp	w8, #0xff
 42420c8: 54000060     	b.eq	0x42420d4 <_ChromeMain+0x423ce38>
 42420cc: f94003e0     	ldr	x0, [sp]
 42420d0: b5001380     	cbnz	x0, 0x4242340 <_ChromeMain+0x423d0a4>
 42420d4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 42420d8: 90054b99     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42420dc: f9404729     	ldr	x9, [x25, #0x88]
 42420e0: eb09011f     	cmp	x8, x9
 42420e4: 54000061     	b.ne	0x42420f0 <_ChromeMain+0x423ce54>
 42420e8: aa1503e0     	mov	x0, x21
 42420ec: 96f74884     	bl	0x142fc <_ChromeMain+0xf060>
 42420f0: f9426a60     	ldr	x0, [x19, #0x4d0]
 42420f4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42420f8: f9404729     	ldr	x9, [x25, #0x88]
 42420fc: eb09011f     	cmp	x8, x9
 4242100: 54000041     	b.ne	0x4242108 <_ChromeMain+0x423ce6c>
 4242104: 96f7824e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4242108: f9026a75     	str	x21, [x19, #0x4d0]
 424210c: aa1403e0     	mov	x0, x20
 4242110: aa1503e1     	mov	x1, x21
 4242114: 979cc9d1     	bl	0x2974858 <_ChromeMain+0x296f5bc>
 4242118: b40002b4     	cbz	x20, 0x424216c <_ChromeMain+0x423ced0>
 424211c: 3945a688     	ldrb	w8, [x20, #0x169]
 4242120: 350014a8     	cbnz	w8, 0x42423b4 <_ChromeMain+0x423d118>
 4242124: f940ce62     	ldr	x2, [x19, #0x198]
 4242128: aa1303e0     	mov	x0, x19
 424212c: aa1403e1     	mov	x1, x20
 4242130: 9714dcb3     	bl	0x7793fc <_ChromeMain+0x774160>
 4242134: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4242138: f9404729     	ldr	x9, [x25, #0x88]
 424213c: eb09011f     	cmp	x8, x9
 4242140: 910da275     	add	x21, x19, #0x368
 4242144: 54000061     	b.ne	0x4242150 <_ChromeMain+0x423ceb4>
 4242148: aa1403e0     	mov	x0, x20
 424214c: 96f7486c     	bl	0x142fc <_ChromeMain+0xf060>
 4242150: f94002a0     	ldr	x0, [x21]
 4242154: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4242158: f9404729     	ldr	x9, [x25, #0x88]
 424215c: eb09011f     	cmp	x8, x9
 4242160: 54000041     	b.ne	0x4242168 <_ChromeMain+0x423cecc>
 4242164: 96f78236     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4242168: f90002b4     	str	x20, [x21]
 424216c: 394d9668     	ldrb	w8, [x19, #0x365]
 4242170: 34000348     	cbz	w8, 0x42421d8 <_ChromeMain+0x423cf3c>
 4242174: b0054482     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 4242178: 9112a042     	add	x2, x2, #0x4a8
 424217c: aa1303e0     	mov	x0, x19
 4242180: 52802e81     	mov	w1, #0x174              ; =372
 4242184: 9793f2f3     	bl	0x273ed50 <_ChromeMain+0x2739ab4>
 4242188: 3945a408     	ldrb	w8, [x0, #0x169]
 424218c: 350010e8     	cbnz	w8, 0x42423a8 <_ChromeMain+0x423d10c>
 4242190: aa0003f4     	mov	x20, x0
 4242194: f940ce62     	ldr	x2, [x19, #0x198]
 4242198: aa1303e0     	mov	x0, x19
 424219c: aa1403e1     	mov	x1, x20
 42421a0: 9714dc97     	bl	0x7793fc <_ChromeMain+0x774160>
 42421a4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 42421a8: f9404729     	ldr	x9, [x25, #0x88]
 42421ac: eb09011f     	cmp	x8, x9
 42421b0: 54000061     	b.ne	0x42421bc <_ChromeMain+0x423cf20>
 42421b4: aa1403e0     	mov	x0, x20
 42421b8: 96f74851     	bl	0x142fc <_ChromeMain+0xf060>
 42421bc: f941ba60     	ldr	x0, [x19, #0x370]
 42421c0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42421c4: f9404729     	ldr	x9, [x25, #0x88]
 42421c8: eb09011f     	cmp	x8, x9
 42421cc: 54000041     	b.ne	0x42421d4 <_ChromeMain+0x423cf38>
 42421d0: 96f7821b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42421d4: f901ba74     	str	x20, [x19, #0x370]
 42421d8: f941ae68     	ldr	x8, [x19, #0x358]
 42421dc: f9402100     	ldr	x0, [x8, #0x40]
 42421e0: f9400008     	ldr	x8, [x0]
 42421e4: f940b508     	ldr	x8, [x8, #0x168]
 42421e8: d63f0100     	blr	x8
 42421ec: aa0003f4     	mov	x20, x0
 42421f0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42421f4: f9404729     	ldr	x9, [x25, #0x88]
 42421f8: eb09011f     	cmp	x8, x9
 42421fc: 54000061     	b.ne	0x4242208 <_ChromeMain+0x423cf6c>
 4242200: aa1403e0     	mov	x0, x20
 4242204: 96f7483e     	bl	0x142fc <_ChromeMain+0xf060>
 4242208: f9425e60     	ldr	x0, [x19, #0x4b8]
 424220c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4242210: f9404729     	ldr	x9, [x25, #0x88]
 4242214: eb09011f     	cmp	x8, x9
 4242218: 54000a20     	b.eq	0x424235c <_ChromeMain+0x423d0c0>
 424221c: f9025e74     	str	x20, [x19, #0x4b8]
 4242220: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4242224: f9404729     	ldr	x9, [x25, #0x88]
 4242228: eb09011f     	cmp	x8, x9
 424222c: 54000061     	b.ne	0x4242238 <_ChromeMain+0x423cf9c>
 4242230: aa1303e0     	mov	x0, x19
 4242234: 96f74832     	bl	0x142fc <_ChromeMain+0xf060>
 4242238: 52800700     	mov	w0, #0x38               ; =56
 424223c: 96f7344b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4242240: 52800038     	mov	w24, #0x1               ; =1
 4242244: b9000018     	str	w24, [x0]
 4242248: a900f01b     	stp	x27, x28, [x0, #0x8]
 424224c: 100011b7     	adr	x23, 0x4242480 <_ChromeMain+0x423d1e4>
 4242250: d503201f     	nop
 4242254: a901dc1a     	stp	x26, x23, [x0, #0x18]
 4242258: d0ff1615     	adrp	x21, 0x2504000 <_ChromeMain+0x24fed64>
 424225c: 911172b5     	add	x21, x21, #0x45c
 4242260: d0ffb2b6     	adrp	x22, 0x3898000 <_ChromeMain+0x3892d64>
 4242264: 910702d6     	add	x22, x22, #0x1c0
 4242268: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 424226c: b4000840     	cbz	x0, 0x4242374 <_ChromeMain+0x423d0d8>
 4242270: aa0003f4     	mov	x20, x0
 4242274: 52800600     	mov	w0, #0x30               ; =48
 4242278: 96f7343c     	bl	0xf368 <_ChromeMain+0xa0cc>
 424227c: aa0003e3     	mov	x3, x0
 4242280: b9000018     	str	w24, [x0]
 4242284: a900d815     	stp	x21, x22, [x0, #0x8]
 4242288: f9000c1a     	str	x26, [x0, #0x18]
 424228c: f9001414     	str	x20, [x0, #0x28]
 4242290: f0046501     	adrp	x1, 0xcee5000 <dyld_stub_binder+0xcee5000>
 4242294: 912b0c21     	add	x1, x1, #0xac3
 4242298: 91124260     	add	x0, x19, #0x490
 424229c: 528003a2     	mov	w2, #0x1d               ; =29
 42422a0: 973aa264     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 42422a4: 925e7668     	and	x8, x19, #0xfffffffc00000000
 42422a8: f9404729     	ldr	x9, [x25, #0x88]
 42422ac: eb09011f     	cmp	x8, x9
 42422b0: 54000061     	b.ne	0x42422bc <_ChromeMain+0x423d020>
 42422b4: aa1303e0     	mov	x0, x19
 42422b8: 96f74811     	bl	0x142fc <_ChromeMain+0xf060>
 42422bc: 52800700     	mov	w0, #0x38               ; =56
 42422c0: 96f7342a     	bl	0xf368 <_ChromeMain+0xa0cc>
 42422c4: b9000018     	str	w24, [x0]
 42422c8: a900f01b     	stp	x27, x28, [x0, #0x8]
 42422cc: a901dc1a     	stp	x26, x23, [x0, #0x18]
 42422d0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 42422d4: b4000540     	cbz	x0, 0x424237c <_ChromeMain+0x423d0e0>
 42422d8: aa0003f4     	mov	x20, x0
 42422dc: 52800600     	mov	w0, #0x30               ; =48
 42422e0: 96f73422     	bl	0xf368 <_ChromeMain+0xa0cc>
 42422e4: aa0003e3     	mov	x3, x0
 42422e8: b9000018     	str	w24, [x0]
 42422ec: a900d815     	stp	x21, x22, [x0, #0x8]
 42422f0: f9000c1a     	str	x26, [x0, #0x18]
 42422f4: f9001414     	str	x20, [x0, #0x28]
 42422f8: f0046501     	adrp	x1, 0xcee5000 <dyld_stub_binder+0xcee5000>
 42422fc: 912c1021     	add	x1, x1, #0xb04
 4242300: 91124260     	add	x0, x19, #0x490
 4242304: 52800442     	mov	w2, #0x22               ; =34
 4242308: 973aa24a     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 424230c: aa1303e0     	mov	x0, x19
 4242310: 9400005c     	bl	0x4242480 <_ChromeMain+0x423d1e4>
 4242314: aa1303e0     	mov	x0, x19
 4242318: 97a4967a     	bl	0x2b67d00 <_ChromeMain+0x2b62a64>
 424231c: aa1303e0     	mov	x0, x19
 4242320: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4242324: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4242328: a94457f6     	ldp	x22, x21, [sp, #0x40]
 424232c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4242330: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4242334: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 4242338: 9101c3ff     	add	sp, sp, #0x70
 424233c: d65f03c0     	ret
 4242340: 12800008     	mov	w8, #-0x1               ; =-1
 4242344: b8e80008     	ldaddal	w8, w8, [x0]
 4242348: 7100051f     	cmp	w8, #0x1
 424234c: 54ffec41     	b.ne	0x42420d4 <_ChromeMain+0x423ce38>
 4242350: f9400808     	ldr	x8, [x0, #0x10]
 4242354: d63f0100     	blr	x8
 4242358: 17ffff5f     	b	0x42420d4 <_ChromeMain+0x423ce38>
 424235c: 96f791ba     	bl	0x26a44 <_ChromeMain+0x217a8>
 4242360: 17ffffaf     	b	0x424221c <_ChromeMain+0x423cf80>
 4242364: 979bf050     	bl	0x293e4a4 <_ChromeMain+0x2939208>
 4242368: 394ca6a8     	ldrb	w8, [x21, #0x329]
 424236c: 3707de48     	tbnz	w8, #0x0, 0x4241f34 <_ChromeMain+0x423cc98>
 4242370: 9426f7eb     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4242374: d2800003     	mov	x3, #0x0                ; =0
 4242378: 17ffffc6     	b	0x4242290 <_ChromeMain+0x423cff4>
 424237c: d2800003     	mov	x3, #0x0                ; =0
 4242380: 17ffffde     	b	0x42422f8 <_ChromeMain+0x423d05c>
 4242384: d4200000     	brk	#0
 4242388: d4400000     	hlt	#0
 424238c: d4200020     	brk	#0x1
 4242390: d4200000     	brk	#0
 4242394: d4400000     	hlt	#0
 4242398: d4200020     	brk	#0x1
 424239c: d4200000     	brk	#0
 42423a0: d4400000     	hlt	#0
 42423a4: d4200020     	brk	#0x1
 42423a8: d4200000     	brk	#0
 42423ac: d4400000     	hlt	#0
 42423b0: d4200020     	brk	#0x1
 42423b4: d4200000     	brk	#0
 42423b8: d4400000     	hlt	#0
 42423bc: d4200020     	brk	#0x1
