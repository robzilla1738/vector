
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 15dae48: d10243ff     	sub	sp, sp, #0x90
 15dae4c: a90657f6     	stp	x22, x21, [sp, #0x60]
 15dae50: a9074ff4     	stp	x20, x19, [sp, #0x70]
 15dae54: a9087bfd     	stp	x29, x30, [sp, #0x80]
 15dae58: 910203fd     	add	x29, sp, #0x80
 15dae5c: aa0203f3     	mov	x19, x2
 15dae60: aa0103f4     	mov	x20, x1
 15dae64: f9402408     	ldr	x8, [x0, #0x48]
 15dae68: b4000ae8     	cbz	x8, 0x15dafc4 <_ChromeMain+0x15d5d28>
 15dae6c: f8438c09     	ldr	x9, [x0, #0x38]!
 15dae70: d1006008     	sub	x8, x0, #0x18
 15dae74: a903a3e0     	stp	x0, x8, [sp, #0x38]
 15dae78: f9001be9     	str	x9, [sp, #0x30]
 15dae7c: 9100c3ea     	add	x10, sp, #0x30
 15dae80: f900052a     	str	x10, [x9, #0x8]
 15dae84: f900000a     	str	x10, [x0]
 15dae88: b9401809     	ldr	w9, [x0, #0x18]
 15dae8c: f85f000b     	ldur	x11, [x0, #-0x10]
 15dae90: 7100013f     	cmp	w9, #0x0
 15dae94: da9f116a     	csinv	x10, x11, xzr, ne
 15dae98: a904abff     	stp	xzr, x10, [sp, #0x48]
 15dae9c: d2800009     	mov	x9, #0x0                ; =0
 15daea0: b40000cb     	cbz	x11, 0x15daeb8 <_ChromeMain+0x15d5c1c>
 15daea4: f940010c     	ldr	x12, [x8]
 15daea8: eb0b013f     	cmp	x9, x11
 15daeac: 54000722     	b.hs	0x15daf90 <_ChromeMain+0x15d5cf4>
 15daeb0: f869798d     	ldr	x13, [x12, x9, lsl #3]
 15daeb4: b40007cd     	cbz	x13, 0x15dafac <_ChromeMain+0x15d5d10>
 15daeb8: f90013ff     	str	xzr, [sp, #0x20]
 15daebc: 6f00e400     	movi.2d	v0, #0000000000000000
 15daec0: ad0003e0     	stp	q0, q0, [sp]
 15daec4: b4000548     	cbz	x8, 0x15daf6c <_ChromeMain+0x15d5cd0>
 15daec8: f940050b     	ldr	x11, [x8, #0x8]
 15daecc: eb0a017f     	cmp	x11, x10
 15daed0: 9a8a316a     	csel	x10, x11, x10, lo
 15daed4: eb0a013f     	cmp	x9, x10
 15daed8: 540004a0     	b.eq	0x15daf6c <_ChromeMain+0x15d5cd0>
 15daedc: 90ff51d5     	adrp	x21, 0x12000 <_ChromeMain+0xcd64>
 15daee0: 913702b5     	add	x21, x21, #0xdc0
 15daee4: 14000019     	b	0x15daf48 <_ChromeMain+0x15d5cac>
 15daee8: aa1403e1     	mov	x1, x20
 15daeec: aa1303e2     	mov	x2, x19
 15daef0: d63f0120     	blr	x9
 15daef4: f94023e8     	ldr	x8, [sp, #0x40]
 15daef8: b40003a8     	cbz	x8, 0x15daf6c <_ChromeMain+0x15d5cd0>
 15daefc: a944abe9     	ldp	x9, x10, [sp, #0x48]
 15daf00: 91000529     	add	x9, x9, #0x1
 15daf04: f90027e9     	str	x9, [sp, #0x48]
 15daf08: f940050b     	ldr	x11, [x8, #0x8]
 15daf0c: eb0a017f     	cmp	x11, x10
 15daf10: 9a8a316b     	csel	x11, x11, x10, lo
 15daf14: eb0b013f     	cmp	x9, x11
 15daf18: 540000e2     	b.hs	0x15daf34 <_ChromeMain+0x15d5c98>
 15daf1c: f940050c     	ldr	x12, [x8, #0x8]
 15daf20: eb0c013f     	cmp	x9, x12
 15daf24: 54000362     	b.hs	0x15daf90 <_ChromeMain+0x15d5cf4>
 15daf28: f940010c     	ldr	x12, [x8]
 15daf2c: f869798c     	ldr	x12, [x12, x9, lsl #3]
 15daf30: b400032c     	cbz	x12, 0x15daf94 <_ChromeMain+0x15d5cf8>
 15daf34: f940050b     	ldr	x11, [x8, #0x8]
 15daf38: eb0a017f     	cmp	x11, x10
 15daf3c: 9a8a316a     	csel	x10, x11, x10, lo
 15daf40: eb0a013f     	cmp	x9, x10
 15daf44: 54000140     	b.eq	0x15daf6c <_ChromeMain+0x15d5cd0>
 15daf48: eb0b013f     	cmp	x9, x11
 15daf4c: 54000222     	b.hs	0x15daf90 <_ChromeMain+0x15d5cf4>
 15daf50: f940010a     	ldr	x10, [x8]
 15daf54: f8697940     	ldr	x0, [x10, x9, lsl #3]
 15daf58: f9400009     	ldr	x9, [x0]
 15daf5c: f9401129     	ldr	x9, [x9, #0x20]
 15daf60: eb15013f     	cmp	x9, x21
 15daf64: 54fffca0     	b.eq	0x15daef8 <_ChromeMain+0x15d5c5c>
 15daf68: 17ffffe0     	b	0x15daee8 <_ChromeMain+0x15d5c4c>
 15daf6c: 910003e0     	mov	x0, sp
 15daf70: 9400001c     	bl	0x15dafe0 <_ChromeMain+0x15d5d44>
 15daf74: 9100c3e0     	add	x0, sp, #0x30
 15daf78: 9400001a     	bl	0x15dafe0 <_ChromeMain+0x15d5d44>
 15daf7c: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 15daf80: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 15daf84: a94657f6     	ldp	x22, x21, [sp, #0x60]
 15daf88: 910243ff     	add	sp, sp, #0x90
 15daf8c: d65f03c0     	ret
 15daf90: d4200020     	brk	#0x1
 15daf94: 91000529     	add	x9, x9, #0x1
 15daf98: f90027e9     	str	x9, [sp, #0x48]
 15daf9c: eb09017f     	cmp	x11, x9
 15dafa0: 54fffbe1     	b.ne	0x15daf1c <_ChromeMain+0x15d5c80>
 15dafa4: aa0b03e9     	mov	x9, x11
 15dafa8: 17ffffe3     	b	0x15daf34 <_ChromeMain+0x15d5c98>
 15dafac: 91000529     	add	x9, x9, #0x1
 15dafb0: f90027e9     	str	x9, [sp, #0x48]
 15dafb4: eb09017f     	cmp	x11, x9
 15dafb8: 54fff781     	b.ne	0x15daea8 <_ChromeMain+0x15d5c0c>
 15dafbc: aa0b03e9     	mov	x9, x11
 15dafc0: 17ffffbe     	b	0x15daeb8 <_ChromeMain+0x15d5c1c>
 15dafc4: d280000a     	mov	x10, #0x0               ; =0
 15dafc8: d2800009     	mov	x9, #0x0                ; =0
 15dafcc: f9002bff     	str	xzr, [sp, #0x50]
 15dafd0: 6f00e400     	movi.2d	v0, #0000000000000000
 15dafd4: ad0183e0     	stp	q0, q0, [sp, #0x30]
 15dafd8: 17ffffb8     	b	0x15daeb8 <_ChromeMain+0x15d5c1c>
