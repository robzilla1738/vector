
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4258108: d10383ff     	sub	sp, sp, #0xe0
 425810c: a9086ffc     	stp	x28, x27, [sp, #0x80]
 4258110: a90967fa     	stp	x26, x25, [sp, #0x90]
 4258114: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 4258118: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 425811c: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 4258120: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 4258124: 910343fd     	add	x29, sp, #0xd0
 4258128: b40004c1     	cbz	x1, 0x42581c0 <_ChromeMain+0x4252f24>
 425812c: aa0003f4     	mov	x20, x0
 4258130: f9403408     	ldr	x8, [x0, #0x68]
 4258134: b4000468     	cbz	x8, 0x42581c0 <_ChromeMain+0x4252f24>
 4258138: f9405d08     	ldr	x8, [x8, #0xb8]
 425813c: b4000428     	cbz	x8, 0x42581c0 <_ChromeMain+0x4252f24>
 4258140: aa0103f3     	mov	x19, x1
 4258144: 9789a04e     	bl	0x24c027c <_ChromeMain+0x24bafe0>
 4258148: aa1303e1     	mov	x1, x19
 425814c: 52800022     	mov	w2, #0x1                ; =1
 4258150: 96f7eb11     	bl	0x52d94 <_ChromeMain+0x4daf8>
 4258154: b4000360     	cbz	x0, 0x42581c0 <_ChromeMain+0x4252f24>
 4258158: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 425815c: f9001fff     	str	xzr, [sp, #0x38]
 4258160: f9403689     	ldr	x9, [x20, #0x68]
 4258164: f9405d28     	ldr	x8, [x9, #0xb8]
 4258168: 8b080d08     	add	x8, x8, x8, lsl #3
 425816c: d37ced0a     	lsl	x10, x8, #4
 4258170: b400028a     	cbz	x10, 0x42581c0 <_ChromeMain+0x4252f24>
 4258174: aa0003f5     	mov	x21, x0
 4258178: d2800019     	mov	x25, #0x0               ; =0
 425817c: d2800014     	mov	x20, #0x0               ; =0
 4258180: f9405936     	ldr	x22, [x9, #0xb0]
 4258184: d0fe04d7     	adrp	x23, 0x2f2000 <_ChromeMain+0x2ecd64>
 4258188: 912702f7     	add	x23, x23, #0x9c0
 425818c: 8b0812da     	add	x26, x22, x8, lsl #4
 4258190: 5280121b     	mov	w27, #0x90              ; =144
 4258194: d291c73c     	mov	x28, #0x8e39            ; =36409
 4258198: f2a71c7c     	movk	x28, #0x38e3, lsl #16
 425819c: f2dc71dc     	movk	x28, #0xe38e, lsl #32
 42581a0: f2f1c71c     	movk	x28, #0x8e38, lsl #48
 42581a4: 14000021     	b	0x4258228 <_ChromeMain+0x4252f8c>
 42581a8: b40000d4     	cbz	x20, 0x42581c0 <_ChromeMain+0x4252f24>
 42581ac: f9401fe8     	ldr	x8, [sp, #0x38]
 42581b0: 8b080d08     	add	x8, x8, x8, lsl #3
 42581b4: d37ced01     	lsl	x1, x8, #4
 42581b8: aa1403e0     	mov	x0, x20
 42581bc: 96f6c33f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42581c0: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 42581c4: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 42581c8: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 42581cc: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 42581d0: a94967fa     	ldp	x26, x25, [sp, #0x90]
 42581d4: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 42581d8: 910383ff     	add	sp, sp, #0xe0
 42581dc: d65f03c0     	ret
 42581e0: 3dc002c0     	ldr	q0, [x22]
 42581e4: f9400ac8     	ldr	x8, [x22, #0x10]
 42581e8: f9000b08     	str	x8, [x24, #0x10]
 42581ec: 3d800300     	str	q0, [x24]
 42581f0: 91006300     	add	x0, x24, #0x18
 42581f4: 910062c1     	add	x1, x22, #0x18
 42581f8: 96fb8767     	bl	0x139f94 <_ChromeMain+0x134cf8>
 42581fc: 9b1b5328     	madd	x8, x25, x27, x20
 4258200: 91024108     	add	x8, x8, #0x90
 4258204: f94017f4     	ldr	x20, [sp, #0x28]
 4258208: eb140108     	subs	x8, x8, x20
 425820c: 9344fd08     	asr	x8, x8, #4
 4258210: 9b1c7d19     	mul	x25, x8, x28
 4258214: f9001bf9     	str	x25, [sp, #0x30]
 4258218: 54001240     	b.eq	0x4258460 <_ChromeMain+0x42531c4>
 425821c: 910242d6     	add	x22, x22, #0x90
 4258220: eb1a02df     	cmp	x22, x26
 4258224: 54000240     	b.eq	0x425826c <_ChromeMain+0x4252fd0>
 4258228: 910062c2     	add	x2, x22, #0x18
 425822c: aa1503e0     	mov	x0, x21
 4258230: aa1603e1     	mov	x1, x22
 4258234: aa1703e3     	mov	x3, x23
 4258238: 94a920a4     	bl	0x6ca04c8 <_ChromeMain+0x6c9b22c>
 425823c: 34ffff00     	cbz	w0, 0x425821c <_ChromeMain+0x4252f80>
 4258240: f9401fe8     	ldr	x8, [sp, #0x38]
 4258244: eb08033f     	cmp	x25, x8
 4258248: 54001120     	b.eq	0x425846c <_ChromeMain+0x42531d0>
 425824c: 9b1b5338     	madd	x24, x25, x27, x20
 4258250: b4001098     	cbz	x24, 0x4258460 <_ChromeMain+0x42531c4>
 4258254: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 4258258: 36fffc48     	tbz	w8, #0x1f, 0x42581e0 <_ChromeMain+0x4252f44>
 425825c: a9400ac1     	ldp	x1, x2, [x22]
 4258260: aa1803e0     	mov	x0, x24
 4258264: 96f6ffed     	bl	0x18218 <_ChromeMain+0x12f7c>
 4258268: 17ffffe2     	b	0x42581f0 <_ChromeMain+0x4252f54>
 425826c: b4fff9f9     	cbz	x25, 0x42581a8 <_ChromeMain+0x4252f0c>
 4258270: 910183e8     	add	x8, sp, #0x60
 4258274: 91002117     	add	x23, x8, #0x8
 4258278: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 425827c: f90033f7     	str	x23, [sp, #0x60]
 4258280: 8b190f28     	add	x8, x25, x25, lsl #3
 4258284: d37ced16     	lsl	x22, x8, #4
 4258288: aa1603f5     	mov	x21, x22
 425828c: 910183e0     	add	x0, sp, #0x60
 4258290: 910183e1     	add	x1, sp, #0x60
 4258294: aa1403e2     	mov	x2, x20
 4258298: 9732d8ba     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 425829c: 91024294     	add	x20, x20, #0x90
 42582a0: f10242b5     	subs	x21, x21, #0x90
 42582a4: 54ffff41     	b.ne	0x425828c <_ChromeMain+0x4252ff0>
 42582a8: f9403bf8     	ldr	x24, [sp, #0x70]
 42582ac: b40008d8     	cbz	x24, 0x42583c4 <_ChromeMain+0x4253128>
 42582b0: 52800700     	mov	w0, #0x38               ; =56
 42582b4: 96f6dc2d     	bl	0xf368 <_ChromeMain+0xa0cc>
 42582b8: aa0003f4     	mov	x20, x0
 42582bc: 910103e8     	add	x8, sp, #0x40
 42582c0: 91002115     	add	x21, x8, #0x8
 42582c4: a94623e9     	ldp	x9, x8, [sp, #0x60]
 42582c8: a90423e9     	stp	x9, x8, [sp, #0x40]
 42582cc: f9002bf8     	str	x24, [sp, #0x50]
 42582d0: f9000915     	str	x21, [x8, #0x10]
 42582d4: f90033f7     	str	x23, [sp, #0x60]
 42582d8: d005006a     	adrp	x10, 0xe266000 <dyld_stub_binder+0xe266000>
 42582dc: 9134a14a     	add	x10, x10, #0xd28
 42582e0: a9007eff     	stp	xzr, xzr, [x23]
 42582e4: f900000a     	str	x10, [x0]
 42582e8: 925e766a     	and	x10, x19, #0xfffffffc00000000
 42582ec: d0054ad7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42582f0: f94046eb     	ldr	x11, [x23, #0x88]
 42582f4: eb0b015f     	cmp	x10, x11
 42582f8: 54000181     	b.ne	0x4258328 <_ChromeMain+0x425308c>
 42582fc: aa1303e0     	mov	x0, x19
 4258300: 96f6efff     	bl	0x142fc <_ChromeMain+0xf060>
 4258304: a94423e9     	ldp	x9, x8, [sp, #0x40]
 4258308: f9402beb     	ldr	x11, [sp, #0x50]
 425830c: aa1403ea     	mov	x10, x20
 4258310: f8018d48     	str	x8, [x10, #0x18]!
 4258314: a93f2553     	stp	x19, x9, [x10, #-0x10]
 4258318: f900054b     	str	x11, [x10, #0x8]
 425831c: b50000eb     	cbnz	x11, 0x4258338 <_ChromeMain+0x425309c>
 4258320: f9000a8a     	str	x10, [x20, #0x10]
 4258324: 14000008     	b	0x4258344 <_ChromeMain+0x42530a8>
 4258328: aa1403ea     	mov	x10, x20
 425832c: f8018d48     	str	x8, [x10, #0x18]!
 4258330: a93f2553     	stp	x19, x9, [x10, #-0x10]
 4258334: f9000558     	str	x24, [x10, #0x8]
 4258338: f900090a     	str	x10, [x8, #0x10]
 425833c: f90023f5     	str	x21, [sp, #0x40]
 4258340: a9007ebf     	stp	xzr, xzr, [x21]
 4258344: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4258348: f94046e9     	ldr	x9, [x23, #0x88]
 425834c: aa1303e0     	mov	x0, x19
 4258350: eb09011f     	cmp	x8, x9
 4258354: 54000081     	b.ne	0x4258364 <_ChromeMain+0x42530c8>
 4258358: aa1403e0     	mov	x0, x20
 425835c: 96f6efe8     	bl	0x142fc <_ChromeMain+0xf060>
 4258360: f9400680     	ldr	x0, [x20, #0x8]
 4258364: a902fe94     	stp	x20, xzr, [x20, #0x28]
 4258368: b4001520     	cbz	x0, 0x425860c <_ChromeMain+0x4253370>
 425836c: 97512540     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 4258370: aa0003f5     	mov	x21, x0
 4258374: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4258378: f94046e9     	ldr	x9, [x23, #0x88]
 425837c: eb09011f     	cmp	x8, x9
 4258380: 54000061     	b.ne	0x425838c <_ChromeMain+0x42530f0>
 4258384: aa1503e0     	mov	x0, x21
 4258388: 96f6efdd     	bl	0x142fc <_ChromeMain+0xf060>
 425838c: f9401a80     	ldr	x0, [x20, #0x30]
 4258390: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4258394: f94046e9     	ldr	x9, [x23, #0x88]
 4258398: eb09011f     	cmp	x8, x9
 425839c: 54001340     	b.eq	0x4258604 <_ChromeMain+0x4253368>
 42583a0: f9001a95     	str	x21, [x20, #0x30]
 42583a4: f9401681     	ldr	x1, [x20, #0x28]
 42583a8: 910262a0     	add	x0, x21, #0x98
 42583ac: 974f9666     	bl	0x163dd44 <_ChromeMain+0x1638aa8>
 42583b0: f94027e1     	ldr	x1, [sp, #0x48]
 42583b4: 910103e8     	add	x8, sp, #0x40
 42583b8: f9002fe8     	str	x8, [sp, #0x58]
 42583bc: 910163e0     	add	x0, sp, #0x58
 42583c0: 971321bb     	bl	0x720aac <_ChromeMain+0x71b810>
 42583c4: f94037e1     	ldr	x1, [sp, #0x68]
 42583c8: 910183e8     	add	x8, sp, #0x60
 42583cc: f9002fe8     	str	x8, [sp, #0x58]
 42583d0: 910163e0     	add	x0, sp, #0x58
 42583d4: 971321b6     	bl	0x720aac <_ChromeMain+0x71b810>
 42583d8: aa1303e0     	mov	x0, x19
 42583dc: 9799c978     	bl	0x28ca9bc <_ChromeMain+0x28c5720>
 42583e0: b4000080     	cbz	x0, 0x42583f0 <_ChromeMain+0x4253154>
 42583e4: 39404008     	ldrb	w8, [x0, #0x10]
 42583e8: 34000048     	cbz	w8, 0x42583f0 <_ChromeMain+0x4253154>
 42583ec: 97af7c5f     	bl	0x2e37568 <_ChromeMain+0x2e322cc>
 42583f0: f94017f4     	ldr	x20, [sp, #0x28]
 42583f4: b4ffee74     	cbz	x20, 0x42581c0 <_ChromeMain+0x4252f24>
 42583f8: 14000007     	b	0x4258414 <_ChromeMain+0x4253178>
 42583fc: f9400260     	ldr	x0, [x19]
 4258400: f8580108     	ldur	x8, [x8, #-0x80]
 4258404: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4258408: 96f6c2ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425840c: f10242d6     	subs	x22, x22, #0x90
 4258410: 54ffece0     	b.eq	0x42581ac <_ChromeMain+0x4252f10>
 4258414: 8b160295     	add	x21, x20, x22
 4258418: f10242b3     	subs	x19, x21, #0x90
 425841c: 54000220     	b.eq	0x4258460 <_ChromeMain+0x42531c4>
 4258420: d10022a0     	sub	x0, x21, #0x8
 4258424: d2800001     	mov	x1, #0x0                ; =0
 4258428: 96f73e24     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425842c: d10162a0     	sub	x0, x21, #0x58
 4258430: 96f73e12     	bl	0x27c78 <_ChromeMain+0x229dc>
 4258434: 38d9f2a8     	ldursb	w8, [x21, #-0x61]
 4258438: 36f800c8     	tbz	w8, #0x1f, 0x4258450 <_ChromeMain+0x42531b4>
 425843c: 8b160288     	add	x8, x20, x22
 4258440: f8588100     	ldur	x0, [x8, #-0x78]
 4258444: f8598108     	ldur	x8, [x8, #-0x68]
 4258448: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425844c: 96f6c29b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258450: 8b160288     	add	x8, x20, x22
 4258454: 38d87109     	ldursb	w9, [x8, #-0x79]
 4258458: 36fffda9     	tbz	w9, #0x1f, 0x425840c <_ChromeMain+0x4253170>
 425845c: 17ffffe8     	b	0x42583fc <_ChromeMain+0x4253160>
 4258460: d4200020     	brk	#0x1
 4258464: d2800014     	mov	x20, #0x0               ; =0
 4258468: 1400001c     	b	0x42584d8 <_ChromeMain+0x425323c>
 425846c: 91000728     	add	x8, x25, #0x1
 4258470: d28e38ea     	mov	x10, #0x71c7            ; =29127
 4258474: f2b8e38a     	movk	x10, #0xc71c, lsl #16
 4258478: f2c38e2a     	movk	x10, #0x1c71, lsl #32
 425847c: f2e038ea     	movk	x10, #0x1c7, lsl #48
 4258480: eb0a011f     	cmp	x8, x10
 4258484: 54000bc8     	b.hi	0x42585fc <_ChromeMain+0x4253360>
 4258488: d37ffb29     	lsl	x9, x25, #1
 425848c: eb08013f     	cmp	x9, x8
 4258490: 9a888128     	csel	x8, x9, x8, hi
 4258494: d2871c69     	mov	x9, #0x38e3             ; =14563
 4258498: f2bc71c9     	movk	x9, #0xe38e, lsl #16
 425849c: f2d1c709     	movk	x9, #0x8e38, lsl #32
 42584a0: f2e01c69     	movk	x9, #0xe3, lsl #48
 42584a4: eb09033f     	cmp	x25, x9
 42584a8: 9a8a3108     	csel	x8, x8, x10, lo
 42584ac: f90033ff     	str	xzr, [sp, #0x60]
 42584b0: b4fffda8     	cbz	x8, 0x4258464 <_ChromeMain+0x42531c8>
 42584b4: eb0a011f     	cmp	x8, x10
 42584b8: 54000a48     	b.hi	0x4258600 <_ChromeMain+0x4253364>
 42584bc: aa0803f4     	mov	x20, x8
 42584c0: 8b080d08     	add	x8, x8, x8, lsl #3
 42584c4: d37ced00     	lsl	x0, x8, #4
 42584c8: 96f6dba8     	bl	0xf368 <_ChromeMain+0xa0cc>
 42584cc: aa1403e8     	mov	x8, x20
 42584d0: aa0003f4     	mov	x20, x0
 42584d4: f90033e0     	str	x0, [sp, #0x60]
 42584d8: 9b1b5338     	madd	x24, x25, x27, x20
 42584dc: f90037f8     	str	x24, [sp, #0x68]
 42584e0: f9003fe8     	str	x8, [sp, #0x78]
 42584e4: b4fffbf8     	cbz	x24, 0x4258460 <_ChromeMain+0x42531c4>
 42584e8: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 42584ec: 37f802a8     	tbnz	w8, #0x1f, 0x4258540 <_ChromeMain+0x42532a4>
 42584f0: 3dc002c0     	ldr	q0, [x22]
 42584f4: f9400ac8     	ldr	x8, [x22, #0x10]
 42584f8: f9000b08     	str	x8, [x24, #0x10]
 42584fc: 3d800300     	str	q0, [x24]
 4258500: 91006300     	add	x0, x24, #0x18
 4258504: 910062c1     	add	x1, x22, #0x18
 4258508: 96fb86a3     	bl	0x139f94 <_ChromeMain+0x134cf8>
 425850c: 52800028     	mov	w8, #0x1                ; =1
 4258510: f9003be8     	str	x8, [sp, #0x70]
 4258514: 9100a3e0     	add	x0, sp, #0x28
 4258518: 910183e1     	add	x1, sp, #0x60
 425851c: 940011bf     	bl	0x425cc18 <_ChromeMain+0x425797c>
 4258520: f9403be8     	ldr	x8, [sp, #0x70]
 4258524: 8b080d08     	add	x8, x8, x8, lsl #3
 4258528: d37ced0a     	lsl	x10, x8, #4
 425852c: b400012a     	cbz	x10, 0x4258550 <_ChromeMain+0x42532b4>
 4258530: d2800018     	mov	x24, #0x0               ; =0
 4258534: f94037eb     	ldr	x11, [sp, #0x68]
 4258538: f9000bea     	str	x10, [sp, #0x10]
 425853c: 14000017     	b	0x4258598 <_ChromeMain+0x42532fc>
 4258540: a9400ac1     	ldp	x1, x2, [x22]
 4258544: aa1803e0     	mov	x0, x24
 4258548: 96f6ff34     	bl	0x18218 <_ChromeMain+0x12f7c>
 425854c: 17ffffed     	b	0x4258500 <_ChromeMain+0x4253264>
 4258550: f94033e0     	ldr	x0, [sp, #0x60]
 4258554: b4ffe540     	cbz	x0, 0x42581fc <_ChromeMain+0x4252f60>
 4258558: f9403fe8     	ldr	x8, [sp, #0x78]
 425855c: 8b080d08     	add	x8, x8, x8, lsl #3
 4258560: d37ced01     	lsl	x1, x8, #4
 4258564: 96f6c255     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258568: 17ffff25     	b	0x42581fc <_ChromeMain+0x4252f60>
 425856c: f94007e9     	ldr	x9, [sp, #0x8]
 4258570: f9400120     	ldr	x0, [x9]
 4258574: f8580108     	ldur	x8, [x8, #-0x80]
 4258578: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425857c: 96f6c24f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258580: f94013eb     	ldr	x11, [sp, #0x20]
 4258584: f9400bea     	ldr	x10, [sp, #0x10]
 4258588: d102416b     	sub	x11, x11, #0x90
 425858c: 91024318     	add	x24, x24, #0x90
 4258590: eb18015f     	cmp	x10, x24
 4258594: 54fffde0     	b.eq	0x4258550 <_ChromeMain+0x42532b4>
 4258598: a901aff8     	stp	x24, x11, [sp, #0x18]
 425859c: 8b0a0178     	add	x24, x11, x10
 42585a0: f1024308     	subs	x8, x24, #0x90
 42585a4: 54fff5e0     	b.eq	0x4258460 <_ChromeMain+0x42531c4>
 42585a8: f90007e8     	str	x8, [sp, #0x8]
 42585ac: d1002300     	sub	x0, x24, #0x8
 42585b0: d2800001     	mov	x1, #0x0                ; =0
 42585b4: 96f73dc1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 42585b8: d1016300     	sub	x0, x24, #0x58
 42585bc: 96f73daf     	bl	0x27c78 <_ChromeMain+0x229dc>
 42585c0: 38d9f308     	ldursb	w8, [x24, #-0x61]
 42585c4: 36f80108     	tbz	w8, #0x1f, 0x42585e4 <_ChromeMain+0x4253348>
 42585c8: f9400be8     	ldr	x8, [sp, #0x10]
 42585cc: f94013e9     	ldr	x9, [sp, #0x20]
 42585d0: 8b080128     	add	x8, x9, x8
 42585d4: f8588100     	ldur	x0, [x8, #-0x78]
 42585d8: f8598108     	ldur	x8, [x8, #-0x68]
 42585dc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42585e0: 96f6c236     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42585e4: a94163ea     	ldp	x10, x24, [sp, #0x10]
 42585e8: f94013eb     	ldr	x11, [sp, #0x20]
 42585ec: 8b0a0168     	add	x8, x11, x10
 42585f0: 38d87109     	ldursb	w9, [x8, #-0x79]
 42585f4: 36fffca9     	tbz	w9, #0x1f, 0x4258588 <_ChromeMain+0x42532ec>
 42585f8: 17ffffdd     	b	0x425856c <_ChromeMain+0x42532d0>
 42585fc: 9772ede1     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4258600: 9426b688     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4258604: 96f7290e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4258608: 17ffff66     	b	0x42583a0 <_ChromeMain+0x4253104>
 425860c: d4200000     	brk	#0
 4258610: d4400000     	hlt	#0
 4258614: d4200020     	brk	#0x1
