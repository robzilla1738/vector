
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46136ac: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 46136b0: a90167fa     	stp	x26, x25, [sp, #0x10]
 46136b4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46136b8: a90357f6     	stp	x22, x21, [sp, #0x30]
 46136bc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46136c0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46136c4: 910143fd     	add	x29, sp, #0x50
 46136c8: aa0103f4     	mov	x20, x1
 46136cc: aa0003f3     	mov	x19, x0
 46136d0: f9446817     	ldr	x23, [x0, #0x8d0]
 46136d4: f9400428     	ldr	x8, [x1, #0x8]
 46136d8: f9446415     	ldr	x21, [x0, #0x8c8]
 46136dc: eb0802ff     	cmp	x23, x8
 46136e0: 540004c1     	b.ne	0x4613778 <_ChromeMain+0x460e4dc>
 46136e4: d379e2e8     	lsl	x8, x23, #7
 46136e8: eb170d16     	subs	x22, x8, x23, lsl #3
 46136ec: 54000380     	b.eq	0x461375c <_ChromeMain+0x460e4c0>
 46136f0: d2800018     	mov	x24, #0x0               ; =0
 46136f4: f9400299     	ldr	x25, [x20]
 46136f8: 8b1802a9     	add	x9, x21, x24
 46136fc: 8b180328     	add	x8, x25, x24
 4613700: 39405d2b     	ldrb	w11, [x9, #0x17]
 4613704: 13001d6a     	sxtb	w10, w11
 4613708: f940052c     	ldr	x12, [x9, #0x8]
 461370c: 7100015f     	cmp	w10, #0x0
 4613710: 9a8b4182     	csel	x2, x12, x11, mi
 4613714: 39405d0c     	ldrb	w12, [x8, #0x17]
 4613718: 13001d8b     	sxtb	w11, w12
 461371c: f940050d     	ldr	x13, [x8, #0x8]
 4613720: 7100017f     	cmp	w11, #0x0
 4613724: 9a8c41ac     	csel	x12, x13, x12, mi
 4613728: eb0c005f     	cmp	x2, x12
 461372c: 54000261     	b.ne	0x4613778 <_ChromeMain+0x460e4dc>
 4613730: f940012c     	ldr	x12, [x9]
 4613734: 7100015f     	cmp	w10, #0x0
 4613738: 9a894180     	csel	x0, x12, x9, mi
 461373c: f9400109     	ldr	x9, [x8]
 4613740: 7100017f     	cmp	w11, #0x0
 4613744: 9a884121     	csel	x1, x9, x8, mi
 4613748: 94e7d846     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461374c: 35000160     	cbnz	w0, 0x4613778 <_ChromeMain+0x460e4dc>
 4613750: 9101e318     	add	x24, x24, #0x78
 4613754: eb1802df     	cmp	x22, x24
 4613758: 54fffd01     	b.ne	0x46136f8 <_ChromeMain+0x460e45c>
 461375c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4613760: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4613764: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4613768: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 461376c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4613770: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4613774: d65f03c0     	ret
 4613778: b5000235     	cbnz	x21, 0x46137bc <_ChromeMain+0x460e520>
 461377c: f9400288     	ldr	x8, [x20]
 4613780: f9046668     	str	x8, [x19, #0x8c8]
 4613784: f9400688     	ldr	x8, [x20, #0x8]
 4613788: f9046a68     	str	x8, [x19, #0x8d0]
 461378c: f9400a88     	ldr	x8, [x20, #0x10]
 4613790: f9046e68     	str	x8, [x19, #0x8d8]
 4613794: a9007e9f     	stp	xzr, xzr, [x20]
 4613798: f9000a9f     	str	xzr, [x20, #0x10]
 461379c: aa1303e0     	mov	x0, x19
 46137a0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 46137a4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 46137a8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 46137ac: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 46137b0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 46137b4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 46137b8: 1400002b     	b	0x4613864 <_ChromeMain+0x460e5c8>
 46137bc: 91232276     	add	x22, x19, #0x8c8
 46137c0: d379e2e8     	lsl	x8, x23, #7
 46137c4: eb170d17     	subs	x23, x8, x23, lsl #3
 46137c8: 54000480     	b.eq	0x4613858 <_ChromeMain+0x460e5bc>
 46137cc: d2800018     	mov	x24, #0x0               ; =0
 46137d0: aa1503f9     	mov	x25, x21
 46137d4: 8b17033b     	add	x27, x25, x23
 46137d8: f101e37a     	subs	x26, x27, #0x78
 46137dc: 54000420     	b.eq	0x4613860 <_ChromeMain+0x460e5c4>
 46137e0: d1002360     	sub	x0, x27, #0x8
 46137e4: d2800001     	mov	x1, #0x0                ; =0
 46137e8: 96e85134     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46137ec: d1016360     	sub	x0, x27, #0x58
 46137f0: 96e85122     	bl	0x27c78 <_ChromeMain+0x229dc>
 46137f4: 38d9f368     	ldursb	w8, [x27, #-0x61]
 46137f8: 36f800c8     	tbz	w8, #0x1f, 0x4613810 <_ChromeMain+0x460e574>
 46137fc: f9400340     	ldr	x0, [x26]
 4613800: 8b170328     	add	x8, x25, x23
 4613804: f8598108     	ldur	x8, [x8, #-0x68]
 4613808: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461380c: 96e7d5ab     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613810: d101e339     	sub	x25, x25, #0x78
 4613814: 9101e318     	add	x24, x24, #0x78
 4613818: eb1802ff     	cmp	x23, x24
 461381c: 54fffdc1     	b.ne	0x46137d4 <_ChromeMain+0x460e538>
 4613820: f94002c0     	ldr	x0, [x22]
 4613824: cb0002a8     	sub	x8, x21, x0
 4613828: 9343fd08     	asr	x8, x8, #3
 461382c: b203ebe9     	mov	x9, #-0x1111111111111112 ; =-1229782938247303442
 4613830: f29ddde9     	movk	x9, #0xeeef
 4613834: 9b097d08     	mul	x8, x8, x9
 4613838: f9046a68     	str	x8, [x19, #0x8d0]
 461383c: f9446e68     	ldr	x8, [x19, #0x8d8]
 4613840: d379e109     	lsl	x9, x8, #7
 4613844: cb080d21     	sub	x1, x9, x8, lsl #3
 4613848: 96e7d59c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461384c: a9007edf     	stp	xzr, xzr, [x22]
 4613850: f9000adf     	str	xzr, [x22, #0x10]
 4613854: 17ffffca     	b	0x461377c <_ChromeMain+0x460e4e0>
 4613858: aa1503e0     	mov	x0, x21
 461385c: 17fffff2     	b	0x4613824 <_ChromeMain+0x460e588>
 4613860: d4200020     	brk	#0x1
