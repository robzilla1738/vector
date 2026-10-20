
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2a105d0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 2a105d4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 2a105d8: 910043fd     	add	x29, sp, #0x10
 2a105dc: aa0003f3     	mov	x19, x0
 2a105e0: 97a9d440     	bl	0x14856e0 <_ChromeMain+0x1480444>
 2a105e4: d005ca08     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 2a105e8: 913d8108     	add	x8, x8, #0xf60
 2a105ec: f9000008     	str	x8, [x0]
 2a105f0: 91036108     	add	x8, x8, #0xd8
 2a105f4: f9001408     	str	x8, [x0, #0x28]
 2a105f8: b900f01f     	str	wzr, [x0, #0xf0]
 2a105fc: 3903d01f     	strb	wzr, [x0, #0xf4]
 2a10600: b901141f     	str	wzr, [x0, #0x114]
 2a10604: a9107c1f     	stp	xzr, xzr, [x0, #0x100]
 2a10608: f9007c1f     	str	xzr, [x0, #0xf8]
 2a1060c: 7902201f     	strh	wzr, [x0, #0x110]
 2a10610: 9104a008     	add	x8, x0, #0x128
 2a10614: a912fc1f     	stp	xzr, xzr, [x0, #0x128]
 2a10618: d005ca09     	adrp	x9, 0xe352000 <dyld_stub_binder+0xe352000>
 2a1061c: 913cc129     	add	x9, x9, #0xf30
 2a10620: a911a009     	stp	x9, x8, [x0, #0x118]
 2a10624: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2a10628: d0060d09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2a1062c: f9404529     	ldr	x9, [x9, #0x88]
 2a10630: eb09011f     	cmp	x8, x9
 2a10634: 54000061     	b.ne	0x2a10640 <_ChromeMain+0x2a0b3a4>
 2a10638: aa1303e0     	mov	x0, x19
 2a1063c: 97580f30     	bl	0x142fc <_ChromeMain+0xf060>
 2a10640: f9009e73     	str	x19, [x19, #0x138]
 2a10644: 91046260     	add	x0, x19, #0x118
 2a10648: 94000005     	bl	0x2a1065c <_ChromeMain+0x2a0b3c0>
 2a1064c: aa1303e0     	mov	x0, x19
 2a10650: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 2a10654: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 2a10658: d65f03c0     	ret
