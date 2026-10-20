
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4262e44: d101c3ff     	sub	sp, sp, #0x70
 4262e48: a90267fa     	stp	x26, x25, [sp, #0x20]
 4262e4c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4262e50: a90457f6     	stp	x22, x21, [sp, #0x40]
 4262e54: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4262e58: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4262e5c: 910183fd     	add	x29, sp, #0x60
 4262e60: aa0203f4     	mov	x20, x2
 4262e64: 3940b016     	ldrb	w22, [x0, #0x2c]
 4262e68: 37001076     	tbnz	w22, #0x0, 0x4263074 <_ChromeMain+0x425ddd8>
 4262e6c: aa0003f3     	mov	x19, x0
 4262e70: 52800028     	mov	w8, #0x1                ; =1
 4262e74: 79005808     	strh	w8, [x0, #0x2c]
 4262e78: b9002801     	str	w1, [x0, #0x28]
 4262e7c: 3900b81f     	strb	wzr, [x0, #0x2e]
 4262e80: 39412008     	ldrb	w8, [x0, #0x48]
 4262e84: 3900bc08     	strb	w8, [x0, #0x2f]
 4262e88: 3900c008     	strb	w8, [x0, #0x30]
 4262e8c: 7803101f     	sturh	wzr, [x0, #0x31]
 4262e90: 3900cc1f     	strb	wzr, [x0, #0x33]
 4262e94: a903fc1f     	stp	xzr, xzr, [x0, #0x38]
 4262e98: f9401000     	ldr	x0, [x0, #0x20]
 4262e9c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4262ea0: 90054a89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4262ea4: f9404529     	ldr	x9, [x9, #0x88]
 4262ea8: eb09011f     	cmp	x8, x9
 4262eac: 54000041     	b.ne	0x4262eb4 <_ChromeMain+0x425dc18>
 4262eb0: 96f6fee3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4262eb4: f900127f     	str	xzr, [x19, #0x20]
 4262eb8: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 4262ebc: 37f80cc8     	tbnz	w8, #0x1f, 0x4263054 <_ChromeMain+0x425ddb8>
 4262ec0: 3901e27f     	strb	wzr, [x19, #0x78]
 4262ec4: 39023e7f     	strb	wzr, [x19, #0x8f]
 4262ec8: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 4262ecc: 37f80cc8     	tbnz	w8, #0x1f, 0x4263064 <_ChromeMain+0x425ddc8>
 4262ed0: 7901227f     	strh	wzr, [x19, #0x90]
 4262ed4: 39029e7f     	strb	wzr, [x19, #0xa7]
 4262ed8: f9405675     	ldr	x21, [x19, #0xa8]
 4262edc: f9005674     	str	x20, [x19, #0xa8]
 4262ee0: b5000f75     	cbnz	x21, 0x42630cc <_ChromeMain+0x425de30>
 4262ee4: 52800500     	mov	w0, #0x28               ; =40
 4262ee8: 96f6b120     	bl	0xf368 <_ChromeMain+0xa0cc>
 4262eec: aa0003f4     	mov	x20, x0
 4262ef0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4262ef4: f900001f     	str	xzr, [x0]
 4262ef8: 52800100     	mov	w0, #0x8                ; =8
 4262efc: 96f6b11b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4262f00: b900001f     	str	wzr, [x0]
 4262f04: 3900101f     	strb	wzr, [x0, #0x4]
 4262f08: b40000c0     	cbz	x0, 0x4262f20 <_ChromeMain+0x425dc84>
 4262f0c: 52800028     	mov	w8, #0x1                ; =1
 4262f10: b8280008     	ldadd	w8, w8, [x0]
 4262f14: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4262f18: 6b09011f     	cmp	w8, w9
 4262f1c: 54001260     	b.eq	0x4263168 <_ChromeMain+0x425decc>
 4262f20: a901d280     	stp	x0, x20, [x20, #0x18]
 4262f24: f9400a60     	ldr	x0, [x19, #0x10]
 4262f28: f9000a74     	str	x20, [x19, #0x10]
 4262f2c: b5000c60     	cbnz	x0, 0x42630b8 <_ChromeMain+0x425de1c>
 4262f30: 90056437     	adrp	x23, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4262f34: f9467ee8     	ldr	x8, [x23, #0xcf8]
 4262f38: f9414909     	ldr	x9, [x8, #0x290]
 4262f3c: b40011c9     	cbz	x9, 0x4263174 <_ChromeMain+0x425ded8>
 4262f40: f9402935     	ldr	x21, [x9, #0x50]
 4262f44: b4001075     	cbz	x21, 0x4263150 <_ChromeMain+0x425deb4>
 4262f48: f9405a78     	ldr	x24, [x19, #0xb0]
 4262f4c: b40000d8     	cbz	x24, 0x4262f64 <_ChromeMain+0x425dcc8>
 4262f50: 52800028     	mov	w8, #0x1                ; =1
 4262f54: b8280308     	ldadd	w8, w8, [x24]
 4262f58: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4262f5c: 6b09011f     	cmp	w8, w9
 4262f60: 54000fe0     	b.eq	0x426315c <_ChromeMain+0x425dec0>
 4262f64: f9405e79     	ldr	x25, [x19, #0xb8]
 4262f68: 52800800     	mov	w0, #0x40               ; =64
 4262f6c: 96f6b0ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4262f70: aa0003e3     	mov	x3, x0
 4262f74: 52800028     	mov	w8, #0x1                ; =1
 4262f78: 90ffe869     	adrp	x9, 0x3f6e000 <_ChromeMain+0x3f68d64>
 4262f7c: 91230129     	add	x9, x9, #0x8c0
 4262f80: d0ffe84a     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4262f84: 912b014a     	add	x10, x10, #0xac0
 4262f88: b9000008     	str	w8, [x0]
 4262f8c: 90fff268     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4262f90: 911b0108     	add	x8, x8, #0x6c0
 4262f94: 1000116b     	adr	x11, 0x42631c0 <_ChromeMain+0x425df24>
 4262f98: d503201f     	nop
 4262f9c: a900a809     	stp	x9, x10, [x0, #0x8]
 4262fa0: a901ac08     	stp	x8, x11, [x0, #0x18]
 4262fa4: a902e01f     	stp	xzr, x24, [x0, #0x28]
 4262fa8: f9001c19     	str	x25, [x0, #0x38]
 4262fac: aa1403e0     	mov	x0, x20
 4262fb0: aa1503e1     	mov	x1, x21
 4262fb4: 52800002     	mov	w2, #0x0                ; =0
 4262fb8: 94d6f71b     	bl	0x7820c24 <_ChromeMain+0x781b988>
 4262fbc: 3941c268     	ldrb	w8, [x19, #0x70]
 4262fc0: 340005c8     	cbz	w8, 0x4263078 <_ChromeMain+0x425dddc>
 4262fc4: f9400660     	ldr	x0, [x19, #0x8]
 4262fc8: b4000400     	cbz	x0, 0x4263048 <_ChromeMain+0x425ddac>
 4262fcc: f9467ee8     	ldr	x8, [x23, #0xcf8]
 4262fd0: f9414908     	ldr	x8, [x8, #0x290]
 4262fd4: f9400513     	ldr	x19, [x8, #0x8]
 4262fd8: 970cf547     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4262fdc: b4000360     	cbz	x0, 0x4263048 <_ChromeMain+0x425ddac>
 4262fe0: f9402808     	ldr	x8, [x0, #0x50]
 4262fe4: b5000068     	cbnz	x8, 0x4262ff0 <_ChromeMain+0x425dd54>
 4262fe8: f9402409     	ldr	x9, [x0, #0x48]
 4262fec: b4000ae9     	cbz	x9, 0x4263148 <_ChromeMain+0x425deac>
 4262ff0: 52800a09     	mov	w9, #0x50               ; =80
 4262ff4: 5280090a     	mov	w10, #0x48              ; =72
 4262ff8: f100011f     	cmp	x8, #0x0
 4262ffc: 9a890148     	csel	x8, x10, x9, eq
 4263000: f8686808     	ldr	x8, [x0, x8]
 4263004: f9400908     	ldr	x8, [x8, #0x10]
 4263008: f9400514     	ldr	x20, [x8, #0x8]
 426300c: b40009f4     	cbz	x20, 0x4263148 <_ChromeMain+0x425deac>
 4263010: 9100a288     	add	x8, x20, #0x28
 4263014: 39007fff     	strb	wzr, [sp, #0x1f]
 4263018: 91007fe9     	add	x9, sp, #0x1f
 426301c: a900a3e9     	stp	x9, x8, [sp, #0x8]
 4263020: d0fe5a62     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4263024: 912dc042     	add	x2, x2, #0xb70
 4263028: 910023e1     	add	x1, sp, #0x8
 426302c: aa1303e0     	mov	x0, x19
 4263030: 52800003     	mov	w3, #0x0                ; =0
 4263034: 52800004     	mov	w4, #0x0                ; =0
 4263038: 972d3a0e     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 426303c: 39407fe8     	ldrb	w8, [sp, #0x1f]
 4263040: 7100011f     	cmp	w8, #0x0
 4263044: 9a9f1280     	csel	x0, x20, xzr, ne
 4263048: 52800001     	mov	w1, #0x0                ; =0
 426304c: 940ca7d3     	bl	0x458cf98 <_ChromeMain+0x4587cfc>
 4263050: 1400000a     	b	0x4263078 <_ChromeMain+0x425dddc>
 4263054: f9403e68     	ldr	x8, [x19, #0x78]
 4263058: 3900011f     	strb	wzr, [x8]
 426305c: f900427f     	str	xzr, [x19, #0x80]
 4263060: 17ffff9a     	b	0x4262ec8 <_ChromeMain+0x425dc2c>
 4263064: f9404a68     	ldr	x8, [x19, #0x90]
 4263068: 7900011f     	strh	wzr, [x8]
 426306c: f9004e7f     	str	xzr, [x19, #0x98]
 4263070: 17ffff9a     	b	0x4262ed8 <_ChromeMain+0x425dc3c>
 4263074: b5000134     	cbnz	x20, 0x4263098 <_ChromeMain+0x425ddfc>
 4263078: 520002c0     	eor	w0, w22, #0x1
 426307c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4263080: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4263084: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4263088: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 426308c: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4263090: 9101c3ff     	add	sp, sp, #0x70
 4263094: d65f03c0     	ret
 4263098: 12800008     	mov	w8, #-0x1               ; =-1
 426309c: b8e80288     	ldaddal	w8, w8, [x20]
 42630a0: 7100051f     	cmp	w8, #0x1
 42630a4: 54fffea1     	b.ne	0x4263078 <_ChromeMain+0x425dddc>
 42630a8: f9400a88     	ldr	x8, [x20, #0x10]
 42630ac: aa1403e0     	mov	x0, x20
 42630b0: d63f0100     	blr	x8
 42630b4: 17fffff1     	b	0x4263078 <_ChromeMain+0x425dddc>
 42630b8: 94d6f6cc     	bl	0x7820be8 <_ChromeMain+0x781b94c>
 42630bc: 52800501     	mov	w1, #0x28               ; =40
 42630c0: 96f6977e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42630c4: f9400a74     	ldr	x20, [x19, #0x10]
 42630c8: 17ffff9a     	b	0x4262f30 <_ChromeMain+0x425dc94>
 42630cc: 12800008     	mov	w8, #-0x1               ; =-1
 42630d0: b8e802a8     	ldaddal	w8, w8, [x21]
 42630d4: 7100051f     	cmp	w8, #0x1
 42630d8: 54fff061     	b.ne	0x4262ee4 <_ChromeMain+0x425dc48>
 42630dc: f9400aa8     	ldr	x8, [x21, #0x10]
 42630e0: d0fe6a09     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 42630e4: 91190129     	add	x9, x9, #0x640
 42630e8: eb09011f     	cmp	x8, x9
 42630ec: 54000140     	b.eq	0x4263114 <_ChromeMain+0x425de78>
 42630f0: b0ffb849     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 42630f4: 91180129     	add	x9, x9, #0x600
 42630f8: aa1503e0     	mov	x0, x21
 42630fc: eb09011f     	cmp	x8, x9
 4263100: 54000060     	b.eq	0x426310c <_ChromeMain+0x425de70>
 4263104: d63f0100     	blr	x8
 4263108: 17ffff77     	b	0x4262ee4 <_ChromeMain+0x425dc48>
 426310c: 52800701     	mov	w1, #0x38               ; =56
 4263110: 14000005     	b	0x4263124 <_ChromeMain+0x425de88>
 4263114: f9401aa0     	ldr	x0, [x21, #0x30]
 4263118: b50000a0     	cbnz	x0, 0x426312c <_ChromeMain+0x425de90>
 426311c: aa1503e0     	mov	x0, x21
 4263120: 52800901     	mov	w1, #0x48               ; =72
 4263124: 96f69765     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263128: 17ffff6f     	b	0x4262ee4 <_ChromeMain+0x425dc48>
 426312c: 12800008     	mov	w8, #-0x1               ; =-1
 4263130: b8e80008     	ldaddal	w8, w8, [x0]
 4263134: 7100051f     	cmp	w8, #0x1
 4263138: 54ffff21     	b.ne	0x426311c <_ChromeMain+0x425de80>
 426313c: 52800101     	mov	w1, #0x8                ; =8
 4263140: 96f6975e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4263144: 17fffff6     	b	0x426311c <_ChromeMain+0x425de80>
 4263148: d2800000     	mov	x0, #0x0                ; =0
 426314c: 17ffffbf     	b	0x4263048 <_ChromeMain+0x425ddac>
 4263150: d4200000     	brk	#0
 4263154: d4400000     	hlt	#0
 4263158: d4200020     	brk	#0x1
 426315c: d4200000     	brk	#0
 4263160: d4400000     	hlt	#0
 4263164: d4200020     	brk	#0x1
 4263168: d4200000     	brk	#0
 426316c: d4400000     	hlt	#0
 4263170: d4200020     	brk	#0x1
 4263174: f9400900     	ldr	x0, [x8, #0x10]
 4263178: 9785a5a0     	bl	0x23cc7f8 <_ChromeMain+0x23c755c>
 426317c: 91004015     	add	x21, x0, #0x10
 4263180: 17ffff72     	b	0x4262f48 <_ChromeMain+0x425dcac>
 4263184: d503201f     	nop
 4263188: d503201f     	nop
 426318c: d503201f     	nop
 4263190: d503201f     	nop
 4263194: d503201f     	nop
 4263198: d503201f     	nop
 426319c: d503201f     	nop
 42631a0: d503201f     	nop
 42631a4: d503201f     	nop
 42631a8: d503201f     	nop
 42631ac: d503201f     	nop
 42631b0: d503201f     	nop
 42631b4: d503201f     	nop
 42631b8: d503201f     	nop
 42631bc: d503201f     	nop
