
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
