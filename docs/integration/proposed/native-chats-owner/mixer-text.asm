
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7650: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7654: 72b70148     	movk	w8, #0xb80a, lsl #16
 35e7658: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e765c: 72b4df49     	movk	w9, #0xa6fa, lsl #16
 35e7660: 7100029f     	cmp	w20, #0x0
 35e7664: 1a881135     	csel	w21, w9, w8, ne
 35e7668: 52800036     	mov	w22, #0x1               ; =1
 35e766c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e7670: 52800500     	mov	w0, #0x28               ; =40
 35e7674: 97289f3d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7678: b9000016     	str	w22, [x0]
 35e767c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7680: 91180108     	add	x8, x8, #0x600
 35e7684: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7688: f9000c1a     	str	x26, [x0, #0x18]
 35e768c: b9002415     	str	w21, [x0, #0x24]
 35e7690: f90017e0     	str	x0, [sp, #0x28]
 35e7694: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7698: f9001fff     	str	xzr, [sp, #0x38]
 35e769c: 52800200     	mov	w0, #0x10               ; =16
 35e76a0: 97289f32     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e76a4: b403c3a0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e76a8: aa0003f5     	mov	x21, x0
 35e76ac: 9100a3e1     	add	x1, sp, #0x28
 35e76b0: 972c1828     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e76b4: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e76b8: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e76bc: d37cef98     	lsl	x24, x28, #4
 35e76c0: b502f558     	cbnz	x24, 0x35ed568 <_ChromeMain+0x35e82cc>
 35e76c4: cb1c13e8     	neg	x8, x28, lsl #4
 35e76c8: 52800209     	mov	w9, #0x10               ; =16
 35e76cc: cb080128     	sub	x8, x9, x8
 35e76d0: 9344fd08     	asr	x8, x8, #4
 35e76d4: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e76d8: f94027e8     	ldr	x8, [sp, #0x48]
 35e76dc: 52800029     	mov	w9, #0x1                ; =1
 35e76e0: f90027e9     	str	x9, [sp, #0x48]
 35e76e4: b5038fb6     	cbnz	x22, 0x35ee8d8 <_ChromeMain+0x35e963c>
 35e76e8: 910042a8     	add	x8, x21, #0x10
 35e76ec: eb170108     	subs	x8, x8, x23
 35e76f0: 9344fd08     	asr	x8, x8, #4
 35e76f4: f90023e8     	str	x8, [sp, #0x40]
 35e76f8: 5403c100     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e76fc: aa1303e0     	mov	x0, x19
 35e7700: 52801c21     	mov	w1, #0xe1               ; =225
 35e7704: 973534da     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7708: 9100e3e1     	add	x1, sp, #0x38
 35e770c: 972e2241     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7710: 9100e3e0     	add	x0, sp, #0x38
 35e7714: 972cc540     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7718: f94017e0     	ldr	x0, [sp, #0x28]
 35e771c: b50206e0     	cbnz	x0, 0x35eb7f8 <_ChromeMain+0x35e655c>
 35e7720: b9000bfb     	str	w27, [sp, #0x8]
