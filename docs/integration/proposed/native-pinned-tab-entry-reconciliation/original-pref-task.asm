
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d8318: d104c3ff     	sub	sp, sp, #0x130
 41d831c: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 41d8320: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 41d8324: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 41d8328: a91057f6     	stp	x22, x21, [sp, #0x100]
 41d832c: a9114ff4     	stp	x20, x19, [sp, #0x110]
 41d8330: a9127bfd     	stp	x29, x30, [sp, #0x120]
 41d8334: 910483fd     	add	x29, sp, #0x120
 41d8338: aa0003f3     	mov	x19, x0
 41d833c: 3903001f     	strb	wzr, [x0, #0xc0]
 41d8340: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 41d8344: f81a03bf     	stur	xzr, [x29, #-0x60]
 41d8348: f9402000     	ldr	x0, [x0, #0x40]
 41d834c: 9100c3e8     	add	x8, sp, #0x30
 41d8350: 97fff0c4     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 41d8354: a94323f4     	ldp	x20, x8, [sp, #0x30]
 41d8358: 8b080d08     	add	x8, x8, x8, lsl #3
 41d835c: d37ced15     	lsl	x21, x8, #4
 41d8360: b4000175     	cbz	x21, 0x41d838c <_ChromeMain+0x41d30f0>
 41d8364: aa1403e0     	mov	x0, x20
 41d8368: 971251c8     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d836c: aa0003e1     	mov	x1, x0
 41d8370: d101c3a0     	sub	x0, x29, #0x70
 41d8374: aa0103e2     	mov	x2, x1
 41d8378: 97702ae2     	bl	0x1de2f00 <_ChromeMain+0x1dddc64>
 41d837c: 91024294     	add	x20, x20, #0x90
 41d8380: f10242b5     	subs	x21, x21, #0x90
 41d8384: 54ffff01     	b.ne	0x41d8364 <_ChromeMain+0x41d30c8>
 41d8388: f9401bf4     	ldr	x20, [sp, #0x30]
 41d838c: b4000634     	cbz	x20, 0x41d8450 <_ChromeMain+0x41d31b4>
 41d8390: f9401fe8     	ldr	x8, [sp, #0x38]
 41d8394: 8b080d08     	add	x8, x8, x8, lsl #3
 41d8398: d37ced15     	lsl	x21, x8, #4
 41d839c: aa1403e0     	mov	x0, x20
 41d83a0: b4000415     	cbz	x21, 0x41d8420 <_ChromeMain+0x41d3184>
 41d83a4: d2800016     	mov	x22, #0x0               ; =0
 41d83a8: aa1403f7     	mov	x23, x20
 41d83ac: 14000016     	b	0x41d8404 <_ChromeMain+0x41d3168>
 41d83b0: 8b1502e8     	add	x8, x23, x21
 41d83b4: f85e8100     	ldur	x0, [x8, #-0x18]
 41d83b8: f85f8108     	ldur	x8, [x8, #-0x8]
 41d83bc: d37ff901     	lsl	x1, x8, #1
 41d83c0: 96f8c2be     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d83c4: 8b1502f9     	add	x25, x23, x21
 41d83c8: d1008320     	sub	x0, x25, #0x20
 41d83cc: d2800001     	mov	x1, #0x0                ; =0
 41d83d0: 96f93e3a     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d83d4: d101c320     	sub	x0, x25, #0x70
 41d83d8: 96f93e28     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d83dc: 38d87328     	ldursb	w8, [x25, #-0x79]
 41d83e0: 36f800a8     	tbz	w8, #0x1f, 0x41d83f4 <_ChromeMain+0x41d3158>
 41d83e4: f9400300     	ldr	x0, [x24]
 41d83e8: f8580328     	ldur	x8, [x25, #-0x80]
 41d83ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d83f0: 96f8c2b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d83f4: d10242f7     	sub	x23, x23, #0x90
 41d83f8: 910242d6     	add	x22, x22, #0x90
 41d83fc: eb1602bf     	cmp	x21, x22
 41d8400: 540000e0     	b.eq	0x41d841c <_ChromeMain+0x41d3180>
 41d8404: 8b1502e8     	add	x8, x23, x21
 41d8408: f1024118     	subs	x24, x8, #0x90
 41d840c: 54001900     	b.eq	0x41d872c <_ChromeMain+0x41d3490>
 41d8410: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d8414: 36fffd88     	tbz	w8, #0x1f, 0x41d83c4 <_ChromeMain+0x41d3128>
 41d8418: 17ffffe6     	b	0x41d83b0 <_ChromeMain+0x41d3114>
 41d841c: f9401be0     	ldr	x0, [sp, #0x30]
 41d8420: cb000288     	sub	x8, x20, x0
 41d8424: 9344fd08     	asr	x8, x8, #4
 41d8428: d291c729     	mov	x9, #0x8e39             ; =36409
 41d842c: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d8430: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d8434: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d8438: 9b097d08     	mul	x8, x8, x9
 41d843c: f9001fe8     	str	x8, [sp, #0x38]
 41d8440: f94023e8     	ldr	x8, [sp, #0x40]
 41d8444: 8b080d08     	add	x8, x8, x8, lsl #3
 41d8448: d37ced01     	lsl	x1, x8, #4
 41d844c: 96f8c29b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8450: f9402a68     	ldr	x8, [x19, #0x50]
 41d8454: d37df109     	lsl	x9, x8, #3
 41d8458: b4000449     	cbz	x9, 0x41d84e0 <_ChromeMain+0x41d3244>
 41d845c: f9402679     	ldr	x25, [x19, #0x48]
 41d8460: 8b080f3a     	add	x26, x25, x8, lsl #3
 41d8464: 9100c3fb     	add	x27, sp, #0x30
 41d8468: 900547f3     	adrp	x19, 0xead4000 <dyld_stub_binder+0xead4000>
 41d846c: 9126c273     	add	x19, x19, #0x9b0
 41d8470: 5280003c     	mov	w28, #0x1               ; =1
 41d8474: 14000042     	b	0x41d857c <_ChromeMain+0x41d32e0>
 41d8478: f85983a8     	ldur	x8, [x29, #-0x68]
 41d847c: 8b080509     	add	x9, x8, x8, lsl #1
 41d8480: d37df129     	lsl	x9, x9, #3
 41d8484: b4001569     	cbz	x9, 0x41d8730 <_ChromeMain+0x41d3494>
 41d8488: 8b130129     	add	x9, x9, x19
 41d848c: d1006134     	sub	x20, x9, #0x18
 41d8490: d37df109     	lsl	x9, x8, #3
 41d8494: cb081535     	sub	x21, x9, x8, lsl #5
 41d8498: b40014b4     	cbz	x20, 0x41d872c <_ChromeMain+0x41d3490>
 41d849c: 39c05e88     	ldrsb	w8, [x20, #0x17]
 41d84a0: 37f813c8     	tbnz	w8, #0x1f, 0x41d8718 <_ChromeMain+0x41d347c>
 41d84a4: d1006294     	sub	x20, x20, #0x18
 41d84a8: b10062b5     	adds	x21, x21, #0x18
 41d84ac: 54ffff61     	b.ne	0x41d8498 <_ChromeMain+0x41d31fc>
 41d84b0: f85903a0     	ldur	x0, [x29, #-0x70]
 41d84b4: cb000268     	sub	x8, x19, x0
 41d84b8: 9343fd08     	asr	x8, x8, #3
 41d84bc: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 41d84c0: f2955569     	movk	x9, #0xaaab
 41d84c4: 9b097d08     	mul	x8, x8, x9
 41d84c8: f81983a8     	stur	x8, [x29, #-0x68]
 41d84cc: f85a03a8     	ldur	x8, [x29, #-0x60]
 41d84d0: 8b080508     	add	x8, x8, x8, lsl #1
 41d84d4: d37df101     	lsl	x1, x8, #3
 41d84d8: 96f8c278     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d84dc: 14000003     	b	0x41d84e8 <_ChromeMain+0x41d324c>
 41d84e0: f85903b3     	ldur	x19, [x29, #-0x70]
 41d84e4: b5fffcb3     	cbnz	x19, 0x41d8478 <_ChromeMain+0x41d31dc>
 41d84e8: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 41d84ec: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 41d84f0: a95057f6     	ldp	x22, x21, [sp, #0x100]
 41d84f4: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 41d84f8: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 41d84fc: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 41d8500: 9104c3ff     	add	sp, sp, #0x130
 41d8504: d65f03c0     	ret
 41d8508: b40002d8     	cbz	x24, 0x41d8560 <_ChromeMain+0x41d32c4>
 41d850c: a901e3f4     	stp	x20, x24, [sp, #0x18]
 41d8510: f90017f7     	str	x23, [sp, #0x28]
 41d8514: 910063e1     	add	x1, sp, #0x18
 41d8518: aa1503e0     	mov	x0, x21
 41d851c: 52800002     	mov	w2, #0x0                ; =0
 41d8520: 94003620     	bl	0x41e5da0 <_ChromeMain+0x41e0b04>
 41d8524: f9400ff4     	ldr	x20, [sp, #0x18]
 41d8528: b4000254     	cbz	x20, 0x41d8570 <_ChromeMain+0x41d32d4>
 41d852c: f94013e8     	ldr	x8, [sp, #0x20]
 41d8530: d37ef509     	lsl	x9, x8, #2
 41d8534: b4000109     	cbz	x9, 0x41d8554 <_ChromeMain+0x41d32b8>
 41d8538: cb080be8     	neg	x8, x8, lsl #2
 41d853c: 8b090289     	add	x9, x20, x9
 41d8540: d1001129     	sub	x9, x9, #0x4
 41d8544: b4000f49     	cbz	x9, 0x41d872c <_ChromeMain+0x41d3490>
 41d8548: d1001129     	sub	x9, x9, #0x4
 41d854c: 91001108     	add	x8, x8, #0x4
 41d8550: b5ffffa8     	cbnz	x8, 0x41d8544 <_ChromeMain+0x41d32a8>
 41d8554: f90013ff     	str	xzr, [sp, #0x20]
 41d8558: f94017f7     	ldr	x23, [sp, #0x28]
 41d855c: 14000002     	b	0x41d8564 <_ChromeMain+0x41d32c8>
 41d8560: b4000094     	cbz	x20, 0x41d8570 <_ChromeMain+0x41d32d4>
 41d8564: d37ef6e1     	lsl	x1, x23, #2
 41d8568: aa1403e0     	mov	x0, x20
 41d856c: 96f8c253     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8570: 91002339     	add	x25, x25, #0x8
 41d8574: eb1a033f     	cmp	x25, x26
 41d8578: 54fffb40     	b.eq	0x41d84e0 <_ChromeMain+0x41d3244>
 41d857c: f9400335     	ldr	x21, [x25]
 41d8580: f94002a0     	ldr	x0, [x21]
 41d8584: b9401808     	ldr	w8, [x0, #0x18]
 41d8588: 7100051f     	cmp	w8, #0x1
 41d858c: 54ffff2b     	b.lt	0x41d8570 <_ChromeMain+0x41d32d4>
 41d8590: d2800016     	mov	x22, #0x0               ; =0
 41d8594: d2800017     	mov	x23, #0x0               ; =0
 41d8598: d2800018     	mov	x24, #0x0               ; =0
 41d859c: d2800014     	mov	x20, #0x0               ; =0
 41d85a0: 14000015     	b	0x41d85f4 <_ChromeMain+0x41d3358>
 41d85a4: 3900c3ff     	strb	wzr, [sp, #0x30]
 41d85a8: 3902a3ff     	strb	wzr, [sp, #0xa8]
 41d85ac: 3942a3e8     	ldrb	w8, [sp, #0xa8]
 41d85b0: 34000188     	cbz	w8, 0x41d85e0 <_ChromeMain+0x41d3344>
 41d85b4: 9101c360     	add	x0, x27, #0x70
 41d85b8: d2800001     	mov	x1, #0x0                ; =0
 41d85bc: 96f93dbf     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d85c0: 91008360     	add	x0, x27, #0x20
 41d85c4: 96f93dad     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d85c8: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 41d85cc: 36f800a8     	tbz	w8, #0x1f, 0x41d85e0 <_ChromeMain+0x41d3344>
 41d85d0: f9401be0     	ldr	x0, [sp, #0x30]
 41d85d4: f94023e8     	ldr	x8, [sp, #0x40]
 41d85d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d85dc: 96f8c237     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d85e0: 910006d6     	add	x22, x22, #0x1
 41d85e4: f94002a0     	ldr	x0, [x21]
 41d85e8: b9801808     	ldrsw	x8, [x0, #0x18]
 41d85ec: eb0802df     	cmp	x22, x8
 41d85f0: 54fff8ca     	b.ge	0x41d8508 <_ChromeMain+0x41d326c>
 41d85f4: aa1603e1     	mov	x1, x22
 41d85f8: 973a1740     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 41d85fc: b4ffff20     	cbz	x0, 0x41d85e0 <_ChromeMain+0x41d3344>
 41d8600: 39418408     	ldrb	w8, [x0, #0x61]
 41d8604: 34fffee8     	cbz	w8, 0x41d85e0 <_ChromeMain+0x41d3344>
 41d8608: f9402008     	ldr	x8, [x0, #0x40]
 41d860c: 6f00e400     	movi.2d	v0, #0000000000000000
 41d8610: ad0483e0     	stp	q0, q0, [sp, #0x90]
 41d8614: ad0383e0     	stp	q0, q0, [sp, #0x70]
 41d8618: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41d861c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d8620: b4fffc68     	cbz	x8, 0x41d85ac <_ChromeMain+0x41d3310>
 41d8624: 91002100     	add	x0, x8, #0x8
 41d8628: aa1303e1     	mov	x1, x19
 41d862c: 96f9ead1     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d8630: b4fffba0     	cbz	x0, 0x41d85a4 <_ChromeMain+0x41d3308>
 41d8634: aa0003e8     	mov	x8, x0
 41d8638: 39408009     	ldrb	w9, [x0, #0x20]
 41d863c: 3607fb49     	tbz	w9, #0x0, 0x41d85a4 <_ChromeMain+0x41d3308>
 41d8640: 9100c3e0     	add	x0, sp, #0x30
 41d8644: 91002101     	add	x1, x8, #0x8
 41d8648: 96fd8653     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d864c: 3902a3fc     	strb	w28, [sp, #0xa8]
 41d8650: 394123e8     	ldrb	w8, [sp, #0x48]
 41d8654: 34fffac8     	cbz	w8, 0x41d85ac <_ChromeMain+0x41d3310>
 41d8658: 9100c3e0     	add	x0, sp, #0x30
 41d865c: 9712510b     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d8660: aa0003e1     	mov	x1, x0
 41d8664: d101c3a0     	sub	x0, x29, #0x70
 41d8668: 974c8166     	bl	0x14f8c00 <_ChromeMain+0x14f3964>
 41d866c: 3707fa00     	tbnz	w0, #0x0, 0x41d85ac <_ChromeMain+0x41d3310>
 41d8670: eb17031f     	cmp	x24, x23
 41d8674: 54000120     	b.eq	0x41d8698 <_ChromeMain+0x41d33fc>
 41d8678: 8b180a98     	add	x24, x20, x24, lsl #2
 41d867c: b4000598     	cbz	x24, 0x41d872c <_ChromeMain+0x41d3490>
 41d8680: b9000316     	str	w22, [x24]
 41d8684: 91001308     	add	x8, x24, #0x4
 41d8688: eb140108     	subs	x8, x8, x20
 41d868c: 54000500     	b.eq	0x41d872c <_ChromeMain+0x41d3490>
 41d8690: 9342fd18     	asr	x24, x8, #2
 41d8694: 17ffffc6     	b	0x41d85ac <_ChromeMain+0x41d3310>
 41d8698: 910006e8     	add	x8, x23, #0x1
 41d869c: d37efd09     	lsr	x9, x8, #62
 41d86a0: b50004c9     	cbnz	x9, 0x41d8738 <_ChromeMain+0x41d349c>
 41d86a4: d37ffae9     	lsl	x9, x23, #1
 41d86a8: eb08013f     	cmp	x9, x8
 41d86ac: 9a888128     	csel	x8, x9, x8, hi
 41d86b0: 92fc0009     	mov	x9, #0x1fffffffffffffff ; =2305843009213693951
 41d86b4: eb0902ff     	cmp	x23, x9
 41d86b8: 92f80009     	mov	x9, #0x3fffffffffffffff ; =4611686018427387903
 41d86bc: 9a893109     	csel	x9, x8, x9, lo
 41d86c0: f9000be9     	str	x9, [sp, #0x10]
 41d86c4: b40003e9     	cbz	x9, 0x41d8740 <_ChromeMain+0x41d34a4>
 41d86c8: d37efd28     	lsr	x8, x9, #62
 41d86cc: b5000388     	cbnz	x8, 0x41d873c <_ChromeMain+0x41d34a0>
 41d86d0: d37ef520     	lsl	x0, x9, #2
 41d86d4: 96f8db25     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d86d8: ab170818     	adds	x24, x0, x23, lsl #2
 41d86dc: 54000280     	b.eq	0x41d872c <_ChromeMain+0x41d3490>
 41d86e0: b9000316     	str	w22, [x24]
 41d86e4: d37ef6e2     	lsl	x2, x23, #2
 41d86e8: cb170b17     	sub	x23, x24, x23, lsl #2
 41d86ec: aa1703e0     	mov	x0, x23
 41d86f0: aa1403e1     	mov	x1, x20
 41d86f4: f90007e2     	str	x2, [sp, #0x8]
 41d86f8: 94f8c580     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 41d86fc: b4000094     	cbz	x20, 0x41d870c <_ChromeMain+0x41d3470>
 41d8700: aa1403e0     	mov	x0, x20
 41d8704: f94007e1     	ldr	x1, [sp, #0x8]
 41d8708: 96f8c1ec     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d870c: aa1703f4     	mov	x20, x23
 41d8710: f9400bf7     	ldr	x23, [sp, #0x10]
 41d8714: 17ffffdc     	b	0x41d8684 <_ChromeMain+0x41d33e8>
 41d8718: f9400280     	ldr	x0, [x20]
 41d871c: f9400a88     	ldr	x8, [x20, #0x10]
 41d8720: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d8724: 96f8c1e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8728: 17ffff5f     	b	0x41d84a4 <_ChromeMain+0x41d3208>
 41d872c: d4200020     	brk	#0x1
 41d8730: aa1303e0     	mov	x0, x19
 41d8734: 17ffff60     	b	0x41d84b4 <_ChromeMain+0x41d3218>
 41d8738: 9774ed92     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 41d873c: 9428b639     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 41d8740: d2800000     	mov	x0, #0x0                ; =0
 41d8744: 17ffffe5     	b	0x41d86d8 <_ChromeMain+0x41d343c>
 41d8748: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 41d874c: a90167fa     	stp	x26, x25, [sp, #0x10]
 41d8750: a9025ff8     	stp	x24, x23, [sp, #0x20]
 41d8754: a90357f6     	stp	x22, x21, [sp, #0x30]
 41d8758: a9044ff4     	stp	x20, x19, [sp, #0x40]
 41d875c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 41d8760: 910143fd     	add	x29, sp, #0x50
 41d8764: d28e38e8     	mov	x8, #0x71c7             ; =29127
 41d8768: f2b8e388     	movk	x8, #0xc71c, lsl #16
 41d876c: f2c38e28     	movk	x8, #0x1c71, lsl #32
 41d8770: f2e038e8     	movk	x8, #0x1c7, lsl #48
 41d8774: f9400816     	ldr	x22, [x0, #0x10]
 41d8778: f94006d5     	ldr	x21, [x22, #0x8]
 41d877c: 910006a9     	add	x9, x21, #0x1
 41d8780: eb08013f     	cmp	x9, x8
 41d8784: 54000e08     	b.hi	0x41d8944 <_ChromeMain+0x41d36a8>
 41d8788: aa0003f3     	mov	x19, x0
 41d878c: f9400414     	ldr	x20, [x0, #0x8]
 41d8790: f9400aca     	ldr	x10, [x22, #0x10]
 41d8794: d37ff94b     	lsl	x11, x10, #1
 41d8798: eb09017f     	cmp	x11, x9
 41d879c: 9a898169     	csel	x9, x11, x9, hi
 41d87a0: d2871c6b     	mov	x11, #0x38e3            ; =14563
 41d87a4: f2bc71cb     	movk	x11, #0xe38e, lsl #16
 41d87a8: f2d1c70b     	movk	x11, #0x8e38, lsl #32
 41d87ac: f2e01c6b     	movk	x11, #0xe3, lsl #48
 41d87b0: eb0b015f     	cmp	x10, x11
 41d87b4: 9a883137     	csel	x23, x9, x8, lo
 41d87b8: b4000597     	cbz	x23, 0x41d8868 <_ChromeMain+0x41d35cc>
 41d87bc: eb0802ff     	cmp	x23, x8
 41d87c0: 54000c48     	b.hi	0x41d8948 <_ChromeMain+0x41d36ac>
 41d87c4: 8b170ee8     	add	x8, x23, x23, lsl #3
 41d87c8: d37ced00     	lsl	x0, x8, #4
 41d87cc: 96f8dae7     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d87d0: 52801208     	mov	w8, #0x90               ; =144
 41d87d4: 9b0802b8     	madd	x24, x21, x8, x0
 41d87d8: b4000b58     	cbz	x24, 0x41d8940 <_ChromeMain+0x41d36a4>
 41d87dc: f9400288     	ldr	x8, [x20]
 41d87e0: f9000308     	str	x8, [x24]
 41d87e4: f900029f     	str	xzr, [x20]
 41d87e8: 91002300     	add	x0, x24, #0x8
 41d87ec: 91002281     	add	x1, x20, #0x8
 41d87f0: 97000995     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d87f4: 3dc02280     	ldr	q0, [x20, #0x80]
 41d87f8: 3d802300     	str	q0, [x24, #0x80]
 41d87fc: 928011e8     	mov	x8, #-0x90              ; =-144
 41d8800: a94026d4     	ldp	x20, x9, [x22]
 41d8804: 9b087d3a     	mul	x26, x9, x8
 41d8808: 8b1a030a     	add	x10, x24, x26
 41d880c: 8b090d28     	add	x8, x9, x9, lsl #3
 41d8810: d37ced09     	lsl	x9, x8, #4
 41d8814: b4000629     	cbz	x9, 0x41d88d8 <_ChromeMain+0x41d363c>
 41d8818: 8b08129b     	add	x27, x20, x8, lsl #4
 41d881c: 91002295     	add	x21, x20, #0x8
 41d8820: 8b1a031c     	add	x28, x24, x26
 41d8824: b40008fc     	cbz	x28, 0x41d8940 <_ChromeMain+0x41d36a4>
 41d8828: d10022b9     	sub	x25, x21, #0x8
 41d882c: f85f82a8     	ldur	x8, [x21, #-0x8]
 41d8830: f9000388     	str	x8, [x28]
 41d8834: f81f82bf     	stur	xzr, [x21, #-0x8]
 41d8838: 91002380     	add	x0, x28, #0x8
 41d883c: aa1503e1     	mov	x1, x21
 41d8840: 97000981     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d8844: 3dc02320     	ldr	q0, [x25, #0x80]
 41d8848: 3d802380     	str	q0, [x28, #0x80]
 41d884c: 9102439c     	add	x28, x28, #0x90
 41d8850: 910242b5     	add	x21, x21, #0x90
 41d8854: 91024328     	add	x8, x25, #0x90
 41d8858: eb1b011f     	cmp	x8, x27
 41d885c: 54fffe41     	b.ne	0x41d8824 <_ChromeMain+0x41d3588>
 41d8860: d0054ed5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d8864: 14000011     	b	0x41d88a8 <_ChromeMain+0x41d360c>
 41d8868: d2800000     	mov	x0, #0x0                ; =0
 41d886c: 17ffffd9     	b	0x41d87d0 <_ChromeMain+0x41d3534>
 41d8870: f9400680     	ldr	x0, [x20, #0x8]
 41d8874: f9400e88     	ldr	x8, [x20, #0x18]
 41d8878: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d887c: 96f8c18f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8880: f8588380     	ldur	x0, [x28, #-0x78]
 41d8884: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d8888: f94046a9     	ldr	x9, [x21, #0x88]
 41d888c: eb09011f     	cmp	x8, x9
 41d8890: 54000041     	b.ne	0x41d8898 <_ChromeMain+0x41d35fc>
 41d8894: 96f9286a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d8898: f818839f     	stur	xzr, [x28, #-0x78]
 41d889c: 91006394     	add	x20, x28, #0x18
 41d88a0: eb1b029f     	cmp	x20, x27
 41d88a4: 54000160     	b.eq	0x41d88d0 <_ChromeMain+0x41d3634>
 41d88a8: b40004d4     	cbz	x20, 0x41d8940 <_ChromeMain+0x41d36a4>
 41d88ac: 9101e29c     	add	x28, x20, #0x78
 41d88b0: 9101e280     	add	x0, x20, #0x78
 41d88b4: d2800001     	mov	x1, #0x0                ; =0
 41d88b8: 96f93d00     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d88bc: 9100a280     	add	x0, x20, #0x28
 41d88c0: 96f93cee     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d88c4: 39c07e88     	ldrsb	w8, [x20, #0x1f]
 41d88c8: 36fffdc8     	tbz	w8, #0x1f, 0x41d8880 <_ChromeMain+0x41d35e4>
 41d88cc: 17ffffe9     	b	0x41d8870 <_ChromeMain+0x41d35d4>
 41d88d0: f94002d4     	ldr	x20, [x22]
 41d88d4: 8b1a030a     	add	x10, x24, x26
 41d88d8: 52801208     	mov	w8, #0x90               ; =144
 41d88dc: cb1a0108     	sub	x8, x8, x26
 41d88e0: 9344fd08     	asr	x8, x8, #4
 41d88e4: d291c729     	mov	x9, #0x8e39             ; =36409
 41d88e8: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d88ec: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d88f0: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d88f4: 9b097d08     	mul	x8, x8, x9
 41d88f8: a90022ca     	stp	x10, x8, [x22]
 41d88fc: f9400ac8     	ldr	x8, [x22, #0x10]
 41d8900: f9000ad7     	str	x23, [x22, #0x10]
 41d8904: b40000b4     	cbz	x20, 0x41d8918 <_ChromeMain+0x41d367c>
 41d8908: 8b080d08     	add	x8, x8, x8, lsl #3
 41d890c: d37ced01     	lsl	x1, x8, #4
 41d8910: aa1403e0     	mov	x0, x20
 41d8914: 96f8c169     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d8918: 91024308     	add	x8, x24, #0x90
 41d891c: f9400269     	ldr	x9, [x19]
 41d8920: f9000128     	str	x8, [x9]
 41d8924: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 41d8928: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 41d892c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 41d8930: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 41d8934: a94167fa     	ldp	x26, x25, [sp, #0x10]
 41d8938: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 41d893c: d65f03c0     	ret
 41d8940: d4200020     	brk	#0x1
 41d8944: 9774ed0f     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 41d8948: 9428b5b6     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 41d894c: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 41d8950: a90157f6     	stp	x22, x21, [sp, #0x10]
 41d8954: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41d8958: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41d895c: 9100c3fd     	add	x29, sp, #0x30
 41d8960: eb02003f     	cmp	x1, x2
 41d8964: 54000788     	b.hi	0x41d8a54 <_ChromeMain+0x41d37b8>
 41d8968: 540006c0     	b.eq	0x41d8a40 <_ChromeMain+0x41d37a4>
 41d896c: aa0103f4     	mov	x20, x1
 41d8970: aa0003f3     	mov	x19, x0
 41d8974: a9402408     	ldp	x8, x9, [x0]
 41d8978: cb08004a     	sub	x10, x2, x8
 41d897c: eb090d5f     	cmp	x10, x9, lsl #3
 41d8980: d0054ed5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d8984: 54000300     	b.eq	0x41d89e4 <_ChromeMain+0x41d3748>
 41d8988: d37df129     	lsl	x9, x9, #3
 41d898c: cb14004a     	sub	x10, x2, x20
 41d8990: 8b0a0296     	add	x22, x20, x10
 41d8994: 8b090108     	add	x8, x8, x9
 41d8998: cb020117     	sub	x23, x8, x2
 41d899c: 14000009     	b	0x41d89c0 <_ChromeMain+0x41d3724>
 41d89a0: 96f92827     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d89a4: f94002c8     	ldr	x8, [x22]
 41d89a8: f9000288     	str	x8, [x20]
 41d89ac: f90002df     	str	xzr, [x22]
 41d89b0: 910022d6     	add	x22, x22, #0x8
 41d89b4: 91002294     	add	x20, x20, #0x8
 41d89b8: f10022f7     	subs	x23, x23, #0x8
 41d89bc: 54000120     	b.eq	0x41d89e0 <_ChromeMain+0x41d3744>
 41d89c0: eb1402df     	cmp	x22, x20
 41d89c4: 54ffff60     	b.eq	0x41d89b0 <_ChromeMain+0x41d3714>
 41d89c8: f9400280     	ldr	x0, [x20]
 41d89cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d89d0: f94046a9     	ldr	x9, [x21, #0x88]
 41d89d4: eb09011f     	cmp	x8, x9
 41d89d8: 54fffe61     	b.ne	0x41d89a4 <_ChromeMain+0x41d3708>
 41d89dc: 17fffff1     	b	0x41d89a0 <_ChromeMain+0x41d3704>
 41d89e0: a9402668     	ldp	x8, x9, [x19]
 41d89e4: 8b090d09     	add	x9, x8, x9, lsl #3
 41d89e8: eb09029f     	cmp	x20, x9
 41d89ec: 54000240     	b.eq	0x41d8a34 <_ChromeMain+0x41d3798>
 41d89f0: d1002136     	sub	x22, x9, #0x8
 41d89f4: 14000007     	b	0x41d8a10 <_ChromeMain+0x41d3774>
 41d89f8: 96f92811     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d89fc: f90002df     	str	xzr, [x22]
 41d8a00: 910022e8     	add	x8, x23, #0x8
 41d8a04: aa1703f6     	mov	x22, x23
 41d8a08: eb14011f     	cmp	x8, x20
 41d8a0c: 54000120     	b.eq	0x41d8a30 <_ChromeMain+0x41d3794>
 41d8a10: b4000236     	cbz	x22, 0x41d8a54 <_ChromeMain+0x41d37b8>
 41d8a14: aa1603f7     	mov	x23, x22
 41d8a18: f85f86e0     	ldr	x0, [x23], #-0x8
 41d8a1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d8a20: f94046a9     	ldr	x9, [x21, #0x88]
 41d8a24: eb09011f     	cmp	x8, x9
 41d8a28: 54fffea1     	b.ne	0x41d89fc <_ChromeMain+0x41d3760>
 41d8a2c: 17fffff3     	b	0x41d89f8 <_ChromeMain+0x41d375c>
 41d8a30: f9400268     	ldr	x8, [x19]
 41d8a34: cb080288     	sub	x8, x20, x8
 41d8a38: 9343fd08     	asr	x8, x8, #3
 41d8a3c: f9000668     	str	x8, [x19, #0x8]
 41d8a40: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41d8a44: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41d8a48: a94157f6     	ldp	x22, x21, [sp, #0x10]
 41d8a4c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 41d8a50: d65f03c0     	ret
 41d8a54: d4200020     	brk	#0x1
 41d8a58: d103c3ff     	sub	sp, sp, #0xf0
 41d8a5c: a9096ffc     	stp	x28, x27, [sp, #0x90]
 41d8a60: a90a67fa     	stp	x26, x25, [sp, #0xa0]
 41d8a64: a90b5ff8     	stp	x24, x23, [sp, #0xb0]
 41d8a68: a90c57f6     	stp	x22, x21, [sp, #0xc0]
 41d8a6c: a90d4ff4     	stp	x20, x19, [sp, #0xd0]
 41d8a70: a90e7bfd     	stp	x29, x30, [sp, #0xe0]
 41d8a74: 910383fd     	add	x29, sp, #0xe0
 41d8a78: aa0303f6     	mov	x22, x3
 41d8a7c: aa0203f7     	mov	x23, x2
 41d8a80: aa0103f3     	mov	x19, x1
 41d8a84: aa0003f4     	mov	x20, x0
 41d8a88: f940001b     	ldr	x27, [x0]
 41d8a8c: aa0003f5     	mov	x21, x0
 41d8a90: f8408ea8     	ldr	x8, [x21, #0x8]!
 41d8a94: aa0003f8     	mov	x24, x0
 41d8a98: f8410f09     	ldr	x9, [x24, #0x10]!
 41d8a9c: eb09011f     	cmp	x8, x9
 41d8aa0: 540008e1     	b.ne	0x41d8bbc <_ChromeMain+0x41d3920>
 41d8aa4: 91000509     	add	x9, x8, #0x1
 41d8aa8: d379fd2a     	lsr	x10, x9, #57
 41d8aac: b500186a     	cbnz	x10, 0x41d8db8 <_ChromeMain+0x41d3b1c>
 41d8ab0: d37ff90a     	lsl	x10, x8, #1
 41d8ab4: eb09015f     	cmp	x10, x9
 41d8ab8: 9a898149     	csel	x9, x10, x9, hi
 41d8abc: 92ffe00a     	mov	x10, #0xffffffffffffff  ; =72057594037927935
 41d8ac0: 92ffc00b     	mov	x11, #0x1ffffffffffffff ; =144115188075855871
 41d8ac4: eb0a011f     	cmp	x8, x10
 41d8ac8: 9a8b313c     	csel	x28, x9, x11, lo
 41d8acc: f90003ff     	str	xzr, [sp]
 41d8ad0: b400057c     	cbz	x28, 0x41d8b7c <_ChromeMain+0x41d38e0>
 41d8ad4: d379ff88     	lsr	x8, x28, #57
 41d8ad8: b5001728     	cbnz	x8, 0x41d8dbc <_ChromeMain+0x41d3b20>
 41d8adc: d379e380     	lsl	x0, x28, #7
 41d8ae0: 96f8da22     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d8ae4: aa0003f9     	mov	x25, x0
 41d8ae8: f90003e0     	str	x0, [sp]
 41d8aec: cb1b0268     	sub	x8, x19, x27
 41d8af0: 8b08033a     	add	x26, x25, x8
 41d8af4: f90007fa     	str	x26, [sp, #0x8]
 41d8af8: f9000ffc     	str	x28, [sp, #0x18]
 41d8afc: eb881f9f     	cmp	x28, x8, asr #7
 41d8b00: 54000101     	b.ne	0x41d8b20 <_ChromeMain+0x41d3884>
 41d8b04: eb1b027f     	cmp	x19, x27
 41d8b08: 540003e0     	b.eq	0x41d8b84 <_ChromeMain+0x41d38e8>
 41d8b0c: d37ae788     	lsl	x8, x28, #6
 41d8b10: 91010108     	add	x8, x8, #0x40
 41d8b14: 9279dd08     	and	x8, x8, #0x7fffffffffffff80
 41d8b18: cb08035a     	sub	x26, x26, x8
 41d8b1c: f90007fa     	str	x26, [sp, #0x8]
 41d8b20: b40014ba     	cbz	x26, 0x41d8db4 <_ChromeMain+0x41d3b18>
 41d8b24: b94002e8     	ldr	w8, [x23]
 41d8b28: aa1a03e0     	mov	x0, x26
 41d8b2c: b8008408     	str	w8, [x0], #0x8
 41d8b30: aa1603e1     	mov	x1, x22
 41d8b34: 96fd8518     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d8b38: f94007e8     	ldr	x8, [sp, #0x8]
 41d8b3c: cb080348     	sub	x8, x26, x8
 41d8b40: 91020108     	add	x8, x8, #0x80
 41d8b44: 9347fd08     	asr	x8, x8, #7
 41d8b48: f9000be8     	str	x8, [sp, #0x10]
 41d8b4c: 910003e0     	mov	x0, sp
 41d8b50: aa1303e1     	mov	x1, x19
 41d8b54: aa1403e2     	mov	x2, x20
 41d8b58: aa1503e3     	mov	x3, x21
 41d8b5c: aa1803e4     	mov	x4, x24
