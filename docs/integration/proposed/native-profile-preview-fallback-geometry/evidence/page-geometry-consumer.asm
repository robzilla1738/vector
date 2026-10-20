
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
