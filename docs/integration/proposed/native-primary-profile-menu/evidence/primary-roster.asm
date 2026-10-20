
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4573250: 52801e00     	mov	w0, #0xf0               ; =240
 4573254: 9400162e     	bl	0x4578b0c <_ChromeMain+0x4573870>
 4573258: 52800108     	mov	w8, #0x8                ; =8
 457325c: 39051fe8     	strb	w8, [sp, #0x147]
 4573260: 9104c3e9     	add	x9, sp, #0x130
 4573264: 9100412a     	add	x10, x9, #0x10
 4573268: f004d088     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 457326c: 913ed108     	add	x8, x8, #0xfb4
 4573270: eb08015f     	cmp	x10, x8
 4573274: fa488122     	ccmp	x9, x8, #0x2, hi
 4573278: 540041e9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457327c: aa0003f4     	mov	x20, x0
 4573280: 3dc00100     	ldr	q0, [x8]
 4573284: 3d804fe0     	str	q0, [sp, #0x130]
 4573288: 790283ff     	strh	wzr, [sp, #0x140]
 457328c: 9104c3e1     	add	x1, sp, #0x130
 4573290: 9400166c     	bl	0x4578c40 <_ChromeMain+0x45739a4>
 4573294: 39c51fe8     	ldrsb	w8, [sp, #0x147]
 4573298: 36f800a8     	tbz	w8, #0x1f, 0x45732ac <_ChromeMain+0x456e010>
 457329c: f9409be0     	ldr	x0, [sp, #0x130]
 45732a0: f940a3e8     	ldr	x8, [sp, #0x140]
 45732a4: d37ff901     	lsl	x1, x8, #1
 45732a8: 96ea5704     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45732ac: f0054b95     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45732b0: f9467ea0     	ldr	x0, [x21, #0xcf8]
 45732b4: b4000b60     	cbz	x0, 0x4573420 <_ChromeMain+0x456e184>
 45732b8: f9418a68     	ldr	x8, [x19, #0x310]
 45732bc: f9403519     	ldr	x25, [x8, #0x68]
 45732c0: 9752b22e     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 45732c4: b4000ae0     	cbz	x0, 0x4573420 <_ChromeMain+0x456e184>
 45732c8: aa0003fa     	mov	x26, x0
 45732cc: 9752b251     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 45732d0: aa0003f8     	mov	x24, x0
 45732d4: 39412328     	ldrb	w8, [x25, #0x48]
 45732d8: b9002fe8     	str	w8, [sp, #0x2c]
 45732dc: 370000e8     	tbnz	w8, #0x0, 0x45732f8 <_ChromeMain+0x456e05c>
 45732e0: aa1803e0     	mov	x0, x24
 45732e4: 97ee291a     	bl	0x40fd74c <_ChromeMain+0x40f84b0>
 45732e8: f90013e0     	str	x0, [sp, #0x20]
 45732ec: 14000005     	b	0x4573300 <_ChromeMain+0x456e064>
 45732f0: d2800001     	mov	x1, #0x0                ; =0
 45732f4: 14000010     	b	0x4573334 <_ChromeMain+0x456e098>
 45732f8: 52800028     	mov	w8, #0x1                ; =1
 45732fc: f90013e8     	str	x8, [sp, #0x20]
 4573300: a9357fbf     	stp	xzr, xzr, [x29, #-0xb0]
 4573304: f81603bf     	stur	xzr, [x29, #-0xa0]
 4573308: f9400328     	ldr	x8, [x25]
 457330c: f940a508     	ldr	x8, [x8, #0x148]
 4573310: aa1903e0     	mov	x0, x25
 4573314: d63f0100     	blr	x8
 4573318: f9400008     	ldr	x8, [x0]
 457331c: f9401909     	ldr	x9, [x8, #0x30]
 4573320: d102c3a8     	sub	x8, x29, #0xb0
 4573324: d63f0120     	blr	x9
 4573328: f9467ea8     	ldr	x8, [x21, #0xcf8]
 457332c: b4fffe28     	cbz	x8, 0x45732f0 <_ChromeMain+0x456e054>
 4573330: f9401d01     	ldr	x1, [x8, #0x38]
 4573334: d10323a8     	sub	x8, x29, #0xc8
 4573338: aa1803e0     	mov	x0, x24
 457333c: 97ee292e     	bl	0x40fd7f4 <_ChromeMain+0x40f8558>
 4573340: a973a3b7     	ldp	x23, x8, [x29, #-0xc8]
 4573344: 8b080508     	add	x8, x8, x8, lsl #1
 4573348: d37df116     	lsl	x22, x8, #3
 457334c: b4000656     	cbz	x22, 0x4573414 <_ChromeMain+0x456e178>
 4573350: a900e7fa     	stp	x26, x25, [sp, #0x8]
 4573354: b0052308     	adrp	x8, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4573358: 91384108     	add	x8, x8, #0xe10
 457335c: 925e7508     	and	x8, x8, #0xfffffffc00000000
 4573360: f9000fe8     	str	x8, [sp, #0x18]
 4573364: 52800039     	mov	w25, #0x1               ; =1
 4573368: 2f06e408     	movi	d8, #0xffff000000000000
 457336c: 9004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4573370: 3dc04100     	ldr	q0, [x8, #0x100]
 4573374: 3d8017e0     	str	q0, [sp, #0x50]
 4573378: 14000359     	b	0x45740dc <_ChromeMain+0x456ee40>
 457337c: f94002a0     	ldr	x0, [x21]
 4573380: f9400aa8     	ldr	x8, [x21, #0x10]
 4573384: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4573388: 96ea56cc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 457338c: 1400000d     	b	0x45733c0 <_ChromeMain+0x456e124>
 4573390: f85403a8     	ldur	x8, [x29, #-0xc0]
 4573394: 8b080509     	add	x9, x8, x8, lsl #1
 4573398: d37df129     	lsl	x9, x9, #3
 457339c: aa1703e0     	mov	x0, x23
 45733a0: b4000189     	cbz	x9, 0x45733d0 <_ChromeMain+0x456e134>
 45733a4: 8b170129     	add	x9, x9, x23
 45733a8: d1006135     	sub	x21, x9, #0x18
 45733ac: d37df109     	lsl	x9, x8, #3
 45733b0: cb081536     	sub	x22, x9, x8, lsl #5
 45733b4: b4003815     	cbz	x21, 0x4573ab4 <_ChromeMain+0x456e818>
 45733b8: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 45733bc: 37fffe08     	tbnz	w8, #0x1f, 0x457337c <_ChromeMain+0x456e0e0>
 45733c0: d10062b5     	sub	x21, x21, #0x18
 45733c4: b10062d6     	adds	x22, x22, #0x18
 45733c8: 54ffff61     	b.ne	0x45733b4 <_ChromeMain+0x456e118>
 45733cc: f85383a0     	ldur	x0, [x29, #-0xc8]
 45733d0: cb0002e8     	sub	x8, x23, x0
 45733d4: 9343fd08     	asr	x8, x8, #3
 45733d8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 45733dc: f2955569     	movk	x9, #0xaaab
 45733e0: 9b097d08     	mul	x8, x8, x9
 45733e4: f81403a8     	stur	x8, [x29, #-0xc0]
 45733e8: f85483a8     	ldur	x8, [x29, #-0xb8]
 45733ec: 8b080508     	add	x8, x8, x8, lsl #1
 45733f0: d37df101     	lsl	x1, x8, #3
 45733f4: 96ea56b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45733f8: 14000008     	b	0x4573418 <_ChromeMain+0x456e17c>
 45733fc: f85503a0     	ldur	x0, [x29, #-0xb0]
 4573400: f85603a8     	ldur	x8, [x29, #-0xa0]
 4573404: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4573408: 96ea56ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 457340c: 14000005     	b	0x4573420 <_ChromeMain+0x456e184>
 4573410: f85383b7     	ldur	x23, [x29, #-0xc8]
 4573414: b5fffbf7     	cbnz	x23, 0x4573390 <_ChromeMain+0x456e0f4>
 4573418: 38d673a8     	ldursb	w8, [x29, #-0x99]
 457341c: 37ffff08     	tbnz	w8, #0x1f, 0x45733fc <_ChromeMain+0x456e160>
 4573420: f9418a68     	ldr	x8, [x19, #0x310]
 4573424: f9403508     	ldr	x8, [x8, #0x68]
 4573428: 39412108     	ldrb	w8, [x8, #0x48]
 457342c: 370008a8     	tbnz	w8, #0x0, 0x4573540 <_ChromeMain+0x456e2a4>
 4573430: 52800400     	mov	w0, #0x20               ; =32
 4573434: 96ea6fcd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573438: f900dbe0     	str	x0, [sp, #0x1b0]
 457343c: b004ce68     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4573440: 3dc3b100     	ldr	q0, [x8, #0xec0]
 4573444: 910543e8     	add	x8, sp, #0x150
 4573448: 3c868100     	stur	q0, [x8, #0x68]
 457344c: 91005809     	add	x9, x0, #0x16
 4573450: eb00013f     	cmp	x9, x0
 4573454: 54003303     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4573458: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457345c: 91023108     	add	x8, x8, #0x8c
 4573460: eb08013f     	cmp	x9, x8
 4573464: fa488002     	ccmp	x0, x8, #0x2, hi
 4573468: 54003269     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457346c: 3dc00100     	ldr	q0, [x8]
 4573470: 3d800000     	str	q0, [x0]
 4573474: f840e108     	ldur	x8, [x8, #0xe]
 4573478: f800e008     	stur	x8, [x0, #0xe]
 457347c: 79002c1f     	strh	wzr, [x0, #0x16]
 4573480: f9418e68     	ldr	x8, [x19, #0x318]
 4573484: f940c515     	ldr	x21, [x8, #0x188]
 4573488: b40000d5     	cbz	x21, 0x45734a0 <_ChromeMain+0x456e204>
 457348c: 52800029     	mov	w9, #0x1                ; =1
 4573490: b82902a9     	ldadd	w9, w9, [x21]
 4573494: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4573498: 6b0a013f     	cmp	w9, w10
 457349c: 54007660     	b.eq	0x4574368 <_ChromeMain+0x456f0cc>
 45734a0: f940c916     	ldr	x22, [x8, #0x190]
 45734a4: 52800800     	mov	w0, #0x40               ; =64
 45734a8: 96ea6fb0     	bl	0xf368 <_ChromeMain+0xa0cc>
 45734ac: aa0003e4     	mov	x4, x0
 45734b0: 52800028     	mov	w8, #0x1                ; =1
 45734b4: b9000008     	str	w8, [x0]
 45734b8: f0ffcfc8     	adrp	x8, 0x3f6e000 <_ChromeMain+0x3f68d64>
 45734bc: 91230108     	add	x8, x8, #0x8c0
 45734c0: b0ffcfc9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45734c4: 912b0129     	add	x9, x9, #0xac0
 45734c8: a900a408     	stp	x8, x9, [x0, #0x8]
 45734cc: f0ffd9c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 45734d0: 911b0108     	add	x8, x8, #0x6c0
 45734d4: 10ff2129     	adr	x9, 0x45718f8 <_ChromeMain+0x456c65c>
 45734d8: d503201f     	nop
 45734dc: a901a408     	stp	x8, x9, [x0, #0x18]
 45734e0: a902d41f     	stp	xzr, x21, [x0, #0x28]
 45734e4: f9001c16     	str	x22, [x0, #0x38]
 45734e8: a915ffff     	stp	xzr, xzr, [sp, #0x158]
 45734ec: f900abff     	str	xzr, [sp, #0x150]
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
 4573a80: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 4573a84: 36f800a8     	tbz	w8, #0x1f, 0x4573a98 <_ChromeMain+0x456e7fc>
 4573a88: f9403fe0     	ldr	x0, [sp, #0x78]
 4573a8c: f94047e8     	ldr	x8, [sp, #0x88]
 4573a90: d37ff901     	lsl	x1, x8, #1
 4573a94: 96ea5509     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573a98: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 4573a9c: 36ffbba8     	tbz	w8, #0x1f, 0x4573210 <_ChromeMain+0x456df74>
 4573aa0: f9404be0     	ldr	x0, [sp, #0x90]
 4573aa4: f94053e8     	ldr	x8, [sp, #0xa0]
 4573aa8: d37ff901     	lsl	x1, x8, #1
 4573aac: 96ea5503     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573ab0: 17fffdd8     	b	0x4573210 <_ChromeMain+0x456df74>
 4573ab4: d4200020     	brk	#0x1
 4573ab8: f940dbe0     	ldr	x0, [sp, #0x1b0]
 4573abc: f940e3e8     	ldr	x8, [sp, #0x1c0]
 4573ac0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4573ac4: 96ea54fd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4573ac8: b4000919     	cbz	x25, 0x4573be8 <_ChromeMain+0x456e94c>
 4573acc: 9106c3e8     	add	x8, sp, #0x1b0
 4573ad0: aa1903e0     	mov	x0, x25
 4573ad4: 52800281     	mov	w1, #0x14               ; =20
 4573ad8: 52800022     	mov	w2, #0x1                ; =1
 4573adc: 90048b83     	adrp	x3, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 4573ae0: 9102e063     	add	x3, x3, #0xb8
 4573ae4: 97873e44     	bl	0x27433f4 <_ChromeMain+0x273e158>
 4573ae8: f940dbe8     	ldr	x8, [sp, #0x1b0]
 4573aec: f9007be8     	str	x8, [sp, #0xf0]
 4573af0: 910443e8     	add	x8, sp, #0x110
 4573af4: 9103c3e0     	add	x0, sp, #0xf0
 4573af8: 52800281     	mov	w1, #0x14               ; =20
 4573afc: 52800282     	mov	w2, #0x14               ; =20
 4573b00: 52800003     	mov	w3, #0x0                ; =0
 4573b04: 974ab0ef     	bl	0x181fec0 <_ChromeMain+0x181ac24>
 4573b08: f9408be8     	ldr	x8, [sp, #0x110]
 4573b0c: f900dbe8     	str	x8, [sp, #0x1b0]
 4573b10: b4003d88     	cbz	x8, 0x45742c0 <_ChromeMain+0x456f024>
 4573b14: b9400109     	ldr	w9, [x8]
 4573b18: 31000529     	adds	w9, w9, #0x1
 4573b1c: b9000109     	str	w9, [x8]
 4573b20: 52800028     	mov	w8, #0x1                ; =1
 4573b24: 54004402     	b.hs	0x45743a4 <_ChromeMain+0x456f108>
 4573b28: f9408bf5     	ldr	x21, [sp, #0x110]
 4573b2c: 390743e8     	strb	w8, [sp, #0x1d0]
 4573b30: b40000d5     	cbz	x21, 0x4573b48 <_ChromeMain+0x456e8ac>
 4573b34: b94002a9     	ldr	w9, [x21]
 4573b38: 51000528     	sub	w8, w9, #0x1
 4573b3c: b90002a8     	str	w8, [x21]
 4573b40: 34004389     	cbz	w9, 0x45743b0 <_ChromeMain+0x456f114>
 4573b44: 34003c48     	cbz	w8, 0x45742cc <_ChromeMain+0x456f030>
 4573b48: 52800035     	mov	w21, #0x1               ; =1
 4573b4c: f9407bf9     	ldr	x25, [sp, #0xf0]
 4573b50: b4000a59     	cbz	x25, 0x4573c98 <_ChromeMain+0x456e9fc>
 4573b54: b9400329     	ldr	w9, [x25]
 4573b58: 51000528     	sub	w8, w9, #0x1
 4573b5c: b9000328     	str	w8, [x25]
 4573b60: 340042e9     	cbz	w9, 0x45743bc <_ChromeMain+0x456f120>
 4573b64: 350009a8     	cbnz	w8, 0x4573c98 <_ChromeMain+0x456e9fc>
 4573b68: 140001e2     	b	0x45742f0 <_ChromeMain+0x456f054>
 4573b6c: 350042e8     	cbnz	w8, 0x45743c8 <_ChromeMain+0x456f12c>
 4573b70: 910c8268     	add	x8, x19, #0x320
 4573b74: f9400108     	ldr	x8, [x8]
 4573b78: b5000848     	cbnz	x8, 0x4573c80 <_ChromeMain+0x456e9e4>
 4573b7c: f9400be8     	ldr	x8, [sp, #0x10]
 4573b80: b4000348     	cbz	x8, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b84: f0054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4573b88: f9467d00     	ldr	x0, [x8, #0xcf8]
 4573b8c: b40002e0     	cbz	x0, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b90: 9752affa     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4573b94: b40002a0     	cbz	x0, 0x4573be8 <_ChromeMain+0x456e94c>
 4573b98: f0054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4573b9c: f9467d00     	ldr	x0, [x8, #0xcf8]
 4573ba0: 9752aff6     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4573ba4: 9752b01b     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4573ba8: aa0003f9     	mov	x25, x0
 4573bac: f9400be0     	ldr	x0, [sp, #0x10]
 4573bb0: f9400008     	ldr	x8, [x0]
 4573bb4: f940a508     	ldr	x8, [x8, #0x148]
 4573bb8: d63f0100     	blr	x8
 4573bbc: f9400008     	ldr	x8, [x0]
 4573bc0: f9401909     	ldr	x9, [x8, #0x30]
 4573bc4: 9106c3e8     	add	x8, sp, #0x1b0
 4573bc8: d63f0120     	blr	x9
 4573bcc: 9106c3e1     	add	x1, sp, #0x1b0
 4573bd0: aa1903e0     	mov	x0, x25
 4573bd4: 9752b04b     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4573bd8: aa0003f9     	mov	x25, x0
 4573bdc: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 4573be0: 37fff6c8     	tbnz	w8, #0x1f, 0x4573ab8 <_ChromeMain+0x456e81c>
 4573be4: b5fff759     	cbnz	x25, 0x4573acc <_ChromeMain+0x456e830>
 4573be8: f900dbff     	str	xzr, [sp, #0x1b0]
 4573bec: fd00dfe8     	str	d8, [sp, #0x1b8]
 4573bf0: 390703f5     	strb	w21, [sp, #0x1c0]
 4573bf4: f900e7ff     	str	xzr, [sp, #0x1c8]
 4573bf8: 390743ff     	strb	wzr, [sp, #0x1d0]
 4573bfc: 14000027     	b	0x4573c98 <_ChromeMain+0x456e9fc>
 4573c00: 12800008     	mov	w8, #-0x1               ; =-1
 4573c04: b8e80008     	ldaddal	w8, w8, [x0]
 4573c08: 7100051f     	cmp	w8, #0x1
 4573c0c: 54001201     	b.ne	0x4573e4c <_ChromeMain+0x456ebb0>
 4573c10: f9400808     	ldr	x8, [x0, #0x10]
 4573c14: d63f0100     	blr	x8
 4573c18: 1400008d     	b	0x4573e4c <_ChromeMain+0x456ebb0>
 4573c1c: a9400ae1     	ldp	x1, x2, [x23]
 4573c20: 91010340     	add	x0, x26, #0x40
 4573c24: 96ea917d     	bl	0x18218 <_ChromeMain+0x12f7c>
 4573c28: 14000071     	b	0x4573dec <_ChromeMain+0x456eb50>
 4573c2c: f9400be0     	ldr	x0, [sp, #0x10]
 4573c30: f9400008     	ldr	x8, [x0]
 4573c34: f940a508     	ldr	x8, [x8, #0x148]
 4573c38: d63f0100     	blr	x8
 4573c3c: aa0003fa     	mov	x26, x0
 4573c40: 6f00e400     	movi.2d	v0, #0000000000000000
 4573c44: ad3883a0     	stp	q0, q0, [x29, #-0xf0]
 4573c48: f81303bf     	stur	xzr, [x29, #-0xd0]
 4573c4c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4573c50: b811c3a8     	stur	w8, [x29, #-0xe4]
 4573c54: 381203b9     	sturb	w25, [x29, #-0xe0]
 4573c58: 381303bf     	sturb	wzr, [x29, #-0xd0]
 4573c5c: 394d0268     	ldrb	w8, [x19, #0x340]
 4573c60: 52800035     	mov	w21, #0x1               ; =1
 4573c64: 7100051f     	cmp	w8, #0x1
 4573c68: 54fff821     	b.ne	0x4573b6c <_ChromeMain+0x456e8d0>
 4573c6c: 910c8268     	add	x8, x19, #0x320
 4573c70: f9400108     	ldr	x8, [x8]
 4573c74: b4fff848     	cbz	x8, 0x4573b7c <_ChromeMain+0x456e8e0>
 4573c78: f9400d08     	ldr	x8, [x8, #0x18]
 4573c7c: b4fff808     	cbz	x8, 0x4573b7c <_ChromeMain+0x456e8e0>
 4573c80: 3906c3ff     	strb	wzr, [sp, #0x1b0]
 4573c84: 52801fe8     	mov	w8, #0xff               ; =255
 4573c88: 390743e8     	strb	w8, [sp, #0x1d0]
 4573c8c: 9106c3e0     	add	x0, sp, #0x1b0
 4573c90: 910c8261     	add	x1, x19, #0x320
 4573c94: 97052c3e     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4573c98: d103c3a0     	sub	x0, x29, #0xf0
 4573c9c: 9106c3e1     	add	x1, sp, #0x1b0
 4573ca0: 9713176a     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 4573ca4: 9106c3e0     	add	x0, sp, #0x1b0
 4573ca8: 970b4ae6     	bl	0x846840 <_ChromeMain+0x8415a4>
 4573cac: 394d2279     	ldrb	w25, [x19, #0x348]
 4573cb0: f90143ff     	str	xzr, [sp, #0x280]
 4573cb4: 6f00e400     	movi.2d	v0, #0000000000000000
 4573cb8: ad1303e0     	stp	q0, q0, [sp, #0x260]
 4573cbc: ad1203e0     	stp	q0, q0, [sp, #0x240]
 4573cc0: ad1103e0     	stp	q0, q0, [sp, #0x220]
 4573cc4: ad1003e0     	stp	q0, q0, [sp, #0x200]
 4573cc8: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 4573ccc: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 4573cd0: 3d806fe0     	str	q0, [sp, #0x1b0]
 4573cd4: 9106c3e8     	add	x8, sp, #0x1b0
 4573cd8: aa1c03e0     	mov	x0, x28
 4573cdc: aa1a03e1     	mov	x1, x26
 4573ce0: f94013e2     	ldr	x2, [sp, #0x20]
 4573ce4: 97ee286c     	bl	0x40fde94 <_ChromeMain+0x40f8bf8>
 4573ce8: 9106c3fa     	add	x26, sp, #0x1b0
 4573cec: 3805835f     	sturb	wzr, [x26, #0x58]
 4573cf0: 6f00e400     	movi.2d	v0, #0000000000000000
 4573cf4: 3c848340     	stur	q0, [x26, #0x48]
 4573cf8: 3c838340     	stur	q0, [x26, #0x38]
 4573cfc: 3c828340     	stur	q0, [x26, #0x28]
 4573d00: 3c818340     	stur	q0, [x26, #0x18]
 4573d04: 52801fe8     	mov	w8, #0xff               ; =255
 4573d08: 3908a3e8     	strb	w8, [sp, #0x228]
 4573d0c: 91016340     	add	x0, x26, #0x58
 4573d10: d103c3a1     	sub	x1, x29, #0xf0
 4573d14: 97052c1e     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 4573d18: a9087f5f     	stp	xzr, xzr, [x26, #0x80]
 4573d1c: f809035f     	stur	xzr, [x26, #0x90]
 4573d20: 52801ba8     	mov	w8, #0xdd               ; =221
 4573d24: b9024be8     	str	w8, [sp, #0x248]
 4573d28: 390933ff     	strb	wzr, [sp, #0x24c]
 4573d2c: a90aff5f     	stp	xzr, xzr, [x26, #0xa8]
 4573d30: f80a035f     	stur	xzr, [x26, #0xa0]
 4573d34: 12000328     	and	w8, w25, #0x1
 4573d38: 3909a3e8     	strb	w8, [sp, #0x268]
 4573d3c: 3909a7ff     	strb	wzr, [sp, #0x269]
 4573d40: 3909abfb     	strb	w27, [sp, #0x26a]
 4573d44: 3909affb     	strb	w27, [sp, #0x26b]
 4573d48: 3909b3ff     	strb	wzr, [sp, #0x26c]
 4573d4c: d2c00408     	mov	x8, #0x2000000000       ; =137438953472
 4573d50: f9013be8     	str	x8, [sp, #0x270]
 4573d54: 52800208     	mov	w8, #0x10               ; =16
 4573d58: b9027be8     	str	w8, [sp, #0x278]
 4573d5c: f90143ff     	str	xzr, [sp, #0x280]
 4573d60: a9117fff     	stp	xzr, xzr, [sp, #0x110]
 4573d64: 52800048     	mov	w8, #0x2                ; =2
 4573d68: 390463e8     	strb	w8, [sp, #0x118]
 4573d6c: f00531fc     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4573d70: 370006fb     	tbnz	w27, #0x0, 0x4573e4c <_ChromeMain+0x456ebb0>
 4573d74: f9418e68     	ldr	x8, [x19, #0x318]
 4573d78: f940c519     	ldr	x25, [x8, #0x188]
 4573d7c: b40000b9     	cbz	x25, 0x4573d90 <_ChromeMain+0x456eaf4>
 4573d80: b8350329     	ldadd	w21, w9, [x25]
 4573d84: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4573d88: 6b0a013f     	cmp	w9, w10
 4573d8c: 54003060     	b.eq	0x4574398 <_ChromeMain+0x456f0fc>
 4573d90: f940c91b     	ldr	x27, [x8, #0x190]
 4573d94: 52800b00     	mov	w0, #0x58               ; =88
 4573d98: 96ea6d74     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573d9c: aa0003fa     	mov	x26, x0
 4573da0: b9000015     	str	w21, [x0]
 4573da4: 90ffcfe8     	adrp	x8, 0x3f6f000 <_ChromeMain+0x3f69d64>
 4573da8: 91210109     	add	x9, x8, #0x840
 4573dac: f0ffd7a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4573db0: 913a0108     	add	x8, x8, #0xe80
 4573db4: a900a009     	stp	x9, x8, [x0, #0x8]
 4573db8: f0ffd9c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4573dbc: 911b0109     	add	x9, x8, #0x6c0
 4573dc0: 10ff5328     	adr	x8, 0x4572824 <_ChromeMain+0x456d588>
 4573dc4: d503201f     	nop
 4573dc8: a901a009     	stp	x9, x8, [x0, #0x18]
 4573dcc: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4573dd0: f9001c1b     	str	x27, [x0, #0x38]
 4573dd4: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4573dd8: 37fff228     	tbnz	w8, #0x1f, 0x4573c1c <_ChromeMain+0x456e980>
 4573ddc: 3dc002e0     	ldr	q0, [x23]
 4573de0: f9400ae8     	ldr	x8, [x23, #0x10]
 4573de4: f8050348     	stur	x8, [x26, #0x50]
 4573de8: 3c840340     	stur	q0, [x26, #0x40]
 4573dec: 52800600     	mov	w0, #0x30               ; =48
 4573df0: 96ea6d5e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573df4: 52800028     	mov	w8, #0x1                ; =1
 4573df8: b9000008     	str	w8, [x0]
 4573dfc: 10039109     	adr	x9, 0x457b01c <_ChromeMain+0x4575d80>
 4573e00: d503201f     	nop
 4573e04: f0ffcfe8     	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 4573e08: 91250108     	add	x8, x8, #0x940
 4573e0c: a900a009     	stp	x9, x8, [x0, #0x8]
 4573e10: d0feff48     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4573e14: 912c0108     	add	x8, x8, #0xb00
 4573e18: f9000c08     	str	x8, [x0, #0x18]
 4573e1c: f900141a     	str	x26, [x0, #0x28]
 4573e20: f81703a0     	stur	x0, [x29, #-0x90]
 4573e24: 52800048     	mov	w8, #0x2                ; =2
 4573e28: 381783a8     	sturb	w8, [x29, #-0x88]
 4573e2c: 910443e0     	add	x0, sp, #0x110
 4573e30: d10243a1     	sub	x1, x29, #0x90
 4573e34: 97876fc9     	bl	0x274fd58 <_ChromeMain+0x274aabc>
 4573e38: 385783a8     	ldurb	w8, [x29, #-0x88]
 4573e3c: 7103fd1f     	cmp	w8, #0xff
 4573e40: 54000060     	b.eq	0x4573e4c <_ChromeMain+0x456ebb0>
 4573e44: f85703a0     	ldur	x0, [x29, #-0x90]
 4573e48: b5ffedc0     	cbnz	x0, 0x4573c00 <_ChromeMain+0x456e964>
 4573e4c: 9106c3e0     	add	x0, sp, #0x1b0
 4573e50: 910443e1     	add	x1, sp, #0x110
 4573e54: 9400168b     	bl	0x4579880 <_ChromeMain+0x45745e4>
 4573e58: aa0003fa     	mov	x26, x0
 4573e5c: f9404788     	ldr	x8, [x28, #0x88]
 4573e60: f9400fe9     	ldr	x9, [sp, #0x18]
 4573e64: eb08013f     	cmp	x9, x8
 4573e68: 54000081     	b.ne	0x4573e78 <_ChromeMain+0x456ebdc>
 4573e6c: b0052300     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4573e70: 91384000     	add	x0, x0, #0xe10
 4573e74: 96ea8122     	bl	0x142fc <_ChromeMain+0xf060>
 4573e78: b0052308     	adrp	x8, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4573e7c: 91384108     	add	x8, x8, #0xe10
 4573e80: f900abe8     	str	x8, [sp, #0x150]
 4573e84: 52801bc8     	mov	w8, #0xde               ; =222
 4573e88: b9015be8     	str	w8, [sp, #0x158]
 4573e8c: 390573ff     	strb	wzr, [sp, #0x15c]
 4573e90: 52801c48     	mov	w8, #0xe2               ; =226
 4573e94: b90163e8     	str	w8, [sp, #0x160]
 4573e98: 390593ff     	strb	wzr, [sp, #0x164]
 4573e9c: 52800400     	mov	w0, #0x20               ; =32
 4573ea0: 96ea6d32     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573ea4: f900b7e0     	str	x0, [sp, #0x168]
 4573ea8: 3dc017e0     	ldr	q0, [sp, #0x50]
 4573eac: 3d805fe0     	str	q0, [sp, #0x170]
 4573eb0: 91007808     	add	x8, x0, #0x1e
 4573eb4: eb00011f     	cmp	x8, x0
 4573eb8: 9004d0b9     	adrp	x25, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573ebc: 9104db39     	add	x25, x25, #0x136
 4573ec0: 54ffdfa3     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4573ec4: eb19011f     	cmp	x8, x25
 4573ec8: fa598002     	ccmp	x0, x25, #0x2, hi
 4573ecc: 54ffdf49     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573ed0: 3dc00320     	ldr	q0, [x25]
 4573ed4: 3d8013e0     	str	q0, [sp, #0x40]
 4573ed8: 3d800000     	str	q0, [x0]
 4573edc: 3cc0e320     	ldur	q0, [x25, #0xe]
 4573ee0: 3d800fe0     	str	q0, [sp, #0x30]
 4573ee4: 3c80e000     	stur	q0, [x0, #0xe]
 4573ee8: 79003c1f     	strh	wzr, [x0, #0x1e]
 4573eec: 52800400     	mov	w0, #0x20               ; =32
 4573ef0: 96ea6d1e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573ef4: f900c3e0     	str	x0, [sp, #0x180]
 4573ef8: 910543e8     	add	x8, sp, #0x150
 4573efc: 3dc017e0     	ldr	q0, [sp, #0x50]
 4573f00: 3c838100     	stur	q0, [x8, #0x38]
 4573f04: 91007808     	add	x8, x0, #0x1e
 4573f08: eb00011f     	cmp	x8, x0
 4573f0c: 54ffdd43     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4573f10: eb19011f     	cmp	x8, x25
 4573f14: fa598002     	ccmp	x0, x25, #0x2, hi
 4573f18: 54ffdce9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573f1c: ad4187e0     	ldp	q0, q1, [sp, #0x30]
 4573f20: 3d800001     	str	q1, [x0]
 4573f24: 3c80e000     	stur	q0, [x0, #0xe]
 4573f28: 79003c1f     	strh	wzr, [x0, #0x1e]
 4573f2c: f9418e68     	ldr	x8, [x19, #0x318]
 4573f30: f940c519     	ldr	x25, [x8, #0x188]
 4573f34: b40000b9     	cbz	x25, 0x4573f48 <_ChromeMain+0x456ecac>
 4573f38: b8350329     	ldadd	w21, w9, [x25]
 4573f3c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4573f40: 6b0a013f     	cmp	w9, w10
 4573f44: 54002060     	b.eq	0x4574350 <_ChromeMain+0x456f0b4>
 4573f48: f940c91c     	ldr	x28, [x8, #0x190]
 4573f4c: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4573f50: 36f81548     	tbz	w8, #0x1f, 0x45741f8 <_ChromeMain+0x456ef5c>
 4573f54: a9400ae1     	ldp	x1, x2, [x23]
 4573f58: d10243a0     	sub	x0, x29, #0x90
 4573f5c: 96ea90af     	bl	0x18218 <_ChromeMain+0x12f7c>
 4573f60: 52800d00     	mov	w0, #0x68               ; =104
 4573f64: 96ea6d01     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573f68: aa0003fb     	mov	x27, x0
 4573f6c: b9000015     	str	w21, [x0]
 4573f70: 10049589     	adr	x9, 0x457d220 <_ChromeMain+0x4577f84>
 4573f74: d503201f     	nop
 4573f78: 10049c88     	adr	x8, 0x457d308 <_ChromeMain+0x457806c>
 4573f7c: d503201f     	nop
 4573f80: a900a009     	stp	x9, x8, [x0, #0x8]
 4573f84: 1004a069     	adr	x9, 0x457d390 <_ChromeMain+0x45780f4>
 4573f88: d503201f     	nop
 4573f8c: 10fddae8     	adr	x8, 0x456fae8 <_ChromeMain+0x456a84c>
 4573f90: d503201f     	nop
 4573f94: a901a009     	stp	x9, x8, [x0, #0x18]
 4573f98: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4573f9c: f9001c1c     	str	x28, [x0, #0x38]
 4573fa0: 528000c8     	mov	w8, #0x6                ; =6
 4573fa4: b9004008     	str	w8, [x0, #0x40]
 4573fa8: 925e7748     	and	x8, x26, #0xfffffffc00000000
 4573fac: f00531f9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4573fb0: f9404729     	ldr	x9, [x25, #0x88]
 4573fb4: eb09011f     	cmp	x8, x9
 4573fb8: 54000061     	b.ne	0x4573fc4 <_ChromeMain+0x456ed28>
 4573fbc: aa1a03e0     	mov	x0, x26
 4573fc0: 96ea80cf     	bl	0x142fc <_ChromeMain+0xf060>
 4573fc4: f900277a     	str	x26, [x27, #0x48]
 4573fc8: 3cd703a0     	ldur	q0, [x29, #-0x90]
 4573fcc: 3d801760     	str	q0, [x27, #0x50]
 4573fd0: f85803a8     	ldur	x8, [x29, #-0x80]
 4573fd4: f9003368     	str	x8, [x27, #0x60]
 4573fd8: 52800600     	mov	w0, #0x30               ; =48
 4573fdc: 96ea6ce3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573fe0: 52800028     	mov	w8, #0x1                ; =1
 4573fe4: b9000008     	str	w8, [x0]
 4573fe8: 100381aa     	adr	x10, 0x457b01c <_ChromeMain+0x4575d80>
 4573fec: d503201f     	nop
 4573ff0: f0ffcfe9     	adrp	x9, 0x3f72000 <_ChromeMain+0x3f6cd64>
 4573ff4: 91250129     	add	x9, x9, #0x940
 4573ff8: a900a40a     	stp	x10, x9, [x0, #0x8]
 4573ffc: d0feff49     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 4574000: 912c0129     	add	x9, x9, #0xb00
 4574004: f9000c09     	str	x9, [x0, #0x18]
 4574008: f900141b     	str	x27, [x0, #0x28]
 457400c: f900cfe0     	str	x0, [sp, #0x198]
 4574010: 52800049     	mov	w9, #0x2                ; =2
 4574014: 390683e9     	strb	w9, [sp, #0x1a0]
 4574018: 790353e8     	strh	w8, [sp, #0x1a8]
 457401c: 910543e1     	add	x1, sp, #0x150
 4574020: aa1a03e0     	mov	x0, x26
 4574024: 94001b2d     	bl	0x457acd8 <_ChromeMain+0x4575a3c>
 4574028: 394683e8     	ldrb	w8, [sp, #0x1a0]
 457402c: 7103fd1f     	cmp	w8, #0xff
 4574030: 54000060     	b.eq	0x457403c <_ChromeMain+0x456eda0>
 4574034: f940cfe0     	ldr	x0, [sp, #0x198]
 4574038: b5000ea0     	cbnz	x0, 0x457420c <_ChromeMain+0x456ef70>
 457403c: 52801fe8     	mov	w8, #0xff               ; =255
 4574040: 390683e8     	strb	w8, [sp, #0x1a0]
 4574044: 39c65fe8     	ldrsb	w8, [sp, #0x197]
 4574048: 36f800a8     	tbz	w8, #0x1f, 0x457405c <_ChromeMain+0x456edc0>
 457404c: f940c3e0     	ldr	x0, [sp, #0x180]
 4574050: f940cbe8     	ldr	x8, [sp, #0x190]
 4574054: d37ff901     	lsl	x1, x8, #1
 4574058: 96ea5398     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 457405c: 39c5ffe8     	ldrsb	w8, [sp, #0x17f]
 4574060: 36f800a8     	tbz	w8, #0x1f, 0x4574074 <_ChromeMain+0x456edd8>
 4574064: f940b7e0     	ldr	x0, [sp, #0x168]
 4574068: f940bfe8     	ldr	x8, [sp, #0x178]
 457406c: d37ff901     	lsl	x1, x8, #1
 4574070: 96ea5392     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4574074: f940abe0     	ldr	x0, [sp, #0x150]
 4574078: 925e7408     	and	x8, x0, #0xfffffffc00000000
 457407c: f9404729     	ldr	x9, [x25, #0x88]
 4574080: eb09011f     	cmp	x8, x9
 4574084: 54000041     	b.ne	0x457408c <_ChromeMain+0x456edf0>
 4574088: 96eaba6d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 457408c: f900abff     	str	xzr, [sp, #0x150]
 4574090: 3945a748     	ldrb	w8, [x26, #0x169]
 4574094: 52800039     	mov	w25, #0x1               ; =1
 4574098: 35001628     	cbnz	w8, 0x457435c <_ChromeMain+0x456f0c0>
 457409c: f940ce82     	ldr	x2, [x20, #0x198]
 45740a0: aa1403e0     	mov	x0, x20
 45740a4: aa1a03e1     	mov	x1, x26
 45740a8: 970814d5     	bl	0x7793fc <_ChromeMain+0x774160>
 45740ac: 394463e8     	ldrb	w8, [sp, #0x118]
 45740b0: 7103fd1f     	cmp	w8, #0xff
 45740b4: 54000060     	b.eq	0x45740c0 <_ChromeMain+0x456ee24>
 45740b8: f9408be0     	ldr	x0, [sp, #0x110]
 45740bc: b5000b60     	cbnz	x0, 0x4574228 <_ChromeMain+0x456ef8c>
 45740c0: 9106c3e0     	add	x0, sp, #0x1b0
 45740c4: 94001b50     	bl	0x457ae04 <_ChromeMain+0x4575b68>
 45740c8: d103c3a0     	sub	x0, x29, #0xf0
 45740cc: 970b49dd     	bl	0x846840 <_ChromeMain+0x8415a4>
 45740d0: 910062f7     	add	x23, x23, #0x18
 45740d4: f10062d6     	subs	x22, x22, #0x18
 45740d8: 54ff99c0     	b.eq	0x4573410 <_ChromeMain+0x456e174>
 45740dc: aa1803e0     	mov	x0, x24
 45740e0: aa1703e1     	mov	x1, x23
 45740e4: 9752af07     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 45740e8: b4ffff40     	cbz	x0, 0x45740d0 <_ChromeMain+0x456ee34>
 45740ec: aa0003fc     	mov	x28, x0
 45740f0: 39418008     	ldrb	w8, [x0, #0x60]
 45740f4: 3707fee8     	tbnz	w8, #0x0, 0x45740d0 <_ChromeMain+0x456ee34>
 45740f8: d102c3a1     	sub	x1, x29, #0xb0
 45740fc: aa1703e0     	mov	x0, x23
 4574100: 972d6001     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4574104: aa0003fb     	mov	x27, x0
 4574108: 37000060     	tbnz	w0, #0x0, 0x4574114 <_ChromeMain+0x456ee78>
 457410c: b9402fe8     	ldr	w8, [sp, #0x2c]
 4574110: 35fffe08     	cbnz	w8, 0x45740d0 <_ChromeMain+0x456ee34>
 4574114: 35ffd8db     	cbnz	w27, 0x4573c2c <_ChromeMain+0x456e990>
