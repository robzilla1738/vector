
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460d25c: d10503ff     	sub	sp, sp, #0x140
 460d260: 6d0e23e9     	stp	d9, d8, [sp, #0xe0]
 460d264: a90f67fa     	stp	x26, x25, [sp, #0xf0]
 460d268: a9105ff8     	stp	x24, x23, [sp, #0x100]
 460d26c: a91157f6     	stp	x22, x21, [sp, #0x110]
 460d270: a9124ff4     	stp	x20, x19, [sp, #0x120]
 460d274: a9137bfd     	stp	x29, x30, [sp, #0x130]
 460d278: 9104c3fd     	add	x29, sp, #0x130
 460d27c: aa0103f3     	mov	x19, x1
 460d280: aa0003f4     	mov	x20, x0
 460d284: 970d6d60     	bl	0x968804 <_ChromeMain+0x963568>
 460d288: f941ea88     	ldr	x8, [x20, #0x3d0]
 460d28c: b40000a8     	cbz	x8, 0x460d2a0 <_ChromeMain+0x4608004>
 460d290: f941f296     	ldr	x22, [x20, #0x3e0]
 460d294: f941b509     	ldr	x9, [x8, #0x368]
 460d298: eb0902df     	cmp	x22, x9
 460d29c: 54000123     	b.lo	0x460d2c0 <_ChromeMain+0x4608024>
 460d2a0: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 460d2a4: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 460d2a8: a95157f6     	ldp	x22, x21, [sp, #0x110]
 460d2ac: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 460d2b0: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
 460d2b4: 6d4e23e9     	ldp	d9, d8, [sp, #0xe0]
 460d2b8: 910503ff     	add	sp, sp, #0x140
 460d2bc: d65f03c0     	ret
 460d2c0: f941b117     	ldr	x23, [x8, #0x360]
 460d2c4: aa1403e0     	mov	x0, x20
 460d2c8: 96fe4f4a     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 460d2cc: b4fffea0     	cbz	x0, 0x460d2a0 <_ChromeMain+0x4608004>
 460d2d0: aa0003f5     	mov	x21, x0
 460d2d4: 52804d08     	mov	w8, #0x268              ; =616
 460d2d8: 9b085ed6     	madd	x22, x22, x8, x23
 460d2dc: 91070288     	add	x8, x20, #0x1c0
 460d2e0: f9004bff     	str	xzr, [sp, #0x90]
 460d2e4: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 460d2e8: b004c968     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 460d2ec: 3dc01101     	ldr	q1, [x8, #0x40]
 460d2f0: 3d8007e1     	str	q1, [sp, #0x10]
 460d2f4: 6ee14400     	ushl.2d	v0, v0, v1
 460d2f8: 0ea12800     	xtn.2s	v0, v0
 460d2fc: 6f00e401     	movi.2d	v1, #0000000000000000
 460d300: 0ea16400     	smax.2s	v0, v0, v1
 460d304: 2e21d800     	ucvtf.2s	v0, v0
 460d308: fd004fe0     	str	d0, [sp, #0x98]
 460d30c: 4f046400     	movi.4s	v0, #0x80, lsl #24
 460d310: 3d800fe0     	str	q0, [sp, #0x30]
 460d314: 910243e0     	add	x0, sp, #0x90
 460d318: 9100c3e1     	add	x1, sp, #0x30
 460d31c: 96e83b79     	bl	0x1c100 <_ChromeMain+0x16e64>
 460d320: 910243e0     	add	x0, sp, #0x90
 460d324: 9744f454     	bl	0x174a474 <_ChromeMain+0x17451d8>
 460d328: 2d2e07a0     	stp	s0, s1, [x29, #-0x90]
 460d32c: 2d2f0fa2     	stp	s2, s3, [x29, #-0x88]
 460d330: 6f00e400     	movi.2d	v0, #0000000000000000
 460d334: ad0183e0     	stp	q0, q0, [sp, #0x30]
 460d338: 3d8017e0     	str	q0, [sp, #0x50]
 460d33c: b90063ff     	str	wzr, [sp, #0x60]
 460d340: 9100c3e0     	add	x0, sp, #0x30
 460d344: d10243a1     	sub	x1, x29, #0x90
 460d348: 1e249000     	fmov	s0, #10.00000000
 460d34c: 1e249001     	fmov	s1, #10.00000000
 460d350: 970b6fac     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 460d354: 910203e8     	add	x8, sp, #0x80
 460d358: 9100c3e0     	add	x0, sp, #0x30
 460d35c: 52800001     	mov	w1, #0x0                ; =0
 460d360: 970ac45c     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 460d364: aa1503e0     	mov	x0, x21
 460d368: 52801ce1     	mov	w1, #0xe7               ; =231
 460d36c: 97246b97     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d370: aa0003e2     	mov	x2, x0
 460d374: 910203e1     	add	x1, sp, #0x80
 460d378: aa1303e0     	mov	x0, x19
 460d37c: 97ec678d     	bl	0x41271b0 <_ChromeMain+0x4121f14>
 460d380: f94043e0     	ldr	x0, [sp, #0x80]
 460d384: b40000a0     	cbz	x0, 0x460d398 <_ChromeMain+0x46080fc>
 460d388: 12800008     	mov	w8, #-0x1               ; =-1
 460d38c: b8e80008     	ldaddal	w8, w8, [x0]
 460d390: 7100051f     	cmp	w8, #0x1
 460d394: 540001a0     	b.eq	0x460d3c8 <_ChromeMain+0x460812c>
 460d398: aa1503e0     	mov	x0, x21
 460d39c: 52801d61     	mov	w1, #0xeb               ; =235
 460d3a0: 97246b8a     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d3a4: 394982c8     	ldrb	w8, [x22, #0x260]
 460d3a8: 340002a8     	cbz	w8, 0x460d3fc <_ChromeMain+0x4608160>
 460d3ac: aa1503e0     	mov	x0, x21
 460d3b0: 52801b01     	mov	w1, #0xd8               ; =216
 460d3b4: 97246b85     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 460d3b8: 394972c9     	ldrb	w9, [x22, #0x25c]
 460d3bc: 35000169     	cbnz	w9, 0x460d3e8 <_ChromeMain+0x460814c>
 460d3c0: aa0003e8     	mov	x8, x0
 460d3c4: 1400000a     	b	0x460d3ec <_ChromeMain+0x4608150>
 460d3c8: b9802808     	ldrsw	x8, [x0, #0x28]
 460d3cc: 35001608     	cbnz	w8, 0x460d68c <_ChromeMain+0x46083f0>
 460d3d0: 3940b008     	ldrb	w8, [x0, #0x2c]
 460d3d4: 37001a68     	tbnz	w8, #0x0, 0x460d720 <_ChromeMain+0x4608484>
 460d3d8: f9400809     	ldr	x9, [x0, #0x10]
 460d3dc: b5001ba9     	cbnz	x9, 0x460d750 <_ChromeMain+0x46084b4>
 460d3e0: 96e81ca2     	bl	0x14668 <_ChromeMain+0xf3cc>
 460d3e4: 17ffffed     	b	0x460d398 <_ChromeMain+0x46080fc>
 460d3e8: b9425ac8     	ldr	w8, [x22, #0x258]
 460d3ec: 52acc000     	mov	w0, #0x66000000         ; =1711276032
 460d3f0: 33005d00     	bfxil	w0, w8, #0, #24
 460d3f4: 1e201008     	fmov	s8, #2.00000000
 460d3f8: 14000002     	b	0x460d400 <_ChromeMain+0x4608164>
 460d3fc: 1e2c1008     	fmov	s8, #0.50000000
 460d400: d2a81008     	mov	x8, #0x40800000         ; =1082130432
 460d404: f2c06828     	movk	x8, #0x341, lsl #32
 460d408: f80443e8     	stur	x8, [sp, #0x44]
 460d40c: 52b7f008     	mov	w8, #-0x40800000        ; =-1082130432
 460d410: b9004fe8     	str	w8, [sp, #0x4c]
 460d414: 6f00e400     	movi.2d	v0, #0000000000000000
 460d418: ad0283e0     	stp	q0, q0, [sp, #0x50]
 460d41c: f9003bff     	str	xzr, [sp, #0x70]
 460d420: bd0043e8     	str	s8, [sp, #0x40]
 460d424: 971f0651     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 460d428: 2d0607e0     	stp	s0, s1, [sp, #0x30]
 460d42c: 2d070fe2     	stp	s2, s3, [sp, #0x38]
 460d430: 1e3c1000     	fmov	s0, #-0.50000000
 460d434: 1e200909     	fmul	s9, s8, s0
 460d438: f90043ff     	str	xzr, [sp, #0x80]
 460d43c: 91070288     	add	x8, x20, #0x1c0
 460d440: 4d40cd01     	ld1r.2d	{ v1 }, [x8]
 460d444: 3dc007e2     	ldr	q2, [sp, #0x10]
 460d448: 6ee24421     	ushl.2d	v1, v1, v2
 460d44c: 0ea12821     	xtn.2s	v1, v1
 460d450: 6f00e402     	movi.2d	v2, #0000000000000000
 460d454: 0ea26421     	smax.2s	v1, v1, v2
 460d458: 2e21d821     	ucvtf.2s	v1, v1
 460d45c: fd0047e1     	str	d1, [sp, #0x88]
 460d460: 1e208900     	fnmul	s0, s8, s0
 460d464: 4e040400     	dup.4s	v0, v0[0]
 460d468: 3c9703a0     	stur	q0, [x29, #-0x90]
 460d46c: 910203e0     	add	x0, sp, #0x80
 460d470: d10243a1     	sub	x1, x29, #0x90
 460d474: 96e83b23     	bl	0x1c100 <_ChromeMain+0x16e64>
 460d478: 1e249000     	fmov	s0, #10.00000000
 460d47c: 1e202928     	fadd	s8, s9, s0
 460d480: 910203e0     	add	x0, sp, #0x80
 460d484: 9744f3fc     	bl	0x174a474 <_ChromeMain+0x17451d8>
 460d488: 2d1207e0     	stp	s0, s1, [sp, #0x90]
 460d48c: 2d130fe2     	stp	s2, s3, [sp, #0x98]
 460d490: 6f00e400     	movi.2d	v0, #0000000000000000
 460d494: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 460d498: 3c9903a0     	stur	q0, [x29, #-0x70]
 460d49c: b81a03bf     	stur	wzr, [x29, #-0x60]
 460d4a0: d10243a0     	sub	x0, x29, #0x90
 460d4a4: 910243e1     	add	x1, sp, #0x90
 460d4a8: 4ea81d00     	mov.16b	v0, v8
 460d4ac: 4ea81d01     	mov.16b	v1, v8
 460d4b0: 970b6f54     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 460d4b4: 910083e8     	add	x8, sp, #0x20
 460d4b8: d10243a0     	sub	x0, x29, #0x90
 460d4bc: 52800001     	mov	w1, #0x0                ; =0
 460d4c0: 970ac404     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 460d4c4: f9406260     	ldr	x0, [x19, #0xc0]
 460d4c8: f9400008     	ldr	x8, [x0]
 460d4cc: f9408908     	ldr	x8, [x8, #0x110]
 460d4d0: 910083e1     	add	x1, sp, #0x20
 460d4d4: 9100c3e2     	add	x2, sp, #0x30
 460d4d8: 52800023     	mov	w3, #0x1                ; =1
 460d4dc: d63f0100     	blr	x8
 460d4e0: f94013f3     	ldr	x19, [sp, #0x20]
 460d4e4: b40000b3     	cbz	x19, 0x460d4f8 <_ChromeMain+0x460825c>
 460d4e8: 12800008     	mov	w8, #-0x1               ; =-1
 460d4ec: b8e80268     	ldaddal	w8, w8, [x19]
 460d4f0: 7100051f     	cmp	w8, #0x1
 460d4f4: 54000180     	b.eq	0x460d524 <_ChromeMain+0x4608288>
 460d4f8: f9403be0     	ldr	x0, [sp, #0x70]
 460d4fc: b5000540     	cbnz	x0, 0x460d5a4 <_ChromeMain+0x4608308>
 460d500: f94037e0     	ldr	x0, [sp, #0x68]
 460d504: b50003e0     	cbnz	x0, 0x460d580 <_ChromeMain+0x46082e4>
 460d508: f94033e0     	ldr	x0, [sp, #0x60]
 460d50c: b5000700     	cbnz	x0, 0x460d5ec <_ChromeMain+0x4608350>
 460d510: f9402fe0     	ldr	x0, [sp, #0x58]
 460d514: b50001a0     	cbnz	x0, 0x460d548 <_ChromeMain+0x46082ac>
 460d518: f9402be0     	ldr	x0, [sp, #0x50]
 460d51c: b5000560     	cbnz	x0, 0x460d5c8 <_ChromeMain+0x460832c>
 460d520: 17ffff60     	b	0x460d2a0 <_ChromeMain+0x4608004>
 460d524: b9802a68     	ldrsw	x8, [x19, #0x28]
 460d528: 35000748     	cbnz	w8, 0x460d610 <_ChromeMain+0x4608374>
 460d52c: 3940b268     	ldrb	w8, [x19, #0x2c]
 460d530: 37000f28     	tbnz	w8, #0x0, 0x460d714 <_ChromeMain+0x4608478>
 460d534: f9400a74     	ldr	x20, [x19, #0x10]
 460d538: b5001014     	cbnz	x20, 0x460d738 <_ChromeMain+0x460849c>
 460d53c: aa1303e0     	mov	x0, x19
 460d540: 96e81c4a     	bl	0x14668 <_ChromeMain+0xf3cc>
 460d544: 17ffffed     	b	0x460d4f8 <_ChromeMain+0x460825c>
 460d548: 91002008     	add	x8, x0, #0x8
 460d54c: 12800009     	mov	w9, #-0x1               ; =-1
 460d550: b8e90108     	ldaddal	w9, w8, [x8]
 460d554: 7100051f     	cmp	w8, #0x1
 460d558: 54fffe01     	b.ne	0x460d518 <_ChromeMain+0x460827c>
 460d55c: f9400009     	ldr	x9, [x0]
 460d560: f9400928     	ldr	x8, [x9, #0x10]
 460d564: 90fdd0ca     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 460d568: 9106014a     	add	x10, x10, #0x180
 460d56c: eb0a011f     	cmp	x8, x10
 460d570: 54000041     	b.ne	0x460d578 <_ChromeMain+0x46082dc>
 460d574: f9400528     	ldr	x8, [x9, #0x8]
 460d578: d63f0100     	blr	x8
 460d57c: 17ffffe7     	b	0x460d518 <_ChromeMain+0x460827c>
 460d580: 91002008     	add	x8, x0, #0x8
 460d584: 12800009     	mov	w9, #-0x1               ; =-1
 460d588: b8e90108     	ldaddal	w9, w8, [x8]
 460d58c: 7100051f     	cmp	w8, #0x1
 460d590: 54fffbc1     	b.ne	0x460d508 <_ChromeMain+0x460826c>
 460d594: f9400008     	ldr	x8, [x0]
 460d598: f9400908     	ldr	x8, [x8, #0x10]
 460d59c: d63f0100     	blr	x8
 460d5a0: 17ffffda     	b	0x460d508 <_ChromeMain+0x460826c>
 460d5a4: 91002008     	add	x8, x0, #0x8
 460d5a8: 12800009     	mov	w9, #-0x1               ; =-1
 460d5ac: b8e90108     	ldaddal	w9, w8, [x8]
 460d5b0: 7100051f     	cmp	w8, #0x1
 460d5b4: 54fffa61     	b.ne	0x460d500 <_ChromeMain+0x4608264>
 460d5b8: f9400008     	ldr	x8, [x0]
 460d5bc: f9400908     	ldr	x8, [x8, #0x10]
 460d5c0: d63f0100     	blr	x8
 460d5c4: 17ffffcf     	b	0x460d500 <_ChromeMain+0x4608264>
 460d5c8: 91002008     	add	x8, x0, #0x8
 460d5cc: 12800009     	mov	w9, #-0x1               ; =-1
 460d5d0: b8e90108     	ldaddal	w9, w8, [x8]
 460d5d4: 7100051f     	cmp	w8, #0x1
 460d5d8: 54ffe641     	b.ne	0x460d2a0 <_ChromeMain+0x4608004>
 460d5dc: f9400008     	ldr	x8, [x0]
 460d5e0: f9400908     	ldr	x8, [x8, #0x10]
 460d5e4: d63f0100     	blr	x8
 460d5e8: 17ffff2e     	b	0x460d2a0 <_ChromeMain+0x4608004>
 460d5ec: 91002008     	add	x8, x0, #0x8
 460d5f0: 12800009     	mov	w9, #-0x1               ; =-1
 460d5f4: b8e90108     	ldaddal	w9, w8, [x8]
 460d5f8: 7100051f     	cmp	w8, #0x1
 460d5fc: 54fff8a1     	b.ne	0x460d510 <_ChromeMain+0x4608274>
 460d600: f9400008     	ldr	x8, [x0]
 460d604: f9400908     	ldr	x8, [x8, #0x10]
 460d608: d63f0100     	blr	x8
 460d60c: 17ffffc1     	b	0x460d510 <_ChromeMain+0x4608274>
 460d610: f9401274     	ldr	x20, [x19, #0x20]
 460d614: d37df115     	lsl	x21, x8, #3
 460d618: f9400288     	ldr	x8, [x20]
 460d61c: 1940c108     	ldapurb	w8, [x8, #0xc]
 460d620: 370000a8     	tbnz	w8, #0x0, 0x460d634 <_ChromeMain+0x4608398>
 460d624: f9400280     	ldr	x0, [x20]
 460d628: f9400008     	ldr	x8, [x0]
 460d62c: f9400d08     	ldr	x8, [x8, #0x18]
 460d630: d63f0100     	blr	x8
 460d634: 91002294     	add	x20, x20, #0x8
 460d638: f10022b5     	subs	x21, x21, #0x8
 460d63c: 54fffee1     	b.ne	0x460d618 <_ChromeMain+0x460837c>
 460d640: b9802a68     	ldrsw	x8, [x19, #0x28]
 460d644: 34fff748     	cbz	w8, 0x460d52c <_ChromeMain+0x4608290>
 460d648: f9401274     	ldr	x20, [x19, #0x20]
 460d64c: 8b080e95     	add	x21, x20, x8, lsl #3
 460d650: 12800016     	mov	w22, #-0x1              ; =-1
 460d654: 14000007     	b	0x460d670 <_ChromeMain+0x46083d4>
 460d658: f9400008     	ldr	x8, [x0]
 460d65c: f9400908     	ldr	x8, [x8, #0x10]
 460d660: d63f0100     	blr	x8
 460d664: 91002294     	add	x20, x20, #0x8
 460d668: eb15029f     	cmp	x20, x21
 460d66c: 54fff602     	b.hs	0x460d52c <_ChromeMain+0x4608290>
 460d670: f9400280     	ldr	x0, [x20]
 460d674: b4ffff80     	cbz	x0, 0x460d664 <_ChromeMain+0x46083c8>
 460d678: 91002008     	add	x8, x0, #0x8
 460d67c: b8f60108     	ldaddal	w22, w8, [x8]
 460d680: 7100051f     	cmp	w8, #0x1
 460d684: 54ffff01     	b.ne	0x460d664 <_ChromeMain+0x46083c8>
 460d688: 17fffff4     	b	0x460d658 <_ChromeMain+0x46083bc>
 460d68c: a9005be0     	stp	x0, x22, [sp]
 460d690: f9401016     	ldr	x22, [x0, #0x20]
 460d694: d37df117     	lsl	x23, x8, #3
 460d698: f94002c8     	ldr	x8, [x22]
 460d69c: 1940c108     	ldapurb	w8, [x8, #0xc]
 460d6a0: 370000a8     	tbnz	w8, #0x0, 0x460d6b4 <_ChromeMain+0x4608418>
 460d6a4: f94002c0     	ldr	x0, [x22]
 460d6a8: f9400008     	ldr	x8, [x0]
 460d6ac: f9400d08     	ldr	x8, [x8, #0x18]
 460d6b0: d63f0100     	blr	x8
 460d6b4: 910022d6     	add	x22, x22, #0x8
 460d6b8: f10022f7     	subs	x23, x23, #0x8
 460d6bc: 54fffee1     	b.ne	0x460d698 <_ChromeMain+0x46083fc>
 460d6c0: a9405be0     	ldp	x0, x22, [sp]
 460d6c4: b9802808     	ldrsw	x8, [x0, #0x28]
 460d6c8: 34ffe848     	cbz	w8, 0x460d3d0 <_ChromeMain+0x4608134>
 460d6cc: f9401017     	ldr	x23, [x0, #0x20]
 460d6d0: 8b080ef8     	add	x24, x23, x8, lsl #3
 460d6d4: 12800019     	mov	w25, #-0x1              ; =-1
 460d6d8: 14000008     	b	0x460d6f8 <_ChromeMain+0x460845c>
 460d6dc: f9400008     	ldr	x8, [x0]
 460d6e0: f9400908     	ldr	x8, [x8, #0x10]
 460d6e4: d63f0100     	blr	x8
 460d6e8: 910022f7     	add	x23, x23, #0x8
 460d6ec: eb1802ff     	cmp	x23, x24
 460d6f0: a9405be0     	ldp	x0, x22, [sp]
 460d6f4: 54ffe6e2     	b.hs	0x460d3d0 <_ChromeMain+0x4608134>
 460d6f8: f94002e0     	ldr	x0, [x23]
 460d6fc: b4ffff60     	cbz	x0, 0x460d6e8 <_ChromeMain+0x460844c>
 460d700: 91002008     	add	x8, x0, #0x8
 460d704: b8f90108     	ldaddal	w25, w8, [x8]
 460d708: 7100051f     	cmp	w8, #0x1
 460d70c: 54fffee1     	b.ne	0x460d6e8 <_ChromeMain+0x460844c>
 460d710: 17fffff3     	b	0x460d6dc <_ChromeMain+0x4608440>
 460d714: f9401260     	ldr	x0, [x19, #0x20]
 460d718: 96ea5437     	bl	0xa27f4 <_ChromeMain+0x9d558>
 460d71c: 17ffff86     	b	0x460d534 <_ChromeMain+0x4608298>
 460d720: f9401008     	ldr	x8, [x0, #0x20]
 460d724: aa0003f7     	mov	x23, x0
 460d728: aa0803e0     	mov	x0, x8
 460d72c: 96ea5432     	bl	0xa27f4 <_ChromeMain+0x9d558>
 460d730: aa1703e0     	mov	x0, x23
 460d734: 17ffff29     	b	0x460d3d8 <_ChromeMain+0x460813c>
 460d738: f9400280     	ldr	x0, [x20]
 460d73c: 94e87ba1     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 460d740: aa1403e0     	mov	x0, x20
 460d744: 52800101     	mov	w1, #0x8                ; =8
 460d748: 96e7eddc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460d74c: 17ffff7c     	b	0x460d53c <_ChromeMain+0x46082a0>
 460d750: f9400128     	ldr	x8, [x9]
 460d754: aa0003f7     	mov	x23, x0
 460d758: aa0803e0     	mov	x0, x8
 460d75c: aa1603f8     	mov	x24, x22
 460d760: aa0903f6     	mov	x22, x9
 460d764: 94e87b97     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 460d768: aa1603e0     	mov	x0, x22
 460d76c: aa1803f6     	mov	x22, x24
 460d770: 52800101     	mov	w1, #0x8                ; =8
 460d774: 96e7edd1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460d778: aa1703e0     	mov	x0, x23
 460d77c: 17ffff19     	b	0x460d3e0 <_ChromeMain+0x4608144>
