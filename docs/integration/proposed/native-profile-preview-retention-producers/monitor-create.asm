
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 33f5744: f9400268     	ldr	x8, [x19]
 33f5748: f9403108     	ldr	x8, [x8, #0x60]
 33f574c: eb17011f     	cmp	x8, x23
 33f5750: 54fffec1     	b.ne	0x33f5728 <_ChromeMain+0x33f048c>
 33f5754: f940c260     	ldr	x0, [x19, #0x180]
 33f5758: b4ffecc0     	cbz	x0, 0x33f54f0 <_ChromeMain+0x33f0254>
 33f575c: f9400268     	ldr	x8, [x19]
 33f5760: f9403108     	ldr	x8, [x8, #0x60]
 33f5764: eb17011f     	cmp	x8, x23
 33f5768: 54fffd21     	b.ne	0x33f570c <_ChromeMain+0x33f0470>
 33f576c: f940c260     	ldr	x0, [x19, #0x180]
 33f5770: 97955964     	bl	0x194bd00 <_ChromeMain+0x1946a64>
 33f5774: b4ffebe0     	cbz	x0, 0x33f54f0 <_ChromeMain+0x33f0254>
 33f5778: aa0003f4     	mov	x20, x0
 33f577c: f9407008     	ldr	x8, [x0, #0xe0]
 33f5780: b4000fc8     	cbz	x8, 0x33f5978 <_ChromeMain+0x33f06dc>
 33f5784: 19404108     	ldapurb	w8, [x8, #0x4]
 33f5788: 35000f88     	cbnz	w8, 0x33f5978 <_ChromeMain+0x33f06dc>
 33f578c: f9407688     	ldr	x8, [x20, #0xe8]
 33f5790: b4000f48     	cbz	x8, 0x33f5978 <_ChromeMain+0x33f06dc>
 33f5794: f9407288     	ldr	x8, [x20, #0xe0]
 33f5798: b4001128     	cbz	x8, 0x33f59bc <_ChromeMain+0x33f0720>
 33f579c: 19404108     	ldapurb	w8, [x8, #0x4]
 33f57a0: 350010e8     	cbnz	w8, 0x33f59bc <_ChromeMain+0x33f0720>
 33f57a4: f9407688     	ldr	x8, [x20, #0xe8]
 33f57a8: f9402508     	ldr	x8, [x8, #0x48]
 33f57ac: b40011e8     	cbz	x8, 0x33f59e8 <_ChromeMain+0x33f074c>
 33f57b0: f940a516     	ldr	x22, [x8, #0x148]
 33f57b4: aa1603e0     	mov	x0, x22
 33f57b8: 953037ec     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f57bc: 953037eb     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f57c0: 953037ea     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f57c4: 52800100     	mov	w0, #0x8                ; =8
 33f57c8: 973066e8     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f57cc: aa0003f5     	mov	x21, x0
 33f57d0: f900001f     	str	xzr, [x0]
 33f57d4: aa1603e1     	mov	x1, x22
 33f57d8: 9549da4a     	bl	0x866c100 <_ChromeMain+0x8666e64>
 33f57dc: aa1603e0     	mov	x0, x22
 33f57e0: 953037df     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f57e4: aa1603e0     	mov	x0, x22
 33f57e8: 953037dd     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f57ec: aa1603e0     	mov	x0, x22
 33f57f0: 953037db     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f57f4: aa1503e0     	mov	x0, x21
 33f57f8: 9549da45     	bl	0x866c10c <_ChromeMain+0x8666e70>
 33f57fc: aa0003f6     	mov	x22, x0
 33f5800: 953037d7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f5804: b40000d5     	cbz	x21, 0x33f581c <_ChromeMain+0x33f0580>
 33f5808: aa1503e0     	mov	x0, x21
 33f580c: 9549da43     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 33f5810: aa1503e0     	mov	x0, x21
 33f5814: 52800101     	mov	w1, #0x8                ; =8
 33f5818: 97304da8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 33f581c: b4ffe6b6     	cbz	x22, 0x33f54f0 <_ChromeMain+0x33f0254>
 33f5820: f9407288     	ldr	x8, [x20, #0xe0]
 33f5824: b4000b48     	cbz	x8, 0x33f598c <_ChromeMain+0x33f06f0>
 33f5828: 19404108     	ldapurb	w8, [x8, #0x4]
 33f582c: 35000b08     	cbnz	w8, 0x33f598c <_ChromeMain+0x33f06f0>
 33f5830: f9407688     	ldr	x8, [x20, #0xe8]
 33f5834: b4000ac8     	cbz	x8, 0x33f598c <_ChromeMain+0x33f06f0>
 33f5838: f9407288     	ldr	x8, [x20, #0xe0]
 33f583c: b4000ba8     	cbz	x8, 0x33f59b0 <_ChromeMain+0x33f0714>
 33f5840: 19404108     	ldapurb	w8, [x8, #0x4]
 33f5844: 35000b68     	cbnz	w8, 0x33f59b0 <_ChromeMain+0x33f0714>
 33f5848: f9407688     	ldr	x8, [x20, #0xe8]
 33f584c: f9402508     	ldr	x8, [x8, #0x48]
 33f5850: b4000e48     	cbz	x8, 0x33f5a18 <_ChromeMain+0x33f077c>
 33f5854: f940a514     	ldr	x20, [x8, #0x148]
 33f5858: aa1403e0     	mov	x0, x20
 33f585c: 953037c3     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f5860: 953037c2     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f5864: 953037c1     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f5868: 52800100     	mov	w0, #0x8                ; =8
 33f586c: 973066bf     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f5870: aa0003f5     	mov	x21, x0
 33f5874: f900001f     	str	xzr, [x0]
 33f5878: aa1403e1     	mov	x1, x20
 33f587c: 9549da21     	bl	0x866c100 <_ChromeMain+0x8666e64>
 33f5880: aa1403e0     	mov	x0, x20
 33f5884: 953037b6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f5888: aa1403e0     	mov	x0, x20
 33f588c: 953037b4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f5890: aa1403e0     	mov	x0, x20
 33f5894: 953037b2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 33f5898: a901d3f5     	stp	x21, x20, [sp, #0x18]
 33f589c: 52800400     	mov	w0, #0x20               ; =32
 33f58a0: 973066b2     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f58a4: b40008a0     	cbz	x0, 0x33f59b8 <_ChromeMain+0x33f071c>
 33f58a8: 52800048     	mov	w8, #0x2                ; =2
 33f58ac: b9001c08     	str	w8, [x0, #0x1c]
 33f58b0: 910003e8     	mov	x8, sp
 33f58b4: 91002108     	add	x8, x8, #0x8
 33f58b8: a9007c1f     	stp	xzr, xzr, [x0]
 33f58bc: f9000808     	str	x8, [x0, #0x10]
 33f58c0: a90003e0     	stp	x0, x0, [sp]
 33f58c4: 52800028     	mov	w8, #0x1                ; =1
 33f58c8: 39006008     	strb	w8, [x0, #0x18]
 33f58cc: f9000be8     	str	x8, [sp, #0x10]
 33f58d0: aa0003e8     	mov	x8, x0
 33f58d4: f9400400     	ldr	x0, [x0, #0x8]
 33f58d8: b5ffffc0     	cbnz	x0, 0x33f58d0 <_ChromeMain+0x33f0634>
 33f58dc: 910003f5     	mov	x21, sp
 33f58e0: 9100a3f6     	add	x22, sp, #0x28
 33f58e4: a902d7e8     	stp	x8, x21, [sp, #0x28]
 33f58e8: f9001ff6     	str	x22, [sp, #0x38]
 33f58ec: 90051794     	adrp	x20, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 33f58f0: 9103b294     	add	x20, x20, #0xec
 33f58f4: 9100c3e0     	add	x0, sp, #0x30
 33f58f8: aa1403e1     	mov	x1, x20
 33f58fc: aa1403e2     	mov	x2, x20
 33f5900: 97d91a70     	bl	0x2a3c2c0 <_ChromeMain+0x2a37024>
 33f5904: a9035bf5     	stp	x21, x22, [sp, #0x30]
 33f5908: 9100c3e0     	add	x0, sp, #0x30
 33f590c: 91001281     	add	x1, x20, #0x4
 33f5910: 91001282     	add	x2, x20, #0x4
 33f5914: 97d91a6b     	bl	0x2a3c2c0 <_ChromeMain+0x2a37024>
 33f5918: 9115a260     	add	x0, x19, #0x568
 33f591c: 910063e1     	add	x1, sp, #0x18
 33f5920: 910003e2     	mov	x2, sp
 33f5924: 97e3a338     	bl	0x2cde604 <_ChromeMain+0x2cd9368>
 33f5928: aa0003e8     	mov	x8, x0
 33f592c: f9450260     	ldr	x0, [x19, #0xa00]
 33f5930: f9050268     	str	x8, [x19, #0xa00]
 33f5934: b4000080     	cbz	x0, 0x33f5944 <_ChromeMain+0x33f06a8>
 33f5938: f9400008     	ldr	x8, [x0]
 33f593c: f9400508     	ldr	x8, [x8, #0x8]
 33f5940: d63f0100     	blr	x8
 33f5944: f94007e1     	ldr	x1, [sp, #0x8]
 33f5948: f9001bf5     	str	x21, [sp, #0x30]
 33f594c: 9100c3e0     	add	x0, sp, #0x30
 33f5950: 974dfa7c     	bl	0x774340 <_ChromeMain+0x76f0a4>
 33f5954: f9400ff4     	ldr	x20, [sp, #0x18]
 33f5958: f9000fff     	str	xzr, [sp, #0x18]
 33f595c: b4ffdcb4     	cbz	x20, 0x33f54f0 <_ChromeMain+0x33f0254>
 33f5960: aa1403e0     	mov	x0, x20
 33f5964: 9549d9ed     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 33f5968: aa1403e0     	mov	x0, x20
 33f596c: 52800101     	mov	w1, #0x8                ; =8
 33f5970: 97304d52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 33f5974: 17fffedf     	b	0x33f54f0 <_ChromeMain+0x33f0254>
 33f5978: 52800100     	mov	w0, #0x8                ; =8
 33f597c: 9730667b     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f5980: aa0003f5     	mov	x21, x0
 33f5984: f900001f     	str	xzr, [x0]
 33f5988: 17ffff9b     	b	0x33f57f4 <_ChromeMain+0x33f0558>
 33f598c: 52800100     	mov	w0, #0x8                ; =8
 33f5990: 97306676     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f5994: aa0003f5     	mov	x21, x0
 33f5998: d2800014     	mov	x20, #0x0               ; =0
 33f599c: f900001f     	str	xzr, [x0]
 33f59a0: 17ffffbe     	b	0x33f5898 <_ChromeMain+0x33f05fc>
 33f59a4: d4200000     	brk	#0
 33f59a8: d4400000     	hlt	#0
 33f59ac: d4200020     	brk	#0x1
 33f59b0: d4200000     	brk	#0
 33f59b4: d4400000     	hlt	#0
 33f59b8: d4200020     	brk	#0x1
 33f59bc: d4200000     	brk	#0
 33f59c0: d4400000     	hlt	#0
 33f59c4: d4200020     	brk	#0x1
 33f59c8: b4ffe320     	cbz	x0, 0x33f562c <_ChromeMain+0x33f0390>
 33f59cc: d4200000     	brk	#0
 33f59d0: d4400000     	hlt	#0
 33f59d4: d4200020     	brk	#0x1
 33f59d8: b4ffe480     	cbz	x0, 0x33f5668 <_ChromeMain+0x33f03cc>
 33f59dc: d4200000     	brk	#0
 33f59e0: d4400000     	hlt	#0
 33f59e4: d4200020     	brk	#0x1
 33f59e8: d2800000     	mov	x0, #0x0                ; =0
 33f59ec: 9530375f     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f59f0: d2800000     	mov	x0, #0x0                ; =0
 33f59f4: 9530375d     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f59f8: 52800100     	mov	w0, #0x8                ; =8
 33f59fc: 9730665b     	bl	0xf368 <_ChromeMain+0xa0cc>
 33f5a00: aa0003f5     	mov	x21, x0
 33f5a04: f900001f     	str	xzr, [x0]
 33f5a08: d2800001     	mov	x1, #0x0                ; =0
 33f5a0c: 9549d9bd     	bl	0x866c100 <_ChromeMain+0x8666e64>
 33f5a10: d2800016     	mov	x22, #0x0               ; =0
 33f5a14: 17ffff74     	b	0x33f57e4 <_ChromeMain+0x33f0548>
 33f5a18: d2800000     	mov	x0, #0x0                ; =0
 33f5a1c: 95303753     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f5a20: d2800000     	mov	x0, #0x0                ; =0
 33f5a24: 95303751     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 33f5a28: 52800100     	mov	w0, #0x8                ; =8
 33f5a2c: 9730664f     	bl	0xf368 <_ChromeMain+0xa0cc>
