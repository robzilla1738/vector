
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e8dc8: 7100029f     	cmp	w20, #0x0
 35e8dcc: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e8dd0: 72bfff48     	movk	w8, #0xfffa, lsl #16
 35e8dd4: 1a8812b5     	csel	w21, w21, w8, ne
 35e8dd8: 52800036     	mov	w22, #0x1               ; =1
 35e8ddc: 3900c3f6     	strb	w22, [sp, #0x30]
 35e8de0: 52800500     	mov	w0, #0x28               ; =40
 35e8de4: 97289961     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e8de8: b9000016     	str	w22, [x0]
 35e8dec: f0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e8df0: 91180108     	add	x8, x8, #0x600
 35e8df4: a900a019     	stp	x25, x8, [x0, #0x8]
 35e8df8: f9000c1a     	str	x26, [x0, #0x18]
 35e8dfc: b9002415     	str	w21, [x0, #0x24]
 35e8e00: f90017e0     	str	x0, [sp, #0x28]
 35e8e04: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e8e08: f9001fff     	str	xzr, [sp, #0x38]
 35e8e0c: 52800200     	mov	w0, #0x10               ; =16
 35e8e10: 97289956     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e8e14: b4030820     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8e18: aa0003f5     	mov	x21, x0
 35e8e1c: 9100a3e1     	add	x1, sp, #0x28
 35e8e20: 972c124c     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e8e24: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e8e28: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e8e2c: d37cef98     	lsl	x24, x28, #4
 35e8e30: b5027038     	cbnz	x24, 0x35edc34 <_ChromeMain+0x35e8998>
 35e8e34: cb1c13e8     	neg	x8, x28, lsl #4
 35e8e38: 52800209     	mov	w9, #0x10               ; =16
 35e8e3c: cb080128     	sub	x8, x9, x8
 35e8e40: 9344fd08     	asr	x8, x8, #4
 35e8e44: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e8e48: f94027e8     	ldr	x8, [sp, #0x48]
 35e8e4c: 52800029     	mov	w9, #0x1                ; =1
 35e8e50: f90027e9     	str	x9, [sp, #0x48]
 35e8e54: b502e6f6     	cbnz	x22, 0x35eeb30 <_ChromeMain+0x35e9894>
 35e8e58: 910042a8     	add	x8, x21, #0x10
 35e8e5c: eb1b0108     	subs	x8, x8, x27
 35e8e60: 9344fd08     	asr	x8, x8, #4
 35e8e64: f90023e8     	str	x8, [sp, #0x40]
 35e8e68: 54030580     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8e6c: aa1303e0     	mov	x0, x19
 35e8e70: 52802001     	mov	w1, #0x100              ; =256
 35e8e74: 97352efe     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e8e78: 9100e3e1     	add	x1, sp, #0x38
 35e8e7c: 972e1c65     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e8e80: 9100e3e0     	add	x0, sp, #0x38
 35e8e84: 972cbf64     	bl	0x118c14 <_ChromeMain+0x113978>
 35e8e88: f94017e0     	ldr	x0, [sp, #0x28]
 35e8e8c: b50165a0     	cbnz	x0, 0x35ebb40 <_ChromeMain+0x35e68a4>
