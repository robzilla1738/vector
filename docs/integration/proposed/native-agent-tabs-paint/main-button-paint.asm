
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 468648c: d10303ff     	sub	sp, sp, #0xc0
 4686490: a90957f6     	stp	x22, x21, [sp, #0x90]
 4686494: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 4686498: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 468649c: 9102c3fd     	add	x29, sp, #0xb0
 46864a0: aa0103f3     	mov	x19, x1
 46864a4: aa0003f4     	mov	x20, x0
 46864a8: 96fc6ad2     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46864ac: b4001000     	cbz	x0, 0x46866ac <_ChromeMain+0x4681410>
 46864b0: aa1403e0     	mov	x0, x20
 46864b4: 9736fe5c     	bl	0x1445e24 <_ChromeMain+0x1440b88>
 46864b8: b9405c15     	ldr	w21, [x0, #0x5c]
 46864bc: aa1403e0     	mov	x0, x20
 46864c0: 9749140c     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 46864c4: 370002c0     	tbnz	w0, #0x0, 0x468651c <_ChromeMain+0x4681280>
 46864c8: b943be88     	ldr	w8, [x20, #0x3bc]
 46864cc: 7100091f     	cmp	w8, #0x2
 46864d0: 54000260     	b.eq	0x468651c <_ChromeMain+0x4681280>
 46864d4: 71000abf     	cmp	w21, #0x2
 46864d8: 54000800     	b.eq	0x46865d8 <_ChromeMain+0x468133c>
 46864dc: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 46864e0: 6f00e400     	movi.2d	v0, #0000000000000000
 46864e4: 3c8583e0     	stur	q0, [sp, #0x58]
 46864e8: 3c8683e0     	stur	q0, [sp, #0x68]
 46864ec: f9003fff     	str	xzr, [sp, #0x78]
 46864f0: d2806029     	mov	x9, #0x301              ; =769
 46864f4: f2f7f009     	movk	x9, #0xbf80, lsl #48
 46864f8: a904a7e8     	stp	x8, x9, [sp, #0x48]
 46864fc: aa1403e0     	mov	x0, x20
 4686500: 96fc6abc     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4686504: 52801ac1     	mov	w1, #0xd6               ; =214
 4686508: 97228730     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 468650c: 52a9a008     	mov	w8, #0x4d000000         ; =1291845632
 4686510: 33005c08     	bfxil	w8, w0, #0, #24
 4686514: aa0803e0     	mov	x0, x8
 4686518: 1400000d     	b	0x468654c <_ChromeMain+0x46812b0>
 468651c: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4686520: 6f00e400     	movi.2d	v0, #0000000000000000
 4686524: 3c8583e0     	stur	q0, [sp, #0x58]
 4686528: 3c8683e0     	stur	q0, [sp, #0x68]
 468652c: f9003fff     	str	xzr, [sp, #0x78]
 4686530: d2806029     	mov	x9, #0x301              ; =769
 4686534: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4686538: a904a7e8     	stp	x8, x9, [sp, #0x48]
 468653c: aa1403e0     	mov	x0, x20
 4686540: 96fc6aac     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4686544: 52801ee1     	mov	w1, #0xf7               ; =247
 4686548: 97228720     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 468654c: 971d2207     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4686550: 2d0707e0     	stp	s0, s1, [sp, #0x38]
 4686554: 2d080fe2     	stp	s2, s3, [sp, #0x40]
 4686558: f9406275     	ldr	x21, [x19, #0xc0]
 468655c: bd41c280     	ldr	s0, [x20, #0x1c0]
 4686560: 5e21d800     	scvtf	s0, s0
 4686564: bd41c681     	ldr	s1, [x20, #0x1c4]
 4686568: 5e21d821     	scvtf	s1, s1
 468656c: f81d03bf     	stur	xzr, [x29, #-0x30]
 4686570: 2d3b07a0     	stp	s0, s1, [x29, #-0x28]
 4686574: 6f00e400     	movi.2d	v0, #0000000000000000
 4686578: ad0003e0     	stp	q0, q0, [sp]
 468657c: 3d800be0     	str	q0, [sp, #0x20]
 4686580: b90033ff     	str	wzr, [sp, #0x30]
 4686584: 910003e0     	mov	x0, sp
 4686588: d100c3a1     	sub	x1, x29, #0x30
 468658c: 1e249000     	fmov	s0, #10.00000000
 4686590: 1e249001     	fmov	s1, #10.00000000
 4686594: 97098b1b     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 4686598: f94002a8     	ldr	x8, [x21]
 468659c: f9407d08     	ldr	x8, [x8, #0xf8]
 46865a0: 910003e1     	mov	x1, sp
 46865a4: 9100e3e2     	add	x2, sp, #0x38
 46865a8: aa1503e0     	mov	x0, x21
 46865ac: d63f0100     	blr	x8
 46865b0: f9403fe0     	ldr	x0, [sp, #0x78]
 46865b4: b5000f40     	cbnz	x0, 0x468679c <_ChromeMain+0x4681500>
 46865b8: f9403be0     	ldr	x0, [sp, #0x70]
 46865bc: b5000cc0     	cbnz	x0, 0x4686754 <_ChromeMain+0x46814b8>
 46865c0: f94037e0     	ldr	x0, [sp, #0x68]
 46865c4: b5001340     	cbnz	x0, 0x468682c <_ChromeMain+0x4681590>
 46865c8: f94033e0     	ldr	x0, [sp, #0x60]
 46865cc: b5000960     	cbnz	x0, 0x46866f8 <_ChromeMain+0x468145c>
 46865d0: f9402fe0     	ldr	x0, [sp, #0x58]
 46865d4: b5001080     	cbnz	x0, 0x46867e4 <_ChromeMain+0x4681548>
 46865d8: 6f00e400     	movi.2d	v0, #0000000000000000
 46865dc: 3c8583e0     	stur	q0, [sp, #0x58]
 46865e0: 3c8683e0     	stur	q0, [sp, #0x68]
 46865e4: f9003fff     	str	xzr, [sp, #0x78]
 46865e8: d2806828     	mov	x8, #0x341              ; =833
 46865ec: f2f7f008     	movk	x8, #0xbf80, lsl #48
 46865f0: d2a7f009     	mov	x9, #0x3f800000         ; =1065353216
 46865f4: f2e81009     	movk	x9, #0x4080, lsl #48
 46865f8: a904a3e9     	stp	x9, x8, [sp, #0x48]
 46865fc: aa1403e0     	mov	x0, x20
 4686600: 96fc6a7c     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4686604: 52801b01     	mov	w1, #0xd8               ; =216
 4686608: 972286f0     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 468660c: 971d21d7     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4686610: 2d0707e0     	stp	s0, s1, [sp, #0x38]
 4686614: 2d080fe2     	stp	s2, s3, [sp, #0x40]
 4686618: 91070288     	add	x8, x20, #0x1c0
 468661c: 0f0167e0     	movi.2s	v0, #0x3f, lsl #24
 4686620: 4d40cd01     	ld1r.2d	{ v1 }, [x8]
 4686624: 9004c5a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4686628: 3dc01102     	ldr	q2, [x8, #0x40]
 468662c: 6ee24421     	ushl.2d	v1, v1, v2
 4686630: 0ea12821     	xtn.2s	v1, v1
 4686634: 0e21d821     	scvtf.2s	v1, v1
 4686638: 0f0567e2     	movi.2s	v2, #0xbf, lsl #24
 468663c: 0e22d421     	fadd.2s	v1, v1, v2
 4686640: 6d3d07a0     	stp	d0, d1, [x29, #-0x30]
 4686644: f9406273     	ldr	x19, [x19, #0xc0]
 4686648: b90033ff     	str	wzr, [sp, #0x30]
 468664c: 6f00e400     	movi.2d	v0, #0000000000000000
 4686650: ad0083e0     	stp	q0, q0, [sp, #0x10]
 4686654: 3d8003e0     	str	q0, [sp]
 4686658: 910003e0     	mov	x0, sp
 468665c: d100c3a1     	sub	x1, x29, #0x30
 4686660: 1e249000     	fmov	s0, #10.00000000
 4686664: 1e249001     	fmov	s1, #10.00000000
 4686668: 97098ae6     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 468666c: f9400268     	ldr	x8, [x19]
 4686670: f9407d08     	ldr	x8, [x8, #0xf8]
 4686674: 910003e1     	mov	x1, sp
 4686678: 9100e3e2     	add	x2, sp, #0x38
 468667c: aa1303e0     	mov	x0, x19
 4686680: d63f0100     	blr	x8
 4686684: f9403fe0     	ldr	x0, [sp, #0x78]
 4686688: b5000780     	cbnz	x0, 0x4686778 <_ChromeMain+0x46814dc>
 468668c: f9403be0     	ldr	x0, [sp, #0x70]
 4686690: b5000500     	cbnz	x0, 0x4686730 <_ChromeMain+0x4681494>
 4686694: f94037e0     	ldr	x0, [sp, #0x68]
 4686698: b5000b80     	cbnz	x0, 0x4686808 <_ChromeMain+0x468156c>
 468669c: f94033e0     	ldr	x0, [sp, #0x60]
 46866a0: b5000100     	cbnz	x0, 0x46866c0 <_ChromeMain+0x4681424>
 46866a4: f9402fe0     	ldr	x0, [sp, #0x58]
 46866a8: b50008c0     	cbnz	x0, 0x46867c0 <_ChromeMain+0x4681524>
 46866ac: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 46866b0: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 46866b4: a94957f6     	ldp	x22, x21, [sp, #0x90]
 46866b8: 910303ff     	add	sp, sp, #0xc0
 46866bc: d65f03c0     	ret
 46866c0: 91002008     	add	x8, x0, #0x8
 46866c4: 12800009     	mov	w9, #-0x1               ; =-1
 46866c8: b8e90108     	ldaddal	w9, w8, [x8]
 46866cc: 7100051f     	cmp	w8, #0x1
 46866d0: 54fffea1     	b.ne	0x46866a4 <_ChromeMain+0x4681408>
 46866d4: f9400009     	ldr	x9, [x0]
 46866d8: f9400928     	ldr	x8, [x9, #0x10]
 46866dc: f0fdccea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46866e0: 9106014a     	add	x10, x10, #0x180
 46866e4: eb0a011f     	cmp	x8, x10
 46866e8: 54000041     	b.ne	0x46866f0 <_ChromeMain+0x4681454>
 46866ec: f9400528     	ldr	x8, [x9, #0x8]
 46866f0: d63f0100     	blr	x8
 46866f4: 17ffffec     	b	0x46866a4 <_ChromeMain+0x4681408>
 46866f8: 91002008     	add	x8, x0, #0x8
 46866fc: 12800009     	mov	w9, #-0x1               ; =-1
 4686700: b8e90108     	ldaddal	w9, w8, [x8]
 4686704: 7100051f     	cmp	w8, #0x1
 4686708: 54fff641     	b.ne	0x46865d0 <_ChromeMain+0x4681334>
 468670c: f9400009     	ldr	x9, [x0]
 4686710: f9400928     	ldr	x8, [x9, #0x10]
 4686714: f0fdccea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4686718: 9106014a     	add	x10, x10, #0x180
 468671c: eb0a011f     	cmp	x8, x10
 4686720: 54000041     	b.ne	0x4686728 <_ChromeMain+0x468148c>
 4686724: f9400528     	ldr	x8, [x9, #0x8]
 4686728: d63f0100     	blr	x8
 468672c: 17ffffa9     	b	0x46865d0 <_ChromeMain+0x4681334>
 4686730: 91002008     	add	x8, x0, #0x8
 4686734: 12800009     	mov	w9, #-0x1               ; =-1
 4686738: b8e90108     	ldaddal	w9, w8, [x8]
 468673c: 7100051f     	cmp	w8, #0x1
 4686740: 54fffaa1     	b.ne	0x4686694 <_ChromeMain+0x46813f8>
 4686744: f9400008     	ldr	x8, [x0]
 4686748: f9400908     	ldr	x8, [x8, #0x10]
 468674c: d63f0100     	blr	x8
 4686750: 17ffffd1     	b	0x4686694 <_ChromeMain+0x46813f8>
 4686754: 91002008     	add	x8, x0, #0x8
 4686758: 12800009     	mov	w9, #-0x1               ; =-1
 468675c: b8e90108     	ldaddal	w9, w8, [x8]
 4686760: 7100051f     	cmp	w8, #0x1
 4686764: 54fff2e1     	b.ne	0x46865c0 <_ChromeMain+0x4681324>
 4686768: f9400008     	ldr	x8, [x0]
 468676c: f9400908     	ldr	x8, [x8, #0x10]
 4686770: d63f0100     	blr	x8
 4686774: 17ffff93     	b	0x46865c0 <_ChromeMain+0x4681324>
 4686778: 91002008     	add	x8, x0, #0x8
 468677c: 12800009     	mov	w9, #-0x1               ; =-1
 4686780: b8e90108     	ldaddal	w9, w8, [x8]
 4686784: 7100051f     	cmp	w8, #0x1
 4686788: 54fff821     	b.ne	0x468668c <_ChromeMain+0x46813f0>
 468678c: f9400008     	ldr	x8, [x0]
 4686790: f9400908     	ldr	x8, [x8, #0x10]
 4686794: d63f0100     	blr	x8
 4686798: 17ffffbd     	b	0x468668c <_ChromeMain+0x46813f0>
 468679c: 91002008     	add	x8, x0, #0x8
 46867a0: 12800009     	mov	w9, #-0x1               ; =-1
 46867a4: b8e90108     	ldaddal	w9, w8, [x8]
 46867a8: 7100051f     	cmp	w8, #0x1
 46867ac: 54fff061     	b.ne	0x46865b8 <_ChromeMain+0x468131c>
 46867b0: f9400008     	ldr	x8, [x0]
 46867b4: f9400908     	ldr	x8, [x8, #0x10]
 46867b8: d63f0100     	blr	x8
 46867bc: 17ffff7f     	b	0x46865b8 <_ChromeMain+0x468131c>
 46867c0: 91002008     	add	x8, x0, #0x8
 46867c4: 12800009     	mov	w9, #-0x1               ; =-1
 46867c8: b8e90108     	ldaddal	w9, w8, [x8]
 46867cc: 7100051f     	cmp	w8, #0x1
 46867d0: 54fff6e1     	b.ne	0x46866ac <_ChromeMain+0x4681410>
 46867d4: f9400008     	ldr	x8, [x0]
 46867d8: f9400908     	ldr	x8, [x8, #0x10]
 46867dc: d63f0100     	blr	x8
 46867e0: 17ffffb3     	b	0x46866ac <_ChromeMain+0x4681410>
 46867e4: 91002008     	add	x8, x0, #0x8
 46867e8: 12800009     	mov	w9, #-0x1               ; =-1
 46867ec: b8e90108     	ldaddal	w9, w8, [x8]
 46867f0: 7100051f     	cmp	w8, #0x1
 46867f4: 54ffef21     	b.ne	0x46865d8 <_ChromeMain+0x468133c>
 46867f8: f9400008     	ldr	x8, [x0]
 46867fc: f9400908     	ldr	x8, [x8, #0x10]
 4686800: d63f0100     	blr	x8
 4686804: 17ffff75     	b	0x46865d8 <_ChromeMain+0x468133c>
 4686808: 91002008     	add	x8, x0, #0x8
 468680c: 12800009     	mov	w9, #-0x1               ; =-1
 4686810: b8e90108     	ldaddal	w9, w8, [x8]
 4686814: 7100051f     	cmp	w8, #0x1
 4686818: 54fff421     	b.ne	0x468669c <_ChromeMain+0x4681400>
 468681c: f9400008     	ldr	x8, [x0]
 4686820: f9400908     	ldr	x8, [x8, #0x10]
 4686824: d63f0100     	blr	x8
 4686828: 17ffff9d     	b	0x468669c <_ChromeMain+0x4681400>
 468682c: 91002008     	add	x8, x0, #0x8
 4686830: 12800009     	mov	w9, #-0x1               ; =-1
 4686834: b8e90108     	ldaddal	w9, w8, [x8]
 4686838: 7100051f     	cmp	w8, #0x1
 468683c: 54ffec61     	b.ne	0x46865c8 <_ChromeMain+0x468132c>
 4686840: f9400008     	ldr	x8, [x0]
 4686844: f9400908     	ldr	x8, [x8, #0x10]
 4686848: d63f0100     	blr	x8
 468684c: 17ffff5f     	b	0x46865c8 <_ChromeMain+0x468132c>
