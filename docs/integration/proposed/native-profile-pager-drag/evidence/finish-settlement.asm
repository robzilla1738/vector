Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b90c: d10343ff     	sub	sp, sp, #0xd0
 464b910: a9095ff8     	stp	x24, x23, [sp, #0x90]
 464b914: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 464b918: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 464b91c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 464b920: 910303fd     	add	x29, sp, #0xc0
 464b924: aa0003f3     	mov	x19, x0
 464b928: 911fe014     	add	x20, x0, #0x7f8
 464b92c: f943fc00     	ldr	x0, [x0, #0x7f8]
 464b930: b4000100     	cbz	x0, 0x464b950 <_ChromeMain+0x46466b4>
 464b934: 390023ff     	strb	wzr, [sp, #0x8]
 464b938: f004c768     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 464b93c: 3dc1b500     	ldr	q0, [x8, #0x6d0]
 464b940: 3c8103e0     	stur	q0, [sp, #0x10]
 464b944: 910023e1     	add	x1, sp, #0x8
 464b948: 958239ed     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 464b94c: f9400280     	ldr	x0, [x20]
 464b950: 925e7408     	and	x8, x0, #0xfffffffc00000000
 464b954: f0052b29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464b958: f9404529     	ldr	x9, [x9, #0x88]
 464b95c: eb09011f     	cmp	x8, x9
 464b960: 54000041     	b.ne	0x464b968 <_ChromeMain+0x46466cc>
 464b964: 96e75c36     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 464b968: a9007e9f     	stp	xzr, xzr, [x20]
 464b96c: f943e675     	ldr	x21, [x19, #0x7c8]
 464b970: f943ea68     	ldr	x8, [x19, #0x7d0]
 464b974: 8b080509     	add	x9, x8, x8, lsl #1
 464b978: d37df129     	lsl	x9, x9, #3
 464b97c: b4000229     	cbz	x9, 0x464b9c0 <_ChromeMain+0x4646724>
 464b980: 8b150129     	add	x9, x9, x21
 464b984: d1006136     	sub	x22, x9, #0x18
 464b988: d37df109     	lsl	x9, x8, #3
 464b98c: cb081537     	sub	x23, x9, x8, lsl #5
 464b990: 14000008     	b	0x464b9b0 <_ChromeMain+0x4646714>
 464b994: f94002c0     	ldr	x0, [x22]
 464b998: f9400ac8     	ldr	x8, [x22, #0x10]
 464b99c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464b9a0: 96e6f546     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464b9a4: d10062d6     	sub	x22, x22, #0x18
 464b9a8: b10062f7     	adds	x23, x23, #0x18
 464b9ac: 540000e0     	b.eq	0x464b9c8 <_ChromeMain+0x464672c>
 464b9b0: b4000cf6     	cbz	x22, 0x464bb4c <_ChromeMain+0x46468b0>
 464b9b4: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 464b9b8: 37fffee8     	tbnz	w8, #0x1f, 0x464b994 <_ChromeMain+0x46466f8>
 464b9bc: 17fffffa     	b	0x464b9a4 <_ChromeMain+0x4646708>
 464b9c0: aa1503e8     	mov	x8, x21
 464b9c4: 14000002     	b	0x464b9cc <_ChromeMain+0x4646730>
 464b9c8: f943e668     	ldr	x8, [x19, #0x7c8]
 464b9cc: cb0802a8     	sub	x8, x21, x8
 464b9d0: 9343fd08     	asr	x8, x8, #3
 464b9d4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 464b9d8: f2955569     	movk	x9, #0xaaab
 464b9dc: 9b097d08     	mul	x8, x8, x9
 464b9e0: f903ea68     	str	x8, [x19, #0x7d0]
 464b9e4: 3920227f     	strb	wzr, [x19, #0x808]
 464b9e8: f942f268     	ldr	x8, [x19, #0x5e0]
 464b9ec: b4000108     	cbz	x8, 0x464ba0c <_ChromeMain+0x4646770>
 464b9f0: 3946a509     	ldrb	w9, [x8, #0x1a9]
 464b9f4: 370000c9     	tbnz	w9, #0x0, 0x464ba0c <_ChromeMain+0x4646770>
 464b9f8: 52800029     	mov	w9, #0x1                ; =1
 464b9fc: 3906a509     	strb	w9, [x8, #0x1a9]
 464ba00: 9103e100     	add	x0, x8, #0xf8
 464ba04: 9106a501     	add	x1, x8, #0x1a9
 464ba08: 97237172     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 464ba0c: 39602668     	ldrb	w8, [x19, #0x809]
 464ba10: 34000068     	cbz	w8, 0x464ba1c <_ChromeMain+0x4646780>
 464ba14: 397e4268     	ldrb	w8, [x19, #0xf90]
 464ba18: 360002c8     	tbz	w8, #0x0, 0x464ba70 <_ChromeMain+0x46467d4>
 464ba1c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 464ba20: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 464ba24: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 464ba28: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 464ba2c: 910343ff     	add	sp, sp, #0xd0
 464ba30: d65f03c0     	ret
 464ba34: aa1303e0     	mov	x0, x19
 464ba38: 94002e6b     	bl	0x46573e4 <_ChromeMain+0x4652148>
 464ba3c: 17fffff8     	b	0x464ba1c <_ChromeMain+0x4646780>
 464ba40: f9439668     	ldr	x8, [x19, #0x728]
 464ba44: cb0802c8     	sub	x8, x22, x8
 464ba48: 9343fd08     	asr	x8, x8, #3
 464ba4c: 9b157d08     	mul	x8, x8, x21
 464ba50: f9039a68     	str	x8, [x19, #0x730]
 464ba54: 395f0268     	ldrb	w8, [x19, #0x7c0]
 464ba58: 37000068     	tbnz	w8, #0x0, 0x464ba64 <_ChromeMain+0x46467c8>
 464ba5c: f9400288     	ldr	x8, [x20]
 464ba60: b4fffea8     	cbz	x8, 0x464ba34 <_ChromeMain+0x4646798>
 464ba64: 52800028     	mov	w8, #0x1                ; =1
 464ba68: 39202668     	strb	w8, [x19, #0x809]
 464ba6c: 17ffffec     	b	0x464ba1c <_ChromeMain+0x4646780>
 464ba70: 3920267f     	strb	wzr, [x19, #0x809]
 464ba74: 3920e27f     	strb	wzr, [x19, #0x838]
 464ba78: f9441275     	ldr	x21, [x19, #0x820]
 464ba7c: f9441668     	ldr	x8, [x19, #0x828]
 464ba80: 8b080509     	add	x9, x8, x8, lsl #1
 464ba84: d37df129     	lsl	x9, x9, #3
 464ba88: b4000269     	cbz	x9, 0x464bad4 <_ChromeMain+0x4646838>
 464ba8c: 8b150129     	add	x9, x9, x21
 464ba90: d1006136     	sub	x22, x9, #0x18
 464ba94: d37df109     	lsl	x9, x8, #3
 464ba98: cb081537     	sub	x23, x9, x8, lsl #5
 464ba9c: 14000008     	b	0x464babc <_ChromeMain+0x4646820>
 464baa0: f94002c0     	ldr	x0, [x22]
 464baa4: f9400ac8     	ldr	x8, [x22, #0x10]
 464baa8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464baac: 96e6f503     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464bab0: d10062d6     	sub	x22, x22, #0x18
 464bab4: b10062f7     	adds	x23, x23, #0x18
 464bab8: 54000120     	b.eq	0x464badc <_ChromeMain+0x4646840>
 464babc: b4000496     	cbz	x22, 0x464bb4c <_ChromeMain+0x46468b0>
 464bac0: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 464bac4: 37fffee8     	tbnz	w8, #0x1f, 0x464baa0 <_ChromeMain+0x4646804>
 464bac8: 17fffffa     	b	0x464bab0 <_ChromeMain+0x4646814>
 464bacc: aa1603e8     	mov	x8, x22
 464bad0: 17ffffdd     	b	0x464ba44 <_ChromeMain+0x46467a8>
 464bad4: aa1503e8     	mov	x8, x21
 464bad8: 14000002     	b	0x464bae0 <_ChromeMain+0x4646844>
 464badc: f9441268     	ldr	x8, [x19, #0x820]
 464bae0: cb0802a8     	sub	x8, x21, x8
 464bae4: 9343fd08     	asr	x8, x8, #3
 464bae8: b201f3f5     	mov	x21, #-0x5555555555555556 ; =-6148914691236517206
 464baec: f2955575     	movk	x21, #0xaaab
 464baf0: 9b157d08     	mul	x8, x8, x21
 464baf4: f9041668     	str	x8, [x19, #0x828]
 464baf8: f9439676     	ldr	x22, [x19, #0x728]
 464bafc: f9439a68     	ldr	x8, [x19, #0x730]
 464bb00: 8b080509     	add	x9, x8, x8, lsl #1
 464bb04: d37df129     	lsl	x9, x9, #3
 464bb08: b4fffe29     	cbz	x9, 0x464bacc <_ChromeMain+0x4646830>
 464bb0c: 8b160129     	add	x9, x9, x22
 464bb10: d1006137     	sub	x23, x9, #0x18
 464bb14: d37df109     	lsl	x9, x8, #3
 464bb18: cb081538     	sub	x24, x9, x8, lsl #5
 464bb1c: 14000008     	b	0x464bb3c <_ChromeMain+0x46468a0>
 464bb20: f94002e0     	ldr	x0, [x23]
 464bb24: f9400ae8     	ldr	x8, [x23, #0x10]
 464bb28: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464bb2c: 96e6f4e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464bb30: d10062f7     	sub	x23, x23, #0x18
 464bb34: b1006318     	adds	x24, x24, #0x18
 464bb38: 54fff840     	b.eq	0x464ba40 <_ChromeMain+0x46467a4>
 464bb3c: b4000097     	cbz	x23, 0x464bb4c <_ChromeMain+0x46468b0>
 464bb40: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 464bb44: 37fffee8     	tbnz	w8, #0x1f, 0x464bb20 <_ChromeMain+0x4646884>
 464bb48: 17fffffa     	b	0x464bb30 <_ChromeMain+0x4646894>
 464bb4c: d4200020     	brk	#0x1
 464bb50: d115e000     	sub	x0, x0, #0x578
 464bb54: 17fffe01     	b	0x464b358 <_ChromeMain+0x46460bc>
