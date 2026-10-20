
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457a618: 52801bc8     	mov	w8, #0xde               ; =222
 457a61c: b90123e8     	str	w8, [sp, #0x120]
 457a620: 390493ff     	strb	wzr, [sp, #0x124]
 457a624: d10343a8     	sub	x8, x29, #0xd0
 457a628: 910483e1     	add	x1, sp, #0x120
 457a62c: 52800202     	mov	w2, #0x10               ; =16
 457a630: d2800003     	mov	x3, #0x0                ; =0
 457a634: 9721e8bb     	bl	0xdf4920 <_ChromeMain+0xdef684>
 457a638: 90054c88     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 457a63c: 91120108     	add	x8, x8, #0x480
 457a640: f8bfc100     	ldapr	x0, [x8]
 457a644: b40029e0     	cbz	x0, 0x457ab80 <_ChromeMain+0x45758e4>
 457a648: 52807001     	mov	w1, #0x380              ; =896
 457a64c: d2800002     	mov	x2, #0x0                ; =0
 457a650: 96ecc3d8     	bl	0xab5b0 <_ChromeMain+0xa6314>
 457a654: aa0003f5     	mov	x21, x0
 457a658: d10343a1     	sub	x1, x29, #0xd0
 457a65c: 95843201     	bl	0xa686e60 <_ChromeMain+0xa681bc4>
 457a660: d10343a0     	sub	x0, x29, #0xd0
 457a664: 970b3077     	bl	0x846840 <_ChromeMain+0x8415a4>
 457a668: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 457a66c: 340000a8     	cbz	w8, 0x457a680 <_ChromeMain+0x45753e4>
 457a670: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 457a674: 9103e2a0     	add	x0, x21, #0xf8
 457a678: 9106a6a1     	add	x1, x21, #0x1a9
 457a67c: 9726b655     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 457a680: 910c42a8     	add	x8, x21, #0x310
 457a684: 394c62a9     	ldrb	w9, [x21, #0x318]
 457a688: 350028e9     	cbnz	w9, 0x457aba4 <_ChromeMain+0x4575908>
 457a68c: b40022c8     	cbz	x8, 0x457aae4 <_ChromeMain+0x4575848>
 457a690: b21c03e8     	mov	x8, #0x1000000010       ; =68719476752
 457a694: f9018aa8     	str	x8, [x21, #0x310]
 457a698: 52800028     	mov	w8, #0x1                ; =1
 457a69c: 390c62a8     	strb	w8, [x21, #0x318]
 457a6a0: f940c6a0     	ldr	x0, [x21, #0x188]
 457a6a4: b40000a0     	cbz	x0, 0x457a6b8 <_ChromeMain+0x457541c>
 457a6a8: f9400008     	ldr	x8, [x0]
 457a6ac: f9417d08     	ldr	x8, [x8, #0x2f8]
 457a6b0: aa1503e1     	mov	x1, x21
 457a6b4: d63f0100     	blr	x8
 457a6b8: aa1503e0     	mov	x0, x21
 457a6bc: 52800001     	mov	w1, #0x0                ; =0
 457a6c0: 9702d76d     	bl	0x630474 <_ChromeMain+0x62b1d8>
 457a6c4: f81303b5     	stur	x21, [x29, #-0xd0]
 457a6c8: 9104c2a0     	add	x0, x21, #0x130
 457a6cc: d10343a3     	sub	x3, x29, #0xd0
 457a6d0: 52800301     	mov	w1, #0x18               ; =24
 457a6d4: 52800022     	mov	w2, #0x1                ; =1
 457a6d8: 970cb2be     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 457a6dc: aa1503e0     	mov	x0, x21
 457a6e0: 97337102     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 457a6e4: aa1503e0     	mov	x0, x21
 457a6e8: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 457a6ec: 52800022     	mov	w2, #0x1                ; =1
 457a6f0: 97895cdc     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 457a6f4: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 457a6f8: 52800108     	mov	w8, #0x8                ; =8
 457a6fc: b81343a8     	stur	w8, [x29, #-0xcc]
 457a700: f0052441     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 457a704: 91122021     	add	x1, x1, #0x488
 457a708: 910362a0     	add	x0, x21, #0xd8
 457a70c: d10343a2     	sub	x2, x29, #0xd0
 457a710: 97a2281c     	bl	0x2e04780 <_ChromeMain+0x2dff4e4>
