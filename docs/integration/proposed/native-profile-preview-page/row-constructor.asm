
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467ea7c: d103c3ff     	sub	sp, sp, #0xf0
 467ea80: a9096ffc     	stp	x28, x27, [sp, #0x90]
 467ea84: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 467ea88: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 467ea8c: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 467ea90: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 467ea94: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 467ea98: 910383fd     	add	x29, sp, #0xe0
 467ea9c: aa0703f5     	mov	x21, x7
 467eaa0: aa0603f8     	mov	x24, x6
 467eaa4: aa0503f9     	mov	x25, x5
 467eaa8: aa0403f6     	mov	x22, x4
 467eaac: aa0303fa     	mov	x26, x3
 467eab0: aa0203fc     	mov	x28, x2
 467eab4: aa0103fb     	mov	x27, x1
 467eab8: aa0003f3     	mov	x19, x0
 467eabc: f0050574     	adrp	x20, 0xe72d000 <dyld_stub_binder+0xe72d000>
 467eac0: 9127c294     	add	x20, x20, #0x9f0
 467eac4: 91118288     	add	x8, x20, #0x460
 467eac8: a9002014     	stp	x20, x8, [x0]
 467eacc: 91122288     	add	x8, x20, #0x488
 467ead0: f9000808     	str	x8, [x0, #0x10]
 467ead4: 91130288     	add	x8, x20, #0x4c0
 467ead8: 9113c289     	add	x9, x20, #0x4f0
 467eadc: a906a408     	stp	x8, x9, [x0, #0x68]
 467eae0: 91150288     	add	x8, x20, #0x540
 467eae4: f9005808     	str	x8, [x0, #0xb0]
 467eae8: 91168288     	add	x8, x20, #0x5a0
 467eaec: aa0003e9     	mov	x9, x0
 467eaf0: f80d8d28     	str	x8, [x9, #0xd8]!
 467eaf4: f90007e9     	str	x9, [sp, #0x8]
 467eaf8: 91174288     	add	x8, x20, #0x5d0
 467eafc: aa0003f7     	mov	x23, x0
 467eb00: f80f8ee8     	str	x8, [x23, #0xf8]!
 467eb04: 9117e288     	add	x8, x20, #0x5f8
 467eb08: f9018808     	str	x8, [x0, #0x310]
 467eb0c: 9119e288     	add	x8, x20, #0x678
 467eb10: f9018c08     	str	x8, [x0, #0x318]
 467eb14: 911ce288     	add	x8, x20, #0x738
 467eb18: f9019008     	str	x8, [x0, #0x320]
 467eb1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467eb20: 900529a9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467eb24: f9404529     	ldr	x9, [x9, #0x88]
 467eb28: eb09011f     	cmp	x8, x9
 467eb2c: 54000061     	b.ne	0x467eb38 <_ChromeMain+0x467989c>
 467eb30: aa1303e0     	mov	x0, x19
 467eb34: 96e655f2     	bl	0x142fc <_ChromeMain+0xf060>
 467eb38: 52800700     	mov	w0, #0x38               ; =56
 467eb3c: 96e6420b     	bl	0xf368 <_ChromeMain+0xa0cc>
 467eb40: 52800028     	mov	w8, #0x1                ; =1
 467eb44: b9000008     	str	w8, [x0]
 467eb48: b0ffc9a8     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 467eb4c: 91300108     	add	x8, x8, #0xc00
 467eb50: f0ff90c9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 467eb54: 912d0129     	add	x9, x9, #0xb40
 467eb58: a900a408     	stp	x8, x9, [x0, #0x8]
 467eb5c: f0fef6e9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 467eb60: 912c0129     	add	x9, x9, #0xb00
 467eb64: 10007a48     	adr	x8, 0x467faac <_ChromeMain+0x467a810>
 467eb68: d503201f     	nop
 467eb6c: a901a009     	stp	x9, x8, [x0, #0x18]
 467eb70: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 467eb74: f9003be0     	str	x0, [sp, #0x70]
 467eb78: 52800048     	mov	w8, #0x2                ; =2
 467eb7c: 3901e3e8     	strb	w8, [sp, #0x78]
 467eb80: 9101c3e1     	add	x1, sp, #0x70
 467eb84: aa1303e0     	mov	x0, x19
 467eb88: 9733be3e     	bl	0x136e480 <_ChromeMain+0x13691e4>
 467eb8c: 3941e3e8     	ldrb	w8, [sp, #0x78]
 467eb90: 7103fd1f     	cmp	w8, #0xff
 467eb94: 54000060     	b.eq	0x467eba0 <_ChromeMain+0x4679904>
 467eb98: f9403be0     	ldr	x0, [sp, #0x70]
 467eb9c: b5006920     	cbnz	x0, 0x467f8c0 <_ChromeMain+0x467a624>
 467eba0: 52801fe8     	mov	w8, #0xff               ; =255
 467eba4: 3901e3e8     	strb	w8, [sp, #0x78]
 467eba8: 91118288     	add	x8, x20, #0x460
 467ebac: a9002274     	stp	x20, x8, [x19]
 467ebb0: 91122288     	add	x8, x20, #0x488
 467ebb4: f9000a68     	str	x8, [x19, #0x10]
 467ebb8: 91130288     	add	x8, x20, #0x4c0
 467ebbc: 9113c289     	add	x9, x20, #0x4f0
 467ebc0: a906a668     	stp	x8, x9, [x19, #0x68]
 467ebc4: 91150288     	add	x8, x20, #0x540
 467ebc8: f9005a68     	str	x8, [x19, #0xb0]
 467ebcc: 91168288     	add	x8, x20, #0x5a0
 467ebd0: f9006e68     	str	x8, [x19, #0xd8]
 467ebd4: 91174288     	add	x8, x20, #0x5d0
 467ebd8: f9007e68     	str	x8, [x19, #0xf8]
 467ebdc: 9117e288     	add	x8, x20, #0x5f8
 467ebe0: f9018a68     	str	x8, [x19, #0x310]
 467ebe4: 9119e288     	add	x8, x20, #0x678
 467ebe8: f9018e68     	str	x8, [x19, #0x318]
 467ebec: 911ce288     	add	x8, x20, #0x738
 467ebf0: f9019268     	str	x8, [x19, #0x320]
 467ebf4: f9400b88     	ldr	x8, [x28, #0x10]
 467ebf8: 3dc00380     	ldr	q0, [x28]
 467ebfc: 3d812e60     	str	q0, [x19, #0x4b0]
 467ec00: f9026268     	str	x8, [x19, #0x4c0]
 467ec04: a900ff9f     	stp	xzr, xzr, [x28, #0x8]
 467ec08: f900039f     	str	xzr, [x28]
 467ec0c: 925e7768     	and	x8, x27, #0xfffffffc00000000
 467ec10: 900529a9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467ec14: f9404529     	ldr	x9, [x9, #0x88]
 467ec18: eb09011f     	cmp	x8, x9
 467ec1c: 54000061     	b.ne	0x467ec28 <_ChromeMain+0x467998c>
 467ec20: aa1b03e0     	mov	x0, x27
 467ec24: 96e655b6     	bl	0x142fc <_ChromeMain+0xf060>
 467ec28: f902667b     	str	x27, [x19, #0x4c8]
 467ec2c: f9026a7f     	str	xzr, [x19, #0x4d0]
 467ec30: b904da7a     	str	w26, [x19, #0x4d8]
 467ec34: b904de7f     	str	wzr, [x19, #0x4dc]
 467ec38: 3913827f     	strb	wzr, [x19, #0x4e0]
 467ec3c: 528001a8     	mov	w8, #0xd                ; =13
 467ec40: b904e668     	str	w8, [x19, #0x4e4]
 467ec44: f9400328     	ldr	x8, [x25]
 467ec48: f9027668     	str	x8, [x19, #0x4e8]
 467ec4c: f9027a78     	str	x24, [x19, #0x4f0]
 467ec50: 9113e279     	add	x25, x19, #0x4f8
 467ec54: 3dc002a0     	ldr	q0, [x21]
 467ec58: f9400aa8     	ldr	x8, [x21, #0x10]
 467ec5c: f9028668     	str	x8, [x19, #0x508]
 467ec60: 3d800320     	str	q0, [x25]
 467ec64: a900febf     	stp	xzr, xzr, [x21, #0x8]
 467ec68: f90002bf     	str	xzr, [x21]
 467ec6c: 790a227f     	strh	wzr, [x19, #0x510]
 467ec70: 91146268     	add	x8, x19, #0x518
 467ec74: 3915a27f     	strb	wzr, [x19, #0x568]
 467ec78: f902ba7f     	str	xzr, [x19, #0x570]
 467ec7c: 6f00e400     	movi.2d	v0, #0000000000000000
 467ec80: ad000100     	stp	q0, q0, [x8]
 467ec84: ad010100     	stp	q0, q0, [x8, #0x20]
 467ec88: 3c839100     	stur	q0, [x8, #0x39]
 467ec8c: 39518268     	ldrb	w8, [x19, #0x460]
 467ec90: 340000a8     	cbz	w8, 0x467eca4 <_ChromeMain+0x4679a08>
 467ec94: 3911827f     	strb	wzr, [x19, #0x460]
 467ec98: 91118261     	add	x1, x19, #0x460
 467ec9c: aa1703e0     	mov	x0, x23
 467eca0: 9722a4cc     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467eca4: 9112c275     	add	x21, x19, #0x4b0
 467eca8: f9424268     	ldr	x8, [x19, #0x480]
 467ecac: 52800034     	mov	w20, #0x1               ; =1
 467ecb0: b9001914     	str	w20, [x8, #0x18]
 467ecb4: b9446668     	ldr	w8, [x19, #0x464]
 467ecb8: 7120011f     	cmp	w8, #0x800
 467ecbc: 540000e0     	b.eq	0x467ecd8 <_ChromeMain+0x4679a3c>
 467ecc0: 91119268     	add	x8, x19, #0x464
 467ecc4: 52810009     	mov	w9, #0x800              ; =2048
 467ecc8: b9000109     	str	w9, [x8]
 467eccc: 91119261     	add	x1, x19, #0x464
 467ecd0: aa1703e0     	mov	x0, x23
 467ecd4: 9722a4bf     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467ecd8: 39072e74     	strb	w20, [x19, #0x1cb]
 467ecdc: 9112c261     	add	x1, x19, #0x4b0
 467ece0: aa1303e0     	mov	x0, x19
 467ece4: 97071f18     	bl	0x846944 <_ChromeMain+0x8416a8>
 467ece8: f9416677     	ldr	x23, [x19, #0x2c8]
 467ecec: 900529b4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467ecf0: b4006337     	cbz	x23, 0x467f954 <_ChromeMain+0x467a6b8>
 467ecf4: 39d31e68     	ldrsb	w8, [x19, #0x4c7]
 467ecf8: 37f85be8     	tbnz	w8, #0x1f, 0x467f874 <_ChromeMain+0x467a5d8>
 467ecfc: 3dc002a0     	ldr	q0, [x21]
 467ed00: 3d8017e0     	str	q0, [sp, #0x50]
 467ed04: f9400aa8     	ldr	x8, [x21, #0x10]
 467ed08: f90033e8     	str	x8, [sp, #0x60]
 467ed0c: 910143e1     	add	x1, sp, #0x50
 467ed10: aa1703e0     	mov	x0, x23
 467ed14: 972bbaf1     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 467ed18: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 467ed1c: 36f800a8     	tbz	w8, #0x1f, 0x467ed30 <_ChromeMain+0x4679a94>
 467ed20: f9402be0     	ldr	x0, [sp, #0x50]
 467ed24: f94033e8     	ldr	x8, [sp, #0x60]
 467ed28: d37ff901     	lsl	x1, x8, #1
 467ed2c: 96e62863     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467ed30: f9428e68     	ldr	x8, [x19, #0x518]
 467ed34: f100011f     	cmp	x8, #0x0
 467ed38: 1a9f07e1     	cset	w1, ne
 467ed3c: aa1303e0     	mov	x0, x19
 467ed40: 973ae2a7     	bl	0x15377dc <_ChromeMain+0x1532540>
 467ed44: 52802800     	mov	w0, #0x140              ; =320
 467ed48: 96e64188     	bl	0xf368 <_ChromeMain+0xa0cc>
 467ed4c: aa0003f7     	mov	x23, x0
 467ed50: 978e4620     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 467ed54: aa1303e0     	mov	x0, x19
 467ed58: aa1703e1     	mov	x1, x23
 467ed5c: 97542ab7     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 467ed60: b940f2e8     	ldr	w8, [x23, #0xf0]
 467ed64: 350059a8     	cbnz	w8, 0x467f898 <_ChromeMain+0x467a5fc>
 467ed68: 52800028     	mov	w8, #0x1                ; =1
 467ed6c: b90013e8     	str	w8, [sp, #0x10]
 467ed70: f0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467ed74: 9115a021     	add	x1, x1, #0x568
 467ed78: 910462e0     	add	x0, x23, #0x118
 467ed7c: 910043e2     	add	x2, sp, #0x10
 467ed80: 974f9909     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 467ed84: b940fae8     	ldr	w8, [x23, #0xf8]
 467ed88: 35005d88     	cbnz	w8, 0x467f938 <_ChromeMain+0x467a69c>
 467ed8c: b940fee8     	ldr	w8, [x23, #0xfc]
 467ed90: 6b16011f     	cmp	w8, w22
 467ed94: 54005d21     	b.ne	0x467f938 <_ChromeMain+0x467a69c>
 467ed98: b94102e8     	ldr	w8, [x23, #0x100]
 467ed9c: 35005ce8     	cbnz	w8, 0x467f938 <_ChromeMain+0x467a69c>
 467eda0: b94106e8     	ldr	w8, [x23, #0x104]
 467eda4: 7100211f     	cmp	w8, #0x8
 467eda8: 54005c81     	b.ne	0x467f938 <_ChromeMain+0x467a69c>
 467edac: 3943d2e8     	ldrb	w8, [x23, #0xf4]
 467edb0: 370000c8     	tbnz	w8, #0x0, 0x467edc8 <_ChromeMain+0x4679b2c>
 467edb4: 52800028     	mov	w8, #0x1                ; =1
 467edb8: 3903d2e8     	strb	w8, [x23, #0xf4]
 467edbc: aa1703e0     	mov	x0, x23
 467edc0: 52800021     	mov	w1, #0x1                ; =1
 467edc4: 974f993b     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467edc8: f9426668     	ldr	x8, [x19, #0x4c8]
 467edcc: 90054478     	adrp	x24, 0xef0a000 <dyld_stub_binder+0xef0a000>
 467edd0: 91120318     	add	x24, x24, #0x480
 467edd4: 900501ba     	adrp	x26, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 467edd8: 912f435a     	add	x26, x26, #0xbd0
 467eddc: b4000d88     	cbz	x8, 0x467ef8c <_ChromeMain+0x4679cf0>
 467ede0: f8bfc300     	ldapr	x0, [x24]
 467ede4: b4006080     	cbz	x0, 0x467f9f4 <_ChromeMain+0x467a758>
 467ede8: 52807001     	mov	w1, #0x380              ; =896
 467edec: d2800002     	mov	x2, #0x0                ; =0
 467edf0: 96e8b1f0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467edf4: aa0003f6     	mov	x22, x0
 467edf8: 9776b910     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 467edfc: 910fc348     	add	x8, x26, #0x3f0
 467ee00: a900201a     	stp	x26, x8, [x0]
 467ee04: 91106348     	add	x8, x26, #0x418
 467ee08: f9000808     	str	x8, [x0, #0x10]
 467ee0c: 91114348     	add	x8, x26, #0x450
 467ee10: 91120349     	add	x9, x26, #0x480
 467ee14: a906a408     	stp	x8, x9, [x0, #0x68]
 467ee18: 91134348     	add	x8, x26, #0x4d0
 467ee1c: f9005808     	str	x8, [x0, #0xb0]
 467ee20: 91158348     	add	x8, x26, #0x560
 467ee24: aa0003f7     	mov	x23, x0
 467ee28: f80f8ee8     	str	x8, [x23, #0xf8]!
 467ee2c: 9114c348     	add	x8, x26, #0x530
 467ee30: f9006c08     	str	x8, [x0, #0xd8]
 467ee34: f901a41f     	str	xzr, [x0, #0x348]
 467ee38: 2f06e400     	movi	d0, #0xffff000000000000
 467ee3c: fd01a800     	str	d0, [x0, #0x350]
 467ee40: 52800028     	mov	w8, #0x1                ; =1
 467ee44: 390d6008     	strb	w8, [x0, #0x358]
 467ee48: f901b01f     	str	xzr, [x0, #0x360]
 467ee4c: 390da01f     	strb	wzr, [x0, #0x368]
 467ee50: f901b81f     	str	xzr, [x0, #0x370]
 467ee54: b903781f     	str	wzr, [x0, #0x378]
 467ee58: 390df01f     	strb	wzr, [x0, #0x37c]
 467ee5c: 3945a408     	ldrb	w8, [x0, #0x169]
 467ee60: 35005ae8     	cbnz	w8, 0x467f9bc <_ChromeMain+0x467a720>
 467ee64: f940ce62     	ldr	x2, [x19, #0x198]
 467ee68: aa1303e0     	mov	x0, x19
 467ee6c: aa1603e1     	mov	x1, x22
 467ee70: 9703e963     	bl	0x7793fc <_ChromeMain+0x774160>
 467ee74: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 467ee78: f9404689     	ldr	x9, [x20, #0x88]
 467ee7c: eb09011f     	cmp	x8, x9
 467ee80: 54000061     	b.ne	0x467ee8c <_ChromeMain+0x4679bf0>
 467ee84: aa1603e0     	mov	x0, x22
 467ee88: 96e6551d     	bl	0x142fc <_ChromeMain+0xf060>
 467ee8c: f9429a60     	ldr	x0, [x19, #0x530]
 467ee90: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467ee94: f9404689     	ldr	x9, [x20, #0x88]
 467ee98: eb09011f     	cmp	x8, x9
 467ee9c: 54000041     	b.ne	0x467eea4 <_ChromeMain+0x4679c08>
 467eea0: 96e68ee7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467eea4: f9029a76     	str	x22, [x19, #0x530]
 467eea8: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 467eeac: 340000c8     	cbz	w8, 0x467eec4 <_ChromeMain+0x4679c28>
 467eeb0: 3906a6df     	strb	wzr, [x22, #0x1a9]
 467eeb4: 9106a6c1     	add	x1, x22, #0x1a9
 467eeb8: aa1703e0     	mov	x0, x23
 467eebc: 9722a445     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467eec0: f9429a76     	ldr	x22, [x19, #0x530]
 467eec4: b944da68     	ldr	w8, [x19, #0x4d8]
 467eec8: 0aa87d08     	bic	w8, w8, w8, asr #31
 467eecc: 910c42c9     	add	x9, x22, #0x310
 467eed0: 394c62ca     	ldrb	w10, [x22, #0x318]
 467eed4: 350059ca     	cbnz	w10, 0x467fa0c <_ChromeMain+0x467a770>
 467eed8: b4005769     	cbz	x9, 0x467f9c4 <_ChromeMain+0x467a728>
 467eedc: aa088108     	orr	x8, x8, x8, lsl #32
 467eee0: f9018ac8     	str	x8, [x22, #0x310]
 467eee4: 52800028     	mov	w8, #0x1                ; =1
 467eee8: 390c62c8     	strb	w8, [x22, #0x318]
 467eeec: f940c6c0     	ldr	x0, [x22, #0x188]
 467eef0: b40000a0     	cbz	x0, 0x467ef04 <_ChromeMain+0x4679c68>
 467eef4: f9400008     	ldr	x8, [x0]
 467eef8: f9417d08     	ldr	x8, [x8, #0x2f8]
 467eefc: aa1603e1     	mov	x1, x22
 467ef00: d63f0100     	blr	x8
 467ef04: aa1603e0     	mov	x0, x22
 467ef08: 52800001     	mov	w1, #0x0                ; =0
 467ef0c: 96fec55a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467ef10: f9000bf6     	str	x22, [sp, #0x10]
 467ef14: 9104c2c0     	add	x0, x22, #0x130
 467ef18: 910043e3     	add	x3, sp, #0x10
 467ef1c: 52800301     	mov	w1, #0x18               ; =24
 467ef20: 52800022     	mov	w2, #0x1                ; =1
 467ef24: 9708a0ab     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 467ef28: aa1603e0     	mov	x0, x22
 467ef2c: 972f5eef     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 467ef30: f9429a60     	ldr	x0, [x19, #0x530]
 467ef34: b944da68     	ldr	w8, [x19, #0x4d8]
 467ef38: 0aa87d08     	bic	w8, w8, w8, asr #31
 467ef3c: aa088101     	orr	x1, x8, x8, lsl #32
 467ef40: 52800022     	mov	w2, #0x1                ; =1
 467ef44: 97854ac7     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 467ef48: f9429a68     	ldr	x8, [x19, #0x530]
 467ef4c: b944de69     	ldr	w9, [x19, #0x4dc]
 467ef50: 3100212a     	adds	w10, w9, #0x8
 467ef54: 12b0000b     	mov	w11, #0x7fffffff        ; =2147483647
 467ef58: 1a8a616a     	csel	w10, w11, w10, vs
 467ef5c: 6b09014a     	subs	w10, w10, w9
 467ef60: 131f7d4b     	asr	w11, w10, #31
 467ef64: 5201016b     	eor	w11, w11, #0x80000000
 467ef68: 1a8a616a     	csel	w10, w11, w10, vs
 467ef6c: d3607d4a     	lsl	x10, x10, #32
 467ef70: d3607d29     	lsl	x9, x9, #32
 467ef74: a9012be9     	stp	x9, x10, [sp, #0x10]
 467ef78: f0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467ef7c: 91122021     	add	x1, x1, #0x488
 467ef80: 91036100     	add	x0, x8, #0xd8
 467ef84: 910043e2     	add	x2, sp, #0x10
 467ef88: 9751bbb6     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 467ef8c: f8bfc300     	ldapr	x0, [x24]
 467ef90: b40051c0     	cbz	x0, 0x467f9c8 <_ChromeMain+0x467a72c>
 467ef94: 52808c01     	mov	w1, #0x460              ; =1120
 467ef98: d2800002     	mov	x2, #0x0                ; =0
 467ef9c: 96e8b185     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467efa0: aa0003f6     	mov	x22, x0
 467efa4: 39931e62     	ldrsb	x2, [x19, #0x4c7]
 467efa8: b6f80062     	tbz	x2, #0x3f, 0x467efb4 <_ChromeMain+0x4679d18>
 467efac: f9425a75     	ldr	x21, [x19, #0x4b0]
 467efb0: f9425e62     	ldr	x2, [x19, #0x4b8]
 467efb4: aa1603e0     	mov	x0, x22
 467efb8: aa1503e1     	mov	x1, x21
 467efbc: 528000a3     	mov	w3, #0x5                ; =5
 467efc0: 52820004     	mov	w4, #0x1000             ; =4096
 467efc4: 52800005     	mov	w5, #0x0                ; =0
 467efc8: 97542e46     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 467efcc: 3945a6c8     	ldrb	w8, [x22, #0x169]
 467efd0: 35005008     	cbnz	w8, 0x467f9d0 <_ChromeMain+0x467a734>
 467efd4: f940ce62     	ldr	x2, [x19, #0x198]
 467efd8: aa1303e0     	mov	x0, x19
 467efdc: aa1603e1     	mov	x1, x22
 467efe0: 9703e907     	bl	0x7793fc <_ChromeMain+0x774160>
 467efe4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 467efe8: f9404689     	ldr	x9, [x20, #0x88]
 467efec: eb09011f     	cmp	x8, x9
 467eff0: 54000061     	b.ne	0x467effc <_ChromeMain+0x4679d60>
 467eff4: aa1603e0     	mov	x0, x22
 467eff8: 96e654c1     	bl	0x142fc <_ChromeMain+0xf060>
 467effc: f9429e60     	ldr	x0, [x19, #0x538]
 467f000: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467f004: f9404689     	ldr	x9, [x20, #0x88]
 467f008: eb09011f     	cmp	x8, x9
 467f00c: 54000041     	b.ne	0x467f014 <_ChromeMain+0x4679d78>
 467f010: 96e68e8b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467f014: f9029e76     	str	x22, [x19, #0x538]
 467f018: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 467f01c: 340000c8     	cbz	w8, 0x467f034 <_ChromeMain+0x4679d98>
 467f020: 3906a6df     	strb	wzr, [x22, #0x1a9]
 467f024: 9103e2c0     	add	x0, x22, #0xf8
 467f028: 9106a6c1     	add	x1, x22, #0x1a9
 467f02c: 9722a3e9     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467f030: f9429e76     	ldr	x22, [x19, #0x538]
 467f034: aa1603e0     	mov	x0, x22
 467f038: 52800061     	mov	w1, #0x3                ; =3
 467f03c: 97542b31     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 467f040: f9429e60     	ldr	x0, [x19, #0x538]
 467f044: 528000c1     	mov	w1, #0x6                ; =6
 467f048: 96fc873e     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 467f04c: f9429e75     	ldr	x21, [x19, #0x538]
 467f050: 394edaa8     	ldrb	w8, [x21, #0x3b6]
 467f054: 350044e8     	cbnz	w8, 0x467f8f0 <_ChromeMain+0x467a654>
 467f058: aa1503e0     	mov	x0, x21
 467f05c: 52800001     	mov	w1, #0x0                ; =0
 467f060: 978300c4     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 467f064: f9429e60     	ldr	x0, [x19, #0x538]
 467f068: b9004bff     	str	wzr, [sp, #0x48]
 467f06c: 52800028     	mov	w8, #0x1                ; =1
 467f070: 390133e8     	strb	w8, [sp, #0x4c]
 467f074: 910123e1     	add	x1, sp, #0x48
 467f078: 9707259e     	bl	0x8486f0 <_ChromeMain+0x843454>
 467f07c: f9429e75     	ldr	x21, [x19, #0x538]
 467f080: f941aeb7     	ldr	x23, [x21, #0x358]
 467f084: b944e674     	ldr	w20, [x19, #0x4e4]
 467f088: f94026f6     	ldr	x22, [x23, #0x48]
 467f08c: b94046c8     	ldr	w8, [x22, #0x44]
 467f090: 3100051f     	cmn	w8, #0x1
 467f094: 54004c20     	b.eq	0x467fa18 <_ChromeMain+0x467a77c>
 467f098: d0fef6f7     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 467f09c: 912c02f7     	add	x23, x23, #0xb00
 467f0a0: 4b080281     	sub	w1, w20, w8
 467f0a4: aa1603e0     	mov	x0, x22
 467f0a8: 52800002     	mov	w2, #0x0                ; =0
 467f0ac: 52803e83     	mov	w3, #0x1f4              ; =500
 467f0b0: 9758a174     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 467f0b4: f9000be0     	str	x0, [sp, #0x10]
 467f0b8: b40000a0     	cbz	x0, 0x467f0cc <_ChromeMain+0x4679e30>
 467f0bc: b9400008     	ldr	w8, [x0]
 467f0c0: 31000508     	adds	w8, w8, #0x1
 467f0c4: b9000008     	str	w8, [x0]
 467f0c8: 540048a2     	b.hs	0x467f9dc <_ChromeMain+0x467a740>
 467f0cc: f94002a8     	ldr	x8, [x21]
 467f0d0: f941ed08     	ldr	x8, [x8, #0x3d8]
 467f0d4: 910043e1     	add	x1, sp, #0x10
 467f0d8: aa1503e0     	mov	x0, x21
 467f0dc: d63f0100     	blr	x8
 467f0e0: f9400be0     	ldr	x0, [sp, #0x10]
 467f0e4: b40000c0     	cbz	x0, 0x467f0fc <_ChromeMain+0x4679e60>
 467f0e8: b9400009     	ldr	w9, [x0]
 467f0ec: 51000528     	sub	w8, w9, #0x1
 467f0f0: b9000008     	str	w8, [x0]
 467f0f4: 340047a9     	cbz	w9, 0x467f9e8 <_ChromeMain+0x467a74c>
 467f0f8: 34003c88     	cbz	w8, 0x467f888 <_ChromeMain+0x467a5ec>
 467f0fc: f9429e74     	ldr	x20, [x19, #0x538]
 467f100: 52800800     	mov	w0, #0x40               ; =64
 467f104: 96e64099     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f108: 52800028     	mov	w8, #0x1                ; =1
 467f10c: b9000008     	str	w8, [x0]
 467f110: 90fe4d48     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 467f114: 91260108     	add	x8, x8, #0x980
 467f118: f0fde389     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 467f11c: 91220129     	add	x9, x9, #0x880
 467f120: a900a408     	stp	x8, x9, [x0, #0x8]
 467f124: f0ffa528     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 467f128: 91310108     	add	x8, x8, #0xc40
 467f12c: a901a017     	stp	x23, x8, [x0, #0x18]
 467f130: 9004c608     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 467f134: 3dc3d900     	ldr	q0, [x8, #0xf60]
 467f138: 3c828000     	stur	q0, [x0, #0x28]
 467f13c: 3900e01f     	strb	wzr, [x0, #0x38]
 467f140: f9000be0     	str	x0, [sp, #0x10]
 467f144: 0f000420     	movi.2s	v0, #0x1
 467f148: fd000fe0     	str	d0, [sp, #0x18]
 467f14c: 52800068     	mov	w8, #0x3                ; =3
 467f150: b90023e8     	str	w8, [sp, #0x20]
 467f154: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 467f158: f90017ff     	str	xzr, [sp, #0x28]
 467f15c: d0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467f160: 91152021     	add	x1, x1, #0x548
 467f164: 91036280     	add	x0, x20, #0xd8
 467f168: 910043e2     	add	x2, sp, #0x10
 467f16c: 97565488     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 467f170: 910043e0     	add	x0, sp, #0x10
 467f174: 97432eec     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 467f178: f9429268     	ldr	x8, [x19, #0x520]
 467f17c: f0052994     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467f180: b40029c8     	cbz	x8, 0x467f6b8 <_ChromeMain+0x467a41c>
 467f184: f9426a68     	ldr	x8, [x19, #0x4d0]
 467f188: 10004d7c     	adr	x28, 0x467fb34 <_ChromeMain+0x467a898>
 467f18c: d503201f     	nop
 467f190: f004c5fb     	adrp	x27, 0xdf3e000 <dyld_stub_binder+0xdf3e000>
 467f194: b4001f88     	cbz	x8, 0x467f584 <_ChromeMain+0x467a2e8>
 467f198: 925e7668     	and	x8, x19, #0xfffffffc00000000
 467f19c: f9404689     	ldr	x9, [x20, #0x88]
 467f1a0: eb09011f     	cmp	x8, x9
 467f1a4: 54000061     	b.ne	0x467f1b0 <_ChromeMain+0x4679f14>
 467f1a8: aa1303e0     	mov	x0, x19
 467f1ac: 96e65454     	bl	0x142fc <_ChromeMain+0xf060>
 467f1b0: 52800700     	mov	w0, #0x38               ; =56
 467f1b4: 96e6406d     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f1b8: aa0003f6     	mov	x22, x0
 467f1bc: 52800028     	mov	w8, #0x1                ; =1
 467f1c0: b9000008     	str	w8, [x0]
 467f1c4: 90ffc9a8     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 467f1c8: 91300109     	add	x9, x8, #0xc00
 467f1cc: d0ff90c8     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 467f1d0: 912d0108     	add	x8, x8, #0xb40
 467f1d4: a900a009     	stp	x9, x8, [x0, #0x8]
 467f1d8: a901f017     	stp	x23, x28, [x0, #0x18]
 467f1dc: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 467f1e0: f8bfc300     	ldapr	x0, [x24]
 467f1e4: b4004240     	cbz	x0, 0x467fa2c <_ChromeMain+0x467a790>
 467f1e8: 52809601     	mov	w1, #0x4b0              ; =1200
 467f1ec: d2800002     	mov	x2, #0x0                ; =0
 467f1f0: 96e8b0f0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467f1f4: aa0003f5     	mov	x21, x0
 467f1f8: f9000bf6     	str	x22, [sp, #0x10]
 467f1fc: 52800048     	mov	w8, #0x2                ; =2
 467f200: 390063e8     	strb	w8, [sp, #0x18]
 467f204: 910043e1     	add	x1, sp, #0x10
 467f208: 9733bc9e     	bl	0x136e480 <_ChromeMain+0x13691e4>
 467f20c: 394063e8     	ldrb	w8, [sp, #0x18]
 467f210: 7103fd1f     	cmp	w8, #0xff
 467f214: 54000060     	b.eq	0x467f220 <_ChromeMain+0x4679f84>
 467f218: f9400be0     	ldr	x0, [sp, #0x10]
 467f21c: b5003800     	cbnz	x0, 0x467f91c <_ChromeMain+0x467a680>
 467f220: 52801fe8     	mov	w8, #0xff               ; =255
 467f224: 390063e8     	strb	w8, [sp, #0x18]
 467f228: f0050548     	adrp	x8, 0xe72a000 <dyld_stub_binder+0xe72a000>
 467f22c: 91354108     	add	x8, x8, #0xd50
 467f230: 91118109     	add	x9, x8, #0x460
 467f234: a90026a8     	stp	x8, x9, [x21]
 467f238: 91122109     	add	x9, x8, #0x488
 467f23c: f9000aa9     	str	x9, [x21, #0x10]
 467f240: 91130109     	add	x9, x8, #0x4c0
 467f244: 9113c10a     	add	x10, x8, #0x4f0
 467f248: a906aaa9     	stp	x9, x10, [x21, #0x68]
 467f24c: 91150109     	add	x9, x8, #0x540
 467f250: 9116810a     	add	x10, x8, #0x5a0
 467f254: aa1503f6     	mov	x22, x21
 467f258: f80d8eca     	str	x10, [x22, #0xd8]!
 467f25c: f9005aa9     	str	x9, [x21, #0xb0]
 467f260: 91174109     	add	x9, x8, #0x5d0
 467f264: aa1503f7     	mov	x23, x21
 467f268: f80f8ee9     	str	x9, [x23, #0xf8]!
 467f26c: 9117e109     	add	x9, x8, #0x5f8
 467f270: f9018aa9     	str	x9, [x21, #0x310]
 467f274: 9119e109     	add	x9, x8, #0x678
 467f278: f9018ea9     	str	x9, [x21, #0x318]
 467f27c: 911ce108     	add	x8, x8, #0x738
 467f280: f90192a8     	str	x8, [x21, #0x320]
 467f284: 395182a8     	ldrb	w8, [x21, #0x460]
 467f288: 340000a8     	cbz	w8, 0x467f29c <_ChromeMain+0x467a000>
 467f28c: 391182bf     	strb	wzr, [x21, #0x460]
 467f290: 911182a1     	add	x1, x21, #0x460
 467f294: aa1703e0     	mov	x0, x23
 467f298: 9722a34e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467f29c: f94242a8     	ldr	x8, [x21, #0x480]
 467f2a0: 52800029     	mov	w9, #0x1                ; =1
 467f2a4: b9001909     	str	w9, [x8, #0x18]
 467f2a8: b94466a8     	ldr	w8, [x21, #0x464]
 467f2ac: 7120011f     	cmp	w8, #0x800
 467f2b0: 540000e0     	b.eq	0x467f2cc <_ChromeMain+0x467a030>
 467f2b4: 911192a8     	add	x8, x21, #0x464
 467f2b8: 52810009     	mov	w9, #0x800              ; =2048
 467f2bc: b9000109     	str	w9, [x8]
 467f2c0: 911192a1     	add	x1, x21, #0x464
 467f2c4: aa1703e0     	mov	x0, x23
 467f2c8: 9722a342     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467f2cc: aa1503e0     	mov	x0, x21
 467f2d0: 52800041     	mov	w1, #0x2                ; =2
 467f2d4: 973ae142     	bl	0x15377dc <_ChromeMain+0x1532540>
 467f2d8: 9113e261     	add	x1, x19, #0x4f8
 467f2dc: aa1503e0     	mov	x0, x21
 467f2e0: 97071d99     	bl	0x846944 <_ChromeMain+0x8416a8>
 467f2e4: f94166b7     	ldr	x23, [x21, #0x2c8]
 467f2e8: b4003517     	cbz	x23, 0x467f988 <_ChromeMain+0x467a6ec>
 467f2ec: 39d43e68     	ldrsb	w8, [x19, #0x50f]
 467f2f0: 37f82de8     	tbnz	w8, #0x1f, 0x467f8ac <_ChromeMain+0x467a610>
 467f2f4: 3dc00320     	ldr	q0, [x25]
 467f2f8: 3d8007e0     	str	q0, [sp, #0x10]
 467f2fc: f9400b28     	ldr	x8, [x25, #0x10]
 467f300: f90013e8     	str	x8, [sp, #0x20]
 467f304: 910043e1     	add	x1, sp, #0x10
 467f308: aa1703e0     	mov	x0, x23
 467f30c: 972bb973     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 467f310: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 467f314: 36f800a8     	tbz	w8, #0x1f, 0x467f328 <_ChromeMain+0x467a08c>
 467f318: f9400be0     	ldr	x0, [sp, #0x10]
 467f31c: f94013e8     	ldr	x8, [sp, #0x20]
 467f320: d37ff901     	lsl	x1, x8, #1
 467f324: 96e626e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467f328: aa1503e0     	mov	x0, x21
 467f32c: b21d07e1     	mov	x1, #0x1800000018       ; =103079215128
 467f330: 52800022     	mov	w2, #0x1                ; =1
 467f334: 978549cb     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 467f338: f94002a8     	ldr	x8, [x21]
 467f33c: f9405108     	ldr	x8, [x8, #0xa0]
 467f340: aa1503e0     	mov	x0, x21
 467f344: 52800001     	mov	w1, #0x0                ; =0
 467f348: d63f0100     	blr	x8
 467f34c: 3dc1c360     	ldr	q0, [x27, #0x700]
 467f350: 3c9a03a0     	stur	q0, [x29, #-0x60]
 467f354: d0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467f358: 91122021     	add	x1, x1, #0x488
 467f35c: d10183a2     	sub	x2, x29, #0x60
 467f360: aa1603e0     	mov	x0, x22
 467f364: 9751babf     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 467f368: 52802800     	mov	w0, #0x140              ; =320
 467f36c: 96e63fff     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f370: aa0003f6     	mov	x22, x0
 467f374: 978e4497     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 467f378: aa1503e0     	mov	x0, x21
 467f37c: aa1603e1     	mov	x1, x22
 467f380: 9754292e     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 467f384: b940f2c8     	ldr	w8, [x22, #0xf0]
 467f388: 35002aa8     	cbnz	w8, 0x467f8dc <_ChromeMain+0x467a640>
 467f38c: b9410ac8     	ldr	w8, [x22, #0x108]
 467f390: 7100051f     	cmp	w8, #0x1
 467f394: 540000c0     	b.eq	0x467f3ac <_ChromeMain+0x467a110>
 467f398: 52800028     	mov	w8, #0x1                ; =1
 467f39c: b9010ac8     	str	w8, [x22, #0x108]
 467f3a0: aa1603e0     	mov	x0, x22
 467f3a4: 52800021     	mov	w1, #0x1                ; =1
 467f3a8: 974f97c2     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467f3ac: 52800034     	mov	w20, #0x1               ; =1
 467f3b0: b81a03b4     	stur	w20, [x29, #-0x60]
 467f3b4: d0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467f3b8: 9115a021     	add	x1, x1, #0x568
 467f3bc: 910462c0     	add	x0, x22, #0x118
 467f3c0: d10183a2     	sub	x2, x29, #0x60
 467f3c4: 974f9778     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 467f3c8: f8bfc300     	ldapr	x0, [x24]
 467f3cc: b4003340     	cbz	x0, 0x467fa34 <_ChromeMain+0x467a798>
 467f3d0: 52807001     	mov	w1, #0x380              ; =896
 467f3d4: d2800002     	mov	x2, #0x0                ; =0
 467f3d8: 96e8b076     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467f3dc: aa0003f6     	mov	x22, x0
 467f3e0: 9776b796     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 467f3e4: 910fc348     	add	x8, x26, #0x3f0
 467f3e8: a900201a     	stp	x26, x8, [x0]
 467f3ec: 91106348     	add	x8, x26, #0x418
 467f3f0: f9000808     	str	x8, [x0, #0x10]
 467f3f4: 91114348     	add	x8, x26, #0x450
 467f3f8: 91120349     	add	x9, x26, #0x480
 467f3fc: a906a408     	stp	x8, x9, [x0, #0x68]
 467f400: 91134348     	add	x8, x26, #0x4d0
 467f404: f9005808     	str	x8, [x0, #0xb0]
 467f408: 9114c348     	add	x8, x26, #0x530
 467f40c: f9006c08     	str	x8, [x0, #0xd8]
 467f410: 91158348     	add	x8, x26, #0x560
 467f414: aa0003f7     	mov	x23, x0
 467f418: f80f8ee8     	str	x8, [x23, #0xf8]!
 467f41c: f901a41f     	str	xzr, [x0, #0x348]
 467f420: 2f06e400     	movi	d0, #0xffff000000000000
 467f424: fd01a800     	str	d0, [x0, #0x350]
 467f428: 390d6014     	strb	w20, [x0, #0x358]
 467f42c: f901b01f     	str	xzr, [x0, #0x360]
 467f430: 390da01f     	strb	wzr, [x0, #0x368]
 467f434: f901b81f     	str	xzr, [x0, #0x370]
 467f438: b903781f     	str	wzr, [x0, #0x378]
 467f43c: 390df01f     	strb	wzr, [x0, #0x37c]
 467f440: 3945a408     	ldrb	w8, [x0, #0x169]
 467f444: 35003008     	cbnz	w8, 0x467fa44 <_ChromeMain+0x467a7a8>
 467f448: f940cea2     	ldr	x2, [x21, #0x198]
 467f44c: aa1503e0     	mov	x0, x21
 467f450: aa1603e1     	mov	x1, x22
 467f454: 9703e7ea     	bl	0x7793fc <_ChromeMain+0x774160>
 467f458: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 467f45c: f0052994     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467f460: f9404689     	ldr	x9, [x20, #0x88]
 467f464: eb09011f     	cmp	x8, x9
 467f468: 54000061     	b.ne	0x467f474 <_ChromeMain+0x467a1d8>
 467f46c: aa1603e0     	mov	x0, x22
 467f470: 96e653a3     	bl	0x142fc <_ChromeMain+0xf060>
 467f474: f942a660     	ldr	x0, [x19, #0x548]
 467f478: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467f47c: f9404689     	ldr	x9, [x20, #0x88]
 467f480: eb09011f     	cmp	x8, x9
 467f484: 54000041     	b.ne	0x467f48c <_ChromeMain+0x467a1f0>
 467f488: 96e68d6d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467f48c: f902a676     	str	x22, [x19, #0x548]
 467f490: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 467f494: 340000c8     	cbz	w8, 0x467f4ac <_ChromeMain+0x467a210>
 467f498: 3906a6df     	strb	wzr, [x22, #0x1a9]
 467f49c: 9106a6c1     	add	x1, x22, #0x1a9
 467f4a0: aa1703e0     	mov	x0, x23
 467f4a4: 9722a2cb     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467f4a8: f942a676     	ldr	x22, [x19, #0x548]
 467f4ac: 910c42c8     	add	x8, x22, #0x310
 467f4b0: 394c62c9     	ldrb	w9, [x22, #0x318]
 467f4b4: 35002da9     	cbnz	w9, 0x467fa68 <_ChromeMain+0x467a7cc>
 467f4b8: d0fef6f7     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 467f4bc: 912c02f7     	add	x23, x23, #0xb00
 467f4c0: b4002828     	cbz	x8, 0x467f9c4 <_ChromeMain+0x467a728>
 467f4c4: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 467f4c8: f9018ac8     	str	x8, [x22, #0x310]
 467f4cc: 52800028     	mov	w8, #0x1                ; =1
 467f4d0: 390c62c8     	strb	w8, [x22, #0x318]
 467f4d4: f940c6c0     	ldr	x0, [x22, #0x188]
 467f4d8: b40000a0     	cbz	x0, 0x467f4ec <_ChromeMain+0x467a250>
 467f4dc: f9400008     	ldr	x8, [x0]
 467f4e0: f9417d08     	ldr	x8, [x8, #0x2f8]
 467f4e4: aa1603e1     	mov	x1, x22
 467f4e8: d63f0100     	blr	x8
 467f4ec: aa1603e0     	mov	x0, x22
 467f4f0: 52800001     	mov	w1, #0x0                ; =0
 467f4f4: 96fec3e0     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467f4f8: f81a03b6     	stur	x22, [x29, #-0x60]
 467f4fc: 9104c2c0     	add	x0, x22, #0x130
 467f500: d10183a3     	sub	x3, x29, #0x60
 467f504: 52800301     	mov	w1, #0x18               ; =24
 467f508: 52800022     	mov	w2, #0x1                ; =1
 467f50c: 97089f31     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 467f510: aa1603e0     	mov	x0, x22
 467f514: 972f5d75     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 467f518: f942a660     	ldr	x0, [x19, #0x548]
 467f51c: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 467f520: 52800022     	mov	w2, #0x1                ; =1
 467f524: 9785494f     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 467f528: 3945a6a8     	ldrb	w8, [x21, #0x169]
 467f52c: 35002928     	cbnz	w8, 0x467fa50 <_ChromeMain+0x467a7b4>
 467f530: f940ce62     	ldr	x2, [x19, #0x198]
 467f534: aa1303e0     	mov	x0, x19
 467f538: aa1503e1     	mov	x1, x21
 467f53c: 9703e7b0     	bl	0x7793fc <_ChromeMain+0x774160>
 467f540: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 467f544: f9404689     	ldr	x9, [x20, #0x88]
 467f548: eb09011f     	cmp	x8, x9
 467f54c: 54000061     	b.ne	0x467f558 <_ChromeMain+0x467a2bc>
 467f550: aa1503e0     	mov	x0, x21
 467f554: 96e6536a     	bl	0x142fc <_ChromeMain+0xf060>
 467f558: f942a260     	ldr	x0, [x19, #0x540]
 467f55c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467f560: f9404689     	ldr	x9, [x20, #0x88]
 467f564: eb09011f     	cmp	x8, x9
 467f568: 54000041     	b.ne	0x467f570 <_ChromeMain+0x467a2d4>
 467f56c: 96e68d34     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467f570: f902a275     	str	x21, [x19, #0x540]
 467f574: f9429268     	ldr	x8, [x19, #0x520]
 467f578: b4000a08     	cbz	x8, 0x467f6b8 <_ChromeMain+0x467a41c>
 467f57c: f9426a68     	ldr	x8, [x19, #0x4d0]
 467f580: b50009c8     	cbnz	x8, 0x467f6b8 <_ChromeMain+0x467a41c>
 467f584: 925e7668     	and	x8, x19, #0xfffffffc00000000
 467f588: f9404689     	ldr	x9, [x20, #0x88]
 467f58c: eb09011f     	cmp	x8, x9
 467f590: 54000061     	b.ne	0x467f59c <_ChromeMain+0x467a300>
 467f594: aa1303e0     	mov	x0, x19
 467f598: 96e65359     	bl	0x142fc <_ChromeMain+0xf060>
 467f59c: 52800700     	mov	w0, #0x38               ; =56
 467f5a0: 96e63f72     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f5a4: aa0003f6     	mov	x22, x0
 467f5a8: 52800034     	mov	w20, #0x1               ; =1
 467f5ac: b9000014     	str	w20, [x0]
 467f5b0: 90ffc9a8     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 467f5b4: 91300109     	add	x9, x8, #0xc00
 467f5b8: d0ff90c8     	adrp	x8, 0x3899000 <_ChromeMain+0x3893d64>
 467f5bc: 912d0108     	add	x8, x8, #0xb40
 467f5c0: a900a009     	stp	x9, x8, [x0, #0x8]
 467f5c4: a901f017     	stp	x23, x28, [x0, #0x18]
 467f5c8: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 467f5cc: f8bfc300     	ldapr	x0, [x24]
 467f5d0: b4002360     	cbz	x0, 0x467fa3c <_ChromeMain+0x467a7a0>
 467f5d4: 5280c901     	mov	w1, #0x648              ; =1608
 467f5d8: d2800002     	mov	x2, #0x0                ; =0
 467f5dc: 96e8aff5     	bl	0xab5b0 <_ChromeMain+0xa6314>
 467f5e0: aa0003f5     	mov	x21, x0
 467f5e4: f81a03b6     	stur	x22, [x29, #-0x60]
 467f5e8: 52800048     	mov	w8, #0x2                ; =2
 467f5ec: 381a83a8     	sturb	w8, [x29, #-0x58]
 467f5f0: 52800500     	mov	w0, #0x28               ; =40
 467f5f4: 96e63f5d     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f5f8: aa0003e2     	mov	x2, x0
 467f5fc: f0fdcc88     	adrp	x8, 0x12000 <_ChromeMain+0xcd64>
 467f600: 91370108     	add	x8, x8, #0xdc0
 467f604: b9000014     	str	w20, [x0]
 467f608: 90fe4d09     	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 467f60c: 91180129     	add	x9, x9, #0x600
 467f610: a900a408     	stp	x8, x9, [x0, #0x8]
 467f614: f9000c17     	str	x23, [x0, #0x18]
 467f618: d10183a1     	sub	x1, x29, #0x60
 467f61c: aa1503e0     	mov	x0, x21
 467f620: 97bc5835     	bl	0x35956f4 <_ChromeMain+0x3590458>
 467f624: 385a83a8     	ldurb	w8, [x29, #-0x58]
 467f628: 7103fd1f     	cmp	w8, #0xff
 467f62c: 54000060     	b.eq	0x467f638 <_ChromeMain+0x467a39c>
 467f630: f85a03a0     	ldur	x0, [x29, #-0x60]
 467f634: b5001120     	cbnz	x0, 0x467f858 <_ChromeMain+0x467a5bc>
 467f638: f94002a8     	ldr	x8, [x21]
 467f63c: f9405108     	ldr	x8, [x8, #0xa0]
 467f640: aa1503e0     	mov	x0, x21
 467f644: 52800001     	mov	w1, #0x0                ; =0
 467f648: d63f0100     	blr	x8
 467f64c: 3dc1c360     	ldr	q0, [x27, #0x700]
 467f650: 3c9a03a0     	stur	q0, [x29, #-0x60]
 467f654: d0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467f658: 91122021     	add	x1, x1, #0x488
 467f65c: 910362a0     	add	x0, x21, #0xd8
 467f660: d10183a2     	sub	x2, x29, #0x60
 467f664: 9751b9ff     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 467f668: 3945a6a8     	ldrb	w8, [x21, #0x169]
 467f66c: f0052994     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 467f670: 35001f68     	cbnz	w8, 0x467fa5c <_ChromeMain+0x467a7c0>
 467f674: f940ce62     	ldr	x2, [x19, #0x198]
 467f678: aa1303e0     	mov	x0, x19
 467f67c: aa1503e1     	mov	x1, x21
 467f680: 9703e75f     	bl	0x7793fc <_ChromeMain+0x774160>
 467f684: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 467f688: f9404689     	ldr	x9, [x20, #0x88]
 467f68c: eb09011f     	cmp	x8, x9
 467f690: 54000061     	b.ne	0x467f69c <_ChromeMain+0x467a400>
 467f694: aa1503e0     	mov	x0, x21
 467f698: 96e65319     	bl	0x142fc <_ChromeMain+0xf060>
 467f69c: f942ae60     	ldr	x0, [x19, #0x558]
 467f6a0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 467f6a4: f9404689     	ldr	x9, [x20, #0x88]
 467f6a8: eb09011f     	cmp	x8, x9
 467f6ac: 54000041     	b.ne	0x467f6b4 <_ChromeMain+0x467a418>
 467f6b0: 96e68ce3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 467f6b4: f902ae75     	str	x21, [x19, #0x558]
 467f6b8: 52800700     	mov	w0, #0x38               ; =56
 467f6bc: 96fa1081     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 467f6c0: aa0003f5     	mov	x21, x0
 467f6c4: 52800600     	mov	w0, #0x30               ; =48
 467f6c8: 96e63f28     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f6cc: aa0003e4     	mov	x4, x0
 467f6d0: 0ab57ea8     	bic	w8, w21, w21, asr #31
 467f6d4: 1e230100     	ucvtf	s0, w8
 467f6d8: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 467f6dc: f004e676     	adrp	x22, 0xe34e000 <dyld_stub_binder+0xe34e000>
 467f6e0: 913622d6     	add	x22, x22, #0xd88
 467f6e4: 7900301f     	strh	wzr, [x0, #0x18]
 467f6e8: f9000016     	str	x22, [x0]
 467f6ec: 4e040400     	dup.4s	v0, v0[0]
 467f6f0: 3c81c000     	stur	q0, [x0, #0x1c]
 467f6f4: d0051c21     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 467f6f8: 9114a021     	add	x1, x1, #0x528
 467f6fc: d004b622     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 467f700: 91264842     	add	x2, x2, #0x992
 467f704: b0ff3f63     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 467f708: 913c0063     	add	x3, x3, #0xf00
 467f70c: f94007e0     	ldr	x0, [sp, #0x8]
 467f710: d2800005     	mov	x5, #0x0                ; =0
 467f714: 9713aaa2     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 467f718: b5000980     	cbnz	x0, 0x467f848 <_ChromeMain+0x467a5ac>
 467f71c: aa1303e0     	mov	x0, x19
 467f720: 9733bdc8     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 467f724: aa1303e9     	mov	x9, x19
 467f728: f84e8d28     	ldr	x8, [x9, #0xe8]!
 467f72c: b4000128     	cbz	x8, 0x467f750 <_ChromeMain+0x467a4b4>
 467f730: b0051c2a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 467f734: 9132c14a     	add	x10, x10, #0xcb0
 467f738: f940110b     	ldr	x11, [x8, #0x20]
 467f73c: eb0a017f     	cmp	x11, x10
 467f740: 540007e8     	b.hi	0x467f83c <_ChromeMain+0x467a5a0>
 467f744: 54000742     	b.hs	0x467f82c <_ChromeMain+0x467a590>
 467f748: f9400508     	ldr	x8, [x8, #0x8]
 467f74c: b5ffff68     	cbnz	x8, 0x467f738 <_ChromeMain+0x467a49c>
 467f750: d2800014     	mov	x20, #0x0               ; =0
 467f754: 52800700     	mov	w0, #0x38               ; =56
 467f758: 96fa105a     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 467f75c: aa0003f5     	mov	x21, x0
 467f760: 52800600     	mov	w0, #0x30               ; =48
 467f764: 96e63f01     	bl	0xf368 <_ChromeMain+0xa0cc>
 467f768: aa0003e8     	mov	x8, x0
 467f76c: 0ab57ea9     	bic	w9, w21, w21, asr #31
 467f770: 1e230120     	ucvtf	s0, w9
 467f774: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 467f778: 7900301f     	strh	wzr, [x0, #0x18]
 467f77c: f9000016     	str	x22, [x0]
 467f780: 4e040400     	dup.4s	v0, v0[0]
 467f784: 3c81c000     	stur	q0, [x0, #0x1c]
 467f788: f9418e80     	ldr	x0, [x20, #0x318]
 467f78c: f9018e88     	str	x8, [x20, #0x318]
 467f790: b5001360     	cbnz	x0, 0x467f9fc <_ChromeMain+0x467a760>
 467f794: aa1403e0     	mov	x0, x20
 467f798: 52800001     	mov	w1, #0x0                ; =0
 467f79c: 96fec336     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467f7a0: aa1403e0     	mov	x0, x20
 467f7a4: 96fc8676     	bl	0x5a117c <_ChromeMain+0x59bee0>
 467f7a8: aa1303e0     	mov	x0, x19
 467f7ac: 94000105     	bl	0x467fbc0 <_ChromeMain+0x467a924>
 467f7b0: f942a260     	ldr	x0, [x19, #0x540]
 467f7b4: b4000180     	cbz	x0, 0x467f7e4 <_ChromeMain+0x467a548>
 467f7b8: b943be68     	ldr	w8, [x19, #0x3bc]
 467f7bc: 7100011f     	cmp	w8, #0x0
 467f7c0: 1a9f07e9     	cset	w9, ne
 467f7c4: 3947200a     	ldrb	w10, [x0, #0x1c8]
 467f7c8: 6b0a013f     	cmp	w9, w10
 467f7cc: 540000c0     	b.eq	0x467f7e4 <_ChromeMain+0x467a548>
 467f7d0: 7100011f     	cmp	w8, #0x0
 467f7d4: 1a9f07e1     	cset	w1, ne
 467f7d8: f9400008     	ldr	x8, [x0]
 467f7dc: f9405108     	ldr	x8, [x8, #0xa0]
 467f7e0: d63f0100     	blr	x8
 467f7e4: f942ae60     	ldr	x0, [x19, #0x558]
 467f7e8: b4000100     	cbz	x0, 0x467f808 <_ChromeMain+0x467a56c>
 467f7ec: 39472008     	ldrb	w8, [x0, #0x1c8]
 467f7f0: 39544261     	ldrb	w1, [x19, #0x510]
 467f7f4: 6b01011f     	cmp	w8, w1
 467f7f8: 54000080     	b.eq	0x467f808 <_ChromeMain+0x467a56c>
 467f7fc: f9400008     	ldr	x8, [x0]
 467f800: f9405108     	ldr	x8, [x8, #0xa0]
 467f804: d63f0100     	blr	x8
 467f808: aa1303e0     	mov	x0, x19
 467f80c: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 467f810: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 467f814: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 467f818: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 467f81c: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 467f820: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 467f824: 9103c3ff     	add	sp, sp, #0xf0
 467f828: d65f03c0     	ret
 467f82c: eb09011f     	cmp	x8, x9
 467f830: 54fff900     	b.eq	0x467f750 <_ChromeMain+0x467a4b4>
 467f834: f9401914     	ldr	x20, [x8, #0x30]
 467f838: 17ffffc7     	b	0x467f754 <_ChromeMain+0x467a4b8>
 467f83c: f9400108     	ldr	x8, [x8]
 467f840: b5fff7c8     	cbnz	x8, 0x467f738 <_ChromeMain+0x467a49c>
 467f844: 17ffffc3     	b	0x467f750 <_ChromeMain+0x467a4b4>
 467f848: f9400008     	ldr	x8, [x0]
 467f84c: f9400508     	ldr	x8, [x8, #0x8]
 467f850: d63f0100     	blr	x8
 467f854: 17ffffb2     	b	0x467f71c <_ChromeMain+0x467a480>
 467f858: 12800008     	mov	w8, #-0x1               ; =-1
 467f85c: b8e80008     	ldaddal	w8, w8, [x0]
 467f860: 7100051f     	cmp	w8, #0x1
 467f864: 54ffeea1     	b.ne	0x467f638 <_ChromeMain+0x467a39c>
 467f868: f9400808     	ldr	x8, [x0, #0x10]
 467f86c: d63f0100     	blr	x8
 467f870: 17ffff72     	b	0x467f638 <_ChromeMain+0x467a39c>
 467f874: f9425a61     	ldr	x1, [x19, #0x4b0]
 467f878: f9425e62     	ldr	x2, [x19, #0x4b8]
 467f87c: 910143e0     	add	x0, sp, #0x50
 467f880: 96e71cd4     	bl	0x46bd0 <_ChromeMain+0x41934>
 467f884: 17fffd22     	b	0x467ed0c <_ChromeMain+0x4679a70>
 467f888: 972b33cf     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 467f88c: 52800a01     	mov	w1, #0x50               ; =80
 467f890: 96e6258a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 467f894: 17fffe1a     	b	0x467f0fc <_ChromeMain+0x4679e60>
 467f898: b900f2ff     	str	wzr, [x23, #0xf0]
 467f89c: aa1703e0     	mov	x0, x23
 467f8a0: 52800021     	mov	w1, #0x1                ; =1
 467f8a4: 974f9683     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467f8a8: 17fffd30     	b	0x467ed68 <_ChromeMain+0x4679acc>
 467f8ac: f9427e61     	ldr	x1, [x19, #0x4f8]
 467f8b0: f9428262     	ldr	x2, [x19, #0x500]
 467f8b4: 910043e0     	add	x0, sp, #0x10
 467f8b8: 96e71cc6     	bl	0x46bd0 <_ChromeMain+0x41934>
 467f8bc: 17fffe92     	b	0x467f304 <_ChromeMain+0x467a068>
 467f8c0: 12800008     	mov	w8, #-0x1               ; =-1
 467f8c4: b8e80008     	ldaddal	w8, w8, [x0]
 467f8c8: 7100051f     	cmp	w8, #0x1
 467f8cc: 54ff96a1     	b.ne	0x467eba0 <_ChromeMain+0x4679904>
 467f8d0: f9400808     	ldr	x8, [x0, #0x10]
 467f8d4: d63f0100     	blr	x8
 467f8d8: 17fffcb2     	b	0x467eba0 <_ChromeMain+0x4679904>
 467f8dc: b900f2df     	str	wzr, [x22, #0xf0]
 467f8e0: aa1603e0     	mov	x0, x22
 467f8e4: 52800021     	mov	w1, #0x1                ; =1
 467f8e8: 974f9672     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467f8ec: 17fffea8     	b	0x467f38c <_ChromeMain+0x467a0f0>
 467f8f0: 390edabf     	strb	wzr, [x21, #0x3b6]
 467f8f4: aa1503e0     	mov	x0, x21
 467f8f8: 9722a284     	bl	0xf28308 <_ChromeMain+0xf2306c>
 467f8fc: aa1503e0     	mov	x0, x21
 467f900: 52800041     	mov	w1, #0x2                ; =2
 467f904: 97058818     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 467f908: 9103e2a0     	add	x0, x21, #0xf8
 467f90c: 910edaa1     	add	x1, x21, #0x3b6
 467f910: 9722a1b0     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 467f914: f9429e75     	ldr	x21, [x19, #0x538]
 467f918: 17fffdd0     	b	0x467f058 <_ChromeMain+0x4679dbc>
 467f91c: 12800008     	mov	w8, #-0x1               ; =-1
 467f920: b8e80008     	ldaddal	w8, w8, [x0]
 467f924: 7100051f     	cmp	w8, #0x1
 467f928: 54ffc7c1     	b.ne	0x467f220 <_ChromeMain+0x4679f84>
 467f92c: f9400808     	ldr	x8, [x0, #0x10]
 467f930: d63f0100     	blr	x8
 467f934: 17fffe3b     	b	0x467f220 <_ChromeMain+0x4679f84>
 467f938: d3607ec8     	lsl	x8, x22, #32
 467f93c: d2c00109     	mov	x9, #0x800000000        ; =34359738368
 467f940: a90fa6e8     	stp	x8, x9, [x23, #0xf8]
 467f944: aa1703e0     	mov	x0, x23
 467f948: 52800021     	mov	w1, #0x1                ; =1
 467f94c: 974f9659     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 467f950: 17fffd17     	b	0x467edac <_ChromeMain+0x4679b10>
 467f954: 972199eb     	bl	0xee6100 <_ChromeMain+0xee0e64>
 467f958: 35000920     	cbnz	w0, 0x467fa7c <_ChromeMain+0x467a7e0>
 467f95c: aa1303e0     	mov	x0, x19
 467f960: 97317b3d     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 467f964: aa0003f7     	mov	x23, x0
 467f968: f9416660     	ldr	x0, [x19, #0x2c8]
 467f96c: f9016677     	str	x23, [x19, #0x2c8]
 467f970: b4ff9c20     	cbz	x0, 0x467ecf4 <_ChromeMain+0x4679a58>
 467f974: f9400008     	ldr	x8, [x0]
 467f978: f9400508     	ldr	x8, [x8, #0x8]
 467f97c: d63f0100     	blr	x8
 467f980: f9416677     	ldr	x23, [x19, #0x2c8]
 467f984: 17fffcdc     	b	0x467ecf4 <_ChromeMain+0x4679a58>
 467f988: 972199de     	bl	0xee6100 <_ChromeMain+0xee0e64>
 467f98c: 35000840     	cbnz	w0, 0x467fa94 <_ChromeMain+0x467a7f8>
 467f990: aa1503e0     	mov	x0, x21
 467f994: 97317b30     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 467f998: aa0003f7     	mov	x23, x0
 467f99c: f94166a0     	ldr	x0, [x21, #0x2c8]
 467f9a0: f90166b7     	str	x23, [x21, #0x2c8]
 467f9a4: b4ffca40     	cbz	x0, 0x467f2ec <_ChromeMain+0x467a050>
 467f9a8: f9400008     	ldr	x8, [x0]
 467f9ac: f9400508     	ldr	x8, [x8, #0x8]
 467f9b0: d63f0100     	blr	x8
 467f9b4: f94166b7     	ldr	x23, [x21, #0x2c8]
 467f9b8: 17fffe4d     	b	0x467f2ec <_ChromeMain+0x467a050>
 467f9bc: d4200000     	brk	#0
 467f9c0: d4400000     	hlt	#0
 467f9c4: d4200020     	brk	#0x1
 467f9c8: 97f14f4c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467f9cc: 17fffd72     	b	0x467ef94 <_ChromeMain+0x4679cf8>
 467f9d0: d4200000     	brk	#0
 467f9d4: d4400000     	hlt	#0
 467f9d8: d4200020     	brk	#0x1
 467f9dc: d4200000     	brk	#0
 467f9e0: d4400000     	hlt	#0
 467f9e4: d4200020     	brk	#0x1
 467f9e8: d4200000     	brk	#0
 467f9ec: d4400000     	hlt	#0
 467f9f0: d4200020     	brk	#0x1
 467f9f4: 97f14f41     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467f9f8: 17fffcfc     	b	0x467ede8 <_ChromeMain+0x4679b4c>
 467f9fc: f9400008     	ldr	x8, [x0]
 467fa00: f9400508     	ldr	x8, [x8, #0x8]
 467fa04: d63f0100     	blr	x8
 467fa08: 17ffff63     	b	0x467f794 <_ChromeMain+0x467a4f8>
 467fa0c: aa088108     	orr	x8, x8, x8, lsl #32
 467fa10: f9000128     	str	x8, [x9]
 467fa14: 17fffd36     	b	0x467eeec <_ChromeMain+0x4679c50>
 467fa18: aa1603e0     	mov	x0, x22
 467fa1c: 976e99c9     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 467fa20: b94046c8     	ldr	w8, [x22, #0x44]
 467fa24: f94026f6     	ldr	x22, [x23, #0x48]
 467fa28: 17fffd9c     	b	0x467f098 <_ChromeMain+0x4679dfc>
 467fa2c: 97f14f33     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467fa30: 17fffdee     	b	0x467f1e8 <_ChromeMain+0x4679f4c>
 467fa34: 97f14f31     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467fa38: 17fffe66     	b	0x467f3d0 <_ChromeMain+0x467a134>
 467fa3c: 97f14f2f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 467fa40: 17fffee5     	b	0x467f5d4 <_ChromeMain+0x467a338>
 467fa44: d4200000     	brk	#0
 467fa48: d4400000     	hlt	#0
 467fa4c: d4200020     	brk	#0x1
 467fa50: d4200000     	brk	#0
 467fa54: d4400000     	hlt	#0
 467fa58: d4200020     	brk	#0x1
 467fa5c: d4200000     	brk	#0
 467fa60: d4400000     	hlt	#0
 467fa64: d4200020     	brk	#0x1
 467fa68: b21c03e9     	mov	x9, #0x1000000010       ; =68719476752
 467fa6c: f9000109     	str	x9, [x8]
 467fa70: d0fef6f7     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 467fa74: 912c02f7     	add	x23, x23, #0xb00
 467fa78: 17fffe97     	b	0x467f4d4 <_ChromeMain+0x467a238>
 467fa7c: 52803600     	mov	w0, #0x1b0              ; =432
 467fa80: 96e63e3a     	bl	0xf368 <_ChromeMain+0xa0cc>
 467fa84: aa0003f7     	mov	x23, x0
 467fa88: aa1303e1     	mov	x1, x19
 467fa8c: 9721983d     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 467fa90: 17ffffb6     	b	0x467f968 <_ChromeMain+0x467a6cc>
 467fa94: 52803600     	mov	w0, #0x1b0              ; =432
 467fa98: 96e63e34     	bl	0xf368 <_ChromeMain+0xa0cc>
 467fa9c: aa0003f7     	mov	x23, x0
 467faa0: aa1503e1     	mov	x1, x21
 467faa4: 97219837     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 467faa8: 17ffffbd     	b	0x467f99c <_ChromeMain+0x467a700>
