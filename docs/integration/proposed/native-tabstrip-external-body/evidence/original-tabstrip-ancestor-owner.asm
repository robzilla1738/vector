
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4125380:      	stp	x20, x19, [sp, #-0x20]!
 4125384:      	stp	x29, x30, [sp, #0x10]
 4125388:      	add	x29, sp, #0x10
 412538c:      	ldr	x19, [x0, #0x188]
 4125390:      	cbz	x19, 0x412542c <_ChromeMain+0x4120190>
 4125394:      	ldr	x8, [x19]
 4125398:      	ldr	x8, [x8, #0x58]
 412539c:      	mov	x0, x19
 41253a0:      	blr	x8
 41253a4:      	mov	x20, x0
 41253a8:      	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 41253ac:      	cmp	x20, #0x0
 41253b0:      	cset	w8, ne
 41253b4:      	cmp	x20, x0
 41253b8:      	ccmp	x20, #0x0, #0x4, ne
 41253bc:      	b.eq	0x41253d4 <_ChromeMain+0x4120138>
 41253c0:      	ldr	x20, [x20, #0x48]
 41253c4:      	cmp	x20, #0x0
 41253c8:      	cset	w8, ne
 41253cc:      	ccmp	x20, x0, #0x4, ne
 41253d0:      	b.ne	0x41253c0 <_ChromeMain+0x4120124>
 41253d4:      	tbnz	w8, #0x0, 0x412542c <_ChromeMain+0x4120190>
 41253d8:      	ldr	x8, [x19]
 41253dc:      	ldr	x8, [x8, #0x58]
 41253e0:      	mov	x0, x19
 41253e4:      	blr	x8
 41253e8:      	mov	x20, x0
 41253ec:      	bl	0x789e0f0 <_ChromeMain+0x7898e54>
 41253f0:      	cmp	x20, #0x0
 41253f4:      	cset	w8, ne
 41253f8:      	cmp	x20, x0
 41253fc:      	ccmp	x20, #0x0, #0x4, ne
 4125400:      	b.eq	0x4125418 <_ChromeMain+0x412017c>
 4125404:      	ldr	x20, [x20, #0x48]
 4125408:      	cmp	x20, #0x0
 412540c:      	cset	w8, ne
 4125410:      	ccmp	x20, x0, #0x4, ne
 4125414:      	b.ne	0x4125404 <_ChromeMain+0x4120168>
 4125418:      	cbz	w8, 0x4125424 <_ChromeMain+0x4120188>
 412541c:      	ldr	x8, [x19, #0x570]
 4125420:      	cbnz	x8, 0x412543c <_ChromeMain+0x41201a0>
 4125424:      	ldr	x19, [x19, #0x188]
 4125428:      	cbnz	x19, 0x4125394 <_ChromeMain+0x41200f8>
 412542c:      	mov	x0, x19
 4125430:      	ldp	x29, x30, [sp, #0x10]
 4125434:      	ldp	x20, x19, [sp], #0x20
 4125438:      	ret
 412543c:      	mov	x19, x8
 4125440:      	b	0x412542c <_ChromeMain+0x4120190>
 4125444:      	nop
 4125448:      	nop
 412544c:      	nop
 4125450:      	nop
 4125454:      	nop
 4125458:      	nop
 412545c:      	nop
 4125460:      	nop
 4125464:      	nop
 4125468:      	nop
 412546c:      	nop
 4125470:      	nop
 4125474:      	nop
		...
 4125480:      	stp	d9, d8, [sp, #-0x30]!
 4125484:      	stp	x20, x19, [sp, #0x10]
 4125488:      	stp	x29, x30, [sp, #0x20]
 412548c:      	add	x29, sp, #0x20
 4125490:      	movi.2d	v8, #0000000000000000
 4125494:      	cbz	x0, 0x41254a4 <_ChromeMain+0x4120208>
 4125498:      	mov	x19, x0
 412549c:      	ldrb	w8, [x0, #0x1c8]
 41254a0:      	cbnz	w8, 0x41254b8 <_ChromeMain+0x412021c>
 41254a4:      	mov.16b	v0, v8
 41254a8:      	ldp	x29, x30, [sp, #0x20]
 41254ac:      	ldp	x20, x19, [sp, #0x10]
 41254b0:      	ldp	d9, d8, [sp], #0x30
 41254b4:      	ret
 41254b8:      	ldr	x8, [x19]
 41254bc:      	ldr	x8, [x8, #0x58]
 41254c0:      	mov	x0, x19
 41254c4:      	blr	x8
 41254c8:      	mov	x20, x0
 41254cc:      	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 41254d0:      	cmp	x20, #0x0
 41254d4:      	cset	w8, ne
 41254d8:      	cmp	x20, x0
 41254dc:      	ccmp	x20, #0x0, #0x4, ne
 41254e0:      	b.eq	0x41254f8 <_ChromeMain+0x412025c>
 41254e4:      	ldr	x20, [x20, #0x48]
 41254e8:      	cmp	x20, #0x0
 41254ec:      	cset	w8, ne
 41254f0:      	ccmp	x20, x0, #0x4, ne
 41254f4:      	b.ne	0x41254e4 <_ChromeMain+0x4120248>
 41254f8:      	cbz	w8, 0x4125510 <_ChromeMain+0x4120274>
 41254fc:      	mov	x0, x19
 4125500:      	ldp	x29, x30, [sp, #0x20]
 4125504:      	ldp	x20, x19, [sp, #0x10]
 4125508:      	ldp	d9, d8, [sp], #0x30
 412550c:      	b	0x412c9f0 <_ChromeMain+0x4127754>
 4125510:      	ldr	x8, [x19]
 4125514:      	ldr	x8, [x8, #0x58]
 4125518:      	mov	x0, x19
 412551c:      	blr	x8
 4125520:      	mov	x20, x0
 4125524:      	bl	0x78a7a44 <_ChromeMain+0x78a27a8>
 4125528:      	cmp	x20, #0x0
 412552c:      	cset	w8, ne
 4125530:      	cmp	x20, x0
 4125534:      	ccmp	x20, #0x0, #0x4, ne
 4125538:      	b.eq	0x4125550 <_ChromeMain+0x41202b4>
 412553c:      	ldr	x20, [x20, #0x48]
 4125540:      	cmp	x20, #0x0
 4125544:      	cset	w8, ne
 4125548:      	ccmp	x20, x0, #0x4, ne
 412554c:      	b.ne	0x412553c <_ChromeMain+0x41202a0>
 4125550:      	cmp	w8, #0x0
 4125554:      	movi.2d	v0, #0000000000000000
 4125558:      	fmov	s1, #8.00000000
 412555c:      	fcsel	s8, s1, s0, ne
 4125560:      	ldr	x8, [x19, #0x198]
 4125564:      	lsl	x20, x8, #3
 4125568:      	cbz	x20, 0x41254a4 <_ChromeMain+0x4120208>
 412556c:      	ldr	x19, [x19, #0x190]
 4125570:      	ldr	x0, [x19], #0x8
 4125574:      	bl	0x4125480 <_ChromeMain+0x41201e4>
 4125578:      	fcmp	s8, s0
 412557c:      	fcsel	s8, s0, s8, mi
 4125580:      	subs	x20, x20, #0x8
 4125584:      	b.ne	0x4125570 <_ChromeMain+0x41202d4>
 4125588:      	b	0x41254a4 <_ChromeMain+0x4120208>
