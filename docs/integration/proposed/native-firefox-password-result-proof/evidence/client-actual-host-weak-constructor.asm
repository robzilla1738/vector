
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 781d55c: d10103ff     	sub	sp, sp, #0x40
 781d560: a90157f6     	stp	x22, x21, [sp, #0x10]
 781d564: a9024ff4     	stp	x20, x19, [sp, #0x20]
 781d568: a9037bfd     	stp	x29, x30, [sp, #0x30]
 781d56c: 9100c3fd     	add	x29, sp, #0x30
 781d570: aa0503f4     	mov	x20, x5
 781d574: aa0403f5     	mov	x21, x4
 781d578: aa0303f6     	mov	x22, x3
 781d57c: aa0003f3     	mov	x19, x0
 781d580: a9000be1     	stp	x1, x2, [sp]
 781d584: b900081f     	str	wzr, [x0, #0x8]
 781d588: f0034c88     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 781d58c: 9107e108     	add	x8, x8, #0x1f8
 781d590: f9000008     	str	x8, [x0]
 781d594: 6f00e400     	movi.2d	v0, #0000000000000000
 781d598: ad008000     	stp	q0, q0, [x0, #0x10]
 781d59c: ad018000     	stp	q0, q0, [x0, #0x30]
 781d5a0: ad028000     	stp	q0, q0, [x0, #0x50]
 781d5a4: ad038000     	stp	q0, q0, [x0, #0x70]
 781d5a8: ad048000     	stp	q0, q0, [x0, #0x90]
 781d5ac: f900581f     	str	xzr, [x0, #0xb0]
 781d5b0: 91030000     	add	x0, x0, #0xc0
 781d5b4: 910003e1     	mov	x1, sp
 781d5b8: 968f134a     	bl	0x1be22e0 <_ChromeMain+0x1bdd044>
 781d5bc: f94007e8     	ldr	x8, [sp, #0x8]
 781d5c0: f9006668     	str	x8, [x19, #0xc8]
 781d5c4: 91034260     	add	x0, x19, #0xd0
 781d5c8: aa1603e1     	mov	x1, x22
 781d5cc: 97e755f8     	bl	0x71f2dac <_ChromeMain+0x71edb10>
 781d5d0: 7902b275     	strh	w21, [x19, #0x158]
 781d5d4: f900b274     	str	x20, [x19, #0x160]
 781d5d8: b40000f4     	cbz	x20, 0x781d5f4 <_ChromeMain+0x7818358>
 781d5dc: 91002288     	add	x8, x20, #0x8
 781d5e0: 52800029     	mov	w9, #0x1                ; =1
 781d5e4: b8290108     	ldadd	w9, w8, [x8]
 781d5e8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 781d5ec: 6b09011f     	cmp	w8, w9
 781d5f0: 54000520     	b.eq	0x781d694 <_ChromeMain+0x78183f8>
 781d5f4: 7902d27f     	strh	wzr, [x19, #0x168]
 781d5f8: 3905aa7f     	strb	wzr, [x19, #0x16a]
 781d5fc: 9105b268     	add	x8, x19, #0x16c
 781d600: b9016e7f     	str	wzr, [x19, #0x16c]
 781d604: b800311f     	stur	wzr, [x8, #0x3]
 781d608: a9187e7f     	stp	xzr, xzr, [x19, #0x180]
 781d60c: f900be7f     	str	xzr, [x19, #0x178]
 781d610: 3906427f     	strb	wzr, [x19, #0x190]
 781d614: 91066260     	add	x0, x19, #0x198
 781d618: 96716daa     	bl	0x1478cc0 <_ChromeMain+0x1473a24>
 781d61c: f900e27f     	str	xzr, [x19, #0x1c0]
 781d620: 91072260     	add	x0, x19, #0x1c8
 781d624: 969e46a7     	bl	0x1faf0c0 <_ChromeMain+0x1fa9e24>
 781d628: f0034c88     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 781d62c: 910a6108     	add	x8, x8, #0x298
 781d630: a91ece68     	stp	x8, x19, [x19, #0x1e8]
 781d634: f9406268     	ldr	x8, [x19, #0xc0]
 781d638: b4000288     	cbz	x8, 0x781d688 <_ChromeMain+0x78183ec>
 781d63c: 19404108     	ldapurb	w8, [x8, #0x4]
 781d640: 35000248     	cbnz	w8, 0x781d688 <_ChromeMain+0x78183ec>
 781d644: f9406660     	ldr	x0, [x19, #0xc8]
 781d648: 94000c66     	bl	0x78207e0 <_ChromeMain+0x781b544>
 781d64c: f94003e0     	ldr	x0, [sp]
 781d650: b50000e0     	cbnz	x0, 0x781d66c <_ChromeMain+0x78183d0>
 781d654: aa1303e0     	mov	x0, x19
 781d658: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 781d65c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 781d660: a94157f6     	ldp	x22, x21, [sp, #0x10]
 781d664: 910103ff     	add	sp, sp, #0x40
 781d668: d65f03c0     	ret
 781d66c: 12800008     	mov	w8, #-0x1               ; =-1
 781d670: b8e80008     	ldaddal	w8, w8, [x0]
 781d674: 7100051f     	cmp	w8, #0x1
 781d678: 54fffee1     	b.ne	0x781d654 <_ChromeMain+0x78183b8>
 781d67c: 52800101     	mov	w1, #0x8                ; =8
 781d680: 961fae0e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 781d684: 17fffff4     	b	0x781d654 <_ChromeMain+0x78183b8>
 781d688: d4200000     	brk	#0
 781d68c: d4400000     	hlt	#0
 781d690: d4200020     	brk	#0x1
 781d694: d4200000     	brk	#0
 781d698: d4400000     	hlt	#0
 781d69c: d4200020     	brk	#0x1
