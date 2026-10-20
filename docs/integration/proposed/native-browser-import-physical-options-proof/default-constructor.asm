
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 300f948: d10103ff     	sub	sp, sp, #0x40
 300f94c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 300f950: 9100c3fd     	add	x29, sp, #0x30
 300f954: aa0103e2     	mov	x2, x1
 300f958: 0f008420     	movi.4h	v0, #0x1
 300f95c: bd0003e0     	str	s0, [sp]
 300f960: 390013ff     	strb	wzr, [sp, #0x4]
 300f964: 52820008     	mov	w8, #0x1000             ; =4096
 300f968: f90007e8     	str	x8, [sp, #0x8]
 300f96c: 790023ff     	strh	wzr, [sp, #0x10]
 300f970: f9000fff     	str	xzr, [sp, #0x18]
 300f974: 0f000420     	movi.2s	v0, #0x1
 300f978: bd0023e0     	str	s0, [sp, #0x20]
 300f97c: f90017ff     	str	xzr, [sp, #0x28]
 300f980: 910003e1     	mov	x1, sp
 300f984: 97c78789     	bl	0x21f17a8 <_ChromeMain+0x21ec50c>
 300f988: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 300f98c: 910103ff     	add	sp, sp, #0x40
 300f990: d65f03c0     	ret
