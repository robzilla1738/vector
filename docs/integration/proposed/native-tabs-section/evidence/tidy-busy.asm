
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464d4b0: d10143ff     	sub	sp, sp, #0x50
 464d4b4: a90257f6     	stp	x22, x21, [sp, #0x20]
 464d4b8: a9034ff4     	stp	x20, x19, [sp, #0x30]
 464d4bc: a9047bfd     	stp	x29, x30, [sp, #0x40]
 464d4c0: 910103fd     	add	x29, sp, #0x40
 464d4c4: aa0103f3     	mov	x19, x1
 464d4c8: aa0003f4     	mov	x20, x0
 464d4cc: f9434415     	ldr	x21, [x0, #0x688]
 464d4d0: f94276a0     	ldr	x0, [x21, #0x4e8]
 464d4d4: f9400008     	ldr	x8, [x0]
 464d4d8: f9405108     	ldr	x8, [x8, #0xa0]
 464d4dc: d63f0100     	blr	x8
 464d4e0: f94276a0     	ldr	x0, [x21, #0x4e8]
 464d4e4: f9400008     	ldr	x8, [x0]
 464d4e8: 7100027f     	cmp	w19, #0x0
 464d4ec: 52807c09     	mov	w9, #0x3e0              ; =992
 464d4f0: 52807b0a     	mov	w10, #0x3d8             ; =984
 464d4f4: 9a891149     	csel	x9, x10, x9, ne
 464d4f8: f8696908     	ldr	x8, [x8, x9]
 464d4fc: d63f0100     	blr	x8
 464d500: f9426ea0     	ldr	x0, [x21, #0x4d8]
 464d504: f9400008     	ldr	x8, [x0]
 464d508: f9405108     	ldr	x8, [x8, #0xa0]
 464d50c: 52000261     	eor	w1, w19, #0x1
 464d510: d63f0100     	blr	x8
 464d514: 52000261     	eor	w1, w19, #0x1
 464d518: aa1503e0     	mov	x0, x21
 464d51c: 972a80da     	bl	0x10ed884 <_ChromeMain+0x10e85e8>
 464d520: f94166b6     	ldr	x22, [x21, #0x2c8]
 464d524: b4000b36     	cbz	x22, 0x464d688 <_ChromeMain+0x46483ec>
 464d528: 350001b3     	cbnz	w19, 0x464d55c <_ChromeMain+0x46482c0>
 464d52c: 39c4bea8     	ldrsb	w8, [x21, #0x12f]
 464d530: 37f800e8     	tbnz	w8, #0x1f, 0x464d54c <_ChromeMain+0x46482b0>
 464d534: 910462a8     	add	x8, x21, #0x118
 464d538: 3dc00100     	ldr	q0, [x8]
 464d53c: f9400908     	ldr	x8, [x8, #0x10]
 464d540: f9000be8     	str	x8, [sp, #0x10]
 464d544: 3d8003e0     	str	q0, [sp]
 464d548: 14000018     	b	0x464d5a8 <_ChromeMain+0x464830c>
 464d54c: a9518aa1     	ldp	x1, x2, [x21, #0x118]
 464d550: 910003e0     	mov	x0, sp
 464d554: 96e7e59f     	bl	0x46bd0 <_ChromeMain+0x41934>
 464d558: 14000014     	b	0x464d5a8 <_ChromeMain+0x464830c>
 464d55c: 52800400     	mov	w0, #0x20               ; =32
 464d560: 96e70782     	bl	0xf368 <_ChromeMain+0xa0cc>
 464d564: f90003e0     	str	x0, [sp]
 464d568: d004c788     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 464d56c: 3dc04100     	ldr	q0, [x8, #0x100]
 464d570: 3c8083e0     	stur	q0, [sp, #0x8]
 464d574: 91007809     	add	x9, x0, #0x1e
 464d578: eb00013f     	cmp	x9, x0
 464d57c: 54000a03     	b.lo	0x464d6bc <_ChromeMain+0x4648420>
 464d580: d004c9c8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 464d584: 913fb908     	add	x8, x8, #0xfee
 464d588: eb08013f     	cmp	x9, x8
 464d58c: fa488002     	ccmp	x0, x8, #0x2, hi
 464d590: 54000969     	b.ls	0x464d6bc <_ChromeMain+0x4648420>
 464d594: 3dc00100     	ldr	q0, [x8]
 464d598: 3d800000     	str	q0, [x0]
 464d59c: 3cc0e100     	ldur	q0, [x8, #0xe]
 464d5a0: 3c80e000     	stur	q0, [x0, #0xe]
 464d5a4: 79003c1f     	strh	wzr, [x0, #0x1e]
 464d5a8: 910003e1     	mov	x1, sp
 464d5ac: aa1603e0     	mov	x0, x22
 464d5b0: 972c80ca     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 464d5b4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 464d5b8: 36f800a8     	tbz	w8, #0x1f, 0x464d5cc <_ChromeMain+0x4648330>
 464d5bc: f94003e0     	ldr	x0, [sp]
 464d5c0: f9400be8     	ldr	x8, [sp, #0x10]
 464d5c4: d37ff901     	lsl	x1, x8, #1
 464d5c8: 96e6ee3c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d5cc: 3953e2a8     	ldrb	w8, [x21, #0x4f8]
 464d5d0: 34000048     	cbz	w8, 0x464d5d8 <_ChromeMain+0x464833c>
 464d5d4: 3913e2bf     	strb	wzr, [x21, #0x4f8]
 464d5d8: f94002a8     	ldr	x8, [x21]
 464d5dc: f9418508     	ldr	x8, [x8, #0x308]
 464d5e0: aa1503e0     	mov	x0, x21
 464d5e4: d63f0100     	blr	x8
 464d5e8: f9433e94     	ldr	x20, [x20, #0x678]
 464d5ec: 3912d293     	strb	w19, [x20, #0x4b4]
 464d5f0: b943be88     	ldr	w8, [x20, #0x3bc]
 464d5f4: 71000515     	subs	w21, w8, #0x1
 464d5f8: 1a9f37e8     	cset	w8, hs
 464d5fc: f9426e80     	ldr	x0, [x20, #0x4d8]
 464d600: b4000160     	cbz	x0, 0x464d62c <_ChromeMain+0x4648390>
 464d604: 2a080268     	orr	w8, w19, w8
 464d608: 39472009     	ldrb	w9, [x0, #0x1c8]
 464d60c: 12000101     	and	w1, w8, #0x1
 464d610: 6b09003f     	cmp	w1, w9
 464d614: 540000c0     	b.eq	0x464d62c <_ChromeMain+0x4648390>
 464d618: f9400008     	ldr	x8, [x0]
 464d61c: f9405108     	ldr	x8, [x8, #0xa0]
 464d620: d63f0100     	blr	x8
 464d624: 52800028     	mov	w8, #0x1                ; =1
 464d628: 14000002     	b	0x464d630 <_ChromeMain+0x4648394>
 464d62c: 52800008     	mov	w8, #0x0                ; =0
 464d630: f9427280     	ldr	x0, [x20, #0x4e0]
 464d634: b4000180     	cbz	x0, 0x464d664 <_ChromeMain+0x46483c8>
 464d638: 71000abf     	cmp	w21, #0x2
 464d63c: 1a9f27e9     	cset	w9, lo
 464d640: 3947200a     	ldrb	w10, [x0, #0x1c8]
 464d644: 6b0a013f     	cmp	w9, w10
 464d648: 540000e0     	b.eq	0x464d664 <_ChromeMain+0x46483c8>
 464d64c: 71000abf     	cmp	w21, #0x2
 464d650: 1a9f27e1     	cset	w1, lo
 464d654: f9400008     	ldr	x8, [x0]
 464d658: f9405108     	ldr	x8, [x8, #0xa0]
 464d65c: d63f0100     	blr	x8
 464d660: 14000002     	b	0x464d668 <_ChromeMain+0x46483cc>
 464d664: 34000088     	cbz	w8, 0x464d674 <_ChromeMain+0x46483d8>
 464d668: aa1403e0     	mov	x0, x20
 464d66c: 52800001     	mov	w1, #0x0                ; =0
 464d670: 96ff8b81     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464d674: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 464d678: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 464d67c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 464d680: 910143ff     	add	sp, sp, #0x50
 464d684: d65f03c0     	ret
 464d688: 9722629e     	bl	0xee6100 <_ChromeMain+0xee0e64>
 464d68c: 350001a0     	cbnz	w0, 0x464d6c0 <_ChromeMain+0x4648424>
 464d690: aa1503e0     	mov	x0, x21
 464d694: 973243f0     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 464d698: aa0003f6     	mov	x22, x0
 464d69c: f94166a0     	ldr	x0, [x21, #0x2c8]
 464d6a0: f90166b6     	str	x22, [x21, #0x2c8]
 464d6a4: b4fff420     	cbz	x0, 0x464d528 <_ChromeMain+0x464828c>
 464d6a8: f9400008     	ldr	x8, [x0]
 464d6ac: f9400508     	ldr	x8, [x8, #0x8]
 464d6b0: d63f0100     	blr	x8
 464d6b4: f94166b6     	ldr	x22, [x21, #0x2c8]
 464d6b8: 17ffff9c     	b	0x464d528 <_ChromeMain+0x464828c>
 464d6bc: d4200020     	brk	#0x1
 464d6c0: 52803600     	mov	w0, #0x1b0              ; =432
 464d6c4: 96e70729     	bl	0xf368 <_ChromeMain+0xa0cc>
 464d6c8: aa0003f6     	mov	x22, x0
 464d6cc: aa1503e1     	mov	x1, x21
 464d6d0: 9722612c     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 464d6d4: 17fffff2     	b	0x464d69c <_ChromeMain+0x4648400>
