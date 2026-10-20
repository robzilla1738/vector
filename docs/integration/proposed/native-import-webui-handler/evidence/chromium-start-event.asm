
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 80cc4d8: d10483ff     	sub	sp, sp, #0x120
 80cc4dc: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 80cc4e0: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 80cc4e4: a9104ff4     	stp	x20, x19, [sp, #0x100]
 80cc4e8: a9117bfd     	stp	x29, x30, [sp, #0x110]
 80cc4ec: 910443fd     	add	x29, sp, #0x110
 80cc4f0: aa0103f3     	mov	x19, x1
 80cc4f4: aa0003f4     	mov	x20, x0
 80cc4f8: d10203b6     	sub	x22, x29, #0x80
 80cc4fc: 9002fae8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 80cc500: f940f908     	ldr	x8, [x8, #0x1f0]
 80cc504: f9400108     	ldr	x8, [x8]
 80cc508: f81c83a8     	stur	x8, [x29, #-0x38]
 80cc50c: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 80cc510: f90047ff     	str	xzr, [sp, #0x88]
 80cc514: b9400020     	ldr	w0, [x1]
 80cc518: 9101e3f7     	add	x23, sp, #0x78
 80cc51c: 9101e3e8     	add	x8, sp, #0x78
 80cc520: 97060d0e     	bl	0x424f958 <_ChromeMain+0x424a6bc>
 80cc524: f9400695     	ldr	x21, [x20, #0x8]
 80cc528: f002d281     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 80cc52c: 91054021     	add	x1, x1, #0x150
 80cc530: 910103e0     	add	x0, sp, #0x40
 80cc534: 96a2966b     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 80cc538: 910183e0     	add	x0, sp, #0x60
 80cc53c: 910103e1     	add	x1, sp, #0x40
 80cc540: 967f4dbc     	bl	0x209fc30 <_ChromeMain+0x209a994>
 80cc544: 39823fe8     	ldrsb	x8, [sp, #0x8f]
 80cc548: a947abe9     	ldp	x9, x10, [sp, #0x78]
 80cc54c: f100011f     	cmp	x8, #0x0
 80cc550: 9a974121     	csel	x1, x9, x23, mi
 80cc554: 7100011f     	cmp	w8, #0x0
 80cc558: 9a884142     	csel	x2, x10, x8, mi
 80cc55c: 910083e0     	add	x0, sp, #0x20
 80cc560: 962c4588     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 80cc564: 39807e62     	ldrsb	x2, [x19, #0x1f]
 80cc568: b7f80222     	tbnz	x2, #0x3f, 0x80cc5ac <_ChromeMain+0x80c7310>
 80cc56c: 91002261     	add	x1, x19, #0x8
 80cc570: 14000010     	b	0x80cc5b0 <_ChromeMain+0x80c7314>
 80cc574: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 80cc578: 36f805a8     	tbz	w8, #0x1f, 0x80cc62c <_ChromeMain+0x80c7390>
 80cc57c: f94003e0     	ldr	x0, [sp]
 80cc580: f9400be8     	ldr	x8, [sp, #0x10]
 80cc584: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 80cc588: 952ad8aa     	bl	0xcb82830 <_ChromeMain+0xcb7d594>
 80cc58c: 14000028     	b	0x80cc62c <_ChromeMain+0x80c7390>
 80cc590: 7100111f     	cmp	w8, #0x4
 80cc594: 54ffff00     	b.eq	0x80cc574 <_ChromeMain+0x80c72d8>
 80cc598: f8685aa8     	ldr	x8, [x21, w8, uxtw #3]
 80cc59c: d10203a0     	sub	x0, x29, #0x80
 80cc5a0: 910003e1     	mov	x1, sp
 80cc5a4: d63f0100     	blr	x8
 80cc5a8: 14000021     	b	0x80cc62c <_ChromeMain+0x80c7390>
 80cc5ac: a9408a61     	ldp	x1, x2, [x19, #0x8]
 80cc5b0: 910003e0     	mov	x0, sp
 80cc5b4: 962c4573     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 80cc5b8: d10203b7     	sub	x23, x29, #0x80
 80cc5bc: 6f00e400     	movi.2d	v0, #0000000000000000
 80cc5c0: 3c8382c0     	stur	q0, [x22, #0x38]
 80cc5c4: 3c8282c0     	stur	q0, [x22, #0x28]
 80cc5c8: 3c8182c0     	stur	q0, [x22, #0x18]
 80cc5cc: 3dc01be0     	ldr	q0, [sp, #0x60]
 80cc5d0: 3c9803a0     	stur	q0, [x29, #-0x80]
 80cc5d4: f9403be8     	ldr	x8, [sp, #0x70]
 80cc5d8: f81903a8     	stur	x8, [x29, #-0x70]
 80cc5dc: 910062e0     	add	x0, x23, #0x18
 80cc5e0: 910083e1     	add	x1, sp, #0x20
 80cc5e4: 967f4d93     	bl	0x209fc30 <_ChromeMain+0x209a994>
 80cc5e8: 9100c2e0     	add	x0, x23, #0x30
 80cc5ec: 910003e1     	mov	x1, sp
 80cc5f0: 967f4d90     	bl	0x209fc30 <_ChromeMain+0x209a994>
 80cc5f4: d002c581     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 80cc5f8: 911e5021     	add	x1, x1, #0x794
 80cc5fc: d10203a3     	sub	x3, x29, #0x80
 80cc600: aa1503e0     	mov	x0, x21
 80cc604: 52800302     	mov	w2, #0x18               ; =24
 80cc608: 52800064     	mov	w4, #0x3                ; =3
 80cc60c: 97a39852     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 80cc610: 394063e8     	ldrb	w8, [sp, #0x18]
 80cc614: b0033fb5     	adrp	x21, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 80cc618: 9121e2b5     	add	x21, x21, #0x878
 80cc61c: 7103fd1f     	cmp	w8, #0xff
 80cc620: 54000060     	b.eq	0x80cc62c <_ChromeMain+0x80c7390>
 80cc624: 721e791f     	tst	w8, #0xfffffffd
 80cc628: 54fffb41     	b.ne	0x80cc590 <_ChromeMain+0x80c72f4>
 80cc62c: 3940e3e8     	ldrb	w8, [sp, #0x38]
 80cc630: 7103fd1f     	cmp	w8, #0xff
 80cc634: 54000060     	b.eq	0x80cc640 <_ChromeMain+0x80c73a4>
 80cc638: 721e791f     	tst	w8, #0xfffffffd
 80cc63c: 54000821     	b.ne	0x80cc740 <_ChromeMain+0x80c74a4>
 80cc640: 394163e8     	ldrb	w8, [sp, #0x58]
 80cc644: 7103fd1f     	cmp	w8, #0xff
 80cc648: 54000060     	b.eq	0x80cc654 <_ChromeMain+0x80c73b8>
 80cc64c: 721e791f     	tst	w8, #0xfffffffd
 80cc650: 540006a1     	b.ne	0x80cc724 <_ChromeMain+0x80c7488>
 80cc654: f9400a95     	ldr	x21, [x20, #0x10]
 80cc658: b4000435     	cbz	x21, 0x80cc6dc <_ChromeMain+0x80c7440>
 80cc65c: b9402a96     	ldr	w22, [x20, #0x28]
 80cc660: f9401a97     	ldr	x23, [x20, #0x30]
 80cc664: b40000d7     	cbz	x23, 0x80cc67c <_ChromeMain+0x80c73e0>
 80cc668: 52800028     	mov	w8, #0x1                ; =1
 80cc66c: b82802e8     	ldadd	w8, w8, [x23]
 80cc670: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 80cc674: 6b09011f     	cmp	w8, w9
 80cc678: 54000900     	b.eq	0x80cc798 <_ChromeMain+0x80c74fc>
 80cc67c: f9401e94     	ldr	x20, [x20, #0x38]
 80cc680: 52800900     	mov	w0, #0x48               ; =72
 80cc684: 952ad86e     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 80cc688: aa0003e3     	mov	x3, x0
 80cc68c: 52800028     	mov	w8, #0x1                ; =1
 80cc690: b9000008     	str	w8, [x0]
 80cc694: f0fdfba8     	adrp	x8, 0x4043000 <_ChromeMain+0x403dd64>
 80cc698: 913d0108     	add	x8, x8, #0xf40
 80cc69c: 90fdf509     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 80cc6a0: 91250129     	add	x9, x9, #0x940
 80cc6a4: a900a408     	stp	x8, x9, [x0, #0x8]
 80cc6a8: d0fdff08     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 80cc6ac: 911b0108     	add	x8, x8, #0x6c0
 80cc6b0: f0fe0c09     	adrp	x9, 0x424f000 <_ChromeMain+0x4249d64>
 80cc6b4: 912d8129     	add	x9, x9, #0xb60
 80cc6b8: a901a408     	stp	x8, x9, [x0, #0x18]
 80cc6bc: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 80cc6c0: f9001c14     	str	x20, [x0, #0x38]
 80cc6c4: b9400268     	ldr	w8, [x19]
 80cc6c8: b9004008     	str	w8, [x0, #0x40]
 80cc6cc: aa1503e0     	mov	x0, x21
 80cc6d0: aa1303e1     	mov	x1, x19
 80cc6d4: aa1603e2     	mov	x2, x22
 80cc6d8: 97061a7a     	bl	0x42530c0 <_ChromeMain+0x424de24>
 80cc6dc: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 80cc6e0: 36f800a8     	tbz	w8, #0x1f, 0x80cc6f4 <_ChromeMain+0x80c7458>
 80cc6e4: f9403fe0     	ldr	x0, [sp, #0x78]
 80cc6e8: f94047e8     	ldr	x8, [sp, #0x88]
 80cc6ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 80cc6f0: 952ad850     	bl	0xcb82830 <_ChromeMain+0xcb7d594>
 80cc6f4: f85c83a8     	ldur	x8, [x29, #-0x38]
