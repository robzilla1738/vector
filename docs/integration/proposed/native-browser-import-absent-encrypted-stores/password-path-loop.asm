
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b5a4: a947ebf4     	ldp	x20, x26, [sp, #0x78]
 425b5a8: 910c83f5     	add	x21, sp, #0x320
 425b5ac: b50045fa     	cbnz	x26, 0x425be68 <_ChromeMain+0x4256bcc>
 425b5b0: 91006294     	add	x20, x20, #0x18
 425b5b4: f94037e8     	ldr	x8, [sp, #0x68]
 425b5b8: eb08029f     	cmp	x20, x8
 425b5bc: 54000e80     	b.eq	0x425b78c <_ChromeMain+0x42564f0>
 425b5c0: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 425b5c4: f9004bff     	str	xzr, [sp, #0x90]
 425b5c8: aa1403e0     	mov	x0, x20
 425b5cc: 977f239d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425b5d0: 35fff100     	cbnz	w0, 0x425b3f0 <_ChromeMain+0x4256154>
