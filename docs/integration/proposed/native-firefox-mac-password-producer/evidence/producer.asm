
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46be6c8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 46be6cc: a90157f6     	stp	x22, x21, [sp, #0x10]
 46be6d0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 46be6d4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 46be6d8: 9100c3fd     	add	x29, sp, #0x30
 46be6dc: d10783ff     	sub	sp, sp, #0x1e0
 46be6e0: aa0003f3     	mov	x19, x0
 46be6e4: 7940d008     	ldrh	w8, [x0, #0x68]
 46be6e8: 36180788     	tbz	w8, #0x3, 0x46be7d8 <_ChromeMain+0x46b953c>
 46be6ec: 39406269     	ldrb	w9, [x19, #0x18]
 46be6f0: 37000749     	tbnz	w9, #0x0, 0x46be7d8 <_ChromeMain+0x46b953c>
 46be6f4: f9400a60     	ldr	x0, [x19, #0x10]
 46be6f8: f9400008     	ldr	x8, [x0]
 46be6fc: f9402508     	ldr	x8, [x8, #0x48]
 46be700: 52800101     	mov	w1, #0x8                ; =8
 46be704: d63f0100     	blr	x8
 46be708: a93bffbf     	stp	xzr, xzr, [x29, #-0x48]
 46be70c: 91008275     	add	x21, x19, #0x20
 46be710: f81c83bf     	stur	xzr, [x29, #-0x38]
 46be714: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46be718: 913dcc21     	add	x1, x1, #0xf73
 46be71c: d10123b4     	sub	x20, x29, #0x48
 46be720: d10123a8     	sub	x8, x29, #0x48
 46be724: 91008260     	add	x0, x19, #0x20
 46be728: 52800162     	mov	w2, #0xb                ; =11
 46be72c: 973f6b3a     	bl	0x1699414 <_ChromeMain+0x1694178>
 46be730: 6f00e400     	movi.2d	v0, #0000000000000000
 46be734: ad0203e0     	stp	q0, q0, [sp, #0x40]
 46be738: ad0103e0     	stp	q0, q0, [sp, #0x20]
 46be73c: d0049620     	adrp	x0, 0xd984000 <dyld_stub_binder+0xd984000>
 46be740: 911a9800     	add	x0, x0, #0x6a6
 46be744: 9004a561     	adrp	x1, 0xdb6a000 <dyld_stub_binder+0xdb6a000>
 46be748: 91311421     	add	x1, x1, #0xc45
 46be74c: d10303a8     	sub	x8, x29, #0xc0
 46be750: 52804fa2     	mov	w2, #0x27d              ; =637
 46be754: 96e6494b     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 46be758: 910083e0     	add	x0, sp, #0x20
 46be75c: d10303a1     	sub	x1, x29, #0xc0
 46be760: 52800002     	mov	w2, #0x0                ; =0
 46be764: 97074ba8     	bl	0x891604 <_ChromeMain+0x88c368>
 46be768: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 46be76c: f85b83a9     	ldur	x9, [x29, #-0x48]
 46be770: 7100011f     	cmp	w8, #0x0
 46be774: 9a944120     	csel	x0, x9, x20, mi
 46be778: 52800001     	mov	w1, #0x0                ; =0
 46be77c: 95634d65     	bl	0x9f91d10 <_ChromeMain+0x9f8ca74>
 46be780: aa0003f4     	mov	x20, x0
 46be784: 910083e0     	add	x0, sp, #0x20
 46be788: 970ec0ff     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 46be78c: 34000634     	cbz	w20, 0x46be850 <_ChromeMain+0x46b95b4>
 46be790: d2800014     	mov	x20, #0x0               ; =0
 46be794: 52800035     	mov	w21, #0x1               ; =1
 46be798: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 46be79c: 37f80368     	tbnz	w8, #0x1f, 0x46be808 <_ChromeMain+0x46b956c>
 46be7a0: d360fe88     	lsr	x8, x20, #32
 46be7a4: b5001c28     	cbnz	x8, 0x46beb28 <_ChromeMain+0x46b988c>
 46be7a8: f9400a60     	ldr	x0, [x19, #0x10]
 46be7ac: f9400008     	ldr	x8, [x0]
 46be7b0: f9401908     	ldr	x8, [x8, #0x30]
 46be7b4: aa1503e1     	mov	x1, x21
 46be7b8: aa1403e2     	mov	x2, x20
 46be7bc: d63f0100     	blr	x8
 46be7c0: f9400a60     	ldr	x0, [x19, #0x10]
 46be7c4: f9400008     	ldr	x8, [x0]
 46be7c8: f9402908     	ldr	x8, [x8, #0x50]
 46be7cc: 52800101     	mov	w1, #0x8                ; =8
 46be7d0: d63f0100     	blr	x8
 46be7d4: 7940d268     	ldrh	w8, [x19, #0x68]
 46be7d8: 36300068     	tbz	w8, #0x6, 0x46be7e4 <_ChromeMain+0x46b9548>
 46be7dc: 39406268     	ldrb	w8, [x19, #0x18]
 46be7e0: 360001e8     	tbz	w8, #0x0, 0x46be81c <_ChromeMain+0x46b9580>
 46be7e4: f9400a60     	ldr	x0, [x19, #0x10]
 46be7e8: f9400008     	ldr	x8, [x0]
 46be7ec: f9402d01     	ldr	x1, [x8, #0x58]
 46be7f0: 910783ff     	add	sp, sp, #0x1e0
 46be7f4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46be7f8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46be7fc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 46be800: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 46be804: d61f0020     	br	x1
 46be808: f85b83a0     	ldur	x0, [x29, #-0x48]
 46be80c: f85c83a8     	ldur	x8, [x29, #-0x38]
 46be810: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46be814: 96e529a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46be818: 17ffffe2     	b	0x46be7a0 <_ChromeMain+0x46b9504>
 46be81c: f9400a60     	ldr	x0, [x19, #0x10]
 46be820: f9400008     	ldr	x8, [x0]
 46be824: f9402508     	ldr	x8, [x8, #0x48]
 46be828: 52800801     	mov	w1, #0x40               ; =64
 46be82c: d63f0100     	blr	x8
 46be830: aa1303e0     	mov	x0, x19
 46be834: 95fffcbf     	bl	0xc6bdb30 <_ChromeMain+0xc6b8894>
 46be838: f9400a60     	ldr	x0, [x19, #0x10]
 46be83c: f9400008     	ldr	x8, [x0]
 46be840: f9402908     	ldr	x8, [x8, #0x50]
 46be844: 52800801     	mov	w1, #0x40               ; =64
 46be848: d63f0100     	blr	x8
 46be84c: 17ffffe6     	b	0x46be7e4 <_ChromeMain+0x46b9548>
 46be850: d10303a8     	sub	x8, x29, #0xc0
 46be854: 6f00e400     	movi.2d	v0, #0000000000000000
 46be858: ad028100     	stp	q0, q0, [x8, #0x50]
 46be85c: ad018100     	stp	q0, q0, [x8, #0x30]
 46be860: ad008100     	stp	q0, q0, [x8, #0x10]
 46be864: 3d800100     	str	q0, [x8]
 46be868: d10303a0     	sub	x0, x29, #0xc0
 46be86c: 91008261     	add	x1, x19, #0x20
 46be870: 91008262     	add	x2, x19, #0x20
 46be874: 940005b9     	bl	0x46bff58 <_ChromeMain+0x46bacbc>
 46be878: 37000260     	tbnz	w0, #0x0, 0x46be8c4 <_ChromeMain+0x46b9628>
 46be87c: d10303a0     	sub	x0, x29, #0xc0
 46be880: 9100e261     	add	x1, x19, #0x38
 46be884: 91008262     	add	x2, x19, #0x20
 46be888: 940005b4     	bl	0x46bff58 <_ChromeMain+0x46bacbc>
 46be88c: 370001c0     	tbnz	w0, #0x0, 0x46be8c4 <_ChromeMain+0x46b9628>
 46be890: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46be894: 913dfc21     	add	x1, x1, #0xf7f
 46be898: 910083e0     	add	x0, sp, #0x20
 46be89c: 52800502     	mov	w2, #0x28               ; =40
 46be8a0: 9700bfec     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 46be8a4: d10303a0     	sub	x0, x29, #0xc0
 46be8a8: 910083e1     	add	x1, sp, #0x20
 46be8ac: 91008262     	add	x2, x19, #0x20
 46be8b0: 940005aa     	bl	0x46bff58 <_ChromeMain+0x46bacbc>
 46be8b4: aa0003f4     	mov	x20, x0
 46be8b8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 46be8bc: 37f80f48     	tbnz	w8, #0x1f, 0x46beaa4 <_ChromeMain+0x46b9808>
 46be8c0: 36000fd4     	tbz	w20, #0x0, 0x46beab8 <_ChromeMain+0x46b981c>
 46be8c4: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 46be8c8: f9000fff     	str	xzr, [sp, #0x18]
 46be8cc: d10303a0     	sub	x0, x29, #0xc0
 46be8d0: d10123a1     	sub	x1, x29, #0x48
 46be8d4: 910023e2     	add	x2, sp, #0x8
 46be8d8: 94000146     	bl	0x46bedf0 <_ChromeMain+0x46b9b54>
 46be8dc: 36000100     	tbz	w0, #0x0, 0x46be8fc <_ChromeMain+0x46b9660>
 46be8e0: f9400be8     	ldr	x8, [sp, #0x10]
 46be8e4: 52802f09     	mov	w9, #0x178              ; =376
 46be8e8: d2800014     	mov	x20, #0x0               ; =0
 46be8ec: 9b097d16     	mul	x22, x8, x9
 46be8f0: b4000836     	cbz	x22, 0x46be9f4 <_ChromeMain+0x46b9758>
 46be8f4: f94007f5     	ldr	x21, [sp, #0x8]
 46be8f8: 1400005c     	b	0x46bea68 <_ChromeMain+0x46b97cc>
 46be8fc: d0054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46be900: b940b108     	ldr	w8, [x8, #0xb0]
 46be904: 7100091f     	cmp	w8, #0x2
 46be908: 540002ec     	b.gt	0x46be964 <_ChromeMain+0x46b96c8>
 46be90c: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46be910: 913ea021     	add	x1, x1, #0xfa8
 46be914: 910083f4     	add	x20, sp, #0x20
 46be918: 910083e0     	add	x0, sp, #0x20
 46be91c: 52803b62     	mov	w2, #0x1db              ; =475
 46be920: 52800043     	mov	w3, #0x2                ; =2
 46be924: 96fd2a0a     	bl	0x60914c <_ChromeMain+0x603eb0>
 46be928: d004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46be92c: 91002821     	add	x1, x1, #0xa
 46be930: 91004280     	add	x0, x20, #0x10
 46be934: 528004a2     	mov	w2, #0x25               ; =37
 46be938: 96e59ae1     	bl	0x254bc <_ChromeMain+0x20220>
 46be93c: 389cf3a8     	ldursb	x8, [x29, #-0x31]
 46be940: d10123a9     	sub	x9, x29, #0x48
 46be944: a97bafaa     	ldp	x10, x11, [x29, #-0x48]
 46be948: f100011f     	cmp	x8, #0x0
 46be94c: 9a894141     	csel	x1, x10, x9, mi
 46be950: 7100011f     	cmp	w8, #0x0
 46be954: 9a884162     	csel	x2, x11, x8, mi
 46be958: 96e59ad9     	bl	0x254bc <_ChromeMain+0x20220>
 46be95c: 910083e0     	add	x0, sp, #0x20
 46be960: 96fd29c8     	bl	0x609080 <_ChromeMain+0x603de4>
 46be964: 52800015     	mov	w21, #0x0               ; =0
 46be968: d2800014     	mov	x20, #0x0               ; =0
 46be96c: f94007f6     	ldr	x22, [sp, #0x8]
 46be970: b4000376     	cbz	x22, 0x46be9dc <_ChromeMain+0x46b9740>
 46be974: f9400be8     	ldr	x8, [sp, #0x10]
 46be978: 52802f09     	mov	w9, #0x178              ; =376
 46be97c: 9b097d09     	mul	x9, x8, x9
 46be980: b4000349     	cbz	x9, 0x46be9e8 <_ChromeMain+0x46b974c>
 46be984: 8b160129     	add	x9, x9, x22
 46be988: d105e120     	sub	x0, x9, #0x178
 46be98c: 92802ee9     	mov	x9, #-0x178             ; =-376
 46be990: 9b097d17     	mul	x23, x8, x9
 46be994: b4000ca0     	cbz	x0, 0x46beb28 <_ChromeMain+0x46b988c>
 46be998: 94acd139     	bl	0x71f2e7c <_ChromeMain+0x71edbe0>
 46be99c: d105e000     	sub	x0, x0, #0x178
 46be9a0: b105e2f7     	adds	x23, x23, #0x178
 46be9a4: 54ffff81     	b.ne	0x46be994 <_ChromeMain+0x46b96f8>
 46be9a8: f94007e0     	ldr	x0, [sp, #0x8]
 46be9ac: cb0002c8     	sub	x8, x22, x0
 46be9b0: 9343fd08     	asr	x8, x8, #3
 46be9b4: d288d9e9     	mov	x9, #0x46cf             ; =18127
 46be9b8: f2acefa9     	movk	x9, #0x677d, lsl #16
 46be9bc: f2d7d469     	movk	x9, #0xbea3, lsl #32
 46be9c0: f2ea3669     	movk	x9, #0x51b3, lsl #48
 46be9c4: 9b097d08     	mul	x8, x8, x9
 46be9c8: f9000be8     	str	x8, [sp, #0x10]
 46be9cc: f9400fe8     	ldr	x8, [sp, #0x18]
 46be9d0: 52802f09     	mov	w9, #0x178              ; =376
 46be9d4: 9b097d01     	mul	x1, x8, x9
 46be9d8: 96e52938     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46be9dc: d10303a0     	sub	x0, x29, #0xc0
 46be9e0: 9400053a     	bl	0x46bfec8 <_ChromeMain+0x46bac2c>
 46be9e4: 17ffff6d     	b	0x46be798 <_ChromeMain+0x46b94fc>
 46be9e8: aa1603e0     	mov	x0, x22
 46be9ec: 17fffff0     	b	0x46be9ac <_ChromeMain+0x46b9710>
 46be9f0: f9400be8     	ldr	x8, [sp, #0x10]
 46be9f4: 52800035     	mov	w21, #0x1               ; =1
 46be9f8: b4fffba8     	cbz	x8, 0x46be96c <_ChromeMain+0x46b96d0>
 46be9fc: b5fffb94     	cbnz	x20, 0x46be96c <_ChromeMain+0x46b96d0>
 46bea00: d0054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46bea04: b940b108     	ldr	w8, [x8, #0xb0]
 46bea08: 7100091f     	cmp	w8, #0x2
 46bea0c: 54fffacc     	b.gt	0x46be964 <_ChromeMain+0x46b96c8>
 46bea10: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46bea14: 913ea021     	add	x1, x1, #0xfa8
 46bea18: 910083f4     	add	x20, sp, #0x20
 46bea1c: 910083e0     	add	x0, sp, #0x20
 46bea20: 52803d82     	mov	w2, #0x1ec              ; =492
 46bea24: 52800043     	mov	w3, #0x2                ; =2
 46bea28: 96fd29c9     	bl	0x60914c <_ChromeMain+0x603eb0>
 46bea2c: d004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bea30: 9100c021     	add	x1, x1, #0x30
 46bea34: 91004280     	add	x0, x20, #0x10
 46bea38: 52800762     	mov	w2, #0x3b               ; =59
 46bea3c: 17ffffbf     	b	0x46be938 <_ChromeMain+0x46b969c>
 46bea40: b4000208     	cbz	x8, 0x46bea80 <_ChromeMain+0x46b97e4>
 46bea44: f9400a60     	ldr	x0, [x19, #0x10]
 46bea48: f9400008     	ldr	x8, [x0]
 46bea4c: f9401508     	ldr	x8, [x8, #0x28]
 46bea50: aa1503e1     	mov	x1, x21
 46bea54: d63f0100     	blr	x8
 46bea58: 91000694     	add	x20, x20, #0x1
 46bea5c: 9105e2b5     	add	x21, x21, #0x178
 46bea60: f105e2d6     	subs	x22, x22, #0x178
 46bea64: 54fffc60     	b.eq	0x46be9f0 <_ChromeMain+0x46b9754>
 46bea68: 39406268     	ldrb	w8, [x19, #0x18]
 46bea6c: 3707f7c8     	tbnz	w8, #0x0, 0x46be964 <_ChromeMain+0x46b96c8>
 46bea70: 3984fea8     	ldrsb	x8, [x21, #0x13f]
 46bea74: b6fffe68     	tbz	x8, #0x3f, 0x46bea40 <_ChromeMain+0x46b97a4>
 46bea78: f9409aa8     	ldr	x8, [x21, #0x130]
 46bea7c: b5fffe48     	cbnz	x8, 0x46bea44 <_ChromeMain+0x46b97a8>
 46bea80: 3985bea8     	ldrsb	x8, [x21, #0x16f]
 46bea84: b7f800a8     	tbnz	x8, #0x3f, 0x46bea98 <_ChromeMain+0x46b97fc>
 46bea88: b5fffde8     	cbnz	x8, 0x46bea44 <_ChromeMain+0x46b97a8>
 46bea8c: 3945c2a8     	ldrb	w8, [x21, #0x170]
 46bea90: 34fffe68     	cbz	w8, 0x46bea5c <_ChromeMain+0x46b97c0>
 46bea94: 17ffffec     	b	0x46bea44 <_ChromeMain+0x46b97a8>
 46bea98: f940b2a8     	ldr	x8, [x21, #0x160]
 46bea9c: b5fffd48     	cbnz	x8, 0x46bea44 <_ChromeMain+0x46b97a8>
 46beaa0: 17fffffb     	b	0x46bea8c <_ChromeMain+0x46b97f0>
 46beaa4: f94013e0     	ldr	x0, [sp, #0x20]
 46beaa8: f9401be8     	ldr	x8, [sp, #0x30]
 46beaac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46beab0: 96e52902     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46beab4: 3707f094     	tbnz	w20, #0x0, 0x46be8c4 <_ChromeMain+0x46b9628>
 46beab8: d0054248     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 46beabc: b940b108     	ldr	w8, [x8, #0xb0]
 46beac0: 7100091f     	cmp	w8, #0x2
 46beac4: 540002cc     	b.gt	0x46beb1c <_ChromeMain+0x46b9880>
 46beac8: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46beacc: 913ea021     	add	x1, x1, #0xfa8
 46bead0: 910083f4     	add	x20, sp, #0x20
 46bead4: 910083e0     	add	x0, sp, #0x20
 46bead8: 52803a82     	mov	w2, #0x1d4              ; =468
 46beadc: 52800043     	mov	w3, #0x2                ; =2
 46beae0: 96fd299b     	bl	0x60914c <_ChromeMain+0x603eb0>
 46beae4: b004c181     	adrp	x1, 0xdeef000 <dyld_stub_binder+0xdeef000>
 46beae8: 913f6821     	add	x1, x1, #0xfda
 46beaec: 91004280     	add	x0, x20, #0x10
 46beaf0: 528005e2     	mov	w2, #0x2f               ; =47
 46beaf4: 96e59a72     	bl	0x254bc <_ChromeMain+0x20220>
 46beaf8: 3980de68     	ldrsb	x8, [x19, #0x37]
 46beafc: a9422a69     	ldp	x9, x10, [x19, #0x20]
 46beb00: f100011f     	cmp	x8, #0x0
 46beb04: 9a954121     	csel	x1, x9, x21, mi
 46beb08: 7100011f     	cmp	w8, #0x0
 46beb0c: 9a884142     	csel	x2, x10, x8, mi
 46beb10: 96e59a6b     	bl	0x254bc <_ChromeMain+0x20220>
 46beb14: 910083e0     	add	x0, sp, #0x20
 46beb18: 96fd295a     	bl	0x609080 <_ChromeMain+0x603de4>
 46beb1c: 52800015     	mov	w21, #0x0               ; =0
 46beb20: d2800014     	mov	x20, #0x0               ; =0
 46beb24: 17ffffae     	b	0x46be9dc <_ChromeMain+0x46b9740>
 46beb28: d4200020     	brk	#0x1
