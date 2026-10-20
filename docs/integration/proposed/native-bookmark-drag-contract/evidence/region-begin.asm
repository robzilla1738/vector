
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462d1c0:      	sub	sp, sp, #0xa0
 462d1c4:      	stp	x26, x25, [sp, #0x50]
 462d1c8:      	stp	x24, x23, [sp, #0x60]
 462d1cc:      	stp	x22, x21, [sp, #0x70]
 462d1d0:      	stp	x20, x19, [sp, #0x80]
 462d1d4:      	stp	x29, x30, [sp, #0x90]
 462d1d8:      	add	x29, sp, #0x90
 462d1dc:      	mov	x19, x0
 462d1e0:      	cbz	x1, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1e4:      	ldr	x0, [x19, #0x6a8]
 462d1e8:      	cbz	x0, 0x462d1f8 <_ChromeMain+0x4627f5c>
 462d1ec:      	mov	x22, x1
 462d1f0:      	ldr	w8, [x1, #0xf8]
 462d1f4:      	cbz	w8, 0x462d23c <_ChromeMain+0x4627fa0>
 462d1f8:      	ldr	x0, [x19, #0x6c8]
 462d1fc:      	and	x8, x0, #0xfffffffc00000000
 462d200:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d204:      	ldr	x9, [x9, #0x88]
 462d208:      	cmp	x8, x9
 462d20c:      	b.ne	0x462d214 <_ChromeMain+0x4627f78>
 462d210:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d214:      	mov	w23, #0x0               ; =0
 462d218:      	str	xzr, [x19, #0x6c8]
 462d21c:      	mov	x0, x23
 462d220:      	ldp	x29, x30, [sp, #0x90]
 462d224:      	ldp	x20, x19, [sp, #0x80]
 462d228:      	ldp	x22, x21, [sp, #0x70]
 462d22c:      	ldp	x24, x23, [sp, #0x60]
 462d230:      	ldp	x26, x25, [sp, #0x50]
 462d234:      	add	sp, sp, #0xa0
 462d238:      	ret
 462d23c:      	mov	x23, x4
 462d240:      	mov	x20, x3
 462d244:      	mov	x21, x2
 462d248:      	ldr	x8, [x19, #0x848]
 462d24c:      	ldrb	w8, [x8, #0x90]
 462d250:      	cbz	w8, 0x462d264 <_ChromeMain+0x4627fc8>
 462d254:      	ldrb	w9, [x19, #0xa08]
 462d258:      	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d25c:      	ldrb	w9, [x19, #0xa0c]
 462d260:      	tbnz	w9, #0x0, 0x462d33c <_ChromeMain+0x46280a0>
 462d264:      	ldrb	w10, [x19, #0xce0]
 462d268:      	ldrb	w9, [x19, #0xf78]
 462d26c:      	tbz	w10, #0x0, 0x462d2d4 <_ChromeMain+0x4628038>
 462d270:      	cbnz	w9, 0x462d2e0 <_ChromeMain+0x4628044>
 462d274:      	ldrb	w8, [x19, #0xd28]
 462d278:      	cbnz	w8, 0x462d290 <_ChromeMain+0x4627ff4>
 462d27c:      	ldr	d0, [x19, #0xd40]
 462d280:      	fmov	d1, #1.00000000
 462d284:      	fcmp	d0, d1
 462d288:      	cset	w8, eq
 462d28c:      	b	0x462d2a0 <_ChromeMain+0x4628004>
 462d290:      	ldr	w8, [x19, #0xd24]
 462d294:      	cmp	w8, #0x0
 462d298:      	cset	w8, eq
 462d29c:      	ldr	d0, [x19, #0xd40]
 462d2a0:      	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 462d2a4:      	add	x9, x9, #0xb6c
 462d2a8:      	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 462d2ac:      	add	x10, x10, #0xd4
 462d2b0:      	cmp	w8, #0x0
 462d2b4:      	csel	x8, x10, x9, ne
 462d2b8:      	ldr	w9, [x19, #0x8c8]
 462d2bc:      	scvtf	d1, w9
 462d2c0:      	fmul	d0, d0, d1
 462d2c4:      	blr	x8
 462d2c8:      	fcvtzs	w9, d0
 462d2cc:      	ldr	w8, [x19, #0x1c0]
 462d2d0:      	b	0x462d2e8 <_ChromeMain+0x462804c>
 462d2d4:      	tbnz	w9, #0x0, 0x462d2e0 <_ChromeMain+0x4628044>
 462d2d8:      	cbnz	w8, 0x462d300 <_ChromeMain+0x4628064>
 462d2dc:      	b	0x462d33c <_ChromeMain+0x46280a0>
 462d2e0:      	ldr	w8, [x19, #0x1c0]
 462d2e4:      	mov	x9, x8
 462d2e8:      	cmp	w9, w8
 462d2ec:      	csel	w10, w9, w8, lt
 462d2f0:      	cmp	w8, #0x0
 462d2f4:      	csel	w8, w10, w9, gt
 462d2f8:      	cmp	w8, #0x97
 462d2fc:      	b.ge	0x462d338 <_ChromeMain+0x462809c>
 462d300:      	ldr	x0, [x19, #0x6c8]
 462d304:      	and	x8, x0, #0xfffffffc00000000
 462d308:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d30c:      	ldr	x9, [x9, #0x88]
 462d310:      	cmp	x8, x9
 462d314:      	b.ne	0x462d31c <_ChromeMain+0x4628080>
 462d318:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d31c:      	str	xzr, [x19, #0x6c8]
 462d320:      	ldr	x0, [x19, #0x6a8]
 462d324:      	mov	x1, #0x0                ; =0
 462d328:      	mov	x2, #0x0                ; =0
 462d32c:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d330:      	mov	w23, #0x0               ; =0
 462d334:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d338:      	ldr	x0, [x19, #0x6a8]
 462d33c:      	ldrb	w8, [x0, #0x1c8]
 462d340:      	cbz	w8, 0x462d384 <_ChromeMain+0x46280e8>
 462d344:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 462d348:      	mov	w24, #0x0               ; =0
 462d34c:      	ldr	w8, [x23]
 462d350:      	cmp	w8, w0
 462d354:      	b.lt	0x462d388 <_ChromeMain+0x46280ec>
 462d358:      	add	w9, w1, w0
 462d35c:      	cmp	w8, w9
 462d360:      	b.ge	0x462d388 <_ChromeMain+0x46280ec>
 462d364:      	ldr	w8, [x23, #0x4]
 462d368:      	lsr	x9, x0, #32
 462d36c:      	cmp	w8, w9
 462d370:      	b.lt	0x462d384 <_ChromeMain+0x46280e8>
 462d374:      	add	x9, x9, x1, lsr #32
 462d378:      	cmp	w8, w9
 462d37c:      	cset	w24, lt
 462d380:      	b	0x462d388 <_ChromeMain+0x46280ec>
 462d384:      	mov	w24, #0x0               ; =0
 462d388:      	ldr	x0, [x19, #0x6a8]
 462d38c:      	ldr	x8, [x0, #0x368]
 462d390:      	cbz	x8, 0x462d3bc <_ChromeMain+0x4628120>
 462d394:      	stp	xzr, xzr, [sp, #0x30]
 462d398:      	str	wzr, [sp, #0x40]
 462d39c:      	tbnz	w24, #0x0, 0x462d40c <_ChromeMain+0x4628170>
 462d3a0:      	mov	x24, #0x0               ; =0
 462d3a4:      	mov	w23, #0x0               ; =0
 462d3a8:      	mov	x1, #0x0                ; =0
 462d3ac:      	mov	x2, #0x0                ; =0
 462d3b0:      	b	0x462d4dc <_ChromeMain+0x4628240>
 462d3b4:      	mov	w8, #0x0                ; =0
 462d3b8:      	b	0x462d3fc <_ChromeMain+0x4628160>
 462d3bc:      	mov	x0, x19
 462d3c0:      	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d3c4:      	mov	w8, #0x0                ; =0
 462d3c8:      	ldr	w9, [x23]
 462d3cc:      	cmp	w9, w0
 462d3d0:      	b.lt	0x462d3fc <_ChromeMain+0x4628160>
 462d3d4:      	add	w10, w1, w0
 462d3d8:      	cmp	w9, w10
 462d3dc:      	b.ge	0x462d3fc <_ChromeMain+0x4628160>
 462d3e0:      	ldr	w8, [x23, #0x4]
 462d3e4:      	lsr	x9, x0, #32
 462d3e8:      	cmp	w8, w9
 462d3ec:      	b.lt	0x462d3b4 <_ChromeMain+0x4628118>
 462d3f0:      	add	x9, x9, x1, lsr #32
 462d3f4:      	cmp	w8, w9
 462d3f8:      	cset	w8, lt
 462d3fc:      	stp	xzr, xzr, [sp, #0x30]
 462d400:      	str	wzr, [sp, #0x40]
 462d404:      	ldr	x0, [x19, #0x6a8]
 462d408:      	tbz	w24, #0x0, 0x462d444 <_ChromeMain+0x46281a8>
 462d40c:      	add	x8, sp, #0x18
 462d410:      	mov	x1, x23
 462d414:      	bl	0x4606940 <_ChromeMain+0x46016a4>
 462d418:      	ldrb	w8, [sp, #0x28]
 462d41c:      	strb	w8, [sp, #0x40]
 462d420:      	ldur	q0, [sp, #0x18]
 462d424:      	str	q0, [sp, #0x30]
 462d428:      	ldr	x0, [x19, #0x6a8]
 462d42c:      	tbnz	w8, #0x0, 0x462d4b8 <_ChromeMain+0x462821c>
 462d430:      	mov	w23, #0x0               ; =0
 462d434:      	mov	x1, #0x0                ; =0
 462d438:      	mov	x2, #0x0                ; =0
 462d43c:      	mov	x24, x22
 462d440:      	b	0x462d4dc <_ChromeMain+0x4628240>
 462d444:      	cbnz	w8, 0x462d460 <_ChromeMain+0x46281c4>
 462d448:      	mov	x1, #0x0                ; =0
 462d44c:      	mov	x2, #0x0                ; =0
 462d450:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d454:      	mov	w23, #0x0               ; =0
 462d458:      	mov	x24, #0x0               ; =0
 462d45c:      	b	0x462d4e0 <_ChromeMain+0x4628244>
 462d460:      	ldrb	w8, [x0, #0x560]
 462d464:      	cmp	w8, #0x0
 462d468:      	mov	w8, #0x368              ; =872
 462d46c:      	mov	w9, #0x558              ; =1368
 462d470:      	csel	x8, x9, x8, ne
 462d474:      	ldr	x1, [x0, x8]
 462d478:      	mov	w23, #0x1               ; =1
 462d47c:      	mov	w2, #0x1                ; =1
 462d480:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d484:      	mov	x0, x19
 462d488:      	bl	0x464d3f0 <_ChromeMain+0x4648154>
 462d48c:      	stp	x0, x1, [sp, #0x18]
 462d490:      	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 462d494:      	ldr	q0, [x8, #0xa50]
 462d498:      	str	q0, [sp]
 462d49c:      	add	x0, sp, #0x18
 462d4a0:      	mov	x1, sp
 462d4a4:      	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 462d4a8:      	ldur	q0, [sp, #0x18]
 462d4ac:      	str	q0, [sp, #0x30]
 462d4b0:      	strb	w23, [sp, #0x40]
 462d4b4:      	ldr	x0, [x19, #0x6a8]
 462d4b8:      	ldrb	w8, [x0, #0x560]
 462d4bc:      	cmp	w8, #0x0
 462d4c0:      	mov	w8, #0x368              ; =872
 462d4c4:      	mov	w9, #0x558              ; =1368
 462d4c8:      	csel	x8, x9, x8, ne
 462d4cc:      	ldr	x1, [x0, x8]
 462d4d0:      	mov	w23, #0x1               ; =1
 462d4d4:      	mov	x24, x22
 462d4d8:      	mov	w2, #0x1                ; =1
 462d4dc:      	bl	0x4606b20 <_ChromeMain+0x4601884>
 462d4e0:      	and	x8, x24, #0xfffffffc00000000
 462d4e4:      	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462d4e8:      	ldr	x9, [x25, #0x88]
 462d4ec:      	cmp	x8, x9
 462d4f0:      	b.ne	0x462d4fc <_ChromeMain+0x4628260>
 462d4f4:      	mov	x0, x24
 462d4f8:      	bl	0x142fc <_ChromeMain+0xf060>
 462d4fc:      	ldr	x0, [x19, #0x6c8]
 462d500:      	and	x8, x0, #0xfffffffc00000000
 462d504:      	ldr	x9, [x25, #0x88]
 462d508:      	cmp	x8, x9
 462d50c:      	b.ne	0x462d514 <_ChromeMain+0x4628278>
 462d510:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462d514:      	str	x24, [x19, #0x6c8]
 462d518:      	cbz	w23, 0x462d53c <_ChromeMain+0x46282a0>
 462d51c:      	add	x1, x22, #0x8
 462d520:      	add	x4, sp, #0x30
 462d524:      	mov	x0, x19
 462d528:      	mov	x2, x21
 462d52c:      	mov	x3, x20
 462d530:      	mov	w5, #0x1                ; =1
 462d534:      	bl	0x4651140 <_ChromeMain+0x464bea4>
 462d538:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d53c:      	ldr	x20, [x19, #0x6b8]
 462d540:      	cbz	x20, 0x462d560 <_ChromeMain+0x46282c4>
 462d544:      	ldrb	w8, [x20, #0x338]
 462d548:      	cbnz	w8, 0x462d57c <_ChromeMain+0x46282e0>
 462d54c:      	ldr	x8, [x20]
 462d550:      	ldr	x8, [x8, #0xa0]
 462d554:      	mov	x0, x20
 462d558:      	mov	w1, #0x0                ; =0
 462d55c:      	blr	x8
 462d560:      	ldr	x0, [x19, #0xca0]
 462d564:      	str	xzr, [x19, #0xca0]
 462d568:      	cbz	x0, 0x462d21c <_ChromeMain+0x4627f80>
 462d56c:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462d570:      	mov	w1, #0x18               ; =24
 462d574:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462d578:      	b	0x462d21c <_ChromeMain+0x4627f80>
 462d57c:      	strb	wzr, [x20, #0x338]
 462d580:      	ldr	x0, [x20, #0x348]
 462d584:      	add	x1, x20, #0x328
 462d588:      	bl	0x2109700 <_ChromeMain+0x2104464>
 462d58c:      	ldr	x8, [x20, #0x328]
 462d590:      	ldr	x8, [x8, #0x38]
 462d594:      	add	x0, x20, #0x328
 462d598:      	blr	x8
 462d59c:      	ldr	x8, [x20, #0x340]
 462d5a0:      	cbz	x8, 0x462d54c <_ChromeMain+0x46282b0>
 462d5a4:      	ldr	x8, [x20, #0x328]
 462d5a8:      	ldr	x8, [x8, #0x40]
 462d5ac:      	add	x0, x20, #0x328
 462d5b0:      	blr	x8
 462d5b4:      	ldr	x8, [x20, #0x340]
 462d5b8:      	ldr	x9, [x8]
 462d5bc:      	cmp	w0, #0x0
 462d5c0:      	mov	w10, #0x10              ; =16
 462d5c4:      	mov	w11, #0x20              ; =32
 462d5c8:      	csel	x10, x11, x10, ne
 462d5cc:      	ldr	x9, [x9, x10]
 462d5d0:      	add	x1, x20, #0x328
 462d5d4:      	mov	x0, x8
 462d5d8:      	blr	x9
 462d5dc:      	b	0x462d54c <_ChromeMain+0x46282b0>
