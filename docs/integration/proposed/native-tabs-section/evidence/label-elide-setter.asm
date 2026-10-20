
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  5a0d40: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
  5a0d44: a9017bfd     	stp	x29, x30, [sp, #0x10]
  5a0d48: 910043fd     	add	x29, sp, #0x10
  5a0d4c: b943b008     	ldr	w8, [x0, #0x3b0]
  5a0d50: 6b01011f     	cmp	w8, w1
  5a0d54: 54000081     	b.ne	0x5a0d64 <_ChromeMain+0x59bac8>
  5a0d58: a9417bfd     	ldp	x29, x30, [sp, #0x10]
  5a0d5c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
  5a0d60: d65f03c0     	ret
  5a0d64: aa0003f3     	mov	x19, x0
  5a0d68: b903b001     	str	w1, [x0, #0x3b0]
  5a0d6c: f941ac08     	ldr	x8, [x0, #0x358]
  5a0d70: b943e409     	ldr	w9, [x0, #0x3e4]
  5a0d74: 7100013f     	cmp	w9, #0x0
  5a0d78: 1a9fc029     	csel	w9, w1, wzr, gt
  5a0d7c: b943e90a     	ldr	w10, [x8, #0x3e8]
  5a0d80: 6b09015f     	cmp	w10, w9
  5a0d84: 54000181     	b.ne	0x5a0db4 <_ChromeMain+0x59bb18>
  5a0d88: f941b260     	ldr	x0, [x19, #0x360]
  5a0d8c: b50002a0     	cbnz	x0, 0x5a0de0 <_ChromeMain+0x59bb44>
  5a0d90: aa1303e0     	mov	x0, x19
  5a0d94: 52800061     	mov	w1, #0x3                ; =3
  5a0d98: 940902f3     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
  5a0d9c: 9103e260     	add	x0, x19, #0xf8
  5a0da0: 910ec261     	add	x1, x19, #0x3b0
  5a0da4: 94261c8b     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
  5a0da8: f9422a68     	ldr	x8, [x19, #0x450]
  5a0dac: b4fffd68     	cbz	x8, 0x5a0d58 <_ChromeMain+0x59babc>
  5a0db0: 14000015     	b	0x5a0e04 <_ChromeMain+0x59bb68>
  5a0db4: b903e909     	str	w9, [x8, #0x3e8]
  5a0db8: 39530109     	ldrb	w9, [x8, #0x4c0]
  5a0dbc: 321e0129     	orr	w9, w9, #0x4
  5a0dc0: 39130109     	strb	w9, [x8, #0x4c0]
  5a0dc4: f9422500     	ldr	x0, [x8, #0x448]
  5a0dc8: f902251f     	str	xzr, [x8, #0x448]
