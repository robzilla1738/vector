
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7fb6840: d10103ff     	sub	sp, sp, #0x40
 7fb6844: a90157f6     	stp	x22, x21, [sp, #0x10]
 7fb6848: a9024ff4     	stp	x20, x19, [sp, #0x20]
 7fb684c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 7fb6850: 9100c3fd     	add	x29, sp, #0x30
 7fb6854: aa0103f4     	mov	x20, x1
 7fb6858: aa0003f3     	mov	x19, x0
 7fb685c: 97fff836     	bl	0x7fb4934 <_ChromeMain+0x7faf698>
 7fb6860: d00336a8     	adrp	x8, 0xe68c000 <dyld_stub_binder+0xe68c000>
 7fb6864: 91034108     	add	x8, x8, #0xd0
 7fb6868: 91116109     	add	x9, x8, #0x458
 7fb686c: a9002408     	stp	x8, x9, [x0]
 7fb6870: 91120109     	add	x9, x8, #0x480
 7fb6874: f9000809     	str	x9, [x0, #0x10]
 7fb6878: 9112e109     	add	x9, x8, #0x4b8
 7fb687c: 9113a10a     	add	x10, x8, #0x4e8
 7fb6880: a906a809     	stp	x9, x10, [x0, #0x68]
 7fb6884: 9114e109     	add	x9, x8, #0x538
 7fb6888: f9005809     	str	x9, [x0, #0xb0]
 7fb688c: 91166109     	add	x9, x8, #0x598
 7fb6890: f9006c09     	str	x9, [x0, #0xd8]
 7fb6894: 91172109     	add	x9, x8, #0x5c8
 7fb6898: f9007c09     	str	x9, [x0, #0xf8]
 7fb689c: 9117c109     	add	x9, x8, #0x5f0
 7fb68a0: f9018809     	str	x9, [x0, #0x310]
 7fb68a4: 91184109     	add	x9, x8, #0x610
 7fb68a8: f9018c09     	str	x9, [x0, #0x318]
 7fb68ac: 9118e108     	add	x8, x8, #0x638
 7fb68b0: f9019c08     	str	x8, [x0, #0x338]
 7fb68b4: b4000594     	cbz	x20, 0x7fb6964 <_ChromeMain+0x7fb16c8>
 7fb68b8: aa1403e0     	mov	x0, x20
 7fb68bc: 97088d7c     	bl	0x41d9eac <_ChromeMain+0x41d4c10>
 7fb68c0: 7100081f     	cmp	w0, #0x2
 7fb68c4: 1a9f07e8     	cset	w8, ne
 7fb68c8: 39102268     	strb	w8, [x19, #0x408]
 7fb68cc: 52800028     	mov	w8, #0x1                ; =1
 7fb68d0: 39102668     	strb	w8, [x19, #0x409]
 7fb68d4: 91104260     	add	x0, x19, #0x410
 7fb68d8: 961de72a     	bl	0x730580 <_ChromeMain+0x72b2e4>
 7fb68dc: 925e7668     	and	x8, x19, #0xfffffffc00000000
 7fb68e0: 90035fe9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7fb68e4: f9404529     	ldr	x9, [x9, #0x88]
 7fb68e8: eb09011f     	cmp	x8, x9
 7fb68ec: 54000061     	b.ne	0x7fb68f8 <_ChromeMain+0x7fb165c>
 7fb68f0: aa1303e0     	mov	x0, x19
 7fb68f4: 96017682     	bl	0x142fc <_ChromeMain+0xf060>
 7fb68f8: 52800700     	mov	w0, #0x38               ; =56
 7fb68fc: 9601629b     	bl	0xf368 <_ChromeMain+0xa0cc>
 7fb6900: aa0003f5     	mov	x21, x0
 7fb6904: f0fdfda1     	adrp	x1, 0x3f6d000 <_ChromeMain+0x3f67d64>
 7fb6908: 91050021     	add	x1, x1, #0x140
 7fb690c: d0fcd862     	adrp	x2, 0x1ac4000 <_ChromeMain+0x1abed64>
 7fb6910: 91180042     	add	x2, x2, #0x600
 7fb6914: 96970307     	bl	0x2577530 <_ChromeMain+0x2572294>
 7fb6918: 10000308     	adr	x8, 0x7fb6978 <_ChromeMain+0x7fb16dc>
 7fb691c: d503201f     	nop
 7fb6920: a9027c08     	stp	x8, xzr, [x0, #0x20]
 7fb6924: f9001813     	str	x19, [x0, #0x30]
 7fb6928: 910023e8     	add	x8, sp, #0x8
 7fb692c: aa1403e0     	mov	x0, x20
 7fb6930: aa1503e1     	mov	x1, x21
 7fb6934: 96e984e3     	bl	0x3a17cc0 <_ChromeMain+0x3a12a24>
 7fb6938: 91104260     	add	x0, x19, #0x410
 7fb693c: 910023e1     	add	x1, sp, #0x8
 7fb6940: 96224064     	bl	0x846ad0 <_ChromeMain+0x841834>
 7fb6944: 910023e0     	add	x0, sp, #0x8
 7fb6948: 96795703     	bl	0x1e0c554 <_ChromeMain+0x1e072b8>
 7fb694c: aa1303e0     	mov	x0, x19
 7fb6950: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 7fb6954: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 7fb6958: a94157f6     	ldp	x22, x21, [sp, #0x10]
 7fb695c: 910103ff     	add	sp, sp, #0x40
 7fb6960: d65f03c0     	ret
 7fb6964: 52802008     	mov	w8, #0x100              ; =256
 7fb6968: 79081268     	strh	w8, [x19, #0x408]
 7fb696c: 91104260     	add	x0, x19, #0x410
 7fb6970: 961de704     	bl	0x730580 <_ChromeMain+0x72b2e4>
 7fb6974: 17fffff6     	b	0x7fb694c <_ChromeMain+0x7fb16b0>
 7fb6978: 7100083f     	cmp	w1, #0x2
 7fb697c: 1a9f07e8     	cset	w8, ne
 7fb6980: 39502009     	ldrb	w9, [x0, #0x408]
 7fb6984: 6b08013f     	cmp	w9, w8
 7fb6988: 54000041     	b.ne	0x7fb6990 <_ChromeMain+0x7fb16f4>
 7fb698c: d65f03c0     	ret
 7fb6990: 39102008     	strb	w8, [x0, #0x408]
 7fb6994: 52800001     	mov	w1, #0x0                ; =0
 7fb6998: 1619e6b7     	b	0x630474 <_ChromeMain+0x62b1d8>
