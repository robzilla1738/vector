
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 174fa80: d10543ff     	sub	sp, sp, #0x150
 174fa84: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 174fa88: a91067fa     	stp	x26, x25, [sp, #0x100]
 174fa8c: a9115ff8     	stp	x24, x23, [sp, #0x110]
 174fa90: a91257f6     	stp	x22, x21, [sp, #0x120]
 174fa94: a9134ff4     	stp	x20, x19, [sp, #0x130]
 174fa98: a9147bfd     	stp	x29, x30, [sp, #0x140]
 174fa9c: 910503fd     	add	x29, sp, #0x140
 174faa0: aa0103f5     	mov	x21, x1
 174faa4: aa0003f3     	mov	x19, x0
 174faa8: b00646c8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 174faac: f940f908     	ldr	x8, [x8, #0x1f0]
 174fab0: f9400108     	ldr	x8, [x8]
 174fab4: f81a83a8     	stur	x8, [x29, #-0x58]
 174fab8: 52801288     	mov	w8, #0x94               ; =148
 174fabc: f81903a8     	stur	x8, [x29, #-0x70]
 174fac0: d006bdd9     	adrp	x25, 0xef09000 <dyld_stub_binder+0xef09000>
 174fac4: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fac8: 350054c0     	cbnz	w0, 0x1750560 <_ChromeMain+0x174b2c4>
 174facc: d006a31a     	adrp	x26, 0xebb1000 <dyld_stub_binder+0xebb1000>
 174fad0: f9468f48     	ldr	x8, [x26, #0xd18]
 174fad4: d63f0100     	blr	x8
 174fad8: aa0003f4     	mov	x20, x0
 174fadc: f9400268     	ldr	x8, [x19]
 174fae0: b5005068     	cbnz	x8, 0x17504ec <_ChromeMain+0x174b250>
 174fae4: f9004bff     	str	xzr, [sp, #0x90]
 174fae8: 6f00e400     	movi.2d	v0, #0000000000000000
 174faec: ad0383e0     	stp	q0, q0, [sp, #0x70]
 174faf0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 174faf4: 90062420     	adrp	x0, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174faf8: 910e2c00     	add	x0, x0, #0x38b
 174fafc: f0062401     	adrp	x1, 0xdbd2000 <dyld_stub_binder+0xdbd2000>
 174fb00: 913f4421     	add	x1, x1, #0xfd1
 174fb04: d10243a8     	sub	x8, x29, #0x90
 174fb08: 52810aa2     	mov	w2, #0x855              ; =2133
 174fb0c: 97a4045d     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 174fb10: 3941b668     	ldrb	w8, [x19, #0x6d]
 174fb14: 370001c8     	tbnz	w8, #0x0, 0x174fb4c <_ChromeMain+0x174a8b0>
 174fb18: 394243e8     	ldrb	w8, [sp, #0x90]
 174fb1c: 370048e8     	tbnz	w8, #0x0, 0x1750438 <_ChromeMain+0x174b19c>
 174fb20: 910143e0     	add	x0, sp, #0x50
 174fb24: 52800001     	mov	w1, #0x0                ; =0
 174fb28: 52800002     	mov	w2, #0x0                ; =0
 174fb2c: 97e591fe     	bl	0x10b4324 <_ChromeMain+0x10af088>
 174fb30: 52800148     	mov	w8, #0xa                ; =10
 174fb34: f9000be8     	str	x8, [sp, #0x10]
 174fb38: d006bdc8     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 174fb3c: 3955c900     	ldrb	w0, [x8, #0x572]
 174fb40: 35004180     	cbnz	w0, 0x1750370 <_ChromeMain+0x174b0d4>
 174fb44: 52800028     	mov	w8, #0x1                ; =1
 174fb48: 390243e8     	strb	w8, [sp, #0x90]
 174fb4c: 52800020     	mov	w0, #0x1                ; =1
 174fb50: 940007b7     	bl	0x1751a2c <_ChromeMain+0x174c790>
 174fb54: 3901ba7f     	strb	wzr, [x19, #0x6e]
 174fb58: 3940a668     	ldrb	w8, [x19, #0x29]
 174fb5c: 52800029     	mov	w9, #0x1                ; =1
 174fb60: 72a04089     	movk	w9, #0x204, lsl #16
 174fb64: 1100152a     	add	w10, w9, #0x5
 174fb68: 7100011f     	cmp	w8, #0x0
 174fb6c: 1a8a1136     	csel	w22, w9, w10, ne
 174fb70: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 174fb74: f90023ff     	str	xzr, [sp, #0x40]
 174fb78: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 174fb7c: 37f83528     	tbnz	w8, #0x1f, 0x1750220 <_ChromeMain+0x174af84>
 174fb80: 3dc002a0     	ldr	q0, [x21]
 174fb84: 3d800fe0     	str	q0, [sp, #0x30]
 174fb88: f9400aa8     	ldr	x8, [x21, #0x10]
 174fb8c: f90023e8     	str	x8, [sp, #0x40]
 174fb90: 39402668     	ldrb	w8, [x19, #0x9]
 174fb94: 35004348     	cbnz	w8, 0x17503fc <_ChromeMain+0x174b160>
 174fb98: 52801288     	mov	w8, #0x94               ; =148
 174fb9c: f9000be8     	str	x8, [sp, #0x10]
 174fba0: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fba4: 35004f80     	cbnz	w0, 0x1750594 <_ChromeMain+0x174b2f8>
 174fba8: f9468f48     	ldr	x8, [x26, #0xd18]
 174fbac: d63f0100     	blr	x8
 174fbb0: aa0003f5     	mov	x21, x0
 174fbb4: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 174fbb8: f9401be9     	ldr	x9, [sp, #0x30]
 174fbbc: 7100011f     	cmp	w8, #0x0
 174fbc0: 9100c3e8     	add	x8, sp, #0x30
 174fbc4: 9a884120     	csel	x0, x9, x8, mi
 174fbc8: f9401263     	ldr	x3, [x19, #0x20]
 174fbcc: 9100a3e1     	add	x1, sp, #0x28
 174fbd0: aa1603e2     	mov	x2, x22
 174fbd4: 97f2ce1b     	bl	0x1403440 <_ChromeMain+0x13fe1a4>
 174fbd8: aa0003f7     	mov	x23, x0
 174fbdc: f94017f6     	ldr	x22, [sp, #0x28]
 174fbe0: 350001a0     	cbnz	w0, 0x174fc14 <_ChromeMain+0x174a978>
 174fbe4: b4000196     	cbz	x22, 0x174fc14 <_ChromeMain+0x174a978>
 174fbe8: b005d681     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 174fbec: 910f8421     	add	x1, x1, #0x3e1
 174fbf0: aa1603e0     	mov	x0, x22
 174fbf4: 9400040e     	bl	0x1750c2c <_ChromeMain+0x174b990>
 174fbf8: 7100041f     	cmp	w0, #0x1
 174fbfc: 1a9f07e8     	cset	w8, ne
 174fc00: 3940a669     	ldrb	w9, [x19, #0x29]
 174fc04: 2a080128     	orr	w8, w9, w8
 174fc08: 7200011f     	tst	w8, #0x1
 174fc0c: 52800108     	mov	w8, #0x8                ; =8
 174fc10: 1a8813f7     	csel	w23, wzr, w8, ne
 174fc14: f9468f48     	ldr	x8, [x26, #0xd18]
 174fc18: d63f0100     	blr	x8
 174fc1c: eb150008     	subs	x8, x0, x21
 174fc20: 937ffd09     	asr	x9, x8, #63
 174fc24: d2410129     	eor	x9, x9, #0x8000000000000000
 174fc28: 9006242a     	adrp	x10, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174fc2c: 910e614a     	add	x10, x10, #0x398
 174fc30: 9a886138     	csel	x24, x9, x8, vs
 174fc34: 52800488     	mov	w8, #0x24               ; =36
 174fc38: a93723aa     	stp	x10, x8, [x29, #-0x90]
 174fc3c: 91024275     	add	x21, x19, #0x90
 174fc40: 39829e68     	ldrsb	x8, [x19, #0xa7]
 174fc44: b7f83aa8     	tbnz	x8, #0x3f, 0x1750398 <_ChromeMain+0x174b0fc>
 174fc48: 91024269     	add	x9, x19, #0x90
 174fc4c: a93823a9     	stp	x9, x8, [x29, #-0x80]
 174fc50: d101c3a8     	sub	x8, x29, #0x70
 174fc54: d10243a0     	sub	x0, x29, #0x90
 174fc58: 52800041     	mov	w1, #0x2                ; =2
 174fc5c: 97bc6bbe     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 174fc60: d101c3a0     	sub	x0, x29, #0x70
 174fc64: d2800001     	mov	x1, #0x0                ; =0
 174fc68: 5290e002     	mov	w2, #0x8700             ; =34560
 174fc6c: 72a07262     	movk	w2, #0x393, lsl #16
 174fc70: 52800c83     	mov	w3, #0x64               ; =100
 174fc74: 52800024     	mov	w4, #0x1                ; =1
 174fc78: 97b62e62     	bl	0x4db600 <_ChromeMain+0x4d6364>
 174fc7c: aa1803e1     	mov	x1, x24
 174fc80: 97b629a0     	bl	0x4da300 <_ChromeMain+0x4d5064>
 174fc84: 38da73a8     	ldursb	w8, [x29, #-0x59]
 174fc88: 36f800a8     	tbz	w8, #0x1f, 0x174fc9c <_ChromeMain+0x174aa00>
 174fc8c: f85903a0     	ldur	x0, [x29, #-0x70]
 174fc90: f85a03a8     	ldur	x8, [x29, #-0x60]
 174fc94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 174fc98: 97a2e488     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 174fc9c: 52801288     	mov	w8, #0x94               ; =148
 174fca0: f81903a8     	stur	x8, [x29, #-0x70]
 174fca4: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fca8: 35003fe0     	cbnz	w0, 0x17504a4 <_ChromeMain+0x174b208>
 174fcac: 35003d97     	cbnz	w23, 0x175045c <_ChromeMain+0x174b1c0>
 174fcb0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 174fcb4: f006a317     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 174fcb8: f94046e9     	ldr	x9, [x23, #0x88]
 174fcbc: eb09011f     	cmp	x8, x9
 174fcc0: 54000061     	b.ne	0x174fccc <_ChromeMain+0x174aa30>
 174fcc4: aa1603e0     	mov	x0, x22
 174fcc8: 97a3118d     	bl	0x142fc <_ChromeMain+0xf060>
 174fccc: f9400260     	ldr	x0, [x19]
 174fcd0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 174fcd4: f94046e9     	ldr	x9, [x23, #0x88]
 174fcd8: eb09011f     	cmp	x8, x9
 174fcdc: 54003880     	b.eq	0x17503ec <_ChromeMain+0x174b150>
 174fce0: f9000276     	str	x22, [x19]
 174fce4: a9007fff     	stp	xzr, xzr, [sp]
 174fce8: aa1603e0     	mov	x0, x22
 174fcec: 52807d41     	mov	w1, #0x3ea              ; =1002
 174fcf0: 940002f4     	bl	0x17508c0 <_ChromeMain+0x174b624>
 174fcf4: f9400260     	ldr	x0, [x19]
 174fcf8: 3940aa68     	ldrb	w8, [x19, #0x2a]
 174fcfc: a9007fe8     	stp	x8, xzr, [sp]
 174fd00: 52807d61     	mov	w1, #0x3eb              ; =1003
 174fd04: 940002ef     	bl	0x17508c0 <_ChromeMain+0x174b624>
 174fd08: f9400260     	ldr	x0, [x19]
 174fd0c: 39406668     	ldrb	w8, [x19, #0x19]
 174fd10: a9007fe8     	stp	x8, xzr, [sp]
 174fd14: 52807ee1     	mov	w1, #0x3f7              ; =1015
 174fd18: 940002ea     	bl	0x17508c0 <_ChromeMain+0x174b624>
 174fd1c: 39402268     	ldrb	w8, [x19, #0x8]
 174fd20: 37000228     	tbnz	w8, #0x0, 0x174fd64 <_ChromeMain+0x174aac8>
 174fd24: 52801288     	mov	w8, #0x94               ; =148
 174fd28: f81903a8     	stur	x8, [x29, #-0x70]
 174fd2c: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fd30: 35004080     	cbnz	w0, 0x1750540 <_ChromeMain+0x174b2a4>
 174fd34: 90062421     	adrp	x1, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174fd38: 910ef421     	add	x1, x1, #0x3bd
 174fd3c: aa1303e0     	mov	x0, x19
 174fd40: 52800342     	mov	w2, #0x1a               ; =26
 174fd44: d2800003     	mov	x3, #0x0                ; =0
 174fd48: 940003f6     	bl	0x1750d20 <_ChromeMain+0x174ba84>
 174fd4c: aa0003f6     	mov	x22, x0
 174fd50: 52801288     	mov	w8, #0x94               ; =148
 174fd54: f81903a8     	stur	x8, [x29, #-0x70]
 174fd58: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fd5c: 35003d60     	cbnz	w0, 0x1750508 <_ChromeMain+0x174b26c>
 174fd60: 360033b6     	tbz	w22, #0x0, 0x17503d4 <_ChromeMain+0x174b138>
 174fd64: 3940a668     	ldrb	w8, [x19, #0x29]
 174fd68: 36001708     	tbz	w8, #0x0, 0x1750048 <_ChromeMain+0x174adac>
 174fd6c: b9401268     	ldr	w8, [x19, #0x10]
 174fd70: 7140051f     	cmp	w8, #0x1, lsl #12       ; =0x1000
 174fd74: 54003501     	b.ne	0x1750414 <_ChromeMain+0x174b178>
 174fd78: f9400268     	ldr	x8, [x19]
 174fd7c: b4003468     	cbz	x8, 0x1750408 <_ChromeMain+0x174b16c>
 174fd80: 3940a669     	ldrb	w9, [x19, #0x29]
 174fd84: 39403268     	ldrb	w8, [x19, #0xc]
 174fd88: 340029c9     	cbz	w9, 0x17502c0 <_ChromeMain+0x174b024>
 174fd8c: 350034a8     	cbnz	w8, 0x1750420 <_ChromeMain+0x174b184>
 174fd90: b9401668     	ldr	w8, [x19, #0x14]
 174fd94: 350034c8     	cbnz	w8, 0x175042c <_ChromeMain+0x174b190>
 174fd98: 3941be68     	ldrb	w8, [x19, #0x6f]
 174fd9c: 36001448     	tbz	w8, #0x0, 0x1750024 <_ChromeMain+0x174ad88>
 174fda0: d2800000     	mov	x0, #0x0                ; =0
 174fda4: 90062428     	adrp	x8, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174fda8: 91117908     	add	x8, x8, #0x45e
 174fdac: 52800229     	mov	w9, #0x11               ; =17
 174fdb0: a93727a8     	stp	x8, x9, [x29, #-0x90]
 174fdb4: 910043f6     	add	x22, sp, #0x10
 174fdb8: 910043e8     	add	x8, sp, #0x10
 174fdbc: 97ec9271     	bl	0x1274780 <_ChromeMain+0x126f4e4>
 174fdc0: 39809fe8     	ldrsb	x8, [sp, #0x27]
 174fdc4: a9412be9     	ldp	x9, x10, [sp, #0x10]
 174fdc8: f100011f     	cmp	x8, #0x0
 174fdcc: 9a964129     	csel	x9, x9, x22, mi
 174fdd0: 7100011f     	cmp	w8, #0x0
 174fdd4: 9a884148     	csel	x8, x10, x8, mi
 174fdd8: a93823a9     	stp	x9, x8, [x29, #-0x80]
 174fddc: d101c3b6     	sub	x22, x29, #0x70
 174fde0: d101c3a8     	sub	x8, x29, #0x70
 174fde4: d10243a0     	sub	x0, x29, #0x90
 174fde8: 52800041     	mov	w1, #0x2                ; =2
 174fdec: 97bc6b5a     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 174fdf0: 389a73a8     	ldursb	x8, [x29, #-0x59]
 174fdf4: a9792ba9     	ldp	x9, x10, [x29, #-0x70]
 174fdf8: f100011f     	cmp	x8, #0x0
 174fdfc: 9a964136     	csel	x22, x9, x22, mi
 174fe00: 7100011f     	cmp	w8, #0x0
 174fe04: 9a884157     	csel	x23, x10, x8, mi
 174fe08: 52801288     	mov	w8, #0x94               ; =148
 174fe0c: f90053e8     	str	x8, [sp, #0xa0]
 174fe10: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fe14: 35003860     	cbnz	w0, 0x1750520 <_ChromeMain+0x174b284>
 174fe18: aa1303e0     	mov	x0, x19
 174fe1c: aa1603e1     	mov	x1, x22
 174fe20: aa1703e2     	mov	x2, x23
 174fe24: d2800003     	mov	x3, #0x0                ; =0
 174fe28: 940003be     	bl	0x1750d20 <_ChromeMain+0x174ba84>
 174fe2c: 52801288     	mov	w8, #0x94               ; =148
 174fe30: f90053e8     	str	x8, [sp, #0xa0]
 174fe34: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174fe38: 35003420     	cbnz	w0, 0x17504bc <_ChromeMain+0x174b220>
 174fe3c: 38da73a8     	ldursb	w8, [x29, #-0x59]
 174fe40: 37f80ce8     	tbnz	w8, #0x1f, 0x174ffdc <_ChromeMain+0x174ad40>
 174fe44: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 174fe48: 37f83008     	tbnz	w8, #0x1f, 0x1750448 <_ChromeMain+0x174b1ac>
 174fe4c: 3901c27f     	strb	wzr, [x19, #0x70]
 174fe50: a937ffbf     	stp	xzr, xzr, [x29, #-0x88]
 174fe54: f81883bf     	stur	xzr, [x29, #-0x78]
 174fe58: 90062421     	adrp	x1, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174fe5c: 9111c021     	add	x1, x1, #0x470
 174fe60: aa1303e0     	mov	x0, x19
 174fe64: 52800202     	mov	w2, #0x10               ; =16
 174fe68: 52800003     	mov	w3, #0x0                ; =0
 174fe6c: 97ceb825     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 174fe70: f81703a0     	stur	x0, [x29, #-0x90]
 174fe74: 381783bf     	sturb	wzr, [x29, #-0x88]
 174fe78: 3817c3bf     	sturb	wzr, [x29, #-0x84]
 174fe7c: 381803bf     	sturb	wzr, [x29, #-0x80]
 174fe80: 381883bf     	sturb	wzr, [x29, #-0x78]
 174fe84: d10243a0     	sub	x0, x29, #0x90
 174fe88: 97c5020e     	bl	0x8906c0 <_ChromeMain+0x88b424>
 174fe8c: 7101901f     	cmp	w0, #0x64
 174fe90: 54000ba0     	b.eq	0x1750004 <_ChromeMain+0x174ad68>
 174fe94: d10243a0     	sub	x0, x29, #0x90
 174fe98: 97ceb32b     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 174fe9c: 52800d00     	mov	w0, #0x68               ; =104
 174fea0: 97a2fd32     	bl	0xf368 <_ChromeMain+0xa0cc>
 174fea4: aa0003f6     	mov	x22, x0
 174fea8: f9400261     	ldr	x1, [x19]
 174feac: 91024262     	add	x2, x19, #0x90
 174feb0: 94000325     	bl	0x1750b44 <_ChromeMain+0x174b8a8>
 174feb4: f9407a60     	ldr	x0, [x19, #0xf0]
 174feb8: f9007a76     	str	x22, [x19, #0xf0]
 174febc: b50029c0     	cbnz	x0, 0x17503f4 <_ChromeMain+0x174b158>
 174fec0: 94000221     	bl	0x1750744 <_ChromeMain+0x174b4a8>
 174fec4: f9407a61     	ldr	x1, [x19, #0xf0]
 174fec8: 52800028     	mov	w8, #0x1                ; =1
 174fecc: 381703a8     	sturb	w8, [x29, #-0x90]
 174fed0: 90062422     	adrp	x2, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174fed4: 91120442     	add	x2, x2, #0x481
 174fed8: d10243a5     	sub	x5, x29, #0x90
 174fedc: 528001a3     	mov	w3, #0xd                ; =13
 174fee0: d2800004     	mov	x4, #0x0                ; =0
 174fee4: 97fe6a6a     	bl	0x16ea88c <_ChromeMain+0x16e55f0>
 174fee8: f9468f48     	ldr	x8, [x26, #0xd18]
 174feec: d63f0100     	blr	x8
 174fef0: eb140008     	subs	x8, x0, x20
 174fef4: 937ffd09     	asr	x9, x8, #63
 174fef8: d2410129     	eor	x9, x9, #0x8000000000000000
 174fefc: 9a886134     	csel	x20, x9, x8, vs
 174ff00: 90062428     	adrp	x8, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 174ff04: 91123d08     	add	x8, x8, #0x48f
 174ff08: 528004c9     	mov	w9, #0x26               ; =38
 174ff0c: a93727a8     	stp	x8, x9, [x29, #-0x90]
 174ff10: 39829e68     	ldrsb	x8, [x19, #0xa7]
 174ff14: b7f80968     	tbnz	x8, #0x3f, 0x1750040 <_ChromeMain+0x174ada4>
 174ff18: a93823b5     	stp	x21, x8, [x29, #-0x80]
 174ff1c: d101c3a8     	sub	x8, x29, #0x70
 174ff20: d10243a0     	sub	x0, x29, #0x90
 174ff24: 52800041     	mov	w1, #0x2                ; =2
 174ff28: 97bc6b0b     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 174ff2c: d101c3a0     	sub	x0, x29, #0x70
 174ff30: d2800001     	mov	x1, #0x0                ; =0
 174ff34: 5290e002     	mov	w2, #0x8700             ; =34560
 174ff38: 72a07262     	movk	w2, #0x393, lsl #16
 174ff3c: 52800c83     	mov	w3, #0x64               ; =100
 174ff40: 52800024     	mov	w4, #0x1                ; =1
 174ff44: 97b62daf     	bl	0x4db600 <_ChromeMain+0x4d6364>
 174ff48: aa1403e1     	mov	x1, x20
 174ff4c: 97b628ed     	bl	0x4da300 <_ChromeMain+0x4d5064>
 174ff50: 38da73a8     	ldursb	w8, [x29, #-0x59]
 174ff54: 36f800a8     	tbz	w8, #0x1f, 0x174ff68 <_ChromeMain+0x174accc>
 174ff58: f85903a0     	ldur	x0, [x29, #-0x70]
 174ff5c: f85a03a8     	ldur	x8, [x29, #-0x60]
 174ff60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 174ff64: 97a2e3d5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 174ff68: f9400268     	ldr	x8, [x19]
 174ff6c: b40023a8     	cbz	x8, 0x17503e0 <_ChromeMain+0x174b144>
 174ff70: 3941ba68     	ldrb	w8, [x19, #0x6e]
 174ff74: 52000113     	eor	w19, w8, #0x1
 174ff78: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 174ff7c: 37f803a8     	tbnz	w8, #0x1f, 0x174fff0 <_ChromeMain+0x174ad54>
 174ff80: 394243e8     	ldrb	w8, [sp, #0x90]
 174ff84: 36000068     	tbz	w8, #0x0, 0x174ff90 <_ChromeMain+0x174acf4>
 174ff88: 910143e0     	add	x0, sp, #0x50
 174ff8c: 97cc7afe     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 174ff90: 52801288     	mov	w8, #0x94               ; =148
 174ff94: f81703a8     	stur	x8, [x29, #-0x90]
 174ff98: 3957f320     	ldrb	w0, [x25, #0x5fc]
 174ff9c: 350029c0     	cbnz	w0, 0x17504d4 <_ChromeMain+0x174b238>
 174ffa0: f85a83a8     	ldur	x8, [x29, #-0x58]
 174ffa4: b00646c9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 174ffa8: f940f929     	ldr	x9, [x9, #0x1f0]
 174ffac: f9400129     	ldr	x9, [x9]
 174ffb0: eb08013f     	cmp	x9, x8
 174ffb4: 540021a1     	b.ne	0x17503e8 <_ChromeMain+0x174b14c>
 174ffb8: 12000260     	and	w0, w19, #0x1
 174ffbc: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 174ffc0: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 174ffc4: a95257f6     	ldp	x22, x21, [sp, #0x120]
 174ffc8: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 174ffcc: a95067fa     	ldp	x26, x25, [sp, #0x100]
 174ffd0: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 174ffd4: 910543ff     	add	sp, sp, #0x150
 174ffd8: d65f03c0     	ret
 174ffdc: f85903a0     	ldur	x0, [x29, #-0x70]
 174ffe0: f85a03a8     	ldur	x8, [x29, #-0x60]
 174ffe4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 174ffe8: 97a2e3b4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 174ffec: 17ffff96     	b	0x174fe44 <_ChromeMain+0x174aba8>
 174fff0: f9401be0     	ldr	x0, [sp, #0x30]
 174fff4: f94023e8     	ldr	x8, [sp, #0x40]
 174fff8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 174fffc: 97a2e3af     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 1750000: 17ffffe0     	b	0x174ff80 <_ChromeMain+0x174ace4>
 1750004: d10243a0     	sub	x0, x29, #0x90
 1750008: 52800001     	mov	w1, #0x0                ; =0
 175000c: 97be1728     	bl	0x6d5cac <_ChromeMain+0x6d0a10>
 1750010: f100041f     	cmp	x0, #0x1
 1750014: 54fff40b     	b.lt	0x174fe94 <_ChromeMain+0x174abf8>
 1750018: 52800028     	mov	w8, #0x1                ; =1
 175001c: 3901c268     	strb	w8, [x19, #0x70]
 1750020: 17ffff9d     	b	0x174fe94 <_ChromeMain+0x174abf8>
 1750024: f9400268     	ldr	x8, [x19]
 1750028: b4ffebc8     	cbz	x8, 0x174fda0 <_ChromeMain+0x174ab04>
 175002c: 3941ba68     	ldrb	w8, [x19, #0x6e]
 1750030: 7100011f     	cmp	w8, #0x0
 1750034: 52a20008     	mov	w8, #0x10000000         ; =268435456
 1750038: 9a8813e0     	csel	x0, xzr, x8, ne
 175003c: 17ffff5a     	b	0x174fda4 <_ChromeMain+0x174ab08>
 1750040: a9492275     	ldp	x21, x8, [x19, #0x90]
 1750044: 17ffffb5     	b	0x174ff18 <_ChromeMain+0x174ac7c>
 1750048: f9400260     	ldr	x0, [x19]
 175004c: f90003ff     	str	xzr, [sp]
 1750050: 9005d681     	adrp	x1, 0xd220000 <dyld_stub_binder+0xd220000>
 1750054: 910f8421     	add	x1, x1, #0x3e1
 1750058: 9005d682     	adrp	x2, 0xd220000 <dyld_stub_binder+0xd220000>
 175005c: 91135842     	add	x2, x2, #0x4d6
 1750060: d2800003     	mov	x3, #0x0                ; =0
 1750064: d2800004     	mov	x4, #0x0                ; =0
 1750068: d2800005     	mov	x5, #0x0                ; =0
 175006c: d2800006     	mov	x6, #0x0                ; =0
 1750070: d2800007     	mov	x7, #0x0                ; =0
 1750074: 94000823     	bl	0x1752100 <_ChromeMain+0x174ce64>
 1750078: 35001940     	cbnz	w0, 0x17503a0 <_ChromeMain+0x174b104>
 175007c: 3940a668     	ldrb	w8, [x19, #0x29]
 1750080: 35ffe768     	cbnz	w8, 0x174fd6c <_ChromeMain+0x174aad0>
 1750084: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 1750088: f81803bf     	stur	xzr, [x29, #-0x80]
 175008c: b9401268     	ldr	w8, [x19, #0x10]
 1750090: b00046e9     	adrp	x9, 0x202d000 <_ChromeMain+0x2027d64>
 1750094: 91080129     	add	x9, x9, #0x200
 1750098: a93927a8     	stp	x8, x9, [x29, #-0x70]
 175009c: f0062400     	adrp	x0, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 17500a0: 910f6000     	add	x0, x0, #0x3d8
 17500a4: d10243b6     	sub	x22, x29, #0x90
 17500a8: d10243a8     	sub	x8, x29, #0x90
 17500ac: d101c3a2     	sub	x2, x29, #0x70
 17500b0: 52800261     	mov	w1, #0x13               ; =19
 17500b4: 52800023     	mov	w3, #0x1                ; =1
 17500b8: 97ad3152     	bl	0x29c600 <_ChromeMain+0x297364>
 17500bc: 389873a8     	ldursb	x8, [x29, #-0x79]
 17500c0: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 17500c4: f100011f     	cmp	x8, #0x0
 17500c8: 9a964121     	csel	x1, x9, x22, mi
 17500cc: 7100011f     	cmp	w8, #0x0
 17500d0: 9a884142     	csel	x2, x10, x8, mi
 17500d4: aa1303e0     	mov	x0, x19
 17500d8: 52884803     	mov	w3, #0x4240             ; =16960
 17500dc: 72a001e3     	movk	w3, #0xf, lsl #16
 17500e0: 94000310     	bl	0x1750d20 <_ChromeMain+0x174ba84>
 17500e4: 34002760     	cbz	w0, 0x17505d0 <_ChromeMain+0x174b334>
 17500e8: 3940ae68     	ldrb	w8, [x19, #0x2b]
 17500ec: 370002c8     	tbnz	w8, #0x0, 0x1750144 <_ChromeMain+0x174aea8>
 17500f0: 39402e68     	ldrb	w8, [x19, #0xb]
 17500f4: 35000308     	cbnz	w8, 0x1750154 <_ChromeMain+0x174aeb8>
 17500f8: 52801288     	mov	w8, #0x94               ; =148
 17500fc: f9000be8     	str	x8, [sp, #0x10]
 1750100: 3957f320     	ldrb	w0, [x25, #0x5fc]
 1750104: 350029a0     	cbnz	w0, 0x1750638 <_ChromeMain+0x174b39c>
 1750108: f0062401     	adrp	x1, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 175010c: 91106c21     	add	x1, x1, #0x41b
 1750110: aa1303e0     	mov	x0, x19
 1750114: 52800382     	mov	w2, #0x1c               ; =28
 1750118: d2800003     	mov	x3, #0x0                ; =0
 175011c: 94000301     	bl	0x1750d20 <_ChromeMain+0x174ba84>
 1750120: aa0003f6     	mov	x22, x0
 1750124: 52801288     	mov	w8, #0x94               ; =148
 1750128: f9000be8     	str	x8, [sp, #0x10]
 175012c: 3957f320     	ldrb	w0, [x25, #0x5fc]
 1750130: 35002780     	cbnz	w0, 0x1750620 <_ChromeMain+0x174b384>
 1750134: 34002536     	cbz	w22, 0x17505d8 <_ChromeMain+0x174b33c>
 1750138: 38d873a8     	ldursb	w8, [x29, #-0x79]
 175013c: 36ffe1e8     	tbz	w8, #0x1f, 0x174fd78 <_ChromeMain+0x174aadc>
 1750140: 14000133     	b	0x175060c <_ChromeMain+0x174b370>
 1750144: f0062416     	adrp	x22, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 1750148: 910fb2d6     	add	x22, x22, #0x3ec
 175014c: 528002d7     	mov	w23, #0x16              ; =22
 1750150: 14000004     	b	0x1750160 <_ChromeMain+0x174aec4>
 1750154: f0061396     	adrp	x22, 0xd9c3000 <dyld_stub_binder+0xd9c3000>
 1750158: 911dfed6     	add	x22, x22, #0x77f
 175015c: 52800337     	mov	w23, #0x19              ; =25
 1750160: 52801288     	mov	w8, #0x94               ; =148
 1750164: f9000be8     	str	x8, [sp, #0x10]
 1750168: 3957f320     	ldrb	w0, [x25, #0x5fc]
 175016c: 35002b00     	cbnz	w0, 0x17506cc <_ChromeMain+0x174b430>
 1750170: aa1303e0     	mov	x0, x19
 1750174: aa1603e1     	mov	x1, x22
 1750178: aa1703e2     	mov	x2, x23
 175017c: d2800003     	mov	x3, #0x0                ; =0
 1750180: 940002e8     	bl	0x1750d20 <_ChromeMain+0x174ba84>
 1750184: aa0003f6     	mov	x22, x0
 1750188: 52801288     	mov	w8, #0x94               ; =148
 175018c: f9000be8     	str	x8, [sp, #0x10]
 1750190: 3957f320     	ldrb	w0, [x25, #0x5fc]
 1750194: 35002900     	cbnz	w0, 0x17506b4 <_ChromeMain+0x174b418>
 1750198: 34002196     	cbz	w22, 0x17505c8 <_ChromeMain+0x174b32c>
 175019c: 39402e68     	ldrb	w8, [x19, #0xb]
 17501a0: 34fffac8     	cbz	w8, 0x17500f8 <_ChromeMain+0x174ae5c>
 17501a4: 52801288     	mov	w8, #0x94               ; =148
 17501a8: f9000be8     	str	x8, [sp, #0x10]
 17501ac: 3957f320     	ldrb	w0, [x25, #0x5fc]
