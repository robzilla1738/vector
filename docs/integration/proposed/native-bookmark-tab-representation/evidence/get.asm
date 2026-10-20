
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4557640:      	sub	sp, sp, #0x40
 4557644:      	stp	x20, x19, [sp, #0x20]
 4557648:      	stp	x29, x30, [sp, #0x30]
 455764c:      	add	x29, sp, #0x30
 4557650:      	mov	x19, x8
 4557654:      	cbz	x0, 0x45576c8 <_ChromeMain+0x455242c>
 4557658:      	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 455765c:      	add	x1, x1, #0x9a8
 4557660:      	add	x0, x0, #0x8
 4557664:      	bl	0x53170 <_ChromeMain+0x4ded4>
 4557668:      	cbz	x0, 0x45576c8 <_ChromeMain+0x455242c>
 455766c:      	mov	x8, sp
 4557670:      	add	x20, x8, #0x8
 4557674:      	stp	xzr, xzr, [sp, #0x8]
 4557678:      	str	xzr, [sp, #0x18]
 455767c:      	ldr	x8, [x0, #0x8]
 4557680:      	str	x8, [sp]
 4557684:      	add	x9, x0, #0x10
 4557688:      	cmp	x20, x9
 455768c:      	b.eq	0x45576a8 <_ChromeMain+0x455240c>
 4557690:      	ldrsb	w10, [x0, #0x27]
 4557694:      	tbnz	w10, #0x1f, 0x45576e0 <_ChromeMain+0x4552444>
 4557698:      	ldr	q0, [x9]
 455769c:      	ldr	x9, [x9, #0x10]
 45576a0:      	str	x9, [x20, #0x10]
 45576a4:      	str	q0, [x20]
 45576a8:      	str	x8, [x19]
 45576ac:      	ldr	q0, [x20]
 45576b0:      	stur	q0, [x19, #0x8]
 45576b4:      	ldr	x8, [x20, #0x10]
 45576b8:      	str	x8, [x19, #0x18]
 45576bc:      	mov	w8, #0x1                ; =1
 45576c0:      	strb	w8, [x19, #0x20]
 45576c4:      	b	0x45576d0 <_ChromeMain+0x4552434>
 45576c8:      	strb	wzr, [x19]
 45576cc:      	strb	wzr, [x19, #0x20]
 45576d0:      	ldp	x29, x30, [sp, #0x30]
 45576d4:      	ldp	x20, x19, [sp, #0x20]
 45576d8:      	add	sp, sp, #0x40
 45576dc:      	ret
 45576e0:      	ldp	x1, x2, [x0, #0x10]
 45576e4:      	mov	x0, x20
 45576e8:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 45576ec:      	ldr	x8, [sp]
 45576f0:      	b	0x45576a8 <_ChromeMain+0x455240c>
