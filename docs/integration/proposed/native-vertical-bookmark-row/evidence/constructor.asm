
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4624100:      	sub	sp, sp, #0xd0
 4624104:      	stp	x28, x27, [sp, #0x70]
 4624108:      	stp	x26, x25, [sp, #0x80]
 462410c:      	stp	x24, x23, [sp, #0x90]
 4624110:      	stp	x22, x21, [sp, #0xa0]
 4624114:      	stp	x20, x19, [sp, #0xb0]
 4624118:      	stp	x29, x30, [sp, #0xc0]
 462411c:      	add	x29, sp, #0xc0
 4624120:      	mov	x22, x7
 4624124:      	mov	x23, x6
 4624128:      	mov	x24, x5
 462412c:      	str	w4, [sp, #0x4]
 4624130:      	mov	x25, x3
 4624134:      	mov	x26, x2
 4624138:      	mov	x27, x1
 462413c:      	mov	x19, x0
 4624140:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4624144:      	adrp	x21, 0xe720000 <dyld_stub_binder+0xe720000>
 4624148:      	add	x21, x21, #0xd30
 462414c:      	add	x8, x21, #0x408
 4624150:      	stp	x21, x8, [x0]
 4624154:      	add	x8, x21, #0x430
 4624158:      	str	x8, [x0, #0x10]
 462415c:      	add	x8, x21, #0x468
 4624160:      	add	x9, x21, #0x498
 4624164:      	stp	x8, x9, [x0, #0x68]
 4624168:      	add	x8, x21, #0x4e8
 462416c:      	str	x8, [x0, #0xb0]
 4624170:      	add	x8, x21, #0x548
 4624174:      	str	x8, [x0, #0xd8]
 4624178:      	add	x8, x21, #0x578
 462417c:      	adrp	x9, 0xe50b000 <dyld_stub_binder+0xe50b000>
 4624180:      	add	x9, x9, #0xb50
 4624184:      	str	x8, [x0, #0xf8]
 4624188:      	str	x9, [x0, #0x310]
 462418c:      	and	x9, x0, #0xfffffffc00000000
 4624190:      	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4624194:      	ldr	x8, [x28, #0x88]
 4624198:      	cmp	x9, x8
 462419c:      	b.ne	0x46241a8 <_ChromeMain+0x461ef0c>
 46241a0:      	mov	x0, x19
 46241a4:      	bl	0x142fc <_ChromeMain+0xf060>
 46241a8:      	str	x19, [x19, #0x318]
 46241ac:      	strb	wzr, [x19, #0x3c8]
 46241b0:      	cbz	x19, 0x4624c80 <_ChromeMain+0x461f9e4>
 46241b4:      	ldr	x20, [x29, #0x18]
 46241b8:      	add	x8, x21, #0x408
 46241bc:      	stp	x21, x8, [x19]
 46241c0:      	add	x8, x21, #0x430
 46241c4:      	str	x8, [x19, #0x10]
 46241c8:      	add	x8, x21, #0x468
 46241cc:      	add	x9, x21, #0x498
 46241d0:      	stp	x8, x9, [x19, #0x68]
 46241d4:      	add	x8, x21, #0x4e8
 46241d8:      	str	x8, [x19, #0xb0]
 46241dc:      	add	x8, x21, #0x548
 46241e0:      	str	x8, [x19, #0xd8]
 46241e4:      	add	x8, x21, #0x578
 46241e8:      	str	x8, [x19, #0xf8]
 46241ec:      	add	x8, x21, #0x5a0
 46241f0:      	str	x8, [x19, #0x310]
 46241f4:      	and	x8, x27, #0xfffffffc00000000
 46241f8:      	ldr	x9, [x28, #0x88]
 46241fc:      	cmp	x8, x9
 4624200:      	b.ne	0x462420c <_ChromeMain+0x461ef70>
 4624204:      	mov	x0, x27
 4624208:      	bl	0x142fc <_ChromeMain+0xf060>
 462420c:      	ldr	x21, [x29, #0x10]
 4624210:      	str	x27, [x19, #0x3d0]
 4624214:      	str	xzr, [x19, #0x3d8]
 4624218:      	and	x8, x26, #0xfffffffc00000000
 462421c:      	ldr	x9, [x28, #0x88]
 4624220:      	cmp	x8, x9
 4624224:      	b.ne	0x4624230 <_ChromeMain+0x461ef94>
 4624228:      	mov	x0, x26
 462422c:      	bl	0x142fc <_ChromeMain+0xf060>
 4624230:      	str	x26, [x19, #0x3e0]
 4624234:      	str	w25, [x19, #0x3e8]
 4624238:      	str	x24, [x19, #0x3f0]
 462423c:      	str	x23, [x19, #0x3f8]
 4624240:      	str	x22, [x19, #0x400]
 4624244:      	str	x21, [x19, #0x408]
 4624248:      	str	x20, [x19, #0x410]
 462424c:      	cbnz	x20, 0x4624ba4 <_ChromeMain+0x461f908>
 4624250:      	ldr	x8, [x29, #0x20]
 4624254:      	str	x8, [x19, #0x418]
 4624258:      	add	x23, x19, #0x420
 462425c:      	str	wzr, [x19, #0x44c]
 4624260:      	movi.2d	v0, #0000000000000000
 4624264:      	str	d0, [x19, #0x450]
 4624268:      	str	q0, [x19, #0x420]
 462426c:      	str	q0, [x19, #0x430]
 4624270:      	stur	q0, [x23, #0x1a]
 4624274:      	mov	w0, #0x8                ; =8
 4624278:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462427c:      	str	wzr, [x0]
 4624280:      	strb	wzr, [x0, #0x4]
 4624284:      	cbz	x0, 0x462429c <_ChromeMain+0x461f000>
 4624288:      	mov	w8, #0x1                ; =1
 462428c:      	ldadd	w8, w8, [x0]
 4624290:      	mov	w9, #0x7fffffff         ; =2147483647
 4624294:      	cmp	w8, w9
 4624298:      	b.eq	0x4624cf8 <_ChromeMain+0x461fa5c>
 462429c:      	str	x0, [x19, #0x458]
 46242a0:      	str	x19, [x19, #0x460]
 46242a4:      	mov	w0, #0x140              ; =320
 46242a8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46242ac:      	mov	x22, x0
 46242b0:      	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46242b4:      	mov	x0, x19
 46242b8:      	mov	x1, x22
 46242bc:      	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46242c0:      	and	x8, x22, #0xfffffffc00000000
 46242c4:      	ldr	x9, [x28, #0x88]
 46242c8:      	cmp	x8, x9
 46242cc:      	b.ne	0x46242d8 <_ChromeMain+0x461f03c>
 46242d0:      	mov	x0, x22
 46242d4:      	bl	0x142fc <_ChromeMain+0xf060>
 46242d8:      	ldr	x0, [x19, #0x3d8]
 46242dc:      	and	x8, x0, #0xfffffffc00000000
 46242e0:      	ldr	x9, [x28, #0x88]
 46242e4:      	cmp	x8, x9
 46242e8:      	b.ne	0x46242f0 <_ChromeMain+0x461f054>
 46242ec:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46242f0:      	str	x22, [x19, #0x3d8]
 46242f4:      	ldr	w8, [x22, #0xf0]
 46242f8:      	cbnz	w8, 0x4624b7c <_ChromeMain+0x461f8e0>
 46242fc:      	mov	w21, #0x1               ; =1
 4624300:      	str	w21, [sp, #0x20]
 4624304:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4624308:      	add	x1, x1, #0x568
 462430c:      	add	x0, x22, #0x118
 4624310:      	add	x2, sp, #0x20
 4624314:      	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4624318:      	ldrb	w8, [x22, #0xf4]
 462431c:      	tbnz	w8, #0x0, 0x4624330 <_ChromeMain+0x461f094>
 4624320:      	strb	w21, [x22, #0xf4]
 4624324:      	mov	x0, x22
 4624328:      	mov	w1, #0x1                ; =1
 462432c:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4624330:      	ldr	w8, [x19, #0x3e8]
 4624334:      	mov	w9, #0xe                ; =14
 4624338:      	mov	w10, #0x8               ; =8
 462433c:      	madd	w8, w8, w9, w10
 4624340:      	adds	w9, w8, #0x8
 4624344:      	mov	w10, #0x7fffffff        ; =2147483647
 4624348:      	csel	w9, w10, w9, vs
 462434c:      	subs	w9, w9, w8
 4624350:      	asr	w10, w9, #31
 4624354:      	eor	w10, w10, #0x80000000
 4624358:      	csel	w9, w10, w9, vs
 462435c:      	ldr	w10, [x22, #0xf8]
 4624360:      	cmp	w10, #0x6
 4624364:      	b.ne	0x4624c0c <_ChromeMain+0x461f970>
 4624368:      	ldr	w10, [x22, #0xfc]
 462436c:      	cmp	w10, w8
 4624370:      	b.ne	0x4624c0c <_ChromeMain+0x461f970>
 4624374:      	ldr	w10, [x22, #0x100]
 4624378:      	cmp	w10, #0x6
 462437c:      	b.ne	0x4624c0c <_ChromeMain+0x461f970>
 4624380:      	ldr	w10, [x22, #0x104]
 4624384:      	cmp	w10, w9
 4624388:      	b.ne	0x4624c0c <_ChromeMain+0x461f970>
 462438c:      	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4624390:      	add	x25, x25, #0x480
 4624394:      	ldapr	x0, [x25]
 4624398:      	cbz	x0, 0x4624c60 <_ChromeMain+0x461f9c4>
 462439c:      	mov	w1, #0x380              ; =896
 46243a0:      	mov	x2, #0x0                ; =0
 46243a4:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 46243a8:      	mov	x22, x0
 46243ac:      	bl	0x242d238 <_ChromeMain+0x2427f9c>
 46243b0:      	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 46243b4:      	add	x8, x8, #0xbd0
 46243b8:      	add	x9, x8, #0x3f0
 46243bc:      	stp	x8, x9, [x0]
 46243c0:      	add	x9, x8, #0x418
 46243c4:      	str	x9, [x0, #0x10]
 46243c8:      	add	x9, x8, #0x450
 46243cc:      	add	x10, x8, #0x480
 46243d0:      	stp	x9, x10, [x0, #0x68]
 46243d4:      	add	x9, x8, #0x4d0
 46243d8:      	str	x9, [x0, #0xb0]
 46243dc:      	add	x9, x8, #0x530
 46243e0:      	str	x9, [x0, #0xd8]
 46243e4:      	add	x8, x8, #0x560
 46243e8:      	str	x8, [x0, #0xf8]
 46243ec:      	str	xzr, [x0, #0x348]
 46243f0:      	movi	d0, #0xffff000000000000
 46243f4:      	str	d0, [x0, #0x350]
 46243f8:      	mov	w8, #0x1                ; =1
 46243fc:      	strb	w8, [x0, #0x358]
 4624400:      	str	xzr, [x0, #0x360]
 4624404:      	strb	wzr, [x0, #0x368]
 4624408:      	str	xzr, [x0, #0x370]
 462440c:      	str	wzr, [x0, #0x378]
 4624410:      	strb	wzr, [x0, #0x37c]
 4624414:      	ldrb	w8, [x0, #0x169]
 4624418:      	cbnz	w8, 0x4624c54 <_ChromeMain+0x461f9b8>
 462441c:      	ldr	x2, [x19, #0x198]
 4624420:      	mov	x0, x19
 4624424:      	mov	x1, x22
 4624428:      	bl	0x7793fc <_ChromeMain+0x774160>
 462442c:      	and	x8, x22, #0xfffffffc00000000
 4624430:      	ldr	x9, [x28, #0x88]
 4624434:      	cmp	x8, x9
 4624438:      	b.ne	0x4624444 <_ChromeMain+0x461f1a8>
 462443c:      	mov	x0, x22
 4624440:      	bl	0x142fc <_ChromeMain+0xf060>
 4624444:      	ldr	x0, [x23]
 4624448:      	and	x8, x0, #0xfffffffc00000000
 462444c:      	ldr	x9, [x28, #0x88]
 4624450:      	cmp	x8, x9
 4624454:      	b.ne	0x462445c <_ChromeMain+0x461f1c0>
 4624458:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462445c:      	str	x22, [x23]
 4624460:      	add	x8, x22, #0x310
 4624464:      	ldrb	w9, [x22, #0x318]
 4624468:      	cbnz	w9, 0x4624c8c <_ChromeMain+0x461f9f0>
 462446c:      	cbz	x8, 0x4624c5c <_ChromeMain+0x461f9c0>
 4624470:      	mov	x8, #0x1000000010       ; =68719476752
 4624474:      	str	x8, [x22, #0x310]
 4624478:      	mov	w8, #0x1                ; =1
 462447c:      	strb	w8, [x22, #0x318]
 4624480:      	ldr	x0, [x22, #0x188]
 4624484:      	cbz	x0, 0x4624498 <_ChromeMain+0x461f1fc>
 4624488:      	ldr	x8, [x0]
 462448c:      	ldr	x8, [x8, #0x2f8]
 4624490:      	mov	x1, x22
 4624494:      	blr	x8
 4624498:      	mov	x0, x22
 462449c:      	mov	w1, #0x0                ; =0
 46244a0:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 46244a4:      	str	x22, [sp, #0x20]
 46244a8:      	add	x0, x22, #0x130
 46244ac:      	add	x3, sp, #0x20
 46244b0:      	mov	w1, #0x18               ; =24
 46244b4:      	mov	w2, #0x1                ; =1
 46244b8:      	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 46244bc:      	mov	x0, x22
 46244c0:      	bl	0x1256ae8 <_ChromeMain+0x125184c>
 46244c4:      	ldr	x8, [x23]
 46244c8:      	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 46244cc:      	ldr	q0, [x9, #0x90]
 46244d0:      	str	q0, [sp, #0x20]
 46244d4:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46244d8:      	add	x1, x1, #0x488
 46244dc:      	add	x0, x8, #0xd8
 46244e0:      	add	x2, sp, #0x20
 46244e4:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 46244e8:      	ldapr	x0, [x25]
 46244ec:      	cbz	x0, 0x4624c68 <_ChromeMain+0x461f9cc>
 46244f0:      	mov	w1, #0x460              ; =1120
 46244f4:      	mov	x2, #0x0                ; =0
 46244f8:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 46244fc:      	mov	x22, x0
 4624500:      	mov	x1, #0x0                ; =0
 4624504:      	mov	x2, #0x0                ; =0
 4624508:      	mov	w3, #0x5                ; =5
 462450c:      	mov	w4, #0x1000             ; =4096
 4624510:      	mov	w5, #0x0                ; =0
 4624514:      	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4624518:      	ldrb	w8, [x0, #0x169]
 462451c:      	cbnz	w8, 0x4624c98 <_ChromeMain+0x461f9fc>
 4624520:      	ldr	x2, [x19, #0x198]
 4624524:      	mov	x0, x19
 4624528:      	mov	x1, x22
 462452c:      	bl	0x7793fc <_ChromeMain+0x774160>
 4624530:      	and	x8, x22, #0xfffffffc00000000
 4624534:      	ldr	x9, [x28, #0x88]
 4624538:      	cmp	x8, x9
 462453c:      	b.ne	0x4624548 <_ChromeMain+0x461f2ac>
 4624540:      	mov	x0, x22
 4624544:      	bl	0x142fc <_ChromeMain+0xf060>
 4624548:      	ldr	x0, [x19, #0x428]
 462454c:      	and	x8, x0, #0xfffffffc00000000
 4624550:      	ldr	x9, [x28, #0x88]
 4624554:      	cmp	x8, x9
 4624558:      	b.ne	0x4624560 <_ChromeMain+0x461f2c4>
 462455c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4624560:      	str	x22, [x19, #0x428]
 4624564:      	mov	x0, x22
 4624568:      	mov	w1, #0x3                ; =3
 462456c:      	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4624570:      	ldr	x0, [x19, #0x428]
 4624574:      	mov	w1, #0x6                ; =6
 4624578:      	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 462457c:      	ldr	x22, [x19, #0x428]
 4624580:      	ldrb	w8, [x22, #0x3d8]
 4624584:      	cbz	w8, 0x46245a4 <_ChromeMain+0x461f308>
 4624588:      	strb	wzr, [x22, #0x3d8]
 462458c:      	mov	x0, x22
 4624590:      	bl	0x5a383c <_ChromeMain+0x59e5a0>
 4624594:      	add	x0, x22, #0xf8
 4624598:      	add	x1, x22, #0x3d8
 462459c:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46245a0:      	ldr	x22, [x19, #0x428]
 46245a4:      	ldrb	w8, [x22, #0x3b6]
 46245a8:      	cbnz	w8, 0x4624be0 <_ChromeMain+0x461f944>
 46245ac:      	mov	x0, x22
 46245b0:      	mov	w1, #0x0                ; =0
 46245b4:      	bl	0x273f370 <_ChromeMain+0x273a0d4>
 46245b8:      	ldr	x8, [x19, #0x428]
 46245bc:      	ldrb	w9, [x8, #0x3b5]
 46245c0:      	tbnz	w9, #0x0, 0x46245dc <_ChromeMain+0x461f340>
 46245c4:      	mov	w9, #0x1                ; =1
 46245c8:      	strb	w9, [x8, #0x3b5]
 46245cc:      	add	x0, x8, #0xf8
 46245d0:      	add	x1, x8, #0x3b5
 46245d4:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46245d8:      	ldr	x8, [x19, #0x428]
 46245dc:      	stur	wzr, [x29, #-0x58]
 46245e0:      	mov	w9, #0x1                ; =1
 46245e4:      	sturb	w9, [x29, #-0x54]
 46245e8:      	sub	x1, x29, #0x58
 46245ec:      	mov	x0, x8
 46245f0:      	bl	0x8486f0 <_ChromeMain+0x843454>
 46245f4:      	ldr	x22, [x19, #0x428]
 46245f8:      	ldr	x21, [x22, #0x358]
 46245fc:      	ldr	x23, [x21, #0x48]
 4624600:      	ldr	w24, [x23, #0x40]
 4624604:      	cmn	w24, #0x1
 4624608:      	b.eq	0x4624c40 <_ChromeMain+0x461f9a4>
 462460c:      	ldr	w3, [x23, #0x48]
 4624610:      	cmn	w3, #0x1
 4624614:      	b.eq	0x4624d04 <_ChromeMain+0x461fa68>
 4624618:      	mov	x0, x23
 462461c:      	mov	w1, #0x2                ; =2
 4624620:      	mov	x2, x24
 4624624:      	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4624628:      	mov	x23, x0
 462462c:      	cbz	x0, 0x4624640 <_ChromeMain+0x461f3a4>
 4624630:      	ldr	w8, [x23]
 4624634:      	adds	w8, w8, #0x1
 4624638:      	str	w8, [x23]
 462463c:      	b.hs	0x4624ca4 <_ChromeMain+0x461fa08>
 4624640:      	ldr	w2, [x23, #0x40]
 4624644:      	cmn	w2, #0x1
 4624648:      	b.eq	0x4624c30 <_ChromeMain+0x461f994>
 462464c:      	mov	x0, x23
 4624650:      	mov	w1, #0x0                ; =0
 4624654:      	mov	w3, #0x190              ; =400
 4624658:      	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 462465c:      	str	x0, [sp, #0x20]
 4624660:      	cbz	x0, 0x4624674 <_ChromeMain+0x461f3d8>
 4624664:      	ldr	w8, [x0]
 4624668:      	adds	w8, w8, #0x1
 462466c:      	str	w8, [x0]
 4624670:      	b.hs	0x4624cb0 <_ChromeMain+0x461fa14>
 4624674:      	ldr	x8, [x22]
 4624678:      	ldr	x8, [x8, #0x3d8]
 462467c:      	add	x1, sp, #0x20
 4624680:      	mov	x0, x22
 4624684:      	blr	x8
 4624688:      	ldr	x0, [sp, #0x20]
 462468c:      	cbz	x0, 0x46246a4 <_ChromeMain+0x461f408>
 4624690:      	ldr	w9, [x0]
 4624694:      	sub	w8, w9, #0x1
 4624698:      	str	w8, [x0]
 462469c:      	cbz	w9, 0x4624cbc <_ChromeMain+0x461fa20>
 46246a0:      	cbz	w8, 0x4624bcc <_ChromeMain+0x461f930>
 46246a4:      	cbz	x23, 0x46246bc <_ChromeMain+0x461f420>
 46246a8:      	ldr	w9, [x23]
 46246ac:      	sub	w8, w9, #0x1
 46246b0:      	str	w8, [x23]
 46246b4:      	cbz	w9, 0x4624cc8 <_ChromeMain+0x461fa2c>
 46246b8:      	cbz	w8, 0x4624b90 <_ChromeMain+0x461f8f4>
 46246bc:      	stp	xzr, xzr, [sp, #0x50]
 46246c0:      	str	xzr, [sp, #0x60]
 46246c4:      	ldr	x0, [x19, #0x3e0]
 46246c8:      	add	x21, sp, #0x50
 46246cc:      	add	x8, sp, #0x50
 46246d0:      	bl	0x461bda0 <_ChromeMain+0x4616b04>
 46246d4:      	ldr	x0, [x19, #0x428]
 46246d8:      	ldrsb	x8, [sp, #0x67]
 46246dc:      	ldp	x9, x10, [sp, #0x50]
 46246e0:      	cmp	x8, #0x0
 46246e4:      	csel	x1, x9, x21, mi
 46246e8:      	cmp	w8, #0x0
 46246ec:      	csel	x2, x10, x8, mi
 46246f0:      	ldr	x8, [x0]
 46246f4:      	ldr	x8, [x8, #0x3e0]
 46246f8:      	blr	x8
 46246fc:      	ldr	x8, [x19, #0x428]
 4624700:      	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4624704:      	ldr	q0, [x9, #0xa90]
 4624708:      	str	q0, [sp, #0x20]
 462470c:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4624710:      	add	x1, x1, #0x488
 4624714:      	add	x0, x8, #0xd8
 4624718:      	add	x2, sp, #0x20
 462471c:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4624720:      	ldr	x21, [x19, #0x428]
 4624724:      	mov	w0, #0x40               ; =64
 4624728:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462472c:      	mov	w8, #0x1                ; =1
 4624730:      	str	w8, [x0]
 4624734:      	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 4624738:      	add	x8, x8, #0x980
 462473c:      	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 4624740:      	add	x9, x9, #0x880
 4624744:      	stp	x8, x9, [x0, #0x8]
 4624748:      	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 462474c:      	add	x23, x23, #0xb00
 4624750:      	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 4624754:      	add	x8, x8, #0xc40
 4624758:      	stp	x23, x8, [x0, #0x18]
 462475c:      	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4624760:      	ldr	q0, [x8, #0xf60]
 4624764:      	stur	q0, [x0, #0x28]
 4624768:      	strb	wzr, [x0, #0x38]
 462476c:      	str	x0, [sp, #0x20]
 4624770:      	movi.2s	v0, #0x1
 4624774:      	str	d0, [sp, #0x28]
 4624778:      	mov	w8, #0x3                ; =3
 462477c:      	str	w8, [sp, #0x30]
 4624780:      	stp	xzr, xzr, [sp, #0x40]
 4624784:      	str	xzr, [sp, #0x38]
 4624788:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 462478c:      	add	x1, x1, #0x548
 4624790:      	add	x0, x21, #0xd8
 4624794:      	add	x2, sp, #0x20
 4624798:      	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 462479c:      	add	x0, sp, #0x20
 46247a0:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 46247a4:      	ldapr	x0, [x25]
 46247a8:      	cbz	x0, 0x4624c70 <_ChromeMain+0x461f9d4>
 46247ac:      	mov	w1, #0x418              ; =1048
 46247b0:      	mov	x2, #0x0                ; =0
 46247b4:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 46247b8:      	mov	x22, x0
 46247bc:      	ldr	w21, [sp, #0x4]
 46247c0:      	mov	x1, x21
 46247c4:      	bl	0x4119804 <_ChromeMain+0x4114568>
 46247c8:      	ldrb	w8, [x0, #0x169]
 46247cc:      	cbnz	w8, 0x4624cd4 <_ChromeMain+0x461fa38>
 46247d0:      	ldr	x2, [x19, #0x198]
 46247d4:      	mov	x0, x19
 46247d8:      	mov	x1, x22
 46247dc:      	bl	0x7793fc <_ChromeMain+0x774160>
 46247e0:      	ldr	x8, [x28, #0x88]
 46247e4:      	and	x9, x22, #0xfffffffc00000000
 46247e8:      	cmp	x9, x8
 46247ec:      	b.ne	0x46247fc <_ChromeMain+0x461f560>
 46247f0:      	mov	x0, x22
 46247f4:      	bl	0x142fc <_ChromeMain+0xf060>
 46247f8:      	ldr	x8, [x28, #0x88]
 46247fc:      	ldr	x0, [x19, #0x430]
 4624800:      	and	x9, x0, #0xfffffffc00000000
 4624804:      	cmp	x9, x8
 4624808:      	b.ne	0x4624814 <_ChromeMain+0x461f578>
 462480c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4624810:      	ldr	x8, [x28, #0x88]
 4624814:      	str	x22, [x19, #0x430]
 4624818:      	strb	w21, [x19, #0x445]
 462481c:      	and	x9, x19, #0xfffffffc00000000
 4624820:      	cmp	x9, x8
 4624824:      	b.ne	0x4624830 <_ChromeMain+0x461f594>
 4624828:      	mov	x0, x19
 462482c:      	bl	0x142fc <_ChromeMain+0xf060>
 4624830:      	mov	w0, #0x38               ; =56
 4624834:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4624838:      	mov	x22, x0
 462483c:      	mov	w24, #0x1               ; =1
 4624840:      	adrp	x8, 0x3f6d000 <_ChromeMain+0x3f67d64>
 4624844:      	add	x8, x8, #0x140
 4624848:      	str	w24, [x0]
 462484c:      	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4624850:      	add	x9, x9, #0x600
 4624854:      	adr	x10, 0x4624d6c <_ChromeMain+0x461fad0>
 4624858:      	nop
 462485c:      	stp	x8, x9, [x0, #0x8]
 4624860:      	stp	x23, x10, [x0, #0x18]
 4624864:      	stp	xzr, x19, [x0, #0x28]
 4624868:      	ldapr	x0, [x25]
 462486c:      	cbz	x0, 0x4624c78 <_ChromeMain+0x461f9dc>
 4624870:      	mov	w1, #0x648              ; =1608
 4624874:      	mov	x2, #0x0                ; =0
 4624878:      	bl	0xab5b0 <_ChromeMain+0xa6314>
 462487c:      	mov	x21, x0
 4624880:      	str	x22, [sp, #0x20]
 4624884:      	mov	w8, #0x2                ; =2
 4624888:      	strb	w8, [sp, #0x28]
 462488c:      	mov	w0, #0x28               ; =40
 4624890:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4624894:      	mov	x2, x0
 4624898:      	adrp	x8, 0x12000 <_ChromeMain+0xcd64>
 462489c:      	add	x8, x8, #0xdc0
 46248a0:      	str	w24, [x0]
 46248a4:      	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 46248a8:      	add	x9, x9, #0x600
 46248ac:      	stp	x8, x9, [x0, #0x8]
 46248b0:      	str	x23, [x0, #0x18]
 46248b4:      	add	x1, sp, #0x20
 46248b8:      	mov	x0, x21
 46248bc:      	bl	0x35956f4 <_ChromeMain+0x3590458>
 46248c0:      	ldrb	w8, [sp, #0x28]
 46248c4:      	cmp	w8, #0xff
 46248c8:      	b.eq	0x46248d4 <_ChromeMain+0x461f638>
 46248cc:      	ldr	x0, [sp, #0x20]
 46248d0:      	cbnz	x0, 0x4624aec <_ChromeMain+0x461f850>
 46248d4:      	ldr	x8, [x21]
 46248d8:      	ldr	x8, [x8, #0xa0]
 46248dc:      	mov	x0, x21
 46248e0:      	mov	w1, #0x0                ; =0
 46248e4:      	blr	x8
 46248e8:      	adrp	x8, 0xdf3e000 <dyld_stub_binder+0xdf3e000>
 46248ec:      	ldr	q0, [x8, #0x700]
 46248f0:      	str	q0, [sp, #0x20]
 46248f4:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46248f8:      	add	x1, x1, #0x488
 46248fc:      	add	x0, x21, #0xd8
 4624900:      	add	x2, sp, #0x20
 4624904:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4624908:      	ldrb	w8, [x21, #0x169]
 462490c:      	cbnz	w8, 0x4624ce0 <_ChromeMain+0x461fa44>
 4624910:      	ldr	x2, [x19, #0x198]
 4624914:      	mov	x0, x19
 4624918:      	mov	x1, x21
 462491c:      	bl	0x7793fc <_ChromeMain+0x774160>
 4624920:      	and	x8, x21, #0xfffffffc00000000
 4624924:      	ldr	x9, [x28, #0x88]
 4624928:      	cmp	x8, x9
 462492c:      	b.ne	0x4624938 <_ChromeMain+0x461f69c>
 4624930:      	mov	x0, x21
 4624934:      	bl	0x142fc <_ChromeMain+0xf060>
 4624938:      	ldr	x0, [x19, #0x438]
 462493c:      	and	x8, x0, #0xfffffffc00000000
 4624940:      	ldr	x9, [x28, #0x88]
 4624944:      	cmp	x8, x9
 4624948:      	b.ne	0x4624950 <_ChromeMain+0x461f6b4>
 462494c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4624950:      	str	x21, [x19, #0x438]
 4624954:      	mov	x0, x19
 4624958:      	bl	0x4623d40 <_ChromeMain+0x461eaa4>
 462495c:      	mov	x0, x19
 4624960:      	bl	0x4623ec0 <_ChromeMain+0x461ec24>
 4624964:      	mov	w21, #0x1               ; =1
 4624968:      	mov	x0, x19
 462496c:      	mov	x1, #0x2000000000       ; =137438953472
 4624970:      	mov	w2, #0x1                ; =1
 4624974:      	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4624978:      	strb	w21, [x19, #0x1cb]
 462497c:      	mov	x0, x19
 4624980:      	mov	w1, #0x1                ; =1
 4624984:      	bl	0x15377dc <_ChromeMain+0x1532540>
 4624988:      	mov	x0, x19
 462498c:      	mov	w1, #0x1                ; =1
 4624990:      	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4624994:      	ldr	x8, [x19, #0x20]
 4624998:      	ldr	w9, [x8, #0x8]
 462499c:      	cmp	w9, #0x2
 46249a0:      	b.eq	0x4624cec <_ChromeMain+0x461fa50>
 46249a4:      	ldrb	w9, [x8, #0x8a]
 46249a8:      	cbz	w9, 0x46249bc <_ChromeMain+0x461f720>
 46249ac:      	strb	wzr, [x8, #0x8a]
 46249b0:      	ldr	x0, [x8, #0x168]
 46249b4:      	mov	w1, #0x0                ; =0
 46249b8:      	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 46249bc:      	mov	x0, x19
 46249c0:      	bl	0x46227a0 <_ChromeMain+0x461d504>
 46249c4:      	ldr	x0, [x19, #0x2c8]
 46249c8:      	cbz	x0, 0x4624b28 <_ChromeMain+0x461f88c>
 46249cc:      	ldr	x8, [x19, #0x3e0]
 46249d0:      	ldr	w8, [x8, #0xf8]
 46249d4:      	mov	w9, #0x9                ; =9
 46249d8:      	mov	w10, #0x6e              ; =110
 46249dc:      	cmp	w8, #0x0
 46249e0:      	csel	w1, w10, w9, eq
 46249e4:      	bl	0x168e4e0 <_ChromeMain+0x1689244>
 46249e8:      	ldr	x21, [x19, #0x2c8]
 46249ec:      	cbz	x21, 0x4624b48 <_ChromeMain+0x461f8ac>
 46249f0:      	ldr	x8, [x19, #0x428]
 46249f4:      	ldr	x8, [x8, #0x358]
 46249f8:      	ldrsb	x24, [x8, #0x2f]
 46249fc:      	tbnz	x24, #0x3f, 0x4624ad0 <_ChromeMain+0x461f834>
 4624a00:      	add	x22, x8, #0x18
 4624a04:      	cmp	x24, #0xa
 4624a08:      	b.ls	0x4624ac4 <_ChromeMain+0x461f828>
 4624a0c:      	and	x25, x24, #0x7ffffffffffffff8
 4624a10:      	lsl	x8, x25, #1
 4624a14:      	add	x0, x8, #0x10
 4624a18:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4624a1c:      	mov	x23, x0
 4624a20:      	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 4624a24:      	sub	x8, x25, x8
 4624a28:      	stp	x0, x24, [sp, #0x8]
 4624a2c:      	str	x8, [sp, #0x18]
 4624a30:      	add	x8, x23, x24, lsl #1
 4624a34:      	cmp	x8, x23
 4624a38:      	b.lo	0x4624c5c <_ChromeMain+0x461f9c0>
 4624a3c:      	cmp	x23, x22
 4624a40:      	b.hi	0x4624a4c <_ChromeMain+0x461f7b0>
 4624a44:      	cmp	x8, x22
 4624a48:      	b.hi	0x4624c5c <_ChromeMain+0x461f9c0>
 4624a4c:      	lsl	x2, x24, #1
 4624a50:      	mov	x0, x23
 4624a54:      	mov	x1, x22
 4624a58:      	bl	0x800f2cc <_ChromeMain+0x800a030>
 4624a5c:      	strh	wzr, [x23, x24, lsl #1]
 4624a60:      	add	x1, sp, #0x8
 4624a64:      	mov	x0, x21
 4624a68:      	bl	0x116d8d8 <_ChromeMain+0x116863c>
 4624a6c:      	ldrsb	w8, [sp, #0x1f]
 4624a70:      	tbz	w8, #0x1f, 0x4624a84 <_ChromeMain+0x461f7e8>
 4624a74:      	ldr	x0, [sp, #0x8]
 4624a78:      	ldr	x8, [sp, #0x18]
 4624a7c:      	lsl	x1, x8, #1
 4624a80:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4624a84:      	ldrsb	w8, [sp, #0x67]
 4624a88:      	tbz	w8, #0x1f, 0x4624a9c <_ChromeMain+0x461f800>
 4624a8c:      	ldr	x0, [sp, #0x50]
 4624a90:      	ldr	x8, [sp, #0x60]
 4624a94:      	lsl	x1, x8, #1
 4624a98:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4624a9c:      	cbnz	x20, 0x4624b08 <_ChromeMain+0x461f86c>
 4624aa0:      	mov	x0, x19
 4624aa4:      	ldp	x29, x30, [sp, #0xc0]
 4624aa8:      	ldp	x20, x19, [sp, #0xb0]
 4624aac:      	ldp	x22, x21, [sp, #0xa0]
 4624ab0:      	ldp	x24, x23, [sp, #0x90]
 4624ab4:      	ldp	x26, x25, [sp, #0x80]
 4624ab8:      	ldp	x28, x27, [sp, #0x70]
 4624abc:      	add	sp, sp, #0xd0
 4624ac0:      	ret
 4624ac4:      	strb	w24, [sp, #0x1f]
 4624ac8:      	add	x23, sp, #0x8
 4624acc:      	b	0x4624a30 <_ChromeMain+0x461f794>
 4624ad0:      	ldr	x24, [x8, #0x20]
 4624ad4:      	mov	x9, #-0x11              ; =-17
 4624ad8:      	movk	x9, #0x7fff, lsl #48
 4624adc:      	cmp	x24, x9
 4624ae0:      	b.hs	0x4624d18 <_ChromeMain+0x461fa7c>
 4624ae4:      	ldr	x22, [x8, #0x18]
 4624ae8:      	b	0x4624a04 <_ChromeMain+0x461f768>
 4624aec:      	mov	w8, #-0x1               ; =-1
 4624af0:      	ldaddal	w8, w8, [x0]
 4624af4:      	cmp	w8, #0x1
 4624af8:      	b.ne	0x46248d4 <_ChromeMain+0x461f638>
 4624afc:      	ldr	x8, [x0, #0x10]
 4624b00:      	blr	x8
 4624b04:      	b	0x46248d4 <_ChromeMain+0x461f638>
 4624b08:      	mov	w8, #-0x1               ; =-1
 4624b0c:      	ldaddal	w8, w8, [x20]
 4624b10:      	cmp	w8, #0x1
 4624b14:      	b.ne	0x4624aa0 <_ChromeMain+0x461f804>
 4624b18:      	ldr	x8, [x20, #0x10]
 4624b1c:      	mov	x0, x20
 4624b20:      	blr	x8
 4624b24:      	b	0x4624aa0 <_ChromeMain+0x461f804>
 4624b28:      	bl	0xee6100 <_ChromeMain+0xee0e64>
 4624b2c:      	cbnz	w0, 0x4624d28 <_ChromeMain+0x461fa8c>
 4624b30:      	mov	x0, x19
 4624b34:      	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4624b38:      	ldr	x8, [x19, #0x2c8]
 4624b3c:      	str	x0, [x19, #0x2c8]
 4624b40:      	cbz	x8, 0x46249cc <_ChromeMain+0x461f730>
 4624b44:      	b	0x4624d3c <_ChromeMain+0x461faa0>
 4624b48:      	bl	0xee6100 <_ChromeMain+0xee0e64>
 4624b4c:      	cbnz	w0, 0x4624d54 <_ChromeMain+0x461fab8>
 4624b50:      	mov	x0, x19
 4624b54:      	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4624b58:      	mov	x21, x0
 4624b5c:      	ldr	x0, [x19, #0x2c8]
 4624b60:      	str	x21, [x19, #0x2c8]
 4624b64:      	cbz	x0, 0x46249f0 <_ChromeMain+0x461f754>
 4624b68:      	ldr	x8, [x0]
 4624b6c:      	ldr	x8, [x8, #0x8]
 4624b70:      	blr	x8
 4624b74:      	ldr	x21, [x19, #0x2c8]
 4624b78:      	b	0x46249f0 <_ChromeMain+0x461f754>
 4624b7c:      	str	wzr, [x22, #0xf0]
 4624b80:      	mov	x0, x22
 4624b84:      	mov	w1, #0x1                ; =1
 4624b88:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4624b8c:      	b	0x46242fc <_ChromeMain+0x461f060>
 4624b90:      	mov	x0, x23
 4624b94:      	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4624b98:      	mov	w1, #0x50               ; =80
 4624b9c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4624ba0:      	b	0x46246bc <_ChromeMain+0x461f420>
 4624ba4:      	mov	w8, #0x1                ; =1
 4624ba8:      	ldadd	w8, w8, [x20]
 4624bac:      	cmp	w8, #0x0
 4624bb0:      	b.le	0x4624d1c <_ChromeMain+0x461fa80>
 4624bb4:      	mov	w9, #0x7fffffff         ; =2147483647
 4624bb8:      	cmp	w8, w9
 4624bbc:      	b.ne	0x4624250 <_ChromeMain+0x461efb4>
 4624bc0:      	brk	#0
 4624bc4:      	hlt	#0
 4624bc8:      	brk	#0x1
 4624bcc:      	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4624bd0:      	mov	w1, #0x50               ; =80
 4624bd4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4624bd8:      	cbnz	x23, 0x46246a8 <_ChromeMain+0x461f40c>
 4624bdc:      	b	0x46246bc <_ChromeMain+0x461f420>
 4624be0:      	strb	wzr, [x22, #0x3b6]
 4624be4:      	mov	x0, x22
 4624be8:      	bl	0xf28308 <_ChromeMain+0xf2306c>
 4624bec:      	mov	x0, x22
 4624bf0:      	mov	w1, #0x2                ; =2
 4624bf4:      	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4624bf8:      	add	x0, x22, #0xf8
 4624bfc:      	add	x1, x22, #0x3b6
 4624c00:      	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4624c04:      	ldr	x22, [x19, #0x428]
 4624c08:      	b	0x46245ac <_ChromeMain+0x461f310>
 4624c0c:      	mov	w10, #0x6               ; =6
 4624c10:      	orr	x9, x10, x9, lsl #32
 4624c14:      	lsl	x8, x8, #32
 4624c18:      	orr	x8, x8, #0x6
 4624c1c:      	stp	x8, x9, [x22, #0xf8]
 4624c20:      	mov	x0, x22
 4624c24:      	mov	w1, #0x1                ; =1
 4624c28:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4624c2c:      	b	0x462438c <_ChromeMain+0x461f0f0>
 4624c30:      	mov	x0, x23
 4624c34:      	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4624c38:      	ldr	w2, [x23, #0x40]
 4624c3c:      	b	0x462464c <_ChromeMain+0x461f3b0>
 4624c40:      	mov	x0, x23
 4624c44:      	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4624c48:      	ldr	w24, [x23, #0x40]
 4624c4c:      	ldr	x23, [x21, #0x48]
 4624c50:      	b	0x462460c <_ChromeMain+0x461f370>
 4624c54:      	brk	#0
 4624c58:      	hlt	#0
 4624c5c:      	brk	#0x1
 4624c60:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4624c64:      	b	0x462439c <_ChromeMain+0x461f100>
 4624c68:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4624c6c:      	b	0x46244f0 <_ChromeMain+0x461f254>
 4624c70:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4624c74:      	b	0x46247ac <_ChromeMain+0x461f510>
 4624c78:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4624c7c:      	b	0x4624870 <_ChromeMain+0x461f5d4>
 4624c80:      	brk	#0
 4624c84:      	hlt	#0
 4624c88:      	brk	#0x1
 4624c8c:      	mov	x9, #0x1000000010       ; =68719476752
 4624c90:      	str	x9, [x8]
 4624c94:      	b	0x4624480 <_ChromeMain+0x461f1e4>
 4624c98:      	brk	#0
 4624c9c:      	hlt	#0
 4624ca0:      	brk	#0x1
 4624ca4:      	brk	#0
 4624ca8:      	hlt	#0
 4624cac:      	brk	#0x1
 4624cb0:      	brk	#0
 4624cb4:      	hlt	#0
 4624cb8:      	brk	#0x1
 4624cbc:      	brk	#0
 4624cc0:      	hlt	#0
 4624cc4:      	brk	#0x1
 4624cc8:      	brk	#0
 4624ccc:      	hlt	#0
 4624cd0:      	brk	#0x1
 4624cd4:      	brk	#0
 4624cd8:      	hlt	#0
 4624cdc:      	brk	#0x1
 4624ce0:      	brk	#0
 4624ce4:      	hlt	#0
 4624ce8:      	brk	#0x1
 4624cec:      	brk	#0
 4624cf0:      	hlt	#0
 4624cf4:      	brk	#0x1
 4624cf8:      	brk	#0
 4624cfc:      	hlt	#0
 4624d00:      	brk	#0x1
 4624d04:      	mov	x0, x23
 4624d08:      	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4624d0c:      	ldr	w3, [x23, #0x48]
 4624d10:      	ldr	x23, [x21, #0x48]
 4624d14:      	b	0x4624618 <_ChromeMain+0x461f37c>
 4624d18:      	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 4624d1c:      	brk	#0
 4624d20:      	hlt	#0
