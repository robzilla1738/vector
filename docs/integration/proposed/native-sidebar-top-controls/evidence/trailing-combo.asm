
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 347a1e0: f941ae80     	ldr	x0, [x20, #0x358]
 347a1e4: b943b681     	ldr	w1, [x20, #0x3b4]
 347a1e8: 9416b0d6     	bl	0x3a26540 <_ChromeMain+0x3a212a4>
 347a1ec: aa0003f5     	mov	x21, x0
 347a1f0: 4e080c00     	dup.2d	v0, x0
 347a1f4: 90055608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a1f8: 3dc01101     	ldr	q1, [x8, #0x40]
 347a1fc: 6ee14400     	ushl.2d	v0, v0, v1
 347a200: 0ea12800     	xtn.2s	v0, v0
 347a204: 4b1502e8     	sub	w8, w23, w21
 347a208: 0b487d08     	add	w8, w8, w8, lsr #31
 347a20c: 13017d09     	asr	w9, w8, #1
 347a210: 0aa87d39     	bic	w25, w9, w8, asr #31
 347a214: 1e270321     	fmov	s1, w25
 347a218: 29085bf9     	stp	w25, w22, [sp, #0x40]
 347a21c: 4e0c1ec1     	mov.s	v1[1], w22
 347a220: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a224: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a228: 6f00e401     	movi.2d	v1, #0000000000000000
 347a22c: 0ea16400     	smax.2s	v0, v0, v1
 347a230: 3d800fe0     	str	q0, [sp, #0x30]
 347a234: fd0027e0     	str	d0, [sp, #0x48]
 347a238: f941ae88     	ldr	x8, [x20, #0x358]
 347a23c: f9002fe8     	str	x8, [sp, #0x58]
 347a240: 39472108     	ldrb	w8, [x8, #0x1c8]
 347a244: 39015fe8     	strb	w8, [sp, #0x57]
 347a248: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a24c: eb09011f     	cmp	x8, x9
 347a250: 54006c01     	b.ne	0x347afd0 <_ChromeMain+0x3475d34>
 347a254: 91002260     	add	x0, x19, #0x8
 347a258: 910163e1     	add	x1, sp, #0x58
 347a25c: 91015fe2     	add	x2, sp, #0x57
 347a260: 910103e3     	add	x3, sp, #0x40
 347a264: 974c17af     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a268: f9400668     	ldr	x8, [x19, #0x8]
 347a26c: eb080008     	subs	x8, x0, x8
 347a270: 9344fd08     	asr	x8, x8, #4
 347a274: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a278: f2955569     	movk	x9, #0xaaab
 347a27c: 9b097d08     	mul	x8, x8, x9
 347a280: f9000a68     	str	x8, [x19, #0x10]
 347a284: 54ffb300     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a288: d360fea8     	lsr	x8, x21, #32
 347a28c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 347a290: 1e260009     	fmov	w9, s0
 347a294: 0b190129     	add	w9, w9, w25
 347a298: 0aa97d29     	bic	w9, w9, w9, asr #31
 347a29c: 6b0902ff     	cmp	w23, w9
 347a2a0: 1a8982f7     	csel	w23, w23, w9, hi
 347a2a4: 0b0802c8     	add	w8, w22, w8
 347a2a8: 11001508     	add	w8, w8, #0x5
 347a2ac: 0aa87d08     	bic	w8, w8, w8, asr #31
 347a2b0: 6b08031f     	cmp	w24, w8
 347a2b4: 1a888318     	csel	w24, w24, w8, hi
