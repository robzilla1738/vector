
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  bddc50: d10403ff     	sub	sp, sp, #0x100
  bddc54: 6d082beb     	stp	d11, d10, [sp, #0x80]
  bddc58: 6d0923e9     	stp	d9, d8, [sp, #0x90]
  bddc5c: a90a6ffc     	stp	x28, x27, [sp, #0xa0]
  bddc60: a90b67fa     	stp	x26, x25, [sp, #0xb0]
  bddc64: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
  bddc68: a90d57f6     	stp	x22, x21, [sp, #0xd0]
  bddc6c: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
  bddc70: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
  bddc74: 9103c3fd     	add	x29, sp, #0xf0
  bddc78: aa0503f5     	mov	x21, x5
  bddc7c: aa0403f3     	mov	x19, x4
  bddc80: aa0003f4     	mov	x20, x0
  bddc84: a9040be1     	stp	x1, x2, [sp, #0x40]
  bddc88: f9400808     	ldr	x8, [x0, #0x10]
  bddc8c: 390083ff     	strb	wzr, [sp, #0x20]
  bddc90: 52801fe9     	mov	w9, #0xff               ; =255
  bddc94: 3900e3e9     	strb	w9, [sp, #0x38]
  bddc98: 39406069     	ldrb	w9, [x3, #0x18]
  bddc9c: 7100093f     	cmp	w9, #0x2
  bddca0: 5400096c     	b.gt	0xbdddcc <_ChromeMain+0xbd8b30>
  bddca4: 540005a1     	b.ne	0xbddd58 <_ChromeMain+0xbd8abc>
  bddca8: b940006a     	ldr	w10, [x3]
  bddcac: b90023ea     	str	w10, [sp, #0x20]
  bddcb0: 5280004b     	mov	w11, #0x2               ; =2
  bddcb4: 3900e3eb     	strb	w11, [sp, #0x38]
  bddcb8: b90053ea     	str	w10, [sp, #0x50]
  bddcbc: 3901a3e9     	strb	w9, [sp, #0x68]
  bddcc0: 91004100     	add	x0, x8, #0x10
  bddcc4: 910143e3     	add	x3, sp, #0x50
  bddcc8: 97f21f16     	bl	0x865920 <_ChromeMain+0x860684>
  bddccc: 3941a3e8     	ldrb	w8, [sp, #0x68]
  bddcd0: 9006e736     	adrp	x22, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
  bddcd4: 9121e2d6     	add	x22, x22, #0x878
  bddcd8: 7103fd1f     	cmp	w8, #0xff
  bddcdc: 54000060     	b.eq	0xbddce8 <_ChromeMain+0xbd8a4c>
  bddce0: 721e791f     	tst	w8, #0xfffffffd
  bddce4: 54000581     	b.ne	0xbddd94 <_ChromeMain+0xbd8af8>
  bddce8: 3940e3e8     	ldrb	w8, [sp, #0x38]
  bddcec: 7103fd1f     	cmp	w8, #0xff
  bddcf0: 54000060     	b.eq	0xbddcfc <_ChromeMain+0xbd8a60>
  bddcf4: 721e791f     	tst	w8, #0xfffffffd
  bddcf8: 540005c1     	b.ne	0xbdddb0 <_ChromeMain+0xbd8b14>
  bddcfc: 52801fe8     	mov	w8, #0xff               ; =255
  bddd00: 3900e3e8     	strb	w8, [sp, #0x38]
  bddd04: 35000f73     	cbnz	w19, 0xbddef0 <_ChromeMain+0xbd8c54>
  bddd08: 35002755     	cbnz	w21, 0xbde1f0 <_ChromeMain+0xbd8f54>
  bddd0c: a9440be1     	ldp	x1, x2, [sp, #0x40]
  bddd10: f9400288     	ldr	x8, [x20]
  bddd14: f9400908     	ldr	x8, [x8, #0x10]
  bddd18: b001bbc9     	adrp	x9, 0x4356000 <_ChromeMain+0x4350d64>
  bddd1c: 9111c129     	add	x9, x9, #0x470
  bddd20: eb09011f     	cmp	x8, x9
  bddd24: 54000221     	b.ne	0xbddd68 <_ChromeMain+0xbd8acc>
  bddd28: 7200067f     	tst	w19, #0x3
  bddd2c: 540002e1     	b.ne	0xbddd88 <_ChromeMain+0xbd8aec>
  bddd30: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
  bddd34: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
  bddd38: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
  bddd3c: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
  bddd40: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
  bddd44: a94a6ffc     	ldp	x28, x27, [sp, #0xa0]
  bddd48: 6d4923e9     	ldp	d9, d8, [sp, #0x90]
  bddd4c: 6d482beb     	ldp	d11, d10, [sp, #0x80]
  bddd50: 910403ff     	add	sp, sp, #0x100
  bddd54: d65f03c0     	ret
  bddd58: 35000769     	cbnz	w9, 0xbdde44 <_ChromeMain+0xbd8ba8>
  bddd5c: 3900e3ff     	strb	wzr, [sp, #0x38]
  bddd60: 390143ff     	strb	wzr, [sp, #0x50]
  bddd64: 17ffffd6     	b	0xbddcbc <_ChromeMain+0xbd8a20>
  bddd68: b0ffa1a9     	adrp	x9, 0x12000 <_ChromeMain+0xcd64>
  bddd6c: 91370129     	add	x9, x9, #0xdc0
  bddd70: eb09011f     	cmp	x8, x9
  bddd74: 54fffde0     	b.eq	0xbddd30 <_ChromeMain+0xbd8a94>
  bddd78: aa1403e0     	mov	x0, x20
  bddd7c: aa1303e3     	mov	x3, x19
  bddd80: d63f0100     	blr	x8
  bddd84: 17ffffeb     	b	0xbddd30 <_ChromeMain+0xbd8a94>
  bddd88: f8430e88     	ldr	x8, [x20, #0x30]!
  bddd8c: b4fffd28     	cbz	x8, 0xbddd30 <_ChromeMain+0xbd8a94>
  bddd90: 140001f4     	b	0xbde560 <_ChromeMain+0xbd92c4>
  bddd94: 7100111f     	cmp	w8, #0x4
  bddd98: 540003a0     	b.eq	0xbdde0c <_ChromeMain+0xbd8b70>
  bddd9c: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
  bddda0: 9101dfe0     	add	x0, sp, #0x77
  bddda4: 910143e1     	add	x1, sp, #0x50
  bddda8: d63f0100     	blr	x8
  bdddac: 17ffffcf     	b	0xbddce8 <_ChromeMain+0xbd8a4c>
  bdddb0: 7100111f     	cmp	w8, #0x4
  bdddb4: 540003a0     	b.eq	0xbdde28 <_ChromeMain+0xbd8b8c>
  bdddb8: f8685ac8     	ldr	x8, [x22, w8, uxtw #3]
  bdddbc: 910143e0     	add	x0, sp, #0x50
  bdddc0: 910083e1     	add	x1, sp, #0x20
  bdddc4: d63f0100     	blr	x8
  bdddc8: 17ffffcd     	b	0xbddcfc <_ChromeMain+0xbd8a60>
  bdddcc: 7100113f     	cmp	w9, #0x4
  bdddd0: 5400056c     	b.gt	0xbdde7c <_ChromeMain+0xbd8be0>
  bdddd4: 54000441     	b.ne	0xbdde5c <_ChromeMain+0xbd8bc0>
  bdddd8: f940086a     	ldr	x10, [x3, #0x10]
  bddddc: f9001bea     	str	x10, [sp, #0x30]
  bddde0: 3dc00060     	ldr	q0, [x3]
  bddde4: 3d800be0     	str	q0, [sp, #0x20]
  bddde8: a900fc7f     	stp	xzr, xzr, [x3, #0x8]
  bdddec: f900007f     	str	xzr, [x3]
  bdddf0: 5280008b     	mov	w11, #0x4               ; =4
  bdddf4: 3900e3eb     	strb	w11, [sp, #0x38]
  bdddf8: 3d8017e0     	str	q0, [sp, #0x50]
  bdddfc: f90033ea     	str	x10, [sp, #0x60]
  bdde00: a902ffff     	stp	xzr, xzr, [sp, #0x28]
  bdde04: f90013ff     	str	xzr, [sp, #0x20]
  bdde08: 17ffffad     	b	0xbddcbc <_ChromeMain+0xbd8a20>
  bdde0c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
  bdde10: 36fff6c8     	tbz	w8, #0x1f, 0xbddce8 <_ChromeMain+0xbd8a4c>
  bdde14: f9402be0     	ldr	x0, [sp, #0x50]
  bdde18: f94033e8     	ldr	x8, [sp, #0x60]
  bdde1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  bdde20: 97d0ac26     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  bdde24: 17ffffb1     	b	0xbddce8 <_ChromeMain+0xbd8a4c>
  bdde28: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
  bdde2c: 36fff688     	tbz	w8, #0x1f, 0xbddcfc <_ChromeMain+0xbd8a60>
  bdde30: f94013e0     	ldr	x0, [sp, #0x20]
  bdde34: f9401be8     	ldr	x8, [sp, #0x30]
  bdde38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
  bdde3c: 97d0ac1f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  bdde40: 17ffffaf     	b	0xbddcfc <_ChromeMain+0xbd8a60>
  bdde44: 3940006a     	ldrb	w10, [x3]
  bdde48: 390083ea     	strb	w10, [sp, #0x20]
  bdde4c: 5280002b     	mov	w11, #0x1               ; =1
  bdde50: 3900e3eb     	strb	w11, [sp, #0x38]
  bdde54: 390143ea     	strb	w10, [sp, #0x50]
  bdde58: 17ffff99     	b	0xbddcbc <_ChromeMain+0xbd8a20>
  bdde5c: f940006a     	ldr	x10, [x3]
  bdde60: f90013ea     	str	x10, [sp, #0x20]
  bdde64: 5280006b     	mov	w11, #0x3               ; =3
  bdde68: 3900e3eb     	strb	w11, [sp, #0x38]
  bdde6c: 52801feb     	mov	w11, #0xff              ; =255
  bdde70: 3901a3eb     	strb	w11, [sp, #0x68]
  bdde74: f9002bea     	str	x10, [sp, #0x50]
  bdde78: 17ffff91     	b	0xbddcbc <_ChromeMain+0xbd8a20>
  bdde7c: 7100193f     	cmp	w9, #0x6
  bdde80: 5400018c     	b.gt	0xbddeb0 <_ChromeMain+0xbd8c14>
  bdde84: 7100153f     	cmp	w9, #0x5
  bdde88: 540000a0     	b.eq	0xbdde9c <_ChromeMain+0xbd8c00>
  bdde8c: f940006a     	ldr	x10, [x3]
  bdde90: f900007f     	str	xzr, [x3]
  bdde94: 528000cb     	mov	w11, #0x6               ; =6
  bdde98: 1400000b     	b	0xbddec4 <_ChromeMain+0xbd8c28>
  bdde9c: f940006a     	ldr	x10, [x3]
  bddea0: f900007f     	str	xzr, [x3]
  bddea4: 528000ab     	mov	w11, #0x5               ; =5
  bddea8: 3900e3eb     	strb	w11, [sp, #0x38]
  bddeac: 14000009     	b	0xbdded0 <_ChromeMain+0xbd8c34>
  bddeb0: 71001d3f     	cmp	w9, #0x7
  bddeb4: 54003501     	b.ne	0xbde554 <_ChromeMain+0xbd92b8>
  bddeb8: f940006a     	ldr	x10, [x3]
  bddebc: f900007f     	str	xzr, [x3]
  bddec0: 528000eb     	mov	w11, #0x7               ; =7
  bddec4: 3900e3eb     	strb	w11, [sp, #0x38]
  bddec8: 52801feb     	mov	w11, #0xff              ; =255
  bddecc: 3901a3eb     	strb	w11, [sp, #0x68]
  bdded0: f90013ff     	str	xzr, [sp, #0x20]
  bdded4: f9002bea     	str	x10, [sp, #0x50]
  bdded8: 6f00e400     	movi.2d	v0, #0000000000000000
  bddedc: 3c8283e0     	stur	q0, [sp, #0x28]
  bddee0: 3cc08061     	ldur	q1, [x3, #0x8]
  bddee4: 3c808060     	stur	q0, [x3, #0x8]
  bddee8: 3c8583e1     	stur	q1, [sp, #0x58]
  bddeec: 17ffff74     	b	0xbddcbc <_ChromeMain+0xbd8a20>
  bddef0: aa1403ee     	mov	x14, x20
  bddef4: f8418dc8     	ldr	x8, [x14, #0x18]!
  bddef8: f27f191f     	tst	x8, #0xfe
  bddefc: 54002e40     	b.eq	0xbde4c4 <_ChromeMain+0xbd9228>
  bddf00: f940129c     	ldr	x28, [x20, #0x20]
  bddf04: 92800009     	mov	x9, #-0x1               ; =-1
  bddf08: 9ac82129     	lsl	x9, x9, x8
  bddf0c: 528000ea     	mov	w10, #0x7               ; =7
  bddf10: f9000fe9     	str	x9, [sp, #0x18]
  bddf14: cb09015a     	sub	x26, x10, x9
  bddf18: f9800384     	prfm	pldl3keep, [x28]
  bddf1c: d3483d00     	ubfx	x0, x8, #8, #8
  bddf20: a9440bf7     	ldp	x23, x2, [sp, #0x40]
  bddf24: f100205f     	cmp	x2, #0x8
  bddf28: 540005c9     	b.ls	0xbddfe0 <_ChromeMain+0xbd8d44>
  bddf2c: f100405f     	cmp	x2, #0x10
  bddf30: 540003c9     	b.ls	0xbddfa8 <_ChromeMain+0xbd8d0c>
  bddf34: f100805f     	cmp	x2, #0x20
  bddf38: 54000808     	b.hi	0xbde038 <_ChromeMain+0xbd8d9c>
  bddf3c: f005ffa8     	adrp	x8, 0xcbd4000 <dyld_stub_binder+0xcbd4000>
  bddf40: 91130108     	add	x8, x8, #0x4c0
  bddf44: f8626908     	ldr	x8, [x8, x2]
  bddf48: ca000108     	eor	x8, x8, x0
  bddf4c: d28e6889     	mov	x9, #0x7344             ; =29508
  bddf50: f2a06e09     	movk	x9, #0x370, lsl #16
  bddf54: f2d145c9     	movk	x9, #0x8a2e, lsl #32
  bddf58: f2e26329     	movk	x9, #0x1319, lsl #48
  bddf5c: a9402eea     	ldp	x10, x11, [x23]
  bddf60: ca090149     	eor	x9, x10, x9
  bddf64: ca08016a     	eor	x10, x11, x8
  bddf68: 9b097d4b     	mul	x11, x10, x9
  bddf6c: 9bc97d49     	umulh	x9, x10, x9
  bddf70: 8b0202ea     	add	x10, x23, x2
  bddf74: d28d912c     	mov	x12, #0x6c89            ; =27785
  bddf78: f2bd89cc     	movk	x12, #0xec4e, lsl #16
  bddf7c: f2df530c     	movk	x12, #0xfa98, lsl #32
  bddf80: f2e105cc     	movk	x12, #0x82e, lsl #48
  bddf84: a97f294d     	ldp	x13, x10, [x10, #-0x10]
  bddf88: ca0c01ac     	eor	x12, x13, x12
  bddf8c: ca080148     	eor	x8, x10, x8
  bddf90: 9b0c7d0a     	mul	x10, x8, x12
  bddf94: 9bcc7d08     	umulh	x8, x8, x12
  bddf98: ca090108     	eor	x8, x8, x9
  bddf9c: ca0a0169     	eor	x9, x11, x10
