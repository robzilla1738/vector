
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2db8d48: 14000002     	b	0x2db8d50 <_ChromeMain+0x2db3ab4>
 2db8d4c: 00000000     	udf	#0x0
 2db8d50: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2db8d54: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2db8d58: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2db8d5c: 910083fd     	add	x29, sp, #0x20
 2db8d60: 9005fc75     	adrp	x21, 0xed44000 <dyld_stub_binder+0xed44000>
 2db8d64: f94726b3     	ldr	x19, [x21, #0xe48]
 2db8d68: b5000473     	cbnz	x19, 0x2db8df4 <_ChromeMain+0x2db3b58>
 2db8d6c: 52800d00     	mov	w0, #0x68               ; =104
 2db8d70: 9749597e     	bl	0xf368 <_ChromeMain+0xa0cc>
 2db8d74: aa0003f3     	mov	x19, x0
 2db8d78: 90056ac1     	adrp	x1, 0xdb10000 <dyld_stub_binder+0xdb10000>
 2db8d7c: 9136fc21     	add	x1, x1, #0xdbf
 2db8d80: 52800a22     	mov	w2, #0x51               ; =81
 2db8d84: 528004e3     	mov	w3, #0x27               ; =39
 2db8d88: 975db9fc     	bl	0x527578 <_ChromeMain+0x5222dc>
 2db8d8c: f005a4a8     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 2db8d90: 913da108     	add	x8, x8, #0xf68
 2db8d94: 90056ac9     	adrp	x9, 0xdb10000 <dyld_stub_binder+0xdb10000>
 2db8d98: 91367d29     	add	x9, x9, #0xd9f
 2db8d9c: a9002408     	stp	x8, x9, [x0]
 2db8da0: 528003e8     	mov	w8, #0x1f               ; =31
 2db8da4: f9000808     	str	x8, [x0, #0x10]
 2db8da8: f0060fb6     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 2db8dac: f94062d4     	ldr	x20, [x22, #0xc0]
 2db8db0: b40002d4     	cbz	x20, 0x2db8e08 <_ChromeMain+0x2db3b6c>
 2db8db4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2db8db8: d005efd6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2db8dbc: f94046c9     	ldr	x9, [x22, #0x88]
 2db8dc0: eb09011f     	cmp	x8, x9
 2db8dc4: 54000061     	b.ne	0x2db8dd0 <_ChromeMain+0x2db3b34>
 2db8dc8: aa1403e0     	mov	x0, x20
 2db8dcc: 97496d4c     	bl	0x142fc <_ChromeMain+0xf060>
 2db8dd0: f9402660     	ldr	x0, [x19, #0x48]
 2db8dd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2db8dd8: f94046c9     	ldr	x9, [x22, #0x88]
 2db8ddc: eb09011f     	cmp	x8, x9
 2db8de0: 54000340     	b.eq	0x2db8e48 <_ChromeMain+0x2db3bac>
 2db8de4: f9002674     	str	x20, [x19, #0x48]
 2db8de8: aa1303e0     	mov	x0, x19
 2db8dec: 97a7b67e     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 2db8df0: f90726b3     	str	x19, [x21, #0xe48]
 2db8df4: aa1303e0     	mov	x0, x19
