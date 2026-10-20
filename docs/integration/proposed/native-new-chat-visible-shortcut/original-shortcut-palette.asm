
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7720: b9000bfb     	str	w27, [sp, #0x8]
 35e7724: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7728: 72ae6148     	movk	w8, #0x730a, lsl #16
 35e772c: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e7730: 72ae7f49     	movk	w9, #0x73fa, lsl #16
 35e7734: 7100029f     	cmp	w20, #0x0
 35e7738: 1a881137     	csel	w23, w9, w8, ne
 35e773c: 52800035     	mov	w21, #0x1               ; =1
 35e7740: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7744: 52800500     	mov	w0, #0x28               ; =40
 35e7748: 97289f08     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e774c: b9000015     	str	w21, [x0]
 35e7750: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7754: 91180108     	add	x8, x8, #0x600
 35e7758: a900a019     	stp	x25, x8, [x0, #0x8]
 35e775c: f9000c1a     	str	x26, [x0, #0x18]
 35e7760: b9002417     	str	w23, [x0, #0x24]
 35e7764: f90017e0     	str	x0, [sp, #0x28]
 35e7768: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e776c: f9001fff     	str	xzr, [sp, #0x38]
 35e7770: 52800200     	mov	w0, #0x10               ; =16
 35e7774: 97289efd     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7778: b403bd00     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e777c: aa0003f5     	mov	x21, x0
 35e7780: 9100a3e1     	add	x1, sp, #0x28
 35e7784: 972c17f3     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7788: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e778c: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7790: d37cef78     	lsl	x24, x27, #4
 35e7794: b502f258     	cbnz	x24, 0x35ed5dc <_ChromeMain+0x35e8340>
 35e7798: cb1b13e8     	neg	x8, x27, lsl #4
 35e779c: 52800209     	mov	w9, #0x10               ; =16
 35e77a0: cb080128     	sub	x8, x9, x8
 35e77a4: 9344fd08     	asr	x8, x8, #4
 35e77a8: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e77ac: f94027e8     	ldr	x8, [sp, #0x48]
 35e77b0: 52800029     	mov	w9, #0x1                ; =1
 35e77b4: f90027e9     	str	x9, [sp, #0x48]
 35e77b8: b50389b6     	cbnz	x22, 0x35ee8ec <_ChromeMain+0x35e9650>
 35e77bc: 910042a8     	add	x8, x21, #0x10
 35e77c0: eb1c0108     	subs	x8, x8, x28
 35e77c4: 9344fd08     	asr	x8, x8, #4
 35e77c8: f90023e8     	str	x8, [sp, #0x40]
 35e77cc: 5403ba60     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e77d0: aa1303e0     	mov	x0, x19
 35e77d4: 52801c41     	mov	w1, #0xe2               ; =226
 35e77d8: 973534a5     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e77dc: 9100e3e1     	add	x1, sp, #0x38
 35e77e0: 972e220c     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e77e4: 9100e3e0     	add	x0, sp, #0x38
 35e77e8: 972cc50b     	bl	0x118c14 <_ChromeMain+0x113978>
