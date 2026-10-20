
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42ac274:      	sub	sp, sp, #0x170
 42ac278:      	stp	x24, x23, [sp, #0x130]
 42ac27c:      	stp	x22, x21, [sp, #0x140]
 42ac280:      	stp	x20, x19, [sp, #0x150]
 42ac284:      	stp	x29, x30, [sp, #0x160]
 42ac288:      	add	x29, sp, #0x160
 42ac28c:      	mov	x20, x1
 42ac290:      	mov	x19, x0
 42ac294:      	ldr	x0, [x0, #0x190]
 42ac298:      	cbz	x0, 0x42ac2bc <_ChromeMain+0x42a7020>
 42ac29c:      	ldr	x8, [x0, #0x120]
 42ac2a0:      	ldr	w21, [x8, #0x14]
 42ac2a4:      	ldr	x8, [x8, #0x20]
 42ac2a8:      	cbz	x8, 0x42ac2c8 <_ChromeMain+0x42a702c>
 42ac2ac:      	ldr	x8, [x8, #0x18]
 42ac2b0:      	cbz	x8, 0x42ac2c8 <_ChromeMain+0x42a702c>
 42ac2b4:      	ldr	w22, [x8, #0x38]
 42ac2b8:      	b	0x42ac2cc <_ChromeMain+0x42a7030>
 42ac2bc:      	mov	w21, #-0x2              ; =-2
 42ac2c0:      	mov	w22, #0x1f4             ; =500
 42ac2c4:      	b	0x42ac2dc <_ChromeMain+0x42a7040>
 42ac2c8:      	mov	w22, #0x1f4             ; =500
 42ac2cc:      	str	xzr, [x19, #0x190]
 42ac2d0:      	bl	0x162db98 <_ChromeMain+0x16288fc>
 42ac2d4:      	mov	w1, #0x228              ; =552
 42ac2d8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac2dc:      	ldr	w8, [x19, #0x390]
 42ac2e0:      	cmp	w8, #0x1
 42ac2e4:      	b.ne	0x42ac340 <_ChromeMain+0x42a70a4>
 42ac2e8:      	mov	x23, sp
 42ac2ec:      	mov	x8, sp
 42ac2f0:      	add	x0, x19, #0x98
 42ac2f4:      	bl	0x2029fe0 <_ChromeMain+0x2024d44>
 42ac2f8:      	ldrsb	x8, [sp, #0x17]
 42ac2fc:      	ldp	x9, x10, [sp]
 42ac300:      	cmp	x8, #0x0
 42ac304:      	csel	x3, x9, x23, mi
 42ac308:      	cmp	w8, #0x0
 42ac30c:      	csel	x4, x10, x8, mi
 42ac310:      	mov	x0, x21
 42ac314:      	mov	x1, x22
 42ac318:      	mov	x2, x20
 42ac31c:      	bl	0x42ad2ec <_ChromeMain+0x42a8050>
 42ac320:      	mov	x20, x0
 42ac324:      	ldrsb	w8, [sp, #0x17]
 42ac328:      	tbnz	w8, #0x1f, 0x42ac358 <_ChromeMain+0x42a70bc>
 42ac32c:      	cbz	w20, 0x42ac36c <_ChromeMain+0x42a70d0>
 42ac330:      	mov	w8, #0x1                ; =1
 42ac334:      	strb	w8, [x19, #0x3a8]
 42ac338:      	mov	x0, x19
 42ac33c:      	bl	0x42a5a28 <_ChromeMain+0x42a078c>
 42ac340:      	ldp	x29, x30, [sp, #0x160]
 42ac344:      	ldp	x20, x19, [sp, #0x150]
 42ac348:      	ldp	x22, x21, [sp, #0x140]
 42ac34c:      	ldp	x24, x23, [sp, #0x130]
 42ac350:      	add	sp, sp, #0x170
 42ac354:      	ret
 42ac358:      	ldr	x0, [sp]
 42ac35c:      	ldr	x8, [sp, #0x10]
 42ac360:      	and	x1, x8, #0x7fffffffffffffff
 42ac364:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac368:      	cbnz	w20, 0x42ac330 <_ChromeMain+0x42a7094>
 42ac36c:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 42ac370:      	ldr	x8, [x8, #0xd18]
 42ac374:      	blr	x8
 42ac378:      	ldr	x8, [x19, #0x388]
 42ac37c:      	cmp	x0, x8
 42ac380:      	b.ge	0x42ac41c <_ChromeMain+0x42a7180>
 42ac384:      	adrp	x0, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42ac388:      	add	x0, x0, #0xbee
 42ac38c:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42ac390:      	add	x1, x1, #0x193
 42ac394:      	mov	x8, sp
 42ac398:      	mov	w2, #0x6ef              ; =1775
 42ac39c:      	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42ac3a0:      	ldr	x20, [x19, #0x420]
 42ac3a4:      	cbz	x20, 0x42ac3bc <_ChromeMain+0x42a7120>
 42ac3a8:      	mov	w8, #0x1                ; =1
 42ac3ac:      	ldadd	w8, w8, [x20]
 42ac3b0:      	mov	w9, #0x7fffffff         ; =2147483647
 42ac3b4:      	cmp	w8, w9
 42ac3b8:      	b.eq	0x42ac4b0 <_ChromeMain+0x42a7214>
 42ac3bc:      	ldr	x21, [x19, #0x428]
 42ac3c0:      	mov	w0, #0x40               ; =64
 42ac3c4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42ac3c8:      	mov	x3, x0
 42ac3cc:      	mov	w8, #0x1                ; =1
 42ac3d0:      	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 42ac3d4:      	add	x9, x9, #0x700
 42ac3d8:      	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 42ac3dc:      	add	x10, x10, #0x440
 42ac3e0:      	str	w8, [x0]
 42ac3e4:      	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 42ac3e8:      	add	x8, x8, #0x280
 42ac3ec:      	adr	x11, 0x42a5a28 <_ChromeMain+0x42a078c>
 42ac3f0:      	nop
 42ac3f4:      	stp	x9, x10, [x0, #0x8]
 42ac3f8:      	stp	x8, x11, [x0, #0x18]
 42ac3fc:      	stp	xzr, x20, [x0, #0x28]
 42ac400:      	str	x21, [x0, #0x38]
 42ac404:      	add	x0, x19, #0x2b8
 42ac408:      	mov	x1, sp
 42ac40c:      	mov	w2, #0xd090             ; =53392
 42ac410:      	movk	w2, #0x3, lsl #16
 42ac414:      	bl	0x4aa504 <_ChromeMain+0x4a5268>
 42ac418:      	b	0x42ac340 <_ChromeMain+0x42a70a4>
 42ac41c:      	mov	x0, x19
 42ac420:      	bl	0x42abc18 <_ChromeMain+0x42a697c>
 42ac424:      	cbnz	w0, 0x42ac434 <_ChromeMain+0x42a7198>
 42ac428:      	mov	x0, x19
 42ac42c:      	bl	0x42ac060 <_ChromeMain+0x42a6dc4>
 42ac430:      	b	0x42ac340 <_ChromeMain+0x42a70a4>
 42ac434:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42ac438:      	ldr	w8, [x8, #0xb0]
 42ac43c:      	cmp	w8, #0x1
 42ac440:      	b.gt	0x42ac494 <_ChromeMain+0x42a71f8>
 42ac444:      	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 42ac448:      	ldr	w8, [x8, #0xb88]
 42ac44c:      	cbnz	w8, 0x42ac45c <_ChromeMain+0x42a71c0>
 42ac450:      	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42ac454:      	ldr	x8, [x8, #0xb8]
 42ac458:      	cbz	x8, 0x42ac494 <_ChromeMain+0x42a71f8>
 42ac45c:      	adrp	x1, 0xdb2b000 <dyld_stub_binder+0xdb2b000>
 42ac460:      	add	x1, x1, #0x193
 42ac464:      	mov	x20, sp
 42ac468:      	mov	x0, sp
 42ac46c:      	mov	w2, #0x72e              ; =1838
 42ac470:      	mov	w3, #0x1                ; =1
 42ac474:      	bl	0x60914c <_ChromeMain+0x603eb0>
 42ac478:      	adrp	x1, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42ac47c:      	add	x1, x1, #0x14c
 42ac480:      	add	x0, x20, #0x10
 42ac484:      	mov	w2, #0x87               ; =135
 42ac488:      	bl	0x254bc <_ChromeMain+0x20220>
 42ac48c:      	mov	x0, sp
 42ac490:      	bl	0x609080 <_ChromeMain+0x603de4>
 42ac494:      	adrp	x0, 0xdb2c000 <dyld_stub_binder+0xdb2c000>
 42ac498:      	add	x0, x0, #0x14c
 42ac49c:      	mov	w1, #0x87               ; =135
 42ac4a0:      	bl	0x42adc74 <_ChromeMain+0x42a89d8>
 42ac4a4:      	mov	x0, x19
 42ac4a8:      	bl	0x42abe9c <_ChromeMain+0x42a6c00>
 42ac4ac:      	b	0x42ac340 <_ChromeMain+0x42a70a4>
 42ac4b0:      	brk	#0
