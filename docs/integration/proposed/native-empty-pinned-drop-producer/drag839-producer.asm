
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465a3c0: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 465a3c4: a90167fa     	stp	x26, x25, [sp, #0x10]
 465a3c8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 465a3cc: a90357f6     	stp	x22, x21, [sp, #0x30]
 465a3d0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 465a3d4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 465a3d8: 910143fd     	add	x29, sp, #0x50
 465a3dc: 397e4008     	ldrb	w8, [x0, #0xf90]
 465a3e0: 36000128     	tbz	w8, #0x0, 0x465a404 <_ChromeMain+0x4655168>
 465a3e4: d2800000     	mov	x0, #0x0                ; =0
 465a3e8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 465a3ec: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 465a3f0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 465a3f4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 465a3f8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 465a3fc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 465a400: d65f03c0     	ret
 465a404: aa0003f3     	mov	x19, x0
 465a408: f9424008     	ldr	x8, [x0, #0x480]
 465a40c: b4fffec8     	cbz	x8, 0x465a3e4 <_ChromeMain+0x4655148>
 465a410: aa0103f4     	mov	x20, x1
 465a414: aa1303e0     	mov	x0, x19
 465a418: 97373457     	bl	0x1427574 <_ChromeMain+0x14222d8>
 465a41c: aa0003f6     	mov	x22, x0
 465a420: aa0103f5     	mov	x21, x1
 465a424: f9433668     	ldr	x8, [x19, #0x668]
 465a428: b4000368     	cbz	x8, 0x465a494 <_ChromeMain+0x46551f8>
 465a42c: 39472108     	ldrb	w8, [x8, #0x1c8]
 465a430: 34000328     	cbz	w8, 0x465a494 <_ChromeMain+0x46551f8>
 465a434: f9435268     	ldr	x8, [x19, #0x6a0]
 465a438: b40002e8     	cbz	x8, 0x465a494 <_ChromeMain+0x46551f8>
 465a43c: 39472119     	ldrb	w25, [x8, #0x1c8]
 465a440: 14000016     	b	0x465a498 <_ChromeMain+0x46551fc>
 465a444: 3607fd19     	tbz	w25, #0x0, 0x465a3e4 <_ChromeMain+0x4655148>
 465a448: d2800000     	mov	x0, #0x0                ; =0
 465a44c: b9400288     	ldr	w8, [x20]
 465a450: 6b16011f     	cmp	w8, w22
 465a454: 54fffcab     	b.lt	0x465a3e8 <_ChromeMain+0x465514c>
 465a458: 0b1602a9     	add	w9, w21, w22
 465a45c: 6b09011f     	cmp	w8, w9
 465a460: 54fffc4a     	b.ge	0x465a3e8 <_ChromeMain+0x465514c>
 465a464: b9400688     	ldr	w8, [x20, #0x4]
 465a468: d360fec9     	lsr	x9, x22, #32
 465a46c: 6b09011f     	cmp	w8, w9
 465a470: 54fffbab     	b.lt	0x465a3e4 <_ChromeMain+0x4655148>
 465a474: 8b558129     	add	x9, x9, x21, lsr #32
 465a478: 6b09011f     	cmp	w8, w9
 465a47c: 54fffb4a     	b.ge	0x465a3e4 <_ChromeMain+0x4655148>
 465a480: f9435268     	ldr	x8, [x19, #0x6a0]
 465a484: 9113e109     	add	x9, x8, #0x4f8
 465a488: f100011f     	cmp	x8, #0x0
 465a48c: 9a8903e0     	csel	x0, xzr, x9, eq
 465a490: 17ffffd6     	b	0x465a3e8 <_ChromeMain+0x465514c>
 465a494: 52800019     	mov	w25, #0x0               ; =0
 465a498: f9423e68     	ldr	x8, [x19, #0x478]
 465a49c: b4fffd48     	cbz	x8, 0x465a444 <_ChromeMain+0x46551a8>
 465a4a0: f942da68     	ldr	x8, [x19, #0x5b0]
 465a4a4: b4000108     	cbz	x8, 0x465a4c4 <_ChromeMain+0x4655228>
 465a4a8: f9424269     	ldr	x9, [x19, #0x480]
 465a4ac: f9419d2a     	ldr	x10, [x9, #0x338]
 465a4b0: b40000aa     	cbz	x10, 0x465a4c4 <_ChromeMain+0x4655228>
 465a4b4: f940214b     	ldr	x11, [x10, #0x40]
 465a4b8: 91002129     	add	x9, x9, #0x8
 465a4bc: eb09017f     	cmp	x11, x9
 465a4c0: 54001e20     	b.eq	0x465a884 <_ChromeMain+0x46555e8>
 465a4c4: f9435660     	ldr	x0, [x19, #0x6a8]
 465a4c8: b4000bc0     	cbz	x0, 0x465a640 <_ChromeMain+0x46553a4>
 465a4cc: f9424278     	ldr	x24, [x19, #0x480]
 465a4d0: f9419f08     	ldr	x8, [x24, #0x338]
 465a4d4: b40000a8     	cbz	x8, 0x465a4e8 <_ChromeMain+0x465524c>
 465a4d8: f9402109     	ldr	x9, [x8, #0x40]
 465a4dc: 9100230a     	add	x10, x24, #0x8
 465a4e0: eb0a013f     	cmp	x9, x10
 465a4e4: 540008a0     	b.eq	0x465a5f8 <_ChromeMain+0x465535c>
 465a4e8: 52800017     	mov	w23, #0x0               ; =0
 465a4ec: 39472008     	ldrb	w8, [x0, #0x1c8]
 465a4f0: 340001c8     	cbz	w8, 0x465a528 <_ChromeMain+0x465528c>
 465a4f4: 97373420     	bl	0x1427574 <_ChromeMain+0x14222d8>
 465a4f8: 29402688     	ldp	w8, w9, [x20]
 465a4fc: d360fc0a     	lsr	x10, x0, #32
 465a500: 8b41814b     	add	x11, x10, x1, lsr #32
 465a504: 6b0b013f     	cmp	w9, w11
 465a508: 1a9fa7eb     	cset	w11, lt
 465a50c: 6b0a013f     	cmp	w9, w10
 465a510: 1a8bb3e9     	csel	w9, wzr, w11, lt
 465a514: 0b00002a     	add	w10, w1, w0
 465a518: 6b0a011f     	cmp	w8, w10
 465a51c: 1a89a3e9     	csel	w9, wzr, w9, ge
 465a520: 6b00011f     	cmp	w8, w0
 465a524: 1a89b3e8     	csel	w8, wzr, w9, lt
 465a528: f9435669     	ldr	x9, [x19, #0x6a8]
 465a52c: b40003e9     	cbz	x9, 0x465a5a8 <_ChromeMain+0x465530c>
 465a530: f941b529     	ldr	x9, [x9, #0x368]
 465a534: f100013f     	cmp	x9, #0x0
 465a538: 1a9f0509     	csinc	w9, w8, wzr, eq
 465a53c: 37000369     	tbnz	w9, #0x0, 0x465a5a8 <_ChromeMain+0x465530c>
 465a540: f9424278     	ldr	x24, [x19, #0x480]
 465a544: b40007f8     	cbz	x24, 0x465a640 <_ChromeMain+0x46553a4>
 465a548: f9419f08     	ldr	x8, [x24, #0x338]
 465a54c: b40007a8     	cbz	x8, 0x465a640 <_ChromeMain+0x46553a4>
 465a550: f9402109     	ldr	x9, [x8, #0x40]
 465a554: 9100230a     	add	x10, x24, #0x8
 465a558: eb0a013f     	cmp	x9, x10
 465a55c: 54000721     	b.ne	0x465a640 <_ChromeMain+0x46553a4>
 465a560: b9402109     	ldr	w9, [x8, #0x20]
 465a564: 7100193f     	cmp	w9, #0x6
 465a568: 540006c0     	b.eq	0x465a640 <_ChromeMain+0x46553a4>
 465a56c: f9406909     	ldr	x9, [x8, #0xd0]
 465a570: 8b09112a     	add	x10, x9, x9, lsl #4
 465a574: d37df149     	lsl	x9, x10, #3
 465a578: b4000649     	cbz	x9, 0x465a640 <_ChromeMain+0x46553a4>
 465a57c: f940651a     	ldr	x26, [x8, #0xc8]
 465a580: 8b0a0f5b     	add	x27, x26, x10, lsl #3
 465a584: 5280040a     	mov	w10, #0x20              ; =32
 465a588: 386a6b4b     	ldrb	w11, [x26, x10]
 465a58c: 370005ab     	tbnz	w11, #0x0, 0x465a640 <_ChromeMain+0x46553a4>
 465a590: 9102214a     	add	x10, x10, #0x88
 465a594: f1022129     	subs	x9, x9, #0x88
 465a598: 54ffff81     	b.ne	0x465a588 <_ChromeMain+0x46552ec>
 465a59c: 3943e108     	ldrb	w8, [x8, #0xf8]
 465a5a0: 37000508     	tbnz	w8, #0x0, 0x465a640 <_ChromeMain+0x46553a4>
 465a5a4: 1400014f     	b	0x465aae0 <_ChromeMain+0x4655844>
 465a5a8: 6a0802ff     	tst	w23, w8
 465a5ac: 540004a0     	b.eq	0x465a640 <_ChromeMain+0x46553a4>
 465a5b0: 3960e668     	ldrb	w8, [x19, #0x839]
 465a5b4: 340001e8     	cbz	w8, 0x465a5f0 <_ChromeMain+0x4655354>
 465a5b8: 3920e67f     	strb	wzr, [x19, #0x839]
 465a5bc: aa1303e0     	mov	x0, x19
 465a5c0: 97ffab90     	bl	0x4645400 <_ChromeMain+0x4640164>
 465a5c4: f942e260     	ldr	x0, [x19, #0x5c0]
 465a5c8: b40000a0     	cbz	x0, 0x465a5dc <_ChromeMain+0x4655340>
 465a5cc: 52800001     	mov	w1, #0x0                ; =0
 465a5d0: 96ff57a9     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a5d4: f942e260     	ldr	x0, [x19, #0x5c0]
 465a5d8: 96fd1ae9     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a5dc: aa1303e0     	mov	x0, x19
 465a5e0: 52800001     	mov	w1, #0x0                ; =0
 465a5e4: 96ff57a4     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a5e8: aa1303e0     	mov	x0, x19
 465a5ec: 96fd1ae4     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a5f0: f9435a60     	ldr	x0, [x19, #0x6b0]
 465a5f4: 17ffff7d     	b	0x465a3e8 <_ChromeMain+0x465514c>
 465a5f8: b9402109     	ldr	w9, [x8, #0x20]
 465a5fc: 7100193f     	cmp	w9, #0x6
 465a600: 54fff740     	b.eq	0x465a4e8 <_ChromeMain+0x465524c>
 465a604: f9406909     	ldr	x9, [x8, #0xd0]
 465a608: 8b091129     	add	x9, x9, x9, lsl #4
 465a60c: d37df13a     	lsl	x26, x9, #3
 465a610: b4fff6da     	cbz	x26, 0x465a4e8 <_ChromeMain+0x465524c>
 465a614: f9406509     	ldr	x9, [x8, #0xc8]
 465a618: 9100812a     	add	x10, x9, #0x20
 465a61c: aa1a03eb     	mov	x11, x26
 465a620: 3848854c     	ldrb	w12, [x10], #0x88
 465a624: 370000ac     	tbnz	w12, #0x0, 0x465a638 <_ChromeMain+0x465539c>
 465a628: f102216b     	subs	x11, x11, #0x88
 465a62c: 54ffffa1     	b.ne	0x465a620 <_ChromeMain+0x4655384>
 465a630: 3943e108     	ldrb	w8, [x8, #0xf8]
 465a634: 36001b28     	tbz	w8, #0x0, 0x465a998 <_ChromeMain+0x46556fc>
 465a638: 52800017     	mov	w23, #0x0               ; =0
 465a63c: b5fff580     	cbnz	x0, 0x465a4ec <_ChromeMain+0x4655250>
 465a640: f9423e68     	ldr	x8, [x19, #0x478]
 465a644: b4000968     	cbz	x8, 0x465a770 <_ChromeMain+0x46554d4>
 465a648: f9419d17     	ldr	x23, [x8, #0x338]
 465a64c: b4000937     	cbz	x23, 0x465a770 <_ChromeMain+0x46554d4>
 465a650: f940cefa     	ldr	x26, [x23, #0x198]
 465a654: aa1703e0     	mov	x0, x23
 465a658: 973733c7     	bl	0x1427574 <_ChromeMain+0x14222d8>
 465a65c: 29402688     	ldp	w8, w9, [x20]
 465a660: 0b00002a     	add	w10, w1, w0
 465a664: d360fc0b     	lsr	x11, x0, #32
 465a668: 8b41816c     	add	x12, x11, x1, lsr #32
 465a66c: 6b0c013f     	cmp	w9, w12
 465a670: 1a9fa7ec     	cset	w12, lt
 465a674: 6b0b013f     	cmp	w9, w11
 465a678: 1a8cb3e9     	csel	w9, wzr, w12, lt
 465a67c: 6b00011f     	cmp	w8, w0
 465a680: 7a4aa100     	ccmp	w8, w10, #0x0, ge
 465a684: 1a89a3f8     	csel	w24, wzr, w9, ge
 465a688: b400041a     	cbz	x26, 0x465a708 <_ChromeMain+0x465546c>
 465a68c: 5280001a     	mov	w26, #0x0               ; =0
 465a690: 3960e668     	ldrb	w8, [x19, #0x839]
 465a694: 6b1a011f     	cmp	w8, w26
 465a698: 540001e0     	b.eq	0x465a6d4 <_ChromeMain+0x4655438>
 465a69c: 3920e67a     	strb	w26, [x19, #0x839]
 465a6a0: aa1303e0     	mov	x0, x19
 465a6a4: 97ffab57     	bl	0x4645400 <_ChromeMain+0x4640164>
 465a6a8: f942e260     	ldr	x0, [x19, #0x5c0]
 465a6ac: b40000a0     	cbz	x0, 0x465a6c0 <_ChromeMain+0x4655424>
 465a6b0: 52800001     	mov	w1, #0x0                ; =0
 465a6b4: 96ff5770     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a6b8: f942e260     	ldr	x0, [x19, #0x5c0]
 465a6bc: 96fd1ab0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a6c0: aa1303e0     	mov	x0, x19
 465a6c4: 52800001     	mov	w1, #0x0                ; =0
 465a6c8: 96ff576b     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a6cc: aa1303e0     	mov	x0, x19
 465a6d0: 96fd1aab     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a6d4: 2a1a0308     	orr	w8, w24, w26
 465a6d8: 360006c8     	tbz	w8, #0x0, 0x465a7b0 <_ChromeMain+0x4655514>
 465a6dc: f9418ee8     	ldr	x8, [x23, #0x318]
 465a6e0: f9402902     	ldr	x2, [x8, #0x50]
 465a6e4: 910c62e0     	add	x0, x23, #0x318
 465a6e8: aa1403e1     	mov	x1, x20
 465a6ec: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 465a6f0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 465a6f4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 465a6f8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 465a6fc: a94167fa     	ldp	x26, x25, [sp, #0x10]
 465a700: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 465a704: d61f0040     	br	x2
 465a708: f942427a     	ldr	x26, [x19, #0x480]
 465a70c: b4fffc3a     	cbz	x26, 0x465a690 <_ChromeMain+0x46553f4>
 465a710: f9419f48     	ldr	x8, [x26, #0x338]
 465a714: b4fffbc8     	cbz	x8, 0x465a68c <_ChromeMain+0x46553f0>
 465a718: f9402109     	ldr	x9, [x8, #0x40]
 465a71c: 9100234a     	add	x10, x26, #0x8
 465a720: eb0a013f     	cmp	x9, x10
 465a724: 54fffb41     	b.ne	0x465a68c <_ChromeMain+0x46553f0>
 465a728: b9402109     	ldr	w9, [x8, #0x20]
 465a72c: 7100193f     	cmp	w9, #0x6
 465a730: 54fffae0     	b.eq	0x465a68c <_ChromeMain+0x46553f0>
 465a734: f9406909     	ldr	x9, [x8, #0xd0]
 465a738: 8b09112a     	add	x10, x9, x9, lsl #4
 465a73c: d37df149     	lsl	x9, x10, #3
 465a740: b4fffa69     	cbz	x9, 0x465a68c <_ChromeMain+0x46553f0>
 465a744: f940651b     	ldr	x27, [x8, #0xc8]
 465a748: 8b0a0f7c     	add	x28, x27, x10, lsl #3
 465a74c: 5280040a     	mov	w10, #0x20              ; =32
 465a750: 386a6b6b     	ldrb	w11, [x27, x10]
 465a754: 3707f9cb     	tbnz	w11, #0x0, 0x465a68c <_ChromeMain+0x46553f0>
 465a758: 9102214a     	add	x10, x10, #0x88
 465a75c: f1022129     	subs	x9, x9, #0x88
 465a760: 54ffff81     	b.ne	0x465a750 <_ChromeMain+0x46554b4>
 465a764: 3943e108     	ldrb	w8, [x8, #0xf8]
 465a768: 3707f928     	tbnz	w8, #0x0, 0x465a68c <_ChromeMain+0x46553f0>
 465a76c: 140000b5     	b	0x465aa40 <_ChromeMain+0x46557a4>
 465a770: 3960e668     	ldrb	w8, [x19, #0x839]
 465a774: 340001e8     	cbz	w8, 0x465a7b0 <_ChromeMain+0x4655514>
 465a778: 3920e67f     	strb	wzr, [x19, #0x839]
 465a77c: aa1303e0     	mov	x0, x19
 465a780: 97ffab20     	bl	0x4645400 <_ChromeMain+0x4640164>
 465a784: f942e260     	ldr	x0, [x19, #0x5c0]
 465a788: b40000a0     	cbz	x0, 0x465a79c <_ChromeMain+0x4655500>
 465a78c: 52800001     	mov	w1, #0x0                ; =0
 465a790: 96ff5739     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a794: f942e260     	ldr	x0, [x19, #0x5c0]
 465a798: 96fd1a79     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a79c: aa1303e0     	mov	x0, x19
 465a7a0: 52800001     	mov	w1, #0x0                ; =0
 465a7a4: 96ff5734     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a7a8: aa1303e0     	mov	x0, x19
 465a7ac: 96fd1a74     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a7b0: 36000279     	tbz	w25, #0x0, 0x465a7fc <_ChromeMain+0x4655560>
 465a7b4: b9400288     	ldr	w8, [x20]
 465a7b8: 6b16011f     	cmp	w8, w22
 465a7bc: 5400020b     	b.lt	0x465a7fc <_ChromeMain+0x4655560>
 465a7c0: 0b1602a9     	add	w9, w21, w22
 465a7c4: 6b09011f     	cmp	w8, w9
 465a7c8: 540001aa     	b.ge	0x465a7fc <_ChromeMain+0x4655560>
 465a7cc: b9400697     	ldr	w23, [x20, #0x4]
 465a7d0: d360fec8     	lsr	x8, x22, #32
 465a7d4: 6b0802ff     	cmp	w23, w8
 465a7d8: 5400012b     	b.lt	0x465a7fc <_ChromeMain+0x4655560>
 465a7dc: 8b558108     	add	x8, x8, x21, lsr #32
 465a7e0: 6b0802ff     	cmp	w23, w8
 465a7e4: 540000ca     	b.ge	0x465a7fc <_ChromeMain+0x4655560>
 465a7e8: f9423e60     	ldr	x0, [x19, #0x478]
 465a7ec: 97373362     	bl	0x1427574 <_ChromeMain+0x14222d8>
 465a7f0: d360fc08     	lsr	x8, x0, #32
 465a7f4: 6b0802ff     	cmp	w23, w8
 465a7f8: 54ffe44b     	b.lt	0x465a480 <_ChromeMain+0x46551e4>
 465a7fc: aa1303e0     	mov	x0, x19
 465a800: 97ffdbdb     	bl	0x465176c <_ChromeMain+0x464c4d0>
 465a804: 29402289     	ldp	w9, w8, [x20]
 465a808: 6b00013f     	cmp	w9, w0
 465a80c: 5400014b     	b.lt	0x465a834 <_ChromeMain+0x4655598>
 465a810: 0b00002a     	add	w10, w1, w0
 465a814: 6b0a013f     	cmp	w9, w10
 465a818: 540000ea     	b.ge	0x465a834 <_ChromeMain+0x4655598>
 465a81c: d360fc0a     	lsr	x10, x0, #32
 465a820: 6b0a011f     	cmp	w8, w10
 465a824: 5400008b     	b.lt	0x465a834 <_ChromeMain+0x4655598>
 465a828: 8b41814a     	add	x10, x10, x1, lsr #32
 465a82c: 6b0a011f     	cmp	w8, w10
 465a830: 5400012b     	b.lt	0x465a854 <_ChromeMain+0x46555b8>
 465a834: 3607dd99     	tbz	w25, #0x0, 0x465a3e4 <_ChromeMain+0x4655148>
 465a838: d2800000     	mov	x0, #0x0                ; =0
 465a83c: 6b16013f     	cmp	w9, w22
 465a840: 54ffdd4b     	b.lt	0x465a3e8 <_ChromeMain+0x465514c>
 465a844: 0b1602aa     	add	w10, w21, w22
 465a848: 6b0a013f     	cmp	w9, w10
 465a84c: 54ffdcea     	b.ge	0x465a3e8 <_ChromeMain+0x465514c>
 465a850: 17ffff06     	b	0x465a468 <_ChromeMain+0x46551cc>
 465a854: f9423e68     	ldr	x8, [x19, #0x478]
 465a858: b4ffdc68     	cbz	x8, 0x465a3e4 <_ChromeMain+0x4655148>
 465a85c: f941b100     	ldr	x0, [x8, #0x360]
 465a860: b4ffdc40     	cbz	x0, 0x465a3e8 <_ChromeMain+0x465514c>
 465a864: aa1403e1     	mov	x1, x20
 465a868: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 465a86c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 465a870: a94357f6     	ldp	x22, x21, [sp, #0x30]
 465a874: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 465a878: a94167fa     	ldp	x26, x25, [sp, #0x10]
 465a87c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 465a880: 17eb67b0     	b	0x4134740 <_ChromeMain+0x412f4a4>
 465a884: b9402149     	ldr	w9, [x10, #0x20]
 465a888: 7100193f     	cmp	w9, #0x6
 465a88c: 54ffe1c0     	b.eq	0x465a4c4 <_ChromeMain+0x4655228>
 465a890: f9406949     	ldr	x9, [x10, #0xd0]
 465a894: 8b091129     	add	x9, x9, x9, lsl #4
 465a898: d37df129     	lsl	x9, x9, #3
 465a89c: b40000e9     	cbz	x9, 0x465a8b8 <_ChromeMain+0x465561c>
 465a8a0: f940654a     	ldr	x10, [x10, #0xc8]
 465a8a4: 9100814a     	add	x10, x10, #0x20
 465a8a8: 3848854b     	ldrb	w11, [x10], #0x88
 465a8ac: 3707e0cb     	tbnz	w11, #0x0, 0x465a4c4 <_ChromeMain+0x4655228>
 465a8b0: f1022129     	subs	x9, x9, #0x88
 465a8b4: 54ffffa1     	b.ne	0x465a8a8 <_ChromeMain+0x465560c>
 465a8b8: f9418d00     	ldr	x0, [x8, #0x318]
 465a8bc: 970911a9     	bl	0x89ef60 <_ChromeMain+0x899cc4>
 465a8c0: d360fc08     	lsr	x8, x0, #32
 465a8c4: 7100051f     	cmp	w8, #0x1
 465a8c8: 54ffdfeb     	b.lt	0x465a4c4 <_ChromeMain+0x4655228>
 465a8cc: f942da60     	ldr	x0, [x19, #0x5b0]
 465a8d0: 97373329     	bl	0x1427574 <_ChromeMain+0x14222d8>
 465a8d4: aa0003f7     	mov	x23, x0
 465a8d8: aa0103f8     	mov	x24, x1
 465a8dc: 52800720     	mov	w0, #0x39               ; =57
 465a8e0: 96faa3f8     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 465a8e4: b9400288     	ldr	w8, [x20]
 465a8e8: 6b17011f     	cmp	w8, w23
 465a8ec: 54ffdecb     	b.lt	0x465a4c4 <_ChromeMain+0x4655228>
 465a8f0: 0b170309     	add	w9, w24, w23
 465a8f4: 6b09011f     	cmp	w8, w9
 465a8f8: 54ffde6a     	b.ge	0x465a4c4 <_ChromeMain+0x4655228>
 465a8fc: d360fee8     	lsr	x8, x23, #32
 465a900: b9400689     	ldr	w9, [x20, #0x4]
 465a904: 6b08013f     	cmp	w9, w8
 465a908: 54ffddeb     	b.lt	0x465a4c4 <_ChromeMain+0x4655228>
 465a90c: 0b407c0a     	add	w10, w0, w0, lsr #31
 465a910: 2b8a050a     	adds	w10, w8, w10, asr #1
 465a914: 131f7d4b     	asr	w11, w10, #31
 465a918: 5201016b     	eor	w11, w11, #0x80000000
 465a91c: 1a8a616a     	csel	w10, w11, w10, vs
 465a920: 6b08014a     	subs	w10, w10, w8
 465a924: 131f7d4b     	asr	w11, w10, #31
 465a928: 5201016b     	eor	w11, w11, #0x80000000
 465a92c: 1a8a616a     	csel	w10, w11, w10, vs
 465a930: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 465a934: 0b080148     	add	w8, w10, w8
 465a938: 6b08013f     	cmp	w9, w8
 465a93c: 54ffdc4a     	b.ge	0x465a4c4 <_ChromeMain+0x4655228>
 465a940: f9423e68     	ldr	x8, [x19, #0x478]
 465a944: b4ffdc08     	cbz	x8, 0x465a4c4 <_ChromeMain+0x4655228>
 465a948: f941b117     	ldr	x23, [x8, #0x360]
 465a94c: b4ffdbd7     	cbz	x23, 0x465a4c4 <_ChromeMain+0x4655228>
 465a950: 3960e668     	ldrb	w8, [x19, #0x839]
 465a954: 340001e8     	cbz	w8, 0x465a990 <_ChromeMain+0x46556f4>
 465a958: 3920e67f     	strb	wzr, [x19, #0x839]
 465a95c: aa1303e0     	mov	x0, x19
 465a960: 97ffaaa8     	bl	0x4645400 <_ChromeMain+0x4640164>
 465a964: f942e260     	ldr	x0, [x19, #0x5c0]
 465a968: b40000a0     	cbz	x0, 0x465a97c <_ChromeMain+0x46556e0>
 465a96c: 52800001     	mov	w1, #0x0                ; =0
 465a970: 96ff56c1     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a974: f942e260     	ldr	x0, [x19, #0x5c0]
 465a978: 96fd1a01     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a97c: aa1303e0     	mov	x0, x19
 465a980: 52800001     	mov	w1, #0x0                ; =0
 465a984: 96ff56bc     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465a988: aa1303e0     	mov	x0, x19
 465a98c: 96fd19fc     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465a990: aa1703e0     	mov	x0, x23
 465a994: 17ffffb4     	b	0x465a864 <_ChromeMain+0x46555c8>
 465a998: 52800017     	mov	w23, #0x0               ; =0
 465a99c: 9100413b     	add	x27, x9, #0x10
 465a9a0: 14000004     	b	0x465a9b0 <_ChromeMain+0x4655714>
 465a9a4: 52800037     	mov	w23, #0x1               ; =1
 465a9a8: f102235a     	subs	x26, x26, #0x88
 465a9ac: 54000220     	b.eq	0x465a9f0 <_ChromeMain+0x4655754>
 465a9b0: f8488761     	ldr	x1, [x27], #0x88
 465a9b4: b4ffffa1     	cbz	x1, 0x465a9a8 <_ChromeMain+0x465570c>
 465a9b8: f9418f00     	ldr	x0, [x24, #0x318]
 465a9bc: b4000c00     	cbz	x0, 0x465ab3c <_ChromeMain+0x46558a0>
 465a9c0: 96e733d0     	bl	0x27900 <_ChromeMain+0x22664>
 465a9c4: 3100041f     	cmn	w0, #0x1
 465a9c8: 54000120     	b.eq	0x465a9ec <_ChromeMain+0x4655750>
 465a9cc: f9418f08     	ldr	x8, [x24, #0x318]
 465a9d0: b4000bc8     	cbz	x8, 0x465ab48 <_ChromeMain+0x46558ac>
 465a9d4: f9400108     	ldr	x8, [x8]
 465a9d8: 93407c01     	sxtw	x1, w0
 465a9dc: aa0803e0     	mov	x0, x8
 465a9e0: 97280e46     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 465a9e4: 39424008     	ldrb	w8, [x0, #0x90]
 465a9e8: 3607fde8     	tbz	w8, #0x0, 0x465a9a4 <_ChromeMain+0x4655708>
 465a9ec: 52800017     	mov	w23, #0x0               ; =0
 465a9f0: f9435660     	ldr	x0, [x19, #0x6a8]
 465a9f4: 17ffff12     	b	0x465a63c <_ChromeMain+0x46553a0>
 465a9f8: f9418f40     	ldr	x0, [x26, #0x318]
 465a9fc: b4000b80     	cbz	x0, 0x465ab6c <_ChromeMain+0x46558d0>
 465aa00: 96e733c0     	bl	0x27900 <_ChromeMain+0x22664>
 465aa04: 3100041f     	cmn	w0, #0x1
 465aa08: 54ffe420     	b.eq	0x465a68c <_ChromeMain+0x46553f0>
 465aa0c: f9418f48     	ldr	x8, [x26, #0x318]
 465aa10: b4000b48     	cbz	x8, 0x465ab78 <_ChromeMain+0x46558dc>
 465aa14: f9400108     	ldr	x8, [x8]
 465aa18: 93407c01     	sxtw	x1, w0
 465aa1c: aa0803e0     	mov	x0, x8
 465aa20: 97280e36     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 465aa24: 39424008     	ldrb	w8, [x0, #0x90]
 465aa28: 3707e328     	tbnz	w8, #0x0, 0x465a68c <_ChromeMain+0x46553f0>
 465aa2c: 9102237b     	add	x27, x27, #0x88
 465aa30: 52800028     	mov	w8, #0x1                ; =1
 465aa34: eb1c037f     	cmp	x27, x28
 465aa38: 54000061     	b.ne	0x465aa44 <_ChromeMain+0x46557a8>
 465aa3c: 14000008     	b	0x465aa5c <_ChromeMain+0x46557c0>
 465aa40: 52800008     	mov	w8, #0x0                ; =0
 465aa44: f9400b61     	ldr	x1, [x27, #0x10]
 465aa48: b5fffd81     	cbnz	x1, 0x465a9f8 <_ChromeMain+0x465575c>
 465aa4c: 9102237b     	add	x27, x27, #0x88
 465aa50: eb1c037f     	cmp	x27, x28
 465aa54: 54ffff81     	b.ne	0x465aa44 <_ChromeMain+0x46557a8>
 465aa58: 3607e1a8     	tbz	w8, #0x0, 0x465a68c <_ChromeMain+0x46553f0>
 465aa5c: aa1303e0     	mov	x0, x19
 465aa60: 97ffca64     	bl	0x464d3f0 <_ChromeMain+0x4648154>
 465aa64: 29402688     	ldp	w8, w9, [x20]
 465aa68: d360fc0a     	lsr	x10, x0, #32
 465aa6c: 8b41814b     	add	x11, x10, x1, lsr #32
 465aa70: 6b0b013f     	cmp	w9, w11
 465aa74: 1a9fa7eb     	cset	w11, lt
 465aa78: 6b0a013f     	cmp	w9, w10
 465aa7c: 1a8bb3e9     	csel	w9, wzr, w11, lt
 465aa80: 0b00002a     	add	w10, w1, w0
 465aa84: 6b0a011f     	cmp	w8, w10
 465aa88: 1a89a3e9     	csel	w9, wzr, w9, ge
 465aa8c: 6b00011f     	cmp	w8, w0
 465aa90: 1a89b3fa     	csel	w26, wzr, w9, lt
 465aa94: 17fffeff     	b	0x465a690 <_ChromeMain+0x46553f4>
 465aa98: f9418f00     	ldr	x0, [x24, #0x318]
 465aa9c: b40005c0     	cbz	x0, 0x465ab54 <_ChromeMain+0x46558b8>
 465aaa0: 96e73398     	bl	0x27900 <_ChromeMain+0x22664>
 465aaa4: 3100041f     	cmn	w0, #0x1
 465aaa8: 54ffdcc0     	b.eq	0x465a640 <_ChromeMain+0x46553a4>
 465aaac: f9418f08     	ldr	x8, [x24, #0x318]
 465aab0: b4000588     	cbz	x8, 0x465ab60 <_ChromeMain+0x46558c4>
 465aab4: f9400108     	ldr	x8, [x8]
 465aab8: 93407c01     	sxtw	x1, w0
 465aabc: aa0803e0     	mov	x0, x8
 465aac0: 97280e0e     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 465aac4: 39424008     	ldrb	w8, [x0, #0x90]
 465aac8: 3707dbc8     	tbnz	w8, #0x0, 0x465a640 <_ChromeMain+0x46553a4>
 465aacc: 9102235a     	add	x26, x26, #0x88
 465aad0: 52800028     	mov	w8, #0x1                ; =1
 465aad4: eb1b035f     	cmp	x26, x27
 465aad8: 54000061     	b.ne	0x465aae4 <_ChromeMain+0x4655848>
 465aadc: 14000008     	b	0x465aafc <_ChromeMain+0x4655860>
 465aae0: 52800008     	mov	w8, #0x0                ; =0
 465aae4: f9400b41     	ldr	x1, [x26, #0x10]
 465aae8: b5fffd81     	cbnz	x1, 0x465aa98 <_ChromeMain+0x46557fc>
 465aaec: 9102235a     	add	x26, x26, #0x88
 465aaf0: eb1b035f     	cmp	x26, x27
 465aaf4: 54ffff81     	b.ne	0x465aae4 <_ChromeMain+0x4655848>
 465aaf8: 3607da48     	tbz	w8, #0x0, 0x465a640 <_ChromeMain+0x46553a4>
 465aafc: aa1303e0     	mov	x0, x19
 465ab00: 97ffca3c     	bl	0x464d3f0 <_ChromeMain+0x4648154>
 465ab04: b9400288     	ldr	w8, [x20]
 465ab08: 6b00011f     	cmp	w8, w0
 465ab0c: 54ffd9ab     	b.lt	0x465a640 <_ChromeMain+0x46553a4>
 465ab10: 0b000029     	add	w9, w1, w0
 465ab14: 6b09011f     	cmp	w8, w9
 465ab18: 54ffd94a     	b.ge	0x465a640 <_ChromeMain+0x46553a4>
 465ab1c: b9400688     	ldr	w8, [x20, #0x4]
 465ab20: d360fc09     	lsr	x9, x0, #32
 465ab24: 6b09011f     	cmp	w8, w9
 465ab28: 54ffd8cb     	b.lt	0x465a640 <_ChromeMain+0x46553a4>
 465ab2c: 8b418129     	add	x9, x9, x1, lsr #32
 465ab30: 6b09011f     	cmp	w8, w9
 465ab34: 1a9fa7e8     	cset	w8, lt
 465ab38: 17fffe9c     	b	0x465a5a8 <_ChromeMain+0x465530c>
 465ab3c: d4200000     	brk	#0
 465ab40: d4400000     	hlt	#0
 465ab44: d4200020     	brk	#0x1
 465ab48: d4200000     	brk	#0
 465ab4c: d4400000     	hlt	#0
 465ab50: d4200020     	brk	#0x1
 465ab54: d4200000     	brk	#0
 465ab58: d4400000     	hlt	#0
 465ab5c: d4200020     	brk	#0x1
 465ab60: d4200000     	brk	#0
 465ab64: d4400000     	hlt	#0
 465ab68: d4200020     	brk	#0x1
 465ab6c: d4200000     	brk	#0
 465ab70: d4400000     	hlt	#0
 465ab74: d4200020     	brk	#0x1
 465ab78: d4200000     	brk	#0
 465ab7c: d4400000     	hlt	#0
 465ab80: d4200020     	brk	#0x1
 465ab84: 00000000     	udf	#0x0
