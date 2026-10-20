
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41073c4: d102c3ff     	sub	sp, sp, #0xb0
 41073c8: a90667fa     	stp	x26, x25, [sp, #0x60]
 41073cc: a9075ff8     	stp	x24, x23, [sp, #0x70]
 41073d0: a90857f6     	stp	x22, x21, [sp, #0x80]
 41073d4: a9094ff4     	stp	x20, x19, [sp, #0x90]
 41073d8: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 41073dc: 910283fd     	add	x29, sp, #0xa0
 41073e0: aa0103f4     	mov	x20, x1
 41073e4: aa0803f3     	mov	x19, x8
 41073e8: 910123e8     	add	x8, sp, #0x48
 41073ec: 91002118     	add	x24, x8, #0x8
 41073f0: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 41073f4: f90027f8     	str	x24, [sp, #0x48]
 41073f8: f9402408     	ldr	x8, [x0, #0x48]
 41073fc: d37df115     	lsl	x21, x8, #3
 4107400: b4000395     	cbz	x21, 0x4107470 <_ChromeMain+0x41021d4>
 4107404: f9402016     	ldr	x22, [x0, #0x40]
 4107408: 14000008     	b	0x4107428 <_ChromeMain+0x410218c>
 410740c: 910123e0     	add	x0, sp, #0x48
 4107410: 910123e1     	add	x1, sp, #0x48
 4107414: 91002102     	add	x2, x8, #0x8
 4107418: 97a90bb3     	bl	0x2b4a2e4 <_ChromeMain+0x2b45048>
 410741c: 910022d6     	add	x22, x22, #0x8
 4107420: f10022b5     	subs	x21, x21, #0x8
 4107424: 540000a0     	b.eq	0x4107438 <_ChromeMain+0x410219c>
 4107428: f94002c8     	ldr	x8, [x22]
 410742c: b940f909     	ldr	w9, [x8, #0xf8]
 4107430: 34ffff69     	cbz	w9, 0x410741c <_ChromeMain+0x4102180>
 4107434: 17fffff6     	b	0x410740c <_ChromeMain+0x4102170>
 4107438: f9402be1     	ldr	x1, [sp, #0x50]
 410743c: b40001c1     	cbz	x1, 0x4107474 <_ChromeMain+0x41021d8>
 4107440: 39405e89     	ldrb	w9, [x20, #0x17]
 4107444: 13001d28     	sxtb	w8, w9
 4107448: f940068a     	ldr	x10, [x20, #0x8]
 410744c: 7100011f     	cmp	w8, #0x0
 4107450: 9a89414a     	csel	x10, x10, x9, mi
 4107454: aa0103e9     	mov	x9, x1
 4107458: 1400001e     	b	0x41074d0 <_ChromeMain+0x4102234>
 410745c: a9400a81     	ldp	x1, x2, [x20]
 4107460: aa1303e0     	mov	x0, x19
 4107464: 96fcfddb     	bl	0x46bd0 <_ChromeMain+0x41934>
 4107468: f9402be1     	ldr	x1, [sp, #0x50]
 410746c: 14000008     	b	0x410748c <_ChromeMain+0x41021f0>
 4107470: d2800001     	mov	x1, #0x0                ; =0
 4107474: 39c05e88     	ldrsb	w8, [x20, #0x17]
 4107478: 37ffff28     	tbnz	w8, #0x1f, 0x410745c <_ChromeMain+0x41021c0>
 410747c: 3dc00280     	ldr	q0, [x20]
 4107480: 3d800260     	str	q0, [x19]
 4107484: f9400a88     	ldr	x8, [x20, #0x10]
 4107488: f9000a68     	str	x8, [x19, #0x10]
 410748c: 910123e8     	add	x8, sp, #0x48
 4107490: f9001be8     	str	x8, [sp, #0x30]
 4107494: 9100c3e0     	add	x0, sp, #0x30
 4107498: 97576c11     	bl	0x16e24dc <_ChromeMain+0x16dd240>
 410749c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41074a0: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41074a4: a94857f6     	ldp	x22, x21, [sp, #0x80]
 41074a8: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 41074ac: a94667fa     	ldp	x26, x25, [sp, #0x60]
 41074b0: 9102c3ff     	add	sp, sp, #0xb0
 41074b4: d65f03c0     	ret
 41074b8: f9400529     	ldr	x9, [x9, #0x8]
 41074bc: b4fffdc9     	cbz	x9, 0x4107474 <_ChromeMain+0x41021d8>
 41074c0: 14000004     	b	0x41074d0 <_ChromeMain+0x4102234>
 41074c4: 54ffffa2     	b.hs	0x41074b8 <_ChromeMain+0x410221c>
 41074c8: f9400129     	ldr	x9, [x9]
 41074cc: b4fffd49     	cbz	x9, 0x4107474 <_ChromeMain+0x41021d8>
 41074d0: 3940dd2b     	ldrb	w11, [x9, #0x37]
 41074d4: 13001d6d     	sxtb	w13, w11
 41074d8: f940152c     	ldr	x12, [x9, #0x28]
 41074dc: 710001bf     	cmp	w13, #0x0
 41074e0: 9a8b418b     	csel	x11, x12, x11, mi
 41074e4: eb0a017f     	cmp	x11, x10
 41074e8: 9a8a316c     	csel	x12, x11, x10, lo
 41074ec: b400020c     	cbz	x12, 0x410752c <_ChromeMain+0x4102290>
 41074f0: aa0903ee     	mov	x14, x9
 41074f4: f8420dcf     	ldr	x15, [x14, #0x20]!
 41074f8: 710001bf     	cmp	w13, #0x0
 41074fc: 9a8e41ed     	csel	x13, x15, x14, mi
 4107500: f940028e     	ldr	x14, [x20]
 4107504: 7100011f     	cmp	w8, #0x0
 4107508: 9a9441ce     	csel	x14, x14, x20, mi
 410750c: 784025cf     	ldrh	w15, [x14], #0x2
 4107510: 784025b0     	ldrh	w16, [x13], #0x2
 4107514: 6b1001ff     	cmp	w15, w16
 4107518: 54fffd83     	b.lo	0x41074c8 <_ChromeMain+0x410222c>
 410751c: 6b0f021f     	cmp	w16, w15
 4107520: 54fffcc3     	b.lo	0x41074b8 <_ChromeMain+0x410221c>
 4107524: f100058c     	subs	x12, x12, #0x1
 4107528: 54ffff21     	b.ne	0x410750c <_ChromeMain+0x4102270>
 410752c: eb0b015f     	cmp	x10, x11
 4107530: 54fffca1     	b.ne	0x41074c4 <_ChromeMain+0x4102228>
 4107534: eb18013f     	cmp	x9, x24
 4107538: 54fff9e0     	b.eq	0x4107474 <_ChromeMain+0x41021d8>
 410753c: f9402fe8     	ldr	x8, [sp, #0x58]
 4107540: b4000d28     	cbz	x8, 0x41076e4 <_ChromeMain+0x4102448>
 4107544: 52800035     	mov	w21, #0x1               ; =1
 4107548: d004f396     	adrp	x22, 0xdf79000 <dyld_stub_binder+0xdf79000>
 410754c: 910ffad6     	add	x22, x22, #0x3fe
 4107550: 910003f9     	mov	x25, sp
 4107554: d004f397     	adrp	x23, 0xdf79000 <dyld_stub_binder+0xdf79000>
 4107558: 911012f7     	add	x23, x23, #0x404
 410755c: 910063e8     	add	x8, sp, #0x18
 4107560: aa1403e0     	mov	x0, x20
 4107564: aa1603e1     	mov	x1, x22
 4107568: 94b19187     	bl	0x6d6bb84 <_ChromeMain+0x6d668e8>
 410756c: 910003e8     	mov	x8, sp
 4107570: aa1503e0     	mov	x0, x21
 4107574: 951b9a05     	bl	0x87edd88 <_ChromeMain+0x87e8aec>
 4107578: 39805fe8     	ldrsb	x8, [sp, #0x17]
 410757c: a9402be9     	ldp	x9, x10, [sp]
 4107580: f100011f     	cmp	x8, #0x0
 4107584: 9a994121     	csel	x1, x9, x25, mi
 4107588: 7100011f     	cmp	w8, #0x0
 410758c: 9a884142     	csel	x2, x10, x8, mi
 4107590: 910063e0     	add	x0, sp, #0x18
 4107594: 972c3b95     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4107598: f9400808     	ldr	x8, [x0, #0x10]
 410759c: 3dc00000     	ldr	q0, [x0]
 41075a0: 3d800fe0     	str	q0, [sp, #0x30]
 41075a4: f90023e8     	str	x8, [sp, #0x40]
 41075a8: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 41075ac: f900001f     	str	xzr, [x0]
 41075b0: 9100c3e0     	add	x0, sp, #0x30
 41075b4: aa1703e1     	mov	x1, x23
 41075b8: 52800022     	mov	w2, #0x1                ; =1
 41075bc: 972c3b8b     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 41075c0: f9400808     	ldr	x8, [x0, #0x10]
 41075c4: 3dc00000     	ldr	q0, [x0]
 41075c8: 3d800260     	str	q0, [x19]
 41075cc: f9000a68     	str	x8, [x19, #0x10]
 41075d0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 41075d4: f900001f     	str	xzr, [x0]
 41075d8: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 41075dc: 36f800a8     	tbz	w8, #0x1f, 0x41075f0 <_ChromeMain+0x4102354>
 41075e0: f9401be0     	ldr	x0, [sp, #0x30]
 41075e4: f94023e8     	ldr	x8, [sp, #0x40]
 41075e8: d37ff901     	lsl	x1, x8, #1
 41075ec: 96fc0633     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41075f0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41075f4: 36f800a8     	tbz	w8, #0x1f, 0x4107608 <_ChromeMain+0x410236c>
 41075f8: f94003e0     	ldr	x0, [sp]
 41075fc: f9400be8     	ldr	x8, [sp, #0x10]
 4107600: d37ff901     	lsl	x1, x8, #1
 4107604: 96fc062d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4107608: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 410760c: 36f800a8     	tbz	w8, #0x1f, 0x4107620 <_ChromeMain+0x4102384>
 4107610: f9400fe0     	ldr	x0, [sp, #0x18]
 4107614: f94017e8     	ldr	x8, [sp, #0x28]
 4107618: d37ff901     	lsl	x1, x8, #1
 410761c: 96fc0627     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4107620: f9402be1     	ldr	x1, [sp, #0x50]
 4107624: b4fff341     	cbz	x1, 0x410748c <_ChromeMain+0x41021f0>
 4107628: 39405e69     	ldrb	w9, [x19, #0x17]
 410762c: 13001d28     	sxtb	w8, w9
 4107630: 7100011f     	cmp	w8, #0x0
 4107634: a9402a60     	ldp	x0, x10, [x19]
 4107638: 9a894149     	csel	x9, x10, x9, mi
 410763c: 9a93400a     	csel	x10, x0, x19, mi
 4107640: aa0103eb     	mov	x11, x1
 4107644: 14000007     	b	0x4107660 <_ChromeMain+0x41023c4>
 4107648: f940056b     	ldr	x11, [x11, #0x8]
 410764c: b50000ab     	cbnz	x11, 0x4107660 <_ChromeMain+0x41023c4>
 4107650: 17ffff8f     	b	0x410748c <_ChromeMain+0x41021f0>
 4107654: 54ffffa2     	b.hs	0x4107648 <_ChromeMain+0x41023ac>
 4107658: f940016b     	ldr	x11, [x11]
 410765c: b4fff18b     	cbz	x11, 0x410748c <_ChromeMain+0x41021f0>
 4107660: 3940dd6c     	ldrb	w12, [x11, #0x37]
 4107664: 13001d8e     	sxtb	w14, w12
 4107668: f940156d     	ldr	x13, [x11, #0x28]
 410766c: 710001df     	cmp	w14, #0x0
 4107670: 9a8c41ac     	csel	x12, x13, x12, mi
 4107674: eb09019f     	cmp	x12, x9
 4107678: 9a89318d     	csel	x13, x12, x9, lo
 410767c: b40001cd     	cbz	x13, 0x41076b4 <_ChromeMain+0x4102418>
 4107680: aa0b03ef     	mov	x15, x11
 4107684: f8420df0     	ldr	x16, [x15, #0x20]!
 4107688: 710001df     	cmp	w14, #0x0
 410768c: 9a8f420e     	csel	x14, x16, x15, mi
 4107690: aa0a03ef     	mov	x15, x10
 4107694: 784025f0     	ldrh	w16, [x15], #0x2
 4107698: 784025d1     	ldrh	w17, [x14], #0x2
 410769c: 6b11021f     	cmp	w16, w17
 41076a0: 54fffdc3     	b.lo	0x4107658 <_ChromeMain+0x41023bc>
 41076a4: 6b10023f     	cmp	w17, w16
 41076a8: 54fffd03     	b.lo	0x4107648 <_ChromeMain+0x41023ac>
 41076ac: f10005ad     	subs	x13, x13, #0x1
 41076b0: 54ffff21     	b.ne	0x4107694 <_ChromeMain+0x41023f8>
 41076b4: eb0c013f     	cmp	x9, x12
 41076b8: 54fffce1     	b.ne	0x4107654 <_ChromeMain+0x41023b8>
 41076bc: eb18017f     	cmp	x11, x24
 41076c0: 54ffee60     	b.eq	0x410748c <_ChromeMain+0x41021f0>
 41076c4: 36f80088     	tbz	w8, #0x1f, 0x41076d4 <_ChromeMain+0x4102438>
 41076c8: f9400a68     	ldr	x8, [x19, #0x10]
 41076cc: d37ff901     	lsl	x1, x8, #1
 41076d0: 96fc05fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41076d4: 910006b5     	add	x21, x21, #0x1
 41076d8: f9402fe8     	ldr	x8, [sp, #0x58]
 41076dc: eb0802bf     	cmp	x21, x8
 41076e0: 54fff3e9     	b.ls	0x410755c <_ChromeMain+0x41022c0>
 41076e4: d4200000     	brk	#0
 41076e8: d4400000     	hlt	#0
 41076ec: d4200020     	brk	#0x1
