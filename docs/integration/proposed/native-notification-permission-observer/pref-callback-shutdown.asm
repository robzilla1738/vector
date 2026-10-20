
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f881c: d10103ff     	sub	sp, sp, #0x40
 40f8820: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40f8824: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40f8828: 9100c3fd     	add	x29, sp, #0x30
 40f882c: aa0003f3     	mov	x19, x0
 40f8830: f9400c00     	ldr	x0, [x0, #0x18]
 40f8834: b40001a0     	cbz	x0, 0x40f8868 <_ChromeMain+0x40f35cc>
 40f8838: 910003f4     	mov	x20, sp
 40f883c: 910003e8     	mov	x8, sp
 40f8840: 940003d3     	bl	0x40f978c <_ChromeMain+0x40f44f0>
 40f8844: b0046f82     	adrp	x2, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8848: 912b3c42     	add	x2, x2, #0xacf
 40f884c: 910003e1     	mov	x1, sp
 40f8850: aa1303e0     	mov	x0, x19
 40f8854: 94000167     	bl	0x40f8df0 <_ChromeMain+0x40f3b54>
 40f8858: f94007e1     	ldr	x1, [sp, #0x8]
 40f885c: f9000ff4     	str	x20, [sp, #0x18]
 40f8860: 910063e0     	add	x0, sp, #0x18
 40f8864: 9718a092     	bl	0x720aac <_ChromeMain+0x71b810>
 40f8868: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40f886c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40f8870: 910103ff     	add	sp, sp, #0x40
 40f8874: d65f03c0     	ret
 40f8878: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 40f887c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 40f8880: 910043fd     	add	x29, sp, #0x10
 40f8884: aa0003f3     	mov	x19, x0
 40f8888: 9101e000     	add	x0, x0, #0x78
 40f888c: 970e9d6a     	bl	0x49fe34 <_ChromeMain+0x49ab98>
 40f8890: f9400e60     	ldr	x0, [x19, #0x18]
 40f8894: 975bc547     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 40f8898: 9101c000     	add	x0, x0, #0x70
 40f889c: 91002261     	add	x1, x19, #0x8
 40f88a0: 976ca08c     	bl	0x1c20ad0 <_ChromeMain+0x1c1b834>
 40f88a4: f9400e60     	ldr	x0, [x19, #0x18]
 40f88a8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40f88ac: d00555c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40f88b0: f9404529     	ldr	x9, [x9, #0x88]
 40f88b4: eb09011f     	cmp	x8, x9
 40f88b8: 54000041     	b.ne	0x40f88c0 <_ChromeMain+0x40f3624>
 40f88bc: 96fca860     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40f88c0: f9000e7f     	str	xzr, [x19, #0x18]
 40f88c4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 40f88c8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 40f88cc: d65f03c0     	ret
