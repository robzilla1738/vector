
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4643390: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4643394: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4643398: 910043fd     	add	x29, sp, #0x10
 464339c: aa0003f3     	mov	x19, x0
 46433a0: f941b414     	ldr	x20, [x0, #0x368]
 46433a4: d360fc28     	lsr	x8, x1, #32
 46433a8: d3609c29     	ubfx	x9, x1, #32, #8
 46433ac: 3952d28a     	ldrb	w10, [x20, #0x4b4]
 46433b0: 6b28015f     	cmp	w10, w8, uxtb
 46433b4: 1a9f07eb     	cset	w11, ne
 46433b8: 6a09015f     	tst	w10, w9
 46433bc: 540000a0     	b.eq	0x46433d0 <_ChromeMain+0x463e134>
 46433c0: 36000628     	tbz	w8, #0x0, 0x4643484 <_ChromeMain+0x463e1e8>
 46433c4: b944b28a     	ldr	w10, [x20, #0x4b0]
 46433c8: 6b01015f     	cmp	w10, w1
 46433cc: 1a9f07eb     	cset	w11, ne
 46433d0: 0a080048     	and	w8, w2, w8
 46433d4: 3952e28a     	ldrb	w10, [x20, #0x4b8]
 46433d8: 6b08015f     	cmp	w10, w8
 46433dc: 1a9f17ec     	cset	w12, eq
 46433e0: 0a2b018b     	bic	w11, w12, w11
 46433e4: 3700022b     	tbnz	w11, #0x0, 0x4643428 <_ChromeMain+0x463e18c>
 46433e8: b904b281     	str	w1, [x20, #0x4b0]
 46433ec: 3912d289     	strb	w9, [x20, #0x4b4]
 46433f0: 3912e288     	strb	w8, [x20, #0x4b8]
 46433f4: f9400289     	ldr	x9, [x20]
 46433f8: f9405129     	ldr	x9, [x9, #0xa0]
 46433fc: aa1403e0     	mov	x0, x20
 4643400: aa0803e1     	mov	x1, x8
 4643404: d63f0120     	blr	x9
 4643408: f9416680     	ldr	x0, [x20, #0x2c8]
 464340c: b4000220     	cbz	x0, 0x4643450 <_ChromeMain+0x463e1b4>
 4643410: 3952e281     	ldrb	w1, [x20, #0x4b8]
 4643414: 9777ac5b     	bl	0x242e580 <_ChromeMain+0x24292e4>
 4643418: aa1403e0     	mov	x0, x20
 464341c: 94009889     	bl	0x4669640 <_ChromeMain+0x46643a4>
 4643420: f941b668     	ldr	x8, [x19, #0x368]
 4643424: 3952e10a     	ldrb	w10, [x8, #0x4b8]
 4643428: f941ae60     	ldr	x0, [x19, #0x358]
 464342c: f9400008     	ldr	x8, [x0]
 4643430: f9405108     	ldr	x8, [x8, #0xa0]
 4643434: 52800029     	mov	w9, #0x1                ; =1
 4643438: 0a2a0121     	bic	w1, w9, w10
 464343c: d63f0100     	blr	x8
 4643440: aa1303e0     	mov	x0, x19
 4643444: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4643448: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 464344c: 16fd774c     	b	0x5a117c <_ChromeMain+0x59bee0>
 4643450: 97228b2c     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4643454: 350001a0     	cbnz	w0, 0x4643488 <_ChromeMain+0x463e1ec>
 4643458: aa1403e0     	mov	x0, x20
 464345c: 97326c7e     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4643460: f9416688     	ldr	x8, [x20, #0x2c8]
 4643464: f9016680     	str	x0, [x20, #0x2c8]
 4643468: b4fffd48     	cbz	x8, 0x4643410 <_ChromeMain+0x463e174>
 464346c: f9400109     	ldr	x9, [x8]
 4643470: f9400529     	ldr	x9, [x9, #0x8]
 4643474: aa0803e0     	mov	x0, x8
 4643478: d63f0120     	blr	x9
 464347c: f9416680     	ldr	x0, [x20, #0x2c8]
 4643480: 17ffffe4     	b	0x4643410 <_ChromeMain+0x463e174>
 4643484: d4200020     	brk	#0x1
 4643488: 52803600     	mov	w0, #0x1b0              ; =432
 464348c: 96e72fb7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4643490: aa1403e1     	mov	x1, x20
 4643494: 972289bb     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4643498: 17fffff2     	b	0x4643460 <_ChromeMain+0x463e1c4>
