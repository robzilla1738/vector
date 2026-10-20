
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7b10: 52800035     	mov	w21, #0x1               ; =1
 35e7b14: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7b18: 52800500     	mov	w0, #0x28               ; =40
 35e7b1c: 97289e13     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7b20: b9000015     	str	w21, [x0]
 35e7b24: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7b28: 91180108     	add	x8, x8, #0x600
 35e7b2c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7b30: f9000c1a     	str	x26, [x0, #0x18]
 35e7b34: 52a1a008     	mov	w8, #0xd000000          ; =218103808
 35e7b38: b9002408     	str	w8, [x0, #0x24]
 35e7b3c: f90017e0     	str	x0, [sp, #0x28]
 35e7b40: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7b44: f9001fff     	str	xzr, [sp, #0x38]
 35e7b48: 52800200     	mov	w0, #0x10               ; =16
 35e7b4c: 97289e07     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7b50: b4039e40     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7b54: aa0003f5     	mov	x21, x0
 35e7b58: 9100a3e1     	add	x1, sp, #0x28
 35e7b5c: 972c16fd     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7b60: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e7b64: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7b68: d37cef78     	lsl	x24, x27, #4
 35e7b6c: b502e5b8     	cbnz	x24, 0x35ed820 <_ChromeMain+0x35e8584>
 35e7b70: cb1b13e8     	neg	x8, x27, lsl #4
 35e7b74: 52800209     	mov	w9, #0x10               ; =16
 35e7b78: cb080128     	sub	x8, x9, x8
 35e7b7c: 9344fd08     	asr	x8, x8, #4
 35e7b80: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e7b84: f94027e8     	ldr	x8, [sp, #0x48]
 35e7b88: 52800029     	mov	w9, #0x1                ; =1
 35e7b8c: f90027e9     	str	x9, [sp, #0x48]
 35e7b90: b5036e16     	cbnz	x22, 0x35ee950 <_ChromeMain+0x35e96b4>
 35e7b94: 910042a8     	add	x8, x21, #0x10
 35e7b98: eb1c0108     	subs	x8, x8, x28
 35e7b9c: 9344fd08     	asr	x8, x8, #4
 35e7ba0: f90023e8     	str	x8, [sp, #0x40]
 35e7ba4: 54039ba0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7ba8: aa1303e0     	mov	x0, x19
 35e7bac: 52801ce1     	mov	w1, #0xe7               ; =231
