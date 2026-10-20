Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467bfa4: d100c3ff     	sub	sp, sp, #0x30
 467bfa8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 467bfac: a9027bfd     	stp	x29, x30, [sp, #0x20]
 467bfb0: 910083fd     	add	x29, sp, #0x20
 467bfb4: 3953c009     	ldrb	w9, [x0, #0x4f0]
 467bfb8: 34000129     	cbz	w9, 0x467bfdc <_ChromeMain+0x4676d40>
 467bfbc: aa0103e8     	mov	x8, x1
 467bfc0: b9405029     	ldr	w9, [x1, #0x50]
 467bfc4: 12151129     	and	w9, w9, #0xf800
 467bfc8: 7120013f     	cmp	w9, #0x800
 467bfcc: 54000081     	b.ne	0x467bfdc <_ChromeMain+0x4676d40>
 467bfd0: aa0003f3     	mov	x19, x0
 467bfd4: f940c401     	ldr	x1, [x0, #0x188]
 467bfd8: b50000c1     	cbnz	x1, 0x467bff0 <_ChromeMain+0x4676d54>
 467bfdc: 52800000     	mov	w0, #0x0                ; =0
 467bfe0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 467bfe4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 467bfe8: 9100c3ff     	add	sp, sp, #0x30
 467bfec: d65f03c0     	ret
 467bff0: 2d510500     	ldp	s0, s1, [x8, #0x88]
 467bff4: 1e254000     	frintm	s0, s0
 467bff8: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 467bffc: 1e222000     	fcmp	s0, s2
 467c000: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 467c004: 1a88b3e9     	csel	w9, wzr, w8, lt
 467c008: 1e226803     	fmaxnm	s3, s0, s2
 467c00c: 1e38006a     	fcvtzs	w10, s3
 467c010: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 467c014: 1e270163     	fmov	s3, w11
 467c018: 1e232000     	fcmp	s0, s3
 467c01c: 1a899149     	csel	w9, w10, w9, ls
 467c020: 1e254020     	frintm	s0, s1
 467c024: 1e222000     	fcmp	s0, s2
 467c028: 1a88b3e8     	csel	w8, wzr, w8, lt
 467c02c: 1e226801     	fmaxnm	s1, s0, s2
 467c030: 1e38002a     	fcvtzs	w10, s1
 467c034: 1e232000     	fcmp	s0, s3
 467c038: 1a889148     	csel	w8, w10, w8, ls
 467c03c: aa088128     	orr	x8, x9, x8, lsl #32
 467c040: f90007e8     	str	x8, [sp, #0x8]
 467c044: 910023e2     	add	x2, sp, #0x8
 467c048: aa1303e0     	mov	x0, x19
 467c04c: 95817a81     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 467c050: 3953c668     	ldrb	w8, [x19, #0x4f1]
 467c054: 370003e8     	tbnz	w8, #0x0, 0x467c0d0 <_ChromeMain+0x4676e34>
 467c058: fd4007e0     	ldr	d0, [sp, #0x8]
 467c05c: fd427261     	ldr	d1, [x19, #0x4e0]
 467c060: 0ea12c00     	sqsub.2s	v0, v0, v1
 467c064: 0ea0b800     	abs.2s	v0, v0
 467c068: 0f000501     	movi.2s	v1, #0x8
 467c06c: 0ea13400     	cmgt.2s	v0, v0, v1
 467c070: 9e660008     	fmov	x8, d0
 467c074: b4fffb48     	cbz	x8, 0x467bfdc <_ChromeMain+0x4676d40>
 467c078: 52800028     	mov	w8, #0x1                ; =1
 467c07c: 3913c668     	strb	w8, [x19, #0x4f1]
 467c080: f9426674     	ldr	x20, [x19, #0x4c8]
 467c084: b4000274     	cbz	x20, 0x467c0d0 <_ChromeMain+0x4676e34>
 467c088: b8280288     	ldadd	w8, w8, [x20]
 467c08c: 7100011f     	cmp	w8, #0x0
 467c090: 540005ed     	b.le	0x467c14c <_ChromeMain+0x4676eb0>
 467c094: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 467c098: 6b09011f     	cmp	w8, w9
 467c09c: 540005e0     	b.eq	0x467c158 <_ChromeMain+0x4676ebc>
 467c0a0: f9426668     	ldr	x8, [x19, #0x4c8]
 467c0a4: f9400508     	ldr	x8, [x8, #0x8]
 467c0a8: aa1403e0     	mov	x0, x20
 467c0ac: aa1303e1     	mov	x1, x19
 467c0b0: d63f0100     	blr	x8
 467c0b4: 12800008     	mov	w8, #-0x1               ; =-1
 467c0b8: b8e80288     	ldaddal	w8, w8, [x20]
 467c0bc: 7100051f     	cmp	w8, #0x1
 467c0c0: 54000081     	b.ne	0x467c0d0 <_ChromeMain+0x4676e34>
 467c0c4: f9400a88     	ldr	x8, [x20, #0x10]
 467c0c8: aa1403e0     	mov	x0, x20
 467c0cc: d63f0100     	blr	x8
 467c0d0: f9426a74     	ldr	x20, [x19, #0x4d0]
 467c0d4: 52800020     	mov	w0, #0x1                ; =1
 467c0d8: b4fff854     	cbz	x20, 0x467bfe0 <_ChromeMain+0x4676d44>
 467c0dc: b8200288     	ldadd	w0, w8, [x20]
 467c0e0: 7100011f     	cmp	w8, #0x0
 467c0e4: 5400028d     	b.le	0x467c134 <_ChromeMain+0x4676e98>
 467c0e8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 467c0ec: 6b09011f     	cmp	w8, w9
 467c0f0: 54000280     	b.eq	0x467c140 <_ChromeMain+0x4676ea4>
 467c0f4: f9426a68     	ldr	x8, [x19, #0x4d0]
 467c0f8: f9400508     	ldr	x8, [x8, #0x8]
 467c0fc: 910023e2     	add	x2, sp, #0x8
 467c100: 9113a263     	add	x3, x19, #0x4e8
 467c104: aa1403e0     	mov	x0, x20
 467c108: aa1303e1     	mov	x1, x19
 467c10c: d63f0100     	blr	x8
 467c110: 12800008     	mov	w8, #-0x1               ; =-1
 467c114: b8e80288     	ldaddal	w8, w8, [x20]
 467c118: 7100051f     	cmp	w8, #0x1
 467c11c: 54000081     	b.ne	0x467c12c <_ChromeMain+0x4676e90>
 467c120: f9400a88     	ldr	x8, [x20, #0x10]
 467c124: aa1403e0     	mov	x0, x20
 467c128: d63f0100     	blr	x8
 467c12c: 52800020     	mov	w0, #0x1                ; =1
 467c130: 17ffffac     	b	0x467bfe0 <_ChromeMain+0x4676d44>
 467c134: d4200000     	brk	#0
 467c138: d4400000     	hlt	#0
 467c13c: d4200020     	brk	#0x1
 467c140: d4200000     	brk	#0
 467c144: d4400000     	hlt	#0
 467c148: d4200020     	brk	#0x1
 467c14c: d4200000     	brk	#0
 467c150: d4400000     	hlt	#0
 467c154: d4200020     	brk	#0x1
 467c158: d4200000     	brk	#0
 467c15c: d4400000     	hlt	#0
 467c160: d4200020     	brk	#0x1
