
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460a634: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 460a638: a9014ff4     	stp	x20, x19, [sp, #0x10]
 460a63c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 460a640: 910083fd     	add	x29, sp, #0x20
 460a644: b0054695     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 460a648: f9440eb3     	ldr	x19, [x21, #0x818]
 460a64c: b5000473     	cbnz	x19, 0x460a6d8 <_ChromeMain+0x460543c>
 460a650: 52800d00     	mov	w0, #0x68               ; =104
 460a654: 96e81345     	bl	0xf368 <_ChromeMain+0xa0cc>
 460a658: aa0003f3     	mov	x19, x0
 460a65c: b004c601     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460a660: 911a4021     	add	x1, x1, #0x690
 460a664: 528008c2     	mov	w2, #0x46               ; =70
 460a668: 52800843     	mov	w3, #0x42               ; =66
 460a66c: 96fc73c3     	bl	0x527578 <_ChromeMain+0x5222dc>
 460a670: d004f7e8     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 460a674: 912be108     	add	x8, x8, #0xaf8
 460a678: b004c609     	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460a67c: 9119cd29     	add	x9, x9, #0x673
 460a680: a9002408     	stp	x8, x9, [x0]
 460a684: 52800388     	mov	w8, #0x1c               ; =28
 460a688: f9000808     	str	x8, [x0, #0x10]
