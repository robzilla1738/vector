
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45ea2c0: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea2c4: b4001e68     	cbz	x8, 0x45ea690 <_ChromeMain+0x45e53f4>
 45ea2c8: f9401aa9     	ldr	x9, [x21, #0x30]
 45ea2cc: b4001e29     	cbz	x9, 0x45ea690 <_ChromeMain+0x45e53f4>
 45ea2d0: f940c508     	ldr	x8, [x8, #0x188]
 45ea2d4: b940026a     	ldr	w10, [x19]
 45ea2d8: eb09011f     	cmp	x8, x9
 45ea2dc: 54000140     	b.eq	0x45ea304 <_ChromeMain+0x45e5068>
 45ea2e0: 3400012a     	cbz	w10, 0x45ea304 <_ChromeMain+0x45e5068>
 45ea2e4: f9400e89     	ldr	x9, [x20, #0x18]
 45ea2e8: 91008288     	add	x8, x20, #0x20
 45ea2ec: eb08013f     	cmp	x9, x8
 45ea2f0: 540000a0     	b.eq	0x45ea304 <_ChromeMain+0x45e5068>
 45ea2f4: 4b0a03ea     	neg	w10, w10
 45ea2f8: 6f00e400     	movi.2d	v0, #0000000000000000
 45ea2fc: 1400001f     	b	0x45ea378 <_ChromeMain+0x45e50dc>
 45ea300: b940026a     	ldr	w10, [x19]
 45ea304: b9400668     	ldr	w8, [x19, #0x4]
 45ea308: 4b1a0108     	sub	w8, w8, w26
 45ea30c: 1e270140     	fmov	s0, w10
 45ea310: 4e0c1f40     	mov.s	v0[1], w26
 45ea314: bd400a61     	ldr	s1, [x19, #0x8]
 45ea318: 4e0c1d01     	mov.s	v1[1], w8
 45ea31c: 0ea10c01     	sqadd.2s	v1, v0, v1
 45ea320: 0ea02c20     	sqsub.2s	v0, v1, v0
 45ea324: 0e0c3c08     	mov.s	w8, v0[1]
 45ea328: 1e260009     	fmov	w9, s0
 45ea32c: 0aa97d29     	bic	w9, w9, w9, asr #31
 45ea330: 0aa87d08     	bic	w8, w8, w8, asr #31
 45ea334: 2a0a03ea     	mov	w10, w10
 45ea338: aa1a8140     	orr	x0, x10, x26, lsl #32
 45ea33c: aa088121     	orr	x1, x9, x8, lsl #32
 45ea340: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 45ea344: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 45ea348: a94857f6     	ldp	x22, x21, [sp, #0x80]
 45ea34c: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 45ea350: a94667fa     	ldp	x26, x25, [sp, #0x60]
 45ea354: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 45ea358: 6d4423e9     	ldp	d9, d8, [sp, #0x40]
 45ea35c: 9102c3ff     	add	sp, sp, #0xb0
 45ea360: d65f03c0     	ret
 45ea364: aa0b03e9     	mov	x9, x11
 45ea368: f940016b     	ldr	x11, [x11]
 45ea36c: b5ffffcb     	cbnz	x11, 0x45ea364 <_ChromeMain+0x45e50c8>
 45ea370: eb08013f     	cmp	x9, x8
 45ea374: 54fffc60     	b.eq	0x45ea300 <_ChromeMain+0x45e5064>
 45ea378: b940312b     	ldr	w11, [x9, #0x30]
 45ea37c: 3400024b     	cbz	w11, 0x45ea3c4 <_ChromeMain+0x45e5128>
 45ea380: b940352c     	ldr	w12, [x9, #0x34]
 45ea384: 3400020c     	cbz	w12, 0x45ea3c4 <_ChromeMain+0x45e5128>
 45ea388: b940292d     	ldr	w13, [x9, #0x28]
 45ea38c: 2b0a01ad     	adds	w13, w13, w10
 45ea390: 131f7dae     	asr	w14, w13, #31
 45ea394: 520101ce     	eor	w14, w14, #0x80000000
 45ea398: 1a8d61cd     	csel	w13, w14, w13, vs
 45ea39c: b900292d     	str	w13, [x9, #0x28]
 45ea3a0: 1e2701a1     	fmov	s1, w13
 45ea3a4: 9100b12d     	add	x13, x9, #0x2c
 45ea3a8: 0d4091a1     	ld1.s	{ v1 }[1], [x13]
 45ea3ac: 1e270162     	fmov	s2, w11
 45ea3b0: 4e0c1d82     	mov.s	v2[1], w12
 45ea3b4: 0ea20c22     	sqadd.2s	v2, v1, v2
 45ea3b8: 0ea12c41     	sqsub.2s	v1, v2, v1
 45ea3bc: 0ea06421     	smax.2s	v1, v1, v0
 45ea3c0: fd001921     	str	d1, [x9, #0x30]
 45ea3c4: f940052b     	ldr	x11, [x9, #0x8]
 45ea3c8: b5fffceb     	cbnz	x11, 0x45ea364 <_ChromeMain+0x45e50c8>
 45ea3cc: aa0903eb     	mov	x11, x9
 45ea3d0: f9400929     	ldr	x9, [x9, #0x10]
 45ea3d4: f940012c     	ldr	x12, [x9]
 45ea3d8: eb0c017f     	cmp	x11, x12
 45ea3dc: 54ffff81     	b.ne	0x45ea3cc <_ChromeMain+0x45e5130>
 45ea3e0: 17ffffe4     	b	0x45ea370 <_ChromeMain+0x45e50d4>
