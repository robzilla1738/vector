
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2f945a8: f9404278     	ldr	x24, [x19, #0x80]
 2f945ac: 52800600     	mov	w0, #0x30               ; =48
 2f945b0: 9741eb6e     	bl	0xf368 <_ChromeMain+0xa0cc>
 2f945b4: b9400ac8     	ldr	w8, [x22, #0x8]
 2f945b8: 31000508     	adds	w8, w8, #0x1
 2f945bc: b9000ac8     	str	w8, [x22, #0x8]
 2f945c0: 54002842     	b.hs	0x2f94ac8 <_ChromeMain+0x2f8f82c>
 2f945c4: aa0003f7     	mov	x23, x0
 2f945c8: d00589c8     	adrp	x8, 0xe0ce000 <dyld_stub_binder+0xe0ce000>
 2f945cc: 9101c108     	add	x8, x8, #0x70
 2f945d0: a9006408     	stp	x8, x25, [x0]
 2f945d4: 925e7708     	and	x8, x24, #0xfffffffc00000000
 2f945d8: d005e0e9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2f945dc: f9404529     	ldr	x9, [x9, #0x88]
 2f945e0: eb09011f     	cmp	x8, x9
 2f945e4: 54000061     	b.ne	0x2f945f0 <_ChromeMain+0x2f8f354>
 2f945e8: aa1803e0     	mov	x0, x24
 2f945ec: 9741ff44     	bl	0x142fc <_ChromeMain+0xf060>
 2f945f0: f9000af8     	str	x24, [x23, #0x10]
 2f945f4: b9001af4     	str	w20, [x23, #0x18]
 2f945f8: f90012f6     	str	x22, [x23, #0x20]
 2f945fc: b9400ac8     	ldr	w8, [x22, #0x8]
 2f94600: 31000508     	adds	w8, w8, #0x1
 2f94604: b9000ac8     	str	w8, [x22, #0x8]
 2f94608: 54002662     	b.hs	0x2f94ad4 <_ChromeMain+0x2f8f838>
 2f9460c: 3900a2fa     	strb	w26, [x23, #0x28]
 2f94610: a9442ac9     	ldp	x9, x10, [x22, #0x40]
