
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4267508: d10383ff     	sub	sp, sp, #0xe0
 426750c: a9086ffc     	stp	x28, x27, [sp, #0x80]
 4267510: a90967fa     	stp	x26, x25, [sp, #0x90]
 4267514: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 4267518: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 426751c: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 4267520: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 4267524: 910343fd     	add	x29, sp, #0xd0
 4267528: aa0103f7     	mov	x23, x1
 426752c: aa0003f6     	mov	x22, x0
 4267530: aa0803f3     	mov	x19, x8
 4267534: 6f00e400     	movi.2d	v0, #0000000000000000
 4267538: ad000100     	stp	q0, q0, [x8]
 426753c: aa0803f5     	mov	x21, x8
 4267540: 38018ea1     	strb	w1, [x21, #0x18]!
 4267544: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 4267548: f9003fff     	str	xzr, [sp, #0x78]
 426754c: 9101a3f4     	add	x20, sp, #0x68
 4267550: 9101a3e8     	add	x8, sp, #0x68
 4267554: 97ffe2ea     	bl	0x42600fc <_ChromeMain+0x425ae60>
 4267558: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 426755c: f94037e9     	ldr	x9, [sp, #0x68]
 4267560: 7100011f     	cmp	w8, #0x0
 4267564: 9a944120     	csel	x0, x9, x20, mi
 4267568: 951217a2     	bl	0x86ed3f0 <_ChromeMain+0x86e8154>
 426756c: aa0003f4     	mov	x20, x0
 4267570: b40010e0     	cbz	x0, 0x426778c <_ChromeMain+0x42624f0>
 4267574: 910003f8     	mov	x24, sp
 4267578: 910143f9     	add	x25, sp, #0x50
 426757c: 528ca89a     	mov	w26, #0x6544            ; =25924
 4267580: 72ac2cda     	movk	w26, #0x6166, lsl #16
 4267584: 528eac3b     	mov	w27, #0x7561            ; =30049
 4267588: 72ae8d9b     	movk	w27, #0x746c, lsl #16
 426758c: 528e6ebc     	mov	w28, #0x7375            ; =29557
 4267590: 72ae4cbc     	movk	w28, #0x7265, lsl #16
 4267594: 14000044     	b	0x42676a4 <_ChromeMain+0x4262408>
 4267598: b940010a     	ldr	w10, [x8]
 426759c: b840310b     	ldur	w11, [x8, #0x3]
 42675a0: 6b1a015f     	cmp	w10, w26
 42675a4: 7a5b0160     	ccmp	w11, w27, #0x0, eq
 42675a8: 54000140     	b.eq	0x42675d0 <_ChromeMain+0x4262334>
 42675ac: 71000adf     	cmp	w22, #0x2
 42675b0: 540006e1     	b.ne	0x426768c <_ChromeMain+0x42623f0>
 42675b4: f100153f     	cmp	x9, #0x5
 42675b8: 540006a3     	b.lo	0x426768c <_ChromeMain+0x42623f0>
 42675bc: b9400109     	ldr	w9, [x8]
 42675c0: 39401108     	ldrb	w8, [x8, #0x4]
 42675c4: 7100b51f     	cmp	w8, #0x2d
 42675c8: 7a5c0120     	ccmp	w9, w28, #0x0, eq
 42675cc: 54000601     	b.ne	0x426768c <_ChromeMain+0x42623f0>
 42675d0: 910143e1     	add	x1, sp, #0x50
 42675d4: aa1603e0     	mov	x0, x22
 42675d8: aa1503e2     	mov	x2, x21
 42675dc: 940000d8     	bl	0x426793c <_ChromeMain+0x42626a0>
 42675e0: 34000560     	cbz	w0, 0x426768c <_ChromeMain+0x42623f0>
 42675e4: 910003e8     	mov	x8, sp
 42675e8: 910143e1     	add	x1, sp, #0x50
 42675ec: aa1603e0     	mov	x0, x22
 42675f0: d2800002     	mov	x2, #0x0                ; =0
 42675f4: 94000125     	bl	0x4267a88 <_ChromeMain+0x42627ec>
 42675f8: a940a269     	ldp	x9, x8, [x19, #0x8]
 42675fc: eb08013f     	cmp	x9, x8
 4267600: 540012c0     	b.eq	0x4267858 <_ChromeMain+0x42625bc>
 4267604: f9400268     	ldr	x8, [x19]
 4267608: 52800a0a     	mov	w10, #0x50              ; =80
 426760c: 9b0a2129     	madd	x9, x9, x10, x8
 4267610: b4001229     	cbz	x9, 0x4267854 <_ChromeMain+0x42625b8>
 4267614: b94003ea     	ldr	w10, [sp]
 4267618: b900012a     	str	w10, [x9]
 426761c: 3cc08300     	ldur	q0, [x24, #0x8]
 4267620: f841830a     	ldur	x10, [x24, #0x18]
 4267624: f9000d2a     	str	x10, [x9, #0x18]
 4267628: 3c808120     	stur	q0, [x9, #0x8]
 426762c: a9017f1f     	stp	xzr, xzr, [x24, #0x10]
 4267630: f800831f     	stur	xzr, [x24, #0x8]
 4267634: 3cc20300     	ldur	q0, [x24, #0x20]
 4267638: f843030a     	ldur	x10, [x24, #0x30]
 426763c: f900192a     	str	x10, [x9, #0x30]
 4267640: 3d800920     	str	q0, [x9, #0x20]
 4267644: a902ff1f     	stp	xzr, xzr, [x24, #0x28]
 4267648: f802031f     	stur	xzr, [x24, #0x20]
 426764c: 3cc38300     	ldur	q0, [x24, #0x38]
 4267650: f844830a     	ldur	x10, [x24, #0x48]
 4267654: f900252a     	str	x10, [x9, #0x48]
 4267658: 3c838120     	stur	q0, [x9, #0x38]
 426765c: a9047f1f     	stp	xzr, xzr, [x24, #0x40]
 4267660: f803831f     	stur	xzr, [x24, #0x38]
 4267664: 91014120     	add	x0, x9, #0x50
 4267668: eb080008     	subs	x8, x0, x8
 426766c: 9344fd08     	asr	x8, x8, #4
 4267670: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4267674: f29999a9     	movk	x9, #0xcccd
 4267678: 9b097d08     	mul	x8, x8, x9
 426767c: f9000668     	str	x8, [x19, #0x8]
 4267680: 54000ea0     	b.eq	0x4267854 <_ChromeMain+0x42625b8>
 4267684: 910003e0     	mov	x0, sp
 4267688: 97ff9a73     	bl	0x424e054 <_ChromeMain+0x4248db8>
 426768c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4267690: 36f800a8     	tbz	w8, #0x1f, 0x42676a4 <_ChromeMain+0x4262408>
 4267694: f9402be0     	ldr	x0, [sp, #0x50]
 4267698: f94033e8     	ldr	x8, [sp, #0x60]
 426769c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42676a0: 96f68606     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42676a4: 94f685a4     	bl	0x8008d34 <_ChromeMain+0x8003a98>
 42676a8: b900001f     	str	wzr, [x0]
 42676ac: aa1403e0     	mov	x0, x20
 42676b0: 95121753     	bl	0x86ed3fc <_ChromeMain+0x86e8160>
 42676b4: b4000780     	cbz	x0, 0x42677a4 <_ChromeMain+0x4262508>
 42676b8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 42676bc: f90033ff     	str	xzr, [sp, #0x60]
 42676c0: b1005417     	adds	x23, x0, #0x15
 42676c4: 54000c80     	b.eq	0x4267854 <_ChromeMain+0x42625b8>
 42676c8: aa1703e0     	mov	x0, x23
 42676cc: 94f66f34     	bl	0x800339c <_ChromeMain+0x7ffe100>
 42676d0: aa0003e2     	mov	x2, x0
 42676d4: 910003e0     	mov	x0, sp
 42676d8: aa1703e1     	mov	x1, x23
 42676dc: 97121c5d     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 42676e0: 39405fe8     	ldrb	w8, [sp, #0x17]
 42676e4: 13001d09     	sxtb	w9, w8
 42676e8: a9402fea     	ldp	x10, x11, [sp]
 42676ec: 7100013f     	cmp	w9, #0x0
 42676f0: 9a984140     	csel	x0, x10, x24, mi
 42676f4: 9a884161     	csel	x1, x11, x8, mi
 42676f8: 97375d19     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 42676fc: 34001120     	cbz	w0, 0x4267920 <_ChromeMain+0x4262684>
 4267700: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4267704: 36f803a8     	tbz	w8, #0x1f, 0x4267778 <_ChromeMain+0x42624dc>
 4267708: a9400be1     	ldp	x1, x2, [sp]
 426770c: 910143e0     	add	x0, sp, #0x50
 4267710: 96f6c2c2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4267714: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4267718: 37f80268     	tbnz	w8, #0x1f, 0x4267764 <_ChromeMain+0x42624c8>
 426771c: 39819fe9     	ldrsb	x9, [sp, #0x67]
 4267720: a9452be8     	ldp	x8, x10, [sp, #0x50]
 4267724: f100013f     	cmp	x9, #0x0
 4267728: 9a994108     	csel	x8, x8, x25, mi
 426772c: 7100013f     	cmp	w9, #0x0
 4267730: 9a894149     	csel	x9, x10, x9, mi
 4267734: f1001d3f     	cmp	x9, #0x7
 4267738: 54fff300     	b.eq	0x4267598 <_ChromeMain+0x42622fc>
 426773c: f100213f     	cmp	x9, #0x8
 4267740: 54fff363     	b.lo	0x42675ac <_ChromeMain+0x4262310>
 4267744: f940010a     	ldr	x10, [x8]
 4267748: d28e4a0b     	mov	x11, #0x7250            ; =29264
 426774c: f2accdeb     	movk	x11, #0x666f, lsl #16
 4267750: f2cd8d2b     	movk	x11, #0x6c69, lsl #32
 4267754: f2e40cab     	movk	x11, #0x2065, lsl #48
 4267758: eb0b015f     	cmp	x10, x11
 426775c: 54fff3a0     	b.eq	0x42675d0 <_ChromeMain+0x4262334>
 4267760: 17ffff93     	b	0x42675ac <_ChromeMain+0x4262310>
 4267764: f94003e0     	ldr	x0, [sp]
 4267768: f9400be8     	ldr	x8, [sp, #0x10]
 426776c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267770: 96f685d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267774: 17ffffea     	b	0x426771c <_ChromeMain+0x4262480>
 4267778: 3dc003e0     	ldr	q0, [sp]
 426777c: 3d8017e0     	str	q0, [sp, #0x50]
 4267780: f9400be8     	ldr	x8, [sp, #0x10]
 4267784: f90033e8     	str	x8, [sp, #0x60]
 4267788: 17ffffe5     	b	0x426771c <_ChromeMain+0x4262480>
 426778c: 94f6856a     	bl	0x8008d34 <_ChromeMain+0x8003a98>
 4267790: b9400008     	ldr	w8, [x0]
 4267794: 7100051f     	cmp	w8, #0x1
 4267798: 1a9f16e8     	csinc	w8, w23, wzr, ne
 426779c: 390002a8     	strb	w8, [x21]
 42677a0: 14000019     	b	0x4267804 <_ChromeMain+0x4262568>
 42677a4: 94f68564     	bl	0x8008d34 <_ChromeMain+0x8003a98>
 42677a8: b9400008     	ldr	w8, [x0]
 42677ac: 7100051f     	cmp	w8, #0x1
 42677b0: 1a9f17e8     	cset	w8, eq
 42677b4: 39406269     	ldrb	w9, [x19, #0x18]
 42677b8: 2a080128     	orr	w8, w9, w8
 42677bc: 39006268     	strb	w8, [x19, #0x18]
 42677c0: f9400668     	ldr	x8, [x19, #0x8]
 42677c4: 8b080908     	add	x8, x8, x8, lsl #2
 42677c8: d37ced08     	lsl	x8, x8, #4
 42677cc: b4000188     	cbz	x8, 0x42677fc <_ChromeMain+0x4262560>
 42677d0: f9400260     	ldr	x0, [x19]
 42677d4: 9344fd09     	asr	x9, x8, #4
 42677d8: b202e7ea     	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 42677dc: f29999aa     	movk	x10, #0xcccd
 42677e0: 9b0a7d29     	mul	x9, x9, x10
 42677e4: dac01129     	clz	x9, x9
 42677e8: d37ff929     	lsl	x9, x9, #1
 42677ec: 8b080001     	add	x1, x0, x8
 42677f0: d27f1522     	eor	x2, x9, #0x7e
 42677f4: 52800023     	mov	w3, #0x1                ; =1
 42677f8: 940002d2     	bl	0x4268340 <_ChromeMain+0x42630a4>
 42677fc: aa1403e0     	mov	x0, x20
 4267800: 95121830     	bl	0x86ed8c0 <_ChromeMain+0x86e8624>
 4267804: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 4267808: 37f80128     	tbnz	w8, #0x1f, 0x426782c <_ChromeMain+0x4262590>
 426780c: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4267810: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4267814: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 4267818: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 426781c: a94967fa     	ldp	x26, x25, [sp, #0x90]
 4267820: a9486ffc     	ldp	x28, x27, [sp, #0x80]
 4267824: 910383ff     	add	sp, sp, #0xe0
 4267828: d65f03c0     	ret
 426782c: f94037e0     	ldr	x0, [sp, #0x68]
 4267830: f9403fe8     	ldr	x8, [sp, #0x78]
 4267834: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267838: 96f685a0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426783c: 17fffff4     	b	0x426780c <_ChromeMain+0x4262570>
 4267840: 97ff9a05     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4267844: d1014000     	sub	x0, x0, #0x50
 4267848: b10142d6     	adds	x22, x22, #0x50
 426784c: 54000500     	b.eq	0x42678ec <_ChromeMain+0x4262650>
 4267850: b5ffff80     	cbnz	x0, 0x4267840 <_ChromeMain+0x42625a4>
 4267854: d4200020     	brk	#0x1
 4267858: 910003e1     	mov	x1, sp
 426785c: aa1303e0     	mov	x0, x19
 4267860: 94000c69     	bl	0x426aa04 <_ChromeMain+0x4265768>
 4267864: f9400268     	ldr	x8, [x19]
 4267868: 17ffff80     	b	0x4267668 <_ChromeMain+0x42623cc>
 426786c: 14000014     	b	0x42678bc <_ChromeMain+0x4262620>
 4267870: aa0003f5     	mov	x21, x0
 4267874: 14000016     	b	0x42678cc <_ChromeMain+0x4262630>
 4267878: 14000011     	b	0x42678bc <_ChromeMain+0x4262620>
 426787c: 14000001     	b	0x4267880 <_ChromeMain+0x42625e4>
 4267880: aa0003f5     	mov	x21, x0
 4267884: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4267888: 36f801c8     	tbz	w8, #0x1f, 0x42678c0 <_ChromeMain+0x4262624>
 426788c: f9402be0     	ldr	x0, [sp, #0x50]
 4267890: f94033e8     	ldr	x8, [sp, #0x60]
 4267894: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267898: 96f68588     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426789c: 14000009     	b	0x42678c0 <_ChromeMain+0x4262624>
 42678a0: f94037e0     	ldr	x0, [sp, #0x68]
 42678a4: f9403fe8     	ldr	x8, [sp, #0x78]
 42678a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42678ac: 96f68583     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42678b0: 14000009     	b	0x42678d4 <_ChromeMain+0x4262638>
 42678b4: 14000002     	b	0x42678bc <_ChromeMain+0x4262620>
 42678b8: 14000001     	b	0x42678bc <_ChromeMain+0x4262620>
 42678bc: aa0003f5     	mov	x21, x0
 42678c0: b4000074     	cbz	x20, 0x42678cc <_ChromeMain+0x4262630>
 42678c4: aa1403e0     	mov	x0, x20
 42678c8: 951217fe     	bl	0x86ed8c0 <_ChromeMain+0x86e8624>
 42678cc: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 42678d0: 37fffe88     	tbnz	w8, #0x1f, 0x42678a0 <_ChromeMain+0x4262604>
 42678d4: f9400274     	ldr	x20, [x19]
 42678d8: b4000174     	cbz	x20, 0x4267904 <_ChromeMain+0x4262668>
 42678dc: f9400668     	ldr	x8, [x19, #0x8]
 42678e0: 8b080909     	add	x9, x8, x8, lsl #2
 42678e4: d37ced29     	lsl	x9, x9, #4
 42678e8: b5000129     	cbnz	x9, 0x426790c <_ChromeMain+0x4262670>
 42678ec: f900067f     	str	xzr, [x19, #0x8]
 42678f0: f9400a68     	ldr	x8, [x19, #0x10]
 42678f4: 8b080908     	add	x8, x8, x8, lsl #2
 42678f8: d37ced01     	lsl	x1, x8, #4
 42678fc: aa1403e0     	mov	x0, x20
 4267900: 96f6856e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267904: aa1503e0     	mov	x0, x21
 4267908: 94f66eff     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 426790c: 8b140129     	add	x9, x9, x20
 4267910: d1014120     	sub	x0, x9, #0x50
 4267914: 928009e9     	mov	x9, #-0x50              ; =-80
 4267918: 9b097d16     	mul	x22, x8, x9
 426791c: 17ffffcd     	b	0x4267850 <_ChromeMain+0x42625b4>
 4267920: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4267924: f90033ff     	str	xzr, [sp, #0x60]
 4267928: 17ffff7b     	b	0x4267714 <_ChromeMain+0x4262478>
 426792c: aa0003f5     	mov	x21, x0
 4267930: 910003e0     	mov	x0, sp
 4267934: 97ff99c8     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4267938: 17ffffd3     	b	0x4267884 <_ChromeMain+0x42625e8>
