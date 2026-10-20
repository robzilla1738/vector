
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e73b0: 9344fd08     	asr	x8, x8, #4
 35e73b4: f90023e8     	str	x8, [sp, #0x40]
 35e73b8: 5403db00     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e73bc: aa1303e0     	mov	x0, x19
 35e73c0: 52801ba1     	mov	w1, #0xdd               ; =221
 35e73c4: 973535aa     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e73c8: 9100e3e1     	add	x1, sp, #0x38
 35e73cc: 972e2311     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e73d0: 9100e3e0     	add	x0, sp, #0x38
 35e73d4: 972cc610     	bl	0x118c14 <_ChromeMain+0x113978>
 35e73d8: f94017e0     	ldr	x0, [sp, #0x28]
 35e73dc: b5021d60     	cbnz	x0, 0x35eb788 <_ChromeMain+0x35e64ec>
 35e73e0: 52814148     	mov	w8, #0xa0a              ; =2570
 35e73e4: 72b18148     	movk	w8, #0x8c0a, lsl #16
 35e73e8: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e73ec: 72b19f49     	movk	w9, #0x8cfa, lsl #16
 35e73f0: 7100029f     	cmp	w20, #0x0
 35e73f4: 1a88113b     	csel	w27, w9, w8, ne
 35e73f8: 52800035     	mov	w21, #0x1               ; =1
 35e73fc: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7400: 52800500     	mov	w0, #0x28               ; =40
 35e7404: 97289fd9     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7408: b9000015     	str	w21, [x0]
 35e740c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7410: 91180108     	add	x8, x8, #0x600
 35e7414: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7418: f9000c1a     	str	x26, [x0, #0x18]
 35e741c: b900241b     	str	w27, [x0, #0x24]
 35e7420: f90017e0     	str	x0, [sp, #0x28]
 35e7424: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7428: f9001fff     	str	xzr, [sp, #0x38]
 35e742c: 52800200     	mov	w0, #0x10               ; =16
 35e7430: 97289fce     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7434: b403d720     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7438: aa0003f5     	mov	x21, x0
 35e743c: 9100a3e1     	add	x1, sp, #0x28
