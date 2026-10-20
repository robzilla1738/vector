
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1699414: d10343ff     	sub	sp, sp, #0xd0
 1699418: a9076ffc     	stp	x28, x27, [sp, #0x70]
 169941c: a90867fa     	stp	x26, x25, [sp, #0x80]
 1699420: a9095ff8     	stp	x24, x23, [sp, #0x90]
 1699424: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 1699428: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 169942c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 1699430: 910303fd     	add	x29, sp, #0xc0
 1699434: aa0203f5     	mov	x21, x2
 1699438: aa0103f4     	mov	x20, x1
 169943c: aa0003f6     	mov	x22, x0
 1699440: aa0803f3     	mov	x19, x8
 1699444: f0064c68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 1699448: f940f908     	ldr	x8, [x8, #0x1f0]
 169944c: f9400108     	ldr	x8, [x8]
 1699450: f81a83a8     	stur	x8, [x29, #-0x58]
 1699454: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 1699458: f90013ff     	str	xzr, [sp, #0x20]
 169945c: aa0103e0     	mov	x0, x1
 1699460: 52800001     	mov	w1, #0x0                ; =0
 1699464: 95a619d0     	bl	0x801fba4 <_ChromeMain+0x801a908>
 1699468: cb140008     	sub	x8, x0, x20
 169946c: b100051f     	cmn	x8, #0x1
 1699470: fa401804     	ccmp	x0, #0x0, #0x4, ne
 1699474: 540027a1     	b.ne	0x1699968 <_ChromeMain+0x16946cc>
 1699478: 39805ed7     	ldrsb	x23, [x22, #0x17]
 169947c: aa1703e9     	mov	x9, x23
 1699480: aa1603e8     	mov	x8, x22
 1699484: b7f810d7     	tbnz	x23, #0x3f, 0x169969c <_ChromeMain+0x1694400>
 1699488: f10002bf     	cmp	x21, #0x0
 169948c: 1a9f17fc     	cset	w28, eq
 1699490: b40000e9     	cbz	x9, 0x16994ac <_ChromeMain+0x1694210>
 1699494: f100053f     	cmp	x9, #0x1
 1699498: 540000a1     	b.ne	0x16994ac <_ChromeMain+0x1694210>
 169949c: 39400108     	ldrb	w8, [x8]
 16994a0: 7100b91f     	cmp	w8, #0x2e
 16994a4: 54000041     	b.ne	0x16994ac <_ChromeMain+0x1694210>
 16994a8: b5002e55     	cbnz	x21, 0x1699a70 <_ChromeMain+0x16947d4>
 16994ac: a9007e7f     	stp	xzr, xzr, [x19]
 16994b0: f9000a7f     	str	xzr, [x19, #0x10]
 16994b4: 36f800f7     	tbz	w23, #0x1f, 0x16994d0 <_ChromeMain+0x1694234>
 16994b8: f94006d7     	ldr	x23, [x22, #0x8]
 16994bc: 92800228     	mov	x8, #-0x12              ; =-18
 16994c0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 16994c4: eb0802ff     	cmp	x23, x8
 16994c8: 540024e8     	b.hi	0x1699964 <_ChromeMain+0x16946c8>
 16994cc: f94002d6     	ldr	x22, [x22]
 16994d0: f1005aff     	cmp	x23, #0x16
 16994d4: 54000e88     	b.hi	0x16996a4 <_ChromeMain+0x1694408>
 16994d8: 39005e77     	strb	w23, [x19, #0x17]
 16994dc: aa1303f8     	mov	x24, x19
 16994e0: 8b170308     	add	x8, x24, x23
 16994e4: eb18011f     	cmp	x8, x24
 16994e8: 54002943     	b.lo	0x1699a10 <_ChromeMain+0x1694774>
 16994ec: eb16011f     	cmp	x8, x22
 16994f0: fa568302     	ccmp	x24, x22, #0x2, hi
 16994f4: 540028e9     	b.ls	0x1699a10 <_ChromeMain+0x1694774>
 16994f8: aa1803e0     	mov	x0, x24
 16994fc: aa1603e1     	mov	x1, x22
 1699500: aa1703e2     	mov	x2, x23
 1699504: 95a5d772     	bl	0x800f2cc <_ChromeMain+0x800a030>
 1699508: 38376b1f     	strb	wzr, [x24, x23]
 169950c: 39405e77     	ldrb	w23, [x19, #0x17]
 1699510: 13001efb     	sxtb	w27, w23
 1699514: a940627a     	ldp	x26, x24, [x19]
 1699518: 7100037f     	cmp	w27, #0x0
 169951c: 9a934356     	csel	x22, x26, x19, mi
 1699520: 9a974302     	csel	x2, x24, x23, mi
 1699524: aa1603e0     	mov	x0, x22
 1699528: 52800001     	mov	w1, #0x0                ; =0
 169952c: 95a6199e     	bl	0x801fba4 <_ChromeMain+0x801a908>
 1699530: cb160008     	sub	x8, x0, x22
 1699534: b100051f     	cmn	x8, #0x1
 1699538: fa401804     	ccmp	x0, #0x0, #0x4, ne
 169953c: 54002001     	b.ne	0x169993c <_ChromeMain+0x16946a0>
 1699540: 7219037f     	tst	w27, #0x80
 1699544: 9a971308     	csel	x8, x24, x23, ne
 1699548: f100091f     	cmp	x8, #0x2
 169954c: 54000463     	b.lo	0x16995d8 <_ChromeMain+0x169433c>
 1699550: f005d19b     	adrp	x27, 0xd0cc000 <dyld_stub_binder+0xd0cc000>
 1699554: 911fe37b     	add	x27, x27, #0x7f8
 1699558: 925d736d     	and	x13, x27, #0xfffffff800000000
 169955c: d1000516     	sub	x22, x8, #0x1
 1699560: 92800004     	mov	x4, #-0x1               ; =-1
 1699564: b006a8d8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 1699568: 91020318     	add	x24, x24, #0x80
 169956c: b006a8c1     	adrp	x1, 0xebb2000 <dyld_stub_binder+0xebb2000>
 1699570: 529fffc0     	mov	w0, #0xfffe             ; =65534
 1699574: f0064c7a     	adrp	x26, 0xe028000 <dyld_stub_binder+0xe028000>
 1699578: f941675a     	ldr	x26, [x26, #0x2c8]
 169957c: f0064c63     	adrp	x3, 0xe028000 <dyld_stub_binder+0xe028000>
 1699580: f9416c63     	ldr	x3, [x3, #0x2d8]
 1699584: b006a8e5     	adrp	x5, 0xebb6000 <dyld_stub_binder+0xebb6000>
 1699588: 910440a5     	add	x5, x5, #0x110
 169958c: 39405e69     	ldrb	w9, [x19, #0x17]
 1699590: 13001d28     	sxtb	w8, w9
 1699594: f940066a     	ldr	x10, [x19, #0x8]
 1699598: 7100011f     	cmp	w8, #0x0
 169959c: 9a894149     	csel	x9, x10, x9, mi
 16995a0: eb0902df     	cmp	x22, x9
 16995a4: 54002368     	b.hi	0x1699a10 <_ChromeMain+0x1694774>
 16995a8: f9400269     	ldr	x9, [x19]
 16995ac: 7100011f     	cmp	w8, #0x0
 16995b0: 9a93412a     	csel	x10, x9, x19, mi
 16995b4: 3876694a     	ldrb	w10, [x10, x22]
 16995b8: f940030c     	ldr	x12, [x24]
 16995bc: a9412f0e     	ldp	x14, x11, [x24, #0x10]
 16995c0: 8a1b016f     	and	x15, x11, x27
 16995c4: eb0c01bf     	cmp	x13, x12
 16995c8: fa4e11e4     	ccmp	x15, x14, #0x4, ne
 16995cc: 54000ac0     	b.eq	0x1699724 <_ChromeMain+0x1694488>
 16995d0: 7100bd5f     	cmp	w10, #0x2f
 16995d4: 540007a0     	b.eq	0x16996c8 <_ChromeMain+0x169442c>
 16995d8: 370003bc     	tbnz	w28, #0x0, 0x169964c <_ChromeMain+0x16943b0>
 16995dc: 39405e69     	ldrb	w9, [x19, #0x17]
 16995e0: 13001d28     	sxtb	w8, w9
 16995e4: f940066a     	ldr	x10, [x19, #0x8]
 16995e8: 7100011f     	cmp	w8, #0x0
 16995ec: 9a894149     	csel	x9, x10, x9, mi
 16995f0: b40002e9     	cbz	x9, 0x169964c <_ChromeMain+0x16943b0>
 16995f4: f940026a     	ldr	x10, [x19]
 16995f8: 7100011f     	cmp	w8, #0x0
 16995fc: 9a934148     	csel	x8, x10, x19, mi
 1699600: 8b090108     	add	x8, x8, x9
 1699604: 385ff116     	ldurb	w22, [x8, #-0x1]
 1699608: f005d180     	adrp	x0, 0xd0cc000 <dyld_stub_binder+0xd0cc000>
 169960c: 911fe000     	add	x0, x0, #0x7f8
 1699610: 52800021     	mov	w1, #0x1                ; =1
 1699614: 52800022     	mov	w2, #0x1                ; =1
 1699618: 97a8044e     	bl	0x9a750 <_ChromeMain+0x954b4>
 169961c: 35001820     	cbnz	w0, 0x1699920 <_ChromeMain+0x1694684>
 1699620: 7100bedf     	cmp	w22, #0x2f
 1699624: 54000140     	b.eq	0x169964c <_ChromeMain+0x16943b0>
 1699628: 39405e68     	ldrb	w8, [x19, #0x17]
 169962c: f9400669     	ldr	x9, [x19, #0x8]
 1699630: 7219011f     	tst	w8, #0x80
 1699634: 9a881128     	csel	x8, x9, x8, ne
 1699638: b40000a8     	cbz	x8, 0x169964c <_ChromeMain+0x16943b0>
 169963c: aa1303e0     	mov	x0, x19
 1699640: 52800021     	mov	w1, #0x1                ; =1
 1699644: 528005e2     	mov	w2, #0x2f               ; =47
 1699648: 9400012a     	bl	0x1699af0 <_ChromeMain+0x1694854>
 169964c: aa1303e0     	mov	x0, x19
 1699650: aa1403e1     	mov	x1, x20
 1699654: aa1503e2     	mov	x2, x21
 1699658: 97a80372     	bl	0x9a420 <_ChromeMain+0x95184>
 169965c: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 1699660: 37f81da8     	tbnz	w8, #0x1f, 0x1699a14 <_ChromeMain+0x1694778>
 1699664: f85a83a8     	ldur	x8, [x29, #-0x58]
 1699668: f0064c69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 169966c: f940f929     	ldr	x9, [x9, #0x1f0]
 1699670: f9400129     	ldr	x9, [x9]
 1699674: eb08013f     	cmp	x9, x8
 1699678: 54001381     	b.ne	0x16998e8 <_ChromeMain+0x169464c>
 169967c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 1699680: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 1699684: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 1699688: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 169968c: a94867fa     	ldp	x26, x25, [sp, #0x80]
 1699690: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 1699694: 910343ff     	add	sp, sp, #0xd0
 1699698: d65f03c0     	ret
 169969c: a94026c8     	ldp	x8, x9, [x22]
 16996a0: 17ffff7a     	b	0x1699488 <_ChromeMain+0x16941ec>
 16996a4: 927ceafa     	and	x26, x23, #0x7ffffffffffffff0
 16996a8: 91004340     	add	x0, x26, #0x10
 16996ac: 97a5d72f     	bl	0xf368 <_ChromeMain+0xa0cc>
 16996b0: aa0003f8     	mov	x24, x0
 16996b4: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 16996b8: cb080348     	sub	x8, x26, x8
 16996bc: a9005e60     	stp	x0, x23, [x19]
 16996c0: f9000a68     	str	x8, [x19, #0x10]
 16996c4: 17ffff87     	b	0x16994e0 <_ChromeMain+0x1694244>
 16996c8: f90007f5     	str	x21, [sp, #0x8]
 16996cc: aa1403f5     	mov	x21, x20
 16996d0: f1000c9f     	cmp	x4, #0x3
 16996d4: fa411ac0     	ccmp	x22, #0x1, #0x0, ne
 16996d8: 54001a80     	b.eq	0x1699a28 <_ChromeMain+0x169478c>
 16996dc: aa0503f4     	mov	x20, x5
 16996e0: aa0303f9     	mov	x25, x3
 16996e4: aa0103f7     	mov	x23, x1
 16996e8: aa1303e0     	mov	x0, x19
 16996ec: aa1603e1     	mov	x1, x22
 16996f0: 52800002     	mov	w2, #0x0                ; =0
 16996f4: 97e8ce52     	bl	0x10cd03c <_ChromeMain+0x10c7da0>
 16996f8: 910006c4     	add	x4, x22, #0x1
 16996fc: f10006d6     	subs	x22, x22, #0x1
 1699700: aa1703e1     	mov	x1, x23
 1699704: 529fffc0     	mov	w0, #0xfffe             ; =65534
 1699708: 925d736d     	and	x13, x27, #0xfffffff800000000
 169970c: aa1903e3     	mov	x3, x25
 1699710: aa1403e5     	mov	x5, x20
 1699714: aa1503f4     	mov	x20, x21
 1699718: f94007f5     	ldr	x21, [sp, #0x8]
 169971c: 54fff388     	b.hi	0x169958c <_ChromeMain+0x16942f0>
 1699720: 17ffffae     	b	0x16995d8 <_ChromeMain+0x169433c>
 1699724: 925e776d     	and	x13, x27, #0xfffffffc00000000
 1699728: f9404430     	ldr	x16, [x1, #0x88]
 169972c: eb1001bf     	cmp	x13, x16
 1699730: 54000901     	b.ne	0x1699850 <_ChromeMain+0x16945b4>
 1699734: b24087eb     	mov	x11, #0x3ffffffff       ; =17179869183
 1699738: 52800057     	mov	w23, #0x2               ; =2
 169973c: aa0503ec     	mov	x12, x5
 1699740: 926bab6d     	and	x13, x27, #0xffffffffffe00000
 1699744: 8a1b016b     	and	x11, x11, x27
 1699748: d355fd6b     	lsr	x11, x11, #21
 169974c: 786b798b     	ldrh	w11, [x12, x11, lsl #1]
 1699750: 6b00017f     	cmp	w11, w0
 1699754: 54000cc1     	b.ne	0x16998ec <_ChromeMain+0x1694650>
 1699758: d280000e     	mov	x14, #0x0               ; =0
 169975c: 5280002b     	mov	w11, #0x1               ; =1
 1699760: 2a0b03f0     	mov	w16, w11
 1699764: b4fff370     	cbz	x16, 0x16995d0 <_ChromeMain+0x1694334>
 1699768: b100076b     	adds	x11, x27, #0x1
 169976c: 54001522     	b.hs	0x1699a10 <_ChromeMain+0x1694774>
 1699770: 8b170f0c     	add	x12, x24, x23, lsl #3
 1699774: f940118c     	ldr	x12, [x12, #0x20]
 1699778: b980034f     	ldrsw	x15, [x26]
 169977c: f1000a1f     	cmp	x16, #0x2
 1699780: 54000860     	b.eq	0x169988c <_ChromeMain+0x16945f0>
 1699784: 92405370     	and	x16, x27, #0x1fffff
 1699788: 910009ee     	add	x14, x15, #0x2
 169978c: 9ace260f     	lsr	x15, x16, x14
 1699790: 8b0d018d     	add	x13, x12, x13
 1699794: 8b0f15ad     	add	x13, x13, x15, lsl #5
 1699798: 394079af     	ldrb	w15, [x13, #0x1e]
 169979c: 924015ef     	and	x15, x15, #0x3f
 16997a0: cb0f15b0     	sub	x16, x13, x15, lsl #5
 16997a4: f9400a0f     	ldr	x15, [x16, #0x10]
 16997a8: b40016ef     	cbz	x15, 0x1699a84 <_ChromeMain+0x16947e8>
 16997ac: cb0c020d     	sub	x13, x16, x12
 16997b0: 926ba9b1     	and	x17, x13, #0xffffffffffe00000
 16997b4: f940006d     	ldr	x13, [x3]
 16997b8: d10005a0     	sub	x0, x13, #0x1
 16997bc: 8a100010     	and	x16, x0, x16
 16997c0: d345fe10     	lsr	x16, x16, #5
 16997c4: 9ace2210     	lsl	x16, x16, x14
 16997c8: 8b110210     	add	x16, x16, x17
 16997cc: cb100371     	sub	x17, x27, x16
 16997d0: b94019e0     	ldr	w0, [x15, #0x18]
 16997d4: f94011ef     	ldr	x15, [x15, #0x20]
 16997d8: 9b0f7e2f     	mul	x15, x17, x15
 16997dc: d36afdef     	lsr	x15, x15, #42
 16997e0: 9ba041ef     	umaddl	x15, w15, w0, x16
 16997e4: 926ba9f0     	and	x16, x15, #0xffffffffffe00000
 16997e8: 924051f1     	and	x17, x15, #0x1fffff
 16997ec: 9ace262e     	lsr	x14, x17, x14
 16997f0: 8b0c020c     	add	x12, x16, x12
 16997f4: 8b0e158c     	add	x12, x12, x14, lsl #5
 16997f8: 3940798e     	ldrb	w14, [x12, #0x1e]
 16997fc: 924015ce     	and	x14, x14, #0x3f
 1699800: cb0e158c     	sub	x12, x12, x14, lsl #5
 1699804: b940198e     	ldr	w14, [x12, #0x18]
 1699808: 37f8020e     	tbnz	w14, #0x1f, 0x1699848 <_ChromeMain+0x16945ac>
 169980c: f940098e     	ldr	x14, [x12, #0x10]
 1699810: b94019ce     	ldr	w14, [x14, #0x18]
 1699814: eb0f017f     	cmp	x11, x15
 1699818: 54000123     	b.lo	0x169983c <_ChromeMain+0x16945a0>
 169981c: cb0d03ed     	neg	x13, x13
 1699820: 8a0d018c     	and	x12, x12, x13
 1699824: f940018c     	ldr	x12, [x12]
 1699828: b940818c     	ldr	w12, [x12, #0x80]
 169982c: 8b0f01cd     	add	x13, x14, x15
 1699830: cb0c01ac     	sub	x12, x13, x12
 1699834: eb0b019f     	cmp	x12, x11
 1699838: 54ffecc2     	b.hs	0x16995d0 <_ChromeMain+0x1694334>
 169983c: d4200000     	brk	#0
 1699840: d4400000     	hlt	#0
 1699844: d4200020     	brk	#0x1
 1699848: f940118e     	ldr	x14, [x12, #0x20]
 169984c: 17fffff2     	b	0x1699814 <_ChromeMain+0x1694578>
 1699850: eb0c01bf     	cmp	x13, x12
 1699854: 54000060     	b.eq	0x1699860 <_ChromeMain+0x16945c4>
 1699858: eb0e01ff     	cmp	x15, x14
 169985c: 54000561     	b.ne	0x1699908 <_ChromeMain+0x169466c>
 1699860: b006a8ce     	adrp	x14, 0xebb2000 <dyld_stub_binder+0xebb2000>
 1699864: 910441ce     	add	x14, x14, #0x110
 1699868: b006a90f     	adrp	x15, 0xebba000 <dyld_stub_binder+0xebba000>
 169986c: 910441ef     	add	x15, x15, #0x110
 1699870: b24087f0     	mov	x16, #0x3ffffffff       ; =17179869183
 1699874: 52800071     	mov	w17, #0x3               ; =3
 1699878: eb0c01bf     	cmp	x13, x12
 169987c: 9a8f01cc     	csel	x12, x14, x15, eq
 1699880: da8b020b     	csinv	x11, x16, x11, eq
 1699884: 9a9f1637     	csinc	x23, x17, xzr, ne
 1699888: 17ffffae     	b	0x1699740 <_ChromeMain+0x16944a4>
 169988c: 110009ed     	add	w13, w15, #0x2
 1699890: 52800030     	mov	w16, #0x1               ; =1
 1699894: 1acd220d     	lsl	w13, w16, w13
 1699898: 8b2dc1cd     	add	x13, x14, w13, sxtw
 169989c: 926ba9b0     	and	x16, x13, #0xffffffffffe00000
 16998a0: 924051ad     	and	x13, x13, #0x1fffff
 16998a4: 910009ee     	add	x14, x15, #0x2
 16998a8: 9ace25ad     	lsr	x13, x13, x14
 16998ac: 8b0c020f     	add	x15, x16, x12
 16998b0: 8b0d15ed     	add	x13, x15, x13, lsl #5
 16998b4: 394079af     	ldrb	w15, [x13, #0x1e]
 16998b8: 924015ef     	and	x15, x15, #0x3f
 16998bc: 8b0f15af     	add	x15, x13, x15, lsl #5
 16998c0: f940006d     	ldr	x13, [x3]
 16998c4: d10005b0     	sub	x16, x13, #0x1
 16998c8: 8a0f0210     	and	x16, x16, x15
 16998cc: d345fe10     	lsr	x16, x16, #5
 16998d0: cb0c01ef     	sub	x15, x15, x12
 16998d4: 926ba9ef     	and	x15, x15, #0xffffffffffe00000
 16998d8: 9ace2210     	lsl	x16, x16, x14
 16998dc: ab0f020f     	adds	x15, x16, x15
 16998e0: 540001a0     	b.eq	0x1699914 <_ChromeMain+0x1694678>
 16998e4: 17ffffc0     	b	0x16997e4 <_ChromeMain+0x1694548>
 16998e8: 95a5aa9e     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 16998ec: 529fffec     	mov	w12, #0xffff            ; =65535
 16998f0: cb0b55ae     	sub	x14, x13, x11, lsl #21
 16998f4: 5280004f     	mov	w15, #0x2               ; =2
 16998f8: 6b0c017f     	cmp	w11, w12
 16998fc: 9a8f03eb     	csel	x11, xzr, x15, eq
 1699900: 9a8e03ee     	csel	x14, xzr, x14, eq
 1699904: 17ffff97     	b	0x1699760 <_ChromeMain+0x16944c4>
 1699908: d4200000     	brk	#0
 169990c: d4400000     	hlt	#0
 1699910: d4200020     	brk	#0x1
 1699914: d4200000     	brk	#0
 1699918: d4400000     	hlt	#0
 169991c: d4200020     	brk	#0x1
 1699920: d4200000     	brk	#0
 1699924: d4400000     	hlt	#0
 1699928: d4200020     	brk	#0x1
 169992c: eb18011f     	cmp	x8, x24
 1699930: 54000d28     	b.hi	0x1699ad4 <_ChromeMain+0x1694838>
 1699934: f9000668     	str	x8, [x19, #0x8]
 1699938: 14000006     	b	0x1699950 <_ChromeMain+0x16946b4>
 169993c: 37ffff9b     	tbnz	w27, #0x1f, 0x169992c <_ChromeMain+0x1694690>
 1699940: eb17011f     	cmp	x8, x23
 1699944: 54000c88     	b.hi	0x1699ad4 <_ChromeMain+0x1694838>
 1699948: 39005e68     	strb	w8, [x19, #0x17]
 169994c: aa1303fa     	mov	x26, x19
 1699950: 38286b5f     	strb	wzr, [x26, x8]
 1699954: 39405e77     	ldrb	w23, [x19, #0x17]
 1699958: f9400678     	ldr	x24, [x19, #0x8]
 169995c: aa1703fb     	mov	x27, x23
 1699960: 17fffef8     	b	0x1699540 <_ChromeMain+0x16942a4>
 1699964: 94d59a8a     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 1699968: eb0802bf     	cmp	x21, x8
 169996c: 9a8832b5     	csel	x21, x21, x8, lo
 1699970: 92800228     	mov	x8, #-0x12              ; =-18
 1699974: f2efffe8     	movk	x8, #0x7fff, lsl #48
 1699978: eb0802bf     	cmp	x21, x8
 169997c: 54ffff48     	b.hi	0x1699964 <_ChromeMain+0x16946c8>
 1699980: f1005abf     	cmp	x21, #0x16
 1699984: 54000149     	b.ls	0x16999ac <_ChromeMain+0x1694710>
 1699988: 927ceab8     	and	x24, x21, #0x7ffffffffffffff0
 169998c: 91004300     	add	x0, x24, #0x10
 1699990: 97a5d676     	bl	0xf368 <_ChromeMain+0xa0cc>
 1699994: aa0003f7     	mov	x23, x0
 1699998: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 169999c: cb080308     	sub	x8, x24, x8
 16999a0: a90357e0     	stp	x0, x21, [sp, #0x30]
 16999a4: f90023e8     	str	x8, [sp, #0x40]
 16999a8: 14000003     	b	0x16999b4 <_ChromeMain+0x1694718>
 16999ac: 39011ff5     	strb	w21, [sp, #0x47]
 16999b0: 9100c3f7     	add	x23, sp, #0x30
 16999b4: 8b1502e8     	add	x8, x23, x21
 16999b8: eb17011f     	cmp	x8, x23
 16999bc: 540002a3     	b.lo	0x1699a10 <_ChromeMain+0x1694774>
 16999c0: eb14011f     	cmp	x8, x20
 16999c4: fa5482e2     	ccmp	x23, x20, #0x2, hi
 16999c8: 54000249     	b.ls	0x1699a10 <_ChromeMain+0x1694774>
 16999cc: aa1703e0     	mov	x0, x23
 16999d0: aa1403e1     	mov	x1, x20
 16999d4: aa1503e2     	mov	x2, x21
 16999d8: 95a5d63d     	bl	0x800f2cc <_ChromeMain+0x800a030>
 16999dc: 38356aff     	strb	wzr, [x23, x21]
 16999e0: f94023e8     	ldr	x8, [sp, #0x40]
 16999e4: f90013e8     	str	x8, [sp, #0x20]
 16999e8: 3dc00fe0     	ldr	q0, [sp, #0x30]
 16999ec: 3d8007e0     	str	q0, [sp, #0x10]
 16999f0: 39809fe8     	ldrsb	x8, [sp, #0x27]
 16999f4: 910043e9     	add	x9, sp, #0x10
 16999f8: a9412fea     	ldp	x10, x11, [sp, #0x10]
 16999fc: f100011f     	cmp	x8, #0x0
 1699a00: 9a894154     	csel	x20, x10, x9, mi
 1699a04: 7100011f     	cmp	w8, #0x0
 1699a08: 9a884175     	csel	x21, x11, x8, mi
 1699a0c: 17fffe9b     	b	0x1699478 <_ChromeMain+0x16941dc>
 1699a10: d4200020     	brk	#0x1
 1699a14: f9400be0     	ldr	x0, [sp, #0x10]
 1699a18: f94013e8     	ldr	x8, [sp, #0x20]
 1699a1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 1699a20: 97a5bd26     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1699a24: 17ffff10     	b	0x1699664 <_ChromeMain+0x16943c8>
 1699a28: 7100011f     	cmp	w8, #0x0
 1699a2c: 9a934128     	csel	x8, x9, x19, mi
 1699a30: 39400117     	ldrb	w23, [x8]
 1699a34: f005d180     	adrp	x0, 0xd0cc000 <dyld_stub_binder+0xd0cc000>
 1699a38: 911fe000     	add	x0, x0, #0x7f8
 1699a3c: 52800021     	mov	w1, #0x1                ; =1
 1699a40: 52800022     	mov	w2, #0x1                ; =1
 1699a44: 97a80343     	bl	0x9a750 <_ChromeMain+0x954b4>
 1699a48: 35000480     	cbnz	w0, 0x1699ad8 <_ChromeMain+0x169483c>
 1699a4c: 7100beff     	cmp	w23, #0x2f
 1699a50: aa1503f4     	mov	x20, x21
 1699a54: f94007f5     	ldr	x21, [sp, #0x8]
 1699a58: 54ffdc00     	b.eq	0x16995d8 <_ChromeMain+0x169433c>
 1699a5c: aa1303e0     	mov	x0, x19
 1699a60: aa1603e1     	mov	x1, x22
 1699a64: 52800002     	mov	w2, #0x0                ; =0
 1699a68: 97e8cd75     	bl	0x10cd03c <_ChromeMain+0x10c7da0>
 1699a6c: 17fffedb     	b	0x16995d8 <_ChromeMain+0x169433c>
 1699a70: aa1303e0     	mov	x0, x19
 1699a74: aa1403e1     	mov	x1, x20
 1699a78: aa1503e2     	mov	x2, x21
 1699a7c: 97c15375     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 1699a80: 17fffef7     	b	0x169965c <_ChromeMain+0x16943c0>
 1699a84: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 1699a88: f0061581     	adrp	x1, 0xd94c000 <dyld_stub_binder+0xd94c000>
 1699a8c: 9137cc21     	add	x1, x1, #0xdf3
 1699a90: f005d182     	adrp	x2, 0xd0cc000 <dyld_stub_binder+0xd0cc000>
 1699a94: 911fe042     	add	x2, x2, #0x7f8
 1699a98: 9100c3e0     	add	x0, sp, #0x30
 1699a9c: 95c62035     	bl	0x8821b70 <_ChromeMain+0x881c8d4>
 1699aa0: 9100c3e0     	add	x0, sp, #0x30
 1699aa4: 97a5e4c7     	bl	0x12dc0 <_ChromeMain+0xdb24>
 1699aa8: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 1699aac: d00626a1     	adrp	x1, 0xdb6f000 <dyld_stub_binder+0xdb6f000>
 1699ab0: 9119ec21     	add	x1, x1, #0x67b
 1699ab4: 910143e0     	add	x0, sp, #0x50
 1699ab8: aa1703e2     	mov	x2, x23
 1699abc: 95c6202d     	bl	0x8821b70 <_ChromeMain+0x881c8d4>
