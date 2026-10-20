
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1a9cb04: d10243ff     	sub	sp, sp, #0x90
 1a9cb08: a9074ff4     	stp	x20, x19, [sp, #0x70]
 1a9cb0c: a9087bfd     	stp	x29, x30, [sp, #0x80]
 1a9cb10: 910203fd     	add	x29, sp, #0x80
 1a9cb14: aa0803f3     	mov	x19, x8
 1a9cb18: 90062c68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 1a9cb1c: f940f908     	ldr	x8, [x8, #0x1f0]
 1a9cb20: f9400108     	ldr	x8, [x8]
 1a9cb24: f81e83a8     	stur	x8, [x29, #-0x18]
 1a9cb28: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 1a9cb2c: b006a368     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 1a9cb30: 394fe108     	ldrb	w8, [x8, #0x3f8]
 1a9cb34: 340004c8     	cbz	w8, 0x1a9cbcc <_ChromeMain+0x1a97930>
 1a9cb38: 910023e0     	add	x0, sp, #0x8
 1a9cb3c: 52800201     	mov	w1, #0x10               ; =16
 1a9cb40: 9798dd1c     	bl	0xd3fb0 <_ChromeMain+0xced14>
 1a9cb44: a940a7e8     	ldp	x8, x9, [sp, #0x8]
 1a9cb48: d360fd0a     	lsr	x10, x8, #32
 1a9cb4c: 5288000b     	mov	w11, #0x4000            ; =16384
 1a9cb50: b3402d0b     	bfxil	x11, x8, #0, #12
 1a9cb54: 5290000c     	mov	w12, #0x8000            ; =32768
 1a9cb58: b370f52c     	bfxil	x12, x9, #48, #14
 1a9cb5c: 90ffa34d     	adrp	x13, 0xf04000 <_ChromeMain+0xefed64>
 1a9cb60: 912d01ad     	add	x13, x13, #0xb40
 1a9cb64: a901b7ea     	stp	x10, x13, [sp, #0x18]
 1a9cb68: 9240bd29     	and	x9, x9, #0xffffffffffff
 1a9cb6c: 53107d08     	lsr	w8, w8, #16
 1a9cb70: a902b7e8     	stp	x8, x13, [sp, #0x28]
 1a9cb74: a903b7eb     	stp	x11, x13, [sp, #0x38]
 1a9cb78: a904b7ec     	stp	x12, x13, [sp, #0x48]
 1a9cb7c: b000ed68     	adrp	x8, 0x3849000 <_ChromeMain+0x3843d64>
 1a9cb80: 910c7108     	add	x8, x8, #0x31c
 1a9cb84: a905a3e9     	stp	x9, x8, [sp, #0x58]
 1a9cb88: d0060660     	adrp	x0, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 1a9cb8c: 9113a800     	add	x0, x0, #0x4ea
 1a9cb90: 910063e2     	add	x2, sp, #0x18
 1a9cb94: aa1303e8     	mov	x8, x19
 1a9cb98: 52800361     	mov	w1, #0x1b               ; =27
 1a9cb9c: 528000a3     	mov	w3, #0x5                ; =5
 1a9cba0: 979ffe98     	bl	0x29c600 <_ChromeMain+0x297364>
 1a9cba4: f85e83a8     	ldur	x8, [x29, #-0x18]
 1a9cba8: 90062c69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 1a9cbac: f940f929     	ldr	x9, [x9, #0x1f0]
 1a9cbb0: f9400129     	ldr	x9, [x9]
 1a9cbb4: eb08013f     	cmp	x9, x8
 1a9cbb8: 54000221     	b.ne	0x1a9cbfc <_ChromeMain+0x1a97960>
 1a9cbbc: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 1a9cbc0: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 1a9cbc4: 910243ff     	add	sp, sp, #0x90
 1a9cbc8: d65f03c0     	ret
 1a9cbcc: 910023e0     	add	x0, sp, #0x8
 1a9cbd0: 52800201     	mov	w1, #0x10               ; =16
 1a9cbd4: 9595f4ac     	bl	0x8019e84 <_ChromeMain+0x8014be8>
 1a9cbd8: 34fffb60     	cbz	w0, 0x1a9cb44 <_ChromeMain+0x1a978a8>
 1a9cbdc: 95b5a353     	bl	0x8805928 <_ChromeMain+0x880068c>
 1a9cbe0: 910023e1     	add	x1, sp, #0x8
 1a9cbe4: 52800202     	mov	w2, #0x10               ; =16
 1a9cbe8: 941cebc4     	bl	0x21d7af8 <_ChromeMain+0x21d285c>
 1a9cbec: 3707fac0     	tbnz	w0, #0x0, 0x1a9cb44 <_ChromeMain+0x1a978a8>
 1a9cbf0: d4200000     	brk	#0
 1a9cbf4: d4400000     	hlt	#0
 1a9cbf8: d4200020     	brk	#0x1
 1a9cbfc: 95959dd9     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
