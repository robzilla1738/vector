
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40fe36c: d103c3ff     	sub	sp, sp, #0xf0
 40fe370: a9096ffc     	stp	x28, x27, [sp, #0x90]
 40fe374: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 40fe378: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 40fe37c: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 40fe380: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 40fe384: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 40fe388: 910383fd     	add	x29, sp, #0xe0
 40fe38c: aa0003f3     	mov	x19, x0
 40fe390: 90056f48     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 40fe394: f9467d00     	ldr	x0, [x8, #0xcf8]
 40fe398: b4000ce0     	cbz	x0, 0x40fe534 <_ChromeMain+0x40f9298>
 40fe39c: 976485f7     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 40fe3a0: b4000ca0     	cbz	x0, 0x40fe534 <_ChromeMain+0x40f9298>
 40fe3a4: aa0003f4     	mov	x20, x0
 40fe3a8: b50001d3     	cbnz	x19, 0x40fe3e0 <_ChromeMain+0x40f9144>
 40fe3ac: 52800500     	mov	w0, #0x28               ; =40
 40fe3b0: 96fc43ee     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fe3b4: aa0003f3     	mov	x19, x0
 40fe3b8: 52800028     	mov	w8, #0x1                ; =1
 40fe3bc: 90fdf8a9     	adrp	x9, 0x12000 <_ChromeMain+0xcd64>
 40fe3c0: 91370129     	add	x9, x9, #0xdc0
 40fe3c4: b0fe790a     	adrp	x10, 0x101f000 <_ChromeMain+0x1019d64>
 40fe3c8: 9118014a     	add	x10, x10, #0x600
 40fe3cc: b9000008     	str	w8, [x0]
 40fe3d0: a900a809     	stp	x9, x10, [x0, #0x8]
 40fe3d4: f0ff22e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40fe3d8: 912c0108     	add	x8, x8, #0xb00
 40fe3dc: f9000c08     	str	x8, [x0, #0x18]
 40fe3e0: aa1403e0     	mov	x0, x20
 40fe3e4: 9764860b     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 40fe3e8: 910163fa     	add	x26, sp, #0x58
 40fe3ec: 91003b49     	add	x9, x26, #0xe
 40fe3f0: 90046f68     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 40fe3f4: 91132908     	add	x8, x8, #0x4ca
 40fe3f8: eb08013f     	cmp	x9, x8
 40fe3fc: fa488342     	ccmp	x26, x8, #0x2, hi
 40fe400: 528000e9     	mov	w9, #0x7                ; =7
 40fe404: 3901bfe9     	strb	w9, [sp, #0x6f]
 40fe408: 54001cc9     	b.ls	0x40fe7a0 <_ChromeMain+0x40f9504>
 40fe40c: aa0003f4     	mov	x20, x0
 40fe410: 52800035     	mov	w21, #0x1               ; =1
 40fe414: f9400116     	ldr	x22, [x8]
 40fe418: f8406118     	ldur	x24, [x8, #0x6]
 40fe41c: 910103f7     	add	x23, sp, #0x40
 40fe420: 910083f9     	add	x25, sp, #0x20
 40fe424: f004f3db     	adrp	x27, 0xdf79000 <dyld_stub_binder+0xdf79000>
 40fe428: 910fb37b     	add	x27, x27, #0x3ec
 40fe42c: a90083f6     	stp	x22, x0, [sp, #0x8]
 40fe430: f90003f8     	str	x24, [sp]
 40fe434: f9002ff6     	str	x22, [sp, #0x58]
 40fe438: f805e3f8     	stur	x24, [sp, #0x5e]
 40fe43c: 7900cfff     	strh	wzr, [sp, #0x66]
 40fe440: 910163e0     	add	x0, sp, #0x58
 40fe444: aa1b03e1     	mov	x1, x27
 40fe448: 52800022     	mov	w2, #0x1                ; =1
 40fe44c: 972c5fe7     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 40fe450: f9400808     	ldr	x8, [x0, #0x10]
 40fe454: 3dc00000     	ldr	q0, [x0]
 40fe458: 3d801fe0     	str	q0, [sp, #0x70]
 40fe45c: f90043e8     	str	x8, [sp, #0x80]
 40fe460: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 40fe464: f900001f     	str	xzr, [x0]
 40fe468: 910103e8     	add	x8, sp, #0x40
 40fe46c: aa1503e0     	mov	x0, x21
 40fe470: 974cfdba     	bl	0x143db58 <_ChromeMain+0x14388bc>
 40fe474: 39815fe8     	ldrsb	x8, [sp, #0x57]
 40fe478: a9442be9     	ldp	x9, x10, [sp, #0x40]
 40fe47c: f100011f     	cmp	x8, #0x0
 40fe480: 9a974121     	csel	x1, x9, x23, mi
 40fe484: 7100011f     	cmp	w8, #0x0
 40fe488: 9a884142     	csel	x2, x10, x8, mi
 40fe48c: 9101c3e0     	add	x0, sp, #0x70
 40fe490: 972c5fd6     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 40fe494: f9400808     	ldr	x8, [x0, #0x10]
 40fe498: 3dc00000     	ldr	q0, [x0]
 40fe49c: 3d800be0     	str	q0, [sp, #0x20]
 40fe4a0: f9001be8     	str	x8, [sp, #0x30]
 40fe4a4: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 40fe4a8: f900001f     	str	xzr, [x0]
 40fe4ac: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 40fe4b0: 36f800a8     	tbz	w8, #0x1f, 0x40fe4c4 <_ChromeMain+0x40f9228>
 40fe4b4: f94023e0     	ldr	x0, [sp, #0x40]
 40fe4b8: f9402be8     	ldr	x8, [sp, #0x50]
 40fe4bc: d37ff901     	lsl	x1, x8, #1
 40fe4c0: 96fc2a7e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe4c4: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 40fe4c8: 36f800a8     	tbz	w8, #0x1f, 0x40fe4dc <_ChromeMain+0x40f9240>
 40fe4cc: f9403be0     	ldr	x0, [sp, #0x70]
 40fe4d0: f94043e8     	ldr	x8, [sp, #0x80]
 40fe4d4: d37ff901     	lsl	x1, x8, #1
 40fe4d8: 96fc2a78     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe4dc: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 40fe4e0: 36f800a8     	tbz	w8, #0x1f, 0x40fe4f4 <_ChromeMain+0x40f9258>
 40fe4e4: f9402fe0     	ldr	x0, [sp, #0x58]
 40fe4e8: f94037e8     	ldr	x8, [sp, #0x68]
 40fe4ec: d37ff901     	lsl	x1, x8, #1
 40fe4f0: 96fc2a72     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe4f4: 910103e8     	add	x8, sp, #0x40
 40fe4f8: aa1403e0     	mov	x0, x20
 40fe4fc: 97648c2d     	bl	0x1a215b0 <_ChromeMain+0x1a1c314>
 40fe500: a94423f7     	ldp	x23, x8, [sp, #0x40]
 40fe504: d37df109     	lsl	x9, x8, #3
 40fe508: b4000c69     	cbz	x9, 0x40fe694 <_ChromeMain+0x40f93f8>
 40fe50c: f9000ff5     	str	x21, [sp, #0x18]
 40fe510: aa1b03f5     	mov	x21, x27
 40fe514: 8b080efc     	add	x28, x23, x8, lsl #3
 40fe518: 3940dfe8     	ldrb	w8, [sp, #0x37]
 40fe51c: 13001d14     	sxtb	w20, w8
 40fe520: 7100029f     	cmp	w20, #0x0
 40fe524: a94227f8     	ldp	x24, x9, [sp, #0x20]
 40fe528: 9a88413b     	csel	x27, x9, x8, mi
 40fe52c: 9a994316     	csel	x22, x24, x25, mi
 40fe530: 1400003c     	b	0x40fe620 <_ChromeMain+0x40f9384>
 40fe534: b4000e93     	cbz	x19, 0x40fe704 <_ChromeMain+0x40f9468>
 40fe538: f9400668     	ldr	x8, [x19, #0x8]
 40fe53c: aa1303e0     	mov	x0, x19
 40fe540: d2800001     	mov	x1, #0x0                ; =0
 40fe544: d63f0100     	blr	x8
 40fe548: 12800008     	mov	w8, #-0x1               ; =-1
 40fe54c: b8e80268     	ldaddal	w8, w8, [x19]
 40fe550: 7100051f     	cmp	w8, #0x1
 40fe554: 54000d81     	b.ne	0x40fe704 <_ChromeMain+0x40f9468>
 40fe558: f9400a61     	ldr	x1, [x19, #0x10]
 40fe55c: aa1303e0     	mov	x0, x19
 40fe560: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 40fe564: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 40fe568: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 40fe56c: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 40fe570: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 40fe574: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 40fe578: 9103c3ff     	add	sp, sp, #0xf0
 40fe57c: d61f0020     	br	x1
 40fe580: 910163e8     	add	x8, sp, #0x58
 40fe584: aa1903e0     	mov	x0, x25
 40fe588: 9784277e     	bl	0x2208380 <_ChromeMain+0x22030e4>
 40fe58c: 3941bfe9     	ldrb	w9, [sp, #0x6f]
 40fe590: 13001d28     	sxtb	w8, w9
 40fe594: f94033ea     	ldr	x10, [sp, #0x60]
 40fe598: 7100011f     	cmp	w8, #0x0
 40fe59c: 9a894149     	csel	x9, x10, x9, mi
 40fe5a0: eb1b013f     	cmp	x9, x27
 40fe5a4: 1a9f17f9     	cset	w25, eq
 40fe5a8: b40001fb     	cbz	x27, 0x40fe5e4 <_ChromeMain+0x40f9348>
 40fe5ac: 540001c1     	b.ne	0x40fe5e4 <_ChromeMain+0x40f9348>
 40fe5b0: f9402fe9     	ldr	x9, [sp, #0x58]
 40fe5b4: 7100011f     	cmp	w8, #0x0
 40fe5b8: 9a9a4129     	csel	x9, x9, x26, mi
 40fe5bc: d100076a     	sub	x10, x27, #0x1
 40fe5c0: aa1603eb     	mov	x11, x22
 40fe5c4: 7840252d     	ldrh	w13, [x9], #0x2
 40fe5c8: 7840256e     	ldrh	w14, [x11], #0x2
 40fe5cc: f100054a     	subs	x10, x10, #0x1
 40fe5d0: 1a9f37ec     	cset	w12, hs
 40fe5d4: 6b0d01df     	cmp	w14, w13
 40fe5d8: 1a9f17f9     	cset	w25, eq
 40fe5dc: 54000041     	b.ne	0x40fe5e4 <_ChromeMain+0x40f9348>
 40fe5e0: 3707ff2c     	tbnz	w12, #0x0, 0x40fe5c4 <_ChromeMain+0x40f9328>
 40fe5e4: 36f800a8     	tbz	w8, #0x1f, 0x40fe5f8 <_ChromeMain+0x40f935c>
 40fe5e8: f9402fe0     	ldr	x0, [sp, #0x58]
 40fe5ec: f94037e8     	ldr	x8, [sp, #0x68]
 40fe5f0: d37ff901     	lsl	x1, x8, #1
 40fe5f4: 96fc2a31     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe5f8: 39421fe8     	ldrb	w8, [sp, #0x87]
 40fe5fc: 363800a8     	tbz	w8, #0x7, 0x40fe610 <_ChromeMain+0x40f9374>
 40fe600: f9403be0     	ldr	x0, [sp, #0x70]
 40fe604: f94043e8     	ldr	x8, [sp, #0x80]
 40fe608: d37ff901     	lsl	x1, x8, #1
 40fe60c: 96fc2a2b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe610: 370008b9     	tbnz	w25, #0x0, 0x40fe724 <_ChromeMain+0x40f9488>
 40fe614: 910022f7     	add	x23, x23, #0x8
 40fe618: eb1c02ff     	cmp	x23, x28
 40fe61c: 540003a0     	b.eq	0x40fe690 <_ChromeMain+0x40f93f4>
 40fe620: f94002f9     	ldr	x25, [x23]
 40fe624: b4ffff99     	cbz	x25, 0x40fe614 <_ChromeMain+0x40f9378>
 40fe628: 9101c3e8     	add	x8, sp, #0x70
 40fe62c: aa1903e0     	mov	x0, x25
 40fe630: 940170b6     	bl	0x415a908 <_ChromeMain+0x415566c>
 40fe634: 39421fe9     	ldrb	w9, [sp, #0x87]
 40fe638: 13001d28     	sxtb	w8, w9
 40fe63c: f9403fea     	ldr	x10, [sp, #0x78]
 40fe640: 7100011f     	cmp	w8, #0x0
 40fe644: 9a894149     	csel	x9, x10, x9, mi
 40fe648: eb1b013f     	cmp	x9, x27
 40fe64c: 54fff9a1     	b.ne	0x40fe580 <_ChromeMain+0x40f92e4>
 40fe650: b40001bb     	cbz	x27, 0x40fe684 <_ChromeMain+0x40f93e8>
 40fe654: f9403be9     	ldr	x9, [sp, #0x70]
 40fe658: 7100011f     	cmp	w8, #0x0
 40fe65c: 9101c3ea     	add	x10, sp, #0x70
 40fe660: 9a8a4129     	csel	x9, x9, x10, mi
 40fe664: aa1b03ea     	mov	x10, x27
 40fe668: aa1603eb     	mov	x11, x22
 40fe66c: 7840252c     	ldrh	w12, [x9], #0x2
 40fe670: 7840256d     	ldrh	w13, [x11], #0x2
 40fe674: 6b0c01bf     	cmp	w13, w12
 40fe678: 54fff841     	b.ne	0x40fe580 <_ChromeMain+0x40f92e4>
 40fe67c: f100054a     	subs	x10, x10, #0x1
 40fe680: 54ffff61     	b.ne	0x40fe66c <_ChromeMain+0x40f93d0>
 40fe684: 52800039     	mov	w25, #0x1               ; =1
 40fe688: 373ffbc8     	tbnz	w8, #0x7, 0x40fe600 <_ChromeMain+0x40f9364>
 40fe68c: 17ffffe1     	b	0x40fe610 <_ChromeMain+0x40f9374>
 40fe690: f94023f7     	ldr	x23, [sp, #0x40]
 40fe694: b4000217     	cbz	x23, 0x40fe6d4 <_ChromeMain+0x40f9438>
 40fe698: f94027e8     	ldr	x8, [sp, #0x48]
 40fe69c: d37df109     	lsl	x9, x8, #3
 40fe6a0: b4000109     	cbz	x9, 0x40fe6c0 <_ChromeMain+0x40f9424>
 40fe6a4: cb080fe8     	neg	x8, x8, lsl #3
 40fe6a8: 8b170129     	add	x9, x9, x23
 40fe6ac: d1002129     	sub	x9, x9, #0x8
 40fe6b0: b4000789     	cbz	x9, 0x40fe7a0 <_ChromeMain+0x40f9504>
 40fe6b4: d1002129     	sub	x9, x9, #0x8
 40fe6b8: 91002108     	add	x8, x8, #0x8
 40fe6bc: b5ffffa8     	cbnz	x8, 0x40fe6b0 <_ChromeMain+0x40f9414>
 40fe6c0: f90027ff     	str	xzr, [sp, #0x48]
 40fe6c4: f9402be8     	ldr	x8, [sp, #0x50]
 40fe6c8: d37df101     	lsl	x1, x8, #3
 40fe6cc: aa1703e0     	mov	x0, x23
 40fe6d0: 96fc29fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe6d4: 910083e0     	add	x0, sp, #0x20
 40fe6d8: 52800341     	mov	w1, #0x1a               ; =26
 40fe6dc: 52800002     	mov	w2, #0x0                ; =0
 40fe6e0: aa1303e3     	mov	x3, x19
 40fe6e4: d2800004     	mov	x4, #0x0                ; =0
 40fe6e8: 94e7236d     	bl	0x7ac749c <_ChromeMain+0x7ac2200>
 40fe6ec: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 40fe6f0: 36f800a8     	tbz	w8, #0x1f, 0x40fe704 <_ChromeMain+0x40f9468>
 40fe6f4: f94013e0     	ldr	x0, [sp, #0x20]
 40fe6f8: f9401be8     	ldr	x8, [sp, #0x30]
 40fe6fc: d37ff901     	lsl	x1, x8, #1
 40fe700: 96fc29ee     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe704: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 40fe708: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 40fe70c: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 40fe710: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 40fe714: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 40fe718: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 40fe71c: 9103c3ff     	add	sp, sp, #0xf0
 40fe720: d65f03c0     	ret
 40fe724: f94023e0     	ldr	x0, [sp, #0x40]
 40fe728: 910103f7     	add	x23, sp, #0x40
 40fe72c: 910083f9     	add	x25, sp, #0x20
 40fe730: aa1503fb     	mov	x27, x21
 40fe734: f9400ff5     	ldr	x21, [sp, #0x18]
 40fe738: b40001e0     	cbz	x0, 0x40fe774 <_ChromeMain+0x40f94d8>
 40fe73c: f94027e8     	ldr	x8, [sp, #0x48]
 40fe740: d37df109     	lsl	x9, x8, #3
 40fe744: b4000109     	cbz	x9, 0x40fe764 <_ChromeMain+0x40f94c8>
 40fe748: cb080fe8     	neg	x8, x8, lsl #3
 40fe74c: 8b090009     	add	x9, x0, x9
 40fe750: d1002129     	sub	x9, x9, #0x8
 40fe754: b4000269     	cbz	x9, 0x40fe7a0 <_ChromeMain+0x40f9504>
 40fe758: d1002129     	sub	x9, x9, #0x8
 40fe75c: 91002108     	add	x8, x8, #0x8
 40fe760: b5ffffa8     	cbnz	x8, 0x40fe754 <_ChromeMain+0x40f94b8>
 40fe764: f90027ff     	str	xzr, [sp, #0x48]
 40fe768: f9402be8     	ldr	x8, [sp, #0x50]
 40fe76c: d37df101     	lsl	x1, x8, #3
 40fe770: 96fc29d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe774: 36f800b4     	tbz	w20, #0x1f, 0x40fe788 <_ChromeMain+0x40f94ec>
 40fe778: f9401be8     	ldr	x8, [sp, #0x30]
 40fe77c: d37ff901     	lsl	x1, x8, #1
 40fe780: aa1803e0     	mov	x0, x24
 40fe784: 96fc29cd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fe788: 110006b5     	add	w21, w21, #0x1
 40fe78c: 528000e8     	mov	w8, #0x7                ; =7
 40fe790: 3901bfe8     	strb	w8, [sp, #0x6f]
 40fe794: a940d3f6     	ldp	x22, x20, [sp, #0x8]
 40fe798: f94003f8     	ldr	x24, [sp]
 40fe79c: 17ffff26     	b	0x40fe434 <_ChromeMain+0x40f9198>
 40fe7a0: d4200020     	brk	#0x1
