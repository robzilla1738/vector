
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40daccc: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40dacd0: a90167fa     	stp	x26, x25, [sp, #0x10]
 40dacd4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40dacd8: a90357f6     	stp	x22, x21, [sp, #0x30]
 40dacdc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40dace0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40dace4: 910143fd     	add	x29, sp, #0x50
 40dace8: d10983ff     	sub	sp, sp, #0x260
 40dacec: aa0803f3     	mov	x19, x8
 40dacf0: d004fa68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40dacf4: f940f908     	ldr	x8, [x8, #0x1f0]
 40dacf8: f9400108     	ldr	x8, [x8]
 40dacfc: f81a03a8     	stur	x8, [x29, #-0x60]
 40dad00: 6f00e400     	movi.2d	v0, #0000000000000000
 40dad04: ad0203e0     	stp	q0, q0, [sp, #0x40]
 40dad08: ad0403e0     	stp	q0, q0, [sp, #0x80]
 40dad0c: 90047060     	adrp	x0, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40dad10: 911efc00     	add	x0, x0, #0x7bf
 40dad14: 90047062     	adrp	x2, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40dad18: 911fa442     	add	x2, x2, #0x7e9
 40dad1c: 910203e8     	add	x8, sp, #0x80
 40dad20: 528002c1     	mov	w1, #0x16               ; =22
 40dad24: 52800163     	mov	w3, #0xb                ; =11
 40dad28: d2800004     	mov	x4, #0x0                ; =0
 40dad2c: d2800005     	mov	x5, #0x0                ; =0
 40dad30: 52800006     	mov	w6, #0x0                ; =0
 40dad34: 97fffe84     	bl	0x40da744 <_ChromeMain+0x40d54a8>
 40dad38: 394203e8     	ldrb	w8, [sp, #0x80]
 40dad3c: 7100091f     	cmp	w8, #0x2
 40dad40: 54002fc2     	b.hs	0x40db338 <_ChromeMain+0x40d609c>
 40dad44: 36000468     	tbz	w8, #0x0, 0x40dadd0 <_ChromeMain+0x40d5b34>
 40dad48: 39c27fe8     	ldrsb	w8, [sp, #0x9f]
 40dad4c: 36f802e8     	tbz	w8, #0x1f, 0x40dada8 <_ChromeMain+0x40d5b0c>
 40dad50: f9404be8     	ldr	x8, [sp, #0x90]
 40dad54: f100611f     	cmp	x8, #0x18
 40dad58: 54000281     	b.ne	0x40dada8 <_ChromeMain+0x40d5b0c>
 40dad5c: f94047e8     	ldr	x8, [sp, #0x88]
 40dad60: a9402909     	ldp	x9, x10, [x8]
 40dad64: f9400908     	ldr	x8, [x8, #0x10]
 40dad68: d28ca96b     	mov	x11, #0x654b            ; =25931
 40dad6c: f2ac6f2b     	movk	x11, #0x6379, lsl #16
 40dad70: f2cc2d0b     	movk	x11, #0x6168, lsl #32
 40dad74: f2edcd2b     	movk	x11, #0x6e69, lsl #48
 40dad78: eb0b013f     	cmp	x9, x11
 40dad7c: d28d2409     	mov	x9, #0x6920             ; =26912
 40dad80: f2acae89     	movk	x9, #0x6574, lsl #16
 40dad84: f2c40da9     	movk	x9, #0x206d, lsl #32
 40dad88: f2ededc9     	movk	x9, #0x6f6e, lsl #48
 40dad8c: fa490140     	ccmp	x10, x9, #0x0, eq
 40dad90: d2840e89     	mov	x9, #0x2074             ; =8308
 40dad94: f2adecc9     	movk	x9, #0x6f66, lsl #16
 40dad98: f2cdcea9     	movk	x9, #0x6e75, lsl #32
 40dad9c: f2e5cc89     	movk	x9, #0x2e64, lsl #48
 40dada0: fa490100     	ccmp	x8, x9, #0x0, eq
 40dada4: 54000760     	b.eq	0x40dae90 <_ChromeMain+0x40d5bf4>
 40dada8: 910203e8     	add	x8, sp, #0x80
 40dadac: b27d0108     	orr	x8, x8, #0x8
 40dadb0: 52800034     	mov	w20, #0x1               ; =1
 40dadb4: 390103f4     	strb	w20, [sp, #0x40]
 40dadb8: 52800069     	mov	w9, #0x3                ; =3
 40dadbc: 390203e9     	strb	w9, [sp, #0x80]
 40dadc0: 3dc00100     	ldr	q0, [x8]
 40dadc4: 3c8483e0     	stur	q0, [sp, #0x48]
 40dadc8: f9400909     	ldr	x9, [x8, #0x10]
 40dadcc: 1400000a     	b	0x40dadf4 <_ChromeMain+0x40d5b58>
 40dadd0: 52800014     	mov	w20, #0x0               ; =0
 40dadd4: 390103ff     	strb	wzr, [sp, #0x40]
 40dadd8: 52800048     	mov	w8, #0x2                ; =2
 40daddc: 390203e8     	strb	w8, [sp, #0x80]
 40dade0: 910203e8     	add	x8, sp, #0x80
 40dade4: b27d0108     	orr	x8, x8, #0x8
 40dade8: 3cc883e0     	ldur	q0, [sp, #0x88]
 40dadec: 3c8483e0     	stur	q0, [sp, #0x48]
 40dadf0: f9404fe9     	ldr	x9, [sp, #0x98]
 40dadf4: f9002fe9     	str	x9, [sp, #0x58]
 40dadf8: a9007d1f     	stp	xzr, xzr, [x8]
 40dadfc: f900091f     	str	xzr, [x8, #0x10]
 40dae00: 910203e0     	add	x0, sp, #0x80
 40dae04: 94c310ec     	bl	0x719f1b4 <_ChromeMain+0x7199f18>
 40dae08: 350001f4     	cbnz	w20, 0x40dae44 <_ChromeMain+0x40d5ba8>
 40dae0c: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 40dae10: 36f800a8     	tbz	w8, #0x1f, 0x40dae24 <_ChromeMain+0x40d5b88>
 40dae14: a9448be1     	ldp	x1, x2, [sp, #0x48]
 40dae18: aa1303e0     	mov	x0, x19
 40dae1c: 96fcf4ff     	bl	0x18218 <_ChromeMain+0x12f7c>
 40dae20: 14000007     	b	0x40dae3c <_ChromeMain+0x40d5ba0>
 40dae24: 910103e8     	add	x8, sp, #0x40
 40dae28: b27d0108     	orr	x8, x8, #0x8
 40dae2c: 3dc00100     	ldr	q0, [x8]
 40dae30: 3d800260     	str	q0, [x19]
 40dae34: f9400908     	ldr	x8, [x8, #0x10]
 40dae38: f9000a68     	str	x8, [x19, #0x10]
 40dae3c: 52800028     	mov	w8, #0x1                ; =1
 40dae40: 14000003     	b	0x40dae4c <_ChromeMain+0x40d5bb0>
 40dae44: 52800008     	mov	w8, #0x0                ; =0
 40dae48: 3900027f     	strb	wzr, [x19]
 40dae4c: 39006268     	strb	w8, [x19, #0x18]
 40dae50: 910103e0     	add	x0, sp, #0x40
 40dae54: 94c310d8     	bl	0x719f1b4 <_ChromeMain+0x7199f18>
 40dae58: f85a03a8     	ldur	x8, [x29, #-0x60]
 40dae5c: d004fa69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 40dae60: f940f929     	ldr	x9, [x9, #0x1f0]
 40dae64: f9400129     	ldr	x9, [x9]
 40dae68: eb08013f     	cmp	x9, x8
 40dae6c: 54002641     	b.ne	0x40db334 <_ChromeMain+0x40d6098>
 40dae70: 910983ff     	add	sp, sp, #0x260
 40dae74: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40dae78: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40dae7c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40dae80: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40dae84: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40dae88: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40dae8c: d65f03c0     	ret
 40dae90: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 40dae94: f9003fff     	str	xzr, [sp, #0x78]
 40dae98: 52800400     	mov	w0, #0x20               ; =32
 40dae9c: 96fcd133     	bl	0xf368 <_ChromeMain+0xa0cc>
 40daea0: d1000408     	sub	x8, x0, #0x1
 40daea4: b100811f     	cmn	x8, #0x20
 40daea8: 540024c2     	b.hs	0x40db340 <_ChromeMain+0x40d60a4>
 40daeac: aa0003f4     	mov	x20, x0
 40daeb0: 6f00e400     	movi.2d	v0, #0000000000000000
 40daeb4: ad000000     	stp	q0, q0, [x0]
 40daeb8: f0057168     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 40daebc: 394fe108     	ldrb	w8, [x8, #0x3f8]
 40daec0: 34001f48     	cbz	w8, 0x40db2a8 <_ChromeMain+0x40d600c>
 40daec4: aa1403e0     	mov	x0, x20
 40daec8: 52800401     	mov	w1, #0x20               ; =32
 40daecc: 96ffe439     	bl	0xd3fb0 <_ChromeMain+0xced14>
 40daed0: 9101a3e8     	add	x8, sp, #0x68
 40daed4: aa1403e0     	mov	x0, x20
 40daed8: 52800401     	mov	w1, #0x20               ; =32
 40daedc: 97589565     	bl	0x1700470 <_ChromeMain+0x16fb1d4>
 40daee0: b4000094     	cbz	x20, 0x40daef0 <_ChromeMain+0x40d5c54>
 40daee4: aa1403e0     	mov	x0, x20
 40daee8: 52800401     	mov	w1, #0x20               ; =32
 40daeec: 96fcb7f3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40daef0: 3981ffe8     	ldrsb	x8, [sp, #0x7f]
 40daef4: 9101a3e9     	add	x9, sp, #0x68
 40daef8: a946afea     	ldp	x10, x11, [sp, #0x68]
 40daefc: f100011f     	cmp	x8, #0x0
 40daf00: 9a894156     	csel	x22, x10, x9, mi
 40daf04: 7100011f     	cmp	w8, #0x0
 40daf08: 9a88417c     	csel	x28, x11, x8, mi
 40daf0c: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40daf10: f9476108     	ldr	x8, [x8, #0xec0]
 40daf14: f9400100     	ldr	x0, [x8]
 40daf18: 94fca214     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40daf1c: f9000fe0     	str	x0, [sp, #0x18]
 40daf20: f81203a0     	stur	x0, [x29, #-0xe0]
 40daf24: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40daf28: f9475d08     	ldr	x8, [x8, #0xeb8]
 40daf2c: f9400100     	ldr	x0, [x8]
 40daf30: 94fca20e     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40daf34: f9000be0     	str	x0, [sp, #0x10]
 40daf38: f81603a0     	stur	x0, [x29, #-0xa0]
 40daf3c: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40daf40: f9475908     	ldr	x8, [x8, #0xeb0]
 40daf44: f9400100     	ldr	x0, [x8]
 40daf48: 94fca208     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40daf4c: f90007e0     	str	x0, [sp, #0x8]
 40daf50: f81283a0     	stur	x0, [x29, #-0xd8]
 40daf54: 90047060     	adrp	x0, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40daf58: 911efc00     	add	x0, x0, #0x7bf
 40daf5c: 528002c1     	mov	w1, #0x16               ; =22
 40daf60: 9796806b     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40daf64: 94fca1f5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40daf68: f9001fe0     	str	x0, [sp, #0x38]
 40daf6c: f9401fe8     	ldr	x8, [sp, #0x38]
 40daf70: f81683a8     	stur	x8, [x29, #-0x98]
 40daf74: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40daf78: f9475508     	ldr	x8, [x8, #0xea8]
 40daf7c: f9400118     	ldr	x24, [x8]
 40daf80: aa1803e0     	mov	x0, x24
 40daf84: 94fca1f9     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40daf88: f81303b8     	stur	x24, [x29, #-0xd0]
 40daf8c: 90047060     	adrp	x0, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40daf90: 911fa400     	add	x0, x0, #0x7e9
 40daf94: 52800161     	mov	w1, #0xb                ; =11
 40daf98: 9796805d     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40daf9c: 94fca1e7     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40dafa0: f9001be0     	str	x0, [sp, #0x30]
 40dafa4: f9401be8     	ldr	x8, [sp, #0x30]
 40dafa8: f81703a8     	stur	x8, [x29, #-0x90]
 40dafac: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40dafb0: f9477908     	ldr	x8, [x8, #0xef0]
 40dafb4: f940011a     	ldr	x26, [x8]
 40dafb8: aa1a03e0     	mov	x0, x26
 40dafbc: 94fca1eb     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40dafc0: f81383ba     	stur	x26, [x29, #-0xc8]
 40dafc4: 90047060     	adrp	x0, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40dafc8: 911efc00     	add	x0, x0, #0x7bf
 40dafcc: 528002c1     	mov	w1, #0x16               ; =22
 40dafd0: 9796804f     	bl	0x267b10c <_ChromeMain+0x2675e70>
 40dafd4: 94fca1d9     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40dafd8: f90017e0     	str	x0, [sp, #0x28]
 40dafdc: f94017e8     	ldr	x8, [sp, #0x28]
 40dafe0: f81783a8     	stur	x8, [x29, #-0x88]
 40dafe4: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40dafe8: f9477508     	ldr	x8, [x8, #0xee8]
 40dafec: f9400117     	ldr	x23, [x8]
 40daff0: aa1703e0     	mov	x0, x23
 40daff4: 94fca1dd     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40daff8: f81403b7     	stur	x23, [x29, #-0xc0]
 40daffc: f004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40db000: f9477108     	ldr	x8, [x8, #0xee0]
 40db004: f9400114     	ldr	x20, [x8]
 40db008: aa1403e0     	mov	x0, x20
 40db00c: 94fca1d7     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40db010: f81803b4     	stur	x20, [x29, #-0x80]
 40db014: d004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40db018: f9476d08     	ldr	x8, [x8, #0xed8]
 40db01c: f9400119     	ldr	x25, [x8]
 40db020: aa1903e0     	mov	x0, x25
 40db024: 94fca1d1     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40db028: f81483b9     	stur	x25, [x29, #-0xb8]
 40db02c: b004fa68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40db030: f945cd08     	ldr	x8, [x8, #0xb98]
 40db034: f81883a8     	stur	x8, [x29, #-0x78]
 40db038: d004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40db03c: f9476908     	ldr	x8, [x8, #0xed0]
 40db040: f9400115     	ldr	x21, [x8]
 40db044: aa1503e0     	mov	x0, x21
 40db048: 94fca1c8     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40db04c: f81503b5     	stur	x21, [x29, #-0xb0]
 40db050: d0056088     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 40db054: f9441500     	ldr	x0, [x8, #0x828]
 40db058: aa1603e2     	mov	x2, x22
 40db05c: aa1c03e3     	mov	x3, x28
 40db060: 95fffc92     	bl	0xc0da2a8 <_ChromeMain+0xc0d500c>
 40db064: 94fca1b5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40db068: aa0003f6     	mov	x22, x0
 40db06c: f81903a0     	stur	x0, [x29, #-0x70]
 40db070: d004fa68     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 40db074: f9474908     	ldr	x8, [x8, #0xe90]
 40db078: f940011b     	ldr	x27, [x8]
 40db07c: aa1b03e0     	mov	x0, x27
 40db080: 94fca1ba     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 40db084: f81583bb     	stur	x27, [x29, #-0xa8]
 40db088: d0056088     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 40db08c: f9458100     	ldr	x0, [x8, #0xb00]
 40db090: 952b3dca     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 40db094: aa0003fc     	mov	x28, x0
 40db098: 52800022     	mov	w2, #0x1                ; =1
 40db09c: 95fffa98     	bl	0xc0d9afc <_ChromeMain+0xc0d4860>
 40db0a0: f81983bc     	stur	x28, [x29, #-0x68]
 40db0a4: d0056088     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 40db0a8: f9435d00     	ldr	x0, [x8, #0x6b8]
 40db0ac: d10283a2     	sub	x2, x29, #0xa0
 40db0b0: d10383a3     	sub	x3, x29, #0xe0
 40db0b4: 52800104     	mov	w4, #0x8                ; =8
 40db0b8: 9538d973     	bl	0x8f11684 <_ChromeMain+0x8f0c3e8>
 40db0bc: 94fca19f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 40db0c0: f90013e0     	str	x0, [sp, #0x20]
 40db0c4: aa1c03e0     	mov	x0, x28
 40db0c8: 94fca1a5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0cc: aa1b03e0     	mov	x0, x27
 40db0d0: 94fca1a3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0d4: aa1603e0     	mov	x0, x22
 40db0d8: 94fca1a1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0dc: aa1503e0     	mov	x0, x21
 40db0e0: 94fca19f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0e4: aa1903e0     	mov	x0, x25
 40db0e8: 94fca19d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0ec: aa1403e0     	mov	x0, x20
 40db0f0: 94fca19b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0f4: aa1703e0     	mov	x0, x23
 40db0f8: 94fca199     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db0fc: f94017e0     	ldr	x0, [sp, #0x28]
 40db100: 94fca197     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db104: aa1a03e0     	mov	x0, x26
 40db108: 94fca195     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db10c: f9401be0     	ldr	x0, [sp, #0x30]
 40db110: 94fca193     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db114: aa1803e0     	mov	x0, x24
 40db118: 94fca191     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db11c: f9401fe0     	ldr	x0, [sp, #0x38]
 40db120: 94fca18f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db124: f94007e0     	ldr	x0, [sp, #0x8]
 40db128: 94fca18d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db12c: f9400be0     	ldr	x0, [sp, #0x10]
 40db130: 94fca18b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db134: f9400fe0     	ldr	x0, [sp, #0x18]
 40db138: 94fca189     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db13c: f94013e0     	ldr	x0, [sp, #0x20]
 40db140: d2800001     	mov	x1, #0x0                ; =0
 40db144: 95fffc5c     	bl	0xc0da2b4 <_ChromeMain+0xc0d5018>
 40db148: aa0003f4     	mov	x20, x0
 40db14c: 128c5a48     	mov	w8, #-0x62d3            ; =-25299
 40db150: 6b08001f     	cmp	w0, w8
 40db154: 54000600     	b.eq	0x40db214 <_ChromeMain+0x40d5f78>
 40db158: 340007b4     	cbz	w20, 0x40db24c <_ChromeMain+0x40d5fb0>
 40db15c: b0057168     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 40db160: b940b108     	ldr	w8, [x8, #0xb0]
 40db164: 7100091f     	cmp	w8, #0x2
 40db168: 5400026c     	b.gt	0x40db1b4 <_ChromeMain+0x40d5f18>
 40db16c: d004cd21     	adrp	x1, 0xda81000 <dyld_stub_binder+0xda81000>
 40db170: 91023021     	add	x1, x1, #0x8c
 40db174: 910283f5     	add	x21, sp, #0xa0
 40db178: 910283e0     	add	x0, sp, #0xa0
 40db17c: 52801782     	mov	w2, #0xbc               ; =188
 40db180: 52800043     	mov	w3, #0x2                ; =2
 40db184: 951be119     	bl	0x87d35e8 <_ChromeMain+0x87ce34c>
 40db188: d0050ee8     	adrp	x8, 0xe2b9000 <dyld_stub_binder+0xe2b9000>
 40db18c: 91286108     	add	x8, x8, #0xa18
 40db190: f90053e8     	str	x8, [sp, #0xa0]
 40db194: b901cff4     	str	w20, [sp, #0x1cc]
 40db198: d004cd21     	adrp	x1, 0xda81000 <dyld_stub_binder+0xda81000>
 40db19c: 910f5421     	add	x1, x1, #0x3d5
 40db1a0: 910042a0     	add	x0, x21, #0x10
 40db1a4: 528006e2     	mov	w2, #0x37               ; =55
 40db1a8: 96fd28c5     	bl	0x254bc <_ChromeMain+0x20220>
 40db1ac: 910283e0     	add	x0, sp, #0xa0
 40db1b0: 951cbddf     	bl	0x880a92c <_ChromeMain+0x8805690>
 40db1b4: f94013e0     	ldr	x0, [sp, #0x20]
 40db1b8: 94fca169     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db1bc: 52800028     	mov	w8, #0x1                ; =1
 40db1c0: 390103e8     	strb	w8, [sp, #0x40]
 40db1c4: 52800600     	mov	w0, #0x30               ; =48
 40db1c8: 96fcd068     	bl	0xf368 <_ChromeMain+0xa0cc>
 40db1cc: f90027e0     	str	x0, [sp, #0x48]
 40db1d0: f004f2e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 40db1d4: 3dc2c500     	ldr	q0, [x8, #0xb10]
 40db1d8: 3d8017e0     	str	q0, [sp, #0x50]
 40db1dc: 9100b409     	add	x9, x0, #0x2d
 40db1e0: eb00013f     	cmp	x9, x0
 40db1e4: 54000ae3     	b.lo	0x40db340 <_ChromeMain+0x40d60a4>
 40db1e8: d004cd28     	adrp	x8, 0xda81000 <dyld_stub_binder+0xda81000>
 40db1ec: 910e9d08     	add	x8, x8, #0x3a7
 40db1f0: eb08013f     	cmp	x9, x8
 40db1f4: fa488002     	ccmp	x0, x8, #0x2, hi
 40db1f8: 54000a49     	b.ls	0x40db340 <_ChromeMain+0x40d60a4>
 40db1fc: ad400500     	ldp	q0, q1, [x8]
 40db200: ad000400     	stp	q0, q1, [x0]
 40db204: 3cc1d100     	ldur	q0, [x8, #0x1d]
 40db208: 3c81d000     	stur	q0, [x0, #0x1d]
 40db20c: 3900b41f     	strb	wzr, [x0, #0x2d]
 40db210: 14000018     	b	0x40db270 <_ChromeMain+0x40d5fd4>
 40db214: f94013e0     	ldr	x0, [sp, #0x20]
 40db218: 94fca151     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db21c: f0047040     	adrp	x0, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40db220: 911efc00     	add	x0, x0, #0x7bf
 40db224: f0047042     	adrp	x2, 0xcee6000 <dyld_stub_binder+0xcee6000>
 40db228: 911fa442     	add	x2, x2, #0x7e9
 40db22c: 910103e8     	add	x8, sp, #0x40
 40db230: 528002c1     	mov	w1, #0x16               ; =22
 40db234: 52800163     	mov	w3, #0xb                ; =11
 40db238: d2800004     	mov	x4, #0x0                ; =0
 40db23c: d2800005     	mov	x5, #0x0                ; =0
 40db240: 52800006     	mov	w6, #0x0                ; =0
 40db244: 97fffd40     	bl	0x40da744 <_ChromeMain+0x40d54a8>
 40db248: 1400000a     	b	0x40db270 <_ChromeMain+0x40d5fd4>
 40db24c: f94013e0     	ldr	x0, [sp, #0x20]
 40db250: 94fca143     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 40db254: f94037e8     	ldr	x8, [sp, #0x68]
 40db258: 3cc703e0     	ldur	q0, [sp, #0x70]
 40db25c: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 40db260: f9003fff     	str	xzr, [sp, #0x78]
 40db264: 390103ff     	strb	wzr, [sp, #0x40]
 40db268: f90027e8     	str	x8, [sp, #0x48]
 40db26c: 3d8017e0     	str	q0, [sp, #0x50]
 40db270: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 40db274: 36f800a8     	tbz	w8, #0x1f, 0x40db288 <_ChromeMain+0x40d5fec>
 40db278: f94037e0     	ldr	x0, [sp, #0x68]
 40db27c: f9403fe8     	ldr	x8, [sp, #0x78]
 40db280: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40db284: 96fcb70d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40db288: 394103f4     	ldrb	w20, [sp, #0x40]
 40db28c: 910203e0     	add	x0, sp, #0x80
 40db290: 94c30fc9     	bl	0x719f1b4 <_ChromeMain+0x7199f18>
 40db294: 71000a9f     	cmp	w20, #0x2
 40db298: 54ffdb83     	b.lo	0x40dae08 <_ChromeMain+0x40d5b6c>
 40db29c: d4200000     	brk	#0
 40db2a0: d4400000     	hlt	#0
 40db2a4: d4200020     	brk	#0x1
 40db2a8: aa1403e0     	mov	x0, x20
 40db2ac: 52800401     	mov	w1, #0x20               ; =32
 40db2b0: 94fcfaf5     	bl	0x8019e84 <_ChromeMain+0x8014be8>
 40db2b4: 34ffe0e0     	cbz	w0, 0x40daed0 <_ChromeMain+0x40d5c34>
 40db2b8: 951ca99c     	bl	0x8805928 <_ChromeMain+0x880068c>
 40db2bc: aa1403e1     	mov	x1, x20
 40db2c0: 52800402     	mov	w2, #0x20               ; =32
 40db2c4: 9783f20d     	bl	0x21d7af8 <_ChromeMain+0x21d285c>
 40db2c8: 3707e040     	tbnz	w0, #0x0, 0x40daed0 <_ChromeMain+0x40d5c34>
 40db2cc: d4200000     	brk	#0
 40db2d0: d4400000     	hlt	#0
 40db2d4: d4200020     	brk	#0x1
 40db2d8: aa0003f3     	mov	x19, x0
 40db2dc: 910283e0     	add	x0, sp, #0xa0
 40db2e0: 951cbd93     	bl	0x880a92c <_ChromeMain+0x8805690>
 40db2e4: 1400000a     	b	0x40db30c <_ChromeMain+0x40d6070>
 40db2e8: aa0003f3     	mov	x19, x0
 40db2ec: b40001d4     	cbz	x20, 0x40db324 <_ChromeMain+0x40d6088>
 40db2f0: aa1403e0     	mov	x0, x20
 40db2f4: 52800401     	mov	w1, #0x20               ; =32
 40db2f8: 1400000a     	b	0x40db320 <_ChromeMain+0x40d6084>
 40db2fc: aa0003f3     	mov	x19, x0
 40db300: 910103e0     	add	x0, sp, #0x40
 40db304: 14000009     	b	0x40db328 <_ChromeMain+0x40d608c>
 40db308: aa0003f3     	mov	x19, x0
 40db30c: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 40db310: 36f800a8     	tbz	w8, #0x1f, 0x40db324 <_ChromeMain+0x40d6088>
 40db314: f94037e0     	ldr	x0, [sp, #0x68]
 40db318: f9403fe8     	ldr	x8, [sp, #0x78]
 40db31c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40db320: 96fcb6e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40db324: 910203e0     	add	x0, sp, #0x80
 40db328: 94c30fa3     	bl	0x719f1b4 <_ChromeMain+0x7199f18>
 40db32c: aa1303e0     	mov	x0, x19
 40db330: 94fca075     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 40db334: 94fca40b     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 40db338: d4200000     	brk	#0
 40db33c: d4400000     	hlt	#0
 40db340: d4200020     	brk	#0x1
 40db344: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
