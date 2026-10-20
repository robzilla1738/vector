
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263410: 910003e0     	mov	x0, sp
 4263414: aa1603e1     	mov	x1, x22
 4263418: 94be3e34     	bl	0x71f2ce8 <_ChromeMain+0x71eda4c>
 426341c: 52800028     	mov	w8, #0x1                ; =1
 4263420: 390223e8     	strb	w8, [sp, #0x88]
 4263424: 7940a3e8     	ldrh	w8, [sp, #0x50]
 4263428: 39412269     	ldrb	w9, [x19, #0x48]
 426342c: 121f010a     	and	w10, w8, #0x2
 4263430: 7100013f     	cmp	w9, #0x0
 4263434: 1a881154     	csel	w20, w10, w8, ne
 4263438: 34ffef34     	cbz	w20, 0x426321c <_ChromeMain+0x425df80>
 426343c: 721d0288     	ands	w8, w20, #0x8
 4263440: 1a9f17e9     	cset	w9, eq
 4263444: 53037d08     	lsr	w8, w8, #3
 4263448: 3900c668     	strb	w8, [x19, #0x31]
 426344c: 3900ca69     	strb	w9, [x19, #0x32]
 4263450: 3900ce69     	strb	w9, [x19, #0x33]
 4263454: b9402a68     	ldr	w8, [x19, #0x28]
 4263458: 7100051f     	cmp	w8, #0x1
 426345c: 540001c1     	b.ne	0x4263494 <_ChromeMain+0x425e1f8>
 4263460: f9400668     	ldr	x8, [x19, #0x8]
 4263464: b4ffedc8     	cbz	x8, 0x426321c <_ChromeMain+0x425df80>
 4263468: f9413903     	ldr	x3, [x8, #0x270]
 426346c: b4ffed83     	cbz	x3, 0x426321c <_ChromeMain+0x425df80>
 4263470: 910003e1     	mov	x1, sp
 4263474: aa1303e0     	mov	x0, x19
 4263478: aa1403e2     	mov	x2, x20
 426347c: 9400017b     	bl	0x4263a68 <_ChromeMain+0x425e7cc>
 4263480: 17ffff69     	b	0x4263224 <_ChromeMain+0x425df88>
 4263484: a9478a61     	ldp	x1, x2, [x19, #0x78]
 4263488: 910603e0     	add	x0, sp, #0x180
 426348c: 9709158a     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4263490: 14000054     	b	0x42635e0 <_ChromeMain+0x425e344>
 4263494: f0056408     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4263498: f9467d00     	ldr	x0, [x8, #0xcf8]
 426349c: 975ef1b7     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 42634a0: b4ffebe0     	cbz	x0, 0x426321c <_ChromeMain+0x425df80>
 42634a4: aa0003f5     	mov	x21, x0
 42634a8: 975ef1da     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 42634ac: aa0003f7     	mov	x23, x0
 42634b0: 910603f9     	add	x25, sp, #0x180
 42634b4: 910603e8     	add	x8, sp, #0x180
 42634b8: aa1503e0     	mov	x0, x21
 42634bc: 94e1909d     	bl	0x7ac7730 <_ChromeMain+0x7ac2494>
 42634c0: 9101e276     	add	x22, x19, #0x78
 42634c4: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 42634c8: 37fff908     	tbnz	w8, #0x1f, 0x42633e8 <_ChromeMain+0x425e14c>
 42634cc: 3dc063e0     	ldr	q0, [sp, #0x180]
 42634d0: 3d8002c0     	str	q0, [x22]
 42634d4: f940cbe8     	ldr	x8, [sp, #0x190]
 42634d8: f9000ac8     	str	x8, [x22, #0x10]
 42634dc: d2e0e008     	mov	x8, #0x700000000000000  ; =504403158265495552
 42634e0: f900cbe8     	str	x8, [sp, #0x190]
 42634e4: 91003b29     	add	x9, x25, #0xe
 42634e8: f004e8a8     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 42634ec: 91155908     	add	x8, x8, #0x556
 42634f0: eb08013f     	cmp	x9, x8
 42634f4: fa488322     	ccmp	x25, x8, #0x2, hi
 42634f8: 54001589     	b.ls	0x42637a8 <_ChromeMain+0x425e50c>
 42634fc: f9400109     	ldr	x9, [x8]
 4263500: f900c3e9     	str	x9, [sp, #0x180]
 4263504: f8406108     	ldur	x8, [x8, #0x6]
 4263508: f80d6308     	stur	x8, [x24, #0xd6]
 426350c: 79031fff     	strh	wzr, [sp, #0x18e]
 4263510: 39421fe8     	ldrb	w8, [sp, #0x87]
 4263514: f9403fe9     	ldr	x9, [sp, #0x78]
 4263518: 7219011f     	tst	w8, #0x80
 426351c: 9a881128     	csel	x8, x9, x8, ne
 4263520: b4000208     	cbz	x8, 0x4263560 <_ChromeMain+0x425e2c4>
 4263524: 910003e8     	mov	x8, sp
 4263528: 9101c119     	add	x25, x8, #0x70
 426352c: f004e8a1     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4263530: 91159821     	add	x1, x1, #0x566
 4263534: 910603e0     	add	x0, sp, #0x180
 4263538: 52800062     	mov	w2, #0x3                ; =3
 426353c: 9726cbab     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4263540: 39821fe8     	ldrsb	x8, [sp, #0x87]
 4263544: a9472be9     	ldp	x9, x10, [sp, #0x70]
 4263548: f100011f     	cmp	x8, #0x0
 426354c: 9a994121     	csel	x1, x9, x25, mi
 4263550: 7100011f     	cmp	w8, #0x0
 4263554: 9a884142     	csel	x2, x10, x8, mi
 4263558: 910603e0     	add	x0, sp, #0x180
 426355c: 9726cba3     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 4263560: 9102427a     	add	x26, x19, #0x90
 4263564: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 4263568: 37fff4a8     	tbnz	w8, #0x1f, 0x42633fc <_ChromeMain+0x425e160>
 426356c: 3dc063e0     	ldr	q0, [sp, #0x180]
 4263570: 3d800340     	str	q0, [x26]
 4263574: f940cbe8     	ldr	x8, [sp, #0x190]
 4263578: f9000b48     	str	x8, [x26, #0x10]
 426357c: 910603f9     	add	x25, sp, #0x180
 4263580: f90123ff     	str	xzr, [sp, #0x240]
 4263584: 6f00e400     	movi.2d	v0, #0000000000000000
 4263588: ad1103e0     	stp	q0, q0, [sp, #0x220]
 426358c: ad1003e0     	stp	q0, q0, [sp, #0x200]
 4263590: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 4263594: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 4263598: ad0d03e0     	stp	q0, q0, [sp, #0x1a0]
 426359c: ad0c03e0     	stp	q0, q0, [sp, #0x180]
 42635a0: 97addba9     	bl	0x2dda444 <_ChromeMain+0x2dd51a8>
 42635a4: aa0003e1     	mov	x1, x0
 42635a8: 91022320     	add	x0, x25, #0x88
 42635ac: 97addb58     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 42635b0: 790483ff     	strh	wzr, [sp, #0x240]
 42635b4: 39090bff     	strb	wzr, [sp, #0x242]
 42635b8: eb16033f     	cmp	x25, x22
 42635bc: 54000120     	b.eq	0x42635e0 <_ChromeMain+0x425e344>
 42635c0: 39c65fe9     	ldrsb	w9, [sp, #0x197]
 42635c4: 39423e68     	ldrb	w8, [x19, #0x8f]
 42635c8: 37f80e09     	tbnz	w9, #0x1f, 0x4263788 <_ChromeMain+0x425e4ec>
 42635cc: 373ff5c8     	tbnz	w8, #0x7, 0x4263484 <_ChromeMain+0x425e1e8>
 42635d0: 3dc002c0     	ldr	q0, [x22]
 42635d4: 3d8063e0     	str	q0, [sp, #0x180]
 42635d8: f9400ac8     	ldr	x8, [x22, #0x10]
 42635dc: f900cbe8     	str	x8, [sp, #0x190]
 42635e0: 9100633b     	add	x27, x25, #0x18
 42635e4: eb1a037f     	cmp	x27, x26
 42635e8: 54000120     	b.eq	0x426360c <_ChromeMain+0x425e370>
 42635ec: 39c6bfe9     	ldrsb	w9, [sp, #0x1af]
 42635f0: 39429e68     	ldrb	w8, [x19, #0xa7]
 42635f4: 37f80ba9     	tbnz	w9, #0x1f, 0x4263768 <_ChromeMain+0x425e4cc>
 42635f8: 37380b08     	tbnz	w8, #0x7, 0x4263758 <_ChromeMain+0x425e4bc>
 42635fc: 3dc00340     	ldr	q0, [x26]
 4263600: 3d800360     	str	q0, [x27]
 4263604: f9400b48     	ldr	x8, [x26, #0x10]
 4263608: f9000b68     	str	x8, [x27, #0x10]
 426360c: aa1703e0     	mov	x0, x23
 4263610: 94e1aa48     	bl	0x7acdf30 <_ChromeMain+0x7ac8c94>
 4263614: 3dc063e0     	ldr	q0, [sp, #0x180]
 4263618: 3d802fe0     	str	q0, [sp, #0xb0]
 426361c: f940cbe8     	ldr	x8, [sp, #0x190]
 4263620: a9187fff     	stp	xzr, xzr, [sp, #0x180]
 4263624: 3dc00360     	ldr	q0, [x27]
 4263628: 3c818300     	stur	q0, [x24, #0x18]
 426362c: f9400b69     	ldr	x9, [x27, #0x10]
 4263630: f90063e8     	str	x8, [sp, #0xc0]
 4263634: f9006fe9     	str	x9, [sp, #0xd8]
 4263638: a9007f7f     	stp	xzr, xzr, [x27]
 426363c: f9000b7f     	str	xzr, [x27, #0x10]
 4263640: f940e3e8     	ldr	x8, [sp, #0x1c0]
 4263644: 3dc06fe0     	ldr	q0, [sp, #0x1b0]
 4263648: 3d803be0     	str	q0, [sp, #0xe0]
 426364c: f900cbff     	str	xzr, [sp, #0x190]
 4263650: a91b7fff     	stp	xzr, xzr, [sp, #0x1b0]
 4263654: 910327e9     	add	x9, sp, #0xc9
 4263658: 3ccff120     	ldur	q0, [x9, #0xff]
 426365c: f940efe9     	ldr	x9, [sp, #0x1d8]
 4263660: f9007be8     	str	x8, [sp, #0xf0]
 4263664: f90087e9     	str	x9, [sp, #0x108]
 4263668: 3c848300     	stur	q0, [x24, #0x48]
 426366c: a91d7fff     	stp	xzr, xzr, [sp, #0x1d0]
 4263670: a91c7fff     	stp	xzr, xzr, [sp, #0x1c0]
 4263674: f900f7e0     	str	x0, [sp, #0x1e8]
 4263678: ad4f07e0     	ldp	q0, q1, [sp, #0x1e0]
 426367c: f94103e8     	ldr	x8, [sp, #0x200]
 4263680: f9009be8     	str	x8, [sp, #0x130]
 4263684: ad0887e0     	stp	q0, q1, [sp, #0x110]
 4263688: a91f7fff     	stp	xzr, xzr, [sp, #0x1f0]
 426368c: 9102c3e8     	add	x8, sp, #0xb0
 4263690: f90103ff     	str	xzr, [sp, #0x200]
 4263694: 91022100     	add	x0, x8, #0x88
 4263698: 91022321     	add	x1, x25, #0x88
 426369c: 97addb1c     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 42636a0: 784c0328     	ldurh	w8, [x25, #0xc0]
 42636a4: 7902e3e8     	strh	w8, [sp, #0x170]
 42636a8: 384c2328     	ldurb	w8, [x25, #0xc2]
 42636ac: 3905cbe8     	strb	w8, [sp, #0x172]
 42636b0: 9102c3e1     	add	x1, sp, #0xb0
 42636b4: aa1703e0     	mov	x0, x23
 42636b8: 979a6aae     	bl	0x28fe170 <_ChromeMain+0x28f8ed4>
 42636bc: 9102c3e0     	add	x0, sp, #0xb0
 42636c0: 979baf91     	bl	0x294f504 <_ChromeMain+0x294a268>
 42636c4: f9405a77     	ldr	x23, [x19, #0xb0]
 42636c8: b40000d7     	cbz	x23, 0x42636e0 <_ChromeMain+0x425e444>
 42636cc: 52800028     	mov	w8, #0x1                ; =1
 42636d0: b82802e8     	ldadd	w8, w8, [x23]
 42636d4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 42636d8: 6b09011f     	cmp	w8, w9
 42636dc: 540006a0     	b.eq	0x42637b0 <_ChromeMain+0x425e514>
 42636e0: f9405e78     	ldr	x24, [x19, #0xb8]
 42636e4: 52801a00     	mov	w0, #0xd0               ; =208
 42636e8: 96f6af20     	bl	0xf368 <_ChromeMain+0xa0cc>
 42636ec: aa0003f3     	mov	x19, x0
 42636f0: 52800028     	mov	w8, #0x1                ; =1
 42636f4: 10009789     	adr	x9, 0x42649e4 <_ChromeMain+0x425f748>
 42636f8: d503201f     	nop
 42636fc: 10009c8a     	adr	x10, 0x4264a8c <_ChromeMain+0x425f7f0>
 4263700: d503201f     	nop
 4263704: b9000008     	str	w8, [x0]
 4263708: f0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 426370c: 911b0108     	add	x8, x8, #0x6c0
 4263710: 1000366b     	adr	x11, 0x4263ddc <_ChromeMain+0x425eb40>
 4263714: d503201f     	nop
 4263718: a900a809     	stp	x9, x10, [x0, #0x8]
 426371c: a901ac08     	stp	x8, x11, [x0, #0x18]
 4263720: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4263724: f9001c18     	str	x24, [x0, #0x38]
 4263728: 91010000     	add	x0, x0, #0x40
 426372c: 910003e1     	mov	x1, sp
 4263730: 94be3d6e     	bl	0x71f2ce8 <_ChromeMain+0x71eda4c>
 4263734: 79019274     	strh	w20, [x19, #0xc8]
 4263738: aa1503e0     	mov	x0, x21
 426373c: aa1603e1     	mov	x1, x22
 4263740: aa1303e2     	mov	x2, x19
 4263744: d2800003     	mov	x3, #0x0                ; =0
 4263748: 94e18ce9     	bl	0x7ac6aec <_ChromeMain+0x7ac1850>
 426374c: 910603e0     	add	x0, sp, #0x180
 4263750: 979baf6d     	bl	0x294f504 <_ChromeMain+0x294a268>
 4263754: 17fffeb4     	b	0x4263224 <_ChromeMain+0x425df88>
