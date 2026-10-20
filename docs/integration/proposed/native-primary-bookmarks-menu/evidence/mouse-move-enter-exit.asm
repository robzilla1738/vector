
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457b49c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 457b4a0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 457b4a4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 457b4a8: 910083fd     	add	x29, sp, #0x20
 457b4ac: aa0003f3     	mov	x19, x0
 457b4b0: f9424000     	ldr	x0, [x0, #0x480]
 457b4b4: f9400008     	ldr	x8, [x0]
 457b4b8: f9401108     	ldr	x8, [x8, #0x20]
 457b4bc: d63f0100     	blr	x8
 457b4c0: 39472668     	ldrb	w8, [x19, #0x1c9]
 457b4c4: 370001c8     	tbnz	w8, #0x0, 0x457b4fc <_ChromeMain+0x4576260>
 457b4c8: 3912e67f     	strb	wzr, [x19, #0x4b9]
 457b4cc: aa1303e0     	mov	x0, x19
 457b4d0: 97ffff0a     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 457b4d4: f9425a74     	ldr	x20, [x19, #0x4b0]
 457b4d8: b40003d4     	cbz	x20, 0x457b550 <_ChromeMain+0x45762b4>
 457b4dc: 52800028     	mov	w8, #0x1                ; =1
 457b4e0: b8280288     	ldadd	w8, w8, [x20]
 457b4e4: 7100011f     	cmp	w8, #0x0
 457b4e8: 5400054d     	b.le	0x457b590 <_ChromeMain+0x45762f4>
 457b4ec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 457b4f0: 6b09011f     	cmp	w8, w9
 457b4f4: 54000540     	b.eq	0x457b59c <_ChromeMain+0x4576300>
 457b4f8: 1400000d     	b	0x457b52c <_ChromeMain+0x4576290>
 457b4fc: 52800035     	mov	w21, #0x1               ; =1
 457b500: 3912e675     	strb	w21, [x19, #0x4b9]
 457b504: aa1303e0     	mov	x0, x19
 457b508: 97fffefc     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 457b50c: f9425a74     	ldr	x20, [x19, #0x4b0]
 457b510: b4000214     	cbz	x20, 0x457b550 <_ChromeMain+0x45762b4>
 457b514: b8350288     	ldadd	w21, w8, [x20]
 457b518: 7100011f     	cmp	w8, #0x0
 457b51c: 5400034d     	b.le	0x457b584 <_ChromeMain+0x45762e8>
 457b520: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 457b524: 6b09011f     	cmp	w8, w9
 457b528: 54000280     	b.eq	0x457b578 <_ChromeMain+0x45762dc>
 457b52c: f9425a68     	ldr	x8, [x19, #0x4b0]
 457b530: f9400508     	ldr	x8, [x8, #0x8]
 457b534: aa1403e0     	mov	x0, x20
 457b538: aa1303e1     	mov	x1, x19
 457b53c: d63f0100     	blr	x8
 457b540: 12800008     	mov	w8, #-0x1               ; =-1
 457b544: b8e80288     	ldaddal	w8, w8, [x20]
 457b548: 7100051f     	cmp	w8, #0x1
 457b54c: 540000a0     	b.eq	0x457b560 <_ChromeMain+0x45762c4>
 457b550: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b554: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b558: a8c357f6     	ldp	x22, x21, [sp], #0x30
 457b55c: d65f03c0     	ret
 457b560: f9400a81     	ldr	x1, [x20, #0x10]
 457b564: aa1403e0     	mov	x0, x20
 457b568: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b56c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b570: a8c357f6     	ldp	x22, x21, [sp], #0x30
 457b574: d61f0020     	br	x1
 457b578: d4200000     	brk	#0
 457b57c: d4400000     	hlt	#0
 457b580: d4200020     	brk	#0x1
 457b584: d4200000     	brk	#0
 457b588: d4400000     	hlt	#0
 457b58c: d4200020     	brk	#0x1
 457b590: d4200000     	brk	#0
 457b594: d4400000     	hlt	#0
 457b598: d4200020     	brk	#0x1
 457b59c: d4200000     	brk	#0
 457b5a0: d4400000     	hlt	#0
 457b5a4: d4200020     	brk	#0x1
 457b5a8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 457b5ac: a9014ff4     	stp	x20, x19, [sp, #0x10]
 457b5b0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 457b5b4: 910083fd     	add	x29, sp, #0x20
 457b5b8: aa0003f3     	mov	x19, x0
 457b5bc: f9424000     	ldr	x0, [x0, #0x480]
 457b5c0: f9400008     	ldr	x8, [x0]
 457b5c4: f9401508     	ldr	x8, [x8, #0x28]
 457b5c8: d63f0100     	blr	x8
 457b5cc: 39472668     	ldrb	w8, [x19, #0x1c9]
 457b5d0: 370001c8     	tbnz	w8, #0x0, 0x457b608 <_ChromeMain+0x457636c>
 457b5d4: 3912e67f     	strb	wzr, [x19, #0x4b9]
 457b5d8: aa1303e0     	mov	x0, x19
 457b5dc: 97fffec7     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 457b5e0: f9425a74     	ldr	x20, [x19, #0x4b0]
 457b5e4: b40003d4     	cbz	x20, 0x457b65c <_ChromeMain+0x45763c0>
 457b5e8: 52800028     	mov	w8, #0x1                ; =1
 457b5ec: b8280288     	ldadd	w8, w8, [x20]
 457b5f0: 7100011f     	cmp	w8, #0x0
 457b5f4: 5400054d     	b.le	0x457b69c <_ChromeMain+0x4576400>
 457b5f8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 457b5fc: 6b09011f     	cmp	w8, w9
 457b600: 54000540     	b.eq	0x457b6a8 <_ChromeMain+0x457640c>
 457b604: 1400000d     	b	0x457b638 <_ChromeMain+0x457639c>
 457b608: 52800035     	mov	w21, #0x1               ; =1
 457b60c: 3912e675     	strb	w21, [x19, #0x4b9]
 457b610: aa1303e0     	mov	x0, x19
 457b614: 97fffeb9     	bl	0x457b0f8 <_ChromeMain+0x4575e5c>
 457b618: f9425a74     	ldr	x20, [x19, #0x4b0]
 457b61c: b4000214     	cbz	x20, 0x457b65c <_ChromeMain+0x45763c0>
 457b620: b8350288     	ldadd	w21, w8, [x20]
 457b624: 7100011f     	cmp	w8, #0x0
 457b628: 5400034d     	b.le	0x457b690 <_ChromeMain+0x45763f4>
 457b62c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 457b630: 6b09011f     	cmp	w8, w9
 457b634: 54000280     	b.eq	0x457b684 <_ChromeMain+0x45763e8>
 457b638: f9425a68     	ldr	x8, [x19, #0x4b0]
 457b63c: f9400508     	ldr	x8, [x8, #0x8]
 457b640: aa1403e0     	mov	x0, x20
 457b644: aa1303e1     	mov	x1, x19
 457b648: d63f0100     	blr	x8
 457b64c: 12800008     	mov	w8, #-0x1               ; =-1
 457b650: b8e80288     	ldaddal	w8, w8, [x20]
 457b654: 7100051f     	cmp	w8, #0x1
 457b658: 540000a0     	b.eq	0x457b66c <_ChromeMain+0x45763d0>
 457b65c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b660: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b664: a8c357f6     	ldp	x22, x21, [sp], #0x30
 457b668: d65f03c0     	ret
 457b66c: f9400a81     	ldr	x1, [x20, #0x10]
 457b670: aa1403e0     	mov	x0, x20
 457b674: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 457b678: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 457b67c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 457b680: d61f0020     	br	x1
 457b684: d4200000     	brk	#0
 457b688: d4400000     	hlt	#0
 457b68c: d4200020     	brk	#0x1
 457b690: d4200000     	brk	#0
 457b694: d4400000     	hlt	#0
 457b698: d4200020     	brk	#0x1
 457b69c: d4200000     	brk	#0
 457b6a0: d4400000     	hlt	#0
 457b6a4: d4200020     	brk	#0x1
 457b6a8: d4200000     	brk	#0
 457b6ac: d4400000     	hlt	#0
 457b6b0: d4200020     	brk	#0x1
 457b6b4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 457b6b8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 457b6bc: 910043fd     	add	x29, sp, #0x10
 457b6c0: aa0003f3     	mov	x19, x0
 457b6c4: f9424000     	ldr	x0, [x0, #0x480]
 457b6c8: f9400008     	ldr	x8, [x0]
 457b6cc: f9401908     	ldr	x8, [x8, #0x30]
 457b6d0: d63f0100     	blr	x8
 457b6d4: 3912e67f     	strb	wzr, [x19, #0x4b9]
 457b6d8: aa1303e0     	mov	x0, x19
 457b6dc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 457b6e0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 457b6e4: 17fffe85     	b	0x457b0f8 <_ChromeMain+0x4575e5c>
