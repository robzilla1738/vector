
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7dc3690: 5280003a     	mov	w26, #0x1               ; =1
 7dc3694: b900001a     	str	w26, [x0]
 7dc3698: d0fe0d56     	adrp	x22, 0x3f6d000 <_ChromeMain+0x3f67d64>
 7dc369c: 910502d6     	add	x22, x22, #0x140
 7dc36a0: b0fce817     	adrp	x23, 0x1ac4000 <_ChromeMain+0x1abed64>
 7dc36a4: 911802f7     	add	x23, x23, #0x600
 7dc36a8: a900dc16     	stp	x22, x23, [x0, #0x8]
 7dc36ac: d0fd3cd8     	adrp	x24, 0x255d000 <_ChromeMain+0x2557d64>
 7dc36b0: 912c0318     	add	x24, x24, #0xb00
 7dc36b4: 10000708     	adr	x8, 0x7dc3794 <_ChromeMain+0x7dbe4f8>
 7dc36b8: d503201f     	nop
 7dc36bc: a901a018     	stp	x24, x8, [x0, #0x18]
 7dc36c0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 7dc36c4: d002e941     	adrp	x1, 0xdaed000 <dyld_stub_binder+0xdaed000>
 7dc36c8: 912ae821     	add	x1, x1, #0xaba
 7dc36cc: aa1403e0     	mov	x0, x20
 7dc36d0: 528002c2     	mov	w2, #0x16               ; =22
 7dc36d4: 969734e5     	bl	0x2390a68 <_ChromeMain+0x238b7cc>
 7dc36d8: f9400a74     	ldr	x20, [x19, #0x10]
 7dc36dc: f94046a8     	ldr	x8, [x21, #0x88]
 7dc36e0: eb08033f     	cmp	x25, x8
 7dc36e4: 54000061     	b.ne	0x7dc36f0 <_ChromeMain+0x7dbe454>
 7dc36e8: aa1303e0     	mov	x0, x19
 7dc36ec: 96094304     	bl	0x142fc <_ChromeMain+0xf060>
 7dc36f0: 52800700     	mov	w0, #0x38               ; =56
 7dc36f4: 96092f1d     	bl	0xf368 <_ChromeMain+0xa0cc>
 7dc36f8: aa0003e3     	mov	x3, x0
 7dc36fc: b900001a     	str	w26, [x0]
 7dc3700: a900dc16     	stp	x22, x23, [x0, #0x8]
 7dc3704: 10000e08     	adr	x8, 0x7dc38c4 <_ChromeMain+0x7dbe628>
 7dc3708: d503201f     	nop
 7dc370c: a901a018     	stp	x24, x8, [x0, #0x18]
 7dc3710: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 7dc3714: d002e941     	adrp	x1, 0xdaed000 <dyld_stub_binder+0xdaed000>
 7dc3718: 912b4421     	add	x1, x1, #0xad1
 7dc371c: aa1403e0     	mov	x0, x20
 7dc3720: 52800142     	mov	w2, #0xa                ; =10
 7dc3724: 969734d1     	bl	0x2390a68 <_ChromeMain+0x238b7cc>
 7dc3728: f9400a74     	ldr	x20, [x19, #0x10]
 7dc372c: 925e7668     	and	x8, x19, #0xfffffffc00000000
