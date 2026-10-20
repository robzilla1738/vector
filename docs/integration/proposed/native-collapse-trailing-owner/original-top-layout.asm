
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3479440: d10303ff     	sub	sp, sp, #0xc0
 3479444: a9066ffc     	stp	x28, x27, [sp, #0x60]
 3479448: a90767fa     	stp	x26, x25, [sp, #0x70]
 347944c: a9085ff8     	stp	x24, x23, [sp, #0x80]
 3479450: a90957f6     	stp	x22, x21, [sp, #0x90]
 3479454: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 3479458: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 347945c: 9102c3fd     	add	x29, sp, #0xb0
 3479460: aa0103f5     	mov	x21, x1
 3479464: aa0003f4     	mov	x20, x0
 3479468: aa0803f3     	mov	x19, x8
 347946c: 6f00e400     	movi.2d	v0, #0000000000000000
 3479470: ad000100     	stp	q0, q0, [x8]
 3479474: 39401029     	ldrb	w9, [x1, #0x4]
 3479478: aa0103e8     	mov	x8, x1
 347947c: 37000069     	tbnz	w9, #0x0, 0x3479488 <_ChromeMain+0x34741ec>
 3479480: f940c688     	ldr	x8, [x20, #0x188]
 3479484: 91070108     	add	x8, x8, #0x1c0
 3479488: b9400108     	ldr	w8, [x8]
 347948c: b943aa89     	ldr	w9, [x20, #0x3a8]
 3479490: 0aa87d17     	bic	w23, w8, w8, asr #31
 3479494: 0aa97d38     	bic	w24, w9, w9, asr #31
 3479498: 394ee289     	ldrb	w9, [x20, #0x3b8]
 347949c: 350003c9     	cbnz	w9, 0x3479514 <_ChromeMain+0x3474278>
 34794a0: aa1703fc     	mov	x28, x23
 34794a4: 7100011f     	cmp	w8, #0x0
 34794a8: 5400016c     	b.gt	0x34794d4 <_ChromeMain+0x3474238>
 34794ac: f940c680     	ldr	x0, [x20, #0x188]
 34794b0: f9400008     	ldr	x8, [x0]
 34794b4: f9404d09     	ldr	x9, [x8, #0x98]
 34794b8: 910103e8     	add	x8, sp, #0x40
 34794bc: aa1403e1     	mov	x1, x20
 34794c0: d63f0120     	blr	x9
 34794c4: 394113e8     	ldrb	w8, [sp, #0x44]
 34794c8: b94043e9     	ldr	w9, [sp, #0x40]
 34794cc: 7100011f     	cmp	w8, #0x0
 34794d0: 1a9f113c     	csel	w28, w9, wzr, ne
 34794d4: f941ae80     	ldr	x0, [x20, #0x358]
 34794d8: b4002080     	cbz	x0, 0x34798e8 <_ChromeMain+0x347464c>
 34794dc: 39472019     	ldrb	w25, [x0, #0x1c8]
 34794e0: 910ec29b     	add	x27, x20, #0x3b0
 34794e4: 394ec288     	ldrb	w8, [x20, #0x3b0]
 34794e8: 37002da8     	tbnz	w8, #0x0, 0x3479a9c <_ChromeMain+0x3474800>
 34794ec: 34002059     	cbz	w25, 0x34798f4 <_ChromeMain+0x3474658>
 34794f0: 52800001     	mov	w1, #0x0                ; =0
 34794f4: 9416b413     	bl	0x3a26540 <_ChromeMain+0x3a212a4>
 34794f8: 6b00039f     	cmp	w28, w0
 34794fc: 7a41cb88     	ccmp	w28, #0x1, #0x8, gt
 3479500: 52800039     	mov	w25, #0x1               ; =1
 3479504: 52800028     	mov	w8, #0x1                ; =1
 3479508: b90033e8     	str	w8, [sp, #0x30]
 347950c: 54001fca     	b.ge	0x3479904 <_ChromeMain+0x3474668>
 3479510: 14000163     	b	0x3479a9c <_ChromeMain+0x3474800>
 3479514: aa1403e0     	mov	x0, x20
 3479518: 9437368a     	bl	0x4246f40 <_ChromeMain+0x4241ca4>
 347951c: 0aa07c08     	bic	w8, w0, w0, asr #31
 3479520: 6b08031f     	cmp	w24, w8
 3479524: 1a888316     	csel	w22, w24, w8, hi
 3479528: f941be95     	ldr	x21, [x20, #0x378]
 347952c: b40004b5     	cbz	x21, 0x34795c0 <_ChromeMain+0x3474324>
 3479530: f9002ff5     	str	x21, [sp, #0x58]
 3479534: 394722b8     	ldrb	w24, [x21, #0x1c8]
 3479538: aa1303e0     	mov	x0, x19
 347953c: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479540: 39015ff8     	strb	w24, [sp, #0x57]
 3479544: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479548: f940080a     	ldr	x10, [x0, #0x10]
 347954c: eb0a013f     	cmp	x9, x10
 3479550: 5400d000     	b.eq	0x347af50 <_ChromeMain+0x3475cb4>
 3479554: 5280060a     	mov	w10, #0x30              ; =48
 3479558: 9b0a2139     	madd	x25, x9, x10, x8
 347955c: b4001c59     	cbz	x25, 0x34798e4 <_ChromeMain+0x3474648>
 3479560: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479564: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479568: f9404529     	ldr	x9, [x9, #0x88]
 347956c: eb09011f     	cmp	x8, x9
 3479570: 54000061     	b.ne	0x347957c <_ChromeMain+0x34742e0>
 3479574: aa1503e0     	mov	x0, x21
 3479578: 972e6b61     	bl	0x142fc <_ChromeMain+0xf060>
 347957c: f9000335     	str	x21, [x25]
 3479580: 39002338     	strb	w24, [x25, #0x8]
 3479584: 3dc013e0     	ldr	q0, [sp, #0x40]
 3479588: 3c80c320     	stur	q0, [x25, #0xc]
 347958c: 3900733f     	strb	wzr, [x25, #0x1c]
 3479590: 3900833f     	strb	wzr, [x25, #0x20]
 3479594: 3900933f     	strb	wzr, [x25, #0x24]
 3479598: 3900a33f     	strb	wzr, [x25, #0x28]
 347959c: 9100c320     	add	x0, x25, #0x30
 34795a0: f9400668     	ldr	x8, [x19, #0x8]
 34795a4: eb080008     	subs	x8, x0, x8
 34795a8: 9344fd08     	asr	x8, x8, #4
 34795ac: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 34795b0: f2955569     	movk	x9, #0xaaab
 34795b4: 9b097d08     	mul	x8, x8, x9
 34795b8: f9000a68     	str	x8, [x19, #0x10]
 34795bc: 54001940     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 34795c0: f941b695     	ldr	x21, [x20, #0x368]
 34795c4: b40004b5     	cbz	x21, 0x3479658 <_ChromeMain+0x34743bc>
 34795c8: f9002ff5     	str	x21, [sp, #0x58]
 34795cc: 394722b8     	ldrb	w24, [x21, #0x1c8]
 34795d0: aa1303e0     	mov	x0, x19
 34795d4: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 34795d8: 39015ff8     	strb	w24, [sp, #0x57]
 34795dc: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 34795e0: f940080a     	ldr	x10, [x0, #0x10]
 34795e4: eb0a013f     	cmp	x9, x10
 34795e8: 5400c3c0     	b.eq	0x347ae60 <_ChromeMain+0x3475bc4>
 34795ec: 5280060a     	mov	w10, #0x30              ; =48
 34795f0: 9b0a2139     	madd	x25, x9, x10, x8
 34795f4: b4001799     	cbz	x25, 0x34798e4 <_ChromeMain+0x3474648>
 34795f8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 34795fc: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479600: f9404529     	ldr	x9, [x9, #0x88]
 3479604: eb09011f     	cmp	x8, x9
 3479608: 54000061     	b.ne	0x3479614 <_ChromeMain+0x3474378>
 347960c: aa1503e0     	mov	x0, x21
 3479610: 972e6b3b     	bl	0x142fc <_ChromeMain+0xf060>
 3479614: f9000335     	str	x21, [x25]
 3479618: 39002338     	strb	w24, [x25, #0x8]
 347961c: 3900833f     	strb	wzr, [x25, #0x20]
 3479620: 3900933f     	strb	wzr, [x25, #0x24]
 3479624: 3900a33f     	strb	wzr, [x25, #0x28]
 3479628: 9100c320     	add	x0, x25, #0x30
 347962c: f801433f     	stur	xzr, [x25, #0x14]
 3479630: f800c33f     	stur	xzr, [x25, #0xc]
 3479634: 3900733f     	strb	wzr, [x25, #0x1c]
 3479638: f9400668     	ldr	x8, [x19, #0x8]
 347963c: eb080008     	subs	x8, x0, x8
 3479640: 9344fd08     	asr	x8, x8, #4
 3479644: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479648: f2955569     	movk	x9, #0xaaab
 347964c: 9b097d08     	mul	x8, x8, x9
 3479650: f9000a68     	str	x8, [x19, #0x10]
 3479654: 54001480     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479658: f941b295     	ldr	x21, [x20, #0x360]
 347965c: b40004d5     	cbz	x21, 0x34796f4 <_ChromeMain+0x3474458>
 3479660: f9002ff5     	str	x21, [sp, #0x58]
 3479664: 394eca88     	ldrb	w8, [x20, #0x3b2]
 3479668: 52000118     	eor	w24, w8, #0x1
 347966c: aa1303e0     	mov	x0, x19
 3479670: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479674: 39015ff8     	strb	w24, [sp, #0x57]
 3479678: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347967c: f940080a     	ldr	x10, [x0, #0x10]
 3479680: eb0a013f     	cmp	x9, x10
 3479684: 5400bf80     	b.eq	0x347ae74 <_ChromeMain+0x3475bd8>
 3479688: 5280060a     	mov	w10, #0x30              ; =48
 347968c: 9b0a2139     	madd	x25, x9, x10, x8
 3479690: b40012b9     	cbz	x25, 0x34798e4 <_ChromeMain+0x3474648>
 3479694: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479698: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347969c: f9404529     	ldr	x9, [x9, #0x88]
 34796a0: eb09011f     	cmp	x8, x9
 34796a4: 54000061     	b.ne	0x34796b0 <_ChromeMain+0x3474414>
 34796a8: aa1503e0     	mov	x0, x21
 34796ac: 972e6b14     	bl	0x142fc <_ChromeMain+0xf060>
 34796b0: f9000335     	str	x21, [x25]
 34796b4: 39002338     	strb	w24, [x25, #0x8]
 34796b8: 3900833f     	strb	wzr, [x25, #0x20]
 34796bc: 3900933f     	strb	wzr, [x25, #0x24]
 34796c0: 3900a33f     	strb	wzr, [x25, #0x28]
 34796c4: 9100c320     	add	x0, x25, #0x30
 34796c8: f801433f     	stur	xzr, [x25, #0x14]
 34796cc: f800c33f     	stur	xzr, [x25, #0xc]
 34796d0: 3900733f     	strb	wzr, [x25, #0x1c]
 34796d4: f9400668     	ldr	x8, [x19, #0x8]
 34796d8: eb080008     	subs	x8, x0, x8
 34796dc: 9344fd08     	asr	x8, x8, #4
 34796e0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 34796e4: f2955569     	movk	x9, #0xaaab
 34796e8: 9b097d08     	mul	x8, x8, x9
 34796ec: f9000a68     	str	x8, [x19, #0x10]
 34796f0: 54000fa0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 34796f4: f941ae95     	ldr	x21, [x20, #0x358]
 34796f8: b40004b5     	cbz	x21, 0x347978c <_ChromeMain+0x34744f0>
 34796fc: f9002ff5     	str	x21, [sp, #0x58]
 3479700: 394722b8     	ldrb	w24, [x21, #0x1c8]
 3479704: aa1303e0     	mov	x0, x19
 3479708: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347970c: 39015ff8     	strb	w24, [sp, #0x57]
 3479710: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479714: f940080a     	ldr	x10, [x0, #0x10]
 3479718: eb0a013f     	cmp	x9, x10
 347971c: 5400bb60     	b.eq	0x347ae88 <_ChromeMain+0x3475bec>
 3479720: 5280060a     	mov	w10, #0x30              ; =48
 3479724: 9b0a2139     	madd	x25, x9, x10, x8
 3479728: b4000df9     	cbz	x25, 0x34798e4 <_ChromeMain+0x3474648>
 347972c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479730: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479734: f9404529     	ldr	x9, [x9, #0x88]
 3479738: eb09011f     	cmp	x8, x9
 347973c: 54000061     	b.ne	0x3479748 <_ChromeMain+0x34744ac>
 3479740: aa1503e0     	mov	x0, x21
 3479744: 972e6aee     	bl	0x142fc <_ChromeMain+0xf060>
 3479748: f9000335     	str	x21, [x25]
 347974c: 39002338     	strb	w24, [x25, #0x8]
 3479750: 3900833f     	strb	wzr, [x25, #0x20]
 3479754: 3900933f     	strb	wzr, [x25, #0x24]
 3479758: 3900a33f     	strb	wzr, [x25, #0x28]
 347975c: 9100c320     	add	x0, x25, #0x30
 3479760: f801433f     	stur	xzr, [x25, #0x14]
 3479764: f800c33f     	stur	xzr, [x25, #0xc]
 3479768: 3900733f     	strb	wzr, [x25, #0x1c]
 347976c: f9400668     	ldr	x8, [x19, #0x8]
 3479770: eb080008     	subs	x8, x0, x8
 3479774: 9344fd08     	asr	x8, x8, #4
 3479778: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347977c: f2955569     	movk	x9, #0xaaab
 3479780: 9b097d08     	mul	x8, x8, x9
 3479784: f9000a68     	str	x8, [x19, #0x10]
 3479788: 54000ae0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347978c: f941c295     	ldr	x21, [x20, #0x380]
 3479790: b40004d5     	cbz	x21, 0x3479828 <_ChromeMain+0x347458c>
 3479794: f9002ff5     	str	x21, [sp, #0x58]
 3479798: 394722a8     	ldrb	w8, [x21, #0x1c8]
 347979c: aa1303e0     	mov	x0, x19
 34797a0: a9c0a809     	ldp	x9, x10, [x0, #0x8]!
 34797a4: 39015fe8     	strb	w8, [sp, #0x57]
 34797a8: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 34797ac: f940080b     	ldr	x11, [x0, #0x10]
 34797b0: eb0b015f     	cmp	x10, x11
 34797b4: 5400bd80     	b.eq	0x347af64 <_ChromeMain+0x3475cc8>
 34797b8: 5280060b     	mov	w11, #0x30              ; =48
 34797bc: 9b0b2558     	madd	x24, x10, x11, x9
 34797c0: b4000938     	cbz	x24, 0x34798e4 <_ChromeMain+0x3474648>
 34797c4: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 34797c8: b005b9ca     	adrp	x10, 0xebb2000 <dyld_stub_binder+0xebb2000>
 34797cc: f940454a     	ldr	x10, [x10, #0x88]
 34797d0: eb0a013f     	cmp	x9, x10
 34797d4: 54000081     	b.ne	0x34797e4 <_ChromeMain+0x3474548>
 34797d8: aa1503e0     	mov	x0, x21
 34797dc: 972e6ac8     	bl	0x142fc <_ChromeMain+0xf060>
 34797e0: 39415fe8     	ldrb	w8, [sp, #0x57]
 34797e4: f9000315     	str	x21, [x24]
 34797e8: 39002308     	strb	w8, [x24, #0x8]
 34797ec: 3dc013e0     	ldr	q0, [sp, #0x40]
 34797f0: 3c80c300     	stur	q0, [x24, #0xc]
 34797f4: 3900731f     	strb	wzr, [x24, #0x1c]
 34797f8: 3900831f     	strb	wzr, [x24, #0x20]
 34797fc: 3900931f     	strb	wzr, [x24, #0x24]
 3479800: 3900a31f     	strb	wzr, [x24, #0x28]
 3479804: 9100c300     	add	x0, x24, #0x30
 3479808: f9400668     	ldr	x8, [x19, #0x8]
 347980c: eb080008     	subs	x8, x0, x8
 3479810: 9344fd08     	asr	x8, x8, #4
 3479814: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479818: f2955569     	movk	x9, #0xaaab
 347981c: 9b097d08     	mul	x8, x8, x9
 3479820: f9000a68     	str	x8, [x19, #0x10]
 3479824: 54000600     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479828: f941ba94     	ldr	x20, [x20, #0x370]
 347982c: b4000494     	cbz	x20, 0x34798bc <_ChromeMain+0x3474620>
 3479830: f9002ff4     	str	x20, [sp, #0x58]
 3479834: aa1303e0     	mov	x0, x19
 3479838: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347983c: 39015fff     	strb	wzr, [sp, #0x57]
 3479840: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479844: f940080a     	ldr	x10, [x0, #0x10]
 3479848: eb0a013f     	cmp	x9, x10
 347984c: 5400b280     	b.eq	0x347ae9c <_ChromeMain+0x3475c00>
 3479850: 5280060a     	mov	w10, #0x30              ; =48
 3479854: 9b0a2135     	madd	x21, x9, x10, x8
 3479858: b4000475     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 347985c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3479860: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479864: f9404529     	ldr	x9, [x9, #0x88]
 3479868: eb09011f     	cmp	x8, x9
 347986c: 54000061     	b.ne	0x3479878 <_ChromeMain+0x34745dc>
 3479870: aa1403e0     	mov	x0, x20
 3479874: 972e6aa2     	bl	0x142fc <_ChromeMain+0xf060>
 3479878: f90002b4     	str	x20, [x21]
 347987c: 390022bf     	strb	wzr, [x21, #0x8]
 3479880: 390082bf     	strb	wzr, [x21, #0x20]
 3479884: 390092bf     	strb	wzr, [x21, #0x24]
 3479888: 3900a2bf     	strb	wzr, [x21, #0x28]
 347988c: 9100c2a0     	add	x0, x21, #0x30
 3479890: f80142bf     	stur	xzr, [x21, #0x14]
 3479894: f800c2bf     	stur	xzr, [x21, #0xc]
 3479898: 390072bf     	strb	wzr, [x21, #0x1c]
 347989c: f9400668     	ldr	x8, [x19, #0x8]
 34798a0: eb080008     	subs	x8, x0, x8
 34798a4: 9344fd08     	asr	x8, x8, #4
 34798a8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 34798ac: f2955569     	movk	x9, #0xaaab
 34798b0: 9b097d08     	mul	x8, x8, x9
 34798b4: f9000a68     	str	x8, [x19, #0x10]
 34798b8: 54000160     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 34798bc: aa1682e8     	orr	x8, x23, x22, lsl #32
 34798c0: f9000268     	str	x8, [x19]
 34798c4: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 34798c8: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 34798cc: a94957f6     	ldp	x22, x21, [sp, #0x90]
 34798d0: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 34798d4: a94767fa     	ldp	x26, x25, [sp, #0x70]
 34798d8: a9466ffc     	ldp	x28, x27, [sp, #0x60]
 34798dc: 910303ff     	add	sp, sp, #0xc0
 34798e0: d65f03c0     	ret
 34798e4: d4200020     	brk	#0x1
 34798e8: 910ec29b     	add	x27, x20, #0x3b0
 34798ec: 394ec288     	ldrb	w8, [x20, #0x3b0]
 34798f0: 37000d48     	tbnz	w8, #0x0, 0x3479a98 <_ChromeMain+0x34747fc>
 34798f4: 52800019     	mov	w25, #0x0               ; =0
 34798f8: b90033ff     	str	wzr, [sp, #0x30]
 34798fc: 7100039f     	cmp	w28, #0x0
 3479900: 54000ced     	b.le	0x3479a9c <_ChromeMain+0x3474800>
 3479904: b903b69f     	str	wzr, [x20, #0x3b4]
 3479908: aa1403e0     	mov	x0, x20
 347990c: 9437358d     	bl	0x4246f40 <_ChromeMain+0x4241ca4>
 3479910: 0aa07c08     	bic	w8, w0, w0, asr #31
 3479914: 6b08031f     	cmp	w24, w8
 3479918: 1a888318     	csel	w24, w24, w8, hi
 347991c: 394012a8     	ldrb	w8, [x21, #0x4]
 3479920: 34000148     	cbz	w8, 0x3479948 <_ChromeMain+0x34746ac>
 3479924: b943ae88     	ldr	w8, [x20, #0x3ac]
 3479928: 7100051f     	cmp	w8, #0x1
 347992c: 540000eb     	b.lt	0x3479948 <_ChromeMain+0x34746ac>
 3479930: aa1403e0     	mov	x0, x20
 3479934: 943735d3     	bl	0x4247080 <_ChromeMain+0x4241de4>
 3479938: b943ae88     	ldr	w8, [x20, #0x3ac]
 347993c: 0b000108     	add	w8, w8, w0
 3479940: 6b1c011f     	cmp	w8, w28
 3479944: 54008c4a     	b.ge	0x347aacc <_ChromeMain+0x3475830>
 3479948: 394ec688     	ldrb	w8, [x20, #0x3b1]
 347994c: 37000068     	tbnz	w8, #0x0, 0x3479958 <_ChromeMain+0x34746bc>
 3479950: b943ae9b     	ldr	w27, [x20, #0x3ac]
 3479954: 14000002     	b	0x347995c <_ChromeMain+0x34746c0>
 3479958: 5280001b     	mov	w27, #0x0               ; =0
 347995c: 53017f1a     	lsr	w26, w24, #1
 3479960: 52800840     	mov	w0, #0x42               ; =66
 3479964: 974227d7     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 3479968: aa0003f9     	mov	x25, x0
 347996c: f941be96     	ldr	x22, [x20, #0x378]
 3479970: b4004f36     	cbz	x22, 0x347a354 <_ChromeMain+0x34750b8>
 3479974: 394722c8     	ldrb	w8, [x22, #0x1c8]
 3479978: 34004a68     	cbz	w8, 0x347a2c4 <_ChromeMain+0x3475028>
 347997c: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479980: 911bc021     	add	x1, x1, #0x6f0
 3479984: aa1603e0     	mov	x0, x22
 3479988: 974d70be     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347998c: d360fc08     	lsr	x8, x0, #32
 3479990: 4e080c00     	dup.2d	v0, x0
 3479994: b0055609     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 3479998: 3dc01121     	ldr	q1, [x9, #0x40]
 347999c: 6ee14400     	ushl.2d	v0, v0, v1
 34799a0: 0ea12800     	xtn.2s	v0, v0
 34799a4: 8b40fd08     	add	x8, x8, x0, lsr #63
 34799a8: 4b880748     	sub	w8, w26, w8, asr #1
 34799ac: 0aa87d09     	bic	w9, w8, w8, asr #31
 34799b0: 1e270361     	fmov	s1, w27
 34799b4: 4e0c1d01     	mov.s	v1[1], w8
 34799b8: 0f046402     	movi.2s	v2, #0x80, lsl #24
 34799bc: 1e614042     	fneg	d2, d2
 34799c0: 0ea26421     	smax.2s	v1, v1, v2
 34799c4: 290827fb     	stp	w27, w9, [sp, #0x40]
 34799c8: 0ea00c20     	sqadd.2s	v0, v1, v0
 34799cc: 0ea12c00     	sqsub.2s	v0, v0, v1
 34799d0: 6f00e401     	movi.2d	v1, #0000000000000000
 34799d4: 0ea16400     	smax.2s	v0, v0, v1
 34799d8: fd0027e0     	str	d0, [sp, #0x48]
 34799dc: f941be96     	ldr	x22, [x20, #0x378]
 34799e0: aa1303e0     	mov	x0, x19
 34799e4: f9002ff6     	str	x22, [sp, #0x58]
 34799e8: 52800029     	mov	w9, #0x1                ; =1
 34799ec: 39015fe9     	strb	w9, [sp, #0x57]
 34799f0: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 34799f4: f940080a     	ldr	x10, [x0, #0x10]
 34799f8: eb0a013f     	cmp	x9, x10
 34799fc: 540002c0     	b.eq	0x3479a54 <_ChromeMain+0x34747b8>
 3479a00: 5280060a     	mov	w10, #0x30              ; =48
 3479a04: 9b0a2135     	madd	x21, x9, x10, x8
 3479a08: b4fff6f5     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 3479a0c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 3479a10: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479a14: f9404529     	ldr	x9, [x9, #0x88]
 3479a18: eb09011f     	cmp	x8, x9
 3479a1c: 5400b161     	b.ne	0x347b048 <_ChromeMain+0x3475dac>
 3479a20: aa1603e0     	mov	x0, x22
 3479a24: 972e6a36     	bl	0x142fc <_ChromeMain+0xf060>
 3479a28: 39415fe8     	ldrb	w8, [sp, #0x57]
 3479a2c: f90002b6     	str	x22, [x21]
 3479a30: 390022a8     	strb	w8, [x21, #0x8]
 3479a34: 3dc013e0     	ldr	q0, [sp, #0x40]
 3479a38: 3c80c2a0     	stur	q0, [x21, #0xc]
 3479a3c: 390072bf     	strb	wzr, [x21, #0x1c]
 3479a40: 390082bf     	strb	wzr, [x21, #0x20]
 3479a44: 390092bf     	strb	wzr, [x21, #0x24]
 3479a48: 3900a2bf     	strb	wzr, [x21, #0x28]
 3479a4c: 9100c2a0     	add	x0, x21, #0x30
 3479a50: 14000005     	b	0x3479a64 <_ChromeMain+0x34747c8>
 3479a54: 910163e1     	add	x1, sp, #0x58
 3479a58: 91015fe2     	add	x2, sp, #0x57
 3479a5c: 910103e3     	add	x3, sp, #0x40
 3479a60: 974c19b0     	bl	0x780120 <_ChromeMain+0x77ae84>
 3479a64: f9400668     	ldr	x8, [x19, #0x8]
 3479a68: eb080008     	subs	x8, x0, x8
 3479a6c: 9344fd08     	asr	x8, x8, #4
 3479a70: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479a74: f2955569     	movk	x9, #0xaaab
 3479a78: 9b097d08     	mul	x8, x8, x9
 3479a7c: f9000a68     	str	x8, [x19, #0x10]
 3479a80: 54fff320     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479a84: b94043e8     	ldr	w8, [sp, #0x40]
 3479a88: b9404be9     	ldr	w9, [sp, #0x48]
 3479a8c: 0b08013b     	add	w27, w9, w8
 3479a90: 0b190376     	add	w22, w27, w25
 3479a94: 14000231     	b	0x347a358 <_ChromeMain+0x34750bc>
 3479a98: 52800019     	mov	w25, #0x0               ; =0
 3479a9c: 52800028     	mov	w8, #0x1                ; =1
 3479aa0: b903b688     	str	w8, [x20, #0x3b4]
 3479aa4: f941be80     	ldr	x0, [x20, #0x378]
 3479aa8: b4000200     	cbz	x0, 0x3479ae8 <_ChromeMain+0x347484c>
 3479aac: 39472008     	ldrb	w8, [x0, #0x1c8]
 3479ab0: 340001c8     	cbz	w8, 0x3479ae8 <_ChromeMain+0x347484c>
 3479ab4: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479ab8: 9119c021     	add	x1, x1, #0x670
 3479abc: 974d7071     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 3479ac0: d360fc15     	lsr	x21, x0, #32
 3479ac4: 710006bf     	cmp	w21, #0x1
 3479ac8: 540003ab     	b.lt	0x3479b3c <_ChromeMain+0x34748a0>
 3479acc: aa1403e0     	mov	x0, x20
 3479ad0: 9437351c     	bl	0x4246f40 <_ChromeMain+0x4241ca4>
 3479ad4: 4b150008     	sub	w8, w0, w21
 3479ad8: 0b487d08     	add	w8, w8, w8, lsr #31
 3479adc: 13017d09     	asr	w9, w8, #1
 3479ae0: 0aa87d3a     	bic	w26, w9, w8, asr #31
 3479ae4: 14000017     	b	0x3479b40 <_ChromeMain+0x34748a4>
 3479ae8: f941b680     	ldr	x0, [x20, #0x368]
 3479aec: b40000c0     	cbz	x0, 0x3479b04 <_ChromeMain+0x3474868>
 3479af0: 39472008     	ldrb	w8, [x0, #0x1c8]
 3479af4: 34000088     	cbz	w8, 0x3479b04 <_ChromeMain+0x3474868>
 3479af8: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479afc: 911a0021     	add	x1, x1, #0x680
 3479b00: 17ffffef     	b	0x3479abc <_ChromeMain+0x3474820>
 3479b04: f941b280     	ldr	x0, [x20, #0x360]
 3479b08: b40000c0     	cbz	x0, 0x3479b20 <_ChromeMain+0x3474884>
 3479b0c: 394eca88     	ldrb	w8, [x20, #0x3b2]
 3479b10: 37000088     	tbnz	w8, #0x0, 0x3479b20 <_ChromeMain+0x3474884>
 3479b14: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479b18: 911a4021     	add	x1, x1, #0x690
 3479b1c: 17ffffe8     	b	0x3479abc <_ChromeMain+0x3474820>
 3479b20: f941c280     	ldr	x0, [x20, #0x380]
 3479b24: b40000c0     	cbz	x0, 0x3479b3c <_ChromeMain+0x34748a0>
 3479b28: 39472008     	ldrb	w8, [x0, #0x1c8]
 3479b2c: 34000088     	cbz	w8, 0x3479b3c <_ChromeMain+0x34748a0>
 3479b30: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479b34: 911a8021     	add	x1, x1, #0x6a0
 3479b38: 17ffffe1     	b	0x3479abc <_ChromeMain+0x3474820>
 3479b3c: 5280001a     	mov	w26, #0x0               ; =0
 3479b40: b943ae88     	ldr	w8, [x20, #0x3ac]
 3479b44: 7100051f     	cmp	w8, #0x1
 3479b48: 5400008b     	b.lt	0x3479b58 <_ChromeMain+0x34748bc>
 3479b4c: b943aa88     	ldr	w8, [x20, #0x3a8]
 3479b50: 6b08035f     	cmp	w26, w8
 3479b54: 1a88c35a     	csel	w26, w26, w8, gt
 3479b58: f941ba95     	ldr	x21, [x20, #0x370]
 3479b5c: b4000495     	cbz	x21, 0x3479bec <_ChromeMain+0x3474950>
 3479b60: f9002ff5     	str	x21, [sp, #0x58]
 3479b64: aa1303e0     	mov	x0, x19
 3479b68: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479b6c: 39015fff     	strb	wzr, [sp, #0x57]
 3479b70: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479b74: f940080a     	ldr	x10, [x0, #0x10]
 3479b78: eb0a013f     	cmp	x9, x10
 3479b7c: 540099a0     	b.eq	0x347aeb0 <_ChromeMain+0x3475c14>
 3479b80: 5280060a     	mov	w10, #0x30              ; =48
 3479b84: 9b0a2136     	madd	x22, x9, x10, x8
 3479b88: b4ffeaf6     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 3479b8c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479b90: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479b94: f9404529     	ldr	x9, [x9, #0x88]
 3479b98: eb09011f     	cmp	x8, x9
 3479b9c: 54000061     	b.ne	0x3479ba8 <_ChromeMain+0x347490c>
 3479ba0: aa1503e0     	mov	x0, x21
 3479ba4: 972e69d6     	bl	0x142fc <_ChromeMain+0xf060>
 3479ba8: f90002d5     	str	x21, [x22]
 3479bac: 390022df     	strb	wzr, [x22, #0x8]
 3479bb0: 390082df     	strb	wzr, [x22, #0x20]
 3479bb4: 390092df     	strb	wzr, [x22, #0x24]
 3479bb8: 3900a2df     	strb	wzr, [x22, #0x28]
 3479bbc: 9100c2c0     	add	x0, x22, #0x30
 3479bc0: f80142df     	stur	xzr, [x22, #0x14]
 3479bc4: f800c2df     	stur	xzr, [x22, #0xc]
 3479bc8: 390072df     	strb	wzr, [x22, #0x1c]
 3479bcc: f9400668     	ldr	x8, [x19, #0x8]
 3479bd0: eb080008     	subs	x8, x0, x8
 3479bd4: 9344fd08     	asr	x8, x8, #4
 3479bd8: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479bdc: f2955569     	movk	x9, #0xaaab
 3479be0: 9b097d08     	mul	x8, x8, x9
 3479be4: f9000a68     	str	x8, [x19, #0x10]
 3479be8: 54ffe7e0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479bec: f941be95     	ldr	x21, [x20, #0x378]
 3479bf0: b4000e15     	cbz	x21, 0x3479db0 <_ChromeMain+0x3474b14>
 3479bf4: 394722a8     	ldrb	w8, [x21, #0x1c8]
 3479bf8: 350004c8     	cbnz	w8, 0x3479c90 <_ChromeMain+0x34749f4>
 3479bfc: f9002ff5     	str	x21, [sp, #0x58]
 3479c00: aa1303e0     	mov	x0, x19
 3479c04: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479c08: 39015fff     	strb	wzr, [sp, #0x57]
 3479c0c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479c10: f940080a     	ldr	x10, [x0, #0x10]
 3479c14: eb0a013f     	cmp	x9, x10
 3479c18: 54009c00     	b.eq	0x347af98 <_ChromeMain+0x3475cfc>
 3479c1c: 5280060a     	mov	w10, #0x30              ; =48
 3479c20: 9b0a2136     	madd	x22, x9, x10, x8
 3479c24: b4ffe616     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 3479c28: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479c2c: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479c30: f9404529     	ldr	x9, [x9, #0x88]
 3479c34: eb09011f     	cmp	x8, x9
 3479c38: 54009a01     	b.ne	0x347af78 <_ChromeMain+0x3475cdc>
 3479c3c: aa1503e0     	mov	x0, x21
 3479c40: 972e69af     	bl	0x142fc <_ChromeMain+0xf060>
 3479c44: 39415fe8     	ldrb	w8, [sp, #0x57]
 3479c48: f90002d5     	str	x21, [x22]
 3479c4c: 390022c8     	strb	w8, [x22, #0x8]
 3479c50: 3dc013e0     	ldr	q0, [sp, #0x40]
 3479c54: 3c80c2c0     	stur	q0, [x22, #0xc]
 3479c58: 390072df     	strb	wzr, [x22, #0x1c]
 3479c5c: 390082df     	strb	wzr, [x22, #0x20]
 3479c60: 390092df     	strb	wzr, [x22, #0x24]
 3479c64: 3900a2df     	strb	wzr, [x22, #0x28]
 3479c68: 9100c2c0     	add	x0, x22, #0x30
 3479c6c: f9400668     	ldr	x8, [x19, #0x8]
 3479c70: eb080008     	subs	x8, x0, x8
 3479c74: 9344fd08     	asr	x8, x8, #4
 3479c78: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479c7c: f2955569     	movk	x9, #0xaaab
 3479c80: 9b097d08     	mul	x8, x8, x9
 3479c84: f9000a68     	str	x8, [x19, #0x10]
 3479c88: 54000941     	b.ne	0x3479db0 <_ChromeMain+0x3474b14>
 3479c8c: 17ffff16     	b	0x34798e4 <_ChromeMain+0x3474648>
 3479c90: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479c94: 911ac021     	add	x1, x1, #0x6b0
 3479c98: aa1503e0     	mov	x0, x21
 3479c9c: 974d6ff9     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 3479ca0: aa0003f5     	mov	x21, x0
 3479ca4: 9e6702a0     	fmov	d0, x21
 3479ca8: 39400368     	ldrb	w8, [x27]
 3479cac: 370000c8     	tbnz	w8, #0x0, 0x3479cc4 <_ChromeMain+0x3474a28>
 3479cb0: 4b1502e8     	sub	w8, w23, w21
 3479cb4: 0b487d08     	add	w8, w8, w8, lsr #31
 3479cb8: 13017d09     	asr	w9, w8, #1
 3479cbc: 0aa87d28     	bic	w8, w9, w8, asr #31
 3479cc0: 14000002     	b	0x3479cc8 <_ChromeMain+0x3474a2c>
 3479cc4: 52800008     	mov	w8, #0x0                ; =0
 3479cc8: 1e270101     	fmov	s1, w8
 3479ccc: 29086be8     	stp	w8, w26, [sp, #0x40]
 3479cd0: 4e0c1f41     	mov.s	v1[1], w26
 3479cd4: 0ea00c20     	sqadd.2s	v0, v1, v0
 3479cd8: 0ea12c00     	sqsub.2s	v0, v0, v1
 3479cdc: 6f00e401     	movi.2d	v1, #0000000000000000
 3479ce0: 0ea16400     	smax.2s	v0, v0, v1
 3479ce4: fd0027e0     	str	d0, [sp, #0x48]
 3479ce8: f941be96     	ldr	x22, [x20, #0x378]
 3479cec: aa1303e0     	mov	x0, x19
 3479cf0: f9002ff6     	str	x22, [sp, #0x58]
 3479cf4: 52800029     	mov	w9, #0x1                ; =1
 3479cf8: 39015fe9     	strb	w9, [sp, #0x57]
 3479cfc: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479d00: f940080a     	ldr	x10, [x0, #0x10]
 3479d04: eb0a013f     	cmp	x9, x10
 3479d08: 540002c0     	b.eq	0x3479d60 <_ChromeMain+0x3474ac4>
 3479d0c: 5280060a     	mov	w10, #0x30              ; =48
 3479d10: 9b0a213c     	madd	x28, x9, x10, x8
 3479d14: b4ffde9c     	cbz	x28, 0x34798e4 <_ChromeMain+0x3474648>
 3479d18: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 3479d1c: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479d20: f9404529     	ldr	x9, [x9, #0x88]
 3479d24: eb09011f     	cmp	x8, x9
 3479d28: 54009301     	b.ne	0x347af88 <_ChromeMain+0x3475cec>
 3479d2c: aa1603e0     	mov	x0, x22
 3479d30: 972e6973     	bl	0x142fc <_ChromeMain+0xf060>
 3479d34: 39415fe8     	ldrb	w8, [sp, #0x57]
 3479d38: f9000396     	str	x22, [x28]
 3479d3c: 39002388     	strb	w8, [x28, #0x8]
 3479d40: 3dc013e0     	ldr	q0, [sp, #0x40]
 3479d44: 3c80c380     	stur	q0, [x28, #0xc]
 3479d48: 3900739f     	strb	wzr, [x28, #0x1c]
 3479d4c: 3900839f     	strb	wzr, [x28, #0x20]
 3479d50: 3900939f     	strb	wzr, [x28, #0x24]
 3479d54: 3900a39f     	strb	wzr, [x28, #0x28]
 3479d58: 9100c380     	add	x0, x28, #0x30
 3479d5c: 14000005     	b	0x3479d70 <_ChromeMain+0x3474ad4>
 3479d60: 910163e1     	add	x1, sp, #0x58
 3479d64: 91015fe2     	add	x2, sp, #0x57
 3479d68: 910103e3     	add	x3, sp, #0x40
 3479d6c: 974c18ed     	bl	0x780120 <_ChromeMain+0x77ae84>
 3479d70: f9400668     	ldr	x8, [x19, #0x8]
 3479d74: eb080008     	subs	x8, x0, x8
 3479d78: 9344fd08     	asr	x8, x8, #4
 3479d7c: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479d80: f2955569     	movk	x9, #0xaaab
 3479d84: 9b097d08     	mul	x8, x8, x9
 3479d88: f9000a68     	str	x8, [x19, #0x10]
 3479d8c: 54ffdac0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479d90: d360fea8     	lsr	x8, x21, #32
 3479d94: b94043e9     	ldr	w9, [sp, #0x40]
 3479d98: b9404bea     	ldr	w10, [sp, #0x48]
 3479d9c: 0b090149     	add	w9, w10, w9
 3479da0: 0aa97d29     	bic	w9, w9, w9, asr #31
 3479da4: 6b0902ff     	cmp	w23, w9
 3479da8: 1a8982f7     	csel	w23, w23, w9, hi
 3479dac: 0b08035a     	add	w26, w26, w8
 3479db0: f941b680     	ldr	x0, [x20, #0x368]
 3479db4: b40006c0     	cbz	x0, 0x3479e8c <_ChromeMain+0x3474bf0>
 3479db8: 39472008     	ldrb	w8, [x0, #0x1c8]
 3479dbc: 34000688     	cbz	w8, 0x3479e8c <_ChromeMain+0x3474bf0>
 3479dc0: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479dc4: 911b0021     	add	x1, x1, #0x6c0
 3479dc8: 974d6fae     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 3479dcc: aa0003f5     	mov	x21, x0
 3479dd0: 9e6702a0     	fmov	d0, x21
 3479dd4: 39400368     	ldrb	w8, [x27]
 3479dd8: 370000c8     	tbnz	w8, #0x0, 0x3479df0 <_ChromeMain+0x3474b54>
 3479ddc: 4b1502e8     	sub	w8, w23, w21
 3479de0: 0b487d08     	add	w8, w8, w8, lsr #31
 3479de4: 13017d09     	asr	w9, w8, #1
 3479de8: 0aa87d36     	bic	w22, w9, w8, asr #31
 3479dec: 14000002     	b	0x3479df4 <_ChromeMain+0x3474b58>
 3479df0: 52800016     	mov	w22, #0x0               ; =0
 3479df4: 1e2702c1     	fmov	s1, w22
 3479df8: 29086bf6     	stp	w22, w26, [sp, #0x40]
 3479dfc: 4e0c1f41     	mov.s	v1[1], w26
 3479e00: 0ea00c20     	sqadd.2s	v0, v1, v0
 3479e04: 0ea12c00     	sqsub.2s	v0, v0, v1
 3479e08: 6f00e401     	movi.2d	v1, #0000000000000000
 3479e0c: 0ea16400     	smax.2s	v0, v0, v1
 3479e10: 3d800fe0     	str	q0, [sp, #0x30]
 3479e14: fd0027e0     	str	d0, [sp, #0x48]
 3479e18: f941b688     	ldr	x8, [x20, #0x368]
 3479e1c: f9002fe8     	str	x8, [sp, #0x58]
 3479e20: 39472108     	ldrb	w8, [x8, #0x1c8]
 3479e24: 39015fe8     	strb	w8, [sp, #0x57]
 3479e28: a9412668     	ldp	x8, x9, [x19, #0x10]
 3479e2c: eb09011f     	cmp	x8, x9
 3479e30: 54008e41     	b.ne	0x347aff8 <_ChromeMain+0x3475d5c>
 3479e34: 91002260     	add	x0, x19, #0x8
 3479e38: 910163e1     	add	x1, sp, #0x58
 3479e3c: 91015fe2     	add	x2, sp, #0x57
 3479e40: 910103e3     	add	x3, sp, #0x40
 3479e44: 974c18b7     	bl	0x780120 <_ChromeMain+0x77ae84>
 3479e48: f9400668     	ldr	x8, [x19, #0x8]
 3479e4c: eb080008     	subs	x8, x0, x8
 3479e50: 9344fd08     	asr	x8, x8, #4
 3479e54: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479e58: f2955569     	movk	x9, #0xaaab
 3479e5c: 9b097d08     	mul	x8, x8, x9
 3479e60: f9000a68     	str	x8, [x19, #0x10]
 3479e64: 54ffd400     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479e68: d360fea8     	lsr	x8, x21, #32
 3479e6c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 3479e70: 1e260009     	fmov	w9, s0
 3479e74: 0b160129     	add	w9, w9, w22
 3479e78: 0aa97d29     	bic	w9, w9, w9, asr #31
 3479e7c: d503201f     	nop
 3479e80: 6b0902ff     	cmp	w23, w9
 3479e84: 1a8982f7     	csel	w23, w23, w9, hi
 3479e88: 0b08035a     	add	w26, w26, w8
 3479e8c: f941b295     	ldr	x21, [x20, #0x360]
 3479e90: b4000b55     	cbz	x21, 0x3479ff8 <_ChromeMain+0x3474d5c>
 3479e94: 394eca88     	ldrb	w8, [x20, #0x3b2]
 3479e98: 360004a8     	tbz	w8, #0x0, 0x3479f2c <_ChromeMain+0x3474c90>
 3479e9c: f9002ff5     	str	x21, [sp, #0x58]
 3479ea0: aa1303e0     	mov	x0, x19
 3479ea4: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 3479ea8: 39015fff     	strb	wzr, [sp, #0x57]
 3479eac: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 3479eb0: f940080a     	ldr	x10, [x0, #0x10]
 3479eb4: eb0a013f     	cmp	x9, x10
 3479eb8: 54008060     	b.eq	0x347aec4 <_ChromeMain+0x3475c28>
 3479ebc: 5280060a     	mov	w10, #0x30              ; =48
 3479ec0: 9b0a2136     	madd	x22, x9, x10, x8
 3479ec4: b4ffd116     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 3479ec8: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3479ecc: b005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3479ed0: f9404529     	ldr	x9, [x9, #0x88]
 3479ed4: eb09011f     	cmp	x8, x9
 3479ed8: 54000061     	b.ne	0x3479ee4 <_ChromeMain+0x3474c48>
 3479edc: aa1503e0     	mov	x0, x21
 3479ee0: 972e6907     	bl	0x142fc <_ChromeMain+0xf060>
 3479ee4: f90002d5     	str	x21, [x22]
 3479ee8: 390022df     	strb	wzr, [x22, #0x8]
 3479eec: 390082df     	strb	wzr, [x22, #0x20]
 3479ef0: 390092df     	strb	wzr, [x22, #0x24]
 3479ef4: 3900a2df     	strb	wzr, [x22, #0x28]
 3479ef8: 9100c2c0     	add	x0, x22, #0x30
 3479efc: f80142df     	stur	xzr, [x22, #0x14]
 3479f00: f800c2df     	stur	xzr, [x22, #0xc]
 3479f04: 390072df     	strb	wzr, [x22, #0x1c]
 3479f08: f9400668     	ldr	x8, [x19, #0x8]
 3479f0c: eb080008     	subs	x8, x0, x8
 3479f10: 9344fd08     	asr	x8, x8, #4
 3479f14: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479f18: f2955569     	movk	x9, #0xaaab
 3479f1c: 9b097d08     	mul	x8, x8, x9
 3479f20: f9000a68     	str	x8, [x19, #0x10]
 3479f24: 540006a1     	b.ne	0x3479ff8 <_ChromeMain+0x3474d5c>
 3479f28: 17fffe6f     	b	0x34798e4 <_ChromeMain+0x3474648>
 3479f2c: b004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 3479f30: 911b4021     	add	x1, x1, #0x6d0
 3479f34: aa1503e0     	mov	x0, x21
 3479f38: 974d6f52     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 3479f3c: aa0003f5     	mov	x21, x0
 3479f40: 9e6702a0     	fmov	d0, x21
 3479f44: 39400368     	ldrb	w8, [x27]
 3479f48: 370000c8     	tbnz	w8, #0x0, 0x3479f60 <_ChromeMain+0x3474cc4>
 3479f4c: 4b1502e8     	sub	w8, w23, w21
 3479f50: 0b487d08     	add	w8, w8, w8, lsr #31
 3479f54: 13017d09     	asr	w9, w8, #1
 3479f58: 0aa87d36     	bic	w22, w9, w8, asr #31
 3479f5c: 14000002     	b	0x3479f64 <_ChromeMain+0x3474cc8>
 3479f60: 52800016     	mov	w22, #0x0               ; =0
 3479f64: 1e2702c1     	fmov	s1, w22
 3479f68: 29086bf6     	stp	w22, w26, [sp, #0x40]
 3479f6c: 4e0c1f41     	mov.s	v1[1], w26
 3479f70: 0ea00c20     	sqadd.2s	v0, v1, v0
 3479f74: 0ea12c00     	sqsub.2s	v0, v0, v1
 3479f78: 6f00e401     	movi.2d	v1, #0000000000000000
 3479f7c: 0ea16400     	smax.2s	v0, v0, v1
 3479f80: 3d800fe0     	str	q0, [sp, #0x30]
 3479f84: fd0027e0     	str	d0, [sp, #0x48]
 3479f88: f941b288     	ldr	x8, [x20, #0x360]
 3479f8c: f9002fe8     	str	x8, [sp, #0x58]
 3479f90: 52800028     	mov	w8, #0x1                ; =1
 3479f94: 39015fe8     	strb	w8, [sp, #0x57]
 3479f98: a9412668     	ldp	x8, x9, [x19, #0x10]
 3479f9c: eb09011f     	cmp	x8, x9
 3479fa0: 54008401     	b.ne	0x347b020 <_ChromeMain+0x3475d84>
 3479fa4: 91002260     	add	x0, x19, #0x8
 3479fa8: 910163e1     	add	x1, sp, #0x58
 3479fac: 91015fe2     	add	x2, sp, #0x57
 3479fb0: 910103e3     	add	x3, sp, #0x40
 3479fb4: 974c185b     	bl	0x780120 <_ChromeMain+0x77ae84>
 3479fb8: f9400668     	ldr	x8, [x19, #0x8]
 3479fbc: eb080008     	subs	x8, x0, x8
 3479fc0: 9344fd08     	asr	x8, x8, #4
 3479fc4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 3479fc8: f2955569     	movk	x9, #0xaaab
 3479fcc: 9b097d08     	mul	x8, x8, x9
 3479fd0: f9000a68     	str	x8, [x19, #0x10]
 3479fd4: 54ffc880     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 3479fd8: d360fea8     	lsr	x8, x21, #32
 3479fdc: 3dc00fe0     	ldr	q0, [sp, #0x30]
 3479fe0: 1e260009     	fmov	w9, s0
 3479fe4: 0b160129     	add	w9, w9, w22
 3479fe8: 0aa97d29     	bic	w9, w9, w9, asr #31
 3479fec: 6b0902ff     	cmp	w23, w9
 3479ff0: 1a8982f7     	csel	w23, w23, w9, hi
 3479ff4: 0b08035a     	add	w26, w26, w8
 3479ff8: f941c295     	ldr	x21, [x20, #0x380]
 3479ffc: b4000eb5     	cbz	x21, 0x347a1d0 <_ChromeMain+0x3474f34>
 347a000: 394722a8     	ldrb	w8, [x21, #0x1c8]
 347a004: 340009e8     	cbz	w8, 0x347a140 <_ChromeMain+0x3474ea4>
 347a008: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a00c: 911b8021     	add	x1, x1, #0x6e0
 347a010: aa1503e0     	mov	x0, x21
 347a014: 974d6f1b     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a018: aa0003f5     	mov	x21, x0
 347a01c: 9e6702a0     	fmov	d0, x21
 347a020: 39400368     	ldrb	w8, [x27]
 347a024: 370000c8     	tbnz	w8, #0x0, 0x347a03c <_ChromeMain+0x3474da0>
 347a028: 4b1502e8     	sub	w8, w23, w21
 347a02c: 0b487d08     	add	w8, w8, w8, lsr #31
 347a030: 13017d09     	asr	w9, w8, #1
 347a034: 0aa87d28     	bic	w8, w9, w8, asr #31
 347a038: 14000002     	b	0x347a040 <_ChromeMain+0x3474da4>
 347a03c: 52800008     	mov	w8, #0x0                ; =0
 347a040: 1e270101     	fmov	s1, w8
 347a044: 29086be8     	stp	w8, w26, [sp, #0x40]
 347a048: 4e0c1f41     	mov.s	v1[1], w26
 347a04c: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a050: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a054: 6f00e401     	movi.2d	v1, #0000000000000000
 347a058: 0ea16400     	smax.2s	v0, v0, v1
 347a05c: fd0027e0     	str	d0, [sp, #0x48]
 347a060: f941c296     	ldr	x22, [x20, #0x380]
 347a064: aa1303e0     	mov	x0, x19
 347a068: f9002ff6     	str	x22, [sp, #0x58]
 347a06c: 52800029     	mov	w9, #0x1                ; =1
 347a070: 39015fe9     	strb	w9, [sp, #0x57]
 347a074: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a078: f940080a     	ldr	x10, [x0, #0x10]
 347a07c: eb0a013f     	cmp	x9, x10
 347a080: 540002c0     	b.eq	0x347a0d8 <_ChromeMain+0x3474e3c>
 347a084: 5280060a     	mov	w10, #0x30              ; =48
 347a088: 9b0a213b     	madd	x27, x9, x10, x8
 347a08c: b4ffc2db     	cbz	x27, 0x34798e4 <_ChromeMain+0x3474648>
 347a090: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 347a094: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a098: f9404529     	ldr	x9, [x9, #0x88]
 347a09c: eb09011f     	cmp	x8, x9
 347a0a0: 54007781     	b.ne	0x347af90 <_ChromeMain+0x3475cf4>
 347a0a4: aa1603e0     	mov	x0, x22
 347a0a8: 972e6895     	bl	0x142fc <_ChromeMain+0xf060>
 347a0ac: 39415fe8     	ldrb	w8, [sp, #0x57]
 347a0b0: f9000376     	str	x22, [x27]
 347a0b4: 39002368     	strb	w8, [x27, #0x8]
 347a0b8: 3dc013e0     	ldr	q0, [sp, #0x40]
 347a0bc: 3c80c360     	stur	q0, [x27, #0xc]
 347a0c0: 3900737f     	strb	wzr, [x27, #0x1c]
 347a0c4: 3900837f     	strb	wzr, [x27, #0x20]
 347a0c8: 3900937f     	strb	wzr, [x27, #0x24]
 347a0cc: 3900a37f     	strb	wzr, [x27, #0x28]
 347a0d0: 9100c360     	add	x0, x27, #0x30
 347a0d4: 14000005     	b	0x347a0e8 <_ChromeMain+0x3474e4c>
 347a0d8: 910163e1     	add	x1, sp, #0x58
 347a0dc: 91015fe2     	add	x2, sp, #0x57
 347a0e0: 910103e3     	add	x3, sp, #0x40
 347a0e4: 974c180f     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a0e8: f9400668     	ldr	x8, [x19, #0x8]
 347a0ec: eb080008     	subs	x8, x0, x8
 347a0f0: 9344fd08     	asr	x8, x8, #4
 347a0f4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a0f8: f2955569     	movk	x9, #0xaaab
 347a0fc: 9b097d08     	mul	x8, x8, x9
 347a100: f9000a68     	str	x8, [x19, #0x10]
 347a104: 54ffbf00     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a108: d360fea8     	lsr	x8, x21, #32
 347a10c: b94043e9     	ldr	w9, [sp, #0x40]
 347a110: b9404bea     	ldr	w10, [sp, #0x48]
 347a114: 0b090149     	add	w9, w10, w9
 347a118: 0aa97d29     	bic	w9, w9, w9, asr #31
 347a11c: 6b0902ff     	cmp	w23, w9
 347a120: 1a8982f7     	csel	w23, w23, w9, hi
 347a124: 0b08035a     	add	w26, w26, w8
 347a128: 35000579     	cbnz	w25, 0x347a1d4 <_ChromeMain+0x3474f38>
 347a12c: b943ae88     	ldr	w8, [x20, #0x3ac]
 347a130: 11001749     	add	w9, w26, #0x5
 347a134: 7100011f     	cmp	w8, #0x0
 347a138: 1a890348     	csel	w8, w26, w9, eq
 347a13c: 1400005c     	b	0x347a2ac <_ChromeMain+0x3475010>
 347a140: f9002ff5     	str	x21, [sp, #0x58]
 347a144: aa1303e0     	mov	x0, x19
 347a148: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a14c: 39015fff     	strb	wzr, [sp, #0x57]
 347a150: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347a154: f940080a     	ldr	x10, [x0, #0x10]
 347a158: eb0a013f     	cmp	x9, x10
 347a15c: 54007280     	b.eq	0x347afac <_ChromeMain+0x3475d10>
 347a160: 5280060a     	mov	w10, #0x30              ; =48
 347a164: 9b0a2136     	madd	x22, x9, x10, x8
 347a168: b4ffbbf6     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347a16c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 347a170: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a174: f9404529     	ldr	x9, [x9, #0x88]
 347a178: eb09011f     	cmp	x8, x9
 347a17c: 54007021     	b.ne	0x347af80 <_ChromeMain+0x3475ce4>
 347a180: aa1503e0     	mov	x0, x21
 347a184: 972e685e     	bl	0x142fc <_ChromeMain+0xf060>
 347a188: 39415fe8     	ldrb	w8, [sp, #0x57]
 347a18c: f90002d5     	str	x21, [x22]
 347a190: 390022c8     	strb	w8, [x22, #0x8]
 347a194: 3dc013e0     	ldr	q0, [sp, #0x40]
 347a198: 3c80c2c0     	stur	q0, [x22, #0xc]
 347a19c: 390072df     	strb	wzr, [x22, #0x1c]
 347a1a0: 390082df     	strb	wzr, [x22, #0x20]
 347a1a4: 390092df     	strb	wzr, [x22, #0x24]
 347a1a8: 3900a2df     	strb	wzr, [x22, #0x28]
 347a1ac: 9100c2c0     	add	x0, x22, #0x30
 347a1b0: f9400668     	ldr	x8, [x19, #0x8]
 347a1b4: eb080008     	subs	x8, x0, x8
 347a1b8: 9344fd08     	asr	x8, x8, #4
 347a1bc: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a1c0: f2955569     	movk	x9, #0xaaab
 347a1c4: 9b097d08     	mul	x8, x8, x9
 347a1c8: f9000a68     	str	x8, [x19, #0x10]
 347a1cc: 54ffb8c0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a1d0: 34fffaf9     	cbz	w25, 0x347a12c <_ChromeMain+0x3474e90>
 347a1d4: 528007e0     	mov	w0, #0x3f               ; =63
 347a1d8: 974225ba     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 347a1dc: 0b1a0016     	add	w22, w0, w26
 347a1e0: f941ae80     	ldr	x0, [x20, #0x358]
 347a1e4: b943b681     	ldr	w1, [x20, #0x3b4]
 347a1e8: 9416b0d6     	bl	0x3a26540 <_ChromeMain+0x3a212a4>
 347a1ec: aa0003f5     	mov	x21, x0
 347a1f0: 4e080c00     	dup.2d	v0, x0
 347a1f4: 90055608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a1f8: 3dc01101     	ldr	q1, [x8, #0x40]
 347a1fc: 6ee14400     	ushl.2d	v0, v0, v1
 347a200: 0ea12800     	xtn.2s	v0, v0
 347a204: 4b1502e8     	sub	w8, w23, w21
 347a208: 0b487d08     	add	w8, w8, w8, lsr #31
 347a20c: 13017d09     	asr	w9, w8, #1
 347a210: 0aa87d39     	bic	w25, w9, w8, asr #31
 347a214: 1e270321     	fmov	s1, w25
 347a218: 29085bf9     	stp	w25, w22, [sp, #0x40]
 347a21c: 4e0c1ec1     	mov.s	v1[1], w22
 347a220: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a224: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a228: 6f00e401     	movi.2d	v1, #0000000000000000
 347a22c: 0ea16400     	smax.2s	v0, v0, v1
 347a230: 3d800fe0     	str	q0, [sp, #0x30]
 347a234: fd0027e0     	str	d0, [sp, #0x48]
 347a238: f941ae88     	ldr	x8, [x20, #0x358]
 347a23c: f9002fe8     	str	x8, [sp, #0x58]
 347a240: 39472108     	ldrb	w8, [x8, #0x1c8]
 347a244: 39015fe8     	strb	w8, [sp, #0x57]
 347a248: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a24c: eb09011f     	cmp	x8, x9
 347a250: 54006c01     	b.ne	0x347afd0 <_ChromeMain+0x3475d34>
 347a254: 91002260     	add	x0, x19, #0x8
 347a258: 910163e1     	add	x1, sp, #0x58
 347a25c: 91015fe2     	add	x2, sp, #0x57
 347a260: 910103e3     	add	x3, sp, #0x40
 347a264: 974c17af     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a268: f9400668     	ldr	x8, [x19, #0x8]
 347a26c: eb080008     	subs	x8, x0, x8
 347a270: 9344fd08     	asr	x8, x8, #4
 347a274: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a278: f2955569     	movk	x9, #0xaaab
 347a27c: 9b097d08     	mul	x8, x8, x9
 347a280: f9000a68     	str	x8, [x19, #0x10]
 347a284: 54ffb300     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a288: d360fea8     	lsr	x8, x21, #32
 347a28c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 347a290: 1e260009     	fmov	w9, s0
 347a294: 0b190129     	add	w9, w9, w25
 347a298: 0aa97d29     	bic	w9, w9, w9, asr #31
 347a29c: 6b0902ff     	cmp	w23, w9
 347a2a0: 1a8982f7     	csel	w23, w23, w9, hi
 347a2a4: 0b0802c8     	add	w8, w22, w8
 347a2a8: 11001508     	add	w8, w8, #0x5
 347a2ac: 0aa87d08     	bic	w8, w8, w8, asr #31
 347a2b0: 6b08031f     	cmp	w24, w8
 347a2b4: 1a888318     	csel	w24, w24, w8, hi
 347a2b8: 2a1703e8     	mov	w8, w23
 347a2bc: aa188108     	orr	x8, x8, x24, lsl #32
 347a2c0: 17fffd80     	b	0x34798c0 <_ChromeMain+0x3474624>
 347a2c4: f9002ff6     	str	x22, [sp, #0x58]
 347a2c8: aa1303e0     	mov	x0, x19
 347a2cc: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a2d0: 39015fff     	strb	wzr, [sp, #0x57]
 347a2d4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347a2d8: f940080a     	ldr	x10, [x0, #0x10]
 347a2dc: eb0a013f     	cmp	x9, x10
 347a2e0: 54006bc0     	b.eq	0x347b058 <_ChromeMain+0x3475dbc>
 347a2e4: 5280060a     	mov	w10, #0x30              ; =48
 347a2e8: 9b0a2135     	madd	x21, x9, x10, x8
 347a2ec: b4ffafd5     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 347a2f0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 347a2f4: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a2f8: f9404529     	ldr	x9, [x9, #0x88]
 347a2fc: eb09011f     	cmp	x8, x9
 347a300: 54006601     	b.ne	0x347afc0 <_ChromeMain+0x3475d24>
 347a304: aa1603e0     	mov	x0, x22
 347a308: 972e67fd     	bl	0x142fc <_ChromeMain+0xf060>
 347a30c: 39415fe8     	ldrb	w8, [sp, #0x57]
 347a310: f90002b6     	str	x22, [x21]
 347a314: 390022a8     	strb	w8, [x21, #0x8]
 347a318: 3dc013e0     	ldr	q0, [sp, #0x40]
 347a31c: 3c80c2a0     	stur	q0, [x21, #0xc]
 347a320: 390072bf     	strb	wzr, [x21, #0x1c]
 347a324: 390082bf     	strb	wzr, [x21, #0x20]
 347a328: 390092bf     	strb	wzr, [x21, #0x24]
 347a32c: 3900a2bf     	strb	wzr, [x21, #0x28]
 347a330: 9100c2a0     	add	x0, x21, #0x30
 347a334: f9400668     	ldr	x8, [x19, #0x8]
 347a338: eb080008     	subs	x8, x0, x8
 347a33c: 9344fd08     	asr	x8, x8, #4
 347a340: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a344: f2955569     	movk	x9, #0xaaab
 347a348: 9b097d08     	mul	x8, x8, x9
 347a34c: f9000a68     	str	x8, [x19, #0x10]
 347a350: 54ffaca0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a354: aa1b03f6     	mov	x22, x27
 347a358: f941b680     	ldr	x0, [x20, #0x368]
 347a35c: b9002ff9     	str	w25, [sp, #0x2c]
 347a360: b4000760     	cbz	x0, 0x347a44c <_ChromeMain+0x34751b0>
 347a364: 39472008     	ldrb	w8, [x0, #0x1c8]
 347a368: 34000728     	cbz	w8, 0x347a44c <_ChromeMain+0x34751b0>
 347a36c: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a370: 911c0021     	add	x1, x1, #0x700
 347a374: 974d6e43     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a378: d360fc08     	lsr	x8, x0, #32
 347a37c: 4e080c00     	dup.2d	v0, x0
 347a380: 90055609     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a384: 3dc01121     	ldr	q1, [x9, #0x40]
 347a388: 6ee14400     	ushl.2d	v0, v0, v1
 347a38c: 0ea12800     	xtn.2s	v0, v0
 347a390: 8b40fd08     	add	x8, x8, x0, lsr #63
 347a394: 4b880748     	sub	w8, w26, w8, asr #1
 347a398: 1e2702c1     	fmov	s1, w22
 347a39c: 4e0c1d01     	mov.s	v1[1], w8
 347a3a0: 0aa87d15     	bic	w21, w8, w8, asr #31
 347a3a4: 0f046402     	movi.2s	v2, #0x80, lsl #24
 347a3a8: 1e614042     	fneg	d2, d2
 347a3ac: 0ea26421     	smax.2s	v1, v1, v2
 347a3b0: 290857f6     	stp	w22, w21, [sp, #0x40]
 347a3b4: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a3b8: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a3bc: 6f00e401     	movi.2d	v1, #0000000000000000
 347a3c0: 0ea16400     	smax.2s	v0, v0, v1
 347a3c4: 3d8007e0     	str	q0, [sp, #0x10]
 347a3c8: fd0027e0     	str	d0, [sp, #0x48]
 347a3cc: f941b688     	ldr	x8, [x20, #0x368]
 347a3d0: f9002fe8     	str	x8, [sp, #0x58]
 347a3d4: 39472108     	ldrb	w8, [x8, #0x1c8]
 347a3d8: 39015fe8     	strb	w8, [sp, #0x57]
 347a3dc: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a3e0: eb09011f     	cmp	x8, x9
 347a3e4: 540068a1     	b.ne	0x347b0f8 <_ChromeMain+0x3475e5c>
 347a3e8: 91002260     	add	x0, x19, #0x8
 347a3ec: 910163e1     	add	x1, sp, #0x58
 347a3f0: 91015fe2     	add	x2, sp, #0x57
 347a3f4: 910103e3     	add	x3, sp, #0x40
 347a3f8: 974c174a     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a3fc: f9400668     	ldr	x8, [x19, #0x8]
 347a400: eb080008     	subs	x8, x0, x8
 347a404: 9344fd08     	asr	x8, x8, #4
 347a408: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a40c: f2955569     	movk	x9, #0xaaab
 347a410: 9b097d08     	mul	x8, x8, x9
 347a414: f9000a68     	str	x8, [x19, #0x10]
 347a418: 54ffa660     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a41c: 3dc007e0     	ldr	q0, [sp, #0x10]
 347a420: 1e260008     	fmov	w8, s0
 347a424: 0b16011b     	add	w27, w8, w22
 347a428: 0b190376     	add	w22, w27, w25
 347a42c: 0e0c3c19     	mov.s	w25, v0[1]
 347a430: 528007e0     	mov	w0, #0x3f               ; =63
 347a434: 97422523     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 347a438: 0b0002a8     	add	w8, w21, w0
 347a43c: 0b08032a     	add	w10, w25, w8
 347a440: 14000004     	b	0x347a450 <_ChromeMain+0x34751b4>
 347a444: 5280001c     	mov	w28, #0x0               ; =0
 347a448: 14000044     	b	0x347a558 <_ChromeMain+0x34752bc>
 347a44c: 5280000a     	mov	w10, #0x0               ; =0
 347a450: f941b280     	ldr	x0, [x20, #0x360]
 347a454: b4000740     	cbz	x0, 0x347a53c <_ChromeMain+0x34752a0>
 347a458: 394eca88     	ldrb	w8, [x20, #0x3b2]
 347a45c: 52000108     	eor	w8, w8, #0x1
 347a460: b94033e9     	ldr	w9, [sp, #0x30]
 347a464: 6a08013f     	tst	w9, w8
 347a468: 540006a0     	b.eq	0x347a53c <_ChromeMain+0x34752a0>
 347a46c: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a470: 911c4021     	add	x1, x1, #0x710
 347a474: 974d6e03     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a478: d360fc08     	lsr	x8, x0, #32
 347a47c: 4e080c00     	dup.2d	v0, x0
 347a480: 90055609     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a484: 3dc01121     	ldr	q1, [x9, #0x40]
 347a488: 6ee14400     	ushl.2d	v0, v0, v1
 347a48c: 0ea12800     	xtn.2s	v0, v0
 347a490: 8b40fd08     	add	x8, x8, x0, lsr #63
 347a494: 4b880748     	sub	w8, w26, w8, asr #1
 347a498: 1e2702c1     	fmov	s1, w22
 347a49c: 4e0c1d01     	mov.s	v1[1], w8
 347a4a0: 0aa87d15     	bic	w21, w8, w8, asr #31
 347a4a4: 0f046402     	movi.2s	v2, #0x80, lsl #24
 347a4a8: 1e614042     	fneg	d2, d2
 347a4ac: 0ea26421     	smax.2s	v1, v1, v2
 347a4b0: 290857f6     	stp	w22, w21, [sp, #0x40]
 347a4b4: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a4b8: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a4bc: 6f00e401     	movi.2d	v1, #0000000000000000
 347a4c0: 0ea16400     	smax.2s	v0, v0, v1
 347a4c4: 3d8007e0     	str	q0, [sp, #0x10]
 347a4c8: fd0027e0     	str	d0, [sp, #0x48]
 347a4cc: f941b288     	ldr	x8, [x20, #0x360]
 347a4d0: f9002fe8     	str	x8, [sp, #0x58]
 347a4d4: 52800028     	mov	w8, #0x1                ; =1
 347a4d8: 39015fe8     	strb	w8, [sp, #0x57]
 347a4dc: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a4e0: eb09011f     	cmp	x8, x9
 347a4e4: 54005e21     	b.ne	0x347b0a8 <_ChromeMain+0x3475e0c>
 347a4e8: 91002260     	add	x0, x19, #0x8
 347a4ec: 910163e1     	add	x1, sp, #0x58
 347a4f0: 91015fe2     	add	x2, sp, #0x57
 347a4f4: 910103e3     	add	x3, sp, #0x40
 347a4f8: 974c170a     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a4fc: f9400668     	ldr	x8, [x19, #0x8]
 347a500: eb080008     	subs	x8, x0, x8
 347a504: 9344fd08     	asr	x8, x8, #4
 347a508: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a50c: f2955569     	movk	x9, #0xaaab
 347a510: 9b097d08     	mul	x8, x8, x9
 347a514: f9000a68     	str	x8, [x19, #0x10]
 347a518: 54ff9e60     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a51c: 3dc007e0     	ldr	q0, [sp, #0x10]
 347a520: 1e260008     	fmov	w8, s0
 347a524: 0b16011b     	add	w27, w8, w22
 347a528: 0e0c3c16     	mov.s	w22, v0[1]
 347a52c: 528007e0     	mov	w0, #0x3f               ; =63
 347a530: 974224e4     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 347a534: 0b0002a8     	add	w8, w21, w0
 347a538: 0b0802ca     	add	w10, w22, w8
 347a53c: b90013ea     	str	w10, [sp, #0x10]
 347a540: b943ae88     	ldr	w8, [x20, #0x3ac]
 347a544: 34fff808     	cbz	w8, 0x347a444 <_ChromeMain+0x34751a8>
 347a548: aa1403e0     	mov	x0, x20
 347a54c: 943732cd     	bl	0x4247080 <_ChromeMain+0x4241de4>
 347a550: 6b00039f     	cmp	w28, w0
 347a554: 1a9fa7fc     	cset	w28, lt
 347a558: f941b296     	ldr	x22, [x20, #0x360]
 347a55c: aa1703f9     	mov	x25, x23
 347a560: aa1703f5     	mov	x21, x23
 347a564: b4000bf6     	cbz	x22, 0x347a6e0 <_ChromeMain+0x3475444>
 347a568: 394eca88     	ldrb	w8, [x20, #0x3b2]
 347a56c: b94033e9     	ldr	w9, [sp, #0x30]
 347a570: 2a080128     	orr	w8, w9, w8
 347a574: 360004e8     	tbz	w8, #0x0, 0x347a610 <_ChromeMain+0x3475374>
 347a578: f9002ff6     	str	x22, [sp, #0x58]
 347a57c: aa1303e0     	mov	x0, x19
 347a580: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a584: 39015fff     	strb	wzr, [sp, #0x57]
 347a588: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347a58c: f940080a     	ldr	x10, [x0, #0x10]
 347a590: eb0a013f     	cmp	x9, x10
 347a594: 54004ac0     	b.eq	0x347aeec <_ChromeMain+0x3475c50>
 347a598: 5280060a     	mov	w10, #0x30              ; =48
 347a59c: 9b0a2135     	madd	x21, x9, x10, x8
 347a5a0: b4ff9a35     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 347a5a4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 347a5a8: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a5ac: f9404529     	ldr	x9, [x9, #0x88]
 347a5b0: eb09011f     	cmp	x8, x9
 347a5b4: 54000061     	b.ne	0x347a5c0 <_ChromeMain+0x3475324>
 347a5b8: aa1603e0     	mov	x0, x22
 347a5bc: 972e6750     	bl	0x142fc <_ChromeMain+0xf060>
 347a5c0: f90002b6     	str	x22, [x21]
 347a5c4: 390022bf     	strb	wzr, [x21, #0x8]
 347a5c8: 390082bf     	strb	wzr, [x21, #0x20]
 347a5cc: 390092bf     	strb	wzr, [x21, #0x24]
 347a5d0: 3900a2bf     	strb	wzr, [x21, #0x28]
 347a5d4: 9100c2a0     	add	x0, x21, #0x30
 347a5d8: f80142bf     	stur	xzr, [x21, #0x14]
 347a5dc: f800c2bf     	stur	xzr, [x21, #0xc]
 347a5e0: 390072bf     	strb	wzr, [x21, #0x1c]
 347a5e4: f9400668     	ldr	x8, [x19, #0x8]
 347a5e8: eb080008     	subs	x8, x0, x8
 347a5ec: 9344fd08     	asr	x8, x8, #4
 347a5f0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a5f4: f2955569     	movk	x9, #0xaaab
 347a5f8: 9b097d08     	mul	x8, x8, x9
 347a5fc: f9000a68     	str	x8, [x19, #0x10]
 347a600: 54ff9720     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a604: aa1703f9     	mov	x25, x23
 347a608: aa1703f5     	mov	x21, x23
 347a60c: 14000035     	b	0x347a6e0 <_ChromeMain+0x3475444>
 347a610: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a614: 911c8021     	add	x1, x1, #0x720
 347a618: aa1603e0     	mov	x0, x22
 347a61c: 974d6d99     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a620: d360fc08     	lsr	x8, x0, #32
 347a624: 4e080c00     	dup.2d	v0, x0
 347a628: 90055609     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a62c: 3dc01121     	ldr	q1, [x9, #0x40]
 347a630: 6ee14400     	ushl.2d	v0, v0, v1
 347a634: 0ea12800     	xtn.2s	v0, v0
 347a638: 8b40fd08     	add	x8, x8, x0, lsr #63
 347a63c: 4b880748     	sub	w8, w26, w8, asr #1
 347a640: 4b0002e9     	sub	w9, w23, w0
 347a644: 1e270121     	fmov	s1, w9
 347a648: 0aa87d09     	bic	w9, w8, w8, asr #31
 347a64c: 4e0c1d01     	mov.s	v1[1], w8
 347a650: 6f00e402     	movi.2d	v2, #0000000000000000
 347a654: 0ea26421     	smax.2s	v1, v1, v2
 347a658: 52800048     	mov	w8, #0x2                ; =2
 347a65c: 9e670103     	fmov	d3, x8
 347a660: 0ea38421     	add.2s	v1, v1, v3
 347a664: bd0043e1     	str	s1, [sp, #0x40]
 347a668: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a66c: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a670: 1e260036     	fmov	w22, s1
 347a674: b90047e9     	str	w9, [sp, #0x44]
 347a678: 0ea26400     	smax.2s	v0, v0, v2
 347a67c: fd0027e0     	str	d0, [sp, #0x48]
 347a680: f941b288     	ldr	x8, [x20, #0x360]
 347a684: f9002fe8     	str	x8, [sp, #0x58]
 347a688: 52800028     	mov	w8, #0x1                ; =1
 347a68c: 39015fe8     	strb	w8, [sp, #0x57]
 347a690: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a694: eb09011f     	cmp	x8, x9
 347a698: b9402ff9     	ldr	w25, [sp, #0x2c]
 347a69c: 540051a1     	b.ne	0x347b0d0 <_ChromeMain+0x3475e34>
 347a6a0: 91002260     	add	x0, x19, #0x8
 347a6a4: 910163e1     	add	x1, sp, #0x58
 347a6a8: 91015fe2     	add	x2, sp, #0x57
 347a6ac: 910103e3     	add	x3, sp, #0x40
 347a6b0: 974c169c     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a6b4: f9400668     	ldr	x8, [x19, #0x8]
 347a6b8: eb080008     	subs	x8, x0, x8
 347a6bc: 9344fd08     	asr	x8, x8, #4
 347a6c0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a6c4: f2955569     	movk	x9, #0xaaab
 347a6c8: 9b097d08     	mul	x8, x8, x9
 347a6cc: f9000a68     	str	x8, [x19, #0x10]
 347a6d0: 54ff90a0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a6d4: 4b1902d5     	sub	w21, w22, w25
 347a6d8: 6b1702df     	cmp	w22, w23
 347a6dc: 1a97b2d9     	csel	w25, w22, w23, lt
 347a6e0: f941c296     	ldr	x22, [x20, #0x380]
 347a6e4: b4000f56     	cbz	x22, 0x347a8cc <_ChromeMain+0x3475630>
 347a6e8: 394722c8     	ldrb	w8, [x22, #0x1c8]
 347a6ec: 35000588     	cbnz	w8, 0x347a79c <_ChromeMain+0x3475500>
 347a6f0: b9000ffb     	str	w27, [sp, #0xc]
 347a6f4: aa1c03fb     	mov	x27, x28
 347a6f8: aa1a03fc     	mov	x28, x26
 347a6fc: f9002ff6     	str	x22, [sp, #0x58]
 347a700: aa1303e0     	mov	x0, x19
 347a704: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a708: 39015fff     	strb	wzr, [sp, #0x57]
 347a70c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347a710: f940080a     	ldr	x10, [x0, #0x10]
 347a714: eb0a013f     	cmp	x9, x10
 347a718: 54004aa0     	b.eq	0x347b06c <_ChromeMain+0x3475dd0>
 347a71c: 5280060a     	mov	w10, #0x30              ; =48
 347a720: 9b0a213a     	madd	x26, x9, x10, x8
 347a724: b4ff8e1a     	cbz	x26, 0x34798e4 <_ChromeMain+0x3474648>
 347a728: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 347a72c: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a730: f9404529     	ldr	x9, [x9, #0x88]
 347a734: eb09011f     	cmp	x8, x9
 347a738: 54004481     	b.ne	0x347afc8 <_ChromeMain+0x3475d2c>
 347a73c: aa1603e0     	mov	x0, x22
 347a740: 972e66ef     	bl	0x142fc <_ChromeMain+0xf060>
 347a744: 39415fe8     	ldrb	w8, [sp, #0x57]
 347a748: f9000356     	str	x22, [x26]
 347a74c: 39002348     	strb	w8, [x26, #0x8]
 347a750: 3dc013e0     	ldr	q0, [sp, #0x40]
 347a754: 3c80c340     	stur	q0, [x26, #0xc]
 347a758: 3900735f     	strb	wzr, [x26, #0x1c]
 347a75c: 3900835f     	strb	wzr, [x26, #0x20]
 347a760: 3900935f     	strb	wzr, [x26, #0x24]
 347a764: 3900a35f     	strb	wzr, [x26, #0x28]
 347a768: 9100c340     	add	x0, x26, #0x30
 347a76c: f9400668     	ldr	x8, [x19, #0x8]
 347a770: eb080008     	subs	x8, x0, x8
 347a774: 9344fd08     	asr	x8, x8, #4
 347a778: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a77c: f2955569     	movk	x9, #0xaaab
 347a780: 9b097d08     	mul	x8, x8, x9
 347a784: f9000a68     	str	x8, [x19, #0x10]
 347a788: 54ff8ae0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a78c: aa1c03fa     	mov	x26, x28
 347a790: aa1b03fc     	mov	x28, x27
 347a794: b9400ffb     	ldr	w27, [sp, #0xc]
 347a798: 1400004d     	b	0x347a8cc <_ChromeMain+0x3475630>
 347a79c: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a7a0: 911cc021     	add	x1, x1, #0x730
 347a7a4: aa1603e0     	mov	x0, x22
 347a7a8: 974d6d36     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a7ac: 4e080c00     	dup.2d	v0, x0
 347a7b0: 90055608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a7b4: 3dc01101     	ldr	q1, [x8, #0x40]
 347a7b8: 6ee14400     	ushl.2d	v0, v0, v1
 347a7bc: 0ea12800     	xtn.2s	v0, v0
 347a7c0: 4b0002a8     	sub	w8, w21, w0
 347a7c4: 0aa87d08     	bic	w8, w8, w8, asr #31
 347a7c8: 7100039f     	cmp	w28, #0x0
 347a7cc: 1a8813e8     	csel	w8, wzr, w8, ne
 347a7d0: d360fc09     	lsr	x9, x0, #32
 347a7d4: 8b40fd29     	add	x9, x9, x0, lsr #63
 347a7d8: 4b890749     	sub	w9, w26, w9, asr #1
 347a7dc: 0aa97d29     	bic	w9, w9, w9, asr #31
 347a7e0: 7200039f     	tst	w28, #0x1
 347a7e4: b94013ea     	ldr	w10, [sp, #0x10]
 347a7e8: 1a891149     	csel	w9, w10, w9, ne
 347a7ec: 1e270101     	fmov	s1, w8
 347a7f0: 290827e8     	stp	w8, w9, [sp, #0x40]
 347a7f4: 4e0c1d21     	mov.s	v1[1], w9
 347a7f8: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a7fc: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a800: 6f00e401     	movi.2d	v1, #0000000000000000
 347a804: 0ea16400     	smax.2s	v0, v0, v1
 347a808: fd0027e0     	str	d0, [sp, #0x48]
 347a80c: f941c296     	ldr	x22, [x20, #0x380]
 347a810: aa1303e0     	mov	x0, x19
 347a814: f9002ff6     	str	x22, [sp, #0x58]
 347a818: 52800029     	mov	w9, #0x1                ; =1
 347a81c: 39015fe9     	strb	w9, [sp, #0x57]
 347a820: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347a824: f940080a     	ldr	x10, [x0, #0x10]
 347a828: eb0a013f     	cmp	x9, x10
 347a82c: 540002c0     	b.eq	0x347a884 <_ChromeMain+0x34755e8>
 347a830: 5280060a     	mov	w10, #0x30              ; =48
 347a834: 9b0a2135     	madd	x21, x9, x10, x8
 347a838: b4ff8575     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 347a83c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 347a840: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347a844: f9404529     	ldr	x9, [x9, #0x88]
 347a848: eb09011f     	cmp	x8, x9
 347a84c: 54004021     	b.ne	0x347b050 <_ChromeMain+0x3475db4>
 347a850: aa1603e0     	mov	x0, x22
 347a854: 972e66aa     	bl	0x142fc <_ChromeMain+0xf060>
 347a858: 39415fe8     	ldrb	w8, [sp, #0x57]
 347a85c: f90002b6     	str	x22, [x21]
 347a860: 390022a8     	strb	w8, [x21, #0x8]
 347a864: 3dc013e0     	ldr	q0, [sp, #0x40]
 347a868: 3c80c2a0     	stur	q0, [x21, #0xc]
 347a86c: 390072bf     	strb	wzr, [x21, #0x1c]
 347a870: 390082bf     	strb	wzr, [x21, #0x20]
 347a874: 390092bf     	strb	wzr, [x21, #0x24]
 347a878: 3900a2bf     	strb	wzr, [x21, #0x28]
 347a87c: 9100c2a0     	add	x0, x21, #0x30
 347a880: 14000005     	b	0x347a894 <_ChromeMain+0x34755f8>
 347a884: 910163e1     	add	x1, sp, #0x58
 347a888: 91015fe2     	add	x2, sp, #0x57
 347a88c: 910103e3     	add	x3, sp, #0x40
 347a890: 974c1624     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a894: f9400668     	ldr	x8, [x19, #0x8]
 347a898: eb080008     	subs	x8, x0, x8
 347a89c: 9344fd08     	asr	x8, x8, #4
 347a8a0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a8a4: f2955569     	movk	x9, #0xaaab
 347a8a8: 9b097d08     	mul	x8, x8, x9
 347a8ac: f9000a68     	str	x8, [x19, #0x10]
 347a8b0: 54ff81a0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a8b4: b94043e8     	ldr	w8, [sp, #0x40]
 347a8b8: 6b19011f     	cmp	w8, w25
 347a8bc: 1a99b119     	csel	w25, w8, w25, lt
 347a8c0: b9402fe9     	ldr	w9, [sp, #0x2c]
 347a8c4: 4b090108     	sub	w8, w8, w9
 347a8c8: 0aa87d15     	bic	w21, w8, w8, asr #31
 347a8cc: b94033e8     	ldr	w8, [sp, #0x30]
 347a8d0: 34000668     	cbz	w8, 0x347a99c <_ChromeMain+0x3475700>
 347a8d4: f941ae80     	ldr	x0, [x20, #0x358]
 347a8d8: b943b681     	ldr	w1, [x20, #0x3b4]
 347a8dc: 9416af19     	bl	0x3a26540 <_ChromeMain+0x3a212a4>
 347a8e0: 4e080c00     	dup.2d	v0, x0
 347a8e4: 90055608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 347a8e8: 3dc01101     	ldr	q1, [x8, #0x40]
 347a8ec: 6ee14400     	ushl.2d	v0, v0, v1
 347a8f0: 0ea12800     	xtn.2s	v0, v0
 347a8f4: 4b0002a8     	sub	w8, w21, w0
 347a8f8: 0aa87d08     	bic	w8, w8, w8, asr #31
 347a8fc: d503201f     	nop
 347a900: 7100039f     	cmp	w28, #0x0
 347a904: 1a8813f5     	csel	w21, wzr, w8, ne
 347a908: d360fc08     	lsr	x8, x0, #32
 347a90c: 8b40fd08     	add	x8, x8, x0, lsr #63
 347a910: 4b880748     	sub	w8, w26, w8, asr #1
 347a914: 0aa87d08     	bic	w8, w8, w8, asr #31
 347a918: 7200039f     	tst	w28, #0x1
 347a91c: b94013e9     	ldr	w9, [sp, #0x10]
 347a920: 1a881128     	csel	w8, w9, w8, ne
 347a924: 1e2702a1     	fmov	s1, w21
 347a928: 290823f5     	stp	w21, w8, [sp, #0x40]
 347a92c: 4e0c1d01     	mov.s	v1[1], w8
 347a930: 0ea00c20     	sqadd.2s	v0, v1, v0
 347a934: 0ea12c00     	sqsub.2s	v0, v0, v1
 347a938: 6f00e401     	movi.2d	v1, #0000000000000000
 347a93c: 0ea16400     	smax.2s	v0, v0, v1
 347a940: fd0027e0     	str	d0, [sp, #0x48]
 347a944: f941ae88     	ldr	x8, [x20, #0x358]
 347a948: f9002fe8     	str	x8, [sp, #0x58]
 347a94c: 39472108     	ldrb	w8, [x8, #0x1c8]
 347a950: 39015fe8     	strb	w8, [sp, #0x57]
 347a954: a9412668     	ldp	x8, x9, [x19, #0x10]
 347a958: eb09011f     	cmp	x8, x9
 347a95c: 54003921     	b.ne	0x347b080 <_ChromeMain+0x3475de4>
 347a960: 91002260     	add	x0, x19, #0x8
 347a964: 910163e1     	add	x1, sp, #0x58
 347a968: 91015fe2     	add	x2, sp, #0x57
 347a96c: 910103e3     	add	x3, sp, #0x40
 347a970: 974c15ec     	bl	0x780120 <_ChromeMain+0x77ae84>
 347a974: f9400668     	ldr	x8, [x19, #0x8]
 347a978: eb080008     	subs	x8, x0, x8
 347a97c: 9344fd08     	asr	x8, x8, #4
 347a980: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347a984: f2955569     	movk	x9, #0xaaab
 347a988: 9b097d08     	mul	x8, x8, x9
 347a98c: f9000a68     	str	x8, [x19, #0x10]
 347a990: 54ff7aa0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347a994: 6b1902bf     	cmp	w21, w25
 347a998: 1a99b2b9     	csel	w25, w21, w25, lt
 347a99c: f941ba80     	ldr	x0, [x20, #0x370]
 347a9a0: b4ffc8c0     	cbz	x0, 0x347a2b8 <_ChromeMain+0x347501c>
 347a9a4: 9004d461     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 347a9a8: 911d0021     	add	x1, x1, #0x740
 347a9ac: 974d6cb5     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 347a9b0: d360fc09     	lsr	x9, x0, #32
 347a9b4: 9e670000     	fmov	d0, x0
 347a9b8: b943ae8a     	ldr	w10, [x20, #0x3ac]
 347a9bc: 11003148     	add	w8, w10, #0xc
 347a9c0: f941ba94     	ldr	x20, [x20, #0x370]
 347a9c4: b946d68b     	ldr	w11, [x20, #0x6d4]
 347a9c8: 7100097f     	cmp	w11, #0x2
 347a9cc: 540001c1     	b.ne	0x347aa04 <_ChromeMain+0x3475768>
 347a9d0: 52800015     	mov	w21, #0x0               ; =0
 347a9d4: 7100055f     	cmp	w10, #0x1
 347a9d8: 1a9fa78a     	csinc	w10, w28, wzr, ge
 347a9dc: 3700016a     	tbnz	w10, #0x0, 0x347aa08 <_ChromeMain+0x347576c>
 347a9e0: b9402feb     	ldr	w11, [sp, #0x2c]
 347a9e4: 0b0b036a     	add	w10, w27, w11
 347a9e8: 6b0a011f     	cmp	w8, w10
 347a9ec: 540000eb     	b.lt	0x347aa08 <_ChromeMain+0x347576c>
 347a9f0: 0b00010a     	add	w10, w8, w0
 347a9f4: 4b0b032b     	sub	w11, w25, w11
 347a9f8: 6b0b015f     	cmp	w10, w11
 347a9fc: 1a9fc7f5     	cset	w21, le
 347aa00: 14000002     	b	0x347aa08 <_ChromeMain+0x347576c>
 347aa04: 52800015     	mov	w21, #0x0               ; =0
 347aa08: 39015ff5     	strb	w21, [sp, #0x57]
 347aa0c: 0b497d29     	add	w9, w9, w9, lsr #31
 347aa10: 4b890749     	sub	w9, w26, w9, asr #1
 347aa14: 1e270101     	fmov	s1, w8
 347aa18: 4e0c1d21     	mov.s	v1[1], w9
 347aa1c: 0aa97d29     	bic	w9, w9, w9, asr #31
 347aa20: 0f046402     	movi.2s	v2, #0x80, lsl #24
 347aa24: 1e614042     	fneg	d2, d2
 347aa28: 0ea26421     	smax.2s	v1, v1, v2
 347aa2c: 290827e8     	stp	w8, w9, [sp, #0x40]
 347aa30: 0ea00c20     	sqadd.2s	v0, v1, v0
 347aa34: 0ea12c00     	sqsub.2s	v0, v0, v1
 347aa38: 6f00e401     	movi.2d	v1, #0000000000000000
 347aa3c: 0ea16400     	smax.2s	v0, v0, v1
 347aa40: fd0027e0     	str	d0, [sp, #0x48]
 347aa44: aa1303e0     	mov	x0, x19
 347aa48: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347aa4c: f9002ff4     	str	x20, [sp, #0x58]
 347aa50: f940080a     	ldr	x10, [x0, #0x10]
 347aa54: eb0a013f     	cmp	x9, x10
 347aa58: 54002400     	b.eq	0x347aed8 <_ChromeMain+0x3475c3c>
 347aa5c: 5280060a     	mov	w10, #0x30              ; =48
 347aa60: 9b0a2136     	madd	x22, x9, x10, x8
 347aa64: b4ff7416     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347aa68: 925e7688     	and	x8, x20, #0xfffffffc00000000
 347aa6c: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347aa70: f9404529     	ldr	x9, [x9, #0x88]
 347aa74: eb09011f     	cmp	x8, x9
 347aa78: 54000061     	b.ne	0x347aa84 <_ChromeMain+0x34757e8>
 347aa7c: aa1403e0     	mov	x0, x20
 347aa80: 972e661f     	bl	0x142fc <_ChromeMain+0xf060>
 347aa84: f90002d4     	str	x20, [x22]
 347aa88: 390022d5     	strb	w21, [x22, #0x8]
 347aa8c: 3dc013e0     	ldr	q0, [sp, #0x40]
 347aa90: 3c80c2c0     	stur	q0, [x22, #0xc]
 347aa94: 390072df     	strb	wzr, [x22, #0x1c]
 347aa98: 390082df     	strb	wzr, [x22, #0x20]
 347aa9c: 390092df     	strb	wzr, [x22, #0x24]
 347aaa0: 3900a2df     	strb	wzr, [x22, #0x28]
 347aaa4: 9100c2c0     	add	x0, x22, #0x30
 347aaa8: f9400668     	ldr	x8, [x19, #0x8]
 347aaac: eb080008     	subs	x8, x0, x8
 347aab0: 9344fd08     	asr	x8, x8, #4
 347aab4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347aab8: f2955569     	movk	x9, #0xaaab
 347aabc: 9b097d08     	mul	x8, x8, x9
 347aac0: f9000a68     	str	x8, [x19, #0x10]
 347aac4: 54ffbfa1     	b.ne	0x347a2b8 <_ChromeMain+0x347501c>
 347aac8: 17fffb87     	b	0x34798e4 <_ChromeMain+0x3474648>
 347aacc: aa1882e8     	orr	x8, x23, x24, lsl #32
 347aad0: f9000268     	str	x8, [x19]
 347aad4: f941be95     	ldr	x21, [x20, #0x378]
 347aad8: b40004d5     	cbz	x21, 0x347ab70 <_ChromeMain+0x34758d4>
 347aadc: f9002ff5     	str	x21, [sp, #0x58]
 347aae0: 394722a8     	ldrb	w8, [x21, #0x1c8]
 347aae4: aa1303e0     	mov	x0, x19
 347aae8: a9c0a809     	ldp	x9, x10, [x0, #0x8]!
 347aaec: 39015fe8     	strb	w8, [sp, #0x57]
 347aaf0: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347aaf4: f940080b     	ldr	x11, [x0, #0x10]
 347aaf8: eb0b015f     	cmp	x10, x11
 347aafc: 54003140     	b.eq	0x347b124 <_ChromeMain+0x3475e88>
 347ab00: 5280060b     	mov	w11, #0x30              ; =48
 347ab04: 9b0b2556     	madd	x22, x10, x11, x9
 347ab08: b4ff6ef6     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347ab0c: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 347ab10: 9005b9ca     	adrp	x10, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347ab14: f940454a     	ldr	x10, [x10, #0x88]
 347ab18: eb0a013f     	cmp	x9, x10
 347ab1c: 54000081     	b.ne	0x347ab2c <_ChromeMain+0x3475890>
 347ab20: aa1503e0     	mov	x0, x21
 347ab24: 972e65f6     	bl	0x142fc <_ChromeMain+0xf060>
 347ab28: 39415fe8     	ldrb	w8, [sp, #0x57]
 347ab2c: f90002d5     	str	x21, [x22]
 347ab30: 390022c8     	strb	w8, [x22, #0x8]
 347ab34: 3dc013e0     	ldr	q0, [sp, #0x40]
 347ab38: 3c80c2c0     	stur	q0, [x22, #0xc]
 347ab3c: 390072df     	strb	wzr, [x22, #0x1c]
 347ab40: 390082df     	strb	wzr, [x22, #0x20]
 347ab44: 390092df     	strb	wzr, [x22, #0x24]
 347ab48: 3900a2df     	strb	wzr, [x22, #0x28]
 347ab4c: 9100c2c0     	add	x0, x22, #0x30
 347ab50: f9400668     	ldr	x8, [x19, #0x8]
 347ab54: eb080008     	subs	x8, x0, x8
 347ab58: 9344fd08     	asr	x8, x8, #4
 347ab5c: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347ab60: f2955569     	movk	x9, #0xaaab
 347ab64: 9b097d08     	mul	x8, x8, x9
 347ab68: f9000a68     	str	x8, [x19, #0x10]
 347ab6c: 54ff6bc0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347ab70: f941b695     	ldr	x21, [x20, #0x368]
 347ab74: b4000495     	cbz	x21, 0x347ac04 <_ChromeMain+0x3475968>
 347ab78: f9002ff5     	str	x21, [sp, #0x58]
 347ab7c: aa1303e0     	mov	x0, x19
 347ab80: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347ab84: 39015fff     	strb	wzr, [sp, #0x57]
 347ab88: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347ab8c: f940080a     	ldr	x10, [x0, #0x10]
 347ab90: eb0a013f     	cmp	x9, x10
 347ab94: 54001b60     	b.eq	0x347af00 <_ChromeMain+0x3475c64>
 347ab98: 5280060a     	mov	w10, #0x30              ; =48
 347ab9c: 9b0a2136     	madd	x22, x9, x10, x8
 347aba0: b4ff6a36     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347aba4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 347aba8: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347abac: f9404529     	ldr	x9, [x9, #0x88]
 347abb0: eb09011f     	cmp	x8, x9
 347abb4: 54000061     	b.ne	0x347abc0 <_ChromeMain+0x3475924>
 347abb8: aa1503e0     	mov	x0, x21
 347abbc: 972e65d0     	bl	0x142fc <_ChromeMain+0xf060>
 347abc0: f90002d5     	str	x21, [x22]
 347abc4: 390022df     	strb	wzr, [x22, #0x8]
 347abc8: 390082df     	strb	wzr, [x22, #0x20]
 347abcc: 390092df     	strb	wzr, [x22, #0x24]
 347abd0: 3900a2df     	strb	wzr, [x22, #0x28]
 347abd4: 9100c2c0     	add	x0, x22, #0x30
 347abd8: f80142df     	stur	xzr, [x22, #0x14]
 347abdc: f800c2df     	stur	xzr, [x22, #0xc]
 347abe0: 390072df     	strb	wzr, [x22, #0x1c]
 347abe4: f9400668     	ldr	x8, [x19, #0x8]
 347abe8: eb080008     	subs	x8, x0, x8
 347abec: 9344fd08     	asr	x8, x8, #4
 347abf0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347abf4: f2955569     	movk	x9, #0xaaab
 347abf8: 9b097d08     	mul	x8, x8, x9
 347abfc: f9000a68     	str	x8, [x19, #0x10]
 347ac00: 54ff6720     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347ac04: f941b295     	ldr	x21, [x20, #0x360]
 347ac08: b4000495     	cbz	x21, 0x347ac98 <_ChromeMain+0x34759fc>
 347ac0c: f9002ff5     	str	x21, [sp, #0x58]
 347ac10: aa1303e0     	mov	x0, x19
 347ac14: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347ac18: 39015fff     	strb	wzr, [sp, #0x57]
 347ac1c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347ac20: f940080a     	ldr	x10, [x0, #0x10]
 347ac24: eb0a013f     	cmp	x9, x10
 347ac28: 54001760     	b.eq	0x347af14 <_ChromeMain+0x3475c78>
 347ac2c: 5280060a     	mov	w10, #0x30              ; =48
 347ac30: 9b0a2136     	madd	x22, x9, x10, x8
 347ac34: b4ff6596     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347ac38: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 347ac3c: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347ac40: f9404529     	ldr	x9, [x9, #0x88]
 347ac44: eb09011f     	cmp	x8, x9
 347ac48: 54000061     	b.ne	0x347ac54 <_ChromeMain+0x34759b8>
 347ac4c: aa1503e0     	mov	x0, x21
 347ac50: 972e65ab     	bl	0x142fc <_ChromeMain+0xf060>
 347ac54: f90002d5     	str	x21, [x22]
 347ac58: 390022df     	strb	wzr, [x22, #0x8]
 347ac5c: 390082df     	strb	wzr, [x22, #0x20]
 347ac60: 390092df     	strb	wzr, [x22, #0x24]
 347ac64: 3900a2df     	strb	wzr, [x22, #0x28]
 347ac68: 9100c2c0     	add	x0, x22, #0x30
 347ac6c: f80142df     	stur	xzr, [x22, #0x14]
 347ac70: f800c2df     	stur	xzr, [x22, #0xc]
 347ac74: 390072df     	strb	wzr, [x22, #0x1c]
 347ac78: f9400668     	ldr	x8, [x19, #0x8]
 347ac7c: eb080008     	subs	x8, x0, x8
 347ac80: 9344fd08     	asr	x8, x8, #4
 347ac84: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347ac88: f2955569     	movk	x9, #0xaaab
 347ac8c: 9b097d08     	mul	x8, x8, x9
 347ac90: f9000a68     	str	x8, [x19, #0x10]
 347ac94: 54ff6280     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347ac98: f941ae95     	ldr	x21, [x20, #0x358]
 347ac9c: b4000495     	cbz	x21, 0x347ad2c <_ChromeMain+0x3475a90>
 347aca0: f9002ff5     	str	x21, [sp, #0x58]
 347aca4: aa1303e0     	mov	x0, x19
 347aca8: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347acac: 39015fff     	strb	wzr, [sp, #0x57]
 347acb0: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347acb4: f940080a     	ldr	x10, [x0, #0x10]
 347acb8: eb0a013f     	cmp	x9, x10
 347acbc: 54001360     	b.eq	0x347af28 <_ChromeMain+0x3475c8c>
 347acc0: 5280060a     	mov	w10, #0x30              ; =48
 347acc4: 9b0a2136     	madd	x22, x9, x10, x8
 347acc8: b4ff60f6     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347accc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 347acd0: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347acd4: f9404529     	ldr	x9, [x9, #0x88]
 347acd8: eb09011f     	cmp	x8, x9
 347acdc: 54000061     	b.ne	0x347ace8 <_ChromeMain+0x3475a4c>
 347ace0: aa1503e0     	mov	x0, x21
 347ace4: 972e6586     	bl	0x142fc <_ChromeMain+0xf060>
 347ace8: f90002d5     	str	x21, [x22]
 347acec: 390022df     	strb	wzr, [x22, #0x8]
 347acf0: 390082df     	strb	wzr, [x22, #0x20]
 347acf4: 390092df     	strb	wzr, [x22, #0x24]
 347acf8: 3900a2df     	strb	wzr, [x22, #0x28]
 347acfc: 9100c2c0     	add	x0, x22, #0x30
 347ad00: f80142df     	stur	xzr, [x22, #0x14]
 347ad04: f800c2df     	stur	xzr, [x22, #0xc]
 347ad08: 390072df     	strb	wzr, [x22, #0x1c]
 347ad0c: f9400668     	ldr	x8, [x19, #0x8]
 347ad10: eb080008     	subs	x8, x0, x8
 347ad14: 9344fd08     	asr	x8, x8, #4
 347ad18: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347ad1c: f2955569     	movk	x9, #0xaaab
 347ad20: 9b097d08     	mul	x8, x8, x9
 347ad24: f9000a68     	str	x8, [x19, #0x10]
 347ad28: 54ff5de0     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347ad2c: f941c295     	ldr	x21, [x20, #0x380]
 347ad30: b40004d5     	cbz	x21, 0x347adc8 <_ChromeMain+0x3475b2c>
 347ad34: f9002ff5     	str	x21, [sp, #0x58]
 347ad38: 394722a8     	ldrb	w8, [x21, #0x1c8]
 347ad3c: aa1303e0     	mov	x0, x19
 347ad40: a9c0a809     	ldp	x9, x10, [x0, #0x8]!
 347ad44: 39015fe8     	strb	w8, [sp, #0x57]
 347ad48: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347ad4c: f940080b     	ldr	x11, [x0, #0x10]
 347ad50: eb0b015f     	cmp	x10, x11
 347ad54: 54001f20     	b.eq	0x347b138 <_ChromeMain+0x3475e9c>
 347ad58: 5280060b     	mov	w11, #0x30              ; =48
 347ad5c: 9b0b2556     	madd	x22, x10, x11, x9
 347ad60: b4ff5c36     	cbz	x22, 0x34798e4 <_ChromeMain+0x3474648>
 347ad64: 925e76a9     	and	x9, x21, #0xfffffffc00000000
 347ad68: 9005b9ca     	adrp	x10, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347ad6c: f940454a     	ldr	x10, [x10, #0x88]
 347ad70: eb0a013f     	cmp	x9, x10
 347ad74: 54000081     	b.ne	0x347ad84 <_ChromeMain+0x3475ae8>
 347ad78: aa1503e0     	mov	x0, x21
 347ad7c: 972e6560     	bl	0x142fc <_ChromeMain+0xf060>
 347ad80: 39415fe8     	ldrb	w8, [sp, #0x57]
 347ad84: f90002d5     	str	x21, [x22]
 347ad88: 390022c8     	strb	w8, [x22, #0x8]
 347ad8c: 3dc013e0     	ldr	q0, [sp, #0x40]
 347ad90: 3c80c2c0     	stur	q0, [x22, #0xc]
 347ad94: 390072df     	strb	wzr, [x22, #0x1c]
 347ad98: 390082df     	strb	wzr, [x22, #0x20]
 347ad9c: 390092df     	strb	wzr, [x22, #0x24]
 347ada0: 3900a2df     	strb	wzr, [x22, #0x28]
 347ada4: 9100c2c0     	add	x0, x22, #0x30
 347ada8: f9400668     	ldr	x8, [x19, #0x8]
 347adac: eb080008     	subs	x8, x0, x8
 347adb0: 9344fd08     	asr	x8, x8, #4
 347adb4: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347adb8: f2955569     	movk	x9, #0xaaab
 347adbc: 9b097d08     	mul	x8, x8, x9
 347adc0: f9000a68     	str	x8, [x19, #0x10]
 347adc4: 54ff5900     	b.eq	0x34798e4 <_ChromeMain+0x3474648>
 347adc8: f941ba94     	ldr	x20, [x20, #0x370]
 347adcc: b4ff57d4     	cbz	x20, 0x34798c4 <_ChromeMain+0x3474628>
 347add0: f9002ff4     	str	x20, [sp, #0x58]
 347add4: aa1303e0     	mov	x0, x19
 347add8: a9c0a408     	ldp	x8, x9, [x0, #0x8]!
 347addc: 39015fff     	strb	wzr, [sp, #0x57]
 347ade0: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 347ade4: f940080a     	ldr	x10, [x0, #0x10]
 347ade8: eb0a013f     	cmp	x9, x10
 347adec: 54000a80     	b.eq	0x347af3c <_ChromeMain+0x3475ca0>
 347adf0: 5280060a     	mov	w10, #0x30              ; =48
 347adf4: 9b0a2135     	madd	x21, x9, x10, x8
 347adf8: b4ff5775     	cbz	x21, 0x34798e4 <_ChromeMain+0x3474648>
 347adfc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 347ae00: 9005b9c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 347ae04: f9404529     	ldr	x9, [x9, #0x88]
 347ae08: eb09011f     	cmp	x8, x9
 347ae0c: 54000061     	b.ne	0x347ae18 <_ChromeMain+0x3475b7c>
 347ae10: aa1403e0     	mov	x0, x20
 347ae14: 972e653a     	bl	0x142fc <_ChromeMain+0xf060>
 347ae18: f90002b4     	str	x20, [x21]
 347ae1c: 390022bf     	strb	wzr, [x21, #0x8]
 347ae20: 390082bf     	strb	wzr, [x21, #0x20]
 347ae24: 390092bf     	strb	wzr, [x21, #0x24]
 347ae28: 3900a2bf     	strb	wzr, [x21, #0x28]
 347ae2c: 9100c2a0     	add	x0, x21, #0x30
 347ae30: f80142bf     	stur	xzr, [x21, #0x14]
 347ae34: f800c2bf     	stur	xzr, [x21, #0xc]
 347ae38: 390072bf     	strb	wzr, [x21, #0x1c]
 347ae3c: f9400668     	ldr	x8, [x19, #0x8]
 347ae40: eb080008     	subs	x8, x0, x8
 347ae44: 9344fd08     	asr	x8, x8, #4
 347ae48: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 347ae4c: f2955569     	movk	x9, #0xaaab
 347ae50: 9b097d08     	mul	x8, x8, x9
 347ae54: f9000a68     	str	x8, [x19, #0x10]
 347ae58: 54ff5361     	b.ne	0x34798c4 <_ChromeMain+0x3474628>
 347ae5c: 17fffaa2     	b	0x34798e4 <_ChromeMain+0x3474648>
 347ae60: 910163e1     	add	x1, sp, #0x58
 347ae64: 91015fe2     	add	x2, sp, #0x57
 347ae68: 910103e3     	add	x3, sp, #0x40
 347ae6c: 9432bd95     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347ae70: 17fff9f2     	b	0x3479638 <_ChromeMain+0x347439c>
 347ae74: 910163e1     	add	x1, sp, #0x58
 347ae78: 91015fe2     	add	x2, sp, #0x57
 347ae7c: 910103e3     	add	x3, sp, #0x40
 347ae80: 9432bd90     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347ae84: 17fffa14     	b	0x34796d4 <_ChromeMain+0x3474438>
 347ae88: 910163e1     	add	x1, sp, #0x58
 347ae8c: 91015fe2     	add	x2, sp, #0x57
 347ae90: 910103e3     	add	x3, sp, #0x40
 347ae94: 9432bd8b     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347ae98: 17fffa35     	b	0x347976c <_ChromeMain+0x34744d0>
 347ae9c: 910163e1     	add	x1, sp, #0x58
 347aea0: 91015fe2     	add	x2, sp, #0x57
 347aea4: 910103e3     	add	x3, sp, #0x40
 347aea8: 9432bd86     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347aeac: 17fffa7c     	b	0x347989c <_ChromeMain+0x3474600>
 347aeb0: 910163e1     	add	x1, sp, #0x58
 347aeb4: 91015fe2     	add	x2, sp, #0x57
 347aeb8: 910103e3     	add	x3, sp, #0x40
 347aebc: 9432bd81     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347aec0: 17fffb43     	b	0x3479bcc <_ChromeMain+0x3474930>
 347aec4: 910163e1     	add	x1, sp, #0x58
 347aec8: 91015fe2     	add	x2, sp, #0x57
 347aecc: 910103e3     	add	x3, sp, #0x40
 347aed0: 9432bd7c     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347aed4: 17fffc0d     	b	0x3479f08 <_ChromeMain+0x3474c6c>
 347aed8: 910163e1     	add	x1, sp, #0x58
 347aedc: 91015fe2     	add	x2, sp, #0x57
 347aee0: 910103e3     	add	x3, sp, #0x40
 347aee4: 9432bd77     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347aee8: 17fffef0     	b	0x347aaa8 <_ChromeMain+0x347580c>
 347aeec: 910163e1     	add	x1, sp, #0x58
 347aef0: 91015fe2     	add	x2, sp, #0x57
 347aef4: 910103e3     	add	x3, sp, #0x40
 347aef8: 9432bd72     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347aefc: 17fffdba     	b	0x347a5e4 <_ChromeMain+0x3475348>
 347af00: 910163e1     	add	x1, sp, #0x58
 347af04: 91015fe2     	add	x2, sp, #0x57
 347af08: 910103e3     	add	x3, sp, #0x40
 347af0c: 9432bd6d     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347af10: 17ffff35     	b	0x347abe4 <_ChromeMain+0x3475948>
 347af14: 910163e1     	add	x1, sp, #0x58
 347af18: 91015fe2     	add	x2, sp, #0x57
 347af1c: 910103e3     	add	x3, sp, #0x40
 347af20: 9432bd68     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347af24: 17ffff55     	b	0x347ac78 <_ChromeMain+0x34759dc>
 347af28: 910163e1     	add	x1, sp, #0x58
 347af2c: 91015fe2     	add	x2, sp, #0x57
 347af30: 910103e3     	add	x3, sp, #0x40
 347af34: 9432bd63     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347af38: 17ffff75     	b	0x347ad0c <_ChromeMain+0x3475a70>
 347af3c: 910163e1     	add	x1, sp, #0x58
 347af40: 91015fe2     	add	x2, sp, #0x57
 347af44: 910103e3     	add	x3, sp, #0x40
 347af48: 9432bd5e     	bl	0x412a4c0 <_ChromeMain+0x4125224>
 347af4c: 17ffffbc     	b	0x347ae3c <_ChromeMain+0x3475ba0>
 347af50: 910163e1     	add	x1, sp, #0x58
 347af54: 91015fe2     	add	x2, sp, #0x57
 347af58: 910103e3     	add	x3, sp, #0x40
 347af5c: 9501c9f9     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347af60: 17fff990     	b	0x34795a0 <_ChromeMain+0x3474304>
 347af64: 910163e1     	add	x1, sp, #0x58
 347af68: 91015fe2     	add	x2, sp, #0x57
 347af6c: 910103e3     	add	x3, sp, #0x40
 347af70: 9501c9f4     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347af74: 17fffa25     	b	0x3479808 <_ChromeMain+0x347456c>
 347af78: 52800008     	mov	w8, #0x0                ; =0
 347af7c: 17fffb33     	b	0x3479c48 <_ChromeMain+0x34749ac>
 347af80: 52800008     	mov	w8, #0x0                ; =0
 347af84: 17fffc82     	b	0x347a18c <_ChromeMain+0x3474ef0>
 347af88: 52800028     	mov	w8, #0x1                ; =1
 347af8c: 17fffb6b     	b	0x3479d38 <_ChromeMain+0x3474a9c>
 347af90: 52800028     	mov	w8, #0x1                ; =1
 347af94: 17fffc47     	b	0x347a0b0 <_ChromeMain+0x3474e14>
 347af98: 910163e1     	add	x1, sp, #0x58
 347af9c: 91015fe2     	add	x2, sp, #0x57
 347afa0: 910103e3     	add	x3, sp, #0x40
 347afa4: 9501c9e7     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347afa8: 17fffb31     	b	0x3479c6c <_ChromeMain+0x34749d0>
 347afac: 910163e1     	add	x1, sp, #0x58
 347afb0: 91015fe2     	add	x2, sp, #0x57
 347afb4: 910103e3     	add	x3, sp, #0x40
 347afb8: 9501c9e2     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347afbc: 17fffc7d     	b	0x347a1b0 <_ChromeMain+0x3474f14>
 347afc0: 52800008     	mov	w8, #0x0                ; =0
 347afc4: 17fffcd3     	b	0x347a310 <_ChromeMain+0x3475074>
 347afc8: 52800008     	mov	w8, #0x0                ; =0
 347afcc: 17fffddf     	b	0x347a748 <_ChromeMain+0x34754ac>
 347afd0: f8408269     	ldur	x9, [x19, #0x8]
 347afd4: 5280060a     	mov	w10, #0x30              ; =48
 347afd8: 9b0a2514     	madd	x20, x8, x10, x9
 347afdc: 91002260     	add	x0, x19, #0x8
 347afe0: 910163e1     	add	x1, sp, #0x58
 347afe4: 91015fe2     	add	x2, sp, #0x57
 347afe8: 910103e3     	add	x3, sp, #0x40
 347afec: 9501c985     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347aff0: 9100c280     	add	x0, x20, #0x30
 347aff4: 17fffc9d     	b	0x347a268 <_ChromeMain+0x3474fcc>
 347aff8: f8408269     	ldur	x9, [x19, #0x8]
 347affc: 5280060a     	mov	w10, #0x30              ; =48
 347b000: 9b0a251c     	madd	x28, x8, x10, x9
 347b004: 91002260     	add	x0, x19, #0x8
 347b008: 910163e1     	add	x1, sp, #0x58
 347b00c: 91015fe2     	add	x2, sp, #0x57
 347b010: 910103e3     	add	x3, sp, #0x40
 347b014: 9501c97b     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b018: 9100c380     	add	x0, x28, #0x30
 347b01c: 17fffb8b     	b	0x3479e48 <_ChromeMain+0x3474bac>
 347b020: f8408269     	ldur	x9, [x19, #0x8]
 347b024: 5280060a     	mov	w10, #0x30              ; =48
 347b028: 9b0a251c     	madd	x28, x8, x10, x9
 347b02c: 91002260     	add	x0, x19, #0x8
 347b030: 910163e1     	add	x1, sp, #0x58
 347b034: 91015fe2     	add	x2, sp, #0x57
 347b038: 910103e3     	add	x3, sp, #0x40
 347b03c: 9501c971     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b040: 9100c380     	add	x0, x28, #0x30
 347b044: 17fffbdd     	b	0x3479fb8 <_ChromeMain+0x3474d1c>
 347b048: 52800028     	mov	w8, #0x1                ; =1
 347b04c: 17fffa78     	b	0x3479a2c <_ChromeMain+0x3474790>
 347b050: 52800028     	mov	w8, #0x1                ; =1
 347b054: 17fffe02     	b	0x347a85c <_ChromeMain+0x34755c0>
 347b058: 910163e1     	add	x1, sp, #0x58
 347b05c: 91015fe2     	add	x2, sp, #0x57
 347b060: 910103e3     	add	x3, sp, #0x40
 347b064: 9501c9b7     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347b068: 17fffcb3     	b	0x347a334 <_ChromeMain+0x3475098>
 347b06c: 910163e1     	add	x1, sp, #0x58
 347b070: 91015fe2     	add	x2, sp, #0x57
 347b074: 910103e3     	add	x3, sp, #0x40
 347b078: 9501c9b2     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347b07c: 17fffdbc     	b	0x347a76c <_ChromeMain+0x34754d0>
 347b080: f8408269     	ldur	x9, [x19, #0x8]
 347b084: 5280060a     	mov	w10, #0x30              ; =48
 347b088: 9b0a2516     	madd	x22, x8, x10, x9
 347b08c: 91002260     	add	x0, x19, #0x8
 347b090: 910163e1     	add	x1, sp, #0x58
 347b094: 91015fe2     	add	x2, sp, #0x57
 347b098: 910103e3     	add	x3, sp, #0x40
 347b09c: 9501c959     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b0a0: 9100c2c0     	add	x0, x22, #0x30
 347b0a4: 17fffe34     	b	0x347a974 <_ChromeMain+0x34756d8>
 347b0a8: f8408269     	ldur	x9, [x19, #0x8]
 347b0ac: 5280060a     	mov	w10, #0x30              ; =48
 347b0b0: 9b0a2519     	madd	x25, x8, x10, x9
 347b0b4: 91002260     	add	x0, x19, #0x8
 347b0b8: 910163e1     	add	x1, sp, #0x58
 347b0bc: 91015fe2     	add	x2, sp, #0x57
 347b0c0: 910103e3     	add	x3, sp, #0x40
 347b0c4: 9501c94f     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b0c8: 9100c320     	add	x0, x25, #0x30
 347b0cc: 17fffd0c     	b	0x347a4fc <_ChromeMain+0x3475260>
 347b0d0: f8408269     	ldur	x9, [x19, #0x8]
 347b0d4: 5280060a     	mov	w10, #0x30              ; =48
 347b0d8: 9b0a2515     	madd	x21, x8, x10, x9
 347b0dc: 91002260     	add	x0, x19, #0x8
 347b0e0: 910163e1     	add	x1, sp, #0x58
 347b0e4: 91015fe2     	add	x2, sp, #0x57
 347b0e8: 910103e3     	add	x3, sp, #0x40
 347b0ec: 9501c945     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b0f0: 9100c2a0     	add	x0, x21, #0x30
 347b0f4: 17fffd70     	b	0x347a6b4 <_ChromeMain+0x3475418>
 347b0f8: f8408269     	ldur	x9, [x19, #0x8]
 347b0fc: 5280060a     	mov	w10, #0x30              ; =48
 347b100: 9b0a2519     	madd	x25, x8, x10, x9
 347b104: 91002260     	add	x0, x19, #0x8
 347b108: 910163e1     	add	x1, sp, #0x58
 347b10c: 91015fe2     	add	x2, sp, #0x57
 347b110: 910103e3     	add	x3, sp, #0x40
 347b114: 9501c93b     	bl	0x74ed600 <_ChromeMain+0x74e8364>
 347b118: 9100c320     	add	x0, x25, #0x30
 347b11c: b9402ff9     	ldr	w25, [sp, #0x2c]
 347b120: 17fffcb7     	b	0x347a3fc <_ChromeMain+0x3475160>
 347b124: 910163e1     	add	x1, sp, #0x58
 347b128: 91015fe2     	add	x2, sp, #0x57
 347b12c: 910103e3     	add	x3, sp, #0x40
 347b130: 9501c984     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347b134: 17fffe87     	b	0x347ab50 <_ChromeMain+0x34758b4>
 347b138: 910163e1     	add	x1, sp, #0x58
 347b13c: 91015fe2     	add	x2, sp, #0x57
 347b140: 910103e3     	add	x3, sp, #0x40
 347b144: 9501c97f     	bl	0x74ed740 <_ChromeMain+0x74e84a4>
 347b148: 17ffff18     	b	0x347ada8 <_ChromeMain+0x3475b0c>
 347b14c: d503201f     	nop
 347b150: d503201f     	nop
 347b154: d503201f     	nop
 347b158: d503201f     	nop
 347b15c: d503201f     	nop
 347b160: d503201f     	nop
 347b164: d503201f     	nop
 347b168: d503201f     	nop
 347b16c: d503201f     	nop
 347b170: d503201f     	nop
 347b174: d503201f     	nop
 347b178: d503201f     	nop
 347b17c: d503201f     	nop
 347b180: d10703ff     	sub	sp, sp, #0x1c0
 347b184: a9185ff8     	stp	x24, x23, [sp, #0x180]
 347b188: a91957f6     	stp	x22, x21, [sp, #0x190]
 347b18c: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
 347b190: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
 347b194: 9106c3fd     	add	x29, sp, #0x1b0
 347b198: aa0103f3     	mov	x19, x1
 347b19c: aa0003f5     	mov	x21, x0
 347b1a0: 52800308     	mov	w8, #0x18               ; =24
 347b1a4: f81b03a8     	stur	x8, [x29, #-0x50]
 347b1a8: d005d476     	adrp	x22, 0xef09000 <dyld_stub_binder+0xef09000>
 347b1ac: 395602c0     	ldrb	w0, [x22, #0x580]
 347b1b0: 35001c40     	cbnz	w0, 0x347b538 <_ChromeMain+0x347629c>
 347b1b4: aa1503e0     	mov	x0, x21
 347b1b8: 97969296     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 347b1bc: aa0003f4     	mov	x20, x0
 347b1c0: f9400268     	ldr	x8, [x19]
 347b1c4: f9401909     	ldr	x9, [x8, #0x30]
 347b1c8: d10143a8     	sub	x8, x29, #0x50
 347b1cc: aa1303e0     	mov	x0, x19
 347b1d0: d63f0120     	blr	x9
 347b1d4: 9100c3e8     	add	x8, sp, #0x30
 347b1d8: d10143a0     	sub	x0, x29, #0x50
 347b1dc: 977146b2     	bl	0x10ccca4 <_ChromeMain+0x10c7a08>
 347b1e0: 9100c3e0     	add	x0, sp, #0x30
 347b1e4: 910142a1     	add	x1, x21, #0x50
 347b1e8: 977143c7     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 347b1ec: aa0003f5     	mov	x21, x0
 347b1f0: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 347b1f4: 37f815c8     	tbnz	w8, #0x1f, 0x347b4ac <_ChromeMain+0x3476210>
 347b1f8: 38dc73a8     	ldursb	w8, [x29, #-0x39]
 347b1fc: 37f814e8     	tbnz	w8, #0x1f, 0x347b498 <_ChromeMain+0x34761fc>
 347b200: 36001ad5     	tbz	w21, #0x0, 0x347b558 <_ChromeMain+0x34762bc>
 347b204: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 347b208: f90017ff     	str	xzr, [sp, #0x28]
 347b20c: aa1303e0     	mov	x0, x19
 347b210: 9742ba85     	bl	0x529c24 <_ChromeMain+0x524988>
 347b214: 7100081f     	cmp	w0, #0x2
 347b218: 54001660     	b.eq	0x347b4e4 <_ChromeMain+0x3476248>
 347b21c: f9400268     	ldr	x8, [x19]
 347b220: f9401909     	ldr	x9, [x8, #0x30]
 347b224: 9100c3e8     	add	x8, sp, #0x30
 347b228: aa1303e0     	mov	x0, x19
 347b22c: d63f0120     	blr	x9
 347b230: 9100c3e1     	add	x1, sp, #0x30
 347b234: aa1403e0     	mov	x0, x20
 347b238: 979692b2     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 347b23c: aa0003f5     	mov	x21, x0
 347b240: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 347b244: 37f81208     	tbnz	w8, #0x1f, 0x347b484 <_ChromeMain+0x34761e8>
 347b248: b5002075     	cbnz	x21, 0x347b654 <_ChromeMain+0x34763b8>
 347b24c: 910003f5     	mov	x21, sp
 347b250: 910003e8     	mov	x8, sp
 347b254: aa1403e0     	mov	x0, x20
 347b258: 9400012a     	bl	0x347b700 <_ChromeMain+0x3476464>
 347b25c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 347b260: a9402be9     	ldp	x9, x10, [sp]
 347b264: f100011f     	cmp	x8, #0x0
 347b268: 9a954120     	csel	x0, x9, x21, mi
 347b26c: 7100011f     	cmp	w8, #0x0
 347b270: 9a884141     	csel	x1, x10, x8, mi
 347b274: 9100c3e8     	add	x8, sp, #0x30
 347b278: 976c9ea4     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 347b27c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 347b280: 3dc00fe0     	ldr	q0, [sp, #0x30]
 347b284: 3c9b03a0     	stur	q0, [x29, #-0x50]
 347b288: f94023e9     	ldr	x9, [sp, #0x40]
 347b28c: f81c03a9     	stur	x9, [x29, #-0x40]
 347b290: 39011fff     	strb	wzr, [sp, #0x47]
 347b294: 3900c3ff     	strb	wzr, [sp, #0x30]
 347b298: 36f800a8     	tbz	w8, #0x1f, 0x347b2ac <_ChromeMain+0x3476010>
 347b29c: f94003e0     	ldr	x0, [sp]
 347b2a0: f9400be8     	ldr	x8, [sp, #0x10]
 347b2a4: d37ff901     	lsl	x1, x8, #1
 347b2a8: 972e3704     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 347b2ac: 52800354     	mov	w20, #0x1a              ; =26
 347b2b0: f9400268     	ldr	x8, [x19]
 347b2b4: f940b508     	ldr	x8, [x8, #0x168]
 347b2b8: aa1303e0     	mov	x0, x19
 347b2bc: d63f0100     	blr	x8
 347b2c0: f004d361     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 347b2c4: 910c9021     	add	x1, x1, #0x324
 347b2c8: 52800282     	mov	w2, #0x14               ; =20
 347b2cc: 97410660     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 347b2d0: b40000e0     	cbz	x0, 0x347b2ec <_ChromeMain+0x3476050>
 347b2d4: aa0003e1     	mov	x1, x0
 347b2d8: f9401008     	ldr	x8, [x0, #0x20]
 347b2dc: b4000f28     	cbz	x8, 0x347b4c0 <_ChromeMain+0x3476224>
 347b2e0: f9400900     	ldr	x0, [x8, #0x10]
 347b2e4: 9777e699     	bl	0x1274d48 <_ChromeMain+0x126faac>
 347b2e8: 340001e0     	cbz	w0, 0x347b324 <_ChromeMain+0x3476088>
 347b2ec: f9400268     	ldr	x8, [x19]
 347b2f0: f940b508     	ldr	x8, [x8, #0x168]
 347b2f4: aa1303e0     	mov	x0, x19
 347b2f8: d63f0100     	blr	x8
 347b2fc: b90033f4     	str	w20, [sp, #0x30]
