
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45e87b4: f9405261     	ldr	x1, [x19, #0xa0]
 45e87b8: f9401a62     	ldr	x2, [x19, #0x30]
 45e87bc: 910383e8     	add	x8, sp, #0xe0
 45e87c0: aa1503e0     	mov	x0, x21
 45e87c4: 95fffcdc     	bl	0xc5e7b34 <_ChromeMain+0xc5e2898>
 45e87c8: a9087f7f     	stp	xzr, xzr, [x27, #0x80]
 45e87cc: b90143ff     	str	wzr, [sp, #0x140]
 45e87d0: f9403e61     	ldr	x1, [x19, #0x78]
 45e87d4: f9401a62     	ldr	x2, [x19, #0x30]
 45e87d8: 9104c3e8     	add	x8, sp, #0x130
 45e87dc: aa1503e0     	mov	x0, x21
 45e87e0: 95fffcd5     	bl	0xc5e7b34 <_ChromeMain+0xc5e2898>
 45e87e4: 394503e8     	ldrb	w8, [sp, #0x140]
 45e87e8: 360095e8     	tbz	w8, #0x0, 0x45e9aa4 <_ChromeMain+0x45e4808>
 45e87ec: 3943c3e8     	ldrb	w8, [sp, #0xf0]
 45e87f0: b94017e9     	ldr	w9, [sp, #0x14]
 45e87f4: 6a08013f     	tst	w9, w8
 45e87f8: 54000081     	b.ne	0x45e8808 <_ChromeMain+0x45e356c>
 45e87fc: 52800008     	mov	w8, #0x0                ; =0
 45e8800: 52800009     	mov	w9, #0x0                ; =0
 45e8804: 14000016     	b	0x45e885c <_ChromeMain+0x45e35c0>
 45e8808: b940e7e8     	ldr	w8, [sp, #0xe4]
 45e880c: b940efe9     	ldr	w9, [sp, #0xec]
 45e8810: 0b090108     	add	w8, w8, w9
 45e8814: b94137e9     	ldr	w9, [sp, #0x134]
 45e8818: b94133ea     	ldr	w10, [sp, #0x130]
 45e881c: b94013eb     	ldr	w11, [sp, #0x10]
 45e8820: 0b090169     	add	w9, w11, w9
 45e8824: 4b090108     	sub	w8, w8, w9
 45e8828: bd4012e0     	ldr	s0, [x23, #0x10]
 45e882c: 1e24c000     	frintp	s0, s0
 45e8830: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e8834: 1e212000     	fcmp	s0, s1
 45e8838: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45e883c: 1e216801     	fmaxnm	s1, s0, s1
 45e8840: 1e38002b     	fcvtzs	w11, s1
 45e8844: 1a89b3e9     	csel	w9, wzr, w9, lt
 45e8848: 12b6200c     	mov	w12, #0x4effffff        ; =1325400063
 45e884c: 1e270181     	fmov	s1, w12
 45e8850: 1e212000     	fcmp	s0, s1
 45e8854: 1a899169     	csel	w9, w11, w9, ls
 45e8858: 4b0a0129     	sub	w9, w9, w10
 45e885c: f9403e60     	ldr	x0, [x19, #0x78]
 45e8860: 39683018     	ldrb	w24, [x0, #0xa0c]
 45e8864: 7100031f     	cmp	w24, #0x0
 45e8868: 1a8813f6     	csel	w22, wzr, w8, ne
 45e886c: 1a8913f7     	csel	w23, wzr, w9, ne
 45e8870: 0ab67ec1     	bic	w1, w22, w22, asr #31
 45e8874: 94018e13     	bl	0x464c0c0 <_ChromeMain+0x4646e24>
 45e8878: f9403e75     	ldr	x21, [x19, #0x78]
 45e887c: 0ab77ee8     	bic	w8, w23, w23, asr #31
 45e8880: 396832a9     	ldrb	w9, [x21, #0xa0c]
 45e8884: 7100013f     	cmp	w9, #0x0
 45e8888: 1a8813e8     	csel	w8, wzr, w8, ne
 45e888c: b908c2a8     	str	w8, [x21, #0x8c0]
 45e8890: f942cab4     	ldr	x20, [x21, #0x590]
 45e8894: b943ae89     	ldr	w9, [x20, #0x3ac]
 45e8898: 6b08013f     	cmp	w9, w8
 45e889c: 540000c0     	b.eq	0x45e88b4 <_ChromeMain+0x45e3618>
 45e88a0: b903ae88     	str	w8, [x20, #0x3ac]
 45e88a4: aa1403e0     	mov	x0, x20
 45e88a8: 52800021     	mov	w1, #0x1                ; =1
 45e88ac: 97011ef2     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e88b0: f942cab4     	ldr	x20, [x21, #0x590]
 45e88b4: aa1503e0     	mov	x0, x21
 45e88b8: 9401a112     	bl	0x4650d00 <_ChromeMain+0x464ba64>
 45e88bc: 394ee288     	ldrb	w8, [x20, #0x3b8]
 45e88c0: 6b00011f     	cmp	w8, w0
 45e88c4: 540000a0     	b.eq	0x45e88d8 <_ChromeMain+0x45e363c>
 45e88c8: 390ee280     	strb	w0, [x20, #0x3b8]
 45e88cc: aa1403e0     	mov	x0, x20
 45e88d0: 52800001     	mov	w1, #0x0                ; =0
 45e88d4: 97011ee8     	bl	0x630474 <_ChromeMain+0x62b1d8>
