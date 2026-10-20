
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425c084: 6db733ed     	stp	d13, d12, [sp, #-0x90]!
 425c088: 6d012beb     	stp	d11, d10, [sp, #0x10]
 425c08c: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 425c090: a9036ffc     	stp	x28, x27, [sp, #0x30]
 425c094: a90467fa     	stp	x26, x25, [sp, #0x40]
 425c098: a9055ff8     	stp	x24, x23, [sp, #0x50]
 425c09c: a90657f6     	stp	x22, x21, [sp, #0x60]
 425c0a0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 425c0a4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 425c0a8: 910203fd     	add	x29, sp, #0x80
 425c0ac: d10783ff     	sub	sp, sp, #0x1e0
 425c0b0: f9000fe3     	str	x3, [sp, #0x18]
 425c0b4: b90017e2     	str	w2, [sp, #0x14]
 425c0b8: a9402016     	ldp	x22, x8, [x0]
 425c0bc: 8b0816d3     	add	x19, x22, x8, lsl #5
 425c0c0: eb1302df     	cmp	x22, x19
 425c0c4: 540046c8     	b.hi	0x425c99c <_ChromeMain+0x4257700>
 425c0c8: d37be908     	lsl	x8, x8, #5
 425c0cc: b40008a8     	cbz	x8, 0x425c1e0 <_ChromeMain+0x4256f44>
 425c0d0: aa0103f5     	mov	x21, x1
 425c0d4: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c0d8: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c0dc: 9004ee68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 425c0e0: f9444908     	ldr	x8, [x8, #0x890]
 425c0e4: fd400108     	ldr	d8, [x8]
 425c0e8: 9004ac57     	adrp	x23, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 425c0ec: 911cdef7     	add	x23, x23, #0x737
 425c0f0: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 425c0f4: 9e670109     	fmov	d9, x8
 425c0f8: f004e768     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 425c0fc: fd45ad0a     	ldr	d10, [x8, #0xb58]
 425c100: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 425c104: 9e67010b     	fmov	d11, x8
 425c108: 92f78408     	mov	x8, #0x43dfffffffffffff ; =4890909195324358655
 425c10c: 9e67010c     	fmov	d12, x8
 425c110: 1400005a     	b	0x425c278 <_ChromeMain+0x4256fdc>
 425c114: aa1603e0     	mov	x0, x22
 425c118: b004ad01     	adrp	x1, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 425c11c: 911c5821     	add	x1, x1, #0x716
 425c120: 52800062     	mov	w2, #0x3                ; =3
 425c124: 97773657     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c128: b4000940     	cbz	x0, 0x425c250 <_ChromeMain+0x4256fb4>
 425c12c: aa0003e1     	mov	x1, x0
 425c130: f9005bff     	str	xzr, [sp, #0xb0]
 425c134: 6f00e400     	movi.2d	v0, #0000000000000000
 425c138: ad0483e0     	stp	q0, q0, [sp, #0x90]
 425c13c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 425c140: ad0283e0     	stp	q0, q0, [sp, #0x50]
 425c144: 3d8013e0     	str	q0, [sp, #0x40]
 425c148: 39805c02     	ldrsb	x2, [x0, #0x17]
 425c14c: b6f80042     	tbz	x2, #0x3f, 0x425c154 <_ChromeMain+0x4256eb8>
 425c150: a9400821     	ldp	x1, x2, [x1]
 425c154: 910103e0     	add	x0, sp, #0x40
 425c158: 9704501f     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425c15c: 394163e8     	ldrb	w8, [sp, #0x58]
 425c160: 34000268     	cbz	w8, 0x425c1ac <_ChromeMain+0x4256f10>
 425c164: 910103e0     	add	x0, sp, #0x40
 425c168: 9004acc1     	adrp	x1, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 425c16c: 910b4c21     	add	x1, x1, #0x2d3
 425c170: 528000c2     	mov	w2, #0x6                ; =6
 425c174: 970d1087     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c178: 370001a0     	tbnz	w0, #0x0, 0x425c1ac <_ChromeMain+0x4256f10>
 425c17c: 910103e0     	add	x0, sp, #0x40
 425c180: d004b221     	adrp	x1, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 425c184: 91144021     	add	x1, x1, #0x510
 425c188: 52800202     	mov	w2, #0x10               ; =16
 425c18c: 970d1081     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c190: 370000e0     	tbnz	w0, #0x0, 0x425c1ac <_ChromeMain+0x4256f10>
 425c194: 910103e0     	add	x0, sp, #0x40
 425c198: d004bb81     	adrp	x1, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 425c19c: 9133cc21     	add	x1, x1, #0xcf3
 425c1a0: 52800102     	mov	w2, #0x8                ; =8
 425c1a4: 970d107b     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c1a8: 36002b80     	tbz	w0, #0x0, 0x425c718 <_ChromeMain+0x425747c>
 425c1ac: 910103f8     	add	x24, sp, #0x40
 425c1b0: 9101c300     	add	x0, x24, #0x70
 425c1b4: d2800001     	mov	x1, #0x0                ; =0
 425c1b8: 96f72ec0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425c1bc: 91008300     	add	x0, x24, #0x20
 425c1c0: 96f72eae     	bl	0x27c78 <_ChromeMain+0x229dc>
 425c1c4: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 425c1c8: 36f80448     	tbz	w8, #0x1f, 0x425c250 <_ChromeMain+0x4256fb4>
 425c1cc: f94023e0     	ldr	x0, [sp, #0x40]
 425c1d0: f9402be8     	ldr	x8, [sp, #0x50]
 425c1d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425c1d8: 96f6b338     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c1dc: 1400001d     	b	0x425c250 <_ChromeMain+0x4256fb4>
 425c1e0: 910783ff     	add	sp, sp, #0x1e0
 425c1e4: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 425c1e8: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 425c1ec: a94657f6     	ldp	x22, x21, [sp, #0x60]
 425c1f0: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 425c1f4: a94467fa     	ldp	x26, x25, [sp, #0x40]
 425c1f8: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 425c1fc: 6d4223e9     	ldp	d9, d8, [sp, #0x20]
 425c200: 6d412beb     	ldp	d11, d10, [sp, #0x10]
 425c204: 6cc933ed     	ldp	d13, d12, [sp], #0x90
 425c208: d65f03c0     	ret
 425c20c: 3dc00380     	ldr	q0, [x28]
 425c210: f9400b88     	ldr	x8, [x28, #0x10]
 425c214: f9000b48     	str	x8, [x26, #0x10]
 425c218: 3d800340     	str	q0, [x26]
 425c21c: 1400002f     	b	0x425c2d8 <_ChromeMain+0x425703c>
 425c220: d280001a     	mov	x26, #0x0               ; =0
 425c224: d280001b     	mov	x27, #0x0               ; =0
 425c228: 14000037     	b	0x425c304 <_ChromeMain+0x4257068>
 425c22c: f9400389     	ldr	x9, [x28]
 425c230: 7100011f     	cmp	w8, #0x0
 425c234: 9a9c4128     	csel	x8, x9, x28, mi
 425c238: 79400109     	ldrh	w9, [x8]
 425c23c: 39400908     	ldrb	w8, [x8, #0x2]
 425c240: 7101b11f     	cmp	w8, #0x6c
 425c244: 528e4ea8     	mov	w8, #0x7275             ; =29301
 425c248: 7a480120     	ccmp	w9, w8, #0x0, eq
 425c24c: 54fff640     	b.eq	0x425c114 <_ChromeMain+0x4256e78>
 425c250: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 425c254: 36f800a8     	tbz	w8, #0x1f, 0x425c268 <_ChromeMain+0x4256fcc>
 425c258: f85583a0     	ldur	x0, [x29, #-0xa8]
 425c25c: f85683a8     	ldur	x8, [x29, #-0x98]
 425c260: d37ff901     	lsl	x1, x8, #1
 425c264: 96f6b315     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c268: b5000d1b     	cbnz	x27, 0x425c408 <_ChromeMain+0x425716c>
 425c26c: 910082d6     	add	x22, x22, #0x20
 425c270: eb1302df     	cmp	x22, x19
 425c274: 54fffb60     	b.eq	0x425c1e0 <_ChromeMain+0x4256f44>
 425c278: b4ffffb6     	cbz	x22, 0x425c26c <_ChromeMain+0x4256fd0>
 425c27c: 394062c8     	ldrb	w8, [x22, #0x18]
 425c280: 7100191f     	cmp	w8, #0x6
 425c284: 54ffff41     	b.ne	0x425c26c <_ChromeMain+0x4256fd0>
 425c288: f94006b4     	ldr	x20, [x21, #0x8]
 425c28c: 8b140688     	add	x8, x20, x20, lsl #1
 425c290: d37df118     	lsl	x24, x8, #3
 425c294: b4fffc74     	cbz	x20, 0x425c220 <_ChromeMain+0x4256f84>
 425c298: eb19029f     	cmp	x20, x25
 425c29c: 540037a8     	b.hi	0x425c990 <_ChromeMain+0x42576f4>
 425c2a0: f94002bc     	ldr	x28, [x21]
 425c2a4: aa1803e0     	mov	x0, x24
 425c2a8: 96f6cc30     	bl	0xf368 <_ChromeMain+0xa0cc>
 425c2ac: aa0003fb     	mov	x27, x0
 425c2b0: aa0003fa     	mov	x26, x0
 425c2b4: b40001b8     	cbz	x24, 0x425c2e8 <_ChromeMain+0x425704c>
 425c2b8: aa1803f9     	mov	x25, x24
 425c2bc: aa1b03fa     	mov	x26, x27
 425c2c0: b40036ba     	cbz	x26, 0x425c994 <_ChromeMain+0x42576f8>
 425c2c4: 39c05f88     	ldrsb	w8, [x28, #0x17]
 425c2c8: 36fffa28     	tbz	w8, #0x1f, 0x425c20c <_ChromeMain+0x4256f70>
 425c2cc: a9400b81     	ldp	x1, x2, [x28]
 425c2d0: aa1a03e0     	mov	x0, x26
 425c2d4: 96f7aa3f     	bl	0x46bd0 <_ChromeMain+0x41934>
 425c2d8: 9100639c     	add	x28, x28, #0x18
 425c2dc: 9100635a     	add	x26, x26, #0x18
 425c2e0: f1006339     	subs	x25, x25, #0x18
 425c2e4: 54fffee1     	b.ne	0x425c2c0 <_ChromeMain+0x4257024>
 425c2e8: cb1b0348     	sub	x8, x26, x27
 425c2ec: 9343fd08     	asr	x8, x8, #3
 425c2f0: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 425c2f4: f2955569     	movk	x9, #0xaaab
 425c2f8: 9b097d1a     	mul	x26, x8, x9
 425c2fc: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c300: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c304: aa1603e0     	mov	x0, x22
 425c308: aa1703e1     	mov	x1, x23
 425c30c: 52800082     	mov	w2, #0x4                ; =4
 425c310: 977735dc     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c314: b4fffaa0     	cbz	x0, 0x425c268 <_ChromeMain+0x4256fcc>
 425c318: aa0003fc     	mov	x28, x0
 425c31c: aa1603e0     	mov	x0, x22
 425c320: d004aca1     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 425c324: 9138dc21     	add	x1, x1, #0xe37
 425c328: 52800082     	mov	w2, #0x4                ; =4
 425c32c: 977735d5     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c330: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 425c334: f81683bf     	stur	xzr, [x29, #-0x98]
 425c338: b40000c0     	cbz	x0, 0x425c350 <_ChromeMain+0x42570b4>
 425c33c: 39805c01     	ldrsb	x1, [x0, #0x17]
 425c340: b6f80041     	tbz	x1, #0x3f, 0x425c348 <_ChromeMain+0x42570ac>
 425c344: a9400400     	ldp	x0, x1, [x0]
 425c348: d102a3a8     	sub	x8, x29, #0xa8
 425c34c: 971a17f1     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425c350: 39405f89     	ldrb	w9, [x28, #0x17]
 425c354: 13001d28     	sxtb	w8, w9
 425c358: f940078a     	ldr	x10, [x28, #0x8]
 425c35c: 7100011f     	cmp	w8, #0x0
 425c360: 9a894149     	csel	x9, x10, x9, mi
 425c364: f1000d3f     	cmp	x9, #0x3
 425c368: 54fff620     	b.eq	0x425c22c <_ChromeMain+0x4256f90>
 425c36c: f100193f     	cmp	x9, #0x6
 425c370: 54fff701     	b.ne	0x425c250 <_ChromeMain+0x4256fb4>
 425c374: f9400389     	ldr	x9, [x28]
 425c378: 7100011f     	cmp	w8, #0x0
 425c37c: 9a9c4128     	csel	x8, x9, x28, mi
 425c380: b9400109     	ldr	w9, [x8]
 425c384: 79400908     	ldrh	w8, [x8, #0x4]
 425c388: 528decca     	mov	w10, #0x6f66            ; =28518
 425c38c: 72ac8d8a     	movk	w10, #0x646c, lsl #16
 425c390: 6b0a013f     	cmp	w9, w10
 425c394: 528e4ca9     	mov	w9, #0x7265             ; =29285
 425c398: 7a490100     	ccmp	w8, w9, #0x0, eq
 425c39c: 54fff5a1     	b.ne	0x425c250 <_ChromeMain+0x4256fb4>
 425c3a0: 3856f3a8     	ldurb	w8, [x29, #-0x91]
 425c3a4: f85603a9     	ldur	x9, [x29, #-0xa0]
 425c3a8: 7219011f     	tst	w8, #0x80
 425c3ac: 9a881128     	csel	x8, x9, x8, ne
 425c3b0: b50006c8     	cbnz	x8, 0x425c488 <_ChromeMain+0x42571ec>
 425c3b4: aa1603e0     	mov	x0, x22
 425c3b8: f004b781     	adrp	x1, 0xd94f000 <dyld_stub_binder+0xd94f000>
 425c3bc: 9109c821     	add	x1, x1, #0x272
 425c3c0: 52800102     	mov	w2, #0x8                ; =8
 425c3c4: 975b41af     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 425c3c8: b4fff440     	cbz	x0, 0x425c250 <_ChromeMain+0x4256fb4>
 425c3cc: a90c6bfb     	stp	x27, x26, [sp, #0xc0]
 425c3d0: f9006bf4     	str	x20, [sp, #0xd0]
 425c3d4: 910303e1     	add	x1, sp, #0xc0
 425c3d8: b94017e2     	ldr	w2, [sp, #0x14]
 425c3dc: f9400fe3     	ldr	x3, [sp, #0x18]
 425c3e0: 97ffff29     	bl	0x425c084 <_ChromeMain+0x4256de8>
 425c3e4: b5002a9b     	cbnz	x27, 0x425c934 <_ChromeMain+0x4257698>
 425c3e8: d2800014     	mov	x20, #0x0               ; =0
 425c3ec: d280001a     	mov	x26, #0x0               ; =0
 425c3f0: 17ffff98     	b	0x425c250 <_ChromeMain+0x4256fb4>
 425c3f4: f9400300     	ldr	x0, [x24]
 425c3f8: f9400b08     	ldr	x8, [x24, #0x10]
 425c3fc: d37ff901     	lsl	x1, x8, #1
 425c400: 96f6b2ae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c404: 1400000a     	b	0x425c42c <_ChromeMain+0x4257190>
 425c408: b400019a     	cbz	x26, 0x425c438 <_ChromeMain+0x425719c>
 425c40c: 52800308     	mov	w8, #0x18               ; =24
 425c410: 9b086f48     	madd	x8, x26, x8, x27
 425c414: d1006118     	sub	x24, x8, #0x18
 425c418: d37df348     	lsl	x8, x26, #3
 425c41c: cb1a1519     	sub	x25, x8, x26, lsl #5
 425c420: b4002bb8     	cbz	x24, 0x425c994 <_ChromeMain+0x42576f8>
 425c424: 39c05f08     	ldrsb	w8, [x24, #0x17]
 425c428: 37fffe68     	tbnz	w8, #0x1f, 0x425c3f4 <_ChromeMain+0x4257158>
 425c42c: d1006318     	sub	x24, x24, #0x18
 425c430: b1006339     	adds	x25, x25, #0x18
 425c434: 54ffff61     	b.ne	0x425c420 <_ChromeMain+0x4257184>
 425c438: 8b140688     	add	x8, x20, x20, lsl #1
 425c43c: d37df101     	lsl	x1, x8, #3
 425c440: aa1b03e0     	mov	x0, x27
 425c444: 96f6b29d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c448: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c44c: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c450: 17ffff87     	b	0x425c26c <_ChromeMain+0x4256fd0>
 425c454: 13001d09     	sxtb	w9, w8
 425c458: 7100013f     	cmp	w9, #0x0
 425c45c: a975aba9     	ldp	x9, x10, [x29, #-0xa8]
 425c460: d102a3ab     	sub	x11, x29, #0xa8
 425c464: 9a8b4121     	csel	x1, x9, x11, mi
 425c468: 9a884142     	csel	x2, x10, x8, mi
 425c46c: 91026320     	add	x0, x25, #0x98
 425c470: 9719c8f1     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 425c474: 14000035     	b	0x425c548 <_ChromeMain+0x42572ac>
 425c478: a9758ba1     	ldp	x1, x2, [x29, #-0xa8]
 425c47c: 91026320     	add	x0, x25, #0x98
 425c480: 9719c89b     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 425c484: 14000031     	b	0x425c548 <_ChromeMain+0x42572ac>
 425c488: 6f00e400     	movi.2d	v0, #0000000000000000
 425c48c: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 425c490: ad0803e0     	stp	q0, q0, [sp, #0x100]
 425c494: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 425c498: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 425c49c: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 425c4a0: ad0983e0     	stp	q0, q0, [sp, #0x130]
 425c4a4: 3d804be0     	str	q0, [sp, #0x120]
 425c4a8: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 425c4ac: 12800008     	mov	w8, #-0x1               ; =-1
 425c4b0: b900efe8     	str	w8, [sp, #0xec]
 425c4b4: b900f7e8     	str	w8, [sp, #0xf4]
 425c4b8: b900ffe8     	str	w8, [sp, #0xfc]
 425c4bc: b90107e8     	str	w8, [sp, #0x104]
 425c4c0: b9010fe8     	str	w8, [sp, #0x10c]
 425c4c4: b90117e8     	str	w8, [sp, #0x114]
 425c4c8: b9011fe8     	str	w8, [sp, #0x11c]
 425c4cc: b90127e8     	str	w8, [sp, #0x124]
 425c4d0: 3904a7ff     	strb	wzr, [sp, #0x129]
 425c4d4: 390623ff     	strb	wzr, [sp, #0x188]
 425c4d8: 3906a3ff     	strb	wzr, [sp, #0x1a8]
 425c4dc: 910303e9     	add	x9, sp, #0xc0
 425c4e0: 3c8a9120     	stur	q0, [x9, #0xa9]
 425c4e4: ad048120     	stp	q0, q0, [x9, #0x90]
 425c4e8: 8b1a074a     	add	x10, x26, x26, lsl #1
 425c4ec: ad038120     	stp	q0, q0, [x9, #0x70]
 425c4f0: b94017e8     	ldr	w8, [sp, #0x14]
 425c4f4: 390303e8     	strb	w8, [sp, #0xc0]
 425c4f8: f90007ea     	str	x10, [sp, #0x8]
 425c4fc: 8b0a0f7c     	add	x28, x27, x10, lsl #3
 425c500: 52800028     	mov	w8, #0x1                ; =1
 425c504: 390307e8     	strb	w8, [sp, #0xc1]
 425c508: 910303f9     	add	x25, sp, #0xc0
 425c50c: 91020120     	add	x0, x9, #0x80
 425c510: aa1b03e1     	mov	x1, x27
 425c514: aa1c03e2     	mov	x2, x28
 425c518: aa1a03e3     	mov	x3, x26
 425c51c: 97a7c649     	bl	0x2c4de40 <_ChromeMain+0x2c48ba4>
 425c520: 39c5bfe9     	ldrsb	w9, [sp, #0x16f]
 425c524: 3856f3a8     	ldurb	w8, [x29, #-0x91]
 425c528: 37fff969     	tbnz	w9, #0x1f, 0x425c454 <_ChromeMain+0x42571b8>
 425c52c: 373ffa68     	tbnz	w8, #0x7, 0x425c478 <_ChromeMain+0x42571dc>
 425c530: d102a3a8     	sub	x8, x29, #0xa8
 425c534: 3dc00100     	ldr	q0, [x8]
 425c538: 910303e9     	add	x9, sp, #0xc0
 425c53c: 3c898120     	stur	q0, [x9, #0x98]
 425c540: f85683a8     	ldur	x8, [x29, #-0x98]
 425c544: f80a8128     	stur	x8, [x9, #0xa8]
 425c548: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c54c: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c550: aa1603e0     	mov	x0, x22
 425c554: f004c601     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425c558: 91123421     	add	x1, x1, #0x48d
 425c55c: 52800142     	mov	w2, #0xa                ; =10
 425c560: 97773548     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c564: f90023ff     	str	xzr, [sp, #0x40]
 425c568: b4000160     	cbz	x0, 0x425c594 <_ChromeMain+0x42572f8>
 425c56c: 39805c01     	ldrsb	x1, [x0, #0x17]
 425c570: b6f80041     	tbz	x1, #0x3f, 0x425c578 <_ChromeMain+0x42572dc>
 425c574: a9400400     	ldp	x0, x1, [x0]
 425c578: 910103e2     	add	x2, sp, #0x40
 425c57c: 97391310     	bl	0x10a11bc <_ChromeMain+0x109bf20>
 425c580: aa0003e8     	mov	x8, x0
 425c584: f94023e0     	ldr	x0, [sp, #0x40]
 425c588: f100001f     	cmp	x0, #0x0
 425c58c: 1a88d3e8     	csel	w8, wzr, w8, le
 425c590: 370003e8     	tbnz	w8, #0x0, 0x425c60c <_ChromeMain+0x4257370>
 425c594: b0054aa8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 425c598: f9468508     	ldr	x8, [x8, #0xd08]
 425c59c: 1039c4a9     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 425c5a0: d503201f     	nop
 425c5a4: eb09011f     	cmp	x8, x9
 425c5a8: 54000b41     	b.ne	0x425c710 <_ChromeMain+0x4257474>
 425c5ac: 94f754f9     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 425c5b0: 1e602008     	fcmp	d0, #0.0
 425c5b4: 54001fa0     	b.eq	0x425c9a8 <_ChromeMain+0x425770c>
 425c5b8: 1e692000     	fcmp	d0, d9
 425c5bc: 54001fa0     	b.eq	0x425c9b0 <_ChromeMain+0x4257714>
 425c5c0: 1e682800     	fadd	d0, d0, d8
 425c5c4: 1e6a0800     	fmul	d0, d0, d10
 425c5c8: 1e6b2000     	fcmp	d0, d11
 425c5cc: 92f0000a     	mov	x10, #0x7fffffffffffffff ; =9223372036854775807
 425c5d0: 9a8ab3e8     	csel	x8, xzr, x10, lt
 425c5d4: 1e6b6801     	fmaxnm	d1, d0, d11
 425c5d8: 9e780029     	fcvtzs	x9, d1
 425c5dc: 1e6c2000     	fcmp	d0, d12
 425c5e0: 9a889120     	csel	x0, x9, x8, ls
 425c5e4: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 425c5e8: 8b080008     	add	x8, x0, x8
 425c5ec: f100091f     	cmp	x8, #0x2
 425c5f0: 540000e3     	b.lo	0x425c60c <_ChromeMain+0x4257370>
 425c5f4: d2880008     	mov	x8, #0x4000             ; =16384
 425c5f8: f2a910c8     	movk	x8, #0x4886, lsl #16
 425c5fc: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 425c600: f2e00528     	movk	x8, #0x29, lsl #48
 425c604: ab080008     	adds	x8, x0, x8
 425c608: 9a886140     	csel	x0, x10, x8, vs
 425c60c: f900bbe0     	str	x0, [sp, #0x170]
 425c610: 910303e1     	add	x1, sp, #0xc0
 425c614: f9400fe0     	ldr	x0, [sp, #0x18]
 425c618: 94d71b72     	bl	0x78233e0 <_ChromeMain+0x781e144>
 425c61c: eb14035f     	cmp	x26, x20
 425c620: 54000260     	b.eq	0x425c66c <_ChromeMain+0x42573d0>
 425c624: b4001b9c     	cbz	x28, 0x425c994 <_ChromeMain+0x42576f8>
 425c628: d102a3a8     	sub	x8, x29, #0xa8
 425c62c: 3dc00100     	ldr	q0, [x8]
 425c630: f85683a8     	ldur	x8, [x29, #-0x98]
 425c634: f9000b88     	str	x8, [x28, #0x10]
 425c638: 3d800380     	str	q0, [x28]
 425c63c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 425c640: f81583bf     	stur	xzr, [x29, #-0xa8]
 425c644: 91006388     	add	x8, x28, #0x18
 425c648: eb1b0108     	subs	x8, x8, x27
 425c64c: 54001a40     	b.eq	0x425c994 <_ChromeMain+0x42576f8>
 425c650: 9343fd08     	asr	x8, x8, #3
 425c654: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 425c658: f2955569     	movk	x9, #0xaaab
 425c65c: 9b097d1a     	mul	x26, x8, x9
 425c660: 910303e0     	add	x0, sp, #0xc0
 425c664: 94be596d     	bl	0x71f2c18 <_ChromeMain+0x71ed97c>
 425c668: 17ffff53     	b	0x425c3b4 <_ChromeMain+0x4257118>
 425c66c: 91000688     	add	x8, x20, #0x1
 425c670: eb19011f     	cmp	x8, x25
 425c674: 540018e8     	b.hi	0x425c990 <_ChromeMain+0x42576f4>
 425c678: d37ffa89     	lsl	x9, x20, #1
 425c67c: eb08013f     	cmp	x9, x8
 425c680: 9a888128     	csel	x8, x9, x8, hi
 425c684: b200f3e9     	mov	x9, #0x5555555555555555 ; =6148914691236517205
 425c688: f2e0aaa9     	movk	x9, #0x555, lsl #48
 425c68c: eb09029f     	cmp	x20, x9
 425c690: 9a993108     	csel	x8, x8, x25, lo
 425c694: f90003e8     	str	x8, [sp]
 425c698: b4001908     	cbz	x8, 0x425c9b8 <_ChromeMain+0x425771c>
 425c69c: eb19011f     	cmp	x8, x25
 425c6a0: 540017c8     	b.hi	0x425c998 <_ChromeMain+0x42576fc>
 425c6a4: 8b080508     	add	x8, x8, x8, lsl #1
 425c6a8: d37df100     	lsl	x0, x8, #3
 425c6ac: 96f6cb2f     	bl	0xf368 <_ChromeMain+0xa0cc>
 425c6b0: 52800308     	mov	w8, #0x18               ; =24
 425c6b4: 9b08029c     	madd	x28, x20, x8, x0
 425c6b8: b40016fc     	cbz	x28, 0x425c994 <_ChromeMain+0x42576f8>
 425c6bc: f94007e8     	ldr	x8, [sp, #0x8]
 425c6c0: d37df102     	lsl	x2, x8, #3
 425c6c4: d102a3a8     	sub	x8, x29, #0xa8
 425c6c8: 3dc00100     	ldr	q0, [x8]
 425c6cc: f85683a8     	ldur	x8, [x29, #-0x98]
 425c6d0: f9000b88     	str	x8, [x28, #0x10]
 425c6d4: 3d800380     	str	q0, [x28]
 425c6d8: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 425c6dc: f81583bf     	stur	xzr, [x29, #-0xa8]
 425c6e0: 928002e8     	mov	x8, #-0x18              ; =-24
 425c6e4: 9b08729a     	madd	x26, x20, x8, x28
 425c6e8: aa1a03e0     	mov	x0, x26
 425c6ec: aa1b03e1     	mov	x1, x27
 425c6f0: 94f6b582     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 425c6f4: b400009b     	cbz	x27, 0x425c704 <_ChromeMain+0x4257468>
 425c6f8: aa1b03e0     	mov	x0, x27
 425c6fc: aa1803e1     	mov	x1, x24
 425c700: 96f6b1ee     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c704: f94003f4     	ldr	x20, [sp]
 425c708: aa1a03fb     	mov	x27, x26
 425c70c: 17ffffce     	b	0x425c644 <_ChromeMain+0x42573a8>
 425c710: d63f0100     	blr	x8
 425c714: 17ffffbe     	b	0x425c60c <_ChromeMain+0x4257370>
 425c718: 6f00e400     	movi.2d	v0, #0000000000000000
 425c71c: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 425c720: ad0803e0     	stp	q0, q0, [sp, #0x100]
 425c724: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 425c728: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 425c72c: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 425c730: ad0983e0     	stp	q0, q0, [sp, #0x130]
 425c734: 3d804be0     	str	q0, [sp, #0x120]
 425c738: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 425c73c: 12800008     	mov	w8, #-0x1               ; =-1
 425c740: b900efe8     	str	w8, [sp, #0xec]
 425c744: b900f7e8     	str	w8, [sp, #0xf4]
 425c748: b900ffe8     	str	w8, [sp, #0xfc]
 425c74c: b90107e8     	str	w8, [sp, #0x104]
 425c750: b9010fe8     	str	w8, [sp, #0x10c]
 425c754: b90117e8     	str	w8, [sp, #0x114]
 425c758: b9011fe8     	str	w8, [sp, #0x11c]
 425c75c: b90127e8     	str	w8, [sp, #0x124]
 425c760: 3904a7ff     	strb	wzr, [sp, #0x129]
 425c764: 390623ff     	strb	wzr, [sp, #0x188]
 425c768: 3906a3ff     	strb	wzr, [sp, #0x1a8]
 425c76c: 910303e9     	add	x9, sp, #0xc0
 425c770: 3c8a9120     	stur	q0, [x9, #0xa9]
 425c774: ad048120     	stp	q0, q0, [x9, #0x90]
 425c778: ad038120     	stp	q0, q0, [x9, #0x70]
 425c77c: b94017e8     	ldr	w8, [sp, #0x14]
 425c780: 390303e8     	strb	w8, [sp, #0xc0]
 425c784: 910303fc     	add	x28, sp, #0xc0
 425c788: 91002120     	add	x0, x9, #0x8
 425c78c: 910103e1     	add	x1, sp, #0x40
 425c790: 970e74d4     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425c794: f940a3f9     	ldr	x25, [sp, #0x140]
 425c798: b5001279     	cbnz	x25, 0x425c9e4 <_ChromeMain+0x4257748>
 425c79c: a9146bfb     	stp	x27, x26, [sp, #0x140]
 425c7a0: f900abf4     	str	x20, [sp, #0x150]
 425c7a4: 3856f3a8     	ldurb	w8, [x29, #-0x91]
 425c7a8: f85603a9     	ldur	x9, [x29, #-0xa0]
 425c7ac: 7219011f     	tst	w8, #0x80
 425c7b0: 9a881128     	csel	x8, x9, x8, ne
 425c7b4: b4000128     	cbz	x8, 0x425c7d8 <_ChromeMain+0x425753c>
 425c7b8: d102a3a8     	sub	x8, x29, #0xa8
 425c7bc: 3dc00100     	ldr	q0, [x8]
 425c7c0: 3d800be0     	str	q0, [sp, #0x20]
 425c7c4: f85683a8     	ldur	x8, [x29, #-0x98]
 425c7c8: f9001be8     	str	x8, [sp, #0x30]
 425c7cc: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 425c7d0: f81583bf     	stur	xzr, [x29, #-0xa8]
 425c7d4: 1400000b     	b	0x425c800 <_ChromeMain+0x4257564>
 425c7d8: 91002380     	add	x0, x28, #0x8
 425c7dc: 971040ab     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 425c7e0: 39805c08     	ldrsb	x8, [x0, #0x17]
 425c7e4: a9402809     	ldp	x9, x10, [x0]
 425c7e8: f100011f     	cmp	x8, #0x0
 425c7ec: 9a804120     	csel	x0, x9, x0, mi
 425c7f0: 7100011f     	cmp	w8, #0x0
 425c7f4: 9a884141     	csel	x1, x10, x8, mi
 425c7f8: 910083e8     	add	x8, sp, #0x20
 425c7fc: 971a16c5     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425c800: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c804: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c808: 92f00014     	mov	x20, #0x7fffffffffffffff ; =9223372036854775807
 425c80c: 39c5bfe8     	ldrsb	w8, [sp, #0x16f]
 425c810: 36f800a8     	tbz	w8, #0x1f, 0x425c824 <_ChromeMain+0x4257588>
 425c814: f940afe0     	ldr	x0, [sp, #0x158]
 425c818: f940b7e8     	ldr	x8, [sp, #0x168]
 425c81c: d37ff901     	lsl	x1, x8, #1
 425c820: 96f6b1a6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c824: 3dc00be0     	ldr	q0, [sp, #0x20]
 425c828: 910303e9     	add	x9, sp, #0xc0
 425c82c: 3c898120     	stur	q0, [x9, #0x98]
 425c830: f9401be8     	ldr	x8, [sp, #0x30]
 425c834: f80a8128     	stur	x8, [x9, #0xa8]
 425c838: aa1603e0     	mov	x0, x22
 425c83c: f004c601     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425c840: 91123421     	add	x1, x1, #0x48d
 425c844: 52800142     	mov	w2, #0xa                ; =10
 425c848: 9777348e     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c84c: f90013ff     	str	xzr, [sp, #0x20]
 425c850: b4000160     	cbz	x0, 0x425c87c <_ChromeMain+0x42575e0>
 425c854: 39805c01     	ldrsb	x1, [x0, #0x17]
 425c858: b6f80041     	tbz	x1, #0x3f, 0x425c860 <_ChromeMain+0x42575c4>
 425c85c: a9400400     	ldp	x0, x1, [x0]
 425c860: 910083e2     	add	x2, sp, #0x20
 425c864: 97391256     	bl	0x10a11bc <_ChromeMain+0x109bf20>
 425c868: aa0003e8     	mov	x8, x0
 425c86c: f94013e0     	ldr	x0, [sp, #0x20]
 425c870: f100001f     	cmp	x0, #0x0
 425c874: 1a88d3e8     	csel	w8, wzr, w8, le
 425c878: 370003c8     	tbnz	w8, #0x0, 0x425c8f0 <_ChromeMain+0x4257654>
 425c87c: b0054aa8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 425c880: f9468508     	ldr	x8, [x8, #0xd08]
 425c884: 1039ad69     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 425c888: d503201f     	nop
 425c88c: eb09011f     	cmp	x8, x9
 425c890: 54000441     	b.ne	0x425c918 <_ChromeMain+0x425767c>
 425c894: 94f7543f     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 425c898: 1e602008     	fcmp	d0, #0.0
 425c89c: 54000920     	b.eq	0x425c9c0 <_ChromeMain+0x4257724>
 425c8a0: 1e692000     	fcmp	d0, d9
 425c8a4: 54000920     	b.eq	0x425c9c8 <_ChromeMain+0x425772c>
 425c8a8: 1e682800     	fadd	d0, d0, d8
 425c8ac: 1e6a0800     	fmul	d0, d0, d10
 425c8b0: 1e6b2000     	fcmp	d0, d11
 425c8b4: 9a94b3e8     	csel	x8, xzr, x20, lt
 425c8b8: 1e6b6801     	fmaxnm	d1, d0, d11
 425c8bc: 9e780029     	fcvtzs	x9, d1
 425c8c0: 1e6c2000     	fcmp	d0, d12
 425c8c4: 9a889120     	csel	x0, x9, x8, ls
 425c8c8: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 425c8cc: 8b080008     	add	x8, x0, x8
 425c8d0: f100091f     	cmp	x8, #0x2
 425c8d4: 540000e3     	b.lo	0x425c8f0 <_ChromeMain+0x4257654>
 425c8d8: d2880008     	mov	x8, #0x4000             ; =16384
 425c8dc: f2a910c8     	movk	x8, #0x4886, lsl #16
 425c8e0: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 425c8e4: f2e00528     	movk	x8, #0x29, lsl #48
 425c8e8: ab080008     	adds	x8, x0, x8
 425c8ec: 9a886280     	csel	x0, x20, x8, vs
 425c8f0: f900bbe0     	str	x0, [sp, #0x170]
 425c8f4: 910303e1     	add	x1, sp, #0xc0
 425c8f8: f9400fe0     	ldr	x0, [sp, #0x18]
 425c8fc: 94d71ab9     	bl	0x78233e0 <_ChromeMain+0x781e144>
 425c900: 910303e0     	add	x0, sp, #0xc0
 425c904: 94be58c5     	bl	0x71f2c18 <_ChromeMain+0x71ed97c>
 425c908: d2800014     	mov	x20, #0x0               ; =0
 425c90c: d280001a     	mov	x26, #0x0               ; =0
 425c910: d280001b     	mov	x27, #0x0               ; =0
 425c914: 17fffe26     	b	0x425c1ac <_ChromeMain+0x4256f10>
 425c918: d63f0100     	blr	x8
 425c91c: 17fffff5     	b	0x425c8f0 <_ChromeMain+0x4257654>
 425c920: f9400300     	ldr	x0, [x24]
 425c924: f9400b08     	ldr	x8, [x24, #0x10]
 425c928: d37ff901     	lsl	x1, x8, #1
 425c92c: 96f6b163     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c930: 1400000a     	b	0x425c958 <_ChromeMain+0x42576bc>
 425c934: b400019a     	cbz	x26, 0x425c964 <_ChromeMain+0x42576c8>
 425c938: 52800308     	mov	w8, #0x18               ; =24
 425c93c: 9b086f48     	madd	x8, x26, x8, x27
 425c940: d1006118     	sub	x24, x8, #0x18
 425c944: d37df348     	lsl	x8, x26, #3
 425c948: cb1a1519     	sub	x25, x8, x26, lsl #5
 425c94c: b4000258     	cbz	x24, 0x425c994 <_ChromeMain+0x42576f8>
 425c950: 39c05f08     	ldrsb	w8, [x24, #0x17]
 425c954: 37fffe68     	tbnz	w8, #0x1f, 0x425c920 <_ChromeMain+0x4257684>
 425c958: d1006318     	sub	x24, x24, #0x18
 425c95c: b1006339     	adds	x25, x25, #0x18
 425c960: 54ffff61     	b.ne	0x425c94c <_ChromeMain+0x42576b0>
 425c964: f90067ff     	str	xzr, [sp, #0xc8]
 425c968: 8b140688     	add	x8, x20, x20, lsl #1
 425c96c: d37df101     	lsl	x1, x8, #3
 425c970: aa1b03e0     	mov	x0, x27
 425c974: 96f6b151     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425c978: d2800014     	mov	x20, #0x0               ; =0
 425c97c: d280001a     	mov	x26, #0x0               ; =0
 425c980: d280001b     	mov	x27, #0x0               ; =0
 425c984: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c988: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c98c: 17fffe31     	b	0x425c250 <_ChromeMain+0x4256fb4>
 425c990: 9772dcfc     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 425c994: d4200020     	brk	#0x1
 425c998: 9426a5a2     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
