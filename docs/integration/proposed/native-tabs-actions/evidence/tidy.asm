
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4630098:      	stp	x28, x27, [sp, #-0x60]!
 463009c:      	stp	x26, x25, [sp, #0x10]
 46300a0:      	stp	x24, x23, [sp, #0x20]
 46300a4:      	stp	x22, x21, [sp, #0x30]
 46300a8:      	stp	x20, x19, [sp, #0x40]
 46300ac:      	stp	x29, x30, [sp, #0x50]
 46300b0:      	add	x29, sp, #0x50
 46300b4:      	sub	sp, sp, #0x320
 46300b8:      	ldr	x8, [x0, #0x458]
 46300bc:      	cbz	x8, 0x46300d8 <_ChromeMain+0x462ae3c>
 46300c0:      	ldr	x21, [x8, #0x538]
 46300c4:      	cbz	x21, 0x46300d8 <_ChromeMain+0x462ae3c>
 46300c8:      	mov	x19, x0
 46300cc:      	ldr	x8, [x0, #0x688]
 46300d0:      	ldrb	w8, [x8, #0x1c9]
 46300d4:      	cbnz	w8, 0x4630138 <_ChromeMain+0x462ae9c>
 46300d8:      	add	sp, sp, #0x320
 46300dc:      	ldp	x29, x30, [sp, #0x50]
 46300e0:      	ldp	x20, x19, [sp, #0x40]
 46300e4:      	ldp	x22, x21, [sp, #0x30]
 46300e8:      	ldp	x24, x23, [sp, #0x20]
 46300ec:      	ldp	x26, x25, [sp, #0x10]
 46300f0:      	ldp	x28, x27, [sp], #0x60
 46300f4:      	ret
 46300f8:      	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 46300fc:      	add	x9, x9, #0x878
 4630100:      	ldr	x8, [x9, w8, uxtw #3]
 4630104:      	add	x0, sp, #0x80
 4630108:      	add	x1, sp, #0x170
 463010c:      	blr	x8
 4630110:      	b	0x4630214 <_ChromeMain+0x462af78>
 4630114:      	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4630118:      	add	x9, x9, #0x878
 463011c:      	ldr	x8, [x9, w8, uxtw #3]
 4630120:      	add	x0, sp, #0x80
 4630124:      	add	x1, sp, #0x170
 4630128:      	blr	x8
 463012c:      	b	0x46301c4 <_ChromeMain+0x462af28>
 4630130:      	mov	w8, #-0x1               ; =-1
 4630134:      	b	0x46301dc <_ChromeMain+0x462af40>
 4630138:      	add	x22, sp, #0x170
 463013c:      	ldr	x20, [x21, #0x88]
 4630140:      	stp	xzr, xzr, [sp, #0x68]
 4630144:      	str	xzr, [sp, #0x78]
 4630148:      	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 463014c:      	add	x1, x1, #0x35e
 4630150:      	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4630154:      	add	x3, x3, #0xb8
 4630158:      	add	x0, sp, #0x68
 463015c:      	mov	w2, #0x6                ; =6
 4630160:      	bl	0x16a06f0 <_ChromeMain+0x169b454>
 4630164:      	adrp	x1, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 4630168:      	add	x1, x1, #0xa0d
 463016c:      	adrp	x3, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4630170:      	add	x3, x3, #0xcad
 4630174:      	add	x0, sp, #0x68
 4630178:      	mov	w2, #0x6                ; =6
 463017c:      	bl	0x16a06f0 <_ChromeMain+0x169b454>
 4630180:      	cbz	x20, 0x46303f8 <_ChromeMain+0x462b15c>
 4630184:      	ldr	x8, [x20]
 4630188:      	ldr	x8, [x8, #0x18]
 463018c:      	str	w8, [sp, #0x170]
 4630190:      	mov	w8, #0x2                ; =2
 4630194:      	strb	w8, [sp, #0x188]
 4630198:      	adrp	x1, 0xdae8000 <dyld_stub_binder+0xdae8000>
 463019c:      	add	x1, x1, #0x797
 46301a0:      	add	x0, sp, #0x68
 46301a4:      	add	x3, sp, #0x170
 46301a8:      	mov	w2, #0x9                ; =9
 46301ac:      	bl	0x53aec0 <_ChromeMain+0x535c24>
 46301b0:      	ldrb	w8, [sp, #0x188]
 46301b4:      	cmp	w8, #0xff
 46301b8:      	b.eq	0x46301c4 <_ChromeMain+0x462af28>
 46301bc:      	cmp	w8, #0x2
 46301c0:      	b.ne	0x4630114 <_ChromeMain+0x462ae78>
 46301c4:      	ldr	x1, [x20, #0x90]
 46301c8:      	cbz	x1, 0x4630130 <_ChromeMain+0x462ae94>
 46301cc:      	ldr	x0, [x20]
 46301d0:      	bl	0x38a52c <_ChromeMain+0x385290>
 46301d4:      	tst	w1, #0x1
 46301d8:      	csinv	w8, w0, wzr, ne
 46301dc:      	str	w8, [sp, #0x170]
 46301e0:      	mov	w8, #0x2                ; =2
 46301e4:      	strb	w8, [sp, #0x188]
 46301e8:      	adrp	x1, 0xdce5000 <dyld_stub_binder+0xdce5000>
 46301ec:      	add	x1, x1, #0x2b
 46301f0:      	add	x0, sp, #0x68
 46301f4:      	add	x3, sp, #0x170
 46301f8:      	mov	w2, #0x10               ; =16
 46301fc:      	bl	0x53aec0 <_ChromeMain+0x535c24>
 4630200:      	ldrb	w8, [sp, #0x188]
 4630204:      	cmp	w8, #0xff
 4630208:      	b.eq	0x4630214 <_ChromeMain+0x462af78>
 463020c:      	cmp	w8, #0x2
 4630210:      	b.ne	0x46300f8 <_ChromeMain+0x462ae5c>
 4630214:      	ldr	x8, [x20, #0x90]
 4630218:      	cbz	x8, 0x4630430 <_ChromeMain+0x462b194>
 463021c:      	ldr	x20, [x8, #0x40]
 4630220:      	cbz	x20, 0x4630430 <_ChromeMain+0x462b194>
 4630224:      	str	xzr, [sp, #0x1e0]
 4630228:      	movi.2d	v0, #0000000000000000
 463022c:      	stp	q0, q0, [x22, #0x50]
 4630230:      	stp	q0, q0, [x22, #0x30]
 4630234:      	stp	q0, q0, [x22, #0x10]
 4630238:      	str	q0, [x22]
 463023c:      	ldr	x8, [x20, #0x290]
 4630240:      	cbnz	x8, 0x46305f8 <_ChromeMain+0x462b35c>
 4630244:      	ldr	x8, [x20, #0x260]
 4630248:      	ldr	x9, [x8, #0x38]
 463024c:      	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 4630250:      	add	x10, x10, #0xf20
 4630254:      	ldrsw	x8, [x20, #0x2b4]
 4630258:      	cmp	x9, x10
 463025c:      	b.ne	0x46309fc <_ChromeMain+0x462b760>
 4630260:      	cmn	w8, #0x1
 4630264:      	b.eq	0x4630ac8 <_ChromeMain+0x462b82c>
 4630268:      	ldr	x9, [x20, #0x280]
 463026c:      	cmp	x9, x8
 4630270:      	b.ls	0x4630a9c <_ChromeMain+0x462b800>
 4630274:      	ldr	x9, [x20, #0x278]
 4630278:      	ldr	x8, [x9, x8, lsl #3]
 463027c:      	cbz	x8, 0x4630abc <_ChromeMain+0x462b820>
 4630280:      	ldrsb	x9, [x8, #0x3f]
 4630284:      	tbnz	x9, #0x3f, 0x4630aac <_ChromeMain+0x462b810>
 4630288:      	cbnz	x9, 0x4630ab4 <_ChromeMain+0x462b818>
 463028c:      	ldr	x8, [x8, #0x18]
 4630290:      	ldr	x8, [x8, #0x8]
 4630294:      	add	x1, x8, #0x60
 4630298:      	add	x0, sp, #0x170
 463029c:      	bl	0x139f94 <_ChromeMain+0x134cf8>
 46302a0:      	ldrb	w8, [sp, #0x188]
 46302a4:      	tbnz	w8, #0x0, 0x46302f4 <_ChromeMain+0x462b058>
 46302a8:      	ldrsw	x8, [x20, #0x2b4]
 46302ac:      	cmn	w8, #0x1
 46302b0:      	b.eq	0x4630ae4 <_ChromeMain+0x462b848>
 46302b4:      	ldr	x9, [x20, #0x280]
 46302b8:      	cmp	x9, x8
 46302bc:      	b.ls	0x4630a9c <_ChromeMain+0x462b800>
 46302c0:      	ldr	x9, [x20, #0x278]
 46302c4:      	ldr	x8, [x9, x8, lsl #3]
 46302c8:      	cbz	x8, 0x4630af0 <_ChromeMain+0x462b854>
 46302cc:      	ldrsb	x9, [x8, #0x3f]
 46302d0:      	tbnz	x9, #0x3f, 0x4630ad4 <_ChromeMain+0x462b838>
 46302d4:      	cbnz	x9, 0x4630adc <_ChromeMain+0x462b840>
 46302d8:      	ldr	x8, [x8, #0x18]
 46302dc:      	ldr	x8, [x8, #0x8]
 46302e0:      	add	x1, x8, #0x60
 46302e4:      	add	x0, sp, #0x170
 46302e8:      	bl	0x4cb90c <_ChromeMain+0x4c6670>
 46302ec:      	ldrb	w8, [sp, #0x188]
 46302f0:      	cbz	w8, 0x4630328 <_ChromeMain+0x462b08c>
 46302f4:      	add	x0, sp, #0x170
 46302f8:      	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46302fc:      	ldrsb	x8, [x0, #0x17]
 4630300:      	ldp	x9, x10, [x0]
 4630304:      	cmp	x8, #0x0
 4630308:      	csel	x3, x9, x0, mi
 463030c:      	cmp	w8, #0x0
 4630310:      	csel	x4, x10, x8, mi
 4630314:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4630318:      	add	x1, x1, #0xcb2
 463031c:      	add	x0, sp, #0x68
 4630320:      	mov	w2, #0xe                ; =14
 4630324:      	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4630328:      	mov	x0, x20
 463032c:      	bl	0x14a84dc <_ChromeMain+0x14a3240>
 4630330:      	ldrsb	x8, [x0, #0x17]
 4630334:      	ldp	x9, x10, [x0]
 4630338:      	cmp	x8, #0x0
 463033c:      	csel	x0, x9, x0, mi
 4630340:      	cmp	w8, #0x0
 4630344:      	csel	x1, x10, x8, mi
 4630348:      	sub	x8, x29, #0xd0
 463034c:      	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4630350:      	ldr	q0, [x22, #0x130]
 4630354:      	str	q0, [sp, #0x80]
 4630358:      	ldur	x8, [x29, #-0xc0]
 463035c:      	str	x8, [sp, #0x90]
 4630360:      	stp	xzr, xzr, [x29, #-0xd0]
 4630364:      	stur	xzr, [x29, #-0xc0]
 4630368:      	mov	w8, #0x4                ; =4
 463036c:      	strb	w8, [sp, #0x98]
 4630370:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4630374:      	add	x1, x1, #0xcc1
 4630378:      	add	x0, sp, #0x68
 463037c:      	add	x3, sp, #0x80
 4630380:      	mov	w2, #0x10               ; =16
 4630384:      	bl	0x53aec0 <_ChromeMain+0x535c24>
 4630388:      	ldrb	w8, [sp, #0x98]
 463038c:      	cmp	x8, #0xff
 4630390:      	b.eq	0x46303ac <_ChromeMain+0x462b110>
 4630394:      	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4630398:      	add	x9, x9, #0x878
 463039c:      	ldr	x8, [x9, x8, lsl #3]
 46303a0:      	sub	x0, x29, #0x80
 46303a4:      	add	x1, sp, #0x80
 46303a8:      	blr	x8
 46303ac:      	ldursb	w8, [x29, #-0xb9]
 46303b0:      	tbz	w8, #0x1f, 0x46303c4 <_ChromeMain+0x462b128>
 46303b4:      	ldur	x0, [x29, #-0xd0]
 46303b8:      	ldur	x8, [x29, #-0xc0]
 46303bc:      	and	x1, x8, #0x7fffffffffffffff
 46303c0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46303c4:      	add	x20, sp, #0x170
 46303c8:      	add	x0, x20, #0x70
 46303cc:      	mov	x1, #0x0                ; =0
 46303d0:      	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46303d4:      	add	x0, x20, #0x20
 46303d8:      	bl	0x27c78 <_ChromeMain+0x229dc>
 46303dc:      	ldrsb	w8, [sp, #0x187]
 46303e0:      	tbz	w8, #0x1f, 0x4630430 <_ChromeMain+0x462b194>
 46303e4:      	ldr	x0, [sp, #0x170]
 46303e8:      	ldr	x8, [sp, #0x180]
 46303ec:      	and	x1, x8, #0x7fffffffffffffff
 46303f0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46303f4:      	b	0x4630430 <_ChromeMain+0x462b194>
 46303f8:      	str	wzr, [sp, #0x170]
 46303fc:      	mov	w8, #0x2                ; =2
 4630400:      	strb	w8, [sp, #0x188]
 4630404:      	adrp	x1, 0xdae8000 <dyld_stub_binder+0xdae8000>
 4630408:      	add	x1, x1, #0x797
 463040c:      	add	x0, sp, #0x68
 4630410:      	add	x3, sp, #0x170
 4630414:      	mov	w2, #0x9                ; =9
 4630418:      	bl	0x53aec0 <_ChromeMain+0x535c24>
 463041c:      	ldrb	w8, [sp, #0x188]
 4630420:      	cmp	w8, #0xff
 4630424:      	b.eq	0x4630430 <_ChromeMain+0x462b194>
 4630428:      	cmp	w8, #0x2
 463042c:      	b.ne	0x46305dc <_ChromeMain+0x462b340>
 4630430:      	mov	x0, x19
 4630434:      	mov	w1, #0x1                ; =1
 4630438:      	bl	0x464d4b0 <_ChromeMain+0x4648214>
 463043c:      	ldr	x23, [x21, #0x68]
 4630440:      	mov	w0, #0x30               ; =48
 4630444:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630448:      	str	x0, [sp, #0x50]
 463044c:      	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4630450:      	ldr	q0, [x8, #0x3e0]
 4630454:      	stur	q0, [sp, #0x58]
 4630458:      	add	x9, x0, #0x20
 463045c:      	cmp	x9, x0
 4630460:      	b.lo	0x4630a9c <_ChromeMain+0x462b800>
 4630464:      	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 4630468:      	add	x8, x8, #0x949
 463046c:      	cmp	x9, x8
 4630470:      	ccmp	x0, x8, #0x2, hi
 4630474:      	b.ls	0x4630a9c <_ChromeMain+0x462b800>
 4630478:      	ldp	q0, q1, [x8]
 463047c:      	stp	q0, q1, [x0]
 4630480:      	strb	wzr, [x0, #0x20]
 4630484:      	mov	w8, #0x16               ; =22
 4630488:      	strb	w8, [sp, #0x47]
 463048c:      	add	x9, sp, #0x30
 4630490:      	add	x10, x9, #0x16
 4630494:      	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4630498:      	add	x8, x8, #0xce
 463049c:      	cmp	x10, x8
 46304a0:      	ccmp	x9, x8, #0x2, hi
 46304a4:      	b.ls	0x4630a9c <_ChromeMain+0x462b800>
 46304a8:      	ldr	q0, [x8]
 46304ac:      	str	q0, [sp, #0x30]
 46304b0:      	ldur	x8, [x8, #0xe]
 46304b4:      	stur	x8, [sp, #0x3e]
 46304b8:      	strb	wzr, [sp, #0x46]
 46304bc:      	ldr	x8, [sp, #0x68]
 46304c0:      	str	x8, [sp, #0x18]
 46304c4:      	ldur	q0, [sp, #0x70]
 46304c8:      	stp	xzr, xzr, [sp, #0x68]
 46304cc:      	str	xzr, [sp, #0x78]
 46304d0:      	stur	q0, [sp, #0x20]
 46304d4:      	ldr	x20, [x19, #0x1408]
 46304d8:      	cbz	x20, 0x46304f0 <_ChromeMain+0x462b254>
 46304dc:      	mov	w8, #0x1                ; =1
 46304e0:      	ldadd	w8, w8, [x20]
 46304e4:      	mov	w9, #0x7fffffff         ; =2147483647
 46304e8:      	cmp	w8, w9
 46304ec:      	b.eq	0x4630aa0 <_ChromeMain+0x462b804>
 46304f0:      	ldr	x21, [x19, #0x1410]
 46304f4:      	mov	w0, #0x48               ; =72
 46304f8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46304fc:      	mov	x25, x0
 4630500:      	mov	w8, #0x1                ; =1
 4630504:      	str	w8, [x0]
 4630508:      	adrp	x8, 0x4049000 <_ChromeMain+0x4043d64>
 463050c:      	add	x8, x8, #0x430
 4630510:      	adrp	x9, 0x3faa000 <_ChromeMain+0x3fa4d64>
 4630514:      	add	x9, x9, #0xa00
 4630518:      	stp	x8, x9, [x0, #0x8]
 463051c:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4630520:      	add	x8, x8, #0x280
 4630524:      	adr	x9, 0x464d4b0 <_ChromeMain+0x4648214>
 4630528:      	nop
 463052c:      	stp	x8, x9, [x0, #0x18]
 4630530:      	stp	xzr, x20, [x0, #0x28]
 4630534:      	str	x21, [x0, #0x38]
 4630538:      	strb	wzr, [x0, #0x40]
 463053c:      	cbz	x23, 0x4630560 <_ChromeMain+0x462b2c4>
 4630540:      	ldr	x24, [x19, #0x698]
 4630544:      	mov	x0, x23
 4630548:      	bl	0x16a186c <_ChromeMain+0x169c5d0>
 463054c:      	cbz	x0, 0x4630560 <_ChromeMain+0x462b2c4>
 4630550:      	add	x0, x0, #0x8
 4630554:      	add	x1, sp, #0x50
 4630558:      	bl	0xbfd304 <_ChromeMain+0xbf8068>
 463055c:      	cbnz	x0, 0x4630610 <_ChromeMain+0x462b374>
 4630560:      	cbnz	x25, 0x46305bc <_ChromeMain+0x462b320>
 4630564:      	mov	w20, #0x0               ; =0
 4630568:      	add	x0, sp, #0x18
 463056c:      	bl	0x95e480 <_ChromeMain+0x9591e4>
 4630570:      	ldrsb	w8, [sp, #0x47]
 4630574:      	tbz	w8, #0x1f, 0x4630588 <_ChromeMain+0x462b2ec>
 4630578:      	ldr	x0, [sp, #0x30]
 463057c:      	ldr	x8, [sp, #0x40]
 4630580:      	and	x1, x8, #0x7fffffffffffffff
 4630584:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630588:      	ldrsb	w8, [sp, #0x67]
 463058c:      	tbz	w8, #0x1f, 0x46305a0 <_ChromeMain+0x462b304>
 4630590:      	ldr	x0, [sp, #0x50]
 4630594:      	ldr	x8, [sp, #0x60]
 4630598:      	and	x1, x8, #0x7fffffffffffffff
 463059c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46305a0:      	tbnz	w20, #0x0, 0x46305b0 <_ChromeMain+0x462b314>
 46305a4:      	mov	x0, x19
 46305a8:      	mov	w1, #0x0                ; =0
 46305ac:      	bl	0x464d4b0 <_ChromeMain+0x4648214>
 46305b0:      	add	x0, sp, #0x68
 46305b4:      	bl	0x95e480 <_ChromeMain+0x9591e4>
 46305b8:      	b	0x46300d8 <_ChromeMain+0x462ae3c>
 46305bc:      	mov	w8, #-0x1               ; =-1
 46305c0:      	ldaddal	w8, w8, [x25]
 46305c4:      	cmp	w8, #0x1
 46305c8:      	b.ne	0x4630564 <_ChromeMain+0x462b2c8>
 46305cc:      	ldr	x8, [x25, #0x10]
 46305d0:      	mov	x0, x25
 46305d4:      	blr	x8
 46305d8:      	b	0x4630564 <_ChromeMain+0x462b2c8>
 46305dc:      	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 46305e0:      	add	x9, x9, #0x878
 46305e4:      	ldr	x8, [x9, w8, uxtw #3]
 46305e8:      	add	x0, sp, #0x80
 46305ec:      	add	x1, sp, #0x170
 46305f0:      	blr	x8
 46305f4:      	b	0x4630430 <_ChromeMain+0x462b194>
 46305f8:      	ldr	w9, [x20, #0x2b8]
 46305fc:      	cmn	w9, #0x1
 4630600:      	b.ne	0x4630a88 <_ChromeMain+0x462b7ec>
 4630604:      	ldrb	w9, [x8, #0x348]
 4630608:      	cbz	w9, 0x4630280 <_ChromeMain+0x462afe4>
 463060c:      	b	0x4630a10 <_ChromeMain+0x462b774>
 4630610:      	mov	x0, x23
 4630614:      	bl	0x6e4727c <_ChromeMain+0x6e41fe0>
 4630618:      	cbz	x0, 0x4630560 <_ChromeMain+0x462b2c4>
 463061c:      	mov	x20, x0
 4630620:      	ldrsb	x8, [sp, #0x47]
 4630624:      	add	x9, sp, #0x30
 4630628:      	ldp	x10, x11, [sp, #0x30]
 463062c:      	cmp	x8, #0x0
 4630630:      	csel	x3, x10, x9, mi
 4630634:      	cmp	w8, #0x0
 4630638:      	csel	x4, x11, x8, mi
 463063c:      	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4630640:      	add	x1, x1, #0x737
 4630644:      	add	x21, sp, #0x18
 4630648:      	add	x0, sp, #0x18
 463064c:      	mov	w2, #0x4                ; =4
 4630650:      	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4630654:      	stp	xzr, xzr, [sp, #0x80]
 4630658:      	str	xzr, [sp, #0x90]
 463065c:      	str	x21, [sp, #0x170]
 4630660:      	mov	w8, #0x6                ; =6
 4630664:      	strb	w8, [sp, #0x180]
 4630668:      	add	x0, sp, #0x170
 463066c:      	add	x2, sp, #0x80
 4630670:      	mov	w1, #0x0                ; =0
 4630674:      	mov	w3, #0xc8               ; =200
 4630678:      	bl	0x274a7a0 <_ChromeMain+0x2745504>
 463067c:      	tbz	w0, #0x0, 0x4630b14 <_ChromeMain+0x462b878>
 4630680:      	sub	x8, x29, #0xd0
 4630684:      	ldp	x26, x21, [sp, #0x80]
 4630688:      	ldr	x27, [sp, #0x90]
 463068c:      	movi.2d	v0, #0000000000000000
 4630690:      	stp	q0, q0, [x8, #0x50]
 4630694:      	stp	xzr, xzr, [sp, #0x170]
 4630698:      	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 463069c:      	ldrb	w8, [x8, #0x3f8]
 46306a0:      	cbz	w8, 0x4630a58 <_ChromeMain+0x462b7bc>
 46306a4:      	add	x0, sp, #0x170
 46306a8:      	mov	w1, #0x10               ; =16
 46306ac:      	bl	0xd3fb0 <_ChromeMain+0xced14>
 46306b0:      	ldp	x8, x9, [sp, #0x170]
 46306b4:      	orr	x10, x8, x9
 46306b8:      	cbz	x10, 0x4630afc <_ChromeMain+0x462b860>
 46306bc:      	stp	x27, x26, [sp, #0x8]
 46306c0:      	stp	x8, x9, [x29, #-0x80]
 46306c4:      	mov	w8, #0x1                ; =1
 46306c8:      	stur	w8, [x29, #-0x70]
 46306cc:      	sturb	w8, [x29, #-0x6c]
 46306d0:      	stur	w8, [x29, #-0x68]
 46306d4:      	ldr	x27, [x20, #0x68]
 46306d8:      	cbz	x27, 0x46306ec <_ChromeMain+0x462b450>
 46306dc:      	ldadd	w8, w8, [x27]
 46306e0:      	mov	w9, #0x7fffffff         ; =2147483647
 46306e4:      	cmp	w8, w9
 46306e8:      	b.eq	0x4630b08 <_ChromeMain+0x462b86c>
 46306ec:      	ldr	x8, [x20, #0x70]
 46306f0:      	add	x9, x8, #0x8
 46306f4:      	cmp	x8, #0x0
 46306f8:      	csel	x28, xzr, x9, eq
 46306fc:      	mov	w0, #0xf0               ; =240
 4630700:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4630704:      	mov	x26, x0
 4630708:      	sub	x3, x29, #0x80
 463070c:      	mov	x1, x27
 4630710:      	mov	x2, x28
 4630714:      	bl	0x6e46a40 <_ChromeMain+0x6e417a4>
 4630718:      	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 463071c:      	add	x8, x8, #0x180
 4630720:      	str	x8, [x0]
 4630724:      	str	x25, [x0, #0x88]
 4630728:      	adrp	x8, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 463072c:      	add	x8, x8, #0x520
 4630730:      	mov	x25, x0
 4630734:      	str	x8, [x25, #0x90]!
 4630738:      	stp	xzr, xzr, [x0, #0xa0]
 463073c:      	str	xzr, [x0, #0x98]
 4630740:      	mov	w8, #-0x1               ; =-1
 4630744:      	str	w8, [x0, #0xb0]
 4630748:      	movi.2d	v0, #0000000000000000
 463074c:      	stur	q0, [x0, #0xb8]
 4630750:      	stur	q0, [x0, #0xc8]
 4630754:      	stur	q0, [x0, #0xd8]
 4630758:      	str	xzr, [x0, #0xe8]
 463075c:      	adrp	x0, 0xdecc000 <dyld_stub_binder+0xdecc000>
 4630760:      	add	x0, x0, #0x1aa
 4630764:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4630768:      	add	x1, x1, #0xb1e
 463076c:      	add	x8, sp, #0x170
 4630770:      	mov	w2, #0x628              ; =1576
 4630774:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4630778:      	and	x8, x26, #0xfffffffc00000000
 463077c:      	adrp	x27, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4630780:      	ldr	x9, [x27, #0x88]
 4630784:      	cmp	x8, x9
 4630788:      	b.ne	0x4630794 <_ChromeMain+0x462b4f8>
 463078c:      	mov	x0, x26
 4630790:      	bl	0x142fc <_ChromeMain+0xf060>
 4630794:      	mov	w0, #0x38               ; =56
 4630798:      	bl	0xf368 <_ChromeMain+0xa0cc>
 463079c:      	mov	x3, x0
 46307a0:      	mov	w8, #0x1                ; =1
 46307a4:      	str	w8, [x0]
 46307a8:      	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 46307ac:      	add	x8, x8, #0xe80
 46307b0:      	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 46307b4:      	add	x9, x9, #0xb40
 46307b8:      	stp	x8, x9, [x0, #0x8]
 46307bc:      	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46307c0:      	add	x8, x8, #0xb00
 46307c4:      	adr	x9, 0x467938c <_ChromeMain+0x46740f0>
 46307c8:      	nop
 46307cc:      	stp	x8, x9, [x0, #0x18]
 46307d0:      	stp	xzr, x26, [x0, #0x28]
 46307d4:      	add	x1, sp, #0x170
 46307d8:      	mov	x0, x25
 46307dc:      	mov	x2, x24
 46307e0:      	bl	0x4aa504 <_ChromeMain+0x4a5268>
 46307e4:      	add	x0, sp, #0x80
 46307e8:      	mov	x1, x23
 46307ec:      	bl	0x6e42a6c <_ChromeMain+0x6e3d7d0>
 46307f0:      	ldrsb	w8, [sp, #0x47]
 46307f4:      	sub	x23, x29, #0xd0
 46307f8:      	tbnz	w8, #0x1f, 0x4630810 <_ChromeMain+0x462b574>
 46307fc:      	ldr	q0, [sp, #0x30]
 4630800:      	str	q0, [x22, #0x110]
 4630804:      	ldr	x8, [sp, #0x40]
 4630808:      	stur	x8, [x29, #-0xe0]
 463080c:      	b	0x463081c <_ChromeMain+0x462b580>
 4630810:      	ldp	x1, x2, [sp, #0x30]
 4630814:      	sub	x0, x29, #0xf0
 4630818:      	bl	0x18218 <_ChromeMain+0x12f7c>
 463081c:      	mov	x24, x21
 4630820:      	ldr	x21, [sp, #0x8]
 4630824:      	movi.2d	v0, #0000000000000000
 4630828:      	stp	q0, q0, [x22, #0x130]
 463082c:      	stp	q0, q0, [x22, #0x150]
 4630830:      	mov	w8, #0x4                ; =4
 4630834:      	stur	w8, [x29, #-0xd0]
 4630838:      	ldur	x8, [x29, #-0xe0]
 463083c:      	stp	x8, xzr, [x29, #-0x98]
 4630840:      	ldr	q0, [x22, #0x110]
 4630844:      	stur	q0, [x23, #0x28]
 4630848:      	stp	xzr, xzr, [x29, #-0xf0]
 463084c:      	stur	xzr, [x29, #-0xe0]
 4630850:      	mov	w8, #0x1                ; =1
 4630854:      	sturb	w8, [x29, #-0x90]
 4630858:      	add	x23, sp, #0x170
 463085c:      	stp	xzr, xzr, [sp, #0x170]
 4630860:      	stur	wzr, [x22, #0x17]
 4630864:      	str	xzr, [sp, #0x180]
 4630868:      	movi.2d	v0, #0xffffffff00000000
 463086c:      	stp	q0, q0, [x22, #0x20]
 4630870:      	stp	q0, q0, [x22, #0x40]
 4630874:      	strh	wzr, [sp, #0x1d0]
 4630878:      	stp	xzr, xzr, [sp, #0x1d8]
 463087c:      	str	xzr, [sp, #0x270]
 4630880:      	str	xzr, [sp, #0x268]
 4630884:      	str	xzr, [sp, #0x278]
 4630888:      	add	x8, sp, #0x268
 463088c:      	str	x8, [sp]
 4630890:      	add	x1, sp, #0x80
 4630894:      	sub	x2, x29, #0x80
 4630898:      	sub	x3, x29, #0xd0
 463089c:      	add	x5, sp, #0x50
 46308a0:      	add	x6, sp, #0x170
 46308a4:      	mov	x0, x20
 46308a8:      	mov	x4, x26
 46308ac:      	mov	w7, #0x0                ; =0
 46308b0:      	bl	0x6e472ac <_ChromeMain+0x6e42010>
 46308b4:      	ldrsb	w8, [sp, #0x27f]
 46308b8:      	tbz	w8, #0x1f, 0x46308cc <_ChromeMain+0x462b630>
 46308bc:      	ldr	x0, [sp, #0x268]
 46308c0:      	ldr	x8, [sp, #0x278]
 46308c4:      	and	x1, x8, #0x7fffffffffffffff
 46308c8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46308cc:      	add	x0, x23, #0x70
 46308d0:      	mov	x1, #0x0                ; =0
 46308d4:      	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46308d8:      	add	x0, x23, #0x20
 46308dc:      	bl	0x27c78 <_ChromeMain+0x229dc>
 46308e0:      	ldrsb	w8, [sp, #0x187]
 46308e4:      	ldr	x23, [sp, #0x10]
 46308e8:      	tbz	w8, #0x1f, 0x46308fc <_ChromeMain+0x462b660>
 46308ec:      	ldr	x0, [sp, #0x170]
 46308f0:      	ldr	x8, [sp, #0x180]
 46308f4:      	and	x1, x8, #0x7fffffffffffffff
 46308f8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46308fc:      	sub	x0, x29, #0xd0
 4630900:      	bl	0xa25ccd8 <_ChromeMain+0xa257a3c>
 4630904:      	ldursb	w8, [x29, #-0xd9]
 4630908:      	tbz	w8, #0x1f, 0x463091c <_ChromeMain+0x462b680>
 463090c:      	ldur	x0, [x29, #-0xf0]
 4630910:      	ldur	x8, [x29, #-0xe0]
 4630914:      	and	x1, x8, #0x7fffffffffffffff
 4630918:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463091c:      	ldrb	w8, [sp, #0xc8]
 4630920:      	cbz	w8, 0x463093c <_ChromeMain+0x462b6a0>
 4630924:      	ldrsb	w8, [sp, #0xc7]
 4630928:      	tbz	w8, #0x1f, 0x463093c <_ChromeMain+0x462b6a0>
 463092c:      	ldr	x0, [sp, #0xb0]
 4630930:      	ldr	x8, [sp, #0xc0]
 4630934:      	and	x1, x8, #0x7fffffffffffffff
 4630938:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463093c:      	ldr	x0, [sp, #0x80]
 4630940:      	and	x8, x0, #0xfffffffc00000000
 4630944:      	ldr	x9, [x27, #0x88]
 4630948:      	cmp	x8, x9
 463094c:      	b.ne	0x4630954 <_ChromeMain+0x462b6b8>
 4630950:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4630954:      	tbz	x21, #0x3f, 0x463096c <_ChromeMain+0x462b6d0>
 4630958:      	add	x0, sp, #0x80
 463095c:      	mov	x1, x23
 4630960:      	mov	x2, x24
 4630964:      	bl	0x18218 <_ChromeMain+0x12f7c>
 4630968:      	b	0x4630974 <_ChromeMain+0x462b6d8>
 463096c:      	stp	x23, x24, [sp, #0x80]
 4630970:      	str	x21, [sp, #0x90]
 4630974:      	strb	wzr, [sp, #0x168]
 4630978:      	strb	wzr, [sp, #0x170]
 463097c:      	mov	w22, #0xff              ; =255
 4630980:      	strb	w22, [sp, #0x258]
 4630984:      	add	x0, sp, #0x170
 4630988:      	add	x1, sp, #0x80
 463098c:      	bl	0x6cfd2e4 <_ChromeMain+0x6cf8048>
 4630990:      	strh	wzr, [sp, #0x260]
 4630994:      	sub	x1, x29, #0x80
 4630998:      	add	x2, sp, #0x170
 463099c:      	mov	x0, x20
 46309a0:      	bl	0x6e499fc <_ChromeMain+0x6e44760>
 46309a4:      	add	x0, sp, #0x170
 46309a8:      	bl	0xa25c5a0 <_ChromeMain+0xa257304>
 46309ac:      	ldrb	w8, [sp, #0x168]
 46309b0:      	cmp	w8, #0xff
 46309b4:      	b.eq	0x46309e0 <_ChromeMain+0x462b744>
 46309b8:      	cbnz	w8, 0x46309d8 <_ChromeMain+0x462b73c>
 46309bc:      	ldrsb	w8, [sp, #0x97]
 46309c0:      	tbz	w8, #0x1f, 0x46309e0 <_ChromeMain+0x462b744>
 46309c4:      	ldr	x0, [sp, #0x80]
 46309c8:      	ldr	x8, [sp, #0x90]
 46309cc:      	and	x1, x8, #0x7fffffffffffffff
 46309d0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46309d4:      	b	0x46309e0 <_ChromeMain+0x462b744>
 46309d8:      	add	x0, sp, #0x80
 46309dc:      	bl	0x5998318 <_ChromeMain+0x599307c>
 46309e0:      	strb	w22, [sp, #0x168]
 46309e4:      	tbz	x21, #0x3f, 0x46309f4 <_ChromeMain+0x462b758>
 46309e8:      	and	x1, x21, #0x7fffffffffffffff
 46309ec:      	mov	x0, x23
 46309f0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46309f4:      	mov	w20, #0x1               ; =1
 46309f8:      	b	0x4630568 <_ChromeMain+0x462b2cc>
 46309fc:      	cmn	w8, #0x1
 4630a00:      	b.ne	0x4630268 <_ChromeMain+0x462afcc>
 4630a04:      	brk	#0
 4630a08:      	hlt	#0
 4630a0c:      	brk	#0x1
 4630a10:      	ldrb	w9, [x20, #0x2e8]
 4630a14:      	cbz	w9, 0x4630244 <_ChromeMain+0x462afa8>
 4630a18:      	ldrsw	x9, [x20, #0x2b4]
 4630a1c:      	cmn	w9, #0x1
 4630a20:      	b.eq	0x4630b30 <_ChromeMain+0x462b894>
 4630a24:      	ldr	x10, [x20, #0x280]
 4630a28:      	cmp	x10, x9
 4630a2c:      	b.ls	0x4630a9c <_ChromeMain+0x462b800>
 4630a30:      	ldr	x10, [x20, #0x278]
 4630a34:      	ldr	x9, [x10, x9, lsl #3]
 4630a38:      	ldr	w9, [x9, #0x430]
 4630a3c:      	cmp	w9, #0x2
 4630a40:      	b.eq	0x4630244 <_ChromeMain+0x462afa8>
 4630a44:      	ldr	x9, [x20, #0x268]
 4630a48:      	cbz	x9, 0x4630b3c <_ChromeMain+0x462b8a0>
 4630a4c:      	ldrb	w9, [x9, #0x160]
 4630a50:      	tbnz	w9, #0x0, 0x4630244 <_ChromeMain+0x462afa8>
 4630a54:      	b	0x4630280 <_ChromeMain+0x462afe4>
 4630a58:      	add	x0, sp, #0x170
 4630a5c:      	mov	w1, #0x10               ; =16
 4630a60:      	bl	0x8019e84 <_ChromeMain+0x8014be8>
 4630a64:      	cbz	w0, 0x46306b0 <_ChromeMain+0x462b414>
 4630a68:      	bl	0x8805928 <_ChromeMain+0x880068c>
 4630a6c:      	add	x1, sp, #0x170
 4630a70:      	mov	w2, #0x10               ; =16
 4630a74:      	bl	0x21d7af8 <_ChromeMain+0x21d285c>
 4630a78:      	tbnz	w0, #0x0, 0x46306b0 <_ChromeMain+0x462b414>
 4630a7c:      	brk	#0
 4630a80:      	hlt	#0
 4630a84:      	brk	#0x1
 4630a88:      	ldrb	w9, [x20, #0x2e8]
 4630a8c:      	cbz	w9, 0x4630244 <_ChromeMain+0x462afa8>
 4630a90:      	ldrb	w9, [x8, #0x348]
 4630a94:      	cbnz	w9, 0x4630244 <_ChromeMain+0x462afa8>
 4630a98:      	b	0x4630280 <_ChromeMain+0x462afe4>
 4630a9c:      	brk	#0x1
 4630aa0:      	brk	#0
 4630aa4:      	hlt	#0
 4630aa8:      	brk	#0x1
 4630aac:      	ldr	x9, [x8, #0x30]
 4630ab0:      	cbz	x9, 0x463028c <_ChromeMain+0x462aff0>
 4630ab4:      	add	x1, x8, #0x28
 4630ab8:      	b	0x4630298 <_ChromeMain+0x462affc>
 4630abc:      	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4630ac0:      	mov	x1, x0
 4630ac4:      	b	0x4630298 <_ChromeMain+0x462affc>
 4630ac8:      	brk	#0
 4630acc:      	hlt	#0
 4630ad0:      	brk	#0x1
 4630ad4:      	ldr	x9, [x8, #0x30]
 4630ad8:      	cbz	x9, 0x46302d8 <_ChromeMain+0x462b03c>
 4630adc:      	add	x1, x8, #0x28
 4630ae0:      	b	0x46302e4 <_ChromeMain+0x462b048>
 4630ae4:      	brk	#0
 4630ae8:      	hlt	#0
 4630aec:      	brk	#0x1
 4630af0:      	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4630af4:      	mov	x1, x0
 4630af8:      	b	0x46302e4 <_ChromeMain+0x462b048>
 4630afc:      	brk	#0
 4630b00:      	hlt	#0
 4630b04:      	brk	#0x1
 4630b08:      	brk	#0
 4630b0c:      	hlt	#0
 4630b10:      	brk	#0x1
 4630b14:      	ldrsb	w8, [sp, #0x97]
 4630b18:      	tbz	w8, #0x1f, 0x4630560 <_ChromeMain+0x462b2c4>
 4630b1c:      	ldr	x0, [sp, #0x80]
 4630b20:      	ldr	x8, [sp, #0x90]
 4630b24:      	and	x1, x8, #0x7fffffffffffffff
 4630b28:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4630b2c:      	b	0x4630560 <_ChromeMain+0x462b2c4>
 4630b30:      	brk	#0
 4630b34:      	hlt	#0
 4630b38:      	brk	#0x1
 4630b3c:      	brk	#0
 4630b40:      	hlt	#0
 4630b44:      	brk	#0x1
