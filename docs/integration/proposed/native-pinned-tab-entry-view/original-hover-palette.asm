
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7c84: 12b4c008     	mov	w8, #0x59ffffff         ; =1509949439
 35e7c88: 12b98009     	mov	w9, #0x33ffffff         ; =872415231
 35e7c8c: 7100029f     	cmp	w20, #0x0
 35e7c90: 1a881135     	csel	w21, w9, w8, ne
 35e7c94: 52800036     	mov	w22, #0x1               ; =1
 35e7c98: 3900c3f6     	strb	w22, [sp, #0x30]
 35e7c9c: 52800500     	mov	w0, #0x28               ; =40
 35e7ca0: 97289db2     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7ca4: b9000016     	str	w22, [x0]
 35e7ca8: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7cac: 91180108     	add	x8, x8, #0x600
 35e7cb0: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7cb4: f9000c1a     	str	x26, [x0, #0x18]
 35e7cb8: b9002415     	str	w21, [x0, #0x24]
 35e7cbc: f90017e0     	str	x0, [sp, #0x28]
 35e7cc0: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7cc4: f9001fff     	str	xzr, [sp, #0x38]
 35e7cc8: 52800200     	mov	w0, #0x10               ; =16
 35e7ccc: 97289da7     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7cd0: b4039240     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7cd4: aa0003f5     	mov	x21, x0
 35e7cd8: 9100a3e1     	add	x1, sp, #0x28
 35e7cdc: 972c169d     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7ce0: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e7ce4: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7ce8: d37cef78     	lsl	x24, x27, #4
 35e7cec: b502e0f8     	cbnz	x24, 0x35ed908 <_ChromeMain+0x35e866c>
 35e7cf0: cb1b13e8     	neg	x8, x27, lsl #4
 35e7cf4: 52800209     	mov	w9, #0x10               ; =16
 35e7cf8: cb080128     	sub	x8, x9, x8
 35e7cfc: 9344fd08     	asr	x8, x8, #4
 35e7d00: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e7d04: f94027e8     	ldr	x8, [sp, #0x48]
 35e7d08: 52800029     	mov	w9, #0x1                ; =1
 35e7d0c: f90027e9     	str	x9, [sp, #0x48]
 35e7d10: b5036356     	cbnz	x22, 0x35ee978 <_ChromeMain+0x35e96dc>
 35e7d14: 910042a8     	add	x8, x21, #0x10
 35e7d18: eb1c0108     	subs	x8, x8, x28
 35e7d1c: 9344fd08     	asr	x8, x8, #4
 35e7d20: f90023e8     	str	x8, [sp, #0x40]
 35e7d24: 54038fa0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7d28: aa1303e0     	mov	x0, x19
 35e7d2c: 52801d21     	mov	w1, #0xe9               ; =233
 35e7d30: 9735334f     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7d34: 9100e3e1     	add	x1, sp, #0x38
 35e7d38: 972e20b6     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7d3c: 9100e3e0     	add	x0, sp, #0x38
 35e7d40: 972cc3b5     	bl	0x118c14 <_ChromeMain+0x113978>
