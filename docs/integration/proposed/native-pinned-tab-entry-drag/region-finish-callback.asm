
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462ba98: d10143ff     	sub	sp, sp, #0x50
 462ba9c: a90257f6     	stp	x22, x21, [sp, #0x20]
 462baa0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462baa4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462baa8: 910103fd     	add	x29, sp, #0x40
 462baac: aa0003f3     	mov	x19, x0
 462bab0: 52800000     	mov	w0, #0x0                ; =0
 462bab4: f9435276     	ldr	x22, [x19, #0x6a0]
 462bab8: b4000256     	cbz	x22, 0x462bb00 <_ChromeMain+0x4626864>
 462babc: aa0103f4     	mov	x20, x1
 462bac0: 39406028     	ldrb	w8, [x1, #0x18]
 462bac4: 360001e8     	tbz	w8, #0x0, 0x462bb00 <_ChromeMain+0x4626864>
 462bac8: aa0303f5     	mov	x21, x3
 462bacc: 395b0268     	ldrb	w8, [x19, #0x6c0]
 462bad0: 34000ba8     	cbz	w8, 0x462bc44 <_ChromeMain+0x46269a8>
 462bad4: 391b027f     	strb	wzr, [x19, #0x6c0]
 462bad8: b60004b5     	tbz	x21, #0x20, 0x462bb6c <_ChromeMain+0x46268d0>
 462badc: f9423668     	ldr	x8, [x19, #0x468]
 462bae0: b4000468     	cbz	x8, 0x462bb6c <_ChromeMain+0x46268d0>
 462bae4: f9400100     	ldr	x0, [x8]
 462bae8: b9401808     	ldr	w8, [x0, #0x18]
 462baec: 7100051f     	cmp	w8, #0x1
 462baf0: 540003eb     	b.lt	0x462bb6c <_ChromeMain+0x46268d0>
 462baf4: d2800016     	mov	x22, #0x0               ; =0
 462baf8: 1400000d     	b	0x462bb2c <_ChromeMain+0x4626890>
 462bafc: 52800000     	mov	w0, #0x0                ; =0
 462bb00: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462bb04: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462bb08: a94257f6     	ldp	x22, x21, [sp, #0x20]
 462bb0c: 910143ff     	add	sp, sp, #0x50
 462bb10: d65f03c0     	ret
 462bb14: 910006d6     	add	x22, x22, #0x1
 462bb18: f9423668     	ldr	x8, [x19, #0x468]
 462bb1c: f9400100     	ldr	x0, [x8]
 462bb20: b9801808     	ldrsw	x8, [x0, #0x18]
 462bb24: eb0802df     	cmp	x22, x8
 462bb28: 5400022a     	b.ge	0x462bb6c <_ChromeMain+0x46268d0>
 462bb2c: aa1603e1     	mov	x1, x22
 462bb30: 9728c9f2     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bb34: b4ffff00     	cbz	x0, 0x462bb14 <_ChromeMain+0x4626878>
 462bb38: b9401008     	ldr	w8, [x0, #0x10]
 462bb3c: 6b15011f     	cmp	w8, w21
 462bb40: 54fffea1     	b.ne	0x462bb14 <_ChromeMain+0x4626878>
 462bb44: f9423668     	ldr	x8, [x19, #0x468]
 462bb48: f9400100     	ldr	x0, [x8]
 462bb4c: aa1603e1     	mov	x1, x22
 462bb50: 9728c9ea     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bb54: 39418408     	ldrb	w8, [x0, #0x61]
 462bb58: 340000a8     	cbz	w8, 0x462bb6c <_ChromeMain+0x46268d0>
 462bb5c: f9423660     	ldr	x0, [x19, #0x468]
 462bb60: aa1603e1     	mov	x1, x22
 462bb64: 52800002     	mov	w2, #0x0                ; =0
 462bb68: 94dc9a59     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462bb6c: f9422e68     	ldr	x8, [x19, #0x458]
 462bb70: b40000c8     	cbz	x8, 0x462bb88 <_ChromeMain+0x46268ec>
 462bb74: f9429d08     	ldr	x8, [x8, #0x538]
 462bb78: b4000088     	cbz	x8, 0x462bb88 <_ChromeMain+0x46268ec>
 462bb7c: f9403500     	ldr	x0, [x8, #0x68]
 462bb80: aa1403e1     	mov	x1, x20
 462bb84: 97eea4e7     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 462bb88: f9435660     	ldr	x0, [x19, #0x6a8]
 462bb8c: b4000040     	cbz	x0, 0x462bb94 <_ChromeMain+0x46268f8>
 462bb90: 97ff6595     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 462bb94: f9436e75     	ldr	x21, [x19, #0x6d8]
 462bb98: b40002f5     	cbz	x21, 0x462bbf4 <_ChromeMain+0x4626958>
 462bb9c: f94072a8     	ldr	x8, [x21, #0xe0]
 462bba0: b40002a8     	cbz	x8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bba4: 19404108     	ldapurb	w8, [x8, #0x4]
 462bba8: 35000268     	cbnz	w8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bbac: f94076a8     	ldr	x8, [x21, #0xe8]
 462bbb0: b4000228     	cbz	x8, 0x462bbf4 <_ChromeMain+0x4626958>
 462bbb4: f94072a8     	ldr	x8, [x21, #0xe0]
 462bbb8: b4001748     	cbz	x8, 0x462bea0 <_ChromeMain+0x4626c04>
 462bbbc: 19404108     	ldapurb	w8, [x8, #0x4]
 462bbc0: 35001708     	cbnz	w8, 0x462bea0 <_ChromeMain+0x4626c04>
 462bbc4: f94076a8     	ldr	x8, [x21, #0xe8]
 462bbc8: f9402500     	ldr	x0, [x8, #0x48]
 462bbcc: b4000060     	cbz	x0, 0x462bbd8 <_ChromeMain+0x462693c>
 462bbd0: 52800001     	mov	w1, #0x0                ; =0
 462bbd4: 97945a8a     	bl	0x2b425fc <_ChromeMain+0x2b3d360>
 462bbd8: 97932ddb     	bl	0x2af7344 <_ChromeMain+0x2af20a8>
 462bbdc: f9000ff5     	str	x21, [sp, #0x18]
 462bbe0: f0030581     	adrp	x1, 0xa6de000 <_ChromeMain+0xa6d8d64>
 462bbe4: 91389021     	add	x1, x1, #0xe24
 462bbe8: 910063e3     	add	x3, sp, #0x18
 462bbec: d2800002     	mov	x2, #0x0                ; =0
 462bbf0: 976fb8f5     	bl	0x2219fc4 <_ChromeMain+0x2214d28>
 462bbf4: aa1303e0     	mov	x0, x19
 462bbf8: 94000164     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462bbfc: aa1303e0     	mov	x0, x19
 462bc00: 94006600     	bl	0x4645400 <_ChromeMain+0x4640164>
 462bc04: aa1303e0     	mov	x0, x19
 462bc08: 52800001     	mov	w1, #0x0                ; =0
 462bc0c: 9700121a     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462bc10: f9422e68     	ldr	x8, [x19, #0x458]
 462bc14: b4fff748     	cbz	x8, 0x462bafc <_ChromeMain+0x4626860>
 462bc18: f9429d08     	ldr	x8, [x8, #0x538]
 462bc1c: b4fff708     	cbz	x8, 0x462bafc <_ChromeMain+0x4626860>
 462bc20: f9403500     	ldr	x0, [x8, #0x68]
 462bc24: aa1403e1     	mov	x1, x20
 462bc28: 97eea581     	bl	0x41d522c <_ChromeMain+0x41cff90>
 462bc2c: 52000000     	eor	w0, w0, #0x1
 462bc30: 17ffffb4     	b	0x462bb00 <_ChromeMain+0x4626864>
 462bc34: a9400841     	ldp	x1, x2, [x2]
 462bc38: 910003e0     	mov	x0, sp
 462bc3c: 96e86be5     	bl	0x46bd0 <_ChromeMain+0x41934>
 462bc40: 14000007     	b	0x462bc5c <_ChromeMain+0x46269c0>
 462bc44: 39c05c48     	ldrsb	w8, [x2, #0x17]
 462bc48: 37ffff68     	tbnz	w8, #0x1f, 0x462bc34 <_ChromeMain+0x4626998>
 462bc4c: 3dc00040     	ldr	q0, [x2]
 462bc50: 3d8003e0     	str	q0, [sp]
 462bc54: f9400848     	ldr	x8, [x2, #0x10]
 462bc58: f9000be8     	str	x8, [sp, #0x10]
 462bc5c: 910003e2     	mov	x2, sp
 462bc60: aa1603e0     	mov	x0, x22
 462bc64: aa1403e1     	mov	x1, x20
 462bc68: 97ff9d03     	bl	0x4613074 <_ChromeMain+0x460ddd8>
 462bc6c: aa0003f6     	mov	x22, x0
 462bc70: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462bc74: 37f80168     	tbnz	w8, #0x1f, 0x462bca0 <_ChromeMain+0x4626a04>
 462bc78: b40001f6     	cbz	x22, 0x462bcb4 <_ChromeMain+0x4626a18>
 462bc7c: b6000695     	tbz	x21, #0x20, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bc80: f9423668     	ldr	x8, [x19, #0x468]
 462bc84: b4000648     	cbz	x8, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bc88: f9400100     	ldr	x0, [x8]
 462bc8c: b9401808     	ldr	w8, [x0, #0x18]
 462bc90: 7100051f     	cmp	w8, #0x1
 462bc94: 540005cb     	b.lt	0x462bd4c <_ChromeMain+0x4626ab0>
 462bc98: d2800016     	mov	x22, #0x0               ; =0
 462bc9c: 1400001c     	b	0x462bd0c <_ChromeMain+0x4626a70>
 462bca0: f94003e0     	ldr	x0, [sp]
 462bca4: f9400be8     	ldr	x8, [sp, #0x10]
 462bca8: d37ff901     	lsl	x1, x8, #1
 462bcac: 96e77483     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bcb0: b5fffe76     	cbnz	x22, 0x462bc7c <_ChromeMain+0x46269e0>
 462bcb4: f9435e74     	ldr	x20, [x19, #0x6b8]
 462bcb8: b4000114     	cbz	x20, 0x462bcd8 <_ChromeMain+0x4626a3c>
 462bcbc: 394ce288     	ldrb	w8, [x20, #0x338]
 462bcc0: 35000be8     	cbnz	w8, 0x462be3c <_ChromeMain+0x4626ba0>
 462bcc4: f9400288     	ldr	x8, [x20]
 462bcc8: f9405108     	ldr	x8, [x8, #0xa0]
 462bccc: aa1403e0     	mov	x0, x20
 462bcd0: 52800001     	mov	w1, #0x0                ; =0
 462bcd4: d63f0100     	blr	x8
 462bcd8: f9465260     	ldr	x0, [x19, #0xca0]
 462bcdc: f906527f     	str	xzr, [x19, #0xca0]
 462bce0: b4fff100     	cbz	x0, 0x462bb00 <_ChromeMain+0x4626864>
 462bce4: 94e629dd     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462bce8: 52800301     	mov	w1, #0x18               ; =24
 462bcec: 96e77473     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bcf0: 17ffff83     	b	0x462bafc <_ChromeMain+0x4626860>
 462bcf4: 910006d6     	add	x22, x22, #0x1
 462bcf8: f9423668     	ldr	x8, [x19, #0x468]
 462bcfc: f9400100     	ldr	x0, [x8]
 462bd00: b9801808     	ldrsw	x8, [x0, #0x18]
 462bd04: eb0802df     	cmp	x22, x8
 462bd08: 5400022a     	b.ge	0x462bd4c <_ChromeMain+0x4626ab0>
 462bd0c: aa1603e1     	mov	x1, x22
 462bd10: 9728c97a     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bd14: b4ffff00     	cbz	x0, 0x462bcf4 <_ChromeMain+0x4626a58>
 462bd18: b9401008     	ldr	w8, [x0, #0x10]
 462bd1c: 6b15011f     	cmp	w8, w21
 462bd20: 54fffea1     	b.ne	0x462bcf4 <_ChromeMain+0x4626a58>
 462bd24: f9423668     	ldr	x8, [x19, #0x468]
 462bd28: f9400100     	ldr	x0, [x8]
 462bd2c: aa1603e1     	mov	x1, x22
 462bd30: 9728c972     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 462bd34: 39418408     	ldrb	w8, [x0, #0x61]
 462bd38: 340000a8     	cbz	w8, 0x462bd4c <_ChromeMain+0x4626ab0>
 462bd3c: f9423660     	ldr	x0, [x19, #0x468]
 462bd40: aa1603e1     	mov	x1, x22
 462bd44: 52800002     	mov	w2, #0x0                ; =0
 462bd48: 94dc99e1     	bl	0x7d524cc <_ChromeMain+0x7d4d230>
 462bd4c: f9422e68     	ldr	x8, [x19, #0x458]
 462bd50: b40000c8     	cbz	x8, 0x462bd68 <_ChromeMain+0x4626acc>
 462bd54: f9429d08     	ldr	x8, [x8, #0x538]
 462bd58: b4000088     	cbz	x8, 0x462bd68 <_ChromeMain+0x4626acc>
 462bd5c: f9403500     	ldr	x0, [x8, #0x68]
 462bd60: aa1403e1     	mov	x1, x20
 462bd64: 97eea46f     	bl	0x41d4f20 <_ChromeMain+0x41cfc84>
 462bd68: f9435660     	ldr	x0, [x19, #0x6a8]
 462bd6c: b4000040     	cbz	x0, 0x462bd74 <_ChromeMain+0x4626ad8>
 462bd70: 97ff651d     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 462bd74: f9435e74     	ldr	x20, [x19, #0x6b8]
 462bd78: b4000114     	cbz	x20, 0x462bd98 <_ChromeMain+0x4626afc>
 462bd7c: 394ce288     	ldrb	w8, [x20, #0x338]
 462bd80: 350002c8     	cbnz	w8, 0x462bdd8 <_ChromeMain+0x4626b3c>
 462bd84: f9400288     	ldr	x8, [x20]
 462bd88: f9405108     	ldr	x8, [x8, #0xa0]
 462bd8c: aa1403e0     	mov	x0, x20
 462bd90: 52800001     	mov	w1, #0x0                ; =0
 462bd94: d63f0100     	blr	x8
 462bd98: f9465260     	ldr	x0, [x19, #0xca0]
 462bd9c: f906527f     	str	xzr, [x19, #0xca0]
 462bda0: b5000140     	cbnz	x0, 0x462bdc8 <_ChromeMain+0x4626b2c>
 462bda4: aa1303e0     	mov	x0, x19
 462bda8: 940000f8     	bl	0x462c188 <_ChromeMain+0x4626eec>
 462bdac: aa1303e0     	mov	x0, x19
 462bdb0: 94006594     	bl	0x4645400 <_ChromeMain+0x4640164>
 462bdb4: aa1303e0     	mov	x0, x19
 462bdb8: 52800001     	mov	w1, #0x0                ; =0
 462bdbc: 970011ae     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462bdc0: 52800020     	mov	w0, #0x1                ; =1
 462bdc4: 17ffff4f     	b	0x462bb00 <_ChromeMain+0x4626864>
 462bdc8: 94e629a4     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 462bdcc: 52800301     	mov	w1, #0x18               ; =24
 462bdd0: 96e7743a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462bdd4: 17fffff4     	b	0x462bda4 <_ChromeMain+0x4626b08>
 462bdd8: 390ce29f     	strb	wzr, [x20, #0x338]
 462bddc: f941a680     	ldr	x0, [x20, #0x348]
 462bde0: 910ca281     	add	x1, x20, #0x328
 462bde4: 976b7647     	bl	0x2109700 <_ChromeMain+0x2104464>
 462bde8: f9419688     	ldr	x8, [x20, #0x328]
 462bdec: f9401d08     	ldr	x8, [x8, #0x38]
 462bdf0: 910ca280     	add	x0, x20, #0x328
 462bdf4: d63f0100     	blr	x8
 462bdf8: f941a288     	ldr	x8, [x20, #0x340]
 462bdfc: b4fffc48     	cbz	x8, 0x462bd84 <_ChromeMain+0x4626ae8>
 462be00: f9419688     	ldr	x8, [x20, #0x328]
 462be04: f9402108     	ldr	x8, [x8, #0x40]
 462be08: 910ca280     	add	x0, x20, #0x328
 462be0c: d63f0100     	blr	x8
 462be10: f941a288     	ldr	x8, [x20, #0x340]
 462be14: f9400109     	ldr	x9, [x8]
 462be18: 7100001f     	cmp	w0, #0x0
 462be1c: 5280020a     	mov	w10, #0x10              ; =16
 462be20: 5280040b     	mov	w11, #0x20              ; =32
 462be24: 9a8a116a     	csel	x10, x11, x10, ne
 462be28: f86a6929     	ldr	x9, [x9, x10]
 462be2c: 910ca281     	add	x1, x20, #0x328
 462be30: aa0803e0     	mov	x0, x8
 462be34: d63f0120     	blr	x9
 462be38: 17ffffd3     	b	0x462bd84 <_ChromeMain+0x4626ae8>
 462be3c: 390ce29f     	strb	wzr, [x20, #0x338]
 462be40: f941a680     	ldr	x0, [x20, #0x348]
 462be44: 910ca281     	add	x1, x20, #0x328
 462be48: 976b762e     	bl	0x2109700 <_ChromeMain+0x2104464>
 462be4c: f9419688     	ldr	x8, [x20, #0x328]
 462be50: f9401d08     	ldr	x8, [x8, #0x38]
 462be54: 910ca280     	add	x0, x20, #0x328
 462be58: d63f0100     	blr	x8
 462be5c: f941a288     	ldr	x8, [x20, #0x340]
 462be60: b4fff328     	cbz	x8, 0x462bcc4 <_ChromeMain+0x4626a28>
 462be64: f9419688     	ldr	x8, [x20, #0x328]
 462be68: f9402108     	ldr	x8, [x8, #0x40]
 462be6c: 910ca280     	add	x0, x20, #0x328
 462be70: d63f0100     	blr	x8
 462be74: f941a288     	ldr	x8, [x20, #0x340]
 462be78: f9400109     	ldr	x9, [x8]
 462be7c: 7100001f     	cmp	w0, #0x0
 462be80: 5280020a     	mov	w10, #0x10              ; =16
 462be84: 5280040b     	mov	w11, #0x20              ; =32
 462be88: 9a8a116a     	csel	x10, x11, x10, ne
 462be8c: f86a6929     	ldr	x9, [x9, x10]
 462be90: 910ca281     	add	x1, x20, #0x328
 462be94: aa0803e0     	mov	x0, x8
 462be98: d63f0120     	blr	x9
 462be9c: 17ffff8a     	b	0x462bcc4 <_ChromeMain+0x4626a28>
 462bea0: d4200000     	brk	#0
 462bea4: d4400000     	hlt	#0
 462bea8: d4200020     	brk	#0x1
