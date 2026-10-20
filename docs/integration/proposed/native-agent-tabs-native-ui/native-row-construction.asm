
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 468761c: 6db82beb     	stp	d11, d10, [sp, #-0x80]!
 4687620: 6d0123e9     	stp	d9, d8, [sp, #0x10]
 4687624: a9026ffc     	stp	x28, x27, [sp, #0x20]
 4687628: a90367fa     	stp	x26, x25, [sp, #0x30]
 468762c: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4687630: a90557f6     	stp	x22, x21, [sp, #0x50]
 4687634: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4687638: a9077bfd     	stp	x29, x30, [sp, #0x70]
 468763c: 9101c3fd     	add	x29, sp, #0x70
 4687640: d10a83ff     	sub	sp, sp, #0x2a0
 4687644: aa0003f3     	mov	x19, x0
 4687648: f943e415     	ldr	x21, [x0, #0x7c8]
 468764c: b4000075     	cbz	x21, 0x4687658 <_ChromeMain+0x46823bc>
 4687650: f94006b4     	ldr	x20, [x21, #0x8]
 4687654: b5000634     	cbnz	x20, 0x4687718 <_ChromeMain+0x468247c>
 4687658: f9400268     	ldr	x8, [x19]
 468765c: f9403108     	ldr	x8, [x8, #0x60]
 4687660: b0fdff34     	adrp	x20, 0x66c000 <_ChromeMain+0x666d64>
 4687664: 91394294     	add	x20, x20, #0xe50
 4687668: eb14011f     	cmp	x8, x20
 468766c: 54000261     	b.ne	0x46876b8 <_ChromeMain+0x468241c>
 4687670: f940c260     	ldr	x0, [x19, #0x180]
 4687674: b4000300     	cbz	x0, 0x46876d4 <_ChromeMain+0x4682438>
 4687678: f9400268     	ldr	x8, [x19]
 468767c: f9403108     	ldr	x8, [x8, #0x60]
 4687680: eb14011f     	cmp	x8, x20
 4687684: 540003c1     	b.ne	0x46876fc <_ChromeMain+0x4682460>
 4687688: f940c260     	ldr	x0, [x19, #0x180]
 468768c: 52800001     	mov	w1, #0x0                ; =0
 4687690: 910a83ff     	add	sp, sp, #0x2a0
 4687694: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4687698: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 468769c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 46876a0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 46876a4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 46876a8: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 46876ac: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 46876b0: 6cc82beb     	ldp	d11, d10, [sp], #0x80
 46876b4: 17965735     	b	0x2c1d388 <_ChromeMain+0x2c180ec>
 46876b8: b0fdfd49     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 46876bc: 9120c129     	add	x9, x9, #0x830
 46876c0: eb09011f     	cmp	x8, x9
 46876c4: 54fffd60     	b.eq	0x4687670 <_ChromeMain+0x46823d4>
 46876c8: aa1303e0     	mov	x0, x19
 46876cc: d63f0100     	blr	x8
 46876d0: b5fffd40     	cbnz	x0, 0x4687678 <_ChromeMain+0x46823dc>
 46876d4: 910a83ff     	add	sp, sp, #0x2a0
 46876d8: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 46876dc: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 46876e0: a94557f6     	ldp	x22, x21, [sp, #0x50]
 46876e4: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 46876e8: a94367fa     	ldp	x26, x25, [sp, #0x30]
 46876ec: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 46876f0: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 46876f4: 6cc82beb     	ldp	d11, d10, [sp], #0x80
 46876f8: d65f03c0     	ret
 46876fc: b0fdfd49     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4687700: 9120c129     	add	x9, x9, #0x830
 4687704: eb09011f     	cmp	x8, x9
 4687708: 54fffc00     	b.eq	0x4687688 <_ChromeMain+0x46823ec>
 468770c: aa1303e0     	mov	x0, x19
 4687710: d63f0100     	blr	x8
 4687714: 17ffffde     	b	0x468768c <_ChromeMain+0x46823f0>
 4687718: 911f4261     	add	x1, x19, #0x7d0
 468771c: aa1403e0     	mov	x0, x20
 4687720: 94803cd8     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 4687724: f9400028     	ldr	x8, [x1]
 4687728: 91002289     	add	x9, x20, #0x8
 468772c: f100011f     	cmp	x8, #0x0
 4687730: fa491104     	ccmp	x8, x9, #0x4, ne
 4687734: 54fff920     	b.eq	0x4687658 <_ChromeMain+0x46823bc>
 4687738: 1400000a     	b	0x4687760 <_ChromeMain+0x46824c4>
 468773c: 911f4261     	add	x1, x19, #0x7d0
 4687740: aa1503e0     	mov	x0, x21
 4687744: 94803ccf     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 4687748: f9400028     	ldr	x8, [x1]
 468774c: 910022a9     	add	x9, x21, #0x8
 4687750: f100011f     	cmp	x8, #0x0
 4687754: fa491104     	ccmp	x8, x9, #0x4, ne
 4687758: 54000180     	b.eq	0x4687788 <_ChromeMain+0x46824ec>
 468775c: 14000282     	b	0x4688164 <_ChromeMain+0x4682ec8>
 4687760: f94006a0     	ldr	x0, [x21, #0x8]
 4687764: 911f4261     	add	x1, x19, #0x7d0
 4687768: 94dafee4     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 468776c: b4fff760     	cbz	x0, 0x4687658 <_ChromeMain+0x46823bc>
 4687770: f943f260     	ldr	x0, [x19, #0x7e0]
 4687774: 975f2769     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 4687778: f943e674     	ldr	x20, [x19, #0x7c8]
 468777c: b4000074     	cbz	x20, 0x4687788 <_ChromeMain+0x46824ec>
 4687780: f9400695     	ldr	x21, [x20, #0x8]
 4687784: b5fffdd5     	cbnz	x21, 0x468773c <_ChromeMain+0x46824a0>
 4687788: f9400268     	ldr	x8, [x19]
 468778c: f9403108     	ldr	x8, [x8, #0x60]
 4687790: b0fdff29     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 4687794: 91394129     	add	x9, x9, #0xe50
 4687798: eb09011f     	cmp	x8, x9
 468779c: 54000101     	b.ne	0x46877bc <_ChromeMain+0x4682520>
 46877a0: f940c260     	ldr	x0, [x19, #0x180]
 46877a4: b4fff980     	cbz	x0, 0x46876d4 <_ChromeMain+0x4682438>
 46877a8: aa1303e0     	mov	x0, x19
 46877ac: 970878a2     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 46877b0: 910c4260     	add	x0, x19, #0x310
 46877b4: 957f7e49     	bl	0xa6670d8 <_ChromeMain+0xa661e3c>
 46877b8: 17ffffc7     	b	0x46876d4 <_ChromeMain+0x4682438>
 46877bc: b0fdfd49     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 46877c0: 9120c129     	add	x9, x9, #0x830
 46877c4: eb09011f     	cmp	x8, x9
 46877c8: 54fffec0     	b.eq	0x46877a0 <_ChromeMain+0x4682504>
 46877cc: aa1303e0     	mov	x0, x19
 46877d0: d63f0100     	blr	x8
 46877d4: b4fff800     	cbz	x0, 0x46876d4 <_ChromeMain+0x4682438>
 46877d8: 17fffff4     	b	0x46877a8 <_ChromeMain+0x468250c>
 46877dc: f9400008     	ldr	x8, [x0]
 46877e0: f9400508     	ldr	x8, [x8, #0x8]
 46877e4: d63f0100     	blr	x8
 46877e8: 1400001b     	b	0x4687854 <_ChromeMain+0x46825b8>
 46877ec: 35005968     	cbnz	w8, 0x4688318 <_ChromeMain+0x468307c>
 46877f0: f9408be8     	ldr	x8, [sp, #0x110]
 46877f4: b5001148     	cbnz	x8, 0x4687a1c <_ChromeMain+0x4682780>
 46877f8: 52801bc8     	mov	w8, #0xde               ; =222
 46877fc: b900ebe8     	str	w8, [sp, #0xe8]
 4687800: 3903b3ff     	strb	wzr, [sp, #0xec]
 4687804: 9102c3e8     	add	x8, sp, #0xb0
 4687808: 9103a3e1     	add	x1, sp, #0xe8
 468780c: d0051a60     	adrp	x0, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 4687810: 91046000     	add	x0, x0, #0x118
 4687814: 52800202     	mov	w2, #0x10               ; =16
 4687818: d2800003     	mov	x3, #0x0                ; =0
 468781c: 971db441     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4687820: 14000086     	b	0x4687a38 <_ChromeMain+0x468279c>
 4687824: b900f31f     	str	wzr, [x24, #0xf0]
 4687828: aa1803e0     	mov	x0, x24
 468782c: 52800021     	mov	w1, #0x1                ; =1
 4687830: 974f76a0     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4687834: 14000016     	b	0x468788c <_ChromeMain+0x46825f0>
 4687838: eb09011f     	cmp	x8, x9
 468783c: 540056a0     	b.eq	0x4688310 <_ChromeMain+0x4683074>
 4687840: f9401908     	ldr	x8, [x8, #0x30]
 4687844: b900111f     	str	wzr, [x8, #0x10]
 4687848: f9401d00     	ldr	x0, [x8, #0x38]
 468784c: f9001d1f     	str	xzr, [x8, #0x38]
 4687850: b5fffc60     	cbnz	x0, 0x46877dc <_ChromeMain+0x4682540>
 4687854: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 4687858: 9103c3e1     	add	x1, sp, #0xf0
 468785c: aa1503e0     	mov	x0, x21
 4687860: 52800102     	mov	w2, #0x8                ; =8
 4687864: 97aa90bd     	bl	0x312bb58 <_ChromeMain+0x31268bc>
 4687868: 52802800     	mov	w0, #0x140              ; =320
 468786c: 96e61ebf     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687870: aa0003f8     	mov	x24, x0
 4687874: 978e2357     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4687878: aa1503e0     	mov	x0, x21
 468787c: aa1803e1     	mov	x1, x24
 4687880: 975407ee     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4687884: b940f308     	ldr	w8, [x24, #0xf0]
 4687888: 35fffce8     	cbnz	w8, 0x4687824 <_ChromeMain+0x4682588>
 468788c: b900f3f7     	str	w23, [sp, #0xf0]
 4687890: 91046300     	add	x0, x24, #0x118
 4687894: 9103c3e2     	add	x2, sp, #0xf0
 4687898: d0051be1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 468789c: 9115a021     	add	x1, x1, #0x568
 46878a0: 974f7641     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 46878a4: 3943d308     	ldrb	w8, [x24, #0xf4]
 46878a8: 370000a8     	tbnz	w8, #0x0, 0x46878bc <_ChromeMain+0x4682620>
 46878ac: 3903d317     	strb	w23, [x24, #0xf4]
 46878b0: aa1803e0     	mov	x0, x24
 46878b4: 52800021     	mov	w1, #0x1                ; =1
 46878b8: 974f767e     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 46878bc: 3dc00be0     	ldr	q0, [sp, #0x20]
 46878c0: 3d800360     	str	q0, [x27]
 46878c4: 91046300     	add	x0, x24, #0x118
 46878c8: 9103c3e2     	add	x2, sp, #0xf0
 46878cc: d0051be1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46878d0: 91122021     	add	x1, x1, #0x488
 46878d4: 97519963     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 46878d8: 6f00e400     	movi.2d	v0, #0000000000000000
 46878dc: ad0b8360     	stp	q0, q0, [x27, #0x170]
 46878e0: ad0a8360     	stp	q0, q0, [x27, #0x150]
 46878e4: ad098360     	stp	q0, q0, [x27, #0x130]
 46878e8: ad088360     	stp	q0, q0, [x27, #0x110]
 46878ec: ad078360     	stp	q0, q0, [x27, #0xf0]
 46878f0: ad068360     	stp	q0, q0, [x27, #0xd0]
 46878f4: ad058360     	stp	q0, q0, [x27, #0xb0]
 46878f8: ad048360     	stp	q0, q0, [x27, #0x90]
 46878fc: ad038360     	stp	q0, q0, [x27, #0x70]
 4687900: ad028360     	stp	q0, q0, [x27, #0x50]
 4687904: ad018360     	stp	q0, q0, [x27, #0x30]
 4687908: ad008360     	stp	q0, q0, [x27, #0x10]
 468790c: 3d800360     	str	q0, [x27]
 4687910: 9103c3e8     	add	x8, sp, #0xf0
 4687914: aa1603e0     	mov	x0, x22
 4687918: 9729985a     	bl	0x10eda80 <_ChromeMain+0x10e87e4>
 468791c: f0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4687920: 91120108     	add	x8, x8, #0x480
 4687924: f8bfc100     	ldapr	x0, [x8]
 4687928: b4004ce0     	cbz	x0, 0x46882c4 <_ChromeMain+0x4683028>
 468792c: 52807001     	mov	w1, #0x380              ; =896
 4687930: d2800002     	mov	x2, #0x0                ; =0
 4687934: 96e88f1f     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4687938: aa0003f6     	mov	x22, x0
 468793c: 9776963f     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4687940: f005014a     	adrp	x10, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4687944: 912f414a     	add	x10, x10, #0xbd0
 4687948: 910fc148     	add	x8, x10, #0x3f0
 468794c: a900200a     	stp	x10, x8, [x0]
 4687950: 91106148     	add	x8, x10, #0x418
 4687954: f9000808     	str	x8, [x0, #0x10]
 4687958: 91114148     	add	x8, x10, #0x450
 468795c: 91120149     	add	x9, x10, #0x480
 4687960: a906a408     	stp	x8, x9, [x0, #0x68]
 4687964: 91134148     	add	x8, x10, #0x4d0
 4687968: f9005808     	str	x8, [x0, #0xb0]
 468796c: 9114c148     	add	x8, x10, #0x530
 4687970: f9006c08     	str	x8, [x0, #0xd8]
 4687974: 91158148     	add	x8, x10, #0x560
 4687978: f9007c08     	str	x8, [x0, #0xf8]
 468797c: f901a41f     	str	xzr, [x0, #0x348]
 4687980: fd01a808     	str	d8, [x0, #0x350]
 4687984: 390d6017     	strb	w23, [x0, #0x358]
 4687988: f901b01f     	str	xzr, [x0, #0x360]
 468798c: 390da01f     	strb	wzr, [x0, #0x368]
 4687990: f901b81f     	str	xzr, [x0, #0x370]
 4687994: b903781f     	str	wzr, [x0, #0x378]
 4687998: 390df01f     	strb	wzr, [x0, #0x37c]
 468799c: 3945a408     	ldrb	w8, [x0, #0x169]
 46879a0: 35004a08     	cbnz	w8, 0x46882e0 <_ChromeMain+0x4683044>
 46879a4: f940cea2     	ldr	x2, [x21, #0x198]
 46879a8: aa1503e0     	mov	x0, x21
 46879ac: aa1603e1     	mov	x1, x22
 46879b0: 9703c693     	bl	0x7793fc <_ChromeMain+0x774160>
 46879b4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46879b8: f9404789     	ldr	x9, [x28, #0x88]
 46879bc: eb09011f     	cmp	x8, x9
 46879c0: 54000061     	b.ne	0x46879cc <_ChromeMain+0x4682730>
 46879c4: aa1603e0     	mov	x0, x22
 46879c8: 96e6324d     	bl	0x142fc <_ChromeMain+0xf060>
 46879cc: 911622b8     	add	x24, x21, #0x588
 46879d0: f9400300     	ldr	x0, [x24]
 46879d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46879d8: f9404789     	ldr	x9, [x28, #0x88]
 46879dc: eb09011f     	cmp	x8, x9
 46879e0: 54000041     	b.ne	0x46879e8 <_ChromeMain+0x468274c>
 46879e4: 96e66c16     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46879e8: f9000316     	str	x22, [x24]
 46879ec: aa1603e0     	mov	x0, x22
 46879f0: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 46879f4: 52800022     	mov	w2, #0x1                ; =1
 46879f8: 9785281a     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 46879fc: f9400316     	ldr	x22, [x24]
 4687a00: 3944c3e8     	ldrb	w8, [sp, #0x130]
 4687a04: 7100051f     	cmp	w8, #0x1
 4687a08: 54ffef21     	b.ne	0x46877ec <_ChromeMain+0x4682550>
 4687a0c: f9408be8     	ldr	x8, [sp, #0x110]
 4687a10: b4ffef48     	cbz	x8, 0x46877f8 <_ChromeMain+0x468255c>
 4687a14: f9400d08     	ldr	x8, [x8, #0x18]
 4687a18: b4ffef08     	cbz	x8, 0x46877f8 <_ChromeMain+0x468255c>
 4687a1c: 3902c3ff     	strb	wzr, [sp, #0xb0]
 4687a20: 52801fe8     	mov	w8, #0xff               ; =255
 4687a24: 390343e8     	strb	w8, [sp, #0xd0]
 4687a28: 9102c3e0     	add	x0, sp, #0xb0
 4687a2c: 9103c3e8     	add	x8, sp, #0xf0
 4687a30: 91008101     	add	x1, x8, #0x20
 4687a34: 9700dcd6     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4687a38: 9102c3e1     	add	x1, sp, #0xb0
 4687a3c: aa1603e0     	mov	x0, x22
 4687a40: 96fc6598     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4687a44: 9102c3e0     	add	x0, sp, #0xb0
 4687a48: 9706fb7e     	bl	0x846840 <_ChromeMain+0x8415a4>
 4687a4c: f0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4687a50: 91120108     	add	x8, x8, #0x480
 4687a54: f8bfc100     	ldapr	x0, [x8]
 4687a58: b40043a0     	cbz	x0, 0x46882cc <_ChromeMain+0x4683030>
 4687a5c: 52808c01     	mov	w1, #0x460              ; =1120
 4687a60: d2800002     	mov	x2, #0x0                ; =0
 4687a64: 96e88ed3     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4687a68: aa0003f6     	mov	x22, x0
 4687a6c: 39841fe8     	ldrsb	x8, [sp, #0x107]
 4687a70: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4687a74: f100011f     	cmp	x8, #0x0
 4687a78: 9103c3eb     	add	x11, sp, #0xf0
 4687a7c: 9a8b4121     	csel	x1, x9, x11, mi
 4687a80: 7100011f     	cmp	w8, #0x0
 4687a84: 9a884142     	csel	x2, x10, x8, mi
 4687a88: 528000a3     	mov	w3, #0x5                ; =5
 4687a8c: 52820004     	mov	w4, #0x1000             ; =4096
 4687a90: 52800005     	mov	w5, #0x0                ; =0
 4687a94: 97540b93     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4687a98: 3945a408     	ldrb	w8, [x0, #0x169]
 4687a9c: 35004288     	cbnz	w8, 0x46882ec <_ChromeMain+0x4683050>
 4687aa0: f940cea2     	ldr	x2, [x21, #0x198]
 4687aa4: aa1503e0     	mov	x0, x21
 4687aa8: aa1603e1     	mov	x1, x22
 4687aac: 9703c654     	bl	0x7793fc <_ChromeMain+0x774160>
 4687ab0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4687ab4: f9404789     	ldr	x9, [x28, #0x88]
 4687ab8: eb09011f     	cmp	x8, x9
 4687abc: 54000061     	b.ne	0x4687ac8 <_ChromeMain+0x468282c>
 4687ac0: aa1603e0     	mov	x0, x22
 4687ac4: 96e6320e     	bl	0x142fc <_ChromeMain+0xf060>
 4687ac8: f942caa0     	ldr	x0, [x21, #0x590]
 4687acc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4687ad0: f9404789     	ldr	x9, [x28, #0x88]
 4687ad4: eb09011f     	cmp	x8, x9
 4687ad8: 54000041     	b.ne	0x4687ae0 <_ChromeMain+0x4682844>
 4687adc: 96e66bd8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4687ae0: f902cab6     	str	x22, [x21, #0x590]
 4687ae4: aa1603e0     	mov	x0, x22
 4687ae8: 52801ba1     	mov	w1, #0xdd               ; =221
 4687aec: 528001c2     	mov	w2, #0xe                ; =14
 4687af0: 52803203     	mov	w3, #0x190              ; =400
 4687af4: 52800284     	mov	w4, #0x14               ; =20
 4687af8: 97fff7d2     	bl	0x4685a40 <_ChromeMain+0x46807a4>
 4687afc: f942cab6     	ldr	x22, [x21, #0x590]
 4687b00: 52800800     	mov	w0, #0x40               ; =64
 4687b04: 96e61e19     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687b08: b9000017     	str	w23, [x0]
 4687b0c: 90fe4d08     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 4687b10: 91260109     	add	x9, x8, #0x980
 4687b14: f0fde348     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 4687b18: 91220108     	add	x8, x8, #0x880
 4687b1c: a900a009     	stp	x9, x8, [x0, #0x8]
 4687b20: d0fef6a8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4687b24: 912c0109     	add	x9, x8, #0xb00
 4687b28: f0ffa4e8     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 4687b2c: 91310108     	add	x8, x8, #0xc40
 4687b30: a901a009     	stp	x9, x8, [x0, #0x18]
 4687b34: 3dc007e0     	ldr	q0, [sp, #0x10]
 4687b38: 3c828000     	stur	q0, [x0, #0x28]
 4687b3c: 3900e01f     	strb	wzr, [x0, #0x38]
 4687b40: f9005be0     	str	x0, [sp, #0xb0]
 4687b44: fd005fe9     	str	d9, [sp, #0xb8]
 4687b48: 52800068     	mov	w8, #0x3                ; =3
 4687b4c: b900c3e8     	str	w8, [sp, #0xc0]
 4687b50: 9102c3e8     	add	x8, sp, #0xb0
 4687b54: a9027d1f     	stp	xzr, xzr, [x8, #0x20]
 4687b58: f801811f     	stur	xzr, [x8, #0x18]
 4687b5c: 910362c0     	add	x0, x22, #0xd8
 4687b60: 9102c3e2     	add	x2, sp, #0xb0
 4687b64: d0051be1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4687b68: 91152021     	add	x1, x1, #0x548
 4687b6c: 97563208     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 4687b70: 9102c3e0     	add	x0, sp, #0xb0
 4687b74: 97430c6c     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4687b78: f9404788     	ldr	x8, [x28, #0x88]
 4687b7c: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 4687b80: eb08013f     	cmp	x9, x8
 4687b84: 54000061     	b.ne	0x4687b90 <_ChromeMain+0x46828f4>
 4687b88: aa1503e0     	mov	x0, x21
 4687b8c: 96e631dc     	bl	0x142fc <_ChromeMain+0xf060>
 4687b90: 52800700     	mov	w0, #0x38               ; =56
 4687b94: 96e61df5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687b98: b9000017     	str	w23, [x0]
 4687b9c: b0ffc728     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4687ba0: 91270109     	add	x9, x8, #0x9c0
 4687ba4: b0fea1e8     	adrp	x8, 0x1ac4000 <_ChromeMain+0x1abed64>
 4687ba8: 91180108     	add	x8, x8, #0x600
 4687bac: a900a009     	stp	x9, x8, [x0, #0x8]
 4687bb0: d0fef6a8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4687bb4: 912c0109     	add	x9, x8, #0xb00
 4687bb8: 100096a8     	adr	x8, 0x4688e8c <_ChromeMain+0x4683bf0>
 4687bbc: d503201f     	nop
 4687bc0: a901a009     	stp	x9, x8, [x0, #0x18]
 4687bc4: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4687bc8: f90053e0     	str	x0, [sp, #0xa0]
 4687bcc: 3902a3ff     	strb	wzr, [sp, #0xa8]
 4687bd0: 910283e0     	add	x0, sp, #0xa0
 4687bd4: f0051a61     	adrp	x1, 0xe9d6000 <dyld_stub_binder+0xe9d6000>
 4687bd8: 91070021     	add	x1, x1, #0x1c0
 4687bdc: d2800202     	mov	x2, #0x10               ; =16
 4687be0: f2c00022     	movk	x2, #0x1, lsl #32
 4687be4: 52801bc3     	mov	w3, #0xde               ; =222
 4687be8: 52801bc4     	mov	w4, #0xde               ; =222
 4687bec: 52801bc5     	mov	w5, #0xde               ; =222
 4687bf0: 9730b1f3     	bl	0x12b43bc <_ChromeMain+0x12af120>
 4687bf4: 3945a408     	ldrb	w8, [x0, #0x169]
 4687bf8: 35003808     	cbnz	w8, 0x46882f8 <_ChromeMain+0x468305c>
 4687bfc: aa0003f6     	mov	x22, x0
 4687c00: f940cea2     	ldr	x2, [x21, #0x198]
 4687c04: aa1503e0     	mov	x0, x21
 4687c08: aa1603e1     	mov	x1, x22
 4687c0c: 9703c5fc     	bl	0x7793fc <_ChromeMain+0x774160>
 4687c10: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4687c14: f9404789     	ldr	x9, [x28, #0x88]
 4687c18: eb09011f     	cmp	x8, x9
 4687c1c: 54000061     	b.ne	0x4687c28 <_ChromeMain+0x468298c>
 4687c20: aa1603e0     	mov	x0, x22
 4687c24: 96e631b6     	bl	0x142fc <_ChromeMain+0xf060>
 4687c28: f942cea0     	ldr	x0, [x21, #0x598]
 4687c2c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4687c30: f9404789     	ldr	x9, [x28, #0x88]
 4687c34: eb09011f     	cmp	x8, x9
 4687c38: 54000041     	b.ne	0x4687c40 <_ChromeMain+0x46829a4>
 4687c3c: 96e66b80     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4687c40: f902ceb6     	str	x22, [x21, #0x598]
 4687c44: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 4687c48: 7103fd1f     	cmp	w8, #0xff
 4687c4c: 54000060     	b.eq	0x4687c58 <_ChromeMain+0x46829bc>
 4687c50: f94053e0     	ldr	x0, [sp, #0xa0]
 4687c54: b5002f00     	cbnz	x0, 0x4688234 <_ChromeMain+0x4682f98>
 4687c58: 52801fe8     	mov	w8, #0xff               ; =255
 4687c5c: 3902a3e8     	strb	w8, [sp, #0xa8]
 4687c60: f942cea0     	ldr	x0, [x21, #0x598]
 4687c64: d28002c1     	mov	x1, #0x16               ; =22
 4687c68: f2c002c1     	movk	x1, #0x16, lsl #32
 4687c6c: 52800022     	mov	w2, #0x1                ; =1
 4687c70: 9785277c     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4687c74: f942cea0     	ldr	x0, [x21, #0x598]
 4687c78: fd005bea     	str	d10, [sp, #0xb0]
 4687c7c: 9102c3e1     	add	x1, sp, #0xb0
 4687c80: 957fc2a0     	bl	0xa678700 <_ChromeMain+0xa673464>
 4687c84: f942cea0     	ldr	x0, [x21, #0x598]
 4687c88: f9400008     	ldr	x8, [x0]
 4687c8c: f9405108     	ldr	x8, [x8, #0xa0]
 4687c90: 52800001     	mov	w1, #0x0                ; =0
 4687c94: d63f0100     	blr	x8
 4687c98: f942cea0     	ldr	x0, [x21, #0x598]
 4687c9c: 52800128     	mov	w8, #0x9                ; =9
 4687ca0: 39031fe8     	strb	w8, [sp, #0xc7]
 4687ca4: b9404fe8     	ldr	w8, [sp, #0x4c]
 4687ca8: 35003088     	cbnz	w8, 0x46882b8 <_ChromeMain+0x468301c>
 4687cac: 52800c48     	mov	w8, #0x62               ; =98
 4687cb0: b900c3e8     	str	w8, [sp, #0xc0]
 4687cb4: b004c808     	adrp	x8, 0xdf88000 <dyld_stub_binder+0xdf88000>
 4687cb8: 91008908     	add	x8, x8, #0x22
 4687cbc: 3dc00100     	ldr	q0, [x8]
 4687cc0: 3d8017e0     	str	q0, [sp, #0x50]
 4687cc4: 3d802fe0     	str	q0, [sp, #0xb0]
 4687cc8: 9102c3e1     	add	x1, sp, #0xb0
 4687ccc: 9706fb1e     	bl	0x846944 <_ChromeMain+0x8416a8>
 4687cd0: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 4687cd4: 36f800a8     	tbz	w8, #0x1f, 0x4687ce8 <_ChromeMain+0x4682a4c>
 4687cd8: f9405be0     	ldr	x0, [sp, #0xb0]
 4687cdc: f94063e8     	ldr	x8, [sp, #0xc0]
 4687ce0: d37ff901     	lsl	x1, x8, #1
 4687ce4: 96e60475     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4687ce8: f942ceb6     	ldr	x22, [x21, #0x598]
 4687cec: f94166c0     	ldr	x0, [x22, #0x2c8]
 4687cf0: b4002b00     	cbz	x0, 0x4688250 <_ChromeMain+0x4682fb4>
 4687cf4: 52800128     	mov	w8, #0x9                ; =9
 4687cf8: 39025fe8     	strb	w8, [sp, #0x97]
 4687cfc: b9400fe8     	ldr	w8, [sp, #0xc]
 4687d00: 35002dc8     	cbnz	w8, 0x46882b8 <_ChromeMain+0x468301c>
 4687d04: 52800c48     	mov	w8, #0x62               ; =98
 4687d08: b90093e8     	str	w8, [sp, #0x90]
 4687d0c: 3dc017e0     	ldr	q0, [sp, #0x50]
 4687d10: 3d8023e0     	str	q0, [sp, #0x80]
 4687d14: 910203e1     	add	x1, sp, #0x80
 4687d18: 972b96f0     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4687d1c: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 4687d20: 36f800a8     	tbz	w8, #0x1f, 0x4687d34 <_ChromeMain+0x4682a98>
 4687d24: f94043e0     	ldr	x0, [sp, #0x80]
 4687d28: f9404be8     	ldr	x8, [sp, #0x90]
 4687d2c: d37ff901     	lsl	x1, x8, #1
 4687d30: 96e60462     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4687d34: f942ceb6     	ldr	x22, [x21, #0x598]
 4687d38: 52800400     	mov	w0, #0x20               ; =32
 4687d3c: 96e61d8b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687d40: aa0003e4     	mov	x4, x0
 4687d44: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4687d48: 7900301f     	strh	wzr, [x0, #0x18]
 4687d4c: f004e628     	adrp	x8, 0xe34e000 <dyld_stub_binder+0xe34e000>
 4687d50: 9134a108     	add	x8, x8, #0xd28
 4687d54: f9000008     	str	x8, [x0]
 4687d58: 910362c0     	add	x0, x22, #0xd8
 4687d5c: d0051be1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4687d60: 9114a021     	add	x1, x1, #0x528
 4687d64: d004b5e2     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4687d68: 91264842     	add	x2, x2, #0x992
 4687d6c: b0ff3f23     	adrp	x3, 0x2e6c000 <_ChromeMain+0x2e66d64>
 4687d70: 913c0063     	add	x3, x3, #0xf00
 4687d74: d2800005     	mov	x5, #0x0                ; =0
 4687d78: 97138909     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 4687d7c: b5001ae0     	cbnz	x0, 0x46880d8 <_ChromeMain+0x4682e3c>
 4687d80: f94166b6     	ldr	x22, [x21, #0x2c8]
 4687d84: b4002816     	cbz	x22, 0x4688284 <_ChromeMain+0x4682fe8>
 4687d88: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4687d8c: 37f818a8     	tbnz	w8, #0x1f, 0x46880a0 <_ChromeMain+0x4682e04>
 4687d90: 3dc00360     	ldr	q0, [x27]
 4687d94: 3d802fe0     	str	q0, [sp, #0xb0]
 4687d98: f94083e8     	ldr	x8, [sp, #0x100]
 4687d9c: f90063e8     	str	x8, [sp, #0xc0]
 4687da0: 9102c3e1     	add	x1, sp, #0xb0
 4687da4: aa1603e0     	mov	x0, x22
 4687da8: 972b96cc     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4687dac: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 4687db0: 36f800a8     	tbz	w8, #0x1f, 0x4687dc4 <_ChromeMain+0x4682b28>
 4687db4: f9405be0     	ldr	x0, [sp, #0xb0]
 4687db8: f94063e8     	ldr	x8, [sp, #0xc0]
 4687dbc: d37ff901     	lsl	x1, x8, #1
 4687dc0: 96e6043e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4687dc4: 9103c3e0     	add	x0, sp, #0xf0
 4687dc8: 9729922e     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4687dcc: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4687dd0: 350029a8     	cbnz	w8, 0x4688304 <_ChromeMain+0x4683068>
 4687dd4: f94033e0     	ldr	x0, [sp, #0x60]
 4687dd8: f940cc02     	ldr	x2, [x0, #0x198]
 4687ddc: aa1503e1     	mov	x1, x21
 4687de0: 9703c587     	bl	0x7793fc <_ChromeMain+0x774160>
 4687de4: 91002294     	add	x20, x20, #0x8
 4687de8: f94003e8     	ldr	x8, [sp]
 4687dec: eb08029f     	cmp	x20, x8
 4687df0: 54001780     	b.eq	0x46880e0 <_ChromeMain+0x4682e44>
 4687df4: f9400296     	ldr	x22, [x20]
 4687df8: f943f268     	ldr	x8, [x19, #0x7e0]
 4687dfc: f90033e8     	str	x8, [sp, #0x60]
 4687e00: f0054408     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4687e04: 91120108     	add	x8, x8, #0x480
 4687e08: f8bfc100     	ldapr	x0, [x8]
 4687e0c: b4002580     	cbz	x0, 0x46882bc <_ChromeMain+0x4683020>
 4687e10: 5280b401     	mov	w1, #0x5a0              ; =1440
 4687e14: d2800002     	mov	x2, #0x0                ; =0
 4687e18: 96e88de6     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4687e1c: aa0003f5     	mov	x21, x0
 4687e20: f943e279     	ldr	x25, [x19, #0x7c0]
 4687e24: f943e678     	ldr	x24, [x19, #0x7c8]
 4687e28: 91120348     	add	x8, x26, #0x480
 4687e2c: a900201a     	stp	x26, x8, [x0]
 4687e30: 9112a348     	add	x8, x26, #0x4a8
 4687e34: f9000808     	str	x8, [x0, #0x10]
 4687e38: 91138348     	add	x8, x26, #0x4e0
 4687e3c: 91144349     	add	x9, x26, #0x510
 4687e40: a906a408     	stp	x8, x9, [x0, #0x68]
 4687e44: 91158348     	add	x8, x26, #0x560
 4687e48: f9005808     	str	x8, [x0, #0xb0]
 4687e4c: 91170348     	add	x8, x26, #0x5c0
 4687e50: f9006c08     	str	x8, [x0, #0xd8]
 4687e54: 9117c348     	add	x8, x26, #0x5f0
 4687e58: f9007c08     	str	x8, [x0, #0xf8]
 4687e5c: 91186348     	add	x8, x26, #0x618
 4687e60: f9018808     	str	x8, [x0, #0x310]
 4687e64: 911a6348     	add	x8, x26, #0x698
 4687e68: f9018c08     	str	x8, [x0, #0x318]
 4687e6c: 911d6348     	add	x8, x26, #0x758
 4687e70: f9019008     	str	x8, [x0, #0x320]
 4687e74: 911e4348     	add	x8, x26, #0x790
 4687e78: f9025808     	str	x8, [x0, #0x4b0]
 4687e7c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4687e80: f9404789     	ldr	x9, [x28, #0x88]
 4687e84: eb09011f     	cmp	x8, x9
 4687e88: 54000061     	b.ne	0x4687e94 <_ChromeMain+0x4682bf8>
 4687e8c: aa1503e0     	mov	x0, x21
 4687e90: 96e6311b     	bl	0x142fc <_ChromeMain+0xf060>
 4687e94: 52800700     	mov	w0, #0x38               ; =56
 4687e98: 96e61d34     	bl	0xf368 <_ChromeMain+0xa0cc>
 4687e9c: b9000017     	str	w23, [x0]
 4687ea0: d0ffc728     	adrp	x8, 0x3f6d000 <_ChromeMain+0x3f67d64>
 4687ea4: 91050109     	add	x9, x8, #0x140
 4687ea8: b0fea1e8     	adrp	x8, 0x1ac4000 <_ChromeMain+0x1abed64>
 4687eac: 91180108     	add	x8, x8, #0x600
 4687eb0: a900a009     	stp	x9, x8, [x0, #0x8]
 4687eb4: d0fef6a8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4687eb8: 912c0109     	add	x9, x8, #0xb00
 4687ebc: 100079a8     	adr	x8, 0x4688df0 <_ChromeMain+0x4683b54>
 4687ec0: d503201f     	nop
 4687ec4: a901a009     	stp	x9, x8, [x0, #0x18]
 4687ec8: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4687ecc: f81703a0     	stur	x0, [x29, #-0x90]
 4687ed0: 52800048     	mov	w8, #0x2                ; =2
 4687ed4: 381783a8     	sturb	w8, [x29, #-0x88]
 4687ed8: d10243a1     	sub	x1, x29, #0x90
 4687edc: aa1503e0     	mov	x0, x21
 4687ee0: 97339968     	bl	0x136e480 <_ChromeMain+0x13691e4>
 4687ee4: 385783a8     	ldurb	w8, [x29, #-0x88]
 4687ee8: 7103fd1f     	cmp	w8, #0xff
 4687eec: 54000060     	b.eq	0x4687ef8 <_ChromeMain+0x4682c5c>
 4687ef0: f85703a0     	ldur	x0, [x29, #-0x90]
 4687ef4: b5000e40     	cbnz	x0, 0x46880bc <_ChromeMain+0x4682e20>
 4687ef8: 52801fe8     	mov	w8, #0xff               ; =255
 4687efc: 381783a8     	sturb	w8, [x29, #-0x88]
 4687f00: 91120348     	add	x8, x26, #0x480
 4687f04: a90022ba     	stp	x26, x8, [x21]
 4687f08: 9112a348     	add	x8, x26, #0x4a8
 4687f0c: f9000aa8     	str	x8, [x21, #0x10]
 4687f10: 91138348     	add	x8, x26, #0x4e0
 4687f14: 91144349     	add	x9, x26, #0x510
 4687f18: a906a6a8     	stp	x8, x9, [x21, #0x68]
 4687f1c: 91158348     	add	x8, x26, #0x560
 4687f20: f9005aa8     	str	x8, [x21, #0xb0]
 4687f24: 91170348     	add	x8, x26, #0x5c0
 4687f28: f9006ea8     	str	x8, [x21, #0xd8]
 4687f2c: 9117c348     	add	x8, x26, #0x5f0
 4687f30: f9007ea8     	str	x8, [x21, #0xf8]
 4687f34: 91186348     	add	x8, x26, #0x618
 4687f38: f9018aa8     	str	x8, [x21, #0x310]
 4687f3c: 911a6348     	add	x8, x26, #0x698
 4687f40: f9018ea8     	str	x8, [x21, #0x318]
 4687f44: 911d6348     	add	x8, x26, #0x758
 4687f48: f90192a8     	str	x8, [x21, #0x320]
 4687f4c: 9004f428     	adrp	x8, 0xe50b000 <dyld_stub_binder+0xe50b000>
 4687f50: 912d4108     	add	x8, x8, #0xb50
 4687f54: f9025aa8     	str	x8, [x21, #0x4b0]
 4687f58: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 4687f5c: f9404788     	ldr	x8, [x28, #0x88]
 4687f60: eb08013f     	cmp	x9, x8
 4687f64: 54000061     	b.ne	0x4687f70 <_ChromeMain+0x4682cd4>
 4687f68: aa1503e0     	mov	x0, x21
 4687f6c: 96e630e4     	bl	0x142fc <_ChromeMain+0xf060>
 4687f70: f9025eb5     	str	x21, [x21, #0x4b8]
 4687f74: 3915a2bf     	strb	wzr, [x21, #0x568]
 4687f78: b4001af5     	cbz	x21, 0x46882d4 <_ChromeMain+0x4683038>
 4687f7c: 91120348     	add	x8, x26, #0x480
 4687f80: a90022ba     	stp	x26, x8, [x21]
 4687f84: 9112a348     	add	x8, x26, #0x4a8
 4687f88: f9000aa8     	str	x8, [x21, #0x10]
 4687f8c: 91138348     	add	x8, x26, #0x4e0
 4687f90: 91144349     	add	x9, x26, #0x510
 4687f94: a906a6a8     	stp	x8, x9, [x21, #0x68]
 4687f98: 91158348     	add	x8, x26, #0x560
 4687f9c: f9005aa8     	str	x8, [x21, #0xb0]
 4687fa0: 91170348     	add	x8, x26, #0x5c0
 4687fa4: f9006ea8     	str	x8, [x21, #0xd8]
 4687fa8: 9117c348     	add	x8, x26, #0x5f0
 4687fac: f9007ea8     	str	x8, [x21, #0xf8]
 4687fb0: 91186348     	add	x8, x26, #0x618
 4687fb4: f9018aa8     	str	x8, [x21, #0x310]
 4687fb8: 911a6348     	add	x8, x26, #0x698
 4687fbc: f9018ea8     	str	x8, [x21, #0x318]
 4687fc0: 911d6348     	add	x8, x26, #0x758
 4687fc4: f90192a8     	str	x8, [x21, #0x320]
 4687fc8: 911e4348     	add	x8, x26, #0x790
 4687fcc: f9025aa8     	str	x8, [x21, #0x4b0]
 4687fd0: 925e7728     	and	x8, x25, #0xfffffffc00000000
 4687fd4: f9404789     	ldr	x9, [x28, #0x88]
 4687fd8: eb09011f     	cmp	x8, x9
 4687fdc: 54000061     	b.ne	0x4687fe8 <_ChromeMain+0x4682d4c>
 4687fe0: aa1903e0     	mov	x0, x25
 4687fe4: 96e630c6     	bl	0x142fc <_ChromeMain+0xf060>
 4687fe8: f902bab9     	str	x25, [x21, #0x570]
 4687fec: 925e7708     	and	x8, x24, #0xfffffffc00000000
 4687ff0: f9404789     	ldr	x9, [x28, #0x88]
 4687ff4: eb09011f     	cmp	x8, x9
 4687ff8: 54000061     	b.ne	0x4688004 <_ChromeMain+0x4682d68>
 4687ffc: aa1803e0     	mov	x0, x24
 4688000: 96e630bf     	bl	0x142fc <_ChromeMain+0xf060>
 4688004: f902beb8     	str	x24, [x21, #0x578]
 4688008: b94012c8     	ldr	w8, [x22, #0x10]
 468800c: b90582a8     	str	w8, [x21, #0x580]
 4688010: f902c6bf     	str	xzr, [x21, #0x588]
 4688014: f902cebf     	str	xzr, [x21, #0x598]
 4688018: f902cabf     	str	xzr, [x21, #0x590]
 468801c: aa1503e0     	mov	x0, x21
 4688020: 52800021     	mov	w1, #0x1                ; =1
 4688024: 973abdee     	bl	0x15377dc <_ChromeMain+0x1532540>
 4688028: 52800038     	mov	w24, #0x1               ; =1
 468802c: 39072eb8     	strb	w24, [x21, #0x1cb]
 4688030: 52800400     	mov	w0, #0x20               ; =32
 4688034: 96e61ccd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4688038: aa0003e1     	mov	x1, x0
 468803c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4688040: b9000808     	str	w8, [x0, #0x8]
 4688044: 52800037     	mov	w23, #0x1               ; =1
 4688048: 39003018     	strb	w24, [x0, #0xc]
 468804c: 9004e628     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4688050: 91044108     	add	x8, x8, #0x110
 4688054: f9000008     	str	x8, [x0]
 4688058: 3dc00fe0     	ldr	q0, [sp, #0x30]
 468805c: 3d800400     	str	q0, [x0, #0x10]
 4688060: f94002a8     	ldr	x8, [x21]
 4688064: f9408908     	ldr	x8, [x8, #0x110]
 4688068: aa1503e0     	mov	x0, x21
 468806c: d63f0100     	blr	x8
 4688070: aa1503e9     	mov	x9, x21
 4688074: f84e8d28     	ldr	x8, [x9, #0xe8]!
 4688078: b4ffbe68     	cbz	x8, 0x4687844 <_ChromeMain+0x46825a8>
 468807c: f940110a     	ldr	x10, [x8, #0x20]
 4688080: 90051beb     	adrp	x11, 0xea04000 <dyld_stub_binder+0xea04000>
 4688084: 9123416b     	add	x11, x11, #0x8d0
 4688088: eb0b015f     	cmp	x10, x11
 468808c: 54000128     	b.hi	0x46880b0 <_ChromeMain+0x4682e14>
 4688090: 54ffbd42     	b.hs	0x4687838 <_ChromeMain+0x468259c>
 4688094: f9400508     	ldr	x8, [x8, #0x8]
 4688098: b5ffff28     	cbnz	x8, 0x468807c <_ChromeMain+0x4682de0>
 468809c: 17fffdea     	b	0x4687844 <_ChromeMain+0x46825a8>
 46880a0: a94f0be1     	ldp	x1, x2, [sp, #0xf0]
 46880a4: 9102c3e0     	add	x0, sp, #0xb0
 46880a8: 96e6faca     	bl	0x46bd0 <_ChromeMain+0x41934>
 46880ac: 17ffff3d     	b	0x4687da0 <_ChromeMain+0x4682b04>
 46880b0: f9400108     	ldr	x8, [x8]
 46880b4: b5fffe48     	cbnz	x8, 0x468807c <_ChromeMain+0x4682de0>
 46880b8: 17fffde3     	b	0x4687844 <_ChromeMain+0x46825a8>
 46880bc: 12800008     	mov	w8, #-0x1               ; =-1
 46880c0: b8e80008     	ldaddal	w8, w8, [x0]
 46880c4: 7100051f     	cmp	w8, #0x1
 46880c8: 54fff181     	b.ne	0x4687ef8 <_ChromeMain+0x4682c5c>
 46880cc: f9400808     	ldr	x8, [x0, #0x10]
 46880d0: d63f0100     	blr	x8
 46880d4: 17ffff89     	b	0x4687ef8 <_ChromeMain+0x4682c5c>
 46880d8: 979f938a     	bl	0x2e6cf00 <_ChromeMain+0x2e67c64>
 46880dc: 17ffff29     	b	0x4687d80 <_ChromeMain+0x4682ae4>
 46880e0: f94037f4     	ldr	x20, [sp, #0x68]
 46880e4: b4ffb534     	cbz	x20, 0x4687788 <_ChromeMain+0x46824ec>
 46880e8: f9403be8     	ldr	x8, [sp, #0x70]
 46880ec: d37df109     	lsl	x9, x8, #3
 46880f0: b4000109     	cbz	x9, 0x4688110 <_ChromeMain+0x4682e74>
 46880f4: cb080fe8     	neg	x8, x8, lsl #3
 46880f8: 8b140129     	add	x9, x9, x20
 46880fc: d1002129     	sub	x9, x9, #0x8
 4688100: b4000dc9     	cbz	x9, 0x46882b8 <_ChromeMain+0x468301c>
 4688104: d1002129     	sub	x9, x9, #0x8
 4688108: 91002108     	add	x8, x8, #0x8
 468810c: b5ffffa8     	cbnz	x8, 0x4688100 <_ChromeMain+0x4682e64>
 4688110: f9003bff     	str	xzr, [sp, #0x70]
 4688114: f9403fe8     	ldr	x8, [sp, #0x78]
 4688118: d37df101     	lsl	x1, x8, #3
 468811c: aa1403e0     	mov	x0, x20
 4688120: 96e60366     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4688124: 17fffd99     	b	0x4687788 <_ChromeMain+0x46824ec>
 4688128: f9407fe8     	ldr	x8, [sp, #0xf8]
 468812c: d37ef509     	lsl	x9, x8, #2
 4688130: b4000109     	cbz	x9, 0x4688150 <_ChromeMain+0x4682eb4>
 4688134: cb080be8     	neg	x8, x8, lsl #2
 4688138: 8b000129     	add	x9, x9, x0
 468813c: d1001129     	sub	x9, x9, #0x4
 4688140: b4000bc9     	cbz	x9, 0x46882b8 <_ChromeMain+0x468301c>
 4688144: d1001129     	sub	x9, x9, #0x4
 4688148: 91001108     	add	x8, x8, #0x4
 468814c: b5ffffa8     	cbnz	x8, 0x4688140 <_ChromeMain+0x4682ea4>
 4688150: f9007fff     	str	xzr, [sp, #0xf8]
 4688154: f94083e8     	ldr	x8, [sp, #0x100]
 4688158: d37ef501     	lsl	x1, x8, #2
 468815c: 96e60357     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4688160: 14000010     	b	0x46881a0 <_ChromeMain+0x4682f04>
 4688164: f9400680     	ldr	x0, [x20, #0x8]
 4688168: 911f4261     	add	x1, x19, #0x7d0
 468816c: 94dafc63     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4688170: b4ffb0c0     	cbz	x0, 0x4687788 <_ChromeMain+0x46824ec>
 4688174: 949dd1b0     	bl	0x6dfc834 <_ChromeMain+0x6df7598>
 4688178: f9005be0     	str	x0, [sp, #0xb0]
 468817c: 9103c3e8     	add	x8, sp, #0xf0
 4688180: 9102c3e0     	add	x0, sp, #0xb0
 4688184: 9525e56f     	bl	0x9001740 <_ChromeMain+0x8ffc4a4>
 4688188: 9101a3e8     	add	x8, sp, #0x68
 468818c: 9103c3e1     	add	x1, sp, #0xf0
 4688190: aa1403e0     	mov	x0, x20
 4688194: 94db16d1     	bl	0x7d4dcd8 <_ChromeMain+0x7d48a3c>
 4688198: f9407be0     	ldr	x0, [sp, #0xf0]
 468819c: b5fffc60     	cbnz	x0, 0x4688128 <_ChromeMain+0x4682e8c>
 46881a0: a946a3f4     	ldp	x20, x8, [sp, #0x68]
 46881a4: d37df109     	lsl	x9, x8, #3
 46881a8: b4fff9e9     	cbz	x9, 0x46880e4 <_ChromeMain+0x4682e48>
 46881ac: 8b080e88     	add	x8, x20, x8, lsl #3
 46881b0: f90003e8     	str	x8, [sp]
 46881b4: 9103c3fb     	add	x27, sp, #0xf0
 46881b8: 9102c3e9     	add	x9, sp, #0xb0
 46881bc: 91004928     	add	x8, x9, #0x12
 46881c0: 9004c80a     	adrp	x10, 0xdf88000 <dyld_stub_binder+0xdf88000>
 46881c4: 9100894a     	add	x10, x10, #0x22
 46881c8: eb0a013f     	cmp	x9, x10
 46881cc: fa4a9100     	ccmp	x8, x10, #0x0, ls
 46881d0: 1a9f97e8     	cset	w8, hi
 46881d4: b9004fe8     	str	w8, [sp, #0x4c]
 46881d8: 910203e8     	add	x8, sp, #0x80
 46881dc: 91004909     	add	x9, x8, #0x12
 46881e0: eb0a011f     	cmp	x8, x10
 46881e4: fa4a9120     	ccmp	x9, x10, #0x0, ls
 46881e8: 1a9f97e8     	cset	w8, hi
 46881ec: b9000fe8     	str	w8, [sp, #0xc]
 46881f0: 9005057a     	adrp	x26, 0xe734000 <dyld_stub_binder+0xe734000>
 46881f4: 912fc35a     	add	x26, x26, #0xbf0
 46881f8: d005295c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46881fc: 52800037     	mov	w23, #0x1               ; =1
 4688200: f004c5e8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4688204: 3dc2b100     	ldr	q0, [x8, #0xac0]
 4688208: 3d800fe0     	str	q0, [sp, #0x30]
 468820c: 9004c5c8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4688210: 3dc02500     	ldr	q0, [x8, #0x90]
 4688214: 3d800be0     	str	q0, [sp, #0x20]
 4688218: 2f06e408     	movi	d8, #0xffff000000000000
 468821c: d503201f     	nop
 4688220: 3dc1e100     	ldr	q0, [x8, #0x780]
 4688224: 3d8007e0     	str	q0, [sp, #0x10]
 4688228: 0f000429     	movi.2s	v9, #0x1
 468822c: 0f00060a     	movi.2s	v10, #0x10
 4688230: 17fffef1     	b	0x4687df4 <_ChromeMain+0x4682b58>
 4688234: 12800008     	mov	w8, #-0x1               ; =-1
 4688238: b8e80008     	ldaddal	w8, w8, [x0]
 468823c: 7100051f     	cmp	w8, #0x1
 4688240: 54ffd0c1     	b.ne	0x4687c58 <_ChromeMain+0x46829bc>
 4688244: f9400808     	ldr	x8, [x0, #0x10]
 4688248: d63f0100     	blr	x8
 468824c: 17fffe83     	b	0x4687c58 <_ChromeMain+0x46829bc>
 4688250: 972177ac     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4688254: 35000700     	cbnz	w0, 0x4688334 <_ChromeMain+0x4683098>
 4688258: aa1603e0     	mov	x0, x22
 468825c: 973158fe     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4688260: f94166c8     	ldr	x8, [x22, #0x2c8]
 4688264: f90166c0     	str	x0, [x22, #0x2c8]
 4688268: b4ffd468     	cbz	x8, 0x4687cf4 <_ChromeMain+0x4682a58>
 468826c: f9400109     	ldr	x9, [x8]
 4688270: f9400529     	ldr	x9, [x9, #0x8]
 4688274: aa0803e0     	mov	x0, x8
 4688278: d63f0120     	blr	x9
 468827c: f94166c0     	ldr	x0, [x22, #0x2c8]
 4688280: 17fffe9d     	b	0x4687cf4 <_ChromeMain+0x4682a58>
 4688284: 9721779f     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4688288: 35000600     	cbnz	w0, 0x4688348 <_ChromeMain+0x46830ac>
 468828c: aa1503e0     	mov	x0, x21
 4688290: 973158f1     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4688294: aa0003f6     	mov	x22, x0
 4688298: f94166a0     	ldr	x0, [x21, #0x2c8]
 468829c: f90166b6     	str	x22, [x21, #0x2c8]
 46882a0: b4ffd740     	cbz	x0, 0x4687d88 <_ChromeMain+0x4682aec>
 46882a4: f9400008     	ldr	x8, [x0]
 46882a8: f9400508     	ldr	x8, [x8, #0x8]
 46882ac: d63f0100     	blr	x8
 46882b0: f94166b6     	ldr	x22, [x21, #0x2c8]
 46882b4: 17fffeb5     	b	0x4687d88 <_ChromeMain+0x4682aec>
 46882b8: d4200020     	brk	#0x1
 46882bc: 97f12d0f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46882c0: 17fffed4     	b	0x4687e10 <_ChromeMain+0x4682b74>
 46882c4: 97f12d0d     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46882c8: 17fffd99     	b	0x468792c <_ChromeMain+0x4682690>
 46882cc: 97f12d0b     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46882d0: 17fffde3     	b	0x4687a5c <_ChromeMain+0x46827c0>
 46882d4: d4200000     	brk	#0
 46882d8: d4400000     	hlt	#0
 46882dc: d4200020     	brk	#0x1
 46882e0: d4200000     	brk	#0
 46882e4: d4400000     	hlt	#0
 46882e8: d4200020     	brk	#0x1
 46882ec: d4200000     	brk	#0
 46882f0: d4400000     	hlt	#0
 46882f4: d4200020     	brk	#0x1
 46882f8: d4200000     	brk	#0
 46882fc: d4400000     	hlt	#0
 4688300: d4200020     	brk	#0x1
 4688304: d4200000     	brk	#0
 4688308: d4400000     	hlt	#0
 468830c: d4200020     	brk	#0x1
 4688310: d2800008     	mov	x8, #0x0                ; =0
 4688314: 17fffd4c     	b	0x4687844 <_ChromeMain+0x46825a8>
 4688318: 7100091f     	cmp	w8, #0x2
 468831c: 54ffa6e1     	b.ne	0x46877f8 <_ChromeMain+0x468255c>
 4688320: b9411be8     	ldr	w8, [sp, #0x118]
 4688324: 34ffa6a8     	cbz	w8, 0x46877f8 <_ChromeMain+0x468255c>
 4688328: b9411fe8     	ldr	w8, [sp, #0x11c]
 468832c: 34ffa668     	cbz	w8, 0x46877f8 <_ChromeMain+0x468255c>
 4688330: 17fffdbb     	b	0x4687a1c <_ChromeMain+0x4682780>
 4688334: 52803600     	mov	w0, #0x1b0              ; =432
 4688338: 96e61c0c     	bl	0xf368 <_ChromeMain+0xa0cc>
 468833c: aa1603e1     	mov	x1, x22
 4688340: 97217610     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4688344: 17ffffc7     	b	0x4688260 <_ChromeMain+0x4682fc4>
 4688348: 52803600     	mov	w0, #0x1b0              ; =432
 468834c: 96e61c07     	bl	0xf368 <_ChromeMain+0xa0cc>
 4688350: aa0003f6     	mov	x22, x0
 4688354: aa1503e1     	mov	x1, x21
 4688358: 9721760a     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 468835c: 17ffffcf     	b	0x4688298 <_ChromeMain+0x4682ffc>
