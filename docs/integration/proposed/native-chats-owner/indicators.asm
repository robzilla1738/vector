
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46743e0: 140001b8     	b	0x4674ac0 <_ChromeMain+0x466f824>
 46743e4: 00000000     	udf	#0x0
 46743e8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46743ec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46743f0: 910043fd     	add	x29, sp, #0x10
 46743f4: aa0003f3     	mov	x19, x0
 46743f8: f941a400     	ldr	x0, [x0, #0x348]
 46743fc: b40001a0     	cbz	x0, 0x4674430 <_ChromeMain+0x466f194>
 4674400: f9400008     	ldr	x8, [x0]
 4674404: f9400908     	ldr	x8, [x8, #0x10]
 4674408: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 467440c: 9123b129     	add	x9, x9, #0x8ec
 4674410: eb09011f     	cmp	x8, x9
 4674414: 54000141     	b.ne	0x467443c <_ChromeMain+0x466f1a0>
 4674418: f9401008     	ldr	x8, [x0, #0x20]
 467441c: b40000a8     	cbz	x8, 0x4674430 <_ChromeMain+0x466f194>
 4674420: f9400c08     	ldr	x8, [x0, #0x18]
 4674424: b8bfc108     	ldapr	w8, [x8]
 4674428: 7100051f     	cmp	w8, #0x1
 467442c: 540000c1     	b.ne	0x4674444 <_ChromeMain+0x466f1a8>
 4674430: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674434: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674438: d65f03c0     	ret
 467443c: d63f0100     	blr	x8
 4674440: 34ffff80     	cbz	w0, 0x4674430 <_ChromeMain+0x466f194>
 4674444: 910c6260     	add	x0, x19, #0x318
 4674448: 9702e8b4     	bl	0x72e718 <_ChromeMain+0x72947c>
 467444c: aa1303e0     	mov	x0, x19
 4674450: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674454: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674458: 16fcb349     	b	0x5a117c <_ChromeMain+0x59bee0>
 467445c: d10143ff     	sub	sp, sp, #0x50
 4674460: a90257f6     	stp	x22, x21, [sp, #0x20]
 4674464: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4674468: a9047bfd     	stp	x29, x30, [sp, #0x40]
 467446c: 910103fd     	add	x29, sp, #0x40
 4674470: aa0103f3     	mov	x19, x1
 4674474: aa0003f4     	mov	x20, x0
 4674478: 528c8e15     	mov	w21, #0x6470            ; =25712
 467447c: 72a00115     	movk	w21, #0x8, lsl #16
 4674480: f941a400     	ldr	x0, [x0, #0x348]
 4674484: b40002a0     	cbz	x0, 0x46744d8 <_ChromeMain+0x466f23c>
 4674488: f9400008     	ldr	x8, [x0]
 467448c: f9400908     	ldr	x8, [x8, #0x10]
 4674490: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674494: 9123b129     	add	x9, x9, #0x8ec
 4674498: eb09011f     	cmp	x8, x9
 467449c: 54000561     	b.ne	0x4674548 <_ChromeMain+0x466f2ac>
 46744a0: f9401008     	ldr	x8, [x0, #0x20]
 46744a4: b40001a8     	cbz	x8, 0x46744d8 <_ChromeMain+0x466f23c>
 46744a8: f9400c08     	ldr	x8, [x0, #0x18]
 46744ac: b8bfc108     	ldapr	w8, [x8]
 46744b0: 7100051f     	cmp	w8, #0x1
 46744b4: 54000120     	b.eq	0x46744d8 <_ChromeMain+0x466f23c>
 46744b8: b00529e8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 46744bc: f9468d08     	ldr	x8, [x8, #0xd18]
 46744c0: d63f0100     	blr	x8
 46744c4: f9418a88     	ldr	x8, [x20, #0x310]
 46744c8: eb080008     	subs	x8, x0, x8
 46744cc: 937ffd09     	asr	x9, x8, #63
 46744d0: d2410129     	eor	x9, x9, #0x8000000000000000
 46744d4: 9a886135     	csel	x21, x9, x8, vs
 46744d8: f940e288     	ldr	x8, [x20, #0x1c0]
 46744dc: a900a3ff     	stp	xzr, x8, [sp, #0x8]
 46744e0: 0f000600     	movi.2s	v0, #0x10
 46744e4: fd000fe0     	str	d0, [sp, #0x18]
 46744e8: 910023e0     	add	x0, sp, #0x8
 46744ec: 910063e1     	add	x1, sp, #0x18
 46744f0: 97679771     	bl	0x205a2b4 <_ChromeMain+0x2055018>
 46744f4: aa1403e0     	mov	x0, x20
 46744f8: 96fcb2be     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46744fc: 52801ba1     	mov	w1, #0xdd               ; =221
 4674500: 9722cf32     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4674504: aa0003f4     	mov	x20, x0
 4674508: aa1503e0     	mov	x0, x21
 467450c: d2800001     	mov	x1, #0x0                ; =0
 4674510: 978d7b2c     	bl	0x29d31c0 <_ChromeMain+0x29cdf24>
 4674514: 2d0307e0     	stp	s0, s1, [sp, #0x18]
 4674518: 910023e1     	add	x1, sp, #0x8
 467451c: 910063e3     	add	x3, sp, #0x18
 4674520: aa1303e0     	mov	x0, x19
 4674524: aa1403e2     	mov	x2, x20
 4674528: d2a7f804     	mov	x4, #0x3fc00000         ; =1069547520
 467452c: f2c00024     	movk	x4, #0x1, lsl #32
 4674530: 978d7b84     	bl	0x29d3340 <_ChromeMain+0x29ce0a4>
 4674534: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4674538: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 467453c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4674540: 910143ff     	add	sp, sp, #0x50
 4674544: d65f03c0     	ret
 4674548: d63f0100     	blr	x8
 467454c: 35fffb60     	cbnz	w0, 0x46744b8 <_ChromeMain+0x466f21c>
 4674550: 17ffffe2     	b	0x46744d8 <_ChromeMain+0x466f23c>
 4674554: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4674558: a9017bfd     	stp	x29, x30, [sp, #0x10]
 467455c: 910043fd     	add	x29, sp, #0x10
 4674560: aa0003f4     	mov	x20, x0
 4674564: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4674568: 91134108     	add	x8, x8, #0x4d0
 467456c: aa0003f3     	mov	x19, x0
 4674570: f81f8e68     	str	x8, [x19, #-0x8]!
 4674574: 910fa109     	add	x9, x8, #0x3e8
 4674578: 9110410a     	add	x10, x8, #0x410
 467457c: a9002809     	stp	x9, x10, [x0]
 4674580: 91112109     	add	x9, x8, #0x448
 4674584: 9111e10a     	add	x10, x8, #0x478
 4674588: a9062809     	stp	x9, x10, [x0, #0x60]
 467458c: 91132109     	add	x9, x8, #0x4c8
 4674590: f9005409     	str	x9, [x0, #0xa8]
 4674594: 9114a109     	add	x9, x8, #0x528
 4674598: f9006809     	str	x9, [x0, #0xd0]
 467459c: 91156108     	add	x8, x8, #0x558
 46745a0: f9007808     	str	x8, [x0, #0xf0]
 46745a4: f941a000     	ldr	x0, [x0, #0x340]
 46745a8: b4000220     	cbz	x0, 0x46745ec <_ChromeMain+0x466f350>
 46745ac: f9400008     	ldr	x8, [x0]
 46745b0: f9400908     	ldr	x8, [x8, #0x10]
 46745b4: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 46745b8: 9123b129     	add	x9, x9, #0x8ec
 46745bc: eb09011f     	cmp	x8, x9
 46745c0: 54000221     	b.ne	0x4674604 <_ChromeMain+0x466f368>
 46745c4: f9401008     	ldr	x8, [x0, #0x20]
 46745c8: b4000128     	cbz	x8, 0x46745ec <_ChromeMain+0x466f350>
 46745cc: f9400c08     	ldr	x8, [x0, #0x18]
 46745d0: b8bfc108     	ldapr	w8, [x8]
 46745d4: 7100051f     	cmp	w8, #0x1
 46745d8: 540000a0     	b.eq	0x46745ec <_ChromeMain+0x466f350>
 46745dc: 910c4280     	add	x0, x20, #0x310
 46745e0: 9702e84e     	bl	0x72e718 <_ChromeMain+0x72947c>
 46745e4: aa1303e0     	mov	x0, x19
 46745e8: 96fcb2e5     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46745ec: 910c4280     	add	x0, x20, #0x310
 46745f0: 97617346     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 46745f4: aa1303e0     	mov	x0, x19
 46745f8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46745fc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674600: 1733eca3     	b	0x136f88c <_ChromeMain+0x136a5f0>
 4674604: d63f0100     	blr	x8
 4674608: 35fffea0     	cbnz	w0, 0x46745dc <_ChromeMain+0x466f340>
 467460c: 17fffff8     	b	0x46745ec <_ChromeMain+0x466f350>
 4674610: d1002000     	sub	x0, x0, #0x8
 4674614: 17fffefd     	b	0x4674208 <_ChromeMain+0x466ef6c>
 4674618: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 467461c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4674620: 910043fd     	add	x29, sp, #0x10
 4674624: aa0003f4     	mov	x20, x0
 4674628: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 467462c: 91134108     	add	x8, x8, #0x4d0
 4674630: aa0003f3     	mov	x19, x0
 4674634: f81f0e68     	str	x8, [x19, #-0x10]!
 4674638: 910fa109     	add	x9, x8, #0x3e8
 467463c: 9110410a     	add	x10, x8, #0x410
 4674640: a93fa809     	stp	x9, x10, [x0, #-0x8]
 4674644: 91112109     	add	x9, x8, #0x448
 4674648: 9111e10a     	add	x10, x8, #0x478
 467464c: a905a809     	stp	x9, x10, [x0, #0x58]
 4674650: 91132109     	add	x9, x8, #0x4c8
 4674654: f9005009     	str	x9, [x0, #0xa0]
 4674658: 9114a109     	add	x9, x8, #0x528
 467465c: f9006409     	str	x9, [x0, #0xc8]
 4674660: 91156108     	add	x8, x8, #0x558
 4674664: f9007408     	str	x8, [x0, #0xe8]
 4674668: f9419c00     	ldr	x0, [x0, #0x338]
 467466c: b4000220     	cbz	x0, 0x46746b0 <_ChromeMain+0x466f414>
 4674670: f9400008     	ldr	x8, [x0]
 4674674: f9400908     	ldr	x8, [x8, #0x10]
 4674678: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 467467c: 9123b129     	add	x9, x9, #0x8ec
 4674680: eb09011f     	cmp	x8, x9
 4674684: 54000221     	b.ne	0x46746c8 <_ChromeMain+0x466f42c>
 4674688: f9401008     	ldr	x8, [x0, #0x20]
 467468c: b4000128     	cbz	x8, 0x46746b0 <_ChromeMain+0x466f414>
 4674690: f9400c08     	ldr	x8, [x0, #0x18]
 4674694: b8bfc108     	ldapr	w8, [x8]
 4674698: 7100051f     	cmp	w8, #0x1
 467469c: 540000a0     	b.eq	0x46746b0 <_ChromeMain+0x466f414>
 46746a0: 910c2280     	add	x0, x20, #0x308
 46746a4: 9702e81d     	bl	0x72e718 <_ChromeMain+0x72947c>
 46746a8: aa1303e0     	mov	x0, x19
 46746ac: 96fcb2b4     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46746b0: 910c2280     	add	x0, x20, #0x308
 46746b4: 97617315     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 46746b8: aa1303e0     	mov	x0, x19
 46746bc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46746c0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46746c4: 1733ec72     	b	0x136f88c <_ChromeMain+0x136a5f0>
 46746c8: d63f0100     	blr	x8
 46746cc: 35fffea0     	cbnz	w0, 0x46746a0 <_ChromeMain+0x466f404>
 46746d0: 17fffff8     	b	0x46746b0 <_ChromeMain+0x466f414>
 46746d4: d1004000     	sub	x0, x0, #0x10
 46746d8: 17fffecc     	b	0x4674208 <_ChromeMain+0x466ef6c>
 46746dc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46746e0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46746e4: 910043fd     	add	x29, sp, #0x10
 46746e8: aa0003f4     	mov	x20, x0
 46746ec: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 46746f0: 91134108     	add	x8, x8, #0x4d0
 46746f4: aa0003f3     	mov	x19, x0
 46746f8: f8198e68     	str	x8, [x19, #-0x68]!
 46746fc: 910fa109     	add	x9, x8, #0x3e8
 4674700: 9110410a     	add	x10, x8, #0x410
 4674704: a93a2809     	stp	x9, x10, [x0, #-0x60]
 4674708: 91112109     	add	x9, x8, #0x448
 467470c: 9111e10a     	add	x10, x8, #0x478
 4674710: a9002809     	stp	x9, x10, [x0]
 4674714: 91132109     	add	x9, x8, #0x4c8
 4674718: f9002409     	str	x9, [x0, #0x48]
 467471c: 9114a109     	add	x9, x8, #0x528
 4674720: f9003809     	str	x9, [x0, #0x70]
 4674724: 91156108     	add	x8, x8, #0x558
 4674728: f9004808     	str	x8, [x0, #0x90]
 467472c: f9417000     	ldr	x0, [x0, #0x2e0]
 4674730: b4000220     	cbz	x0, 0x4674774 <_ChromeMain+0x466f4d8>
 4674734: f9400008     	ldr	x8, [x0]
 4674738: f9400908     	ldr	x8, [x8, #0x10]
 467473c: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674740: 9123b129     	add	x9, x9, #0x8ec
 4674744: eb09011f     	cmp	x8, x9
 4674748: 54000221     	b.ne	0x467478c <_ChromeMain+0x466f4f0>
 467474c: f9401008     	ldr	x8, [x0, #0x20]
 4674750: b4000128     	cbz	x8, 0x4674774 <_ChromeMain+0x466f4d8>
 4674754: f9400c08     	ldr	x8, [x0, #0x18]
 4674758: b8bfc108     	ldapr	w8, [x8]
 467475c: 7100051f     	cmp	w8, #0x1
 4674760: 540000a0     	b.eq	0x4674774 <_ChromeMain+0x466f4d8>
 4674764: 910ac280     	add	x0, x20, #0x2b0
 4674768: 9702e7ec     	bl	0x72e718 <_ChromeMain+0x72947c>
 467476c: aa1303e0     	mov	x0, x19
 4674770: 96fcb283     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4674774: 910ac280     	add	x0, x20, #0x2b0
 4674778: 976172e4     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 467477c: aa1303e0     	mov	x0, x19
 4674780: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674784: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674788: 1733ec41     	b	0x136f88c <_ChromeMain+0x136a5f0>
 467478c: d63f0100     	blr	x8
 4674790: 35fffea0     	cbnz	w0, 0x4674764 <_ChromeMain+0x466f4c8>
 4674794: 17fffff8     	b	0x4674774 <_ChromeMain+0x466f4d8>
 4674798: d101a000     	sub	x0, x0, #0x68
 467479c: 17fffe9b     	b	0x4674208 <_ChromeMain+0x466ef6c>
 46747a0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46747a4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46747a8: 910043fd     	add	x29, sp, #0x10
 46747ac: aa0003f4     	mov	x20, x0
 46747b0: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 46747b4: 91134108     	add	x8, x8, #0x4d0
 46747b8: aa0003f3     	mov	x19, x0
 46747bc: f8190e68     	str	x8, [x19, #-0x70]!
 46747c0: 910fa109     	add	x9, x8, #0x3e8
 46747c4: 9110410a     	add	x10, x8, #0x410
 46747c8: a939a809     	stp	x9, x10, [x0, #-0x68]
 46747cc: 91112109     	add	x9, x8, #0x448
 46747d0: 9111e10a     	add	x10, x8, #0x478
 46747d4: a93fa809     	stp	x9, x10, [x0, #-0x8]
 46747d8: 91132109     	add	x9, x8, #0x4c8
 46747dc: f9002009     	str	x9, [x0, #0x40]
 46747e0: 9114a109     	add	x9, x8, #0x528
 46747e4: f9003409     	str	x9, [x0, #0x68]
 46747e8: 91156108     	add	x8, x8, #0x558
 46747ec: f9004408     	str	x8, [x0, #0x88]
 46747f0: f9416c00     	ldr	x0, [x0, #0x2d8]
 46747f4: b4000220     	cbz	x0, 0x4674838 <_ChromeMain+0x466f59c>
 46747f8: f9400008     	ldr	x8, [x0]
 46747fc: f9400908     	ldr	x8, [x8, #0x10]
 4674800: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674804: 9123b129     	add	x9, x9, #0x8ec
 4674808: eb09011f     	cmp	x8, x9
 467480c: 54000221     	b.ne	0x4674850 <_ChromeMain+0x466f5b4>
 4674810: f9401008     	ldr	x8, [x0, #0x20]
 4674814: b4000128     	cbz	x8, 0x4674838 <_ChromeMain+0x466f59c>
 4674818: f9400c08     	ldr	x8, [x0, #0x18]
 467481c: b8bfc108     	ldapr	w8, [x8]
 4674820: 7100051f     	cmp	w8, #0x1
 4674824: 540000a0     	b.eq	0x4674838 <_ChromeMain+0x466f59c>
 4674828: 910aa280     	add	x0, x20, #0x2a8
 467482c: 9702e7bb     	bl	0x72e718 <_ChromeMain+0x72947c>
 4674830: aa1303e0     	mov	x0, x19
 4674834: 96fcb252     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4674838: 910aa280     	add	x0, x20, #0x2a8
 467483c: 976172b3     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 4674840: aa1303e0     	mov	x0, x19
 4674844: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674848: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467484c: 1733ec10     	b	0x136f88c <_ChromeMain+0x136a5f0>
 4674850: d63f0100     	blr	x8
 4674854: 35fffea0     	cbnz	w0, 0x4674828 <_ChromeMain+0x466f58c>
 4674858: 17fffff8     	b	0x4674838 <_ChromeMain+0x466f59c>
 467485c: d101c000     	sub	x0, x0, #0x70
 4674860: 17fffe6a     	b	0x4674208 <_ChromeMain+0x466ef6c>
 4674864: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4674868: a9017bfd     	stp	x29, x30, [sp, #0x10]
 467486c: 910043fd     	add	x29, sp, #0x10
 4674870: aa0003f4     	mov	x20, x0
 4674874: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4674878: 91134108     	add	x8, x8, #0x4d0
 467487c: aa0003f3     	mov	x19, x0
 4674880: f8150e68     	str	x8, [x19, #-0xb0]!
 4674884: 910fa109     	add	x9, x8, #0x3e8
 4674888: 9110410a     	add	x10, x8, #0x410
 467488c: a935a809     	stp	x9, x10, [x0, #-0xa8]
 4674890: 91112109     	add	x9, x8, #0x448
 4674894: 9111e10a     	add	x10, x8, #0x478
 4674898: a93ba809     	stp	x9, x10, [x0, #-0x48]
 467489c: 91132109     	add	x9, x8, #0x4c8
 46748a0: f9000009     	str	x9, [x0]
 46748a4: 9114a109     	add	x9, x8, #0x528
 46748a8: f9001409     	str	x9, [x0, #0x28]
 46748ac: 91156108     	add	x8, x8, #0x558
 46748b0: f9002408     	str	x8, [x0, #0x48]
 46748b4: f9414c00     	ldr	x0, [x0, #0x298]
 46748b8: b4000220     	cbz	x0, 0x46748fc <_ChromeMain+0x466f660>
 46748bc: f9400008     	ldr	x8, [x0]
 46748c0: f9400908     	ldr	x8, [x8, #0x10]
 46748c4: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 46748c8: 9123b129     	add	x9, x9, #0x8ec
 46748cc: eb09011f     	cmp	x8, x9
 46748d0: 54000221     	b.ne	0x4674914 <_ChromeMain+0x466f678>
 46748d4: f9401008     	ldr	x8, [x0, #0x20]
 46748d8: b4000128     	cbz	x8, 0x46748fc <_ChromeMain+0x466f660>
 46748dc: f9400c08     	ldr	x8, [x0, #0x18]
 46748e0: b8bfc108     	ldapr	w8, [x8]
 46748e4: 7100051f     	cmp	w8, #0x1
 46748e8: 540000a0     	b.eq	0x46748fc <_ChromeMain+0x466f660>
 46748ec: 9109a280     	add	x0, x20, #0x268
 46748f0: 9702e78a     	bl	0x72e718 <_ChromeMain+0x72947c>
 46748f4: aa1303e0     	mov	x0, x19
 46748f8: 96fcb221     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46748fc: 9109a280     	add	x0, x20, #0x268
 4674900: 97617282     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 4674904: aa1303e0     	mov	x0, x19
 4674908: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467490c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674910: 1733ebdf     	b	0x136f88c <_ChromeMain+0x136a5f0>
 4674914: d63f0100     	blr	x8
 4674918: 35fffea0     	cbnz	w0, 0x46748ec <_ChromeMain+0x466f650>
 467491c: 17fffff8     	b	0x46748fc <_ChromeMain+0x466f660>
 4674920: d102c000     	sub	x0, x0, #0xb0
 4674924: 17fffe39     	b	0x4674208 <_ChromeMain+0x466ef6c>
 4674928: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 467492c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4674930: 910043fd     	add	x29, sp, #0x10
 4674934: aa0003f4     	mov	x20, x0
 4674938: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 467493c: 91134108     	add	x8, x8, #0x4d0
 4674940: aa0003f3     	mov	x19, x0
 4674944: f8128e68     	str	x8, [x19, #-0xd8]!
 4674948: 910fa109     	add	x9, x8, #0x3e8
 467494c: 9110410a     	add	x10, x8, #0x410
 4674950: a9332809     	stp	x9, x10, [x0, #-0xd0]
 4674954: 91112109     	add	x9, x8, #0x448
 4674958: 9111e10a     	add	x10, x8, #0x478
 467495c: a9392809     	stp	x9, x10, [x0, #-0x70]
 4674960: 91132109     	add	x9, x8, #0x4c8
 4674964: f81d8009     	stur	x9, [x0, #-0x28]
 4674968: 9114a109     	add	x9, x8, #0x528
 467496c: f9000009     	str	x9, [x0]
 4674970: 91156108     	add	x8, x8, #0x558
 4674974: f9001008     	str	x8, [x0, #0x20]
 4674978: f9413800     	ldr	x0, [x0, #0x270]
 467497c: b4000220     	cbz	x0, 0x46749c0 <_ChromeMain+0x466f724>
 4674980: f9400008     	ldr	x8, [x0]
 4674984: f9400908     	ldr	x8, [x8, #0x10]
 4674988: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 467498c: 9123b129     	add	x9, x9, #0x8ec
 4674990: eb09011f     	cmp	x8, x9
 4674994: 54000221     	b.ne	0x46749d8 <_ChromeMain+0x466f73c>
 4674998: f9401008     	ldr	x8, [x0, #0x20]
 467499c: b4000128     	cbz	x8, 0x46749c0 <_ChromeMain+0x466f724>
 46749a0: f9400c08     	ldr	x8, [x0, #0x18]
 46749a4: b8bfc108     	ldapr	w8, [x8]
 46749a8: 7100051f     	cmp	w8, #0x1
 46749ac: 540000a0     	b.eq	0x46749c0 <_ChromeMain+0x466f724>
 46749b0: 91090280     	add	x0, x20, #0x240
 46749b4: 9702e759     	bl	0x72e718 <_ChromeMain+0x72947c>
 46749b8: aa1303e0     	mov	x0, x19
 46749bc: 96fcb1f0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46749c0: 91090280     	add	x0, x20, #0x240
 46749c4: 97617251     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 46749c8: aa1303e0     	mov	x0, x19
 46749cc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46749d0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46749d4: 1733ebae     	b	0x136f88c <_ChromeMain+0x136a5f0>
 46749d8: d63f0100     	blr	x8
 46749dc: 35fffea0     	cbnz	w0, 0x46749b0 <_ChromeMain+0x466f714>
 46749e0: 17fffff8     	b	0x46749c0 <_ChromeMain+0x466f724>
 46749e4: d1036000     	sub	x0, x0, #0xd8
 46749e8: 17fffe08     	b	0x4674208 <_ChromeMain+0x466ef6c>
 46749ec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46749f0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46749f4: 910043fd     	add	x29, sp, #0x10
 46749f8: aa0003f4     	mov	x20, x0
 46749fc: f00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4674a00: 91134108     	add	x8, x8, #0x4d0
 4674a04: aa0003f3     	mov	x19, x0
 4674a08: f8108e68     	str	x8, [x19, #-0xf8]!
 4674a0c: 910fa109     	add	x9, x8, #0x3e8
 4674a10: 9110410a     	add	x10, x8, #0x410
 4674a14: a9312809     	stp	x9, x10, [x0, #-0xf0]
 4674a18: 91112109     	add	x9, x8, #0x448
 4674a1c: 9111e10a     	add	x10, x8, #0x478
 4674a20: a9372809     	stp	x9, x10, [x0, #-0x90]
 4674a24: 91132109     	add	x9, x8, #0x4c8
 4674a28: f81b8009     	stur	x9, [x0, #-0x48]
 4674a2c: 9114a109     	add	x9, x8, #0x528
 4674a30: f81e0009     	stur	x9, [x0, #-0x20]
 4674a34: 91156108     	add	x8, x8, #0x558
 4674a38: f9000008     	str	x8, [x0]
 4674a3c: f9412800     	ldr	x0, [x0, #0x250]
 4674a40: b4000220     	cbz	x0, 0x4674a84 <_ChromeMain+0x466f7e8>
 4674a44: f9400008     	ldr	x8, [x0]
 4674a48: f9400908     	ldr	x8, [x8, #0x10]
 4674a4c: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674a50: 9123b129     	add	x9, x9, #0x8ec
 4674a54: eb09011f     	cmp	x8, x9
 4674a58: 54000221     	b.ne	0x4674a9c <_ChromeMain+0x466f800>
 4674a5c: f9401008     	ldr	x8, [x0, #0x20]
 4674a60: b4000128     	cbz	x8, 0x4674a84 <_ChromeMain+0x466f7e8>
 4674a64: f9400c08     	ldr	x8, [x0, #0x18]
 4674a68: b8bfc108     	ldapr	w8, [x8]
 4674a6c: 7100051f     	cmp	w8, #0x1
 4674a70: 540000a0     	b.eq	0x4674a84 <_ChromeMain+0x466f7e8>
 4674a74: 91088280     	add	x0, x20, #0x220
 4674a78: 9702e728     	bl	0x72e718 <_ChromeMain+0x72947c>
 4674a7c: aa1303e0     	mov	x0, x19
 4674a80: 96fcb1bf     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4674a84: 91088280     	add	x0, x20, #0x220
 4674a88: 97617220     	bl	0x1ed1308 <_ChromeMain+0x1ecc06c>
 4674a8c: aa1303e0     	mov	x0, x19
 4674a90: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674a94: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674a98: 1733eb7d     	b	0x136f88c <_ChromeMain+0x136a5f0>
 4674a9c: d63f0100     	blr	x8
 4674aa0: 35fffea0     	cbnz	w0, 0x4674a74 <_ChromeMain+0x466f7d8>
 4674aa4: 17fffff8     	b	0x4674a84 <_ChromeMain+0x466f7e8>
 4674aa8: d103e000     	sub	x0, x0, #0xf8
 4674aac: 17fffdd7     	b	0x4674208 <_ChromeMain+0x466ef6c>
 4674ab0: 17fffe0c     	b	0x46742e0 <_ChromeMain+0x466f044>
		...
 4674ac0: d10103ff     	sub	sp, sp, #0x40
 4674ac4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4674ac8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4674acc: 9100c3fd     	add	x29, sp, #0x30
 4674ad0: aa0003f3     	mov	x19, x0
 4674ad4: f9400008     	ldr	x8, [x0]
 4674ad8: f9403508     	ldr	x8, [x8, #0x68]
 4674adc: d63f0100     	blr	x8
 4674ae0: b40000c0     	cbz	x0, 0x4674af8 <_ChromeMain+0x466f85c>
 4674ae4: f9400268     	ldr	x8, [x19]
 4674ae8: f9405508     	ldr	x8, [x8, #0xa8]
 4674aec: aa1303e0     	mov	x0, x19
 4674af0: d63f0100     	blr	x8
 4674af4: 35000380     	cbnz	w0, 0x4674b64 <_ChromeMain+0x466f8c8>
 4674af8: f941a660     	ldr	x0, [x19, #0x348]
 4674afc: b4000b20     	cbz	x0, 0x4674c60 <_ChromeMain+0x466f9c4>
 4674b00: f9400008     	ldr	x8, [x0]
 4674b04: f9400908     	ldr	x8, [x8, #0x10]
 4674b08: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674b0c: 9123b129     	add	x9, x9, #0x8ec
 4674b10: eb09011f     	cmp	x8, x9
 4674b14: 540001c1     	b.ne	0x4674b4c <_ChromeMain+0x466f8b0>
 4674b18: f9401008     	ldr	x8, [x0, #0x20]
 4674b1c: b4000a28     	cbz	x8, 0x4674c60 <_ChromeMain+0x466f9c4>
 4674b20: f9400c08     	ldr	x8, [x0, #0x18]
 4674b24: b8bfc108     	ldapr	w8, [x8]
 4674b28: 7100051f     	cmp	w8, #0x1
 4674b2c: 540009a0     	b.eq	0x4674c60 <_ChromeMain+0x466f9c4>
 4674b30: 910c6260     	add	x0, x19, #0x318
 4674b34: 9702e6f9     	bl	0x72e718 <_ChromeMain+0x72947c>
 4674b38: aa1303e0     	mov	x0, x19
 4674b3c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4674b40: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4674b44: 910103ff     	add	sp, sp, #0x40
 4674b48: 16fcb18d     	b	0x5a117c <_ChromeMain+0x59bee0>
 4674b4c: d63f0100     	blr	x8
 4674b50: 34000880     	cbz	w0, 0x4674c60 <_ChromeMain+0x466f9c4>
 4674b54: 17fffff7     	b	0x4674b30 <_ChromeMain+0x466f894>
 4674b58: d63f0100     	blr	x8
 4674b5c: 37000820     	tbnz	w0, #0x0, 0x4674c60 <_ChromeMain+0x466f9c4>
 4674b60: 1400000f     	b	0x4674b9c <_ChromeMain+0x466f900>
 4674b64: f941a660     	ldr	x0, [x19, #0x348]
 4674b68: b40001a0     	cbz	x0, 0x4674b9c <_ChromeMain+0x466f900>
 4674b6c: f9400008     	ldr	x8, [x0]
 4674b70: f9400908     	ldr	x8, [x8, #0x10]
 4674b74: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674b78: 9123b129     	add	x9, x9, #0x8ec
 4674b7c: eb09011f     	cmp	x8, x9
 4674b80: 54fffec1     	b.ne	0x4674b58 <_ChromeMain+0x466f8bc>
 4674b84: f9401008     	ldr	x8, [x0, #0x20]
 4674b88: b40000a8     	cbz	x8, 0x4674b9c <_ChromeMain+0x466f900>
 4674b8c: f9400c08     	ldr	x8, [x0, #0x18]
 4674b90: b8bfc108     	ldapr	w8, [x8]
 4674b94: 7100051f     	cmp	w8, #0x1
 4674b98: 54000641     	b.ne	0x4674c60 <_ChromeMain+0x466f9c4>
 4674b9c: b00529e8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4674ba0: f9468d08     	ldr	x8, [x8, #0xd18]
 4674ba4: d63f0100     	blr	x8
 4674ba8: f9018a60     	str	x0, [x19, #0x310]
 4674bac: 9004c2c0     	adrp	x0, 0xdecc000 <dyld_stub_binder+0xdecc000>
 4674bb0: 9105c400     	add	x0, x0, #0x171
 4674bb4: f004c2a1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4674bb8: 912c7821     	add	x1, x1, #0xb1e
 4674bbc: 910003e8     	mov	x8, sp
 4674bc0: 5281a9e2     	mov	w2, #0xd4f              ; =3407
 4674bc4: 96e7702f     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4674bc8: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4674bcc: d00529e9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4674bd0: f9404529     	ldr	x9, [x9, #0x88]
 4674bd4: eb09011f     	cmp	x8, x9
 4674bd8: 54000061     	b.ne	0x4674be4 <_ChromeMain+0x466f948>
 4674bdc: aa1303e0     	mov	x0, x19
 4674be0: 96e67dc7     	bl	0x142fc <_ChromeMain+0xf060>
 4674be4: 52800700     	mov	w0, #0x38               ; =56
 4674be8: 96e669e0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4674bec: 52800028     	mov	w8, #0x1                ; =1
 4674bf0: b9000008     	str	w8, [x0]
 4674bf4: b0ffc628     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 4674bf8: 913a0108     	add	x8, x8, #0xe80
 4674bfc: b0ff9129     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4674c00: 912d0129     	add	x9, x9, #0xb40
 4674c04: a900a408     	stp	x8, x9, [x0, #0x8]
 4674c08: b0fef748     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4674c0c: 912c0108     	add	x8, x8, #0xb00
 4674c10: 100006e9     	adr	x9, 0x4674cec <_ChromeMain+0x466fa50>
 4674c14: d503201f     	nop
 4674c18: a901a408     	stp	x8, x9, [x0, #0x18]
 4674c1c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4674c20: f941ba74     	ldr	x20, [x19, #0x370]
 4674c24: f901ba60     	str	x0, [x19, #0x370]
 4674c28: b5000254     	cbnz	x20, 0x4674c70 <_ChromeMain+0x466f9d4>
 4674c2c: 910ca268     	add	x8, x19, #0x328
 4674c30: b94013e9     	ldr	w9, [sp, #0x10]
 4674c34: b9033a69     	str	w9, [x19, #0x338]
 4674c38: 3dc003e0     	ldr	q0, [sp]
 4674c3c: 3d800100     	str	q0, [x8]
 4674c40: f9400fe8     	ldr	x8, [sp, #0x18]
 4674c44: f901a268     	str	x8, [x19, #0x340]
 4674c48: 52901d08     	mov	w8, #0x80e8             ; =33000
 4674c4c: f901ae68     	str	x8, [x19, #0x358]
 4674c50: 910c6260     	add	x0, x19, #0x318
 4674c54: 970b6a16     	bl	0x94f4ac <_ChromeMain+0x94a210>
 4674c58: aa1303e0     	mov	x0, x19
 4674c5c: 96fcb148     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4674c60: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4674c64: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4674c68: 910103ff     	add	sp, sp, #0x40
 4674c6c: d65f03c0     	ret
 4674c70: 12800008     	mov	w8, #-0x1               ; =-1
 4674c74: b8e80288     	ldaddal	w8, w8, [x20]
 4674c78: 7100051f     	cmp	w8, #0x1
 4674c7c: 54fffd81     	b.ne	0x4674c2c <_ChromeMain+0x466f990>
 4674c80: f9400a88     	ldr	x8, [x20, #0x10]
 4674c84: b0fe4989     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4674c88: 91190129     	add	x9, x9, #0x640
 4674c8c: eb09011f     	cmp	x8, x9
 4674c90: 54000140     	b.eq	0x4674cb8 <_ChromeMain+0x466fa1c>
 4674c94: 90ff97c9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 4674c98: 91180129     	add	x9, x9, #0x600
 4674c9c: aa1403e0     	mov	x0, x20
 4674ca0: eb09011f     	cmp	x8, x9
 4674ca4: 54000060     	b.eq	0x4674cb0 <_ChromeMain+0x466fa14>
 4674ca8: d63f0100     	blr	x8
 4674cac: 17ffffe0     	b	0x4674c2c <_ChromeMain+0x466f990>
 4674cb0: 52800701     	mov	w1, #0x38               ; =56
 4674cb4: 14000005     	b	0x4674cc8 <_ChromeMain+0x466fa2c>
 4674cb8: f9401a80     	ldr	x0, [x20, #0x30]
 4674cbc: b50000a0     	cbnz	x0, 0x4674cd0 <_ChromeMain+0x466fa34>
 4674cc0: aa1403e0     	mov	x0, x20
 4674cc4: 52800901     	mov	w1, #0x48               ; =72
 4674cc8: 96e6507c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4674ccc: 17ffffd8     	b	0x4674c2c <_ChromeMain+0x466f990>
 4674cd0: 12800008     	mov	w8, #-0x1               ; =-1
 4674cd4: b8e80008     	ldaddal	w8, w8, [x0]
 4674cd8: 7100051f     	cmp	w8, #0x1
 4674cdc: 54ffff21     	b.ne	0x4674cc0 <_ChromeMain+0x466fa24>
 4674ce0: 52800101     	mov	w1, #0x8                ; =8
 4674ce4: 96e65075     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4674ce8: 17fffff6     	b	0x4674cc0 <_ChromeMain+0x466fa24>
 4674cec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4674cf0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4674cf4: 910043fd     	add	x29, sp, #0x10
 4674cf8: aa0003f3     	mov	x19, x0
 4674cfc: f9400008     	ldr	x8, [x0]
 4674d00: f9405508     	ldr	x8, [x8, #0xa8]
 4674d04: d63f0100     	blr	x8
 4674d08: 37000220     	tbnz	w0, #0x0, 0x4674d4c <_ChromeMain+0x466fab0>
 4674d0c: f941a660     	ldr	x0, [x19, #0x348]
 4674d10: b40002a0     	cbz	x0, 0x4674d64 <_ChromeMain+0x466fac8>
 4674d14: f9400008     	ldr	x8, [x0]
 4674d18: f9400908     	ldr	x8, [x8, #0x10]
 4674d1c: 90ffe2a9     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 4674d20: 9123b129     	add	x9, x9, #0x8ec
 4674d24: eb09011f     	cmp	x8, x9
 4674d28: 540001a1     	b.ne	0x4674d5c <_ChromeMain+0x466fac0>
 4674d2c: f9401008     	ldr	x8, [x0, #0x20]
 4674d30: b40001a8     	cbz	x8, 0x4674d64 <_ChromeMain+0x466fac8>
 4674d34: f9400c08     	ldr	x8, [x0, #0x18]
 4674d38: b8bfc108     	ldapr	w8, [x8]
 4674d3c: 7100051f     	cmp	w8, #0x1
 4674d40: 54000120     	b.eq	0x4674d64 <_ChromeMain+0x466fac8>
 4674d44: 910c6260     	add	x0, x19, #0x318
 4674d48: 9702e674     	bl	0x72e718 <_ChromeMain+0x72947c>
 4674d4c: aa1303e0     	mov	x0, x19
 4674d50: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674d54: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674d58: 16fcb109     	b	0x5a117c <_ChromeMain+0x59bee0>
 4674d5c: d63f0100     	blr	x8
 4674d60: 35ffff20     	cbnz	w0, 0x4674d44 <_ChromeMain+0x466faa8>
 4674d64: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4674d68: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4674d6c: d65f03c0     	ret
 4674d70: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4674d74: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4674d78: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4674d7c: 910083fd     	add	x29, sp, #0x20
 4674d80: f0054335     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4674d84: f9445ab3     	ldr	x19, [x21, #0x8b0]
 4674d88: b5000473     	cbnz	x19, 0x4674e14 <_ChromeMain+0x466fb78>
 4674d8c: 52800d00     	mov	w0, #0x68               ; =104
 4674d90: 96e66976     	bl	0xf368 <_ChromeMain+0xa0cc>
 4674d94: aa0003f3     	mov	x19, x0
 4674d98: f004c2a1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4674d9c: 912c7821     	add	x1, x1, #0xb1e
 4674da0: 528008a2     	mov	w2, #0x45               ; =69
 4674da4: 5281a023     	mov	w3, #0xd01              ; =3329
 4674da8: 96fac9f4     	bl	0x527578 <_ChromeMain+0x5222dc>
 4674dac: b004f4a8     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 4674db0: 91050108     	add	x8, x8, #0x140
 4674db4: 9004c2c9     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 4674db8: 91060129     	add	x9, x9, #0x180
 4674dbc: a9002408     	stp	x8, x9, [x0]
 4674dc0: 528002c8     	mov	w8, #0x16               ; =22
 4674dc4: f9000808     	str	x8, [x0, #0x10]
 4674dc8: f00549d6     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 4674dcc: f94062d4     	ldr	x20, [x22, #0xc0]
 4674dd0: b40002d4     	cbz	x20, 0x4674e28 <_ChromeMain+0x466fb8c>
 4674dd4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4674dd8: d00529f6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4674ddc: f94046c9     	ldr	x9, [x22, #0x88]
 4674de0: eb09011f     	cmp	x8, x9
 4674de4: 54000061     	b.ne	0x4674df0 <_ChromeMain+0x466fb54>
 4674de8: aa1403e0     	mov	x0, x20
 4674dec: 96e67d44     	bl	0x142fc <_ChromeMain+0xf060>
 4674df0: f9402660     	ldr	x0, [x19, #0x48]
 4674df4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4674df8: f94046c9     	ldr	x9, [x22, #0x88]
 4674dfc: eb09011f     	cmp	x8, x9
 4674e00: 54000340     	b.eq	0x4674e68 <_ChromeMain+0x466fbcc>
 4674e04: f9002674     	str	x20, [x19, #0x48]
 4674e08: aa1303e0     	mov	x0, x19
 4674e0c: 9744c676     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4674e10: f9045ab3     	str	x19, [x21, #0x8b0]
 4674e14: aa1303e0     	mov	x0, x19
 4674e18: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4674e1c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4674e20: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4674e24: d65f03c0     	ret
 4674e28: 52800d00     	mov	w0, #0x68               ; =104
 4674e2c: 96e6694f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4674e30: aa0003f4     	mov	x20, x0
 4674e34: b004b681     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4674e38: 91242c21     	add	x1, x1, #0x90b
 4674e3c: 528002a2     	mov	w2, #0x15               ; =21
 4674e40: 528029e3     	mov	w3, #0x14f              ; =335
 4674e44: 96fac9cd     	bl	0x527578 <_ChromeMain+0x5222dc>
 4674e48: 9004e708     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4674e4c: 9120e108     	add	x8, x8, #0x838
 4674e50: f9000008     	str	x8, [x0]
 4674e54: 977402f1     	bl	0x2375a18 <_ChromeMain+0x237077c>
 4674e58: aa1403e0     	mov	x0, x20
 4674e5c: 9744c662     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4674e60: f90062d4     	str	x20, [x22, #0xc0]
 4674e64: 17ffffdc     	b	0x4674dd4 <_ChromeMain+0x466fb38>
 4674e68: 96e6b6f5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4674e6c: 17ffffe6     	b	0x4674e04 <_ChromeMain+0x466fb68>
 4674e70: d10203ff     	sub	sp, sp, #0x80
 4674e74: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4674e78: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4674e7c: 9101c3fd     	add	x29, sp, #0x70
 4674e80: aa0103f3     	mov	x19, x1
 4674e84: aa0003f4     	mov	x20, x0
 4674e88: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4674e8c: 6f00e400     	movi.2d	v0, #0000000000000000
 4674e90: 3c8283e0     	stur	q0, [sp, #0x28]
 4674e94: 3c8383e0     	stur	q0, [sp, #0x38]
 4674e98: f90027ff     	str	xzr, [sp, #0x48]
 4674e9c: d2806029     	mov	x9, #0x301              ; =769
 4674ea0: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4674ea4: a901a7e8     	stp	x8, x9, [sp, #0x18]
 4674ea8: 96fcb052     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4674eac: b9431281     	ldr	w1, [x20, #0x310]
 4674eb0: 9722ccc6     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4674eb4: 971d67ad     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4674eb8: 2d0107e0     	stp	s0, s1, [sp, #0x8]
 4674ebc: 2d020fe2     	stp	s2, s3, [sp, #0x10]
 4674ec0: f9406260     	ldr	x0, [x19, #0xc0]
 4674ec4: fd40e280     	ldr	d0, [x20, #0x1c0]
 4674ec8: 6e180400     	mov.d	v0[1], v0[0]
 4674ecc: 4f3fe400     	scvtf.4s	v0, v0, #0x1
 4674ed0: d004c668     	adrp	x8, 0xdf42000 <dyld_stub_binder+0xdf42000>
 4674ed4: 3dc26101     	ldr	q1, [x8, #0x980]
 4674ed8: 4e21d400     	fadd.4s	v0, v0, v1
 4674edc: 3c9e03a0     	stur	q0, [x29, #-0x20]
 4674ee0: f9400008     	ldr	x8, [x0]
 4674ee4: f9407908     	ldr	x8, [x8, #0xf0]
 4674ee8: d10083a1     	sub	x1, x29, #0x20
 4674eec: 910023e2     	add	x2, sp, #0x8
 4674ef0: d63f0100     	blr	x8
 4674ef4: f94027e0     	ldr	x0, [sp, #0x48]
 4674ef8: b5000480     	cbnz	x0, 0x4674f88 <_ChromeMain+0x466fcec>
 4674efc: f94023e0     	ldr	x0, [sp, #0x40]
 4674f00: b5000320     	cbnz	x0, 0x4674f64 <_ChromeMain+0x466fcc8>
 4674f04: f9401fe0     	ldr	x0, [sp, #0x38]
 4674f08: b5000640     	cbnz	x0, 0x4674fd0 <_ChromeMain+0x466fd34>
 4674f0c: f9401be0     	ldr	x0, [sp, #0x30]
 4674f10: b50000e0     	cbnz	x0, 0x4674f2c <_ChromeMain+0x466fc90>
 4674f14: f94017e0     	ldr	x0, [sp, #0x28]
 4674f18: b50004a0     	cbnz	x0, 0x4674fac <_ChromeMain+0x466fd10>
 4674f1c: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4674f20: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4674f24: 910203ff     	add	sp, sp, #0x80
 4674f28: d65f03c0     	ret
 4674f2c: 91002008     	add	x8, x0, #0x8
 4674f30: 12800009     	mov	w9, #-0x1               ; =-1
 4674f34: b8e90108     	ldaddal	w9, w8, [x8]
 4674f38: 7100051f     	cmp	w8, #0x1
 4674f3c: 54fffec1     	b.ne	0x4674f14 <_ChromeMain+0x466fc78>
 4674f40: f9400009     	ldr	x9, [x0]
 4674f44: f9400928     	ldr	x8, [x9, #0x10]
 4674f48: b0fdcd8a     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4674f4c: 9106014a     	add	x10, x10, #0x180
 4674f50: eb0a011f     	cmp	x8, x10
 4674f54: 54000041     	b.ne	0x4674f5c <_ChromeMain+0x466fcc0>
 4674f58: f9400528     	ldr	x8, [x9, #0x8]
 4674f5c: d63f0100     	blr	x8
 4674f60: 17ffffed     	b	0x4674f14 <_ChromeMain+0x466fc78>
 4674f64: 91002008     	add	x8, x0, #0x8
 4674f68: 12800009     	mov	w9, #-0x1               ; =-1
 4674f6c: b8e90108     	ldaddal	w9, w8, [x8]
 4674f70: 7100051f     	cmp	w8, #0x1
 4674f74: 54fffc81     	b.ne	0x4674f04 <_ChromeMain+0x466fc68>
 4674f78: f9400008     	ldr	x8, [x0]
 4674f7c: f9400908     	ldr	x8, [x8, #0x10]
 4674f80: d63f0100     	blr	x8
 4674f84: 17ffffe0     	b	0x4674f04 <_ChromeMain+0x466fc68>
 4674f88: 91002008     	add	x8, x0, #0x8
 4674f8c: 12800009     	mov	w9, #-0x1               ; =-1
 4674f90: b8e90108     	ldaddal	w9, w8, [x8]
 4674f94: 7100051f     	cmp	w8, #0x1
 4674f98: 54fffb21     	b.ne	0x4674efc <_ChromeMain+0x466fc60>
 4674f9c: f9400008     	ldr	x8, [x0]
 4674fa0: f9400908     	ldr	x8, [x8, #0x10]
 4674fa4: d63f0100     	blr	x8
 4674fa8: 17ffffd5     	b	0x4674efc <_ChromeMain+0x466fc60>
 4674fac: 91002008     	add	x8, x0, #0x8
 4674fb0: 12800009     	mov	w9, #-0x1               ; =-1
 4674fb4: b8e90108     	ldaddal	w9, w8, [x8]
 4674fb8: 7100051f     	cmp	w8, #0x1
 4674fbc: 54fffb01     	b.ne	0x4674f1c <_ChromeMain+0x466fc80>
 4674fc0: f9400008     	ldr	x8, [x0]
 4674fc4: f9400908     	ldr	x8, [x8, #0x10]
 4674fc8: d63f0100     	blr	x8
 4674fcc: 17ffffd4     	b	0x4674f1c <_ChromeMain+0x466fc80>
 4674fd0: 91002008     	add	x8, x0, #0x8
 4674fd4: 12800009     	mov	w9, #-0x1               ; =-1
 4674fd8: b8e90108     	ldaddal	w9, w8, [x8]
 4674fdc: 7100051f     	cmp	w8, #0x1
 4674fe0: 54fff961     	b.ne	0x4674f0c <_ChromeMain+0x466fc70>
 4674fe4: f9400008     	ldr	x8, [x0]
 4674fe8: f9400908     	ldr	x8, [x8, #0x10]
 4674fec: d63f0100     	blr	x8
 4674ff0: 17ffffc7     	b	0x4674f0c <_ChromeMain+0x466fc70>
 4674ff4: 00000000     	udf	#0x0
 4674ff8: 17ffff5e     	b	0x4674d70 <_ChromeMain+0x466fad4>
 4674ffc: 00000000     	udf	#0x0
 4675000: d10103ff     	sub	sp, sp, #0x40
 4675004: a90157f6     	stp	x22, x21, [sp, #0x10]
 4675008: a9024ff4     	stp	x20, x19, [sp, #0x20]
 467500c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4675010: 9100c3fd     	add	x29, sp, #0x30
 4675014: aa0003f3     	mov	x19, x0
 4675018: 39805c28     	ldrsb	x8, [x1, #0x17]
 467501c: a9402829     	ldp	x9, x10, [x1]
 4675020: f100011f     	cmp	x8, #0x0
 4675024: 9a814121     	csel	x1, x9, x1, mi
 4675028: 7100011f     	cmp	w8, #0x0
 467502c: 9a884142     	csel	x2, x10, x8, mi
 4675030: 528000a3     	mov	w3, #0x5                ; =5
 4675034: 52820004     	mov	w4, #0x1000             ; =4096
 4675038: 52800005     	mov	w5, #0x0                ; =0
 467503c: 97545629     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4675040: d00505a8     	adrp	x8, 0xe72b000 <dyld_stub_binder+0xe72b000>
 4675044: 913f4108     	add	x8, x8, #0xfd0
 4675048: 9112a109     	add	x9, x8, #0x4a8
 467504c: a9002408     	stp	x8, x9, [x0]
 4675050: 91134109     	add	x9, x8, #0x4d0
 4675054: f9000809     	str	x9, [x0, #0x10]
 4675058: 91142109     	add	x9, x8, #0x508
 467505c: 9114e10a     	add	x10, x8, #0x538
 4675060: a906a809     	stp	x9, x10, [x0, #0x68]
 4675064: 91162109     	add	x9, x8, #0x588
 4675068: f9005809     	str	x9, [x0, #0xb0]
 467506c: 9117a109     	add	x9, x8, #0x5e8
 4675070: f9006c09     	str	x9, [x0, #0xd8]
 4675074: 91186109     	add	x9, x8, #0x618
 4675078: aa0003f4     	mov	x20, x0
 467507c: f80f8e89     	str	x9, [x20, #0xf8]!
 4675080: 91190109     	add	x9, x8, #0x640
 4675084: f9018809     	str	x9, [x0, #0x310]
 4675088: 9119a109     	add	x9, x8, #0x668
 467508c: f9019809     	str	x9, [x0, #0x330]
 4675090: 911a6109     	add	x9, x8, #0x698
 4675094: f9019c09     	str	x9, [x0, #0x338]
 4675098: 911c6108     	add	x8, x8, #0x718
 467509c: f901a008     	str	x8, [x0, #0x340]
 46750a0: 3946a408     	ldrb	w8, [x0, #0x1a9]
 46750a4: 340000a8     	cbz	w8, 0x46750b8 <_ChromeMain+0x466fe1c>
 46750a8: 3906a67f     	strb	wzr, [x19, #0x1a9]
 46750ac: 9106a661     	add	x1, x19, #0x1a9
 46750b0: aa1403e0     	mov	x0, x20
 46750b4: 9722cbc7     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46750b8: 394eda68     	ldrb	w8, [x19, #0x3b6]
 46750bc: 35000ac8     	cbnz	w8, 0x4675214 <_ChromeMain+0x466ff78>
 46750c0: aa1303e0     	mov	x0, x19
 46750c4: 52800001     	mov	w1, #0x0                ; =0
 46750c8: 978328aa     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 46750cc: 528022c8     	mov	w8, #0x116              ; =278
 46750d0: b9000be8     	str	w8, [sp, #0x8]
 46750d4: 390033ff     	strb	wzr, [sp, #0xc]
 46750d8: f9400268     	ldr	x8, [x19]
 46750dc: f941f508     	ldr	x8, [x8, #0x3e8]
 46750e0: 910023e1     	add	x1, sp, #0x8
 46750e4: aa1303e0     	mov	x0, x19
 46750e8: d63f0100     	blr	x8
 46750ec: aa1303e0     	mov	x0, x19
 46750f0: 52800021     	mov	w1, #0x1                ; =1
 46750f4: 97545303     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 46750f8: f941ae69     	ldr	x9, [x19, #0x358]
 46750fc: f9402534     	ldr	x20, [x9, #0x48]
 4675100: b9404688     	ldr	w8, [x20, #0x44]
 4675104: 3100051f     	cmn	w8, #0x1
 4675108: 54000a60     	b.eq	0x4675254 <_ChromeMain+0x466ffb8>
 467510c: 52800189     	mov	w9, #0xc                ; =12
 4675110: 4b080121     	sub	w1, w9, w8
 4675114: aa1403e0     	mov	x0, x20
 4675118: 52800002     	mov	w2, #0x0                ; =0
 467511c: 52803e83     	mov	w3, #0x1f4              ; =500
 4675120: 9758c958     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4675124: f90003e0     	str	x0, [sp]
 4675128: b40000a0     	cbz	x0, 0x467513c <_ChromeMain+0x466fea0>
 467512c: b9400008     	ldr	w8, [x0]
 4675130: 31000508     	adds	w8, w8, #0x1
 4675134: b9000008     	str	w8, [x0]
 4675138: 54000822     	b.hs	0x467523c <_ChromeMain+0x466ffa0>
 467513c: f9400268     	ldr	x8, [x19]
 4675140: f941ed08     	ldr	x8, [x8, #0x3d8]
 4675144: 910003e1     	mov	x1, sp
 4675148: aa1303e0     	mov	x0, x19
 467514c: d63f0100     	blr	x8
 4675150: f94003e0     	ldr	x0, [sp]
 4675154: b40000c0     	cbz	x0, 0x467516c <_ChromeMain+0x466fed0>
 4675158: b9400009     	ldr	w9, [x0]
 467515c: 51000528     	sub	w8, w9, #0x1
 4675160: b9000008     	str	w8, [x0]
 4675164: 34000729     	cbz	w9, 0x4675248 <_ChromeMain+0x466ffac>
 4675168: 340004e8     	cbz	w8, 0x4675204 <_ChromeMain+0x466ff68>
 467516c: aa1303e0     	mov	x0, x19
 4675170: 528001c1     	mov	w1, #0xe                ; =14
 4675174: 95804a8b     	bl	0xa687ba0 <_ChromeMain+0xa682904>
 4675178: 528022a8     	mov	w8, #0x115              ; =277
 467517c: b90003e8     	str	w8, [sp]
 4675180: 390013ff     	strb	wzr, [sp, #0x4]
 4675184: f004c6c8     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 4675188: bd4c0d00     	ldr	s0, [x8, #0xc0c]
 467518c: 910003e0     	mov	x0, sp
 4675190: 52800001     	mov	w1, #0x0                ; =0
 4675194: 9783a7cb     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 4675198: aa0003e1     	mov	x1, x0
 467519c: aa1303e0     	mov	x0, x19
 46751a0: 9722ca18     	bl	0xf27a00 <_ChromeMain+0xf22764>
 46751a4: 52800400     	mov	w0, #0x20               ; =32
 46751a8: 96e66870     	bl	0xf368 <_ChromeMain+0xa0cc>
 46751ac: aa0003e1     	mov	x1, x0
 46751b0: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 46751b4: b9000808     	str	w8, [x0, #0x8]
 46751b8: 52800028     	mov	w8, #0x1                ; =1
 46751bc: 39003008     	strb	w8, [x0, #0xc]
 46751c0: f004e6a8     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 46751c4: 91044108     	add	x8, x8, #0x110
 46751c8: f9000008     	str	x8, [x0]
 46751cc: d2800048     	mov	x8, #0x2                ; =2
 46751d0: f2c00108     	movk	x8, #0x8, lsl #32
 46751d4: 4e080d00     	dup.2d	v0, x8
 46751d8: 3d800400     	str	q0, [x0, #0x10]
 46751dc: f9400268     	ldr	x8, [x19]
 46751e0: f9408908     	ldr	x8, [x8, #0x110]
 46751e4: aa1303e0     	mov	x0, x19
 46751e8: d63f0100     	blr	x8
 46751ec: aa1303e0     	mov	x0, x19
 46751f0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46751f4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46751f8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 46751fc: 910103ff     	add	sp, sp, #0x40
 4675200: d65f03c0     	ret
 4675204: 972b5d70     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4675208: 52800a01     	mov	w1, #0x50               ; =80
 467520c: 96e64f2b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4675210: 17ffffd7     	b	0x467516c <_ChromeMain+0x466fed0>
 4675214: 390eda7f     	strb	wzr, [x19, #0x3b6]
 4675218: aa1303e0     	mov	x0, x19
 467521c: 9722cc3b     	bl	0xf28308 <_ChromeMain+0xf2306c>
 4675220: aa1303e0     	mov	x0, x19
 4675224: 52800041     	mov	w1, #0x2                ; =2
 4675228: 9705b1cf     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 467522c: 910eda61     	add	x1, x19, #0x3b6
 4675230: aa1403e0     	mov	x0, x20
 4675234: 9722cb67     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4675238: 17ffffa2     	b	0x46750c0 <_ChromeMain+0x466fe24>
 467523c: d4200000     	brk	#0
 4675240: d4400000     	hlt	#0
 4675244: d4200020     	brk	#0x1
 4675248: d4200000     	brk	#0
 467524c: d4400000     	hlt	#0
 4675250: d4200020     	brk	#0x1
 4675254: aa1403e0     	mov	x0, x20
 4675258: aa0903f5     	mov	x21, x9
 467525c: 976ec3b9     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4675260: b9404688     	ldr	w8, [x20, #0x44]
 4675264: f94026b4     	ldr	x20, [x21, #0x48]
 4675268: 17ffffa9     	b	0x467510c <_ChromeMain+0x466fe70>
 467526c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4675270: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4675274: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4675278: 910083fd     	add	x29, sp, #0x20
 467527c: d0054335     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4675280: f9445eb3     	ldr	x19, [x21, #0x8b8]
 4675284: b5000473     	cbnz	x19, 0x4675310 <_ChromeMain+0x4670074>
 4675288: 52800d00     	mov	w0, #0x68               ; =104
 467528c: 96e66837     	bl	0xf368 <_ChromeMain+0xa0cc>
