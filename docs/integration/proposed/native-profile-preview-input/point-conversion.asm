
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 43f0144: d10343ff     	sub	sp, sp, #0xd0
 43f0148: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 43f014c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 43f0150: 910303fd     	add	x29, sp, #0xc0
 43f0154: aa0203f3     	mov	x19, x2
 43f0158: f90053ff     	str	xzr, [sp, #0xa0]
 43f015c: 6f00e400     	movi.2d	v0, #0000000000000000
 43f0160: ad0403e0     	stp	q0, q0, [sp, #0x80]
 43f0164: ad0303e0     	stp	q0, q0, [sp, #0x60]
 43f0168: ad0203e0     	stp	q0, q0, [sp, #0x40]
 43f016c: ad0103e0     	stp	q0, q0, [sp, #0x20]
 43f0170: 0f03f600     	fmov.2s	v0, #1.00000000
 43f0174: fd0017e0     	str	d0, [sp, #0x28]
 43f0178: 910083e2     	add	x2, sp, #0x20
 43f017c: 9740dd4c     	bl	0x14276ac <_ChromeMain+0x1422410>
 43f0180: aa0003f4     	mov	x20, x0
 43f0184: b9001bff     	str	wzr, [sp, #0x18]
 43f0188: fd400260     	ldr	d0, [x19]
 43f018c: 0e21d800     	scvtf.2s	v0, v0
 43f0190: fd0007e0     	str	d0, [sp, #0x8]
 43f0194: 910083e0     	add	x0, sp, #0x20
 43f0198: 910023e1     	add	x1, sp, #0x8
 43f019c: 974c0025     	bl	0x16f0230 <_ChromeMain+0x16eaf94>
 43f01a0: f9000be0     	str	x0, [sp, #0x10]
 43f01a4: 390063e1     	strb	w1, [sp, #0x18]
 43f01a8: 36000081     	tbz	w1, #0x0, 0x43f01b8 <_ChromeMain+0x43eaf1c>
 43f01ac: 910043e0     	add	x0, sp, #0x10
 43f01b0: 970b36d3     	bl	0x6bdcfc <_ChromeMain+0x6b8a60>
 43f01b4: f9000260     	str	x0, [x19]
 43f01b8: aa1403e0     	mov	x0, x20
 43f01bc: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 43f01c0: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 43f01c4: 910343ff     	add	sp, sp, #0xd0
 43f01c8: d65f03c0     	ret
