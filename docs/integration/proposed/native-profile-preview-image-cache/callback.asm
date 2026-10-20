
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46814f0: d10243ff     	sub	sp, sp, #0x90
 46814f4: a90467fa     	stp	x26, x25, [sp, #0x40]
 46814f8: a9055ff8     	stp	x24, x23, [sp, #0x50]
 46814fc: a90657f6     	stp	x22, x21, [sp, #0x60]
 4681500: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4681504: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4681508: 910203fd     	add	x29, sp, #0x80
 468150c: a942d414     	ldp	x20, x21, [x0, #0x28]
 4681510: f900141f     	str	xzr, [x0, #0x28]
 4681514: 3cc38000     	ldur	q0, [x0, #0x38]
 4681518: 3d8007e0     	str	q0, [sp, #0x10]
 468151c: f9402408     	ldr	x8, [x0, #0x48]
 4681520: f90013e8     	str	x8, [sp, #0x20]
 4681524: a903fc1f     	stp	xzr, xzr, [x0, #0x38]
 4681528: f900241f     	str	xzr, [x0, #0x48]
 468152c: b9405017     	ldr	w23, [x0, #0x50]
 4681530: f9400033     	ldr	x19, [x1]
 4681534: f90007f3     	str	x19, [sp, #0x8]
 4681538: f900003f     	str	xzr, [x1]
 468153c: b4000574     	cbz	x20, 0x46815e8 <_ChromeMain+0x467c34c>
 4681540: 19404288     	ldapurb	w8, [x20, #0x4]
 4681544: 7100011f     	cmp	w8, #0x0
 4681548: fa400aa4     	ccmp	x21, #0x0, #0x4, eq
 468154c: 54000460     	b.eq	0x46815d8 <_ChromeMain+0x467c33c>
 4681550: b40006b3     	cbz	x19, 0x4681624 <_ChromeMain+0x467c388>
 4681554: f9400e68     	ldr	x8, [x19, #0x18]
 4681558: b4000668     	cbz	x8, 0x4681624 <_ChromeMain+0x467c388>
 468155c: 19404288     	ldapurb	w8, [x20, #0x4]
 4681560: 35001be8     	cbnz	w8, 0x46818dc <_ChromeMain+0x467c640>
 4681564: f9422ea8     	ldr	x8, [x21, #0x458]
 4681568: b4000248     	cbz	x8, 0x46815b0 <_ChromeMain+0x467c314>
 468156c: 19404288     	ldapurb	w8, [x20, #0x4]
 4681570: 35001bc8     	cbnz	w8, 0x46818e8 <_ChromeMain+0x467c64c>
 4681574: f9422ea8     	ldr	x8, [x21, #0x458]
 4681578: f9429d08     	ldr	x8, [x8, #0x538]
 468157c: b40001a8     	cbz	x8, 0x46815b0 <_ChromeMain+0x467c314>
 4681580: 19404288     	ldapurb	w8, [x20, #0x4]
 4681584: 35001be8     	cbnz	w8, 0x4681900 <_ChromeMain+0x467c664>
 4681588: 396862a8     	ldrb	w8, [x21, #0xa18]
 468158c: 37000128     	tbnz	w8, #0x0, 0x46815b0 <_ChromeMain+0x467c314>
 4681590: 19404288     	ldapurb	w8, [x20, #0x4]
 4681594: 35001c28     	cbnz	w8, 0x4681918 <_ChromeMain+0x467c67c>
 4681598: 396866a8     	ldrb	w8, [x21, #0xa19]
 468159c: 370000a8     	tbnz	w8, #0x0, 0x46815b0 <_ChromeMain+0x467c314>
 46815a0: 19404288     	ldapurb	w8, [x20, #0x4]
 46815a4: 35001c08     	cbnz	w8, 0x4681924 <_ChromeMain+0x467c688>
 46815a8: 3975a2a8     	ldrb	w8, [x21, #0xd68]
 46815ac: 360006e8     	tbz	w8, #0x0, 0x4681688 <_ChromeMain+0x467c3ec>
 46815b0: 110006e3     	add	w3, w23, #0x1
 46815b4: 71000c7f     	cmp	w3, #0x3
 46815b8: 5400010c     	b.gt	0x46815d8 <_ChromeMain+0x467c33c>
 46815bc: 19404288     	ldapurb	w8, [x20, #0x4]
 46815c0: 350019a8     	cbnz	w8, 0x46818f4 <_ChromeMain+0x467c658>
 46815c4: 910043e1     	add	x1, sp, #0x10
 46815c8: aa1503e0     	mov	x0, x21
 46815cc: 529a9802     	mov	w2, #0xd4c0             ; =54464
 46815d0: 72a00022     	movk	w2, #0x1, lsl #16
 46815d4: 97ff5eab     	bl	0x4659080 <_ChromeMain+0x4653de4>
 46815d8: 12800008     	mov	w8, #-0x1               ; =-1
 46815dc: b8e80288     	ldaddal	w8, w8, [x20]
 46815e0: 7100051f     	cmp	w8, #0x1
 46815e4: 540002c0     	b.eq	0x468163c <_ChromeMain+0x467c3a0>
 46815e8: b40000d3     	cbz	x19, 0x4681600 <_ChromeMain+0x467c364>
 46815ec: b9400269     	ldr	w9, [x19]
 46815f0: 51000528     	sub	w8, w9, #0x1
 46815f4: b9000268     	str	w8, [x19]
 46815f8: 340016c9     	cbz	w9, 0x46818d0 <_ChromeMain+0x467c634>
 46815fc: 34000348     	cbz	w8, 0x4681664 <_ChromeMain+0x467c3c8>
 4681600: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4681604: 37f80268     	tbnz	w8, #0x1f, 0x4681650 <_ChromeMain+0x467c3b4>
 4681608: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 468160c: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4681610: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4681614: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4681618: a94467fa     	ldp	x26, x25, [sp, #0x40]
 468161c: 910243ff     	add	sp, sp, #0x90
 4681620: d65f03c0     	ret
 4681624: 110006e3     	add	w3, w23, #0x1
 4681628: 71000c7f     	cmp	w3, #0x3
 468162c: 54fffd6c     	b.gt	0x46815d8 <_ChromeMain+0x467c33c>
 4681630: 19404288     	ldapurb	w8, [x20, #0x4]
 4681634: 350016c8     	cbnz	w8, 0x468190c <_ChromeMain+0x467c670>
 4681638: 17ffffe3     	b	0x46815c4 <_ChromeMain+0x467c328>
 468163c: aa1403e0     	mov	x0, x20
 4681640: 52800101     	mov	w1, #0x8                ; =8
 4681644: 96e61e1d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4681648: b5fffd33     	cbnz	x19, 0x46815ec <_ChromeMain+0x467c350>
 468164c: 17ffffed     	b	0x4681600 <_ChromeMain+0x467c364>
 4681650: f9400be0     	ldr	x0, [sp, #0x10]
 4681654: f94013e8     	ldr	x8, [sp, #0x20]
 4681658: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 468165c: 96e61e17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4681660: 17ffffea     	b	0x4681608 <_ChromeMain+0x467c36c>
 4681664: 91002268     	add	x8, x19, #0x8
 4681668: f9400a61     	ldr	x1, [x19, #0x10]
 468166c: f90017e8     	str	x8, [sp, #0x28]
 4681670: 9100a3e0     	add	x0, sp, #0x28
 4681674: 96e745ab     	bl	0x52d20 <_ChromeMain+0x4da84>
 4681678: aa1303e0     	mov	x0, x19
 468167c: 52800401     	mov	w1, #0x20               ; =32
 4681680: 96e61e0e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4681684: 17ffffdf     	b	0x4681600 <_ChromeMain+0x467c364>
 4681688: 19404288     	ldapurb	w8, [x20, #0x4]
 468168c: 35001528     	cbnz	w8, 0x4681930 <_ChromeMain+0x467c694>
 4681690: bd4a1ea0     	ldr	s0, [x21, #0xa1c]
 4681694: 1e20c000     	fabs	s0, s0
 4681698: f004c668     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 468169c: bd46ed01     	ldr	s1, [x8, #0x6ec]
 46816a0: 1e212000     	fcmp	s0, s1
 46816a4: 54fff86c     	b.gt	0x46815b0 <_ChromeMain+0x467c314>
 46816a8: 19404288     	ldapurb	w8, [x20, #0x4]
 46816ac: 35001488     	cbnz	w8, 0x468193c <_ChromeMain+0x467c6a0>
 46816b0: f9422ea8     	ldr	x8, [x21, #0x458]
 46816b4: f9429d08     	ldr	x8, [x8, #0x538]
 46816b8: f9403500     	ldr	x0, [x8, #0x68]
 46816bc: b4fff8e0     	cbz	x0, 0x46815d8 <_ChromeMain+0x467c33c>
 46816c0: f9400008     	ldr	x8, [x0]
 46816c4: f940a508     	ldr	x8, [x8, #0x148]
 46816c8: d63f0100     	blr	x8
 46816cc: f9400008     	ldr	x8, [x0]
 46816d0: f9401909     	ldr	x9, [x8, #0x30]
 46816d4: 9100a3e8     	add	x8, sp, #0x28
 46816d8: d63f0120     	blr	x9
 46816dc: 9100a3e0     	add	x0, sp, #0x28
 46816e0: 910043e1     	add	x1, sp, #0x10
 46816e4: 97292a88     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 46816e8: aa0003f6     	mov	x22, x0
 46816ec: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 46816f0: 37f80ce8     	tbnz	w8, #0x1f, 0x468188c <_ChromeMain+0x467c5f0>
 46816f4: 34fff736     	cbz	w22, 0x46815d8 <_ChromeMain+0x467c33c>
 46816f8: f9400e68     	ldr	x8, [x19, #0x18]
 46816fc: b4000da8     	cbz	x8, 0x46818b0 <_ChromeMain+0x467c614>
 4681700: 910023e0     	add	x0, sp, #0x8
 4681704: 97378268     	bl	0x14620a4 <_ChromeMain+0x145ce08>
 4681708: f9400016     	ldr	x22, [x0]
 468170c: b4000d36     	cbz	x22, 0x46818b0 <_ChromeMain+0x467c614>
 4681710: 910022c8     	add	x8, x22, #0x8
 4681714: 52800029     	mov	w9, #0x1                ; =1
 4681718: b8290108     	ldadd	w9, w8, [x8]
 468171c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4681720: 6b09011f     	cmp	w8, w9
 4681724: 54001120     	b.eq	0x4681948 <_ChromeMain+0x467c6ac>
 4681728: 19404288     	ldapurb	w8, [x20, #0x4]
 468172c: 35000bc8     	cbnz	w8, 0x46818a4 <_ChromeMain+0x467c608>
 4681730: f9456aa8     	ldr	x8, [x21, #0xad0]
 4681734: b40000e8     	cbz	x8, 0x4681750 <_ChromeMain+0x467c4b4>
 4681738: 14000024     	b	0x46817c8 <_ChromeMain+0x467c52c>
 468173c: a9410be1     	ldp	x1, x2, [sp, #0x10]
 4681740: 96e65ab6     	bl	0x18218 <_ChromeMain+0x12f7c>
 4681744: 14000011     	b	0x4681788 <_ChromeMain+0x467c4ec>
 4681748: 91002319     	add	x25, x24, #0x8
 468174c: 14000003     	b	0x4681758 <_ChromeMain+0x467c4bc>
 4681750: 912b42b9     	add	x25, x21, #0xad0
 4681754: 912b42b8     	add	x24, x21, #0xad0
 4681758: 52800800     	mov	w0, #0x40               ; =64
 468175c: 96e63703     	bl	0xf368 <_ChromeMain+0xa0cc>
 4681760: b4000a60     	cbz	x0, 0x46818ac <_ChromeMain+0x467c610>
 4681764: aa0003f7     	mov	x23, x0
 4681768: f802041f     	str	xzr, [x0], #0x20
 468176c: b4000a00     	cbz	x0, 0x46818ac <_ChromeMain+0x467c610>
 4681770: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4681774: 37fffe48     	tbnz	w8, #0x1f, 0x468173c <_ChromeMain+0x467c4a0>
 4681778: 3dc007e0     	ldr	q0, [sp, #0x10]
 468177c: 3d800000     	str	q0, [x0]
 4681780: f94013e8     	ldr	x8, [sp, #0x20]
 4681784: f9000808     	str	x8, [x0, #0x10]
 4681788: f9001eff     	str	xzr, [x23, #0x38]
 468178c: a9007eff     	stp	xzr, xzr, [x23]
 4681790: f9000af8     	str	x24, [x23, #0x10]
 4681794: f9000337     	str	x23, [x25]
 4681798: f94566a8     	ldr	x8, [x21, #0xac8]
 468179c: f9400108     	ldr	x8, [x8]
 46817a0: aa1703e1     	mov	x1, x23
 46817a4: b4000068     	cbz	x8, 0x46817b0 <_ChromeMain+0x467c514>
 46817a8: f90566a8     	str	x8, [x21, #0xac8]
 46817ac: f9400321     	ldr	x1, [x25]
 46817b0: f9456aa0     	ldr	x0, [x21, #0xad0]
 46817b4: 96e768ab     	bl	0x5ba60 <_ChromeMain+0x567c4>
 46817b8: f9456ea8     	ldr	x8, [x21, #0xad8]
 46817bc: 91000508     	add	x8, x8, #0x1
 46817c0: f9056ea8     	str	x8, [x21, #0xad8]
 46817c4: 14000021     	b	0x4681848 <_ChromeMain+0x467c5ac>
 46817c8: 39809fe9     	ldrsb	x9, [sp, #0x27]
 46817cc: 910043ea     	add	x10, sp, #0x10
 46817d0: a94133eb     	ldp	x11, x12, [sp, #0x10]
 46817d4: f100013f     	cmp	x9, #0x0
 46817d8: 9a8a4177     	csel	x23, x11, x10, mi
 46817dc: 7100013f     	cmp	w9, #0x0
 46817e0: 9a89419a     	csel	x26, x12, x9, mi
 46817e4: 14000004     	b	0x46817f4 <_ChromeMain+0x467c558>
 46817e8: 54000223     	b.lo	0x468182c <_ChromeMain+0x467c590>
 46817ec: f9400708     	ldr	x8, [x24, #0x8]
 46817f0: b4fffac8     	cbz	x8, 0x4681748 <_ChromeMain+0x467c4ac>
 46817f4: aa0803f8     	mov	x24, x8
 46817f8: f8420d09     	ldr	x9, [x8, #0x20]!
 46817fc: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4681800: f100015f     	cmp	x10, #0x0
 4681804: 9a884121     	csel	x1, x9, x8, mi
 4681808: f9400508     	ldr	x8, [x8, #0x8]
 468180c: 7100015f     	cmp	w10, #0x0
 4681810: 9a8a4119     	csel	x25, x8, x10, mi
 4681814: eb1a033f     	cmp	x25, x26
 4681818: 9a9a3322     	csel	x2, x25, x26, lo
 468181c: aa1703e0     	mov	x0, x23
 4681820: 94e62010     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4681824: 340000c0     	cbz	w0, 0x468183c <_ChromeMain+0x467c5a0>
 4681828: 36fffe20     	tbz	w0, #0x1f, 0x46817ec <_ChromeMain+0x467c550>
 468182c: f9400308     	ldr	x8, [x24]
 4681830: aa1803f9     	mov	x25, x24
 4681834: b5fffe08     	cbnz	x8, 0x46817f4 <_ChromeMain+0x467c558>
 4681838: 17ffffc8     	b	0x4681758 <_ChromeMain+0x467c4bc>
 468183c: eb19035f     	cmp	x26, x25
 4681840: 54fffd41     	b.ne	0x46817e8 <_ChromeMain+0x467c54c>
 4681844: aa1803f7     	mov	x23, x24
 4681848: 910022c8     	add	x8, x22, #0x8
 468184c: 52800029     	mov	w9, #0x1                ; =1
 4681850: b8290108     	ldadd	w9, w8, [x8]
 4681854: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4681858: 6b09011f     	cmp	w8, w9
 468185c: 540007c0     	b.eq	0x4681954 <_ChromeMain+0x467c6b8>
 4681860: f9401ee0     	ldr	x0, [x23, #0x38]
 4681864: f9001ef6     	str	x22, [x23, #0x38]
 4681868: b50007c0     	cbnz	x0, 0x4681960 <_ChromeMain+0x467c6c4>
 468186c: 910022c8     	add	x8, x22, #0x8
 4681870: 12800009     	mov	w9, #-0x1               ; =-1
 4681874: b8e90108     	ldaddal	w9, w8, [x8]
 4681878: 7100051f     	cmp	w8, #0x1
 468187c: 54ffeae1     	b.ne	0x46815d8 <_ChromeMain+0x467c33c>
 4681880: aa1603e0     	mov	x0, x22
 4681884: 975e3fb1     	bl	0x1e11748 <_ChromeMain+0x1e0c4ac>
 4681888: 17ffff54     	b	0x46815d8 <_ChromeMain+0x467c33c>
 468188c: f94017e0     	ldr	x0, [sp, #0x28]
 4681890: f9401fe8     	ldr	x8, [sp, #0x38]
 4681894: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4681898: 96e61d88     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 468189c: 34ffe9f6     	cbz	w22, 0x46815d8 <_ChromeMain+0x467c33c>
 46818a0: 17ffff96     	b	0x46816f8 <_ChromeMain+0x467c45c>
 46818a4: d4200000     	brk	#0
 46818a8: d4400000     	hlt	#0
 46818ac: d4200020     	brk	#0x1
 46818b0: 110006e3     	add	w3, w23, #0x1
 46818b4: 71000c7f     	cmp	w3, #0x3
 46818b8: 54ffe90c     	b.gt	0x46815d8 <_ChromeMain+0x467c33c>
 46818bc: 19404288     	ldapurb	w8, [x20, #0x4]
 46818c0: 34ffe828     	cbz	w8, 0x46815c4 <_ChromeMain+0x467c328>
 46818c4: d4200000     	brk	#0
 46818c8: d4400000     	hlt	#0
 46818cc: d4200020     	brk	#0x1
 46818d0: d4200000     	brk	#0
 46818d4: d4400000     	hlt	#0
 46818d8: d4200020     	brk	#0x1
 46818dc: d4200000     	brk	#0
 46818e0: d4400000     	hlt	#0
 46818e4: d4200020     	brk	#0x1
 46818e8: d4200000     	brk	#0
 46818ec: d4400000     	hlt	#0
 46818f0: d4200020     	brk	#0x1
 46818f4: d4200000     	brk	#0
 46818f8: d4400000     	hlt	#0
 46818fc: d4200020     	brk	#0x1
 4681900: d4200000     	brk	#0
 4681904: d4400000     	hlt	#0
 4681908: d4200020     	brk	#0x1
 468190c: d4200000     	brk	#0
 4681910: d4400000     	hlt	#0
 4681914: d4200020     	brk	#0x1
 4681918: d4200000     	brk	#0
 468191c: d4400000     	hlt	#0
 4681920: d4200020     	brk	#0x1
 4681924: d4200000     	brk	#0
 4681928: d4400000     	hlt	#0
 468192c: d4200020     	brk	#0x1
 4681930: d4200000     	brk	#0
 4681934: d4400000     	hlt	#0
 4681938: d4200020     	brk	#0x1
 468193c: d4200000     	brk	#0
 4681940: d4400000     	hlt	#0
 4681944: d4200020     	brk	#0x1
 4681948: d4200000     	brk	#0
 468194c: d4400000     	hlt	#0
 4681950: d4200020     	brk	#0x1
 4681954: d4200000     	brk	#0
 4681958: d4400000     	hlt	#0
 468195c: d4200020     	brk	#0x1
 4681960: 91002008     	add	x8, x0, #0x8
 4681964: 12800009     	mov	w9, #-0x1               ; =-1
 4681968: b8e90108     	ldaddal	w9, w8, [x8]
 468196c: 7100051f     	cmp	w8, #0x1
 4681970: 54fff7e1     	b.ne	0x468186c <_ChromeMain+0x467c5d0>
 4681974: 975e3f75     	bl	0x1e11748 <_ChromeMain+0x1e0c4ac>
 4681978: 17ffffbd     	b	0x468186c <_ChromeMain+0x467c5d0>
 468197c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4681980: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4681984: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4681988: 910083fd     	add	x29, sp, #0x20
 468198c: b40003a0     	cbz	x0, 0x4681a00 <_ChromeMain+0x467c764>
 4681990: aa0003f3     	mov	x19, x0
 4681994: b0052994     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4681998: 1400000f     	b	0x46819d4 <_ChromeMain+0x467c738>
 468199c: f9401260     	ldr	x0, [x19, #0x20]
 46819a0: f9401a68     	ldr	x8, [x19, #0x30]
 46819a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46819a8: 96e61d44     	bl	0x8eb8 <_ChromeMain+0x3c1c>
