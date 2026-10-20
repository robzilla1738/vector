
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3613940: d10183ff     	sub	sp, sp, #0x60
 3613944: a90357f6     	stp	x22, x21, [sp, #0x30]
 3613948: a9044ff4     	stp	x20, x19, [sp, #0x40]
 361394c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 3613950: 910143fd     	add	x29, sp, #0x50
 3613954: aa0003f3     	mov	x19, x0
 3613958: f9400008     	ldr	x8, [x0]
 361395c: f9403508     	ldr	x8, [x8, #0x68]
 3613960: d63f0100     	blr	x8
 3613964: b40015a0     	cbz	x0, 0x3613c18 <_ChromeMain+0x360e97c>
 3613968: f9443668     	ldr	x8, [x19, #0x868]
 361396c: b4001788     	cbz	x8, 0x3613c5c <_ChromeMain+0x360e9c0>
 3613970: f9400514     	ldr	x20, [x8, #0x8]
 3613974: b4001534     	cbz	x20, 0x3613c18 <_ChromeMain+0x360e97c>
 3613978: aa1303e0     	mov	x0, x19
 361397c: 973e359d     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 3613980: b4001740     	cbz	x0, 0x3613c68 <_ChromeMain+0x360e9cc>
 3613984: aa0003f5     	mov	x21, x0
 3613988: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 361398c: f90017ff     	str	xzr, [sp, #0x28]
 3613990: f9400288     	ldr	x8, [x20]
 3613994: f9401109     	ldr	x9, [x8, #0x20]
 3613998: 910063e8     	add	x8, sp, #0x18
 361399c: aa1403e0     	mov	x0, x20
 36139a0: d63f0120     	blr	x9
 36139a4: f9426660     	ldr	x0, [x19, #0x4c8]
 36139a8: f941ac09     	ldr	x9, [x0, #0x358]
 36139ac: 3980bd36     	ldrsb	x22, [x9, #0x2f]
 36139b0: b7f80796     	tbnz	x22, #0x3f, 0x3613aa0 <_ChromeMain+0x360e804>
 36139b4: 91006128     	add	x8, x9, #0x18
 36139b8: 3940bfea     	ldrb	w10, [sp, #0x2f]
 36139bc: 13001d49     	sxtb	w9, w10
 36139c0: f94013eb     	ldr	x11, [sp, #0x20]
 36139c4: 7100013f     	cmp	w9, #0x0
 36139c8: 9a8a416a     	csel	x10, x11, x10, mi
 36139cc: eb0a02df     	cmp	x22, x10
 36139d0: 540007c1     	b.ne	0x3613ac8 <_ChromeMain+0x360e82c>
 36139d4: b50015f6     	cbnz	x22, 0x3613c90 <_ChromeMain+0x360e9f4>
 36139d8: f9400288     	ldr	x8, [x20]
 36139dc: f9401508     	ldr	x8, [x8, #0x28]
 36139e0: aa1403e0     	mov	x0, x20
 36139e4: aa1503e1     	mov	x1, x21
 36139e8: d63f0100     	blr	x8
 36139ec: 910063e1     	add	x1, sp, #0x18
 36139f0: 92409c02     	and	x2, x0, #0xffffffffff
 36139f4: aa1303e0     	mov	x0, x19
 36139f8: 978ebc9e     	bl	0x19c2c70 <_ChromeMain+0x19bd9d4>
 36139fc: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 3613a00: 37f80548     	tbnz	w8, #0x1f, 0x3613aa8 <_ChromeMain+0x360e80c>
 3613a04: f9400288     	ldr	x8, [x20]
 3613a08: f9402109     	ldr	x9, [x8, #0x40]
 3613a0c: 910063e8     	add	x8, sp, #0x18
 3613a10: aa1403e0     	mov	x0, x20
 3613a14: d63f0120     	blr	x9
 3613a18: 910063e1     	add	x1, sp, #0x18
 3613a1c: aa1303e0     	mov	x0, x19
 3613a20: 9748cbc9     	bl	0x846944 <_ChromeMain+0x8416a8>
 3613a24: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 3613a28: 36f800a8     	tbz	w8, #0x1f, 0x3613a3c <_ChromeMain+0x360e7a0>
 3613a2c: f9400fe0     	ldr	x0, [sp, #0x18]
 3613a30: f94017e8     	ldr	x8, [sp, #0x28]
 3613a34: d37ff901     	lsl	x1, x8, #1
 3613a38: 9727d520     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3613a3c: aa1303e0     	mov	x0, x19
 3613a40: 97afd00b     	bl	0x2207a6c <_ChromeMain+0x22027d0>
 3613a44: aa1303e0     	mov	x0, x19
 3613a48: 97ace118     	bl	0x214bea8 <_ChromeMain+0x2146c0c>
 3613a4c: f9443668     	ldr	x8, [x19, #0x868]
 3613a50: b4001128     	cbz	x8, 0x3613c74 <_ChromeMain+0x360e9d8>
 3613a54: f9400500     	ldr	x0, [x8, #0x8]
 3613a58: b4000840     	cbz	x0, 0x3613b60 <_ChromeMain+0x360e8c4>
 3613a5c: f9400008     	ldr	x8, [x0]
 3613a60: f9402508     	ldr	x8, [x8, #0x48]
 3613a64: d63f0100     	blr	x8
 3613a68: aa0003f4     	mov	x20, x0
 3613a6c: d360fc15     	lsr	x21, x0, #32
 3613a70: aa1303e9     	mov	x9, x19
 3613a74: f84e8d28     	ldr	x8, [x9, #0xe8]!
 3613a78: b4000648     	cbz	x8, 0x3613b40 <_ChromeMain+0x360e8a4>
 3613a7c: b0059f8a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 3613a80: 9123414a     	add	x10, x10, #0x8d0
 3613a84: f940110b     	ldr	x11, [x8, #0x20]
 3613a88: eb0a017f     	cmp	x11, x10
 3613a8c: 54000188     	b.hi	0x3613abc <_ChromeMain+0x360e820>
 3613a90: 54000522     	b.hs	0x3613b34 <_ChromeMain+0x360e898>
 3613a94: f9400508     	ldr	x8, [x8, #0x8]
 3613a98: b5ffff68     	cbnz	x8, 0x3613a84 <_ChromeMain+0x360e7e8>
 3613a9c: 14000029     	b	0x3613b40 <_ChromeMain+0x360e8a4>
 3613aa0: a941d928     	ldp	x8, x22, [x9, #0x18]
 3613aa4: 17ffffc5     	b	0x36139b8 <_ChromeMain+0x360e71c>
 3613aa8: f9400fe0     	ldr	x0, [sp, #0x18]
 3613aac: f94017e8     	ldr	x8, [sp, #0x28]
 3613ab0: d37ff901     	lsl	x1, x8, #1
 3613ab4: 9727d501     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3613ab8: 17ffffd3     	b	0x3613a04 <_ChromeMain+0x360e768>
 3613abc: f9400108     	ldr	x8, [x8]
 3613ac0: b5fffe28     	cbnz	x8, 0x3613a84 <_ChromeMain+0x360e7e8>
 3613ac4: 1400001f     	b	0x3613b40 <_ChromeMain+0x360e8a4>
 3613ac8: f005ad88     	adrp	x8, 0xebc6000 <dyld_stub_binder+0xebc6000>
 3613acc: bd4c2100     	ldr	s0, [x8, #0xc20]
 3613ad0: 1e202008     	fcmp	s0, #0.0
 3613ad4: 54fff820     	b.eq	0x36139d8 <_ChromeMain+0x360e73c>
 3613ad8: 52800001     	mov	w1, #0x0                ; =0
 3613adc: 973e3499     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 3613ae0: b5000af6     	cbnz	x22, 0x3613c3c <_ChromeMain+0x360e9a0>
 3613ae4: f9400288     	ldr	x8, [x20]
 3613ae8: f9401508     	ldr	x8, [x8, #0x28]
 3613aec: aa1403e0     	mov	x0, x20
 3613af0: aa1503e1     	mov	x1, x21
 3613af4: d63f0100     	blr	x8
 3613af8: 910063e1     	add	x1, sp, #0x18
 3613afc: 92409c02     	and	x2, x0, #0xffffffffff
 3613b00: aa1303e0     	mov	x0, x19
 3613b04: 978ebc5b     	bl	0x19c2c70 <_ChromeMain+0x19bd9d4>
 3613b08: 91254260     	add	x0, x19, #0x950
 3613b0c: 52800001     	mov	w1, #0x0                ; =0
 3613b10: 97b62b95     	bl	0x239e964 <_ChromeMain+0x23996c8>
 3613b14: 17ffffba     	b	0x36139fc <_ChromeMain+0x360e760>
 3613b18: f9400108     	ldr	x8, [x8]
 3613b1c: b50002c8     	cbnz	x8, 0x3613b74 <_ChromeMain+0x360e8d8>
 3613b20: 1400001b     	b	0x3613b8c <_ChromeMain+0x360e8f0>
 3613b24: eb09011f     	cmp	x8, x9
 3613b28: 54000320     	b.eq	0x3613b8c <_ChromeMain+0x360e8f0>
 3613b2c: f9401914     	ldr	x20, [x8, #0x30]
 3613b30: 14000018     	b	0x3613b90 <_ChromeMain+0x360e8f4>
 3613b34: eb09011f     	cmp	x8, x9
 3613b38: 54000a80     	b.eq	0x3613c88 <_ChromeMain+0x360e9ec>
 3613b3c: f9401908     	ldr	x8, [x8, #0x30]
 3613b40: b900151f     	str	wzr, [x8, #0x14]
 3613b44: f9401d00     	ldr	x0, [x8, #0x38]
 3613b48: f9001d1f     	str	xzr, [x8, #0x38]
 3613b4c: b5000ba0     	cbnz	x0, 0x3613cc0 <_ChromeMain+0x360ea24>
 3613b50: aa1303e0     	mov	x0, x19
 3613b54: aa1403e1     	mov	x1, x20
 3613b58: aa1503e2     	mov	x2, x21
 3613b5c: 97acf67d     	bl	0x2151550 <_ChromeMain+0x214c2b4>
 3613b60: aa1303e9     	mov	x9, x19
 3613b64: f84e8d28     	ldr	x8, [x9, #0xe8]!
 3613b68: b4000128     	cbz	x8, 0x3613b8c <_ChromeMain+0x360e8f0>
 3613b6c: b0059f8a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 3613b70: 9132c14a     	add	x10, x10, #0xcb0
 3613b74: f940110b     	ldr	x11, [x8, #0x20]
 3613b78: eb0a017f     	cmp	x11, x10
 3613b7c: 54fffce8     	b.hi	0x3613b18 <_ChromeMain+0x360e87c>
 3613b80: 54fffd22     	b.hs	0x3613b24 <_ChromeMain+0x360e888>
 3613b84: f9400508     	ldr	x8, [x8, #0x8]
 3613b88: b5ffff68     	cbnz	x8, 0x3613b74 <_ChromeMain+0x360e8d8>
 3613b8c: d2800014     	mov	x20, #0x0               ; =0
 3613b90: f9426668     	ldr	x8, [x19, #0x4c8]
 3613b94: b4000508     	cbz	x8, 0x3613c34 <_ChromeMain+0x360e998>
 3613b98: 39472109     	ldrb	w9, [x8, #0x1c8]
 3613b9c: 340004c9     	cbz	w9, 0x3613c34 <_ChromeMain+0x360e998>
 3613ba0: f941ad09     	ldr	x9, [x8, #0x358]
 3613ba4: 3980bd28     	ldrsb	x8, [x9, #0x2f]
 3613ba8: b7f80428     	tbnz	x8, #0x3f, 0x3613c2c <_ChromeMain+0x360e990>
 3613bac: b4000448     	cbz	x8, 0x3613c34 <_ChromeMain+0x360e998>
 3613bb0: f005aca0     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 3613bb4: 91166000     	add	x0, x0, #0x598
 3613bb8: 972c15b2     	bl	0x119280 <_ChromeMain+0x113fe4>
 3613bbc: 34000620     	cbz	w0, 0x3613c80 <_ChromeMain+0x360e9e4>
 3613bc0: 52800140     	mov	w0, #0xa                ; =10
 3613bc4: 972c17ef     	bl	0x119b80 <_ChromeMain+0x1148e4>
 3613bc8: d35ffc08     	lsr	x8, x0, #31
 3613bcc: 121f7915     	and	w21, w8, #0xfffffffe
 3613bd0: f9400268     	ldr	x8, [x19]
 3613bd4: f9428508     	ldr	x8, [x8, #0x508]
 3613bd8: aa1303e0     	mov	x0, x19
 3613bdc: d63f0100     	blr	x8
 3613be0: b941c268     	ldr	w8, [x19, #0x1c0]
 3613be4: 0b0002a9     	add	w9, w21, w0
 3613be8: 6b08013f     	cmp	w9, w8
 3613bec: 1a9fb7e8     	cset	w8, ge
 3613bf0: 390c8288     	strb	w8, [x20, #0x320]
 3613bf4: aa1303e0     	mov	x0, x19
 3613bf8: 97cfeaab     	bl	0x2a0e6a4 <_ChromeMain+0x2a09408>
 3613bfc: aa1303e0     	mov	x0, x19
 3613c00: 52800001     	mov	w1, #0x0                ; =0
 3613c04: 9740721c     	bl	0x630474 <_ChromeMain+0x62b1d8>
 3613c08: 91202260     	add	x0, x19, #0x808
 3613c0c: 52800701     	mov	w1, #0x38               ; =56
 3613c10: 52800022     	mov	w2, #0x1                ; =1
 3613c14: 97be76db     	bl	0x25b1780 <_ChromeMain+0x25ac4e4>
 3613c18: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 3613c1c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 3613c20: a94357f6     	ldp	x22, x21, [sp, #0x30]
 3613c24: 910183ff     	add	sp, sp, #0x60
 3613c28: d65f03c0     	ret
