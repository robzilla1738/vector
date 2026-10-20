
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464a8c0: d10283ff     	sub	sp, sp, #0xa0
 464a8c4: a9046ffc     	stp	x28, x27, [sp, #0x40]
 464a8c8: a90567fa     	stp	x26, x25, [sp, #0x50]
 464a8cc: a9065ff8     	stp	x24, x23, [sp, #0x60]
 464a8d0: a90757f6     	stp	x22, x21, [sp, #0x70]
 464a8d4: a9084ff4     	stp	x20, x19, [sp, #0x80]
 464a8d8: a9097bfd     	stp	x29, x30, [sp, #0x90]
 464a8dc: 910243fd     	add	x29, sp, #0x90
 464a8e0: aa0103f9     	mov	x25, x1
 464a8e4: aa0003f3     	mov	x19, x0
 464a8e8: f9442408     	ldr	x8, [x0, #0x848]
 464a8ec: 39424108     	ldrb	w8, [x8, #0x90]
 464a8f0: 340000a8     	cbz	w8, 0x464a904 <_ChromeMain+0x4645668>
 464a8f4: 39682269     	ldrb	w9, [x19, #0xa08]
 464a8f8: 37000509     	tbnz	w9, #0x0, 0x464a998 <_ChromeMain+0x46456fc>
 464a8fc: 39683269     	ldrb	w9, [x19, #0xa0c]
 464a900: 370004c9     	tbnz	w9, #0x0, 0x464a998 <_ChromeMain+0x46456fc>
 464a904: 3973826a     	ldrb	w10, [x19, #0xce0]
 464a908: 397de269     	ldrb	w9, [x19, #0xf78]
 464a90c: 360005aa     	tbz	w10, #0x0, 0x464a9c0 <_ChromeMain+0x4645724>
 464a910: 35000669     	cbnz	w9, 0x464a9dc <_ChromeMain+0x4645740>
 464a914: 3974a268     	ldrb	w8, [x19, #0xd28]
 464a918: 350000c8     	cbnz	w8, 0x464a930 <_ChromeMain+0x4645694>
 464a91c: fd46a260     	ldr	d0, [x19, #0xd40]
 464a920: 1e6e1001     	fmov	d1, #1.00000000
 464a924: 1e612000     	fcmp	d0, d1
 464a928: 1a9f17e8     	cset	w8, eq
 464a92c: 14000005     	b	0x464a940 <_ChromeMain+0x46456a4>
 464a930: b94d2668     	ldr	w8, [x19, #0xd24]
 464a934: 7100011f     	cmp	w8, #0x0
 464a938: 1a9f17e8     	cset	w8, eq
 464a93c: fd46a260     	ldr	d0, [x19, #0xd40]
 464a940: f0021da9     	adrp	x9, 0x8a01000 <_ChromeMain+0x89fbd64>
 464a944: 912db129     	add	x9, x9, #0xb6c
 464a948: d0ff7b8a     	adrp	x10, 0x35bc000 <_ChromeMain+0x35b6d64>
 464a94c: 9103514a     	add	x10, x10, #0xd4
 464a950: 7100011f     	cmp	w8, #0x0
 464a954: 9a891148     	csel	x8, x10, x9, ne
 464a958: b948ca69     	ldr	w9, [x19, #0x8c8]
 464a95c: 1e620121     	scvtf	d1, w9
 464a960: 1e610800     	fmul	d0, d0, d1
 464a964: d63f0100     	blr	x8
 464a968: 1e780008     	fcvtzs	w8, d0
 464a96c: b941c269     	ldr	w9, [x19, #0x1c0]
 464a970: f944266a     	ldr	x10, [x19, #0x848]
 464a974: 3942414a     	ldrb	w10, [x10, #0x90]
 464a978: 6b09011f     	cmp	w8, w9
 464a97c: 1a89b10b     	csel	w11, w8, w9, lt
 464a980: 7100013f     	cmp	w9, #0x0
 464a984: 1a88c168     	csel	w8, w11, w8, gt
 464a988: 71025d1f     	cmp	w8, #0x97
 464a98c: 1a9fa7f4     	cset	w20, lt
 464a990: 360002ea     	tbz	w10, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a994: 14000002     	b	0x464a99c <_ChromeMain+0x4645700>
 464a998: 52800014     	mov	w20, #0x0               ; =0
 464a99c: 39682268     	ldrb	w8, [x19, #0xa08]
 464a9a0: 37000268     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9a4: 39683268     	ldrb	w8, [x19, #0xa0c]
 464a9a8: 37000228     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9ac: 397de268     	ldrb	w8, [x19, #0xf78]
 464a9b0: 370001e8     	tbnz	w8, #0x0, 0x464a9ec <_ChromeMain+0x4645750>
 464a9b4: 39738268     	ldrb	w8, [x19, #0xce0]
 464a9b8: 52000115     	eor	w21, w8, #0x1
 464a9bc: 1400000d     	b	0x464a9f0 <_ChromeMain+0x4645754>
 464a9c0: 370000e9     	tbnz	w9, #0x0, 0x464a9dc <_ChromeMain+0x4645740>
 464a9c4: 34000068     	cbz	w8, 0x464a9d0 <_ChromeMain+0x4645734>
 464a9c8: aa0803f4     	mov	x20, x8
 464a9cc: 17fffff4     	b	0x464a99c <_ChromeMain+0x4645700>
 464a9d0: 52800015     	mov	w21, #0x0               ; =0
 464a9d4: aa0803f4     	mov	x20, x8
 464a9d8: 14000006     	b	0x464a9f0 <_ChromeMain+0x4645754>
 464a9dc: b941c269     	ldr	w9, [x19, #0x1c0]
 464a9e0: 71025d3f     	cmp	w9, #0x97
 464a9e4: 1a9fa7f4     	cset	w20, lt
 464a9e8: 3707fda8     	tbnz	w8, #0x0, 0x464a99c <_ChromeMain+0x4645700>
 464a9ec: 52800015     	mov	w21, #0x0               ; =0
 464a9f0: 397de268     	ldrb	w8, [x19, #0xf78]
 464a9f4: 370000a8     	tbnz	w8, #0x0, 0x464aa08 <_ChromeMain+0x464576c>
 464a9f8: 3973827b     	ldrb	w27, [x19, #0xce0]
 464a9fc: 14000004     	b	0x464aa0c <_ChromeMain+0x4645770>
 464aa00: b9002bff     	str	wzr, [sp, #0x28]
 464aa04: 1400000f     	b	0x464aa40 <_ChromeMain+0x46457a4>
 464aa08: 5280003b     	mov	w27, #0x1               ; =1
 464aa0c: aa1303e0     	mov	x0, x19
 464aa10: 940018bc     	bl	0x4650d00 <_ChromeMain+0x464ba64>
 464aa14: b9002fe0     	str	w0, [sp, #0x2c]
 464aa18: 528007a0     	mov	w0, #0x3d               ; =61
 464aa1c: 96fae3a9     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 464aa20: aa0003fa     	mov	x26, x0
 464aa24: 528007e0     	mov	w0, #0x3f               ; =63
 464aa28: 96fae3a6     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 464aa2c: aa0003fc     	mov	x28, x0
 464aa30: f9435268     	ldr	x8, [x19, #0x6a0]
 464aa34: b4fffe68     	cbz	x8, 0x464aa00 <_ChromeMain+0x4645764>
 464aa38: 395bc108     	ldrb	w8, [x8, #0x6f0]
 464aa3c: b9002be8     	str	w8, [sp, #0x28]
 464aa40: f9422e68     	ldr	x8, [x19, #0x458]
 464aa44: b4000228     	cbz	x8, 0x464aa88 <_ChromeMain+0x46457ec>
 464aa48: f9429d08     	ldr	x8, [x8, #0x538]
 464aa4c: f9403500     	ldr	x0, [x8, #0x68]
 464aa50: b4000280     	cbz	x0, 0x464aaa0 <_ChromeMain+0x4645804>
 464aa54: f9400008     	ldr	x8, [x0]
 464aa58: f940a508     	ldr	x8, [x8, #0x148]
 464aa5c: d63f0100     	blr	x8
 464aa60: f9400008     	ldr	x8, [x0]
 464aa64: f940b508     	ldr	x8, [x8, #0x168]
 464aa68: d63f0100     	blr	x8
 464aa6c: b40001a0     	cbz	x0, 0x464aaa0 <_ChromeMain+0x4645804>
 464aa70: 90044501     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 464aa74: 9116fc21     	add	x1, x1, #0x5bf
 464aa78: 528005a2     	mov	w2, #0x2d               ; =45
 464aa7c: 96f2eea1     	bl	0x306500 <_ChromeMain+0x301264>
 464aa80: aa0003f7     	mov	x23, x0
 464aa84: 14000008     	b	0x464aaa4 <_ChromeMain+0x4645808>
 464aa88: d2800000     	mov	x0, #0x0                ; =0
 464aa8c: 39624276     	ldrb	w22, [x19, #0x890]
 464aa90: 52800037     	mov	w23, #0x1               ; =1
 464aa94: 14000009     	b	0x464aab8 <_ChromeMain+0x464581c>
 464aa98: d2800000     	mov	x0, #0x0                ; =0
 464aa9c: 14000007     	b	0x464aab8 <_ChromeMain+0x464581c>
 464aaa0: 52800037     	mov	w23, #0x1               ; =1
 464aaa4: f9422e68     	ldr	x8, [x19, #0x458]
 464aaa8: 39624276     	ldrb	w22, [x19, #0x890]
 464aaac: b4ffff68     	cbz	x8, 0x464aa98 <_ChromeMain+0x46457fc>
 464aab0: f9429d08     	ldr	x8, [x8, #0x538]
 464aab4: f9403500     	ldr	x0, [x8, #0x68]
 464aab8: 97fd5445     	bl	0x459fbcc <_ChromeMain+0x459a930>
 464aabc: aa0003f8     	mov	x24, x0
 464aac0: 2a1403e8     	mov	w8, w20
 464aac4: b27f0109     	orr	x9, x8, #0x2
 464aac8: 720002bf     	tst	w21, #0x1
 464aacc: 9a881128     	csel	x8, x9, x8, ne
 464aad0: b27e0109     	orr	x9, x8, #0x4
 464aad4: 7200037f     	tst	w27, #0x1
 464aad8: 9a881128     	csel	x8, x9, x8, ne
 464aadc: b27d0109     	orr	x9, x8, #0x8
 464aae0: 29452beb     	ldp	w11, w10, [sp, #0x28]
 464aae4: 7100015f     	cmp	w10, #0x0
 464aae8: 9a881129     	csel	x9, x9, x8, ne
 464aaec: 39683268     	ldrb	w8, [x19, #0xa0c]
 464aaf0: aa081129     	orr	x9, x9, x8, lsl #4
 464aaf4: b27b012a     	orr	x10, x9, #0x20
 464aaf8: 7200017f     	tst	w11, #0x1
 464aafc: 9a891149     	csel	x9, x10, x9, ne
 464ab00: b27a012a     	orr	x10, x9, #0x40
 464ab04: 710002ff     	cmp	w23, #0x0
 464ab08: 9a891149     	csel	x9, x10, x9, ne
 464ab0c: f943526a     	ldr	x10, [x19, #0x6a0]
 464ab10: b279012b     	orr	x11, x9, #0x80
 464ab14: f100015f     	cmp	x10, #0x0
 464ab18: 9a8b0129     	csel	x9, x9, x11, eq
 464ab1c: f942ce6a     	ldr	x10, [x19, #0x598]
 464ab20: b278012b     	orr	x11, x9, #0x100
 464ab24: f100015f     	cmp	x10, #0x0
 464ab28: 9a8b0129     	csel	x9, x9, x11, eq
 464ab2c: f942d26a     	ldr	x10, [x19, #0x5a0]
 464ab30: b277012b     	orr	x11, x9, #0x200
 464ab34: f100015f     	cmp	x10, #0x0
 464ab38: 9a8b0129     	csel	x9, x9, x11, eq
 464ab3c: f942e66a     	ldr	x10, [x19, #0x5c8]
 464ab40: b276012b     	orr	x11, x9, #0x400
 464ab44: f100015f     	cmp	x10, #0x0
 464ab48: 9a8b0129     	csel	x9, x9, x11, eq
 464ab4c: f943366a     	ldr	x10, [x19, #0x668]
 464ab50: b275012b     	orr	x11, x9, #0x800
 464ab54: f100015f     	cmp	x10, #0x0
 464ab58: 9a8b0129     	csel	x9, x9, x11, eq
 464ab5c: f9433e6a     	ldr	x10, [x19, #0x678]
 464ab60: b274012b     	orr	x11, x9, #0x1000
 464ab64: f100015f     	cmp	x10, #0x0
 464ab68: 9a8b0129     	csel	x9, x9, x11, eq
 464ab6c: f9436a6a     	ldr	x10, [x19, #0x6d0]
 464ab70: b273012b     	orr	x11, x9, #0x2000
 464ab74: f100015f     	cmp	x10, #0x0
 464ab78: 9a8b0129     	csel	x9, x9, x11, eq
 464ab7c: f9423e6a     	ldr	x10, [x19, #0x478]
 464ab80: b272012b     	orr	x11, x9, #0x4000
 464ab84: f100015f     	cmp	x10, #0x0
 464ab88: 9a8b0129     	csel	x9, x9, x11, eq
 464ab8c: b271012a     	orr	x10, x9, #0x8000
 464ab90: 720002df     	tst	w22, #0x1
 464ab94: 9a891149     	csel	x9, x10, x9, ne
 464ab98: b270012a     	orr	x10, x9, #0x10000
 464ab9c: 7100001f     	cmp	w0, #0x0
 464aba0: 9a891149     	csel	x9, x10, x9, ne
 464aba4: 12001f4a     	and	w10, w26, #0xff
 464aba8: d3607d4a     	lsl	x10, x10, #32
 464abac: 12001f8b     	and	w11, w28, #0xff
 464abb0: aa0ba14a     	orr	x10, x10, x11, lsl #40
 464abb4: aa0a0129     	orr	x9, x9, x10
 464abb8: 370000d9     	tbnz	w25, #0x0, 0x464abd0 <_ChromeMain+0x4645934>
 464abbc: 397e226a     	ldrb	w10, [x19, #0xf88]
 464abc0: 3400008a     	cbz	w10, 0x464abd0 <_ChromeMain+0x4645934>
 464abc4: f947c26a     	ldr	x10, [x19, #0xf80]
 464abc8: eb09015f     	cmp	x10, x9
 464abcc: 54003ae0     	b.eq	0x464b328 <_ChromeMain+0x464608c>
 464abd0: b90027fc     	str	w28, [sp, #0x24]
 464abd4: f907c269     	str	x9, [x19, #0xf80]
 464abd8: 52800029     	mov	w9, #0x1                ; =1
 464abdc: 393e2269     	strb	w9, [x19, #0xf88]
 464abe0: 52000289     	eor	w9, w20, #0x1
 464abe4: b90017fb     	str	w27, [sp, #0x14]
 464abe8: 2a09037b     	orr	w27, w27, w9
 464abec: f942ca60     	ldr	x0, [x19, #0x590]
 464abf0: 394ec809     	ldrb	w9, [x0, #0x3b2]
 464abf4: 6b08013f     	cmp	w9, w8
 464abf8: 54000080     	b.eq	0x464ac08 <_ChromeMain+0x464596c>
 464abfc: 390ec808     	strb	w8, [x0, #0x3b2]
 464ac00: 52800001     	mov	w1, #0x0                ; =0
 464ac04: 96ff961c     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464ac08: f9437660     	ldr	x0, [x19, #0x6e8]
 464ac0c: f9400008     	ldr	x8, [x0]
 464ac10: f9405108     	ldr	x8, [x8, #0xa0]
 464ac14: 12000361     	and	w1, w27, #0x1
 464ac18: d63f0100     	blr	x8
 464ac1c: f9437660     	ldr	x0, [x19, #0x6e8]
 464ac20: 52800001     	mov	w1, #0x0                ; =0
 464ac24: 97efe687     	bl	0x4244640 <_ChromeMain+0x423f3a4>
 464ac28: f9437668     	ldr	x8, [x19, #0x6e8]
 464ac2c: 2b1a0349     	adds	w9, w26, w26
 464ac30: 131f7d2a     	asr	w10, w9, #31
 464ac34: 5201014a     	eor	w10, w10, #0x80000000
 464ac38: 1a896149     	csel	w9, w10, w9, vs
 464ac3c: 6b1a0129     	subs	w9, w9, w26
 464ac40: 131f7d2a     	asr	w10, w9, #31
 464ac44: 5201014a     	eor	w10, w10, #0x80000000
 464ac48: 1a896149     	csel	w9, w10, w9, vs
 464ac4c: d3607d29     	lsl	x9, x9, #32
 464ac50: d3607f5c     	lsl	x28, x26, #32
 464ac54: a90327fc     	stp	x28, x9, [sp, #0x30]
 464ac58: f9000fe9     	str	x9, [sp, #0x18]
 464ac5c: f0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ac60: 91122021     	add	x1, x1, #0x488
 464ac64: 91036100     	add	x0, x8, #0xd8
 464ac68: 9100c3e2     	add	x2, sp, #0x30
 464ac6c: 97528c7d     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464ac70: f9435260     	ldr	x0, [x19, #0x6a0]
 464ac74: b40005e0     	cbz	x0, 0x464ad30 <_ChromeMain+0x4645a94>
 464ac78: f9442668     	ldr	x8, [x19, #0x848]
 464ac7c: 39424108     	ldrb	w8, [x8, #0x90]
 464ac80: 34000168     	cbz	w8, 0x464acac <_ChromeMain+0x4645a10>
 464ac84: 39682268     	ldrb	w8, [x19, #0xa08]
 464ac88: 37000108     	tbnz	w8, #0x0, 0x464aca8 <_ChromeMain+0x4645a0c>
 464ac8c: 39683268     	ldrb	w8, [x19, #0xa0c]
 464ac90: 370000c8     	tbnz	w8, #0x0, 0x464aca8 <_ChromeMain+0x4645a0c>
 464ac94: 397de268     	ldrb	w8, [x19, #0xf78]
 464ac98: 37000088     	tbnz	w8, #0x0, 0x464aca8 <_ChromeMain+0x4645a0c>
 464ac9c: 39738268     	ldrb	w8, [x19, #0xce0]
 464aca0: 52000108     	eor	w8, w8, #0x1
 464aca4: 14000002     	b	0x464acac <_ChromeMain+0x4645a10>
 464aca8: 52800008     	mov	w8, #0x0                ; =0
 464acac: 12000101     	and	w1, w8, #0x1
 464acb0: 97ff19ba     	bl	0x4611398 <_ChromeMain+0x460c0fc>
 464acb4: f943527a     	ldr	x26, [x19, #0x6a0]
 464acb8: b946ef48     	ldr	w8, [x26, #0x6ec]
 464acbc: 340002c8     	cbz	w8, 0x464ad14 <_ChromeMain+0x4645a78>
 464acc0: b906ef5f     	str	wzr, [x26, #0x6ec]
 464acc4: f9429f59     	ldr	x25, [x26, #0x538]
 464acc8: b4000279     	cbz	x25, 0x464ad14 <_ChromeMain+0x4645a78>
 464accc: 52800400     	mov	w0, #0x20               ; =32
 464acd0: 96e711a6     	bl	0xf368 <_ChromeMain+0xa0cc>
 464acd4: aa0003e1     	mov	x1, x0
 464acd8: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 464acdc: b9000808     	str	w8, [x0, #0x8]
 464ace0: 52800028     	mov	w8, #0x1                ; =1
 464ace4: d004e809     	adrp	x9, 0xe34c000 <dyld_stub_binder+0xe34c000>
 464ace8: 91044129     	add	x9, x9, #0x110
 464acec: 39003008     	strb	w8, [x0, #0xc]
 464acf0: f9000009     	str	x9, [x0]
 464acf4: a9017c1f     	stp	xzr, xzr, [x0, #0x10]
 464acf8: f9400328     	ldr	x8, [x25]
 464acfc: f9408908     	ldr	x8, [x8, #0x110]
 464ad00: aa1903e0     	mov	x0, x25
 464ad04: d63f0100     	blr	x8
 464ad08: f9429f40     	ldr	x0, [x26, #0x538]
 464ad0c: 52800001     	mov	w1, #0x0                ; =0
 464ad10: 96ff95d9     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464ad14: f9435268     	ldr	x8, [x19, #0x6a0]
 464ad18: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 464ad1c: f0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ad20: 91122021     	add	x1, x1, #0x488
 464ad24: 91036100     	add	x0, x8, #0xd8
 464ad28: 9100c3e2     	add	x2, sp, #0x30
 464ad2c: 97528c4d     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464ad30: f942ce79     	ldr	x25, [x19, #0x598]
 464ad34: b40012b9     	cbz	x25, 0x464af88 <_ChromeMain+0x4645cec>
 464ad38: f9442668     	ldr	x8, [x19, #0x848]
 464ad3c: 39424108     	ldrb	w8, [x8, #0x90]
 464ad40: 34000108     	cbz	w8, 0x464ad60 <_ChromeMain+0x4645ac4>
 464ad44: 39682268     	ldrb	w8, [x19, #0xa08]
 464ad48: 37000088     	tbnz	w8, #0x0, 0x464ad58 <_ChromeMain+0x4645abc>
 464ad4c: 39683268     	ldrb	w8, [x19, #0xa0c]
 464ad50: 52000108     	eor	w8, w8, #0x1
 464ad54: 14000004     	b	0x464ad64 <_ChromeMain+0x4645ac8>
 464ad58: 52800008     	mov	w8, #0x0                ; =0
 464ad5c: 14000002     	b	0x464ad64 <_ChromeMain+0x4645ac8>
 464ad60: 52800028     	mov	w8, #0x1                ; =1
 464ad64: 3954c729     	ldrb	w9, [x25, #0x531]
 464ad68: 12000108     	and	w8, w8, #0x1
 464ad6c: 6b08013f     	cmp	w9, w8
 464ad70: 540006e0     	b.eq	0x464ae4c <_ChromeMain+0x4645bb0>
 464ad74: 3914c728     	strb	w8, [x25, #0x531]
 464ad78: f9428f20     	ldr	x0, [x25, #0x518]
 464ad7c: f9400008     	ldr	x8, [x0]
 464ad80: f9405108     	ldr	x8, [x8, #0xa0]
 464ad84: 52800001     	mov	w1, #0x0                ; =0
 464ad88: d63f0100     	blr	x8
 464ad8c: f9429720     	ldr	x0, [x25, #0x528]
 464ad90: 3954c328     	ldrb	w8, [x25, #0x530]
 464ad94: f9400009     	ldr	x9, [x0]
 464ad98: f9405129     	ldr	x9, [x9, #0xa0]
 464ad9c: 5280002a     	mov	w10, #0x1               ; =1
 464ada0: 0a280141     	bic	w1, w10, w8
 464ada4: d63f0120     	blr	x9
 464ada8: f942933a     	ldr	x26, [x25, #0x520]
 464adac: 3954c328     	ldrb	w8, [x25, #0x530]
 464adb0: 37000308     	tbnz	w8, #0x0, 0x464ae10 <_ChromeMain+0x4645b74>
 464adb4: 3954c728     	ldrb	w8, [x25, #0x531]
 464adb8: 370002c8     	tbnz	w8, #0x0, 0x464ae10 <_ChromeMain+0x4645b74>
 464adbc: f9426b28     	ldr	x8, [x25, #0x4d0]
 464adc0: f9429d08     	ldr	x8, [x8, #0x538]
 464adc4: f9403500     	ldr	x0, [x8, #0x68]
 464adc8: b4000240     	cbz	x0, 0x464ae10 <_ChromeMain+0x4645b74>
 464adcc: f9400008     	ldr	x8, [x0]
 464add0: f940b908     	ldr	x8, [x8, #0x170]
 464add4: d63f0100     	blr	x8
 464add8: b40001c0     	cbz	x0, 0x464ae10 <_ChromeMain+0x4645b74>
 464addc: d0044481     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464ade0: 9102fc21     	add	x1, x1, #0xbf
 464ade4: f90007e0     	str	x0, [sp, #0x8]
 464ade8: 52800322     	mov	w2, #0x19               ; =25
 464adec: 96f9c798     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 464adf0: b4000100     	cbz	x0, 0x464ae10 <_ChromeMain+0x4645b74>
 464adf4: d0044481     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464adf8: 9102fc21     	add	x1, x1, #0xbf
 464adfc: f94007e0     	ldr	x0, [sp, #0x8]
 464ae00: 52800322     	mov	w2, #0x19               ; =25
 464ae04: 96f2edbf     	bl	0x306500 <_ChromeMain+0x301264>
 464ae08: aa0003e1     	mov	x1, x0
 464ae0c: 14000002     	b	0x464ae14 <_ChromeMain+0x4645b78>
 464ae10: 52800001     	mov	w1, #0x0                ; =0
 464ae14: f9400348     	ldr	x8, [x26]
 464ae18: f9405108     	ldr	x8, [x8, #0xa0]
 464ae1c: aa1a03e0     	mov	x0, x26
 464ae20: d63f0100     	blr	x8
 464ae24: 39556328     	ldrb	w8, [x25, #0x558]
 464ae28: 34000048     	cbz	w8, 0x464ae30 <_ChromeMain+0x4645b94>
 464ae2c: 3915633f     	strb	wzr, [x25, #0x558]
 464ae30: f9400328     	ldr	x8, [x25]
 464ae34: f9418508     	ldr	x8, [x8, #0x308]
 464ae38: aa1903e0     	mov	x0, x25
 464ae3c: d63f0100     	blr	x8
 464ae40: aa1903e0     	mov	x0, x25
 464ae44: 52800001     	mov	w1, #0x0                ; =0
 464ae48: 96ff958b     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464ae4c: 3954c329     	ldrb	w9, [x25, #0x530]
 464ae50: 120002a8     	and	w8, w21, #0x1
 464ae54: 6b08013f     	cmp	w9, w8
 464ae58: 54000980     	b.eq	0x464af88 <_ChromeMain+0x4645cec>
 464ae5c: 3914c328     	strb	w8, [x25, #0x530]
 464ae60: f9428f20     	ldr	x0, [x25, #0x518]
 464ae64: f9400008     	ldr	x8, [x0]
 464ae68: f9405108     	ldr	x8, [x8, #0xa0]
 464ae6c: 52800001     	mov	w1, #0x0                ; =0
 464ae70: d63f0100     	blr	x8
 464ae74: f9429720     	ldr	x0, [x25, #0x528]
 464ae78: 3954c328     	ldrb	w8, [x25, #0x530]
 464ae7c: f9400009     	ldr	x9, [x0]
 464ae80: f9405129     	ldr	x9, [x9, #0xa0]
 464ae84: 5280002a     	mov	w10, #0x1               ; =1
 464ae88: 0a280141     	bic	w1, w10, w8
 464ae8c: d63f0120     	blr	x9
 464ae90: f942933a     	ldr	x26, [x25, #0x520]
 464ae94: 3954c328     	ldrb	w8, [x25, #0x530]
 464ae98: 37000308     	tbnz	w8, #0x0, 0x464aef8 <_ChromeMain+0x4645c5c>
 464ae9c: 3954c728     	ldrb	w8, [x25, #0x531]
 464aea0: 370002c8     	tbnz	w8, #0x0, 0x464aef8 <_ChromeMain+0x4645c5c>
 464aea4: f9426b28     	ldr	x8, [x25, #0x4d0]
 464aea8: f9429d08     	ldr	x8, [x8, #0x538]
 464aeac: f9403500     	ldr	x0, [x8, #0x68]
 464aeb0: b4000240     	cbz	x0, 0x464aef8 <_ChromeMain+0x4645c5c>
 464aeb4: f9400008     	ldr	x8, [x0]
 464aeb8: f940b908     	ldr	x8, [x8, #0x170]
 464aebc: d63f0100     	blr	x8
 464aec0: b40001c0     	cbz	x0, 0x464aef8 <_ChromeMain+0x4645c5c>
 464aec4: d0044481     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464aec8: 9102fc21     	add	x1, x1, #0xbf
 464aecc: f90007e0     	str	x0, [sp, #0x8]
 464aed0: 52800322     	mov	w2, #0x19               ; =25
 464aed4: 96f9c75e     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 464aed8: b4000100     	cbz	x0, 0x464aef8 <_ChromeMain+0x4645c5c>
 464aedc: d0044481     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 464aee0: 9102fc21     	add	x1, x1, #0xbf
 464aee4: f94007e0     	ldr	x0, [sp, #0x8]
 464aee8: 52800322     	mov	w2, #0x19               ; =25
 464aeec: 96f2ed85     	bl	0x306500 <_ChromeMain+0x301264>
 464aef0: aa0003e1     	mov	x1, x0
 464aef4: 14000002     	b	0x464aefc <_ChromeMain+0x4645c60>
 464aef8: 52800001     	mov	w1, #0x0                ; =0
 464aefc: f9400348     	ldr	x8, [x26]
 464af00: f9405108     	ldr	x8, [x8, #0xa0]
 464af04: aa1a03e0     	mov	x0, x26
 464af08: d63f0100     	blr	x8
 464af0c: f9428328     	ldr	x8, [x25, #0x500]
 464af10: 3954c329     	ldrb	w9, [x25, #0x530]
 464af14: 7100013f     	cmp	w9, #0x0
 464af18: d2c00089     	mov	x9, #0x400000000        ; =17179869184
 464af1c: 9a8913e9     	csel	x9, xzr, x9, ne
 464af20: a90327ff     	stp	xzr, x9, [sp, #0x30]
 464af24: f0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464af28: 91122021     	add	x1, x1, #0x488
 464af2c: 91036100     	add	x0, x8, #0xd8
 464af30: 9100c3e2     	add	x2, sp, #0x30
 464af34: 97528bcb     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464af38: f9410320     	ldr	x0, [x25, #0x200]
 464af3c: 3954c328     	ldrb	w8, [x25, #0x530]
 464af40: b9410809     	ldr	w9, [x0, #0x108]
 464af44: 6b08013f     	cmp	w9, w8
 464af48: 54000080     	b.eq	0x464af58 <_ChromeMain+0x4645cbc>
 464af4c: b9010808     	str	w8, [x0, #0x108]
 464af50: 52800021     	mov	w1, #0x1                ; =1
 464af54: 975068d7     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 464af58: aa1903e0     	mov	x0, x25
 464af5c: 94004ba9     	bl	0x465de00 <_ChromeMain+0x4658b64>
 464af60: 39556328     	ldrb	w8, [x25, #0x558]
 464af64: 34000048     	cbz	w8, 0x464af6c <_ChromeMain+0x4645cd0>
 464af68: 3915633f     	strb	wzr, [x25, #0x558]
 464af6c: f9400328     	ldr	x8, [x25]
 464af70: f9418508     	ldr	x8, [x8, #0x308]
 464af74: aa1903e0     	mov	x0, x25
 464af78: d63f0100     	blr	x8
 464af7c: aa1903e0     	mov	x0, x25
 464af80: 52800001     	mov	w1, #0x0                ; =0
 464af84: 96ff953c     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464af88: f942d260     	ldr	x0, [x19, #0x5a0]
 464af8c: b4000120     	cbz	x0, 0x464afb0 <_ChromeMain+0x4645d14>
 464af90: f9400008     	ldr	x8, [x0]
 464af94: f9405108     	ldr	x8, [x8, #0xa0]
 464af98: 52800029     	mov	w9, #0x1                ; =1
 464af9c: 0a350121     	bic	w1, w9, w21
 464afa0: d63f0100     	blr	x8
 464afa4: f942d260     	ldr	x0, [x19, #0x5a0]
 464afa8: aa1803e1     	mov	x1, x24
 464afac: 972a8a36     	bl	0x10ed884 <_ChromeMain+0x10e85e8>
 464afb0: f942d660     	ldr	x0, [x19, #0x5a8]
 464afb4: b40000e0     	cbz	x0, 0x464afd0 <_ChromeMain+0x4645d34>
 464afb8: 395e9268     	ldrb	w8, [x19, #0x7a4]
 464afbc: 2a340108     	orn	w8, w8, w20
 464afc0: f9400009     	ldr	x9, [x0]
 464afc4: f9405129     	ldr	x9, [x9, #0xa0]
 464afc8: 12000101     	and	w1, w8, #0x1
 464afcc: d63f0120     	blr	x9
 464afd0: f942da68     	ldr	x8, [x19, #0x5b0]
 464afd4: b40000e8     	cbz	x8, 0x464aff0 <_ChromeMain+0x4645d54>
 464afd8: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 464afdc: f0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464afe0: 91122021     	add	x1, x1, #0x488
 464afe4: 91036100     	add	x0, x8, #0xd8
 464afe8: 9100c3e2     	add	x2, sp, #0x30
 464afec: 97528b9d     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464aff0: 0a160376     	and	w22, w27, w22
 464aff4: f942e660     	ldr	x0, [x19, #0x5c8]
 464aff8: b4000180     	cbz	x0, 0x464b028 <_ChromeMain+0x4645d8c>
 464affc: f9400008     	ldr	x8, [x0]
 464b000: f9405108     	ldr	x8, [x8, #0xa0]
 464b004: 120002c1     	and	w1, w22, #0x1
 464b008: d63f0100     	blr	x8
 464b00c: f942e668     	ldr	x8, [x19, #0x5c8]
 464b010: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 464b014: d0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464b018: 91122021     	add	x1, x1, #0x488
 464b01c: 91036100     	add	x0, x8, #0xd8
 464b020: 9100c3e2     	add	x2, sp, #0x30
 464b024: 97528b8f     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464b028: f942ee60     	ldr	x0, [x19, #0x5d8]
 464b02c: b40000a0     	cbz	x0, 0x464b040 <_ChromeMain+0x4645da4>
 464b030: f9400008     	ldr	x8, [x0]
 464b034: f9405108     	ldr	x8, [x8, #0xa0]
 464b038: 120002c1     	and	w1, w22, #0x1
 464b03c: d63f0100     	blr	x8
 464b040: f942f268     	ldr	x8, [x19, #0x5e0]
 464b044: b4000228     	cbz	x8, 0x464b088 <_ChromeMain+0x4645dec>
 464b048: aa1303e0     	mov	x0, x19
 464b04c: 97ff998d     	bl	0x4631680 <_ChromeMain+0x462c3e4>
 464b050: f942f260     	ldr	x0, [x19, #0x5e0]
 464b054: b40001a0     	cbz	x0, 0x464b088 <_ChromeMain+0x4645dec>
 464b058: 39472008     	ldrb	w8, [x0, #0x1c8]
 464b05c: 52000289     	eor	w9, w20, #0x1
 464b060: 0a080128     	and	w8, w9, w8
 464b064: 395e9269     	ldrb	w9, [x19, #0x7a4]
 464b068: 34000089     	cbz	w9, 0x464b078 <_ChromeMain+0x4645ddc>
 464b06c: 395e8269     	ldrb	w9, [x19, #0x7a0]
 464b070: 34000049     	cbz	w9, 0x464b078 <_ChromeMain+0x4645ddc>
 464b074: 395e7268     	ldrb	w8, [x19, #0x79c]
 464b078: f9400009     	ldr	x9, [x0]
 464b07c: f9405129     	ldr	x9, [x9, #0xa0]
 464b080: 12000101     	and	w1, w8, #0x1
 464b084: d63f0120     	blr	x9
 464b088: f9433660     	ldr	x0, [x19, #0x668]
 464b08c: b4000180     	cbz	x0, 0x464b0bc <_ChromeMain+0x4645e20>
 464b090: f9400008     	ldr	x8, [x0]
 464b094: f9405108     	ldr	x8, [x8, #0xa0]
 464b098: 0a170361     	and	w1, w27, w23
 464b09c: d63f0100     	blr	x8
 464b0a0: f9433668     	ldr	x8, [x19, #0x668]
 464b0a4: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 464b0a8: d0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464b0ac: 91122021     	add	x1, x1, #0x488
 464b0b0: 91036100     	add	x0, x8, #0xd8
 464b0b4: 9100c3e2     	add	x2, sp, #0x30
 464b0b8: 97528b6a     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464b0bc: f9433a60     	ldr	x0, [x19, #0x670]
 464b0c0: b40000a0     	cbz	x0, 0x464b0d4 <_ChromeMain+0x4645e38>
 464b0c4: f9400008     	ldr	x8, [x0]
 464b0c8: f9405108     	ldr	x8, [x8, #0xa0]
 464b0cc: 12000361     	and	w1, w27, #0x1
 464b0d0: d63f0100     	blr	x8
 464b0d4: f942ea60     	ldr	x0, [x19, #0x5d0]
 464b0d8: b4000180     	cbz	x0, 0x464b108 <_ChromeMain+0x4645e6c>
 464b0dc: 12000368     	and	w8, w27, #0x1
 464b0e0: 3910b808     	strb	w8, [x0, #0x42e]
 464b0e4: 3700007b     	tbnz	w27, #0x0, 0x464b0f0 <_ChromeMain+0x4645e54>
 464b0e8: 52800001     	mov	w1, #0x0                ; =0
 464b0ec: 14000004     	b	0x464b0fc <_ChromeMain+0x4645e60>
 464b0f0: f940cc08     	ldr	x8, [x0, #0x198]
 464b0f4: f100011f     	cmp	x8, #0x0
 464b0f8: 1a9f07e1     	cset	w1, ne
 464b0fc: f9400008     	ldr	x8, [x0]
 464b100: f9405108     	ldr	x8, [x8, #0xa0]
 464b104: d63f0100     	blr	x8
 464b108: f9433e60     	ldr	x0, [x19, #0x678]
 464b10c: b40000a0     	cbz	x0, 0x464b120 <_ChromeMain+0x4645e84>
 464b110: f9400008     	ldr	x8, [x0]
 464b114: f9405108     	ldr	x8, [x8, #0xa0]
 464b118: 12000361     	and	w1, w27, #0x1
 464b11c: d63f0100     	blr	x8
 464b120: f9436a60     	ldr	x0, [x19, #0x6d0]
 464b124: b40000e0     	cbz	x0, 0x464b140 <_ChromeMain+0x4645ea4>
 464b128: b9402be8     	ldr	w8, [sp, #0x28]
 464b12c: 0a170108     	and	w8, w8, w23
 464b130: f9400009     	ldr	x9, [x0]
 464b134: f9405129     	ldr	x9, [x9, #0xa0]
 464b138: 0a080361     	and	w1, w27, w8
 464b13c: d63f0120     	blr	x9
 464b140: aa1303e0     	mov	x0, x19
 464b144: 97ffe8af     	bl	0x4645400 <_ChromeMain+0x4640164>
 464b148: f9438260     	ldr	x0, [x19, #0x700]
 464b14c: f9400008     	ldr	x8, [x0]
 464b150: f9405108     	ldr	x8, [x8, #0xa0]
 464b154: 52000281     	eor	w1, w20, #0x1
 464b158: d63f0100     	blr	x8
 464b15c: 528007a0     	mov	w0, #0x3d               ; =61
 464b160: 96fae1d8     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 464b164: f942ca68     	ldr	x8, [x19, #0x590]
 464b168: b9402fe9     	ldr	w9, [sp, #0x2c]
 464b16c: 2a350129     	orn	w9, w9, w21
 464b170: 37000269     	tbnz	w9, #0x0, 0x464b1bc <_ChromeMain+0x4645f20>
 464b174: 51000c09     	sub	w9, w0, #0x3
 464b178: 0aa97d29     	bic	w9, w9, w9, asr #31
 464b17c: 3100152a     	adds	w10, w9, #0x5
 464b180: 12b0000b     	mov	w11, #0x7fffffff        ; =2147483647
 464b184: 1a8a616a     	csel	w10, w11, w10, vs
 464b188: 4b09014a     	sub	w10, w10, w9
 464b18c: 2b00000b     	adds	w11, w0, w0
 464b190: 131f7d6c     	asr	w12, w11, #31
 464b194: 5201018c     	eor	w12, w12, #0x80000000
 464b198: 1a8b618b     	csel	w11, w12, w11, vs
 464b19c: 6b00016b     	subs	w11, w11, w0
 464b1a0: 131f7d6c     	asr	w12, w11, #31
 464b1a4: 5201018c     	eor	w12, w12, #0x80000000
 464b1a8: 1a8b618b     	csel	w11, w12, w11, vs
 464b1ac: aa0b814a     	orr	x10, x10, x11, lsl #32
 464b1b0: aa008129     	orr	x9, x9, x0, lsl #32
 464b1b4: a9032be9     	stp	x9, x10, [sp, #0x30]
 464b1b8: 1400000c     	b	0x464b1e8 <_ChromeMain+0x4645f4c>
 464b1bc: 2b000009     	adds	w9, w0, w0
 464b1c0: 131f7d2a     	asr	w10, w9, #31
 464b1c4: 5201014a     	eor	w10, w10, #0x80000000
 464b1c8: 1a896149     	csel	w9, w10, w9, vs
 464b1cc: 6b000129     	subs	w9, w9, w0
 464b1d0: 131f7d2a     	asr	w10, w9, #31
 464b1d4: 5201014a     	eor	w10, w10, #0x80000000
 464b1d8: 1a896149     	csel	w9, w10, w9, vs
 464b1dc: d3607d29     	lsl	x9, x9, #32
 464b1e0: d3607c0a     	lsl	x10, x0, #32
 464b1e4: a90327ea     	stp	x10, x9, [sp, #0x30]
 464b1e8: d0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464b1ec: 91122021     	add	x1, x1, #0x488
 464b1f0: 91036100     	add	x0, x8, #0xd8
 464b1f4: 9100c3e2     	add	x2, sp, #0x30
 464b1f8: 97528b1a     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464b1fc: f942ca76     	ldr	x22, [x19, #0x590]
 464b200: 394ec2c9     	ldrb	w9, [x22, #0x3b0]
 464b204: 120002a8     	and	w8, w21, #0x1
 464b208: 6b08013f     	cmp	w9, w8
 464b20c: 54000160     	b.eq	0x464b238 <_ChromeMain+0x4645f9c>
 464b210: 390ec2c8     	strb	w8, [x22, #0x3b0]
 464b214: f941aec0     	ldr	x0, [x22, #0x358]
 464b218: b40000a0     	cbz	x0, 0x464b22c <_ChromeMain+0x4645f90>
 464b21c: 39472008     	ldrb	w8, [x0, #0x1c8]
 464b220: 34000068     	cbz	w8, 0x464b22c <_ChromeMain+0x4645f90>
 464b224: 120002a1     	and	w1, w21, #0x1
 464b228: 9794727d     	bl	0x2b67c1c <_ChromeMain+0x2b62980>
 464b22c: aa1603e0     	mov	x0, x22
 464b230: 52800001     	mov	w1, #0x0                ; =0
 464b234: 96ff9490     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b238: f9437a68     	ldr	x8, [x19, #0x6f0]
 464b23c: b94027e9     	ldr	w9, [sp, #0x24]
 464b240: 2a0903e9     	mov	w9, w9
 464b244: aa090389     	orr	x9, x28, x9
 464b248: f9001be9     	str	x9, [sp, #0x30]
 464b24c: f9400fe9     	ldr	x9, [sp, #0x18]
 464b250: f9001fe9     	str	x9, [sp, #0x38]
 464b254: d0051dc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464b258: 91122021     	add	x1, x1, #0x488
 464b25c: 91036100     	add	x0, x8, #0xd8
 464b260: 9100c3e2     	add	x2, sp, #0x30
 464b264: 97528aff     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464b268: f9437a60     	ldr	x0, [x19, #0x6f0]
 464b26c: aa1403e1     	mov	x1, x20
 464b270: 97efe877     	bl	0x424544c <_ChromeMain+0x42401b0>
 464b274: f9423e60     	ldr	x0, [x19, #0x478]
 464b278: b40001a0     	cbz	x0, 0x464b2ac <_ChromeMain+0x4646010>
 464b27c: 12000361     	and	w1, w27, #0x1
 464b280: 9707eeae     	bl	0x846d38 <_ChromeMain+0x841a9c>
 464b284: f9423e60     	ldr	x0, [x19, #0x478]
 464b288: b94017e8     	ldr	w8, [sp, #0x14]
 464b28c: 52000108     	eor	w8, w8, #0x1
 464b290: 0a080288     	and	w8, w20, w8
 464b294: 394da009     	ldrb	w9, [x0, #0x368]
 464b298: 6b08013f     	cmp	w9, w8
 464b29c: 54000080     	b.eq	0x464b2ac <_ChromeMain+0x4646010>
 464b2a0: 390da008     	strb	w8, [x0, #0x368]
 464b2a4: 52800001     	mov	w1, #0x0                ; =0
 464b2a8: 96ff9473     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b2ac: f9435675     	ldr	x21, [x19, #0x6a8]
 464b2b0: b4000295     	cbz	x21, 0x464b300 <_ChromeMain+0x4646064>
 464b2b4: 395522a8     	ldrb	w8, [x21, #0x548]
 464b2b8: 6b14011f     	cmp	w8, w20
 464b2bc: 54000220     	b.eq	0x464b300 <_ChromeMain+0x4646064>
 464b2c0: 391522b4     	strb	w20, [x21, #0x548]
 464b2c4: f941b6a8     	ldr	x8, [x21, #0x368]
 464b2c8: b4000408     	cbz	x8, 0x464b348 <_ChromeMain+0x46460ac>
 464b2cc: 52800028     	mov	w8, #0x1                ; =1
 464b2d0: f94002a9     	ldr	x9, [x21]
 464b2d4: f9405129     	ldr	x9, [x9, #0xa0]
 464b2d8: 12000101     	and	w1, w8, #0x1
 464b2dc: aa1503e0     	mov	x0, x21
 464b2e0: d63f0120     	blr	x9
 464b2e4: aa1503e0     	mov	x0, x21
 464b2e8: 52800001     	mov	w1, #0x0                ; =0
 464b2ec: 96ff9462     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b2f0: f94002a8     	ldr	x8, [x21]
 464b2f4: f9418508     	ldr	x8, [x8, #0x308]
 464b2f8: aa1503e0     	mov	x0, x21
 464b2fc: d63f0100     	blr	x8
 464b300: f942ca74     	ldr	x20, [x19, #0x590]
 464b304: aa1303e0     	mov	x0, x19
 464b308: 9400167e     	bl	0x4650d00 <_ChromeMain+0x464ba64>
 464b30c: 394ee288     	ldrb	w8, [x20, #0x3b8]
 464b310: 6b00011f     	cmp	w8, w0
 464b314: 540000a0     	b.eq	0x464b328 <_ChromeMain+0x464608c>
 464b318: 390ee280     	strb	w0, [x20, #0x3b8]
 464b31c: aa1403e0     	mov	x0, x20
 464b320: 52800001     	mov	w1, #0x0                ; =0
 464b324: 96ff9454     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b328: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 464b32c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 464b330: a94757f6     	ldp	x22, x21, [sp, #0x70]
 464b334: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 464b338: a94567fa     	ldp	x26, x25, [sp, #0x50]
 464b33c: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 464b340: 910283ff     	add	sp, sp, #0xa0
 464b344: d65f03c0     	ret
 464b348: 395552a8     	ldrb	w8, [x21, #0x554]
 464b34c: 17ffffe1     	b	0x464b2d0 <_ChromeMain+0x4646034>
