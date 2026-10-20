
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7e10: 7100029f     	cmp	w20, #0x0
 35e7e14: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e7e18: 72a4df48     	movk	w8, #0x26fa, lsl #16
 35e7e1c: 52814149     	mov	w9, #0xa0a              ; =2570
 35e7e20: 72a4c149     	movk	w9, #0x260a, lsl #16
 35e7e24: 1a891115     	csel	w21, w8, w9, ne
 35e7e28: 52800036     	mov	w22, #0x1               ; =1
 35e7e2c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e7e30: 52800500     	mov	w0, #0x28               ; =40
 35e7e34: 97289d4d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7e38: b9000016     	str	w22, [x0]
 35e7e3c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7e40: 91180108     	add	x8, x8, #0x600
 35e7e44: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7e48: f9000c1a     	str	x26, [x0, #0x18]
 35e7e4c: b9002415     	str	w21, [x0, #0x24]
 35e7e50: f90017e0     	str	x0, [sp, #0x28]
 35e7e54: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7e58: f9001fff     	str	xzr, [sp, #0x38]
 35e7e5c: 52800200     	mov	w0, #0x10               ; =16
 35e7e60: 97289d42     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7e64: b40385a0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7e68: aa0003f5     	mov	x21, x0
 35e7e6c: 9100a3e1     	add	x1, sp, #0x28
 35e7e70: 972c1638     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7e74: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e7e78: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7e7c: d37cef78     	lsl	x24, x27, #4
 35e7e80: b5023178     	cbnz	x24, 0x35ec4ac <_ChromeMain+0x35e7210>
 35e7e84: cb1b13e8     	neg	x8, x27, lsl #4
 35e7e88: 52800209     	mov	w9, #0x10               ; =16
 35e7e8c: cb080128     	sub	x8, x9, x8
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
