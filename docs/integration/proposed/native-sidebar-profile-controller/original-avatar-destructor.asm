
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2fdc570: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 2fdc574: a9017bfd     	stp	x29, x30, [sp, #0x10]
 2fdc578: 910043fd     	add	x29, sp, #0x10
 2fdc57c: aa0003f3     	mov	x19, x0
 2fdc580: f005b528     	adrp	x8, 0xe683000 <dyld_stub_binder+0xe683000>
 2fdc584: 911bc108     	add	x8, x8, #0x6f0
 2fdc588: 91174109     	add	x9, x8, #0x5d0
 2fdc58c: a9002408     	stp	x8, x9, [x0]
 2fdc590: 9117e109     	add	x9, x8, #0x5f8
 2fdc594: f9000809     	str	x9, [x0, #0x10]
 2fdc598: 9118c109     	add	x9, x8, #0x630
 2fdc59c: 9119810a     	add	x10, x8, #0x660
 2fdc5a0: a906a809     	stp	x9, x10, [x0, #0x68]
 2fdc5a4: 911ac109     	add	x9, x8, #0x6b0
 2fdc5a8: f9005809     	str	x9, [x0, #0xb0]
 2fdc5ac: 911c4109     	add	x9, x8, #0x710
 2fdc5b0: f9006c09     	str	x9, [x0, #0xd8]
 2fdc5b4: 911d0109     	add	x9, x8, #0x740
 2fdc5b8: f9007c09     	str	x9, [x0, #0xf8]
 2fdc5bc: 911da109     	add	x9, x8, #0x768
 2fdc5c0: f9018809     	str	x9, [x0, #0x310]
 2fdc5c4: 911fa109     	add	x9, x8, #0x7e8
 2fdc5c8: f9018c09     	str	x9, [x0, #0x318]
 2fdc5cc: 9122a109     	add	x9, x8, #0x8a8
 2fdc5d0: f9019009     	str	x9, [x0, #0x320]
 2fdc5d4: 91238109     	add	x9, x8, #0x8e0
 2fdc5d8: f9025809     	str	x9, [x0, #0x4b0]
 2fdc5dc: 9124c109     	add	x9, x8, #0x930
 2fdc5e0: f9025c09     	str	x9, [x0, #0x4b8]
 2fdc5e4: 91258109     	add	x9, x8, #0x960
 2fdc5e8: f9031409     	str	x9, [x0, #0x628]
 2fdc5ec: 91262108     	add	x8, x8, #0x988
 2fdc5f0: f903e808     	str	x8, [x0, #0x7d0]
 2fdc5f4: 52800034     	mov	w20, #0x1               ; =1
 2fdc5f8: 91202000     	add	x0, x0, #0x808
 2fdc5fc: 52800201     	mov	w1, #0x10               ; =16
 2fdc600: 52800022     	mov	w2, #0x1                ; =1
 2fdc604: 97d7545f     	bl	0x25b1780 <_ChromeMain+0x25ac4e4>
 2fdc608: 91202260     	add	x0, x19, #0x808
 2fdc60c: 94000043     	bl	0x2fdc718 <_ChromeMain+0x2fd747c>
 2fdc610: f904f67f     	str	xzr, [x19, #0x9e8]
 2fdc614: f944f268     	ldr	x8, [x19, #0x9e0]
 2fdc618: b4000148     	cbz	x8, 0x2fdc640 <_ChromeMain+0x2fd73a4>
 2fdc61c: 19004114     	stlurb	w20, [x8, #0x4]
 2fdc620: f944f260     	ldr	x0, [x19, #0x9e0]
 2fdc624: b40000e0     	cbz	x0, 0x2fdc640 <_ChromeMain+0x2fd73a4>
 2fdc628: 12800008     	mov	w8, #-0x1               ; =-1
 2fdc62c: b8e80008     	ldaddal	w8, w8, [x0]
 2fdc630: 7100051f     	cmp	w8, #0x1
 2fdc634: 54000061     	b.ne	0x2fdc640 <_ChromeMain+0x2fd73a4>
 2fdc638: 52800101     	mov	w1, #0x8                ; =8
 2fdc63c: 9740b21f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2fdc640: f944ee60     	ldr	x0, [x19, #0x9d8]
 2fdc644: b5000340     	cbnz	x0, 0x2fdc6ac <_ChromeMain+0x2fd7410>
 2fdc648: b0059828     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 2fdc64c: 91240108     	add	x8, x8, #0x900
 2fdc650: f904aa68     	str	x8, [x19, #0x950]
 2fdc654: f944ce60     	ldr	x0, [x19, #0x998]
 2fdc658: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2fdc65c: d005dea9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2fdc660: f9404529     	ldr	x9, [x9, #0x88]
 2fdc664: eb09011f     	cmp	x8, x9
 2fdc668: 54000041     	b.ne	0x2fdc670 <_ChromeMain+0x2fd73d4>
 2fdc66c: 974128f6     	bl	0x26a44 <_ChromeMain+0x217a8>
 2fdc670: f904ce7f     	str	xzr, [x19, #0x998]
 2fdc674: 91254260     	add	x0, x19, #0x950
 2fdc678: 977d9735     	bl	0xf4234c <_ChromeMain+0xf3d0b0>
 2fdc67c: f944a674     	ldr	x20, [x19, #0x948]
 2fdc680: b5000254     	cbnz	x20, 0x2fdc6c8 <_ChromeMain+0x2fd742c>
 2fdc684: 91248260     	add	x0, x19, #0x920
 2fdc688: 9761a86e     	bl	0x846840 <_ChromeMain+0x8415a4>
 2fdc68c: 9123e260     	add	x0, x19, #0x8f8
 2fdc690: 9761a86c     	bl	0x846840 <_ChromeMain+0x8415a4>
 2fdc694: 911f6260     	add	x0, x19, #0x7d8
 2fdc698: 97e37acc     	bl	0x28bb1c8 <_ChromeMain+0x28b5f2c>
 2fdc69c: aa1303e0     	mov	x0, x19
 2fdc6a0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 2fdc6a4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 2fdc6a8: 17d74a75     	b	0x25af07c <_ChromeMain+0x25a9de0>
 2fdc6ac: 12800008     	mov	w8, #-0x1               ; =-1
 2fdc6b0: b8e80008     	ldaddal	w8, w8, [x0]
 2fdc6b4: 7100051f     	cmp	w8, #0x1
 2fdc6b8: 54fffc81     	b.ne	0x2fdc648 <_ChromeMain+0x2fd73ac>
 2fdc6bc: f9400808     	ldr	x8, [x0, #0x10]
 2fdc6c0: d63f0100     	blr	x8
 2fdc6c4: 17ffffe1     	b	0x2fdc648 <_ChromeMain+0x2fd73ac>
 2fdc6c8: f904a67f     	str	xzr, [x19, #0x948]
 2fdc6cc: f9400688     	ldr	x8, [x20, #0x8]
 2fdc6d0: aa1403e0     	mov	x0, x20
 2fdc6d4: d63f0100     	blr	x8
 2fdc6d8: 12800008     	mov	w8, #-0x1               ; =-1
 2fdc6dc: b8e80288     	ldaddal	w8, w8, [x20]
 2fdc6e0: 7100051f     	cmp	w8, #0x1
 2fdc6e4: 54000081     	b.ne	0x2fdc6f4 <_ChromeMain+0x2fd7458>
 2fdc6e8: f9400a88     	ldr	x8, [x20, #0x10]
 2fdc6ec: aa1403e0     	mov	x0, x20
 2fdc6f0: d63f0100     	blr	x8
 2fdc6f4: f944a660     	ldr	x0, [x19, #0x948]
 2fdc6f8: b4fffc60     	cbz	x0, 0x2fdc684 <_ChromeMain+0x2fd73e8>
 2fdc6fc: 12800008     	mov	w8, #-0x1               ; =-1
 2fdc700: b8e80008     	ldaddal	w8, w8, [x0]
 2fdc704: 7100051f     	cmp	w8, #0x1
 2fdc708: 54fffbe1     	b.ne	0x2fdc684 <_ChromeMain+0x2fd73e8>
 2fdc70c: f9400808     	ldr	x8, [x0, #0x10]
 2fdc710: d63f0100     	blr	x8
 2fdc714: 17ffffdc     	b	0x2fdc684 <_ChromeMain+0x2fd73e8>
