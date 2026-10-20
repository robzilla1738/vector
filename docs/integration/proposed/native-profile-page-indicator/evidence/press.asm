Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467be84: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 467be88: a9017bfd     	stp	x29, x30, [sp, #0x10]
 467be8c: 910043fd     	add	x29, sp, #0x10
 467be90: aa0103e2     	mov	x2, x1
 467be94: aa0003f3     	mov	x19, x0
 467be98: b9405028     	ldr	w8, [x1, #0x50]
 467be9c: 12151108     	and	w8, w8, #0xf800
 467bea0: 7120011f     	cmp	w8, #0x800
 467bea4: 54000120     	b.eq	0x467bec8 <_ChromeMain+0x4676c2c>
 467bea8: 7140091f     	cmp	w8, #0x2, lsl #12       ; =0x2000
 467beac: 54000061     	b.ne	0x467beb8 <_ChromeMain+0x4676c1c>
 467beb0: f9426268     	ldr	x8, [x19, #0x4c0]
 467beb4: b5000688     	cbnz	x8, 0x467bf84 <_ChromeMain+0x4676ce8>
 467beb8: 52800000     	mov	w0, #0x0                ; =0
 467bebc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467bec0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467bec4: d65f03c0     	ret
 467bec8: 52800028     	mov	w8, #0x1                ; =1
 467becc: 3913c268     	strb	w8, [x19, #0x4f0]
 467bed0: 2d510440     	ldp	s0, s1, [x2, #0x88]
 467bed4: 1e254000     	frintm	s0, s0
 467bed8: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 467bedc: 1e222000     	fcmp	s0, s2
 467bee0: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 467bee4: 1e226803     	fmaxnm	s3, s0, s2
 467bee8: 1e380069     	fcvtzs	w9, s3
 467beec: 1a88b3ea     	csel	w10, wzr, w8, lt
 467bef0: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 467bef4: 1e270163     	fmov	s3, w11
 467bef8: 1e232000     	fcmp	s0, s3
 467befc: 1a8a9129     	csel	w9, w9, w10, ls
 467bf00: 1e254020     	frintm	s0, s1
 467bf04: 1e222000     	fcmp	s0, s2
 467bf08: 1a88b3ea     	csel	w10, wzr, w8, lt
 467bf0c: 1e226801     	fmaxnm	s1, s0, s2
 467bf10: 1e38002b     	fcvtzs	w11, s1
 467bf14: 1e232000     	fcmp	s0, s3
 467bf18: 1a8a916a     	csel	w10, w11, w10, ls
 467bf1c: aa0a8129     	orr	x9, x9, x10, lsl #32
 467bf20: f9027269     	str	x9, [x19, #0x4e0]
 467bf24: 2d510440     	ldp	s0, s1, [x2, #0x88]
 467bf28: 1e254000     	frintm	s0, s0
 467bf2c: 1e226804     	fmaxnm	s4, s0, s2
 467bf30: 1e380089     	fcvtzs	w9, s4
 467bf34: 1e222000     	fcmp	s0, s2
 467bf38: 1a88b3ea     	csel	w10, wzr, w8, lt
 467bf3c: 1e232000     	fcmp	s0, s3
 467bf40: 1a8a9129     	csel	w9, w9, w10, ls
 467bf44: 1e254020     	frintm	s0, s1
 467bf48: 1e222000     	fcmp	s0, s2
 467bf4c: 1e226801     	fmaxnm	s1, s0, s2
 467bf50: 1e38002a     	fcvtzs	w10, s1
 467bf54: 1a88b3e8     	csel	w8, wzr, w8, lt
 467bf58: 1e232000     	fcmp	s0, s3
 467bf5c: 1a889148     	csel	w8, w10, w8, ls
 467bf60: aa088128     	orr	x8, x9, x8, lsl #32
 467bf64: f9027668     	str	x8, [x19, #0x4e8]
 467bf68: f940c661     	ldr	x1, [x19, #0x188]
 467bf6c: b5000141     	cbnz	x1, 0x467bf94 <_ChromeMain+0x4676cf8>
 467bf70: aa1303e0     	mov	x0, x19
 467bf74: 52800041     	mov	w1, #0x2                ; =2
 467bf78: 97493ca8     	bl	0x18cb218 <_ChromeMain+0x18c5f7c>
 467bf7c: 52800020     	mov	w0, #0x1                ; =1
 467bf80: 17ffffcf     	b	0x467bebc <_ChromeMain+0x4676c20>
 467bf84: 91130260     	add	x0, x19, #0x4c0
 467bf88: aa1303e1     	mov	x1, x19
 467bf8c: 9718f87d     	bl	0xcba180 <_ChromeMain+0xcb4ee4>
 467bf90: 17fffffb     	b	0x467bf7c <_ChromeMain+0x4676ce0>
 467bf94: 91138262     	add	x2, x19, #0x4e0
 467bf98: aa1303e0     	mov	x0, x19
 467bf9c: 95817aad     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 467bfa0: 17fffff4     	b	0x467bf70 <_ChromeMain+0x4676cd4>
