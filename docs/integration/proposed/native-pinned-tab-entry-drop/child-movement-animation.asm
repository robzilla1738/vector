
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460989c: d10383ff     	sub	sp, sp, #0xe0
 46098a0: a90967fa     	stp	x26, x25, [sp, #0x90]
 46098a4: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 46098a8: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 46098ac: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 46098b0: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 46098b4: 910343fd     	add	x29, sp, #0xd0
 46098b8: b4000e01     	cbz	x1, 0x4609a78 <_ChromeMain+0x46047dc>
 46098bc: aa0203f6     	mov	x22, x2
 46098c0: aa0103f5     	mov	x21, x1
 46098c4: aa0003f3     	mov	x19, x0
 46098c8: 52800002     	mov	w2, #0x0                ; =0
 46098cc: 97ffff9f     	bl	0x4609748 <_ChromeMain+0x46044ac>
 46098d0: 6f00e400     	movi.2d	v0, #0000000000000000
 46098d4: ad0003e0     	stp	q0, q0, [sp]
 46098d8: f90043ff     	str	xzr, [sp, #0x80]
 46098dc: ad0303e0     	stp	q0, q0, [sp, #0x60]
 46098e0: ad0203e0     	stp	q0, q0, [sp, #0x40]
 46098e4: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46098e8: 0f03f600     	fmov.2s	v0, #1.00000000
 46098ec: fd4002c1     	ldr	d1, [x22]
 46098f0: 0e21d821     	scvtf.2s	v1, v1
 46098f4: 6d0087e0     	stp	d0, d1, [sp, #0x8]
 46098f8: 910003e1     	mov	x1, sp
 46098fc: aa1503e0     	mov	x0, x21
 4609900: 958341ff     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 4609904: 52801100     	mov	w0, #0x88               ; =136
 4609908: 96e81698     	bl	0xf368 <_ChromeMain+0xa0cc>
 460990c: aa0003f4     	mov	x20, x0
 4609910: 910cc268     	add	x8, x19, #0x330
 4609914: f100027f     	cmp	x19, #0x0
 4609918: 9a8803f7     	csel	x23, xzr, x8, eq
 460991c: aa1703e1     	mov	x1, x23
 4609920: 52800782     	mov	w2, #0x3c               ; =60
 4609924: 973594b7     	bl	0x136ec00 <_ChromeMain+0x1369964>
 4609928: 9004e6c8     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 460992c: 91240108     	add	x8, x8, #0x900
 4609930: f9000008     	str	x8, [x0]
 4609934: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4609938: b0052d49     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 460993c: f9404529     	ldr	x9, [x9, #0x88]
 4609940: eb09011f     	cmp	x8, x9
 4609944: 54000061     	b.ne	0x4609950 <_ChromeMain+0x46046b4>
 4609948: aa1703e0     	mov	x0, x23
 460994c: 96e82a6c     	bl	0x142fc <_ChromeMain+0xf060>
 4609950: f9002697     	str	x23, [x20, #0x48]
 4609954: 52800028     	mov	w8, #0x1                ; =1
 4609958: b9005288     	str	w8, [x20, #0x50]
 460995c: 3901529f     	strb	wzr, [x20, #0x54]
 4609960: 3901629f     	strb	wzr, [x20, #0x58]
 4609964: a9067e9f     	stp	xzr, xzr, [x20, #0x60]
 4609968: 529a9808     	mov	w8, #0xd4c0             ; =54464
 460996c: 72a00028     	movk	w8, #0x1, lsl #16
 4609970: a907229f     	stp	xzr, x8, [x20, #0x70]
 4609974: d2e7fe08     	mov	x8, #0x3ff0000000000000 ; =4607182418800017408
 4609978: f9004288     	str	x8, [x20, #0x80]
 460997c: f00547e8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4609980: f9401917     	ldr	x23, [x8, #0x30]
 4609984: b00460e1     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 4609988: 910a4c21     	add	x1, x1, #0x293
 460998c: aa1703e0     	mov	x0, x23
 4609990: 96efaefb     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 4609994: 37000a80     	tbnz	w0, #0x0, 0x4609ae4 <_ChromeMain+0x4604848>
 4609998: b00460e1     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 460999c: 910ac021     	add	x1, x1, #0x2b0
 46099a0: aa1703e0     	mov	x0, x23
 46099a4: 96efaef6     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 46099a8: 370000e0     	tbnz	w0, #0x0, 0x46099c4 <_ChromeMain+0x4604728>
 46099ac: f0054837     	adrp	x23, 0xef10000 <dyld_stub_binder+0xef10000>
 46099b0: 394ca6e8     	ldrb	w8, [x23, #0x329]
 46099b4: 36000908     	tbz	w8, #0x0, 0x4609ad4 <_ChromeMain+0x4604838>
 46099b8: f0054828     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 46099bc: 394ca108     	ldrb	w8, [x8, #0x328]
 46099c0: 37000928     	tbnz	w8, #0x0, 0x4609ae4 <_ChromeMain+0x4604848>
 46099c4: 52845c01     	mov	w1, #0x22e0             ; =8928
 46099c8: 72a00041     	movk	w1, #0x2, lsl #16
 46099cc: f9400288     	ldr	x8, [x20]
 46099d0: f9403508     	ldr	x8, [x8, #0x68]
 46099d4: aa1403e0     	mov	x0, x20
 46099d8: d63f0100     	blr	x8
 46099dc: 52800168     	mov	w8, #0xb                ; =11
 46099e0: b9005288     	str	w8, [x20, #0x50]
 46099e4: f94002d7     	ldr	x23, [x22]
 46099e8: f941da68     	ldr	x8, [x19, #0x3b0]
 46099ec: b50005e8     	cbnz	x8, 0x4609aa8 <_ChromeMain+0x460480c>
 46099f0: 910ec279     	add	x25, x19, #0x3b0
 46099f4: 910ec278     	add	x24, x19, #0x3b0
 46099f8: 52800700     	mov	w0, #0x38               ; =56
 46099fc: 96e8165b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4609a00: b4000680     	cbz	x0, 0x4609ad0 <_ChromeMain+0x4604834>
 4609a04: aa0003f6     	mov	x22, x0
 4609a08: b100801f     	cmn	x0, #0x20
 4609a0c: 54000620     	b.eq	0x4609ad0 <_ChromeMain+0x4604834>
 4609a10: a9007edf     	stp	xzr, xzr, [x22]
 4609a14: a902fedf     	stp	xzr, xzr, [x22, #0x28]
 4609a18: f90012d5     	str	x21, [x22, #0x20]
 4609a1c: f9000ad8     	str	x24, [x22, #0x10]
 4609a20: f9000336     	str	x22, [x25]
 4609a24: f941d668     	ldr	x8, [x19, #0x3a8]
 4609a28: f9400108     	ldr	x8, [x8]
 4609a2c: aa1603e1     	mov	x1, x22
 4609a30: b4000068     	cbz	x8, 0x4609a3c <_ChromeMain+0x46047a0>
 4609a34: f901d668     	str	x8, [x19, #0x3a8]
 4609a38: f9400321     	ldr	x1, [x25]
 4609a3c: f941da60     	ldr	x0, [x19, #0x3b0]
 4609a40: 96e94808     	bl	0x5ba60 <_ChromeMain+0x567c4>
 4609a44: f941de68     	ldr	x8, [x19, #0x3b8]
 4609a48: 91000508     	add	x8, x8, #0x1
 4609a4c: f901de68     	str	x8, [x19, #0x3b8]
 4609a50: f9401ac0     	ldr	x0, [x22, #0x30]
 4609a54: a902d2d7     	stp	x23, x20, [x22, #0x28]
 4609a58: b4000080     	cbz	x0, 0x4609a68 <_ChromeMain+0x46047cc>
 4609a5c: f9400008     	ldr	x8, [x0]
 4609a60: f9401108     	ldr	x8, [x8, #0x20]
 4609a64: d63f0100     	blr	x8
 4609a68: f9400288     	ldr	x8, [x20]
 4609a6c: f9402d08     	ldr	x8, [x8, #0x58]
 4609a70: aa1403e0     	mov	x0, x20
 4609a74: d63f0100     	blr	x8
 4609a78: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4609a7c: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4609a80: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 4609a84: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 4609a88: a94967fa     	ldp	x26, x25, [sp, #0x90]
 4609a8c: 910383ff     	add	sp, sp, #0xe0
 4609a90: d65f03c0     	ret
 4609a94: aa1803f6     	mov	x22, x24
 4609a98: 17ffffee     	b	0x4609a50 <_ChromeMain+0x46047b4>
 4609a9c: f9400308     	ldr	x8, [x24]
 4609aa0: aa1803f9     	mov	x25, x24
 4609aa4: b4fffaa8     	cbz	x8, 0x46099f8 <_ChromeMain+0x460475c>
 4609aa8: aa0803f8     	mov	x24, x8
 4609aac: f9401108     	ldr	x8, [x8, #0x20]
 4609ab0: eb0802bf     	cmp	x21, x8
 4609ab4: 54ffff43     	b.lo	0x4609a9c <_ChromeMain+0x4604800>
 4609ab8: eb15011f     	cmp	x8, x21
 4609abc: 54fffec2     	b.hs	0x4609a94 <_ChromeMain+0x46047f8>
 4609ac0: f9400708     	ldr	x8, [x24, #0x8]
 4609ac4: b5ffff28     	cbnz	x8, 0x4609aa8 <_ChromeMain+0x460480c>
 4609ac8: 91002319     	add	x25, x24, #0x8
 4609acc: 17ffffcb     	b	0x46099f8 <_ChromeMain+0x460475c>
 4609ad0: d4200020     	brk	#0x1
 4609ad4: 978cd274     	bl	0x293e4a4 <_ChromeMain+0x2939208>
 4609ad8: 394ca6e8     	ldrb	w8, [x23, #0x329]
 4609adc: 3707f6e8     	tbnz	w8, #0x0, 0x46099b8 <_ChromeMain+0x460471c>
 4609ae0: 9417da0f     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4609ae4: d2800001     	mov	x1, #0x0                ; =0
 4609ae8: 17ffffb9     	b	0x46099cc <_ChromeMain+0x4604730>
