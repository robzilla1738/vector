
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4635098: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 463509c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46350a0: 910043fd     	add	x29, sp, #0x10
 46350a4: aa0003f3     	mov	x19, x0
 46350a8: f004f688     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 46350ac: 9136c108     	add	x8, x8, #0xdb0
 46350b0: f9000008     	str	x8, [x0]
 46350b4: f9401400     	ldr	x0, [x0, #0x28]
 46350b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46350bc: b0052be9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46350c0: f9404529     	ldr	x9, [x9, #0x88]
 46350c4: eb09011f     	cmp	x8, x9
 46350c8: 54000041     	b.ne	0x46350d0 <_ChromeMain+0x462fe34>
 46350cc: 96e7b65c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46350d0: f900167f     	str	xzr, [x19, #0x28]
 46350d4: b004e588     	adrp	x8, 0xe2e6000 <dyld_stub_binder+0xe2e6000>
 46350d8: 9118e108     	add	x8, x8, #0x638
 46350dc: f9000268     	str	x8, [x19]
 46350e0: a941a261     	ldp	x1, x8, [x19, #0x18]
 46350e4: 91002260     	add	x0, x19, #0x8
 46350e8: eb08003f     	cmp	x1, x8
 46350ec: 54000121     	b.ne	0x4635110 <_ChromeMain+0x462fe74>
 46350f0: aa0103e2     	mov	x2, x1
 46350f4: 9714c1cf     	bl	0xb65830 <_ChromeMain+0xb60594>
 46350f8: f9400660     	ldr	x0, [x19, #0x8]
 46350fc: 94e74a92     	bl	0x8007b44 <_ChromeMain+0x80028a8>
 4635100: aa1303e0     	mov	x0, x19
 4635104: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4635108: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 463510c: d65f03c0     	ret
 4635110: 941f442c     	bl	0x4e061c0 <_ChromeMain+0x4e00f24>
 4635114: f9400014     	ldr	x20, [x0]
 4635118: 91002260     	add	x0, x19, #0x8
 463511c: 9528ce2f     	bl	0x90689d8 <_ChromeMain+0x906373c>
 4635120: aa1403e0     	mov	x0, x20
 4635124: aa1303e1     	mov	x1, x19
 4635128: 9528cccb     	bl	0x9068454 <_ChromeMain+0x90631b8>
 463512c: 17ffffed     	b	0x46350e0 <_ChromeMain+0x462fe44>
