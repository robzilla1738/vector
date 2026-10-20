
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7820828: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 782082c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7820830: 910043fd     	add	x29, sp, #0x10
 7820834: aa0003f3     	mov	x19, x0
 7820838: 90034c88     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 782083c: 910b4108     	add	x8, x8, #0x2d0
 7820840: f9000008     	str	x8, [x0]
 7820844: 91048000     	add	x0, x0, #0x120
 7820848: 966f4b2e     	bl	0x13f3500 <_ChromeMain+0x13ee264>
 782084c: 91022260     	add	x0, x19, #0x88
 7820850: 97e74976     	bl	0x71f2e28 <_ChromeMain+0x71edb8c>
 7820854: f9404260     	ldr	x0, [x19, #0x80]
 7820858: 925e7408     	and	x8, x0, #0xfffffffc00000000
 782085c: d0039c94     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7820860: f9404689     	ldr	x9, [x20, #0x88]
 7820864: eb09011f     	cmp	x8, x9
 7820868: 54000041     	b.ne	0x7820870 <_ChromeMain+0x781b5d4>
 782086c: 96201876     	bl	0x26a44 <_ChromeMain+0x217a8>
 7820870: f900427f     	str	xzr, [x19, #0x80]
 7820874: f9403e60     	ldr	x0, [x19, #0x78]
 7820878: b40000c0     	cbz	x0, 0x7820890 <_ChromeMain+0x781b5f4>
 782087c: 91002008     	add	x8, x0, #0x8
 7820880: 12800009     	mov	w9, #-0x1               ; =-1
 7820884: b8e90108     	ldaddal	w9, w8, [x8]
 7820888: 7100051f     	cmp	w8, #0x1
 782088c: 54000400     	b.eq	0x782090c <_ChromeMain+0x781b670>
 7820890: f9403660     	ldr	x0, [x19, #0x68]
 7820894: b5000400     	cbnz	x0, 0x7820914 <_ChromeMain+0x781b678>
 7820898: 91016260     	add	x0, x19, #0x58
 782089c: 9697af2e     	bl	0x1e0c554 <_ChromeMain+0x1e072b8>
 78208a0: 91012260     	add	x0, x19, #0x48
 78208a4: 96c0317c     	bl	0x282ce94 <_ChromeMain+0x2827bf8>
 78208a8: f9402260     	ldr	x0, [x19, #0x40]
 78208ac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 78208b0: f9404689     	ldr	x9, [x20, #0x88]
 78208b4: eb09011f     	cmp	x8, x9
 78208b8: 54000041     	b.ne	0x78208c0 <_ChromeMain+0x781b624>
 78208bc: 96200860     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 78208c0: f9401e60     	ldr	x0, [x19, #0x38]
 78208c4: a903fe7f     	stp	xzr, xzr, [x19, #0x38]
 78208c8: b4000080     	cbz	x0, 0x78208d8 <_ChromeMain+0x781b63c>
 78208cc: 940000b9     	bl	0x7820bb0 <_ChromeMain+0x781b914>
 78208d0: 52800701     	mov	w1, #0x38               ; =56
 78208d4: 961fa179     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 78208d8: f9401a60     	ldr	x0, [x19, #0x30]
 78208dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 78208e0: f9404689     	ldr	x9, [x20, #0x88]
 78208e4: eb09011f     	cmp	x8, x9
 78208e8: 54000041     	b.ne	0x78208f0 <_ChromeMain+0x781b654>
 78208ec: 96201856     	bl	0x26a44 <_ChromeMain+0x217a8>
 78208f0: f9001a7f     	str	xzr, [x19, #0x30]
 78208f4: 91008260     	add	x0, x19, #0x20
 78208f8: 96c8bb43     	bl	0x2a4f604 <_ChromeMain+0x2a4a368>
 78208fc: aa1303e0     	mov	x0, x19
 7820900: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7820904: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7820908: 16da5353     	b	0x2eb5654 <_ChromeMain+0x2eb03b8>
 782090c: 94000aa2     	bl	0x7823394 <_ChromeMain+0x781e0f8>
 7820910: 17ffffe0     	b	0x7820890 <_ChromeMain+0x781b5f4>
 7820914: 12800008     	mov	w8, #-0x1               ; =-1
 7820918: b8e80008     	ldaddal	w8, w8, [x0]
 782091c: 7100051f     	cmp	w8, #0x1
 7820920: 54fffbc1     	b.ne	0x7820898 <_ChromeMain+0x781b5fc>
 7820924: f9400808     	ldr	x8, [x0, #0x10]
 7820928: d63f0100     	blr	x8
 782092c: 17ffffdb     	b	0x7820898 <_ChromeMain+0x781b5fc>
