
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46070b8: d10543ff     	sub	sp, sp, #0x150
 46070bc: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 46070c0: a91067fa     	stp	x26, x25, [sp, #0x100]
 46070c4: a9115ff8     	stp	x24, x23, [sp, #0x110]
 46070c8: a91257f6     	stp	x22, x21, [sp, #0x120]
 46070cc: a9134ff4     	stp	x20, x19, [sp, #0x130]
 46070d0: a9147bfd     	stp	x29, x30, [sp, #0x140]
 46070d4: 910503fd     	add	x29, sp, #0x140
 46070d8: f941a008     	ldr	x8, [x0, #0x340]
 46070dc: b4000448     	cbz	x8, 0x4607164 <_ChromeMain+0x4601ec8>
 46070e0: aa0003f4     	mov	x20, x0
 46070e4: 52800016     	mov	w22, #0x0               ; =0
 46070e8: f9403500     	ldr	x0, [x8, #0x68]
 46070ec: b40003e0     	cbz	x0, 0x4607168 <_ChromeMain+0x4601ecc>
 46070f0: aa0103f3     	mov	x19, x1
 46070f4: 39406028     	ldrb	w8, [x1, #0x18]
 46070f8: 36000388     	tbz	w8, #0x0, 0x4607168 <_ChromeMain+0x4601ecc>
 46070fc: aa0203f5     	mov	x21, x2
 4607100: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 4607104: f81983bf     	stur	xzr, [x29, #-0x68]
 4607108: d101e3a8     	sub	x8, x29, #0x78
 460710c: 97ef3555     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 4607110: f85903b8     	ldur	x24, [x29, #-0x70]
 4607114: 39558288     	ldrb	w8, [x20, #0x560]
 4607118: aa1803f9     	mov	x25, x24
 460711c: 34000088     	cbz	w8, 0x460712c <_ChromeMain+0x4601e90>
 4607120: f942ae88     	ldr	x8, [x20, #0x558]
 4607124: eb08031f     	cmp	x24, x8
 4607128: 9a883319     	csel	x25, x24, x8, lo
 460712c: f85883ba     	ldur	x26, [x29, #-0x78]
 4607130: 8b180f08     	add	x8, x24, x24, lsl #3
 4607134: d37ced1b     	lsl	x27, x8, #4
 4607138: b40003fb     	cbz	x27, 0x46071b4 <_ChromeMain+0x4601f18>
 460713c: aa1903fc     	mov	x28, x25
 4607140: 8b081348     	add	x8, x26, x8, lsl #4
 4607144: f90007e8     	str	x8, [sp, #0x8]
 4607148: 39405e68     	ldrb	w8, [x19, #0x17]
 460714c: 13001d19     	sxtb	w25, w8
 4607150: f9400669     	ldr	x9, [x19, #0x8]
 4607154: 7100033f     	cmp	w25, #0x0
 4607158: 9a884137     	csel	x23, x9, x8, mi
 460715c: aa1a03f6     	mov	x22, x26
 4607160: 1400001a     	b	0x46071c8 <_ChromeMain+0x4601f2c>
 4607164: 52800016     	mov	w22, #0x0               ; =0
 4607168: aa1603e0     	mov	x0, x22
 460716c: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 4607170: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 4607174: a95257f6     	ldp	x22, x21, [sp, #0x120]
 4607178: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 460717c: a95067fa     	ldp	x26, x25, [sp, #0x100]
 4607180: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 4607184: 910543ff     	add	sp, sp, #0x150
 4607188: d65f03c0     	ret
 460718c: f85883a0     	ldur	x0, [x29, #-0x78]
 4607190: cb000268     	sub	x8, x19, x0
 4607194: 9344fd08     	asr	x8, x8, #4
 4607198: 9b1b7d08     	mul	x8, x8, x27
 460719c: f81903a8     	stur	x8, [x29, #-0x70]
 46071a0: f85983a8     	ldur	x8, [x29, #-0x68]
 46071a4: 8b080d08     	add	x8, x8, x8, lsl #3
 46071a8: d37ced01     	lsl	x1, x8, #4
 46071ac: 96e80743     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46071b0: 17ffffee     	b	0x4607168 <_ChromeMain+0x4601ecc>
 46071b4: aa1a03f6     	mov	x22, x26
 46071b8: 14000017     	b	0x4607214 <_ChromeMain+0x4601f78>
 46071bc: 910242d6     	add	x22, x22, #0x90
 46071c0: f102437b     	subs	x27, x27, #0x90
 46071c4: 54000240     	b.eq	0x460720c <_ChromeMain+0x4601f70>
 46071c8: 39405ec9     	ldrb	w9, [x22, #0x17]
 46071cc: 13001d28     	sxtb	w8, w9
 46071d0: f94006ca     	ldr	x10, [x22, #0x8]
 46071d4: 7100011f     	cmp	w8, #0x0
 46071d8: 9a894149     	csel	x9, x10, x9, mi
 46071dc: eb17013f     	cmp	x9, x23
 46071e0: 54fffee1     	b.ne	0x46071bc <_ChromeMain+0x4601f20>
 46071e4: f94002c9     	ldr	x9, [x22]
 46071e8: 7100011f     	cmp	w8, #0x0
 46071ec: 9a964120     	csel	x0, x9, x22, mi
 46071f0: f9400268     	ldr	x8, [x19]
 46071f4: 7100033f     	cmp	w25, #0x0
 46071f8: 9a934101     	csel	x1, x8, x19, mi
 46071fc: aa1703e2     	mov	x2, x23
 4607200: 94e80998     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4607204: 34000060     	cbz	w0, 0x4607210 <_ChromeMain+0x4601f74>
 4607208: 17ffffed     	b	0x46071bc <_ChromeMain+0x4601f20>
 460720c: f94007f6     	ldr	x22, [sp, #0x8]
 4607210: aa1c03f9     	mov	x25, x28
 4607214: 9100c3f7     	add	x23, sp, #0x30
 4607218: 52801208     	mov	w8, #0x90               ; =144
 460721c: 9b086b08     	madd	x8, x24, x8, x26
 4607220: d291c73b     	mov	x27, #0x8e39            ; =36409
 4607224: f2a71c7b     	movk	x27, #0x38e3, lsl #16
 4607228: f2dc71db     	movk	x27, #0xe38e, lsl #32
 460722c: f2f1c71b     	movk	x27, #0x8e38, lsl #48
 4607230: eb0802df     	cmp	x22, x8
 4607234: 54000c40     	b.eq	0x46073bc <_ChromeMain+0x4602120>
 4607238: 6f00e400     	movi.2d	v0, #0000000000000000
 460723c: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 4607240: ad0403e0     	stp	q0, q0, [sp, #0x80]
 4607244: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4607248: ad0203e0     	stp	q0, q0, [sp, #0x40]
 460724c: 3d800fe0     	str	q0, [sp, #0x30]
 4607250: 9100c3e0     	add	x0, sp, #0x30
 4607254: aa1603e1     	mov	x1, x22
 4607258: 96ef4efb     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 460725c: 3cc782c0     	ldur	q0, [x22, #0x78]
 4607260: f94046c8     	ldr	x8, [x22, #0x88]
 4607264: f9005fe8     	str	x8, [sp, #0xb8]
 4607268: 3c8782e0     	stur	q0, [x23, #0x78]
 460726c: a907fedf     	stp	xzr, xzr, [x22, #0x78]
 4607270: f90046df     	str	xzr, [x22, #0x88]
 4607274: a978a3b7     	ldp	x23, x8, [x29, #-0x78]
 4607278: 8b080d09     	add	x9, x8, x8, lsl #3
 460727c: 8b0912ea     	add	x10, x23, x9, lsl #4
 4607280: eb0a02df     	cmp	x22, x10
 4607284: 54001d00     	b.eq	0x4607624 <_ChromeMain+0x4602388>
 4607288: d37ced29     	lsl	x9, x9, #4
 460728c: cb1702ca     	sub	x10, x22, x23
 4607290: 9102414a     	add	x10, x10, #0x90
 4607294: eb09015f     	cmp	x10, x9
 4607298: 540000e0     	b.eq	0x46072b4 <_ChromeMain+0x4602018>
 460729c: f90007f9     	str	x25, [sp, #0x8]
 46072a0: cb1703f8     	neg	x24, x23
 46072a4: 8b1602fc     	add	x28, x23, x22
 46072a8: cb160128     	sub	x8, x9, x22
 46072ac: d1024119     	sub	x25, x8, #0x90
 46072b0: 14000012     	b	0x46072f8 <_ChromeMain+0x460205c>
 46072b4: aa1603fc     	mov	x28, x22
 46072b8: 1400001e     	b	0x4607330 <_ChromeMain+0x4602094>
 46072bc: f8478360     	ldur	x0, [x27, #0x78]
 46072c0: f9404768     	ldr	x8, [x27, #0x88]
 46072c4: d37ff901     	lsl	x1, x8, #1
 46072c8: 96e806fc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46072cc: 91042368     	add	x8, x27, #0x108
 46072d0: f9408f69     	ldr	x9, [x27, #0x118]
 46072d4: f8088369     	stur	x9, [x27, #0x88]
 46072d8: 3dc00100     	ldr	q0, [x8]
 46072dc: 3c878360     	stur	q0, [x27, #0x78]
 46072e0: 39047f7f     	strb	wzr, [x27, #0x11f]
 46072e4: 7902137f     	strh	wzr, [x27, #0x108]
 46072e8: 9102439c     	add	x28, x28, #0x90
 46072ec: d1024339     	sub	x25, x25, #0x90
 46072f0: eb19031f     	cmp	x24, x25
 46072f4: 54000100     	b.eq	0x4607314 <_ChromeMain+0x4602078>
 46072f8: 8b18039b     	add	x27, x28, x24
 46072fc: 8b180380     	add	x0, x28, x24
 4607300: 91024361     	add	x1, x27, #0x90
 4607304: 96ffc9f7     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4607308: 39c23f68     	ldrsb	w8, [x27, #0x8f]
 460730c: 37fffd88     	tbnz	w8, #0x1f, 0x46072bc <_ChromeMain+0x4602020>
 4607310: 17ffffef     	b	0x46072cc <_ChromeMain+0x4602030>
 4607314: cb17039c     	sub	x28, x28, x23
 4607318: a978a3b7     	ldp	x23, x8, [x29, #-0x78]
 460731c: d291c73b     	mov	x27, #0x8e39            ; =36409
 4607320: f2a71c7b     	movk	x27, #0x38e3, lsl #16
 4607324: f2dc71db     	movk	x27, #0xe38e, lsl #32
 4607328: f2f1c71b     	movk	x27, #0x8e38, lsl #48
 460732c: f94007f9     	ldr	x25, [sp, #0x8]
 4607330: 52801209     	mov	w9, #0x90               ; =144
 4607334: 9b095d09     	madd	x9, x8, x9, x23
 4607338: eb09039f     	cmp	x28, x9
 460733c: 54000a20     	b.eq	0x4607480 <_ChromeMain+0x46021e4>
 4607340: 52801209     	mov	w9, #0x90               ; =144
 4607344: 9b095d08     	madd	x8, x8, x9, x23
 4607348: d1008117     	sub	x23, x8, #0x20
 460734c: 14000013     	b	0x4607398 <_ChromeMain+0x46020fc>
 4607350: f94006e0     	ldr	x0, [x23, #0x8]
 4607354: f9400ee8     	ldr	x8, [x23, #0x18]
 4607358: d37ff901     	lsl	x1, x8, #1
 460735c: 96e806d7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607360: aa1703e0     	mov	x0, x23
 4607364: d2800001     	mov	x1, #0x0                ; =0
 4607368: 96e88254     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460736c: d10142e0     	sub	x0, x23, #0x50
 4607370: 96e88242     	bl	0x27c78 <_ChromeMain+0x229dc>
 4607374: 38da72e8     	ldursb	w8, [x23, #-0x59]
 4607378: 36f800a8     	tbz	w8, #0x1f, 0x460738c <_ChromeMain+0x46020f0>
 460737c: f85902e0     	ldur	x0, [x23, #-0x70]
 4607380: f85a02e8     	ldur	x8, [x23, #-0x60]
 4607384: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4607388: 96e806cc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460738c: d10242f7     	sub	x23, x23, #0x90
 4607390: eb1c031f     	cmp	x24, x28
 4607394: 54000740     	b.eq	0x460747c <_ChromeMain+0x46021e0>
 4607398: f101c2f8     	subs	x24, x23, #0x70
 460739c: 54001440     	b.eq	0x4607624 <_ChromeMain+0x4602388>
 46073a0: 39c07ee8     	ldrsb	w8, [x23, #0x1f]
 46073a4: 36fffde8     	tbz	w8, #0x1f, 0x4607360 <_ChromeMain+0x46020c4>
 46073a8: 17ffffea     	b	0x4607350 <_ChromeMain+0x46020b4>
 46073ac: a9400aa1     	ldp	x1, x2, [x21]
 46073b0: 910043e0     	add	x0, sp, #0x10
 46073b4: 96e8fe07     	bl	0x46bd0 <_ChromeMain+0x41934>
 46073b8: 14000009     	b	0x46073dc <_ChromeMain+0x4602140>
 46073bc: 52801208     	mov	w8, #0x90               ; =144
 46073c0: 9b086b36     	madd	x22, x25, x8, x26
 46073c4: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 46073c8: 37ffff28     	tbnz	w8, #0x1f, 0x46073ac <_ChromeMain+0x4602110>
 46073cc: 3dc002a0     	ldr	q0, [x21]
 46073d0: 3d8007e0     	str	q0, [sp, #0x10]
 46073d4: f9400aa8     	ldr	x8, [x21, #0x10]
 46073d8: f90013e8     	str	x8, [sp, #0x20]
 46073dc: 9100c3f5     	add	x21, sp, #0x30
 46073e0: 9100c3e0     	add	x0, sp, #0x30
 46073e4: aa1303e1     	mov	x1, x19
 46073e8: 96eccaeb     	bl	0x139f94 <_ChromeMain+0x134cf8>
 46073ec: 3dc007e0     	ldr	q0, [sp, #0x10]
 46073f0: 3c8782e0     	stur	q0, [x23, #0x78]
 46073f4: f94013e8     	ldr	x8, [sp, #0x20]
 46073f8: f9005fe8     	str	x8, [sp, #0xb8]
 46073fc: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4607400: f9000bff     	str	xzr, [sp, #0x10]
 4607404: d101e3a0     	sub	x0, x29, #0x78
 4607408: 9100c3e2     	add	x2, sp, #0x30
 460740c: aa1603e1     	mov	x1, x22
 4607410: 94000a50     	bl	0x4609d50 <_ChromeMain+0x4604ab4>
 4607414: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 4607418: 36f800a8     	tbz	w8, #0x1f, 0x460742c <_ChromeMain+0x4602190>
 460741c: f94057e0     	ldr	x0, [sp, #0xa8]
 4607420: f9405fe8     	ldr	x8, [sp, #0xb8]
 4607424: d37ff901     	lsl	x1, x8, #1
 4607428: 96e806a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460742c: 9101c2a0     	add	x0, x21, #0x70
 4607430: d2800001     	mov	x1, #0x0                ; =0
 4607434: 96e88221     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4607438: 910082a0     	add	x0, x21, #0x20
 460743c: 96e8820f     	bl	0x27c78 <_ChromeMain+0x229dc>
 4607440: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4607444: 36f800a8     	tbz	w8, #0x1f, 0x4607458 <_ChromeMain+0x46021bc>
 4607448: f9401be0     	ldr	x0, [sp, #0x30]
 460744c: f94023e8     	ldr	x8, [sp, #0x40]
 4607450: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4607454: 96e80699     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607458: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 460745c: 36f80708     	tbz	w8, #0x1f, 0x460753c <_ChromeMain+0x46022a0>
 4607460: f9400be0     	ldr	x0, [sp, #0x10]
 4607464: f94013e8     	ldr	x8, [sp, #0x20]
 4607468: d37ff901     	lsl	x1, x8, #1
 460746c: 14000033     	b	0x4607538 <_ChromeMain+0x460229c>
 4607470: f94006a9     	ldr	x9, [x21, #0x8]
 4607474: b4000349     	cbz	x9, 0x46074dc <_ChromeMain+0x4602240>
 4607478: 14000011     	b	0x46074bc <_ChromeMain+0x4602220>
 460747c: f85883b7     	ldur	x23, [x29, #-0x78]
 4607480: cb1a02c8     	sub	x8, x22, x26
 4607484: 9344fd08     	asr	x8, x8, #4
 4607488: 9b1b7d08     	mul	x8, x8, x27
 460748c: cb170389     	sub	x9, x28, x23
 4607490: 9344fd29     	asr	x9, x9, #4
 4607494: 9b1b7d29     	mul	x9, x9, x27
 4607498: f81903a9     	stur	x9, [x29, #-0x70]
 460749c: eb19011f     	cmp	x8, x25
 46074a0: da1f0328     	sbc	x8, x25, xzr
 46074a4: eb08013f     	cmp	x9, x8
 46074a8: 9a883136     	csel	x22, x9, x8, lo
 46074ac: 39805ea8     	ldrsb	x8, [x21, #0x17]
 46074b0: b7fffe08     	tbnz	x8, #0x3f, 0x4607470 <_ChromeMain+0x46021d4>
 46074b4: aa0803e9     	mov	x9, x8
 46074b8: b4000129     	cbz	x9, 0x46074dc <_ChromeMain+0x4602240>
 46074bc: 39c2ffe9     	ldrsb	w9, [sp, #0xbf]
 46074c0: 37f80b49     	tbnz	w9, #0x1f, 0x4607628 <_ChromeMain+0x460238c>
 46074c4: 37f80708     	tbnz	w8, #0x1f, 0x46075a4 <_ChromeMain+0x4602308>
 46074c8: 3dc002a0     	ldr	q0, [x21]
 46074cc: 9100c3e9     	add	x9, sp, #0x30
 46074d0: 3c878120     	stur	q0, [x9, #0x78]
 46074d4: f9400aa8     	ldr	x8, [x21, #0x10]
 46074d8: f8088128     	stur	x8, [x9, #0x88]
 46074dc: f85883a8     	ldur	x8, [x29, #-0x78]
 46074e0: 52801209     	mov	w9, #0x90               ; =144
 46074e4: 9b0922c1     	madd	x1, x22, x9, x8
 46074e8: 9100c3f5     	add	x21, sp, #0x30
 46074ec: d101e3a0     	sub	x0, x29, #0x78
 46074f0: 9100c3e2     	add	x2, sp, #0x30
 46074f4: 94000a17     	bl	0x4609d50 <_ChromeMain+0x4604ab4>
 46074f8: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 46074fc: 36f800a8     	tbz	w8, #0x1f, 0x4607510 <_ChromeMain+0x4602274>
 4607500: f94057e0     	ldr	x0, [sp, #0xa8]
 4607504: f9405fe8     	ldr	x8, [sp, #0xb8]
 4607508: d37ff901     	lsl	x1, x8, #1
 460750c: 96e8066b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607510: 9101c2a0     	add	x0, x21, #0x70
 4607514: d2800001     	mov	x1, #0x0                ; =0
 4607518: 96e881e8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 460751c: 910082a0     	add	x0, x21, #0x20
 4607520: 96e881d6     	bl	0x27c78 <_ChromeMain+0x229dc>
 4607524: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4607528: 36f800a8     	tbz	w8, #0x1f, 0x460753c <_ChromeMain+0x46022a0>
 460752c: f9401be0     	ldr	x0, [sp, #0x30]
 4607530: f94023e8     	ldr	x8, [sp, #0x40]
 4607534: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4607538: 96e80660     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460753c: f941a288     	ldr	x8, [x20, #0x340]
 4607540: f9403500     	ldr	x0, [x8, #0x68]
 4607544: d101e3a1     	sub	x1, x29, #0x78
 4607548: 97ef3537     	bl	0x41d4a24 <_ChromeMain+0x41cf788>
 460754c: aa1403e0     	mov	x0, x20
 4607550: d2800001     	mov	x1, #0x0                ; =0
 4607554: d2800002     	mov	x2, #0x0                ; =0
 4607558: 97fffd72     	bl	0x4606b20 <_ChromeMain+0x4601884>
 460755c: aa1403e0     	mov	x0, x20
 4607560: 97fff721     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 4607564: f941a288     	ldr	x8, [x20, #0x340]
 4607568: f9403500     	ldr	x0, [x8, #0x68]
 460756c: aa1303e1     	mov	x1, x19
 4607570: 97ef372f     	bl	0x41d522c <_ChromeMain+0x41cff90>
 4607574: aa0003f6     	mov	x22, x0
 4607578: f85883b3     	ldur	x19, [x29, #-0x78]
 460757c: b4ffdf73     	cbz	x19, 0x4607168 <_ChromeMain+0x4601ecc>
 4607580: f85903a8     	ldur	x8, [x29, #-0x70]
 4607584: 8b080d08     	add	x8, x8, x8, lsl #3
 4607588: d37ced14     	lsl	x20, x8, #4
 460758c: b4000094     	cbz	x20, 0x460759c <_ChromeMain+0x4602300>
 4607590: d2800015     	mov	x21, #0x0               ; =0
 4607594: aa1303f7     	mov	x23, x19
 4607598: 1400001d     	b	0x460760c <_ChromeMain+0x4602370>
 460759c: aa1303e0     	mov	x0, x19
 46075a0: 17fffefc     	b	0x4607190 <_ChromeMain+0x4601ef4>
 46075a4: a9400aa1     	ldp	x1, x2, [x21]
 46075a8: 9100c3e8     	add	x8, sp, #0x30
 46075ac: 9101e100     	add	x0, x8, #0x78
 46075b0: 970b1c4f     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 46075b4: 17ffffca     	b	0x46074dc <_ChromeMain+0x4602240>
 46075b8: 8b1402e8     	add	x8, x23, x20
 46075bc: f85e8100     	ldur	x0, [x8, #-0x18]
 46075c0: f85f8108     	ldur	x8, [x8, #-0x8]
 46075c4: d37ff901     	lsl	x1, x8, #1
 46075c8: 96e8063c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46075cc: 8b1402f9     	add	x25, x23, x20
 46075d0: d1008320     	sub	x0, x25, #0x20
 46075d4: d2800001     	mov	x1, #0x0                ; =0
 46075d8: 96e881b8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46075dc: d101c320     	sub	x0, x25, #0x70
 46075e0: 96e881a6     	bl	0x27c78 <_ChromeMain+0x229dc>
 46075e4: 38d87328     	ldursb	w8, [x25, #-0x79]
 46075e8: 36f800a8     	tbz	w8, #0x1f, 0x46075fc <_ChromeMain+0x4602360>
 46075ec: f9400300     	ldr	x0, [x24]
 46075f0: f8580328     	ldur	x8, [x25, #-0x80]
 46075f4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46075f8: 96e80630     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46075fc: d10242f7     	sub	x23, x23, #0x90
 4607600: 910242b5     	add	x21, x21, #0x90
 4607604: eb15029f     	cmp	x20, x21
 4607608: 54ffdc20     	b.eq	0x460718c <_ChromeMain+0x4601ef0>
 460760c: 8b1402e8     	add	x8, x23, x20
 4607610: f1024118     	subs	x24, x8, #0x90
 4607614: 54000080     	b.eq	0x4607624 <_ChromeMain+0x4602388>
 4607618: 38dff108     	ldursb	w8, [x8, #-0x1]
 460761c: 36fffd88     	tbz	w8, #0x1f, 0x46075cc <_ChromeMain+0x4602330>
 4607620: 17ffffe6     	b	0x46075b8 <_ChromeMain+0x460231c>
 4607624: d4200020     	brk	#0x1
 4607628: 7100011f     	cmp	w8, #0x0
 460762c: a9402aa9     	ldp	x9, x10, [x21]
 4607630: 9a954121     	csel	x1, x9, x21, mi
 4607634: 9a884142     	csel	x2, x10, x8, mi
 4607638: 9100c3e8     	add	x8, sp, #0x30
 460763c: 9101e100     	add	x0, x8, #0x78
 4607640: 970b1c7d     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4607644: 17ffffa6     	b	0x46074dc <_ChromeMain+0x4602240>
