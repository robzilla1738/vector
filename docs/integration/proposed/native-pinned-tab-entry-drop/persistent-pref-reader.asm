
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d4660: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 41d4664: a90167fa     	stp	x26, x25, [sp, #0x10]
 41d4668: a9025ff8     	stp	x24, x23, [sp, #0x20]
 41d466c: a90357f6     	stp	x22, x21, [sp, #0x30]
 41d4670: a9044ff4     	stp	x20, x19, [sp, #0x40]
 41d4674: a9057bfd     	stp	x29, x30, [sp, #0x50]
 41d4678: 910143fd     	add	x29, sp, #0x50
 41d467c: d10703ff     	sub	sp, sp, #0x1c0
 41d4680: aa0803f3     	mov	x19, x8
 41d4684: f9400008     	ldr	x8, [x0]
 41d4688: f940b508     	ldr	x8, [x8, #0x168]
 41d468c: d63f0100     	blr	x8
 41d4690: a900fe7f     	stp	xzr, xzr, [x19, #0x8]
 41d4694: f900027f     	str	xzr, [x19]
 41d4698: b4000680     	cbz	x0, 0x41d4768 <_ChromeMain+0x41cf4cc>
 41d469c: a909ffff     	stp	xzr, xzr, [sp, #0x98]
 41d46a0: f90057ff     	str	xzr, [sp, #0xa8]
 41d46a4: 90046841     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 41d46a8: 911ad021     	add	x1, x1, #0x6b4
 41d46ac: 52800162     	mov	w2, #0xb                ; =11
 41d46b0: 970ab35c     	bl	0x481420 <_ChromeMain+0x47c184>
 41d46b4: a9402014     	ldp	x20, x8, [x0]
 41d46b8: 8b081689     	add	x9, x20, x8, lsl #5
 41d46bc: eb09029f     	cmp	x20, x9
 41d46c0: 540018e8     	b.hi	0x41d49dc <_ChromeMain+0x41cf740>
 41d46c4: d37be917     	lsl	x23, x8, #5
 41d46c8: b4000517     	cbz	x23, 0x41d4768 <_ChromeMain+0x41cf4cc>
 41d46cc: 9102c3f8     	add	x24, sp, #0xb0
 41d46d0: 910003f9     	mov	x25, sp
 41d46d4: d10343ba     	sub	x26, x29, #0xd0
 41d46d8: b0046975     	adrp	x21, 0xcf01000 <dyld_stub_binder+0xcf01000>
 41d46dc: 912732b5     	add	x21, x21, #0x9cc
 41d46e0: 14000072     	b	0x41d48a8 <_ChromeMain+0x41cf60c>
 41d46e4: f9400280     	ldr	x0, [x20]
 41d46e8: f9400a88     	ldr	x8, [x20, #0x10]
 41d46ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d46f0: 96f8d1f2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d46f4: 1400000c     	b	0x41d4724 <_ChromeMain+0x41cf488>
 41d46f8: f94053e8     	ldr	x8, [sp, #0xa0]
 41d46fc: 8b080509     	add	x9, x8, x8, lsl #1
 41d4700: d37df129     	lsl	x9, x9, #3
 41d4704: b40017c9     	cbz	x9, 0x41d49fc <_ChromeMain+0x41cf760>
 41d4708: 8b130129     	add	x9, x9, x19
 41d470c: d1006134     	sub	x20, x9, #0x18
 41d4710: d37df109     	lsl	x9, x8, #3
 41d4714: cb081535     	sub	x21, x9, x8, lsl #5
 41d4718: b4001674     	cbz	x20, 0x41d49e4 <_ChromeMain+0x41cf748>
 41d471c: 39c05e88     	ldrsb	w8, [x20, #0x17]
 41d4720: 37fffe28     	tbnz	w8, #0x1f, 0x41d46e4 <_ChromeMain+0x41cf448>
 41d4724: d1006294     	sub	x20, x20, #0x18
 41d4728: b10062b5     	adds	x21, x21, #0x18
 41d472c: 54ffff61     	b.ne	0x41d4718 <_ChromeMain+0x41cf47c>
 41d4730: f9404fe0     	ldr	x0, [sp, #0x98]
 41d4734: cb000268     	sub	x8, x19, x0
 41d4738: 9343fd08     	asr	x8, x8, #3
 41d473c: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 41d4740: f2955569     	movk	x9, #0xaaab
 41d4744: 9b097d08     	mul	x8, x8, x9
 41d4748: f90053e8     	str	x8, [sp, #0xa0]
 41d474c: f94057e8     	ldr	x8, [sp, #0xa8]
 41d4750: 8b080508     	add	x8, x8, x8, lsl #1
 41d4754: d37df101     	lsl	x1, x8, #3
 41d4758: 96f8d1d8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d475c: 14000003     	b	0x41d4768 <_ChromeMain+0x41cf4cc>
 41d4760: f9404ff3     	ldr	x19, [sp, #0x98]
 41d4764: b5fffcb3     	cbnz	x19, 0x41d46f8 <_ChromeMain+0x41cf45c>
 41d4768: 910703ff     	add	sp, sp, #0x1c0
 41d476c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 41d4770: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 41d4774: a94357f6     	ldp	x22, x21, [sp, #0x30]
 41d4778: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 41d477c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 41d4780: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 41d4784: d65f03c0     	ret
 41d4788: 390003ff     	strb	wzr, [sp]
 41d478c: 390243ff     	strb	wzr, [sp, #0x90]
 41d4790: 9101c340     	add	x0, x26, #0x70
 41d4794: d2800001     	mov	x1, #0x0                ; =0
 41d4798: 96f94d48     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d479c: 91008340     	add	x0, x26, #0x20
 41d47a0: 96f94d36     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d47a4: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 41d47a8: 36f800a8     	tbz	w8, #0x1f, 0x41d47bc <_ChromeMain+0x41cf520>
 41d47ac: f85303a0     	ldur	x0, [x29, #-0xd0]
 41d47b0: f85403a8     	ldur	x8, [x29, #-0xc0]
 41d47b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d47b8: 96f8d1c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d47bc: 394243e8     	ldrb	w8, [sp, #0x90]
 41d47c0: 360006e8     	tbz	w8, #0x0, 0x41d489c <_ChromeMain+0x41cf600>
 41d47c4: 910003e0     	mov	x0, sp
 41d47c8: 971260b0     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 41d47cc: aa0003e1     	mov	x1, x0
 41d47d0: 910263e0     	add	x0, sp, #0x98
 41d47d4: aa0103e2     	mov	x2, x1
 41d47d8: 977039ca     	bl	0x1de2f00 <_ChromeMain+0x1dddc64>
 41d47dc: 394243e8     	ldrb	w8, [sp, #0x90]
 41d47e0: 360003a1     	tbz	w1, #0x0, 0x41d4854 <_ChromeMain+0x41cf5b8>
 41d47e4: 360010a8     	tbz	w8, #0x0, 0x41d49f8 <_ChromeMain+0x41cf75c>
 41d47e8: a940a668     	ldp	x8, x9, [x19, #0x8]
 41d47ec: eb09011f     	cmp	x8, x9
 41d47f0: 54000fc0     	b.eq	0x41d49e8 <_ChromeMain+0x41cf74c>
 41d47f4: f9400269     	ldr	x9, [x19]
 41d47f8: 5280120a     	mov	w10, #0x90              ; =144
 41d47fc: 9b0a2500     	madd	x0, x8, x10, x9
 41d4800: b4000f20     	cbz	x0, 0x41d49e4 <_ChromeMain+0x41cf748>
 41d4804: 910003e1     	mov	x1, sp
 41d4808: 9700198f     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d480c: 3cc78320     	ldur	q0, [x25, #0x78]
 41d4810: f8488328     	ldur	x8, [x25, #0x88]
 41d4814: f9004408     	str	x8, [x0, #0x88]
 41d4818: 3c878000     	stur	q0, [x0, #0x78]
 41d481c: a907ff3f     	stp	xzr, xzr, [x25, #0x78]
 41d4820: f808833f     	stur	xzr, [x25, #0x88]
 41d4824: 91024000     	add	x0, x0, #0x90
 41d4828: f9400268     	ldr	x8, [x19]
 41d482c: eb080008     	subs	x8, x0, x8
 41d4830: 9344fd08     	asr	x8, x8, #4
 41d4834: d291c729     	mov	x9, #0x8e39             ; =36409
 41d4838: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d483c: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d4840: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d4844: 9b097d08     	mul	x8, x8, x9
 41d4848: f9000668     	str	x8, [x19, #0x8]
 41d484c: 54000cc0     	b.eq	0x41d49e4 <_ChromeMain+0x41cf748>
 41d4850: 394243e8     	ldrb	w8, [sp, #0x90]
 41d4854: 36000248     	tbz	w8, #0x0, 0x41d489c <_ChromeMain+0x41cf600>
 41d4858: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 41d485c: 36f800a8     	tbz	w8, #0x1f, 0x41d4870 <_ChromeMain+0x41cf5d4>
 41d4860: f9403fe0     	ldr	x0, [sp, #0x78]
 41d4864: f94047e8     	ldr	x8, [sp, #0x88]
 41d4868: d37ff901     	lsl	x1, x8, #1
 41d486c: 96f8d193     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4870: 9101c320     	add	x0, x25, #0x70
 41d4874: d2800001     	mov	x1, #0x0                ; =0
 41d4878: 96f94d10     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d487c: 91008320     	add	x0, x25, #0x20
 41d4880: 96f94cfe     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d4884: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41d4888: 36f800a8     	tbz	w8, #0x1f, 0x41d489c <_ChromeMain+0x41cf600>
 41d488c: f94003e0     	ldr	x0, [sp]
 41d4890: f9400be8     	ldr	x8, [sp, #0x10]
 41d4894: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d4898: 96f8d188     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d489c: 91008294     	add	x20, x20, #0x20
 41d48a0: f10082f7     	subs	x23, x23, #0x20
 41d48a4: 54fff5e0     	b.eq	0x41d4760 <_ChromeMain+0x41cf4c4>
 41d48a8: 39406288     	ldrb	w8, [x20, #0x18]
 41d48ac: 7100191f     	cmp	w8, #0x6
 41d48b0: 54ffff61     	b.ne	0x41d489c <_ChromeMain+0x41cf600>
 41d48b4: f9004bff     	str	xzr, [sp, #0x90]
 41d48b8: 6f00e400     	movi.2d	v0, #0000000000000000
 41d48bc: ad0383e0     	stp	q0, q0, [sp, #0x70]
 41d48c0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41d48c4: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d48c8: ad0083e0     	stp	q0, q0, [sp, #0x10]
 41d48cc: 3d8003e0     	str	q0, [sp]
 41d48d0: 39406288     	ldrb	w8, [x20, #0x18]
 41d48d4: 7100191f     	cmp	w8, #0x6
 41d48d8: 54000961     	b.ne	0x41d4a04 <_ChromeMain+0x41cf768>
 41d48dc: aa1403e0     	mov	x0, x20
 41d48e0: aa1503e1     	mov	x1, x21
 41d48e4: 52800062     	mov	w2, #0x3                ; =3
 41d48e8: 97795466     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 41d48ec: b4fffd80     	cbz	x0, 0x41d489c <_ChromeMain+0x41cf600>
 41d48f0: aa0003e1     	mov	x1, x0
 41d48f4: f81a03bf     	stur	xzr, [x29, #-0x60]
 41d48f8: 6f00e400     	movi.2d	v0, #0000000000000000
 41d48fc: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 41d4900: ad3b03a0     	stp	q0, q0, [x29, #-0xa0]
 41d4904: ad3a03a0     	stp	q0, q0, [x29, #-0xc0]
 41d4908: 3c9303a0     	stur	q0, [x29, #-0xd0]
 41d490c: 39805c02     	ldrsb	x2, [x0, #0x17]
 41d4910: b6f80042     	tbz	x2, #0x3f, 0x41d4918 <_ChromeMain+0x41cf67c>
 41d4914: a9400821     	ldp	x1, x2, [x1]
 41d4918: d10343a0     	sub	x0, x29, #0xd0
 41d491c: 97066e2e     	bl	0x3701d4 <_ChromeMain+0x36af38>
 41d4920: 385483a8     	ldurb	w8, [x29, #-0xb8]
 41d4924: 3607f328     	tbz	w8, #0x0, 0x41d4788 <_ChromeMain+0x41cf4ec>
 41d4928: aa1403e0     	mov	x0, x20
 41d492c: b0046961     	adrp	x1, 0xcf01000 <dyld_stub_binder+0xcf01000>
 41d4930: 91274021     	add	x1, x1, #0x9d0
 41d4934: 528000a2     	mov	w2, #0x5                ; =5
 41d4938: 97795452     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 41d493c: b4000480     	cbz	x0, 0x41d49cc <_ChromeMain+0x41cf730>
 41d4940: 39805c01     	ldrsb	x1, [x0, #0x17]
 41d4944: b6f80041     	tbz	x1, #0x3f, 0x41d494c <_ChromeMain+0x41cf6b0>
 41d4948: a9400400     	ldp	x0, x1, [x0]
 41d494c: 9102c3e8     	add	x8, sp, #0xb0
 41d4950: 971c3670     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 41d4954: a94b6ff6     	ldp	x22, x27, [sp, #0xb0]
 41d4958: f94063fc     	ldr	x28, [sp, #0xc0]
 41d495c: 9102c3e0     	add	x0, sp, #0xb0
 41d4960: d10343a1     	sub	x1, x29, #0xd0
 41d4964: 96fd958c     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d4968: a912eff6     	stp	x22, x27, [sp, #0x128]
 41d496c: f9009ffc     	str	x28, [sp, #0x138]
 41d4970: 910003e0     	mov	x0, sp
 41d4974: 9102c3e1     	add	x1, sp, #0xb0
 41d4978: 97001933     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41d497c: 3cc78300     	ldur	q0, [x24, #0x78]
 41d4980: 3c878320     	stur	q0, [x25, #0x78]
 41d4984: f8488308     	ldur	x8, [x24, #0x88]
 41d4988: f8088328     	stur	x8, [x25, #0x88]
 41d498c: a9087f1f     	stp	xzr, xzr, [x24, #0x80]
 41d4990: f807831f     	stur	xzr, [x24, #0x78]
 41d4994: 52800028     	mov	w8, #0x1                ; =1
 41d4998: 390243e8     	strb	w8, [sp, #0x90]
 41d499c: 9101c300     	add	x0, x24, #0x70
 41d49a0: d2800001     	mov	x1, #0x0                ; =0
 41d49a4: 96f94cc5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d49a8: 91008300     	add	x0, x24, #0x20
 41d49ac: 96f94cb3     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d49b0: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 41d49b4: 36ffeee8     	tbz	w8, #0x1f, 0x41d4790 <_ChromeMain+0x41cf4f4>
 41d49b8: f9405be0     	ldr	x0, [sp, #0xb0]
 41d49bc: f94063e8     	ldr	x8, [sp, #0xc0]
 41d49c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d49c4: 96f8d13d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d49c8: 17ffff72     	b	0x41d4790 <_ChromeMain+0x41cf4f4>
 41d49cc: d280001c     	mov	x28, #0x0               ; =0
 41d49d0: d280001b     	mov	x27, #0x0               ; =0
 41d49d4: d2800016     	mov	x22, #0x0               ; =0
 41d49d8: 17ffffe1     	b	0x41d495c <_ChromeMain+0x41cf6c0>
 41d49dc: d4200000     	brk	#0
 41d49e0: d4400000     	hlt	#0
 41d49e4: d4200020     	brk	#0x1
 41d49e8: 910003e1     	mov	x1, sp
 41d49ec: aa1303e0     	mov	x0, x19
 41d49f0: 94000270     	bl	0x41d53b0 <_ChromeMain+0x41d0114>
 41d49f4: 17ffff8d     	b	0x41d4828 <_ChromeMain+0x41cf58c>
 41d49f8: 9428ae49     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 41d49fc: aa1303e0     	mov	x0, x19
 41d4a00: 17ffff4d     	b	0x41d4734 <_ChromeMain+0x41cf498>
 41d4a04: 7103fd1f     	cmp	w8, #0xff
 41d4a08: 54000081     	b.ne	0x41d4a18 <_ChromeMain+0x41cf77c>
 41d4a0c: 9004b080     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d4a10: 913be000     	add	x0, x0, #0xef8
 41d4a14: 94294a1f     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 41d4a18: 9004b080     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d4a1c: 913c6000     	add	x0, x0, #0xf18
 41d4a20: 94294a1c     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
