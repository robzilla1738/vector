
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467ae44: 3947a408     	ldrb	w8, [x0, #0x1e9]
 467ae48: 360002c8     	tbz	w8, #0x0, 0x467aea0 <_ChromeMain+0x4675c04>
 467ae4c: d10103ff     	sub	sp, sp, #0x40
 467ae50: a9024ff4     	stp	x20, x19, [sp, #0x20]
 467ae54: a9037bfd     	stp	x29, x30, [sp, #0x30]
 467ae58: 9100c3fd     	add	x29, sp, #0x30
 467ae5c: aa0003f3     	mov	x19, x0
 467ae60: 910043e1     	add	x1, sp, #0x10
 467ae64: 9736b63c     	bl	0x1428754 <_ChromeMain+0x14234b8>
 467ae68: f940e268     	ldr	x8, [x19, #0x1c0]
 467ae6c: a90023ff     	stp	xzr, x8, [sp]
 467ae70: 4f000500     	movi.4s	v0, #0x8
 467ae74: 3d8007e0     	str	q0, [sp, #0x10]
 467ae78: 910003e0     	mov	x0, sp
 467ae7c: 910043e1     	add	x1, sp, #0x10
 467ae80: 96f5488e     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 467ae84: f9418a60     	ldr	x0, [x19, #0x310]
 467ae88: 910003e1     	mov	x1, sp
 467ae8c: 9708a741     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467ae90: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 467ae94: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 467ae98: 910103ff     	add	sp, sp, #0x40
 467ae9c: d65f03c0     	ret
 467aea0: d4200000     	brk	#0
 467aea4: d4400000     	hlt	#0
 467aea8: d4200020     	brk	#0x1
 467aeac: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 467aeb0: 910003fd     	mov	x29, sp
 467aeb4: f9418800     	ldr	x0, [x0, #0x310]
 467aeb8: 97056b72     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 467aebc: 4e080c00     	dup.2d	v0, x0
 467aec0: 9004c608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 467aec4: 3dc01101     	ldr	q1, [x8, #0x40]
 467aec8: 6ee14400     	ushl.2d	v0, v0, v1
 467aecc: 0ea12800     	xtn.2s	v0, v0
 467aed0: 0f000601     	movi.2s	v1, #0x10
 467aed4: 0ea10c00     	sqadd.2s	v0, v0, v1
 467aed8: 6f00e401     	movi.2d	v1, #0000000000000000
 467aedc: 0ea16400     	smax.2s	v0, v0, v1
 467aee0: 9e660000     	fmov	x0, d0
 467aee4: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 467aee8: d65f03c0     	ret
