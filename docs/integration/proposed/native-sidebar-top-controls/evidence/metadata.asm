
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2db8e50: 14000001     	b	0x2db8e54 <_ChromeMain+0x2db3bb8>
 2db8e54: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2db8e58: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2db8e5c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2db8e60: 910083fd     	add	x29, sp, #0x20
 2db8e64: 9005fc75     	adrp	x21, 0xed44000 <dyld_stub_binder+0xed44000>
 2db8e68: f9472eb3     	ldr	x19, [x21, #0xe58]
 2db8e6c: b5000473     	cbnz	x19, 0x2db8ef8 <_ChromeMain+0x2db3c5c>
 2db8e70: 52800d00     	mov	w0, #0x68               ; =104
 2db8e74: 9749593d     	bl	0xf368 <_ChromeMain+0xa0cc>
 2db8e78: aa0003f3     	mov	x19, x0
 2db8e7c: 90056ac1     	adrp	x1, 0xdb10000 <dyld_stub_binder+0xdb10000>
 2db8e80: 913e4821     	add	x1, x1, #0xf92
 2db8e84: 528009c2     	mov	w2, #0x4e               ; =78
 2db8e88: 52800543     	mov	w3, #0x2a               ; =42
 2db8e8c: 975db9bb     	bl	0x527578 <_ChromeMain+0x5222dc>
 2db8e90: 9005a4c8     	adrp	x8, 0xe250000 <dyld_stub_binder+0xe250000>
 2db8e94: 91032108     	add	x8, x8, #0xc8
 2db8e98: 90056ac9     	adrp	x9, 0xdb10000 <dyld_stub_binder+0xdb10000>
 2db8e9c: 913dd529     	add	x9, x9, #0xf75
 2db8ea0: a9002408     	stp	x8, x9, [x0]
 2db8ea4: 52800388     	mov	w8, #0x1c               ; =28
 2db8ea8: f9000808     	str	x8, [x0, #0x10]
 2db8eac: f0060fb6     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 2db8eb0: f94062d4     	ldr	x20, [x22, #0xc0]
