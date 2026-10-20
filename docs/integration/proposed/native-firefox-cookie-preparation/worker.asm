
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4260740: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4260744: a90167fa     	stp	x26, x25, [sp, #0x10]
 4260748: a9025ff8     	stp	x24, x23, [sp, #0x20]
 426074c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4260750: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4260754: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4260758: 910143fd     	add	x29, sp, #0x50
 426075c: d11a03ff     	sub	sp, sp, #0x680
 4260760: aa0003f5     	mov	x21, x0
 4260764: aa0803f3     	mov	x19, x8
 4260768: 9004ee48     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426076c: f940f908     	ldr	x8, [x8, #0x1f0]
 4260770: f9400108     	ldr	x8, [x8]
 4260774: f81983a8     	stur	x8, [x29, #-0x68]
 4260778: 6f00e400     	movi.2d	v0, #0000000000000000
 426077c: aa1303f4     	mov	x20, x19
 4260780: 3c810e80     	str	q0, [x20, #0x10]!
 4260784: f900127f     	str	xzr, [x19, #0x20]
 4260788: 3d800260     	str	q0, [x19]
 426078c: f90193ff     	str	xzr, [sp, #0x320]
 4260790: f9018fff     	str	xzr, [sp, #0x318]
 4260794: f90197ff     	str	xzr, [sp, #0x328]
 4260798: 90046541     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426079c: 91050821     	add	x1, x1, #0x142
 42607a0: 910c63e8     	add	x8, sp, #0x318
 42607a4: 528001c2     	mov	w2, #0xe                ; =14
 42607a8: 9750e31b     	bl	0x1699414 <_ChromeMain+0x1694178>
 42607ac: 910c63e0     	add	x0, sp, #0x318
 42607b0: 977f0f24     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 42607b4: 36000900     	tbz	w0, #0x0, 0x42608d4 <_ChromeMain+0x425b638>
 42607b8: f90187ff     	str	xzr, [sp, #0x308]
 42607bc: f90183ff     	str	xzr, [sp, #0x300]
 42607c0: f9018bff     	str	xzr, [sp, #0x310]
 42607c4: d0047360     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 42607c8: 91178c00     	add	x0, x0, #0x5e3
 42607cc: 910c03e2     	add	x2, sp, #0x300
 42607d0: 52800141     	mov	w1, #0xa                ; =10
 42607d4: 97b8a23f     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 42607d8: 34000340     	cbz	w0, 0x4260840 <_ChromeMain+0x425b5a4>
 42607dc: a91f7fff     	stp	xzr, xzr, [sp, #0x1f0]
 42607e0: f90103ff     	str	xzr, [sp, #0x200]
 42607e4: 90046556     	adrp	x22, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42607e8: 91050ad6     	add	x22, x22, #0x142
 42607ec: 9107c3e8     	add	x8, sp, #0x1f0
 42607f0: aa1503e0     	mov	x0, x21
 42607f4: aa1603e1     	mov	x1, x22
 42607f8: 528001c2     	mov	w2, #0xe                ; =14
 42607fc: 9750e306     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260800: f901bfff     	str	xzr, [sp, #0x378]
 4260804: f901bbff     	str	xzr, [sp, #0x370]
 4260808: f901c3ff     	str	xzr, [sp, #0x380]
 426080c: 910dc3e8     	add	x8, sp, #0x370
 4260810: 910c03e0     	add	x0, sp, #0x300
 4260814: aa1603e1     	mov	x1, x22
 4260818: 528001c2     	mov	w2, #0xe                ; =14
 426081c: 9750e2fe     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260820: 9107c3e0     	add	x0, sp, #0x1f0
 4260824: 910dc3e1     	add	x1, sp, #0x370
 4260828: 9516a866     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 426082c: 35000960     	cbnz	w0, 0x4260958 <_ChromeMain+0x425b6bc>
 4260830: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4260834: 37f807e8     	tbnz	w8, #0x1f, 0x4260930 <_ChromeMain+0x425b694>
 4260838: 39c81fe8     	ldrsb	w8, [sp, #0x207]
 426083c: 37f80848     	tbnz	w8, #0x1f, 0x4260944 <_ChromeMain+0x425b6a8>
 4260840: 90056548     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4260844: b940b108     	ldr	w8, [x8, #0xb0]
 4260848: 7100091f     	cmp	w8, #0x2
 426084c: 540001ec     	b.gt	0x4260888 <_ChromeMain+0x425b5ec>
 4260850: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260854: 912acc21     	add	x1, x1, #0xab3
 4260858: 911103f3     	add	x19, sp, #0x440
 426085c: 911103e0     	add	x0, sp, #0x440
 4260860: 52801ba2     	mov	w2, #0xdd               ; =221
 4260864: 52800043     	mov	w3, #0x2                ; =2
 4260868: 970ea239     	bl	0x60914c <_ChromeMain+0x603eb0>
 426086c: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260870: 912bec21     	add	x1, x1, #0xafb
 4260874: 91004260     	add	x0, x19, #0x10
 4260878: 52800562     	mov	w2, #0x2b               ; =43
 426087c: 96f71310     	bl	0x254bc <_ChromeMain+0x20220>
 4260880: 911103e0     	add	x0, sp, #0x440
 4260884: 970ea1ff     	bl	0x609080 <_ChromeMain+0x603de4>
 4260888: 39cc5fe8     	ldrsb	w8, [sp, #0x317]
 426088c: 36f8d588     	tbz	w8, #0x1f, 0x426233c <_ChromeMain+0x425d0a0>
 4260890: f94187e8     	ldr	x8, [sp, #0x308]
 4260894: b4000168     	cbz	x8, 0x42608c0 <_ChromeMain+0x425b624>
 4260898: 910c03e0     	add	x0, sp, #0x300
 426089c: 97c035a3     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 42608a0: 39cc5fe8     	ldrsb	w8, [sp, #0x317]
 42608a4: 340000c0     	cbz	w0, 0x42608bc <_ChromeMain+0x425b620>
 42608a8: 36f801a8     	tbz	w8, #0x1f, 0x42608dc <_ChromeMain+0x425b640>
 42608ac: f94183e8     	ldr	x8, [sp, #0x300]
 42608b0: 3900011f     	strb	wzr, [x8]
 42608b4: f90187ff     	str	xzr, [sp, #0x308]
 42608b8: 394c5fe8     	ldrb	w8, [sp, #0x317]
 42608bc: 36380108     	tbz	w8, #0x7, 0x42608dc <_ChromeMain+0x425b640>
 42608c0: f94183e0     	ldr	x0, [sp, #0x300]
 42608c4: f9418be8     	ldr	x8, [sp, #0x310]
 42608c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42608cc: 96f6a17b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42608d0: 14000003     	b	0x42608dc <_ChromeMain+0x425b640>
 42608d4: 52800028     	mov	w8, #0x1                ; =1
 42608d8: 39000268     	strb	w8, [x19]
 42608dc: 39ccbfe8     	ldrsb	w8, [sp, #0x32f]
 42608e0: 37f801e8     	tbnz	w8, #0x1f, 0x426091c <_ChromeMain+0x425b680>
 42608e4: f85983a8     	ldur	x8, [x29, #-0x68]
 42608e8: 9004ee49     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42608ec: f940f929     	ldr	x9, [x9, #0x1f0]
 42608f0: f9400129     	ldr	x9, [x9]
 42608f4: eb08013f     	cmp	x9, x8
 42608f8: 540037c1     	b.ne	0x4260ff0 <_ChromeMain+0x425bd54>
 42608fc: 911a03ff     	add	sp, sp, #0x680
 4260900: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4260904: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4260908: a94357f6     	ldp	x22, x21, [sp, #0x30]
 426090c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4260910: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4260914: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4260918: d65f03c0     	ret
 426091c: f9418fe0     	ldr	x0, [sp, #0x318]
 4260920: f94197e8     	ldr	x8, [sp, #0x328]
 4260924: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260928: 96f6a164     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426092c: 17ffffee     	b	0x42608e4 <_ChromeMain+0x425b648>
 4260930: f941bbe0     	ldr	x0, [sp, #0x370]
 4260934: f941c3e8     	ldr	x8, [sp, #0x380]
 4260938: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426093c: 96f6a15f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260940: 17ffffbe     	b	0x4260838 <_ChromeMain+0x425b59c>
 4260944: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260948: f94103e8     	ldr	x8, [sp, #0x200]
 426094c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260950: 96f6a15a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260954: 17ffffbb     	b	0x4260840 <_ChromeMain+0x425b5a4>
 4260958: 9107c3f8     	add	x24, sp, #0x1f0
 426095c: 911103f9     	add	x25, sp, #0x440
 4260960: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4260964: f81703bf     	stur	xzr, [x29, #-0x90]
 4260968: 528001c8     	mov	w8, #0xe                ; =14
 426096c: f90223f6     	str	x22, [sp, #0x440]
 4260970: f90227e8     	str	x8, [sp, #0x448]
 4260974: f0053228     	adrp	x8, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4260978: d503201f     	nop
 426097c: 3dc0c100     	ldr	q0, [x8, #0x300]
 4260980: 3d809b00     	str	q0, [x24, #0x260]
 4260984: d10283b7     	sub	x23, x29, #0xa0
 4260988: d10283a8     	sub	x8, x29, #0xa0
 426098c: 911103e0     	add	x0, sp, #0x440
 4260990: 52800041     	mov	w1, #0x2                ; =2
 4260994: 97102870     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4260998: f90227ff     	str	xzr, [sp, #0x448]
 426099c: f90223ff     	str	xzr, [sp, #0x440]
 42609a0: f9022bff     	str	xzr, [sp, #0x450]
 42609a4: 389773a8     	ldursb	x8, [x29, #-0x89]
 42609a8: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42609ac: f100011f     	cmp	x8, #0x0
 42609b0: 9a974121     	csel	x1, x9, x23, mi
 42609b4: 7100011f     	cmp	w8, #0x0
 42609b8: 9a884142     	csel	x2, x10, x8, mi
 42609bc: 911103e8     	add	x8, sp, #0x440
 42609c0: aa1503e0     	mov	x0, x21
 42609c4: 9750e294     	bl	0x1699414 <_ChromeMain+0x1694178>
 42609c8: 911103e0     	add	x0, sp, #0x440
 42609cc: 977f0e9d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 42609d0: 35000100     	cbnz	w0, 0x42609f0 <_ChromeMain+0x425b754>
 42609d4: 52800077     	mov	w23, #0x3               ; =3
 42609d8: 14000016     	b	0x4260a30 <_ChromeMain+0x425b794>
 42609dc: f94223e0     	ldr	x0, [sp, #0x440]
 42609e0: f9422be8     	ldr	x8, [sp, #0x450]
 42609e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42609e8: 96f6a134     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42609ec: 14000013     	b	0x4260a38 <_ChromeMain+0x425b79c>
 42609f0: 389773a8     	ldursb	x8, [x29, #-0x89]
 42609f4: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42609f8: f100011f     	cmp	x8, #0x0
 42609fc: 9a974121     	csel	x1, x9, x23, mi
 4260a00: 7100011f     	cmp	w8, #0x0
 4260a04: 9a884142     	csel	x2, x10, x8, mi
 4260a08: d10383a8     	sub	x8, x29, #0xe0
 4260a0c: 910c03e0     	add	x0, sp, #0x300
 4260a10: 9750e281     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260a14: 911103e0     	add	x0, sp, #0x440
 4260a18: d10383a1     	sub	x1, x29, #0xe0
 4260a1c: 9516a7e9     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 4260a20: aa0003f7     	mov	x23, x0
 4260a24: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 4260a28: 37f80588     	tbnz	w8, #0x1f, 0x4260ad8 <_ChromeMain+0x425b83c>
 4260a2c: 520002f7     	eor	w23, w23, #0x1
 4260a30: 39d15fe8     	ldrsb	w8, [sp, #0x457]
 4260a34: 37fffd48     	tbnz	w8, #0x1f, 0x42609dc <_ChromeMain+0x425b740>
 4260a38: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4260a3c: 36f800a8     	tbz	w8, #0x1f, 0x4260a50 <_ChromeMain+0x425b7b4>
 4260a40: f85603a0     	ldur	x0, [x29, #-0xa0]
 4260a44: f85703a8     	ldur	x8, [x29, #-0x90]
 4260a48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260a4c: 96f6a11b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260a50: 71000eff     	cmp	w23, #0x3
 4260a54: 54000040     	b.eq	0x4260a5c <_ChromeMain+0x425b7c0>
 4260a58: 35ffeed7     	cbnz	w23, 0x4260830 <_ChromeMain+0x425b594>
 4260a5c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4260a60: f81703bf     	stur	xzr, [x29, #-0x90]
 4260a64: 528001c8     	mov	w8, #0xe                ; =14
 4260a68: f90223f6     	str	x22, [sp, #0x440]
 4260a6c: f90227e8     	str	x8, [sp, #0x448]
 4260a70: f0053228     	adrp	x8, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4260a74: d503201f     	nop
 4260a78: 3dc0c500     	ldr	q0, [x8, #0x310]
 4260a7c: 3c810320     	stur	q0, [x25, #0x10]
 4260a80: d10283b6     	sub	x22, x29, #0xa0
 4260a84: d10283a8     	sub	x8, x29, #0xa0
 4260a88: 911103e0     	add	x0, sp, #0x440
 4260a8c: 52800041     	mov	w1, #0x2                ; =2
 4260a90: 97102831     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4260a94: f90227ff     	str	xzr, [sp, #0x448]
 4260a98: f90223ff     	str	xzr, [sp, #0x440]
 4260a9c: f9022bff     	str	xzr, [sp, #0x450]
 4260aa0: 389773a8     	ldursb	x8, [x29, #-0x89]
 4260aa4: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4260aa8: f100011f     	cmp	x8, #0x0
 4260aac: 9a964121     	csel	x1, x9, x22, mi
 4260ab0: 7100011f     	cmp	w8, #0x0
 4260ab4: 9a884142     	csel	x2, x10, x8, mi
 4260ab8: 911103e8     	add	x8, sp, #0x440
 4260abc: aa1503e0     	mov	x0, x21
 4260ac0: 9750e255     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260ac4: 911103e0     	add	x0, sp, #0x440
 4260ac8: 977f0e5e     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4260acc: 35000380     	cbnz	w0, 0x4260b3c <_ChromeMain+0x425b8a0>
 4260ad0: 52800075     	mov	w21, #0x3               ; =3
 4260ad4: 1400002a     	b	0x4260b7c <_ChromeMain+0x425b8e0>
 4260ad8: f85203a0     	ldur	x0, [x29, #-0xe0]
 4260adc: f85303a8     	ldur	x8, [x29, #-0xd0]
 4260ae0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260ae4: 96f6a0f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260ae8: 17ffffd1     	b	0x4260a2c <_ChromeMain+0x425b790>
 4260aec: f85203a0     	ldur	x0, [x29, #-0xe0]
 4260af0: f85303a8     	ldur	x8, [x29, #-0xd0]
 4260af4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260af8: 96f6a0f0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260afc: 1400001f     	b	0x4260b78 <_ChromeMain+0x425b8dc>
 4260b00: f941bbe0     	ldr	x0, [sp, #0x370]
 4260b04: f941c3e8     	ldr	x8, [sp, #0x380]
 4260b08: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260b0c: 96f6a0eb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260b10: 14000028     	b	0x4260bb0 <_ChromeMain+0x425b914>
 4260b14: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260b18: f94103e8     	ldr	x8, [sp, #0x200]
 4260b1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260b20: 96f6a0e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260b24: 14000025     	b	0x4260bb8 <_ChromeMain+0x425b91c>
 4260b28: f94223e0     	ldr	x0, [sp, #0x440]
 4260b2c: f9422be8     	ldr	x8, [sp, #0x450]
 4260b30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260b34: 96f6a0e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260b38: 14000013     	b	0x4260b84 <_ChromeMain+0x425b8e8>
 4260b3c: 389773a8     	ldursb	x8, [x29, #-0x89]
 4260b40: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4260b44: f100011f     	cmp	x8, #0x0
 4260b48: 9a964121     	csel	x1, x9, x22, mi
 4260b4c: 7100011f     	cmp	w8, #0x0
 4260b50: 9a884142     	csel	x2, x10, x8, mi
 4260b54: d10383a8     	sub	x8, x29, #0xe0
 4260b58: 910c03e0     	add	x0, sp, #0x300
 4260b5c: 9750e22e     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260b60: 911103e0     	add	x0, sp, #0x440
 4260b64: d10383a1     	sub	x1, x29, #0xe0
 4260b68: 9516a796     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 4260b6c: aa0003f5     	mov	x21, x0
 4260b70: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 4260b74: 37fffbc8     	tbnz	w8, #0x1f, 0x4260aec <_ChromeMain+0x425b850>
 4260b78: 520002b5     	eor	w21, w21, #0x1
 4260b7c: 39d15fe8     	ldrsb	w8, [sp, #0x457]
 4260b80: 37fffd48     	tbnz	w8, #0x1f, 0x4260b28 <_ChromeMain+0x425b88c>
 4260b84: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4260b88: 36f800a8     	tbz	w8, #0x1f, 0x4260b9c <_ChromeMain+0x425b900>
 4260b8c: f85603a0     	ldur	x0, [x29, #-0xa0]
 4260b90: f85703a8     	ldur	x8, [x29, #-0x90]
 4260b94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260b98: 96f6a0c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260b9c: 71000ebf     	cmp	w21, #0x3
 4260ba0: 54000040     	b.eq	0x4260ba8 <_ChromeMain+0x425b90c>
 4260ba4: 35ffe475     	cbnz	w21, 0x4260830 <_ChromeMain+0x425b594>
 4260ba8: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4260bac: 37fffaa8     	tbnz	w8, #0x1f, 0x4260b00 <_ChromeMain+0x425b864>
 4260bb0: 39c81fe8     	ldrsb	w8, [sp, #0x207]
 4260bb4: 37fffb08     	tbnz	w8, #0x1f, 0x4260b14 <_ChromeMain+0x425b878>
 4260bb8: 6f00e400     	movi.2d	v0, #0000000000000000
 4260bbc: ad078300     	stp	q0, q0, [x24, #0xf0]
 4260bc0: ad068300     	stp	q0, q0, [x24, #0xd0]
 4260bc4: ad058300     	stp	q0, q0, [x24, #0xb0]
 4260bc8: ad048300     	stp	q0, q0, [x24, #0x90]
 4260bcc: ad038300     	stp	q0, q0, [x24, #0x70]
 4260bd0: ad028300     	stp	q0, q0, [x24, #0x50]
 4260bd4: ad018300     	stp	q0, q0, [x24, #0x30]
 4260bd8: ad008300     	stp	q0, q0, [x24, #0x10]
 4260bdc: 3d800300     	str	q0, [x24]
 4260be0: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260be4: 9132d821     	add	x1, x1, #0xcb6
 4260be8: 9107c3e0     	add	x0, sp, #0x1f0
 4260bec: 97b6bb57     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 4260bf0: 90046541     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260bf4: 91050821     	add	x1, x1, #0x142
 4260bf8: 910dc3e8     	add	x8, sp, #0x370
 4260bfc: 910c03e0     	add	x0, sp, #0x300
 4260c00: 528001c2     	mov	w2, #0xe                ; =14
 4260c04: 9750e204     	bl	0x1699414 <_ChromeMain+0x1694178>
 4260c08: 9107c3e0     	add	x0, sp, #0x1f0
 4260c0c: 910dc3e1     	add	x1, sp, #0x370
 4260c10: 974c029d     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 4260c14: 36000940     	tbz	w0, #0x0, 0x4260d3c <_ChromeMain+0x425baa0>
 4260c18: f9022bff     	str	xzr, [sp, #0x450]
 4260c1c: f90227ff     	str	xzr, [sp, #0x448]
 4260c20: f9022fff     	str	xzr, [sp, #0x458]
 4260c24: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260c28: 91128821     	add	x1, x1, #0x4a2
 4260c2c: 9107c3e0     	add	x0, sp, #0x1f0
 4260c30: 52800662     	mov	w2, #0x33               ; =51
 4260c34: 52800003     	mov	w3, #0x0                ; =0
 4260c38: 972274b2     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 4260c3c: f90223e0     	str	x0, [sp, #0x440]
 4260c40: 391123ff     	strb	wzr, [sp, #0x448]
 4260c44: 391133ff     	strb	wzr, [sp, #0x44c]
 4260c48: 391143ff     	strb	wzr, [sp, #0x450]
 4260c4c: 391163ff     	strb	wzr, [sp, #0x458]
 4260c50: f9401408     	ldr	x8, [x0, #0x28]
 4260c54: b400dfe8     	cbz	x8, 0x4262850 <_ChromeMain+0x425d5b4>
 4260c58: d004ad42     	adrp	x2, 0xd80a000 <dyld_stub_binder+0xd80a000>
 4260c5c: 912e2842     	add	x2, x2, #0xb8a
 4260c60: 911103e0     	add	x0, sp, #0x440
 4260c64: 52800001     	mov	w1, #0x0                ; =0
 4260c68: 528000a3     	mov	w3, #0x5                ; =5
 4260c6c: 9743204d     	bl	0x1328da0 <_ChromeMain+0x1323b04>
 4260c70: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260c74: 91054442     	add	x2, x2, #0x151
 4260c78: 911103e0     	add	x0, sp, #0x440
 4260c7c: 52800021     	mov	w1, #0x1                ; =1
 4260c80: 52800163     	mov	w3, #0xb                ; =11
 4260c84: 97432047     	bl	0x1328da0 <_ChromeMain+0x1323b04>
 4260c88: 911103e0     	add	x0, sp, #0x440
 4260c8c: 9718be8d     	bl	0x8906c0 <_ChromeMain+0x88b424>
 4260c90: 7101901f     	cmp	w0, #0x64
 4260c94: 1a9f17f5     	cset	w21, eq
 4260c98: 911103e0     	add	x0, sp, #0x440
 4260c9c: 97226faa     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 4260ca0: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4260ca4: 37f80848     	tbnz	w8, #0x1f, 0x4260dac <_ChromeMain+0x425bb10>
 4260ca8: 340004f5     	cbz	w21, 0x4260d44 <_ChromeMain+0x425baa8>
 4260cac: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260cb0: b400dd40     	cbz	x0, 0x4262858 <_ChromeMain+0x425d5bc>
 4260cb4: f90003ff     	str	xzr, [sp]
 4260cb8: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260cbc: 910fbc21     	add	x1, x1, #0x3ef
 4260cc0: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260cc4: 91054442     	add	x2, x2, #0x151
 4260cc8: d004ac95     	adrp	x21, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4260ccc: 9138deb5     	add	x21, x21, #0xe37
 4260cd0: aa1503e3     	mov	x3, x21
 4260cd4: d2800004     	mov	x4, #0x0                ; =0
 4260cd8: d2800005     	mov	x5, #0x0                ; =0
 4260cdc: d2800006     	mov	x6, #0x0                ; =0
 4260ce0: d2800007     	mov	x7, #0x0                ; =0
 4260ce4: 9753c507     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260ce8: 340006e0     	cbz	w0, 0x4260dc4 <_ChromeMain+0x425bb28>
 4260cec: 52800093     	mov	w19, #0x4               ; =4
 4260cf0: 90056548     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4260cf4: b940b108     	ldr	w8, [x8, #0xb0]
 4260cf8: 7100091f     	cmp	w8, #0x2
 4260cfc: 5400048c     	b.gt	0x4260d8c <_ChromeMain+0x425baf0>
 4260d00: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260d04: 912acc21     	add	x1, x1, #0xab3
 4260d08: 911103f4     	add	x20, sp, #0x440
 4260d0c: 911103e0     	add	x0, sp, #0x440
 4260d10: 52801de2     	mov	w2, #0xef               ; =239
 4260d14: 52800043     	mov	w3, #0x2                ; =2
 4260d18: 970ea10d     	bl	0x60914c <_ChromeMain+0x603eb0>
 4260d1c: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260d20: 912de421     	add	x1, x1, #0xb79
 4260d24: 91004280     	add	x0, x20, #0x10
 4260d28: 52800562     	mov	w2, #0x2b               ; =43
 4260d2c: 96f711e4     	bl	0x254bc <_ChromeMain+0x20220>
 4260d30: aa1503e1     	mov	x1, x21
 4260d34: aa1303e2     	mov	x2, x19
 4260d38: 14000012     	b	0x4260d80 <_ChromeMain+0x425bae4>
 4260d3c: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4260d40: 37f802c8     	tbnz	w8, #0x1f, 0x4260d98 <_ChromeMain+0x425bafc>
 4260d44: 90056548     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4260d48: b940b108     	ldr	w8, [x8, #0xb0]
 4260d4c: 7100091f     	cmp	w8, #0x2
 4260d50: 540001ec     	b.gt	0x4260d8c <_ChromeMain+0x425baf0>
 4260d54: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260d58: 912acc21     	add	x1, x1, #0xab3
 4260d5c: 911103f3     	add	x19, sp, #0x440
 4260d60: 911103e0     	add	x0, sp, #0x440
 4260d64: 52801ca2     	mov	w2, #0xe5               ; =229
 4260d68: 52800043     	mov	w3, #0x2                ; =2
 4260d6c: 970ea0f8     	bl	0x60914c <_ChromeMain+0x603eb0>
 4260d70: f004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260d74: 912c9c21     	add	x1, x1, #0xb27
 4260d78: 91004260     	add	x0, x19, #0x10
 4260d7c: 52800602     	mov	w2, #0x30               ; =48
 4260d80: 96f711cf     	bl	0x254bc <_ChromeMain+0x20220>
 4260d84: 911103e0     	add	x0, sp, #0x440
 4260d88: 970ea0be     	bl	0x609080 <_ChromeMain+0x603de4>
 4260d8c: 9107c3e0     	add	x0, sp, #0x1f0
 4260d90: 97683915     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 4260d94: 17fffebd     	b	0x4260888 <_ChromeMain+0x425b5ec>
 4260d98: f941bbe0     	ldr	x0, [sp, #0x370]
 4260d9c: f941c3e8     	ldr	x8, [sp, #0x380]
 4260da0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260da4: 96f6a045     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260da8: 17ffffe7     	b	0x4260d44 <_ChromeMain+0x425baa8>
 4260dac: f941bbe0     	ldr	x0, [sp, #0x370]
 4260db0: f941c3e8     	ldr	x8, [sp, #0x380]
 4260db4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4260db8: 96f6a040     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4260dbc: 35fff795     	cbnz	w21, 0x4260cac <_ChromeMain+0x425ba10>
 4260dc0: 17ffffe1     	b	0x4260d44 <_ChromeMain+0x425baa8>
 4260dc4: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260dc8: b400d4e0     	cbz	x0, 0x4262864 <_ChromeMain+0x425d5c8>
 4260dcc: f90003ff     	str	xzr, [sp]
 4260dd0: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260dd4: 910fbc21     	add	x1, x1, #0x3ef
 4260dd8: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260ddc: 91054442     	add	x2, x2, #0x151
 4260de0: f004ac75     	adrp	x21, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 4260de4: 912582b5     	add	x21, x21, #0x960
 4260de8: aa1503e3     	mov	x3, x21
 4260dec: d2800004     	mov	x4, #0x0                ; =0
 4260df0: d2800005     	mov	x5, #0x0                ; =0
 4260df4: d2800006     	mov	x6, #0x0                ; =0
 4260df8: d2800007     	mov	x7, #0x0                ; =0
 4260dfc: 9753c4c1     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260e00: 34000060     	cbz	w0, 0x4260e0c <_ChromeMain+0x425bb70>
 4260e04: 528000b3     	mov	w19, #0x5               ; =5
 4260e08: 17ffffba     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 4260e0c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260e10: b400d300     	cbz	x0, 0x4262870 <_ChromeMain+0x425d5d4>
 4260e14: f90003ff     	str	xzr, [sp]
 4260e18: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260e1c: 910fbc21     	add	x1, x1, #0x3ef
 4260e20: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260e24: 91054442     	add	x2, x2, #0x151
 4260e28: b004ac75     	adrp	x21, 0xd7ed000 <dyld_stub_binder+0xd7ed000>
 4260e2c: 910532b5     	add	x21, x21, #0x14c
 4260e30: aa1503e3     	mov	x3, x21
 4260e34: d2800004     	mov	x4, #0x0                ; =0
 4260e38: d2800005     	mov	x5, #0x0                ; =0
 4260e3c: d2800006     	mov	x6, #0x0                ; =0
 4260e40: d2800007     	mov	x7, #0x0                ; =0
 4260e44: 9753c4af     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260e48: 35fff520     	cbnz	w0, 0x4260cec <_ChromeMain+0x425ba50>
 4260e4c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260e50: b400d160     	cbz	x0, 0x426287c <_ChromeMain+0x425d5e0>
 4260e54: f90003ff     	str	xzr, [sp]
 4260e58: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260e5c: 910fbc21     	add	x1, x1, #0x3ef
 4260e60: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260e64: 91054442     	add	x2, x2, #0x151
 4260e68: 9004acf5     	adrp	x21, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 4260e6c: 912dcab5     	add	x21, x21, #0xb72
 4260e70: aa1503e3     	mov	x3, x21
 4260e74: d2800004     	mov	x4, #0x0                ; =0
 4260e78: d2800005     	mov	x5, #0x0                ; =0
 4260e7c: d2800006     	mov	x6, #0x0                ; =0
 4260e80: d2800007     	mov	x7, #0x0                ; =0
 4260e84: 9753c49f     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260e88: 35fff320     	cbnz	w0, 0x4260cec <_ChromeMain+0x425ba50>
 4260e8c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260e90: b400cfc0     	cbz	x0, 0x4262888 <_ChromeMain+0x425d5ec>
 4260e94: f90003ff     	str	xzr, [sp]
 4260e98: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260e9c: 910fbc21     	add	x1, x1, #0x3ef
 4260ea0: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260ea4: 91054442     	add	x2, x2, #0x151
 4260ea8: f004b315     	adrp	x21, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 4260eac: 912c6ab5     	add	x21, x21, #0xb1a
 4260eb0: aa1503e3     	mov	x3, x21
 4260eb4: d2800004     	mov	x4, #0x0                ; =0
 4260eb8: d2800005     	mov	x5, #0x0                ; =0
 4260ebc: d2800006     	mov	x6, #0x0                ; =0
 4260ec0: d2800007     	mov	x7, #0x0                ; =0
 4260ec4: 9753c48f     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260ec8: 34000060     	cbz	w0, 0x4260ed4 <_ChromeMain+0x425bc38>
 4260ecc: 528000d3     	mov	w19, #0x6               ; =6
 4260ed0: 17ffff88     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 4260ed4: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260ed8: b400cde0     	cbz	x0, 0x4262894 <_ChromeMain+0x425d5f8>
 4260edc: f90003ff     	str	xzr, [sp]
 4260ee0: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260ee4: 910fbc21     	add	x1, x1, #0x3ef
 4260ee8: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260eec: 91054442     	add	x2, x2, #0x151
 4260ef0: f004c5f5     	adrp	x21, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260ef4: 912d62b5     	add	x21, x21, #0xb58
 4260ef8: aa1503e3     	mov	x3, x21
 4260efc: d2800004     	mov	x4, #0x0                ; =0
 4260f00: d2800005     	mov	x5, #0x0                ; =0
 4260f04: d2800006     	mov	x6, #0x0                ; =0
 4260f08: d2800007     	mov	x7, #0x0                ; =0
 4260f0c: 9753c47d     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260f10: 34000060     	cbz	w0, 0x4260f1c <_ChromeMain+0x425bc80>
 4260f14: 52800193     	mov	w19, #0xc               ; =12
 4260f18: 17ffff76     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 4260f1c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260f20: b400cc00     	cbz	x0, 0x42628a0 <_ChromeMain+0x425d604>
 4260f24: f90003ff     	str	xzr, [sp]
 4260f28: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260f2c: 910fbc21     	add	x1, x1, #0x3ef
 4260f30: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260f34: 91054442     	add	x2, x2, #0x151
 4260f38: 9004c5f5     	adrp	x21, 0xdb1c000 <dyld_stub_binder+0xdb1c000>
 4260f3c: 911ff2b5     	add	x21, x21, #0x7fc
 4260f40: aa1503e3     	mov	x3, x21
 4260f44: d2800004     	mov	x4, #0x0                ; =0
 4260f48: d2800005     	mov	x5, #0x0                ; =0
 4260f4c: d2800006     	mov	x6, #0x0                ; =0
 4260f50: d2800007     	mov	x7, #0x0                ; =0
 4260f54: 9753c46b     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260f58: 35fffde0     	cbnz	w0, 0x4260f14 <_ChromeMain+0x425bc78>
 4260f5c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260f60: b400cae0     	cbz	x0, 0x42628bc <_ChromeMain+0x425d620>
 4260f64: f90003ff     	str	xzr, [sp]
 4260f68: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260f6c: 910fbc21     	add	x1, x1, #0x3ef
 4260f70: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260f74: 91054442     	add	x2, x2, #0x151
 4260f78: f004c5f6     	adrp	x22, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260f7c: 912d96d6     	add	x22, x22, #0xb65
 4260f80: aa1603e3     	mov	x3, x22
 4260f84: d2800004     	mov	x4, #0x0                ; =0
 4260f88: d2800005     	mov	x5, #0x0                ; =0
 4260f8c: d2800006     	mov	x6, #0x0                ; =0
 4260f90: d2800007     	mov	x7, #0x0                ; =0
 4260f94: 9753c45b     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260f98: 34000080     	cbz	w0, 0x4260fa8 <_ChromeMain+0x425bd0c>
 4260f9c: 52800113     	mov	w19, #0x8               ; =8
 4260fa0: aa1603f5     	mov	x21, x22
 4260fa4: 17ffff53     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 4260fa8: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4260fac: b400c900     	cbz	x0, 0x42628cc <_ChromeMain+0x425d630>
 4260fb0: f90003ff     	str	xzr, [sp]
 4260fb4: 90047e01     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4260fb8: 910fbc21     	add	x1, x1, #0x3ef
 4260fbc: 90046542     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4260fc0: 91054442     	add	x2, x2, #0x151
 4260fc4: f004c5f6     	adrp	x22, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4260fc8: 912dbad6     	add	x22, x22, #0xb6e
 4260fcc: aa1603e3     	mov	x3, x22
 4260fd0: d2800004     	mov	x4, #0x0                ; =0
 4260fd4: d2800005     	mov	x5, #0x0                ; =0
 4260fd8: d2800006     	mov	x6, #0x0                ; =0
 4260fdc: d2800007     	mov	x7, #0x0                ; =0
 4260fe0: 9753c448     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4260fe4: 34000460     	cbz	w0, 0x4261070 <_ChromeMain+0x425bdd4>
 4260fe8: 52800153     	mov	w19, #0xa               ; =10
 4260fec: 17ffffed     	b	0x4260fa0 <_ChromeMain+0x425bd04>
 4260ff0: 94f68cdc     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4260ff4: 9106e3e0     	add	x0, sp, #0x1b8
 4260ff8: 9110a3e1     	add	x1, sp, #0x428
 4260ffc: 911023e2     	add	x2, sp, #0x408
 4261000: 94f9ae75     	bl	0x80cc9d4 <_ChromeMain+0x80c7738>
 4261004: 39473fe8     	ldrb	w8, [sp, #0x1cf]
 4261008: 140000fc     	b	0x42613f8 <_ChromeMain+0x425c15c>
 426100c: 910d43e0     	add	x0, sp, #0x350
 4261010: 9106e3e1     	add	x1, sp, #0x1b8
 4261014: 9110a3e2     	add	x2, sp, #0x428
 4261018: 94f9ae6f     	bl	0x80cc9d4 <_ChromeMain+0x80c7738>
 426101c: 394d9fe8     	ldrb	w8, [sp, #0x367]
 4261020: f941abe9     	ldr	x9, [sp, #0x350]
 4261024: 140000cb     	b	0x4261350 <_ChromeMain+0x425c0b4>
 4261028: d10383a0     	sub	x0, x29, #0xe0
 426102c: 910d43e1     	add	x1, sp, #0x350
 4261030: 9106e3e2     	add	x2, sp, #0x1b8
 4261034: 94f9ae68     	bl	0x80cc9d4 <_ChromeMain+0x80c7738>
 4261038: 385373a8     	ldurb	w8, [x29, #-0xc9]
 426103c: 14000094     	b	0x426128c <_ChromeMain+0x425bff0>
 4261040: d10283a0     	sub	x0, x29, #0xa0
 4261044: d10383a1     	sub	x1, x29, #0xe0
 4261048: 910d43e2     	add	x2, sp, #0x350
 426104c: 94f9ae62     	bl	0x80cc9d4 <_ChromeMain+0x80c7738>
 4261050: 385773a8     	ldurb	w8, [x29, #-0x89]
 4261054: 14000061     	b	0x42611d8 <_ChromeMain+0x425bf3c>
 4261058: 910dc3e0     	add	x0, sp, #0x370
 426105c: d10283a1     	sub	x1, x29, #0xa0
 4261060: d10383a2     	sub	x2, x29, #0xe0
 4261064: 94f9ae5c     	bl	0x80cc9d4 <_ChromeMain+0x80c7738>
 4261068: 394e1fe8     	ldrb	w8, [sp, #0x387]
 426106c: 1400002d     	b	0x4261120 <_ChromeMain+0x425be84>
 4261070: a91dffff     	stp	xzr, xzr, [sp, #0x1d8]
 4261074: f900f7ff     	str	xzr, [sp, #0x1e8]
 4261078: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426107c: 912e9508     	add	x8, x8, #0xba5
 4261080: 52800889     	mov	w9, #0x44               ; =68
 4261084: f90223e8     	str	x8, [sp, #0x440]
 4261088: f90227e9     	str	x9, [sp, #0x448]
 426108c: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261090: 912fa908     	add	x8, x8, #0xbea
 4261094: 528002c9     	mov	w9, #0x16               ; =22
 4261098: f9022be8     	str	x8, [sp, #0x450]
 426109c: f9022fe9     	str	x9, [sp, #0x458]
 42610a0: 9004b868     	adrp	x8, 0xd96d000 <dyld_stub_binder+0xd96d000>
 42610a4: 9125e108     	add	x8, x8, #0x978
 42610a8: 52800109     	mov	w9, #0x8                ; =8
 42610ac: a93627a8     	stp	x8, x9, [x29, #-0xa0]
 42610b0: f940fbe0     	ldr	x0, [sp, #0x1f0]
 42610b4: b40001c0     	cbz	x0, 0x42610ec <_ChromeMain+0x425be50>
 42610b8: f90003ff     	str	xzr, [sp]
 42610bc: f0047de1     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 42610c0: 910fbc21     	add	x1, x1, #0x3ef
 42610c4: f0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42610c8: 91054442     	add	x2, x2, #0x151
 42610cc: 9004b863     	adrp	x3, 0xd96d000 <dyld_stub_binder+0xd96d000>
 42610d0: 9125e063     	add	x3, x3, #0x978
 42610d4: d2800004     	mov	x4, #0x0                ; =0
 42610d8: d2800005     	mov	x5, #0x0                ; =0
 42610dc: d2800006     	mov	x6, #0x0                ; =0
 42610e0: d2800007     	mov	x7, #0x0                ; =0
 42610e4: 9753c407     	bl	0x1752100 <_ChromeMain+0x174ce64>
 42610e8: 34fffb80     	cbz	w0, 0x4261058 <_ChromeMain+0x425bdbc>
 42610ec: 52800068     	mov	w8, #0x3                ; =3
 42610f0: 390e1fe8     	strb	w8, [sp, #0x387]
 42610f4: 910dc3e8     	add	x8, sp, #0x370
 42610f8: b2400509     	orr	x9, x8, #0x3
 42610fc: d004c5ea     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261100: 9130054a     	add	x10, x10, #0xc01
 4261104: eb0a013f     	cmp	x9, x10
 4261108: fa4a8102     	ccmp	x8, x10, #0x2, hi
 426110c: 54007069     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 4261110: 5286a648     	mov	w8, #0x3532             ; =13618
 4261114: 72a006c8     	movk	w8, #0x36, lsl #16
 4261118: b90373e8     	str	w8, [sp, #0x370]
 426111c: 52800068     	mov	w8, #0x3                ; =3
 4261120: 13001d09     	sxtb	w9, w8
 4261124: 7100013f     	cmp	w9, #0x0
 4261128: 910dc3e9     	add	x9, sp, #0x370
 426112c: f941bbea     	ldr	x10, [sp, #0x370]
 4261130: f941bfeb     	ldr	x11, [sp, #0x378]
 4261134: 9a894149     	csel	x9, x10, x9, mi
 4261138: 2a0803e8     	mov	w8, w8
 426113c: 9a884168     	csel	x8, x11, x8, mi
 4261140: 9004ad57     	adrp	x23, 0xd809000 <dyld_stub_binder+0xd809000>
 4261144: 910052f7     	add	x23, x23, #0x14
 4261148: f90233e9     	str	x9, [sp, #0x460]
 426114c: f90237e8     	str	x8, [sp, #0x468]
 4261150: 52800048     	mov	w8, #0x2                ; =2
 4261154: f9023bf7     	str	x23, [sp, #0x470]
 4261158: f9023fe8     	str	x8, [sp, #0x478]
 426115c: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261160: 91301508     	add	x8, x8, #0xc05
 4261164: 52800129     	mov	w9, #0x9                ; =9
 4261168: a93227a8     	stp	x8, x9, [x29, #-0xe0]
 426116c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4261170: f004ac36     	adrp	x22, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 4261174: 9118d2d6     	add	x22, x22, #0x634
 4261178: b40001c0     	cbz	x0, 0x42611b0 <_ChromeMain+0x425bf14>
 426117c: f90003ff     	str	xzr, [sp]
 4261180: f0047de1     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 4261184: 910fbc21     	add	x1, x1, #0x3ef
 4261188: f0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 426118c: 91054442     	add	x2, x2, #0x151
 4261190: d004c5e3     	adrp	x3, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261194: 91301463     	add	x3, x3, #0xc05
 4261198: d2800004     	mov	x4, #0x0                ; =0
 426119c: d2800005     	mov	x5, #0x0                ; =0
 42611a0: d2800006     	mov	x6, #0x0                ; =0
 42611a4: d2800007     	mov	x7, #0x0                ; =0
 42611a8: 9753c3d6     	bl	0x1752100 <_ChromeMain+0x174ce64>
 42611ac: 34fff4a0     	cbz	w0, 0x4261040 <_ChromeMain+0x425bda4>
 42611b0: 52800028     	mov	w8, #0x1                ; =1
 42611b4: 381773a8     	sturb	w8, [x29, #-0x89]
 42611b8: d10283a8     	sub	x8, x29, #0xa0
 42611bc: b2400109     	orr	x9, x8, #0x1
 42611c0: eb16013f     	cmp	x9, x22
 42611c4: fa568102     	ccmp	x8, x22, #0x2, hi
 42611c8: 54006a89     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 42611cc: 52800608     	mov	w8, #0x30               ; =48
 42611d0: 781603a8     	sturh	w8, [x29, #-0xa0]
 42611d4: 52800028     	mov	w8, #0x1                ; =1
 42611d8: 13001d09     	sxtb	w9, w8
 42611dc: 7100013f     	cmp	w9, #0x0
 42611e0: d10283a9     	sub	x9, x29, #0xa0
 42611e4: a9762faa     	ldp	x10, x11, [x29, #-0xa0]
 42611e8: 9a894149     	csel	x9, x10, x9, mi
 42611ec: 2a0803e8     	mov	w8, w8
 42611f0: 9a884168     	csel	x8, x11, x8, mi
 42611f4: f90243e9     	str	x9, [sp, #0x480]
 42611f8: f90247e8     	str	x8, [sp, #0x488]
 42611fc: 52800048     	mov	w8, #0x2                ; =2
 4261200: f9024bf7     	str	x23, [sp, #0x490]
 4261204: f9024fe8     	str	x8, [sp, #0x498]
 4261208: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426120c: 91303d08     	add	x8, x8, #0xc0f
 4261210: 52800209     	mov	w9, #0x10               ; =16
 4261214: f901abe8     	str	x8, [sp, #0x350]
 4261218: f901afe9     	str	x9, [sp, #0x358]
 426121c: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4261220: b40001c0     	cbz	x0, 0x4261258 <_ChromeMain+0x425bfbc>
 4261224: f90003ff     	str	xzr, [sp]
 4261228: f0047de1     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 426122c: 910fbc21     	add	x1, x1, #0x3ef
 4261230: f0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4261234: 91054442     	add	x2, x2, #0x151
 4261238: d004c5e3     	adrp	x3, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426123c: 91303c63     	add	x3, x3, #0xc0f
 4261240: d2800004     	mov	x4, #0x0                ; =0
 4261244: d2800005     	mov	x5, #0x0                ; =0
 4261248: d2800006     	mov	x6, #0x0                ; =0
 426124c: d2800007     	mov	x7, #0x0                ; =0
 4261250: 9753c3ac     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4261254: 34ffeea0     	cbz	w0, 0x4261028 <_ChromeMain+0x425bd8c>
 4261258: 52800048     	mov	w8, #0x2                ; =2
 426125c: 381373a8     	sturb	w8, [x29, #-0xc9]
 4261260: d10383a8     	sub	x8, x29, #0xe0
 4261264: b27f0109     	orr	x9, x8, #0x2
 4261268: d004c5ea     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426126c: 9130814a     	add	x10, x10, #0xc20
 4261270: eb0a013f     	cmp	x9, x10
 4261274: fa4a8102     	ccmp	x8, x10, #0x2, hi
 4261278: 54006509     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 426127c: 5284e4e8     	mov	w8, #0x2727             ; =10023
 4261280: 781203a8     	sturh	w8, [x29, #-0xe0]
 4261284: 381223bf     	sturb	wzr, [x29, #-0xde]
 4261288: 52800048     	mov	w8, #0x2                ; =2
 426128c: 13001d09     	sxtb	w9, w8
 4261290: 7100013f     	cmp	w9, #0x0
 4261294: d10383a9     	sub	x9, x29, #0xe0
 4261298: a9722faa     	ldp	x10, x11, [x29, #-0xe0]
 426129c: 9a894149     	csel	x9, x10, x9, mi
 42612a0: 2a0803e8     	mov	w8, w8
 42612a4: 9a884168     	csel	x8, x11, x8, mi
 42612a8: f90253e9     	str	x9, [sp, #0x4a0]
 42612ac: f90257e8     	str	x8, [sp, #0x4a8]
 42612b0: 52800048     	mov	w8, #0x2                ; =2
 42612b4: f9025bf7     	str	x23, [sp, #0x4b0]
 42612b8: f9025fe8     	str	x8, [sp, #0x4b8]
 42612bc: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42612c0: 91308d08     	add	x8, x8, #0xc23
 42612c4: 52800149     	mov	w9, #0xa                ; =10
 42612c8: a91ba7e8     	stp	x8, x9, [sp, #0x1b8]
 42612cc: f940fbe0     	ldr	x0, [sp, #0x1f0]
 42612d0: b40001c0     	cbz	x0, 0x4261308 <_ChromeMain+0x425c06c>
 42612d4: f90003ff     	str	xzr, [sp]
 42612d8: f0047de1     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 42612dc: 910fbc21     	add	x1, x1, #0x3ef
 42612e0: f0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42612e4: 91054442     	add	x2, x2, #0x151
 42612e8: d004c5e3     	adrp	x3, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42612ec: 91308c63     	add	x3, x3, #0xc23
 42612f0: d2800004     	mov	x4, #0x0                ; =0
 42612f4: d2800005     	mov	x5, #0x0                ; =0
 42612f8: d2800006     	mov	x6, #0x0                ; =0
 42612fc: d2800007     	mov	x7, #0x0                ; =0
 4261300: 9753c380     	bl	0x1752100 <_ChromeMain+0x174ce64>
 4261304: 34ffe840     	cbz	w0, 0x426100c <_ChromeMain+0x425bd70>
 4261308: 52800188     	mov	w8, #0xc                ; =12
 426130c: 390d9fe8     	strb	w8, [sp, #0x367]
 4261310: 910d43e8     	add	x8, sp, #0x350
 4261314: 91003109     	add	x9, x8, #0xc
 4261318: eb15013f     	cmp	x9, x21
 426131c: fa558102     	ccmp	x8, x21, #0x2, hi
 4261320: 54005fc9     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 4261324: 528d2a88     	mov	w8, #0x6954             ; =26964
 4261328: 72acada8     	movk	w8, #0x656d, lsl #16
 426132c: b9035be8     	str	w8, [sp, #0x358]
 4261330: f94002a8     	ldr	x8, [x21]
 4261334: f901abe8     	str	x8, [sp, #0x350]
 4261338: 390d73ff     	strb	wzr, [sp, #0x35c]
 426133c: 52800188     	mov	w8, #0xc                ; =12
 4261340: d28e4c69     	mov	x9, #0x7263             ; =29283
 4261344: f2ac2ca9     	movk	x9, #0x6165, lsl #16
 4261348: f2cd2e89     	movk	x9, #0x6974, lsl #32
 426134c: f2edcde9     	movk	x9, #0x6e6f, lsl #48
 4261350: 13001d0a     	sxtb	w10, w8
 4261354: 7100015f     	cmp	w10, #0x0
 4261358: 910d43ea     	add	x10, sp, #0x350
 426135c: 9a8a4129     	csel	x9, x9, x10, mi
 4261360: f941afea     	ldr	x10, [sp, #0x358]
 4261364: 2a0803e8     	mov	w8, w8
 4261368: 9a884148     	csel	x8, x10, x8, mi
 426136c: f90263e9     	str	x9, [sp, #0x4c0]
 4261370: f90267e8     	str	x8, [sp, #0x4c8]
 4261374: 52800048     	mov	w8, #0x2                ; =2
 4261378: f9026bf7     	str	x23, [sp, #0x4d0]
 426137c: f9026fe8     	str	x8, [sp, #0x4d8]
 4261380: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261384: 9130b908     	add	x8, x8, #0xc2e
 4261388: 52800209     	mov	w9, #0x10               ; =16
 426138c: f90217e8     	str	x8, [sp, #0x428]
 4261390: f9021be9     	str	x9, [sp, #0x430]
 4261394: f940fbe0     	ldr	x0, [sp, #0x1f0]
 4261398: b40001c0     	cbz	x0, 0x42613d0 <_ChromeMain+0x425c134>
 426139c: f90003ff     	str	xzr, [sp]
 42613a0: f0047de1     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 42613a4: 910fbc21     	add	x1, x1, #0x3ef
 42613a8: f0046522     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42613ac: 91054442     	add	x2, x2, #0x151
 42613b0: d004c5e3     	adrp	x3, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42613b4: 9130b863     	add	x3, x3, #0xc2e
 42613b8: d2800004     	mov	x4, #0x0                ; =0
 42613bc: d2800005     	mov	x5, #0x0                ; =0
 42613c0: d2800006     	mov	x6, #0x0                ; =0
 42613c4: d2800007     	mov	x7, #0x0                ; =0
 42613c8: 9753c34e     	bl	0x1752100 <_ChromeMain+0x174ce64>
 42613cc: 34ffe140     	cbz	w0, 0x4260ff4 <_ChromeMain+0x425bd58>
 42613d0: 52800028     	mov	w8, #0x1                ; =1
 42613d4: 39073fe8     	strb	w8, [sp, #0x1cf]
 42613d8: 9106e3e8     	add	x8, sp, #0x1b8
 42613dc: b2400109     	orr	x9, x8, #0x1
 42613e0: eb16013f     	cmp	x9, x22
 42613e4: fa568102     	ccmp	x8, x22, #0x2, hi
 42613e8: 54005989     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 42613ec: 52800608     	mov	w8, #0x30               ; =48
 42613f0: 790373e8     	strh	w8, [sp, #0x1b8]
 42613f4: 52800028     	mov	w8, #0x1                ; =1
 42613f8: 13001d09     	sxtb	w9, w8
 42613fc: 7100013f     	cmp	w9, #0x0
 4261400: 9106e3e9     	add	x9, sp, #0x1b8
 4261404: a95bafea     	ldp	x10, x11, [sp, #0x1b8]
 4261408: 9a894149     	csel	x9, x10, x9, mi
 426140c: 2a0803e8     	mov	w8, w8
 4261410: 9a884168     	csel	x8, x11, x8, mi
 4261414: f90273e9     	str	x9, [sp, #0x4e0]
 4261418: f90277e8     	str	x8, [sp, #0x4e8]
 426141c: d004c5e8     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261420: 9130fd08     	add	x8, x8, #0xc3f
 4261424: 52800229     	mov	w9, #0x11               ; =17
 4261428: f9027be8     	str	x8, [sp, #0x4f0]
 426142c: f9027fe9     	str	x9, [sp, #0x4f8]
 4261430: 910763e8     	add	x8, sp, #0x1d8
 4261434: 911103e0     	add	x0, sp, #0x440
 4261438: 52800181     	mov	w1, #0xc                ; =12
 426143c: 971025c6     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4261440: 39c73fe8     	ldrsb	w8, [sp, #0x1cf]
 4261444: 36f800a8     	tbz	w8, #0x1f, 0x4261458 <_ChromeMain+0x425c1bc>
 4261448: f940dfe0     	ldr	x0, [sp, #0x1b8]
 426144c: f940e7e8     	ldr	x8, [sp, #0x1c8]
 4261450: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261454: 96f69e99     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261458: 39cd9fe8     	ldrsb	w8, [sp, #0x367]
 426145c: 36f800a8     	tbz	w8, #0x1f, 0x4261470 <_ChromeMain+0x425c1d4>
 4261460: f941abe0     	ldr	x0, [sp, #0x350]
 4261464: f941b3e8     	ldr	x8, [sp, #0x360]
 4261468: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426146c: 96f69e93     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261470: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 4261474: 36f800a8     	tbz	w8, #0x1f, 0x4261488 <_ChromeMain+0x425c1ec>
 4261478: f85203a0     	ldur	x0, [x29, #-0xe0]
 426147c: f85303a8     	ldur	x8, [x29, #-0xd0]
 4261480: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261484: 96f69e8d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261488: 38d773a8     	ldursb	w8, [x29, #-0x89]
 426148c: 36f800a8     	tbz	w8, #0x1f, 0x42614a0 <_ChromeMain+0x425c204>
 4261490: f85603a0     	ldur	x0, [x29, #-0xa0]
 4261494: f85703a8     	ldur	x8, [x29, #-0x90]
 4261498: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 426149c: 96f69e87     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42614a0: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 42614a4: 36f800a8     	tbz	w8, #0x1f, 0x42614b8 <_ChromeMain+0x425c21c>
 42614a8: f941bbe0     	ldr	x0, [sp, #0x370]
 42614ac: f941c3e8     	ldr	x8, [sp, #0x380]
 42614b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42614b4: 96f69e81     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42614b8: a91c7fff     	stp	xzr, xzr, [sp, #0x1c0]
 42614bc: f900ebff     	str	xzr, [sp, #0x1d0]
 42614c0: 3987bfe8     	ldrsb	x8, [sp, #0x1ef]
 42614c4: 910763e9     	add	x9, sp, #0x1d8
 42614c8: a95dafea     	ldp	x10, x11, [sp, #0x1d8]
 42614cc: f100011f     	cmp	x8, #0x0
 42614d0: 9a894141     	csel	x1, x10, x9, mi
 42614d4: 7100011f     	cmp	w8, #0x0
 42614d8: 9a884162     	csel	x2, x11, x8, mi
 42614dc: 9107c3e0     	add	x0, sp, #0x1f0
 42614e0: 52800003     	mov	w3, #0x0                ; =0
 42614e4: 97227287     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 42614e8: f900dfe0     	str	x0, [sp, #0x1b8]
 42614ec: 390703ff     	strb	wzr, [sp, #0x1c0]
 42614f0: 390713ff     	strb	wzr, [sp, #0x1c4]
 42614f4: 390723ff     	strb	wzr, [sp, #0x1c8]
 42614f8: 390743ff     	strb	wzr, [sp, #0x1d0]
 42614fc: f9401408     	ldr	x8, [x0, #0x28]
 4261500: b40007a8     	cbz	x8, 0x42615f4 <_ChromeMain+0x425c358>
 4261504: 90054a88     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4261508: f9468508     	ldr	x8, [x8, #0xd08]
 426150c: 10374929     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 4261510: d503201f     	nop
 4261514: eb09011f     	cmp	x8, x9
 4261518: 54007001     	b.ne	0x4262318 <_ChromeMain+0x425d07c>
 426151c: 94f7411d     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 4261520: 1e602008     	fcmp	d0, #0.0
 4261524: 54009dc0     	b.eq	0x42628dc <_ChromeMain+0x425d640>
 4261528: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 426152c: f90063e8     	str	x8, [sp, #0xc0]
 4261530: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 4261534: 9e670101     	fmov	d1, x8
 4261538: 1e612000     	fcmp	d0, d1
 426153c: 54000420     	b.eq	0x42615c0 <_ChromeMain+0x425c324>
 4261540: f004ee28     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4261544: f9444908     	ldr	x8, [x8, #0x890]
 4261548: fd400101     	ldr	d1, [x8]
 426154c: 1e612800     	fadd	d0, d0, d1
 4261550: d004e748     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 4261554: fd45ad01     	ldr	d1, [x8, #0xb58]
 4261558: 1e610800     	fmul	d0, d0, d1
 426155c: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 4261560: 9e670101     	fmov	d1, x8
 4261564: 1e612000     	fcmp	d0, d1
 4261568: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 426156c: 9a88b3e8     	csel	x8, xzr, x8, lt
 4261570: 1e616801     	fmaxnm	d1, d0, d1
 4261574: 9e780029     	fcvtzs	x9, d1
 4261578: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 426157c: 9e670141     	fmov	d1, x10
 4261580: 1e612000     	fcmp	d0, d1
 4261584: 9a889129     	csel	x9, x9, x8, ls
 4261588: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426158c: f90063e9     	str	x9, [sp, #0xc0]
 4261590: 8b080128     	add	x8, x9, x8
 4261594: f100091f     	cmp	x8, #0x2
 4261598: 54000143     	b.lo	0x42615c0 <_ChromeMain+0x425c324>
 426159c: d2880008     	mov	x8, #0x4000             ; =16384
 42615a0: f2a910c8     	movk	x8, #0x4886, lsl #16
 42615a4: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 42615a8: f2e00528     	movk	x8, #0x29, lsl #48
 42615ac: f94063e9     	ldr	x9, [sp, #0xc0]
 42615b0: ab080128     	adds	x8, x9, x8
 42615b4: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 42615b8: 9a886128     	csel	x8, x9, x8, vs
 42615bc: f90063e8     	str	x8, [sp, #0xc0]
 42615c0: 9106e3e0     	add	x0, sp, #0x1b8
 42615c4: 9718bc3f     	bl	0x8906c0 <_ChromeMain+0x88b424>
 42615c8: 7101901f     	cmp	w0, #0x64
 42615cc: 540003a1     	b.ne	0x4261640 <_ChromeMain+0x425c3a4>
 42615d0: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 42615d4: 4e080d01     	dup.2d	v1, x8
 42615d8: d2880008     	mov	x8, #0x4000             ; =16384
 42615dc: f2a910c8     	movk	x8, #0x4886, lsl #16
 42615e0: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 42615e4: f2e00528     	movk	x8, #0x29, lsl #48
 42615e8: 4e080d00     	dup.2d	v0, x8
 42615ec: ad0187e0     	stp	q0, q1, [sp, #0x30]
 42615f0: 14000083     	b	0x42617fc <_ChromeMain+0x425c560>
 42615f4: f0056528     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42615f8: b940b108     	ldr	w8, [x8, #0xb0]
 42615fc: 7100091f     	cmp	w8, #0x2
 4261600: 5400036c     	b.gt	0x426166c <_ChromeMain+0x425c3d0>
 4261604: d004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261608: 912acc21     	add	x1, x1, #0xab3
 426160c: 911103f3     	add	x19, sp, #0x440
 4261610: 911103e0     	add	x0, sp, #0x440
 4261614: 52801fe2     	mov	w2, #0xff               ; =255
 4261618: 52800043     	mov	w3, #0x2                ; =2
 426161c: 970e9ecc     	bl	0x60914c <_ChromeMain+0x603eb0>
 4261620: d004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261624: 91314421     	add	x1, x1, #0xc51
 4261628: 91004260     	add	x0, x19, #0x10
 426162c: 52800502     	mov	w2, #0x28               ; =40
 4261630: 96f70fa3     	bl	0x254bc <_ChromeMain+0x20220>
 4261634: 911103e0     	add	x0, sp, #0x440
 4261638: 970e9e92     	bl	0x609080 <_ChromeMain+0x603de4>
 426163c: 1400000c     	b	0x426166c <_ChromeMain+0x425c3d0>
 4261640: f940dfe8     	ldr	x8, [sp, #0x1b8]
 4261644: f9401508     	ldr	x8, [x8, #0x28]
 4261648: b40068a8     	cbz	x8, 0x426235c <_ChromeMain+0x425d0c0>
 426164c: 394713e8     	ldrb	w8, [sp, #0x1c4]
 4261650: 36006868     	tbz	w8, #0x0, 0x426235c <_ChromeMain+0x425d0c0>
 4261654: b941c3e8     	ldr	w8, [sp, #0x1c0]
 4261658: 51019109     	sub	w9, w8, #0x64
 426165c: 7100093f     	cmp	w9, #0x2
 4261660: 540067c2     	b.hs	0x4262358 <_ChromeMain+0x425d0bc>
 4261664: 52800028     	mov	w8, #0x1                ; =1
 4261668: 39000268     	strb	w8, [x19]
 426166c: 9106e3e0     	add	x0, sp, #0x1b8
 4261670: 97226d35     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 4261674: 39c7bfe8     	ldrsb	w8, [sp, #0x1ef]
 4261678: 36ffb8a8     	tbz	w8, #0x1f, 0x4260d8c <_ChromeMain+0x425baf0>
 426167c: f940efe0     	ldr	x0, [sp, #0x1d8]
 4261680: f940f7e8     	ldr	x8, [sp, #0x1e8]
 4261684: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261688: 96f69e0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426168c: 17fffdc0     	b	0x4260d8c <_ChromeMain+0x425baf0>
 4261690: 39d1ffe8     	ldrsb	w8, [sp, #0x47f]
 4261694: 37f894e8     	tbnz	w8, #0x1f, 0x4262930 <_ChromeMain+0x425d694>
 4261698: f94223e0     	ldr	x0, [sp, #0x440]
 426169c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 42616a0: b0054a89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42616a4: f9404529     	ldr	x9, [x9, #0x88]
 42616a8: eb09011f     	cmp	x8, x9
 42616ac: 54000041     	b.ne	0x42616b4 <_ChromeMain+0x425c418>
 42616b0: 96f704e3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42616b4: 52800017     	mov	w23, #0x0               ; =0
 42616b8: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 42616bc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 42616c0: f9003bff     	str	xzr, [sp, #0x70]
 42616c4: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 42616c8: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 42616cc: b9005fff     	str	wzr, [sp, #0x5c]
 42616d0: b9007fff     	str	wzr, [sp, #0x7c]
 42616d4: 394da3e8     	ldrb	w8, [sp, #0x368]
 42616d8: 34000208     	cbz	w8, 0x4261718 <_ChromeMain+0x425c47c>
 42616dc: 39cd9fe8     	ldrsb	w8, [sp, #0x367]
 42616e0: 36f801c8     	tbz	w8, #0x1f, 0x4261718 <_ChromeMain+0x425c47c>
 42616e4: f941abe0     	ldr	x0, [sp, #0x350]
 42616e8: f941b3e8     	ldr	x8, [sp, #0x360]
 42616ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42616f0: 96f69df2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42616f4: 14000009     	b	0x4261718 <_ChromeMain+0x425c47c>
 42616f8: 52800017     	mov	w23, #0x0               ; =0
 42616fc: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4261700: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4261704: f9003bff     	str	xzr, [sp, #0x70]
 4261708: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 426170c: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4261710: b9005fff     	str	wzr, [sp, #0x5c]
 4261714: b9007fff     	str	wzr, [sp, #0x7c]
 4261718: 910dc3f5     	add	x21, sp, #0x370
 426171c: 9101c2a0     	add	x0, x21, #0x70
 4261720: d2800001     	mov	x1, #0x0                ; =0
 4261724: 96f71965     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4261728: 910082a0     	add	x0, x21, #0x20
 426172c: 96f71953     	bl	0x27c78 <_ChromeMain+0x229dc>
 4261730: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4261734: 36f800a8     	tbz	w8, #0x1f, 0x4261748 <_ChromeMain+0x425c4ac>
 4261738: f941bbe0     	ldr	x0, [sp, #0x370]
 426173c: f941c3e8     	ldr	x8, [sp, #0x380]
 4261740: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261744: 96f69ddd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261748: 3946dfe8     	ldrb	w8, [sp, #0x1b7]
 426174c: aa1703f6     	mov	x22, x23
 4261750: 1400000a     	b	0x4261778 <_ChromeMain+0x425c4dc>
 4261754: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4261758: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 426175c: f9003bff     	str	xzr, [sp, #0x70]
 4261760: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4261764: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4261768: b9005fff     	str	wzr, [sp, #0x5c]
 426176c: b9007fff     	str	wzr, [sp, #0x7c]
 4261770: 52800016     	mov	w22, #0x0               ; =0
 4261774: 52800037     	mov	w23, #0x1               ; =1
 4261778: 363800a8     	tbz	w8, #0x7, 0x426178c <_ChromeMain+0x425c4f0>
 426177c: f940d3e0     	ldr	x0, [sp, #0x1a0]
 4261780: f940dbe8     	ldr	x8, [sp, #0x1b0]
 4261784: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261788: 96f69dcc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426178c: 520002c8     	eor	w8, w22, #0x1
 4261790: 2a080348     	orr	w8, w26, w8
 4261794: 0a0802e8     	and	w8, w23, w8
 4261798: 36000128     	tbz	w8, #0x0, 0x42617bc <_ChromeMain+0x425c520>
 426179c: 9106e3e0     	add	x0, sp, #0x1b8
 42617a0: 52800141     	mov	w1, #0xa                ; =10
 42617a4: 9711d123     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42617a8: 121f0008     	and	w8, w0, #0x2
 42617ac: 2a480755     	orr	w21, w26, w8, lsr #1
 42617b0: 37001795     	tbnz	w21, #0x0, 0x4261aa0 <_ChromeMain+0x425c804>
 42617b4: 37001720     	tbnz	w0, #0x0, 0x4261a98 <_ChromeMain+0x425c7fc>
 42617b8: 34004040     	cbz	w0, 0x4261fc0 <_ChromeMain+0x425cd24>
 42617bc: f9400668     	ldr	x8, [x19, #0x8]
 42617c0: 91000508     	add	x8, x8, #0x1
 42617c4: f9000668     	str	x8, [x19, #0x8]
 42617c8: 34000136     	cbz	w22, 0x42617ec <_ChromeMain+0x425c550>
 42617cc: f94057e8     	ldr	x8, [sp, #0xa8]
 42617d0: 37385aa8     	tbnz	w8, #0x7, 0x4262324 <_ChromeMain+0x425d088>
 42617d4: f94053e8     	ldr	x8, [sp, #0xa0]
 42617d8: 363800a8     	tbz	w8, #0x7, 0x42617ec <_ChromeMain+0x425c550>
 42617dc: 14000445     	b	0x42628f0 <_ChromeMain+0x425d654>
 42617e0: f9400668     	ldr	x8, [x19, #0x8]
 42617e4: 91000508     	add	x8, x8, #0x1
 42617e8: f9000668     	str	x8, [x19, #0x8]
 42617ec: 9106e3e0     	add	x0, sp, #0x1b8
 42617f0: 9718bbb4     	bl	0x8906c0 <_ChromeMain+0x88b424>
 42617f4: 7101901f     	cmp	w0, #0x64
 42617f8: 54fff241     	b.ne	0x4261640 <_ChromeMain+0x425c3a4>
 42617fc: 9106e3e0     	add	x0, sp, #0x1b8
 4261800: 52800081     	mov	w1, #0x4                ; =4
 4261804: 9711d12a     	bl	0x6d5cac <_ChromeMain+0x6d0a10>
 4261808: aa0003f6     	mov	x22, x0
 426180c: 9106e3e0     	add	x0, sp, #0x1b8
 4261810: 528000c1     	mov	w1, #0x6                ; =6
 4261814: 9711d126     	bl	0x6d5cac <_ChromeMain+0x6d0a10>
 4261818: f9005fe0     	str	x0, [sp, #0xb8]
 426181c: 9106e3e0     	add	x0, sp, #0x1b8
 4261820: 528000a1     	mov	w1, #0x5                ; =5
 4261824: 9711d122     	bl	0x6d5cac <_ChromeMain+0x6d0a10>
 4261828: f9005be0     	str	x0, [sp, #0xb0]
 426182c: 9106e3e0     	add	x0, sp, #0x1b8
 4261830: 52800181     	mov	w1, #0xc                ; =12
 4261834: 9711d11e     	bl	0x6d5cac <_ChromeMain+0x6d0a10>
 4261838: aa0003fc     	mov	x28, x0
 426183c: 9106e3e0     	add	x0, sp, #0x1b8
 4261840: 528000e1     	mov	w1, #0x7                ; =7
 4261844: 9711d21b     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 4261848: 937ffec8     	asr	x8, x22, #63
 426184c: d240f908     	eor	x8, x8, #0x7fffffffffffffff
 4261850: 5288480a     	mov	w10, #0x4240            ; =16960
 4261854: 72a001ea     	movk	w10, #0xf, lsl #16
 4261858: 9b0a7ec9     	mul	x9, x22, x10
 426185c: 9b4a7eca     	smulh	x10, x22, x10
 4261860: eb89fd5f     	cmp	x10, x9, asr #63
 4261864: 9a891108     	csel	x8, x8, x9, ne
 4261868: b24107e9     	mov	x9, #-0x7fffffffffffffff ; =-9223372036854775807
 426186c: 8b090109     	add	x9, x8, x9
 4261870: d288000a     	mov	x10, #0x4000            ; =16384
 4261874: f2a910ca     	movk	x10, #0x4886, lsl #16
 4261878: f2cbd2ca     	movk	x10, #0x5e96, lsl #32
 426187c: f2e0052a     	movk	x10, #0x29, lsl #48
 4261880: ab0a010a     	adds	x10, x8, x10
 4261884: 92f0000b     	mov	x11, #0x7fffffffffffffff ; =9223372036854775807
 4261888: 9a8a616a     	csel	x10, x11, x10, vs
 426188c: f100093f     	cmp	x9, #0x2
 4261890: 9a8a3119     	csel	x25, x8, x10, lo
 4261894: f10006df     	cmp	x22, #0x1
 4261898: 54fffa4b     	b.lt	0x42617e0 <_ChromeMain+0x425c544>
 426189c: f94063e8     	ldr	x8, [sp, #0xc0]
 42618a0: eb08033f     	cmp	x25, x8
 42618a4: 54fff9ed     	b.le	0x42617e0 <_ChromeMain+0x425c544>
 42618a8: aa0003fa     	mov	x26, x0
 42618ac: 9106e3e0     	add	x0, sp, #0x1b8
 42618b0: 528001a1     	mov	w1, #0xd                ; =13
 42618b4: 9711d0df     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42618b8: 35fff940     	cbnz	w0, 0x42617e0 <_ChromeMain+0x425c544>
 42618bc: f81503bf     	stur	xzr, [x29, #-0xb0]
 42618c0: d10383a8     	sub	x8, x29, #0xe0
 42618c4: f803711f     	stur	xzr, [x8, #0x37]
 42618c8: 6f00e400     	movi.2d	v0, #0000000000000000
 42618cc: 3d810300     	str	q0, [x24, #0x400]
 42618d0: 3d810700     	str	q0, [x24, #0x410]
 42618d4: b801f11f     	stur	wzr, [x8, #0x1f]
 42618d8: 910683e8     	add	x8, sp, #0x1a0
 42618dc: 9106e3e0     	add	x0, sp, #0x1b8
 42618e0: 52800161     	mov	w1, #0xb                ; =11
 42618e4: 9711d2b5     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 42618e8: 3946dfe9     	ldrb	w9, [sp, #0x1b7]
 42618ec: 13001d28     	sxtb	w8, w9
 42618f0: f940d7ea     	ldr	x10, [sp, #0x1a8]
 42618f4: 7100011f     	cmp	w8, #0x0
 42618f8: 9a894149     	csel	x9, x10, x9, mi
 42618fc: b4fff2c9     	cbz	x9, 0x4261754 <_ChromeMain+0x425c4b8>
 4261900: f940d3ea     	ldr	x10, [sp, #0x1a0]
 4261904: 7100011f     	cmp	w8, #0x0
 4261908: 910683eb     	add	x11, sp, #0x1a0
 426190c: 9a8b414b     	csel	x11, x10, x11, mi
 4261910: 3940016b     	ldrb	w11, [x11]
 4261914: 7101797f     	cmp	w11, #0x5e
 4261918: 54000160     	b.eq	0x4261944 <_ChromeMain+0x425c6a8>
 426191c: 52800017     	mov	w23, #0x0               ; =0
 4261920: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4261924: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4261928: f9003bff     	str	xzr, [sp, #0x70]
 426192c: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4261930: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4261934: b9005fff     	str	wzr, [sp, #0x5c]
 4261938: b9007fff     	str	wzr, [sp, #0x7c]
 426193c: 52800016     	mov	w22, #0x0               ; =0
 4261940: 17ffff8e     	b	0x4261778 <_ChromeMain+0x425c4dc>
 4261944: f901f3ff     	str	xzr, [sp, #0x3e0]
 4261948: 6f00e400     	movi.2d	v0, #0000000000000000
 426194c: ad0e8300     	stp	q0, q0, [x24, #0x1d0]
 4261950: ad0d8300     	stp	q0, q0, [x24, #0x1b0]
 4261954: ad0c8300     	stp	q0, q0, [x24, #0x190]
 4261958: 3d806300     	str	q0, [x24, #0x180]
 426195c: d004c5eb     	adrp	x11, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4261960: 9133196b     	add	x11, x11, #0xcc6
 4261964: f90223eb     	str	x11, [sp, #0x440]
 4261968: 5280056b     	mov	w11, #0x2b              ; =43
 426196c: f90227eb     	str	x11, [sp, #0x448]
 4261970: 7100011f     	cmp	w8, #0x0
 4261974: 910683e8     	add	x8, sp, #0x1a0
 4261978: 9a884148     	csel	x8, x10, x8, mi
 426197c: 91000508     	add	x8, x8, #0x1
 4261980: d1000529     	sub	x9, x9, #0x1
 4261984: f9022be8     	str	x8, [sp, #0x450]
 4261988: f9022fe9     	str	x9, [sp, #0x458]
 426198c: d10283a8     	sub	x8, x29, #0xa0
 4261990: 911103e0     	add	x0, sp, #0x440
 4261994: 52800041     	mov	w1, #0x2                ; =2
 4261998: 9710246f     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 426199c: 389773a8     	ldursb	x8, [x29, #-0x89]
 42619a0: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42619a4: f100011f     	cmp	x8, #0x0
 42619a8: d10283ab     	sub	x11, x29, #0xa0
 42619ac: 9a8b4121     	csel	x1, x9, x11, mi
 42619b0: 7100011f     	cmp	w8, #0x0
 42619b4: 9a884142     	csel	x2, x10, x8, mi
 42619b8: 910dc3e0     	add	x0, sp, #0x370
 42619bc: 97043a06     	bl	0x3701d4 <_ChromeMain+0x36af38>
 42619c0: 38d773a8     	ldursb	w8, [x29, #-0x89]
 42619c4: 36f800a8     	tbz	w8, #0x1f, 0x42619d8 <_ChromeMain+0x425c73c>
 42619c8: f85603a0     	ldur	x0, [x29, #-0xa0]
 42619cc: f85703a8     	ldur	x8, [x29, #-0x90]
 42619d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42619d4: 96f69d39     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42619d8: 394e23e8     	ldrb	w8, [sp, #0x388]
 42619dc: 34ffe8e8     	cbz	w8, 0x42616f8 <_ChromeMain+0x425c45c>
 42619e0: 6f00e400     	movi.2d	v0, #0000000000000000
 42619e4: ad0b0300     	stp	q0, q0, [x24, #0x160]
 42619e8: ad138300     	stp	q0, q0, [x24, #0x270]
 42619ec: ad128300     	stp	q0, q0, [x24, #0x250]
 42619f0: 911103e0     	add	x0, sp, #0x440
 42619f4: 910dc3e1     	add	x1, sp, #0x370
 42619f8: 97506356     	bl	0x167a750 <_ChromeMain+0x16754b4>
 42619fc: 14000008     	b	0x4261a1c <_ChromeMain+0x425c780>
 4261a00: a9400801     	ldp	x1, x2, [x0]
 4261a04: 910d43e0     	add	x0, sp, #0x350
 4261a08: 96f6da04     	bl	0x18218 <_ChromeMain+0x12f7c>
 4261a0c: 52800028     	mov	w8, #0x1                ; =1
 4261a10: 390da3e8     	strb	w8, [sp, #0x368]
 4261a14: 911103e0     	add	x0, sp, #0x440
 4261a18: 976fec5c     	bl	0x1e5cb88 <_ChromeMain+0x1e578ec>
 4261a1c: 395143e8     	ldrb	w8, [sp, #0x450]
 4261a20: 37002d48     	tbnz	w8, #0x0, 0x4261fc8 <_ChromeMain+0x425cd2c>
 4261a24: 911103e0     	add	x0, sp, #0x440
 4261a28: 976fec7c     	bl	0x1e5cc18 <_ChromeMain+0x1e5797c>
 4261a2c: f100303f     	cmp	x1, #0xc
 4261a30: 54ffe301     	b.ne	0x4261690 <_ChromeMain+0x425c3f4>
 4261a34: f9400008     	ldr	x8, [x0]
 4261a38: d28c2e09     	mov	x9, #0x6170             ; =24944
 4261a3c: f2ae8e49     	movk	x9, #0x7472, lsl #16
 4261a40: f2ce8d29     	movk	x9, #0x7469, lsl #32
 4261a44: f2eded29     	movk	x9, #0x6f69, lsl #48
 4261a48: ca090108     	eor	x8, x8, x9
 4261a4c: b9400809     	ldr	w9, [x0, #0x8]
 4261a50: 52896dca     	mov	w10, #0x4b6e            ; =19310
 4261a54: 72af2caa     	movk	w10, #0x7965, lsl #16
 4261a58: ca0a0129     	eor	x9, x9, x10
 4261a5c: aa090108     	orr	x8, x8, x9
 4261a60: b5ffe188     	cbnz	x8, 0x4261690 <_ChromeMain+0x425c3f4>
 4261a64: 394da3e8     	ldrb	w8, [sp, #0x368]
 4261a68: 3707e148     	tbnz	w8, #0x0, 0x4261690 <_ChromeMain+0x425c3f4>
 4261a6c: 911103e0     	add	x0, sp, #0x440
 4261a70: 974622d4     	bl	0x13ea5c0 <_ChromeMain+0x13e5324>
 4261a74: 394da3e8     	ldrb	w8, [sp, #0x368]
 4261a78: 35004168     	cbnz	w8, 0x42622a4 <_ChromeMain+0x425d008>
 4261a7c: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4261a80: 37fffc08     	tbnz	w8, #0x1f, 0x4261a00 <_ChromeMain+0x425c764>
 4261a84: 3dc00000     	ldr	q0, [x0]
 4261a88: f9400808     	ldr	x8, [x0, #0x10]
 4261a8c: f901b3e8     	str	x8, [sp, #0x360]
 4261a90: 3d805b00     	str	q0, [x24, #0x160]
 4261a94: 17ffffde     	b	0x4261a0c <_ChromeMain+0x425c770>
 4261a98: 5280003b     	mov	w27, #0x1               ; =1
 4261a9c: 14000002     	b	0x4261aa4 <_ChromeMain+0x425c808>
 4261aa0: 5280005b     	mov	w27, #0x2               ; =2
 4261aa4: 910623e8     	add	x8, sp, #0x188
 4261aa8: 9106e3e0     	add	x0, sp, #0x1b8
 4261aac: 52800001     	mov	w1, #0x0                ; =0
 4261ab0: 9711d242     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261ab4: 9105c3e8     	add	x8, sp, #0x170
 4261ab8: 9106e3e0     	add	x0, sp, #0x1b8
 4261abc: 52800021     	mov	w1, #0x1                ; =1
 4261ac0: 9711d23e     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261ac4: 910563e8     	add	x8, sp, #0x158
 4261ac8: 9106e3e0     	add	x0, sp, #0x1b8
 4261acc: 52800041     	mov	w1, #0x2                ; =2
 4261ad0: 9711d23a     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261ad4: 910503e8     	add	x8, sp, #0x140
 4261ad8: 9106e3e0     	add	x0, sp, #0x1b8
 4261adc: 52800061     	mov	w1, #0x3                ; =3
 4261ae0: 9711d236     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261ae4: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 4261ae8: 8b080388     	add	x8, x28, x8
 4261aec: d2880009     	mov	x9, #0x4000             ; =16384
 4261af0: f2a910c9     	movk	x9, #0x4886, lsl #16
 4261af4: f2cbd2c9     	movk	x9, #0x5e96, lsl #32
 4261af8: f2e00529     	movk	x9, #0x29, lsl #48
 4261afc: ab090389     	adds	x9, x28, x9
 4261b00: 92f0000a     	mov	x10, #0x7fffffffffffffff ; =9223372036854775807
 4261b04: 9a896149     	csel	x9, x10, x9, vs
 4261b08: f100091f     	cmp	x8, #0x2
 4261b0c: 9a89339c     	csel	x28, x28, x9, lo
 4261b10: 9106e3e0     	add	x0, sp, #0x1b8
 4261b14: 52800101     	mov	w1, #0x8                ; =8
 4261b18: 9711d166     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 4261b1c: aa0003f7     	mov	x23, x0
 4261b20: 9106e3e0     	add	x0, sp, #0x1b8
 4261b24: 52800121     	mov	w1, #0x9                ; =9
 4261b28: 9711d042     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 4261b2c: 71000c1f     	cmp	w0, #0x3
 4261b30: 5a9f3008     	csinv	w8, w0, wzr, lo
 4261b34: 390323ff     	strb	wzr, [sp, #0xc8]
 4261b38: 3904e3ff     	strb	wzr, [sp, #0x138]
 4261b3c: 34000416     	cbz	w22, 0x4261bbc <_ChromeMain+0x425c920>
 4261b40: 294c27ea     	ldp	w10, w9, [sp, #0x60]
 4261b44: 2a092149     	orr	w9, w10, w9, lsl #8
 4261b48: 790193e9     	strh	w9, [sp, #0xc8]
 4261b4c: f9404bea     	ldr	x10, [sp, #0x90]
 4261b50: f9403be9     	ldr	x9, [sp, #0x70]
 4261b54: a90d27ea     	stp	x10, x9, [sp, #0xd0]
 4261b58: f94043e9     	ldr	x9, [sp, #0x80]
 4261b5c: a94a2beb     	ldp	x11, x10, [sp, #0xa0]
 4261b60: aa0be129     	orr	x9, x9, x11, lsl #56
 4261b64: f90073e9     	str	x9, [sp, #0xe0]
 4261b68: f9404feb     	ldr	x11, [sp, #0x98]
 4261b6c: f94047e9     	ldr	x9, [sp, #0x88]
 4261b70: aa0ae129     	orr	x9, x9, x10, lsl #56
 4261b74: f94037ea     	ldr	x10, [sp, #0x68]
 4261b78: a90eabeb     	stp	x11, x10, [sp, #0xe8]
 4261b7c: f9007fe9     	str	x9, [sp, #0xf8]
 4261b80: 390403ff     	strb	wzr, [sp, #0x100]
 4261b84: 390443ff     	strb	wzr, [sp, #0x110]
 4261b88: b9407fe9     	ldr	w9, [sp, #0x7c]
 4261b8c: 37003ac9     	tbnz	w9, #0x0, 0x42622e4 <_ChromeMain+0x425d048>
 4261b90: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4261b94: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4261b98: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 4261b9c: d10383a9     	sub	x9, x29, #0xe0
 4261ba0: 3cc07120     	ldur	q0, [x9, #0x7]
 4261ba4: 910323ea     	add	x10, sp, #0xc8
 4261ba8: 3c850140     	stur	q0, [x10, #0x50]
 4261bac: 3cc13120     	ldur	q0, [x9, #0x13]
 4261bb0: 3c85c140     	stur	q0, [x10, #0x5c]
 4261bb4: 52800029     	mov	w9, #0x1                ; =1
 4261bb8: 3904e3e9     	strb	w9, [sp, #0x138]
 4261bbc: fd405fe0     	ldr	d0, [sp, #0xb8]
 4261bc0: f9405be9     	ldr	x9, [sp, #0xb0]
 4261bc4: 4e181d20     	mov.d	v0[1], x9
 4261bc8: ad4187e3     	ldp	q3, q1, [sp, #0x30]
 4261bcc: 4ee18401     	add.2d	v1, v0, v1
 4261bd0: 52800049     	mov	w9, #0x2                ; =2
 4261bd4: 4e080d22     	dup.2d	v2, x9
 4261bd8: 4ee30c03     	sqadd.2d	v3, v0, v3
 4261bdc: 6ee13441     	cmhi.2d	v1, v2, v1
 4261be0: 6ee11c60     	bif.16b	v0, v3, v1
 4261be4: 4e183c06     	mov.d	x6, v0[1]
 4261be8: 9e660004     	fmov	x4, d0
 4261bec: b9001bfb     	str	w27, [sp, #0x18]
 4261bf0: 52800029     	mov	w9, #0x1                ; =1
 4261bf4: 2900a7e8     	stp	w8, w9, [sp, #0x4]
 4261bf8: 390007f7     	strb	w23, [sp, #0x1]
 4261bfc: 390003fa     	strb	w26, [sp]
 4261c00: 910623e0     	add	x0, sp, #0x188
 4261c04: 9105c3e1     	add	x1, sp, #0x170
 4261c08: 910563e2     	add	x2, sp, #0x158
 4261c0c: 910503e3     	add	x3, sp, #0x140
 4261c10: 528000a8     	mov	w8, #0x5                ; =5
 4261c14: b90027e8     	str	w8, [sp, #0x24]
 4261c18: b24087e8     	mov	x8, #0x3ffffffff        ; =17179869183
 4261c1c: f801c3e8     	stur	x8, [sp, #0x1c]
 4261c20: 910323e8     	add	x8, sp, #0xc8
 4261c24: f9000be8     	str	x8, [sp, #0x10]
 4261c28: aa1903e5     	mov	x5, x25
 4261c2c: aa1c03e7     	mov	x7, x28
 4261c30: 97662e68     	bl	0x1bed5d0 <_ChromeMain+0x1be8334>
 4261c34: aa0003fc     	mov	x28, x0
 4261c38: 3944e3e8     	ldrb	w8, [sp, #0x138]
 4261c3c: 340000a8     	cbz	w8, 0x4261c50 <_ChromeMain+0x425c9b4>
 4261c40: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 4261c44: 37f81b48     	tbnz	w8, #0x1f, 0x4261fac <_ChromeMain+0x425cd10>
 4261c48: 39c39fe8     	ldrsb	w8, [sp, #0xe7]
 4261c4c: 37f865e8     	tbnz	w8, #0x1f, 0x4262908 <_ChromeMain+0x425d66c>
 4261c50: 39c55fe8     	ldrsb	w8, [sp, #0x157]
 4261c54: 36f800a8     	tbz	w8, #0x1f, 0x4261c68 <_ChromeMain+0x425c9cc>
 4261c58: f940a3e0     	ldr	x0, [sp, #0x140]
 4261c5c: f940abe8     	ldr	x8, [sp, #0x150]
 4261c60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261c64: 96f69c95     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261c68: 39c5bfe8     	ldrsb	w8, [sp, #0x16f]
 4261c6c: 36f800a8     	tbz	w8, #0x1f, 0x4261c80 <_ChromeMain+0x425c9e4>
 4261c70: f940afe0     	ldr	x0, [sp, #0x158]
 4261c74: f940b7e8     	ldr	x8, [sp, #0x168]
 4261c78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261c7c: 96f69c8f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261c80: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4261c84: 36f800a8     	tbz	w8, #0x1f, 0x4261c98 <_ChromeMain+0x425c9fc>
 4261c88: f940bbe0     	ldr	x0, [sp, #0x170]
 4261c8c: f940c3e8     	ldr	x8, [sp, #0x180]
 4261c90: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261c94: 96f69c89     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261c98: 39c67fe8     	ldrsb	w8, [sp, #0x19f]
 4261c9c: 36f800a8     	tbz	w8, #0x1f, 0x4261cb0 <_ChromeMain+0x425ca14>
 4261ca0: f940c7e0     	ldr	x0, [sp, #0x188]
 4261ca4: f940cfe8     	ldr	x8, [sp, #0x198]
 4261ca8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261cac: 96f69c83     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261cb0: b4ffd87c     	cbz	x28, 0x42617bc <_ChromeMain+0x425c520>
 4261cb4: f901f3ff     	str	xzr, [sp, #0x3e0]
 4261cb8: 6f00e400     	movi.2d	v0, #0000000000000000
 4261cbc: ad0e8300     	stp	q0, q0, [x24, #0x1d0]
 4261cc0: ad0d8300     	stp	q0, q0, [x24, #0x1b0]
 4261cc4: ad0c8300     	stp	q0, q0, [x24, #0x190]
 4261cc8: 3d806300     	str	q0, [x24, #0x180]
 4261ccc: 911103e8     	add	x8, sp, #0x440
 4261cd0: 9106e3e0     	add	x0, sp, #0x1b8
 4261cd4: 52800041     	mov	w1, #0x2                ; =2
 4261cd8: 9711d1b8     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261cdc: 39915fe8     	ldrsb	x8, [sp, #0x457]
 4261ce0: f94223e9     	ldr	x9, [sp, #0x440]
 4261ce4: f94227ea     	ldr	x10, [sp, #0x448]
 4261ce8: f100011f     	cmp	x8, #0x0
 4261cec: 911103eb     	add	x11, sp, #0x440
 4261cf0: 9a8b413a     	csel	x26, x9, x11, mi
 4261cf4: 7100011f     	cmp	w8, #0x0
 4261cf8: 9a88415b     	csel	x27, x10, x8, mi
 4261cfc: d10283a8     	sub	x8, x29, #0xa0
 4261d00: 9106e3e0     	add	x0, sp, #0x1b8
 4261d04: 52800061     	mov	w1, #0x3                ; =3
 4261d08: 9711d1ac     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261d0c: 389773a8     	ldursb	x8, [x29, #-0x89]
 4261d10: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4261d14: f100011f     	cmp	x8, #0x0
 4261d18: d10283ab     	sub	x11, x29, #0xa0
 4261d1c: 9a8b4122     	csel	x2, x9, x11, mi
 4261d20: 7100011f     	cmp	w8, #0x0
 4261d24: 9a884143     	csel	x3, x10, x8, mi
 4261d28: 710002bf     	cmp	w21, #0x0
 4261d2c: 52800088     	mov	w8, #0x4                ; =4
 4261d30: 9a880517     	cinc	x23, x8, ne
 4261d34: f0044de8     	adrp	x8, 0xcc20000 <dyld_stub_binder+0xcc20000>
 4261d38: 91012d08     	add	x8, x8, #0x4b
 4261d3c: f0044de9     	adrp	x9, 0xcc20000 <dyld_stub_binder+0xcc20000>
 4261d40: 91011529     	add	x9, x9, #0x45
 4261d44: 9a881139     	csel	x25, x9, x8, ne
 4261d48: 910dc3e8     	add	x8, sp, #0x370
 4261d4c: aa1a03e0     	mov	x0, x26
 4261d50: aa1b03e1     	mov	x1, x27
 4261d54: aa1903e4     	mov	x4, x25
 4261d58: aa1703e5     	mov	x5, x23
 4261d5c: 970f5569     	bl	0x637300 <_ChromeMain+0x632064>
 4261d60: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4261d64: 36f800a8     	tbz	w8, #0x1f, 0x4261d78 <_ChromeMain+0x425cadc>
 4261d68: f85603a0     	ldur	x0, [x29, #-0xa0]
 4261d6c: f85703a8     	ldur	x8, [x29, #-0x90]
 4261d70: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261d74: 96f69c51     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261d78: 39d15fe8     	ldrsb	w8, [sp, #0x457]
 4261d7c: 36f800a8     	tbz	w8, #0x1f, 0x4261d90 <_ChromeMain+0x425caf4>
 4261d80: f94223e0     	ldr	x0, [sp, #0x440]
 4261d84: f9422be8     	ldr	x8, [sp, #0x450]
 4261d88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261d8c: 96f69c4b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261d90: 394e23e8     	ldrb	w8, [sp, #0x388]
 4261d94: 37000548     	tbnz	w8, #0x0, 0x4261e3c <_ChromeMain+0x425cba0>
 4261d98: d10283a8     	sub	x8, x29, #0xa0
 4261d9c: 9106e3e0     	add	x0, sp, #0x1b8
 4261da0: 52800041     	mov	w1, #0x2                ; =2
 4261da4: 9711d185     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 4261da8: 389773a8     	ldursb	x8, [x29, #-0x89]
 4261dac: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4261db0: f100011f     	cmp	x8, #0x0
 4261db4: d10283ab     	sub	x11, x29, #0xa0
 4261db8: 9a8b4120     	csel	x0, x9, x11, mi
 4261dbc: 7100011f     	cmp	w8, #0x0
 4261dc0: 9a884141     	csel	x1, x10, x8, mi
 4261dc4: 911103e8     	add	x8, sp, #0x440
 4261dc8: f004ac22     	adrp	x2, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 4261dcc: 9104f042     	add	x2, x2, #0x13c
 4261dd0: 52800023     	mov	w3, #0x1                ; =1
 4261dd4: aa1903e4     	mov	x4, x25
 4261dd8: aa1703e5     	mov	x5, x23
 4261ddc: 970f5549     	bl	0x637300 <_ChromeMain+0x632064>
 4261de0: 910dc3e0     	add	x0, sp, #0x370
 4261de4: 911103e1     	add	x1, sp, #0x440
 4261de8: 970e5f3e     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4261dec: 911103f5     	add	x21, sp, #0x440
 4261df0: 9101c2a0     	add	x0, x21, #0x70
 4261df4: d2800001     	mov	x1, #0x0                ; =0
 4261df8: 96f717b0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4261dfc: 910082a0     	add	x0, x21, #0x20
 4261e00: 96f7179e     	bl	0x27c78 <_ChromeMain+0x229dc>
 4261e04: 39d15fe8     	ldrsb	w8, [sp, #0x457]
 4261e08: 36f800a8     	tbz	w8, #0x1f, 0x4261e1c <_ChromeMain+0x425cb80>
 4261e0c: f94223e0     	ldr	x0, [sp, #0x440]
 4261e10: f9422be8     	ldr	x8, [sp, #0x450]
 4261e14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261e18: 96f69c28     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261e1c: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4261e20: 36f800a8     	tbz	w8, #0x1f, 0x4261e34 <_ChromeMain+0x425cb98>
 4261e24: f85603a0     	ldur	x0, [x29, #-0xa0]
 4261e28: f85703a8     	ldur	x8, [x29, #-0x90]
 4261e2c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261e30: 96f69c22     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261e34: 394e23e8     	ldrb	w8, [sp, #0x388]
 4261e38: 36000788     	tbz	w8, #0x0, 0x4261f28 <_ChromeMain+0x425cc8c>
 4261e3c: 911103e0     	add	x0, sp, #0x440
 4261e40: aa1c03e1     	mov	x1, x28
 4261e44: 9733f9d3     	bl	0xf60590 <_ChromeMain+0xf5b2f4>
 4261e48: 911103e8     	add	x8, sp, #0x440
 4261e4c: 9104c100     	add	x0, x8, #0x130
 4261e50: 910dc3e1     	add	x1, sp, #0x370
 4261e54: 96fde3fc     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 4261e58: a941a668     	ldp	x8, x9, [x19, #0x18]
 4261e5c: eb09011f     	cmp	x8, x9
 4261e60: 54003240     	b.eq	0x42624a8 <_ChromeMain+0x425d20c>
 4261e64: f9400a69     	ldr	x9, [x19, #0x10]
 4261e68: 5280350a     	mov	w10, #0x1a8             ; =424
 4261e6c: 9b0a2517     	madd	x23, x8, x10, x9
 4261e70: b4000557     	cbz	x23, 0x4261f18 <_ChromeMain+0x425cc7c>
 4261e74: 911103e1     	add	x1, sp, #0x440
 4261e78: aa1703e0     	mov	x0, x23
 4261e7c: 9733f9c5     	bl	0xf60590 <_ChromeMain+0xf5b2f4>
 4261e80: 9104c2e0     	add	x0, x23, #0x130
 4261e84: 911103e8     	add	x8, sp, #0x440
 4261e88: 9104c101     	add	x1, x8, #0x130
 4261e8c: 96fde3ee     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 4261e90: 9106a2e0     	add	x0, x23, #0x1a8
 4261e94: f9400a68     	ldr	x8, [x19, #0x10]
 4261e98: eb080008     	subs	x8, x0, x8
 4261e9c: 9343fd08     	asr	x8, x8, #3
 4261ea0: d28a43a9     	mov	x9, #0x521d             ; =21021
 4261ea4: f2b18269     	movk	x9, #0x8c13, lsl #16
 4261ea8: f2d656e9     	movk	x9, #0xb2b7, lsl #32
 4261eac: f2e439e9     	movk	x9, #0x21cf, lsl #48
 4261eb0: 9b097d08     	mul	x8, x8, x9
 4261eb4: f9000e68     	str	x8, [x19, #0x18]
 4261eb8: 54000300     	b.eq	0x4261f18 <_ChromeMain+0x425cc7c>
 4261ebc: 911103f5     	add	x21, sp, #0x440
 4261ec0: 910682a0     	add	x0, x21, #0x1a0
 4261ec4: d2800001     	mov	x1, #0x0                ; =0
 4261ec8: 96f7177c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4261ecc: 910542a0     	add	x0, x21, #0x150
 4261ed0: 96f7176a     	bl	0x27c78 <_ChromeMain+0x229dc>
 4261ed4: 39d61fe8     	ldrsb	w8, [sp, #0x587]
 4261ed8: 36f800a8     	tbz	w8, #0x1f, 0x4261eec <_ChromeMain+0x425cc50>
 4261edc: f942bbe0     	ldr	x0, [sp, #0x570]
 4261ee0: f942c3e8     	ldr	x8, [sp, #0x580]
 4261ee4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261ee8: 96f69bf4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261eec: f0050388     	adrp	x8, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 4261ef0: 910d2108     	add	x8, x8, #0x348
 4261ef4: f90223e8     	str	x8, [sp, #0x440]
 4261ef8: 395523e8     	ldrb	w8, [sp, #0x548]
 4261efc: 34000108     	cbz	w8, 0x4261f1c <_ChromeMain+0x425cc80>
 4261f00: f94293e0     	ldr	x0, [sp, #0x520]
 4261f04: b40000c0     	cbz	x0, 0x4261f1c <_ChromeMain+0x425cc80>
 4261f08: f94297e8     	ldr	x8, [sp, #0x528]
 4261f0c: cb0003e9     	neg	x9, x0
 4261f10: eb09011f     	cmp	x8, x9
 4261f14: 54002c29     	b.ls	0x4262498 <_ChromeMain+0x425d1fc>
 4261f18: d4200020     	brk	#0x1
 4261f1c: 911103e0     	add	x0, sp, #0x440
 4261f20: 974d87dc     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 4261f24: 14000004     	b	0x4261f34 <_ChromeMain+0x425cc98>
 4261f28: f9400668     	ldr	x8, [x19, #0x8]
 4261f2c: 91000508     	add	x8, x8, #0x1
 4261f30: f9000668     	str	x8, [x19, #0x8]
 4261f34: 910dc3f5     	add	x21, sp, #0x370
 4261f38: 9101c2a0     	add	x0, x21, #0x70
 4261f3c: d2800001     	mov	x1, #0x0                ; =0
 4261f40: 96f7175e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4261f44: 910082a0     	add	x0, x21, #0x20
 4261f48: 96f7174c     	bl	0x27c78 <_ChromeMain+0x229dc>
 4261f4c: 39ce1fe8     	ldrsb	w8, [sp, #0x387]
 4261f50: 36f800a8     	tbz	w8, #0x1f, 0x4261f64 <_ChromeMain+0x425ccc8>
 4261f54: f941bbe0     	ldr	x0, [sp, #0x370]
 4261f58: f941c3e8     	ldr	x8, [sp, #0x380]
 4261f5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261f60: 96f69bd6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261f64: f0050388     	adrp	x8, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 4261f68: 910d2108     	add	x8, x8, #0x348
 4261f6c: f9000388     	str	x8, [x28]
 4261f70: 39442388     	ldrb	w8, [x28, #0x108]
 4261f74: 34000108     	cbz	w8, 0x4261f94 <_ChromeMain+0x425ccf8>
 4261f78: f9407380     	ldr	x0, [x28, #0xe0]
 4261f7c: b40000c0     	cbz	x0, 0x4261f94 <_ChromeMain+0x425ccf8>
 4261f80: f9407788     	ldr	x8, [x28, #0xe8]
 4261f84: cb0003e9     	neg	x9, x0
 4261f88: eb09011f     	cmp	x8, x9
 4261f8c: 54fffc68     	b.hi	0x4261f18 <_ChromeMain+0x425cc7c>
 4261f90: 1400014a     	b	0x42624b8 <_ChromeMain+0x425d21c>
 4261f94: aa1c03e0     	mov	x0, x28
 4261f98: 974d87be     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 4261f9c: 52802601     	mov	w1, #0x130              ; =304
 4261fa0: 96f69bc6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261fa4: 34ffc256     	cbz	w22, 0x42617ec <_ChromeMain+0x425c550>
 4261fa8: 17fffe09     	b	0x42617cc <_ChromeMain+0x425c530>
 4261fac: f94077e0     	ldr	x0, [sp, #0xe8]
 4261fb0: f9407fe8     	ldr	x8, [sp, #0xf8]
 4261fb4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4261fb8: 96f69bc0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4261fbc: 17ffff23     	b	0x4261c48 <_ChromeMain+0x425c9ac>
 4261fc0: 5280001b     	mov	w27, #0x0               ; =0
 4261fc4: 17fffeb8     	b	0x4261aa4 <_ChromeMain+0x425c808>
 4261fc8: 39d1ffe8     	ldrsb	w8, [sp, #0x47f]
 4261fcc: 37f84a88     	tbnz	w8, #0x1f, 0x426291c <_ChromeMain+0x425d680>
 4261fd0: f94223e0     	ldr	x0, [sp, #0x440]
 4261fd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4261fd8: b0054a89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4261fdc: f9404529     	ldr	x9, [x9, #0x88]
 4261fe0: eb09011f     	cmp	x8, x9
 4261fe4: 54000041     	b.ne	0x4261fec <_ChromeMain+0x425cd50>
 4261fe8: 96f70295     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4261fec: 394da3e8     	ldrb	w8, [sp, #0x368]
 4261ff0: 34ffb628     	cbz	w8, 0x42616b4 <_ChromeMain+0x425c418>
 4261ff4: f81883bf     	stur	xzr, [x29, #-0x78]
 4261ff8: d10383a8     	sub	x8, x29, #0xe0
 4261ffc: f806f11f     	stur	xzr, [x8, #0x6f]
 4262000: 6f00e400     	movi.2d	v0, #0000000000000000
 4262004: ad020100     	stp	q0, q0, [x8, #0x40]
 4262008: d10383b5     	sub	x21, x29, #0xe0
 426200c: b805f11f     	stur	wzr, [x8, #0x5f]
 4262010: f941b3e8     	ldr	x8, [sp, #0x360]
 4262014: f901a3e8     	str	x8, [sp, #0x340]
 4262018: 3dc05b00     	ldr	q0, [x24, #0x160]
 426201c: 3d805300     	str	q0, [x24, #0x140]
 4262020: f901afff     	str	xzr, [sp, #0x358]
 4262024: f901abff     	str	xzr, [sp, #0x350]
 4262028: f901b3ff     	str	xzr, [sp, #0x360]
 426202c: 398d1fe8     	ldrsb	x8, [sp, #0x347]
 4262030: f9419be9     	ldr	x9, [sp, #0x330]
 4262034: f9419feb     	ldr	x11, [sp, #0x338]
 4262038: f100011f     	cmp	x8, #0x0
 426203c: 910cc3ea     	add	x10, sp, #0x330
 4262040: 9a8a4129     	csel	x9, x9, x10, mi
 4262044: 7100011f     	cmp	w8, #0x0
 4262048: 9a88416a     	csel	x10, x11, x8, mi
 426204c: b40001aa     	cbz	x10, 0x4262080 <_ChromeMain+0x425cde4>
 4262050: 14000006     	b	0x4262068 <_ChromeMain+0x425cdcc>
 4262054: 52800748     	mov	w8, #0x3a               ; =58
 4262058: 39000128     	strb	w8, [x9]
 426205c: 91000529     	add	x9, x9, #0x1
 4262060: f100054a     	subs	x10, x10, #0x1
 4262064: 540000a0     	b.eq	0x4262078 <_ChromeMain+0x425cddc>
 4262068: 39400128     	ldrb	w8, [x9]
 426206c: 7100ad1f     	cmp	w8, #0x2b
 4262070: 54ffff61     	b.ne	0x426205c <_ChromeMain+0x425cdc0>
 4262074: 17fffff8     	b	0x4262054 <_ChromeMain+0x425cdb8>
 4262078: 394d1fe8     	ldrb	w8, [sp, #0x347]
 426207c: f9419feb     	ldr	x11, [sp, #0x338]
 4262080: 7219011f     	tst	w8, #0x80
 4262084: 9a881169     	csel	x9, x11, x8, ne
 4262088: f100153f     	cmp	x9, #0x5
 426208c: 54000183     	b.lo	0x42620bc <_ChromeMain+0x425ce20>
 4262090: f9419bea     	ldr	x10, [sp, #0x330]
 4262094: 7219011f     	tst	w8, #0x80
 4262098: 910cc3eb     	add	x11, sp, #0x330
 426209c: 9a8b114b     	csel	x11, x10, x11, ne
 42620a0: 3940016c     	ldrb	w12, [x11]
 42620a4: 7100a19f     	cmp	w12, #0x28
 42620a8: 540000a1     	b.ne	0x42620bc <_ChromeMain+0x425ce20>
 42620ac: 8b09016b     	add	x11, x11, x9
 42620b0: 385ff16b     	ldurb	w11, [x11, #-0x1]
 42620b4: 7100a57f     	cmp	w11, #0x29
 42620b8: 540004c0     	b.eq	0x4262150 <_ChromeMain+0x425ceb4>
 42620bc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 42620c0: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 42620c4: f90057ff     	str	xzr, [sp, #0xa8]
 42620c8: d2800016     	mov	x22, #0x0               ; =0
 42620cc: b9005fff     	str	wzr, [sp, #0x5c]
 42620d0: b9007fff     	str	wzr, [sp, #0x7c]
 42620d4: f90033ff     	str	xzr, [sp, #0x60]
 42620d8: 52800017     	mov	w23, #0x0               ; =0
 42620dc: 363800a8     	tbz	w8, #0x7, 0x42620f0 <_ChromeMain+0x425ce54>
 42620e0: f9419be0     	ldr	x0, [sp, #0x330]
 42620e4: f941a3e8     	ldr	x8, [sp, #0x340]
 42620e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42620ec: 96f69b73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42620f0: 34ffae57     	cbz	w23, 0x42616b8 <_ChromeMain+0x425c41c>
 42620f4: b9407fe8     	ldr	w8, [sp, #0x7c]
 42620f8: 37000208     	tbnz	w8, #0x0, 0x4262138 <_ChromeMain+0x425ce9c>
 42620fc: b9005fff     	str	wzr, [sp, #0x5c]
 4262100: f94057e9     	ldr	x9, [sp, #0xa8]
 4262104: 9240dd2a     	and	x10, x9, #0xffffffffffffff
 4262108: d378fd2b     	lsr	x11, x9, #56
 426210c: 9240dec8     	and	x8, x22, #0xffffffffffffff
 4262110: a90823ea     	stp	x10, x8, [sp, #0x80]
 4262114: d378fec8     	lsr	x8, x22, #56
 4262118: a90a23eb     	stp	x11, x8, [sp, #0xa0]
 426211c: d10283a8     	sub	x8, x29, #0xa0
 4262120: 3cc07100     	ldur	q0, [x8, #0x7]
 4262124: d10383a9     	sub	x9, x29, #0xe0
 4262128: 3c807120     	stur	q0, [x9, #0x7]
 426212c: 3cc13100     	ldur	q0, [x8, #0x13]
 4262130: 3c813120     	stur	q0, [x9, #0x13]
 4262134: 17fffd68     	b	0x42616d4 <_ChromeMain+0x425c438>
 4262138: f85883a8     	ldur	x8, [x29, #-0x78]
 426213c: f81503a8     	stur	x8, [x29, #-0xb0]
 4262140: d10383a9     	sub	x9, x29, #0xe0
 4262144: f846f128     	ldur	x8, [x9, #0x6f]
 4262148: f8037128     	stur	x8, [x9, #0x37]
 426214c: 17ffffed     	b	0x4262100 <_ChromeMain+0x425ce64>
 4262150: f9021bff     	str	xzr, [sp, #0x430]
 4262154: f90217ff     	str	xzr, [sp, #0x428]
 4262158: f9021fff     	str	xzr, [sp, #0x438]
 426215c: d1000921     	sub	x1, x9, #0x2
 4262160: 7219011f     	tst	w8, #0x80
 4262164: 910cc3e8     	add	x8, sp, #0x330
 4262168: 9a881149     	csel	x9, x10, x8, ne
 426216c: 9110a3e8     	add	x8, sp, #0x428
 4262170: 91000520     	add	x0, x9, #0x1
 4262174: d004ac22     	adrp	x2, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 4262178: 91078842     	add	x2, x2, #0x1e2
 426217c: 52800023     	mov	w3, #0x1                ; =1
 4262180: 52800004     	mov	w4, #0x0                ; =0
 4262184: 52800005     	mov	w5, #0x0                ; =0
 4262188: 971fa50e     	bl	0xa4b5c0 <_ChromeMain+0xa46324>
 426218c: f9421be8     	ldr	x8, [sp, #0x430]
 4262190: f94217e9     	ldr	x9, [sp, #0x428]
 4262194: f90053e9     	str	x9, [sp, #0xa0]
 4262198: d1001509     	sub	x9, x8, #0x5
 426219c: b1000d3f     	cmn	x9, #0x3
 42621a0: 54000283     	b.lo	0x42621f0 <_ChromeMain+0x425cf54>
 42621a4: f94053e9     	ldr	x9, [sp, #0xa0]
 42621a8: 39805d29     	ldrsb	x9, [x9, #0x17]
 42621ac: b7f803c9     	tbnz	x9, #0x3f, 0x4262224 <_ChromeMain+0x425cf88>
 42621b0: aa0903ea     	mov	x10, x9
 42621b4: b40001ea     	cbz	x10, 0x42621f0 <_ChromeMain+0x425cf54>
 42621b8: f94053ea     	ldr	x10, [sp, #0xa0]
 42621bc: 3980bd4a     	ldrsb	x10, [x10, #0x2f]
 42621c0: b6f8006a     	tbz	x10, #0x3f, 0x42621cc <_ChromeMain+0x425cf30>
 42621c4: f94053ea     	ldr	x10, [sp, #0xa0]
 42621c8: f940114a     	ldr	x10, [x10, #0x20]
 42621cc: b400012a     	cbz	x10, 0x42621f0 <_ChromeMain+0x425cf54>
 42621d0: f94053ea     	ldr	x10, [sp, #0xa0]
 42621d4: f940054a     	ldr	x10, [x10, #0x8]
 42621d8: 7100013f     	cmp	w9, #0x0
 42621dc: 9a89414a     	csel	x10, x10, x9, mi
 42621e0: f100155f     	cmp	x10, #0x5
 42621e4: 54001720     	b.eq	0x42624c8 <_ChromeMain+0x425d22c>
 42621e8: f100115f     	cmp	x10, #0x4
 42621ec: 540018a0     	b.eq	0x4262500 <_ChromeMain+0x425d264>
 42621f0: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 42621f4: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 42621f8: f90057ff     	str	xzr, [sp, #0xa8]
 42621fc: d2800016     	mov	x22, #0x0               ; =0
 4262200: b9005fff     	str	wzr, [sp, #0x5c]
 4262204: b9007fff     	str	wzr, [sp, #0x7c]
 4262208: f90033ff     	str	xzr, [sp, #0x60]
 426220c: 52800017     	mov	w23, #0x0               ; =0
 4262210: f94053e8     	ldr	x8, [sp, #0xa0]
 4262214: b50000e8     	cbnz	x8, 0x4262230 <_ChromeMain+0x425cf94>
 4262218: 394d1fe8     	ldrb	w8, [sp, #0x347]
 426221c: 373ff628     	tbnz	w8, #0x7, 0x42620e0 <_ChromeMain+0x425ce44>
 4262220: 17ffffb4     	b	0x42620f0 <_ChromeMain+0x425ce54>
 4262224: f94053ea     	ldr	x10, [sp, #0xa0]
 4262228: f940054a     	ldr	x10, [x10, #0x8]
 426222c: 17ffffe2     	b	0x42621b4 <_ChromeMain+0x425cf18>
 4262230: f9421be8     	ldr	x8, [sp, #0x430]
 4262234: 8b080509     	add	x9, x8, x8, lsl #1
 4262238: d37df129     	lsl	x9, x9, #3
 426223c: f94053e0     	ldr	x0, [sp, #0xa0]
 4262240: b40001a9     	cbz	x9, 0x4262274 <_ChromeMain+0x425cfd8>
 4262244: f94053ea     	ldr	x10, [sp, #0xa0]
 4262248: 8b090149     	add	x9, x10, x9
 426224c: d1006135     	sub	x21, x9, #0x18
 4262250: d37df109     	lsl	x9, x8, #3
 4262254: cb08153b     	sub	x27, x9, x8, lsl #5
 4262258: b4ffe615     	cbz	x21, 0x4261f18 <_ChromeMain+0x425cc7c>
 426225c: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4262260: 37f80728     	tbnz	w8, #0x1f, 0x4262344 <_ChromeMain+0x425d0a8>
 4262264: d10062b5     	sub	x21, x21, #0x18
 4262268: b100637b     	adds	x27, x27, #0x18
 426226c: 54ffff61     	b.ne	0x4262258 <_ChromeMain+0x425cfbc>
 4262270: f94217e0     	ldr	x0, [sp, #0x428]
 4262274: f94053e8     	ldr	x8, [sp, #0xa0]
 4262278: cb000108     	sub	x8, x8, x0
 426227c: 9343fd08     	asr	x8, x8, #3
 4262280: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4262284: f2955569     	movk	x9, #0xaaab
 4262288: 9b097d08     	mul	x8, x8, x9
 426228c: f9021be8     	str	x8, [sp, #0x430]
 4262290: f9421fe8     	ldr	x8, [sp, #0x438]
 4262294: 8b080508     	add	x8, x8, x8, lsl #1
 4262298: d37df101     	lsl	x1, x8, #3
 426229c: 96f69b07     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42622a0: 17ffffde     	b	0x4262218 <_ChromeMain+0x425cf7c>
 42622a4: 910d43e8     	add	x8, sp, #0x350
 42622a8: eb00011f     	cmp	x8, x0
 42622ac: 54ffbb40     	b.eq	0x4261a14 <_ChromeMain+0x425c778>
 42622b0: 39cd9fe9     	ldrsb	w9, [sp, #0x367]
 42622b4: 39405c08     	ldrb	w8, [x0, #0x17]
 42622b8: 37f80e09     	tbnz	w9, #0x1f, 0x4262478 <_ChromeMain+0x425d1dc>
 42622bc: 373800c8     	tbnz	w8, #0x7, 0x42622d4 <_ChromeMain+0x425d038>
 42622c0: 3dc00000     	ldr	q0, [x0]
 42622c4: f9400808     	ldr	x8, [x0, #0x10]
 42622c8: f901b3e8     	str	x8, [sp, #0x360]
 42622cc: 3d805b00     	str	q0, [x24, #0x160]
 42622d0: 17fffdd1     	b	0x4261a14 <_ChromeMain+0x425c778>
 42622d4: a9400801     	ldp	x1, x2, [x0]
 42622d8: 910d43e0     	add	x0, sp, #0x350
 42622dc: 970919f6     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 42622e0: 17fffdcd     	b	0x4261a14 <_ChromeMain+0x425c778>
 42622e4: b9405fe9     	ldr	w9, [sp, #0x5c]
 42622e8: 390403e9     	strb	w9, [sp, #0x100]
 42622ec: f85503a9     	ldur	x9, [x29, #-0xb0]
 42622f0: 910323eb     	add	x11, sp, #0xc8
 42622f4: f8039169     	stur	x9, [x11, #0x39]
 42622f8: d10383aa     	sub	x10, x29, #0xe0
 42622fc: f8437149     	ldur	x9, [x10, #0x37]
 4262300: f8040169     	stur	x9, [x11, #0x40]
 4262304: f81503bf     	stur	xzr, [x29, #-0xb0]
 4262308: f803715f     	stur	xzr, [x10, #0x37]
 426230c: 52800029     	mov	w9, #0x1                ; =1
 4262310: 390443e9     	strb	w9, [sp, #0x110]
 4262314: 17fffe1f     	b	0x4261b90 <_ChromeMain+0x425c8f4>
 4262318: d63f0100     	blr	x8
 426231c: f90063e0     	str	x0, [sp, #0xc0]
 4262320: 17fffca8     	b	0x42615c0 <_ChromeMain+0x425c324>
 4262324: f94047e1     	ldr	x1, [sp, #0x88]
 4262328: f94057e8     	ldr	x8, [sp, #0xa8]
 426232c: b3481901     	bfi	x1, x8, #56, #7
 4262330: f9404fe0     	ldr	x0, [sp, #0x98]
 4262334: 96f69ae1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262338: 17fffd27     	b	0x42617d4 <_ChromeMain+0x425c538>
 426233c: 35ff2ae8     	cbnz	w8, 0x4260898 <_ChromeMain+0x425b5fc>
 4262340: 17fff967     	b	0x42608dc <_ChromeMain+0x425b640>
 4262344: f94002a0     	ldr	x0, [x21]
 4262348: f9400aa8     	ldr	x8, [x21, #0x10]
 426234c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4262350: 96f69ada     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262354: 17ffffc4     	b	0x4262264 <_ChromeMain+0x425cfc8>
 4262358: 34ff9868     	cbz	w8, 0x4261664 <_ChromeMain+0x425c3c8>
 426235c: d0056528     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4262360: b940b108     	ldr	w8, [x8, #0xb0]
 4262364: 7100091f     	cmp	w8, #0x2
 4262368: 540001ec     	b.gt	0x42623a4 <_ChromeMain+0x425d108>
 426236c: b004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4262370: 912acc21     	add	x1, x1, #0xab3
 4262374: 911103f5     	add	x21, sp, #0x440
 4262378: 911103e0     	add	x0, sp, #0x440
 426237c: 52802902     	mov	w2, #0x148              ; =328
 4262380: 52800043     	mov	w3, #0x2                ; =2
 4262384: 970e9b72     	bl	0x60914c <_ChromeMain+0x603eb0>
 4262388: b004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 426238c: 9131e821     	add	x1, x1, #0xc7a
 4262390: 910042a0     	add	x0, x21, #0x10
 4262394: 528005a2     	mov	w2, #0x2d               ; =45
 4262398: 96f70c49     	bl	0x254bc <_ChromeMain+0x20220>
 426239c: 911103e0     	add	x0, sp, #0x440
 42623a0: 970e9b38     	bl	0x609080 <_ChromeMain+0x603de4>
 42623a4: a9412276     	ldp	x22, x8, [x19, #0x10]
 42623a8: 52803509     	mov	w9, #0x1a8              ; =424
 42623ac: 9b097d17     	mul	x23, x8, x9
 42623b0: b4000517     	cbz	x23, 0x4262450 <_ChromeMain+0x425d1b4>
 42623b4: d2800018     	mov	x24, #0x0               ; =0
 42623b8: d0050399     	adrp	x25, 0xe2d4000 <dyld_stub_binder+0xe2d4000>
 42623bc: 910d2339     	add	x25, x25, #0x348
 42623c0: aa1603fa     	mov	x26, x22
 42623c4: 8b17035b     	add	x27, x26, x23
 42623c8: f106a375     	subs	x21, x27, #0x1a8
 42623cc: 54ffda60     	b.eq	0x4261f18 <_ChromeMain+0x425cc7c>
 42623d0: d1002360     	sub	x0, x27, #0x8
 42623d4: d2800001     	mov	x1, #0x0                ; =0
 42623d8: 96f71638     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 42623dc: d1016360     	sub	x0, x27, #0x58
 42623e0: 96f71626     	bl	0x27c78 <_ChromeMain+0x229dc>
 42623e4: 38d9f368     	ldursb	w8, [x27, #-0x61]
 42623e8: 36f800c8     	tbz	w8, #0x1f, 0x4262400 <_ChromeMain+0x425d164>
 42623ec: 8b170348     	add	x8, x26, x23
 42623f0: f8588100     	ldur	x0, [x8, #-0x78]
 42623f4: f8598108     	ldur	x8, [x8, #-0x68]
 42623f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42623fc: 96f69aaf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262400: f90002b9     	str	x25, [x21]
 4262404: 8b170348     	add	x8, x26, x23
 4262408: 38560109     	ldurb	w9, [x8, #-0xa0]
 426240c: 34000129     	cbz	w9, 0x4262430 <_ChromeMain+0x425d194>
 4262410: f8538100     	ldur	x0, [x8, #-0xc8]
 4262414: b40000e0     	cbz	x0, 0x4262430 <_ChromeMain+0x425d194>
 4262418: 8b170348     	add	x8, x26, x23
 426241c: f8540109     	ldur	x9, [x8, #-0xc0]
 4262420: cb0003ea     	neg	x10, x0
 4262424: eb0a013f     	cmp	x9, x10
 4262428: 54ffd788     	b.hi	0x4261f18 <_ChromeMain+0x425cc7c>
 426242c: 14000120     	b	0x42628ac <_ChromeMain+0x425d610>
 4262430: aa1503e0     	mov	x0, x21
 4262434: 974d8697     	bl	0x15c3e90 <_ChromeMain+0x15bebf4>
 4262438: d106a35a     	sub	x26, x26, #0x1a8
 426243c: 9106a318     	add	x24, x24, #0x1a8
 4262440: eb1802ff     	cmp	x23, x24
 4262444: 54fffc01     	b.ne	0x42623c4 <_ChromeMain+0x425d128>
 4262448: f9400288     	ldr	x8, [x20]
 426244c: 14000002     	b	0x4262454 <_ChromeMain+0x425d1b8>
 4262450: aa1603e8     	mov	x8, x22
 4262454: cb0802c8     	sub	x8, x22, x8
 4262458: 9343fd08     	asr	x8, x8, #3
 426245c: d28a43a9     	mov	x9, #0x521d             ; =21021
 4262460: f2b18269     	movk	x9, #0x8c13, lsl #16
 4262464: f2d656e9     	movk	x9, #0xb2b7, lsl #32
 4262468: f2e439e9     	movk	x9, #0x21cf, lsl #48
 426246c: 9b097d08     	mul	x8, x8, x9
 4262470: f9000e68     	str	x8, [x19, #0x18]
 4262474: 17fffc7e     	b	0x426166c <_ChromeMain+0x425c3d0>
 4262478: 13001d09     	sxtb	w9, w8
 426247c: 7100013f     	cmp	w9, #0x0
 4262480: a9402809     	ldp	x9, x10, [x0]
 4262484: 9a804121     	csel	x1, x9, x0, mi
 4262488: 9a884142     	csel	x2, x10, x8, mi
 426248c: 910d43e0     	add	x0, sp, #0x350
 4262490: 970919dc     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4262494: 17fffd60     	b	0x4261a14 <_ChromeMain+0x425c778>
 4262498: f90297ff     	str	xzr, [sp, #0x528]
 426249c: f9429be1     	ldr	x1, [sp, #0x530]
 42624a0: 96f69a86     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42624a4: 17fffe9e     	b	0x4261f1c <_ChromeMain+0x425cc80>
 42624a8: 911103e1     	add	x1, sp, #0x440
 42624ac: aa1403e0     	mov	x0, x20
 42624b0: 94000134     	bl	0x4262980 <_ChromeMain+0x425d6e4>
 42624b4: 17fffe78     	b	0x4261e94 <_ChromeMain+0x425cbf8>
 42624b8: f900779f     	str	xzr, [x28, #0xe8]
 42624bc: f9407b81     	ldr	x1, [x28, #0xf0]
 42624c0: 96f69a7e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42624c4: 17fffeb4     	b	0x4261f94 <_ChromeMain+0x425ccf8>
 42624c8: f94053eb     	ldr	x11, [sp, #0xa0]
 42624cc: f940016a     	ldr	x10, [x11]
 42624d0: 7100013f     	cmp	w9, #0x0
 42624d4: 9a8b4149     	csel	x9, x10, x11, mi
 42624d8: b940012a     	ldr	w10, [x9]
 42624dc: d0044dec     	adrp	x12, 0xcc20000 <dyld_stub_binder+0xcc20000>
 42624e0: 9101158c     	add	x12, x12, #0x45
 42624e4: b940018b     	ldr	w11, [x12]
 42624e8: 39401129     	ldrb	w9, [x9, #0x4]
 42624ec: 3940118c     	ldrb	w12, [x12, #0x4]
 42624f0: 6b0b015f     	cmp	w10, w11
 42624f4: 7a4c0120     	ccmp	w9, w12, #0x0, eq
 42624f8: 54ffe7c1     	b.ne	0x42621f0 <_ChromeMain+0x425cf54>
 42624fc: 1400000b     	b	0x4262528 <_ChromeMain+0x425d28c>
 4262500: f94053eb     	ldr	x11, [sp, #0xa0]
 4262504: f940016a     	ldr	x10, [x11]
 4262508: 7100013f     	cmp	w9, #0x0
 426250c: 9a8b4149     	csel	x9, x10, x11, mi
 4262510: b9400129     	ldr	w9, [x9]
 4262514: d0044dea     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
 4262518: 91012d4a     	add	x10, x10, #0x4b
 426251c: b940014a     	ldr	w10, [x10]
 4262520: 6b0a013f     	cmp	w9, w10
 4262524: 54ffe661     	b.ne	0x42621f0 <_ChromeMain+0x425cf54>
 4262528: 12800009     	mov	w9, #-0x1               ; =-1
 426252c: b90427e9     	str	w9, [sp, #0x424]
 4262530: f1000d1f     	cmp	x8, #0x3
 4262534: 54000a43     	b.lo	0x426267c <_ChromeMain+0x425d3e0>
 4262538: f94053e9     	ldr	x9, [sp, #0xa0]
 426253c: 39411d21     	ldrb	w1, [x9, #0x47]
 4262540: f9401d29     	ldr	x9, [x9, #0x38]
 4262544: 7219003f     	tst	w1, #0x80
 4262548: 9a81112a     	csel	x10, x9, x1, ne
 426254c: f100055f     	cmp	x10, #0x1
 4262550: 54000101     	b.ne	0x4262570 <_ChromeMain+0x425d2d4>
 4262554: f94053ea     	ldr	x10, [sp, #0xa0]
 4262558: f8430d4b     	ldr	x11, [x10, #0x30]!
 426255c: 7219003f     	tst	w1, #0x80
 4262560: 9a8a116a     	csel	x10, x11, x10, ne
 4262564: 3940014a     	ldrb	w10, [x10]
 4262568: 7101995f     	cmp	w10, #0x66
 426256c: 54000440     	b.eq	0x42625f4 <_ChromeMain+0x425d358>
 4262570: f94053e8     	ldr	x8, [sp, #0xa0]
 4262574: 9100c100     	add	x0, x8, #0x30
 4262578: 36380061     	tbz	w1, #0x7, 0x4262584 <_ChromeMain+0x425d2e8>
 426257c: f9400000     	ldr	x0, [x0]
 4262580: aa0903e1     	mov	x1, x9
 4262584: 911093e2     	add	x2, sp, #0x424
 4262588: 97597657     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 426258c: b94427e8     	ldr	w8, [sp, #0x424]
 4262590: 51000508     	sub	w8, w8, #0x1
 4262594: 529fffe9     	mov	w9, #0xffff             ; =65535
 4262598: 6b09011f     	cmp	w8, w9
 426259c: 1a8023e8     	csel	w8, wzr, w0, hs
 42625a0: 360002e8     	tbz	w8, #0x0, 0x42625fc <_ChromeMain+0x425d360>
 42625a4: f9421be8     	ldr	x8, [sp, #0x430]
 42625a8: f100111f     	cmp	x8, #0x4
 42625ac: 54000441     	b.ne	0x4262634 <_ChromeMain+0x425d398>
 42625b0: f94217e8     	ldr	x8, [sp, #0x428]
 42625b4: 39417d0a     	ldrb	w10, [x8, #0x5f]
 42625b8: 13001d49     	sxtb	w9, w10
 42625bc: f940290b     	ldr	x11, [x8, #0x50]
 42625c0: 7100013f     	cmp	w9, #0x0
 42625c4: 9a8a416a     	csel	x10, x11, x10, mi
 42625c8: f100055f     	cmp	x10, #0x1
 42625cc: 54000181     	b.ne	0x42625fc <_ChromeMain+0x425d360>
 42625d0: f8448d0a     	ldr	x10, [x8, #0x48]!
 42625d4: 7100013f     	cmp	w9, #0x0
 42625d8: 9a884148     	csel	x8, x10, x8, mi
 42625dc: 39400108     	ldrb	w8, [x8]
 42625e0: 7101991f     	cmp	w8, #0x66
 42625e4: 540000c1     	b.ne	0x42625fc <_ChromeMain+0x425d360>
 42625e8: 52800036     	mov	w22, #0x1               ; =1
 42625ec: 52800088     	mov	w8, #0x4                ; =4
 42625f0: 14000025     	b	0x4262684 <_ChromeMain+0x425d3e8>
 42625f4: f100111f     	cmp	x8, #0x4
 42625f8: 54000181     	b.ne	0x4262628 <_ChromeMain+0x425d38c>
 42625fc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4262600: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 4262604: f90057ff     	str	xzr, [sp, #0xa8]
 4262608: d2800016     	mov	x22, #0x0               ; =0
 426260c: b9005fff     	str	wzr, [sp, #0x5c]
 4262610: b9007fff     	str	wzr, [sp, #0x7c]
 4262614: f90033ff     	str	xzr, [sp, #0x60]
 4262618: 52800017     	mov	w23, #0x0               ; =0
 426261c: f94217e8     	ldr	x8, [sp, #0x428]
 4262620: f90053e8     	str	x8, [sp, #0xa0]
 4262624: 17fffefb     	b	0x4262210 <_ChromeMain+0x425cf74>
 4262628: 52800036     	mov	w22, #0x1               ; =1
 426262c: 52800068     	mov	w8, #0x3                ; =3
 4262630: 14000015     	b	0x4262684 <_ChromeMain+0x425d3e8>
 4262634: 52800016     	mov	w22, #0x0               ; =0
 4262638: 14000013     	b	0x4262684 <_ChromeMain+0x425d3e8>
 426263c: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 4262640: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 4262644: f90057ff     	str	xzr, [sp, #0xa8]
 4262648: d2800016     	mov	x22, #0x0               ; =0
 426264c: b9005fff     	str	wzr, [sp, #0x5c]
 4262650: b9007fff     	str	wzr, [sp, #0x7c]
 4262654: f90033ff     	str	xzr, [sp, #0x60]
 4262658: 911103e0     	add	x0, sp, #0x440
 426265c: 948ebb95     	bl	0x66114b0 <_ChromeMain+0x660c214>
 4262660: 39d07fe8     	ldrsb	w8, [sp, #0x41f]
 4262664: 36fffdc8     	tbz	w8, #0x1f, 0x426261c <_ChromeMain+0x425d380>
 4262668: f94207e0     	ldr	x0, [sp, #0x408]
 426266c: f9420fe8     	ldr	x8, [sp, #0x418]
 4262670: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4262674: 96f69a11     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262678: 17ffffe9     	b	0x426261c <_ChromeMain+0x425d380>
 426267c: 52800016     	mov	w22, #0x0               ; =0
 4262680: 52800048     	mov	w8, #0x2                ; =2
 4262684: f9020bff     	str	xzr, [sp, #0x410]
 4262688: f90207ff     	str	xzr, [sp, #0x408]
 426268c: f9020fff     	str	xzr, [sp, #0x418]
 4262690: f94053e9     	ldr	x9, [sp, #0xa0]
 4262694: 39805d29     	ldrsb	x9, [x9, #0x17]
 4262698: b6f80089     	tbz	x9, #0x3f, 0x42626a8 <_ChromeMain+0x425d40c>
 426269c: f94053ea     	ldr	x10, [sp, #0xa0]
 42626a0: a940254a     	ldp	x10, x9, [x10]
 42626a4: f90053ea     	str	x10, [sp, #0xa0]
 42626a8: f94053ea     	ldr	x10, [sp, #0xa0]
 42626ac: f90223ea     	str	x10, [sp, #0x440]
 42626b0: f90227e9     	str	x9, [sp, #0x448]
 42626b4: d004ba69     	adrp	x9, 0xd9b0000 <dyld_stub_binder+0xd9b0000>
 42626b8: 91180529     	add	x9, x9, #0x601
 42626bc: f9022be9     	str	x9, [sp, #0x450]
 42626c0: 52800069     	mov	w9, #0x3                ; =3
 42626c4: f9022fe9     	str	x9, [sp, #0x458]
 42626c8: f100051f     	cmp	x8, #0x1
 42626cc: 54ffc269     	b.ls	0x4261f18 <_ChromeMain+0x425cc7c>
 42626d0: f94217ea     	ldr	x10, [sp, #0x428]
 42626d4: 3980bd48     	ldrsb	x8, [x10, #0x2f]
 42626d8: b7f80068     	tbnz	x8, #0x3f, 0x42626e4 <_ChromeMain+0x425d448>
 42626dc: 91006149     	add	x9, x10, #0x18
 42626e0: 14000002     	b	0x42626e8 <_ChromeMain+0x425d44c>
 42626e4: a941a149     	ldp	x9, x8, [x10, #0x18]
 42626e8: f90233e9     	str	x9, [sp, #0x460]
 42626ec: f90237e8     	str	x8, [sp, #0x468]
 42626f0: 911023e8     	add	x8, sp, #0x408
 42626f4: 911103e0     	add	x0, sp, #0x440
 42626f8: 52800061     	mov	w1, #0x3                ; =3
 42626fc: 97102116     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4262700: b94427e0     	ldr	w0, [sp, #0x424]
 4262704: 3100041f     	cmn	w0, #0x1
 4262708: 54000380     	b.eq	0x4262778 <_ChromeMain+0x425d4dc>
 426270c: f004ac28     	adrp	x8, 0xd7e9000 <dyld_stub_binder+0xd7e9000>
 4262710: 9110e108     	add	x8, x8, #0x438
 4262714: f90223e8     	str	x8, [sp, #0x440]
 4262718: 52800028     	mov	w8, #0x1                ; =1
 426271c: f90227e8     	str	x8, [sp, #0x448]
 4262720: 910fc3e8     	add	x8, sp, #0x3f0
 4262724: 973b3ac7     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 4262728: 39901fe8     	ldrsb	x8, [sp, #0x407]
 426272c: f941fbe9     	ldr	x9, [sp, #0x3f0]
 4262730: f941ffea     	ldr	x10, [sp, #0x3f8]
 4262734: f100011f     	cmp	x8, #0x0
 4262738: 910fc3eb     	add	x11, sp, #0x3f0
 426273c: 9a8b4129     	csel	x9, x9, x11, mi
 4262740: 7100011f     	cmp	w8, #0x0
 4262744: 9a884148     	csel	x8, x10, x8, mi
 4262748: f9022be9     	str	x9, [sp, #0x450]
 426274c: f9022fe8     	str	x8, [sp, #0x458]
 4262750: 911023e0     	add	x0, sp, #0x408
 4262754: 911103e1     	add	x1, sp, #0x440
 4262758: 52800042     	mov	w2, #0x2                ; =2
 426275c: 973284e4     	bl	0xf03aec <_ChromeMain+0xefe850>
 4262760: 39d01fe8     	ldrsb	w8, [sp, #0x407]
 4262764: 36f800a8     	tbz	w8, #0x1f, 0x4262778 <_ChromeMain+0x425d4dc>
 4262768: f941fbe0     	ldr	x0, [sp, #0x3f0]
 426276c: f94203e8     	ldr	x8, [sp, #0x400]
 4262770: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4262774: 96f699d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262778: f9025bff     	str	xzr, [sp, #0x4b0]
 426277c: 6f00e400     	movi.2d	v0, #0000000000000000
 4262780: ad150300     	stp	q0, q0, [x24, #0x2a0]
 4262784: ad140300     	stp	q0, q0, [x24, #0x280]
 4262788: ad130300     	stp	q0, q0, [x24, #0x260]
 426278c: 3d809700     	str	q0, [x24, #0x250]
 4262790: 911103e8     	add	x8, sp, #0x440
 4262794: 911023e0     	add	x0, sp, #0x408
 4262798: aa1603e1     	mov	x1, x22
 426279c: 952c46bc     	bl	0x8d7428c <_ChromeMain+0x8d6eff0>
 42627a0: 395103e8     	ldrb	w8, [sp, #0x440]
 42627a4: 7100091f     	cmp	w8, #0x2
 42627a8: 540009e2     	b.hs	0x42628e4 <_ChromeMain+0x425d648>
 42627ac: 7100011f     	cmp	w8, #0x0
 42627b0: 1a9f17f7     	cset	w23, eq
 42627b4: 35fff448     	cbnz	w8, 0x426263c <_ChromeMain+0x425d3a0>
 42627b8: 794893e8     	ldrh	w8, [sp, #0x448]
 42627bc: f9422beb     	ldr	x11, [sp, #0x450]
 42627c0: f9422fe9     	ldr	x9, [sp, #0x458]
 42627c4: f9003be9     	str	x9, [sp, #0x70]
 42627c8: 911103e9     	add	x9, sp, #0x440
 42627cc: a9017d3f     	stp	xzr, xzr, [x9, #0x10]
 42627d0: f94233ea     	ldr	x10, [sp, #0x460]
 42627d4: f90057ea     	str	x10, [sp, #0xa8]
 42627d8: f94237ea     	ldr	x10, [sp, #0x468]
 42627dc: a9092beb     	stp	x11, x10, [sp, #0x90]
 42627e0: f9423bea     	ldr	x10, [sp, #0x470]
 42627e4: f90037ea     	str	x10, [sp, #0x68]
 42627e8: f9423ff6     	ldr	x22, [sp, #0x478]
 42627ec: a9037d3f     	stp	xzr, xzr, [x9, #0x30]
 42627f0: a9027d3f     	stp	xzr, xzr, [x9, #0x20]
 42627f4: 395243e9     	ldrb	w9, [sp, #0x490]
 42627f8: b9007fe9     	str	w9, [sp, #0x7c]
 42627fc: 37000189     	tbnz	w9, #0x0, 0x426282c <_ChromeMain+0x425d590>
 4262800: b9005fff     	str	wzr, [sp, #0x5c]
 4262804: 12001d09     	and	w9, w8, #0xff
 4262808: 53087d08     	lsr	w8, w8, #8
 426280c: 290c23e9     	stp	w9, w8, [sp, #0x60]
 4262810: 911103e8     	add	x8, sp, #0x440
 4262814: 3cc58100     	ldur	q0, [x8, #0x58]
 4262818: d10283a9     	sub	x9, x29, #0xa0
 426281c: 3c807120     	stur	q0, [x9, #0x7]
 4262820: 3cc64100     	ldur	q0, [x8, #0x64]
 4262824: 3c813120     	stur	q0, [x9, #0x13]
 4262828: 17ffff8c     	b	0x4262658 <_ChromeMain+0x425d3bc>
 426282c: 395203e9     	ldrb	w9, [sp, #0x480]
 4262830: b9005fe9     	str	w9, [sp, #0x5c]
 4262834: 911103ea     	add	x10, sp, #0x440
 4262838: f8441149     	ldur	x9, [x10, #0x41]
 426283c: f81883a9     	stur	x9, [x29, #-0x78]
 4262840: f8448149     	ldur	x9, [x10, #0x48]
 4262844: f806f2a9     	stur	x9, [x21, #0x6f]
 4262848: a9047d5f     	stp	xzr, xzr, [x10, #0x40]
 426284c: 17ffffee     	b	0x4262804 <_ChromeMain+0x425d568>
 4262850: 52800015     	mov	w21, #0x0               ; =0
 4262854: 17fff911     	b	0x4260c98 <_ChromeMain+0x425b9fc>
 4262858: 9004ac95     	adrp	x21, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 426285c: 9138deb5     	add	x21, x21, #0xe37
 4262860: 17fff923     	b	0x4260cec <_ChromeMain+0x425ba50>
 4262864: b004ac75     	adrp	x21, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 4262868: 912582b5     	add	x21, x21, #0x960
 426286c: 17fff966     	b	0x4260e04 <_ChromeMain+0x425bb68>
 4262870: f004ac55     	adrp	x21, 0xd7ed000 <dyld_stub_binder+0xd7ed000>
 4262874: 910532b5     	add	x21, x21, #0x14c
 4262878: 17fff91d     	b	0x4260cec <_ChromeMain+0x425ba50>
 426287c: d004acd5     	adrp	x21, 0xd7fc000 <dyld_stub_binder+0xd7fc000>
 4262880: 912dcab5     	add	x21, x21, #0xb72
 4262884: 17fff91a     	b	0x4260cec <_ChromeMain+0x425ba50>
 4262888: b004b315     	adrp	x21, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 426288c: 912c6ab5     	add	x21, x21, #0xb1a
 4262890: 17fff98f     	b	0x4260ecc <_ChromeMain+0x425bc30>
 4262894: b004c5f5     	adrp	x21, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4262898: 912d62b5     	add	x21, x21, #0xb58
 426289c: 17fff99e     	b	0x4260f14 <_ChromeMain+0x425bc78>
 42628a0: d004c5d5     	adrp	x21, 0xdb1c000 <dyld_stub_binder+0xdb1c000>
 42628a4: 911ff2b5     	add	x21, x21, #0x7fc
 42628a8: 17fff99b     	b	0x4260f14 <_ChromeMain+0x425bc78>
 42628ac: f814011f     	stur	xzr, [x8, #-0xc0]
 42628b0: f8548101     	ldur	x1, [x8, #-0xb8]
 42628b4: 96f69981     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42628b8: 17fffede     	b	0x4262430 <_ChromeMain+0x425d194>
 42628bc: b004c5f5     	adrp	x21, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42628c0: 912d96b5     	add	x21, x21, #0xb65
 42628c4: 52800113     	mov	w19, #0x8               ; =8
 42628c8: 17fff90a     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 42628cc: b004c5f5     	adrp	x21, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42628d0: 912dbab5     	add	x21, x21, #0xb6e
 42628d4: 52800153     	mov	w19, #0xa               ; =10
 42628d8: 17fff906     	b	0x4260cf0 <_ChromeMain+0x425ba54>
 42628dc: f90063ff     	str	xzr, [sp, #0xc0]
 42628e0: 17fffb38     	b	0x42615c0 <_ChromeMain+0x425c324>
 42628e4: d4200000     	brk	#0
 42628e8: d4400000     	hlt	#0
 42628ec: d4200020     	brk	#0x1
 42628f0: f94043e1     	ldr	x1, [sp, #0x80]
 42628f4: f94053e8     	ldr	x8, [sp, #0xa0]
 42628f8: b3481901     	bfi	x1, x8, #56, #7
 42628fc: f9404be0     	ldr	x0, [sp, #0x90]
 4262900: 96f6996e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262904: 17fffbba     	b	0x42617ec <_ChromeMain+0x425c550>
 4262908: f9406be0     	ldr	x0, [sp, #0xd0]
 426290c: f94073e8     	ldr	x8, [sp, #0xe0]
 4262910: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4262914: 96f69969     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4262918: 17fffcce     	b	0x4261c50 <_ChromeMain+0x425c9b4>
 426291c: f94237e0     	ldr	x0, [sp, #0x468]
 4262920: f9423fe8     	ldr	x8, [sp, #0x478]
 4262924: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4262928: 96f69964     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426292c: 17fffda9     	b	0x4261fd0 <_ChromeMain+0x425cd34>
 4262930: f94237e0     	ldr	x0, [sp, #0x468]
 4262934: f9423fe8     	ldr	x8, [sp, #0x478]
 4262938: 9240f901     	and	x1, x8, #0x7fffffffffffffff
