
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46800c4: d100c3ff     	sub	sp, sp, #0x30
 46800c8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46800cc: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46800d0: 910083fd     	add	x29, sp, #0x20
 46800d4: 91158014     	add	x20, x0, #0x560
 46800d8: 3955a008     	ldrb	w8, [x0, #0x568]
 46800dc: 35000448     	cbnz	w8, 0x4680164 <_ChromeMain+0x467aec8>
 46800e0: aa0003f3     	mov	x19, x0
 46800e4: f942b808     	ldr	x8, [x0, #0x570]
 46800e8: 91000508     	add	x8, x8, #0x1
 46800ec: f902b808     	str	x8, [x0, #0x570]
 46800f0: 390003ff     	strb	wzr, [sp]
 46800f4: 390013ff     	strb	wzr, [sp, #0x4]
 46800f8: 390023ff     	strb	wzr, [sp, #0x8]
 46800fc: 390033ff     	strb	wzr, [sp, #0xc]
 4680100: 910003e1     	mov	x1, sp
 4680104: 97d2a535     	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 4680108: 9113c268     	add	x8, x19, #0x4f0
 468010c: b0048329     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4680110: 91093129     	add	x9, x9, #0x24c
 4680114: 3953826a     	ldrb	w10, [x19, #0x4e0]
 4680118: b004832b     	adrp	x11, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 468011c: 9104f16b     	add	x11, x11, #0x13c
 4680120: 7100015f     	cmp	w10, #0x0
 4680124: 9a891169     	csel	x9, x11, x9, ne
 4680128: 3953d26a     	ldrb	w10, [x19, #0x4f4]
 468012c: 7100015f     	cmp	w10, #0x0
 4680130: 9a891108     	csel	x8, x8, x9, ne
 4680134: b9400108     	ldr	w8, [x8]
 4680138: 0aa87d08     	bic	w8, w8, w8, asr #31
 468013c: b3607d00     	bfi	x0, x8, #32, #32
 4680140: 3955a268     	ldrb	w8, [x19, #0x568]
 4680144: 350000c8     	cbnz	w8, 0x468015c <_ChromeMain+0x467aec0>
 4680148: b4000194     	cbz	x20, 0x4680178 <_ChromeMain+0x467aedc>
 468014c: f902b260     	str	x0, [x19, #0x560]
 4680150: 52800028     	mov	w8, #0x1                ; =1
 4680154: 3915a268     	strb	w8, [x19, #0x568]
 4680158: 14000004     	b	0x4680168 <_ChromeMain+0x467aecc>
 468015c: f9000280     	str	x0, [x20]
 4680160: 14000002     	b	0x4680168 <_ChromeMain+0x467aecc>
 4680164: f9400280     	ldr	x0, [x20]
 4680168: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 468016c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4680170: 9100c3ff     	add	sp, sp, #0x30
 4680174: d65f03c0     	ret
 4680178: d4200020     	brk	#0x1
 468017c: 3955a008     	ldrb	w8, [x0, #0x568]
 4680180: 34000048     	cbz	w8, 0x4680188 <_ChromeMain+0x467aeec>
 4680184: 3915a01f     	strb	wzr, [x0, #0x568]
 4680188: f9400008     	ldr	x8, [x0]
 468018c: f9418501     	ldr	x1, [x8, #0x308]
 4680190: d61f0020     	br	x1
 4680194: f9400428     	ldr	x8, [x1, #0x8]
 4680198: eb00011f     	cmp	x8, x0
 468019c: 54000040     	b.eq	0x46801a4 <_ChromeMain+0x467af08>
 46801a0: d65f03c0     	ret
 46801a4: 3955a008     	ldrb	w8, [x0, #0x568]
 46801a8: 34000048     	cbz	w8, 0x46801b0 <_ChromeMain+0x467af14>
 46801ac: 3915a01f     	strb	wzr, [x0, #0x568]
 46801b0: f9400008     	ldr	x8, [x0]
 46801b4: f9418501     	ldr	x1, [x8, #0x308]
 46801b8: d61f0020     	br	x1
 46801bc: d503201f     	nop
 46801c0: d503201f     	nop
 46801c4: d503201f     	nop
 46801c8: d503201f     	nop
 46801cc: d503201f     	nop
 46801d0: d503201f     	nop
 46801d4: d503201f     	nop
 46801d8: d503201f     	nop
 46801dc: d503201f     	nop
 46801e0: d503201f     	nop
 46801e4: d503201f     	nop
		...
 4680200: d10243ff     	sub	sp, sp, #0x90
 4680204: 6d0623e9     	stp	d9, d8, [sp, #0x60]
 4680208: a9074ff4     	stp	x20, x19, [sp, #0x70]
 468020c: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4680210: 910203fd     	add	x29, sp, #0x80
 4680214: aa0103f3     	mov	x19, x1
 4680218: aa0003f4     	mov	x20, x0
 468021c: 39544408     	ldrb	w8, [x0, #0x511]
 4680220: 37000068     	tbnz	w8, #0x0, 0x468022c <_ChromeMain+0x467af90>
 4680224: b943be88     	ldr	w8, [x20, #0x3bc]
 4680228: 34000668     	cbz	w8, 0x46802f4 <_ChromeMain+0x467b058>
 468022c: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4680230: 6f00e400     	movi.2d	v0, #0000000000000000
 4680234: 3c8283e0     	stur	q0, [sp, #0x28]
 4680238: 3c8383e0     	stur	q0, [sp, #0x38]
 468023c: f90027ff     	str	xzr, [sp, #0x48]
 4680240: d2806029     	mov	x9, #0x301              ; =769
 4680244: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4680248: a901a7e8     	stp	x8, x9, [sp, #0x18]
 468024c: aa1403e0     	mov	x0, x20
 4680250: 96fc8368     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4680254: b943be88     	ldr	w8, [x20, #0x3bc]
 4680258: 52801b69     	mov	w9, #0xdb               ; =219
 468025c: 52801eea     	mov	w10, #0xf7              ; =247
 4680260: 7100051f     	cmp	w8, #0x1
 4680264: 1a890141     	csel	w1, w10, w9, eq
 4680268: 97229fd8     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 468026c: 971d3abf     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4680270: 2d0107e0     	stp	s0, s1, [sp, #0x8]
 4680274: 2d020fe2     	stp	s2, s3, [sp, #0x10]
 4680278: 91070288     	add	x8, x20, #0x1c0
 468027c: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 4680280: d004c5c8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4680284: 3dc01101     	ldr	q1, [x8, #0x40]
 4680288: 6ee14400     	ushl.2d	v0, v0, v1
 468028c: 0ea12800     	xtn.2s	v0, v0
 4680290: 6f00e401     	movi.2d	v1, #0000000000000000
 4680294: 0ea16400     	smax.2s	v0, v0, v1
 4680298: 2e21d808     	ucvtf.2s	v8, v0
 468029c: 52800700     	mov	w0, #0x38               ; =56
 46802a0: 96fa0d88     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46802a4: 1e220000     	scvtf	s0, w0
 46802a8: f9406260     	ldr	x0, [x19, #0xc0]
 46802ac: f81d03bf     	stur	xzr, [x29, #-0x30]
 46802b0: fc1d83a8     	stur	d8, [x29, #-0x28]
 46802b4: f9400008     	ldr	x8, [x0]
 46802b8: f9408508     	ldr	x8, [x8, #0x108]
 46802bc: d100c3a1     	sub	x1, x29, #0x30
 46802c0: 910023e2     	add	x2, sp, #0x8
 46802c4: 4ea01c01     	mov.16b	v1, v0
 46802c8: d63f0100     	blr	x8
 46802cc: f94027e0     	ldr	x0, [sp, #0x48]
 46802d0: b50004a0     	cbnz	x0, 0x4680364 <_ChromeMain+0x467b0c8>
 46802d4: f94023e0     	ldr	x0, [sp, #0x40]
 46802d8: b5000340     	cbnz	x0, 0x4680340 <_ChromeMain+0x467b0a4>
 46802dc: f9401fe0     	ldr	x0, [sp, #0x38]
 46802e0: b5000660     	cbnz	x0, 0x46803ac <_ChromeMain+0x467b110>
 46802e4: f9401be0     	ldr	x0, [sp, #0x30]
 46802e8: b5000100     	cbnz	x0, 0x4680308 <_ChromeMain+0x467b06c>
 46802ec: f94017e0     	ldr	x0, [sp, #0x28]
 46802f0: b50004c0     	cbnz	x0, 0x4680388 <_ChromeMain+0x467b0ec>
 46802f4: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 46802f8: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 46802fc: 6d4623e9     	ldp	d9, d8, [sp, #0x60]
 4680300: 910243ff     	add	sp, sp, #0x90
 4680304: d65f03c0     	ret
 4680308: 91002008     	add	x8, x0, #0x8
 468030c: 12800009     	mov	w9, #-0x1               ; =-1
 4680310: b8e90108     	ldaddal	w9, w8, [x8]
 4680314: 7100051f     	cmp	w8, #0x1
 4680318: 54fffea1     	b.ne	0x46802ec <_ChromeMain+0x467b050>
 468031c: f9400009     	ldr	x9, [x0]
 4680320: f9400928     	ldr	x8, [x9, #0x10]
 4680324: b0fdcd2a     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4680328: 9106014a     	add	x10, x10, #0x180
 468032c: eb0a011f     	cmp	x8, x10
 4680330: 54000041     	b.ne	0x4680338 <_ChromeMain+0x467b09c>
 4680334: f9400528     	ldr	x8, [x9, #0x8]
 4680338: d63f0100     	blr	x8
 468033c: 17ffffec     	b	0x46802ec <_ChromeMain+0x467b050>
 4680340: 91002008     	add	x8, x0, #0x8
 4680344: 12800009     	mov	w9, #-0x1               ; =-1
 4680348: b8e90108     	ldaddal	w9, w8, [x8]
 468034c: 7100051f     	cmp	w8, #0x1
 4680350: 54fffc61     	b.ne	0x46802dc <_ChromeMain+0x467b040>
 4680354: f9400008     	ldr	x8, [x0]
 4680358: f9400908     	ldr	x8, [x8, #0x10]
 468035c: d63f0100     	blr	x8
 4680360: 17ffffdf     	b	0x46802dc <_ChromeMain+0x467b040>
 4680364: 91002008     	add	x8, x0, #0x8
 4680368: 12800009     	mov	w9, #-0x1               ; =-1
 468036c: b8e90108     	ldaddal	w9, w8, [x8]
 4680370: 7100051f     	cmp	w8, #0x1
 4680374: 54fffb01     	b.ne	0x46802d4 <_ChromeMain+0x467b038>
 4680378: f9400008     	ldr	x8, [x0]
 468037c: f9400908     	ldr	x8, [x8, #0x10]
 4680380: d63f0100     	blr	x8
 4680384: 17ffffd4     	b	0x46802d4 <_ChromeMain+0x467b038>
 4680388: 91002008     	add	x8, x0, #0x8
 468038c: 12800009     	mov	w9, #-0x1               ; =-1
 4680390: b8e90108     	ldaddal	w9, w8, [x8]
 4680394: 7100051f     	cmp	w8, #0x1
 4680398: 54fffae1     	b.ne	0x46802f4 <_ChromeMain+0x467b058>
 468039c: f9400008     	ldr	x8, [x0]
 46803a0: f9400908     	ldr	x8, [x8, #0x10]
 46803a4: d63f0100     	blr	x8
 46803a8: 17ffffd3     	b	0x46802f4 <_ChromeMain+0x467b058>
 46803ac: 91002008     	add	x8, x0, #0x8
 46803b0: 12800009     	mov	w9, #-0x1               ; =-1
 46803b4: b8e90108     	ldaddal	w9, w8, [x8]
 46803b8: 7100051f     	cmp	w8, #0x1
 46803bc: 54fff941     	b.ne	0x46802e4 <_ChromeMain+0x467b048>
 46803c0: f9400008     	ldr	x8, [x0]
 46803c4: f9400908     	ldr	x8, [x8, #0x10]
 46803c8: d63f0100     	blr	x8
 46803cc: 17ffffc6     	b	0x46802e4 <_ChromeMain+0x467b048>
 46803d0: 17fffdfc     	b	0x467fbc0 <_ChromeMain+0x467a924>
