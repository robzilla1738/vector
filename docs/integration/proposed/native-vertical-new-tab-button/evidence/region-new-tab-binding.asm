
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e34f0: 52800021     	mov	w1, #0x1                ; =1
 37e34f4: 9790c8e6     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 37e34f8: f9434a68     	ldr	x8, [x19, #0x690]
 37e34fc: f9401109     	ldr	x9, [x8, #0x20]
 37e3500: b940092a     	ldr	w10, [x9, #0x8]
 37e3504: 7100095f     	cmp	w10, #0x2
 37e3508: 54010dc0     	b.eq	0x37e56c0 <_ChromeMain+0x37e0424>
 37e350c: 3942292a     	ldrb	w10, [x9, #0x8a]
 37e3510: 340000ca     	cbz	w10, 0x37e3528 <_ChromeMain+0x37de28c>
 37e3514: 3902293f     	strb	wzr, [x9, #0x8a]
 37e3518: f940b520     	ldr	x0, [x9, #0x168]
 37e351c: 52800001     	mov	w1, #0x0                ; =0
 37e3520: 9757a988     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 37e3524: f9434a68     	ldr	x8, [x19, #0x690]
 37e3528: 6f00e400     	movi.2d	v0, #0000000000000000
 37e352c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 37e3530: f9007bff     	str	xzr, [sp, #0xf0]
 37e3534: 3d801f00     	str	q0, [x24, #0x70]
 37e3538: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 37e353c: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 37e3540: 3d8027e0     	str	q0, [sp, #0x90]
 37e3544: 90053b29     	adrp	x9, 0xdf47000 <dyld_stub_binder+0xdf47000>
 37e3548: 3dc29d20     	ldr	q0, [x9, #0xa70]
 37e354c: 3c8783e0     	stur	q0, [sp, #0x78]
 37e3550: f9401114     	ldr	x20, [x8, #0x20]
 37e3554: f940b280     	ldr	x0, [x20, #0x160]
 37e3558: b4011520     	cbz	x0, 0x37e57fc <_ChromeMain+0x37e0560>
 37e355c: 9101c3e1     	add	x1, sp, #0x70
 37e3560: 97ab4f49     	bl	0x22b7284 <_ChromeMain+0x22b1fe8>
 37e3564: f8bfc320     	ldapr	x0, [x25]
 37e3568: b400fd60     	cbz	x0, 0x37e5514 <_ChromeMain+0x37e0278>
 37e356c: 5280cf01     	mov	w1, #0x678              ; =1656
 37e3570: d2800002     	mov	x2, #0x0                ; =0
 37e3574: 9723200f     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3578: aa0003f7     	mov	x23, x0
 37e357c: 94297e38     	bl	0x4242e5c <_ChromeMain+0x423dbc0>
 37e3580: 97505f5b     	bl	0xbfb2ec <_ChromeMain+0xbf6050>
 37e3584: 52800161     	mov	w1, #0xb                ; =11
 37e3588: f9401fe2     	ldr	x2, [sp, #0x38]
 37e358c: 97505f00     	bl	0xbfb18c <_ChromeMain+0xbf5ef0>
 37e3590: b40109e0     	cbz	x0, 0x37e56cc <_ChromeMain+0x37e0430>
 37e3594: f9442a79     	ldr	x25, [x19, #0x850]
 37e3598: f940b415     	ldr	x21, [x0, #0x168]
 37e359c: b400f495     	cbz	x21, 0x37e542c <_ChromeMain+0x37e0190>
 37e35a0: 52800034     	mov	w20, #0x1               ; =1
 37e35a4: b83402a8     	ldadd	w20, w8, [x21]
 37e35a8: 12b00016     	mov	w22, #0x7fffffff        ; =2147483647
 37e35ac: 6b16011f     	cmp	w8, w22
 37e35b0: 54010ee0     	b.eq	0x37e578c <_ChromeMain+0x37e04f0>
 37e35b4: f940b81a     	ldr	x26, [x0, #0x170]
 37e35b8: 52800b00     	mov	w0, #0x58               ; =88
 37e35bc: 9720af6b     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e35c0: b83402a8     	ldadd	w20, w8, [x21]
 37e35c4: 6b16011f     	cmp	w8, w22
 37e35c8: 54010e80     	b.eq	0x37e5798 <_ChromeMain+0x37e04fc>
 37e35cc: aa0003f8     	mov	x24, x0
 37e35d0: d0056928     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 37e35d4: 911a6108     	add	x8, x8, #0x698
 37e35d8: f9000008     	str	x8, [x0]
 37e35dc: aa0003f4     	mov	x20, x0
 37e35e0: b0055b88     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 37e35e4: 9127e108     	add	x8, x8, #0x9f8
 37e35e8: f8008e88     	str	x8, [x20, #0x8]!
 37e35ec: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 37e35f0: 3900801f     	strb	wzr, [x0, #0x20]
 37e35f4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e35f8: f9404789     	ldr	x9, [x28, #0x88]
 37e35fc: eb09011f     	cmp	x8, x9
 37e3600: 54000061     	b.ne	0x37e360c <_ChromeMain+0x37de370>
 37e3604: aa1403e0     	mov	x0, x20
 37e3608: 9720c33d     	bl	0x142fc <_ChromeMain+0xf060>
 37e360c: a902ff14     	stp	x20, xzr, [x24, #0x28]
 37e3610: aa1403e0     	mov	x0, x20
 37e3614: d2800001     	mov	x1, #0x0                ; =0
 37e3618: 979beda2     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 37e361c: 6f00e400     	movi.2d	v0, #0000000000000000
 37e3620: aa1803fb     	mov	x27, x24
 37e3624: 3c838f60     	str	q0, [x27, #0x38]!
 37e3628: aa1b03f6     	mov	x22, x27
 37e362c: 3c810ec0     	str	q0, [x22, #0x10]!
 37e3630: f85d8368     	ldur	x8, [x27, #-0x28]
 37e3634: eb17011f     	cmp	x8, x23
 37e3638: 540008c0     	b.eq	0x37e3750 <_ChromeMain+0x37de4b4>
 37e363c: f9001bfa     	str	x26, [sp, #0x30]
 37e3640: aa1403e0     	mov	x0, x20
 37e3644: aa1703e1     	mov	x1, x23
 37e3648: 979bed96     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 37e364c: aa1703e0     	mov	x0, x23
 37e3650: 9429815b     	bl	0x4243bbc <_ChromeMain+0x423e920>
 37e3654: aa0003f4     	mov	x20, x0
 37e3658: 925e7708     	and	x8, x24, #0xfffffffc00000000
 37e365c: f9404789     	ldr	x9, [x28, #0x88]
 37e3660: eb09011f     	cmp	x8, x9
 37e3664: 54000061     	b.ne	0x37e3670 <_ChromeMain+0x37de3d4>
 37e3668: aa1803e0     	mov	x0, x24
 37e366c: 9720c324     	bl	0x142fc <_ChromeMain+0xf060>
 37e3670: 52800700     	mov	w0, #0x38               ; =56
 37e3674: 9720af3d     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3678: aa0003e1     	mov	x1, x0
 37e367c: 52800028     	mov	w8, #0x1                ; =1
 37e3680: b9000008     	str	w8, [x0]
 37e3684: d0003abc     	adrp	x28, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e3688: 913a039c     	add	x28, x28, #0xe80
 37e368c: 105b25ba     	adr	x26, 0x3899b40 <_ChromeMain+0x38948a4>
 37e3690: d503201f     	nop
 37e3694: a900e81c     	stp	x28, x26, [x0, #0x8]
 37e3698: d00074e8     	adrp	x8, 0x4681000 <_ChromeMain+0x467bd64>
 37e369c: 9135c108     	add	x8, x8, #0xd70
 37e36a0: d0ff6bc9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e36a4: 912c0129     	add	x9, x9, #0xb00
 37e36a8: a901a009     	stp	x9, x8, [x0, #0x18]
 37e36ac: a902e01f     	stp	xzr, x24, [x0, #0x28]
 37e36b0: f9400288     	ldr	x8, [x20]
 37e36b4: f9400d08     	ldr	x8, [x8, #0x18]
 37e36b8: aa1403e0     	mov	x0, x20
 37e36bc: d63f0100     	blr	x8
 37e36c0: b40000b4     	cbz	x20, 0x37e36d4 <_ChromeMain+0x37de438>
 37e36c4: f9400288     	ldr	x8, [x20]
 37e36c8: f9400508     	ldr	x8, [x8, #0x8]
 37e36cc: aa1403e0     	mov	x0, x20
 37e36d0: d63f0100     	blr	x8
 37e36d4: 925e7708     	and	x8, x24, #0xfffffffc00000000
 37e36d8: f0059e69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e36dc: f9404529     	ldr	x9, [x9, #0x88]
 37e36e0: eb09011f     	cmp	x8, x9
 37e36e4: 54000061     	b.ne	0x37e36f0 <_ChromeMain+0x37de454>
 37e36e8: aa1803e0     	mov	x0, x24
 37e36ec: 9720c304     	bl	0x142fc <_ChromeMain+0xf060>
 37e36f0: 52800700     	mov	w0, #0x38               ; =56
 37e36f4: 9720af1d     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e36f8: aa0003e1     	mov	x1, x0
 37e36fc: 52800028     	mov	w8, #0x1                ; =1
 37e3700: b9000008     	str	w8, [x0]
 37e3704: a900e81c     	stp	x28, x26, [x0, #0x8]
 37e3708: d00074e8     	adrp	x8, 0x4681000 <_ChromeMain+0x467bd64>
 37e370c: 91380108     	add	x8, x8, #0xe00
 37e3710: d0ff6bc9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 37e3714: 912c0129     	add	x9, x9, #0xb00
 37e3718: a901a009     	stp	x9, x8, [x0, #0x18]
 37e371c: a902e01f     	stp	xzr, x24, [x0, #0x28]
 37e3720: 910403e8     	add	x8, sp, #0x100
 37e3724: 910b62e0     	add	x0, x23, #0x2d8
 37e3728: 9790a1f2     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 37e372c: 91006360     	add	x0, x27, #0x18
 37e3730: 910403e1     	add	x1, sp, #0x100
 37e3734: 97418ce7     	bl	0x846ad0 <_ChromeMain+0x841834>
 37e3738: f94083f4     	ldr	x20, [sp, #0x100]
 37e373c: f0059e7c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 37e3740: f9401bfa     	ldr	x26, [sp, #0x30]
 37e3744: b500b194     	cbnz	x20, 0x37e4d74 <_ChromeMain+0x37dfad8>
 37e3748: aa1803e0     	mov	x0, x24
 37e374c: 943a79c9     	bl	0x4681e70 <_ChromeMain+0x467cbd4>
 37e3750: b40000d5     	cbz	x21, 0x37e3768 <_ChromeMain+0x37de4cc>
 37e3754: 52800028     	mov	w8, #0x1                ; =1
 37e3758: b82802a8     	ldadd	w8, w8, [x21]
 37e375c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 37e3760: 6b09011f     	cmp	w8, w9
 37e3764: 54010200     	b.eq	0x37e57a4 <_ChromeMain+0x37e0508>
 37e3768: f9400368     	ldr	x8, [x27]
 37e376c: b4000088     	cbz	x8, 0x37e377c <_ChromeMain+0x37de4e0>
 37e3770: 19404108     	ldapurb	w8, [x8, #0x4]
 37e3774: 34009568     	cbz	w8, 0x37e4a20 <_ChromeMain+0x37df784>
 37e3778: d2800008     	mov	x8, #0x0                ; =0
 37e377c: b4009575     	cbz	x21, 0x37e4a28 <_ChromeMain+0x37df78c>
 37e3780: 194042a9     	ldapurb	w9, [x21, #0x4]
 37e3784: 72001d3f     	tst	w9, #0xff
 37e3788: 9a9f0349     	csel	x9, x26, xzr, eq
 37e378c: eb09011f     	cmp	x8, x9
 37e3790: 54009e00     	b.eq	0x37e4b50 <_ChromeMain+0x37df8b4>
 37e3794: 52800028     	mov	w8, #0x1                ; =1
 37e3798: b82802a8     	ldadd	w8, w8, [x21]
 37e379c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 37e37a0: 6b09011f     	cmp	w8, w9
 37e37a4: 540100e0     	b.eq	0x37e57c0 <_ChromeMain+0x37e0524>
 37e37a8: f9400360     	ldr	x0, [x27]
 37e37ac: f9000375     	str	x21, [x27]
 37e37b0: b500e060     	cbnz	x0, 0x37e53bc <_ChromeMain+0x37e0120>
 37e37b4: f900231a     	str	x26, [x24, #0x40]
 37e37b8: f90083ff     	str	xzr, [sp, #0x100]
 37e37bc: 910403e1     	add	x1, sp, #0x100
 37e37c0: aa1603e0     	mov	x0, x22
 37e37c4: 97418cc3     	bl	0x846ad0 <_ChromeMain+0x841834>
 37e37c8: f94083f4     	ldr	x20, [sp, #0x100]
 37e37cc: b500afd4     	cbnz	x20, 0x37e4dc4 <_ChromeMain+0x37dfb28>
 37e37d0: aa1803e0     	mov	x0, x24
 37e37d4: 943a79a7     	bl	0x4681e70 <_ChromeMain+0x467cbd4>
 37e37d8: b5009bd5     	cbnz	x21, 0x37e4b50 <_ChromeMain+0x37df8b4>
 37e37dc: aa1903fa     	mov	x26, x25
 37e37e0: f8410f48     	ldr	x8, [x26, #0x10]!
 37e37e4: b5009548     	cbnz	x8, 0x37e4a8c <_ChromeMain+0x37df7f0>
 37e37e8: aa1a03f6     	mov	x22, x26
 37e37ec: f94007fb     	ldr	x27, [sp, #0x8]
 37e37f0: 52800600     	mov	w0, #0x30               ; =48
 37e37f4: 9720aedd     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e37f8: b4ff20e0     	cbz	x0, 0x37e1c14 <_ChromeMain+0x37dc978>
 37e37fc: aa0003f4     	mov	x20, x0
 37e3800: b100801f     	cmn	x0, #0x20
 37e3804: 54ff2080     	b.eq	0x37e1c14 <_ChromeMain+0x37dc978>
 37e3808: a9027e97     	stp	x23, xzr, [x20, #0x20]
 37e380c: a9007e9f     	stp	xzr, xzr, [x20]
 37e3810: f9000a96     	str	x22, [x20, #0x10]
 37e3814: f9000354     	str	x20, [x26]
 37e3818: f9400728     	ldr	x8, [x25, #0x8]
 37e381c: f9400108     	ldr	x8, [x8]
 37e3820: aa1403e1     	mov	x1, x20
 37e3824: b4000068     	cbz	x8, 0x37e3830 <_ChromeMain+0x37de594>
 37e3828: f9000728     	str	x8, [x25, #0x8]
 37e382c: f9400341     	ldr	x1, [x26]
 37e3830: f9400b20     	ldr	x0, [x25, #0x10]
 37e3834: 9721e08b     	bl	0x5ba60 <_ChromeMain+0x567c4>
 37e3838: f9400f28     	ldr	x8, [x25, #0x18]
 37e383c: 91000508     	add	x8, x8, #0x1
 37e3840: f9000f28     	str	x8, [x25, #0x18]
 37e3844: f9401680     	ldr	x0, [x20, #0x28]
 37e3848: f9001698     	str	x24, [x20, #0x28]
 37e384c: d0ff6bda     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 37e3850: 912c035a     	add	x26, x26, #0xb00
 37e3854: b4000080     	cbz	x0, 0x37e3864 <_ChromeMain+0x37de5c8>
 37e3858: f9400008     	ldr	x8, [x0]
 37e385c: f9400508     	ldr	x8, [x8, #0x8]
 37e3860: d63f0100     	blr	x8
 37e3864: b5009d15     	cbnz	x21, 0x37e4c04 <_ChromeMain+0x37df968>
 37e3868: 3945a6e8     	ldrb	w8, [x23, #0x169]
 37e386c: 3500f368     	cbnz	w8, 0x37e56d8 <_ChromeMain+0x37e043c>
 37e3870: f9434260     	ldr	x0, [x19, #0x680]
 37e3874: f940cc02     	ldr	x2, [x0, #0x198]
 37e3878: aa1703e1     	mov	x1, x23
 37e387c: 973e56e0     	bl	0x7793fc <_ChromeMain+0x774160>
 37e3880: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 37e3884: f9404789     	ldr	x9, [x28, #0x88]
 37e3888: eb09011f     	cmp	x8, x9
 37e388c: 54000061     	b.ne	0x37e3898 <_ChromeMain+0x37de5fc>
 37e3890: aa1703e0     	mov	x0, x23
 37e3894: 9720c29a     	bl	0x142fc <_ChromeMain+0xf060>
 37e3898: f9437660     	ldr	x0, [x19, #0x6e8]
 37e389c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e38a0: f9404789     	ldr	x9, [x28, #0x88]
 37e38a4: eb09011f     	cmp	x8, x9
 37e38a8: 54000041     	b.ne	0x37e38b0 <_ChromeMain+0x37de614>
 37e38ac: 9720fc64     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e38b0: f9037677     	str	x23, [x19, #0x6e8]
 37e38b4: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e38b8: 911a2021     	add	x1, x1, #0x688
 37e38bc: 90059782     	adrp	x2, 0xead3000 <dyld_stub_binder+0xead3000>
 37e38c0: 910b6042     	add	x2, x2, #0x2d8
 37e38c4: 910362e0     	add	x0, x23, #0xd8
 37e38c8: 9790c4ce     	bl	0x1c14c00 <_ChromeMain+0x1c0f964>
 37e38cc: f9437675     	ldr	x21, [x19, #0x6e8]
 37e38d0: 52800800     	mov	w0, #0x40               ; =64
 37e38d4: 9720aea5     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e38d8: 52800034     	mov	w20, #0x1               ; =1
 37e38dc: b9000014     	str	w20, [x0]
 37e38e0: 90fec228     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 37e38e4: 91260109     	add	x9, x8, #0x980
 37e38e8: f0fe5868     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e38ec: 91220108     	add	x8, x8, #0x880
 37e38f0: a900a009     	stp	x9, x8, [x0, #0x8]
 37e38f4: f0001a08     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e38f8: 91310108     	add	x8, x8, #0xc40
 37e38fc: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e3900: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e3904: 3c828000     	stur	q0, [x0, #0x28]
 37e3908: 3900e01f     	strb	wzr, [x0, #0x38]
 37e390c: f90083e0     	str	x0, [sp, #0x100]
 37e3910: 0f000420     	movi.2s	v0, #0x1
 37e3914: fd0087e0     	str	d0, [sp, #0x108]
 37e3918: 52800068     	mov	w8, #0x3                ; =3
 37e391c: b90113e8     	str	w8, [sp, #0x110]
 37e3920: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 37e3924: f9008fff     	str	xzr, [sp, #0x118]
 37e3928: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e392c: 91152021     	add	x1, x1, #0x548
 37e3930: 910362a0     	add	x0, x21, #0xd8
 37e3934: 910403e2     	add	x2, sp, #0x100
 37e3938: 9790c295     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e393c: 910403e0     	add	x0, sp, #0x100
 37e3940: 977d9cf9     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e3944: f9437675     	ldr	x21, [x19, #0x6e8]
 37e3948: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e394c: f9404789     	ldr	x9, [x28, #0x88]
 37e3950: eb09011f     	cmp	x8, x9
 37e3954: 54000061     	b.ne	0x37e3960 <_ChromeMain+0x37de6c4>
 37e3958: aa1303e0     	mov	x0, x19
 37e395c: 9720c268     	bl	0x142fc <_ChromeMain+0xf060>
 37e3960: 52800700     	mov	w0, #0x38               ; =56
 37e3964: 9720ae81     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3968: aa0003e1     	mov	x1, x0
 37e396c: b9000014     	str	w20, [x0]
 37e3970: d0003aa8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e3974: 913a0109     	add	x9, x8, #0xe80
 37e3978: 105b0e48     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e397c: d503201f     	nop
 37e3980: a900a009     	stp	x9, x8, [x0, #0x8]
 37e3984: b0007278     	adrp	x24, 0x4630000 <_ChromeMain+0x462ad64>
 37e3988: 913b7318     	add	x24, x24, #0xedc
 37e398c: a901e01a     	stp	x26, x24, [x0, #0x18]
 37e3990: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e3994: 910403e8     	add	x8, sp, #0x100
 37e3998: 911902a0     	add	x0, x21, #0x640
 37e399c: 9790a155     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 37e39a0: 9121a260     	add	x0, x19, #0x868
 37e39a4: 910403e1     	add	x1, sp, #0x100
 37e39a8: 97418c4a     	bl	0x846ad0 <_ChromeMain+0x841834>
 37e39ac: f94083f4     	ldr	x20, [sp, #0x100]
 37e39b0: b5009a34     	cbnz	x20, 0x37e4cf4 <_ChromeMain+0x37dfa58>
 37e39b4: f9434274     	ldr	x20, [x19, #0x680]
 37e39b8: 925e7676     	and	x22, x19, #0xfffffffc00000000
 37e39bc: f9404788     	ldr	x8, [x28, #0x88]
 37e39c0: eb0802df     	cmp	x22, x8
 37e39c4: 54000061     	b.ne	0x37e39d0 <_ChromeMain+0x37de734>
 37e39c8: aa1303e0     	mov	x0, x19
 37e39cc: 9720c24c     	bl	0x142fc <_ChromeMain+0xf060>
 37e39d0: 52800600     	mov	w0, #0x30               ; =48
 37e39d4: 9720ae65     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e39d8: aa0003f5     	mov	x21, x0
 37e39dc: 52800039     	mov	w25, #0x1               ; =1
 37e39e0: b9000019     	str	w25, [x0]
 37e39e4: b0007448     	adrp	x8, 0x466c000 <_ChromeMain+0x4666d64>
 37e39e8: 910e3108     	add	x8, x8, #0x38c
 37e39ec: 90000c09     	adrp	x9, 0x3963000 <_ChromeMain+0x395dd64>
 37e39f0: 91120129     	add	x9, x9, #0x480
 37e39f4: a900a408     	stp	x8, x9, [x0, #0x8]
 37e39f8: f9000c1a     	str	x26, [x0, #0x18]
 37e39fc: f9001413     	str	x19, [x0, #0x28]
 37e3a00: f9404788     	ldr	x8, [x28, #0x88]
 37e3a04: eb0802df     	cmp	x22, x8
 37e3a08: 54000061     	b.ne	0x37e3a14 <_ChromeMain+0x37de778>
 37e3a0c: aa1303e0     	mov	x0, x19
 37e3a10: 9720c23b     	bl	0x142fc <_ChromeMain+0xf060>
 37e3a14: 52800700     	mov	w0, #0x38               ; =56
 37e3a18: 9720ae54     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3a1c: aa0003f7     	mov	x23, x0
 37e3a20: b9000019     	str	w25, [x0]
 37e3a24: d0003aa8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 37e3a28: 913a0109     	add	x9, x8, #0xe80
 37e3a2c: 105b08a8     	adr	x8, 0x3899b40 <_ChromeMain+0x38948a4>
 37e3a30: d503201f     	nop
 37e3a34: a900a009     	stp	x9, x8, [x0, #0x8]
 37e3a38: b0007248     	adrp	x8, 0x462c000 <_ChromeMain+0x4626d64>
 37e3a3c: 91062108     	add	x8, x8, #0x188
 37e3a40: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e3a44: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 37e3a48: f005b939     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e3a4c: 91120339     	add	x25, x25, #0x480
 37e3a50: f8bfc320     	ldapr	x0, [x25]
 37e3a54: b400d640     	cbz	x0, 0x37e551c <_ChromeMain+0x37e0280>
 37e3a58: 52809501     	mov	w1, #0x4a8              ; =1192
 37e3a5c: d2800002     	mov	x2, #0x0                ; =0
 37e3a60: 97231ed4     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3a64: aa0003f6     	mov	x22, x0
 37e3a68: aa1b03e1     	mov	x1, x27
 37e3a6c: aa1503e2     	mov	x2, x21
 37e3a70: aa1703e3     	mov	x3, x23
 37e3a74: 943908a3     	bl	0x4625d00 <_ChromeMain+0x4620a64>
 37e3a78: 3945a408     	ldrb	w8, [x0, #0x169]
 37e3a7c: 3500e348     	cbnz	w8, 0x37e56e4 <_ChromeMain+0x37e0448>
 37e3a80: f940ce82     	ldr	x2, [x20, #0x198]
 37e3a84: aa1403e0     	mov	x0, x20
 37e3a88: aa1603e1     	mov	x1, x22
 37e3a8c: 973e565c     	bl	0x7793fc <_ChromeMain+0x774160>
 37e3a90: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 37e3a94: f9404789     	ldr	x9, [x28, #0x88]
 37e3a98: eb09011f     	cmp	x8, x9
 37e3a9c: b005b937     	adrp	x23, 0xef08000 <dyld_stub_binder+0xef08000>
 37e3aa0: 54000061     	b.ne	0x37e3aac <_ChromeMain+0x37de810>
 37e3aa4: aa1603e0     	mov	x0, x22
 37e3aa8: 9720c215     	bl	0x142fc <_ChromeMain+0xf060>
 37e3aac: f942ea60     	ldr	x0, [x19, #0x5d0]
 37e3ab0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e3ab4: f9404789     	ldr	x9, [x28, #0x88]
 37e3ab8: eb09011f     	cmp	x8, x9
 37e3abc: 54000041     	b.ne	0x37e3ac4 <_ChromeMain+0x37de828>
 37e3ac0: 9720fbdf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e3ac4: f902ea76     	str	x22, [x19, #0x5d0]
 37e3ac8: f8bfc320     	ldapr	x0, [x25]
 37e3acc: b400d2c0     	cbz	x0, 0x37e5524 <_ChromeMain+0x37e0288>
 37e3ad0: 52806201     	mov	w1, #0x310              ; =784
 37e3ad4: d2800002     	mov	x2, #0x0                ; =0
 37e3ad8: 97231eb6     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e3adc: aa0003f4     	mov	x20, x0
 37e3ae0: 976e2d98     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e3ae4: 3946a408     	ldrb	w8, [x0, #0x1a9]
 37e3ae8: 340000a8     	cbz	w8, 0x37e3afc <_ChromeMain+0x37de860>
 37e3aec: 3906a69f     	strb	wzr, [x20, #0x1a9]
 37e3af0: 9103e280     	add	x0, x20, #0xf8
 37e3af4: 9106a681     	add	x1, x20, #0x1a9
 37e3af8: 975d1136     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e3afc: 52800035     	mov	w21, #0x1               ; =1
 37e3b00: aa1403e0     	mov	x0, x20
 37e3b04: d2c00281     	mov	x1, #0x1400000000       ; =85899345920
 37e3b08: 52800022     	mov	w2, #0x1                ; =1
 37e3b0c: 97bfb7d5     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 37e3b10: 52800800     	mov	w0, #0x40               ; =64
 37e3b14: 9720ae15     	bl	0xf368 <_ChromeMain+0xa0cc>
 37e3b18: b9000015     	str	w21, [x0]
 37e3b1c: 90fec228     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 37e3b20: 91260109     	add	x9, x8, #0x980
 37e3b24: f0fe5868     	adrp	x8, 0x2f2000 <_ChromeMain+0x2ecd64>
 37e3b28: 91220108     	add	x8, x8, #0x880
 37e3b2c: a900a009     	stp	x9, x8, [x0, #0x8]
 37e3b30: f0001a08     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 37e3b34: 91310108     	add	x8, x8, #0xc40
 37e3b38: a901a01a     	stp	x26, x8, [x0, #0x18]
 37e3b3c: 3dc013e0     	ldr	q0, [sp, #0x40]
 37e3b40: 3c828000     	stur	q0, [x0, #0x28]
 37e3b44: 3900e01f     	strb	wzr, [x0, #0x38]
 37e3b48: f90083e0     	str	x0, [sp, #0x100]
 37e3b4c: 0f000420     	movi.2s	v0, #0x1
 37e3b50: fd0087e0     	str	d0, [sp, #0x108]
 37e3b54: 52800068     	mov	w8, #0x3                ; =3
 37e3b58: b90113e8     	str	w8, [sp, #0x110]
 37e3b5c: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 37e3b60: f9008fff     	str	xzr, [sp, #0x118]
 37e3b64: d0059101     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 37e3b68: 91152021     	add	x1, x1, #0x548
 37e3b6c: 91036280     	add	x0, x20, #0xd8
 37e3b70: 910403e2     	add	x2, sp, #0x100
 37e3b74: 9790c206     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 37e3b78: 910403e0     	add	x0, sp, #0x100
 37e3b7c: 977d9c6a     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 37e3b80: 3945a688     	ldrb	w8, [x20, #0x169]
 37e3b84: 3500db68     	cbnz	w8, 0x37e56f0 <_ChromeMain+0x37e0454>
 37e3b88: f942e260     	ldr	x0, [x19, #0x5c0]
 37e3b8c: f940cc02     	ldr	x2, [x0, #0x198]
 37e3b90: aa1403e1     	mov	x1, x20
 37e3b94: 973e561a     	bl	0x7793fc <_ChromeMain+0x774160>
