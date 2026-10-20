
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46492a0: d101c3ff     	sub	sp, sp, #0x70
 46492a4: a9035ff8     	stp	x24, x23, [sp, #0x30]
 46492a8: a90457f6     	stp	x22, x21, [sp, #0x40]
 46492ac: a9054ff4     	stp	x20, x19, [sp, #0x50]
 46492b0: a9067bfd     	stp	x29, x30, [sp, #0x60]
 46492b4: 910183fd     	add	x29, sp, #0x60
 46492b8: aa0003f3     	mov	x19, x0
 46492bc: 911d7016     	add	x22, x0, #0x75c
 46492c0: 3945a2d7     	ldrb	w23, [x22, #0x168]
 46492c4: f900b6c1     	str	x1, [x22, #0x168]
 46492c8: 6b2102ff     	cmp	w23, w1, uxtb
 46492cc: 54000161     	b.ne	0x46492f8 <_ChromeMain+0x464405c>
 46492d0: 37000061     	tbnz	w1, #0x0, 0x46492dc <_ChromeMain+0x4644040>
 46492d4: 39738268     	ldrb	w8, [x19, #0xce0]
 46492d8: 36001d48     	tbz	w8, #0x0, 0x4649680 <_ChromeMain+0x46443e4>
 46492dc: 393de27f     	strb	wzr, [x19, #0xf78]
 46492e0: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 46492e4: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 46492e8: a94457f6     	ldp	x22, x21, [sp, #0x40]
 46492ec: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 46492f0: 9101c3ff     	add	sp, sp, #0x70
 46492f4: d65f03c0     	ret
 46492f8: 39683268     	ldrb	w8, [x19, #0xa0c]
 46492fc: 6a17011f     	tst	w8, w23
 4649300: 1a9f17e8     	cset	w8, eq
 4649304: 2a010108     	orr	w8, w8, w1
 4649308: 36001868     	tbz	w8, #0x0, 0x4649614 <_ChromeMain+0x4644378>
 464930c: f9423e60     	ldr	x0, [x19, #0x478]
 4649310: b4000060     	cbz	x0, 0x464931c <_ChromeMain+0x4644080>
 4649314: 52800021     	mov	w1, #0x1                ; =1
 4649318: 94c987b8     	bl	0x78ab1f8 <_ChromeMain+0x78a5f5c>
 464931c: f942da68     	ldr	x8, [x19, #0x5b0]
 4649320: b4000068     	cbz	x8, 0x464932c <_ChromeMain+0x4644090>
 4649324: f941a114     	ldr	x20, [x8, #0x340]
 4649328: b5002914     	cbnz	x20, 0x4649848 <_ChromeMain+0x46445ac>
 464932c: 34000097     	cbz	w23, 0x464933c <_ChromeMain+0x46440a0>
 4649330: 3945a2c8     	ldrb	w8, [x22, #0x168]
 4649334: 52000108     	eor	w8, w8, #0x1
 4649338: 14000002     	b	0x4649340 <_ChromeMain+0x46440a4>
 464933c: 52800008     	mov	w8, #0x0                ; =0
 4649340: 12000108     	and	w8, w8, #0x1
 4649344: 393de268     	strb	w8, [x19, #0xf78]
 4649348: f9435660     	ldr	x0, [x19, #0x6a8]
 464934c: b4000460     	cbz	x0, 0x46493d8 <_ChromeMain+0x464413c>
 4649350: 39683268     	ldrb	w8, [x19, #0xa0c]
 4649354: 350001c8     	cbnz	w8, 0x464938c <_ChromeMain+0x46440f0>
 4649358: b948ca68     	ldr	w8, [x19, #0x8c8]
 464935c: 14000011     	b	0x46493a0 <_ChromeMain+0x4644104>
 4649360: eb0a013f     	cmp	x9, x10
 4649364: 54002ea0     	b.eq	0x4649938 <_ChromeMain+0x464469c>
 4649368: f9401929     	ldr	x9, [x9, #0x30]
 464936c: b4000309     	cbz	x9, 0x46493cc <_ChromeMain+0x4644130>
 4649370: b940052a     	ldr	w10, [x9, #0x4]
 4649374: b9400d29     	ldr	w9, [x9, #0xc]
 4649378: 0b0a0129     	add	w9, w9, w10
 464937c: 14000014     	b	0x46493cc <_ChromeMain+0x4644130>
 4649380: f9400129     	ldr	x9, [x9]
 4649384: b5000189     	cbnz	x9, 0x46493b4 <_ChromeMain+0x4644118>
 4649388: 14000011     	b	0x46493cc <_ChromeMain+0x4644130>
 464938c: f9442668     	ldr	x8, [x19, #0x848]
 4649390: b9409508     	ldr	w8, [x8, #0x94]
 4649394: 52802309     	mov	w9, #0x118              ; =280
 4649398: 7104611f     	cmp	w8, #0x118
 464939c: 1a89c108     	csel	w8, w8, w9, gt
 46493a0: aa0003ea     	mov	x10, x0
 46493a4: f84e8d49     	ldr	x9, [x10, #0xe8]!
 46493a8: b4000129     	cbz	x9, 0x46493cc <_ChromeMain+0x4644130>
 46493ac: 90051deb     	adrp	x11, 0xea05000 <dyld_stub_binder+0xea05000>
 46493b0: 9112216b     	add	x11, x11, #0x488
 46493b4: f940112c     	ldr	x12, [x9, #0x20]
 46493b8: eb0b019f     	cmp	x12, x11
 46493bc: 54fffe28     	b.hi	0x4649380 <_ChromeMain+0x46440e4>
 46493c0: 54fffd02     	b.hs	0x4649360 <_ChromeMain+0x46440c4>
 46493c4: f9400529     	ldr	x9, [x9, #0x8]
 46493c8: b5ffff69     	cbnz	x9, 0x46493b4 <_ChromeMain+0x4644118>
 46493cc: 4b090108     	sub	w8, w8, w9
 46493d0: b2600101     	orr	x1, x8, #0x100000000
 46493d4: 97fef42b     	bl	0x4606480 <_ChromeMain+0x46011e4>
 46493d8: f942d660     	ldr	x0, [x19, #0x5a8]
 46493dc: b4000820     	cbz	x0, 0x46494e0 <_ChromeMain+0x4644244>
 46493e0: 395e9268     	ldrb	w8, [x19, #0x7a4]
 46493e4: 370007e8     	tbnz	w8, #0x0, 0x46494e0 <_ChromeMain+0x4644244>
 46493e8: 52800028     	mov	w8, #0x1                ; =1
 46493ec: 391e9268     	strb	w8, [x19, #0x7a4]
 46493f0: 39472008     	ldrb	w8, [x0, #0x1c8]
 46493f4: 340005a8     	cbz	w8, 0x46494a8 <_ChromeMain+0x464420c>
 46493f8: b941c008     	ldr	w8, [x0, #0x1c0]
 46493fc: 34000568     	cbz	w8, 0x46494a8 <_ChromeMain+0x464420c>
 4649400: b941c409     	ldr	w9, [x0, #0x1c4]
 4649404: 34000529     	cbz	w9, 0x46494a8 <_ChromeMain+0x464420c>
 4649408: b941c26a     	ldr	w10, [x19, #0x1c0]
 464940c: 7100055f     	cmp	w10, #0x1
 4649410: 540004cb     	b.lt	0x46494a8 <_ChromeMain+0x464420c>
 4649414: f942ce6a     	ldr	x10, [x19, #0x598]
 4649418: 6f00e400     	movi.2d	v0, #0000000000000000
 464941c: b40000ca     	cbz	x10, 0x4649434 <_ChromeMain+0x4644198>
 4649420: f940c54b     	ldr	x11, [x10, #0x188]
 4649424: eb0b001f     	cmp	x0, x11
 4649428: 54000061     	b.ne	0x4649434 <_ChromeMain+0x4644198>
 464942c: 9106e14a     	add	x10, x10, #0x1b8
 4649430: 3dc00140     	ldr	q0, [x10]
 4649434: f942f26b     	ldr	x11, [x19, #0x5e0]
 4649438: 6f00e401     	movi.2d	v1, #0000000000000000
 464943c: b4001d4b     	cbz	x11, 0x46497e4 <_ChromeMain+0x4644548>
 4649440: fd40dd62     	ldr	d2, [x11, #0x1b8]
 4649444: b941c16c     	ldr	w12, [x11, #0x1c0]
 4649448: b941c56a     	ldr	w10, [x11, #0x1c4]
 464944c: 3947216b     	ldrb	w11, [x11, #0x1c8]
 4649450: fd40dc03     	ldr	d3, [x0, #0x1b8]
 4649454: f942d26d     	ldr	x13, [x19, #0x5a0]
 4649458: b40000cd     	cbz	x13, 0x4649470 <_ChromeMain+0x46441d4>
 464945c: f940c5ae     	ldr	x14, [x13, #0x188]
 4649460: eb0e001f     	cmp	x0, x14
 4649464: 54000061     	b.ne	0x4649470 <_ChromeMain+0x46441d4>
 4649468: 9106e1ad     	add	x13, x13, #0x1b8
 464946c: 3dc001a1     	ldr	q1, [x13]
 4649470: 395e826d     	ldrb	w13, [x19, #0x7a0]
 4649474: fd0002c3     	str	d3, [x22]
 4649478: b9076668     	str	w8, [x19, #0x764]
 464947c: b9076a69     	str	w9, [x19, #0x768]
 4649480: 3d8006c0     	str	q0, [x22, #0x10]
 4649484: fd0012c2     	str	d2, [x22, #0x20]
 4649488: b907866c     	str	w12, [x19, #0x784]
 464948c: 3700008d     	tbnz	w13, #0x0, 0x464949c <_ChromeMain+0x4644200>
 4649490: 911e7668     	add	x8, x19, #0x79d
 4649494: 52a02009     	mov	w9, #0x1000000          ; =16777216
 4649498: b9000109     	str	w9, [x8]
 464949c: b9078a6a     	str	w10, [x19, #0x788]
 46494a0: 3d800ec1     	str	q1, [x22, #0x30]
 46494a4: 391e726b     	strb	w11, [x19, #0x79c]
 46494a8: 395e8268     	ldrb	w8, [x19, #0x7a0]
 46494ac: 340001a8     	cbz	w8, 0x46494e0 <_ChromeMain+0x4644244>
 46494b0: f9400008     	ldr	x8, [x0]
 46494b4: f9405108     	ldr	x8, [x8, #0xa0]
 46494b8: 52800021     	mov	w1, #0x1                ; =1
 46494bc: d63f0100     	blr	x8
 46494c0: f942f260     	ldr	x0, [x19, #0x5e0]
 46494c4: b40000e0     	cbz	x0, 0x46494e0 <_ChromeMain+0x4644244>
 46494c8: 395e8268     	ldrb	w8, [x19, #0x7a0]
 46494cc: 36002228     	tbz	w8, #0x0, 0x4649910 <_ChromeMain+0x4644674>
 46494d0: 395e7261     	ldrb	w1, [x19, #0x79c]
 46494d4: f9400008     	ldr	x8, [x0]
 46494d8: f9405108     	ldr	x8, [x8, #0xa0]
 46494dc: d63f0100     	blr	x8
 46494e0: 39631261     	ldrb	w1, [x19, #0x8c4]
 46494e4: 91334260     	add	x0, x19, #0xcd0
 46494e8: 9775551f     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46494ec: f9422e68     	ldr	x8, [x19, #0x458]
 46494f0: f9429d08     	ldr	x8, [x8, #0x538]
 46494f4: 9100a109     	add	x9, x8, #0x28
 46494f8: f100011f     	cmp	x8, #0x0
 46494fc: 9a8903e9     	csel	x9, xzr, x9, eq
 4649500: f940b128     	ldr	x8, [x9, #0x160]
 4649504: b4000308     	cbz	x8, 0x4649564 <_ChromeMain+0x46442c8>
 4649508: 91058129     	add	x9, x9, #0x160
 464950c: d005118a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4649510: 9108614a     	add	x10, x10, #0x218
 4649514: 1400000e     	b	0x464954c <_ChromeMain+0x46442b0>
 4649518: eb09011f     	cmp	x8, x9
 464951c: 54000240     	b.eq	0x4649564 <_ChromeMain+0x46442c8>
 4649520: f9401514     	ldr	x20, [x8, #0x28]
 4649524: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4649528: b0052b49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464952c: f9404529     	ldr	x9, [x9, #0x88]
 4649530: eb09011f     	cmp	x8, x9
 4649534: 540001a1     	b.ne	0x4649568 <_ChromeMain+0x46442cc>
 4649538: aa1403e0     	mov	x0, x20
 464953c: 96e72b70     	bl	0x142fc <_ChromeMain+0xf060>
 4649540: 1400000a     	b	0x4649568 <_ChromeMain+0x46442cc>
 4649544: f9400108     	ldr	x8, [x8]
 4649548: b40000e8     	cbz	x8, 0x4649564 <_ChromeMain+0x46442c8>
 464954c: f940110b     	ldr	x11, [x8, #0x20]
 4649550: eb0a017f     	cmp	x11, x10
 4649554: 54ffff88     	b.hi	0x4649544 <_ChromeMain+0x46442a8>
 4649558: 54fffe00     	b.eq	0x4649518 <_ChromeMain+0x464427c>
 464955c: f9400508     	ldr	x8, [x8, #0x8]
 4649560: b5ffff68     	cbnz	x8, 0x464954c <_ChromeMain+0x46442b0>
 4649564: d2800014     	mov	x20, #0x0               ; =0
 4649568: 925e7688     	and	x8, x20, #0xfffffffc00000000
 464956c: b0052b49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4649570: f9404529     	ldr	x9, [x9, #0x88]
 4649574: eb09011f     	cmp	x8, x9
 4649578: 54000061     	b.ne	0x4649584 <_ChromeMain+0x46442e8>
 464957c: aa1403e0     	mov	x0, x20
 4649580: 96e7652f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4649584: 39631268     	ldrb	w8, [x19, #0x8c4]
 4649588: d0051189     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464958c: 910a6129     	add	x9, x9, #0x298
 4649590: d005118a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4649594: 910a814a     	add	x10, x10, #0x2a0
 4649598: 390063ff     	strb	wzr, [sp, #0x18]
 464959c: 7100011f     	cmp	w8, #0x0
 46495a0: 3900a3ff     	strb	wzr, [sp, #0x28]
 46495a4: 9a891142     	csel	x2, x10, x9, ne
 46495a8: 390003ff     	strb	wzr, [sp]
 46495ac: 390043ff     	strb	wzr, [sp, #0x10]
 46495b0: d0051181     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 46495b4: 910a4021     	add	x1, x1, #0x290
 46495b8: 910063e3     	add	x3, sp, #0x18
 46495bc: 910003e4     	mov	x4, sp
 46495c0: aa1403e0     	mov	x0, x20
 46495c4: 94c2dc16     	bl	0x770061c <_ChromeMain+0x76fb380>
 46495c8: f9446e74     	ldr	x20, [x19, #0x8d8]
 46495cc: b4ffe8b4     	cbz	x20, 0x46492e0 <_ChromeMain+0x4644044>
 46495d0: 3945a2c1     	ldrb	w1, [x22, #0x168]
 46495d4: 52800028     	mov	w8, #0x1                ; =1
 46495d8: b8280288     	ldadd	w8, w8, [x20]
 46495dc: 7100011f     	cmp	w8, #0x0
 46495e0: 54001a0d     	b.le	0x4649920 <_ChromeMain+0x4644684>
 46495e4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46495e8: 6b09011f     	cmp	w8, w9
 46495ec: 54001a00     	b.eq	0x464992c <_ChromeMain+0x4644690>
 46495f0: f9446e68     	ldr	x8, [x19, #0x8d8]
 46495f4: f9400508     	ldr	x8, [x8, #0x8]
 46495f8: aa1403e0     	mov	x0, x20
 46495fc: d63f0100     	blr	x8
 4649600: 12800008     	mov	w8, #-0x1               ; =-1
 4649604: b8e80288     	ldaddal	w8, w8, [x20]
 4649608: 7100051f     	cmp	w8, #0x1
 464960c: 54001a20     	b.eq	0x4649950 <_ChromeMain+0x46446b4>
 4649610: 17ffff34     	b	0x46492e0 <_ChromeMain+0x4644044>
 4649614: 91250260     	add	x0, x19, #0x940
 4649618: 97039440     	bl	0x72e718 <_ChromeMain+0x72947c>
 464961c: 91268260     	add	x0, x19, #0x9a0
 4649620: 9703943e     	bl	0x72e718 <_ChromeMain+0x72947c>
 4649624: 39282a7f     	strb	wzr, [x19, #0xa0a]
 4649628: 3928327f     	strb	wzr, [x19, #0xa0c]
 464962c: 3928227f     	strb	wzr, [x19, #0xa08]
 4649630: aa1303e0     	mov	x0, x19
 4649634: 979d2b9f     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 4649638: f942ca60     	ldr	x0, [x19, #0x590]
 464963c: 394ec808     	ldrb	w8, [x0, #0x3b2]
 4649640: 34000088     	cbz	w8, 0x4649650 <_ChromeMain+0x46443b4>
 4649644: 390ec81f     	strb	wzr, [x0, #0x3b2]
 4649648: 52800001     	mov	w1, #0x0                ; =0
 464964c: 96ff9b8a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4649650: f9422e68     	ldr	x8, [x19, #0x458]
 4649654: f9429d08     	ldr	x8, [x8, #0x538]
 4649658: 9100a109     	add	x9, x8, #0x28
 464965c: f100011f     	cmp	x8, #0x0
 4649660: 9a8903e9     	csel	x9, xzr, x9, eq
 4649664: f940b128     	ldr	x8, [x9, #0x160]
 4649668: b0052b55     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464966c: b4000348     	cbz	x8, 0x46496d4 <_ChromeMain+0x4644438>
 4649670: 91058129     	add	x9, x9, #0x160
 4649674: d005118a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 4649678: 9108614a     	add	x10, x10, #0x218
 464967c: 14000010     	b	0x46496bc <_ChromeMain+0x4644420>
 4649680: 393de27f     	strb	wzr, [x19, #0xf78]
 4649684: aa1303e0     	mov	x0, x19
 4649688: 14000050     	b	0x46497c8 <_ChromeMain+0x464452c>
 464968c: eb09011f     	cmp	x8, x9
 4649690: 54000220     	b.eq	0x46496d4 <_ChromeMain+0x4644438>
 4649694: f9401514     	ldr	x20, [x8, #0x28]
 4649698: 925e7688     	and	x8, x20, #0xfffffffc00000000
 464969c: f94046a9     	ldr	x9, [x21, #0x88]
 46496a0: eb09011f     	cmp	x8, x9
 46496a4: 540001a1     	b.ne	0x46496d8 <_ChromeMain+0x464443c>
 46496a8: aa1403e0     	mov	x0, x20
 46496ac: 96e72b14     	bl	0x142fc <_ChromeMain+0xf060>
 46496b0: 1400000a     	b	0x46496d8 <_ChromeMain+0x464443c>
 46496b4: f9400108     	ldr	x8, [x8]
 46496b8: b40000e8     	cbz	x8, 0x46496d4 <_ChromeMain+0x4644438>
 46496bc: f940110b     	ldr	x11, [x8, #0x20]
 46496c0: eb0a017f     	cmp	x11, x10
 46496c4: 54ffff88     	b.hi	0x46496b4 <_ChromeMain+0x4644418>
 46496c8: 54fffe20     	b.eq	0x464968c <_ChromeMain+0x46443f0>
 46496cc: f9400508     	ldr	x8, [x8, #0x8]
 46496d0: b5ffff68     	cbnz	x8, 0x46496bc <_ChromeMain+0x4644420>
 46496d4: d2800014     	mov	x20, #0x0               ; =0
 46496d8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46496dc: f94046a9     	ldr	x9, [x21, #0x88]
 46496e0: eb09011f     	cmp	x8, x9
 46496e4: 54000061     	b.ne	0x46496f0 <_ChromeMain+0x4644454>
 46496e8: aa1403e0     	mov	x0, x20
 46496ec: 96e764d4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46496f0: d0051181     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 46496f4: 910a4021     	add	x1, x1, #0x290
 46496f8: aa1403e0     	mov	x0, x20
 46496fc: 972e6c17     	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 4649700: 52800021     	mov	w1, #0x1                ; =1
 4649704: 97ea71c0     	bl	0x40e5e04 <_ChromeMain+0x40e0b68>
 4649708: 3974a268     	ldrb	w8, [x19, #0xd28]
 464970c: 35000fa8     	cbnz	w8, 0x4649900 <_ChromeMain+0x4644664>
 4649710: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4649714: f906a268     	str	x8, [x19, #0xd40]
 4649718: 39738268     	ldrb	w8, [x19, #0xce0]
 464971c: 35000c08     	cbnz	w8, 0x464989c <_ChromeMain+0x4644600>
 4649720: 393de27f     	strb	wzr, [x19, #0xf78]
 4649724: f9423e60     	ldr	x0, [x19, #0x478]
 4649728: b4000060     	cbz	x0, 0x4649734 <_ChromeMain+0x4644498>
 464972c: 52800001     	mov	w1, #0x0                ; =0
 4649730: 94c986b2     	bl	0x78ab1f8 <_ChromeMain+0x78a5f5c>
 4649734: f942da68     	ldr	x8, [x19, #0x5b0]
 4649738: b4000068     	cbz	x8, 0x4649744 <_ChromeMain+0x46444a8>
 464973c: f941a114     	ldr	x20, [x8, #0x340]
 4649740: b50005b4     	cbnz	x20, 0x46497f4 <_ChromeMain+0x4644558>
 4649744: f9435660     	ldr	x0, [x19, #0x6a8]
 4649748: b4000060     	cbz	x0, 0x4649754 <_ChromeMain+0x46444b8>
 464974c: d2800001     	mov	x1, #0x0                ; =0
 4649750: 97fef34c     	bl	0x4606480 <_ChromeMain+0x46011e4>
 4649754: f942d668     	ldr	x8, [x19, #0x5a8]
 4649758: b4000048     	cbz	x8, 0x4649760 <_ChromeMain+0x46444c4>
 464975c: 391e927f     	strb	wzr, [x19, #0x7a4]
 4649760: f9446e74     	ldr	x20, [x19, #0x8d8]
 4649764: b4000234     	cbz	x20, 0x46497a8 <_ChromeMain+0x464450c>
 4649768: 3945a2c1     	ldrb	w1, [x22, #0x168]
 464976c: 52800028     	mov	w8, #0x1                ; =1
 4649770: b8280288     	ldadd	w8, w8, [x20]
 4649774: 7100011f     	cmp	w8, #0x0
 4649778: 54000ced     	b.le	0x4649914 <_ChromeMain+0x4644678>
 464977c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4649780: 6b09011f     	cmp	w8, w9
 4649784: 54000c20     	b.eq	0x4649908 <_ChromeMain+0x464466c>
 4649788: f9446e68     	ldr	x8, [x19, #0x8d8]
 464978c: f9400508     	ldr	x8, [x8, #0x8]
 4649790: aa1403e0     	mov	x0, x20
 4649794: d63f0100     	blr	x8
 4649798: 12800008     	mov	w8, #-0x1               ; =-1
 464979c: b8e80288     	ldaddal	w8, w8, [x20]
 46497a0: 7100051f     	cmp	w8, #0x1
 46497a4: 54000ce0     	b.eq	0x4649940 <_ChromeMain+0x46446a4>
 46497a8: aa1303e0     	mov	x0, x19
 46497ac: 52800021     	mov	w1, #0x1                ; =1
 46497b0: 94000444     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 46497b4: aa1303e0     	mov	x0, x19
 46497b8: 52800001     	mov	w1, #0x0                ; =0
 46497bc: 96ff9b2e     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46497c0: f9422e68     	ldr	x8, [x19, #0x458]
 46497c4: 9107c100     	add	x0, x8, #0x1f0
 46497c8: 52800001     	mov	w1, #0x0                ; =0
 46497cc: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 46497d0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 46497d4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 46497d8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 46497dc: 9101c3ff     	add	sp, sp, #0x70
 46497e0: 16ff9b25     	b	0x630474 <_ChromeMain+0x62b1d8>
 46497e4: 5280000c     	mov	w12, #0x0               ; =0
 46497e8: 5280000a     	mov	w10, #0x0               ; =0
 46497ec: 6f00e402     	movi.2d	v2, #0000000000000000
 46497f0: 17ffff18     	b	0x4649450 <_ChromeMain+0x46441b4>
 46497f4: f9400288     	ldr	x8, [x20]
 46497f8: f9402d08     	ldr	x8, [x8, #0x58]
 46497fc: aa1403e0     	mov	x0, x20
 4649800: d63f0100     	blr	x8
 4649804: aa0003f5     	mov	x21, x0
 4649808: 94e5b5e3     	bl	0x7fb6f94 <_ChromeMain+0x7fb1cf8>
 464980c: f10002bf     	cmp	x21, #0x0
 4649810: 1a9f07e8     	cset	w8, ne
 4649814: eb0002bf     	cmp	x21, x0
 4649818: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 464981c: 540000c0     	b.eq	0x4649834 <_ChromeMain+0x4644598>
 4649820: f94026b5     	ldr	x21, [x21, #0x48]
 4649824: f10002bf     	cmp	x21, #0x0
 4649828: 1a9f07e8     	cset	w8, ne
 464982c: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4649830: 54ffff81     	b.ne	0x4649820 <_ChromeMain+0x4644584>
 4649834: 34fff888     	cbz	w8, 0x4649744 <_ChromeMain+0x46444a8>
 4649838: aa1403e0     	mov	x0, x20
 464983c: 52800001     	mov	w1, #0x0                ; =0
 4649840: 94e5acd2     	bl	0x7fb4b88 <_ChromeMain+0x7faf8ec>
 4649844: 17ffffc0     	b	0x4649744 <_ChromeMain+0x46444a8>
 4649848: f9400288     	ldr	x8, [x20]
 464984c: f9402d08     	ldr	x8, [x8, #0x58]
 4649850: aa1403e0     	mov	x0, x20
 4649854: d63f0100     	blr	x8
 4649858: aa0003f5     	mov	x21, x0
 464985c: 94e5b5ce     	bl	0x7fb6f94 <_ChromeMain+0x7fb1cf8>
 4649860: f10002bf     	cmp	x21, #0x0
 4649864: 1a9f07e8     	cset	w8, ne
 4649868: eb0002bf     	cmp	x21, x0
 464986c: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4649870: 540000c0     	b.eq	0x4649888 <_ChromeMain+0x46445ec>
 4649874: f94026b5     	ldr	x21, [x21, #0x48]
 4649878: f10002bf     	cmp	x21, #0x0
 464987c: 1a9f07e8     	cset	w8, ne
 4649880: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4649884: 54ffff81     	b.ne	0x4649874 <_ChromeMain+0x46445d8>
 4649888: 34ffd528     	cbz	w8, 0x464932c <_ChromeMain+0x4644090>
 464988c: aa1403e0     	mov	x0, x20
 4649890: 52800021     	mov	w1, #0x1                ; =1
 4649894: 94e5acbd     	bl	0x7fb4b88 <_ChromeMain+0x7faf8ec>
 4649898: 17fffea5     	b	0x464932c <_ChromeMain+0x4644090>
 464989c: 3933827f     	strb	wzr, [x19, #0xce0]
 46498a0: f9467a60     	ldr	x0, [x19, #0xcf0]
 46498a4: 91334261     	add	x1, x19, #0xcd0
 46498a8: 976aff96     	bl	0x2109700 <_ChromeMain+0x2104464>
 46498ac: f9466a68     	ldr	x8, [x19, #0xcd0]
 46498b0: f9401d08     	ldr	x8, [x8, #0x38]
 46498b4: 91334260     	add	x0, x19, #0xcd0
 46498b8: d63f0100     	blr	x8
 46498bc: f9467668     	ldr	x8, [x19, #0xce8]
 46498c0: b4fff308     	cbz	x8, 0x4649720 <_ChromeMain+0x4644484>
 46498c4: f9466a68     	ldr	x8, [x19, #0xcd0]
 46498c8: f9402108     	ldr	x8, [x8, #0x40]
 46498cc: 91334260     	add	x0, x19, #0xcd0
 46498d0: d63f0100     	blr	x8
 46498d4: f9467668     	ldr	x8, [x19, #0xce8]
 46498d8: f9400109     	ldr	x9, [x8]
 46498dc: 7100001f     	cmp	w0, #0x0
 46498e0: 5280020a     	mov	w10, #0x10              ; =16
 46498e4: 5280040b     	mov	w11, #0x20              ; =32
 46498e8: 9a8a116a     	csel	x10, x11, x10, ne
 46498ec: f86a6929     	ldr	x9, [x9, x10]
 46498f0: 91334261     	add	x1, x19, #0xcd0
 46498f4: aa0803e0     	mov	x0, x8
 46498f8: d63f0120     	blr	x9
 46498fc: 17ffff89     	b	0x4649720 <_ChromeMain+0x4644484>
 4649900: 3934a27f     	strb	wzr, [x19, #0xd28]
 4649904: 17ffff83     	b	0x4649710 <_ChromeMain+0x4644474>
 4649908: d4200000     	brk	#0
 464990c: d4400000     	hlt	#0
 4649910: d4200020     	brk	#0x1
 4649914: d4200000     	brk	#0
 4649918: d4400000     	hlt	#0
 464991c: d4200020     	brk	#0x1
 4649920: d4200000     	brk	#0
 4649924: d4400000     	hlt	#0
 4649928: d4200020     	brk	#0x1
 464992c: d4200000     	brk	#0
 4649930: d4400000     	hlt	#0
 4649934: d4200020     	brk	#0x1
 4649938: 52800009     	mov	w9, #0x0                ; =0
 464993c: 17fffea4     	b	0x46493cc <_ChromeMain+0x4644130>
 4649940: f9400a88     	ldr	x8, [x20, #0x10]
 4649944: aa1403e0     	mov	x0, x20
 4649948: d63f0100     	blr	x8
 464994c: 17ffff97     	b	0x46497a8 <_ChromeMain+0x464450c>
 4649950: f9400a88     	ldr	x8, [x20, #0x10]
 4649954: aa1403e0     	mov	x0, x20
 4649958: d63f0100     	blr	x8
 464995c: 17fffe61     	b	0x46492e0 <_ChromeMain+0x4644044>
