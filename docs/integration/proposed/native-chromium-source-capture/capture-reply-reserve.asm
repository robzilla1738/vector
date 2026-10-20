
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42534e8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 42534ec: a90167fa     	stp	x26, x25, [sp, #0x10]
 42534f0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 42534f4: a90357f6     	stp	x22, x21, [sp, #0x30]
 42534f8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 42534fc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4253500: 910143fd     	add	x29, sp, #0x50
 4253504: d10703ff     	sub	sp, sp, #0x1c0
 4253508: aa0203f4     	mov	x20, x2
 425350c: aa0103f5     	mov	x21, x1
 4253510: aa0003f3     	mov	x19, x0
 4253514: b9401c08     	ldr	w8, [x0, #0x1c]
 4253518: 7100051f     	cmp	w8, #0x1
 425351c: 54000d41     	b.ne	0x42536c4 <_ChromeMain+0x424e428>
 4253520: f9400268     	ldr	x8, [x19]
 4253524: b4000d88     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253528: 19404108     	ldapurb	w8, [x8, #0x4]
 425352c: 35000d48     	cbnz	w8, 0x42536d4 <_ChromeMain+0x424e438>
 4253530: f9400668     	ldr	x8, [x19, #0x8]
 4253534: b4000d08     	cbz	x8, 0x42536d4 <_ChromeMain+0x424e438>
 4253538: f9400268     	ldr	x8, [x19]
 425353c: b4002e88     	cbz	x8, 0x4253b0c <_ChromeMain+0x424e870>
 4253540: 19404108     	ldapurb	w8, [x8, #0x4]
 4253544: 35002e48     	cbnz	w8, 0x4253b0c <_ChromeMain+0x424e870>
 4253548: f9400668     	ldr	x8, [x19, #0x8]
 425354c: f9413918     	ldr	x24, [x8, #0x270]
 4253550: b4000c38     	cbz	x24, 0x42536d4 <_ChromeMain+0x424e438>
 4253554: f9403a76     	ldr	x22, [x19, #0x70]
 4253558: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425355c: 91093000     	add	x0, x0, #0x24c
 4253560: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253564: 91080821     	add	x1, x1, #0x202
 4253568: 9103c3e8     	add	x8, sp, #0xf0
 425356c: 52810be2     	mov	w2, #0x85f              ; =2143
 4253570: 96f7f5c4     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253574: 52800e00     	mov	w0, #0x70               ; =112
 4253578: 96f6ef7c     	bl	0xf368 <_ChromeMain+0xa0cc>
 425357c: aa0003f7     	mov	x23, x0
 4253580: 52800028     	mov	w8, #0x1                ; =1
 4253584: 100318a9     	adr	x9, 0x4259898 <_ChromeMain+0x42545fc>
 4253588: d503201f     	nop
 425358c: 10031caa     	adr	x10, 0x4259920 <_ChromeMain+0x4254684>
 4253590: d503201f     	nop
 4253594: b9000008     	str	w8, [x0]
 4253598: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 425359c: 912c0108     	add	x8, x8, #0xb00
 42535a0: 100045cb     	adr	x11, 0x4253e58 <_ChromeMain+0x424ebbc>
 42535a4: d503201f     	nop
 42535a8: a900a809     	stp	x9, x10, [x0, #0x8]
 42535ac: a901ac08     	stp	x8, x11, [x0, #0x18]
 42535b0: b9401a68     	ldr	w8, [x19, #0x18]
 42535b4: b9002808     	str	w8, [x0, #0x28]
 42535b8: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 42535bc: 37f809e8     	tbnz	w8, #0x1f, 0x42536f8 <_ChromeMain+0x424e45c>
 42535c0: 3cc082a0     	ldur	q0, [x21, #0x8]
 42535c4: 3c8302e0     	stur	q0, [x23, #0x30]
 42535c8: f84182a8     	ldur	x8, [x21, #0x18]
 42535cc: f80402e8     	stur	x8, [x23, #0x40]
 42535d0: 39405269     	ldrb	w9, [x19, #0x14]
 42535d4: aa1703e8     	mov	x8, x23
 42535d8: 38050d1f     	strb	wzr, [x8, #0x50]!
 42535dc: 381f8109     	sturb	w9, [x8, #-0x8]
 42535e0: 3900611f     	strb	wzr, [x8, #0x18]
 42535e4: 39406289     	ldrb	w9, [x20, #0x18]
 42535e8: 34000129     	cbz	w9, 0x425360c <_ChromeMain+0x424e370>
 42535ec: 3dc00280     	ldr	q0, [x20]
 42535f0: 3d800100     	str	q0, [x8]
 42535f4: f9400a89     	ldr	x9, [x20, #0x10]
 42535f8: f9000909     	str	x9, [x8, #0x10]
 42535fc: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 4253600: f900029f     	str	xzr, [x20]
 4253604: 52800028     	mov	w8, #0x1                ; =1
 4253608: 3901a2e8     	strb	w8, [x23, #0x68]
 425360c: f9404274     	ldr	x20, [x19, #0x80]
 4253610: b40000d4     	cbz	x20, 0x4253628 <_ChromeMain+0x424e38c>
 4253614: 52800028     	mov	w8, #0x1                ; =1
 4253618: b8280288     	ldadd	w8, w8, [x20]
 425361c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253620: 6b09011f     	cmp	w8, w9
 4253624: 540027a0     	b.eq	0x4253b18 <_ChromeMain+0x424e87c>
 4253628: f9404675     	ldr	x21, [x19, #0x88]
 425362c: f9406313     	ldr	x19, [x24, #0xc0]
 4253630: b40000d3     	cbz	x19, 0x4253648 <_ChromeMain+0x424e3ac>
 4253634: 52800028     	mov	w8, #0x1                ; =1
 4253638: b8280268     	ldadd	w8, w8, [x19]
 425363c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253640: 6b09011f     	cmp	w8, w9
 4253644: 54002700     	b.eq	0x4253b24 <_ChromeMain+0x424e888>
 4253648: f9406718     	ldr	x24, [x24, #0xc8]
 425364c: 52800a00     	mov	w0, #0x50               ; =80
 4253650: 96f6ef46     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253654: aa0003e3     	mov	x3, x0
 4253658: 52800028     	mov	w8, #0x1                ; =1
 425365c: b9000008     	str	w8, [x0]
 4253660: 1004d888     	adr	x8, 0x425d170 <_ChromeMain+0x4257ed4>
 4253664: d503201f     	nop
 4253668: 90ffef49     	adrp	x9, 0x403b000 <_ChromeMain+0x4035d64>
 425366c: 91178129     	add	x9, x9, #0x5e0
 4253670: a900a408     	stp	x8, x9, [x0, #0x8]
 4253674: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253678: 911b0108     	add	x8, x8, #0x6c0
 425367c: 1000ff29     	adr	x9, 0x4255660 <_ChromeMain+0x42503c4>
 4253680: d503201f     	nop
 4253684: a901a408     	stp	x8, x9, [x0, #0x18]
 4253688: a902d01f     	stp	xzr, x20, [x0, #0x28]
 425368c: a903cc15     	stp	x21, x19, [x0, #0x38]
 4253690: f9002418     	str	x24, [x0, #0x48]
 4253694: 9103c3e1     	add	x1, sp, #0xf0
 4253698: aa1603e0     	mov	x0, x22
 425369c: aa1703e2     	mov	x2, x23
 42536a0: 940001b2     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 42536a4: 910703ff     	add	sp, sp, #0x1c0
 42536a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536c0: d65f03c0     	ret
 42536c4: f0056488     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42536c8: f9467d00     	ldr	x0, [x8, #0xcf8]
 42536cc: 975f312b     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 42536d0: b5000360     	cbnz	x0, 0x425373c <_ChromeMain+0x424e4a0>
 42536d4: aa1303e0     	mov	x0, x19
 42536d8: 910703ff     	add	sp, sp, #0x1c0
 42536dc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42536e0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42536e4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42536e8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42536ec: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42536f0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42536f4: 14000112     	b	0x4253b3c <_ChromeMain+0x424e8a0>
 42536f8: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 42536fc: 9100c2e0     	add	x0, x23, #0x30
 4253700: 96f712c6     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253704: 17ffffb3     	b	0x42535d0 <_ChromeMain+0x424e334>
 4253708: f9401e60     	ldr	x0, [x19, #0x38]
 425370c: f9402668     	ldr	x8, [x19, #0x48]
 4253710: d37ff901     	lsl	x1, x8, #1
 4253714: 96f6d5e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253718: 1400002e     	b	0x42537d0 <_ChromeMain+0x424e534>
 425371c: a9438a61     	ldp	x1, x2, [x19, #0x38]
 4253720: aa1703e0     	mov	x0, x23
 4253724: 9719ebf2     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4253728: 14000052     	b	0x4253870 <_ChromeMain+0x424e5d4>
 425372c: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253730: 9103c3e0     	add	x0, sp, #0xf0
 4253734: 970954e0     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4253738: 14000042     	b	0x4253840 <_ChromeMain+0x424e5a4>
 425373c: aa0003f7     	mov	x23, x0
 4253740: 975f3134     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4253744: aa0003f6     	mov	x22, x0
 4253748: 9103c3e8     	add	x8, sp, #0xf0
 425374c: aa1703e0     	mov	x0, x23
 4253750: 94e1cff8     	bl	0x7ac7730 <_ChromeMain+0x7ac2494>
 4253754: 91008278     	add	x24, x19, #0x20
 4253758: 39c0de68     	ldrsb	w8, [x19, #0x37]
 425375c: 37f81be8     	tbnz	w8, #0x1f, 0x4253ad8 <_ChromeMain+0x424e83c>
 4253760: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 4253764: 3d800300     	str	q0, [x24]
 4253768: f94083e8     	ldr	x8, [sp, #0x100]
 425376c: f9000b08     	str	x8, [x24, #0x10]
 4253770: b9401a60     	ldr	w0, [x19, #0x18]
 4253774: a90fffff     	stp	xzr, xzr, [sp, #0xf8]
 4253778: f9007bff     	str	xzr, [sp, #0xf0]
 425377c: 9103c3fa     	add	x26, sp, #0xf0
 4253780: 9103c3e8     	add	x8, sp, #0xf0
 4253784: 940031c3     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4253788: f004e921     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425378c: 91130021     	add	x1, x1, #0x4c0
 4253790: 9103c3e0     	add	x0, sp, #0xf0
 4253794: 52800062     	mov	w2, #0x3                ; =3
 4253798: 97270b14     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 425379c: aa1503e8     	mov	x8, x21
 42537a0: f8420d09     	ldr	x9, [x8, #0x20]!
 42537a4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 42537a8: f100015f     	cmp	x10, #0x0
 42537ac: 9a884121     	csel	x1, x9, x8, mi
 42537b0: f9400508     	ldr	x8, [x8, #0x8]
 42537b4: 7100015f     	cmp	w10, #0x0
 42537b8: 9a8a4102     	csel	x2, x8, x10, mi
 42537bc: 9103c3e0     	add	x0, sp, #0xf0
 42537c0: 97270b0a     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 42537c4: 9100e279     	add	x25, x19, #0x38
 42537c8: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 42537cc: 37fff9e8     	tbnz	w8, #0x1f, 0x4253708 <_ChromeMain+0x424e46c>
 42537d0: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 42537d4: 3d800320     	str	q0, [x25]
 42537d8: f94083e8     	ldr	x8, [sp, #0x100]
 42537dc: f9000b28     	str	x8, [x25, #0x10]
 42537e0: f900dbff     	str	xzr, [sp, #0x1b0]
 42537e4: 6f00e400     	movi.2d	v0, #0000000000000000
 42537e8: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 42537ec: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 42537f0: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 42537f4: ad0983e0     	stp	q0, q0, [sp, #0x130]
 42537f8: ad0883e0     	stp	q0, q0, [sp, #0x110]
 42537fc: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 4253800: 97ae1b11     	bl	0x2dda444 <_ChromeMain+0x2dd51a8>
 4253804: aa0003e1     	mov	x1, x0
 4253808: 91022340     	add	x0, x26, #0x88
 425380c: 97ae1ac0     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4253810: 790363ff     	strh	wzr, [sp, #0x1b0]
 4253814: 3906cbff     	strb	wzr, [sp, #0x1b2]
 4253818: eb18035f     	cmp	x26, x24
 425381c: 54000120     	b.eq	0x4253840 <_ChromeMain+0x424e5a4>
 4253820: 39c41fe9     	ldrsb	w9, [sp, #0x107]
 4253824: 3940de68     	ldrb	w8, [x19, #0x37]
 4253828: 37f81629     	tbnz	w9, #0x1f, 0x4253aec <_ChromeMain+0x424e850>
 425382c: 373ff808     	tbnz	w8, #0x7, 0x425372c <_ChromeMain+0x424e490>
 4253830: 3dc00300     	ldr	q0, [x24]
 4253834: 3d803fe0     	str	q0, [sp, #0xf0]
 4253838: f9400b08     	ldr	x8, [x24, #0x10]
 425383c: f90083e8     	str	x8, [sp, #0x100]
 4253840: 9103c3e8     	add	x8, sp, #0xf0
 4253844: 91006117     	add	x23, x8, #0x18
 4253848: eb1902ff     	cmp	x23, x25
 425384c: 54000120     	b.eq	0x4253870 <_ChromeMain+0x424e5d4>
 4253850: 39c47fe9     	ldrsb	w9, [sp, #0x11f]
 4253854: 39413e68     	ldrb	w8, [x19, #0x4f]
 4253858: 37f81309     	tbnz	w9, #0x1f, 0x4253ab8 <_ChromeMain+0x424e81c>
 425385c: 373ff608     	tbnz	w8, #0x7, 0x425371c <_ChromeMain+0x424e480>
 4253860: 3dc00320     	ldr	q0, [x25]
 4253864: 3d8002e0     	str	q0, [x23]
 4253868: f9400b28     	ldr	x8, [x25, #0x10]
 425386c: f9000ae8     	str	x8, [x23, #0x10]
 4253870: aa1603e0     	mov	x0, x22
 4253874: 94e1e9af     	bl	0x7acdf30 <_ChromeMain+0x7ac8c94>
 4253878: f94083e8     	ldr	x8, [sp, #0x100]
 425387c: f9001be8     	str	x8, [sp, #0x30]
 4253880: f9400ae8     	ldr	x8, [x23, #0x10]
 4253884: f90027e8     	str	x8, [sp, #0x48]
 4253888: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 425388c: 3d800be0     	str	q0, [sp, #0x20]
 4253890: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 4253894: 3dc002e0     	ldr	q0, [x23]
 4253898: 3c8383e0     	stur	q0, [sp, #0x38]
 425389c: a9007eff     	stp	xzr, xzr, [x23]
 42538a0: f9000aff     	str	xzr, [x23, #0x10]
 42538a4: f9409be8     	ldr	x8, [sp, #0x130]
 42538a8: f90033e8     	str	x8, [sp, #0x60]
 42538ac: 3dc04be0     	ldr	q0, [sp, #0x120]
 42538b0: 3d8017e0     	str	q0, [sp, #0x50]
 42538b4: f90083ff     	str	xzr, [sp, #0x100]
 42538b8: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 42538bc: 9100e7e8     	add	x8, sp, #0x39
 42538c0: 3ccff100     	ldur	q0, [x8, #0xff]
 42538c4: f940a7e8     	ldr	x8, [sp, #0x148]
 42538c8: f9003fe8     	str	x8, [sp, #0x78]
 42538cc: 3c8683e0     	stur	q0, [sp, #0x68]
 42538d0: a9147fff     	stp	xzr, xzr, [sp, #0x140]
 42538d4: a9137fff     	stp	xzr, xzr, [sp, #0x130]
 42538d8: f900afe0     	str	x0, [sp, #0x158]
 42538dc: ad4a87e0     	ldp	q0, q1, [sp, #0x150]
 42538e0: f940bbe8     	ldr	x8, [sp, #0x170]
 42538e4: f90053e8     	str	x8, [sp, #0xa0]
 42538e8: ad0407e0     	stp	q0, q1, [sp, #0x80]
 42538ec: a9167fff     	stp	xzr, xzr, [sp, #0x160]
 42538f0: 910083e8     	add	x8, sp, #0x20
 42538f4: f900bbff     	str	xzr, [sp, #0x170]
 42538f8: 91022100     	add	x0, x8, #0x88
 42538fc: 91022341     	add	x1, x26, #0x88
 4253900: 97ae1a83     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4253904: 784c0348     	ldurh	w8, [x26, #0xc0]
 4253908: 7901c3e8     	strh	w8, [sp, #0xe0]
 425390c: 384c2348     	ldurb	w8, [x26, #0xc2]
 4253910: 39038be8     	strb	w8, [sp, #0xe2]
 4253914: 910083e1     	add	x1, sp, #0x20
 4253918: aa1603e0     	mov	x0, x22
 425391c: 979aaa15     	bl	0x28fe170 <_ChromeMain+0x28f8ed4>
 4253920: 910083e0     	add	x0, sp, #0x20
 4253924: 979beef8     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253928: f9403a76     	ldr	x22, [x19, #0x70]
 425392c: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253930: 91093000     	add	x0, x0, #0x24c
 4253934: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253938: 91080821     	add	x1, x1, #0x202
 425393c: 910003e8     	mov	x8, sp
 4253940: 52810f62     	mov	w2, #0x87b              ; =2171
 4253944: 96f7f4cf     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253948: 52801300     	mov	w0, #0x98               ; =152
 425394c: 96f6ee87     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253950: aa0003f7     	mov	x23, x0
 4253954: 52800028     	mov	w8, #0x1                ; =1
 4253958: 1004cdc9     	adr	x9, 0x425d310 <_ChromeMain+0x4258074>
 425395c: d503201f     	nop
 4253960: 1004d20a     	adr	x10, 0x425d3a0 <_ChromeMain+0x4258104>
 4253964: d503201f     	nop
 4253968: b9000008     	str	w8, [x0]
 425396c: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4253970: 912c0108     	add	x8, x8, #0xb00
 4253974: 1000f7ab     	adr	x11, 0x4255868 <_ChromeMain+0x42505cc>
 4253978: d503201f     	nop
 425397c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253980: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253984: b9401a68     	ldr	w8, [x19, #0x18]
 4253988: b9002808     	str	w8, [x0, #0x28]
 425398c: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 4253990: 37f807c8     	tbnz	w8, #0x1f, 0x4253a88 <_ChromeMain+0x424e7ec>
 4253994: 3cc082a0     	ldur	q0, [x21, #0x8]
 4253998: 3c8302e0     	stur	q0, [x23, #0x30]
 425399c: f84182a8     	ldur	x8, [x21, #0x18]
 42539a0: f80402e8     	stur	x8, [x23, #0x40]
 42539a4: 39c0de68     	ldrsb	w8, [x19, #0x37]
 42539a8: 37f80808     	tbnz	w8, #0x1f, 0x4253aa8 <_ChromeMain+0x424e80c>
 42539ac: 3dc00300     	ldr	q0, [x24]
 42539b0: 3c8482e0     	stur	q0, [x23, #0x48]
 42539b4: f9400b08     	ldr	x8, [x24, #0x10]
 42539b8: f80582e8     	stur	x8, [x23, #0x58]
 42539bc: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 42539c0: 37f806c8     	tbnz	w8, #0x1f, 0x4253a98 <_ChromeMain+0x424e7fc>
 42539c4: 3dc00320     	ldr	q0, [x25]
 42539c8: 3c8602e0     	stur	q0, [x23, #0x60]
 42539cc: f9400b28     	ldr	x8, [x25, #0x10]
 42539d0: f80702e8     	stur	x8, [x23, #0x70]
 42539d4: aa1703e8     	mov	x8, x23
 42539d8: 38078d1f     	strb	wzr, [x8, #0x78]!
 42539dc: 3900611f     	strb	wzr, [x8, #0x18]
 42539e0: 39406289     	ldrb	w9, [x20, #0x18]
 42539e4: 34000129     	cbz	w9, 0x4253a08 <_ChromeMain+0x424e76c>
 42539e8: 3dc00280     	ldr	q0, [x20]
 42539ec: 3d800100     	str	q0, [x8]
 42539f0: f9400a89     	ldr	x9, [x20, #0x10]
 42539f4: f9000909     	str	x9, [x8, #0x10]
 42539f8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 42539fc: f900029f     	str	xzr, [x20]
 4253a00: 52800028     	mov	w8, #0x1                ; =1
 4253a04: 390242e8     	strb	w8, [x23, #0x90]
 4253a08: f9404274     	ldr	x20, [x19, #0x80]
 4253a0c: b40000d4     	cbz	x20, 0x4253a24 <_ChromeMain+0x424e788>
 4253a10: 52800028     	mov	w8, #0x1                ; =1
 4253a14: b8280288     	ldadd	w8, w8, [x20]
 4253a18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253a1c: 6b09011f     	cmp	w8, w9
 4253a20: 54000880     	b.eq	0x4253b30 <_ChromeMain+0x424e894>
 4253a24: f9404673     	ldr	x19, [x19, #0x88]
 4253a28: 52800800     	mov	w0, #0x40               ; =64
 4253a2c: 96f6ee4f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253a30: aa0003e3     	mov	x3, x0
 4253a34: 52800028     	mov	w8, #0x1                ; =1
 4253a38: 1005b029     	adr	x9, 0x425f03c <_ChromeMain+0x4259da0>
 4253a3c: d503201f     	nop
 4253a40: b0ffe8ca     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4253a44: 912b014a     	add	x10, x10, #0xac0
 4253a48: b9000008     	str	w8, [x0]
 4253a4c: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253a50: 911b0108     	add	x8, x8, #0x6c0
 4253a54: 1001df6b     	adr	x11, 0x4257640 <_ChromeMain+0x42523a4>
 4253a58: d503201f     	nop
 4253a5c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253a60: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253a64: a902d01f     	stp	xzr, x20, [x0, #0x28]
 4253a68: f9001c13     	str	x19, [x0, #0x38]
 4253a6c: 910003e1     	mov	x1, sp
 4253a70: aa1603e0     	mov	x0, x22
 4253a74: aa1703e2     	mov	x2, x23
 4253a78: 940000bc     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 4253a7c: 9103c3e0     	add	x0, sp, #0xf0
 4253a80: 979beea1     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253a84: 17ffff08     	b	0x42536a4 <_ChromeMain+0x424e408>
 4253a88: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 4253a8c: 9100c2e0     	add	x0, x23, #0x30
 4253a90: 96f711e2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253a94: 17ffffc4     	b	0x42539a4 <_ChromeMain+0x424e708>
 4253a98: a9438a61     	ldp	x1, x2, [x19, #0x38]
 4253a9c: 910182e0     	add	x0, x23, #0x60
 4253aa0: 96f7cc4c     	bl	0x46bd0 <_ChromeMain+0x41934>
 4253aa4: 17ffffcc     	b	0x42539d4 <_ChromeMain+0x424e738>
 4253aa8: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253aac: 910122e0     	add	x0, x23, #0x48
 4253ab0: 96f711da     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253ab4: 17ffffc2     	b	0x42539bc <_ChromeMain+0x424e720>
 4253ab8: 13001d09     	sxtb	w9, w8
 4253abc: 7100013f     	cmp	w9, #0x0
 4253ac0: a943aa69     	ldp	x9, x10, [x19, #0x38]
 4253ac4: 9a994121     	csel	x1, x9, x25, mi
 4253ac8: 9a884142     	csel	x2, x10, x8, mi
 4253acc: aa1703e0     	mov	x0, x23
 4253ad0: 9719eb59     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4253ad4: 17ffff67     	b	0x4253870 <_ChromeMain+0x424e5d4>
 4253ad8: f9401260     	ldr	x0, [x19, #0x20]
 4253adc: f9401a68     	ldr	x8, [x19, #0x30]
 4253ae0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4253ae4: 96f6d4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253ae8: 17ffff1e     	b	0x4253760 <_ChromeMain+0x424e4c4>
 4253aec: 13001d09     	sxtb	w9, w8
 4253af0: 7100013f     	cmp	w9, #0x0
 4253af4: a9422a69     	ldp	x9, x10, [x19, #0x20]
 4253af8: 9a984121     	csel	x1, x9, x24, mi
 4253afc: 9a884142     	csel	x2, x10, x8, mi
 4253b00: 9103c3e0     	add	x0, sp, #0xf0
 4253b04: 9709543f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4253b08: 17ffff4e     	b	0x4253840 <_ChromeMain+0x424e5a4>
 4253b0c: d4200000     	brk	#0
 4253b10: d4400000     	hlt	#0
 4253b14: d4200020     	brk	#0x1
 4253b18: d4200000     	brk	#0
 4253b1c: d4400000     	hlt	#0
 4253b20: d4200020     	brk	#0x1
 4253b24: d4200000     	brk	#0
 4253b28: d4400000     	hlt	#0
 4253b2c: d4200020     	brk	#0x1
 4253b30: d4200000     	brk	#0
 4253b34: d4400000     	hlt	#0
 4253b38: d4200020     	brk	#0x1
