
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e9924: 52946956     	mov	w22, #0xa34a            ; =41802
 35e9928: 72bfe2d6     	movk	w22, #0xff16, lsl #16
 35e992c: 52800035     	mov	w21, #0x1               ; =1
 35e9930: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9934: 52800500     	mov	w0, #0x28               ; =40
 35e9938: 9728968c     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e993c: b9000015     	str	w21, [x0]
 35e9940: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9944: 91180108     	add	x8, x8, #0x600
 35e9948: a900a019     	stp	x25, x8, [x0, #0x8]
 35e994c: f9000c1a     	str	x26, [x0, #0x18]
 35e9950: b9002416     	str	w22, [x0, #0x24]
 35e9954: f90017e0     	str	x0, [sp, #0x28]
 35e9958: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e995c: f9001fff     	str	xzr, [sp, #0x38]
 35e9960: 52800200     	mov	w0, #0x10               ; =16
 35e9964: 97289681     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9968: b402ad80     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e996c: aa0003f5     	mov	x21, x0
 35e9970: 9100a3e1     	add	x1, sp, #0x28
 35e9974: 972c0f77     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9978: a943dff6     	ldp	x22, x23, [sp, #0x38]
 35e997c: cb17101b     	sub	x27, x0, x23, lsl #4
 35e9980: d37ceef8     	lsl	x24, x23, #4
 35e9984: b5018f58     	cbnz	x24, 0x35ecb6c <_ChromeMain+0x35e78d0>
 35e9988: cb1713e8     	neg	x8, x23, lsl #4
 35e998c: 52800209     	mov	w9, #0x10               ; =16
 35e9990: cb080128     	sub	x8, x9, x8
 35e9994: 9344fd08     	asr	x8, x8, #4
 35e9998: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e999c: f94027e8     	ldr	x8, [sp, #0x48]
 35e99a0: 52800029     	mov	w9, #0x1                ; =1
 35e99a4: f90027e9     	str	x9, [sp, #0x48]
 35e99a8: b50295b6     	cbnz	x22, 0x35eec5c <_ChromeMain+0x35e99c0>
 35e99ac: 910042a8     	add	x8, x21, #0x10
 35e99b0: eb1b0108     	subs	x8, x8, x27
 35e99b4: 9344fd08     	asr	x8, x8, #4
 35e99b8: f90023e8     	str	x8, [sp, #0x40]
 35e99bc: 5402aae0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e99c0: aa1303e0     	mov	x0, x19
 35e99c4: 528021c1     	mov	w1, #0x10e              ; =270
 35e99c8: 97352c29     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e99cc: 9100e3e1     	add	x1, sp, #0x38
 35e99d0: 972e1990     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e99d4: 9100e3e0     	add	x0, sp, #0x38
 35e99d8: 972cbc8f     	bl	0x118c14 <_ChromeMain+0x113978>
 35e99dc: f94017e0     	ldr	x0, [sp, #0x28]
