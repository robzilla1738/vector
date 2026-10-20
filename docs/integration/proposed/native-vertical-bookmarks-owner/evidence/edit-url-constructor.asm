
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  3701d4: d10283ff     	sub	sp, sp, #0xa0
  3701d8: a9046ffc     	stp	x28, x27, [sp, #0x40]
  3701dc: a90567fa     	stp	x26, x25, [sp, #0x50]
  3701e0: a9065ff8     	stp	x24, x23, [sp, #0x60]
  3701e4: a90757f6     	stp	x22, x21, [sp, #0x70]
  3701e8: a9084ff4     	stp	x20, x19, [sp, #0x80]
  3701ec: a9097bfd     	stp	x29, x30, [sp, #0x90]
  3701f0: 910243fd     	add	x29, sp, #0x90
  3701f4: aa0003f3     	mov	x19, x0
  3701f8: a9007c1f     	stp	xzr, xzr, [x0]
  3701fc: f900081f     	str	xzr, [x0, #0x10]
  370200: 7801901f     	sturh	wzr, [x0, #0x19]
  370204: 6f07e600     	movi.2d	v0, #0xffffffff00000000
  370208: aa0003f5     	mov	x21, x0
  37020c: 3c820ea0     	str	q0, [x21, #0x20]!
  370210: ad018000     	stp	q0, q0, [x0, #0x30]
  370214: 3d801400     	str	q0, [x0, #0x50]
  370218: 7900c01f     	strh	wzr, [x0, #0x60]
  37021c: aa0003f4     	mov	x20, x0
  370220: f8070e9f     	str	xzr, [x20, #0x70]!
  370224: d006faa8     	adrp	x8, 0xe2c6000 <dyld_stub_binder+0xe2c6000>
  370228: 9139a108     	add	x8, x8, #0xe68
  37022c: f900341f     	str	xzr, [x0, #0x68]
  370230: a90303ff     	stp	xzr, x0, [sp, #0x30]
  370234: a901ffe8     	stp	x8, xzr, [sp, #0x18]
  370238: f90017ff     	str	xzr, [sp, #0x28]
  37023c: 910063e4     	add	x4, sp, #0x18
  370240: aa0103e0     	mov	x0, x1
  370244: aa0203e1     	mov	x1, x2
  370248: 52800022     	mov	w2, #0x1                ; =1
  37024c: d2800003     	mov	x3, #0x0                ; =0
  370250: aa1503e5     	mov	x5, x21
  370254: 94000112     	bl	0x37069c <_ChromeMain+0x36b400>
  370258: 39006260     	strb	w0, [x19, #0x18]
  37025c: a9436be8     	ldp	x8, x26, [sp, #0x30]
  370260: 39805f5b     	ldrsb	x27, [x26, #0x17]
  370264: b7f8027b     	tbnz	x27, #0x3f, 0x3702b0 <_ChromeMain+0x36b014>
  370268: eb1b0116     	subs	x22, x8, x27
  37026c: 54000a69     	b.ls	0x3703b8 <_ChromeMain+0x36b11c>
  370270: 528002c9     	mov	w9, #0x16               ; =22
  370274: cb1b0129     	sub	x9, x9, x27
  370278: eb16013f     	cmp	x9, x22
  37027c: 54000323     	b.lo	0x3702e0 <_ChromeMain+0x36b044>
  370280: aa1b03f7     	mov	x23, x27
  370284: aa1a03f8     	mov	x24, x26
  370288: 8b170300     	add	x0, x24, x23
  37028c: aa1603e1     	mov	x1, x22
  370290: 95f26560     	bl	0x8009810 <_ChromeMain+0x8004574>
  370294: 8b1602e8     	add	x8, x23, x22
  370298: 39c05f49     	ldrsb	w9, [x26, #0x17]
  37029c: 37f80509     	tbnz	w9, #0x1f, 0x37033c <_ChromeMain+0x36b0a0>
  3702a0: 12001909     	and	w9, w8, #0x7f
  3702a4: 39005f49     	strb	w9, [x26, #0x17]
  3702a8: 38286b1f     	strb	wzr, [x24, x8]
  3702ac: 14000045     	b	0x3703c0 <_ChromeMain+0x36b124>
  3702b0: f9400757     	ldr	x23, [x26, #0x8]
  3702b4: eb170116     	subs	x22, x8, x23
  3702b8: 540003c9     	b.ls	0x370330 <_ChromeMain+0x36b094>
  3702bc: f9400b4a     	ldr	x10, [x26, #0x10]
  3702c0: 9240f949     	and	x9, x10, #0x7fffffffffffffff
  3702c4: aa3703eb     	mvn	x11, x23
  3702c8: 8b0b012b     	add	x11, x9, x11
  3702cc: eb16017f     	cmp	x11, x22
  3702d0: 54000fc3     	b.lo	0x3704c8 <_ChromeMain+0x36b22c>
  3702d4: b6fffd8a     	tbz	x10, #0x3f, 0x370284 <_ChromeMain+0x36afe8>
  3702d8: f9400358     	ldr	x24, [x26]
  3702dc: 17ffffeb     	b	0x370288 <_ChromeMain+0x36afec>
  3702e0: 92800229     	mov	x9, #-0x12              ; =-18
  3702e4: f2efffe9     	movk	x9, #0x7fff, lsl #48
  3702e8: eb09011f     	cmp	x8, x9
  3702ec: 54001b88     	b.hi	0x37065c <_ChromeMain+0x36b3c0>
  3702f0: 52800589     	mov	w9, #0x2c               ; =44
  3702f4: f100b11f     	cmp	x8, #0x2c
  3702f8: 9a898108     	csel	x8, x8, x9, hi
  3702fc: 927ce908     	and	x8, x8, #0x7ffffffffffffff0
  370300: 91004119     	add	x25, x8, #0x10
  370304: aa1903e0     	mov	x0, x25
  370308: 97f27c18     	bl	0xf368 <_ChromeMain+0xa0cc>
  37030c: aa0003f8     	mov	x24, x0
  370310: aa1b03f7     	mov	x23, x27
  370314: aa1a03e1     	mov	x1, x26
  370318: b5001017     	cbnz	x23, 0x370518 <_ChromeMain+0x36b27c>
  37031c: 37f8115b     	tbnz	w27, #0x1f, 0x370544 <_ChromeMain+0x36b2a8>
  370320: b2410328     	orr	x8, x25, #0x8000000000000000
  370324: a900a357     	stp	x23, x8, [x26, #0x8]
  370328: f9000358     	str	x24, [x26]
  37032c: 17ffffd7     	b	0x370288 <_ChromeMain+0x36afec>
  370330: f9000748     	str	x8, [x26, #0x8]
  370334: f940035a     	ldr	x26, [x26]
  370338: 14000021     	b	0x3703bc <_ChromeMain+0x36b120>
  37033c: f9000748     	str	x8, [x26, #0x8]
  370340: 38286b1f     	strb	wzr, [x24, x8]
  370344: 1400001f     	b	0x3703c0 <_ChromeMain+0x36b124>
  370348: b940266a     	ldr	w10, [x19, #0x24]
  37034c: 7100055f     	cmp	w10, #0x1
  370350: 5400040b     	b.lt	0x3703d0 <_ChromeMain+0x36b134>
  370354: 39405e68     	ldrb	w8, [x19, #0x17]
  370358: f9400669     	ldr	x9, [x19, #0x8]
  37035c: 7219011f     	tst	w8, #0x80
  370360: 9a88112c     	csel	x12, x9, x8, ne
  370364: b980226b     	ldrsw	x11, [x19, #0x20]
  370368: eb0b018c     	subs	x12, x12, x11
  37036c: 54001723     	b.lo	0x370650 <_ChromeMain+0x36b3b4>
  370370: eb0a019f     	cmp	x12, x10
  370374: 9a8a318a     	csel	x10, x12, x10, lo
  370378: f100295f     	cmp	x10, #0xa
  37037c: 540002a1     	b.ne	0x3703d0 <_ChromeMain+0x36b134>
  370380: f940026a     	ldr	x10, [x19]
  370384: 7219011f     	tst	w8, #0x80
  370388: 9a93114c     	csel	x12, x10, x19, ne
  37038c: 8b0b018b     	add	x11, x12, x11
  370390: f006510c     	adrp	x12, 0xcd93000 <dyld_stub_binder+0xcd93000>
  370394: 9106098c     	add	x12, x12, #0x182
  370398: f940016d     	ldr	x13, [x11]
  37039c: f940018e     	ldr	x14, [x12]
  3703a0: 7940116b     	ldrh	w11, [x11, #0x8]
  3703a4: 7940118c     	ldrh	w12, [x12, #0x8]
  3703a8: eb0e01bf     	cmp	x13, x14
  3703ac: fa4c0160     	ccmp	x11, x12, #0x0, eq
  3703b0: 54000101     	b.ne	0x3703d0 <_ChromeMain+0x36b134>
  3703b4: 1400008e     	b	0x3705ec <_ChromeMain+0x36b350>
  3703b8: 39005f48     	strb	w8, [x26, #0x17]
  3703bc: 38286b5f     	strb	wzr, [x26, x8]
  3703c0: f9401be8     	ldr	x8, [sp, #0x30]
  3703c4: f90017e8     	str	x8, [sp, #0x28]
  3703c8: 39406268     	ldrb	w8, [x19, #0x18]
  3703cc: 35fffbe8     	cbnz	w8, 0x370348 <_ChromeMain+0x36b0ac>
  3703d0: 90075cc8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
  3703d4: f9402108     	ldr	x8, [x8, #0x40]
  3703d8: b4000c08     	cbz	x8, 0x370558 <_ChromeMain+0x36b2bc>
  3703dc: d0075ce8     	adrp	x8, 0xef0e000 <dyld_stub_binder+0xef0e000>
  3703e0: 913de108     	add	x8, x8, #0xf78
  3703e4: 38bfc108     	ldaprb	w8, [x8]
  3703e8: d0075cf5     	adrp	x21, 0xef0e000 <dyld_stub_binder+0xef0e000>
  3703ec: 36000be8     	tbz	w8, #0x0, 0x370568 <_ChromeMain+0x36b2cc>
  3703f0: 397dc2a8     	ldrb	w8, [x21, #0xf70]
  3703f4: 34000b28     	cbz	w8, 0x370558 <_ChromeMain+0x36b2bc>
  3703f8: b940266a     	ldr	w10, [x19, #0x24]
  3703fc: 7100055f     	cmp	w10, #0x1
  370400: 540001eb     	b.lt	0x37043c <_ChromeMain+0x36b1a0>
  370404: 39405e69     	ldrb	w9, [x19, #0x17]
  370408: 13001d28     	sxtb	w8, w9
  37040c: f940066b     	ldr	x11, [x19, #0x8]
  370410: 7100011f     	cmp	w8, #0x0
  370414: 9a89416b     	csel	x11, x11, x9, mi
  370418: b9802269     	ldrsw	x9, [x19, #0x20]
  37041c: eb09016b     	subs	x11, x11, x9
  370420: 54001183     	b.lo	0x370650 <_ChromeMain+0x36b3b4>
  370424: eb0a017f     	cmp	x11, x10
  370428: 9a8a316a     	csel	x10, x11, x10, lo
  37042c: f100155f     	cmp	x10, #0x5
  370430: 540001e0     	b.eq	0x37046c <_ChromeMain+0x36b1d0>
  370434: f100115f     	cmp	x10, #0x4
  370438: 54000360     	b.eq	0x3704a4 <_ChromeMain+0x36b208>
  37043c: 52800008     	mov	w8, #0x0                ; =0
  370440: 32180108     	orr	w8, w8, #0x100
  370444: 78019268     	sturh	w8, [x19, #0x19]
  370448: aa1303e0     	mov	x0, x19
  37044c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
  370450: a9484ff4     	ldp	x20, x19, [sp, #0x80]
  370454: a94757f6     	ldp	x22, x21, [sp, #0x70]
  370458: a9465ff8     	ldp	x24, x23, [sp, #0x60]
  37045c: a94567fa     	ldp	x26, x25, [sp, #0x50]
  370460: a9446ffc     	ldp	x28, x27, [sp, #0x40]
  370464: 910283ff     	add	sp, sp, #0xa0
  370468: d65f03c0     	ret
  37046c: f940026a     	ldr	x10, [x19]
  370470: 7100011f     	cmp	w8, #0x0
  370474: 9a934148     	csel	x8, x10, x19, mi
  370478: 8b090108     	add	x8, x8, x9
  37047c: b9400109     	ldr	w9, [x8]
  370480: 9006458a     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
  370484: 9101154a     	add	x10, x10, #0x45
  370488: b940014b     	ldr	w11, [x10]
  37048c: 39401108     	ldrb	w8, [x8, #0x4]
  370490: 3940114a     	ldrb	w10, [x10, #0x4]
  370494: 6b0b013f     	cmp	w9, w11
  370498: 7a4a0100     	ccmp	w8, w10, #0x0, eq
  37049c: 1a9f17e8     	cset	w8, eq
  3704a0: 17ffffe8     	b	0x370440 <_ChromeMain+0x36b1a4>
  3704a4: f940026a     	ldr	x10, [x19]
  3704a8: 7100011f     	cmp	w8, #0x0
  3704ac: 9a934148     	csel	x8, x10, x19, mi
  3704b0: b8696908     	ldr	w8, [x8, x9]
  3704b4: 90064589     	adrp	x9, 0xcc20000 <dyld_stub_binder+0xcc20000>
  3704b8: 91012d29     	add	x9, x9, #0x4b
  3704bc: b9400129     	ldr	w9, [x9]
  3704c0: 6b09011f     	cmp	w8, w9
  3704c4: 17fffff6     	b	0x37049c <_ChromeMain+0x36b200>
  3704c8: 9280022a     	mov	x10, #-0x12             ; =-18
  3704cc: f2efffea     	movk	x10, #0x7fff, lsl #48
  3704d0: eb0a011f     	cmp	x8, x10
  3704d4: 54000c48     	b.hi	0x37065c <_ChromeMain+0x36b3c0>
  3704d8: d1000529     	sub	x9, x9, #0x1
  3704dc: d37ff92a     	lsl	x10, x9, #1
  3704e0: eb09051f     	cmp	x8, x9, lsl #1
  3704e4: 9a8a8108     	csel	x8, x8, x10, hi
  3704e8: 927ced08     	and	x8, x8, #0xfffffffffffffff0
  3704ec: 91004108     	add	x8, x8, #0x10
  3704f0: 928002ea     	mov	x10, #-0x18             ; =-24
  3704f4: f2e7ffea     	movk	x10, #0x3fff, lsl #48
  3704f8: b27cebeb     	mov	x11, #0x7ffffffffffffff0 ; =9223372036854775792
  3704fc: eb0a013f     	cmp	x9, x10
  370500: 9a8b3119     	csel	x25, x8, x11, lo
  370504: aa1903e0     	mov	x0, x25
  370508: 97f27b98     	bl	0xf368 <_ChromeMain+0xa0cc>
  37050c: aa0003f8     	mov	x24, x0
  370510: f9400341     	ldr	x1, [x26]
  370514: 17ffff81     	b	0x370318 <_ChromeMain+0x36b07c>
  370518: 8b170308     	add	x8, x24, x23
  37051c: eb18011f     	cmp	x8, x24
  370520: 54000a03     	b.lo	0x370660 <_ChromeMain+0x36b3c4>
  370524: eb18003f     	cmp	x1, x24
  370528: 54000063     	b.lo	0x370534 <_ChromeMain+0x36b298>
  37052c: eb08003f     	cmp	x1, x8
  370530: 54000983     	b.lo	0x370660 <_ChromeMain+0x36b3c4>
  370534: aa1803e0     	mov	x0, x24
  370538: aa1703e2     	mov	x2, x23
  37053c: 95f27b64     	bl	0x800f2cc <_ChromeMain+0x800a030>
  370540: 17ffff77     	b	0x37031c <_ChromeMain+0x36b080>
  370544: f9400340     	ldr	x0, [x26]
  370548: f9400b48     	ldr	x8, [x26, #0x10]
  37054c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  370550: 97f2625a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  370554: 17ffff73     	b	0x370320 <_ChromeMain+0x36b084>
  370558: 39406a68     	ldrb	w8, [x19, #0x1a]
  37055c: 34fff768     	cbz	w8, 0x370448 <_ChromeMain+0x36b1ac>
  370560: 39006a7f     	strb	wzr, [x19, #0x1a]
  370564: 17ffffb9     	b	0x370448 <_ChromeMain+0x36b1ac>
  370568: d0075cf4     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
  37056c: 913de294     	add	x20, x20, #0xf78
  370570: aa1403e0     	mov	x0, x20
  370574: 95f250d3     	bl	0x80048c0 <_ChromeMain+0x7fff624>
  370578: 34fff3c0     	cbz	w0, 0x3703f0 <_ChromeMain+0x36b154>
  37057c: f0074260     	adrp	x0, 0xebbf000 <dyld_stub_binder+0xebbf000>
  370580: 91056000     	add	x0, x0, #0x158
  370584: 97f6a33f     	bl	0x119280 <_ChromeMain+0x113fe4>
  370588: 393dc2a0     	strb	w0, [x21, #0xf70]
  37058c: 52800036     	mov	w22, #0x1               ; =1
  370590: 089ffe96     	stlrb	w22, [x20]
  370594: f0074bc0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  370598: 9127c000     	add	x0, x0, #0x9f0
  37059c: 95f250cc     	bl	0x80048cc <_ChromeMain+0x7fff630>
  3705a0: 35000720     	cbnz	w0, 0x370684 <_ChromeMain+0x36b3e8>
  3705a4: d0075ce8     	adrp	x8, 0xef0e000 <dyld_stub_binder+0xef0e000>
  3705a8: 397de514     	ldrb	w20, [x8, #0xf79]
  3705ac: 393de516     	strb	w22, [x8, #0xf79]
  3705b0: f0074bc0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  3705b4: 9127c000     	add	x0, x0, #0x9f0
  3705b8: 95f250d3     	bl	0x8004904 <_ChromeMain+0x7fff668>
  3705bc: 35000540     	cbnz	w0, 0x370664 <_ChromeMain+0x36b3c8>
  3705c0: 3617f194     	tbz	w20, #0x2, 0x3703f0 <_ChromeMain+0x36b154>
  3705c4: f0074bc0     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
  3705c8: 9128c000     	add	x0, x0, #0xa30
  3705cc: 95f250d1     	bl	0x8004910 <_ChromeMain+0x7fff674>
  3705d0: 34fff100     	cbz	w0, 0x3703f0 <_ChromeMain+0x36b154>
  3705d4: 9006dc28     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
  3705d8: 911c4d08     	add	x8, x8, #0x713
  3705dc: f90003e8     	str	x8, [sp]
  3705e0: 9006dc20     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
  3705e4: 911c9c00     	add	x0, x0, #0x727
  3705e8: 95f250cd     	bl	0x800491c <_ChromeMain+0x7fff680>
  3705ec: 7219011f     	tst	w8, #0x80
  3705f0: 9a931156     	csel	x22, x10, x19, ne
  3705f4: 9a881137     	csel	x23, x9, x8, ne
  3705f8: aa1503e0     	mov	x0, x21
  3705fc: 944ff6d1     	bl	0x176e140 <_ChromeMain+0x1768ea4>
  370600: 93407c08     	sxtw	x8, w0
  370604: eb20c2ff     	cmp	x23, w0, sxtw
  370608: 9a8832f5     	csel	x21, x23, x8, lo
  37060c: f9403677     	ldr	x23, [x19, #0x68]
  370610: 52800f00     	mov	w0, #0x78               ; =120
  370614: 97f27b55     	bl	0xf368 <_ChromeMain+0xa0cc>
  370618: aa0003f8     	mov	x24, x0
  37061c: aa1603e1     	mov	x1, x22
  370620: aa1503e2     	mov	x2, x21
  370624: aa1703e3     	mov	x3, x23
  370628: 52800024     	mov	w4, #0x1                ; =1
  37062c: 94012e69     	bl	0x3bbfd0 <_ChromeMain+0x3b6d34>
  370630: f9000bff     	str	xzr, [sp, #0x10]
  370634: aa1403e0     	mov	x0, x20
  370638: aa1803e1     	mov	x1, x24
  37063c: 97f2dd9f     	bl	0x27cb8 <_ChromeMain+0x22a1c>
  370640: 910043e0     	add	x0, sp, #0x10
  370644: d2800001     	mov	x1, #0x0                ; =0
  370648: 97f2dd9c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
  37064c: 17ffff61     	b	0x3703d0 <_ChromeMain+0x36b134>
  370650: 9006a3a0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
  370654: 91376000     	add	x0, x0, #0xdd8
  370658: 95223f1f     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
  37065c: 95223f4c     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
  370660: d4200020     	brk	#0x1
  370664: 9006dc28     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
  370668: 911c4d08     	add	x8, x8, #0x713
  37066c: f90003e8     	str	x8, [sp]
  370670: 9006dc20     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
  370674: 911be000     	add	x0, x0, #0x6f8
  370678: 95f250a9     	bl	0x800491c <_ChromeMain+0x7fff680>
  37067c: 17fffff9     	b	0x370660 <_ChromeMain+0x36b3c4>
  370680: 95f25111     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
  370684: 9006dc28     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
  370688: 911c4d08     	add	x8, x8, #0x713
  37068c: f90003e8     	str	x8, [sp]
  370690: 9006dc20     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
  370694: 911b7400     	add	x0, x0, #0x6dd
  370698: 95f250a1     	bl	0x800491c <_ChromeMain+0x7fff680>
