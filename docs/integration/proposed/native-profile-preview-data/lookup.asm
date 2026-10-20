
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 455ca00: d10283ff     	sub	sp, sp, #0xa0
 455ca04: a9046ffc     	stp	x28, x27, [sp, #0x40]
 455ca08: a90567fa     	stp	x26, x25, [sp, #0x50]
 455ca0c: a9065ff8     	stp	x24, x23, [sp, #0x60]
 455ca10: a90757f6     	stp	x22, x21, [sp, #0x70]
 455ca14: a9084ff4     	stp	x20, x19, [sp, #0x80]
 455ca18: a9097bfd     	stp	x29, x30, [sp, #0x90]
 455ca1c: 910243fd     	add	x29, sp, #0x90
 455ca20: aa0803f3     	mov	x19, x8
 455ca24: 39405c28     	ldrb	w8, [x1, #0x17]
 455ca28: f9400429     	ldr	x9, [x1, #0x8]
 455ca2c: 7219011f     	tst	w8, #0x80
 455ca30: 9a881128     	csel	x8, x9, x8, ne
 455ca34: b40004e8     	cbz	x8, 0x455cad0 <_ChromeMain+0x4557834>
 455ca38: aa0103f5     	mov	x21, x1
 455ca3c: aa0003f4     	mov	x20, x0
 455ca40: f9403400     	ldr	x0, [x0, #0x68]
 455ca44: b4000680     	cbz	x0, 0x455cb14 <_ChromeMain+0x4557878>
 455ca48: f9400008     	ldr	x8, [x0]
 455ca4c: f940a508     	ldr	x8, [x8, #0x148]
 455ca50: d63f0100     	blr	x8
 455ca54: b4000600     	cbz	x0, 0x455cb14 <_ChromeMain+0x4557878>
 455ca58: f9400008     	ldr	x8, [x0]
 455ca5c: f9401909     	ldr	x9, [x8, #0x30]
 455ca60: 910083e8     	add	x8, sp, #0x20
 455ca64: d63f0120     	blr	x9
 455ca68: 910083e0     	add	x0, sp, #0x20
 455ca6c: aa1503e1     	mov	x1, x21
 455ca70: 972dbda5     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 455ca74: 360004c0     	tbz	w0, #0x0, 0x455cb0c <_ChromeMain+0x4557870>
 455ca78: f9404696     	ldr	x22, [x20, #0x88]
 455ca7c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 455ca80: 37f800c8     	tbnz	w8, #0x1f, 0x455ca98 <_ChromeMain+0x45577fc>
 455ca84: b4000496     	cbz	x22, 0x455cb14 <_ChromeMain+0x4557878>
 455ca88: f9404680     	ldr	x0, [x20, #0x88]
 455ca8c: aa1303e8     	mov	x8, x19
 455ca90: 97ffefc8     	bl	0x45589b0 <_ChromeMain+0x4553714>
 455ca94: 14000011     	b	0x455cad8 <_ChromeMain+0x455783c>
 455ca98: f94013e0     	ldr	x0, [sp, #0x20]
 455ca9c: f9401be8     	ldr	x8, [sp, #0x30]
 455caa0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 455caa4: 96eab105     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455caa8: b5ffff16     	cbnz	x22, 0x455ca88 <_ChromeMain+0x45577ec>
 455caac: 1400001a     	b	0x455cb14 <_ChromeMain+0x4557878>
 455cab0: f9400268     	ldr	x8, [x19]
 455cab4: cb0802a8     	sub	x8, x21, x8
 455cab8: 8b180108     	add	x8, x8, x24
 455cabc: 9345fd08     	asr	x8, x8, #5
 455cac0: f9000668     	str	x8, [x19, #0x8]
 455cac4: b94052c8     	ldr	w8, [x22, #0x50]
 455cac8: b9001a68     	str	w8, [x19, #0x18]
 455cacc: 14000003     	b	0x455cad8 <_ChromeMain+0x455783c>
 455cad0: 6f00e400     	movi.2d	v0, #0000000000000000
 455cad4: ad000260     	stp	q0, q0, [x19]
 455cad8: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 455cadc: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 455cae0: a94757f6     	ldp	x22, x21, [sp, #0x70]
 455cae4: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 455cae8: a94567fa     	ldp	x26, x25, [sp, #0x50]
 455caec: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 455caf0: 910283ff     	add	sp, sp, #0xa0
 455caf4: d65f03c0     	ret
 455caf8: f94013e0     	ldr	x0, [sp, #0x20]
 455cafc: f9401be8     	ldr	x8, [sp, #0x30]
 455cb00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 455cb04: 96eab0ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455cb08: 14000003     	b	0x455cb14 <_ChromeMain+0x4557878>
 455cb0c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 455cb10: 37ffff48     	tbnz	w8, #0x1f, 0x455caf8 <_ChromeMain+0x455785c>
 455cb14: d0054c56     	adrp	x22, 0xeee6000 <dyld_stub_binder+0xeee6000>
 455cb18: f9467ec0     	ldr	x0, [x22, #0xcf8]
 455cb1c: b4000400     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb20: 97530c16     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 455cb24: b40003c0     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb28: f9467ec0     	ldr	x0, [x22, #0xcf8]
 455cb2c: 97530c13     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 455cb30: aa1503e1     	mov	x1, x21
 455cb34: 978922dc     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 455cb38: b4000320     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb3c: f9400008     	ldr	x8, [x0]
 455cb40: f940a508     	ldr	x8, [x8, #0x148]
 455cb44: d63f0100     	blr	x8
 455cb48: b40002a0     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb4c: 976e9e07     	bl	0x2104368 <_ChromeMain+0x20ff0cc>
 455cb50: b4000260     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb54: 6f00e400     	movi.2d	v0, #0000000000000000
 455cb58: ad000260     	stp	q0, q0, [x19]
 455cb5c: a90257f4     	stp	x20, x21, [sp, #0x20]
 455cb60: f9001bf3     	str	x19, [sp, #0x30]
 455cb64: 1000ca42     	adr	x2, 0x455e4ac <_ChromeMain+0x4559210>
 455cb68: d503201f     	nop
 455cb6c: 91002000     	add	x0, x0, #0x8
 455cb70: 910083e1     	add	x1, sp, #0x20
 455cb74: 52800003     	mov	w3, #0x0                ; =0
 455cb78: 52800004     	mov	w4, #0x0                ; =0
 455cb7c: 9721533d     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 455cb80: f9400668     	ldr	x8, [x19, #0x8]
 455cb84: b5fffaa8     	cbnz	x8, 0x455cad8 <_ChromeMain+0x455783c>
 455cb88: f9400260     	ldr	x0, [x19]
 455cb8c: b4000080     	cbz	x0, 0x455cb9c <_ChromeMain+0x4557900>
 455cb90: f9400a68     	ldr	x8, [x19, #0x10]
 455cb94: d37be901     	lsl	x1, x8, #5
 455cb98: 96eab0c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455cb9c: aa1403e0     	mov	x0, x20
 455cba0: aa1503e1     	mov	x1, x21
 455cba4: 940000e4     	bl	0x455cf34 <_ChromeMain+0x4557c98>
 455cba8: eb14001f     	cmp	x0, x20
 455cbac: fa401804     	ccmp	x0, #0x0, #0x4, ne
 455cbb0: 54000060     	b.eq	0x455cbbc <_ChromeMain+0x4557920>
 455cbb4: b9406008     	ldr	w8, [x0, #0x60]
 455cbb8: 34000168     	cbz	w8, 0x455cbe4 <_ChromeMain+0x4557948>
 455cbbc: aa1403f8     	mov	x24, x20
 455cbc0: f8498f17     	ldr	x23, [x24, #0x98]!
 455cbc4: b4000597     	cbz	x23, 0x455cc74 <_ChromeMain+0x45579d8>
 455cbc8: 39805ea8     	ldrsb	x8, [x21, #0x17]
 455cbcc: a9402aa9     	ldp	x9, x10, [x21]
 455cbd0: f100011f     	cmp	x8, #0x0
 455cbd4: 9a954136     	csel	x22, x9, x21, mi
 455cbd8: 7100011f     	cmp	w8, #0x0
 455cbdc: 9a884159     	csel	x25, x10, x8, mi
 455cbe0: 14000015     	b	0x455cc34 <_ChromeMain+0x4557998>
 455cbe4: 3943c008     	ldrb	w8, [x0, #0xf0]
 455cbe8: 34fffea8     	cbz	w8, 0x455cbbc <_ChromeMain+0x4557920>
 455cbec: f9404408     	ldr	x8, [x0, #0x88]
 455cbf0: b4fffe68     	cbz	x8, 0x455cbbc <_ChromeMain+0x4557920>
 455cbf4: 6f00e400     	movi.2d	v0, #0000000000000000
 455cbf8: ad000260     	stp	q0, q0, [x19]
 455cbfc: f9404400     	ldr	x0, [x0, #0x88]
 455cc00: aa1303e8     	mov	x8, x19
 455cc04: 97ffef6b     	bl	0x45589b0 <_ChromeMain+0x4553714>
 455cc08: f9400668     	ldr	x8, [x19, #0x8]
 455cc0c: b5fff668     	cbnz	x8, 0x455cad8 <_ChromeMain+0x455783c>
 455cc10: f9400260     	ldr	x0, [x19]
 455cc14: b4fffd40     	cbz	x0, 0x455cbbc <_ChromeMain+0x4557920>
 455cc18: f9400a68     	ldr	x8, [x19, #0x10]
 455cc1c: d37be901     	lsl	x1, x8, #5
 455cc20: 96eab0a6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455cc24: 17ffffe6     	b	0x455cbbc <_ChromeMain+0x4557920>
 455cc28: 54000223     	b.lo	0x455cc6c <_ChromeMain+0x45579d0>
 455cc2c: f94006f7     	ldr	x23, [x23, #0x8]
 455cc30: b4000237     	cbz	x23, 0x455cc74 <_ChromeMain+0x45579d8>
 455cc34: aa1703e8     	mov	x8, x23
 455cc38: f8420d09     	ldr	x9, [x8, #0x20]!
 455cc3c: 39805d0a     	ldrsb	x10, [x8, #0x17]
 455cc40: f100015f     	cmp	x10, #0x0
 455cc44: 9a884121     	csel	x1, x9, x8, mi
 455cc48: f9400508     	ldr	x8, [x8, #0x8]
 455cc4c: 7100015f     	cmp	w10, #0x0
 455cc50: 9a8a411a     	csel	x26, x8, x10, mi
 455cc54: eb19035f     	cmp	x26, x25
 455cc58: 9a993342     	csel	x2, x26, x25, lo
 455cc5c: aa1603e0     	mov	x0, x22
 455cc60: 94eab300     	bl	0x8009860 <_ChromeMain+0x80045c4>
 455cc64: 340001a0     	cbz	w0, 0x455cc98 <_ChromeMain+0x45579fc>
 455cc68: 36fffe20     	tbz	w0, #0x1f, 0x455cc2c <_ChromeMain+0x4557990>
 455cc6c: f94002f7     	ldr	x23, [x23]
 455cc70: b5fffe37     	cbnz	x23, 0x455cc34 <_ChromeMain+0x4557998>
 455cc74: f84b0e96     	ldr	x22, [x20, #0xb0]!
 455cc78: b4fff2d6     	cbz	x22, 0x455cad0 <_ChromeMain+0x4557834>
 455cc7c: 39805ea8     	ldrsb	x8, [x21, #0x17]
 455cc80: a9402aa9     	ldp	x9, x10, [x21]
 455cc84: f100011f     	cmp	x8, #0x0
 455cc88: 9a954135     	csel	x21, x9, x21, mi
 455cc8c: 7100011f     	cmp	w8, #0x0
 455cc90: 9a884157     	csel	x23, x10, x8, mi
 455cc94: 14000017     	b	0x455ccf0 <_ChromeMain+0x4557a54>
 455cc98: eb1a033f     	cmp	x25, x26
 455cc9c: 54fffc61     	b.ne	0x455cc28 <_ChromeMain+0x455798c>
 455cca0: eb1802ff     	cmp	x23, x24
 455cca4: 54fffe80     	b.eq	0x455cc74 <_ChromeMain+0x45579d8>
 455cca8: 6f00e400     	movi.2d	v0, #0000000000000000
 455ccac: ad000260     	stp	q0, q0, [x19]
 455ccb0: f94026e8     	ldr	x8, [x23, #0x48]
 455ccb4: b4fffe08     	cbz	x8, 0x455cc74 <_ChromeMain+0x45579d8>
 455ccb8: 9100e2e8     	add	x8, x23, #0x38
 455ccbc: a90123f3     	stp	x19, x8, [sp, #0x10]
 455ccc0: f94026e8     	ldr	x8, [x23, #0x48]
 455ccc4: d37ced15     	lsl	x21, x8, #4
 455ccc8: b4fff095     	cbz	x21, 0x455cad8 <_ChromeMain+0x455783c>
 455cccc: f94022f6     	ldr	x22, [x23, #0x40]
 455ccd0: 910043f8     	add	x24, sp, #0x10
 455ccd4: 910023f9     	add	x25, sp, #0x8
 455ccd8: 90052bda     	adrp	x26, 0xead4000 <dyld_stub_binder+0xead4000>
 455ccdc: 912ae35a     	add	x26, x26, #0xab8
 455cce0: 1400004b     	b	0x455ce0c <_ChromeMain+0x4557b70>
 455cce4: 54000223     	b.lo	0x455cd28 <_ChromeMain+0x4557a8c>
 455cce8: f94006d6     	ldr	x22, [x22, #0x8]
 455ccec: b4ffef36     	cbz	x22, 0x455cad0 <_ChromeMain+0x4557834>
 455ccf0: aa1603e8     	mov	x8, x22
 455ccf4: f8420d09     	ldr	x9, [x8, #0x20]!
 455ccf8: 39805d0a     	ldrsb	x10, [x8, #0x17]
 455ccfc: f100015f     	cmp	x10, #0x0
 455cd00: 9a884121     	csel	x1, x9, x8, mi
 455cd04: f9400508     	ldr	x8, [x8, #0x8]
 455cd08: 7100015f     	cmp	w10, #0x0
 455cd0c: 9a8a4118     	csel	x24, x8, x10, mi
 455cd10: eb17031f     	cmp	x24, x23
 455cd14: 9a973302     	csel	x2, x24, x23, lo
 455cd18: aa1503e0     	mov	x0, x21
 455cd1c: 94eab2d1     	bl	0x8009860 <_ChromeMain+0x80045c4>
 455cd20: 340000a0     	cbz	w0, 0x455cd34 <_ChromeMain+0x4557a98>
 455cd24: 36fffe20     	tbz	w0, #0x1f, 0x455cce8 <_ChromeMain+0x4557a4c>
 455cd28: f94002d6     	ldr	x22, [x22]
 455cd2c: b5fffe36     	cbnz	x22, 0x455ccf0 <_ChromeMain+0x4557a54>
 455cd30: 17ffff68     	b	0x455cad0 <_ChromeMain+0x4557834>
 455cd34: eb1802ff     	cmp	x23, x24
 455cd38: 54fffd61     	b.ne	0x455cce4 <_ChromeMain+0x4557a48>
 455cd3c: eb1402df     	cmp	x22, x20
 455cd40: 54ffec80     	b.eq	0x455cad0 <_ChromeMain+0x4557834>
 455cd44: a9007e7f     	stp	xzr, xzr, [x19]
 455cd48: f9000a7f     	str	xzr, [x19, #0x10]
 455cd4c: f94022d9     	ldr	x25, [x22, #0x40]
 455cd50: b4ffebb9     	cbz	x25, 0x455cac4 <_ChromeMain+0x4557828>
 455cd54: d37bff28     	lsr	x8, x25, #59
 455cd58: b5000ec8     	cbnz	x8, 0x455cf30 <_ChromeMain+0x4557c94>
 455cd5c: f9401ed7     	ldr	x23, [x22, #0x38]
 455cd60: d37beb34     	lsl	x20, x25, #5
 455cd64: aa1403e0     	mov	x0, x20
 455cd68: 96eac980     	bl	0xf368 <_ChromeMain+0xa0cc>
 455cd6c: aa0003f5     	mov	x21, x0
 455cd70: d2800018     	mov	x24, #0x0               ; =0
 455cd74: a9007e60     	stp	x0, xzr, [x19]
 455cd78: f9000a79     	str	x25, [x19, #0x10]
 455cd7c: 1400000c     	b	0x455cdac <_ChromeMain+0x4557b10>
 455cd80: 3dc00100     	ldr	q0, [x8]
 455cd84: f9400908     	ldr	x8, [x8, #0x10]
 455cd88: f9000808     	str	x8, [x0, #0x10]
 455cd8c: 3d800000     	str	q0, [x0]
 455cd90: 8b1802a8     	add	x8, x21, x24
 455cd94: 8b1802e9     	add	x9, x23, x24
 455cd98: 79403129     	ldrh	w9, [x9, #0x18]
 455cd9c: 79003109     	strh	w9, [x8, #0x18]
 455cda0: 91008318     	add	x24, x24, #0x20
 455cda4: eb18029f     	cmp	x20, x24
 455cda8: 54ffe840     	b.eq	0x455cab0 <_ChromeMain+0x4557814>
 455cdac: ab1802a0     	adds	x0, x21, x24
 455cdb0: 54000100     	b.eq	0x455cdd0 <_ChromeMain+0x4557b34>
 455cdb4: 8b1802e8     	add	x8, x23, x24
 455cdb8: 39c05d09     	ldrsb	w9, [x8, #0x17]
 455cdbc: 36fffe29     	tbz	w9, #0x1f, 0x455cd80 <_ChromeMain+0x4557ae4>
 455cdc0: 8b1802e8     	add	x8, x23, x24
 455cdc4: a9400901     	ldp	x1, x2, [x8]
 455cdc8: 96eba782     	bl	0x46bd0 <_ChromeMain+0x41934>
 455cdcc: 17fffff1     	b	0x455cd90 <_ChromeMain+0x4557af4>
 455cdd0: d4200020     	brk	#0x1
 455cdd4: 7100051f     	cmp	w8, #0x1
 455cdd8: 54000961     	b.ne	0x455cf04 <_ChromeMain+0x4557c68>
 455cddc: f90007f8     	str	x24, [sp, #0x8]
 455cde0: f94002c1     	ldr	x1, [x22]
 455cde4: 39402028     	ldrb	w8, [x1, #0x8]
 455cde8: f103fd1f     	cmp	x8, #0xff
 455cdec: 540009c0     	b.eq	0x455cf24 <_ChromeMain+0x4557c88>
 455cdf0: f90013f9     	str	x25, [sp, #0x20]
 455cdf4: f8687b48     	ldr	x8, [x26, x8, lsl #3]
 455cdf8: 910083e0     	add	x0, sp, #0x20
 455cdfc: d63f0100     	blr	x8
 455ce00: 910042d6     	add	x22, x22, #0x10
 455ce04: f10042b5     	subs	x21, x21, #0x10
 455ce08: 54000540     	b.eq	0x455ceb0 <_ChromeMain+0x4557c14>
 455ce0c: 394022c8     	ldrb	w8, [x22, #0x8]
 455ce10: 35fffe28     	cbnz	w8, 0x455cdd4 <_ChromeMain+0x4557b38>
 455ce14: f94002c0     	ldr	x0, [x22]
 455ce18: b4ffff40     	cbz	x0, 0x455ce00 <_ChromeMain+0x4557b64>
 455ce1c: f9400bf4     	ldr	x20, [sp, #0x10]
 455ce20: b9400a9b     	ldr	w27, [x20, #0x8]
 455ce24: 910083e8     	add	x8, sp, #0x20
 455ce28: 94dfbdaf     	bl	0x7d4c4e4 <_ChromeMain+0x7d47248>
 455ce2c: 3900e3ff     	strb	wzr, [sp, #0x38]
 455ce30: f9400fe8     	ldr	x8, [sp, #0x18]
 455ce34: b9402508     	ldr	w8, [x8, #0x24]
 455ce38: 6b1b011f     	cmp	w8, w27
 455ce3c: 1a9fd7e8     	cset	w8, gt
 455ce40: 3900e7e8     	strb	w8, [sp, #0x39]
 455ce44: a940a688     	ldp	x8, x9, [x20, #0x8]
 455ce48: eb09011f     	cmp	x8, x9
 455ce4c: 54000540     	b.eq	0x455cef4 <_ChromeMain+0x4557c58>
 455ce50: f9400289     	ldr	x9, [x20]
 455ce54: 8b081528     	add	x8, x9, x8, lsl #5
 455ce58: b4fffbc8     	cbz	x8, 0x455cdd0 <_ChromeMain+0x4557b34>
 455ce5c: 3dc00be0     	ldr	q0, [sp, #0x20]
 455ce60: f9401be9     	ldr	x9, [sp, #0x30]
 455ce64: f9000909     	str	x9, [x8, #0x10]
 455ce68: 3d800100     	str	q0, [x8]
 455ce6c: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 455ce70: f90013ff     	str	xzr, [sp, #0x20]
 455ce74: 794073e9     	ldrh	w9, [sp, #0x38]
 455ce78: 79003109     	strh	w9, [x8, #0x18]
 455ce7c: 91008100     	add	x0, x8, #0x20
 455ce80: f9400288     	ldr	x8, [x20]
 455ce84: eb080008     	subs	x8, x0, x8
 455ce88: 9345fd08     	asr	x8, x8, #5
 455ce8c: f9000688     	str	x8, [x20, #0x8]
 455ce90: 54fffa00     	b.eq	0x455cdd0 <_ChromeMain+0x4557b34>
 455ce94: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 455ce98: 36fffb48     	tbz	w8, #0x1f, 0x455ce00 <_ChromeMain+0x4557b64>
 455ce9c: f94013e0     	ldr	x0, [sp, #0x20]
 455cea0: f9401be8     	ldr	x8, [sp, #0x30]
 455cea4: d37ff901     	lsl	x1, x8, #1
 455cea8: 96eab004     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 455ceac: 17ffffd5     	b	0x455ce00 <_ChromeMain+0x4557b64>
 455ceb0: f9400668     	ldr	x8, [x19, #0x8]
 455ceb4: b4ffe128     	cbz	x8, 0x455cad8 <_ChromeMain+0x455783c>
 455ceb8: 71000509     	subs	w9, w8, #0x1
 455cebc: 54fff8a4     	b.mi	0x455cdd0 <_ChromeMain+0x4557b34>
 455cec0: b9405aea     	ldr	w10, [x23, #0x58]
 455cec4: 6b0a013f     	cmp	w9, w10
 455cec8: 1a8a3129     	csel	w9, w9, w10, lo
 455cecc: 7100015f     	cmp	w10, #0x0
 455ced0: 1a8943e9     	csel	w9, wzr, w9, mi
 455ced4: b9001a69     	str	w9, [x19, #0x18]
 455ced8: eb09011f     	cmp	x8, x9
 455cedc: 54fff7a9     	b.ls	0x455cdd0 <_ChromeMain+0x4557b34>
 455cee0: f9400268     	ldr	x8, [x19]
 455cee4: 8b091508     	add	x8, x8, x9, lsl #5
 455cee8: 52800029     	mov	w9, #0x1                ; =1
 455ceec: 39006109     	strb	w9, [x8, #0x18]
 455cef0: 17fffefa     	b	0x455cad8 <_ChromeMain+0x455783c>
 455cef4: 910083e1     	add	x1, sp, #0x20
 455cef8: aa1403e0     	mov	x0, x20
 455cefc: 94000391     	bl	0x455dd40 <_ChromeMain+0x4558aa4>
 455cf00: 17ffffe0     	b	0x455ce80 <_ChromeMain+0x4557be4>
 455cf04: 7103fd1f     	cmp	w8, #0xff
 455cf08: 54000081     	b.ne	0x455cf18 <_ChromeMain+0x4557c7c>
 455cf0c: 90049440     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 455cf10: 913be000     	add	x0, x0, #0xef8
 455cf14: 941b28df     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 455cf18: 90049440     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 455cf1c: 913c6000     	add	x0, x0, #0xf18
 455cf20: 941b28dc     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 455cf24: b0049480     	adrp	x0, 0xd7ed000 <dyld_stub_binder+0xd7ed000>
 455cf28: 912aa000     	add	x0, x0, #0xaa8
 455cf2c: 941b28d9     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 455cf30: 9766db94     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
