
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426be60: 6db733ed     	stp	d13, d12, [sp, #-0x90]!
 426be64: 6d012beb     	stp	d11, d10, [sp, #0x10]
 426be68: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 426be6c: a9036ffc     	stp	x28, x27, [sp, #0x30]
 426be70: a90467fa     	stp	x26, x25, [sp, #0x40]
 426be74: a9055ff8     	stp	x24, x23, [sp, #0x50]
 426be78: a90657f6     	stp	x22, x21, [sp, #0x60]
 426be7c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 426be80: a9087bfd     	stp	x29, x30, [sp, #0x80]
 426be84: 910203fd     	add	x29, sp, #0x80
 426be88: d10603ff     	sub	sp, sp, #0x180
 426be8c: f9400408     	ldr	x8, [x0, #0x8]
 426be90: 52801609     	mov	w9, #0xb0               ; =176
 426be94: 9b097d08     	mul	x8, x8, x9
 426be98: b4001d48     	cbz	x8, 0x426c240 <_ChromeMain+0x4266fa4>
 426be9c: aa0203f5     	mov	x21, x2
 426bea0: aa0103f4     	mov	x20, x1
 426bea4: 910183fb     	add	x27, sp, #0x60
 426bea8: f940001c     	ldr	x28, [x0]
 426beac: 8b080397     	add	x23, x28, x8
 426beb0: b004ede8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426beb4: f9444908     	ldr	x8, [x8, #0x890]
 426beb8: b201f3fa     	mov	x26, #-0x5555555555555556 ; =-6148914691236517206
 426bebc: f2e1555a     	movk	x26, #0xaaa, lsl #48
 426bec0: b004ac53     	adrp	x19, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 426bec4: 910b4e73     	add	x19, x19, #0x2d3
 426bec8: fd400108     	ldr	d8, [x8]
 426becc: f004b1b6     	adrp	x22, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 426bed0: 911442d6     	add	x22, x22, #0x510
 426bed4: f004bb18     	adrp	x24, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 426bed8: 9133cf18     	add	x24, x24, #0xcf3
 426bedc: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 426bee0: f2955579     	movk	x25, #0xaaab
 426bee4: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 426bee8: 9e670109     	fmov	d9, x8
 426beec: 9004e708     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 426bef0: fd45ad0a     	ldr	d10, [x8, #0xb58]
 426bef4: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 426bef8: 9e67010b     	fmov	d11, x8
 426befc: 92f78408     	mov	x8, #0x43dfffffffffffff ; =4890909195324358655
 426bf00: 9e67010c     	fmov	d12, x8
 426bf04: f90007e1     	str	x1, [sp, #0x8]
 426bf08: 140000b1     	b	0x426c1cc <_ChromeMain+0x4266f30>
 426bf0c: 13001d09     	sxtb	w9, w8
 426bf10: 7100013f     	cmp	w9, #0x0
 426bf14: a975aba9     	ldp	x9, x10, [x29, #-0xa8]
 426bf18: d102a3ab     	sub	x11, x29, #0xa8
 426bf1c: 9a8b4121     	csel	x1, x9, x11, mi
 426bf20: 9a884142     	csel	x2, x10, x8, mi
 426bf24: 91026360     	add	x0, x27, #0x98
 426bf28: 97198a43     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 426bf2c: 14000055     	b	0x426c080 <_ChromeMain+0x4266de4>
 426bf30: a9758ba1     	ldp	x1, x2, [x29, #-0xa8]
 426bf34: 91026360     	add	x0, x27, #0x98
 426bf38: 971989ed     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 426bf3c: 14000051     	b	0x426c080 <_ChromeMain+0x4266de4>
 426bf40: 3dc00260     	ldr	q0, [x19]
 426bf44: f9400a68     	ldr	x8, [x19, #0x10]
 426bf48: f9000b48     	str	x8, [x26, #0x10]
 426bf4c: 3d800340     	str	q0, [x26]
 426bf50: 14000018     	b	0x426bfb0 <_ChromeMain+0x4266d14>
 426bf54: d2800018     	mov	x24, #0x0               ; =0
 426bf58: 6f00e400     	movi.2d	v0, #0000000000000000
 426bf5c: 3d8007e0     	str	q0, [sp, #0x10]
 426bf60: 14000024     	b	0x426bff0 <_ChromeMain+0x4266d54>
 426bf64: f9400696     	ldr	x22, [x20, #0x8]
 426bf68: b4ffff76     	cbz	x22, 0x426bf54 <_ChromeMain+0x4266cb8>
 426bf6c: eb1a02df     	cmp	x22, x26
 426bf70: 54003348     	b.hi	0x426c5d8 <_ChromeMain+0x426733c>
 426bf74: f9400293     	ldr	x19, [x20]
 426bf78: 8b1606c8     	add	x8, x22, x22, lsl #1
 426bf7c: d37df119     	lsl	x25, x8, #3
 426bf80: aa1903e0     	mov	x0, x25
 426bf84: 96f68cf9     	bl	0xf368 <_ChromeMain+0xa0cc>
 426bf88: aa0003f8     	mov	x24, x0
 426bf8c: aa0003fa     	mov	x26, x0
 426bf90: b4000199     	cbz	x25, 0x426bfc0 <_ChromeMain+0x4266d24>
 426bf94: aa1803fa     	mov	x26, x24
 426bf98: b40031fa     	cbz	x26, 0x426c5d4 <_ChromeMain+0x4267338>
 426bf9c: 39c05e68     	ldrsb	w8, [x19, #0x17]
 426bfa0: 36fffd08     	tbz	w8, #0x1f, 0x426bf40 <_ChromeMain+0x4266ca4>
 426bfa4: a9400a61     	ldp	x1, x2, [x19]
 426bfa8: aa1a03e0     	mov	x0, x26
 426bfac: 96f76b09     	bl	0x46bd0 <_ChromeMain+0x41934>
 426bfb0: 91006273     	add	x19, x19, #0x18
 426bfb4: 9100635a     	add	x26, x26, #0x18
 426bfb8: f1006339     	subs	x25, x25, #0x18
 426bfbc: 54fffee1     	b.ne	0x426bf98 <_ChromeMain+0x4266cfc>
 426bfc0: cb180348     	sub	x8, x26, x24
 426bfc4: 9343fd08     	asr	x8, x8, #3
 426bfc8: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 426bfcc: f2955579     	movk	x25, #0xaaab
 426bfd0: 9b197d08     	mul	x8, x8, x25
 426bfd4: 9e670100     	fmov	d0, x8
 426bfd8: 4e181ec0     	mov.d	v0[1], x22
 426bfdc: 3d8007e0     	str	q0, [sp, #0x10]
 426bfe0: b201f3fa     	mov	x26, #-0x5555555555555556 ; =-6148914691236517206
 426bfe4: f2e1555a     	movk	x26, #0xaaa, lsl #48
 426bfe8: b004ac53     	adrp	x19, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 426bfec: 910b4e73     	add	x19, x19, #0x2d3
 426bff0: 6f00e400     	movi.2d	v0, #0000000000000000
 426bff4: ad068360     	stp	q0, q0, [x27, #0xd0]
 426bff8: ad058360     	stp	q0, q0, [x27, #0xb0]
 426bffc: ad048360     	stp	q0, q0, [x27, #0x90]
 426c000: ad038360     	stp	q0, q0, [x27, #0x70]
 426c004: ad028360     	stp	q0, q0, [x27, #0x50]
 426c008: ad0483e0     	stp	q0, q0, [sp, #0x90]
 426c00c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 426c010: 3d801be0     	str	q0, [sp, #0x60]
 426c014: 91002360     	add	x0, x27, #0x8
 426c018: 9793b11a     	bl	0x2758480 <_ChromeMain+0x27531e4>
 426c01c: 390483ff     	strb	wzr, [sp, #0x120]
 426c020: 3904a3ff     	strb	wzr, [sp, #0x128]
 426c024: 390503ff     	strb	wzr, [sp, #0x140]
 426c028: 790293ff     	strh	wzr, [sp, #0x148]
 426c02c: 6f00e400     	movi.2d	v0, #0000000000000000
 426c030: ad040360     	stp	q0, q0, [x27, #0x80]
 426c034: 3c8a0360     	stur	q0, [x27, #0xa0]
 426c038: 3c8a9360     	stur	q0, [x27, #0xa9]
 426c03c: 52802008     	mov	w8, #0x100              ; =256
 426c040: 7900c3e8     	strh	w8, [sp, #0x60]
 426c044: a9402281     	ldp	x1, x8, [x20]
 426c048: 8b080508     	add	x8, x8, x8, lsl #1
 426c04c: 8b080c22     	add	x2, x1, x8, lsl #3
 426c050: 9340f108     	sbfx	x8, x8, #0, #61
 426c054: 9b197d03     	mul	x3, x8, x25
 426c058: 91020360     	add	x0, x27, #0x80
 426c05c: 97a78779     	bl	0x2c4de40 <_ChromeMain+0x2c48ba4>
 426c060: 39c43fe9     	ldrsb	w9, [sp, #0x10f]
 426c064: 3856f3a8     	ldurb	w8, [x29, #-0x91]
 426c068: 37fff529     	tbnz	w9, #0x1f, 0x426bf0c <_ChromeMain+0x4266c70>
 426c06c: 373ff628     	tbnz	w8, #0x7, 0x426bf30 <_ChromeMain+0x4266c94>
 426c070: 3cd583a0     	ldur	q0, [x29, #-0xa8]
 426c074: 3c898360     	stur	q0, [x27, #0x98]
 426c078: f85683a8     	ldur	x8, [x29, #-0x98]
 426c07c: f80a8368     	stur	x8, [x27, #0xa8]
 426c080: b0054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426c084: f9468508     	ldr	x8, [x8, #0xd08]
 426c088: 1031ed49     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426c08c: d503201f     	nop
 426c090: eb09011f     	cmp	x8, x9
 426c094: 54000f61     	b.ne	0x426c280 <_ChromeMain+0x4266fe4>
 426c098: 94f7163e     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426c09c: 1e602008     	fcmp	d0, #0.0
 426c0a0: 54002a00     	b.eq	0x426c5e0 <_ChromeMain+0x4267344>
 426c0a4: 1e692000     	fcmp	d0, d9
 426c0a8: 92f0000a     	mov	x10, #0x7fffffffffffffff ; =9223372036854775807
 426c0ac: 54002a20     	b.eq	0x426c5f0 <_ChromeMain+0x4267354>
 426c0b0: 1e682800     	fadd	d0, d0, d8
 426c0b4: 1e6a0800     	fmul	d0, d0, d10
 426c0b8: 1e6b2000     	fcmp	d0, d11
 426c0bc: 9a8ab3e8     	csel	x8, xzr, x10, lt
 426c0c0: 1e6b6801     	fmaxnm	d1, d0, d11
 426c0c4: 9e780029     	fcvtzs	x9, d1
 426c0c8: 1e6c2000     	fcmp	d0, d12
 426c0cc: 9a889120     	csel	x0, x9, x8, ls
 426c0d0: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426c0d4: 8b080008     	add	x8, x0, x8
 426c0d8: b201f3f4     	mov	x20, #-0x5555555555555556 ; =-6148914691236517206
 426c0dc: f2955574     	movk	x20, #0xaaab
 426c0e0: f100091f     	cmp	x8, #0x2
 426c0e4: 540000e3     	b.lo	0x426c100 <_ChromeMain+0x4266e64>
 426c0e8: d2880008     	mov	x8, #0x4000             ; =16384
 426c0ec: f2a910c8     	movk	x8, #0x4886, lsl #16
 426c0f0: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426c0f4: f2e00528     	movk	x8, #0x29, lsl #48
 426c0f8: ab080008     	adds	x8, x0, x8
 426c0fc: 9a886140     	csel	x0, x10, x8, vs
 426c100: f9008be0     	str	x0, [sp, #0x110]
 426c104: 910183e1     	add	x1, sp, #0x60
 426c108: aa1503e0     	mov	x0, x21
 426c10c: 94d6dcb5     	bl	0x78233e0 <_ChromeMain+0x781e144>
 426c110: 3dc007e1     	ldr	q1, [sp, #0x10]
 426c114: 9e660039     	fmov	x25, d1
 426c118: 4e183c36     	mov.d	x22, v1[1]
 426c11c: eb16033f     	cmp	x25, x22
 426c120: 54000b80     	b.eq	0x426c290 <_ChromeMain+0x4266ff4>
 426c124: 52800308     	mov	w8, #0x18               ; =24
 426c128: 9b086339     	madd	x25, x25, x8, x24
 426c12c: b4002559     	cbz	x25, 0x426c5d4 <_ChromeMain+0x4267338>
 426c130: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 426c134: 37f809c8     	tbnz	w8, #0x1f, 0x426c26c <_ChromeMain+0x4266fd0>
 426c138: 3cd583a0     	ldur	q0, [x29, #-0xa8]
 426c13c: f85683a8     	ldur	x8, [x29, #-0x98]
 426c140: f9000b28     	str	x8, [x25, #0x10]
 426c144: 3d800320     	str	q0, [x25]
 426c148: 91006328     	add	x8, x25, #0x18
 426c14c: eb180108     	subs	x8, x8, x24
 426c150: 54002420     	b.eq	0x426c5d4 <_ChromeMain+0x4267338>
 426c154: 9343fd08     	asr	x8, x8, #3
 426c158: 9b147d08     	mul	x8, x8, x20
 426c15c: a902a3f8     	stp	x24, x8, [sp, #0x28]
 426c160: 9100a3e8     	add	x8, sp, #0x28
 426c164: 91004108     	add	x8, x8, #0x10
 426c168: 4d008501     	st1.d	{ v1 }[1], [x8]
 426c16c: 91026380     	add	x0, x28, #0x98
 426c170: 9100a3e1     	add	x1, sp, #0x28
 426c174: aa1503e2     	mov	x2, x21
 426c178: 3d8007e1     	str	q1, [sp, #0x10]
 426c17c: 97ffff39     	bl	0x426be60 <_ChromeMain+0x4266bc4>
 426c180: f94007f4     	ldr	x20, [sp, #0x8]
 426c184: b5002038     	cbnz	x24, 0x426c588 <_ChromeMain+0x42672ec>
 426c188: 910183e0     	add	x0, sp, #0x60
 426c18c: 94be1aa3     	bl	0x71f2c18 <_ChromeMain+0x71ed97c>
 426c190: d004b1b6     	adrp	x22, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 426c194: 911442d6     	add	x22, x22, #0x510
 426c198: d004bb18     	adrp	x24, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 426c19c: 9133cf18     	add	x24, x24, #0xcf3
 426c1a0: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 426c1a4: f2955579     	movk	x25, #0xaaab
 426c1a8: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 426c1ac: 36f800a8     	tbz	w8, #0x1f, 0x426c1c0 <_ChromeMain+0x4266f24>
 426c1b0: f85583a0     	ldur	x0, [x29, #-0xa8]
 426c1b4: f85683a8     	ldur	x8, [x29, #-0x98]
 426c1b8: d37ff901     	lsl	x1, x8, #1
 426c1bc: 96f6733f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c1c0: 9102c39c     	add	x28, x28, #0xb0
 426c1c4: eb17039f     	cmp	x28, x23
 426c1c8: 540003c0     	b.eq	0x426c240 <_ChromeMain+0x4266fa4>
 426c1cc: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 426c1d0: f81683bf     	stur	xzr, [x29, #-0x98]
 426c1d4: 39805f81     	ldrsb	x1, [x28, #0x17]
 426c1d8: b7f80301     	tbnz	x1, #0x3f, 0x426c238 <_ChromeMain+0x4266f9c>
 426c1dc: aa1c03e0     	mov	x0, x28
 426c1e0: d102a3a8     	sub	x8, x29, #0xa8
 426c1e4: 9719d84b     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 426c1e8: 39424388     	ldrb	w8, [x28, #0x90]
 426c1ec: 34ffebc8     	cbz	w8, 0x426bf64 <_ChromeMain+0x4266cc8>
 426c1f0: 3940c388     	ldrb	w8, [x28, #0x30]
 426c1f4: 34fffda8     	cbz	w8, 0x426c1a8 <_ChromeMain+0x4266f0c>
 426c1f8: 91006380     	add	x0, x28, #0x18
 426c1fc: aa1303e1     	mov	x1, x19
 426c200: 528000c2     	mov	w2, #0x6                ; =6
 426c204: 970cd063     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426c208: 3707fd00     	tbnz	w0, #0x0, 0x426c1a8 <_ChromeMain+0x4266f0c>
 426c20c: 91006380     	add	x0, x28, #0x18
 426c210: aa1603e1     	mov	x1, x22
 426c214: 52800202     	mov	w2, #0x10               ; =16
 426c218: 970cd05e     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426c21c: 3707fc60     	tbnz	w0, #0x0, 0x426c1a8 <_ChromeMain+0x4266f0c>
 426c220: 91006380     	add	x0, x28, #0x18
 426c224: aa1803e1     	mov	x1, x24
 426c228: 52800102     	mov	w2, #0x8                ; =8
 426c22c: 970cd059     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 426c230: 3707fbc0     	tbnz	w0, #0x0, 0x426c1a8 <_ChromeMain+0x4266f0c>
 426c234: 14000054     	b	0x426c384 <_ChromeMain+0x42670e8>
 426c238: a9400780     	ldp	x0, x1, [x28]
 426c23c: 17ffffe9     	b	0x426c1e0 <_ChromeMain+0x4266f44>
 426c240: 910603ff     	add	sp, sp, #0x180
 426c244: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 426c248: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 426c24c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 426c250: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 426c254: a94467fa     	ldp	x26, x25, [sp, #0x40]
 426c258: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 426c25c: 6d4223e9     	ldp	d9, d8, [sp, #0x20]
 426c260: 6d412beb     	ldp	d11, d10, [sp, #0x10]
 426c264: 6cc933ed     	ldp	d13, d12, [sp], #0x90
 426c268: d65f03c0     	ret
 426c26c: a9758ba1     	ldp	x1, x2, [x29, #-0xa8]
 426c270: aa1903e0     	mov	x0, x25
 426c274: 96f76a57     	bl	0x46bd0 <_ChromeMain+0x41934>
 426c278: 3dc007e1     	ldr	q1, [sp, #0x10]
 426c27c: 17ffffb3     	b	0x426c148 <_ChromeMain+0x4266eac>
 426c280: b201f3f4     	mov	x20, #-0x5555555555555556 ; =-6148914691236517206
 426c284: f2955574     	movk	x20, #0xaaab
 426c288: d63f0100     	blr	x8
 426c28c: 17ffff9d     	b	0x426c100 <_ChromeMain+0x4266e64>
 426c290: 91000728     	add	x8, x25, #0x1
 426c294: eb1a011f     	cmp	x8, x26
 426c298: 54001a08     	b.hi	0x426c5d8 <_ChromeMain+0x426733c>
 426c29c: d37ffb29     	lsl	x9, x25, #1
 426c2a0: eb08013f     	cmp	x9, x8
 426c2a4: 9a888128     	csel	x8, x9, x8, hi
 426c2a8: b200f3e9     	mov	x9, #0x5555555555555555 ; =6148914691236517205
 426c2ac: f2e0aaa9     	movk	x9, #0x555, lsl #48
 426c2b0: eb09033f     	cmp	x25, x9
 426c2b4: 9a9a3113     	csel	x19, x8, x26, lo
 426c2b8: b4001a53     	cbz	x19, 0x426c600 <_ChromeMain+0x4267364>
 426c2bc: eb1a027f     	cmp	x19, x26
 426c2c0: 540018e8     	b.hi	0x426c5dc <_ChromeMain+0x4267340>
 426c2c4: 8b130668     	add	x8, x19, x19, lsl #1
 426c2c8: d37df100     	lsl	x0, x8, #3
 426c2cc: 96f68c27     	bl	0xf368 <_ChromeMain+0xa0cc>
 426c2d0: 52800308     	mov	w8, #0x18               ; =24
 426c2d4: 9b080339     	madd	x25, x25, x8, x0
 426c2d8: 3dc007e1     	ldr	q1, [sp, #0x10]
 426c2dc: b40017d9     	cbz	x25, 0x426c5d4 <_ChromeMain+0x4267338>
 426c2e0: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 426c2e4: f90003f5     	str	x21, [sp]
 426c2e8: 37f80448     	tbnz	w8, #0x1f, 0x426c370 <_ChromeMain+0x42670d4>
 426c2ec: 3cd583a0     	ldur	q0, [x29, #-0xa8]
 426c2f0: f85683a8     	ldur	x8, [x29, #-0x98]
 426c2f4: f9000b28     	str	x8, [x25, #0x10]
 426c2f8: 3d800320     	str	q0, [x25]
 426c2fc: 9e660028     	fmov	x8, d1
 426c300: d37df109     	lsl	x9, x8, #3
 426c304: cb081535     	sub	x21, x9, x8, lsl #5
 426c308: 8b15033a     	add	x26, x25, x21
 426c30c: 8b080508     	add	x8, x8, x8, lsl #1
 426c310: d37df102     	lsl	x2, x8, #3
 426c314: aa1a03e0     	mov	x0, x26
 426c318: aa1803e1     	mov	x1, x24
 426c31c: 94f67677     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 426c320: 52800308     	mov	w8, #0x18               ; =24
 426c324: cb150108     	sub	x8, x8, x21
 426c328: 9343fd08     	asr	x8, x8, #3
 426c32c: 9b147d08     	mul	x8, x8, x20
 426c330: 9e670101     	fmov	d1, x8
 426c334: 4e181e61     	mov.d	v1[1], x19
 426c338: b40000f8     	cbz	x24, 0x426c354 <_ChromeMain+0x42670b8>
 426c33c: 8b1606c8     	add	x8, x22, x22, lsl #1
 426c340: d37df101     	lsl	x1, x8, #3
 426c344: aa1803e0     	mov	x0, x24
 426c348: 3d8007e1     	str	q1, [sp, #0x10]
 426c34c: 96f672db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c350: 3dc007e1     	ldr	q1, [sp, #0x10]
 426c354: aa1a03f8     	mov	x24, x26
 426c358: f94003f5     	ldr	x21, [sp]
 426c35c: b201f3fa     	mov	x26, #-0x5555555555555556 ; =-6148914691236517206
 426c360: f2e1555a     	movk	x26, #0xaaa, lsl #48
 426c364: 9004ac53     	adrp	x19, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 426c368: 910b4e73     	add	x19, x19, #0x2d3
 426c36c: 17ffff77     	b	0x426c148 <_ChromeMain+0x4266eac>
 426c370: a9758ba1     	ldp	x1, x2, [x29, #-0xa8]
 426c374: aa1903e0     	mov	x0, x25
 426c378: 96f76a16     	bl	0x46bd0 <_ChromeMain+0x41934>
 426c37c: 3dc007e1     	ldr	q1, [sp, #0x10]
 426c380: 17ffffdf     	b	0x426c2fc <_ChromeMain+0x4267060>
 426c384: 6f00e400     	movi.2d	v0, #0000000000000000
 426c388: ad068360     	stp	q0, q0, [x27, #0xd0]
 426c38c: ad058360     	stp	q0, q0, [x27, #0xb0]
 426c390: ad048360     	stp	q0, q0, [x27, #0x90]
 426c394: ad038360     	stp	q0, q0, [x27, #0x70]
 426c398: ad028360     	stp	q0, q0, [x27, #0x50]
 426c39c: ad0483e0     	stp	q0, q0, [sp, #0x90]
 426c3a0: ad0383e0     	stp	q0, q0, [sp, #0x70]
 426c3a4: 3d801be0     	str	q0, [sp, #0x60]
 426c3a8: 91002360     	add	x0, x27, #0x8
 426c3ac: 9793b035     	bl	0x2758480 <_ChromeMain+0x27531e4>
 426c3b0: 390483ff     	strb	wzr, [sp, #0x120]
 426c3b4: 3904a3ff     	strb	wzr, [sp, #0x128]
 426c3b8: 390503ff     	strb	wzr, [sp, #0x140]
 426c3bc: 790293ff     	strh	wzr, [sp, #0x148]
 426c3c0: 6f00e400     	movi.2d	v0, #0000000000000000
 426c3c4: ad040360     	stp	q0, q0, [x27, #0x80]
 426c3c8: 3c8a0360     	stur	q0, [x27, #0xa0]
 426c3cc: 3c8a9360     	stur	q0, [x27, #0xa9]
 426c3d0: 7900c3ff     	strh	wzr, [sp, #0x60]
 426c3d4: 39424388     	ldrb	w8, [x28, #0x90]
 426c3d8: 36000fe8     	tbz	w8, #0x0, 0x426c5d4 <_ChromeMain+0x4267338>
 426c3dc: 91002360     	add	x0, x27, #0x8
 426c3e0: 91006381     	add	x1, x28, #0x18
 426c3e4: 97097d4a     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 426c3e8: a9402281     	ldp	x1, x8, [x20]
 426c3ec: 8b080508     	add	x8, x8, x8, lsl #1
 426c3f0: 8b080c22     	add	x2, x1, x8, lsl #3
 426c3f4: 9340f108     	sbfx	x8, x8, #0, #61
 426c3f8: 9b197d03     	mul	x3, x8, x25
 426c3fc: 91020360     	add	x0, x27, #0x80
 426c400: 97a78690     	bl	0x2c4de40 <_ChromeMain+0x2c48ba4>
 426c404: 3856f3a9     	ldurb	w9, [x29, #-0x91]
 426c408: 13001d28     	sxtb	w8, w9
 426c40c: f85603a2     	ldur	x2, [x29, #-0xa0]
 426c410: 7100011f     	cmp	w8, #0x0
 426c414: 9a894049     	csel	x9, x2, x9, mi
 426c418: b4000169     	cbz	x9, 0x426c444 <_ChromeMain+0x42671a8>
 426c41c: 37f800c8     	tbnz	w8, #0x1f, 0x426c434 <_ChromeMain+0x4267198>
 426c420: 3cd583a0     	ldur	q0, [x29, #-0xa8]
 426c424: 3d8013e0     	str	q0, [sp, #0x40]
 426c428: f85683a8     	ldur	x8, [x29, #-0x98]
 426c42c: f9002be8     	str	x8, [sp, #0x50]
 426c430: 1400000f     	b	0x426c46c <_ChromeMain+0x42671d0>
 426c434: f85583a1     	ldur	x1, [x29, #-0xa8]
 426c438: 910103e0     	add	x0, sp, #0x40
 426c43c: 96f769e5     	bl	0x46bd0 <_ChromeMain+0x41934>
 426c440: 1400000b     	b	0x426c46c <_ChromeMain+0x42671d0>
 426c444: 91002360     	add	x0, x27, #0x8
 426c448: 97100190     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 426c44c: 39805c08     	ldrsb	x8, [x0, #0x17]
 426c450: a9402809     	ldp	x9, x10, [x0]
 426c454: f100011f     	cmp	x8, #0x0
 426c458: 9a804120     	csel	x0, x9, x0, mi
 426c45c: 7100011f     	cmp	w8, #0x0
 426c460: 9a884141     	csel	x1, x10, x8, mi
 426c464: 910103e8     	add	x8, sp, #0x40
 426c468: 9719d7aa     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 426c46c: 39c43fe9     	ldrsb	w9, [sp, #0x10f]
 426c470: 39415fe8     	ldrb	w8, [sp, #0x57]
 426c474: 37f80569     	tbnz	w9, #0x1f, 0x426c520 <_ChromeMain+0x4267284>
 426c478: 37380668     	tbnz	w8, #0x7, 0x426c544 <_ChromeMain+0x42672a8>
 426c47c: 3dc013e0     	ldr	q0, [sp, #0x40]
 426c480: 3c898360     	stur	q0, [x27, #0x98]
 426c484: f9402be8     	ldr	x8, [sp, #0x50]
 426c488: f80a8368     	stur	x8, [x27, #0xa8]
 426c48c: b0054a28     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426c490: f9468508     	ldr	x8, [x8, #0xd08]
 426c494: 1031cce9     	adr	x9, 0x42cfe30 <_ChromeMain+0x42cab94>
 426c498: d503201f     	nop
 426c49c: eb09011f     	cmp	x8, x9
 426c4a0: 54000661     	b.ne	0x426c56c <_ChromeMain+0x42672d0>
 426c4a4: 94f7153b     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 426c4a8: 1e602008     	fcmp	d0, #0.0
 426c4ac: 54000ae0     	b.eq	0x426c608 <_ChromeMain+0x426736c>
 426c4b0: 1e692000     	fcmp	d0, d9
 426c4b4: 92f0000a     	mov	x10, #0x7fffffffffffffff ; =9223372036854775807
 426c4b8: 54000ac0     	b.eq	0x426c610 <_ChromeMain+0x4267374>
 426c4bc: 1e682800     	fadd	d0, d0, d8
 426c4c0: 1e6a0800     	fmul	d0, d0, d10
 426c4c4: 1e6b2000     	fcmp	d0, d11
 426c4c8: 9a8ab3e8     	csel	x8, xzr, x10, lt
 426c4cc: 1e6b6801     	fmaxnm	d1, d0, d11
 426c4d0: 9e780029     	fcvtzs	x9, d1
 426c4d4: 1e6c2000     	fcmp	d0, d12
 426c4d8: 9a889120     	csel	x0, x9, x8, ls
 426c4dc: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 426c4e0: 8b080008     	add	x8, x0, x8
 426c4e4: f100091f     	cmp	x8, #0x2
 426c4e8: 540000e3     	b.lo	0x426c504 <_ChromeMain+0x4267268>
 426c4ec: d2880008     	mov	x8, #0x4000             ; =16384
 426c4f0: f2a910c8     	movk	x8, #0x4886, lsl #16
 426c4f4: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 426c4f8: f2e00528     	movk	x8, #0x29, lsl #48
 426c4fc: ab080008     	adds	x8, x0, x8
 426c500: 9a886140     	csel	x0, x10, x8, vs
 426c504: f9008be0     	str	x0, [sp, #0x110]
 426c508: 910183e1     	add	x1, sp, #0x60
 426c50c: aa1503e0     	mov	x0, x21
 426c510: 94d6dbb4     	bl	0x78233e0 <_ChromeMain+0x781e144>
 426c514: 910183e0     	add	x0, sp, #0x60
 426c518: 94be19c0     	bl	0x71f2c18 <_ChromeMain+0x71ed97c>
 426c51c: 17ffff23     	b	0x426c1a8 <_ChromeMain+0x4266f0c>
 426c520: 13001d09     	sxtb	w9, w8
 426c524: 7100013f     	cmp	w9, #0x0
 426c528: a9442be9     	ldp	x9, x10, [sp, #0x40]
 426c52c: 910103eb     	add	x11, sp, #0x40
 426c530: 9a8b4121     	csel	x1, x9, x11, mi
 426c534: 9a884142     	csel	x2, x10, x8, mi
 426c538: 91026360     	add	x0, x27, #0x98
 426c53c: 971988be     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 426c540: 14000004     	b	0x426c550 <_ChromeMain+0x42672b4>
 426c544: a9440be1     	ldp	x1, x2, [sp, #0x40]
 426c548: 91026360     	add	x0, x27, #0x98
 426c54c: 97198868     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 426c550: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 426c554: 36fff9c8     	tbz	w8, #0x1f, 0x426c48c <_ChromeMain+0x42671f0>
 426c558: f94023e0     	ldr	x0, [sp, #0x40]
 426c55c: f9402be8     	ldr	x8, [sp, #0x50]
 426c560: d37ff901     	lsl	x1, x8, #1
 426c564: 96f67255     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c568: 17ffffc9     	b	0x426c48c <_ChromeMain+0x42671f0>
 426c56c: d63f0100     	blr	x8
 426c570: 17ffffe5     	b	0x426c504 <_ChromeMain+0x4267268>
 426c574: f9400100     	ldr	x0, [x8]
 426c578: f9400908     	ldr	x8, [x8, #0x10]
 426c57c: d37ff901     	lsl	x1, x8, #1
 426c580: 96f6724e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c584: 14000009     	b	0x426c5a8 <_ChromeMain+0x426730c>
 426c588: 3dc007e0     	ldr	q0, [sp, #0x10]
 426c58c: 4e183c13     	mov.d	x19, v0[1]
 426c590: cb180336     	sub	x22, x25, x24
 426c594: ab16031f     	cmn	x24, x22
 426c598: 540001e0     	b.eq	0x426c5d4 <_ChromeMain+0x4267338>
 426c59c: 8b160308     	add	x8, x24, x22
 426c5a0: 39c05d09     	ldrsb	w9, [x8, #0x17]
 426c5a4: 37fffe89     	tbnz	w9, #0x1f, 0x426c574 <_ChromeMain+0x42672d8>
 426c5a8: d10062d6     	sub	x22, x22, #0x18
 426c5ac: b10062df     	cmn	x22, #0x18
 426c5b0: 54ffff21     	b.ne	0x426c594 <_ChromeMain+0x42672f8>
 426c5b4: f9001bff     	str	xzr, [sp, #0x30]
 426c5b8: 8b130668     	add	x8, x19, x19, lsl #1
 426c5bc: d37df101     	lsl	x1, x8, #3
 426c5c0: aa1803e0     	mov	x0, x24
 426c5c4: 96f6723d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426c5c8: 9004ac53     	adrp	x19, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 426c5cc: 910b4e73     	add	x19, x19, #0x2d3
 426c5d0: 17fffeee     	b	0x426c188 <_ChromeMain+0x4266eec>
 426c5d4: d4200020     	brk	#0x1
 426c5d8: 97729dea     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 426c5dc: 94266691     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 426c5e0: b201f3f4     	mov	x20, #-0x5555555555555556 ; =-6148914691236517206
 426c5e4: f2955574     	movk	x20, #0xaaab
 426c5e8: d2800000     	mov	x0, #0x0                ; =0
 426c5ec: 17fffec5     	b	0x426c100 <_ChromeMain+0x4266e64>
 426c5f0: b201f3f4     	mov	x20, #-0x5555555555555556 ; =-6148914691236517206
 426c5f4: f2955574     	movk	x20, #0xaaab
 426c5f8: 92f00000     	mov	x0, #0x7fffffffffffffff ; =9223372036854775807
 426c5fc: 17fffec1     	b	0x426c100 <_ChromeMain+0x4266e64>
 426c600: d2800000     	mov	x0, #0x0                ; =0
 426c604: 17ffff33     	b	0x426c2d0 <_ChromeMain+0x4267034>
 426c608: d2800000     	mov	x0, #0x0                ; =0
 426c60c: 17ffffbe     	b	0x426c504 <_ChromeMain+0x4267268>
