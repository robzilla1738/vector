
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464026c: f940e008     	ldr	x8, [x0, #0x1c0]
 4640270: a90423ff     	stp	xzr, x8, [sp, #0x40]
 4640274: f9400008     	ldr	x8, [x0]
 4640278: f9403908     	ldr	x8, [x8, #0x70]
 464027c: d63f0100     	blr	x8
 4640280: a90307e0     	stp	x0, x1, [sp, #0x30]
 4640284: 910103e0     	add	x0, sp, #0x40
 4640288: 9100c3e1     	add	x1, sp, #0x30
 464028c: 96f6338b     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 4640290: f942ce60     	ldr	x0, [x19, #0x598]
 4640294: b4fffe40     	cbz	x0, 0x464025c <_ChromeMain+0x463afc0>
 4640298: f940c408     	ldr	x8, [x0, #0x188]
 464029c: f942d669     	ldr	x9, [x19, #0x5a8]
 46402a0: eb08013f     	cmp	x9, x8
 46402a4: 1a9f17fa     	cset	w26, eq
 46402a8: f942d268     	ldr	x8, [x19, #0x5a0]
 46402ac: b4fffdc8     	cbz	x8, 0x4640264 <_ChromeMain+0x463afc8>
 46402b0: f940c508     	ldr	x8, [x8, #0x188]
 46402b4: f942d669     	ldr	x9, [x19, #0x5a8]
 46402b8: eb08013f     	cmp	x9, x8
 46402bc: 1a9f17f7     	cset	w23, eq
 46402c0: a9445bf5     	ldp	x21, x22, [sp, #0x40]
 46402c4: 3400007a     	cbz	w26, 0x46402d0 <_ChromeMain+0x463b034>
 46402c8: 39472008     	ldrb	w8, [x0, #0x1c8]
 46402cc: 350001c8     	cbnz	w8, 0x4640304 <_ChromeMain+0x463b068>
 46402d0: 6f00e401     	movi.2d	v1, #0000000000000000
 46402d4: 340002b7     	cbz	w23, 0x4640328 <_ChromeMain+0x463b08c>
 46402d8: f942d260     	ldr	x0, [x19, #0x5a0]
 46402dc: 39472008     	ldrb	w8, [x0, #0x1c8]
 46402e0: 34000248     	cbz	w8, 0x4640328 <_ChromeMain+0x463b08c>
 46402e4: b0048521     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46402e8: 9102a021     	add	x1, x1, #0xa8
 46402ec: 3d8003e1     	str	q1, [sp]
 46402f0: 97065664     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 46402f4: 3dc003e1     	ldr	q1, [sp]
 46402f8: aa0003f4     	mov	x20, x0
 46402fc: d360fc18     	lsr	x24, x0, #32
 4640300: 1400000c     	b	0x4640330 <_ChromeMain+0x463b094>
 4640304: b0048521     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4640308: 91026021     	add	x1, x1, #0x98
 464030c: 9706565d     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4640310: 4e080c00     	dup.2d	v0, x0
 4640314: d004c7c8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4640318: 3dc01101     	ldr	q1, [x8, #0x40]
 464031c: 6ee14400     	ushl.2d	v0, v0, v1
 4640320: 0ea12801     	xtn.2s	v1, v0
 4640324: 35fffdb7     	cbnz	w23, 0x46402d8 <_ChromeMain+0x463b03c>
 4640328: 52800014     	mov	w20, #0x0               ; =0
 464032c: 52800018     	mov	w24, #0x0               ; =0
 4640330: f942f260     	ldr	x0, [x19, #0x5e0]
 4640334: b40000a0     	cbz	x0, 0x4640348 <_ChromeMain+0x463b0ac>
 4640338: 39472008     	ldrb	w8, [x0, #0x1c8]
 464033c: 36000068     	tbz	w8, #0x0, 0x4640348 <_ChromeMain+0x463b0ac>
 4640340: 52800028     	mov	w8, #0x1                ; =1
 4640344: 14000004     	b	0x4640354 <_ChromeMain+0x463b0b8>
 4640348: 7100029f     	cmp	w20, #0x0
 464034c: 7a401b04     	ccmp	w24, #0x0, #0x4, ne
 4640350: 1a9f07e8     	cset	w8, ne
 4640354: 1e26002a     	fmov	w10, s1
 4640358: 6b14015f     	cmp	w10, w20
 464035c: 1a94c159     	csel	w25, w10, w20, gt
 4640360: 340006ba     	cbz	w26, 0x4640434 <_ChromeMain+0x463b198>
 4640364: 3400068a     	cbz	w10, 0x4640434 <_ChromeMain+0x463b198>
 4640368: 0e0c3c29     	mov.s	w9, v1[1]
 464036c: 34000649     	cbz	w9, 0x4640434 <_ChromeMain+0x463b198>
 4640370: 0b567ecb     	add	w11, w22, w22, lsr #31
 4640374: 0b8b06ab     	add	w11, w21, w11, asr #1
 4640378: 0b4a7d4a     	add	w10, w10, w10, lsr #31
 464037c: 4b8a056a     	sub	w10, w11, w10, asr #1
 4640380: 7200011f     	tst	w8, #0x1
 4640384: 1a8a12a8     	csel	w8, w21, w10, ne
 4640388: d360feca     	lsr	x10, x22, #32
 464038c: 8b56fd4a     	add	x10, x10, x22, lsr #63
 4640390: 13017d4a     	asr	w10, w10, #1
 4640394: 8b55814a     	add	x10, x10, x21, lsr #32
 4640398: 0b497d29     	add	w9, w9, w9, lsr #31
 464039c: 4b890549     	sub	w9, w10, w9, asr #1
 46403a0: 1e270100     	fmov	s0, w8
 46403a4: 290827e8     	stp	w8, w9, [sp, #0x40]
 46403a8: 4e0c1d20     	mov.s	v0[1], w9
 46403ac: 0ea10c01     	sqadd.2s	v1, v0, v1
 46403b0: 0ea02c20     	sqsub.2s	v0, v1, v0
 46403b4: 6f00e401     	movi.2d	v1, #0000000000000000
 46403b8: 0ea16400     	smax.2s	v0, v0, v1
 46403bc: fd0027e0     	str	d0, [sp, #0x48]
 46403c0: 395e9268     	ldrb	w8, [x19, #0x7a4]
 46403c4: 340000c8     	cbz	w8, 0x46403dc <_ChromeMain+0x463b140>
 46403c8: 395e8268     	ldrb	w8, [x19, #0x7a0]
 46403cc: 34000088     	cbz	w8, 0x46403dc <_ChromeMain+0x463b140>
 46403d0: 911db268     	add	x8, x19, #0x76c
 46403d4: 3dc00100     	ldr	q0, [x8]
 46403d8: 3d8013e0     	str	q0, [sp, #0x40]
 46403dc: f942ce68     	ldr	x8, [x19, #0x598]
 46403e0: b40002a8     	cbz	x8, 0x4640434 <_ChromeMain+0x463b198>
 46403e4: b941b909     	ldr	w9, [x8, #0x1b8]
 46403e8: b94043ea     	ldr	w10, [sp, #0x40]
 46403ec: 6b0a013f     	cmp	w9, w10
 46403f0: 540001a1     	b.ne	0x4640424 <_ChromeMain+0x463b188>
 46403f4: b941bd09     	ldr	w9, [x8, #0x1bc]
 46403f8: b94047ea     	ldr	w10, [sp, #0x44]
 46403fc: 6b0a013f     	cmp	w9, w10
 4640400: 54000121     	b.ne	0x4640424 <_ChromeMain+0x463b188>
 4640404: b941c109     	ldr	w9, [x8, #0x1c0]
 4640408: b9404bea     	ldr	w10, [sp, #0x48]
 464040c: 6b0a013f     	cmp	w9, w10
 4640410: 540000a1     	b.ne	0x4640424 <_ChromeMain+0x463b188>
 4640414: b941c509     	ldr	w9, [x8, #0x1c4]
 4640418: b9404fea     	ldr	w10, [sp, #0x4c]
 464041c: 6b0a013f     	cmp	w9, w10
 4640420: 540000a0     	b.eq	0x4640434 <_ChromeMain+0x463b198>
 4640424: 910103e1     	add	x1, sp, #0x40
 4640428: aa0803e0     	mov	x0, x8
 464042c: 970991d9     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4640430: f942f260     	ldr	x0, [x19, #0x5e0]
 4640434: b4000600     	cbz	x0, 0x46404f4 <_ChromeMain+0x463b258>
 4640438: 39472008     	ldrb	w8, [x0, #0x1c8]
 464043c: 340005c8     	cbz	w8, 0x46404f4 <_ChromeMain+0x463b258>
 4640440: d360fea9     	lsr	x9, x21, #32
 4640444: f942d668     	ldr	x8, [x19, #0x5a8]
 4640448: b941c50a     	ldr	w10, [x8, #0x1c4]
 464044c: 0b150328     	add	w8, w25, w21
 4640450: 1e270100     	fmov	s0, w8
 4640454: 5100814a     	sub	w10, w10, #0x20
 4640458: 4b1906cb     	sub	w11, w22, w25, lsl #1
 464045c: 6b0a013f     	cmp	w9, w10
 4640460: 1a8ac129     	csel	w9, w9, w10, gt
 4640464: 0aab7d6a     	bic	w10, w11, w11, asr #31
 4640468: 1e270141     	fmov	s1, w10
 464046c: 290827e8     	stp	w8, w9, [sp, #0x40]
 4640470: 0f000702     	movi.2s	v2, #0x18
 4640474: 4e041d02     	mov.s	v2[0], w8
 4640478: 4e0c1d21     	mov.s	v1[1], w9
 464047c: 4e0c1d20     	mov.s	v0[1], w9
 4640480: 0ea10c41     	sqadd.2s	v1, v2, v1
 4640484: 0ea02c20     	sqsub.2s	v0, v1, v0
 4640488: 6f00e401     	movi.2d	v1, #0000000000000000
 464048c: 0ea16400     	smax.2s	v0, v0, v1
 4640490: fd0027e0     	str	d0, [sp, #0x48]
 4640494: 395e926a     	ldrb	w10, [x19, #0x7a4]
 4640498: 340000ea     	cbz	w10, 0x46404b4 <_ChromeMain+0x463b218>
 464049c: 395e826a     	ldrb	w10, [x19, #0x7a0]
 46404a0: 340000aa     	cbz	w10, 0x46404b4 <_ChromeMain+0x463b218>
 46404a4: 911df268     	add	x8, x19, #0x77c
 46404a8: 3dc00100     	ldr	q0, [x8]
 46404ac: 3d8013e0     	str	q0, [sp, #0x40]
 46404b0: 294827e8     	ldp	w8, w9, [sp, #0x40]
 46404b4: b941b80a     	ldr	w10, [x0, #0x1b8]
 46404b8: 6b08015f     	cmp	w10, w8
 46404bc: 54000181     	b.ne	0x46404ec <_ChromeMain+0x463b250>
 46404c0: b941bc08     	ldr	w8, [x0, #0x1bc]
 46404c4: 6b09011f     	cmp	w8, w9
 46404c8: 54000121     	b.ne	0x46404ec <_ChromeMain+0x463b250>
 46404cc: b941c008     	ldr	w8, [x0, #0x1c0]
 46404d0: b9404be9     	ldr	w9, [sp, #0x48]
 46404d4: 6b09011f     	cmp	w8, w9
 46404d8: 540000a1     	b.ne	0x46404ec <_ChromeMain+0x463b250>
 46404dc: b941c408     	ldr	w8, [x0, #0x1c4]
 46404e0: b9404fe9     	ldr	w9, [sp, #0x4c]
 46404e4: 6b09011f     	cmp	w8, w9
 46404e8: 54000060     	b.eq	0x46404f4 <_ChromeMain+0x463b258>
 46404ec: 910103e1     	add	x1, sp, #0x40
 46404f0: 970991a8     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46404f4: 34ffd157     	cbz	w23, 0x463ff1c <_ChromeMain+0x463ac80>
 46404f8: 34ffd134     	cbz	w20, 0x463ff1c <_ChromeMain+0x463ac80>
 46404fc: 34ffd118     	cbz	w24, 0x463ff1c <_ChromeMain+0x463ac80>
 4640500: 4b1402a8     	sub	w8, w21, w20
 4640504: 0b160108     	add	w8, w8, w22
 4640508: d360fec9     	lsr	x9, x22, #32
 464050c: 8b56fd29     	add	x9, x9, x22, lsr #63
 4640510: 13017d29     	asr	w9, w9, #1
 4640514: 8b558129     	add	x9, x9, x21, lsr #32
 4640518: 0b587f0a     	add	w10, w24, w24, lsr #31
 464051c: 4b8a0529     	sub	w9, w9, w10, asr #1
 4640520: 290827e8     	stp	w8, w9, [sp, #0x40]
 4640524: 2b14010a     	adds	w10, w8, w20
 4640528: 131f7d4b     	asr	w11, w10, #31
 464052c: 5201016b     	eor	w11, w11, #0x80000000
 4640530: 1a8a616a     	csel	w10, w11, w10, vs
 4640534: 6b080148     	subs	w8, w10, w8
 4640538: 131f7d0a     	asr	w10, w8, #31
 464053c: 5201014a     	eor	w10, w10, #0x80000000
 4640540: 1a886148     	csel	w8, w10, w8, vs
 4640544: 2b18012a     	adds	w10, w9, w24
 4640548: 131f7d4b     	asr	w11, w10, #31
 464054c: 5201016b     	eor	w11, w11, #0x80000000
 4640550: 1a8a616a     	csel	w10, w11, w10, vs
 4640554: 6b090149     	subs	w9, w10, w9
 4640558: 131f7d2a     	asr	w10, w9, #31
 464055c: 5201014a     	eor	w10, w10, #0x80000000
 4640560: 1a896149     	csel	w9, w10, w9, vs
 4640564: 0aa87d08     	bic	w8, w8, w8, asr #31
 4640568: 0aa97d29     	bic	w9, w9, w9, asr #31
 464056c: 290927e8     	stp	w8, w9, [sp, #0x48]
 4640570: 395e9268     	ldrb	w8, [x19, #0x7a4]
 4640574: 340000c8     	cbz	w8, 0x464058c <_ChromeMain+0x463b2f0>
 4640578: 395e8268     	ldrb	w8, [x19, #0x7a0]
 464057c: 34000088     	cbz	w8, 0x464058c <_ChromeMain+0x463b2f0>
 4640580: 911e3268     	add	x8, x19, #0x78c
 4640584: 3dc00100     	ldr	q0, [x8]
 4640588: 3d8013e0     	str	q0, [sp, #0x40]
 464058c: f942d260     	ldr	x0, [x19, #0x5a0]
 4640590: b4ffcc60     	cbz	x0, 0x463ff1c <_ChromeMain+0x463ac80>
 4640594: b941b808     	ldr	w8, [x0, #0x1b8]
 4640598: b94043e9     	ldr	w9, [sp, #0x40]
 464059c: 6b09011f     	cmp	w8, w9
 46405a0: 540001a1     	b.ne	0x46405d4 <_ChromeMain+0x463b338>
 46405a4: b941bc08     	ldr	w8, [x0, #0x1bc]
 46405a8: b94047e9     	ldr	w9, [sp, #0x44]
 46405ac: 6b09011f     	cmp	w8, w9
 46405b0: 54000121     	b.ne	0x46405d4 <_ChromeMain+0x463b338>
 46405b4: b941c008     	ldr	w8, [x0, #0x1c0]
 46405b8: b9404be9     	ldr	w9, [sp, #0x48]
 46405bc: 6b09011f     	cmp	w8, w9
 46405c0: 540000a1     	b.ne	0x46405d4 <_ChromeMain+0x463b338>
 46405c4: b941c408     	ldr	w8, [x0, #0x1c4]
 46405c8: b9404fe9     	ldr	w9, [sp, #0x4c]
 46405cc: 6b09011f     	cmp	w8, w9
 46405d0: 54ffca60     	b.eq	0x463ff1c <_ChromeMain+0x463ac80>
 46405d4: 910103e1     	add	x1, sp, #0x40
 46405d8: 9709916e     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46405dc: 17fffe50     	b	0x463ff1c <_ChromeMain+0x463ac80>
 46405e0: d4200000     	brk	#0
 46405e4: d4400000     	hlt	#0
