
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464e4b8: d10243ff     	sub	sp, sp, #0x90
 464e4bc: a9036ffc     	stp	x28, x27, [sp, #0x30]
 464e4c0: a90467fa     	stp	x26, x25, [sp, #0x40]
 464e4c4: a9055ff8     	stp	x24, x23, [sp, #0x50]
 464e4c8: a90657f6     	stp	x22, x21, [sp, #0x60]
 464e4cc: a9074ff4     	stp	x20, x19, [sp, #0x70]
 464e4d0: a9087bfd     	stp	x29, x30, [sp, #0x80]
 464e4d4: 910203fd     	add	x29, sp, #0x80
 464e4d8: aa0203f4     	mov	x20, x2
 464e4dc: aa0103f5     	mov	x21, x1
 464e4e0: aa0003f3     	mov	x19, x0
 464e4e4: b940103a     	ldr	w26, [x1, #0x10]
 464e4e8: b9002ffa     	str	w26, [sp, #0x2c]
 464e4ec: f947e408     	ldr	x8, [x0, #0xfc8]
 464e4f0: f947e809     	ldr	x9, [x0, #0xfd0]
 464e4f4: d37be92a     	lsl	x10, x9, #5
 464e4f8: b40009aa     	cbz	x10, 0x464e62c <_ChromeMain+0x4649390>
 464e4fc: 9345fd4a     	asr	x10, x10, #5
 464e500: aa0803f8     	mov	x24, x8
 464e504: d341fd4b     	lsr	x11, x10, #1
 464e508: 8b0b170c     	add	x12, x24, x11, lsl #5
 464e50c: b842058d     	ldr	w13, [x12], #0x20
 464e510: aa6a07ee     	mvn	x14, x10, lsr #1
 464e514: 8b0e014a     	add	x10, x10, x14
 464e518: 6b1a01bf     	cmp	w13, w26
 464e51c: 9a8bb14a     	csel	x10, x10, x11, lt
 464e520: 9a98b198     	csel	x24, x12, x24, lt
 464e524: b5ffff0a     	cbnz	x10, 0x464e504 <_ChromeMain+0x4649268>
 464e528: 8b091508     	add	x8, x8, x9, lsl #5
 464e52c: eb08031f     	cmp	x24, x8
 464e530: 54000080     	b.eq	0x464e540 <_ChromeMain+0x46492a4>
 464e534: b9400309     	ldr	w9, [x24]
 464e538: 6b09035f     	cmp	w26, w9
 464e53c: 5400004a     	b.ge	0x464e544 <_ChromeMain+0x46492a8>
 464e540: aa0803f8     	mov	x24, x8
 464e544: f9480268     	ldr	x8, [x19, #0x1000]
 464e548: f9480669     	ldr	x9, [x19, #0x1008]
 464e54c: d37be92a     	lsl	x10, x9, #5
 464e550: b40006aa     	cbz	x10, 0x464e624 <_ChromeMain+0x4649388>
 464e554: 9345fd4a     	asr	x10, x10, #5
 464e558: aa0803e1     	mov	x1, x8
 464e55c: d341fd4b     	lsr	x11, x10, #1
 464e560: 8b0b142c     	add	x12, x1, x11, lsl #5
 464e564: b842058d     	ldr	w13, [x12], #0x20
 464e568: aa6a07ee     	mvn	x14, x10, lsr #1
 464e56c: 8b0e014a     	add	x10, x10, x14
 464e570: 6b1a01bf     	cmp	w13, w26
 464e574: 9a8bb14a     	csel	x10, x10, x11, lt
 464e578: 9a81b181     	csel	x1, x12, x1, lt
 464e57c: b5ffff0a     	cbnz	x10, 0x464e55c <_ChromeMain+0x46492c0>
 464e580: 8b091508     	add	x8, x8, x9, lsl #5
 464e584: aa0103e2     	mov	x2, x1
 464e588: eb08003f     	cmp	x1, x8
 464e58c: 540000c0     	b.eq	0x464e5a4 <_ChromeMain+0x4649308>
 464e590: b9400028     	ldr	w8, [x1]
 464e594: 6b08035f     	cmp	w26, w8
 464e598: 52800408     	mov	w8, #0x20               ; =32
 464e59c: 9a88b3e8     	csel	x8, xzr, x8, lt
 464e5a0: 8b080022     	add	x2, x1, x8
 464e5a4: f94022a8     	ldr	x8, [x21, #0x40]
 464e5a8: f9000fe8     	str	x8, [sp, #0x18]
 464e5ac: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 464e5b0: 9400cea9     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 464e5b4: f947e676     	ldr	x22, [x19, #0xfc8]
 464e5b8: f947ea7c     	ldr	x28, [x19, #0xfd0]
 464e5bc: 8b1c16d7     	add	x23, x22, x28, lsl #5
 464e5c0: eb17031f     	cmp	x24, x23
 464e5c4: 540003c0     	b.eq	0x464e63c <_ChromeMain+0x46493a0>
 464e5c8: 39407f09     	ldrb	w9, [x24, #0x1f]
 464e5cc: 13001d28     	sxtb	w8, w9
 464e5d0: f9400b0a     	ldr	x10, [x24, #0x10]
 464e5d4: 7100011f     	cmp	w8, #0x0
 464e5d8: 9a894142     	csel	x2, x10, x9, mi
 464e5dc: 39405e8a     	ldrb	w10, [x20, #0x17]
 464e5e0: 13001d49     	sxtb	w9, w10
 464e5e4: f940068b     	ldr	x11, [x20, #0x8]
 464e5e8: 7100013f     	cmp	w9, #0x0
 464e5ec: 9a8a416a     	csel	x10, x11, x10, mi
 464e5f0: eb0a005f     	cmp	x2, x10
 464e5f4: 54000241     	b.ne	0x464e63c <_ChromeMain+0x46493a0>
 464e5f8: f8408f0a     	ldr	x10, [x24, #0x8]!
 464e5fc: 7100011f     	cmp	w8, #0x0
 464e600: 9a984140     	csel	x0, x10, x24, mi
 464e604: f9400288     	ldr	x8, [x20]
 464e608: 7100013f     	cmp	w9, #0x0
 464e60c: aa1403f8     	mov	x24, x20
 464e610: 9a944101     	csel	x1, x8, x20, mi
 464e614: 94e6ec93     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464e618: 7100001f     	cmp	w0, #0x0
 464e61c: 1a9f17e2     	cset	w2, eq
 464e620: 14000009     	b	0x464e644 <_ChromeMain+0x46493a8>
 464e624: aa0803e1     	mov	x1, x8
 464e628: 17ffffd6     	b	0x464e580 <_ChromeMain+0x46492e4>
 464e62c: aa0803f8     	mov	x24, x8
 464e630: 17ffffbe     	b	0x464e528 <_ChromeMain+0x464928c>
 464e634: aa0903eb     	mov	x11, x9
 464e638: 14000019     	b	0x464e69c <_ChromeMain+0x4649400>
 464e63c: aa1403f8     	mov	x24, x20
 464e640: 52800002     	mov	w2, #0x0                ; =0
 464e644: 394186a8     	ldrb	w8, [x21, #0x61]
 464e648: 37000368     	tbnz	w8, #0x0, 0x464e6b4 <_ChromeMain+0x4649418>
 464e64c: 3941e2a8     	ldrb	w8, [x21, #0x78]
 464e650: 37000328     	tbnz	w8, #0x0, 0x464e6b4 <_ChromeMain+0x4649418>
 464e654: 39624268     	ldrb	w8, [x19, #0x890]
 464e658: 340002e8     	cbz	w8, 0x464e6b4 <_ChromeMain+0x4649418>
 464e65c: b94012a8     	ldr	w8, [x21, #0x10]
 464e660: f9486e69     	ldr	x9, [x19, #0x10d8]
 464e664: f948726a     	ldr	x10, [x19, #0x10e0]
 464e668: d37ef54b     	lsl	x11, x10, #2
 464e66c: b4fffe4b     	cbz	x11, 0x464e634 <_ChromeMain+0x4649398>
 464e670: 9342fd6c     	asr	x12, x11, #2
 464e674: aa0903eb     	mov	x11, x9
 464e678: d341fd8d     	lsr	x13, x12, #1
 464e67c: 8b0d096e     	add	x14, x11, x13, lsl #2
 464e680: b84045cf     	ldr	w15, [x14], #0x4
 464e684: aa6c07f0     	mvn	x16, x12, lsr #1
 464e688: 8b10018c     	add	x12, x12, x16
 464e68c: 6b0801ff     	cmp	w15, w8
 464e690: 9a8db18c     	csel	x12, x12, x13, lt
 464e694: 9a8bb1cb     	csel	x11, x14, x11, lt
 464e698: b5ffff0c     	cbnz	x12, 0x464e678 <_ChromeMain+0x46493dc>
 464e69c: 8b0a0929     	add	x9, x9, x10, lsl #2
 464e6a0: eb09017f     	cmp	x11, x9
 464e6a4: 54000c20     	b.eq	0x464e828 <_ChromeMain+0x464958c>
 464e6a8: b9400169     	ldr	w9, [x11]
 464e6ac: 6b09011f     	cmp	w8, w9
 464e6b0: 54000bcb     	b.lt	0x464e828 <_ChromeMain+0x464958c>
 464e6b4: d37beb88     	lsl	x8, x28, #5
 464e6b8: b4000168     	cbz	x8, 0x464e6e4 <_ChromeMain+0x4649448>
 464e6bc: 9345fd08     	asr	x8, x8, #5
 464e6c0: d341fd09     	lsr	x9, x8, #1
 464e6c4: 8b0916ca     	add	x10, x22, x9, lsl #5
 464e6c8: b842054b     	ldr	w11, [x10], #0x20
 464e6cc: aa6807ec     	mvn	x12, x8, lsr #1
 464e6d0: 8b0c0108     	add	x8, x8, x12
 464e6d4: 6b1a017f     	cmp	w11, w26
 464e6d8: 9a89b108     	csel	x8, x8, x9, lt
 464e6dc: 9a96b156     	csel	x22, x10, x22, lt
 464e6e0: b5ffff08     	cbnz	x8, 0x464e6c0 <_ChromeMain+0x4649424>
 464e6e4: eb1702df     	cmp	x22, x23
 464e6e8: 540000c0     	b.eq	0x464e700 <_ChromeMain+0x4649464>
 464e6ec: b94002c8     	ldr	w8, [x22]
 464e6f0: 6b08035f     	cmp	w26, w8
 464e6f4: 52800408     	mov	w8, #0x20               ; =32
 464e6f8: 9a88b3e8     	csel	x8, xzr, x8, lt
 464e6fc: 8b0802d7     	add	x23, x22, x8
 464e700: 913f2260     	add	x0, x19, #0xfc8
 464e704: aa1603e1     	mov	x1, x22
 464e708: aa1703e2     	mov	x2, x23
 464e70c: 9400ce52     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 464e710: f9485668     	ldr	x8, [x19, #0x10a8]
 464e714: f9485a6a     	ldr	x10, [x19, #0x10b0]
 464e718: d37ced4b     	lsl	x11, x10, #4
 464e71c: aa0803e9     	mov	x9, x8
 464e720: b400018b     	cbz	x11, 0x464e750 <_ChromeMain+0x46494b4>
 464e724: 9344fd6c     	asr	x12, x11, #4
 464e728: aa0803e9     	mov	x9, x8
 464e72c: d341fd8d     	lsr	x13, x12, #1
 464e730: 8b0d112e     	add	x14, x9, x13, lsl #4
 464e734: b84105cf     	ldr	w15, [x14], #0x10
 464e738: aa6c07f0     	mvn	x16, x12, lsr #1
 464e73c: 8b10018c     	add	x12, x12, x16
 464e740: 6b1a01ff     	cmp	w15, w26
 464e744: 9a8db18c     	csel	x12, x12, x13, lt
 464e748: 9a89b1c9     	csel	x9, x14, x9, lt
 464e74c: b5ffff0c     	cbnz	x12, 0x464e72c <_ChromeMain+0x4649490>
 464e750: 8b0a110c     	add	x12, x8, x10, lsl #4
 464e754: eb0c013f     	cmp	x9, x12
 464e758: 540004a0     	b.eq	0x464e7ec <_ChromeMain+0x4649550>
 464e75c: b940012c     	ldr	w12, [x9]
 464e760: 6b0c035f     	cmp	w26, w12
 464e764: 9100412c     	add	x12, x9, #0x10
 464e768: 9a8cb12e     	csel	x14, x9, x12, lt
 464e76c: eb0e013f     	cmp	x9, x14
 464e770: 540003c8     	b.hi	0x464e7e8 <_ChromeMain+0x464954c>
 464e774: 54000460     	b.eq	0x464e800 <_ChromeMain+0x4649564>
 464e778: cb0801cc     	sub	x12, x14, x8
 464e77c: eb0b019f     	cmp	x12, x11
 464e780: 540002a0     	b.eq	0x464e7d4 <_ChromeMain+0x4649538>
 464e784: cb0803ec     	neg	x12, x8
 464e788: 8b0e010d     	add	x13, x8, x14
 464e78c: 8b09010a     	add	x10, x8, x9
 464e790: 8b0b012b     	add	x11, x9, x11
 464e794: cb0e016b     	sub	x11, x11, x14
 464e798: cb090169     	sub	x9, x11, x9
 464e79c: 8b0c01ab     	add	x11, x13, x12
 464e7a0: 8b0c014e     	add	x14, x10, x12
 464e7a4: b940016f     	ldr	w15, [x11]
 464e7a8: b90001cf     	str	w15, [x14]
 464e7ac: f940056b     	ldr	x11, [x11, #0x8]
 464e7b0: f90005cb     	str	x11, [x14, #0x8]
 464e7b4: 910041ad     	add	x13, x13, #0x10
 464e7b8: 9100414a     	add	x10, x10, #0x10
 464e7bc: d1004129     	sub	x9, x9, #0x10
 464e7c0: eb09019f     	cmp	x12, x9
 464e7c4: 54fffec1     	b.ne	0x464e79c <_ChromeMain+0x4649500>
 464e7c8: cb080149     	sub	x9, x10, x8
 464e7cc: f9485668     	ldr	x8, [x19, #0x10a8]
 464e7d0: f9485a6a     	ldr	x10, [x19, #0x10b0]
 464e7d4: 8b0a110a     	add	x10, x8, x10, lsl #4
 464e7d8: eb09015f     	cmp	x10, x9
 464e7dc: 540000c0     	b.eq	0x464e7f4 <_ChromeMain+0x4649558>
 464e7e0: f100414a     	subs	x10, x10, #0x10
 464e7e4: 54ffffa1     	b.ne	0x464e7d8 <_ChromeMain+0x464953c>
 464e7e8: d4200020     	brk	#0x1
 464e7ec: aa0903ee     	mov	x14, x9
 464e7f0: 17ffffdf     	b	0x464e76c <_ChromeMain+0x46494d0>
 464e7f4: cb080128     	sub	x8, x9, x8
 464e7f8: 9344fd08     	asr	x8, x8, #4
 464e7fc: f9085a68     	str	x8, [x19, #0x10b0]
 464e800: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 464e804: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 464e808: a94657f6     	ldp	x22, x21, [sp, #0x60]
 464e80c: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 464e810: a94467fa     	ldp	x26, x25, [sp, #0x40]
 464e814: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 464e818: 910243ff     	add	sp, sp, #0x90
 464e81c: d65f03c0     	ret
 464e820: aa0903eb     	mov	x11, x9
 464e824: 14000010     	b	0x464e864 <_ChromeMain+0x46495c8>
 464e828: f9484a69     	ldr	x9, [x19, #0x1090]
 464e82c: f9484e6a     	ldr	x10, [x19, #0x1098]
 464e830: d37ef54b     	lsl	x11, x10, #2
 464e834: b4ffff6b     	cbz	x11, 0x464e820 <_ChromeMain+0x4649584>
 464e838: 9342fd6c     	asr	x12, x11, #2
 464e83c: aa0903eb     	mov	x11, x9
 464e840: d341fd8d     	lsr	x13, x12, #1
 464e844: 8b0d096e     	add	x14, x11, x13, lsl #2
 464e848: b84045cf     	ldr	w15, [x14], #0x4
 464e84c: aa6c07f0     	mvn	x16, x12, lsr #1
 464e850: 8b10018c     	add	x12, x12, x16
 464e854: 6b0801ff     	cmp	w15, w8
 464e858: 9a8db18c     	csel	x12, x12, x13, lt
 464e85c: 9a8bb1cb     	csel	x11, x14, x11, lt
 464e860: b5ffff0c     	cbnz	x12, 0x464e840 <_ChromeMain+0x46495a4>
 464e864: 8b0a0929     	add	x9, x9, x10, lsl #2
 464e868: eb09017f     	cmp	x11, x9
 464e86c: 54000080     	b.eq	0x464e87c <_ChromeMain+0x46495e0>
 464e870: b9400169     	ldr	w9, [x11]
 464e874: 6b09011f     	cmp	w8, w9
 464e878: 54fff1ea     	b.ge	0x464e6b4 <_ChromeMain+0x4649418>
 464e87c: f948d668     	ldr	x8, [x19, #0x11a8]
 464e880: 52801709     	mov	w9, #0xb8               ; =184
 464e884: 9b097d1b     	mul	x27, x8, x9
 464e888: b4fff17b     	cbz	x27, 0x464e6b4 <_ChromeMain+0x4649418>
 464e88c: f948d274     	ldr	x20, [x19, #0x11a0]
 464e890: aa1803eb     	mov	x11, x24
 464e894: 39405f08     	ldrb	w8, [x24, #0x17]
 464e898: 13001d09     	sxtb	w9, w8
 464e89c: 7100013f     	cmp	w9, #0x0
 464e8a0: a940270a     	ldp	x10, x9, [x24]
 464e8a4: 9a884138     	csel	x24, x9, x8, mi
 464e8a8: 9a8b4148     	csel	x8, x10, x11, mi
 464e8ac: a900a3eb     	stp	x11, x8, [sp, #0x8]
 464e8b0: 14000004     	b	0x464e8c0 <_ChromeMain+0x4649624>
 464e8b4: 9102e294     	add	x20, x20, #0xb8
 464e8b8: f102e37b     	subs	x27, x27, #0xb8
 464e8bc: 54ffefc0     	b.eq	0x464e6b4 <_ChromeMain+0x4649418>
 464e8c0: 39405e89     	ldrb	w9, [x20, #0x17]
 464e8c4: 13001d28     	sxtb	w8, w9
 464e8c8: f940068a     	ldr	x10, [x20, #0x8]
 464e8cc: 7100011f     	cmp	w8, #0x0
 464e8d0: 9a894149     	csel	x9, x10, x9, mi
 464e8d4: eb18013f     	cmp	x9, x24
 464e8d8: 54fffee1     	b.ne	0x464e8b4 <_ChromeMain+0x4649618>
 464e8dc: f9400289     	ldr	x9, [x20]
 464e8e0: 7100011f     	cmp	w8, #0x0
 464e8e4: 9a944120     	csel	x0, x9, x20, mi
 464e8e8: f9400be1     	ldr	x1, [sp, #0x10]
 464e8ec: aa0203f9     	mov	x25, x2
 464e8f0: aa1803e2     	mov	x2, x24
 464e8f4: 94e6ebdb     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464e8f8: aa1903e2     	mov	x2, x25
 464e8fc: 35fffdc0     	cbnz	w0, 0x464e8b4 <_ChromeMain+0x4649618>
 464e900: 91400676     	add	x22, x19, #0x1, lsl #12 ; =0x1000
 464e904: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 464e908: 34000908     	cbz	w8, 0x464ea28 <_ChromeMain+0x464978c>
 464e90c: b9502a68     	ldr	w8, [x19, #0x1028]
 464e910: 6b1a011f     	cmp	w8, w26
 464e914: 540008a1     	b.ne	0x464ea28 <_ChromeMain+0x464978c>
 464e918: 1400003d     	b	0x464ea0c <_ChromeMain+0x4649770>
 464e91c: aa0803ea     	mov	x10, x8
 464e920: 14000010     	b	0x464e960 <_ChromeMain+0x46496c4>
 464e924: f9485668     	ldr	x8, [x19, #0x10a8]
 464e928: f9485a69     	ldr	x9, [x19, #0x10b0]
 464e92c: d37ced2a     	lsl	x10, x9, #4
 464e930: b4ffff6a     	cbz	x10, 0x464e91c <_ChromeMain+0x4649680>
 464e934: 9344fd4b     	asr	x11, x10, #4
 464e938: aa0803ea     	mov	x10, x8
 464e93c: d341fd6c     	lsr	x12, x11, #1
 464e940: 8b0c114d     	add	x13, x10, x12, lsl #4
 464e944: b84105ae     	ldr	w14, [x13], #0x10
 464e948: aa6b07ef     	mvn	x15, x11, lsr #1
 464e94c: 8b0f016b     	add	x11, x11, x15
 464e950: 6b1a01df     	cmp	w14, w26
 464e954: 9a8cb16b     	csel	x11, x11, x12, lt
 464e958: 9a8ab1aa     	csel	x10, x13, x10, lt
 464e95c: b5ffff0b     	cbnz	x11, 0x464e93c <_ChromeMain+0x46496a0>
 464e960: 8b091108     	add	x8, x8, x9, lsl #4
 464e964: eb08015f     	cmp	x10, x8
 464e968: 54000080     	b.eq	0x464e978 <_ChromeMain+0x46496dc>
 464e96c: b9400148     	ldr	w8, [x10]
 464e970: 6b08035f     	cmp	w26, w8
 464e974: 54fff46a     	b.ge	0x464e800 <_ChromeMain+0x4649564>
 464e978: f0052b08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 464e97c: f9468d08     	ldr	x8, [x8, #0xd18]
 464e980: d63f0100     	blr	x8
 464e984: f90013e0     	str	x0, [sp, #0x20]
 464e988: f9485668     	ldr	x8, [x19, #0x10a8]
 464e98c: f9485a69     	ldr	x9, [x19, #0x10b0]
 464e990: d37ced2a     	lsl	x10, x9, #4
 464e994: b400030a     	cbz	x10, 0x464e9f4 <_ChromeMain+0x4649758>
 464e998: 9344fd4a     	asr	x10, x10, #4
 464e99c: aa0803e1     	mov	x1, x8
 464e9a0: d341fd4b     	lsr	x11, x10, #1
 464e9a4: 8b0b102c     	add	x12, x1, x11, lsl #4
 464e9a8: b841058d     	ldr	w13, [x12], #0x10
 464e9ac: aa6a07ee     	mvn	x14, x10, lsr #1
 464e9b0: 8b0e014a     	add	x10, x10, x14
 464e9b4: 6b1a01bf     	cmp	w13, w26
 464e9b8: 9a8bb14a     	csel	x10, x10, x11, lt
 464e9bc: 9a81b181     	csel	x1, x12, x1, lt
 464e9c0: b5ffff0a     	cbnz	x10, 0x464e9a0 <_ChromeMain+0x4649704>
 464e9c4: 8b091108     	add	x8, x8, x9, lsl #4
 464e9c8: eb08003f     	cmp	x1, x8
 464e9cc: 54000080     	b.eq	0x464e9dc <_ChromeMain+0x4649740>
 464e9d0: b9400028     	ldr	w8, [x1]
 464e9d4: 6b08035f     	cmp	w26, w8
 464e9d8: 5400012a     	b.ge	0x464e9fc <_ChromeMain+0x4649760>
 464e9dc: 52821508     	mov	w8, #0x10a8             ; =4264
 464e9e0: 8b080260     	add	x0, x19, x8
 464e9e4: 9100b3e2     	add	x2, sp, #0x2c
 464e9e8: 910083e3     	add	x3, sp, #0x20
 464e9ec: 9400cec7     	bl	0x4682508 <_ChromeMain+0x467d26c>
 464e9f0: 17ffff84     	b	0x464e800 <_ChromeMain+0x4649564>
 464e9f4: aa0803e1     	mov	x1, x8
 464e9f8: 17fffff3     	b	0x464e9c4 <_ChromeMain+0x4649728>
 464e9fc: f9000420     	str	x0, [x1, #0x8]
 464ea00: 17ffff80     	b	0x464e800 <_ChromeMain+0x4649564>
 464ea04: aa0803e1     	mov	x1, x8
 464ea08: 14000036     	b	0x464eae0 <_ChromeMain+0x4649844>
 464ea0c: 52820608     	mov	w8, #0x1030             ; =4144
 464ea10: 8b080260     	add	x0, x19, x8
 464ea14: 97037f41     	bl	0x72e718 <_ChromeMain+0x72947c>
 464ea18: aa1903e2     	mov	x2, x25
 464ea1c: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 464ea20: 34000048     	cbz	w8, 0x464ea28 <_ChromeMain+0x464978c>
 464ea24: 3900b2df     	strb	wzr, [x22, #0x2c]
 464ea28: f947ce68     	ldr	x8, [x19, #0xf98]
 464ea2c: f947d269     	ldr	x9, [x19, #0xfa0]
 464ea30: 8b09092a     	add	x10, x9, x9, lsl #2
 464ea34: f94007f4     	ldr	x20, [sp, #0x8]
 464ea38: d37df14a     	lsl	x10, x10, #3
 464ea3c: 36000322     	tbz	w2, #0x0, 0x464eaa0 <_ChromeMain+0x4649804>
 464ea40: aa0803eb     	mov	x11, x8
 464ea44: b400020a     	cbz	x10, 0x464ea84 <_ChromeMain+0x46497e8>
 464ea48: 9343fd4b     	asr	x11, x10, #3
 464ea4c: b202e7ec     	mov	x12, #-0x3333333333333334 ; =-3689348814741910324
 464ea50: f29999ac     	movk	x12, #0xcccd
 464ea54: 9b0c7d6c     	mul	x12, x11, x12
 464ea58: 5280050d     	mov	w13, #0x28              ; =40
 464ea5c: aa0803eb     	mov	x11, x8
 464ea60: d341fd8e     	lsr	x14, x12, #1
 464ea64: 9b0d2dcf     	madd	x15, x14, x13, x11
 464ea68: b84285f0     	ldr	w16, [x15], #0x28
 464ea6c: aa6c07f1     	mvn	x17, x12, lsr #1
 464ea70: 8b11018c     	add	x12, x12, x17
 464ea74: 6b1a021f     	cmp	w16, w26
 464ea78: 9a8eb18c     	csel	x12, x12, x14, lt
 464ea7c: 9a8bb1eb     	csel	x11, x15, x11, lt
 464ea80: b5ffff0c     	cbnz	x12, 0x464ea60 <_ChromeMain+0x46497c4>
 464ea84: 5280050c     	mov	w12, #0x28              ; =40
 464ea88: 9b0c212c     	madd	x12, x9, x12, x8
 464ea8c: eb0c017f     	cmp	x11, x12
 464ea90: 54fff4a0     	b.eq	0x464e924 <_ChromeMain+0x4649688>
 464ea94: b940016b     	ldr	w11, [x11]
 464ea98: 6b0b035f     	cmp	w26, w11
 464ea9c: 54fff44b     	b.lt	0x464e924 <_ChromeMain+0x4649688>
 464eaa0: b4fffb2a     	cbz	x10, 0x464ea04 <_ChromeMain+0x4649768>
 464eaa4: 9343fd4a     	asr	x10, x10, #3
 464eaa8: b202e7eb     	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 464eaac: f29999ab     	movk	x11, #0xcccd
 464eab0: 9b0b7d4a     	mul	x10, x10, x11
 464eab4: 5280050b     	mov	w11, #0x28              ; =40
 464eab8: aa0803e1     	mov	x1, x8
 464eabc: d341fd4c     	lsr	x12, x10, #1
 464eac0: 9b0b058d     	madd	x13, x12, x11, x1
 464eac4: b84285ae     	ldr	w14, [x13], #0x28
 464eac8: aa6a07ef     	mvn	x15, x10, lsr #1
 464eacc: 8b0f014a     	add	x10, x10, x15
 464ead0: 6b1a01df     	cmp	w14, w26
 464ead4: 9a8cb14a     	csel	x10, x10, x12, lt
 464ead8: 9a81b1a1     	csel	x1, x13, x1, lt
 464eadc: b5ffff0a     	cbnz	x10, 0x464eabc <_ChromeMain+0x4649820>
 464eae0: 5280050a     	mov	w10, #0x28              ; =40
 464eae4: 9b0a2128     	madd	x8, x9, x10, x8
 464eae8: eb08003f     	cmp	x1, x8
 464eaec: 54000220     	b.eq	0x464eb30 <_ChromeMain+0x4649894>
 464eaf0: b9400028     	ldr	w8, [x1]
 464eaf4: 6b08035f     	cmp	w26, w8
 464eaf8: 540001cb     	b.lt	0x464eb30 <_ChromeMain+0x4649894>
 464eafc: 913e6260     	add	x0, x19, #0xf98
 464eb00: 9100a022     	add	x2, x1, #0x28
 464eb04: 9400cf16     	bl	0x468275c <_ChromeMain+0x467d4c0>
 464eb08: f9400fe8     	ldr	x8, [sp, #0x18]
 464eb0c: b40000a8     	cbz	x8, 0x464eb20 <_ChromeMain+0x4649884>
 464eb10: d0052421     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 464eb14: 9126a021     	add	x1, x1, #0x9a8
 464eb18: 91002100     	add	x0, x8, #0x8
 464eb1c: 97305060     	bl	0x1262c9c <_ChromeMain+0x125da00>
 464eb20: aa1303e0     	mov	x0, x19
 464eb24: aa1503e1     	mov	x1, x21
 464eb28: 94000117     	bl	0x464ef84 <_ChromeMain+0x4649ce8>
 464eb2c: aa1903e2     	mov	x2, x25
 464eb30: 3707e682     	tbnz	w2, #0x0, 0x464e800 <_ChromeMain+0x4649564>
 464eb34: b2600342     	orr	x2, x26, #0x100000000
 464eb38: aa1303e0     	mov	x0, x19
 464eb3c: aa1403e1     	mov	x1, x20
 464eb40: 52800003     	mov	w3, #0x0                ; =0
 464eb44: 97ffa6a2     	bl	0x46385cc <_ChromeMain+0x4633330>
 464eb48: f947e661     	ldr	x1, [x19, #0xfc8]
 464eb4c: f947ea68     	ldr	x8, [x19, #0xfd0]
 464eb50: d37be909     	lsl	x9, x8, #5
 464eb54: d360fc0a     	lsr	x10, x0, #32
 464eb58: 8b081428     	add	x8, x1, x8, lsl #5
 464eb5c: b5000a8a     	cbnz	x10, 0x464ecac <_ChromeMain+0x4649a10>
 464eb60: b4000169     	cbz	x9, 0x464eb8c <_ChromeMain+0x46498f0>
 464eb64: 9345fd29     	asr	x9, x9, #5
 464eb68: d341fd2a     	lsr	x10, x9, #1
 464eb6c: 8b0a142b     	add	x11, x1, x10, lsl #5
 464eb70: b842056c     	ldr	w12, [x11], #0x20
 464eb74: aa6907ed     	mvn	x13, x9, lsr #1
 464eb78: 8b0d0129     	add	x9, x9, x13
 464eb7c: 6b1a019f     	cmp	w12, w26
 464eb80: 9a8ab129     	csel	x9, x9, x10, lt
 464eb84: 9a81b161     	csel	x1, x11, x1, lt
 464eb88: b5ffff09     	cbnz	x9, 0x464eb68 <_ChromeMain+0x46498cc>
 464eb8c: eb08003f     	cmp	x1, x8
 464eb90: 54000260     	b.eq	0x464ebdc <_ChromeMain+0x4649940>
 464eb94: b9400028     	ldr	w8, [x1]
 464eb98: 6b08035f     	cmp	w26, w8
 464eb9c: 5400020b     	b.lt	0x464ebdc <_ChromeMain+0x4649940>
 464eba0: 91002020     	add	x0, x1, #0x8
 464eba4: eb14001f     	cmp	x0, x20
 464eba8: 54000220     	b.eq	0x464ebec <_ChromeMain+0x4649950>
 464ebac: 39c07c29     	ldrsb	w9, [x1, #0x1f]
 464ebb0: 39405e88     	ldrb	w8, [x20, #0x17]
 464ebb4: 37f81da9     	tbnz	w9, #0x1f, 0x464ef68 <_ChromeMain+0x4649ccc>
 464ebb8: 373800c8     	tbnz	w8, #0x7, 0x464ebd0 <_ChromeMain+0x4649934>
 464ebbc: 3dc00280     	ldr	q0, [x20]
 464ebc0: f9400a88     	ldr	x8, [x20, #0x10]
 464ebc4: f9000808     	str	x8, [x0, #0x10]
 464ebc8: 3d800000     	str	q0, [x0]
 464ebcc: 14000008     	b	0x464ebec <_ChromeMain+0x4649950>
 464ebd0: a9400a81     	ldp	x1, x2, [x20]
 464ebd4: 96f967b8     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 464ebd8: 14000005     	b	0x464ebec <_ChromeMain+0x4649950>
 464ebdc: 913f2260     	add	x0, x19, #0xfc8
 464ebe0: 9100b3e2     	add	x2, sp, #0x2c
 464ebe4: aa1403e3     	mov	x3, x20
 464ebe8: 9400cd64     	bl	0x4682178 <_ChromeMain+0x467cedc>
 464ebec: f0052b08     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 464ebf0: f9468d08     	ldr	x8, [x8, #0xd18]
 464ebf4: d63f0100     	blr	x8
 464ebf8: f90013e0     	str	x0, [sp, #0x20]
 464ebfc: f9485668     	ldr	x8, [x19, #0x10a8]
 464ec00: f9485a69     	ldr	x9, [x19, #0x10b0]
 464ec04: d37ced2a     	lsl	x10, x9, #4
 464ec08: b40004ea     	cbz	x10, 0x464eca4 <_ChromeMain+0x4649a08>
 464ec0c: 9344fd4a     	asr	x10, x10, #4
 464ec10: aa0803e1     	mov	x1, x8
 464ec14: d341fd4b     	lsr	x11, x10, #1
 464ec18: 8b0b102c     	add	x12, x1, x11, lsl #4
 464ec1c: b841058d     	ldr	w13, [x12], #0x10
 464ec20: aa6a07ee     	mvn	x14, x10, lsr #1
 464ec24: 8b0e014a     	add	x10, x10, x14
 464ec28: 6b1a01bf     	cmp	w13, w26
 464ec2c: 9a8bb14a     	csel	x10, x10, x11, lt
 464ec30: 9a81b181     	csel	x1, x12, x1, lt
 464ec34: b5ffff0a     	cbnz	x10, 0x464ec14 <_ChromeMain+0x4649978>
 464ec38: 8b091108     	add	x8, x8, x9, lsl #4
 464ec3c: eb08003f     	cmp	x1, x8
 464ec40: 540000c0     	b.eq	0x464ec58 <_ChromeMain+0x46499bc>
 464ec44: b9400028     	ldr	w8, [x1]
 464ec48: 6b08035f     	cmp	w26, w8
 464ec4c: 5400006b     	b.lt	0x464ec58 <_ChromeMain+0x46499bc>
 464ec50: f9000420     	str	x0, [x1, #0x8]
 464ec54: 14000006     	b	0x464ec6c <_ChromeMain+0x46499d0>
 464ec58: 52821508     	mov	w8, #0x10a8             ; =4264
 464ec5c: 8b080260     	add	x0, x19, x8
 464ec60: 9100b3e2     	add	x2, sp, #0x2c
 464ec64: 910083e3     	add	x3, sp, #0x20
 464ec68: 9400ce28     	bl	0x4682508 <_ChromeMain+0x467d26c>
 464ec6c: f942e673     	ldr	x19, [x19, #0x5c8]
 464ec70: b4ffdc93     	cbz	x19, 0x464e800 <_ChromeMain+0x4649564>
 464ec74: 3947a6c8     	ldrb	w8, [x22, #0x1e9]
 464ec78: 3707dc48     	tbnz	w8, #0x0, 0x464e800 <_ChromeMain+0x4649564>
 464ec7c: 3950e268     	ldrb	w8, [x19, #0x438]
 464ec80: 3707dc08     	tbnz	w8, #0x0, 0x464e800 <_ChromeMain+0x4649564>
 464ec84: 52800028     	mov	w8, #0x1                ; =1
 464ec88: 3910e268     	strb	w8, [x19, #0x438]
 464ec8c: f9418a68     	ldr	x8, [x19, #0x310]
 464ec90: f9427114     	ldr	x20, [x8, #0x4e0]
 464ec94: b4001374     	cbz	x20, 0x464ef00 <_ChromeMain+0x4649c64>
 464ec98: 39504288     	ldrb	w8, [x20, #0x410]
 464ec9c: 37001328     	tbnz	w8, #0x0, 0x464ef00 <_ChromeMain+0x4649c64>
 464eca0: 14000091     	b	0x464eee4 <_ChromeMain+0x4649c48>
 464eca4: aa0803e1     	mov	x1, x8
 464eca8: 17ffffe4     	b	0x464ec38 <_ChromeMain+0x464999c>
 464ecac: b4000169     	cbz	x9, 0x464ecd8 <_ChromeMain+0x4649a3c>
 464ecb0: 9345fd29     	asr	x9, x9, #5
 464ecb4: d341fd2a     	lsr	x10, x9, #1
 464ecb8: 8b0a142b     	add	x11, x1, x10, lsl #5
 464ecbc: b842056c     	ldr	w12, [x11], #0x20
 464ecc0: aa6907ed     	mvn	x13, x9, lsr #1
 464ecc4: 8b0d0129     	add	x9, x9, x13
 464ecc8: 6b1a019f     	cmp	w12, w26
 464eccc: 9a8ab129     	csel	x9, x9, x10, lt
 464ecd0: 9a81b161     	csel	x1, x11, x1, lt
 464ecd4: b5ffff09     	cbnz	x9, 0x464ecb4 <_ChromeMain+0x4649a18>
 464ecd8: aa0103e2     	mov	x2, x1
 464ecdc: eb08003f     	cmp	x1, x8
 464ece0: 540000c0     	b.eq	0x464ecf8 <_ChromeMain+0x4649a5c>
 464ece4: b9400028     	ldr	w8, [x1]
 464ece8: 6b08035f     	cmp	w26, w8
 464ecec: 52800408     	mov	w8, #0x20               ; =32
 464ecf0: 9a88b3e8     	csel	x8, xzr, x8, lt
 464ecf4: 8b080022     	add	x2, x1, x8
 464ecf8: 913f2260     	add	x0, x19, #0xfc8
 464ecfc: 9400ccd6     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 464ed00: f9485668     	ldr	x8, [x19, #0x10a8]
 464ed04: f9485a6a     	ldr	x10, [x19, #0x10b0]
 464ed08: d37ced4b     	lsl	x11, x10, #4
 464ed0c: aa0803e9     	mov	x9, x8
 464ed10: b400018b     	cbz	x11, 0x464ed40 <_ChromeMain+0x4649aa4>
 464ed14: 9344fd6c     	asr	x12, x11, #4
 464ed18: aa0803e9     	mov	x9, x8
 464ed1c: d341fd8d     	lsr	x13, x12, #1
 464ed20: 8b0d112e     	add	x14, x9, x13, lsl #4
 464ed24: b84105cf     	ldr	w15, [x14], #0x10
 464ed28: aa6c07f0     	mvn	x16, x12, lsr #1
 464ed2c: 8b10018c     	add	x12, x12, x16
 464ed30: 6b1a01ff     	cmp	w15, w26
 464ed34: 9a8db18c     	csel	x12, x12, x13, lt
 464ed38: 9a89b1c9     	csel	x9, x14, x9, lt
 464ed3c: b5ffff0c     	cbnz	x12, 0x464ed1c <_ChromeMain+0x4649a80>
 464ed40: 8b0a110c     	add	x12, x8, x10, lsl #4
 464ed44: eb0c013f     	cmp	x9, x12
 464ed48: 540004a0     	b.eq	0x464eddc <_ChromeMain+0x4649b40>
 464ed4c: b940012c     	ldr	w12, [x9]
 464ed50: 6b0c035f     	cmp	w26, w12
 464ed54: 9100412c     	add	x12, x9, #0x10
 464ed58: 9a8cb12e     	csel	x14, x9, x12, lt
 464ed5c: eb0e013f     	cmp	x9, x14
 464ed60: 54ffd448     	b.hi	0x464e7e8 <_ChromeMain+0x464954c>
 464ed64: 540004a0     	b.eq	0x464edf8 <_ChromeMain+0x4649b5c>
 464ed68: cb0801cc     	sub	x12, x14, x8
 464ed6c: eb0b019f     	cmp	x12, x11
 464ed70: 540002a0     	b.eq	0x464edc4 <_ChromeMain+0x4649b28>
 464ed74: cb0803ec     	neg	x12, x8
 464ed78: 8b0e010d     	add	x13, x8, x14
 464ed7c: 8b09010a     	add	x10, x8, x9
 464ed80: 8b0b012b     	add	x11, x9, x11
 464ed84: cb0e016b     	sub	x11, x11, x14
 464ed88: cb090169     	sub	x9, x11, x9
 464ed8c: 8b0c01ab     	add	x11, x13, x12
 464ed90: 8b0c014e     	add	x14, x10, x12
 464ed94: b940016f     	ldr	w15, [x11]
 464ed98: b90001cf     	str	w15, [x14]
 464ed9c: f940056b     	ldr	x11, [x11, #0x8]
 464eda0: f90005cb     	str	x11, [x14, #0x8]
 464eda4: 910041ad     	add	x13, x13, #0x10
 464eda8: 9100414a     	add	x10, x10, #0x10
 464edac: d1004129     	sub	x9, x9, #0x10
 464edb0: eb09019f     	cmp	x12, x9
 464edb4: 54fffec1     	b.ne	0x464ed8c <_ChromeMain+0x4649af0>
 464edb8: cb080149     	sub	x9, x10, x8
 464edbc: f9485668     	ldr	x8, [x19, #0x10a8]
 464edc0: f9485a6a     	ldr	x10, [x19, #0x10b0]
 464edc4: 8b0a110a     	add	x10, x8, x10, lsl #4
 464edc8: eb09015f     	cmp	x10, x9
 464edcc: 54000100     	b.eq	0x464edec <_ChromeMain+0x4649b50>
 464edd0: f100414a     	subs	x10, x10, #0x10
 464edd4: 54ffd0a0     	b.eq	0x464e7e8 <_ChromeMain+0x464954c>
 464edd8: 17fffffc     	b	0x464edc8 <_ChromeMain+0x4649b2c>
 464eddc: aa0903ee     	mov	x14, x9
 464ede0: 17ffffdf     	b	0x464ed5c <_ChromeMain+0x4649ac0>
 464ede4: aa0803e1     	mov	x1, x8
 464ede8: 14000013     	b	0x464ee34 <_ChromeMain+0x4649b98>
 464edec: cb080128     	sub	x8, x9, x8
 464edf0: 9344fd08     	asr	x8, x8, #4
 464edf4: f9085a68     	str	x8, [x19, #0x10b0]
 464edf8: f9480268     	ldr	x8, [x19, #0x1000]
 464edfc: f9480669     	ldr	x9, [x19, #0x1008]
 464ee00: d37be92a     	lsl	x10, x9, #5
 464ee04: b4ffff0a     	cbz	x10, 0x464ede4 <_ChromeMain+0x4649b48>
 464ee08: 9345fd4a     	asr	x10, x10, #5
 464ee0c: aa0803e1     	mov	x1, x8
 464ee10: d341fd4b     	lsr	x11, x10, #1
 464ee14: 8b0b142c     	add	x12, x1, x11, lsl #5
 464ee18: b842058d     	ldr	w13, [x12], #0x20
 464ee1c: aa6a07ee     	mvn	x14, x10, lsr #1
 464ee20: 8b0e014a     	add	x10, x10, x14
 464ee24: 6b1a01bf     	cmp	w13, w26
 464ee28: 9a8bb14a     	csel	x10, x10, x11, lt
 464ee2c: 9a81b181     	csel	x1, x12, x1, lt
 464ee30: b5ffff0a     	cbnz	x10, 0x464ee10 <_ChromeMain+0x4649b74>
 464ee34: 8b091508     	add	x8, x8, x9, lsl #5
 464ee38: aa0103e2     	mov	x2, x1
 464ee3c: eb08003f     	cmp	x1, x8
 464ee40: 540000c0     	b.eq	0x464ee58 <_ChromeMain+0x4649bbc>
 464ee44: b9400028     	ldr	w8, [x1]
 464ee48: 6b08035f     	cmp	w26, w8
 464ee4c: 52800408     	mov	w8, #0x20               ; =32
 464ee50: 9a88b3e8     	csel	x8, xzr, x8, lt
 464ee54: 8b080022     	add	x2, x1, x8
 464ee58: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 464ee5c: 9400cc7e     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 464ee60: f942e674     	ldr	x20, [x19, #0x5c8]
 464ee64: b40002f4     	cbz	x20, 0x464eec0 <_ChromeMain+0x4649c24>
 464ee68: 3947a6c8     	ldrb	w8, [x22, #0x1e9]
 464ee6c: 370002a8     	tbnz	w8, #0x0, 0x464eec0 <_ChromeMain+0x4649c24>
 464ee70: 3950e288     	ldrb	w8, [x20, #0x438]
 464ee74: 37000268     	tbnz	w8, #0x0, 0x464eec0 <_ChromeMain+0x4649c24>
 464ee78: 52800028     	mov	w8, #0x1                ; =1
 464ee7c: 3910e288     	strb	w8, [x20, #0x438]
 464ee80: f9418a88     	ldr	x8, [x20, #0x310]
 464ee84: f9427115     	ldr	x21, [x8, #0x4e0]
 464ee88: b4000075     	cbz	x21, 0x464ee94 <_ChromeMain+0x4649bf8>
 464ee8c: 395042a8     	ldrb	w8, [x21, #0x410]
 464ee90: 360005c8     	tbz	w8, #0x0, 0x464ef48 <_ChromeMain+0x4649cac>
 464ee94: f941be80     	ldr	x0, [x20, #0x378]
 464ee98: f9400008     	ldr	x8, [x0]
 464ee9c: f9405108     	ldr	x8, [x8, #0xa0]
 464eea0: 52800021     	mov	w1, #0x1                ; =1
 464eea4: d63f0100     	blr	x8
 464eea8: 3950e288     	ldrb	w8, [x20, #0x438]
 464eeac: 910ec280     	add	x0, x20, #0x3b0
 464eeb0: 52000101     	eor	w1, w8, #0x1
 464eeb4: 97753eac     	bl	0x239e964 <_ChromeMain+0x23996c8>
 464eeb8: aa1403e0     	mov	x0, x20
 464eebc: 940061e1     	bl	0x4667640 <_ChromeMain+0x46623a4>
 464eec0: aa1303e0     	mov	x0, x19
 464eec4: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 464eec8: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 464eecc: a94657f6     	ldp	x22, x21, [sp, #0x60]
 464eed0: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 464eed4: a94467fa     	ldp	x26, x25, [sp, #0x40]
 464eed8: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 464eedc: 910243ff     	add	sp, sp, #0x90
 464eee0: 17ffbfb9     	b	0x463edc4 <_ChromeMain+0x4639b28>
 464eee4: 52800028     	mov	w8, #0x1                ; =1
 464eee8: 39104288     	strb	w8, [x20, #0x410]
 464eeec: 910e2280     	add	x0, x20, #0x388
 464eef0: 52800001     	mov	w1, #0x0                ; =0
 464eef4: 97753e9c     	bl	0x239e964 <_ChromeMain+0x23996c8>
 464eef8: aa1403e0     	mov	x0, x20
 464eefc: 96fd48a0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 464ef00: f941be60     	ldr	x0, [x19, #0x378]
 464ef04: f9400008     	ldr	x8, [x0]
 464ef08: f9405108     	ldr	x8, [x8, #0xa0]
 464ef0c: 52800021     	mov	w1, #0x1                ; =1
 464ef10: d63f0100     	blr	x8
 464ef14: 3950e268     	ldrb	w8, [x19, #0x438]
 464ef18: 910ec260     	add	x0, x19, #0x3b0
 464ef1c: 52000101     	eor	w1, w8, #0x1
 464ef20: 97753e91     	bl	0x239e964 <_ChromeMain+0x23996c8>
 464ef24: aa1303e0     	mov	x0, x19
 464ef28: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 464ef2c: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 464ef30: a94657f6     	ldp	x22, x21, [sp, #0x60]
 464ef34: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 464ef38: a94467fa     	ldp	x26, x25, [sp, #0x40]
 464ef3c: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 464ef40: 910243ff     	add	sp, sp, #0x90
 464ef44: 140061bf     	b	0x4667640 <_ChromeMain+0x46623a4>
 464ef48: 52800028     	mov	w8, #0x1                ; =1
 464ef4c: 391042a8     	strb	w8, [x21, #0x410]
 464ef50: 910e22a0     	add	x0, x21, #0x388
 464ef54: 52800001     	mov	w1, #0x0                ; =0
 464ef58: 97753e83     	bl	0x239e964 <_ChromeMain+0x23996c8>
 464ef5c: aa1503e0     	mov	x0, x21
 464ef60: 96fd4887     	bl	0x5a117c <_ChromeMain+0x59bee0>
 464ef64: 17ffffcc     	b	0x464ee94 <_ChromeMain+0x4649bf8>
 464ef68: 13001d09     	sxtb	w9, w8
 464ef6c: 7100013f     	cmp	w9, #0x0
 464ef70: a9402a89     	ldp	x9, x10, [x20]
 464ef74: 9a944121     	csel	x1, x9, x20, mi
 464ef78: 9a884142     	csel	x2, x10, x8, mi
 464ef7c: 96f96721     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 464ef80: 17ffff1b     	b	0x464ebec <_ChromeMain+0x4649950>
