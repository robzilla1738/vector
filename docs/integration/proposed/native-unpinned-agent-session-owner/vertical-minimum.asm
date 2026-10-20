
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4135580: d10243ff     	sub	sp, sp, #0x90
 4135584: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4135588: a90657f6     	stp	x22, x21, [sp, #0x60]
 413558c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4135590: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4135594: 910203fd     	add	x29, sp, #0x80
 4135598: f942b008     	ldr	x8, [x0, #0x560]
 413559c: b50001a8     	cbnz	x8, 0x41355d0 <_ChromeMain+0x4130334>
 41355a0: 52800760     	mov	w0, #0x3b               ; =59
 41355a4: 970f38c7     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 41355a8: d2800009     	mov	x9, #0x0                ; =0
 41355ac: 0aa07c08     	bic	w8, w0, w0, asr #31
 41355b0: 2a0803e8     	mov	w8, w8
 41355b4: aa080120     	orr	x0, x9, x8
 41355b8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 41355bc: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 41355c0: a94657f6     	ldp	x22, x21, [sp, #0x60]
 41355c4: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 41355c8: 910243ff     	add	sp, sp, #0x90
 41355cc: d65f03c0     	ret
 41355d0: aa0003f3     	mov	x19, x0
 41355d4: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 41355d8: f90027ff     	str	xzr, [sp, #0x48]
 41355dc: f940a508     	ldr	x8, [x8, #0x148]
 41355e0: b4000088     	cbz	x8, 0x41355f0 <_ChromeMain+0x4130354>
 41355e4: f9401100     	ldr	x0, [x8, #0x20]
 41355e8: 9100e3e8     	add	x8, sp, #0x38
 41355ec: 97e38de7     	bl	0x3a18d88 <_ChromeMain+0x3a13aec>
 41355f0: f942ba68     	ldr	x8, [x19, #0x570]
 41355f4: b40000c8     	cbz	x8, 0x413560c <_ChromeMain+0x4130370>
 41355f8: 39472108     	ldrb	w8, [x8, #0x1c8]
 41355fc: 34000088     	cbz	w8, 0x413560c <_ChromeMain+0x4130370>
 4135600: 394123e8     	ldrb	w8, [sp, #0x48]
 4135604: 52000114     	eor	w20, w8, #0x1
 4135608: 14000002     	b	0x4135610 <_ChromeMain+0x4130374>
 413560c: 52800014     	mov	w20, #0x0               ; =0
 4135610: f942b260     	ldr	x0, [x19, #0x560]
 4135614: 910083f3     	add	x19, sp, #0x20
 4135618: 910083e8     	add	x8, sp, #0x20
 413561c: 94ddb8d7     	bl	0x78a3978 <_ChromeMain+0x789e6dc>
 4135620: f94017e8     	ldr	x8, [sp, #0x28]
 4135624: d37df115     	lsl	x21, x8, #3
 4135628: b4000095     	cbz	x21, 0x4135638 <_ChromeMain+0x413039c>
 413562c: f94013f6     	ldr	x22, [sp, #0x20]
 4135630: 394123f7     	ldrb	w23, [sp, #0x48]
 4135634: 14000027     	b	0x41356d0 <_ChromeMain+0x4130434>
 4135638: f90007f3     	str	x19, [sp, #0x8]
 413563c: 910023e0     	add	x0, sp, #0x8
 4135640: 97059ba0     	bl	0x29c4c0 <_ChromeMain+0x297224>
 4135644: 52800720     	mov	w0, #0x39               ; =57
 4135648: 970f389e     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 413564c: 1e220000     	scvtf	s0, w0
 4135650: 1e220281     	scvtf	s1, w20
 4135654: 1e2f1002     	fmov	s2, #1.50000000
 4135658: 1e227821     	fminnm	s1, s1, s2
 413565c: 1e200820     	fmul	s0, s1, s0
 4135660: 1e24c000     	frintp	s0, s0
 4135664: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 4135668: 1e212000     	fcmp	s0, s1
 413566c: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 4135670: 1a88b3e8     	csel	w8, wzr, w8, lt
 4135674: 1e216801     	fmaxnm	s1, s0, s1
 4135678: 1e380029     	fcvtzs	w9, s1
 413567c: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 4135680: 1e270141     	fmov	s1, w10
 4135684: 1e212000     	fcmp	s0, s1
 4135688: 1a88d128     	csel	w8, w9, w8, le
 413568c: 52800089     	mov	w9, #0x4                ; =4
 4135690: 7100069f     	cmp	w20, #0x1
 4135694: 1a9fc129     	csel	w9, w9, wzr, gt
 4135698: 7100029f     	cmp	w20, #0x0
 413569c: 1a89d529     	cinc	w9, w9, gt
 41356a0: 0b080133     	add	w19, w9, w8
 41356a4: 52800760     	mov	w0, #0x3b               ; =59
 41356a8: 970f3886     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 41356ac: 0aa07c08     	bic	w8, w0, w0, asr #31
 41356b0: 0ab37e69     	bic	w9, w19, w19, asr #31
 41356b4: d3607d29     	lsl	x9, x9, #32
 41356b8: 17ffffbe     	b	0x41355b0 <_ChromeMain+0x4130314>
 41356bc: 52800028     	mov	w8, #0x1                ; =1
 41356c0: 0b140114     	add	w20, w8, w20
 41356c4: 910022d6     	add	x22, x22, #0x8
 41356c8: f10022b5     	subs	x21, x21, #0x8
 41356cc: 54fffb60     	b.eq	0x4135638 <_ChromeMain+0x413039c>
 41356d0: 34ffff77     	cbz	w23, 0x41356bc <_ChromeMain+0x4130420>
 41356d4: f94002c0     	ldr	x0, [x22]
 41356d8: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 41356dc: f9000fff     	str	xzr, [sp, #0x18]
 41356e0: 910023e8     	add	x8, sp, #0x8
 41356e4: 94dde885     	bl	0x78af8f8 <_ChromeMain+0x78aa65c>
 41356e8: 394123e8     	ldrb	w8, [sp, #0x48]
 41356ec: 36000128     	tbz	w8, #0x0, 0x4135710 <_ChromeMain+0x4130474>
 41356f0: 394063e8     	ldrb	w8, [sp, #0x18]
 41356f4: 34fffe68     	cbz	w8, 0x41356c0 <_ChromeMain+0x4130424>
 41356f8: a940a7e8     	ldp	x8, x9, [sp, #0x8]
 41356fc: a943afea     	ldp	x10, x11, [sp, #0x38]
 4135700: eb0a011f     	cmp	x8, x10
 4135704: fa4b0120     	ccmp	x9, x11, #0x0, eq
 4135708: 1a9f17e8     	cset	w8, eq
 413570c: 17ffffed     	b	0x41356c0 <_ChromeMain+0x4130424>
 4135710: 942b2b03     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
