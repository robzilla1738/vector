
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7e90: 9344fd08     	asr	x8, x8, #4
 35e7e94: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e7e98: f94027e8     	ldr	x8, [sp, #0x48]
 35e7e9c: 52800029     	mov	w9, #0x1                ; =1
 35e7ea0: f90027e9     	str	x9, [sp, #0x48]
 35e7ea4: b50357f6     	cbnz	x22, 0x35ee9a0 <_ChromeMain+0x35e9704>
 35e7ea8: 910042a8     	add	x8, x21, #0x10
 35e7eac: eb1c0108     	subs	x8, x8, x28
 35e7eb0: 9344fd08     	asr	x8, x8, #4
 35e7eb4: f90023e8     	str	x8, [sp, #0x40]
 35e7eb8: b9400bf6     	ldr	w22, [sp, #0x8]
 35e7ebc: 540382e0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7ec0: aa1303e0     	mov	x0, x19
 35e7ec4: 52801d61     	mov	w1, #0xeb               ; =235
 35e7ec8: 973532e9     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7ecc: 9100e3e1     	add	x1, sp, #0x38
 35e7ed0: 972e2050     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7ed4: 9100e3e0     	add	x0, sp, #0x38
 35e7ed8: 972cc34f     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7edc: f94017e0     	ldr	x0, [sp, #0x28]
 35e7ee0: b501d180     	cbnz	x0, 0x35eb910 <_ChromeMain+0x35e6674>
 35e7ee4: 52800035     	mov	w21, #0x1               ; =1
 35e7ee8: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7eec: 52800500     	mov	w0, #0x28               ; =40
 35e7ef0: 97289d1e     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7ef4: b9000015     	str	w21, [x0]
 35e7ef8: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7efc: 91180108     	add	x8, x8, #0x600
 35e7f00: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7f04: f9000c1a     	str	x26, [x0, #0x18]
 35e7f08: b9002416     	str	w22, [x0, #0x24]
 35e7f0c: f90017e0     	str	x0, [sp, #0x28]
 35e7f10: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7f14: f9001fff     	str	xzr, [sp, #0x38]
 35e7f18: 52800200     	mov	w0, #0x10               ; =16
 35e7f1c: 97289d13     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7f20: b4037fc0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7f24: aa0003f5     	mov	x21, x0
 35e7f28: 9100a3e1     	add	x1, sp, #0x28
 35e7f2c: 972c1609     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7f30: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e7f34: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e7f38: d37cef98     	lsl	x24, x28, #4
 35e7f3c: b5022ef8     	cbnz	x24, 0x35ec518 <_ChromeMain+0x35e727c>
 35e7f40: cb1c13e8     	neg	x8, x28, lsl #4
 35e7f44: 52800209     	mov	w9, #0x10               ; =16
 35e7f48: cb080128     	sub	x8, x9, x8
 35e7f4c: 9344fd08     	asr	x8, x8, #4
 35e7f50: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e7f54: f94027e8     	ldr	x8, [sp, #0x48]
 35e7f58: 52800029     	mov	w9, #0x1                ; =1
 35e7f5c: f90027e9     	str	x9, [sp, #0x48]
 35e7f60: b50352b6     	cbnz	x22, 0x35ee9b4 <_ChromeMain+0x35e9718>
 35e7f64: 910042a8     	add	x8, x21, #0x10
 35e7f68: eb1b0108     	subs	x8, x8, x27
 35e7f6c: 9344fd08     	asr	x8, x8, #4
 35e7f70: f90023e8     	str	x8, [sp, #0x40]
 35e7f74: 54037d20     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7f78: aa1303e0     	mov	x0, x19
 35e7f7c: 52801d81     	mov	w1, #0xec               ; =236
 35e7f80: 973532bb     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7f84: 9100e3e1     	add	x1, sp, #0x38
 35e7f88: 972e2022     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7f8c: 9100e3e0     	add	x0, sp, #0x38
 35e7f90: 972cc321     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7f94: f94017e0     	ldr	x0, [sp, #0x28]
 35e7f98: b501cca0     	cbnz	x0, 0x35eb92c <_ChromeMain+0x35e6690>
 35e7f9c: 12afe008     	mov	w8, #-0x7f000001        ; =-2130706433
