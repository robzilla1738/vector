
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3222210: aa0103f4     	mov	x20, x1
 3222214: aa0003f3     	mov	x19, x0
 3222218: b00584b6     	adrp	x22, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 322221c: 913c22d6     	add	x22, x22, #0xf08
 3222220: f9000016     	str	x22, [x0]
 3222224: 52800100     	mov	w0, #0x8                ; =8
 3222228: 9737b450     	bl	0xf368 <_ChromeMain+0xa0cc>
 322222c: b900001f     	str	wzr, [x0]
 3222230: 3900101f     	strb	wzr, [x0, #0x4]
 3222234: b40000c0     	cbz	x0, 0x322224c <_ChromeMain+0x321cfb0>
 3222238: 52800028     	mov	w8, #0x1                ; =1
 322223c: b8280008     	ldadd	w8, w8, [x0]
 3222240: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3222244: 6b09011f     	cmp	w8, w9
 3222248: 54001e40     	b.eq	0x3222610 <_ChromeMain+0x321d374>
 322224c: aa1303e8     	mov	x8, x19
 3222250: f8028d1f     	str	xzr, [x8, #0x28]!
 3222254: f9001268     	str	x8, [x19, #0x20]
 3222258: d0057fe8     	adrp	x8, 0xe220000 <dyld_stub_binder+0xe220000>
 322225c: 911f0108     	add	x8, x8, #0x7c0
 3222260: a9000268     	stp	x8, x0, [x19]
 3222264: 9101a109     	add	x9, x8, #0x68
 3222268: a9012673     	stp	x19, x9, [x19, #0x10]
 322226c: 91042108     	add	x8, x8, #0x108
 3222270: a903227f     	stp	xzr, x8, [x19, #0x30]
 3222274: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3222278: 9005cc97     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 322227c: f94046e9     	ldr	x9, [x23, #0x88]
 3222280: eb09011f     	cmp	x8, x9
 3222284: 54000061     	b.ne	0x3222290 <_ChromeMain+0x321cff4>
 3222288: aa1403e0     	mov	x0, x20
 322228c: 9737c81c     	bl	0x142fc <_ChromeMain+0xf060>
 3222290: f9002274     	str	x20, [x19, #0x40]
 3222294: 6f00e400     	movi.2d	v0, #0000000000000000
 3222298: 3c848260     	stur	q0, [x19, #0x48]
 322229c: 3c858260     	stur	q0, [x19, #0x58]
 32222a0: 3c868260     	stur	q0, [x19, #0x68]
 32222a4: 925e7668     	and	x8, x19, #0xfffffffc00000000
 32222a8: f94046e9     	ldr	x9, [x23, #0x88]
 32222ac: eb09011f     	cmp	x8, x9
 32222b0: 54000061     	b.ne	0x32222bc <_ChromeMain+0x321d020>
 32222b4: aa1303e0     	mov	x0, x19
 32222b8: 9737c811     	bl	0x142fc <_ChromeMain+0xf060>
 32222bc: f9003e73     	str	x19, [x19, #0x78]
 32222c0: aa1303f8     	mov	x24, x19
 32222c4: f8080f1f     	str	xzr, [x24, #0x80]!
 32222c8: aa1303f4     	mov	x20, x19
 32222cc: f8088e9f     	str	xzr, [x20, #0x88]!
 32222d0: aa1303f5     	mov	x21, x19
 32222d4: f8090eb6     	str	x22, [x21, #0x90]!
 32222d8: 52800100     	mov	w0, #0x8                ; =8
 32222dc: 9737b423     	bl	0xf368 <_ChromeMain+0xa0cc>
 32222e0: b900001f     	str	wzr, [x0]
 32222e4: 3900101f     	strb	wzr, [x0, #0x4]
 32222e8: b40000c0     	cbz	x0, 0x3222300 <_ChromeMain+0x321d064>
 32222ec: 52800028     	mov	w8, #0x1                ; =1
 32222f0: b8280008     	ldadd	w8, w8, [x0]
 32222f4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 32222f8: 6b09011f     	cmp	w8, w9
 32222fc: 54001900     	b.eq	0x322261c <_ChromeMain+0x321d380>
 3222300: b0058628     	adrp	x8, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 3222304: 91124108     	add	x8, x8, #0x490
 3222308: a9090268     	stp	x8, x0, [x19, #0x90]
 322230c: a90a7e75     	stp	x21, xzr, [x19, #0xa0]
 3222310: f9005e7f     	str	xzr, [x19, #0xb8]
 3222314: 3903027f     	strb	wzr, [x19, #0xc0]
 3222318: 52800100     	mov	w0, #0x8                ; =8
 322231c: 9737b413     	bl	0xf368 <_ChromeMain+0xa0cc>
 3222320: b900001f     	str	wzr, [x0]
 3222324: 3900101f     	strb	wzr, [x0, #0x4]
 3222328: b40000c0     	cbz	x0, 0x3222340 <_ChromeMain+0x321d0a4>
 322232c: 52800028     	mov	w8, #0x1                ; =1
 3222330: b8280008     	ldadd	w8, w8, [x0]
 3222334: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 3222338: 6b09011f     	cmp	w8, w9
 322233c: 54001760     	b.eq	0x3222628 <_ChromeMain+0x321d38c>
 3222340: a90cce60     	stp	x0, x19, [x19, #0xc8]
 3222344: f9402260     	ldr	x0, [x19, #0x40]
 3222348: f9400008     	ldr	x8, [x0]
 322234c: f940b508     	ldr	x8, [x8, #0x168]
 3222350: d63f0100     	blr	x8
 3222354: aa0003f6     	mov	x22, x0
 3222358: 925e7408     	and	x8, x0, #0xfffffffc00000000
 322235c: f94046e9     	ldr	x9, [x23, #0x88]
 3222360: eb09011f     	cmp	x8, x9
 3222364: 54000061     	b.ne	0x3222370 <_ChromeMain+0x321d0d4>
 3222368: aa1603e0     	mov	x0, x22
 322236c: 9737c7e4     	bl	0x142fc <_ChromeMain+0xf060>
 3222370: f9405e60     	ldr	x0, [x19, #0xb8]
 3222374: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3222378: f94046e9     	ldr	x9, [x23, #0x88]
 322237c: eb09011f     	cmp	x8, x9
 3222380: 54001300     	b.eq	0x32225e0 <_ChromeMain+0x321d344>
 3222384: f9005e76     	str	x22, [x19, #0xb8]
 3222388: f9406679     	ldr	x25, [x19, #0xc8]
 322238c: b40000d9     	cbz	x25, 0x32223a4 <_ChromeMain+0x321d108>
 3222390: 52800028     	mov	w8, #0x1                ; =1
 3222394: b8280328     	ldadd	w8, w8, [x25]
 3222398: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 322239c: 6b09011f     	cmp	w8, w9
 32223a0: 540012c0     	b.eq	0x32225f8 <_ChromeMain+0x321d35c>
 32223a4: f9406a7b     	ldr	x27, [x19, #0xd0]
 32223a8: 52800800     	mov	w0, #0x40               ; =64
 32223ac: 9737b3ef     	bl	0xf368 <_ChromeMain+0xa0cc>
 32223b0: 5280003a     	mov	w26, #0x1               ; =1
 32223b4: 90006a68     	adrp	x8, 0x3f6e000 <_ChromeMain+0x3f68d64>
 32223b8: 91230108     	add	x8, x8, #0x8c0
 32223bc: d0006a49     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 32223c0: 912b0129     	add	x9, x9, #0xac0
 32223c4: b900001a     	str	w26, [x0]
 32223c8: 9000746a     	adrp	x10, 0x40ae000 <_ChromeMain+0x40a8d64>
 32223cc: 911b014a     	add	x10, x10, #0x6c0
 32223d0: f0007d8b     	adrp	x11, 0x41d5000 <_ChromeMain+0x41cfd64>
 32223d4: 9139b16b     	add	x11, x11, #0xe6c
 32223d8: a900a408     	stp	x8, x9, [x0, #0x8]
 32223dc: a901ac0a     	stp	x10, x11, [x0, #0x18]
 32223e0: a902e41f     	stp	xzr, x25, [x0, #0x28]
 32223e4: f9001c1b     	str	x27, [x0, #0x38]
 32223e8: b4001000     	cbz	x0, 0x32225e8 <_ChromeMain+0x321d34c>
 32223ec: aa0003f6     	mov	x22, x0
 32223f0: 52800600     	mov	w0, #0x30               ; =48
 32223f4: 9737b3dd     	bl	0xf368 <_ChromeMain+0xa0cc>
 32223f8: aa0003e3     	mov	x3, x0
 32223fc: b900001a     	str	w26, [x0]
 3222400: d0ff9708     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 3222404: 91117108     	add	x8, x8, #0x45c
 3222408: d00033a9     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 322240c: 91070129     	add	x9, x9, #0x1c0
 3222410: a900a408     	stp	x8, x9, [x0, #0x8]
 3222414: f0ff99c8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 3222418: 912c0108     	add	x8, x8, #0xb00
 322241c: f9000c08     	str	x8, [x0, #0x18]
 3222420: f9001416     	str	x22, [x0, #0x28]
 3222424: d004e5c1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 3222428: 911ad021     	add	x1, x1, #0x6b4
 322242c: aa1503e0     	mov	x0, x21
 3222430: 52800162     	mov	w2, #0xb                ; =11
 3222434: 977b21ff     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 3222438: f9406675     	ldr	x21, [x19, #0xc8]
 322243c: b40000d5     	cbz	x21, 0x3222454 <_ChromeMain+0x321d1b8>
 3222440: 52800028     	mov	w8, #0x1                ; =1
 3222444: b82802a8     	ldadd	w8, w8, [x21]
 3222448: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 322244c: 6b09011f     	cmp	w8, w9
 3222450: 54000da0     	b.eq	0x3222604 <_ChromeMain+0x321d368>
 3222454: f9406a76     	ldr	x22, [x19, #0xd0]
 3222458: 52800800     	mov	w0, #0x40               ; =64
 322245c: 9737b3c3     	bl	0xf368 <_ChromeMain+0xa0cc>
 3222460: 52800028     	mov	w8, #0x1                ; =1
 3222464: b9000008     	str	w8, [x0]
 3222468: 90006be8     	adrp	x8, 0x3f9e000 <_ChromeMain+0x3f98d64>
 322246c: 911a0108     	add	x8, x8, #0x680
 3222470: d0006a49     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 3222474: 912b0129     	add	x9, x9, #0xac0
 3222478: a900a408     	stp	x8, x9, [x0, #0x8]
 322247c: 90007468     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 3222480: 911b0108     	add	x8, x8, #0x6c0
 3222484: f0007d89     	adrp	x9, 0x41d5000 <_ChromeMain+0x41cfd64>
 3222488: 913de129     	add	x9, x9, #0xf78
 322248c: a901a408     	stp	x8, x9, [x0, #0x18]
 3222490: a902d41f     	stp	xzr, x21, [x0, #0x28]
 3222494: f9001c16     	str	x22, [x0, #0x38]
 3222498: f90007e0     	str	x0, [sp, #0x8]
 322249c: 910043e8     	add	x8, sp, #0x10
 32224a0: 910023e0     	add	x0, sp, #0x8
 32224a4: 9522f685     	bl	0x7adfeb8 <_ChromeMain+0x7adac1c>
 32224a8: 910043e1     	add	x1, sp, #0x10
 32224ac: aa1403e0     	mov	x0, x20
 32224b0: 97589188     	bl	0x846ad0 <_ChromeMain+0x841834>
 32224b4: f9400bf4     	ldr	x20, [sp, #0x10]
 32224b8: b50006d4     	cbnz	x20, 0x3222590 <_ChromeMain+0x321d2f4>
 32224bc: f94007e0     	ldr	x0, [sp, #0x8]
 32224c0: b50005a0     	cbnz	x0, 0x3222574 <_ChromeMain+0x321d2d8>
 32224c4: f90003f3     	str	x19, [sp]
 32224c8: 910003e8     	mov	x8, sp
 32224cc: 90025889     	adrp	x9, 0x7d32000 <_ChromeMain+0x7d2cd64>
 32224d0: 9121e129     	add	x9, x9, #0x878
 32224d4: a90127e8     	stp	x8, x9, [sp, #0x10]
 32224d8: 9005e634     	adrp	x20, 0xeee6000 <dyld_stub_binder+0xeee6000>
 32224dc: f9467e88     	ldr	x8, [x20, #0xcf8]
 32224e0: f9414908     	ldr	x8, [x8, #0x290]
 32224e4: f9400500     	ldr	x0, [x8, #0x8]
 32224e8: 910043e8     	add	x8, sp, #0x10
 32224ec: f90007e8     	str	x8, [sp, #0x8]
 32224f0: d0ff55e2     	adrp	x2, 0x1ce0000 <_ChromeMain+0x1cdad64>
 32224f4: 911e1042     	add	x2, x2, #0x784
 32224f8: 910023e1     	add	x1, sp, #0x8
 32224fc: 52800023     	mov	w3, #0x1                ; =1
 3222500: 52800004     	mov	w4, #0x0                ; =0
 3222504: 976e3cdb     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 3222508: f9467e88     	ldr	x8, [x20, #0xcf8]
 322250c: f9414908     	ldr	x8, [x8, #0x290]
 3222510: f9400514     	ldr	x20, [x8, #0x8]
 3222514: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3222518: f94046e9     	ldr	x9, [x23, #0x88]
 322251c: eb09011f     	cmp	x8, x9
 3222520: 54000061     	b.ne	0x322252c <_ChromeMain+0x321d290>
 3222524: aa1403e0     	mov	x0, x20
 3222528: 9737c775     	bl	0x142fc <_ChromeMain+0xf060>
 322252c: f9400300     	ldr	x0, [x24]
 3222530: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3222534: f94046e9     	ldr	x9, [x23, #0x88]
 3222538: eb09011f     	cmp	x8, x9
 322253c: 540005a0     	b.eq	0x32225f0 <_ChromeMain+0x321d354>
 3222540: f9004274     	str	x20, [x19, #0x80]
 3222544: f9403e61     	ldr	x1, [x19, #0x78]
 3222548: 91002280     	add	x0, x20, #0x8
 322254c: 9745e515     	bl	0x39b9a0 <_ChromeMain+0x396704>
 3222550: aa1303e0     	mov	x0, x19
 3222554: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 3222558: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 322255c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 3222560: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 3222564: a94367fa     	ldp	x26, x25, [sp, #0x30]
 3222568: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 322256c: 910203ff     	add	sp, sp, #0x80
 3222570: d65f03c0     	ret
