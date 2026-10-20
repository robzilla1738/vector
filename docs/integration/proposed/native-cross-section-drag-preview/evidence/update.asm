
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4651140:      	sub	sp, sp, #0xd0
 4651144:      	stp	d11, d10, [sp, #0x60]
 4651148:      	stp	d9, d8, [sp, #0x70]
 465114c:      	stp	x26, x25, [sp, #0x80]
 4651150:      	stp	x24, x23, [sp, #0x90]
 4651154:      	stp	x22, x21, [sp, #0xa0]
 4651158:      	stp	x20, x19, [sp, #0xb0]
 465115c:      	stp	x29, x30, [sp, #0xc0]
 4651160:      	add	x29, sp, #0xc0
 4651164:      	mov	x20, x5
 4651168:      	mov	x19, x4
 465116c:      	mov	x24, x3
 4651170:      	mov	x21, x2
 4651174:      	mov	x22, x1
 4651178:      	mov	x23, x0
 465117c:      	ldrb	w8, [x0, #0xa08]
 4651180:      	cbz	w8, 0x465118c <_ChromeMain+0x464bef0>
 4651184:      	ldr	x8, [x23, #0xca0]
 4651188:      	cbz	x8, 0x46514f8 <_ChromeMain+0x464c25c>
 465118c:      	mov	x0, x23
 4651190:      	bl	0x4634874 <_ChromeMain+0x462f5d8>
 4651194:      	ldr	x8, [x23, #0x6b8]
 4651198:      	cbz	x8, 0x4651458 <_ChromeMain+0x464c1bc>
 465119c:      	mov	x0, x23
 46511a0:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 46511a4:      	ldr	q0, [x24]
 46511a8:      	str	q0, [sp, #0x20]
 46511ac:      	dup.2d	v1, x0
 46511b0:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46511b4:      	ldr	q2, [x8, #0x40]
 46511b8:      	ushl.2d	v1, v1, v2
 46511bc:      	xtn.2s	v1, v1
 46511c0:      	neg.2s	v1, v1
 46511c4:      	movi.2d	v3, #0000000000000000
 46511c8:      	sqadd.2s	v0, v0, v1
 46511cc:      	ldr	d2, [sp, #0x28]
 46511d0:      	sqadd.2s	v2, v0, v2
 46511d4:      	sqsub.2s	v2, v2, v0
 46511d8:      	smax.2s	v2, v2, v3
 46511dc:      	stp	d0, d2, [sp, #0x20]
 46511e0:      	ldp	d2, d0, [x19]
 46511e4:      	sqadd.2s	v1, v2, v1
 46511e8:      	ldr	x19, [x23, #0x6b8]
 46511ec:      	ldr	x0, [x19, #0x320]
 46511f0:      	ldr	x10, [x0, #0x358]
 46511f4:      	ldrsb	x8, [x10, #0x2f]
 46511f8:      	tbnz	x8, #0x3f, 0x465124c <_ChromeMain+0x464bfb0>
 46511fc:      	add	x9, x10, #0x18
 4651200:      	sqadd.2s	v8, v1, v0
 4651204:      	ldrb	w10, [x22, #0x17]
 4651208:      	sxtb	w11, w10
 465120c:      	ldp	x12, x13, [x22]
 4651210:      	cmp	w11, #0x0
 4651214:      	csel	x2, x13, x10, mi
 4651218:      	csel	x1, x12, x22, mi
 465121c:      	cmp	x8, x2
 4651220:      	str	q1, [sp, #0x10]
 4651224:      	b.ne	0x4651254 <_ChromeMain+0x464bfb8>
 4651228:      	cbz	x8, 0x4651264 <_ChromeMain+0x464bfc8>
 465122c:      	mov	x10, x1
 4651230:      	ldrh	w11, [x9], #0x2
 4651234:      	ldrh	w12, [x10], #0x2
 4651238:      	cmp	w12, w11
 465123c:      	b.ne	0x4651254 <_ChromeMain+0x464bfb8>
 4651240:      	subs	x8, x8, #0x1
 4651244:      	b.ne	0x4651230 <_ChromeMain+0x464bf94>
 4651248:      	b	0x4651264 <_ChromeMain+0x464bfc8>
 465124c:      	ldp	x9, x8, [x10, #0x18]
 4651250:      	b	0x4651200 <_ChromeMain+0x464bf64>
 4651254:      	ldr	x8, [x0]
 4651258:      	ldr	x8, [x8, #0x3e0]
 465125c:      	blr	x8
 4651260:      	ldr	q1, [sp, #0x10]
 4651264:      	sqsub.2s	v8, v8, v1
 4651268:      	ldr	x8, [x19, #0x318]
 465126c:      	strb	wzr, [sp, #0x38]
 4651270:      	mov	w9, #0xff               ; =255
 4651274:      	strb	w9, [sp, #0x58]
 4651278:      	add	x0, sp, #0x38
 465127c:      	add	x1, x8, #0x348
 4651280:      	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4651284:      	ldrb	w22, [sp, #0x58]
 4651288:      	ldrb	w23, [x21, #0x20]
 465128c:      	cmp	w22, #0xff
 4651290:      	ccmp	w23, w22, #0x0, ne
 4651294:      	b.ne	0x4651354 <_ChromeMain+0x464c0b8>
 4651298:      	ldr	x23, [sp, #0x38]
 465129c:      	ldr	x24, [x21]
 46512a0:      	cbz	w22, 0x46512c0 <_ChromeMain+0x464c024>
 46512a4:      	cmp	w22, #0x1
 46512a8:      	b.eq	0x4651340 <_ChromeMain+0x464c0a4>
 46512ac:      	cmp	x23, x24
 46512b0:      	b.eq	0x465131c <_ChromeMain+0x464c080>
 46512b4:      	add	x0, sp, #0x38
 46512b8:      	bl	0x846840 <_ChromeMain+0x8415a4>
 46512bc:      	b	0x4651364 <_ChromeMain+0x464c0c8>
 46512c0:      	cmp	x23, x24
 46512c4:      	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 46512c8:      	ldr	w8, [sp, #0x40]
 46512cc:      	ldr	w9, [x21, #0x8]
 46512d0:      	cmp	w8, w9
 46512d4:      	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 46512d8:      	ldrb	w8, [sp, #0x48]
 46512dc:      	ldrb	w9, [x21, #0x10]
 46512e0:      	cmp	w8, #0xff
 46512e4:      	b.eq	0x46515a0 <_ChromeMain+0x464c304>
 46512e8:      	cmp	w9, w8
 46512ec:      	b.ne	0x46515a0 <_ChromeMain+0x464c304>
 46512f0:      	ldr	w8, [sp, #0x44]
 46512f4:      	ldr	w9, [x21, #0xc]
 46512f8:      	cmp	w8, w9
 46512fc:      	b.ne	0x46512b4 <_ChromeMain+0x464c018>
 4651300:      	ldr	x22, [sp, #0x50]
 4651304:      	ldr	x23, [x21, #0x18]
 4651308:      	add	x0, sp, #0x38
 465130c:      	bl	0x846840 <_ChromeMain+0x8415a4>
 4651310:      	cmp	x22, x23
 4651314:      	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651318:      	b	0x4651370 <_ChromeMain+0x464c0d4>
 465131c:      	ldp	w24, w22, [sp, #0x40]
 4651320:      	ldp	w25, w23, [x21, #0x8]
 4651324:      	add	x0, sp, #0x38
 4651328:      	bl	0x846840 <_ChromeMain+0x8415a4>
 465132c:      	cmp	w24, w25
 4651330:      	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651334:      	cmp	w22, w23
 4651338:      	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 465133c:      	b	0x4651370 <_ChromeMain+0x464c0d4>
 4651340:      	add	x0, sp, #0x38
 4651344:      	bl	0x846840 <_ChromeMain+0x8415a4>
 4651348:      	cmp	x23, x24
 465134c:      	b.ne	0x4651364 <_ChromeMain+0x464c0c8>
 4651350:      	b	0x4651370 <_ChromeMain+0x464c0d4>
 4651354:      	add	x0, sp, #0x38
 4651358:      	bl	0x846840 <_ChromeMain+0x8415a4>
 465135c:      	cmp	w23, w22
 4651360:      	b.eq	0x4651370 <_ChromeMain+0x464c0d4>
 4651364:      	ldr	x0, [x19, #0x318]
 4651368:      	mov	x1, x21
 465136c:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4651370:      	movi.2d	v0, #0000000000000000
 4651374:      	smax.2s	v1, v8, v0
 4651378:      	cmp	w20, #0x0
 465137c:      	fmov	d9, #1.00000000
 4651380:      	movi.2d	v10, #0000000000000000
 4651384:      	fcsel	d8, d10, d9, ne
 4651388:      	ldrb	w8, [x19, #0x1c8]
 465138c:      	tbnz	w8, #0x0, 0x4651484 <_ChromeMain+0x464c1e8>
 4651390:      	ldr	x8, [x19]
 4651394:      	ldr	x8, [x8, #0xa0]
 4651398:      	mov	x0, x19
 465139c:      	mov	w1, #0x1                ; =1
 46513a0:      	str	q1, [sp]
 46513a4:      	blr	x8
 46513a8:      	add	x1, sp, #0x20
 46513ac:      	mov	x0, x19
 46513b0:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46513b4:      	ldp	q1, q2, [sp]
 46513b8:      	cmp	w20, #0x0
 46513bc:      	fcsel	d0, d9, d10, ne
 46513c0:      	str	d0, [x19, #0x3e0]
 46513c4:      	add	x8, x19, #0x1b8
 46513c8:      	mov.d	v2[1], v1[0]
 46513cc:      	ldr	q1, [x8]
 46513d0:      	stp	q1, q2, [x19, #0x3b0]
 46513d4:      	str	d0, [x19, #0x3d0]
 46513d8:      	str	d8, [x19, #0x3d8]
 46513dc:      	ldrb	w8, [x19, #0x380]
 46513e0:      	cbnz	w8, 0x4651598 <_ChromeMain+0x464c2fc>
 46513e4:      	str	xzr, [x19, #0x398]
 46513e8:      	ldrb	w8, [x19, #0x338]
 46513ec:      	cbnz	w8, 0x4651534 <_ChromeMain+0x464c298>
 46513f0:      	add	x0, x19, #0x328
 46513f4:      	mov	w1, #0x0                ; =0
 46513f8:      	bl	0x239e964 <_ChromeMain+0x23996c8>
 46513fc:      	ldr	x8, [x19, #0x3e8]
 4651400:      	add	x8, x8, #0x1
 4651404:      	str	x8, [x19, #0x3e8]
 4651408:      	ldr	d8, [x19, #0x398]
 465140c:      	add	x0, x19, #0x3b0
 4651410:      	add	x1, x19, #0x3c0
 4651414:      	mov.16b	v0, v8
 4651418:      	bl	0x265d304 <_ChromeMain+0x2658068>
 465141c:      	stp	x0, x1, [sp, #0x38]
 4651420:      	add	x1, sp, #0x38
 4651424:      	mov	x0, x19
 4651428:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 465142c:      	ldr	d0, [x19, #0x3d0]
 4651430:      	ldr	d1, [x19, #0x3d8]
 4651434:      	fsub	d1, d1, d0
 4651438:      	fmul	d1, d8, d1
 465143c:      	fadd	d0, d0, d1
 4651440:      	str	d0, [x19, #0x3e0]
 4651444:      	mov	x0, x19
 4651448:      	mov	w1, #0x0                ; =0
 465144c:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 4651450:      	mov	x0, x19
 4651454:      	bl	0x5a117c <_ChromeMain+0x59bee0>
 4651458:      	ldp	x29, x30, [sp, #0xc0]
 465145c:      	ldp	x20, x19, [sp, #0xb0]
 4651460:      	ldp	x22, x21, [sp, #0xa0]
 4651464:      	ldp	x24, x23, [sp, #0x90]
 4651468:      	ldp	x26, x25, [sp, #0x80]
 465146c:      	ldp	d9, d8, [sp, #0x70]
 4651470:      	ldp	d11, d10, [sp, #0x60]
 4651474:      	add	sp, sp, #0xd0
 4651478:      	ret
 465147c:      	ldr	d0, [x19, #0x3e0]
 4651480:      	b	0x46513c4 <_ChromeMain+0x464c128>
 4651484:      	ldr	d0, [x19, #0x3d8]
 4651488:      	fcmp	d0, d8
 465148c:      	ldr	q2, [sp, #0x10]
 4651490:      	b.ne	0x465147c <_ChromeMain+0x464c1e0>
 4651494:      	ldr	w10, [x19, #0x3c0]
 4651498:      	fmov	w8, s2
 465149c:      	mov.s	w9, v2[1]
 46514a0:      	cmp	w10, w8
 46514a4:      	b.ne	0x46514cc <_ChromeMain+0x464c230>
 46514a8:      	ldr	w10, [x19, #0x3c4]
 46514ac:      	cmp	w10, w9
 46514b0:      	b.ne	0x46514cc <_ChromeMain+0x464c230>
 46514b4:      	ldr	d0, [x19, #0x3c8]
 46514b8:      	cmeq.2s	v0, v0, v1
 46514bc:      	mov.s	w10, v0[1]
 46514c0:      	fmov	w11, s0
 46514c4:      	and	w10, w11, w10
 46514c8:      	tbnz	w10, #0x0, 0x4651458 <_ChromeMain+0x464c1bc>
 46514cc:      	str	w8, [x19, #0x3c0]
 46514d0:      	str	w9, [x19, #0x3c4]
 46514d4:      	str	d1, [x19, #0x3c8]
 46514d8:      	ldrb	w8, [x19, #0x338]
 46514dc:      	tbnz	w8, #0x0, 0x4651458 <_ChromeMain+0x464c1bc>
 46514e0:      	add	x1, x19, #0x3c0
 46514e4:      	mov	x0, x19
 46514e8:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46514ec:      	ldr	d0, [x19, #0x3d8]
 46514f0:      	str	d0, [x19, #0x3e0]
 46514f4:      	b	0x4651458 <_ChromeMain+0x464c1bc>
 46514f8:      	ldrb	w26, [x23, #0xf90]
 46514fc:      	mov	w0, #0x18               ; =24
 4651500:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4651504:      	mov	x25, x0
 4651508:      	cmp	w26, #0x0
 465150c:      	csel	x1, xzr, x23, ne
 4651510:      	mov	w2, #0x2                ; =2
 4651514:      	bl	0x7fb63f4 <_ChromeMain+0x7fb1158>
 4651518:      	ldr	x0, [x23, #0xca0]
 465151c:      	str	x25, [x23, #0xca0]
 4651520:      	cbz	x0, 0x465118c <_ChromeMain+0x464bef0>
 4651524:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4651528:      	mov	w1, #0x18               ; =24
 465152c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4651530:      	b	0x465118c <_ChromeMain+0x464bef0>
 4651534:      	strb	wzr, [x19, #0x338]
 4651538:      	ldr	x0, [x19, #0x348]
 465153c:      	add	x1, x19, #0x328
 4651540:      	bl	0x2109700 <_ChromeMain+0x2104464>
 4651544:      	ldr	x8, [x19, #0x328]
 4651548:      	ldr	x8, [x8, #0x38]
 465154c:      	add	x0, x19, #0x328
 4651550:      	blr	x8
 4651554:      	ldr	x8, [x19, #0x340]
 4651558:      	cbz	x8, 0x46513f0 <_ChromeMain+0x464c154>
 465155c:      	ldr	x8, [x19, #0x328]
 4651560:      	ldr	x8, [x8, #0x40]
 4651564:      	add	x0, x19, #0x328
 4651568:      	blr	x8
 465156c:      	ldr	x8, [x19, #0x340]
 4651570:      	ldr	x9, [x8]
 4651574:      	cmp	w0, #0x0
 4651578:      	mov	w10, #0x10              ; =16
 465157c:      	mov	w11, #0x20              ; =32
 4651580:      	csel	x10, x11, x10, ne
 4651584:      	ldr	x9, [x9, x10]
 4651588:      	add	x1, x19, #0x328
 465158c:      	mov	x0, x8
 4651590:      	blr	x9
 4651594:      	b	0x46513f0 <_ChromeMain+0x464c154>
 4651598:      	strb	wzr, [x19, #0x380]
 465159c:      	b	0x46513e4 <_ChromeMain+0x464c148>
 46515a0:      	cmp	w9, w8
 46515a4:      	b.eq	0x4651300 <_ChromeMain+0x464c064>
 46515a8:      	b	0x46512b4 <_ChromeMain+0x464c018>
