
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d64d0: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 41d64d4: a90167fa     	stp	x26, x25, [sp, #0x10]
 41d64d8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 41d64dc: a90357f6     	stp	x22, x21, [sp, #0x30]
 41d64e0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 41d64e4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 41d64e8: 910143fd     	add	x29, sp, #0x50
 41d64ec: d10883ff     	sub	sp, sp, #0x220
 41d64f0: b4000ea1     	cbz	x1, 0x41d66c4 <_ChromeMain+0x41d1428>
 41d64f4: aa0103f4     	mov	x20, x1
 41d64f8: aa0003f3     	mov	x19, x0
 41d64fc: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 41d6500: f81803bf     	stur	xzr, [x29, #-0x80]
 41d6504: f9402000     	ldr	x0, [x0, #0x40]
 41d6508: d10243a8     	sub	x8, x29, #0x90
 41d650c: 97fff855     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 41d6510: f85783a8     	ldur	x8, [x29, #-0x88]
 41d6514: b4000728     	cbz	x8, 0x41d65f8 <_ChromeMain+0x41d135c>
 41d6518: f9000ff3     	str	x19, [sp, #0x18]
 41d651c: b7f87488     	tbnz	x8, #0x3f, 0x41d73ac <_ChromeMain+0x41d2110>
 41d6520: f9002be8     	str	x8, [sp, #0x50]
 41d6524: d1000508     	sub	x8, x8, #0x1
 41d6528: d343fd08     	lsr	x8, x8, #3
 41d652c: 927de513     	and	x19, x8, #0x1ffffffffffffff8
 41d6530: 91002260     	add	x0, x19, #0x8
 41d6534: 96f8e38d     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d6538: f9000bf3     	str	x19, [sp, #0x10]
 41d653c: 91002261     	add	x1, x19, #0x8
 41d6540: f9002fe0     	str	x0, [sp, #0x58]
 41d6544: 94f8ccb3     	bl	0x8009810 <_ChromeMain+0x8004574>
 41d6548: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 41d654c: f81683bf     	stur	xzr, [x29, #-0x98]
 41d6550: f81503bf     	stur	xzr, [x29, #-0xb0]
 41d6554: 6f00e400     	movi.2d	v0, #0000000000000000
 41d6558: ad3983a0     	stp	q0, q0, [x29, #-0xd0]
 41d655c: f9400281     	ldr	x1, [x20]
 41d6560: d10343a0     	sub	x0, x29, #0xd0
 41d6564: 52800002     	mov	w2, #0x0                ; =0
 41d6568: 9721417c     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 41d656c: f81203bf     	stur	xzr, [x29, #-0xe0]
 41d6570: 6f00e400     	movi.2d	v0, #0000000000000000
 41d6574: ad3803a0     	stp	q0, q0, [x29, #-0x100]
 41d6578: f90007f4     	str	x20, [sp, #0x8]
 41d657c: f9400281     	ldr	x1, [x20]
 41d6580: 5280003c     	mov	w28, #0x1               ; =1
 41d6584: d10403a0     	sub	x0, x29, #0x100
 41d6588: 52800022     	mov	w2, #0x1                ; =1
 41d658c: 97214173     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 41d6590: f85303b7     	ldur	x23, [x29, #-0xd0]
 41d6594: f85003a8     	ldur	x8, [x29, #-0x100]
 41d6598: eb0802ff     	cmp	x23, x8
 41d659c: 54002620     	b.eq	0x41d6a60 <_ChromeMain+0x41d17c4>
 41d65a0: 910183f9     	add	x25, sp, #0x60
 41d65a4: 9103c3f5     	add	x21, sp, #0xf0
 41d65a8: 140000a3     	b	0x41d6834 <_ChromeMain+0x41d1598>
 41d65ac: f85583a0     	ldur	x0, [x29, #-0xa8]
 41d65b0: cb000268     	sub	x8, x19, x0
 41d65b4: 9344fd08     	asr	x8, x8, #4
 41d65b8: d291c729     	mov	x9, #0x8e39             ; =36409
 41d65bc: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d65c0: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d65c4: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d65c8: 9b097d08     	mul	x8, x8, x9
 41d65cc: f81603a8     	stur	x8, [x29, #-0xa0]
 41d65d0: f85683a8     	ldur	x8, [x29, #-0x98]
 41d65d4: 8b080d08     	add	x8, x8, x8, lsl #3
 41d65d8: d37ced01     	lsl	x1, x8, #4
 41d65dc: 96f8ca37     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d65e0: f9402fec     	ldr	x12, [sp, #0x58]
 41d65e4: b40000ac     	cbz	x12, 0x41d65f8 <_ChromeMain+0x41d135c>
 41d65e8: f9400be8     	ldr	x8, [sp, #0x10]
 41d65ec: 91002101     	add	x1, x8, #0x8
 41d65f0: aa0c03e0     	mov	x0, x12
 41d65f4: 96f8ca31     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d65f8: f85703b3     	ldur	x19, [x29, #-0x90]
 41d65fc: b4000653     	cbz	x19, 0x41d66c4 <_ChromeMain+0x41d1428>
 41d6600: f85783a8     	ldur	x8, [x29, #-0x88]
 41d6604: 8b080d08     	add	x8, x8, x8, lsl #3
 41d6608: d37ced14     	lsl	x20, x8, #4
 41d660c: b40003f4     	cbz	x20, 0x41d6688 <_ChromeMain+0x41d13ec>
 41d6610: d2800015     	mov	x21, #0x0               ; =0
 41d6614: aa1303f6     	mov	x22, x19
 41d6618: 14000016     	b	0x41d6670 <_ChromeMain+0x41d13d4>
 41d661c: 8b1402c8     	add	x8, x22, x20
 41d6620: f85e8100     	ldur	x0, [x8, #-0x18]
 41d6624: f85f8108     	ldur	x8, [x8, #-0x8]
 41d6628: d37ff901     	lsl	x1, x8, #1
 41d662c: 96f8ca23     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d6630: 8b1402d8     	add	x24, x22, x20
 41d6634: d1008300     	sub	x0, x24, #0x20
 41d6638: d2800001     	mov	x1, #0x0                ; =0
 41d663c: 96f9459f     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d6640: d101c300     	sub	x0, x24, #0x70
 41d6644: 96f9458d     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d6648: 38d87308     	ldursb	w8, [x24, #-0x79]
 41d664c: 36f800a8     	tbz	w8, #0x1f, 0x41d6660 <_ChromeMain+0x41d13c4>
 41d6650: f94002e0     	ldr	x0, [x23]
 41d6654: f8580308     	ldur	x8, [x24, #-0x80]
 41d6658: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d665c: 96f8ca17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d6660: d10242d6     	sub	x22, x22, #0x90
 41d6664: 910242b5     	add	x21, x21, #0x90
 41d6668: eb15029f     	cmp	x20, x21
 41d666c: 54000120     	b.eq	0x41d6690 <_ChromeMain+0x41d13f4>
 41d6670: 8b1402c8     	add	x8, x22, x20
 41d6674: f1024117     	subs	x23, x8, #0x90
 41d6678: 54002f80     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d667c: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d6680: 36fffd88     	tbz	w8, #0x1f, 0x41d6630 <_ChromeMain+0x41d1394>
 41d6684: 17ffffe6     	b	0x41d661c <_ChromeMain+0x41d1380>
 41d6688: aa1303e0     	mov	x0, x19
 41d668c: 14000002     	b	0x41d6694 <_ChromeMain+0x41d13f8>
 41d6690: f85703a0     	ldur	x0, [x29, #-0x90]
 41d6694: cb000268     	sub	x8, x19, x0
 41d6698: 9344fd08     	asr	x8, x8, #4
 41d669c: d291c729     	mov	x9, #0x8e39             ; =36409
 41d66a0: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d66a4: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d66a8: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d66ac: 9b097d08     	mul	x8, x8, x9
 41d66b0: f81783a8     	stur	x8, [x29, #-0x88]
 41d66b4: f85803a8     	ldur	x8, [x29, #-0x80]
 41d66b8: 8b080d08     	add	x8, x8, x8, lsl #3
 41d66bc: d37ced01     	lsl	x1, x8, #4
 41d66c0: 96f8c9fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d66c4: 910883ff     	add	sp, sp, #0x220
 41d66c8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 41d66cc: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 41d66d0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 41d66d4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 41d66d8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 41d66dc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 41d66e0: d65f03c0     	ret
 41d66e4: a900ff3f     	stp	xzr, xzr, [x25, #0x8]
 41d66e8: b801f33f     	stur	wzr, [x25, #0x1f]
 41d66ec: f801833f     	stur	xzr, [x25, #0x18]
 41d66f0: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 41d66f4: 3c8883e0     	stur	q0, [sp, #0x88]
 41d66f8: 3c8983e0     	stur	q0, [sp, #0x98]
 41d66fc: 3c8a83e0     	stur	q0, [sp, #0xa8]
 41d6700: 3c8b83e0     	stur	q0, [sp, #0xb8]
 41d6704: 790193ff     	strh	wzr, [sp, #0xc8]
 41d6708: a9077f3f     	stp	xzr, xzr, [x25, #0x70]
 41d670c: 390383ff     	strb	wzr, [sp, #0xe0]
 41d6710: 3903a3ff     	strb	wzr, [sp, #0xe8]
 41d6714: a975a7a8     	ldp	x8, x9, [x29, #-0xa8]
 41d6718: 5280120a     	mov	w10, #0x90              ; =144
 41d671c: 9b0a2133     	madd	x19, x9, x10, x8
 41d6720: f85683a8     	ldur	x8, [x29, #-0x98]
 41d6724: d10183aa     	sub	x10, x29, #0x60
 41d6728: a938e7aa     	stp	x10, x25, [x29, #-0x78]
 41d672c: d102a3aa     	sub	x10, x29, #0xa8
 41d6730: a939cfaa     	stp	x10, x19, [x29, #-0x68]
 41d6734: eb08013f     	cmp	x9, x8
 41d6738: 54006040     	b.eq	0x41d7340 <_ChromeMain+0x41d20a4>
 41d673c: b4002973     	cbz	x19, 0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6740: f94033e8     	ldr	x8, [sp, #0x60]
 41d6744: f9000268     	str	x8, [x19]
 41d6748: f90033ff     	str	xzr, [sp, #0x60]
 41d674c: 91002260     	add	x0, x19, #0x8
 41d6750: 91002321     	add	x1, x25, #0x8
 41d6754: 970011bc     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d6758: 3cc80320     	ldur	q0, [x25, #0x80]
 41d675c: 3d802260     	str	q0, [x19, #0x80]
 41d6760: f85a03a8     	ldur	x8, [x29, #-0x60]
 41d6764: 91024108     	add	x8, x8, #0x90
 41d6768: f81a03a8     	stur	x8, [x29, #-0x60]
 41d676c: f85a03a8     	ldur	x8, [x29, #-0x60]
 41d6770: f85583a9     	ldur	x9, [x29, #-0xa8]
 41d6774: eb090108     	subs	x8, x8, x9
 41d6778: 9344fd08     	asr	x8, x8, #4
 41d677c: d291c729     	mov	x9, #0x8e39             ; =36409
 41d6780: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d6784: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d6788: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d678c: 9b097d08     	mul	x8, x8, x9
 41d6790: f81603a8     	stur	x8, [x29, #-0xa0]
 41d6794: 540026a0     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6798: 9101e320     	add	x0, x25, #0x78
 41d679c: d2800001     	mov	x1, #0x0                ; =0
 41d67a0: 96f94546     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d67a4: 9100a320     	add	x0, x25, #0x28
 41d67a8: 96f94534     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d67ac: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 41d67b0: 36f800a8     	tbz	w8, #0x1f, 0x41d67c4 <_ChromeMain+0x41d1528>
 41d67b4: f94037e0     	ldr	x0, [sp, #0x68]
 41d67b8: f9403fe8     	ldr	x8, [sp, #0x78]
 41d67bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d67c0: 96f8c9be     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d67c4: f94033e0     	ldr	x0, [sp, #0x60]
 41d67c8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d67cc: 90054ee9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d67d0: f9404529     	ldr	x9, [x9, #0x88]
 41d67d4: eb09011f     	cmp	x8, x9
 41d67d8: 54000041     	b.ne	0x41d67e0 <_ChromeMain+0x41d1544>
 41d67dc: 96f93098     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d67e0: 3945a3e8     	ldrb	w8, [sp, #0x168]
 41d67e4: 340001c8     	cbz	w8, 0x41d681c <_ChromeMain+0x41d1580>
 41d67e8: 9103c3f3     	add	x19, sp, #0xf0
 41d67ec: 9101c260     	add	x0, x19, #0x70
 41d67f0: d2800001     	mov	x1, #0x0                ; =0
 41d67f4: 96f94531     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d67f8: 9103c3f5     	add	x21, sp, #0xf0
 41d67fc: 91008260     	add	x0, x19, #0x20
 41d6800: 96f9451e     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d6804: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 41d6808: 36f800a8     	tbz	w8, #0x1f, 0x41d681c <_ChromeMain+0x41d1580>
 41d680c: f9407be0     	ldr	x0, [sp, #0xf0]
 41d6810: f94083e8     	ldr	x8, [sp, #0x100]
 41d6814: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d6818: 96f8c9a8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d681c: d10343a0     	sub	x0, x29, #0xd0
 41d6820: 97214119     	bl	0xa26c84 <_ChromeMain+0xa219e8>
 41d6824: f85303b7     	ldur	x23, [x29, #-0xd0]
 41d6828: f85003a8     	ldur	x8, [x29, #-0x100]
 41d682c: eb0802ff     	cmp	x23, x8
 41d6830: 54001180     	b.eq	0x41d6a60 <_ChromeMain+0x41d17c4>
 41d6834: b4ffff57     	cbz	x23, 0x41d681c <_ChromeMain+0x41d1580>
 41d6838: 394186e8     	ldrb	w8, [x23, #0x61]
 41d683c: 34ffff08     	cbz	w8, 0x41d681c <_ChromeMain+0x41d1580>
 41d6840: f94022e8     	ldr	x8, [x23, #0x40]
 41d6844: b4fffec8     	cbz	x8, 0x41d681c <_ChromeMain+0x41d1580>
 41d6848: 6f00e400     	movi.2d	v0, #0000000000000000
 41d684c: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 41d6850: ad0983e0     	stp	q0, q0, [sp, #0x130]
 41d6854: ad0883e0     	stp	q0, q0, [sp, #0x110]
 41d6858: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 41d685c: f94022e8     	ldr	x8, [x23, #0x40]
 41d6860: b4000128     	cbz	x8, 0x41d6884 <_ChromeMain+0x41d15e8>
 41d6864: 91002100     	add	x0, x8, #0x8
 41d6868: d00547e1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 41d686c: 9126c021     	add	x1, x1, #0x9b0
 41d6870: 96f9f240     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d6874: b4000080     	cbz	x0, 0x41d6884 <_ChromeMain+0x41d15e8>
 41d6878: aa0003e8     	mov	x8, x0
 41d687c: 39408009     	ldrb	w9, [x0, #0x20]
 41d6880: 35000929     	cbnz	w9, 0x41d69a4 <_ChromeMain+0x41d1708>
 41d6884: 3903c3ff     	strb	wzr, [sp, #0xf0]
 41d6888: 3905a3ff     	strb	wzr, [sp, #0x168]
 41d688c: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 41d6890: 90054ee9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d6894: f9404529     	ldr	x9, [x9, #0x88]
 41d6898: eb09011f     	cmp	x8, x9
 41d689c: 54000061     	b.ne	0x41d68a8 <_ChromeMain+0x41d160c>
 41d68a0: aa1703e0     	mov	x0, x23
 41d68a4: 96f8f696     	bl	0x142fc <_ChromeMain+0xf060>
 41d68a8: f90033f7     	str	x23, [sp, #0x60]
 41d68ac: f94022f7     	ldr	x23, [x23, #0x40]
 41d68b0: b4fff1b7     	cbz	x23, 0x41d66e4 <_ChromeMain+0x41d1448>
 41d68b4: f807833f     	stur	xzr, [x25, #0x78]
 41d68b8: 6f00e400     	movi.2d	v0, #0000000000000000
 41d68bc: 3c868320     	stur	q0, [x25, #0x68]
 41d68c0: 3c858320     	stur	q0, [x25, #0x58]
 41d68c4: 3c848320     	stur	q0, [x25, #0x48]
 41d68c8: 3c838320     	stur	q0, [x25, #0x38]
 41d68cc: 3c828320     	stur	q0, [x25, #0x28]
 41d68d0: 3c818320     	stur	q0, [x25, #0x18]
 41d68d4: 3c808320     	stur	q0, [x25, #0x8]
 41d68d8: f9414ae8     	ldr	x8, [x23, #0x290]
 41d68dc: b5000588     	cbnz	x8, 0x41d698c <_ChromeMain+0x41d16f0>
 41d68e0: f94132e8     	ldr	x8, [x23, #0x260]
 41d68e4: f9401d09     	ldr	x9, [x8, #0x38]
 41d68e8: b982b6e8     	ldrsw	x8, [x23, #0x2b4]
 41d68ec: f0fff36a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 41d68f0: 913c814a     	add	x10, x10, #0xf20
 41d68f4: eb0a013f     	cmp	x9, x10
 41d68f8: 540051a1     	b.ne	0x41d732c <_ChromeMain+0x41d2090>
 41d68fc: 3100051f     	cmn	w8, #0x1
 41d6900: 54005740     	b.eq	0x41d73e8 <_ChromeMain+0x41d214c>
 41d6904: f94142e9     	ldr	x9, [x23, #0x280]
 41d6908: eb08013f     	cmp	x9, x8
 41d690c: 54001ae9     	b.ls	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6910: f9413ee9     	ldr	x9, [x23, #0x278]
 41d6914: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d6918: b40055a8     	cbz	x8, 0x41d73cc <_ChromeMain+0x41d2130>
 41d691c: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d6920: b7f854e9     	tbnz	x9, #0x3f, 0x41d73bc <_ChromeMain+0x41d2120>
 41d6924: b5005509     	cbnz	x9, 0x41d73c4 <_ChromeMain+0x41d2128>
 41d6928: f9400d08     	ldr	x8, [x8, #0x18]
 41d692c: f9400508     	ldr	x8, [x8, #0x8]
 41d6930: 91018101     	add	x1, x8, #0x60
 41d6934: 91002320     	add	x0, x25, #0x8
 41d6938: 96fd8d97     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d693c: 394203e8     	ldrb	w8, [sp, #0x80]
 41d6940: 3707ee68     	tbnz	w8, #0x0, 0x41d670c <_ChromeMain+0x41d1470>
 41d6944: b982b6e8     	ldrsw	x8, [x23, #0x2b4]
 41d6948: 3100051f     	cmn	w8, #0x1
 41d694c: 54005540     	b.eq	0x41d73f4 <_ChromeMain+0x41d2158>
 41d6950: f94142e9     	ldr	x9, [x23, #0x280]
 41d6954: eb08013f     	cmp	x9, x8
 41d6958: 54001889     	b.ls	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d695c: f9413ee9     	ldr	x9, [x23, #0x278]
 41d6960: f8687928     	ldr	x8, [x9, x8, lsl #3]
 41d6964: b40055a8     	cbz	x8, 0x41d7418 <_ChromeMain+0x41d217c>
 41d6968: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 41d696c: b7f85369     	tbnz	x9, #0x3f, 0x41d73d8 <_ChromeMain+0x41d213c>
 41d6970: b5005389     	cbnz	x9, 0x41d73e0 <_ChromeMain+0x41d2144>
 41d6974: f9400d08     	ldr	x8, [x8, #0x18]
 41d6978: f9400508     	ldr	x8, [x8, #0x8]
 41d697c: 91018101     	add	x1, x8, #0x60
 41d6980: 91002320     	add	x0, x25, #0x8
 41d6984: 970bd3e2     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d6988: 17ffff61     	b	0x41d670c <_ChromeMain+0x41d1470>
 41d698c: b942bae9     	ldr	w9, [x23, #0x2b8]
 41d6990: 3100053f     	cmn	w9, #0x1
 41d6994: 54005001     	b.ne	0x41d7394 <_ChromeMain+0x41d20f8>
 41d6998: 394d2109     	ldrb	w9, [x8, #0x348]
 41d699c: 34fffc09     	cbz	w9, 0x41d691c <_ChromeMain+0x41d1680>
 41d69a0: 1400026b     	b	0x41d734c <_ChromeMain+0x41d20b0>
 41d69a4: 9103c3e0     	add	x0, sp, #0xf0
 41d69a8: 91002101     	add	x1, x8, #0x8
 41d69ac: 96fd8d7a     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d69b0: 3905a3fc     	strb	w28, [sp, #0x168]
 41d69b4: f85783b3     	ldur	x19, [x29, #-0x88]
 41d69b8: a9452fec     	ldp	x12, x11, [sp, #0x50]
 41d69bc: b4fff173     	cbz	x19, 0x41d67e8 <_ChromeMain+0x41d154c>
 41d69c0: d2800014     	mov	x20, #0x0               ; =0
 41d69c4: f85703bb     	ldur	x27, [x29, #-0x90]
 41d69c8: 39441fe8     	ldrb	w8, [sp, #0x107]
 41d69cc: 13001d09     	sxtb	w9, w8
 41d69d0: 7100013f     	cmp	w9, #0x0
 41d69d4: a94f27ea     	ldp	x10, x9, [sp, #0xf0]
 41d69d8: 9a884137     	csel	x23, x9, x8, mi
 41d69dc: 9a954158     	csel	x24, x10, x21, mi
 41d69e0: 14000005     	b	0x41d69f4 <_ChromeMain+0x41d1758>
 41d69e4: 91000694     	add	x20, x20, #0x1
 41d69e8: 9102437b     	add	x27, x27, #0x90
 41d69ec: eb14027f     	cmp	x19, x20
 41d69f0: 54ffefc0     	b.eq	0x41d67e8 <_ChromeMain+0x41d154c>
 41d69f4: eb14019f     	cmp	x12, x20
 41d69f8: 54001380     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d69fc: d346fe95     	lsr	x21, x20, #6
 41d6a00: 9ad4239a     	lsl	x26, x28, x20
 41d6a04: f8757976     	ldr	x22, [x11, x21, lsl #3]
 41d6a08: ea1a02df     	tst	x22, x26
 41d6a0c: 54fffec1     	b.ne	0x41d69e4 <_ChromeMain+0x41d1748>
 41d6a10: 39405f69     	ldrb	w9, [x27, #0x17]
 41d6a14: 13001d28     	sxtb	w8, w9
 41d6a18: f940076a     	ldr	x10, [x27, #0x8]
 41d6a1c: 7100011f     	cmp	w8, #0x0
 41d6a20: 9a894149     	csel	x9, x10, x9, mi
 41d6a24: eb17013f     	cmp	x9, x23
 41d6a28: 54fffde1     	b.ne	0x41d69e4 <_ChromeMain+0x41d1748>
 41d6a2c: f9400369     	ldr	x9, [x27]
 41d6a30: 7100011f     	cmp	w8, #0x0
 41d6a34: 9a9b4120     	csel	x0, x9, x27, mi
 41d6a38: aa1803e1     	mov	x1, x24
 41d6a3c: aa1703e2     	mov	x2, x23
 41d6a40: 94f8cb88     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d6a44: a9452fec     	ldp	x12, x11, [sp, #0x50]
 41d6a48: 35fffce0     	cbnz	w0, 0x41d69e4 <_ChromeMain+0x41d1748>
 41d6a4c: aa1a02c8     	orr	x8, x22, x26
 41d6a50: f8357968     	str	x8, [x11, x21, lsl #3]
 41d6a54: 17ffff65     	b	0x41d67e8 <_ChromeMain+0x41d154c>
 41d6a58: aa1303e0     	mov	x0, x19
 41d6a5c: 17fffed5     	b	0x41d65b0 <_ChromeMain+0x41d1314>
 41d6a60: d10403a0     	sub	x0, x29, #0x100
 41d6a64: 970ed25e     	bl	0x58b3dc <_ChromeMain+0x586140>
 41d6a68: d10343a0     	sub	x0, x29, #0xd0
 41d6a6c: 970ed25c     	bl	0x58b3dc <_ChromeMain+0x586140>
 41d6a70: f85603a8     	ldur	x8, [x29, #-0xa0]
 41d6a74: 8b080d08     	add	x8, x8, x8, lsl #3
 41d6a78: d37ced09     	lsl	x9, x8, #4
 41d6a7c: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6a80: b40004e9     	cbz	x9, 0x41d6b1c <_ChromeMain+0x41d1880>
 41d6a84: f85583b6     	ldur	x22, [x29, #-0xa8]
 41d6a88: 8b0812c8     	add	x8, x22, x8, lsl #4
 41d6a8c: f90013e8     	str	x8, [sp, #0x20]
 41d6a90: f85783b3     	ldur	x19, [x29, #-0x88]
 41d6a94: b4001a93     	cbz	x19, 0x41d6de4 <_ChromeMain+0x41d1b48>
 41d6a98: f85703b4     	ldur	x20, [x29, #-0x90]
 41d6a9c: 52800035     	mov	w21, #0x1               ; =1
 41d6aa0: f9001bf6     	str	x22, [sp, #0x30]
 41d6aa4: 1400006b     	b	0x41d6c50 <_ChromeMain+0x41d19b4>
 41d6aa8: a94f23f5     	ldp	x21, x8, [sp, #0xf0]
 41d6aac: d37df113     	lsl	x19, x8, #3
 41d6ab0: b4000153     	cbz	x19, 0x41d6ad8 <_ChromeMain+0x41d183c>
 41d6ab4: f94007f4     	ldr	x20, [sp, #0x8]
 41d6ab8: f84086a1     	ldr	x1, [x21], #0x8
 41d6abc: aa1403e0     	mov	x0, x20
 41d6ac0: 52800002     	mov	w2, #0x0                ; =0
 41d6ac4: 975010e1     	bl	0x15dae48 <_ChromeMain+0x15d5bac>
 41d6ac8: f1002273     	subs	x19, x19, #0x8
 41d6acc: 54ffff61     	b.ne	0x41d6ab8 <_ChromeMain+0x41d181c>
 41d6ad0: f9407bf5     	ldr	x21, [sp, #0xf0]
 41d6ad4: f9402fec     	ldr	x12, [sp, #0x58]
 41d6ad8: b4000235     	cbz	x21, 0x41d6b1c <_ChromeMain+0x41d1880>
 41d6adc: f9407fe8     	ldr	x8, [sp, #0xf8]
 41d6ae0: d37df109     	lsl	x9, x8, #3
 41d6ae4: b4000109     	cbz	x9, 0x41d6b04 <_ChromeMain+0x41d1868>
 41d6ae8: cb080fe8     	neg	x8, x8, lsl #3
 41d6aec: 8b150129     	add	x9, x9, x21
 41d6af0: d1002129     	sub	x9, x9, #0x8
 41d6af4: b4000ba9     	cbz	x9, 0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6af8: d1002129     	sub	x9, x9, #0x8
 41d6afc: 91002108     	add	x8, x8, #0x8
 41d6b00: b5ffffa8     	cbnz	x8, 0x41d6af4 <_ChromeMain+0x41d1858>
 41d6b04: f9007fff     	str	xzr, [sp, #0xf8]
 41d6b08: f94083e8     	ldr	x8, [sp, #0x100]
 41d6b0c: d37df101     	lsl	x1, x8, #3
 41d6b10: aa1503e0     	mov	x0, x21
 41d6b14: 96f8c8e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d6b18: f9402fec     	ldr	x12, [sp, #0x58]
 41d6b1c: f85583b3     	ldur	x19, [x29, #-0xa8]
 41d6b20: b4ffd633     	cbz	x19, 0x41d65e4 <_ChromeMain+0x41d1348>
 41d6b24: f85603a8     	ldur	x8, [x29, #-0xa0]
 41d6b28: 8b080d08     	add	x8, x8, x8, lsl #3
 41d6b2c: d37ced14     	lsl	x20, x8, #4
 41d6b30: b4fff954     	cbz	x20, 0x41d6a58 <_ChromeMain+0x41d17bc>
 41d6b34: d2800015     	mov	x21, #0x0               ; =0
 41d6b38: 90054ef6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d6b3c: aa1303f7     	mov	x23, x19
 41d6b40: 14000011     	b	0x41d6b84 <_ChromeMain+0x41d18e8>
 41d6b44: 8b1402e8     	add	x8, x23, x20
 41d6b48: f8578100     	ldur	x0, [x8, #-0x88]
 41d6b4c: f8588108     	ldur	x8, [x8, #-0x78]
 41d6b50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d6b54: 96f8c8d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d6b58: f9400300     	ldr	x0, [x24]
 41d6b5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d6b60: f94046c9     	ldr	x9, [x22, #0x88]
 41d6b64: eb09011f     	cmp	x8, x9
 41d6b68: 54000041     	b.ne	0x41d6b70 <_ChromeMain+0x41d18d4>
 41d6b6c: 96f92fb4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d6b70: f900031f     	str	xzr, [x24]
 41d6b74: d10242f7     	sub	x23, x23, #0x90
 41d6b78: 910242b5     	add	x21, x21, #0x90
 41d6b7c: eb15029f     	cmp	x20, x21
 41d6b80: 54ffd160     	b.eq	0x41d65ac <_ChromeMain+0x41d1310>
 41d6b84: 8b1402f9     	add	x25, x23, x20
 41d6b88: f1024338     	subs	x24, x25, #0x90
 41d6b8c: 540006e0     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6b90: d1006320     	sub	x0, x25, #0x18
 41d6b94: d2800001     	mov	x1, #0x0                ; =0
 41d6b98: 96f94448     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d6b9c: d101a320     	sub	x0, x25, #0x68
 41d6ba0: 96f94436     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d6ba4: 38d8f328     	ldursb	w8, [x25, #-0x71]
 41d6ba8: 36fffd88     	tbz	w8, #0x1f, 0x41d6b58 <_ChromeMain+0x41d18bc>
 41d6bac: 17ffffe6     	b	0x41d6b44 <_ChromeMain+0x41d18a8>
 41d6bb0: 910006f7     	add	x23, x23, #0x1
 41d6bb4: 91024339     	add	x25, x25, #0x90
 41d6bb8: eb17027f     	cmp	x19, x23
 41d6bbc: 54000420     	b.eq	0x41d6c40 <_ChromeMain+0x41d19a4>
 41d6bc0: eb1701bf     	cmp	x13, x23
 41d6bc4: 54000520     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6bc8: d346fefa     	lsr	x26, x23, #6
 41d6bcc: 9ad722bb     	lsl	x27, x21, x23
 41d6bd0: f87a799c     	ldr	x28, [x12, x26, lsl #3]
 41d6bd4: ea1b039f     	tst	x28, x27
 41d6bd8: 54fffec1     	b.ne	0x41d6bb0 <_ChromeMain+0x41d1914>
 41d6bdc: 39405f29     	ldrb	w9, [x25, #0x17]
 41d6be0: 13001d28     	sxtb	w8, w9
 41d6be4: f940072a     	ldr	x10, [x25, #0x8]
 41d6be8: 7100011f     	cmp	w8, #0x0
 41d6bec: 9a894142     	csel	x2, x10, x9, mi
 41d6bf0: 39407eca     	ldrb	w10, [x22, #0x1f]
 41d6bf4: 13001d49     	sxtb	w9, w10
 41d6bf8: f9400acb     	ldr	x11, [x22, #0x10]
 41d6bfc: 7100013f     	cmp	w9, #0x0
 41d6c00: 9a8a416a     	csel	x10, x11, x10, mi
 41d6c04: eb0a005f     	cmp	x2, x10
 41d6c08: 54fffd41     	b.ne	0x41d6bb0 <_ChromeMain+0x41d1914>
 41d6c0c: f940032a     	ldr	x10, [x25]
 41d6c10: 7100011f     	cmp	w8, #0x0
 41d6c14: 9a994140     	csel	x0, x10, x25, mi
 41d6c18: f9400308     	ldr	x8, [x24]
 41d6c1c: 7100013f     	cmp	w9, #0x0
 41d6c20: 9a984101     	csel	x1, x8, x24, mi
 41d6c24: 94f8cb0f     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d6c28: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6c2c: 35fffc20     	cbnz	w0, 0x41d6bb0 <_ChromeMain+0x41d1914>
 41d6c30: aa1b0388     	orr	x8, x28, x27
 41d6c34: f83a7988     	str	x8, [x12, x26, lsl #3]
 41d6c38: f90042d7     	str	x23, [x22, #0x80]
 41d6c3c: 390222d5     	strb	w21, [x22, #0x88]
 41d6c40: 910242d6     	add	x22, x22, #0x90
 41d6c44: f94013e8     	ldr	x8, [sp, #0x20]
 41d6c48: eb0802df     	cmp	x22, x8
 41d6c4c: 540000a0     	b.eq	0x41d6c60 <_ChromeMain+0x41d19c4>
 41d6c50: d2800017     	mov	x23, #0x0               ; =0
 41d6c54: 910022d8     	add	x24, x22, #0x8
 41d6c58: aa1403f9     	mov	x25, x20
 41d6c5c: 17ffffd9     	b	0x41d6bc0 <_ChromeMain+0x41d1924>
 41d6c60: f9401bf6     	ldr	x22, [sp, #0x30]
 41d6c64: 14000060     	b	0x41d6de4 <_ChromeMain+0x41d1b48>
 41d6c68: d4200020     	brk	#0x1
 41d6c6c: 91000739     	add	x25, x25, #0x1
 41d6c70: f94027e8     	ldr	x8, [sp, #0x48]
 41d6c74: eb08033f     	cmp	x25, x8
 41d6c78: 54000ac0     	b.eq	0x41d6dd0 <_ChromeMain+0x41d1b34>
 41d6c7c: eb0d033f     	cmp	x25, x13
 41d6c80: 54ffff40     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6c84: d346ff29     	lsr	x9, x25, #6
 41d6c88: 52800028     	mov	w8, #0x1                ; =1
 41d6c8c: 9ad92108     	lsl	x8, x8, x25
 41d6c90: a903a7e8     	stp	x8, x9, [sp, #0x38]
 41d6c94: f8697997     	ldr	x23, [x12, x9, lsl #3]
 41d6c98: ea0802ff     	tst	x23, x8
 41d6c9c: 54fffe81     	b.ne	0x41d6c6c <_ChromeMain+0x41d19d0>
 41d6ca0: f9401be8     	ldr	x8, [sp, #0x30]
 41d6ca4: f9400108     	ldr	x8, [x8]
 41d6ca8: f940211a     	ldr	x26, [x8, #0x40]
 41d6cac: b4fffe1a     	cbz	x26, 0x41d6c6c <_ChromeMain+0x41d19d0>
 41d6cb0: 52801208     	mov	w8, #0x90               ; =144
 41d6cb4: f94017e9     	ldr	x9, [sp, #0x28]
 41d6cb8: 9b082733     	madd	x19, x25, x8, x9
 41d6cbc: 39406268     	ldrb	w8, [x19, #0x18]
 41d6cc0: 3607fd68     	tbz	w8, #0x0, 0x41d6c6c <_ChromeMain+0x41d19d0>
 41d6cc4: f941435b     	ldr	x27, [x26, #0x280]
 41d6cc8: 7100077f     	cmp	w27, #0x1
 41d6ccc: 54fffd0b     	b.lt	0x41d6c6c <_ChromeMain+0x41d19d0>
 41d6cd0: d2800015     	mov	x21, #0x0               ; =0
 41d6cd4: 14000005     	b	0x41d6ce8 <_ChromeMain+0x41d1a4c>
 41d6cd8: 910006b5     	add	x21, x21, #0x1
 41d6cdc: 92407b68     	and	x8, x27, #0x7fffffff
 41d6ce0: eb15011f     	cmp	x8, x21
 41d6ce4: 54fffc40     	b.eq	0x41d6c6c <_ChromeMain+0x41d19d0>
 41d6ce8: eb15037f     	cmp	x27, x21
 41d6cec: 54fffbe0     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6cf0: f9413f48     	ldr	x8, [x26, #0x278]
 41d6cf4: f875791c     	ldr	x28, [x8, x21, lsl #3]
 41d6cf8: b4ffff1c     	cbz	x28, 0x41d6cd8 <_ChromeMain+0x41d1a3c>
 41d6cfc: f9400f88     	ldr	x8, [x28, #0x18]
 41d6d00: f9400509     	ldr	x9, [x8, #0x8]
 41d6d04: 91018134     	add	x20, x9, #0x60
 41d6d08: 3941dd2a     	ldrb	w10, [x9, #0x77]
 41d6d0c: 13001d48     	sxtb	w8, w10
 41d6d10: f9403529     	ldr	x9, [x9, #0x68]
 41d6d14: 7100011f     	cmp	w8, #0x0
 41d6d18: 9a8a4122     	csel	x2, x9, x10, mi
 41d6d1c: 39405e69     	ldrb	w9, [x19, #0x17]
 41d6d20: 13001d38     	sxtb	w24, w9
 41d6d24: f940066a     	ldr	x10, [x19, #0x8]
 41d6d28: 7100031f     	cmp	w24, #0x0
 41d6d2c: 9a894156     	csel	x22, x10, x9, mi
 41d6d30: eb16005f     	cmp	x2, x22
 41d6d34: 54000141     	b.ne	0x41d6d5c <_ChromeMain+0x41d1ac0>
 41d6d38: f9400289     	ldr	x9, [x20]
 41d6d3c: 7100011f     	cmp	w8, #0x0
 41d6d40: 9a944120     	csel	x0, x9, x20, mi
 41d6d44: f9400268     	ldr	x8, [x19]
 41d6d48: 7100031f     	cmp	w24, #0x0
 41d6d4c: 9a934101     	csel	x1, x8, x19, mi
 41d6d50: 94f8cac4     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d6d54: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6d58: 340002e0     	cbz	w0, 0x41d6db4 <_ChromeMain+0x41d1b18>
 41d6d5c: 3980ff88     	ldrsb	x8, [x28, #0x3f]
 41d6d60: b7f832a8     	tbnz	x8, #0x3f, 0x41d73b4 <_ChromeMain+0x41d2118>
 41d6d64: 9100a389     	add	x9, x28, #0x28
 41d6d68: f100011f     	cmp	x8, #0x0
 41d6d6c: 9a890288     	csel	x8, x20, x9, eq
 41d6d70: 39405d0a     	ldrb	w10, [x8, #0x17]
 41d6d74: 13001d49     	sxtb	w9, w10
 41d6d78: f940050b     	ldr	x11, [x8, #0x8]
 41d6d7c: 7100013f     	cmp	w9, #0x0
 41d6d80: 9a8a416a     	csel	x10, x11, x10, mi
 41d6d84: eb16015f     	cmp	x10, x22
 41d6d88: 54fffa81     	b.ne	0x41d6cd8 <_ChromeMain+0x41d1a3c>
 41d6d8c: f940010a     	ldr	x10, [x8]
 41d6d90: 7100013f     	cmp	w9, #0x0
 41d6d94: 9a884140     	csel	x0, x10, x8, mi
 41d6d98: f9400268     	ldr	x8, [x19]
 41d6d9c: 7100031f     	cmp	w24, #0x0
 41d6da0: 9a934101     	csel	x1, x8, x19, mi
 41d6da4: aa1603e2     	mov	x2, x22
 41d6da8: 94f8caae     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d6dac: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6db0: 35fff940     	cbnz	w0, 0x41d6cd8 <_ChromeMain+0x41d1a3c>
 41d6db4: a943a7e8     	ldp	x8, x9, [sp, #0x38]
 41d6db8: aa0802e8     	orr	x8, x23, x8
 41d6dbc: f8297988     	str	x8, [x12, x9, lsl #3]
 41d6dc0: f9401be9     	ldr	x9, [sp, #0x30]
 41d6dc4: f9004139     	str	x25, [x9, #0x80]
 41d6dc8: 52800028     	mov	w8, #0x1                ; =1
 41d6dcc: 39022128     	strb	w8, [x9, #0x88]
 41d6dd0: f9401bf6     	ldr	x22, [sp, #0x30]
 41d6dd4: 910242d6     	add	x22, x22, #0x90
 41d6dd8: f94013e8     	ldr	x8, [sp, #0x20]
 41d6ddc: eb0802df     	cmp	x22, x8
 41d6de0: 54000160     	b.eq	0x41d6e0c <_ChromeMain+0x41d1b70>
 41d6de4: f9001bf6     	str	x22, [sp, #0x30]
 41d6de8: 394222c8     	ldrb	w8, [x22, #0x88]
 41d6dec: 3707ff28     	tbnz	w8, #0x0, 0x41d6dd0 <_ChromeMain+0x41d1b34>
 41d6df0: f85783a8     	ldur	x8, [x29, #-0x88]
 41d6df4: f90027e8     	str	x8, [sp, #0x48]
 41d6df8: b4fffec8     	cbz	x8, 0x41d6dd0 <_ChromeMain+0x41d1b34>
 41d6dfc: d2800019     	mov	x25, #0x0               ; =0
 41d6e00: f85703a8     	ldur	x8, [x29, #-0x90]
 41d6e04: f90017e8     	str	x8, [sp, #0x28]
 41d6e08: 17ffff9d     	b	0x41d6c7c <_ChromeMain+0x41d19e0>
 41d6e0c: f85603a8     	ldur	x8, [x29, #-0xa0]
 41d6e10: 8b080d08     	add	x8, x8, x8, lsl #3
 41d6e14: d37ced09     	lsl	x9, x8, #4
 41d6e18: b4ffe829     	cbz	x9, 0x41d6b1c <_ChromeMain+0x41d1880>
 41d6e1c: f85583b3     	ldur	x19, [x29, #-0xa8]
 41d6e20: 8b081274     	add	x20, x19, x8, lsl #4
 41d6e24: 52800035     	mov	w21, #0x1               ; =1
 41d6e28: 14000009     	b	0x41d6e4c <_ChromeMain+0x41d1bb0>
 41d6e2c: aa190348     	orr	x8, x26, x25
 41d6e30: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6e34: f8387988     	str	x8, [x12, x24, lsl #3]
 41d6e38: f9004276     	str	x22, [x19, #0x80]
 41d6e3c: 39022275     	strb	w21, [x19, #0x88]
 41d6e40: 91024273     	add	x19, x19, #0x90
 41d6e44: eb14027f     	cmp	x19, x20
 41d6e48: 540004a0     	b.eq	0x41d6edc <_ChromeMain+0x41d1c40>
 41d6e4c: 39422268     	ldrb	w8, [x19, #0x88]
 41d6e50: 3707ff88     	tbnz	w8, #0x0, 0x41d6e40 <_ChromeMain+0x41d1ba4>
 41d6e54: f85783a8     	ldur	x8, [x29, #-0x88]
 41d6e58: b4ffff48     	cbz	x8, 0x41d6e40 <_ChromeMain+0x41d1ba4>
 41d6e5c: d2800017     	mov	x23, #0x0               ; =0
 41d6e60: d2800016     	mov	x22, #0x0               ; =0
 41d6e64: 14000009     	b	0x41d6e88 <_ChromeMain+0x41d1bec>
 41d6e68: f85783a8     	ldur	x8, [x29, #-0x88]
 41d6e6c: a94533ed     	ldp	x13, x12, [sp, #0x50]
 41d6e70: 910006d6     	add	x22, x22, #0x1
 41d6e74: eb0802df     	cmp	x22, x8
 41d6e78: 54fffe42     	b.hs	0x41d6e40 <_ChromeMain+0x41d1ba4>
 41d6e7c: 910242f7     	add	x23, x23, #0x90
 41d6e80: eb1601bf     	cmp	x13, x22
 41d6e84: 54ffef20     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6e88: d346fed8     	lsr	x24, x22, #6
 41d6e8c: 9ad622b9     	lsl	x25, x21, x22
 41d6e90: f878799a     	ldr	x26, [x12, x24, lsl #3]
 41d6e94: ea19035f     	tst	x26, x25
 41d6e98: 54fffec1     	b.ne	0x41d6e70 <_ChromeMain+0x41d1bd4>
 41d6e9c: f85703a9     	ldur	x9, [x29, #-0x90]
 41d6ea0: 8b170120     	add	x0, x9, x23
 41d6ea4: 39406009     	ldrb	w9, [x0, #0x18]
 41d6ea8: 34fffe49     	cbz	w9, 0x41d6e70 <_ChromeMain+0x41d1bd4>
 41d6eac: 39408269     	ldrb	w9, [x19, #0x20]
 41d6eb0: 3607fe09     	tbz	w9, #0x0, 0x41d6e70 <_ChromeMain+0x41d1bd4>
 41d6eb4: b9403c09     	ldr	w9, [x0, #0x3c]
 41d6eb8: b940466a     	ldr	w10, [x19, #0x44]
 41d6ebc: 7100053f     	cmp	w9, #0x1
 41d6ec0: 7a41a948     	ccmp	w10, #0x1, #0x8, ge
 41d6ec4: 54fffd6b     	b.lt	0x41d6e70 <_ChromeMain+0x41d1bd4>
 41d6ec8: 91002261     	add	x1, x19, #0x8
 41d6ecc: 52800022     	mov	w2, #0x1                ; =1
 41d6ed0: 97366ed8     	bl	0xf72a30 <_ChromeMain+0xf6d794>
 41d6ed4: 3707fac0     	tbnz	w0, #0x0, 0x41d6e2c <_ChromeMain+0x41d1b90>
 41d6ed8: 17ffffe4     	b	0x41d6e68 <_ChromeMain+0x41d1bcc>
 41d6edc: a975a3b5     	ldp	x21, x8, [x29, #-0xa8]
 41d6ee0: 8b080d08     	add	x8, x8, x8, lsl #3
 41d6ee4: d37ced09     	lsl	x9, x8, #4
 41d6ee8: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 41d6eec: f90083ff     	str	xzr, [sp, #0x100]
 41d6ef0: b4ffe169     	cbz	x9, 0x41d6b1c <_ChromeMain+0x41d1880>
 41d6ef4: f9400ff4     	ldr	x20, [sp, #0x18]
 41d6ef8: 9101829b     	add	x27, x20, #0x60
 41d6efc: 52801216     	mov	w22, #0x90              ; =144
 41d6f00: 8b0812bc     	add	x28, x21, x8, lsl #4
 41d6f04: 14000014     	b	0x41d6f54 <_ChromeMain+0x41d1cb8>
 41d6f08: b94002e9     	ldr	w9, [x23]
 41d6f0c: 6b09035f     	cmp	w26, w9
 41d6f10: 54000acb     	b.lt	0x41d7068 <_ChromeMain+0x41d1dcc>
 41d6f14: 910022e0     	add	x0, x23, #0x8
 41d6f18: aa1903e1     	mov	x1, x25
 41d6f1c: 970bd27c     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d6f20: f9400ff4     	ldr	x20, [sp, #0x18]
 41d6f24: f94002a0     	ldr	x0, [x21]
 41d6f28: aa1903e1     	mov	x1, x25
 41d6f2c: 940004a9     	bl	0x41d81d0 <_ChromeMain+0x41d2f34>
 41d6f30: f94002a8     	ldr	x8, [x21]
 41d6f34: f90033e8     	str	x8, [sp, #0x60]
 41d6f38: 9103c3e0     	add	x0, sp, #0xf0
 41d6f3c: 910183e1     	add	x1, sp, #0x60
 41d6f40: 949f8fa6     	bl	0x69badd8 <_ChromeMain+0x69b5b3c>
 41d6f44: f9402fec     	ldr	x12, [sp, #0x58]
 41d6f48: 910242b5     	add	x21, x21, #0x90
 41d6f4c: eb1c02bf     	cmp	x21, x28
 41d6f50: 54ffdac0     	b.eq	0x41d6aa8 <_ChromeMain+0x41d180c>
 41d6f54: 394222a8     	ldrb	w8, [x21, #0x88]
 41d6f58: 34ffff88     	cbz	w8, 0x41d6f48 <_ChromeMain+0x41d1cac>
 41d6f5c: f94042a8     	ldr	x8, [x21, #0x80]
 41d6f60: f85783a9     	ldur	x9, [x29, #-0x88]
 41d6f64: eb09011f     	cmp	x8, x9
 41d6f68: 54ffe802     	b.hs	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d6f6c: f85703a9     	ldur	x9, [x29, #-0x90]
 41d6f70: 9b162519     	madd	x25, x8, x22, x9
 41d6f74: f94002a8     	ldr	x8, [x21]
 41d6f78: f9402100     	ldr	x0, [x8, #0x40]
 41d6f7c: aa1903e1     	mov	x1, x25
 41d6f80: 940e034d     	bl	0x4557cb4 <_ChromeMain+0x4552a18>
 41d6f84: f94002a8     	ldr	x8, [x21]
 41d6f88: b940111a     	ldr	w26, [x8, #0x10]
 41d6f8c: f9400373     	ldr	x19, [x27]
 41d6f90: f8468288     	ldur	x8, [x20, #0x68]
 41d6f94: d379e109     	lsl	x9, x8, #7
 41d6f98: b40001a9     	cbz	x9, 0x41d6fcc <_ChromeMain+0x41d1d30>
 41d6f9c: 9347fd29     	asr	x9, x9, #7
 41d6fa0: aa1303f7     	mov	x23, x19
 41d6fa4: d341fd2a     	lsr	x10, x9, #1
 41d6fa8: 8b0a1eeb     	add	x11, x23, x10, lsl #7
 41d6fac: b848056c     	ldr	w12, [x11], #0x80
 41d6fb0: aa6907ed     	mvn	x13, x9, lsr #1
 41d6fb4: 8b0d0129     	add	x9, x9, x13
 41d6fb8: 6b1a019f     	cmp	w12, w26
 41d6fbc: 9a8ab129     	csel	x9, x9, x10, lt
 41d6fc0: 9a97b177     	csel	x23, x11, x23, lt
 41d6fc4: b5ffff09     	cbnz	x9, 0x41d6fa4 <_ChromeMain+0x41d1d08>
 41d6fc8: 14000002     	b	0x41d6fd0 <_ChromeMain+0x41d1d34>
 41d6fcc: aa1303f7     	mov	x23, x19
 41d6fd0: 8b081e74     	add	x20, x19, x8, lsl #7
 41d6fd4: eb1402ff     	cmp	x23, x20
 41d6fd8: 54fff981     	b.ne	0x41d6f08 <_ChromeMain+0x41d1c6c>
 41d6fdc: f9400fe9     	ldr	x9, [sp, #0x18]
 41d6fe0: f8470129     	ldur	x9, [x9, #0x70]
 41d6fe4: eb09011f     	cmp	x8, x9
 41d6fe8: 54000f01     	b.ne	0x41d71c8 <_ChromeMain+0x41d1f2c>
 41d6fec: f9002bf9     	str	x25, [sp, #0x50]
 41d6ff0: cb1302f9     	sub	x25, x23, x19
 41d6ff4: 91000509     	add	x9, x8, #0x1
 41d6ff8: d379fd2a     	lsr	x10, x9, #57
 41d6ffc: b5001d6a     	cbnz	x10, 0x41d73a8 <_ChromeMain+0x41d210c>
 41d7000: aa1b03f6     	mov	x22, x27
 41d7004: d2800018     	mov	x24, #0x0               ; =0
 41d7008: d37ff90a     	lsl	x10, x8, #1
 41d700c: eb09015f     	cmp	x10, x9
 41d7010: 9a898149     	csel	x9, x10, x9, hi
 41d7014: 92ffe00a     	mov	x10, #0xffffffffffffff  ; =72057594037927935
 41d7018: eb0a011f     	cmp	x8, x10
 41d701c: 92ffc008     	mov	x8, #0x1ffffffffffffff  ; =144115188075855871
 41d7020: 9a88313b     	csel	x27, x9, x8, lo
 41d7024: f90033ff     	str	xzr, [sp, #0x60]
 41d7028: b40000fb     	cbz	x27, 0x41d7044 <_ChromeMain+0x41d1da8>
 41d702c: d379ff68     	lsr	x8, x27, #57
 41d7030: b5001c08     	cbnz	x8, 0x41d73b0 <_ChromeMain+0x41d2114>
 41d7034: d379e360     	lsl	x0, x27, #7
 41d7038: 96f8e0cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d703c: aa0003f8     	mov	x24, x0
 41d7040: f90033e0     	str	x0, [sp, #0x60]
 41d7044: 8b190314     	add	x20, x24, x25
 41d7048: f90037f4     	str	x20, [sp, #0x68]
 41d704c: f9003ffb     	str	x27, [sp, #0x78]
 41d7050: eb991f7f     	cmp	x27, x25, asr #7
 41d7054: 54000fa1     	b.ne	0x41d7248 <_ChromeMain+0x41d1fac>
 41d7058: eb1302ff     	cmp	x23, x19
 41d705c: f9402bf9     	ldr	x25, [sp, #0x50]
 41d7060: 54000e81     	b.ne	0x41d7230 <_ChromeMain+0x41d1f94>
 41d7064: 14000065     	b	0x41d71f8 <_ChromeMain+0x41d1f5c>
 41d7068: f9002bf9     	str	x25, [sp, #0x50]
 41d706c: f9400ff9     	ldr	x25, [sp, #0x18]
 41d7070: f8470329     	ldur	x9, [x25, #0x70]
 41d7074: eb09011f     	cmp	x8, x9
 41d7078: 54fffbc0     	b.eq	0x41d6ff0 <_ChromeMain+0x41d1d54>
 41d707c: 6f00e400     	movi.2d	v0, #0000000000000000
 41d7080: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 41d7084: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 41d7088: ad0403e0     	stp	q0, q0, [sp, #0x80]
 41d708c: ad0303e0     	stp	q0, q0, [sp, #0x60]
 41d7090: f90073fb     	str	x27, [sp, #0xe0]
 41d7094: b90063fa     	str	w26, [sp, #0x60]
 41d7098: 910183e8     	add	x8, sp, #0x60
 41d709c: 91002100     	add	x0, x8, #0x8
 41d70a0: f9402be1     	ldr	x1, [sp, #0x50]
 41d70a4: 96fd8bbc     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d70a8: f9400378     	ldr	x24, [x27]
 41d70ac: f846832b     	ldur	x11, [x25, #0x68]
 41d70b0: 8b0b1f0c     	add	x12, x24, x11, lsl #7
 41d70b4: d102018a     	sub	x10, x12, #0x80
 41d70b8: aa0c03e9     	mov	x9, x12
 41d70bc: aa1803e8     	mov	x8, x24
 41d70c0: eb14015f     	cmp	x10, x20
 41d70c4: 540002e2     	b.hs	0x41d7120 <_ChromeMain+0x41d1e84>
 41d70c8: a9042fec     	stp	x12, x11, [sp, #0x40]
 41d70cc: aa1b03f6     	mov	x22, x27
 41d70d0: d379e179     	lsl	x25, x11, #7
 41d70d4: cb1803fb     	neg	x27, x24
 41d70d8: aa1803f3     	mov	x19, x24
 41d70dc: aa1803fa     	mov	x26, x24
 41d70e0: ab19027f     	cmn	x19, x25
 41d70e4: 54ffdc20     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d70e8: 8b190348     	add	x8, x26, x25
 41d70ec: b8580109     	ldur	w9, [x8, #-0x80]
 41d70f0: 8b190260     	add	x0, x19, x25
 41d70f4: b8008409     	str	w9, [x0], #0x8
 41d70f8: d101e101     	sub	x1, x8, #0x78
 41d70fc: 97000f52     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d7100: 9102035a     	add	x26, x26, #0x80
 41d7104: 8b190348     	add	x8, x26, x25
 41d7108: d1020108     	sub	x8, x8, #0x80
 41d710c: 91020273     	add	x19, x19, #0x80
 41d7110: d102037b     	sub	x27, x27, #0x80
 41d7114: eb14011f     	cmp	x8, x20
 41d7118: 54fffe43     	b.lo	0x41d70e0 <_ChromeMain+0x41d1e44>
 41d711c: 1400007d     	b	0x41d7310 <_ChromeMain+0x41d2074>
 41d7120: 910202ea     	add	x10, x23, #0x80
 41d7124: cb080128     	sub	x8, x9, x8
 41d7128: 9347fd08     	asr	x8, x8, #7
 41d712c: f8068328     	stur	x8, [x25, #0x68]
 41d7130: eb0a019f     	cmp	x12, x10
 41d7134: 54000ca0     	b.eq	0x41d72c8 <_ChromeMain+0x41d202c>
 41d7138: d379e173     	lsl	x19, x11, #7
 41d713c: aa1803f4     	mov	x20, x24
 41d7140: 8b130288     	add	x8, x20, x19
 41d7144: 8b130309     	add	x9, x24, x19
 41d7148: b850010a     	ldur	w10, [x8, #-0x100]
 41d714c: b818012a     	stur	w10, [x9, #-0x80]
 41d7150: d103e101     	sub	x1, x8, #0xf8
 41d7154: d101e120     	sub	x0, x9, #0x78
 41d7158: 97108a62     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 41d715c: d1020318     	sub	x24, x24, #0x80
 41d7160: d1020294     	sub	x20, x20, #0x80
 41d7164: 8b130288     	add	x8, x20, x19
 41d7168: d1020108     	sub	x8, x8, #0x80
 41d716c: eb17011f     	cmp	x8, x23
 41d7170: 54fffe81     	b.ne	0x41d7140 <_ChromeMain+0x41d1ea4>
 41d7174: 14000055     	b	0x41d72c8 <_ChromeMain+0x41d202c>
 41d7178: 8b1302e8     	add	x8, x23, x19
 41d717c: f8588100     	ldur	x0, [x8, #-0x78]
 41d7180: f8598108     	ldur	x8, [x8, #-0x68]
 41d7184: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d7188: 96f8c74c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d718c: d10202f7     	sub	x23, x23, #0x80
 41d7190: 91020294     	add	x20, x20, #0x80
 41d7194: eb14027f     	cmp	x19, x20
 41d7198: 540008c0     	b.eq	0x41d72b0 <_ChromeMain+0x41d2014>
 41d719c: 8b1302f8     	add	x24, x23, x19
 41d71a0: f102031f     	cmp	x24, #0x80
 41d71a4: 54ffd620     	b.eq	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d71a8: d1002300     	sub	x0, x24, #0x8
 41d71ac: d2800001     	mov	x1, #0x0                ; =0
 41d71b0: 96f942c2     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d71b4: d1016300     	sub	x0, x24, #0x58
 41d71b8: 96f942b0     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d71bc: 38d9f308     	ldursb	w8, [x24, #-0x61]
 41d71c0: 36fffe68     	tbz	w8, #0x1f, 0x41d718c <_ChromeMain+0x41d1ef0>
 41d71c4: 17ffffed     	b	0x41d7178 <_ChromeMain+0x41d1edc>
 41d71c8: b4ffd517     	cbz	x23, 0x41d6c68 <_ChromeMain+0x41d19cc>
 41d71cc: aa1703e0     	mov	x0, x23
 41d71d0: b800841a     	str	w26, [x0], #0x8
 41d71d4: aa1903e1     	mov	x1, x25
 41d71d8: 96fd8b6f     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d71dc: f9400368     	ldr	x8, [x27]
 41d71e0: cb0802e8     	sub	x8, x23, x8
 41d71e4: 91020108     	add	x8, x8, #0x80
 41d71e8: 9347fd08     	asr	x8, x8, #7
 41d71ec: f9400ff4     	ldr	x20, [sp, #0x18]
 41d71f0: f8068288     	stur	x8, [x20, #0x68]
 41d71f4: 17ffff4c     	b	0x41d6f24 <_ChromeMain+0x41d1c88>
 41d71f8: d37ffb68     	lsl	x8, x27, #1
 41d71fc: f100051f     	cmp	x8, #0x1
 41d7200: 9a9f8513     	csinc	x19, x8, xzr, hi
 41d7204: d379e260     	lsl	x0, x19, #7
 41d7208: 96f8e058     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d720c: d342fe68     	lsr	x8, x19, #2
 41d7210: 8b081c08     	add	x8, x0, x8, lsl #7
 41d7214: a90623e0     	stp	x0, x8, [sp, #0x60]
 41d7218: f9003ff3     	str	x19, [sp, #0x78]
 41d721c: b4000198     	cbz	x24, 0x41d724c <_ChromeMain+0x41d1fb0>
 41d7220: d379e361     	lsl	x1, x27, #7
 41d7224: aa1803e0     	mov	x0, x24
 41d7228: 96f8c724     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d722c: 14000008     	b	0x41d724c <_ChromeMain+0x41d1fb0>
 41d7230: d37ae768     	lsl	x8, x27, #6
 41d7234: 91010108     	add	x8, x8, #0x40
 41d7238: 9279dd08     	and	x8, x8, #0x7fffffffffffff80
 41d723c: cb080294     	sub	x20, x20, x8
 41d7240: f90037f4     	str	x20, [sp, #0x68]
 41d7244: 14000002     	b	0x41d724c <_ChromeMain+0x41d1fb0>
 41d7248: f9402bf9     	ldr	x25, [sp, #0x50]
 41d724c: b4ffd0f4     	cbz	x20, 0x41d6c68 <_ChromeMain+0x41d19cc>
 41d7250: aa1603fb     	mov	x27, x22
 41d7254: aa1403e0     	mov	x0, x20
 41d7258: b800841a     	str	w26, [x0], #0x8
 41d725c: aa1903e1     	mov	x1, x25
 41d7260: 96fd8b4d     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7264: f94037e8     	ldr	x8, [sp, #0x68]
 41d7268: cb080288     	sub	x8, x20, x8
 41d726c: 91020108     	add	x8, x8, #0x80
 41d7270: 9347fd08     	asr	x8, x8, #7
 41d7274: f9003be8     	str	x8, [sp, #0x70]
 41d7278: 910183e0     	add	x0, sp, #0x60
 41d727c: f9400fe8     	ldr	x8, [sp, #0x18]
 41d7280: 91018102     	add	x2, x8, #0x60
 41d7284: 9101a103     	add	x3, x8, #0x68
 41d7288: 9101c104     	add	x4, x8, #0x70
 41d728c: aa1703e1     	mov	x1, x23
 41d7290: 940006cc     	bl	0x41d8dc0 <_ChromeMain+0x41d3b24>
 41d7294: f9403be8     	ldr	x8, [sp, #0x70]
 41d7298: d379e113     	lsl	x19, x8, #7
 41d729c: 52801216     	mov	w22, #0x90              ; =144
 41d72a0: b4000093     	cbz	x19, 0x41d72b0 <_ChromeMain+0x41d2014>
 41d72a4: d2800014     	mov	x20, #0x0               ; =0
 41d72a8: f94037f7     	ldr	x23, [sp, #0x68]
 41d72ac: 17ffffbc     	b	0x41d719c <_ChromeMain+0x41d1f00>
 41d72b0: f94033e0     	ldr	x0, [sp, #0x60]
 41d72b4: b4ffe360     	cbz	x0, 0x41d6f20 <_ChromeMain+0x41d1c84>
 41d72b8: f9403fe8     	ldr	x8, [sp, #0x78]
 41d72bc: d379e101     	lsl	x1, x8, #7
 41d72c0: 96f8c6fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d72c4: 17ffff17     	b	0x41d6f20 <_ChromeMain+0x41d1c84>
 41d72c8: b94063e8     	ldr	w8, [sp, #0x60]
 41d72cc: b80086e8     	str	w8, [x23], #0x8
 41d72d0: 910183f3     	add	x19, sp, #0x60
 41d72d4: 91002261     	add	x1, x19, #0x8
 41d72d8: aa1703e0     	mov	x0, x23
 41d72dc: 97108a01     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 41d72e0: 9101e260     	add	x0, x19, #0x78
 41d72e4: d2800001     	mov	x1, #0x0                ; =0
 41d72e8: 96f94274     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d72ec: 9100a260     	add	x0, x19, #0x28
 41d72f0: 96f94262     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d72f4: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 41d72f8: f9402bf9     	ldr	x25, [sp, #0x50]
 41d72fc: 36ffe128     	tbz	w8, #0x1f, 0x41d6f20 <_ChromeMain+0x41d1c84>
 41d7300: f94037e0     	ldr	x0, [sp, #0x68]
 41d7304: f9403fe8     	ldr	x8, [sp, #0x78]
 41d7308: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d730c: 17ffffed     	b	0x41d72c0 <_ChromeMain+0x41d2024>
 41d7310: f94002c8     	ldr	x8, [x22]
 41d7314: cb1b0329     	sub	x9, x25, x27
 41d7318: aa1603fb     	mov	x27, x22
 41d731c: f9400ff9     	ldr	x25, [sp, #0x18]
 41d7320: 52801216     	mov	w22, #0x90              ; =144
 41d7324: a9442fec     	ldp	x12, x11, [sp, #0x40]
 41d7328: 17ffff7e     	b	0x41d7120 <_ChromeMain+0x41d1e84>
 41d732c: 3100051f     	cmn	w8, #0x1
 41d7330: 54ffaea1     	b.ne	0x41d6904 <_ChromeMain+0x41d1668>
 41d7334: d4200000     	brk	#0
 41d7338: d4400000     	hlt	#0
 41d733c: d4200020     	brk	#0x1
 41d7340: d101e3a0     	sub	x0, x29, #0x78
 41d7344: 94000501     	bl	0x41d8748 <_ChromeMain+0x41d34ac>
 41d7348: 17fffd09     	b	0x41d676c <_ChromeMain+0x41d14d0>
 41d734c: 394ba2e9     	ldrb	w9, [x23, #0x2e8]
 41d7350: 34ffac89     	cbz	w9, 0x41d68e0 <_ChromeMain+0x41d1644>
 41d7354: b982b6e9     	ldrsw	x9, [x23, #0x2b4]
 41d7358: 3100053f     	cmn	w9, #0x1
 41d735c: 54000520     	b.eq	0x41d7400 <_ChromeMain+0x41d2164>
 41d7360: f94142ea     	ldr	x10, [x23, #0x280]
 41d7364: eb09015f     	cmp	x10, x9
 41d7368: 54ffc809     	b.ls	0x41d6c68 <_ChromeMain+0x41d19cc>
 41d736c: f9413eea     	ldr	x10, [x23, #0x278]
 41d7370: f8697949     	ldr	x9, [x10, x9, lsl #3]
 41d7374: b9443129     	ldr	w9, [x9, #0x430]
 41d7378: 7100093f     	cmp	w9, #0x2
 41d737c: 54ffab20     	b.eq	0x41d68e0 <_ChromeMain+0x41d1644>
 41d7380: f94136e9     	ldr	x9, [x23, #0x268]
 41d7384: b4000449     	cbz	x9, 0x41d740c <_ChromeMain+0x41d2170>
 41d7388: 39458129     	ldrb	w9, [x9, #0x160]
 41d738c: 3707aaa9     	tbnz	w9, #0x0, 0x41d68e0 <_ChromeMain+0x41d1644>
 41d7390: 17fffd63     	b	0x41d691c <_ChromeMain+0x41d1680>
 41d7394: 394ba2e9     	ldrb	w9, [x23, #0x2e8]
 41d7398: 34ffaa49     	cbz	w9, 0x41d68e0 <_ChromeMain+0x41d1644>
 41d739c: 394d2109     	ldrb	w9, [x8, #0x348]
 41d73a0: 35ffaa09     	cbnz	w9, 0x41d68e0 <_ChromeMain+0x41d1644>
 41d73a4: 17fffd5e     	b	0x41d691c <_ChromeMain+0x41d1680>
 41d73a8: 9774f276     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 41d73ac: 9774f275     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 41d73b0: 9428bb1c     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 41d73b4: f9401b88     	ldr	x8, [x28, #0x30]
 41d73b8: 17fffe6b     	b	0x41d6d64 <_ChromeMain+0x41d1ac8>
 41d73bc: f9401909     	ldr	x9, [x8, #0x30]
 41d73c0: b4ffab49     	cbz	x9, 0x41d6928 <_ChromeMain+0x41d168c>
 41d73c4: 9100a101     	add	x1, x8, #0x28
 41d73c8: 17fffd5b     	b	0x41d6934 <_ChromeMain+0x41d1698>
 41d73cc: 97e24dab     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d73d0: aa0003e1     	mov	x1, x0
 41d73d4: 17fffd58     	b	0x41d6934 <_ChromeMain+0x41d1698>
 41d73d8: f9401909     	ldr	x9, [x8, #0x30]
 41d73dc: b4ffacc9     	cbz	x9, 0x41d6974 <_ChromeMain+0x41d16d8>
 41d73e0: 9100a101     	add	x1, x8, #0x28
 41d73e4: 17fffd67     	b	0x41d6980 <_ChromeMain+0x41d16e4>
 41d73e8: d4200000     	brk	#0
 41d73ec: d4400000     	hlt	#0
 41d73f0: d4200020     	brk	#0x1
 41d73f4: d4200000     	brk	#0
 41d73f8: d4400000     	hlt	#0
 41d73fc: d4200020     	brk	#0x1
 41d7400: d4200000     	brk	#0
 41d7404: d4400000     	hlt	#0
 41d7408: d4200020     	brk	#0x1
 41d740c: d4200000     	brk	#0
 41d7410: d4400000     	hlt	#0
 41d7414: d4200020     	brk	#0x1
 41d7418: 97e24d98     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 41d741c: aa0003e1     	mov	x1, x0
 41d7420: 17fffd58     	b	0x41d6980 <_ChromeMain+0x41d16e4>
