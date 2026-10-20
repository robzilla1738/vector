
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462e4bc: d10283ff     	sub	sp, sp, #0xa0
 462e4c0: a90567fa     	stp	x26, x25, [sp, #0x50]
 462e4c4: a9065ff8     	stp	x24, x23, [sp, #0x60]
 462e4c8: a90757f6     	stp	x22, x21, [sp, #0x70]
 462e4cc: a9084ff4     	stp	x20, x19, [sp, #0x80]
 462e4d0: a9097bfd     	stp	x29, x30, [sp, #0x90]
 462e4d4: 910243fd     	add	x29, sp, #0x90
 462e4d8: aa0103f4     	mov	x20, x1
 462e4dc: aa0003f3     	mov	x19, x0
 462e4e0: 91400417     	add	x23, x0, #0x1, lsl #12  ; =0x1000
 462e4e4: 394fe2e8     	ldrb	w8, [x23, #0x3f8]
 462e4e8: 340003a8     	cbz	w8, 0x462e55c <_ChromeMain+0x46292c0>
 462e4ec: 394f9ee8     	ldrb	w8, [x23, #0x3e7]
 462e4f0: 13001d18     	sxtb	w24, w8
 462e4f4: f949ee75     	ldr	x21, [x19, #0x13d8]
 462e4f8: 7100031f     	cmp	w24, #0x0
 462e4fc: 9a8842a2     	csel	x2, x21, x8, mi
 462e500: 39405e89     	ldrb	w9, [x20, #0x17]
 462e504: 13001d28     	sxtb	w8, w9
 462e508: f940068a     	ldr	x10, [x20, #0x8]
 462e50c: 7100011f     	cmp	w8, #0x0
 462e510: 9a894149     	csel	x9, x10, x9, mi
 462e514: eb09005f     	cmp	x2, x9
 462e518: 54000161     	b.ne	0x462e544 <_ChromeMain+0x46292a8>
 462e51c: 52827a09     	mov	w9, #0x13d0             ; =5072
 462e520: 8b090279     	add	x25, x19, x9
 462e524: f9400336     	ldr	x22, [x25]
 462e528: 7100031f     	cmp	w24, #0x0
 462e52c: 9a9942c0     	csel	x0, x22, x25, mi
 462e530: f9400289     	ldr	x9, [x20]
 462e534: 7100011f     	cmp	w8, #0x0
 462e538: 9a944121     	csel	x1, x9, x20, mi
 462e53c: 94e76cc9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 462e540: 34000460     	cbz	w0, 0x462e5cc <_ChromeMain+0x4629330>
 462e544: 36f800b8     	tbz	w24, #0x1f, 0x462e558 <_ChromeMain+0x46292bc>
 462e548: f949ea60     	ldr	x0, [x19, #0x13d0]
 462e54c: f949f268     	ldr	x8, [x19, #0x13e0]
 462e550: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e554: 96e76a59     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462e558: 390fe2ff     	strb	wzr, [x23, #0x3f8]
 462e55c: 3dc00280     	ldr	q0, [x20]
 462e560: 3d8003e0     	str	q0, [sp]
 462e564: f9400a88     	ldr	x8, [x20, #0x10]
 462e568: f9000be8     	str	x8, [sp, #0x10]
 462e56c: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 462e570: f900029f     	str	xzr, [x20]
 462e574: 910003e1     	mov	x1, sp
 462e578: aa1303e0     	mov	x0, x19
 462e57c: 940029d3     	bl	0x4638cc8 <_ChromeMain+0x4633a2c>
 462e580: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462e584: 37f80108     	tbnz	w8, #0x1f, 0x462e5a4 <_ChromeMain+0x4629308>
 462e588: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 462e58c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 462e590: a94757f6     	ldp	x22, x21, [sp, #0x70]
 462e594: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 462e598: a94567fa     	ldp	x26, x25, [sp, #0x50]
 462e59c: 910283ff     	add	sp, sp, #0xa0
 462e5a0: d65f03c0     	ret
 462e5a4: f94003e0     	ldr	x0, [sp]
 462e5a8: f9400be8     	ldr	x8, [sp, #0x10]
 462e5ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e5b0: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 462e5b4: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 462e5b8: a94757f6     	ldp	x22, x21, [sp, #0x70]
 462e5bc: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 462e5c0: a94567fa     	ldp	x26, x25, [sp, #0x50]
 462e5c4: 910283ff     	add	sp, sp, #0xa0
 462e5c8: 16e76a3c     	b	0x8eb8 <_ChromeMain+0x3c1c>
 462e5cc: f9423668     	ldr	x8, [x19, #0x468]
 462e5d0: b4fffba8     	cbz	x8, 0x462e544 <_ChromeMain+0x46292a8>
 462e5d4: f90023ff     	str	xzr, [sp, #0x40]
 462e5d8: 6f00e400     	movi.2d	v0, #0000000000000000
 462e5dc: ad0103e0     	stp	q0, q0, [sp, #0x20]
 462e5e0: 37f80558     	tbnz	w24, #0x1f, 0x462e688 <_ChromeMain+0x46293ec>
 462e5e4: 3dc00320     	ldr	q0, [x25]
 462e5e8: 3d800be0     	str	q0, [sp, #0x20]
 462e5ec: f9400b28     	ldr	x8, [x25, #0x10]
 462e5f0: 52827d09     	mov	w9, #0x13e8             ; =5096
 462e5f4: 8b090269     	add	x9, x19, x9
 462e5f8: f949f66a     	ldr	x10, [x19, #0x13e8]
 462e5fc: a9032be8     	stp	x8, x10, [sp, #0x30]
 462e600: f8405128     	ldur	x8, [x9, #0x5]
 462e604: f803d3e8     	stur	x8, [sp, #0x3d]
 462e608: 390fe2ff     	strb	wzr, [x23, #0x3f8]
 462e60c: 394113e8     	ldrb	w8, [sp, #0x44]
 462e610: 34000148     	cbz	w8, 0x462e638 <_ChromeMain+0x462939c>
 462e614: f9423668     	ldr	x8, [x19, #0x468]
 462e618: b4000108     	cbz	x8, 0x462e638 <_ChromeMain+0x462939c>
 462e61c: f9400100     	ldr	x0, [x8]
 462e620: b9401808     	ldr	w8, [x0, #0x18]
 462e624: 7100051f     	cmp	w8, #0x1
 462e628: 5400008b     	b.lt	0x462e638 <_ChromeMain+0x462939c>
 462e62c: d2800015     	mov	x21, #0x0               ; =0
 462e630: b94043f6     	ldr	w22, [sp, #0x40]
 462e634: 1400002e     	b	0x462e6ec <_ChromeMain+0x4629450>
 462e638: 3940f3e8     	ldrb	w8, [sp, #0x3c]
 462e63c: 35000148     	cbnz	w8, 0x462e664 <_ChromeMain+0x46293c8>
 462e640: aa1303e0     	mov	x0, x19
 462e644: 97fff6d1     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462e648: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 462e64c: 36fff888     	tbz	w8, #0x1f, 0x462e55c <_ChromeMain+0x46292c0>
 462e650: f94013e0     	ldr	x0, [sp, #0x20]
 462e654: f9401be8     	ldr	x8, [sp, #0x30]
 462e658: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e65c: 96e76a17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462e660: 17ffffbf     	b	0x462e55c <_ChromeMain+0x46292c0>
 462e664: f9423668     	ldr	x8, [x19, #0x468]
 462e668: b4fffec8     	cbz	x8, 0x462e640 <_ChromeMain+0x46293a4>
 462e66c: f9400100     	ldr	x0, [x8]
 462e670: b9401808     	ldr	w8, [x0, #0x18]
 462e674: 7100051f     	cmp	w8, #0x1
 462e678: 54fffe4b     	b.lt	0x462e640 <_ChromeMain+0x46293a4>
 462e67c: d2800015     	mov	x21, #0x0               ; =0
 462e680: b9403bf6     	ldr	w22, [sp, #0x38]
 462e684: 14000027     	b	0x462e720 <_ChromeMain+0x4629484>
 462e688: 910083e0     	add	x0, sp, #0x20
 462e68c: aa1603e1     	mov	x1, x22
 462e690: aa1503e2     	mov	x2, x21
 462e694: 96e7a6e1     	bl	0x18218 <_ChromeMain+0x12f7c>
 462e698: 394fe2e8     	ldrb	w8, [x23, #0x3f8]
 462e69c: 52827d09     	mov	w9, #0x13e8             ; =5096
 462e6a0: 8b090269     	add	x9, x19, x9
 462e6a4: f949f66a     	ldr	x10, [x19, #0x13e8]
 462e6a8: f9001fea     	str	x10, [sp, #0x38]
 462e6ac: f8405129     	ldur	x9, [x9, #0x5]
 462e6b0: f803d3e9     	stur	x9, [sp, #0x3d]
 462e6b4: 34fffac8     	cbz	w8, 0x462e60c <_ChromeMain+0x4629370>
 462e6b8: 39cf9ee8     	ldrsb	w8, [x23, #0x3e7]
 462e6bc: 36fffa68     	tbz	w8, #0x1f, 0x462e608 <_ChromeMain+0x462936c>
 462e6c0: f949ea60     	ldr	x0, [x19, #0x13d0]
 462e6c4: f949f268     	ldr	x8, [x19, #0x13e0]
 462e6c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462e6cc: 96e769fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462e6d0: 17ffffce     	b	0x462e608 <_ChromeMain+0x462936c>
 462e6d4: 910006b5     	add	x21, x21, #0x1
 462e6d8: f9423668     	ldr	x8, [x19, #0x468]
 462e6dc: f9400100     	ldr	x0, [x8]
 462e6e0: b9801808     	ldrsw	x8, [x0, #0x18]
 462e6e4: eb0802bf     	cmp	x21, x8
 462e6e8: 54fffa8a     	b.ge	0x462e638 <_ChromeMain+0x462939c>
 462e6ec: aa1503e1     	mov	x1, x21
 462e6f0: 9728bf02     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462e6f4: b4ffff00     	cbz	x0, 0x462e6d4 <_ChromeMain+0x4629438>
 462e6f8: b9401008     	ldr	w8, [x0, #0x10]
 462e6fc: 6b16011f     	cmp	w8, w22
 462e700: 540001e0     	b.eq	0x462e73c <_ChromeMain+0x46294a0>
 462e704: 17fffff4     	b	0x462e6d4 <_ChromeMain+0x4629438>
 462e708: 910006b5     	add	x21, x21, #0x1
 462e70c: f9423668     	ldr	x8, [x19, #0x468]
 462e710: f9400100     	ldr	x0, [x8]
 462e714: b9801808     	ldrsw	x8, [x0, #0x18]
 462e718: eb0802bf     	cmp	x21, x8
 462e71c: 54fff92a     	b.ge	0x462e640 <_ChromeMain+0x46293a4>
 462e720: aa1503e1     	mov	x1, x21
 462e724: 9728bef5     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462e728: b4ffff00     	cbz	x0, 0x462e708 <_ChromeMain+0x462946c>
 462e72c: b9401008     	ldr	w8, [x0, #0x10]
 462e730: 6b16011f     	cmp	w8, w22
 462e734: 540013e0     	b.eq	0x462e9b0 <_ChromeMain+0x4629714>
 462e738: 17fffff4     	b	0x462e708 <_ChromeMain+0x462946c>
 462e73c: f947e668     	ldr	x8, [x19, #0xfc8]
 462e740: f947ea69     	ldr	x9, [x19, #0xfd0]
 462e744: d37be92a     	lsl	x10, x9, #5
 462e748: b40001ca     	cbz	x10, 0x462e780 <_ChromeMain+0x46294e4>
 462e74c: 9345fd4b     	asr	x11, x10, #5
 462e750: b94043ea     	ldr	w10, [sp, #0x40]
 462e754: aa0803e1     	mov	x1, x8
 462e758: d341fd6c     	lsr	x12, x11, #1
 462e75c: 8b0c142d     	add	x13, x1, x12, lsl #5
 462e760: b84205ae     	ldr	w14, [x13], #0x20
 462e764: aa6b07ef     	mvn	x15, x11, lsr #1
 462e768: 8b0f016b     	add	x11, x11, x15
 462e76c: 6b0a01df     	cmp	w14, w10
 462e770: 9a8cb16b     	csel	x11, x11, x12, lt
 462e774: 9a81b1a1     	csel	x1, x13, x1, lt
 462e778: b5ffff0b     	cbnz	x11, 0x462e758 <_ChromeMain+0x46294bc>
 462e77c: 14000002     	b	0x462e784 <_ChromeMain+0x46294e8>
 462e780: aa0803e1     	mov	x1, x8
 462e784: 8b091508     	add	x8, x8, x9, lsl #5
 462e788: aa0103e2     	mov	x2, x1
 462e78c: eb08003f     	cmp	x1, x8
 462e790: 540000e0     	b.eq	0x462e7ac <_ChromeMain+0x4629510>
 462e794: b94043e8     	ldr	w8, [sp, #0x40]
 462e798: b9400029     	ldr	w9, [x1]
 462e79c: 6b09011f     	cmp	w8, w9
 462e7a0: 52800408     	mov	w8, #0x20               ; =32
 462e7a4: 9a88b3e8     	csel	x8, xzr, x8, lt
 462e7a8: 8b080022     	add	x2, x1, x8
 462e7ac: 913f2260     	add	x0, x19, #0xfc8
 462e7b0: 94014e29     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 462e7b4: f9485668     	ldr	x8, [x19, #0x10a8]
 462e7b8: f9485a6a     	ldr	x10, [x19, #0x10b0]
 462e7bc: d37ced4b     	lsl	x11, x10, #4
 462e7c0: aa0803e9     	mov	x9, x8
 462e7c4: b40001ab     	cbz	x11, 0x462e7f8 <_ChromeMain+0x462955c>
 462e7c8: 9344fd6d     	asr	x13, x11, #4
 462e7cc: b94043ec     	ldr	w12, [sp, #0x40]
 462e7d0: aa0803e9     	mov	x9, x8
 462e7d4: d341fdae     	lsr	x14, x13, #1
 462e7d8: 8b0e112f     	add	x15, x9, x14, lsl #4
 462e7dc: b84105f0     	ldr	w16, [x15], #0x10
 462e7e0: aa6d07f1     	mvn	x17, x13, lsr #1
 462e7e4: 8b1101ad     	add	x13, x13, x17
 462e7e8: 6b0c021f     	cmp	w16, w12
 462e7ec: 9a8eb1ad     	csel	x13, x13, x14, lt
 462e7f0: 9a89b1e9     	csel	x9, x15, x9, lt
 462e7f4: b5ffff0d     	cbnz	x13, 0x462e7d4 <_ChromeMain+0x4629538>
 462e7f8: 8b0a110c     	add	x12, x8, x10, lsl #4
 462e7fc: aa0903ee     	mov	x14, x9
 462e800: eb0c013f     	cmp	x9, x12
 462e804: 540000c0     	b.eq	0x462e81c <_ChromeMain+0x4629580>
 462e808: b94043ec     	ldr	w12, [sp, #0x40]
 462e80c: b940012d     	ldr	w13, [x9]
 462e810: 6b0d019f     	cmp	w12, w13
 462e814: 9100412c     	add	x12, x9, #0x10
 462e818: 9a8cb12e     	csel	x14, x9, x12, lt
 462e81c: eb0e013f     	cmp	x9, x14
 462e820: 540003c8     	b.hi	0x462e898 <_ChromeMain+0x46295fc>
 462e824: 54000760     	b.eq	0x462e910 <_ChromeMain+0x4629674>
 462e828: cb0801cc     	sub	x12, x14, x8
 462e82c: eb0b019f     	cmp	x12, x11
 462e830: 540002a0     	b.eq	0x462e884 <_ChromeMain+0x46295e8>
 462e834: cb0803ec     	neg	x12, x8
 462e838: 8b0e010d     	add	x13, x8, x14
 462e83c: 8b09010a     	add	x10, x8, x9
 462e840: 8b0b012b     	add	x11, x9, x11
 462e844: cb0e016b     	sub	x11, x11, x14
 462e848: cb090169     	sub	x9, x11, x9
 462e84c: 8b0c01ab     	add	x11, x13, x12
 462e850: 8b0c014e     	add	x14, x10, x12
 462e854: b940016f     	ldr	w15, [x11]
 462e858: b90001cf     	str	w15, [x14]
 462e85c: f940056b     	ldr	x11, [x11, #0x8]
 462e860: f90005cb     	str	x11, [x14, #0x8]
 462e864: 910041ad     	add	x13, x13, #0x10
 462e868: 9100414a     	add	x10, x10, #0x10
 462e86c: d1004129     	sub	x9, x9, #0x10
 462e870: eb09019f     	cmp	x12, x9
 462e874: 54fffec1     	b.ne	0x462e84c <_ChromeMain+0x46295b0>
 462e878: cb080149     	sub	x9, x10, x8
 462e87c: f9485668     	ldr	x8, [x19, #0x10a8]
 462e880: f9485a6a     	ldr	x10, [x19, #0x10b0]
 462e884: 8b0a110a     	add	x10, x8, x10, lsl #4
 462e888: eb09015f     	cmp	x10, x9
 462e88c: 540003c0     	b.eq	0x462e904 <_ChromeMain+0x4629668>
 462e890: f100414a     	subs	x10, x10, #0x10
 462e894: 54ffffa1     	b.ne	0x462e888 <_ChromeMain+0x46295ec>
 462e898: d4200020     	brk	#0x1
 462e89c: 9342fd6c     	asr	x12, x11, #2
 462e8a0: b94043eb     	ldr	w11, [sp, #0x40]
 462e8a4: aa0903e1     	mov	x1, x9
 462e8a8: d341fd8d     	lsr	x13, x12, #1
 462e8ac: 8b0d082e     	add	x14, x1, x13, lsl #2
 462e8b0: b84045cf     	ldr	w15, [x14], #0x4
 462e8b4: aa6c07f0     	mvn	x16, x12, lsr #1
 462e8b8: 8b10018c     	add	x12, x12, x16
 462e8bc: 6b0b01ff     	cmp	w15, w11
 462e8c0: 9a8db18c     	csel	x12, x12, x13, lt
 462e8c4: 9a81b1c1     	csel	x1, x14, x1, lt
 462e8c8: b5ffff0c     	cbnz	x12, 0x462e8a8 <_ChromeMain+0x462960c>
 462e8cc: 14000017     	b	0x462e928 <_ChromeMain+0x462968c>
 462e8d0: 9345fd4b     	asr	x11, x10, #5
 462e8d4: b94043ea     	ldr	w10, [sp, #0x40]
 462e8d8: aa0803e1     	mov	x1, x8
 462e8dc: d341fd6c     	lsr	x12, x11, #1
 462e8e0: 8b0c142d     	add	x13, x1, x12, lsl #5
 462e8e4: b84205ae     	ldr	w14, [x13], #0x20
 462e8e8: aa6b07ef     	mvn	x15, x11, lsr #1
 462e8ec: 8b0f016b     	add	x11, x11, x15
 462e8f0: 6b0a01df     	cmp	w14, w10
 462e8f4: 9a8cb16b     	csel	x11, x11, x12, lt
 462e8f8: 9a81b1a1     	csel	x1, x13, x1, lt
 462e8fc: b5ffff0b     	cbnz	x11, 0x462e8dc <_ChromeMain+0x4629640>
 462e900: 1400001b     	b	0x462e96c <_ChromeMain+0x46296d0>
 462e904: cb080128     	sub	x8, x9, x8
 462e908: 9344fd08     	asr	x8, x8, #4
 462e90c: f9085a68     	str	x8, [x19, #0x10b0]
 462e910: 52821208     	mov	w8, #0x1090             ; =4240
 462e914: f9484a69     	ldr	x9, [x19, #0x1090]
 462e918: f9484e6a     	ldr	x10, [x19, #0x1098]
 462e91c: d37ef54b     	lsl	x11, x10, #2
 462e920: b5fffbeb     	cbnz	x11, 0x462e89c <_ChromeMain+0x4629600>
 462e924: aa0903e1     	mov	x1, x9
 462e928: 8b0a0929     	add	x9, x9, x10, lsl #2
 462e92c: aa0103e2     	mov	x2, x1
 462e930: eb09003f     	cmp	x1, x9
 462e934: 540000e0     	b.eq	0x462e950 <_ChromeMain+0x46296b4>
 462e938: b94043e9     	ldr	w9, [sp, #0x40]
 462e93c: b940002a     	ldr	w10, [x1]
 462e940: 6b0a013f     	cmp	w9, w10
 462e944: 52800089     	mov	w9, #0x4                ; =4
 462e948: 9a89b3e9     	csel	x9, xzr, x9, lt
 462e94c: 8b090022     	add	x2, x1, x9
 462e950: 8b080260     	add	x0, x19, x8
 462e954: 9419abf7     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 462e958: f9480268     	ldr	x8, [x19, #0x1000]
 462e95c: f9480669     	ldr	x9, [x19, #0x1008]
 462e960: d37be92a     	lsl	x10, x9, #5
 462e964: b5fffb6a     	cbnz	x10, 0x462e8d0 <_ChromeMain+0x4629634>
 462e968: aa0803e1     	mov	x1, x8
 462e96c: 8b091508     	add	x8, x8, x9, lsl #5
 462e970: aa0103e2     	mov	x2, x1
 462e974: eb08003f     	cmp	x1, x8
 462e978: 540000e0     	b.eq	0x462e994 <_ChromeMain+0x46296f8>
 462e97c: b94043e8     	ldr	w8, [sp, #0x40]
 462e980: b9400029     	ldr	w9, [x1]
 462e984: 6b09011f     	cmp	w8, w9
 462e988: 52800408     	mov	w8, #0x20               ; =32
 462e98c: 9a88b3e8     	csel	x8, xzr, x8, lt
 462e990: 8b080022     	add	x2, x1, x8
 462e994: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 462e998: 94014daf     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 462e99c: f9423660     	ldr	x0, [x19, #0x468]
 462e9a0: aa1503e1     	mov	x1, x21
 462e9a4: 52800022     	mov	w2, #0x1                ; =1
 462e9a8: 94dc8d82     	bl	0x7d51fb0 <_ChromeMain+0x7d4cd14>
 462e9ac: 17ffff23     	b	0x462e638 <_ChromeMain+0x462939c>
 462e9b0: f9423676     	ldr	x22, [x19, #0x468]
 462e9b4: f0052c08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 462e9b8: f9468d08     	ldr	x8, [x8, #0xd18]
 462e9bc: d63f0100     	blr	x8
 462e9c0: aa0003e3     	mov	x3, x0
 462e9c4: aa1603e0     	mov	x0, x22
 462e9c8: aa1503e1     	mov	x1, x21
 462e9cc: 528000c2     	mov	w2, #0x6                ; =6
 462e9d0: 94dc8446     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 462e9d4: 17ffff1b     	b	0x462e640 <_ChromeMain+0x46293a4>
