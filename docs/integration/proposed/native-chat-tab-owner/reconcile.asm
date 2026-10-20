
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463e680: d10183ff     	sub	sp, sp, #0x60
 463e684: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463e688: a90357f6     	stp	x22, x21, [sp, #0x30]
 463e68c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 463e690: a9057bfd     	stp	x29, x30, [sp, #0x50]
 463e694: 910143fd     	add	x29, sp, #0x50
 463e698: b4000b21     	cbz	x1, 0x463e7fc <_ChromeMain+0x4639560>
 463e69c: aa0103f5     	mov	x21, x1
 463e6a0: aa0003f3     	mov	x19, x0
 463e6a4: b9401036     	ldr	w22, [x1, #0x10]
 463e6a8: f9402034     	ldr	x20, [x1, #0x40]
 463e6ac: 94003c1b     	bl	0x464d718 <_ChromeMain+0x464847c>
 463e6b0: 350025a0     	cbnz	w0, 0x463eb64 <_ChromeMain+0x46398c8>
 463e6b4: 6f00e400     	movi.2d	v0, #0000000000000000
 463e6b8: ad0003e0     	stp	q0, q0, [sp]
 463e6bc: 910003e8     	mov	x8, sp
 463e6c0: aa1303e0     	mov	x0, x19
 463e6c4: aa1403e1     	mov	x1, x20
 463e6c8: 97ffe616     	bl	0x4637f20 <_ChromeMain+0x4632c84>
 463e6cc: 394063ea     	ldrb	w10, [sp, #0x18]
 463e6d0: f9480261     	ldr	x1, [x19, #0x1000]
 463e6d4: f9480669     	ldr	x9, [x19, #0x1008]
 463e6d8: d37be928     	lsl	x8, x9, #5
 463e6dc: 37000baa     	tbnz	w10, #0x0, 0x463e850 <_ChromeMain+0x46395b4>
 463e6e0: aa0103ea     	mov	x10, x1
 463e6e4: b4000188     	cbz	x8, 0x463e714 <_ChromeMain+0x4639478>
 463e6e8: 9345fd0b     	asr	x11, x8, #5
 463e6ec: aa0103ea     	mov	x10, x1
 463e6f0: d341fd6c     	lsr	x12, x11, #1
 463e6f4: 8b0c154d     	add	x13, x10, x12, lsl #5
 463e6f8: b84205ae     	ldr	w14, [x13], #0x20
 463e6fc: aa6b07ef     	mvn	x15, x11, lsr #1
 463e700: 8b0f016b     	add	x11, x11, x15
 463e704: 6b1601df     	cmp	w14, w22
 463e708: 9a8cb16b     	csel	x11, x11, x12, lt
 463e70c: 9a8ab1aa     	csel	x10, x13, x10, lt
 463e710: b5ffff0b     	cbnz	x11, 0x463e6f0 <_ChromeMain+0x4639454>
 463e714: 8b091422     	add	x2, x1, x9, lsl #5
 463e718: eb02015f     	cmp	x10, x2
 463e71c: 54000320     	b.eq	0x463e780 <_ChromeMain+0x46394e4>
 463e720: b9400149     	ldr	w9, [x10]
 463e724: 6b0902df     	cmp	w22, w9
 463e728: 540002cb     	b.lt	0x463e780 <_ChromeMain+0x46394e4>
 463e72c: f947e669     	ldr	x9, [x19, #0xfc8]
 463e730: f947ea6a     	ldr	x10, [x19, #0xfd0]
 463e734: d37be94b     	lsl	x11, x10, #5
 463e738: b400072b     	cbz	x11, 0x463e81c <_ChromeMain+0x4639580>
 463e73c: 9345fd6c     	asr	x12, x11, #5
 463e740: aa0903eb     	mov	x11, x9
 463e744: d341fd8d     	lsr	x13, x12, #1
 463e748: 8b0d156e     	add	x14, x11, x13, lsl #5
 463e74c: b84205cf     	ldr	w15, [x14], #0x20
 463e750: aa6c07f0     	mvn	x16, x12, lsr #1
 463e754: 8b10018c     	add	x12, x12, x16
 463e758: 6b1601ff     	cmp	w15, w22
 463e75c: 9a8db18c     	csel	x12, x12, x13, lt
 463e760: 9a8bb1cb     	csel	x11, x14, x11, lt
 463e764: b5ffff0c     	cbnz	x12, 0x463e744 <_ChromeMain+0x46394a8>
 463e768: 8b0a1529     	add	x9, x9, x10, lsl #5
 463e76c: eb09017f     	cmp	x11, x9
 463e770: 54000080     	b.eq	0x463e780 <_ChromeMain+0x46394e4>
 463e774: b9400169     	ldr	w9, [x11]
 463e778: 6b0902df     	cmp	w22, w9
 463e77c: 5400040a     	b.ge	0x463e7fc <_ChromeMain+0x4639560>
 463e780: b4000e14     	cbz	x20, 0x463e940 <_ChromeMain+0x46396a4>
 463e784: f947e669     	ldr	x9, [x19, #0xfc8]
 463e788: f947ea6a     	ldr	x10, [x19, #0xfd0]
 463e78c: d37be94b     	lsl	x11, x10, #5
 463e790: b400042b     	cbz	x11, 0x463e814 <_ChromeMain+0x4639578>
 463e794: 9345fd6c     	asr	x12, x11, #5
 463e798: aa0903eb     	mov	x11, x9
 463e79c: d341fd8d     	lsr	x13, x12, #1
 463e7a0: 8b0d156e     	add	x14, x11, x13, lsl #5
 463e7a4: b84205cf     	ldr	w15, [x14], #0x20
 463e7a8: aa6c07f0     	mvn	x16, x12, lsr #1
 463e7ac: 8b10018c     	add	x12, x12, x16
 463e7b0: 6b1601ff     	cmp	w15, w22
 463e7b4: 9a8db18c     	csel	x12, x12, x13, lt
 463e7b8: 9a8bb1cb     	csel	x11, x14, x11, lt
 463e7bc: b5ffff0c     	cbnz	x12, 0x463e79c <_ChromeMain+0x4639500>
 463e7c0: 8b0a1529     	add	x9, x9, x10, lsl #5
 463e7c4: eb09017f     	cmp	x11, x9
 463e7c8: 54000bc0     	b.eq	0x463e940 <_ChromeMain+0x46396a4>
 463e7cc: b9400169     	ldr	w9, [x11]
 463e7d0: 6b0902df     	cmp	w22, w9
 463e7d4: 54000b6b     	b.lt	0x463e940 <_ChromeMain+0x46396a4>
 463e7d8: b982b689     	ldrsw	x9, [x20, #0x2b4]
 463e7dc: 3100053f     	cmn	w9, #0x1
 463e7e0: 54002ec0     	b.eq	0x463edb8 <_ChromeMain+0x4639b1c>
 463e7e4: f941428a     	ldr	x10, [x20, #0x280]
 463e7e8: eb09015f     	cmp	x10, x9
 463e7ec: 54001789     	b.ls	0x463eadc <_ChromeMain+0x4639840>
 463e7f0: f9413e8a     	ldr	x10, [x20, #0x278]
 463e7f4: f8697949     	ldr	x9, [x10, x9, lsl #3]
 463e7f8: b5000a49     	cbnz	x9, 0x463e940 <_ChromeMain+0x46396a4>
 463e7fc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463e800: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463e804: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463e808: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463e80c: 910183ff     	add	sp, sp, #0x60
 463e810: d65f03c0     	ret
 463e814: aa0903eb     	mov	x11, x9
 463e818: 17ffffea     	b	0x463e7c0 <_ChromeMain+0x4639524>
 463e81c: aa0903eb     	mov	x11, x9
 463e820: 17ffffd2     	b	0x463e768 <_ChromeMain+0x46394cc>
 463e824: 52800028     	mov	w8, #0x1                ; =1
 463e828: 3607fea8     	tbz	w8, #0x0, 0x463e7fc <_ChromeMain+0x4639560>
 463e82c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463e830: 36fffe68     	tbz	w8, #0x1f, 0x463e7fc <_ChromeMain+0x4639560>
 463e834: f94003e0     	ldr	x0, [sp]
 463e838: f9400be8     	ldr	x8, [sp, #0x10]
 463e83c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463e840: 96e7299e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463e844: 17ffffee     	b	0x463e7fc <_ChromeMain+0x4639560>
 463e848: aa0103e8     	mov	x8, x1
 463e84c: 1400000d     	b	0x463e880 <_ChromeMain+0x46395e4>
 463e850: b4ffffc8     	cbz	x8, 0x463e848 <_ChromeMain+0x46395ac>
 463e854: 9345fd0a     	asr	x10, x8, #5
 463e858: aa0103e8     	mov	x8, x1
 463e85c: d341fd4b     	lsr	x11, x10, #1
 463e860: 8b0b150c     	add	x12, x8, x11, lsl #5
 463e864: b842058d     	ldr	w13, [x12], #0x20
 463e868: aa6a07ee     	mvn	x14, x10, lsr #1
 463e86c: 8b0e014a     	add	x10, x10, x14
 463e870: 6b1601bf     	cmp	w13, w22
 463e874: 9a8bb14a     	csel	x10, x10, x11, lt
 463e878: 9a88b188     	csel	x8, x12, x8, lt
 463e87c: b5ffff0a     	cbnz	x10, 0x463e85c <_ChromeMain+0x46395c0>
 463e880: 8b091422     	add	x2, x1, x9, lsl #5
 463e884: eb02011f     	cmp	x8, x2
 463e888: 540000c0     	b.eq	0x463e8a0 <_ChromeMain+0x4639604>
 463e88c: b9400109     	ldr	w9, [x8]
 463e890: 6b0902df     	cmp	w22, w9
 463e894: 52800409     	mov	w9, #0x20               ; =32
 463e898: 9a89b3e9     	csel	x9, xzr, x9, lt
 463e89c: 8b090102     	add	x2, x8, x9
 463e8a0: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 463e8a4: aa0803e1     	mov	x1, x8
 463e8a8: 94010deb     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463e8ac: f948d668     	ldr	x8, [x19, #0x11a8]
 463e8b0: 52801709     	mov	w9, #0xb8               ; =184
 463e8b4: 9b097d17     	mul	x23, x8, x9
 463e8b8: b4fffb77     	cbz	x23, 0x463e824 <_ChromeMain+0x4639588>
 463e8bc: f948d278     	ldr	x24, [x19, #0x11a0]
 463e8c0: 39405fe8     	ldrb	w8, [sp, #0x17]
 463e8c4: 13001d09     	sxtb	w9, w8
 463e8c8: 7100013f     	cmp	w9, #0x0
 463e8cc: a94027ea     	ldp	x10, x9, [sp]
 463e8d0: 9a884134     	csel	x20, x9, x8, mi
 463e8d4: 910003e8     	mov	x8, sp
 463e8d8: 9a884156     	csel	x22, x10, x8, mi
 463e8dc: 14000004     	b	0x463e8ec <_ChromeMain+0x4639650>
 463e8e0: 9102e318     	add	x24, x24, #0xb8
 463e8e4: f102e2f7     	subs	x23, x23, #0xb8
 463e8e8: 54fff9e0     	b.eq	0x463e824 <_ChromeMain+0x4639588>
 463e8ec: 39405f09     	ldrb	w9, [x24, #0x17]
 463e8f0: 13001d28     	sxtb	w8, w9
 463e8f4: f940070a     	ldr	x10, [x24, #0x8]
 463e8f8: 7100011f     	cmp	w8, #0x0
 463e8fc: 9a894149     	csel	x9, x10, x9, mi
 463e900: eb14013f     	cmp	x9, x20
 463e904: 54fffee1     	b.ne	0x463e8e0 <_ChromeMain+0x4639644>
 463e908: f9400309     	ldr	x9, [x24]
 463e90c: 7100011f     	cmp	w8, #0x0
 463e910: 9a984120     	csel	x0, x9, x24, mi
 463e914: aa1603e1     	mov	x1, x22
 463e918: aa1403e2     	mov	x2, x20
 463e91c: 94e72bd1     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463e920: 35fffe00     	cbnz	w0, 0x463e8e0 <_ChromeMain+0x4639644>
 463e924: 910003e2     	mov	x2, sp
 463e928: aa1303e0     	mov	x0, x19
 463e92c: aa1503e1     	mov	x1, x21
 463e930: 94003ee2     	bl	0x464e4b8 <_ChromeMain+0x464921c>
 463e934: 394063e8     	ldrb	w8, [sp, #0x18]
 463e938: 3607f628     	tbz	w8, #0x0, 0x463e7fc <_ChromeMain+0x4639560>
 463e93c: 17ffffbc     	b	0x463e82c <_ChromeMain+0x4639590>
 463e940: b4000168     	cbz	x8, 0x463e96c <_ChromeMain+0x46396d0>
 463e944: 9345fd08     	asr	x8, x8, #5
 463e948: d341fd09     	lsr	x9, x8, #1
 463e94c: 8b09142a     	add	x10, x1, x9, lsl #5
 463e950: b842054b     	ldr	w11, [x10], #0x20
 463e954: aa6807ec     	mvn	x12, x8, lsr #1
 463e958: 8b0c0108     	add	x8, x8, x12
 463e95c: 6b16017f     	cmp	w11, w22
 463e960: 9a89b108     	csel	x8, x8, x9, lt
 463e964: 9a81b141     	csel	x1, x10, x1, lt
 463e968: b5ffff08     	cbnz	x8, 0x463e948 <_ChromeMain+0x46396ac>
 463e96c: eb02003f     	cmp	x1, x2
 463e970: 540000c0     	b.eq	0x463e988 <_ChromeMain+0x46396ec>
 463e974: b9400028     	ldr	w8, [x1]
 463e978: 6b0802df     	cmp	w22, w8
 463e97c: 52800408     	mov	w8, #0x20               ; =32
 463e980: 9a88b3e8     	csel	x8, xzr, x8, lt
 463e984: 8b080022     	add	x2, x1, x8
 463e988: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 463e98c: 94010db2     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463e990: f947e668     	ldr	x8, [x19, #0xfc8]
 463e994: f947ea69     	ldr	x9, [x19, #0xfd0]
 463e998: d37be92a     	lsl	x10, x9, #5
 463e99c: b40001aa     	cbz	x10, 0x463e9d0 <_ChromeMain+0x4639734>
 463e9a0: 9345fd4a     	asr	x10, x10, #5
 463e9a4: aa0803e1     	mov	x1, x8
 463e9a8: d341fd4b     	lsr	x11, x10, #1
 463e9ac: 8b0b142c     	add	x12, x1, x11, lsl #5
 463e9b0: b842058d     	ldr	w13, [x12], #0x20
 463e9b4: aa6a07ee     	mvn	x14, x10, lsr #1
 463e9b8: 8b0e014a     	add	x10, x10, x14
 463e9bc: 6b1601bf     	cmp	w13, w22
 463e9c0: 9a8bb14a     	csel	x10, x10, x11, lt
 463e9c4: 9a81b181     	csel	x1, x12, x1, lt
 463e9c8: b5ffff0a     	cbnz	x10, 0x463e9a8 <_ChromeMain+0x463970c>
 463e9cc: 14000002     	b	0x463e9d4 <_ChromeMain+0x4639738>
 463e9d0: aa0803e1     	mov	x1, x8
 463e9d4: 8b091508     	add	x8, x8, x9, lsl #5
 463e9d8: aa0103e2     	mov	x2, x1
 463e9dc: eb08003f     	cmp	x1, x8
 463e9e0: 540000c0     	b.eq	0x463e9f8 <_ChromeMain+0x463975c>
 463e9e4: b9400028     	ldr	w8, [x1]
 463e9e8: 6b0802df     	cmp	w22, w8
 463e9ec: 52800408     	mov	w8, #0x20               ; =32
 463e9f0: 9a88b3e8     	csel	x8, xzr, x8, lt
 463e9f4: 8b080022     	add	x2, x1, x8
 463e9f8: 913f2260     	add	x0, x19, #0xfc8
 463e9fc: 94010d96     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463ea00: f9485668     	ldr	x8, [x19, #0x10a8]
 463ea04: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463ea08: d37ced4b     	lsl	x11, x10, #4
 463ea0c: aa0803e9     	mov	x9, x8
 463ea10: b400018b     	cbz	x11, 0x463ea40 <_ChromeMain+0x46397a4>
 463ea14: 9344fd6c     	asr	x12, x11, #4
 463ea18: aa0803e9     	mov	x9, x8
 463ea1c: d341fd8d     	lsr	x13, x12, #1
 463ea20: 8b0d112e     	add	x14, x9, x13, lsl #4
 463ea24: b84105cf     	ldr	w15, [x14], #0x10
 463ea28: aa6c07f0     	mvn	x16, x12, lsr #1
 463ea2c: 8b10018c     	add	x12, x12, x16
 463ea30: 6b1601ff     	cmp	w15, w22
 463ea34: 9a8db18c     	csel	x12, x12, x13, lt
 463ea38: 9a89b1c9     	csel	x9, x14, x9, lt
 463ea3c: b5ffff0c     	cbnz	x12, 0x463ea1c <_ChromeMain+0x4639780>
 463ea40: 8b0a110c     	add	x12, x8, x10, lsl #4
 463ea44: aa0903ee     	mov	x14, x9
 463ea48: eb0c013f     	cmp	x9, x12
 463ea4c: 540000a0     	b.eq	0x463ea60 <_ChromeMain+0x46397c4>
 463ea50: b940012c     	ldr	w12, [x9]
 463ea54: 6b0c02df     	cmp	w22, w12
 463ea58: 9100412c     	add	x12, x9, #0x10
 463ea5c: 9a8cb12e     	csel	x14, x9, x12, lt
 463ea60: eb0e013f     	cmp	x9, x14
 463ea64: 540003c8     	b.hi	0x463eadc <_ChromeMain+0x4639840>
 463ea68: 54000420     	b.eq	0x463eaec <_ChromeMain+0x4639850>
 463ea6c: cb0801cc     	sub	x12, x14, x8
 463ea70: eb0b019f     	cmp	x12, x11
 463ea74: 540002a0     	b.eq	0x463eac8 <_ChromeMain+0x463982c>
 463ea78: cb0803ec     	neg	x12, x8
 463ea7c: 8b0e010d     	add	x13, x8, x14
 463ea80: 8b09010a     	add	x10, x8, x9
 463ea84: 8b0b012b     	add	x11, x9, x11
 463ea88: cb0e016b     	sub	x11, x11, x14
 463ea8c: cb090169     	sub	x9, x11, x9
 463ea90: 8b0c01ab     	add	x11, x13, x12
 463ea94: 8b0c014e     	add	x14, x10, x12
 463ea98: b940016f     	ldr	w15, [x11]
 463ea9c: b90001cf     	str	w15, [x14]
 463eaa0: f940056b     	ldr	x11, [x11, #0x8]
 463eaa4: f90005cb     	str	x11, [x14, #0x8]
 463eaa8: 910041ad     	add	x13, x13, #0x10
 463eaac: 9100414a     	add	x10, x10, #0x10
 463eab0: d1004129     	sub	x9, x9, #0x10
 463eab4: eb09019f     	cmp	x12, x9
 463eab8: 54fffec1     	b.ne	0x463ea90 <_ChromeMain+0x46397f4>
 463eabc: cb080149     	sub	x9, x10, x8
 463eac0: f9485668     	ldr	x8, [x19, #0x10a8]
 463eac4: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463eac8: 8b0a110a     	add	x10, x8, x10, lsl #4
 463eacc: eb09015f     	cmp	x10, x9
 463ead0: 54000080     	b.eq	0x463eae0 <_ChromeMain+0x4639844>
 463ead4: f100414a     	subs	x10, x10, #0x10
 463ead8: 54ffffa1     	b.ne	0x463eacc <_ChromeMain+0x4639830>
 463eadc: d4200020     	brk	#0x1
 463eae0: cb080128     	sub	x8, x9, x8
 463eae4: 9344fd08     	asr	x8, x8, #4
 463eae8: f9085a68     	str	x8, [x19, #0x10b0]
 463eaec: 52821208     	mov	w8, #0x1090             ; =4240
 463eaf0: f9484a69     	ldr	x9, [x19, #0x1090]
 463eaf4: f9484e6a     	ldr	x10, [x19, #0x1098]
 463eaf8: d37ef54b     	lsl	x11, x10, #2
 463eafc: b40001ab     	cbz	x11, 0x463eb30 <_ChromeMain+0x4639894>
 463eb00: 9342fd6b     	asr	x11, x11, #2
 463eb04: aa0903e1     	mov	x1, x9
 463eb08: d341fd6c     	lsr	x12, x11, #1
 463eb0c: 8b0c082d     	add	x13, x1, x12, lsl #2
 463eb10: b84045ae     	ldr	w14, [x13], #0x4
 463eb14: aa6b07ef     	mvn	x15, x11, lsr #1
 463eb18: 8b0f016b     	add	x11, x11, x15
 463eb1c: 6b1601df     	cmp	w14, w22
 463eb20: 9a8cb16b     	csel	x11, x11, x12, lt
 463eb24: 9a81b1a1     	csel	x1, x13, x1, lt
 463eb28: b5ffff0b     	cbnz	x11, 0x463eb08 <_ChromeMain+0x463986c>
 463eb2c: 14000002     	b	0x463eb34 <_ChromeMain+0x4639898>
 463eb30: aa0903e1     	mov	x1, x9
 463eb34: 8b0a0929     	add	x9, x9, x10, lsl #2
 463eb38: aa0103e2     	mov	x2, x1
 463eb3c: eb09003f     	cmp	x1, x9
 463eb40: 540000c0     	b.eq	0x463eb58 <_ChromeMain+0x46398bc>
 463eb44: b9400029     	ldr	w9, [x1]
 463eb48: 6b0902df     	cmp	w22, w9
 463eb4c: 52800089     	mov	w9, #0x4                ; =4
 463eb50: 9a89b3e9     	csel	x9, xzr, x9, lt
 463eb54: 8b090022     	add	x2, x1, x9
 463eb58: 8b080260     	add	x0, x19, x8
 463eb5c: 94196b75     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 463eb60: 17ffff27     	b	0x463e7fc <_ChromeMain+0x4639560>
 463eb64: f9480268     	ldr	x8, [x19, #0x1000]
 463eb68: f9480669     	ldr	x9, [x19, #0x1008]
 463eb6c: d37be92a     	lsl	x10, x9, #5
 463eb70: b40001aa     	cbz	x10, 0x463eba4 <_ChromeMain+0x4639908>
 463eb74: 9345fd4a     	asr	x10, x10, #5
 463eb78: aa0803e1     	mov	x1, x8
 463eb7c: d341fd4b     	lsr	x11, x10, #1
 463eb80: 8b0b142c     	add	x12, x1, x11, lsl #5
 463eb84: b842058d     	ldr	w13, [x12], #0x20
 463eb88: aa6a07ee     	mvn	x14, x10, lsr #1
 463eb8c: 8b0e014a     	add	x10, x10, x14
 463eb90: 6b1601bf     	cmp	w13, w22
 463eb94: 9a8bb14a     	csel	x10, x10, x11, lt
 463eb98: 9a81b181     	csel	x1, x12, x1, lt
 463eb9c: b5ffff0a     	cbnz	x10, 0x463eb7c <_ChromeMain+0x46398e0>
 463eba0: 14000002     	b	0x463eba8 <_ChromeMain+0x463990c>
 463eba4: aa0803e1     	mov	x1, x8
 463eba8: 8b091508     	add	x8, x8, x9, lsl #5
 463ebac: aa0103e2     	mov	x2, x1
 463ebb0: eb08003f     	cmp	x1, x8
 463ebb4: 540000c0     	b.eq	0x463ebcc <_ChromeMain+0x4639930>
 463ebb8: b9400028     	ldr	w8, [x1]
 463ebbc: 6b0802df     	cmp	w22, w8
 463ebc0: 52800408     	mov	w8, #0x20               ; =32
 463ebc4: 9a88b3e8     	csel	x8, xzr, x8, lt
 463ebc8: 8b080022     	add	x2, x1, x8
 463ebcc: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 463ebd0: 94010d21     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463ebd4: f947e668     	ldr	x8, [x19, #0xfc8]
 463ebd8: f947ea69     	ldr	x9, [x19, #0xfd0]
 463ebdc: d37be92a     	lsl	x10, x9, #5
 463ebe0: b40001aa     	cbz	x10, 0x463ec14 <_ChromeMain+0x4639978>
 463ebe4: 9345fd4a     	asr	x10, x10, #5
 463ebe8: aa0803e1     	mov	x1, x8
 463ebec: d341fd4b     	lsr	x11, x10, #1
 463ebf0: 8b0b142c     	add	x12, x1, x11, lsl #5
 463ebf4: b842058d     	ldr	w13, [x12], #0x20
 463ebf8: aa6a07ee     	mvn	x14, x10, lsr #1
 463ebfc: 8b0e014a     	add	x10, x10, x14
 463ec00: 6b1601bf     	cmp	w13, w22
 463ec04: 9a8bb14a     	csel	x10, x10, x11, lt
 463ec08: 9a81b181     	csel	x1, x12, x1, lt
 463ec0c: b5ffff0a     	cbnz	x10, 0x463ebec <_ChromeMain+0x4639950>
 463ec10: 14000002     	b	0x463ec18 <_ChromeMain+0x463997c>
 463ec14: aa0803e1     	mov	x1, x8
 463ec18: 8b091508     	add	x8, x8, x9, lsl #5
 463ec1c: aa0103e2     	mov	x2, x1
 463ec20: eb08003f     	cmp	x1, x8
 463ec24: 540000c0     	b.eq	0x463ec3c <_ChromeMain+0x46399a0>
 463ec28: b9400028     	ldr	w8, [x1]
 463ec2c: 6b0802df     	cmp	w22, w8
 463ec30: 52800408     	mov	w8, #0x20               ; =32
 463ec34: 9a88b3e8     	csel	x8, xzr, x8, lt
 463ec38: 8b080022     	add	x2, x1, x8
 463ec3c: 913f2260     	add	x0, x19, #0xfc8
 463ec40: 94010d05     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 463ec44: f9485668     	ldr	x8, [x19, #0x10a8]
 463ec48: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463ec4c: d37ced4b     	lsl	x11, x10, #4
 463ec50: aa0803e9     	mov	x9, x8
 463ec54: b400018b     	cbz	x11, 0x463ec84 <_ChromeMain+0x46399e8>
 463ec58: 9344fd6c     	asr	x12, x11, #4
 463ec5c: aa0803e9     	mov	x9, x8
 463ec60: d341fd8d     	lsr	x13, x12, #1
 463ec64: 8b0d112e     	add	x14, x9, x13, lsl #4
 463ec68: b84105cf     	ldr	w15, [x14], #0x10
 463ec6c: aa6c07f0     	mvn	x16, x12, lsr #1
 463ec70: 8b10018c     	add	x12, x12, x16
 463ec74: 6b1601ff     	cmp	w15, w22
 463ec78: 9a8db18c     	csel	x12, x12, x13, lt
 463ec7c: 9a89b1c9     	csel	x9, x14, x9, lt
 463ec80: b5ffff0c     	cbnz	x12, 0x463ec60 <_ChromeMain+0x46399c4>
 463ec84: 8b0a110c     	add	x12, x8, x10, lsl #4
 463ec88: aa0903ee     	mov	x14, x9
 463ec8c: eb0c013f     	cmp	x9, x12
 463ec90: 540000a0     	b.eq	0x463eca4 <_ChromeMain+0x4639a08>
 463ec94: b940012c     	ldr	w12, [x9]
 463ec98: 6b0c02df     	cmp	w22, w12
 463ec9c: 9100412c     	add	x12, x9, #0x10
 463eca0: 9a8cb12e     	csel	x14, x9, x12, lt
 463eca4: eb0e013f     	cmp	x9, x14
 463eca8: 54fff1a8     	b.hi	0x463eadc <_ChromeMain+0x4639840>
 463ecac: 54000420     	b.eq	0x463ed30 <_ChromeMain+0x4639a94>
 463ecb0: cb0801cc     	sub	x12, x14, x8
 463ecb4: eb0b019f     	cmp	x12, x11
 463ecb8: 540002a0     	b.eq	0x463ed0c <_ChromeMain+0x4639a70>
 463ecbc: cb0803ec     	neg	x12, x8
 463ecc0: 8b0e010d     	add	x13, x8, x14
 463ecc4: 8b09010a     	add	x10, x8, x9
 463ecc8: 8b0b012b     	add	x11, x9, x11
 463eccc: cb0e016b     	sub	x11, x11, x14
 463ecd0: cb090169     	sub	x9, x11, x9
 463ecd4: 8b0c01ab     	add	x11, x13, x12
 463ecd8: 8b0c014e     	add	x14, x10, x12
 463ecdc: b940016f     	ldr	w15, [x11]
 463ece0: b90001cf     	str	w15, [x14]
 463ece4: f940056b     	ldr	x11, [x11, #0x8]
 463ece8: f90005cb     	str	x11, [x14, #0x8]
 463ecec: 910041ad     	add	x13, x13, #0x10
 463ecf0: 9100414a     	add	x10, x10, #0x10
 463ecf4: d1004129     	sub	x9, x9, #0x10
 463ecf8: eb09019f     	cmp	x12, x9
 463ecfc: 54fffec1     	b.ne	0x463ecd4 <_ChromeMain+0x4639a38>
 463ed00: cb080149     	sub	x9, x10, x8
 463ed04: f9485668     	ldr	x8, [x19, #0x10a8]
 463ed08: f9485a6a     	ldr	x10, [x19, #0x10b0]
 463ed0c: 8b0a110a     	add	x10, x8, x10, lsl #4
 463ed10: eb09015f     	cmp	x10, x9
 463ed14: 54000080     	b.eq	0x463ed24 <_ChromeMain+0x4639a88>
 463ed18: f100414a     	subs	x10, x10, #0x10
 463ed1c: 54ffffa1     	b.ne	0x463ed10 <_ChromeMain+0x4639a74>
 463ed20: 17ffff6f     	b	0x463eadc <_ChromeMain+0x4639840>
 463ed24: cb080128     	sub	x8, x9, x8
 463ed28: 9344fd08     	asr	x8, x8, #4
 463ed2c: f9085a68     	str	x8, [x19, #0x10b0]
 463ed30: 52821208     	mov	w8, #0x1090             ; =4240
 463ed34: f9484a69     	ldr	x9, [x19, #0x1090]
 463ed38: f9484e6a     	ldr	x10, [x19, #0x1098]
 463ed3c: d37ef54b     	lsl	x11, x10, #2
 463ed40: b40001ab     	cbz	x11, 0x463ed74 <_ChromeMain+0x4639ad8>
 463ed44: 9342fd6b     	asr	x11, x11, #2
 463ed48: aa0903e1     	mov	x1, x9
 463ed4c: d341fd6c     	lsr	x12, x11, #1
 463ed50: 8b0c082d     	add	x13, x1, x12, lsl #2
 463ed54: b84045ae     	ldr	w14, [x13], #0x4
 463ed58: aa6b07ef     	mvn	x15, x11, lsr #1
 463ed5c: 8b0f016b     	add	x11, x11, x15
 463ed60: 6b1601df     	cmp	w14, w22
 463ed64: 9a8cb16b     	csel	x11, x11, x12, lt
 463ed68: 9a81b1a1     	csel	x1, x13, x1, lt
 463ed6c: b5ffff0b     	cbnz	x11, 0x463ed4c <_ChromeMain+0x4639ab0>
 463ed70: 14000002     	b	0x463ed78 <_ChromeMain+0x4639adc>
 463ed74: aa0903e1     	mov	x1, x9
 463ed78: 8b0a0929     	add	x9, x9, x10, lsl #2
 463ed7c: aa0103e2     	mov	x2, x1
 463ed80: eb09003f     	cmp	x1, x9
 463ed84: 540000c0     	b.eq	0x463ed9c <_ChromeMain+0x4639b00>
 463ed88: b9400029     	ldr	w9, [x1]
 463ed8c: 6b0902df     	cmp	w22, w9
 463ed90: 52800089     	mov	w9, #0x4                ; =4
 463ed94: 9a89b3e9     	csel	x9, xzr, x9, lt
 463ed98: 8b090022     	add	x2, x1, x9
 463ed9c: 8b080260     	add	x0, x19, x8
 463eda0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463eda4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463eda8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463edac: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463edb0: 910183ff     	add	sp, sp, #0x60
 463edb4: 14196adf     	b	0x4c99930 <_ChromeMain+0x4c94694>
 463edb8: d4200000     	brk	#0
 463edbc: d4400000     	hlt	#0
 463edc0: d4200020     	brk	#0x1
 463edc4: d10143ff     	sub	sp, sp, #0x50
 463edc8: a90257f6     	stp	x22, x21, [sp, #0x20]
 463edcc: a9034ff4     	stp	x20, x19, [sp, #0x30]
