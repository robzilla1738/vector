
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4612dec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4612df0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4612df4: 910043fd     	add	x29, sp, #0x10
 4612df8: f9429808     	ldr	x8, [x0, #0x530]
 4612dfc: b40005e8     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612e00: aa0003f3     	mov	x19, x0
 4612e04: f9401d14     	ldr	x20, [x8, #0x38]
 4612e08: b40000f4     	cbz	x20, 0x4612e24 <_ChromeMain+0x460db88>
 4612e0c: f9400288     	ldr	x8, [x20]
 4612e10: f9401508     	ldr	x8, [x8, #0x28]
 4612e14: aa1403e0     	mov	x0, x20
 4612e18: d63f0100     	blr	x8
 4612e1c: 37000500     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e20: f9429a68     	ldr	x8, [x19, #0x530]
 4612e24: f9402114     	ldr	x20, [x8, #0x40]
 4612e28: b40000f4     	cbz	x20, 0x4612e44 <_ChromeMain+0x460dba8>
 4612e2c: f9400288     	ldr	x8, [x20]
 4612e30: f9401508     	ldr	x8, [x8, #0x28]
 4612e34: aa1403e0     	mov	x0, x20
 4612e38: d63f0100     	blr	x8
 4612e3c: 37000400     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e40: f9429a68     	ldr	x8, [x19, #0x530]
 4612e44: f9402514     	ldr	x20, [x8, #0x48]
 4612e48: b40000f4     	cbz	x20, 0x4612e64 <_ChromeMain+0x460dbc8>
 4612e4c: f9400288     	ldr	x8, [x20]
 4612e50: f9401508     	ldr	x8, [x8, #0x28]
 4612e54: aa1403e0     	mov	x0, x20
 4612e58: d63f0100     	blr	x8
 4612e5c: 37000300     	tbnz	w0, #0x0, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e60: f9429a68     	ldr	x8, [x19, #0x530]
 4612e64: f9402909     	ldr	x9, [x8, #0x50]
 4612e68: b5000629     	cbnz	x9, 0x4612f2c <_ChromeMain+0x460dc90>
 4612e6c: f9429a74     	ldr	x20, [x19, #0x530]
 4612e70: f9402e88     	ldr	x8, [x20, #0x58]
 4612e74: b50002c8     	cbnz	x8, 0x4612ecc <_ChromeMain+0x460dc30>
 4612e78: f9429a74     	ldr	x20, [x19, #0x530]
 4612e7c: f9403288     	ldr	x8, [x20, #0x60]
 4612e80: b50003e8     	cbnz	x8, 0x4612efc <_ChromeMain+0x460dc60>
 4612e84: f9429a68     	ldr	x8, [x19, #0x530]
 4612e88: f9401d14     	ldr	x20, [x8, #0x38]
 4612e8c: b5000194     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e90: f9402114     	ldr	x20, [x8, #0x40]
 4612e94: b5000154     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612e98: f9402514     	ldr	x20, [x8, #0x48]
 4612e9c: b5000114     	cbnz	x20, 0x4612ebc <_ChromeMain+0x460dc20>
 4612ea0: f9402909     	ldr	x9, [x8, #0x50]
 4612ea4: b50006c9     	cbnz	x9, 0x4612f7c <_ChromeMain+0x460dce0>
 4612ea8: f9402d09     	ldr	x9, [x8, #0x58]
 4612eac: b5000829     	cbnz	x9, 0x4612fb0 <_ChromeMain+0x460dd14>
 4612eb0: f9403109     	ldr	x9, [x8, #0x60]
 4612eb4: b5000569     	cbnz	x9, 0x4612f60 <_ChromeMain+0x460dcc4>
 4612eb8: d2800014     	mov	x20, #0x0               ; =0
 4612ebc: aa1403e0     	mov	x0, x20
 4612ec0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4612ec4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4612ec8: d65f03c0     	ret
 4612ecc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612ed0: 910a2000     	add	x0, x0, #0x288
 4612ed4: 96ec18eb     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612ed8: 36000a40     	tbz	w0, #0x0, 0x4613020 <_ChromeMain+0x460dd84>
 4612edc: f9402e94     	ldr	x20, [x20, #0x58]
 4612ee0: b4fffcd4     	cbz	x20, 0x4612e78 <_ChromeMain+0x460dbdc>
 4612ee4: f9400288     	ldr	x8, [x20]
 4612ee8: f9401508     	ldr	x8, [x8, #0x28]
 4612eec: aa1403e0     	mov	x0, x20
 4612ef0: d63f0100     	blr	x8
 4612ef4: 3607fc20     	tbz	w0, #0x0, 0x4612e78 <_ChromeMain+0x460dbdc>
 4612ef8: 17fffff1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612efc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f00: 910a2000     	add	x0, x0, #0x288
 4612f04: 96ec18df     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f08: 36000920     	tbz	w0, #0x0, 0x461302c <_ChromeMain+0x460dd90>
 4612f0c: f9403294     	ldr	x20, [x20, #0x60]
 4612f10: b4fffbb4     	cbz	x20, 0x4612e84 <_ChromeMain+0x460dbe8>
 4612f14: f9400288     	ldr	x8, [x20]
 4612f18: f9401508     	ldr	x8, [x8, #0x28]
 4612f1c: aa1403e0     	mov	x0, x20
 4612f20: d63f0100     	blr	x8
 4612f24: 3607fb00     	tbz	w0, #0x0, 0x4612e84 <_ChromeMain+0x460dbe8>
 4612f28: 17ffffe5     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f2c: aa0803f4     	mov	x20, x8
 4612f30: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f34: 910a2000     	add	x0, x0, #0x288
 4612f38: 96ec18d2     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f3c: 360006c0     	tbz	w0, #0x0, 0x4613014 <_ChromeMain+0x460dd78>
 4612f40: f9402a94     	ldr	x20, [x20, #0x50]
 4612f44: b4fff954     	cbz	x20, 0x4612e6c <_ChromeMain+0x460dbd0>
 4612f48: f9400288     	ldr	x8, [x20]
 4612f4c: f9401508     	ldr	x8, [x8, #0x28]
 4612f50: aa1403e0     	mov	x0, x20
 4612f54: d63f0100     	blr	x8
 4612f58: 3607f8a0     	tbz	w0, #0x0, 0x4612e6c <_ChromeMain+0x460dbd0>
 4612f5c: 17ffffd8     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f60: aa0803f3     	mov	x19, x8
 4612f64: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f68: 910a2000     	add	x0, x0, #0x288
 4612f6c: 96ec18c5     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f70: 340007c0     	cbz	w0, 0x4613068 <_ChromeMain+0x460ddcc>
 4612f74: f9403274     	ldr	x20, [x19, #0x60]
 4612f78: 17ffffd1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612f7c: aa0803f4     	mov	x20, x8
 4612f80: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612f84: 910a2000     	add	x0, x0, #0x288
 4612f88: 96ec18be     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612f8c: 36000560     	tbz	w0, #0x0, 0x4613038 <_ChromeMain+0x460dd9c>
 4612f90: f9402a88     	ldr	x8, [x20, #0x50]
 4612f94: f9429a74     	ldr	x20, [x19, #0x530]
 4612f98: b4000088     	cbz	x8, 0x4612fa8 <_ChromeMain+0x460dd0c>
 4612f9c: f9402a88     	ldr	x8, [x20, #0x50]
 4612fa0: b4fff8c8     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612fa4: 14000010     	b	0x4612fe4 <_ChromeMain+0x460dd48>
 4612fa8: aa1403e8     	mov	x8, x20
 4612fac: 17ffffbf     	b	0x4612ea8 <_ChromeMain+0x460dc0c>
 4612fb0: aa0803f4     	mov	x20, x8
 4612fb4: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612fb8: 910a2000     	add	x0, x0, #0x288
 4612fbc: 96ec18b1     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612fc0: 36000480     	tbz	w0, #0x0, 0x4613050 <_ChromeMain+0x460ddb4>
 4612fc4: f9402e88     	ldr	x8, [x20, #0x58]
 4612fc8: f9429a73     	ldr	x19, [x19, #0x530]
 4612fcc: b4000088     	cbz	x8, 0x4612fdc <_ChromeMain+0x460dd40>
 4612fd0: f9402e68     	ldr	x8, [x19, #0x58]
 4612fd4: b4fff728     	cbz	x8, 0x4612eb8 <_ChromeMain+0x460dc1c>
 4612fd8: 14000009     	b	0x4612ffc <_ChromeMain+0x460dd60>
 4612fdc: aa1303e8     	mov	x8, x19
 4612fe0: 17ffffb4     	b	0x4612eb0 <_ChromeMain+0x460dc14>
 4612fe4: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4612fe8: 910a2000     	add	x0, x0, #0x288
 4612fec: 96ec18a5     	bl	0x119280 <_ChromeMain+0x113fe4>
 4612ff0: 340002a0     	cbz	w0, 0x4613044 <_ChromeMain+0x460dda8>
 4612ff4: f9402a94     	ldr	x20, [x20, #0x50]
 4612ff8: 17ffffb1     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4612ffc: b00530c0     	adrp	x0, 0xec2b000 <dyld_stub_binder+0xec2b000>
 4613000: 910a2000     	add	x0, x0, #0x288
 4613004: 96ec189f     	bl	0x119280 <_ChromeMain+0x113fe4>
 4613008: 340002a0     	cbz	w0, 0x461305c <_ChromeMain+0x460ddc0>
 461300c: f9402e74     	ldr	x20, [x19, #0x58]
 4613010: 17ffffab     	b	0x4612ebc <_ChromeMain+0x460dc20>
 4613014: d4200000     	brk	#0
 4613018: d4400000     	hlt	#0
 461301c: d4200020     	brk	#0x1
 4613020: d4200000     	brk	#0
 4613024: d4400000     	hlt	#0
 4613028: d4200020     	brk	#0x1
 461302c: d4200000     	brk	#0
 4613030: d4400000     	hlt	#0
 4613034: d4200020     	brk	#0x1
 4613038: d4200000     	brk	#0
 461303c: d4400000     	hlt	#0
 4613040: d4200020     	brk	#0x1
 4613044: d4200000     	brk	#0
 4613048: d4400000     	hlt	#0
 461304c: d4200020     	brk	#0x1
 4613050: d4200000     	brk	#0
 4613054: d4400000     	hlt	#0
 4613058: d4200020     	brk	#0x1
 461305c: d4200000     	brk	#0
 4613060: d4400000     	hlt	#0
 4613064: d4200020     	brk	#0x1
 4613068: d4200000     	brk	#0
 461306c: d4400000     	hlt	#0
 4613070: d4200020     	brk	#0x1
 4613074: d10183ff     	sub	sp, sp, #0x60
 4613078: a9025ff8     	stp	x24, x23, [sp, #0x20]
 461307c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4613080: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4613084: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4613088: 910143fd     	add	x29, sp, #0x50
 461308c: aa0203f5     	mov	x21, x2
 4613090: aa0103f3     	mov	x19, x1
 4613094: aa0003f4     	mov	x20, x0
 4613098: f943bc16     	ldr	x22, [x0, #0x778]
 461309c: b4000276     	cbz	x22, 0x46130e8 <_ChromeMain+0x460de4c>
 46130a0: 395d0e88     	ldrb	w8, [x20, #0x743]
 46130a4: 36000228     	tbz	w8, #0x0, 0x46130e8 <_ChromeMain+0x460de4c>
 46130a8: f943c697     	ldr	x23, [x20, #0x788]
 46130ac: b940fad8     	ldr	w24, [x22, #0xf8]
 46130b0: aa1403e0     	mov	x0, x20
 46130b4: 52800001     	mov	w1, #0x0                ; =0
 46130b8: 9400002a     	bl	0x4613160 <_ChromeMain+0x460dec4>
 46130bc: 3dc002a0     	ldr	q0, [x21]
 46130c0: 3d8003e0     	str	q0, [sp]
 46130c4: f9400aa8     	ldr	x8, [x21, #0x10]
 46130c8: f9000be8     	str	x8, [sp, #0x10]
 46130cc: a900febf     	stp	xzr, xzr, [x21, #0x8]
 46130d0: f90002bf     	str	xzr, [x21]
 46130d4: 7100031f     	cmp	w24, #0x0
 46130d8: 9a9703e4     	csel	x4, xzr, x23, eq
 46130dc: 9a9f07e5     	cset	x5, ne
 46130e0: 9a9603e3     	csel	x3, xzr, x22, eq
 46130e4: 1400000d     	b	0x4613118 <_ChromeMain+0x460de7c>
 46130e8: aa1403e0     	mov	x0, x20
 46130ec: 52800001     	mov	w1, #0x0                ; =0
 46130f0: 9400001c     	bl	0x4613160 <_ChromeMain+0x460dec4>
 46130f4: d2800004     	mov	x4, #0x0                ; =0
 46130f8: d2800005     	mov	x5, #0x0                ; =0
 46130fc: d2800003     	mov	x3, #0x0                ; =0
 4613100: 3dc002a0     	ldr	q0, [x21]
 4613104: 3d8003e0     	str	q0, [sp]
 4613108: f9400aa8     	ldr	x8, [x21, #0x10]
 461310c: f9000be8     	str	x8, [sp, #0x10]
 4613110: a900febf     	stp	xzr, xzr, [x21, #0x8]
 4613114: f90002bf     	str	xzr, [x21]
 4613118: 910003e2     	mov	x2, sp
 461311c: aa1403e0     	mov	x0, x20
 4613120: aa1303e1     	mov	x1, x19
 4613124: 9400008c     	bl	0x4613354 <_ChromeMain+0x460e0b8>
 4613128: aa0003f3     	mov	x19, x0
 461312c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4613130: 36f800a8     	tbz	w8, #0x1f, 0x4613144 <_ChromeMain+0x460dea8>
 4613134: f94003e0     	ldr	x0, [sp]
 4613138: f9400be8     	ldr	x8, [sp, #0x10]
 461313c: d37ff901     	lsl	x1, x8, #1
 4613140: 96e7d75e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613144: aa1303e0     	mov	x0, x19
 4613148: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 461314c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4613150: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4613154: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4613158: 910183ff     	add	sp, sp, #0x60
 461315c: d65f03c0     	ret
 4613160: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4613164: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4613168: a9027bfd     	stp	x29, x30, [sp, #0x20]
 461316c: 910083fd     	add	x29, sp, #0x20
 4613170: 395d0c08     	ldrb	w8, [x0, #0x743]
 4613174: 350000a8     	cbnz	w8, 0x4613188 <_ChromeMain+0x460deec>
 4613178: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461317c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4613180: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4613184: d65f03c0     	ret
 4613188: aa0103f4     	mov	x20, x1
 461318c: aa0003f3     	mov	x19, x0
 4613190: 391d0c1f     	strb	wzr, [x0, #0x743]
 4613194: 395dc008     	ldrb	w8, [x0, #0x770]
 4613198: 34000048     	cbz	w8, 0x46131a0 <_ChromeMain+0x460df04>
 461319c: 391dc27f     	strb	wzr, [x19, #0x770]
 46131a0: f943be60     	ldr	x0, [x19, #0x778]
 46131a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46131a8: f0052cf5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46131ac: f94046a9     	ldr	x9, [x21, #0x88]
 46131b0: eb09011f     	cmp	x8, x9
 46131b4: 54000041     	b.ne	0x46131bc <_ChromeMain+0x460df20>
 46131b8: 96e83e21     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46131bc: f903be7f     	str	xzr, [x19, #0x778]
 46131c0: 911e0276     	add	x22, x19, #0x780
 46131c4: f943c260     	ldr	x0, [x19, #0x780]
 46131c8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46131cc: f94046a9     	ldr	x9, [x21, #0x88]
 46131d0: eb09011f     	cmp	x8, x9
 46131d4: 54000041     	b.ne	0x46131dc <_ChromeMain+0x460df40>
 46131d8: 96e83e19     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 46131dc: a9007edf     	stp	xzr, xzr, [x22]
 46131e0: f942ee68     	ldr	x8, [x19, #0x5d8]
 46131e4: d37ced15     	lsl	x21, x8, #4
 46131e8: b4000195     	cbz	x21, 0x4613218 <_ChromeMain+0x460df7c>
 46131ec: f942ea68     	ldr	x8, [x19, #0x5d0]
 46131f0: 91002116     	add	x22, x8, #0x8
 46131f4: 14000005     	b	0x4613208 <_ChromeMain+0x460df6c>
 46131f8: b904541f     	str	wzr, [x0, #0x454]
 46131fc: 96fe37e0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4613200: f10042b5     	subs	x21, x21, #0x10
 4613204: 540000a0     	b.eq	0x4613218 <_ChromeMain+0x460df7c>
 4613208: f84106c0     	ldr	x0, [x22], #0x10
 461320c: b9445408     	ldr	w8, [x0, #0x454]
 4613210: 34ffff88     	cbz	w8, 0x4613200 <_ChromeMain+0x460df64>
 4613214: 17fffff9     	b	0x46131f8 <_ChromeMain+0x460df5c>
 4613218: f943aa68     	ldr	x8, [x19, #0x750]
 461321c: 8b080508     	add	x8, x8, x8, lsl #1
 4613220: d37df109     	lsl	x9, x8, #3
 4613224: b4000529     	cbz	x9, 0x46132c8 <_ChromeMain+0x460e02c>
 4613228: f943a675     	ldr	x21, [x19, #0x748]
 461322c: 8b080eb6     	add	x22, x21, x8, lsl #3
 4613230: 14000009     	b	0x4613254 <_ChromeMain+0x460dfb8>
 4613234: aa0903e8     	mov	x8, x9
 4613238: 14000017     	b	0x4613294 <_ChromeMain+0x460dff8>
 461323c: 910022a1     	add	x1, x21, #0x8
 4613240: aa0803e0     	mov	x0, x8
 4613244: 970a4653     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4613248: 910062b5     	add	x21, x21, #0x18
 461324c: eb1602bf     	cmp	x21, x22
 4613250: 540003c0     	b.eq	0x46132c8 <_ChromeMain+0x460e02c>
 4613254: f942ea69     	ldr	x9, [x19, #0x5d0]
 4613258: f942ee6a     	ldr	x10, [x19, #0x5d8]
 461325c: d37ced48     	lsl	x8, x10, #4
 4613260: b4fffea8     	cbz	x8, 0x4613234 <_ChromeMain+0x460df98>
 4613264: 9344fd0c     	asr	x12, x8, #4
 4613268: f94002ab     	ldr	x11, [x21]
 461326c: aa0903e8     	mov	x8, x9
 4613270: d341fd8d     	lsr	x13, x12, #1
 4613274: 8b0d110e     	add	x14, x8, x13, lsl #4
 4613278: f84105cf     	ldr	x15, [x14], #0x10
 461327c: aa6c07f0     	mvn	x16, x12, lsr #1
 4613280: 8b10018c     	add	x12, x12, x16
 4613284: eb0b01ff     	cmp	x15, x11
 4613288: 9a8d318c     	csel	x12, x12, x13, lo
 461328c: 9a8831c8     	csel	x8, x14, x8, lo
 4613290: b5ffff0c     	cbnz	x12, 0x4613270 <_ChromeMain+0x460dfd4>
 4613294: 8b0a1129     	add	x9, x9, x10, lsl #4
 4613298: eb09011f     	cmp	x8, x9
 461329c: 54fffd60     	b.eq	0x4613248 <_ChromeMain+0x460dfac>
 46132a0: f94002a9     	ldr	x9, [x21]
 46132a4: f940010a     	ldr	x10, [x8]
 46132a8: eb0a013f     	cmp	x9, x10
 46132ac: 54fffce3     	b.lo	0x4613248 <_ChromeMain+0x460dfac>
 46132b0: f9400508     	ldr	x8, [x8, #0x8]
 46132b4: b4fffca8     	cbz	x8, 0x4613248 <_ChromeMain+0x460dfac>
 46132b8: 34fffc34     	cbz	w20, 0x461323c <_ChromeMain+0x460dfa0>
 46132bc: f942a260     	ldr	x0, [x19, #0x540]
 46132c0: b5000400     	cbnz	x0, 0x4613340 <_ChromeMain+0x460e0a4>
 46132c4: 17ffffde     	b	0x461323c <_ChromeMain+0x460dfa0>
 46132c8: 360000f4     	tbz	w20, #0x0, 0x46132e4 <_ChromeMain+0x460e048>
 46132cc: f942a268     	ldr	x8, [x19, #0x540]
 46132d0: b40000c8     	cbz	x8, 0x46132e8 <_ChromeMain+0x460e04c>
 46132d4: f9406108     	ldr	x8, [x8, #0xc0]
 46132d8: f100011f     	cmp	x8, #0x0
 46132dc: 1a9f07e8     	cset	w8, ne
 46132e0: 14000002     	b	0x46132e8 <_ChromeMain+0x460e04c>
 46132e4: 52800008     	mov	w8, #0x0                ; =0
 46132e8: 39218a68     	strb	w8, [x19, #0x862]
 46132ec: f943aa68     	ldr	x8, [x19, #0x750]
 46132f0: 8b080509     	add	x9, x8, x8, lsl #1
 46132f4: d37df129     	lsl	x9, x9, #3
 46132f8: b4000149     	cbz	x9, 0x4613320 <_ChromeMain+0x460e084>
 46132fc: f943a66a     	ldr	x10, [x19, #0x748]
 4613300: d37df10b     	lsl	x11, x8, #3
 4613304: cb081568     	sub	x8, x11, x8, lsl #5
 4613308: 8b0a0129     	add	x9, x9, x10
 461330c: d1006129     	sub	x9, x9, #0x18
 4613310: b4000209     	cbz	x9, 0x4613350 <_ChromeMain+0x460e0b4>
 4613314: d1006129     	sub	x9, x9, #0x18
 4613318: 91006108     	add	x8, x8, #0x18
 461331c: b5ffffa8     	cbnz	x8, 0x4613310 <_ChromeMain+0x460e074>
 4613320: f903aa7f     	str	xzr, [x19, #0x750]
 4613324: b907627f     	str	wzr, [x19, #0x760]
 4613328: f9429e60     	ldr	x0, [x19, #0x538]
 461332c: b4fff260     	cbz	x0, 0x4613178 <_ChromeMain+0x460dedc>
 4613330: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4613334: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4613338: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461333c: 16fe3790     	b	0x5a117c <_ChromeMain+0x59bee0>
 4613340: 910022a2     	add	x2, x21, #0x8
 4613344: aa0803e1     	mov	x1, x8
 4613348: 958128cf     	bl	0xa65d684 <_ChromeMain+0xa6583e8>
 461334c: 17ffffbf     	b	0x4613248 <_ChromeMain+0x460dfac>
 4613350: d4200020     	brk	#0x1
 4613354: d101c3ff     	sub	sp, sp, #0x70
 4613358: a90267fa     	stp	x26, x25, [sp, #0x20]
 461335c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4613360: a90457f6     	stp	x22, x21, [sp, #0x40]
 4613364: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4613368: a9067bfd     	stp	x29, x30, [sp, #0x60]
 461336c: 910183fd     	add	x29, sp, #0x60
 4613370: f9429808     	ldr	x8, [x0, #0x530]
 4613374: b40006a8     	cbz	x8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613378: d2800019     	mov	x25, #0x0               ; =0
 461337c: 39408508     	ldrb	w8, [x8, #0x21]
 4613380: 34000668     	cbz	w8, 0x461344c <_ChromeMain+0x460e1b0>
 4613384: aa0103f4     	mov	x20, x1
 4613388: 39406028     	ldrb	w8, [x1, #0x18]
 461338c: 36000608     	tbz	w8, #0x0, 0x461344c <_ChromeMain+0x460e1b0>
 4613390: aa0503f6     	mov	x22, x5
 4613394: aa0403f8     	mov	x24, x4
 4613398: aa0303f7     	mov	x23, x3
 461339c: aa0203f5     	mov	x21, x2
 46133a0: aa0003f3     	mov	x19, x0
 46133a4: b4000643     	cbz	x3, 0x461346c <_ChromeMain+0x460e1d0>
 46133a8: b940fae8     	ldr	w8, [x23, #0xf8]
 46133ac: 34000608     	cbz	w8, 0x461346c <_ChromeMain+0x460e1d0>
 46133b0: 52800039     	mov	w25, #0x1               ; =1
 46133b4: 39805ea8     	ldrsb	x8, [x21, #0x17]
 46133b8: b7f806a8     	tbnz	x8, #0x3f, 0x461348c <_ChromeMain+0x460e1f0>
 46133bc: b40006c8     	cbz	x8, 0x4613494 <_ChromeMain+0x460e1f8>
 46133c0: f94026e8     	ldr	x8, [x23, #0x48]
 46133c4: eb18011f     	cmp	x8, x24
 46133c8: 9a983109     	csel	x9, x8, x24, lo
 46133cc: 6a16033f     	tst	w25, w22
 46133d0: 9a881122     	csel	x2, x9, x8, ne
 46133d4: f9429a60     	ldr	x0, [x19, #0x530]
 46133d8: aa1703e1     	mov	x1, x23
 46133dc: aa1503e3     	mov	x3, x21
 46133e0: aa1403e4     	mov	x4, x20
 46133e4: d2800005     	mov	x5, #0x0                ; =0
 46133e8: 957d07ac     	bl	0xa555298 <_ChromeMain+0xa54fffc>
 46133ec: aa0003f9     	mov	x25, x0
 46133f0: b40002e0     	cbz	x0, 0x461344c <_ChromeMain+0x460e1b0>
 46133f4: aa1303e0     	mov	x0, x19
 46133f8: aa1903e1     	mov	x1, x25
 46133fc: 940022b4     	bl	0x461becc <_ChromeMain+0x4616c30>
 4613400: f9436274     	ldr	x20, [x19, #0x6c0]
 4613404: b4000254     	cbz	x20, 0x461344c <_ChromeMain+0x460e1b0>
 4613408: 52800028     	mov	w8, #0x1                ; =1
 461340c: b8280288     	ldadd	w8, w8, [x20]
 4613410: 7100011f     	cmp	w8, #0x0
 4613414: 540009ad     	b.le	0x4613548 <_ChromeMain+0x460e2ac>
 4613418: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461341c: 6b09011f     	cmp	w8, w9
 4613420: 540009a0     	b.eq	0x4613554 <_ChromeMain+0x460e2b8>
 4613424: f9436268     	ldr	x8, [x19, #0x6c0]
 4613428: f9400508     	ldr	x8, [x8, #0x8]
 461342c: aa1403e0     	mov	x0, x20
 4613430: d63f0100     	blr	x8
 4613434: 12800008     	mov	w8, #-0x1               ; =-1
 4613438: b8e80288     	ldaddal	w8, w8, [x20]
 461343c: 7100051f     	cmp	w8, #0x1
 4613440: 54000061     	b.ne	0x461344c <_ChromeMain+0x460e1b0>
 4613444: 1400003d     	b	0x4613538 <_ChromeMain+0x460e29c>
 4613448: d2800019     	mov	x25, #0x0               ; =0
 461344c: aa1903e0     	mov	x0, x25
 4613450: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4613454: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4613458: a94457f6     	ldp	x22, x21, [sp, #0x40]
 461345c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4613460: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4613464: 9101c3ff     	add	sp, sp, #0x70
 4613468: d65f03c0     	ret
 461346c: aa1303e0     	mov	x0, x19
 4613470: 97fffe5f     	bl	0x4612dec <_ChromeMain+0x460db50>
 4613474: b4fffea0     	cbz	x0, 0x4613448 <_ChromeMain+0x460e1ac>
 4613478: aa0003f7     	mov	x23, x0
 461347c: b940f808     	ldr	w8, [x0, #0xf8]
 4613480: 34fffe48     	cbz	w8, 0x4613448 <_ChromeMain+0x460e1ac>
 4613484: 52800019     	mov	w25, #0x0               ; =0
 4613488: 17ffffcb     	b	0x46133b4 <_ChromeMain+0x460e118>
 461348c: f94006a8     	ldr	x8, [x21, #0x8]
 4613490: b5fff988     	cbnz	x8, 0x46133c0 <_ChromeMain+0x460e124>
 4613494: b9403e88     	ldr	w8, [x20, #0x3c]
 4613498: 7100051f     	cmp	w8, #0x1
 461349c: 5400014b     	b.lt	0x46134c4 <_ChromeMain+0x460e228>
 46134a0: 39405e8a     	ldrb	w10, [x20, #0x17]
 46134a4: 13001d49     	sxtb	w9, w10
 46134a8: f940068b     	ldr	x11, [x20, #0x8]
 46134ac: 7100013f     	cmp	w9, #0x0
 46134b0: 9a8a416b     	csel	x11, x11, x10, mi
 46134b4: b9803a8a     	ldrsw	x10, [x20, #0x38]
 46134b8: eb0a016b     	subs	x11, x11, x10
 46134bc: 54000523     	b.lo	0x4613560 <_ChromeMain+0x460e2c4>
 46134c0: 54000241     	b.ne	0x4613508 <_ChromeMain+0x460e26c>
 46134c4: aa1403e0     	mov	x0, x20
 46134c8: 97016570     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46134cc: 39805c08     	ldrsb	x8, [x0, #0x17]
 46134d0: a9402809     	ldp	x9, x10, [x0]
 46134d4: f100011f     	cmp	x8, #0x0
 46134d8: 9a804120     	csel	x0, x9, x0, mi
 46134dc: 7100011f     	cmp	w8, #0x0
 46134e0: 9a884141     	csel	x1, x10, x8, mi
 46134e4: 910023e8     	add	x8, sp, #0x8
 46134e8: 970b3b8a     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46134ec: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 46134f0: 37f801a8     	tbnz	w8, #0x1f, 0x4613524 <_ChromeMain+0x460e288>
 46134f4: 3cc083e0     	ldur	q0, [sp, #0x8]
 46134f8: 3d8002a0     	str	q0, [x21]
 46134fc: f9400fe8     	ldr	x8, [sp, #0x18]
 4613500: f9000aa8     	str	x8, [x21, #0x10]
 4613504: 17ffffaf     	b	0x46133c0 <_ChromeMain+0x460e124>
 4613508: eb08017f     	cmp	x11, x8
 461350c: 9a883161     	csel	x1, x11, x8, lo
 4613510: f9400288     	ldr	x8, [x20]
 4613514: 7100013f     	cmp	w9, #0x0
 4613518: 9a944108     	csel	x8, x8, x20, mi
 461351c: 8b0a0100     	add	x0, x8, x10
 4613520: 17fffff1     	b	0x46134e4 <_ChromeMain+0x460e248>
 4613524: f94002a0     	ldr	x0, [x21]
 4613528: f9400aa8     	ldr	x8, [x21, #0x10]
 461352c: d37ff901     	lsl	x1, x8, #1
 4613530: 96e7d662     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4613534: 17fffff0     	b	0x46134f4 <_ChromeMain+0x460e258>
 4613538: f9400a88     	ldr	x8, [x20, #0x10]
 461353c: aa1403e0     	mov	x0, x20
 4613540: d63f0100     	blr	x8
 4613544: 17ffffc2     	b	0x461344c <_ChromeMain+0x460e1b0>
 4613548: d4200000     	brk	#0
 461354c: d4400000     	hlt	#0
 4613550: d4200020     	brk	#0x1
 4613554: d4200000     	brk	#0
 4613558: d4400000     	hlt	#0
 461355c: d4200020     	brk	#0x1
 4613560: b0048e80     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4613564: 91376000     	add	x0, x0, #0xdd8
 4613568: 9417b35b     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
