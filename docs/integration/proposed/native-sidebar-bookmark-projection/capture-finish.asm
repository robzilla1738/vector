
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464351c: d101c3ff     	sub	sp, sp, #0x70
 4643520: a90267fa     	stp	x26, x25, [sp, #0x20]
 4643524: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4643528: a90457f6     	stp	x22, x21, [sp, #0x40]
 464352c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4643530: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4643534: 910183fd     	add	x29, sp, #0x60
 4643538: 396e4008     	ldrb	w8, [x0, #0xb90]
 464353c: 34001f48     	cbz	w8, 0x4643924 <_ChromeMain+0x463e688>
 4643540: aa0003f3     	mov	x19, x0
 4643544: 392e401f     	strb	wzr, [x0, #0xb90]
 4643548: 396e4808     	ldrb	w8, [x0, #0xb92]
 464354c: 37001768     	tbnz	w8, #0x0, 0x4643838 <_ChromeMain+0x463e59c>
 4643550: aa1303e0     	mov	x0, x19
 4643554: 97ffc697     	bl	0x4634fb0 <_ChromeMain+0x462fd14>
 4643558: f948de74     	ldr	x20, [x19, #0x11b8]
 464355c: f948e268     	ldr	x8, [x19, #0x11c0]
 4643560: 8b080509     	add	x9, x8, x8, lsl #1
 4643564: d37df129     	lsl	x9, x9, #3
 4643568: b4002709     	cbz	x9, 0x4643a48 <_ChromeMain+0x463e7ac>
 464356c: 8b140129     	add	x9, x9, x20
 4643570: d1006135     	sub	x21, x9, #0x18
 4643574: d37df109     	lsl	x9, x8, #3
 4643578: cb081536     	sub	x22, x9, x8, lsl #5
 464357c: b4001fd5     	cbz	x21, 0x4643974 <_ChromeMain+0x463e6d8>
 4643580: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4643584: 37f80548     	tbnz	w8, #0x1f, 0x464362c <_ChromeMain+0x463e390>
 4643588: d10062b5     	sub	x21, x21, #0x18
 464358c: b10062d6     	adds	x22, x22, #0x18
 4643590: 54ffff61     	b.ne	0x464357c <_ChromeMain+0x463e2e0>
 4643594: f948de68     	ldr	x8, [x19, #0x11b8]
 4643598: cb080288     	sub	x8, x20, x8
 464359c: 9343fd08     	asr	x8, x8, #3
 46435a0: b201f3f5     	mov	x21, #-0x5555555555555556 ; =-6148914691236517206
 46435a4: f2955575     	movk	x21, #0xaaab
 46435a8: 9b157d08     	mul	x8, x8, x21
 46435ac: f908e268     	str	x8, [x19, #0x11c0]
 46435b0: f948ea76     	ldr	x22, [x19, #0x11d0]
 46435b4: f948ee68     	ldr	x8, [x19, #0x11d8]
 46435b8: 8b080509     	add	x9, x8, x8, lsl #1
 46435bc: d37df129     	lsl	x9, x9, #3
 46435c0: b4002489     	cbz	x9, 0x4643a50 <_ChromeMain+0x463e7b4>
 46435c4: 8b160129     	add	x9, x9, x22
 46435c8: d1006134     	sub	x20, x9, #0x18
 46435cc: d37df109     	lsl	x9, x8, #3
 46435d0: cb081537     	sub	x23, x9, x8, lsl #5
 46435d4: b4001d14     	cbz	x20, 0x4643974 <_ChromeMain+0x463e6d8>
 46435d8: 39c05e88     	ldrsb	w8, [x20, #0x17]
 46435dc: 37f80328     	tbnz	w8, #0x1f, 0x4643640 <_ChromeMain+0x463e3a4>
 46435e0: d1006294     	sub	x20, x20, #0x18
 46435e4: b10062f7     	adds	x23, x23, #0x18
 46435e8: 54ffff61     	b.ne	0x46435d4 <_ChromeMain+0x463e338>
 46435ec: f948ea68     	ldr	x8, [x19, #0x11d0]
 46435f0: 91400674     	add	x20, x19, #0x1, lsl #12 ; =0x1000
 46435f4: cb0802c8     	sub	x8, x22, x8
 46435f8: 9343fd08     	asr	x8, x8, #3
 46435fc: 9b157d08     	mul	x8, x8, x21
 4643600: f908ee68     	str	x8, [x19, #0x11d8]
 4643604: 52800028     	mov	w8, #0x1                ; =1
 4643608: 3907a288     	strb	w8, [x20, #0x1e8]
 464360c: f948d275     	ldr	x21, [x19, #0x11a0]
 4643610: f948d668     	ldr	x8, [x19, #0x11a8]
 4643614: 52801709     	mov	w9, #0xb8               ; =184
 4643618: 9b097d16     	mul	x22, x8, x9
 464361c: b4000536     	cbz	x22, 0x46436c0 <_ChromeMain+0x463e424>
 4643620: d2800017     	mov	x23, #0x0               ; =0
 4643624: aa1503f8     	mov	x24, x21
 4643628: 14000014     	b	0x4643678 <_ChromeMain+0x463e3dc>
 464362c: f94002a0     	ldr	x0, [x21]
 4643630: f9400aa8     	ldr	x8, [x21, #0x10]
 4643634: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4643638: 96e71620     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464363c: 17ffffd3     	b	0x4643588 <_ChromeMain+0x463e2ec>
 4643640: f9400280     	ldr	x0, [x20]
 4643644: f9400a88     	ldr	x8, [x20, #0x10]
 4643648: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464364c: 96e7161b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643650: 17ffffe4     	b	0x46435e0 <_ChromeMain+0x463e344>
 4643654: f9400320     	ldr	x0, [x25]
 4643658: 8b160308     	add	x8, x24, x22
 464365c: f8558108     	ldur	x8, [x8, #-0xa8]
 4643660: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4643664: 96e71615     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643668: d102e318     	sub	x24, x24, #0xb8
 464366c: 9102e2f7     	add	x23, x23, #0xb8
 4643670: eb1702df     	cmp	x22, x23
 4643674: 540002a0     	b.eq	0x46436c8 <_ChromeMain+0x463e42c>
 4643678: 8b160308     	add	x8, x24, x22
 464367c: f102e119     	subs	x25, x8, #0xb8
 4643680: 540017a0     	b.eq	0x4643974 <_ChromeMain+0x463e6d8>
 4643684: 385f8108     	ldurb	w8, [x8, #-0x8]
 4643688: 34000088     	cbz	w8, 0x4643698 <_ChromeMain+0x463e3fc>
 464368c: 8b160308     	add	x8, x24, x22
 4643690: d1020100     	sub	x0, x8, #0x80
 4643694: 97ff9e83     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 4643698: 8b16031a     	add	x26, x24, x22
 464369c: 38d77348     	ldursb	w8, [x26, #-0x89]
 46436a0: 36f800a8     	tbz	w8, #0x1f, 0x46436b4 <_ChromeMain+0x463e418>
 46436a4: f8560340     	ldur	x0, [x26, #-0xa0]
 46436a8: f8570348     	ldur	x8, [x26, #-0x90]
 46436ac: d37ff901     	lsl	x1, x8, #1
 46436b0: 96e71602     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46436b4: 38d5f348     	ldursb	w8, [x26, #-0xa1]
 46436b8: 36fffd88     	tbz	w8, #0x1f, 0x4643668 <_ChromeMain+0x463e3cc>
 46436bc: 17ffffe6     	b	0x4643654 <_ChromeMain+0x463e3b8>
 46436c0: aa1503e8     	mov	x8, x21
 46436c4: 14000002     	b	0x46436cc <_ChromeMain+0x463e430>
 46436c8: f948d268     	ldr	x8, [x19, #0x11a0]
 46436cc: cb0802a8     	sub	x8, x21, x8
 46436d0: 9343fd08     	asr	x8, x8, #3
 46436d4: d286f4e9     	mov	x9, #0x37a7             ; =14247
 46436d8: f2bd37a9     	movk	x9, #0xe9bd, lsl #16
 46436dc: f2cde9a9     	movk	x9, #0x6f4d, lsl #32
 46436e0: f2fa6f49     	movk	x9, #0xd37a, lsl #48
 46436e4: 9b097d08     	mul	x8, x8, x9
 46436e8: f908d668     	str	x8, [x19, #0x11a8]
 46436ec: 394a0288     	ldrb	w8, [x20, #0x280]
 46436f0: 34000168     	cbz	w8, 0x464371c <_ChromeMain+0x463e480>
 46436f4: 52824108     	mov	w8, #0x1208             ; =4616
 46436f8: 8b080260     	add	x0, x19, x8
 46436fc: 97ff9e69     	bl	0x462b0a0 <_ChromeMain+0x4625e04>
 4643700: 39c81e88     	ldrsb	w8, [x20, #0x207]
 4643704: 36f800a8     	tbz	w8, #0x1f, 0x4643718 <_ChromeMain+0x463e47c>
 4643708: f948fa60     	ldr	x0, [x19, #0x11f0]
 464370c: f9490268     	ldr	x8, [x19, #0x1200]
 4643710: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4643714: 96e715e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643718: 390a029f     	strb	wzr, [x20, #0x280]
 464371c: 394a8288     	ldrb	w8, [x20, #0x2a0]
 4643720: 34000108     	cbz	w8, 0x4643740 <_ChromeMain+0x463e4a4>
 4643724: 39ca7e88     	ldrsb	w8, [x20, #0x29f]
 4643728: 36f800a8     	tbz	w8, #0x1f, 0x464373c <_ChromeMain+0x463e4a0>
 464372c: f9494660     	ldr	x0, [x19, #0x1288]
 4643730: f9494e68     	ldr	x8, [x19, #0x1298]
 4643734: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4643738: 96e715e0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464373c: 390a829f     	strb	wzr, [x20, #0x2a0]
 4643740: 394b0288     	ldrb	w8, [x20, #0x2c0]
 4643744: 34000108     	cbz	w8, 0x4643764 <_ChromeMain+0x463e4c8>
 4643748: 39cafe88     	ldrsb	w8, [x20, #0x2bf]
 464374c: 36f800a8     	tbz	w8, #0x1f, 0x4643760 <_ChromeMain+0x463e4c4>
 4643750: f9495660     	ldr	x0, [x19, #0x12a8]
 4643754: f9495e68     	ldr	x8, [x19, #0x12b8]
 4643758: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464375c: 96e715d7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643760: 390b029f     	strb	wzr, [x20, #0x2c0]
 4643764: 394fe288     	ldrb	w8, [x20, #0x3f8]
 4643768: 34000108     	cbz	w8, 0x4643788 <_ChromeMain+0x463e4ec>
 464376c: 39cf9e88     	ldrsb	w8, [x20, #0x3e7]
 4643770: 36f800a8     	tbz	w8, #0x1f, 0x4643784 <_ChromeMain+0x463e4e8>
 4643774: f949ea60     	ldr	x0, [x19, #0x13d0]
 4643778: f949f268     	ldr	x8, [x19, #0x13e0]
 464377c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4643780: 96e715ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643784: 390fe29f     	strb	wzr, [x20, #0x3f8]
 4643788: f942e674     	ldr	x20, [x19, #0x5c8]
 464378c: b4000574     	cbz	x20, 0x4643838 <_ChromeMain+0x463e59c>
 4643790: 394f0288     	ldrb	w8, [x20, #0x3c0]
 4643794: 35000f28     	cbnz	w8, 0x4643978 <_ChromeMain+0x463e6dc>
 4643798: 3910e29f     	strb	wzr, [x20, #0x438]
 464379c: f9418a88     	ldr	x8, [x20, #0x310]
 46437a0: f9427115     	ldr	x21, [x8, #0x4e0]
 46437a4: 6f00e400     	movi.2d	v0, #0000000000000000
 46437a8: b40001d5     	cbz	x21, 0x46437e0 <_ChromeMain+0x463e544>
 46437ac: 395042a8     	ldrb	w8, [x21, #0x410]
 46437b0: 34000188     	cbz	w8, 0x46437e0 <_ChromeMain+0x463e544>
 46437b4: 391042bf     	strb	wzr, [x21, #0x410]
 46437b8: 910e22a0     	add	x0, x21, #0x388
 46437bc: 52800021     	mov	w1, #0x1                ; =1
 46437c0: 97756c69     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46437c4: aa1503e0     	mov	x0, x21
 46437c8: 96fd766d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46437cc: 3950e288     	ldrb	w8, [x20, #0x438]
 46437d0: 7200011f     	tst	w8, #0x1
 46437d4: 6f00e400     	movi.2d	v0, #0000000000000000
 46437d8: 1e6e1001     	fmov	d1, #1.00000000
 46437dc: 1e601c20     	fcsel	d0, d1, d0, ne
 46437e0: 39502288     	ldrb	w8, [x20, #0x408]
 46437e4: 350012e8     	cbnz	w8, 0x4643a40 <_ChromeMain+0x463e7a4>
 46437e8: fd021280     	str	d0, [x20, #0x420]
 46437ec: 394f0288     	ldrb	w8, [x20, #0x3c0]
 46437f0: 35000f68     	cbnz	w8, 0x46439dc <_ChromeMain+0x463e740>
 46437f4: aa1403e0     	mov	x0, x20
 46437f8: 94008f92     	bl	0x4667640 <_ChromeMain+0x46623a4>
 46437fc: a9007fff     	stp	xzr, xzr, [sp]
 4643800: f9000bff     	str	xzr, [sp, #0x10]
 4643804: f948d261     	ldr	x1, [x19, #0x11a0]
 4643808: f948d663     	ldr	x3, [x19, #0x11a8]
 464380c: 52801708     	mov	w8, #0xb8               ; =184
 4643810: 9b080462     	madd	x2, x3, x8, x1
 4643814: 910003f5     	mov	x21, sp
 4643818: 910003e0     	mov	x0, sp
 464381c: 9400c812     	bl	0x4675864 <_ChromeMain+0x46705c8>
 4643820: 910003e1     	mov	x1, sp
 4643824: aa1403e0     	mov	x0, x20
 4643828: 97ffe6bb     	bl	0x463d314 <_ChromeMain+0x4638078>
 464382c: f9000ff5     	str	x21, [sp, #0x18]
 4643830: 910063e0     	add	x0, sp, #0x18
 4643834: 9400aa37     	bl	0x466e110 <_ChromeMain+0x4668e74>
 4643838: 396e4668     	ldrb	w8, [x19, #0xb91]
 464383c: 392e467f     	strb	wzr, [x19, #0xb91]
 4643840: 34000488     	cbz	w8, 0x46438d0 <_ChromeMain+0x463e634>
 4643844: f942e274     	ldr	x20, [x19, #0x5c0]
 4643848: b4000214     	cbz	x20, 0x4643888 <_ChromeMain+0x463e5ec>
 464384c: f9423e60     	ldr	x0, [x19, #0x478]
 4643850: b4000080     	cbz	x0, 0x4643860 <_ChromeMain+0x463e5c4>
 4643854: 52800001     	mov	w1, #0x0                ; =0
 4643858: 96ffb307     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464385c: f942e274     	ldr	x20, [x19, #0x5c0]
 4643860: 910c8295     	add	x21, x20, #0x320
 4643864: f9419280     	ldr	x0, [x20, #0x320]
 4643868: 94007933     	bl	0x4661d34 <_ChromeMain+0x465ca98>
 464386c: f9018e95     	str	x21, [x20, #0x318]
 4643870: 6f00e400     	movi.2d	v0, #0000000000000000
 4643874: 3d80ca80     	str	q0, [x20, #0x320]
 4643878: f9400288     	ldr	x8, [x20]
 464387c: f9418508     	ldr	x8, [x8, #0x308]
 4643880: aa1403e0     	mov	x0, x20
 4643884: d63f0100     	blr	x8
 4643888: 397e4268     	ldrb	w8, [x19, #0xf90]
 464388c: 37000228     	tbnz	w8, #0x0, 0x46438d0 <_ChromeMain+0x463e634>
 4643890: f9423668     	ldr	x8, [x19, #0x468]
 4643894: b40001e8     	cbz	x8, 0x46438d0 <_ChromeMain+0x463e634>
 4643898: f9400100     	ldr	x0, [x8]
 464389c: b9401808     	ldr	w8, [x0, #0x18]
 46438a0: 7100051f     	cmp	w8, #0x1
 46438a4: 5400006b     	b.lt	0x46438b0 <_ChromeMain+0x463e614>
 46438a8: d2800014     	mov	x20, #0x0               ; =0
 46438ac: 1400002e     	b	0x4643964 <_ChromeMain+0x463e6c8>
 46438b0: aa1303e0     	mov	x0, x19
 46438b4: 940006d3     	bl	0x4645400 <_ChromeMain+0x4640164>
 46438b8: aa1303e0     	mov	x0, x19
 46438bc: 97fff5e8     	bl	0x464105c <_ChromeMain+0x463bdc0>
 46438c0: aa1303e0     	mov	x0, x19
 46438c4: 97ffd423     	bl	0x4638950 <_ChromeMain+0x46336b4>
 46438c8: aa1303e0     	mov	x0, x19
 46438cc: 97ffa22f     	bl	0x462c188 <_ChromeMain+0x4626eec>
 46438d0: aa1303e0     	mov	x0, x19
 46438d4: 97ffe7ff     	bl	0x463d8d0 <_ChromeMain+0x4638634>
 46438d8: 392e4a7f     	strb	wzr, [x19, #0xb92]
 46438dc: aa1303e0     	mov	x0, x19
 46438e0: 52800001     	mov	w1, #0x0                ; =0
 46438e4: 96ffb2e4     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46438e8: aa1303e0     	mov	x0, x19
 46438ec: 97098852     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 46438f0: aa1303e0     	mov	x0, x19
 46438f4: 96fd7622     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46438f8: f945ce60     	ldr	x0, [x19, #0xb98]
 46438fc: f905ce7f     	str	xzr, [x19, #0xb98]
 4643900: b4000120     	cbz	x0, 0x4643924 <_ChromeMain+0x463e688>
 4643904: d00545e8     	adrp	x8, 0xef01000 <dyld_stub_binder+0xef01000>
 4643908: b946c909     	ldr	w9, [x8, #0x6c8]
 464390c: 7100013f     	cmp	w9, #0x0
 4643910: 54000a4d     	b.le	0x4643a58 <_ChromeMain+0x463e7bc>
 4643914: 51000529     	sub	w9, w9, #0x1
 4643918: b906c909     	str	w9, [x8, #0x6c8]
 464391c: 52800021     	mov	w1, #0x1                ; =1
 4643920: 96e71566     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4643924: a9467bfd     	ldp	x29, x30, [sp, #0x60]
