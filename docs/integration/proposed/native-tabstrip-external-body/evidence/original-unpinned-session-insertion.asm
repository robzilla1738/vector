
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4134400:      	stp	x22, x21, [sp, #-0x30]!
 4134404:      	stp	x20, x19, [sp, #0x10]
 4134408:      	stp	x29, x30, [sp, #0x20]
 413440c:      	add	x29, sp, #0x20
 4134410:      	mov	x20, x1
 4134414:      	mov	x19, x0
 4134418:      	cbz	x1, 0x4134428 <_ChromeMain+0x412f18c>
 413441c:      	ldr	x8, [x20, #0x188]
 4134420:      	cmp	x8, x19
 4134424:      	b.ne	0x4134478 <_ChromeMain+0x412f1dc>
 4134428:      	and	x8, x20, #0xfffffffc00000000
 413442c:      	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4134430:      	ldr	x9, [x21, #0x88]
 4134434:      	cmp	x8, x9
 4134438:      	b.ne	0x4134444 <_ChromeMain+0x412f1a8>
 413443c:      	mov	x0, x20
 4134440:      	bl	0x142fc <_ChromeMain+0xf060>
 4134444:      	ldr	x0, [x19, #0x570]
 4134448:      	and	x8, x0, #0xfffffffc00000000
 413444c:      	ldr	x9, [x21, #0x88]
 4134450:      	cmp	x8, x9
 4134454:      	b.ne	0x413445c <_ChromeMain+0x412f1c0>
 4134458:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 413445c:      	str	x20, [x19, #0x570]
 4134460:      	mov	x0, x19
 4134464:      	mov	w1, #0x0                ; =0
 4134468:      	ldp	x29, x30, [sp, #0x20]
 413446c:      	ldp	x20, x19, [sp, #0x10]
 4134470:      	ldp	x22, x21, [sp], #0x30
 4134474:      	b	0x630474 <_ChromeMain+0x62b1d8>
 4134478:      	brk	#0
 413447c:      	hlt	#0
 4134480:      	brk	#0x1
 4134484:      	udf	#0x0
 4134488:      	stp	x20, x19, [sp, #-0x20]!
 413448c:      	stp	x29, x30, [sp, #0x10]
 4134490:      	add	x29, sp, #0x10
 4134494:      	mov	x19, x1
 4134498:      	mov	x20, x0
 413449c:      	ldr	x0, [x1, #0xc0]
 41344a0:      	ldr	x8, [x0]
 41344a4:      	ldr	x8, [x8, #0xc0]
 41344a8:      	movi.2d	v0, #0000000000000000
 41344ac:      	movi.2d	v1, #0000000000000000
 41344b0:      	movi.2d	v2, #0000000000000000
 41344b4:      	movi.2d	v3, #0000000000000000
 41344b8:      	mov	w1, #0x1                ; =1
 41344bc:      	blr	x8
 41344c0:      	mov	x0, x19
 41344c4:      	mov	x1, x20
 41344c8:      	bl	0x412558c <_ChromeMain+0x41202f0>
 41344cc:      	mov	x0, x20
 41344d0:      	mov	x1, x19
 41344d4:      	bl	0x968804 <_ChromeMain+0x963568>
 41344d8:      	mov	x0, x19
 41344dc:      	mov	x1, x20
 41344e0:      	ldp	x29, x30, [sp, #0x10]
 41344e4:      	ldp	x20, x19, [sp], #0x20
 41344e8:      	b	0x4126350 <_ChromeMain+0x41210b4>
 41344ec:      	nop
 41344f0:      	nop
 41344f4:      	nop
 41344f8:      	nop
 41344fc:      	nop
 4134500:      	nop
 4134504:      	nop
 4134508:      	nop
 413450c:      	nop
 4134510:      	stp	x20, x19, [sp, #-0x20]!
 4134514:      	stp	x29, x30, [sp, #0x10]
 4134518:      	add	x29, sp, #0x10
 413451c:      	ldr	x19, [x0, #0x580]
 4134520:      	cbz	x19, 0x4134560 <_ChromeMain+0x412f2c4>
 4134524:      	mov	w8, #0x1                ; =1
 4134528:      	ldadd	w8, w8, [x19]
 413452c:      	cmp	w8, #0x0
 4134530:      	b.le	0x4134580 <_ChromeMain+0x412f2e4>
 4134534:      	mov	w9, #0x7fffffff         ; =2147483647
 4134538:      	cmp	w8, w9
 413453c:      	b.eq	0x413458c <_ChromeMain+0x412f2f0>
