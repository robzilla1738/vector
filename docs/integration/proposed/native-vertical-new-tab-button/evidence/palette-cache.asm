
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
