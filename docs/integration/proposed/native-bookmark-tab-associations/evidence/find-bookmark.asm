
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4614538:      	sub	sp, sp, #0x50
 461453c:      	stp	x22, x21, [sp, #0x20]
 4614540:      	stp	x20, x19, [sp, #0x30]
 4614544:      	stp	x29, x30, [sp, #0x40]
 4614548:      	add	x29, sp, #0x40
 461454c:      	ldr	x21, [x0, #0x530]
 4614550:      	cbz	x21, 0x461455c <_ChromeMain+0x460f2c0>
 4614554:      	ldrb	w8, [x21, #0x21]
 4614558:      	cbnz	w8, 0x4614578 <_ChromeMain+0x460f2dc>
 461455c:      	mov	x20, #0x0               ; =0
 4614560:      	mov	x0, x20
 4614564:      	ldp	x29, x30, [sp, #0x40]
 4614568:      	ldp	x20, x19, [sp, #0x30]
 461456c:      	ldp	x22, x21, [sp, #0x20]
 4614570:      	add	sp, sp, #0x50
 4614574:      	ret
 4614578:      	mov	x19, x1
 461457c:      	mov	x8, sp
 4614580:      	add	x8, x8, #0x8
 4614584:      	stp	xzr, xzr, [sp, #0x8]
 4614588:      	str	x8, [sp]
 461458c:      	ldr	x8, [x21, #0x38]
 4614590:      	str	x8, [sp, #0x18]
 4614594:      	cbnz	x8, 0x46145e4 <_ChromeMain+0x460f348>
 4614598:      	mov	x20, #0x0               ; =0
 461459c:      	ldr	x8, [x21, #0x40]
 46145a0:      	str	x8, [sp, #0x18]
 46145a4:      	cbnz	x8, 0x4614638 <_ChromeMain+0x460f39c>
 46145a8:      	ldr	x8, [x21, #0x48]
 46145ac:      	str	x8, [sp, #0x18]
 46145b0:      	cbnz	x8, 0x461460c <_ChromeMain+0x460f370>
 46145b4:      	ldr	x8, [x21, #0x50]
 46145b8:      	cbnz	x8, 0x4614664 <_ChromeMain+0x460f3c8>
 46145bc:      	ldr	x8, [x21, #0x58]
 46145c0:      	cbnz	x8, 0x46146ac <_ChromeMain+0x460f410>
 46145c4:      	ldr	x8, [x21, #0x60]
 46145c8:      	cbnz	x8, 0x46146f4 <_ChromeMain+0x460f458>
 46145cc:      	ldr	x1, [sp, #0x8]
 46145d0:      	mov	x8, sp
 46145d4:      	str	x8, [sp, #0x18]
 46145d8:      	add	x0, sp, #0x18
 46145dc:      	bl	0x8c2154 <_ChromeMain+0x8bceb8>
 46145e0:      	b	0x4614560 <_ChromeMain+0x460f2c4>
 46145e4:      	mov	x0, sp
 46145e8:      	mov	x1, sp
 46145ec:      	add	x2, sp, #0x18
 46145f0:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 46145f4:      	tbz	w1, #0x0, 0x4614598 <_ChromeMain+0x460f2fc>
 46145f8:      	ldr	x0, [sp, #0x18]
 46145fc:      	mov	x1, x19
 4614600:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 4614604:      	mov	x20, x0
 4614608:      	b	0x461459c <_ChromeMain+0x460f300>
 461460c:      	mov	x0, sp
 4614610:      	mov	x1, sp
 4614614:      	add	x2, sp, #0x18
 4614618:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 461461c:      	cbnz	x20, 0x46145b4 <_ChromeMain+0x460f318>
 4614620:      	tbz	w1, #0x0, 0x46145b4 <_ChromeMain+0x460f318>
 4614624:      	ldr	x0, [sp, #0x18]
 4614628:      	mov	x1, x19
 461462c:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 4614630:      	mov	x20, x0
 4614634:      	b	0x46145b4 <_ChromeMain+0x460f318>
 4614638:      	mov	x0, sp
 461463c:      	mov	x1, sp
 4614640:      	add	x2, sp, #0x18
 4614644:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4614648:      	cbnz	x20, 0x46145a8 <_ChromeMain+0x460f30c>
 461464c:      	tbz	w1, #0x0, 0x46145a8 <_ChromeMain+0x460f30c>
 4614650:      	ldr	x0, [sp, #0x18]
 4614654:      	mov	x1, x19
 4614658:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 461465c:      	mov	x20, x0
 4614660:      	b	0x46145a8 <_ChromeMain+0x460f30c>
 4614664:      	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4614668:      	add	x0, x0, #0x288
 461466c:      	bl	0x119280 <_ChromeMain+0x113fe4>
 4614670:      	tbz	w0, #0x0, 0x461473c <_ChromeMain+0x460f4a0>
 4614674:      	ldr	x8, [x21, #0x50]
 4614678:      	str	x8, [sp, #0x18]
 461467c:      	cbz	x8, 0x46145bc <_ChromeMain+0x460f320>
 4614680:      	mov	x0, sp
 4614684:      	mov	x1, sp
 4614688:      	add	x2, sp, #0x18
 461468c:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4614690:      	cbnz	x20, 0x46145bc <_ChromeMain+0x460f320>
 4614694:      	tbz	w1, #0x0, 0x46145bc <_ChromeMain+0x460f320>
 4614698:      	ldr	x0, [sp, #0x18]
 461469c:      	mov	x1, x19
 46146a0:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 46146a4:      	mov	x20, x0
 46146a8:      	b	0x46145bc <_ChromeMain+0x460f320>
 46146ac:      	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 46146b0:      	add	x0, x0, #0x288
 46146b4:      	bl	0x119280 <_ChromeMain+0x113fe4>
 46146b8:      	tbz	w0, #0x0, 0x4614748 <_ChromeMain+0x460f4ac>
 46146bc:      	ldr	x8, [x21, #0x58]
 46146c0:      	str	x8, [sp, #0x18]
 46146c4:      	cbz	x8, 0x46145c4 <_ChromeMain+0x460f328>
 46146c8:      	mov	x0, sp
 46146cc:      	mov	x1, sp
 46146d0:      	add	x2, sp, #0x18
 46146d4:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 46146d8:      	cbnz	x20, 0x46145c4 <_ChromeMain+0x460f328>
 46146dc:      	tbz	w1, #0x0, 0x46145c4 <_ChromeMain+0x460f328>
 46146e0:      	ldr	x0, [sp, #0x18]
 46146e4:      	mov	x1, x19
 46146e8:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 46146ec:      	mov	x20, x0
 46146f0:      	b	0x46145c4 <_ChromeMain+0x460f328>
 46146f4:      	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 46146f8:      	add	x0, x0, #0x288
 46146fc:      	bl	0x119280 <_ChromeMain+0x113fe4>
 4614700:      	tbz	w0, #0x0, 0x4614754 <_ChromeMain+0x460f4b8>
 4614704:      	ldr	x8, [x21, #0x60]
 4614708:      	str	x8, [sp, #0x18]
 461470c:      	cbz	x8, 0x46145cc <_ChromeMain+0x460f330>
 4614710:      	mov	x0, sp
 4614714:      	mov	x1, sp
 4614718:      	add	x2, sp, #0x18
 461471c:      	bl	0x6caa7e0 <_ChromeMain+0x6ca5544>
 4614720:      	cbnz	x20, 0x46145cc <_ChromeMain+0x460f330>
 4614724:      	tbz	w1, #0x0, 0x46145cc <_ChromeMain+0x460f330>
 4614728:      	ldr	x0, [sp, #0x18]
 461472c:      	mov	x1, x19
 4614730:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 4614734:      	mov	x20, x0
 4614738:      	b	0x46145cc <_ChromeMain+0x460f330>
 461473c:      	brk	#0
 4614740:      	hlt	#0
 4614744:      	brk	#0x1
 4614748:      	brk	#0
 461474c:      	hlt	#0
 4614750:      	brk	#0x1
 4614754:      	brk	#0
 4614758:      	hlt	#0
 461475c:      	brk	#0x1
