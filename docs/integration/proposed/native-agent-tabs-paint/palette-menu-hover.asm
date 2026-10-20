
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e8764: 7100029f     	cmp	w20, #0x0
 35e8768: 52814148     	mov	w8, #0xa0a              ; =2570
 35e876c: 72a28148     	movk	w8, #0x140a, lsl #16
 35e8770: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e8774: 72a35f49     	movk	w9, #0x1afa, lsl #16
 35e8778: 1a881135     	csel	w21, w9, w8, ne
 35e877c: 52800036     	mov	w22, #0x1               ; =1
 35e8780: 3900c3f6     	strb	w22, [sp, #0x30]
 35e8784: 52800500     	mov	w0, #0x28               ; =40
 35e8788: 97289af8     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e878c: b9000016     	str	w22, [x0]
 35e8790: f0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e8794: 91180108     	add	x8, x8, #0x600
 35e8798: a900a019     	stp	x25, x8, [x0, #0x8]
 35e879c: f9000c1a     	str	x26, [x0, #0x18]
 35e87a0: b9002415     	str	w21, [x0, #0x24]
 35e87a4: f90017e0     	str	x0, [sp, #0x28]
 35e87a8: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e87ac: f9001fff     	str	xzr, [sp, #0x38]
 35e87b0: 52800200     	mov	w0, #0x10               ; =16
 35e87b4: 97289aed     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e87b8: b4033b00     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e87bc: aa0003f5     	mov	x21, x0
 35e87c0: 9100a3e1     	add	x1, sp, #0x28
 35e87c4: 972c13e3     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e87c8: a943dff6     	ldp	x22, x23, [sp, #0x38]
 35e87cc: cb17101c     	sub	x28, x0, x23, lsl #4
 35e87d0: d37ceef8     	lsl	x24, x23, #4
 35e87d4: b5020bf8     	cbnz	x24, 0x35ec950 <_ChromeMain+0x35e76b4>
 35e87d8: cb1713e8     	neg	x8, x23, lsl #4
 35e87dc: 52800209     	mov	w9, #0x10               ; =16
 35e87e0: cb080128     	sub	x8, x9, x8
 35e87e4: 9344fd08     	asr	x8, x8, #4
 35e87e8: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e87ec: f94027e8     	ldr	x8, [sp, #0x48]
 35e87f0: 52800029     	mov	w9, #0x1                ; =1
 35e87f4: f90027e9     	str	x9, [sp, #0x48]
 35e87f8: b50314d6     	cbnz	x22, 0x35eea90 <_ChromeMain+0x35e97f4>
 35e87fc: 910042a8     	add	x8, x21, #0x10
 35e8800: eb1c0108     	subs	x8, x8, x28
 35e8804: 9344fd08     	asr	x8, x8, #4
 35e8808: f90023e8     	str	x8, [sp, #0x40]
 35e880c: 54033860     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8810: aa1303e0     	mov	x0, x19
 35e8814: 52801f01     	mov	w1, #0xf8               ; =248
 35e8818: 97353095     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e881c: 9100e3e1     	add	x1, sp, #0x38
 35e8820: 972e1dfc     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e8824: 9100e3e0     	add	x0, sp, #0x38
 35e8828: 972cc0fb     	bl	0x118c14 <_ChromeMain+0x113978>
