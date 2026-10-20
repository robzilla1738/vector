
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46093c4: d10103ff     	sub	sp, sp, #0x40
 46093c8: a90157f6     	stp	x22, x21, [sp, #0x10]
 46093cc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 46093d0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 46093d4: 9100c3fd     	add	x29, sp, #0x30
 46093d8: aa0003f3     	mov	x19, x0
 46093dc: 39544016     	ldrb	w22, [x0, #0x510]
 46093e0: f9424408     	ldr	x8, [x0, #0x488]
 46093e4: b40001a8     	cbz	x8, 0x4609418 <_ChromeMain+0x460417c>
 46093e8: f9401114     	ldr	x20, [x8, #0x20]
 46093ec: b4000174     	cbz	x20, 0x4609418 <_ChromeMain+0x460417c>
 46093f0: f940b688     	ldr	x8, [x20, #0x168]
 46093f4: f9401108     	ldr	x8, [x8, #0x20]
 46093f8: b4000088     	cbz	x8, 0x4609408 <_ChromeMain+0x460416c>
 46093fc: bd401900     	ldr	s0, [x8, #0x18]
 4609400: 1e202008     	fcmp	s0, #0.0
 4609404: 540000a0     	b.eq	0x4609418 <_ChromeMain+0x460417c>
 4609408: f940b280     	ldr	x0, [x20, #0x160]
 460940c: b4000fe0     	cbz	x0, 0x4609608 <_ChromeMain+0x460436c>
 4609410: 6f00e400     	movi.2d	v0, #0000000000000000
 4609414: 9753adc9     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4609418: f9423e68     	ldr	x8, [x19, #0x478]
 460941c: b40004e8     	cbz	x8, 0x46094b8 <_ChromeMain+0x460421c>
 4609420: f9407109     	ldr	x9, [x8, #0xe0]
 4609424: b40004a9     	cbz	x9, 0x46094b8 <_ChromeMain+0x460421c>
 4609428: 19404129     	ldapurb	w9, [x9, #0x4]
 460942c: 35000469     	cbnz	w9, 0x46094b8 <_ChromeMain+0x460421c>
 4609430: f9407509     	ldr	x9, [x8, #0xe8]
 4609434: b4000429     	cbz	x9, 0x46094b8 <_ChromeMain+0x460421c>
 4609438: f9407109     	ldr	x9, [x8, #0xe0]
 460943c: b4001049     	cbz	x9, 0x4609644 <_ChromeMain+0x46043a8>
 4609440: 19404129     	ldapurb	w9, [x9, #0x4]
 4609444: 35001009     	cbnz	w9, 0x4609644 <_ChromeMain+0x46043a8>
 4609448: f9407508     	ldr	x8, [x8, #0xe8]
 460944c: f9402508     	ldr	x8, [x8, #0x48]
 4609450: b4000348     	cbz	x8, 0x46094b8 <_ChromeMain+0x460421c>
 4609454: 3949a108     	ldrb	w8, [x8, #0x268]
 4609458: 34000308     	cbz	w8, 0x46094b8 <_ChromeMain+0x460421c>
 460945c: f9423e74     	ldr	x20, [x19, #0x478]
 4609460: f9407288     	ldr	x8, [x20, #0xe0]
 4609464: b40002a8     	cbz	x8, 0x46094b8 <_ChromeMain+0x460421c>
 4609468: 19404108     	ldapurb	w8, [x8, #0x4]
 460946c: 35000268     	cbnz	w8, 0x46094b8 <_ChromeMain+0x460421c>
 4609470: f9407688     	ldr	x8, [x20, #0xe8]
 4609474: b4000228     	cbz	x8, 0x46094b8 <_ChromeMain+0x460421c>
 4609478: f9407288     	ldr	x8, [x20, #0xe0]
 460947c: b4000ea8     	cbz	x8, 0x4609650 <_ChromeMain+0x46043b4>
 4609480: 19404108     	ldapurb	w8, [x8, #0x4]
 4609484: 35000e68     	cbnz	w8, 0x4609650 <_ChromeMain+0x46043b4>
 4609488: f9407688     	ldr	x8, [x20, #0xe8]
 460948c: f9402500     	ldr	x0, [x8, #0x48]
 4609490: b4000060     	cbz	x0, 0x460949c <_ChromeMain+0x4604200>
 4609494: 52800001     	mov	w1, #0x0                ; =0
 4609498: 9794e459     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 460949c: 9793b7aa     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 46094a0: f90007f4     	str	x20, [sp, #0x8]
 46094a4: b00306a1     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 46094a8: 91389021     	add	x1, x1, #0xe24
 46094ac: 910023e3     	add	x3, sp, #0x8
 46094b0: d2800002     	mov	x2, #0x0                ; =0
 46094b4: 977042c4     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 46094b8: 39544268     	ldrb	w8, [x19, #0x510]
 46094bc: 34000048     	cbz	w8, 0x46094c4 <_ChromeMain+0x4604228>
 46094c0: 3914427f     	strb	wzr, [x19, #0x510]
 46094c4: 3914627f     	strb	wzr, [x19, #0x518]
 46094c8: 39578268     	ldrb	w8, [x19, #0x5e0]
 46094cc: 340001a8     	cbz	w8, 0x4609500 <_ChromeMain+0x4604264>
 46094d0: 91176260     	add	x0, x19, #0x5d8
 46094d4: d2800001     	mov	x1, #0x0                ; =0
 46094d8: 96e879f8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46094dc: 91162260     	add	x0, x19, #0x588
 46094e0: 96e879e6     	bl	0x27c78 <_ChromeMain+0x229dc>
 46094e4: 39d5fe68     	ldrsb	w8, [x19, #0x57f]
 46094e8: 36f800a8     	tbz	w8, #0x1f, 0x46094fc <_ChromeMain+0x4604260>
 46094ec: f942b660     	ldr	x0, [x19, #0x568]
 46094f0: f942be68     	ldr	x8, [x19, #0x578]
 46094f4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46094f8: 96e7fe70     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46094fc: 3917827f     	strb	wzr, [x19, #0x5e0]
 4609500: 39d7fe68     	ldrsb	w8, [x19, #0x5ff]
 4609504: 37f801a8     	tbnz	w8, #0x1f, 0x4609538 <_ChromeMain+0x460429c>
 4609508: 790bd27f     	strh	wzr, [x19, #0x5e8]
 460950c: 3917fe7f     	strb	wzr, [x19, #0x5ff]
 4609510: 39581268     	ldrb	w8, [x19, #0x604]
 4609514: 34000048     	cbz	w8, 0x460951c <_ChromeMain+0x4604280>
 4609518: 3918127f     	strb	wzr, [x19, #0x604]
 460951c: 34000176     	cbz	w22, 0x4609548 <_ChromeMain+0x46042ac>
 4609520: f940ce68     	ldr	x8, [x19, #0x198]
 4609524: d37df109     	lsl	x9, x8, #3
 4609528: b4000109     	cbz	x9, 0x4609548 <_ChromeMain+0x46042ac>
 460952c: f940ca75     	ldr	x21, [x19, #0x190]
 4609530: 8b080eb6     	add	x22, x21, x8, lsl #3
 4609534: 14000016     	b	0x460958c <_ChromeMain+0x46042f0>
 4609538: f942f668     	ldr	x8, [x19, #0x5e8]
 460953c: 7900011f     	strh	wzr, [x8]
 4609540: f902fa7f     	str	xzr, [x19, #0x5f0]
 4609544: 17fffff3     	b	0x4609510 <_ChromeMain+0x4604274>
 4609548: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 460954c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4609550: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4609554: 910103ff     	add	sp, sp, #0x40
 4609558: d65f03c0     	ret
 460955c: aa1403e0     	mov	x0, x20
 4609560: 97f79f68     	bl	0x43f1300 <_ChromeMain+0x43ec064>
 4609564: f9400400     	ldr	x0, [x0, #0x8]
 4609568: f9400008     	ldr	x8, [x0]
 460956c: f940a108     	ldr	x8, [x8, #0x140]
 4609570: d63f0100     	blr	x8
 4609574: 9103e260     	add	x0, x19, #0xf8
 4609578: 91046261     	add	x1, x19, #0x118
 460957c: 97247a95     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4609580: 910022b5     	add	x21, x21, #0x8
 4609584: eb1602bf     	cmp	x21, x22
 4609588: 54fffe00     	b.eq	0x4609548 <_ChromeMain+0x46042ac>
 460958c: f94002b3     	ldr	x19, [x21]
 4609590: b4ffff93     	cbz	x19, 0x4609580 <_ChromeMain+0x46042e4>
 4609594: f9400268     	ldr	x8, [x19]
 4609598: f9402d08     	ldr	x8, [x8, #0x58]
 460959c: aa1303e0     	mov	x0, x19
 46095a0: d63f0100     	blr	x8
 46095a4: aa0003f4     	mov	x20, x0
 46095a8: 97ffedd6     	bl	0x4604d00 <_ChromeMain+0x45ffa64>
 46095ac: f100029f     	cmp	x20, #0x0
 46095b0: 1a9f07e8     	cset	w8, ne
 46095b4: eb00029f     	cmp	x20, x0
 46095b8: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 46095bc: 540000c0     	b.eq	0x46095d4 <_ChromeMain+0x4604338>
 46095c0: f9402694     	ldr	x20, [x20, #0x48]
 46095c4: f100029f     	cmp	x20, #0x0
 46095c8: 1a9f07e8     	cset	w8, ne
 46095cc: fa401284     	ccmp	x20, x0, #0x4, ne
 46095d0: 54ffff81     	b.ne	0x46095c0 <_ChromeMain+0x4604324>
 46095d4: 34fffd68     	cbz	w8, 0x4609580 <_ChromeMain+0x46042e4>
 46095d8: f9400268     	ldr	x8, [x19]
 46095dc: f9403508     	ldr	x8, [x8, #0x68]
 46095e0: aa1303e0     	mov	x0, x19
 46095e4: d63f0100     	blr	x8
 46095e8: b4fffc60     	cbz	x0, 0x4609574 <_ChromeMain+0x46042d8>
 46095ec: aa0003f4     	mov	x20, x0
 46095f0: 3948a008     	ldrb	w8, [x0, #0x228]
 46095f4: 3707fc08     	tbnz	w8, #0x0, 0x4609574 <_ChromeMain+0x46042d8>
 46095f8: aa1403e0     	mov	x0, x20
 46095fc: 97f79f41     	bl	0x43f1300 <_ChromeMain+0x43ec064>
 4609600: b4fffba0     	cbz	x0, 0x4609574 <_ChromeMain+0x46042d8>
 4609604: 17ffffd6     	b	0x460955c <_ChromeMain+0x46042c0>
 4609608: 52802400     	mov	w0, #0x120              ; =288
 460960c: 96e81757     	bl	0xf368 <_ChromeMain+0xa0cc>
 4609610: aa0003f5     	mov	x21, x0
 4609614: d2800001     	mov	x1, #0x0                ; =0
 4609618: 9729c330     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460961c: b40000a0     	cbz	x0, 0x4609630 <_ChromeMain+0x4604394>
 4609620: b9400aa8     	ldr	w8, [x21, #0x8]
 4609624: 31000508     	adds	w8, w8, #0x1
 4609628: b9000aa8     	str	w8, [x21, #0x8]
 460962c: 54000182     	b.hs	0x460965c <_ChromeMain+0x46043c0>
 4609630: aa1403e0     	mov	x0, x20
 4609634: aa1503e1     	mov	x1, x21
 4609638: 9731caf1     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460963c: f940b280     	ldr	x0, [x20, #0x160]
 4609640: 17ffff74     	b	0x4609410 <_ChromeMain+0x4604174>
 4609644: d4200000     	brk	#0
 4609648: d4400000     	hlt	#0
 460964c: d4200020     	brk	#0x1
 4609650: d4200000     	brk	#0
 4609654: d4400000     	hlt	#0
 4609658: d4200020     	brk	#0x1
 460965c: d4200000     	brk	#0
 4609660: d4400000     	hlt	#0
 4609664: d4200020     	brk	#0x1
