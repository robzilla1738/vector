
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  b1d0a4: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
  b1d0a8: a90167fa     	stp	x26, x25, [sp, #0x10]
  b1d0ac: a9025ff8     	stp	x24, x23, [sp, #0x20]
  b1d0b0: a90357f6     	stp	x22, x21, [sp, #0x30]
  b1d0b4: a9044ff4     	stp	x20, x19, [sp, #0x40]
  b1d0b8: a9057bfd     	stp	x29, x30, [sp, #0x50]
  b1d0bc: 910143fd     	add	x29, sp, #0x50
  b1d0c0: d107c3ff     	sub	sp, sp, #0x1f0
  b1d0c4: aa0803f3     	mov	x19, x8
  b1d0c8: 39406008     	ldrb	w8, [x0, #0x18]
  b1d0cc: 34000508     	cbz	w8, 0xb1d16c <_ChromeMain+0xb17ed0>
  b1d0d0: 910043f5     	add	x21, sp, #0x10
  b1d0d4: d0071f96     	adrp	x22, 0xef0f000 <dyld_stub_binder+0xef0f000>
  b1d0d8: 910242d6     	add	x22, x22, #0x90
  b1d0dc: b0071f88     	adrp	x8, 0xef0e000 <dyld_stub_binder+0xef0e000>
  b1d0e0: 913e0108     	add	x8, x8, #0xf80
  b1d0e4: d00613b8     	adrp	x24, 0xcd93000 <dyld_stub_binder+0xcd93000>
  b1d0e8: 91060b18     	add	x24, x24, #0x182
  b1d0ec: 5280003b     	mov	w27, #0x1               ; =1
  b1d0f0: 39805c0a     	ldrsb	x10, [x0, #0x17]
  b1d0f4: a9402c09     	ldp	x9, x11, [x0]
  b1d0f8: f100015f     	cmp	x10, #0x0
  b1d0fc: 9a804129     	csel	x9, x9, x0, mi
  b1d100: 7100015f     	cmp	w10, #0x0
  b1d104: 9a8a416b     	csel	x11, x11, x10, mi
  b1d108: b940241a     	ldr	w26, [x0, #0x24]
  b1d10c: 37f8291a     	tbnz	w26, #0x1f, 0xb1d62c <_ChromeMain+0xb18390>
  b1d110: b980200a     	ldrsw	x10, [x0, #0x20]
  b1d114: eb0a016b     	subs	x11, x11, x10
  b1d118: 54003003     	b.lo	0xb1d718 <_ChromeMain+0xb1847c>
  b1d11c: eb1a017f     	cmp	x11, x26
  b1d120: 9a9a3179     	csel	x25, x11, x26, lo
  b1d124: 8b090157     	add	x23, x10, x9
  b1d128: 38bfc2c9     	ldaprb	w9, [x22]
  b1d12c: 36002849     	tbz	w9, #0x0, 0xb1d634 <_ChromeMain+0xb18398>
  b1d130: 37f801fa     	tbnz	w26, #0x1f, 0xb1d16c <_ChromeMain+0xb17ed0>
  b1d134: b40001d9     	cbz	x25, 0xb1d16c <_ChromeMain+0xb17ed0>
  b1d138: f940050a     	ldr	x10, [x8, #0x8]
  b1d13c: d37be949     	lsl	x9, x10, #5
  b1d140: b4000169     	cbz	x9, 0xb1d16c <_ChromeMain+0xb17ed0>
  b1d144: f9400109     	ldr	x9, [x8]
  b1d148: 8b0a152a     	add	x10, x9, x10, lsl #5
  b1d14c: 39805d2c     	ldrsb	x12, [x9, #0x17]
  b1d150: b7f82e0c     	tbnz	x12, #0x3f, 0xb1d710 <_ChromeMain+0xb18474>
  b1d154: aa0903eb     	mov	x11, x9
  b1d158: eb0c033f     	cmp	x25, x12
  b1d15c: 54000360     	b.eq	0xb1d1c8 <_ChromeMain+0xb17f2c>
  b1d160: 91008129     	add	x9, x9, #0x20
  b1d164: eb0a013f     	cmp	x9, x10
  b1d168: 54ffff21     	b.ne	0xb1d14c <_ChromeMain+0xb17eb0>
  b1d16c: a9007e7f     	stp	xzr, xzr, [x19]
  b1d170: b801727f     	stur	wzr, [x19, #0x17]
  b1d174: f9000a7f     	str	xzr, [x19, #0x10]
  b1d178: 6f07e600     	movi.2d	v0, #0xffffffff00000000
  b1d17c: ad010260     	stp	q0, q0, [x19, #0x20]
  b1d180: ad020260     	stp	q0, q0, [x19, #0x40]
  b1d184: 7900c27f     	strh	wzr, [x19, #0x60]
  b1d188: a906fe7f     	stp	xzr, xzr, [x19, #0x68]
  b1d18c: 140000bc     	b	0xb1d47c <_ChromeMain+0xb181e0>
  b1d190: aa0003e8     	mov	x8, x0
  b1d194: 14000060     	b	0xb1d314 <_ChromeMain+0xb18078>
  b1d198: f9400009     	ldr	x9, [x0]
  b1d19c: 7100015f     	cmp	w10, #0x0
  b1d1a0: 9a804129     	csel	x9, x9, x0, mi
  b1d1a4: 8b0b0129     	add	x9, x9, x11
  b1d1a8: f940012a     	ldr	x10, [x9]
  b1d1ac: f940030b     	ldr	x11, [x24]
  b1d1b0: 79401129     	ldrh	w9, [x9, #0x8]
  b1d1b4: 7940130c     	ldrh	w12, [x24, #0x8]
  b1d1b8: eb0b015f     	cmp	x10, x11
  b1d1bc: fa4c0120     	ccmp	x9, x12, #0x0, eq
  b1d1c0: 540022e0     	b.eq	0xb1d61c <_ChromeMain+0xb18380>
  b1d1c4: 14000021     	b	0xb1d248 <_ChromeMain+0xb17fac>
  b1d1c8: aa1903ec     	mov	x12, x25
  b1d1cc: aa1703ed     	mov	x13, x23
  b1d1d0: 384015ae     	ldrb	w14, [x13], #0x1
  b1d1d4: 3840156f     	ldrb	w15, [x11], #0x1
  b1d1d8: 510105d0     	sub	w16, w14, #0x41
  b1d1dc: 110081d1     	add	w17, w14, #0x20
  b1d1e0: 71006a1f     	cmp	w16, #0x1a
  b1d1e4: 1a8e322e     	csel	w14, w17, w14, lo
  b1d1e8: 12001dce     	and	w14, w14, #0xff
  b1d1ec: 510105f0     	sub	w16, w15, #0x41
  b1d1f0: 110081f1     	add	w17, w15, #0x20
  b1d1f4: 71006a1f     	cmp	w16, #0x1a
  b1d1f8: 1a8f322f     	csel	w15, w17, w15, lo
  b1d1fc: 6b2f01df     	cmp	w14, w15, uxtb
  b1d200: 54fffb01     	b.ne	0xb1d160 <_ChromeMain+0xb17ec4>
  b1d204: f100058c     	subs	x12, x12, #0x1
  b1d208: 54fffe41     	b.ne	0xb1d1d0 <_ChromeMain+0xb17f34>
  b1d20c: b9402409     	ldr	w9, [x0, #0x24]
  b1d210: 7100053f     	cmp	w9, #0x1
  b1d214: 540001ab     	b.lt	0xb1d248 <_ChromeMain+0xb17fac>
  b1d218: 39405c0b     	ldrb	w11, [x0, #0x17]
  b1d21c: 13001d6a     	sxtb	w10, w11
  b1d220: f940040c     	ldr	x12, [x0, #0x8]
  b1d224: 7100015f     	cmp	w10, #0x0
  b1d228: 9a8b418c     	csel	x12, x12, x11, mi
  b1d22c: b980200b     	ldrsw	x11, [x0, #0x20]
  b1d230: eb0b018c     	subs	x12, x12, x11
  b1d234: 54002723     	b.lo	0xb1d718 <_ChromeMain+0xb1847c>
  b1d238: eb09019f     	cmp	x12, x9
  b1d23c: 9a893189     	csel	x9, x12, x9, lo
  b1d240: f100293f     	cmp	x9, #0xa
  b1d244: 54fffaa0     	b.eq	0xb1d198 <_ChromeMain+0xb17efc>
  b1d248: 6f00e400     	movi.2d	v0, #0000000000000000
  b1d24c: ad0483e0     	stp	q0, q0, [sp, #0x90]
  b1d250: ad0583e0     	stp	q0, q0, [sp, #0xb0]
  b1d254: b2607fe8     	mov	x8, #-0x100000000       ; =-4294967296
  b1d258: a90d7fff     	stp	xzr, xzr, [sp, #0xd0]
  b1d25c: ad0383e0     	stp	q0, q0, [sp, #0x70]
  b1d260: ad0283e0     	stp	q0, q0, [sp, #0x50]
  b1d264: ad0183e0     	stp	q0, q0, [sp, #0x30]
  b1d268: ad0083e0     	stp	q0, q0, [sp, #0x10]
  b1d26c: 12800009     	mov	w9, #-0x1               ; =-1
  b1d270: b90097e9     	str	w9, [sp, #0x94]
  b1d274: 2f07e601     	movi	d1, #0xffffffff00000000
  b1d278: fd0057e1     	str	d1, [sp, #0xa8]
  b1d27c: b900b7e9     	str	w9, [sp, #0xb4]
  b1d280: 390343ff     	strb	wzr, [sp, #0xd0]
  b1d284: 6f07e601     	movi.2d	v1, #0xffffffff00000000
  b1d288: 3c8882a1     	stur	q1, [x21, #0x88]
  b1d28c: 3c8a82a1     	stur	q1, [x21, #0xa8]
  b1d290: f006080a     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
  b1d294: 9101114a     	add	x10, x10, #0x44
  b1d298: f90013ea     	str	x10, [sp, #0x20]
  b1d29c: f9001bea     	str	x10, [sp, #0x30]
  b1d2a0: f90033ea     	str	x10, [sp, #0x60]
  b1d2a4: f9003bea     	str	x10, [sp, #0x70]
  b1d2a8: f90043ea     	str	x10, [sp, #0x80]
  b1d2ac: f90067e8     	str	x8, [sp, #0xc8]
  b1d2b0: 910443f9     	add	x25, sp, #0x110
  b1d2b4: ad0983e0     	stp	q0, q0, [sp, #0x130]
  b1d2b8: ad0a83e0     	stp	q0, q0, [sp, #0x150]
  b1d2bc: a9177fff     	stp	xzr, xzr, [sp, #0x170]
  b1d2c0: ad0883e0     	stp	q0, q0, [sp, #0x110]
  b1d2c4: b90137e9     	str	w9, [sp, #0x134]
  b1d2c8: b9013fe9     	str	w9, [sp, #0x13c]
  b1d2cc: b90147e9     	str	w9, [sp, #0x144]
  b1d2d0: b9014fe9     	str	w9, [sp, #0x14c]
  b1d2d4: b90157e9     	str	w9, [sp, #0x154]
  b1d2d8: b9015fe9     	str	w9, [sp, #0x15c]
  b1d2dc: b90167e9     	str	w9, [sp, #0x164]
  b1d2e0: b9016fe9     	str	w9, [sp, #0x16c]
  b1d2e4: 3905c7ff     	strb	wzr, [sp, #0x171]
  b1d2e8: f900c3ff     	str	xzr, [sp, #0x180]
  b1d2ec: 39406008     	ldrb	w8, [x0, #0x18]
  b1d2f0: 36001868     	tbz	w8, #0x0, 0xb1d5fc <_ChromeMain+0xb18360>
  b1d2f4: b006bd48     	adrp	x8, 0xe2c6000 <dyld_stub_binder+0xe2c6000>
  b1d2f8: 9139a108     	add	x8, x8, #0xe68
  b1d2fc: a91067ff     	stp	xzr, x25, [sp, #0x100]
  b1d300: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
  b1d304: f90077e8     	str	x8, [sp, #0xe8]
  b1d308: 39805c01     	ldrsb	x1, [x0, #0x17]
  b1d30c: b6fff421     	tbz	x1, #0x3f, 0xb1d190 <_ChromeMain+0xb17ef4>
  b1d310: a9400408     	ldp	x8, x1, [x0]
  b1d314: 91008002     	add	x2, x0, #0x20
  b1d318: 910043e3     	add	x3, sp, #0x10
  b1d31c: 9103a3e5     	add	x5, sp, #0xe8
  b1d320: 91008326     	add	x6, x25, #0x20
  b1d324: aa0803e0     	mov	x0, x8
  b1d328: d2800004     	mov	x4, #0x0                ; =0
  b1d32c: 940ba757     	bl	0xe07088 <_ChromeMain+0xe01dec>
  b1d330: 3904a3e0     	strb	w0, [sp, #0x128]
  b1d334: a9506be8     	ldp	x8, x26, [sp, #0x100]
  b1d338: 39805f5b     	ldrsb	x27, [x26, #0x17]
  b1d33c: b7f80dbb     	tbnz	x27, #0x3f, 0xb1d4f0 <_ChromeMain+0xb18254>
  b1d340: eb1b0114     	subs	x20, x8, x27
  b1d344: 54000ac9     	b.ls	0xb1d49c <_ChromeMain+0xb18200>
  b1d348: 528002c9     	mov	w9, #0x16               ; =22
  b1d34c: cb1b0129     	sub	x9, x9, x27
  b1d350: eb14013f     	cmp	x9, x20
  b1d354: 54000e63     	b.lo	0xb1d520 <_ChromeMain+0xb18284>
  b1d358: aa1b03f5     	mov	x21, x27
  b1d35c: aa1a03f6     	mov	x22, x26
  b1d360: 8b1502c0     	add	x0, x22, x21
  b1d364: aa1403e1     	mov	x1, x20
  b1d368: 95d3b12a     	bl	0x8009810 <_ChromeMain+0x8004574>
  b1d36c: 8b1402a8     	add	x8, x21, x20
  b1d370: 39c05f49     	ldrsb	w9, [x26, #0x17]
  b1d374: 37f809a9     	tbnz	w9, #0x1f, 0xb1d4a8 <_ChromeMain+0xb1820c>
  b1d378: 12001909     	and	w9, w8, #0x7f
  b1d37c: 39005f49     	strb	w9, [x26, #0x17]
  b1d380: 38286adf     	strb	wzr, [x22, x8]
  b1d384: f94083e8     	ldr	x8, [sp, #0x100]
  b1d388: f9007fe8     	str	x8, [sp, #0xf8]
  b1d38c: 3944a3e8     	ldrb	w8, [sp, #0x128]
  b1d390: 34000228     	cbz	w8, 0xb1d3d4 <_ChromeMain+0xb18138>
  b1d394: b94137e8     	ldr	w8, [sp, #0x134]
  b1d398: 7100051f     	cmp	w8, #0x1
  b1d39c: 540001ab     	b.lt	0xb1d3d0 <_ChromeMain+0xb18134>
  b1d3a0: 39449fea     	ldrb	w10, [sp, #0x127]
  b1d3a4: 13001d49     	sxtb	w9, w10
  b1d3a8: f9408feb     	ldr	x11, [sp, #0x118]
  b1d3ac: 7100013f     	cmp	w9, #0x0
  b1d3b0: 9a8a4175     	csel	x21, x11, x10, mi
  b1d3b4: b98133ea     	ldrsw	x10, [sp, #0x130]
  b1d3b8: eb0a02ab     	subs	x11, x21, x10
  b1d3bc: 54001ae3     	b.lo	0xb1d718 <_ChromeMain+0xb1847c>
  b1d3c0: eb08017f     	cmp	x11, x8
  b1d3c4: 9a883168     	csel	x8, x11, x8, lo
  b1d3c8: f100291f     	cmp	x8, #0xa
  b1d3cc: 54000720     	b.eq	0xb1d4b0 <_ChromeMain+0xb18214>
  b1d3d0: 52800028     	mov	w8, #0x1                ; =1
  b1d3d4: 3dc047e0     	ldr	q0, [sp, #0x110]
  b1d3d8: 3d800260     	str	q0, [x19]
  b1d3dc: f94093e9     	ldr	x9, [sp, #0x120]
  b1d3e0: f9000a69     	str	x9, [x19, #0x10]
  b1d3e4: a911ffff     	stp	xzr, xzr, [sp, #0x118]
  b1d3e8: f9008bff     	str	xzr, [sp, #0x110]
  b1d3ec: 39006268     	strb	w8, [x19, #0x18]
  b1d3f0: 9100abe8     	add	x8, sp, #0x2a
  b1d3f4: 784ff108     	ldurh	w8, [x8, #0xff]
  b1d3f8: 78019268     	sturh	w8, [x19, #0x19]
  b1d3fc: 91008260     	add	x0, x19, #0x20
  b1d400: 91008321     	add	x1, x25, #0x20
  b1d404: 97d40904     	bl	0x1f814 <_ChromeMain+0x1a578>
  b1d408: a957a3e0     	ldp	x0, x8, [sp, #0x178]
  b1d40c: f9003a68     	str	x8, [x19, #0x70]
  b1d410: f900c3ff     	str	xzr, [sp, #0x180]
  b1d414: 3904a3ff     	strb	wzr, [sp, #0x128]
  b1d418: 6f07e600     	movi.2d	v0, #0xffffffff00000000
  b1d41c: ad3a83a0     	stp	q0, q0, [x29, #-0xb0]
  b1d420: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
  b1d424: 781903bf     	sturh	wzr, [x29, #-0x70]
  b1d428: f81983bf     	stur	xzr, [x29, #-0x68]
  b1d42c: ad0983e0     	stp	q0, q0, [sp, #0x130]
  b1d430: ad0a83e0     	stp	q0, q0, [sp, #0x150]
  b1d434: 7902e3ff     	strh	wzr, [sp, #0x170]
  b1d438: b5001620     	cbnz	x0, 0xb1d6fc <_ChromeMain+0xb18460>
  b1d43c: d102c3a0     	sub	x0, x29, #0xb0
  b1d440: 97d42a0e     	bl	0x27c78 <_ChromeMain+0x229dc>
  b1d444: 910043f3     	add	x19, sp, #0x10
  b1d448: 9101c320     	add	x0, x25, #0x70
  b1d44c: d2800001     	mov	x1, #0x0                ; =0
  b1d450: 97d42a1a     	bl	0x27cb8 <_ChromeMain+0x22a1c>
  b1d454: 91008320     	add	x0, x25, #0x20
  b1d458: 97d42a08     	bl	0x27c78 <_ChromeMain+0x229dc>
  b1d45c: 39c49fe8     	ldrsb	w8, [sp, #0x127]
  b1d460: 36f800a8     	tbz	w8, #0x1f, 0xb1d474 <_ChromeMain+0xb181d8>
  b1d464: f9408be0     	ldr	x0, [sp, #0x110]
  b1d468: f94093e8     	ldr	x8, [sp, #0x120]
  b1d46c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  b1d470: 97d3ae92     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  b1d474: 91020260     	add	x0, x19, #0x80
  b1d478: 97d42a00     	bl	0x27c78 <_ChromeMain+0x229dc>
  b1d47c: 9107c3ff     	add	sp, sp, #0x1f0
  b1d480: a9457bfd     	ldp	x29, x30, [sp, #0x50]
  b1d484: a9444ff4     	ldp	x20, x19, [sp, #0x40]
  b1d488: a94357f6     	ldp	x22, x21, [sp, #0x30]
  b1d48c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
  b1d490: a94167fa     	ldp	x26, x25, [sp, #0x10]
  b1d494: a8c66ffc     	ldp	x28, x27, [sp], #0x60
  b1d498: d65f03c0     	ret
  b1d49c: 39005f48     	strb	w8, [x26, #0x17]
  b1d4a0: 38286b5f     	strb	wzr, [x26, x8]
  b1d4a4: 17ffffb8     	b	0xb1d384 <_ChromeMain+0xb180e8>
  b1d4a8: f9000748     	str	x8, [x26, #0x8]
  b1d4ac: 17ffffb5     	b	0xb1d380 <_ChromeMain+0xb180e4>
  b1d4b0: f9408be8     	ldr	x8, [sp, #0x110]
  b1d4b4: 7100013f     	cmp	w9, #0x0
  b1d4b8: 910443e9     	add	x9, sp, #0x110
  b1d4bc: 9a894114     	csel	x20, x8, x9, mi
  b1d4c0: 8b0a0288     	add	x8, x20, x10
  b1d4c4: f9400109     	ldr	x9, [x8]
  b1d4c8: f940030a     	ldr	x10, [x24]
  b1d4cc: 79401108     	ldrh	w8, [x8, #0x8]
  b1d4d0: 7940130b     	ldrh	w11, [x24, #0x8]
  b1d4d4: eb0a013f     	cmp	x9, x10
  b1d4d8: fa4b0100     	ccmp	x8, x11, #0x0, eq
  b1d4dc: 54fff7a1     	b.ne	0xb1d3d0 <_ChromeMain+0xb18134>
  b1d4e0: 140000a4     	b	0xb1d770 <_ChromeMain+0xb184d4>
  b1d4e4: f9000748     	str	x8, [x26, #0x8]
  b1d4e8: f940035a     	ldr	x26, [x26]
  b1d4ec: 17ffffed     	b	0xb1d4a0 <_ChromeMain+0xb18204>
  b1d4f0: f9400755     	ldr	x21, [x26, #0x8]
  b1d4f4: eb150114     	subs	x20, x8, x21
  b1d4f8: 54ffff69     	b.ls	0xb1d4e4 <_ChromeMain+0xb18248>
  b1d4fc: f9400b4a     	ldr	x10, [x26, #0x10]
  b1d500: 9240f949     	and	x9, x10, #0x7fffffffffffffff
  b1d504: aa3503eb     	mvn	x11, x21
  b1d508: 8b0b012b     	add	x11, x9, x11
  b1d50c: eb14017f     	cmp	x11, x20
  b1d510: 54000303     	b.lo	0xb1d570 <_ChromeMain+0xb182d4>
  b1d514: b6fff24a     	tbz	x10, #0x3f, 0xb1d35c <_ChromeMain+0xb180c0>
  b1d518: f9400356     	ldr	x22, [x26]
  b1d51c: 17ffff91     	b	0xb1d360 <_ChromeMain+0xb180c4>
  b1d520: 92800229     	mov	x9, #-0x12              ; =-18
  b1d524: f2efffe9     	movk	x9, #0x7fff, lsl #48
  b1d528: eb09011f     	cmp	x8, x9
  b1d52c: 540011a8     	b.hi	0xb1d760 <_ChromeMain+0xb184c4>
  b1d530: 52800589     	mov	w9, #0x2c               ; =44
  b1d534: f100b11f     	cmp	x8, #0x2c
  b1d538: 9a898108     	csel	x8, x8, x9, hi
  b1d53c: 927ce908     	and	x8, x8, #0x7ffffffffffffff0
  b1d540: 91004117     	add	x23, x8, #0x10
  b1d544: aa1703e0     	mov	x0, x23
  b1d548: 97d3c788     	bl	0xf368 <_ChromeMain+0xa0cc>
  b1d54c: aa0003f6     	mov	x22, x0
  b1d550: aa1b03f5     	mov	x21, x27
  b1d554: aa1a03e1     	mov	x1, x26
  b1d558: b5000335     	cbnz	x21, 0xb1d5bc <_ChromeMain+0xb18320>
  b1d55c: 37f8047b     	tbnz	w27, #0x1f, 0xb1d5e8 <_ChromeMain+0xb1834c>
  b1d560: b24102e8     	orr	x8, x23, #0x8000000000000000
  b1d564: a900a355     	stp	x21, x8, [x26, #0x8]
  b1d568: f9000356     	str	x22, [x26]
  b1d56c: 17ffff7d     	b	0xb1d360 <_ChromeMain+0xb180c4>
  b1d570: 9280022a     	mov	x10, #-0x12             ; =-18
  b1d574: f2efffea     	movk	x10, #0x7fff, lsl #48
  b1d578: eb0a011f     	cmp	x8, x10
  b1d57c: 54000f28     	b.hi	0xb1d760 <_ChromeMain+0xb184c4>
  b1d580: d1000529     	sub	x9, x9, #0x1
  b1d584: d37ff92a     	lsl	x10, x9, #1
  b1d588: eb09051f     	cmp	x8, x9, lsl #1
  b1d58c: 9a8a8108     	csel	x8, x8, x10, hi
  b1d590: 928002ea     	mov	x10, #-0x18             ; =-24
  b1d594: f2e7ffea     	movk	x10, #0x3fff, lsl #48
  b1d598: eb0a013f     	cmp	x9, x10
  b1d59c: 54000e62     	b.hs	0xb1d768 <_ChromeMain+0xb184cc>
  b1d5a0: 927ced08     	and	x8, x8, #0xfffffffffffffff0
  b1d5a4: 91004117     	add	x23, x8, #0x10
  b1d5a8: aa1703e0     	mov	x0, x23
  b1d5ac: 97d3c76f     	bl	0xf368 <_ChromeMain+0xa0cc>
  b1d5b0: aa0003f6     	mov	x22, x0
  b1d5b4: f9400341     	ldr	x1, [x26]
  b1d5b8: 17ffffe8     	b	0xb1d558 <_ChromeMain+0xb182bc>
  b1d5bc: 8b1502c8     	add	x8, x22, x21
  b1d5c0: eb16011f     	cmp	x8, x22
  b1d5c4: 54000d03     	b.lo	0xb1d764 <_ChromeMain+0xb184c8>
  b1d5c8: eb16003f     	cmp	x1, x22
  b1d5cc: 54000063     	b.lo	0xb1d5d8 <_ChromeMain+0xb1833c>
  b1d5d0: eb08003f     	cmp	x1, x8
  b1d5d4: 54000c83     	b.lo	0xb1d764 <_ChromeMain+0xb184c8>
  b1d5d8: aa1603e0     	mov	x0, x22
  b1d5dc: aa1503e2     	mov	x2, x21
  b1d5e0: 95d3c73b     	bl	0x800f2cc <_ChromeMain+0x800a030>
  b1d5e4: 17ffffde     	b	0xb1d55c <_ChromeMain+0xb182c0>
  b1d5e8: f9400340     	ldr	x0, [x26]
  b1d5ec: f9400b48     	ldr	x8, [x26, #0x10]
  b1d5f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  b1d5f4: 97d3ae31     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  b1d5f8: 17ffffda     	b	0xb1d560 <_ChromeMain+0xb182c4>
  b1d5fc: a9007e7f     	stp	xzr, xzr, [x19]
  b1d600: b801727f     	stur	wzr, [x19, #0x17]
  b1d604: f9000a7f     	str	xzr, [x19, #0x10]
  b1d608: ad010661     	stp	q1, q1, [x19, #0x20]
  b1d60c: ad020661     	stp	q1, q1, [x19, #0x40]
  b1d610: 7900c27f     	strh	wzr, [x19, #0x60]
  b1d614: a906fe7f     	stp	xzr, xzr, [x19, #0x68]
  b1d618: 17ffff8b     	b	0xb1d444 <_ChromeMain+0xb181a8>
  b1d61c: f9403800     	ldr	x0, [x0, #0x70]
  b1d620: 39406009     	ldrb	w9, [x0, #0x18]
  b1d624: 3707d669     	tbnz	w9, #0x0, 0xb1d0f0 <_ChromeMain+0xb17e54>
  b1d628: 17fffed1     	b	0xb1d16c <_ChromeMain+0xb17ed0>
  b1d62c: d2800017     	mov	x23, #0x0               ; =0
  b1d630: 17fffebe     	b	0xb1d128 <_ChromeMain+0xb17e8c>
  b1d634: d0071f9c     	adrp	x28, 0xef0f000 <dyld_stub_binder+0xef0f000>
  b1d638: 9102439c     	add	x28, x28, #0x90
  b1d63c: f90007e0     	str	x0, [sp, #0x8]
  b1d640: aa1c03e0     	mov	x0, x28
  b1d644: aa0803f4     	mov	x20, x8
  b1d648: 95d39c9e     	bl	0x80048c0 <_ChromeMain+0x7fff624>
  b1d64c: aa1403e8     	mov	x8, x20
  b1d650: aa0003e9     	mov	x9, x0
  b1d654: f94007e0     	ldr	x0, [sp, #0x8]
  b1d658: 34ffd6c9     	cbz	w9, 0xb1d130 <_ChromeMain+0xb17e94>
  b1d65c: 6f00e400     	movi.2d	v0, #0000000000000000
  b1d660: ad078100     	stp	q0, q0, [x8, #0xf0]
  b1d664: ad068100     	stp	q0, q0, [x8, #0xd0]
  b1d668: ad058100     	stp	q0, q0, [x8, #0xb0]
  b1d66c: ad048100     	stp	q0, q0, [x8, #0x90]
  b1d670: ad038100     	stp	q0, q0, [x8, #0x70]
  b1d674: ad028100     	stp	q0, q0, [x8, #0x50]
  b1d678: ad018100     	stp	q0, q0, [x8, #0x30]
  b1d67c: ad008100     	stp	q0, q0, [x8, #0x10]
  b1d680: 3d800100     	str	q0, [x8]
  b1d684: aa0803e0     	mov	x0, x8
  b1d688: 940a6ae6     	bl	0xdb8220 <_ChromeMain+0xdb2f84>
  b1d68c: 089fff9b     	stlrb	w27, [x28]
  b1d690: d0070e60     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  b1d694: 9127c000     	add	x0, x0, #0x9f0
  b1d698: 95d39c8d     	bl	0x80048cc <_ChromeMain+0x7fff630>
  b1d69c: 35000560     	cbnz	w0, 0xb1d748 <_ChromeMain+0xb184ac>
  b1d6a0: d0071f88     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
  b1d6a4: 3942451c     	ldrb	w28, [x8, #0x91]
  b1d6a8: 3902451b     	strb	w27, [x8, #0x91]
  b1d6ac: d0070e60     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  b1d6b0: 9127c000     	add	x0, x0, #0x9f0
  b1d6b4: 95d39c94     	bl	0x8004904 <_ChromeMain+0x7fff668>
  b1d6b8: 35000380     	cbnz	w0, 0xb1d728 <_ChromeMain+0xb1848c>
  b1d6bc: f94007e0     	ldr	x0, [sp, #0x8]
  b1d6c0: aa1403e8     	mov	x8, x20
  b1d6c4: 3617d37c     	tbz	w28, #0x2, 0xb1d130 <_ChromeMain+0xb17e94>
  b1d6c8: d0070e60     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  b1d6cc: 9128c000     	add	x0, x0, #0xa30
  b1d6d0: 95d39c90     	bl	0x8004910 <_ChromeMain+0x7fff674>
  b1d6d4: aa1403e8     	mov	x8, x20
  b1d6d8: aa0003e9     	mov	x9, x0
  b1d6dc: f94007e0     	ldr	x0, [sp, #0x8]
  b1d6e0: 34ffd289     	cbz	w9, 0xb1d130 <_ChromeMain+0xb17e94>
  b1d6e4: f0069ea8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
  b1d6e8: 911c4d08     	add	x8, x8, #0x713
  b1d6ec: f90003e8     	str	x8, [sp]
  b1d6f0: f0069ea0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
  b1d6f4: 911c9c00     	add	x0, x0, #0x727
  b1d6f8: 95d39c89     	bl	0x800491c <_ChromeMain+0x7fff680>
  b1d6fc: 97d4295f     	bl	0x27c78 <_ChromeMain+0x229dc>
  b1d700: 52800a01     	mov	w1, #0x50               ; =80
  b1d704: 97d3aded     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  b1d708: f900bfff     	str	xzr, [sp, #0x178]
  b1d70c: 17ffff4c     	b	0xb1d43c <_ChromeMain+0xb181a0>
  b1d710: a940312b     	ldp	x11, x12, [x9]
  b1d714: 17fffe91     	b	0xb1d158 <_ChromeMain+0xb17ebc>
  b1d718: f0066620     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
  b1d71c: 91376000     	add	x0, x0, #0xdd8
  b1d720: 95038aed     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
  b1d724: 95d39ce8     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
  b1d728: f0069ea8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
  b1d72c: 911c4d08     	add	x8, x8, #0x713
