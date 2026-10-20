
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465ab90: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465ab94: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465ab98: 910043fd     	add	x29, sp, #0x10
 465ab9c: aa0003f3     	mov	x19, x0
 465aba0: 35000101     	cbnz	w1, 0x465abc0 <_ChromeMain+0x4655924>
 465aba4: 39682a68     	ldrb	w8, [x19, #0xa0a]
 465aba8: 340001c8     	cbz	w8, 0x465abe0 <_ChromeMain+0x4655944>
 465abac: 39282a7f     	strb	wzr, [x19, #0xa0a]
 465abb0: aa1303e0     	mov	x0, x19
 465abb4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465abb8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465abbc: 17ff9be6     	b	0x4641b54 <_ChromeMain+0x463c8b8>
 465abc0: f9442668     	ldr	x8, [x19, #0x848]
 465abc4: 39424108     	ldrb	w8, [x8, #0x90]
 465abc8: 39682a69     	ldrb	w9, [x19, #0xa0a]
 465abcc: 6b08013f     	cmp	w9, w8
 465abd0: 540000e1     	b.ne	0x465abec <_ChromeMain+0x4655950>
 465abd4: 34000068     	cbz	w8, 0x465abe0 <_ChromeMain+0x4655944>
 465abd8: 39683268     	ldrb	w8, [x19, #0xa0c]
 465abdc: 360000c8     	tbz	w8, #0x0, 0x465abf4 <_ChromeMain+0x4655958>
 465abe0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465abe4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465abe8: d65f03c0     	ret
 465abec: 39282a68     	strb	w8, [x19, #0xa0a]
 465abf0: 34fffe08     	cbz	w8, 0x465abb0 <_ChromeMain+0x4655914>
 465abf4: 91250260     	add	x0, x19, #0x940
 465abf8: 97034ec8     	bl	0x72e718 <_ChromeMain+0x72947c>
 465abfc: 52800028     	mov	w8, #0x1                ; =1
 465ac00: 39283268     	strb	w8, [x19, #0xa0c]
 465ac04: aa1303e0     	mov	x0, x19
 465ac08: 97ffd68e     	bl	0x4650640 <_ChromeMain+0x464b3a4>
 465ac0c: f942ca60     	ldr	x0, [x19, #0x590]
 465ac10: b943a808     	ldr	w8, [x0, #0x3a8]
 465ac14: 340000a8     	cbz	w8, 0x465ac28 <_ChromeMain+0x465598c>
 465ac18: b903a81f     	str	wzr, [x0, #0x3a8]
 465ac1c: 52800021     	mov	w1, #0x1                ; =1
 465ac20: 96ff5615     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465ac24: f942ca60     	ldr	x0, [x19, #0x590]
 465ac28: b943ac08     	ldr	w8, [x0, #0x3ac]
 465ac2c: 340000a8     	cbz	w8, 0x465ac40 <_ChromeMain+0x46559a4>
 465ac30: b903ac1f     	str	wzr, [x0, #0x3ac]
 465ac34: 52800021     	mov	w1, #0x1                ; =1
 465ac38: 96ff560f     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465ac3c: f942ca60     	ldr	x0, [x19, #0x590]
 465ac40: 394ee008     	ldrb	w8, [x0, #0x3b8]
 465ac44: 340000a8     	cbz	w8, 0x465ac58 <_ChromeMain+0x46559bc>
 465ac48: 390ee01f     	strb	wzr, [x0, #0x3b8]
 465ac4c: 52800001     	mov	w1, #0x0                ; =0
 465ac50: 96ff5609     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465ac54: f942ca60     	ldr	x0, [x19, #0x590]
 465ac58: 394ec808     	ldrb	w8, [x0, #0x3b2]
 465ac5c: 370000a8     	tbnz	w8, #0x0, 0x465ac70 <_ChromeMain+0x46559d4>
 465ac60: 52800028     	mov	w8, #0x1                ; =1
 465ac64: 390ec808     	strb	w8, [x0, #0x3b2]
 465ac68: 52800001     	mov	w1, #0x0                ; =0
 465ac6c: 96ff5602     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465ac70: aa1303e0     	mov	x0, x19
 465ac74: d2800001     	mov	x1, #0x0                ; =0
 465ac78: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465ac7c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465ac80: 17ba7a5a     	b	0x34f95e8 <_ChromeMain+0x34f434c>
 465ac84: d10103ff     	sub	sp, sp, #0x40
 465ac88: a90157f6     	stp	x22, x21, [sp, #0x10]
 465ac8c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 465ac90: a9037bfd     	stp	x29, x30, [sp, #0x30]
 465ac94: 9100c3fd     	add	x29, sp, #0x30
 465ac98: aa0103f4     	mov	x20, x1
 465ac9c: 397e4008     	ldrb	w8, [x0, #0xf90]
 465aca0: 340001c8     	cbz	w8, 0x465acd8 <_ChromeMain+0x4655a3c>
 465aca4: f9400a80     	ldr	x0, [x20, #0x10]
 465aca8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465acac: 90052ac9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465acb0: f9404529     	ldr	x9, [x9, #0x88]
 465acb4: eb09011f     	cmp	x8, x9
 465acb8: 54000041     	b.ne	0x465acc0 <_ChromeMain+0x4655a24>
 465acbc: 96e71f60     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465acc0: f9000a9f     	str	xzr, [x20, #0x10]
 465acc4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 465acc8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 465accc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 465acd0: 910103ff     	add	sp, sp, #0x40
 465acd4: d65f03c0     	ret
 465acd8: aa0003f3     	mov	x19, x0
 465acdc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465ace0: 90052ad5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465ace4: f94046a9     	ldr	x9, [x21, #0x88]
 465ace8: eb09011f     	cmp	x8, x9
 465acec: 54000061     	b.ne	0x465acf8 <_ChromeMain+0x4655a5c>
 465acf0: aa1403e0     	mov	x0, x20
 465acf4: 96e6e582     	bl	0x142fc <_ChromeMain+0xf060>
 465acf8: f90007f4     	str	x20, [sp, #0x8]
 465acfc: 9132a260     	add	x0, x19, #0xca8
 465ad00: 910023e1     	add	x1, sp, #0x8
 465ad04: 910023e2     	add	x2, sp, #0x8
 465ad08: 947f8572     	bl	0x663c2d0 <_ChromeMain+0x6637034>
 465ad0c: f94007e0     	ldr	x0, [sp, #0x8]
 465ad10: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465ad14: f94046a9     	ldr	x9, [x21, #0x88]
 465ad18: eb09011f     	cmp	x8, x9
 465ad1c: 54000041     	b.ne	0x465ad24 <_ChromeMain+0x4655a88>
