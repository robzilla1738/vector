
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a687694: 90024948     	adrp	x8, 0xefaf000 <dyld_stub_binder+0xefaf000>
 a687698: f9405d00     	ldr	x0, [x8, #0xb8]
 a68769c: f9400008     	ldr	x8, [x0]
 a6876a0: f9401108     	ldr	x8, [x8, #0x20]
 a6876a4: d0fc5189     	adrp	x9, 0x30b9000 <_ChromeMain+0x30b3d64>
 a6876a8: 91280129     	add	x9, x9, #0xa00
 a6876ac: eb09011f     	cmp	x8, x9
 a6876b0: 540000a1     	b.ne	0xa6876c4 <_ChromeMain+0xa682428>
 a6876b4: 91004000     	add	x0, x0, #0x10
 a6876b8: 528000a1     	mov	w1, #0x5                ; =5
 a6876bc: 52820002     	mov	w2, #0x1000             ; =4096
 a6876c0: 14941863     	b	0xcb8d84c <_ChromeMain+0xcb885b0>
 a6876c4: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 a6876c8: 910003fd     	mov	x29, sp
 a6876cc: d63f0100     	blr	x8
 a6876d0: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 a6876d4: 17fffff9     	b	0xa6876b8 <_ChromeMain+0xa68241c>
