
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1427574:      	sub	sp, sp, #0xc0
 1427578:      	stp	x20, x19, [sp, #0xa0]
 142757c:      	stp	x29, x30, [sp, #0xb0]
 1427580:      	add	x29, sp, #0xb0
 1427584:      	mov	x19, x0
 1427588:      	ldr	x8, [x0]
 142758c:      	ldr	x8, [x8, #0x60]
 1427590:      	blr	x8
 1427594:      	movi.2d	v0, #0000000000000000
 1427598:      	cbz	x0, 0x1427658 <_ChromeMain+0x14223bc>
 142759c:      	mov	x20, x0
 14275a0:      	str	xzr, [sp, #0x90]
 14275a4:      	stp	q0, q0, [sp, #0x70]
 14275a8:      	stp	q0, q0, [sp, #0x50]
 14275ac:      	stp	q0, q0, [sp, #0x30]
 14275b0:      	stp	q0, q0, [sp, #0x10]
 14275b4:      	fmov.2s	v0, #1.00000000
 14275b8:      	str	d0, [sp, #0x18]
 14275bc:      	add	x2, sp, #0x10
 14275c0:      	mov	x0, x19
 14275c4:      	mov	x1, #0x0                ; =0
 14275c8:      	bl	0x14276ac <_ChromeMain+0x1422410>
 14275cc:      	str	xzr, [sp, #0x8]
 14275d0:      	add	x0, sp, #0x10
 14275d4:      	add	x1, sp, #0x8
 14275d8:      	bl	0x1c0500 <_ChromeMain+0x1bb264>
 14275dc:      	ldr	x8, [x20, #0xe0]
 14275e0:      	cbz	x8, 0x1427614 <_ChromeMain+0x1422378>
 14275e4:      	ldapurb	w8, [x8, #0x4]
 14275e8:      	cbnz	w8, 0x14276a4 <_ChromeMain+0x1422408>
 14275ec:      	ldr	x8, [x20, #0xe8]
 14275f0:      	cbz	x8, 0x1427614 <_ChromeMain+0x1422378>
 14275f4:      	ldr	x8, [x20, #0xe0]
 14275f8:      	cbz	x8, 0x1427698 <_ChromeMain+0x14223fc>
 14275fc:      	ldapurb	w8, [x8, #0x4]
 1427600:      	cbnz	w8, 0x1427698 <_ChromeMain+0x14223fc>
 1427604:      	ldr	x8, [x20, #0xe8]
 1427608:      	ldr	x8, [x8, #0x48]
 142760c:      	cbz	x8, 0x1427614 <_ChromeMain+0x1422378>
 1427610:      	ldr	x8, [x8, #0x240]
 1427614:      	mov.s	v1[1], v0[0]
 1427618:      	frintm.2s	v0, v1
 142761c:      	movi.2s	v1, #0xcf, lsl #24
 1427620:      	mvni.2s	v2, #0xb1, lsl #24
 1427624:      	fcmge.2s	v2, v2, v0
 1427628:      	fcmge.2s	v3, v0, v1
 142762c:      	bic.2s	v3, #0x80, lsl #24
 1427630:      	fcmgt.2s	v4, v0, v1
 1427634:      	bif.8b	v0, v1, v4
 1427638:      	fcvtzs.2s	v0, v0
 142763c:      	dup.2d	v1, x8
 1427640:      	bif.8b	v0, v3, v2
 1427644:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 1427648:      	ldr	q2, [x8, #0x30]
 142764c:      	ushl.2d	v1, v1, v2
 1427650:      	xtn.2s	v1, v1
 1427654:      	sqadd.2s	v0, v0, v1
 1427658:      	rev64.2s	v1, v0
 142765c:      	fmov	w8, s0
 1427660:      	mov.s	w9, v0[1]
 1427664:      	orr	x0, x9, x8, lsl #32
 1427668:      	ldr	d0, [x19, #0x1c0]
 142766c:      	sqadd.2s	v0, v1, v0
