
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465dab8:      	sub	sp, sp, #0xa0
 465dabc:      	stp	x22, x21, [sp, #0x70]
 465dac0:      	stp	x20, x19, [sp, #0x80]
 465dac4:      	stp	x29, x30, [sp, #0x90]
 465dac8:      	add	x29, sp, #0x90
 465dacc:      	mov	x19, x0
 465dad0:      	stp	xzr, xzr, [x29, #-0x38]
 465dad4:      	stur	xzr, [x29, #-0x28]
 465dad8:      	sub	x8, x29, #0x38
 465dadc:      	bl	0x465f2d8 <_ChromeMain+0x465a03c>
 465dae0:      	ldr	x8, [x19, #0x4d0]
 465dae4:      	ldr	x8, [x8, #0x538]
 465dae8:      	ldr	x0, [x8, #0x68]
 465daec:      	cbz	x0, 0x465db5c <_ChromeMain+0x46588c0>
 465daf0:      	ldr	x8, [x0]
 465daf4:      	ldr	x8, [x8, #0x170]
 465daf8:      	blr	x8
 465dafc:      	mov	x20, x0
 465db00:      	cbz	x0, 0x465db60 <_ChromeMain+0x46588c4>
 465db04:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465db08:      	add	x1, x1, #0xbf
 465db0c:      	mov	x0, x20
 465db10:      	mov	w2, #0x19               ; =25
 465db14:      	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 465db18:      	cbz	x0, 0x465db5c <_ChromeMain+0x46588c0>
 465db1c:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465db20:      	add	x1, x1, #0xbf
 465db24:      	mov	x0, x20
 465db28:      	mov	w2, #0x19               ; =25
 465db2c:      	bl	0x306500 <_ChromeMain+0x301264>
 465db30:      	mov	x20, x0
 465db34:      	b	0x465db60 <_ChromeMain+0x46588c4>
 465db38:      	ldp	x1, x2, [x29, #-0x38]
 465db3c:      	add	x0, sp, #0x40
 465db40:      	bl	0x46bd0 <_ChromeMain+0x41934>
 465db44:      	cbz	w20, 0x465dbac <_ChromeMain+0x4658910>
 465db48:      	b	0x465db84 <_ChromeMain+0x46588e8>
 465db4c:      	ldp	x1, x2, [x29, #-0x38]
 465db50:      	add	x0, sp, #0x20
 465db54:      	bl	0x46bd0 <_ChromeMain+0x41934>
 465db58:      	b	0x465dc08 <_ChromeMain+0x465896c>
 465db5c:      	mov	w20, #0x0               ; =0
 465db60:      	stp	xzr, xzr, [sp, #0x40]
 465db64:      	str	xzr, [sp, #0x50]
 465db68:      	ldursb	w8, [x29, #-0x21]
 465db6c:      	tbnz	w8, #0x1f, 0x465db38 <_ChromeMain+0x465889c>
 465db70:      	ldur	q0, [x29, #-0x38]
 465db74:      	str	q0, [sp, #0x40]
 465db78:      	ldur	x8, [x29, #-0x28]
 465db7c:      	str	x8, [sp, #0x50]
 465db80:      	cbz	w20, 0x465dbac <_ChromeMain+0x4658910>
 465db84:      	ldrb	w8, [sp, #0x57]
 465db88:      	ldr	x9, [sp, #0x48]
 465db8c:      	tst	w8, #0x80
 465db90:      	csel	x8, x9, x8, ne
 465db94:      	cbz	x8, 0x465dbac <_ChromeMain+0x4658910>
 465db98:      	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 465db9c:      	add	x1, x1, #0xeb2
 465dba0:      	add	x0, sp, #0x40
 465dba4:      	mov	w2, #0x8                ; =8
 465dba8:      	bl	0xc163e8 <_ChromeMain+0xc1114c>
 465dbac:      	ldr	x0, [x19, #0x518]
 465dbb0:      	ldursb	x8, [x29, #-0x21]
 465dbb4:      	sub	x9, x29, #0x38
 465dbb8:      	ldp	x10, x11, [x29, #-0x38]
 465dbbc:      	cmp	x8, #0x0
 465dbc0:      	csel	x1, x10, x9, mi
 465dbc4:      	cmp	w8, #0x0
 465dbc8:      	csel	x2, x11, x8, mi
 465dbcc:      	ldr	x8, [x0]
 465dbd0:      	ldr	x8, [x8, #0x3e0]
 465dbd4:      	blr	x8
 465dbd8:      	ldr	x0, [x19, #0x518]
 465dbdc:      	ldr	x8, [x0]
 465dbe0:      	ldr	x8, [x8, #0xa0]
 465dbe4:      	mov	w1, #0x0                ; =0
 465dbe8:      	blr	x8
 465dbec:      	ldr	x20, [x19, #0x510]
 465dbf0:      	ldursb	w8, [x29, #-0x21]
 465dbf4:      	tbnz	w8, #0x1f, 0x465db4c <_ChromeMain+0x46588b0>
 465dbf8:      	ldur	q0, [x29, #-0x38]
 465dbfc:      	str	q0, [sp, #0x20]
 465dc00:      	ldur	x8, [x29, #-0x28]
 465dc04:      	str	x8, [sp, #0x30]
 465dc08:      	add	x1, sp, #0x20
 465dc0c:      	mov	x0, x20
 465dc10:      	bl	0x45881c4 <_ChromeMain+0x4582f28>
 465dc14:      	ldrsb	w8, [sp, #0x37]
 465dc18:      	tbz	w8, #0x1f, 0x465dc2c <_ChromeMain+0x4658990>
 465dc1c:      	ldr	x0, [sp, #0x20]
 465dc20:      	ldr	x8, [sp, #0x30]
 465dc24:      	lsl	x1, x8, #1
 465dc28:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dc2c:      	add	x1, sp, #0x40
 465dc30:      	mov	x0, x19
 465dc34:      	bl	0x846944 <_ChromeMain+0x8416a8>
 465dc38:      	ldr	x20, [x19, #0x2c8]
 465dc3c:      	cbz	x20, 0x465dd94 <_ChromeMain+0x4658af8>
 465dc40:      	ldrsb	w8, [sp, #0x57]
 465dc44:      	tbnz	w8, #0x1f, 0x465dd80 <_ChromeMain+0x4658ae4>
 465dc48:      	ldr	q0, [sp, #0x40]
 465dc4c:      	str	q0, [sp]
 465dc50:      	ldr	x9, [sp, #0x50]
 465dc54:      	str	x9, [sp, #0x10]
 465dc58:      	ldr	x9, [sp, #0x48]
 465dc5c:      	and	x10, x8, #0xff
 465dc60:      	tst	w8, #0x80
 465dc64:      	csel	x8, x9, x10, ne
 465dc68:      	cmp	x8, #0x0
 465dc6c:      	mov	w8, #0x1                ; =1
 465dc70:      	cinc	w2, w8, eq
 465dc74:      	mov	x1, sp
 465dc78:      	mov	x0, x20
 465dc7c:      	bl	0x116d98c <_ChromeMain+0x11686f0>
 465dc80:      	ldrsb	w8, [sp, #0x17]
 465dc84:      	tbz	w8, #0x1f, 0x465dc98 <_ChromeMain+0x46589fc>
 465dc88:      	ldr	x0, [sp]
 465dc8c:      	ldr	x8, [sp, #0x10]
 465dc90:      	lsl	x1, x8, #1
 465dc94:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dc98:      	ldr	x20, [x19, #0x520]
 465dc9c:      	ldrb	w8, [x19, #0x530]
 465dca0:      	tbnz	w8, #0x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dca4:      	ldrb	w8, [x19, #0x531]
 465dca8:      	tbnz	w8, #0x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dcac:      	ldr	x8, [x19, #0x4d0]
 465dcb0:      	ldr	x8, [x8, #0x538]
 465dcb4:      	ldr	x0, [x8, #0x68]
 465dcb8:      	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dcbc:      	ldr	x8, [x0]
 465dcc0:      	ldr	x8, [x8, #0x170]
 465dcc4:      	blr	x8
 465dcc8:      	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dccc:      	mov	x21, x0
 465dcd0:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465dcd4:      	add	x1, x1, #0xbf
 465dcd8:      	mov	w2, #0x19               ; =25
 465dcdc:      	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 465dce0:      	cbz	x0, 0x465dd00 <_ChromeMain+0x4658a64>
 465dce4:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465dce8:      	add	x1, x1, #0xbf
 465dcec:      	mov	x0, x21
 465dcf0:      	mov	w2, #0x19               ; =25
 465dcf4:      	bl	0x306500 <_ChromeMain+0x301264>
 465dcf8:      	mov	x1, x0
 465dcfc:      	b	0x465dd04 <_ChromeMain+0x4658a68>
 465dd00:      	mov	w1, #0x0                ; =0
 465dd04:      	ldr	x8, [x20]
 465dd08:      	ldr	x8, [x8, #0xa0]
 465dd0c:      	mov	x0, x20
 465dd10:      	blr	x8
 465dd14:      	ldrb	w8, [x19, #0x558]
 465dd18:      	cbz	w8, 0x465dd20 <_ChromeMain+0x4658a84>
 465dd1c:      	strb	wzr, [x19, #0x558]
 465dd20:      	ldr	x8, [x19]
 465dd24:      	ldr	x8, [x8, #0x308]
 465dd28:      	mov	x0, x19
 465dd2c:      	blr	x8
 465dd30:      	mov	x0, x19
 465dd34:      	mov	w1, #0x0                ; =0
 465dd38:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465dd3c:      	ldrsb	w8, [sp, #0x57]
 465dd40:      	tbz	w8, #0x1f, 0x465dd54 <_ChromeMain+0x4658ab8>
 465dd44:      	ldr	x0, [sp, #0x40]
 465dd48:      	ldr	x8, [sp, #0x50]
 465dd4c:      	lsl	x1, x8, #1
 465dd50:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dd54:      	ldursb	w8, [x29, #-0x21]
 465dd58:      	tbz	w8, #0x1f, 0x465dd6c <_ChromeMain+0x4658ad0>
 465dd5c:      	ldur	x0, [x29, #-0x38]
 465dd60:      	ldur	x8, [x29, #-0x28]
 465dd64:      	lsl	x1, x8, #1
 465dd68:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465dd6c:      	ldp	x29, x30, [sp, #0x90]
 465dd70:      	ldp	x20, x19, [sp, #0x80]
 465dd74:      	ldp	x22, x21, [sp, #0x70]
 465dd78:      	add	sp, sp, #0xa0
 465dd7c:      	ret
 465dd80:      	ldp	x1, x2, [sp, #0x40]
 465dd84:      	mov	x0, sp
 465dd88:      	bl	0x46bd0 <_ChromeMain+0x41934>
 465dd8c:      	ldrb	w8, [sp, #0x57]
 465dd90:      	b	0x465dc58 <_ChromeMain+0x46589bc>
 465dd94:      	bl	0xee6100 <_ChromeMain+0xee0e64>
 465dd98:      	cbnz	w0, 0x465ddc8 <_ChromeMain+0x4658b2c>
 465dd9c:      	mov	x0, x19
 465dda0:      	bl	0x12de654 <_ChromeMain+0x12d93b8>
 465dda4:      	mov	x20, x0
 465dda8:      	ldr	x0, [x19, #0x2c8]
 465ddac:      	str	x20, [x19, #0x2c8]
 465ddb0:      	cbz	x0, 0x465dc40 <_ChromeMain+0x46589a4>
 465ddb4:      	ldr	x8, [x0]
 465ddb8:      	ldr	x8, [x8, #0x8]
 465ddbc:      	blr	x8
 465ddc0:      	ldr	x20, [x19, #0x2c8]
 465ddc4:      	b	0x465dc40 <_ChromeMain+0x46589a4>
 465ddc8:      	mov	w0, #0x1b0              ; =432
 465ddcc:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465ddd0:      	mov	x20, x0
 465ddd4:      	mov	x1, x19
 465ddd8:      	bl	0xee5b80 <_ChromeMain+0xee08e4>
 465dddc:      	b	0x465dda8 <_ChromeMain+0x4658b0c>
 465dde0:      	nop
 465dde4:      	nop
 465dde8:      	nop
 465ddec:      	nop
 465ddf0:      	nop
 465ddf4:      	nop
 465ddf8:      	nop
 465ddfc:      	nop
 465de00:      	stp	x20, x19, [sp, #-0x20]!
 465de04:      	stp	x29, x30, [sp, #0x10]
 465de08:      	add	x29, sp, #0x10
 465de0c:      	mov	x19, x0
 465de10:      	ldr	x20, [x0, #0x200]
 465de14:      	ldr	x0, [x0, #0x500]
 465de18:      	cbz	x0, 0x465de74 <_ChromeMain+0x4658bd8>
 465de1c:      	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 465de20:      	add	x1, x1, #0x11c
 465de24:      	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 465de28:      	mov	w8, #0x20               ; =32
 465de2c:      	sub	x8, x8, x0, lsr #32
 465de30:      	add	w8, w8, w8, lsr #31
 465de34:      	asr	w9, w8, #1
 465de38:      	ldrb	w8, [x19, #0x530]
 465de3c:      	cbnz	w8, 0x465de7c <_ChromeMain+0x4658be0>
 465de40:      	ldrb	w8, [x19, #0x532]
 465de44:      	mov	x9, #0x600000006        ; =25769803782
 465de48:      	mov	x11, #0x6               ; =6
 465de4c:      	movk	x11, #0x7, lsl #32
 465de50:      	mov	w10, #0x5               ; =5
 465de54:      	mov	w12, #0x8               ; =8
 465de58:      	cmp	w8, #0x0
 465de5c:      	csel	w10, w12, w10, ne
 465de60:      	csel	x8, x11, x9, ne
 465de64:      	lsr	x11, x8, #32
 465de68:      	mov	w9, #0x6                ; =6
 465de6c:      	mov	w12, #0x6               ; =6
 465de70:      	b	0x465de9c <_ChromeMain+0x4658c00>
 465de74:      	mov	w9, #0x6                ; =6
 465de78:      	b	0x465de38 <_ChromeMain+0x4658b9c>
 465de7c:      	lsl	w8, w9, #1
 465de80:      	subs	w8, w8, w9
 465de84:      	asr	w10, w8, #31
 465de88:      	eor	w10, w10, #0x80000000
 465de8c:      	csel	w11, w10, w8, vs
 465de90:      	orr	x8, x11, x11, lsl #32
 465de94:      	mov	x10, x9
 465de98:      	mov	x12, x11
 465de9c:      	ldr	w13, [x19, #0x540]
 465dea0:      	cmp	w13, w9
 465dea4:      	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465dea8:      	ldr	w13, [x19, #0x544]
 465deac:      	cmp	w13, w10
 465deb0:      	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465deb4:      	ldr	w13, [x19, #0x548]
 465deb8:      	cmp	w13, w12
 465debc:      	b.ne	0x465decc <_ChromeMain+0x4658c30>
 465dec0:      	ldr	w12, [x19, #0x54c]
 465dec4:      	cmp	w12, w11
 465dec8:      	b.eq	0x465df54 <_ChromeMain+0x4658cb8>
 465decc:      	mov	w11, w9
 465ded0:      	orr	x11, x11, x10, lsl #32
 465ded4:      	str	x11, [x19, #0x540]
 465ded8:      	str	x8, [x19, #0x548]
 465dedc:      	ldr	w12, [x20, #0xf8]
 465dee0:      	cmp	w12, w9
 465dee4:      	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465dee8:      	ldr	w9, [x20, #0xfc]
 465deec:      	cmp	w9, w10
 465def0:      	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465def4:      	ldr	w9, [x20, #0x100]
 465def8:      	cmp	w9, w8
 465defc:      	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465df00:      	ldr	w9, [x20, #0x104]
 465df04:      	lsr	x10, x8, #32
 465df08:      	cmp	w9, w10
 465df0c:      	b.ne	0x465df40 <_ChromeMain+0x4658ca4>
 465df10:      	ldrb	w8, [x19, #0x558]
 465df14:      	cbz	w8, 0x465df1c <_ChromeMain+0x4658c80>
 465df18:      	strb	wzr, [x19, #0x558]
 465df1c:      	ldr	x8, [x19]
 465df20:      	ldr	x8, [x8, #0x308]
 465df24:      	mov	x0, x19
 465df28:      	blr	x8
 465df2c:      	mov	x0, x19
 465df30:      	mov	w1, #0x0                ; =0
 465df34:      	ldp	x29, x30, [sp, #0x10]
 465df38:      	ldp	x20, x19, [sp], #0x20
 465df3c:      	b	0x630474 <_ChromeMain+0x62b1d8>
 465df40:      	stp	x11, x8, [x20, #0xf8]
 465df44:      	mov	x0, x20
 465df48:      	mov	w1, #0x1                ; =1
 465df4c:      	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 465df50:      	b	0x465df10 <_ChromeMain+0x4658c74>
 465df54:      	ldp	x29, x30, [sp, #0x10]
 465df58:      	ldp	x20, x19, [sp], #0x20
 465df5c:      	ret
 465df60:      	stp	x22, x21, [sp, #-0x30]!
 465df64:      	stp	x20, x19, [sp, #0x10]
 465df68:      	stp	x29, x30, [sp, #0x20]
 465df6c:      	add	x29, sp, #0x20
 465df70:      	mov	x19, x0
 465df74:      	add	x0, x0, #0x5a8
 465df78:      	bl	0x49fe34 <_ChromeMain+0x49ab98>
 465df7c:      	ldr	x0, [x19, #0x5d0]
 465df80:      	and	x8, x0, #0xfffffffc00000000
 465df84:      	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465df88:      	ldr	x9, [x21, #0x88]
 465df8c:      	cmp	x8, x9
 465df90:      	b.ne	0x465df98 <_ChromeMain+0x4658cfc>
 465df94:      	bl	0x26a44 <_ChromeMain+0x217a8>
 465df98:      	str	xzr, [x19, #0x5d0]
 465df9c:      	ldr	x8, [x19, #0x4d0]
 465dfa0:      	ldr	x8, [x8, #0x538]
 465dfa4:      	ldr	x0, [x8, #0x68]
 465dfa8:      	cbz	x0, 0x465dfb4 <_ChromeMain+0x4658d18>
 465dfac:      	ldrb	w8, [x0, #0x48]
 465dfb0:      	tbz	w8, #0x0, 0x465dfc4 <_ChromeMain+0x4658d28>
 465dfb4:      	ldp	x29, x30, [sp, #0x20]
 465dfb8:      	ldp	x20, x19, [sp, #0x10]
 465dfbc:      	ldp	x22, x21, [sp], #0x30
 465dfc0:      	ret
 465dfc4:      	ldr	x8, [x0]
 465dfc8:      	ldr	x8, [x8, #0x168]
 465dfcc:      	blr	x8
 465dfd0:      	mov	x20, x0
 465dfd4:      	and	x8, x0, #0xfffffffc00000000
 465dfd8:      	ldr	x9, [x21, #0x88]
 465dfdc:      	cmp	x8, x9
 465dfe0:      	b.ne	0x465dfec <_ChromeMain+0x4658d50>
 465dfe4:      	mov	x0, x20
 465dfe8:      	bl	0x142fc <_ChromeMain+0xf060>
 465dfec:      	ldr	x0, [x19, #0x5d0]
 465dff0:      	and	x8, x0, #0xfffffffc00000000
 465dff4:      	ldr	x9, [x21, #0x88]
 465dff8:      	cmp	x8, x9
 465dffc:      	b.eq	0x465e0ac <_ChromeMain+0x4658e10>
 465e000:      	str	x20, [x19, #0x5d0]
 465e004:      	and	x8, x19, #0xfffffffc00000000
 465e008:      	ldr	x9, [x21, #0x88]
 465e00c:      	cmp	x8, x9
 465e010:      	b.ne	0x465e01c <_ChromeMain+0x4658d80>
 465e014:      	mov	x0, x19
 465e018:      	bl	0x142fc <_ChromeMain+0xf060>
 465e01c:      	mov	w0, #0x38               ; =56
 465e020:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e024:      	mov	w21, #0x1               ; =1
 465e028:      	str	w21, [x0]
 465e02c:      	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 465e030:      	add	x8, x8, #0xe80
 465e034:      	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 465e038:      	add	x9, x9, #0xb40
 465e03c:      	stp	x8, x9, [x0, #0x8]
 465e040:      	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 465e044:      	add	x22, x22, #0xb00
 465e048:      	adr	x8, 0x465f620 <_ChromeMain+0x465a384>
 465e04c:      	nop
 465e050:      	stp	x22, x8, [x0, #0x18]
 465e054:      	stp	xzr, x19, [x0, #0x28]
 465e058:      	cbz	x0, 0x465e0b4 <_ChromeMain+0x4658e18>
 465e05c:      	mov	x20, x0
 465e060:      	mov	w0, #0x30               ; =48
 465e064:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465e068:      	mov	x3, x0
 465e06c:      	str	w21, [x0]
 465e070:      	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 465e074:      	add	x8, x8, #0x45c
 465e078:      	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 465e07c:      	add	x9, x9, #0x1c0
 465e080:      	stp	x8, x9, [x0, #0x8]
 465e084:      	str	x22, [x0, #0x18]
 465e088:      	str	x20, [x0, #0x28]
 465e08c:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 465e090:      	add	x1, x1, #0xbf
 465e094:      	add	x0, x19, #0x5a8
 465e098:      	mov	w2, #0x19               ; =25
 465e09c:      	ldp	x29, x30, [sp, #0x20]
 465e0a0:      	ldp	x20, x19, [sp, #0x10]
 465e0a4:      	ldp	x22, x21, [sp], #0x30
 465e0a8:      	b	0x10eac30 <_ChromeMain+0x10e5994>
 465e0ac:      	bl	0x26a44 <_ChromeMain+0x217a8>
 465e0b0:      	b	0x465e000 <_ChromeMain+0x4658d64>
 465e0b4:      	mov	x3, #0x0                ; =0
 465e0b8:      	b	0x465e08c <_ChromeMain+0x4658df0>
