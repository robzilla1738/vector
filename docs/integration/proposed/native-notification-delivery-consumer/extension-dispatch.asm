
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40fa6cc: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40fa6d0: a90167fa     	stp	x26, x25, [sp, #0x10]
 40fa6d4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40fa6d8: a90357f6     	stp	x22, x21, [sp, #0x30]
 40fa6dc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40fa6e0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40fa6e4: 910143fd     	add	x29, sp, #0x50
 40fa6e8: d10f03ff     	sub	sp, sp, #0x3c0
 40fa6ec: aa0203f6     	mov	x22, x2
 40fa6f0: aa0103f4     	mov	x20, x1
 40fa6f4: aa0003f5     	mov	x21, x0
 40fa6f8: 97569c5d     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 40fa6fc: b4000420     	cbz	x0, 0x40fa780 <_ChromeMain+0x40f54e4>
 40fa700: aa0003f3     	mov	x19, x0
 40fa704: 910923fc     	add	x28, sp, #0x248
 40fa708: 52800600     	mov	w0, #0x30               ; =48
 40fa70c: 96fc5317     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fa710: f90127e0     	str	x0, [sp, #0x248]
 40fa714: b004f208     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 40fa718: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 40fa71c: 3c808380     	stur	q0, [x28, #0x8]
 40fa720: 91008008     	add	x8, x0, #0x20
 40fa724: eb00011f     	cmp	x8, x0
 40fa728: 540024a3     	b.lo	0x40fabbc <_ChromeMain+0x40f5920>
 40fa72c: 3d800fe0     	str	q0, [sp, #0x30]
 40fa730: d0046a79     	adrp	x25, 0xce48000 <dyld_stub_binder+0xce48000>
 40fa734: 91252739     	add	x25, x25, #0x949
 40fa738: eb19011f     	cmp	x8, x25
 40fa73c: fa598002     	ccmp	x0, x25, #0x2, hi
 40fa740: 540023e9     	b.ls	0x40fabbc <_ChromeMain+0x40f5920>
 40fa744: ad400720     	ldp	q0, q1, [x25]
 40fa748: ad0083e1     	stp	q1, q0, [sp, #0x10]
 40fa74c: ad000400     	stp	q0, q1, [x0]
 40fa750: 3900801f     	strb	wzr, [x0, #0x20]
 40fa754: 91002260     	add	x0, x19, #0x8
 40fa758: 910923e1     	add	x1, sp, #0x248
 40fa75c: 972c0aea     	bl	0xbfd304 <_ChromeMain+0xbf8068>
 40fa760: aa0003f3     	mov	x19, x0
 40fa764: 39c97fe8     	ldrsb	w8, [sp, #0x25f]
 40fa768: 36f800a8     	tbz	w8, #0x1f, 0x40fa77c <_ChromeMain+0x40f54e0>
 40fa76c: f94127e0     	ldr	x0, [sp, #0x248]
 40fa770: f9412fe8     	ldr	x8, [sp, #0x258]
 40fa774: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fa778: 96fc39d0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa77c: b5000273     	cbnz	x19, 0x40fa7c8 <_ChromeMain+0x40f552c>
 40fa780: 910f03ff     	add	sp, sp, #0x3c0
 40fa784: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40fa788: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40fa78c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40fa790: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40fa794: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40fa798: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40fa79c: d65f03c0     	ret
 40fa7a0: 927ceab8     	and	x24, x21, #0x7ffffffffffffff0
 40fa7a4: 91004300     	add	x0, x24, #0x10
 40fa7a8: 96fc52f0     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fa7ac: aa0003f7     	mov	x23, x0
 40fa7b0: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 40fa7b4: cb080308     	sub	x8, x24, x8
 40fa7b8: f9016fe0     	str	x0, [sp, #0x2d8]
 40fa7bc: f90173f5     	str	x21, [sp, #0x2e0]
 40fa7c0: f90177e8     	str	x8, [sp, #0x2e8]
 40fa7c4: 1400004a     	b	0x40fa8ec <_ChromeMain+0x40f5650>
 40fa7c8: aa1503e0     	mov	x0, x21
 40fa7cc: 94b532ac     	bl	0x6e4727c <_ChromeMain+0x6e41fe0>
 40fa7d0: b4fffd80     	cbz	x0, 0x40fa780 <_ChromeMain+0x40f54e4>
 40fa7d4: aa0003f3     	mov	x19, x0
 40fa7d8: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 40fa7dc: f81403bf     	stur	xzr, [x29, #-0xc0]
 40fa7e0: f90127f6     	str	x22, [sp, #0x248]
 40fa7e4: 528000c8     	mov	w8, #0x6                ; =6
 40fa7e8: 390963e8     	strb	w8, [sp, #0x258]
 40fa7ec: 910923e0     	add	x0, sp, #0x248
 40fa7f0: d10343a2     	sub	x2, x29, #0xd0
 40fa7f4: 52800001     	mov	w1, #0x0                ; =0
 40fa7f8: 52801903     	mov	w3, #0xc8               ; =200
 40fa7fc: 97993fe9     	bl	0x274a7a0 <_ChromeMain+0x2745504>
 40fa800: 36001ee0     	tbz	w0, #0x0, 0x40fabdc <_ChromeMain+0x40f5940>
 40fa804: d10203a8     	sub	x8, x29, #0x80
 40fa808: a9736fba     	ldp	x26, x27, [x29, #-0xd0]
 40fa80c: f85403b6     	ldur	x22, [x29, #-0xc0]
 40fa810: 6f00e400     	movi.2d	v0, #0000000000000000
 40fa814: ad000100     	stp	q0, q0, [x8]
 40fa818: f9012bff     	str	xzr, [sp, #0x250]
 40fa81c: f90127ff     	str	xzr, [sp, #0x248]
 40fa820: f0057068     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 40fa824: 394fe108     	ldrb	w8, [x8, #0x3f8]
 40fa828: 34001b48     	cbz	w8, 0x40fab90 <_ChromeMain+0x40f58f4>
 40fa82c: 910923e0     	add	x0, sp, #0x248
 40fa830: 52800201     	mov	w1, #0x10               ; =16
 40fa834: 96ff65df     	bl	0xd3fb0 <_ChromeMain+0xced14>
 40fa838: f94127e8     	ldr	x8, [sp, #0x248]
 40fa83c: f9412be9     	ldr	x9, [sp, #0x250]
 40fa840: aa09010a     	orr	x10, x8, x9
 40fa844: b4001c0a     	cbz	x10, 0x40fabc4 <_ChromeMain+0x40f5928>
 40fa848: f90007f6     	str	x22, [sp, #0x8]
 40fa84c: a93827a8     	stp	x8, x9, [x29, #-0x80]
 40fa850: 52800028     	mov	w8, #0x1                ; =1
 40fa854: b81903a8     	stur	w8, [x29, #-0x70]
 40fa858: 381943a8     	sturb	w8, [x29, #-0x6c]
 40fa85c: b81983a8     	stur	w8, [x29, #-0x68]
 40fa860: f9403677     	ldr	x23, [x19, #0x68]
 40fa864: b40000b7     	cbz	x23, 0x40fa878 <_ChromeMain+0x40f55dc>
 40fa868: b82802e8     	ldadd	w8, w8, [x23]
 40fa86c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40fa870: 6b09011f     	cmp	w8, w9
 40fa874: 54001ae0     	b.eq	0x40fabd0 <_ChromeMain+0x40f5934>
 40fa878: f9403a68     	ldr	x8, [x19, #0x70]
 40fa87c: 91002109     	add	x9, x8, #0x8
 40fa880: f100011f     	cmp	x8, #0x0
 40fa884: 9a8903f8     	csel	x24, xzr, x9, eq
 40fa888: 52801100     	mov	w0, #0x88               ; =136
 40fa88c: 96fc52b7     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fa890: aa0003f6     	mov	x22, x0
 40fa894: d10203a3     	sub	x3, x29, #0x80
 40fa898: aa1703e1     	mov	x1, x23
 40fa89c: aa1803e2     	mov	x2, x24
 40fa8a0: 94b53068     	bl	0x6e46a40 <_ChromeMain+0x6e417a4>
 40fa8a4: 90050588     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 40fa8a8: 913ea108     	add	x8, x8, #0xfa8
 40fa8ac: f9000008     	str	x8, [x0]
 40fa8b0: d10343a0     	sub	x0, x29, #0xd0
 40fa8b4: aa1503e1     	mov	x1, x21
 40fa8b8: 94b5206d     	bl	0x6e42a6c <_ChromeMain+0x6e3d7d0>
 40fa8bc: b4001814     	cbz	x20, 0x40fabbc <_ChromeMain+0x40f5920>
 40fa8c0: aa1403e0     	mov	x0, x20
 40fa8c4: 94fc22b6     	bl	0x800339c <_ChromeMain+0x7ffe100>
 40fa8c8: 92800208     	mov	x8, #-0x11              ; =-17
 40fa8cc: f2efffe8     	movk	x8, #0x7fff, lsl #48
 40fa8d0: eb08001f     	cmp	x0, x8
 40fa8d4: 54001762     	b.hs	0x40fabc0 <_ChromeMain+0x40f5924>
 40fa8d8: aa0003f5     	mov	x21, x0
 40fa8dc: f100581f     	cmp	x0, #0x16
 40fa8e0: 54fff608     	b.hi	0x40fa7a0 <_ChromeMain+0x40f5504>
 40fa8e4: 390bbff5     	strb	w21, [sp, #0x2ef]
 40fa8e8: 910b63f7     	add	x23, sp, #0x2d8
 40fa8ec: 8b1502e8     	add	x8, x23, x21
 40fa8f0: eb17011f     	cmp	x8, x23
 40fa8f4: 54001643     	b.lo	0x40fabbc <_ChromeMain+0x40f5920>
 40fa8f8: eb08029f     	cmp	x20, x8
 40fa8fc: fa573280     	ccmp	x20, x23, #0x0, lo
 40fa900: 540015e2     	b.hs	0x40fabbc <_ChromeMain+0x40f5920>
 40fa904: aa1703e0     	mov	x0, x23
 40fa908: aa1403e1     	mov	x1, x20
 40fa90c: aa1503e2     	mov	x2, x21
 40fa910: 94fc3cfa     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 40fa914: 38356aff     	strb	wzr, [x23, x21]
 40fa918: 6f00e400     	movi.2d	v0, #0000000000000000
 40fa91c: 3c8a8380     	stur	q0, [x28, #0xa8]
 40fa920: 3c8d8380     	stur	q0, [x28, #0xd8]
 40fa924: 3c8c8380     	stur	q0, [x28, #0xc8]
 40fa928: 3c8b8380     	stur	q0, [x28, #0xb8]
 40fa92c: 52800088     	mov	w8, #0x4                ; =4
 40fa930: b902f3e8     	str	w8, [sp, #0x2f0]
 40fa934: f94177e8     	ldr	x8, [sp, #0x2e8]
 40fa938: f9019bff     	str	xzr, [sp, #0x330]
 40fa93c: f90197e8     	str	x8, [sp, #0x328]
 40fa940: 910767e8     	add	x8, sp, #0x1d9
 40fa944: 3ccff100     	ldur	q0, [x8, #0xff]
 40fa948: 3c8d0380     	stur	q0, [x28, #0xd0]
 40fa94c: f90177ff     	str	xzr, [sp, #0x2e8]
 40fa950: f90173ff     	str	xzr, [sp, #0x2e0]
 40fa954: f9016fff     	str	xzr, [sp, #0x2d8]
 40fa958: 52800028     	mov	w8, #0x1                ; =1
 40fa95c: 390cc3e8     	strb	w8, [sp, #0x330]
 40fa960: 52800600     	mov	w0, #0x30               ; =48
 40fa964: 96fc5281     	bl	0xf368 <_ChromeMain+0xa0cc>
 40fa968: f90163e0     	str	x0, [sp, #0x2c0]
 40fa96c: 3dc00fe0     	ldr	q0, [sp, #0x30]
 40fa970: 3c880380     	stur	q0, [x28, #0x80]
 40fa974: 91008008     	add	x8, x0, #0x20
 40fa978: eb00011f     	cmp	x8, x0
 40fa97c: 54001203     	b.lo	0x40fabbc <_ChromeMain+0x40f5920>
 40fa980: eb19011f     	cmp	x8, x25
 40fa984: fa598002     	ccmp	x0, x25, #0x2, hi
 40fa988: 540011a9     	b.ls	0x40fabbc <_ChromeMain+0x40f5920>
 40fa98c: ad4087e0     	ldp	q0, q1, [sp, #0x10]
 40fa990: ad000001     	stp	q1, q0, [x0]
 40fa994: 3900801f     	strb	wzr, [x0, #0x20]
 40fa998: 910923f4     	add	x20, sp, #0x248
 40fa99c: f9012bff     	str	xzr, [sp, #0x250]
 40fa9a0: f90127ff     	str	xzr, [sp, #0x248]
 40fa9a4: b801739f     	stur	wzr, [x28, #0x17]
 40fa9a8: f9012fff     	str	xzr, [sp, #0x258]
 40fa9ac: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 40fa9b0: 9105a7e8     	add	x8, sp, #0x169
 40fa9b4: 3c8ff100     	stur	q0, [x8, #0xff]
 40fa9b8: 9105e7e8     	add	x8, sp, #0x179
 40fa9bc: 3c8ff100     	stur	q0, [x8, #0xff]
 40fa9c0: 910627e8     	add	x8, sp, #0x189
 40fa9c4: 3c8ff100     	stur	q0, [x8, #0xff]
 40fa9c8: 910667e8     	add	x8, sp, #0x199
 40fa9cc: 3c8ff100     	stur	q0, [x8, #0xff]
 40fa9d0: 790553ff     	strh	wzr, [sp, #0x2a8]
 40fa9d4: f9015fff     	str	xzr, [sp, #0x2b8]
 40fa9d8: f9015bff     	str	xzr, [sp, #0x2b0]
 40fa9dc: f9011fff     	str	xzr, [sp, #0x238]
 40fa9e0: f9011bff     	str	xzr, [sp, #0x230]
 40fa9e4: f90123ff     	str	xzr, [sp, #0x240]
 40fa9e8: 9108c3e8     	add	x8, sp, #0x230
 40fa9ec: f90003e8     	str	x8, [sp]
 40fa9f0: d10343a1     	sub	x1, x29, #0xd0
 40fa9f4: d10203a2     	sub	x2, x29, #0x80
 40fa9f8: 910bc3e3     	add	x3, sp, #0x2f0
 40fa9fc: 910b03e5     	add	x5, sp, #0x2c0
 40faa00: 910923e6     	add	x6, sp, #0x248
 40faa04: aa1303e0     	mov	x0, x19
 40faa08: aa1603e4     	mov	x4, x22
 40faa0c: 52800007     	mov	w7, #0x0                ; =0
 40faa10: 94b53227     	bl	0x6e472ac <_ChromeMain+0x6e42010>
 40faa14: 39c91fe8     	ldrsb	w8, [sp, #0x247]
 40faa18: 36f800a8     	tbz	w8, #0x1f, 0x40faa2c <_ChromeMain+0x40f5790>
 40faa1c: f9411be0     	ldr	x0, [sp, #0x230]
 40faa20: f94123e8     	ldr	x8, [sp, #0x240]
 40faa24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40faa28: 96fc3924     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40faa2c: 9101c280     	add	x0, x20, #0x70
 40faa30: d2800001     	mov	x1, #0x0                ; =0
 40faa34: 96fcb4a1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40faa38: 91008280     	add	x0, x20, #0x20
 40faa3c: 96fcb48f     	bl	0x27c78 <_ChromeMain+0x229dc>
 40faa40: 39c97fe8     	ldrsb	w8, [sp, #0x25f]
 40faa44: f94007f4     	ldr	x20, [sp, #0x8]
 40faa48: 36f800a8     	tbz	w8, #0x1f, 0x40faa5c <_ChromeMain+0x40f57c0>
 40faa4c: f94127e0     	ldr	x0, [sp, #0x248]
 40faa50: f9412fe8     	ldr	x8, [sp, #0x258]
 40faa54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40faa58: 96fc3918     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40faa5c: 39cb5fe8     	ldrsb	w8, [sp, #0x2d7]
 40faa60: 36f800a8     	tbz	w8, #0x1f, 0x40faa74 <_ChromeMain+0x40f57d8>
 40faa64: f94163e0     	ldr	x0, [sp, #0x2c0]
 40faa68: f9416be8     	ldr	x8, [sp, #0x2d0]
 40faa6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40faa70: 96fc3912     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40faa74: 910bc3e0     	add	x0, sp, #0x2f0
 40faa78: 95858898     	bl	0xa25ccd8 <_ChromeMain+0xa257a3c>
 40faa7c: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 40faa80: 36f800a8     	tbz	w8, #0x1f, 0x40faa94 <_ChromeMain+0x40f57f8>
 40faa84: f9416fe0     	ldr	x0, [sp, #0x2d8]
 40faa88: f94177e8     	ldr	x8, [sp, #0x2e8]
 40faa8c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40faa90: 96fc390a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40faa94: 385783a8     	ldurb	w8, [x29, #-0x88]
 40faa98: 340000e8     	cbz	w8, 0x40faab4 <_ChromeMain+0x40f5818>
 40faa9c: 38d773a8     	ldursb	w8, [x29, #-0x89]
 40faaa0: 36f800a8     	tbz	w8, #0x1f, 0x40faab4 <_ChromeMain+0x40f5818>
 40faaa4: f85603a0     	ldur	x0, [x29, #-0xa0]
 40faaa8: f85703a8     	ldur	x8, [x29, #-0x90]
 40faaac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40faab0: 96fc3902     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40faab4: f85303a0     	ldur	x0, [x29, #-0xd0]
 40faab8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 40faabc: 900555c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40faac0: f9404529     	ldr	x9, [x9, #0x88]
 40faac4: eb09011f     	cmp	x8, x9
 40faac8: 54000041     	b.ne	0x40faad0 <_ChromeMain+0x40f5834>
 40faacc: 96fc9fdc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 40faad0: a904effa     	stp	x26, x27, [sp, #0x48]
 40faad4: f9002ff4     	str	x20, [sp, #0x58]
 40faad8: 3904c3ff     	strb	wzr, [sp, #0x130]
 40faadc: 3904e3ff     	strb	wzr, [sp, #0x138]
 40faae0: 52801ff4     	mov	w20, #0xff              ; =255
 40faae4: 390883f4     	strb	w20, [sp, #0x220]
 40faae8: 9104e3e0     	add	x0, sp, #0x138
 40faaec: 910123e1     	add	x1, sp, #0x48
 40faaf0: 94b009fd     	bl	0x6cfd2e4 <_ChromeMain+0x6cf8048>
 40faaf4: 790453ff     	strh	wzr, [sp, #0x228]
 40faaf8: d10203a1     	sub	x1, x29, #0x80
 40faafc: 9104e3e2     	add	x2, sp, #0x138
 40fab00: aa1303e0     	mov	x0, x19
 40fab04: 94b53bbe     	bl	0x6e499fc <_ChromeMain+0x6e44760>
 40fab08: 9104e3e0     	add	x0, sp, #0x138
 40fab0c: 958586a5     	bl	0xa25c5a0 <_ChromeMain+0xa257304>
 40fab10: 3944c3e8     	ldrb	w8, [sp, #0x130]
 40fab14: 7103fd1f     	cmp	w8, #0xff
 40fab18: 54000160     	b.eq	0x40fab44 <_ChromeMain+0x40f58a8>
 40fab1c: 35000108     	cbnz	w8, 0x40fab3c <_ChromeMain+0x40f58a0>
 40fab20: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 40fab24: 36f80108     	tbz	w8, #0x1f, 0x40fab44 <_ChromeMain+0x40f58a8>
 40fab28: f94027e0     	ldr	x0, [sp, #0x48]
 40fab2c: f9402fe8     	ldr	x8, [sp, #0x58]
 40fab30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fab34: 96fc38e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fab38: 14000003     	b	0x40fab44 <_ChromeMain+0x40f58a8>
 40fab3c: 910123e0     	add	x0, sp, #0x48
 40fab40: 97ab3e0c     	bl	0x2bca370 <_ChromeMain+0x2bc50d4>
 40fab44: 3904c3f4     	strb	w20, [sp, #0x130]
 40fab48: f9012bff     	str	xzr, [sp, #0x250]
 40fab4c: f90127ff     	str	xzr, [sp, #0x248]
 40fab50: f9012fff     	str	xzr, [sp, #0x258]
 40fab54: d10203a1     	sub	x1, x29, #0x80
 40fab58: 910923e6     	add	x6, sp, #0x248
 40fab5c: aa1303e0     	mov	x0, x19
 40fab60: 12800002     	mov	w2, #-0x1               ; =-1
 40fab64: 12800023     	mov	w3, #-0x2               ; =-2
 40fab68: 52800004     	mov	w4, #0x0                ; =0
 40fab6c: 52800025     	mov	w5, #0x1                ; =1
 40fab70: 94b53ae5     	bl	0x6e49704 <_ChromeMain+0x6e44468>
 40fab74: 39c97fe8     	ldrsb	w8, [sp, #0x25f]
 40fab78: 36ffe048     	tbz	w8, #0x1f, 0x40fa780 <_ChromeMain+0x40f54e4>
 40fab7c: f94127e0     	ldr	x0, [sp, #0x248]
 40fab80: f9412fe8     	ldr	x8, [sp, #0x258]
 40fab84: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fab88: 96fc38cc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fab8c: 17fffefd     	b	0x40fa780 <_ChromeMain+0x40f54e4>
 40fab90: 910923e0     	add	x0, sp, #0x248
 40fab94: 52800201     	mov	w1, #0x10               ; =16
 40fab98: 94fc7cbb     	bl	0x8019e84 <_ChromeMain+0x8014be8>
 40fab9c: 34ffe4e0     	cbz	w0, 0x40fa838 <_ChromeMain+0x40f559c>
 40faba0: 951c2b62     	bl	0x8805928 <_ChromeMain+0x880068c>
 40faba4: 910923e1     	add	x1, sp, #0x248
 40faba8: 52800202     	mov	w2, #0x10               ; =16
 40fabac: 978373d3     	bl	0x21d7af8 <_ChromeMain+0x21d285c>
 40fabb0: 3707e440     	tbnz	w0, #0x0, 0x40fa838 <_ChromeMain+0x40f559c>
 40fabb4: d4200000     	brk	#0
 40fabb8: d4400000     	hlt	#0
 40fabbc: d4200020     	brk	#0x1
 40fabc0: 942c15f3     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 40fabc4: d4200000     	brk	#0
 40fabc8: d4400000     	hlt	#0
 40fabcc: d4200020     	brk	#0x1
 40fabd0: d4200000     	brk	#0
 40fabd4: d4400000     	hlt	#0
 40fabd8: d4200020     	brk	#0x1
 40fabdc: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 40fabe0: 36ffdd08     	tbz	w8, #0x1f, 0x40fa780 <_ChromeMain+0x40f54e4>
 40fabe4: f85303a0     	ldur	x0, [x29, #-0xd0]
