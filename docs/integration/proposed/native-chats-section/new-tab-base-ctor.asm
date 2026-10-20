
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4242e5c: d10483ff     	sub	sp, sp, #0x120
 4242e60: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 4242e64: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 4242e68: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4242e6c: a9117bfd     	stp	x29, x30, [sp, #0x110]
 4242e70: 910443fd     	add	x29, sp, #0x110
 4242e74: aa0003f3     	mov	x19, x0
 4242e78: f81c03bf     	stur	xzr, [x29, #-0x40]
 4242e7c: 52800048     	mov	w8, #0x2                ; =2
 4242e80: 381c83a8     	sturb	w8, [x29, #-0x38]
 4242e84: 52800700     	mov	w0, #0x38               ; =56
 4242e88: 96f73138     	bl	0xf368 <_ChromeMain+0xa0cc>
 4242e8c: aa0003f4     	mov	x20, x0
 4242e90: a902fc1f     	stp	xzr, xzr, [x0, #0x28]
 4242e94: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 4242e98: f0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4242e9c: 91384108     	add	x8, x8, #0xe10
 4242ea0: f9000008     	str	x8, [x0]
 4242ea4: d0050888     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4242ea8: 9127e108     	add	x8, x8, #0x9f8
 4242eac: aa0003f5     	mov	x21, x0
 4242eb0: f8008ea8     	str	x8, [x21, #0x8]!
 4242eb4: f900081f     	str	xzr, [x0, #0x10]
 4242eb8: 3900801f     	strb	wzr, [x0, #0x20]
 4242ebc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4242ec0: 90054b89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4242ec4: f9404529     	ldr	x9, [x9, #0x88]
 4242ec8: eb09011f     	cmp	x8, x9
 4242ecc: 54000061     	b.ne	0x4242ed8 <_ChromeMain+0x423dc3c>
 4242ed0: aa1503e0     	mov	x0, x21
 4242ed4: 96f7450a     	bl	0x142fc <_ChromeMain+0xf060>
 4242ed8: a902fe95     	stp	x21, xzr, [x20, #0x28]
 4242edc: aa1503e0     	mov	x0, x21
 4242ee0: d2800001     	mov	x1, #0x0                ; =0
 4242ee4: 97726f6f     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 4242ee8: d10103a1     	sub	x1, x29, #0x40
 4242eec: aa1303e0     	mov	x0, x19
 4242ef0: d2800002     	mov	x2, #0x0                ; =0
 4242ef4: d2800003     	mov	x3, #0x0                ; =0
 4242ef8: 52800044     	mov	w4, #0x2                ; =2
 4242efc: aa1403e5     	mov	x5, x20
 4242f00: 97651850     	bl	0x1b89040 <_ChromeMain+0x1b83da4>
 4242f04: 385c83a8     	ldurb	w8, [x29, #-0x38]
 4242f08: 7103fd1f     	cmp	w8, #0xff
 4242f0c: 54000060     	b.eq	0x4242f18 <_ChromeMain+0x423dc7c>
 4242f10: f85c03a0     	ldur	x0, [x29, #-0x40]
 4242f14: b5000920     	cbnz	x0, 0x4243038 <_ChromeMain+0x423dd9c>
 4242f18: 52801fe8     	mov	w8, #0xff               ; =255
 4242f1c: 381c83a8     	sturb	w8, [x29, #-0x38]
 4242f20: b0052248     	adrp	x8, 0xe68b000 <dyld_stub_binder+0xe68b000>
 4242f24: 91084108     	add	x8, x8, #0x210
 4242f28: 91138109     	add	x9, x8, #0x4e0
 4242f2c: a9002668     	stp	x8, x9, [x19]
 4242f30: 91142109     	add	x9, x8, #0x508
 4242f34: f9000a69     	str	x9, [x19, #0x10]
 4242f38: 91150109     	add	x9, x8, #0x540
 4242f3c: 9115c10a     	add	x10, x8, #0x570
 4242f40: a906aa69     	stp	x9, x10, [x19, #0x68]
 4242f44: 91170109     	add	x9, x8, #0x5c0
 4242f48: f9005a69     	str	x9, [x19, #0xb0]
 4242f4c: 91188109     	add	x9, x8, #0x620
 4242f50: f9006e69     	str	x9, [x19, #0xd8]
 4242f54: 91194109     	add	x9, x8, #0x650
 4242f58: aa1303f4     	mov	x20, x19
 4242f5c: f80f8e89     	str	x9, [x20, #0xf8]!
 4242f60: 9119e109     	add	x9, x8, #0x678
 4242f64: f9018a69     	str	x9, [x19, #0x310]
 4242f68: 911be109     	add	x9, x8, #0x6f8
 4242f6c: f9018e69     	str	x9, [x19, #0x318]
 4242f70: 911ee109     	add	x9, x8, #0x7b8
 4242f74: f9019269     	str	x9, [x19, #0x320]
 4242f78: 911fc109     	add	x9, x8, #0x7f0
 4242f7c: f9025a69     	str	x9, [x19, #0x4b0]
 4242f80: 91210109     	add	x9, x8, #0x840
 4242f84: f9025e69     	str	x9, [x19, #0x4b8]
 4242f88: 9121c108     	add	x8, x8, #0x870
 4242f8c: f9031668     	str	x8, [x19, #0x628]
 4242f90: 3918c27f     	strb	wzr, [x19, #0x630]
 4242f94: b906367f     	str	wzr, [x19, #0x634]
 4242f98: f9031e7f     	str	xzr, [x19, #0x638]
 4242f9c: 91190275     	add	x21, x19, #0x640
 4242fa0: f9032275     	str	x21, [x19, #0x640]
 4242fa4: f9032675     	str	x21, [x19, #0x648]
 4242fa8: f9032a7f     	str	xzr, [x19, #0x650]
 4242fac: 3919627f     	strb	wzr, [x19, #0x658]
 4242fb0: f903327f     	str	xzr, [x19, #0x660]
 4242fb4: 52800100     	mov	w0, #0x8                ; =8
 4242fb8: 96f730ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 4242fbc: b900001f     	str	wzr, [x0]
 4242fc0: 3900101f     	strb	wzr, [x0, #0x4]
 4242fc4: b40000c0     	cbz	x0, 0x4242fdc <_ChromeMain+0x423dd40>
 4242fc8: 52800028     	mov	w8, #0x1                ; =1
 4242fcc: b8280008     	ldadd	w8, w8, [x0]
 4242fd0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4242fd4: 6b09011f     	cmp	w8, w9
 4242fd8: 54002f40     	b.eq	0x42435c0 <_ChromeMain+0x423e324>
 4242fdc: f9033660     	str	x0, [x19, #0x668]
 4242fe0: f9033a75     	str	x21, [x19, #0x670]
 4242fe4: 39518268     	ldrb	w8, [x19, #0x460]
 4242fe8: 340000a8     	cbz	w8, 0x4242ffc <_ChromeMain+0x423dd60>
 4242fec: 3911827f     	strb	wzr, [x19, #0x460]
 4242ff0: 91118261     	add	x1, x19, #0x460
 4242ff4: aa1403e0     	mov	x0, x20
 4242ff8: 973393f6     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4242ffc: aa1303e9     	mov	x9, x19
 4243000: f84e8d28     	ldr	x8, [x9, #0xe8]!
 4243004: b4000368     	cbz	x8, 0x4243070 <_ChromeMain+0x423ddd4>
 4243008: b0053e0a     	adrp	x10, 0xea04000 <dyld_stub_binder+0xea04000>
 424300c: 9123414a     	add	x10, x10, #0x8d0
 4243010: f940110b     	ldr	x11, [x8, #0x20]
 4243014: eb0a017f     	cmp	x11, x10
 4243018: 540000a8     	b.hi	0x424302c <_ChromeMain+0x423dd90>
 424301c: 54000242     	b.hs	0x4243064 <_ChromeMain+0x423ddc8>
 4243020: f9400508     	ldr	x8, [x8, #0x8]
 4243024: b5ffff68     	cbnz	x8, 0x4243010 <_ChromeMain+0x423dd74>
 4243028: 14000012     	b	0x4243070 <_ChromeMain+0x423ddd4>
 424302c: f9400108     	ldr	x8, [x8]
 4243030: b5ffff08     	cbnz	x8, 0x4243010 <_ChromeMain+0x423dd74>
 4243034: 1400000f     	b	0x4243070 <_ChromeMain+0x423ddd4>
 4243038: 12800008     	mov	w8, #-0x1               ; =-1
 424303c: b8e80008     	ldaddal	w8, w8, [x0]
 4243040: 7100051f     	cmp	w8, #0x1
 4243044: 54fff6a1     	b.ne	0x4242f18 <_ChromeMain+0x423dc7c>
 4243048: f9400808     	ldr	x8, [x0, #0x10]
 424304c: d63f0100     	blr	x8
 4243050: 17ffffb2     	b	0x4242f18 <_ChromeMain+0x423dc7c>
 4243054: f9400008     	ldr	x8, [x0]
 4243058: f9400508     	ldr	x8, [x8, #0x8]
 424305c: d63f0100     	blr	x8
 4243060: 14000008     	b	0x4243080 <_ChromeMain+0x423dde4>
 4243064: eb09011f     	cmp	x8, x9
 4243068: 54002b20     	b.eq	0x42435cc <_ChromeMain+0x423e330>
 424306c: f9401908     	ldr	x8, [x8, #0x30]
 4243070: b900111f     	str	wzr, [x8, #0x10]
 4243074: f9401d00     	ldr	x0, [x8, #0x38]
 4243078: f9001d1f     	str	xzr, [x8, #0x38]
 424307c: b5fffec0     	cbnz	x0, 0x4243054 <_ChromeMain+0x423ddb8>
 4243080: f81b03bf     	stur	xzr, [x29, #-0x50]
 4243084: 6f00e400     	movi.2d	v0, #0000000000000000
 4243088: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 424308c: 52801d88     	mov	w8, #0xec               ; =236
 4243090: b81883a8     	stur	w8, [x29, #-0x78]
 4243094: 3818c3bf     	sturb	wzr, [x29, #-0x74]
 4243098: 90052f40     	adrp	x0, 0xe82b000 <dyld_stub_binder+0xe82b000>
 424309c: 9134a000     	add	x0, x0, #0xd28
 42430a0: d101c3a8     	sub	x8, x29, #0x70
 42430a4: d101e3a1     	sub	x1, x29, #0x78
 42430a8: 52800182     	mov	w2, #0xc                ; =12
 42430ac: d2800003     	mov	x3, #0x0                ; =0
 42430b0: 972ec61c     	bl	0xdf4920 <_ChromeMain+0xdef684>
 42430b4: 390183ff     	strb	wzr, [sp, #0x60]
 42430b8: 52801fe8     	mov	w8, #0xff               ; =255
 42430bc: 390203e8     	strb	w8, [sp, #0x80]
 42430c0: 910183e0     	add	x0, sp, #0x60
 42430c4: d101c3a1     	sub	x1, x29, #0x70
 42430c8: 9711ef31     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 42430cc: 52800028     	mov	w8, #0x1                ; =1
 42430d0: 390223e8     	strb	w8, [sp, #0x88]
 42430d4: f9400268     	ldr	x8, [x19]
 42430d8: f9422d08     	ldr	x8, [x8, #0x458]
 42430dc: 910183e2     	add	x2, sp, #0x60
 42430e0: aa1303e0     	mov	x0, x19
 42430e4: 52800001     	mov	w1, #0x0                ; =0
 42430e8: d63f0100     	blr	x8
 42430ec: 394223e8     	ldrb	w8, [sp, #0x88]
 42430f0: 34000068     	cbz	w8, 0x42430fc <_ChromeMain+0x423de60>
 42430f4: 910183e0     	add	x0, sp, #0x60
 42430f8: 97180dd2     	bl	0x846840 <_ChromeMain+0x8415a4>
 42430fc: f9426260     	ldr	x0, [x19, #0x4c0]
 4243100: f9400008     	ldr	x8, [x0]
 4243104: f9400d08     	ldr	x8, [x8, #0x18]
 4243108: d63f0100     	blr	x8
 424310c: b21c03e1     	mov	x1, #0x1000000010       ; =68719476752
 4243110: 52800022     	mov	w2, #0x1                ; =1
 4243114: 97963a53     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4243118: 90056668     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 424311c: f946f500     	ldr	x0, [x8, #0xde8]
 4243120: b4002320     	cbz	x0, 0x4243584 <_ChromeMain+0x423e2e8>
 4243124: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4243128: f9003bff     	str	xzr, [sp, #0x70]
 424312c: 910183f5     	add	x21, sp, #0x60
 4243130: 910183e8     	add	x8, sp, #0x60
 4243134: 528020a1     	mov	w1, #0x105              ; =261
 4243138: 9741c569     	bl	0x12b46dc <_ChromeMain+0x12af440>
 424313c: 3981dfe8     	ldrsb	x8, [sp, #0x77]
 4243140: a9462be9     	ldp	x9, x10, [sp, #0x60]
 4243144: f100011f     	cmp	x8, #0x0
 4243148: 9a954121     	csel	x1, x9, x21, mi
 424314c: 7100011f     	cmp	w8, #0x0
 4243150: 9a884142     	csel	x2, x10, x8, mi
 4243154: f9400268     	ldr	x8, [x19]
 4243158: f9423108     	ldr	x8, [x8, #0x460]
 424315c: aa1303e0     	mov	x0, x19
 4243160: d63f0100     	blr	x8
 4243164: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 4243168: 36f800a8     	tbz	w8, #0x1f, 0x424317c <_ChromeMain+0x423dee0>
 424316c: f94033e0     	ldr	x0, [sp, #0x60]
 4243170: f9403be8     	ldr	x8, [sp, #0x70]
 4243174: d37ff901     	lsl	x1, x8, #1
 4243178: 96f71750     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424317c: 52801d95     	mov	w21, #0xec              ; =236
 4243180: b90057f5     	str	w21, [sp, #0x54]
 4243184: 390163ff     	strb	wzr, [sp, #0x58]
 4243188: 52800036     	mov	w22, #0x1               ; =1
 424318c: 390173f6     	strb	w22, [sp, #0x5c]
 4243190: f9400268     	ldr	x8, [x19]
 4243194: f9423508     	ldr	x8, [x8, #0x468]
 4243198: 910153e1     	add	x1, sp, #0x54
 424319c: aa1303e0     	mov	x0, x19
 42431a0: d63f0100     	blr	x8
 42431a4: b9004ff5     	str	w21, [sp, #0x4c]
 42431a8: 390143ff     	strb	wzr, [sp, #0x50]
 42431ac: 910133e2     	add	x2, sp, #0x4c
 42431b0: aa1303e0     	mov	x0, x19
 42431b4: 52800061     	mov	w1, #0x3                ; =3
 42431b8: 9771a266     	bl	0x1eabb50 <_ChromeMain+0x1ea68b4>
 42431bc: f9426660     	ldr	x0, [x19, #0x4c8]
 42431c0: 52800061     	mov	w1, #0x3                ; =3
 42431c4: 97651acf     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 42431c8: f9426660     	ldr	x0, [x19, #0x4c8]
 42431cc: 528000c1     	mov	w1, #0x6                ; =6
 42431d0: 970d76dc     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 42431d4: f9426675     	ldr	x21, [x19, #0x4c8]
 42431d8: 394f62a8     	ldrb	w8, [x21, #0x3d8]
 42431dc: 34000108     	cbz	w8, 0x42431fc <_ChromeMain+0x423df60>
 42431e0: 390f62bf     	strb	wzr, [x21, #0x3d8]
 42431e4: aa1503e0     	mov	x0, x21
 42431e8: 970d8195     	bl	0x5a383c <_ChromeMain+0x59e5a0>
 42431ec: 9103e2a0     	add	x0, x21, #0xf8
 42431f0: 910f62a1     	add	x1, x21, #0x3d8
 42431f4: 97339377     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 42431f8: f9426675     	ldr	x21, [x19, #0x4c8]
 42431fc: b90047ff     	str	wzr, [sp, #0x44]
 4243200: 390123f6     	strb	w22, [sp, #0x48]
 4243204: 910113e1     	add	x1, sp, #0x44
 4243208: aa1503e0     	mov	x0, x21
 424320c: 97181539     	bl	0x8486f0 <_ChromeMain+0x843454>
 4243210: f9426675     	ldr	x21, [x19, #0x4c8]
 4243214: f941aeb7     	ldr	x23, [x21, #0x358]
 4243218: f94026f6     	ldr	x22, [x23, #0x48]
 424321c: b94042c2     	ldr	w2, [x22, #0x40]
 4243220: 3100045f     	cmn	w2, #0x1
 4243224: 54001a60     	b.eq	0x4243570 <_ChromeMain+0x423e2d4>
 4243228: b9404ac3     	ldr	w3, [x22, #0x48]
 424322c: 3100047f     	cmn	w3, #0x1
 4243230: 54001d20     	b.eq	0x42435d4 <_ChromeMain+0x423e338>
 4243234: aa1603e0     	mov	x0, x22
 4243238: 52800041     	mov	w1, #0x2                ; =2
 424323c: 97699111     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4243240: aa0003f6     	mov	x22, x0
 4243244: b40000a0     	cbz	x0, 0x4243258 <_ChromeMain+0x423dfbc>
 4243248: b94002c8     	ldr	w8, [x22]
 424324c: 31000508     	adds	w8, w8, #0x1
 4243250: b90002c8     	str	w8, [x22]
 4243254: 540019e2     	b.hs	0x4243590 <_ChromeMain+0x423e2f4>
 4243258: b94042c2     	ldr	w2, [x22, #0x40]
 424325c: 3100045f     	cmn	w2, #0x1
 4243260: 54001800     	b.eq	0x4243560 <_ChromeMain+0x423e2c4>
 4243264: aa1603e0     	mov	x0, x22
 4243268: 52800001     	mov	w1, #0x0                ; =0
 424326c: 52803203     	mov	w3, #0x190              ; =400
 4243270: 97699104     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4243274: f90033e0     	str	x0, [sp, #0x60]
 4243278: b40000a0     	cbz	x0, 0x424328c <_ChromeMain+0x423dff0>
 424327c: b9400008     	ldr	w8, [x0]
 4243280: 31000508     	adds	w8, w8, #0x1
 4243284: b9000008     	str	w8, [x0]
 4243288: 540018a2     	b.hs	0x424359c <_ChromeMain+0x423e300>
 424328c: f94002a8     	ldr	x8, [x21]
 4243290: f941ed08     	ldr	x8, [x8, #0x3d8]
 4243294: 910183e1     	add	x1, sp, #0x60
 4243298: aa1503e0     	mov	x0, x21
 424329c: d63f0100     	blr	x8
 42432a0: f94033e0     	ldr	x0, [sp, #0x60]
 42432a4: b40000c0     	cbz	x0, 0x42432bc <_ChromeMain+0x423e020>
 42432a8: b9400009     	ldr	w9, [x0]
 42432ac: 51000528     	sub	w8, w9, #0x1
 42432b0: b9000008     	str	w8, [x0]
 42432b4: 340017a9     	cbz	w9, 0x42435a8 <_ChromeMain+0x423e30c>
 42432b8: 340014a8     	cbz	w8, 0x424354c <_ChromeMain+0x423e2b0>
 42432bc: b40000d6     	cbz	x22, 0x42432d4 <_ChromeMain+0x423e038>
 42432c0: b94002c9     	ldr	w9, [x22]
 42432c4: 51000528     	sub	w8, w9, #0x1
 42432c8: b90002c8     	str	w8, [x22]
 42432cc: 34001749     	cbz	w9, 0x42435b4 <_ChromeMain+0x423e318>
 42432d0: 34001168     	cbz	w8, 0x42434fc <_ChromeMain+0x423e260>
 42432d4: b945f268     	ldr	w8, [x19, #0x5f0]
 42432d8: 7100211f     	cmp	w8, #0x8
 42432dc: 54000120     	b.eq	0x4243300 <_ChromeMain+0x423e064>
 42432e0: 52800108     	mov	w8, #0x8                ; =8
 42432e4: b905f268     	str	w8, [x19, #0x5f0]
 42432e8: aa1303e0     	mov	x0, x19
 42432ec: 52800061     	mov	w1, #0x3                ; =3
 42432f0: 9716799d     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 42432f4: 9117c261     	add	x1, x19, #0x5f0
 42432f8: aa1403e0     	mov	x0, x20
 42432fc: 97339335     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4243300: 3957be68     	ldrb	w8, [x19, #0x5ef]
 4243304: 35001768     	cbnz	w8, 0x42435f0 <_ChromeMain+0x423e354>
 4243308: b945f668     	ldr	w8, [x19, #0x5f4]
 424330c: 35001028     	cbnz	w8, 0x4243510 <_ChromeMain+0x423e274>
 4243310: 91177268     	add	x8, x19, #0x5dc
 4243314: f940010a     	ldr	x10, [x8]
 4243318: d2c00409     	mov	x9, #0x2000000000       ; =137438953472
 424331c: eb09015f     	cmp	x10, x9
 4243320: 54000100     	b.eq	0x4243340 <_ChromeMain+0x423e0a4>
 4243324: f9000109     	str	x9, [x8]
 4243328: aa1303e0     	mov	x0, x19
 424332c: 52800061     	mov	w1, #0x3                ; =3
 4243330: 9716798d     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4243334: 91177261     	add	x1, x19, #0x5dc
 4243338: aa1403e0     	mov	x0, x20
 424333c: 97339325     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4243340: 52800400     	mov	w0, #0x20               ; =32
 4243344: 96f73009     	bl	0xf368 <_ChromeMain+0xa0cc>
 4243348: aa0003e1     	mov	x1, x0
 424334c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4243350: b9000808     	str	w8, [x0, #0x8]
 4243354: 52800035     	mov	w21, #0x1               ; =1
 4243358: 39003015     	strb	w21, [x0, #0xc]
 424335c: b0050848     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4243360: 91044108     	add	x8, x8, #0x110
 4243364: f9000008     	str	x8, [x0]
 4243368: d28000c8     	mov	x8, #0x6                ; =6
 424336c: f2c00108     	movk	x8, #0x8, lsl #32
 4243370: 4e080d00     	dup.2d	v0, x8
 4243374: 3d800400     	str	q0, [x0, #0x10]
 4243378: f9400268     	ldr	x8, [x19]
 424337c: f9408908     	ldr	x8, [x8, #0x110]
 4243380: aa1303e0     	mov	x0, x19
 4243384: d63f0100     	blr	x8
 4243388: 52802800     	mov	w0, #0x140              ; =320
 424338c: 96f72ff7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4243390: aa0003f4     	mov	x20, x0
 4243394: 979f348f     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4243398: aa1303e0     	mov	x0, x19
 424339c: aa1403e1     	mov	x1, x20
 42433a0: 97651926     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 42433a4: b940f288     	ldr	w8, [x20, #0xf0]
 42433a8: 35000a08     	cbnz	w8, 0x42434e8 <_ChromeMain+0x423e24c>
 42433ac: b90063f5     	str	w21, [sp, #0x60]
 42433b0: d0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 42433b4: 9115a021     	add	x1, x1, #0x568
 42433b8: 91046280     	add	x0, x20, #0x118
 42433bc: 910183e2     	add	x2, sp, #0x60
 42433c0: 97608779     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 42433c4: 39444688     	ldrb	w8, [x20, #0x111]
 42433c8: 370000c8     	tbnz	w8, #0x0, 0x42433e0 <_ChromeMain+0x423e144>
 42433cc: 52800028     	mov	w8, #0x1                ; =1
 42433d0: 39044688     	strb	w8, [x20, #0x111]
 42433d4: aa1403e0     	mov	x0, x20
 42433d8: 52800021     	mov	w1, #0x1                ; =1
 42433dc: 976087b5     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 42433e0: f9426260     	ldr	x0, [x19, #0x4c0]
 42433e4: f9400008     	ldr	x8, [x0]
 42433e8: f9400d08     	ldr	x8, [x8, #0x18]
 42433ec: d63f0100     	blr	x8
 42433f0: b004e7e8     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 42433f4: 3dc02500     	ldr	q0, [x8, #0x90]
 42433f8: 3d801be0     	str	q0, [sp, #0x60]
 42433fc: d0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4243400: 91122021     	add	x1, x1, #0x488
 4243404: 91036000     	add	x0, x0, #0xd8
 4243408: 910183e2     	add	x2, sp, #0x60
 424340c: 9762aa95     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4243410: f9426674     	ldr	x20, [x19, #0x4c8]
 4243414: 52800800     	mov	w0, #0x40               ; =64
 4243418: 96f72fd4     	bl	0xf368 <_ChromeMain+0xa0cc>
 424341c: 52800028     	mov	w8, #0x1                ; =1
 4243420: b9000008     	str	w8, [x0]
 4243424: 90fe6f29     	adrp	x9, 0x1027000 <_ChromeMain+0x1021d64>
 4243428: 91260129     	add	x9, x9, #0x980
 424342c: f0fe056a     	adrp	x10, 0x2f2000 <_ChromeMain+0x2ecd64>
 4243430: 9122014a     	add	x10, x10, #0x880
 4243434: a900a809     	stp	x9, x10, [x0, #0x8]
 4243438: d0ff18c9     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 424343c: 912c0129     	add	x9, x9, #0xb00
 4243440: f0ffc70a     	adrp	x10, 0x3b26000 <_ChromeMain+0x3b20d64>
 4243444: 9131014a     	add	x10, x10, #0xc40
 4243448: a901a809     	stp	x9, x10, [x0, #0x18]
 424344c: 9004e7e9     	adrp	x9, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4243450: 3dc3d920     	ldr	q0, [x9, #0xf60]
 4243454: 3c828000     	stur	q0, [x0, #0x28]
 4243458: 3900e01f     	strb	wzr, [x0, #0x38]
 424345c: f9000be0     	str	x0, [sp, #0x10]
 4243460: 0f000420     	movi.2s	v0, #0x1
 4243464: fd000fe0     	str	d0, [sp, #0x18]
 4243468: 52800069     	mov	w9, #0x3                ; =3
 424346c: b90023e9     	str	w9, [sp, #0x20]
 4243470: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4243474: f90017ff     	str	xzr, [sp, #0x28]
 4243478: f9003bff     	str	xzr, [sp, #0x70]
 424347c: f90033e0     	str	x0, [sp, #0x60]
 4243480: b5000580     	cbnz	x0, 0x4243530 <_ChromeMain+0x423e294>
 4243484: 910043e9     	add	x9, sp, #0x10
 4243488: f840812a     	ldur	x10, [x9, #0x8]
 424348c: f90037ea     	str	x10, [sp, #0x68]
 4243490: b8410129     	ldur	w9, [x9, #0x10]
 4243494: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4243498: f9003fff     	str	xzr, [sp, #0x78]
 424349c: 290da7e8     	stp	w8, w9, [sp, #0x6c]
 42434a0: d0053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 42434a4: 91152021     	add	x1, x1, #0x548
 42434a8: 91036280     	add	x0, x20, #0xd8
 42434ac: 910183e2     	add	x2, sp, #0x60
 42434b0: 976743b7     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 42434b4: 910183e0     	add	x0, sp, #0x60
 42434b8: 97541e1b     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 42434bc: 910043e0     	add	x0, sp, #0x10
 42434c0: 97541e19     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 42434c4: d101c3a0     	sub	x0, x29, #0x70
 42434c8: 97180cde     	bl	0x846840 <_ChromeMain+0x8415a4>
 42434cc: aa1303e0     	mov	x0, x19
 42434d0: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 42434d4: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 42434d8: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 42434dc: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 42434e0: 910483ff     	add	sp, sp, #0x120
 42434e4: d65f03c0     	ret
 42434e8: b900f29f     	str	wzr, [x20, #0xf0]
 42434ec: aa1403e0     	mov	x0, x20
 42434f0: 52800021     	mov	w1, #0x1                ; =1
 42434f4: 9760876f     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 42434f8: 17ffffad     	b	0x42433ac <_ChromeMain+0x423e110>
 42434fc: aa1603e0     	mov	x0, x22
 4243500: 973c24b1     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4243504: 52800a01     	mov	w1, #0x50               ; =80
 4243508: 96f7166c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424350c: 17ffff72     	b	0x42432d4 <_ChromeMain+0x423e038>
 4243510: b905f67f     	str	wzr, [x19, #0x5f4]
 4243514: aa1303e0     	mov	x0, x19
 4243518: 52800021     	mov	w1, #0x1                ; =1
 424351c: 97167912     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4243520: 9117d261     	add	x1, x19, #0x5f4
 4243524: aa1403e0     	mov	x0, x20
 4243528: 973392aa     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 424352c: 17ffff79     	b	0x4243310 <_ChromeMain+0x423e074>
 4243530: b8280009     	ldadd	w8, w9, [x0]
 4243534: 7100013f     	cmp	w9, #0x0
 4243538: 540006cd     	b.le	0x4243610 <_ChromeMain+0x423e374>
 424353c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4243540: 6b0a013f     	cmp	w9, w10
 4243544: 540006c0     	b.eq	0x424361c <_ChromeMain+0x423e380>
 4243548: 17ffffcf     	b	0x4243484 <_ChromeMain+0x423e1e8>
 424354c: 973c249e     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4243550: 52800a01     	mov	w1, #0x50               ; =80
 4243554: 96f71659     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4243558: b5ffeb56     	cbnz	x22, 0x42432c0 <_ChromeMain+0x423e024>
 424355c: 17ffff5e     	b	0x42432d4 <_ChromeMain+0x423e038>
 4243560: aa1603e0     	mov	x0, x22
 4243564: 977f8af7     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4243568: b94042c2     	ldr	w2, [x22, #0x40]
 424356c: 17ffff3e     	b	0x4243264 <_ChromeMain+0x423dfc8>
 4243570: aa1603e0     	mov	x0, x22
 4243574: 977f8af3     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 4243578: b94042c2     	ldr	w2, [x22, #0x40]
 424357c: f94026f6     	ldr	x22, [x23, #0x48]
 4243580: 17ffff2a     	b	0x4243228 <_ChromeMain+0x423df8c>
 4243584: d4200000     	brk	#0
 4243588: d4400000     	hlt	#0
 424358c: d4200020     	brk	#0x1
 4243590: d4200000     	brk	#0
 4243594: d4400000     	hlt	#0
 4243598: d4200020     	brk	#0x1
 424359c: d4200000     	brk	#0
 42435a0: d4400000     	hlt	#0
 42435a4: d4200020     	brk	#0x1
 42435a8: d4200000     	brk	#0
 42435ac: d4400000     	hlt	#0
 42435b0: d4200020     	brk	#0x1
 42435b4: d4200000     	brk	#0
 42435b8: d4400000     	hlt	#0
 42435bc: d4200020     	brk	#0x1
 42435c0: d4200000     	brk	#0
 42435c4: d4400000     	hlt	#0
 42435c8: d4200020     	brk	#0x1
 42435cc: d2800008     	mov	x8, #0x0                ; =0
 42435d0: 17fffea8     	b	0x4243070 <_ChromeMain+0x423ddd4>
 42435d4: aa1603e0     	mov	x0, x22
 42435d8: b9000fe2     	str	w2, [sp, #0xc]
 42435dc: 977f8ad9     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 42435e0: b9400fe2     	ldr	w2, [sp, #0xc]
 42435e4: b9404ac3     	ldr	w3, [x22, #0x48]
 42435e8: f94026f6     	ldr	x22, [x23, #0x48]
 42435ec: 17ffff12     	b	0x4243234 <_ChromeMain+0x423df98>
 42435f0: 3917be7f     	strb	wzr, [x19, #0x5ef]
 42435f4: aa1303e0     	mov	x0, x19
 42435f8: 52800021     	mov	w1, #0x1                ; =1
 42435fc: 971678da     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4243600: 9117be61     	add	x1, x19, #0x5ef
 4243604: aa1403e0     	mov	x0, x20
 4243608: 97339272     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 424360c: 17ffff3f     	b	0x4243308 <_ChromeMain+0x423e06c>
 4243610: d4200000     	brk	#0
 4243614: d4400000     	hlt	#0
 4243618: d4200020     	brk	#0x1
 424361c: d4200000     	brk	#0
 4243620: d4400000     	hlt	#0
 4243624: d4200020     	brk	#0x1
