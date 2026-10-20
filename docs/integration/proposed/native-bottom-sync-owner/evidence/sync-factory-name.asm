
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 21ad8ec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 21ad8f0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 21ad8f4: 910043fd     	add	x29, sp, #0x10
 21ad8f8: aa0003f3     	mov	x19, x0
 21ad8fc: 977a9988     	bl	0x53f1c <_ChromeMain+0x4ec80>
 21ad900: aa0003e2     	mov	x2, x0
 21ad904: f005c4e1     	adrp	x1, 0xda4c000 <dyld_stub_binder+0xda4c000>
 21ad908: 913e9421     	add	x1, x1, #0xfa5
 21ad90c: aa1303e0     	mov	x0, x19
 21ad910: 52800003     	mov	w3, #0x0                ; =0
 21ad914: 97a199ad     	bl	0xa13fc8 <_ChromeMain+0xa0ed2c>
 21ad918: a9027e7f     	stp	xzr, xzr, [x19, #0x20]
 21ad91c: f9001a7f     	str	xzr, [x19, #0x30]
 21ad920: 9005ec68     	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 21ad924: 3dc28d00     	ldr	q0, [x8, #0xa30]
 21ad928: 3c838260     	stur	q0, [x19, #0x38]
 21ad92c: f005fda8     	adrp	x8, 0xe164000 <dyld_stub_binder+0xe164000>
 21ad930: 911ea108     	add	x8, x8, #0x7a8
 21ad934: f9000268     	str	x8, [x19]
