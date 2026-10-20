
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f978c: d10383ff     	sub	sp, sp, #0xe0
 40f9790: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 40f9794: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 40f9798: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 40f979c: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 40f97a0: 910343fd     	add	x29, sp, #0xd0
 40f97a4: aa0803f3     	mov	x19, x8
 40f97a8: f900091f     	str	xzr, [x8, #0x10]
 40f97ac: f8008d1f     	str	xzr, [x8, #0x8]!
 40f97b0: f9000268     	str	x8, [x19]
 40f97b4: b4000a60     	cbz	x0, 0x40f9900 <_ChromeMain+0x40f4664>
 40f97b8: aa0003f4     	mov	x20, x0
 40f97bc: 975bc17d     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 40f97c0: d10143a8     	sub	x8, x29, #0x50
 40f97c4: 528000c1     	mov	w1, #0x6                ; =6
 40f97c8: d2800002     	mov	x2, #0x0                ; =0
 40f97cc: 9768d4d0     	bl	0x1b2eb0c <_ChromeMain+0x1b29870>
 40f97d0: a97b23b5     	ldp	x21, x8, [x29, #-0x50]
 40f97d4: 52802f09     	mov	w9, #0x178              ; =376
 40f97d8: 9b097d16     	mul	x22, x8, x9
 40f97dc: b4000356     	cbz	x22, 0x40f9844 <_ChromeMain+0x40f45a8>
 40f97e0: 14000008     	b	0x40f9800 <_ChromeMain+0x40f4564>
 40f97e4: f94003e0     	ldr	x0, [sp]
 40f97e8: f9400be8     	ldr	x8, [sp, #0x10]
 40f97ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f97f0: 96fc3db2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f97f4: 9105e2b5     	add	x21, x21, #0x178
 40f97f8: f105e2d6     	subs	x22, x22, #0x178
 40f97fc: 54000220     	b.eq	0x40f9840 <_ChromeMain+0x40f45a4>
 40f9800: 6f00e400     	movi.2d	v0, #0000000000000000
 40f9804: ad0003e0     	stp	q0, q0, [sp]
 40f9808: 910003e8     	mov	x8, sp
 40f980c: aa1503e0     	mov	x0, x21
 40f9810: 940000c9     	bl	0x40f9b34 <_ChromeMain+0x40f4898>
 40f9814: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9818: 34fffee8     	cbz	w8, 0x40f97f4 <_ChromeMain+0x40f4558>
 40f981c: 910003e2     	mov	x2, sp
 40f9820: aa1303e0     	mov	x0, x19
 40f9824: aa1303e1     	mov	x1, x19
 40f9828: 97385356     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 40f982c: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9830: 34fffe28     	cbz	w8, 0x40f97f4 <_ChromeMain+0x40f4558>
 40f9834: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f9838: 36fffde8     	tbz	w8, #0x1f, 0x40f97f4 <_ChromeMain+0x40f4558>
 40f983c: 17ffffea     	b	0x40f97e4 <_ChromeMain+0x40f4548>
 40f9840: f85b03b5     	ldur	x21, [x29, #-0x50]
 40f9844: b4000435     	cbz	x21, 0x40f98c8 <_ChromeMain+0x40f462c>
 40f9848: f85b83a8     	ldur	x8, [x29, #-0x48]
 40f984c: 52802f09     	mov	w9, #0x178              ; =376
 40f9850: 9b097d09     	mul	x9, x8, x9
 40f9854: aa1503e0     	mov	x0, x21
 40f9858: b4000209     	cbz	x9, 0x40f9898 <_ChromeMain+0x40f45fc>
 40f985c: 8b150129     	add	x9, x9, x21
 40f9860: d105e136     	sub	x22, x9, #0x178
 40f9864: 92802ee9     	mov	x9, #-0x178             ; =-376
 40f9868: 9b097d17     	mul	x23, x8, x9
 40f986c: b4000a96     	cbz	x22, 0x40f99bc <_ChromeMain+0x40f4720>
 40f9870: 910442c0     	add	x0, x22, #0x110
 40f9874: 975493d8     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 40f9878: 910222c0     	add	x0, x22, #0x88
 40f987c: 971523e1     	bl	0x642800 <_ChromeMain+0x63d564>
 40f9880: aa1603e0     	mov	x0, x22
 40f9884: 971523df     	bl	0x642800 <_ChromeMain+0x63d564>
 40f9888: d105e2d6     	sub	x22, x22, #0x178
 40f988c: b105e2f7     	adds	x23, x23, #0x178
 40f9890: 54fffee1     	b.ne	0x40f986c <_ChromeMain+0x40f45d0>
 40f9894: f85b03a0     	ldur	x0, [x29, #-0x50]
 40f9898: cb0002a8     	sub	x8, x21, x0
 40f989c: 9343fd08     	asr	x8, x8, #3
 40f98a0: d288d9e9     	mov	x9, #0x46cf             ; =18127
 40f98a4: f2acefa9     	movk	x9, #0x677d, lsl #16
 40f98a8: f2d7d469     	movk	x9, #0xbea3, lsl #32
 40f98ac: f2ea3669     	movk	x9, #0x51b3, lsl #48
 40f98b0: 9b097d08     	mul	x8, x8, x9
 40f98b4: f81b83a8     	stur	x8, [x29, #-0x48]
 40f98b8: f85c03a8     	ldur	x8, [x29, #-0x40]
 40f98bc: 52802f09     	mov	w9, #0x178              ; =376
 40f98c0: 9b097d01     	mul	x1, x8, x9
 40f98c4: 96fc3d7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f98c8: f9400288     	ldr	x8, [x20]
 40f98cc: f940b508     	ldr	x8, [x8, #0x168]
 40f98d0: aa1403e0     	mov	x0, x20
 40f98d4: d63f0100     	blr	x8
 40f98d8: 90046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f98dc: 9128a021     	add	x1, x1, #0xa28
 40f98e0: 52800662     	mov	w2, #0x33               ; =51
 40f98e4: 96feaa89     	bl	0xa4308 <_ChromeMain+0x9f06c>
 40f98e8: f9400408     	ldr	x8, [x0, #0x8]
 40f98ec: d37be914     	lsl	x20, x8, #5
 40f98f0: b4000094     	cbz	x20, 0x40f9900 <_ChromeMain+0x40f4664>
 40f98f4: f9400015     	ldr	x21, [x0]
 40f98f8: 910003f6     	mov	x22, sp
 40f98fc: 14000010     	b	0x40f993c <_ChromeMain+0x40f46a0>
 40f9900: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 40f9904: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 40f9908: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 40f990c: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 40f9910: 910383ff     	add	sp, sp, #0xe0
 40f9914: d65f03c0     	ret
 40f9918: a9400aa1     	ldp	x1, x2, [x21]
 40f991c: 1400000d     	b	0x40f9950 <_ChromeMain+0x40f46b4>
 40f9920: f85b03a0     	ldur	x0, [x29, #-0x50]
 40f9924: f85c03a8     	ldur	x8, [x29, #-0x40]
 40f9928: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f992c: 96fc3d63     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9930: 910082b5     	add	x21, x21, #0x20
 40f9934: f1008294     	subs	x20, x20, #0x20
 40f9938: 54fffe40     	b.eq	0x40f9900 <_ChromeMain+0x40f4664>
 40f993c: 6f00e400     	movi.2d	v0, #0000000000000000
 40f9940: ad3d83a0     	stp	q0, q0, [x29, #-0x50]
 40f9944: 39805ea2     	ldrsb	x2, [x21, #0x17]
 40f9948: b7fffe82     	tbnz	x2, #0x3f, 0x40f9918 <_ChromeMain+0x40f467c>
 40f994c: aa1503e1     	mov	x1, x21
 40f9950: 910003e0     	mov	x0, sp
 40f9954: 9709da20     	bl	0x3701d4 <_ChromeMain+0x36af38>
 40f9958: d10143a8     	sub	x8, x29, #0x50
 40f995c: 910003e0     	mov	x0, sp
 40f9960: 94000578     	bl	0x40faf40 <_ChromeMain+0x40f5ca4>
 40f9964: 9101c2c0     	add	x0, x22, #0x70
 40f9968: d2800001     	mov	x1, #0x0                ; =0
 40f996c: 96fcb8d3     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9970: 910082c0     	add	x0, x22, #0x20
 40f9974: 96fcb8c1     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9978: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f997c: 36f800a8     	tbz	w8, #0x1f, 0x40f9990 <_ChromeMain+0x40f46f4>
 40f9980: f94003e0     	ldr	x0, [sp]
 40f9984: f9400be8     	ldr	x8, [sp, #0x10]
 40f9988: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f998c: 96fc3d4b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9990: 385c83a8     	ldurb	w8, [x29, #-0x38]
 40f9994: 34fffce8     	cbz	w8, 0x40f9930 <_ChromeMain+0x40f4694>
 40f9998: d10143a2     	sub	x2, x29, #0x50
 40f999c: aa1303e0     	mov	x0, x19
 40f99a0: aa1303e1     	mov	x1, x19
 40f99a4: 973852f7     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 40f99a8: 385c83a8     	ldurb	w8, [x29, #-0x38]
 40f99ac: 34fffc28     	cbz	w8, 0x40f9930 <_ChromeMain+0x40f4694>
 40f99b0: 38dc73a8     	ldursb	w8, [x29, #-0x39]
 40f99b4: 36fffbe8     	tbz	w8, #0x1f, 0x40f9930 <_ChromeMain+0x40f4694>
 40f99b8: 17ffffda     	b	0x40f9920 <_ChromeMain+0x40f4684>
 40f99bc: d4200020     	brk	#0x1
 40f99c0: f9400c08     	ldr	x8, [x0, #0x18]
 40f99c4: b4000b28     	cbz	x8, 0x40f9b28 <_ChromeMain+0x40f488c>
 40f99c8: d101c3ff     	sub	sp, sp, #0x70
 40f99cc: a90457f6     	stp	x22, x21, [sp, #0x40]
 40f99d0: a9054ff4     	stp	x20, x19, [sp, #0x50]
 40f99d4: a9067bfd     	stp	x29, x30, [sp, #0x60]
 40f99d8: 910183fd     	add	x29, sp, #0x60
 40f99dc: aa0203f4     	mov	x20, x2
 40f99e0: aa0003f3     	mov	x19, x0
 40f99e4: 910083e8     	add	x8, sp, #0x20
 40f99e8: 91002115     	add	x21, x8, #0x8
 40f99ec: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 40f99f0: f90013f5     	str	x21, [sp, #0x20]
 40f99f4: 6f00e400     	movi.2d	v0, #0000000000000000
 40f99f8: ad0003e0     	stp	q0, q0, [sp]
 40f99fc: 910003e8     	mov	x8, sp
 40f9a00: aa0103e0     	mov	x0, x1
 40f9a04: 9400004c     	bl	0x40f9b34 <_ChromeMain+0x40f4898>
 40f9a08: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9a0c: 340001a8     	cbz	w8, 0x40f9a40 <_ChromeMain+0x40f47a4>
 40f9a10: 910083e0     	add	x0, sp, #0x20
 40f9a14: 910083e1     	add	x1, sp, #0x20
 40f9a18: 910003e2     	mov	x2, sp
 40f9a1c: 973852d9     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 40f9a20: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9a24: 340000e8     	cbz	w8, 0x40f9a40 <_ChromeMain+0x40f47a4>
 40f9a28: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f9a2c: 36f800a8     	tbz	w8, #0x1f, 0x40f9a40 <_ChromeMain+0x40f47a4>
 40f9a30: f94003e0     	ldr	x0, [sp]
 40f9a34: f9400be8     	ldr	x8, [sp, #0x10]
 40f9a38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9a3c: 96fc3d1f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9a40: 6f00e400     	movi.2d	v0, #0000000000000000
 40f9a44: ad0003e0     	stp	q0, q0, [sp]
 40f9a48: 910003e8     	mov	x8, sp
 40f9a4c: aa1403e0     	mov	x0, x20
 40f9a50: 94000039     	bl	0x40f9b34 <_ChromeMain+0x40f4898>
 40f9a54: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9a58: 340001a8     	cbz	w8, 0x40f9a8c <_ChromeMain+0x40f47f0>
 40f9a5c: 910083e0     	add	x0, sp, #0x20
 40f9a60: 910083e1     	add	x1, sp, #0x20
 40f9a64: 910003e2     	mov	x2, sp
 40f9a68: 973852c6     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 40f9a6c: 394063e8     	ldrb	w8, [sp, #0x18]
 40f9a70: 340000e8     	cbz	w8, 0x40f9a8c <_ChromeMain+0x40f47f0>
 40f9a74: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f9a78: 36f800a8     	tbz	w8, #0x1f, 0x40f9a8c <_ChromeMain+0x40f47f0>
 40f9a7c: f94003e0     	ldr	x0, [sp]
 40f9a80: f9400be8     	ldr	x8, [sp, #0x10]
 40f9a84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9a88: 96fc3d0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9a8c: f9401be8     	ldr	x8, [sp, #0x30]
 40f9a90: b5000308     	cbnz	x8, 0x40f9af0 <_ChromeMain+0x40f4854>
 40f9a94: f9400e60     	ldr	x0, [x19, #0x18]
 40f9a98: 910003f4     	mov	x20, sp
 40f9a9c: 910003e8     	mov	x8, sp
 40f9aa0: 97ffff3b     	bl	0x40f978c <_ChromeMain+0x40f44f0>
 40f9aa4: f94017e1     	ldr	x1, [sp, #0x28]
 40f9aa8: 910083e8     	add	x8, sp, #0x20
 40f9aac: f81d83a8     	stur	x8, [x29, #-0x28]
 40f9ab0: d100a3a0     	sub	x0, x29, #0x28
 40f9ab4: 97189bfe     	bl	0x720aac <_ChromeMain+0x71b810>
 40f9ab8: a94007e8     	ldp	x8, x1, [sp]
 40f9abc: a90207e8     	stp	x8, x1, [sp, #0x20]
 40f9ac0: f9400be8     	ldr	x8, [sp, #0x10]
 40f9ac4: f9001be8     	str	x8, [sp, #0x30]
 40f9ac8: b4000328     	cbz	x8, 0x40f9b2c <_ChromeMain+0x40f4890>
 40f9acc: 91002288     	add	x8, x20, #0x8
 40f9ad0: f9000835     	str	x21, [x1, #0x10]
 40f9ad4: f90003e8     	str	x8, [sp]
 40f9ad8: a9007d1f     	stp	xzr, xzr, [x8]
 40f9adc: d2800001     	mov	x1, #0x0                ; =0
 40f9ae0: 910003e8     	mov	x8, sp
 40f9ae4: f81d83a8     	stur	x8, [x29, #-0x28]
 40f9ae8: d100a3a0     	sub	x0, x29, #0x28
 40f9aec: 97189bf0     	bl	0x720aac <_ChromeMain+0x71b810>
 40f9af0: 90046f82     	adrp	x2, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9af4: 912b8042     	add	x2, x2, #0xae0
 40f9af8: 910083f4     	add	x20, sp, #0x20
 40f9afc: 910083e1     	add	x1, sp, #0x20
 40f9b00: aa1303e0     	mov	x0, x19
 40f9b04: 97fffcbb     	bl	0x40f8df0 <_ChromeMain+0x40f3b54>
 40f9b08: f94017e1     	ldr	x1, [sp, #0x28]
 40f9b0c: f90003f4     	str	x20, [sp]
 40f9b10: 910003e0     	mov	x0, sp
 40f9b14: 97189be6     	bl	0x720aac <_ChromeMain+0x71b810>
 40f9b18: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 40f9b1c: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 40f9b20: a94457f6     	ldp	x22, x21, [sp, #0x40]
 40f9b24: 9101c3ff     	add	sp, sp, #0x70
 40f9b28: d65f03c0     	ret
 40f9b2c: f90013f5     	str	x21, [sp, #0x20]
 40f9b30: 17ffffec     	b	0x40f9ae0 <_ChromeMain+0x40f4844>
 40f9b34: d10343ff     	sub	sp, sp, #0xd0
 40f9b38: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 40f9b3c: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 40f9b40: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 40f9b44: 910303fd     	add	x29, sp, #0xc0
 40f9b48: aa0003f4     	mov	x20, x0
 40f9b4c: aa0803f3     	mov	x19, x8
 40f9b50: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 40f9b54: f90017ff     	str	xzr, [sp, #0x28]
 40f9b58: 52800028     	mov	w8, #0x1                ; =1
 40f9b5c: 3900c3e8     	strb	w8, [sp, #0x30]
 40f9b60: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 40f9b64: f9001fff     	str	xzr, [sp, #0x38]
 40f9b68: 390143e8     	strb	w8, [sp, #0x50]
 40f9b6c: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 40f9b70: f9002fff     	str	xzr, [sp, #0x58]
 40f9b74: 3901c3e8     	strb	w8, [sp, #0x70]
 40f9b78: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 40f9b7c: f9003fff     	str	xzr, [sp, #0x78]
 40f9b80: 390243e8     	strb	w8, [sp, #0x90]
 40f9b84: 390263e8     	strb	w8, [sp, #0x98]
 40f9b88: 910063e1     	add	x1, sp, #0x18
 40f9b8c: 973602ad     	bl	0xe7a640 <_ChromeMain+0xe753a4>
 40f9b90: aa0003f5     	mov	x21, x0
 40f9b94: 910063e0     	add	x0, sp, #0x18
 40f9b98: 9715231a     	bl	0x642800 <_ChromeMain+0x63d564>
 40f9b9c: 340004d5     	cbz	w21, 0x40f9c34 <_ChromeMain+0x40f4998>
 40f9ba0: 39420288     	ldrb	w8, [x20, #0x80]
 40f9ba4: 34000568     	cbz	w8, 0x40f9c50 <_ChromeMain+0x40f49b4>
 40f9ba8: 910003e8     	mov	x8, sp
 40f9bac: aa1403e0     	mov	x0, x20
 40f9bb0: 97959b9a     	bl	0x2660a18 <_ChromeMain+0x265b77c>
 40f9bb4: 39405fe9     	ldrb	w9, [sp, #0x17]
 40f9bb8: a94023ea     	ldp	x10, x8, [sp]
 40f9bbc: 13001d2b     	sxtb	w11, w9
 40f9bc0: 7100017f     	cmp	w11, #0x0
 40f9bc4: 910003eb     	mov	x11, sp
 40f9bc8: 9a8b4141     	csel	x1, x10, x11, mi
 40f9bcc: 2a0903e9     	mov	w9, w9
 40f9bd0: 9a894102     	csel	x2, x8, x9, mi
 40f9bd4: 910063f4     	add	x20, sp, #0x18
 40f9bd8: 910063e0     	add	x0, sp, #0x18
 40f9bdc: 9709d97e     	bl	0x3701d4 <_ChromeMain+0x36af38>
 40f9be0: 910063e0     	add	x0, sp, #0x18
 40f9be4: aa1303e8     	mov	x8, x19
 40f9be8: 940004d6     	bl	0x40faf40 <_ChromeMain+0x40f5ca4>
 40f9bec: 9101c280     	add	x0, x20, #0x70
 40f9bf0: d2800001     	mov	x1, #0x0                ; =0
 40f9bf4: 96fcb831     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9bf8: 91008280     	add	x0, x20, #0x20
 40f9bfc: 96fcb81f     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9c00: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 40f9c04: 36f800a8     	tbz	w8, #0x1f, 0x40f9c18 <_ChromeMain+0x40f497c>
 40f9c08: f9400fe0     	ldr	x0, [sp, #0x18]
 40f9c0c: f94017e8     	ldr	x8, [sp, #0x28]
 40f9c10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9c14: 96fc3ca9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9c18: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f9c1c: 36f80108     	tbz	w8, #0x1f, 0x40f9c3c <_ChromeMain+0x40f49a0>
 40f9c20: f94003e0     	ldr	x0, [sp]
 40f9c24: f9400be8     	ldr	x8, [sp, #0x10]
 40f9c28: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9c2c: 96fc3ca3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9c30: 14000003     	b	0x40f9c3c <_ChromeMain+0x40f49a0>
 40f9c34: 3900027f     	strb	wzr, [x19]
 40f9c38: 3900627f     	strb	wzr, [x19, #0x18]
 40f9c3c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 40f9c40: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 40f9c44: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 40f9c48: 910343ff     	add	sp, sp, #0xd0
 40f9c4c: d65f03c0     	ret
 40f9c50: d2800008     	mov	x8, #0x0                ; =0
 40f9c54: d280000a     	mov	x10, #0x0               ; =0
 40f9c58: 52800009     	mov	w9, #0x0                ; =0
 40f9c5c: a9007fff     	stp	xzr, xzr, [sp]
 40f9c60: f9000bff     	str	xzr, [sp, #0x10]
 40f9c64: 17ffffd6     	b	0x40f9bbc <_ChromeMain+0x40f4920>
 40f9c68: d10503ff     	sub	sp, sp, #0x140
 40f9c6c: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 40f9c70: a9105ff8     	stp	x24, x23, [sp, #0x100]
 40f9c74: a91157f6     	stp	x22, x21, [sp, #0x110]
 40f9c78: a9124ff4     	stp	x20, x19, [sp, #0x120]
 40f9c7c: a9137bfd     	stp	x29, x30, [sp, #0x130]
 40f9c80: 9104c3fd     	add	x29, sp, #0x130
 40f9c84: aa0803f3     	mov	x19, x8
 40f9c88: b4000100     	cbz	x0, 0x40f9ca8 <_ChromeMain+0x40f4a0c>
 40f9c8c: aa0103f4     	mov	x20, x1
 40f9c90: 39406028     	ldrb	w8, [x1, #0x18]
 40f9c94: 360000a8     	tbz	w8, #0x0, 0x40f9ca8 <_ChromeMain+0x40f4a0c>
 40f9c98: aa0003f5     	mov	x21, x0
 40f9c9c: aa1403e0     	mov	x0, x20
 40f9ca0: 970504e1     	bl	0x23b024 <_ChromeMain+0x235d88>
 40f9ca4: 370002e0     	tbnz	w0, #0x0, 0x40f9d00 <_ChromeMain+0x40f4a64>
 40f9ca8: 528000e8     	mov	w8, #0x7                ; =7
 40f9cac: 39005e68     	strb	w8, [x19, #0x17]
 40f9cb0: 91001e68     	add	x8, x19, #0x7
 40f9cb4: 90046f89     	adrp	x9, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9cb8: 912b4d29     	add	x9, x9, #0xad3
 40f9cbc: eb09011f     	cmp	x8, x9
 40f9cc0: fa498262     	ccmp	x19, x9, #0x2, hi
 40f9cc4: 54000f89     	b.ls	0x40f9eb4 <_ChromeMain+0x40f4c18>
 40f9cc8: 528eac28     	mov	w8, #0x7561             ; =30049
 40f9ccc: 72ae8d88     	movk	w8, #0x746c, lsl #16
 40f9cd0: b8003268     	stur	w8, [x19, #0x3]
 40f9cd4: 528cac88     	mov	w8, #0x6564             ; =25956
 40f9cd8: 72ac2cc8     	movk	w8, #0x6166, lsl #16
 40f9cdc: b9000268     	str	w8, [x19]
 40f9ce0: 39001e7f     	strb	wzr, [x19, #0x7]
 40f9ce4: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 40f9ce8: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 40f9cec: a95157f6     	ldp	x22, x21, [sp, #0x110]
 40f9cf0: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 40f9cf4: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 40f9cf8: 910503ff     	add	sp, sp, #0x140
 40f9cfc: d65f03c0     	ret
 40f9d00: aa1503e0     	mov	x0, x21
 40f9d04: 975bc02b     	bl	0x17e9db0 <_ChromeMain+0x17e4b14>
 40f9d08: aa0003f6     	mov	x22, x0
 40f9d0c: 9101e3f7     	add	x23, sp, #0x78
 40f9d10: 9101e3e8     	add	x8, sp, #0x78
 40f9d14: aa1403e0     	mov	x0, x20
 40f9d18: 97288ce3     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40f9d1c: 910003f8     	mov	x24, sp
 40f9d20: 910003e8     	mov	x8, sp
 40f9d24: aa1403e0     	mov	x0, x20
 40f9d28: 97288cdf     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40f9d2c: 9101e3e1     	add	x1, sp, #0x78
 40f9d30: 910003e2     	mov	x2, sp
 40f9d34: aa1603e0     	mov	x0, x22
 40f9d38: 528000c3     	mov	w3, #0x6                ; =6
 40f9d3c: d2800004     	mov	x4, #0x0                ; =0
 40f9d40: 972608b0     	bl	0xa7c000 <_ChromeMain+0xa76d64>
 40f9d44: aa0003f6     	mov	x22, x0
 40f9d48: 9101c300     	add	x0, x24, #0x70
 40f9d4c: d2800001     	mov	x1, #0x0                ; =0
 40f9d50: 96fcb7da     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9d54: 91008300     	add	x0, x24, #0x20
 40f9d58: 96fcb7c8     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9d5c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f9d60: 36f800a8     	tbz	w8, #0x1f, 0x40f9d74 <_ChromeMain+0x40f4ad8>
 40f9d64: f94003e0     	ldr	x0, [sp]
 40f9d68: f9400be8     	ldr	x8, [sp, #0x10]
 40f9d6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9d70: 96fc3c52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9d74: 9101c2e0     	add	x0, x23, #0x70
 40f9d78: d2800001     	mov	x1, #0x0                ; =0
 40f9d7c: 96fcb7cf     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9d80: 910082e0     	add	x0, x23, #0x20
 40f9d84: 96fcb7bd     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9d88: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 40f9d8c: 36f800a8     	tbz	w8, #0x1f, 0x40f9da0 <_ChromeMain+0x40f4b04>
 40f9d90: f9403fe0     	ldr	x0, [sp, #0x78]
 40f9d94: f94047e8     	ldr	x8, [sp, #0x88]
 40f9d98: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9d9c: 96fc3c47     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9da0: 710006df     	cmp	w22, #0x1
 40f9da4: 54000140     	b.eq	0x40f9dcc <_ChromeMain+0x40f4b30>
 40f9da8: 90046f88     	adrp	x8, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9dac: 912b4d08     	add	x8, x8, #0xad3
 40f9db0: 90046f89     	adrp	x9, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9db4: 912b6d29     	add	x9, x9, #0xadb
 40f9db8: 71000adf     	cmp	w22, #0x2
 40f9dbc: 9a880121     	csel	x1, x9, x8, eq
 40f9dc0: 528000e8     	mov	w8, #0x7                ; =7
 40f9dc4: 52800089     	mov	w9, #0x4                ; =4
 40f9dc8: 1400002e     	b	0x40f9e80 <_ChromeMain+0x40f4be4>
 40f9dcc: f94002a8     	ldr	x8, [x21]
 40f9dd0: f940b508     	ldr	x8, [x8, #0x168]
 40f9dd4: aa1503e0     	mov	x0, x21
 40f9dd8: d63f0100     	blr	x8
 40f9ddc: 90046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9de0: 9128a021     	add	x1, x1, #0xa28
 40f9de4: 52800662     	mov	w2, #0x33               ; =51
 40f9de8: 96fea948     	bl	0xa4308 <_ChromeMain+0x9f06c>
 40f9dec: aa0003f5     	mov	x21, x0
 40f9df0: 9101e3f6     	add	x22, sp, #0x78
 40f9df4: 9101e3e8     	add	x8, sp, #0x78
 40f9df8: aa1403e0     	mov	x0, x20
 40f9dfc: 97288caa     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40f9e00: 9101e3e0     	add	x0, sp, #0x78
 40f9e04: 9715cb21     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 40f9e08: 39805c08     	ldrsb	x8, [x0, #0x17]
 40f9e0c: a9402809     	ldp	x9, x10, [x0]
 40f9e10: f100011f     	cmp	x8, #0x0
 40f9e14: 9a804121     	csel	x1, x9, x0, mi
 40f9e18: 7100011f     	cmp	w8, #0x0
 40f9e1c: 9a884142     	csel	x2, x10, x8, mi
 40f9e20: aa1503e0     	mov	x0, x21
 40f9e24: 97219397     	bl	0x95ec80 <_ChromeMain+0x9599e4>
 40f9e28: aa0003f4     	mov	x20, x0
 40f9e2c: 9101c2c0     	add	x0, x22, #0x70
 40f9e30: d2800001     	mov	x1, #0x0                ; =0
 40f9e34: 96fcb7a1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40f9e38: 910082c0     	add	x0, x22, #0x20
 40f9e3c: 96fcb78f     	bl	0x27c78 <_ChromeMain+0x229dc>
 40f9e40: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 40f9e44: 36f800a8     	tbz	w8, #0x1f, 0x40f9e58 <_ChromeMain+0x40f4bbc>
 40f9e48: f9403fe0     	ldr	x0, [sp, #0x78]
 40f9e4c: f94047e8     	ldr	x8, [sp, #0x88]
 40f9e50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f9e54: 96fc3c19     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f9e58: 90046f88     	adrp	x8, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9e5c: 912d7108     	add	x8, x8, #0xb5c
 40f9e60: 92408289     	and	x9, x20, #0x1ffffffff
 40f9e64: 90046f8a     	adrp	x10, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f9e68: 912d3d4a     	add	x10, x10, #0xb4f
 40f9e6c: b20003eb     	mov	x11, #0x100000001       ; =4294967297
 40f9e70: eb0b013f     	cmp	x9, x11
 40f9e74: 9a880141     	csel	x1, x10, x8, eq
 40f9e78: 528000a8     	mov	w8, #0x5                ; =5
 40f9e7c: 52800189     	mov	w9, #0xc                ; =12
 40f9e80: 9a880134     	csel	x20, x9, x8, eq
 40f9e84: 39005e74     	strb	w20, [x19, #0x17]
 40f9e88: 8b140268     	add	x8, x19, x20
 40f9e8c: eb13011f     	cmp	x8, x19
 40f9e90: 54000123     	b.lo	0x40f9eb4 <_ChromeMain+0x40f4c18>
 40f9e94: eb08003f     	cmp	x1, x8
 40f9e98: fa533020     	ccmp	x1, x19, #0x0, lo
 40f9e9c: 540000c2     	b.hs	0x40f9eb4 <_ChromeMain+0x40f4c18>
 40f9ea0: aa1303e0     	mov	x0, x19
 40f9ea4: aa1403e2     	mov	x2, x20
 40f9ea8: 94fc3f94     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 40f9eac: 38346a7f     	strb	wzr, [x19, x20]
 40f9eb0: 17ffff8d     	b	0x40f9ce4 <_ChromeMain+0x40f4a48>
 40f9eb4: d4200020     	brk	#0x1
