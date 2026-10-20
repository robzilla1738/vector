
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42502d8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 42502dc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 42502e0: 910043fd     	add	x29, sp, #0x10
 42502e4: aa0003f3     	mov	x19, x0
 42502e8: 39422014     	ldrb	w20, [x0, #0x88]
 42502ec: f9401400     	ldr	x0, [x0, #0x28]
 42502f0: f900167f     	str	xzr, [x19, #0x28]
 42502f4: b50003a0     	cbnz	x0, 0x4250368 <_ChromeMain+0x424b0cc>
 42502f8: f9401260     	ldr	x0, [x19, #0x20]
 42502fc: f900127f     	str	xzr, [x19, #0x20]
 4250300: b4000080     	cbz	x0, 0x4250310 <_ChromeMain+0x424b074>
 4250304: 97b84fc9     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4250308: 52802f01     	mov	w1, #0x178              ; =376
 425030c: 96f6e2eb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250310: 3902227f     	strb	wzr, [x19, #0x88]
 4250314: f900427f     	str	xzr, [x19, #0x80]
 4250318: f9401e68     	ldr	x8, [x19, #0x38]
 425031c: d37ef509     	lsl	x9, x8, #2
 4250320: b4000129     	cbz	x9, 0x4250344 <_ChromeMain+0x424b0a8>
 4250324: f9401a6a     	ldr	x10, [x19, #0x30]
 4250328: cb080be8     	neg	x8, x8, lsl #2
 425032c: 8b0a0129     	add	x9, x9, x10
 4250330: d1001129     	sub	x9, x9, #0x4
 4250334: b4000229     	cbz	x9, 0x4250378 <_ChromeMain+0x424b0dc>
 4250338: d1001129     	sub	x9, x9, #0x4
 425033c: 91001108     	add	x8, x8, #0x4
 4250340: b5ffffa8     	cbnz	x8, 0x4250334 <_ChromeMain+0x424b098>
 4250344: f9001e7f     	str	xzr, [x19, #0x38]
 4250348: aa1303e0     	mov	x0, x19
 425034c: 36000094     	tbz	w20, #0x0, 0x425035c <_ChromeMain+0x424b0c0>
 4250350: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4250354: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4250358: 14000432     	b	0x4251420 <_ChromeMain+0x424c184>
 425035c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4250360: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4250364: 140002b7     	b	0x4250e40 <_ChromeMain+0x424bba4>
 4250368: 94d3f5d5     	bl	0x774dabc <_ChromeMain+0x7748820>
 425036c: 52805801     	mov	w1, #0x2c0              ; =704
 4250370: 96f6e2d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250374: 17ffffe1     	b	0x42502f8 <_ChromeMain+0x424b05c>
 4250378: d4200020     	brk	#0x1
 425037c: 52800028     	mov	w8, #0x1                ; =1
 4250380: 39020008     	strb	w8, [x0, #0x80]
 4250384: 39422008     	ldrb	w8, [x0, #0x88]
 4250388: 37000128     	tbnz	w8, #0x0, 0x42503ac <_ChromeMain+0x424b110>
 425038c: f9401408     	ldr	x8, [x0, #0x28]
 4250390: b40000e8     	cbz	x8, 0x42503ac <_ChromeMain+0x424b110>
 4250394: 39420409     	ldrb	w9, [x0, #0x81]
 4250398: 340000a9     	cbz	w9, 0x42503ac <_ChromeMain+0x424b110>
 425039c: 39420809     	ldrb	w9, [x0, #0x82]
 42503a0: 34000069     	cbz	w9, 0x42503ac <_ChromeMain+0x424b110>
 42503a4: 39420c09     	ldrb	w9, [x0, #0x83]
 42503a8: 35000049     	cbnz	w9, 0x42503b0 <_ChromeMain+0x424b114>
 42503ac: d65f03c0     	ret
 42503b0: 52800029     	mov	w9, #0x1                ; =1
 42503b4: 39022009     	strb	w9, [x0, #0x88]
 42503b8: 9100c001     	add	x1, x0, #0x30
 42503bc: aa0803e0     	mov	x0, x8
 42503c0: 17fa7c6f     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 42503c4: 52800028     	mov	w8, #0x1                ; =1
 42503c8: 39020408     	strb	w8, [x0, #0x81]
 42503cc: 39422008     	ldrb	w8, [x0, #0x88]
 42503d0: 37000128     	tbnz	w8, #0x0, 0x42503f4 <_ChromeMain+0x424b158>
 42503d4: f9401408     	ldr	x8, [x0, #0x28]
 42503d8: b40000e8     	cbz	x8, 0x42503f4 <_ChromeMain+0x424b158>
 42503dc: 39420009     	ldrb	w9, [x0, #0x80]
 42503e0: 340000a9     	cbz	w9, 0x42503f4 <_ChromeMain+0x424b158>
 42503e4: 39420809     	ldrb	w9, [x0, #0x82]
 42503e8: 34000069     	cbz	w9, 0x42503f4 <_ChromeMain+0x424b158>
 42503ec: 39420c09     	ldrb	w9, [x0, #0x83]
 42503f0: 35000049     	cbnz	w9, 0x42503f8 <_ChromeMain+0x424b15c>
 42503f4: d65f03c0     	ret
 42503f8: 52800029     	mov	w9, #0x1                ; =1
 42503fc: 39022009     	strb	w9, [x0, #0x88]
 4250400: 9100c001     	add	x1, x0, #0x30
 4250404: aa0803e0     	mov	x0, x8
 4250408: 17fa7c5d     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 425040c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4250410: a90167fa     	stp	x26, x25, [sp, #0x10]
 4250414: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4250418: a90357f6     	stp	x22, x21, [sp, #0x30]
 425041c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4250420: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4250424: 910143fd     	add	x29, sp, #0x50
 4250428: aa0003f4     	mov	x20, x0
 425042c: aa0003f3     	mov	x19, x0
 4250430: f8430e75     	ldr	x21, [x19, #0x30]!
 4250434: 52800028     	mov	w8, #0x1                ; =1
 4250438: 39014a68     	strb	w8, [x19, #0x52]
 425043c: f9400668     	ldr	x8, [x19, #0x8]
 4250440: d37ef509     	lsl	x9, x8, #2
 4250444: b4000109     	cbz	x9, 0x4250464 <_ChromeMain+0x424b1c8>
 4250448: cb080be8     	neg	x8, x8, lsl #2
 425044c: 8b150129     	add	x9, x9, x21
 4250450: d1001129     	sub	x9, x9, #0x4
 4250454: b40006e9     	cbz	x9, 0x4250530 <_ChromeMain+0x424b294>
 4250458: d1001129     	sub	x9, x9, #0x4
 425045c: 91001108     	add	x8, x8, #0x4
 4250460: b5ffffa8     	cbnz	x8, 0x4250454 <_ChromeMain+0x424b1b8>
 4250464: f9001e9f     	str	xzr, [x20, #0x38]
 4250468: 39400028     	ldrb	w8, [x1]
 425046c: 7100091f     	cmp	w8, #0x2
 4250470: 54000c02     	b.hs	0x42505f0 <_ChromeMain+0x424b354>
 4250474: 34000288     	cbz	w8, 0x42504c4 <_ChromeMain+0x424b228>
 4250478: 39422288     	ldrb	w8, [x20, #0x88]
 425047c: 37000168     	tbnz	w8, #0x0, 0x42504a8 <_ChromeMain+0x424b20c>
 4250480: f9401680     	ldr	x0, [x20, #0x28]
 4250484: b4000120     	cbz	x0, 0x42504a8 <_ChromeMain+0x424b20c>
 4250488: 39420288     	ldrb	w8, [x20, #0x80]
 425048c: 340000e8     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 4250490: 39420688     	ldrb	w8, [x20, #0x81]
 4250494: 340000a8     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 4250498: 39420a88     	ldrb	w8, [x20, #0x82]
 425049c: 34000068     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 42504a0: 39420e88     	ldrb	w8, [x20, #0x83]
 42504a4: 350008e8     	cbnz	w8, 0x42505c0 <_ChromeMain+0x424b324>
 42504a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42504ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42504b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42504b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42504b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42504bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42504c0: d65f03c0     	ret
 42504c4: f9401428     	ldr	x8, [x1, #0x28]
 42504c8: 52800b09     	mov	w9, #0x58               ; =88
 42504cc: 9b097d18     	mul	x24, x8, x9
 42504d0: b4fffd58     	cbz	x24, 0x4250478 <_ChromeMain+0x424b1dc>
 42504d4: d280001a     	mov	x26, #0x0               ; =0
 42504d8: f9401028     	ldr	x8, [x1, #0x20]
 42504dc: 91014119     	add	x25, x8, #0x50
 42504e0: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 42504e4: 92f8001c     	mov	x28, #0x3fffffffffffffff ; =4611686018427387903
 42504e8: f9402288     	ldr	x8, [x20, #0x40]
 42504ec: eb08035f     	cmp	x26, x8
 42504f0: 54000220     	b.eq	0x4250534 <_ChromeMain+0x424b298>
 42504f4: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 42504f8: b40001c8     	cbz	x8, 0x4250530 <_ChromeMain+0x424b294>
 42504fc: b9400329     	ldr	w9, [x25]
 4250500: b9000109     	str	w9, [x8]
 4250504: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 4250508: 91001108     	add	x8, x8, #0x4
 425050c: f9401a95     	ldr	x21, [x20, #0x30]
 4250510: eb150108     	subs	x8, x8, x21
 4250514: 9342fd1a     	asr	x26, x8, #2
 4250518: f9001e9a     	str	x26, [x20, #0x38]
 425051c: 540000a0     	b.eq	0x4250530 <_ChromeMain+0x424b294>
 4250520: 91016339     	add	x25, x25, #0x58
 4250524: f1016318     	subs	x24, x24, #0x58
 4250528: 54fffe01     	b.ne	0x42504e8 <_ChromeMain+0x424b24c>
 425052c: 17ffffd3     	b	0x4250478 <_ChromeMain+0x424b1dc>
 4250530: d4200020     	brk	#0x1
 4250534: 91000748     	add	x8, x26, #0x1
 4250538: d37efd09     	lsr	x9, x8, #62
 425053c: b5000569     	cbnz	x9, 0x42505e8 <_ChromeMain+0x424b34c>
 4250540: d37ffb49     	lsl	x9, x26, #1
 4250544: eb08013f     	cmp	x9, x8
 4250548: 9a888128     	csel	x8, x9, x8, hi
 425054c: eb0a035f     	cmp	x26, x10
 4250550: 9a9c311b     	csel	x27, x8, x28, lo
 4250554: b400055b     	cbz	x27, 0x42505fc <_ChromeMain+0x424b360>
 4250558: d37eff68     	lsr	x8, x27, #62
 425055c: b5000488     	cbnz	x8, 0x42505ec <_ChromeMain+0x424b350>
 4250560: d37ef760     	lsl	x0, x27, #2
 4250564: 96f6fb81     	bl	0xf368 <_ChromeMain+0xa0cc>
 4250568: aa0003f5     	mov	x21, x0
 425056c: ab1a0aa8     	adds	x8, x21, x26, lsl #2
 4250570: 54fffe00     	b.eq	0x4250530 <_ChromeMain+0x424b294>
 4250574: b9400329     	ldr	w9, [x25]
 4250578: b9000109     	str	w9, [x8]
 425057c: a9432681     	ldp	x1, x9, [x20, #0x30]
 4250580: cb090916     	sub	x22, x8, x9, lsl #2
 4250584: d37ef537     	lsl	x23, x9, #2
 4250588: aa1603e0     	mov	x0, x22
 425058c: aa1703e2     	mov	x2, x23
 4250590: 94f6e5da     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4250594: 910012e8     	add	x8, x23, #0x4
 4250598: 9342fd08     	asr	x8, x8, #2
 425059c: f9401a80     	ldr	x0, [x20, #0x30]
 42505a0: a9032296     	stp	x22, x8, [x20, #0x30]
 42505a4: f9402288     	ldr	x8, [x20, #0x40]
 42505a8: f900229b     	str	x27, [x20, #0x40]
 42505ac: b4000060     	cbz	x0, 0x42505b8 <_ChromeMain+0x424b31c>
 42505b0: d37ef501     	lsl	x1, x8, #2
 42505b4: 96f6e241     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42505b8: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 42505bc: 17ffffd2     	b	0x4250504 <_ChromeMain+0x424b268>
 42505c0: 52800028     	mov	w8, #0x1                ; =1
 42505c4: 39022288     	strb	w8, [x20, #0x88]
 42505c8: aa1303e1     	mov	x1, x19
 42505cc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42505d0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42505d4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42505d8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42505dc: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42505e0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42505e4: 17fa7be6     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 42505e8: 97730de6     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 42505ec: 9426d68d     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 42505f0: d4200000     	brk	#0
 42505f4: d4400000     	hlt	#0
 42505f8: d4200020     	brk	#0x1
 42505fc: d2800015     	mov	x21, #0x0               ; =0
 4250600: 17ffffdb     	b	0x425056c <_ChromeMain+0x424b2d0>
 4250604: 52800028     	mov	w8, #0x1                ; =1
 4250608: 39020c08     	strb	w8, [x0, #0x83]
 425060c: 39422008     	ldrb	w8, [x0, #0x88]
 4250610: 37000128     	tbnz	w8, #0x0, 0x4250634 <_ChromeMain+0x424b398>
 4250614: f9401408     	ldr	x8, [x0, #0x28]
 4250618: b40000e8     	cbz	x8, 0x4250634 <_ChromeMain+0x424b398>
 425061c: 39420009     	ldrb	w9, [x0, #0x80]
 4250620: 340000a9     	cbz	w9, 0x4250634 <_ChromeMain+0x424b398>
 4250624: 39420409     	ldrb	w9, [x0, #0x81]
 4250628: 34000069     	cbz	w9, 0x4250634 <_ChromeMain+0x424b398>
 425062c: 39420809     	ldrb	w9, [x0, #0x82]
 4250630: 35000049     	cbnz	w9, 0x4250638 <_ChromeMain+0x424b39c>
 4250634: d65f03c0     	ret
 4250638: 52800029     	mov	w9, #0x1                ; =1
 425063c: 39022009     	strb	w9, [x0, #0x88]
 4250640: 9100c001     	add	x1, x0, #0x30
 4250644: aa0803e0     	mov	x0, x8
 4250648: 17fa7bcd     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 425064c: 52800028     	mov	w8, #0x1                ; =1
 4250650: 39021008     	strb	w8, [x0, #0x84]
 4250654: 14000550     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250658: 52800028     	mov	w8, #0x1                ; =1
 425065c: 39021408     	strb	w8, [x0, #0x85]
 4250660: 1400054d     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250664: 52800028     	mov	w8, #0x1                ; =1
 4250668: 39021808     	strb	w8, [x0, #0x86]
 425066c: 1400054a     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250670: 52800028     	mov	w8, #0x1                ; =1
 4250674: 39021c08     	strb	w8, [x0, #0x87]
 4250678: 14000547     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 425067c: aa0003e8     	mov	x8, x0
 4250680: f9404800     	ldr	x0, [x0, #0x90]
 4250684: b40000c0     	cbz	x0, 0x425069c <_ChromeMain+0x424b400>
 4250688: 52800029     	mov	w9, #0x1                ; =1
 425068c: b8290009     	ldadd	w9, w9, [x0]
 4250690: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4250694: 6b0a013f     	cmp	w9, w10
 4250698: 540000c0     	b.eq	0x42506b0 <_ChromeMain+0x424b414>
 425069c: f9404d08     	ldr	x8, [x8, #0x98]
 42506a0: 91002109     	add	x9, x8, #0x8
 42506a4: f100011f     	cmp	x8, #0x0
 42506a8: 9a8903e1     	csel	x1, xzr, x9, eq
 42506ac: d65f03c0     	ret
 42506b0: d4200000     	brk	#0
 42506b4: d4400000     	hlt	#0
 42506b8: d4200020     	brk	#0x1
 42506bc: d1002000     	sub	x0, x0, #0x8
 42506c0: 140004d9     	b	0x4251a24 <_ChromeMain+0x424c788>
 42506c4: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 42506c8: 910003fd     	mov	x29, sp
 42506cc: d1002000     	sub	x0, x0, #0x8
 42506d0: 940004d5     	bl	0x4251a24 <_ChromeMain+0x424c788>
 42506d4: 52801401     	mov	w1, #0xa0               ; =160
 42506d8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 42506dc: 16f6e1f7     	b	0x8eb8 <_ChromeMain+0x3c1c>
		...
 4250700: d1002000     	sub	x0, x0, #0x8
 4250704: 17fffef5     	b	0x42502d8 <_ChromeMain+0x424b03c>
 4250708: 52800028     	mov	w8, #0x1                ; =1
 425070c: 3901e008     	strb	w8, [x0, #0x78]
 4250710: 39420008     	ldrb	w8, [x0, #0x80]
 4250714: 37000128     	tbnz	w8, #0x0, 0x4250738 <_ChromeMain+0x424b49c>
 4250718: f9401008     	ldr	x8, [x0, #0x20]
 425071c: b40000e8     	cbz	x8, 0x4250738 <_ChromeMain+0x424b49c>
 4250720: 3941e409     	ldrb	w9, [x0, #0x79]
 4250724: 340000a9     	cbz	w9, 0x4250738 <_ChromeMain+0x424b49c>
 4250728: 3941e809     	ldrb	w9, [x0, #0x7a]
 425072c: 34000069     	cbz	w9, 0x4250738 <_ChromeMain+0x424b49c>
 4250730: 3941ec09     	ldrb	w9, [x0, #0x7b]
 4250734: 35000049     	cbnz	w9, 0x425073c <_ChromeMain+0x424b4a0>
 4250738: d65f03c0     	ret
 425073c: 52800029     	mov	w9, #0x1                ; =1
 4250740: 39020009     	strb	w9, [x0, #0x80]
 4250744: 9100a001     	add	x1, x0, #0x28
 4250748: aa0803e0     	mov	x0, x8
 425074c: 17fa7b8c     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 4250750: 52800028     	mov	w8, #0x1                ; =1
 4250754: 3901e408     	strb	w8, [x0, #0x79]
 4250758: 39420008     	ldrb	w8, [x0, #0x80]
 425075c: 37000128     	tbnz	w8, #0x0, 0x4250780 <_ChromeMain+0x424b4e4>
 4250760: f9401008     	ldr	x8, [x0, #0x20]
 4250764: b40000e8     	cbz	x8, 0x4250780 <_ChromeMain+0x424b4e4>
 4250768: 3941e009     	ldrb	w9, [x0, #0x78]
 425076c: 340000a9     	cbz	w9, 0x4250780 <_ChromeMain+0x424b4e4>
 4250770: 3941e809     	ldrb	w9, [x0, #0x7a]
 4250774: 34000069     	cbz	w9, 0x4250780 <_ChromeMain+0x424b4e4>
 4250778: 3941ec09     	ldrb	w9, [x0, #0x7b]
 425077c: 35000049     	cbnz	w9, 0x4250784 <_ChromeMain+0x424b4e8>
 4250780: d65f03c0     	ret
 4250784: 52800029     	mov	w9, #0x1                ; =1
 4250788: 39020009     	strb	w9, [x0, #0x80]
 425078c: 9100a001     	add	x1, x0, #0x28
 4250790: aa0803e0     	mov	x0, x8
 4250794: 17fa7b7a     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 4250798: d1002000     	sub	x0, x0, #0x8
 425079c: 17ffff1c     	b	0x425040c <_ChromeMain+0x424b170>
 42507a0: 52800028     	mov	w8, #0x1                ; =1
 42507a4: 3901ec08     	strb	w8, [x0, #0x7b]
 42507a8: 39420008     	ldrb	w8, [x0, #0x80]
 42507ac: 37000128     	tbnz	w8, #0x0, 0x42507d0 <_ChromeMain+0x424b534>
 42507b0: f9401008     	ldr	x8, [x0, #0x20]
 42507b4: b40000e8     	cbz	x8, 0x42507d0 <_ChromeMain+0x424b534>
 42507b8: 3941e009     	ldrb	w9, [x0, #0x78]
 42507bc: 340000a9     	cbz	w9, 0x42507d0 <_ChromeMain+0x424b534>
 42507c0: 3941e409     	ldrb	w9, [x0, #0x79]
 42507c4: 34000069     	cbz	w9, 0x42507d0 <_ChromeMain+0x424b534>
 42507c8: 3941e809     	ldrb	w9, [x0, #0x7a]
 42507cc: 35000049     	cbnz	w9, 0x42507d4 <_ChromeMain+0x424b538>
 42507d0: d65f03c0     	ret
 42507d4: 52800029     	mov	w9, #0x1                ; =1
 42507d8: 39020009     	strb	w9, [x0, #0x80]
 42507dc: 9100a001     	add	x1, x0, #0x28
 42507e0: aa0803e0     	mov	x0, x8
 42507e4: 17fa7b66     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 42507e8: d1002008     	sub	x8, x0, #0x8
 42507ec: 52800029     	mov	w9, #0x1                ; =1
 42507f0: 3901f009     	strb	w9, [x0, #0x7c]
 42507f4: aa0803e0     	mov	x0, x8
 42507f8: 140004e7     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 42507fc: d1002008     	sub	x8, x0, #0x8
 4250800: 52800029     	mov	w9, #0x1                ; =1
 4250804: 3901f409     	strb	w9, [x0, #0x7d]
 4250808: aa0803e0     	mov	x0, x8
 425080c: 140004e2     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250810: d1002008     	sub	x8, x0, #0x8
 4250814: 52800029     	mov	w9, #0x1                ; =1
 4250818: 3901f809     	strb	w9, [x0, #0x7e]
 425081c: aa0803e0     	mov	x0, x8
 4250820: 140004dd     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250824: d1002008     	sub	x8, x0, #0x8
 4250828: 52800029     	mov	w9, #0x1                ; =1
 425082c: 3901fc09     	strb	w9, [x0, #0x7f]
 4250830: aa0803e0     	mov	x0, x8
 4250834: 140004d8     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250838: aa0003e8     	mov	x8, x0
 425083c: f9404400     	ldr	x0, [x0, #0x88]
 4250840: b40000c0     	cbz	x0, 0x4250858 <_ChromeMain+0x424b5bc>
 4250844: 52800029     	mov	w9, #0x1                ; =1
 4250848: b8290009     	ldadd	w9, w9, [x0]
 425084c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4250850: 6b0a013f     	cmp	w9, w10
 4250854: 540000c0     	b.eq	0x425086c <_ChromeMain+0x424b5d0>
 4250858: f9404908     	ldr	x8, [x8, #0x90]
 425085c: 91002109     	add	x9, x8, #0x8
 4250860: f100011f     	cmp	x8, #0x0
 4250864: 9a8903e1     	csel	x1, xzr, x9, eq
 4250868: d65f03c0     	ret
 425086c: d4200000     	brk	#0
 4250870: d4400000     	hlt	#0
 4250874: d4200020     	brk	#0x1
