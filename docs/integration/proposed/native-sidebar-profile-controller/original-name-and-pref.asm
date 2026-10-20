
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465dab8: d10283ff     	sub	sp, sp, #0xa0
 465dabc: a90757f6     	stp	x22, x21, [sp, #0x70]
 465dac0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 465dac4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 465dac8: 910243fd     	add	x29, sp, #0x90
 465dacc: aa0003f3     	mov	x19, x0
 465dad0: a93cffbf     	stp	xzr, xzr, [x29, #-0x38]
 465dad4: f81d83bf     	stur	xzr, [x29, #-0x28]
 465dad8: d100e3a8     	sub	x8, x29, #0x38
 465dadc: 940005ff     	bl	0x465f2d8 <_ChromeMain+0x465a03c>
 465dae0: f9426a68     	ldr	x8, [x19, #0x4d0]
 465dae4: f9429d08     	ldr	x8, [x8, #0x538]
 465dae8: f9403500     	ldr	x0, [x8, #0x68]
 465daec: b4000380     	cbz	x0, 0x465db5c <_ChromeMain+0x46588c0>
 465daf0: f9400008     	ldr	x8, [x0]
 465daf4: f940b908     	ldr	x8, [x8, #0x170]
 465daf8: d63f0100     	blr	x8
 465dafc: aa0003f4     	mov	x20, x0
 465db00: b4000300     	cbz	x0, 0x465db60 <_ChromeMain+0x46588c4>
 465db04: f00443e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465db08: 9102fc21     	add	x1, x1, #0xbf
 465db0c: aa1403e0     	mov	x0, x20
 465db10: 52800322     	mov	w2, #0x19               ; =25
 465db14: 96f97c4e     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 465db18: b4000220     	cbz	x0, 0x465db5c <_ChromeMain+0x46588c0>
 465db1c: f00443e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465db20: 9102fc21     	add	x1, x1, #0xbf
 465db24: aa1403e0     	mov	x0, x20
 465db28: 52800322     	mov	w2, #0x19               ; =25
 465db2c: 96f2a275     	bl	0x306500 <_ChromeMain+0x301264>
 465db30: aa0003f4     	mov	x20, x0
 465db34: 1400000b     	b	0x465db60 <_ChromeMain+0x46588c4>
 465db38: a97c8ba1     	ldp	x1, x2, [x29, #-0x38]
 465db3c: 910103e0     	add	x0, sp, #0x40
 465db40: 96e7a424     	bl	0x46bd0 <_ChromeMain+0x41934>
 465db44: 34000354     	cbz	w20, 0x465dbac <_ChromeMain+0x4658910>
 465db48: 1400000f     	b	0x465db84 <_ChromeMain+0x46588e8>
 465db4c: a97c8ba1     	ldp	x1, x2, [x29, #-0x38]
 465db50: 910083e0     	add	x0, sp, #0x20
 465db54: 96e7a41f     	bl	0x46bd0 <_ChromeMain+0x41934>
 465db58: 1400002c     	b	0x465dc08 <_ChromeMain+0x465896c>
 465db5c: 52800014     	mov	w20, #0x0               ; =0
 465db60: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 465db64: f9002bff     	str	xzr, [sp, #0x50]
 465db68: 38ddf3a8     	ldursb	w8, [x29, #-0x21]
 465db6c: 37fffe68     	tbnz	w8, #0x1f, 0x465db38 <_ChromeMain+0x465889c>
 465db70: 3cdc83a0     	ldur	q0, [x29, #-0x38]
 465db74: 3d8013e0     	str	q0, [sp, #0x40]
 465db78: f85d83a8     	ldur	x8, [x29, #-0x28]
 465db7c: f9002be8     	str	x8, [sp, #0x50]
 465db80: 34000174     	cbz	w20, 0x465dbac <_ChromeMain+0x4658910>
 465db84: 39415fe8     	ldrb	w8, [sp, #0x57]
 465db88: f94027e9     	ldr	x9, [sp, #0x48]
 465db8c: 7219011f     	tst	w8, #0x80
 465db90: 9a881128     	csel	x8, x9, x8, ne
 465db94: b40000c8     	cbz	x8, 0x465dbac <_ChromeMain+0x4658910>
 465db98: d004c941     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 465db9c: 913ac821     	add	x1, x1, #0xeb2
 465dba0: 910103e0     	add	x0, sp, #0x40
 465dba4: 52800102     	mov	w2, #0x8                ; =8
 465dba8: 9716e210     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 465dbac: f9428e60     	ldr	x0, [x19, #0x518]
 465dbb0: 389df3a8     	ldursb	x8, [x29, #-0x21]
 465dbb4: d100e3a9     	sub	x9, x29, #0x38
 465dbb8: a97cafaa     	ldp	x10, x11, [x29, #-0x38]
 465dbbc: f100011f     	cmp	x8, #0x0
 465dbc0: 9a894141     	csel	x1, x10, x9, mi
 465dbc4: 7100011f     	cmp	w8, #0x0
 465dbc8: 9a884162     	csel	x2, x11, x8, mi
 465dbcc: f9400008     	ldr	x8, [x0]
 465dbd0: f941f108     	ldr	x8, [x8, #0x3e0]
 465dbd4: d63f0100     	blr	x8
 465dbd8: f9428e60     	ldr	x0, [x19, #0x518]
 465dbdc: f9400008     	ldr	x8, [x0]
 465dbe0: f9405108     	ldr	x8, [x8, #0xa0]
 465dbe4: 52800001     	mov	w1, #0x0                ; =0
 465dbe8: d63f0100     	blr	x8
 465dbec: f9428a74     	ldr	x20, [x19, #0x510]
 465dbf0: 38ddf3a8     	ldursb	w8, [x29, #-0x21]
 465dbf4: 37fffac8     	tbnz	w8, #0x1f, 0x465db4c <_ChromeMain+0x46588b0>
 465dbf8: 3cdc83a0     	ldur	q0, [x29, #-0x38]
 465dbfc: 3d800be0     	str	q0, [sp, #0x20]
 465dc00: f85d83a8     	ldur	x8, [x29, #-0x28]
 465dc04: f9001be8     	str	x8, [sp, #0x30]
 465dc08: 910083e1     	add	x1, sp, #0x20
 465dc0c: aa1403e0     	mov	x0, x20
 465dc10: 97fca96d     	bl	0x45881c4 <_ChromeMain+0x4582f28>
 465dc14: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 465dc18: 36f800a8     	tbz	w8, #0x1f, 0x465dc2c <_ChromeMain+0x4658990>
 465dc1c: f94013e0     	ldr	x0, [sp, #0x20]
 465dc20: f9401be8     	ldr	x8, [sp, #0x30]
 465dc24: d37ff901     	lsl	x1, x8, #1
 465dc28: 96e6aca4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dc2c: 910103e1     	add	x1, sp, #0x40
 465dc30: aa1303e0     	mov	x0, x19
 465dc34: 9707a344     	bl	0x846944 <_ChromeMain+0x8416a8>
 465dc38: f9416674     	ldr	x20, [x19, #0x2c8]
 465dc3c: b4000ad4     	cbz	x20, 0x465dd94 <_ChromeMain+0x4658af8>
 465dc40: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465dc44: 37f809e8     	tbnz	w8, #0x1f, 0x465dd80 <_ChromeMain+0x4658ae4>
 465dc48: 3dc013e0     	ldr	q0, [sp, #0x40]
 465dc4c: 3d8003e0     	str	q0, [sp]
 465dc50: f9402be9     	ldr	x9, [sp, #0x50]
 465dc54: f9000be9     	str	x9, [sp, #0x10]
 465dc58: f94027e9     	ldr	x9, [sp, #0x48]
 465dc5c: 92401d0a     	and	x10, x8, #0xff
 465dc60: 7219011f     	tst	w8, #0x80
 465dc64: 9a8a1128     	csel	x8, x9, x10, ne
 465dc68: f100011f     	cmp	x8, #0x0
 465dc6c: 52800028     	mov	w8, #0x1                ; =1
 465dc70: 1a881502     	cinc	w2, w8, eq
 465dc74: 910003e1     	mov	x1, sp
 465dc78: aa1403e0     	mov	x0, x20
 465dc7c: 972c3f44     	bl	0x116d98c <_ChromeMain+0x11686f0>
 465dc80: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 465dc84: 36f800a8     	tbz	w8, #0x1f, 0x465dc98 <_ChromeMain+0x46589fc>
 465dc88: f94003e0     	ldr	x0, [sp]
 465dc8c: f9400be8     	ldr	x8, [sp, #0x10]
 465dc90: d37ff901     	lsl	x1, x8, #1
 465dc94: 96e6ac89     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dc98: f9429274     	ldr	x20, [x19, #0x520]
 465dc9c: 3954c268     	ldrb	w8, [x19, #0x530]
 465dca0: 37000308     	tbnz	w8, #0x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dca4: 3954c668     	ldrb	w8, [x19, #0x531]
 465dca8: 370002c8     	tbnz	w8, #0x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dcac: f9426a68     	ldr	x8, [x19, #0x4d0]
 465dcb0: f9429d08     	ldr	x8, [x8, #0x538]
 465dcb4: f9403500     	ldr	x0, [x8, #0x68]
 465dcb8: b4000240     	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dcbc: f9400008     	ldr	x8, [x0]
 465dcc0: f940b908     	ldr	x8, [x8, #0x170]
 465dcc4: d63f0100     	blr	x8
 465dcc8: b40001c0     	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dccc: aa0003f5     	mov	x21, x0
 465dcd0: f00443e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465dcd4: 9102fc21     	add	x1, x1, #0xbf
 465dcd8: 52800322     	mov	w2, #0x19               ; =25
 465dcdc: 96f97bdc     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 465dce0: b4000100     	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dce4: f00443e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465dce8: 9102fc21     	add	x1, x1, #0xbf
 465dcec: aa1503e0     	mov	x0, x21
 465dcf0: 52800322     	mov	w2, #0x19               ; =25
 465dcf4: 96f2a203     	bl	0x306500 <_ChromeMain+0x301264>
 465dcf8: aa0003e1     	mov	x1, x0
 465dcfc: 14000002     	b	0x465dd04 <_ChromeMain+0x4658a68>
 465dd00: 52800001     	mov	w1, #0x0                ; =0
 465dd04: f9400288     	ldr	x8, [x20]
 465dd08: f9405108     	ldr	x8, [x8, #0xa0]
 465dd0c: aa1403e0     	mov	x0, x20
 465dd10: d63f0100     	blr	x8
 465dd14: 39556268     	ldrb	w8, [x19, #0x558]
 465dd18: 34000048     	cbz	w8, 0x465dd20 <_ChromeMain+0x4658a84>
 465dd1c: 3915627f     	strb	wzr, [x19, #0x558]
 465dd20: f9400268     	ldr	x8, [x19]
 465dd24: f9418508     	ldr	x8, [x8, #0x308]
 465dd28: aa1303e0     	mov	x0, x19
 465dd2c: d63f0100     	blr	x8
 465dd30: aa1303e0     	mov	x0, x19
 465dd34: 52800001     	mov	w1, #0x0                ; =0
 465dd38: 96ff49cf     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465dd3c: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 465dd40: 36f800a8     	tbz	w8, #0x1f, 0x465dd54 <_ChromeMain+0x4658ab8>
 465dd44: f94023e0     	ldr	x0, [sp, #0x40]
 465dd48: f9402be8     	ldr	x8, [sp, #0x50]
 465dd4c: d37ff901     	lsl	x1, x8, #1
 465dd50: 96e6ac5a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dd54: 38ddf3a8     	ldursb	w8, [x29, #-0x21]
 465dd58: 36f800a8     	tbz	w8, #0x1f, 0x465dd6c <_ChromeMain+0x4658ad0>
 465dd5c: f85c83a0     	ldur	x0, [x29, #-0x38]
 465dd60: f85d83a8     	ldur	x8, [x29, #-0x28]
 465dd64: d37ff901     	lsl	x1, x8, #1
 465dd68: 96e6ac54     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dd6c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 465dd70: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 465dd74: a94757f6     	ldp	x22, x21, [sp, #0x70]
 465dd78: 910283ff     	add	sp, sp, #0xa0
 465dd7c: d65f03c0     	ret
 465dd80: a9440be1     	ldp	x1, x2, [sp, #0x40]
 465dd84: 910003e0     	mov	x0, sp
 465dd88: 96e7a392     	bl	0x46bd0 <_ChromeMain+0x41934>
 465dd8c: 39415fe8     	ldrb	w8, [sp, #0x57]
 465dd90: 17ffffb2     	b	0x465dc58 <_ChromeMain+0x46589bc>
 465dd94: 972220db     	bl	0xee6100 <_ChromeMain+0xee0e64>
 465dd98: 35000180     	cbnz	w0, 0x465ddc8 <_ChromeMain+0x4658b2c>
 465dd9c: aa1303e0     	mov	x0, x19
 465dda0: 9732022d     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 465dda4: aa0003f4     	mov	x20, x0
 465dda8: f9416660     	ldr	x0, [x19, #0x2c8]
 465ddac: f9016674     	str	x20, [x19, #0x2c8]
 465ddb0: b4fff480     	cbz	x0, 0x465dc40 <_ChromeMain+0x46589a4>
 465ddb4: f9400008     	ldr	x8, [x0]
 465ddb8: f9400508     	ldr	x8, [x8, #0x8]
 465ddbc: d63f0100     	blr	x8
 465ddc0: f9416674     	ldr	x20, [x19, #0x2c8]
 465ddc4: 17ffff9f     	b	0x465dc40 <_ChromeMain+0x46589a4>
 465ddc8: 52803600     	mov	w0, #0x1b0              ; =432
 465ddcc: 96e6c567     	bl	0xf368 <_ChromeMain+0xa0cc>
 465ddd0: aa0003f4     	mov	x20, x0
 465ddd4: aa1303e1     	mov	x1, x19
 465ddd8: 97221f6a     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 465dddc: 17fffff3     	b	0x465dda8 <_ChromeMain+0x4658b0c>
 465dde0: d503201f     	nop
 465dde4: d503201f     	nop
 465dde8: d503201f     	nop
 465ddec: d503201f     	nop
 465ddf0: d503201f     	nop
 465ddf4: d503201f     	nop
 465ddf8: d503201f     	nop
 465ddfc: d503201f     	nop
 465de00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465de04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465de08: 910043fd     	add	x29, sp, #0x10
 465de0c: aa0003f3     	mov	x19, x0
 465de10: f9410014     	ldr	x20, [x0, #0x200]
 465de14: f9428000     	ldr	x0, [x0, #0x500]
 465de18: b40002e0     	cbz	x0, 0x465de74 <_ChromeMain+0x4658bd8>
 465de1c: 90048441     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 465de20: 91047021     	add	x1, x1, #0x11c
 465de24: 9705df97     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 465de28: 52800408     	mov	w8, #0x20               ; =32
 465de2c: cb408108     	sub	x8, x8, x0, lsr #32
 465de30: 0b487d08     	add	w8, w8, w8, lsr #31
 465de34: 13017d09     	asr	w9, w8, #1
 465de38: 3954c268     	ldrb	w8, [x19, #0x530]
 465de3c: 35000208     	cbnz	w8, 0x465de7c <_ChromeMain+0x4658be0>
 465de40: 3954ca68     	ldrb	w8, [x19, #0x532]
 465de44: b21f07e9     	mov	x9, #0x600000006        ; =25769803782
 465de48: d28000cb     	mov	x11, #0x6               ; =6
 465de4c: f2c000eb     	movk	x11, #0x7, lsl #32
 465de50: 528000aa     	mov	w10, #0x5               ; =5
 465de54: 5280010c     	mov	w12, #0x8               ; =8
 465de58: 7100011f     	cmp	w8, #0x0
 465de5c: 1a8a118a     	csel	w10, w12, w10, ne
 465de60: 9a891168     	csel	x8, x11, x9, ne
 465de64: d360fd0b     	lsr	x11, x8, #32
 465de68: 528000c9     	mov	w9, #0x6                ; =6
 465de6c: 528000cc     	mov	w12, #0x6               ; =6
 465de70: 1400000b     	b	0x465de9c <_ChromeMain+0x4658c00>
 465de74: 528000c9     	mov	w9, #0x6                ; =6
 465de78: 17fffff0     	b	0x465de38 <_ChromeMain+0x4658b9c>
 465de7c: 531f7928     	lsl	w8, w9, #1
 465de80: 6b090108     	subs	w8, w8, w9
 465de84: 131f7d0a     	asr	w10, w8, #31
 465de88: 5201014a     	eor	w10, w10, #0x80000000
 465de8c: 1a88614b     	csel	w11, w10, w8, vs
 465de90: aa0b8168     	orr	x8, x11, x11, lsl #32
 465de94: aa0903ea     	mov	x10, x9
 465de98: aa0b03ec     	mov	x12, x11
 465de9c: b945426d     	ldr	w13, [x19, #0x540]
 465dea0: 6b0901bf     	cmp	w13, w9
 465dea4: 54000141     	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465dea8: b945466d     	ldr	w13, [x19, #0x544]
 465deac: 6b0a01bf     	cmp	w13, w10
 465deb0: 540000e1     	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465deb4: b9454a6d     	ldr	w13, [x19, #0x548]
 465deb8: 6b0c01bf     	cmp	w13, w12
 465debc: 54000081     	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465dec0: b9454e6c     	ldr	w12, [x19, #0x54c]
 465dec4: 6b0b019f     	cmp	w12, w11
 465dec8: 54000460     	b.eq	0x465df54 <_ChromeMain+0x4658cb8>
 465decc: 2a0903eb     	mov	w11, w9
 465ded0: aa0a816b     	orr	x11, x11, x10, lsl #32
 465ded4: f902a26b     	str	x11, [x19, #0x540]
 465ded8: f902a668     	str	x8, [x19, #0x548]
 465dedc: b940fa8c     	ldr	w12, [x20, #0xf8]
 465dee0: 6b09019f     	cmp	w12, w9
 465dee4: 540002e1     	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465dee8: b940fe89     	ldr	w9, [x20, #0xfc]
 465deec: 6b0a013f     	cmp	w9, w10
 465def0: 54000281     	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465def4: b9410289     	ldr	w9, [x20, #0x100]
 465def8: 6b08013f     	cmp	w9, w8
 465defc: 54000221     	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465df00: b9410689     	ldr	w9, [x20, #0x104]
 465df04: d360fd0a     	lsr	x10, x8, #32
 465df08: 6b0a013f     	cmp	w9, w10
 465df0c: 540001a1     	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465df10: 39556268     	ldrb	w8, [x19, #0x558]
 465df14: 34000048     	cbz	w8, 0x465df1c <_ChromeMain+0x4658c80>
 465df18: 3915627f     	strb	wzr, [x19, #0x558]
 465df1c: f9400268     	ldr	x8, [x19]
 465df20: f9418508     	ldr	x8, [x8, #0x308]
 465df24: aa1303e0     	mov	x0, x19
 465df28: d63f0100     	blr	x8
 465df2c: aa1303e0     	mov	x0, x19
 465df30: 52800001     	mov	w1, #0x0                ; =0
 465df34: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465df38: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465df3c: 16ff494e     	b	0x630474 <_ChromeMain+0x62b1d8>
 465df40: a90fa28b     	stp	x11, x8, [x20, #0xf8]
 465df44: aa1403e0     	mov	x0, x20
 465df48: 52800021     	mov	w1, #0x1                ; =1
 465df4c: 97501cd9     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 465df50: 17fffff0     	b	0x465df10 <_ChromeMain+0x4658c74>
 465df54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465df58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465df5c: d65f03c0     	ret
 465df60: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 465df64: a9014ff4     	stp	x20, x19, [sp, #0x10]
 465df68: a9027bfd     	stp	x29, x30, [sp, #0x20]
 465df6c: 910083fd     	add	x29, sp, #0x20
 465df70: aa0003f3     	mov	x19, x0
 465df74: 9116a000     	add	x0, x0, #0x5a8
 465df78: 96f907af     	bl	0x49fe34 <_ChromeMain+0x49ab98>
 465df7c: f942ea60     	ldr	x0, [x19, #0x5d0]
 465df80: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465df84: b0052ab5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465df88: f94046a9     	ldr	x9, [x21, #0x88]
 465df8c: eb09011f     	cmp	x8, x9
 465df90: 54000041     	b.ne	0x465df98 <_ChromeMain+0x4658cfc>
 465df94: 96e722ac     	bl	0x26a44 <_ChromeMain+0x217a8>
 465df98: f902ea7f     	str	xzr, [x19, #0x5d0]
 465df9c: f9426a68     	ldr	x8, [x19, #0x4d0]
 465dfa0: f9429d08     	ldr	x8, [x8, #0x538]
 465dfa4: f9403500     	ldr	x0, [x8, #0x68]
 465dfa8: b4000060     	cbz	x0, 0x465dfb4 <_ChromeMain+0x4658d18>
 465dfac: 39412008     	ldrb	w8, [x0, #0x48]
 465dfb0: 360000a8     	tbz	w8, #0x0, 0x465dfc4 <_ChromeMain+0x4658d28>
 465dfb4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465dfb8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465dfbc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465dfc0: d65f03c0     	ret
 465dfc4: f9400008     	ldr	x8, [x0]
 465dfc8: f940b508     	ldr	x8, [x8, #0x168]
 465dfcc: d63f0100     	blr	x8
 465dfd0: aa0003f4     	mov	x20, x0
 465dfd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465dfd8: f94046a9     	ldr	x9, [x21, #0x88]
 465dfdc: eb09011f     	cmp	x8, x9
 465dfe0: 54000061     	b.ne	0x465dfec <_ChromeMain+0x4658d50>
 465dfe4: aa1403e0     	mov	x0, x20
 465dfe8: 96e6d8c5     	bl	0x142fc <_ChromeMain+0xf060>
 465dfec: f942ea60     	ldr	x0, [x19, #0x5d0]
 465dff0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465dff4: f94046a9     	ldr	x9, [x21, #0x88]
 465dff8: eb09011f     	cmp	x8, x9
 465dffc: 54000580     	b.eq	0x465e0ac <_ChromeMain+0x4658e10>
 465e000: f902ea74     	str	x20, [x19, #0x5d0]
 465e004: 925e7668     	and	x8, x19, #0xfffffffc00000000
 465e008: f94046a9     	ldr	x9, [x21, #0x88]
 465e00c: eb09011f     	cmp	x8, x9
 465e010: 54000061     	b.ne	0x465e01c <_ChromeMain+0x4658d80>
 465e014: aa1303e0     	mov	x0, x19
 465e018: 96e6d8b9     	bl	0x142fc <_ChromeMain+0xf060>
 465e01c: 52800700     	mov	w0, #0x38               ; =56
 465e020: 96e6c4d2     	bl	0xf368 <_ChromeMain+0xa0cc>
 465e024: 52800035     	mov	w21, #0x1               ; =1
 465e028: b9000015     	str	w21, [x0]
 465e02c: f0ffc6c8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 465e030: 913a0108     	add	x8, x8, #0xe80
 465e034: f0ff91c9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 465e038: 912d0129     	add	x9, x9, #0xb40
 465e03c: a900a408     	stp	x8, x9, [x0, #0x8]
 465e040: f0fef7f6     	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 465e044: 912c02d6     	add	x22, x22, #0xb00
 465e048: 1000aec8     	adr	x8, 0x465f620 <_ChromeMain+0x465a384>
 465e04c: d503201f     	nop
 465e050: a901a016     	stp	x22, x8, [x0, #0x18]
 465e054: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 465e058: b40002e0     	cbz	x0, 0x465e0b4 <_ChromeMain+0x4658e18>
 465e05c: aa0003f4     	mov	x20, x0
 465e060: 52800600     	mov	w0, #0x30               ; =48
 465e064: 96e6c4c1     	bl	0xf368 <_ChromeMain+0xa0cc>
 465e068: aa0003e3     	mov	x3, x0
 465e06c: b9000015     	str	w21, [x0]
 465e070: d0fef528     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 465e074: 91117108     	add	x8, x8, #0x45c
 465e078: d0ff91c9     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 465e07c: 91070129     	add	x9, x9, #0x1c0
 465e080: a900a408     	stp	x8, x9, [x0, #0x8]
 465e084: f9000c16     	str	x22, [x0, #0x18]
 465e088: f9001414     	str	x20, [x0, #0x28]
 465e08c: d00443e1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465e090: 9102fc21     	add	x1, x1, #0xbf
 465e094: 9116a260     	add	x0, x19, #0x5a8
 465e098: 52800322     	mov	w2, #0x19               ; =25
 465e09c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465e0a0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465e0a4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465e0a8: 172a32e2     	b	0x10eac30 <_ChromeMain+0x10e5994>
 465e0ac: 96e72266     	bl	0x26a44 <_ChromeMain+0x217a8>
 465e0b0: 17ffffd4     	b	0x465e000 <_ChromeMain+0x4658d64>
 465e0b4: d2800003     	mov	x3, #0x0                ; =0
 465e0b8: 17fffff5     	b	0x465e08c <_ChromeMain+0x4658df0>
