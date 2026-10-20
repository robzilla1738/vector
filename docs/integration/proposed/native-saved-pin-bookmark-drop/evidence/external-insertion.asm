
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4612384: d10203ff     	sub	sp, sp, #0x80
 4612388: a9026ffc     	stp	x28, x27, [sp, #0x20]
 461238c: a90367fa     	stp	x26, x25, [sp, #0x30]
 4612390: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4612394: a90557f6     	stp	x22, x21, [sp, #0x50]
 4612398: a9064ff4     	stp	x20, x19, [sp, #0x60]
 461239c: a9077bfd     	stp	x29, x30, [sp, #0x70]
 46123a0: 9101c3fd     	add	x29, sp, #0x70
 46123a4: aa0003f4     	mov	x20, x0
 46123a8: aa0803f3     	mov	x19, x8
 46123ac: 39406028     	ldrb	w8, [x1, #0x18]
 46123b0: 340002e8     	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123b4: f9429a88     	ldr	x8, [x20, #0x530]
 46123b8: b40002a8     	cbz	x8, 0x461240c <_ChromeMain+0x460d170>
 46123bc: 39408508     	ldrb	w8, [x8, #0x21]
 46123c0: 34000268     	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123c4: 39472288     	ldrb	w8, [x20, #0x1c8]
 46123c8: 34000228     	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 46123cc: aa0303f5     	mov	x21, x3
 46123d0: aa1403e0     	mov	x0, x20
 46123d4: 97385468     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46123d8: b94002a8     	ldr	w8, [x21]
 46123dc: 6b00011f     	cmp	w8, w0
 46123e0: 5400016b     	b.lt	0x461240c <_ChromeMain+0x460d170>
 46123e4: 0b000029     	add	w9, w1, w0
 46123e8: 6b09011f     	cmp	w8, w9
 46123ec: 5400010a     	b.ge	0x461240c <_ChromeMain+0x460d170>
 46123f0: b94006a8     	ldr	w8, [x21, #0x4]
 46123f4: d360fc09     	lsr	x9, x0, #32
 46123f8: 6b09011f     	cmp	w8, w9
 46123fc: 5400008b     	b.lt	0x461240c <_ChromeMain+0x460d170>
 4612400: 8b418129     	add	x9, x9, x1, lsr #32
 4612404: 6b09011f     	cmp	w8, w9
 4612408: 540008eb     	b.lt	0x4612524 <_ChromeMain+0x460d288>
 461240c: aa1403e0     	mov	x0, x20
 4612410: 52800021     	mov	w1, #0x1                ; =1
 4612414: 94000353     	bl	0x4613160 <_ChromeMain+0x460dec4>
 4612418: 3900027f     	strb	wzr, [x19]
 461241c: 3900427f     	strb	wzr, [x19, #0x10]
 4612420: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4612424: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4612428: a94557f6     	ldp	x22, x21, [sp, #0x50]
 461242c: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4612430: a94367fa     	ldp	x26, x25, [sp, #0x30]
 4612434: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 4612438: 910203ff     	add	sp, sp, #0x80
 461243c: d65f03c0     	ret
 4612440: d2800016     	mov	x22, #0x0               ; =0
 4612444: aa1403e0     	mov	x0, x20
 4612448: 94000269     	bl	0x4612dec <_ChromeMain+0x460db50>
 461244c: b4fffe00     	cbz	x0, 0x461240c <_ChromeMain+0x460d170>
 4612450: aa0003f5     	mov	x21, x0
 4612454: f9402417     	ldr	x23, [x0, #0x48]
 4612458: b940faa8     	ldr	w8, [x21, #0xf8]
 461245c: 34fffd88     	cbz	w8, 0x461240c <_ChromeMain+0x460d170>
 4612460: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4612464: 90052d18     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4612468: f9404709     	ldr	x9, [x24, #0x88]
 461246c: eb09011f     	cmp	x8, x9
 4612470: 54000061     	b.ne	0x461247c <_ChromeMain+0x460d1e0>
 4612474: aa1503e0     	mov	x0, x21
 4612478: 96e807a1     	bl	0x142fc <_ChromeMain+0xf060>
 461247c: f943be80     	ldr	x0, [x20, #0x778]
 4612480: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4612484: f9404709     	ldr	x9, [x24, #0x88]
 4612488: eb09011f     	cmp	x8, x9
 461248c: 54000041     	b.ne	0x4612494 <_ChromeMain+0x460d1f8>
 4612490: 96e8416b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4612494: f903be95     	str	x21, [x20, #0x778]
 4612498: f94026a8     	ldr	x8, [x21, #0x48]
 461249c: eb17011f     	cmp	x8, x23
 46124a0: 9a973108     	csel	x8, x8, x23, lo
 46124a4: f903c688     	str	x8, [x20, #0x788]
 46124a8: f9429e88     	ldr	x8, [x20, #0x538]
 46124ac: b4000068     	cbz	x8, 0x46124b8 <_ChromeMain+0x460d21c>
 46124b0: 395d0e88     	ldrb	w8, [x20, #0x743]
 46124b4: 35004268     	cbnz	w8, 0x4612d00 <_ChromeMain+0x460da64>
 46124b8: f943068a     	ldr	x10, [x20, #0x608]
 46124bc: eb0a02df     	cmp	x22, x10
 46124c0: 54003362     	b.hs	0x4612b2c <_ChromeMain+0x460d890>
 46124c4: f943028b     	ldr	x11, [x20, #0x600]
 46124c8: f943a688     	ldr	x8, [x20, #0x748]
 46124cc: f943aa89     	ldr	x9, [x20, #0x750]
 46124d0: 8b09052c     	add	x12, x9, x9, lsl #1
 46124d4: d37df18c     	lsl	x12, x12, #3
 46124d8: aa0803ed     	mov	x13, x8
 46124dc: b400312c     	cbz	x12, 0x4612b00 <_ChromeMain+0x460d864>
 46124e0: 9343fd8d     	asr	x13, x12, #3
 46124e4: b201f3ee     	mov	x14, #-0x5555555555555556 ; =-6148914691236517206
 46124e8: f295556e     	movk	x14, #0xaaab
 46124ec: 9b0e7daf     	mul	x15, x13, x14
 46124f0: f876796e     	ldr	x14, [x11, x22, lsl #3]
 46124f4: 52800310     	mov	w16, #0x18              ; =24
 46124f8: aa0803ed     	mov	x13, x8
 46124fc: d341fdf1     	lsr	x17, x15, #1
 4612500: 9b103620     	madd	x0, x17, x16, x13
 4612504: f8418401     	ldr	x1, [x0], #0x18
 4612508: aa6f07e2     	mvn	x2, x15, lsr #1
 461250c: 8b0201ef     	add	x15, x15, x2
 4612510: eb0e003f     	cmp	x1, x14
 4612514: 9a9131ef     	csel	x15, x15, x17, lo
 4612518: 9a8d300d     	csel	x13, x0, x13, lo
 461251c: b5ffff0f     	cbnz	x15, 0x46124fc <_ChromeMain+0x460d260>
 4612520: 14000178     	b	0x4612b00 <_ChromeMain+0x460d864>
 4612524: 395d0e88     	ldrb	w8, [x20, #0x743]
 4612528: 37000e28     	tbnz	w8, #0x0, 0x46126ec <_ChromeMain+0x460d450>
 461252c: f9429e88     	ldr	x8, [x20, #0x538]
 4612530: b4000de8     	cbz	x8, 0x46126ec <_ChromeMain+0x460d450>
 4612534: f942a296     	ldr	x22, [x20, #0x540]
 4612538: b4000076     	cbz	x22, 0x4612544 <_ChromeMain+0x460d2a8>
 461253c: f94062c8     	ldr	x8, [x22, #0xc0]
 4612540: b5004448     	cbnz	x8, 0x4612dc8 <_ChromeMain+0x460db2c>
 4612544: f943aa88     	ldr	x8, [x20, #0x750]
 4612548: 8b080509     	add	x9, x8, x8, lsl #1
 461254c: d37df129     	lsl	x9, x9, #3
 4612550: b4000149     	cbz	x9, 0x4612578 <_ChromeMain+0x460d2dc>
 4612554: f943a68a     	ldr	x10, [x20, #0x748]
 4612558: d37df10b     	lsl	x11, x8, #3
 461255c: cb081568     	sub	x8, x11, x8, lsl #5
 4612560: 8b0a0129     	add	x9, x9, x10
 4612564: d1006129     	sub	x9, x9, #0x18
 4612568: b4003b89     	cbz	x9, 0x4612cd8 <_ChromeMain+0x460da3c>
 461256c: d1006129     	sub	x9, x9, #0x18
 4612570: 91006108     	add	x8, x8, #0x18
 4612574: b5ffffa8     	cbnz	x8, 0x4612568 <_ChromeMain+0x460d2cc>
 4612578: f903aa9f     	str	xzr, [x20, #0x750]
 461257c: f9430688     	ldr	x8, [x20, #0x608]
 4612580: d37df109     	lsl	x9, x8, #3
 4612584: b40008e9     	cbz	x9, 0x46126a0 <_ChromeMain+0x460d404>
 4612588: f9430296     	ldr	x22, [x20, #0x600]
 461258c: 8b080ed7     	add	x23, x22, x8, lsl #3
 4612590: 52800318     	mov	w24, #0x18              ; =24
 4612594: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 4612598: f2955579     	movk	x25, #0xaaab
 461259c: 14000009     	b	0x46125c0 <_ChromeMain+0x460d324>
 46125a0: aa0a03e9     	mov	x9, x10
 46125a4: 14000018     	b	0x4612604 <_ChromeMain+0x460d368>
 46125a8: 911d2280     	add	x0, x20, #0x748
 46125ac: 910043e2     	add	x2, sp, #0x10
 46125b0: 94004bf8     	bl	0x4625590 <_ChromeMain+0x46202f4>
 46125b4: 910022d6     	add	x22, x22, #0x8
 46125b8: eb1702df     	cmp	x22, x23
 46125bc: 54000720     	b.eq	0x46126a0 <_ChromeMain+0x460d404>
 46125c0: f94002c8     	ldr	x8, [x22]
 46125c4: f9000be8     	str	x8, [sp, #0x10]
 46125c8: f942ea8a     	ldr	x10, [x20, #0x5d0]
 46125cc: f942ee8b     	ldr	x11, [x20, #0x5d8]
 46125d0: d37ced69     	lsl	x9, x11, #4
 46125d4: b4fffe69     	cbz	x9, 0x46125a0 <_ChromeMain+0x460d304>
 46125d8: 9344fd2c     	asr	x12, x9, #4
 46125dc: aa0a03e9     	mov	x9, x10
 46125e0: d341fd8d     	lsr	x13, x12, #1
 46125e4: 8b0d112e     	add	x14, x9, x13, lsl #4
 46125e8: f84105cf     	ldr	x15, [x14], #0x10
 46125ec: aa6c07f0     	mvn	x16, x12, lsr #1
 46125f0: 8b10018c     	add	x12, x12, x16
 46125f4: eb0801ff     	cmp	x15, x8
 46125f8: 9a8d318c     	csel	x12, x12, x13, lo
 46125fc: 9a8931c9     	csel	x9, x14, x9, lo
 4612600: b5ffff0c     	cbnz	x12, 0x46125e0 <_ChromeMain+0x460d344>
 4612604: 8b0b114a     	add	x10, x10, x11, lsl #4
 4612608: eb0a013f     	cmp	x9, x10
 461260c: 54fffd40     	b.eq	0x46125b4 <_ChromeMain+0x460d318>
 4612610: f940012a     	ldr	x10, [x9]
 4612614: eb0a011f     	cmp	x8, x10
 4612618: 54fffce3     	b.lo	0x46125b4 <_ChromeMain+0x460d318>
 461261c: f9400529     	ldr	x9, [x9, #0x8]
 4612620: b4fffca9     	cbz	x9, 0x46125b4 <_ChromeMain+0x460d318>
 4612624: f943a68a     	ldr	x10, [x20, #0x748]
 4612628: f943aa8b     	ldr	x11, [x20, #0x750]
 461262c: 8b0b056c     	add	x12, x11, x11, lsl #1
 4612630: d37df18c     	lsl	x12, x12, #3
 4612634: b40002ec     	cbz	x12, 0x4612690 <_ChromeMain+0x460d3f4>
 4612638: 9343fd8c     	asr	x12, x12, #3
 461263c: 9b197d8c     	mul	x12, x12, x25
 4612640: aa0a03e1     	mov	x1, x10
 4612644: d341fd8d     	lsr	x13, x12, #1
 4612648: 9b1805ae     	madd	x14, x13, x24, x1
 461264c: f84185cf     	ldr	x15, [x14], #0x18
 4612650: aa6c07f0     	mvn	x16, x12, lsr #1
 4612654: 8b10018c     	add	x12, x12, x16
 4612658: eb0801ff     	cmp	x15, x8
 461265c: 9a8d318c     	csel	x12, x12, x13, lo
 4612660: 9a8131c1     	csel	x1, x14, x1, lo
 4612664: b5ffff0c     	cbnz	x12, 0x4612644 <_ChromeMain+0x460d3a8>
 4612668: 9106e123     	add	x3, x9, #0x1b8
 461266c: 9b182969     	madd	x9, x11, x24, x10
 4612670: eb09003f     	cmp	x1, x9
 4612674: 54fff9a0     	b.eq	0x46125a8 <_ChromeMain+0x460d30c>
 4612678: f9400029     	ldr	x9, [x1]
 461267c: eb09011f     	cmp	x8, x9
 4612680: 54fff943     	b.lo	0x46125a8 <_ChromeMain+0x460d30c>
 4612684: 3dc00060     	ldr	q0, [x3]
 4612688: 3c808020     	stur	q0, [x1, #0x8]
 461268c: 17ffffca     	b	0x46125b4 <_ChromeMain+0x460d318>
 4612690: aa0a03e1     	mov	x1, x10
 4612694: 17fffff5     	b	0x4612668 <_ChromeMain+0x460d3cc>
 4612698: aa0803e9     	mov	x9, x8
 461269c: 14000025     	b	0x4612730 <_ChromeMain+0x460d494>
 46126a0: f9429e80     	ldr	x0, [x20, #0x538]
 46126a4: d0048681     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 46126a8: 913fa021     	add	x1, x1, #0xfe8
 46126ac: 97070d75     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 46126b0: d360fc08     	lsr	x8, x0, #32
 46126b4: b9076288     	str	w8, [x20, #0x760]
 46126b8: 52800028     	mov	w8, #0x1                ; =1
 46126bc: 391d0e88     	strb	w8, [x20, #0x743]
 46126c0: 395dc288     	ldrb	w8, [x20, #0x770]
 46126c4: 34000048     	cbz	w8, 0x46126cc <_ChromeMain+0x460d430>
 46126c8: 391dc29f     	strb	wzr, [x20, #0x770]
 46126cc: f943c280     	ldr	x0, [x20, #0x780]
 46126d0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46126d4: 90052d09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46126d8: f9404529     	ldr	x9, [x9, #0x88]
 46126dc: eb09011f     	cmp	x8, x9
 46126e0: 54000041     	b.ne	0x46126e8 <_ChromeMain+0x460d44c>
 46126e4: 96e840d6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46126e8: f903c29f     	str	xzr, [x20, #0x780]
 46126ec: f943c280     	ldr	x0, [x20, #0x780]
 46126f0: b40004a0     	cbz	x0, 0x4612784 <_ChromeMain+0x460d4e8>
 46126f4: f942ea88     	ldr	x8, [x20, #0x5d0]
 46126f8: f942ee8a     	ldr	x10, [x20, #0x5d8]
 46126fc: d37ced49     	lsl	x9, x10, #4
 4612700: b4fffcc9     	cbz	x9, 0x4612698 <_ChromeMain+0x460d3fc>
 4612704: 9344fd2b     	asr	x11, x9, #4
 4612708: aa0803e9     	mov	x9, x8
 461270c: d341fd6c     	lsr	x12, x11, #1
 4612710: 8b0c112d     	add	x13, x9, x12, lsl #4
 4612714: f84105ae     	ldr	x14, [x13], #0x10
 4612718: aa6b07ef     	mvn	x15, x11, lsr #1
 461271c: 8b0f016b     	add	x11, x11, x15
 4612720: eb0001df     	cmp	x14, x0
 4612724: 9a8c316b     	csel	x11, x11, x12, lo
 4612728: 9a8931a9     	csel	x9, x13, x9, lo
 461272c: b5ffff0b     	cbnz	x11, 0x461270c <_ChromeMain+0x460d470>
 4612730: 8b0a1108     	add	x8, x8, x10, lsl #4
 4612734: eb08013f     	cmp	x9, x8
 4612738: 54000180     	b.eq	0x4612768 <_ChromeMain+0x460d4cc>
 461273c: f9400128     	ldr	x8, [x9]
 4612740: eb08001f     	cmp	x0, x8
 4612744: 54000123     	b.lo	0x4612768 <_ChromeMain+0x460d4cc>
 4612748: f9400528     	ldr	x8, [x9, #0x8]
 461274c: b40000e8     	cbz	x8, 0x4612768 <_ChromeMain+0x460d4cc>
 4612750: b9445509     	ldr	w9, [x8, #0x454]
 4612754: 340000a9     	cbz	w9, 0x4612768 <_ChromeMain+0x460d4cc>
 4612758: b904551f     	str	wzr, [x8, #0x454]
 461275c: aa0803e0     	mov	x0, x8
 4612760: 96fe3a87     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4612764: f943c280     	ldr	x0, [x20, #0x780]
 4612768: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461276c: 90052d09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4612770: f9404529     	ldr	x9, [x9, #0x88]
 4612774: eb09011f     	cmp	x8, x9
 4612778: 54000041     	b.ne	0x4612780 <_ChromeMain+0x460d4e4>
 461277c: 96e840b0     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4612780: f903c29f     	str	xzr, [x20, #0x780]
 4612784: f9429e80     	ldr	x0, [x20, #0x538]
 4612788: f94002a8     	ldr	x8, [x21]
 461278c: f9000be8     	str	x8, [sp, #0x10]
 4612790: 910043e1     	add	x1, sp, #0x10
 4612794: 97437653     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 4612798: f9430688     	ldr	x8, [x20, #0x608]
 461279c: b4ffe528     	cbz	x8, 0x4612440 <_ChromeMain+0x460d1a4>
 46127a0: d280000a     	mov	x10, #0x0               ; =0
 46127a4: 29422fec     	ldp	w12, w11, [sp, #0x10]
 46127a8: f9430289     	ldr	x9, [x20, #0x600]
 46127ac: f943a68d     	ldr	x13, [x20, #0x748]
 46127b0: f943aa8e     	ldr	x14, [x20, #0x750]
 46127b4: 8b0e05d0     	add	x16, x14, x14, lsl #1
 46127b8: d37df20e     	lsl	x14, x16, #3
 46127bc: 8b100daf     	add	x15, x13, x16, lsl #3
 46127c0: 9340f210     	sbfx	x16, x16, #0, #61
 46127c4: b201f3f1     	mov	x17, #-0x5555555555555556 ; =-6148914691236517206
 46127c8: f2955571     	movk	x17, #0xaaab
 46127cc: 9b117e10     	mul	x16, x16, x17
 46127d0: 52800311     	mov	w17, #0x18              ; =24
 46127d4: aa0803f6     	mov	x22, x8
 46127d8: 1400001a     	b	0x4612840 <_ChromeMain+0x460d5a4>
 46127dc: b9400c01     	ldr	w1, [x0, #0xc]
 46127e0: b9401402     	ldr	w2, [x0, #0x14]
 46127e4: 0b427c42     	add	w2, w2, w2, lsr #31
 46127e8: 0b820421     	add	w1, w1, w2, asr #1
 46127ec: 6b0b003f     	cmp	w1, w11
 46127f0: 9a88c156     	csel	x22, x10, x8, gt
 46127f4: b940faa1     	ldr	w1, [x21, #0xf8]
 46127f8: 340001e1     	cbz	w1, 0x4612834 <_ChromeMain+0x460d598>
 46127fc: b9400801     	ldr	w1, [x0, #0x8]
 4612800: 6b0c003f     	cmp	w1, w12
 4612804: 5400018c     	b.gt	0x4612834 <_ChromeMain+0x460d598>
 4612808: b9401002     	ldr	w2, [x0, #0x10]
 461280c: 0b010041     	add	w1, w2, w1
 4612810: 6b0c003f     	cmp	w1, w12
 4612814: 5400010d     	b.le	0x4612834 <_ChromeMain+0x460d598>
 4612818: b9400c01     	ldr	w1, [x0, #0xc]
 461281c: 6b0b003f     	cmp	w1, w11
 4612820: 540000ac     	b.gt	0x4612834 <_ChromeMain+0x460d598>
 4612824: b9401400     	ldr	w0, [x0, #0x14]
 4612828: 0b010000     	add	w0, w0, w1
 461282c: 6b0b001f     	cmp	w0, w11
 4612830: 540008ac     	b.gt	0x4612944 <_ChromeMain+0x460d6a8>
 4612834: 9100054a     	add	x10, x10, #0x1
 4612838: eb08015f     	cmp	x10, x8
 461283c: 54000300     	b.eq	0x461289c <_ChromeMain+0x460d600>
 4612840: f86a7935     	ldr	x21, [x9, x10, lsl #3]
 4612844: aa0d03e0     	mov	x0, x13
 4612848: b400018e     	cbz	x14, 0x4612878 <_ChromeMain+0x460d5dc>
 461284c: aa0d03e0     	mov	x0, x13
 4612850: aa1003e1     	mov	x1, x16
 4612854: d341fc22     	lsr	x2, x1, #1
 4612858: 9b110043     	madd	x3, x2, x17, x0
 461285c: f8418464     	ldr	x4, [x3], #0x18
 4612860: aa6107e5     	mvn	x5, x1, lsr #1
 4612864: 8b050021     	add	x1, x1, x5
 4612868: eb15009f     	cmp	x4, x21
 461286c: 9a823021     	csel	x1, x1, x2, lo
 4612870: 9a803060     	csel	x0, x3, x0, lo
 4612874: b5ffff01     	cbnz	x1, 0x4612854 <_ChromeMain+0x460d5b8>
 4612878: eb0f001f     	cmp	x0, x15
 461287c: 54fffdc0     	b.eq	0x4612834 <_ChromeMain+0x460d598>
 4612880: f9400001     	ldr	x1, [x0]
 4612884: f10002bf     	cmp	x21, #0x0
 4612888: fa4112a0     	ccmp	x21, x1, #0x0, ne
 461288c: 54fffd43     	b.lo	0x4612834 <_ChromeMain+0x460d598>
 4612890: eb0802df     	cmp	x22, x8
 4612894: 54fffb01     	b.ne	0x46127f4 <_ChromeMain+0x460d558>
 4612898: 17ffffd1     	b	0x46127dc <_ChromeMain+0x460d540>
 461289c: eb0802df     	cmp	x22, x8
 46128a0: 54000262     	b.hs	0x46128ec <_ChromeMain+0x460d650>
 46128a4: f876792a     	ldr	x10, [x9, x22, lsl #3]
 46128a8: b400022a     	cbz	x10, 0x46128ec <_ChromeMain+0x460d650>
 46128ac: f9401d55     	ldr	x21, [x10, #0x38]
 46128b0: b40001f5     	cbz	x21, 0x46128ec <_ChromeMain+0x460d650>
 46128b4: f94026b7     	ldr	x23, [x21, #0x48]
 46128b8: d37df2e8     	lsl	x8, x23, #3
 46128bc: b4ffdce8     	cbz	x8, 0x4612458 <_ChromeMain+0x460d1bc>
 46128c0: d2800009     	mov	x9, #0x0                ; =0
 46128c4: f94022ab     	ldr	x11, [x21, #0x40]
 46128c8: f869696c     	ldr	x12, [x11, x9]
 46128cc: eb0a019f     	cmp	x12, x10
 46128d0: 540000a0     	b.eq	0x46128e4 <_ChromeMain+0x460d648>
 46128d4: 91002129     	add	x9, x9, #0x8
 46128d8: eb09011f     	cmp	x8, x9
 46128dc: 54ffff61     	b.ne	0x46128c8 <_ChromeMain+0x460d62c>
 46128e0: 17fffede     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46128e4: 9343fd37     	asr	x23, x9, #3
 46128e8: 17fffedc     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46128ec: 8b080d28     	add	x8, x9, x8, lsl #3
 46128f0: f85f8109     	ldur	x9, [x8, #-0x8]
 46128f4: b4ffda89     	cbz	x9, 0x4612444 <_ChromeMain+0x460d1a8>
 46128f8: f9401d35     	ldr	x21, [x9, #0x38]
 46128fc: b4ffda55     	cbz	x21, 0x4612444 <_ChromeMain+0x460d1a8>
 4612900: f94026a8     	ldr	x8, [x21, #0x48]
 4612904: d37df10a     	lsl	x10, x8, #3
 4612908: b400016a     	cbz	x10, 0x4612934 <_ChromeMain+0x460d698>
 461290c: d280000b     	mov	x11, #0x0               ; =0
 4612910: f94022ac     	ldr	x12, [x21, #0x40]
 4612914: f86b698d     	ldr	x13, [x12, x11]
 4612918: eb0901bf     	cmp	x13, x9
 461291c: 540000a0     	b.eq	0x4612930 <_ChromeMain+0x460d694>
 4612920: 9100216b     	add	x11, x11, #0x8
 4612924: eb0b015f     	cmp	x10, x11
 4612928: 54ffff61     	b.ne	0x4612914 <_ChromeMain+0x460d678>
 461292c: 14000002     	b	0x4612934 <_ChromeMain+0x460d698>
 4612930: 9343fd68     	asr	x8, x11, #3
 4612934: 91000517     	add	x23, x8, #0x1
 4612938: 17fffec8     	b	0x4612458 <_ChromeMain+0x460d1bc>
 461293c: aa0803e9     	mov	x9, x8
 4612940: 14000011     	b	0x4612984 <_ChromeMain+0x460d6e8>
 4612944: 91000556     	add	x22, x10, #0x1
 4612948: f942ea88     	ldr	x8, [x20, #0x5d0]
 461294c: f942ee8a     	ldr	x10, [x20, #0x5d8]
 4612950: d37ced49     	lsl	x9, x10, #4
 4612954: b4ffff49     	cbz	x9, 0x461293c <_ChromeMain+0x460d6a0>
 4612958: 9344fd2b     	asr	x11, x9, #4
 461295c: aa0803e9     	mov	x9, x8
 4612960: d341fd6c     	lsr	x12, x11, #1
 4612964: 8b0c112d     	add	x13, x9, x12, lsl #4
 4612968: f84105ae     	ldr	x14, [x13], #0x10
 461296c: aa6b07ef     	mvn	x15, x11, lsr #1
 4612970: 8b0f016b     	add	x11, x11, x15
 4612974: eb1501df     	cmp	x14, x21
 4612978: 9a8c316b     	csel	x11, x11, x12, lo
 461297c: 9a8931a9     	csel	x9, x13, x9, lo
 4612980: b5ffff0b     	cbnz	x11, 0x4612960 <_ChromeMain+0x460d6c4>
 4612984: 8b0a1108     	add	x8, x8, x10, lsl #4
 4612988: eb08013f     	cmp	x9, x8
 461298c: 54000080     	b.eq	0x461299c <_ChromeMain+0x460d700>
 4612990: f9400128     	ldr	x8, [x9]
 4612994: eb0802bf     	cmp	x21, x8
 4612998: 54001682     	b.hs	0x4612c68 <_ChromeMain+0x460d9cc>
 461299c: d2800017     	mov	x23, #0x0               ; =0
 46129a0: 17fffeae     	b	0x4612458 <_ChromeMain+0x460d1bc>
 46129a4: aa0a03e8     	mov	x8, x10
 46129a8: 14000029     	b	0x4612a4c <_ChromeMain+0x460d7b0>
 46129ac: 6d4107e0     	ldp	d0, d1, [sp, #0x10]
 46129b0: b94017e9     	ldr	w9, [sp, #0x14]
 46129b4: 31009129     	adds	w9, w9, #0x24
 46129b8: 1a896369     	csel	w9, w27, w9, vs
 46129bc: b90017e9     	str	w9, [sp, #0x14]
 46129c0: 4e0c1d20     	mov.s	v0[1], w9
 46129c4: 0ea10c01     	sqadd.2s	v1, v0, v1
 46129c8: 0ea02c20     	sqsub.2s	v0, v1, v0
 46129cc: 6f00e401     	movi.2d	v1, #0000000000000000
 46129d0: 0ea16400     	smax.2s	v0, v0, v1
 46129d4: fd000fe0     	str	d0, [sp, #0x18]
 46129d8: f942a280     	ldr	x0, [x20, #0x540]
 46129dc: f9400508     	ldr	x8, [x8, #0x8]
 46129e0: b5001740     	cbnz	x0, 0x4612cc8 <_ChromeMain+0x460da2c>
 46129e4: 910043e1     	add	x1, sp, #0x10
 46129e8: aa0803e0     	mov	x0, x8
 46129ec: 970a4869     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46129f0: 91000718     	add	x24, x24, #0x1
 46129f4: eb19031f     	cmp	x24, x25
 46129f8: 54001b60     	b.eq	0x4612d64 <_ChromeMain+0x460dac8>
 46129fc: f9430688     	ldr	x8, [x20, #0x608]
 4612a00: eb08031f     	cmp	x24, x8
 4612a04: 540016a2     	b.hs	0x4612cd8 <_ChromeMain+0x460da3c>
 4612a08: f9430288     	ldr	x8, [x20, #0x600]
 4612a0c: f8787909     	ldr	x9, [x8, x24, lsl #3]
 4612a10: f942ea8a     	ldr	x10, [x20, #0x5d0]
 4612a14: f942ee8b     	ldr	x11, [x20, #0x5d8]
 4612a18: d37ced68     	lsl	x8, x11, #4
 4612a1c: b4fffc48     	cbz	x8, 0x46129a4 <_ChromeMain+0x460d708>
 4612a20: 9344fd0c     	asr	x12, x8, #4
 4612a24: aa0a03e8     	mov	x8, x10
 4612a28: d341fd8d     	lsr	x13, x12, #1
 4612a2c: 8b0d110e     	add	x14, x8, x13, lsl #4
 4612a30: f84105cf     	ldr	x15, [x14], #0x10
 4612a34: aa6c07f0     	mvn	x16, x12, lsr #1
 4612a38: 8b10018c     	add	x12, x12, x16
 4612a3c: eb0901ff     	cmp	x15, x9
 4612a40: 9a8d318c     	csel	x12, x12, x13, lo
 4612a44: 9a8831c8     	csel	x8, x14, x8, lo
 4612a48: b5ffff0c     	cbnz	x12, 0x4612a28 <_ChromeMain+0x460d78c>
 4612a4c: 8b0b114a     	add	x10, x10, x11, lsl #4
 4612a50: eb0a011f     	cmp	x8, x10
 4612a54: 54000080     	b.eq	0x4612a64 <_ChromeMain+0x460d7c8>
 4612a58: f940010b     	ldr	x11, [x8]
 4612a5c: eb0b013f     	cmp	x9, x11
 4612a60: 54000042     	b.hs	0x4612a68 <_ChromeMain+0x460d7cc>
 4612a64: aa0a03e8     	mov	x8, x10
 4612a68: f943a68c     	ldr	x12, [x20, #0x748]
 4612a6c: f943aa8d     	ldr	x13, [x20, #0x750]
 4612a70: 8b0d05ab     	add	x11, x13, x13, lsl #1
 4612a74: d37df16b     	lsl	x11, x11, #3
 4612a78: b400040b     	cbz	x11, 0x4612af8 <_ChromeMain+0x460d85c>
 4612a7c: 9343fd6b     	asr	x11, x11, #3
 4612a80: 9b1c7d6e     	mul	x14, x11, x28
 4612a84: aa0c03eb     	mov	x11, x12
 4612a88: d341fdcf     	lsr	x15, x14, #1
 4612a8c: 9b1a2df0     	madd	x16, x15, x26, x11
 4612a90: f8418611     	ldr	x17, [x16], #0x18
 4612a94: aa6e07e0     	mvn	x0, x14, lsr #1
 4612a98: 8b0001ce     	add	x14, x14, x0
 4612a9c: eb09023f     	cmp	x17, x9
 4612aa0: 9a8f31ce     	csel	x14, x14, x15, lo
 4612aa4: 9a8b320b     	csel	x11, x16, x11, lo
 4612aa8: b5ffff0e     	cbnz	x14, 0x4612a88 <_ChromeMain+0x460d7ec>
 4612aac: 9b1a31ac     	madd	x12, x13, x26, x12
 4612ab0: eb0c017f     	cmp	x11, x12
 4612ab4: 54000080     	b.eq	0x4612ac4 <_ChromeMain+0x460d828>
 4612ab8: f940016d     	ldr	x13, [x11]
 4612abc: eb0d013f     	cmp	x9, x13
 4612ac0: 54000042     	b.hs	0x4612ac8 <_ChromeMain+0x460d82c>
 4612ac4: aa0c03eb     	mov	x11, x12
 4612ac8: eb0a011f     	cmp	x8, x10
 4612acc: 54fff920     	b.eq	0x46129f0 <_ChromeMain+0x460d754>
 4612ad0: f9400509     	ldr	x9, [x8, #0x8]
 4612ad4: eb0c017f     	cmp	x11, x12
 4612ad8: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4612adc: 54fff8a0     	b.eq	0x46129f0 <_ChromeMain+0x460d754>
 4612ae0: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4612ae4: 3cc08160     	ldur	q0, [x11, #0x8]
 4612ae8: 3d8007e0     	str	q0, [sp, #0x10]
 4612aec: eb17031f     	cmp	x24, x23
 4612af0: 54fff743     	b.lo	0x46129d8 <_ChromeMain+0x460d73c>
 4612af4: 17ffffae     	b	0x46129ac <_ChromeMain+0x460d710>
 4612af8: aa0c03eb     	mov	x11, x12
 4612afc: 17ffffec     	b	0x4612aac <_ChromeMain+0x460d810>
 4612b00: 5280030e     	mov	w14, #0x18              ; =24
 4612b04: 9b0e212e     	madd	x14, x9, x14, x8
 4612b08: eb0e01bf     	cmp	x13, x14
 4612b0c: 540001c0     	b.eq	0x4612b44 <_ChromeMain+0x460d8a8>
 4612b10: f94001ae     	ldr	x14, [x13]
 4612b14: f876796f     	ldr	x15, [x11, x22, lsl #3]
 4612b18: eb0e01ff     	cmp	x15, x14
 4612b1c: 54000143     	b.lo	0x4612b44 <_ChromeMain+0x460d8a8>
 4612b20: a940a5a8     	ldp	x8, x9, [x13, #0x8]
 4612b24: d360fd0a     	lsr	x10, x8, #32
 4612b28: 14000027     	b	0x4612bc4 <_ChromeMain+0x460d928>
 4612b2c: b400042a     	cbz	x10, 0x4612bb0 <_ChromeMain+0x460d914>
 4612b30: f943028b     	ldr	x11, [x20, #0x600]
 4612b34: f943a688     	ldr	x8, [x20, #0x748]
 4612b38: f943aa89     	ldr	x9, [x20, #0x750]
 4612b3c: 8b09052c     	add	x12, x9, x9, lsl #1
 4612b40: d37df18c     	lsl	x12, x12, #3
 4612b44: 8b0a0d6a     	add	x10, x11, x10, lsl #3
 4612b48: aa0803eb     	mov	x11, x8
 4612b4c: b400022c     	cbz	x12, 0x4612b90 <_ChromeMain+0x460d8f4>
 4612b50: 9343fd8b     	asr	x11, x12, #3
 4612b54: b201f3ec     	mov	x12, #-0x5555555555555556 ; =-6148914691236517206
 4612b58: f295556c     	movk	x12, #0xaaab
 4612b5c: 9b0c7d6d     	mul	x13, x11, x12
 4612b60: f85f814c     	ldur	x12, [x10, #-0x8]
 4612b64: 5280030e     	mov	w14, #0x18              ; =24
 4612b68: aa0803eb     	mov	x11, x8
 4612b6c: d341fdaf     	lsr	x15, x13, #1
 4612b70: 9b0e2df0     	madd	x16, x15, x14, x11
 4612b74: f8418611     	ldr	x17, [x16], #0x18
 4612b78: aa6d07e0     	mvn	x0, x13, lsr #1
 4612b7c: 8b0001ad     	add	x13, x13, x0
 4612b80: eb0c023f     	cmp	x17, x12
 4612b84: 9a8f31ad     	csel	x13, x13, x15, lo
 4612b88: 9a8b320b     	csel	x11, x16, x11, lo
 4612b8c: b5ffff0d     	cbnz	x13, 0x4612b6c <_ChromeMain+0x460d8d0>
 4612b90: 5280030c     	mov	w12, #0x18              ; =24
 4612b94: 9b0c2128     	madd	x8, x9, x12, x8
 4612b98: eb08017f     	cmp	x11, x8
 4612b9c: 540000a0     	b.eq	0x4612bb0 <_ChromeMain+0x460d914>
 4612ba0: f9400168     	ldr	x8, [x11]
 4612ba4: f85f8149     	ldur	x9, [x10, #-0x8]
 4612ba8: eb08013f     	cmp	x9, x8
 4612bac: 54000ee2     	b.hs	0x4612d88 <_ChromeMain+0x460daec>
 4612bb0: f9429e88     	ldr	x8, [x20, #0x538]
 4612bb4: b5000948     	cbnz	x8, 0x4612cdc <_ChromeMain+0x460da40>
 4612bb8: d2c00409     	mov	x9, #0x2000000000       ; =137438953472
 4612bbc: 52800108     	mov	w8, #0x8                ; =8
 4612bc0: 5280002a     	mov	w10, #0x1               ; =1
 4612bc4: b3607d48     	bfi	x8, x10, #32, #32
 4612bc8: a90127e8     	stp	x8, x9, [sp, #0x10]
 4612bcc: f942f689     	ldr	x9, [x20, #0x5e8]
 4612bd0: f942fa8a     	ldr	x10, [x20, #0x5f0]
 4612bd4: d37ced48     	lsl	x8, x10, #4
 4612bd8: b40001a8     	cbz	x8, 0x4612c0c <_ChromeMain+0x460d970>
 4612bdc: 9344fd0b     	asr	x11, x8, #4
 4612be0: aa0903e8     	mov	x8, x9
 4612be4: d341fd6c     	lsr	x12, x11, #1
 4612be8: 8b0c110d     	add	x13, x8, x12, lsl #4
 4612bec: f84105ae     	ldr	x14, [x13], #0x10
 4612bf0: aa6b07ef     	mvn	x15, x11, lsr #1
 4612bf4: 8b0f016b     	add	x11, x11, x15
 4612bf8: eb1501df     	cmp	x14, x21
 4612bfc: 9a8c316b     	csel	x11, x11, x12, lo
 4612c00: 9a8831a8     	csel	x8, x13, x8, lo
 4612c04: b5ffff0b     	cbnz	x11, 0x4612be4 <_ChromeMain+0x460d948>
 4612c08: 14000002     	b	0x4612c10 <_ChromeMain+0x460d974>
 4612c0c: aa0903e8     	mov	x8, x9
 4612c10: 8b0a1129     	add	x9, x9, x10, lsl #4
 4612c14: eb09011f     	cmp	x8, x9
 4612c18: 54000180     	b.eq	0x4612c48 <_ChromeMain+0x460d9ac>
 4612c1c: f9400109     	ldr	x9, [x8]
 4612c20: eb0902bf     	cmp	x21, x9
 4612c24: 54000123     	b.lo	0x4612c48 <_ChromeMain+0x460d9ac>
 4612c28: b9400908     	ldr	w8, [x8, #0x8]
 4612c2c: 528001c9     	mov	w9, #0xe                ; =14
 4612c30: 1b092508     	madd	w8, w8, w9, w9
 4612c34: d3607d08     	lsl	x8, x8, #32
 4612c38: a9007fe8     	stp	x8, xzr, [sp]
 4612c3c: 910043e0     	add	x0, sp, #0x10
 4612c40: 910003e1     	mov	x1, sp
 4612c44: 96f6e91d     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 4612c48: f9429e80     	ldr	x0, [x20, #0x538]
 4612c4c: 910043e1     	add	x1, sp, #0x10
 4612c50: 95831fee     	bl	0xa6dac08 <_ChromeMain+0xa6d596c>
 4612c54: 3dc007e0     	ldr	q0, [sp, #0x10]
 4612c58: 3d800260     	str	q0, [x19]
 4612c5c: 52800028     	mov	w8, #0x1                ; =1
 4612c60: 39004268     	strb	w8, [x19, #0x10]
 4612c64: 17fffdef     	b	0x4612420 <_ChromeMain+0x460d184>
 4612c68: f9400520     	ldr	x0, [x9, #0x8]
 4612c6c: b4ffe980     	cbz	x0, 0x461299c <_ChromeMain+0x460d700>
 4612c70: b9445408     	ldr	w8, [x0, #0x454]
 4612c74: 7100051f     	cmp	w8, #0x1
 4612c78: 54000080     	b.eq	0x4612c88 <_ChromeMain+0x460d9ec>
 4612c7c: 52800028     	mov	w8, #0x1                ; =1
 4612c80: b9045408     	str	w8, [x0, #0x454]
 4612c84: 96fe393e     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4612c88: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4612c8c: 90052d17     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4612c90: f94046e9     	ldr	x9, [x23, #0x88]
 4612c94: eb09011f     	cmp	x8, x9
 4612c98: 54000061     	b.ne	0x4612ca4 <_ChromeMain+0x460da08>
 4612c9c: aa1503e0     	mov	x0, x21
 4612ca0: 96e80597     	bl	0x142fc <_ChromeMain+0xf060>
 4612ca4: f943c280     	ldr	x0, [x20, #0x780]
 4612ca8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4612cac: f94046e9     	ldr	x9, [x23, #0x88]
 4612cb0: eb09011f     	cmp	x8, x9
 4612cb4: 54000041     	b.ne	0x4612cbc <_ChromeMain+0x460da20>
 4612cb8: 96e83f61     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4612cbc: d2800017     	mov	x23, #0x0               ; =0
 4612cc0: f903c295     	str	x21, [x20, #0x780]
 4612cc4: 17fffde5     	b	0x4612458 <_ChromeMain+0x460d1bc>
 4612cc8: 910043e2     	add	x2, sp, #0x10
 4612ccc: aa0803e1     	mov	x1, x8
 4612cd0: 95812a6d     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 4612cd4: 17ffff47     	b	0x46129f0 <_ChromeMain+0x460d754>
 4612cd8: d4200020     	brk	#0x1
 4612cdc: b941c108     	ldr	w8, [x8, #0x1c0]
 4612ce0: 51004108     	sub	w8, w8, #0x10
 4612ce4: 0aa87d08     	bic	w8, w8, w8, asr #31
 4612ce8: 31002108     	adds	w8, w8, #0x8
 4612cec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4612cf0: 1a886128     	csel	w8, w9, w8, vs
 4612cf4: 51002108     	sub	w8, w8, #0x8
 4612cf8: b25b0109     	orr	x9, x8, #0x2000000000
 4612cfc: 17ffffb0     	b	0x4612bbc <_ChromeMain+0x460d920>
 4612d00: f9430688     	ldr	x8, [x20, #0x608]
 4612d04: eb16011f     	cmp	x8, x22
 4612d08: 9a963117     	csel	x23, x8, x22, lo
 4612d0c: 395dc289     	ldrb	w9, [x20, #0x770]
 4612d10: f943b68a     	ldr	x10, [x20, #0x768]
 4612d14: 34000069     	cbz	w9, 0x4612d20 <_ChromeMain+0x460da84>
 4612d18: eb17015f     	cmp	x10, x23
 4612d1c: 54ffbce0     	b.eq	0x46124b8 <_ChromeMain+0x460d21c>
 4612d20: f903b697     	str	x23, [x20, #0x768]
 4612d24: 5280002b     	mov	w11, #0x1               ; =1
 4612d28: 391dc28b     	strb	w11, [x20, #0x770]
 4612d2c: eb0a02ff     	cmp	x23, x10
 4612d30: 9a8a32eb     	csel	x11, x23, x10, lo
 4612d34: eb17015f     	cmp	x10, x23
 4612d38: 9a97814a     	csel	x10, x10, x23, hi
 4612d3c: 7100013f     	cmp	w9, #0x0
 4612d40: 9a971178     	csel	x24, x11, x23, ne
 4612d44: 9a881159     	csel	x25, x10, x8, ne
 4612d48: eb19031f     	cmp	x24, x25
 4612d4c: 540000c2     	b.hs	0x4612d64 <_ChromeMain+0x460dac8>
 4612d50: 5280031a     	mov	w26, #0x18              ; =24
 4612d54: 12b0001b     	mov	w27, #0x7fffffff        ; =2147483647
 4612d58: b201f3fc     	mov	x28, #-0x5555555555555556 ; =-6148914691236517206
 4612d5c: f295557c     	movk	x28, #0xaaab
 4612d60: 17ffff27     	b	0x46129fc <_ChromeMain+0x460d760>
 4612d64: f942a288     	ldr	x8, [x20, #0x540]
 4612d68: b4000088     	cbz	x8, 0x4612d78 <_ChromeMain+0x460dadc>
 4612d6c: f9406108     	ldr	x8, [x8, #0xc0]
 4612d70: f100011f     	cmp	x8, #0x0
 4612d74: 1a9f07e8     	cset	w8, ne
 4612d78: 39218a88     	strb	w8, [x20, #0x862]
 4612d7c: f9429e80     	ldr	x0, [x20, #0x538]
 4612d80: 96fe38ff     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4612d84: 17fffdcd     	b	0x46124b8 <_ChromeMain+0x460d21c>
 4612d88: a940a568     	ldp	x8, x9, [x11, #0x8]
 4612d8c: d360fd0a     	lsr	x10, x8, #32
 4612d90: d360fd2b     	lsr	x11, x9, #32
 4612d94: 8b49814a     	add	x10, x10, x9, lsr #32
 4612d98: 1100114a     	add	w10, w10, #0x4
 4612d9c: 2b0b014b     	adds	w11, w10, w11
 4612da0: 131f7d6c     	asr	w12, w11, #31
 4612da4: 5201018c     	eor	w12, w12, #0x80000000
 4612da8: 1a8b618b     	csel	w11, w12, w11, vs
 4612dac: 6b0a016b     	subs	w11, w11, w10
 4612db0: 131f7d6c     	asr	w12, w11, #31
 4612db4: 5201018c     	eor	w12, w12, #0x80000000
 4612db8: 1a8b618b     	csel	w11, w12, w11, vs
 4612dbc: 0aab7d6b     	bic	w11, w11, w11, asr #31
 4612dc0: b3607d69     	bfi	x9, x11, #32, #32
 4612dc4: 17ffff80     	b	0x4612bc4 <_ChromeMain+0x460d928>
 4612dc8: f9405ac8     	ldr	x8, [x22, #0xb0]
 4612dcc: f9402500     	ldr	x0, [x8, #0x48]
 4612dd0: 95271f9d     	bl	0x8fdac44 <_ChromeMain+0x8fd59a8>
 4612dd4: f94062c8     	ldr	x8, [x22, #0xc0]
 4612dd8: b5ffff88     	cbnz	x8, 0x4612dc8 <_ChromeMain+0x460db2c>
 4612ddc: aa1603e0     	mov	x0, x22
 4612de0: f94056c1     	ldr	x1, [x22, #0xa8]
 4612de4: 95812b31     	bl	0xa65daa8 <_ChromeMain+0xa65880c>
 4612de8: 17fffdd7     	b	0x4612544 <_ChromeMain+0x460d2a8>
