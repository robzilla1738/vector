
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461c0b8: d10143ff     	sub	sp, sp, #0x50
 461c0bc: a90257f6     	stp	x22, x21, [sp, #0x20]
 461c0c0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461c0c4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461c0c8: 910103fd     	add	x29, sp, #0x40
 461c0cc: f944d808     	ldr	x8, [x0, #0x9b0]
 461c0d0: eb08003f     	cmp	x1, x8
 461c0d4: 54000621     	b.ne	0x461c198 <_ChromeMain+0x4616efc>
 461c0d8: aa0103f3     	mov	x19, x1
 461c0dc: aa0003f5     	mov	x21, x0
 461c0e0: f0053720     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 461c0e4: 91360000     	add	x0, x0, #0xd80
 461c0e8: f9400008     	ldr	x8, [x0]
 461c0ec: d63f0100     	blr	x8
 461c0f0: f9400008     	ldr	x8, [x0]
 461c0f4: b40005c8     	cbz	x8, 0x461c1ac <_ChromeMain+0x4616f10>
 461c0f8: f9400114     	ldr	x20, [x8]
 461c0fc: b4000594     	cbz	x20, 0x461c1ac <_ChromeMain+0x4616f10>
 461c100: f004c560     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461c104: 911d6400     	add	x0, x0, #0x759
 461c108: f004c561     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461c10c: 911c2021     	add	x1, x1, #0x708
 461c110: 910003e8     	mov	x8, sp
 461c114: 5281c102     	mov	w2, #0xe08              ; =3592
 461c118: 96e8d2da     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 461c11c: f9451ab6     	ldr	x22, [x21, #0xa30]
 461c120: b40000d6     	cbz	x22, 0x461c138 <_ChromeMain+0x4616e9c>
 461c124: 52800028     	mov	w8, #0x1                ; =1
 461c128: b82802c8     	ldadd	w8, w8, [x22]
 461c12c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461c130: 6b09011f     	cmp	w8, w9
 461c134: 54000420     	b.eq	0x461c1b8 <_ChromeMain+0x4616f1c>
 461c138: f9451eb5     	ldr	x21, [x21, #0xa38]
 461c13c: 52800900     	mov	w0, #0x48               ; =72
 461c140: 96e7cc8a     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c144: aa0003e2     	mov	x2, x0
 461c148: 52800028     	mov	w8, #0x1                ; =1
 461c14c: b9000008     	str	w8, [x0]
 461c150: f0ffcc08     	adrp	x8, 0x3f9f000 <_ChromeMain+0x3f99d64>
 461c154: 91050108     	add	x8, x8, #0x140
 461c158: 90ffca89     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 461c15c: 91250129     	add	x9, x9, #0x940
 461c160: a900a408     	stp	x8, x9, [x0, #0x8]
 461c164: d0ffd488     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461c168: 911b0108     	add	x8, x8, #0x6c0
 461c16c: 10000b29     	adr	x9, 0x461c2d0 <_ChromeMain+0x4617034>
 461c170: d503201f     	nop
 461c174: a901a408     	stp	x8, x9, [x0, #0x18]
 461c178: a902d81f     	stp	xzr, x22, [x0, #0x28]
 461c17c: a903cc15     	stp	x21, x19, [x0, #0x38]
 461c180: f9400288     	ldr	x8, [x20]
 461c184: f9400108     	ldr	x8, [x8]
 461c188: 910003e1     	mov	x1, sp
 461c18c: aa1403e0     	mov	x0, x20
 461c190: d2800003     	mov	x3, #0x0                ; =0
 461c194: d63f0100     	blr	x8
 461c198: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461c19c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461c1a0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461c1a4: 910143ff     	add	sp, sp, #0x50
 461c1a8: d65f03c0     	ret
 461c1ac: d4200000     	brk	#0
 461c1b0: d4400000     	hlt	#0
 461c1b4: d4200020     	brk	#0x1
 461c1b8: d4200000     	brk	#0
 461c1bc: d4400000     	hlt	#0
 461c1c0: d4200020     	brk	#0x1
 461c1c4: d10143ff     	sub	sp, sp, #0x50
 461c1c8: a90257f6     	stp	x22, x21, [sp, #0x20]
 461c1cc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461c1d0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461c1d4: 910103fd     	add	x29, sp, #0x40
 461c1d8: f944dc08     	ldr	x8, [x0, #0x9b8]
 461c1dc: eb08003f     	cmp	x1, x8
 461c1e0: 54000621     	b.ne	0x461c2a4 <_ChromeMain+0x4617008>
 461c1e4: aa0103f3     	mov	x19, x1
 461c1e8: aa0003f5     	mov	x21, x0
 461c1ec: f0053720     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 461c1f0: 91360000     	add	x0, x0, #0xd80
 461c1f4: f9400008     	ldr	x8, [x0]
 461c1f8: d63f0100     	blr	x8
 461c1fc: f9400008     	ldr	x8, [x0]
 461c200: b40005c8     	cbz	x8, 0x461c2b8 <_ChromeMain+0x461701c>
 461c204: f9400114     	ldr	x20, [x8]
 461c208: b4000594     	cbz	x20, 0x461c2b8 <_ChromeMain+0x461701c>
 461c20c: f004c560     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461c210: 911de400     	add	x0, x0, #0x779
 461c214: f004c561     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461c218: 911c2021     	add	x1, x1, #0x708
 461c21c: 910003e8     	mov	x8, sp
 461c220: 5281c262     	mov	w2, #0xe13              ; =3603
 461c224: 96e8d297     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 461c228: f9451ab6     	ldr	x22, [x21, #0xa30]
 461c22c: b40000d6     	cbz	x22, 0x461c244 <_ChromeMain+0x4616fa8>
 461c230: 52800028     	mov	w8, #0x1                ; =1
 461c234: b82802c8     	ldadd	w8, w8, [x22]
 461c238: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461c23c: 6b09011f     	cmp	w8, w9
 461c240: 54000420     	b.eq	0x461c2c4 <_ChromeMain+0x4617028>
 461c244: f9451eb5     	ldr	x21, [x21, #0xa38]
 461c248: 52800900     	mov	w0, #0x48               ; =72
 461c24c: 96e7cc47     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c250: aa0003e2     	mov	x2, x0
 461c254: 52800028     	mov	w8, #0x1                ; =1
 461c258: b9000008     	str	w8, [x0]
 461c25c: f0ffcc08     	adrp	x8, 0x3f9f000 <_ChromeMain+0x3f99d64>
 461c260: 91050108     	add	x8, x8, #0x140
 461c264: 90ffca89     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 461c268: 91250129     	add	x9, x9, #0x940
 461c26c: a900a408     	stp	x8, x9, [x0, #0x8]
 461c270: d0ffd488     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461c274: 911b0108     	add	x8, x8, #0x6c0
 461c278: 10004de9     	adr	x9, 0x461cc34 <_ChromeMain+0x4617998>
 461c27c: d503201f     	nop
 461c280: a901a408     	stp	x8, x9, [x0, #0x18]
 461c284: a902d81f     	stp	xzr, x22, [x0, #0x28]
 461c288: a903cc15     	stp	x21, x19, [x0, #0x38]
 461c28c: f9400288     	ldr	x8, [x20]
 461c290: f9400108     	ldr	x8, [x8]
 461c294: 910003e1     	mov	x1, sp
 461c298: aa1403e0     	mov	x0, x20
 461c29c: d2800003     	mov	x3, #0x0                ; =0
 461c2a0: d63f0100     	blr	x8
 461c2a4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461c2a8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461c2ac: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461c2b0: 910143ff     	add	sp, sp, #0x50
 461c2b4: d65f03c0     	ret
 461c2b8: d4200000     	brk	#0
 461c2bc: d4400000     	hlt	#0
 461c2c0: d4200020     	brk	#0x1
 461c2c4: d4200000     	brk	#0
 461c2c8: d4400000     	hlt	#0
 461c2cc: d4200020     	brk	#0x1
 461c2d0: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 461c2d4: a9015ff8     	stp	x24, x23, [sp, #0x10]
 461c2d8: a90257f6     	stp	x22, x21, [sp, #0x20]
 461c2dc: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461c2e0: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461c2e4: 910103fd     	add	x29, sp, #0x40
 461c2e8: d10783ff     	sub	sp, sp, #0x1e0
 461c2ec: f944d808     	ldr	x8, [x0, #0x9b0]
 461c2f0: eb08003f     	cmp	x1, x8
 461c2f4: 540006c1     	b.ne	0x461c3cc <_ChromeMain+0x4617130>
 461c2f8: aa0003f3     	mov	x19, x0
 461c2fc: f944c814     	ldr	x20, [x0, #0x990]
 461c300: 39666016     	ldrb	w22, [x0, #0x998]
 461c304: b949c015     	ldr	w21, [x0, #0x9c0]
 461c308: 91000428     	add	x8, x1, #0x1
 461c30c: f904d808     	str	x8, [x0, #0x9b0]
 461c310: f9435000     	ldr	x0, [x0, #0x6a0]
 461c314: f903527f     	str	xzr, [x19, #0x6a0]
 461c318: b4000080     	cbz	x0, 0x461c328 <_ChromeMain+0x461708c>
 461c31c: 978a7b00     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461c320: 52800301     	mov	w1, #0x18               ; =24
 461c324: 96e7b2e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c328: f9434e60     	ldr	x0, [x19, #0x698]
 461c32c: f9034e7f     	str	xzr, [x19, #0x698]
 461c330: b4000080     	cbz	x0, 0x461c340 <_ChromeMain+0x46170a4>
 461c334: f9400008     	ldr	x8, [x0]
 461c338: f9400508     	ldr	x8, [x8, #0x8]
 461c33c: d63f0100     	blr	x8
 461c340: 39666268     	ldrb	w8, [x19, #0x998]
 461c344: 34000048     	cbz	w8, 0x461c34c <_ChromeMain+0x46170b0>
 461c348: 3926627f     	strb	wzr, [x19, #0x998]
 461c34c: b909c27f     	str	wzr, [x19, #0x9c0]
 461c350: 360003f6     	tbz	w22, #0x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c354: 71000ebf     	cmp	w21, #0x3
 461c358: 54000360     	b.eq	0x461c3c4 <_ChromeMain+0x4617128>
 461c35c: 910303f7     	add	x23, sp, #0xc0
 461c360: 71000abf     	cmp	w21, #0x2
 461c364: 54000420     	b.eq	0x461c3e8 <_ChromeMain+0x461714c>
 461c368: 710006bf     	cmp	w21, #0x1
 461c36c: 54000301     	b.ne	0x461c3cc <_ChromeMain+0x4617130>
 461c370: f9429a68     	ldr	x8, [x19, #0x530]
 461c374: b40002c8     	cbz	x8, 0x461c3cc <_ChromeMain+0x4617130>
 461c378: 39408508     	ldrb	w8, [x8, #0x21]
 461c37c: 34000288     	cbz	w8, 0x461c3cc <_ChromeMain+0x4617130>
 461c380: f9400268     	ldr	x8, [x19]
 461c384: f9403508     	ldr	x8, [x8, #0x68]
 461c388: aa1303e0     	mov	x0, x19
 461c38c: d63f0100     	blr	x8
 461c390: b40001e0     	cbz	x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c394: f9428e68     	ldr	x8, [x19, #0x518]
 461c398: b40001a8     	cbz	x8, 0x461c3cc <_ChromeMain+0x4617130>
 461c39c: aa1303e0     	mov	x0, x19
 461c3a0: aa1403e1     	mov	x1, x20
 461c3a4: 97ffe065     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461c3a8: b4000120     	cbz	x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c3ac: aa0003f5     	mov	x21, x0
 461c3b0: b940f808     	ldr	w8, [x0, #0xf8]
 461c3b4: 340000c8     	cbz	w8, 0x461c3cc <_ChromeMain+0x4617130>
 461c3b8: 3944e2a8     	ldrb	w8, [x21, #0x138]
 461c3bc: 37000088     	tbnz	w8, #0x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c3c0: 14000026     	b	0x461c458 <_ChromeMain+0x46171bc>
 461c3c4: f9428e73     	ldr	x19, [x19, #0x518]
 461c3c8: b5003cf3     	cbnz	x19, 0x461cb64 <_ChromeMain+0x46178c8>
 461c3cc: 910783ff     	add	sp, sp, #0x1e0
 461c3d0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461c3d4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461c3d8: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461c3dc: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 461c3e0: a8c567fa     	ldp	x26, x25, [sp], #0x50
 461c3e4: d65f03c0     	ret
 461c3e8: f9429a68     	ldr	x8, [x19, #0x530]
 461c3ec: b4ffff08     	cbz	x8, 0x461c3cc <_ChromeMain+0x4617130>
 461c3f0: 39408508     	ldrb	w8, [x8, #0x21]
 461c3f4: 34fffec8     	cbz	w8, 0x461c3cc <_ChromeMain+0x4617130>
 461c3f8: f9400268     	ldr	x8, [x19]
 461c3fc: f9403508     	ldr	x8, [x8, #0x68]
 461c400: aa1303e0     	mov	x0, x19
 461c404: d63f0100     	blr	x8
 461c408: b4fffe20     	cbz	x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c40c: aa1303e0     	mov	x0, x19
 461c410: aa1403e1     	mov	x1, x20
 461c414: 97ffe049     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461c418: b4fffda0     	cbz	x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c41c: b940f808     	ldr	w8, [x0, #0xf8]
 461c420: 34fffd68     	cbz	w8, 0x461c3cc <_ChromeMain+0x4617130>
 461c424: 3944e008     	ldrb	w8, [x0, #0x138]
 461c428: 3707fd28     	tbnz	w8, #0x0, 0x461c3cc <_ChromeMain+0x4617130>
 461c42c: 14000118     	b	0x461c88c <_ChromeMain+0x46175f0>
 461c430: f9400ec0     	ldr	x0, [x22, #0x18]
 461c434: f94016c8     	ldr	x8, [x22, #0x28]
 461c438: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461c43c: 96e7b29f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c440: 1400003d     	b	0x461c534 <_ChromeMain+0x4617298>
 461c444: f9401ac0     	ldr	x0, [x22, #0x30]
 461c448: f94022c8     	ldr	x8, [x22, #0x40]
 461c44c: d37ff901     	lsl	x1, x8, #1
 461c450: 96e7b29a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c454: 1400004e     	b	0x461c58c <_ChromeMain+0x46172f0>
 461c458: 5280a700     	mov	w0, #0x538              ; =1336
 461c45c: 96e7cbc3     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c460: aa0003f6     	mov	x22, x0
 461c464: d2800001     	mov	x1, #0x0                ; =0
 461c468: 951c7401     	bl	0x8d3946c <_ChromeMain+0x8d341d0>
 461c46c: f81983a0     	stur	x0, [x29, #-0x68]
 461c470: f9451a78     	ldr	x24, [x19, #0xa30]
 461c474: b40000d8     	cbz	x24, 0x461c48c <_ChromeMain+0x46171f0>
 461c478: 52800028     	mov	w8, #0x1                ; =1
 461c47c: b8280308     	ldadd	w8, w8, [x24]
 461c480: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461c484: 6b09011f     	cmp	w8, w9
 461c488: 54003be0     	b.eq	0x461cc04 <_ChromeMain+0x4617968>
 461c48c: f9451e79     	ldr	x25, [x19, #0xa38]
 461c490: 52800a00     	mov	w0, #0x50               ; =80
 461c494: 96e7cbb5     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c498: 52800028     	mov	w8, #0x1                ; =1
 461c49c: b9000008     	str	w8, [x0]
 461c4a0: 10044b48     	adr	x8, 0x4624e08 <_ChromeMain+0x461fb6c>
 461c4a4: d503201f     	nop
 461c4a8: b0ffca89     	adrp	x9, 0x3f6d000 <_ChromeMain+0x3f67d64>
 461c4ac: 91070129     	add	x9, x9, #0x1c0
 461c4b0: a900a408     	stp	x8, x9, [x0, #0x8]
 461c4b4: d0ffd488     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461c4b8: 911b0108     	add	x8, x8, #0x6c0
 461c4bc: 10009ae9     	adr	x9, 0x461d818 <_ChromeMain+0x461857c>
 461c4c0: d503201f     	nop
 461c4c4: a901a408     	stp	x8, x9, [x0, #0x18]
 461c4c8: a902e01f     	stp	xzr, x24, [x0, #0x28]
 461c4cc: a903d019     	stp	x25, x20, [x0, #0x38]
 461c4d0: aa0003f8     	mov	x24, x0
 461c4d4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 461c4d8: d0052ca9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461c4dc: f9404529     	ldr	x9, [x9, #0x88]
 461c4e0: eb09011f     	cmp	x8, x9
 461c4e4: 54000061     	b.ne	0x461c4f0 <_ChromeMain+0x4617254>
 461c4e8: aa1603e0     	mov	x0, x22
 461c4ec: 96e7df84     	bl	0x142fc <_ChromeMain+0xf060>
 461c4f0: f9002716     	str	x22, [x24, #0x48]
 461c4f4: 52800600     	mov	w0, #0x30               ; =48
 461c4f8: 96e7cb9c     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c4fc: 91008009     	add	x9, x0, #0x20
 461c500: eb00013f     	cmp	x9, x0
 461c504: 54001b63     	b.lo	0x461c870 <_ChromeMain+0x46175d4>
 461c508: aa0003f4     	mov	x20, x0
 461c50c: f004c568     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461c510: 911e6d08     	add	x8, x8, #0x79b
 461c514: eb08013f     	cmp	x9, x8
 461c518: fa488002     	ccmp	x0, x8, #0x2, hi
 461c51c: 54001aa9     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c520: ad400500     	ldp	q0, q1, [x8]
 461c524: ad000680     	stp	q0, q1, [x20]
 461c528: 3900829f     	strb	wzr, [x20, #0x20]
 461c52c: 39c0bec8     	ldrsb	w8, [x22, #0x2f]
 461c530: 37fff808     	tbnz	w8, #0x1f, 0x461c430 <_ChromeMain+0x4617194>
 461c534: f9000ed4     	str	x20, [x22, #0x18]
 461c538: f004c8e8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 461c53c: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 461c540: 3d800ac0     	str	q0, [x22, #0x20]
 461c544: 52800400     	mov	w0, #0x20               ; =32
 461c548: 96e7cb88     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c54c: 91006809     	add	x9, x0, #0x1a
 461c550: eb00013f     	cmp	x9, x0
 461c554: 540018e3     	b.lo	0x461c870 <_ChromeMain+0x46175d4>
 461c558: aa0003f4     	mov	x20, x0
 461c55c: f004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c560: 91207908     	add	x8, x8, #0x81e
 461c564: eb08013f     	cmp	x9, x8
 461c568: fa488002     	ccmp	x0, x8, #0x2, hi
 461c56c: 54001829     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c570: 3dc00100     	ldr	q0, [x8]
 461c574: 3d800280     	str	q0, [x20]
 461c578: 3cc0a100     	ldur	q0, [x8, #0xa]
 461c57c: 3c80a280     	stur	q0, [x20, #0xa]
 461c580: 7900369f     	strh	wzr, [x20, #0x1a]
 461c584: 39c11ec8     	ldrsb	w8, [x22, #0x47]
 461c588: 37fff5e8     	tbnz	w8, #0x1f, 0x461c444 <_ChromeMain+0x46171a8>
 461c58c: f9001ad4     	str	x20, [x22, #0x30]
 461c590: f004c908     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 461c594: 3dc02d00     	ldr	q0, [x8, #0xb0]
 461c598: 3c8382c0     	stur	q0, [x22, #0x38]
 461c59c: f81883b8     	stur	x24, [x29, #-0x78]
 461c5a0: 52800036     	mov	w22, #0x1               ; =1
 461c5a4: 381903b6     	sturb	w22, [x29, #-0x70]
 461c5a8: 390123f6     	strb	w22, [sp, #0x48]
 461c5ac: 3901d3ff     	strb	wzr, [sp, #0x74]
 461c5b0: 6f00e400     	movi.2d	v0, #0000000000000000
 461c5b4: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461c5b8: 3901c3ff     	strb	wzr, [sp, #0x70]
 461c5bc: 3901e3f6     	strb	w22, [sp, #0x78]
 461c5c0: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 461c5c4: 528000d4     	mov	w20, #0x6               ; =6
 461c5c8: d10183a9     	sub	x9, x29, #0x60
 461c5cc: 9100312a     	add	x10, x9, #0xc
 461c5d0: f90043ff     	str	xzr, [sp, #0x80]
 461c5d4: f004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c5d8: 911c3108     	add	x8, x8, #0x70c
 461c5dc: eb08015f     	cmp	x10, x8
 461c5e0: fa488122     	ccmp	x9, x8, #0x2, hi
 461c5e4: 381b73b4     	sturb	w20, [x29, #-0x49]
 461c5e8: 54001449     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c5ec: 52800da9     	mov	w9, #0x6d               ; =109
 461c5f0: 72a00ca9     	movk	w9, #0x65, lsl #16
 461c5f4: b81a83a9     	stur	w9, [x29, #-0x58]
 461c5f8: f9400108     	ldr	x8, [x8]
 461c5fc: f81a03a8     	stur	x8, [x29, #-0x60]
 461c600: 781ac3bf     	sturh	wzr, [x29, #-0x54]
 461c604: 910123e0     	add	x0, sp, #0x48
 461c608: d10183a1     	sub	x1, x29, #0x60
 461c60c: 951c721a     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 461c610: aa0003e2     	mov	x2, x0
 461c614: d101a3a0     	sub	x0, x29, #0x68
 461c618: d101e3a1     	sub	x1, x29, #0x78
 461c61c: 951c72c6     	bl	0x8d39134 <_ChromeMain+0x8d33e98>
 461c620: 381283b6     	sturb	w22, [x29, #-0xd8]
 461c624: 381583b6     	sturb	w22, [x29, #-0xa8]
 461c628: d103c3a9     	sub	x9, x29, #0xf0
 461c62c: f004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c630: 9120e908     	add	x8, x8, #0x83a
 461c634: 9100312a     	add	x10, x9, #0xc
 461c638: eb08015f     	cmp	x10, x8
 461c63c: 381803bf     	sturb	wzr, [x29, #-0x80]
 461c640: 381543bf     	sturb	wzr, [x29, #-0xac]
 461c644: 6f00e400     	movi.2d	v0, #0000000000000000
 461c648: ad0482e0     	stp	q0, q0, [x23, #0x90]
 461c64c: 381503bf     	sturb	wzr, [x29, #-0xb0]
 461c650: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 461c654: f81603bf     	stur	xzr, [x29, #-0xa0]
 461c658: fa488122     	ccmp	x9, x8, #0x2, hi
 461c65c: 381273b4     	sturb	w20, [x29, #-0xd9]
 461c660: 54001089     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c664: 52800ca9     	mov	w9, #0x65               ; =101
 461c668: 72a00d89     	movk	w9, #0x6c, lsl #16
 461c66c: b81183a9     	stur	w9, [x29, #-0xe8]
 461c670: f9400108     	ldr	x8, [x8]
 461c674: f81103a8     	stur	x8, [x29, #-0xf0]
 461c678: 7811c3bf     	sturh	wzr, [x29, #-0xe4]
 461c67c: d10363a0     	sub	x0, x29, #0xd8
 461c680: d103c3a1     	sub	x1, x29, #0xf0
 461c684: 951c71fc     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 461c688: aa0003e2     	mov	x2, x0
 461c68c: d101a3a0     	sub	x0, x29, #0x68
 461c690: d10223a1     	sub	x1, x29, #0x88
 461c694: 951c730a     	bl	0x8d392bc <_ChromeMain+0x8d34020>
 461c698: a911ffff     	stp	xzr, xzr, [sp, #0x118]
 461c69c: f90097ff     	str	xzr, [sp, #0x128]
 461c6a0: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 461c6a4: 37f800c8     	tbnz	w8, #0x1f, 0x461c6bc <_ChromeMain+0x4617420>
 461c6a8: 3cc082a0     	ldur	q0, [x21, #0x8]
 461c6ac: f84182a8     	ldur	x8, [x21, #0x18]
 461c6b0: f9008be8     	str	x8, [sp, #0x110]
 461c6b4: 3d8012e0     	str	q0, [x23, #0x40]
 461c6b8: 14000004     	b	0x461c6c8 <_ChromeMain+0x461742c>
 461c6bc: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 461c6c0: 910403e0     	add	x0, sp, #0x100
 461c6c4: 96e8a943     	bl	0x46bd0 <_ChromeMain+0x41934>
 461c6c8: 52800028     	mov	w8, #0x1                ; =1
 461c6cc: 390303e8     	strb	w8, [sp, #0xc0]
 461c6d0: 6f00e400     	movi.2d	v0, #0000000000000000
 461c6d4: 3c8082e0     	stur	q0, [x23, #0x8]
 461c6d8: 3c8182e0     	stur	q0, [x23, #0x18]
 461c6dc: 3c8282e0     	stur	q0, [x23, #0x28]
 461c6e0: f9007fff     	str	xzr, [sp, #0xf8]
 461c6e4: 52800400     	mov	w0, #0x20               ; =32
 461c6e8: 96e7cb20     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c6ec: 91005809     	add	x9, x0, #0x16
 461c6f0: eb00013f     	cmp	x9, x0
 461c6f4: 54000be3     	b.lo	0x461c870 <_ChromeMain+0x46175d4>
 461c6f8: f004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c6fc: 91212108     	add	x8, x8, #0x848
 461c700: eb08013f     	cmp	x9, x8
 461c704: fa488002     	ccmp	x0, x8, #0x2, hi
 461c708: 54000b49     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c70c: 3dc00100     	ldr	q0, [x8]
 461c710: 3d800000     	str	q0, [x0]
 461c714: f840e108     	ldur	x8, [x8, #0xe]
 461c718: f800e008     	stur	x8, [x0, #0xe]
 461c71c: 79002c1f     	strh	wzr, [x0, #0x16]
 461c720: f9006be0     	str	x0, [sp, #0xd0]
 461c724: 9004c928     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 461c728: 3dc3b100     	ldr	q0, [x8, #0xec0]
 461c72c: 3c8182e0     	stur	q0, [x23, #0x18]
 461c730: b00525d4     	adrp	x20, 0xead5000 <dyld_stub_binder+0xead5000>
 461c734: 911fa294     	add	x20, x20, #0x7e8
 461c738: d101a3a0     	sub	x0, x29, #0x68
 461c73c: 910463e2     	add	x2, sp, #0x118
 461c740: 910403e3     	add	x3, sp, #0x100
 461c744: 910303e4     	add	x4, sp, #0xc0
 461c748: aa1403e1     	mov	x1, x20
 461c74c: 94e2c2bc     	bl	0x7ecd23c <_ChromeMain+0x7ec7fa0>
 461c750: f9400008     	ldr	x8, [x0]
 461c754: f9412d09     	ldr	x9, [x8, #0x258]
 461c758: b5002629     	cbnz	x9, 0x461cc1c <_ChromeMain+0x4617980>
 461c75c: f9012d14     	str	x20, [x8, #0x258]
 461c760: 910303e0     	add	x0, sp, #0xc0
 461c764: 951c7aba     	bl	0x8d3b24c <_ChromeMain+0x8d35fb0>
 461c768: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 461c76c: 36f800a8     	tbz	w8, #0x1f, 0x461c780 <_ChromeMain+0x46174e4>
 461c770: f94083e0     	ldr	x0, [sp, #0x100]
 461c774: f9408be8     	ldr	x8, [sp, #0x110]
 461c778: d37ff901     	lsl	x1, x8, #1
 461c77c: 96e7b1cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c780: 39c4bfe8     	ldrsb	w8, [sp, #0x12f]
 461c784: 36f800a8     	tbz	w8, #0x1f, 0x461c798 <_ChromeMain+0x46174fc>
 461c788: f9408fe0     	ldr	x0, [sp, #0x118]
 461c78c: f94097e8     	ldr	x8, [sp, #0x128]
 461c790: d37ff901     	lsl	x1, x8, #1
 461c794: 96e7b1c9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c798: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 461c79c: 36f800a8     	tbz	w8, #0x1f, 0x461c7b0 <_ChromeMain+0x4617514>
 461c7a0: f85103a0     	ldur	x0, [x29, #-0xf0]
 461c7a4: f85203a8     	ldur	x8, [x29, #-0xe0]
 461c7a8: d37ff901     	lsl	x1, x8, #1
 461c7ac: 96e7b1c3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c7b0: d10363a0     	sub	x0, x29, #0xd8
 461c7b4: 951c7190     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 461c7b8: 385803a8     	ldurb	w8, [x29, #-0x80]
 461c7bc: 51000508     	sub	w8, w8, #0x1
 461c7c0: 7103f51f     	cmp	w8, #0xfd
 461c7c4: 54000068     	b.hi	0x461c7d0 <_ChromeMain+0x4617534>
 461c7c8: f85783a0     	ldur	x0, [x29, #-0x88]
 461c7cc: b5000440     	cbnz	x0, 0x461c854 <_ChromeMain+0x46175b8>
 461c7d0: 52801fe8     	mov	w8, #0xff               ; =255
 461c7d4: 381803a8     	sturb	w8, [x29, #-0x80]
 461c7d8: 38db73a8     	ldursb	w8, [x29, #-0x49]
 461c7dc: 36f800a8     	tbz	w8, #0x1f, 0x461c7f0 <_ChromeMain+0x4617554>
 461c7e0: f85a03a0     	ldur	x0, [x29, #-0x60]
 461c7e4: f85b03a8     	ldur	x8, [x29, #-0x50]
 461c7e8: d37ff901     	lsl	x1, x8, #1
 461c7ec: 96e7b1b3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c7f0: 910123e0     	add	x0, sp, #0x48
 461c7f4: 951c7180     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 461c7f8: 385903a8     	ldurb	w8, [x29, #-0x70]
 461c7fc: 51000508     	sub	w8, w8, #0x1
 461c800: 7103f51f     	cmp	w8, #0xfd
 461c804: 54000068     	b.hi	0x461c810 <_ChromeMain+0x4617574>
 461c808: f85883a0     	ldur	x0, [x29, #-0x78]
 461c80c: b5000160     	cbnz	x0, 0x461c838 <_ChromeMain+0x461759c>
 461c810: 52801fe8     	mov	w8, #0xff               ; =255
 461c814: 381903a8     	sturb	w8, [x29, #-0x70]
 461c818: f85983a1     	ldur	x1, [x29, #-0x68]
 461c81c: b4002061     	cbz	x1, 0x461cc28 <_ChromeMain+0x461798c>
 461c820: f9428e60     	ldr	x0, [x19, #0x518]
 461c824: f81983bf     	stur	xzr, [x29, #-0x68]
 461c828: 95b209cf     	bl	0xb29ef64 <_ChromeMain+0xb299cc8>
 461c82c: f85983a8     	ldur	x8, [x29, #-0x68]
 461c830: b4ffdce8     	cbz	x8, 0x461c3cc <_ChromeMain+0x4617130>
 461c834: 140000f7     	b	0x461cc10 <_ChromeMain+0x4617974>
 461c838: 12800008     	mov	w8, #-0x1               ; =-1
 461c83c: b8e80008     	ldaddal	w8, w8, [x0]
 461c840: 7100051f     	cmp	w8, #0x1
 461c844: 54fffe61     	b.ne	0x461c810 <_ChromeMain+0x4617574>
 461c848: f9400808     	ldr	x8, [x0, #0x10]
 461c84c: d63f0100     	blr	x8
 461c850: 17fffff0     	b	0x461c810 <_ChromeMain+0x4617574>
 461c854: 12800008     	mov	w8, #-0x1               ; =-1
 461c858: b8e80008     	ldaddal	w8, w8, [x0]
 461c85c: 7100051f     	cmp	w8, #0x1
 461c860: 54fffb81     	b.ne	0x461c7d0 <_ChromeMain+0x4617534>
 461c864: f9400808     	ldr	x8, [x0, #0x10]
 461c868: d63f0100     	blr	x8
 461c86c: 17ffffd9     	b	0x461c7d0 <_ChromeMain+0x4617534>
 461c870: d4200020     	brk	#0x1
 461c874: 52800100     	mov	w0, #0x8                ; =8
 461c878: 96e7cabc     	bl	0xf368 <_ChromeMain+0xa0cc>
 461c87c: aa0003f6     	mov	x22, x0
 461c880: d2800015     	mov	x21, #0x0               ; =0
 461c884: f900001f     	str	xzr, [x0]
 461c888: 1400006b     	b	0x461ca34 <_ChromeMain+0x4617798>
 461c88c: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 461c890: f9002fff     	str	xzr, [sp, #0x58]
 461c894: a932ffbf     	stp	xzr, xzr, [x29, #-0xd8]
 461c898: f81383bf     	stur	xzr, [x29, #-0xc8]
 461c89c: d10363a8     	sub	x8, x29, #0xd8
 461c8a0: 97fffd40     	bl	0x461bda0 <_ChromeMain+0x4616b04>
 461c8a4: 3853f3a9     	ldurb	w9, [x29, #-0xc1]
 461c8a8: 13001d28     	sxtb	w8, w9
 461c8ac: f85303aa     	ldur	x10, [x29, #-0xd0]
 461c8b0: 7100011f     	cmp	w8, #0x0
 461c8b4: 9a894142     	csel	x2, x10, x9, mi
 461c8b8: b4000722     	cbz	x2, 0x461c99c <_ChromeMain+0x4617700>
 461c8bc: 52800109     	mov	w9, #0x8                ; =8
 461c8c0: 381b73a9     	sturb	w9, [x29, #-0x49]
 461c8c4: d10183aa     	sub	x10, x29, #0x60
 461c8c8: 9100414b     	add	x11, x10, #0x10
 461c8cc: f004cb49     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c8d0: 9122e929     	add	x9, x9, #0x8ba
 461c8d4: eb09017f     	cmp	x11, x9
 461c8d8: fa498142     	ccmp	x10, x9, #0x2, hi
 461c8dc: 54fffca9     	b.ls	0x461c870 <_ChromeMain+0x46175d4>
 461c8e0: 3dc00120     	ldr	q0, [x9]
 461c8e4: 3d8042e0     	str	q0, [x23, #0x100]
 461c8e8: 781b03bf     	sturh	wzr, [x29, #-0x50]
 461c8ec: f85283a9     	ldur	x9, [x29, #-0xd8]
 461c8f0: 7100011f     	cmp	w8, #0x0
 461c8f4: d10363a8     	sub	x8, x29, #0xd8
 461c8f8: 9a884121     	csel	x1, x9, x8, mi
 461c8fc: d10183a0     	sub	x0, x29, #0x60
 461c900: 9717e6ba     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 461c904: f9400808     	ldr	x8, [x0, #0x10]
 461c908: 3dc00000     	ldr	q0, [x0]
 461c90c: 3d8033e0     	str	q0, [sp, #0xc0]
 461c910: f9006be8     	str	x8, [sp, #0xd0]
 461c914: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 461c918: f900001f     	str	xzr, [x0]
 461c91c: f004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c920: 91233021     	add	x1, x1, #0x8cc
 461c924: 910303e0     	add	x0, sp, #0xc0
 461c928: 52800362     	mov	w2, #0x1b               ; =27
 461c92c: 9717e6af     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 461c930: f9400015     	ldr	x21, [x0]
 461c934: 3cc08000     	ldur	q0, [x0, #0x8]
 461c938: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 461c93c: f900001f     	str	xzr, [x0]
 461c940: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 461c944: 36f800e8     	tbz	w8, #0x1f, 0x461c960 <_ChromeMain+0x46176c4>
 461c948: f94027e0     	ldr	x0, [sp, #0x48]
 461c94c: f9402fe8     	ldr	x8, [sp, #0x58]
 461c950: d37ff901     	lsl	x1, x8, #1
 461c954: 3d800fe0     	str	q0, [sp, #0x30]
 461c958: 96e7b158     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c95c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 461c960: f90027f5     	str	x21, [sp, #0x48]
 461c964: 3c8503e0     	stur	q0, [sp, #0x50]
 461c968: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 461c96c: 36f800a8     	tbz	w8, #0x1f, 0x461c980 <_ChromeMain+0x46176e4>
 461c970: f94063e0     	ldr	x0, [sp, #0xc0]
 461c974: f9406be8     	ldr	x8, [sp, #0xd0]
 461c978: d37ff901     	lsl	x1, x8, #1
 461c97c: 96e7b14f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c980: 38db73a8     	ldursb	w8, [x29, #-0x49]
 461c984: 36f80148     	tbz	w8, #0x1f, 0x461c9ac <_ChromeMain+0x4617710>
 461c988: f85a03a0     	ldur	x0, [x29, #-0x60]
 461c98c: f85b03a8     	ldur	x8, [x29, #-0x50]
 461c990: d37ff901     	lsl	x1, x8, #1
 461c994: 96e7b149     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461c998: 14000005     	b	0x461c9ac <_ChromeMain+0x4617710>
 461c99c: f004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461c9a0: 91218021     	add	x1, x1, #0x860
 461c9a4: 910123e0     	add	x0, sp, #0x48
 461c9a8: 97331c67     	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 461c9ac: f9400268     	ldr	x8, [x19]
 461c9b0: f9403508     	ldr	x8, [x8, #0x68]
 461c9b4: aa1303e0     	mov	x0, x19
 461c9b8: d63f0100     	blr	x8
 461c9bc: f9407008     	ldr	x8, [x0, #0xe0]
 461c9c0: b4fff5a8     	cbz	x8, 0x461c874 <_ChromeMain+0x46175d8>
 461c9c4: 19404108     	ldapurb	w8, [x8, #0x4]
 461c9c8: 35fff568     	cbnz	w8, 0x461c874 <_ChromeMain+0x46175d8>
 461c9cc: f9407408     	ldr	x8, [x0, #0xe8]
 461c9d0: b4fff528     	cbz	x8, 0x461c874 <_ChromeMain+0x46175d8>
 461c9d4: f9407008     	ldr	x8, [x0, #0xe0]
 461c9d8: b4000f28     	cbz	x8, 0x461cbbc <_ChromeMain+0x4617920>
 461c9dc: 19404108     	ldapurb	w8, [x8, #0x4]
 461c9e0: 35000ee8     	cbnz	w8, 0x461cbbc <_ChromeMain+0x4617920>
 461c9e4: f9407408     	ldr	x8, [x0, #0xe8]
 461c9e8: f9402508     	ldr	x8, [x8, #0x48]
 461c9ec: b4000f48     	cbz	x8, 0x461cbd4 <_ChromeMain+0x4617938>
 461c9f0: f940a515     	ldr	x21, [x8, #0x148]
 461c9f4: aa1503e0     	mov	x0, x21
 461c9f8: 94e79b5c     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461c9fc: 94e79b5b     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461ca00: 94e79b5a     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461ca04: 52800100     	mov	w0, #0x8                ; =8
 461ca08: 96e7ca58     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ca0c: aa0003f6     	mov	x22, x0
 461ca10: f900001f     	str	xzr, [x0]
 461ca14: aa1503e1     	mov	x1, x21
 461ca18: 95013dba     	bl	0x866c100 <_ChromeMain+0x8666e64>
 461ca1c: aa1503e0     	mov	x0, x21
 461ca20: 94e79b4f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461ca24: aa1503e0     	mov	x0, x21
 461ca28: 94e79b4d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461ca2c: aa1503e0     	mov	x0, x21
 461ca30: 94e79b4b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461ca34: a93a57b6     	stp	x22, x21, [x29, #-0x60]
 461ca38: 39817fe8     	ldrsb	x8, [sp, #0x5f]
 461ca3c: a944abe9     	ldp	x9, x10, [sp, #0x48]
 461ca40: 910123eb     	add	x11, sp, #0x48
 461ca44: f100011f     	cmp	x8, #0x0
 461ca48: 9a8b4135     	csel	x21, x9, x11, mi
 461ca4c: 7100011f     	cmp	w8, #0x0
 461ca50: 9a884156     	csel	x22, x10, x8, mi
 461ca54: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 461ca58: f9006bff     	str	xzr, [sp, #0xd0]
 461ca5c: f9451a77     	ldr	x23, [x19, #0xa30]
 461ca60: b40000d7     	cbz	x23, 0x461ca78 <_ChromeMain+0x46177dc>
 461ca64: 52800028     	mov	w8, #0x1                ; =1
 461ca68: b82802e8     	ldadd	w8, w8, [x23]
 461ca6c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461ca70: 6b09011f     	cmp	w8, w9
 461ca74: 54000aa0     	b.eq	0x461cbc8 <_ChromeMain+0x461792c>
 461ca78: 910303f8     	add	x24, sp, #0xc0
 461ca7c: f9451e73     	ldr	x19, [x19, #0xa38]
 461ca80: 52800800     	mov	w0, #0x40               ; =64
 461ca84: 96e7ca39     	bl	0xf368 <_ChromeMain+0xa0cc>
 461ca88: 52800028     	mov	w8, #0x1                ; =1
 461ca8c: b9000008     	str	w8, [x0]
 461ca90: 100420c8     	adr	x8, 0x4624ea8 <_ChromeMain+0x461fc0c>
 461ca94: d503201f     	nop
 461ca98: f0ffd449     	adrp	x9, 0x40a7000 <_ChromeMain+0x40a1d64>
 461ca9c: 910e0129     	add	x9, x9, #0x380
 461caa0: a900a408     	stp	x8, x9, [x0, #0x8]
 461caa4: b0fefa08     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 461caa8: 912c0108     	add	x8, x8, #0xb00
 461caac: f9000c08     	str	x8, [x0, #0x18]
 461cab0: a902cc17     	stp	x23, x19, [x0, #0x28]
 461cab4: f9001c14     	str	x20, [x0, #0x38]
 461cab8: a90183ff     	stp	xzr, x0, [sp, #0x18]
 461cabc: 528000c8     	mov	w8, #0x6                ; =6
 461cac0: f004cb49     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461cac4: 9120e929     	add	x9, x9, #0x83a
 461cac8: a900e3e8     	stp	x8, x24, [sp, #0x8]
 461cacc: f90003e9     	str	x9, [sp]
 461cad0: f004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461cad4: 91241021     	add	x1, x1, #0x904
 461cad8: f004cb46     	adrp	x6, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461cadc: 911c68c6     	add	x6, x6, #0x71a
 461cae0: d10183a0     	sub	x0, x29, #0x60
 461cae4: 528001a2     	mov	w2, #0xd                ; =13
 461cae8: aa1503e3     	mov	x3, x21
 461caec: aa1603e4     	mov	x4, x22
 461caf0: 52800025     	mov	w5, #0x1                ; =1
 461caf4: 528000c7     	mov	w7, #0x6                ; =6
 461caf8: 97efe8c1     	bl	0x4216dfc <_ChromeMain+0x4211b60>
 461cafc: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 461cb00: 36f800a8     	tbz	w8, #0x1f, 0x461cb14 <_ChromeMain+0x4617878>
 461cb04: f94063e0     	ldr	x0, [sp, #0xc0]
 461cb08: f9406be8     	ldr	x8, [sp, #0xd0]
 461cb0c: d37ff901     	lsl	x1, x8, #1
 461cb10: 96e7b0ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461cb14: f85a03b3     	ldur	x19, [x29, #-0x60]
 461cb18: f81a03bf     	stur	xzr, [x29, #-0x60]
 461cb1c: b40000d3     	cbz	x19, 0x461cb34 <_ChromeMain+0x4617898>
 461cb20: aa1303e0     	mov	x0, x19
 461cb24: 95013d7d     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 461cb28: aa1303e0     	mov	x0, x19
 461cb2c: 52800101     	mov	w1, #0x8                ; =8
 461cb30: 96e7b0e2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461cb34: 38d3f3a8     	ldursb	w8, [x29, #-0xc1]
 461cb38: 36f800a8     	tbz	w8, #0x1f, 0x461cb4c <_ChromeMain+0x46178b0>
 461cb3c: f85283a0     	ldur	x0, [x29, #-0xd8]
 461cb40: f85383a8     	ldur	x8, [x29, #-0xc8]
 461cb44: d37ff901     	lsl	x1, x8, #1
 461cb48: 96e7b0dc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461cb4c: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 461cb50: 36ffc3e8     	tbz	w8, #0x1f, 0x461c3cc <_ChromeMain+0x4617130>
 461cb54: f94027e0     	ldr	x0, [sp, #0x48]
 461cb58: f9402fe8     	ldr	x8, [sp, #0x58]
 461cb5c: d37ff901     	lsl	x1, x8, #1
 461cb60: 14000015     	b	0x461cbb4 <_ChromeMain+0x4617918>
 461cb64: 90048641     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 461cb68: 913fe021     	add	x1, x1, #0xff8
 461cb6c: 910123f4     	add	x20, sp, #0x48
 461cb70: 910123e0     	add	x0, sp, #0x48
 461cb74: 52800242     	mov	w2, #0x12               ; =18
 461cb78: 96f54d97     	bl	0x3701d4 <_ChromeMain+0x36af38>
 461cb7c: d100a260     	sub	x0, x19, #0x28
 461cb80: 910123e1     	add	x1, sp, #0x48
 461cb84: 52800022     	mov	w2, #0x1                ; =1
 461cb88: 95ed78bc     	bl	0xc17ae78 <_ChromeMain+0xc175bdc>
 461cb8c: 9101c280     	add	x0, x20, #0x70
 461cb90: d2800001     	mov	x1, #0x0                ; =0
 461cb94: 96e82c49     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461cb98: 91008280     	add	x0, x20, #0x20
 461cb9c: 96e82c37     	bl	0x27c78 <_ChromeMain+0x229dc>
 461cba0: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 461cba4: 36ffc148     	tbz	w8, #0x1f, 0x461c3cc <_ChromeMain+0x4617130>
 461cba8: f94027e0     	ldr	x0, [sp, #0x48]
 461cbac: f9402fe8     	ldr	x8, [sp, #0x58]
 461cbb0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461cbb4: 96e7b0c1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461cbb8: 17fffe05     	b	0x461c3cc <_ChromeMain+0x4617130>
 461cbbc: d4200000     	brk	#0
 461cbc0: d4400000     	hlt	#0
 461cbc4: d4200020     	brk	#0x1
 461cbc8: d4200000     	brk	#0
 461cbcc: d4400000     	hlt	#0
 461cbd0: d4200020     	brk	#0x1
 461cbd4: d2800000     	mov	x0, #0x0                ; =0
 461cbd8: 94e79ae4     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461cbdc: d2800000     	mov	x0, #0x0                ; =0
 461cbe0: 94e79ae2     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461cbe4: 52800100     	mov	w0, #0x8                ; =8
 461cbe8: 96e7c9e0     	bl	0xf368 <_ChromeMain+0xa0cc>
 461cbec: aa0003f6     	mov	x22, x0
 461cbf0: f900001f     	str	xzr, [x0]
 461cbf4: d2800001     	mov	x1, #0x0                ; =0
 461cbf8: 95013d42     	bl	0x866c100 <_ChromeMain+0x8666e64>
 461cbfc: d2800015     	mov	x21, #0x0               ; =0
 461cc00: 17ffff89     	b	0x461ca24 <_ChromeMain+0x4617788>
 461cc04: d4200000     	brk	#0
 461cc08: d4400000     	hlt	#0
 461cc0c: 17ffff19     	b	0x461c870 <_ChromeMain+0x46175d4>
 461cc10: d4200000     	brk	#0
 461cc14: d4400000     	hlt	#0
 461cc18: d4200020     	brk	#0x1
 461cc1c: d4200000     	brk	#0
 461cc20: d4400000     	hlt	#0
 461cc24: d4200020     	brk	#0x1
 461cc28: d4200000     	brk	#0
 461cc2c: d4400000     	hlt	#0
 461cc30: d4200020     	brk	#0x1
 461cc34: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 461cc38: a90167fa     	stp	x26, x25, [sp, #0x10]
 461cc3c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 461cc40: a90357f6     	stp	x22, x21, [sp, #0x30]
 461cc44: a9044ff4     	stp	x20, x19, [sp, #0x40]
 461cc48: a9057bfd     	stp	x29, x30, [sp, #0x50]
 461cc4c: 910143fd     	add	x29, sp, #0x50
 461cc50: d10983ff     	sub	sp, sp, #0x260
 461cc54: f944dc08     	ldr	x8, [x0, #0x9b8]
 461cc58: eb08003f     	cmp	x1, x8
 461cc5c: 54000301     	b.ne	0x461ccbc <_ChromeMain+0x4617a20>
 461cc60: aa0003f3     	mov	x19, x0
 461cc64: f944d014     	ldr	x20, [x0, #0x9a0]
 461cc68: 3966a016     	ldrb	w22, [x0, #0x9a8]
 461cc6c: b949c415     	ldr	w21, [x0, #0x9c4]
 461cc70: 91000428     	add	x8, x1, #0x1
 461cc74: f904dc08     	str	x8, [x0, #0x9b8]
 461cc78: f9435800     	ldr	x0, [x0, #0x6b0]
 461cc7c: f9035a7f     	str	xzr, [x19, #0x6b0]
 461cc80: b4000080     	cbz	x0, 0x461cc90 <_ChromeMain+0x46179f4>
 461cc84: 978a78a6     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 461cc88: 52800301     	mov	w1, #0x18               ; =24
 461cc8c: 96e7b08b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461cc90: f9435660     	ldr	x0, [x19, #0x6a8]
 461cc94: f903567f     	str	xzr, [x19, #0x6a8]
 461cc98: b4000080     	cbz	x0, 0x461cca8 <_ChromeMain+0x4617a0c>
 461cc9c: f9400008     	ldr	x8, [x0]
 461cca0: f9400508     	ldr	x8, [x8, #0x8]
 461cca4: d63f0100     	blr	x8
 461cca8: 3966a268     	ldrb	w8, [x19, #0x9a8]
 461ccac: 34000048     	cbz	w8, 0x461ccb4 <_ChromeMain+0x4617a18>
 461ccb0: 3926a27f     	strb	wzr, [x19, #0x9a8]
 461ccb4: b909c67f     	str	wzr, [x19, #0x9c4]
 461ccb8: 37000136     	tbnz	w22, #0x0, 0x461ccdc <_ChromeMain+0x4617a40>
 461ccbc: 910983ff     	add	sp, sp, #0x260
 461ccc0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 461ccc4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 461ccc8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 461cccc: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 461ccd0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 461ccd4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 461ccd8: d65f03c0     	ret
 461ccdc: 71000ebf     	cmp	w21, #0x3
 461cce0: 5400016d     	b.le	0x461cd0c <_ChromeMain+0x4617a70>
 461cce4: 710016bf     	cmp	w21, #0x5
 461cce8: 5400028c     	b.gt	0x461cd38 <_ChromeMain+0x4617a9c>
 461ccec: 710012bf     	cmp	w21, #0x4
 461ccf0: 54000340     	b.eq	0x461cd58 <_ChromeMain+0x4617abc>
 461ccf4: 710016bf     	cmp	w21, #0x5
 461ccf8: 54fffe21     	b.ne	0x461ccbc <_ChromeMain+0x4617a20>
 461ccfc: aa1303e0     	mov	x0, x19
 461cd00: aa1403e1     	mov	x1, x20
 461cd04: 52800d02     	mov	w2, #0x68               ; =104
 461cd08: 1400001b     	b	0x461cd74 <_ChromeMain+0x4617ad8>
 461cd0c: 9103c3f8     	add	x24, sp, #0xf0
 461cd10: 710006bf     	cmp	w21, #0x1
 461cd14: 54000400     	b.eq	0x461cd94 <_ChromeMain+0x4617af8>
 461cd18: 71000abf     	cmp	w21, #0x2
 461cd1c: 54000660     	b.eq	0x461cde8 <_ChromeMain+0x4617b4c>
 461cd20: 71000ebf     	cmp	w21, #0x3
 461cd24: 54fffcc1     	b.ne	0x461ccbc <_ChromeMain+0x4617a20>
 461cd28: aa1303e0     	mov	x0, x19
 461cd2c: aa1403e1     	mov	x1, x20
 461cd30: 52800cc2     	mov	w2, #0x66               ; =102
 461cd34: 14000010     	b	0x461cd74 <_ChromeMain+0x4617ad8>
 461cd38: 71001abf     	cmp	w21, #0x6
 461cd3c: 54000160     	b.eq	0x461cd68 <_ChromeMain+0x4617acc>
 461cd40: 71001ebf     	cmp	w21, #0x7
 461cd44: 54fffbc1     	b.ne	0x461ccbc <_ChromeMain+0x4617a20>
 461cd48: aa1303e0     	mov	x0, x19
 461cd4c: aa1403e1     	mov	x1, x20
 461cd50: 52800d42     	mov	w2, #0x6a               ; =106
 461cd54: 14000008     	b	0x461cd74 <_ChromeMain+0x4617ad8>
 461cd58: aa1303e0     	mov	x0, x19
 461cd5c: aa1403e1     	mov	x1, x20
 461cd60: 52800ce2     	mov	w2, #0x67               ; =103
 461cd64: 14000004     	b	0x461cd74 <_ChromeMain+0x4617ad8>
 461cd68: aa1303e0     	mov	x0, x19
 461cd6c: aa1403e1     	mov	x1, x20
 461cd70: 52800d22     	mov	w2, #0x69               ; =105
 461cd74: 910983ff     	add	sp, sp, #0x260
 461cd78: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 461cd7c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 461cd80: a94357f6     	ldp	x22, x21, [sp, #0x30]
 461cd84: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 461cd88: a94167fa     	ldp	x26, x25, [sp, #0x10]
 461cd8c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 461cd90: 14000438     	b	0x461de70 <_ChromeMain+0x4618bd4>
 461cd94: f9429a68     	ldr	x8, [x19, #0x530]
 461cd98: b4fff928     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cd9c: 39408508     	ldrb	w8, [x8, #0x21]
 461cda0: 34fff8e8     	cbz	w8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cda4: f9400268     	ldr	x8, [x19]
 461cda8: f9403508     	ldr	x8, [x8, #0x68]
 461cdac: aa1303e0     	mov	x0, x19
 461cdb0: d63f0100     	blr	x8
 461cdb4: b4fff840     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461cdb8: f9428e68     	ldr	x8, [x19, #0x518]
 461cdbc: b4fff808     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cdc0: aa1303e0     	mov	x0, x19
 461cdc4: aa1403e1     	mov	x1, x20
 461cdc8: 97ffdddc     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461cdcc: b4fff780     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461cdd0: aa0003f5     	mov	x21, x0
 461cdd4: b940f808     	ldr	w8, [x0, #0xf8]
 461cdd8: 35fff728     	cbnz	w8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cddc: 3944e2a8     	ldrb	w8, [x21, #0x138]
 461cde0: 3707f6e8     	tbnz	w8, #0x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461cde4: 1400001e     	b	0x461ce5c <_ChromeMain+0x4617bc0>
 461cde8: f9429a68     	ldr	x8, [x19, #0x530]
 461cdec: b4fff688     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cdf0: 39408508     	ldrb	w8, [x8, #0x21]
 461cdf4: 34fff648     	cbz	w8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cdf8: f9400268     	ldr	x8, [x19]
 461cdfc: f9403508     	ldr	x8, [x8, #0x68]
 461ce00: aa1303e0     	mov	x0, x19
 461ce04: d63f0100     	blr	x8
 461ce08: b4fff5a0     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce0c: aa1303e0     	mov	x0, x19
 461ce10: aa1403e1     	mov	x1, x20
 461ce14: 97ffddc9     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461ce18: b4fff520     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce1c: aa0003f5     	mov	x21, x0
 461ce20: b940f808     	ldr	w8, [x0, #0xf8]
 461ce24: 35fff4c8     	cbnz	w8, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce28: 3944e2a8     	ldrb	w8, [x21, #0x138]
 461ce2c: 3707f488     	tbnz	w8, #0x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce30: 1400017d     	b	0x461d424 <_ChromeMain+0x4618188>
 461ce34: f9400ee0     	ldr	x0, [x23, #0x18]
 461ce38: f94016e8     	ldr	x8, [x23, #0x28]
 461ce3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461ce40: 96e7b01e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ce44: 14000058     	b	0x461cfa4 <_ChromeMain+0x4617d08>
 461ce48: f9401ae0     	ldr	x0, [x23, #0x30]
 461ce4c: f94022e8     	ldr	x8, [x23, #0x40]
 461ce50: d37ff901     	lsl	x1, x8, #1
 461ce54: 96e7b019     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ce58: 1400006a     	b	0x461d000 <_ChromeMain+0x4617d64>
 461ce5c: f9429a68     	ldr	x8, [x19, #0x530]
 461ce60: b4fff2e8     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce64: f9428e68     	ldr	x8, [x19, #0x518]
 461ce68: b4fff2a8     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce6c: f9402100     	ldr	x0, [x8, #0x40]
 461ce70: b4fff260     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce74: f9400008     	ldr	x8, [x0]
 461ce78: f940b908     	ldr	x8, [x8, #0x170]
 461ce7c: d63f0100     	blr	x8
 461ce80: d0044621     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 461ce84: 910ab421     	add	x1, x1, #0x2ad
 461ce88: 52800322     	mov	w2, #0x19               ; =25
 461ce8c: 96f3a59d     	bl	0x306500 <_ChromeMain+0x301264>
 461ce90: 34fff160     	cbz	w0, 0x461ccbc <_ChromeMain+0x4617a20>
 461ce94: f9429a68     	ldr	x8, [x19, #0x530]
 461ce98: f9405508     	ldr	x8, [x8, #0xa8]
 461ce9c: b4fff108     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461cea0: f9404108     	ldr	x8, [x8, #0x80]
 461cea4: b4000108     	cbz	x8, 0x461cec4 <_ChromeMain+0x4617c28>
 461cea8: f9402908     	ldr	x8, [x8, #0x50]
 461ceac: aa1503e9     	mov	x9, x21
 461ceb0: b4004728     	cbz	x8, 0x461d794 <_ChromeMain+0x46184f8>
 461ceb4: eb09011f     	cmp	x8, x9
 461ceb8: 540046e0     	b.eq	0x461d794 <_ChromeMain+0x46184f8>
 461cebc: f9401d29     	ldr	x9, [x9, #0x38]
 461cec0: b5ffff89     	cbnz	x9, 0x461ceb0 <_ChromeMain+0x4617c14>
 461cec4: 5280a700     	mov	w0, #0x538              ; =1336
 461cec8: 96e7c928     	bl	0xf368 <_ChromeMain+0xa0cc>
 461cecc: aa0003f7     	mov	x23, x0
 461ced0: d2800001     	mov	x1, #0x0                ; =0
 461ced4: 951c7166     	bl	0x8d3946c <_ChromeMain+0x8d341d0>
 461ced8: f81a83a0     	stur	x0, [x29, #-0x58]
 461cedc: f9451a79     	ldr	x25, [x19, #0xa30]
 461cee0: b40000d9     	cbz	x25, 0x461cef8 <_ChromeMain+0x4617c5c>
 461cee4: 52800028     	mov	w8, #0x1                ; =1
 461cee8: b8280328     	ldadd	w8, w8, [x25]
 461ceec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461cef0: 6b09011f     	cmp	w8, w9
 461cef4: 54004620     	b.eq	0x461d7b8 <_ChromeMain+0x461851c>
 461cef8: f9451e7a     	ldr	x26, [x19, #0xa38]
 461cefc: 52800a00     	mov	w0, #0x50               ; =80
 461cf00: 96e7c91a     	bl	0xf368 <_ChromeMain+0xa0cc>
 461cf04: aa0003f6     	mov	x22, x0
 461cf08: 52800028     	mov	w8, #0x1                ; =1
 461cf0c: b9000008     	str	w8, [x0]
 461cf10: 1003f7c8     	adr	x8, 0x4624e08 <_ChromeMain+0x461fb6c>
 461cf14: d503201f     	nop
 461cf18: b0ffca89     	adrp	x9, 0x3f6d000 <_ChromeMain+0x3f67d64>
 461cf1c: 91070129     	add	x9, x9, #0x1c0
 461cf20: a900a408     	stp	x8, x9, [x0, #0x8]
 461cf24: d0ffd488     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 461cf28: 911b0108     	add	x8, x8, #0x6c0
 461cf2c: 100052c9     	adr	x9, 0x461d984 <_ChromeMain+0x46186e8>
 461cf30: d503201f     	nop
 461cf34: a901a408     	stp	x8, x9, [x0, #0x18]
 461cf38: a902e41f     	stp	xzr, x25, [x0, #0x28]
 461cf3c: a903d01a     	stp	x26, x20, [x0, #0x38]
 461cf40: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 461cf44: d0052ca9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461cf48: f9404529     	ldr	x9, [x9, #0x88]
 461cf4c: eb09011f     	cmp	x8, x9
 461cf50: 54000061     	b.ne	0x461cf5c <_ChromeMain+0x4617cc0>
 461cf54: aa1703e0     	mov	x0, x23
 461cf58: 96e7dce9     	bl	0x142fc <_ChromeMain+0xf060>
 461cf5c: f90026d7     	str	x23, [x22, #0x48]
 461cf60: 52800600     	mov	w0, #0x30               ; =48
 461cf64: 96e7c901     	bl	0xf368 <_ChromeMain+0xa0cc>
 461cf68: 91008009     	add	x9, x0, #0x20
 461cf6c: eb00013f     	cmp	x9, x0
 461cf70: 54002583     	b.lo	0x461d420 <_ChromeMain+0x4618184>
 461cf74: aa0003f4     	mov	x20, x0
 461cf78: f004c568     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 461cf7c: 911f3508     	add	x8, x8, #0x7cd
 461cf80: eb08013f     	cmp	x9, x8
 461cf84: fa488002     	ccmp	x0, x8, #0x2, hi
 461cf88: 540024c9     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461cf8c: ad400500     	ldp	q0, q1, [x8]
 461cf90: ad000680     	stp	q0, q1, [x20]
 461cf94: 3900829f     	strb	wzr, [x20, #0x20]
 461cf98: f85a83b7     	ldur	x23, [x29, #-0x58]
 461cf9c: 39c0bee8     	ldrsb	w8, [x23, #0x2f]
 461cfa0: 37fff4a8     	tbnz	w8, #0x1f, 0x461ce34 <_ChromeMain+0x4617b98>
 461cfa4: f9000ef4     	str	x20, [x23, #0x18]
 461cfa8: f004c8e8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 461cfac: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 461cfb0: 3d800ae0     	str	q0, [x23, #0x20]
 461cfb4: 52800400     	mov	w0, #0x20               ; =32
 461cfb8: 96e7c8ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 461cfbc: 91006809     	add	x9, x0, #0x1a
 461cfc0: eb00013f     	cmp	x9, x0
 461cfc4: 540022e3     	b.lo	0x461d420 <_ChromeMain+0x4618184>
 461cfc8: aa0003f4     	mov	x20, x0
 461cfcc: f004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461cfd0: 91248108     	add	x8, x8, #0x920
 461cfd4: eb08013f     	cmp	x9, x8
 461cfd8: fa488002     	ccmp	x0, x8, #0x2, hi
 461cfdc: 54002229     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461cfe0: 3dc00100     	ldr	q0, [x8]
 461cfe4: 3d800280     	str	q0, [x20]
 461cfe8: 3cc0a100     	ldur	q0, [x8, #0xa]
 461cfec: 3c80a280     	stur	q0, [x20, #0xa]
 461cff0: 7900369f     	strh	wzr, [x20, #0x1a]
 461cff4: f85a83b7     	ldur	x23, [x29, #-0x58]
 461cff8: 39c11ee8     	ldrsb	w8, [x23, #0x47]
 461cffc: 37fff268     	tbnz	w8, #0x1f, 0x461ce48 <_ChromeMain+0x4617bac>
 461d000: f9001af4     	str	x20, [x23, #0x30]
 461d004: d004c908     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 461d008: 3dc02d00     	ldr	q0, [x8, #0xb0]
 461d00c: 3c8382e0     	stur	q0, [x23, #0x38]
 461d010: a9395bbf     	stp	xzr, x22, [x29, #-0x70]
 461d014: 52800034     	mov	w20, #0x1               ; =1
 461d018: 381a03b4     	sturb	w20, [x29, #-0x60]
 461d01c: 381483b4     	sturb	w20, [x29, #-0xb8]
 461d020: 381743bf     	sturb	wzr, [x29, #-0x8c]
 461d024: 6f00e400     	movi.2d	v0, #0000000000000000
 461d028: d102e3a8     	sub	x8, x29, #0xb8
 461d02c: 3c808100     	stur	q0, [x8, #0x8]
 461d030: 3c818100     	stur	q0, [x8, #0x18]
 461d034: 381703bf     	sturb	wzr, [x29, #-0x90]
 461d038: 381783b4     	sturb	w20, [x29, #-0x88]
 461d03c: d10343a8     	sub	x8, x29, #0xd0
 461d040: 91002109     	add	x9, x8, #0x8
 461d044: d004cb4a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d048: 9124f14a     	add	x10, x10, #0x93c
 461d04c: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 461d050: eb0a013f     	cmp	x9, x10
 461d054: 52800089     	mov	w9, #0x4                ; =4
 461d058: fa4a8102     	ccmp	x8, x10, #0x2, hi
 461d05c: 381473a9     	sturb	w9, [x29, #-0xb9]
 461d060: 54001e09     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d064: d2800a68     	mov	x8, #0x53               ; =83
 461d068: f2a00c28     	movk	x8, #0x61, lsl #16
 461d06c: f2c00ec8     	movk	x8, #0x76, lsl #32
 461d070: f2e00ca8     	movk	x8, #0x65, lsl #48
 461d074: f81303a8     	stur	x8, [x29, #-0xd0]
 461d078: 781383bf     	sturh	wzr, [x29, #-0xc8]
 461d07c: d102e3a0     	sub	x0, x29, #0xb8
 461d080: d10343a1     	sub	x1, x29, #0xd0
 461d084: 951c6f7c     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 461d088: aa0003e2     	mov	x2, x0
 461d08c: d10163a0     	sub	x0, x29, #0x58
 461d090: d101a3a1     	sub	x1, x29, #0x68
 461d094: 951c7028     	bl	0x8d39134 <_ChromeMain+0x8d33e98>
 461d098: 381283bf     	sturb	wzr, [x29, #-0xd8]
 461d09c: 390603f4     	strb	w20, [sp, #0x180]
 461d0a0: 3906b3ff     	strb	wzr, [sp, #0x1ac]
 461d0a4: 6f00e400     	movi.2d	v0, #0000000000000000
 461d0a8: 3c898300     	stur	q0, [x24, #0x98]
 461d0ac: 3c8a8300     	stur	q0, [x24, #0xa8]
 461d0b0: 3906a3ff     	strb	wzr, [sp, #0x1a8]
 461d0b4: 3906c3f4     	strb	w20, [sp, #0x1b0]
 461d0b8: a91c7fff     	stp	xzr, xzr, [sp, #0x1c0]
 461d0bc: 9105a3e9     	add	x9, sp, #0x168
 461d0c0: 9100312a     	add	x10, x9, #0xc
 461d0c4: d004cb48     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d0c8: 9120e908     	add	x8, x8, #0x83a
 461d0cc: f900dfff     	str	xzr, [sp, #0x1b8]
 461d0d0: eb08015f     	cmp	x10, x8
 461d0d4: 528000ca     	mov	w10, #0x6               ; =6
 461d0d8: fa488122     	ccmp	x9, x8, #0x2, hi
 461d0dc: 3905ffea     	strb	w10, [sp, #0x17f]
 461d0e0: 54001a09     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d0e4: 52800ca9     	mov	w9, #0x65               ; =101
 461d0e8: 72a00d89     	movk	w9, #0x6c, lsl #16
 461d0ec: b90173e9     	str	w9, [sp, #0x170]
 461d0f0: f9400108     	ldr	x8, [x8]
 461d0f4: f900b7e8     	str	x8, [sp, #0x168]
 461d0f8: 7902ebff     	strh	wzr, [sp, #0x174]
 461d0fc: 910603e0     	add	x0, sp, #0x180
 461d100: 9105a3e1     	add	x1, sp, #0x168
 461d104: 951c6f5c     	bl	0x8d38e74 <_ChromeMain+0x8d33bd8>
 461d108: aa0003e2     	mov	x2, x0
 461d10c: d10163a0     	sub	x0, x29, #0x58
 461d110: d10383a1     	sub	x1, x29, #0xe0
 461d114: 951c706a     	bl	0x8d392bc <_ChromeMain+0x8d34020>
 461d118: 52800088     	mov	w8, #0x4                ; =4
 461d11c: 39059fe8     	strb	w8, [sp, #0x167]
 461d120: 910543e8     	add	x8, sp, #0x150
 461d124: 91002109     	add	x9, x8, #0x8
 461d128: d004cb54     	adrp	x20, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d12c: 91251a94     	add	x20, x20, #0x946
 461d130: eb14013f     	cmp	x9, x20
 461d134: fa548102     	ccmp	x8, x20, #0x2, hi
 461d138: 54001749     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d13c: d28009d6     	mov	x22, #0x4e              ; =78
 461d140: f2a00c36     	movk	x22, #0x61, lsl #16
 461d144: f2c00db6     	movk	x22, #0x6d, lsl #32
 461d148: f2e00cb6     	movk	x22, #0x65, lsl #48
 461d14c: f900abf6     	str	x22, [sp, #0x150]
 461d150: 7902b3ff     	strh	wzr, [sp, #0x158]
 461d154: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 461d158: 37f800c8     	tbnz	w8, #0x1f, 0x461d170 <_ChromeMain+0x4617ed4>
 461d15c: 3cc082a0     	ldur	q0, [x21, #0x8]
 461d160: f84182a8     	ldur	x8, [x21, #0x18]
 461d164: f900a3e8     	str	x8, [sp, #0x140]
 461d168: 3d801300     	str	q0, [x24, #0x40]
 461d16c: 14000004     	b	0x461d17c <_ChromeMain+0x4617ee0>
 461d170: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 461d174: 9104c3e0     	add	x0, sp, #0x130
 461d178: 96e8a696     	bl	0x46bd0 <_ChromeMain+0x41934>
 461d17c: 52800028     	mov	w8, #0x1                ; =1
 461d180: 3903c3e8     	strb	w8, [sp, #0xf0]
 461d184: 6f00e400     	movi.2d	v0, #0000000000000000
 461d188: 3c808300     	stur	q0, [x24, #0x8]
 461d18c: 3c818300     	stur	q0, [x24, #0x18]
 461d190: 3c828300     	stur	q0, [x24, #0x28]
 461d194: f90097ff     	str	xzr, [sp, #0x128]
 461d198: 52800088     	mov	w8, #0x4                ; =4
 461d19c: 3903bfe8     	strb	w8, [sp, #0xef]
 461d1a0: 910363e8     	add	x8, sp, #0xd8
 461d1a4: 91002109     	add	x9, x8, #0x8
 461d1a8: eb14013f     	cmp	x9, x20
 461d1ac: fa548102     	ccmp	x8, x20, #0x2, hi
 461d1b0: 54001389     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d1b4: f9006ff6     	str	x22, [sp, #0xd8]
 461d1b8: 7901c3ff     	strh	wzr, [sp, #0xe0]
 461d1bc: f94077e8     	ldr	x8, [sp, #0xe8]
 461d1c0: f9008be8     	str	x8, [sp, #0x110]
 461d1c4: 3ccd83e0     	ldur	q0, [sp, #0xd8]
 461d1c8: 3d800700     	str	q0, [x24, #0x10]
 461d1cc: 900525d4     	adrp	x20, 0xead5000 <dyld_stub_binder+0xead5000>
 461d1d0: 911fc294     	add	x20, x20, #0x7f0
 461d1d4: d10163a0     	sub	x0, x29, #0x58
 461d1d8: 910543e2     	add	x2, sp, #0x150
 461d1dc: 9104c3e3     	add	x3, sp, #0x130
 461d1e0: 9103c3e4     	add	x4, sp, #0xf0
 461d1e4: aa1403e1     	mov	x1, x20
 461d1e8: 94e2c015     	bl	0x7ecd23c <_ChromeMain+0x7ec7fa0>
 461d1ec: 52800077     	mov	w23, #0x3               ; =3
 461d1f0: 39035ff7     	strb	w23, [sp, #0xd7]
 461d1f4: 910303e8     	add	x8, sp, #0xc0
 461d1f8: b27f0509     	orr	x9, x8, #0x6
 461d1fc: d004cb58     	adrp	x24, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d200: 91254318     	add	x24, x24, #0x950
 461d204: eb18013f     	cmp	x9, x24
 461d208: fa588102     	ccmp	x8, x24, #0x2, hi
 461d20c: 540010a9     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d210: aa0003f6     	mov	x22, x0
 461d214: d2800ab9     	mov	x25, #0x55              ; =85
 461d218: f2a00a59     	movk	x25, #0x52, lsl #16
 461d21c: f2c00999     	movk	x25, #0x4c, lsl #32
 461d220: f90063f9     	str	x25, [sp, #0xc0]
 461d224: 910202a0     	add	x0, x21, #0x80
 461d228: 97013e18     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 461d22c: 39805c08     	ldrsb	x8, [x0, #0x17]
 461d230: a9402809     	ldp	x9, x10, [x0]
 461d234: f100011f     	cmp	x8, #0x0
 461d238: 9a804120     	csel	x0, x9, x0, mi
 461d23c: 7100011f     	cmp	w8, #0x0
 461d240: 9a884141     	csel	x1, x10, x8, mi
 461d244: 9102a3e8     	add	x8, sp, #0xa8
 461d248: 970b1432     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 461d24c: 52800028     	mov	w8, #0x1                ; =1
 461d250: 390183e8     	strb	w8, [sp, #0x60]
 461d254: 6f00e400     	movi.2d	v0, #0000000000000000
 461d258: 3c8683e0     	stur	q0, [sp, #0x68]
 461d25c: 3c8783e0     	stur	q0, [sp, #0x78]
 461d260: 3c8883e0     	stur	q0, [sp, #0x88]
 461d264: f9004fff     	str	xzr, [sp, #0x98]
 461d268: 39017ff7     	strb	w23, [sp, #0x5f]
 461d26c: 910123e8     	add	x8, sp, #0x48
 461d270: b27f0509     	orr	x9, x8, #0x6
 461d274: eb18013f     	cmp	x9, x24
 461d278: fa588102     	ccmp	x8, x24, #0x2, hi
 461d27c: 54000d29     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d280: f90027f9     	str	x25, [sp, #0x48]
 461d284: f9402fe8     	ldr	x8, [sp, #0x58]
 461d288: f90043e8     	str	x8, [sp, #0x80]
 461d28c: 3cc483e0     	ldur	q0, [sp, #0x48]
 461d290: 3d801fe0     	str	q0, [sp, #0x70]
 461d294: 900525c1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 461d298: 911fe021     	add	x1, x1, #0x7f8
 461d29c: 910303e2     	add	x2, sp, #0xc0
 461d2a0: 9102a3e3     	add	x3, sp, #0xa8
 461d2a4: 910183e4     	add	x4, sp, #0x60
 461d2a8: aa1603e0     	mov	x0, x22
 461d2ac: 94e2bfe4     	bl	0x7ecd23c <_ChromeMain+0x7ec7fa0>
 461d2b0: f9400008     	ldr	x8, [x0]
 461d2b4: f9412d09     	ldr	x9, [x8, #0x258]
 461d2b8: b5002869     	cbnz	x9, 0x461d7c4 <_ChromeMain+0x4618528>
 461d2bc: f9012d14     	str	x20, [x8, #0x258]
 461d2c0: 910183e0     	add	x0, sp, #0x60
 461d2c4: 951c77e2     	bl	0x8d3b24c <_ChromeMain+0x8d35fb0>
 461d2c8: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 461d2cc: 36f800a8     	tbz	w8, #0x1f, 0x461d2e0 <_ChromeMain+0x4618044>
 461d2d0: f94057e0     	ldr	x0, [sp, #0xa8]
 461d2d4: f9405fe8     	ldr	x8, [sp, #0xb8]
 461d2d8: d37ff901     	lsl	x1, x8, #1
 461d2dc: 96e7aef7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d2e0: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 461d2e4: 36f800a8     	tbz	w8, #0x1f, 0x461d2f8 <_ChromeMain+0x461805c>
 461d2e8: f94063e0     	ldr	x0, [sp, #0xc0]
 461d2ec: f9406be8     	ldr	x8, [sp, #0xd0]
 461d2f0: d37ff901     	lsl	x1, x8, #1
 461d2f4: 96e7aef1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d2f8: 9103c3e0     	add	x0, sp, #0xf0
 461d2fc: 951c77d4     	bl	0x8d3b24c <_ChromeMain+0x8d35fb0>
 461d300: 39c51fe8     	ldrsb	w8, [sp, #0x147]
 461d304: 36f800a8     	tbz	w8, #0x1f, 0x461d318 <_ChromeMain+0x461807c>
 461d308: f9409be0     	ldr	x0, [sp, #0x130]
 461d30c: f940a3e8     	ldr	x8, [sp, #0x140]
 461d310: d37ff901     	lsl	x1, x8, #1
 461d314: 96e7aee9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d318: 39c59fe8     	ldrsb	w8, [sp, #0x167]
 461d31c: 36f800a8     	tbz	w8, #0x1f, 0x461d330 <_ChromeMain+0x4618094>
 461d320: f940abe0     	ldr	x0, [sp, #0x150]
 461d324: f940b3e8     	ldr	x8, [sp, #0x160]
 461d328: d37ff901     	lsl	x1, x8, #1
 461d32c: 96e7aee3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d330: 39c5ffe8     	ldrsb	w8, [sp, #0x17f]
 461d334: 36f800a8     	tbz	w8, #0x1f, 0x461d348 <_ChromeMain+0x46180ac>
 461d338: f940b7e0     	ldr	x0, [sp, #0x168]
 461d33c: f940bfe8     	ldr	x8, [sp, #0x178]
 461d340: d37ff901     	lsl	x1, x8, #1
 461d344: 96e7aedd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d348: 910603e0     	add	x0, sp, #0x180
 461d34c: 951c6eaa     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 461d350: 385283a8     	ldurb	w8, [x29, #-0xd8]
 461d354: 7100051f     	cmp	w8, #0x1
 461d358: 5400008d     	b.le	0x461d368 <_ChromeMain+0x46180cc>
 461d35c: 7100091f     	cmp	w8, #0x2
 461d360: 540000a1     	b.ne	0x461d374 <_ChromeMain+0x46180d8>
 461d364: 14000002     	b	0x461d36c <_ChromeMain+0x46180d0>
 461d368: 34000068     	cbz	w8, 0x461d374 <_ChromeMain+0x46180d8>
 461d36c: f85203a0     	ldur	x0, [x29, #-0xe0]
 461d370: b50004a0     	cbnz	x0, 0x461d404 <_ChromeMain+0x4618168>
 461d374: 52801fe8     	mov	w8, #0xff               ; =255
 461d378: 381283a8     	sturb	w8, [x29, #-0xd8]
 461d37c: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 461d380: 36f800a8     	tbz	w8, #0x1f, 0x461d394 <_ChromeMain+0x46180f8>
 461d384: f85303a0     	ldur	x0, [x29, #-0xd0]
 461d388: f85403a8     	ldur	x8, [x29, #-0xc0]
 461d38c: d37ff901     	lsl	x1, x8, #1
 461d390: 96e7aeca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d394: d102e3a0     	sub	x0, x29, #0xb8
 461d398: 951c6e97     	bl	0x8d38df4 <_ChromeMain+0x8d33b58>
 461d39c: 385a03a8     	ldurb	w8, [x29, #-0x60]
 461d3a0: 7100051f     	cmp	w8, #0x1
 461d3a4: 5400008d     	b.le	0x461d3b4 <_ChromeMain+0x4618118>
 461d3a8: 7100091f     	cmp	w8, #0x2
 461d3ac: 540000a1     	b.ne	0x461d3c0 <_ChromeMain+0x4618124>
 461d3b0: 14000002     	b	0x461d3b8 <_ChromeMain+0x461811c>
 461d3b4: 34000068     	cbz	w8, 0x461d3c0 <_ChromeMain+0x4618124>
 461d3b8: f85983a0     	ldur	x0, [x29, #-0x68]
 461d3bc: b5000160     	cbnz	x0, 0x461d3e8 <_ChromeMain+0x461814c>
 461d3c0: 52801fe8     	mov	w8, #0xff               ; =255
 461d3c4: 381a03a8     	sturb	w8, [x29, #-0x60]
 461d3c8: f85a83a1     	ldur	x1, [x29, #-0x58]
 461d3cc: b4002021     	cbz	x1, 0x461d7d0 <_ChromeMain+0x4618534>
 461d3d0: f9428e60     	ldr	x0, [x19, #0x518]
 461d3d4: f81a83bf     	stur	xzr, [x29, #-0x58]
 461d3d8: 95b206e3     	bl	0xb29ef64 <_ChromeMain+0xb299cc8>
 461d3dc: f85a83a8     	ldur	x8, [x29, #-0x58]
 461d3e0: b5001fe8     	cbnz	x8, 0x461d7dc <_ChromeMain+0x4618540>
 461d3e4: 17fffe36     	b	0x461ccbc <_ChromeMain+0x4617a20>
 461d3e8: 12800008     	mov	w8, #-0x1               ; =-1
 461d3ec: b8e80008     	ldaddal	w8, w8, [x0]
 461d3f0: 7100051f     	cmp	w8, #0x1
 461d3f4: 54fffe61     	b.ne	0x461d3c0 <_ChromeMain+0x4618124>
 461d3f8: f9400808     	ldr	x8, [x0, #0x10]
 461d3fc: d63f0100     	blr	x8
 461d400: 17fffff0     	b	0x461d3c0 <_ChromeMain+0x4618124>
 461d404: 12800008     	mov	w8, #-0x1               ; =-1
 461d408: b8e80008     	ldaddal	w8, w8, [x0]
 461d40c: 7100051f     	cmp	w8, #0x1
 461d410: 54fffb21     	b.ne	0x461d374 <_ChromeMain+0x46180d8>
 461d414: f9400808     	ldr	x8, [x0, #0x10]
 461d418: d63f0100     	blr	x8
 461d41c: 17ffffd6     	b	0x461d374 <_ChromeMain+0x46180d8>
 461d420: d4200020     	brk	#0x1
 461d424: f9429a68     	ldr	x8, [x19, #0x530]
 461d428: b4ffc4a8     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461d42c: f9428e68     	ldr	x8, [x19, #0x518]
 461d430: b4ffc468     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461d434: f9402100     	ldr	x0, [x8, #0x40]
 461d438: b4ffc420     	cbz	x0, 0x461ccbc <_ChromeMain+0x4617a20>
 461d43c: f9400008     	ldr	x8, [x0]
 461d440: f940b908     	ldr	x8, [x8, #0x170]
 461d444: d63f0100     	blr	x8
 461d448: b0044621     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 461d44c: 910ab421     	add	x1, x1, #0x2ad
 461d450: 52800322     	mov	w2, #0x19               ; =25
 461d454: 96f3a42b     	bl	0x306500 <_ChromeMain+0x301264>
 461d458: 34ffc320     	cbz	w0, 0x461ccbc <_ChromeMain+0x4617a20>
 461d45c: f9429a68     	ldr	x8, [x19, #0x530]
 461d460: f9405508     	ldr	x8, [x8, #0xa8]
 461d464: b4ffc2c8     	cbz	x8, 0x461ccbc <_ChromeMain+0x4617a20>
 461d468: f9404108     	ldr	x8, [x8, #0x80]
 461d46c: b4000108     	cbz	x8, 0x461d48c <_ChromeMain+0x46181f0>
 461d470: f9402908     	ldr	x8, [x8, #0x50]
 461d474: aa1503e9     	mov	x9, x21
 461d478: b4001888     	cbz	x8, 0x461d788 <_ChromeMain+0x46184ec>
 461d47c: eb09011f     	cmp	x8, x9
 461d480: 54001840     	b.eq	0x461d788 <_ChromeMain+0x46184ec>
 461d484: f9401d29     	ldr	x9, [x9, #0x38]
 461d488: b5ffff89     	cbnz	x9, 0x461d478 <_ChromeMain+0x46181dc>
 461d48c: d102e3b6     	sub	x22, x29, #0xb8
 461d490: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 461d494: f81583bf     	stur	xzr, [x29, #-0xa8]
 461d498: a9187fff     	stp	xzr, xzr, [sp, #0x180]
 461d49c: f900cbff     	str	xzr, [sp, #0x190]
 461d4a0: 910603e8     	add	x8, sp, #0x180
 461d4a4: aa1503e0     	mov	x0, x21
 461d4a8: 97fffa3e     	bl	0x461bda0 <_ChromeMain+0x4616b04>
 461d4ac: 39465fe9     	ldrb	w9, [sp, #0x197]
 461d4b0: 13001d28     	sxtb	w8, w9
 461d4b4: f940c7ea     	ldr	x10, [sp, #0x188]
 461d4b8: 7100011f     	cmp	w8, #0x0
 461d4bc: 9a894142     	csel	x2, x10, x9, mi
 461d4c0: b4000722     	cbz	x2, 0x461d5a4 <_ChromeMain+0x4618308>
 461d4c4: 52800109     	mov	w9, #0x8                ; =8
 461d4c8: 3901dfe9     	strb	w9, [sp, #0x77]
 461d4cc: 910183ea     	add	x10, sp, #0x60
 461d4d0: 9100414b     	add	x11, x10, #0x10
 461d4d4: d004cb49     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d4d8: 9122e929     	add	x9, x9, #0x8ba
 461d4dc: eb09017f     	cmp	x11, x9
 461d4e0: fa498142     	ccmp	x10, x9, #0x2, hi
 461d4e4: 54fff9e9     	b.ls	0x461d420 <_ChromeMain+0x4618184>
 461d4e8: 3dc00120     	ldr	q0, [x9]
 461d4ec: 3d801be0     	str	q0, [sp, #0x60]
 461d4f0: 7900e3ff     	strh	wzr, [sp, #0x70]
 461d4f4: f940c3e9     	ldr	x9, [sp, #0x180]
 461d4f8: 7100011f     	cmp	w8, #0x0
 461d4fc: 910603e8     	add	x8, sp, #0x180
 461d500: 9a884121     	csel	x1, x9, x8, mi
 461d504: 910183e0     	add	x0, sp, #0x60
 461d508: 9717e3b8     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 461d50c: f9400808     	ldr	x8, [x0, #0x10]
 461d510: 3dc00000     	ldr	q0, [x0]
 461d514: 3d800300     	str	q0, [x24]
 461d518: f90083e8     	str	x8, [sp, #0x100]
 461d51c: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 461d520: f900001f     	str	xzr, [x0]
 461d524: d004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d528: 91261021     	add	x1, x1, #0x984
 461d52c: 9103c3e0     	add	x0, sp, #0xf0
 461d530: 52800042     	mov	w2, #0x2                ; =2
 461d534: 9717e3ad     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 461d538: f9400015     	ldr	x21, [x0]
 461d53c: 3cc08000     	ldur	q0, [x0, #0x8]
 461d540: 3d800fe0     	str	q0, [sp, #0x30]
 461d544: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 461d548: f900001f     	str	xzr, [x0]
 461d54c: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 461d550: 36f800a8     	tbz	w8, #0x1f, 0x461d564 <_ChromeMain+0x46182c8>
 461d554: f85483a0     	ldur	x0, [x29, #-0xb8]
 461d558: f85583a8     	ldur	x8, [x29, #-0xa8]
 461d55c: d37ff901     	lsl	x1, x8, #1
 461d560: 96e7ae56     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d564: f81483b5     	stur	x21, [x29, #-0xb8]
 461d568: 3dc00fe0     	ldr	q0, [sp, #0x30]
 461d56c: 3c8082c0     	stur	q0, [x22, #0x8]
 461d570: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 461d574: 36f800a8     	tbz	w8, #0x1f, 0x461d588 <_ChromeMain+0x46182ec>
 461d578: f9407be0     	ldr	x0, [sp, #0xf0]
 461d57c: f94083e8     	ldr	x8, [sp, #0x100]
 461d580: d37ff901     	lsl	x1, x8, #1
 461d584: 96e7ae4d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d588: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 461d58c: 36f80148     	tbz	w8, #0x1f, 0x461d5b4 <_ChromeMain+0x4618318>
 461d590: f94033e0     	ldr	x0, [sp, #0x60]
 461d594: f9403be8     	ldr	x8, [sp, #0x70]
 461d598: d37ff901     	lsl	x1, x8, #1
 461d59c: 96e7ae47     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d5a0: 14000005     	b	0x461d5b4 <_ChromeMain+0x4618318>
 461d5a4: d004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d5a8: 91256021     	add	x1, x1, #0x958
 461d5ac: d102e3a0     	sub	x0, x29, #0xb8
 461d5b0: 97331965     	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 461d5b4: f9400268     	ldr	x8, [x19]
 461d5b8: f9403508     	ldr	x8, [x8, #0x68]
 461d5bc: aa1303e0     	mov	x0, x19
 461d5c0: d63f0100     	blr	x8
 461d5c4: f9407008     	ldr	x8, [x0, #0xe0]
 461d5c8: b4000d48     	cbz	x8, 0x461d770 <_ChromeMain+0x46184d4>
 461d5cc: 19404108     	ldapurb	w8, [x8, #0x4]
 461d5d0: 35000d08     	cbnz	w8, 0x461d770 <_ChromeMain+0x46184d4>
 461d5d4: f9407408     	ldr	x8, [x0, #0xe8]
 461d5d8: b4000cc8     	cbz	x8, 0x461d770 <_ChromeMain+0x46184d4>
 461d5dc: f9407008     	ldr	x8, [x0, #0xe0]
 461d5e0: b4000e08     	cbz	x8, 0x461d7a0 <_ChromeMain+0x4618504>
 461d5e4: 19404108     	ldapurb	w8, [x8, #0x4]
 461d5e8: 35000dc8     	cbnz	w8, 0x461d7a0 <_ChromeMain+0x4618504>
 461d5ec: f9407408     	ldr	x8, [x0, #0xe8]
 461d5f0: f9402508     	ldr	x8, [x8, #0x48]
 461d5f4: b4000fa8     	cbz	x8, 0x461d7e8 <_ChromeMain+0x461854c>
 461d5f8: f940a515     	ldr	x21, [x8, #0x148]
 461d5fc: aa1503e0     	mov	x0, x21
 461d600: 94e7985a     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461d604: 94e79859     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461d608: 94e79858     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461d60c: 52800100     	mov	w0, #0x8                ; =8
 461d610: 96e7c756     	bl	0xf368 <_ChromeMain+0xa0cc>
 461d614: aa0003f6     	mov	x22, x0
 461d618: f900001f     	str	xzr, [x0]
 461d61c: aa1503e1     	mov	x1, x21
 461d620: 95013ab8     	bl	0x866c100 <_ChromeMain+0x8666e64>
 461d624: aa1503e0     	mov	x0, x21
 461d628: 94e7984d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461d62c: aa1503e0     	mov	x0, x21
 461d630: 94e7984b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461d634: aa1503e0     	mov	x0, x21
 461d638: 94e79849     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 461d63c: a90657f6     	stp	x22, x21, [sp, #0x60]
 461d640: 3895f3a8     	ldursb	x8, [x29, #-0xa1]
 461d644: a974aba9     	ldp	x9, x10, [x29, #-0xb8]
 461d648: d102e3ab     	sub	x11, x29, #0xb8
 461d64c: f100011f     	cmp	x8, #0x0
 461d650: 9a8b4135     	csel	x21, x9, x11, mi
 461d654: 7100011f     	cmp	w8, #0x0
 461d658: 9a884156     	csel	x22, x10, x8, mi
 461d65c: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 461d660: f90083ff     	str	xzr, [sp, #0x100]
 461d664: f9451a77     	ldr	x23, [x19, #0xa30]
 461d668: b40000d7     	cbz	x23, 0x461d680 <_ChromeMain+0x46183e4>
 461d66c: 52800028     	mov	w8, #0x1                ; =1
 461d670: b82802e8     	ldadd	w8, w8, [x23]
 461d674: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461d678: 6b09011f     	cmp	w8, w9
 461d67c: 54000980     	b.eq	0x461d7ac <_ChromeMain+0x4618510>
 461d680: 9103c3f8     	add	x24, sp, #0xf0
 461d684: f9451e73     	ldr	x19, [x19, #0xa38]
 461d688: 52800800     	mov	w0, #0x40               ; =64
 461d68c: 96e7c737     	bl	0xf368 <_ChromeMain+0xa0cc>
 461d690: 52800028     	mov	w8, #0x1                ; =1
 461d694: b9000008     	str	w8, [x0]
 461d698: 1003c808     	adr	x8, 0x4624f98 <_ChromeMain+0x461fcfc>
 461d69c: d503201f     	nop
 461d6a0: d0ffd449     	adrp	x9, 0x40a7000 <_ChromeMain+0x40a1d64>
 461d6a4: 910e0129     	add	x9, x9, #0x380
 461d6a8: a900a408     	stp	x8, x9, [x0, #0x8]
 461d6ac: 90fefa08     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 461d6b0: 912c0108     	add	x8, x8, #0xb00
 461d6b4: f9000c08     	str	x8, [x0, #0x18]
 461d6b8: a902cc17     	stp	x23, x19, [x0, #0x28]
 461d6bc: f9001c14     	str	x20, [x0, #0x38]
 461d6c0: a90183ff     	stp	xzr, x0, [sp, #0x18]
 461d6c4: 528000c8     	mov	w8, #0x6                ; =6
 461d6c8: d004cb49     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d6cc: 9120e929     	add	x9, x9, #0x83a
 461d6d0: a900e3e8     	stp	x8, x24, [sp, #0x8]
 461d6d4: f90003e9     	str	x9, [sp]
 461d6d8: d004cb41     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d6dc: 91262821     	add	x1, x1, #0x98a
 461d6e0: d004cb46     	adrp	x6, 0xdf87000 <dyld_stub_binder+0xdf87000>
 461d6e4: 911c68c6     	add	x6, x6, #0x71a
 461d6e8: 910183e0     	add	x0, sp, #0x60
 461d6ec: 528001e2     	mov	w2, #0xf                ; =15
 461d6f0: aa1503e3     	mov	x3, x21
 461d6f4: aa1603e4     	mov	x4, x22
 461d6f8: 52800025     	mov	w5, #0x1                ; =1
 461d6fc: 528000c7     	mov	w7, #0x6                ; =6
 461d700: 97efe5bf     	bl	0x4216dfc <_ChromeMain+0x4211b60>
 461d704: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 461d708: 36f800a8     	tbz	w8, #0x1f, 0x461d71c <_ChromeMain+0x4618480>
 461d70c: f9407be0     	ldr	x0, [sp, #0xf0]
 461d710: f94083e8     	ldr	x8, [sp, #0x100]
 461d714: d37ff901     	lsl	x1, x8, #1
 461d718: 96e7ade8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d71c: f94033f3     	ldr	x19, [sp, #0x60]
 461d720: f90033ff     	str	xzr, [sp, #0x60]
 461d724: b40000d3     	cbz	x19, 0x461d73c <_ChromeMain+0x46184a0>
 461d728: aa1303e0     	mov	x0, x19
 461d72c: 95013a7b     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 461d730: aa1303e0     	mov	x0, x19
 461d734: 52800101     	mov	w1, #0x8                ; =8
 461d738: 96e7ade0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d73c: 39c65fe8     	ldrsb	w8, [sp, #0x197]
 461d740: 36f800a8     	tbz	w8, #0x1f, 0x461d754 <_ChromeMain+0x46184b8>
 461d744: f940c3e0     	ldr	x0, [sp, #0x180]
 461d748: f940cbe8     	ldr	x8, [sp, #0x190]
 461d74c: d37ff901     	lsl	x1, x8, #1
 461d750: 96e7adda     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d754: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 461d758: 36ffab28     	tbz	w8, #0x1f, 0x461ccbc <_ChromeMain+0x4617a20>
 461d75c: f85483a0     	ldur	x0, [x29, #-0xb8]
 461d760: f85583a8     	ldur	x8, [x29, #-0xa8]
 461d764: d37ff901     	lsl	x1, x8, #1
 461d768: 96e7add4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d76c: 17fffd54     	b	0x461ccbc <_ChromeMain+0x4617a20>
 461d770: 52800100     	mov	w0, #0x8                ; =8
 461d774: 96e7c6fd     	bl	0xf368 <_ChromeMain+0xa0cc>
 461d778: aa0003f6     	mov	x22, x0
 461d77c: d2800015     	mov	x21, #0x0               ; =0
 461d780: f900001f     	str	xzr, [x0]
 461d784: 17ffffae     	b	0x461d63c <_ChromeMain+0x46183a0>
 461d788: eb09011f     	cmp	x8, x9
 461d78c: 54ffe801     	b.ne	0x461d48c <_ChromeMain+0x46181f0>
 461d790: 17fffd4b     	b	0x461ccbc <_ChromeMain+0x4617a20>
 461d794: eb09011f     	cmp	x8, x9
 461d798: 54ffb961     	b.ne	0x461cec4 <_ChromeMain+0x4617c28>
 461d79c: 17fffd48     	b	0x461ccbc <_ChromeMain+0x4617a20>
 461d7a0: d4200000     	brk	#0
 461d7a4: d4400000     	hlt	#0
 461d7a8: d4200020     	brk	#0x1
 461d7ac: d4200000     	brk	#0
 461d7b0: d4400000     	hlt	#0
 461d7b4: d4200020     	brk	#0x1
 461d7b8: d4200000     	brk	#0
 461d7bc: d4400000     	hlt	#0
 461d7c0: 17ffff18     	b	0x461d420 <_ChromeMain+0x4618184>
 461d7c4: d4200000     	brk	#0
 461d7c8: d4400000     	hlt	#0
 461d7cc: d4200020     	brk	#0x1
 461d7d0: d4200000     	brk	#0
 461d7d4: d4400000     	hlt	#0
 461d7d8: d4200020     	brk	#0x1
 461d7dc: d4200000     	brk	#0
 461d7e0: d4400000     	hlt	#0
 461d7e4: d4200020     	brk	#0x1
 461d7e8: d2800000     	mov	x0, #0x0                ; =0
 461d7ec: 94e797df     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461d7f0: d2800000     	mov	x0, #0x0                ; =0
 461d7f4: 94e797dd     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 461d7f8: 52800100     	mov	w0, #0x8                ; =8
 461d7fc: 96e7c6db     	bl	0xf368 <_ChromeMain+0xa0cc>
 461d800: aa0003f6     	mov	x22, x0
 461d804: f900001f     	str	xzr, [x0]
 461d808: d2800001     	mov	x1, #0x0                ; =0
 461d80c: 95013a3d     	bl	0x866c100 <_ChromeMain+0x8666e64>
 461d810: d2800015     	mov	x21, #0x0               ; =0
 461d814: 17ffff86     	b	0x461d62c <_ChromeMain+0x4618390>
 461d818: d10143ff     	sub	sp, sp, #0x50
 461d81c: a90257f6     	stp	x22, x21, [sp, #0x20]
 461d820: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461d824: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461d828: 910103fd     	add	x29, sp, #0x40
 461d82c: b50000c2     	cbnz	x2, 0x461d844 <_ChromeMain+0x46185a8>
 461d830: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461d834: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461d838: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461d83c: 910143ff     	add	sp, sp, #0x50
 461d840: d65f03c0     	ret
 461d844: aa0103f4     	mov	x20, x1
 461d848: aa0003f3     	mov	x19, x0
 461d84c: 900525c1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 461d850: 911fa021     	add	x1, x1, #0x7e8
 461d854: 91052040     	add	x0, x2, #0x148
 461d858: 951c78d1     	bl	0x8d3bb9c <_ChromeMain+0x8d36900>
 461d85c: b9400808     	ldr	w8, [x0, #0x8]
 461d860: 71001d1f     	cmp	w8, #0x7
 461d864: 540008a1     	b.ne	0x461d978 <_ChromeMain+0x46186dc>
 461d868: aa0003f5     	mov	x21, x0
 461d86c: b4fffe20     	cbz	x0, 0x461d830 <_ChromeMain+0x4618594>
 461d870: f9429a68     	ldr	x8, [x19, #0x530]
 461d874: b4fffde8     	cbz	x8, 0x461d830 <_ChromeMain+0x4618594>
 461d878: 39408508     	ldrb	w8, [x8, #0x21]
 461d87c: 34fffda8     	cbz	w8, 0x461d830 <_ChromeMain+0x4618594>
 461d880: aa1303e0     	mov	x0, x19
 461d884: aa1403e1     	mov	x1, x20
 461d888: 97ffdb2c     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461d88c: b4fffd20     	cbz	x0, 0x461d830 <_ChromeMain+0x4618594>
 461d890: aa0003f4     	mov	x20, x0
 461d894: b940f808     	ldr	w8, [x0, #0xf8]
 461d898: 34fffcc8     	cbz	w8, 0x461d830 <_ChromeMain+0x4618594>
 461d89c: 3944e288     	ldrb	w8, [x20, #0x138]
 461d8a0: 3707fc88     	tbnz	w8, #0x0, 0x461d830 <_ChromeMain+0x4618594>
 461d8a4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 461d8a8: f9000fff     	str	xzr, [sp, #0x18]
 461d8ac: 3982dea1     	ldrsb	x1, [x21, #0xb7]
 461d8b0: b7f80601     	tbnz	x1, #0x3f, 0x461d970 <_ChromeMain+0x46186d4>
 461d8b4: 910282a0     	add	x0, x21, #0xa0
 461d8b8: f00440e2     	adrp	x2, 0xce3c000 <dyld_stub_binder+0xce3c000>
 461d8bc: 9109b842     	add	x2, x2, #0x26e
 461d8c0: 910023e5     	add	x5, sp, #0x8
 461d8c4: 52800323     	mov	w3, #0x19               ; =25
 461d8c8: 52800064     	mov	w4, #0x3                ; =3
 461d8cc: 9723c4cd     	bl	0xf0ec00 <_ChromeMain+0xf09964>
 461d8d0: 39407fe9     	ldrb	w9, [sp, #0x1f]
 461d8d4: 13001d28     	sxtb	w8, w9
 461d8d8: f9400bea     	ldr	x10, [sp, #0x10]
 461d8dc: 7100011f     	cmp	w8, #0x0
 461d8e0: 9a894149     	csel	x9, x10, x9, mi
 461d8e4: b40003a9     	cbz	x9, 0x461d958 <_ChromeMain+0x46186bc>
 461d8e8: 39407e8b     	ldrb	w11, [x20, #0x1f]
 461d8ec: 13001d6a     	sxtb	w10, w11
 461d8f0: f9400a8c     	ldr	x12, [x20, #0x10]
 461d8f4: 7100015f     	cmp	w10, #0x0
 461d8f8: 9a8b418b     	csel	x11, x12, x11, mi
 461d8fc: eb0b013f     	cmp	x9, x11
 461d900: 54000201     	b.ne	0x461d940 <_ChromeMain+0x46186a4>
 461d904: aa1403eb     	mov	x11, x20
 461d908: f8408d6c     	ldr	x12, [x11, #0x8]!
 461d90c: 7100015f     	cmp	w10, #0x0
 461d910: 9a8b418a     	csel	x10, x12, x11, mi
 461d914: f94007eb     	ldr	x11, [sp, #0x8]
 461d918: 7100011f     	cmp	w8, #0x0
 461d91c: 910023ec     	add	x12, sp, #0x8
 461d920: 9a8c416b     	csel	x11, x11, x12, mi
 461d924: 7840256c     	ldrh	w12, [x11], #0x2
 461d928: 7840254d     	ldrh	w13, [x10], #0x2
 461d92c: 6b0c01bf     	cmp	w13, w12
 461d930: 54000081     	b.ne	0x461d940 <_ChromeMain+0x46186a4>
 461d934: f1000529     	subs	x9, x9, #0x1
 461d938: 54ffff61     	b.ne	0x461d924 <_ChromeMain+0x4618688>
 461d93c: 14000007     	b	0x461d958 <_ChromeMain+0x46186bc>
 461d940: f9429a60     	ldr	x0, [x19, #0x530]
 461d944: 910023e2     	add	x2, sp, #0x8
 461d948: aa1403e1     	mov	x1, x20
 461d94c: 52800003     	mov	w3, #0x0                ; =0
 461d950: 957cd8a8     	bl	0xa553bf0 <_ChromeMain+0xa54e954>
 461d954: 39407fe8     	ldrb	w8, [sp, #0x1f]
 461d958: 363ff6c8     	tbz	w8, #0x7, 0x461d830 <_ChromeMain+0x4618594>
 461d95c: f94007e0     	ldr	x0, [sp, #0x8]
 461d960: f9400fe8     	ldr	x8, [sp, #0x18]
 461d964: d37ff901     	lsl	x1, x8, #1
 461d968: 96e7ad54     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461d96c: 17ffffb1     	b	0x461d830 <_ChromeMain+0x4618594>
 461d970: a94a06a0     	ldp	x0, x1, [x21, #0xa0]
 461d974: 17ffffd1     	b	0x461d8b8 <_ChromeMain+0x461861c>
 461d978: d4200000     	brk	#0
 461d97c: d4400000     	hlt	#0
 461d980: d4200020     	brk	#0x1
 461d984: d10443ff     	sub	sp, sp, #0x110
 461d988: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 461d98c: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 461d990: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 461d994: a9107bfd     	stp	x29, x30, [sp, #0x100]
 461d998: 910403fd     	add	x29, sp, #0x100
 461d99c: b50000e2     	cbnz	x2, 0x461d9b8 <_ChromeMain+0x461871c>
 461d9a0: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 461d9a4: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 461d9a8: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 461d9ac: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 461d9b0: 910443ff     	add	sp, sp, #0x110
 461d9b4: d65f03c0     	ret
 461d9b8: aa0203f5     	mov	x21, x2
 461d9bc: aa0103f4     	mov	x20, x1
 461d9c0: aa0003f3     	mov	x19, x0
 461d9c4: 900525c1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 461d9c8: 911fc021     	add	x1, x1, #0x7f0
 461d9cc: 91052040     	add	x0, x2, #0x148
 461d9d0: 951c7873     	bl	0x8d3bb9c <_ChromeMain+0x8d36900>
 461d9d4: b9400808     	ldr	w8, [x0, #0x8]
 461d9d8: 71001d1f     	cmp	w8, #0x7
 461d9dc: 54001861     	b.ne	0x461dce8 <_ChromeMain+0x4618a4c>
 461d9e0: aa0003f6     	mov	x22, x0
 461d9e4: 900525c1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 461d9e8: 911fe021     	add	x1, x1, #0x7f8
 461d9ec: 910522a0     	add	x0, x21, #0x148
 461d9f0: 951c786b     	bl	0x8d3bb9c <_ChromeMain+0x8d36900>
 461d9f4: b9400808     	ldr	w8, [x0, #0x8]
 461d9f8: 71001d1f     	cmp	w8, #0x7
 461d9fc: 540017c1     	b.ne	0x461dcf4 <_ChromeMain+0x4618a58>
 461da00: b4fffd16     	cbz	x22, 0x461d9a0 <_ChromeMain+0x4618704>
 461da04: aa0003f5     	mov	x21, x0
 461da08: b4fffcc0     	cbz	x0, 0x461d9a0 <_ChromeMain+0x4618704>
 461da0c: f9429a68     	ldr	x8, [x19, #0x530]
 461da10: b4fffc88     	cbz	x8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da14: 39408508     	ldrb	w8, [x8, #0x21]
 461da18: 34fffc48     	cbz	w8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da1c: aa1303e0     	mov	x0, x19
 461da20: aa1403e1     	mov	x1, x20
 461da24: 97ffdac5     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461da28: b4fffbc0     	cbz	x0, 0x461d9a0 <_ChromeMain+0x4618704>
 461da2c: aa0003f4     	mov	x20, x0
 461da30: b940f808     	ldr	w8, [x0, #0xf8]
 461da34: 35fffb68     	cbnz	w8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da38: 3944e288     	ldrb	w8, [x20, #0x138]
 461da3c: 3707fb28     	tbnz	w8, #0x0, 0x461d9a0 <_ChromeMain+0x4618704>
 461da40: f9429a68     	ldr	x8, [x19, #0x530]
 461da44: b4fffae8     	cbz	x8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da48: 14000005     	b	0x461da5c <_ChromeMain+0x46187c0>
 461da4c: a94a06a0     	ldp	x0, x1, [x21, #0xa0]
 461da50: 1400002b     	b	0x461dafc <_ChromeMain+0x4618860>
 461da54: a94a06c0     	ldp	x0, x1, [x22, #0xa0]
 461da58: 1400001e     	b	0x461dad0 <_ChromeMain+0x4618834>
 461da5c: f9428e68     	ldr	x8, [x19, #0x518]
 461da60: b4fffa08     	cbz	x8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da64: f9402100     	ldr	x0, [x8, #0x40]
 461da68: b4fff9c0     	cbz	x0, 0x461d9a0 <_ChromeMain+0x4618704>
 461da6c: f9400008     	ldr	x8, [x0]
 461da70: f940b908     	ldr	x8, [x8, #0x170]
 461da74: d63f0100     	blr	x8
 461da78: b0044621     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 461da7c: 910ab421     	add	x1, x1, #0x2ad
 461da80: 52800322     	mov	w2, #0x19               ; =25
 461da84: 96f3a29f     	bl	0x306500 <_ChromeMain+0x301264>
 461da88: 34fff8c0     	cbz	w0, 0x461d9a0 <_ChromeMain+0x4618704>
 461da8c: f9429a68     	ldr	x8, [x19, #0x530]
 461da90: f9405508     	ldr	x8, [x8, #0xa8]
 461da94: b4fff868     	cbz	x8, 0x461d9a0 <_ChromeMain+0x4618704>
 461da98: f9404108     	ldr	x8, [x8, #0x80]
 461da9c: b4000108     	cbz	x8, 0x461dabc <_ChromeMain+0x4618820>
 461daa0: f9402908     	ldr	x8, [x8, #0x50]
 461daa4: aa1403e9     	mov	x9, x20
 461daa8: b40012c8     	cbz	x8, 0x461dd00 <_ChromeMain+0x4618a64>
 461daac: eb09011f     	cmp	x8, x9
 461dab0: 54001280     	b.eq	0x461dd00 <_ChromeMain+0x4618a64>
 461dab4: f9401d29     	ldr	x9, [x9, #0x38]
 461dab8: b5ffff89     	cbnz	x9, 0x461daa8 <_ChromeMain+0x461880c>
 461dabc: a93bffbf     	stp	xzr, xzr, [x29, #-0x48]
 461dac0: f81c83bf     	stur	xzr, [x29, #-0x38]
 461dac4: 3982dec1     	ldrsb	x1, [x22, #0xb7]
 461dac8: b7fffc61     	tbnz	x1, #0x3f, 0x461da54 <_ChromeMain+0x46187b8>
 461dacc: 910282c0     	add	x0, x22, #0xa0
 461dad0: f00440e2     	adrp	x2, 0xce3c000 <dyld_stub_binder+0xce3c000>
 461dad4: 9109b842     	add	x2, x2, #0x26e
 461dad8: d10123a5     	sub	x5, x29, #0x48
 461dadc: 52800323     	mov	w3, #0x19               ; =25
 461dae0: 52800064     	mov	w4, #0x3                ; =3
 461dae4: 9723c447     	bl	0xf0ec00 <_ChromeMain+0xf09964>
 461dae8: a93a7fbf     	stp	xzr, xzr, [x29, #-0x60]
 461daec: f81b03bf     	stur	xzr, [x29, #-0x50]
 461daf0: 3982dea1     	ldrsb	x1, [x21, #0xb7]
 461daf4: b7fffac1     	tbnz	x1, #0x3f, 0x461da4c <_ChromeMain+0x46187b0>
 461daf8: 910282a0     	add	x0, x21, #0xa0
 461dafc: f00440e2     	adrp	x2, 0xce3c000 <dyld_stub_binder+0xce3c000>
 461db00: 9109b842     	add	x2, x2, #0x26e
 461db04: d10183b5     	sub	x21, x29, #0x60
 461db08: d10183a5     	sub	x5, x29, #0x60
 461db0c: 52800323     	mov	w3, #0x19               ; =25
 461db10: 52800064     	mov	w4, #0x3                ; =3
 461db14: 9723c43b     	bl	0xf0ec00 <_ChromeMain+0xf09964>
 461db18: 389b73a8     	ldursb	x8, [x29, #-0x49]
 461db1c: a97a2ba9     	ldp	x9, x10, [x29, #-0x60]
 461db20: f100011f     	cmp	x8, #0x0
 461db24: 9a954120     	csel	x0, x9, x21, mi
 461db28: f9004bff     	str	xzr, [sp, #0x90]
 461db2c: 6f00e400     	movi.2d	v0, #0000000000000000
 461db30: ad0383e0     	stp	q0, q0, [sp, #0x70]
 461db34: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461db38: ad0183e0     	stp	q0, q0, [sp, #0x30]
 461db3c: 3d800be0     	str	q0, [sp, #0x20]
 461db40: 7100011f     	cmp	w8, #0x0
 461db44: 9a884141     	csel	x1, x10, x8, mi
 461db48: 910023f5     	add	x21, sp, #0x8
 461db4c: 910023e8     	add	x8, sp, #0x8
 461db50: 9726146e     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 461db54: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 461db58: a940abe9     	ldp	x9, x10, [sp, #0x8]
 461db5c: f100011f     	cmp	x8, #0x0
 461db60: 9a954121     	csel	x1, x9, x21, mi
 461db64: 7100011f     	cmp	w8, #0x0
 461db68: 9a884142     	csel	x2, x10, x8, mi
 461db6c: 910083e0     	add	x0, sp, #0x20
 461db70: 96f54999     	bl	0x3701d4 <_ChromeMain+0x36af38>
 461db74: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 461db78: 36f800a8     	tbz	w8, #0x1f, 0x461db8c <_ChromeMain+0x46188f0>
 461db7c: f94007e0     	ldr	x0, [sp, #0x8]
 461db80: f9400fe8     	ldr	x8, [sp, #0x18]
 461db84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461db88: 96e7accc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461db8c: 3940e3e8     	ldrb	w8, [sp, #0x38]
 461db90: 340007a8     	cbz	w8, 0x461dc84 <_ChromeMain+0x46189e8>
 461db94: 385cf3a8     	ldurb	w8, [x29, #-0x31]
 461db98: 13001d0a     	sxtb	w10, w8
 461db9c: f85c03a9     	ldur	x9, [x29, #-0x40]
 461dba0: 7100015f     	cmp	w10, #0x0
 461dba4: 9a884128     	csel	x8, x9, x8, mi
 461dba8: 39407e8b     	ldrb	w11, [x20, #0x1f]
 461dbac: 13001d69     	sxtb	w9, w11
 461dbb0: f9400a8c     	ldr	x12, [x20, #0x10]
 461dbb4: 7100013f     	cmp	w9, #0x0
 461dbb8: 9a8b418b     	csel	x11, x12, x11, mi
 461dbbc: eb0b011f     	cmp	x8, x11
 461dbc0: 54000221     	b.ne	0x461dc04 <_ChromeMain+0x4618968>
 461dbc4: b40002a8     	cbz	x8, 0x461dc18 <_ChromeMain+0x461897c>
 461dbc8: 9100228b     	add	x11, x20, #0x8
 461dbcc: f940016c     	ldr	x12, [x11]
 461dbd0: 7100013f     	cmp	w9, #0x0
 461dbd4: 9a8b4189     	csel	x9, x12, x11, mi
 461dbd8: f85b83ab     	ldur	x11, [x29, #-0x48]
 461dbdc: 7100015f     	cmp	w10, #0x0
 461dbe0: d10123aa     	sub	x10, x29, #0x48
 461dbe4: 9a8a416a     	csel	x10, x11, x10, mi
 461dbe8: 7840254b     	ldrh	w11, [x10], #0x2
 461dbec: 7840252c     	ldrh	w12, [x9], #0x2
 461dbf0: 6b0b019f     	cmp	w12, w11
 461dbf4: 54000081     	b.ne	0x461dc04 <_ChromeMain+0x4618968>
 461dbf8: f1000508     	subs	x8, x8, #0x1
 461dbfc: 54ffff61     	b.ne	0x461dbe8 <_ChromeMain+0x461894c>
 461dc00: 14000006     	b	0x461dc18 <_ChromeMain+0x461897c>
 461dc04: f9429a60     	ldr	x0, [x19, #0x530]
 461dc08: d10123a2     	sub	x2, x29, #0x48
 461dc0c: aa1403e1     	mov	x1, x20
 461dc10: 52800003     	mov	w3, #0x0                ; =0
 461dc14: 957cd7f7     	bl	0xa553bf0 <_ChromeMain+0xa54e954>
 461dc18: 3940dfe9     	ldrb	w9, [sp, #0x37]
 461dc1c: 13001d28     	sxtb	w8, w9
 461dc20: f94017ea     	ldr	x10, [sp, #0x28]
 461dc24: 7100011f     	cmp	w8, #0x0
 461dc28: 9a894142     	csel	x2, x10, x9, mi
 461dc2c: 39425e8a     	ldrb	w10, [x20, #0x97]
 461dc30: 13001d49     	sxtb	w9, w10
 461dc34: f940468b     	ldr	x11, [x20, #0x88]
 461dc38: 7100013f     	cmp	w9, #0x0
 461dc3c: 9a8a416a     	csel	x10, x11, x10, mi
 461dc40: eb0a005f     	cmp	x2, x10
 461dc44: 54000161     	b.ne	0x461dc70 <_ChromeMain+0x46189d4>
 461dc48: f94013ea     	ldr	x10, [sp, #0x20]
 461dc4c: 7100011f     	cmp	w8, #0x0
 461dc50: 910083e8     	add	x8, sp, #0x20
 461dc54: 9a884140     	csel	x0, x10, x8, mi
 461dc58: aa1403e8     	mov	x8, x20
 461dc5c: f8480d0a     	ldr	x10, [x8, #0x80]!
 461dc60: 7100013f     	cmp	w9, #0x0
 461dc64: 9a884141     	csel	x1, x10, x8, mi
 461dc68: 94e7aefe     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461dc6c: 340000c0     	cbz	w0, 0x461dc84 <_ChromeMain+0x46189e8>
 461dc70: f9429a60     	ldr	x0, [x19, #0x530]
 461dc74: 910083e2     	add	x2, sp, #0x20
 461dc78: aa1403e1     	mov	x1, x20
 461dc7c: 52800003     	mov	w3, #0x0                ; =0
 461dc80: 957cd8cc     	bl	0xa553fb0 <_ChromeMain+0xa54ed14>
 461dc84: 910083f3     	add	x19, sp, #0x20
 461dc88: 9101c260     	add	x0, x19, #0x70
 461dc8c: d2800001     	mov	x1, #0x0                ; =0
 461dc90: 96e8280a     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461dc94: 91008260     	add	x0, x19, #0x20
 461dc98: 96e827f8     	bl	0x27c78 <_ChromeMain+0x229dc>
 461dc9c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 461dca0: 36f800a8     	tbz	w8, #0x1f, 0x461dcb4 <_ChromeMain+0x4618a18>
 461dca4: f94013e0     	ldr	x0, [sp, #0x20]
 461dca8: f9401be8     	ldr	x8, [sp, #0x30]
 461dcac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461dcb0: 96e7ac82     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461dcb4: 38db73a8     	ldursb	w8, [x29, #-0x49]
 461dcb8: 36f800a8     	tbz	w8, #0x1f, 0x461dccc <_ChromeMain+0x4618a30>
 461dcbc: f85a03a0     	ldur	x0, [x29, #-0x60]
 461dcc0: f85b03a8     	ldur	x8, [x29, #-0x50]
 461dcc4: d37ff901     	lsl	x1, x8, #1
 461dcc8: 96e7ac7c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461dccc: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 461dcd0: 36ffe688     	tbz	w8, #0x1f, 0x461d9a0 <_ChromeMain+0x4618704>
 461dcd4: f85b83a0     	ldur	x0, [x29, #-0x48]
 461dcd8: f85c83a8     	ldur	x8, [x29, #-0x38]
 461dcdc: d37ff901     	lsl	x1, x8, #1
 461dce0: 96e7ac76     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461dce4: 17ffff2f     	b	0x461d9a0 <_ChromeMain+0x4618704>
 461dce8: d4200000     	brk	#0
 461dcec: d4400000     	hlt	#0
 461dcf0: d4200020     	brk	#0x1
 461dcf4: d4200000     	brk	#0
 461dcf8: d4400000     	hlt	#0
 461dcfc: d4200020     	brk	#0x1
 461dd00: eb09011f     	cmp	x8, x9
 461dd04: 54ffe4e0     	b.eq	0x461d9a0 <_ChromeMain+0x4618704>
 461dd08: 17ffff6d     	b	0x461dabc <_ChromeMain+0x4618820>
 461dd0c: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 461dd10: a9015ff8     	stp	x24, x23, [sp, #0x10]
 461dd14: a90257f6     	stp	x22, x21, [sp, #0x20]
 461dd18: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461dd1c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461dd20: 910103fd     	add	x29, sp, #0x40
 461dd24: aa0003f5     	mov	x21, x0
 461dd28: f9431017     	ldr	x23, [x0, #0x620]
 461dd2c: d37df2f3     	lsl	x19, x23, #3
 461dd30: b4000677     	cbz	x23, 0x461ddfc <_ChromeMain+0x4618b60>
 461dd34: d37dfee8     	lsr	x8, x23, #61
 461dd38: b5000988     	cbnz	x8, 0x461de68 <_ChromeMain+0x4618bcc>
 461dd3c: f9430eb6     	ldr	x22, [x21, #0x618]
 461dd40: aa1303e0     	mov	x0, x19
 461dd44: 96e7c589     	bl	0xf368 <_ChromeMain+0xa0cc>
 461dd48: aa0003f4     	mov	x20, x0
 461dd4c: aa1603e1     	mov	x1, x22
 461dd50: aa1303e2     	mov	x2, x19
 461dd54: 94e7c55e     	bl	0x800f2cc <_ChromeMain+0x800a030>
 461dd58: 9340f2f7     	sbfx	x23, x23, #0, #61
 461dd5c: aa1503e0     	mov	x0, x21
 461dd60: 97ffc8b7     	bl	0x461003c <_ChromeMain+0x460ada0>
 461dd64: f94312a8     	ldr	x8, [x21, #0x620]
 461dd68: eb17011f     	cmp	x8, x23
 461dd6c: 540000c1     	b.ne	0x461dd84 <_ChromeMain+0x4618ae8>
 461dd70: f9430ea0     	ldr	x0, [x21, #0x618]
 461dd74: d37df2e2     	lsl	x2, x23, #3
 461dd78: aa1403e1     	mov	x1, x20
 461dd7c: 94e7aeb9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461dd80: 34000460     	cbz	w0, 0x461de0c <_ChromeMain+0x4618b70>
 461dd84: 395bcea8     	ldrb	w8, [x21, #0x6f3]
 461dd88: 350003e8     	cbnz	w8, 0x461de04 <_ChromeMain+0x4618b68>
 461dd8c: 911bceb6     	add	x22, x21, #0x6f3
 461dd90: 925e76d8     	and	x24, x22, #0xfffffffc00000000
 461dd94: b0052cb9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461dd98: f9404728     	ldr	x8, [x25, #0x88]
 461dd9c: eb08031f     	cmp	x24, x8
 461dda0: 54000060     	b.eq	0x461ddac <_ChromeMain+0x4618b10>
 461dda4: 5280001a     	mov	w26, #0x0               ; =0
 461dda8: 14000004     	b	0x461ddb8 <_ChromeMain+0x4618b1c>
 461ddac: 911bcea0     	add	x0, x21, #0x6f3
 461ddb0: 96e7d953     	bl	0x142fc <_ChromeMain+0xf060>
 461ddb4: 394002da     	ldrb	w26, [x22]
 461ddb8: 52800008     	mov	w8, #0x0                ; =0
 461ddbc: 52800029     	mov	w9, #0x1                ; =1
 461ddc0: 391bcea9     	strb	w9, [x21, #0x6f3]
 461ddc4: 391bd2bf     	strb	wzr, [x21, #0x6f4]
 461ddc8: 12000101     	and	w1, w8, #0x1
 461ddcc: aa1503e0     	mov	x0, x21
 461ddd0: 97ffdf8c     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461ddd4: 395bd6a8     	ldrb	w8, [x21, #0x6f5]
 461ddd8: 395bd2a9     	ldrb	w9, [x21, #0x6f4]
 461dddc: 3707ff49     	tbnz	w9, #0x0, 0x461ddc4 <_ChromeMain+0x4618b28>
 461dde0: 390002da     	strb	w26, [x22]
 461dde4: f9404728     	ldr	x8, [x25, #0x88]
 461dde8: eb08031f     	cmp	x24, x8
 461ddec: 54000101     	b.ne	0x461de0c <_ChromeMain+0x4618b70>
 461ddf0: aa1603e0     	mov	x0, x22
 461ddf4: 96e81312     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461ddf8: 14000005     	b	0x461de0c <_ChromeMain+0x4618b70>
 461ddfc: d2800014     	mov	x20, #0x0               ; =0
 461de00: 17ffffd7     	b	0x461dd5c <_ChromeMain+0x4618ac0>
 461de04: 52800028     	mov	w8, #0x1                ; =1
 461de08: 790deaa8     	strh	w8, [x21, #0x6f4]
 461de0c: b50000f4     	cbnz	x20, 0x461de28 <_ChromeMain+0x4618b8c>
 461de10: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461de14: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461de18: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461de1c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 461de20: a8c567fa     	ldp	x26, x25, [sp], #0x50
 461de24: d65f03c0     	ret
 461de28: b4000117     	cbz	x23, 0x461de48 <_ChromeMain+0x4618bac>
 461de2c: cb170fe8     	neg	x8, x23, lsl #3
 461de30: 8b170e89     	add	x9, x20, x23, lsl #3
 461de34: d1002129     	sub	x9, x9, #0x8
 461de38: b40001a9     	cbz	x9, 0x461de6c <_ChromeMain+0x4618bd0>
 461de3c: d1002129     	sub	x9, x9, #0x8
 461de40: 91002108     	add	x8, x8, #0x8
 461de44: b5ffffa8     	cbnz	x8, 0x461de38 <_ChromeMain+0x4618b9c>
 461de48: aa1403e0     	mov	x0, x20
 461de4c: aa1303e1     	mov	x1, x19
 461de50: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461de54: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461de58: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461de5c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 461de60: a8c567fa     	ldp	x26, x25, [sp], #0x50
 461de64: 16e7ac15     	b	0x8eb8 <_ChromeMain+0x3c1c>
 461de68: 9763d7c6     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 461de6c: d4200020     	brk	#0x1
 461de70: f9429808     	ldr	x8, [x0, #0x530]
 461de74: b4000368     	cbz	x8, 0x461dee0 <_ChromeMain+0x4618c44>
 461de78: d10183ff     	sub	sp, sp, #0x60
 461de7c: a90357f6     	stp	x22, x21, [sp, #0x30]
 461de80: a9044ff4     	stp	x20, x19, [sp, #0x40]
 461de84: a9057bfd     	stp	x29, x30, [sp, #0x50]
 461de88: 910143fd     	add	x29, sp, #0x50
 461de8c: 39408508     	ldrb	w8, [x8, #0x21]
 461de90: 34000208     	cbz	w8, 0x461ded0 <_ChromeMain+0x4618c34>
 461de94: aa0003f3     	mov	x19, x0
 461de98: f9428c08     	ldr	x8, [x0, #0x518]
 461de9c: b40001a8     	cbz	x8, 0x461ded0 <_ChromeMain+0x4618c34>
 461dea0: aa0203f4     	mov	x20, x2
 461dea4: aa1303e0     	mov	x0, x19
 461dea8: 97ffd9a4     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461deac: b4000120     	cbz	x0, 0x461ded0 <_ChromeMain+0x4618c34>
 461deb0: aa0003f5     	mov	x21, x0
 461deb4: b940f808     	ldr	w8, [x0, #0xf8]
 461deb8: 350000c8     	cbnz	w8, 0x461ded0 <_ChromeMain+0x4618c34>
 461debc: aa1303e0     	mov	x0, x19
 461dec0: aa1403e1     	mov	x1, x20
 461dec4: aa1503e2     	mov	x2, x21
 461dec8: 94000024     	bl	0x461df58 <_ChromeMain+0x4618cbc>
 461decc: 350000c0     	cbnz	w0, 0x461dee4 <_ChromeMain+0x4618c48>
 461ded0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 461ded4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 461ded8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 461dedc: 910183ff     	add	sp, sp, #0x60
 461dee0: d65f03c0     	ret
 461dee4: 51019a88     	sub	w8, w20, #0x66
 461dee8: 90048649     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 461deec: 91009129     	add	x9, x9, #0x24
 461def0: 38684934     	ldrb	w20, [x9, w8, uxtw]
 461def4: 90048649     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 461def8: 9100b129     	add	x9, x9, #0x2c
 461defc: 38684936     	ldrb	w22, [x9, w8, uxtw]
 461df00: f9428e73     	ldr	x19, [x19, #0x518]
 461df04: 910063e8     	add	x8, sp, #0x18
 461df08: aa1503e0     	mov	x0, x21
 461df0c: 95fffc8c     	bl	0xc61d13c <_ChromeMain+0xc617ea0>
 461df10: 390003ff     	strb	wzr, [sp]
 461df14: 390043ff     	strb	wzr, [sp, #0x10]
 461df18: 910063e1     	add	x1, sp, #0x18
 461df1c: 910003e5     	mov	x5, sp
 461df20: aa1303e0     	mov	x0, x19
 461df24: aa1403e2     	mov	x2, x20
 461df28: aa1603e3     	mov	x3, x22
 461df2c: 52800004     	mov	w4, #0x0                ; =0
 461df30: 94db3364     	bl	0x7ceacc0 <_ChromeMain+0x7ce5a24>
 461df34: f9400fe1     	ldr	x1, [sp, #0x18]
 461df38: b4fffcc1     	cbz	x1, 0x461ded0 <_ChromeMain+0x4618c34>
 461df3c: 910063e0     	add	x0, sp, #0x18
 461df40: 941fa310     	bl	0x4e06b80 <_ChromeMain+0x4e018e4>
 461df44: f9400fe0     	ldr	x0, [sp, #0x18]
 461df48: f94017e8     	ldr	x8, [sp, #0x28]
 461df4c: d37df101     	lsl	x1, x8, #3
 461df50: 96e7abda     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461df54: 17ffffdf     	b	0x461ded0 <_ChromeMain+0x4618c34>
 461df58: b940f848     	ldr	w8, [x2, #0xf8]
 461df5c: 34000088     	cbz	w8, 0x461df6c <_ChromeMain+0x4618cd0>
 461df60: 52800000     	mov	w0, #0x0                ; =0
 461df64: 12000000     	and	w0, w0, #0x1
 461df68: d65f03c0     	ret
 461df6c: d10143ff     	sub	sp, sp, #0x50
 461df70: a90257f6     	stp	x22, x21, [sp, #0x20]
 461df74: a9034ff4     	stp	x20, x19, [sp, #0x30]
 461df78: a9047bfd     	stp	x29, x30, [sp, #0x40]
 461df7c: 910103fd     	add	x29, sp, #0x40
 461df80: aa0003f4     	mov	x20, x0
 461df84: f9428c08     	ldr	x8, [x0, #0x518]
 461df88: b4000068     	cbz	x8, 0x461df94 <_ChromeMain+0x4618cf8>
 461df8c: f9402113     	ldr	x19, [x8, #0x40]
 461df90: b50000f3     	cbnz	x19, 0x461dfac <_ChromeMain+0x4618d10>
 461df94: 52800000     	mov	w0, #0x0                ; =0
 461df98: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 461df9c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 461dfa0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 461dfa4: 910143ff     	add	sp, sp, #0x50
 461dfa8: 17ffffef     	b	0x461df64 <_ChromeMain+0x4618cc8>
 461dfac: aa0103f5     	mov	x21, x1
 461dfb0: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 461dfb4: f9000fff     	str	xzr, [sp, #0x18]
 461dfb8: 910023e8     	add	x8, sp, #0x8
 461dfbc: aa0203e0     	mov	x0, x2
 461dfc0: 95fffc5f     	bl	0xc61d13c <_ChromeMain+0xc617ea0>
 461dfc4: 52800000     	mov	w0, #0x0                ; =0
 461dfc8: 71019abf     	cmp	w21, #0x66
 461dfcc: 5400024c     	b.gt	0x461e014 <_ChromeMain+0x4618d78>
 461dfd0: 540001c1     	b.ne	0x461e008 <_ChromeMain+0x4618d6c>
 461dfd4: 39412268     	ldrb	w8, [x19, #0x48]
 461dfd8: 37000168     	tbnz	w8, #0x0, 0x461e004 <_ChromeMain+0x4618d68>
 461dfdc: f9400268     	ldr	x8, [x19]
 461dfe0: f940b908     	ldr	x8, [x8, #0x170]
 461dfe4: aa1303e0     	mov	x0, x19
 461dfe8: d63f0100     	blr	x8
 461dfec: f0043c21     	adrp	x1, 0xcda4000 <dyld_stub_binder+0xcda4000>
 461dff0: 9129c821     	add	x1, x1, #0xa72
 461dff4: 52800362     	mov	w2, #0x1b               ; =27
 461dff8: 96f2828c     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 461dffc: 7100041f     	cmp	w0, #0x1
 461e000: 54000361     	b.ne	0x461e06c <_ChromeMain+0x4618dd0>
 461e004: 52800000     	mov	w0, #0x0                ; =0
 461e008: f94007e1     	ldr	x1, [sp, #0x8]
 461e00c: b4fffc61     	cbz	x1, 0x461df98 <_ChromeMain+0x4618cfc>
 461e010: 14000028     	b	0x461e0b0 <_ChromeMain+0x4618e14>
 461e014: 51019ea8     	sub	w8, w21, #0x67
 461e018: 7100091f     	cmp	w8, #0x2
 461e01c: 54000223     	b.lo	0x461e060 <_ChromeMain+0x4618dc4>
 461e020: 7101a6bf     	cmp	w21, #0x69
 461e024: 540002a0     	b.eq	0x461e078 <_ChromeMain+0x4618ddc>
 461e028: 7101aabf     	cmp	w21, #0x6a
 461e02c: 54fffee1     	b.ne	0x461e008 <_ChromeMain+0x4618d6c>
 461e030: f9428e88     	ldr	x8, [x20, #0x518]
 461e034: f9403108     	ldr	x8, [x8, #0x60]
 461e038: f9404913     	ldr	x19, [x8, #0x90]
 461e03c: 910023e0     	add	x0, sp, #0x8
 461e040: 94db35b7     	bl	0x7ceb71c <_ChromeMain+0x7ce6480>
 461e044: aa0003e8     	mov	x8, x0
 461e048: 52800000     	mov	w0, #0x0                ; =0
 461e04c: 34fffde8     	cbz	w8, 0x461e008 <_ChromeMain+0x4618d6c>
 461e050: b4fffdd3     	cbz	x19, 0x461e008 <_ChromeMain+0x4618d6c>
 461e054: 3941e268     	ldrb	w8, [x19, #0x78]
 461e058: 52000100     	eor	w0, w8, #0x1
 461e05c: 17ffffeb     	b	0x461e008 <_ChromeMain+0x4618d6c>
 461e060: 910023e0     	add	x0, sp, #0x8
 461e064: 94db35ae     	bl	0x7ceb71c <_ChromeMain+0x7ce6480>
 461e068: 17ffffe8     	b	0x461e008 <_ChromeMain+0x4618d6c>
 461e06c: 910023e0     	add	x0, sp, #0x8
 461e070: 94db35be     	bl	0x7ceb768 <_ChromeMain+0x7ce64cc>
 461e074: 17ffffe5     	b	0x461e008 <_ChromeMain+0x4618d6c>
 461e078: 910023e0     	add	x0, sp, #0x8
 461e07c: 94db35a8     	bl	0x7ceb71c <_ChromeMain+0x7ce6480>
 461e080: 34fffc40     	cbz	w0, 0x461e008 <_ChromeMain+0x4618d6c>
 461e084: f9400268     	ldr	x8, [x19]
 461e088: f940b908     	ldr	x8, [x8, #0x170]
 461e08c: aa1303e0     	mov	x0, x19
 461e090: d63f0100     	blr	x8
 461e094: d0043c21     	adrp	x1, 0xcda4000 <dyld_stub_binder+0xcda4000>
 461e098: 9129c821     	add	x1, x1, #0xa72
 461e09c: 52800362     	mov	w2, #0x1b               ; =27
 461e0a0: 96f28262     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 461e0a4: 7100081f     	cmp	w0, #0x2
 461e0a8: 1a9f07e0     	cset	w0, ne
 461e0ac: 17ffffd7     	b	0x461e008 <_ChromeMain+0x4618d6c>
 461e0b0: aa0003f3     	mov	x19, x0
 461e0b4: 910023e0     	add	x0, sp, #0x8
 461e0b8: 941fa2b2     	bl	0x4e06b80 <_ChromeMain+0x4e018e4>
 461e0bc: f94007e0     	ldr	x0, [sp, #0x8]
 461e0c0: f9400fe8     	ldr	x8, [sp, #0x18]
 461e0c4: d37df101     	lsl	x1, x8, #3
 461e0c8: 96e7ab7c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461e0cc: aa1303e0     	mov	x0, x19
 461e0d0: 17ffffb2     	b	0x461df98 <_ChromeMain+0x4618cfc>
 461e0d4: 00000000     	udf	#0x0
 461e0d8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e0dc: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e0e0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e0e4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e0e8: 9100c3fd     	add	x29, sp, #0x30
 461e0ec: aa0003f4     	mov	x20, x0
 461e0f0: 395bcc08     	ldrb	w8, [x0, #0x6f3]
 461e0f4: 34000108     	cbz	w8, 0x461e114 <_ChromeMain+0x4618e78>
 461e0f8: 52800028     	mov	w8, #0x1                ; =1
 461e0fc: 790dea88     	strh	w8, [x20, #0x6f4]
 461e100: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e104: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e108: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e10c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e110: d65f03c0     	ret
 461e114: 911bce93     	add	x19, x20, #0x6f3
 461e118: 925e7675     	and	x21, x19, #0xfffffffc00000000
 461e11c: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e120: f94046c8     	ldr	x8, [x22, #0x88]
 461e124: eb0802bf     	cmp	x21, x8
 461e128: 54000060     	b.eq	0x461e134 <_ChromeMain+0x4618e98>
 461e12c: 52800017     	mov	w23, #0x0               ; =0
 461e130: 14000004     	b	0x461e140 <_ChromeMain+0x4618ea4>
 461e134: 911bce80     	add	x0, x20, #0x6f3
 461e138: 96e7d871     	bl	0x142fc <_ChromeMain+0xf060>
 461e13c: 39400277     	ldrb	w23, [x19]
 461e140: 52800008     	mov	w8, #0x0                ; =0
 461e144: 52800029     	mov	w9, #0x1                ; =1
 461e148: 391bce89     	strb	w9, [x20, #0x6f3]
 461e14c: 391bd29f     	strb	wzr, [x20, #0x6f4]
 461e150: 12000101     	and	w1, w8, #0x1
 461e154: aa1403e0     	mov	x0, x20
 461e158: 97ffdeaa     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e15c: 395bd688     	ldrb	w8, [x20, #0x6f5]
 461e160: 395bd289     	ldrb	w9, [x20, #0x6f4]
 461e164: 3707ff49     	tbnz	w9, #0x0, 0x461e14c <_ChromeMain+0x4618eb0>
 461e168: 39000277     	strb	w23, [x19]
 461e16c: f94046c8     	ldr	x8, [x22, #0x88]
 461e170: eb0802bf     	cmp	x21, x8
 461e174: 54fffc61     	b.ne	0x461e100 <_ChromeMain+0x4618e64>
 461e178: aa1303e0     	mov	x0, x19
 461e17c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e180: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e184: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e188: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e18c: 16e8122c     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e190: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e194: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e198: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e19c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e1a0: 9100c3fd     	add	x29, sp, #0x30
 461e1a4: aa0003f3     	mov	x19, x0
 461e1a8: 3948cc08     	ldrb	w8, [x0, #0x233]
 461e1ac: 34000108     	cbz	w8, 0x461e1cc <_ChromeMain+0x4618f30>
 461e1b0: 52800028     	mov	w8, #0x1                ; =1
 461e1b4: 79046a68     	strh	w8, [x19, #0x234]
 461e1b8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e1bc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e1c0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e1c4: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e1c8: d65f03c0     	ret
 461e1cc: 9108ce74     	add	x20, x19, #0x233
 461e1d0: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e1d4: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e1d8: f94046c8     	ldr	x8, [x22, #0x88]
 461e1dc: eb0802bf     	cmp	x21, x8
 461e1e0: 54000060     	b.eq	0x461e1ec <_ChromeMain+0x4618f50>
 461e1e4: 52800017     	mov	w23, #0x0               ; =0
 461e1e8: 14000004     	b	0x461e1f8 <_ChromeMain+0x4618f5c>
 461e1ec: 9108ce60     	add	x0, x19, #0x233
 461e1f0: 96e7d843     	bl	0x142fc <_ChromeMain+0xf060>
 461e1f4: 39400297     	ldrb	w23, [x20]
 461e1f8: 52800008     	mov	w8, #0x0                ; =0
 461e1fc: 52800029     	mov	w9, #0x1                ; =1
 461e200: 3908ce69     	strb	w9, [x19, #0x233]
 461e204: 3908d27f     	strb	wzr, [x19, #0x234]
 461e208: d1130260     	sub	x0, x19, #0x4c0
 461e20c: 12000101     	and	w1, w8, #0x1
 461e210: 97ffde7c     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e214: 3948d668     	ldrb	w8, [x19, #0x235]
 461e218: 3948d269     	ldrb	w9, [x19, #0x234]
 461e21c: 3707ff49     	tbnz	w9, #0x0, 0x461e204 <_ChromeMain+0x4618f68>
 461e220: 39000297     	strb	w23, [x20]
 461e224: f94046c8     	ldr	x8, [x22, #0x88]
 461e228: eb0802bf     	cmp	x21, x8
 461e22c: 54fffc61     	b.ne	0x461e1b8 <_ChromeMain+0x4618f1c>
 461e230: aa1403e0     	mov	x0, x20
 461e234: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e238: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e23c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e240: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e244: 16e811fe     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e248: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e24c: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e250: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e254: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e258: 9100c3fd     	add	x29, sp, #0x30
 461e25c: aa0003f3     	mov	x19, x0
 461e260: f9434014     	ldr	x20, [x0, #0x680]
 461e264: 90052cb5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e268: b4000174     	cbz	x20, 0x461e294 <_ChromeMain+0x4618ff8>
 461e26c: f903427f     	str	xzr, [x19, #0x680]
 461e270: f9433e61     	ldr	x1, [x19, #0x678]
 461e274: 9101c280     	add	x0, x20, #0x70
 461e278: 976aad3c     	bl	0x20c9768 <_ChromeMain+0x20c44cc>
 461e27c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 461e280: f94046a9     	ldr	x9, [x21, #0x88]
 461e284: eb09011f     	cmp	x8, x9
 461e288: 54000061     	b.ne	0x461e294 <_ChromeMain+0x4618ff8>
 461e28c: aa1403e0     	mov	x0, x20
 461e290: 96e811eb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461e294: f9429a60     	ldr	x0, [x19, #0x530]
 461e298: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461e29c: f94046a9     	ldr	x9, [x21, #0x88]
 461e2a0: eb09011f     	cmp	x8, x9
 461e2a4: 54000041     	b.ne	0x461e2ac <_ChromeMain+0x4619010>
 461e2a8: 96e811e5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461e2ac: f9029a7f     	str	xzr, [x19, #0x530]
 461e2b0: 395bce68     	ldrb	w8, [x19, #0x6f3]
 461e2b4: 34000108     	cbz	w8, 0x461e2d4 <_ChromeMain+0x4619038>
 461e2b8: 52800028     	mov	w8, #0x1                ; =1
 461e2bc: 790dea68     	strh	w8, [x19, #0x6f4]
 461e2c0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e2c4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e2c8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e2cc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e2d0: d65f03c0     	ret
 461e2d4: 911bce74     	add	x20, x19, #0x6f3
 461e2d8: 925e7696     	and	x22, x20, #0xfffffffc00000000
 461e2dc: f94046a8     	ldr	x8, [x21, #0x88]
 461e2e0: eb0802df     	cmp	x22, x8
 461e2e4: 54000060     	b.eq	0x461e2f0 <_ChromeMain+0x4619054>
 461e2e8: 52800017     	mov	w23, #0x0               ; =0
 461e2ec: 14000004     	b	0x461e2fc <_ChromeMain+0x4619060>
 461e2f0: 911bce60     	add	x0, x19, #0x6f3
 461e2f4: 96e7d802     	bl	0x142fc <_ChromeMain+0xf060>
 461e2f8: 39400297     	ldrb	w23, [x20]
 461e2fc: 52800008     	mov	w8, #0x0                ; =0
 461e300: 52800029     	mov	w9, #0x1                ; =1
 461e304: 391bce69     	strb	w9, [x19, #0x6f3]
 461e308: 391bd27f     	strb	wzr, [x19, #0x6f4]
 461e30c: 12000101     	and	w1, w8, #0x1
 461e310: aa1303e0     	mov	x0, x19
 461e314: 97ffde3b     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e318: 395bd668     	ldrb	w8, [x19, #0x6f5]
 461e31c: 395bd269     	ldrb	w9, [x19, #0x6f4]
 461e320: 3707ff49     	tbnz	w9, #0x0, 0x461e308 <_ChromeMain+0x461906c>
 461e324: 39000297     	strb	w23, [x20]
 461e328: f94046a8     	ldr	x8, [x21, #0x88]
 461e32c: eb0802df     	cmp	x22, x8
 461e330: 54fffc81     	b.ne	0x461e2c0 <_ChromeMain+0x4619024>
 461e334: aa1403e0     	mov	x0, x20
 461e338: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e33c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e340: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e344: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e348: 16e811bd     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e34c: d1130000     	sub	x0, x0, #0x4c0
 461e350: 17ffffbe     	b	0x461e248 <_ChromeMain+0x4618fac>
		...
 461e360: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e364: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e368: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e36c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e370: 9100c3fd     	add	x29, sp, #0x30
 461e374: 395bc808     	ldrb	w8, [x0, #0x6f2]
 461e378: 370000c8     	tbnz	w8, #0x0, 0x461e390 <_ChromeMain+0x46190f4>
 461e37c: aa0003f3     	mov	x19, x0
 461e380: 395bcc08     	ldrb	w8, [x0, #0x6f3]
 461e384: 34000108     	cbz	w8, 0x461e3a4 <_ChromeMain+0x4619108>
 461e388: 52800028     	mov	w8, #0x1                ; =1
 461e38c: 790dea68     	strh	w8, [x19, #0x6f4]
 461e390: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e394: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e398: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e39c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e3a0: d65f03c0     	ret
 461e3a4: 911bce74     	add	x20, x19, #0x6f3
 461e3a8: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e3ac: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e3b0: f94046c8     	ldr	x8, [x22, #0x88]
 461e3b4: eb0802bf     	cmp	x21, x8
 461e3b8: 54000060     	b.eq	0x461e3c4 <_ChromeMain+0x4619128>
 461e3bc: 52800017     	mov	w23, #0x0               ; =0
 461e3c0: 14000004     	b	0x461e3d0 <_ChromeMain+0x4619134>
 461e3c4: 911bce60     	add	x0, x19, #0x6f3
 461e3c8: 96e7d7cd     	bl	0x142fc <_ChromeMain+0xf060>
 461e3cc: 39400297     	ldrb	w23, [x20]
 461e3d0: 52800008     	mov	w8, #0x0                ; =0
 461e3d4: 52800029     	mov	w9, #0x1                ; =1
 461e3d8: 391bce69     	strb	w9, [x19, #0x6f3]
 461e3dc: 391bd27f     	strb	wzr, [x19, #0x6f4]
 461e3e0: 12000101     	and	w1, w8, #0x1
 461e3e4: aa1303e0     	mov	x0, x19
 461e3e8: 97ffde06     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e3ec: 395bd668     	ldrb	w8, [x19, #0x6f5]
 461e3f0: 395bd269     	ldrb	w9, [x19, #0x6f4]
 461e3f4: 3707ff49     	tbnz	w9, #0x0, 0x461e3dc <_ChromeMain+0x4619140>
 461e3f8: 39000297     	strb	w23, [x20]
 461e3fc: f94046c8     	ldr	x8, [x22, #0x88]
 461e400: eb0802bf     	cmp	x21, x8
 461e404: 54fffc61     	b.ne	0x461e390 <_ChromeMain+0x46190f4>
 461e408: aa1403e0     	mov	x0, x20
 461e40c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e410: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e414: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e418: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e41c: 16e81188     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e420: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e424: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e428: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e42c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e430: 9100c3fd     	add	x29, sp, #0x30
 461e434: 3948c808     	ldrb	w8, [x0, #0x232]
 461e438: 370000c8     	tbnz	w8, #0x0, 0x461e450 <_ChromeMain+0x46191b4>
 461e43c: aa0003f3     	mov	x19, x0
 461e440: 3948cc08     	ldrb	w8, [x0, #0x233]
 461e444: 34000108     	cbz	w8, 0x461e464 <_ChromeMain+0x46191c8>
 461e448: 52800028     	mov	w8, #0x1                ; =1
 461e44c: 79046a68     	strh	w8, [x19, #0x234]
 461e450: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e454: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e458: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e45c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e460: d65f03c0     	ret
 461e464: 9108ce74     	add	x20, x19, #0x233
 461e468: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e46c: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e470: f94046c8     	ldr	x8, [x22, #0x88]
 461e474: eb0802bf     	cmp	x21, x8
 461e478: 54000060     	b.eq	0x461e484 <_ChromeMain+0x46191e8>
 461e47c: 52800017     	mov	w23, #0x0               ; =0
 461e480: 14000004     	b	0x461e490 <_ChromeMain+0x46191f4>
 461e484: 9108ce60     	add	x0, x19, #0x233
 461e488: 96e7d79d     	bl	0x142fc <_ChromeMain+0xf060>
 461e48c: 39400297     	ldrb	w23, [x20]
 461e490: 52800008     	mov	w8, #0x0                ; =0
 461e494: 52800029     	mov	w9, #0x1                ; =1
 461e498: 3908ce69     	strb	w9, [x19, #0x233]
 461e49c: 3908d27f     	strb	wzr, [x19, #0x234]
 461e4a0: d1130260     	sub	x0, x19, #0x4c0
 461e4a4: 12000101     	and	w1, w8, #0x1
 461e4a8: 97ffddd6     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e4ac: 3948d668     	ldrb	w8, [x19, #0x235]
 461e4b0: 3948d269     	ldrb	w9, [x19, #0x234]
 461e4b4: 3707ff49     	tbnz	w9, #0x0, 0x461e49c <_ChromeMain+0x4619200>
 461e4b8: 39000297     	strb	w23, [x20]
 461e4bc: f94046c8     	ldr	x8, [x22, #0x88]
 461e4c0: eb0802bf     	cmp	x21, x8
 461e4c4: 54fffc61     	b.ne	0x461e450 <_ChromeMain+0x46191b4>
 461e4c8: aa1403e0     	mov	x0, x20
 461e4cc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e4d0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e4d4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e4d8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e4dc: 16e81158     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e4e0: f942e809     	ldr	x9, [x0, #0x5d0]
 461e4e4: f942ec0a     	ldr	x10, [x0, #0x5d8]
 461e4e8: d37ced48     	lsl	x8, x10, #4
 461e4ec: b4000268     	cbz	x8, 0x461e538 <_ChromeMain+0x461929c>
 461e4f0: 9344fd0b     	asr	x11, x8, #4
 461e4f4: aa0903e8     	mov	x8, x9
 461e4f8: d341fd6c     	lsr	x12, x11, #1
 461e4fc: 8b0c110d     	add	x13, x8, x12, lsl #4
 461e500: f84105ae     	ldr	x14, [x13], #0x10
 461e504: aa6b07ef     	mvn	x15, x11, lsr #1
 461e508: 8b0f016b     	add	x11, x11, x15
 461e50c: eb0101df     	cmp	x14, x1
 461e510: 9a8c316b     	csel	x11, x11, x12, lo
 461e514: 9a8831a8     	csel	x8, x13, x8, lo
 461e518: b5ffff0b     	cbnz	x11, 0x461e4f8 <_ChromeMain+0x461925c>
 461e51c: 8b0a1129     	add	x9, x9, x10, lsl #4
 461e520: eb09011f     	cmp	x8, x9
 461e524: 54000080     	b.eq	0x461e534 <_ChromeMain+0x4619298>
 461e528: f9400109     	ldr	x9, [x8]
 461e52c: eb09003f     	cmp	x1, x9
 461e530: 54000082     	b.hs	0x461e540 <_ChromeMain+0x46192a4>
 461e534: d65f03c0     	ret
 461e538: aa0903e8     	mov	x8, x9
 461e53c: 17fffff8     	b	0x461e51c <_ChromeMain+0x4619280>
 461e540: f9429801     	ldr	x1, [x0, #0x530]
 461e544: b4ffff81     	cbz	x1, 0x461e534 <_ChromeMain+0x4619298>
 461e548: f9400500     	ldr	x0, [x8, #0x8]
 461e54c: 17fff2a1     	b	0x461afd0 <_ChromeMain+0x4615d34>
 461e550: a9512809     	ldp	x9, x10, [x0, #0x110]
 461e554: d37ced48     	lsl	x8, x10, #4
 461e558: b4000268     	cbz	x8, 0x461e5a4 <_ChromeMain+0x4619308>
 461e55c: 9344fd0b     	asr	x11, x8, #4
 461e560: aa0903e8     	mov	x8, x9
 461e564: d341fd6c     	lsr	x12, x11, #1
 461e568: 8b0c110d     	add	x13, x8, x12, lsl #4
 461e56c: f84105ae     	ldr	x14, [x13], #0x10
 461e570: aa6b07ef     	mvn	x15, x11, lsr #1
 461e574: 8b0f016b     	add	x11, x11, x15
 461e578: eb0101df     	cmp	x14, x1
 461e57c: 9a8c316b     	csel	x11, x11, x12, lo
 461e580: 9a8831a8     	csel	x8, x13, x8, lo
 461e584: b5ffff0b     	cbnz	x11, 0x461e564 <_ChromeMain+0x46192c8>
 461e588: 8b0a1129     	add	x9, x9, x10, lsl #4
 461e58c: eb09011f     	cmp	x8, x9
 461e590: 54000080     	b.eq	0x461e5a0 <_ChromeMain+0x4619304>
 461e594: f9400109     	ldr	x9, [x8]
 461e598: eb09003f     	cmp	x1, x9
 461e59c: 54000082     	b.hs	0x461e5ac <_ChromeMain+0x4619310>
 461e5a0: d65f03c0     	ret
 461e5a4: aa0903e8     	mov	x8, x9
 461e5a8: 17fffff8     	b	0x461e588 <_ChromeMain+0x46192ec>
 461e5ac: f9403801     	ldr	x1, [x0, #0x70]
 461e5b0: b4ffff81     	cbz	x1, 0x461e5a0 <_ChromeMain+0x4619304>
 461e5b4: f9400500     	ldr	x0, [x8, #0x8]
 461e5b8: 17fff286     	b	0x461afd0 <_ChromeMain+0x4615d34>
 461e5bc: 00000000     	udf	#0x0
 461e5c0: 52800028     	mov	w8, #0x1                ; =1
 461e5c4: 391bc808     	strb	w8, [x0, #0x6f2]
 461e5c8: d65f03c0     	ret
 461e5cc: 52800028     	mov	w8, #0x1                ; =1
 461e5d0: 3908c808     	strb	w8, [x0, #0x232]
 461e5d4: d65f03c0     	ret
 461e5d8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e5dc: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e5e0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e5e4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e5e8: 9100c3fd     	add	x29, sp, #0x30
 461e5ec: aa0003f3     	mov	x19, x0
 461e5f0: 391bc81f     	strb	wzr, [x0, #0x6f2]
 461e5f4: 395bcc08     	ldrb	w8, [x0, #0x6f3]
 461e5f8: 34000108     	cbz	w8, 0x461e618 <_ChromeMain+0x461937c>
 461e5fc: 52800028     	mov	w8, #0x1                ; =1
 461e600: 790dea68     	strh	w8, [x19, #0x6f4]
 461e604: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e608: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e60c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e610: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e614: d65f03c0     	ret
 461e618: 911bce74     	add	x20, x19, #0x6f3
 461e61c: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e620: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e624: f94046c8     	ldr	x8, [x22, #0x88]
 461e628: eb0802bf     	cmp	x21, x8
 461e62c: 54000060     	b.eq	0x461e638 <_ChromeMain+0x461939c>
 461e630: 52800017     	mov	w23, #0x0               ; =0
 461e634: 14000004     	b	0x461e644 <_ChromeMain+0x46193a8>
 461e638: 911bce60     	add	x0, x19, #0x6f3
 461e63c: 96e7d730     	bl	0x142fc <_ChromeMain+0xf060>
 461e640: 39400297     	ldrb	w23, [x20]
 461e644: 52800008     	mov	w8, #0x0                ; =0
 461e648: 52800029     	mov	w9, #0x1                ; =1
 461e64c: 391bce69     	strb	w9, [x19, #0x6f3]
 461e650: 391bd27f     	strb	wzr, [x19, #0x6f4]
 461e654: 12000101     	and	w1, w8, #0x1
 461e658: aa1303e0     	mov	x0, x19
 461e65c: 97ffdd69     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e660: 395bd668     	ldrb	w8, [x19, #0x6f5]
 461e664: 395bd269     	ldrb	w9, [x19, #0x6f4]
 461e668: 3707ff49     	tbnz	w9, #0x0, 0x461e650 <_ChromeMain+0x46193b4>
 461e66c: 39000297     	strb	w23, [x20]
 461e670: f94046c8     	ldr	x8, [x22, #0x88]
 461e674: eb0802bf     	cmp	x21, x8
 461e678: 54fffc61     	b.ne	0x461e604 <_ChromeMain+0x4619368>
 461e67c: aa1403e0     	mov	x0, x20
 461e680: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e684: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e688: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e68c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e690: 16e810eb     	b	0x22a3c <_ChromeMain+0x1d7a0>
 461e694: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461e698: a90157f6     	stp	x22, x21, [sp, #0x10]
 461e69c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461e6a0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461e6a4: 9100c3fd     	add	x29, sp, #0x30
 461e6a8: aa0003f3     	mov	x19, x0
 461e6ac: 3908c81f     	strb	wzr, [x0, #0x232]
 461e6b0: 3948cc08     	ldrb	w8, [x0, #0x233]
 461e6b4: 34000108     	cbz	w8, 0x461e6d4 <_ChromeMain+0x4619438>
 461e6b8: 52800028     	mov	w8, #0x1                ; =1
 461e6bc: 79046a68     	strh	w8, [x19, #0x234]
 461e6c0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e6c4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e6c8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e6cc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e6d0: d65f03c0     	ret
 461e6d4: 9108ce74     	add	x20, x19, #0x233
 461e6d8: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e6dc: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e6e0: f94046c8     	ldr	x8, [x22, #0x88]
 461e6e4: eb0802bf     	cmp	x21, x8
 461e6e8: 54000060     	b.eq	0x461e6f4 <_ChromeMain+0x4619458>
 461e6ec: 52800017     	mov	w23, #0x0               ; =0
 461e6f0: 14000004     	b	0x461e700 <_ChromeMain+0x4619464>
 461e6f4: 9108ce60     	add	x0, x19, #0x233
 461e6f8: 96e7d701     	bl	0x142fc <_ChromeMain+0xf060>
 461e6fc: 39400297     	ldrb	w23, [x20]
 461e700: 52800008     	mov	w8, #0x0                ; =0
 461e704: 52800029     	mov	w9, #0x1                ; =1
 461e708: 3908ce69     	strb	w9, [x19, #0x233]
 461e70c: 3908d27f     	strb	wzr, [x19, #0x234]
 461e710: d1130260     	sub	x0, x19, #0x4c0
 461e714: 12000101     	and	w1, w8, #0x1
 461e718: 97ffdd3a     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e71c: 3948d668     	ldrb	w8, [x19, #0x235]
 461e720: 3948d269     	ldrb	w9, [x19, #0x234]
 461e724: 3707ff49     	tbnz	w9, #0x0, 0x461e70c <_ChromeMain+0x4619470>
 461e728: 39000297     	strb	w23, [x20]
 461e72c: f94046c8     	ldr	x8, [x22, #0x88]
 461e730: eb0802bf     	cmp	x21, x8
 461e734: 54fffc61     	b.ne	0x461e6c0 <_ChromeMain+0x4619424>
 461e738: aa1403e0     	mov	x0, x20
 461e73c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461e740: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461e744: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461e748: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461e74c: 16e810bc     	b	0x22a3c <_ChromeMain+0x1d7a0>
		...
 461e780: d10303ff     	sub	sp, sp, #0xc0
 461e784: a9085ff8     	stp	x24, x23, [sp, #0x80]
 461e788: a90957f6     	stp	x22, x21, [sp, #0x90]
 461e78c: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 461e790: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 461e794: 9102c3fd     	add	x29, sp, #0xb0
 461e798: aa0003f3     	mov	x19, x0
 461e79c: f9003bff     	str	xzr, [sp, #0x70]
 461e7a0: 6f00e400     	movi.2d	v0, #0000000000000000
 461e7a4: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461e7a8: ad0183e0     	stp	q0, q0, [sp, #0x30]
 461e7ac: ad0083e0     	stp	q0, q0, [sp, #0x10]
 461e7b0: 3d8003e0     	str	q0, [sp]
 461e7b4: 910003f4     	mov	x20, sp
 461e7b8: 910003e8     	mov	x8, sp
 461e7bc: 97ffe1d0     	bl	0x4616efc <_ChromeMain+0x4611c60>
 461e7c0: 39405fe9     	ldrb	w9, [sp, #0x17]
 461e7c4: 13001d28     	sxtb	w8, w9
 461e7c8: f94007ea     	ldr	x10, [sp, #0x8]
 461e7cc: 7100011f     	cmp	w8, #0x0
 461e7d0: 9a894142     	csel	x2, x10, x9, mi
 461e7d4: 39643e6a     	ldrb	w10, [x19, #0x90f]
 461e7d8: 13001d49     	sxtb	w9, w10
 461e7dc: f944826b     	ldr	x11, [x19, #0x900]
 461e7e0: 7100013f     	cmp	w9, #0x0
 461e7e4: 9a8a416a     	csel	x10, x11, x10, mi
 461e7e8: eb0a005f     	cmp	x2, x10
 461e7ec: 54000141     	b.ne	0x461e814 <_ChromeMain+0x4619578>
 461e7f0: 9123e26a     	add	x10, x19, #0x8f8
 461e7f4: f94003eb     	ldr	x11, [sp]
 461e7f8: 7100011f     	cmp	w8, #0x0
 461e7fc: 9a944160     	csel	x0, x11, x20, mi
 461e800: f9447e68     	ldr	x8, [x19, #0x8f8]
 461e804: 7100013f     	cmp	w9, #0x0
 461e808: 9a8a4101     	csel	x1, x8, x10, mi
 461e80c: 94e7ac15     	bl	0x8009860 <_ChromeMain+0x80045c4>
 461e810: 340003e0     	cbz	w0, 0x461e88c <_ChromeMain+0x46195f0>
 461e814: 395bce68     	ldrb	w8, [x19, #0x6f3]
 461e818: 35000448     	cbnz	w8, 0x461e8a0 <_ChromeMain+0x4619604>
 461e81c: 911bce74     	add	x20, x19, #0x6f3
 461e820: 925e7695     	and	x21, x20, #0xfffffffc00000000
 461e824: 90052cb6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e828: f94046c8     	ldr	x8, [x22, #0x88]
 461e82c: eb0802bf     	cmp	x21, x8
 461e830: 54000060     	b.eq	0x461e83c <_ChromeMain+0x46195a0>
 461e834: 52800017     	mov	w23, #0x0               ; =0
 461e838: 14000004     	b	0x461e848 <_ChromeMain+0x46195ac>
 461e83c: 911bce60     	add	x0, x19, #0x6f3
 461e840: 96e7d6af     	bl	0x142fc <_ChromeMain+0xf060>
 461e844: 39400297     	ldrb	w23, [x20]
 461e848: 52800008     	mov	w8, #0x0                ; =0
 461e84c: 52800029     	mov	w9, #0x1                ; =1
 461e850: 391bce69     	strb	w9, [x19, #0x6f3]
 461e854: 391bd27f     	strb	wzr, [x19, #0x6f4]
 461e858: 12000101     	and	w1, w8, #0x1
 461e85c: aa1303e0     	mov	x0, x19
 461e860: 97ffdce8     	bl	0x4615c00 <_ChromeMain+0x4610964>
 461e864: 395bd668     	ldrb	w8, [x19, #0x6f5]
 461e868: 395bd269     	ldrb	w9, [x19, #0x6f4]
 461e86c: 3707ff49     	tbnz	w9, #0x0, 0x461e854 <_ChromeMain+0x46195b8>
 461e870: 39000297     	strb	w23, [x20]
 461e874: f94046c8     	ldr	x8, [x22, #0x88]
 461e878: eb0802bf     	cmp	x21, x8
 461e87c: 54000161     	b.ne	0x461e8a8 <_ChromeMain+0x461960c>
 461e880: aa1403e0     	mov	x0, x20
 461e884: 96e8106e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461e888: 14000008     	b	0x461e8a8 <_ChromeMain+0x461960c>
 461e88c: aa1303e0     	mov	x0, x19
 461e890: 97ffd353     	bl	0x46135dc <_ChromeMain+0x460e340>
 461e894: aa1303e0     	mov	x0, x19
 461e898: 97ffd3f3     	bl	0x4613864 <_ChromeMain+0x460e5c8>
 461e89c: 14000003     	b	0x461e8a8 <_ChromeMain+0x461960c>
 461e8a0: 52800028     	mov	w8, #0x1                ; =1
 461e8a4: 790dea68     	strh	w8, [x19, #0x6f4]
 461e8a8: 910003f3     	mov	x19, sp
 461e8ac: 9101c260     	add	x0, x19, #0x70
 461e8b0: d2800001     	mov	x1, #0x0                ; =0
 461e8b4: 96e82501     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461e8b8: 91008260     	add	x0, x19, #0x20
 461e8bc: 96e824ef     	bl	0x27c78 <_ChromeMain+0x229dc>
 461e8c0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 461e8c4: 36f800a8     	tbz	w8, #0x1f, 0x461e8d8 <_ChromeMain+0x461963c>
 461e8c8: f94003e0     	ldr	x0, [sp]
 461e8cc: f9400be8     	ldr	x8, [sp, #0x10]
 461e8d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461e8d4: 96e7a979     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461e8d8: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 461e8dc: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 461e8e0: a94957f6     	ldp	x22, x21, [sp, #0x90]
 461e8e4: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 461e8e8: 910303ff     	add	sp, sp, #0xc0
 461e8ec: d65f03c0     	ret
 461e8f0: d1136000     	sub	x0, x0, #0x4d8
 461e8f4: 17ffffa3     	b	0x461e780 <_ChromeMain+0x46194e4>
		...
 461e900: f9429008     	ldr	x8, [x0, #0x520]
 461e904: eb01011f     	cmp	x8, x1
 461e908: 54000040     	b.eq	0x461e910 <_ChromeMain+0x4619674>
 461e90c: d65f03c0     	ret
 461e910: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 461e914: a9017bfd     	stp	x29, x30, [sp, #0x10]
 461e918: 910043fd     	add	x29, sp, #0x10
 461e91c: aa0003f3     	mov	x19, x0
 461e920: 925e7428     	and	x8, x1, #0xfffffffc00000000
 461e924: 90052ca9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e928: f9404529     	ldr	x9, [x9, #0x88]
 461e92c: eb09011f     	cmp	x8, x9
 461e930: 54000061     	b.ne	0x461e93c <_ChromeMain+0x46196a0>
 461e934: aa0103e0     	mov	x0, x1
 461e938: 96e81041     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461e93c: f902927f     	str	xzr, [x19, #0x520]
 461e940: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 461e944: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 461e948: d65f03c0     	ret
 461e94c: f9402408     	ldr	x8, [x0, #0x48]
 461e950: eb01011f     	cmp	x8, x1
 461e954: 54000040     	b.eq	0x461e95c <_ChromeMain+0x46196c0>
 461e958: d65f03c0     	ret
 461e95c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 461e960: a9017bfd     	stp	x29, x30, [sp, #0x10]
 461e964: 910043fd     	add	x29, sp, #0x10
 461e968: aa0003f3     	mov	x19, x0
 461e96c: 925e7428     	and	x8, x1, #0xfffffffc00000000
 461e970: 90052ca9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461e974: f9404529     	ldr	x9, [x9, #0x88]
 461e978: eb09011f     	cmp	x8, x9
 461e97c: 54000061     	b.ne	0x461e988 <_ChromeMain+0x46196ec>
 461e980: aa0103e0     	mov	x0, x1
 461e984: 96e8102e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461e988: f900267f     	str	xzr, [x19, #0x48]
 461e98c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 461e990: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 461e994: d65f03c0     	ret
		...
