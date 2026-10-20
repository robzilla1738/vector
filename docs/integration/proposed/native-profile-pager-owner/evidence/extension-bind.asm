
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46331d4: d10143ff     	sub	sp, sp, #0x50
 46331d8: a90257f6     	stp	x22, x21, [sp, #0x20]
 46331dc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 46331e0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46331e4: 910103fd     	add	x29, sp, #0x40
 46331e8: aa0003f3     	mov	x19, x0
 46331ec: f9445014     	ldr	x20, [x0, #0x8a0]
 46331f0: f0052bf5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46331f4: b4000174     	cbz	x20, 0x4633220 <_ChromeMain+0x462df84>
 46331f8: f904527f     	str	xzr, [x19, #0x8a0]
 46331fc: f9444e61     	ldr	x1, [x19, #0x898]
 4633200: 91026280     	add	x0, x20, #0x98
 4633204: 9747995d     	bl	0x1819778 <_ChromeMain+0x18144dc>
 4633208: 925e7688     	and	x8, x20, #0xfffffffc00000000
 463320c: f94046a9     	ldr	x9, [x21, #0x88]
 4633210: eb09011f     	cmp	x8, x9
 4633214: 54000061     	b.ne	0x4633220 <_ChromeMain+0x462df84>
 4633218: aa1403e0     	mov	x0, x20
 463321c: 96e7be08     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4633220: 3922427f     	strb	wzr, [x19, #0x890]
 4633224: f9422e68     	ldr	x8, [x19, #0x458]
 4633228: b4000668     	cbz	x8, 0x46332f4 <_ChromeMain+0x462e058>
 463322c: f9429d08     	ldr	x8, [x8, #0x538]
 4633230: f9403500     	ldr	x0, [x8, #0x68]
 4633234: 9741b98e     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 4633238: b40005e0     	cbz	x0, 0x46332f4 <_ChromeMain+0x462e058>
 463323c: aa0003f4     	mov	x20, x0
 4633240: 52800600     	mov	w0, #0x30               ; =48
 4633244: 96e77049     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633248: f90007e0     	str	x0, [sp, #0x8]
 463324c: 9004c848     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4633250: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 4633254: 3c8103e0     	stur	q0, [sp, #0x10]
 4633258: 91008009     	add	x9, x0, #0x20
 463325c: eb00013f     	cmp	x9, x0
 4633260: 54000543     	b.lo	0x4633308 <_ChromeMain+0x462e06c>
 4633264: b00440a8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 4633268: 91252508     	add	x8, x8, #0x949
 463326c: eb08013f     	cmp	x9, x8
 4633270: fa488002     	ccmp	x0, x8, #0x2, hi
 4633274: 540004a9     	b.ls	0x4633308 <_ChromeMain+0x462e06c>
 4633278: ad400500     	ldp	q0, q1, [x8]
 463327c: ad000400     	stp	q0, q1, [x0]
 4633280: 3900801f     	strb	wzr, [x0, #0x20]
 4633284: 910023e1     	add	x1, sp, #0x8
 4633288: aa1403e0     	mov	x0, x20
 463328c: 528003e2     	mov	w2, #0x1f               ; =31
 4633290: 976a49e3     	bl	0x20c5a1c <_ChromeMain+0x20c0780>
 4633294: f100001f     	cmp	x0, #0x0
 4633298: 1a9f07e8     	cset	w8, ne
 463329c: 39224268     	strb	w8, [x19, #0x890]
 46332a0: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 46332a4: 36f800a8     	tbz	w8, #0x1f, 0x46332b8 <_ChromeMain+0x462e01c>
 46332a8: f94007e0     	ldr	x0, [sp, #0x8]
 46332ac: f9400fe8     	ldr	x8, [sp, #0x18]
 46332b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46332b4: 96e75701     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46332b8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46332bc: f94046a9     	ldr	x9, [x21, #0x88]
 46332c0: eb09011f     	cmp	x8, x9
 46332c4: 54000061     	b.ne	0x46332d0 <_ChromeMain+0x462e034>
 46332c8: aa1403e0     	mov	x0, x20
 46332cc: 96e7840c     	bl	0x142fc <_ChromeMain+0xf060>
 46332d0: f9445260     	ldr	x0, [x19, #0x8a0]
 46332d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46332d8: f94046a9     	ldr	x9, [x21, #0x88]
 46332dc: eb09011f     	cmp	x8, x9
 46332e0: 54000160     	b.eq	0x463330c <_ChromeMain+0x462e070>
 46332e4: f9045274     	str	x20, [x19, #0x8a0]
 46332e8: f9444e61     	ldr	x1, [x19, #0x898]
 46332ec: 91026280     	add	x0, x20, #0x98
 46332f0: 97402a95     	bl	0x163dd44 <_ChromeMain+0x1638aa8>
 46332f4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46332f8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46332fc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4633300: 910143ff     	add	sp, sp, #0x50
 4633304: d65f03c0     	ret
 4633308: d4200020     	brk	#0x1
 463330c: 96e7bdcc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4633310: 17fffff5     	b	0x46332e4 <_ChromeMain+0x462e048>
 4633314: d503201f     	nop
 4633318: d503201f     	nop
 463331c: d503201f     	nop
 4633320: d503201f     	nop
 4633324: d503201f     	nop
 4633328: d503201f     	nop
 463332c: d503201f     	nop
 4633330: d503201f     	nop
 4633334: d503201f     	nop
 4633338: d503201f     	nop
 463333c: d503201f     	nop
 4633340: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4633344: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4633348: 910043fd     	add	x29, sp, #0x10
 463334c: aa0103f4     	mov	x20, x1
 4633350: aa0003f3     	mov	x19, x0
 4633354: 39631008     	ldrb	w8, [x0, #0x8c4]
 4633358: 39424029     	ldrb	w9, [x1, #0x90]
 463335c: 6b09011f     	cmp	w8, w9
 4633360: 540000c0     	b.eq	0x4633378 <_ChromeMain+0x462e0dc>
 4633364: f9442668     	ldr	x8, [x19, #0x848]
 4633368: f9404901     	ldr	x1, [x8, #0x90]
 463336c: aa1303e0     	mov	x0, x19
 4633370: 940057cc     	bl	0x46492a0 <_ChromeMain+0x4644004>
 4633374: 39424288     	ldrb	w8, [x20, #0x90]
 4633378: 37000188     	tbnz	w8, #0x0, 0x46333a8 <_ChromeMain+0x462e10c>
 463337c: 91250260     	add	x0, x19, #0x940
 4633380: 9703ece6     	bl	0x72e718 <_ChromeMain+0x72947c>
 4633384: 91268260     	add	x0, x19, #0x9a0
 4633388: 9703ece4     	bl	0x72e718 <_ChromeMain+0x72947c>
 463338c: 7914167f     	strh	wzr, [x19, #0xa0a]
 4633390: 3928327f     	strb	wzr, [x19, #0xa0c]
 4633394: 39682268     	ldrb	w8, [x19, #0xa08]
 4633398: 34000088     	cbz	w8, 0x46333a8 <_ChromeMain+0x462e10c>
 463339c: 3928227f     	strb	wzr, [x19, #0xa08]
 46333a0: aa1303e0     	mov	x0, x19
 46333a4: 979d8443     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 46333a8: aa1303e0     	mov	x0, x19
 46333ac: 52800021     	mov	w1, #0x1                ; =1
 46333b0: 94005d44     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 46333b4: 39424288     	ldrb	w8, [x20, #0x90]
 46333b8: 528000a9     	mov	w9, #0x5                ; =5
 46333bc: 5280004a     	mov	w10, #0x2               ; =2
 46333c0: 7100011f     	cmp	w8, #0x0
 46333c4: 1a891148     	csel	w8, w10, w9, ne
 46333c8: b9083e68     	str	w8, [x19, #0x83c]
 46333cc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46333d0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46333d4: d65f03c0     	ret
 46333d8: f9442401     	ldr	x1, [x0, #0x848]
 46333dc: 17ffffd9     	b	0x4633340 <_ChromeMain+0x462e0a4>
 46333e0: d101c3ff     	sub	sp, sp, #0x70
 46333e4: a9016ffc     	stp	x28, x27, [sp, #0x10]
 46333e8: a90267fa     	stp	x26, x25, [sp, #0x20]
 46333ec: a9035ff8     	stp	x24, x23, [sp, #0x30]
 46333f0: a90457f6     	stp	x22, x21, [sp, #0x40]
 46333f4: a9054ff4     	stp	x20, x19, [sp, #0x50]
 46333f8: a9067bfd     	stp	x29, x30, [sp, #0x60]
 46333fc: 910183fd     	add	x29, sp, #0x60
 4633400: b4000de1     	cbz	x1, 0x46335bc <_ChromeMain+0x462e320>
 4633404: aa0003f3     	mov	x19, x0
 4633408: b9401037     	ldr	w23, [x1, #0x10]
 463340c: b9000ff7     	str	w23, [sp, #0xc]
 4633410: f9402034     	ldr	x20, [x1, #0x40]
 4633414: 52821818     	mov	w24, #0x10c0            ; =4288
 4633418: b4000cd4     	cbz	x20, 0x46335b0 <_ChromeMain+0x462e314>
 463341c: f9486269     	ldr	x9, [x19, #0x10c0]
 4633420: f948666a     	ldr	x10, [x19, #0x10c8]
 4633424: d37ced48     	lsl	x8, x10, #4
 4633428: b4000b88     	cbz	x8, 0x4633598 <_ChromeMain+0x462e2fc>
 463342c: 9344fd0b     	asr	x11, x8, #4
 4633430: aa0903e8     	mov	x8, x9
 4633434: d341fd6c     	lsr	x12, x11, #1
 4633438: 8b0c110d     	add	x13, x8, x12, lsl #4
 463343c: b84105ae     	ldr	w14, [x13], #0x10
 4633440: aa6b07ef     	mvn	x15, x11, lsr #1
 4633444: 8b0f016b     	add	x11, x11, x15
 4633448: 6b1701df     	cmp	w14, w23
 463344c: 9a8cb16b     	csel	x11, x11, x12, lt
 4633450: 9a88b1a8     	csel	x8, x13, x8, lt
 4633454: b5ffff0b     	cbnz	x11, 0x4633434 <_ChromeMain+0x462e198>
 4633458: 8b0a1129     	add	x9, x9, x10, lsl #4
 463345c: eb09011f     	cmp	x8, x9
 4633460: 54000100     	b.eq	0x4633480 <_ChromeMain+0x462e1e4>
 4633464: b9400109     	ldr	w9, [x8]
 4633468: 6b0902ff     	cmp	w23, w9
 463346c: 540000ab     	b.lt	0x4633480 <_ChromeMain+0x462e1e4>
 4633470: f9400508     	ldr	x8, [x8, #0x8]
 4633474: f9400d08     	ldr	x8, [x8, #0x18]
 4633478: eb14011f     	cmp	x8, x20
 463347c: 54000a00     	b.eq	0x46335bc <_ChromeMain+0x462e320>
 4633480: f94a0679     	ldr	x25, [x19, #0x1408]
 4633484: b40000d9     	cbz	x25, 0x463349c <_ChromeMain+0x462e200>
 4633488: 52800028     	mov	w8, #0x1                ; =1
 463348c: b8280328     	ldadd	w8, w8, [x25]
 4633490: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4633494: 6b09011f     	cmp	w8, w9
 4633498: 540019e0     	b.eq	0x46337d4 <_ChromeMain+0x462e538>
 463349c: f94a0a7a     	ldr	x26, [x19, #0x1410]
 46334a0: 52800700     	mov	w0, #0x38               ; =56
 46334a4: 96e76fb1     	bl	0xf368 <_ChromeMain+0xa0cc>
 46334a8: aa0003f5     	mov	x21, x0
 46334ac: aa1403e1     	mov	x1, x20
 46334b0: 97543ff9     	bl	0x1b43494 <_ChromeMain+0x1b3e1f8>
 46334b4: d004f6b6     	adrp	x22, 0xe509000 <dyld_stub_binder+0xe509000>
 46334b8: 910862d6     	add	x22, x22, #0x218
 46334bc: f9000016     	str	x22, [x0]
 46334c0: b9002017     	str	w23, [x0, #0x20]
 46334c4: a902e819     	stp	x25, x26, [x0, #0x28]
 46334c8: f9486279     	ldr	x25, [x19, #0x10c0]
 46334cc: f9486669     	ldr	x9, [x19, #0x10c8]
 46334d0: d37ced28     	lsl	x8, x9, #4
 46334d4: b4000668     	cbz	x8, 0x46335a0 <_ChromeMain+0x462e304>
 46334d8: 9344fd0a     	asr	x10, x8, #4
 46334dc: aa1903f4     	mov	x20, x25
 46334e0: d341fd4b     	lsr	x11, x10, #1
 46334e4: 8b0b128c     	add	x12, x20, x11, lsl #4
 46334e8: b841058d     	ldr	w13, [x12], #0x10
 46334ec: aa6a07ee     	mvn	x14, x10, lsr #1
 46334f0: 8b0e014a     	add	x10, x10, x14
 46334f4: 6b1701bf     	cmp	w13, w23
 46334f8: 9a8bb14a     	csel	x10, x10, x11, lt
 46334fc: 9a94b194     	csel	x20, x12, x20, lt
 4633500: b5ffff0a     	cbnz	x10, 0x46334e0 <_ChromeMain+0x462e244>
 4633504: 8b09132a     	add	x10, x25, x9, lsl #4
 4633508: eb0a029f     	cmp	x20, x10
 463350c: 54000080     	b.eq	0x463351c <_ChromeMain+0x462e280>
 4633510: b940028a     	ldr	w10, [x20]
 4633514: 6b0a02ff     	cmp	w23, w10
 4633518: 5400072a     	b.ge	0x46335fc <_ChromeMain+0x462e360>
 463351c: cb19029a     	sub	x26, x20, x25
 4633520: f9486a6a     	ldr	x10, [x19, #0x10d0]
 4633524: eb0a013f     	cmp	x9, x10
 4633528: 54000801     	b.ne	0x4633628 <_ChromeMain+0x462e38c>
 463352c: 91000528     	add	x8, x9, #0x1
 4633530: d37cfd0a     	lsr	x10, x8, #60
 4633534: b500156a     	cbnz	x10, 0x46337e0 <_ChromeMain+0x462e544>
 4633538: d37ff92a     	lsl	x10, x9, #1
 463353c: eb08015f     	cmp	x10, x8
 4633540: 9a888158     	csel	x24, x10, x8, hi
 4633544: 92ff0008     	mov	x8, #0x7ffffffffffffff  ; =576460752303423487
 4633548: 92fe000a     	mov	x10, #0xfffffffffffffff ; =1152921504606846975
 463354c: eb08013f     	cmp	x9, x8
 4633550: 9a8a331c     	csel	x28, x24, x10, lo
 4633554: b40002bc     	cbz	x28, 0x46335a8 <_ChromeMain+0x462e30c>
 4633558: d37cff88     	lsr	x8, x28, #60
 463355c: b5001448     	cbnz	x8, 0x46337e4 <_ChromeMain+0x462e548>
 4633560: d37cef80     	lsl	x0, x28, #4
 4633564: 96e76f81     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633568: aa0003f6     	mov	x22, x0
 463356c: 8b1a02db     	add	x27, x22, x26
 4633570: eb9a139f     	cmp	x28, x26, asr #4
 4633574: 54000a01     	b.ne	0x46336b4 <_ChromeMain+0x462e418>
 4633578: eb19029f     	cmp	x20, x25
 463357c: 54000e00     	b.eq	0x463373c <_ChromeMain+0x462e4a0>
 4633580: d37df388     	lsl	x8, x28, #3
 4633584: 91002108     	add	x8, x8, #0x8
 4633588: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 463358c: cb080379     	sub	x25, x27, x8
 4633590: aa1903fb     	mov	x27, x25
 4633594: 1400004a     	b	0x46336bc <_ChromeMain+0x462e420>
 4633598: aa0903e8     	mov	x8, x9
 463359c: 17ffffaf     	b	0x4633458 <_ChromeMain+0x462e1bc>
 46335a0: aa1903f4     	mov	x20, x25
 46335a4: 17ffffd8     	b	0x4633504 <_ChromeMain+0x462e268>
 46335a8: d2800016     	mov	x22, #0x0               ; =0
 46335ac: 17fffff0     	b	0x463356c <_ChromeMain+0x462e2d0>
 46335b0: 8b180260     	add	x0, x19, x24
 46335b4: 910033e1     	add	x1, sp, #0xc
 46335b8: 94006b4b     	bl	0x464e2e4 <_ChromeMain+0x4649048>
 46335bc: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 46335c0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 46335c4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 46335c8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 46335cc: a94267fa     	ldp	x26, x25, [sp, #0x20]
 46335d0: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 46335d4: 9101c3ff     	add	sp, sp, #0x70
 46335d8: d65f03c0     	ret
 46335dc: 8b08032c     	add	x12, x25, x8
 46335e0: cb19018a     	sub	x10, x12, x25
 46335e4: 9344fd4a     	asr	x10, x10, #4
 46335e8: f908666a     	str	x10, [x19, #0x10c8]
 46335ec: 9100434a     	add	x10, x26, #0x10
 46335f0: eb0a011f     	cmp	x8, x10
 46335f4: 54000bc1     	b.ne	0x463376c <_ChromeMain+0x462e4d0>
 46335f8: b9000297     	str	w23, [x20]
 46335fc: f9400693     	ldr	x19, [x20, #0x8]
 4633600: f9000695     	str	x21, [x20, #0x8]
 4633604: b4fffdd3     	cbz	x19, 0x46335bc <_ChromeMain+0x462e320>
 4633608: f9000276     	str	x22, [x19]
 463360c: f9401660     	ldr	x0, [x19, #0x28]
 4633610: b5000440     	cbnz	x0, 0x4633698 <_ChromeMain+0x462e3fc>
 4633614: aa1303e0     	mov	x0, x19
 4633618: 973018e9     	bl	0x12399bc <_ChromeMain+0x1234720>
 463361c: 52800701     	mov	w1, #0x38               ; =56
 4633620: 96e75626     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4633624: 17ffffe6     	b	0x46335bc <_ChromeMain+0x462e320>
 4633628: 8b08032a     	add	x10, x25, x8
 463362c: eb0a029f     	cmp	x20, x10
 4633630: 54000220     	b.eq	0x4633674 <_ChromeMain+0x462e3d8>
 4633634: d1004149     	sub	x9, x10, #0x10
 4633638: eb0a013f     	cmp	x9, x10
 463363c: 54fffd02     	b.hs	0x46335dc <_ChromeMain+0x462e340>
 4633640: aa0a03eb     	mov	x11, x10
 4633644: b4000ccb     	cbz	x11, 0x46337dc <_ChromeMain+0x462e540>
 4633648: b85f016c     	ldur	w12, [x11, #-0x10]
 463364c: b900016c     	str	w12, [x11]
 4633650: f85f816c     	ldur	x12, [x11, #-0x8]
 4633654: f81f817f     	stur	xzr, [x11, #-0x8]
 4633658: f900056c     	str	x12, [x11, #0x8]
 463365c: 9100416c     	add	x12, x11, #0x10
 4633660: eb0a017f     	cmp	x11, x10
 4633664: aa0c03eb     	mov	x11, x12
 4633668: 54fffee3     	b.lo	0x4633644 <_ChromeMain+0x462e3a8>
 463366c: f8786a79     	ldr	x25, [x19, x24]
 4633670: 17ffffdc     	b	0x46335e0 <_ChromeMain+0x462e344>
 4633674: b4000b54     	cbz	x20, 0x46337dc <_ChromeMain+0x462e540>
 4633678: b9000297     	str	w23, [x20]
 463367c: f9000695     	str	x21, [x20, #0x8]
 4633680: f9486268     	ldr	x8, [x19, #0x10c0]
 4633684: cb080288     	sub	x8, x20, x8
 4633688: 91004108     	add	x8, x8, #0x10
 463368c: 9344fd08     	asr	x8, x8, #4
 4633690: f9086668     	str	x8, [x19, #0x10c8]
 4633694: 17ffffca     	b	0x46335bc <_ChromeMain+0x462e320>
 4633698: 12800008     	mov	w8, #-0x1               ; =-1
 463369c: b8e80008     	ldaddal	w8, w8, [x0]
 46336a0: 7100051f     	cmp	w8, #0x1
 46336a4: 54fffb81     	b.ne	0x4633614 <_ChromeMain+0x462e378>
 46336a8: 52800101     	mov	w1, #0x8                ; =8
 46336ac: 96e75603     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46336b0: 17ffffd9     	b	0x4633614 <_ChromeMain+0x462e378>
 46336b4: aa1c03f8     	mov	x24, x28
 46336b8: aa1b03f9     	mov	x25, x27
 46336bc: b400091b     	cbz	x27, 0x46337dc <_ChromeMain+0x462e540>
 46336c0: b9000377     	str	w23, [x27]
 46336c4: f9000775     	str	x21, [x27, #0x8]
 46336c8: 91004360     	add	x0, x27, #0x10
 46336cc: cb190016     	sub	x22, x0, x25
 46336d0: f9486268     	ldr	x8, [x19, #0x10c0]
 46336d4: f9486669     	ldr	x9, [x19, #0x10c8]
 46336d8: 8b091108     	add	x8, x8, x9, lsl #4
 46336dc: cb140115     	sub	x21, x8, x20
 46336e0: aa1403e1     	mov	x1, x20
 46336e4: aa1503e2     	mov	x2, x21
 46336e8: 94e75984     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 46336ec: 9344fea8     	asr	x8, x21, #4
 46336f0: 8b961116     	add	x22, x8, x22, asr #4
 46336f4: f9486668     	ldr	x8, [x19, #0x10c8]
 46336f8: cb951108     	sub	x8, x8, x21, asr #4
 46336fc: f9086668     	str	x8, [x19, #0x10c8]
 4633700: cb081335     	sub	x21, x25, x8, lsl #4
 4633704: f9486261     	ldr	x1, [x19, #0x10c0]
 4633708: cb010282     	sub	x2, x20, x1
 463370c: aa1503e0     	mov	x0, x21
 4633710: 94e7597a     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4633714: f9486668     	ldr	x8, [x19, #0x10c8]
 4633718: 8b0802c8     	add	x8, x22, x8
 463371c: f9486260     	ldr	x0, [x19, #0x10c0]
 4633720: f9086275     	str	x21, [x19, #0x10c0]
 4633724: f9086668     	str	x8, [x19, #0x10c8]
 4633728: f9486a68     	ldr	x8, [x19, #0x10d0]
 463372c: f9086a78     	str	x24, [x19, #0x10d0]
 4633730: b4fff460     	cbz	x0, 0x46335bc <_ChromeMain+0x462e320>
 4633734: d37ced01     	lsl	x1, x8, #4
 4633738: 17ffffba     	b	0x4633620 <_ChromeMain+0x462e384>
 463373c: d37ffb88     	lsl	x8, x28, #1
 4633740: f100051f     	cmp	x8, #0x1
 4633744: 9a9f8518     	csinc	x24, x8, xzr, hi
 4633748: d37cef00     	lsl	x0, x24, #4
 463374c: 96e76f07     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633750: d342ff08     	lsr	x8, x24, #2
 4633754: 8b081019     	add	x25, x0, x8, lsl #4
 4633758: b4fffb36     	cbz	x22, 0x46336bc <_ChromeMain+0x462e420>
 463375c: d37cef81     	lsl	x1, x28, #4
 4633760: aa1603e0     	mov	x0, x22
 4633764: 96e755d5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4633768: 17ffffd5     	b	0x46336bc <_ChromeMain+0x462e420>
 463376c: 12800018     	mov	w24, #-0x1              ; =-1
 4633770: aa0903f9     	mov	x25, x9
 4633774: 1400000a     	b	0x463379c <_ChromeMain+0x462e500>
 4633778: 52800101     	mov	w1, #0x8                ; =8
 463377c: 96e755cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4633780: aa1303e0     	mov	x0, x19
 4633784: 9730188e     	bl	0x12399bc <_ChromeMain+0x1234720>
 4633788: 52800701     	mov	w1, #0x38               ; =56
 463378c: 96e755cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4633790: aa1903e9     	mov	x9, x25
 4633794: eb14033f     	cmp	x25, x20
 4633798: 54fff300     	b.eq	0x46335f8 <_ChromeMain+0x462e35c>
 463379c: b85f0f28     	ldr	w8, [x25, #-0x10]!
 46337a0: b9000128     	str	w8, [x9]
 46337a4: f85f8128     	ldur	x8, [x9, #-0x8]
 46337a8: f81f813f     	stur	xzr, [x9, #-0x8]
 46337ac: f9400533     	ldr	x19, [x9, #0x8]
 46337b0: f9000528     	str	x8, [x9, #0x8]
 46337b4: b4fffef3     	cbz	x19, 0x4633790 <_ChromeMain+0x462e4f4>
 46337b8: f9000276     	str	x22, [x19]
 46337bc: f9401660     	ldr	x0, [x19, #0x28]
 46337c0: b4fffe00     	cbz	x0, 0x4633780 <_ChromeMain+0x462e4e4>
 46337c4: b8f80008     	ldaddal	w24, w8, [x0]
 46337c8: 7100051f     	cmp	w8, #0x1
 46337cc: 54fffd60     	b.eq	0x4633778 <_ChromeMain+0x462e4dc>
 46337d0: 17ffffec     	b	0x4633780 <_ChromeMain+0x462e4e4>
 46337d4: d4200000     	brk	#0
 46337d8: d4400000     	hlt	#0
 46337dc: d4200020     	brk	#0x1
 46337e0: 94162a08     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 46337e4: 94174a0f     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 46337e8: d503201f     	nop
 46337ec: d503201f     	nop
 46337f0: d503201f     	nop
 46337f4: d503201f     	nop
 46337f8: d503201f     	nop
 46337fc: d503201f     	nop
