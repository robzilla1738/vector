
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467dc80: d101c3ff     	sub	sp, sp, #0x70
 467dc84: a90457f6     	stp	x22, x21, [sp, #0x40]
 467dc88: a9054ff4     	stp	x20, x19, [sp, #0x50]
 467dc8c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 467dc90: 910183fd     	add	x29, sp, #0x60
 467dc94: aa0003f3     	mov	x19, x0
 467dc98: f9418800     	ldr	x0, [x0, #0x310]
 467dc9c: f940e268     	ldr	x8, [x19, #0x1c0]
 467dca0: a90323ff     	stp	xzr, x8, [sp, #0x30]
 467dca4: 9100c3e1     	add	x1, sp, #0x30
 467dca8: 97089bba     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467dcac: 394c8268     	ldrb	w8, [x19, #0x320]
 467dcb0: 34000168     	cbz	w8, 0x467dcdc <_ChromeMain+0x4678a40>
 467dcb4: b9431a68     	ldr	w8, [x19, #0x318]
 467dcb8: b941c269     	ldr	w9, [x19, #0x1c0]
 467dcbc: b9431e6a     	ldr	w10, [x19, #0x31c]
 467dcc0: b941c66b     	ldr	w11, [x19, #0x1c4]
 467dcc4: 6b09011f     	cmp	w8, w9
 467dcc8: 7a4b0140     	ccmp	w10, w11, #0x0, eq
 467dccc: 54000460     	b.eq	0x467dd58 <_ChromeMain+0x4678abc>
 467dcd0: f940e268     	ldr	x8, [x19, #0x1c0]
 467dcd4: f9018e68     	str	x8, [x19, #0x318]
 467dcd8: 14000007     	b	0x467dcf4 <_ChromeMain+0x4678a58>
 467dcdc: 910c6268     	add	x8, x19, #0x318
 467dce0: b40019a8     	cbz	x8, 0x467e014 <_ChromeMain+0x4678d78>
 467dce4: f940e268     	ldr	x8, [x19, #0x1c0]
 467dce8: f9018e68     	str	x8, [x19, #0x318]
 467dcec: 52800029     	mov	w9, #0x1                ; =1
 467dcf0: 390c8269     	strb	w9, [x19, #0x320]
 467dcf4: f9418a74     	ldr	x20, [x19, #0x310]
 467dcf8: 910c4289     	add	x9, x20, #0x310
 467dcfc: 394c628a     	ldrb	w10, [x20, #0x318]
 467dd00: 350018ca     	cbnz	w10, 0x467e018 <_ChromeMain+0x4678d7c>
 467dd04: b4001889     	cbz	x9, 0x467e014 <_ChromeMain+0x4678d78>
 467dd08: f9018a88     	str	x8, [x20, #0x310]
 467dd0c: 52800028     	mov	w8, #0x1                ; =1
 467dd10: 390c6288     	strb	w8, [x20, #0x318]
 467dd14: f940c680     	ldr	x0, [x20, #0x188]
 467dd18: b40000a0     	cbz	x0, 0x467dd2c <_ChromeMain+0x4678a90>
 467dd1c: f9400008     	ldr	x8, [x0]
 467dd20: f9417d08     	ldr	x8, [x8, #0x2f8]
 467dd24: aa1403e1     	mov	x1, x20
 467dd28: d63f0100     	blr	x8
 467dd2c: aa1403e0     	mov	x0, x20
 467dd30: 52800001     	mov	w1, #0x0                ; =0
 467dd34: 96fec9d0     	bl	0x630474 <_ChromeMain+0x62b1d8>
 467dd38: f9001bf4     	str	x20, [sp, #0x30]
 467dd3c: 9104c280     	add	x0, x20, #0x130
 467dd40: 9100c3e3     	add	x3, sp, #0x30
 467dd44: 52800301     	mov	w1, #0x18               ; =24
 467dd48: 52800022     	mov	w2, #0x1                ; =1
 467dd4c: 9708a521     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 467dd50: aa1403e0     	mov	x0, x20
 467dd54: 972f6365     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 467dd58: f9419660     	ldr	x0, [x19, #0x328]
 467dd5c: f940e268     	ldr	x8, [x19, #0x1c0]
 467dd60: a90323ff     	stp	xzr, x8, [sp, #0x30]
 467dd64: 9100c3e1     	add	x1, sp, #0x30
 467dd68: 97089b8a     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467dd6c: f9419668     	ldr	x8, [x19, #0x328]
 467dd70: b40005e8     	cbz	x8, 0x467de2c <_ChromeMain+0x4678b90>
 467dd74: 39472108     	ldrb	w8, [x8, #0x1c8]
 467dd78: 340005a8     	cbz	w8, 0x467de2c <_ChromeMain+0x4678b90>
 467dd7c: f941de68     	ldr	x8, [x19, #0x3b8]
 467dd80: b4000568     	cbz	x8, 0x467de2c <_ChromeMain+0x4678b90>
 467dd84: d37ae509     	lsl	x9, x8, #6
 467dd88: eb080d34     	subs	x20, x9, x8, lsl #3
 467dd8c: 54000500     	b.eq	0x467de2c <_ChromeMain+0x4678b90>
 467dd90: f941da68     	ldr	x8, [x19, #0x3b0]
 467dd94: 91008115     	add	x21, x8, #0x20
 467dd98: b004c5e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 467dd9c: 3dc01100     	ldr	q0, [x8, #0x40]
 467dda0: 3d8003e0     	str	q0, [sp]
 467dda4: 1400001d     	b	0x467de18 <_ChromeMain+0x4678b7c>
 467dda8: f85f82a8     	ldur	x8, [x21, #-0x8]
 467ddac: 1e270100     	fmov	s0, w8
 467ddb0: d360fd09     	lsr	x9, x8, #32
 467ddb4: b943ca6a     	ldr	w10, [x19, #0x3c8]
 467ddb8: 4b0a03ea     	neg	w10, w10
 467ddbc: 2b0a0129     	adds	w9, w9, w10
 467ddc0: 131f7d2a     	asr	w10, w9, #31
 467ddc4: 5201014a     	eor	w10, w10, #0x80000000
 467ddc8: 1a896149     	csel	w9, w10, w9, vs
 467ddcc: 4d40cea1     	ld1r.2d	{ v1 }, [x21]
 467ddd0: 3dc003e2     	ldr	q2, [sp]
 467ddd4: 6ee24421     	ushl.2d	v1, v1, v2
 467ddd8: 4e0c1d20     	mov.s	v0[1], w9
 467dddc: 0ea12821     	xtn.2s	v1, v1
 467dde0: 0ea10c01     	sqadd.2s	v1, v0, v1
 467dde4: 0ea02c20     	sqsub.2s	v0, v1, v0
 467dde8: 0e0c3c0a     	mov.s	w10, v0[1]
 467ddec: 1e26000b     	fmov	w11, s0
 467ddf0: 0aab7d6b     	bic	w11, w11, w11, asr #31
 467ddf4: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 467ddf8: aa0a816a     	orr	x10, x11, x10, lsl #32
 467ddfc: b3607d28     	bfi	x8, x9, #32, #32
 467de00: a9032be8     	stp	x8, x10, [sp, #0x30]
 467de04: 9100c3e1     	add	x1, sp, #0x30
 467de08: 97089b62     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467de0c: 9100e2b5     	add	x21, x21, #0x38
 467de10: f100e294     	subs	x20, x20, #0x38
 467de14: 540000c0     	b.eq	0x467de2c <_ChromeMain+0x4678b90>
 467de18: f85e02a8     	ldur	x8, [x21, #-0x20]
 467de1c: b4ffff88     	cbz	x8, 0x467de0c <_ChromeMain+0x4678b70>
 467de20: f9400500     	ldr	x0, [x8, #0x8]
 467de24: b4ffff40     	cbz	x0, 0x467de0c <_ChromeMain+0x4678b70>
 467de28: 17ffffe0     	b	0x467dda8 <_ChromeMain+0x4678b0c>
 467de2c: f9419a60     	ldr	x0, [x19, #0x330]
 467de30: f940e268     	ldr	x8, [x19, #0x1c0]
 467de34: a90323ff     	stp	xzr, x8, [sp, #0x30]
 467de38: 9100c3e1     	add	x1, sp, #0x30
 467de3c: 97089b55     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467de40: f9419a68     	ldr	x8, [x19, #0x330]
 467de44: b4000de8     	cbz	x8, 0x467e000 <_ChromeMain+0x4678d64>
 467de48: f9419e68     	ldr	x8, [x19, #0x338]
 467de4c: b4000da8     	cbz	x8, 0x467e000 <_ChromeMain+0x4678d64>
 467de50: f941ba68     	ldr	x8, [x19, #0x370]
 467de54: b4000d68     	cbz	x8, 0x467e000 <_ChromeMain+0x4678d64>
 467de58: 528007a0     	mov	w0, #0x3d               ; =61
 467de5c: 96fa1699     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 467de60: b9438a68     	ldr	w8, [x19, #0x388]
 467de64: 34000128     	cbz	w8, 0x467de88 <_ChromeMain+0x4678bec>
 467de68: b9438e68     	ldr	w8, [x19, #0x38c]
 467de6c: 340000e8     	cbz	w8, 0x467de88 <_ChromeMain+0x4678bec>
 467de70: 3dc0e260     	ldr	q0, [x19, #0x380]
 467de74: 3d800fe0     	str	q0, [sp, #0x30]
 467de78: b941c268     	ldr	w8, [x19, #0x1c0]
 467de7c: b9403be9     	ldr	w9, [sp, #0x38]
 467de80: b94033e0     	ldr	w0, [sp, #0x30]
 467de84: 1400000f     	b	0x467dec0 <_ChromeMain+0x4678c24>
 467de88: b941c268     	ldr	w8, [x19, #0x1c0]
 467de8c: 4b000509     	sub	w9, w8, w0, lsl #1
 467de90: 0aa97d29     	bic	w9, w9, w9, asr #31
 467de94: 29067fe0     	stp	w0, wzr, [sp, #0x30]
 467de98: 2b090009     	adds	w9, w0, w9
 467de9c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 467dea0: 1a896149     	csel	w9, w10, w9, vs
 467dea4: 6b000129     	subs	w9, w9, w0
 467dea8: 131f7d2a     	asr	w10, w9, #31
 467deac: 5201014a     	eor	w10, w10, #0x80000000
 467deb0: 1a896149     	csel	w9, w10, w9, vs
 467deb4: 0aa97d29     	bic	w9, w9, w9, asr #31
 467deb8: 5280040a     	mov	w10, #0x20              ; =32
 467debc: b9003fea     	str	w10, [sp, #0x3c]
 467dec0: 4b000108     	sub	w8, w8, w0
 467dec4: 0aa87d08     	bic	w8, w8, w8, asr #31
 467dec8: 6b09011f     	cmp	w8, w9
 467decc: 1a89b108     	csel	w8, w8, w9, lt
 467ded0: 2b080008     	adds	w8, w0, w8
 467ded4: 131f7d09     	asr	w9, w8, #31
 467ded8: 52010129     	eor	w9, w9, #0x80000000
 467dedc: 1a886128     	csel	w8, w9, w8, vs
 467dee0: 6b000108     	subs	w8, w8, w0
 467dee4: 131f7d09     	asr	w9, w8, #31
 467dee8: 52010129     	eor	w9, w9, #0x80000000
 467deec: 1a886128     	csel	w8, w9, w8, vs
 467def0: 0aa87d08     	bic	w8, w8, w8, asr #31
 467def4: b9003be8     	str	w8, [sp, #0x38]
 467def8: f9419e60     	ldr	x0, [x19, #0x338]
 467defc: 9100c3f4     	add	x20, sp, #0x30
 467df00: 9100c3e1     	add	x1, sp, #0x30
 467df04: 97089b23     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467df08: 3dc0e660     	ldr	q0, [x19, #0x390]
 467df0c: 3d800be0     	str	q0, [sp, #0x20]
 467df10: b9402be8     	ldr	w8, [sp, #0x28]
 467df14: 34000068     	cbz	w8, 0x467df20 <_ChromeMain+0x4678c84>
 467df18: b9402fe8     	ldr	w8, [sp, #0x2c]
 467df1c: 35000368     	cbnz	w8, 0x467df88 <_ChromeMain+0x4678cec>
 467df20: f941b660     	ldr	x0, [x19, #0x368]
 467df24: b27e0294     	orr	x20, x20, #0x4
 467df28: 90048341     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 467df2c: 9108c021     	add	x1, x1, #0x230
 467df30: 97055f54     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 467df34: 4e080c00     	dup.2d	v0, x0
 467df38: b004c5e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 467df3c: 3dc01101     	ldr	q1, [x8, #0x40]
 467df40: 6ee14400     	ushl.2d	v0, v0, v1
 467df44: 0ea12800     	xtn.2s	v0, v0
 467df48: b941c268     	ldr	w8, [x19, #0x1c0]
 467df4c: 4b000108     	sub	w8, w8, w0
 467df50: 1e270101     	fmov	s1, w8
 467df54: b9403fe8     	ldr	w8, [sp, #0x3c]
 467df58: cb408108     	sub	x8, x8, x0, lsr #32
 467df5c: 0b487d08     	add	w8, w8, w8, lsr #31
 467df60: 13017d08     	asr	w8, w8, #1
 467df64: 4e0c1d01     	mov.s	v1[1], w8
 467df68: 2f0004e2     	mvni.2s	v2, #0x7
 467df6c: 0d409282     	ld1.s	{ v2 }[1], [x20]
 467df70: 0ea28421     	add.2s	v1, v1, v2
 467df74: 0ea00c20     	sqadd.2s	v0, v1, v0
 467df78: 0ea12c00     	sqsub.2s	v0, v0, v1
 467df7c: 6f00e402     	movi.2d	v2, #0000000000000000
 467df80: 0ea26400     	smax.2s	v0, v0, v2
 467df84: 6d0203e1     	stp	d1, d0, [sp, #0x20]
 467df88: f941b660     	ldr	x0, [x19, #0x368]
 467df8c: 910083e1     	add	x1, sp, #0x20
 467df90: 97089b00     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467df94: 3dc0ea60     	ldr	q0, [x19, #0x3a0]
 467df98: 3d8007e0     	str	q0, [sp, #0x10]
 467df9c: b9401be8     	ldr	w8, [sp, #0x18]
 467dfa0: 34000068     	cbz	w8, 0x467dfac <_ChromeMain+0x4678d10>
 467dfa4: b9401fe8     	ldr	w8, [sp, #0x1c]
 467dfa8: 35000268     	cbnz	w8, 0x467dff4 <_ChromeMain+0x4678d58>
 467dfac: b94037e8     	ldr	w8, [sp, #0x34]
 467dfb0: b9403fe9     	ldr	w9, [sp, #0x3c]
 467dfb4: b941c26a     	ldr	w10, [x19, #0x1c0]
 467dfb8: b941c66b     	ldr	w11, [x19, #0x1c4]
 467dfbc: 0b080128     	add	w8, w9, w8
 467dfc0: 4b080169     	sub	w9, w11, w8
 467dfc4: 0aa97d29     	bic	w9, w9, w9, asr #31
 467dfc8: 2b090109     	adds	w9, w8, w9
 467dfcc: 12b0000b     	mov	w11, #0x7fffffff        ; =2147483647
 467dfd0: 1a896169     	csel	w9, w11, w9, vs
 467dfd4: 6b080129     	subs	w9, w9, w8
 467dfd8: 131f7d2b     	asr	w11, w9, #31
 467dfdc: 5201016b     	eor	w11, w11, #0x80000000
 467dfe0: 1a896169     	csel	w9, w11, w9, vs
 467dfe4: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 467dfe8: 290223ff     	stp	wzr, w8, [sp, #0x10]
 467dfec: 0aa97d28     	bic	w8, w9, w9, asr #31
 467dff0: 290323ea     	stp	w10, w8, [sp, #0x18]
 467dff4: f941ba60     	ldr	x0, [x19, #0x370]
 467dff8: 910043e1     	add	x1, sp, #0x10
 467dffc: 97089ae5     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 467e000: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 467e004: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 467e008: a94457f6     	ldp	x22, x21, [sp, #0x40]
 467e00c: 9101c3ff     	add	sp, sp, #0x70
 467e010: d65f03c0     	ret
 467e014: d4200020     	brk	#0x1
 467e018: f9000128     	str	x8, [x9]
 467e01c: 17ffff3e     	b	0x467dd14 <_ChromeMain+0x4678a78>
