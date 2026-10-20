
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461b834: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461b838: a90157f6     	stp	x22, x21, [sp, #0x10]
 461b83c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461b840: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461b844: 9100c3fd     	add	x29, sp, #0x30
 461b848: aa0003f3     	mov	x19, x0
 461b84c: 391d081f     	strb	wzr, [x0, #0x742]
 461b850: f9439408     	ldr	x8, [x0, #0x728]
 461b854: 8b080508     	add	x8, x8, x8, lsl #1
 461b858: d37df109     	lsl	x9, x8, #3
 461b85c: b4000089     	cbz	x9, 0x461b86c <_ChromeMain+0x46165d0>
 461b860: f9439275     	ldr	x21, [x19, #0x720]
 461b864: 8b080eb6     	add	x22, x21, x8, lsl #3
 461b868: 14000014     	b	0x461b8b8 <_ChromeMain+0x461661c>
 461b86c: f942a268     	ldr	x8, [x19, #0x540]
 461b870: b4000088     	cbz	x8, 0x461b880 <_ChromeMain+0x46165e4>
 461b874: f9406108     	ldr	x8, [x8, #0xc0]
 461b878: f100011f     	cmp	x8, #0x0
 461b87c: 1a9f07e8     	cset	w8, ne
 461b880: 39218a68     	strb	w8, [x19, #0x862]
 461b884: f9429e60     	ldr	x0, [x19, #0x538]
 461b888: b40007e0     	cbz	x0, 0x461b984 <_ChromeMain+0x46166e8>
 461b88c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461b890: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461b894: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461b898: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461b89c: 16fe1638     	b	0x5a117c <_ChromeMain+0x59bee0>
 461b8a0: aa0103e0     	mov	x0, x1
 461b8a4: aa1403e1     	mov	x1, x20
 461b8a8: 970a24ba     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 461b8ac: 910062b5     	add	x21, x21, #0x18
 461b8b0: eb1602bf     	cmp	x21, x22
 461b8b4: 54fffdc0     	b.eq	0x461b86c <_ChromeMain+0x46165d0>
 461b8b8: aa1503f4     	mov	x20, x21
 461b8bc: f8408688     	ldr	x8, [x20], #0x8
 461b8c0: b4000148     	cbz	x8, 0x461b8e8 <_ChromeMain+0x461664c>
 461b8c4: f9438a69     	ldr	x9, [x19, #0x710]
 461b8c8: d37df129     	lsl	x9, x9, #3
 461b8cc: b40000e9     	cbz	x9, 0x461b8e8 <_ChromeMain+0x461664c>
 461b8d0: f943866a     	ldr	x10, [x19, #0x708]
 461b8d4: f840854b     	ldr	x11, [x10], #0x8
 461b8d8: eb08017f     	cmp	x11, x8
 461b8dc: 54fffe80     	b.eq	0x461b8ac <_ChromeMain+0x4616610>
 461b8e0: f1002129     	subs	x9, x9, #0x8
 461b8e4: 54ffff81     	b.ne	0x461b8d4 <_ChromeMain+0x4616638>
 461b8e8: f942ea69     	ldr	x9, [x19, #0x5d0]
 461b8ec: f942ee6a     	ldr	x10, [x19, #0x5d8]
 461b8f0: d37ced4b     	lsl	x11, x10, #4
 461b8f4: b400044b     	cbz	x11, 0x461b97c <_ChromeMain+0x46166e0>
 461b8f8: 9344fd6b     	asr	x11, x11, #4
 461b8fc: aa0903f7     	mov	x23, x9
 461b900: d341fd6c     	lsr	x12, x11, #1
 461b904: 8b0c12ed     	add	x13, x23, x12, lsl #4
 461b908: f84105ae     	ldr	x14, [x13], #0x10
 461b90c: aa6b07ef     	mvn	x15, x11, lsr #1
 461b910: 8b0f016b     	add	x11, x11, x15
 461b914: eb0801df     	cmp	x14, x8
 461b918: 9a8c316b     	csel	x11, x11, x12, lo
 461b91c: 9a9731b7     	csel	x23, x13, x23, lo
 461b920: b5ffff0b     	cbnz	x11, 0x461b900 <_ChromeMain+0x4616664>
 461b924: 8b0a1129     	add	x9, x9, x10, lsl #4
 461b928: eb0902ff     	cmp	x23, x9
 461b92c: 54fffc00     	b.eq	0x461b8ac <_ChromeMain+0x4616610>
 461b930: f94002e9     	ldr	x9, [x23]
 461b934: eb09011f     	cmp	x8, x9
 461b938: 54fffba3     	b.lo	0x461b8ac <_ChromeMain+0x4616610>
 461b93c: f94006e1     	ldr	x1, [x23, #0x8]
 461b940: b4fffb61     	cbz	x1, 0x461b8ac <_ChromeMain+0x4616610>
 461b944: f942a260     	ldr	x0, [x19, #0x540]
 461b948: b4fffac0     	cbz	x0, 0x461b8a0 <_ChromeMain+0x4616604>
 461b94c: 95810762     	bl	0xa65d6d4 <_ChromeMain+0xa658438>
 461b950: d360fc08     	lsr	x8, x0, #32
 461b954: 29412aa9     	ldp	w9, w10, [x21, #0x8]
 461b958: 6b00013f     	cmp	w9, w0
 461b95c: 7a480140     	ccmp	w10, w8, #0x0, eq
 461b960: 540001c1     	b.ne	0x461b998 <_ChromeMain+0x46166fc>
 461b964: d360fc28     	lsr	x8, x1, #32
 461b968: 29422aa9     	ldp	w9, w10, [x21, #0x10]
 461b96c: 6b01013f     	cmp	w9, w1
 461b970: 7a480140     	ccmp	w10, w8, #0x0, eq
 461b974: 54fff9c0     	b.eq	0x461b8ac <_ChromeMain+0x4616610>
 461b978: 14000008     	b	0x461b998 <_ChromeMain+0x46166fc>
 461b97c: aa0903f7     	mov	x23, x9
 461b980: 17ffffe9     	b	0x461b924 <_ChromeMain+0x4616688>
 461b984: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461b988: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461b98c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461b990: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461b994: d65f03c0     	ret
 461b998: f942a260     	ldr	x0, [x19, #0x540]
 461b99c: f94006e1     	ldr	x1, [x23, #0x8]
 461b9a0: aa1403e2     	mov	x2, x20
 461b9a4: 95810738     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 461b9a8: 17ffffc1     	b	0x461b8ac <_ChromeMain+0x4616610>
 461b9ac: d10103ff     	sub	sp, sp, #0x40
 461b9b0: a90157f6     	stp	x22, x21, [sp, #0x10]
 461b9b4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461b9b8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461b9bc: 9100c3fd     	add	x29, sp, #0x30
 461b9c0: b4000541     	cbz	x1, 0x461ba68 <_ChromeMain+0x46167cc>
 461b9c4: aa0203f5     	mov	x21, x2
 461b9c8: aa0103f3     	mov	x19, x1
 461b9cc: aa0003f4     	mov	x20, x0
 461b9d0: f9400008     	ldr	x8, [x0]
 461b9d4: f9403508     	ldr	x8, [x8, #0x68]
 461b9d8: d63f0100     	blr	x8
 461b9dc: b40004a0     	cbz	x0, 0x461ba70 <_ChromeMain+0x46167d4>
 461b9e0: f9400288     	ldr	x8, [x20]
 461b9e4: f9403508     	ldr	x8, [x8, #0x68]
 461b9e8: aa1403e0     	mov	x0, x20
 461b9ec: d63f0100     	blr	x8
 461b9f0: f940c808     	ldr	x8, [x0, #0x190]
 461b9f4: b40003e8     	cbz	x8, 0x461ba70 <_ChromeMain+0x46167d4>
 461b9f8: 2d5206a0     	ldp	s0, s1, [x21, #0x90]
 461b9fc: 1e254000     	frintm	s0, s0
 461ba00: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461ba04: 1e222000     	fcmp	s0, s2
 461ba08: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461ba0c: 1a88b3e9     	csel	w9, wzr, w8, lt
 461ba10: 1e226803     	fmaxnm	s3, s0, s2
 461ba14: 1e38006a     	fcvtzs	w10, s3
 461ba18: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461ba1c: 1e270163     	fmov	s3, w11
 461ba20: 1e232000     	fcmp	s0, s3
 461ba24: 1a899149     	csel	w9, w10, w9, ls
 461ba28: 1e254020     	frintm	s0, s1
 461ba2c: 1e222000     	fcmp	s0, s2
 461ba30: 1a88b3e8     	csel	w8, wzr, w8, lt
 461ba34: 1e226801     	fmaxnm	s1, s0, s2
 461ba38: 1e38002a     	fcvtzs	w10, s1
 461ba3c: 1e232000     	fcmp	s0, s3
 461ba40: 1a889148     	csel	w8, w10, w8, ls
 461ba44: aa088128     	orr	x8, x9, x8, lsl #32
 461ba48: f90007e8     	str	x8, [sp, #0x8]
 461ba4c: f9400288     	ldr	x8, [x20]
 461ba50: f9403508     	ldr	x8, [x8, #0x68]
 461ba54: aa1403e0     	mov	x0, x20
 461ba58: d63f0100     	blr	x8
 461ba5c: f940c800     	ldr	x0, [x0, #0x190]
 461ba60: 910023e2     	add	x2, sp, #0x8
 461ba64: 1400001a     	b	0x461bacc <_ChromeMain+0x4616830>
 461ba68: f90007ff     	str	xzr, [sp, #0x8]
 461ba6c: 1400001a     	b	0x461bad4 <_ChromeMain+0x4616838>
 461ba70: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 461ba74: 1e254000     	frintm	s0, s0
 461ba78: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461ba7c: 1e222000     	fcmp	s0, s2
 461ba80: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461ba84: 1a88b3e9     	csel	w9, wzr, w8, lt
 461ba88: 1e226803     	fmaxnm	s3, s0, s2
 461ba8c: 1e38006a     	fcvtzs	w10, s3
 461ba90: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461ba94: 1e270163     	fmov	s3, w11
 461ba98: 1e232000     	fcmp	s0, s3
 461ba9c: 1a899149     	csel	w9, w10, w9, ls
 461baa0: 1e254020     	frintm	s0, s1
 461baa4: 1e222000     	fcmp	s0, s2
 461baa8: 1a88b3e8     	csel	w8, wzr, w8, lt
 461baac: 1e226801     	fmaxnm	s1, s0, s2
 461bab0: 1e38002a     	fcvtzs	w10, s1
 461bab4: 1e232000     	fcmp	s0, s3
 461bab8: 1a889148     	csel	w8, w10, w8, ls
 461babc: aa088128     	orr	x8, x9, x8, lsl #32
 461bac0: f90007e8     	str	x8, [sp, #0x8]
 461bac4: 910023e2     	add	x2, sp, #0x8
 461bac8: aa1403e0     	mov	x0, x20
 461bacc: aa1303e1     	mov	x1, x19
 461bad0: 9582fbe0     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 461bad4: f94007e0     	ldr	x0, [sp, #0x8]
 461bad8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461badc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461bae0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461bae4: 910103ff     	add	sp, sp, #0x40
 461bae8: d65f03c0     	ret
 461baec: d100c3ff     	sub	sp, sp, #0x30
 461baf0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 461baf4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 461baf8: 910083fd     	add	x29, sp, #0x20
 461bafc: aa0103f4     	mov	x20, x1
 461bb00: aa0003f3     	mov	x19, x0
 461bb04: f9400008     	ldr	x8, [x0]
 461bb08: f9403508     	ldr	x8, [x8, #0x68]
 461bb0c: d63f0100     	blr	x8
 461bb10: b4000440     	cbz	x0, 0x461bb98 <_ChromeMain+0x46168fc>
 461bb14: f9400268     	ldr	x8, [x19]
 461bb18: f9403508     	ldr	x8, [x8, #0x68]
 461bb1c: aa1303e0     	mov	x0, x19
 461bb20: d63f0100     	blr	x8
 461bb24: f940c808     	ldr	x8, [x0, #0x190]
 461bb28: b4000388     	cbz	x8, 0x461bb98 <_ChromeMain+0x46168fc>
 461bb2c: 2d520680     	ldp	s0, s1, [x20, #0x90]
 461bb30: 1e254000     	frintm	s0, s0
 461bb34: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461bb38: 1e222000     	fcmp	s0, s2
 461bb3c: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461bb40: 1a88b3e9     	csel	w9, wzr, w8, lt
 461bb44: 1e226803     	fmaxnm	s3, s0, s2
 461bb48: 1e38006a     	fcvtzs	w10, s3
 461bb4c: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461bb50: 1e270163     	fmov	s3, w11
 461bb54: 1e232000     	fcmp	s0, s3
 461bb58: 1a899149     	csel	w9, w10, w9, ls
 461bb5c: 1e254020     	frintm	s0, s1
 461bb60: 1e222000     	fcmp	s0, s2
 461bb64: 1a88b3e8     	csel	w8, wzr, w8, lt
 461bb68: 1e226801     	fmaxnm	s1, s0, s2
 461bb6c: 1e38002a     	fcvtzs	w10, s1
 461bb70: 1e232000     	fcmp	s0, s3
 461bb74: 1a889148     	csel	w8, w10, w8, ls
 461bb78: aa088128     	orr	x8, x9, x8, lsl #32
 461bb7c: f90007e8     	str	x8, [sp, #0x8]
 461bb80: f9400268     	ldr	x8, [x19]
 461bb84: f9403508     	ldr	x8, [x8, #0x68]
 461bb88: aa1303e0     	mov	x0, x19
 461bb8c: d63f0100     	blr	x8
 461bb90: f940c813     	ldr	x19, [x0, #0x190]
 461bb94: 14000016     	b	0x461bbec <_ChromeMain+0x4616950>
 461bb98: 2d510680     	ldp	s0, s1, [x20, #0x88]
 461bb9c: 1e254000     	frintm	s0, s0
 461bba0: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 461bba4: 1e222000     	fcmp	s0, s2
 461bba8: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 461bbac: 1a88b3e9     	csel	w9, wzr, w8, lt
 461bbb0: 1e226803     	fmaxnm	s3, s0, s2
 461bbb4: 1e38006a     	fcvtzs	w10, s3
 461bbb8: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 461bbbc: 1e270163     	fmov	s3, w11
 461bbc0: 1e232000     	fcmp	s0, s3
 461bbc4: 1a899149     	csel	w9, w10, w9, ls
 461bbc8: 1e254020     	frintm	s0, s1
 461bbcc: 1e222000     	fcmp	s0, s2
 461bbd0: 1a88b3e8     	csel	w8, wzr, w8, lt
 461bbd4: 1e226801     	fmaxnm	s1, s0, s2
 461bbd8: 1e38002a     	fcvtzs	w10, s1
 461bbdc: 1e232000     	fcmp	s0, s3
 461bbe0: 1a889148     	csel	w8, w10, w8, ls
 461bbe4: aa088128     	orr	x8, x9, x8, lsl #32
 461bbe8: f90007e8     	str	x8, [sp, #0x8]
 461bbec: 910023e1     	add	x1, sp, #0x8
 461bbf0: aa1303e0     	mov	x0, x19
 461bbf4: 97741f70     	bl	0x23239b4 <_ChromeMain+0x231e718>
 461bbf8: f94007e0     	ldr	x0, [sp, #0x8]
 461bbfc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461bc00: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 461bc04: 9100c3ff     	add	sp, sp, #0x30
 461bc08: d65f03c0     	ret
 461bc0c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 461bc10: a9017bfd     	stp	x29, x30, [sp, #0x10]
 461bc14: 910043fd     	add	x29, sp, #0x10
 461bc18: aa0003f3     	mov	x19, x0
 461bc1c: 39618008     	ldrb	w8, [x0, #0x860]
 461bc20: 6b01011f     	cmp	w8, w1
 461bc24: 1a9f07e9     	cset	w9, ne
 461bc28: 54000040     	b.eq	0x461bc30 <_ChromeMain+0x4616994>
 461bc2c: 39218261     	strb	w1, [x19, #0x860]
 461bc30: 39618668     	ldrb	w8, [x19, #0x861]
 461bc34: 6b04011f     	cmp	w8, w4
 461bc38: 54000060     	b.eq	0x461bc44 <_ChromeMain+0x46169a8>
 461bc3c: 39218664     	strb	w4, [x19, #0x861]
 461bc40: 52800029     	mov	w9, #0x1                ; =1
 461bc44: b9497268     	ldr	w8, [x19, #0x970]
 461bc48: b949766a     	ldr	w10, [x19, #0x974]
 461bc4c: 2940304b     	ldp	w11, w12, [x2]
 461bc50: 6b0b011f     	cmp	w8, w11
 461bc54: 7a4c0140     	ccmp	w10, w12, #0x0, eq
 461bc58: 54000080     	b.eq	0x461bc68 <_ChromeMain+0x46169cc>
 461bc5c: f9400048     	ldr	x8, [x2]
 461bc60: f904ba68     	str	x8, [x19, #0x970]
 461bc64: 52800029     	mov	w9, #0x1                ; =1
 461bc68: 9125e26a     	add	x10, x19, #0x978
 461bc6c: 39663e68     	ldrb	w8, [x19, #0x98f]
 461bc70: 13001d0c     	sxtb	w12, w8
 461bc74: f944c26b     	ldr	x11, [x19, #0x980]
 461bc78: 7100019f     	cmp	w12, #0x0
 461bc7c: 9a88416d     	csel	x13, x11, x8, mi
 461bc80: 39405c68     	ldrb	w8, [x3, #0x17]
 461bc84: 13001d0b     	sxtb	w11, w8
 461bc88: f9400462     	ldr	x2, [x3, #0x8]
 461bc8c: 7100017f     	cmp	w11, #0x0
 461bc90: 9a884048     	csel	x8, x2, x8, mi
 461bc94: eb0801bf     	cmp	x13, x8
 461bc98: 54000201     	b.ne	0x461bcd8 <_ChromeMain+0x4616a3c>
 461bc9c: b40001ad     	cbz	x13, 0x461bcd0 <_ChromeMain+0x4616a34>
 461bca0: f940006e     	ldr	x14, [x3]
 461bca4: 7100017f     	cmp	w11, #0x0
 461bca8: 9a8341ce     	csel	x14, x14, x3, mi
 461bcac: f940014f     	ldr	x15, [x10]
 461bcb0: 7100019f     	cmp	w12, #0x0
 461bcb4: 9a8a41ef     	csel	x15, x15, x10, mi
 461bcb8: 784025f0     	ldrh	w16, [x15], #0x2
 461bcbc: 784025d1     	ldrh	w17, [x14], #0x2
 461bcc0: 6b10023f     	cmp	w17, w16
 461bcc4: 540000a1     	b.ne	0x461bcd8 <_ChromeMain+0x4616a3c>
 461bcc8: f10005ad     	subs	x13, x13, #0x1
 461bccc: 54ffff61     	b.ne	0x461bcb8 <_ChromeMain+0x4616a1c>
 461bcd0: 35000149     	cbnz	w9, 0x461bcf8 <_ChromeMain+0x4616a5c>
 461bcd4: 1400001a     	b	0x461bd3c <_ChromeMain+0x4616aa0>
 461bcd8: eb03015f     	cmp	x10, x3
 461bcdc: 540000e0     	b.eq	0x461bcf8 <_ChromeMain+0x4616a5c>
 461bce0: 37f803cc     	tbnz	w12, #0x1f, 0x461bd58 <_ChromeMain+0x4616abc>
 461bce4: 37f8032b     	tbnz	w11, #0x1f, 0x461bd48 <_ChromeMain+0x4616aac>
 461bce8: 3dc00060     	ldr	q0, [x3]
 461bcec: f9400868     	ldr	x8, [x3, #0x10]
 461bcf0: f9000948     	str	x8, [x10, #0x10]
 461bcf4: 3d800140     	str	q0, [x10]
 461bcf8: f9436674     	ldr	x20, [x19, #0x6c8]
 461bcfc: b4000214     	cbz	x20, 0x461bd3c <_ChromeMain+0x4616aa0>
 461bd00: 52800028     	mov	w8, #0x1                ; =1
 461bd04: b8280288     	ldadd	w8, w8, [x20]
 461bd08: 7100011f     	cmp	w8, #0x0
 461bd0c: 540003ed     	b.le	0x461bd88 <_ChromeMain+0x4616aec>
 461bd10: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461bd14: 6b09011f     	cmp	w8, w9
 461bd18: 540003e0     	b.eq	0x461bd94 <_ChromeMain+0x4616af8>
 461bd1c: f9436668     	ldr	x8, [x19, #0x6c8]
 461bd20: f9400508     	ldr	x8, [x8, #0x8]
 461bd24: aa1403e0     	mov	x0, x20
 461bd28: d63f0100     	blr	x8
 461bd2c: 12800008     	mov	w8, #-0x1               ; =-1
 461bd30: b8e80288     	ldaddal	w8, w8, [x20]
 461bd34: 7100051f     	cmp	w8, #0x1
 461bd38: 540001e0     	b.eq	0x461bd74 <_ChromeMain+0x4616ad8>
 461bd3c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 461bd40: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 461bd44: d65f03c0     	ret
 461bd48: f9400061     	ldr	x1, [x3]
 461bd4c: 9125e260     	add	x0, x19, #0x978
 461bd50: 970aca67     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 461bd54: 17ffffe9     	b	0x461bcf8 <_ChromeMain+0x4616a5c>
 461bd58: f9400069     	ldr	x9, [x3]
 461bd5c: 7100017f     	cmp	w11, #0x0
 461bd60: 9a834121     	csel	x1, x9, x3, mi
 461bd64: 9125e260     	add	x0, x19, #0x978
 461bd68: aa0803e2     	mov	x2, x8
 461bd6c: 970acab2     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 461bd70: 17ffffe2     	b	0x461bcf8 <_ChromeMain+0x4616a5c>
 461bd74: f9400a81     	ldr	x1, [x20, #0x10]
 461bd78: aa1403e0     	mov	x0, x20
 461bd7c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 461bd80: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 461bd84: d61f0020     	br	x1
 461bd88: d4200000     	brk	#0
 461bd8c: d4400000     	hlt	#0
 461bd90: d4200020     	brk	#0x1
 461bd94: d4200000     	brk	#0
 461bd98: d4400000     	hlt	#0
 461bd9c: d4200020     	brk	#0x1
 461bda0: d10103ff     	sub	sp, sp, #0x40
 461bda4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461bda8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461bdac: 9100c3fd     	add	x29, sp, #0x30
 461bdb0: aa0003f4     	mov	x20, x0
 461bdb4: aa0803f3     	mov	x19, x8
 461bdb8: a9007fff     	stp	xzr, xzr, [sp]
 461bdbc: f9000bff     	str	xzr, [sp, #0x10]
 461bdc0: 39c07c08     	ldrsb	w8, [x0, #0x1f]
 461bdc4: 37f80248     	tbnz	w8, #0x1f, 0x461be0c <_ChromeMain+0x4616b70>
 461bdc8: 3cc08280     	ldur	q0, [x20, #0x8]
 461bdcc: 3d8003e0     	str	q0, [sp]
 461bdd0: f8418288     	ldur	x8, [x20, #0x18]
 461bdd4: f9000be8     	str	x8, [sp, #0x10]
 461bdd8: 39405fe8     	ldrb	w8, [sp, #0x17]
 461bddc: f94007e9     	ldr	x9, [sp, #0x8]
 461bde0: 7219011f     	tst	w8, #0x80
 461bde4: 9a881128     	csel	x8, x9, x8, ne
 461bde8: b40001a8     	cbz	x8, 0x461be1c <_ChromeMain+0x4616b80>
 461bdec: 3dc003e0     	ldr	q0, [sp]
 461bdf0: 3d800260     	str	q0, [x19]
 461bdf4: f9400be8     	ldr	x8, [sp, #0x10]
 461bdf8: f9000a68     	str	x8, [x19, #0x10]
 461bdfc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461be00: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461be04: 910103ff     	add	sp, sp, #0x40
 461be08: d65f03c0     	ret
 461be0c: a9408a81     	ldp	x1, x2, [x20, #0x8]
 461be10: 910003e0     	mov	x0, sp
 461be14: 96e8ab6f     	bl	0x46bd0 <_ChromeMain+0x41934>
 461be18: 17fffff0     	b	0x461bdd8 <_ChromeMain+0x4616b3c>
 461be1c: b940fa88     	ldr	w8, [x20, #0xf8]
 461be20: 34000148     	cbz	w8, 0x461be48 <_ChromeMain+0x4616bac>
 461be24: a9007e7f     	stp	xzr, xzr, [x19]
 461be28: f9000a7f     	str	xzr, [x19, #0x10]
 461be2c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 461be30: 36fffe68     	tbz	w8, #0x1f, 0x461bdfc <_ChromeMain+0x4616b60>
 461be34: f94003e0     	ldr	x0, [sp]
 461be38: f9400be8     	ldr	x8, [sp, #0x10]
 461be3c: d37ff901     	lsl	x1, x8, #1
 461be40: 96e7b41e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461be44: 17ffffee     	b	0x461bdfc <_ChromeMain+0x4616b60>
 461be48: 91020280     	add	x0, x20, #0x80
 461be4c: b940be88     	ldr	w8, [x20, #0xbc]
 461be50: 7100051f     	cmp	w8, #0x1
 461be54: 5400014b     	b.lt	0x461be7c <_ChromeMain+0x4616be0>
 461be58: 39425e8a     	ldrb	w10, [x20, #0x97]
 461be5c: 13001d49     	sxtb	w9, w10
 461be60: f940468b     	ldr	x11, [x20, #0x88]
 461be64: 7100013f     	cmp	w9, #0x0
 461be68: 9a8a416b     	csel	x11, x11, x10, mi
 461be6c: b980ba8a     	ldrsw	x10, [x20, #0xb8]
 461be70: eb0a016b     	subs	x11, x11, x10
 461be74: 54000263     	b.lo	0x461bec0 <_ChromeMain+0x4616c24>
 461be78: 54000161     	b.ne	0x461bea4 <_ChromeMain+0x4616c08>
 461be7c: 97014303     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 461be80: 39805c08     	ldrsb	x8, [x0, #0x17]
 461be84: a9402809     	ldp	x9, x10, [x0]
 461be88: f100011f     	cmp	x8, #0x0
 461be8c: 9a804120     	csel	x0, x9, x0, mi
 461be90: 7100011f     	cmp	w8, #0x0
 461be94: 9a884141     	csel	x1, x10, x8, mi
 461be98: aa1303e8     	mov	x8, x19
 461be9c: 970b191d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 461bea0: 17ffffe3     	b	0x461be2c <_ChromeMain+0x4616b90>
 461bea4: eb08017f     	cmp	x11, x8
 461bea8: 9a883161     	csel	x1, x11, x8, lo
 461beac: f9400008     	ldr	x8, [x0]
 461beb0: 7100013f     	cmp	w9, #0x0
 461beb4: 9a804108     	csel	x8, x8, x0, mi
 461beb8: 8b0a0100     	add	x0, x8, x10
 461bebc: 17fffff7     	b	0x461be98 <_ChromeMain+0x4616bfc>
 461bec0: b0048e40     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 461bec4: 91376000     	add	x0, x0, #0xdd8
 461bec8: 94179103     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 461becc: d10343ff     	sub	sp, sp, #0xd0
 461bed0: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 461bed4: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 461bed8: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 461bedc: 910303fd     	add	x29, sp, #0xc0
 461bee0: b940f828     	ldr	w8, [x1, #0xf8]
 461bee4: 340000c8     	cbz	w8, 0x461befc <_ChromeMain+0x4616c60>
 461bee8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 461beec: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 461bef0: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 461bef4: 910343ff     	add	sp, sp, #0xd0
 461bef8: d65f03c0     	ret
 461befc: aa0103f4     	mov	x20, x1
 461bf00: 39426028     	ldrb	w8, [x1, #0x98]
 461bf04: 34ffff28     	cbz	w8, 0x461bee8 <_ChromeMain+0x4616c4c>
 461bf08: aa0003f3     	mov	x19, x0
 461bf0c: 6f00e400     	movi.2d	v0, #0000000000000000
 461bf10: ad0183e0     	stp	q0, q0, [sp, #0x30]
 461bf14: 91020296     	add	x22, x20, #0x80
 461bf18: 910023f5     	add	x21, sp, #0x8
 461bf1c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461bf20: f9003bff     	str	xzr, [sp, #0x70]
 461bf24: ad0083e0     	stp	q0, q0, [sp, #0x10]
 461bf28: 12800008     	mov	w8, #-0x1               ; =-1
 461bf2c: b90037e8     	str	w8, [sp, #0x34]
 461bf30: b9003fe8     	str	w8, [sp, #0x3c]
 461bf34: b90047e8     	str	w8, [sp, #0x44]
 461bf38: b9004fe8     	str	w8, [sp, #0x4c]
 461bf3c: b90057e8     	str	w8, [sp, #0x54]
 461bf40: b9005fe8     	str	w8, [sp, #0x5c]
 461bf44: b90067e8     	str	w8, [sp, #0x64]
 461bf48: b9006fe8     	str	w8, [sp, #0x6c]
 461bf4c: 3901c7ff     	strb	wzr, [sp, #0x71]
 461bf50: 3c8783e0     	stur	q0, [sp, #0x78]
 461bf54: 3c8883e0     	stur	q0, [sp, #0x88]
 461bf58: f9004fff     	str	xzr, [sp, #0x98]
 461bf5c: f9403288     	ldr	x8, [x20, #0x60]
 461bf60: f90007e8     	str	x8, [sp, #0x8]
 461bf64: 910022a0     	add	x0, x21, #0x8
 461bf68: 91020281     	add	x1, x20, #0x80
 461bf6c: 96fabe68     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 461bf70: b940be88     	ldr	w8, [x20, #0xbc]
 461bf74: 7100051f     	cmp	w8, #0x1
 461bf78: 5400026b     	b.lt	0x461bfc4 <_ChromeMain+0x4616d28>
 461bf7c: 39425e89     	ldrb	w9, [x20, #0x97]
 461bf80: 13001d2b     	sxtb	w11, w9
 461bf84: f940468a     	ldr	x10, [x20, #0x88]
 461bf88: 7100017f     	cmp	w11, #0x0
 461bf8c: 9a894149     	csel	x9, x10, x9, mi
 461bf90: b980ba8a     	ldrsw	x10, [x20, #0xb8]
 461bf94: eb0a012c     	subs	x12, x9, x10
 461bf98: 540008a3     	b.lo	0x461c0ac <_ChromeMain+0x4616e10>
 461bf9c: f94002cd     	ldr	x13, [x22]
 461bfa0: 7100017f     	cmp	w11, #0x0
 461bfa4: 9a9641ab     	csel	x11, x13, x22, mi
 461bfa8: eb08019f     	cmp	x12, x8
 461bfac: 9a883182     	csel	x2, x12, x8, lo
 461bfb0: 8b0a0161     	add	x1, x11, x10
 461bfb4: eb0a013f     	cmp	x9, x10
 461bfb8: 540000a0     	b.eq	0x461bfcc <_ChromeMain+0x4616d30>
 461bfbc: b5000081     	cbnz	x1, 0x461bfcc <_ChromeMain+0x4616d30>
 461bfc0: 14000036     	b	0x461c098 <_ChromeMain+0x4616dfc>
 461bfc4: d2800001     	mov	x1, #0x0                ; =0
 461bfc8: d2800002     	mov	x2, #0x0                ; =0
 461bfcc: 910202a0     	add	x0, x21, #0x80
 461bfd0: 96faed3c     	bl	0x4d74c0 <_ChromeMain+0x4d2224>
 461bfd4: f9444668     	ldr	x8, [x19, #0x888]
 461bfd8: f9444a69     	ldr	x9, [x19, #0x890]
 461bfdc: eb09011f     	cmp	x8, x9
 461bfe0: 540005e0     	b.eq	0x461c09c <_ChromeMain+0x4616e00>
 461bfe4: f9444269     	ldr	x9, [x19, #0x880]
 461bfe8: 5280130a     	mov	w10, #0x98              ; =152
 461bfec: 9b0a2514     	madd	x20, x8, x10, x9
 461bff0: b4000554     	cbz	x20, 0x461c098 <_ChromeMain+0x4616dfc>
 461bff4: f94007e8     	ldr	x8, [sp, #0x8]
 461bff8: f9000288     	str	x8, [x20]
 461bffc: 91002280     	add	x0, x20, #0x8
 461c000: 910022a1     	add	x1, x21, #0x8
 461c004: 96eefb90     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 461c008: 3cc802a0     	ldur	q0, [x21, #0x80]
 461c00c: f84902a8     	ldur	x8, [x21, #0x90]
 461c010: f9004a88     	str	x8, [x20, #0x90]
 461c014: 3d802280     	str	q0, [x20, #0x80]
 461c018: a9087ebf     	stp	xzr, xzr, [x21, #0x80]
 461c01c: f80902bf     	stur	xzr, [x21, #0x90]
 461c020: 91026280     	add	x0, x20, #0x98
 461c024: f9444268     	ldr	x8, [x19, #0x880]
 461c028: eb080008     	subs	x8, x0, x8
 461c02c: 9343fd08     	asr	x8, x8, #3
 461c030: d2994369     	mov	x9, #0xca1b             ; =51739
 461c034: f2a50d69     	movk	x9, #0x286b, lsl #16
 461c038: f2d435e9     	movk	x9, #0xa1af, lsl #32
 461c03c: f2f0d789     	movk	x9, #0x86bc, lsl #48
 461c040: 9b097d08     	mul	x8, x8, x9
 461c044: f9044668     	str	x8, [x19, #0x888]
 461c048: 54000280     	b.eq	0x461c098 <_ChromeMain+0x4616dfc>
 461c04c: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 461c050: 36f800a8     	tbz	w8, #0x1f, 0x461c064 <_ChromeMain+0x4616dc8>
 461c054: f94047e0     	ldr	x0, [sp, #0x88]
 461c058: f9404fe8     	ldr	x8, [sp, #0x98]
 461c05c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461c060: 96e7b396     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c064: 910023e8     	add	x8, sp, #0x8
 461c068: 9101e100     	add	x0, x8, #0x78
 461c06c: d2800001     	mov	x1, #0x0                ; =0
 461c070: 96e82f12     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461c074: 9100a2a0     	add	x0, x21, #0x28
 461c078: 96e82f00     	bl	0x27c78 <_ChromeMain+0x229dc>
 461c07c: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 461c080: 36fff348     	tbz	w8, #0x1f, 0x461bee8 <_ChromeMain+0x4616c4c>
 461c084: f9400be0     	ldr	x0, [sp, #0x10]
 461c088: f94013e8     	ldr	x8, [sp, #0x20]
 461c08c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461c090: 96e7b38a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c094: 17ffff95     	b	0x461bee8 <_ChromeMain+0x4616c4c>
 461c098: d4200020     	brk	#0x1
 461c09c: 91220260     	add	x0, x19, #0x880
 461c0a0: 910023e1     	add	x1, sp, #0x8
 461c0a4: 94002415     	bl	0x46250f8 <_ChromeMain+0x461fe5c>
 461c0a8: 17ffffdf     	b	0x461c024 <_ChromeMain+0x4616d88>
 461c0ac: 90048e40     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 461c0b0: 91376000     	add	x0, x0, #0xdd8
 461c0b4: 94179088     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
