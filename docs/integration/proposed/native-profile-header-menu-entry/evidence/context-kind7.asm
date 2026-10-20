
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45760d4: 39805ea1     	ldrsb	x1, [x21, #0x17]
 45760d8: b6f80041     	tbz	x1, #0x3f, 0x45760e0 <_ChromeMain+0x4570e44>
 45760dc: a94006b5     	ldp	x21, x1, [x21]
 45760e0: 910803e8     	add	x8, sp, #0x200
 45760e4: aa1503e0     	mov	x0, x21
 45760e8: 9717cca4     	bl	0xb69378 <_ChromeMain+0xb640dc>
 45760ec: 52801900     	mov	w0, #0xc8               ; =200
 45760f0: 94000a87     	bl	0x4578b0c <_ChromeMain+0x4573870>
 45760f4: aa0003fc     	mov	x28, x0
 45760f8: 52800400     	mov	w0, #0x20               ; =32
 45760fc: 96ea649b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4576100: 91005809     	add	x9, x0, #0x16
 4576104: eb00013f     	cmp	x9, x0
 4576108: 54ff5d63     	b.lo	0x4574cb4 <_ChromeMain+0x456fa18>
 457610c: b004d088     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4576110: 91105908     	add	x8, x8, #0x416
 4576114: eb08013f     	cmp	x9, x8
 4576118: fa488002     	ccmp	x0, x8, #0x2, hi
 457611c: 54ff5cc9     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 4576120: 3dc00100     	ldr	q0, [x8]
 4576124: 3d800000     	str	q0, [x0]
 4576128: f840e108     	ldur	x8, [x8, #0xe]
 457612c: f800e008     	stur	x8, [x0, #0xe]
 4576130: 79002c1f     	strh	wzr, [x0, #0x16]
 4576134: 52800108     	mov	w8, #0x8                ; =8
 4576138: b901cbe8     	str	w8, [sp, #0x1c8]
 457613c: 6f00e400     	movi.2d	v0, #0000000000000000
 4576140: 3c8c8260     	stur	q0, [x19, #0xc8]
 4576144: 3c8b8260     	stur	q0, [x19, #0xb8]
 4576148: 3c8a8260     	stur	q0, [x19, #0xa8]
 457614c: 3c898260     	stur	q0, [x19, #0x98]
 4576150: 3c888260     	stur	q0, [x19, #0x88]
 4576154: 3c878260     	stur	q0, [x19, #0x78]
 4576158: 3c868260     	stur	q0, [x19, #0x68]
 457615c: 3c858260     	stur	q0, [x19, #0x58]
 4576160: 3c848260     	stur	q0, [x19, #0x48]
 4576164: f90113e0     	str	x0, [sp, #0x220]
 4576168: d004ce48     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 457616c: 3dc3b101     	ldr	q1, [x8, #0xec0]
 4576170: 3c808261     	stur	q1, [x19, #0x8]
 4576174: d00522f5     	adrp	x21, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4576178: 913ac2b5     	add	x21, x21, #0xeb0
 457617c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4576180: 3c818260     	stur	q0, [x19, #0x18]
 4576184: 3c828260     	stur	q0, [x19, #0x28]
 4576188: 3c838260     	stur	q0, [x19, #0x38]
 457618c: 900531f8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4576190: f9404709     	ldr	x9, [x24, #0x88]
 4576194: eb09011f     	cmp	x8, x9
 4576198: 54000081     	b.ne	0x45761a8 <_ChromeMain+0x4570f0c>
 457619c: d00522e0     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 45761a0: 913ac000     	add	x0, x0, #0xeb0
 45761a4: 96ea7856     	bl	0x142fc <_ChromeMain+0xf060>
 45761a8: f90137f5     	str	x21, [sp, #0x268]
 45761ac: f9013bff     	str	xzr, [sp, #0x270]
 45761b0: d2ffffe8     	mov	x8, #-0x1000000000000   ; =-281474976710656
 45761b4: f9013fff     	str	xzr, [sp, #0x278]
 45761b8: f90143e8     	str	x8, [sp, #0x280]
 45761bc: 52800028     	mov	w8, #0x1                ; =1
 45761c0: 390a23e8     	strb	w8, [sp, #0x288]
 45761c4: f9014bff     	str	xzr, [sp, #0x290]
 45761c8: 390a63ff     	strb	wzr, [sp, #0x298]
 45761cc: f9015bff     	str	xzr, [sp, #0x2b0]
 45761d0: f90153ff     	str	xzr, [sp, #0x2a0]
 45761d4: f90157ff     	str	xzr, [sp, #0x2a8]
 45761d8: 52801ba8     	mov	w8, #0xdd               ; =221
 45761dc: b902bbe8     	str	w8, [sp, #0x2b8]
 45761e0: 390af3ff     	strb	wzr, [sp, #0x2bc]
 45761e4: f9016bff     	str	xzr, [sp, #0x2d0]
 45761e8: f90163ff     	str	xzr, [sp, #0x2c0]
 45761ec: f90167ff     	str	xzr, [sp, #0x2c8]
 45761f0: 390b63ff     	strb	wzr, [sp, #0x2d8]
 45761f4: 0f000420     	movi.2s	v0, #0x1
 45761f8: bc0b9260     	stur	s0, [x19, #0xb9]
 45761fc: d2c00408     	mov	x8, #0x2000000000       ; =137438953472
 4576200: f90173e8     	str	x8, [sp, #0x2e0]
 4576204: 52800208     	mov	w8, #0x10               ; =16
 4576208: b902ebe8     	str	w8, [sp, #0x2e8]
 457620c: f9017bff     	str	xzr, [sp, #0x2f0]
 4576210: f90093ff     	str	xzr, [sp, #0x120]
 4576214: 52800048     	mov	w8, #0x2                ; =2
 4576218: 3904a3e8     	strb	w8, [sp, #0x128]
 457621c: 910883e0     	add	x0, sp, #0x220
 4576220: 910483e1     	add	x1, sp, #0x120
 4576224: 94000d97     	bl	0x4579880 <_ChromeMain+0x45745e4>
 4576228: aa0003f5     	mov	x21, x0
 457622c: 3944a3e8     	ldrb	w8, [sp, #0x128]
 4576230: 7103fd1f     	cmp	w8, #0xff
 4576234: 54000060     	b.eq	0x4576240 <_ChromeMain+0x4570fa4>
 4576238: f94093e0     	ldr	x0, [sp, #0x120]
 457623c: b5fff340     	cbnz	x0, 0x45760a4 <_ChromeMain+0x4570e08>
 4576240: f900f3f5     	str	x21, [sp, #0x1e0]
 4576244: f9418e88     	ldr	x8, [x20, #0x318]
 4576248: f940c517     	ldr	x23, [x8, #0x188]
 457624c: b40000d7     	cbz	x23, 0x4576264 <_ChromeMain+0x4570fc8>
 4576250: 52800029     	mov	w9, #0x1                ; =1
 4576254: b82902e9     	ldadd	w9, w9, [x23]
 4576258: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 457625c: 6b0a013f     	cmp	w9, w10
 4576260: 540105e0     	b.eq	0x457831c <_ChromeMain+0x4573080>
 4576264: f940c91a     	ldr	x26, [x8, #0x190]
 4576268: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 457626c: 36fff2a8     	tbz	w8, #0x1f, 0x45760c0 <_ChromeMain+0x4570e24>
 4576270: f94103e1     	ldr	x1, [sp, #0x200]
 4576274: f94107e2     	ldr	x2, [sp, #0x208]
 4576278: 910483e0     	add	x0, sp, #0x120
 457627c: 96ea87e7     	bl	0x18218 <_ChromeMain+0x12f7c>
 4576280: 52800d00     	mov	w0, #0x68               ; =104
 4576284: 96ea6439     	bl	0xf368 <_ChromeMain+0xa0cc>
 4576288: aa0003f6     	mov	x22, x0
 457628c: 52800028     	mov	w8, #0x1                ; =1
 4576290: 10037c89     	adr	x9, 0x457d220 <_ChromeMain+0x4577f84>
 4576294: d503201f     	nop
 4576298: 1003838a     	adr	x10, 0x457d308 <_ChromeMain+0x457806c>
 457629c: d503201f     	nop
 45762a0: b9000008     	str	w8, [x0]
 45762a4: 90ffd9c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 45762a8: 911b0108     	add	x8, x8, #0x6c0
 45762ac: 10fcc1eb     	adr	x11, 0x456fae8 <_ChromeMain+0x456a84c>
 45762b0: d503201f     	nop
 45762b4: a900a809     	stp	x9, x10, [x0, #0x8]
 45762b8: a901ac08     	stp	x8, x11, [x0, #0x18]
 45762bc: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 45762c0: f9001c1a     	str	x26, [x0, #0x38]
 45762c4: b941cbe8     	ldr	w8, [sp, #0x1c8]
 45762c8: b9004008     	str	w8, [x0, #0x40]
 45762cc: f940f3f7     	ldr	x23, [sp, #0x1e0]
 45762d0: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 45762d4: f9404709     	ldr	x9, [x24, #0x88]
 45762d8: eb09011f     	cmp	x8, x9
 45762dc: 54000061     	b.ne	0x45762e8 <_ChromeMain+0x457104c>
 45762e0: aa1703e0     	mov	x0, x23
 45762e4: 96ea7806     	bl	0x142fc <_ChromeMain+0xf060>
 45762e8: f90026d7     	str	x23, [x22, #0x48]
 45762ec: 3dc01b20     	ldr	q0, [x25, #0x60]
 45762f0: 3d8016c0     	str	q0, [x22, #0x50]
 45762f4: f9409be8     	ldr	x8, [sp, #0x130]
 45762f8: f90032c8     	str	x8, [x22, #0x60]
 45762fc: f0feff39     	adrp	x25, 0x255d000 <_ChromeMain+0x2557d64>
 4576300: 912c0339     	add	x25, x25, #0xb00
 4576304: b5ffe776     	cbnz	x22, 0x4575ff0 <_ChromeMain+0x4570d54>
 4576308: d2800000     	mov	x0, #0x0                ; =0
 457630c: f9425ab7     	ldr	x23, [x21, #0x4b0]
 4576310: f9025aa0     	str	x0, [x21, #0x4b0]
 4576314: b5ffe3f7     	cbnz	x23, 0x4575f90 <_ChromeMain+0x4570cf4>
 4576318: b5ffeb76     	cbnz	x22, 0x4576084 <_ChromeMain+0x4570de8>
 457631c: 52800600     	mov	w0, #0x30               ; =48
 4576320: 96ea6412     	bl	0xf368 <_ChromeMain+0xa0cc>
 4576324: 52800028     	mov	w8, #0x1                ; =1
 4576328: 100267a9     	adr	x9, 0x457b01c <_ChromeMain+0x4575d80>
 457632c: d503201f     	nop
 4576330: b9000008     	str	w8, [x0]
 4576334: 90ffcfe8     	adrp	x8, 0x3f72000 <_ChromeMain+0x3f6cd64>
 4576338: 91250108     	add	x8, x8, #0x940
 457633c: a900a009     	stp	x9, x8, [x0, #0x8]
 4576340: f9000c19     	str	x25, [x0, #0x18]
 4576344: f9001416     	str	x22, [x0, #0x28]
 4576348: f90063e0     	str	x0, [sp, #0xc0]
 457634c: 52800048     	mov	w8, #0x2                ; =2
 4576350: 390323e8     	strb	w8, [sp, #0xc8]
 4576354: f94002a8     	ldr	x8, [x21]
 4576358: f941ed08     	ldr	x8, [x8, #0x3d8]
 457635c: 910303e1     	add	x1, sp, #0xc0
 4576360: aa1503e0     	mov	x0, x21
 4576364: d63f0100     	blr	x8
 4576368: 394323e8     	ldrb	w8, [sp, #0xc8]
 457636c: 7103fd1f     	cmp	w8, #0xff
 4576370: 54000060     	b.eq	0x457637c <_ChromeMain+0x45710e0>
 4576374: f94063e0     	ldr	x0, [sp, #0xc0]
 4576378: b5ffe780     	cbnz	x0, 0x4576068 <_ChromeMain+0x4570dcc>
 457637c: 52801fe8     	mov	w8, #0xff               ; =255
 4576380: 390323e8     	strb	w8, [sp, #0xc8]
 4576384: 910dc288     	add	x8, x20, #0x370
 4576388: f941ba89     	ldr	x9, [x20, #0x370]
 457638c: f941be8a     	ldr	x10, [x20, #0x378]
 4576390: 8b0a1139     	add	x25, x9, x10, lsl #4
 4576394: f900c7f9     	str	x25, [sp, #0x188]
 4576398: f941c289     	ldr	x9, [x20, #0x380]
 457639c: 910623eb     	add	x11, sp, #0x188
 45763a0: 910723ec     	add	x12, sp, #0x1c8
 45763a4: a91233eb     	stp	x11, x12, [sp, #0x120]
 45763a8: 910783eb     	add	x11, sp, #0x1e0
 45763ac: a91323eb     	stp	x11, x8, [sp, #0x130]
 45763b0: eb09015f     	cmp	x10, x9
 45763b4: 5400e380     	b.eq	0x4578024 <_ChromeMain+0x4572d88>
 45763b8: b4ff47f9     	cbz	x25, 0x4574cb4 <_ChromeMain+0x456fa18>
 45763bc: b941cbe8     	ldr	w8, [sp, #0x1c8]
 45763c0: b9000328     	str	w8, [x25]
 45763c4: f940f3f7     	ldr	x23, [sp, #0x1e0]
 45763c8: 925e76e9     	and	x9, x23, #0xfffffffc00000000
 45763cc: f940470a     	ldr	x10, [x24, #0x88]
 45763d0: aa1903e8     	mov	x8, x25
 45763d4: eb0a013f     	cmp	x9, x10
 45763d8: 54000081     	b.ne	0x45763e8 <_ChromeMain+0x457114c>
 45763dc: aa1703e0     	mov	x0, x23
 45763e0: 96ea77c7     	bl	0x142fc <_ChromeMain+0xf060>
 45763e4: f940c7e8     	ldr	x8, [sp, #0x188]
 45763e8: f9000737     	str	x23, [x25, #0x8]
 45763ec: 91004108     	add	x8, x8, #0x10
 45763f0: f900c7e8     	str	x8, [sp, #0x188]
 45763f4: f940c7e8     	ldr	x8, [sp, #0x188]
 45763f8: f941ba89     	ldr	x9, [x20, #0x370]
 45763fc: eb090108     	subs	x8, x8, x9
 4576400: 9344fd08     	asr	x8, x8, #4
 4576404: f901be88     	str	x8, [x20, #0x378]
 4576408: 54ff4560     	b.eq	0x4574cb4 <_ChromeMain+0x456fa18>
 457640c: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4576410: 3500f928     	cbnz	w8, 0x4578334 <_ChromeMain+0x4573098>
 4576414: f940cf82     	ldr	x2, [x28, #0x198]
 4576418: aa1c03e0     	mov	x0, x28
 457641c: aa1503e1     	mov	x1, x21
 4576420: 97080bf7     	bl	0x7793fc <_ChromeMain+0x774160>
 4576424: b5008216     	cbnz	x22, 0x4577464 <_ChromeMain+0x45721c8>
 4576428: 910883e0     	add	x0, sp, #0x220
 457642c: 94001276     	bl	0x457ae04 <_ChromeMain+0x4575b68>
 4576430: 90054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4576434: f9467d00     	ldr	x0, [x8, #0xcf8]
 4576438: b0ffcfd7     	adrp	x23, 0x3f6f000 <_ChromeMain+0x3f69d64>
 457643c: 912102f7     	add	x23, x23, #0x840
 4576440: 90ffd7b8     	adrp	x24, 0x406a000 <_ChromeMain+0x4064d64>
 4576444: 913a0318     	add	x24, x24, #0xe80
 4576448: 90ffd9d6     	adrp	x22, 0x40ae000 <_ChromeMain+0x40a8d64>
 457644c: 911b02d6     	add	x22, x22, #0x6c0
 4576450: b4000cc0     	cbz	x0, 0x45765e8 <_ChromeMain+0x457134c>
 4576454: 9752a5c9     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4576458: b4000c80     	cbz	x0, 0x45765e8 <_ChromeMain+0x457134c>
 457645c: 910803e1     	add	x1, sp, #0x200
 4576460: 9788bc91     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 4576464: b4000c20     	cbz	x0, 0x45765e8 <_ChromeMain+0x457134c>
 4576468: f9400008     	ldr	x8, [x0]
 457646c: f940a508     	ldr	x8, [x8, #0x148]
 4576470: d63f0100     	blr	x8
 4576474: 9744acfe     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 4576478: b4000b80     	cbz	x0, 0x45765e8 <_ChromeMain+0x457134c>
 457647c: aa0003f5     	mov	x21, x0
 4576480: 52800600     	mov	w0, #0x30               ; =48
 4576484: 96ea63b9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4576488: f90113e0     	str	x0, [sp, #0x220]
 457648c: b004ce28     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4576490: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 4576494: 3c808260     	stur	q0, [x19, #0x8]
 4576498: 91008009     	add	x9, x0, #0x20
 457649c: eb00013f     	cmp	x9, x0
 45764a0: 54ff40a3     	b.lo	0x4574cb4 <_ChromeMain+0x456fa18>
 45764a4: d0044688     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 45764a8: 91252508     	add	x8, x8, #0x949
 45764ac: eb08013f     	cmp	x9, x8
 45764b0: fa488002     	ccmp	x0, x8, #0x2, hi
 45764b4: 54ff4009     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 45764b8: ad400500     	ldp	q0, q1, [x8]
 45764bc: ad000400     	stp	q0, q1, [x0]
 45764c0: 3900801f     	strb	wzr, [x0, #0x20]
 45764c4: 910883e1     	add	x1, sp, #0x220
 45764c8: aa1503e0     	mov	x0, x21
 45764cc: 528003e2     	mov	w2, #0x1f               ; =31
 45764d0: 976d3d53     	bl	0x20c5a1c <_ChromeMain+0x20c0780>
 45764d4: aa0003f5     	mov	x21, x0
 45764d8: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 45764dc: 36f800a8     	tbz	w8, #0x1f, 0x45764f0 <_ChromeMain+0x4571254>
 45764e0: f94113e0     	ldr	x0, [sp, #0x220]
 45764e4: f9411be8     	ldr	x8, [sp, #0x230]
 45764e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45764ec: 96ea4a73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45764f0: b40007d5     	cbz	x21, 0x45765e8 <_ChromeMain+0x457134c>
 45764f4: 52800108     	mov	w8, #0x8                ; =8
 45764f8: 3908dfe8     	strb	w8, [sp, #0x237]
 45764fc: 910883e9     	add	x9, sp, #0x220
 4576500: 9100412a     	add	x10, x9, #0x10
 4576504: b004d088     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4576508: 9103c908     	add	x8, x8, #0xf2
 457650c: eb08015f     	cmp	x10, x8
 4576510: fa488122     	ccmp	x9, x8, #0x2, hi
 4576514: 54ff3d09     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 4576518: 3dc00100     	ldr	q0, [x8]
 457651c: 3d800260     	str	q0, [x19]
 4576520: 790463ff     	strh	wzr, [sp, #0x230]
 4576524: f9418e88     	ldr	x8, [x20, #0x318]
 4576528: f940c519     	ldr	x25, [x8, #0x188]
 457652c: b40000d9     	cbz	x25, 0x4576544 <_ChromeMain+0x45712a8>
 4576530: 52800029     	mov	w9, #0x1                ; =1
 4576534: b8290329     	ldadd	w9, w9, [x25]
 4576538: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 457653c: 6b0a013f     	cmp	w9, w10
 4576540: 5400f7a0     	b.eq	0x4578434 <_ChromeMain+0x4573198>
 4576544: f940c913     	ldr	x19, [x8, #0x190]
 4576548: 52800b00     	mov	w0, #0x58               ; =88
 457654c: 96ea6387     	bl	0xf368 <_ChromeMain+0xa0cc>
 4576550: aa0003f5     	mov	x21, x0
 4576554: 52800028     	mov	w8, #0x1                ; =1
 4576558: b9000008     	str	w8, [x0]
 457655c: a900e017     	stp	x23, x24, [x0, #0x8]
 4576560: 10fe1d68     	adr	x8, 0x457290c <_ChromeMain+0x456d670>
 4576564: d503201f     	nop
 4576568: a901a016     	stp	x22, x8, [x0, #0x18]
 457656c: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4576570: f9001c13     	str	x19, [x0, #0x38]
 4576574: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 4576578: 37f8c4a8     	tbnz	w8, #0x1f, 0x4577e0c <_ChromeMain+0x4572b70>
 457657c: 3cc38360     	ldur	q0, [x27, #0x38]
 4576580: 3c8402a0     	stur	q0, [x21, #0x40]
 4576584: f9410be8     	ldr	x8, [sp, #0x210]
 4576588: f80502a8     	stur	x8, [x21, #0x50]
 457658c: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 4576590: f9009bff     	str	xzr, [sp, #0x130]
 4576594: b00515a3     	adrp	x3, 0xe82b000 <dyld_stub_binder+0xe82b000>
 4576598: 913ea063     	add	x3, x3, #0xfa8
 457659c: 910883e2     	add	x2, sp, #0x220
 45765a0: 910483e5     	add	x5, sp, #0x120
 45765a4: aa1403e0     	mov	x0, x20
 45765a8: aa1c03e1     	mov	x1, x28
 45765ac: aa1503e4     	mov	x4, x21
 45765b0: 52800026     	mov	w6, #0x1                ; =1
 45765b4: 94000a13     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 45765b8: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 45765bc: 36f800a8     	tbz	w8, #0x1f, 0x45765d0 <_ChromeMain+0x4571334>
 45765c0: f94093e0     	ldr	x0, [sp, #0x120]
 45765c4: f9409be8     	ldr	x8, [sp, #0x130]
 45765c8: d37ff901     	lsl	x1, x8, #1
 45765cc: 96ea4a3b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45765d0: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 45765d4: 36f800a8     	tbz	w8, #0x1f, 0x45765e8 <_ChromeMain+0x457134c>
 45765d8: f94113e0     	ldr	x0, [sp, #0x220]
 45765dc: f9411be8     	ldr	x8, [sp, #0x230]
 45765e0: d37ff901     	lsl	x1, x8, #1
 45765e4: 96ea4a35     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45765e8: aa1c03e0     	mov	x0, x28
 45765ec: 94000a32     	bl	0x4578eb4 <_ChromeMain+0x4573c18>
 45765f0: 52800108     	mov	w8, #0x8                ; =8
 45765f4: 39035fe8     	strb	w8, [sp, #0xd7]
 45765f8: 910303e9     	add	x9, sp, #0xc0
 45765fc: 9100412a     	add	x10, x9, #0x10
 4576600: b004d088     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4576604: 9110b908     	add	x8, x8, #0x42e
 4576608: eb08015f     	cmp	x10, x8
 457660c: fa488122     	ccmp	x9, x8, #0x2, hi
 4576610: 54ff3529     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 4576614: 3dc00100     	ldr	q0, [x8]
 4576618: 3d8033e0     	str	q0, [sp, #0xc0]
 457661c: 7901a3ff     	strh	wzr, [sp, #0xd0]
 4576620: f9418e88     	ldr	x8, [x20, #0x318]
 4576624: f940c519     	ldr	x25, [x8, #0x188]
 4576628: b40000d9     	cbz	x25, 0x4576640 <_ChromeMain+0x45713a4>
 457662c: 52800029     	mov	w9, #0x1                ; =1
 4576630: b8290329     	ldadd	w9, w9, [x25]
 4576634: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4576638: 6b0a013f     	cmp	w9, w10
 457663c: 5400e8e0     	b.eq	0x4578358 <_ChromeMain+0x45730bc>
 4576640: f940c913     	ldr	x19, [x8, #0x190]
 4576644: 52800b00     	mov	w0, #0x58               ; =88
 4576648: 96ea6348     	bl	0xf368 <_ChromeMain+0xa0cc>
 457664c: aa0003f5     	mov	x21, x0
 4576650: 52800028     	mov	w8, #0x1                ; =1
 4576654: b9000008     	str	w8, [x0]
 4576658: a900e017     	stp	x23, x24, [x0, #0x8]
 457665c: 10fdcc48     	adr	x8, 0x4571fe4 <_ChromeMain+0x456cd48>
 4576660: d503201f     	nop
 4576664: a901a016     	stp	x22, x8, [x0, #0x18]
 4576668: a902e41f     	stp	xzr, x25, [x0, #0x28]
 457666c: f9001c13     	str	x19, [x0, #0x38]
 4576670: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 4576674: 37f804c8     	tbnz	w8, #0x1f, 0x457670c <_ChromeMain+0x4571470>
 4576678: 3cc38360     	ldur	q0, [x27, #0x38]
 457667c: 3c8402a0     	stur	q0, [x21, #0x40]
 4576680: f9410be8     	ldr	x8, [sp, #0x210]
 4576684: f80502a8     	stur	x8, [x21, #0x50]
 4576688: a918ffff     	stp	xzr, xzr, [sp, #0x188]
 457668c: f900cfff     	str	xzr, [sp, #0x198]
 4576690: f9418a88     	ldr	x8, [x20, #0x310]
 4576694: f9403500     	ldr	x0, [x8, #0x68]
 4576698: 910803e1     	add	x1, sp, #0x200
 457669c: 97ee228c     	bl	0x40ff0cc <_ChromeMain+0x40f9e30>
 45766a0: aa0003e6     	mov	x6, x0
 45766a4: f00515a3     	adrp	x3, 0xe82d000 <dyld_stub_binder+0xe82d000>
 45766a8: 911ac063     	add	x3, x3, #0x6b0
 45766ac: 910303e2     	add	x2, sp, #0xc0
 45766b0: 910623e5     	add	x5, sp, #0x188
 45766b4: aa1403e0     	mov	x0, x20
 45766b8: aa1c03e1     	mov	x1, x28
 45766bc: aa1503e4     	mov	x4, x21
 45766c0: 940009d0     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 45766c4: 39c67fe8     	ldrsb	w8, [sp, #0x19f]
 45766c8: 36f800a8     	tbz	w8, #0x1f, 0x45766dc <_ChromeMain+0x4571440>
 45766cc: f940c7e0     	ldr	x0, [sp, #0x188]
 45766d0: f940cfe8     	ldr	x8, [sp, #0x198]
 45766d4: d37ff901     	lsl	x1, x8, #1
 45766d8: 96ea49f8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45766dc: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 45766e0: 36f800a8     	tbz	w8, #0x1f, 0x45766f4 <_ChromeMain+0x4571458>
 45766e4: f94063e0     	ldr	x0, [sp, #0xc0]
 45766e8: f9406be8     	ldr	x8, [sp, #0xd0]
 45766ec: d37ff901     	lsl	x1, x8, #1
 45766f0: 96ea49f2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45766f4: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 45766f8: 36f80f48     	tbz	w8, #0x1f, 0x45768e0 <_ChromeMain+0x4571644>
 45766fc: f94103e0     	ldr	x0, [sp, #0x200]
 4576700: f9410be8     	ldr	x8, [sp, #0x210]
 4576704: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4576708: 14000075     	b	0x45768dc <_ChromeMain+0x4571640>
 457670c: f94103e1     	ldr	x1, [sp, #0x200]
 4576710: f94107e2     	ldr	x2, [sp, #0x208]
 4576714: 910102a0     	add	x0, x21, #0x40
 4576718: 96ea86c0     	bl	0x18218 <_ChromeMain+0x12f7c>
 457671c: 17ffffdb     	b	0x4576688 <_ChromeMain+0x45713ec>
