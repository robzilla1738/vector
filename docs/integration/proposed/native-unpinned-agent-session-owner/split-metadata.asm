
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78a0550: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78a0554: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78a0558: 910043fd     	add	x29, sp, #0x10
 78a055c: aa0003f3     	mov	x19, x0
 78a0560: f0030fc1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a0564: 9126d021     	add	x1, x1, #0x9b4
 78a0568: 52800742     	mov	w2, #0x3a               ; =58
 78a056c: 528003e3     	mov	w3, #0x1f               ; =31
 78a0570: 96321c02     	bl	0x527578 <_ChromeMain+0x5222dc>
 78a0574: b00348c8     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 78a0578: 910a4108     	add	x8, x8, #0x290
 78a057c: f9000008     	str	x8, [x0]
 78a0580: f0030fc1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 78a0584: 91269c21     	add	x1, x1, #0x9a7
 78a0588: 52800182     	mov	w2, #0xc                ; =12
 78a058c: 96f63514     	bl	0x362d9dc <_ChromeMain+0x3628740>
 78a0590: 96ab5508     	bl	0x23759b0 <_ChromeMain+0x2370714>
 78a0594: aa0003e1     	mov	x1, x0
 78a0598: aa1303e0     	mov	x0, x19
 78a059c: 96f63512     	bl	0x362d9e4 <_ChromeMain+0x3628748>
