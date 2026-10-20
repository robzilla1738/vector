
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465352c: d10343ff     	sub	sp, sp, #0xd0
 4653530: a9076ffc     	stp	x28, x27, [sp, #0x70]
 4653534: a90867fa     	stp	x26, x25, [sp, #0x80]
 4653538: a9095ff8     	stp	x24, x23, [sp, #0x90]
 465353c: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4653540: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4653544: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4653548: 910303fd     	add	x29, sp, #0xc0
 465354c: 39405c29     	ldrb	w9, [x1, #0x17]
 4653550: 13001d28     	sxtb	w8, w9
 4653554: f940042a     	ldr	x10, [x1, #0x8]
 4653558: 7100011f     	cmp	w8, #0x0
 465355c: 9a894157     	csel	x23, x10, x9, mi
 4653560: b4000157     	cbz	x23, 0x4653588 <_ChromeMain+0x464e2ec>
 4653564: aa0103f4     	mov	x20, x1
 4653568: aa0003f3     	mov	x19, x0
 465356c: 9117e019     	add	x25, x0, #0x5f8
 4653570: f942fc16     	ldr	x22, [x0, #0x5f8]
 4653574: b4000536     	cbz	x22, 0x4653618 <_ChromeMain+0x464e37c>
 4653578: f9400289     	ldr	x9, [x20]
 465357c: 7100011f     	cmp	w8, #0x0
 4653580: 9a944135     	csel	x21, x9, x20, mi
 4653584: 14000006     	b	0x465359c <_ChromeMain+0x464e300>
 4653588: d2800015     	mov	x21, #0x0               ; =0
 465358c: 1400001a     	b	0x46535f4 <_ChromeMain+0x464e358>
 4653590: 54000223     	b.lo	0x46535d4 <_ChromeMain+0x464e338>
 4653594: f94006d6     	ldr	x22, [x22, #0x8]
 4653598: b4000416     	cbz	x22, 0x4653618 <_ChromeMain+0x464e37c>
 465359c: aa1603e8     	mov	x8, x22
 46535a0: f8420d09     	ldr	x9, [x8, #0x20]!
 46535a4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 46535a8: f100015f     	cmp	x10, #0x0
 46535ac: 9a884121     	csel	x1, x9, x8, mi
 46535b0: f9400508     	ldr	x8, [x8, #0x8]
 46535b4: 7100015f     	cmp	w10, #0x0
 46535b8: 9a8a4118     	csel	x24, x8, x10, mi
 46535bc: eb17031f     	cmp	x24, x23
 46535c0: 9a973302     	csel	x2, x24, x23, lo
 46535c4: aa1503e0     	mov	x0, x21
 46535c8: 94e6d8a6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46535cc: 340000a0     	cbz	w0, 0x46535e0 <_ChromeMain+0x464e344>
 46535d0: 36fffe20     	tbz	w0, #0x1f, 0x4653594 <_ChromeMain+0x464e2f8>
 46535d4: f94002d6     	ldr	x22, [x22]
 46535d8: b5fffe36     	cbnz	x22, 0x465359c <_ChromeMain+0x464e300>
 46535dc: 1400000f     	b	0x4653618 <_ChromeMain+0x464e37c>
 46535e0: eb1802ff     	cmp	x23, x24
 46535e4: 54fffd61     	b.ne	0x4653590 <_ChromeMain+0x464e2f4>
 46535e8: eb1902df     	cmp	x22, x25
 46535ec: 54000160     	b.eq	0x4653618 <_ChromeMain+0x464e37c>
 46535f0: f9401ed5     	ldr	x21, [x22, #0x38]
 46535f4: aa1503e0     	mov	x0, x21
 46535f8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 46535fc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4653600: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4653604: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 4653608: a94867fa     	ldp	x26, x25, [sp, #0x80]
 465360c: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 4653610: 910343ff     	add	sp, sp, #0xd0
 4653614: d65f03c0     	ret
 4653618: f00545bb     	adrp	x27, 0xef0a000 <dyld_stub_binder+0xef0a000>
 465361c: 9112037b     	add	x27, x27, #0x480
 4653620: f8bfc360     	ldapr	x0, [x27]
 4653624: b4007e00     	cbz	x0, 0x46545e4 <_ChromeMain+0x464f348>
 4653628: 52808001     	mov	w1, #0x400              ; =1024
 465362c: d2800002     	mov	x2, #0x0                ; =0
 4653630: 96e95fe0     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653634: aa0003f5     	mov	x21, x0
 4653638: 97346ec2     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 465363c: d00506c8     	adrp	x8, 0xe72d000 <dyld_stub_binder+0xe72d000>
 4653640: 9111c108     	add	x8, x8, #0x470
 4653644: 910fa109     	add	x9, x8, #0x3e8
 4653648: a9002408     	stp	x8, x9, [x0]
 465364c: 91104109     	add	x9, x8, #0x410
 4653650: f9000809     	str	x9, [x0, #0x10]
 4653654: 91112109     	add	x9, x8, #0x448
 4653658: 9111e10a     	add	x10, x8, #0x478
 465365c: a906a809     	stp	x9, x10, [x0, #0x68]
 4653660: 91132109     	add	x9, x8, #0x4c8
 4653664: f9005809     	str	x9, [x0, #0xb0]
 4653668: 9114a109     	add	x9, x8, #0x528
 465366c: aa0003f6     	mov	x22, x0
 4653670: f80d8ec9     	str	x9, [x22, #0xd8]!
 4653674: 91156108     	add	x8, x8, #0x558
 4653678: f80f8c08     	str	x8, [x0, #0xf8]!
 465367c: f9018abf     	str	xzr, [x21, #0x310]
 4653680: 390c62bf     	strb	wzr, [x21, #0x318]
 4653684: 390c82bf     	strb	wzr, [x21, #0x320]
 4653688: 910ca2b8     	add	x24, x21, #0x328
 465368c: 6f00e400     	movi.2d	v0, #0000000000000000
 4653690: ad000300     	stp	q0, q0, [x24]
 4653694: ad010300     	stp	q0, q0, [x24, #0x20]
 4653698: ad020300     	stp	q0, q0, [x24, #0x40]
 465369c: ad030300     	stp	q0, q0, [x24, #0x60]
 46536a0: ad040300     	stp	q0, q0, [x24, #0x80]
 46536a4: b903cabf     	str	wzr, [x21, #0x3c8]
 46536a8: ad1f02a0     	stp	q0, q0, [x21, #0x3e0]
 46536ac: 3d80f6a0     	str	q0, [x21, #0x3d0]
 46536b0: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 46536b4: 34000088     	cbz	w8, 0x46536c4 <_ChromeMain+0x464e428>
 46536b8: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 46536bc: 9106a6a1     	add	x1, x21, #0x1a9
 46536c0: 97235244     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46536c4: d0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 46536c8: 9117a021     	add	x1, x1, #0x5e8
 46536cc: d004b782     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 46536d0: 91284c42     	add	x2, x2, #0xa13
 46536d4: 5280003a     	mov	w26, #0x1               ; =1
 46536d8: aa1603e0     	mov	x0, x22
 46536dc: d2800003     	mov	x3, #0x0                ; =0
 46536e0: 52800024     	mov	w4, #0x1                ; =1
 46536e4: d2800005     	mov	x5, #0x0                ; =0
 46536e8: 97145aad     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 46536ec: 52800200     	mov	w0, #0x10               ; =16
 46536f0: 96e6ef1e     	bl	0xf368 <_ChromeMain+0xa0cc>
 46536f4: aa0003e1     	mov	x1, x0
 46536f8: 9004e7c8     	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 46536fc: 913c0108     	add	x8, x8, #0xf00
 4653700: 52801dc9     	mov	w9, #0xee               ; =238
 4653704: a9002408     	stp	x8, x9, [x0]
 4653708: aa1503e0     	mov	x0, x21
 465370c: 972350bd     	bl	0xf27a00 <_ChromeMain+0xf22764>
 4653710: f8bfc360     	ldapr	x0, [x27]
 4653714: b40076c0     	cbz	x0, 0x46545ec <_ChromeMain+0x464f350>
 4653718: 52807001     	mov	w1, #0x380              ; =896
 465371c: d2800002     	mov	x2, #0x0                ; =0
 4653720: 96e95fa4     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653724: aa0003f6     	mov	x22, x0
 4653728: 977766c4     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 465372c: f00502ea     	adrp	x10, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4653730: 912f414a     	add	x10, x10, #0xbd0
 4653734: 910fc148     	add	x8, x10, #0x3f0
 4653738: a900200a     	stp	x10, x8, [x0]
 465373c: 91106148     	add	x8, x10, #0x418
 4653740: f9000808     	str	x8, [x0, #0x10]
 4653744: 91114148     	add	x8, x10, #0x450
 4653748: 91120149     	add	x9, x10, #0x480
 465374c: a906a408     	stp	x8, x9, [x0, #0x68]
 4653750: 91134148     	add	x8, x10, #0x4d0
 4653754: f9005808     	str	x8, [x0, #0xb0]
 4653758: 9114c148     	add	x8, x10, #0x530
 465375c: f9006c08     	str	x8, [x0, #0xd8]
 4653760: 91158148     	add	x8, x10, #0x560
 4653764: aa0003f7     	mov	x23, x0
 4653768: f80f8ee8     	str	x8, [x23, #0xf8]!
 465376c: f901a41f     	str	xzr, [x0, #0x348]
 4653770: 2f06e400     	movi	d0, #0xffff000000000000
 4653774: fd01a800     	str	d0, [x0, #0x350]
 4653778: 390d601a     	strb	w26, [x0, #0x358]
 465377c: f901b01f     	str	xzr, [x0, #0x360]
 4653780: 390da01f     	strb	wzr, [x0, #0x368]
 4653784: f901b81f     	str	xzr, [x0, #0x370]
 4653788: b903781f     	str	wzr, [x0, #0x378]
 465378c: 390df01f     	strb	wzr, [x0, #0x37c]
 4653790: 3945a408     	ldrb	w8, [x0, #0x169]
 4653794: 35007588     	cbnz	w8, 0x4654644 <_ChromeMain+0x464f3a8>
 4653798: f940cea2     	ldr	x2, [x21, #0x198]
 465379c: aa1503e0     	mov	x0, x21
 46537a0: aa1603e1     	mov	x1, x22
 46537a4: 97049716     	bl	0x7793fc <_ChromeMain+0x774160>
 46537a8: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46537ac: f0052afa     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46537b0: f9404749     	ldr	x9, [x26, #0x88]
 46537b4: eb09011f     	cmp	x8, x9
 46537b8: 54000061     	b.ne	0x46537c4 <_ChromeMain+0x464e528>
 46537bc: aa1603e0     	mov	x0, x22
 46537c0: 96e702cf     	bl	0x142fc <_ChromeMain+0xf060>
 46537c4: f9418aa0     	ldr	x0, [x21, #0x310]
 46537c8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46537cc: f9404749     	ldr	x9, [x26, #0x88]
 46537d0: eb09011f     	cmp	x8, x9
 46537d4: 54000041     	b.ne	0x46537dc <_ChromeMain+0x464e540>
 46537d8: 96e73c99     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46537dc: f9018ab6     	str	x22, [x21, #0x310]
 46537e0: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 46537e4: 340000a8     	cbz	w8, 0x46537f8 <_ChromeMain+0x464e55c>
 46537e8: 3906a6df     	strb	wzr, [x22, #0x1a9]
 46537ec: 9106a6c1     	add	x1, x22, #0x1a9
 46537f0: aa1703e0     	mov	x0, x23
 46537f4: 972351f7     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46537f8: f8bfc360     	ldapr	x0, [x27]
 46537fc: b4006fc0     	cbz	x0, 0x46545f4 <_ChromeMain+0x464f358>
 4653800: 52806201     	mov	w1, #0x310              ; =784
 4653804: d2800002     	mov	x2, #0x0                ; =0
 4653808: 96e95f6a     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465380c: aa0003f6     	mov	x22, x0
 4653810: 97346e4c     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4653814: 3945a408     	ldrb	w8, [x0, #0x169]
 4653818: 350071c8     	cbnz	w8, 0x4654650 <_ChromeMain+0x464f3b4>
 465381c: f940cea2     	ldr	x2, [x21, #0x198]
 4653820: aa1503e0     	mov	x0, x21
 4653824: aa1603e1     	mov	x1, x22
 4653828: 970496f5     	bl	0x7793fc <_ChromeMain+0x774160>
 465382c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4653830: f9404749     	ldr	x9, [x26, #0x88]
 4653834: eb09011f     	cmp	x8, x9
 4653838: 54000061     	b.ne	0x4653844 <_ChromeMain+0x464e5a8>
 465383c: aa1603e0     	mov	x0, x22
 4653840: 96e702af     	bl	0x142fc <_ChromeMain+0xf060>
 4653844: f9400300     	ldr	x0, [x24]
 4653848: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465384c: f9404749     	ldr	x9, [x26, #0x88]
 4653850: eb09011f     	cmp	x8, x9
 4653854: 54000041     	b.ne	0x465385c <_ChromeMain+0x464e5c0>
 4653858: 96e73c79     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465385c: f9000316     	str	x22, [x24]
 4653860: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653864: 340000c8     	cbz	w8, 0x465387c <_ChromeMain+0x464e5e0>
 4653868: 3906a6df     	strb	wzr, [x22, #0x1a9]
 465386c: 9103e2c0     	add	x0, x22, #0xf8
 4653870: 9106a6c1     	add	x1, x22, #0x1a9
 4653874: 972351d7     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653878: f9400316     	ldr	x22, [x24]
 465387c: f94002c8     	ldr	x8, [x22]
 4653880: f9405108     	ldr	x8, [x8, #0xa0]
 4653884: aa1603e0     	mov	x0, x22
 4653888: 52800001     	mov	w1, #0x0                ; =0
 465388c: d63f0100     	blr	x8
 4653890: f9400308     	ldr	x8, [x24]
 4653894: d0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4653898: 9117a021     	add	x1, x1, #0x5e8
 465389c: d004b782     	adrp	x2, 0xdd45000 <dyld_stub_binder+0xdd45000>
 46538a0: 91284c42     	add	x2, x2, #0xa13
 46538a4: 91036100     	add	x0, x8, #0xd8
 46538a8: d2800003     	mov	x3, #0x0                ; =0
 46538ac: 52800024     	mov	w4, #0x1                ; =1
 46538b0: d2800005     	mov	x5, #0x0                ; =0
 46538b4: 97145a3a     	bl	0xb6a19c <_ChromeMain+0xb64f00>
 46538b8: f8bfc360     	ldapr	x0, [x27]
 46538bc: b4006a00     	cbz	x0, 0x46545fc <_ChromeMain+0x464f360>
 46538c0: 52806201     	mov	w1, #0x310              ; =784
 46538c4: d2800002     	mov	x2, #0x0                ; =0
 46538c8: 96e95f3a     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46538cc: aa0003f6     	mov	x22, x0
 46538d0: 97346e1c     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 46538d4: 3945a408     	ldrb	w8, [x0, #0x169]
 46538d8: 35006c28     	cbnz	w8, 0x465465c <_ChromeMain+0x464f3c0>
 46538dc: f940cea2     	ldr	x2, [x21, #0x198]
 46538e0: aa1503e0     	mov	x0, x21
 46538e4: aa1603e1     	mov	x1, x22
 46538e8: 970496c5     	bl	0x7793fc <_ChromeMain+0x774160>
 46538ec: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46538f0: f9404749     	ldr	x9, [x26, #0x88]
 46538f4: eb09011f     	cmp	x8, x9
 46538f8: 54000061     	b.ne	0x4653904 <_ChromeMain+0x464e668>
 46538fc: aa1603e0     	mov	x0, x22
 4653900: 96e7027f     	bl	0x142fc <_ChromeMain+0xf060>
 4653904: f9419aa0     	ldr	x0, [x21, #0x330]
 4653908: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465390c: f9404749     	ldr	x9, [x26, #0x88]
 4653910: eb09011f     	cmp	x8, x9
 4653914: 54000041     	b.ne	0x465391c <_ChromeMain+0x464e680>
 4653918: 96e73c49     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465391c: f9019ab6     	str	x22, [x21, #0x330]
 4653920: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653924: 340000c8     	cbz	w8, 0x465393c <_ChromeMain+0x464e6a0>
 4653928: 3906a6df     	strb	wzr, [x22, #0x1a9]
 465392c: 9103e2c0     	add	x0, x22, #0xf8
 4653930: 9106a6c1     	add	x1, x22, #0x1a9
 4653934: 972351a7     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653938: f9419ab6     	ldr	x22, [x21, #0x330]
 465393c: f94002c8     	ldr	x8, [x22]
 4653940: f9405108     	ldr	x8, [x8, #0xa0]
 4653944: aa1603e0     	mov	x0, x22
 4653948: 52800001     	mov	w1, #0x0                ; =0
 465394c: d63f0100     	blr	x8
 4653950: f9419ab7     	ldr	x23, [x21, #0x330]
 4653954: f8bfc360     	ldapr	x0, [x27]
 4653958: b4006560     	cbz	x0, 0x4654604 <_ChromeMain+0x464f368>
 465395c: 52806201     	mov	w1, #0x310              ; =784
 4653960: d2800002     	mov	x2, #0x0                ; =0
 4653964: 96e95f13     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653968: aa0003f6     	mov	x22, x0
 465396c: 97346df5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4653970: 3945a408     	ldrb	w8, [x0, #0x169]
 4653974: 350067a8     	cbnz	w8, 0x4654668 <_ChromeMain+0x464f3cc>
 4653978: f940cee2     	ldr	x2, [x23, #0x198]
 465397c: aa1703e0     	mov	x0, x23
 4653980: aa1603e1     	mov	x1, x22
 4653984: 9704969e     	bl	0x7793fc <_ChromeMain+0x774160>
 4653988: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 465398c: f9404749     	ldr	x9, [x26, #0x88]
 4653990: eb09011f     	cmp	x8, x9
 4653994: 54000061     	b.ne	0x46539a0 <_ChromeMain+0x464e704>
 4653998: aa1603e0     	mov	x0, x22
 465399c: 96e70258     	bl	0x142fc <_ChromeMain+0xf060>
 46539a0: f9419ea0     	ldr	x0, [x21, #0x338]
 46539a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46539a8: f9404749     	ldr	x9, [x26, #0x88]
 46539ac: eb09011f     	cmp	x8, x9
 46539b0: 54000041     	b.ne	0x46539b8 <_ChromeMain+0x464e71c>
 46539b4: 96e73c22     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46539b8: f9019eb6     	str	x22, [x21, #0x338]
 46539bc: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 46539c0: 340000c8     	cbz	w8, 0x46539d8 <_ChromeMain+0x464e73c>
 46539c4: 3906a6df     	strb	wzr, [x22, #0x1a9]
 46539c8: 9103e2c0     	add	x0, x22, #0xf8
 46539cc: 9106a6c1     	add	x1, x22, #0x1a9
 46539d0: 97235180     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46539d4: f9419eb6     	ldr	x22, [x21, #0x338]
 46539d8: 52802800     	mov	w0, #0x140              ; =320
 46539dc: 96e6ee63     	bl	0xf368 <_ChromeMain+0xa0cc>
 46539e0: aa0003f7     	mov	x23, x0
 46539e4: 978ef2fb     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 46539e8: aa1603e0     	mov	x0, x22
 46539ec: aa1703e1     	mov	x1, x23
 46539f0: 9754d792     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 46539f4: b940f2e8     	ldr	w8, [x23, #0xf0]
 46539f8: 35005b08     	cbnz	w8, 0x4654558 <_ChromeMain+0x464f2bc>
 46539fc: 52800028     	mov	w8, #0x1                ; =1
 4653a00: b90033e8     	str	w8, [sp, #0x30]
 4653a04: d0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4653a08: 9115a021     	add	x1, x1, #0x568
 4653a0c: 910462e0     	add	x0, x23, #0x118
 4653a10: 9100c3e2     	add	x2, sp, #0x30
 4653a14: 975045e4     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4653a18: b940fae8     	ldr	w8, [x23, #0xf8]
 4653a1c: 7100191f     	cmp	w8, #0x6
 4653a20: 54005ce1     	b.ne	0x46545bc <_ChromeMain+0x464f320>
 4653a24: b940fee8     	ldr	w8, [x23, #0xfc]
 4653a28: 7100211f     	cmp	w8, #0x8
 4653a2c: 54005c81     	b.ne	0x46545bc <_ChromeMain+0x464f320>
 4653a30: b94102e8     	ldr	w8, [x23, #0x100]
 4653a34: 7100191f     	cmp	w8, #0x6
 4653a38: 54005c21     	b.ne	0x46545bc <_ChromeMain+0x464f320>
 4653a3c: b94106e8     	ldr	w8, [x23, #0x104]
 4653a40: 71001d1f     	cmp	w8, #0x7
 4653a44: 54005bc1     	b.ne	0x46545bc <_ChromeMain+0x464f320>
 4653a48: f9419eb7     	ldr	x23, [x21, #0x338]
 4653a4c: f8bfc360     	ldapr	x0, [x27]
 4653a50: b4005de0     	cbz	x0, 0x465460c <_ChromeMain+0x464f370>
 4653a54: 52806201     	mov	w1, #0x310              ; =784
 4653a58: d2800002     	mov	x2, #0x0                ; =0
 4653a5c: 96e95ed5     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653a60: aa0003f6     	mov	x22, x0
 4653a64: 97346db7     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4653a68: 3945a408     	ldrb	w8, [x0, #0x169]
 4653a6c: 35006048     	cbnz	w8, 0x4654674 <_ChromeMain+0x464f3d8>
 4653a70: f940cee2     	ldr	x2, [x23, #0x198]
 4653a74: aa1703e0     	mov	x0, x23
 4653a78: aa1603e1     	mov	x1, x22
 4653a7c: 97049660     	bl	0x7793fc <_ChromeMain+0x774160>
 4653a80: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4653a84: f9404749     	ldr	x9, [x26, #0x88]
 4653a88: eb09011f     	cmp	x8, x9
 4653a8c: 54000061     	b.ne	0x4653a98 <_ChromeMain+0x464e7fc>
 4653a90: aa1603e0     	mov	x0, x22
 4653a94: 96e7021a     	bl	0x142fc <_ChromeMain+0xf060>
 4653a98: f941a2a0     	ldr	x0, [x21, #0x340]
 4653a9c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4653aa0: f9404749     	ldr	x9, [x26, #0x88]
 4653aa4: eb09011f     	cmp	x8, x9
 4653aa8: 54000041     	b.ne	0x4653ab0 <_ChromeMain+0x464e814>
 4653aac: 96e73be4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4653ab0: f901a2b6     	str	x22, [x21, #0x340]
 4653ab4: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653ab8: 340000c8     	cbz	w8, 0x4653ad0 <_ChromeMain+0x464e834>
 4653abc: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4653ac0: 9103e2c0     	add	x0, x22, #0xf8
 4653ac4: 9106a6c1     	add	x1, x22, #0x1a9
 4653ac8: 97235142     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653acc: f941a2b6     	ldr	x22, [x21, #0x340]
 4653ad0: 52801f00     	mov	w0, #0xf8               ; =248
 4653ad4: 96e6ee25     	bl	0xf368 <_ChromeMain+0xa0cc>
 4653ad8: aa0003f7     	mov	x23, x0
 4653adc: 9738c701     	bl	0x14856e0 <_ChromeMain+0x1480444>
 4653ae0: f004e7e8     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 4653ae4: 91366108     	add	x8, x8, #0xd98
 4653ae8: f9000008     	str	x8, [x0]
 4653aec: 91036108     	add	x8, x8, #0xd8
 4653af0: f9001408     	str	x8, [x0, #0x28]
 4653af4: 52802008     	mov	w8, #0x100              ; =256
 4653af8: 7901e008     	strh	w8, [x0, #0xf0]
 4653afc: aa1603e0     	mov	x0, x22
 4653b00: aa1703e1     	mov	x1, x23
 4653b04: 9754d74d     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4653b08: f941a2a0     	ldr	x0, [x21, #0x340]
 4653b0c: 5280003c     	mov	w28, #0x1               ; =1
 4653b10: d2800281     	mov	x1, #0x14               ; =20
 4653b14: f2c00281     	movk	x1, #0x14, lsl #32
 4653b18: 52800022     	mov	w2, #0x1                ; =1
 4653b1c: 9785f7d1     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4653b20: f941a2a8     	ldr	x8, [x21, #0x340]
 4653b24: b004c769     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4653b28: 3dc2a520     	ldr	q0, [x9, #0xa90]
 4653b2c: 3d800fe0     	str	q0, [sp, #0x30]
 4653b30: d0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4653b34: 91122021     	add	x1, x1, #0x488
 4653b38: 91036100     	add	x0, x8, #0xd8
 4653b3c: 9100c3e2     	add	x2, sp, #0x30
 4653b40: 975268c8     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4653b44: f941a2b7     	ldr	x23, [x21, #0x340]
 4653b48: f8bfc360     	ldapr	x0, [x27]
 4653b4c: b4005640     	cbz	x0, 0x4654614 <_ChromeMain+0x464f378>
 4653b50: 52807001     	mov	w1, #0x380              ; =896
 4653b54: d2800002     	mov	x2, #0x0                ; =0
 4653b58: 96e95e96     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653b5c: aa0003f6     	mov	x22, x0
 4653b60: 977765b6     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4653b64: f00502ea     	adrp	x10, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4653b68: 912f414a     	add	x10, x10, #0xbd0
 4653b6c: 910fc148     	add	x8, x10, #0x3f0
 4653b70: a900200a     	stp	x10, x8, [x0]
 4653b74: 91106148     	add	x8, x10, #0x418
 4653b78: f9000808     	str	x8, [x0, #0x10]
 4653b7c: 91114148     	add	x8, x10, #0x450
 4653b80: 91120149     	add	x9, x10, #0x480
 4653b84: a906a408     	stp	x8, x9, [x0, #0x68]
 4653b88: 91134148     	add	x8, x10, #0x4d0
 4653b8c: f9005808     	str	x8, [x0, #0xb0]
 4653b90: 9114c148     	add	x8, x10, #0x530
 4653b94: f9006c08     	str	x8, [x0, #0xd8]
 4653b98: 91158148     	add	x8, x10, #0x560
 4653b9c: aa0003f8     	mov	x24, x0
 4653ba0: f80f8f08     	str	x8, [x24, #0xf8]!
 4653ba4: f901a41f     	str	xzr, [x0, #0x348]
 4653ba8: 2f06e400     	movi	d0, #0xffff000000000000
 4653bac: fd01a800     	str	d0, [x0, #0x350]
 4653bb0: 390d601c     	strb	w28, [x0, #0x358]
 4653bb4: f901b01f     	str	xzr, [x0, #0x360]
 4653bb8: 390da01f     	strb	wzr, [x0, #0x368]
 4653bbc: f901b81f     	str	xzr, [x0, #0x370]
 4653bc0: b903781f     	str	wzr, [x0, #0x378]
 4653bc4: 390df01f     	strb	wzr, [x0, #0x37c]
 4653bc8: 3945a408     	ldrb	w8, [x0, #0x169]
 4653bcc: 35005068     	cbnz	w8, 0x46545d8 <_ChromeMain+0x464f33c>
 4653bd0: f940cee2     	ldr	x2, [x23, #0x198]
 4653bd4: aa1703e0     	mov	x0, x23
 4653bd8: aa1603e1     	mov	x1, x22
 4653bdc: 97049608     	bl	0x7793fc <_ChromeMain+0x774160>
 4653be0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4653be4: f9404749     	ldr	x9, [x26, #0x88]
 4653be8: eb09011f     	cmp	x8, x9
 4653bec: 54000061     	b.ne	0x4653bf8 <_ChromeMain+0x464e95c>
 4653bf0: aa1603e0     	mov	x0, x22
 4653bf4: 96e701c2     	bl	0x142fc <_ChromeMain+0xf060>
 4653bf8: f941a6a0     	ldr	x0, [x21, #0x348]
 4653bfc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4653c00: f9404749     	ldr	x9, [x26, #0x88]
 4653c04: eb09011f     	cmp	x8, x9
 4653c08: 54000041     	b.ne	0x4653c10 <_ChromeMain+0x464e974>
 4653c0c: 96e73b8c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4653c10: f901a6b6     	str	x22, [x21, #0x348]
 4653c14: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653c18: 340000c8     	cbz	w8, 0x4653c30 <_ChromeMain+0x464e994>
 4653c1c: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4653c20: 9106a6c1     	add	x1, x22, #0x1a9
 4653c24: aa1803e0     	mov	x0, x24
 4653c28: 972350ea     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653c2c: f941a6b6     	ldr	x22, [x21, #0x348]
 4653c30: 910c42c8     	add	x8, x22, #0x310
 4653c34: 394c62c9     	ldrb	w9, [x22, #0x318]
 4653c38: 350055a9     	cbnz	w9, 0x46546ec <_ChromeMain+0x464f450>
 4653c3c: b4004d28     	cbz	x8, 0x46545e0 <_ChromeMain+0x464f344>
 4653c40: d2800288     	mov	x8, #0x14               ; =20
 4653c44: f2c00288     	movk	x8, #0x14, lsl #32
 4653c48: f9018ac8     	str	x8, [x22, #0x310]
 4653c4c: 52800028     	mov	w8, #0x1                ; =1
 4653c50: 390c62c8     	strb	w8, [x22, #0x318]
 4653c54: f940c6c0     	ldr	x0, [x22, #0x188]
 4653c58: b40000a0     	cbz	x0, 0x4653c6c <_ChromeMain+0x464e9d0>
 4653c5c: f9400008     	ldr	x8, [x0]
 4653c60: f9417d08     	ldr	x8, [x8, #0x2f8]
 4653c64: aa1603e1     	mov	x1, x22
 4653c68: d63f0100     	blr	x8
 4653c6c: aa1603e0     	mov	x0, x22
 4653c70: 52800001     	mov	w1, #0x0                ; =0
 4653c74: 96ff7200     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4653c78: f9001bf6     	str	x22, [sp, #0x30]
 4653c7c: 9104c2c0     	add	x0, x22, #0x130
 4653c80: 9100c3e3     	add	x3, sp, #0x30
 4653c84: 52800301     	mov	w1, #0x18               ; =24
 4653c88: 52800022     	mov	w2, #0x1                ; =1
 4653c8c: 97094d51     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4653c90: aa1603e0     	mov	x0, x22
 4653c94: 97300b95     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 4653c98: f941a6a0     	ldr	x0, [x21, #0x348]
 4653c9c: d2800281     	mov	x1, #0x14               ; =20
 4653ca0: f2c00281     	movk	x1, #0x14, lsl #32
 4653ca4: 52800022     	mov	w2, #0x1                ; =1
 4653ca8: 9785f76e     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4653cac: f941a2b7     	ldr	x23, [x21, #0x340]
 4653cb0: f8bfc360     	ldapr	x0, [x27]
 4653cb4: b4004b40     	cbz	x0, 0x465461c <_ChromeMain+0x464f380>
 4653cb8: 52806801     	mov	w1, #0x340              ; =832
 4653cbc: d2800002     	mov	x2, #0x0                ; =0
 4653cc0: 96e95e3c     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653cc4: aa0003f6     	mov	x22, x0
 4653cc8: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4653ccc: f9001bff     	str	xzr, [sp, #0x30]
 4653cd0: 97346d1c     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4653cd4: 90050448     	adrp	x8, 0xe6db000 <dyld_stub_binder+0xe6db000>
 4653cd8: 91024108     	add	x8, x8, #0x90
 4653cdc: 910fa109     	add	x9, x8, #0x3e8
 4653ce0: a9002408     	stp	x8, x9, [x0]
 4653ce4: 91104109     	add	x9, x8, #0x410
 4653ce8: f9000809     	str	x9, [x0, #0x10]
 4653cec: 91112109     	add	x9, x8, #0x448
 4653cf0: 9111e10a     	add	x10, x8, #0x478
 4653cf4: a906a809     	stp	x9, x10, [x0, #0x68]
 4653cf8: 91132109     	add	x9, x8, #0x4c8
 4653cfc: f9005809     	str	x9, [x0, #0xb0]
 4653d00: 9114a109     	add	x9, x8, #0x528
 4653d04: f9006c09     	str	x9, [x0, #0xd8]
 4653d08: 91156108     	add	x8, x8, #0x558
 4653d0c: aa0003f8     	mov	x24, x0
 4653d10: f80f8f08     	str	x8, [x24, #0xf8]!
 4653d14: 910c4008     	add	x8, x0, #0x310
 4653d18: 9100c3e0     	add	x0, sp, #0x30
 4653d1c: 97fcce99     	bl	0x4587780 <_ChromeMain+0x45824e4>
 4653d20: d2800288     	mov	x8, #0x14               ; =20
 4653d24: f2c00188     	movk	x8, #0xc, lsl #32
 4653d28: f90196c8     	str	x8, [x22, #0x328]
 4653d2c: 9004c7a8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4653d30: 3dc22d00     	ldr	q0, [x8, #0x8b0]
 4653d34: 3d80cec0     	str	q0, [x22, #0x330]
 4653d38: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653d3c: 340000a8     	cbz	w8, 0x4653d50 <_ChromeMain+0x464eab4>
 4653d40: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4653d44: 9106a6c1     	add	x1, x22, #0x1a9
 4653d48: aa1803e0     	mov	x0, x24
 4653d4c: 972350a1     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653d50: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4653d54: 36f800a8     	tbz	w8, #0x1f, 0x4653d68 <_ChromeMain+0x464eacc>
 4653d58: f9401be0     	ldr	x0, [sp, #0x30]
 4653d5c: f94023e8     	ldr	x8, [sp, #0x40]
 4653d60: d37ff901     	lsl	x1, x8, #1
 4653d64: 96e6d455     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4653d68: 3945a6c8     	ldrb	w8, [x22, #0x169]
 4653d6c: 350048a8     	cbnz	w8, 0x4654680 <_ChromeMain+0x464f3e4>
 4653d70: f940cee2     	ldr	x2, [x23, #0x198]
 4653d74: aa1703e0     	mov	x0, x23
 4653d78: aa1603e1     	mov	x1, x22
 4653d7c: 970495a0     	bl	0x7793fc <_ChromeMain+0x774160>
 4653d80: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4653d84: f9404749     	ldr	x9, [x26, #0x88]
 4653d88: eb09011f     	cmp	x8, x9
 4653d8c: 54000061     	b.ne	0x4653d98 <_ChromeMain+0x464eafc>
 4653d90: aa1603e0     	mov	x0, x22
 4653d94: 96e7015a     	bl	0x142fc <_ChromeMain+0xf060>
 4653d98: f941aaa0     	ldr	x0, [x21, #0x350]
 4653d9c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4653da0: f9404749     	ldr	x9, [x26, #0x88]
 4653da4: eb09011f     	cmp	x8, x9
 4653da8: 54000041     	b.ne	0x4653db0 <_ChromeMain+0x464eb14>
 4653dac: 96e73b24     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4653db0: f901aab6     	str	x22, [x21, #0x350]
 4653db4: f94002c8     	ldr	x8, [x22]
 4653db8: f9405108     	ldr	x8, [x8, #0xa0]
 4653dbc: aa1603e0     	mov	x0, x22
 4653dc0: 52800001     	mov	w1, #0x0                ; =0
 4653dc4: d63f0100     	blr	x8
 4653dc8: f9419eb7     	ldr	x23, [x21, #0x338]
 4653dcc: f8bfc360     	ldapr	x0, [x27]
 4653dd0: b40042a0     	cbz	x0, 0x4654624 <_ChromeMain+0x464f388>
 4653dd4: 52808c01     	mov	w1, #0x460              ; =1120
 4653dd8: d2800002     	mov	x2, #0x0                ; =0
 4653ddc: 96e95df5     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4653de0: aa0003f6     	mov	x22, x0
 4653de4: d2800001     	mov	x1, #0x0                ; =0
 4653de8: d2800002     	mov	x2, #0x0                ; =0
 4653dec: 528000a3     	mov	w3, #0x5                ; =5
 4653df0: 52820004     	mov	w4, #0x1000             ; =4096
 4653df4: 52800005     	mov	w5, #0x0                ; =0
 4653df8: 9754daba     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4653dfc: 3945a408     	ldrb	w8, [x0, #0x169]
 4653e00: 35004468     	cbnz	w8, 0x465468c <_ChromeMain+0x464f3f0>
 4653e04: f940cee2     	ldr	x2, [x23, #0x198]
 4653e08: aa1703e0     	mov	x0, x23
 4653e0c: aa1603e1     	mov	x1, x22
 4653e10: 9704957b     	bl	0x7793fc <_ChromeMain+0x774160>
 4653e14: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4653e18: f9404749     	ldr	x9, [x26, #0x88]
 4653e1c: eb09011f     	cmp	x8, x9
 4653e20: 54000061     	b.ne	0x4653e2c <_ChromeMain+0x464eb90>
 4653e24: aa1603e0     	mov	x0, x22
 4653e28: 96e70135     	bl	0x142fc <_ChromeMain+0xf060>
 4653e2c: f941aea0     	ldr	x0, [x21, #0x358]
 4653e30: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4653e34: f9404749     	ldr	x9, [x26, #0x88]
 4653e38: eb09011f     	cmp	x8, x9
 4653e3c: 54000041     	b.ne	0x4653e44 <_ChromeMain+0x464eba8>
 4653e40: 96e73aff     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4653e44: f901aeb6     	str	x22, [x21, #0x358]
 4653e48: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 4653e4c: 340000c8     	cbz	w8, 0x4653e64 <_ChromeMain+0x464ebc8>
 4653e50: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4653e54: 9103e2c0     	add	x0, x22, #0xf8
 4653e58: 9106a6c1     	add	x1, x22, #0x1a9
 4653e5c: 9723505d     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4653e60: f941aeb6     	ldr	x22, [x21, #0x358]
 4653e64: aa1603e0     	mov	x0, x22
 4653e68: 52800061     	mov	w1, #0x3                ; =3
 4653e6c: 9754d7a5     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4653e70: f941aea0     	ldr	x0, [x21, #0x358]
 4653e74: 528000c1     	mov	w1, #0x6                ; =6
 4653e78: 96fd33b2     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 4653e7c: f941aeb6     	ldr	x22, [x21, #0x358]
 4653e80: 394edac8     	ldrb	w8, [x22, #0x3b6]
 4653e84: 35003868     	cbnz	w8, 0x4654590 <_ChromeMain+0x464f2f4>
 4653e88: aa1603e0     	mov	x0, x22
 4653e8c: 52800001     	mov	w1, #0x0                ; =0
 4653e90: 9783ad38     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4653e94: f941aea0     	ldr	x0, [x21, #0x358]
 4653e98: b81a83bf     	stur	wzr, [x29, #-0x58]
 4653e9c: 52800028     	mov	w8, #0x1                ; =1
 4653ea0: 381ac3a8     	sturb	w8, [x29, #-0x54]
 4653ea4: d10163a1     	sub	x1, x29, #0x58
 4653ea8: 9707d212     	bl	0x8486f0 <_ChromeMain+0x843454>
 4653eac: f941aea0     	ldr	x0, [x21, #0x358]
 4653eb0: 52801ba8     	mov	w8, #0xdd               ; =221
 4653eb4: b90063e8     	str	w8, [sp, #0x60]
 4653eb8: 390193ff     	strb	wzr, [sp, #0x64]
 4653ebc: f9400008     	ldr	x8, [x0]
 4653ec0: f941f508     	ldr	x8, [x8, #0x3e8]
 4653ec4: 910183e1     	add	x1, sp, #0x60
 4653ec8: d63f0100     	blr	x8
 4653ecc: f941aeb6     	ldr	x22, [x21, #0x358]
 4653ed0: f941aed8     	ldr	x24, [x22, #0x358]
 4653ed4: f9402717     	ldr	x23, [x24, #0x48]
 4653ed8: b94046e8     	ldr	w8, [x23, #0x44]
 4653edc: 3100051f     	cmn	w8, #0x1
 4653ee0: 540040e0     	b.eq	0x46546fc <_ChromeMain+0x464f460>
 4653ee4: 528001c9     	mov	w9, #0xe                ; =14
 4653ee8: 4b080121     	sub	w1, w9, w8
 4653eec: aa1703e0     	mov	x0, x23
 4653ef0: 52800002     	mov	w2, #0x0                ; =0
 4653ef4: 52803e83     	mov	w3, #0x1f4              ; =500
 4653ef8: 97594de2     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4653efc: f9001be0     	str	x0, [sp, #0x30]
 4653f00: b40000a0     	cbz	x0, 0x4653f14 <_ChromeMain+0x464ec78>
 4653f04: b9400008     	ldr	w8, [x0]
 4653f08: 31000508     	adds	w8, w8, #0x1
 4653f0c: b9000008     	str	w8, [x0]
 4653f10: 54003c42     	b.hs	0x4654698 <_ChromeMain+0x464f3fc>
 4653f14: f94002c8     	ldr	x8, [x22]
 4653f18: f941ed08     	ldr	x8, [x8, #0x3d8]
 4653f1c: 9100c3f7     	add	x23, sp, #0x30
 4653f20: 9100c3e1     	add	x1, sp, #0x30
 4653f24: aa1603e0     	mov	x0, x22
 4653f28: d63f0100     	blr	x8
 4653f2c: f9401be0     	ldr	x0, [sp, #0x30]
 4653f30: b40000c0     	cbz	x0, 0x4653f48 <_ChromeMain+0x464ecac>
 4653f34: b9400009     	ldr	w9, [x0]
 4653f38: 51000528     	sub	w8, w9, #0x1
 4653f3c: b9000008     	str	w8, [x0]
 4653f40: 34003b29     	cbz	w9, 0x46546a4 <_ChromeMain+0x464f408>
 4653f44: 34003028     	cbz	w8, 0x4654548 <_ChromeMain+0x464f2ac>
 4653f48: f941aeb6     	ldr	x22, [x21, #0x358]
 4653f4c: 52800800     	mov	w0, #0x40               ; =64
 4653f50: 96e6ed06     	bl	0xf368 <_ChromeMain+0xa0cc>
 4653f54: 52800028     	mov	w8, #0x1                ; =1
 4653f58: 90fe4ea9     	adrp	x9, 0x1027000 <_ChromeMain+0x1021d64>
 4653f5c: 91260129     	add	x9, x9, #0x980
 4653f60: b9000008     	str	w8, [x0]
 4653f64: f0fde4ea     	adrp	x10, 0x2f2000 <_ChromeMain+0x2ecd64>
 4653f68: 9122014a     	add	x10, x10, #0x880
 4653f6c: d0fef85c     	adrp	x28, 0x255d000 <_ChromeMain+0x2557d64>
 4653f70: 912c039c     	add	x28, x28, #0xb00
 4653f74: a900a809     	stp	x9, x10, [x0, #0x8]
 4653f78: f0ffa689     	adrp	x9, 0x3b26000 <_ChromeMain+0x3b20d64>
 4653f7c: 91310129     	add	x9, x9, #0xc40
 4653f80: a901a41c     	stp	x28, x9, [x0, #0x18]
 4653f84: a902fc1f     	stp	xzr, xzr, [x0, #0x28]
 4653f88: 3900e01f     	strb	wzr, [x0, #0x38]
 4653f8c: f90003e0     	str	x0, [sp]
 4653f90: 0f000420     	movi.2s	v0, #0x1
 4653f94: fd0007e0     	str	d0, [sp, #0x8]
 4653f98: 52800069     	mov	w9, #0x3                ; =3
 4653f9c: b90013e9     	str	w9, [sp, #0x10]
 4653fa0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4653fa4: f9000fff     	str	xzr, [sp, #0x18]
 4653fa8: f90023ff     	str	xzr, [sp, #0x40]
 4653fac: f9001be0     	str	x0, [sp, #0x30]
 4653fb0: b5002de0     	cbnz	x0, 0x465456c <_ChromeMain+0x464f2d0>
 4653fb4: 910003e8     	mov	x8, sp
 4653fb8: f8408109     	ldur	x9, [x8, #0x8]
 4653fbc: f80082e9     	stur	x9, [x23, #0x8]
 4653fc0: b8410108     	ldur	w8, [x8, #0x10]
 4653fc4: b80102e8     	stur	w8, [x23, #0x10]
 4653fc8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4653fcc: f90027ff     	str	xzr, [sp, #0x48]
 4653fd0: 52800048     	mov	w8, #0x2                ; =2
 4653fd4: b9003be8     	str	w8, [sp, #0x38]
 4653fd8: d0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4653fdc: 91152021     	add	x1, x1, #0x548
 4653fe0: 910362c0     	add	x0, x22, #0xd8
 4653fe4: 9100c3e2     	add	x2, sp, #0x30
 4653fe8: 975700e9     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 4653fec: 9100c3e0     	add	x0, sp, #0x30
 4653ff0: 9743db4d     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4653ff4: 910003e0     	mov	x0, sp
 4653ff8: 9743db4b     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 4653ffc: f941aea8     	ldr	x8, [x21, #0x358]
 4654000: 9004c789     	adrp	x9, 0xdf44000 <dyld_stub_binder+0xdf44000>
 4654004: 3dc1fd20     	ldr	q0, [x9, #0x7f0]
 4654008: 3d800fe0     	str	q0, [sp, #0x30]
 465400c: b0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4654010: 91122021     	add	x1, x1, #0x488
 4654014: 91036100     	add	x0, x8, #0xd8
 4654018: 9100c3e2     	add	x2, sp, #0x30
 465401c: 97526791     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4654020: f941aea0     	ldr	x0, [x21, #0x358]
 4654024: f9400008     	ldr	x8, [x0]
 4654028: f9405108     	ldr	x8, [x8, #0xa0]
 465402c: 52800001     	mov	w1, #0x0                ; =0
 4654030: d63f0100     	blr	x8
 4654034: f9419eb7     	ldr	x23, [x21, #0x338]
 4654038: f8bfc360     	ldapr	x0, [x27]
 465403c: b4002f80     	cbz	x0, 0x465462c <_ChromeMain+0x464f390>
 4654040: 52807001     	mov	w1, #0x380              ; =896
 4654044: d2800002     	mov	x2, #0x0                ; =0
 4654048: 96e95d5a     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465404c: aa0003f6     	mov	x22, x0
 4654050: 9777647a     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 4654054: d00502ea     	adrp	x10, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 4654058: 912f414a     	add	x10, x10, #0xbd0
 465405c: 910fc148     	add	x8, x10, #0x3f0
 4654060: a900200a     	stp	x10, x8, [x0]
 4654064: 91106148     	add	x8, x10, #0x418
 4654068: f9000808     	str	x8, [x0, #0x10]
 465406c: 91114148     	add	x8, x10, #0x450
 4654070: 91120149     	add	x9, x10, #0x480
 4654074: a906a408     	stp	x8, x9, [x0, #0x68]
 4654078: 91134148     	add	x8, x10, #0x4d0
 465407c: f9005808     	str	x8, [x0, #0xb0]
 4654080: 91158148     	add	x8, x10, #0x560
 4654084: aa0003f8     	mov	x24, x0
 4654088: f80f8f08     	str	x8, [x24, #0xf8]!
 465408c: 9114c148     	add	x8, x10, #0x530
 4654090: f9006c08     	str	x8, [x0, #0xd8]
 4654094: f901a41f     	str	xzr, [x0, #0x348]
 4654098: 2f06e400     	movi	d0, #0xffff000000000000
 465409c: fd01a800     	str	d0, [x0, #0x350]
 46540a0: 52800028     	mov	w8, #0x1                ; =1
 46540a4: 390d6008     	strb	w8, [x0, #0x358]
 46540a8: f901b01f     	str	xzr, [x0, #0x360]
 46540ac: 390da01f     	strb	wzr, [x0, #0x368]
 46540b0: f901b81f     	str	xzr, [x0, #0x370]
 46540b4: b903781f     	str	wzr, [x0, #0x378]
 46540b8: 390df01f     	strb	wzr, [x0, #0x37c]
 46540bc: 3945a408     	ldrb	w8, [x0, #0x169]
 46540c0: 35002f88     	cbnz	w8, 0x46546b0 <_ChromeMain+0x464f414>
 46540c4: f940cee2     	ldr	x2, [x23, #0x198]
 46540c8: aa1703e0     	mov	x0, x23
 46540cc: aa1603e1     	mov	x1, x22
 46540d0: 970494cb     	bl	0x7793fc <_ChromeMain+0x774160>
 46540d4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 46540d8: f9404749     	ldr	x9, [x26, #0x88]
 46540dc: eb09011f     	cmp	x8, x9
 46540e0: 54000061     	b.ne	0x46540ec <_ChromeMain+0x464ee50>
 46540e4: aa1603e0     	mov	x0, x22
 46540e8: 96e70085     	bl	0x142fc <_ChromeMain+0xf060>
 46540ec: f941b2a0     	ldr	x0, [x21, #0x360]
 46540f0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46540f4: f9404749     	ldr	x9, [x26, #0x88]
 46540f8: eb09011f     	cmp	x8, x9
 46540fc: 54000041     	b.ne	0x4654104 <_ChromeMain+0x464ee68>
 4654100: 96e73a4f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4654104: f901b2b6     	str	x22, [x21, #0x360]
 4654108: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 465410c: 340000c8     	cbz	w8, 0x4654124 <_ChromeMain+0x464ee88>
 4654110: 3906a6df     	strb	wzr, [x22, #0x1a9]
 4654114: 9106a6c1     	add	x1, x22, #0x1a9
 4654118: aa1803e0     	mov	x0, x24
 465411c: 97234fad     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4654120: f941b2b6     	ldr	x22, [x21, #0x360]
 4654124: 910c42c8     	add	x8, x22, #0x310
 4654128: 394c62c9     	ldrb	w9, [x22, #0x318]
 465412c: 35002c89     	cbnz	w9, 0x46546bc <_ChromeMain+0x464f420>
 4654130: b4002588     	cbz	x8, 0x46545e0 <_ChromeMain+0x464f344>
 4654134: b21e07e8     	mov	x8, #0xc0000000c        ; =51539607564
 4654138: f9018ac8     	str	x8, [x22, #0x310]
 465413c: 52800028     	mov	w8, #0x1                ; =1
 4654140: 390c62c8     	strb	w8, [x22, #0x318]
 4654144: f940c6c0     	ldr	x0, [x22, #0x188]
 4654148: b40000a0     	cbz	x0, 0x465415c <_ChromeMain+0x464eec0>
 465414c: f9400008     	ldr	x8, [x0]
 4654150: f9417d08     	ldr	x8, [x8, #0x2f8]
 4654154: aa1603e1     	mov	x1, x22
 4654158: d63f0100     	blr	x8
 465415c: aa1603e0     	mov	x0, x22
 4654160: 52800001     	mov	w1, #0x0                ; =0
 4654164: 96ff70c4     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4654168: f9001bf6     	str	x22, [sp, #0x30]
 465416c: 52800038     	mov	w24, #0x1               ; =1
 4654170: 9104c2c0     	add	x0, x22, #0x130
 4654174: 9100c3e3     	add	x3, sp, #0x30
 4654178: 52800301     	mov	w1, #0x18               ; =24
 465417c: 52800022     	mov	w2, #0x1                ; =1
 4654180: 97094c14     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 4654184: aa1603e0     	mov	x0, x22
 4654188: 97300a58     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 465418c: f941b2a0     	ldr	x0, [x21, #0x360]
 4654190: b21e07e1     	mov	x1, #0xc0000000c        ; =51539607564
 4654194: 52800022     	mov	w2, #0x1                ; =1
 4654198: 9785f632     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 465419c: f941b2b6     	ldr	x22, [x21, #0x360]
 46541a0: 52801bc8     	mov	w8, #0xde               ; =222
 46541a4: b90003e8     	str	w8, [sp]
 46541a8: 390013ff     	strb	wzr, [sp, #0x4]
 46541ac: 90051c00     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 46541b0: 913d4000     	add	x0, x0, #0xf50
 46541b4: 9100c3e8     	add	x8, sp, #0x30
 46541b8: 910003e1     	mov	x1, sp
 46541bc: 528000e2     	mov	w2, #0x7                ; =7
 46541c0: d2800003     	mov	x3, #0x0                ; =0
 46541c4: 971e81d7     	bl	0xdf4920 <_ChromeMain+0xdef684>
 46541c8: 9100c3e1     	add	x1, sp, #0x30
 46541cc: aa1603e0     	mov	x0, x22
 46541d0: 96fd33b4     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 46541d4: 9100c3e0     	add	x0, sp, #0x30
 46541d8: 9707c99a     	bl	0x846840 <_ChromeMain+0x8415a4>
 46541dc: f9419ab7     	ldr	x23, [x21, #0x330]
 46541e0: 52800500     	mov	w0, #0x28               ; =40
 46541e4: 96e6ec61     	bl	0xf368 <_ChromeMain+0xa0cc>
 46541e8: b9000018     	str	w24, [x0]
 46541ec: f0fdce28     	adrp	x8, 0x1b000 <_ChromeMain+0x15d64>
 46541f0: 912c0108     	add	x8, x8, #0xb00
 46541f4: f0ff7a49     	adrp	x9, 0x359f000 <_ChromeMain+0x3599d64>
 46541f8: 911a0129     	add	x9, x9, #0x680
 46541fc: a900a408     	stp	x8, x9, [x0, #0x8]
 4654200: f9000c1c     	str	x28, [x0, #0x18]
 4654204: f9001be0     	str	x0, [sp, #0x30]
 4654208: 9100c3e0     	add	x0, sp, #0x30
 465420c: 97ff735d     	bl	0x4630f80 <_ChromeMain+0x462bce4>
 4654210: 3945a408     	ldrb	w8, [x0, #0x169]
 4654214: 350025a8     	cbnz	w8, 0x46546c8 <_ChromeMain+0x464f42c>
 4654218: aa0003f6     	mov	x22, x0
 465421c: f940cee2     	ldr	x2, [x23, #0x198]
 4654220: aa1703e0     	mov	x0, x23
 4654224: aa1603e1     	mov	x1, x22
 4654228: 97049475     	bl	0x7793fc <_ChromeMain+0x774160>
 465422c: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4654230: f9404749     	ldr	x9, [x26, #0x88]
 4654234: eb09011f     	cmp	x8, x9
 4654238: 54000061     	b.ne	0x4654244 <_ChromeMain+0x464efa8>
 465423c: aa1603e0     	mov	x0, x22
 4654240: 96e7002f     	bl	0x142fc <_ChromeMain+0xf060>
 4654244: f941b6a0     	ldr	x0, [x21, #0x368]
 4654248: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465424c: f9404749     	ldr	x9, [x26, #0x88]
 4654250: eb09011f     	cmp	x8, x9
 4654254: 54000041     	b.ne	0x465425c <_ChromeMain+0x464efc0>
 4654258: 96e739f9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465425c: f901b6b6     	str	x22, [x21, #0x368]
 4654260: f9401be0     	ldr	x0, [sp, #0x30]
 4654264: b5001640     	cbnz	x0, 0x465452c <_ChromeMain+0x464f290>
 4654268: f941b6a8     	ldr	x8, [x21, #0x368]
 465426c: 3946a509     	ldrb	w9, [x8, #0x1a9]
 4654270: 340000a9     	cbz	w9, 0x4654284 <_ChromeMain+0x464efe8>
 4654274: 3906a51f     	strb	wzr, [x8, #0x1a9]
 4654278: 9103e100     	add	x0, x8, #0xf8
 465427c: 9106a501     	add	x1, x8, #0x1a9
 4654280: 97234f54     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4654284: f8bfc360     	ldapr	x0, [x27]
 4654288: b4001d60     	cbz	x0, 0x4654634 <_ChromeMain+0x464f398>
 465428c: 52808c01     	mov	w1, #0x460              ; =1120
 4654290: d2800002     	mov	x2, #0x0                ; =0
 4654294: 96e95cc7     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4654298: aa0003f6     	mov	x22, x0
 465429c: 52800001     	mov	w1, #0x0                ; =0
 46542a0: 958143ea     	bl	0xa6a5248 <_ChromeMain+0xa69ffac>
 46542a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46542a8: f9404749     	ldr	x9, [x26, #0x88]
 46542ac: eb09011f     	cmp	x8, x9
 46542b0: 54000061     	b.ne	0x46542bc <_ChromeMain+0x464f020>
 46542b4: aa1603e0     	mov	x0, x22
 46542b8: 96e70011     	bl	0x142fc <_ChromeMain+0xf060>
 46542bc: f941baa0     	ldr	x0, [x21, #0x370]
 46542c0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46542c4: f9404749     	ldr	x9, [x26, #0x88]
 46542c8: eb09011f     	cmp	x8, x9
 46542cc: 54000041     	b.ne	0x46542d4 <_ChromeMain+0x464f038>
 46542d0: 96e739db     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46542d4: f901bab6     	str	x22, [x21, #0x370]
 46542d8: 3946a6c8     	ldrb	w8, [x22, #0x1a9]
 46542dc: 340000a8     	cbz	w8, 0x46542f0 <_ChromeMain+0x464f054>
 46542e0: 3906a6df     	strb	wzr, [x22, #0x1a9]
 46542e4: 9103e2c0     	add	x0, x22, #0xf8
 46542e8: 9106a6c1     	add	x1, x22, #0x1a9
 46542ec: 97234f39     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46542f0: 3945a6c8     	ldrb	w8, [x22, #0x169]
 46542f4: 35001f08     	cbnz	w8, 0x46546d4 <_ChromeMain+0x464f438>
 46542f8: f9419aa0     	ldr	x0, [x21, #0x330]
 46542fc: f940cc02     	ldr	x2, [x0, #0x198]
 4654300: aa1603e1     	mov	x1, x22
 4654304: 9704943e     	bl	0x7793fc <_ChromeMain+0x774160>
 4654308: f8bfc360     	ldapr	x0, [x27]
 465430c: b4001980     	cbz	x0, 0x465463c <_ChromeMain+0x464f3a0>
 4654310: 52806201     	mov	w1, #0x310              ; =784
 4654314: d2800002     	mov	x2, #0x0                ; =0
 4654318: 96e95ca6     	bl	0xab5b0 <_ChromeMain+0xa6314>
 465431c: aa0003f6     	mov	x22, x0
 4654320: 97346b88     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4654324: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4654328: f9404749     	ldr	x9, [x26, #0x88]
 465432c: eb09011f     	cmp	x8, x9
 4654330: 54000061     	b.ne	0x465433c <_ChromeMain+0x464f0a0>
 4654334: aa1603e0     	mov	x0, x22
 4654338: 96e6fff1     	bl	0x142fc <_ChromeMain+0xf060>
 465433c: f941bea0     	ldr	x0, [x21, #0x378]
 4654340: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4654344: f9404749     	ldr	x9, [x26, #0x88]
 4654348: eb09011f     	cmp	x8, x9
 465434c: 54000041     	b.ne	0x4654354 <_ChromeMain+0x464f0b8>
 4654350: 96e739bb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4654354: f901beb6     	str	x22, [x21, #0x378]
 4654358: 52802800     	mov	w0, #0x140              ; =320
 465435c: 96e6ec03     	bl	0xf368 <_ChromeMain+0xa0cc>
 4654360: aa0003f7     	mov	x23, x0
 4654364: 978ef09b     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4654368: aa1603e0     	mov	x0, x22
 465436c: aa1703e1     	mov	x1, x23
 4654370: 9754d532     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4654374: b940f2e8     	ldr	w8, [x23, #0xf0]
 4654378: 7100051f     	cmp	w8, #0x1
 465437c: 540007c1     	b.ne	0x4654474 <_ChromeMain+0x464f1d8>
 4654380: 52800068     	mov	w8, #0x3                ; =3
 4654384: b90033e8     	str	w8, [sp, #0x30]
 4654388: b0051d81     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 465438c: 9115a021     	add	x1, x1, #0x568
 4654390: 910462e0     	add	x0, x23, #0x118
 4654394: 9100c3e2     	add	x2, sp, #0x30
 4654398: 97504383     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 465439c: 3943d2e8     	ldrb	w8, [x23, #0xf4]
 46543a0: 370000c8     	tbnz	w8, #0x0, 0x46543b8 <_ChromeMain+0x464f11c>
 46543a4: 52800028     	mov	w8, #0x1                ; =1
 46543a8: 3903d2e8     	strb	w8, [x23, #0xf4]
 46543ac: aa1703e0     	mov	x0, x23
 46543b0: 52800021     	mov	w1, #0x1                ; =1
 46543b4: 975043bf     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 46543b8: f941baa0     	ldr	x0, [x21, #0x370]
 46543bc: aa1603e1     	mov	x1, x22
 46543c0: 95814300     	bl	0xa6a4fc0 <_ChromeMain+0xa69fd24>
 46543c4: f94002a8     	ldr	x8, [x21]
 46543c8: f9405108     	ldr	x8, [x8, #0xa0]
 46543cc: aa1503e0     	mov	x0, x21
 46543d0: 52800001     	mov	w1, #0x0                ; =0
 46543d4: d63f0100     	blr	x8
 46543d8: 3945a6a8     	ldrb	w8, [x21, #0x169]
 46543dc: 35001828     	cbnz	w8, 0x46546e0 <_ChromeMain+0x464f444>
 46543e0: f940ce62     	ldr	x2, [x19, #0x198]
 46543e4: aa1303e0     	mov	x0, x19
 46543e8: aa1503e1     	mov	x1, x21
 46543ec: 97049404     	bl	0x7793fc <_ChromeMain+0x774160>
 46543f0: f942fe68     	ldr	x8, [x19, #0x5f8]
 46543f4: b40004c8     	cbz	x8, 0x465448c <_ChromeMain+0x464f1f0>
 46543f8: 39805e89     	ldrsb	x9, [x20, #0x17]
 46543fc: a9402e8a     	ldp	x10, x11, [x20]
 4654400: f100013f     	cmp	x9, #0x0
 4654404: 9a944156     	csel	x22, x10, x20, mi
 4654408: 7100013f     	cmp	w9, #0x0
 465440c: 9a894178     	csel	x24, x11, x9, mi
 4654410: 14000003     	b	0x465441c <_ChromeMain+0x464f180>
 4654414: f94006e8     	ldr	x8, [x23, #0x8]
 4654418: b4000868     	cbz	x8, 0x4654524 <_ChromeMain+0x464f288>
 465441c: aa0803f7     	mov	x23, x8
 4654420: f8420d09     	ldr	x9, [x8, #0x20]!
 4654424: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4654428: f100015f     	cmp	x10, #0x0
 465442c: 9a884121     	csel	x1, x9, x8, mi
 4654430: f9400508     	ldr	x8, [x8, #0x8]
 4654434: 7100015f     	cmp	w10, #0x0
 4654438: 9a8a4119     	csel	x25, x8, x10, mi
 465443c: eb18033f     	cmp	x25, x24
 4654440: 9a983322     	csel	x2, x25, x24, lo
 4654444: aa1603e0     	mov	x0, x22
 4654448: 94e6d506     	bl	0x8009860 <_ChromeMain+0x80045c4>
 465444c: 340000c0     	cbz	w0, 0x4654464 <_ChromeMain+0x464f1c8>
 4654450: 36fffe20     	tbz	w0, #0x1f, 0x4654414 <_ChromeMain+0x464f178>
 4654454: f94002e8     	ldr	x8, [x23]
 4654458: aa1703f9     	mov	x25, x23
 465445c: b5fffe08     	cbnz	x8, 0x465441c <_ChromeMain+0x464f180>
 4654460: 1400000c     	b	0x4654490 <_ChromeMain+0x464f1f4>
 4654464: eb19031f     	cmp	x24, x25
 4654468: 54ff8c60     	b.eq	0x46535f4 <_ChromeMain+0x464e358>
 465446c: 54ffff43     	b.lo	0x4654454 <_ChromeMain+0x464f1b8>
 4654470: 17ffffe9     	b	0x4654414 <_ChromeMain+0x464f178>
 4654474: 52800028     	mov	w8, #0x1                ; =1
 4654478: b900f2e8     	str	w8, [x23, #0xf0]
 465447c: aa1703e0     	mov	x0, x23
 4654480: 52800021     	mov	w1, #0x1                ; =1
 4654484: 9750438b     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4654488: 17ffffbe     	b	0x4654380 <_ChromeMain+0x464f0e4>
 465448c: 9117e277     	add	x23, x19, #0x5f8
 4654490: 52800800     	mov	w0, #0x40               ; =64
 4654494: 96e6ebb5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4654498: b4000a40     	cbz	x0, 0x46545e0 <_ChromeMain+0x464f344>
 465449c: aa0003f6     	mov	x22, x0
 46544a0: f802041f     	str	xzr, [x0], #0x20
 46544a4: b40009e0     	cbz	x0, 0x46545e0 <_ChromeMain+0x464f344>
 46544a8: 39c05e88     	ldrsb	w8, [x20, #0x17]
 46544ac: 37f80368     	tbnz	w8, #0x1f, 0x4654518 <_ChromeMain+0x464f27c>
 46544b0: 3dc00280     	ldr	q0, [x20]
 46544b4: 3d800000     	str	q0, [x0]
 46544b8: f9400a88     	ldr	x8, [x20, #0x10]
 46544bc: f9000808     	str	x8, [x0, #0x10]
 46544c0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 46544c4: f9404749     	ldr	x9, [x26, #0x88]
 46544c8: eb09011f     	cmp	x8, x9
 46544cc: 54000061     	b.ne	0x46544d8 <_ChromeMain+0x464f23c>
 46544d0: aa1503e0     	mov	x0, x21
 46544d4: 96e6ff8a     	bl	0x142fc <_ChromeMain+0xf060>
 46544d8: f9001ed5     	str	x21, [x22, #0x38]
 46544dc: a9007edf     	stp	xzr, xzr, [x22]
 46544e0: f9000ad7     	str	x23, [x22, #0x10]
 46544e4: f9000336     	str	x22, [x25]
 46544e8: f942fa68     	ldr	x8, [x19, #0x5f0]
 46544ec: f9400108     	ldr	x8, [x8]
 46544f0: b4000068     	cbz	x8, 0x46544fc <_ChromeMain+0x464f260>
 46544f4: f902fa68     	str	x8, [x19, #0x5f0]
 46544f8: f9400336     	ldr	x22, [x25]
 46544fc: f942fe60     	ldr	x0, [x19, #0x5f8]
 4654500: aa1603e1     	mov	x1, x22
 4654504: 96e81d57     	bl	0x5ba60 <_ChromeMain+0x567c4>
 4654508: f9430268     	ldr	x8, [x19, #0x600]
 465450c: 91000508     	add	x8, x8, #0x1
 4654510: f9030268     	str	x8, [x19, #0x600]
 4654514: 17fffc38     	b	0x46535f4 <_ChromeMain+0x464e358>
 4654518: a9400a81     	ldp	x1, x2, [x20]
 465451c: 96e70f3f     	bl	0x18218 <_ChromeMain+0x12f7c>
 4654520: 17ffffe8     	b	0x46544c0 <_ChromeMain+0x464f224>
 4654524: 910022f9     	add	x25, x23, #0x8
 4654528: 17ffffda     	b	0x4654490 <_ChromeMain+0x464f1f4>
 465452c: 12800008     	mov	w8, #-0x1               ; =-1
 4654530: b8e80008     	ldaddal	w8, w8, [x0]
 4654534: 7100051f     	cmp	w8, #0x1
 4654538: 54ffe981     	b.ne	0x4654268 <_ChromeMain+0x464efcc>
 465453c: f9400808     	ldr	x8, [x0, #0x10]
 4654540: d63f0100     	blr	x8
 4654544: 17ffff49     	b	0x4654268 <_ChromeMain+0x464efcc>
 4654548: 972be09f     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 465454c: 52800a01     	mov	w1, #0x50               ; =80
 4654550: 96e6d25a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654554: 17fffe7d     	b	0x4653f48 <_ChromeMain+0x464ecac>
 4654558: b900f2ff     	str	wzr, [x23, #0xf0]
 465455c: aa1703e0     	mov	x0, x23
 4654560: 52800021     	mov	w1, #0x1                ; =1
 4654564: 97504353     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4654568: 17fffd25     	b	0x46539fc <_ChromeMain+0x464e760>
 465456c: b8280008     	ldadd	w8, w8, [x0]
 4654570: 7100011f     	cmp	w8, #0x0
 4654574: 54000ced     	b.le	0x4654710 <_ChromeMain+0x464f474>
 4654578: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 465457c: 6b09011f     	cmp	w8, w9
 4654580: 54ffd1a1     	b.ne	0x4653fb4 <_ChromeMain+0x464ed18>
 4654584: d4200000     	brk	#0
 4654588: d4400000     	hlt	#0
 465458c: d4200020     	brk	#0x1
 4654590: 390edadf     	strb	wzr, [x22, #0x3b6]
 4654594: aa1603e0     	mov	x0, x22
 4654598: 97234f5c     	bl	0xf28308 <_ChromeMain+0xf2306c>
 465459c: aa1603e0     	mov	x0, x22
 46545a0: 52800041     	mov	w1, #0x2                ; =2
 46545a4: 970634f0     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 46545a8: 9103e2c0     	add	x0, x22, #0xf8
 46545ac: 910edac1     	add	x1, x22, #0x3b6
 46545b0: 97234e88     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 46545b4: f941aeb6     	ldr	x22, [x21, #0x358]
 46545b8: 17fffe34     	b	0x4653e88 <_ChromeMain+0x464ebec>
 46545bc: f004c788     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 46545c0: 3dc2a100     	ldr	q0, [x8, #0xa80]
 46545c4: 3c8f82e0     	stur	q0, [x23, #0xf8]
 46545c8: aa1703e0     	mov	x0, x23
 46545cc: 52800021     	mov	w1, #0x1                ; =1
 46545d0: 97504338     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 46545d4: 17fffd1d     	b	0x4653a48 <_ChromeMain+0x464e7ac>
 46545d8: d4200000     	brk	#0
 46545dc: d4400000     	hlt	#0
 46545e0: d4200020     	brk	#0x1
 46545e4: 97f1fc45     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46545e8: 17fffc10     	b	0x4653628 <_ChromeMain+0x464e38c>
 46545ec: 97f1fc43     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46545f0: 17fffc4a     	b	0x4653718 <_ChromeMain+0x464e47c>
 46545f4: 97f1fc41     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 46545f8: 17fffc82     	b	0x4653800 <_ChromeMain+0x464e564>
 46545fc: 97f1fc3f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654600: 17fffcb0     	b	0x46538c0 <_ChromeMain+0x464e624>
 4654604: 97f1fc3d     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654608: 17fffcd5     	b	0x465395c <_ChromeMain+0x464e6c0>
 465460c: 97f1fc3b     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654610: 17fffd11     	b	0x4653a54 <_ChromeMain+0x464e7b8>
 4654614: 97f1fc39     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654618: 17fffd4e     	b	0x4653b50 <_ChromeMain+0x464e8b4>
 465461c: 97f1fc37     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654620: 17fffda6     	b	0x4653cb8 <_ChromeMain+0x464ea1c>
 4654624: 97f1fc35     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654628: 17fffdeb     	b	0x4653dd4 <_ChromeMain+0x464eb38>
 465462c: 97f1fc33     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654630: 17fffe84     	b	0x4654040 <_ChromeMain+0x464eda4>
 4654634: 97f1fc31     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654638: 17ffff15     	b	0x465428c <_ChromeMain+0x464eff0>
 465463c: 97f1fc2f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4654640: 17ffff34     	b	0x4654310 <_ChromeMain+0x464f074>
 4654644: d4200000     	brk	#0
 4654648: d4400000     	hlt	#0
 465464c: d4200020     	brk	#0x1
 4654650: d4200000     	brk	#0
 4654654: d4400000     	hlt	#0
 4654658: d4200020     	brk	#0x1
 465465c: d4200000     	brk	#0
 4654660: d4400000     	hlt	#0
 4654664: d4200020     	brk	#0x1
 4654668: d4200000     	brk	#0
 465466c: d4400000     	hlt	#0
 4654670: d4200020     	brk	#0x1
 4654674: d4200000     	brk	#0
 4654678: d4400000     	hlt	#0
 465467c: d4200020     	brk	#0x1
 4654680: d4200000     	brk	#0
 4654684: d4400000     	hlt	#0
 4654688: d4200020     	brk	#0x1
 465468c: d4200000     	brk	#0
 4654690: d4400000     	hlt	#0
 4654694: d4200020     	brk	#0x1
 4654698: d4200000     	brk	#0
 465469c: d4400000     	hlt	#0
 46546a0: d4200020     	brk	#0x1
 46546a4: d4200000     	brk	#0
 46546a8: d4400000     	hlt	#0
 46546ac: d4200020     	brk	#0x1
 46546b0: d4200000     	brk	#0
 46546b4: d4400000     	hlt	#0
 46546b8: d4200020     	brk	#0x1
 46546bc: b21e07e9     	mov	x9, #0xc0000000c        ; =51539607564
 46546c0: f9000109     	str	x9, [x8]
 46546c4: 17fffea0     	b	0x4654144 <_ChromeMain+0x464eea8>
 46546c8: d4200000     	brk	#0
 46546cc: d4400000     	hlt	#0
 46546d0: d4200020     	brk	#0x1
 46546d4: d4200000     	brk	#0
 46546d8: d4400000     	hlt	#0
 46546dc: d4200020     	brk	#0x1
 46546e0: d4200000     	brk	#0
 46546e4: d4400000     	hlt	#0
 46546e8: d4200020     	brk	#0x1
 46546ec: d2800289     	mov	x9, #0x14               ; =20
 46546f0: f2c00289     	movk	x9, #0x14, lsl #32
 46546f4: f9000109     	str	x9, [x8]
 46546f8: 17fffd57     	b	0x4653c54 <_ChromeMain+0x464e9b8>
 46546fc: aa1703e0     	mov	x0, x23
 4654700: 976f4690     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4654704: b94046e8     	ldr	w8, [x23, #0x44]
 4654708: f9402717     	ldr	x23, [x24, #0x48]
 465470c: 17fffdf6     	b	0x4653ee4 <_ChromeMain+0x464ec48>
 4654710: d4200000     	brk	#0
 4654714: d4400000     	hlt	#0
 4654718: d4200020     	brk	#0x1
 465471c: d503201f     	nop
 4654720: d503201f     	nop
 4654724: d503201f     	nop
 4654728: d503201f     	nop
 465472c: d503201f     	nop
 4654730: d503201f     	nop
 4654734: d503201f     	nop
 4654738: d503201f     	nop
 465473c: d503201f     	nop
