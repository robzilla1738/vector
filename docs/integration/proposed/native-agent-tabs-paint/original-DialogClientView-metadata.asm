
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a6ec050: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 a6ec054: a9017bfd     	stp	x29, x30, [sp, #0x10]
 a6ec058: 910043fd     	add	x29, sp, #0x10
 a6ec05c: aa0003f3     	mov	x19, x0
 a6ec060: b001b2c1     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 a6ec064: 913b7421     	add	x1, x1, #0xedd
 a6ec068: 52800542     	mov	w2, #0x2a               ; =42
 a6ec06c: 528005e3     	mov	w3, #0x2f               ; =47
 a6ec070: 9492667d     	bl	0xcb85a64 <_ChromeMain+0xcb807c8>
 a6ec074: d001e348     	adrp	x8, 0xe356000 <dyld_stub_binder+0xe356000>
 a6ec078: 91062108     	add	x8, x8, #0x188
 a6ec07c: f9000008     	str	x8, [x0]
 a6ec080: b001b2c1     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 a6ec084: 91386021     	add	x1, x1, #0xe18
 a6ec088: 52800202     	mov	w2, #0x10               ; =16
 a6ec08c: 963d0654     	bl	0x362d9dc <_ChromeMain+0x3628740>
 a6ec090: 9635ef40     	bl	0x3467d90 <_ChromeMain+0x3462af4>
 a6ec094: aa0003e1     	mov	x1, x0
 a6ec098: aa1303e0     	mov	x0, x19
 a6ec09c: 963d0652     	bl	0x362d9e4 <_ChromeMain+0x3628748>
 a6ec0a0: aa1303e0     	mov	x0, x19
 a6ec0a4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 a6ec0a8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 a6ec0ac: d65f03c0     	ret
