
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45734f0: b00515c3     	adrp	x3, 0xe82c000 <dyld_stub_binder+0xe82c000>
 45734f4: 91008063     	add	x3, x3, #0x20
 45734f8: 9106c3e2     	add	x2, sp, #0x1b0
 45734fc: 910543e5     	add	x5, sp, #0x150
 4573500: aa1303e0     	mov	x0, x19
 4573504: aa1403e1     	mov	x1, x20
 4573508: 52800026     	mov	w6, #0x1                ; =1
 457350c: 9400163d     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 4573510: 39c59fe8     	ldrsb	w8, [sp, #0x167]
 4573514: 36f800a8     	tbz	w8, #0x1f, 0x4573528 <_ChromeMain+0x456e28c>
 4573518: f940abe0     	ldr	x0, [sp, #0x150]
 457351c: f940b3e8     	ldr	x8, [sp, #0x160]
 4573520: d37ff901     	lsl	x1, x8, #1
 4573524: 96ea5665     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573528: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 457352c: 36f800a8     	tbz	w8, #0x1f, 0x4573540 <_ChromeMain+0x456e2a4>
 4573530: f940dbe0     	ldr	x0, [sp, #0x1b0]
 4573534: f940e3e8     	ldr	x8, [sp, #0x1c0]
 4573538: d37ff901     	lsl	x1, x8, #1
 457353c: 96ea565f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573540: aa1403e0     	mov	x0, x20
 4573544: 9400165c     	bl	0x4578eb4 <_ChromeMain+0x4573c18>
 4573548: 52800128     	mov	w8, #0x9                ; =9
 457354c: 381273a8     	sturb	w8, [x29, #-0xd9]
 4573550: d103c3a9     	sub	x9, x29, #0xf0
 4573554: 9100492a     	add	x10, x9, #0x12
 4573558: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457355c: 91029108     	add	x8, x8, #0xa4
 4573560: eb08015f     	cmp	x10, x8
 4573564: fa488122     	ccmp	x9, x8, #0x2, hi
 4573568: 54002a69     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457356c: 52800e69     	mov	w9, #0x73               ; =115
 4573570: b81203a9     	stur	w9, [x29, #-0xe0]
 4573574: 3dc00100     	ldr	q0, [x8]
 4573578: 3c9103a0     	stur	q0, [x29, #-0xf0]
 457357c: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 4573580: 91354063     	add	x3, x3, #0xd50
 4573584: d103c3a2     	sub	x2, x29, #0xf0
 4573588: aa1303e0     	mov	x0, x19
 457358c: aa1403e1     	mov	x1, x20
 4573590: 52800024     	mov	w4, #0x1                ; =1
 4573594: 940016aa     	bl	0x457903c <_ChromeMain+0x4573da0>
 4573598: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 457359c: 36f800a8     	tbz	w8, #0x1f, 0x45735b0 <_ChromeMain+0x456e314>
 45735a0: f85103a0     	ldur	x0, [x29, #-0xf0]
 45735a4: f85203a8     	ldur	x8, [x29, #-0xe0]
 45735a8: d37ff901     	lsl	x1, x8, #1
 45735ac: 96ea5643     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45735b0: 52800128     	mov	w8, #0x9                ; =9
 45735b4: 381873a8     	sturb	w8, [x29, #-0x79]
 45735b8: d10243a9     	sub	x9, x29, #0x90
 45735bc: 9100492a     	add	x10, x9, #0x12
 45735c0: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 45735c4: 9102e108     	add	x8, x8, #0xb8
 45735c8: eb08015f     	cmp	x10, x8
 45735cc: fa488122     	ccmp	x9, x8, #0x2, hi
 45735d0: 54002729     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 45735d4: 52800e69     	mov	w9, #0x73               ; =115
 45735d8: b81803a9     	stur	w9, [x29, #-0x80]
 45735dc: 3dc00100     	ldr	q0, [x8]
 45735e0: 3c9703a0     	stur	q0, [x29, #-0x90]
 45735e4: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 45735e8: 9139a063     	add	x3, x3, #0xe68
 45735ec: d10243a2     	sub	x2, x29, #0x90
 45735f0: aa1303e0     	mov	x0, x19
 45735f4: aa1403e1     	mov	x1, x20
 45735f8: 52800044     	mov	w4, #0x2                ; =2
 45735fc: 94001690     	bl	0x457903c <_ChromeMain+0x4573da0>
 4573600: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4573604: 36f800a8     	tbz	w8, #0x1f, 0x4573618 <_ChromeMain+0x456e37c>
 4573608: f85703a0     	ldur	x0, [x29, #-0x90]
 457360c: f85803a8     	ldur	x8, [x29, #-0x80]
 4573610: d37ff901     	lsl	x1, x8, #1
 4573614: 96ea5629     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573618: 52800148     	mov	w8, #0xa                ; =10
 457361c: 381673a8     	sturb	w8, [x29, #-0x99]
 4573620: d102c3a9     	sub	x9, x29, #0xb0
 4573624: 9100512a     	add	x10, x9, #0x14
 4573628: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457362c: 91004108     	add	x8, x8, #0x10
 4573630: eb08015f     	cmp	x10, x8
 4573634: fa488122     	ccmp	x9, x8, #0x2, hi
 4573638: 540023e9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457363c: 52800dc9     	mov	w9, #0x6e               ; =110
 4573640: 72a00e69     	movk	w9, #0x73, lsl #16
 4573644: b81603a9     	stur	w9, [x29, #-0xa0]
 4573648: 3dc00100     	ldr	q0, [x8]
 457364c: 3c9503a0     	stur	q0, [x29, #-0xb0]
 4573650: 781643bf     	sturh	wzr, [x29, #-0x9c]
 4573654: b0052303     	adrp	x3, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4573658: 913e2063     	add	x3, x3, #0xf88
 457365c: d102c3a2     	sub	x2, x29, #0xb0
 4573660: aa1303e0     	mov	x0, x19
 4573664: aa1403e1     	mov	x1, x20
 4573668: 52800064     	mov	w4, #0x3                ; =3
 457366c: 94001674     	bl	0x457903c <_ChromeMain+0x4573da0>
 4573670: 38d673a8     	ldursb	w8, [x29, #-0x99]
 4573674: 36f800a8     	tbz	w8, #0x1f, 0x4573688 <_ChromeMain+0x456e3ec>
 4573678: f85503a0     	ldur	x0, [x29, #-0xb0]
 457367c: f85603a8     	ldur	x8, [x29, #-0xa0]
 4573680: d37ff901     	lsl	x1, x8, #1
 4573684: 96ea560d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573688: 528000e8     	mov	w8, #0x7                ; =7
 457368c: 3814f3a8     	sturb	w8, [x29, #-0xb1]
 4573690: d10323a9     	sub	x9, x29, #0xc8
 4573694: 9100392a     	add	x10, x9, #0xe
 4573698: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457369c: 91033108     	add	x8, x8, #0xcc
 45736a0: eb08015f     	cmp	x10, x8
 45736a4: fa488122     	ccmp	x9, x8, #0x2, hi
 45736a8: 54002069     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 45736ac: f9400109     	ldr	x9, [x8]
 45736b0: f81383a9     	stur	x9, [x29, #-0xc8]
 45736b4: f8406108     	ldur	x8, [x8, #0x6]
 45736b8: f813e3a8     	stur	x8, [x29, #-0xc2]
 45736bc: 781463bf     	sturh	wzr, [x29, #-0xba]
 45736c0: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 45736c4: 913ae063     	add	x3, x3, #0xeb8
 45736c8: d10323a2     	sub	x2, x29, #0xc8
 45736cc: aa1303e0     	mov	x0, x19
 45736d0: aa1403e1     	mov	x1, x20
 45736d4: 52800084     	mov	w4, #0x4                ; =4
 45736d8: 94001659     	bl	0x457903c <_ChromeMain+0x4573da0>
 45736dc: 38d4f3a8     	ldursb	w8, [x29, #-0xb1]
 45736e0: 36f800a8     	tbz	w8, #0x1f, 0x45736f4 <_ChromeMain+0x456e458>
 45736e4: f85383a0     	ldur	x0, [x29, #-0xc8]
 45736e8: f85483a8     	ldur	x8, [x29, #-0xb8]
 45736ec: d37ff901     	lsl	x1, x8, #1
 45736f0: 96ea55f2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45736f4: 52800148     	mov	w8, #0xa                ; =10
 45736f8: 39049fe8     	strb	w8, [sp, #0x127]
 45736fc: 910443e9     	add	x9, sp, #0x110
 4573700: 9100512a     	add	x10, x9, #0x14
 4573704: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573708: 91037108     	add	x8, x8, #0xdc
 457370c: eb08015f     	cmp	x10, x8
 4573710: fa488122     	ccmp	x9, x8, #0x2, hi
 4573714: 54001d09     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573718: 52800e49     	mov	w9, #0x72               ; =114
 457371c: 72a00e69     	movk	w9, #0x73, lsl #16
 4573720: b90123e9     	str	w9, [sp, #0x120]
 4573724: 3dc00100     	ldr	q0, [x8]
 4573728: 3d8047e0     	str	q0, [sp, #0x110]
 457372c: 79024bff     	strh	wzr, [sp, #0x124]
 4573730: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 4573734: 91386063     	add	x3, x3, #0xe18
 4573738: 910443e2     	add	x2, sp, #0x110
 457373c: aa1303e0     	mov	x0, x19
 4573740: aa1403e1     	mov	x1, x20
 4573744: 528000a4     	mov	w4, #0x5                ; =5
 4573748: 9400163d     	bl	0x457903c <_ChromeMain+0x4573da0>
 457374c: 39c49fe8     	ldrsb	w8, [sp, #0x127]
 4573750: 36f800a8     	tbz	w8, #0x1f, 0x4573764 <_ChromeMain+0x456e4c8>
 4573754: f9408be0     	ldr	x0, [sp, #0x110]
 4573758: f94093e8     	ldr	x8, [sp, #0x120]
 457375c: d37ff901     	lsl	x1, x8, #1
 4573760: 96ea55d6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573764: 52800108     	mov	w8, #0x8                ; =8
 4573768: 39041fe8     	strb	w8, [sp, #0x107]
 457376c: 9103c3e9     	add	x9, sp, #0xf0
 4573770: 9100412a     	add	x10, x9, #0x10
 4573774: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573778: 9103c908     	add	x8, x8, #0xf2
 457377c: eb08015f     	cmp	x10, x8
 4573780: fa488122     	ccmp	x9, x8, #0x2, hi
 4573784: 54001989     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573788: 3dc00100     	ldr	q0, [x8]
 457378c: 3d803fe0     	str	q0, [sp, #0xf0]
 4573790: 790203ff     	strh	wzr, [sp, #0x100]
 4573794: f9418e68     	ldr	x8, [x19, #0x318]
 4573798: f940c519     	ldr	x25, [x8, #0x188]
 457379c: b40000d9     	cbz	x25, 0x45737b4 <_ChromeMain+0x456e518>
 45737a0: 52800029     	mov	w9, #0x1                ; =1
 45737a4: b8290329     	ldadd	w9, w9, [x25]
 45737a8: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45737ac: 6b0a013f     	cmp	w9, w10
 45737b0: 54005be0     	b.eq	0x457432c <_ChromeMain+0x456f090>
 45737b4: f940c91a     	ldr	x26, [x8, #0x190]
 45737b8: 52800900     	mov	w0, #0x48               ; =72
 45737bc: 96ea6eeb     	bl	0xf368 <_ChromeMain+0xa0cc>
 45737c0: 52800028     	mov	w8, #0x1                ; =1
 45737c4: f0ffcfd5     	adrp	x21, 0x3f6e000 <_ChromeMain+0x3f68d64>
 45737c8: 912502b5     	add	x21, x21, #0x940
 45737cc: b9000008     	str	w8, [x0]
 45737d0: b0ffcfd6     	adrp	x22, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45737d4: 912502d6     	add	x22, x22, #0x940
 45737d8: f0ffd9d7     	adrp	x23, 0x40ae000 <_ChromeMain+0x40a8d64>
 45737dc: 911b02f7     	add	x23, x23, #0x6c0
 45737e0: a900d815     	stp	x21, x22, [x0, #0x8]
 45737e4: 10feb8b8     	adr	x24, 0x4570ef8 <_ChromeMain+0x456bc5c>
 45737e8: d503201f     	nop
 45737ec: a902e41f     	stp	xzr, x25, [x0, #0x28]
 45737f0: f9001c1a     	str	x26, [x0, #0x38]
 45737f4: 529389e8     	mov	w8, #0x9c4f             ; =40015
 45737f8: b9004008     	str	w8, [x0, #0x40]
 45737fc: 910363e8     	add	x8, sp, #0xd8
 4573800: b27e0109     	orr	x9, x8, #0x4
 4573804: 9004d0aa     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573808: 9105594a     	add	x10, x10, #0x156
 457380c: a901e017     	stp	x23, x24, [x0, #0x18]
 4573810: eb0a013f     	cmp	x9, x10
 4573814: 52800049     	mov	w9, #0x2                ; =2
 4573818: fa4a8102     	ccmp	x8, x10, #0x2, hi
 457381c: 3903bfe9     	strb	w9, [sp, #0xef]
 4573820: 540014a9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573824: aa0003e4     	mov	x4, x0
 4573828: 52846319     	mov	w25, #0x2318            ; =8984
 457382c: 72a00599     	movk	w25, #0x2c, lsl #16
 4573830: b900dbf9     	str	w25, [sp, #0xd8]
 4573834: 7901bbff     	strh	wzr, [sp, #0xdc]
 4573838: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 457383c: 913ea063     	add	x3, x3, #0xfa8
 4573840: 9103c3e2     	add	x2, sp, #0xf0
 4573844: 910363e5     	add	x5, sp, #0xd8
 4573848: aa1303e0     	mov	x0, x19
 457384c: aa1403e1     	mov	x1, x20
 4573850: 52800026     	mov	w6, #0x1                ; =1
 4573854: 9400156b     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 4573858: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 457385c: 36f800a8     	tbz	w8, #0x1f, 0x4573870 <_ChromeMain+0x456e5d4>
 4573860: f9406fe0     	ldr	x0, [sp, #0xd8]
 4573864: f94077e8     	ldr	x8, [sp, #0xe8]
 4573868: d37ff901     	lsl	x1, x8, #1
 457386c: 96ea5593     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573870: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4573874: 36f800a8     	tbz	w8, #0x1f, 0x4573888 <_ChromeMain+0x456e5ec>
 4573878: f9407be0     	ldr	x0, [sp, #0xf0]
 457387c: f94083e8     	ldr	x8, [sp, #0x100]
 4573880: d37ff901     	lsl	x1, x8, #1
 4573884: 96ea558d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573888: aa1403e0     	mov	x0, x20
 457388c: 9400158a     	bl	0x4578eb4 <_ChromeMain+0x4573c18>
 4573890: 528000e8     	mov	w8, #0x7                ; =7
 4573894: 39035fe8     	strb	w8, [sp, #0xd7]
 4573898: 910303e9     	add	x9, sp, #0xc0
 457389c: 9100392a     	add	x10, x9, #0xe
 45738a0: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 45738a4: 91041108     	add	x8, x8, #0x104
 45738a8: eb08015f     	cmp	x10, x8
 45738ac: fa488122     	ccmp	x9, x8, #0x2, hi
 45738b0: 54001029     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 45738b4: f9400109     	ldr	x9, [x8]
 45738b8: f90063e9     	str	x9, [sp, #0xc0]
 45738bc: f8406108     	ldur	x8, [x8, #0x6]
 45738c0: f80c63e8     	stur	x8, [sp, #0xc6]
 45738c4: 79019fff     	strh	wzr, [sp, #0xce]
 45738c8: f9418e68     	ldr	x8, [x19, #0x318]
 45738cc: f940c51a     	ldr	x26, [x8, #0x188]
 45738d0: b40000da     	cbz	x26, 0x45738e8 <_ChromeMain+0x456e64c>
 45738d4: 52800029     	mov	w9, #0x1                ; =1
 45738d8: b8290349     	ldadd	w9, w9, [x26]
 45738dc: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45738e0: 6b0a013f     	cmp	w9, w10
 45738e4: 540052a0     	b.eq	0x4574338 <_ChromeMain+0x456f09c>
 45738e8: f940c91b     	ldr	x27, [x8, #0x190]
 45738ec: 52800900     	mov	w0, #0x48               ; =72
 45738f0: 96ea6e9e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45738f4: 52800028     	mov	w8, #0x1                ; =1
 45738f8: b9000008     	str	w8, [x0]
 45738fc: a900d815     	stp	x21, x22, [x0, #0x8]
 4573900: a902e81f     	stp	xzr, x26, [x0, #0x28]
 4573904: f9001c1b     	str	x27, [x0, #0x38]
 4573908: 52909bc8     	mov	w8, #0x84de             ; =34014
 457390c: b9004008     	str	w8, [x0, #0x40]
 4573910: 9102a3e8     	add	x8, sp, #0xa8
 4573914: b27e0109     	orr	x9, x8, #0x4
 4573918: 9004d0aa     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457391c: 9105714a     	add	x10, x10, #0x15c
 4573920: a901e017     	stp	x23, x24, [x0, #0x18]
 4573924: eb0a013f     	cmp	x9, x10
 4573928: 52800049     	mov	w9, #0x2                ; =2
 457392c: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4573930: 3902ffe9     	strb	w9, [sp, #0xbf]
 4573934: 54000c09     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573938: aa0003e4     	mov	x4, x0
 457393c: 114a0328     	add	w8, w25, #0x280, lsl #12 ; =0x280000
 4573940: b900abe8     	str	w8, [sp, #0xa8]
 4573944: 79015bff     	strh	wzr, [sp, #0xac]
 4573948: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 457394c: 91340063     	add	x3, x3, #0xd00
 4573950: 910303e2     	add	x2, sp, #0xc0
 4573954: 9102a3e5     	add	x5, sp, #0xa8
 4573958: aa1303e0     	mov	x0, x19
 457395c: aa1403e1     	mov	x1, x20
 4573960: 52800026     	mov	w6, #0x1                ; =1
 4573964: 94001527     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 4573968: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 457396c: 36f800a8     	tbz	w8, #0x1f, 0x4573980 <_ChromeMain+0x456e6e4>
 4573970: f94057e0     	ldr	x0, [sp, #0xa8]
 4573974: f9405fe8     	ldr	x8, [sp, #0xb8]
 4573978: d37ff901     	lsl	x1, x8, #1
 457397c: 96ea554f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573980: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4573984: 36f800a8     	tbz	w8, #0x1f, 0x4573998 <_ChromeMain+0x456e6fc>
 4573988: f94063e0     	ldr	x0, [sp, #0xc0]
 457398c: f9406be8     	ldr	x8, [sp, #0xd0]
 4573990: d37ff901     	lsl	x1, x8, #1
 4573994: 96ea5549     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573998: 52800600     	mov	w0, #0x30               ; =48
 457399c: 96ea6e73     	bl	0xf368 <_ChromeMain+0xa0cc>
 45739a0: f9004be0     	str	x0, [sp, #0x90]
 45739a4: b004ce68     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 45739a8: 3dc00900     	ldr	q0, [x8, #0x20]
 45739ac: 3c8983e0     	stur	q0, [sp, #0x98]
 45739b0: 91008009     	add	x9, x0, #0x20
 45739b4: eb00013f     	cmp	x9, x0
 45739b8: 540007e3     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 45739bc: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 45739c0: 91045108     	add	x8, x8, #0x114
 45739c4: eb08013f     	cmp	x9, x8
 45739c8: fa488002     	ccmp	x0, x8, #0x2, hi
 45739cc: 54000749     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 45739d0: ad400500     	ldp	q0, q1, [x8]
 45739d4: ad000400     	stp	q0, q1, [x0]
 45739d8: 7900401f     	strh	wzr, [x0, #0x20]
 45739dc: f9418e68     	ldr	x8, [x19, #0x318]
 45739e0: f940c519     	ldr	x25, [x8, #0x188]
 45739e4: b40000d9     	cbz	x25, 0x45739fc <_ChromeMain+0x456e760>
 45739e8: 52800029     	mov	w9, #0x1                ; =1
 45739ec: b8290329     	ldadd	w9, w9, [x25]
 45739f0: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45739f4: 6b0a013f     	cmp	w9, w10
 45739f8: 54004a60     	b.eq	0x4574344 <_ChromeMain+0x456f0a8>
 45739fc: f940c91a     	ldr	x26, [x8, #0x190]
 4573a00: 52800900     	mov	w0, #0x48               ; =72
 4573a04: 96ea6e59     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573a08: 52800028     	mov	w8, #0x1                ; =1
 4573a0c: b9000008     	str	w8, [x0]
 4573a10: a900d815     	stp	x21, x22, [x0, #0x8]
 4573a14: a901e017     	stp	x23, x24, [x0, #0x18]
 4573a18: 52909a28     	mov	w8, #0x84d1             ; =34001
 4573a1c: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4573a20: 52800069     	mov	w9, #0x3                ; =3
 4573a24: 9101e3ea     	add	x10, sp, #0x78
 4573a28: b27f054b     	orr	x11, x10, #0x6
 4573a2c: f9001c1a     	str	x26, [x0, #0x38]
 4573a30: b9004008     	str	w8, [x0, #0x40]
 4573a34: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573a38: 91058908     	add	x8, x8, #0x162
 4573a3c: eb08017f     	cmp	x11, x8
 4573a40: fa488142     	ccmp	x10, x8, #0x2, hi
 4573a44: 39023fe9     	strb	w9, [sp, #0x8f]
 4573a48: 54000369     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573a4c: aa0003e4     	mov	x4, x0
 4573a50: d2843ce8     	mov	x8, #0x21e7             ; =8679
 4573a54: f2a46308     	movk	x8, #0x2318, lsl #16
 4573a58: f2c009c8     	movk	x8, #0x4e, lsl #32
 4573a5c: f9003fe8     	str	x8, [sp, #0x78]
 4573a60: 900515c3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 4573a64: 913c2063     	add	x3, x3, #0xf08
 4573a68: 910243e2     	add	x2, sp, #0x90
 4573a6c: 9101e3e5     	add	x5, sp, #0x78
 4573a70: aa1303e0     	mov	x0, x19
 4573a74: aa1403e1     	mov	x1, x20
 4573a78: 52800026     	mov	w6, #0x1                ; =1
 4573a7c: 940014e1     	bl	0x4578e00 <_ChromeMain+0x4573b64>
