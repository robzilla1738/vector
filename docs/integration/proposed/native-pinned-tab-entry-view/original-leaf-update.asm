
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46078c0: f941e808     	ldr	x8, [x0, #0x3d0]
 46078c4: b4000a08     	cbz	x8, 0x4607a04 <_ChromeMain+0x4602768>
 46078c8: d10283ff     	sub	sp, sp, #0xa0
 46078cc: a90757f6     	stp	x22, x21, [sp, #0x70]
 46078d0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 46078d4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 46078d8: 910243fd     	add	x29, sp, #0x90
 46078dc: aa0003f3     	mov	x19, x0
 46078e0: f941f009     	ldr	x9, [x0, #0x3e0]
 46078e4: f941b50a     	ldr	x10, [x8, #0x368]
 46078e8: eb0a013f     	cmp	x9, x10
 46078ec: 54000842     	b.hs	0x46079f4 <_ChromeMain+0x4602758>
 46078f0: f941b108     	ldr	x8, [x8, #0x360]
 46078f4: 52804d0a     	mov	w10, #0x268             ; =616
 46078f8: 9b0a2134     	madd	x20, x9, x10, x8
 46078fc: a93c7fbf     	stp	xzr, xzr, [x29, #-0x40]
 4607900: f81d03bf     	stur	xzr, [x29, #-0x30]
 4607904: d10103a8     	sub	x8, x29, #0x40
 4607908: aa1403e0     	mov	x0, x20
 460790c: 94000757     	bl	0x4609668 <_ChromeMain+0x46043cc>
 4607910: 39425288     	ldrb	w8, [x20, #0x94]
 4607914: 34000208     	cbz	w8, 0x4607954 <_ChromeMain+0x46026b8>
 4607918: 91028288     	add	x8, x20, #0xa0
 460791c: 3982de89     	ldrsb	x9, [x20, #0xb7]
 4607920: b7f80749     	tbnz	x9, #0x3f, 0x4607a08 <_ChromeMain+0x460276c>
 4607924: aa0903ea     	mov	x10, x9
 4607928: d10103ab     	sub	x11, x29, #0x40
 460792c: eb08017f     	cmp	x11, x8
 4607930: fa401944     	ccmp	x10, #0x0, #0x4, ne
 4607934: 54000100     	b.eq	0x4607954 <_ChromeMain+0x46026b8>
 4607938: 38dd73aa     	ldursb	w10, [x29, #-0x29]
 460793c: 37f80d2a     	tbnz	w10, #0x1f, 0x4607ae0 <_ChromeMain+0x4602844>
 4607940: 37f809e9     	tbnz	w9, #0x1f, 0x4607a7c <_ChromeMain+0x46027e0>
 4607944: 3dc00100     	ldr	q0, [x8]
 4607948: f9400908     	ldr	x8, [x8, #0x10]
 460794c: f81d03a8     	stur	x8, [x29, #-0x30]
 4607950: 3c9c03a0     	stur	q0, [x29, #-0x40]
 4607954: d10103a1     	sub	x1, x29, #0x40
 4607958: aa1303e0     	mov	x0, x19
 460795c: 9708fbfa     	bl	0x846944 <_ChromeMain+0x8416a8>
 4607960: f9416660     	ldr	x0, [x19, #0x2c8]
 4607964: b4000940     	cbz	x0, 0x4607a8c <_ChromeMain+0x46027f0>
 4607968: 52800121     	mov	w1, #0x9                ; =9
 460796c: 97421add     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 4607970: f9416675     	ldr	x21, [x19, #0x2c8]
 4607974: b40009d5     	cbz	x21, 0x4607aac <_ChromeMain+0x4602810>
 4607978: 38dd73a8     	ldursb	w8, [x29, #-0x29]
 460797c: 37f804a8     	tbnz	w8, #0x1f, 0x4607a10 <_ChromeMain+0x4602774>
 4607980: 3cdc03a0     	ldur	q0, [x29, #-0x40]
 4607984: 3d800fe0     	str	q0, [sp, #0x30]
 4607988: f85d03a8     	ldur	x8, [x29, #-0x30]
 460798c: f90023e8     	str	x8, [sp, #0x40]
 4607990: 9100c3e1     	add	x1, sp, #0x30
 4607994: aa1503e0     	mov	x0, x21
 4607998: 972d97d0     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 460799c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 46079a0: 36f800a8     	tbz	w8, #0x1f, 0x46079b4 <_ChromeMain+0x4602718>
 46079a4: f9401be0     	ldr	x0, [sp, #0x30]
 46079a8: f94023e8     	ldr	x8, [sp, #0x40]
 46079ac: d37ff901     	lsl	x1, x8, #1
 46079b0: 96e80542     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46079b4: 9108c281     	add	x1, x20, #0x230
 46079b8: 39494288     	ldrb	w8, [x20, #0x250]
 46079bc: 7100051f     	cmp	w8, #0x1
 46079c0: 54000301     	b.ne	0x4607a20 <_ChromeMain+0x4602784>
 46079c4: f9400028     	ldr	x8, [x1]
 46079c8: b4000328     	cbz	x8, 0x4607a2c <_ChromeMain+0x4602790>
 46079cc: f9400d08     	ldr	x8, [x8, #0x18]
 46079d0: b40002e8     	cbz	x8, 0x4607a2c <_ChromeMain+0x4602790>
 46079d4: f941ee60     	ldr	x0, [x19, #0x3d8]
 46079d8: 96fe65b2     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 46079dc: 38dd73a8     	ldursb	w8, [x29, #-0x29]
 46079e0: 36f800a8     	tbz	w8, #0x1f, 0x46079f4 <_ChromeMain+0x4602758>
 46079e4: f85c03a0     	ldur	x0, [x29, #-0x40]
 46079e8: f85d03a8     	ldur	x8, [x29, #-0x30]
 46079ec: d37ff901     	lsl	x1, x8, #1
 46079f0: 96e80532     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46079f4: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 46079f8: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 46079fc: a94757f6     	ldp	x22, x21, [sp, #0x70]
 4607a00: 910283ff     	add	sp, sp, #0xa0
 4607a04: d65f03c0     	ret
 4607a08: f940568a     	ldr	x10, [x20, #0xa8]
 4607a0c: 17ffffc7     	b	0x4607928 <_ChromeMain+0x460268c>
 4607a10: a97c0ba1     	ldp	x1, x2, [x29, #-0x40]
 4607a14: 9100c3e0     	add	x0, sp, #0x30
 4607a18: 96e8fc6e     	bl	0x46bd0 <_ChromeMain+0x41934>
 4607a1c: 17ffffdd     	b	0x4607990 <_ChromeMain+0x46026f4>
 4607a20: 350006e8     	cbnz	w8, 0x4607afc <_ChromeMain+0x4602860>
 4607a24: f9400028     	ldr	x8, [x1]
 4607a28: b5fffd68     	cbnz	x8, 0x46079d4 <_ChromeMain+0x4602738>
 4607a2c: 39498288     	ldrb	w8, [x20, #0x260]
 4607a30: 7100011f     	cmp	w8, #0x0
 4607a34: 52801ba8     	mov	w8, #0xdd               ; =221
 4607a38: 1a881508     	cinc	w8, w8, eq
 4607a3c: f941ee73     	ldr	x19, [x19, #0x3d8]
 4607a40: b90003e8     	str	w8, [sp]
 4607a44: 390013ff     	strb	wzr, [sp, #0x4]
 4607a48: b0051120     	adrp	x0, 0xe82c000 <dyld_stub_binder+0xe82c000>
 4607a4c: 913c2000     	add	x0, x0, #0xf08
 4607a50: 910023e8     	add	x8, sp, #0x8
 4607a54: 910003e1     	mov	x1, sp
 4607a58: 52800202     	mov	w2, #0x10               ; =16
 4607a5c: d2800003     	mov	x3, #0x0                ; =0
 4607a60: 971fb3b0     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4607a64: 910023e1     	add	x1, sp, #0x8
 4607a68: aa1303e0     	mov	x0, x19
 4607a6c: 96fe658d     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4607a70: 910023e0     	add	x0, sp, #0x8
 4607a74: 9708fb73     	bl	0x846840 <_ChromeMain+0x8415a4>
 4607a78: 17ffffd9     	b	0x46079dc <_ChromeMain+0x4602740>
 4607a7c: a94a0a81     	ldp	x1, x2, [x20, #0xa0]
 4607a80: d10103a0     	sub	x0, x29, #0x40
 4607a84: 970b1b1a     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4607a88: 17ffffb3     	b	0x4607954 <_ChromeMain+0x46026b8>
 4607a8c: 9723799d     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4607a90: 35000440     	cbnz	w0, 0x4607b18 <_ChromeMain+0x460287c>
 4607a94: aa1303e0     	mov	x0, x19
 4607a98: 97335aef     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4607a9c: f9416668     	ldr	x8, [x19, #0x2c8]
 4607aa0: f9016660     	str	x0, [x19, #0x2c8]
 4607aa4: b4fff628     	cbz	x8, 0x4607968 <_ChromeMain+0x46026cc>
 4607aa8: 14000021     	b	0x4607b2c <_ChromeMain+0x4602890>
 4607aac: 97237995     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4607ab0: 350004a0     	cbnz	w0, 0x4607b44 <_ChromeMain+0x46028a8>
 4607ab4: aa1303e0     	mov	x0, x19
 4607ab8: 97335ae7     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4607abc: aa0003f5     	mov	x21, x0
 4607ac0: f9416660     	ldr	x0, [x19, #0x2c8]
 4607ac4: f9016675     	str	x21, [x19, #0x2c8]
 4607ac8: b4fff580     	cbz	x0, 0x4607978 <_ChromeMain+0x46026dc>
 4607acc: f9400008     	ldr	x8, [x0]
 4607ad0: f9400508     	ldr	x8, [x8, #0x8]
 4607ad4: d63f0100     	blr	x8
 4607ad8: f9416675     	ldr	x21, [x19, #0x2c8]
 4607adc: 17ffffa7     	b	0x4607978 <_ChromeMain+0x46026dc>
 4607ae0: 7100013f     	cmp	w9, #0x0
 4607ae4: a94a2e8a     	ldp	x10, x11, [x20, #0xa0]
 4607ae8: 9a884141     	csel	x1, x10, x8, mi
 4607aec: 9a894162     	csel	x2, x11, x9, mi
 4607af0: d10103a0     	sub	x0, x29, #0x40
 4607af4: 970b1b50     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4607af8: 17ffff97     	b	0x4607954 <_ChromeMain+0x46026b8>
 4607afc: 7100091f     	cmp	w8, #0x2
 4607b00: 54fff961     	b.ne	0x4607a2c <_ChromeMain+0x4602790>
 4607b04: b9423a88     	ldr	w8, [x20, #0x238]
 4607b08: 34fff928     	cbz	w8, 0x4607a2c <_ChromeMain+0x4602790>
 4607b0c: b9423e88     	ldr	w8, [x20, #0x23c]
 4607b10: 35fff628     	cbnz	w8, 0x46079d4 <_ChromeMain+0x4602738>
 4607b14: 17ffffc6     	b	0x4607a2c <_ChromeMain+0x4602790>
 4607b18: 52803600     	mov	w0, #0x1b0              ; =432
 4607b1c: 96e81e13     	bl	0xf368 <_ChromeMain+0xa0cc>
 4607b20: aa1303e1     	mov	x1, x19
 4607b24: 97237817     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4607b28: 17ffffdd     	b	0x4607a9c <_ChromeMain+0x4602800>
 4607b2c: f9400109     	ldr	x9, [x8]
 4607b30: f9400529     	ldr	x9, [x9, #0x8]
 4607b34: aa0803e0     	mov	x0, x8
 4607b38: d63f0120     	blr	x9
 4607b3c: f9416660     	ldr	x0, [x19, #0x2c8]
 4607b40: 17ffff8a     	b	0x4607968 <_ChromeMain+0x46026cc>
 4607b44: 52803600     	mov	w0, #0x1b0              ; =432
 4607b48: 96e81e08     	bl	0xf368 <_ChromeMain+0xa0cc>
 4607b4c: aa0003f5     	mov	x21, x0
 4607b50: aa1303e1     	mov	x1, x19
 4607b54: 9723780b     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 4607b58: 17ffffda     	b	0x4607ac0 <_ChromeMain+0x4602824>
 4607b5c: f941b408     	ldr	x8, [x0, #0x368]
 4607b60: b4000068     	cbz	x8, 0x4607b6c <_ChromeMain+0x46028d0>
 4607b64: d2800001     	mov	x1, #0x0                ; =0
 4607b68: 14000002     	b	0x4607b70 <_ChromeMain+0x46028d4>
 4607b6c: d65f03c0     	ret
