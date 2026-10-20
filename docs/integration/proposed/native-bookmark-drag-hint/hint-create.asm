
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4634090: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4634094: a90167fa     	stp	x26, x25, [sp, #0x10]
 4634098: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463409c: a90357f6     	stp	x22, x21, [sp, #0x30]
 46340a0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46340a4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46340a8: 910143fd     	add	x29, sp, #0x50
 46340ac: d10983ff     	sub	sp, sp, #0x260
 46340b0: 9004cfa8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 46340b4: f940f908     	ldr	x8, [x8, #0x1f0]
 46340b8: f9400108     	ldr	x8, [x8]
 46340bc: f81983a8     	stur	x8, [x29, #-0x68]
 46340c0: f9436c08     	ldr	x8, [x0, #0x6d8]
 46340c4: b5000148     	cbnz	x8, 0x46340ec <_ChromeMain+0x462ee50>
 46340c8: aa0003f3     	mov	x19, x0
 46340cc: f9400008     	ldr	x8, [x0]
 46340d0: f9403108     	ldr	x8, [x8, #0x60]
 46340d4: 90fe01c9     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 46340d8: 91394129     	add	x9, x9, #0xe50
 46340dc: eb09011f     	cmp	x8, x9
 46340e0: 540002a1     	b.ne	0x4634134 <_ChromeMain+0x462ee98>
 46340e4: f940c275     	ldr	x21, [x19, #0x180]
 46340e8: b5000375     	cbnz	x21, 0x4634154 <_ChromeMain+0x462eeb8>
 46340ec: f85983a8     	ldur	x8, [x29, #-0x68]
 46340f0: 9004cfa9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 46340f4: f940f929     	ldr	x9, [x9, #0x1f0]
 46340f8: f9400129     	ldr	x9, [x9]
 46340fc: eb08013f     	cmp	x9, x8
 4634100: 54003701     	b.ne	0x46347e0 <_ChromeMain+0x462f544>
 4634104: 910983ff     	add	sp, sp, #0x260
 4634108: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463410c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4634110: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4634114: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4634118: a94167fa     	ldp	x26, x25, [sp, #0x10]
 463411c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4634120: d65f03c0     	ret
 4634124: 972c61a8     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4634128: 52800a01     	mov	w1, #0x50               ; =80
 463412c: 96e75363     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4634130: 14000088     	b	0x4634350 <_ChromeMain+0x462f0b4>
 4634134: 90fdffe9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4634138: 9120c129     	add	x9, x9, #0x830
 463413c: eb09011f     	cmp	x8, x9
 4634140: 54fffd20     	b.eq	0x46340e4 <_ChromeMain+0x462ee48>
 4634144: aa1303e0     	mov	x0, x19
 4634148: d63f0100     	blr	x8
 463414c: aa0003f5     	mov	x21, x0
 4634150: b4fffcf5     	cbz	x21, 0x46340ec <_ChromeMain+0x462ee50>
 4634154: d00546b9     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4634158: 91120339     	add	x25, x25, #0x480
 463415c: f8bfc320     	ldapr	x0, [x25]
 4634160: b4003580     	cbz	x0, 0x4634810 <_ChromeMain+0x462f574>
 4634164: 52806301     	mov	w1, #0x318              ; =792
 4634168: d2800002     	mov	x2, #0x0                ; =0
 463416c: 96e9dd11     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4634170: aa0003f4     	mov	x20, x0
 4634174: 9734ebf3     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4634178: 900507c8     	adrp	x8, 0xe72c000 <dyld_stub_binder+0xe72c000>
 463417c: 911dc108     	add	x8, x8, #0x770
 4634180: 910fa109     	add	x9, x8, #0x3e8
 4634184: a9002408     	stp	x8, x9, [x0]
 4634188: 91104109     	add	x9, x8, #0x410
 463418c: f9000809     	str	x9, [x0, #0x10]
 4634190: 91112109     	add	x9, x8, #0x448
 4634194: 9111e10a     	add	x10, x8, #0x478
 4634198: a906a809     	stp	x9, x10, [x0, #0x68]
 463419c: 91132109     	add	x9, x8, #0x4c8
 46341a0: f9005809     	str	x9, [x0, #0xb0]
 46341a4: 9114a109     	add	x9, x8, #0x528
 46341a8: f9006c09     	str	x9, [x0, #0xd8]
 46341ac: 91156108     	add	x8, x8, #0x558
 46341b0: aa0003f6     	mov	x22, x0
 46341b4: f80f8ec8     	str	x8, [x22, #0xf8]!
 46341b8: f901881f     	str	xzr, [x0, #0x310]
 46341bc: f8bfc320     	ldapr	x0, [x25]
 46341c0: b40032c0     	cbz	x0, 0x4634818 <_ChromeMain+0x462f57c>
 46341c4: 52808c01     	mov	w1, #0x460              ; =1120
 46341c8: d2800002     	mov	x2, #0x0                ; =0
 46341cc: 96e9dcf9     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46341d0: aa0003f7     	mov	x23, x0
 46341d4: d2800001     	mov	x1, #0x0                ; =0
 46341d8: d2800002     	mov	x2, #0x0                ; =0
 46341dc: 528000a3     	mov	w3, #0x5                ; =5
 46341e0: 52820004     	mov	w4, #0x1000             ; =4096
 46341e4: 52800005     	mov	w5, #0x0                ; =0
 46341e8: 975559be     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 46341ec: 3945a408     	ldrb	w8, [x0, #0x169]
 46341f0: 35002f28     	cbnz	w8, 0x46347d4 <_ChromeMain+0x462f538>
 46341f4: f940ce82     	ldr	x2, [x20, #0x198]
 46341f8: aa1403e0     	mov	x0, x20
 46341fc: aa1703e1     	mov	x1, x23
 4634200: 9705147f     	bl	0x7793fc <_ChromeMain+0x774160>
 4634204: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4634208: d0052bfa     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463420c: f9404749     	ldr	x9, [x26, #0x88]
 4634210: eb09011f     	cmp	x8, x9
 4634214: 54000061     	b.ne	0x4634220 <_ChromeMain+0x462ef84>
 4634218: aa1703e0     	mov	x0, x23
 463421c: 96e78038     	bl	0x142fc <_ChromeMain+0xf060>
 4634220: f9418a80     	ldr	x0, [x20, #0x310]
 4634224: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4634228: f9404749     	ldr	x9, [x26, #0x88]
 463422c: eb09011f     	cmp	x8, x9
 4634230: 54000041     	b.ne	0x4634238 <_ChromeMain+0x462ef9c>
 4634234: 96e7ba02     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634238: f9018a97     	str	x23, [x20, #0x310]
 463423c: 52802028     	mov	w8, #0x101              ; =257
 4634240: b81783a8     	stur	w8, [x29, #-0x88]
 4634244: 3817c3bf     	sturb	wzr, [x29, #-0x84]
 4634248: f94002e8     	ldr	x8, [x23]
 463424c: f941f508     	ldr	x8, [x8, #0x3e8]
 4634250: d10223a1     	sub	x1, x29, #0x88
 4634254: aa1703e0     	mov	x0, x23
 4634258: d63f0100     	blr	x8
 463425c: f9418a80     	ldr	x0, [x20, #0x310]
 4634260: 52800001     	mov	w1, #0x0                ; =0
 4634264: 975556a7     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4634268: f9418a80     	ldr	x0, [x20, #0x310]
 463426c: 52800021     	mov	w1, #0x1                ; =1
 4634270: 95814e34     	bl	0xa687b40 <_ChromeMain+0xa6828a4>
 4634274: f9418a80     	ldr	x0, [x20, #0x310]
 4634278: 52800021     	mov	w1, #0x1                ; =1
 463427c: 95814e62     	bl	0xa687c04 <_ChromeMain+0xa682968>
 4634280: f9418a80     	ldr	x0, [x20, #0x310]
 4634284: 52800001     	mov	w1, #0x0                ; =0
 4634288: 96fdb2ae     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 463428c: f9418a80     	ldr	x0, [x20, #0x310]
 4634290: 528021c1     	mov	w1, #0x10e              ; =270
 4634294: 95814f2b     	bl	0xa687f40 <_ChromeMain+0xa682ca4>
 4634298: f9418a97     	ldr	x23, [x20, #0x310]
 463429c: 528000a8     	mov	w8, #0x5                ; =5
 46342a0: 381973a8     	sturb	w8, [x29, #-0x69]
 46342a4: d10203a9     	sub	x9, x29, #0x80
 46342a8: aa080128     	orr	x8, x9, x8
 46342ac: f004a40a     	adrp	x10, 0xdab7000 <dyld_stub_binder+0xdab7000>
 46342b0: 9131494a     	add	x10, x10, #0xc52
 46342b4: eb0a011f     	cmp	x8, x10
 46342b8: fa4a8122     	ccmp	x9, x10, #0x2, hi
 46342bc: 54002909     	b.ls	0x46347dc <_ChromeMain+0x462f540>
 46342c0: 528ca8e8     	mov	w8, #0x6547             ; =25927
 46342c4: 72ae6d28     	movk	w8, #0x7369, lsl #16
 46342c8: b81803a8     	stur	w8, [x29, #-0x80]
 46342cc: 52800e88     	mov	w8, #0x74               ; =116
 46342d0: 781843a8     	sturh	w8, [x29, #-0x7c]
 46342d4: 52800300     	mov	w0, #0x18               ; =24
 46342d8: 96e76c24     	bl	0xf368 <_ChromeMain+0xa0cc>
 46342dc: 52800028     	mov	w8, #0x1                ; =1
 46342e0: f9008be0     	str	x0, [sp, #0x110]
 46342e4: f90093e8     	str	x8, [sp, #0x120]
 46342e8: b40027a0     	cbz	x0, 0x46347dc <_ChromeMain+0x462f540>
 46342ec: 910443f8     	add	x24, sp, #0x110
 46342f0: 3dc04b00     	ldr	q0, [x24, #0x120]
 46342f4: 3d800000     	str	q0, [x0]
 46342f8: f85903a8     	ldur	x8, [x29, #-0x70]
 46342fc: f9000808     	str	x8, [x0, #0x10]
 4634300: 52800028     	mov	w8, #0x1                ; =1
 4634304: f9008fe8     	str	x8, [sp, #0x118]
 4634308: d10243a0     	sub	x0, x29, #0x90
 463430c: 910443e1     	add	x1, sp, #0x110
 4634310: 52800002     	mov	w2, #0x0                ; =0
 4634314: 52800183     	mov	w3, #0xc                ; =12
 4634318: 52803204     	mov	w4, #0x190              ; =400
 463431c: 9526421a     	bl	0x8fc4b84 <_ChromeMain+0x8fbf8e8>
 4634320: f94002e8     	ldr	x8, [x23]
 4634324: f941ed08     	ldr	x8, [x8, #0x3d8]
 4634328: d10243a1     	sub	x1, x29, #0x90
 463432c: aa1703e0     	mov	x0, x23
 4634330: d63f0100     	blr	x8
 4634334: f85703a0     	ldur	x0, [x29, #-0x90]
 4634338: b40000c0     	cbz	x0, 0x4634350 <_ChromeMain+0x462f0b4>
 463433c: b9400009     	ldr	w9, [x0]
 4634340: 51000528     	sub	w8, w9, #0x1
 4634344: b9000008     	str	w8, [x0]
 4634348: 34002709     	cbz	w9, 0x4634828 <_ChromeMain+0x462f58c>
 463434c: 34ffeec8     	cbz	w8, 0x4634124 <_ChromeMain+0x462ee88>
 4634350: f9408bf7     	ldr	x23, [sp, #0x110]
 4634354: b5001f77     	cbnz	x23, 0x4634740 <_ChromeMain+0x462f4a4>
 4634358: f9418a80     	ldr	x0, [x20, #0x310]
 463435c: 52800201     	mov	w1, #0x10               ; =16
 4634360: 95814e10     	bl	0xa687ba0 <_ChromeMain+0xa682904>
 4634364: f9418a97     	ldr	x23, [x20, #0x310]
 4634368: 394edae8     	ldrb	w8, [x23, #0x3b6]
 463436c: 35001ca8     	cbnz	w8, 0x4634700 <_ChromeMain+0x462f464>
 4634370: aa1703e0     	mov	x0, x23
 4634374: 52800001     	mov	w1, #0x0                ; =0
 4634378: 97842bfe     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 463437c: f9418a97     	ldr	x23, [x20, #0x310]
 4634380: 52800400     	mov	w0, #0x20               ; =32
 4634384: 96e76bf9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4634388: aa0003e1     	mov	x1, x0
 463438c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4634390: b9000808     	str	w8, [x0, #0x8]
 4634394: 52800028     	mov	w8, #0x1                ; =1
 4634398: 39003008     	strb	w8, [x0, #0xc]
 463439c: 9004e8c8     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 46343a0: 91044108     	add	x8, x8, #0x110
 46343a4: f9000008     	str	x8, [x0]
 46343a8: d2800088     	mov	x8, #0x4                ; =4
 46343ac: f2c00148     	movk	x8, #0xa, lsl #32
 46343b0: 4e080d00     	dup.2d	v0, x8
 46343b4: 3d800400     	str	q0, [x0, #0x10]
 46343b8: f94002e8     	ldr	x8, [x23]
 46343bc: f9408908     	ldr	x8, [x8, #0x110]
 46343c0: aa1703e0     	mov	x0, x23
 46343c4: d63f0100     	blr	x8
 46343c8: 3946a688     	ldrb	w8, [x20, #0x1a9]
 46343cc: 340000a8     	cbz	w8, 0x46343e0 <_ChromeMain+0x462f144>
 46343d0: 3906a69f     	strb	wzr, [x20, #0x1a9]
 46343d4: 9106a681     	add	x1, x20, #0x1a9
 46343d8: aa1603e0     	mov	x0, x22
 46343dc: 9723cefd     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46343e0: f9418a96     	ldr	x22, [x20, #0x310]
 46343e4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46343e8: f9404749     	ldr	x9, [x26, #0x88]
 46343ec: eb09011f     	cmp	x8, x9
 46343f0: 54000061     	b.ne	0x46343fc <_ChromeMain+0x462f160>
 46343f4: aa1603e0     	mov	x0, x22
 46343f8: 96e77fc1     	bl	0x142fc <_ChromeMain+0xf060>
 46343fc: f9437260     	ldr	x0, [x19, #0x6e0]
 4634400: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4634404: f9404749     	ldr	x9, [x26, #0x88]
 4634408: eb09011f     	cmp	x8, x9
 463440c: 54000041     	b.ne	0x4634414 <_ChromeMain+0x462f178>
 4634410: 96e7b98b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634414: f9037276     	str	x22, [x19, #0x6e0]
 4634418: f8bfc320     	ldapr	x0, [x25]
 463441c: b4002020     	cbz	x0, 0x4634820 <_ChromeMain+0x462f584>
 4634420: 52806901     	mov	w1, #0x348              ; =840
 4634424: d2800002     	mov	x2, #0x0                ; =0
 4634428: 96e9dc62     	bl	0xab5b0 <_ChromeMain+0xa6314>
 463442c: aa0003f6     	mov	x22, x0
 4634430: 978d5ebc     	bl	0x298bf20 <_ChromeMain+0x2986c84>
 4634434: f9436e60     	ldr	x0, [x19, #0x6d8]
 4634438: f9036e76     	str	x22, [x19, #0x6d8]
 463443c: b4000080     	cbz	x0, 0x463444c <_ChromeMain+0x462f1b0>
 4634440: f9400008     	ldr	x8, [x0]
 4634444: f9400508     	ldr	x8, [x8, #0x8]
 4634448: d63f0100     	blr	x8
 463444c: f9010bff     	str	xzr, [sp, #0x210]
 4634450: 6f00e400     	movi.2d	v0, #0000000000000000
 4634454: ad070300     	stp	q0, q0, [x24, #0xe0]
 4634458: ad060300     	stp	q0, q0, [x24, #0xc0]
 463445c: ad050300     	stp	q0, q0, [x24, #0xa0]
 4634460: ad040300     	stp	q0, q0, [x24, #0x80]
 4634464: ad030300     	stp	q0, q0, [x24, #0x60]
 4634468: ad020300     	stp	q0, q0, [x24, #0x40]
 463446c: ad010300     	stp	q0, q0, [x24, #0x20]
 4634470: ad000300     	stp	q0, q0, [x24]
 4634474: 910443e0     	add	x0, sp, #0x110
 4634478: 52800001     	mov	w1, #0x0                ; =0
 463447c: 528000e2     	mov	w2, #0x7                ; =7
 4634480: 97930510     	bl	0x2af58c0 <_ChromeMain+0x2af0624>
 4634484: 390503ff     	strb	wzr, [sp, #0x140]
 4634488: 52800048     	mov	w8, #0x2                ; =2
 463448c: b9013fe8     	str	w8, [sp, #0x13c]
 4634490: 52800028     	mov	w8, #0x1                ; =1
 4634494: 0f000440     	movi.2s	v0, #0x2
 4634498: fc034300     	stur	d0, [x24, #0x34]
 463449c: 390533e8     	strb	w8, [sp, #0x14c]
 46344a0: 52800089     	mov	w9, #0x4                ; =4
 46344a4: b9015fe8     	str	w8, [sp, #0x15c]
 46344a8: b90153e9     	str	w9, [sp, #0x150]
 46344ac: f94072a8     	ldr	x8, [x21, #0xe0]
 46344b0: b40013e8     	cbz	x8, 0x463472c <_ChromeMain+0x462f490>
 46344b4: 19404108     	ldapurb	w8, [x8, #0x4]
 46344b8: 350013a8     	cbnz	w8, 0x463472c <_ChromeMain+0x462f490>
 46344bc: f94076a8     	ldr	x8, [x21, #0xe8]
 46344c0: b4001368     	cbz	x8, 0x463472c <_ChromeMain+0x462f490>
 46344c4: f94072a8     	ldr	x8, [x21, #0xe0]
 46344c8: b4001928     	cbz	x8, 0x46347ec <_ChromeMain+0x462f550>
 46344cc: 19404108     	ldapurb	w8, [x8, #0x4]
 46344d0: 350018e8     	cbnz	w8, 0x46347ec <_ChromeMain+0x462f550>
 46344d4: f94076a0     	ldr	x0, [x21, #0xe8]
 46344d8: d10203a8     	sub	x8, x29, #0x80
 46344dc: 97420c61     	bl	0x16b7660 <_ChromeMain+0x16b23c4>
 46344e0: f85803a0     	ldur	x0, [x29, #-0x80]
 46344e4: 9500df0a     	bl	0x866c10c <_ChromeMain+0x8666e70>
 46344e8: aa0003f6     	mov	x22, x0
 46344ec: f940c7e0     	ldr	x0, [sp, #0x188]
 46344f0: aa1603e1     	mov	x1, x22
 46344f4: 9500df03     	bl	0x866c100 <_ChromeMain+0x8666e64>
 46344f8: aa1603e0     	mov	x0, x22
 46344fc: 94e73c98     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4634500: f85803b6     	ldur	x22, [x29, #-0x80]
 4634504: f81803bf     	stur	xzr, [x29, #-0x80]
 4634508: b40000d6     	cbz	x22, 0x4634520 <_ChromeMain+0x462f284>
 463450c: aa1603e0     	mov	x0, x22
 4634510: 9500df02     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4634514: aa1603e0     	mov	x0, x22
 4634518: 52800101     	mov	w1, #0x8                ; =8
 463451c: 96e75267     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4634520: f94072a8     	ldr	x8, [x21, #0xe0]
 4634524: b40014c8     	cbz	x8, 0x46347bc <_ChromeMain+0x462f520>
 4634528: 19404108     	ldapurb	w8, [x8, #0x4]
 463452c: 35001488     	cbnz	w8, 0x46347bc <_ChromeMain+0x462f520>
 4634530: f94076a8     	ldr	x8, [x21, #0xe8]
 4634534: b4001448     	cbz	x8, 0x46347bc <_ChromeMain+0x462f520>
 4634538: f94072a8     	ldr	x8, [x21, #0xe0]
 463453c: b40015e8     	cbz	x8, 0x46347f8 <_ChromeMain+0x462f55c>
 4634540: 19404108     	ldapurb	w8, [x8, #0x4]
 4634544: 350015a8     	cbnz	w8, 0x46347f8 <_ChromeMain+0x462f55c>
 4634548: f94076a8     	ldr	x8, [x21, #0xe8]
 463454c: f9402508     	ldr	x8, [x8, #0x48]
 4634550: b40017a8     	cbz	x8, 0x4634844 <_ChromeMain+0x462f5a8>
 4634554: f940a516     	ldr	x22, [x8, #0x148]
 4634558: aa1603e0     	mov	x0, x22
 463455c: 94e73c83     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4634560: 94e73c82     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4634564: 94e73c81     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4634568: 52800100     	mov	w0, #0x8                ; =8
 463456c: 96e76b7f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4634570: aa0003f5     	mov	x21, x0
 4634574: f900001f     	str	xzr, [x0]
 4634578: aa1603e1     	mov	x1, x22
 463457c: 9500dee1     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4634580: aa1603e0     	mov	x0, x22
 4634584: 94e73c76     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4634588: aa1603e0     	mov	x0, x22
 463458c: 94e73c74     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4634590: aa1603e0     	mov	x0, x22
 4634594: 94e73c72     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4634598: aa1503e0     	mov	x0, x21
 463459c: 9500dedc     	bl	0x866c10c <_ChromeMain+0x8666e70>
 46345a0: aa0003f7     	mov	x23, x0
 46345a4: f940ebe0     	ldr	x0, [sp, #0x1d0]
 46345a8: aa1703e1     	mov	x1, x23
 46345ac: 9500ded5     	bl	0x866c100 <_ChromeMain+0x8666e64>
 46345b0: aa1703e0     	mov	x0, x23
 46345b4: 94e73c6a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 46345b8: f900eff6     	str	x22, [sp, #0x1d8]
 46345bc: b40000d5     	cbz	x21, 0x46345d4 <_ChromeMain+0x462f338>
 46345c0: aa1503e0     	mov	x0, x21
 46345c4: 9500ded5     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 46345c8: aa1503e0     	mov	x0, x21
 46345cc: 52800101     	mov	w1, #0x8                ; =8
 46345d0: 96e7523a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46345d4: f004c828     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 46345d8: 3dc08d00     	ldr	q0, [x8, #0x230]
 46345dc: 3d802300     	str	q0, [x24, #0x80]
 46345e0: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 46345e4: 37f80868     	tbnz	w8, #0x1f, 0x46346f0 <_ChromeMain+0x462f454>
 46345e8: 910443e8     	add	x8, sp, #0x110
 46345ec: 91004108     	add	x8, x8, #0x10
 46345f0: 52800269     	mov	w9, #0x13               ; =19
 46345f4: 3904dfe9     	strb	w9, [sp, #0x137]
 46345f8: 528d2ec9     	mov	w9, #0x6976             ; =26998
 46345fc: 72aeeca9     	movk	w9, #0x7765, lsl #16
 4634600: b800f109     	stur	w9, [x8, #0xf]
 4634604: f004c4a9     	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4634608: 91367d29     	add	x9, x9, #0xd9f
 463460c: 3dc00120     	ldr	q0, [x9]
 4634610: 3d800100     	str	q0, [x8]
 4634614: 39004d1f     	strb	wzr, [x8, #0x13]
 4634618: f9436e75     	ldr	x21, [x19, #0x6d8]
 463461c: 910023e0     	add	x0, sp, #0x8
 4634620: 910443e1     	add	x1, sp, #0x110
 4634624: 97930523     	bl	0x2af5ab0 <_ChromeMain+0x2af0814>
 4634628: 910023e1     	add	x1, sp, #0x8
 463462c: aa1503e0     	mov	x0, x21
 4634630: 97930684     	bl	0x2af6040 <_ChromeMain+0x2af0da4>
 4634634: 910023e0     	add	x0, sp, #0x8
 4634638: 97420b6a     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 463463c: f9436e68     	ldr	x8, [x19, #0x6d8]
 4634640: f9407109     	ldr	x9, [x8, #0xe0]
 4634644: b40002e9     	cbz	x9, 0x46346a0 <_ChromeMain+0x462f404>
 4634648: 19404129     	ldapurb	w9, [x9, #0x4]
 463464c: 350002a9     	cbnz	w9, 0x46346a0 <_ChromeMain+0x462f404>
 4634650: f9407509     	ldr	x9, [x8, #0xe8]
 4634654: b4000269     	cbz	x9, 0x46346a0 <_ChromeMain+0x462f404>
 4634658: f9407109     	ldr	x9, [x8, #0xe0]
 463465c: b4000d49     	cbz	x9, 0x4634804 <_ChromeMain+0x462f568>
 4634660: 19404129     	ldapurb	w9, [x9, #0x4]
 4634664: 35000d09     	cbnz	w9, 0x4634804 <_ChromeMain+0x462f568>
 4634668: f9407508     	ldr	x8, [x8, #0xe8]
 463466c: f9402508     	ldr	x8, [x8, #0x48]
 4634670: b4000188     	cbz	x8, 0x46346a0 <_ChromeMain+0x462f404>
 4634674: f9408509     	ldr	x9, [x8, #0x108]
 4634678: 5280230a     	mov	w10, #0x118             ; =280
 463467c: 5280280b     	mov	w11, #0x140             ; =320
 4634680: f100013f     	cmp	x9, #0x0
 4634684: 9a8a0169     	csel	x9, x11, x10, eq
 4634688: f8696900     	ldr	x0, [x8, x9]
 463468c: b40000a0     	cbz	x0, 0x46346a0 <_ChromeMain+0x462f404>
 4634690: f9400008     	ldr	x8, [x0]
 4634694: f9405108     	ldr	x8, [x8, #0xa0]
 4634698: 52800001     	mov	w1, #0x0                ; =0
 463469c: d63f0100     	blr	x8
 46346a0: f9436e75     	ldr	x21, [x19, #0x6d8]
 46346a4: f940caa0     	ldr	x0, [x21, #0x190]
 46346a8: 977dddd8     	bl	0x25abe08 <_ChromeMain+0x25a6b6c>
 46346ac: eb00029f     	cmp	x20, x0
 46346b0: 540001a0     	b.eq	0x46346e4 <_ChromeMain+0x462f448>
 46346b4: f940cab3     	ldr	x19, [x21, #0x190]
 46346b8: aa1303e0     	mov	x0, x19
 46346bc: 52800021     	mov	w1, #0x1                ; =1
 46346c0: 978e8d98     	bl	0x29d7d20 <_ChromeMain+0x29d2a84>
 46346c4: f940ce68     	ldr	x8, [x19, #0x198]
 46346c8: b5000b68     	cbnz	x8, 0x4634834 <_ChromeMain+0x462f598>
 46346cc: d2800002     	mov	x2, #0x0                ; =0
 46346d0: aa1303e0     	mov	x0, x19
 46346d4: aa1403e1     	mov	x1, x20
 46346d8: 97051349     	bl	0x7793fc <_ChromeMain+0x774160>
 46346dc: f940caa0     	ldr	x0, [x21, #0x190]
 46346e0: 9709c4d5     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 46346e4: 910443e0     	add	x0, sp, #0x110
 46346e8: 97420b3e     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 46346ec: 17fffe80     	b	0x46340ec <_ChromeMain+0x462ee50>
 46346f0: 52800268     	mov	w8, #0x13               ; =19
 46346f4: f90097e8     	str	x8, [sp, #0x128]
 46346f8: f94093e8     	ldr	x8, [sp, #0x120]
 46346fc: 17ffffbf     	b	0x46345f8 <_ChromeMain+0x462f35c>
 4634700: 390edaff     	strb	wzr, [x23, #0x3b6]
 4634704: aa1703e0     	mov	x0, x23
 4634708: 9723cf00     	bl	0xf28308 <_ChromeMain+0xf2306c>
 463470c: aa1703e0     	mov	x0, x23
 4634710: 52800041     	mov	w1, #0x2                ; =2
 4634714: 9706b494     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4634718: 9103e2e0     	add	x0, x23, #0xf8
 463471c: 910edae1     	add	x1, x23, #0x3b6
 4634720: 9723ce2c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4634724: f9418a97     	ldr	x23, [x20, #0x310]
 4634728: 17ffff12     	b	0x4634370 <_ChromeMain+0x462f0d4>
 463472c: 52800100     	mov	w0, #0x8                ; =8
 4634730: 96e76b0e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4634734: f900001f     	str	xzr, [x0]
 4634738: f81803a0     	stur	x0, [x29, #-0x80]
 463473c: 17ffff6a     	b	0x46344e4 <_ChromeMain+0x462f248>
 4634740: f9408fe8     	ldr	x8, [sp, #0x118]
 4634744: 8b080509     	add	x9, x8, x8, lsl #1
 4634748: d37df129     	lsl	x9, x9, #3
 463474c: b40004c9     	cbz	x9, 0x46347e4 <_ChromeMain+0x462f548>
 4634750: 8b170129     	add	x9, x9, x23
 4634754: d100613b     	sub	x27, x9, #0x18
 4634758: d37df109     	lsl	x9, x8, #3
 463475c: cb08153c     	sub	x28, x9, x8, lsl #5
 4634760: b40003fb     	cbz	x27, 0x46347dc <_ChromeMain+0x462f540>
 4634764: 39c05f68     	ldrsb	w8, [x27, #0x17]
 4634768: 37f80208     	tbnz	w8, #0x1f, 0x46347a8 <_ChromeMain+0x462f50c>
 463476c: d100637b     	sub	x27, x27, #0x18
 4634770: b100639c     	adds	x28, x28, #0x18
 4634774: 54ffff61     	b.ne	0x4634760 <_ChromeMain+0x462f4c4>
 4634778: f9408be0     	ldr	x0, [sp, #0x110]
 463477c: cb0002e8     	sub	x8, x23, x0
 4634780: 9343fd08     	asr	x8, x8, #3
 4634784: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4634788: f2955569     	movk	x9, #0xaaab
 463478c: 9b097d08     	mul	x8, x8, x9
 4634790: f9008fe8     	str	x8, [sp, #0x118]
 4634794: f94093e8     	ldr	x8, [sp, #0x120]
 4634798: 8b080508     	add	x8, x8, x8, lsl #1
 463479c: d37df101     	lsl	x1, x8, #3
 46347a0: 96e751c6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46347a4: 17fffeed     	b	0x4634358 <_ChromeMain+0x462f0bc>
 46347a8: f9400360     	ldr	x0, [x27]
 46347ac: f9400b68     	ldr	x8, [x27, #0x10]
 46347b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46347b4: 96e751c1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46347b8: 17ffffed     	b	0x463476c <_ChromeMain+0x462f4d0>
 46347bc: 52800100     	mov	w0, #0x8                ; =8
 46347c0: 96e76aea     	bl	0xf368 <_ChromeMain+0xa0cc>
 46347c4: aa0003f5     	mov	x21, x0
 46347c8: d2800016     	mov	x22, #0x0               ; =0
 46347cc: f900001f     	str	xzr, [x0]
 46347d0: 17ffff72     	b	0x4634598 <_ChromeMain+0x462f2fc>
 46347d4: d4200000     	brk	#0
 46347d8: d4400000     	hlt	#0
 46347dc: d4200020     	brk	#0x1
 46347e0: 94e73ee0     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 46347e4: aa1703e0     	mov	x0, x23
 46347e8: 17ffffe5     	b	0x463477c <_ChromeMain+0x462f4e0>
 46347ec: d4200000     	brk	#0
 46347f0: d4400000     	hlt	#0
 46347f4: d4200020     	brk	#0x1
 46347f8: d4200000     	brk	#0
 46347fc: d4400000     	hlt	#0
 4634800: d4200020     	brk	#0x1
 4634804: d4200000     	brk	#0
 4634808: d4400000     	hlt	#0
 463480c: d4200020     	brk	#0x1
 4634810: 97f27bba     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4634814: 17fffe54     	b	0x4634164 <_ChromeMain+0x462eec8>
 4634818: 97f27bb8     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 463481c: 17fffe6a     	b	0x46341c4 <_ChromeMain+0x462ef28>
 4634820: 97f27bb6     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4634824: 17fffeff     	b	0x4634420 <_ChromeMain+0x462f184>
 4634828: d4200000     	brk	#0
 463482c: d4400000     	hlt	#0
 4634830: d4200020     	brk	#0x1
 4634834: aa1303e0     	mov	x0, x19
 4634838: 97607338     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 463483c: f940ce62     	ldr	x2, [x19, #0x198]
 4634840: 17ffffa4     	b	0x46346d0 <_ChromeMain+0x462f434>
 4634844: d2800000     	mov	x0, #0x0                ; =0
 4634848: 94e73bc8     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 463484c: d2800000     	mov	x0, #0x0                ; =0
