
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4615260: d10203ff     	sub	sp, sp, #0x80
 4615264: a9026ffc     	stp	x28, x27, [sp, #0x20]
 4615268: a90367fa     	stp	x26, x25, [sp, #0x30]
 461526c: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4615270: a90557f6     	stp	x22, x21, [sp, #0x50]
 4615274: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4615278: a9077bfd     	stp	x29, x30, [sp, #0x70]
 461527c: 9101c3fd     	add	x29, sp, #0x70
 4615280: f9429c08     	ldr	x8, [x0, #0x538]
 4615284: b4000108     	cbz	x8, 0x46152a4 <_ChromeMain+0x4610008>
 4615288: aa0003f3     	mov	x19, x0
 461528c: f9438808     	ldr	x8, [x0, #0x710]
 4615290: b40000a8     	cbz	x8, 0x46152a4 <_ChromeMain+0x4610008>
 4615294: f9439674     	ldr	x20, [x19, #0x728]
 4615298: f9430669     	ldr	x9, [x19, #0x608]
 461529c: eb09029f     	cmp	x20, x9
 46152a0: 54000120     	b.eq	0x46152c4 <_ChromeMain+0x4610028>
 46152a4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 46152a8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 46152ac: a94557f6     	ldp	x22, x21, [sp, #0x50]
 46152b0: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 46152b4: a94367fa     	ldp	x26, x25, [sp, #0x30]
 46152b8: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 46152bc: 910203ff     	add	sp, sp, #0x80
 46152c0: d65f03c0     	ret
 46152c4: 52800029     	mov	w9, #0x1                ; =1
 46152c8: 391d0a69     	strb	w9, [x19, #0x742]
 46152cc: eb01029f     	cmp	x20, x1
 46152d0: 9a813295     	csel	x21, x20, x1, lo
 46152d4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 46152d8: f9000fff     	str	xzr, [sp, #0x18]
 46152dc: eb080296     	subs	x22, x20, x8
 46152e0: 540015c1     	b.ne	0x4615598 <_ChromeMain+0x46102fc>
 46152e4: d2800017     	mov	x23, #0x0               ; =0
 46152e8: d2800016     	mov	x22, #0x0               ; =0
 46152ec: 14000021     	b	0x4615370 <_ChromeMain+0x46100d4>
 46152f0: f942a268     	ldr	x8, [x19, #0x540]
 46152f4: b4000088     	cbz	x8, 0x4615304 <_ChromeMain+0x4610068>
 46152f8: f9406108     	ldr	x8, [x8, #0xc0]
 46152fc: f100011f     	cmp	x8, #0x0
 4615300: 1a9f07e8     	cset	w8, ne
 4615304: 39218a68     	strb	w8, [x19, #0x862]
 4615308: f9429e60     	ldr	x0, [x19, #0x538]
 461530c: 96fe2f9c     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4615310: f94007e0     	ldr	x0, [sp, #0x8]
 4615314: b4fffc80     	cbz	x0, 0x46152a4 <_ChromeMain+0x4610008>
 4615318: f9400be8     	ldr	x8, [sp, #0x10]
 461531c: d37df109     	lsl	x9, x8, #3
 4615320: b4000109     	cbz	x9, 0x4615340 <_ChromeMain+0x46100a4>
 4615324: cb080fe8     	neg	x8, x8, lsl #3
 4615328: 8b000129     	add	x9, x9, x0
 461532c: d1002129     	sub	x9, x9, #0x8
 4615330: b4001329     	cbz	x9, 0x4615594 <_ChromeMain+0x46102f8>
 4615334: d1002129     	sub	x9, x9, #0x8
 4615338: 91002108     	add	x8, x8, #0x8
 461533c: b5ffffa8     	cbnz	x8, 0x4615330 <_ChromeMain+0x4610094>
 4615340: f9000bff     	str	xzr, [sp, #0x10]
 4615344: f9400fe8     	ldr	x8, [sp, #0x18]
 4615348: d37df101     	lsl	x1, x8, #3
 461534c: 96e7cedb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4615350: 17ffffd5     	b	0x46152a4 <_ChromeMain+0x4610008>
 4615354: 910023e0     	add	x0, sp, #0x8
 4615358: 910003e1     	mov	x1, sp
 461535c: 941870e9     	bl	0x4c31700 <_ChromeMain+0x4c2c464>
 4615360: f9430674     	ldr	x20, [x19, #0x608]
 4615364: 910006f7     	add	x23, x23, #0x1
 4615368: eb1402ff     	cmp	x23, x20
 461536c: 540003e2     	b.hs	0x46153e8 <_ChromeMain+0x461014c>
 4615370: f9430268     	ldr	x8, [x19, #0x600]
 4615374: f8777908     	ldr	x8, [x8, x23, lsl #3]
 4615378: f90003e8     	str	x8, [sp]
 461537c: eb1502ff     	cmp	x23, x21
 4615380: 540001a2     	b.hs	0x46153b4 <_ChromeMain+0x4610118>
 4615384: b4000148     	cbz	x8, 0x46153ac <_ChromeMain+0x4610110>
 4615388: f9438a69     	ldr	x9, [x19, #0x710]
 461538c: d37df129     	lsl	x9, x9, #3
 4615390: b40000e9     	cbz	x9, 0x46153ac <_ChromeMain+0x4610110>
 4615394: f943866a     	ldr	x10, [x19, #0x708]
 4615398: f840854b     	ldr	x11, [x10], #0x8
 461539c: eb08017f     	cmp	x11, x8
 46153a0: 54000200     	b.eq	0x46153e0 <_ChromeMain+0x4610144>
 46153a4: f1002129     	subs	x9, x9, #0x8
 46153a8: 54ffff81     	b.ne	0x4615398 <_ChromeMain+0x46100fc>
 46153ac: 52800029     	mov	w9, #0x1                ; =1
 46153b0: 8b160136     	add	x22, x9, x22
 46153b4: b4fffd08     	cbz	x8, 0x4615354 <_ChromeMain+0x46100b8>
 46153b8: f9438a69     	ldr	x9, [x19, #0x710]
 46153bc: d37df129     	lsl	x9, x9, #3
 46153c0: b4fffca9     	cbz	x9, 0x4615354 <_ChromeMain+0x46100b8>
 46153c4: f943866a     	ldr	x10, [x19, #0x708]
 46153c8: f840854b     	ldr	x11, [x10], #0x8
 46153cc: eb08017f     	cmp	x11, x8
 46153d0: 54fffca0     	b.eq	0x4615364 <_ChromeMain+0x46100c8>
 46153d4: f1002129     	subs	x9, x9, #0x8
 46153d8: 54ffff81     	b.ne	0x46153c8 <_ChromeMain+0x461012c>
 46153dc: 17ffffde     	b	0x4615354 <_ChromeMain+0x46100b8>
 46153e0: d2800009     	mov	x9, #0x0                ; =0
 46153e4: 17fffff3     	b	0x46153b0 <_ChromeMain+0x4610114>
 46153e8: f9400be8     	ldr	x8, [sp, #0x10]
 46153ec: eb16011f     	cmp	x8, x22
 46153f0: 9a963115     	csel	x21, x8, x22, lo
 46153f4: b4fff7f4     	cbz	x20, 0x46152f0 <_ChromeMain+0x4610054>
 46153f8: d2800016     	mov	x22, #0x0               ; =0
 46153fc: d2800017     	mov	x23, #0x0               ; =0
 4615400: f9438a68     	ldr	x8, [x19, #0x710]
 4615404: 8b0802b8     	add	x24, x21, x8
 4615408: 52800319     	mov	w25, #0x18              ; =24
 461540c: b201f3fa     	mov	x26, #-0x5555555555555556 ; =-6148914691236517206
 4615410: f295557a     	movk	x26, #0xaaab
 4615414: 1400000a     	b	0x461543c <_ChromeMain+0x46101a0>
 4615418: aa0903e8     	mov	x8, x9
 461541c: 1400001f     	b	0x4615498 <_ChromeMain+0x46101fc>
 4615420: 91002361     	add	x1, x27, #0x8
 4615424: aa1403e0     	mov	x0, x20
 4615428: 970a3dda     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 461542c: 910006d6     	add	x22, x22, #0x1
 4615430: f9430668     	ldr	x8, [x19, #0x608]
 4615434: eb0802df     	cmp	x22, x8
 4615438: 54fff5c2     	b.hs	0x46152f0 <_ChromeMain+0x4610054>
 461543c: eb1802df     	cmp	x22, x24
 4615440: fa5532c0     	ccmp	x22, x21, #0x0, lo
 4615444: 54ffff42     	b.hs	0x461542c <_ChromeMain+0x4610190>
 4615448: f9400be8     	ldr	x8, [sp, #0x10]
 461544c: eb0802ff     	cmp	x23, x8
 4615450: 54fff502     	b.hs	0x46152f0 <_ChromeMain+0x4610054>
 4615454: f94007e8     	ldr	x8, [sp, #0x8]
 4615458: f877790a     	ldr	x10, [x8, x23, lsl #3]
 461545c: f942ea69     	ldr	x9, [x19, #0x5d0]
 4615460: f942ee6b     	ldr	x11, [x19, #0x5d8]
 4615464: d37ced68     	lsl	x8, x11, #4
 4615468: b4fffd88     	cbz	x8, 0x4615418 <_ChromeMain+0x461017c>
 461546c: 9344fd0c     	asr	x12, x8, #4
 4615470: aa0903e8     	mov	x8, x9
 4615474: d341fd8d     	lsr	x13, x12, #1
 4615478: 8b0d110e     	add	x14, x8, x13, lsl #4
 461547c: f84105cf     	ldr	x15, [x14], #0x10
 4615480: aa6c07f0     	mvn	x16, x12, lsr #1
 4615484: 8b10018c     	add	x12, x12, x16
 4615488: eb0a01ff     	cmp	x15, x10
 461548c: 9a8d318c     	csel	x12, x12, x13, lo
 4615490: 9a8831c8     	csel	x8, x14, x8, lo
 4615494: b5ffff0c     	cbnz	x12, 0x4615474 <_ChromeMain+0x46101d8>
 4615498: 8b0b1129     	add	x9, x9, x11, lsl #4
 461549c: eb09011f     	cmp	x8, x9
 46154a0: 54000080     	b.eq	0x46154b0 <_ChromeMain+0x4610214>
 46154a4: f940010b     	ldr	x11, [x8]
 46154a8: eb0b015f     	cmp	x10, x11
 46154ac: 54000042     	b.hs	0x46154b4 <_ChromeMain+0x4610218>
 46154b0: aa0903e8     	mov	x8, x9
 46154b4: f943026a     	ldr	x10, [x19, #0x600]
 46154b8: f943926b     	ldr	x11, [x19, #0x720]
 46154bc: f943966c     	ldr	x12, [x19, #0x728]
 46154c0: 8b0c058d     	add	x13, x12, x12, lsl #1
 46154c4: d37df1ad     	lsl	x13, x13, #3
 46154c8: b400058d     	cbz	x13, 0x4615578 <_ChromeMain+0x46102dc>
 46154cc: 9343fdad     	asr	x13, x13, #3
 46154d0: 9b1a7dae     	mul	x14, x13, x26
 46154d4: f876794d     	ldr	x13, [x10, x22, lsl #3]
 46154d8: aa0b03fb     	mov	x27, x11
 46154dc: d341fdcf     	lsr	x15, x14, #1
 46154e0: 9b196df0     	madd	x16, x15, x25, x27
 46154e4: f8418611     	ldr	x17, [x16], #0x18
 46154e8: aa6e07e0     	mvn	x0, x14, lsr #1
 46154ec: 8b0001ce     	add	x14, x14, x0
 46154f0: eb0d023f     	cmp	x17, x13
 46154f4: 9a8f31ce     	csel	x14, x14, x15, lo
 46154f8: 9a9b321b     	csel	x27, x16, x27, lo
 46154fc: b5ffff0e     	cbnz	x14, 0x46154dc <_ChromeMain+0x4610240>
 4615500: 9b192d8b     	madd	x11, x12, x25, x11
 4615504: eb0b037f     	cmp	x27, x11
 4615508: 540000a0     	b.eq	0x461551c <_ChromeMain+0x4610280>
 461550c: f940036c     	ldr	x12, [x27]
 4615510: f876794a     	ldr	x10, [x10, x22, lsl #3]
 4615514: eb0c015f     	cmp	x10, x12
 4615518: 54000042     	b.hs	0x4615520 <_ChromeMain+0x4610284>
 461551c: aa0b03fb     	mov	x27, x11
 4615520: 910006f7     	add	x23, x23, #0x1
 4615524: eb09011f     	cmp	x8, x9
 4615528: 54fff820     	b.eq	0x461542c <_ChromeMain+0x4610190>
 461552c: f9400514     	ldr	x20, [x8, #0x8]
 4615530: eb1b017f     	cmp	x11, x27
 4615534: fa401a84     	ccmp	x20, #0x0, #0x4, ne
 4615538: 54fff7a0     	b.eq	0x461542c <_ChromeMain+0x4610190>
 461553c: f942a260     	ldr	x0, [x19, #0x540]
 4615540: b4fff700     	cbz	x0, 0x4615420 <_ChromeMain+0x4610184>
 4615544: aa1403e1     	mov	x1, x20
 4615548: 95812063     	bl	0xa65d6d4 <_ChromeMain+0xa658438>
 461554c: d360fc08     	lsr	x8, x0, #32
 4615550: 29412b69     	ldp	w9, w10, [x27, #0x8]
 4615554: 6b00013f     	cmp	w9, w0
 4615558: 7a480140     	ccmp	w10, w8, #0x0, eq
 461555c: 54000121     	b.ne	0x4615580 <_ChromeMain+0x46102e4>
 4615560: d360fc28     	lsr	x8, x1, #32
 4615564: 29422b69     	ldp	w9, w10, [x27, #0x10]
 4615568: 6b01013f     	cmp	w9, w1
 461556c: 7a480140     	ccmp	w10, w8, #0x0, eq
 4615570: 54fff5e0     	b.eq	0x461542c <_ChromeMain+0x4610190>
 4615574: 14000003     	b	0x4615580 <_ChromeMain+0x46102e4>
 4615578: aa0b03fb     	mov	x27, x11
 461557c: 17ffffe1     	b	0x4615500 <_ChromeMain+0x4610264>
 4615580: f942a260     	ldr	x0, [x19, #0x540]
 4615584: 91002362     	add	x2, x27, #0x8
 4615588: aa1403e1     	mov	x1, x20
 461558c: 9581203e     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 4615590: 17ffffa7     	b	0x461542c <_ChromeMain+0x4610190>
 4615594: d4200020     	brk	#0x1
 4615598: d37dfec8     	lsr	x8, x22, #61
 461559c: b50000e8     	cbnz	x8, 0x46155b8 <_ChromeMain+0x461031c>
 46155a0: d37df2c0     	lsl	x0, x22, #3
 46155a4: 96e7e771     	bl	0xf368 <_ChromeMain+0xa0cc>
 46155a8: a900ffe0     	stp	x0, xzr, [sp, #0x8]
 46155ac: f9000ff6     	str	x22, [sp, #0x18]
 46155b0: b5ffe9b4     	cbnz	x20, 0x46152e4 <_ChromeMain+0x4610048>
 46155b4: 17ffff4f     	b	0x46152f0 <_ChromeMain+0x4610054>
 46155b8: 9763f9f2     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 46155bc: 00000000     	udf	#0x0
 46155c0: 6dba2beb     	stp	d11, d10, [sp, #-0x60]!
 46155c4: 6d0123e9     	stp	d9, d8, [sp, #0x10]
 46155c8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46155cc: a90357f6     	stp	x22, x21, [sp, #0x30]
 46155d0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46155d4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46155d8: 910143fd     	add	x29, sp, #0x50
 46155dc: aa0003f3     	mov	x19, x0
 46155e0: 35000061     	cbnz	w1, 0x46155ec <_ChromeMain+0x4610350>
 46155e4: 391d0a7f     	strb	wzr, [x19, #0x742]
 46155e8: 14000003     	b	0x46155f4 <_ChromeMain+0x4610358>
 46155ec: aa1303e0     	mov	x0, x19
 46155f0: 94001891     	bl	0x461b834 <_ChromeMain+0x4616598>
 46155f4: f9438a68     	ldr	x8, [x19, #0x710]
 46155f8: d37df109     	lsl	x9, x8, #3
 46155fc: b40006e9     	cbz	x9, 0x46156d8 <_ChromeMain+0x461043c>
 4615600: f9438676     	ldr	x22, [x19, #0x708]
 4615604: 8b080ed7     	add	x23, x22, x8, lsl #3
 4615608: 9004c9e8     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 461560c: bd432509     	ldr	s9, [x8, #0x324]
 4615610: 1e2e100a     	fmov	s10, #1.00000000
 4615614: 1400000e     	b	0x461564c <_ChromeMain+0x46103b0>
 4615618: aa0903f8     	mov	x24, x9
 461561c: 1400001c     	b	0x461568c <_ChromeMain+0x46103f0>
 4615620: 4ea81d00     	mov.16b	v0, v8
 4615624: 97537d45     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4615628: f9400700     	ldr	x0, [x24, #0x8]
 461562c: 52800001     	mov	w1, #0x0                ; =0
 4615630: 52800002     	mov	w2, #0x0                ; =0
 4615634: 52800003     	mov	w3, #0x0                ; =0
 4615638: 52800024     	mov	w4, #0x1                ; =1
 461563c: 940006c1     	bl	0x4617140 <_ChromeMain+0x4611ea4>
 4615640: 910022d6     	add	x22, x22, #0x8
 4615644: eb1702df     	cmp	x22, x23
 4615648: 54000480     	b.eq	0x46156d8 <_ChromeMain+0x461043c>
 461564c: f94002c8     	ldr	x8, [x22]
 4615650: f942ea69     	ldr	x9, [x19, #0x5d0]
 4615654: f942ee6a     	ldr	x10, [x19, #0x5d8]
 4615658: d37ced4b     	lsl	x11, x10, #4
 461565c: b4fffdeb     	cbz	x11, 0x4615618 <_ChromeMain+0x461037c>
 4615660: 9344fd6b     	asr	x11, x11, #4
 4615664: aa0903f8     	mov	x24, x9
 4615668: d341fd6c     	lsr	x12, x11, #1
 461566c: 8b0c130d     	add	x13, x24, x12, lsl #4
 4615670: f84105ae     	ldr	x14, [x13], #0x10
 4615674: aa6b07ef     	mvn	x15, x11, lsr #1
 4615678: 8b0f016b     	add	x11, x11, x15
 461567c: eb0801df     	cmp	x14, x8
 4615680: 9a8c316b     	csel	x11, x11, x12, lo
 4615684: 9a9831b8     	csel	x24, x13, x24, lo
 4615688: b5ffff0b     	cbnz	x11, 0x4615668 <_ChromeMain+0x46103cc>
 461568c: 8b0a1129     	add	x9, x9, x10, lsl #4
 4615690: eb09031f     	cmp	x24, x9
 4615694: 54fffd60     	b.eq	0x4615640 <_ChromeMain+0x46103a4>
 4615698: f9400309     	ldr	x9, [x24]
 461569c: eb09011f     	cmp	x8, x9
 46156a0: 54fffd03     	b.lo	0x4615640 <_ChromeMain+0x46103a4>
 46156a4: f9400708     	ldr	x8, [x24, #0x8]
 46156a8: b4fffcc8     	cbz	x8, 0x4615640 <_ChromeMain+0x46103a4>
 46156ac: 39512509     	ldrb	w9, [x8, #0x449]
 46156b0: 34fffbc9     	cbz	w9, 0x4615628 <_ChromeMain+0x461038c>
 46156b4: 3911251f     	strb	wzr, [x8, #0x449]
 46156b8: f9401114     	ldr	x20, [x8, #0x20]
 46156bc: b4fffb74     	cbz	x20, 0x4615628 <_ChromeMain+0x461038c>
 46156c0: 39511d08     	ldrb	w8, [x8, #0x447]
 46156c4: 7100011f     	cmp	w8, #0x0
 46156c8: 1e2a1d28     	fcsel	s8, s9, s10, ne
 46156cc: f940b280     	ldr	x0, [x20, #0x160]
 46156d0: b4000aa0     	cbz	x0, 0x4615824 <_ChromeMain+0x4610588>
 46156d4: 17ffffd3     	b	0x4615620 <_ChromeMain+0x4610384>
 46156d8: f9429e68     	ldr	x8, [x19, #0x538]
 46156dc: b4000168     	cbz	x8, 0x4615708 <_ChromeMain+0x461046c>
 46156e0: 395d0668     	ldrb	w8, [x19, #0x741]
 46156e4: 34000128     	cbz	w8, 0x4615708 <_ChromeMain+0x461046c>
 46156e8: f9430668     	ldr	x8, [x19, #0x608]
 46156ec: d37df109     	lsl	x9, x8, #3
 46156f0: b40000a9     	cbz	x9, 0x4615704 <_ChromeMain+0x4610468>
 46156f4: d2800002     	mov	x2, #0x0                ; =0
 46156f8: f9430274     	ldr	x20, [x19, #0x600]
 46156fc: 8b080e95     	add	x21, x20, x8, lsl #3
 4615700: 1400002c     	b	0x46157b0 <_ChromeMain+0x4610514>
 4615704: 391d067f     	strb	wzr, [x19, #0x741]
 4615708: f9438661     	ldr	x1, [x19, #0x708]
 461570c: 911c2260     	add	x0, x19, #0x708
 4615710: 941fc51c     	bl	0x4e06b80 <_ChromeMain+0x4e018e4>
 4615714: f9439668     	ldr	x8, [x19, #0x728]
 4615718: 8b080509     	add	x9, x8, x8, lsl #1
 461571c: d37df129     	lsl	x9, x9, #3
 4615720: b4000149     	cbz	x9, 0x4615748 <_ChromeMain+0x46104ac>
 4615724: f943926a     	ldr	x10, [x19, #0x720]
 4615728: d37df10b     	lsl	x11, x8, #3
 461572c: cb081568     	sub	x8, x11, x8, lsl #5
 4615730: 8b0a0129     	add	x9, x9, x10
 4615734: d1006129     	sub	x9, x9, #0x18
 4615738: b4000949     	cbz	x9, 0x4615860 <_ChromeMain+0x46105c4>
 461573c: d1006129     	sub	x9, x9, #0x18
 4615740: 91006108     	add	x8, x8, #0x18
 4615744: b5ffffa8     	cbnz	x8, 0x4615738 <_ChromeMain+0x461049c>
 4615748: f903967f     	str	xzr, [x19, #0x728]
 461574c: 911e4274     	add	x20, x19, #0x790
 4615750: f943ca60     	ldr	x0, [x19, #0x790]
 4615754: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4615758: b0052ce9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461575c: f9404529     	ldr	x9, [x9, #0x88]
 4615760: eb09011f     	cmp	x8, x9
 4615764: 54000041     	b.ne	0x461576c <_ChromeMain+0x46104d0>
 4615768: 96e834b5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461576c: a9007e9f     	stp	xzr, xzr, [x20]
 4615770: 3900429f     	strb	wzr, [x20, #0x10]
 4615774: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4615778: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 461577c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4615780: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4615784: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 4615788: 6cc62beb     	ldp	d11, d10, [sp], #0x60
 461578c: d65f03c0     	ret
 4615790: aa0903ea     	mov	x10, x9
 4615794: 14000017     	b	0x46157f0 <_ChromeMain+0x4610554>
 4615798: 91000456     	add	x22, x2, #0x1
 461579c: 97c0e777     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 46157a0: aa1603e2     	mov	x2, x22
 46157a4: 91002294     	add	x20, x20, #0x8
 46157a8: eb15029f     	cmp	x20, x21
 46157ac: 54fffac0     	b.eq	0x4615704 <_ChromeMain+0x4610468>
 46157b0: f9400288     	ldr	x8, [x20]
 46157b4: f942ea69     	ldr	x9, [x19, #0x5d0]
 46157b8: f942ee6b     	ldr	x11, [x19, #0x5d8]
 46157bc: d37ced6a     	lsl	x10, x11, #4
 46157c0: b4fffe8a     	cbz	x10, 0x4615790 <_ChromeMain+0x46104f4>
 46157c4: 9344fd4c     	asr	x12, x10, #4
 46157c8: aa0903ea     	mov	x10, x9
 46157cc: d341fd8d     	lsr	x13, x12, #1
 46157d0: 8b0d114e     	add	x14, x10, x13, lsl #4
 46157d4: f84105cf     	ldr	x15, [x14], #0x10
 46157d8: aa6c07f0     	mvn	x16, x12, lsr #1
 46157dc: 8b10018c     	add	x12, x12, x16
 46157e0: eb0801ff     	cmp	x15, x8
 46157e4: 9a8d318c     	csel	x12, x12, x13, lo
 46157e8: 9a8a31ca     	csel	x10, x14, x10, lo
 46157ec: b5ffff0c     	cbnz	x12, 0x46157cc <_ChromeMain+0x4610530>
 46157f0: 8b0b1129     	add	x9, x9, x11, lsl #4
 46157f4: eb09015f     	cmp	x10, x9
 46157f8: 54fffd60     	b.eq	0x46157a4 <_ChromeMain+0x4610508>
 46157fc: f9400149     	ldr	x9, [x10]
 4615800: eb09011f     	cmp	x8, x9
 4615804: 54fffd03     	b.lo	0x46157a4 <_ChromeMain+0x4610508>
 4615808: f9400541     	ldr	x1, [x10, #0x8]
 461580c: b4fffcc1     	cbz	x1, 0x46157a4 <_ChromeMain+0x4610508>
 4615810: f940c428     	ldr	x8, [x1, #0x188]
 4615814: f9429e60     	ldr	x0, [x19, #0x538]
 4615818: eb08001f     	cmp	x0, x8
 461581c: 54fffc41     	b.ne	0x46157a4 <_ChromeMain+0x4610508>
 4615820: 17ffffde     	b	0x4615798 <_ChromeMain+0x46104fc>
 4615824: 52802400     	mov	w0, #0x120              ; =288
 4615828: 96e7e6d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 461582c: aa0003f5     	mov	x21, x0
 4615830: d2800001     	mov	x1, #0x0                ; =0
 4615834: 972992a9     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4615838: b40000a0     	cbz	x0, 0x461584c <_ChromeMain+0x46105b0>
 461583c: b9400aa8     	ldr	w8, [x21, #0x8]
 4615840: 31000508     	adds	w8, w8, #0x1
 4615844: b9000aa8     	str	w8, [x21, #0x8]
 4615848: 540000e2     	b.hs	0x4615864 <_ChromeMain+0x46105c8>
 461584c: aa1403e0     	mov	x0, x20
 4615850: aa1503e1     	mov	x1, x21
 4615854: 97319a6a     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4615858: f940b280     	ldr	x0, [x20, #0x160]
 461585c: 17ffff71     	b	0x4615620 <_ChromeMain+0x4610384>
 4615860: d4200020     	brk	#0x1
 4615864: d4200000     	brk	#0
 4615868: d4400000     	hlt	#0
 461586c: d4200020     	brk	#0x1
 4615870: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4615874: a90167fa     	stp	x26, x25, [sp, #0x10]
 4615878: a9025ff8     	stp	x24, x23, [sp, #0x20]
 461587c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4615880: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4615884: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4615888: 910143fd     	add	x29, sp, #0x50
 461588c: f9429008     	ldr	x8, [x0, #0x520]
 4615890: b4000308     	cbz	x8, 0x46158f0 <_ChromeMain+0x4610654>
 4615894: aa0003f3     	mov	x19, x0
 4615898: f9445009     	ldr	x9, [x0, #0x8a0]
 461589c: f944540b     	ldr	x11, [x0, #0x8a8]
 46158a0: d37ced6a     	lsl	x10, x11, #4
 46158a4: b40003ca     	cbz	x10, 0x461591c <_ChromeMain+0x4610680>
 46158a8: 9344fd4c     	asr	x12, x10, #4
 46158ac: aa0903ea     	mov	x10, x9
 46158b0: d341fd8d     	lsr	x13, x12, #1
 46158b4: 8b0d114e     	add	x14, x10, x13, lsl #4
 46158b8: f84105cf     	ldr	x15, [x14], #0x10
 46158bc: aa6c07f0     	mvn	x16, x12, lsr #1
 46158c0: 8b10018c     	add	x12, x12, x16
 46158c4: eb0101ff     	cmp	x15, x1
 46158c8: 9a8db18c     	csel	x12, x12, x13, lt
 46158cc: 9a8ab1ca     	csel	x10, x14, x10, lt
 46158d0: b5ffff0c     	cbnz	x12, 0x46158b0 <_ChromeMain+0x4610614>
 46158d4: 8b0b1129     	add	x9, x9, x11, lsl #4
 46158d8: eb09015f     	cmp	x10, x9
 46158dc: 54000080     	b.eq	0x46158ec <_ChromeMain+0x4610650>
 46158e0: f9400149     	ldr	x9, [x10]
 46158e4: eb09003f     	cmp	x1, x9
 46158e8: 5400022a     	b.ge	0x461592c <_ChromeMain+0x4610690>
 46158ec: d2800008     	mov	x8, #0x0                ; =0
 46158f0: 52800016     	mov	w22, #0x0               ; =0
 46158f4: 53185f09     	lsl	w9, w24, #8
 46158f8: b3401ec9     	bfxil	x9, x22, #0, #8
 46158fc: aa080120     	orr	x0, x9, x8
 4615900: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4615904: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4615908: a94357f6     	ldp	x22, x21, [sp, #0x30]
 461590c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4615910: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4615914: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4615918: d65f03c0     	ret
 461591c: aa0903ea     	mov	x10, x9
 4615920: 17ffffed     	b	0x46158d4 <_ChromeMain+0x4610638>
 4615924: 12800017     	mov	w23, #-0x1              ; =-1
 4615928: 14000009     	b	0x461594c <_ChromeMain+0x46106b0>
 461592c: b9400955     	ldr	w21, [x10, #0x8]
 4615930: f9404901     	ldr	x1, [x8, #0x90]
 4615934: b4ffff81     	cbz	x1, 0x4615924 <_ChromeMain+0x4610688>
 4615938: f9400100     	ldr	x0, [x8]
 461593c: 96f5d2fc     	bl	0x38a52c <_ChromeMain+0x385290>
 4615940: 7200003f     	tst	w1, #0x1
 4615944: 5a9f1017     	csinv	w23, w0, wzr, ne
 4615948: f9429268     	ldr	x8, [x19, #0x520]
 461594c: f9400100     	ldr	x0, [x8]
 4615950: b9401808     	ldr	w8, [x0, #0x18]
 4615954: 7100051f     	cmp	w8, #0x1
 4615958: 5400010b     	b.lt	0x4615978 <_ChromeMain+0x46106dc>
 461595c: d2800014     	mov	x20, #0x0               ; =0
 4615960: 52800019     	mov	w25, #0x0               ; =0
 4615964: 52800016     	mov	w22, #0x0               ; =0
 4615968: 52800018     	mov	w24, #0x0               ; =0
 461596c: 5280003a     	mov	w26, #0x1               ; =1
 4615970: 2a1703fb     	mov	w27, w23
 4615974: 14000013     	b	0x46159c0 <_ChromeMain+0x4610724>
 4615978: d2800008     	mov	x8, #0x0                ; =0
 461597c: 52800016     	mov	w22, #0x0               ; =0
 4615980: 52800018     	mov	w24, #0x0               ; =0
 4615984: 17ffffdc     	b	0x46158f4 <_ChromeMain+0x4610658>
 4615988: 12001f28     	and	w8, w25, #0xff
 461598c: d3607d08     	lsl	x8, x8, #32
 4615990: 17ffffd9     	b	0x46158f4 <_ChromeMain+0x4610658>
 4615994: 53087e88     	lsr	w8, w20, #8
 4615998: 7200033f     	tst	w25, #0x1
 461599c: 1a881318     	csel	w24, w24, w8, ne
 46159a0: 1a9412d6     	csel	w22, w22, w20, ne
 46159a4: 1a9f0759     	csinc	w25, w26, wzr, eq
 46159a8: 91000694     	add	x20, x20, #0x1
 46159ac: f9429268     	ldr	x8, [x19, #0x520]
 46159b0: f9400100     	ldr	x0, [x8]
 46159b4: b9801808     	ldrsw	x8, [x0, #0x18]
 46159b8: eb08029f     	cmp	x20, x8
 46159bc: 54fffe6a     	b.ge	0x4615988 <_ChromeMain+0x46106ec>
 46159c0: aa1403e1     	mov	x1, x20
 46159c4: 9729224d     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 46159c8: b4ffff00     	cbz	x0, 0x46159a8 <_ChromeMain+0x461070c>
 46159cc: b9401008     	ldr	w8, [x0, #0x10]
 46159d0: 6b15011f     	cmp	w8, w21
 46159d4: 54fffea1     	b.ne	0x46159a8 <_ChromeMain+0x461070c>
 46159d8: f9429261     	ldr	x1, [x19, #0x520]
 46159dc: 97ec475a     	bl	0x4127744 <_ChromeMain+0x41224a8>
 46159e0: 3707fe40     	tbnz	w0, #0x0, 0x46159a8 <_ChromeMain+0x461070c>
 46159e4: eb14037f     	cmp	x27, x20
 46159e8: 54fffd61     	b.ne	0x4615994 <_ChromeMain+0x46106f8>
 46159ec: 53087ef8     	lsr	w24, w23, #8
 46159f0: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 46159f4: aa1703f6     	mov	x22, x23
 46159f8: 17ffffbf     	b	0x46158f4 <_ChromeMain+0x4610658>
 46159fc: b40003c2     	cbz	x2, 0x4615a74 <_ChromeMain+0x46107d8>
 4615a00: d10703ff     	sub	sp, sp, #0x1c0
 4615a04: a91957f6     	stp	x22, x21, [sp, #0x190]
 4615a08: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
 4615a0c: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
 4615a10: 9106c3fd     	add	x29, sp, #0x1b0
 4615a14: aa0203f3     	mov	x19, x2
 4615a18: aa0103f5     	mov	x21, x1
 4615a1c: aa0003f4     	mov	x20, x0
 4615a20: 910003e0     	mov	x0, sp
 4615a24: 97ef0e76     	bl	0x41d93fc <_ChromeMain+0x41d4160>
 4615a28: 910003e1     	mov	x1, sp
 4615a2c: aa1303e0     	mov	x0, x19
 4615a30: 97ef0e9c     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 4615a34: 910003e0     	mov	x0, sp
 4615a38: 972b5b12     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4615a3c: b4000115     	cbz	x21, 0x4615a5c <_ChromeMain+0x46107c0>
 4615a40: f9429288     	ldr	x8, [x20, #0x520]
 4615a44: b40000c8     	cbz	x8, 0x4615a5c <_ChromeMain+0x46107c0>
 4615a48: f94032a1     	ldr	x1, [x21, #0x60]
 4615a4c: aa1403e0     	mov	x0, x20
 4615a50: 97ffff88     	bl	0x4615870 <_ChromeMain+0x46105d4>
 4615a54: d360fc08     	lsr	x8, x0, #32
 4615a58: b5000128     	cbnz	x8, 0x4615a7c <_ChromeMain+0x46107e0>
 4615a5c: 52800000     	mov	w0, #0x0                ; =0
 4615a60: a95b7bfd     	ldp	x29, x30, [sp, #0x1b0]
 4615a64: a95a4ff4     	ldp	x20, x19, [sp, #0x1a0]
 4615a68: a95957f6     	ldp	x22, x21, [sp, #0x190]
 4615a6c: 910703ff     	add	sp, sp, #0x1c0
 4615a70: d65f03c0     	ret
 4615a74: 52800000     	mov	w0, #0x0                ; =0
 4615a78: d65f03c0     	ret
 4615a7c: f9429288     	ldr	x8, [x20, #0x520]
 4615a80: f9400108     	ldr	x8, [x8]
 4615a84: 93407c01     	sxtw	x1, w0
 4615a88: aa0803e0     	mov	x0, x8
 4615a8c: 9729221b     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4615a90: b4fffe80     	cbz	x0, 0x4615a60 <_ChromeMain+0x46107c4>
 4615a94: 910003e8     	mov	x8, sp
 4615a98: 972b5ffa     	bl	0x10eda80 <_ChromeMain+0x10e87e4>
 4615a9c: 910003e1     	mov	x1, sp
 4615aa0: aa1303e0     	mov	x0, x19
 4615aa4: 97ef0e7f     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 4615aa8: 910003e0     	mov	x0, sp
 4615aac: 972b5af5     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4615ab0: 52800020     	mov	w0, #0x1                ; =1
 4615ab4: 17ffffeb     	b	0x4615a60 <_ChromeMain+0x46107c4>
		...
 4615ac0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4615ac4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4615ac8: 910043fd     	add	x29, sp, #0x10
 4615acc: aa0003f3     	mov	x19, x0
 4615ad0: f9429c00     	ldr	x0, [x0, #0x538]
 4615ad4: b4000460     	cbz	x0, 0x4615b60 <_ChromeMain+0x46108c4>
 4615ad8: b9486668     	ldr	w8, [x19, #0x864]
 4615adc: b9486a69     	ldr	w9, [x19, #0x868]
 4615ae0: 1e620100     	scvtf	d0, w8
 4615ae4: 1e620121     	scvtf	d1, w9
 4615ae8: fd42de62     	ldr	d2, [x19, #0x5b8]
 4615aec: 1e603821     	fsub	d1, d1, d0
 4615af0: 1e610841     	fmul	d1, d2, d1
 4615af4: 1e602820     	fadd	d0, d1, d0
 4615af8: 1e6c1001     	fmov	d1, #0.50000000
 4615afc: 1e612800     	fadd	d0, d0, d1
 4615b00: 1e654000     	frintm	d0, d0
 4615b04: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 4615b08: 9e670101     	fmov	d1, x8
 4615b0c: 1e612000     	fcmp	d0, d1
 4615b10: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 4615b14: 1a88b3e8     	csel	w8, wzr, w8, lt
 4615b18: 1e616801     	fmaxnm	d1, d0, d1
 4615b1c: 1e780029     	fcvtzs	w9, d1
 4615b20: 0aa97d29     	bic	w9, w9, w9, asr #31
 4615b24: d004c9aa     	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 4615b28: fd466541     	ldr	d1, [x10, #0xcc8]
 4615b2c: 1e612000     	fcmp	d0, d1
 4615b30: 1a889128     	csel	w8, w9, w8, ls
 4615b34: b9486e69     	ldr	w9, [x19, #0x86c]
 4615b38: 0aa97d29     	bic	w9, w9, w9, asr #31
 4615b3c: 9121c26a     	add	x10, x19, #0x870
 4615b40: 3961e26b     	ldrb	w11, [x19, #0x878]
 4615b44: 340001ab     	cbz	w11, 0x4615b78 <_ChromeMain+0x46108dc>
 4615b48: b948726b     	ldr	w11, [x19, #0x870]
 4615b4c: 6b09017f     	cmp	w11, w9
 4615b50: 540000e1     	b.ne	0x4615b6c <_ChromeMain+0x46108d0>
 4615b54: b948766b     	ldr	w11, [x19, #0x874]
 4615b58: 6b08017f     	cmp	w11, w8
 4615b5c: 54000081     	b.ne	0x4615b6c <_ChromeMain+0x46108d0>
 4615b60: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4615b64: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4615b68: d65f03c0     	ret
 4615b6c: aa088121     	orr	x1, x9, x8, lsl #32
 4615b70: f9000141     	str	x1, [x10]
 4615b74: 14000006     	b	0x4615b8c <_ChromeMain+0x46108f0>
 4615b78: b400020a     	cbz	x10, 0x4615bb8 <_ChromeMain+0x461091c>
 4615b7c: aa088121     	orr	x1, x9, x8, lsl #32
 4615b80: f9043a61     	str	x1, [x19, #0x870]
 4615b84: 52800028     	mov	w8, #0x1                ; =1
 4615b88: 3921e268     	strb	w8, [x19, #0x878]
 4615b8c: 52800022     	mov	w2, #0x1                ; =1
 4615b90: 9786efb4     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4615b94: aa1303e0     	mov	x0, x19
 4615b98: 52800001     	mov	w1, #0x0                ; =0
 4615b9c: 97006a36     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4615ba0: f9400268     	ldr	x8, [x19]
 4615ba4: f9418501     	ldr	x1, [x8, #0x308]
 4615ba8: aa1303e0     	mov	x0, x19
 4615bac: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4615bb0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4615bb4: d61f0020     	br	x1
 4615bb8: d4200020     	brk	#0x1
 4615bbc: d503201f     	nop
 4615bc0: d503201f     	nop
 4615bc4: d503201f     	nop
 4615bc8: d503201f     	nop
 4615bcc: d503201f     	nop
 4615bd0: d503201f     	nop
 4615bd4: d503201f     	nop
 4615bd8: d503201f     	nop
 4615bdc: d503201f     	nop
		...
