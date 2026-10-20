Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467c330: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 467c334: a9017bfd     	stp	x29, x30, [sp, #0x10]
 467c338: 910043fd     	add	x29, sp, #0x10
 467c33c: aa0003f3     	mov	x19, x0
 467c340: 3953c414     	ldrb	w20, [x0, #0x4f1]
 467c344: 6f00e400     	movi.2d	v0, #0000000000000000
 467c348: 3d813800     	str	q0, [x0, #0x4e0]
 467c34c: 7909e01f     	strh	wzr, [x0, #0x4f0]
 467c350: 52800001     	mov	w1, #0x0                ; =0
 467c354: 97493bb1     	bl	0x18cb218 <_ChromeMain+0x18c5f7c>
 467c358: 34000394     	cbz	w20, 0x467c3c8 <_ChromeMain+0x467712c>
 467c35c: f9426e74     	ldr	x20, [x19, #0x4d8]
 467c360: b4000354     	cbz	x20, 0x467c3c8 <_ChromeMain+0x467712c>
 467c364: 52800028     	mov	w8, #0x1                ; =1
 467c368: b8280288     	ldadd	w8, w8, [x20]
 467c36c: 7100011f     	cmp	w8, #0x0
 467c370: 5400034d     	b.le	0x467c3d8 <_ChromeMain+0x467713c>
 467c374: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 467c378: 6b09011f     	cmp	w8, w9
 467c37c: 54000340     	b.eq	0x467c3e4 <_ChromeMain+0x4677148>
 467c380: f9426e68     	ldr	x8, [x19, #0x4d8]
 467c384: f9400508     	ldr	x8, [x8, #0x8]
 467c388: aa1403e0     	mov	x0, x20
 467c38c: aa1303e1     	mov	x1, x19
 467c390: 52800022     	mov	w2, #0x1                ; =1
 467c394: d63f0100     	blr	x8
 467c398: 12800008     	mov	w8, #-0x1               ; =-1
 467c39c: b8e80288     	ldaddal	w8, w8, [x20]
 467c3a0: 7100051f     	cmp	w8, #0x1
 467c3a4: 54000080     	b.eq	0x467c3b4 <_ChromeMain+0x4677118>
 467c3a8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467c3ac: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467c3b0: d65f03c0     	ret
 467c3b4: f9400a81     	ldr	x1, [x20, #0x10]
 467c3b8: aa1403e0     	mov	x0, x20
 467c3bc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467c3c0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467c3c4: d61f0020     	br	x1
 467c3c8: aa1303e0     	mov	x0, x19
 467c3cc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 467c3d0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 467c3d4: 157fe7a8     	b	0xa676274 <_ChromeMain+0xa670fd8>
 467c3d8: d4200000     	brk	#0
 467c3dc: d4400000     	hlt	#0
 467c3e0: d4200020     	brk	#0x1
 467c3e4: d4200000     	brk	#0
 467c3e8: d4400000     	hlt	#0
 467c3ec: d4200020     	brk	#0x1
 467c3f0: d503201f     	nop
 467c3f4: d503201f     	nop
		...
