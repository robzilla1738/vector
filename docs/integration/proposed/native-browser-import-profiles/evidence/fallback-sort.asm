
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4268340: d104c3ff     	sub	sp, sp, #0x130
 4268344: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 4268348: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 426834c: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 4268350: a91057f6     	stp	x22, x21, [sp, #0x100]
 4268354: a9114ff4     	stp	x20, x19, [sp, #0x110]
 4268358: a9127bfd     	stp	x29, x30, [sp, #0x120]
 426835c: 910483fd     	add	x29, sp, #0x120
 4268360: aa0303fb     	mov	x27, x3
 4268364: aa0203fa     	mov	x26, x2
 4268368: aa0103f4     	mov	x20, x1
 426836c: aa0003f7     	mov	x23, x0
 4268370: 910083e8     	add	x8, sp, #0x20
 4268374: 91002108     	add	x8, x8, #0x8
 4268378: f9000be8     	str	x8, [sp, #0x10]
 426837c: b202e7fc     	mov	x28, #-0x3333333333333334 ; =-3689348814741910324
 4268380: f29999bc     	movk	x28, #0xcccd
 4268384: b9000ffb     	str	w27, [sp, #0xc]
 4268388: aa1703f3     	mov	x19, x23
 426838c: 910022f9     	add	x25, x23, #0x8
 4268390: 1400001f     	b	0x426840c <_ChromeMain+0x4263170>
 4268394: 3707ffb8     	tbnz	w24, #0x0, 0x4268388 <_ChromeMain+0x42630ec>
 4268398: 140004c8     	b	0x42696b8 <_ChromeMain+0x426441c>
 426839c: d10142f9     	sub	x25, x23, #0x50
 42683a0: eb19027f     	cmp	x19, x25
 42683a4: 54000080     	b.eq	0x42683b4 <_ChromeMain+0x4263118>
 42683a8: d10142e1     	sub	x1, x23, #0x50
 42683ac: aa1303e0     	mov	x0, x19
 42683b0: 97ff96ee     	bl	0x424df68 <_ChromeMain+0x4248ccc>
 42683b4: d10142e0     	sub	x0, x23, #0x50
 42683b8: 910083e1     	add	x1, sp, #0x20
 42683bc: 97ff96eb     	bl	0x424df68 <_ChromeMain+0x4248ccc>
 42683c0: 910083e0     	add	x0, sp, #0x20
 42683c4: 97ff9724     	bl	0x424e054 <_ChromeMain+0x4248db8>
 42683c8: eb1b02df     	cmp	x22, x27
 42683cc: f9400ffa     	ldr	x26, [sp, #0x18]
 42683d0: b202e7fc     	mov	x28, #-0x3333333333333334 ; =-3689348814741910324
 42683d4: f29999bc     	movk	x28, #0xcccd
 42683d8: b9400ffb     	ldr	w27, [sp, #0xc]
 42683dc: 540096e3     	b.lo	0x42696b8 <_ChromeMain+0x426441c>
 42683e0: d10142e1     	sub	x1, x23, #0x50
 42683e4: aa1303e0     	mov	x0, x19
 42683e8: 9400080d     	bl	0x426a41c <_ChromeMain+0x4265180>
 42683ec: aa0003f8     	mov	x24, x0
 42683f0: aa1703e0     	mov	x0, x23
 42683f4: aa1403e1     	mov	x1, x20
 42683f8: 94000809     	bl	0x426a41c <_ChromeMain+0x4265180>
 42683fc: 34fffcc0     	cbz	w0, 0x4268394 <_ChromeMain+0x42630f8>
 4268400: aa1903f4     	mov	x20, x25
 4268404: 91002279     	add	x25, x19, #0x8
 4268408: 37005978     	tbnz	w24, #0x0, 0x4268f34 <_ChromeMain+0x4263c98>
 426840c: cb130288     	sub	x8, x20, x19
 4268410: 9344fd09     	asr	x9, x8, #4
 4268414: 9b1c7d38     	mul	x24, x9, x28
 4268418: f1000b09     	subs	x9, x24, #0x2
 426841c: 540000ac     	b.gt	0x4268430 <_ChromeMain+0x4263194>
 4268420: 540058a3     	b.lo	0x4268f34 <_ChromeMain+0x4263c98>
 4268424: f1000b1f     	cmp	x24, #0x2
 4268428: 54004d40     	b.eq	0x4268dd0 <_ChromeMain+0x4263b34>
 426842c: 14000007     	b	0x4268448 <_ChromeMain+0x42631ac>
 4268430: f1000f1f     	cmp	x24, #0x3
 4268434: 54005780     	b.eq	0x4268f24 <_ChromeMain+0x4263c88>
 4268438: f100131f     	cmp	x24, #0x4
 426843c: 54009520     	b.eq	0x42696e0 <_ChromeMain+0x4264444>
 4268440: f100171f     	cmp	x24, #0x5
 4268444: 54005620     	b.eq	0x4268f08 <_ChromeMain+0x4263c6c>
 4268448: f11dfd1f     	cmp	x8, #0x77f
 426844c: 5400536d     	b.le	0x4268eb8 <_ChromeMain+0x4263c1c>
 4268450: b400637a     	cbz	x26, 0x42690bc <_ChromeMain+0x4263e20>
 4268454: d341ff09     	lsr	x9, x24, #1
 4268458: 52800a0a     	mov	w10, #0x50              ; =80
 426845c: 9b0a4d37     	madd	x23, x9, x10, x19
 4268460: d1014298     	sub	x24, x20, #0x50
 4268464: 52850029     	mov	w9, #0x2801             ; =10241
 4268468: d1014282     	sub	x2, x20, #0x50
 426846c: eb09011f     	cmp	x8, x9
 4268470: 54000643     	b.lo	0x4268538 <_ChromeMain+0x426329c>
 4268474: aa1303e0     	mov	x0, x19
 4268478: aa1703e1     	mov	x1, x23
 426847c: 94000562     	bl	0x4269a04 <_ChromeMain+0x4264768>
 4268480: 91014260     	add	x0, x19, #0x50
 4268484: d10142e1     	sub	x1, x23, #0x50
 4268488: d1028282     	sub	x2, x20, #0xa0
 426848c: 9400055e     	bl	0x4269a04 <_ChromeMain+0x4264768>
 4268490: 91028260     	add	x0, x19, #0xa0
 4268494: 910142e1     	add	x1, x23, #0x50
 4268498: d103c282     	sub	x2, x20, #0xf0
 426849c: 9400055a     	bl	0x4269a04 <_ChromeMain+0x4264768>
 42684a0: d10142e0     	sub	x0, x23, #0x50
 42684a4: 910142e2     	add	x2, x23, #0x50
 42684a8: aa1703e1     	mov	x1, x23
 42684ac: 94000556     	bl	0x4269a04 <_ChromeMain+0x4264768>
 42684b0: 6f00e400     	movi.2d	v0, #0000000000000000
 42684b4: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 42684b8: ad0403e0     	stp	q0, q0, [sp, #0x80]
 42684bc: 3d801fe0     	str	q0, [sp, #0x70]
 42684c0: b9400268     	ldr	w8, [x19]
 42684c4: b90073e8     	str	w8, [sp, #0x70]
 42684c8: f9400b28     	ldr	x8, [x25, #0x10]
 42684cc: 3dc00320     	ldr	q0, [x25]
 42684d0: 9101c3e9     	add	x9, sp, #0x70
 42684d4: 3c808120     	stur	q0, [x9, #0x8]
 42684d8: f8018128     	stur	x8, [x9, #0x18]
 42684dc: a900ff3f     	stp	xzr, xzr, [x25, #0x8]
 42684e0: f900033f     	str	xzr, [x25]
 42684e4: 3cc20260     	ldur	q0, [x19, #0x20]
 42684e8: f8430268     	ldur	x8, [x19, #0x30]
 42684ec: f8030128     	stur	x8, [x9, #0x30]
 42684f0: 3c820120     	stur	q0, [x9, #0x20]
 42684f4: a9027e7f     	stp	xzr, xzr, [x19, #0x20]
 42684f8: f803027f     	stur	xzr, [x19, #0x30]
 42684fc: 3cc38260     	ldur	q0, [x19, #0x38]
 4268500: f8448268     	ldur	x8, [x19, #0x48]
 4268504: f8048128     	stur	x8, [x9, #0x48]
 4268508: 3c838120     	stur	q0, [x9, #0x38]
 426850c: a903fe7f     	stp	xzr, xzr, [x19, #0x38]
 4268510: f804827f     	stur	xzr, [x19, #0x48]
 4268514: aa1303e0     	mov	x0, x19
 4268518: aa1703e1     	mov	x1, x23
 426851c: 97ff9693     	bl	0x424df68 <_ChromeMain+0x4248ccc>
 4268520: 9101c3e1     	add	x1, sp, #0x70
 4268524: aa1703e0     	mov	x0, x23
 4268528: 97ff9690     	bl	0x424df68 <_ChromeMain+0x4248ccc>
 426852c: 9101c3e0     	add	x0, sp, #0x70
 4268530: 97ff96c9     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4268534: 14000004     	b	0x4268544 <_ChromeMain+0x42632a8>
 4268538: aa1703e0     	mov	x0, x23
 426853c: aa1303e1     	mov	x1, x19
 4268540: 94000531     	bl	0x4269a04 <_ChromeMain+0x4264768>
 4268544: d100075a     	sub	x26, x26, #0x1
 4268548: 3700027b     	tbnz	w27, #0x0, 0x4268594 <_ChromeMain+0x42632f8>
 426854c: 389cf268     	ldursb	x8, [x19, #-0x31]
 4268550: a97baa69     	ldp	x9, x10, [x19, #-0x48]
 4268554: f100011f     	cmp	x8, #0x0
 4268558: d101226b     	sub	x11, x19, #0x48
 426855c: 9a8b4120     	csel	x0, x9, x11, mi
 4268560: 7100011f     	cmp	w8, #0x0
 4268564: 9a884155     	csel	x21, x10, x8, mi
 4268568: 39807e68     	ldrsb	x8, [x19, #0x1f]
 426856c: a940aa69     	ldp	x9, x10, [x19, #0x8]
 4268570: f100011f     	cmp	x8, #0x0
 4268574: 9a994121     	csel	x1, x9, x25, mi
 4268578: 7100011f     	cmp	w8, #0x0
 426857c: 9a884156     	csel	x22, x10, x8, mi
 4268580: eb1502df     	cmp	x22, x21
 4268584: 9a9532c2     	csel	x2, x22, x21, lo
 4268588: 94f684b6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426858c: 34001a60     	cbz	w0, 0x42688d8 <_ChromeMain+0x426363c>
 4268590: 36f81a80     	tbz	w0, #0x1f, 0x42688e0 <_ChromeMain+0x4263644>
 4268594: d2800008     	mov	x8, #0x0                ; =0
 4268598: 6f00e400     	movi.2d	v0, #0000000000000000
 426859c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 42685a0: ad0183e0     	stp	q0, q0, [sp, #0x30]
 42685a4: 3d800be0     	str	q0, [sp, #0x20]
 42685a8: b9400269     	ldr	w9, [x19]
 42685ac: b90023e9     	str	w9, [sp, #0x20]
 42685b0: f9400b29     	ldr	x9, [x25, #0x10]
 42685b4: 3dc00320     	ldr	q0, [x25]
 42685b8: f9400bed     	ldr	x13, [sp, #0x10]
 42685bc: 3d8001a0     	str	q0, [x13]
 42685c0: f90009a9     	str	x9, [x13, #0x10]
 42685c4: a900ff3f     	stp	xzr, xzr, [x25, #0x8]
 42685c8: f900033f     	str	xzr, [x25]
 42685cc: f8430269     	ldur	x9, [x19, #0x30]
 42685d0: 3cc20260     	ldur	q0, [x19, #0x20]
 42685d4: 910083ec     	add	x12, sp, #0x20
 42685d8: 3c820180     	stur	q0, [x12, #0x20]
 42685dc: f8030189     	stur	x9, [x12, #0x30]
 42685e0: a902fe7f     	stp	xzr, xzr, [x19, #0x28]
 42685e4: f802027f     	stur	xzr, [x19, #0x20]
 42685e8: 3cc38260     	ldur	q0, [x19, #0x38]
 42685ec: f8448269     	ldur	x9, [x19, #0x48]
 42685f0: f8048189     	stur	x9, [x12, #0x48]
 42685f4: 3980ffe9     	ldrsb	x9, [sp, #0x3f]
 42685f8: a942afea     	ldp	x10, x11, [sp, #0x28]
 42685fc: f100013f     	cmp	x9, #0x0
 4268600: 9a8d4157     	csel	x23, x10, x13, mi
 4268604: 7100013f     	cmp	w9, #0x0
 4268608: 9a894179     	csel	x25, x11, x9, mi
 426860c: 3c838180     	stur	q0, [x12, #0x38]
 4268610: a903fe7f     	stp	xzr, xzr, [x19, #0x38]
 4268614: f804827f     	stur	xzr, [x19, #0x48]
 4268618: aa0803f5     	mov	x21, x8
 426861c: 8b080268     	add	x8, x19, x8
