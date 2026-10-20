
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e9868: 52800035     	mov	w21, #0x1               ; =1
 35e986c: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9870: 52800500     	mov	w0, #0x28               ; =40
 35e9874: 972896bd     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9878: b9000015     	str	w21, [x0]
 35e987c: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9880: 91180108     	add	x8, x8, #0x600
 35e9884: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9888: f9000c1a     	str	x26, [x0, #0x18]
 35e988c: b94023e8     	ldr	w8, [sp, #0x20]
 35e9890: b9002408     	str	w8, [x0, #0x24]
 35e9894: f90017e0     	str	x0, [sp, #0x28]
 35e9898: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e989c: f9001fff     	str	xzr, [sp, #0x38]
 35e98a0: 52800200     	mov	w0, #0x10               ; =16
 35e98a4: 972896b1     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e98a8: b402b380     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e98ac: aa0003f5     	mov	x21, x0
 35e98b0: 9100a3e1     	add	x1, sp, #0x28
 35e98b4: 972c0fa7     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e98b8: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e98bc: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e98c0: d37cef98     	lsl	x24, x28, #4
 35e98c4: b50191f8     	cbnz	x24, 0x35ecb00 <_ChromeMain+0x35e7864>
 35e98c8: cb1c13e8     	neg	x8, x28, lsl #4
 35e98cc: 52800209     	mov	w9, #0x10               ; =16
 35e98d0: cb080128     	sub	x8, x9, x8
 35e98d4: 9344fd08     	asr	x8, x8, #4
 35e98d8: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e98dc: f94027e8     	ldr	x8, [sp, #0x48]
 35e98e0: 52800029     	mov	w9, #0x1                ; =1
 35e98e4: f90027e9     	str	x9, [sp, #0x48]
 35e98e8: b5029b16     	cbnz	x22, 0x35eec48 <_ChromeMain+0x35e99ac>
 35e98ec: 910042a8     	add	x8, x21, #0x10
 35e98f0: eb1b0108     	subs	x8, x8, x27
 35e98f4: 9344fd08     	asr	x8, x8, #4
 35e98f8: f90023e8     	str	x8, [sp, #0x40]
 35e98fc: 5402b0e0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9900: aa1303e0     	mov	x0, x19
 35e9904: 528021a1     	mov	w1, #0x10d              ; =269
 35e9908: 97352c59     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e990c: 9100e3e1     	add	x1, sp, #0x38
 35e9910: 972e19c0     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9914: 9100e3e0     	add	x0, sp, #0x38
 35e9918: 972cbcbf     	bl	0x118c14 <_ChromeMain+0x113978>
