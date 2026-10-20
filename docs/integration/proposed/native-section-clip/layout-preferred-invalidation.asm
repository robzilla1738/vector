
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46667a0: d100c3ff     	sub	sp, sp, #0x30
 46667a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46667a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46667ac: 910083fd     	add	x29, sp, #0x20
 46667b0: 3947a408     	ldrb	w8, [x0, #0x1e9]
 46667b4: 360006a8     	tbz	w8, #0x0, 0x4666888 <_ChromeMain+0x46615ec>
 46667b8: aa0003f3     	mov	x19, x0
 46667bc: 910003e1     	mov	x1, sp
 46667c0: 973707e5     	bl	0x1428754 <_ChromeMain+0x14234b8>
 46667c4: 394c9268     	ldrb	w8, [x19, #0x324]
 46667c8: 37000328     	tbnz	w8, #0x0, 0x466682c <_ChromeMain+0x4661590>
 46667cc: 910d0274     	add	x20, x19, #0x340
 46667d0: 394d2268     	ldrb	w8, [x19, #0x348]
 46667d4: 35000228     	cbnz	w8, 0x4666818 <_ChromeMain+0x466157c>
 46667d8: f941aa68     	ldr	x8, [x19, #0x350]
 46667dc: 91000508     	add	x8, x8, #0x1
 46667e0: f901aa68     	str	x8, [x19, #0x350]
 46667e4: f9418a60     	ldr	x0, [x19, #0x310]
 46667e8: f00483e1     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46667ec: 9104b021     	add	x1, x1, #0x12c
 46667f0: 9705bd24     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 46667f4: 394d2268     	ldrb	w8, [x19, #0x348]
 46667f8: 350000c8     	cbnz	w8, 0x4666810 <_ChromeMain+0x4661574>
 46667fc: b40004b4     	cbz	x20, 0x4666890 <_ChromeMain+0x46615f4>
 4666800: f901a260     	str	x0, [x19, #0x340]
 4666804: 52800028     	mov	w8, #0x1                ; =1
 4666808: 390d2268     	strb	w8, [x19, #0x348]
 466680c: 14000004     	b	0x466681c <_ChromeMain+0x4661580>
 4666810: f9000280     	str	x0, [x20]
 4666814: 14000002     	b	0x466681c <_ChromeMain+0x4661580>
 4666818: f9400280     	ldr	x0, [x20]
 466681c: 394c9268     	ldrb	w8, [x19, #0x324]
 4666820: 35000068     	cbnz	w8, 0x466682c <_ChromeMain+0x4661590>
 4666824: d360fc09     	lsr	x9, x0, #32
 4666828: 14000002     	b	0x4666830 <_ChromeMain+0x4661594>
 466682c: b9432269     	ldr	w9, [x19, #0x320]
 4666830: b941c268     	ldr	w8, [x19, #0x1c0]
 4666834: 0aa87d08     	bic	w8, w8, w8, asr #31
 4666838: f9418a60     	ldr	x0, [x19, #0x310]
 466683c: f90003ff     	str	xzr, [sp]
 4666840: 0aa97d29     	bic	w9, w9, w9, asr #31
 4666844: 290127e8     	stp	w8, w9, [sp, #0x8]
 4666848: b4000180     	cbz	x0, 0x4666878 <_ChromeMain+0x46615dc>
 466684c: b941b80a     	ldr	w10, [x0, #0x1b8]
 4666850: b941bc0b     	ldr	w11, [x0, #0x1bc]
 4666854: 2a0b014a     	orr	w10, w10, w11
 4666858: 350000ca     	cbnz	w10, 0x4666870 <_ChromeMain+0x46615d4>
 466685c: b941c00a     	ldr	w10, [x0, #0x1c0]
 4666860: b941c40b     	ldr	w11, [x0, #0x1c4]
 4666864: 6b08015f     	cmp	w10, w8
 4666868: 7a490160     	ccmp	w11, w9, #0x0, eq
 466686c: 54000060     	b.eq	0x4666878 <_ChromeMain+0x46615dc>
 4666870: 910003e1     	mov	x1, sp
 4666874: 9708f8c7     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4666878: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 466687c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4666880: 9100c3ff     	add	sp, sp, #0x30
 4666884: d65f03c0     	ret
 4666888: d4200000     	brk	#0
 466688c: d4400000     	hlt	#0
 4666890: d4200020     	brk	#0x1
 4666894: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4666898: a9017bfd     	stp	x29, x30, [sp, #0x10]
 466689c: 910043fd     	add	x29, sp, #0x10
 46668a0: aa0003f3     	mov	x19, x0
 46668a4: 394c7008     	ldrb	w8, [x0, #0x31c]
 46668a8: 35000108     	cbnz	w8, 0x46668c8 <_ChromeMain+0x466162c>
 46668ac: 910ca274     	add	x20, x19, #0x328
 46668b0: 394cc268     	ldrb	w8, [x19, #0x330]
 46668b4: 34000188     	cbz	w8, 0x46668e4 <_ChromeMain+0x4661648>
 46668b8: f9400280     	ldr	x0, [x20]
 46668bc: d360fc08     	lsr	x8, x0, #32
 46668c0: 2a0003e9     	mov	w9, w0
 46668c4: 14000004     	b	0x46668d4 <_ChromeMain+0x4661638>
 46668c8: d2800009     	mov	x9, #0x0                ; =0
 46668cc: b9431a68     	ldr	w8, [x19, #0x318]
 46668d0: 0aa87d08     	bic	w8, w8, w8, asr #31
 46668d4: aa088120     	orr	x0, x9, x8, lsl #32
 46668d8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46668dc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46668e0: d65f03c0     	ret
 46668e4: f9419e68     	ldr	x8, [x19, #0x338]
 46668e8: 91000508     	add	x8, x8, #0x1
 46668ec: f9019e68     	str	x8, [x19, #0x338]
 46668f0: f9418a60     	ldr	x0, [x19, #0x310]
 46668f4: f00483e1     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46668f8: 91050021     	add	x1, x1, #0x140
 46668fc: 9705bce1     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4666900: 394cc268     	ldrb	w8, [x19, #0x330]
 4666904: 34000068     	cbz	w8, 0x4666910 <_ChromeMain+0x4661674>
 4666908: f9000280     	str	x0, [x20]
 466690c: 17ffffec     	b	0x46668bc <_ChromeMain+0x4661620>
 4666910: b40000b4     	cbz	x20, 0x4666924 <_ChromeMain+0x4661688>
 4666914: f9019660     	str	x0, [x19, #0x328]
 4666918: 52800028     	mov	w8, #0x1                ; =1
 466691c: 390cc268     	strb	w8, [x19, #0x330]
 4666920: 17ffffe7     	b	0x46668bc <_ChromeMain+0x4661620>
 4666924: d4200020     	brk	#0x1
 4666928: 394d2008     	ldrb	w8, [x0, #0x348]
 466692c: 34000048     	cbz	w8, 0x4666934 <_ChromeMain+0x4661698>
 4666930: 390d201f     	strb	wzr, [x0, #0x348]
 4666934: 394cc008     	ldrb	w8, [x0, #0x330]
 4666938: 34000048     	cbz	w8, 0x4666940 <_ChromeMain+0x46616a4>
 466693c: 390cc01f     	strb	wzr, [x0, #0x330]
 4666940: 394c9008     	ldrb	w8, [x0, #0x324]
 4666944: 36000048     	tbz	w8, #0x0, 0x466694c <_ChromeMain+0x46616b0>
 4666948: d65f03c0     	ret
 466694c: f9400008     	ldr	x8, [x0]
 4666950: f9418501     	ldr	x1, [x8, #0x308]
 4666954: d61f0020     	br	x1
 4666958: 394d2008     	ldrb	w8, [x0, #0x348]
 466695c: 34000048     	cbz	w8, 0x4666964 <_ChromeMain+0x46616c8>
 4666960: 390d201f     	strb	wzr, [x0, #0x348]
 4666964: 394cc008     	ldrb	w8, [x0, #0x330]
 4666968: 34000048     	cbz	w8, 0x4666970 <_ChromeMain+0x46616d4>
 466696c: 390cc01f     	strb	wzr, [x0, #0x330]
 4666970: f9400008     	ldr	x8, [x0]
 4666974: f9418501     	ldr	x1, [x8, #0x308]
 4666978: d61f0020     	br	x1
 466697c: f9400428     	ldr	x8, [x1, #0x8]
 4666980: eb00011f     	cmp	x8, x0
 4666984: 540000a0     	b.eq	0x4666998 <_ChromeMain+0x46616fc>
 4666988: f9418809     	ldr	x9, [x0, #0x310]
 466698c: eb09011f     	cmp	x8, x9
 4666990: 54000040     	b.eq	0x4666998 <_ChromeMain+0x46616fc>
 4666994: d65f03c0     	ret
 4666998: 394d2008     	ldrb	w8, [x0, #0x348]
 466699c: 34000048     	cbz	w8, 0x46669a4 <_ChromeMain+0x4661708>
 46669a0: 390d201f     	strb	wzr, [x0, #0x348]
 46669a4: 394cc008     	ldrb	w8, [x0, #0x330]
 46669a8: 34000048     	cbz	w8, 0x46669b0 <_ChromeMain+0x4661714>
 46669ac: 390cc01f     	strb	wzr, [x0, #0x330]
 46669b0: f9400008     	ldr	x8, [x0]
 46669b4: f9418501     	ldr	x1, [x8, #0x308]
 46669b8: d61f0020     	br	x1
