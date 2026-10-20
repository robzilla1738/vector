
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4688df0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4688df4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4688df8: 910043fd     	add	x29, sp, #0x10
 4688dfc: aa0003f3     	mov	x19, x0
 4688e00: 97265c5c     	bl	0x101ff70 <_ChromeMain+0x101acd4>
 4688e04: f8418c08     	ldr	x8, [x0, #0x18]!
 4688e08: b4000268     	cbz	x8, 0x4688e54 <_ChromeMain+0x4683bb8>
 4688e0c: b9458269     	ldr	w9, [x19, #0x580]
 4688e10: b940210a     	ldr	w10, [x8, #0x20]
 4688e14: 6b0a013f     	cmp	w9, w10
 4688e18: 540002eb     	b.lt	0x4688e74 <_ChromeMain+0x4683bd8>
 4688e1c: 5400032c     	b.gt	0x4688e80 <_ChromeMain+0x4683be4>
 4688e20: eb00011f     	cmp	x8, x0
 4688e24: 54000180     	b.eq	0x4688e54 <_ChromeMain+0x4683bb8>
 4688e28: f9401501     	ldr	x1, [x8, #0x28]
 4688e2c: b4000141     	cbz	x1, 0x4688e54 <_ChromeMain+0x4683bb8>
 4688e30: f942be68     	ldr	x8, [x19, #0x578]
 4688e34: b4000108     	cbz	x8, 0x4688e54 <_ChromeMain+0x4683bb8>
 4688e38: f9400100     	ldr	x0, [x8]
 4688e3c: 96f405bc     	bl	0x38a52c <_ChromeMain+0x385290>
 4688e40: aa0003e8     	mov	x8, x0
 4688e44: 3100051f     	cmn	w8, #0x1
 4688e48: 1a9f07e9     	cset	w9, ne
 4688e4c: 6a09003f     	tst	w1, w9
 4688e50: 54000081     	b.ne	0x4688e60 <_ChromeMain+0x4683bc4>
 4688e54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688e58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688e5c: d65f03c0     	ret
 4688e60: f942be60     	ldr	x0, [x19, #0x578]
 4688e64: aa0803e1     	mov	x1, x8
 4688e68: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4688e6c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4688e70: 14db27ec     	b	0x7d52e20 <_ChromeMain+0x7d4db84>
 4688e74: f9400108     	ldr	x8, [x8]
 4688e78: b5fffcc8     	cbnz	x8, 0x4688e10 <_ChromeMain+0x4683b74>
 4688e7c: 17fffff6     	b	0x4688e54 <_ChromeMain+0x4683bb8>
 4688e80: f9400508     	ldr	x8, [x8, #0x8]
 4688e84: b5fffc68     	cbnz	x8, 0x4688e10 <_ChromeMain+0x4683b74>
 4688e88: 17fffff3     	b	0x4688e54 <_ChromeMain+0x4683bb8>
