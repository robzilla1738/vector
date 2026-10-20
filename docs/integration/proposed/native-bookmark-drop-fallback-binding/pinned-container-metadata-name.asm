
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 789e1b0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 789e1b4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 789e1b8: 910043fd     	add	x29, sp, #0x10
 789e1bc: aa0003f3     	mov	x19, x0
 789e1c0: b0030fe1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 789e1c4: 91258421     	add	x1, x1, #0x961
 789e1c8: 528008a2     	mov	w2, #0x45               ; =69
 789e1cc: 52800363     	mov	w3, #0x1b               ; =27
 789e1d0: 963224ea     	bl	0x527578 <_ChromeMain+0x5222dc>
 789e1d4: f00348c8     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 789e1d8: 9104e108     	add	x8, x8, #0x138
 789e1dc: f9000008     	str	x8, [x0]
 789e1e0: b0030fe1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 789e1e4: 91252821     	add	x1, x1, #0x94a
 789e1e8: 528002c2     	mov	w2, #0x16               ; =22
 789e1ec: 96f63dfc     	bl	0x362d9dc <_ChromeMain+0x3628740>
 789e1f0: 96ab5df0     	bl	0x23759b0 <_ChromeMain+0x2370714>
 789e1f4: aa0003e1     	mov	x1, x0
 789e1f8: aa1303e0     	mov	x0, x19
 789e1fc: 96f63dfa     	bl	0x362d9e4 <_ChromeMain+0x3628748>
 789e200: aa1303e0     	mov	x0, x19
 789e204: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 789e208: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 789e20c: d65f03c0     	ret
