
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d4c4e4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d4c4e8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d4c4ec: 910043fd     	add	x29, sp, #0x10
 7d4c4f0: aa0803f3     	mov	x19, x8
 7d4c4f4: f9402000     	ldr	x0, [x0, #0x40]
 7d4c4f8: b4000160     	cbz	x0, 0x7d4c524 <_ChromeMain+0x7d47288>
 7d4c4fc: 965d6ff8     	bl	0x14a84dc <_ChromeMain+0x14a3240>
 7d4c500: 39c05c08     	ldrsb	w8, [x0, #0x17]
 7d4c504: 37f80168     	tbnz	w8, #0x1f, 0x7d4c530 <_ChromeMain+0x7d47294>
 7d4c508: 3dc00000     	ldr	q0, [x0]
 7d4c50c: f9400808     	ldr	x8, [x0, #0x10]
 7d4c510: f9000a68     	str	x8, [x19, #0x10]
 7d4c514: 3d800260     	str	q0, [x19]
 7d4c518: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d4c51c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d4c520: d65f03c0     	ret
 7d4c524: a9007e7f     	stp	xzr, xzr, [x19]
 7d4c528: f9000a7f     	str	xzr, [x19, #0x10]
 7d4c52c: 17fffffb     	b	0x7d4c518 <_ChromeMain+0x7d4727c>
 7d4c530: a9400801     	ldp	x1, x2, [x0]
 7d4c534: aa1303e0     	mov	x0, x19
 7d4c538: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d4c53c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d4c540: 160be9a4     	b	0x46bd0 <_ChromeMain+0x41934>
