
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2f94280: 52800600     	mov	w0, #0x30               ; =48
 2f94284: 9741ec39     	bl	0xf368 <_ChromeMain+0xa0cc>
 2f94288: aa0003f7     	mov	x23, x0
 2f9428c: b40000b6     	cbz	x22, 0x2f942a0 <_ChromeMain+0x2f8f004>
 2f94290: b9400ac8     	ldr	w8, [x22, #0x8]
 2f94294: 31000508     	adds	w8, w8, #0x1
 2f94298: b9000ac8     	str	w8, [x22, #0x8]
 2f9429c: 540044e2     	b.hs	0x2f94b38 <_ChromeMain+0x2f8f89c>
 2f942a0: d00589c8     	adrp	x8, 0xe0ce000 <dyld_stub_binder+0xe0ce000>
 2f942a4: 9101c108     	add	x8, x8, #0x70
 2f942a8: a90066e8     	stp	x8, x25, [x23]
 2f942ac: 925e7708     	and	x8, x24, #0xfffffffc00000000
 2f942b0: f9404769     	ldr	x9, [x27, #0x88]
 2f942b4: eb09011f     	cmp	x8, x9
 2f942b8: 54000061     	b.ne	0x2f942c4 <_ChromeMain+0x2f8f028>
 2f942bc: aa1803e0     	mov	x0, x24
 2f942c0: 9742000f     	bl	0x142fc <_ChromeMain+0xf060>
 2f942c4: f9000af8     	str	x24, [x23, #0x10]
 2f942c8: b9001af4     	str	w20, [x23, #0x18]
 2f942cc: f90012f6     	str	x22, [x23, #0x20]
 2f942d0: b40004d6     	cbz	x22, 0x2f94368 <_ChromeMain+0x2f8f0cc>
 2f942d4: b9400ac8     	ldr	w8, [x22, #0x8]
 2f942d8: 31000509     	adds	w9, w8, #0x1
 2f942dc: b9000ac9     	str	w9, [x22, #0x8]
 2f942e0: 54004322     	b.hs	0x2f94b44 <_ChromeMain+0x2f8f8a8>
 2f942e4: 3900a2fa     	strb	w26, [x23, #0x28]
 2f942e8: a9442eca     	ldp	x10, x11, [x22, #0x40]
 2f942ec: d37ced69     	lsl	x9, x11, #4
