
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34f95e8: d10143ff     	sub	sp, sp, #0x50
 34f95ec: a90257f6     	stp	x22, x21, [sp, #0x20]
 34f95f0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 34f95f4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 34f95f8: 910103fd     	add	x29, sp, #0x40
 34f95fc: 397e4008     	ldrb	w8, [x0, #0xf90]
 34f9600: 37000288     	tbnz	w8, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9604: aa0103f4     	mov	x20, x1
 34f9608: aa0003f3     	mov	x19, x0
 34f960c: f9442415     	ldr	x21, [x0, #0x848]
 34f9610: b005b580     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9614: 9118e000     	add	x0, x0, #0x638
 34f9618: 97307f1a     	bl	0x119280 <_ChromeMain+0x113fe4>
 34f961c: 370000a0     	tbnz	w0, #0x0, 0x34f9630 <_ChromeMain+0x34f4394>
 34f9620: b005b580     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9624: 91192000     	add	x0, x0, #0x648
 34f9628: 97307f16     	bl	0x119280 <_ChromeMain+0x113fe4>
 34f962c: 340000c0     	cbz	w0, 0x34f9644 <_ChromeMain+0x34f43a8>
 34f9630: 394782a8     	ldrb	w8, [x21, #0x1e0]
 34f9634: 34000088     	cbz	w8, 0x34f9644 <_ChromeMain+0x34f43a8>
 34f9638: f9442668     	ldr	x8, [x19, #0x848]
 34f963c: 39424108     	ldrb	w8, [x8, #0x90]
 34f9640: 37000128     	tbnz	w8, #0x0, 0x34f9664 <_ChromeMain+0x34f43c8>
 34f9644: aa1303e0     	mov	x0, x19
 34f9648: 97e26b9a     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f964c: 3928227f     	strb	wzr, [x19, #0xa08]
 34f9650: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f9654: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f9658: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f965c: 910143ff     	add	sp, sp, #0x50
 34f9660: d65f03c0     	ret
 34f9664: 39682668     	ldrb	w8, [x19, #0xa09]
 34f9668: 34000108     	cbz	w8, 0x34f9688 <_ChromeMain+0x34f43ec>
 34f966c: f942ca68     	ldr	x8, [x19, #0x590]
 34f9670: b40000a8     	cbz	x8, 0x34f9684 <_ChromeMain+0x34f43e8>
 34f9674: f941b100     	ldr	x0, [x8, #0x360]
 34f9678: b4000060     	cbz	x0, 0x34f9684 <_ChromeMain+0x34f43e8>
 34f967c: 978f479d     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 34f9680: 37000040     	tbnz	w0, #0x0, 0x34f9688 <_ChromeMain+0x34f43ec>
 34f9684: 3928267f     	strb	wzr, [x19, #0xa09]
 34f9688: b94c8668     	ldr	w8, [x19, #0xc84]
 34f968c: 7100051f     	cmp	w8, #0x1
 34f9690: 5400024b     	b.lt	0x34f96d8 <_ChromeMain+0x34f443c>
 34f9694: 91250260     	add	x0, x19, #0x940
 34f9698: 9748d420     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f969c: 91268260     	add	x0, x19, #0x9a0
 34f96a0: 9748d41e     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f96a4: 39282a7f     	strb	wzr, [x19, #0xa0a]
 34f96a8: 3928327f     	strb	wzr, [x19, #0xa0c]
 34f96ac: aa1303e0     	mov	x0, x19
 34f96b0: 97e26b80     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f96b4: 39682268     	ldrb	w8, [x19, #0xa08]
 34f96b8: 34000328     	cbz	w8, 0x34f971c <_ChromeMain+0x34f4480>
 34f96bc: aa1303e0     	mov	x0, x19
 34f96c0: 52800001     	mov	w1, #0x0                ; =0
 34f96c4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f96c8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f96cc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f96d0: 910143ff     	add	sp, sp, #0x50
 34f96d4: 14455ccc     	b	0x4650a04 <_ChromeMain+0x464b768>
 34f96d8: b94c8a68     	ldr	w8, [x19, #0xc88]
 34f96dc: 7100051f     	cmp	w8, #0x1
 34f96e0: 540000eb     	b.lt	0x34f96fc <_ChromeMain+0x34f4460>
 34f96e4: aa1303e0     	mov	x0, x19
 34f96e8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f96ec: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f96f0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f96f4: 910143ff     	add	sp, sp, #0x50
 34f96f8: 17e26b6e     	b	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f96fc: b94c8e68     	ldr	w8, [x19, #0xc8c]
 34f9700: 7100051f     	cmp	w8, #0x1
 34f9704: 5400028b     	b.lt	0x34f9754 <_ChromeMain+0x34f44b8>
 34f9708: 39682268     	ldrb	w8, [x19, #0xa08]
 34f970c: 3707fa28     	tbnz	w8, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9710: aa1303e0     	mov	x0, x19
 34f9714: 52800021     	mov	w1, #0x1                ; =1
 34f9718: 17ffffeb     	b	0x34f96c4 <_ChromeMain+0x34f4428>
 34f971c: aa1303e0     	mov	x0, x19
 34f9720: 52800021     	mov	w1, #0x1                ; =1
 34f9724: 94454467     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 34f9728: aa1303e0     	mov	x0, x19
 34f972c: 52800001     	mov	w1, #0x0                ; =0
 34f9730: 9744db51     	bl	0x630474 <_ChromeMain+0x62b1d8>
 34f9734: f9422e68     	ldr	x8, [x19, #0x458]
 34f9738: 9107c100     	add	x0, x8, #0x1f0
 34f973c: 52800001     	mov	w1, #0x0                ; =0
 34f9740: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f9744: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f9748: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f974c: 910143ff     	add	sp, sp, #0x50
 34f9750: 1744db49     	b	0x630474 <_ChromeMain+0x62b1d8>
 34f9754: f940c260     	ldr	x0, [x19, #0x180]
 34f9758: b40000c0     	cbz	x0, 0x34f9770 <_ChromeMain+0x34f44d4>
 34f975c: 974e07db     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 34f9760: 37000080     	tbnz	w0, #0x0, 0x34f9770 <_ChromeMain+0x34f44d4>
 34f9764: 39682268     	ldrb	w8, [x19, #0xa08]
 34f9768: 35fffaa8     	cbnz	w8, 0x34f96bc <_ChromeMain+0x34f4420>
 34f976c: 17ffffb9     	b	0x34f9650 <_ChromeMain+0x34f43b4>
 34f9770: aa1303e0     	mov	x0, x19
 34f9774: 978f475f     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 34f9778: f278029f     	tst	x20, #0x100
 34f977c: 1a940014     	csel	w20, w0, w20, eq
 34f9780: f9400268     	ldr	x8, [x19]
 34f9784: f9403508     	ldr	x8, [x8, #0x68]
 34f9788: aa1303e0     	mov	x0, x19
 34f978c: d63f0100     	blr	x8
 34f9790: aa1303f5     	mov	x21, x19
 34f9794: f84e8ea8     	ldr	x8, [x21, #0xe8]!
 34f9798: 9005a876     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 34f979c: 911922d6     	add	x22, x22, #0x648
 34f97a0: b40001e8     	cbz	x8, 0x34f97dc <_ChromeMain+0x34f4540>
 34f97a4: f9401109     	ldr	x9, [x8, #0x20]
 34f97a8: eb16013f     	cmp	x9, x22
 34f97ac: 540000a8     	b.hi	0x34f97c0 <_ChromeMain+0x34f4524>
 34f97b0: 540000e2     	b.hs	0x34f97cc <_ChromeMain+0x34f4530>
 34f97b4: f9400508     	ldr	x8, [x8, #0x8]
 34f97b8: b5ffff68     	cbnz	x8, 0x34f97a4 <_ChromeMain+0x34f4508>
 34f97bc: 14000008     	b	0x34f97dc <_ChromeMain+0x34f4540>
 34f97c0: f9400108     	ldr	x8, [x8]
 34f97c4: b5ffff08     	cbnz	x8, 0x34f97a4 <_ChromeMain+0x34f4508>
 34f97c8: 14000005     	b	0x34f97dc <_ChromeMain+0x34f4540>
 34f97cc: eb15011f     	cmp	x8, x21
 34f97d0: 54000060     	b.eq	0x34f97dc <_ChromeMain+0x34f4540>
 34f97d4: f9401908     	ldr	x8, [x8, #0x30]
 34f97d8: b5001ec8     	cbnz	x8, 0x34f9bb0 <_ChromeMain+0x34f4914>
 34f97dc: b4000400     	cbz	x0, 0x34f985c <_ChromeMain+0x34f45c0>
 34f97e0: 974d383c     	bl	0x8478d0 <_ChromeMain+0x842634>
 34f97e4: b40003c0     	cbz	x0, 0x34f985c <_ChromeMain+0x34f45c0>
 34f97e8: f9400268     	ldr	x8, [x19]
 34f97ec: f9403508     	ldr	x8, [x8, #0x68]
 34f97f0: aa1303e0     	mov	x0, x19
 34f97f4: d63f0100     	blr	x8
 34f97f8: f9407668     	ldr	x8, [x19, #0xe8]
 34f97fc: b40000e8     	cbz	x8, 0x34f9818 <_ChromeMain+0x34f457c>
 34f9800: f9401109     	ldr	x9, [x8, #0x20]
 34f9804: eb16013f     	cmp	x9, x22
 34f9808: 540009c8     	b.hi	0x34f9940 <_ChromeMain+0x34f46a4>
 34f980c: 540001a2     	b.hs	0x34f9840 <_ChromeMain+0x34f45a4>
 34f9810: f9400508     	ldr	x8, [x8, #0x8]
 34f9814: b5ffff68     	cbnz	x8, 0x34f9800 <_ChromeMain+0x34f4564>
 34f9818: b40001e0     	cbz	x0, 0x34f9854 <_ChromeMain+0x34f45b8>
 34f981c: 974d382d     	bl	0x8478d0 <_ChromeMain+0x842634>
 34f9820: aa0003e8     	mov	x8, x0
 34f9824: f9400d08     	ldr	x8, [x8, #0x18]
 34f9828: f100011f     	cmp	x8, #0x0
 34f982c: 1a9f07f5     	cset	w21, ne
 34f9830: eb13011f     	cmp	x8, x19
 34f9834: fa401904     	ccmp	x8, #0x0, #0x4, ne
 34f9838: 54000140     	b.eq	0x34f9860 <_ChromeMain+0x34f45c4>
 34f983c: 1400003f     	b	0x34f9938 <_ChromeMain+0x34f469c>
 34f9840: eb15011f     	cmp	x8, x21
 34f9844: 54fffea0     	b.eq	0x34f9818 <_ChromeMain+0x34f457c>
 34f9848: f9401908     	ldr	x8, [x8, #0x30]
 34f984c: b5001c08     	cbnz	x8, 0x34f9bcc <_ChromeMain+0x34f4930>
 34f9850: b5fffe60     	cbnz	x0, 0x34f981c <_ChromeMain+0x34f4580>
 34f9854: d2800008     	mov	x8, #0x0                ; =0
 34f9858: 17fffff3     	b	0x34f9824 <_ChromeMain+0x34f4588>
 34f985c: 52800015     	mov	w21, #0x0               ; =0
 34f9860: 360000b4     	tbz	w20, #0x0, 0x34f9874 <_ChromeMain+0x34f45d8>
 34f9864: 39683268     	ldrb	w8, [x19, #0xa0c]
 34f9868: 34000068     	cbz	w8, 0x34f9874 <_ChromeMain+0x34f45d8>
 34f986c: 91250260     	add	x0, x19, #0x940
 34f9870: 9748d3aa     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f9874: f9442668     	ldr	x8, [x19, #0x848]
 34f9878: 39424109     	ldrb	w9, [x8, #0x90]
 34f987c: 34000069     	cbz	w9, 0x34f9888 <_ChromeMain+0x34f45ec>
 34f9880: 39683269     	ldrb	w9, [x19, #0xa0c]
 34f9884: 350000c9     	cbnz	w9, 0x34f989c <_ChromeMain+0x34f4600>
 34f9888: 52800016     	mov	w22, #0x0               ; =0
 34f988c: 34000115     	cbz	w21, 0x34f98ac <_ChromeMain+0x34f4610>
 34f9890: 39683269     	ldrb	w9, [x19, #0xa0c]
 34f9894: 52000129     	eor	w9, w9, #0x1
 34f9898: 14000006     	b	0x34f98b0 <_ChromeMain+0x34f4614>
 34f989c: 39682a69     	ldrb	w9, [x19, #0xa0a]
 34f98a0: 36000569     	tbz	w9, #0x0, 0x34f994c <_ChromeMain+0x34f46b0>
 34f98a4: 52800036     	mov	w22, #0x1               ; =1
 34f98a8: 35ffff55     	cbnz	w21, 0x34f9890 <_ChromeMain+0x34f45f4>
 34f98ac: 52800009     	mov	w9, #0x0                ; =0
 34f98b0: 3968266a     	ldrb	w10, [x19, #0xa09]
 34f98b4: 3600016a     	tbz	w10, #0x0, 0x34f98e0 <_ChromeMain+0x34f4644>
 34f98b8: 370001f6     	tbnz	w22, #0x0, 0x34f98f4 <_ChromeMain+0x34f4658>
 34f98bc: 39683268     	ldrb	w8, [x19, #0xa0c]
 34f98c0: 34000068     	cbz	w8, 0x34f98cc <_ChromeMain+0x34f4630>
 34f98c4: 39682a68     	ldrb	w8, [x19, #0xa0a]
 34f98c8: 360004a8     	tbz	w8, #0x0, 0x34f995c <_ChromeMain+0x34f46c0>
 34f98cc: 39682268     	ldrb	w8, [x19, #0xa08]
 34f98d0: 34fff0a8     	cbz	w8, 0x34f96e4 <_ChromeMain+0x34f4448>
 34f98d4: b94c8a68     	ldr	w8, [x19, #0xc88]
 34f98d8: 34ffef28     	cbz	w8, 0x34f96bc <_ChromeMain+0x34f4420>
 34f98dc: 17ffff82     	b	0x34f96e4 <_ChromeMain+0x34f4448>
 34f98e0: 3947a108     	ldrb	w8, [x8, #0x1e8]
 34f98e4: 2a090289     	orr	w9, w20, w9
 34f98e8: 0a090108     	and	w8, w8, w9
 34f98ec: 2a160108     	orr	w8, w8, w22
 34f98f0: 3607fe68     	tbz	w8, #0x0, 0x34f98bc <_ChromeMain+0x34f4620>
 34f98f4: 39682268     	ldrb	w8, [x19, #0xa08]
 34f98f8: 3707eac8     	tbnz	w8, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f98fc: f9466668     	ldr	x8, [x19, #0xcc8]
 34f9900: b4000f28     	cbz	x8, 0x34f9ae4 <_ChromeMain+0x34f4848>
 34f9904: 3707f076     	tbnz	w22, #0x0, 0x34f9710 <_ChromeMain+0x34f4474>
 34f9908: 973a792e     	bl	0x397dc0 <_ChromeMain+0x392b24>
 34f990c: b005b595     	adrp	x21, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9910: 34001040     	cbz	w0, 0x34f9b18 <_ChromeMain+0x34f487c>
 34f9914: b94686a8     	ldr	w8, [x21, #0x684]
 34f9918: 37901008     	tbnz	w8, #0x12, 0x34f9b18 <_ChromeMain+0x34f487c>
 34f991c: 90059ac0     	adrp	x0, 0xe851000 <dyld_stub_binder+0xe851000>
 34f9920: 913d6000     	add	x0, x0, #0xf58
 34f9924: 97e26b26     	bl	0x2d945bc <_ChromeMain+0x2d8f320>
 34f9928: 35001380     	cbnz	w0, 0x34f9b98 <_ChromeMain+0x34f48fc>
 34f992c: f9448a60     	ldr	x0, [x19, #0x910]
 34f9930: b4000620     	cbz	x0, 0x34f99f4 <_ChromeMain+0x34f4758>
 34f9934: 14000024     	b	0x34f99c4 <_ChromeMain+0x34f4728>
 34f9938: f940c508     	ldr	x8, [x8, #0x188]
 34f993c: 17ffffbb     	b	0x34f9828 <_ChromeMain+0x34f458c>
 34f9940: f9400108     	ldr	x8, [x8]
 34f9944: b5fff5e8     	cbnz	x8, 0x34f9800 <_ChromeMain+0x34f4564>
 34f9948: 17ffffb4     	b	0x34f9818 <_ChromeMain+0x34f457c>
 34f994c: 39682e69     	ldrb	w9, [x19, #0xa0b]
 34f9950: 2a140136     	orr	w22, w9, w20
 34f9954: 35fff9f5     	cbnz	w21, 0x34f9890 <_ChromeMain+0x34f45f4>
 34f9958: 17ffffd5     	b	0x34f98ac <_ChromeMain+0x34f4610>
 34f995c: 39682e68     	ldrb	w8, [x19, #0xa0b]
 34f9960: 2a140108     	orr	w8, w8, w20
 34f9964: 3707fb48     	tbnz	w8, #0x0, 0x34f98cc <_ChromeMain+0x34f4630>
 34f9968: 39682268     	ldrb	w8, [x19, #0xa08]
 34f996c: 3707fb08     	tbnz	w8, #0x0, 0x34f98cc <_ChromeMain+0x34f4630>
 34f9970: 3928327f     	strb	wzr, [x19, #0xa0c]
 34f9974: 91268260     	add	x0, x19, #0x9a0
 34f9978: 9748d368     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f997c: aa1303e0     	mov	x0, x19
 34f9980: 52800021     	mov	w1, #0x1                ; =1
 34f9984: 944543cf     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 34f9988: aa1303e0     	mov	x0, x19
 34f998c: 52800001     	mov	w1, #0x0                ; =0
 34f9990: 9744dab9     	bl	0x630474 <_ChromeMain+0x62b1d8>
 34f9994: f9422e68     	ldr	x8, [x19, #0x458]
 34f9998: 9107c100     	add	x0, x8, #0x1f0
 34f999c: 52800001     	mov	w1, #0x0                ; =0
 34f99a0: 9744dab5     	bl	0x630474 <_ChromeMain+0x62b1d8>
 34f99a4: 17ffffca     	b	0x34f98cc <_ChromeMain+0x34f4630>
 34f99a8: 90059ac0     	adrp	x0, 0xe851000 <dyld_stub_binder+0xe851000>
 34f99ac: 913c6000     	add	x0, x0, #0xf18
 34f99b0: 97a0ff13     	bl	0x1d395fc <_ChromeMain+0x1d34360>
 34f99b4: 1400001e     	b	0x34f9a2c <_ChromeMain+0x34f4790>
 34f99b8: d63f0100     	blr	x8
 34f99bc: 3707e4a0     	tbnz	w0, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f99c0: 1400000d     	b	0x34f99f4 <_ChromeMain+0x34f4758>
 34f99c4: f9400008     	ldr	x8, [x0]
 34f99c8: f9400908     	ldr	x8, [x8, #0x10]
 34f99cc: f0006e69     	adrp	x9, 0x42c8000 <_ChromeMain+0x42c2d64>
 34f99d0: 9123b129     	add	x9, x9, #0x8ec
 34f99d4: eb09011f     	cmp	x8, x9
 34f99d8: 54ffff01     	b.ne	0x34f99b8 <_ChromeMain+0x34f471c>
 34f99dc: f9401008     	ldr	x8, [x0, #0x20]
 34f99e0: b40000a8     	cbz	x8, 0x34f99f4 <_ChromeMain+0x34f4758>
 34f99e4: f9400c08     	ldr	x8, [x0, #0x18]
 34f99e8: b8bfc108     	ldapr	w8, [x8]
 34f99ec: 7100051f     	cmp	w8, #0x1
 34f99f0: 54ffe301     	b.ne	0x34f9650 <_ChromeMain+0x34f43b4>
 34f99f4: d0054e80     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 34f99f8: 913b2000     	add	x0, x0, #0xec8
 34f99fc: d0054e81     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 34f9a00: 912c7821     	add	x1, x1, #0xb1e
 34f9a04: 910003e8     	mov	x8, sp
 34f9a08: 5287ccc2     	mov	w2, #0x3e66             ; =15974
 34f9a0c: 972d5c9d     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 34f9a10: 973a78ec     	bl	0x397dc0 <_ChromeMain+0x392b24>
 34f9a14: 34fffca0     	cbz	w0, 0x34f99a8 <_ChromeMain+0x34f470c>
 34f9a18: b94686a8     	ldr	w8, [x21, #0x684]
 34f9a1c: 3797fc68     	tbnz	w8, #0x12, 0x34f99a8 <_ChromeMain+0x34f470c>
 34f9a20: 90059ac0     	adrp	x0, 0xe851000 <dyld_stub_binder+0xe851000>
 34f9a24: 913c6000     	add	x0, x0, #0xf18
 34f9a28: 94f66e98     	bl	0x7295488 <_ChromeMain+0x72901ec>
 34f9a2c: aa0003f4     	mov	x20, x0
 34f9a30: 925e7668     	and	x8, x19, #0xfffffffc00000000
 34f9a34: b005b5c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 34f9a38: f9404529     	ldr	x9, [x9, #0x88]
 34f9a3c: eb09011f     	cmp	x8, x9
 34f9a40: 54000061     	b.ne	0x34f9a4c <_ChromeMain+0x34f47b0>
 34f9a44: aa1303e0     	mov	x0, x19
 34f9a48: 972c6a2d     	bl	0x142fc <_ChromeMain+0xf060>
 34f9a4c: 52800800     	mov	w0, #0x40               ; =64
 34f9a50: 972c5646     	bl	0xf368 <_ChromeMain+0xa0cc>
 34f9a54: aa0003e3     	mov	x3, x0
 34f9a58: 52800028     	mov	w8, #0x1                ; =1
 34f9a5c: 9000d009     	adrp	x9, 0x4ef9000 <_ChromeMain+0x4ef3d64>
 34f9a60: 91224129     	add	x9, x9, #0x890
 34f9a64: b00023aa     	adrp	x10, 0x396e000 <_ChromeMain+0x3968d64>
 34f9a68: 910d014a     	add	x10, x10, #0x340
 34f9a6c: b9000008     	str	w8, [x0]
 34f9a70: 90ff832b     	adrp	x11, 0x255d000 <_ChromeMain+0x2557d64>
 34f9a74: 912c016b     	add	x11, x11, #0xb00
 34f9a78: f0008aac     	adrp	x12, 0x4650000 <_ChromeMain+0x464ad64>
 34f9a7c: 9128118c     	add	x12, x12, #0xa04
 34f9a80: a900a809     	stp	x9, x10, [x0, #0x8]
 34f9a84: a901b00b     	stp	x11, x12, [x0, #0x18]
 34f9a88: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 34f9a8c: 3900e008     	strb	w8, [x0, #0x38]
 34f9a90: 91238260     	add	x0, x19, #0x8e0
 34f9a94: 910003e1     	mov	x1, sp
 34f9a98: aa1403e2     	mov	x2, x20
 34f9a9c: 973ec29a     	bl	0x4aa504 <_ChromeMain+0x4a5268>
 34f9aa0: 973a78c8     	bl	0x397dc0 <_ChromeMain+0x392b24>
 34f9aa4: 340009c0     	cbz	w0, 0x34f9bdc <_ChromeMain+0x34f4940>
 34f9aa8: b94686a8     	ldr	w8, [x21, #0x684]
 34f9aac: 37900988     	tbnz	w8, #0x12, 0x34f9bdc <_ChromeMain+0x34f4940>
 34f9ab0: 90059ac0     	adrp	x0, 0xe851000 <dyld_stub_binder+0xe851000>
 34f9ab4: 913ce000     	add	x0, x0, #0xf38
 34f9ab8: 94f66e92     	bl	0x7295500 <_ChromeMain+0x7290264>
 34f9abc: b4ffdca0     	cbz	x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9ac0: 52822008     	mov	w8, #0x1100             ; =4352
 34f9ac4: ab080268     	adds	x8, x19, x8
 34f9ac8: 540007c0     	b.eq	0x34f9bc0 <_ChromeMain+0x34f4924>
 34f9acc: 52800049     	mov	w9, #0x2                ; =2
 34f9ad0: a90027e8     	stp	x8, x9, [sp]
 34f9ad4: 9101e260     	add	x0, x19, #0x78
 34f9ad8: 910003e1     	mov	x1, sp
 34f9adc: 97be929f     	bl	0x249e558 <_ChromeMain+0x24992bc>
 34f9ae0: 17fffedc     	b	0x34f9650 <_ChromeMain+0x34f43b4>
 34f9ae4: f9425274     	ldr	x20, [x19, #0x4a0]
 34f9ae8: 52800100     	mov	w0, #0x8                ; =8
 34f9aec: 972c561f     	bl	0xf368 <_ChromeMain+0xa0cc>
 34f9af0: aa0003f5     	mov	x21, x0
 34f9af4: aa1403e1     	mov	x1, x20
 34f9af8: 95fffcea     	bl	0xb4f8ea0 <_ChromeMain+0xb4f3c04>
 34f9afc: f9466660     	ldr	x0, [x19, #0xcc8]
 34f9b00: f9066675     	str	x21, [x19, #0xcc8]
 34f9b04: b4fff000     	cbz	x0, 0x34f9904 <_ChromeMain+0x34f4668>
 34f9b08: 95e26709     	bl	0xad9372c <_ChromeMain+0xad8e490>
 34f9b0c: 52800101     	mov	w1, #0x8                ; =8
 34f9b10: 972c3cea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34f9b14: 17ffff7c     	b	0x34f9904 <_ChromeMain+0x34f4668>
 34f9b18: 52800600     	mov	w0, #0x30               ; =48
 34f9b1c: 972c5613     	bl	0xf368 <_ChromeMain+0xa0cc>
 34f9b20: f90003e0     	str	x0, [sp]
 34f9b24: b0055208     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 34f9b28: 3dc2e900     	ldr	q0, [x8, #0xba0]
 34f9b2c: 3c8083e0     	stur	q0, [sp, #0x8]
 34f9b30: 91009809     	add	x9, x0, #0x26
 34f9b34: eb00013f     	cmp	x9, x0
 34f9b38: 54000483     	b.lo	0x34f9bc8 <_ChromeMain+0x34f492c>
 34f9b3c: b0052a08     	adrp	x8, 0xda3a000 <dyld_stub_binder+0xda3a000>
 34f9b40: 9126f508     	add	x8, x8, #0x9bd
 34f9b44: eb08013f     	cmp	x9, x8
 34f9b48: fa488002     	ccmp	x0, x8, #0x2, hi
 34f9b4c: 540003e9     	b.ls	0x34f9bc8 <_ChromeMain+0x34f492c>
 34f9b50: ad400500     	ldp	q0, q1, [x8]
 34f9b54: ad000400     	stp	q0, q1, [x0]
 34f9b58: f841e108     	ldur	x8, [x8, #0x1e]
 34f9b5c: f801e008     	stur	x8, [x0, #0x1e]
 34f9b60: 3900981f     	strb	wzr, [x0, #0x26]
 34f9b64: b005b580     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9b68: 9119e000     	add	x0, x0, #0x678
 34f9b6c: 910003e1     	mov	x1, sp
 34f9b70: 52800022     	mov	w2, #0x1                ; =1
 34f9b74: 973b2db3     	bl	0x3c5240 <_ChromeMain+0x3bffa4>
 34f9b78: aa0003f4     	mov	x20, x0
 34f9b7c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 34f9b80: 36f800a8     	tbz	w8, #0x1f, 0x34f9b94 <_ChromeMain+0x34f48f8>
 34f9b84: f94003e0     	ldr	x0, [sp]
 34f9b88: f9400be8     	ldr	x8, [sp, #0x10]
 34f9b8c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34f9b90: 972c3cca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34f9b94: 3607ecd4     	tbz	w20, #0x0, 0x34f992c <_ChromeMain+0x34f4690>
 34f9b98: aa1303e0     	mov	x0, x19
 34f9b9c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f9ba0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f9ba4: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f9ba8: 910143ff     	add	sp, sp, #0x50
 34f9bac: 15fffcc0     	b	0xb4f8eac <_ChromeMain+0xb4f3c10>
 34f9bb0: b4ffe1c0     	cbz	x0, 0x34f97e8 <_ChromeMain+0x34f454c>
 34f9bb4: d4200000     	brk	#0
 34f9bb8: d4400000     	hlt	#0
 34f9bbc: d4200020     	brk	#0x1
 34f9bc0: d4200000     	brk	#0
 34f9bc4: d4400000     	hlt	#0
 34f9bc8: d4200020     	brk	#0x1
 34f9bcc: b4ffe2c0     	cbz	x0, 0x34f9824 <_ChromeMain+0x34f4588>
 34f9bd0: d4200000     	brk	#0
 34f9bd4: d4400000     	hlt	#0
 34f9bd8: d4200020     	brk	#0x1
 34f9bdc: 90059ac0     	adrp	x0, 0xe851000 <dyld_stub_binder+0xe851000>
 34f9be0: 913ce000     	add	x0, x0, #0xf38
 34f9be4: 97a0fe86     	bl	0x1d395fc <_ChromeMain+0x1d34360>
 34f9be8: b4ffd340     	cbz	x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9bec: 17ffffb5     	b	0x34f9ac0 <_ChromeMain+0x34f4824>
