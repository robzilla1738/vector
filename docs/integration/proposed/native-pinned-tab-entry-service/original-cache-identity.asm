
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d7574: d102c3ff     	sub	sp, sp, #0xb0
 41d7578: a9094ff4     	stp	x20, x19, [sp, #0x90]
 41d757c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 41d7580: 910283fd     	add	x29, sp, #0xa0
 41d7584: b4000561     	cbz	x1, 0x41d7630 <_ChromeMain+0x41d2394>
 41d7588: aa0103f3     	mov	x19, x1
 41d758c: 39418428     	ldrb	w8, [x1, #0x61]
 41d7590: 34000508     	cbz	w8, 0x41d7630 <_ChromeMain+0x41d2394>
 41d7594: f9402268     	ldr	x8, [x19, #0x40]
 41d7598: b40004c8     	cbz	x8, 0x41d7630 <_ChromeMain+0x41d2394>
 41d759c: aa0003f4     	mov	x20, x0
 41d75a0: 6f00e400     	movi.2d	v0, #0000000000000000
 41d75a4: ad0383e0     	stp	q0, q0, [sp, #0x70]
 41d75a8: ad0283e0     	stp	q0, q0, [sp, #0x50]
 41d75ac: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d75b0: ad0083e0     	stp	q0, q0, [sp, #0x10]
 41d75b4: b00547e1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 41d75b8: 9126c021     	add	x1, x1, #0x9b0
 41d75bc: 91002100     	add	x0, x8, #0x8
 41d75c0: 96f9eeec     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d75c4: b4000080     	cbz	x0, 0x41d75d4 <_ChromeMain+0x41d2338>
 41d75c8: aa0003e8     	mov	x8, x0
 41d75cc: 39408009     	ldrb	w9, [x0, #0x20]
 41d75d0: 35000469     	cbnz	w9, 0x41d765c <_ChromeMain+0x41d23c0>
 41d75d4: 390043ff     	strb	wzr, [sp, #0x10]
 41d75d8: 390223ff     	strb	wzr, [sp, #0x88]
 41d75dc: b9401268     	ldr	w8, [x19, #0x10]
 41d75e0: a9462e8a     	ldp	x10, x11, [x20, #0x60]
 41d75e4: d379e169     	lsl	x9, x11, #7
 41d75e8: b40002c9     	cbz	x9, 0x41d7640 <_ChromeMain+0x41d23a4>
 41d75ec: 9347fd2c     	asr	x12, x9, #7
 41d75f0: aa0a03e9     	mov	x9, x10
 41d75f4: d341fd8d     	lsr	x13, x12, #1
 41d75f8: 8b0d1d2e     	add	x14, x9, x13, lsl #7
 41d75fc: b84805cf     	ldr	w15, [x14], #0x80
 41d7600: aa6c07f0     	mvn	x16, x12, lsr #1
 41d7604: 8b10018c     	add	x12, x12, x16
 41d7608: 6b0801ff     	cmp	w15, w8
 41d760c: 9a8db18c     	csel	x12, x12, x13, lt
 41d7610: 9a89b1c9     	csel	x9, x14, x9, lt
 41d7614: b5ffff0c     	cbnz	x12, 0x41d75f4 <_ChromeMain+0x41d2358>
 41d7618: 8b0b1d4a     	add	x10, x10, x11, lsl #7
 41d761c: eb0a013f     	cmp	x9, x10
 41d7620: 54000080     	b.eq	0x41d7630 <_ChromeMain+0x41d2394>
 41d7624: b940012a     	ldr	w10, [x9]
 41d7628: 6b0a011f     	cmp	w8, w10
 41d762c: 540000ea     	b.ge	0x41d7648 <_ChromeMain+0x41d23ac>
 41d7630: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41d7634: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41d7638: 9102c3ff     	add	sp, sp, #0xb0
 41d763c: d65f03c0     	ret
 41d7640: aa0a03e9     	mov	x9, x10
 41d7644: 17fffff5     	b	0x41d7618 <_ChromeMain+0x41d237c>
 41d7648: 910043e0     	add	x0, sp, #0x10
 41d764c: 91002121     	add	x1, x9, #0x8
 41d7650: 14000005     	b	0x41d7664 <_ChromeMain+0x41d23c8>
 41d7654: aa0903e1     	mov	x1, x9
 41d7658: 1400001d     	b	0x41d76cc <_ChromeMain+0x41d2430>
 41d765c: 910043e0     	add	x0, sp, #0x10
 41d7660: 91002101     	add	x1, x8, #0x8
 41d7664: 96fd8a4c     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d7668: 52800028     	mov	w8, #0x1                ; =1
 41d766c: 390223e8     	strb	w8, [sp, #0x88]
 41d7670: 3940a3e8     	ldrb	w8, [sp, #0x28]
 41d7674: 34000568     	cbz	w8, 0x41d7720 <_ChromeMain+0x41d2484>
 41d7678: f9402260     	ldr	x0, [x19, #0x40]
 41d767c: 910043e1     	add	x1, sp, #0x10
 41d7680: 940e018d     	bl	0x4557cb4 <_ChromeMain+0x4552a18>
 41d7684: b9401268     	ldr	w8, [x19, #0x10]
 41d7688: b9000fe8     	str	w8, [sp, #0xc]
 41d768c: 394223e9     	ldrb	w9, [sp, #0x88]
 41d7690: 36000629     	tbz	w9, #0x0, 0x41d7754 <_ChromeMain+0x41d24b8>
 41d7694: a9c62a89     	ldp	x9, x10, [x20, #0x60]!
 41d7698: d379e14b     	lsl	x11, x10, #7
 41d769c: b4fffdcb     	cbz	x11, 0x41d7654 <_ChromeMain+0x41d23b8>
 41d76a0: 9347fd6b     	asr	x11, x11, #7
 41d76a4: aa0903e1     	mov	x1, x9
 41d76a8: d341fd6c     	lsr	x12, x11, #1
 41d76ac: 8b0c1c2d     	add	x13, x1, x12, lsl #7
 41d76b0: b84805ae     	ldr	w14, [x13], #0x80
 41d76b4: aa6b07ef     	mvn	x15, x11, lsr #1
 41d76b8: 8b0f016b     	add	x11, x11, x15
 41d76bc: 6b0801df     	cmp	w14, w8
 41d76c0: 9a8cb16b     	csel	x11, x11, x12, lt
 41d76c4: 9a81b1a1     	csel	x1, x13, x1, lt
 41d76c8: b5ffff0b     	cbnz	x11, 0x41d76a8 <_ChromeMain+0x41d240c>
 41d76cc: 8b0a1d29     	add	x9, x9, x10, lsl #7
 41d76d0: eb09003f     	cmp	x1, x9
 41d76d4: 54000100     	b.eq	0x41d76f4 <_ChromeMain+0x41d2458>
 41d76d8: b9400029     	ldr	w9, [x1]
 41d76dc: 6b09011f     	cmp	w8, w9
 41d76e0: 540000ab     	b.lt	0x41d76f4 <_ChromeMain+0x41d2458>
 41d76e4: 91002020     	add	x0, x1, #0x8
 41d76e8: 910043e1     	add	x1, sp, #0x10
 41d76ec: 970bd088     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 41d76f0: 14000005     	b	0x41d7704 <_ChromeMain+0x41d2468>
 41d76f4: 910033e2     	add	x2, sp, #0xc
 41d76f8: 910043e3     	add	x3, sp, #0x10
 41d76fc: aa1403e0     	mov	x0, x20
 41d7700: 940004d6     	bl	0x41d8a58 <_ChromeMain+0x41d37bc>
 41d7704: 394223e8     	ldrb	w8, [sp, #0x88]
 41d7708: 36000268     	tbz	w8, #0x0, 0x41d7754 <_ChromeMain+0x41d24b8>
 41d770c: 910043e1     	add	x1, sp, #0x10
 41d7710: aa1303e0     	mov	x0, x19
 41d7714: 940002af     	bl	0x41d81d0 <_ChromeMain+0x41d2f34>
 41d7718: 394223e8     	ldrb	w8, [sp, #0x88]
 41d771c: 34fff8a8     	cbz	w8, 0x41d7630 <_ChromeMain+0x41d2394>
 41d7720: 910043f3     	add	x19, sp, #0x10
 41d7724: 9101c260     	add	x0, x19, #0x70
 41d7728: d2800001     	mov	x1, #0x0                ; =0
 41d772c: 96f94163     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d7730: 91008260     	add	x0, x19, #0x20
 41d7734: 96f94151     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d7738: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 41d773c: 36fff7a8     	tbz	w8, #0x1f, 0x41d7630 <_ChromeMain+0x41d2394>
 41d7740: f9400be0     	ldr	x0, [sp, #0x10]
 41d7744: f94013e8     	ldr	x8, [sp, #0x20]
 41d7748: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d774c: 96f8c5db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d7750: 17ffffb8     	b	0x41d7630 <_ChromeMain+0x41d2394>
 41d7754: d4200020     	brk	#0x1
