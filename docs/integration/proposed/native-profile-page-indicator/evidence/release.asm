Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467c164: d10103ff     	sub	sp, sp, #0x40
 467c168: a90157f6     	stp	x22, x21, [sp, #0x10]
 467c16c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 467c170: a9037bfd     	stp	x29, x30, [sp, #0x30]
 467c174: 9100c3fd     	add	x29, sp, #0x30
 467c178: 3953c008     	ldrb	w8, [x0, #0x4f0]
 467c17c: 34000348     	cbz	w8, 0x467c1e4 <_ChromeMain+0x4676f48>
 467c180: aa0003f3     	mov	x19, x0
 467c184: 3953c408     	ldrb	w8, [x0, #0x4f1]
 467c188: 6f00e400     	movi.2d	v0, #0000000000000000
 467c18c: 3d813800     	str	q0, [x0, #0x4e0]
 467c190: 7909e01f     	strh	wzr, [x0, #0x4f0]
 467c194: 34000408     	cbz	w8, 0x467c214 <_ChromeMain+0x4676f78>
 467c198: f9426e74     	ldr	x20, [x19, #0x4d8]
 467c19c: b4000254     	cbz	x20, 0x467c1e4 <_ChromeMain+0x4676f48>
 467c1a0: 52800028     	mov	w8, #0x1                ; =1
 467c1a4: b8280288     	ldadd	w8, w8, [x20]
 467c1a8: 7100011f     	cmp	w8, #0x0
 467c1ac: 54000b6d     	b.le	0x467c318 <_ChromeMain+0x467707c>
 467c1b0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 467c1b4: 6b09011f     	cmp	w8, w9
 467c1b8: 54000b60     	b.eq	0x467c324 <_ChromeMain+0x4677088>
 467c1bc: f9426e68     	ldr	x8, [x19, #0x4d8]
 467c1c0: f9400508     	ldr	x8, [x8, #0x8]
 467c1c4: aa1403e0     	mov	x0, x20
 467c1c8: aa1303e1     	mov	x1, x19
 467c1cc: 52800002     	mov	w2, #0x0                ; =0
 467c1d0: d63f0100     	blr	x8
 467c1d4: 12800008     	mov	w8, #-0x1               ; =-1
 467c1d8: b8e80288     	ldaddal	w8, w8, [x20]
 467c1dc: 7100051f     	cmp	w8, #0x1
 467c1e0: 540000c0     	b.eq	0x467c1f8 <_ChromeMain+0x4676f5c>
 467c1e4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 467c1e8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 467c1ec: a94157f6     	ldp	x22, x21, [sp, #0x10]
 467c1f0: 910103ff     	add	sp, sp, #0x40
 467c1f4: d65f03c0     	ret
 467c1f8: f9400a81     	ldr	x1, [x20, #0x10]
 467c1fc: aa1403e0     	mov	x0, x20
 467c200: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 467c204: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 467c208: a94157f6     	ldp	x22, x21, [sp, #0x10]
 467c20c: 910103ff     	add	sp, sp, #0x40
 467c210: d61f0020     	br	x1
 467c214: aa0103f4     	mov	x20, x1
 467c218: 2d510420     	ldp	s0, s1, [x1, #0x88]
 467c21c: 1e254000     	frintm	s0, s0
 467c220: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 467c224: 1e222000     	fcmp	s0, s2
 467c228: 12b00015     	mov	w21, #0x7fffffff        ; =2147483647
 467c22c: 1a95b3e8     	csel	w8, wzr, w21, lt
 467c230: 1e226803     	fmaxnm	s3, s0, s2
 467c234: 1e380069     	fcvtzs	w9, s3
 467c238: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 467c23c: 1e270143     	fmov	s3, w10
 467c240: 1e232000     	fcmp	s0, s3
 467c244: 1a889128     	csel	w8, w9, w8, ls
 467c248: 1e254020     	frintm	s0, s1
 467c24c: 1e222000     	fcmp	s0, s2
 467c250: 1a95b3e9     	csel	w9, wzr, w21, lt
 467c254: 1e226801     	fmaxnm	s1, s0, s2
 467c258: 1e38002a     	fcvtzs	w10, s1
 467c25c: 1e232000     	fcmp	s0, s3
 467c260: 1a899149     	csel	w9, w10, w9, ls
 467c264: aa098108     	orr	x8, x8, x9, lsl #32
 467c268: f90007e8     	str	x8, [sp, #0x8]
 467c26c: 910023e1     	add	x1, sp, #0x8
 467c270: aa1303e0     	mov	x0, x19
 467c274: 95817ade     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 467c278: aa0003e1     	mov	x1, x0
 467c27c: aa1303e0     	mov	x0, x19
 467c280: 97493be6     	bl	0x18cb218 <_ChromeMain+0x18c5f7c>
 467c284: b9405288     	ldr	w8, [x20, #0x50]
 467c288: 12151108     	and	w8, w8, #0xf800
 467c28c: 7120011f     	cmp	w8, #0x800
 467c290: 54fffaa1     	b.ne	0x467c1e4 <_ChromeMain+0x4676f48>
 467c294: 2d510680     	ldp	s0, s1, [x20, #0x88]
 467c298: 1e254000     	frintm	s0, s0
 467c29c: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 467c2a0: 1e222000     	fcmp	s0, s2
 467c2a4: 1a95b3e8     	csel	w8, wzr, w21, lt
 467c2a8: 1e226803     	fmaxnm	s3, s0, s2
 467c2ac: 1e380069     	fcvtzs	w9, s3
 467c2b0: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 467c2b4: 1e270143     	fmov	s3, w10
 467c2b8: 1e232000     	fcmp	s0, s3
 467c2bc: 1a889128     	csel	w8, w9, w8, ls
 467c2c0: 1e254020     	frintm	s0, s1
 467c2c4: 1e222000     	fcmp	s0, s2
 467c2c8: 1a95b3e9     	csel	w9, wzr, w21, lt
 467c2cc: 1e226801     	fmaxnm	s1, s0, s2
 467c2d0: 1e38002a     	fcvtzs	w10, s1
 467c2d4: 1e232000     	fcmp	s0, s3
 467c2d8: 1a899149     	csel	w9, w10, w9, ls
 467c2dc: aa098108     	orr	x8, x8, x9, lsl #32
 467c2e0: f90007e8     	str	x8, [sp, #0x8]
 467c2e4: 910023e1     	add	x1, sp, #0x8
 467c2e8: aa1303e0     	mov	x0, x19
 467c2ec: 95817ac0     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 467c2f0: 34fff7a0     	cbz	w0, 0x467c1e4 <_ChromeMain+0x4676f48>
 467c2f4: f9400268     	ldr	x8, [x19]
 467c2f8: f9420102     	ldr	x2, [x8, #0x400]
 467c2fc: aa1303e0     	mov	x0, x19
 467c300: aa1403e1     	mov	x1, x20
 467c304: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 467c308: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 467c30c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 467c310: 910103ff     	add	sp, sp, #0x40
 467c314: d61f0040     	br	x2
 467c318: d4200000     	brk	#0
 467c31c: d4400000     	hlt	#0
 467c320: d4200020     	brk	#0x1
 467c324: d4200000     	brk	#0
 467c328: d4400000     	hlt	#0
 467c32c: d4200020     	brk	#0x1
