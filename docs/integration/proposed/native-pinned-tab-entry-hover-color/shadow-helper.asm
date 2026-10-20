
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41271b0: a9bb6ffc     	stp	x28, x27, [sp, #-0x50]!
 41271b4: a9015ff8     	stp	x24, x23, [sp, #0x10]
 41271b8: a90257f6     	stp	x22, x21, [sp, #0x20]
 41271bc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41271c0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41271c4: 910103fd     	add	x29, sp, #0x40
 41271c8: d10883ff     	sub	sp, sp, #0x220
 41271cc: aa0203f4     	mov	x20, x2
 41271d0: aa0103f5     	mov	x21, x1
 41271d4: aa0003f3     	mov	x19, x0
 41271d8: b004f808     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 41271dc: f940f908     	ldr	x8, [x8, #0x1f0]
 41271e0: f9400108     	ldr	x8, [x8]
 41271e4: f81b83a8     	stur	x8, [x29, #-0x48]
 41271e8: aa0103e0     	mov	x0, x1
 41271ec: 974722aa     	bl	0x12efc94 <_ChromeMain+0x12ea9f8>
 41271f0: 1e341004     	fmov	s4, #-8.00000000
 41271f4: 1e242800     	fadd	s0, s0, s4
 41271f8: 1e242821     	fadd	s1, s1, s4
 41271fc: 2d0c07e0     	stp	s0, s1, [sp, #0x60]
 4127200: 1e241000     	fmov	s0, #8.00000000
 4127204: 1e202841     	fadd	s1, s2, s0
 4127208: 1e202860     	fadd	s0, s3, s0
 412720c: 2d0d03e1     	stp	s1, s0, [sp, #0x68]
 4127210: f9010bff     	str	xzr, [sp, #0x210]
 4127214: 6f00e400     	movi.2d	v0, #0000000000000000
 4127218: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 412721c: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 4127220: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4127224: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 4127228: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 412722c: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 4127230: ad0983e0     	stp	q0, q0, [sp, #0x130]
 4127234: ad0883e0     	stp	q0, q0, [sp, #0x110]
 4127238: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 412723c: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4127240: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4127244: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4127248: ad0383e0     	stp	q0, q0, [sp, #0x70]
 412724c: 9101c3e0     	add	x0, sp, #0x70
 4127250: 52800021     	mov	w1, #0x1                ; =1
 4127254: 9735772a     	bl	0xe84efc <_ChromeMain+0xe7fc60>
 4127258: 9101c3e0     	add	x0, sp, #0x70
 412725c: 910183e1     	add	x1, sp, #0x60
 4127260: 52800002     	mov	w2, #0x0                ; =0
 4127264: 52800003     	mov	w3, #0x0                ; =0
 4127268: 9735781e     	bl	0xe852e0 <_ChromeMain+0xe80044>
 412726c: b0055282     	adrp	x2, 0xeb78000 <dyld_stub_binder+0xeb78000>
 4127270: 912c6042     	add	x2, x2, #0xb18
 4127274: 9101c3e0     	add	x0, sp, #0x70
 4127278: aa1503e1     	mov	x1, x21
 412727c: 52800003     	mov	w3, #0x0                ; =0
 4127280: 94310f1c     	bl	0x4d6aef0 <_ChromeMain+0x4d65c54>
 4127284: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4127288: f0055457     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 412728c: f94046e9     	ldr	x9, [x23, #0x88]
 4127290: eb09011f     	cmp	x8, x9
 4127294: 540019c0     	b.eq	0x41275cc <_ChromeMain+0x4122330>
 4127298: b4000473     	cbz	x19, 0x4127324 <_ChromeMain+0x4122088>
 412729c: f9406276     	ldr	x22, [x19, #0xc0]
 41272a0: f94002c8     	ldr	x8, [x22]
 41272a4: f9401508     	ldr	x8, [x8, #0x28]
 41272a8: d0fe5bc9     	adrp	x9, 0xca1000 <_ChromeMain+0xc9bd64>
 41272ac: 911a2129     	add	x9, x9, #0x688
 41272b0: eb09011f     	cmp	x8, x9
 41272b4: 54001221     	b.ne	0x41274f8 <_ChromeMain+0x412225c>
 41272b8: 395d02c8     	ldrb	w8, [x22, #0x740]
 41272bc: 350013c8     	cbnz	w8, 0x4127534 <_ChromeMain+0x4122298>
 41272c0: a94326ca     	ldp	x10, x9, [x22, #0x30]
 41272c4: 91002128     	add	x8, x9, #0x8
 41272c8: eb0a011f     	cmp	x8, x10
 41272cc: 54001648     	b.hi	0x4127594 <_ChromeMain+0x41222f8>
 41272d0: eb09014a     	subs	x10, x10, x9
 41272d4: 54001703     	b.lo	0x41275b4 <_ChromeMain+0x4122318>
 41272d8: f1001d5f     	cmp	x10, #0x7
 41272dc: 540016c9     	b.ls	0x41275b4 <_ChromeMain+0x4122318>
 41272e0: f94016ca     	ldr	x10, [x22, #0x28]
 41272e4: 8b090140     	add	x0, x10, x9
 41272e8: f94022c9     	ldr	x9, [x22, #0x40]
 41272ec: 91000529     	add	x9, x9, #0x1
 41272f0: a903a6c8     	stp	x8, x9, [x22, #0x38]
 41272f4: 52800388     	mov	w8, #0x1c               ; =28
 41272f8: 39000008     	strb	w8, [x0]
 41272fc: b94062c8     	ldr	w8, [x22, #0x60]
 4127300: 11000508     	add	w8, w8, #0x1
 4127304: b90062c8     	str	w8, [x22, #0x60]
 4127308: b946d2c8     	ldr	w8, [x22, #0x6d0]
 412730c: 11000508     	add	w8, w8, #0x1
 4127310: b906d2c8     	str	w8, [x22, #0x6d0]
 4127314: f9435ac8     	ldr	x8, [x22, #0x6b0]
 4127318: b9405909     	ldr	w9, [x8, #0x58]
 412731c: 11000529     	add	w9, w9, #0x1
 4127320: b9005909     	str	w9, [x8, #0x58]
 4127324: f9406260     	ldr	x0, [x19, #0xc0]
 4127328: f9400008     	ldr	x8, [x0]
 412732c: f9405508     	ldr	x8, [x8, #0xa8]
 4127330: 52800036     	mov	w22, #0x1               ; =1
 4127334: aa1503e1     	mov	x1, x21
 4127338: 52800022     	mov	w2, #0x1                ; =1
 412733c: 52800023     	mov	w3, #0x1                ; =1
 4127340: 52800024     	mov	w4, #0x1                ; =1
 4127344: d63f0100     	blr	x8
 4127348: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 412734c: 6f00e400     	movi.2d	v0, #0000000000000000
 4127350: 3c8383e0     	stur	q0, [sp, #0x38]
 4127354: 3c8483e0     	stur	q0, [sp, #0x48]
 4127358: f9002fff     	str	xzr, [sp, #0x58]
 412735c: d2806029     	mov	x9, #0x301              ; =769
 4127360: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4127364: a902a7e8     	stp	x8, x9, [sp, #0x28]
 4127368: aa1403e0     	mov	x0, x20
 412736c: 97329e7f     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4127370: 2d0307e0     	stp	s0, s1, [sp, #0x18]
 4127374: 2d040fe2     	stp	s2, s3, [sp, #0x20]
 4127378: 52800300     	mov	w0, #0x18               ; =24
 412737c: 96fb9ffb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4127380: f90003e0     	str	x0, [sp]
 4127384: d2c00068     	mov	x8, #0x300000000        ; =12884901888
 4127388: d2e80289     	mov	x9, #0x4014000000000000 ; =4617315517961601024
 412738c: a9002408     	stp	x8, x9, [x0]
 4127390: b9001014     	str	w20, [x0, #0x10]
 4127394: 3900501f     	strb	wzr, [x0, #0x14]
 4127398: 4e080ec0     	dup.2d	v0, x22
 412739c: 3c8083e0     	stur	q0, [sp, #0x8]
 41273a0: 910003e0     	mov	x0, sp
 41273a4: 975225c2     	bl	0x15b0aac <_ChromeMain+0x15ab810>
 41273a8: aa0003e8     	mov	x8, x0
 41273ac: f9402be0     	ldr	x0, [sp, #0x50]
 41273b0: f9002be8     	str	x8, [sp, #0x50]
 41273b4: b4000120     	cbz	x0, 0x41273d8 <_ChromeMain+0x412213c>
 41273b8: 91002008     	add	x8, x0, #0x8
 41273bc: 12800009     	mov	w9, #-0x1               ; =-1
 41273c0: b8e90108     	ldaddal	w9, w8, [x8]
 41273c4: 7100051f     	cmp	w8, #0x1
 41273c8: 54000081     	b.ne	0x41273d8 <_ChromeMain+0x412213c>
 41273cc: f9400008     	ldr	x8, [x0]
 41273d0: f9400908     	ldr	x8, [x8, #0x10]
 41273d4: d63f0100     	blr	x8
 41273d8: f94003e0     	ldr	x0, [sp]
 41273dc: b5000b00     	cbnz	x0, 0x412753c <_ChromeMain+0x41222a0>
