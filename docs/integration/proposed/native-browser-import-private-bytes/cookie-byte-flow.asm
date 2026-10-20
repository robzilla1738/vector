
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425a8ac: a91e7fff     	stp	xzr, xzr, [sp, #0x1e0]
 425a8b0: f900fbff     	str	xzr, [sp, #0x1f0]
 425a8b4: 910783e8     	add	x8, sp, #0x1e0
 425a8b8: 910803e0     	add	x0, sp, #0x200
 425a8bc: 52800081     	mov	w1, #0x4                ; =4
 425a8c0: 9711eebe     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425a8c4: a91cffff     	stp	xzr, xzr, [sp, #0x1c8]
 425a8c8: f900efff     	str	xzr, [sp, #0x1d8]
 425a8cc: 910723e8     	add	x8, sp, #0x1c8
 425a8d0: 910803e0     	add	x0, sp, #0x200
 425a8d4: 528000a1     	mov	w1, #0x5                ; =5
 425a8d8: 9534dc1a     	bl	0x8f91940 <_ChromeMain+0x8f8c6a4>
 425a8dc: a91b7fff     	stp	xzr, xzr, [sp, #0x1b0]
 425a8e0: f900e3ff     	str	xzr, [sp, #0x1c0]
 425a8e4: 9106c3e8     	add	x8, sp, #0x1b0
 425a8e8: 910803e0     	add	x0, sp, #0x200
 425a8ec: 52800021     	mov	w1, #0x1                ; =1
 425a8f0: 9711eeb2     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425a8f4: 3947dfe8     	ldrb	w8, [sp, #0x1f7]
 425a8f8: f940f7e9     	ldr	x9, [sp, #0x1e8]
 425a8fc: 7219011f     	tst	w8, #0x80
 425a900: 9a881128     	csel	x8, x9, x8, ne
 425a904: b5000d68     	cbnz	x8, 0x425aab0 <_ChromeMain+0x4255814>
 425a908: 39477fe8     	ldrb	w8, [sp, #0x1df]
 425a90c: f940ebe9     	ldr	x9, [sp, #0x1d0]
 425a910: 7219011f     	tst	w8, #0x80
 425a914: 9a881128     	csel	x8, x9, x8, ne
 425a918: b4000cc8     	cbz	x8, 0x425aab0 <_ChromeMain+0x4255814>
 425a91c: a9327fbf     	stp	xzr, xzr, [x29, #-0xe0]
 425a920: f81303bf     	stur	xzr, [x29, #-0xd0]
 425a924: 910723e0     	add	x0, sp, #0x1c8
 425a928: d10383a2     	sub	x2, x29, #0xe0
 425a92c: aa1403e1     	mov	x1, x20
 425a930: 9400091c     	bl	0x425cda0 <_ChromeMain+0x4257b04>
 425a934: 34fff7e0     	cbz	w0, 0x425a830 <_ChromeMain+0x4255594>
 425a938: 39871fe8     	ldrsb	x8, [sp, #0x1c7]
 425a93c: a95b2be9     	ldp	x9, x10, [sp, #0x1b0]
 425a940: f100011f     	cmp	x8, #0x0
 425a944: 9a994120     	csel	x0, x9, x25, mi
 425a948: 7100011f     	cmp	w8, #0x0
 425a94c: 9a884141     	csel	x1, x10, x8, mi
 425a950: 6f00e400     	movi.2d	v0, #0000000000000000
 425a954: ad1d03e0     	stp	q0, q0, [sp, #0x3a0]
 425a958: 910e83e2     	add	x2, sp, #0x3a0
 425a95c: 972d8251     	bl	0xdbb2a0 <_ChromeMain+0xdb6004>
 425a960: 52800600     	mov	w0, #0x30               ; =48
 425a964: 96f6d281     	bl	0xf368 <_ChromeMain+0xa0cc>
 425a968: 91008008     	add	x8, x0, #0x20
 425a96c: eb00011f     	cmp	x8, x0
 425a970: 54ffd6c3     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425a974: aa0003f6     	mov	x22, x0
 425a978: eb0802bf     	cmp	x21, x8
 425a97c: fa4032a0     	ccmp	x21, x0, #0x0, lo
 425a980: 54ffd642     	b.hs	0x425a448 <_ChromeMain+0x42551ac>
 425a984: ad5d07e0     	ldp	q0, q1, [sp, #0x3a0]
 425a988: ad0006c0     	stp	q0, q1, [x22]
 425a98c: 390082df     	strb	wzr, [x22, #0x20]
 425a990: 389373a8     	ldursb	x8, [x29, #-0xc9]
 425a994: a9722ba9     	ldp	x9, x10, [x29, #-0xe0]
 425a998: f100011f     	cmp	x8, #0x0
 425a99c: 9a984120     	csel	x0, x9, x24, mi
 425a9a0: 7100011f     	cmp	w8, #0x0
 425a9a4: 9a884141     	csel	x1, x10, x8, mi
 425a9a8: aa1603e2     	mov	x2, x22
 425a9ac: 52800403     	mov	w3, #0x20               ; =32
 425a9b0: 52800004     	mov	w4, #0x0                ; =0
 425a9b4: 9726f26d     	bl	0xc17368 <_ChromeMain+0xc120cc>
 425a9b8: aa0003f7     	mov	x23, x0
 425a9bc: 340005c0     	cbz	w0, 0x425aa74 <_ChromeMain+0x42557d8>
 425a9c0: 385373a9     	ldurb	w9, [x29, #-0xc9]
 425a9c4: 13001d28     	sxtb	w8, w9
 425a9c8: f85283aa     	ldur	x10, [x29, #-0xd8]
 425a9cc: 7100011f     	cmp	w8, #0x0
 425a9d0: 9a894149     	csel	x9, x10, x9, mi
 425a9d4: f1007d3f     	cmp	x9, #0x1f
 425a9d8: 54003889     	b.ls	0x425b0e8 <_ChromeMain+0x4255e4c>
 425a9dc: f85203aa     	ldur	x10, [x29, #-0xe0]
 425a9e0: 7100011f     	cmp	w8, #0x0
 425a9e4: 9a984155     	csel	x21, x10, x24, mi
 425a9e8: d1008138     	sub	x24, x9, #0x20
 425a9ec: 92800208     	mov	x8, #-0x11              ; =-17
 425a9f0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 425a9f4: eb08031f     	cmp	x24, x8
 425a9f8: 540037a2     	b.hs	0x425b0ec <_ChromeMain+0x4255e50>
 425a9fc: f1005b1f     	cmp	x24, #0x16
 425aa00: 54000428     	b.hi	0x425aa84 <_ChromeMain+0x42557e8>
 425aa04: 390edff8     	strb	w24, [sp, #0x3b7]
 425aa08: 910e83f9     	add	x25, sp, #0x3a0
 425aa0c: 8b180328     	add	x8, x25, x24
 425aa10: eb19011f     	cmp	x8, x25
 425aa14: 54ffd1a3     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425aa18: 910082a1     	add	x1, x21, #0x20
 425aa1c: eb19003f     	cmp	x1, x25
 425aa20: 54000063     	b.lo	0x425aa2c <_ChromeMain+0x4255790>
 425aa24: eb08003f     	cmp	x1, x8
 425aa28: 54ffd103     	b.lo	0x425a448 <_ChromeMain+0x42551ac>
 425aa2c: aa1903e0     	mov	x0, x25
 425aa30: aa1803e2     	mov	x2, x24
 425aa34: 94f6d226     	bl	0x800f2cc <_ChromeMain+0x800a030>
 425aa38: 38386b3f     	strb	wzr, [x25, x24]
 425aa3c: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 425aa40: 36f800a8     	tbz	w8, #0x1f, 0x425aa54 <_ChromeMain+0x42557b8>
 425aa44: f940f3e0     	ldr	x0, [sp, #0x1e0]
 425aa48: f940fbe8     	ldr	x8, [sp, #0x1f0]
 425aa4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425aa50: 96f6b91a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425aa54: 9100079c     	add	x28, x28, #0x1
 425aa58: 3dc0ebe0     	ldr	q0, [sp, #0x3a0]
 425aa5c: 3d807be0     	str	q0, [sp, #0x1e0]
 425aa60: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425aa64: f900fbe8     	str	x8, [sp, #0x1f0]
 425aa68: d10383b8     	sub	x24, x29, #0xe0
 425aa6c: 910e83f5     	add	x21, sp, #0x3a0
 425aa70: 9106c3f9     	add	x25, sp, #0x1b0
 425aa74: aa1603e0     	mov	x0, x22
 425aa78: 52800601     	mov	w1, #0x30               ; =48
 425aa7c: 96f6b90f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425aa80: 17ffff6d     	b	0x425a834 <_ChromeMain+0x4255598>
 425aa84: 927ceb08     	and	x8, x24, #0x7ffffffffffffff0
 425aa88: 91004100     	add	x0, x8, #0x10
 425aa8c: 96f6d237     	bl	0xf368 <_ChromeMain+0xa0cc>
 425aa90: aa0003f9     	mov	x25, x0
 425aa94: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 425aa98: 927ceb09     	and	x9, x24, #0x7ffffffffffffff0
 425aa9c: cb080128     	sub	x8, x9, x8
 425aaa0: f901d3e0     	str	x0, [sp, #0x3a0]
 425aaa4: f901d7f8     	str	x24, [sp, #0x3a8]
 425aaa8: f901dbe8     	str	x8, [sp, #0x3b0]
 425aaac: 17ffffd8     	b	0x425aa0c <_ChromeMain+0x4255770>
 425aab0: 6f00e400     	movi.2d	v0, #0000000000000000
 425aab4: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 425aab8: ad3b03a0     	stp	q0, q0, [x29, #-0xa0]
 425aabc: ad3a03a0     	stp	q0, q0, [x29, #-0xc0]
 425aac0: ad3903a0     	stp	q0, q0, [x29, #-0xe0]
 425aac4: 910e83e8     	add	x8, sp, #0x3a0
 425aac8: 910803e0     	add	x0, sp, #0x200
 425aacc: 52800041     	mov	w1, #0x2                ; =2
 425aad0: 9711ee3a     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425aad4: 910803e0     	add	x0, sp, #0x200
 425aad8: 52800261     	mov	w1, #0x13               ; =19
 425aadc: 9711ed75     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425aae0: aa0003e1     	mov	x1, x0
 425aae4: d10383a8     	sub	x8, x29, #0xe0
 425aae8: 910e83e0     	add	x0, sp, #0x3a0
 425aaec: 952c650a     	bl	0x8d73f14 <_ChromeMain+0x8d6ec78>
 425aaf0: 39cedfe8     	ldrsb	w8, [sp, #0x3b7]
 425aaf4: 36f800a8     	tbz	w8, #0x1f, 0x425ab08 <_ChromeMain+0x425586c>
 425aaf8: f941d3e0     	ldr	x0, [sp, #0x3a0]
 425aafc: f941dbe8     	ldr	x8, [sp, #0x3b0]
 425ab00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ab04: 96f6b8ed     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ab08: 385203a8     	ldurb	w8, [x29, #-0xe0]
 425ab0c: 7100091f     	cmp	w8, #0x2
 425ab10: 54002f02     	b.hs	0x425b0f0 <_ChromeMain+0x4255e54>
 425ab14: 35001328     	cbnz	w8, 0x425ad78 <_ChromeMain+0x4255adc>
 425ab18: 910663e8     	add	x8, sp, #0x198
 425ab1c: 910803e0     	add	x0, sp, #0x200
 425ab20: 52800061     	mov	w1, #0x3                ; =3
 425ab24: 9711ee25     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ab28: 39c7dfe8     	ldrsb	w8, [sp, #0x1f7]
 425ab2c: 37f800c8     	tbnz	w8, #0x1f, 0x425ab44 <_ChromeMain+0x42558a8>
 425ab30: 3dc07be0     	ldr	q0, [sp, #0x1e0]
 425ab34: 3d8063e0     	str	q0, [sp, #0x180]
 425ab38: f940fbe8     	ldr	x8, [sp, #0x1f0]
 425ab3c: f900cbe8     	str	x8, [sp, #0x190]
 425ab40: 14000004     	b	0x425ab50 <_ChromeMain+0x42558b4>
 425ab44: a95e0be1     	ldp	x1, x2, [sp, #0x1e0]
 425ab48: 910603e0     	add	x0, sp, #0x180
 425ab4c: 96f6f5b3     	bl	0x18218 <_ChromeMain+0x12f7c>
 425ab50: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425ab54: f90027fb     	str	x27, [sp, #0x48]
 425ab58: 37f800c8     	tbnz	w8, #0x1f, 0x425ab70 <_ChromeMain+0x42558d4>
 425ab5c: 3dc06fe0     	ldr	q0, [sp, #0x1b0]
 425ab60: 3d805be0     	str	q0, [sp, #0x160]
 425ab64: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425ab68: f900bbe8     	str	x8, [sp, #0x170]
 425ab6c: 14000004     	b	0x425ab7c <_ChromeMain+0x42558e0>
 425ab70: a95b0be1     	ldp	x1, x2, [sp, #0x1b0]
 425ab74: 910583e0     	add	x0, sp, #0x160
 425ab78: 96f6f5a8     	bl	0x18218 <_ChromeMain+0x12f7c>
 425ab7c: 910523e8     	add	x8, sp, #0x148
 425ab80: 910803e0     	add	x0, sp, #0x200
 425ab84: 528000c1     	mov	w1, #0x6                ; =6
 425ab88: 9711ee0c     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ab8c: 910803e0     	add	x0, sp, #0x200
 425ab90: 52800001     	mov	w1, #0x0                ; =0
 425ab94: 9711ec27     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ab98: f9001fe0     	str	x0, [sp, #0x38]
 425ab9c: 910803e0     	add	x0, sp, #0x200
 425aba0: 528000e1     	mov	w1, #0x7                ; =7
 425aba4: 9711ec23     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425aba8: f9001be0     	str	x0, [sp, #0x30]
 425abac: 910803e0     	add	x0, sp, #0x200
 425abb0: 52800141     	mov	w1, #0xa                ; =10
 425abb4: 9711ec1f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abb8: f90017e0     	str	x0, [sp, #0x28]
 425abbc: 910803e0     	add	x0, sp, #0x200
 425abc0: 52800221     	mov	w1, #0x11               ; =17
 425abc4: 9711ec1b     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abc8: aa0003f9     	mov	x25, x0
 425abcc: 910803e0     	add	x0, sp, #0x200
 425abd0: 52800101     	mov	w1, #0x8                ; =8
 425abd4: 9711ed37     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425abd8: aa0003f5     	mov	x21, x0
 425abdc: 910803e0     	add	x0, sp, #0x200
 425abe0: 52800121     	mov	w1, #0x9                ; =9
 425abe4: 9711ed33     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425abe8: aa0003fb     	mov	x27, x0
 425abec: 910803e0     	add	x0, sp, #0x200
 425abf0: 528001c1     	mov	w1, #0xe                ; =14
 425abf4: 9711ec0f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425abf8: 71000c1f     	cmp	w0, #0x3
 425abfc: 5a9f3016     	csinv	w22, w0, wzr, lo
 425ac00: 910803e0     	add	x0, sp, #0x200
 425ac04: 528001a1     	mov	w1, #0xd                ; =13
 425ac08: 9711ec0a     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac0c: 7100081f     	cmp	w0, #0x2
 425ac10: 52800028     	mov	w8, #0x1                ; =1
 425ac14: 1a881508     	cinc	w8, w8, eq
 425ac18: 7100001f     	cmp	w0, #0x0
 425ac1c: 1a8803f7     	csel	w23, wzr, w8, eq
 425ac20: 385203a8     	ldurb	w8, [x29, #-0xe0]
 425ac24: 350026c8     	cbnz	w8, 0x425b0fc <_ChromeMain+0x4255e60>
 425ac28: f90023fc     	str	x28, [sp, #0x40]
 425ac2c: 390343ff     	strb	wzr, [sp, #0xd0]
 425ac30: 390503ff     	strb	wzr, [sp, #0x140]
 425ac34: 385983a8     	ldurb	w8, [x29, #-0x68]
 425ac38: 34000168     	cbz	w8, 0x425ac64 <_ChromeMain+0x42559c8>
 425ac3c: 910343e0     	add	x0, sp, #0xd0
 425ac40: 91002301     	add	x1, x24, #0x8
 425ac44: 5280003c     	mov	w28, #0x1               ; =1
 425ac48: 96f83503     	bl	0x68054 <_ChromeMain+0x62db8>
 425ac4c: 3cc58300     	ldur	q0, [x24, #0x58]
 425ac50: 910343e8     	add	x8, sp, #0xd0
 425ac54: 3c850100     	stur	q0, [x8, #0x50]
 425ac58: 3cc64300     	ldur	q0, [x24, #0x64]
 425ac5c: 3c85c100     	stur	q0, [x8, #0x5c]
 425ac60: 390503fc     	strb	w28, [sp, #0x140]
 425ac64: 910803e0     	add	x0, sp, #0x200
 425ac68: 528001e1     	mov	w1, #0xf                ; =15
 425ac6c: 9711ebf1     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac70: 7100081f     	cmp	w0, #0x2
 425ac74: 1a8083f8     	csel	w24, wzr, w0, hi
 425ac78: 910803e0     	add	x0, sp, #0x200
 425ac7c: 52800201     	mov	w1, #0x10               ; =16
 425ac80: 9711ebec     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac84: aa0003fc     	mov	x28, x0
 425ac88: 910803e0     	add	x0, sp, #0x200
 425ac8c: 52800241     	mov	w1, #0x12               ; =18
 425ac90: 9711ebe8     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ac94: 7100081f     	cmp	w0, #0x2
 425ac98: 52800048     	mov	w8, #0x2                ; =2
 425ac9c: 1a880508     	cinc	w8, w8, ne
 425aca0: 7100041f     	cmp	w0, #0x1
 425aca4: 1a9f1508     	csinc	w8, w8, wzr, ne
 425aca8: 290373f8     	stp	w24, w28, [sp, #0x18]
 425acac: 910343e9     	add	x9, sp, #0xd0
 425acb0: f9000be9     	str	x9, [sp, #0x10]
 425acb4: 2900dff6     	stp	w22, w23, [sp, #0x4]
 425acb8: 390007fb     	strb	w27, [sp, #0x1]
 425acbc: 910663e0     	add	x0, sp, #0x198
 425acc0: 910603e1     	add	x1, sp, #0x180
 425acc4: 910583e2     	add	x2, sp, #0x160
 425acc8: 910523e3     	add	x3, sp, #0x148
 425accc: 390003f5     	strb	w21, [sp]
 425acd0: 528000a9     	mov	w9, #0x5                ; =5
 425acd4: 290427e8     	stp	w8, w9, [sp, #0x20]
 425acd8: a94313e5     	ldp	x5, x4, [sp, #0x30]
 425acdc: f94017e6     	ldr	x6, [sp, #0x28]
 425ace0: aa1903e7     	mov	x7, x25
 425ace4: 97664a3b     	bl	0x1bed5d0 <_ChromeMain+0x1be8334>
 425ace8: aa0003f6     	mov	x22, x0
 425acec: 394503e8     	ldrb	w8, [sp, #0x140]
 425acf0: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 425acf4: 910e83f5     	add	x21, sp, #0x3a0
 425acf8: 9106c3f9     	add	x25, sp, #0x1b0
 425acfc: 340000a8     	cbz	w8, 0x425ad10 <_ChromeMain+0x4255a74>
 425ad00: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 425ad04: 37f81d08     	tbnz	w8, #0x1f, 0x425b0a4 <_ChromeMain+0x4255e08>
 425ad08: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 425ad0c: 37f82048     	tbnz	w8, #0x1f, 0x425b114 <_ChromeMain+0x4255e78>
 425ad10: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 425ad14: 36f800a8     	tbz	w8, #0x1f, 0x425ad28 <_ChromeMain+0x4255a8c>
 425ad18: f940a7e0     	ldr	x0, [sp, #0x148]
 425ad1c: f940afe8     	ldr	x8, [sp, #0x158]
 425ad20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad24: 96f6b865     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad28: 39c5dfe8     	ldrsb	w8, [sp, #0x177]
 425ad2c: d10383b8     	sub	x24, x29, #0xe0
 425ad30: 36f800a8     	tbz	w8, #0x1f, 0x425ad44 <_ChromeMain+0x4255aa8>
 425ad34: f940b3e0     	ldr	x0, [sp, #0x160]
 425ad38: f940bbe8     	ldr	x8, [sp, #0x170]
 425ad3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad40: 96f6b85e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad44: 39c65fe8     	ldrsb	w8, [sp, #0x197]
 425ad48: 36f800a8     	tbz	w8, #0x1f, 0x425ad5c <_ChromeMain+0x4255ac0>
 425ad4c: f940c3e0     	ldr	x0, [sp, #0x180]
 425ad50: f940cbe8     	ldr	x8, [sp, #0x190]
 425ad54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad58: 96f6b858     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad5c: 39c6bfe8     	ldrsb	w8, [sp, #0x1af]
 425ad60: 36f800a8     	tbz	w8, #0x1f, 0x425ad74 <_ChromeMain+0x4255ad8>
 425ad64: f940cfe0     	ldr	x0, [sp, #0x198]
 425ad68: f940d7e8     	ldr	x8, [sp, #0x1a8]
 425ad6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ad70: 96f6b852     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ad74: b5000096     	cbnz	x22, 0x425ad84 <_ChromeMain+0x4255ae8>
 425ad78: d10383a0     	sub	x0, x29, #0xe0
 425ad7c: 94c79387     	bl	0x743fb98 <_ChromeMain+0x743a8fc>
 425ad80: 17fffeb5     	b	0x425a854 <_ChromeMain+0x42555b8>
