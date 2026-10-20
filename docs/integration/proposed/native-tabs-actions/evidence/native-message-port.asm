
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467938c:      	sub	sp, sp, #0x40
 4679390:      	stp	x20, x19, [sp, #0x20]
 4679394:      	stp	x29, x30, [sp, #0x30]
 4679398:      	add	x29, sp, #0x30
 467939c:      	ldr	x19, [x0, #0x88]
 46793a0:      	str	xzr, [x0, #0x88]
 46793a4:      	ldr	x8, [x0, #0x8]
 46793a8:      	cbz	x8, 0x46793bc <_ChromeMain+0x4674120>
 46793ac:      	ldapurb	w8, [x8, #0x4]
 46793b0:      	cbnz	w8, 0x46793bc <_ChromeMain+0x4674120>
 46793b4:      	ldr	x8, [x0, #0x10]
 46793b8:      	cbnz	x8, 0x46793fc <_ChromeMain+0x4674160>
 46793bc:      	cbnz	x19, 0x46793d0 <_ChromeMain+0x4674134>
 46793c0:      	ldp	x29, x30, [sp, #0x30]
 46793c4:      	ldp	x20, x19, [sp, #0x20]
 46793c8:      	add	sp, sp, #0x40
 46793cc:      	ret
 46793d0:      	ldr	x8, [x19, #0x8]
 46793d4:      	mov	x0, x19
 46793d8:      	blr	x8
 46793dc:      	mov	w8, #-0x1               ; =-1
 46793e0:      	ldaddal	w8, w8, [x19]
 46793e4:      	cmp	w8, #0x1
 46793e8:      	b.ne	0x46793c0 <_ChromeMain+0x4674124>
 46793ec:      	ldr	x8, [x19, #0x10]
 46793f0:      	mov	x0, x19
 46793f4:      	blr	x8
 46793f8:      	b	0x46793c0 <_ChromeMain+0x4674124>
 46793fc:      	ldr	x8, [x0, #0x8]
 4679400:      	cbz	x8, 0x4679458 <_ChromeMain+0x46741bc>
 4679404:      	ldapurb	w8, [x8, #0x4]
 4679408:      	cbnz	w8, 0x4679458 <_ChromeMain+0x46741bc>
 467940c:      	ldr	x8, [x0, #0x10]
 4679410:      	stp	xzr, xzr, [sp, #0x8]
 4679414:      	str	xzr, [sp, #0x18]
 4679418:      	sub	x8, x8, #0x8
 467941c:      	add	x1, x0, #0x18
 4679420:      	add	x6, sp, #0x8
 4679424:      	mov	x0, x8
 4679428:      	mov	w2, #-0x1               ; =-1
 467942c:      	mov	w3, #-0x2               ; =-2
 4679430:      	mov	w4, #0x0                ; =0
 4679434:      	mov	w5, #0x1                ; =1
 4679438:      	bl	0x6e49704 <_ChromeMain+0x6e44468>
 467943c:      	ldrsb	w8, [sp, #0x1f]
 4679440:      	tbz	w8, #0x1f, 0x46793bc <_ChromeMain+0x4674120>
 4679444:      	ldr	x0, [sp, #0x8]
 4679448:      	ldr	x8, [sp, #0x18]
 467944c:      	and	x1, x8, #0x7fffffffffffffff
 4679450:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4679454:      	b	0x46793bc <_ChromeMain+0x4674120>
 4679458:      	brk	#0
 467945c:      	hlt	#0
 4679460:      	brk	#0x1
 4679464:      	stp	x20, x19, [sp, #-0x20]!
 4679468:      	stp	x29, x30, [sp, #0x10]
 467946c:      	add	x29, sp, #0x10
 4679470:      	mov	x19, x0
 4679474:      	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 4679478:      	add	x8, x8, #0x180
 467947c:      	str	x8, [x0], #0x90
 4679480:      	bl	0xa9b688 <_ChromeMain+0xa963ec>
 4679484:      	ldr	x20, [x19, #0x88]
 4679488:      	cbnz	x20, 0x467949c <_ChromeMain+0x4674200>
 467948c:      	mov	x0, x19
 4679490:      	ldp	x29, x30, [sp, #0x10]
 4679494:      	ldp	x20, x19, [sp], #0x20
 4679498:      	b	0x6e46aac <_ChromeMain+0x6e41810>
 467949c:      	str	xzr, [x19, #0x88]
 46794a0:      	ldr	x8, [x20, #0x8]
 46794a4:      	mov	x0, x20
 46794a8:      	blr	x8
 46794ac:      	mov	w8, #-0x1               ; =-1
 46794b0:      	ldaddal	w8, w8, [x20]
 46794b4:      	cmp	w8, #0x1
 46794b8:      	b.ne	0x46794c8 <_ChromeMain+0x467422c>
 46794bc:      	ldr	x8, [x20, #0x10]
 46794c0:      	mov	x0, x20
 46794c4:      	blr	x8
 46794c8:      	ldr	x0, [x19, #0x88]
 46794cc:      	cbz	x0, 0x467948c <_ChromeMain+0x46741f0>
 46794d0:      	mov	w8, #-0x1               ; =-1
 46794d4:      	ldaddal	w8, w8, [x0]
 46794d8:      	cmp	w8, #0x1
 46794dc:      	b.ne	0x467948c <_ChromeMain+0x46741f0>
 46794e0:      	ldr	x8, [x0, #0x10]
 46794e4:      	blr	x8
 46794e8:      	b	0x467948c <_ChromeMain+0x46741f0>
 46794ec:      	stp	x20, x19, [sp, #-0x20]!
 46794f0:      	stp	x29, x30, [sp, #0x10]
 46794f4:      	add	x29, sp, #0x10
 46794f8:      	mov	x19, x0
 46794fc:      	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 4679500:      	add	x8, x8, #0x180
 4679504:      	str	x8, [x0], #0x90
 4679508:      	bl	0xa9b688 <_ChromeMain+0xa963ec>
 467950c:      	ldr	x20, [x19, #0x88]
 4679510:      	cbnz	x20, 0x467952c <_ChromeMain+0x4674290>
 4679514:      	mov	x0, x19
 4679518:      	bl	0x6e46aac <_ChromeMain+0x6e41810>
 467951c:      	mov	w1, #0xf0               ; =240
 4679520:      	ldp	x29, x30, [sp, #0x10]
 4679524:      	ldp	x20, x19, [sp], #0x20
 4679528:      	b	0x8eb8 <_ChromeMain+0x3c1c>
 467952c:      	str	xzr, [x19, #0x88]
 4679530:      	ldr	x8, [x20, #0x8]
 4679534:      	mov	x0, x20
 4679538:      	blr	x8
 467953c:      	mov	w8, #-0x1               ; =-1
 4679540:      	ldaddal	w8, w8, [x20]
 4679544:      	cmp	w8, #0x1
 4679548:      	b.ne	0x4679558 <_ChromeMain+0x46742bc>
 467954c:      	ldr	x8, [x20, #0x10]
 4679550:      	mov	x0, x20
 4679554:      	blr	x8
 4679558:      	ldr	x0, [x19, #0x88]
 467955c:      	cbz	x0, 0x4679514 <_ChromeMain+0x4674278>
 4679560:      	mov	w8, #-0x1               ; =-1
 4679564:      	ldaddal	w8, w8, [x0]
 4679568:      	cmp	w8, #0x1
 467956c:      	b.ne	0x4679514 <_ChromeMain+0x4674278>
 4679570:      	ldr	x8, [x0, #0x10]
 4679574:      	blr	x8
 4679578:      	b	0x4679514 <_ChromeMain+0x4674278>
 467957c:      	b	0x467938c <_ChromeMain+0x46740f0>
