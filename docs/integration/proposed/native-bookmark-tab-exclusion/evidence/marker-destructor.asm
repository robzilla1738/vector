
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45f9410:      	stp	x20, x19, [sp, #-0x20]!
 45f9414:      	stp	x29, x30, [sp, #0x10]
 45f9418:      	add	x29, sp, #0x10
 45f941c:      	mov	x19, x0
 45f9420:      	adrp	x8, 0xe507000 <dyld_stub_binder+0xe507000>
 45f9424:      	add	x8, x8, #0xda0
 45f9428:      	str	x8, [x0]
 45f942c:      	ldrsb	w8, [x0, #0x57]
 45f9430:      	tbz	w8, #0x1f, 0x45f9444 <_ChromeMain+0x45f41a8>
 45f9434:      	ldr	x0, [x19, #0x40]
 45f9438:      	ldr	x8, [x19, #0x50]
 45f943c:      	and	x1, x8, #0x7fffffffffffffff
 45f9440:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f9444:      	ldrsb	w8, [x19, #0x37]
 45f9448:      	tbz	w8, #0x1f, 0x45f945c <_ChromeMain+0x45f41c0>
 45f944c:      	ldr	x0, [x19, #0x20]
 45f9450:      	ldr	x8, [x19, #0x30]
 45f9454:      	lsl	x1, x8, #1
 45f9458:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f945c:      	adrp	x8, 0xe507000 <dyld_stub_binder+0xe507000>
 45f9460:      	add	x8, x8, #0xdc8
 45f9464:      	str	x8, [x19]
 45f9468:      	ldr	x0, [x19, #0x8]
 45f946c:      	and	x8, x0, #0xfffffffc00000000
 45f9470:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45f9474:      	ldr	x9, [x9, #0x88]
 45f9478:      	cmp	x8, x9
 45f947c:      	b.ne	0x45f9484 <_ChromeMain+0x45f41e8>
 45f9480:      	bl	0x26a44 <_ChromeMain+0x217a8>
 45f9484:      	str	xzr, [x19, #0x8]
 45f9488:      	mov	x0, x19
 45f948c:      	ldp	x29, x30, [sp, #0x10]
 45f9490:      	ldp	x20, x19, [sp], #0x20
 45f9494:      	ret
 45f9498:      	stp	x20, x19, [sp, #-0x20]!
 45f949c:      	stp	x29, x30, [sp, #0x10]
 45f94a0:      	add	x29, sp, #0x10
 45f94a4:      	mov	x19, x0
 45f94a8:      	adrp	x8, 0xe507000 <dyld_stub_binder+0xe507000>
 45f94ac:      	add	x8, x8, #0xda0
 45f94b0:      	str	x8, [x0]
 45f94b4:      	ldrsb	w8, [x0, #0x57]
 45f94b8:      	tbz	w8, #0x1f, 0x45f94cc <_ChromeMain+0x45f4230>
 45f94bc:      	ldr	x0, [x19, #0x40]
 45f94c0:      	ldr	x8, [x19, #0x50]
 45f94c4:      	and	x1, x8, #0x7fffffffffffffff
 45f94c8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f94cc:      	ldrsb	w8, [x19, #0x37]
 45f94d0:      	tbz	w8, #0x1f, 0x45f94e4 <_ChromeMain+0x45f4248>
 45f94d4:      	ldr	x0, [x19, #0x20]
 45f94d8:      	ldr	x8, [x19, #0x30]
 45f94dc:      	lsl	x1, x8, #1
 45f94e0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45f94e4:      	adrp	x8, 0xe507000 <dyld_stub_binder+0xe507000>
 45f94e8:      	add	x8, x8, #0xdc8
 45f94ec:      	str	x8, [x19]
 45f94f0:      	ldr	x0, [x19, #0x8]
 45f94f4:      	and	x8, x0, #0xfffffffc00000000
 45f94f8:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45f94fc:      	ldr	x9, [x9, #0x88]
 45f9500:      	cmp	x8, x9
 45f9504:      	b.ne	0x45f950c <_ChromeMain+0x45f4270>
 45f9508:      	bl	0x26a44 <_ChromeMain+0x217a8>
 45f950c:      	mov	x0, x19
 45f9510:      	mov	w1, #0x60               ; =96
 45f9514:      	ldp	x29, x30, [sp, #0x10]
 45f9518:      	ldp	x20, x19, [sp], #0x20
 45f951c:      	b	0x8eb8 <_ChromeMain+0x3c1c>
