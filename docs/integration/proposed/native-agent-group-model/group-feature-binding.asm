
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d46e88: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7d46e8c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7d46e90: 910043fd     	add	x29, sp, #0x10
 7d46e94: aa0103f4     	mov	x20, x1
 7d46e98: aa0003f3     	mov	x19, x0
 7d46e9c: aa0203e1     	mov	x1, x2
 7d46ea0: aa0303e2     	mov	x2, x3
 7d46ea4: aa0403e3     	mov	x3, x4
 7d46ea8: 970cc3fe     	bl	0x4077ea0 <_ChromeMain+0x4072c04>
 7d46eac: d00326e8     	adrp	x8, 0xe224000 <dyld_stub_binder+0xe224000>
 7d46eb0: 910f6108     	add	x8, x8, #0x3d8
 7d46eb4: f9000008     	str	x8, [x0]
 7d46eb8: f9005c1f     	str	xzr, [x0, #0xb8]
 7d46ebc: 94000068     	bl	0x7d4705c <_ChromeMain+0x7d41dc0>
 7d46ec0: f9405e68     	ldr	x8, [x19, #0xb8]
 7d46ec4: f9005e60     	str	x0, [x19, #0xb8]
 7d46ec8: b4000088     	cbz	x8, 0x7d46ed8 <_ChromeMain+0x7d41c3c>
 7d46ecc: aa0803e0     	mov	x0, x8
 7d46ed0: 9400008d     	bl	0x7d47104 <_ChromeMain+0x7d41e68>
 7d46ed4: f9405e60     	ldr	x0, [x19, #0xb8]
 7d46ed8: aa1303e1     	mov	x1, x19
 7d46edc: aa1403e2     	mov	x2, x20
 7d46ee0: 9400009a     	bl	0x7d47148 <_ChromeMain+0x7d41eac>
 7d46ee4: aa1303e0     	mov	x0, x19
 7d46ee8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7d46eec: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7d46ef0: d65f03c0     	ret
