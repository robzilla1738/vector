
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4276580: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4276584: a90167fa     	stp	x26, x25, [sp, #0x10]
 4276588: a9025ff8     	stp	x24, x23, [sp, #0x20]
 427658c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4276590: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4276594: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4276598: 910143fd     	add	x29, sp, #0x50
 427659c: d10883ff     	sub	sp, sp, #0x220
 42765a0: aa0803f3     	mov	x19, x8
 42765a4: 3940c008     	ldrb	w8, [x0, #0x30]
 42765a8: 360077e8     	tbz	w8, #0x0, 0x42774a4 <_ChromeMain+0x4272208>
 42765ac: aa0003f4     	mov	x20, x0
 42765b0: 910303fb     	add	x27, sp, #0xc0
 42765b4: f9401008     	ldr	x8, [x0, #0x20]
 42765b8: b40000a8     	cbz	x8, 0x42765cc <_ChromeMain+0x4271330>
 42765bc: f9400e88     	ldr	x8, [x20, #0x18]
 42765c0: 39406108     	ldrb	w8, [x8, #0x18]
 42765c4: 7100191f     	cmp	w8, #0x6
 42765c8: 540005a0     	b.eq	0x427667c <_ChromeMain+0x42713e0>
 42765cc: 528002c8     	mov	w8, #0x16               ; =22
 42765d0: 381173a8     	sturb	w8, [x29, #-0xe9]
 42765d4: d10403a9     	sub	x9, x29, #0x100
 42765d8: 9100592a     	add	x10, x9, #0x16
 42765dc: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42765e0: 910d1d08     	add	x8, x8, #0x347
 42765e4: eb08015f     	cmp	x10, x8
 42765e8: fa488122     	ccmp	x9, x8, #0x2, hi
 42765ec: 540075c9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 42765f0: 3dc00100     	ldr	q0, [x8]
 42765f4: 3d802f60     	str	q0, [x27, #0xb0]
 42765f8: f840e108     	ldur	x8, [x8, #0xe]
 42765fc: f80be368     	stur	x8, [x27, #0xbe]
 4276600: 381163bf     	sturb	wzr, [x29, #-0xea]
 4276604: d10403a1     	sub	x1, x29, #0x100
 4276608: aa1303e8     	mov	x8, x19
 427660c: aa1403e0     	mov	x0, x20
 4276610: 94a80350     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276614: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276618: 91397108     	add	x8, x8, #0xe5c
 427661c: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276620: f9002374     	str	x20, [x27, #0x40]
 4276624: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276628: 91120000     	add	x0, x0, #0x480
 427662c: d10303a1     	sub	x1, x29, #0xc0
 4276630: 910403e2     	add	x2, sp, #0x100
 4276634: 94a80969     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276638: f9000660     	str	x0, [x19, #0x8]
 427663c: 52800028     	mov	w8, #0x1                ; =1
 4276640: 39004268     	strb	w8, [x19, #0x10]
 4276644: 38d173a8     	ldursb	w8, [x29, #-0xe9]
 4276648: 36f800a8     	tbz	w8, #0x1f, 0x427665c <_ChromeMain+0x42713c0>
 427664c: f9405b60     	ldr	x0, [x27, #0xb0]
 4276650: f9406368     	ldr	x8, [x27, #0xc0]
 4276654: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276658: 96f64a18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427665c: 910883ff     	add	sp, sp, #0x220
 4276660: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4276664: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4276668: a94357f6     	ldp	x22, x21, [sp, #0x30]
 427666c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4276670: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4276674: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4276678: d65f03c0     	ret
 427667c: f940ea80     	ldr	x0, [x20, #0x1d0]
 4276680: b5000060     	cbnz	x0, 0x427668c <_ChromeMain+0x42713f0>
 4276684: f940e680     	ldr	x0, [x20, #0x1c8]
 4276688: b40000a0     	cbz	x0, 0x427669c <_ChromeMain+0x4271400>
 427668c: f9400008     	ldr	x8, [x0]
 4276690: f940a508     	ldr	x8, [x8, #0x148]
 4276694: d63f0100     	blr	x8
 4276698: b5000520     	cbnz	x0, 0x427673c <_ChromeMain+0x42714a0>
 427669c: 52800400     	mov	w0, #0x20               ; =32
 42766a0: 96f66332     	bl	0xf368 <_ChromeMain+0xa0cc>
 42766a4: f9004f60     	str	x0, [x27, #0x98]
 42766a8: b004e628     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 42766ac: 3dc0f100     	ldr	q0, [x8, #0x3c0]
 42766b0: 3c8a0360     	stur	q0, [x27, #0xa0]
 42766b4: 91006c09     	add	x9, x0, #0x1b
 42766b8: eb00013f     	cmp	x9, x0
 42766bc: 54006f43     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 42766c0: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42766c4: 910d7908     	add	x8, x8, #0x35e
 42766c8: eb08013f     	cmp	x9, x8
 42766cc: fa488002     	ccmp	x0, x8, #0x2, hi
 42766d0: 54006ea9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 42766d4: 3dc00100     	ldr	q0, [x8]
 42766d8: 3d800000     	str	q0, [x0]
 42766dc: 3cc0b100     	ldur	q0, [x8, #0xb]
 42766e0: 3c80b000     	stur	q0, [x0, #0xb]
 42766e4: 39006c1f     	strb	wzr, [x0, #0x1b]
 42766e8: 910563e1     	add	x1, sp, #0x158
 42766ec: aa1303e8     	mov	x8, x19
 42766f0: aa1403e0     	mov	x0, x20
 42766f4: 94a80317     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 42766f8: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 42766fc: 91397108     	add	x8, x8, #0xe5c
 4276700: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276704: f9002374     	str	x20, [x27, #0x40]
 4276708: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 427670c: 91120000     	add	x0, x0, #0x480
 4276710: d10303a1     	sub	x1, x29, #0xc0
 4276714: 910403e2     	add	x2, sp, #0x100
 4276718: 94a80930     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 427671c: f9000660     	str	x0, [x19, #0x8]
 4276720: 52800028     	mov	w8, #0x1                ; =1
 4276724: 39004268     	strb	w8, [x19, #0x10]
 4276728: 39c5bfe8     	ldrsb	w8, [sp, #0x16f]
 427672c: 36fff988     	tbz	w8, #0x1f, 0x427665c <_ChromeMain+0x42713c0>
 4276730: f9404f60     	ldr	x0, [x27, #0x98]
 4276734: f9405768     	ldr	x8, [x27, #0xa8]
 4276738: 17ffffc7     	b	0x4276654 <_ChromeMain+0x42713b8>
 427673c: 3940c288     	ldrb	w8, [x20, #0x30]
 4276740: 36006b28     	tbz	w8, #0x0, 0x42774a4 <_ChromeMain+0x4272208>
 4276744: f9401288     	ldr	x8, [x20, #0x20]
 4276748: b4009528     	cbz	x8, 0x42779ec <_ChromeMain+0x4272750>
 427674c: f9400e95     	ldr	x21, [x20, #0x18]
 4276750: 394062a8     	ldrb	w8, [x21, #0x18]
 4276754: 7100191f     	cmp	w8, #0x6
 4276758: 54009501     	b.ne	0x42779f8 <_ChromeMain+0x427275c>
 427675c: 9004bcc1     	adrp	x1, 0xda0e000 <dyld_stub_binder+0xda0e000>
 4276760: 911cd021     	add	x1, x1, #0x734
 4276764: aa1503e0     	mov	x0, x21
 4276768: 52800102     	mov	w2, #0x8                ; =8
 427676c: 9776ccc5     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4276770: b4000140     	cbz	x0, 0x4276798 <_ChromeMain+0x42714fc>
 4276774: aa0003f6     	mov	x22, x0
 4276778: 39805c17     	ldrsb	x23, [x0, #0x17]
 427677c: b7f800b7     	tbnz	x23, #0x3f, 0x4276790 <_ChromeMain+0x42714f4>
 4276780: 340000d7     	cbz	w23, 0x4276798 <_ChromeMain+0x42714fc>
 4276784: a906ff7f     	stp	xzr, xzr, [x27, #0x68]
 4276788: f9003f7f     	str	xzr, [x27, #0x78]
 427678c: 14000029     	b	0x4276830 <_ChromeMain+0x4271594>
 4276790: f94006d7     	ldr	x23, [x22, #0x8]
 4276794: b5000497     	cbnz	x23, 0x4276824 <_ChromeMain+0x4271588>
 4276798: 528002a8     	mov	w8, #0x15               ; =21
 427679c: 39055fe8     	strb	w8, [sp, #0x157]
 42767a0: 910503e9     	add	x9, sp, #0x140
 42767a4: 9100552a     	add	x10, x9, #0x15
 42767a8: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 42767ac: 910bed08     	add	x8, x8, #0x2fb
 42767b0: eb08015f     	cmp	x10, x8
 42767b4: fa488122     	ccmp	x9, x8, #0x2, hi
 42767b8: 54006769     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 42767bc: 3dc00100     	ldr	q0, [x8]
 42767c0: 3d802360     	str	q0, [x27, #0x80]
 42767c4: f840d108     	ldur	x8, [x8, #0xd]
 42767c8: f808d368     	stur	x8, [x27, #0x8d]
 42767cc: 390557ff     	strb	wzr, [sp, #0x155]
 42767d0: 910503e1     	add	x1, sp, #0x140
 42767d4: aa1303e8     	mov	x8, x19
 42767d8: aa1403e0     	mov	x0, x20
 42767dc: 94a802dd     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 42767e0: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 42767e4: 91397108     	add	x8, x8, #0xe5c
 42767e8: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 42767ec: f9002374     	str	x20, [x27, #0x40]
 42767f0: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 42767f4: 91120000     	add	x0, x0, #0x480
 42767f8: d10303a1     	sub	x1, x29, #0xc0
 42767fc: 910403e2     	add	x2, sp, #0x100
 4276800: 94a808f6     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276804: f9000660     	str	x0, [x19, #0x8]
 4276808: 52800028     	mov	w8, #0x1                ; =1
 427680c: 39004268     	strb	w8, [x19, #0x10]
 4276810: 39c55fe8     	ldrsb	w8, [sp, #0x157]
 4276814: 36fff248     	tbz	w8, #0x1f, 0x427665c <_ChromeMain+0x42713c0>
 4276818: f9404360     	ldr	x0, [x27, #0x80]
 427681c: f9404b68     	ldr	x8, [x27, #0x90]
 4276820: 17ffff8d     	b	0x4276654 <_ChromeMain+0x42713b8>
 4276824: a906ff7f     	stp	xzr, xzr, [x27, #0x68]
 4276828: f9003f7f     	str	xzr, [x27, #0x78]
 427682c: f94002d6     	ldr	x22, [x22]
 4276830: f10016ff     	cmp	x23, #0x5
 4276834: 540002e1     	b.ne	0x4276890 <_ChromeMain+0x42715f4>
 4276838: b94002c8     	ldr	w8, [x22]
 427683c: 394012c9     	ldrb	w9, [x22, #0x4]
 4276840: 7101cd3f     	cmp	w9, #0x73
 4276844: 528e8c29     	mov	w9, #0x7461             ; =29793
 4276848: 72ac2d89     	movk	w9, #0x616c, lsl #16
 427684c: 7a490100     	ccmp	w8, w9, #0x0, eq
 4276850: 540003e1     	b.ne	0x42768cc <_ChromeMain+0x4271630>
 4276854: 528001a8     	mov	w8, #0xd                ; =13
 4276858: 3904ffe8     	strb	w8, [sp, #0x13f]
 427685c: 9104a3e9     	add	x9, sp, #0x128
 4276860: 9100352a     	add	x10, x9, #0xd
 4276864: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276868: 910fd508     	add	x8, x8, #0x3f5
 427686c: eb08015f     	cmp	x10, x8
 4276870: fa488122     	ccmp	x9, x8, #0x2, hi
 4276874: 54006189     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276878: f9400109     	ldr	x9, [x8]
 427687c: f9003769     	str	x9, [x27, #0x68]
 4276880: f8405108     	ldur	x8, [x8, #0x5]
 4276884: f806d368     	stur	x8, [x27, #0x6d]
 4276888: 3904d7ff     	strb	wzr, [sp, #0x135]
 427688c: 1400001e     	b	0x4276904 <_ChromeMain+0x4271668>
 4276890: 92800228     	mov	x8, #-0x12              ; =-18
 4276894: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4276898: eb0802ff     	cmp	x23, x8
 427689c: 54001c28     	b.hi	0x4276c20 <_ChromeMain+0x4271984>
 42768a0: f1005aff     	cmp	x23, #0x16
 42768a4: 54000149     	b.ls	0x42768cc <_ChromeMain+0x4271630>
 42768a8: 927ceaf9     	and	x25, x23, #0x7ffffffffffffff0
 42768ac: 91004320     	add	x0, x25, #0x10
 42768b0: 96f662ae     	bl	0xf368 <_ChromeMain+0xa0cc>
 42768b4: aa0003f8     	mov	x24, x0
 42768b8: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 42768bc: cb080328     	sub	x8, x25, x8
 42768c0: a906df60     	stp	x0, x23, [x27, #0x68]
 42768c4: f9003f68     	str	x8, [x27, #0x78]
 42768c8: 14000003     	b	0x42768d4 <_ChromeMain+0x4271638>
 42768cc: 3904fff7     	strb	w23, [sp, #0x13f]
 42768d0: 9104a3f8     	add	x24, sp, #0x128
 42768d4: 8b170308     	add	x8, x24, x23
 42768d8: eb18011f     	cmp	x8, x24
 42768dc: 54005e43     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 42768e0: eb16031f     	cmp	x24, x22
 42768e4: 54000068     	b.hi	0x42768f0 <_ChromeMain+0x4271654>
 42768e8: eb16011f     	cmp	x8, x22
 42768ec: 54005dc8     	b.hi	0x42774a4 <_ChromeMain+0x4272208>
 42768f0: aa1803e0     	mov	x0, x24
 42768f4: aa1603e1     	mov	x1, x22
 42768f8: aa1703e2     	mov	x2, x23
 42768fc: 94f66274     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4276900: 38376b1f     	strb	wzr, [x24, x23]
 4276904: 6f00e400     	movi.2d	v0, #0000000000000000
 4276908: ad020360     	stp	q0, q0, [x27, #0x40]
 427690c: b004c561     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4276910: 910fbc21     	add	x1, x1, #0x3ef
 4276914: aa1503e0     	mov	x0, x21
 4276918: 528001e2     	mov	w2, #0xf                ; =15
 427691c: 9776cc59     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4276920: b4000200     	cbz	x0, 0x4276960 <_ChromeMain+0x42716c4>
 4276924: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4276928: 37f800e8     	tbnz	w8, #0x1f, 0x4276944 <_ChromeMain+0x42716a8>
 427692c: 340001a8     	cbz	w8, 0x4276960 <_ChromeMain+0x42716c4>
 4276930: 3dc00000     	ldr	q0, [x0]
 4276934: f9400808     	ldr	x8, [x0, #0x10]
 4276938: f9002b68     	str	x8, [x27, #0x50]
 427693c: 3d801360     	str	q0, [x27, #0x40]
 4276940: 14000006     	b	0x4276958 <_ChromeMain+0x42716bc>
 4276944: f9400402     	ldr	x2, [x0, #0x8]
 4276948: b40000c2     	cbz	x2, 0x4276960 <_ChromeMain+0x42716c4>
 427694c: f9400001     	ldr	x1, [x0]
 4276950: 910403e0     	add	x0, sp, #0x100
 4276954: 96f68631     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276958: 52800028     	mov	w8, #0x1                ; =1
 427695c: 14000003     	b	0x4276968 <_ChromeMain+0x42716cc>
 4276960: 52800008     	mov	w8, #0x0                ; =0
 4276964: 390403ff     	strb	wzr, [sp, #0x100]
 4276968: d10283ba     	sub	x26, x29, #0xa0
 427696c: 390463e8     	strb	w8, [sp, #0x118]
 4276970: 900464a1     	adrp	x1, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276974: 910de821     	add	x1, x1, #0x37a
 4276978: aa1503e0     	mov	x0, x21
 427697c: 52800122     	mov	w2, #0x9                ; =9
 4276980: 9733a810     	bl	0xf609c0 <_ChromeMain+0xf5b724>
 4276984: b4000880     	cbz	x0, 0x4276a94 <_ChromeMain+0x42717f8>
 4276988: 39406008     	ldrb	w8, [x0, #0x18]
 427698c: 71001d1f     	cmp	w8, #0x7
 4276990: 54001ec1     	b.ne	0x4276d68 <_ChromeMain+0x4271acc>
 4276994: f9400408     	ldr	x8, [x0, #0x8]
 4276998: f100051f     	cmp	x8, #0x1
 427699c: 54000361     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769a0: f9400008     	ldr	x8, [x0]
 42769a4: 39406109     	ldrb	w9, [x8, #0x18]
 42769a8: 7100113f     	cmp	w9, #0x4
 42769ac: 540002e1     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769b0: 39405d0a     	ldrb	w10, [x8, #0x17]
 42769b4: 13001d49     	sxtb	w9, w10
 42769b8: f940050b     	ldr	x11, [x8, #0x8]
 42769bc: 7100013f     	cmp	w9, #0x0
 42769c0: 9a8a416a     	csel	x10, x11, x10, mi
 42769c4: f100255f     	cmp	x10, #0x9
 42769c8: 54000201     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769cc: f940010a     	ldr	x10, [x8]
 42769d0: 7100013f     	cmp	w9, #0x0
 42769d4: 9a884148     	csel	x8, x10, x8, mi
 42769d8: f9400109     	ldr	x9, [x8]
 42769dc: 39402108     	ldrb	w8, [x8, #0x8]
 42769e0: 7101cd1f     	cmp	w8, #0x73
 42769e4: d28dec48     	mov	x8, #0x6f62             ; =28514
 42769e8: f2ad6de8     	movk	x8, #0x6b6f, lsl #16
 42769ec: f2cc2da8     	movk	x8, #0x616d, lsl #32
 42769f0: f2ed6e48     	movk	x8, #0x6b72, lsl #48
 42769f4: fa480120     	ccmp	x9, x8, #0x0, eq
 42769f8: 54000081     	b.ne	0x4276a08 <_ChromeMain+0x427176c>
 42769fc: 52800028     	mov	w8, #0x1                ; =1
 4276a00: b90033e8     	str	w8, [sp, #0x30]
 4276a04: 14000025     	b	0x4276a98 <_ChromeMain+0x42717fc>
 4276a08: 528002c8     	mov	w8, #0x16               ; =22
 4276a0c: 39035fe8     	strb	w8, [sp, #0xd7]
 4276a10: 910303e9     	add	x9, sp, #0xc0
 4276a14: 9100592a     	add	x10, x9, #0x16
 4276a18: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276a1c: 910d1d08     	add	x8, x8, #0x347
 4276a20: eb08015f     	cmp	x10, x8
 4276a24: fa488122     	ccmp	x9, x8, #0x2, hi
 4276a28: 540053e9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276a2c: 3dc00100     	ldr	q0, [x8]
 4276a30: 3d800360     	str	q0, [x27]
 4276a34: f840e108     	ldur	x8, [x8, #0xe]
 4276a38: f800e368     	stur	x8, [x27, #0xe]
 4276a3c: 39035bff     	strb	wzr, [sp, #0xd6]
 4276a40: 910303e1     	add	x1, sp, #0xc0
 4276a44: aa1303e8     	mov	x8, x19
 4276a48: aa1403e0     	mov	x0, x20
 4276a4c: 94a80241     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276a50: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276a54: 91397108     	add	x8, x8, #0xe5c
 4276a58: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276a5c: f9001354     	str	x20, [x26, #0x20]
 4276a60: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276a64: 91120000     	add	x0, x0, #0x480
 4276a68: d10303a1     	sub	x1, x29, #0xc0
 4276a6c: d10203a2     	sub	x2, x29, #0x80
 4276a70: 94a8085a     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276a74: f9000660     	str	x0, [x19, #0x8]
 4276a78: 52800028     	mov	w8, #0x1                ; =1
 4276a7c: 39004268     	strb	w8, [x19, #0x10]
 4276a80: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4276a84: 36f82b88     	tbz	w8, #0x1f, 0x4276ff4 <_ChromeMain+0x4271d58>
 4276a88: f9400360     	ldr	x0, [x27]
 4276a8c: f9400b68     	ldr	x8, [x27, #0x10]
 4276a90: 14000157     	b	0x4276fec <_ChromeMain+0x4271d50>
 4276a94: b90033ff     	str	wzr, [sp, #0x30]
 4276a98: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4276a9c: f9005bff     	str	xzr, [sp, #0xb0]
 4276aa0: d10303a8     	sub	x8, x29, #0xc0
 4276aa4: 97609818     	bl	0x1a9cb04 <_ChromeMain+0x1a97868>
 4276aa8: 38d573a8     	ldursb	w8, [x29, #-0xa9]
 4276aac: 36f80168     	tbz	w8, #0x1f, 0x4276ad8 <_ChromeMain+0x427183c>
 4276ab0: a94f0b61     	ldp	x1, x2, [x27, #0xf0]
 4276ab4: 910283e0     	add	x0, sp, #0xa0
 4276ab8: 96f685d8     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276abc: 38d573a8     	ldursb	w8, [x29, #-0xa9]
 4276ac0: 36f80148     	tbz	w8, #0x1f, 0x4276ae8 <_ChromeMain+0x427184c>
 4276ac4: f9407b60     	ldr	x0, [x27, #0xf0]
 4276ac8: f9408368     	ldr	x8, [x27, #0x100]
 4276acc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276ad0: 96f648fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276ad4: 14000005     	b	0x4276ae8 <_ChromeMain+0x427184c>
 4276ad8: 3dc03f60     	ldr	q0, [x27, #0xf0]
 4276adc: 3d802be0     	str	q0, [sp, #0xa0]
 4276ae0: f9408368     	ldr	x8, [x27, #0x100]
 4276ae4: f9005be8     	str	x8, [sp, #0xb0]
 4276ae8: 3944ffe8     	ldrb	w8, [sp, #0x13f]
 4276aec: 13001d1c     	sxtb	w28, w8
 4276af0: 7100039f     	cmp	w28, #0x0
 4276af4: a946db77     	ldp	x23, x22, [x27, #0x68]
 4276af8: 9a8842d8     	csel	x24, x22, x8, mi
 4276afc: 9104a3e8     	add	x8, sp, #0x128
 4276b00: 9a8842f9     	csel	x25, x23, x8, mi
 4276b04: f1001f1f     	cmp	x24, #0x7
 4276b08: 54000c80     	b.eq	0x4276c98 <_ChromeMain+0x42719fc>
 4276b0c: f1001b1f     	cmp	x24, #0x6
 4276b10: 540007c1     	b.ne	0x4276c08 <_ChromeMain+0x427196c>
 4276b14: b9400328     	ldr	w8, [x25]
 4276b18: 79400b29     	ldrh	w9, [x25, #0x4]
 4276b1c: 528c2e6a     	mov	w10, #0x6173            ; =24947
 4276b20: 72ac2cca     	movk	w10, #0x6166, lsl #16
 4276b24: 6b0a011f     	cmp	w8, w10
 4276b28: 528d2e48     	mov	w8, #0x6972             ; =26994
 4276b2c: 7a480120     	ccmp	w9, w8, #0x0, eq
 4276b30: 540017a1     	b.ne	0x4276e24 <_ChromeMain+0x4271b88>
 4276b34: b004c561     	adrp	x1, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4276b38: 91110421     	add	x1, x1, #0x441
 4276b3c: aa1503e0     	mov	x0, x21
 4276b40: 528001a2     	mov	w2, #0xd                ; =13
 4276b44: 971b9f3f     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4276b48: b4000100     	cbz	x0, 0x4276b68 <_ChromeMain+0x42718cc>
 4276b4c: b004abc1     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 4276b50: 91132821     	add	x1, x1, #0x4ca
 4276b54: 52800082     	mov	w2, #0x4                ; =4
 4276b58: 951620e2     	bl	0x87feee0 <_ChromeMain+0x87f9c44>
 4276b5c: b4000060     	cbz	x0, 0x4276b68 <_ChromeMain+0x42718cc>
 4276b60: f9400416     	ldr	x22, [x0, #0x8]
 4276b64: b5005f56     	cbnz	x22, 0x427774c <_ChromeMain+0x42724b0>
 4276b68: 52800600     	mov	w0, #0x30               ; =48
 4276b6c: 96f661ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4276b70: f90047e0     	str	x0, [sp, #0x88]
 4276b74: b004e628     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4276b78: 3dc14d00     	ldr	q0, [x8, #0x530]
 4276b7c: 3c8903e0     	stur	q0, [sp, #0x90]
 4276b80: 9100a409     	add	x9, x0, #0x29
 4276b84: eb00013f     	cmp	x9, x0
 4276b88: 540048e3     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4276b8c: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276b90: 910e2d08     	add	x8, x8, #0x38b
 4276b94: eb08013f     	cmp	x9, x8
 4276b98: fa488002     	ccmp	x0, x8, #0x2, hi
 4276b9c: 54004849     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276ba0: ad400500     	ldp	q0, q1, [x8]
 4276ba4: ad000400     	stp	q0, q1, [x0]
 4276ba8: 3cc19100     	ldur	q0, [x8, #0x19]
 4276bac: 3c819000     	stur	q0, [x0, #0x19]
 4276bb0: 3900a41f     	strb	wzr, [x0, #0x29]
 4276bb4: 910223e1     	add	x1, sp, #0x88
 4276bb8: aa1303e8     	mov	x8, x19
 4276bbc: aa1403e0     	mov	x0, x20
 4276bc0: 94a801e4     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276bc4: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276bc8: 91397108     	add	x8, x8, #0xe5c
 4276bcc: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276bd0: f9001354     	str	x20, [x26, #0x20]
 4276bd4: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276bd8: 91120000     	add	x0, x0, #0x480
 4276bdc: d10303a1     	sub	x1, x29, #0xc0
 4276be0: d10203a2     	sub	x2, x29, #0x80
 4276be4: 94a807fd     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276be8: f9000660     	str	x0, [x19, #0x8]
 4276bec: 52800028     	mov	w8, #0x1                ; =1
 4276bf0: 39004268     	strb	w8, [x19, #0x10]
 4276bf4: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 4276bf8: 36f81f28     	tbz	w8, #0x1f, 0x4276fdc <_ChromeMain+0x4271d40>
 4276bfc: f94047e0     	ldr	x0, [sp, #0x88]
 4276c00: f9404fe8     	ldr	x8, [sp, #0x98]
 4276c04: 140000f4     	b	0x4276fd4 <_ChromeMain+0x4271d38>
 4276c08: f100371f     	cmp	x24, #0xd
 4276c0c: 540000c0     	b.eq	0x4276c24 <_ChromeMain+0x4271988>
 4276c10: 92800228     	mov	x8, #-0x12              ; =-18
 4276c14: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4276c18: eb08031f     	cmp	x24, x8
 4276c1c: 54000ec9     	b.ls	0x4276df4 <_ChromeMain+0x4271b58>
 4276c20: 942625db     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 4276c24: f9400328     	ldr	x8, [x25]
 4276c28: f8405329     	ldur	x9, [x25, #0x5]
 4276c2c: d28d0c6a     	mov	x10, #0x6863            ; =26723
 4276c30: f2ae8c2a     	movk	x10, #0x7461, lsl #16
 4276c34: f2ce0cea     	movk	x10, #0x7067, lsl #32
 4276c38: f2e5ae8a     	movk	x10, #0x2d74, lsl #48
 4276c3c: eb0a011f     	cmp	x8, x10
 4276c40: d28e8e08     	mov	x8, #0x7470             ; =29808
 4276c44: f2ac25a8     	movk	x8, #0x612d, lsl #16
 4276c48: f2cd8e88     	movk	x8, #0x6c74, lsl #32
 4276c4c: f2ee6c28     	movk	x8, #0x7361, lsl #48
 4276c50: fa480120     	ccmp	x9, x8, #0x0, eq
 4276c54: 54000e81     	b.ne	0x4276e24 <_ChromeMain+0x4271b88>
 4276c58: 528000a8     	mov	w8, #0x5                ; =5
 4276c5c: 381573a8     	sturb	w8, [x29, #-0xa9]
 4276c60: d10303a9     	sub	x9, x29, #0xc0
 4276c64: aa080128     	orr	x8, x9, x8
 4276c68: 900464aa     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276c6c: 91100d4a     	add	x10, x10, #0x403
 4276c70: eb0a011f     	cmp	x8, x10
 4276c74: fa4a8122     	ccmp	x9, x10, #0x2, hi
 4276c78: 54004169     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276c7c: 528e8c28     	mov	w8, #0x7461             ; =29793
 4276c80: 72ac2d88     	movk	w8, #0x616c, lsl #16
 4276c84: b900f368     	str	w8, [x27, #0xf0]
 4276c88: 52800e68     	mov	w8, #0x73               ; =115
 4276c8c: 7901eb68     	strh	w8, [x27, #0xf4]
 4276c90: 528000b8     	mov	w24, #0x5               ; =5
 4276c94: 14000073     	b	0x4276e60 <_ChromeMain+0x4271bc4>
 4276c98: b9400328     	ldr	w8, [x25]
 4276c9c: b8403329     	ldur	w9, [x25, #0x3]
 4276ca0: 528d2cca     	mov	w10, #0x6966            ; =26982
 4276ca4: 72acae4a     	movk	w10, #0x6572, lsl #16
 4276ca8: 6b0a011f     	cmp	w8, w10
 4276cac: 528ccca8     	mov	w8, #0x6665             ; =26213
 4276cb0: 72af0de8     	movk	w8, #0x786f, lsl #16
 4276cb4: 7a480120     	ccmp	w9, w8, #0x0, eq
 4276cb8: 54000b61     	b.ne	0x4276e24 <_ChromeMain+0x4271b88>
 4276cbc: f940f280     	ldr	x0, [x20, #0x1e0]
 4276cc0: b4000060     	cbz	x0, 0x4276ccc <_ChromeMain+0x4271a30>
 4276cc4: 9707eb5b     	bl	0x471a30 <_ChromeMain+0x46c794>
 4276cc8: b5003f00     	cbnz	x0, 0x42774a8 <_ChromeMain+0x427220c>
 4276ccc: 52800600     	mov	w0, #0x30               ; =48
 4276cd0: 96f661a6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4276cd4: f9003be0     	str	x0, [sp, #0x70]
 4276cd8: 9004e628     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4276cdc: 3dc2f100     	ldr	q0, [x8, #0xbc0]
 4276ce0: 3c8783e0     	stur	q0, [sp, #0x78]
 4276ce4: 91008409     	add	x9, x0, #0x21
 4276ce8: eb00013f     	cmp	x9, x0
 4276cec: 54003dc3     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4276cf0: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276cf4: 910ef508     	add	x8, x8, #0x3bd
 4276cf8: eb08013f     	cmp	x9, x8
 4276cfc: fa488002     	ccmp	x0, x8, #0x2, hi
 4276d00: 54003d29     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276d04: 52800ca9     	mov	w9, #0x65               ; =101
 4276d08: 79004009     	strh	w9, [x0, #0x20]
 4276d0c: ad400500     	ldp	q0, q1, [x8]
 4276d10: ad000400     	stp	q0, q1, [x0]
 4276d14: 9101c3e1     	add	x1, sp, #0x70
 4276d18: aa1303e8     	mov	x8, x19
 4276d1c: aa1403e0     	mov	x0, x20
 4276d20: 94a8018c     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276d24: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276d28: 91397108     	add	x8, x8, #0xe5c
 4276d2c: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276d30: f9001354     	str	x20, [x26, #0x20]
 4276d34: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276d38: 91120000     	add	x0, x0, #0x480
 4276d3c: d10303a1     	sub	x1, x29, #0xc0
 4276d40: d10203a2     	sub	x2, x29, #0x80
 4276d44: 94a807a5     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276d48: f9000660     	str	x0, [x19, #0x8]
 4276d4c: 52800028     	mov	w8, #0x1                ; =1
 4276d50: 39004268     	strb	w8, [x19, #0x10]
 4276d54: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4276d58: 36f81428     	tbz	w8, #0x1f, 0x4276fdc <_ChromeMain+0x4271d40>
 4276d5c: f9403be0     	ldr	x0, [sp, #0x70]
 4276d60: f94043e8     	ldr	x8, [sp, #0x80]
 4276d64: 1400009c     	b	0x4276fd4 <_ChromeMain+0x4271d38>
 4276d68: 528002c8     	mov	w8, #0x16               ; =22
 4276d6c: 3903dfe8     	strb	w8, [sp, #0xf7]
 4276d70: 910383e9     	add	x9, sp, #0xe0
 4276d74: 9100592a     	add	x10, x9, #0x16
 4276d78: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276d7c: 910d1d08     	add	x8, x8, #0x347
 4276d80: eb08015f     	cmp	x10, x8
 4276d84: fa488122     	ccmp	x9, x8, #0x2, hi
 4276d88: 540038e9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276d8c: 3dc00100     	ldr	q0, [x8]
 4276d90: 3d800b60     	str	q0, [x27, #0x20]
 4276d94: f840e108     	ldur	x8, [x8, #0xe]
 4276d98: f802e368     	stur	x8, [x27, #0x2e]
 4276d9c: 3903dbff     	strb	wzr, [sp, #0xf6]
 4276da0: 910383e1     	add	x1, sp, #0xe0
 4276da4: aa1303e8     	mov	x8, x19
 4276da8: aa1403e0     	mov	x0, x20
 4276dac: 94a80169     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276db0: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276db4: 91397108     	add	x8, x8, #0xe5c
 4276db8: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276dbc: f9001354     	str	x20, [x26, #0x20]
 4276dc0: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276dc4: 91120000     	add	x0, x0, #0x480
 4276dc8: d10303a1     	sub	x1, x29, #0xc0
 4276dcc: d10203a2     	sub	x2, x29, #0x80
 4276dd0: 94a80782     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276dd4: f9000660     	str	x0, [x19, #0x8]
 4276dd8: 52800028     	mov	w8, #0x1                ; =1
 4276ddc: 39004268     	strb	w8, [x19, #0x10]
 4276de0: 39c3dfe8     	ldrsb	w8, [sp, #0xf7]
 4276de4: 36f81088     	tbz	w8, #0x1f, 0x4276ff4 <_ChromeMain+0x4271d58>
 4276de8: f9401360     	ldr	x0, [x27, #0x20]
 4276dec: f9401b68     	ldr	x8, [x27, #0x30]
 4276df0: 1400007f     	b	0x4276fec <_ChromeMain+0x4271d50>
 4276df4: f1005f1f     	cmp	x24, #0x17
 4276df8: 54000163     	b.lo	0x4276e24 <_ChromeMain+0x4271b88>
 4276dfc: 927ceb1a     	and	x26, x24, #0x7ffffffffffffff0
 4276e00: 91004340     	add	x0, x26, #0x10
 4276e04: 96f66159     	bl	0xf368 <_ChromeMain+0xa0cc>
 4276e08: aa0003f5     	mov	x21, x0
 4276e0c: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4276e10: cb080348     	sub	x8, x26, x8
 4276e14: d10283ba     	sub	x26, x29, #0xa0
 4276e18: a90f6360     	stp	x0, x24, [x27, #0xf0]
 4276e1c: f9008368     	str	x8, [x27, #0x100]
 4276e20: 14000003     	b	0x4276e2c <_ChromeMain+0x4271b90>
 4276e24: 381573b8     	sturb	w24, [x29, #-0xa9]
 4276e28: d10303b5     	sub	x21, x29, #0xc0
 4276e2c: 8b1802a8     	add	x8, x21, x24
 4276e30: eb15011f     	cmp	x8, x21
 4276e34: 54003383     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4276e38: eb1902bf     	cmp	x21, x25
 4276e3c: 54000068     	b.hi	0x4276e48 <_ChromeMain+0x4271bac>
 4276e40: eb19011f     	cmp	x8, x25
 4276e44: 54003308     	b.hi	0x42774a4 <_ChromeMain+0x4272208>
 4276e48: aa1503e0     	mov	x0, x21
 4276e4c: aa1903e1     	mov	x1, x25
 4276e50: aa1803e2     	mov	x2, x24
 4276e54: 94f6611e     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4276e58: 38386abf     	strb	wzr, [x21, x24]
 4276e5c: 385573b8     	ldurb	w24, [x29, #-0xa9]
 4276e60: 13001f08     	sxtb	w8, w24
 4276e64: 7100011f     	cmp	w8, #0x0
 4276e68: d10303a8     	sub	x8, x29, #0xc0
 4276e6c: a94f2775     	ldp	x21, x9, [x27, #0xf0]
 4276e70: 9a8842a0     	csel	x0, x21, x8, mi
 4276e74: 2a1803e8     	mov	w8, w24
 4276e78: 9a884121     	csel	x1, x9, x8, mi
 4276e7c: 97fff968     	bl	0x427541c <_ChromeMain+0x4270180>
 4276e80: aa0003f9     	mov	x25, x0
 4276e84: 363800b8     	tbz	w24, #0x7, 0x4276e98 <_ChromeMain+0x4271bfc>
 4276e88: f9408368     	ldr	x8, [x27, #0x100]
 4276e8c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276e90: aa1503e0     	mov	x0, x21
 4276e94: 96f64809     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276e98: d360ff28     	lsr	x8, x25, #32
 4276e9c: b4000588     	cbz	x8, 0x4276f4c <_ChromeMain+0x4271cb0>
 4276ea0: f940f280     	ldr	x0, [x20, #0x1e0]
 4276ea4: b4000060     	cbz	x0, 0x4276eb0 <_ChromeMain+0x4271c14>
 4276ea8: 9707eae2     	bl	0x471a30 <_ChromeMain+0x46c794>
 4276eac: b5000be0     	cbnz	x0, 0x4277028 <_ChromeMain+0x4271d8c>
 4276eb0: 52800600     	mov	w0, #0x30               ; =48
 4276eb4: 96f6612d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4276eb8: f9001fe0     	str	x0, [sp, #0x38]
 4276ebc: 9004e628     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4276ec0: 3dc2f100     	ldr	q0, [x8, #0xbc0]
 4276ec4: 3c8403e0     	stur	q0, [sp, #0x40]
 4276ec8: 91008409     	add	x9, x0, #0x21
 4276ecc: eb00013f     	cmp	x9, x0
 4276ed0: 54002ea3     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4276ed4: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276ed8: 910ef508     	add	x8, x8, #0x3bd
 4276edc: eb08013f     	cmp	x9, x8
 4276ee0: fa488002     	ccmp	x0, x8, #0x2, hi
 4276ee4: 54002e09     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276ee8: 52800ca9     	mov	w9, #0x65               ; =101
 4276eec: 79004009     	strh	w9, [x0, #0x20]
 4276ef0: ad400500     	ldp	q0, q1, [x8]
 4276ef4: ad000400     	stp	q0, q1, [x0]
 4276ef8: 9100e3e1     	add	x1, sp, #0x38
 4276efc: aa1303e8     	mov	x8, x19
 4276f00: aa1403e0     	mov	x0, x20
 4276f04: 94a80113     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276f08: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276f0c: 91397108     	add	x8, x8, #0xe5c
 4276f10: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276f14: f9001354     	str	x20, [x26, #0x20]
 4276f18: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276f1c: 91120000     	add	x0, x0, #0x480
 4276f20: d10303a1     	sub	x1, x29, #0xc0
 4276f24: d10203a2     	sub	x2, x29, #0x80
 4276f28: 94a8072c     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276f2c: f9000660     	str	x0, [x19, #0x8]
 4276f30: 52800028     	mov	w8, #0x1                ; =1
 4276f34: 39004268     	strb	w8, [x19, #0x10]
 4276f38: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4276f3c: 36f80508     	tbz	w8, #0x1f, 0x4276fdc <_ChromeMain+0x4271d40>
 4276f40: f9401fe0     	ldr	x0, [sp, #0x38]
 4276f44: f94027e8     	ldr	x8, [sp, #0x48]
 4276f48: 14000023     	b	0x4276fd4 <_ChromeMain+0x4271d38>
 4276f4c: 528002a8     	mov	w8, #0x15               ; =21
 4276f50: 39019fe8     	strb	w8, [sp, #0x67]
 4276f54: 910143e9     	add	x9, sp, #0x50
 4276f58: 9100552a     	add	x10, x9, #0x15
 4276f5c: 900464a8     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4276f60: 910bed08     	add	x8, x8, #0x2fb
 4276f64: eb08015f     	cmp	x10, x8
 4276f68: fa488122     	ccmp	x9, x8, #0x2, hi
 4276f6c: 540029c9     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 4276f70: 3dc00100     	ldr	q0, [x8]
 4276f74: 3d8017e0     	str	q0, [sp, #0x50]
 4276f78: f840d108     	ldur	x8, [x8, #0xd]
 4276f7c: f805d3e8     	stur	x8, [sp, #0x5d]
 4276f80: 390197ff     	strb	wzr, [sp, #0x65]
 4276f84: 910143e1     	add	x1, sp, #0x50
 4276f88: aa1303e8     	mov	x8, x19
 4276f8c: aa1403e0     	mov	x0, x20
 4276f90: 94a800f0     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4276f94: b0015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4276f98: 91397108     	add	x8, x8, #0xe5c
 4276f9c: a90f7f68     	stp	x8, xzr, [x27, #0xf0]
 4276fa0: f9001354     	str	x20, [x26, #0x20]
 4276fa4: f000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4276fa8: 91120000     	add	x0, x0, #0x480
 4276fac: d10303a1     	sub	x1, x29, #0xc0
 4276fb0: d10203a2     	sub	x2, x29, #0x80
 4276fb4: 94a80709     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4276fb8: f9000660     	str	x0, [x19, #0x8]
 4276fbc: 52800028     	mov	w8, #0x1                ; =1
 4276fc0: 39004268     	strb	w8, [x19, #0x10]
 4276fc4: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4276fc8: 36f800a8     	tbz	w8, #0x1f, 0x4276fdc <_ChromeMain+0x4271d40>
 4276fcc: f9402be0     	ldr	x0, [sp, #0x50]
 4276fd0: f94033e8     	ldr	x8, [sp, #0x60]
 4276fd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276fd8: 96f647b8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276fdc: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 4276fe0: 36f800a8     	tbz	w8, #0x1f, 0x4276ff4 <_ChromeMain+0x4271d58>
 4276fe4: f94053e0     	ldr	x0, [sp, #0xa0]
 4276fe8: f9405be8     	ldr	x8, [sp, #0xb0]
 4276fec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276ff0: 96f647b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276ff4: 394463e8     	ldrb	w8, [sp, #0x118]
 4276ff8: 340000e8     	cbz	w8, 0x4277014 <_ChromeMain+0x4271d78>
 4276ffc: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 4277000: 36f800a8     	tbz	w8, #0x1f, 0x4277014 <_ChromeMain+0x4271d78>
 4277004: f9402360     	ldr	x0, [x27, #0x40]
 4277008: f9402b68     	ldr	x8, [x27, #0x50]
 427700c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4277010: 96f647aa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4277014: 39c4ffe8     	ldrsb	w8, [sp, #0x13f]
 4277018: 36ffb228     	tbz	w8, #0x1f, 0x427665c <_ChromeMain+0x42713c0>
 427701c: f9403760     	ldr	x0, [x27, #0x68]
 4277020: f9403f68     	ldr	x8, [x27, #0x78]
 4277024: 17fffd8c     	b	0x4276654 <_ChromeMain+0x42713b8>
 4277028: f90013e0     	str	x0, [sp, #0x20]
 427702c: f940ea9a     	ldr	x26, [x20, #0x1d0]
 4277030: b500005a     	cbnz	x26, 0x4277038 <_ChromeMain+0x4271d9c>
 4277034: f940e69a     	ldr	x26, [x20, #0x1c8]
 4277038: f9400a88     	ldr	x8, [x20, #0x10]
 427703c: f9411518     	ldr	x24, [x8, #0x228]
 4277040: 52801f00     	mov	w0, #0xf8               ; =248
 4277044: 96f660c9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4277048: aa0003f5     	mov	x21, x0
 427704c: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 4277050: 37f800e8     	tbnz	w8, #0x1f, 0x427706c <_ChromeMain+0x4271dd0>
 4277054: 3dc02be0     	ldr	q0, [sp, #0xa0]
 4277058: d10283a9     	sub	x9, x29, #0xa0
 427705c: 3d800920     	str	q0, [x9, #0x20]
 4277060: f9405be8     	ldr	x8, [sp, #0xb0]
 4277064: f9001928     	str	x8, [x9, #0x30]
 4277068: 14000004     	b	0x4277078 <_ChromeMain+0x4271ddc>
 427706c: a94a0be1     	ldp	x1, x2, [sp, #0xa0]
 4277070: d10203a0     	sub	x0, x29, #0x80
 4277074: 96f68469     	bl	0x18218 <_ChromeMain+0x12f7c>
 4277078: 37f800fc     	tbnz	w28, #0x1f, 0x4277094 <_ChromeMain+0x4271df8>
 427707c: 3cc68360     	ldur	q0, [x27, #0x68]
 4277080: d10283a9     	sub	x9, x29, #0xa0
 4277084: 3d800120     	str	q0, [x9]
 4277088: f9403f68     	ldr	x8, [x27, #0x78]
 427708c: f9000928     	str	x8, [x9, #0x10]
 4277090: 14000005     	b	0x42770a4 <_ChromeMain+0x4271e08>
 4277094: d10283a0     	sub	x0, x29, #0xa0
 4277098: aa1703e1     	mov	x1, x23
 427709c: aa1603e2     	mov	x2, x22
 42770a0: 96f6845e     	bl	0x18218 <_ChromeMain+0x12f7c>
 42770a4: 381403bf     	sturb	wzr, [x29, #-0xc0]
 42770a8: 381583bf     	sturb	wzr, [x29, #-0xa8]
 42770ac: 394463e8     	ldrb	w8, [sp, #0x118]
 42770b0: 34000108     	cbz	w8, 0x42770d0 <_ChromeMain+0x4271e34>
 42770b4: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 42770b8: 36f83408     	tbz	w8, #0x1f, 0x4277738 <_ChromeMain+0x427249c>
 42770bc: a9440b61     	ldp	x1, x2, [x27, #0x40]
 42770c0: d10303a0     	sub	x0, x29, #0xc0
 42770c4: 96f68455     	bl	0x18218 <_ChromeMain+0x12f7c>
 42770c8: 52800028     	mov	w8, #0x1                ; =1
 42770cc: 381583a8     	sturb	w8, [x29, #-0xa8]
 42770d0: 39c05f08     	ldrsb	w8, [x24, #0x17]
 42770d4: 37f800c8     	tbnz	w8, #0x1f, 0x42770ec <_ChromeMain+0x4271e50>
 42770d8: 3dc00300     	ldr	q0, [x24]
 42770dc: f9400b08     	ldr	x8, [x24, #0x10]
 42770e0: f9007368     	str	x8, [x27, #0xe0]
 42770e4: 3d803760     	str	q0, [x27, #0xd0]
 42770e8: 14000004     	b	0x42770f8 <_ChromeMain+0x4271e5c>
 42770ec: a9400b01     	ldp	x1, x2, [x24]
 42770f0: d10383a0     	sub	x0, x29, #0xe0
 42770f4: 96f68449     	bl	0x18218 <_ChromeMain+0x12f7c>
 42770f8: d10283aa     	sub	x10, x29, #0xa0
 42770fc: f9401148     	ldr	x8, [x10, #0x20]
 4277100: 3cc28140     	ldur	q0, [x10, #0x28]
 4277104: a902fd5f     	stp	xzr, xzr, [x10, #0x28]
 4277108: f900115f     	str	xzr, [x10, #0x20]
 427710c: f9400149     	ldr	x9, [x10]
 4277110: 3cc08141     	ldur	q1, [x10, #0x8]
 4277114: a9007d5f     	stp	xzr, xzr, [x10]
 4277118: f900095f     	str	xzr, [x10, #0x10]
 427711c: f9406b77     	ldr	x23, [x27, #0xd0]
 4277120: 3ccd8362     	ldur	q2, [x27, #0xd8]
 4277124: a90d7f7f     	stp	xzr, xzr, [x27, #0xd0]
 4277128: f900737f     	str	xzr, [x27, #0xe0]
 427712c: f90006a8     	str	x8, [x21, #0x8]
 4277130: 3d8006a0     	str	q0, [x21, #0x10]
 4277134: f90012a9     	str	x9, [x21, #0x20]
 4277138: 3c8282a1     	stur	q1, [x21, #0x28]
 427713c: 925e7748     	and	x8, x26, #0xfffffffc00000000
 4277140: f00549d6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4277144: f94046c9     	ldr	x9, [x22, #0x88]
 4277148: eb09011f     	cmp	x8, x9
 427714c: f94013f8     	ldr	x24, [sp, #0x20]
 4277150: 540000a1     	b.ne	0x4277164 <_ChromeMain+0x4271ec8>
 4277154: aa1a03e0     	mov	x0, x26
 4277158: 3d8007e2     	str	q2, [sp, #0x10]
 427715c: 96f67468     	bl	0x142fc <_ChromeMain+0xf060>
 4277160: 3dc007e2     	ldr	q2, [sp, #0x10]
 4277164: a903deba     	stp	x26, x23, [x21, #0x38]
 4277168: 3c8482a2     	stur	q2, [x21, #0x48]
 427716c: 910162a8     	add	x8, x21, #0x58
 4277170: 528000c9     	mov	w9, #0x6                ; =6
 4277174: 3901bea9     	strb	w9, [x21, #0x6f]
 4277178: 91017aa9     	add	x9, x21, #0x5e
 427717c: eb08013f     	cmp	x9, x8
 4277180: 54001923     	b.lo	0x42774a4 <_ChromeMain+0x4272208>
 4277184: f004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4277188: 9110254a     	add	x10, x10, #0x409
 427718c: eb0a013f     	cmp	x9, x10
 4277190: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4277194: d10283b7     	sub	x23, x29, #0xa0
 4277198: 54001869     	b.ls	0x42774a4 <_ChromeMain+0x4272208>
 427719c: 528c8ca9     	mov	w9, #0x6465             ; =25701
 42771a0: 79000909     	strh	w9, [x8, #0x4]
 42771a4: 528eae29     	mov	w9, #0x7571             ; =30065
 42771a8: 72aeaca9     	movk	w9, #0x7565, lsl #16
 42771ac: b9000109     	str	w9, [x8]
 42771b0: 39017abf     	strb	wzr, [x21, #0x5e]
 42771b4: 6f00e400     	movi.2d	v0, #0000000000000000
 42771b8: ad0382a0     	stp	q0, q0, [x21, #0x70]
 42771bc: 3d8026a0     	str	q0, [x21, #0x90]
 42771c0: f90052bf     	str	xzr, [x21, #0xa0]
 42771c4: f004ffa8     	adrp	x8, 0xe26e000 <dyld_stub_binder+0xe26e000>
 42771c8: 913be108     	add	x8, x8, #0xef8
 42771cc: f90002a8     	str	x8, [x21]
 42771d0: b900aab9     	str	w25, [x21, #0xa8]
 42771d4: aa1503e8     	mov	x8, x21
 42771d8: 380b0d1f     	strb	wzr, [x8, #0xb0]!
 42771dc: 390322bf     	strb	wzr, [x21, #0xc8]
 42771e0: 385583a9     	ldurb	w9, [x29, #-0xa8]
 42771e4: 34000129     	cbz	w9, 0x4277208 <_ChromeMain+0x4271f6c>
 42771e8: 3dc03f60     	ldr	q0, [x27, #0xf0]
 42771ec: 3d800100     	str	q0, [x8]
 42771f0: f9408369     	ldr	x9, [x27, #0x100]
 42771f4: f9000909     	str	x9, [x8, #0x10]
 42771f8: a90fff7f     	stp	xzr, xzr, [x27, #0xf8]
 42771fc: f9007b7f     	str	xzr, [x27, #0xf0]
 4277200: 52800028     	mov	w8, #0x1                ; =1
 4277204: 390322a8     	strb	w8, [x21, #0xc8]
 4277208: 925e7708     	and	x8, x24, #0xfffffffc00000000
 427720c: f94046c9     	ldr	x9, [x22, #0x88]
 4277210: eb09011f     	cmp	x8, x9
 4277214: 54000061     	b.ne	0x4277220 <_ChromeMain+0x4271f84>
 4277218: aa1803e0     	mov	x0, x24
 427721c: 96f67438     	bl	0x142fc <_ChromeMain+0xf060>
 4277220: f9006ab8     	str	x24, [x21, #0xd0]
 4277224: b94033e8     	ldr	w8, [sp, #0x30]
 4277228: 390362a8     	strb	w8, [x21, #0xd8]
 427722c: f90072bf     	str	xzr, [x21, #0xe0]
 4277230: 52800100     	mov	w0, #0x8                ; =8
 4277234: 96f6604d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4277238: b900001f     	str	wzr, [x0]
 427723c: 3900101f     	strb	wzr, [x0, #0x4]
 4277240: b40000c0     	cbz	x0, 0x4277258 <_ChromeMain+0x4271fbc>
 4277244: 52800028     	mov	w8, #0x1                ; =1
 4277248: b8280008     	ldadd	w8, w8, [x0]
 427724c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4277250: 6b09011f     	cmp	w8, w9
 4277254: 54003e20     	b.eq	0x4277a18 <_ChromeMain+0x427277c>
 4277258: a90ed6a0     	stp	x0, x21, [x21, #0xe8]
 427725c: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 4277260: 36f800a8     	tbz	w8, #0x1f, 0x4277274 <_ChromeMain+0x4271fd8>
 4277264: f9406b60     	ldr	x0, [x27, #0xd0]
 4277268: f9407368     	ldr	x8, [x27, #0xe0]
 427726c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4277270: 96f64712     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4277274: 385583a8     	ldurb	w8, [x29, #-0xa8]
 4277278: 340000e8     	cbz	w8, 0x4277294 <_ChromeMain+0x4271ff8>
 427727c: 38d573a8     	ldursb	w8, [x29, #-0xa9]
 4277280: 36f800a8     	tbz	w8, #0x1f, 0x4277294 <_ChromeMain+0x4271ff8>
 4277284: f9407b60     	ldr	x0, [x27, #0xf0]
 4277288: f9408368     	ldr	x8, [x27, #0x100]
 427728c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4277290: 96f6470a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4277294: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4277298: 36f800a8     	tbz	w8, #0x1f, 0x42772ac <_ChromeMain+0x4272010>
 427729c: f94002e0     	ldr	x0, [x23]
 42772a0: f9400ae8     	ldr	x8, [x23, #0x10]
 42772a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42772a8: 96f64704     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42772ac: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42772b0: 36f800a8     	tbz	w8, #0x1f, 0x42772c4 <_ChromeMain+0x4272028>
 42772b4: f94012e0     	ldr	x0, [x23, #0x20]
 42772b8: f9401ae8     	ldr	x8, [x23, #0x30]
 42772bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42772c0: 96f646fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42772c4: d0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42772c8: 910c2108     	add	x8, x8, #0x308
 42772cc: 38bfc108     	ldaprb	w8, [x8]
 42772d0: 36003488     	tbz	w8, #0x0, 0x4277960 <_ChromeMain+0x42726c4>
 42772d4: d0055677     	adrp	x23, 0xed45000 <dyld_stub_binder+0xed45000>
 42772d8: 910be2f7     	add	x23, x23, #0x2f8
 42772dc: f94002e8     	ldr	x8, [x23]
 42772e0: aa1703f9     	mov	x25, x23
 42772e4: aa1703f8     	mov	x24, x23
 42772e8: b4000448     	cbz	x8, 0x4277370 <_ChromeMain+0x42720d4>
 42772ec: 3982dfe9     	ldrsb	x9, [sp, #0xb7]
 42772f0: 910283ea     	add	x10, sp, #0xa0
 42772f4: a94a33eb     	ldp	x11, x12, [sp, #0xa0]
 42772f8: f100013f     	cmp	x9, #0x0
 42772fc: 9a8a4176     	csel	x22, x11, x10, mi
 4277300: 7100013f     	cmp	w9, #0x0
 4277304: 9a89419a     	csel	x26, x12, x9, mi
 4277308: 14000003     	b	0x4277314 <_ChromeMain+0x4272078>
 427730c: f9400708     	ldr	x8, [x24, #0x8]
 4277310: b4003248     	cbz	x8, 0x4277958 <_ChromeMain+0x42726bc>
 4277314: aa0803f8     	mov	x24, x8
 4277318: f8420d09     	ldr	x9, [x8, #0x20]!
 427731c: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4277320: f100015f     	cmp	x10, #0x0
 4277324: 9a884121     	csel	x1, x9, x8, mi
 4277328: f9400508     	ldr	x8, [x8, #0x8]
 427732c: 7100015f     	cmp	w10, #0x0
 4277330: 9a8a4119     	csel	x25, x8, x10, mi
 4277334: eb1a033f     	cmp	x25, x26
 4277338: 9a9a3322     	csel	x2, x25, x26, lo
 427733c: aa1603e0     	mov	x0, x22
 4277340: 94f64948     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4277344: 340000c0     	cbz	w0, 0x427735c <_ChromeMain+0x42720c0>
 4277348: 36fffe20     	tbz	w0, #0x1f, 0x427730c <_ChromeMain+0x4272070>
 427734c: f9400308     	ldr	x8, [x24]
 4277350: aa1803f9     	mov	x25, x24
 4277354: b5fffe08     	cbnz	x8, 0x4277314 <_ChromeMain+0x4272078>
 4277358: 14000006     	b	0x4277370 <_ChromeMain+0x42720d4>
 427735c: eb19035f     	cmp	x26, x25
 4277360: 54001e81     	b.ne	0x4277730 <_ChromeMain+0x4272494>
 4277364: aa1503f6     	mov	x22, x21
 4277368: d10283ba     	sub	x26, x29, #0xa0
 427736c: 14000022     	b	0x42773f4 <_ChromeMain+0x4272158>
 4277370: 52800800     	mov	w0, #0x40               ; =64
 4277374: 96f65ffd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4277378: b4000960     	cbz	x0, 0x42774a4 <_ChromeMain+0x4272208>
 427737c: aa0003f6     	mov	x22, x0
 4277380: f802041f     	str	xzr, [x0], #0x20
 4277384: b4000900     	cbz	x0, 0x42774a4 <_ChromeMain+0x4272208>
 4277388: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 427738c: d10283ba     	sub	x26, x29, #0xa0
 4277390: 37f800c8     	tbnz	w8, #0x1f, 0x42773a8 <_ChromeMain+0x427210c>
 4277394: 3dc02be0     	ldr	q0, [sp, #0xa0]
 4277398: 3d800000     	str	q0, [x0]
 427739c: f9405be8     	ldr	x8, [sp, #0xb0]
 42773a0: f9000808     	str	x8, [x0, #0x10]
 42773a4: 14000003     	b	0x42773b0 <_ChromeMain+0x4272114>
 42773a8: a94a0be1     	ldp	x1, x2, [sp, #0xa0]
 42773ac: 96f6839b     	bl	0x18218 <_ChromeMain+0x12f7c>
 42773b0: f9001ed5     	str	x21, [x22, #0x38]
 42773b4: a9007edf     	stp	xzr, xzr, [x22]
 42773b8: f9000ad8     	str	x24, [x22, #0x10]
 42773bc: f9000336     	str	x22, [x25]
 42773c0: d0055668     	adrp	x8, 0xed45000 <dyld_stub_binder+0xed45000>
 42773c4: f9417909     	ldr	x9, [x8, #0x2f0]
 42773c8: f9400129     	ldr	x9, [x9]
 42773cc: b4000069     	cbz	x9, 0x42773d8 <_ChromeMain+0x427213c>
 42773d0: f9017909     	str	x9, [x8, #0x2f0]
 42773d4: f9400336     	ldr	x22, [x25]
 42773d8: f94002e0     	ldr	x0, [x23]
 42773dc: aa1603e1     	mov	x1, x22
 42773e0: 96f791a0     	bl	0x5ba60 <_ChromeMain+0x567c4>
 42773e4: d2800016     	mov	x22, #0x0               ; =0
 42773e8: f94006e8     	ldr	x8, [x23, #0x8]
 42773ec: 91000508     	add	x8, x8, #0x1
 42773f0: f90006e8     	str	x8, [x23, #0x8]
 42773f4: f94002a8     	ldr	x8, [x21]
 42773f8: f9400908     	ldr	x8, [x8, #0x10]
 42773fc: aa1503e0     	mov	x0, x21
 4277400: d63f0100     	blr	x8
 4277404: a90f7f7f     	stp	xzr, xzr, [x27, #0xf0]
 4277408: f900837f     	str	xzr, [x27, #0x100]
 427740c: 3982dfe8     	ldrsb	x8, [sp, #0xb7]
 4277410: 910283e9     	add	x9, sp, #0xa0
 4277414: a94a2fea     	ldp	x10, x11, [sp, #0xa0]
 4277418: f100011f     	cmp	x8, #0x0
 427741c: 9a894143     	csel	x3, x10, x9, mi
 4277420: 7100011f     	cmp	w8, #0x0
 4277424: 9a884164     	csel	x4, x11, x8, mi
 4277428: d004c321     	adrp	x1, 0xdadd000 <dyld_stub_binder+0xdadd000>
 427742c: 91141c21     	add	x1, x1, #0x507
 4277430: d10303a0     	sub	x0, x29, #0xc0
 4277434: 528000a2     	mov	w2, #0x5                ; =5
 4277438: 9750a464     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 427743c: 9100dfe8     	add	x8, sp, #0x37
 4277440: d10303a1     	sub	x1, x29, #0xc0
 4277444: aa1403e0     	mov	x0, x20
 4277448: 94a9bd91     	bl	0x6ce6a8c <_ChromeMain+0x6ce17f0>
 427744c: 3940dff5     	ldrb	w21, [sp, #0x37]
 4277450: 90015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4277454: 91397108     	add	x8, x8, #0xe5c
 4277458: a9027f48     	stp	x8, xzr, [x26, #0x20]
 427745c: f9000354     	str	x20, [x26]
 4277460: d000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4277464: 91120000     	add	x0, x0, #0x480
 4277468: d10203a1     	sub	x1, x29, #0x80
 427746c: d10283a2     	sub	x2, x29, #0xa0
 4277470: 94a805da     	bl	0x6c78bd8 <_ChromeMain+0x6c7393c>
 4277474: 39000275     	strb	w21, [x19]
 4277478: f9000660     	str	x0, [x19, #0x8]
 427747c: 52800028     	mov	w8, #0x1                ; =1
 4277480: 39004268     	strb	w8, [x19, #0x10]
 4277484: d10303a0     	sub	x0, x29, #0xc0
 4277488: 971b9bfe     	bl	0x95e480 <_ChromeMain+0x9591e4>
 427748c: b4ffda96     	cbz	x22, 0x4276fdc <_ChromeMain+0x4271d40>
 4277490: f94002c8     	ldr	x8, [x22]
 4277494: f9400508     	ldr	x8, [x8, #0x8]
 4277498: aa1603e0     	mov	x0, x22
 427749c: d63f0100     	blr	x8
 42774a0: 17fffecf     	b	0x4276fdc <_ChromeMain+0x4271d40>
 42774a4: d4200020     	brk	#0x1
