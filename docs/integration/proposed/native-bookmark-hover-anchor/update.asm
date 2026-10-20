
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 27643c0:      	stp	x24, x23, [sp, #-0x40]!
 27643c4:      	stp	x22, x21, [sp, #0x10]
 27643c8:      	stp	x20, x19, [sp, #0x20]
 27643cc:      	stp	x29, x30, [sp, #0x30]
 27643d0:      	add	x29, sp, #0x30
 27643d4:      	mov	x19, x0
 27643d8:      	ldr	w8, [x0, #0x114]
 27643dc:      	mov	w9, #0x3                ; =3
 27643e0:      	cmp	w8, #0x0
 27643e4:      	csel	w20, w9, w2, gt
 27643e8:      	ccmp	x1, #0x0, #0x4, le
 27643ec:      	b.eq	0x2764410 <_ChromeMain+0x275f174>
 27643f0:      	mov	x21, x1
 27643f4:      	ldr	x8, [x1]
 27643f8:      	ldr	x8, [x8, #0x18]
 27643fc:      	mov	x0, x1
 2764400:      	blr	x8
 2764404:      	cmp	w0, #0x0
 2764408:      	csel	x21, x21, xzr, ne
 276440c:      	b	0x2764414 <_ChromeMain+0x275f178>
 2764410:      	mov	x21, #0x0               ; =0
 2764414:      	ldr	x8, [x19, #0x30]
 2764418:      	cmp	x8, x21
 276441c:      	b.eq	0x27644f8 <_ChromeMain+0x275f25c>
 2764420:      	add	x0, x19, #0x118
 2764424:      	bl	0x72e718 <_ChromeMain+0x72947c>
 2764428:      	ldr	x22, [x19, #0x68]
 276442c:      	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2764430:      	cbz	x22, 0x276445c <_ChromeMain+0x275f1c0>
 2764434:      	str	xzr, [x19, #0x68]
 2764438:      	ldr	x1, [x19, #0x60]
 276443c:      	add	x0, x22, #0x130
 2764440:      	bl	0x54fb34 <_ChromeMain+0x54a898>
 2764444:      	and	x8, x22, #0xfffffffc00000000
 2764448:      	ldr	x9, [x23, #0x88]
 276444c:      	cmp	x8, x9
 2764450:      	b.ne	0x276445c <_ChromeMain+0x275f1c0>
 2764454:      	mov	x0, x22
 2764458:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 276445c:      	cbz	x21, 0x27644c4 <_ChromeMain+0x275f228>
 2764460:      	ldr	x8, [x19, #0x30]
 2764464:      	cmp	x8, #0x0
 2764468:      	cset	w8, ne
 276446c:      	strb	w8, [x19, #0x20]
 2764470:      	ldr	x8, [x21]
 2764474:      	ldr	x8, [x8, #0x40]
 2764478:      	mov	x0, x21
 276447c:      	blr	x8
 2764480:      	mov	x22, x0
 2764484:      	and	x8, x0, #0xfffffffc00000000
 2764488:      	ldr	x9, [x23, #0x88]
 276448c:      	cmp	x8, x9
 2764490:      	b.ne	0x276449c <_ChromeMain+0x275f200>
 2764494:      	mov	x0, x22
 2764498:      	bl	0x142fc <_ChromeMain+0xf060>
 276449c:      	ldr	x0, [x19, #0x68]
 27644a0:      	and	x8, x0, #0xfffffffc00000000
 27644a4:      	ldr	x9, [x23, #0x88]
 27644a8:      	cmp	x8, x9
 27644ac:      	b.eq	0x27645c8 <_ChromeMain+0x275f32c>
 27644b0:      	str	x22, [x19, #0x68]
 27644b4:      	ldr	x1, [x19, #0x60]
 27644b8:      	cbz	x1, 0x27645d0 <_ChromeMain+0x275f334>
 27644bc:      	add	x0, x22, #0x130
 27644c0:      	bl	0x473340 <_ChromeMain+0x46e0a4>
 27644c4:      	and	x8, x21, #0xfffffffc00000000
 27644c8:      	ldr	x9, [x23, #0x88]
 27644cc:      	cmp	x8, x9
 27644d0:      	b.ne	0x27644dc <_ChromeMain+0x275f240>
 27644d4:      	mov	x0, x21
 27644d8:      	bl	0x142fc <_ChromeMain+0xf060>
 27644dc:      	ldr	x0, [x19, #0x30]
 27644e0:      	and	x8, x0, #0xfffffffc00000000
 27644e4:      	ldr	x9, [x23, #0x88]
 27644e8:      	cmp	x8, x9
 27644ec:      	b.ne	0x27644f4 <_ChromeMain+0x275f258>
 27644f0:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 27644f4:      	str	x21, [x19, #0x30]
 27644f8:      	ldr	x8, [x19, #0x48]
 27644fc:      	cbnz	x8, 0x2764544 <_ChromeMain+0x275f2a8>
 2764500:      	cbz	x21, 0x2764518 <_ChromeMain+0x275f27c>
 2764504:      	ldr	x0, [x19, #0x38]
 2764508:      	ldr	x8, [x0]
 276450c:      	ldr	x8, [x8, #0x68]
 2764510:      	blr	x8
 2764514:      	cbnz	x0, 0x276452c <_ChromeMain+0x275f290>
 2764518:      	ldp	x29, x30, [sp, #0x30]
 276451c:      	ldp	x20, x19, [sp, #0x20]
 2764520:      	ldp	x22, x21, [sp, #0x10]
 2764524:      	ldp	x24, x23, [sp], #0x40
 2764528:      	ret
 276452c:      	ldr	x0, [x19, #0x38]
 2764530:      	ldr	x8, [x0]
 2764534:      	ldr	x8, [x8, #0x68]
 2764538:      	blr	x8
 276453c:      	bl	0xa6e3230 <_ChromeMain+0xa6ddf94>
 2764540:      	cbz	w0, 0x2764518 <_ChromeMain+0x275f27c>
 2764544:      	cbz	w20, 0x2764590 <_ChromeMain+0x275f2f4>
 2764548:      	cmp	w20, #0x5
 276454c:      	b.ne	0x2764574 <_ChromeMain+0x275f2d8>
 2764550:      	mov	x22, x19
 2764554:      	ldr	x0, [x22, #0x78]!
 2764558:      	and	x8, x0, #0xfffffffc00000000
 276455c:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2764560:      	ldr	x9, [x9, #0x88]
 2764564:      	cmp	x8, x9
 2764568:      	b.ne	0x2764570 <_ChromeMain+0x275f2d4>
 276456c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2764570:      	stp	xzr, xzr, [x22]
 2764574:      	cbnz	x21, 0x27645a8 <_ChromeMain+0x275f30c>
 2764578:      	mov	x0, x19
 276457c:      	ldp	x29, x30, [sp, #0x30]
 2764580:      	ldp	x20, x19, [sp, #0x20]
 2764584:      	ldp	x22, x21, [sp, #0x10]
 2764588:      	ldp	x24, x23, [sp], #0x40
 276458c:      	b	0xa763400 <_ChromeMain+0xa75e164>
 2764590:      	cbnz	x21, 0x27645a8 <_ChromeMain+0x275f30c>
 2764594:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 2764598:      	ldr	x8, [x8, #0xd18]
 276459c:      	blr	x8
 27645a0:      	str	x0, [x19, #0x28]
 27645a4:      	b	0x2764578 <_ChromeMain+0x275f2dc>
 27645a8:      	mov	x0, x19
 27645ac:      	mov	x1, x21
 27645b0:      	mov	x2, x20
 27645b4:      	ldp	x29, x30, [sp, #0x30]
 27645b8:      	ldp	x20, x19, [sp, #0x20]
 27645bc:      	ldp	x22, x21, [sp, #0x10]
 27645c0:      	ldp	x24, x23, [sp], #0x40
 27645c4:      	b	0xa76340c <_ChromeMain+0xa75e170>
 27645c8:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 27645cc:      	b	0x27644b0 <_ChromeMain+0x275f214>
 27645d0:      	brk	#0
 27645d4:      	hlt	#0
