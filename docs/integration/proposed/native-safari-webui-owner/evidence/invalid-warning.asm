
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458d4ec: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 458d4f0: a90157f6     	stp	x22, x21, [sp, #0x10]
 458d4f4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 458d4f8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 458d4fc: 9100c3fd     	add	x29, sp, #0x30
 458d500: aa0303f3     	mov	x19, x3
 458d504: aa0203f4     	mov	x20, x2
 458d508: aa0103f5     	mov	x21, x1
 458d50c: aa0003f6     	mov	x22, x0
 458d510: 90053b08     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 458d514: f9454d00     	ldr	x0, [x8, #0xa98]
 458d518: 951874a8     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 458d51c: aa0003f7     	mov	x23, x0
 458d520: d2800002     	mov	x2, #0x0                ; =0
 458d524: 95ef0f6a     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 458d528: aa1603e0     	mov	x0, x22
 458d52c: aa1503e1     	mov	x1, x21
 458d530: 975b7aae     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d534: 94e9d881     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d538: aa0003f5     	mov	x21, x0
 458d53c: aa1703e0     	mov	x0, x23
 458d540: aa1503e2     	mov	x2, x21
 458d544: 95ef0f5c     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 458d548: aa1503e0     	mov	x0, x21
 458d54c: 94e9d884     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d550: aa1403e0     	mov	x0, x20
 458d554: aa1303e1     	mov	x1, x19
 458d558: 975b7aa4     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d55c: 94e9d877     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d560: aa0003f3     	mov	x19, x0
 458d564: aa1703e0     	mov	x0, x23
 458d568: aa1303e2     	mov	x2, x19
 458d56c: 95ef0f55     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 458d570: aa1303e0     	mov	x0, x19
 458d574: 94e9d87a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d578: b0052d42     	adrp	x2, 0xeb36000 <dyld_stub_binder+0xeb36000>
 458d57c: 9124e042     	add	x2, x2, #0x938
 458d580: aa1703e0     	mov	x0, x23
 458d584: 95ef0f55     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 458d588: aa1d03fd     	mov	x29, x29
 458d58c: 95619d86     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 458d590: aa1703e0     	mov	x0, x23
 458d594: 95ef0f42     	bl	0xc15129c <_ChromeMain+0xc14c000>
 458d598: aa1703e0     	mov	x0, x23
 458d59c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 458d5a0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 458d5a4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 458d5a8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 458d5ac: 14e9d86c     	b	0x800375c <_ChromeMain+0x7ffe4c0>
