
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 8a546ec: d10143ff     	sub	sp, sp, #0x50
 8a546f0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 8a546f4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 8a546f8: 910103fd     	add	x29, sp, #0x40
 8a546fc: 9002aea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 8a54700: f940f908     	ldr	x8, [x8, #0x1f0]
 8a54704: f9400108     	ldr	x8, [x8]
 8a54708: f81e83a8     	stur	x8, [x29, #-0x18]
 8a5470c: 0e040c00     	dup.2s	v0, w0
 8a54710: 928001e8     	mov	x8, #-0x10              ; =-16
 8a54714: f2dfff08     	movk	x8, #0xfff8, lsl #32
 8a54718: 9e670101     	fmov	d1, x8
 8a5471c: 2ea14401     	ushl.2s	v1, v0, v1
 8a54720: 2f00e622     	movi	d2, #0x0000ff000000ff
 8a54724: 0e221c21     	and.8b	v1, v1, v2
 8a54728: 6f00e402     	movi.2d	v2, #0000000000000000
 8a5472c: 6e010402     	mov.b	v2[0], v0[0]
 8a54730: 52a86fe8     	mov	w8, #0x437f0000         ; =1132396544
 8a54734: 2f280400     	ushr.2s	v0, v0, #0x18
 8a54738: 6e0c2402     	mov.s	v2[1], v0[1]
 8a5473c: 0e040d00     	dup.2s	v0, w8
 8a54740: 2e21d821     	ucvtf.2s	v1, v1
 8a54744: 2e20fc21     	fdiv.2s	v1, v1, v0
 8a54748: 0e617821     	fcvtl	v1.2d, v1.2s
 8a5474c: 2e21d842     	ucvtf.2s	v2, v2
 8a54750: 2e20fc40     	fdiv.2s	v0, v2, v0
 8a54754: 0e617800     	fcvtl	v0.2d, v0.2s
 8a54758: ad0003e1     	stp	q1, q0, [sp]
 8a5475c: b00314c8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 8a54760: f9441d13     	ldr	x19, [x8, #0x838]
 8a54764: d503201f     	nop
 8a54768: f9446900     	ldr	x0, [x8, #0x8d0]
 8a5476c: 9505b34d     	bl	0xcbc14a0 <dyld_stub_binder+0xcbc14a0>
 8a54770: 95058406     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 8a54774: aa0003f4     	mov	x20, x0
 8a54778: 910003e3     	mov	x3, sp
 8a5477c: aa1303e0     	mov	x0, x19
 8a54780: aa1403e2     	mov	x2, x20
 8a54784: 52800084     	mov	w4, #0x4                ; =4
 8a54788: 9505cf1e     	bl	0xcbc8400 <dyld_stub_binder+0xcbc8400>
 8a5478c: 950583ff     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 8a54790: aa0003f3     	mov	x19, x0
 8a54794: aa1403e0     	mov	x0, x20
 8a54798: 9505832d     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 8a5479c: f85e83a8     	ldur	x8, [x29, #-0x18]
 8a547a0: 9002aea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 8a547a4: f940f929     	ldr	x9, [x9, #0x1f0]
 8a547a8: f9400129     	ldr	x9, [x9]
 8a547ac: eb08013f     	cmp	x9, x8
 8a547b0: 540000c1     	b.ne	0x8a547c8 <_ChromeMain+0x8a4f52c>
 8a547b4: aa1303e0     	mov	x0, x19
 8a547b8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 8a547bc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 8a547c0: 910143ff     	add	sp, sp, #0x50
 8a547c4: 150583ee     	b	0xcbb577c <dyld_stub_binder+0xcbb577c>
