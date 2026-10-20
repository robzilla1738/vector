
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6c7d3c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 a6c7d40: a9017bfd     	stp	x29, x30, [sp, #0x10]
 a6c7d44: 910043fd     	add	x29, sp, #0x10
 a6c7d48: aa0103f3     	mov	x19, x1
 a6c7d4c: aa0003f4     	mov	x20, x0
 a6c7d50: 949316e6     	bl	0xcb8d8e8 <_ChromeMain+0xcb8864c>
 a6c7d54: b001ffc8     	adrp	x8, 0xe6c0000 <dyld_stub_binder+0xe6c0000>
 a6c7d58: 91354108     	add	x8, x8, #0xd50
 a6c7d5c: 910fe109     	add	x9, x8, #0x3f8
 a6c7d60: a9002408     	stp	x8, x9, [x0]
 a6c7d64: 91108109     	add	x9, x8, #0x420
 a6c7d68: f9000809     	str	x9, [x0, #0x10]
 a6c7d6c: 91116109     	add	x9, x8, #0x458
 a6c7d70: 9112210a     	add	x10, x8, #0x488
 a6c7d74: a906a809     	stp	x9, x10, [x0, #0x68]
 a6c7d78: 91136109     	add	x9, x8, #0x4d8
 a6c7d7c: f9005809     	str	x9, [x0, #0xb0]
 a6c7d80: 9114e109     	add	x9, x8, #0x538
 a6c7d84: f9006c09     	str	x9, [x0, #0xd8]
 a6c7d88: 9115a108     	add	x8, x8, #0x568
 a6c7d8c: f9007c08     	str	x8, [x0, #0xf8]
 a6c7d90: f901881f     	str	xzr, [x0, #0x310]
 a6c7d94: 910c6000     	add	x0, x0, #0x318
 a6c7d98: 949300f9     	bl	0xcb8817c <_ChromeMain+0xcb82ee0>
 a6c7d9c: 390de29f     	strb	wzr, [x20, #0x378]
 a6c7da0: b9037e93     	str	w19, [x20, #0x37c]
 a6c7da4: 390e029f     	strb	wzr, [x20, #0x380]
 a6c7da8: 390e129f     	strb	wzr, [x20, #0x384]
 a6c7dac: 910e2280     	add	x0, x20, #0x388
 a6c7db0: aa1403e1     	mov	x1, x20
 a6c7db4: 9492f867     	bl	0xcb85f50 <_ChromeMain+0xcb80cb4>
 a6c7db8: aa1403e0     	mov	x0, x20
 a6c7dbc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 a6c7dc0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 a6c7dc4: d65f03c0     	ret
