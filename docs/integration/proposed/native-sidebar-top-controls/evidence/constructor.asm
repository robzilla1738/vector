
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3555540: d10183ff     	sub	sp, sp, #0x60
 3555544: a90167fa     	stp	x26, x25, [sp, #0x10]
 3555548: a9025ff8     	stp	x24, x23, [sp, #0x20]
 355554c: a90357f6     	stp	x22, x21, [sp, #0x30]
 3555550: a9044ff4     	stp	x20, x19, [sp, #0x40]
 3555554: a9057bfd     	stp	x29, x30, [sp, #0x50]
 3555558: 910143fd     	add	x29, sp, #0x50
 355555c: aa0303f5     	mov	x21, x3
 3555560: aa0203f7     	mov	x23, x2
 3555564: aa0103f4     	mov	x20, x1
 3555568: aa0003f3     	mov	x19, x0
 355556c: 977866f5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 3555570: b0057d88     	adrp	x8, 0xe506000 <dyld_stub_binder+0xe506000>
 3555574: 911ae108     	add	x8, x8, #0x6b8
 3555578: f9018808     	str	x8, [x0, #0x310]
 355557c: 90056fc8     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 3555580: 91094108     	add	x8, x8, #0x250
 3555584: f9018c08     	str	x8, [x0, #0x318]
 3555588: 390c801f     	strb	wzr, [x0, #0x320]
 355558c: 52800100     	mov	w0, #0x8                ; =8
 3555590: 972ae776     	bl	0xf368 <_ChromeMain+0xa0cc>
 3555594: b900001f     	str	wzr, [x0]
 3555598: 3900101f     	strb	wzr, [x0, #0x4]
 355559c: b40000c0     	cbz	x0, 0x35555b4 <_ChromeMain+0x3550318>
 35555a0: 52800028     	mov	w8, #0x1                ; =1
 35555a4: b8280008     	ldadd	w8, w8, [x0]
 35555a8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 35555ac: 6b09011f     	cmp	w8, w9
 35555b0: 54002ac0     	b.eq	0x3555b08 <_ChromeMain+0x355086c>
 35555b4: 910c6268     	add	x8, x19, #0x318
 35555b8: f9019660     	str	x0, [x19, #0x328]
 35555bc: f9019a68     	str	x8, [x19, #0x330]
 35555c0: f00589a8     	adrp	x8, 0xe68c000 <dyld_stub_binder+0xe68c000>
 35555c4: 9136c108     	add	x8, x8, #0xdb0
 35555c8: 91104109     	add	x9, x8, #0x410
 35555cc: a9002668     	stp	x8, x9, [x19]
 35555d0: 9110e109     	add	x9, x8, #0x438
 35555d4: f9000a69     	str	x9, [x19, #0x10]
 35555d8: 9111c109     	add	x9, x8, #0x470
 35555dc: 9112810a     	add	x10, x8, #0x4a0
 35555e0: a906aa69     	stp	x9, x10, [x19, #0x68]
 35555e4: 9113c109     	add	x9, x8, #0x4f0
 35555e8: f9005a69     	str	x9, [x19, #0xb0]
 35555ec: 91154109     	add	x9, x8, #0x550
 35555f0: aa1303f6     	mov	x22, x19
 35555f4: f80d8ec9     	str	x9, [x22, #0xd8]!
 35555f8: 91160109     	add	x9, x8, #0x580
 35555fc: f9007e69     	str	x9, [x19, #0xf8]
 3555600: 9116a109     	add	x9, x8, #0x5a8
 3555604: f9018a69     	str	x9, [x19, #0x310]
 3555608: 91176109     	add	x9, x8, #0x5d8
 355560c: f9018e69     	str	x9, [x19, #0x318]
 3555610: 91180108     	add	x8, x8, #0x600
 3555614: f9019e68     	str	x8, [x19, #0x338]
 3555618: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 355561c: b005b2f8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3555620: f9404709     	ldr	x9, [x24, #0x88]
 3555624: eb09011f     	cmp	x8, x9
 3555628: 54000061     	b.ne	0x3555634 <_ChromeMain+0x3550398>
 355562c: aa1703e0     	mov	x0, x23
 3555630: 972afb33     	bl	0x142fc <_ChromeMain+0xf060>
 3555634: f901a277     	str	x23, [x19, #0x340]
 3555638: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 355563c: f9404709     	ldr	x9, [x24, #0x88]
 3555640: eb09011f     	cmp	x8, x9
 3555644: 54000061     	b.ne	0x3555650 <_ChromeMain+0x35503b4>
 3555648: aa1503e0     	mov	x0, x21
 355564c: 972afb2c     	bl	0x142fc <_ChromeMain+0xf060>
 3555650: 910c4279     	add	x25, x19, #0x310
 3555654: f901a675     	str	x21, [x19, #0x348]
 3555658: 925e7688     	and	x8, x20, #0xfffffffc00000000
 355565c: f9404709     	ldr	x9, [x24, #0x88]
 3555660: eb09011f     	cmp	x8, x9
 3555664: 54000061     	b.ne	0x3555670 <_ChromeMain+0x35503d4>
 3555668: aa1403e0     	mov	x0, x20
 355566c: 972afb24     	bl	0x142fc <_ChromeMain+0xf060>
 3555670: f901aa74     	str	x20, [x19, #0x350]
 3555674: 910d6277     	add	x23, x19, #0x358
 3555678: 6f00e400     	movi.2d	v0, #0000000000000000
 355567c: ad0002e0     	stp	q0, q0, [x23]
 3555680: 3d800ae0     	str	q0, [x23, #0x20]
 3555684: 52800400     	mov	w0, #0x20               ; =32
 3555688: 972ae738     	bl	0xf368 <_ChromeMain+0xa0cc>
 355568c: b0056fa8     	adrp	x8, 0xe34a000 <dyld_stub_binder+0xe34a000>
 3555690: 91166108     	add	x8, x8, #0x598
 3555694: aa0003e9     	mov	x9, x0
 3555698: f8010d3f     	str	xzr, [x9, #0x10]!
 355569c: f9000c1f     	str	xzr, [x0, #0x18]
 35556a0: a9002408     	stp	x8, x9, [x0]
 35556a4: f901c660     	str	x0, [x19, #0x388]
 35556a8: 6f00e400     	movi.2d	v0, #0000000000000000
 35556ac: ad1c8260     	stp	q0, q0, [x19, #0x390]
 35556b0: 39424288     	ldrb	w8, [x20, #0x90]
 35556b4: 390ec268     	strb	w8, [x19, #0x3b0]
 35556b8: 910ec668     	add	x8, x19, #0x3b1
 35556bc: 7900011f     	strh	wzr, [x8]
 35556c0: b903b67f     	str	wzr, [x19, #0x3b4]
 35556c4: 390ee27f     	strb	wzr, [x19, #0x3b8]
 35556c8: 9005a581     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 35556cc: 911a2021     	add	x1, x1, #0x688
 35556d0: d005abe2     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 35556d4: 9117a042     	add	x2, x2, #0x5e8
 35556d8: aa1603e0     	mov	x0, x22
 35556dc: 979afd49     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 35556e0: 52801f00     	mov	w0, #0xf8               ; =248
 35556e4: 972ae721     	bl	0xf368 <_ChromeMain+0xa0cc>
 35556e8: aa0003f4     	mov	x20, x0
 35556ec: f100027f     	cmp	x19, #0x0
 35556f0: 9a9903f5     	csel	x21, xzr, x25, eq
 35556f4: 977cbffb     	bl	0x14856e0 <_ChromeMain+0x1480444>
 35556f8: b0056fe8     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 35556fc: 91300108     	add	x8, x8, #0xc00
 3555700: f9000008     	str	x8, [x0]
 3555704: 91036108     	add	x8, x8, #0xd8
 3555708: f9001408     	str	x8, [x0, #0x28]
 355570c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 3555710: f9404709     	ldr	x9, [x24, #0x88]
 3555714: eb09011f     	cmp	x8, x9
 3555718: 54000061     	b.ne	0x3555724 <_ChromeMain+0x3550488>
 355571c: aa1503e0     	mov	x0, x21
 3555720: 972afaf7     	bl	0x142fc <_ChromeMain+0xf060>
 3555724: f9007a95     	str	x21, [x20, #0xf0]
 3555728: aa1303e0     	mov	x0, x19
 355572c: aa1403e1     	mov	x1, x20
 3555730: 9798d042     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 3555734: aa1303e0     	mov	x0, x19
 3555738: 528025c1     	mov	w1, #0x12e              ; =302
 355573c: 97f9d43f     	bl	0x33ca838 <_ChromeMain+0x33c559c>
 3555740: aa0003f4     	mov	x20, x0
 3555744: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3555748: f9404709     	ldr	x9, [x24, #0x88]
 355574c: eb09011f     	cmp	x8, x9
 3555750: 54000061     	b.ne	0x355575c <_ChromeMain+0x35504c0>
 3555754: aa1403e0     	mov	x0, x20
 3555758: 972afae9     	bl	0x142fc <_ChromeMain+0xf060>
 355575c: f941b260     	ldr	x0, [x19, #0x360]
 3555760: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3555764: f9404709     	ldr	x9, [x24, #0x88]
 3555768: eb09011f     	cmp	x8, x9
 355576c: 54000041     	b.ne	0x3555774 <_ChromeMain+0x35504d8>
 3555770: 972b34b3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3555774: f901b274     	str	x20, [x19, #0x360]
 3555778: 910c6261     	add	x1, x19, #0x318
 355577c: aa1403e0     	mov	x0, x20
 3555780: 9798d64e     	bl	0x1b8b0b8 <_ChromeMain+0x1b85e1c>
 3555784: f941b268     	ldr	x8, [x19, #0x360]
 3555788: 9005a581     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 355578c: 911a2021     	add	x1, x1, #0x688
 3555790: d005abe2     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 3555794: 91174042     	add	x2, x2, #0x5d0
 3555798: 91036100     	add	x0, x8, #0xd8
 355579c: 979afd19     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 35557a0: f941b274     	ldr	x20, [x19, #0x360]
 35557a4: b21b03f5     	mov	x21, #0x2000000020      ; =137438953504
 35557a8: aa1403e0     	mov	x0, x20
 35557ac: b21b03e1     	mov	x1, #0x2000000020       ; =137438953504
 35557b0: 52800022     	mov	w2, #0x1                ; =1
 35557b4: 97c9f0ab     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 35557b8: 91177288     	add	x8, x20, #0x5dc
 35557bc: f9400109     	ldr	x9, [x8]
 35557c0: eb15013f     	cmp	x9, x21
 35557c4: 54000100     	b.eq	0x35557e4 <_ChromeMain+0x3550548>
 35557c8: f9000115     	str	x21, [x8]
 35557cc: aa1403e0     	mov	x0, x20
 35557d0: 52800061     	mov	w1, #0x3                ; =3
 35557d4: 974a3064     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 35557d8: 9103e280     	add	x0, x20, #0xf8
 35557dc: 91177281     	add	x1, x20, #0x5dc
 35557e0: 976749fc     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 35557e4: b004cd81     	adrp	x1, 0xcf06000 <dyld_stub_binder+0xcf06000>
 35557e8: 9119a021     	add	x1, x1, #0x668
 35557ec: aa1403e0     	mov	x0, x20
 35557f0: 95c49884     	bl	0xa67ba00 <_ChromeMain+0xa676764>
 35557f4: 3957be88     	ldrb	w8, [x20, #0x5ef]
 35557f8: 360018e8     	tbz	w8, #0x0, 0x3555b14 <_ChromeMain+0x3550878>
 35557fc: b945f688     	ldr	w8, [x20, #0x5f4]
 3555800: 7100051f     	cmp	w8, #0x1
 3555804: 540015c1     	b.ne	0x3555abc <_ChromeMain+0x3550820>
 3555808: b945f288     	ldr	w8, [x20, #0x5f0]
 355580c: 34000108     	cbz	w8, 0x355582c <_ChromeMain+0x3550590>
 3555810: b905f29f     	str	wzr, [x20, #0x5f0]
 3555814: aa1403e0     	mov	x0, x20
 3555818: 52800061     	mov	w1, #0x3                ; =3
 355581c: 974a3052     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3555820: 9103e280     	add	x0, x20, #0xf8
 3555824: 9117c281     	add	x1, x20, #0x5f0
 3555828: 976749ea     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 355582c: 395a3288     	ldrb	w8, [x20, #0x68c]
 3555830: 37000128     	tbnz	w8, #0x0, 0x3555854 <_ChromeMain+0x35505b8>
 3555834: 52800028     	mov	w8, #0x1                ; =1
 3555838: 391a3288     	strb	w8, [x20, #0x68c]
 355583c: aa1403e0     	mov	x0, x20
 3555840: 52800021     	mov	w1, #0x1                ; =1
 3555844: 974a3048     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3555848: 9103e280     	add	x0, x20, #0xf8
 355584c: 911a3281     	add	x1, x20, #0x68c
 3555850: 976749e0     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3555854: b9468a88     	ldr	w8, [x20, #0x688]
 3555858: 7100411f     	cmp	w8, #0x10
 355585c: 54000120     	b.eq	0x3555880 <_ChromeMain+0x35505e4>
 3555860: 52800208     	mov	w8, #0x10               ; =16
 3555864: b9068a88     	str	w8, [x20, #0x688]
 3555868: 395a0288     	ldrb	w8, [x20, #0x680]
 355586c: 350000a8     	cbnz	w8, 0x3555880 <_ChromeMain+0x35505e4>
 3555870: f9433288     	ldr	x8, [x20, #0x660]
 3555874: b4000068     	cbz	x8, 0x3555880 <_ChromeMain+0x35505e4>
 3555878: aa1403e0     	mov	x0, x20
 355587c: 97e2c05a     	bl	0x2e059e4 <_ChromeMain+0x2e00748>
 3555880: f9400288     	ldr	x8, [x20]
 3555884: f9423908     	ldr	x8, [x8, #0x470]
 3555888: aa1403e0     	mov	x0, x20
 355588c: d63f0100     	blr	x8
 3555890: aa0003e1     	mov	x1, x0
 3555894: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 3555898: f9400288     	ldr	x8, [x20]
 355589c: f9408908     	ldr	x8, [x8, #0x110]
 35558a0: aa1403e0     	mov	x0, x20
 35558a4: d63f0100     	blr	x8
 35558a8: b9469288     	ldr	w8, [x20, #0x690]
 35558ac: 7103891f     	cmp	w8, #0xe2
 35558b0: 54000120     	b.eq	0x35558d4 <_ChromeMain+0x3550638>
 35558b4: 52801c48     	mov	w8, #0xe2               ; =226
 35558b8: b9069288     	str	w8, [x20, #0x690]
 35558bc: 395a0288     	ldrb	w8, [x20, #0x680]
 35558c0: 350000a8     	cbnz	w8, 0x35558d4 <_ChromeMain+0x3550638>
 35558c4: f9433288     	ldr	x8, [x20, #0x660]
 35558c8: b4000068     	cbz	x8, 0x35558d4 <_ChromeMain+0x3550638>
 35558cc: aa1403e0     	mov	x0, x20
 35558d0: 97e2c045     	bl	0x2e059e4 <_ChromeMain+0x2e00748>
 35558d4: a9007fff     	stp	xzr, xzr, [sp]
 35558d8: 910003e1     	mov	x1, sp
 35558dc: aa1403e0     	mov	x0, x20
 35558e0: 52800142     	mov	w2, #0xa                ; =10
 35558e4: 97ef589d     	bl	0x312bb58 <_ChromeMain+0x31268bc>
 35558e8: b005cdb5     	adrp	x21, 0xef0a000 <dyld_stub_binder+0xef0a000>
 35558ec: 911202b5     	add	x21, x21, #0x480
 35558f0: f8bfc2a0     	ldapr	x0, [x21]
 35558f4: b4000f60     	cbz	x0, 0x3555ae0 <_ChromeMain+0x3550844>
 35558f8: 5280dd01     	mov	w1, #0x6e8              ; =1768
 35558fc: d2800002     	mov	x2, #0x0                ; =0
 3555900: 972d572c     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3555904: aa0003f4     	mov	x20, x0
 3555908: 52800600     	mov	w0, #0x30               ; =48
 355590c: 972ae697     	bl	0xf368 <_ChromeMain+0xa0cc>
 3555910: aa0003e1     	mov	x1, x0
 3555914: 52800028     	mov	w8, #0x1                ; =1
 3555918: b9000008     	str	w8, [x0]
 355591c: f0ffbc48     	adrp	x8, 0x2ce0000 <_ChromeMain+0x2cdad64>
 3555920: 91210108     	add	x8, x8, #0x840
 3555924: f0001789     	adrp	x9, 0x3848000 <_ChromeMain+0x3842d64>
 3555928: 913f0129     	add	x9, x9, #0xfc0
 355592c: a900a408     	stp	x8, x9, [x0, #0x8]
 3555930: 90ff8048     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 3555934: 912c0108     	add	x8, x8, #0xb00
 3555938: 90021709     	adrp	x9, 0x7835000 <_ChromeMain+0x782fd64>
 355593c: 912af129     	add	x9, x9, #0xabc
 3555940: a901a408     	stp	x8, x9, [x0, #0x18]
 3555944: aa1403e0     	mov	x0, x20
 3555948: 9431da33     	bl	0x41cc214 <_ChromeMain+0x41c6f78>
 355594c: 3945a688     	ldrb	w8, [x20, #0x169]
 3555950: 35000d08     	cbnz	w8, 0x3555af0 <_ChromeMain+0x3550854>
 3555954: f940ce62     	ldr	x2, [x19, #0x198]
 3555958: aa1303e0     	mov	x0, x19
 355595c: aa1403e1     	mov	x1, x20
 3555960: 97488ea7     	bl	0x7793fc <_ChromeMain+0x774160>
 3555964: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3555968: f9404709     	ldr	x9, [x24, #0x88]
 355596c: eb09011f     	cmp	x8, x9
 3555970: 54000061     	b.ne	0x355597c <_ChromeMain+0x35506e0>
 3555974: aa1403e0     	mov	x0, x20
 3555978: 972afa61     	bl	0x142fc <_ChromeMain+0xf060>
 355597c: f941ba60     	ldr	x0, [x19, #0x370]
 3555980: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3555984: f9404709     	ldr	x9, [x24, #0x88]
 3555988: eb09011f     	cmp	x8, x9
 355598c: 54000041     	b.ne	0x3555994 <_ChromeMain+0x35506f8>
 3555990: 972b342b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3555994: f901ba74     	str	x20, [x19, #0x370]
 3555998: b005b2a0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 355599c: 91156000     	add	x0, x0, #0x558
 35559a0: 972f0e38     	bl	0x119280 <_ChromeMain+0x113fe4>
 35559a4: 340003a0     	cbz	w0, 0x3555a18 <_ChromeMain+0x355077c>
 35559a8: aa1303e0     	mov	x0, x19
 35559ac: 52800841     	mov	w1, #0x42               ; =66
 35559b0: 97f9d3a2     	bl	0x33ca838 <_ChromeMain+0x33c559c>
 35559b4: aa0003f4     	mov	x20, x0
 35559b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 35559bc: f9404709     	ldr	x9, [x24, #0x88]
 35559c0: eb09011f     	cmp	x8, x9
 35559c4: 54000061     	b.ne	0x35559d0 <_ChromeMain+0x3550734>
 35559c8: aa1403e0     	mov	x0, x20
 35559cc: 972afa4c     	bl	0x142fc <_ChromeMain+0xf060>
 35559d0: f941b660     	ldr	x0, [x19, #0x368]
 35559d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 35559d8: f9404709     	ldr	x9, [x24, #0x88]
 35559dc: eb09011f     	cmp	x8, x9
 35559e0: 54000041     	b.ne	0x35559e8 <_ChromeMain+0x355074c>
 35559e4: 972b3416     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 35559e8: f901b674     	str	x20, [x19, #0x368]
 35559ec: 9005a581     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 35559f0: 911a2021     	add	x1, x1, #0x688
 35559f4: d005abe2     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 35559f8: 91172042     	add	x2, x2, #0x5c8
 35559fc: 91036280     	add	x0, x20, #0xd8
 3555a00: 979afc80     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 3555a04: f941b660     	ldr	x0, [x19, #0x368]
 3555a08: f9400008     	ldr	x8, [x0]
 3555a0c: f9405108     	ldr	x8, [x8, #0xa0]
 3555a10: 52800001     	mov	w1, #0x0                ; =0
 3555a14: d63f0100     	blr	x8
 3555a18: f8bfc2a0     	ldapr	x0, [x21]
 3555a1c: b4000660     	cbz	x0, 0x3555ae8 <_ChromeMain+0x355084c>
 3555a20: 5280ad01     	mov	w1, #0x568              ; =1384
 3555a24: d2800002     	mov	x2, #0x0                ; =0
 3555a28: 972d56e2     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3555a2c: aa0003f4     	mov	x20, x0
 3555a30: f941a661     	ldr	x1, [x19, #0x348]
 3555a34: 52800022     	mov	w2, #0x1                ; =1
 3555a38: d2800003     	mov	x3, #0x0                ; =0
 3555a3c: 9433b071     	bl	0x4241c00 <_ChromeMain+0x423c964>
 3555a40: 3945a408     	ldrb	w8, [x0, #0x169]
 3555a44: 350005c8     	cbnz	w8, 0x3555afc <_ChromeMain+0x3550860>
 3555a48: f940ce62     	ldr	x2, [x19, #0x198]
 3555a4c: aa1303e0     	mov	x0, x19
 3555a50: aa1403e1     	mov	x1, x20
 3555a54: 97488e6a     	bl	0x7793fc <_ChromeMain+0x774160>
 3555a58: 925e7688     	and	x8, x20, #0xfffffffc00000000
 3555a5c: f9404709     	ldr	x9, [x24, #0x88]
 3555a60: eb09011f     	cmp	x8, x9
 3555a64: 54000061     	b.ne	0x3555a70 <_ChromeMain+0x35507d4>
 3555a68: aa1403e0     	mov	x0, x20
 3555a6c: 972afa24     	bl	0x142fc <_ChromeMain+0xf060>
 3555a70: f94002e0     	ldr	x0, [x23]
 3555a74: 925e7408     	and	x8, x0, #0xfffffffc00000000
 3555a78: f9404709     	ldr	x9, [x24, #0x88]
 3555a7c: eb09011f     	cmp	x8, x9
 3555a80: 54000041     	b.ne	0x3555a88 <_ChromeMain+0x35507ec>
 3555a84: 972b33ee     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 3555a88: f901ae74     	str	x20, [x19, #0x358]
 3555a8c: 394ec261     	ldrb	w1, [x19, #0x3b0]
 3555a90: b903b661     	str	w1, [x19, #0x3b4]
 3555a94: aa1403e0     	mov	x0, x20
 3555a98: 97d84861     	bl	0x2b67c1c <_ChromeMain+0x2b62980>
 3555a9c: aa1303e0     	mov	x0, x19
 3555aa0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 3555aa4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 3555aa8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 3555aac: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 3555ab0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 3555ab4: 910183ff     	add	sp, sp, #0x60
 3555ab8: d65f03c0     	ret
 3555abc: 52800028     	mov	w8, #0x1                ; =1
 3555ac0: b905f688     	str	w8, [x20, #0x5f4]
 3555ac4: aa1403e0     	mov	x0, x20
 3555ac8: 52800021     	mov	w1, #0x1                ; =1
 3555acc: 974a2fa6     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3555ad0: 9103e280     	add	x0, x20, #0xf8
 3555ad4: 9117d281     	add	x1, x20, #0x5f4
 3555ad8: 9767493e     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3555adc: 17ffff4b     	b	0x3555808 <_ChromeMain+0x355056c>
 3555ae0: 9435f706     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 3555ae4: 17ffff85     	b	0x35558f8 <_ChromeMain+0x355065c>
 3555ae8: 9435f704     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 3555aec: 17ffffcd     	b	0x3555a20 <_ChromeMain+0x3550784>
 3555af0: d4200000     	brk	#0
 3555af4: d4400000     	hlt	#0
 3555af8: d4200020     	brk	#0x1
 3555afc: d4200000     	brk	#0
 3555b00: d4400000     	hlt	#0
 3555b04: d4200020     	brk	#0x1
 3555b08: d4200000     	brk	#0
 3555b0c: d4400000     	hlt	#0
 3555b10: d4200020     	brk	#0x1
 3555b14: 52800028     	mov	w8, #0x1                ; =1
 3555b18: 3917be88     	strb	w8, [x20, #0x5ef]
 3555b1c: aa1403e0     	mov	x0, x20
 3555b20: 52800021     	mov	w1, #0x1                ; =1
 3555b24: 974a2f90     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 3555b28: 9103e280     	add	x0, x20, #0xf8
 3555b2c: 9117be81     	add	x1, x20, #0x5ef
 3555b30: 97674928     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3555b34: 17ffff32     	b	0x35557fc <_ChromeMain+0x3550560>
		...
