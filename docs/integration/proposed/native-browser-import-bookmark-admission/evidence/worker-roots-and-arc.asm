
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42540cc: 17ffffe7     	b	0x4254068 <_ChromeMain+0x424edcc>
 42540d0: 910623fa     	add	x26, sp, #0x188
 42540d4: f90123ff     	str	xzr, [sp, #0x240]
 42540d8: f9011fff     	str	xzr, [sp, #0x238]
 42540dc: f90127ff     	str	xzr, [sp, #0x248]
 42540e0: a91a7fff     	stp	xzr, xzr, [sp, #0x1a0]
 42540e4: f900dbff     	str	xzr, [sp, #0x1b0]
 42540e8: d004b861     	adrp	x1, 0xd962000 <dyld_stub_binder+0xd962000>
 42540ec: 910ca421     	add	x1, x1, #0x329
 42540f0: 910683e8     	add	x8, sp, #0x1a0
 42540f4: 9105c3e0     	add	x0, sp, #0x170
 42540f8: 52800122     	mov	w2, #0x9                ; =9
 42540fc: 975114c6     	bl	0x1699414 <_ChromeMain+0x1694178>
 4254100: 910683e0     	add	x0, sp, #0x1a0
 4254104: 977f40cf     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4254108: 34001760     	cbz	w0, 0x42543f4 <_ChromeMain+0x424f158>
 425410c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4254110: f81703bf     	stur	xzr, [x29, #-0x90]
 4254114: d10283b9     	sub	x25, x29, #0xa0
 4254118: 910683e0     	add	x0, sp, #0x1a0
 425411c: d10283a1     	sub	x1, x29, #0xa0
 4254120: 92800002     	mov	x2, #-0x1               ; =-1
 4254124: 9774fa99     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4254128: 340015a0     	cbz	w0, 0x42543dc <_ChromeMain+0x424f140>
 425412c: 6f00e400     	movi.2d	v0, #0000000000000000
 4254130: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4254134: 389773a8     	ldursb	x8, [x29, #-0x89]
 4254138: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 425413c: f100011f     	cmp	x8, #0x0
 4254140: 9a994120     	csel	x0, x9, x25, mi
 4254144: 7100011f     	cmp	w8, #0x0
 4254148: 9a884141     	csel	x1, x10, x8, mi
 425414c: 910103e8     	add	x8, sp, #0x40
 4254150: 52800002     	mov	w2, #0x0                ; =0
 4254154: 52801903     	mov	w3, #0xc8               ; =200
 4254158: 9765b779     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 425415c: 394163e8     	ldrb	w8, [sp, #0x58]
 4254160: 340013e8     	cbz	w8, 0x42543dc <_ChromeMain+0x424f140>
 4254164: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254168: 91109c21     	add	x1, x1, #0x427
 425416c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254170: 91118842     	add	x2, x2, #0x462
 4254174: d10203a8     	sub	x8, x29, #0x80
 4254178: 910103e0     	add	x0, sp, #0x40
 425417c: 528001a3     	mov	w3, #0xd                ; =13
 4254180: 94001f7c     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254184: 52800300     	mov	w0, #0x18               ; =24
 4254188: 96f6ec78     	bl	0xf368 <_ChromeMain+0xa0cc>
 425418c: b4008600     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254190: aa0003f9     	mov	x25, x0
 4254194: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254198: 37f800c8     	tbnz	w8, #0x1f, 0x42541b0 <_ChromeMain+0x424ef14>
 425419c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 42541a0: 3d800320     	str	q0, [x25]
 42541a4: f85903a8     	ldur	x8, [x29, #-0x70]
 42541a8: f9000b28     	str	x8, [x25, #0x10]
 42541ac: 14000004     	b	0x42541bc <_ChromeMain+0x424ef20>
 42541b0: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 42541b4: aa1903e0     	mov	x0, x25
 42541b8: 96f7ca86     	bl	0x46bd0 <_ChromeMain+0x41934>
 42541bc: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42541c0: 91102c21     	add	x1, x1, #0x40b
 42541c4: 910103e0     	add	x0, sp, #0x40
 42541c8: 52800362     	mov	w2, #0x1b               ; =27
 42541cc: 97085add     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 42541d0: b4000180     	cbz	x0, 0x4254200 <_ChromeMain+0x424ef64>
 42541d4: 39406008     	ldrb	w8, [x0, #0x18]
 42541d8: 71001d1f     	cmp	w8, #0x7
 42541dc: 54000121     	b.ne	0x4254200 <_ChromeMain+0x424ef64>
 42541e0: f9012bf9     	str	x25, [sp, #0x250]
 42541e4: 52800028     	mov	w8, #0x1                ; =1
 42541e8: 4e080d00     	dup.2d	v0, x8
 42541ec: 3c8d0340     	stur	q0, [x26, #0xd0]
 42541f0: 910943e1     	add	x1, sp, #0x250
 42541f4: 9108e3e3     	add	x3, sp, #0x238
 42541f8: 52800022     	mov	w2, #0x1                ; =1
 42541fc: 94001fa2     	bl	0x425c084 <_ChromeMain+0x4256de8>
 4254200: 39c05f28     	ldrsb	w8, [x25, #0x17]
 4254204: 37f88428     	tbnz	w8, #0x1f, 0x4255288 <_ChromeMain+0x424ffec>
 4254208: aa1903e0     	mov	x0, x25
 425420c: 52800301     	mov	w1, #0x18               ; =24
 4254210: 96f6d32a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254214: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254218: 36f800a8     	tbz	w8, #0x1f, 0x425422c <_ChromeMain+0x424ef90>
 425421c: f85803a0     	ldur	x0, [x29, #-0x80]
 4254220: f85903a8     	ldur	x8, [x29, #-0x70]
 4254224: d37ff901     	lsl	x1, x8, #1
 4254228: 96f6d324     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425422c: 394163e8     	ldrb	w8, [sp, #0x58]
 4254230: 360080e8     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254234: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254238: 91115021     	add	x1, x1, #0x454
 425423c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254240: 9111f842     	add	x2, x2, #0x47e
 4254244: d10203a8     	sub	x8, x29, #0x80
 4254248: 910103e0     	add	x0, sp, #0x40
 425424c: 528001e3     	mov	w3, #0xf                ; =15
 4254250: 94001f48     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254254: 52800300     	mov	w0, #0x18               ; =24
 4254258: 96f6ec44     	bl	0xf368 <_ChromeMain+0xa0cc>
 425425c: b4007f80     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254260: aa0003f9     	mov	x25, x0
 4254264: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254268: 37f800c8     	tbnz	w8, #0x1f, 0x4254280 <_ChromeMain+0x424efe4>
 425426c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 4254270: 3d800320     	str	q0, [x25]
 4254274: f85903a8     	ldur	x8, [x29, #-0x70]
 4254278: f9000b28     	str	x8, [x25, #0x10]
 425427c: 14000004     	b	0x425428c <_ChromeMain+0x424eff0>
 4254280: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 4254284: aa1903e0     	mov	x0, x25
 4254288: 96f7ca52     	bl	0x46bd0 <_ChromeMain+0x41934>
 425428c: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254290: 9110fc21     	add	x1, x1, #0x43f
 4254294: 910103e0     	add	x0, sp, #0x40
 4254298: 52800282     	mov	w2, #0x14               ; =20
 425429c: 97085aa9     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 42542a0: b4000180     	cbz	x0, 0x42542d0 <_ChromeMain+0x424f034>
 42542a4: 39406008     	ldrb	w8, [x0, #0x18]
 42542a8: 71001d1f     	cmp	w8, #0x7
 42542ac: 54000121     	b.ne	0x42542d0 <_ChromeMain+0x424f034>
 42542b0: f9012bf9     	str	x25, [sp, #0x250]
 42542b4: 52800028     	mov	w8, #0x1                ; =1
 42542b8: 4e080d00     	dup.2d	v0, x8
 42542bc: 3c8d0340     	stur	q0, [x26, #0xd0]
 42542c0: 910943e1     	add	x1, sp, #0x250
 42542c4: 9108e3e3     	add	x3, sp, #0x238
 42542c8: 52800002     	mov	w2, #0x0                ; =0
 42542cc: 94001f6e     	bl	0x425c084 <_ChromeMain+0x4256de8>
 42542d0: 39c05f28     	ldrsb	w8, [x25, #0x17]
 42542d4: 37f87e48     	tbnz	w8, #0x1f, 0x425529c <_ChromeMain+0x4250000>
 42542d8: aa1903e0     	mov	x0, x25
 42542dc: 52800301     	mov	w1, #0x18               ; =24
 42542e0: 96f6d2f6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42542e4: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42542e8: 36f800a8     	tbz	w8, #0x1f, 0x42542fc <_ChromeMain+0x424f060>
 42542ec: f85803a0     	ldur	x0, [x29, #-0x80]
 42542f0: f85903a8     	ldur	x8, [x29, #-0x70]
 42542f4: d37ff901     	lsl	x1, x8, #1
 42542f8: 96f6d2f0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42542fc: 394163e8     	ldrb	w8, [sp, #0x58]
 4254300: 36007a68     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254304: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254308: 9111ec21     	add	x1, x1, #0x47b
 425430c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254310: 91127842     	add	x2, x2, #0x49e
 4254314: d10203a8     	sub	x8, x29, #0x80
 4254318: 910103e0     	add	x0, sp, #0x40
 425431c: 52800203     	mov	w3, #0x10               ; =16
 4254320: 94001f14     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254324: 52800300     	mov	w0, #0x18               ; =24
 4254328: 96f6ec10     	bl	0xf368 <_ChromeMain+0xa0cc>
 425432c: b4007900     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254330: aa0003f9     	mov	x25, x0
 4254334: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254338: 36f800a8     	tbz	w8, #0x1f, 0x425434c <_ChromeMain+0x424f0b0>
 425433c: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 4254340: aa1903e0     	mov	x0, x25
 4254344: 96f7ca23     	bl	0x46bd0 <_ChromeMain+0x41934>
 4254348: 14000005     	b	0x425435c <_ChromeMain+0x424f0c0>
 425434c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 4254350: 3d800320     	str	q0, [x25]
 4254354: f85903a8     	ldur	x8, [x29, #-0x70]
 4254358: f9000b28     	str	x8, [x25, #0x10]
 425435c: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254360: 91119421     	add	x1, x1, #0x465
 4254364: 910103e0     	add	x0, sp, #0x40
 4254368: 528002a2     	mov	w2, #0x15               ; =21
 425436c: 97085a75     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 4254370: b4000180     	cbz	x0, 0x42543a0 <_ChromeMain+0x424f104>
 4254374: 39406008     	ldrb	w8, [x0, #0x18]
 4254378: 71001d1f     	cmp	w8, #0x7
 425437c: 54000121     	b.ne	0x42543a0 <_ChromeMain+0x424f104>
 4254380: f9012bf9     	str	x25, [sp, #0x250]
 4254384: 52800028     	mov	w8, #0x1                ; =1
 4254388: 4e080d00     	dup.2d	v0, x8
 425438c: 3c8d0340     	stur	q0, [x26, #0xd0]
 4254390: 910943e1     	add	x1, sp, #0x250
 4254394: 9108e3e3     	add	x3, sp, #0x238
 4254398: 52800002     	mov	w2, #0x0                ; =0
 425439c: 94001f3a     	bl	0x425c084 <_ChromeMain+0x4256de8>
 42543a0: 39c05f28     	ldrsb	w8, [x25, #0x17]
 42543a4: 37f87868     	tbnz	w8, #0x1f, 0x42552b0 <_ChromeMain+0x4250014>
 42543a8: aa1903e0     	mov	x0, x25
 42543ac: 52800301     	mov	w1, #0x18               ; =24
 42543b0: 96f6d2c2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543b4: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42543b8: 36f800a8     	tbz	w8, #0x1f, 0x42543cc <_ChromeMain+0x424f130>
 42543bc: f85803a0     	ldur	x0, [x29, #-0x80]
 42543c0: f85903a8     	ldur	x8, [x29, #-0x70]
 42543c4: d37ff901     	lsl	x1, x8, #1
 42543c8: 96f6d2bc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543cc: 394163e8     	ldrb	w8, [sp, #0x58]
 42543d0: 34000068     	cbz	w8, 0x42543dc <_ChromeMain+0x424f140>
 42543d4: 910103e0     	add	x0, sp, #0x40
 42543d8: 971c282a     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42543dc: 38d773a8     	ldursb	w8, [x29, #-0x89]
 42543e0: 36f800a8     	tbz	w8, #0x1f, 0x42543f4 <_ChromeMain+0x424f158>
 42543e4: f85603a0     	ldur	x0, [x29, #-0xa0]
 42543e8: f85703a8     	ldur	x8, [x29, #-0x90]
 42543ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42543f0: 96f6d2b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543f4: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 42543f8: 37f80268     	tbnz	w8, #0x1f, 0x4254444 <_ChromeMain+0x424f1a8>
 42543fc: 910122a0     	add	x0, x21, #0x48
 4254400: 94d3eb9e     	bl	0x774f278 <_ChromeMain+0x7749fdc>
 4254404: f9411fe8     	ldr	x8, [sp, #0x238]
 4254408: f9004e68     	str	x8, [x19, #0x98]
 425440c: 3ccb8340     	ldur	q0, [x26, #0xb8]
 4254410: 3d802a60     	str	q0, [x19, #0xa0]
 4254414: f90127ff     	str	xzr, [sp, #0x248]
 4254418: f90123ff     	str	xzr, [sp, #0x240]
 425441c: f9011fff     	str	xzr, [sp, #0x238]
 4254420: 9108e3e8     	add	x8, sp, #0x238
 4254424: f90023e8     	str	x8, [sp, #0x40]
 4254428: 910103e0     	add	x0, sp, #0x40
 425442c: 94d3cdf3     	bl	0x7747bf8 <_ChromeMain+0x774295c>
 4254430: 34000154     	cbz	w20, 0x4254458 <_ChromeMain+0x424f1bc>
 4254434: 34000677     	cbz	w23, 0x4254500 <_ChromeMain+0x424f264>
