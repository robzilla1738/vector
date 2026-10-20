
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3621b00: d10343ff     	sub	sp, sp, #0xd0
 3621b04: a9076ffc     	stp	x28, x27, [sp, #0x70]
 3621b08: a90867fa     	stp	x26, x25, [sp, #0x80]
 3621b0c: a9095ff8     	stp	x24, x23, [sp, #0x90]
 3621b10: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 3621b14: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 3621b18: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 3621b1c: 910303fd     	add	x29, sp, #0xc0
 3621b20: aa0403f4     	mov	x20, x4
 3621b24: aa0303f8     	mov	x24, x3
 3621b28: aa0203f7     	mov	x23, x2
 3621b2c: aa0103f6     	mov	x22, x1
 3621b30: aa0003f3     	mov	x19, x0
 3621b34: 97d849dc     	bl	0x2c342a4 <_ChromeMain+0x2c2f008>
 3621b38: 90056968     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 3621b3c: 91094108     	add	x8, x8, #0x250
 3621b40: f901a008     	str	x8, [x0, #0x340]
 3621b44: 390d201f     	strb	wzr, [x0, #0x348]
 3621b48: 52800100     	mov	w0, #0x8                ; =8
 3621b4c: 9727b607     	bl	0xf368 <_ChromeMain+0xa0cc>
 3621b50: b900001f     	str	wzr, [x0]
 3621b54: 3900101f     	strb	wzr, [x0, #0x4]
 3621b58: b40000c0     	cbz	x0, 0x3621b70 <_ChromeMain+0x361c8d4>
 3621b5c: 52800028     	mov	w8, #0x1                ; =1
 3621b60: b8280008     	ldadd	w8, w8, [x0]
 3621b64: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3621b68: 6b09011f     	cmp	w8, w9
 3621b6c: 54004f80     	b.eq	0x362255c <_ChromeMain+0x361d2c0>
 3621b70: 910d0268     	add	x8, x19, #0x340
 3621b74: f901aa60     	str	x0, [x19, #0x350]
 3621b78: f901ae68     	str	x8, [x19, #0x358]
 3621b7c: d00564a8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 3621b80: 913c2108     	add	x8, x8, #0xf08
 3621b84: f901b268     	str	x8, [x19, #0x360]
 3621b88: 52800100     	mov	w0, #0x8                ; =8
 3621b8c: 9727b5f7     	bl	0xf368 <_ChromeMain+0xa0cc>
 3621b90: b900001f     	str	wzr, [x0]
 3621b94: 3900101f     	strb	wzr, [x0, #0x4]
 3621b98: b40000c0     	cbz	x0, 0x3621bb0 <_ChromeMain+0x361c914>
 3621b9c: 52800028     	mov	w8, #0x1                ; =1
 3621ba0: b8280008     	ldadd	w8, w8, [x0]
 3621ba4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3621ba8: 6b09011f     	cmp	w8, w9
 3621bac: 54004de0     	b.eq	0x3622568 <_ChromeMain+0x361d2cc>
 3621bb0: 910d827b     	add	x27, x19, #0x360
 3621bb4: f901b660     	str	x0, [x19, #0x368]
 3621bb8: f901ba7b     	str	x27, [x19, #0x370]
 3621bbc: d0058348     	adrp	x8, 0xe68b000 <dyld_stub_binder+0xe68b000>
 3621bc0: 912b4108     	add	x8, x8, #0xad0
 3621bc4: 91100109     	add	x9, x8, #0x400
 3621bc8: a9002668     	stp	x8, x9, [x19]
 3621bcc: 9110a109     	add	x9, x8, #0x428
 3621bd0: f9000a69     	str	x9, [x19, #0x10]
 3621bd4: 91118109     	add	x9, x8, #0x460
 3621bd8: 9112410a     	add	x10, x8, #0x490
 3621bdc: a906aa69     	stp	x9, x10, [x19, #0x68]
 3621be0: 91138109     	add	x9, x8, #0x4e0
 3621be4: f9005a69     	str	x9, [x19, #0xb0]
 3621be8: 91150109     	add	x9, x8, #0x540
 3621bec: aa1303f9     	mov	x25, x19
 3621bf0: f80d8f29     	str	x9, [x25, #0xd8]!
 3621bf4: 9115c109     	add	x9, x8, #0x570
 3621bf8: aa1303f5     	mov	x21, x19
 3621bfc: f80f8ea9     	str	x9, [x21, #0xf8]!
 3621c00: 91166109     	add	x9, x8, #0x598
 3621c04: f901a269     	str	x9, [x19, #0x340]
 3621c08: 91170108     	add	x8, x8, #0x5c0
 3621c0c: f901b268     	str	x8, [x19, #0x360]
 3621c10: b005ac9a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3621c14: f9404748     	ldr	x8, [x26, #0x88]
 3621c18: 925e7709     	and	x9, x24, #0xfffffffc00000000
 3621c1c: eb08013f     	cmp	x9, x8
 3621c20: 54000081     	b.ne	0x3621c30 <_ChromeMain+0x361c994>
 3621c24: aa1803e0     	mov	x0, x24
 3621c28: 9727c9b5     	bl	0x142fc <_ChromeMain+0xf060>
 3621c2c: f9404748     	ldr	x8, [x26, #0x88]
 3621c30: f901be78     	str	x24, [x19, #0x378]
 3621c34: 925e76e9     	and	x9, x23, #0xfffffffc00000000
 3621c38: eb08013f     	cmp	x9, x8
 3621c3c: 54000081     	b.ne	0x3621c4c <_ChromeMain+0x361c9b0>
 3621c40: aa1703e0     	mov	x0, x23
 3621c44: 9727c9ae     	bl	0x142fc <_ChromeMain+0xf060>
 3621c48: f9404748     	ldr	x8, [x26, #0x88]
 3621c4c: f901c277     	str	x23, [x19, #0x380]
 3621c50: 910e2277     	add	x23, x19, #0x388
 3621c54: 925e7769     	and	x9, x27, #0xfffffffc00000000
 3621c58: f901d67f     	str	xzr, [x19, #0x3a8]
 3621c5c: 6f00e400     	movi.2d	v0, #0000000000000000
 3621c60: ad0002e0     	stp	q0, q0, [x23]
 3621c64: eb08013f     	cmp	x9, x8
 3621c68: 54000061     	b.ne	0x3621c74 <_ChromeMain+0x361c9d8>
 3621c6c: 910d8260     	add	x0, x19, #0x360
 3621c70: 9727c9a3     	bl	0x142fc <_ChromeMain+0xf060>
 3621c74: f901da7b     	str	x27, [x19, #0x3b0]
 3621c78: f901de7f     	str	xzr, [x19, #0x3b8]
 3621c7c: f901e67f     	str	xzr, [x19, #0x3c8]
 3621c80: f901e27f     	str	xzr, [x19, #0x3c0]
 3621c84: 52800400     	mov	w0, #0x20               ; =32
 3621c88: 9727b5b8     	bl	0xf368 <_ChromeMain+0xa0cc>
 3621c8c: b0056948     	adrp	x8, 0xe34a000 <dyld_stub_binder+0xe34a000>
 3621c90: 91166108     	add	x8, x8, #0x598
 3621c94: f9000c1f     	str	xzr, [x0, #0x18]
 3621c98: aa0003e9     	mov	x9, x0
 3621c9c: f8010d3f     	str	xzr, [x9, #0x10]!
 3621ca0: a9002408     	stp	x8, x9, [x0]
 3621ca4: f901ea60     	str	x0, [x19, #0x3d0]
 3621ca8: 910f627b     	add	x27, x19, #0x3d8
 3621cac: 6f00e400     	movi.2d	v0, #0000000000000000
 3621cb0: ad000360     	stp	q0, q0, [x27]
 3621cb4: 394242c8     	ldrb	w8, [x22, #0x90]
 3621cb8: 390fe268     	strb	w8, [x19, #0x3f8]
 3621cbc: 90059f21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 3621cc0: 911a2021     	add	x1, x1, #0x688
 3621cc4: d005a582     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 3621cc8: 91176042     	add	x2, x2, #0x5d8
 3621ccc: aa1903e0     	mov	x0, x25
 3621cd0: 9797cbcc     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 3621cd4: aa1303e0     	mov	x0, x19
 3621cd8: 52800041     	mov	w1, #0x2                ; =2
 3621cdc: 95c2c69e     	bl	0xa6d3754 <_ChromeMain+0xa6ce4b8>
 3621ce0: b005c758     	adrp	x24, 0xef0a000 <dyld_stub_binder+0xef0a000>
 3621ce4: 91120318     	add	x24, x24, #0x480
 3621ce8: f8bfc300     	ldapr	x0, [x24]
 3621cec: b4003f20     	cbz	x0, 0x36224d0 <_ChromeMain+0x361d234>
 3621cf0: 52806801     	mov	w1, #0x340              ; =832
 3621cf4: d2800002     	mov	x2, #0x0                ; =0
 3621cf8: 972a262e     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3621cfc: aa0003f6     	mov	x22, x0
 3621d00: 97d84969     	bl	0x2c342a4 <_ChromeMain+0x2c2f008>
 3621d04: 3945a408     	ldrb	w8, [x0, #0x169]
 3621d08: 35003f48     	cbnz	w8, 0x36224f0 <_ChromeMain+0x361d254>
 3621d0c: f940ce62     	ldr	x2, [x19, #0x198]
 3621d10: aa1303e0     	mov	x0, x19
 3621d14: aa1603e1     	mov	x1, x22
 3621d18: 97455db9     	bl	0x7793fc <_ChromeMain+0x774160>
 3621d1c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 3621d20: f9404749     	ldr	x9, [x26, #0x88]
 3621d24: eb09011f     	cmp	x8, x9
 3621d28: 54000061     	b.ne	0x3621d34 <_ChromeMain+0x361ca98>
 3621d2c: aa1603e0     	mov	x0, x22
 3621d30: 9727c973     	bl	0x142fc <_ChromeMain+0xf060>
 3621d34: f94002e0     	ldr	x0, [x23]
 3621d38: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3621d3c: f9404749     	ldr	x9, [x26, #0x88]
 3621d40: eb09011f     	cmp	x8, x9
 3621d44: 54000041     	b.ne	0x3621d4c <_ChromeMain+0x361cab0>
 3621d48: 9728033d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3621d4c: f90002f6     	str	x22, [x23]
 3621d50: b9431ac8     	ldr	w8, [x22, #0x318]
 3621d54: 7100051f     	cmp	w8, #0x1
 3621d58: 540048e1     	b.ne	0x3622674 <_ChromeMain+0x361d3d8>
 3621d5c: b94322c8     	ldr	w8, [x22, #0x320]
 3621d60: 71000d1f     	cmp	w8, #0x3
 3621d64: 54000220     	b.eq	0x3621da8 <_ChromeMain+0x361cb0c>
 3621d68: f9418ac8     	ldr	x8, [x22, #0x310]
 3621d6c: 52800079     	mov	w25, #0x3               ; =3
 3621d70: b90033f9     	str	w25, [sp, #0x30]
 3621d74: 90059f21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 3621d78: 9115a021     	add	x1, x1, #0x568
 3621d7c: 91046100     	add	x0, x8, #0x118
 3621d80: 9100c3e2     	add	x2, sp, #0x30
 3621d84: 97910d08     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 3621d88: b90322d9     	str	w25, [x22, #0x320]
 3621d8c: aa1603e0     	mov	x0, x22
 3621d90: 52800021     	mov	w1, #0x1                ; =1
 3621d94: 9746fef4     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3621d98: 9103e2c0     	add	x0, x22, #0xf8
 3621d9c: 910c82c1     	add	x1, x22, #0x320
 3621da0: 9764188c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3621da4: f94002f6     	ldr	x22, [x23]
 3621da8: d2800148     	mov	x8, #0xa                ; =10
 3621dac: f2c00188     	movk	x8, #0xc, lsl #32
 3621db0: 4e080d00     	dup.2d	v0, x8
 3621db4: 3d800fe0     	str	q0, [sp, #0x30]
 3621db8: 9100c3e1     	add	x1, sp, #0x30
 3621dbc: aa1603e0     	mov	x0, x22
 3621dc0: 95c2c679     	bl	0xa6d37a4 <_ChromeMain+0xa6ce508>
 3621dc4: f94002f6     	ldr	x22, [x23]
 3621dc8: 394ce2c8     	ldrb	w8, [x22, #0x338]
 3621dcc: 37000228     	tbnz	w8, #0x0, 0x3621e10 <_ChromeMain+0x361cb74>
 3621dd0: f9418ac0     	ldr	x0, [x22, #0x310]
 3621dd4: 3943d008     	ldrb	w8, [x0, #0xf4]
 3621dd8: 370000a8     	tbnz	w8, #0x0, 0x3621dec <_ChromeMain+0x361cb50>
 3621ddc: 52800028     	mov	w8, #0x1                ; =1
 3621de0: 3903d008     	strb	w8, [x0, #0xf4]
 3621de4: 52800021     	mov	w1, #0x1                ; =1
 3621de8: 97910d32     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 3621dec: 52800028     	mov	w8, #0x1                ; =1
 3621df0: 390ce2c8     	strb	w8, [x22, #0x338]
 3621df4: aa1603e0     	mov	x0, x22
 3621df8: 52800021     	mov	w1, #0x1                ; =1
 3621dfc: 9746feda     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3621e00: 9103e2c0     	add	x0, x22, #0xf8
 3621e04: 910ce2c1     	add	x1, x22, #0x338
 3621e08: 97641872     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3621e0c: f94002f6     	ldr	x22, [x23]
 3621e10: f00548e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 3621e14: 3dc31d00     	ldr	q0, [x8, #0xc70]
 3621e18: 3d800fe0     	str	q0, [sp, #0x30]
 3621e1c: 90059f21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 3621e20: 91122021     	add	x1, x1, #0x488
 3621e24: 910362c0     	add	x0, x22, #0xd8
 3621e28: 9100c3e2     	add	x2, sp, #0x30
 3621e2c: 9793300d     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 3621e30: f94002e0     	ldr	x0, [x23]
 3621e34: 52800021     	mov	w1, #0x1                ; =1
 3621e38: 9797ce95     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 3621e3c: f94002e8     	ldr	x8, [x23]
 3621e40: f9401116     	ldr	x22, [x8, #0x20]
 3621e44: b9400ac8     	ldr	w8, [x22, #0x8]
 3621e48: 7100091f     	cmp	w8, #0x2
 3621e4c: 54003580     	b.eq	0x36224fc <_ChromeMain+0x361d260>
 3621e50: 39422ac8     	ldrb	w8, [x22, #0x8a]
 3621e54: 340000e8     	cbz	w8, 0x3621e70 <_ChromeMain+0x361cbd4>
 3621e58: 39022adf     	strb	wzr, [x22, #0x8a]
 3621e5c: f940b6c0     	ldr	x0, [x22, #0x168]
 3621e60: 52800001     	mov	w1, #0x0                ; =0
 3621e64: 975eaf37     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 3621e68: f94002e8     	ldr	x8, [x23]
 3621e6c: f9401116     	ldr	x22, [x8, #0x20]
 3621e70: 4f01f500     	fmov.4s	v0, #12.00000000
 3621e74: 3d800fe0     	str	q0, [sp, #0x30]
 3621e78: f940b2c0     	ldr	x0, [x22, #0x160]
 3621e7c: b4003900     	cbz	x0, 0x362259c <_ChromeMain+0x361d300>
 3621e80: 9100c3e1     	add	x1, sp, #0x30
 3621e84: 97b4df52     	bl	0x2359bcc <_ChromeMain+0x2354930>
 3621e88: f94002f6     	ldr	x22, [x23]
 3621e8c: 52801f48     	mov	w8, #0xfa               ; =250
 3621e90: b81a83a8     	stur	w8, [x29, #-0x58]
 3621e94: 381ac3bf     	sturb	wzr, [x29, #-0x54]
 3621e98: d10163a0     	sub	x0, x29, #0x58
 3621e9c: 1e251000     	fmov	s0, #12.00000000
 3621ea0: 52800001     	mov	w1, #0x0                ; =0
 3621ea4: 97c4f487     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 3621ea8: aa0003e1     	mov	x1, x0
 3621eac: aa1603e0     	mov	x0, x22
 3621eb0: 976416d4     	bl	0xf27a00 <_ChromeMain+0xf22764>
 3621eb4: f94002f6     	ldr	x22, [x23]
 3621eb8: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 3621ebc: 52801ae8     	mov	w8, #0xd7               ; =215
 3621ec0: f90003e8     	str	x8, [sp]
 3621ec4: 1e251000     	fmov	s0, #12.00000000
 3621ec8: 9100c3e1     	add	x1, sp, #0x30
 3621ecc: 910003e2     	mov	x2, sp
 3621ed0: 52800020     	mov	w0, #0x1                ; =1
 3621ed4: 9413fefb     	bl	0x3b21ac0 <_ChromeMain+0x3b1c824>
 3621ed8: aa0003e1     	mov	x1, x0
 3621edc: f94002c8     	ldr	x8, [x22]
 3621ee0: f9408908     	ldr	x8, [x8, #0x110]
 3621ee4: aa1603e0     	mov	x0, x22
 3621ee8: d63f0100     	blr	x8
 3621eec: 52800800     	mov	w0, #0x40               ; =64
 3621ef0: 9727b51e     	bl	0xf368 <_ChromeMain+0xa0cc>
 3621ef4: f94002e1     	ldr	x1, [x23]
 3621ef8: 52800182     	mov	w2, #0xc                ; =12
 3621efc: 95c2ef0a     	bl	0xa6ddb24 <_ChromeMain+0xa6d8888>
 3621f00: f9400376     	ldr	x22, [x27]
 3621f04: f9000360     	str	x0, [x27]
 3621f08: b40000d6     	cbz	x22, 0x3621f20 <_ChromeMain+0x361cc84>
 3621f0c: aa1603e0     	mov	x0, x22
 3621f10: 95c2ef66     	bl	0xa6ddca8 <_ChromeMain+0xa6d8a0c>
 3621f14: 52800801     	mov	w1, #0x40               ; =64
 3621f18: 97279be8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3621f1c: f9400360     	ldr	x0, [x27]
 3621f20: f9400c00     	ldr	x0, [x0, #0x18]
 3621f24: 52800001     	mov	w1, #0x0                ; =0
 3621f28: 94df7c8f     	bl	0x6e01164 <_ChromeMain+0x6dfbec8>
 3621f2c: f94002e0     	ldr	x0, [x23]
 3621f30: f9400008     	ldr	x8, [x0]
 3621f34: f9405108     	ldr	x8, [x8, #0xa0]
 3621f38: 52800001     	mov	w1, #0x0                ; =0
 3621f3c: d63f0100     	blr	x8
 3621f40: f94002f6     	ldr	x22, [x23]
 3621f44: f8bfc300     	ldapr	x0, [x24]
 3621f48: b4002c80     	cbz	x0, 0x36224d8 <_ChromeMain+0x361d23c>
 3621f4c: 52806801     	mov	w1, #0x340              ; =832
 3621f50: d2800002     	mov	x2, #0x0                ; =0
 3621f54: 972a2597     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3621f58: aa0003f7     	mov	x23, x0
 3621f5c: 97d848d2     	bl	0x2c342a4 <_ChromeMain+0x2c2f008>
 3621f60: 3945a408     	ldrb	w8, [x0, #0x169]
 3621f64: 35002d28     	cbnz	w8, 0x3622508 <_ChromeMain+0x361d26c>
 3621f68: f940cec2     	ldr	x2, [x22, #0x198]
 3621f6c: aa1603e0     	mov	x0, x22
 3621f70: aa1703e1     	mov	x1, x23
 3621f74: 97455d22     	bl	0x7793fc <_ChromeMain+0x774160>
 3621f78: b9431ae8     	ldr	w8, [x23, #0x318]
 3621f7c: 35003428     	cbnz	w8, 0x3622600 <_ChromeMain+0x361d364>
 3621f80: b94322e8     	ldr	w8, [x23, #0x320]
 3621f84: 7100051f     	cmp	w8, #0x1
 3621f88: 54000200     	b.eq	0x3621fc8 <_ChromeMain+0x361cd2c>
 3621f8c: f9418ae8     	ldr	x8, [x23, #0x310]
 3621f90: 52800036     	mov	w22, #0x1               ; =1
 3621f94: b90033f6     	str	w22, [sp, #0x30]
 3621f98: 90059f21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 3621f9c: 9115a021     	add	x1, x1, #0x568
 3621fa0: 91046100     	add	x0, x8, #0x118
 3621fa4: 9100c3e2     	add	x2, sp, #0x30
 3621fa8: 97910c7f     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 3621fac: b90322f6     	str	w22, [x23, #0x320]
 3621fb0: aa1703e0     	mov	x0, x23
 3621fb4: 52800021     	mov	w1, #0x1                ; =1
 3621fb8: 9746fe6b     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3621fbc: 9103e2e0     	add	x0, x23, #0xf8
 3621fc0: 910c82e1     	add	x1, x23, #0x320
 3621fc4: 97641803     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3621fc8: 394ce2e8     	ldrb	w8, [x23, #0x338]
 3621fcc: 37000208     	tbnz	w8, #0x0, 0x362200c <_ChromeMain+0x361cd70>
 3621fd0: f9418ae0     	ldr	x0, [x23, #0x310]
 3621fd4: 3943d008     	ldrb	w8, [x0, #0xf4]
 3621fd8: 370000a8     	tbnz	w8, #0x0, 0x3621fec <_ChromeMain+0x361cd50>
 3621fdc: 52800028     	mov	w8, #0x1                ; =1
 3621fe0: 3903d008     	strb	w8, [x0, #0xf4]
 3621fe4: 52800021     	mov	w1, #0x1                ; =1
 3621fe8: 97910cb2     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 3621fec: 52800028     	mov	w8, #0x1                ; =1
 3621ff0: 390ce2e8     	strb	w8, [x23, #0x338]
 3621ff4: aa1703e0     	mov	x0, x23
 3621ff8: 52800021     	mov	w1, #0x1                ; =1
 3621ffc: 9746fe5a     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3622000: 9103e2e0     	add	x0, x23, #0xf8
 3622004: 910ce2e1     	add	x1, x23, #0x338
 3622008: 976417f2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 362200c: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 3622010: f9404749     	ldr	x9, [x26, #0x88]
 3622014: eb09011f     	cmp	x8, x9
 3622018: 54000061     	b.ne	0x3622024 <_ChromeMain+0x361cd88>
 362201c: aa1703e0     	mov	x0, x23
 3622020: 9727c8b7     	bl	0x142fc <_ChromeMain+0xf060>
 3622024: f941ca60     	ldr	x0, [x19, #0x390]
 3622028: 925e7408     	and	x8, x0, #0xfffffffc00000000
 362202c: f9404749     	ldr	x9, [x26, #0x88]
 3622030: eb09011f     	cmp	x8, x9
 3622034: 54000041     	b.ne	0x362203c <_ChromeMain+0x361cda0>
 3622038: 97280281     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 362203c: f901ca77     	str	x23, [x19, #0x390]
 3622040: f8bfc300     	ldapr	x0, [x24]
 3622044: b40024e0     	cbz	x0, 0x36224e0 <_ChromeMain+0x361d244>
 3622048: 52807301     	mov	w1, #0x398              ; =920
 362204c: d2800002     	mov	x2, #0x0                ; =0
 3622050: 972a2558     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3622054: aa0003f6     	mov	x22, x0
 3622058: 52800241     	mov	w1, #0x12               ; =18
 362205c: 95c29738     	bl	0xa6c7d3c <_ChromeMain+0xa6c2aa0>
 3622060: 3945a408     	ldrb	w8, [x0, #0x169]
 3622064: 35002588     	cbnz	w8, 0x3622514 <_ChromeMain+0x361d278>
 3622068: f940cee2     	ldr	x2, [x23, #0x198]
 362206c: aa1703e0     	mov	x0, x23
 3622070: aa1603e1     	mov	x1, x22
 3622074: 97455ce2     	bl	0x7793fc <_ChromeMain+0x774160>
 3622078: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 362207c: f9404749     	ldr	x9, [x26, #0x88]
 3622080: eb09011f     	cmp	x8, x9
 3622084: 54000061     	b.ne	0x3622090 <_ChromeMain+0x361cdf4>
 3622088: aa1603e0     	mov	x0, x22
 362208c: 9727c89c     	bl	0x142fc <_ChromeMain+0xf060>
 3622090: f941ce60     	ldr	x0, [x19, #0x398]
 3622094: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3622098: f9404749     	ldr	x9, [x26, #0x88]
 362209c: eb09011f     	cmp	x8, x9
 36220a0: 54000041     	b.ne	0x36220a8 <_ChromeMain+0x361ce0c>
 36220a4: 97280266     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 36220a8: f901ce76     	str	x22, [x19, #0x398]
 36220ac: 52801ba8     	mov	w8, #0xdd               ; =221
 36220b0: b90382c8     	str	w8, [x22, #0x380]
 36220b4: 52800028     	mov	w8, #0x1                ; =1
 36220b8: 390e12c8     	strb	w8, [x22, #0x384]
 36220bc: d00548e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 36220c0: 3dc02500     	ldr	q0, [x8, #0x90]
 36220c4: 3d800fe0     	str	q0, [sp, #0x30]
 36220c8: f0059f01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 36220cc: 91122021     	add	x1, x1, #0x488
 36220d0: 910362c0     	add	x0, x22, #0xd8
 36220d4: 9100c3e2     	add	x2, sp, #0x30
 36220d8: 97932f62     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 36220dc: f941ce60     	ldr	x0, [x19, #0x398]
 36220e0: 95c297a5     	bl	0xa6c7f74 <_ChromeMain+0xa6c2cd8>
 36220e4: f8bfc300     	ldapr	x0, [x24]
 36220e8: b4002000     	cbz	x0, 0x36224e8 <_ChromeMain+0x361d24c>
 36220ec: 52808c01     	mov	w1, #0x460              ; =1120
 36220f0: d2800002     	mov	x2, #0x0                ; =0
 36220f4: 972a252f     	bl	0xab5b0 <_ChromeMain+0xa6314>
 36220f8: aa0003f6     	mov	x22, x0
 36220fc: 9004c721     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3622100: 91194021     	add	x1, x1, #0x650
 3622104: 52800142     	mov	w2, #0xa                ; =10
 3622108: 528000a3     	mov	w3, #0x5                ; =5
 362210c: 52820004     	mov	w4, #0x1000             ; =4096
 3622110: 52800005     	mov	w5, #0x0                ; =0
 3622114: 9795a1f3     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 3622118: 3945a408     	ldrb	w8, [x0, #0x169]
 362211c: 35002028     	cbnz	w8, 0x3622520 <_ChromeMain+0x361d284>
 3622120: f940cee2     	ldr	x2, [x23, #0x198]
 3622124: aa1703e0     	mov	x0, x23
 3622128: aa1603e1     	mov	x1, x22
 362212c: 97455cb4     	bl	0x7793fc <_ChromeMain+0x774160>
 3622130: aa1603e0     	mov	x0, x22
 3622134: 52800001     	mov	w1, #0x0                ; =0
 3622138: 97c4748e     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 362213c: f941aed9     	ldr	x25, [x22, #0x358]
 3622140: f9402737     	ldr	x23, [x25, #0x48]
 3622144: b94042f8     	ldr	w24, [x23, #0x40]
 3622148: 3100071f     	cmn	w24, #0x1
 362214c: 54001b80     	b.eq	0x36224bc <_ChromeMain+0x361d220>
 3622150: b9404ae3     	ldr	w3, [x23, #0x48]
 3622154: 3100047f     	cmn	w3, #0x1
 3622158: 54002180     	b.eq	0x3622588 <_ChromeMain+0x361d2ec>
 362215c: aa1703e0     	mov	x0, x23
 3622160: 52800001     	mov	w1, #0x0                ; =0
 3622164: aa1803e2     	mov	x2, x24
 3622168: 979a1546     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 362216c: aa0003f7     	mov	x23, x0
 3622170: b40000a0     	cbz	x0, 0x3622184 <_ChromeMain+0x361cee8>
 3622174: b94002e8     	ldr	w8, [x23]
 3622178: 31000508     	adds	w8, w8, #0x1
 362217c: b90002e8     	str	w8, [x23]
 3622180: 54001d62     	b.hs	0x362252c <_ChromeMain+0x361d290>
 3622184: b94042e2     	ldr	w2, [x23, #0x40]
 3622188: 3100045f     	cmn	w2, #0x1
 362218c: 54001900     	b.eq	0x36224ac <_ChromeMain+0x361d210>
 3622190: aa1703e0     	mov	x0, x23
 3622194: 52800001     	mov	w1, #0x0                ; =0
 3622198: 52804b03     	mov	w3, #0x258              ; =600
 362219c: 979a1539     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 36221a0: f9001be0     	str	x0, [sp, #0x30]
 36221a4: b40000a0     	cbz	x0, 0x36221b8 <_ChromeMain+0x361cf1c>
 36221a8: b9400008     	ldr	w8, [x0]
 36221ac: 31000508     	adds	w8, w8, #0x1
 36221b0: b9000008     	str	w8, [x0]
 36221b4: 54001c22     	b.hs	0x3622538 <_ChromeMain+0x361d29c>
 36221b8: f94002c8     	ldr	x8, [x22]
 36221bc: f941ed08     	ldr	x8, [x8, #0x3d8]
 36221c0: 9100c3e1     	add	x1, sp, #0x30
 36221c4: aa1603e0     	mov	x0, x22
 36221c8: d63f0100     	blr	x8
 36221cc: f9401be0     	ldr	x0, [sp, #0x30]
 36221d0: b40000c0     	cbz	x0, 0x36221e8 <_ChromeMain+0x361cf4c>
 36221d4: b9400009     	ldr	w9, [x0]
 36221d8: 51000528     	sub	w8, w9, #0x1
 36221dc: b9000008     	str	w8, [x0]
 36221e0: 34001b29     	cbz	w9, 0x3622544 <_ChromeMain+0x361d2a8>
 36221e4: 340014a8     	cbz	w8, 0x3622478 <_ChromeMain+0x361d1dc>
 36221e8: b40000d7     	cbz	x23, 0x3622200 <_ChromeMain+0x361cf64>
 36221ec: b94002e9     	ldr	w9, [x23]
 36221f0: 51000528     	sub	w8, w9, #0x1
 36221f4: b90002e8     	str	w8, [x23]
 36221f8: 34001ac9     	cbz	w9, 0x3622550 <_ChromeMain+0x361d2b4>
 36221fc: 34001248     	cbz	w8, 0x3622444 <_ChromeMain+0x361d1a8>
 3622200: aa1603e0     	mov	x0, x22
 3622204: 52800001     	mov	w1, #0x0                ; =0
 3622208: 97959ebe     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 362220c: 52801ba8     	mov	w8, #0xdd               ; =221
 3622210: b90063e8     	str	w8, [sp, #0x60]
 3622214: 390193ff     	strb	wzr, [sp, #0x64]
 3622218: aa1603f7     	mov	x23, x22
 362221c: f84d86e8     	ldr	x8, [x23], #0xd8
 3622220: f941f508     	ldr	x8, [x8, #0x3e8]
 3622224: 910183e1     	add	x1, sp, #0x60
 3622228: aa1603e0     	mov	x0, x22
 362222c: d63f0100     	blr	x8
 3622230: aa1603e0     	mov	x0, x22
 3622234: 52800001     	mov	w1, #0x0                ; =0
 3622238: 95c19673     	bl	0xa687c04 <_ChromeMain+0xa682968>
 362223c: 910003e0     	mov	x0, sp
 3622240: 52800001     	mov	w1, #0x0                ; =0
 3622244: 52800002     	mov	w2, #0x0                ; =0
 3622248: 52800043     	mov	w3, #0x2                ; =2
 362224c: 52800004     	mov	w4, #0x0                ; =0
 3622250: 528000a5     	mov	w5, #0x5                ; =5
 3622254: 941413db     	bl	0x3b271c0 <_ChromeMain+0x3b21f24>
 3622258: f94003e8     	ldr	x8, [sp]
 362225c: f90023ff     	str	xzr, [sp, #0x40]
 3622260: f9001be8     	str	x8, [sp, #0x30]
 3622264: b5000fa8     	cbnz	x8, 0x3622458 <_ChromeMain+0x361d1bc>
 3622268: 9100c3fb     	add	x27, sp, #0x30
 362226c: f94007e8     	ldr	x8, [sp, #0x8]
 3622270: f8008368     	stur	x8, [x27, #0x8]
 3622274: b94013e8     	ldr	w8, [sp, #0x10]
 3622278: b8010368     	stur	w8, [x27, #0x10]
 362227c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 3622280: f90027ff     	str	xzr, [sp, #0x48]
 3622284: f94013f8     	ldr	x24, [sp, #0x20]
 3622288: b5001978     	cbnz	x24, 0x36225b4 <_ChromeMain+0x361d318>
 362228c: 52800028     	mov	w8, #0x1                ; =1
 3622290: b9003fe8     	str	w8, [sp, #0x3c]
 3622294: f0059f01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 3622298: 91152021     	add	x1, x1, #0x548
 362229c: 9100c3e2     	add	x2, sp, #0x30
 36222a0: aa1703e0     	mov	x0, x23
 36222a4: 9797c83a     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 36222a8: 9100c3e0     	add	x0, sp, #0x30
 36222ac: 9784a29e     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 36222b0: 910003e0     	mov	x0, sp
 36222b4: 9784a29c     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 36222b8: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 36222bc: f9404749     	ldr	x9, [x26, #0x88]
 36222c0: eb09011f     	cmp	x8, x9
 36222c4: 54000061     	b.ne	0x36222d0 <_ChromeMain+0x361d034>
 36222c8: aa1603e0     	mov	x0, x22
 36222cc: 9727c80c     	bl	0x142fc <_ChromeMain+0xf060>
 36222d0: f941d260     	ldr	x0, [x19, #0x3a0]
 36222d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 36222d8: f9404749     	ldr	x9, [x26, #0x88]
 36222dc: eb09011f     	cmp	x8, x9
 36222e0: 54000041     	b.ne	0x36222e8 <_ChromeMain+0x361d04c>
 36222e4: 972801d6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 36222e8: f901d276     	str	x22, [x19, #0x3a0]
 36222ec: aa1303e0     	mov	x0, x19
 36222f0: 94308a92     	bl	0x4244d38 <_ChromeMain+0x423fa9c>
 36222f4: f941be68     	ldr	x8, [x19, #0x378]
 36222f8: f9402100     	ldr	x0, [x8, #0x40]
 36222fc: 97ae2b31     	bl	0x21acfc0 <_ChromeMain+0x21a7d24>
 3622300: aa0003f6     	mov	x22, x0
 3622304: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3622308: f9404749     	ldr	x9, [x26, #0x88]
 362230c: eb09011f     	cmp	x8, x9
 3622310: 54000061     	b.ne	0x362231c <_ChromeMain+0x361d080>
 3622314: aa1603e0     	mov	x0, x22
 3622318: 9727c7f9     	bl	0x142fc <_ChromeMain+0xf060>
 362231c: f941d660     	ldr	x0, [x19, #0x3a8]
 3622320: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3622324: f9404749     	ldr	x9, [x26, #0x88]
 3622328: eb09011f     	cmp	x8, x9
 362232c: 54000041     	b.ne	0x3622334 <_ChromeMain+0x361d098>
 3622330: 972801c3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3622334: f901d676     	str	x22, [x19, #0x3a8]
 3622338: b40002b6     	cbz	x22, 0x362238c <_ChromeMain+0x361d0f0>
 362233c: 910ee277     	add	x23, x19, #0x3b8
 3622340: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 3622344: f9404749     	ldr	x9, [x26, #0x88]
 3622348: eb09011f     	cmp	x8, x9
 362234c: 54000061     	b.ne	0x3622358 <_ChromeMain+0x361d0bc>
 3622350: aa1603e0     	mov	x0, x22
 3622354: 9727c7ea     	bl	0x142fc <_ChromeMain+0xf060>
 3622358: f94002e0     	ldr	x0, [x23]
 362235c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3622360: f9404749     	ldr	x9, [x26, #0x88]
 3622364: eb09011f     	cmp	x8, x9
 3622368: 54001060     	b.eq	0x3622574 <_ChromeMain+0x361d2d8>
 362236c: f90002f6     	str	x22, [x23]
 3622370: 395302c8     	ldrb	w8, [x22, #0x4c0]
 3622374: 36001048     	tbz	w8, #0x0, 0x362257c <_ChromeMain+0x361d2e0>
 3622378: f941da61     	ldr	x1, [x19, #0x3b0]
 362237c: 911222c0     	add	x0, x22, #0x488
 3622380: 9735e588     	bl	0x39b9a0 <_ChromeMain+0x396704>
 3622384: aa1303e0     	mov	x0, x19
 3622388: 94308b42     	bl	0x4245090 <_ChromeMain+0x423fdf4>
 362238c: aa1303e0     	mov	x0, x19
 3622390: 94308a6a     	bl	0x4244d38 <_ChromeMain+0x423fa9c>
 3622394: f941c660     	ldr	x0, [x19, #0x388]
 3622398: f9400008     	ldr	x8, [x0]
 362239c: f9405108     	ldr	x8, [x8, #0xa0]
 36223a0: 52800001     	mov	w1, #0x0                ; =0
 36223a4: d63f0100     	blr	x8
 36223a8: 394fe261     	ldrb	w1, [x19, #0x3f8]
 36223ac: f9400268     	ldr	x8, [x19]
 36223b0: f9405108     	ldr	x8, [x8, #0xa0]
 36223b4: aa1303e0     	mov	x0, x19
 36223b8: d63f0100     	blr	x8
 36223bc: 394fe276     	ldrb	w22, [x19, #0x3f8]
 36223c0: b9431a68     	ldr	w8, [x19, #0x318]
 36223c4: 6b16011f     	cmp	w8, w22
 36223c8: 54001321     	b.ne	0x362262c <_ChromeMain+0x361d390>
 36223cc: 720002df     	tst	w22, #0x1
 36223d0: 52800068     	mov	w8, #0x3                ; =3
 36223d4: 1a9f1116     	csel	w22, w8, wzr, ne
 36223d8: b9432268     	ldr	w8, [x19, #0x320]
 36223dc: 6b16011f     	cmp	w8, w22
 36223e0: 540001e0     	b.eq	0x362241c <_ChromeMain+0x361d180>
 36223e4: f9418a68     	ldr	x8, [x19, #0x310]
 36223e8: b90033f6     	str	w22, [sp, #0x30]
 36223ec: f0059f01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 36223f0: 9115a021     	add	x1, x1, #0x568
 36223f4: 91046100     	add	x0, x8, #0x118
 36223f8: 9100c3e2     	add	x2, sp, #0x30
 36223fc: 97910b6a     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 3622400: b9032276     	str	w22, [x19, #0x320]
 3622404: aa1303e0     	mov	x0, x19
 3622408: 52800021     	mov	w1, #0x1                ; =1
 362240c: 9746fd56     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3622410: 910c8261     	add	x1, x19, #0x320
 3622414: aa1503e0     	mov	x0, x21
 3622418: 976416ee     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 362241c: b5000394     	cbnz	x20, 0x362248c <_ChromeMain+0x361d1f0>
 3622420: aa1303e0     	mov	x0, x19
 3622424: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 3622428: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 362242c: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 3622430: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 3622434: a94867fa     	ldp	x26, x25, [sp, #0x80]
 3622438: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 362243c: 910343ff     	add	sp, sp, #0xd0
 3622440: d65f03c0     	ret
