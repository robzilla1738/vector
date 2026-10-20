
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462b330:      	stp	x22, x21, [sp, #-0x30]!
 462b334:      	stp	x20, x19, [sp, #0x10]
 462b338:      	stp	x29, x30, [sp, #0x20]
 462b33c:      	add	x29, sp, #0x20
 462b340:      	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 462b344:      	ldr	x19, [x21, #0x838]
 462b348:      	cbnz	x19, 0x462b3d4 <_ChromeMain+0x4626138>
 462b34c:      	mov	w0, #0x68               ; =104
 462b350:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462b354:      	mov	x19, x0
 462b358:      	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462b35c:      	add	x1, x1, #0xb1e
 462b360:      	mov	w2, #0x45               ; =69
 462b364:      	mov	w3, #0x1631             ; =5681
 462b368:      	bl	0x527578 <_ChromeMain+0x5222dc>
 462b36c:      	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 462b370:      	add	x8, x8, #0x678
 462b374:      	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462b378:      	add	x9, x9, #0xa6c
 462b37c:      	stp	x8, x9, [x0]
 462b380:      	mov	w8, #0x33               ; =51
 462b384:      	str	x8, [x0, #0x10]
 462b388:      	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 462b38c:      	ldr	x20, [x22, #0xc0]
 462b390:      	cbz	x20, 0x462b3e8 <_ChromeMain+0x462614c>
 462b394:      	and	x8, x20, #0xfffffffc00000000
 462b398:      	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462b39c:      	ldr	x9, [x22, #0x88]
 462b3a0:      	cmp	x8, x9
 462b3a4:      	b.ne	0x462b3b0 <_ChromeMain+0x4626114>
 462b3a8:      	mov	x0, x20
 462b3ac:      	bl	0x142fc <_ChromeMain+0xf060>
 462b3b0:      	ldr	x0, [x19, #0x48]
 462b3b4:      	and	x8, x0, #0xfffffffc00000000
 462b3b8:      	ldr	x9, [x22, #0x88]
 462b3bc:      	cmp	x8, x9
 462b3c0:      	b.eq	0x462b428 <_ChromeMain+0x462618c>
 462b3c4:      	str	x20, [x19, #0x48]
 462b3c8:      	mov	x0, x19
 462b3cc:      	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 462b3d0:      	str	x19, [x21, #0x838]
 462b3d4:      	mov	x0, x19
 462b3d8:      	ldp	x29, x30, [sp, #0x20]
 462b3dc:      	ldp	x20, x19, [sp, #0x10]
 462b3e0:      	ldp	x22, x21, [sp], #0x30
 462b3e4:      	ret
 462b3e8:      	mov	w0, #0x68               ; =104
 462b3ec:      	bl	0xf368 <_ChromeMain+0xa0cc>
 462b3f0:      	mov	x20, x0
 462b3f4:      	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 462b3f8:      	add	x1, x1, #0x90b
 462b3fc:      	mov	w2, #0x15               ; =21
 462b400:      	mov	w3, #0x14f              ; =335
 462b404:      	bl	0x527578 <_ChromeMain+0x5222dc>
 462b408:      	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 462b40c:      	add	x8, x8, #0x838
 462b410:      	str	x8, [x0]
 462b414:      	bl	0x2375a18 <_ChromeMain+0x237077c>
 462b418:      	mov	x0, x20
 462b41c:      	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 462b420:      	str	x20, [x22, #0xc0]
 462b424:      	b	0x462b394 <_ChromeMain+0x46260f8>
 462b428:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462b42c:      	b	0x462b3c4 <_ChromeMain+0x4626128>
 462b430:      	b	0x462b330 <_ChromeMain+0x4626094>
 462b434:      	b	0x462b330 <_ChromeMain+0x4626094>
