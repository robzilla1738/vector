
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6d2710: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 a6d2714: a9017bfd     	stp	x29, x30, [sp, #0x10]
 a6d2718: 910043fd     	add	x29, sp, #0x10
 a6d271c: 52800d00     	mov	w0, #0x68               ; =104
 a6d2720: 9492c047     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 a6d2724: aa0003f3     	mov	x19, x0
 a6d2728: f001b381     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 a6d272c: 91122021     	add	x1, x1, #0x488
 a6d2730: 52800462     	mov	w2, #0x23               ; =35
 a6d2734: 52800943     	mov	w3, #0x4a               ; =74
 a6d2738: 9492cccb     	bl	0xcb85a64 <_ChromeMain+0xcb807c8>
 a6d273c: b001e408     	adrp	x8, 0xe353000 <dyld_stub_binder+0xe353000>
 a6d2740: 910e0108     	add	x8, x8, #0x380
 a6d2744: f9000008     	str	x8, [x0]
 a6d2748: 94000013     	bl	0xa6d2794 <_ChromeMain+0xa6cd4f8>
 a6d274c: aa1303e0     	mov	x0, x19
 a6d2750: 9492ec78     	bl	0xcb8d930 <_ChromeMain+0xcb88694>
 a6d2754: aa1303e0     	mov	x0, x19
 a6d2758: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 a6d275c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 a6d2760: d65f03c0     	ret
 a6d2764: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 a6d2768: a9017bfd     	stp	x29, x30, [sp, #0x10]
 a6d276c: 910043fd     	add	x29, sp, #0x10
 a6d2770: b0023f73     	adrp	x19, 0xeebf000 <dyld_stub_binder+0xeebf000>
 a6d2774: f9452a60     	ldr	x0, [x19, #0xa50]
 a6d2778: b4000080     	cbz	x0, 0xa6d2788 <_ChromeMain+0xa6cd4ec>
 a6d277c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 a6d2780: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 a6d2784: d65f03c0     	ret
 a6d2788: 97ffffe2     	bl	0xa6d2710 <_ChromeMain+0xa6cd474>
 a6d278c: f9052a60     	str	x0, [x19, #0xa50]
 a6d2790: 17fffffb     	b	0xa6d277c <_ChromeMain+0xa6cd4e0>
 a6d2794: d101c3ff     	sub	sp, sp, #0x70
 a6d2798: a90457f6     	stp	x22, x21, [sp, #0x40]
 a6d279c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 a6d27a0: a9067bfd     	stp	x29, x30, [sp, #0x60]
 a6d27a4: 910183fd     	add	x29, sp, #0x60
 a6d27a8: aa0003f3     	mov	x19, x0
 a6d27ac: f001b381     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 a6d27b0: 910fc421     	add	x1, x1, #0x3f1
 a6d27b4: 52800142     	mov	w2, #0xa                ; =10
 a6d27b8: 963d6c89     	bl	0x362d9dc <_ChromeMain+0x3628740>
 a6d27bc: 940005e1     	bl	0xa6d3f40 <_ChromeMain+0xa6ceca4>
 a6d27c0: aa0003e1     	mov	x1, x0
 a6d27c4: aa1303e0     	mov	x0, x19
 a6d27c8: 963d6c87     	bl	0x362d9e4 <_ChromeMain+0x3628748>
