
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4264450: d10243ff     	sub	sp, sp, #0x90
 4264454: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4264458: a90657f6     	stp	x22, x21, [sp, #0x60]
 426445c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4264460: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4264464: 910203fd     	add	x29, sp, #0x80
 4264468: aa0003f3     	mov	x19, x0
 426446c: 3900b01f     	strb	wzr, [x0, #0x2c]
 4264470: f9401000     	ldr	x0, [x0, #0x20]
 4264474: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4264478: d0054a69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 426447c: f9404529     	ldr	x9, [x9, #0x88]
 4264480: eb09011f     	cmp	x8, x9
 4264484: 54000041     	b.ne	0x426448c <_ChromeMain+0x425f1f0>
 4264488: 96f6f96d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 426448c: f900127f     	str	xzr, [x19, #0x20]
 4264490: f9400a60     	ldr	x0, [x19, #0x10]
 4264494: f9000a7f     	str	xzr, [x19, #0x10]
 4264498: b5000580     	cbnz	x0, 0x4264548 <_ChromeMain+0x425f2ac>
 426449c: 3941c268     	ldrb	w8, [x19, #0x70]
 42644a0: 34001088     	cbz	w8, 0x42646b0 <_ChromeMain+0x425f414>
 42644a4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 42644a8: f9400660     	ldr	x0, [x19, #0x8]
 42644ac: b40005e0     	cbz	x0, 0x4264568 <_ChromeMain+0x425f2cc>
 42644b0: d0056408     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42644b4: f9467d08     	ldr	x8, [x8, #0xcf8]
 42644b8: f9414908     	ldr	x8, [x8, #0x290]
 42644bc: f9400514     	ldr	x20, [x8, #0x8]
 42644c0: 970cf00d     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 42644c4: b4000520     	cbz	x0, 0x4264568 <_ChromeMain+0x425f2cc>
 42644c8: f9402808     	ldr	x8, [x0, #0x50]
 42644cc: b5000068     	cbnz	x8, 0x42644d8 <_ChromeMain+0x425f23c>
 42644d0: f9402409     	ldr	x9, [x0, #0x48]
 42644d4: b40004a9     	cbz	x9, 0x4264568 <_ChromeMain+0x425f2cc>
 42644d8: 52800a09     	mov	w9, #0x50               ; =80
 42644dc: 5280090a     	mov	w10, #0x48              ; =72
 42644e0: f100011f     	cmp	x8, #0x0
 42644e4: 9a890148     	csel	x8, x10, x9, eq
 42644e8: f8686808     	ldr	x8, [x0, x8]
 42644ec: f9400908     	ldr	x8, [x8, #0x10]
 42644f0: f9400515     	ldr	x21, [x8, #0x8]
 42644f4: b40003b5     	cbz	x21, 0x4264568 <_ChromeMain+0x425f2cc>
 42644f8: 9100a2a8     	add	x8, x21, #0x28
 42644fc: 390083ff     	strb	wzr, [sp, #0x20]
 4264500: 910083e9     	add	x9, sp, #0x20
 4264504: a90023e9     	stp	x9, x8, [sp]
 4264508: b0fe5a62     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 426450c: 912dc042     	add	x2, x2, #0xb70
 4264510: 910003e1     	mov	x1, sp
 4264514: aa1403e0     	mov	x0, x20
 4264518: 52800003     	mov	w3, #0x0                ; =0
 426451c: 52800004     	mov	w4, #0x0                ; =0
 4264520: 972d34d4     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4264524: 394083e8     	ldrb	w8, [sp, #0x20]
 4264528: 34000208     	cbz	w8, 0x4264568 <_ChromeMain+0x425f2cc>
 426452c: f9403ea0     	ldr	x0, [x21, #0x78]
 4264530: b40001c0     	cbz	x0, 0x4264568 <_ChromeMain+0x425f2cc>
 4264534: f9400008     	ldr	x8, [x0]
 4264538: f9401109     	ldr	x9, [x8, #0x20]
 426453c: 910103e8     	add	x8, sp, #0x40
 4264540: d63f0120     	blr	x9
 4264544: 1400000d     	b	0x4264578 <_ChromeMain+0x425f2dc>
 4264548: 94d6f1a8     	bl	0x7820be8 <_ChromeMain+0x781b94c>
 426454c: 52800501     	mov	w1, #0x28               ; =40
 4264550: 96f6925a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4264554: 17ffffd2     	b	0x426449c <_ChromeMain+0x425f200>
 4264558: a9478a61     	ldp	x1, x2, [x19, #0x78]
 426455c: 910083e0     	add	x0, sp, #0x20
 4264560: 96f6cf2e     	bl	0x18218 <_ChromeMain+0x12f7c>
 4264564: 1400000d     	b	0x4264598 <_ChromeMain+0x425f2fc>
 4264568: 52800100     	mov	w0, #0x8                ; =8
 426456c: 96f6ab7f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264570: f900001f     	str	xzr, [x0]
 4264574: a9047fe0     	stp	x0, xzr, [sp, #0x40]
 4264578: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 426457c: f9001bff     	str	xzr, [sp, #0x30]
 4264580: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 4264584: 37fffea8     	tbnz	w8, #0x1f, 0x4264558 <_ChromeMain+0x425f2bc>
 4264588: 3cc78260     	ldur	q0, [x19, #0x78]
 426458c: 3d800be0     	str	q0, [sp, #0x20]
 4264590: f8488268     	ldur	x8, [x19, #0x88]
 4264594: f9001be8     	str	x8, [sp, #0x30]
 4264598: b9402a76     	ldr	w22, [x19, #0x28]
 426459c: f00554e0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 42645a0: 9135a000     	add	x0, x0, #0xd68
 42645a4: f9400008     	ldr	x8, [x0]
 42645a8: d63f0100     	blr	x8
 42645ac: f9400008     	ldr	x8, [x0]
 42645b0: b4000ba8     	cbz	x8, 0x4264724 <_ChromeMain+0x425f488>
 42645b4: f9400114     	ldr	x20, [x8]
 42645b8: b4000b74     	cbz	x20, 0x4264724 <_ChromeMain+0x425f488>
 42645bc: f004c5c0     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42645c0: 91360800     	add	x0, x0, #0xd82
 42645c4: f004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42645c8: 91342021     	add	x1, x1, #0xd08
 42645cc: 910003e8     	mov	x8, sp
 42645d0: 52803782     	mov	w2, #0x1bc              ; =444
 42645d4: 96f7b1ab     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 42645d8: 52800b00     	mov	w0, #0x58               ; =88
 42645dc: 96f6ab63     	bl	0xf368 <_ChromeMain+0xa0cc>
 42645e0: aa0003f5     	mov	x21, x0
 42645e4: 52800028     	mov	w8, #0x1                ; =1
 42645e8: 10fd9f89     	adr	x9, 0x425f9d8 <_ChromeMain+0x425a73c>
 42645ec: d503201f     	nop
 42645f0: b9000008     	str	w8, [x0]
 42645f4: 10fda468     	adr	x8, 0x425fa80 <_ChromeMain+0x425a7e4>
 42645f8: d503201f     	nop
 42645fc: b0ff17ca     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 4264600: 912c014a     	add	x10, x10, #0xb00
 4264604: a900a009     	stp	x9, x8, [x0, #0x8]
 4264608: 10000948     	adr	x8, 0x4264730 <_ChromeMain+0x425f494>
 426460c: d503201f     	nop
 4264610: a901a00a     	stp	x10, x8, [x0, #0x18]
 4264614: b9002816     	str	w22, [x0, #0x28]
 4264618: 52800100     	mov	w0, #0x8                ; =8
 426461c: 96f6ab53     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264620: aa0003f6     	mov	x22, x0
 4264624: f900001f     	str	xzr, [x0]
 4264628: f9001aa0     	str	x0, [x21, #0x30]
 426462c: f94023e0     	ldr	x0, [sp, #0x40]
 4264630: 95101eb7     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4264634: aa0003f7     	mov	x23, x0
 4264638: aa1603e0     	mov	x0, x22
 426463c: aa1703e1     	mov	x1, x23
 4264640: 95101eb0     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4264644: aa1703e0     	mov	x0, x23
 4264648: 94f67c45     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426464c: f94027e8     	ldr	x8, [sp, #0x48]
 4264650: f9001ea8     	str	x8, [x21, #0x38]
 4264654: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4264658: 37f80548     	tbnz	w8, #0x1f, 0x4264700 <_ChromeMain+0x425f464>
 426465c: 3dc00be0     	ldr	q0, [sp, #0x20]
 4264660: 3c8402a0     	stur	q0, [x21, #0x40]
 4264664: f9401be8     	ldr	x8, [sp, #0x30]
 4264668: f80502a8     	stur	x8, [x21, #0x50]
 426466c: f9400288     	ldr	x8, [x20]
 4264670: f9400108     	ldr	x8, [x8]
 4264674: 910003e1     	mov	x1, sp
 4264678: aa1403e0     	mov	x0, x20
 426467c: aa1503e2     	mov	x2, x21
 4264680: d2800003     	mov	x3, #0x0                ; =0
 4264684: d63f0100     	blr	x8
 4264688: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 426468c: 37f80428     	tbnz	w8, #0x1f, 0x4264710 <_ChromeMain+0x425f474>
 4264690: f94023f4     	ldr	x20, [sp, #0x40]
 4264694: f90023ff     	str	xzr, [sp, #0x40]
 4264698: b40000d4     	cbz	x20, 0x42646b0 <_ChromeMain+0x425f414>
 426469c: aa1403e0     	mov	x0, x20
 42646a0: 95101e9e     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 42646a4: aa1403e0     	mov	x0, x20
 42646a8: 52800101     	mov	w1, #0x8                ; =8
 42646ac: 96f69203     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42646b0: f9405674     	ldr	x20, [x19, #0xa8]
 42646b4: b40001b4     	cbz	x20, 0x42646e8 <_ChromeMain+0x425f44c>
 42646b8: f900567f     	str	xzr, [x19, #0xa8]
 42646bc: f9400688     	ldr	x8, [x20, #0x8]
 42646c0: aa1403e0     	mov	x0, x20
 42646c4: 52800021     	mov	w1, #0x1                ; =1
 42646c8: d63f0100     	blr	x8
 42646cc: 12800008     	mov	w8, #-0x1               ; =-1
 42646d0: b8e80288     	ldaddal	w8, w8, [x20]
 42646d4: 7100051f     	cmp	w8, #0x1
 42646d8: 54000081     	b.ne	0x42646e8 <_ChromeMain+0x425f44c>
 42646dc: f9400a88     	ldr	x8, [x20, #0x10]
 42646e0: aa1403e0     	mov	x0, x20
 42646e4: d63f0100     	blr	x8
 42646e8: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 42646ec: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 42646f0: a94657f6     	ldp	x22, x21, [sp, #0x60]
 42646f4: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 42646f8: 910243ff     	add	sp, sp, #0x90
 42646fc: d65f03c0     	ret
 4264700: a9420be1     	ldp	x1, x2, [sp, #0x20]
 4264704: 910102a0     	add	x0, x21, #0x40
 4264708: 96f6cec4     	bl	0x18218 <_ChromeMain+0x12f7c>
 426470c: 17ffffd8     	b	0x426466c <_ChromeMain+0x425f3d0>
 4264710: f94013e0     	ldr	x0, [sp, #0x20]
 4264714: f9401be8     	ldr	x8, [sp, #0x30]
 4264718: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426471c: 96f691e7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4264720: 17ffffdc     	b	0x4264690 <_ChromeMain+0x425f3f4>
 4264724: d4200000     	brk	#0
 4264728: d4400000     	hlt	#0
 426472c: d4200020     	brk	#0x1
 4264730: d10143ff     	sub	sp, sp, #0x50
 4264734: a90257f6     	stp	x22, x21, [sp, #0x20]
 4264738: a9034ff4     	stp	x20, x19, [sp, #0x30]
 426473c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4264740: 910103fd     	add	x29, sp, #0x40
 4264744: aa0203f4     	mov	x20, x2
 4264748: aa0103f3     	mov	x19, x1
 426474c: aa0003f6     	mov	x22, x0
 4264750: 52800100     	mov	w0, #0x8                ; =8
 4264754: 96f6ab05     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264758: aa0003f5     	mov	x21, x0
 426475c: f900001f     	str	xzr, [x0]
 4264760: 340003f6     	cbz	w22, 0x42647dc <_ChromeMain+0x425f540>
 4264764: f90003f5     	str	x21, [sp]
 4264768: f9400260     	ldr	x0, [x19]
 426476c: 95101e68     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4264770: aa0003f4     	mov	x20, x0
 4264774: aa1503e0     	mov	x0, x21
 4264778: aa1403e1     	mov	x1, x20
 426477c: 95101e61     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4264780: aa1403e0     	mov	x0, x20
 4264784: 94f67bf6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4264788: f9400668     	ldr	x8, [x19, #0x8]
 426478c: f90007e8     	str	x8, [sp, #0x8]
 4264790: d004e8a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4264794: 91155821     	add	x1, x1, #0x556
 4264798: 910003f5     	mov	x21, sp
 426479c: 910003e0     	mov	x0, sp
 42647a0: 528000e2     	mov	w2, #0x7                ; =7
 42647a4: 940ca3dd     	bl	0x458d718 <_ChromeMain+0x458847c>
 42647a8: f94002b3     	ldr	x19, [x21]
 42647ac: f90002bf     	str	xzr, [x21]
 42647b0: b40000d3     	cbz	x19, 0x42647c8 <_ChromeMain+0x425f52c>
 42647b4: aa1303e0     	mov	x0, x19
 42647b8: 95101e58     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 42647bc: aa1303e0     	mov	x0, x19
 42647c0: 52800101     	mov	w1, #0x8                ; =8
 42647c4: 96f691bd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42647c8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 42647cc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 42647d0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 42647d4: 910143ff     	add	sp, sp, #0x50
 42647d8: d65f03c0     	ret
 42647dc: f9000bf5     	str	x21, [sp, #0x10]
 42647e0: f9400260     	ldr	x0, [x19]
 42647e4: 95101e4a     	bl	0x866c10c <_ChromeMain+0x8666e70>
 42647e8: aa0003f6     	mov	x22, x0
 42647ec: aa1503e0     	mov	x0, x21
 42647f0: aa1603e1     	mov	x1, x22
 42647f4: 95101e43     	bl	0x866c100 <_ChromeMain+0x8666e64>
 42647f8: aa1603e0     	mov	x0, x22
 42647fc: 94f67bd8     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4264800: f9400668     	ldr	x8, [x19, #0x8]
 4264804: f9000fe8     	str	x8, [sp, #0x18]
 4264808: d004e8a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 426480c: 91155821     	add	x1, x1, #0x556
 4264810: 910043f5     	add	x21, sp, #0x10
 4264814: 910043e0     	add	x0, sp, #0x10
 4264818: 528000e2     	mov	w2, #0x7                ; =7
 426481c: aa1403e3     	mov	x3, x20
 4264820: 940ca364     	bl	0x458d5b0 <_ChromeMain+0x4588314>
 4264824: 17ffffe1     	b	0x42647a8 <_ChromeMain+0x425f50c>
