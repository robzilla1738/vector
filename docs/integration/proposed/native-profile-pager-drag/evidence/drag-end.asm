Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4652918: d104c3ff     	sub	sp, sp, #0x130
 465291c: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 4652920: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 4652924: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 4652928: a91057f6     	stp	x22, x21, [sp, #0x100]
 465292c: a9114ff4     	stp	x20, x19, [sp, #0x110]
 4652930: a9127bfd     	stp	x29, x30, [sp, #0x120]
 4652934: 910483fd     	add	x29, sp, #0x120
 4652938: b40000c1     	cbz	x1, 0x4652950 <_ChromeMain+0x464d6b4>
 465293c: aa0003f3     	mov	x19, x0
 4652940: 395f0008     	ldrb	w8, [x0, #0x7c0]
 4652944: 34000068     	cbz	w8, 0x4652950 <_ChromeMain+0x464d6b4>
 4652948: 395ec268     	ldrb	w8, [x19, #0x7b0]
 465294c: 35000128     	cbnz	w8, 0x4652970 <_ChromeMain+0x464d6d4>
 4652950: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 4652954: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 4652958: a95057f6     	ldp	x22, x21, [sp, #0x100]
 465295c: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 4652960: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 4652964: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 4652968: 9104c3ff     	add	sp, sp, #0x130
 465296c: d65f03c0     	ret
 4652970: aa0203f4     	mov	x20, x2
 4652974: aa0103f5     	mov	x21, x1
 4652978: f943d662     	ldr	x2, [x19, #0x7a8]
 465297c: f943de61     	ldr	x1, [x19, #0x7b8]
 4652980: eb02003f     	cmp	x1, x2
 4652984: 1a9403e8     	csel	w8, wzr, w20, eq
 4652988: 34000068     	cbz	w8, 0x4652994 <_ChromeMain+0x464d6f8>
 465298c: aa1303e0     	mov	x0, x19
 4652990: 94000f43     	bl	0x465669c <_ChromeMain+0x4651400>
 4652994: f94002a8     	ldr	x8, [x21]
 4652998: f9402d08     	ldr	x8, [x8, #0x58]
 465299c: aa1503e0     	mov	x0, x21
 46529a0: d63f0100     	blr	x8
 46529a4: aa0003f6     	mov	x22, x0
 46529a8: 9400a888     	bl	0x467cbc8 <_ChromeMain+0x467792c>
 46529ac: f10002df     	cmp	x22, #0x0
 46529b0: 1a9f07e8     	cset	w8, ne
 46529b4: eb0002df     	cmp	x22, x0
 46529b8: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 46529bc: 540000c0     	b.eq	0x46529d4 <_ChromeMain+0x464d738>
 46529c0: f94026d6     	ldr	x22, [x22, #0x48]
 46529c4: f10002df     	cmp	x22, #0x0
 46529c8: 1a9f07e8     	cset	w8, ne
 46529cc: fa4012c4     	ccmp	x22, x0, #0x4, ne
 46529d0: 54ffff81     	b.ne	0x46529c0 <_ChromeMain+0x464d724>
 46529d4: 34000148     	cbz	w8, 0x46529fc <_ChromeMain+0x464d760>
 46529d8: 3913cabf     	strb	wzr, [x21, #0x4f2]
 46529dc: f94012b6     	ldr	x22, [x21, #0x20]
 46529e0: b40000b6     	cbz	x22, 0x46529f4 <_ChromeMain+0x464d758>
 46529e4: f940b2c0     	ldr	x0, [x22, #0x160]
 46529e8: b4001d60     	cbz	x0, 0x4652d94 <_ChromeMain+0x464daf8>
 46529ec: 1e2e1000     	fmov	s0, #1.00000000
 46529f0: 97528852     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 46529f4: aa1503e0     	mov	x0, x21
 46529f8: 96fd39e1     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46529fc: 395f0268     	ldrb	w8, [x19, #0x7c0]
 4652a00: 34000048     	cbz	w8, 0x4652a08 <_ChromeMain+0x464d76c>
 4652a04: 391f027f     	strb	wzr, [x19, #0x7c0]
 4652a08: 395ec268     	ldrb	w8, [x19, #0x7b0]
 4652a0c: 34000048     	cbz	w8, 0x4652a14 <_ChromeMain+0x464d778>
 4652a10: 391ec27f     	strb	wzr, [x19, #0x7b0]
 4652a14: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4652a18: 90052b16     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4652a1c: f94046c9     	ldr	x9, [x22, #0x88]
 4652a20: eb09011f     	cmp	x8, x9
 4652a24: 54000061     	b.ne	0x4652a30 <_ChromeMain+0x464d794>
 4652a28: aa1503e0     	mov	x0, x21
 4652a2c: 96e70634     	bl	0x142fc <_ChromeMain+0xf060>
 4652a30: f943fe60     	ldr	x0, [x19, #0x7f8]
 4652a34: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4652a38: f94046c9     	ldr	x9, [x22, #0x88]
 4652a3c: eb09011f     	cmp	x8, x9
 4652a40: 54000041     	b.ne	0x4652a48 <_ChromeMain+0x464d7ac>
 4652a44: 96e73ffe     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4652a48: f903fe75     	str	x21, [x19, #0x7f8]
 4652a4c: 910003e8     	mov	x8, sp
 4652a50: aa1503e0     	mov	x0, x21
 4652a54: 97f67433     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 4652a58: 910003e0     	mov	x0, sp
 4652a5c: 96f7ad14     	bl	0x43deac <_ChromeMain+0x438c10>
 4652a60: 1e2c1002     	fmov	s2, #0.50000000
 4652a64: 1e222800     	fadd	s0, s0, s2
 4652a68: 1e254000     	frintm	s0, s0
 4652a6c: 0f0665e3     	movi.2s	v3, #0xcf, lsl #24
 4652a70: 1e232000     	fcmp	s0, s3
 4652a74: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 4652a78: 1a88b3e9     	csel	w9, wzr, w8, lt
 4652a7c: 1e236804     	fmaxnm	s4, s0, s3
 4652a80: 1e38008a     	fcvtzs	w10, s4
 4652a84: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 4652a88: 1e270164     	fmov	s4, w11
 4652a8c: 1e242000     	fcmp	s0, s4
 4652a90: 1a899149     	csel	w9, w10, w9, ls
 4652a94: 1e222820     	fadd	s0, s1, s2
 4652a98: 1e254000     	frintm	s0, s0
 4652a9c: 1e232000     	fcmp	s0, s3
 4652aa0: 1e236801     	fmaxnm	s1, s0, s3
 4652aa4: 1e38002a     	fcvtzs	w10, s1
 4652aa8: 1a88b3e8     	csel	w8, wzr, w8, lt
 4652aac: 1e242000     	fcmp	s0, s4
 4652ab0: 1a889148     	csel	w8, w10, w8, ls
 4652ab4: aa088128     	orr	x8, x9, x8, lsl #32
 4652ab8: f9040268     	str	x8, [x19, #0x800]
 4652abc: f942f268     	ldr	x8, [x19, #0x5e0]
 4652ac0: b40000e8     	cbz	x8, 0x4652adc <_ChromeMain+0x464d840>
 4652ac4: 3946a509     	ldrb	w9, [x8, #0x1a9]
 4652ac8: 340000a9     	cbz	w9, 0x4652adc <_ChromeMain+0x464d840>
 4652acc: 3906a51f     	strb	wzr, [x8, #0x1a9]
 4652ad0: 9103e100     	add	x0, x8, #0xf8
 4652ad4: 9106a501     	add	x1, x8, #0x1a9
 4652ad8: 9723553e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4652adc: 397d2268     	ldrb	w8, [x19, #0xf48]
 4652ae0: 35001e28     	cbnz	w8, 0x4652ea4 <_ChromeMain+0x464dc08>
 4652ae4: f907b27f     	str	xzr, [x19, #0xf60]
 4652ae8: 397c0268     	ldrb	w8, [x19, #0xf00]
 4652aec: 35001aa8     	cbnz	w8, 0x4652e40 <_ChromeMain+0x464dba4>
 4652af0: 913bc260     	add	x0, x19, #0xef0
 4652af4: 52800001     	mov	w1, #0x0                ; =0
 4652af8: 97752f9b     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4652afc: 3707f2b4     	tbnz	w20, #0x0, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b00: 39602268     	ldrb	w8, [x19, #0x808]
 4652b04: 34fff268     	cbz	w8, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b08: 900544b6     	adrp	x22, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4652b0c: f9467ec0     	ldr	x0, [x22, #0xcf8]
 4652b10: b4fff200     	cbz	x0, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b14: 974f3419     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4652b18: f9467ec8     	ldr	x8, [x22, #0xcf8]
 4652b1c: b4fff1a8     	cbz	x8, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b20: b4fff180     	cbz	x0, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b24: f9401d14     	ldr	x20, [x8, #0x38]
 4652b28: b4fff154     	cbz	x20, 0x4652950 <_ChromeMain+0x464d6b4>
 4652b2c: 974f3439     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4652b30: aa0003f5     	mov	x21, x0
 4652b34: a939ffbf     	stp	xzr, xzr, [x29, #-0x68]
 4652b38: f81a83bf     	stur	xzr, [x29, #-0x58]
 4652b3c: f9467ec0     	ldr	x0, [x22, #0xcf8]
 4652b40: b40006c0     	cbz	x0, 0x4652c18 <_ChromeMain+0x464d97c>
 4652b44: 974f340d     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4652b48: f9467ec8     	ldr	x8, [x22, #0xcf8]
 4652b4c: b40001e8     	cbz	x8, 0x4652b88 <_ChromeMain+0x464d8ec>
 4652b50: f9401d16     	ldr	x22, [x8, #0x38]
 4652b54: b4000620     	cbz	x0, 0x4652c18 <_ChromeMain+0x464d97c>
 4652b58: 974f342e     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4652b5c: d101a3a8     	sub	x8, x29, #0x68
 4652b60: aa1603e1     	mov	x1, x22
 4652b64: 97eaab24     	bl	0x40fd7f4 <_ChromeMain+0x40f8558>
 4652b68: f85a03a1     	ldur	x1, [x29, #-0x60]
 4652b6c: 8b010428     	add	x8, x1, x1, lsl #1
 4652b70: d37df117     	lsl	x23, x8, #3
 4652b74: b4000597     	cbz	x23, 0x4652c24 <_ChromeMain+0x464d988>
 4652b78: d280001a     	mov	x26, #0x0               ; =0
 4652b7c: f85983b6     	ldur	x22, [x29, #-0x68]
 4652b80: 52800318     	mov	w24, #0x18              ; =24
 4652b84: 1400000c     	b	0x4652bb4 <_ChromeMain+0x464d918>
 4652b88: d2800016     	mov	x22, #0x0               ; =0
 4652b8c: 17fffff2     	b	0x4652b54 <_ChromeMain+0x464d8b8>
 4652b90: a9400901     	ldp	x1, x2, [x8]
 4652b94: aa1603e0     	mov	x0, x22
 4652b98: 96f957c7     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4652b9c: 14000002     	b	0x4652ba4 <_ChromeMain+0x464d908>
 4652ba0: aa1a03f9     	mov	x25, x26
 4652ba4: 910062d6     	add	x22, x22, #0x18
 4652ba8: aa1903fa     	mov	x26, x25
 4652bac: f10062f7     	subs	x23, x23, #0x18
 4652bb0: 54000300     	b.eq	0x4652c10 <_ChromeMain+0x464d974>
 4652bb4: aa1503e0     	mov	x0, x21
 4652bb8: aa1603e1     	mov	x1, x22
 4652bbc: 974f3451     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4652bc0: b4ffff00     	cbz	x0, 0x4652ba0 <_ChromeMain+0x464d904>
 4652bc4: 39418008     	ldrb	w8, [x0, #0x60]
 4652bc8: 3707fec8     	tbnz	w8, #0x0, 0x4652ba0 <_ChromeMain+0x464d904>
 4652bcc: f9439a68     	ldr	x8, [x19, #0x730]
 4652bd0: eb08035f     	cmp	x26, x8
 4652bd4: 54fffe62     	b.hs	0x4652ba0 <_ChromeMain+0x464d904>
 4652bd8: 91000759     	add	x25, x26, #0x1
 4652bdc: f9439668     	ldr	x8, [x19, #0x728]
 4652be0: 9b182348     	madd	x8, x26, x24, x8
 4652be4: eb0802df     	cmp	x22, x8
 4652be8: 54fffde0     	b.eq	0x4652ba4 <_ChromeMain+0x464d908>
 4652bec: 39c05eca     	ldrsb	w10, [x22, #0x17]
 4652bf0: 39405d09     	ldrb	w9, [x8, #0x17]
 4652bf4: 37f815ca     	tbnz	w10, #0x1f, 0x4652eac <_ChromeMain+0x464dc10>
 4652bf8: 373ffcc9     	tbnz	w9, #0x7, 0x4652b90 <_ChromeMain+0x464d8f4>
 4652bfc: 3dc00100     	ldr	q0, [x8]
 4652c00: f9400908     	ldr	x8, [x8, #0x10]
 4652c04: f9000ac8     	str	x8, [x22, #0x10]
 4652c08: 3d8002c0     	str	q0, [x22]
 4652c0c: 17ffffe6     	b	0x4652ba4 <_ChromeMain+0x464d908>
 4652c10: f85a03a1     	ldur	x1, [x29, #-0x60]
 4652c14: 14000004     	b	0x4652c24 <_ChromeMain+0x464d988>
 4652c18: d2800001     	mov	x1, #0x0                ; =0
 4652c1c: a939ffbf     	stp	xzr, xzr, [x29, #-0x68]
 4652c20: f81a83bf     	stur	xzr, [x29, #-0x58]
 4652c24: 910223f5     	add	x21, sp, #0x88
 4652c28: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 4652c2c: f81903bf     	stur	xzr, [x29, #-0x70]
 4652c30: d10203a0     	sub	x0, x29, #0x80
 4652c34: 9748f153     	bl	0x188f180 <_ChromeMain+0x1889ee4>
 4652c38: f85a03a8     	ldur	x8, [x29, #-0x60]
 4652c3c: 8b080508     	add	x8, x8, x8, lsl #1
 4652c40: d37df116     	lsl	x22, x8, #3
 4652c44: b4000476     	cbz	x22, 0x4652cd0 <_ChromeMain+0x464da34>
 4652c48: f85983b3     	ldur	x19, [x29, #-0x68]
 4652c4c: 14000012     	b	0x4652c94 <_ChromeMain+0x464d9f8>
 4652c50: a9488be1     	ldp	x1, x2, [sp, #0x88]
 4652c54: 910003e0     	mov	x0, sp
 4652c58: 96e71570     	bl	0x18218 <_ChromeMain+0x12f7c>
 4652c5c: d10203a0     	sub	x0, x29, #0x80
 4652c60: 910003e1     	mov	x1, sp
 4652c64: 97504bf5     	bl	0x1a65c38 <_ChromeMain+0x1a6099c>
 4652c68: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4652c6c: 36f800a8     	tbz	w8, #0x1f, 0x4652c80 <_ChromeMain+0x464d9e4>
 4652c70: f94003e0     	ldr	x0, [sp]
 4652c74: f9400be8     	ldr	x8, [sp, #0x10]
 4652c78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652c7c: 96e6d88f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652c80: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4652c84: 37f801c8     	tbnz	w8, #0x1f, 0x4652cbc <_ChromeMain+0x464da20>
 4652c88: 91006273     	add	x19, x19, #0x18
 4652c8c: f10062d6     	subs	x22, x22, #0x18
 4652c90: 54000200     	b.eq	0x4652cd0 <_ChromeMain+0x464da34>
 4652c94: 910223e8     	add	x8, sp, #0x88
 4652c98: aa1303e0     	mov	x0, x19
 4652c9c: 97387a74     	bl	0x147166c <_ChromeMain+0x146c3d0>
 4652ca0: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4652ca4: 37fffd68     	tbnz	w8, #0x1f, 0x4652c50 <_ChromeMain+0x464d9b4>
 4652ca8: 3dc002a0     	ldr	q0, [x21]
 4652cac: 3d8003e0     	str	q0, [sp]
 4652cb0: f9404fe8     	ldr	x8, [sp, #0x98]
 4652cb4: f9000be8     	str	x8, [sp, #0x10]
 4652cb8: 17ffffe9     	b	0x4652c5c <_ChromeMain+0x464d9c0>
 4652cbc: f94047e0     	ldr	x0, [sp, #0x88]
 4652cc0: f9404fe8     	ldr	x8, [sp, #0x98]
 4652cc4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652cc8: 96e6d87c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652ccc: 17ffffef     	b	0x4652c88 <_ChromeMain+0x464d9ec>
 4652cd0: f85803a8     	ldur	x8, [x29, #-0x80]
 4652cd4: f90003e8     	str	x8, [sp]
 4652cd8: 3cc202a0     	ldur	q0, [x21, #0x20]
 4652cdc: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 4652ce0: f81903bf     	stur	xzr, [x29, #-0x70]
 4652ce4: 3c8083e0     	stur	q0, [sp, #0x8]
 4652ce8: 528000e8     	mov	w8, #0x7                ; =7
 4652cec: 390063e8     	strb	w8, [sp, #0x18]
 4652cf0: 900444c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4652cf4: 9112a021     	add	x1, x1, #0x4a8
 4652cf8: 910003e3     	mov	x3, sp
 4652cfc: aa1403e0     	mov	x0, x20
 4652d00: 52800422     	mov	w2, #0x21               ; =33
 4652d04: 973adae9     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4652d08: 394063e8     	ldrb	w8, [sp, #0x18]
 4652d0c: 7103fd1f     	cmp	w8, #0xff
 4652d10: 54000060     	b.eq	0x4652d1c <_ChromeMain+0x464da80>
 4652d14: 721e791f     	tst	w8, #0xfffffffd
 4652d18: 540006a1     	b.ne	0x4652dec <_ChromeMain+0x464db50>
 4652d1c: f85803a1     	ldur	x1, [x29, #-0x80]
 4652d20: b5000581     	cbnz	x1, 0x4652dd0 <_ChromeMain+0x464db34>
 4652d24: f85983b3     	ldur	x19, [x29, #-0x68]
 4652d28: b4ffe153     	cbz	x19, 0x4652950 <_ChromeMain+0x464d6b4>
 4652d2c: f85a03a8     	ldur	x8, [x29, #-0x60]
 4652d30: 8b080509     	add	x9, x8, x8, lsl #1
 4652d34: d37df129     	lsl	x9, x9, #3
 4652d38: b4000ca9     	cbz	x9, 0x4652ecc <_ChromeMain+0x464dc30>
 4652d3c: 8b130129     	add	x9, x9, x19
 4652d40: d1006134     	sub	x20, x9, #0x18
 4652d44: d37df109     	lsl	x9, x8, #3
 4652d48: cb081535     	sub	x21, x9, x8, lsl #5
 4652d4c: b4000c94     	cbz	x20, 0x4652edc <_ChromeMain+0x464dc40>
 4652d50: 39c05e88     	ldrsb	w8, [x20, #0x17]
 4652d54: 37f806c8     	tbnz	w8, #0x1f, 0x4652e2c <_ChromeMain+0x464db90>
 4652d58: d1006294     	sub	x20, x20, #0x18
 4652d5c: b10062b5     	adds	x21, x21, #0x18
 4652d60: 54ffff61     	b.ne	0x4652d4c <_ChromeMain+0x464dab0>
 4652d64: f85983a0     	ldur	x0, [x29, #-0x68]
 4652d68: cb000268     	sub	x8, x19, x0
 4652d6c: 9343fd08     	asr	x8, x8, #3
 4652d70: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4652d74: f2955569     	movk	x9, #0xaaab
 4652d78: 9b097d08     	mul	x8, x8, x9
 4652d7c: f81a03a8     	stur	x8, [x29, #-0x60]
 4652d80: f85a83a8     	ldur	x8, [x29, #-0x58]
 4652d84: 8b080508     	add	x8, x8, x8, lsl #1
 4652d88: d37df101     	lsl	x1, x8, #3
 4652d8c: 96e6d84b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652d90: 17fffef0     	b	0x4652950 <_ChromeMain+0x464d6b4>
 4652d94: 52802400     	mov	w0, #0x120              ; =288
 4652d98: 96e6f174     	bl	0xf368 <_ChromeMain+0xa0cc>
 4652d9c: aa0003f7     	mov	x23, x0
 4652da0: d2800001     	mov	x1, #0x0                ; =0
 4652da4: 97289d4d     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4652da8: b40000a0     	cbz	x0, 0x4652dbc <_ChromeMain+0x464db20>
 4652dac: b9400ae8     	ldr	w8, [x23, #0x8]
 4652db0: 31000508     	adds	w8, w8, #0x1
 4652db4: b9000ae8     	str	w8, [x23, #0x8]
 4652db8: 540008e2     	b.hs	0x4652ed4 <_ChromeMain+0x464dc38>
 4652dbc: aa1603e0     	mov	x0, x22
 4652dc0: aa1703e1     	mov	x1, x23
 4652dc4: 9730a50e     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4652dc8: f940b2c0     	ldr	x0, [x22, #0x160]
 4652dcc: 17ffff08     	b	0x46529ec <_ChromeMain+0x464d750>
 4652dd0: d10203a0     	sub	x0, x29, #0x80
 4652dd4: 97135047     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4652dd8: f85803a0     	ldur	x0, [x29, #-0x80]
 4652ddc: f85903a8     	ldur	x8, [x29, #-0x70]
 4652de0: d37be901     	lsl	x1, x8, #5
 4652de4: 96e6d835     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652de8: 17ffffcf     	b	0x4652d24 <_ChromeMain+0x464da88>
 4652dec: 7100111f     	cmp	w8, #0x4
 4652df0: 54000100     	b.eq	0x4652e10 <_ChromeMain+0x464db74>
 4652df4: f0051369     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4652df8: 9121e129     	add	x9, x9, #0x878
 4652dfc: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 4652e00: 910223e0     	add	x0, sp, #0x88
 4652e04: 910003e1     	mov	x1, sp
 4652e08: d63f0100     	blr	x8
 4652e0c: 17ffffc4     	b	0x4652d1c <_ChromeMain+0x464da80>
 4652e10: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4652e14: 36fff848     	tbz	w8, #0x1f, 0x4652d1c <_ChromeMain+0x464da80>
 4652e18: f94003e0     	ldr	x0, [sp]
 4652e1c: f9400be8     	ldr	x8, [sp, #0x10]
 4652e20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652e24: 96e6d825     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652e28: 17ffffbd     	b	0x4652d1c <_ChromeMain+0x464da80>
 4652e2c: f9400280     	ldr	x0, [x20]
 4652e30: f9400a88     	ldr	x8, [x20, #0x10]
 4652e34: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4652e38: 96e6d820     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4652e3c: 17ffffc7     	b	0x4652d58 <_ChromeMain+0x464dabc>
 4652e40: 393c027f     	strb	wzr, [x19, #0xf00]
 4652e44: f9478a60     	ldr	x0, [x19, #0xf10]
 4652e48: 913bc261     	add	x1, x19, #0xef0
 4652e4c: 976ada2d     	bl	0x2109700 <_ChromeMain+0x2104464>
 4652e50: f9477a68     	ldr	x8, [x19, #0xef0]
 4652e54: f9401d08     	ldr	x8, [x8, #0x38]
 4652e58: 913bc260     	add	x0, x19, #0xef0
 4652e5c: d63f0100     	blr	x8
 4652e60: f9478668     	ldr	x8, [x19, #0xf08]
 4652e64: b4ffe468     	cbz	x8, 0x4652af0 <_ChromeMain+0x464d854>
 4652e68: f9477a68     	ldr	x8, [x19, #0xef0]
 4652e6c: f9402108     	ldr	x8, [x8, #0x40]
 4652e70: 913bc260     	add	x0, x19, #0xef0
 4652e74: d63f0100     	blr	x8
 4652e78: f9478668     	ldr	x8, [x19, #0xf08]
 4652e7c: f9400109     	ldr	x9, [x8]
 4652e80: 7100001f     	cmp	w0, #0x0
 4652e84: 5280020a     	mov	w10, #0x10              ; =16
 4652e88: 5280040b     	mov	w11, #0x20              ; =32
 4652e8c: 9a8a116a     	csel	x10, x11, x10, ne
 4652e90: f86a6929     	ldr	x9, [x9, x10]
 4652e94: 913bc261     	add	x1, x19, #0xef0
 4652e98: aa0803e0     	mov	x0, x8
 4652e9c: d63f0120     	blr	x9
 4652ea0: 17ffff14     	b	0x4652af0 <_ChromeMain+0x464d854>
 4652ea4: 393d227f     	strb	wzr, [x19, #0xf48]
 4652ea8: 17ffff0f     	b	0x4652ae4 <_ChromeMain+0x464d848>
 4652eac: 13001d2a     	sxtb	w10, w9
 4652eb0: 7100015f     	cmp	w10, #0x0
 4652eb4: a9402d0a     	ldp	x10, x11, [x8]
 4652eb8: 9a884141     	csel	x1, x10, x8, mi
 4652ebc: 9a894162     	csel	x2, x11, x9, mi
 4652ec0: aa1603e0     	mov	x0, x22
 4652ec4: 96f9574f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4652ec8: 17ffff37     	b	0x4652ba4 <_ChromeMain+0x464d908>
 4652ecc: aa1303e0     	mov	x0, x19
 4652ed0: 17ffffa6     	b	0x4652d68 <_ChromeMain+0x464dacc>
 4652ed4: d4200000     	brk	#0
 4652ed8: d4400000     	hlt	#0
 4652edc: d4200020     	brk	#0x1
 4652ee0: d10503ff     	sub	sp, sp, #0x140
