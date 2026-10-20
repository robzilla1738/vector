
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463b864: d10183ff     	sub	sp, sp, #0x60
 463b868: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463b86c: a90357f6     	stp	x22, x21, [sp, #0x30]
 463b870: a9044ff4     	stp	x20, x19, [sp, #0x40]
 463b874: a9057bfd     	stp	x29, x30, [sp, #0x50]
 463b878: 910143fd     	add	x29, sp, #0x50
 463b87c: aa0303f3     	mov	x19, x3
 463b880: aa0203f4     	mov	x20, x2
 463b884: aa0103f5     	mov	x21, x1
 463b888: aa0003f7     	mov	x23, x0
 463b88c: f9422c08     	ldr	x8, [x0, #0x458]
 463b890: b4000448     	cbz	x8, 0x463b918 <_ChromeMain+0x463667c>
 463b894: f9429d08     	ldr	x8, [x8, #0x538]
 463b898: f9403500     	ldr	x0, [x8, #0x68]
 463b89c: 397e42e8     	ldrb	w8, [x23, #0xf90]
 463b8a0: 36000408     	tbz	w8, #0x0, 0x463b920 <_ChromeMain+0x4636684>
 463b8a4: 390003ff     	strb	wzr, [sp]
 463b8a8: 390063ff     	strb	wzr, [sp, #0x18]
 463b8ac: b4000bd3     	cbz	x19, 0x463ba24 <_ChromeMain+0x4636788>
 463b8b0: f9400668     	ldr	x8, [x19, #0x8]
 463b8b4: 910003e2     	mov	x2, sp
 463b8b8: aa1303e0     	mov	x0, x19
 463b8bc: 52800001     	mov	w1, #0x0                ; =0
 463b8c0: d63f0100     	blr	x8
 463b8c4: 12800008     	mov	w8, #-0x1               ; =-1
 463b8c8: b8e80268     	ldaddal	w8, w8, [x19]
 463b8cc: 7100051f     	cmp	w8, #0x1
 463b8d0: 54000081     	b.ne	0x463b8e0 <_ChromeMain+0x4636644>
 463b8d4: f9400a68     	ldr	x8, [x19, #0x10]
 463b8d8: aa1303e0     	mov	x0, x19
 463b8dc: d63f0100     	blr	x8
 463b8e0: 394063e8     	ldrb	w8, [sp, #0x18]
 463b8e4: 340000e8     	cbz	w8, 0x463b900 <_ChromeMain+0x4636664>
 463b8e8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463b8ec: 36f800a8     	tbz	w8, #0x1f, 0x463b900 <_ChromeMain+0x4636664>
 463b8f0: f94003e0     	ldr	x0, [sp]
 463b8f4: f9400be8     	ldr	x8, [sp, #0x10]
 463b8f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463b8fc: 96e7356f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463b900: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463b904: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463b908: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463b90c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463b910: 910183ff     	add	sp, sp, #0x60
 463b914: d65f03c0     	ret
 463b918: d2800000     	mov	x0, #0x0                ; =0
 463b91c: 17ffffe0     	b	0x463b89c <_ChromeMain+0x4636600>
 463b920: 39805ea8     	ldrsb	x8, [x21, #0x17]
 463b924: b6f80048     	tbz	x8, #0x3f, 0x463b92c <_ChromeMain+0x4636690>
 463b928: f94006a8     	ldr	x8, [x21, #0x8]
 463b92c: b4fffbc0     	cbz	x0, 0x463b8a4 <_ChromeMain+0x4636608>
 463b930: b4fffba8     	cbz	x8, 0x463b8a4 <_ChromeMain+0x4636608>
 463b934: 972dba05     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 463b938: f9413c08     	ldr	x8, [x0, #0x278]
 463b93c: b40007a8     	cbz	x8, 0x463ba30 <_ChromeMain+0x4636794>
 463b940: f9400116     	ldr	x22, [x8]
 463b944: b40000b6     	cbz	x22, 0x463b958 <_ChromeMain+0x46366bc>
 463b948: b9400ac8     	ldr	w8, [x22, #0x8]
 463b94c: 31000508     	adds	w8, w8, #0x1
 463b950: b9000ac8     	str	w8, [x22, #0x8]
 463b954: 54000742     	b.hs	0x463ba3c <_ChromeMain+0x46367a0>
 463b958: f94a06f8     	ldr	x24, [x23, #0x1408]
 463b95c: b40000d8     	cbz	x24, 0x463b974 <_ChromeMain+0x46366d8>
 463b960: 52800028     	mov	w8, #0x1                ; =1
 463b964: b8280308     	ldadd	w8, w8, [x24]
 463b968: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463b96c: 6b09011f     	cmp	w8, w9
 463b970: 540006c0     	b.eq	0x463ba48 <_ChromeMain+0x46367ac>
 463b974: f94a0af7     	ldr	x23, [x23, #0x1410]
 463b978: 52801000     	mov	w0, #0x80               ; =128
 463b97c: 96e74e7b     	bl	0xf368 <_ChromeMain+0xa0cc>
 463b980: aa0003e1     	mov	x1, x0
 463b984: 101ac328     	adr	x8, 0x46711e8 <_ChromeMain+0x466bf4c>
 463b988: d503201f     	nop
 463b98c: 101acda9     	adr	x9, 0x4671340 <_ChromeMain+0x466c0a4>
 463b990: d503201f     	nop
 463b994: a900a408     	stp	x8, x9, [x0, #0x8]
 463b998: 52800028     	mov	w8, #0x1                ; =1
 463b99c: f0ffd169     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 463b9a0: 910a0129     	add	x9, x9, #0x280
 463b9a4: 10004fea     	adr	x10, 0x463c3a0 <_ChromeMain+0x4637104>
 463b9a8: d503201f     	nop
 463b9ac: b9000008     	str	w8, [x0]
 463b9b0: a901a809     	stp	x9, x10, [x0, #0x18]
 463b9b4: a902e01f     	stp	xzr, x24, [x0, #0x28]
 463b9b8: f9001c17     	str	x23, [x0, #0x38]
 463b9bc: 3dc002a0     	ldr	q0, [x21]
 463b9c0: 3d801000     	str	q0, [x0, #0x40]
 463b9c4: f9400aa9     	ldr	x9, [x21, #0x10]
 463b9c8: f9002809     	str	x9, [x0, #0x50]
 463b9cc: a9007ebf     	stp	xzr, xzr, [x21]
 463b9d0: f9000abf     	str	xzr, [x21, #0x10]
 463b9d4: aa0003e9     	mov	x9, x0
 463b9d8: 38058d3f     	strb	wzr, [x9, #0x58]!
 463b9dc: 3901c01f     	strb	wzr, [x0, #0x70]
 463b9e0: 3940628a     	ldrb	w10, [x20, #0x18]
 463b9e4: 3400010a     	cbz	w10, 0x463ba04 <_ChromeMain+0x4636768>
 463b9e8: 3dc00280     	ldr	q0, [x20]
 463b9ec: 3d800120     	str	q0, [x9]
 463b9f0: f9400a8a     	ldr	x10, [x20, #0x10]
 463b9f4: f900092a     	str	x10, [x9, #0x10]
 463b9f8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 463b9fc: f900029f     	str	xzr, [x20]
 463ba00: 3901c028     	strb	w8, [x1, #0x70]
 463ba04: f9003c33     	str	x19, [x1, #0x78]
 463ba08: aa1603e0     	mov	x0, x22
 463ba0c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463ba10: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463ba14: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463ba18: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463ba1c: 910183ff     	add	sp, sp, #0x60
 463ba20: 17ec83f2     	b	0x415c9e8 <_ChromeMain+0x415774c>
 463ba24: d4200000     	brk	#0
 463ba28: d4400000     	hlt	#0
 463ba2c: d4200020     	brk	#0x1
 463ba30: d4200000     	brk	#0
 463ba34: d4400000     	hlt	#0
 463ba38: d4200020     	brk	#0x1
 463ba3c: d4200000     	brk	#0
 463ba40: d4400000     	hlt	#0
 463ba44: d4200020     	brk	#0x1
 463ba48: d4200000     	brk	#0
 463ba4c: d4400000     	hlt	#0
 463ba50: d4200020     	brk	#0x1
 463ba54: d102c3ff     	sub	sp, sp, #0xb0
 463ba58: a9056ffc     	stp	x28, x27, [sp, #0x50]
 463ba5c: a90667fa     	stp	x26, x25, [sp, #0x60]
 463ba60: a9075ff8     	stp	x24, x23, [sp, #0x70]
 463ba64: a90857f6     	stp	x22, x21, [sp, #0x80]
 463ba68: a9094ff4     	stp	x20, x19, [sp, #0x90]
 463ba6c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 463ba70: 910283fd     	add	x29, sp, #0xa0
 463ba74: aa0003f3     	mov	x19, x0
 463ba78: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 463ba7c: f90017ff     	str	xzr, [sp, #0x28]
 463ba80: f948d415     	ldr	x21, [x0, #0x11a8]
 463ba84: b40003b5     	cbz	x21, 0x463baf8 <_ChromeMain+0x463685c>
 463ba88: d282c868     	mov	x8, #0x1643             ; =5699
 463ba8c: f2b21648     	movk	x8, #0x90b2, lsl #16
 463ba90: f2c590a8     	movk	x8, #0x2c85, lsl #32
 463ba94: f2e02c88     	movk	x8, #0x164, lsl #48
 463ba98: eb0802bf     	cmp	x21, x8
 463ba9c: 54000f42     	b.hs	0x463bc84 <_ChromeMain+0x46369e8>
 463baa0: aa0103f4     	mov	x20, x1
 463baa4: 52801717     	mov	w23, #0xb8              ; =184
 463baa8: 9b177ea0     	mul	x0, x21, x23
 463baac: 96e74e2f     	bl	0xf368 <_ChromeMain+0xa0cc>
 463bab0: aa0003f6     	mov	x22, x0
 463bab4: a901ffe0     	stp	x0, xzr, [sp, #0x18]
 463bab8: 6f00e400     	movi.2d	v0, #0000000000000000
 463babc: f90017f5     	str	x21, [sp, #0x28]
 463bac0: ad0183e0     	stp	q0, q0, [sp, #0x30]
 463bac4: 9100c3e0     	add	x0, sp, #0x30
 463bac8: 9400ce5a     	bl	0x466f430 <_ChromeMain+0x466a194>
 463bacc: f948d668     	ldr	x8, [x19, #0x11a8]
 463bad0: d280001c     	mov	x28, #0x0               ; =0
 463bad4: 9b177d18     	mul	x24, x8, x23
 463bad8: b4000198     	cbz	x24, 0x463bb08 <_ChromeMain+0x463686c>
 463badc: f948d275     	ldr	x21, [x19, #0x11a0]
 463bae0: 52801719     	mov	w25, #0xb8              ; =184
 463bae4: d286f4fa     	mov	x26, #0x37a7            ; =14247
 463bae8: f2bd37ba     	movk	x26, #0xe9bd, lsl #16
 463baec: f2cde9ba     	movk	x26, #0x6f4d, lsl #32
 463baf0: f2fa6f5a     	movk	x26, #0xd37a, lsl #48
 463baf4: 14000036     	b	0x463bbcc <_ChromeMain+0x4636930>
 463baf8: d280001c     	mov	x28, #0x0               ; =0
 463bafc: d2800016     	mov	x22, #0x0               ; =0
 463bb00: 14000002     	b	0x463bb08 <_ChromeMain+0x463686c>
 463bb04: f94017f5     	ldr	x21, [sp, #0x28]
 463bb08: a90073f6     	stp	x22, x28, [sp]
 463bb0c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 463bb10: a9017ff5     	stp	x21, xzr, [sp, #0x10]
 463bb14: 910003f4     	mov	x20, sp
 463bb18: 910003e1     	mov	x1, sp
 463bb1c: aa1303e0     	mov	x0, x19
 463bb20: 97ffe60a     	bl	0x4635348 <_ChromeMain+0x46300ac>
 463bb24: f9001bf4     	str	x20, [sp, #0x30]
 463bb28: 9100c3e0     	add	x0, sp, #0x30
 463bb2c: 9400c979     	bl	0x466e110 <_ChromeMain+0x4668e74>
 463bb30: 910063e8     	add	x8, sp, #0x18
 463bb34: f9001be8     	str	x8, [sp, #0x30]
 463bb38: 9100c3e0     	add	x0, sp, #0x30
 463bb3c: 9400c975     	bl	0x466e110 <_ChromeMain+0x4668e74>
 463bb40: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 463bb44: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 463bb48: a94857f6     	ldp	x22, x21, [sp, #0x80]
 463bb4c: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 463bb50: a94667fa     	ldp	x26, x25, [sp, #0x60]
 463bb54: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 463bb58: 9102c3ff     	add	sp, sp, #0xb0
 463bb5c: d65f03c0     	ret
 463bb60: 3cc182a0     	ldur	q0, [x21, #0x18]
 463bb64: f84282a8     	ldur	x8, [x21, #0x28]
 463bb68: f80282c8     	stur	x8, [x22, #0x28]
 463bb6c: 3c8182c0     	stur	q0, [x22, #0x18]
 463bb70: b94032a8     	ldr	w8, [x21, #0x30]
 463bb74: 79406aa9     	ldrh	w9, [x21, #0x34]
 463bb78: aa1603e0     	mov	x0, x22
 463bb7c: 38038c1f     	strb	wzr, [x0, #0x38]!
 463bb80: 781fc009     	sturh	w9, [x0, #-0x4]
 463bb84: b81f8008     	stur	w8, [x0, #-0x8]
 463bb88: 3901e01f     	strb	wzr, [x0, #0x78]
 463bb8c: 3942c2a8     	ldrb	w8, [x21, #0xb0]
 463bb90: 340000a8     	cbz	w8, 0x463bba4 <_ChromeMain+0x4636908>
 463bb94: 9100e2a1     	add	x1, x21, #0x38
 463bb98: 97ffbc7a     	bl	0x462ad80 <_ChromeMain+0x4625ae4>
 463bb9c: 52800028     	mov	w8, #0x1                ; =1
 463bba0: 3902c2c8     	strb	w8, [x22, #0xb0]
 463bba4: 9102e2c0     	add	x0, x22, #0xb8
 463bba8: f9400ff6     	ldr	x22, [sp, #0x18]
 463bbac: eb160008     	subs	x8, x0, x22
 463bbb0: 9343fd08     	asr	x8, x8, #3
 463bbb4: 9b1a7d1c     	mul	x28, x8, x26
 463bbb8: f90013fc     	str	x28, [sp, #0x20]
 463bbbc: 540005a0     	b.eq	0x463bc70 <_ChromeMain+0x46369d4>
 463bbc0: 9102e2b5     	add	x21, x21, #0xb8
 463bbc4: f102e318     	subs	x24, x24, #0xb8
 463bbc8: 54fff9e0     	b.eq	0x463bb04 <_ChromeMain+0x4636868>
 463bbcc: 39405ea8     	ldrb	w8, [x21, #0x17]
 463bbd0: 13001d1b     	sxtb	w27, w8
 463bbd4: f94006b7     	ldr	x23, [x21, #0x8]
 463bbd8: 7100037f     	cmp	w27, #0x0
 463bbdc: 9a8842e2     	csel	x2, x23, x8, mi
 463bbe0: 39405e89     	ldrb	w9, [x20, #0x17]
 463bbe4: 13001d28     	sxtb	w8, w9
 463bbe8: f940068a     	ldr	x10, [x20, #0x8]
 463bbec: 7100011f     	cmp	w8, #0x0
 463bbf0: 9a894149     	csel	x9, x10, x9, mi
 463bbf4: eb09005f     	cmp	x2, x9
 463bbf8: 54000121     	b.ne	0x463bc1c <_ChromeMain+0x4636980>
 463bbfc: f94002a9     	ldr	x9, [x21]
 463bc00: 7100037f     	cmp	w27, #0x0
 463bc04: 9a954120     	csel	x0, x9, x21, mi
 463bc08: f9400289     	ldr	x9, [x20]
 463bc0c: 7100011f     	cmp	w8, #0x0
 463bc10: 9a944121     	csel	x1, x9, x20, mi
 463bc14: 94e73713     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463bc18: 34fffd40     	cbz	w0, 0x463bbc0 <_ChromeMain+0x4636924>
 463bc1c: f94017e8     	ldr	x8, [sp, #0x28]
 463bc20: eb08039f     	cmp	x28, x8
 463bc24: 54000280     	b.eq	0x463bc74 <_ChromeMain+0x46369d8>
 463bc28: 9b195b96     	madd	x22, x28, x25, x22
 463bc2c: b4000236     	cbz	x22, 0x463bc70 <_ChromeMain+0x46369d4>
 463bc30: 37f8017b     	tbnz	w27, #0x1f, 0x463bc5c <_ChromeMain+0x46369c0>
 463bc34: 3dc002a0     	ldr	q0, [x21]
 463bc38: f9400aa8     	ldr	x8, [x21, #0x10]
 463bc3c: f9000ac8     	str	x8, [x22, #0x10]
 463bc40: 3d8002c0     	str	q0, [x22]
 463bc44: 39c0bea8     	ldrsb	w8, [x21, #0x2f]
 463bc48: 36fff8c8     	tbz	w8, #0x1f, 0x463bb60 <_ChromeMain+0x46368c4>
 463bc4c: a9418aa1     	ldp	x1, x2, [x21, #0x18]
 463bc50: 910062c0     	add	x0, x22, #0x18
 463bc54: 96e82bdf     	bl	0x46bd0 <_ChromeMain+0x41934>
 463bc58: 17ffffc6     	b	0x463bb70 <_ChromeMain+0x46368d4>
 463bc5c: f94002a1     	ldr	x1, [x21]
 463bc60: aa1603e0     	mov	x0, x22
 463bc64: aa1703e2     	mov	x2, x23
 463bc68: 96e7716c     	bl	0x18218 <_ChromeMain+0x12f7c>
 463bc6c: 17fffff6     	b	0x463bc44 <_ChromeMain+0x46369a8>
 463bc70: d4200020     	brk	#0x1
 463bc74: 910063e0     	add	x0, sp, #0x18
 463bc78: aa1503e1     	mov	x1, x21
 463bc7c: 9400d45d     	bl	0x4670df0 <_ChromeMain+0x466bb54>
 463bc80: 17ffffca     	b	0x463bba8 <_ChromeMain+0x463690c>
 463bc84: 941608df     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
