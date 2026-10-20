
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620488:      	ldrb	w8, [x0, #0x1e9]
 462048c:      	tbz	w8, #0x0, 0x4620590 <_ChromeMain+0x461b2f4>
 4620490:      	sub	sp, sp, #0x40
 4620494:      	stp	d9, d8, [sp, #0x10]
 4620498:      	stp	x20, x19, [sp, #0x20]
 462049c:      	stp	x29, x30, [sp, #0x30]
 46204a0:      	add	x29, sp, #0x30
 46204a4:      	mov	x19, x0
 46204a8:      	mov	x1, sp
 46204ac:      	bl	0x1428754 <_ChromeMain+0x14234b8>
 46204b0:      	ldr	x0, [x19, #0x438]
 46204b4:      	cbz	x0, 0x462057c <_ChromeMain+0x461b2e0>
 46204b8:      	ldrb	w8, [x0, #0x1c8]
 46204bc:      	cbz	w8, 0x462057c <_ChromeMain+0x461b2e0>
 46204c0:      	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46204c4:      	add	x1, x1, #0x14
 46204c8:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 46204cc:      	mov	x20, x0
 46204d0:      	dup.2d	v0, x0
 46204d4:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46204d8:      	ldr	q1, [x8, #0x40]
 46204dc:      	ushl.2d	v0, v0, v1
 46204e0:      	xtn.2s	v8, v0
 46204e4:      	mov	w0, #0x24               ; =36
 46204e8:      	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46204ec:      	sub	w8, w20, w0
 46204f0:      	add	w8, w8, w8, lsr #31
 46204f4:      	asr	w9, w8, #1
 46204f8:      	bic	w8, w9, w8, asr #31
 46204fc:      	ldr	w9, [x19, #0x1c0]
 4620500:      	sub	w9, w9, w20
 4620504:      	add	w8, w9, w8
 4620508:      	sub	w8, w8, #0x8
 462050c:      	fmov	s0, w8
 4620510:      	ldr	w9, [x19, #0x1c4]
 4620514:      	sub	x9, x9, x20, lsr #32
 4620518:      	add	w9, w9, w9, lsr #31
 462051c:      	asr	w9, w9, #1
 4620520:      	ldr	x0, [x19, #0x438]
 4620524:      	mov.s	v0[1], w9
 4620528:      	stp	w8, w9, [sp]
 462052c:      	sqadd.2s	v1, v0, v8
 4620530:      	sqsub.2s	v0, v1, v0
 4620534:      	movi.2d	v1, #0000000000000000
 4620538:      	smax.2s	v0, v0, v1
 462053c:      	str	d0, [sp, #0x8]
 4620540:      	cbz	x0, 0x462057c <_ChromeMain+0x461b2e0>
 4620544:      	ldr	w10, [x0, #0x1b8]
 4620548:      	ldr	w11, [x0, #0x1bc]
 462054c:      	cmp	w10, w8
 4620550:      	ccmp	w11, w9, #0x0, eq
 4620554:      	b.ne	0x4620574 <_ChromeMain+0x461b2d8>
 4620558:      	ldr	w8, [x0, #0x1c0]
 462055c:      	fmov	w9, s0
 4620560:      	ldr	w10, [x0, #0x1c4]
 4620564:      	mov.s	w11, v0[1]
 4620568:      	cmp	w8, w9
 462056c:      	ccmp	w10, w11, #0x0, eq
 4620570:      	b.eq	0x462057c <_ChromeMain+0x461b2e0>
 4620574:      	mov	x1, sp
 4620578:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 462057c:      	ldp	x29, x30, [sp, #0x30]
 4620580:      	ldp	x20, x19, [sp, #0x20]
 4620584:      	ldp	d9, d8, [sp, #0x10]
 4620588:      	add	sp, sp, #0x40
 462058c:      	ret
 4620590:      	brk	#0
 4620594:      	hlt	#0
 4620598:      	brk	#0x1
