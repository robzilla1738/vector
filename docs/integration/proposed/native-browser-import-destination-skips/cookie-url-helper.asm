
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  637300: d10383ff     	sub	sp, sp, #0xe0
  637304: a9086ffc     	stp	x28, x27, [sp, #0x80]
  637308: a90967fa     	stp	x26, x25, [sp, #0x90]
  63730c: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
  637310: a90b57f6     	stp	x22, x21, [sp, #0xb0]
  637314: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
  637318: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
  63731c: 910343fd     	add	x29, sp, #0xd0
  637320: aa0503f6     	mov	x22, x5
  637324: aa0403f7     	mov	x23, x4
  637328: aa0303f4     	mov	x20, x3
  63732c: aa0203f5     	mov	x21, x2
  637330: aa0103f9     	mov	x25, x1
  637334: aa0003f8     	mov	x24, x0
  637338: aa0803f3     	mov	x19, x8
  63733c: b006cf88     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
  637340: f940f908     	ldr	x8, [x8, #0x1f0]
  637344: f9400108     	ldr	x8, [x8]
  637348: f81a83a8     	stur	x8, [x29, #-0x58]
  63734c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
  637350: f9001bff     	str	xzr, [sp, #0x30]
  637354: b4000141     	cbz	x1, 0x63737c <_ChromeMain+0x6320e0>
  637358: 39400308     	ldrb	w8, [x24]
  63735c: 7100b91f     	cmp	w8, #0x2e
  637360: 54000b00     	b.eq	0x6374c0 <_ChromeMain+0x632224>
  637364: 92800228     	mov	x8, #-0x12              ; =-18
  637368: f2efffe8     	movk	x8, #0x7fff, lsl #48
  63736c: eb08033f     	cmp	x25, x8
  637370: 54000e88     	b.hi	0x637540 <_ChromeMain+0x6322a4>
  637374: f1005b3f     	cmp	x25, #0x16
  637378: 54000888     	b.hi	0x637488 <_ChromeMain+0x6321ec>
  63737c: 3900dff9     	strb	w25, [sp, #0x37]
  637380: 910083fa     	add	x26, sp, #0x20
  637384: 8b190348     	add	x8, x26, x25
  637388: eb1a011f     	cmp	x8, x26
  63738c: 54000d83     	b.lo	0x63753c <_ChromeMain+0x6322a0>
  637390: eb18011f     	cmp	x8, x24
  637394: fa588342     	ccmp	x26, x24, #0x2, hi
  637398: 54000d29     	b.ls	0x63753c <_ChromeMain+0x6322a0>
  63739c: aa1a03e0     	mov	x0, x26
  6373a0: aa1803e1     	mov	x1, x24
  6373a4: aa1903e2     	mov	x2, x25
  6373a8: 95e75fc9     	bl	0x800f2cc <_ChromeMain+0x800a030>
  6373ac: 38396b5f     	strb	wzr, [x26, x25]
  6373b0: 3940dfe8     	ldrb	w8, [sp, #0x37]
  6373b4: 13001d18     	sxtb	w24, w8
  6373b8: f94017e9     	ldr	x9, [sp, #0x28]
  6373bc: 7100031f     	cmp	w24, #0x0
  6373c0: 9a884128     	csel	x8, x9, x8, mi
  6373c4: f100011f     	cmp	x8, #0x0
  6373c8: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
  6373cc: 54000bc0     	b.eq	0x637544 <_ChromeMain+0x6322a8>
  6373d0: 90063b29     	adrp	x9, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
  6373d4: 91043929     	add	x9, x9, #0x10e
  6373d8: a903dbf7     	stp	x23, x22, [sp, #0x38]
  6373dc: 5280006a     	mov	w10, #0x3               ; =3
  6373e0: a904abe9     	stp	x9, x10, [sp, #0x48]
  6373e4: f94013e9     	ldr	x9, [sp, #0x20]
  6373e8: 7100031f     	cmp	w24, #0x0
  6373ec: 910083ea     	add	x10, sp, #0x20
  6373f0: 9a8a4129     	csel	x9, x9, x10, mi
  6373f4: a905a3e9     	stp	x9, x8, [sp, #0x58]
  6373f8: a906d3f5     	stp	x21, x20, [sp, #0x68]
  6373fc: 910023f4     	add	x20, sp, #0x8
  637400: 910023e8     	add	x8, sp, #0x8
  637404: 9100e3e0     	add	x0, sp, #0x38
  637408: 52800081     	mov	w1, #0x4                ; =4
  63740c: 9400cdd2     	bl	0x66ab54 <_ChromeMain+0x6658b8>
  637410: 39807fe8     	ldrsb	x8, [sp, #0x1f]
  637414: a940abe9     	ldp	x9, x10, [sp, #0x8]
  637418: f100011f     	cmp	x8, #0x0
  63741c: 9a944121     	csel	x1, x9, x20, mi
  637420: 7100011f     	cmp	w8, #0x0
  637424: 9a884142     	csel	x2, x10, x8, mi
  637428: aa1303e0     	mov	x0, x19
  63742c: 97f4e36a     	bl	0x3701d4 <_ChromeMain+0x36af38>
  637430: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
  637434: 36f800a8     	tbz	w8, #0x1f, 0x637448 <_ChromeMain+0x6321ac>
  637438: f94007e0     	ldr	x0, [sp, #0x8]
  63743c: f9400fe8     	ldr	x8, [sp, #0x18]
  637440: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  637444: 97e7469d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  637448: 3940dff8     	ldrb	w24, [sp, #0x37]
  63744c: 37380318     	tbnz	w24, #0x7, 0x6374ac <_ChromeMain+0x632210>
  637450: f85a83a8     	ldur	x8, [x29, #-0x58]
  637454: b006cf89     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
  637458: f940f929     	ldr	x9, [x9, #0x1f0]
  63745c: f9400129     	ldr	x9, [x9]
  637460: eb08013f     	cmp	x9, x8
  637464: 540006a1     	b.ne	0x637538 <_ChromeMain+0x63229c>
  637468: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
  63746c: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
  637470: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
  637474: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
  637478: a94967fa     	ldp	x26, x25, [sp, #0x90]
  63747c: a9486ffc     	ldp	x28, x27, [sp, #0x80]
  637480: 910383ff     	add	sp, sp, #0xe0
  637484: d65f03c0     	ret
  637488: 927ceb3b     	and	x27, x25, #0x7ffffffffffffff0
  63748c: 91004360     	add	x0, x27, #0x10
  637490: 97e75fb6     	bl	0xf368 <_ChromeMain+0xa0cc>
  637494: aa0003fa     	mov	x26, x0
  637498: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
  63749c: cb080368     	sub	x8, x27, x8
  6374a0: a90267e0     	stp	x0, x25, [sp, #0x20]
  6374a4: f9001be8     	str	x8, [sp, #0x30]
  6374a8: 17ffffb7     	b	0x637384 <_ChromeMain+0x6320e8>
  6374ac: f94013e0     	ldr	x0, [sp, #0x20]
  6374b0: f9401be8     	ldr	x8, [sp, #0x30]
  6374b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  6374b8: 97e74680     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  6374bc: 17ffffe5     	b	0x637450 <_ChromeMain+0x6321b4>
  6374c0: d100073a     	sub	x26, x25, #0x1
  6374c4: 92800228     	mov	x8, #-0x12              ; =-18
  6374c8: f2efffe8     	movk	x8, #0x7fff, lsl #48
  6374cc: eb08035f     	cmp	x26, x8
  6374d0: 54000388     	b.hi	0x637540 <_ChromeMain+0x6322a4>
  6374d4: f1005f3f     	cmp	x25, #0x17
  6374d8: 540001e8     	b.hi	0x637514 <_ChromeMain+0x632278>
  6374dc: 3900dffa     	strb	w26, [sp, #0x37]
  6374e0: 910083f9     	add	x25, sp, #0x20
  6374e4: 8b1a0328     	add	x8, x25, x26
  6374e8: eb19011f     	cmp	x8, x25
  6374ec: 54000283     	b.lo	0x63753c <_ChromeMain+0x6322a0>
  6374f0: 91000701     	add	x1, x24, #0x1
  6374f4: eb08003f     	cmp	x1, x8
  6374f8: fa593020     	ccmp	x1, x25, #0x0, lo
  6374fc: 54000202     	b.hs	0x63753c <_ChromeMain+0x6322a0>
  637500: aa1903e0     	mov	x0, x25
  637504: aa1a03e2     	mov	x2, x26
  637508: 95e75f71     	bl	0x800f2cc <_ChromeMain+0x800a030>
  63750c: 383a6b3f     	strb	wzr, [x25, x26]
  637510: 17ffffa8     	b	0x6373b0 <_ChromeMain+0x632114>
  637514: 927ceb5b     	and	x27, x26, #0x7ffffffffffffff0
  637518: 91004360     	add	x0, x27, #0x10
  63751c: 97e75f93     	bl	0xf368 <_ChromeMain+0xa0cc>
  637520: aa0003f9     	mov	x25, x0
  637524: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
  637528: cb080368     	sub	x8, x27, x8
  63752c: a9026be0     	stp	x0, x26, [sp, #0x20]
  637530: f9001be8     	str	x8, [sp, #0x30]
  637534: 17ffffec     	b	0x6374e4 <_ChromeMain+0x632248>
  637538: 95e7338a     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
  63753c: d4200020     	brk	#0x1
  637540: 95172393     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
  637544: aa1303e0     	mov	x0, x19
  637548: 948483ce     	bl	0x2758480 <_ChromeMain+0x27531e4>
  63754c: 17ffffc0     	b	0x63744c <_ChromeMain+0x6321b0>
  637550: 91004000     	add	x0, x0, #0x10
  637554: 14000001     	b	0x637558 <_ChromeMain+0x6322bc>
  637558: d10543ff     	sub	sp, sp, #0x150
  63755c: a9115ff8     	stp	x24, x23, [sp, #0x110]
  637560: a91257f6     	stp	x22, x21, [sp, #0x120]
  637564: a9134ff4     	stp	x20, x19, [sp, #0x130]
  637568: a9147bfd     	stp	x29, x30, [sp, #0x140]
  63756c: 910503fd     	add	x29, sp, #0x140
  637570: f9400015     	ldr	x21, [x0]
  637574: 394022a8     	ldrb	w8, [x21, #0x8]
  637578: 51000909     	sub	w9, w8, #0x2
  63757c: 7100093f     	cmp	w9, #0x2
  637580: 54001a69     	b.ls	0x6378cc <_ChromeMain+0x632630>
  637584: 34001ba8     	cbz	w8, 0x6378f8 <_ChromeMain+0x63265c>
  637588: 794016a8     	ldrh	w8, [x21, #0xa]
  63758c: 51204108     	sub	w8, w8, #0x810
  637590: 7100451f     	cmp	w8, #0x11
  637594: 54001b28     	b.hi	0x6378f8 <_ChromeMain+0x63265c>
  637598: aa0103f3     	mov	x19, x1
  63759c: f9400ab4     	ldr	x20, [x21, #0x10]
  6375a0: 39402288     	ldrb	w8, [x20, #0x8]
  6375a4: 51000909     	sub	w9, w8, #0x2
  6375a8: 7100093f     	cmp	w9, #0x2
  6375ac: 54000f49     	b.ls	0x637794 <_ChromeMain+0x6324f8>
