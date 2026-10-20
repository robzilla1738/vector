
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4608318: d10443ff     	sub	sp, sp, #0x110
 460831c: a90c6ffc     	stp	x28, x27, [sp, #0xc0]
 4608320: a90d5ff8     	stp	x24, x23, [sp, #0xd0]
 4608324: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 4608328: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 460832c: a9107bfd     	stp	x29, x30, [sp, #0x100]
 4608330: 910403fd     	add	x29, sp, #0x100
 4608334: aa0103f3     	mov	x19, x1
 4608338: aa0003f4     	mov	x20, x0
 460833c: 39555008     	ldrb	w8, [x0, #0x554]
 4608340: 34000a88     	cbz	w8, 0x4608490 <_ChromeMain+0x46031f4>
 4608344: 39558288     	ldrb	w8, [x20, #0x560]
 4608348: 34000a48     	cbz	w8, 0x4608490 <_ChromeMain+0x46031f4>
 460834c: aa1403e0     	mov	x0, x20
 4608350: 96fe6328     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4608354: b40009e0     	cbz	x0, 0x4608490 <_ChromeMain+0x46031f4>
 4608358: 6f00e400     	movi.2d	v0, #0000000000000000
 460835c: 3c8483e0     	stur	q0, [sp, #0x48]
 4608360: 3c8583e0     	stur	q0, [sp, #0x58]
 4608364: f90037ff     	str	xzr, [sp, #0x68]
 4608368: d2806828     	mov	x8, #0x341              ; =833
 460836c: f2f7f008     	movk	x8, #0xbf80, lsl #48
 4608370: d2a7f009     	mov	x9, #0x3f800000         ; =1065353216
 4608374: f2e81009     	movk	x9, #0x4080, lsl #48
 4608378: a903a3e9     	stp	x9, x8, [sp, #0x38]
 460837c: 52801b01     	mov	w1, #0xd8               ; =216
 4608380: 97247f92     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4608384: 971f1a79     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4608388: 2d0507e0     	stp	s0, s1, [sp, #0x28]
 460838c: 2d060fe2     	stp	s2, s3, [sp, #0x30]
 4608390: 39558288     	ldrb	w8, [x20, #0x560]
 4608394: 36000be8     	tbz	w8, #0x0, 0x4608510 <_ChromeMain+0x4603274>
 4608398: 910203f5     	add	x21, sp, #0x80
 460839c: f942ae81     	ldr	x1, [x20, #0x558]
 46083a0: aa1403e0     	mov	x0, x20
 46083a4: 97ffffa3     	bl	0x4608230 <_ChromeMain+0x4602f94>
 46083a8: 1e220000     	scvtf	s0, w0
 46083ac: d360fc08     	lsr	x8, x0, #32
 46083b0: 1e220101     	scvtf	s1, w8
 46083b4: 2d0307e0     	stp	s0, s1, [sp, #0x18]
 46083b8: 4e080c20     	dup.2d	v0, x1
 46083bc: d004c988     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 46083c0: 3dc01101     	ldr	q1, [x8, #0x40]
 46083c4: 6ee14400     	ushl.2d	v0, v0, v1
 46083c8: 0ea12800     	xtn.2s	v0, v0
 46083cc: 6f00e401     	movi.2d	v1, #0000000000000000
 46083d0: 0ea16400     	smax.2s	v0, v0, v1
 46083d4: 2e21d800     	ucvtf.2s	v0, v0
 46083d8: fd0013e0     	str	d0, [sp, #0x20]
 46083dc: 4f0167e0     	movi.4s	v0, #0x3f, lsl #24
 46083e0: 3d8023e0     	str	q0, [sp, #0x80]
 46083e4: 910063e0     	add	x0, sp, #0x18
 46083e8: 910203e1     	add	x1, sp, #0x80
 46083ec: 96e84f45     	bl	0x1c100 <_ChromeMain+0x16e64>
 46083f0: 910063e0     	add	x0, sp, #0x18
 46083f4: 97450820     	bl	0x174a474 <_ChromeMain+0x17451d8>
 46083f8: 2d0e07e0     	stp	s0, s1, [sp, #0x70]
 46083fc: 2d0f0fe2     	stp	s2, s3, [sp, #0x78]
 4608400: 6f00e400     	movi.2d	v0, #0000000000000000
 4608404: 3d8023e0     	str	q0, [sp, #0x80]
 4608408: ad0082a0     	stp	q0, q0, [x21, #0x10]
 460840c: b900b3ff     	str	wzr, [sp, #0xb0]
 4608410: 910203e0     	add	x0, sp, #0x80
 4608414: 9101c3e1     	add	x1, sp, #0x70
 4608418: 1e249000     	fmov	s0, #10.00000000
 460841c: 1e249001     	fmov	s1, #10.00000000
 4608420: 970b8378     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 4608424: 910023e8     	add	x8, sp, #0x8
 4608428: 910203e0     	add	x0, sp, #0x80
 460842c: 52800001     	mov	w1, #0x0                ; =0
 4608430: 970ad828     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 4608434: f9406260     	ldr	x0, [x19, #0xc0]
 4608438: f9400008     	ldr	x8, [x0]
 460843c: f9408908     	ldr	x8, [x8, #0x110]
 4608440: 910023e1     	add	x1, sp, #0x8
 4608444: 9100a3e2     	add	x2, sp, #0x28
 4608448: 52800023     	mov	w3, #0x1                ; =1
 460844c: d63f0100     	blr	x8
 4608450: f94007e0     	ldr	x0, [sp, #0x8]
 4608454: b40000a0     	cbz	x0, 0x4608468 <_ChromeMain+0x46031cc>
 4608458: 12800008     	mov	w8, #-0x1               ; =-1
 460845c: b8e80008     	ldaddal	w8, w8, [x0]
 4608460: 7100051f     	cmp	w8, #0x1
 4608464: 540002a0     	b.eq	0x46084b8 <_ChromeMain+0x460321c>
 4608468: f94037e0     	ldr	x0, [sp, #0x68]
 460846c: b5000660     	cbnz	x0, 0x4608538 <_ChromeMain+0x460329c>
 4608470: f94033e0     	ldr	x0, [sp, #0x60]
 4608474: b5000500     	cbnz	x0, 0x4608514 <_ChromeMain+0x4603278>
 4608478: f9402fe0     	ldr	x0, [sp, #0x58]
 460847c: b5000820     	cbnz	x0, 0x4608580 <_ChromeMain+0x46032e4>
 4608480: f9402be0     	ldr	x0, [sp, #0x50]
 4608484: b50002a0     	cbnz	x0, 0x46084d8 <_ChromeMain+0x460323c>
 4608488: f94027e0     	ldr	x0, [sp, #0x48]
 460848c: b5000680     	cbnz	x0, 0x460855c <_ChromeMain+0x46032c0>
 4608490: aa1403e0     	mov	x0, x20
 4608494: aa1303e1     	mov	x1, x19
 4608498: 970d80db     	bl	0x968804 <_ChromeMain+0x963568>
 460849c: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 46084a0: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 46084a4: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 46084a8: a94d5ff8     	ldp	x24, x23, [sp, #0xd0]
 46084ac: a94c6ffc     	ldp	x28, x27, [sp, #0xc0]
 46084b0: 910443ff     	add	sp, sp, #0x110
 46084b4: d65f03c0     	ret
 46084b8: b9802808     	ldrsw	x8, [x0, #0x28]
 46084bc: 35000748     	cbnz	w8, 0x46085a4 <_ChromeMain+0x4603308>
 46084c0: 3940b008     	ldrb	w8, [x0, #0x2c]
 46084c4: 37000b48     	tbnz	w8, #0x0, 0x460862c <_ChromeMain+0x4603390>
 46084c8: f9400815     	ldr	x21, [x0, #0x10]
 46084cc: b5000bd5     	cbnz	x21, 0x4608644 <_ChromeMain+0x46033a8>
 46084d0: 96e83066     	bl	0x14668 <_ChromeMain+0xf3cc>
 46084d4: 17ffffe5     	b	0x4608468 <_ChromeMain+0x46031cc>
 46084d8: 91002008     	add	x8, x0, #0x8
 46084dc: 12800009     	mov	w9, #-0x1               ; =-1
 46084e0: b8e90108     	ldaddal	w9, w8, [x8]
 46084e4: 7100051f     	cmp	w8, #0x1
 46084e8: 54fffd01     	b.ne	0x4608488 <_ChromeMain+0x46031ec>
 46084ec: f9400009     	ldr	x9, [x0]
 46084f0: f9400928     	ldr	x8, [x9, #0x10]
 46084f4: b0fdd0ea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46084f8: 9106014a     	add	x10, x10, #0x180
 46084fc: eb0a011f     	cmp	x8, x10
 4608500: 54000041     	b.ne	0x4608508 <_ChromeMain+0x460326c>
 4608504: f9400528     	ldr	x8, [x9, #0x8]
 4608508: d63f0100     	blr	x8
 460850c: 17ffffdf     	b	0x4608488 <_ChromeMain+0x46031ec>
 4608510: d4200020     	brk	#0x1
 4608514: 91002008     	add	x8, x0, #0x8
 4608518: 12800009     	mov	w9, #-0x1               ; =-1
 460851c: b8e90108     	ldaddal	w9, w8, [x8]
 4608520: 7100051f     	cmp	w8, #0x1
 4608524: 54fffaa1     	b.ne	0x4608478 <_ChromeMain+0x46031dc>
 4608528: f9400008     	ldr	x8, [x0]
 460852c: f9400908     	ldr	x8, [x8, #0x10]
 4608530: d63f0100     	blr	x8
 4608534: 17ffffd1     	b	0x4608478 <_ChromeMain+0x46031dc>
 4608538: 91002008     	add	x8, x0, #0x8
 460853c: 12800009     	mov	w9, #-0x1               ; =-1
 4608540: b8e90108     	ldaddal	w9, w8, [x8]
 4608544: 7100051f     	cmp	w8, #0x1
 4608548: 54fff941     	b.ne	0x4608470 <_ChromeMain+0x46031d4>
 460854c: f9400008     	ldr	x8, [x0]
 4608550: f9400908     	ldr	x8, [x8, #0x10]
 4608554: d63f0100     	blr	x8
 4608558: 17ffffc6     	b	0x4608470 <_ChromeMain+0x46031d4>
 460855c: 91002008     	add	x8, x0, #0x8
 4608560: 12800009     	mov	w9, #-0x1               ; =-1
 4608564: b8e90108     	ldaddal	w9, w8, [x8]
 4608568: 7100051f     	cmp	w8, #0x1
 460856c: 54fff921     	b.ne	0x4608490 <_ChromeMain+0x46031f4>
 4608570: f9400008     	ldr	x8, [x0]
 4608574: f9400908     	ldr	x8, [x8, #0x10]
 4608578: d63f0100     	blr	x8
 460857c: 17ffffc5     	b	0x4608490 <_ChromeMain+0x46031f4>
 4608580: 91002008     	add	x8, x0, #0x8
 4608584: 12800009     	mov	w9, #-0x1               ; =-1
 4608588: b8e90108     	ldaddal	w9, w8, [x8]
 460858c: 7100051f     	cmp	w8, #0x1
 4608590: 54fff781     	b.ne	0x4608480 <_ChromeMain+0x46031e4>
 4608594: f9400008     	ldr	x8, [x0]
 4608598: f9400908     	ldr	x8, [x8, #0x10]
 460859c: d63f0100     	blr	x8
 46085a0: 17ffffb8     	b	0x4608480 <_ChromeMain+0x46031e4>
 46085a4: aa0003f5     	mov	x21, x0
 46085a8: f9401016     	ldr	x22, [x0, #0x20]
 46085ac: d37df117     	lsl	x23, x8, #3
 46085b0: f94002c8     	ldr	x8, [x22]
 46085b4: 1940c108     	ldapurb	w8, [x8, #0xc]
 46085b8: 370000a8     	tbnz	w8, #0x0, 0x46085cc <_ChromeMain+0x4603330>
 46085bc: f94002c0     	ldr	x0, [x22]
 46085c0: f9400008     	ldr	x8, [x0]
 46085c4: f9400d08     	ldr	x8, [x8, #0x18]
 46085c8: d63f0100     	blr	x8
 46085cc: 910022d6     	add	x22, x22, #0x8
 46085d0: f10022f7     	subs	x23, x23, #0x8
 46085d4: 54fffee1     	b.ne	0x46085b0 <_ChromeMain+0x4603314>
 46085d8: aa1503e0     	mov	x0, x21
 46085dc: b9802aa8     	ldrsw	x8, [x21, #0x28]
 46085e0: 34fff708     	cbz	w8, 0x46084c0 <_ChromeMain+0x4603224>
 46085e4: f9401016     	ldr	x22, [x0, #0x20]
 46085e8: 8b080ed7     	add	x23, x22, x8, lsl #3
 46085ec: 12800018     	mov	w24, #-0x1              ; =-1
 46085f0: 14000008     	b	0x4608610 <_ChromeMain+0x4603374>
 46085f4: f9400008     	ldr	x8, [x0]
 46085f8: f9400908     	ldr	x8, [x8, #0x10]
 46085fc: d63f0100     	blr	x8
 4608600: 910022d6     	add	x22, x22, #0x8
 4608604: eb1702df     	cmp	x22, x23
 4608608: aa1503e0     	mov	x0, x21
 460860c: 54fff5a2     	b.hs	0x46084c0 <_ChromeMain+0x4603224>
 4608610: f94002c0     	ldr	x0, [x22]
 4608614: b4ffff60     	cbz	x0, 0x4608600 <_ChromeMain+0x4603364>
 4608618: 91002008     	add	x8, x0, #0x8
 460861c: b8f80108     	ldaddal	w24, w8, [x8]
 4608620: 7100051f     	cmp	w8, #0x1
 4608624: 54fffee1     	b.ne	0x4608600 <_ChromeMain+0x4603364>
 4608628: 17fffff3     	b	0x46085f4 <_ChromeMain+0x4603358>
 460862c: f9401008     	ldr	x8, [x0, #0x20]
 4608630: aa0003f5     	mov	x21, x0
 4608634: aa0803e0     	mov	x0, x8
 4608638: 96ea686f     	bl	0xa27f4 <_ChromeMain+0x9d558>
 460863c: aa1503e0     	mov	x0, x21
 4608640: 17ffffa2     	b	0x46084c8 <_ChromeMain+0x460322c>
 4608644: f94002a8     	ldr	x8, [x21]
 4608648: aa0003f6     	mov	x22, x0
 460864c: aa0803e0     	mov	x0, x8
 4608650: 94e88fdc     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 4608654: aa1503e0     	mov	x0, x21
 4608658: 52800101     	mov	w1, #0x8                ; =8
 460865c: 96e80217     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4608660: aa1603e0     	mov	x0, x22
 4608664: 17ffff9b     	b	0x46084d0 <_ChromeMain+0x4603234>
