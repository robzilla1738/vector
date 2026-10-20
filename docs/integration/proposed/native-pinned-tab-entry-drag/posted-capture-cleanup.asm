
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460f1f8: d10643ff     	sub	sp, sp, #0x190
 460f1fc: 6d1223e9     	stp	d9, d8, [sp, #0x120]
 460f200: a9136ffc     	stp	x28, x27, [sp, #0x130]
 460f204: a91467fa     	stp	x26, x25, [sp, #0x140]
 460f208: a9155ff8     	stp	x24, x23, [sp, #0x150]
 460f20c: a91657f6     	stp	x22, x21, [sp, #0x160]
 460f210: a9174ff4     	stp	x20, x19, [sp, #0x170]
 460f214: a9187bfd     	stp	x29, x30, [sp, #0x180]
 460f218: 910603fd     	add	x29, sp, #0x180
 460f21c: f9401413     	ldr	x19, [x0, #0x28]
 460f220: f900141f     	str	xzr, [x0, #0x28]
 460f224: b40006f3     	cbz	x19, 0x460f300 <_ChromeMain+0x460a064>
 460f228: f9401814     	ldr	x20, [x0, #0x30]
 460f22c: 19404268     	ldapurb	w8, [x19, #0x4]
 460f230: 7100011f     	cmp	w8, #0x0
 460f234: fa400a84     	ccmp	x20, #0x0, #0x4, eq
 460f238: 540005c0     	b.eq	0x460f2f0 <_ChromeMain+0x460a054>
 460f23c: 19404268     	ldapurb	w8, [x19, #0x4]
 460f240: 35001108     	cbnz	w8, 0x460f460 <_ChromeMain+0x460a1c4>
 460f244: 39544288     	ldrb	w8, [x20, #0x510]
 460f248: 34000548     	cbz	w8, 0x460f2f0 <_ChromeMain+0x460a054>
 460f24c: 19404268     	ldapurb	w8, [x19, #0x4]
 460f250: 35001148     	cbnz	w8, 0x460f478 <_ChromeMain+0x460a1dc>
 460f254: f940ce88     	ldr	x8, [x20, #0x198]
 460f258: d37df109     	lsl	x9, x8, #3
 460f25c: b40000c9     	cbz	x9, 0x460f274 <_ChromeMain+0x4609fd8>
 460f260: 910243f8     	add	x24, sp, #0x90
 460f264: f940ca99     	ldr	x25, [x20, #0x190]
 460f268: 8b080f3a     	add	x26, x25, x8, lsl #3
 460f26c: 0f03f608     	fmov.2s	v8, #1.00000000
 460f270: 14000039     	b	0x460f354 <_ChromeMain+0x460a0b8>
 460f274: 19404268     	ldapurb	w8, [x19, #0x4]
 460f278: 35001068     	cbnz	w8, 0x460f484 <_ChromeMain+0x460a1e8>
 460f27c: aa1403e0     	mov	x0, x20
 460f280: 97ffe851     	bl	0x46093c4 <_ChromeMain+0x4604128>
 460f284: 19404268     	ldapurb	w8, [x19, #0x4]
 460f288: 35001048     	cbnz	w8, 0x460f490 <_ChromeMain+0x460a1f4>
 460f28c: f942a288     	ldr	x8, [x20, #0x540]
 460f290: b4000288     	cbz	x8, 0x460f2e0 <_ChromeMain+0x460a044>
 460f294: 19404268     	ldapurb	w8, [x19, #0x4]
 460f298: 35001088     	cbnz	w8, 0x460f4a8 <_ChromeMain+0x460a20c>
 460f29c: f942a295     	ldr	x21, [x20, #0x540]
 460f2a0: b40010b5     	cbz	x21, 0x460f4b4 <_ChromeMain+0x460a218>
 460f2a4: 52800028     	mov	w8, #0x1                ; =1
 460f2a8: b82802a8     	ldadd	w8, w8, [x21]
 460f2ac: 7100011f     	cmp	w8, #0x0
 460f2b0: 5400108d     	b.le	0x460f4c0 <_ChromeMain+0x460a224>
 460f2b4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460f2b8: 6b09011f     	cmp	w8, w9
 460f2bc: 54001080     	b.eq	0x460f4cc <_ChromeMain+0x460a230>
 460f2c0: f942a288     	ldr	x8, [x20, #0x540]
 460f2c4: f9400508     	ldr	x8, [x8, #0x8]
 460f2c8: aa1503e0     	mov	x0, x21
 460f2cc: d63f0100     	blr	x8
 460f2d0: 12800008     	mov	w8, #-0x1               ; =-1
 460f2d4: b8e802a8     	ldaddal	w8, w8, [x21]
 460f2d8: 7100051f     	cmp	w8, #0x1
 460f2dc: 54000ba0     	b.eq	0x460f450 <_ChromeMain+0x460a1b4>
 460f2e0: 19404268     	ldapurb	w8, [x19, #0x4]
 460f2e4: 35000dc8     	cbnz	w8, 0x460f49c <_ChromeMain+0x460a200>
 460f2e8: aa1403e0     	mov	x0, x20
 460f2ec: 96fe47a4     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460f2f0: 12800008     	mov	w8, #-0x1               ; =-1
 460f2f4: b8e80268     	ldaddal	w8, w8, [x19]
 460f2f8: 7100051f     	cmp	w8, #0x1
 460f2fc: 54000140     	b.eq	0x460f324 <_ChromeMain+0x460a088>
 460f300: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 460f304: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 460f308: a95657f6     	ldp	x22, x21, [sp, #0x160]
 460f30c: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 460f310: a95467fa     	ldp	x26, x25, [sp, #0x140]
 460f314: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 460f318: 6d5223e9     	ldp	d9, d8, [sp, #0x120]
 460f31c: 910643ff     	add	sp, sp, #0x190
 460f320: d65f03c0     	ret
 460f324: aa1303e0     	mov	x0, x19
 460f328: 52800101     	mov	w1, #0x8                ; =8
 460f32c: 96e7e6e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460f330: 17fffff4     	b	0x460f300 <_ChromeMain+0x460a064>
 460f334: 1e2e1000     	fmov	s0, #1.00000000
 460f338: 97539600     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 460f33c: f940c6a0     	ldr	x0, [x21, #0x188]
 460f340: b4000040     	cbz	x0, 0x460f348 <_ChromeMain+0x460a0ac>
 460f344: 96fe478e     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460f348: 91002339     	add	x25, x25, #0x8
 460f34c: eb1a033f     	cmp	x25, x26
 460f350: 54fff920     	b.eq	0x460f274 <_ChromeMain+0x4609fd8>
 460f354: f9400335     	ldr	x21, [x25]
 460f358: b4ffff95     	cbz	x21, 0x460f348 <_ChromeMain+0x460a0ac>
 460f35c: f94002a8     	ldr	x8, [x21]
 460f360: f9402d08     	ldr	x8, [x8, #0x58]
 460f364: aa1503e0     	mov	x0, x21
 460f368: d63f0100     	blr	x8
 460f36c: aa0003f6     	mov	x22, x0
 460f370: 97ffd664     	bl	0x4604d00 <_ChromeMain+0x45ffa64>
 460f374: f10002df     	cmp	x22, #0x0
 460f378: 1a9f07e8     	cset	w8, ne
 460f37c: eb0002df     	cmp	x22, x0
 460f380: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 460f384: 540000c0     	b.eq	0x460f39c <_ChromeMain+0x460a100>
 460f388: f94026d6     	ldr	x22, [x22, #0x48]
 460f38c: f10002df     	cmp	x22, #0x0
 460f390: 1a9f07e8     	cset	w8, ne
 460f394: fa4012c4     	ccmp	x22, x0, #0x4, ne
 460f398: 54ffff81     	b.ne	0x460f388 <_ChromeMain+0x460a0ec>
 460f39c: 34fffd68     	cbz	w8, 0x460f348 <_ChromeMain+0x460a0ac>
 460f3a0: f9008bff     	str	xzr, [sp, #0x110]
 460f3a4: 6f00e400     	movi.2d	v0, #0000000000000000
 460f3a8: ad030300     	stp	q0, q0, [x24, #0x60]
 460f3ac: ad020300     	stp	q0, q0, [x24, #0x40]
 460f3b0: ad010300     	stp	q0, q0, [x24, #0x20]
 460f3b4: ad000300     	stp	q0, q0, [x24]
 460f3b8: fd004fe8     	str	d8, [sp, #0x98]
 460f3bc: 910023e8     	add	x8, sp, #0x8
 460f3c0: aa1503e0     	mov	x0, x21
 460f3c4: 97f781d7     	bl	0x43efb20 <_ChromeMain+0x43ea884>
 460f3c8: 910023e0     	add	x0, sp, #0x8
 460f3cc: 910243e1     	add	x1, sp, #0x90
 460f3d0: 971b8c24     	bl	0xcf2460 <_ChromeMain+0xced1c4>
 460f3d4: 37000080     	tbnz	w0, #0x0, 0x460f3e4 <_ChromeMain+0x460a148>
 460f3d8: 910243e1     	add	x1, sp, #0x90
 460f3dc: aa1503e0     	mov	x0, x21
 460f3e0: 95832b47     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
 460f3e4: f940c6a0     	ldr	x0, [x21, #0x188]
 460f3e8: b4000040     	cbz	x0, 0x460f3f0 <_ChromeMain+0x460a154>
 460f3ec: 96fe4764     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460f3f0: aa1503e0     	mov	x0, x21
 460f3f4: 96fe4762     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460f3f8: 394feea8     	ldrb	w8, [x21, #0x3fb]
 460f3fc: 34fffa68     	cbz	w8, 0x460f348 <_ChromeMain+0x460a0ac>
 460f400: 390feebf     	strb	wzr, [x21, #0x3fb]
 460f404: f94012b6     	ldr	x22, [x21, #0x20]
 460f408: b4fff9b6     	cbz	x22, 0x460f33c <_ChromeMain+0x460a0a0>
 460f40c: f940b2c0     	ldr	x0, [x22, #0x160]
 460f410: b5fff920     	cbnz	x0, 0x460f334 <_ChromeMain+0x460a098>
 460f414: 52802400     	mov	w0, #0x120              ; =288
 460f418: 96e7ffd4     	bl	0xf368 <_ChromeMain+0xa0cc>
 460f41c: aa0003f7     	mov	x23, x0
 460f420: d2800001     	mov	x1, #0x0                ; =0
 460f424: 9729abad     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 460f428: b40000a0     	cbz	x0, 0x460f43c <_ChromeMain+0x460a1a0>
 460f42c: b9400ae8     	ldr	w8, [x23, #0x8]
 460f430: 31000508     	adds	w8, w8, #0x1
 460f434: b9000ae8     	str	w8, [x23, #0x8]
 460f438: 540001a2     	b.hs	0x460f46c <_ChromeMain+0x460a1d0>
 460f43c: aa1603e0     	mov	x0, x22
 460f440: aa1703e1     	mov	x1, x23
 460f444: 9731b36e     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 460f448: f940b2c0     	ldr	x0, [x22, #0x160]
 460f44c: 17ffffba     	b	0x460f334 <_ChromeMain+0x460a098>
 460f450: f9400aa8     	ldr	x8, [x21, #0x10]
 460f454: aa1503e0     	mov	x0, x21
 460f458: d63f0100     	blr	x8
 460f45c: 17ffffa1     	b	0x460f2e0 <_ChromeMain+0x460a044>
 460f460: d4200000     	brk	#0
 460f464: d4400000     	hlt	#0
 460f468: d4200020     	brk	#0x1
 460f46c: d4200000     	brk	#0
 460f470: d4400000     	hlt	#0
 460f474: d4200020     	brk	#0x1
 460f478: d4200000     	brk	#0
 460f47c: d4400000     	hlt	#0
 460f480: d4200020     	brk	#0x1
 460f484: d4200000     	brk	#0
 460f488: d4400000     	hlt	#0
 460f48c: d4200020     	brk	#0x1
 460f490: d4200000     	brk	#0
 460f494: d4400000     	hlt	#0
 460f498: d4200020     	brk	#0x1
 460f49c: d4200000     	brk	#0
 460f4a0: d4400000     	hlt	#0
 460f4a4: d4200020     	brk	#0x1
 460f4a8: d4200000     	brk	#0
 460f4ac: d4400000     	hlt	#0
 460f4b0: d4200020     	brk	#0x1
 460f4b4: d4200000     	brk	#0
 460f4b8: d4400000     	hlt	#0
 460f4bc: d4200020     	brk	#0x1
 460f4c0: d4200000     	brk	#0
 460f4c4: d4400000     	hlt	#0
 460f4c8: d4200020     	brk	#0x1
 460f4cc: d4200000     	brk	#0
 460f4d0: d4400000     	hlt	#0
 460f4d4: d4200020     	brk	#0x1
