
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e8f60: 52800035     	mov	w21, #0x1               ; =1
 35e8f64: 3900c3f5     	strb	w21, [sp, #0x30]
 35e8f68: 52800500     	mov	w0, #0x28               ; =40
 35e8f6c: 972898ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e8f70: b9000015     	str	w21, [x0]
 35e8f74: f0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e8f78: 91180108     	add	x8, x8, #0x600
 35e8f7c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e8f80: f9000c1a     	str	x26, [x0, #0x18]
 35e8f84: b94023e8     	ldr	w8, [sp, #0x20]
 35e8f88: b9002408     	str	w8, [x0, #0x24]
 35e8f8c: f90017e0     	str	x0, [sp, #0x28]
 35e8f90: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e8f94: f9001fff     	str	xzr, [sp, #0x38]
 35e8f98: 52800200     	mov	w0, #0x10               ; =16
 35e8f9c: 972898f3     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e8fa0: b402fbc0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8fa4: aa0003f5     	mov	x21, x0
 35e8fa8: 9100a3e1     	add	x1, sp, #0x28
 35e8fac: 972c11e9     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e8fb0: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e8fb4: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e8fb8: d37cef98     	lsl	x24, x28, #4
 35e8fbc: b5026b18     	cbnz	x24, 0x35edd1c <_ChromeMain+0x35e8a80>
 35e8fc0: cb1c13e8     	neg	x8, x28, lsl #4
 35e8fc4: 52800209     	mov	w9, #0x10               ; =16
 35e8fc8: cb080128     	sub	x8, x9, x8
 35e8fcc: 9344fd08     	asr	x8, x8, #4
 35e8fd0: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e8fd4: f94027e8     	ldr	x8, [sp, #0x48]
 35e8fd8: 52800029     	mov	w9, #0x1                ; =1
 35e8fdc: f90027e9     	str	x9, [sp, #0x48]
 35e8fe0: b502dbd6     	cbnz	x22, 0x35eeb58 <_ChromeMain+0x35e98bc>
 35e8fe4: 910042a8     	add	x8, x21, #0x10
 35e8fe8: eb1b0108     	subs	x8, x8, x27
 35e8fec: 9344fd08     	asr	x8, x8, #4
 35e8ff0: f90023e8     	str	x8, [sp, #0x40]
 35e8ff4: 5402f920     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e8ff8: aa1303e0     	mov	x0, x19
 35e8ffc: 52802041     	mov	w1, #0x102              ; =258
 35e9000: 97352e9b     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9004: 9100e3e1     	add	x1, sp, #0x38
 35e9008: 972e1c02     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e900c: 9100e3e0     	add	x0, sp, #0x38
 35e9010: 972cbf01     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9014: f94017e0     	ldr	x0, [sp, #0x28]
 35e9018: b5015b00     	cbnz	x0, 0x35ebb78 <_ChromeMain+0x35e68dc>
