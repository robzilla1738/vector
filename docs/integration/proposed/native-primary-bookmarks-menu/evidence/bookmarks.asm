
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4574630: 52802580     	mov	w0, #0x12c              ; =300
 4574634: 94001136     	bl	0x4578b0c <_ChromeMain+0x4573870>
 4574638: aa0003fc     	mov	x28, x0
 457463c: 52800400     	mov	w0, #0x20               ; =32
 4574640: 96ea6b4a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4574644: f90113e0     	str	x0, [sp, #0x220]
 4574648: f004ce48     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 457464c: 3dc02d00     	ldr	q0, [x8, #0xb0]
 4574650: 3c860360     	stur	q0, [x27, #0x60]
 4574654: 91006809     	add	x9, x0, #0x1a
 4574658: eb00013f     	cmp	x9, x0
 457465c: 540032c3     	b.lo	0x4574cb4 <_ChromeMain+0x456fa18>
 4574660: f004d088     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4574664: 9105c908     	add	x8, x8, #0x172
 4574668: eb08013f     	cmp	x9, x8
 457466c: fa488002     	ccmp	x0, x8, #0x2, hi
 4574670: 54003229     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 4574674: 3dc00100     	ldr	q0, [x8]
 4574678: 3d800000     	str	q0, [x0]
 457467c: 3cc0a100     	ldur	q0, [x8, #0xa]
 4574680: 3c80a000     	stur	q0, [x0, #0xa]
 4574684: 7900341f     	strh	wzr, [x0, #0x1a]
 4574688: f9418e88     	ldr	x8, [x20, #0x318]
 457468c: f940c51a     	ldr	x26, [x8, #0x188]
 4574690: b40000da     	cbz	x26, 0x45746a8 <_ChromeMain+0x456f40c>
 4574694: 52800029     	mov	w9, #0x1                ; =1
 4574698: b8290349     	ldadd	w9, w9, [x26]
 457469c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45746a0: 6b0a013f     	cmp	w9, w10
 45746a4: 5401e2a0     	b.eq	0x45782f8 <_ChromeMain+0x457305c>
 45746a8: f940c91b     	ldr	x27, [x8, #0x190]
 45746ac: 52800900     	mov	w0, #0x48               ; =72
 45746b0: 96ea6b2e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45746b4: aa0003e4     	mov	x4, x0
 45746b8: 52800028     	mov	w8, #0x1                ; =1
 45746bc: b9000008     	str	w8, [x0]
 45746c0: d0ffcfd5     	adrp	x21, 0x3f6e000 <_ChromeMain+0x3f68d64>
 45746c4: 912502b5     	add	x21, x21, #0x940
 45746c8: 90ffcfd6     	adrp	x22, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45746cc: 912502d6     	add	x22, x22, #0x940
 45746d0: a900d815     	stp	x21, x22, [x0, #0x8]
 45746d4: d0ffd9d7     	adrp	x23, 0x40ae000 <_ChromeMain+0x40a8d64>
 45746d8: 911b02f7     	add	x23, x23, #0x6c0
 45746dc: 10fe40f8     	adr	x24, 0x4570ef8 <_ChromeMain+0x456bc5c>
 45746e0: d503201f     	nop
 45746e4: a901e017     	stp	x23, x24, [x0, #0x18]
 45746e8: a902e81f     	stp	xzr, x26, [x0, #0x28]
 45746ec: f9001c1b     	str	x27, [x0, #0x38]
 45746f0: 52938968     	mov	w8, #0x9c4b             ; =40011
 45746f4: b9004008     	str	w8, [x0, #0x40]
 45746f8: a912ffff     	stp	xzr, xzr, [sp, #0x128]
 45746fc: f90093ff     	str	xzr, [sp, #0x120]
 4574700: 900515c3     	adrp	x3, 0xe82c000 <dyld_stub_binder+0xe82c000>
 4574704: 910ac063     	add	x3, x3, #0x2b0
 4574708: 910883e2     	add	x2, sp, #0x220
 457470c: 910483e5     	add	x5, sp, #0x120
 4574710: aa1403e0     	mov	x0, x20
 4574714: aa1c03e1     	mov	x1, x28
 4574718: 52800026     	mov	w6, #0x1                ; =1
 457471c: 940011b9     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 4574720: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 4574724: 36f800a8     	tbz	w8, #0x1f, 0x4574738 <_ChromeMain+0x456f49c>
 4574728: f94093e0     	ldr	x0, [sp, #0x120]
 457472c: f9409be8     	ldr	x8, [sp, #0x130]
 4574730: d37ff901     	lsl	x1, x8, #1
 4574734: 96ea51e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4574738: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 457473c: 36f800a8     	tbz	w8, #0x1f, 0x4574750 <_ChromeMain+0x456f4b4>
 4574740: f94113e0     	ldr	x0, [sp, #0x220]
 4574744: f9411be8     	ldr	x8, [sp, #0x230]
 4574748: d37ff901     	lsl	x1, x8, #1
 457474c: 96ea51db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4574750: 52800600     	mov	w0, #0x30               ; =48
 4574754: 96ea6b05     	bl	0xf368 <_ChromeMain+0xa0cc>
 4574758: f90063e0     	str	x0, [sp, #0xc0]
 457475c: 9004ce68     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4574760: 3dc00d00     	ldr	q0, [x8, #0x30]
 4574764: 3c808320     	stur	q0, [x25, #0x8]
 4574768: 91008809     	add	x9, x0, #0x22
 457476c: eb00013f     	cmp	x9, x0
 4574770: 54002a23     	b.lo	0x4574cb4 <_ChromeMain+0x456fa18>
 4574774: f004d088     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4574778: 91063908     	add	x8, x8, #0x18e
 457477c: eb08013f     	cmp	x9, x8
 4574780: fa488002     	ccmp	x0, x8, #0x2, hi
 4574784: 54002989     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 4574788: 52800c49     	mov	w9, #0x62               ; =98
 457478c: b9002009     	str	w9, [x0, #0x20]
 4574790: ad400500     	ldp	q0, q1, [x8]
 4574794: ad000400     	stp	q0, q1, [x0]
 4574798: f9418e88     	ldr	x8, [x20, #0x318]
 457479c: f940c519     	ldr	x25, [x8, #0x188]
 45747a0: b40000d9     	cbz	x25, 0x45747b8 <_ChromeMain+0x456f51c>
 45747a4: 52800029     	mov	w9, #0x1                ; =1
 45747a8: b8290329     	ldadd	w9, w9, [x25]
 45747ac: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45747b0: 6b0a013f     	cmp	w9, w10
 45747b4: 5401dc60     	b.eq	0x4578340 <_ChromeMain+0x45730a4>
 45747b8: f940c91a     	ldr	x26, [x8, #0x190]
 45747bc: 52800900     	mov	w0, #0x48               ; =72
 45747c0: 96ea6aea     	bl	0xf368 <_ChromeMain+0xa0cc>
 45747c4: aa0003e4     	mov	x4, x0
 45747c8: 52800028     	mov	w8, #0x1                ; =1
 45747cc: b9000008     	str	w8, [x0]
 45747d0: a900d815     	stp	x21, x22, [x0, #0x8]
 45747d4: a901e017     	stp	x23, x24, [x0, #0x18]
 45747d8: a902e41f     	stp	xzr, x25, [x0, #0x28]
 45747dc: f9001c1a     	str	x26, [x0, #0x38]
 45747e0: 52911708     	mov	w8, #0x88b8             ; =35000
 45747e4: b9004008     	str	w8, [x0, #0x40]
 45747e8: a9197fff     	stp	xzr, xzr, [sp, #0x190]
 45747ec: f900c7ff     	str	xzr, [sp, #0x188]
 45747f0: f00515a3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 45747f4: 91340063     	add	x3, x3, #0xd00
 45747f8: 910303e2     	add	x2, sp, #0xc0
 45747fc: 910623e5     	add	x5, sp, #0x188
 4574800: aa1403e0     	mov	x0, x20
 4574804: aa1c03e1     	mov	x1, x28
 4574808: 52800026     	mov	w6, #0x1                ; =1
 457480c: 9400117d     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 4574810: 39c67fe8     	ldrsb	w8, [sp, #0x19f]
 4574814: 36f800a8     	tbz	w8, #0x1f, 0x4574828 <_ChromeMain+0x456f58c>
 4574818: f940c7e0     	ldr	x0, [sp, #0x188]
 457481c: f940cfe8     	ldr	x8, [sp, #0x198]
 4574820: d37ff901     	lsl	x1, x8, #1
 4574824: 96ea51a5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4574828: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 457482c: 36f905a8     	tbz	w8, #0x1f, 0x45768e0 <_ChromeMain+0x4571644>
 4574830: f94063e0     	ldr	x0, [sp, #0xc0]
 4574834: f9406be8     	ldr	x8, [sp, #0xd0]
 4574838: 14000828     	b	0x45768d8 <_ChromeMain+0x457163c>
