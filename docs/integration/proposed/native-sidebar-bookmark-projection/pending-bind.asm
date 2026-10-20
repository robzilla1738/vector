
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4646654: d10643ff     	sub	sp, sp, #0x190
 4646658: a9136ffc     	stp	x28, x27, [sp, #0x130]
 464665c: a91467fa     	stp	x26, x25, [sp, #0x140]
 4646660: a9155ff8     	stp	x24, x23, [sp, #0x150]
 4646664: a91657f6     	stp	x22, x21, [sp, #0x160]
 4646668: a9174ff4     	stp	x20, x19, [sp, #0x170]
 464666c: a9187bfd     	stp	x29, x30, [sp, #0x180]
 4646670: 910603fd     	add	x29, sp, #0x180
 4646674: 52800015     	mov	w21, #0x0               ; =0
 4646678: b40010e1     	cbz	x1, 0x4646894 <_ChromeMain+0x46415f8>
 464667c: aa0003f3     	mov	x19, x0
 4646680: f9435008     	ldr	x8, [x0, #0x6a0]
 4646684: b4001088     	cbz	x8, 0x4646894 <_ChromeMain+0x46415f8>
 4646688: aa0103f4     	mov	x20, x1
 464668c: f9423676     	ldr	x22, [x19, #0x468]
 4646690: 3dc02020     	ldr	q0, [x1, #0x80]
 4646694: 3c9703a0     	stur	q0, [x29, #-0x90]
 4646698: f9404828     	ldr	x8, [x1, #0x90]
 464669c: f81803a8     	stur	x8, [x29, #-0x80]
 46466a0: b40000b6     	cbz	x22, 0x46466b4 <_ChromeMain+0x4641418>
 46466a4: 385803a8     	ldurb	w8, [x29, #-0x80]
 46466a8: 36000068     	tbz	w8, #0x0, 0x46466b4 <_ChromeMain+0x4641418>
 46466ac: f94006d5     	ldr	x21, [x22, #0x8]
 46466b0: b5001175     	cbnz	x21, 0x46468dc <_ChromeMain+0x4641640>
 46466b4: f9402295     	ldr	x21, [x20, #0x40]
 46466b8: b4000ef5     	cbz	x21, 0x4646894 <_ChromeMain+0x46415f8>
 46466bc: f90073ff     	str	xzr, [sp, #0xe0]
 46466c0: 6f00e400     	movi.2d	v0, #0000000000000000
 46466c4: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 46466c8: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 46466cc: ad0403e0     	stp	q0, q0, [sp, #0x80]
 46466d0: 3d801fe0     	str	q0, [sp, #0x70]
 46466d4: f9414aa8     	ldr	x8, [x21, #0x290]
 46466d8: b5000f08     	cbnz	x8, 0x46468b8 <_ChromeMain+0x464161c>
 46466dc: f94132a8     	ldr	x8, [x21, #0x260]
 46466e0: f9401d09     	ldr	x9, [x8, #0x38]
 46466e4: f0ffcfea     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 46466e8: 913c814a     	add	x10, x10, #0xf20
 46466ec: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 46466f0: eb0a013f     	cmp	x9, x10
 46466f4: 54000ee1     	b.ne	0x46468d0 <_ChromeMain+0x4641634>
 46466f8: 3100051f     	cmn	w8, #0x1
 46466fc: 54003fc0     	b.eq	0x4646ef4 <_ChromeMain+0x4641c58>
 4646700: f94142a9     	ldr	x9, [x21, #0x280]
 4646704: eb08013f     	cmp	x9, x8
 4646708: 54002d69     	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 464670c: f9413ea9     	ldr	x9, [x21, #0x278]
 4646710: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4646714: b4003ea8     	cbz	x8, 0x4646ee8 <_ChromeMain+0x4641c4c>
 4646718: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 464671c: b7f83de9     	tbnz	x9, #0x3f, 0x4646ed8 <_ChromeMain+0x4641c3c>
 4646720: b5003e09     	cbnz	x9, 0x4646ee0 <_ChromeMain+0x4641c44>
 4646724: f9400d08     	ldr	x8, [x8, #0x18]
 4646728: f9400508     	ldr	x8, [x8, #0x8]
 464672c: 91018101     	add	x1, x8, #0x60
 4646730: 9101c3e0     	add	x0, sp, #0x70
 4646734: 96ebce18     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4646738: 394223e8     	ldrb	w8, [sp, #0x88]
 464673c: 370002c8     	tbnz	w8, #0x0, 0x4646794 <_ChromeMain+0x46414f8>
 4646740: b982b6a8     	ldrsw	x8, [x21, #0x2b4]
 4646744: 3100051f     	cmn	w8, #0x1
 4646748: 54003e40     	b.eq	0x4646f10 <_ChromeMain+0x4641c74>
 464674c: f94142a9     	ldr	x9, [x21, #0x280]
 4646750: eb08013f     	cmp	x9, x8
 4646754: 54002b09     	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 4646758: f9413ea9     	ldr	x9, [x21, #0x278]
 464675c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4646760: b4003de8     	cbz	x8, 0x4646f1c <_ChromeMain+0x4641c80>
 4646764: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4646768: b7f83cc9     	tbnz	x9, #0x3f, 0x4646f00 <_ChromeMain+0x4641c64>
 464676c: b5003ce9     	cbnz	x9, 0x4646f08 <_ChromeMain+0x4641c6c>
 4646770: f9400d08     	ldr	x8, [x8, #0x18]
 4646774: f9400508     	ldr	x8, [x8, #0x8]
 4646778: 91018101     	add	x1, x8, #0x60
 464677c: 9101c3e0     	add	x0, sp, #0x70
 4646780: 96fa1463     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4646784: 394223e8     	ldrb	w8, [sp, #0x88]
 4646788: 35000068     	cbnz	w8, 0x4646794 <_ChromeMain+0x46414f8>
 464678c: 52800015     	mov	w21, #0x0               ; =0
 4646790: 14000035     	b	0x4646864 <_ChromeMain+0x46415c8>
 4646794: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4646798: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 464679c: f9435260     	ldr	x0, [x19, #0x6a0]
 46467a0: 9101c3e1     	add	x1, sp, #0x70
 46467a4: 9101a3e2     	add	x2, sp, #0x68
 46467a8: 910143e3     	add	x3, sp, #0x50
 46467ac: 97ff36c8     	bl	0x46142cc <_ChromeMain+0x460f030>
 46467b0: 340004c0     	cbz	w0, 0x4646848 <_ChromeMain+0x46415ac>
 46467b4: 39419fe8     	ldrb	w8, [sp, #0x67]
 46467b8: f9402fe9     	ldr	x9, [sp, #0x58]
 46467bc: 7219011f     	tst	w8, #0x80
 46467c0: 9a881128     	csel	x8, x9, x8, ne
 46467c4: b5000368     	cbnz	x8, 0x4646830 <_ChromeMain+0x4641594>
 46467c8: b940afe8     	ldr	w8, [sp, #0xac]
 46467cc: 7100051f     	cmp	w8, #0x1
 46467d0: 5400028b     	b.lt	0x4646820 <_ChromeMain+0x4641584>
 46467d4: 39421fe9     	ldrb	w9, [sp, #0x87]
 46467d8: 13001d2b     	sxtb	w11, w9
 46467dc: f9403fea     	ldr	x10, [sp, #0x78]
 46467e0: 7100017f     	cmp	w11, #0x0
 46467e4: 9a894149     	csel	x9, x10, x9, mi
 46467e8: b980abea     	ldrsw	x10, [sp, #0xa8]
 46467ec: eb0a012c     	subs	x12, x9, x10
 46467f0: 540039c3     	b.lo	0x4646f28 <_ChromeMain+0x4641c8c>
 46467f4: f9403bed     	ldr	x13, [sp, #0x70]
 46467f8: 7100017f     	cmp	w11, #0x0
 46467fc: 9101c3eb     	add	x11, sp, #0x70
 4646800: 9a8b41ab     	csel	x11, x13, x11, mi
 4646804: eb08019f     	cmp	x12, x8
 4646808: 9a883182     	csel	x2, x12, x8, lo
 464680c: 8b0a0161     	add	x1, x11, x10
 4646810: eb0a013f     	cmp	x9, x10
 4646814: 540000a0     	b.eq	0x4646828 <_ChromeMain+0x464158c>
 4646818: b5000081     	cbnz	x1, 0x4646828 <_ChromeMain+0x464158c>
 464681c: 14000126     	b	0x4646cb4 <_ChromeMain+0x4641a18>
 4646820: d2800001     	mov	x1, #0x0                ; =0
 4646824: d2800002     	mov	x2, #0x0                ; =0
 4646828: 910143e0     	add	x0, sp, #0x50
 464682c: 96fa4325     	bl	0x4d74c0 <_ChromeMain+0x4d2224>
 4646830: 39419fe9     	ldrb	w9, [sp, #0x67]
 4646834: 13001d28     	sxtb	w8, w9
 4646838: f9402fe2     	ldr	x2, [sp, #0x58]
 464683c: 7100011f     	cmp	w8, #0x0
 4646840: 9a894049     	csel	x9, x2, x9, mi
 4646844: b5000729     	cbnz	x9, 0x4646928 <_ChromeMain+0x464168c>
 4646848: 52800015     	mov	w21, #0x0               ; =0
 464684c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4646850: 36f800a8     	tbz	w8, #0x1f, 0x4646864 <_ChromeMain+0x46415c8>
 4646854: f9402be0     	ldr	x0, [sp, #0x50]
 4646858: f94033e8     	ldr	x8, [sp, #0x60]
 464685c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646860: 96e70996     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646864: 9101c3f3     	add	x19, sp, #0x70
 4646868: 9101c260     	add	x0, x19, #0x70
 464686c: d2800001     	mov	x1, #0x0                ; =0
 4646870: 96e78512     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4646874: 91008260     	add	x0, x19, #0x20
 4646878: 96e78500     	bl	0x27c78 <_ChromeMain+0x229dc>
 464687c: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4646880: 36f800a8     	tbz	w8, #0x1f, 0x4646894 <_ChromeMain+0x46415f8>
 4646884: f9403be0     	ldr	x0, [sp, #0x70]
 4646888: f94043e8     	ldr	x8, [sp, #0x80]
 464688c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646890: 96e7098a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646894: aa1503e0     	mov	x0, x21
 4646898: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 464689c: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 46468a0: a95657f6     	ldp	x22, x21, [sp, #0x160]
 46468a4: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 46468a8: a95467fa     	ldp	x26, x25, [sp, #0x140]
 46468ac: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 46468b0: 910643ff     	add	sp, sp, #0x190
 46468b4: d65f03c0     	ret
 46468b8: b942baa9     	ldr	w9, [x21, #0x2b8]
 46468bc: 3100053f     	cmn	w9, #0x1
 46468c0: 54002fc1     	b.ne	0x4646eb8 <_ChromeMain+0x4641c1c>
 46468c4: 394d2109     	ldrb	w9, [x8, #0x348]
 46468c8: 34fff289     	cbz	w9, 0x4646718 <_ChromeMain+0x464147c>
 46468cc: 14000162     	b	0x4646e54 <_ChromeMain+0x4641bb8>
 46468d0: 3100051f     	cmn	w8, #0x1
 46468d4: 54fff161     	b.ne	0x4646700 <_ChromeMain+0x4641464>
 46468d8: 14000197     	b	0x4646f34 <_ChromeMain+0x4641c98>
 46468dc: d10243a1     	sub	x1, x29, #0x90
 46468e0: aa1503e0     	mov	x0, x21
 46468e4: 94814067     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 46468e8: f9400028     	ldr	x8, [x1]
 46468ec: 910022a9     	add	x9, x21, #0x8
 46468f0: f100011f     	cmp	x8, #0x0
 46468f4: fa491104     	ccmp	x8, x9, #0x4, ne
 46468f8: 54ffede0     	b.eq	0x46466b4 <_ChromeMain+0x4641418>
 46468fc: 385803a8     	ldurb	w8, [x29, #-0x80]
 4646900: 36002ea8     	tbz	w8, #0x0, 0x4646ed4 <_ChromeMain+0x4641c38>
 4646904: f94006c0     	ldr	x0, [x22, #0x8]
 4646908: d10243a1     	sub	x1, x29, #0x90
 464690c: 94dc027b     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4646910: b4ffed20     	cbz	x0, 0x46466b4 <_ChromeMain+0x4641418>
 4646914: 14000137     	b	0x4646df0 <_ChromeMain+0x4641b54>
 4646918: f9402be1     	ldr	x1, [sp, #0x50]
 464691c: 91002320     	add	x0, x25, #0x8
 4646920: 96f98865     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4646924: 1400000a     	b	0x464694c <_ChromeMain+0x46416b0>
 4646928: 9100c3f9     	add	x25, sp, #0x30
 464692c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 4646930: f94037e9     	ldr	x9, [sp, #0x68]
 4646934: a9037fe9     	stp	x9, xzr, [sp, #0x30]
 4646938: 37ffff08     	tbnz	w8, #0x1f, 0x4646918 <_ChromeMain+0x464167c>
 464693c: 3dc017e0     	ldr	q0, [sp, #0x50]
 4646940: 3c808320     	stur	q0, [x25, #0x8]
 4646944: f94033e8     	ldr	x8, [sp, #0x60]
 4646948: f8018328     	stur	x8, [x25, #0x18]
 464694c: b9401298     	ldr	w24, [x20, #0x10]
 4646950: f947ce7a     	ldr	x26, [x19, #0xf98]
 4646954: f947d26b     	ldr	x11, [x19, #0xfa0]
 4646958: 8b0b0968     	add	x8, x11, x11, lsl #2
 464695c: d37df108     	lsl	x8, x8, #3
 4646960: b4000228     	cbz	x8, 0x46469a4 <_ChromeMain+0x4641708>
 4646964: 9343fd09     	asr	x9, x8, #3
 4646968: b202e7ea     	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 464696c: f29999aa     	movk	x10, #0xcccd
 4646970: 9b0a7d2a     	mul	x10, x9, x10
 4646974: 52800509     	mov	w9, #0x28               ; =40
 4646978: aa1a03f6     	mov	x22, x26
 464697c: d341fd4c     	lsr	x12, x10, #1
 4646980: 9b09598d     	madd	x13, x12, x9, x22
 4646984: b84285ae     	ldr	w14, [x13], #0x28
 4646988: aa6a07ef     	mvn	x15, x10, lsr #1
 464698c: 8b0f014a     	add	x10, x10, x15
 4646990: 6b1801df     	cmp	w14, w24
 4646994: 9a8cb14a     	csel	x10, x10, x12, lt
 4646998: 9a96b1b6     	csel	x22, x13, x22, lt
 464699c: b5ffff0a     	cbnz	x10, 0x464697c <_ChromeMain+0x46416e0>
 46469a0: 14000002     	b	0x46469a8 <_ChromeMain+0x464170c>
 46469a4: aa1a03f6     	mov	x22, x26
 46469a8: 52800509     	mov	w9, #0x28               ; =40
 46469ac: 9b096969     	madd	x9, x11, x9, x26
 46469b0: eb0902df     	cmp	x22, x9
 46469b4: 54000080     	b.eq	0x46469c4 <_ChromeMain+0x4641728>
 46469b8: b94002c9     	ldr	w9, [x22]
 46469bc: 6b09031f     	cmp	w24, w9
 46469c0: 54000c4a     	b.ge	0x4646b48 <_ChromeMain+0x46418ac>
 46469c4: 913e626a     	add	x10, x19, #0xf98
 46469c8: 913e8269     	add	x9, x19, #0xfa0
 46469cc: cb1a02cf     	sub	x15, x22, x26
 46469d0: f947d66c     	ldr	x12, [x19, #0xfa8]
 46469d4: eb0c017f     	cmp	x11, x12
 46469d8: 540019e1     	b.ne	0x4646d14 <_ChromeMain+0x4641a78>
 46469dc: b203e7e8     	mov	x8, #0x6666666666666666 ; =7378697629483820646
 46469e0: f2e0ccc8     	movk	x8, #0x666, lsl #48
 46469e4: 91000569     	add	x9, x11, #0x1
 46469e8: eb08013f     	cmp	x9, x8
 46469ec: 54002708     	b.hi	0x4646ecc <_ChromeMain+0x4641c30>
 46469f0: d2800017     	mov	x23, #0x0               ; =0
 46469f4: d37ff96a     	lsl	x10, x11, #1
 46469f8: eb09015f     	cmp	x10, x9
 46469fc: 9a898149     	csel	x9, x10, x9, hi
 4646a00: b200e7ea     	mov	x10, #0x3333333333333333 ; =3689348814741910323
 4646a04: f2e0666a     	movk	x10, #0x333, lsl #48
 4646a08: eb0a017f     	cmp	x11, x10
 4646a0c: 9a88313b     	csel	x27, x9, x8, lo
 4646a10: f81883bf     	stur	xzr, [x29, #-0x78]
 4646a14: b400013b     	cbz	x27, 0x4646a38 <_ChromeMain+0x464179c>
 4646a18: eb08037f     	cmp	x27, x8
 4646a1c: 540025a8     	b.hi	0x4646ed0 <_ChromeMain+0x4641c34>
 4646a20: 8b1b0b68     	add	x8, x27, x27, lsl #2
 4646a24: d37df100     	lsl	x0, x8, #3
 4646a28: 96e72250     	bl	0xf368 <_ChromeMain+0xa0cc>
 4646a2c: aa0003f7     	mov	x23, x0
 4646a30: f81883a0     	stur	x0, [x29, #-0x78]
 4646a34: cb1a02cf     	sub	x15, x22, x26
 4646a38: 8b0f02fc     	add	x28, x23, x15
 4646a3c: f81903bc     	stur	x28, [x29, #-0x70]
 4646a40: f81a03bb     	stur	x27, [x29, #-0x60]
 4646a44: 9343fde8     	asr	x8, x15, #3
 4646a48: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646a4c: f29999a9     	movk	x9, #0xcccd
 4646a50: 9b097d08     	mul	x8, x8, x9
 4646a54: eb08037f     	cmp	x27, x8
 4646a58: 54000101     	b.ne	0x4646a78 <_ChromeMain+0x46417dc>
 4646a5c: eb1a02df     	cmp	x22, x26
 4646a60: 54001d40     	b.eq	0x4646e08 <_ChromeMain+0x4641b6c>
 4646a64: 91000768     	add	x8, x27, #0x1
 4646a68: d341fd08     	lsr	x8, x8, #1
 4646a6c: 928004e9     	mov	x9, #-0x28              ; =-40
 4646a70: 9b09711c     	madd	x28, x8, x9, x28
 4646a74: f81903bc     	stur	x28, [x29, #-0x70]
 4646a78: b40011fc     	cbz	x28, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646a7c: b9000398     	str	w24, [x28]
 4646a80: f9401be8     	ldr	x8, [sp, #0x30]
 4646a84: f9000788     	str	x8, [x28, #0x8]
 4646a88: f8418328     	ldur	x8, [x25, #0x18]
 4646a8c: 3cc08320     	ldur	q0, [x25, #0x8]
 4646a90: 3d800780     	str	q0, [x28, #0x10]
 4646a94: f9001388     	str	x8, [x28, #0x20]
 4646a98: a9017f3f     	stp	xzr, xzr, [x25, #0x10]
 4646a9c: f800833f     	stur	xzr, [x25, #0x8]
 4646aa0: f85903a8     	ldur	x8, [x29, #-0x70]
 4646aa4: cb080388     	sub	x8, x28, x8
 4646aa8: 9100a108     	add	x8, x8, #0x28
 4646aac: 9343fd08     	asr	x8, x8, #3
 4646ab0: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646ab4: f29999a9     	movk	x9, #0xcccd
 4646ab8: 9b097d08     	mul	x8, x8, x9
 4646abc: f81983a8     	stur	x8, [x29, #-0x68]
 4646ac0: d101e3a0     	sub	x0, x29, #0x78
 4646ac4: 913e6262     	add	x2, x19, #0xf98
 4646ac8: 913e8263     	add	x3, x19, #0xfa0
 4646acc: 913ea264     	add	x4, x19, #0xfa8
 4646ad0: aa1603e1     	mov	x1, x22
 4646ad4: 9400ef72     	bl	0x468289c <_ChromeMain+0x467d600>
 4646ad8: f85983a8     	ldur	x8, [x29, #-0x68]
 4646adc: 8b080909     	add	x9, x8, x8, lsl #2
 4646ae0: d37df129     	lsl	x9, x9, #3
 4646ae4: b4000249     	cbz	x9, 0x4646b2c <_ChromeMain+0x4641890>
 4646ae8: f85903aa     	ldur	x10, [x29, #-0x70]
 4646aec: 8b0a0129     	add	x9, x9, x10
 4646af0: d100a136     	sub	x22, x9, #0x28
 4646af4: 928004e9     	mov	x9, #-0x28              ; =-40
 4646af8: 9b097d17     	mul	x23, x8, x9
 4646afc: 14000008     	b	0x4646b1c <_ChromeMain+0x4641880>
 4646b00: f9400ac0     	ldr	x0, [x22, #0x10]
 4646b04: f94012c8     	ldr	x8, [x22, #0x20]
 4646b08: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646b0c: 96e708eb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646b10: d100a2d6     	sub	x22, x22, #0x28
 4646b14: b100a2f7     	adds	x23, x23, #0x28
 4646b18: 540000a0     	b.eq	0x4646b2c <_ChromeMain+0x4641890>
 4646b1c: b4000cd6     	cbz	x22, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646b20: 39c09ec8     	ldrsb	w8, [x22, #0x27]
 4646b24: 36ffff68     	tbz	w8, #0x1f, 0x4646b10 <_ChromeMain+0x4641874>
 4646b28: 17fffff6     	b	0x4646b00 <_ChromeMain+0x4641864>
 4646b2c: f85883a0     	ldur	x0, [x29, #-0x78]
 4646b30: b4000200     	cbz	x0, 0x4646b70 <_ChromeMain+0x46418d4>
 4646b34: f85a03a8     	ldur	x8, [x29, #-0x60]
 4646b38: 8b080908     	add	x8, x8, x8, lsl #2
 4646b3c: d37df101     	lsl	x1, x8, #3
 4646b40: 96e708de     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646b44: 1400000b     	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646b48: f9401be8     	ldr	x8, [sp, #0x30]
 4646b4c: f90006c8     	str	x8, [x22, #0x8]
 4646b50: 39c09ec8     	ldrsb	w8, [x22, #0x27]
 4646b54: 37f81a48     	tbnz	w8, #0x1f, 0x4646e9c <_ChromeMain+0x4641c00>
 4646b58: 3cc08320     	ldur	q0, [x25, #0x8]
 4646b5c: f8418328     	ldur	x8, [x25, #0x18]
 4646b60: f80202c8     	stur	x8, [x22, #0x20]
 4646b64: 3c8102c0     	stur	q0, [x22, #0x10]
 4646b68: 39013fff     	strb	wzr, [sp, #0x4f]
 4646b6c: 3900e3ff     	strb	wzr, [sp, #0x38]
 4646b70: f94037f6     	ldr	x22, [sp, #0x68]
 4646b74: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4646b78: 37f800c8     	tbnz	w8, #0x1f, 0x4646b90 <_ChromeMain+0x46418f4>
 4646b7c: 3dc017e0     	ldr	q0, [sp, #0x50]
 4646b80: 3d8007e0     	str	q0, [sp, #0x10]
 4646b84: f94033e8     	ldr	x8, [sp, #0x60]
 4646b88: f90013e8     	str	x8, [sp, #0x20]
 4646b8c: 14000004     	b	0x4646b9c <_ChromeMain+0x4641900>
 4646b90: a9450be1     	ldp	x1, x2, [sp, #0x50]
 4646b94: 910043e0     	add	x0, sp, #0x10
 4646b98: 96e745a0     	bl	0x18218 <_ChromeMain+0x12f7c>
 4646b9c: 910043e2     	add	x2, sp, #0x10
 4646ba0: aa1503e0     	mov	x0, x21
 4646ba4: aa1603e1     	mov	x1, x22
 4646ba8: 97fc42d3     	bl	0x45576f4 <_ChromeMain+0x4552458>
 4646bac: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4646bb0: 36f800a8     	tbz	w8, #0x1f, 0x4646bc4 <_ChromeMain+0x4641928>
 4646bb4: f9400be0     	ldr	x0, [sp, #0x10]
 4646bb8: f94013e8     	ldr	x8, [sp, #0x20]
 4646bbc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646bc0: 96e708be     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646bc4: f94037e2     	ldr	x2, [sp, #0x68]
 4646bc8: 910143e3     	add	x3, sp, #0x50
 4646bcc: aa1303e0     	mov	x0, x19
 4646bd0: aa1403e1     	mov	x1, x20
 4646bd4: 940024f9     	bl	0x464ffb8 <_ChromeMain+0x464ad1c>
 4646bd8: b9401288     	ldr	w8, [x20, #0x10]
 4646bdc: f947da69     	ldr	x9, [x19, #0xfb0]
 4646be0: f947de6a     	ldr	x10, [x19, #0xfb8]
 4646be4: d37ef54b     	lsl	x11, x10, #2
 4646be8: b40001ab     	cbz	x11, 0x4646c1c <_ChromeMain+0x4641980>
 4646bec: 9342fd6b     	asr	x11, x11, #2
 4646bf0: aa0903e1     	mov	x1, x9
 4646bf4: d341fd6c     	lsr	x12, x11, #1
 4646bf8: 8b0c082d     	add	x13, x1, x12, lsl #2
 4646bfc: b84045ae     	ldr	w14, [x13], #0x4
 4646c00: aa6b07ef     	mvn	x15, x11, lsr #1
 4646c04: 8b0f016b     	add	x11, x11, x15
 4646c08: 6b0801df     	cmp	w14, w8
 4646c0c: 9a8cb16b     	csel	x11, x11, x12, lt
 4646c10: 9a81b1a1     	csel	x1, x13, x1, lt
 4646c14: b5ffff0b     	cbnz	x11, 0x4646bf4 <_ChromeMain+0x4641958>
 4646c18: 14000002     	b	0x4646c20 <_ChromeMain+0x4641984>
 4646c1c: aa0903e1     	mov	x1, x9
 4646c20: 8b0a0929     	add	x9, x9, x10, lsl #2
 4646c24: aa0103e2     	mov	x2, x1
 4646c28: eb09003f     	cmp	x1, x9
 4646c2c: 540000c0     	b.eq	0x4646c44 <_ChromeMain+0x46419a8>
 4646c30: b9400029     	ldr	w9, [x1]
 4646c34: 6b09011f     	cmp	w8, w9
 4646c38: 52800088     	mov	w8, #0x4                ; =4
 4646c3c: 9a88b3e8     	csel	x8, xzr, x8, lt
 4646c40: 8b080022     	add	x2, x1, x8
 4646c44: 913ec260     	add	x0, x19, #0xfb0
 4646c48: 94194b3a     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4646c4c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4646c50: 36f800a8     	tbz	w8, #0x1f, 0x4646c64 <_ChromeMain+0x46419c8>
 4646c54: f9401fe0     	ldr	x0, [sp, #0x38]
 4646c58: f94027e8     	ldr	x8, [sp, #0x48]
 4646c5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646c60: 96e70896     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646c64: 52800035     	mov	w21, #0x1               ; =1
 4646c68: 17fffef9     	b	0x464684c <_ChromeMain+0x46415b0>
 4646c6c: 8b1a010c     	add	x12, x8, x26
 4646c70: 9100a18c     	add	x12, x12, #0x28
 4646c74: b85b018d     	ldur	w13, [x12, #-0x50]
 4646c78: aa0c03ee     	mov	x14, x12
 4646c7c: b81d8dcd     	str	w13, [x14, #-0x28]!
 4646c80: f85e01cd     	ldur	x13, [x14, #-0x20]
 4646c84: f90005cd     	str	x13, [x14, #0x8]
 4646c88: 3cde81c0     	ldur	q0, [x14, #-0x18]
 4646c8c: 3d8005c0     	str	q0, [x14, #0x10]
 4646c90: f85f81cd     	ldur	x13, [x14, #-0x8]
 4646c94: f90011cd     	str	x13, [x14, #0x20]
 4646c98: a93efddf     	stp	xzr, xzr, [x14, #-0x18]
 4646c9c: f81f81df     	stur	xzr, [x14, #-0x8]
 4646ca0: eb0b01df     	cmp	x14, x11
 4646ca4: 540000a2     	b.hs	0x4646cb8 <_ChromeMain+0x4641a1c>
 4646ca8: 9100a18c     	add	x12, x12, #0x28
 4646cac: f100a19f     	cmp	x12, #0x28
 4646cb0: 54fffe21     	b.ne	0x4646c74 <_ChromeMain+0x46419d8>
 4646cb4: d4200020     	brk	#0x1
 4646cb8: f940015a     	ldr	x26, [x10]
 4646cbc: 14000035     	b	0x4646d90 <_ChromeMain+0x4641af4>
 4646cc0: f9400ae0     	ldr	x0, [x23, #0x10]
 4646cc4: f94012e8     	ldr	x8, [x23, #0x20]
 4646cc8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646ccc: 96e7087b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646cd0: d10062e8     	sub	x8, x23, #0x18
 4646cd4: 3dc00100     	ldr	q0, [x8]
 4646cd8: 3c8102e0     	stur	q0, [x23, #0x10]
 4646cdc: f9400908     	ldr	x8, [x8, #0x10]
 4646ce0: f80202e8     	stur	x8, [x23, #0x20]
 4646ce4: 381ff2ff     	sturb	wzr, [x23, #-0x1]
 4646ce8: 381e82ff     	sturb	wzr, [x23, #-0x18]
 4646cec: aa1903f7     	mov	x23, x25
 4646cf0: eb16033f     	cmp	x25, x22
 4646cf4: 54000640     	b.eq	0x4646dbc <_ChromeMain+0x4641b20>
 4646cf8: b85d8f28     	ldr	w8, [x25, #-0x28]!
 4646cfc: b90002e8     	str	w8, [x23]
 4646d00: f85e02e8     	ldur	x8, [x23, #-0x20]
 4646d04: f90006e8     	str	x8, [x23, #0x8]
 4646d08: 39c09ee8     	ldrsb	w8, [x23, #0x27]
 4646d0c: 37fffda8     	tbnz	w8, #0x1f, 0x4646cc0 <_ChromeMain+0x4641a24>
 4646d10: 17fffff0     	b	0x4646cd0 <_ChromeMain+0x4641a34>
 4646d14: 8b08034b     	add	x11, x26, x8
 4646d18: eb0b02df     	cmp	x22, x11
 4646d1c: 54000281     	b.ne	0x4646d6c <_ChromeMain+0x4641ad0>
 4646d20: b4fffcb6     	cbz	x22, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646d24: b90002d8     	str	w24, [x22]
 4646d28: f9401be8     	ldr	x8, [sp, #0x30]
 4646d2c: f90006c8     	str	x8, [x22, #0x8]
 4646d30: f8418328     	ldur	x8, [x25, #0x18]
 4646d34: 3cc08320     	ldur	q0, [x25, #0x8]
 4646d38: 3d8006c0     	str	q0, [x22, #0x10]
 4646d3c: f90012c8     	str	x8, [x22, #0x20]
 4646d40: a9017f3f     	stp	xzr, xzr, [x25, #0x10]
 4646d44: f800833f     	stur	xzr, [x25, #0x8]
 4646d48: f9400148     	ldr	x8, [x10]
 4646d4c: cb0802c8     	sub	x8, x22, x8
 4646d50: 9100a108     	add	x8, x8, #0x28
 4646d54: 9343fd08     	asr	x8, x8, #3
 4646d58: b202e7ea     	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 4646d5c: f29999aa     	movk	x10, #0xcccd
 4646d60: 9b0a7d08     	mul	x8, x8, x10
 4646d64: f9000128     	str	x8, [x9]
 4646d68: 17ffff82     	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646d6c: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 4646d70: 3dc013e0     	ldr	q0, [sp, #0x40]
 4646d74: 3d8003e0     	str	q0, [sp]
 4646d78: a9017f3f     	stp	xzr, xzr, [x25, #0x10]
 4646d7c: d100a177     	sub	x23, x11, #0x28
 4646d80: f800833f     	stur	xzr, [x25, #0x8]
 4646d84: eb0b02ff     	cmp	x23, x11
 4646d88: 54fff723     	b.lo	0x4646c6c <_ChromeMain+0x46419d0>
 4646d8c: 8b08034c     	add	x12, x26, x8
 4646d90: cb1a018a     	sub	x10, x12, x26
 4646d94: 9343fd4a     	asr	x10, x10, #3
 4646d98: b202e7eb     	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4646d9c: f29999ab     	movk	x11, #0xcccd
 4646da0: 9b0b7d4a     	mul	x10, x10, x11
 4646da4: f900012a     	str	x10, [x9]
 4646da8: 9100a1e9     	add	x9, x15, #0x28
 4646dac: eb09011f     	cmp	x8, x9
 4646db0: 54000060     	b.eq	0x4646dbc <_ChromeMain+0x4641b20>
 4646db4: aa1703f9     	mov	x25, x23
 4646db8: 17ffffd0     	b	0x4646cf8 <_ChromeMain+0x4641a5c>
 4646dbc: b90002d8     	str	w24, [x22]
 4646dc0: f90006dc     	str	x28, [x22, #0x8]
 4646dc4: 39c09ec8     	ldrsb	w8, [x22, #0x27]
 4646dc8: 37f800a8     	tbnz	w8, #0x1f, 0x4646ddc <_ChromeMain+0x4641b40>
 4646dcc: f9000adb     	str	x27, [x22, #0x10]
 4646dd0: 3dc003e0     	ldr	q0, [sp]
 4646dd4: 3c8182c0     	stur	q0, [x22, #0x18]
 4646dd8: 17ffff66     	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646ddc: f9400ac0     	ldr	x0, [x22, #0x10]
 4646de0: f94012c8     	ldr	x8, [x22, #0x20]
 4646de4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646de8: 96e70834     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646dec: 17fffff8     	b	0x4646dcc <_ChromeMain+0x4641b30>
 4646df0: f9405c08     	ldr	x8, [x0, #0xb8]
 4646df4: b4ffc608     	cbz	x8, 0x46466b4 <_ChromeMain+0x4641418>
 4646df8: 39404508     	ldrb	w8, [x8, #0x11]
 4646dfc: 3607c5c8     	tbz	w8, #0x0, 0x46466b4 <_ChromeMain+0x4641418>
 4646e00: 52800015     	mov	w21, #0x0               ; =0
 4646e04: 17fffea4     	b	0x4646894 <_ChromeMain+0x46415f8>
 4646e08: d37ffb68     	lsl	x8, x27, #1
 4646e0c: f100051f     	cmp	x8, #0x1
 4646e10: 9a9f851a     	csinc	x26, x8, xzr, hi
 4646e14: d342ff48     	lsr	x8, x26, #2
 4646e18: f90003e8     	str	x8, [sp]
 4646e1c: 8b1a0b48     	add	x8, x26, x26, lsl #2
 4646e20: d37df100     	lsl	x0, x8, #3
 4646e24: 96e72151     	bl	0xf368 <_ChromeMain+0xa0cc>
 4646e28: 52800508     	mov	w8, #0x28               ; =40
 4646e2c: f94003e9     	ldr	x9, [sp]
 4646e30: 9b080128     	madd	x8, x9, x8, x0
 4646e34: a938a3a0     	stp	x0, x8, [x29, #-0x78]
 4646e38: f81a03ba     	stur	x26, [x29, #-0x60]
 4646e3c: b4ffe1f7     	cbz	x23, 0x4646a78 <_ChromeMain+0x46417dc>
 4646e40: 8b1b0b68     	add	x8, x27, x27, lsl #2
 4646e44: d37df101     	lsl	x1, x8, #3
 4646e48: aa1703e0     	mov	x0, x23
 4646e4c: 96e7081b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646e50: 17ffff0a     	b	0x4646a78 <_ChromeMain+0x46417dc>
 4646e54: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 4646e58: 34ffc429     	cbz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646e5c: b982b6a9     	ldrsw	x9, [x21, #0x2b4]
 4646e60: 3100053f     	cmn	w9, #0x1
 4646e64: 540006e0     	b.eq	0x4646f40 <_ChromeMain+0x4641ca4>
 4646e68: f94142aa     	ldr	x10, [x21, #0x280]
 4646e6c: eb09015f     	cmp	x10, x9
 4646e70: 54fff229     	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 4646e74: f9413eaa     	ldr	x10, [x21, #0x278]
 4646e78: f8697949     	ldr	x9, [x10, x9, lsl #3]
 4646e7c: b9443129     	ldr	w9, [x9, #0x430]
 4646e80: 7100093f     	cmp	w9, #0x2
 4646e84: 54ffc2c0     	b.eq	0x46466dc <_ChromeMain+0x4641440>
 4646e88: f94136a9     	ldr	x9, [x21, #0x268]
 4646e8c: b4000609     	cbz	x9, 0x4646f4c <_ChromeMain+0x4641cb0>
 4646e90: 39458129     	ldrb	w9, [x9, #0x160]
 4646e94: 3707c249     	tbnz	w9, #0x0, 0x46466dc <_ChromeMain+0x4641440>
 4646e98: 17fffe20     	b	0x4646718 <_ChromeMain+0x464147c>
 4646e9c: f9400ac0     	ldr	x0, [x22, #0x10]
 4646ea0: f94012c8     	ldr	x8, [x22, #0x20]
 4646ea4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4646ea8: 96e70804     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646eac: a9017edf     	stp	xzr, xzr, [x22, #0x10]
 4646eb0: f80202df     	stur	xzr, [x22, #0x20]
 4646eb4: 17ffff29     	b	0x4646b58 <_ChromeMain+0x46418bc>
 4646eb8: 394ba2a9     	ldrb	w9, [x21, #0x2e8]
 4646ebc: 34ffc109     	cbz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646ec0: 394d2109     	ldrb	w9, [x8, #0x348]
 4646ec4: 35ffc0c9     	cbnz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646ec8: 17fffe14     	b	0x4646718 <_ChromeMain+0x464147c>
 4646ecc: 9415dc4d     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 4646ed0: 9416fc54     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4646ed4: 9416e512     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4646ed8: f9401909     	ldr	x9, [x8, #0x30]
 4646edc: b4ffc249     	cbz	x9, 0x4646724 <_ChromeMain+0x4641488>
 4646ee0: 9100a101     	add	x1, x8, #0x28
 4646ee4: 17fffe13     	b	0x4646730 <_ChromeMain+0x4641494>
 4646ee8: 97d08ee4     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4646eec: aa0003e1     	mov	x1, x0
 4646ef0: 17fffe10     	b	0x4646730 <_ChromeMain+0x4641494>
 4646ef4: d4200000     	brk	#0
 4646ef8: d4400000     	hlt	#0
 4646efc: d4200020     	brk	#0x1
 4646f00: f9401909     	ldr	x9, [x8, #0x30]
 4646f04: b4ffc369     	cbz	x9, 0x4646770 <_ChromeMain+0x46414d4>
 4646f08: 9100a101     	add	x1, x8, #0x28
 4646f0c: 17fffe1c     	b	0x464677c <_ChromeMain+0x46414e0>
 4646f10: d4200000     	brk	#0
 4646f14: d4400000     	hlt	#0
 4646f18: d4200020     	brk	#0x1
 4646f1c: 97d08ed7     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4646f20: aa0003e1     	mov	x1, x0
 4646f24: 17fffe16     	b	0x464677c <_ChromeMain+0x46414e0>
 4646f28: d0048ce0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4646f2c: 91376000     	add	x0, x0, #0xdd8
 4646f30: 9416e4e9     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 4646f34: d4200000     	brk	#0
 4646f38: d4400000     	hlt	#0
 4646f3c: d4200020     	brk	#0x1
 4646f40: d4200000     	brk	#0
 4646f44: d4400000     	hlt	#0
 4646f48: d4200020     	brk	#0x1
 4646f4c: d4200000     	brk	#0
 4646f50: d4400000     	hlt	#0
 4646f54: d4200020     	brk	#0x1
