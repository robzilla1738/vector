
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7a54: 52800035     	mov	w21, #0x1               ; =1
 35e7a58: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7a5c: 52800500     	mov	w0, #0x28               ; =40
 35e7a60: 97289e42     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7a64: b9000015     	str	w21, [x0]
 35e7a68: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7a6c: 91180108     	add	x8, x8, #0x600
 35e7a70: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7a74: f9000c1a     	str	x26, [x0, #0x18]
 35e7a78: 52a34008     	mov	w8, #0x1a000000         ; =436207616
 35e7a7c: b9002408     	str	w8, [x0, #0x24]
 35e7a80: f90017e0     	str	x0, [sp, #0x28]
 35e7a84: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7a88: f9001fff     	str	xzr, [sp, #0x38]
 35e7a8c: 52800200     	mov	w0, #0x10               ; =16
 35e7a90: 97289e36     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7a94: b403a420     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7a98: aa0003f5     	mov	x21, x0
 35e7a9c: 9100a3e1     	add	x1, sp, #0x28
 35e7aa0: 972c172c     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7aa4: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e7aa8: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7aac: d37cef78     	lsl	x24, x27, #4
 35e7ab0: b502e7f8     	cbnz	x24, 0x35ed7ac <_ChromeMain+0x35e8510>
 35e7ab4: cb1b13e8     	neg	x8, x27, lsl #4
 35e7ab8: 52800209     	mov	w9, #0x10               ; =16
 35e7abc: cb080128     	sub	x8, x9, x8
 35e7ac0: 9344fd08     	asr	x8, x8, #4
 35e7ac4: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e7ac8: f94027e8     	ldr	x8, [sp, #0x48]
 35e7acc: 52800029     	mov	w9, #0x1                ; =1
 35e7ad0: f90027e9     	str	x9, [sp, #0x48]
 35e7ad4: b5037356     	cbnz	x22, 0x35ee93c <_ChromeMain+0x35e96a0>
 35e7ad8: 910042a8     	add	x8, x21, #0x10
 35e7adc: eb1c0108     	subs	x8, x8, x28
 35e7ae0: 9344fd08     	asr	x8, x8, #4
 35e7ae4: f90023e8     	str	x8, [sp, #0x40]
 35e7ae8: 5403a180     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7aec: aa1303e0     	mov	x0, x19
 35e7af0: 52801cc1     	mov	w1, #0xe6               ; =230
 35e7af4: 973533de     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7af8: 9100e3e1     	add	x1, sp, #0x38
 35e7afc: 972e2145     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7b00: 9100e3e0     	add	x0, sp, #0x38
 35e7b04: 972cc444     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7b08: f94017e0     	ldr	x0, [sp, #0x28]
 35e7b0c: b501ebc0     	cbnz	x0, 0x35eb884 <_ChromeMain+0x35e65e8>
