
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42631c0: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 42631c4: a90167fa     	stp	x26, x25, [sp, #0x10]
 42631c8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 42631cc: a90357f6     	stp	x22, x21, [sp, #0x30]
 42631d0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 42631d4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 42631d8: 910143fd     	add	x29, sp, #0x50
 42631dc: d10983ff     	sub	sp, sp, #0x260
 42631e0: 3940b008     	ldrb	w8, [x0, #0x2c]
 42631e4: 34000088     	cbz	w8, 0x42631f4 <_ChromeMain+0x425df58>
 42631e8: aa0003f3     	mov	x19, x0
 42631ec: f9400808     	ldr	x8, [x0, #0x10]
 42631f0: b50002c8     	cbnz	x8, 0x4263248 <_ChromeMain+0x425dfac>
 42631f4: 910983ff     	add	sp, sp, #0x260
 42631f8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42631fc: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4263200: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4263204: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4263208: a94167fa     	ldp	x26, x25, [sp, #0x10]
 426320c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4263210: d65f03c0     	ret
 4263214: 390003ff     	strb	wzr, [sp]
 4263218: 390223ff     	strb	wzr, [sp, #0x88]
 426321c: aa1303e0     	mov	x0, x19
 4263220: 94000188     	bl	0x4263840 <_ChromeMain+0x425e5a4>
 4263224: 394223e8     	ldrb	w8, [sp, #0x88]
 4263228: 34000068     	cbz	w8, 0x4263234 <_ChromeMain+0x425df98>
 426322c: 910003e0     	mov	x0, sp
 4263230: 94be3ee0     	bl	0x71f2db0 <_ChromeMain+0x71edb14>
 4263234: 910263e8     	add	x8, sp, #0x98
 4263238: f900c3e8     	str	x8, [sp, #0x180]
 426323c: 910603e0     	add	x0, sp, #0x180
 4263240: 94d6f789     	bl	0x7821064 <_ChromeMain+0x781bdc8>
 4263244: 17ffffec     	b	0x42631f4 <_ChromeMain+0x425df58>
 4263248: a909ffff     	stp	xzr, xzr, [sp, #0x98]
 426324c: f90057ff     	str	xzr, [sp, #0xa8]
 4263250: f9400514     	ldr	x20, [x8, #0x8]
 4263254: b4000434     	cbz	x20, 0x42632d8 <_ChromeMain+0x425e03c>
 4263258: b203cfe8     	mov	x8, #-0x1e1e1e1e1e1e1e1f ; =-2170205185142300191
 426325c: f2e03c28     	movk	x8, #0x1e1, lsl #48
 4263260: eb08029f     	cmp	x20, x8
 4263264: 54002a48     	b.hi	0x42637ac <_ChromeMain+0x425e510>
 4263268: 910263f5     	add	x21, sp, #0x98
 426326c: 8b141288     	add	x8, x20, x20, lsl #4
 4263270: d37df100     	lsl	x0, x8, #3
 4263274: 96f6b03d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263278: a91803e0     	stp	x0, x0, [sp, #0x180]
 426327c: a91953ff     	stp	xzr, x20, [sp, #0x190]
 4263280: 910603e0     	add	x0, sp, #0x180
 4263284: 910263e1     	add	x1, sp, #0x98
 4263288: 910022a2     	add	x2, x21, #0x8
 426328c: 910042a3     	add	x3, x21, #0x10
 4263290: 94d6f935     	bl	0x7821764 <_ChromeMain+0x781c4c8>
 4263294: 910603e0     	add	x0, sp, #0x180
 4263298: 94d6f97d     	bl	0x782188c <_ChromeMain+0x781c5f0>
 426329c: f9400a68     	ldr	x8, [x19, #0x10]
 42632a0: f9400509     	ldr	x9, [x8, #0x8]
 42632a4: b40001a9     	cbz	x9, 0x42632d8 <_ChromeMain+0x425e03c>
 42632a8: d2800014     	mov	x20, #0x0               ; =0
 42632ac: d2800015     	mov	x21, #0x0               ; =0
 42632b0: f9400108     	ldr	x8, [x8]
 42632b4: 910263e0     	add	x0, sp, #0x98
 42632b8: 8b140101     	add	x1, x8, x20
 42632bc: 94d6f8a8     	bl	0x782155c <_ChromeMain+0x781c2c0>
 42632c0: 910006b5     	add	x21, x21, #0x1
 42632c4: f9400a68     	ldr	x8, [x19, #0x10]
 42632c8: f9400509     	ldr	x9, [x8, #0x8]
 42632cc: 91022294     	add	x20, x20, #0x88
 42632d0: eb0902bf     	cmp	x21, x9
 42632d4: 54fffee3     	b.lo	0x42632b0 <_ChromeMain+0x425e014>
 42632d8: 3941a277     	ldrb	w23, [x19, #0x68]
 42632dc: 37000097     	tbnz	w23, #0x0, 0x42632ec <_ChromeMain+0x425e050>
 42632e0: d2800015     	mov	x21, #0x0               ; =0
 42632e4: d2800014     	mov	x20, #0x0               ; =0
 42632e8: 14000009     	b	0x426330c <_ChromeMain+0x425e070>
 42632ec: aa1303e8     	mov	x8, x19
 42632f0: f8450d09     	ldr	x9, [x8, #0x50]!
 42632f4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 42632f8: f100015f     	cmp	x10, #0x0
 42632fc: 9a884134     	csel	x20, x9, x8, mi
 4263300: f9400508     	ldr	x8, [x8, #0x8]
 4263304: 7100015f     	cmp	w10, #0x0
 4263308: 9a8a4115     	csel	x21, x8, x10, mi
 426330c: 6f00e400     	movi.2d	v0, #0000000000000000
 4263310: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4263314: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4263318: ad0183e0     	stp	q0, q0, [sp, #0x30]
 426331c: ad0083e0     	stp	q0, q0, [sp, #0x10]
 4263320: 3d8003e0     	str	q0, [sp]
 4263324: f94053e8     	ldr	x8, [sp, #0xa0]
 4263328: 8b081108     	add	x8, x8, x8, lsl #4
 426332c: d37df119     	lsl	x25, x8, #3
 4263330: b4fff739     	cbz	x25, 0x4263214 <_ChromeMain+0x425df78>
 4263334: 9102c3f8     	add	x24, sp, #0xb0
 4263338: f9404ff6     	ldr	x22, [sp, #0x98]
 426333c: 910603fa     	add	x26, sp, #0x180
 4263340: 14000012     	b	0x4263388 <_ChromeMain+0x425e0ec>
 4263344: f940c3e8     	ldr	x8, [sp, #0x180]
 4263348: 7100037f     	cmp	w27, #0x0
 426334c: 9a9a4101     	csel	x1, x8, x26, mi
 4263350: aa1403e0     	mov	x0, x20
 4263354: aa1503e2     	mov	x2, x21
 4263358: 94f69942     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426335c: 7100001f     	cmp	w0, #0x0
 4263360: 1a9f17fc     	cset	w28, eq
 4263364: 36f800bb     	tbz	w27, #0x1f, 0x4263378 <_ChromeMain+0x425e0dc>
 4263368: f940c3e0     	ldr	x0, [sp, #0x180]
 426336c: f940cbe8     	ldr	x8, [sp, #0x190]
 4263370: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4263374: 96f696d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263378: 370004dc     	tbnz	w28, #0x0, 0x4263410 <_ChromeMain+0x425e174>
 426337c: 910222d6     	add	x22, x22, #0x88
 4263380: f1022339     	subs	x25, x25, #0x88
 4263384: 54fff480     	b.eq	0x4263214 <_ChromeMain+0x425df78>
 4263388: b9401ac8     	ldr	w8, [x22, #0x18]
 426338c: 7100091f     	cmp	w8, #0x2
 4263390: 54ffff61     	b.ne	0x426337c <_ChromeMain+0x425e0e0>
 4263394: 340003f7     	cbz	w23, 0x4263410 <_ChromeMain+0x425e174>
 4263398: 39c0dec8     	ldrsb	w8, [x22, #0x37]
 426339c: 36f801c8     	tbz	w8, #0x1f, 0x42633d4 <_ChromeMain+0x425e138>
 42633a0: a9420ac1     	ldp	x1, x2, [x22, #0x20]
 42633a4: 910603e0     	add	x0, sp, #0x180
 42633a8: 96f6d39c     	bl	0x18218 <_ChromeMain+0x12f7c>
 42633ac: 39465fe8     	ldrb	w8, [sp, #0x197]
 42633b0: 13001d1b     	sxtb	w27, w8
 42633b4: f940c7e9     	ldr	x9, [sp, #0x188]
 42633b8: 7100037f     	cmp	w27, #0x0
 42633bc: 9a884128     	csel	x8, x9, x8, mi
 42633c0: eb0802bf     	cmp	x21, x8
 42633c4: 54fffc00     	b.eq	0x4263344 <_ChromeMain+0x425e0a8>
 42633c8: 5280001c     	mov	w28, #0x0               ; =0
 42633cc: 36fffd7b     	tbz	w27, #0x1f, 0x4263378 <_ChromeMain+0x425e0dc>
 42633d0: 17ffffe6     	b	0x4263368 <_ChromeMain+0x425e0cc>
 42633d4: 3cc202c0     	ldur	q0, [x22, #0x20]
 42633d8: f84302c8     	ldur	x8, [x22, #0x30]
 42633dc: f900cbe8     	str	x8, [sp, #0x190]
 42633e0: 3d8063e0     	str	q0, [sp, #0x180]
 42633e4: 17fffff2     	b	0x42633ac <_ChromeMain+0x425e110>
 42633e8: f9403e60     	ldr	x0, [x19, #0x78]
 42633ec: f9404668     	ldr	x8, [x19, #0x88]
 42633f0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42633f4: 96f696b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42633f8: 14000035     	b	0x42634cc <_ChromeMain+0x425e230>
 42633fc: f9404a60     	ldr	x0, [x19, #0x90]
 4263400: f9405268     	ldr	x8, [x19, #0xa0]
 4263404: d37ff901     	lsl	x1, x8, #1
 4263408: 96f696ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426340c: 14000058     	b	0x426356c <_ChromeMain+0x425e2d0>
 4263410: 910003e0     	mov	x0, sp
 4263414: aa1603e1     	mov	x1, x22
 4263418: 94be3e34     	bl	0x71f2ce8 <_ChromeMain+0x71eda4c>
 426341c: 52800028     	mov	w8, #0x1                ; =1
 4263420: 390223e8     	strb	w8, [sp, #0x88]
 4263424: 7940a3e8     	ldrh	w8, [sp, #0x50]
 4263428: 39412269     	ldrb	w9, [x19, #0x48]
 426342c: 121f010a     	and	w10, w8, #0x2
 4263430: 7100013f     	cmp	w9, #0x0
 4263434: 1a881154     	csel	w20, w10, w8, ne
 4263438: 34ffef34     	cbz	w20, 0x426321c <_ChromeMain+0x425df80>
 426343c: 721d0288     	ands	w8, w20, #0x8
 4263440: 1a9f17e9     	cset	w9, eq
 4263444: 53037d08     	lsr	w8, w8, #3
 4263448: 3900c668     	strb	w8, [x19, #0x31]
 426344c: 3900ca69     	strb	w9, [x19, #0x32]
 4263450: 3900ce69     	strb	w9, [x19, #0x33]
 4263454: b9402a68     	ldr	w8, [x19, #0x28]
 4263458: 7100051f     	cmp	w8, #0x1
 426345c: 540001c1     	b.ne	0x4263494 <_ChromeMain+0x425e1f8>
 4263460: f9400668     	ldr	x8, [x19, #0x8]
 4263464: b4ffedc8     	cbz	x8, 0x426321c <_ChromeMain+0x425df80>
 4263468: f9413903     	ldr	x3, [x8, #0x270]
 426346c: b4ffed83     	cbz	x3, 0x426321c <_ChromeMain+0x425df80>
 4263470: 910003e1     	mov	x1, sp
 4263474: aa1303e0     	mov	x0, x19
 4263478: aa1403e2     	mov	x2, x20
 426347c: 9400017b     	bl	0x4263a68 <_ChromeMain+0x425e7cc>
