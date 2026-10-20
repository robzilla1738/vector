
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45e9000: 540000e3     	b.lo	0x45e901c <_ChromeMain+0x45e3d80>
 45e9004: d004cae8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 45e9008: 3dc27900     	ldr	q0, [x8, #0x9e0]
 45e900c: 3d800f60     	str	q0, [x27, #0x30]
 45e9010: 9104c3e0     	add	x0, sp, #0x130
 45e9014: 910383e1     	add	x1, sp, #0xe0
 45e9018: 96f79028     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e901c: f9401a68     	ldr	x8, [x19, #0x30]
 45e9020: d107c109     	sub	x9, x8, #0x1f0
 45e9024: f100011f     	cmp	x8, #0x0
 45e9028: 9a8903e0     	csel	x0, xzr, x9, eq
 45e902c: 97ff0c56     	bl	0x45ac184 <_ChromeMain+0x45a6ee8>
 45e9030: b94137e8     	ldr	w8, [sp, #0x134]
 45e9034: b9413fe9     	ldr	w9, [sp, #0x13c]
 45e9038: 0b080134     	add	w20, w9, w8
 45e903c: 350002e0     	cbnz	w0, 0x45e9098 <_ChromeMain+0x45e3dfc>
 45e9040: 528005a0     	mov	w0, #0x2d               ; =45
 45e9044: 96fc6a1f     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45e9048: b85443a8     	ldur	w8, [x29, #-0xbc]
 45e904c: 0b080008     	add	w8, w0, w8
 45e9050: 4b080288     	sub	w8, w20, w8
 45e9054: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e9058: d10303a0     	sub	x0, x29, #0xc0
 45e905c: 910383e1     	add	x1, sp, #0xe0
 45e9060: 96f78fd2     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9064: 5280001a     	mov	w26, #0x0               ; =0
 45e9068: b9001bff     	str	wzr, [sp, #0x18]
 45e906c: f9403a61     	ldr	x1, [x19, #0x70]
 45e9070: f9409e68     	ldr	x8, [x19, #0x138]
 45e9074: b9403508     	ldr	w8, [x8, #0x34]
 45e9078: 7100091f     	cmp	w8, #0x2
 45e907c: 52802008     	mov	w8, #0x100              ; =256
 45e9080: 9a881503     	cinc	x3, x8, eq
 45e9084: 9104c3e2     	add	x2, sp, #0x130
 45e9088: aa1503e0     	mov	x0, x21
 45e908c: 97035c32     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e9090: f9401a68     	ldr	x8, [x19, #0x30]
 45e9094: 17fffade     	b	0x45e7c0c <_ChromeMain+0x45e2970>
 45e9098: b85443a8     	ldur	w8, [x29, #-0xbc]
 45e909c: 4b080288     	sub	w8, w20, w8
 45e90a0: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e90a4: d10303a0     	sub	x0, x29, #0xc0
 45e90a8: 910383e1     	add	x1, sp, #0xe0
 45e90ac: 96f78fbf     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e90b0: 385403a8     	ldurb	w8, [x29, #-0xc0]
 45e90b4: b9001be8     	str	w8, [sp, #0x18]
 45e90b8: d10303a9     	sub	x9, x29, #0xc0
 45e90bc: f8401128     	ldur	x8, [x9, #0x1]
 45e90c0: f9001d28     	str	x8, [x9, #0x38]
 45e90c4: f9400528     	ldr	x8, [x9, #0x8]
 45e90c8: f803f128     	stur	x8, [x9, #0x3f]
 45e90cc: 4f000480     	movi.4s	v0, #0x4
 45e90d0: 3d800f60     	str	q0, [x27, #0x30]
 45e90d4: d10303a0     	sub	x0, x29, #0xc0
 45e90d8: 910383e1     	add	x1, sp, #0xe0
 45e90dc: 96f78fb3     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e90e0: 5280003a     	mov	w26, #0x1               ; =1
 45e90e4: 17ffffe2     	b	0x45e906c <_ChromeMain+0x45e3dd0>
 45e90e8: ad418760     	ldp	q0, q1, [x27, #0x30]
 45e90ec: 3d803760     	str	q0, [x27, #0xd0]
 45e90f0: d10303a8     	sub	x8, x29, #0xc0
 45e90f4: 3d800101     	str	q1, [x8]
 45e90f8: f9405e60     	ldr	x0, [x19, #0xb8]
 45e90fc: f9425001     	ldr	x1, [x0, #0x4a0]
 45e9100: b60005c1     	tbz	x1, #0x20, 0x45e91b8 <_ChromeMain+0x45e3f1c>
 45e9104: b90153ff     	str	wzr, [sp, #0x150]
 45e9108: 6f00e400     	movi.2d	v0, #0000000000000000
 45e910c: ad040360     	stp	q0, q0, [x27, #0x80]
 45e9110: 9104c3f7     	add	x23, sp, #0x130
 45e9114: 9104c3e8     	add	x8, sp, #0x130
 45e9118: 910563e0     	add	x0, sp, #0x158
 45e911c: 94000279     	bl	0x45e9b00 <_ChromeMain+0x45e4864>
 45e9120: 394543e8     	ldrb	w8, [sp, #0x150]
 45e9124: 36000488     	tbz	w8, #0x0, 0x45e91b4 <_ChromeMain+0x45e3f18>
 45e9128: f9405e60     	ldr	x0, [x19, #0xb8]
 45e912c: 94001522     	bl	0x45ee5b4 <_ChromeMain+0x45e9318>
 45e9130: 4ea01c08     	mov.16b	v8, v0
 45e9134: f9405e68     	ldr	x8, [x19, #0xb8]
 45e9138: 9112f109     	add	x9, x8, #0x4bc
 45e913c: 9112a10a     	add	x10, x8, #0x4a8
 45e9140: 9112c10b     	add	x11, x8, #0x4b0
 45e9144: 3952e10c     	ldrb	w12, [x8, #0x4b8]
 45e9148: b27d02ed     	orr	x13, x23, #0x8
 45e914c: 7200019f     	tst	w12, #0x1
 45e9150: 9a8d116b     	csel	x11, x11, x13, ne
 45e9154: f940016b     	ldr	x11, [x11]
 45e9158: 9a97114a     	csel	x10, x10, x23, ne
 45e915c: f940014a     	ldr	x10, [x10]
 45e9160: a9072f6a     	stp	x10, x11, [x27, #0x70]
 45e9164: 9113110a     	add	x10, x8, #0x4c4
 45e9168: 39533108     	ldrb	w8, [x8, #0x4cc]
 45e916c: 910042eb     	add	x11, x23, #0x10
 45e9170: 910062ec     	add	x12, x23, #0x18
 45e9174: 7200011f     	tst	w8, #0x1
 45e9178: 9a8c1148     	csel	x8, x10, x12, ne
 45e917c: f9400108     	ldr	x8, [x8]
 45e9180: 9a8b1129     	csel	x9, x9, x11, ne
 45e9184: f9400129     	ldr	x9, [x9]
 45e9188: a9062369     	stp	x9, x8, [x27, #0x60]
 45e918c: 910483e0     	add	x0, sp, #0x120
 45e9190: 910383e1     	add	x1, sp, #0xe0
 45e9194: 9781d05c     	bl	0x265d304 <_ChromeMain+0x2658068>
 45e9198: a90d0760     	stp	x0, x1, [x27, #0xd0]
 45e919c: 910443e0     	add	x0, sp, #0x110
 45e91a0: 91004281     	add	x1, x20, #0x10
 45e91a4: 4ea81d00     	mov.16b	v0, v8
 45e91a8: 9781d057     	bl	0x265d304 <_ChromeMain+0x2658068>
 45e91ac: d10303a8     	sub	x8, x29, #0xc0
 45e91b0: a9000500     	stp	x0, x1, [x8]
 45e91b4: f9405e60     	ldr	x0, [x19, #0xb8]
 45e91b8: b85443a8     	ldur	w8, [x29, #-0xbc]
 45e91bc: b85043a9     	ldur	w9, [x29, #-0xfc]
 45e91c0: 4b090108     	sub	w8, w8, w9
 45e91c4: 0aa87d08     	bic	w8, w8, w8, asr #31
 45e91c8: b90013e8     	str	w8, [sp, #0x10]
 45e91cc: a94d0b61     	ldp	x1, x2, [x27, #0xd0]
 45e91d0: d10303a8     	sub	x8, x29, #0xc0
 45e91d4: a9401103     	ldp	x3, x4, [x8]
 45e91d8: 94001532     	bl	0x45ee6a0 <_ChromeMain+0x45e9404>
 45e91dc: 52802023     	mov	w3, #0x101              ; =257
 45e91e0: f9405e61     	ldr	x1, [x19, #0xb8]
 45e91e4: 14000003     	b	0x45e91f0 <_ChromeMain+0x45e3f54>
 45e91e8: b90013ff     	str	wzr, [sp, #0x10]
 45e91ec: 52802003     	mov	w3, #0x100              ; =256
 45e91f0: d103c3a2     	sub	x2, x29, #0xf0
 45e91f4: aa1503e0     	mov	x0, x21
 45e91f8: 97035bd7     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e91fc: f9401a68     	ldr	x8, [x19, #0x30]
 45e9200: 17fffb0d     	b	0x45e7e34 <_ChromeMain+0x45e2b98>
 45e9204: a90d7f7f     	stp	xzr, xzr, [x27, #0xd0]
 45e9208: 39472028     	ldrb	w8, [x1, #0x1c8]
 45e920c: 34fffee8     	cbz	w8, 0x45e91e8 <_ChromeMain+0x45e3f4c>
 45e9210: 9100e388     	add	x8, x28, #0x38
 45e9214: d10303a9     	sub	x9, x29, #0xc0
 45e9218: 3dc00120     	ldr	q0, [x9]
 45e921c: 3d803360     	str	q0, [x27, #0xc0]
 45e9220: d10403a9     	sub	x9, x29, #0x100
 45e9224: a90aa369     	stp	x9, x8, [x27, #0xa8]
 45e9228: f9005f73     	str	x19, [x27, #0xb8]
 45e922c: f941b821     	ldr	x1, [x1, #0x370]
 45e9230: b6004101     	tbz	x1, #0x20, 0x45e9a50 <_ChromeMain+0x45e47b4>
 45e9234: b90103ff     	str	wzr, [sp, #0x100]
 45e9238: 6f00e400     	movi.2d	v0, #0000000000000000
 45e923c: ad018360     	stp	q0, q0, [x27, #0x30]
 45e9240: 910383f4     	add	x20, sp, #0xe0
 45e9244: 910383e8     	add	x8, sp, #0xe0
 45e9248: 910563e0     	add	x0, sp, #0x158
 45e924c: 9400022d     	bl	0x45e9b00 <_ChromeMain+0x45e4864>
 45e9250: 394403e8     	ldrb	w8, [sp, #0x100]
 45e9254: 3707f4a8     	tbnz	w8, #0x0, 0x45e90e8 <_ChromeMain+0x45e3e4c>
 45e9258: b90013ff     	str	wzr, [sp, #0x10]
 45e925c: 52802003     	mov	w3, #0x100              ; =256
 45e9260: 17ffffe0     	b	0x45e91e0 <_ChromeMain+0x45e3f44>
 45e9264: b900e3ea     	str	w10, [sp, #0xe0]
 45e9268: 9105026c     	add	x12, x19, #0x140
 45e926c: b941426d     	ldr	w13, [x19, #0x140]
 45e9270: 6b0a01bf     	cmp	w13, w10
 45e9274: 1a8ab1ae     	csel	w14, w13, w10, lt
 45e9278: 1a8ac1aa     	csel	w10, w13, w10, gt
 45e927c: 910383ed     	add	x13, sp, #0xe0
 45e9280: 9a8dc18f     	csel	x15, x12, x13, gt
 45e9284: 9a8cc1ac     	csel	x12, x13, x12, gt
 45e9288: 6b09015f     	cmp	w10, w9
 45e928c: 9104c3ea     	add	x10, sp, #0x130
 45e9290: 9a8ab1ea     	csel	x10, x15, x10, lt
 45e9294: 6b0e013f     	cmp	w9, w14
 45e9298: 9a8ab189     	csel	x9, x12, x10, lt
 45e929c: b9400129     	ldr	w9, [x9]
 45e92a0: b90133e9     	str	w9, [sp, #0x130]
 45e92a4: 14000023     	b	0x45e9330 <_ChromeMain+0x45e4094>
 45e92a8: f9401fea     	ldr	x10, [sp, #0x38]
 45e92ac: b9403548     	ldr	w8, [x10, #0x34]
 45e92b0: 7100051f     	cmp	w8, #0x1
 45e92b4: 54001141     	b.ne	0x45e94dc <_ChromeMain+0x45e4240>
 45e92b8: 39683028     	ldrb	w8, [x1, #0xa0c]
 45e92bc: b940614b     	ldr	w11, [x10, #0x60]
 45e92c0: b9403f89     	ldr	w9, [x28, #0x3c]
 45e92c4: 7100017f     	cmp	w11, #0x0
 45e92c8: aa0a03ed     	mov	x13, x10
 45e92cc: 1a9fc138     	csel	w24, w9, wzr, gt
 45e92d0: b948c82a     	ldr	w10, [x1, #0x8c8]
 45e92d4: 4b09014c     	sub	w12, w10, w9
 45e92d8: 0aac7d8c     	bic	w12, w12, w12, asr #31
 45e92dc: 1e630180     	ucvtf	d0, w12
 45e92e0: fd403da1     	ldr	d1, [x13, #0x78]
 45e92e4: 1e600820     	fmul	d0, d1, d0
 45e92e8: 1e78000c     	fcvtzs	w12, d0
 45e92ec: 0b0c0129     	add	w9, w9, w12
 45e92f0: b90133e9     	str	w9, [sp, #0x130]
 45e92f4: 340000e8     	cbz	w8, 0x45e9310 <_ChromeMain+0x45e4074>
 45e92f8: f9442429     	ldr	x9, [x1, #0x848]
 45e92fc: b9409529     	ldr	w9, [x9, #0x94]
 45e9300: 5280230c     	mov	w12, #0x118             ; =280
 45e9304: 7104613f     	cmp	w9, #0x118
 45e9308: 1a8cc129     	csel	w9, w9, w12, gt
 45e930c: b90133e9     	str	w9, [sp, #0x130]
 45e9310: f9401fed     	ldr	x13, [sp, #0x38]
 45e9314: f9402dac     	ldr	x12, [x13, #0x58]
 45e9318: d0051494     	adrp	x20, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e931c: 910a6294     	add	x20, x20, #0x298
 45e9320: eb14019f     	cmp	x12, x20
 45e9324: 54fffa00     	b.eq	0x45e9264 <_ChromeMain+0x45e3fc8>
 45e9328: b9014269     	str	w9, [x19, #0x140]
 45e932c: b94061ab     	ldr	w11, [x13, #0x60]
 45e9330: 29682bac     	ldp	w12, w10, [x29, #-0xc0]
 45e9334: 1e270180     	fmov	s0, w12
 45e9338: 0b0a016a     	add	w10, w11, w10
 45e933c: b854c3ad     	ldur	w13, [x29, #-0xb4]
 45e9340: 4b0b01ab     	sub	w11, w13, w11
 45e9344: 4e0c1d40     	mov.s	v0[1], w10
 45e9348: 1e270121     	fmov	s1, w9
 45e934c: 4e0c1d61     	mov.s	v1[1], w11
 45e9350: 29242bac     	stp	w12, w10, [x29, #-0xe0]
 45e9354: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e9358: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e935c: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9360: 0ea16400     	smax.2s	v0, v0, v1
 45e9364: fd007760     	str	d0, [x27, #0xe8]
 45e9368: 340006a8     	cbz	w8, 0x45e943c <_ChromeMain+0x45e41a0>
 45e936c: f9401fe8     	ldr	x8, [sp, #0x38]
 45e9370: fd403d01     	ldr	d1, [x8, #0x78]
 45e9374: 6f00e402     	movi.2d	v2, #0000000000000000
 45e9378: 1e6e1003     	fmov	d3, #1.00000000
 45e937c: d503201f     	nop
 45e9380: 1e632020     	fcmp	d1, d3
 45e9384: 1e61cc64     	fcsel	d4, d3, d1, gt
 45e9388: 1e602028     	fcmp	d1, #0.0
 45e938c: 11002128     	add	w8, w9, #0x8
 45e9390: 1e620101     	scvtf	d1, w8
 45e9394: 1e644c42     	fcsel	d2, d2, d4, mi
 45e9398: 1e623862     	fsub	d2, d3, d2
 45e939c: 1e610841     	fmul	d1, d2, d1
 45e93a0: 1e664021     	frinta	d1, d1
 45e93a4: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 45e93a8: 9e670102     	fmov	d2, x8
 45e93ac: 1e622020     	fcmp	d1, d2
 45e93b0: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e93b4: 1a88b3e9     	csel	w9, wzr, w8, lt
 45e93b8: 1e626822     	fmaxnm	d2, d1, d2
 45e93bc: 1e78004b     	fcvtzs	w11, d2
 45e93c0: d004cb0d     	adrp	x13, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45e93c4: fd4665a2     	ldr	d2, [x13, #0xcc8]
 45e93c8: 1e622020     	fcmp	d1, d2
 45e93cc: 1a899169     	csel	w9, w11, w9, ls
 45e93d0: 1100218b     	add	w11, w12, #0x8
 45e93d4: 4b09016c     	sub	w12, w11, w9
 45e93d8: 1e270161     	fmov	s1, w11
 45e93dc: 1100214a     	add	w10, w10, #0x8
 45e93e0: 0e0c3c0b     	mov.s	w11, v0[1]
 45e93e4: 2b0b014b     	adds	w11, w10, w11
 45e93e8: 1a8b6108     	csel	w8, w8, w11, vs
 45e93ec: 6b0a0108     	subs	w8, w8, w10
 45e93f0: 131f7d0b     	asr	w11, w8, #31
 45e93f4: 5201016b     	eor	w11, w11, #0x80000000
 45e93f8: 1a886168     	csel	w8, w11, w8, vs
 45e93fc: 4e0c1d01     	mov.s	v1[1], w8
 45e9400: d2b00008     	mov	x8, #0x80000000         ; =2147483648
 45e9404: f2c00208     	movk	x8, #0x10, lsl #32
 45e9408: 9e670102     	fmov	d2, x8
 45e940c: 0ea26421     	smax.2s	v1, v1, v2
 45e9410: 0f000602     	movi.2s	v2, #0x10
 45e9414: 4e041d22     	mov.s	v2[0], w9
 45e9418: 2ea28421     	sub.2s	v1, v1, v2
 45e941c: 29242bac     	stp	w12, w10, [x29, #-0xe0]
 45e9420: 4e0c1d40     	mov.s	v0[1], w10
 45e9424: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e9428: 4e0c1d41     	mov.s	v1[1], w10
 45e942c: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e9430: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9434: 0ea16400     	smax.2s	v0, v0, v1
 45e9438: fd007760     	str	d0, [x27, #0xe8]
 45e943c: f9401ff7     	ldr	x23, [sp, #0x38]
 45e9440: b94032e8     	ldr	w8, [x23, #0x30]
 45e9444: 71000d1f     	cmp	w8, #0x3
 45e9448: 54000121     	b.ne	0x45e946c <_ChromeMain+0x45e41d0>
 45e944c: 39424ee8     	ldrb	w8, [x23, #0x93]
 45e9450: 340000e8     	cbz	w8, 0x45e946c <_ChromeMain+0x45e41d0>
 45e9454: 9004ca88     	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 45e9458: 3dc28d00     	ldr	q0, [x8, #0xa30]
 45e945c: 3d800f60     	str	q0, [x27, #0x30]
 45e9460: d10383a0     	sub	x0, x29, #0xe0
 45e9464: 910383e1     	add	x1, sp, #0xe0
 45e9468: 96f78f14     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e946c: b9403f88     	ldr	w8, [x28, #0x3c]
 45e9470: b85483a9     	ldur	w9, [x29, #-0xb8]
 45e9474: 6b08013f     	cmp	w9, w8
 45e9478: 1a88b128     	csel	w8, w9, w8, lt
 45e947c: d3607d08     	lsl	x8, x8, #32
 45e9480: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e9484: d10303a0     	sub	x0, x29, #0xc0
 45e9488: 910383e1     	add	x1, sp, #0xe0
 45e948c: 96f78ec7     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9490: f9402ee8     	ldr	x8, [x23, #0x58]
 45e9494: b4000348     	cbz	x8, 0x45e94fc <_ChromeMain+0x45e4260>
 45e9498: eb14011f     	cmp	x8, x20
 45e949c: d0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45e94a0: 910a8129     	add	x9, x9, #0x2a0
 45e94a4: fa491104     	ccmp	x8, x9, #0x4, ne
 45e94a8: 1a9f17e8     	cset	w8, eq
 45e94ac: b9002fe8     	str	w8, [sp, #0x2c]
 45e94b0: a9037f7f     	stp	xzr, xzr, [x27, #0x30]
 45e94b4: d10343a0     	sub	x0, x29, #0xd0
 45e94b8: 910383e1     	add	x1, sp, #0xe0
 45e94bc: 96f78eff     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e94c0: f9409e68     	ldr	x8, [x19, #0x138]
 45e94c4: b9403508     	ldr	w8, [x8, #0x34]
 45e94c8: 7100051f     	cmp	w8, #0x1
 45e94cc: 52802008     	mov	w8, #0x100              ; =256
 45e94d0: 9a881503     	cinc	x3, x8, eq
 45e94d4: f9403e61     	ldr	x1, [x19, #0x78]
 45e94d8: 14000004     	b	0x45e94e8 <_ChromeMain+0x45e424c>
 45e94dc: 52800018     	mov	w24, #0x0               ; =0
 45e94e0: b9002fff     	str	wzr, [sp, #0x2c]
 45e94e4: 52802003     	mov	w3, #0x100              ; =256
 45e94e8: d10383a2     	sub	x2, x29, #0xe0
 45e94ec: aa1503e0     	mov	x0, x21
 45e94f0: 97035b19     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e94f4: f9401a68     	ldr	x8, [x19, #0x30]
 45e94f8: 17fff9d4     	b	0x45e7c48 <_ChromeMain+0x45e29ac>
 45e94fc: b9403f88     	ldr	w8, [x28, #0x3c]
 45e9500: d3607d08     	lsl	x8, x8, #32
 45e9504: a9037f68     	stp	x8, xzr, [x27, #0x30]
 45e9508: d10343a0     	sub	x0, x29, #0xd0
 45e950c: 910383e1     	add	x1, sp, #0xe0
 45e9510: 96f78eea     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e9514: b9002fff     	str	wzr, [sp, #0x2c]
 45e9518: 17ffffea     	b	0x45e94c0 <_ChromeMain+0x45e4224>
 45e951c: 52800018     	mov	w24, #0x0               ; =0
 45e9520: 17fffbac     	b	0x45e83d0 <_ChromeMain+0x45e3134>
 45e9524: b0051880     	adrp	x0, 0xe8fa000 <dyld_stub_binder+0xe8fa000>
 45e9528: 91180000     	add	x0, x0, #0x600
 45e952c: 9728d61b     	bl	0x101ed98 <_ChromeMain+0x1019afc>
 45e9530: 17fff9d6     	b	0x45e7c88 <_ChromeMain+0x45e29ec>
 45e9534: 52800019     	mov	w25, #0x0               ; =0
 45e9538: 5280001a     	mov	w26, #0x0               ; =0
 45e953c: 14000017     	b	0x45e9598 <_ChromeMain+0x45e42fc>
 45e9540: b94492d7     	ldr	w23, [x22, #0x490]
 45e9544: b0054939     	adrp	x25, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45e9548: b947ab20     	ldr	w0, [x25, #0x7a8]
 45e954c: 34002100     	cbz	w0, 0x45e996c <_ChromeMain+0x45e46d0>
 45e9550: 710006ff     	cmp	w23, #0x1
 45e9554: 1a9f17e8     	cset	w8, eq
 45e9558: 7100041f     	cmp	w0, #0x1
 45e955c: 1a9f17e9     	cset	w9, eq
 45e9560: 4a090117     	eor	w23, w8, w9
 45e9564: aa1603e0     	mov	x0, x22
 45e9568: 94c42295     	bl	0x76f1fbc <_ChromeMain+0x76ecd20>
 45e956c: 4ea01c08     	mov.16b	v8, v0
 45e9570: b9404788     	ldr	w8, [x28, #0x44]
 45e9574: 7100051f     	cmp	w8, #0x1
 45e9578: 54fffdeb     	b.lt	0x45e9534 <_ChromeMain+0x45e4298>
 45e957c: 520002f9     	eor	w25, w23, #0x1
 45e9580: 1e6e1000     	fmov	d0, #1.00000000
 45e9584: 1e602100     	fcmp	d8, d0
 45e9588: 54000065     	b.pl	0x45e9594 <_ChromeMain+0x45e42f8>
 45e958c: 52800029     	mov	w9, #0x1                ; =1
 45e9590: 290527e9     	stp	w9, w9, [sp, #0x28]
 45e9594: aa1703fa     	mov	x26, x23
 45e9598: 1e620100     	scvtf	d0, w8
 45e959c: 1e600900     	fmul	d0, d8, d0
 45e95a0: 1e654000     	frintm	d0, d0
 45e95a4: d2f83c09     	mov	x9, #-0x3e20000000000000 ; =-4476578029606273024
 45e95a8: 9e670121     	fmov	d1, x9
 45e95ac: 1e612000     	fcmp	d0, d1
 45e95b0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45e95b4: 1e616801     	fmaxnm	d1, d0, d1
 45e95b8: 1e78002a     	fcvtzs	w10, d1
 45e95bc: 1a89b3e9     	csel	w9, wzr, w9, lt
 45e95c0: d004cb0b     	adrp	x11, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45e95c4: fd466561     	ldr	d1, [x11, #0xcc8]
 45e95c8: 1e612000     	fcmp	d0, d1
 45e95cc: 1a899156     	csel	w22, w10, w9, ls
 45e95d0: b85403a9     	ldur	w9, [x29, #-0xc0]
 45e95d4: 37000097     	tbnz	w23, #0x0, 0x45e95e4 <_ChromeMain+0x45e4348>
 45e95d8: 4b0802ca     	sub	w10, w22, w8
 45e95dc: 0b090149     	add	w9, w10, w9
 45e95e0: 14000004     	b	0x45e95f0 <_ChromeMain+0x45e4354>
 45e95e4: b85483aa     	ldur	w10, [x29, #-0xb8]
 45e95e8: 4b160129     	sub	w9, w9, w22
 45e95ec: 0b0a0129     	add	w9, w9, w10
 45e95f0: b85443aa     	ldur	w10, [x29, #-0xbc]
 45e95f4: b854c3ab     	ldur	w11, [x29, #-0xb4]
 45e95f8: 4b14014a     	sub	w10, w10, w20
 45e95fc: 0b0b014a     	add	w10, w10, w11
 45e9600: 1e270120     	fmov	s0, w9
 45e9604: b90133e9     	str	w9, [sp, #0x130]
 45e9608: b90137f4     	str	w20, [sp, #0x134]
 45e960c: 4e0c1e80     	mov.s	v0[1], w20
 45e9610: 1e270101     	fmov	s1, w8
 45e9614: 4e0c1d41     	mov.s	v1[1], w10
 45e9618: 0ea10c01     	sqadd.2s	v1, v0, v1
 45e961c: 0ea02c20     	sqsub.2s	v0, v1, v0
 45e9620: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9624: 0ea16400     	smax.2s	v0, v0, v1
 45e9628: fd004760     	str	d0, [x27, #0x88]
 45e962c: f9406661     	ldr	x1, [x19, #0xc8]
 45e9630: b9404788     	ldr	w8, [x28, #0x44]
 45e9634: 7100011f     	cmp	w8, #0x0
 45e9638: 52802008     	mov	w8, #0x100              ; =256
 45e963c: 9a88d503     	cinc	x3, x8, gt
 45e9640: 9104c3e2     	add	x2, sp, #0x130
 45e9644: aa1503e0     	mov	x0, x21
 45e9648: 97035ac3     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e964c: b85483a8     	ldur	w8, [x29, #-0xb8]
 45e9650: 6b16011f     	cmp	w8, w22
 45e9654: 1a96b108     	csel	w8, w8, w22, lt
 45e9658: d3607d08     	lsl	x8, x8, #32
 45e965c: 710002ff     	cmp	w23, #0x0
 45e9660: 9a8813e9     	csel	x9, xzr, x8, ne
 45e9664: 9a9f1108     	csel	x8, x8, xzr, ne
 45e9668: a9032369     	stp	x9, x8, [x27, #0x30]
 45e966c: d10303a0     	sub	x0, x29, #0xc0
 45e9670: 910383e1     	add	x1, sp, #0xe0
 45e9674: 96f78e4d     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9678: 1e6e1000     	fmov	d0, #1.00000000
 45e967c: 1e602100     	fcmp	d8, d0
 45e9680: 54ff7681     	b.ne	0x45e8550 <_ChromeMain+0x45e32b4>
 45e9684: 710002ff     	cmp	w23, #0x0
 45e9688: 1a9613e8     	csel	w8, wzr, w22, ne
 45e968c: 6b0802c9     	subs	w9, w22, w8
 45e9690: 131f7d2a     	asr	w10, w9, #31
 45e9694: 5201014a     	eor	w10, w10, #0x80000000
 45e9698: 1a896149     	csel	w9, w10, w9, vs
 45e969c: d3607d29     	lsl	x9, x9, #32
 45e96a0: d3607d08     	lsl	x8, x8, #32
 45e96a4: a9032768     	stp	x8, x9, [x27, #0x30]
 45e96a8: d10343a0     	sub	x0, x29, #0xd0
 45e96ac: 910383e1     	add	x1, sp, #0xe0
 45e96b0: 96f78e82     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e96b4: 17fffba7     	b	0x45e8550 <_ChromeMain+0x45e32b4>
 45e96b8: f9409e69     	ldr	x9, [x19, #0x138]
 45e96bc: b9403129     	ldr	w9, [x9, #0x30]
 45e96c0: 7100093f     	cmp	w9, #0x2
 45e96c4: 1a9f1709     	csinc	w9, w24, wzr, ne
 45e96c8: 7100013f     	cmp	w9, #0x0
 45e96cc: 52800109     	mov	w9, #0x8                ; =8
 45e96d0: 9a9f1129     	csel	x9, x9, xzr, ne
 45e96d4: a9037f69     	stp	x9, xzr, [x27, #0x30]
 45e96d8: 910383e1     	add	x1, sp, #0xe0
 45e96dc: aa0803e0     	mov	x0, x8
 45e96e0: 95fffce7     	bl	0xc5e8a7c <_ChromeMain+0xc5e37e0>
 45e96e4: f9405a68     	ldr	x8, [x19, #0xb0]
 45e96e8: 17fffbbb     	b	0x45e85d4 <_ChromeMain+0x45e3338>
 45e96ec: b9404f88     	ldr	w8, [x28, #0x4c]
 45e96f0: 1e620100     	scvtf	d0, w8
 45e96f4: 1e600900     	fmul	d0, d8, d0
 45e96f8: 1e664000     	frinta	d0, d0
 45e96fc: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 45e9700: 9e670101     	fmov	d1, x8
 45e9704: 1e612000     	fcmp	d0, d1
 45e9708: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e970c: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e9710: 1e616801     	fmaxnm	d1, d0, d1
 45e9714: 1e780029     	fcvtzs	w9, d1
 45e9718: d004cb0a     	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45e971c: fd466541     	ldr	d1, [x10, #0xcc8]
 45e9720: 1e612000     	fcmp	d0, d1
 45e9724: 1a889128     	csel	w8, w9, w8, ls
 45e9728: 7100031f     	cmp	w24, #0x0
 45e972c: 1a9f1109     	csel	w9, w8, wzr, ne
 45e9730: 710002ff     	cmp	w23, #0x0
 45e9734: 1a8813ea     	csel	w10, wzr, w8, ne
 45e9738: 2b08012b     	adds	w11, w9, w8
 45e973c: 131f7d6c     	asr	w12, w11, #31
 45e9740: 5201018c     	eor	w12, w12, #0x80000000
 45e9744: 1a8b618b     	csel	w11, w12, w11, vs
 45e9748: 6b09016b     	subs	w11, w11, w9
 45e974c: 131f7d6c     	asr	w12, w11, #31
 45e9750: 5201018c     	eor	w12, w12, #0x80000000
 45e9754: 1a8b618b     	csel	w11, w12, w11, vs
 45e9758: 6b0a0108     	subs	w8, w8, w10
 45e975c: 131f7d0c     	asr	w12, w8, #31
 45e9760: 5201018c     	eor	w12, w12, #0x80000000
 45e9764: 1a886188     	csel	w8, w12, w8, vs
 45e9768: aa088168     	orr	x8, x11, x8, lsl #32
 45e976c: aa0a8129     	orr	x9, x9, x10, lsl #32
 45e9770: a90aa369     	stp	x9, x8, [x27, #0xa8]
 45e9774: d10303a0     	sub	x0, x29, #0xc0
 45e9778: 910563e1     	add	x1, sp, #0x158
 45e977c: 96f78e0b     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9780: b9402be8     	ldr	w8, [sp, #0x28]
 45e9784: 37000088     	tbnz	w8, #0x0, 0x45e9794 <_ChromeMain+0x45e44f8>
 45e9788: d10343a0     	sub	x0, x29, #0xd0
 45e978c: 910563e1     	add	x1, sp, #0x158
 45e9790: 96f78e4a     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e9794: 52802023     	mov	w3, #0x101              ; =257
 45e9798: 17fffaba     	b	0x45e8280 <_ChromeMain+0x45e2fe4>
 45e979c: 39104109     	strb	w9, [x8, #0x410]
 45e97a0: aa0803e0     	mov	x0, x8
 45e97a4: 52800021     	mov	w1, #0x1                ; =1
 45e97a8: 97011b33     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45e97ac: f9405a68     	ldr	x8, [x19, #0xb0]
 45e97b0: 17fffb87     	b	0x45e85cc <_ChromeMain+0x45e3330>
 45e97b4: 52800400     	mov	w0, #0x20               ; =32
 45e97b8: 96e896ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 45e97bc: f9001b60     	str	x0, [x27, #0x30]
 45e97c0: b004ca88     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45e97c4: 3dc2d100     	ldr	q0, [x8, #0xb40]
 45e97c8: 3c838360     	stur	q0, [x27, #0x38]
 45e97cc: 91005c09     	add	x9, x0, #0x17
 45e97d0: eb00013f     	cmp	x9, x0
 45e97d4: 54001663     	b.lo	0x45e9aa0 <_ChromeMain+0x45e4804>
 45e97d8: f004ad88     	adrp	x8, 0xdb9c000 <dyld_stub_binder+0xdb9c000>
 45e97dc: 91313108     	add	x8, x8, #0xc4c
 45e97e0: eb08013f     	cmp	x9, x8
 45e97e4: fa488002     	ccmp	x0, x8, #0x2, hi
 45e97e8: 540015c9     	b.ls	0x45e9aa0 <_ChromeMain+0x45e4804>
 45e97ec: 3dc00100     	ldr	q0, [x8]
 45e97f0: 3d800000     	str	q0, [x0]
 45e97f4: f840f108     	ldur	x8, [x8, #0xf]
 45e97f8: f800f008     	stur	x8, [x0, #0xf]
 45e97fc: 39005c1f     	strb	wzr, [x0, #0x17]
 45e9800: f0052ea0     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45e9804: 91050000     	add	x0, x0, #0x140
 45e9808: 910383e1     	add	x1, sp, #0xe0
 45e980c: 52800022     	mov	w2, #0x1                ; =1
 45e9810: 96f76e8c     	bl	0x3c5240 <_ChromeMain+0x3bffa4>
 45e9814: aa0003f6     	mov	x22, x0
 45e9818: 39c3dfe8     	ldrsb	w8, [sp, #0xf7]
 45e981c: 36f800a8     	tbz	w8, #0x1f, 0x45e9830 <_ChromeMain+0x45e4594>
 45e9820: f9401b60     	ldr	x0, [x27, #0x30]
 45e9824: f9402368     	ldr	x8, [x27, #0x40]
 45e9828: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45e982c: 96e87da3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45e9830: 36077816     	tbz	w22, #0x0, 0x45e8730 <_ChromeMain+0x45e3494>
 45e9834: f9404660     	ldr	x0, [x19, #0x88]
 45e9838: 95fffc94     	bl	0xc5e8a88 <_ChromeMain+0xc5e37ec>
 45e983c: aa0003f6     	mov	x22, x0
 45e9840: b0054934     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45e9844: b947aa80     	ldr	w0, [x20, #0x7a8]
 45e9848: 34000a60     	cbz	w0, 0x45e9994 <_ChromeMain+0x45e46f8>
 45e984c: 0ab67ec8     	bic	w8, w22, w22, asr #31
 45e9850: 1e230100     	ucvtf	s0, w8
 45e9854: 7100041f     	cmp	w0, #0x1
 45e9858: 54000061     	b.ne	0x45e9864 <_ChromeMain+0x45e45c8>
 45e985c: bd013be0     	str	s0, [sp, #0x138]
 45e9860: 17fffbb4     	b	0x45e8730 <_ChromeMain+0x45e3494>
 45e9864: bd013fe0     	str	s0, [sp, #0x13c]
 45e9868: 17fffbb2     	b	0x45e8730 <_ChromeMain+0x45e3494>
 45e986c: 6f00e400     	movi.2d	v0, #0000000000000000
 45e9870: f004cb08     	adrp	x8, 0xdf4c000 <dyld_stub_binder+0xdf4c000>
 45e9874: fd44a502     	ldr	d2, [x8, #0x948]
 45e9878: 1e622020     	fcmp	d1, d2
 45e987c: 54ff89ad     	b.le	0x45e89b0 <_ChromeMain+0x45e3714>
 45e9880: d004cb28     	adrp	x8, 0xdf4f000 <dyld_stub_binder+0xdf4f000>
 45e9884: fd435d00     	ldr	d0, [x8, #0x6b8]
 45e9888: 1e602820     	fadd	d0, d1, d0
 45e988c: d503201f     	nop
 45e9890: fd436101     	ldr	d1, [x8, #0x6c0]
 45e9894: 1e611800     	fdiv	d0, d0, d1
 45e9898: 17fffc45     	b	0x45e89ac <_ChromeMain+0x45e3710>
 45e989c: d280001a     	mov	x26, #0x0               ; =0
 45e98a0: 17fffa6c     	b	0x45e8250 <_ChromeMain+0x45e2fb4>
 45e98a4: b9002ff8     	str	w24, [sp, #0x2c]
 45e98a8: 17fff8e8     	b	0x45e7c48 <_ChromeMain+0x45e29ac>
 45e98ac: b90013e9     	str	w9, [sp, #0x10]
 45e98b0: 17fff961     	b	0x45e7e34 <_ChromeMain+0x45e2b98>
 45e98b4: aa1903fa     	mov	x26, x25
 45e98b8: 17fffb26     	b	0x45e8550 <_ChromeMain+0x45e32b4>
 45e98bc: 39012109     	strb	w9, [x8, #0x48]
 45e98c0: f9409100     	ldr	x0, [x8, #0x120]
 45e98c4: b4000f60     	cbz	x0, 0x45e9ab0 <_ChromeMain+0x45e4814>
 45e98c8: 96fede2d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e98cc: 17fffd61     	b	0x45e8e50 <_ChromeMain+0x45e3bb4>
 45e98d0: 39012109     	strb	w9, [x8, #0x48]
 45e98d4: f9409100     	ldr	x0, [x8, #0x120]
 45e98d8: b4000f20     	cbz	x0, 0x45e9abc <_ChromeMain+0x45e4820>
 45e98dc: 96fede28     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e98e0: 17fffd2a     	b	0x45e8d88 <_ChromeMain+0x45e3aec>
 45e98e4: 39012109     	strb	w9, [x8, #0x48]
 45e98e8: f9409100     	ldr	x0, [x8, #0x120]
 45e98ec: b4000ee0     	cbz	x0, 0x45e9ac8 <_ChromeMain+0x45e482c>
 45e98f0: 96fede23     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45e98f4: 17fffd42     	b	0x45e8dfc <_ChromeMain+0x45e3b60>
 45e98f8: 52800029     	mov	w9, #0x1                ; =1
 45e98fc: b90027e9     	str	w9, [sp, #0x24]
 45e9900: b9001bfa     	str	w26, [sp, #0x18]
 45e9904: 17fff8c2     	b	0x45e7c0c <_ChromeMain+0x45e2970>
 45e9908: d10303a8     	sub	x8, x29, #0xc0
 45e990c: f900011f     	str	xzr, [x8]
 45e9910: 910383e1     	add	x1, sp, #0xe0
 45e9914: d10303a2     	sub	x2, x29, #0xc0
 45e9918: 52800043     	mov	w3, #0x2                ; =2
 45e991c: 96f228db     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45e9920: 17fffb90     	b	0x45e8760 <_ChromeMain+0x45e34c4>
 45e9924: b004c708     	adrp	x8, 0xdeca000 <dyld_stub_binder+0xdeca000>
 45e9928: 912cbd08     	add	x8, x8, #0xb2f
 45e992c: f9008368     	str	x8, [x27, #0x100]
 45e9930: 910383e1     	add	x1, sp, #0xe0
 45e9934: d10303a2     	sub	x2, x29, #0xc0
 45e9938: 52800023     	mov	w3, #0x1                ; =1
 45e993c: 96f228d3     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45e9940: 17fff866     	b	0x45e7ad8 <_ChromeMain+0x45e283c>
 45e9944: 9745fd88     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45e9948: aa0003e8     	mov	x8, x0
 45e994c: 39402009     	ldrb	w9, [x0, #0x8]
 45e9950: 7100053f     	cmp	w9, #0x1
 45e9954: 54000341     	b.ne	0x45e99bc <_ChromeMain+0x45e4720>
 45e9958: 91005d00     	add	x0, x8, #0x17
 45e995c: 96ecc5e9     	bl	0x11b100 <_ChromeMain+0x115e64>
 45e9960: b907ab40     	str	w0, [x26, #0x7a8]
 45e9964: b9404397     	ldr	w23, [x28, #0x40]
 45e9968: 17fff9ae     	b	0x45e8020 <_ChromeMain+0x45e2d84>
 45e996c: 9745fd7e     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45e9970: aa0003e8     	mov	x8, x0
 45e9974: 39402009     	ldrb	w9, [x0, #0x8]
 45e9978: 7100053f     	cmp	w9, #0x1
 45e997c: 54000381     	b.ne	0x45e99ec <_ChromeMain+0x45e4750>
 45e9980: 91005d00     	add	x0, x8, #0x17
 45e9984: 96ecc5df     	bl	0x11b100 <_ChromeMain+0x115e64>
 45e9988: b907ab20     	str	w0, [x25, #0x7a8]
 45e998c: 17fffef1     	b	0x45e9550 <_ChromeMain+0x45e42b4>
 45e9990: 94e86a74     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 45e9994: 9745fd74     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45e9998: aa0003e8     	mov	x8, x0
 45e999c: 39402009     	ldrb	w9, [x0, #0x8]
 45e99a0: 7100053f     	cmp	w9, #0x1
 45e99a4: 54000681     	b.ne	0x45e9a74 <_ChromeMain+0x45e47d8>
 45e99a8: 91005d00     	add	x0, x8, #0x17
 45e99ac: 96ecc5d5     	bl	0x11b100 <_ChromeMain+0x115e64>
 45e99b0: b907aa80     	str	w0, [x20, #0x7a8]
 45e99b4: f9401bf7     	ldr	x23, [sp, #0x30]
 45e99b8: 17ffffa5     	b	0x45e984c <_ChromeMain+0x45e45b0>
 45e99bc: 90048fe0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45e99c0: 91299000     	add	x0, x0, #0xa64
 45e99c4: 7100093f     	cmp	w9, #0x2
 45e99c8: 540008a1     	b.ne	0x45e9adc <_ChromeMain+0x45e4840>
 45e99cc: f9401108     	ldr	x8, [x8, #0x20]
 45e99d0: f9400508     	ldr	x8, [x8, #0x8]
 45e99d4: f100011f     	cmp	x8, #0x0
 45e99d8: 9a880000     	csel	x0, x0, x8, eq
 45e99dc: 17ffffe0     	b	0x45e995c <_ChromeMain+0x45e46c0>
 45e99e0: d4200000     	brk	#0
 45e99e4: d4400000     	hlt	#0
 45e99e8: d4200020     	brk	#0x1
 45e99ec: 90048fe0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45e99f0: 91299000     	add	x0, x0, #0xa64
 45e99f4: 7100093f     	cmp	w9, #0x2
 45e99f8: 54000761     	b.ne	0x45e9ae4 <_ChromeMain+0x45e4848>
 45e99fc: f9401108     	ldr	x8, [x8, #0x20]
 45e9a00: f9400508     	ldr	x8, [x8, #0x8]
 45e9a04: f100011f     	cmp	x8, #0x0
 45e9a08: 9a880000     	csel	x0, x0, x8, eq
 45e9a0c: 17ffffde     	b	0x45e9984 <_ChromeMain+0x45e46e8>
 45e9a10: d4200000     	brk	#0
 45e9a14: d4400000     	hlt	#0
 45e9a18: d4200020     	brk	#0x1
 45e9a1c: d4200000     	brk	#0
 45e9a20: d4400000     	hlt	#0
 45e9a24: d4200020     	brk	#0x1
 45e9a28: 9110c2c0     	add	x0, x22, #0x430
 45e9a2c: 957bb4b5     	bl	0xa4d6d00 <_ChromeMain+0xa4d1a64>
 45e9a30: 52000018     	eor	w24, w0, #0x1
 45e9a34: 17fffa67     	b	0x45e83d0 <_ChromeMain+0x45e3134>
 45e9a38: d4200000     	brk	#0
 45e9a3c: d4400000     	hlt	#0
 45e9a40: d4200020     	brk	#0x1
 45e9a44: d4200000     	brk	#0
 45e9a48: d4400000     	hlt	#0
 45e9a4c: d4200020     	brk	#0x1
 45e9a50: d4200000     	brk	#0
 45e9a54: d4400000     	hlt	#0
 45e9a58: d4200020     	brk	#0x1
 45e9a5c: d4200000     	brk	#0
 45e9a60: d4400000     	hlt	#0
 45e9a64: d4200020     	brk	#0x1
 45e9a68: d4200000     	brk	#0
 45e9a6c: d4400000     	hlt	#0
 45e9a70: d4200020     	brk	#0x1
 45e9a74: 90048fe0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45e9a78: 91299000     	add	x0, x0, #0xa64
 45e9a7c: 7100093f     	cmp	w9, #0x2
 45e9a80: 540002a1     	b.ne	0x45e9ad4 <_ChromeMain+0x45e4838>
 45e9a84: f9401108     	ldr	x8, [x8, #0x20]
 45e9a88: f9400508     	ldr	x8, [x8, #0x8]
 45e9a8c: f100011f     	cmp	x8, #0x0
 45e9a90: 9a880000     	csel	x0, x0, x8, eq
 45e9a94: 17ffffc6     	b	0x45e99ac <_ChromeMain+0x45e4710>
 45e9a98: d4200000     	brk	#0
 45e9a9c: d4400000     	hlt	#0
 45e9aa0: d4200020     	brk	#0x1
 45e9aa4: d4200000     	brk	#0
 45e9aa8: d4400000     	hlt	#0
 45e9aac: d4200020     	brk	#0x1
 45e9ab0: d4200000     	brk	#0
 45e9ab4: d4400000     	hlt	#0
 45e9ab8: d4200020     	brk	#0x1
 45e9abc: d4200000     	brk	#0
 45e9ac0: d4400000     	hlt	#0
 45e9ac4: d4200020     	brk	#0x1
 45e9ac8: d4200000     	brk	#0
 45e9acc: d4400000     	hlt	#0
 45e9ad0: d4200020     	brk	#0x1
 45e9ad4: 34fff6c9     	cbz	w9, 0x45e99ac <_ChromeMain+0x45e4710>
 45e9ad8: 14000002     	b	0x45e9ae0 <_ChromeMain+0x45e4844>
 45e9adc: 34fff409     	cbz	w9, 0x45e995c <_ChromeMain+0x45e46c0>
 45e9ae0: 94e9b0d9     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
 45e9ae4: 34fff509     	cbz	w9, 0x45e9984 <_ChromeMain+0x45e46e8>
 45e9ae8: 17fffffe     	b	0x45e9ae0 <_ChromeMain+0x45e4844>
 45e9aec: d503201f     	nop
 45e9af0: d503201f     	nop
 45e9af4: d503201f     	nop
 45e9af8: d503201f     	nop
 45e9afc: d503201f     	nop
 45e9b00: d10143ff     	sub	sp, sp, #0x50
 45e9b04: a9015ff8     	stp	x24, x23, [sp, #0x10]
 45e9b08: a90257f6     	stp	x22, x21, [sp, #0x20]
 45e9b0c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 45e9b10: a9047bfd     	stp	x29, x30, [sp, #0x40]
 45e9b14: 910103fd     	add	x29, sp, #0x40
 45e9b18: aa0103f5     	mov	x21, x1
 45e9b1c: aa0003f6     	mov	x22, x0
 45e9b20: aa0803f3     	mov	x19, x8
 45e9b24: f9400808     	ldr	x8, [x0, #0x10]
 45e9b28: 6f00e400     	movi.2d	v0, #0000000000000000
 45e9b2c: aa1303f4     	mov	x20, x19
 45e9b30: 3c810e80     	str	q0, [x20, #0x10]!
 45e9b34: 3d800260     	str	q0, [x19]
 45e9b38: b900227f     	str	wzr, [x19, #0x20]
 45e9b3c: f9400009     	ldr	x9, [x0]
 45e9b40: 3dc00120     	ldr	q0, [x9]
 45e9b44: 3d800280     	str	q0, [x20]
 45e9b48: 7100043f     	cmp	w1, #0x1
 45e9b4c: 54000429     	b.ls	0x45e9bd0 <_ChromeMain+0x45e4934>
 45e9b50: b9400d21     	ldr	w1, [x9, #0xc]
 45e9b54: 0b417c29     	add	w9, w1, w1, lsr #31
 45e9b58: 13017d2a     	asr	w10, w9, #1
 45e9b5c: 0aa97d57     	bic	w23, w10, w9, asr #31
 45e9b60: f9405d00     	ldr	x0, [x8, #0xb8]
 45e9b64: 95fffcce     	bl	0xc5e8e9c <_ChromeMain+0xc5e3c00>
 45e9b68: 6b0002ff     	cmp	w23, w0
 45e9b6c: 1a80b2e8     	csel	w8, w23, w0, lt
 45e9b70: 7100051f     	cmp	w8, #0x1
 45e9b74: 5400088b     	b.lt	0x45e9c84 <_ChromeMain+0x45e49e8>
 45e9b78: f94002cb     	ldr	x11, [x22]
 45e9b7c: 29402969     	ldp	w9, w10, [x11]
 45e9b80: 71000abf     	cmp	w21, #0x2
 45e9b84: 54000080     	b.eq	0x45e9b94 <_ChromeMain+0x45e48f8>
 45e9b88: b9400d6c     	ldr	w12, [x11, #0xc]
 45e9b8c: 4b08014a     	sub	w10, w10, w8
 45e9b90: 0b0c014a     	add	w10, w10, w12
 45e9b94: bd400960     	ldr	s0, [x11, #0x8]
 45e9b98: 1e270121     	fmov	s1, w9
 45e9b9c: 4e0c1d41     	mov.s	v1[1], w10
 45e9ba0: 4e0c1d00     	mov.s	v0[1], w8
 45e9ba4: 29002a69     	stp	w9, w10, [x19]
 45e9ba8: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e9bac: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e9bb0: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9bb4: 0ea16400     	smax.2s	v0, v0, v1
 45e9bb8: fd000660     	str	d0, [x19, #0x8]
 45e9bbc: 11002108     	add	w8, w8, #0x8
 45e9bc0: 71000abf     	cmp	w21, #0x2
 45e9bc4: 1a9f0109     	csel	w9, w8, wzr, eq
 45e9bc8: 4b090108     	sub	w8, w8, w9
 45e9bcc: 14000028     	b	0x45e9c6c <_ChromeMain+0x45e49d0>
 45e9bd0: b9400921     	ldr	w1, [x9, #0x8]
 45e9bd4: f94006c9     	ldr	x9, [x22, #0x8]
 45e9bd8: b9401129     	ldr	w9, [x9, #0x10]
 45e9bdc: 4b090029     	sub	w9, w1, w9
 45e9be0: 51002129     	sub	w9, w9, #0x8
 45e9be4: 0aa97d37     	bic	w23, w9, w9, asr #31
 45e9be8: f9405d00     	ldr	x0, [x8, #0xb8]
 45e9bec: 95fffcac     	bl	0xc5e8e9c <_ChromeMain+0xc5e3c00>
 45e9bf0: 6b0002ff     	cmp	w23, w0
 45e9bf4: 1a80b2e8     	csel	w8, w23, w0, lt
 45e9bf8: 7100051f     	cmp	w8, #0x1
 45e9bfc: 5400044b     	b.lt	0x45e9c84 <_ChromeMain+0x45e49e8>
 45e9c00: f94002ca     	ldr	x10, [x22]
 45e9c04: b9400149     	ldr	w9, [x10]
 45e9c08: 34000095     	cbz	w21, 0x45e9c18 <_ChromeMain+0x45e497c>
 45e9c0c: b940094b     	ldr	w11, [x10, #0x8]
 45e9c10: 4b080129     	sub	w9, w9, w8
 45e9c14: 0b0b0129     	add	w9, w9, w11
 45e9c18: b940054b     	ldr	w11, [x10, #0x4]
 45e9c1c: 9100314a     	add	x10, x10, #0xc
 45e9c20: 1e270100     	fmov	s0, w8
 45e9c24: 0d409140     	ld1.s	{ v0 }[1], [x10]
 45e9c28: 1e270121     	fmov	s1, w9
 45e9c2c: 29002e69     	stp	w9, w11, [x19]
 45e9c30: 4e0c1d61     	mov.s	v1[1], w11
 45e9c34: 0ea00c20     	sqadd.2s	v0, v1, v0
 45e9c38: 0ea12c00     	sqsub.2s	v0, v0, v1
 45e9c3c: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9c40: 0ea16400     	smax.2s	v0, v0, v1
 45e9c44: fd000660     	str	d0, [x19, #0x8]
 45e9c48: 11002108     	add	w8, w8, #0x8
 45e9c4c: 710002bf     	cmp	w21, #0x0
 45e9c50: 1a9f0109     	csel	w9, w8, wzr, eq
 45e9c54: 6b090108     	subs	w8, w8, w9
 45e9c58: 131f7d0a     	asr	w10, w8, #31
 45e9c5c: 5201014a     	eor	w10, w10, #0x80000000
 45e9c60: 1a886148     	csel	w8, w10, w8, vs
 45e9c64: d3607d08     	lsl	x8, x8, #32
 45e9c68: d3607d29     	lsl	x9, x9, #32
 45e9c6c: a90023e9     	stp	x9, x8, [sp]
 45e9c70: 910003e1     	mov	x1, sp
 45e9c74: aa1403e0     	mov	x0, x20
 45e9c78: 96f78d10     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e9c7c: 52800028     	mov	w8, #0x1                ; =1
 45e9c80: 39008268     	strb	w8, [x19, #0x20]
 45e9c84: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 45e9c88: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 45e9c8c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 45e9c90: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 45e9c94: 910143ff     	add	sp, sp, #0x50
 45e9c98: d65f03c0     	ret
 45e9c9c: d503201f     	nop
 45e9ca0: d503201f     	nop
 45e9ca4: d503201f     	nop
 45e9ca8: d503201f     	nop
 45e9cac: d503201f     	nop
 45e9cb0: d503201f     	nop
 45e9cb4: d503201f     	nop
 45e9cb8: d503201f     	nop
 45e9cbc: d503201f     	nop
 45e9cc0: d102c3ff     	sub	sp, sp, #0xb0
 45e9cc4: 6d0423e9     	stp	d9, d8, [sp, #0x40]
 45e9cc8: a9056ffc     	stp	x28, x27, [sp, #0x50]
 45e9ccc: a90667fa     	stp	x26, x25, [sp, #0x60]
 45e9cd0: a9075ff8     	stp	x24, x23, [sp, #0x70]
 45e9cd4: a90857f6     	stp	x22, x21, [sp, #0x80]
 45e9cd8: a9094ff4     	stp	x20, x19, [sp, #0x90]
 45e9cdc: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 45e9ce0: 910283fd     	add	x29, sp, #0xa0
 45e9ce4: aa0303f6     	mov	x22, x3
 45e9ce8: aa0203f3     	mov	x19, x2
 45e9cec: aa0103f4     	mov	x20, x1
 45e9cf0: aa0003f5     	mov	x21, x0
 45e9cf4: b940045a     	ldr	w26, [x2, #0x4]
 45e9cf8: f9402c09     	ldr	x9, [x0, #0x58]
 45e9cfc: f9401808     	ldr	x8, [x0, #0x30]
 45e9d00: f100013f     	cmp	x9, #0x0
 45e9d04: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45e9d08: 54000080     	b.eq	0x45e9d18 <_ChromeMain+0x45e4a7c>
 45e9d0c: f940c52a     	ldr	x10, [x9, #0x188]
 45e9d10: eb08015f     	cmp	x10, x8
 45e9d14: 540006e0     	b.eq	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d18: f9409eaa     	ldr	x10, [x21, #0x138]
 45e9d1c: b940354a     	ldr	w10, [x10, #0x34]
 45e9d20: 7100055f     	cmp	w10, #0x1
 45e9d24: 54000661     	b.ne	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d28: f9403ea0     	ldr	x0, [x21, #0x78]
 45e9d2c: f100011f     	cmp	x8, #0x0
 45e9d30: fa401804     	ccmp	x0, #0x0, #0x4, ne
 45e9d34: 540005e0     	b.eq	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d38: f940c40a     	ldr	x10, [x0, #0x188]
 45e9d3c: eb08015f     	cmp	x10, x8
 45e9d40: 54000581     	b.ne	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d44: 3947200a     	ldrb	w10, [x0, #0x1c8]
 45e9d48: 3400054a     	cbz	w10, 0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d4c: f00487c1     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45e9d50: 9139a021     	add	x1, x1, #0xe68
 45e9d54: 9707afcb     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e9d58: aa0003f7     	mov	x23, x0
 45e9d5c: f94016a8     	ldr	x8, [x21, #0x28]
 45e9d60: f9400500     	ldr	x0, [x8, #0x8]
 45e9d64: b4004e40     	cbz	x0, 0x45ea72c <_ChromeMain+0x45e5490>
 45e9d68: 952fe2ed     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45e9d6c: 370002e0     	tbnz	w0, #0x0, 0x45e9dc8 <_ChromeMain+0x45e4b2c>
 45e9d70: bd401260     	ldr	s0, [x19, #0x10]
 45e9d74: bd401a61     	ldr	s1, [x19, #0x18]
 45e9d78: 1e212800     	fadd	s0, s0, s1
 45e9d7c: 1e24c001     	frintp	s1, s0
 45e9d80: 52a6b008     	mov	w8, #0x35800000         ; =897581056
 45e9d84: 1e270102     	fmov	s2, w8
 45e9d88: 6f00e403     	movi.2d	v3, #0000000000000000
 45e9d8c: 1e222000     	fcmp	s0, s2
 45e9d90: 1e23cc20     	fcsel	s0, s1, s3, gt
 45e9d94: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e9d98: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e9d9c: 1e212000     	fcmp	s0, s1
 45e9da0: 1e21cc01     	fcsel	s1, s0, s1, gt
 45e9da4: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e9da8: 1e380029     	fcvtzs	w9, s1
 45e9dac: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 45e9db0: 1e270141     	fmov	s1, w10
 45e9db4: 1e212000     	fcmp	s0, s1
 45e9db8: 1a889128     	csel	w8, w9, w8, ls
 45e9dbc: d503201f     	nop
 45e9dc0: 6b17011f     	cmp	w8, w23
 45e9dc4: 1a97c117     	csel	w23, w8, w23, gt
 45e9dc8: b9400a68     	ldr	w8, [x19, #0x8]
 45e9dcc: 6b17011f     	cmp	w8, w23
 45e9dd0: 1a97b108     	csel	w8, w8, w23, lt
 45e9dd4: d3607d08     	lsl	x8, x8, #32
 45e9dd8: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45e9ddc: 9100c3e1     	add	x1, sp, #0x30
 45e9de0: aa1303e0     	mov	x0, x19
 45e9de4: 96f78c71     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9de8: f9402ea9     	ldr	x9, [x21, #0x58]
 45e9dec: f9401aa8     	ldr	x8, [x21, #0x30]
 45e9df0: f100013f     	cmp	x9, #0x0
 45e9df4: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45e9df8: 54000080     	b.eq	0x45e9e08 <_ChromeMain+0x45e4b6c>
 45e9dfc: f940c529     	ldr	x9, [x9, #0x188]
 45e9e00: eb08013f     	cmp	x9, x8
 45e9e04: 54000120     	b.eq	0x45e9e28 <_ChromeMain+0x45e4b8c>
 45e9e08: b4000108     	cbz	x8, 0x45e9e28 <_ChromeMain+0x45e4b8c>
 45e9e0c: f94062b8     	ldr	x24, [x21, #0xc0]
 45e9e10: b40000d8     	cbz	x24, 0x45e9e28 <_ChromeMain+0x45e4b8c>
 45e9e14: f940c709     	ldr	x9, [x24, #0x188]
 45e9e18: eb08013f     	cmp	x9, x8
 45e9e1c: 54000061     	b.ne	0x45e9e28 <_ChromeMain+0x45e4b8c>
 45e9e20: 39472308     	ldrb	w8, [x24, #0x1c8]
 45e9e24: 350033a8     	cbnz	w8, 0x45ea498 <_ChromeMain+0x45e51fc>
 45e9e28: f9403aa1     	ldr	x1, [x21, #0x70]
 45e9e2c: b40009e1     	cbz	x1, 0x45e9f68 <_ChromeMain+0x45e4ccc>
 45e9e30: f9402ea8     	ldr	x8, [x21, #0x58]
 45e9e34: b40009a8     	cbz	x8, 0x45e9f68 <_ChromeMain+0x45e4ccc>
 45e9e38: f940c429     	ldr	x9, [x1, #0x188]
 45e9e3c: eb08013f     	cmp	x9, x8
 45e9e40: 54000941     	b.ne	0x45e9f68 <_ChromeMain+0x45e4ccc>
 45e9e44: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 45e9e48: f9409ea8     	ldr	x8, [x21, #0x138]
 45e9e4c: b9403508     	ldr	w8, [x8, #0x34]
 45e9e50: 7100091f     	cmp	w8, #0x2
 45e9e54: 54000821     	b.ne	0x45e9f58 <_ChromeMain+0x45e4cbc>
 45e9e58: 97848c5a     	bl	0x270cfc0 <_ChromeMain+0x2707d24>
 45e9e5c: f9403aa1     	ldr	x1, [x21, #0x70]
 45e9e60: aa0103e9     	mov	x9, x1
 45e9e64: f84e8d28     	ldr	x8, [x9, #0xe8]!
 45e9e68: b4000128     	cbz	x8, 0x45e9e8c <_ChromeMain+0x45e4bf0>
 45e9e6c: 900520ea     	adrp	x10, 0xea05000 <dyld_stub_binder+0xea05000>
 45e9e70: 9112a14a     	add	x10, x10, #0x4a8
 45e9e74: f940110b     	ldr	x11, [x8, #0x20]
 45e9e78: eb0a017f     	cmp	x11, x10
 45e9e7c: 540004e8     	b.hi	0x45e9f18 <_ChromeMain+0x45e4c7c>
 45e9e80: 54000522     	b.hs	0x45e9f24 <_ChromeMain+0x45e4c88>
 45e9e84: f9400508     	ldr	x8, [x8, #0x8]
 45e9e88: b5ffff68     	cbnz	x8, 0x45e9e74 <_ChromeMain+0x45e4bd8>
 45e9e8c: 528001e2     	mov	w2, #0xf                ; =15
 45e9e90: aa1303e0     	mov	x0, x19
 45e9e94: 52800003     	mov	w3, #0x0                ; =0
 45e9e98: 972fee2a     	bl	0x11e5740 <_ChromeMain+0x11e04a4>
 45e9e9c: a90207e0     	stp	x0, x1, [sp, #0x20]
 45e9ea0: f94016a0     	ldr	x0, [x21, #0x28]
 45e9ea4: 972feb10     	bl	0x11e4ae4 <_ChromeMain+0x11df848>
 45e9ea8: 7100081f     	cmp	w0, #0x2
 45e9eac: 540000e3     	b.lo	0x45e9ec8 <_ChromeMain+0x45e4c2c>
 45e9eb0: d004cae8     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 45e9eb4: 3dc27900     	ldr	q0, [x8, #0x9e0]
 45e9eb8: 3d800fe0     	str	q0, [sp, #0x30]
 45e9ebc: 910083e0     	add	x0, sp, #0x20
 45e9ec0: 9100c3e1     	add	x1, sp, #0x30
 45e9ec4: 96f78c7d     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45e9ec8: b94027f6     	ldr	w22, [sp, #0x24]
 45e9ecc: b9402ff7     	ldr	w23, [sp, #0x2c]
 45e9ed0: 528005a0     	mov	w0, #0x2d               ; =45
 45e9ed4: 96fc667b     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45e9ed8: b9400668     	ldr	w8, [x19, #0x4]
 45e9edc: 0b1602e9     	add	w9, w23, w22
 45e9ee0: 0b080008     	add	w8, w0, w8
 45e9ee4: 4b080128     	sub	w8, w9, w8
 45e9ee8: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45e9eec: 9100c3e1     	add	x1, sp, #0x30
 45e9ef0: aa1303e0     	mov	x0, x19
 45e9ef4: 96f78c2d     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9ef8: 52800016     	mov	w22, #0x0               ; =0
 45e9efc: f9409ea8     	ldr	x8, [x21, #0x138]
 45e9f00: b9403508     	ldr	w8, [x8, #0x34]
 45e9f04: 7100091f     	cmp	w8, #0x2
 45e9f08: 52802008     	mov	w8, #0x100              ; =256
 45e9f0c: 9a881503     	cinc	x3, x8, eq
 45e9f10: f9403aa1     	ldr	x1, [x21, #0x70]
 45e9f14: 14000012     	b	0x45e9f5c <_ChromeMain+0x45e4cc0>
 45e9f18: f9400108     	ldr	x8, [x8]
 45e9f1c: b5fffac8     	cbnz	x8, 0x45e9e74 <_ChromeMain+0x45e4bd8>
 45e9f20: 17ffffdb     	b	0x45e9e8c <_ChromeMain+0x45e4bf0>
 45e9f24: eb09011f     	cmp	x8, x9
 45e9f28: 54fffb20     	b.eq	0x45e9e8c <_ChromeMain+0x45e4bf0>
 45e9f2c: f9401908     	ldr	x8, [x8, #0x30]
 45e9f30: b4fffae8     	cbz	x8, 0x45e9e8c <_ChromeMain+0x45e4bf0>
 45e9f34: bd401a60     	ldr	s0, [x19, #0x18]
 45e9f38: bd400501     	ldr	s1, [x8, #0x4]
 45e9f3c: 5e21d821     	scvtf	s1, s1
 45e9f40: 1e213800     	fsub	s0, s0, s1
 45e9f44: 1e202008     	fcmp	s0, #0.0
 45e9f48: 6f00e401     	movi.2d	v1, #0000000000000000
 45e9f4c: 1e21cc00     	fcsel	s0, s0, s1, gt
 45e9f50: 1e380002     	fcvtzs	w2, s0
 45e9f54: 17ffffcf     	b	0x45e9e90 <_ChromeMain+0x45e4bf4>
 45e9f58: 52802003     	mov	w3, #0x100              ; =256
 45e9f5c: 910083e2     	add	x2, sp, #0x20
 45e9f60: aa1403e0     	mov	x0, x20
 45e9f64: 9703587c     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e9f68: f94016a8     	ldr	x8, [x21, #0x28]
 45e9f6c: f9400500     	ldr	x0, [x8, #0x8]
 45e9f70: b4003a80     	cbz	x0, 0x45ea6c0 <_ChromeMain+0x45e5424>
 45e9f74: 97400927     	bl	0x15ec410 <_ChromeMain+0x15e7174>
 45e9f78: f94052a1     	ldr	x1, [x21, #0xa0]
 45e9f7c: b40003e1     	cbz	x1, 0x45e9ff8 <_ChromeMain+0x45e4d5c>
 45e9f80: f9402ea8     	ldr	x8, [x21, #0x58]
 45e9f84: b40003a8     	cbz	x8, 0x45e9ff8 <_ChromeMain+0x45e4d5c>
 45e9f88: f940c429     	ldr	x9, [x1, #0x188]
 45e9f8c: eb08013f     	cmp	x9, x8
 45e9f90: 54000341     	b.ne	0x45e9ff8 <_ChromeMain+0x45e4d5c>
 45e9f94: aa0003f7     	mov	x23, x0
 45e9f98: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 45e9f9c: 34000240     	cbz	w0, 0x45e9fe4 <_ChromeMain+0x45e4d48>
 45e9fa0: 34002236     	cbz	w22, 0x45ea3e4 <_ChromeMain+0x45e5148>
 45e9fa4: aa1303e0     	mov	x0, x19
 45e9fa8: 52800002     	mov	w2, #0x0                ; =0
 45e9fac: 52800003     	mov	w3, #0x0                ; =0
 45e9fb0: 972fede4     	bl	0x11e5740 <_ChromeMain+0x11e04a4>
 45e9fb4: d360fc08     	lsr	x8, x0, #32
 45e9fb8: 2a0003e9     	mov	w9, w0
 45e9fbc: aa088129     	orr	x9, x9, x8, lsl #32
 45e9fc0: a90207e9     	stp	x9, x1, [sp, #0x20]
 45e9fc4: 8b418108     	add	x8, x8, x1, lsr #32
 45e9fc8: b9400669     	ldr	w9, [x19, #0x4]
 45e9fcc: 4b090108     	sub	w8, w8, w9
 45e9fd0: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45e9fd4: 9100c3e1     	add	x1, sp, #0x30
 45e9fd8: aa1303e0     	mov	x0, x19
 45e9fdc: 96f78bf3     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9fe0: f94052a1     	ldr	x1, [x21, #0xa0]
 45e9fe4: 2a1703e8     	mov	w8, w23
 45e9fe8: 910083e2     	add	x2, sp, #0x20
 45e9fec: b2780103     	orr	x3, x8, #0x100
 45e9ff0: aa1403e0     	mov	x0, x20
 45e9ff4: 97035858     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45e9ff8: f94016a8     	ldr	x8, [x21, #0x28]
 45e9ffc: f9400500     	ldr	x0, [x8, #0x8]
 45ea000: b4003660     	cbz	x0, 0x45ea6cc <_ChromeMain+0x45e5430>
 45ea004: 9748bec7     	bl	0x1819b20 <_ChromeMain+0x1814884>
 45ea008: f94076a1     	ldr	x1, [x21, #0xe8]
 45ea00c: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea010: b40006a1     	cbz	x1, 0x45ea0e4 <_ChromeMain+0x45e4e48>
 45ea014: b4000688     	cbz	x8, 0x45ea0e4 <_ChromeMain+0x45e4e48>
 45ea018: f940c429     	ldr	x9, [x1, #0x188]
 45ea01c: eb08013f     	cmp	x9, x8
 45ea020: 54000621     	b.ne	0x45ea0e4 <_ChromeMain+0x45e4e48>
 45ea024: aa0003f6     	mov	x22, x0
 45ea028: 29406277     	ldp	w23, w24, [x19]
 45ea02c: b9400a79     	ldr	w25, [x19, #0x8]
 45ea030: 35000060     	cbnz	w0, 0x45ea03c <_ChromeMain+0x45e4da0>
 45ea034: 52800008     	mov	w8, #0x0                ; =0
 45ea038: 14000011     	b	0x45ea07c <_ChromeMain+0x45e4de0>
 45ea03c: d00487c8     	adrp	x8, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45ea040: 913a6108     	add	x8, x8, #0xe98
 45ea044: aa0103e0     	mov	x0, x1
 45ea048: aa0803e1     	mov	x1, x8
 45ea04c: 9707af0d     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45ea050: d360fc08     	lsr	x8, x0, #32
 45ea054: 2b080308     	adds	w8, w24, w8
 45ea058: 131f7d09     	asr	w9, w8, #31
 45ea05c: 52010129     	eor	w9, w9, #0x80000000
 45ea060: 1a886128     	csel	w8, w9, w8, vs
 45ea064: 6b180108     	subs	w8, w8, w24
 45ea068: 131f7d09     	asr	w9, w8, #31
 45ea06c: 52010129     	eor	w9, w9, #0x80000000
 45ea070: 1a886128     	csel	w8, w9, w8, vs
 45ea074: 0aa87d08     	bic	w8, w8, w8, asr #31
 45ea078: f94076a1     	ldr	x1, [x21, #0xe8]
 45ea07c: 290463f7     	stp	w23, w24, [sp, #0x20]
 45ea080: 2b1902e9     	adds	w9, w23, w25
 45ea084: 131f7d2a     	asr	w10, w9, #31
 45ea088: 5201014a     	eor	w10, w10, #0x80000000
 45ea08c: 1a896149     	csel	w9, w10, w9, vs
 45ea090: 6b170129     	subs	w9, w9, w23
 45ea094: 131f7d2a     	asr	w10, w9, #31
 45ea098: 5201014a     	eor	w10, w10, #0x80000000
 45ea09c: 1a896149     	csel	w9, w10, w9, vs
 45ea0a0: 0aa97d29     	bic	w9, w9, w9, asr #31
 45ea0a4: 290523e9     	stp	w9, w8, [sp, #0x28]
 45ea0a8: 2a1603e8     	mov	w8, w22
 45ea0ac: 910083e2     	add	x2, sp, #0x20
 45ea0b0: b2780103     	orr	x3, x8, #0x100
 45ea0b4: aa1403e0     	mov	x0, x20
 45ea0b8: 97035827     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45ea0bc: b94027e8     	ldr	w8, [sp, #0x24]
 45ea0c0: b9402fe9     	ldr	w9, [sp, #0x2c]
 45ea0c4: b940066a     	ldr	w10, [x19, #0x4]
 45ea0c8: 0b080128     	add	w8, w9, w8
 45ea0cc: 4b0a0108     	sub	w8, w8, w10
 45ea0d0: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45ea0d4: 9100c3e1     	add	x1, sp, #0x30
 45ea0d8: aa1303e0     	mov	x0, x19
 45ea0dc: 96f78bb3     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45ea0e0: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea0e4: 52800016     	mov	w22, #0x0               ; =0
 45ea0e8: f94072a9     	ldr	x9, [x21, #0xe0]
 45ea0ec: b40004a9     	cbz	x9, 0x45ea180 <_ChromeMain+0x45e4ee4>
 45ea0f0: b4000488     	cbz	x8, 0x45ea180 <_ChromeMain+0x45e4ee4>
 45ea0f4: f940c529     	ldr	x9, [x9, #0x188]
 45ea0f8: eb08013f     	cmp	x9, x8
 45ea0fc: 54000401     	b.ne	0x45ea17c <_ChromeMain+0x45e4ee0>
 45ea100: f94016a8     	ldr	x8, [x21, #0x28]
 45ea104: f9400500     	ldr	x0, [x8, #0x8]
 45ea108: b4002fa0     	cbz	x0, 0x45ea6fc <_ChromeMain+0x45e5460>
 45ea10c: 974008c1     	bl	0x15ec410 <_ChromeMain+0x15e7174>
 45ea110: 370000c0     	tbnz	w0, #0x0, 0x45ea128 <_ChromeMain+0x45e4e8c>
 45ea114: f94016a8     	ldr	x8, [x21, #0x28]
 45ea118: f9400500     	ldr	x0, [x8, #0x8]
 45ea11c: b4002fc0     	cbz	x0, 0x45ea714 <_ChromeMain+0x45e5478>
 45ea120: 9748be80     	bl	0x1819b20 <_ChromeMain+0x1814884>
 45ea124: 340002c0     	cbz	w0, 0x45ea17c <_ChromeMain+0x45e4ee0>
 45ea128: f94016a8     	ldr	x8, [x21, #0x28]
 45ea12c: f9400516     	ldr	x22, [x8, #0x8]
 45ea130: b4002ed6     	cbz	x22, 0x45ea708 <_ChromeMain+0x45e546c>
 45ea134: f9429ec8     	ldr	x8, [x22, #0x538]
 45ea138: f9404508     	ldr	x8, [x8, #0x88]
 45ea13c: f9404908     	ldr	x8, [x8, #0x90]
 45ea140: b4002a08     	cbz	x8, 0x45ea680 <_ChromeMain+0x45e53e4>
 45ea144: f9402117     	ldr	x23, [x8, #0x40]
 45ea148: aa1703e0     	mov	x0, x23
 45ea14c: 972fede1     	bl	0x11e58d0 <_ChromeMain+0x11e0634>
 45ea150: 370000e0     	tbnz	w0, #0x0, 0x45ea16c <_ChromeMain+0x45e4ed0>
 45ea154: aa1603e0     	mov	x0, x22
 45ea158: aa1703e1     	mov	x1, x23
 45ea15c: 972fefab     	bl	0x11e6008 <_ChromeMain+0x11e0d6c>
 45ea160: 35000060     	cbnz	w0, 0x45ea16c <_ChromeMain+0x45e4ed0>
 45ea164: 52800036     	mov	w22, #0x1               ; =1
 45ea168: 14000006     	b	0x45ea180 <_ChromeMain+0x45e4ee4>
 45ea16c: 9107c2c0     	add	x0, x22, #0x1f0
 45ea170: 96fedba0     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 45ea174: 52801e41     	mov	w1, #0xf2               ; =242
 45ea178: 9724f814     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 45ea17c: 52800016     	mov	w22, #0x0               ; =0
 45ea180: f94072a1     	ldr	x1, [x21, #0xe0]
 45ea184: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea188: b4000561     	cbz	x1, 0x45ea234 <_ChromeMain+0x45e4f98>
 45ea18c: b4000548     	cbz	x8, 0x45ea234 <_ChromeMain+0x45e4f98>
 45ea190: f940c429     	ldr	x9, [x1, #0x188]
 45ea194: eb08013f     	cmp	x9, x8
 45ea198: 540004e1     	b.ne	0x45ea234 <_ChromeMain+0x45e4f98>
 45ea19c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 45ea1a0: 340003f6     	cbz	w22, 0x45ea21c <_ChromeMain+0x45e4f80>
 45ea1a4: f9409ea8     	ldr	x8, [x21, #0x138]
 45ea1a8: b940350a     	ldr	w10, [x8, #0x34]
 45ea1ac: 2940266b     	ldp	w11, w9, [x19]
 45ea1b0: b9400a68     	ldr	w8, [x19, #0x8]
 45ea1b4: 2b080168     	adds	w8, w11, w8
 45ea1b8: 131f7d0c     	asr	w12, w8, #31
 45ea1bc: 5201018c     	eor	w12, w12, #0x80000000
 45ea1c0: 1a886188     	csel	w8, w12, w8, vs
 45ea1c4: 6b0b0108     	subs	w8, w8, w11
 45ea1c8: 131f7d0c     	asr	w12, w8, #31
 45ea1cc: 5201018c     	eor	w12, w12, #0x80000000
 45ea1d0: 1a886188     	csel	w8, w12, w8, vs
 45ea1d4: 0aa87d08     	bic	w8, w8, w8, asr #31
 45ea1d8: b90033eb     	str	w11, [sp, #0x30]
 45ea1dc: 7100095f     	cmp	w10, #0x2
 45ea1e0: 54000080     	b.eq	0x45ea1f0 <_ChromeMain+0x45e4f54>
 45ea1e4: 51000929     	sub	w9, w9, #0x2
 45ea1e8: 31000d2a     	adds	w10, w9, #0x3
 45ea1ec: 14000003     	b	0x45ea1f8 <_ChromeMain+0x45e4f5c>
 45ea1f0: 51000529     	sub	w9, w9, #0x1
 45ea1f4: 3100052a     	adds	w10, w9, #0x1
 45ea1f8: 12b0000b     	mov	w11, #0x7fffffff        ; =2147483647
 45ea1fc: 1a8a616a     	csel	w10, w11, w10, vs
 45ea200: 6b09014a     	subs	w10, w10, w9
 45ea204: 131f7d4b     	asr	w11, w10, #31
 45ea208: 5201016b     	eor	w11, w11, #0x80000000
 45ea20c: 1a8a616a     	csel	w10, w11, w10, vs
 45ea210: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 45ea214: 2906a3e9     	stp	w9, w8, [sp, #0x34]
 45ea218: b9003fea     	str	w10, [sp, #0x3c]
 45ea21c: 2a1603e8     	mov	w8, w22
 45ea220: 9100c3e2     	add	x2, sp, #0x30
 45ea224: b2780103     	orr	x3, x8, #0x100
 45ea228: aa1403e0     	mov	x0, x20
 45ea22c: 970357ca     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45ea230: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea234: f9406ea9     	ldr	x9, [x21, #0xd8]
 45ea238: b4000469     	cbz	x9, 0x45ea2c4 <_ChromeMain+0x45e5028>
 45ea23c: b4000448     	cbz	x8, 0x45ea2c4 <_ChromeMain+0x45e5028>
 45ea240: f940c529     	ldr	x9, [x9, #0x188]
 45ea244: eb08013f     	cmp	x9, x8
 45ea248: 540003e1     	b.ne	0x45ea2c4 <_ChromeMain+0x45e5028>
 45ea24c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 45ea250: f9409ea8     	ldr	x8, [x21, #0x138]
 45ea254: 39424108     	ldrb	w8, [x8, #0x90]
 45ea258: 2a2802c8     	orn	w8, w22, w8
 45ea25c: 37000288     	tbnz	w8, #0x0, 0x45ea2ac <_ChromeMain+0x45e5010>
 45ea260: f94016a8     	ldr	x8, [x21, #0x28]
 45ea264: f9400516     	ldr	x22, [x8, #0x8]
 45ea268: b40025d6     	cbz	x22, 0x45ea720 <_ChromeMain+0x45e5484>
 45ea26c: f9429ec8     	ldr	x8, [x22, #0x538]
 45ea270: f9404508     	ldr	x8, [x8, #0x88]
 45ea274: f9404908     	ldr	x8, [x8, #0x90]
 45ea278: b4002088     	cbz	x8, 0x45ea688 <_ChromeMain+0x45e53ec>
 45ea27c: f9402117     	ldr	x23, [x8, #0x40]
 45ea280: aa1703e0     	mov	x0, x23
 45ea284: 972fed93     	bl	0x11e58d0 <_ChromeMain+0x11e0634>
 45ea288: 370000a0     	tbnz	w0, #0x0, 0x45ea29c <_ChromeMain+0x45e5000>
 45ea28c: aa1603e0     	mov	x0, x22
 45ea290: aa1703e1     	mov	x1, x23
 45ea294: 972fef5d     	bl	0x11e6008 <_ChromeMain+0x11e0d6c>
 45ea298: 34000ce0     	cbz	w0, 0x45ea434 <_ChromeMain+0x45e5198>
 45ea29c: 9107c2c0     	add	x0, x22, #0x1f0
 45ea2a0: 96fedb54     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 45ea2a4: 52801e41     	mov	w1, #0xf2               ; =242
 45ea2a8: 9724f7c8     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 45ea2ac: 52802003     	mov	w3, #0x100              ; =256
 45ea2b0: f9406ea1     	ldr	x1, [x21, #0xd8]
 45ea2b4: 910083e2     	add	x2, sp, #0x20
 45ea2b8: aa1403e0     	mov	x0, x20
 45ea2bc: 970357a6     	bl	0x6c0154 <_ChromeMain+0x6baeb8>
 45ea2c0: f9402ea8     	ldr	x8, [x21, #0x58]
 45ea2c4: b4001e68     	cbz	x8, 0x45ea690 <_ChromeMain+0x45e53f4>
 45ea2c8: f9401aa9     	ldr	x9, [x21, #0x30]
 45ea2cc: b4001e29     	cbz	x9, 0x45ea690 <_ChromeMain+0x45e53f4>
 45ea2d0: f940c508     	ldr	x8, [x8, #0x188]
 45ea2d4: b940026a     	ldr	w10, [x19]
 45ea2d8: eb09011f     	cmp	x8, x9
 45ea2dc: 54000140     	b.eq	0x45ea304 <_ChromeMain+0x45e5068>
 45ea2e0: 3400012a     	cbz	w10, 0x45ea304 <_ChromeMain+0x45e5068>
 45ea2e4: f9400e89     	ldr	x9, [x20, #0x18]
 45ea2e8: 91008288     	add	x8, x20, #0x20
 45ea2ec: eb08013f     	cmp	x9, x8
 45ea2f0: 540000a0     	b.eq	0x45ea304 <_ChromeMain+0x45e5068>
 45ea2f4: 4b0a03ea     	neg	w10, w10
 45ea2f8: 6f00e400     	movi.2d	v0, #0000000000000000
 45ea2fc: 1400001f     	b	0x45ea378 <_ChromeMain+0x45e50dc>
 45ea300: b940026a     	ldr	w10, [x19]
 45ea304: b9400668     	ldr	w8, [x19, #0x4]
 45ea308: 4b1a0108     	sub	w8, w8, w26
 45ea30c: 1e270140     	fmov	s0, w10
 45ea310: 4e0c1f40     	mov.s	v0[1], w26
 45ea314: bd400a61     	ldr	s1, [x19, #0x8]
 45ea318: 4e0c1d01     	mov.s	v1[1], w8
 45ea31c: 0ea10c01     	sqadd.2s	v1, v0, v1
 45ea320: 0ea02c20     	sqsub.2s	v0, v1, v0
 45ea324: 0e0c3c08     	mov.s	w8, v0[1]
 45ea328: 1e260009     	fmov	w9, s0
 45ea32c: 0aa97d29     	bic	w9, w9, w9, asr #31
 45ea330: 0aa87d08     	bic	w8, w8, w8, asr #31
 45ea334: 2a0a03ea     	mov	w10, w10
 45ea338: aa1a8140     	orr	x0, x10, x26, lsl #32
 45ea33c: aa088121     	orr	x1, x9, x8, lsl #32
 45ea340: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 45ea344: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 45ea348: a94857f6     	ldp	x22, x21, [sp, #0x80]
 45ea34c: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 45ea350: a94667fa     	ldp	x26, x25, [sp, #0x60]
 45ea354: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 45ea358: 6d4423e9     	ldp	d9, d8, [sp, #0x40]
 45ea35c: 9102c3ff     	add	sp, sp, #0xb0
 45ea360: d65f03c0     	ret
 45ea364: aa0b03e9     	mov	x9, x11
 45ea368: f940016b     	ldr	x11, [x11]
 45ea36c: b5ffffcb     	cbnz	x11, 0x45ea364 <_ChromeMain+0x45e50c8>
 45ea370: eb08013f     	cmp	x9, x8
 45ea374: 54fffc60     	b.eq	0x45ea300 <_ChromeMain+0x45e5064>
 45ea378: b940312b     	ldr	w11, [x9, #0x30]
 45ea37c: 3400024b     	cbz	w11, 0x45ea3c4 <_ChromeMain+0x45e5128>
 45ea380: b940352c     	ldr	w12, [x9, #0x34]
 45ea384: 3400020c     	cbz	w12, 0x45ea3c4 <_ChromeMain+0x45e5128>
 45ea388: b940292d     	ldr	w13, [x9, #0x28]
 45ea38c: 2b0a01ad     	adds	w13, w13, w10
 45ea390: 131f7dae     	asr	w14, w13, #31
 45ea394: 520101ce     	eor	w14, w14, #0x80000000
 45ea398: 1a8d61cd     	csel	w13, w14, w13, vs
 45ea39c: b900292d     	str	w13, [x9, #0x28]
 45ea3a0: 1e2701a1     	fmov	s1, w13
 45ea3a4: 9100b12d     	add	x13, x9, #0x2c
 45ea3a8: 0d4091a1     	ld1.s	{ v1 }[1], [x13]
 45ea3ac: 1e270162     	fmov	s2, w11
 45ea3b0: 4e0c1d82     	mov.s	v2[1], w12
 45ea3b4: 0ea20c22     	sqadd.2s	v2, v1, v2
 45ea3b8: 0ea12c41     	sqsub.2s	v1, v2, v1
 45ea3bc: 0ea06421     	smax.2s	v1, v1, v0
 45ea3c0: fd001921     	str	d1, [x9, #0x30]
 45ea3c4: f940052b     	ldr	x11, [x9, #0x8]
 45ea3c8: b5fffceb     	cbnz	x11, 0x45ea364 <_ChromeMain+0x45e50c8>
 45ea3cc: aa0903eb     	mov	x11, x9
 45ea3d0: f9400929     	ldr	x9, [x9, #0x10]
 45ea3d4: f940012c     	ldr	x12, [x9]
 45ea3d8: eb0c017f     	cmp	x11, x12
 45ea3dc: 54ffff81     	b.ne	0x45ea3cc <_ChromeMain+0x45e5130>
 45ea3e0: 17ffffe4     	b	0x45ea370 <_ChromeMain+0x45e50d4>
 45ea3e4: fd400260     	ldr	d0, [x19]
 45ea3e8: 3d8007e0     	str	q0, [sp, #0x10]
 45ea3ec: bd400a60     	ldr	s0, [x19, #0x8]
 45ea3f0: 3d8003e0     	str	q0, [sp]
 45ea3f4: d00487c8     	adrp	x8, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45ea3f8: 913a2108     	add	x8, x8, #0xe88
 45ea3fc: aa0103e0     	mov	x0, x1
 45ea400: aa0803e1     	mov	x1, x8
 45ea404: 9707ae1f     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45ea408: d360fc08     	lsr	x8, x0, #32
 45ea40c: ad400be0     	ldp	q0, q2, [sp]
 45ea410: 4e0c1d00     	mov.s	v0[1], w8
 45ea414: 0ea00c40     	sqadd.2s	v0, v2, v0
 45ea418: 0ea22c00     	sqsub.2s	v0, v0, v2
 45ea41c: 6f00e401     	movi.2d	v1, #0000000000000000
 45ea420: 0ea16400     	smax.2s	v0, v0, v1
 45ea424: 9e660001     	fmov	x1, d0
 45ea428: 0e0c3c48     	mov.s	w8, v2[1]
 45ea42c: 1e260040     	fmov	w0, s2
 45ea430: 17fffee2     	b	0x45e9fb8 <_ChromeMain+0x45e4d1c>
 45ea434: f9406ea0     	ldr	x0, [x21, #0xd8]
 45ea438: fd400268     	ldr	d8, [x19]
 45ea43c: bd400a60     	ldr	s0, [x19, #0x8]
 45ea440: 3d8007e0     	str	q0, [sp, #0x10]
 45ea444: d00487c1     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45ea448: 913aa021     	add	x1, x1, #0xea8
 45ea44c: 9707ae0d     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45ea450: d360fc08     	lsr	x8, x0, #32
 45ea454: 3dc007e0     	ldr	q0, [sp, #0x10]
 45ea458: 4e0c1d00     	mov.s	v0[1], w8
 45ea45c: 0ea00d00     	sqadd.2s	v0, v8, v0
 45ea460: 0ea82c00     	sqsub.2s	v0, v0, v8
 45ea464: 6f00e401     	movi.2d	v1, #0000000000000000
 45ea468: 0ea16400     	smax.2s	v0, v0, v1
 45ea46c: 6d0203e8     	stp	d8, d0, [sp, #0x20]
 45ea470: 0ea88400     	add.2s	v0, v0, v8
 45ea474: 0e0c3c08     	mov.s	w8, v0[1]
 45ea478: b9400669     	ldr	w9, [x19, #0x4]
 45ea47c: 4b090108     	sub	w8, w8, w9
 45ea480: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45ea484: 9100c3e1     	add	x1, sp, #0x30
 45ea488: aa1303e0     	mov	x0, x19
 45ea48c: 96f78ac7     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45ea490: 52802023     	mov	w3, #0x101              ; =257
 45ea494: 17ffff87     	b	0x45ea2b0 <_ChromeMain+0x45e5014>
 45ea498: b9449317     	ldr	w23, [x24, #0x490]
 45ea49c: 90054939     	adrp	x25, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45ea4a0: b947ab20     	ldr	w0, [x25, #0x7a8]
 45ea4a4: 34000fc0     	cbz	w0, 0x45ea69c <_ChromeMain+0x45e5400>
 45ea4a8: 710006ff     	cmp	w23, #0x1
 45ea4ac: 1a9f17e8     	cset	w8, eq
 45ea4b0: 7100041f     	cmp	w0, #0x1
 45ea4b4: 1a9f17e9     	cset	w9, eq
 45ea4b8: 4a09011b     	eor	w27, w8, w9
 45ea4bc: aa1803e0     	mov	x0, x24
 45ea4c0: 94c41ebf     	bl	0x76f1fbc <_ChromeMain+0x76ecd20>
 45ea4c4: 4ea01c08     	mov.16b	v8, v0
 45ea4c8: 528006e0     	mov	w0, #0x37               ; =55
 45ea4cc: 96fc64fd     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45ea4d0: aa0003f7     	mov	x23, x0
 45ea4d4: f9409ea8     	ldr	x8, [x21, #0x138]
 45ea4d8: b9404108     	ldr	w8, [x8, #0x40]
 45ea4dc: 35000248     	cbnz	w8, 0x45ea524 <_ChromeMain+0x45e5288>
 45ea4e0: d00487c1     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45ea4e4: 9139e021     	add	x1, x1, #0xe78
 45ea4e8: aa1803e0     	mov	x0, x24
 45ea4ec: 9707ade5     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45ea4f0: aa0003f9     	mov	x25, x0
 45ea4f4: b9400a7c     	ldr	w28, [x19, #0x8]
 45ea4f8: aa1503e0     	mov	x0, x21
 45ea4fc: aa1303e1     	mov	x1, x19
 45ea500: 97fff3d0     	bl	0x45e7440 <_ChromeMain+0x45e21a4>
 45ea504: 0b0002e8     	add	w8, w23, w0
 45ea508: 4b080388     	sub	w8, w28, w8
 45ea50c: 6b19011f     	cmp	w8, w25
 45ea510: 1a99b119     	csel	w25, w8, w25, lt
 45ea514: aa1803e0     	mov	x0, x24
 45ea518: 972fe9be     	bl	0x11e4c10 <_ChromeMain+0x11df974>
 45ea51c: 6b00033f     	cmp	w25, w0
 45ea520: 1a80c328     	csel	w8, w25, w0, gt
 45ea524: 1e620100     	scvtf	d0, w8
 45ea528: 1e600900     	fmul	d0, d8, d0
 45ea52c: 1e654000     	frintm	d0, d0
 45ea530: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 45ea534: 9e670101     	fmov	d1, x8
 45ea538: 1e612000     	fcmp	d0, d1
 45ea53c: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45ea540: 1a88b3e8     	csel	w8, wzr, w8, lt
 45ea544: 1e616801     	fmaxnm	d1, d0, d1
 45ea548: 1e780029     	fcvtzs	w9, d1
 45ea54c: b004cb0a     	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45ea550: fd466549     	ldr	d9, [x10, #0xcc8]
 45ea554: 1e692000     	fcmp	d0, d9
 45ea558: 1a889128     	csel	w8, w9, w8, ls
 45ea55c: b9400a69     	ldr	w9, [x19, #0x8]
 45ea560: 6b08013f     	cmp	w9, w8
 45ea564: 1a88b128     	csel	w8, w9, w8, lt
 45ea568: d3607d08     	lsl	x8, x8, #32
 45ea56c: 7100037f     	cmp	w27, #0x0
 45ea570: 9a8813e9     	csel	x9, xzr, x8, ne
 45ea574: 9a9f1108     	csel	x8, x8, xzr, ne
 45ea578: a90323e9     	stp	x9, x8, [sp, #0x30]
 45ea57c: 9100c3e1     	add	x1, sp, #0x30
 45ea580: aa1303e0     	mov	x0, x19
 45ea584: 96f78a89     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45ea588: f9409ea8     	ldr	x8, [x21, #0x138]
 45ea58c: 39424908     	ldrb	w8, [x8, #0x92]
 45ea590: 34ffc4c8     	cbz	w8, 0x45e9e28 <_ChromeMain+0x45e4b8c>
 45ea594: f94016a8     	ldr	x8, [x21, #0x28]
 45ea598: f9400518     	ldr	x24, [x8, #0x8]
 45ea59c: b4000cf8     	cbz	x24, 0x45ea738 <_ChromeMain+0x45e549c>
 45ea5a0: f9429f08     	ldr	x8, [x24, #0x538]
 45ea5a4: f9404508     	ldr	x8, [x8, #0x88]
 45ea5a8: f9404908     	ldr	x8, [x8, #0x90]
 45ea5ac: b40001c8     	cbz	x8, 0x45ea5e4 <_ChromeMain+0x45e5348>
 45ea5b0: f9402119     	ldr	x25, [x8, #0x40]
 45ea5b4: aa1903e0     	mov	x0, x25
 45ea5b8: 972fecc6     	bl	0x11e58d0 <_ChromeMain+0x11e0634>
 45ea5bc: 370000a0     	tbnz	w0, #0x0, 0x45ea5d0 <_ChromeMain+0x45e5334>
 45ea5c0: aa1803e0     	mov	x0, x24
 45ea5c4: aa1903e1     	mov	x1, x25
 45ea5c8: 972fee90     	bl	0x11e6008 <_ChromeMain+0x11e0d6c>
 45ea5cc: 34000100     	cbz	w0, 0x45ea5ec <_ChromeMain+0x45e5350>
 45ea5d0: 9107c300     	add	x0, x24, #0x1f0
 45ea5d4: 96feda87     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 45ea5d8: 52801e41     	mov	w1, #0xf2               ; =242
 45ea5dc: 9724f6fb     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 45ea5e0: 17fffe12     	b	0x45e9e28 <_ChromeMain+0x45e4b8c>
 45ea5e4: d2800019     	mov	x25, #0x0               ; =0
 45ea5e8: 17fffff3     	b	0x45ea5b4 <_ChromeMain+0x45e5318>
 45ea5ec: 1e6202e0     	scvtf	d0, w23
 45ea5f0: 1e600900     	fmul	d0, d8, d0
 45ea5f4: 1e664000     	frinta	d0, d0
 45ea5f8: d2f83c08     	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 45ea5fc: 9e670101     	fmov	d1, x8
 45ea600: 1e612000     	fcmp	d0, d1
 45ea604: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45ea608: 1a88b3e8     	csel	w8, wzr, w8, lt
 45ea60c: 1e616801     	fmaxnm	d1, d0, d1
 45ea610: 1e780029     	fcvtzs	w9, d1
 45ea614: 1e692000     	fcmp	d0, d9
 45ea618: 1a889128     	csel	w8, w9, w8, ls
 45ea61c: f9409ea9     	ldr	x9, [x21, #0x138]
 45ea620: b9403529     	ldr	w9, [x9, #0x34]
 45ea624: 7100053f     	cmp	w9, #0x1
 45ea628: 1a8803e9     	csel	w9, wzr, w8, eq
 45ea62c: 7100037f     	cmp	w27, #0x0
 45ea630: 1a9f110a     	csel	w10, w8, wzr, ne
 45ea634: 2b08012b     	adds	w11, w9, w8
 45ea638: 131f7d6c     	asr	w12, w11, #31
 45ea63c: 5201018c     	eor	w12, w12, #0x80000000
 45ea640: 1a8b618b     	csel	w11, w12, w11, vs
 45ea644: 6b09016b     	subs	w11, w11, w9
 45ea648: 131f7d6c     	asr	w12, w11, #31
 45ea64c: 5201018c     	eor	w12, w12, #0x80000000
 45ea650: 1a8b618b     	csel	w11, w12, w11, vs
 45ea654: 6b0a0108     	subs	w8, w8, w10
 45ea658: 131f7d0c     	asr	w12, w8, #31
 45ea65c: 5201018c     	eor	w12, w12, #0x80000000
 45ea660: 1a886188     	csel	w8, w12, w8, vs
 45ea664: aa088168     	orr	x8, x11, x8, lsl #32
 45ea668: aa0a8129     	orr	x9, x9, x10, lsl #32
 45ea66c: a90323e9     	stp	x9, x8, [sp, #0x30]
 45ea670: 9100c3e1     	add	x1, sp, #0x30
 45ea674: aa1303e0     	mov	x0, x19
 45ea678: 96f78a4c     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45ea67c: 17fffdeb     	b	0x45e9e28 <_ChromeMain+0x45e4b8c>
 45ea680: d2800017     	mov	x23, #0x0               ; =0
 45ea684: 17fffeb1     	b	0x45ea148 <_ChromeMain+0x45e4eac>
 45ea688: d2800017     	mov	x23, #0x0               ; =0
 45ea68c: 17fffefd     	b	0x45ea280 <_ChromeMain+0x45e4fe4>
 45ea690: b940026a     	ldr	w10, [x19]
 45ea694: 35ffe28a     	cbnz	w10, 0x45ea2e4 <_ChromeMain+0x45e5048>
 45ea698: 17ffff1b     	b	0x45ea304 <_ChromeMain+0x45e5068>
 45ea69c: 9745fa32     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45ea6a0: aa0003e8     	mov	x8, x0
 45ea6a4: 39402009     	ldrb	w9, [x0, #0x8]
 45ea6a8: 7100053f     	cmp	w9, #0x1
 45ea6ac: 54000161     	b.ne	0x45ea6d8 <_ChromeMain+0x45e543c>
 45ea6b0: 91005d00     	add	x0, x8, #0x17
 45ea6b4: 96ecc293     	bl	0x11b100 <_ChromeMain+0x115e64>
 45ea6b8: b907ab20     	str	w0, [x25, #0x7a8]
 45ea6bc: 17ffff7b     	b	0x45ea4a8 <_ChromeMain+0x45e520c>
 45ea6c0: d4200000     	brk	#0
 45ea6c4: d4400000     	hlt	#0
 45ea6c8: d4200020     	brk	#0x1
 45ea6cc: d4200000     	brk	#0
 45ea6d0: d4400000     	hlt	#0
 45ea6d4: d4200020     	brk	#0x1
 45ea6d8: f0048fc0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45ea6dc: 91299000     	add	x0, x0, #0xa64
 45ea6e0: 7100093f     	cmp	w9, #0x2
 45ea6e4: 54000301     	b.ne	0x45ea744 <_ChromeMain+0x45e54a8>
 45ea6e8: f9401108     	ldr	x8, [x8, #0x20]
 45ea6ec: f9400508     	ldr	x8, [x8, #0x8]
 45ea6f0: f100011f     	cmp	x8, #0x0
 45ea6f4: 9a880000     	csel	x0, x0, x8, eq
 45ea6f8: 17ffffef     	b	0x45ea6b4 <_ChromeMain+0x45e5418>
 45ea6fc: d4200000     	brk	#0
 45ea700: d4400000     	hlt	#0
 45ea704: d4200020     	brk	#0x1
 45ea708: d4200000     	brk	#0
 45ea70c: d4400000     	hlt	#0
 45ea710: d4200020     	brk	#0x1
 45ea714: d4200000     	brk	#0
 45ea718: d4400000     	hlt	#0
 45ea71c: d4200020     	brk	#0x1
 45ea720: d4200000     	brk	#0
 45ea724: d4400000     	hlt	#0
 45ea728: d4200020     	brk	#0x1
 45ea72c: d4200000     	brk	#0
 45ea730: d4400000     	hlt	#0
 45ea734: d4200020     	brk	#0x1
 45ea738: d4200000     	brk	#0
 45ea73c: d4400000     	hlt	#0
 45ea740: d4200020     	brk	#0x1
 45ea744: 34fffb89     	cbz	w9, 0x45ea6b4 <_ChromeMain+0x45e5418>
 45ea748: 94e9adbf     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
 45ea74c: d101c3ff     	sub	sp, sp, #0x70
 45ea750: a9035ff8     	stp	x24, x23, [sp, #0x30]
 45ea754: a90457f6     	stp	x22, x21, [sp, #0x40]
 45ea758: a9054ff4     	stp	x20, x19, [sp, #0x50]
 45ea75c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 45ea760: 910183fd     	add	x29, sp, #0x60
 45ea764: f9409c08     	ldr	x8, [x0, #0x138]
 45ea768: b4001708     	cbz	x8, 0x45eaa48 <_ChromeMain+0x45e57ac>
 45ea76c: aa0203f3     	mov	x19, x2
 45ea770: aa0103f4     	mov	x20, x1
 45ea774: aa0003f5     	mov	x21, x0
 45ea778: f9402c09     	ldr	x9, [x0, #0x58]
 45ea77c: f940180a     	ldr	x10, [x0, #0x30]
 45ea780: f100013f     	cmp	x9, #0x0
 45ea784: fa401944     	ccmp	x10, #0x0, #0x4, ne
 45ea788: 54000080     	b.eq	0x45ea798 <_ChromeMain+0x45e54fc>
 45ea78c: f940c529     	ldr	x9, [x9, #0x188]
 45ea790: eb0a013f     	cmp	x9, x10
 45ea794: 54000080     	b.eq	0x45ea7a4 <_ChromeMain+0x45e5508>
 45ea798: b9403108     	ldr	w8, [x8, #0x30]
 45ea79c: 7100091f     	cmp	w8, #0x2
 45ea7a0: 540006a1     	b.ne	0x45ea874 <_ChromeMain+0x45e55d8>
 45ea7a4: f94016a0     	ldr	x0, [x21, #0x28]
 45ea7a8: 972fe87e     	bl	0x11e49a0 <_ChromeMain+0x11df704>
 45ea7ac: 36000860     	tbz	w0, #0x0, 0x45ea8b8 <_ChromeMain+0x45e561c>
 45ea7b0: 39412268     	ldrb	w8, [x19, #0x48]
 45ea7b4: 36000948     	tbz	w8, #0x0, 0x45ea8dc <_ChromeMain+0x45e5640>
 45ea7b8: f94016a0     	ldr	x0, [x21, #0x28]
 45ea7bc: 972fe879     	bl	0x11e49a0 <_ChromeMain+0x11df704>
 45ea7c0: 37000160     	tbnz	w0, #0x0, 0x45ea7ec <_ChromeMain+0x45e5550>
 45ea7c4: f94016a0     	ldr	x0, [x21, #0x28]
 45ea7c8: 972fe935     	bl	0x11e4c9c <_ChromeMain+0x11dfa00>
 45ea7cc: 34000100     	cbz	w0, 0x45ea7ec <_ChromeMain+0x45e5550>
 45ea7d0: f9403aa8     	ldr	x8, [x21, #0x70]
 45ea7d4: b40000c8     	cbz	x8, 0x45ea7ec <_ChromeMain+0x45e5550>
 45ea7d8: f9402ea9     	ldr	x9, [x21, #0x58]
 45ea7dc: b4000089     	cbz	x9, 0x45ea7ec <_ChromeMain+0x45e5550>
 45ea7e0: f940c508     	ldr	x8, [x8, #0x188]
 45ea7e4: eb09011f     	cmp	x8, x9
 45ea7e8: 54000620     	b.eq	0x45ea8ac <_ChromeMain+0x45e5610>
 45ea7ec: d2c00021     	mov	x1, #0x100000000        ; =4294967296
 45ea7f0: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45ea7f4: aa1303e0     	mov	x0, x19
 45ea7f8: 97ff9a80     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45ea7fc: 6f00e400     	movi.2d	v0, #0000000000000000
 45ea800: ad0083e0     	stp	q0, q0, [sp, #0x10]
 45ea804: 3d8003e0     	str	q0, [sp]
 45ea808: f9409ea8     	ldr	x8, [x21, #0x138]
 45ea80c: b9403509     	ldr	w9, [x8, #0x34]
 45ea810: 7100053f     	cmp	w9, #0x1
 45ea814: 540003a1     	b.ne	0x45ea888 <_ChromeMain+0x45e55ec>
 45ea818: b9403108     	ldr	w8, [x8, #0x30]
 45ea81c: 35000368     	cbnz	w8, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea820: aa1303e0     	mov	x0, x19
 45ea824: 52800021     	mov	w1, #0x1                ; =1
 45ea828: 95fffab6     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45ea82c: f800c3e0     	stur	x0, [sp, #0xc]
 45ea830: b90017e1     	str	w1, [sp, #0x14]
 45ea834: f9403ea8     	ldr	x8, [x21, #0x78]
 45ea838: b4000288     	cbz	x8, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea83c: f94016a8     	ldr	x8, [x21, #0x28]
 45ea840: f9400508     	ldr	x8, [x8, #0x8]
 45ea844: b4001088     	cbz	x8, 0x45eaa54 <_ChromeMain+0x45e57b8>
 45ea848: f9429d08     	ldr	x8, [x8, #0x538]
 45ea84c: 9100a109     	add	x9, x8, #0x28
 45ea850: f100011f     	cmp	x8, #0x0
 45ea854: 9a8903e9     	csel	x9, xzr, x9, eq
 45ea858: f940b128     	ldr	x8, [x9, #0x160]
 45ea85c: 90052e57     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45ea860: b40006e8     	cbz	x8, 0x45ea93c <_ChromeMain+0x45e56a0>
 45ea864: 91058129     	add	x9, x9, #0x160
 45ea868: b005148a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea86c: 9108614a     	add	x10, x10, #0x218
 45ea870: 1400002d     	b	0x45ea924 <_ChromeMain+0x45e5688>
 45ea874: 39412268     	ldrb	w8, [x19, #0x48]
 45ea878: 35000b08     	cbnz	w8, 0x45ea9d8 <_ChromeMain+0x45e573c>
 45ea87c: 6f00e400     	movi.2d	v0, #0000000000000000
 45ea880: ad0083e0     	stp	q0, q0, [sp, #0x10]
 45ea884: 3d8003e0     	str	q0, [sp]
 45ea888: 910003e1     	mov	x1, sp
 45ea88c: aa1303e0     	mov	x0, x19
 45ea890: 97daf02c     	bl	0x3ca6940 <_ChromeMain+0x3ca16a4>
 45ea894: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45ea898: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45ea89c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45ea8a0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45ea8a4: 9101c3ff     	add	sp, sp, #0x70
 45ea8a8: d65f03c0     	ret
 45ea8ac: d2803321     	mov	x1, #0x199              ; =409
 45ea8b0: f2c00041     	movk	x1, #0x2, lsl #32
 45ea8b4: 17ffffcf     	b	0x45ea7f0 <_ChromeMain+0x45e5554>
 45ea8b8: aa1503e0     	mov	x0, x21
 45ea8bc: aa1403e1     	mov	x1, x20
 45ea8c0: aa1303e2     	mov	x2, x19
 45ea8c4: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45ea8c8: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45ea8cc: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45ea8d0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45ea8d4: 9101c3ff     	add	sp, sp, #0x70
 45ea8d8: 15fffa8d     	b	0xc5e930c <_ChromeMain+0xc5e4070>
 45ea8dc: 52800028     	mov	w8, #0x1                ; =1
 45ea8e0: 39012268     	strb	w8, [x19, #0x48]
 45ea8e4: f9409260     	ldr	x0, [x19, #0x120]
 45ea8e8: b4000bc0     	cbz	x0, 0x45eaa60 <_ChromeMain+0x45e57c4>
 45ea8ec: 96feda24     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ea8f0: 17ffffb2     	b	0x45ea7b8 <_ChromeMain+0x45e551c>
 45ea8f4: eb09011f     	cmp	x8, x9
 45ea8f8: 54000220     	b.eq	0x45ea93c <_ChromeMain+0x45e56a0>
 45ea8fc: f9401516     	ldr	x22, [x8, #0x28]
 45ea900: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45ea904: f94046e9     	ldr	x9, [x23, #0x88]
 45ea908: eb09011f     	cmp	x8, x9
 45ea90c: 540001a1     	b.ne	0x45ea940 <_ChromeMain+0x45e56a4>
 45ea910: aa1603e0     	mov	x0, x22
 45ea914: 96e8a67a     	bl	0x142fc <_ChromeMain+0xf060>
 45ea918: 1400000a     	b	0x45ea940 <_ChromeMain+0x45e56a4>
 45ea91c: f9400108     	ldr	x8, [x8]
 45ea920: b40000e8     	cbz	x8, 0x45ea93c <_ChromeMain+0x45e56a0>
 45ea924: f940110b     	ldr	x11, [x8, #0x20]
 45ea928: eb0a017f     	cmp	x11, x10
 45ea92c: 54ffff88     	b.hi	0x45ea91c <_ChromeMain+0x45e5680>
 45ea930: 54fffe20     	b.eq	0x45ea8f4 <_ChromeMain+0x45e5658>
 45ea934: f9400508     	ldr	x8, [x8, #0x8]
 45ea938: b5ffff68     	cbnz	x8, 0x45ea924 <_ChromeMain+0x45e5688>
 45ea93c: d2800016     	mov	x22, #0x0               ; =0
 45ea940: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45ea944: f94046e9     	ldr	x9, [x23, #0x88]
 45ea948: eb09011f     	cmp	x8, x9
 45ea94c: 54000061     	b.ne	0x45ea958 <_ChromeMain+0x45e56bc>
 45ea950: aa1603e0     	mov	x0, x22
 45ea954: 96e8e03a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45ea958: b0051481     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea95c: 910a4021     	add	x1, x1, #0x290
 45ea960: aa1603e0     	mov	x0, x22
 45ea964: 972fe77d     	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 45ea968: f9401c08     	ldr	x8, [x0, #0x38]
 45ea96c: b0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea970: 910a8129     	add	x9, x9, #0x2a0
 45ea974: eb09011f     	cmp	x8, x9
 45ea978: 54fff880     	b.eq	0x45ea888 <_ChromeMain+0x45e55ec>
 45ea97c: b0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea980: 910a6129     	add	x9, x9, #0x298
 45ea984: b005148a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea988: 910aa14a     	add	x10, x10, #0x2a8
 45ea98c: eb0a011f     	cmp	x8, x10
 45ea990: fa491104     	ccmp	x8, x9, #0x4, ne
 45ea994: b0051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45ea998: 910ac129     	add	x9, x9, #0x2b0
 45ea99c: fa491104     	ccmp	x8, x9, #0x4, ne
 45ea9a0: 54fff740     	b.eq	0x45ea888 <_ChromeMain+0x45e55ec>
 45ea9a4: f9403ea8     	ldr	x8, [x21, #0x78]
 45ea9a8: 39682109     	ldrb	w9, [x8, #0xa08]
 45ea9ac: 3707f6e9     	tbnz	w9, #0x0, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea9b0: 39683109     	ldrb	w9, [x8, #0xa0c]
 45ea9b4: 3707f6a9     	tbnz	w9, #0x0, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea9b8: f94016a9     	ldr	x9, [x21, #0x28]
 45ea9bc: f9400520     	ldr	x0, [x9, #0x8]
 45ea9c0: b4000560     	cbz	x0, 0x45eaa6c <_ChromeMain+0x45e57d0>
 45ea9c4: 39738115     	ldrb	w21, [x8, #0xce0]
 45ea9c8: 952fdfd5     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45ea9cc: 3707f5f5     	tbnz	w21, #0x0, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea9d0: 34fff5c0     	cbz	w0, 0x45ea888 <_ChromeMain+0x45e55ec>
 45ea9d4: 14000006     	b	0x45ea9ec <_ChromeMain+0x45e5750>
 45ea9d8: 3901227f     	strb	wzr, [x19, #0x48]
 45ea9dc: f9409260     	ldr	x0, [x19, #0x120]
 45ea9e0: b40004c0     	cbz	x0, 0x45eaa78 <_ChromeMain+0x45e57dc>
 45ea9e4: 96fed9e6     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ea9e8: 17ffffa5     	b	0x45ea87c <_ChromeMain+0x45e55e0>
 45ea9ec: bd401280     	ldr	s0, [x20, #0x10]
 45ea9f0: bd401a81     	ldr	s1, [x20, #0x18]
 45ea9f4: 1e212800     	fadd	s0, s0, s1
 45ea9f8: 52a6b008     	mov	w8, #0x35800000         ; =897581056
 45ea9fc: 1e270101     	fmov	s1, w8
 45eaa00: 1e212000     	fcmp	s0, s1
 45eaa04: 54fff42d     	b.le	0x45ea888 <_ChromeMain+0x45e55ec>
 45eaa08: 1e202008     	fcmp	s0, #0.0
 45eaa0c: 54fff3e0     	b.eq	0x45ea888 <_ChromeMain+0x45e55ec>
 45eaa10: bd401680     	ldr	s0, [x20, #0x14]
 45eaa14: bd401e81     	ldr	s1, [x20, #0x1c]
 45eaa18: 1e212800     	fadd	s0, s0, s1
 45eaa1c: 1e270101     	fmov	s1, w8
 45eaa20: 1e212000     	fcmp	s0, s1
 45eaa24: 54fff32d     	b.le	0x45ea888 <_ChromeMain+0x45e55ec>
 45eaa28: 1e202008     	fcmp	s0, #0.0
 45eaa2c: 54fff2e0     	b.eq	0x45ea888 <_ChromeMain+0x45e55ec>
 45eaa30: aa1303e0     	mov	x0, x19
 45eaa34: 52800021     	mov	w1, #0x1                ; =1
 45eaa38: 95fffa32     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45eaa3c: f90003e0     	str	x0, [sp]
 45eaa40: b9000be1     	str	w1, [sp, #0x8]
 45eaa44: 17ffff91     	b	0x45ea888 <_ChromeMain+0x45e55ec>
 45eaa48: d4200000     	brk	#0
 45eaa4c: d4400000     	hlt	#0
 45eaa50: d4200020     	brk	#0x1
 45eaa54: d4200000     	brk	#0
 45eaa58: d4400000     	hlt	#0
 45eaa5c: d4200020     	brk	#0x1
 45eaa60: d4200000     	brk	#0
 45eaa64: d4400000     	hlt	#0
 45eaa68: d4200020     	brk	#0x1
 45eaa6c: d4200000     	brk	#0
 45eaa70: d4400000     	hlt	#0
 45eaa74: d4200020     	brk	#0x1
 45eaa78: d4200000     	brk	#0
 45eaa7c: d4400000     	hlt	#0
 45eaa80: d4200020     	brk	#0x1
		...
 45eaac0: d10643ff     	sub	sp, sp, #0x190
 45eaac4: 6d1033ed     	stp	d13, d12, [sp, #0x100]
 45eaac8: 6d112beb     	stp	d11, d10, [sp, #0x110]
 45eaacc: 6d1223e9     	stp	d9, d8, [sp, #0x120]
 45eaad0: a9136ffc     	stp	x28, x27, [sp, #0x130]
 45eaad4: a91467fa     	stp	x26, x25, [sp, #0x140]
 45eaad8: a9155ff8     	stp	x24, x23, [sp, #0x150]
 45eaadc: a91657f6     	stp	x22, x21, [sp, #0x160]
 45eaae0: a9174ff4     	stp	x20, x19, [sp, #0x170]
 45eaae4: a9187bfd     	stp	x29, x30, [sp, #0x180]
 45eaae8: 910603fd     	add	x29, sp, #0x180
 45eaaec: aa0103f4     	mov	x20, x1
 45eaaf0: aa0003f3     	mov	x19, x0
 45eaaf4: f9402c09     	ldr	x9, [x0, #0x58]
 45eaaf8: f9401808     	ldr	x8, [x0, #0x30]
 45eaafc: f100013f     	cmp	x9, #0x0
 45eab00: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45eab04: 5400a120     	b.eq	0x45ebf28 <_ChromeMain+0x45e6c8c>
 45eab08: f940c529     	ldr	x9, [x9, #0x188]
 45eab0c: 9104e27a     	add	x26, x19, #0x138
 45eab10: f9409e76     	ldr	x22, [x19, #0x138]
 45eab14: eb08013f     	cmp	x9, x8
 45eab18: 54000be0     	b.eq	0x45eac94 <_ChromeMain+0x45e59f8>
 45eab1c: b94032c8     	ldr	w8, [x22, #0x30]
 45eab20: 7100091f     	cmp	w8, #0x2
 45eab24: 1a9f07fc     	cset	w28, ne
 45eab28: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45eab2c: 72a0007b     	movk	w27, #0x3, lsl #16
 45eab30: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 45eab34: f81703bf     	stur	xzr, [x29, #-0x90]
 45eab38: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 45eab3c: f81583bf     	stur	xzr, [x29, #-0xa8]
 45eab40: a90b7fff     	stp	xzr, xzr, [sp, #0xb0]
 45eab44: f90063ff     	str	xzr, [sp, #0xc0]
 45eab48: b94002c8     	ldr	w8, [x22]
 45eab4c: b900afe8     	str	w8, [sp, #0xac]
 45eab50: b94036c8     	ldr	w8, [x22, #0x34]
 45eab54: 1e2e1008     	fmov	s8, #1.00000000
 45eab58: 7100091f     	cmp	w8, #0x2
 45eab5c: 54000a00     	b.eq	0x45eac9c <_ChromeMain+0x45e5a00>
 45eab60: 7100051f     	cmp	w8, #0x1
 45eab64: 54003f40     	b.eq	0x45eb34c <_ChromeMain+0x45e60b0>
 45eab68: f9405268     	ldr	x8, [x19, #0xa0]
 45eab6c: f9410d15     	ldr	x21, [x8, #0x218]
 45eab70: f94002a8     	ldr	x8, [x21]
 45eab74: f9401108     	ldr	x8, [x8, #0x20]
 45eab78: f0052741     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45eab7c: 911e2021     	add	x1, x1, #0x788
 45eab80: aa1503e0     	mov	x0, x21
 45eab84: d63f0100     	blr	x8
 45eab88: b400a595     	cbz	x21, 0x45ec038 <_ChromeMain+0x45e6d9c>
 45eab8c: 3600a560     	tbz	w0, #0x0, 0x45ec038 <_ChromeMain+0x45e6d9c>
 45eab90: 6f00e400     	movi.2d	v0, #0000000000000000
 45eab94: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45eab98: 3d801fe0     	str	q0, [sp, #0x70]
 45eab9c: 394122a8     	ldrb	w8, [x21, #0x48]
 45eaba0: 35000f3c     	cbnz	w28, 0x45ead84 <_ChromeMain+0x45e5ae8>
 45eaba4: 36009a08     	tbz	w8, #0x0, 0x45ebee4 <_ChromeMain+0x45e6c48>
 45eaba8: f9400348     	ldr	x8, [x26]
 45eabac: b9403509     	ldr	w9, [x8, #0x34]
 45eabb0: 7100053f     	cmp	w9, #0x1
 45eabb4: 54000880     	b.eq	0x45eacc4 <_ChromeMain+0x45e5a28>
 45eabb8: 7100093f     	cmp	w9, #0x2
 45eabbc: 54000e61     	b.ne	0x45ead88 <_ChromeMain+0x45e5aec>
 45eabc0: b9403108     	ldr	w8, [x8, #0x30]
 45eabc4: 121f7908     	and	w8, w8, #0xfffffffe
 45eabc8: 7100091f     	cmp	w8, #0x2
 45eabcc: 52800028     	mov	w8, #0x1                ; =1
 45eabd0: 1a880518     	cinc	w24, w8, ne
 45eabd4: f9405260     	ldr	x0, [x19, #0xa0]
 45eabd8: 9738f267     	bl	0x1427574 <_ChromeMain+0x14222d8>
 45eabdc: aa0003f4     	mov	x20, x0
 45eabe0: d360fc17     	lsr	x23, x0, #32
 45eabe4: f9403a60     	ldr	x0, [x19, #0x70]
 45eabe8: 9738f263     	bl	0x1427574 <_ChromeMain+0x14222d8>
 45eabec: d360fc08     	lsr	x8, x0, #32
 45eabf0: 8b418108     	add	x8, x8, x1, lsr #32
 45eabf4: 6b17011f     	cmp	w8, w23
 45eabf8: 54000c8b     	b.lt	0x45ead88 <_ChromeMain+0x45e5aec>
 45eabfc: aa0003f6     	mov	x22, x0
 45eac00: b9007ff8     	str	w24, [sp, #0x7c]
 45eac04: f9400348     	ldr	x8, [x26]
 45eac08: b9403108     	ldr	w8, [x8, #0x30]
 45eac0c: 121f7908     	and	w8, w8, #0xfffffffe
 45eac10: 7100091f     	cmp	w8, #0x2
 45eac14: 54000380     	b.eq	0x45eac84 <_ChromeMain+0x45e59e8>
 45eac18: f9401679     	ldr	x25, [x19, #0x28]
 45eac1c: f9400728     	ldr	x8, [x25, #0x8]
 45eac20: b400aa28     	cbz	x8, 0x45ec164 <_ChromeMain+0x45e6ec8>
 45eac24: f9429909     	ldr	x9, [x8, #0x530]
 45eac28: b400aa49     	cbz	x9, 0x45ec170 <_ChromeMain+0x45e6ed4>
 45eac2c: f941c137     	ldr	x23, [x9, #0x380]
 45eac30: b400a917     	cbz	x23, 0x45ec150 <_ChromeMain+0x45e6eb4>
 45eac34: f9429d08     	ldr	x8, [x8, #0x538]
 45eac38: 9100a109     	add	x9, x8, #0x28
 45eac3c: f100011f     	cmp	x8, #0x0
 45eac40: 9a8903e0     	csel	x0, xzr, x9, eq
 45eac44: 97469c5e     	bl	0x1791dbc <_ChromeMain+0x178cb20>
 45eac48: 39410328     	ldrb	w8, [x25, #0x40]
 45eac4c: 7100001f     	cmp	w0, #0x0
 45eac50: 1a8813fb     	csel	w27, wzr, w8, ne
 45eac54: f94002e8     	ldr	x8, [x23]
 45eac58: f9423108     	ldr	x8, [x8, #0x460]
 45eac5c: aa1703e0     	mov	x0, x23
 45eac60: d63f0100     	blr	x8
 45eac64: aa0003e8     	mov	x8, x0
 45eac68: 2a080377     	orr	w23, w27, w8
 45eac6c: 3600a897     	tbz	w23, #0x0, 0x45ec17c <_ChromeMain+0x45e6ee0>
 45eac70: 520002e8     	eor	w8, w23, #0x1
 45eac74: 0a080008     	and	w8, w0, w8
 45eac78: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45eac7c: 72a0007b     	movk	w27, #0x3, lsl #16
 45eac80: 37000848     	tbnz	w8, #0x0, 0x45ead88 <_ChromeMain+0x45e5aec>
 45eac84: 6b16029f     	cmp	w20, w22
 45eac88: 5400080c     	b.gt	0x45ead88 <_ChromeMain+0x45e5aec>
 45eac8c: b90073f8     	str	w24, [sp, #0x70]
 45eac90: 1400003e     	b	0x45ead88 <_ChromeMain+0x45e5aec>
 45eac94: 5280001c     	mov	w28, #0x0               ; =0
 45eac98: 17ffffa4     	b	0x45eab28 <_ChromeMain+0x45e588c>
 45eac9c: b94032c8     	ldr	w8, [x22, #0x30]
 45eaca0: 121f7908     	and	w8, w8, #0xfffffffe
 45eaca4: 7100091f     	cmp	w8, #0x2
 45eaca8: 54fff600     	b.eq	0x45eab68 <_ChromeMain+0x45e58cc>
 45eacac: 39448268     	ldrb	w8, [x19, #0x120]
 45eacb0: 7100011f     	cmp	w8, #0x0
 45eacb4: 1e2e1000     	fmov	s0, #1.00000000
 45eacb8: 6f00e401     	movi.2d	v1, #0000000000000000
 45eacbc: 1e201c28     	fcsel	s8, s1, s0, ne
 45eacc0: 17ffffaa     	b	0x45eab68 <_ChromeMain+0x45e58cc>
 45eacc4: b9403108     	ldr	w8, [x8, #0x30]
 45eacc8: 7100091f     	cmp	w8, #0x2
 45eaccc: 540005e0     	b.eq	0x45ead88 <_ChromeMain+0x45e5aec>
 45eacd0: 350001e8     	cbnz	w8, 0x45ead0c <_ChromeMain+0x45e5a70>
 45eacd4: 97621a5f     	bl	0x1e71650 <_ChromeMain+0x1e6c3b4>
 45eacd8: 5283d5e8     	mov	w8, #0x1eaf             ; =7855
 45eacdc: 72a00088     	movk	w8, #0x4, lsl #16
 45eace0: 6b08001f     	cmp	w0, w8
 45eace4: 5400014d     	b.le	0x45ead0c <_ChromeMain+0x45e5a70>
 45eace8: 528006c0     	mov	w0, #0x36               ; =54
 45eacec: 96fc62f5     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 45eacf0: 52800028     	mov	w8, #0x1                ; =1
 45eacf4: b90073e8     	str	w8, [sp, #0x70]
 45eacf8: 3941e3e9     	ldrb	w9, [sp, #0x78]
 45eacfc: 1e220000     	scvtf	s0, w0
 45ead00: bd0077e0     	str	s0, [sp, #0x74]
 45ead04: 37000049     	tbnz	w9, #0x0, 0x45ead0c <_ChromeMain+0x45e5a70>
 45ead08: 3901e3e8     	strb	w8, [sp, #0x78]
 45ead0c: f9402e68     	ldr	x8, [x19, #0x58]
 45ead10: b40003c8     	cbz	x8, 0x45ead88 <_ChromeMain+0x45e5aec>
 45ead14: f9401a69     	ldr	x9, [x19, #0x30]
 45ead18: b4000389     	cbz	x9, 0x45ead88 <_ChromeMain+0x45e5aec>
 45ead1c: f940c508     	ldr	x8, [x8, #0x188]
 45ead20: eb09011f     	cmp	x8, x9
 45ead24: 54000321     	b.ne	0x45ead88 <_ChromeMain+0x45e5aec>
 45ead28: bd402280     	ldr	s0, [x20, #0x20]
 45ead2c: bd402a81     	ldr	s1, [x20, #0x28]
 45ead30: 1e212800     	fadd	s0, s0, s1
 45ead34: 52a6b008     	mov	w8, #0x35800000         ; =897581056
 45ead38: 1e270101     	fmov	s1, w8
 45ead3c: 1e212000     	fcmp	s0, s1
 45ead40: 5400016d     	b.le	0x45ead6c <_ChromeMain+0x45e5ad0>
 45ead44: 1e202008     	fcmp	s0, #0.0
 45ead48: 54000120     	b.eq	0x45ead6c <_ChromeMain+0x45e5ad0>
 45ead4c: bd402680     	ldr	s0, [x20, #0x24]
 45ead50: bd402e81     	ldr	s1, [x20, #0x2c]
 45ead54: 1e212800     	fadd	s0, s0, s1
 45ead58: 1e270101     	fmov	s1, w8
 45ead5c: 1e212000     	fcmp	s0, s1
 45ead60: 5400006d     	b.le	0x45ead6c <_ChromeMain+0x45e5ad0>
 45ead64: 1e202008     	fcmp	s0, #0.0
 45ead68: 54000101     	b.ne	0x45ead88 <_ChromeMain+0x45e5aec>
 45ead6c: aa1503e0     	mov	x0, x21
 45ead70: 52800021     	mov	w1, #0x1                ; =1
 45ead74: 95fff963     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45ead78: f807c3e0     	stur	x0, [sp, #0x7c]
 45ead7c: b90087e1     	str	w1, [sp, #0x84]
 45ead80: 14000002     	b	0x45ead88 <_ChromeMain+0x45e5aec>
 45ead84: 35008a68     	cbnz	w8, 0x45ebed0 <_ChromeMain+0x45e6c34>
 45ead88: 9101c3e1     	add	x1, sp, #0x70
 45ead8c: aa1503e0     	mov	x0, x21
 45ead90: 97daeeec     	bl	0x3ca6940 <_ChromeMain+0x3ca16a4>
 45ead94: f9402e68     	ldr	x8, [x19, #0x58]
 45ead98: f9410d16     	ldr	x22, [x8, #0x218]
 45ead9c: f94002c8     	ldr	x8, [x22]
 45eada0: f9401108     	ldr	x8, [x8, #0x20]
 45eada4: f0052741     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45eada8: 911e2021     	add	x1, x1, #0x788
 45eadac: aa1603e0     	mov	x0, x22
 45eadb0: d63f0100     	blr	x8
 45eadb4: b4009496     	cbz	x22, 0x45ec044 <_ChromeMain+0x45e6da8>
 45eadb8: 36009460     	tbz	w0, #0x0, 0x45ec044 <_ChromeMain+0x45e6da8>
 45eadbc: 97621a25     	bl	0x1e71650 <_ChromeMain+0x1e6c3b4>
 45eadc0: aa0003f4     	mov	x20, x0
 45eadc4: 6b1b001f     	cmp	w0, w27
 45eadc8: 5400116d     	b.le	0x45eaff4 <_ChromeMain+0x45e5d58>
 45eadcc: d0052ea0     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45eadd0: 91050000     	add	x0, x0, #0x140
 45eadd4: 96ecb92b     	bl	0x119280 <_ChromeMain+0x113fe4>
 45eadd8: 340010e0     	cbz	w0, 0x45eaff4 <_ChromeMain+0x45e5d58>
 45eaddc: f9400348     	ldr	x8, [x26]
 45eade0: b9403108     	ldr	w8, [x8, #0x30]
 45eade4: 121f7908     	and	w8, w8, #0xfffffffe
 45eade8: 7100091f     	cmp	w8, #0x2
 45eadec: 540009c1     	b.ne	0x45eaf24 <_ChromeMain+0x45e5c88>
 45eadf0: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 45eadf4: f90023ff     	str	xzr, [sp, #0x40]
 45eadf8: 9100c3e1     	add	x1, sp, #0x30
 45eadfc: aa1503e0     	mov	x0, x21
 45eae00: 9760b306     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45eae04: f9401bf7     	ldr	x23, [sp, #0x30]
 45eae08: b4000417     	cbz	x23, 0x45eae88 <_ChromeMain+0x45e5bec>
 45eae0c: f9401fe8     	ldr	x8, [sp, #0x38]
 45eae10: d37ced09     	lsl	x9, x8, #4
 45eae14: b4008dc9     	cbz	x9, 0x45ebfcc <_ChromeMain+0x45e6d30>
 45eae18: 8b170129     	add	x9, x9, x23
 45eae1c: d1004138     	sub	x24, x9, #0x10
 45eae20: cb0813f9     	neg	x25, x8, lsl #4
 45eae24: 90052e5c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eae28: 52801ffb     	mov	w27, #0xff              ; =255
 45eae2c: b4009498     	cbz	x24, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45eae30: 39402308     	ldrb	w8, [x24, #0x8]
 45eae34: 35000108     	cbnz	w8, 0x45eae54 <_ChromeMain+0x45e5bb8>
 45eae38: f9400300     	ldr	x0, [x24]
 45eae3c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45eae40: f9404789     	ldr	x9, [x28, #0x88]
 45eae44: eb09011f     	cmp	x8, x9
 45eae48: 54000041     	b.ne	0x45eae50 <_ChromeMain+0x45e5bb4>
 45eae4c: 96e8defc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eae50: f900031f     	str	xzr, [x24]
 45eae54: 3900231b     	strb	w27, [x24, #0x8]
 45eae58: d1004318     	sub	x24, x24, #0x10
 45eae5c: b1004339     	adds	x25, x25, #0x10
 45eae60: 54fffe61     	b.ne	0x45eae2c <_ChromeMain+0x45e5b90>
 45eae64: f9401be0     	ldr	x0, [sp, #0x30]
 45eae68: cb0002e8     	sub	x8, x23, x0
 45eae6c: 9344fd08     	asr	x8, x8, #4
 45eae70: f9001fe8     	str	x8, [sp, #0x38]
 45eae74: f94023e8     	ldr	x8, [sp, #0x40]
 45eae78: d37ced01     	lsl	x1, x8, #4
 45eae7c: 96e8780f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eae80: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45eae84: 72a0007b     	movk	w27, #0x3, lsl #16
 45eae88: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 45eae8c: f90023ff     	str	xzr, [sp, #0x40]
 45eae90: 9100c3e1     	add	x1, sp, #0x30
 45eae94: aa1603e0     	mov	x0, x22
 45eae98: 9760b2e0     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45eae9c: f9401bf7     	ldr	x23, [sp, #0x30]
 45eaea0: b4000997     	cbz	x23, 0x45eafd0 <_ChromeMain+0x45e5d34>
 45eaea4: f9401fe8     	ldr	x8, [sp, #0x38]
 45eaea8: d37ced09     	lsl	x9, x8, #4
 45eaeac: b4008949     	cbz	x9, 0x45ebfd4 <_ChromeMain+0x45e6d38>
 45eaeb0: 8b170129     	add	x9, x9, x23
 45eaeb4: d1004138     	sub	x24, x9, #0x10
 45eaeb8: cb0813f9     	neg	x25, x8, lsl #4
 45eaebc: 90052e5c     	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eaec0: 52801ffb     	mov	w27, #0xff              ; =255
 45eaec4: b4008fd8     	cbz	x24, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45eaec8: 39402308     	ldrb	w8, [x24, #0x8]
 45eaecc: 35000108     	cbnz	w8, 0x45eaeec <_ChromeMain+0x45e5c50>
 45eaed0: f9400300     	ldr	x0, [x24]
 45eaed4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45eaed8: f9404789     	ldr	x9, [x28, #0x88]
 45eaedc: eb09011f     	cmp	x8, x9
 45eaee0: 54000041     	b.ne	0x45eaee8 <_ChromeMain+0x45e5c4c>
 45eaee4: 96e8ded6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eaee8: f900031f     	str	xzr, [x24]
 45eaeec: 3900231b     	strb	w27, [x24, #0x8]
 45eaef0: d1004318     	sub	x24, x24, #0x10
 45eaef4: b1004339     	adds	x25, x25, #0x10
 45eaef8: 54fffe61     	b.ne	0x45eaec4 <_ChromeMain+0x45e5c28>
 45eaefc: f9401be0     	ldr	x0, [sp, #0x30]
 45eaf00: cb0002e8     	sub	x8, x23, x0
 45eaf04: 9344fd08     	asr	x8, x8, #4
 45eaf08: f9001fe8     	str	x8, [sp, #0x38]
 45eaf0c: f94023e8     	ldr	x8, [sp, #0x40]
 45eaf10: d37ced01     	lsl	x1, x8, #4
 45eaf14: 96e877e9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eaf18: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45eaf1c: 72a0007b     	movk	w27, #0x3, lsl #16
 45eaf20: 1400002c     	b	0x45eafd0 <_ChromeMain+0x45e5d34>
 45eaf24: d10283a1     	sub	x1, x29, #0xa0
 45eaf28: aa1503e0     	mov	x0, x21
 45eaf2c: 9760b2bb     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45eaf30: 39448268     	ldrb	w8, [x19, #0x120]
 45eaf34: 34000488     	cbz	w8, 0x45eafc4 <_ChromeMain+0x45e5d28>
 45eaf38: 925e76b8     	and	x24, x21, #0xfffffffc00000000
 45eaf3c: 90052e59     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eaf40: f9404728     	ldr	x8, [x25, #0x88]
 45eaf44: eb08031f     	cmp	x24, x8
 45eaf48: 54000101     	b.ne	0x45eaf68 <_ChromeMain+0x45e5ccc>
 45eaf4c: aa1503e0     	mov	x0, x21
 45eaf50: 96e8a4eb     	bl	0x142fc <_ChromeMain+0xf060>
 45eaf54: f9404728     	ldr	x8, [x25, #0x88]
 45eaf58: eb08031f     	cmp	x24, x8
 45eaf5c: 54000061     	b.ne	0x45eaf68 <_ChromeMain+0x45e5ccc>
 45eaf60: aa1503e0     	mov	x0, x21
 45eaf64: 96e8a4e6     	bl	0x142fc <_ChromeMain+0xf060>
 45eaf68: f9001bf5     	str	x21, [sp, #0x30]
 45eaf6c: 3900e3ff     	strb	wzr, [sp, #0x38]
 45eaf70: a976a7a8     	ldp	x8, x9, [x29, #-0x98]
 45eaf74: eb09011f     	cmp	x8, x9
 45eaf78: 54008a41     	b.ne	0x45ec0c0 <_ChromeMain+0x45e6e24>
 45eaf7c: d10283a0     	sub	x0, x29, #0xa0
 45eaf80: 9100c3e1     	add	x1, sp, #0x30
 45eaf84: 97daf42a     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45eaf88: f85603a8     	ldur	x8, [x29, #-0xa0]
 45eaf8c: eb080008     	subs	x8, x0, x8
 45eaf90: 9344fd08     	asr	x8, x8, #4
 45eaf94: f81683a8     	stur	x8, [x29, #-0x98]
 45eaf98: 54008920     	b.eq	0x45ec0bc <_ChromeMain+0x45e6e20>
 45eaf9c: f9404728     	ldr	x8, [x25, #0x88]
 45eafa0: eb08031f     	cmp	x24, x8
 45eafa4: 54000101     	b.ne	0x45eafc4 <_ChromeMain+0x45e5d28>
 45eafa8: aa1503e0     	mov	x0, x21
 45eafac: 96e8dea4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eafb0: f9404728     	ldr	x8, [x25, #0x88]
 45eafb4: eb08031f     	cmp	x24, x8
 45eafb8: 54000061     	b.ne	0x45eafc4 <_ChromeMain+0x45e5d28>
 45eafbc: aa1503e0     	mov	x0, x21
 45eafc0: 96e8de9f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eafc4: d10283a1     	sub	x1, x29, #0xa0
 45eafc8: aa1603e0     	mov	x0, x22
 45eafcc: 9760b293     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45eafd0: 1e260117     	fmov	w23, s8
 45eafd4: aa1503e0     	mov	x0, x21
 45eafd8: d2800001     	mov	x1, #0x0                ; =0
 45eafdc: aa1703e2     	mov	x2, x23
 45eafe0: 97daee3b     	bl	0x3ca68cc <_ChromeMain+0x3ca1630>
 45eafe4: aa1603e0     	mov	x0, x22
 45eafe8: d2800001     	mov	x1, #0x0                ; =0
 45eafec: aa1703e2     	mov	x2, x23
 45eaff0: 97daee37     	bl	0x3ca68cc <_ChromeMain+0x3ca1630>
 45eaff4: 9102b3e8     	add	x8, sp, #0xac
 45eaff8: a90623f3     	stp	x19, x8, [sp, #0x60]
 45eaffc: f9406261     	ldr	x1, [x19, #0xc0]
 45eb000: 910183e0     	add	x0, sp, #0x60
 45eb004: 9400054b     	bl	0x45ec530 <_ChromeMain+0x45e7294>
 45eb008: f9406661     	ldr	x1, [x19, #0xc8]
 45eb00c: 910183e0     	add	x0, sp, #0x60
 45eb010: 94000548     	bl	0x45ec530 <_ChromeMain+0x45e7294>
 45eb014: f9402268     	ldr	x8, [x19, #0x40]
 45eb018: b4000728     	cbz	x8, 0x45eb0fc <_ChromeMain+0x45e5e60>
 45eb01c: 39472109     	ldrb	w9, [x8, #0x1c8]
 45eb020: 340006e9     	cbz	w9, 0x45eb0fc <_ChromeMain+0x45e5e60>
 45eb024: f9410d15     	ldr	x21, [x8, #0x218]
 45eb028: f94002a8     	ldr	x8, [x21]
 45eb02c: f9401108     	ldr	x8, [x8, #0x20]
 45eb030: d0052741     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45eb034: 911e2021     	add	x1, x1, #0x788
 45eb038: aa1503e0     	mov	x0, x21
 45eb03c: d63f0100     	blr	x8
 45eb040: b4008095     	cbz	x21, 0x45ec050 <_ChromeMain+0x45e6db4>
 45eb044: 36008060     	tbz	w0, #0x0, 0x45ec050 <_ChromeMain+0x45e6db4>
 45eb048: 6b1b029f     	cmp	w20, w27
 45eb04c: 5400018d     	b.le	0x45eb07c <_ChromeMain+0x45e5de0>
 45eb050: b0052ea0     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45eb054: 91050000     	add	x0, x0, #0x140
 45eb058: 96ecb88a     	bl	0x119280 <_ChromeMain+0x113fe4>
 45eb05c: 34000100     	cbz	w0, 0x45eb07c <_ChromeMain+0x45e5de0>
 45eb060: d102e3a1     	sub	x1, x29, #0xb8
 45eb064: aa1503e0     	mov	x0, x21
 45eb068: 9760b26c     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45eb06c: 1e260102     	fmov	w2, s8
 45eb070: aa1503e0     	mov	x0, x21
 45eb074: d2800001     	mov	x1, #0x0                ; =0
 45eb078: 97daee15     	bl	0x3ca68cc <_ChromeMain+0x3ca1630>
 45eb07c: 6f00e400     	movi.2d	v0, #0000000000000000
 45eb080: ad0203e0     	stp	q0, q0, [sp, #0x40]
 45eb084: 3d800fe0     	str	q0, [sp, #0x30]
 45eb088: f9400348     	ldr	x8, [x26]
 45eb08c: b9403509     	ldr	w9, [x8, #0x34]
 45eb090: 7100093f     	cmp	w9, #0x2
 45eb094: 54000101     	b.ne	0x45eb0b4 <_ChromeMain+0x45e5e18>
 45eb098: f9403a69     	ldr	x9, [x19, #0x70]
 45eb09c: b40000c9     	cbz	x9, 0x45eb0b4 <_ChromeMain+0x45e5e18>
 45eb0a0: f9401a6a     	ldr	x10, [x19, #0x30]
 45eb0a4: b400008a     	cbz	x10, 0x45eb0b4 <_ChromeMain+0x45e5e18>
 45eb0a8: f940c529     	ldr	x9, [x9, #0x188]
 45eb0ac: eb0a013f     	cmp	x9, x10
 45eb0b0: 54000fa0     	b.eq	0x45eb2a4 <_ChromeMain+0x45e6008>
 45eb0b4: b9403109     	ldr	w9, [x8, #0x30]
 45eb0b8: 350001c9     	cbnz	w9, 0x45eb0f0 <_ChromeMain+0x45e5e54>
 45eb0bc: b9403508     	ldr	w8, [x8, #0x34]
 45eb0c0: 7100051f     	cmp	w8, #0x1
 45eb0c4: 540000c0     	b.eq	0x45eb0dc <_ChromeMain+0x45e5e40>
 45eb0c8: aa1503e0     	mov	x0, x21
 45eb0cc: 52800001     	mov	w1, #0x0                ; =0
 45eb0d0: 95fff88c     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45eb0d4: f90027e0     	str	x0, [sp, #0x48]
 45eb0d8: b90053e1     	str	w1, [sp, #0x50]
 45eb0dc: aa1503e0     	mov	x0, x21
 45eb0e0: 52800001     	mov	w1, #0x0                ; =0
 45eb0e4: 95fff887     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45eb0e8: f80543e0     	stur	x0, [sp, #0x54]
 45eb0ec: b9005fe1     	str	w1, [sp, #0x5c]
 45eb0f0: 9100c3e1     	add	x1, sp, #0x30
 45eb0f4: aa1503e0     	mov	x0, x21
 45eb0f8: 97daee12     	bl	0x3ca6940 <_ChromeMain+0x3ca16a4>
 45eb0fc: f9405bf3     	ldr	x19, [sp, #0xb0]
 45eb100: b40003d3     	cbz	x19, 0x45eb178 <_ChromeMain+0x45e5edc>
 45eb104: f9405fe8     	ldr	x8, [sp, #0xb8]
 45eb108: d37ced09     	lsl	x9, x8, #4
 45eb10c: b4007149     	cbz	x9, 0x45ebf34 <_ChromeMain+0x45e6c98>
 45eb110: 8b130129     	add	x9, x9, x19
 45eb114: d1004134     	sub	x20, x9, #0x10
 45eb118: cb0813f5     	neg	x21, x8, lsl #4
 45eb11c: f0052e36     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eb120: 52801ff7     	mov	w23, #0xff              ; =255
 45eb124: b4007cd4     	cbz	x20, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45eb128: 39402288     	ldrb	w8, [x20, #0x8]
 45eb12c: 35000108     	cbnz	w8, 0x45eb14c <_ChromeMain+0x45e5eb0>
 45eb130: f9400280     	ldr	x0, [x20]
 45eb134: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45eb138: f94046c9     	ldr	x9, [x22, #0x88]
 45eb13c: eb09011f     	cmp	x8, x9
 45eb140: 54000041     	b.ne	0x45eb148 <_ChromeMain+0x45e5eac>
 45eb144: 96e8de3e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eb148: f900029f     	str	xzr, [x20]
 45eb14c: 39002297     	strb	w23, [x20, #0x8]
 45eb150: d1004294     	sub	x20, x20, #0x10
 45eb154: b10042b5     	adds	x21, x21, #0x10
 45eb158: 54fffe61     	b.ne	0x45eb124 <_ChromeMain+0x45e5e88>
 45eb15c: f9405be0     	ldr	x0, [sp, #0xb0]
 45eb160: cb000268     	sub	x8, x19, x0
 45eb164: 9344fd08     	asr	x8, x8, #4
 45eb168: f9005fe8     	str	x8, [sp, #0xb8]
 45eb16c: f94063e8     	ldr	x8, [sp, #0xc0]
 45eb170: d37ced01     	lsl	x1, x8, #4
 45eb174: 96e87751     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eb178: f85483b3     	ldur	x19, [x29, #-0xb8]
 45eb17c: b50001d3     	cbnz	x19, 0x45eb1b4 <_ChromeMain+0x45e5f18>
 45eb180: f85603b3     	ldur	x19, [x29, #-0xa0]
 45eb184: b5000553     	cbnz	x19, 0x45eb22c <_ChromeMain+0x45e5f90>
 45eb188: a9587bfd     	ldp	x29, x30, [sp, #0x180]
 45eb18c: a9574ff4     	ldp	x20, x19, [sp, #0x170]
 45eb190: a95657f6     	ldp	x22, x21, [sp, #0x160]
 45eb194: a9555ff8     	ldp	x24, x23, [sp, #0x150]
 45eb198: a95467fa     	ldp	x26, x25, [sp, #0x140]
 45eb19c: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 45eb1a0: 6d5223e9     	ldp	d9, d8, [sp, #0x120]
 45eb1a4: 6d512beb     	ldp	d11, d10, [sp, #0x110]
 45eb1a8: 6d5033ed     	ldp	d13, d12, [sp, #0x100]
 45eb1ac: 910643ff     	add	sp, sp, #0x190
 45eb1b0: d65f03c0     	ret
 45eb1b4: f85503a8     	ldur	x8, [x29, #-0xb0]
 45eb1b8: d37ced09     	lsl	x9, x8, #4
 45eb1bc: b4006c09     	cbz	x9, 0x45ebf3c <_ChromeMain+0x45e6ca0>
 45eb1c0: 8b130129     	add	x9, x9, x19
 45eb1c4: d1004134     	sub	x20, x9, #0x10
 45eb1c8: cb0813f5     	neg	x21, x8, lsl #4
 45eb1cc: f0052e36     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eb1d0: 52801ff7     	mov	w23, #0xff              ; =255
 45eb1d4: b4007754     	cbz	x20, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45eb1d8: 39402288     	ldrb	w8, [x20, #0x8]
 45eb1dc: 35000108     	cbnz	w8, 0x45eb1fc <_ChromeMain+0x45e5f60>
 45eb1e0: f9400280     	ldr	x0, [x20]
 45eb1e4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45eb1e8: f94046c9     	ldr	x9, [x22, #0x88]
 45eb1ec: eb09011f     	cmp	x8, x9
 45eb1f0: 54000041     	b.ne	0x45eb1f8 <_ChromeMain+0x45e5f5c>
 45eb1f4: 96e8de12     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eb1f8: f900029f     	str	xzr, [x20]
 45eb1fc: 39002297     	strb	w23, [x20, #0x8]
 45eb200: d1004294     	sub	x20, x20, #0x10
 45eb204: b10042b5     	adds	x21, x21, #0x10
 45eb208: 54fffe61     	b.ne	0x45eb1d4 <_ChromeMain+0x45e5f38>
 45eb20c: f85483a0     	ldur	x0, [x29, #-0xb8]
 45eb210: cb000268     	sub	x8, x19, x0
 45eb214: 9344fd08     	asr	x8, x8, #4
 45eb218: f81503a8     	stur	x8, [x29, #-0xb0]
 45eb21c: f85583a8     	ldur	x8, [x29, #-0xa8]
 45eb220: d37ced01     	lsl	x1, x8, #4
 45eb224: 96e87725     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eb228: 17ffffd6     	b	0x45eb180 <_ChromeMain+0x45e5ee4>
 45eb22c: f85683a8     	ldur	x8, [x29, #-0x98]
 45eb230: d37ced09     	lsl	x9, x8, #4
 45eb234: b4006889     	cbz	x9, 0x45ebf44 <_ChromeMain+0x45e6ca8>
 45eb238: 8b130129     	add	x9, x9, x19
 45eb23c: d1004134     	sub	x20, x9, #0x10
 45eb240: cb0813f5     	neg	x21, x8, lsl #4
 45eb244: f0052e36     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eb248: 52801ff7     	mov	w23, #0xff              ; =255
 45eb24c: b4007394     	cbz	x20, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45eb250: 39402288     	ldrb	w8, [x20, #0x8]
 45eb254: 35000108     	cbnz	w8, 0x45eb274 <_ChromeMain+0x45e5fd8>
 45eb258: f9400280     	ldr	x0, [x20]
 45eb25c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45eb260: f94046c9     	ldr	x9, [x22, #0x88]
 45eb264: eb09011f     	cmp	x8, x9
 45eb268: 54000041     	b.ne	0x45eb270 <_ChromeMain+0x45e5fd4>
 45eb26c: 96e8ddf4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eb270: f900029f     	str	xzr, [x20]
 45eb274: 39002297     	strb	w23, [x20, #0x8]
 45eb278: d1004294     	sub	x20, x20, #0x10
 45eb27c: b10042b5     	adds	x21, x21, #0x10
 45eb280: 54fffe61     	b.ne	0x45eb24c <_ChromeMain+0x45e5fb0>
 45eb284: f85603a0     	ldur	x0, [x29, #-0xa0]
 45eb288: cb000268     	sub	x8, x19, x0
 45eb28c: 9344fd08     	asr	x8, x8, #4
 45eb290: f81683a8     	stur	x8, [x29, #-0x98]
 45eb294: f85703a8     	ldur	x8, [x29, #-0x90]
 45eb298: d37ced01     	lsl	x1, x8, #4
 45eb29c: 96e87707     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eb2a0: 17ffffba     	b	0x45eb188 <_ChromeMain+0x45e5eec>
 45eb2a4: f9402269     	ldr	x9, [x19, #0x40]
 45eb2a8: b941bd29     	ldr	w9, [x9, #0x1bc]
 45eb2ac: f9402e6a     	ldr	x10, [x19, #0x58]
 45eb2b0: b941bd4a     	ldr	w10, [x10, #0x1bc]
 45eb2b4: 6b0a013f     	cmp	w9, w10
 45eb2b8: 54ffefec     	b.gt	0x45eb0b4 <_ChromeMain+0x45e5e18>
 45eb2bc: f9401674     	ldr	x20, [x19, #0x28]
 45eb2c0: f9400688     	ldr	x8, [x20, #0x8]
 45eb2c4: b40076a8     	cbz	x8, 0x45ec198 <_ChromeMain+0x45e6efc>
 45eb2c8: f9429909     	ldr	x9, [x8, #0x530]
 45eb2cc: b4000229     	cbz	x9, 0x45eb310 <_ChromeMain+0x45e6074>
 45eb2d0: f941c133     	ldr	x19, [x9, #0x380]
 45eb2d4: b40001f3     	cbz	x19, 0x45eb310 <_ChromeMain+0x45e6074>
 45eb2d8: f9429d08     	ldr	x8, [x8, #0x538]
 45eb2dc: 9100a109     	add	x9, x8, #0x28
 45eb2e0: f100011f     	cmp	x8, #0x0
 45eb2e4: 9a8903e0     	csel	x0, xzr, x9, eq
 45eb2e8: 97469ab5     	bl	0x1791dbc <_ChromeMain+0x178cb20>
 45eb2ec: 39410288     	ldrb	w8, [x20, #0x40]
 45eb2f0: 7100001f     	cmp	w0, #0x0
 45eb2f4: 1a8813f6     	csel	w22, wzr, w8, ne
 45eb2f8: f9400268     	ldr	x8, [x19]
 45eb2fc: f9423108     	ldr	x8, [x8, #0x460]
 45eb300: aa1303e0     	mov	x0, x19
 45eb304: d63f0100     	blr	x8
 45eb308: 37000056     	tbnz	w22, #0x0, 0x45eb310 <_ChromeMain+0x45e6074>
 45eb30c: 36007640     	tbz	w0, #0x0, 0x45ec1d4 <_ChromeMain+0x45e6f38>
 45eb310: 52800048     	mov	w8, #0x2                ; =2
 45eb314: b90033e8     	str	w8, [sp, #0x30]
 45eb318: 52800048     	mov	w8, #0x2                ; =2
 45eb31c: b9003fe8     	str	w8, [sp, #0x3c]
 45eb320: f9400348     	ldr	x8, [x26]
 45eb324: 17ffff64     	b	0x45eb0b4 <_ChromeMain+0x45e5e18>
 45eb328: f9401669     	ldr	x9, [x19, #0x28]
 45eb32c: f9400520     	ldr	x0, [x9, #0x8]
 45eb330: b4008040     	cbz	x0, 0x45ec338 <_ChromeMain+0x45e709c>
 45eb334: 39738115     	ldrb	w21, [x8, #0xce0]
 45eb338: 952fdd79     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45eb33c: 520002a8     	eor	w8, w21, #0x1
 45eb340: 0a080008     	and	w8, w0, w8
 45eb344: f9400ff5     	ldr	x21, [sp, #0x18]
 45eb348: 1400005c     	b	0x45eb4b8 <_ChromeMain+0x45e621c>
 45eb34c: f9403e68     	ldr	x8, [x19, #0x78]
 45eb350: b941b909     	ldr	w9, [x8, #0x1b8]
 45eb354: b941c10a     	ldr	w10, [x8, #0x1c0]
 45eb358: 0b090149     	add	w9, w10, w9
 45eb35c: b900afe9     	str	w9, [sp, #0xac]
 45eb360: f9410d18     	ldr	x24, [x8, #0x218]
 45eb364: f9400308     	ldr	x8, [x24]
 45eb368: f9401108     	ldr	x8, [x8, #0x20]
 45eb36c: d0052741     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45eb370: 911e2021     	add	x1, x1, #0x788
 45eb374: aa1803e0     	mov	x0, x24
 45eb378: d63f0100     	blr	x8
 45eb37c: b4006ef8     	cbz	x24, 0x45ec158 <_ChromeMain+0x45e6ebc>
 45eb380: 36006ec0     	tbz	w0, #0x0, 0x45ec158 <_ChromeMain+0x45e6ebc>
 45eb384: 39448268     	ldrb	w8, [x19, #0x120]
 45eb388: 34000108     	cbz	w8, 0x45eb3a8 <_ChromeMain+0x45e610c>
 45eb38c: f9400348     	ldr	x8, [x26]
 45eb390: b9403108     	ldr	w8, [x8, #0x30]
 45eb394: 121f7908     	and	w8, w8, #0xfffffffe
 45eb398: 7100091f     	cmp	w8, #0x2
 45eb39c: 54000060     	b.eq	0x45eb3a8 <_ChromeMain+0x45e610c>
 45eb3a0: fd4042c0     	ldr	d0, [x22, #0x80]
 45eb3a4: 1e624008     	fcvt	s8, d0
 45eb3a8: f9403e75     	ldr	x21, [x19, #0x78]
 45eb3ac: a901e3f5     	stp	x21, x24, [sp, #0x18]
 45eb3b0: b4000835     	cbz	x21, 0x45eb4b4 <_ChromeMain+0x45e6218>
 45eb3b4: f9401668     	ldr	x8, [x19, #0x28]
 45eb3b8: f9400508     	ldr	x8, [x8, #0x8]
 45eb3bc: b4006f48     	cbz	x8, 0x45ec1a4 <_ChromeMain+0x45e6f08>
 45eb3c0: f9429d08     	ldr	x8, [x8, #0x538]
 45eb3c4: 9100a109     	add	x9, x8, #0x28
 45eb3c8: f100011f     	cmp	x8, #0x0
 45eb3cc: 9a8903e9     	csel	x9, xzr, x9, eq
 45eb3d0: f940b128     	ldr	x8, [x9, #0x160]
 45eb3d4: f0052e38     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45eb3d8: b40002e8     	cbz	x8, 0x45eb434 <_ChromeMain+0x45e6198>
 45eb3dc: 91058129     	add	x9, x9, #0x160
 45eb3e0: 9005148a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb3e4: 9108614a     	add	x10, x10, #0x218
 45eb3e8: 1400000d     	b	0x45eb41c <_ChromeMain+0x45e6180>
 45eb3ec: eb09011f     	cmp	x8, x9
 45eb3f0: 54000220     	b.eq	0x45eb434 <_ChromeMain+0x45e6198>
 45eb3f4: f9401517     	ldr	x23, [x8, #0x28]
 45eb3f8: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 45eb3fc: f9404709     	ldr	x9, [x24, #0x88]
 45eb400: eb09011f     	cmp	x8, x9
 45eb404: 540001a1     	b.ne	0x45eb438 <_ChromeMain+0x45e619c>
 45eb408: aa1703e0     	mov	x0, x23
 45eb40c: 96e8a3bc     	bl	0x142fc <_ChromeMain+0xf060>
 45eb410: 1400000a     	b	0x45eb438 <_ChromeMain+0x45e619c>
 45eb414: f9400108     	ldr	x8, [x8]
 45eb418: b40000e8     	cbz	x8, 0x45eb434 <_ChromeMain+0x45e6198>
 45eb41c: f940110b     	ldr	x11, [x8, #0x20]
 45eb420: eb0a017f     	cmp	x11, x10
 45eb424: 54ffff88     	b.hi	0x45eb414 <_ChromeMain+0x45e6178>
 45eb428: 54fffe20     	b.eq	0x45eb3ec <_ChromeMain+0x45e6150>
 45eb42c: f9400508     	ldr	x8, [x8, #0x8]
 45eb430: b5ffff68     	cbnz	x8, 0x45eb41c <_ChromeMain+0x45e6180>
 45eb434: d2800017     	mov	x23, #0x0               ; =0
 45eb438: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 45eb43c: f9404709     	ldr	x9, [x24, #0x88]
 45eb440: eb09011f     	cmp	x8, x9
 45eb444: 54000061     	b.ne	0x45eb450 <_ChromeMain+0x45e61b4>
 45eb448: aa1703e0     	mov	x0, x23
 45eb44c: 96e8dd7c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45eb450: 90051481     	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb454: 910a4021     	add	x1, x1, #0x290
 45eb458: aa1703e0     	mov	x0, x23
 45eb45c: 972fe4bf     	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 45eb460: f9401c08     	ldr	x8, [x0, #0x38]
 45eb464: 90051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb468: 910a8129     	add	x9, x9, #0x2a0
 45eb46c: eb09011f     	cmp	x8, x9
 45eb470: f94013f8     	ldr	x24, [sp, #0x20]
 45eb474: 54000200     	b.eq	0x45eb4b4 <_ChromeMain+0x45e6218>
 45eb478: 90051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb47c: 910a6129     	add	x9, x9, #0x298
 45eb480: 9005148a     	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb484: 910aa14a     	add	x10, x10, #0x2a8
 45eb488: eb0a011f     	cmp	x8, x10
 45eb48c: fa491104     	ccmp	x8, x9, #0x4, ne
 45eb490: 90051489     	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 45eb494: 910ac129     	add	x9, x9, #0x2b0
 45eb498: fa491104     	ccmp	x8, x9, #0x4, ne
 45eb49c: 540000c0     	b.eq	0x45eb4b4 <_ChromeMain+0x45e6218>
 45eb4a0: f9403e68     	ldr	x8, [x19, #0x78]
 45eb4a4: 39682109     	ldrb	w9, [x8, #0xa08]
 45eb4a8: 37000069     	tbnz	w9, #0x0, 0x45eb4b4 <_ChromeMain+0x45e6218>
 45eb4ac: 39683109     	ldrb	w9, [x8, #0xa0c]
 45eb4b0: 3607f3c9     	tbz	w9, #0x0, 0x45eb328 <_ChromeMain+0x45e608c>
 45eb4b4: 52800008     	mov	w8, #0x0                ; =0
 45eb4b8: 396832a9     	ldrb	w9, [x21, #0xa0c]
 45eb4bc: b9002fe9     	str	w9, [sp, #0x2c]
 45eb4c0: b90013e8     	str	w8, [sp, #0x10]
 45eb4c4: 34000869     	cbz	w9, 0x45eb5d0 <_ChromeMain+0x45e6334>
 45eb4c8: f9401a77     	ldr	x23, [x19, #0x30]
 45eb4cc: b40002d7     	cbz	x23, 0x45eb524 <_ChromeMain+0x45e6288>
 45eb4d0: f94002e8     	ldr	x8, [x23]
 45eb4d4: f9402d08     	ldr	x8, [x8, #0x58]
 45eb4d8: aa1703e0     	mov	x0, x23
 45eb4dc: d63f0100     	blr	x8
 45eb4e0: aa0003f8     	mov	x24, x0
 45eb4e4: 90054e95     	adrp	x21, 0xefbb000 <dyld_stub_binder+0xefbb000>
 45eb4e8: f94002a0     	ldr	x0, [x21]
 45eb4ec: b5000060     	cbnz	x0, 0x45eb4f8 <_ChromeMain+0x45e625c>
 45eb4f0: 97ff32d7     	bl	0x45b804c <_ChromeMain+0x45b2db0>
 45eb4f4: f90002a0     	str	x0, [x21]
 45eb4f8: f100031f     	cmp	x24, #0x0
 45eb4fc: 1a9f07e8     	cset	w8, ne
 45eb500: eb00031f     	cmp	x24, x0
 45eb504: fa401b04     	ccmp	x24, #0x0, #0x4, ne
 45eb508: 54000100     	b.eq	0x45eb528 <_ChromeMain+0x45e628c>
 45eb50c: f9402718     	ldr	x24, [x24, #0x48]
 45eb510: f100031f     	cmp	x24, #0x0
 45eb514: 1a9f07e8     	cset	w8, ne
 45eb518: fa401304     	ccmp	x24, x0, #0x4, ne
 45eb51c: 54ffff81     	b.ne	0x45eb50c <_ChromeMain+0x45e6270>
 45eb520: 14000002     	b	0x45eb528 <_ChromeMain+0x45e628c>
 45eb524: 52800008     	mov	w8, #0x0                ; =0
 45eb528: 5283d5f8     	mov	w24, #0x1eaf            ; =7855
 45eb52c: 72a00098     	movk	w24, #0x4, lsl #16
 45eb530: f10002ff     	cmp	x23, #0x0
 45eb534: 1a9f07e9     	cset	w9, ne
 45eb538: d107c2ea     	sub	x10, x23, #0x1f0
 45eb53c: 6a08013f     	tst	w9, w8
 45eb540: 9a9f1155     	csel	x21, x10, xzr, ne
 45eb544: 97621843     	bl	0x1e71650 <_ChromeMain+0x1e6c3b4>
 45eb548: aa0003f7     	mov	x23, x0
 45eb54c: 6b18001f     	cmp	w0, w24
 45eb550: 1a9fd7f9     	cset	w25, gt
 45eb554: 5400022d     	b.le	0x45eb598 <_ChromeMain+0x45e62fc>
 45eb558: b4000215     	cbz	x21, 0x45eb598 <_ChromeMain+0x45e62fc>
 45eb55c: f9429aa8     	ldr	x8, [x21, #0x530]
 45eb560: b40001c8     	cbz	x8, 0x45eb598 <_ChromeMain+0x45e62fc>
 45eb564: f941c100     	ldr	x0, [x8, #0x380]
 45eb568: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 45eb56c: b90083ff     	str	wzr, [sp, #0x80]
 45eb570: b4000140     	cbz	x0, 0x45eb598 <_ChromeMain+0x45e62fc>
 45eb574: f9400008     	ldr	x8, [x0]
 45eb578: f9424509     	ldr	x9, [x8, #0x488]
 45eb57c: 9101c3e8     	add	x8, sp, #0x70
 45eb580: d63f0120     	blr	x9
 45eb584: 394203e8     	ldrb	w8, [sp, #0x80]
 45eb588: 36000088     	tbz	w8, #0x0, 0x45eb598 <_ChromeMain+0x45e62fc>
 45eb58c: 2d4e33ed     	ldp	s13, s12, [sp, #0x70]
 45eb590: 2d4f2beb     	ldp	s11, s10, [sp, #0x78]
 45eb594: 14000008     	b	0x45eb5b4 <_ChromeMain+0x45e6318>
 45eb598: 6b1b02ff     	cmp	w23, w27
 45eb59c: 1e241000     	fmov	s0, #8.00000000
 45eb5a0: 1e261001     	fmov	s1, #16.00000000
 45eb5a4: 1e20cc2a     	fcsel	s10, s1, s0, gt
 45eb5a8: 4eaa1d4b     	mov.16b	v11, v10
 45eb5ac: 4eaa1d4c     	mov.16b	v12, v10
 45eb5b0: 4eaa1d4d     	mov.16b	v13, v10
 45eb5b4: 6b1802ff     	cmp	w23, w24
 45eb5b8: 52a81008     	mov	w8, #0x40800000         ; =1082130432
 45eb5bc: d2a81009     	mov	x9, #0x40800000         ; =1082130432
 45eb5c0: f2c00029     	movk	x9, #0x1, lsl #32
 45eb5c4: 9a88c121     	csel	x1, x9, x8, gt
 45eb5c8: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45eb5cc: 14000007     	b	0x45eb5e8 <_ChromeMain+0x45e634c>
 45eb5d0: 52800019     	mov	w25, #0x0               ; =0
 45eb5d4: 6f00e40a     	movi.2d	v10, #0000000000000000
 45eb5d8: 52a81001     	mov	w1, #0x40800000         ; =1082130432
 45eb5dc: 6f00e40b     	movi.2d	v11, #0000000000000000
 45eb5e0: 6f00e40c     	movi.2d	v12, #0000000000000000
 45eb5e4: 6f00e40d     	movi.2d	v13, #0000000000000000
 45eb5e8: aa1803e0     	mov	x0, x24
 45eb5ec: 97ff97a4     	bl	0x45d147c <_ChromeMain+0x45cc1e0>
 45eb5f0: f94012b7     	ldr	x23, [x21, #0x20]
 45eb5f4: b5000817     	cbnz	x23, 0x45eb6f4 <_ChromeMain+0x45e6458>
 45eb5f8: b9402fe8     	ldr	w8, [sp, #0x2c]
 45eb5fc: 340007c8     	cbz	w8, 0x45eb6f4 <_ChromeMain+0x45e6458>
 45eb600: aa1503e0     	mov	x0, x21
 45eb604: 52800021     	mov	w1, #0x1                ; =1
 45eb608: 9758a8a1     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 45eb60c: f94012b7     	ldr	x23, [x21, #0x20]
 45eb610: b9400ae8     	ldr	w8, [x23, #0x8]
 45eb614: 7100091f     	cmp	w8, #0x2
 45eb618: 54005cc0     	b.eq	0x45ec1b0 <_ChromeMain+0x45e6f14>
 45eb61c: 39422ae8     	ldrb	w8, [x23, #0x8a]
 45eb620: 340000a8     	cbz	w8, 0x45eb634 <_ChromeMain+0x45e6398>
 45eb624: 39022aff     	strb	wzr, [x23, #0x8a]
 45eb628: f940b6e0     	ldr	x0, [x23, #0x168]
 45eb62c: 52800001     	mov	w1, #0x0                ; =0
 45eb630: 971f8944     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 45eb634: aa1803e0     	mov	x0, x24
 45eb638: d2801ec1     	mov	x1, #0xf6               ; =246
 45eb63c: f2c00041     	movk	x1, #0x2, lsl #32
 45eb640: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45eb644: 97ff96ed     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45eb648: bd406700     	ldr	s0, [x24, #0x64]
 45eb64c: d004cb28     	adrp	x8, 0xdf51000 <dyld_stub_binder+0xdf51000>
 45eb650: bd48f101     	ldr	s1, [x8, #0x8f0]
 45eb654: 1e212000     	fcmp	s0, s1
 45eb658: 540000e0     	b.eq	0x45eb674 <_ChromeMain+0x45e63d8>
 45eb65c: 529d70a8     	mov	w8, #0xeb85             ; =60293
 45eb660: 72a7ea28     	movk	w8, #0x3f51, lsl #16
 45eb664: b9006708     	str	w8, [x24, #0x64]
 45eb668: f9409300     	ldr	x0, [x24, #0x120]
 45eb66c: b4005ae0     	cbz	x0, 0x45ec1c8 <_ChromeMain+0x45e6f2c>
 45eb670: 96fed6c3     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45eb674: b4000817     	cbz	x23, 0x45eb774 <_ChromeMain+0x45e64d8>
 45eb678: 52a83008     	mov	w8, #0x41800000         ; =1098907648
 45eb67c: b900aae8     	str	w8, [x23, #0xa8]
 45eb680: aa1703e0     	mov	x0, x23
 45eb684: 95715f7d     	bl	0xa243478 <_ChromeMain+0xa23e1dc>
 45eb688: bd4172e0     	ldr	s0, [x23, #0x170]
 45eb68c: b004cb28     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 45eb690: bd4b5d01     	ldr	s1, [x8, #0xb5c]
 45eb694: 1e201820     	fdiv	s0, s1, s0
 45eb698: bd0182e0     	str	s0, [x23, #0x180]
 45eb69c: f940b6e0     	ldr	x0, [x23, #0x168]
 45eb6a0: 9546c272     	bl	0x979c068 <_ChromeMain+0x9796dcc>
 45eb6a4: 6f00e400     	movi.2d	v0, #0000000000000000
 45eb6a8: 6f00e401     	movi.2d	v1, #0000000000000000
 45eb6ac: 6f00e402     	movi.2d	v2, #0000000000000000
 45eb6b0: 6f00e403     	movi.2d	v3, #0000000000000000
 45eb6b4: 370000b9     	tbnz	w25, #0x0, 0x45eb6c8 <_ChromeMain+0x45e642c>
 45eb6b8: 4ead1da0     	mov.16b	v0, v13
 45eb6bc: 4eac1d81     	mov.16b	v1, v12
 45eb6c0: 4eab1d62     	mov.16b	v2, v11
 45eb6c4: 4eaa1d43     	mov.16b	v3, v10
 45eb6c8: 2d0e07e0     	stp	s0, s1, [sp, #0x70]
 45eb6cc: 2d0f0fe2     	stp	s2, s3, [sp, #0x78]
 45eb6d0: f940b2e0     	ldr	x0, [x23, #0x160]
 45eb6d4: b4005d00     	cbz	x0, 0x45ec274 <_ChromeMain+0x45e6fd8>
 45eb6d8: 9101c3e1     	add	x1, sp, #0x70
 45eb6dc: 9775b93c     	bl	0x2359bcc <_ChromeMain+0x2354930>
 45eb6e0: 52000321     	eor	w1, w25, #0x1
 45eb6e4: aa1703e0     	mov	x0, x23
 45eb6e8: 978def9b     	bl	0x2967554 <_ChromeMain+0x29622b8>
 45eb6ec: b90017ff     	str	wzr, [sp, #0x14]
 45eb6f0: 14000023     	b	0x45eb77c <_ChromeMain+0x45e64e0>
 45eb6f4: b9402fe8     	ldr	w8, [sp, #0x2c]
 45eb6f8: 35fff9e8     	cbnz	w8, 0x45eb634 <_ChromeMain+0x45e6398>
 45eb6fc: aa1803e0     	mov	x0, x24
 45eb700: d2801dc1     	mov	x1, #0xee               ; =238
 45eb704: f2c00041     	movk	x1, #0x2, lsl #32
 45eb708: 52a7f002     	mov	w2, #0x3f800000         ; =1065353216
 45eb70c: 97ff96bb     	bl	0x45d11f8 <_ChromeMain+0x45cbf5c>
 45eb710: bd406700     	ldr	s0, [x24, #0x64]
 45eb714: 1e202008     	fcmp	s0, #0.0
 45eb718: 540000a0     	b.eq	0x45eb72c <_ChromeMain+0x45e6490>
 45eb71c: b900671f     	str	wzr, [x24, #0x64]
 45eb720: f9409300     	ldr	x0, [x24, #0x120]
 45eb724: b4005b40     	cbz	x0, 0x45ec28c <_ChromeMain+0x45e6ff0>
 45eb728: 96fed695     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45eb72c: b4000257     	cbz	x23, 0x45eb774 <_ChromeMain+0x45e64d8>
 45eb730: b900aaff     	str	wzr, [x23, #0xa8]
 45eb734: aa1703e0     	mov	x0, x23
 45eb738: 95715f50     	bl	0xa243478 <_ChromeMain+0xa23e1dc>
 45eb73c: bd4172e0     	ldr	s0, [x23, #0x170]
 45eb740: 1e2e1001     	fmov	s1, #1.00000000
 45eb744: 1e201820     	fdiv	s0, s1, s0
 45eb748: bd0182e0     	str	s0, [x23, #0x180]
 45eb74c: f940b6e0     	ldr	x0, [x23, #0x168]
 45eb750: 9546c246     	bl	0x979c068 <_ChromeMain+0x9796dcc>
 45eb754: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 45eb758: f940b2e0     	ldr	x0, [x23, #0x160]
 45eb75c: b40059e0     	cbz	x0, 0x45ec298 <_ChromeMain+0x45e6ffc>
 45eb760: 9101c3e1     	add	x1, sp, #0x70
 45eb764: 9775b91a     	bl	0x2359bcc <_ChromeMain+0x2354930>
 45eb768: aa1703e0     	mov	x0, x23
 45eb76c: 52800001     	mov	w1, #0x0                ; =0
 45eb770: 17ffffde     	b	0x45eb6e8 <_ChromeMain+0x45e644c>
 45eb774: 52800028     	mov	w8, #0x1                ; =1
 45eb778: b90017e8     	str	w8, [sp, #0x14]
 45eb77c: 6f00e400     	movi.2d	v0, #0000000000000000
 45eb780: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45eb784: 3d801fe0     	str	q0, [sp, #0x70]
 45eb788: f9400348     	ldr	x8, [x26]
 45eb78c: b9403108     	ldr	w8, [x8, #0x30]
 45eb790: 350001a8     	cbnz	w8, 0x45eb7c4 <_ChromeMain+0x45e6528>
 45eb794: b94062c8     	ldr	w8, [x22, #0x60]
 45eb798: 350000c8     	cbnz	w8, 0x45eb7b0 <_ChromeMain+0x45e6514>
 45eb79c: aa1803e0     	mov	x0, x24
 45eb7a0: 52800021     	mov	w1, #0x1                ; =1
 45eb7a4: 95fff6d7     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45eb7a8: f9003be0     	str	x0, [sp, #0x70]
 45eb7ac: b9007be1     	str	w1, [sp, #0x78]
 45eb7b0: aa1803e0     	mov	x0, x24
 45eb7b4: 52800001     	mov	w1, #0x0                ; =0
 45eb7b8: 95fff6d2     	bl	0xc5e9300 <_ChromeMain+0xc5e4064>
 45eb7bc: f90047e0     	str	x0, [sp, #0x88]
 45eb7c0: b90093e1     	str	w1, [sp, #0x90]
 45eb7c4: fd4036c0     	ldr	d0, [x22, #0x68]
 45eb7c8: 1e602008     	fcmp	d0, #0.0
 45eb7cc: 54000645     	b.pl	0x45eb894 <_ChromeMain+0x45e65f8>
 45eb7d0: f9406268     	ldr	x8, [x19, #0xc0]
 45eb7d4: b40001c8     	cbz	x8, 0x45eb80c <_ChromeMain+0x45e6570>
 45eb7d8: 39472109     	ldrb	w9, [x8, #0x1c8]
 45eb7dc: 34000189     	cbz	w9, 0x45eb80c <_ChromeMain+0x45e6570>
 45eb7e0: b9449118     	ldr	w24, [x8, #0x490]
 45eb7e4: f0054915     	adrp	x21, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45eb7e8: b947aaa0     	ldr	w0, [x21, #0x7a8]
 45eb7ec: 34004100     	cbz	w0, 0x45ec00c <_ChromeMain+0x45e6d70>
 45eb7f0: 7100071f     	cmp	w24, #0x1
 45eb7f4: 1a9f17e8     	cset	w8, eq
 45eb7f8: 7100041f     	cmp	w0, #0x1
 45eb7fc: 1a9f07e9     	cset	w9, ne
 45eb800: 4a090115     	eor	w21, w8, w9
 45eb804: f94013f8     	ldr	x24, [sp, #0x20]
 45eb808: 14000002     	b	0x45eb810 <_ChromeMain+0x45e6574>
 45eb80c: 52800015     	mov	w21, #0x0               ; =0
 45eb810: f9401668     	ldr	x8, [x19, #0x28]
 45eb814: f9400500     	ldr	x0, [x8, #0x8]
 45eb818: b4004d20     	cbz	x0, 0x45ec1bc <_ChromeMain+0x45e6f20>
 45eb81c: 9748b8c1     	bl	0x1819b20 <_ChromeMain+0x1814884>
 45eb820: 2a0002a8     	orr	w8, w21, w0
 45eb824: f9400ff5     	ldr	x21, [sp, #0x18]
 45eb828: 34000368     	cbz	w8, 0x45eb894 <_ChromeMain+0x45e65f8>
 45eb82c: 396822a8     	ldrb	w8, [x21, #0xa08]
 45eb830: 7100011f     	cmp	w8, #0x0
 45eb834: 52800028     	mov	w8, #0x1                ; =1
 45eb838: 1a881509     	cinc	w9, w8, eq
 45eb83c: b9007fe9     	str	w9, [sp, #0x7c]
 45eb840: b9406b09     	ldr	w9, [x24, #0x68]
 45eb844: 1e620120     	scvtf	d0, w9
 45eb848: fd4036c1     	ldr	d1, [x22, #0x68]
 45eb84c: 1e608820     	fnmul	d0, d1, d0
 45eb850: 1e664000     	frinta	d0, d0
 45eb854: d2f83c09     	mov	x9, #-0x3e20000000000000 ; =-4476578029606273024
 45eb858: 9e670121     	fmov	d1, x9
 45eb85c: 1e612000     	fcmp	d0, d1
 45eb860: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45eb864: 1a89b3e9     	csel	w9, wzr, w9, lt
 45eb868: 1e616801     	fmaxnm	d1, d0, d1
 45eb86c: 1e78002a     	fcvtzs	w10, d1
 45eb870: 9004cb0b     	adrp	x11, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45eb874: fd466561     	ldr	d1, [x11, #0xcc8]
 45eb878: 1e612000     	fcmp	d0, d1
 45eb87c: 1a899149     	csel	w9, w10, w9, ls
 45eb880: 394213ea     	ldrb	w10, [sp, #0x84]
 45eb884: 1e220120     	scvtf	s0, w9
 45eb888: bd0083e0     	str	s0, [sp, #0x80]
 45eb88c: 3700004a     	tbnz	w10, #0x0, 0x45eb894 <_ChromeMain+0x45e65f8>
 45eb890: 390213e8     	strb	w8, [sp, #0x84]
 45eb894: fd403ac0     	ldr	d0, [x22, #0x70]
 45eb898: 1e602008     	fcmp	d0, #0.0
 45eb89c: 54000345     	b.pl	0x45eb904 <_ChromeMain+0x45e6668>
 45eb8a0: 1e614009     	fneg	d9, d0
 45eb8a4: 52800028     	mov	w8, #0x1                ; =1
 45eb8a8: b90097e8     	str	w8, [sp, #0x94]
 45eb8ac: b9406b09     	ldr	w9, [x24, #0x68]
 45eb8b0: 1e620121     	scvtf	d1, w9
 45eb8b4: 1e618800     	fnmul	d0, d0, d1
 45eb8b8: 1e664000     	frinta	d0, d0
 45eb8bc: d2f83c09     	mov	x9, #-0x3e20000000000000 ; =-4476578029606273024
 45eb8c0: 9e670121     	fmov	d1, x9
 45eb8c4: 1e612000     	fcmp	d0, d1
 45eb8c8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45eb8cc: 1a89b3e9     	csel	w9, wzr, w9, lt
 45eb8d0: 1e616801     	fmaxnm	d1, d0, d1
 45eb8d4: 1e78002a     	fcvtzs	w10, d1
 45eb8d8: 9004cb0b     	adrp	x11, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 45eb8dc: fd466561     	ldr	d1, [x11, #0xcc8]
 45eb8e0: 1e612000     	fcmp	d0, d1
 45eb8e4: 1a89914a     	csel	w10, w10, w9, ls
 45eb8e8: 394273e9     	ldrb	w9, [sp, #0x9c]
 45eb8ec: b9000fea     	str	w10, [sp, #0xc]
 45eb8f0: 1e220140     	scvtf	s0, w10
 45eb8f4: bd009be0     	str	s0, [sp, #0x98]
 45eb8f8: 370000a9     	tbnz	w9, #0x0, 0x45eb90c <_ChromeMain+0x45e6670>
 45eb8fc: 390273e8     	strb	w8, [sp, #0x9c]
 45eb900: 14000003     	b	0x45eb90c <_ChromeMain+0x45e6670>
 45eb904: b9000fff     	str	wzr, [sp, #0xc]
 45eb908: 6f00e409     	movi.2d	v9, #0000000000000000
 45eb90c: b9402fe8     	ldr	w8, [sp, #0x2c]
 45eb910: 340002e8     	cbz	w8, 0x45eb96c <_ChromeMain+0x45e66d0>
 45eb914: f0054918     	adrp	x24, 0xef0e000 <dyld_stub_binder+0xef0e000>
 45eb918: b947ab00     	ldr	w0, [x24, #0x7a8]
 45eb91c: 34003600     	cbz	w0, 0x45ebfdc <_ChromeMain+0x45e6d40>
 45eb920: 7100041f     	cmp	w0, #0x1
 45eb924: 52800028     	mov	w8, #0x1                ; =1
 45eb928: b90073e8     	str	w8, [sp, #0x70]
 45eb92c: 1e2d0d80     	fcsel	s0, s12, s13, eq
 45eb930: bd0077e0     	str	s0, [sp, #0x74]
 45eb934: 3901e3e8     	strb	w8, [sp, #0x78]
 45eb938: 1e2c0da0     	fcsel	s0, s13, s12, eq
 45eb93c: b9007fe8     	str	w8, [sp, #0x7c]
 45eb940: bd0083e0     	str	s0, [sp, #0x80]
 45eb944: 390213e8     	strb	w8, [sp, #0x84]
 45eb948: 1e2b0d40     	fcsel	s0, s10, s11, eq
 45eb94c: b90097e8     	str	w8, [sp, #0x94]
 45eb950: bd009be0     	str	s0, [sp, #0x98]
 45eb954: 390273e8     	strb	w8, [sp, #0x9c]
 45eb958: 1e2a0d60     	fcsel	s0, s11, s10, eq
 45eb95c: b9008be8     	str	w8, [sp, #0x88]
 45eb960: bd008fe0     	str	s0, [sp, #0x8c]
 45eb964: 390243e8     	strb	w8, [sp, #0x90]
 45eb968: f94013f8     	ldr	x24, [sp, #0x20]
 45eb96c: 9101c3e1     	add	x1, sp, #0x70
 45eb970: aa1803e0     	mov	x0, x24
 45eb974: 97daebf3     	bl	0x3ca6940 <_ChromeMain+0x3ca16a4>
 45eb978: 350003b9     	cbnz	w25, 0x45eb9ec <_ChromeMain+0x45e6750>
 45eb97c: f940eea8     	ldr	x8, [x21, #0x1d8]
 45eb980: f9402d08     	ldr	x8, [x8, #0x58]
 45eb984: b5000088     	cbnz	x8, 0x45eb994 <_ChromeMain+0x45e66f8>
 45eb988: b94017e8     	ldr	w8, [sp, #0x14]
 45eb98c: 360002a8     	tbz	w8, #0x0, 0x45eb9e0 <_ChromeMain+0x45e6744>
 45eb990: 14000066     	b	0x45ebb28 <_ChromeMain+0x45e688c>
 45eb994: 9100c3e0     	add	x0, sp, #0x30
 45eb998: 52800001     	mov	w1, #0x0                ; =0
 45eb99c: 97360ec9     	bl	0x136f4c0 <_ChromeMain+0x136a224>
 45eb9a0: 910762a0     	add	x0, x21, #0x1d8
 45eb9a4: 9100c3e1     	add	x1, sp, #0x30
 45eb9a8: 972a5bde     	bl	0x1082920 <_ChromeMain+0x107d684>
 45eb9ac: f94012a8     	ldr	x8, [x21, #0x20]
 45eb9b0: b5002ce8     	cbnz	x8, 0x45ebf4c <_ChromeMain+0x45e6cb0>
 45eb9b4: f9401be0     	ldr	x0, [sp, #0x30]
 45eb9b8: b40000a0     	cbz	x0, 0x45eb9cc <_ChromeMain+0x45e6730>
 45eb9bc: 12800008     	mov	w8, #-0x1               ; =-1
 45eb9c0: b8e80008     	ldaddal	w8, w8, [x0]
 45eb9c4: 7100051f     	cmp	w8, #0x1
 45eb9c8: 540029a0     	b.eq	0x45ebefc <_ChromeMain+0x45e6c60>
 45eb9cc: b94017e8     	ldr	w8, [sp, #0x14]
 45eb9d0: 37000ac8     	tbnz	w8, #0x0, 0x45ebb28 <_ChromeMain+0x45e688c>
 45eb9d4: aa1703e0     	mov	x0, x23
 45eb9d8: d2800001     	mov	x1, #0x0                ; =0
 45eb9dc: 977d6567     	bl	0x2544f78 <_ChromeMain+0x253fcdc>
 45eb9e0: aa1703e0     	mov	x0, x23
 45eb9e4: 97f721d7     	bl	0x43b4140 <_ChromeMain+0x43aeea4>
 45eb9e8: 14000050     	b	0x45ebb28 <_ChromeMain+0x45e688c>
 45eb9ec: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 45eb9f0: f9409308     	ldr	x8, [x24, #0x120]
 45eb9f4: b4003608     	cbz	x8, 0x45ec0b4 <_ChromeMain+0x45e6e18>
 45eb9f8: f940e108     	ldr	x8, [x8, #0x1c0]
 45eb9fc: a90323ff     	stp	xzr, x8, [sp, #0x30]
 45eba00: 910183f5     	add	x21, sp, #0x60
 45eba04: 910183e8     	add	x8, sp, #0x60
 45eba08: 9100c3e1     	add	x1, sp, #0x30
 45eba0c: aa1803e0     	mov	x0, x24
 45eba10: d2800002     	mov	x2, #0x0                ; =0
 45eba14: 97ff973f     	bl	0x45d1710 <_ChromeMain+0x45cc474>
 45eba18: f9400fe9     	ldr	x9, [sp, #0x18]
 45eba1c: 91076128     	add	x8, x9, #0x1d8
 45eba20: eb15011f     	cmp	x8, x21
 45eba24: aa0903f5     	mov	x21, x9
 45eba28: 540006a0     	b.eq	0x45ebafc <_ChromeMain+0x45e6860>
 45eba2c: 394782a9     	ldrb	w9, [x21, #0x1e0]
 45eba30: 3941a3ea     	ldrb	w10, [sp, #0x68]
 45eba34: 6b0a013f     	cmp	w9, w10
 45eba38: 54000581     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45eba3c: f9400108     	ldr	x8, [x8]
 45eba40: f94033e9     	ldr	x9, [sp, #0x60]
 45eba44: eb09011f     	cmp	x8, x9
 45eba48: 540005a0     	b.eq	0x45ebafc <_ChromeMain+0x45e6860>
 45eba4c: f9401d0c     	ldr	x12, [x8, #0x38]
 45eba50: f9401d2a     	ldr	x10, [x9, #0x38]
 45eba54: eb0a019f     	cmp	x12, x10
 45eba58: 54000481     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45eba5c: b40001ec     	cbz	x12, 0x45eba98 <_ChromeMain+0x45e67fc>
 45eba60: f940190a     	ldr	x10, [x8, #0x30]
 45eba64: f940192b     	ldr	x11, [x9, #0x30]
 45eba68: eb0b015f     	cmp	x10, x11
 45eba6c: 54000160     	b.eq	0x45eba98 <_ChromeMain+0x45e67fc>
 45eba70: d37df18d     	lsl	x13, x12, #3
 45eba74: b400012d     	cbz	x13, 0x45eba98 <_ChromeMain+0x45e67fc>
 45eba78: 8b0c0d4c     	add	x12, x10, x12, lsl #3
 45eba7c: 2cc10540     	ldp	s0, s1, [x10], #0x8
 45eba80: 2cc10d62     	ldp	s2, s3, [x11], #0x8
 45eba84: 1e222000     	fcmp	s0, s2
 45eba88: 1e230420     	fccmp	s1, s3, #0x0, eq
 45eba8c: 540002e1     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45eba90: eb0c015f     	cmp	x10, x12
 45eba94: 54ffff41     	b.ne	0x45eba7c <_ChromeMain+0x45e67e0>
 45eba98: f940250c     	ldr	x12, [x8, #0x48]
 45eba9c: f940252a     	ldr	x10, [x9, #0x48]
 45ebaa0: eb0a019f     	cmp	x12, x10
 45ebaa4: 54000221     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45ebaa8: b40000ac     	cbz	x12, 0x45ebabc <_ChromeMain+0x45e6820>
 45ebaac: f940210a     	ldr	x10, [x8, #0x40]
 45ebab0: f940212b     	ldr	x11, [x9, #0x40]
 45ebab4: eb0b015f     	cmp	x10, x11
 45ebab8: 54001fa1     	b.ne	0x45ebeac <_ChromeMain+0x45e6c10>
 45ebabc: f9402d02     	ldr	x2, [x8, #0x58]
 45ebac0: f9402d2a     	ldr	x10, [x9, #0x58]
 45ebac4: eb0a005f     	cmp	x2, x10
 45ebac8: 54000101     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45ebacc: b4000182     	cbz	x2, 0x45ebafc <_ChromeMain+0x45e6860>
 45ebad0: f9402900     	ldr	x0, [x8, #0x50]
 45ebad4: f9402921     	ldr	x1, [x9, #0x50]
 45ebad8: eb01001f     	cmp	x0, x1
 45ebadc: 54000100     	b.eq	0x45ebafc <_ChromeMain+0x45e6860>
 45ebae0: 94e87760     	bl	0x8009860 <_ChromeMain+0x80045c4>
 45ebae4: 340000c0     	cbz	w0, 0x45ebafc <_ChromeMain+0x45e6860>
 45ebae8: 910762a0     	add	x0, x21, #0x1d8
 45ebaec: 910183e1     	add	x1, sp, #0x60
 45ebaf0: 972a5b8c     	bl	0x1082920 <_ChromeMain+0x107d684>
 45ebaf4: f94012a8     	ldr	x8, [x21, #0x20]
 45ebaf8: b50024a8     	cbnz	x8, 0x45ebf8c <_ChromeMain+0x45e6cf0>
 45ebafc: 52800028     	mov	w8, #0x1                ; =1
 45ebb00: 390612e8     	strb	w8, [x23, #0x184]
 45ebb04: f940b6e0     	ldr	x0, [x23, #0x168]
 45ebb08: 910183e1     	add	x1, sp, #0x60
 45ebb0c: 9546c142     	bl	0x979c014 <_ChromeMain+0x9796d78>
 45ebb10: f94033f7     	ldr	x23, [sp, #0x60]
 45ebb14: b40000b7     	cbz	x23, 0x45ebb28 <_ChromeMain+0x45e688c>
 45ebb18: 12800008     	mov	w8, #-0x1               ; =-1
 45ebb1c: b8e802e8     	ldaddal	w8, w8, [x23]
 45ebb20: 7100051f     	cmp	w8, #0x1
 45ebb24: 54001820     	b.eq	0x45ebe28 <_ChromeMain+0x45e6b8c>
 45ebb28: 97d13aad     	bl	0x3a3a5dc <_ChromeMain+0x3a35340>
 45ebb2c: 34000440     	cbz	w0, 0x45ebbb4 <_ChromeMain+0x45e6918>
 45ebb30: a948d678     	ldp	x24, x21, [x19, #0x88]
 45ebb34: f9404e68     	ldr	x8, [x19, #0x98]
 45ebb38: 39507109     	ldrb	w9, [x8, #0x41c]
 45ebb3c: 370001c9     	tbnz	w9, #0x0, 0x45ebb74 <_ChromeMain+0x45e68d8>
 45ebb40: fd41ed00     	ldr	d0, [x8, #0x3d8]
 45ebb44: 1e624000     	fcvt	s0, d0
 45ebb48: 1e260008     	fmov	w8, s0
 45ebb4c: b2600117     	orr	x23, x8, #0x100000000
 45ebb50: d2800fd9     	mov	x25, #0x7e              ; =126
 45ebb54: f2c00059     	movk	x25, #0x2, lsl #32
 45ebb58: f94013e8     	ldr	x8, [sp, #0x20]
 45ebb5c: 91004100     	add	x0, x8, #0x10
 45ebb60: d2800fc1     	mov	x1, #0x7e               ; =126
 45ebb64: f2c00041     	movk	x1, #0x2, lsl #32
 45ebb68: aa1703e2     	mov	x2, x23
 45ebb6c: 95fffc21     	bl	0xc5eabf0 <_ChromeMain+0xc5e5954>
 45ebb70: 14000008     	b	0x45ebb90 <_ChromeMain+0x45e68f4>
 45ebb74: f94013e8     	ldr	x8, [sp, #0x20]
 45ebb78: 91004100     	add	x0, x8, #0x10
 45ebb7c: d2800001     	mov	x1, #0x0                ; =0
 45ebb80: d2800002     	mov	x2, #0x0                ; =0
 45ebb84: 95fffc1b     	bl	0xc5eabf0 <_ChromeMain+0xc5e5954>
 45ebb88: d2800019     	mov	x25, #0x0               ; =0
 45ebb8c: d2800017     	mov	x23, #0x0               ; =0
 45ebb90: 910c42a0     	add	x0, x21, #0x310
 45ebb94: aa1903e1     	mov	x1, x25
 45ebb98: aa1703e2     	mov	x2, x23
 45ebb9c: 95fffc15     	bl	0xc5eabf0 <_ChromeMain+0xc5e5954>
 45ebba0: 910c4300     	add	x0, x24, #0x310
 45ebba4: aa1903e1     	mov	x1, x25
 45ebba8: aa1703e2     	mov	x2, x23
 45ebbac: 95fffc11     	bl	0xc5eabf0 <_ChromeMain+0xc5e5954>
 45ebbb0: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ebbb4: f94386b7     	ldr	x23, [x21, #0x708]
 45ebbb8: 1e602128     	fcmp	d9, #0.0
 45ebbbc: fa40cae4     	ccmp	x23, #0x0, #0x4, gt
 45ebbc0: 1a9f07e1     	cset	w1, ne
 45ebbc4: 54000061     	b.ne	0x45ebbd0 <_ChromeMain+0x45e6934>
 45ebbc8: b40001d7     	cbz	x23, 0x45ebc00 <_ChromeMain+0x45e6964>
 45ebbcc: 1400000b     	b	0x45ebbf8 <_ChromeMain+0x45e695c>
 45ebbd0: b9433ae8     	ldr	w8, [x23, #0x338]
 45ebbd4: b9400fe9     	ldr	w9, [sp, #0xc]
 45ebbd8: 6b09011f     	cmp	w8, w9
 45ebbdc: 54003341     	b.ne	0x45ec244 <_ChromeMain+0x45e6fa8>
 45ebbe0: fd41a2e0     	ldr	d0, [x23, #0x340]
 45ebbe4: 1e692000     	fcmp	d0, d9
 45ebbe8: 54000080     	b.eq	0x45ebbf8 <_ChromeMain+0x45e695c>
 45ebbec: fd01a2e9     	str	d9, [x23, #0x340]
 45ebbf0: f941aae8     	ldr	x8, [x23, #0x350]
 45ebbf4: b5003008     	cbnz	x8, 0x45ec1f4 <_ChromeMain+0x45e6f58>
 45ebbf8: aa1703e0     	mov	x0, x23
 45ebbfc: 97b072e1     	bl	0x3208780 <_ChromeMain+0x32034e4>
 45ebc00: 5280bee8     	mov	w8, #0x5f7              ; =1527
 45ebc04: 52801ae9     	mov	w9, #0xd7               ; =215
 45ebc08: b9402fea     	ldr	w10, [sp, #0x2c]
 45ebc0c: 7100015f     	cmp	w10, #0x0
 45ebc10: 1a881128     	csel	w8, w9, w8, ne
 45ebc14: b90063e8     	str	w8, [sp, #0x60]
 45ebc18: 52a7f008     	mov	w8, #0x3f800000         ; =1065353216
 45ebc1c: f80643e8     	stur	x8, [sp, #0x64]
 45ebc20: 3500006a     	cbnz	w10, 0x45ebc2c <_ChromeMain+0x45e6990>
 45ebc24: b94013e8     	ldr	w8, [sp, #0x10]
 45ebc28: 14000005     	b	0x45ebc3c <_ChromeMain+0x45e69a0>
 45ebc2c: 52802028     	mov	w8, #0x101              ; =257
 45ebc30: 7900d3e8     	strh	w8, [sp, #0x68]
 45ebc34: 52800028     	mov	w8, #0x1                ; =1
 45ebc38: 3901abe8     	strb	w8, [sp, #0x6a]
 45ebc3c: 3901afe8     	strb	w8, [sp, #0x6b]
 45ebc40: 910183e1     	add	x1, sp, #0x60
 45ebc44: aa1803e0     	mov	x0, x24
 45ebc48: 95fffbed     	bl	0xc5eabfc <_ChromeMain+0xc5e5960>
 45ebc4c: 1e2e1000     	fmov	s0, #1.00000000
 45ebc50: 1e202100     	fcmp	s8, s0
 45ebc54: 540003c1     	b.ne	0x45ebccc <_ChromeMain+0x45e6a30>
 45ebc58: 9762167e     	bl	0x1e71650 <_ChromeMain+0x1e6c3b4>
 45ebc5c: 6b1b001f     	cmp	w0, w27
 45ebc60: 54ff784d     	b.le	0x45eab68 <_ChromeMain+0x45e58cc>
 45ebc64: b0052ea0     	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
 45ebc68: 91050000     	add	x0, x0, #0x140
 45ebc6c: 96ecb585     	bl	0x119280 <_ChromeMain+0x113fe4>
 45ebc70: 34ff77c0     	cbz	w0, 0x45eab68 <_ChromeMain+0x45e58cc>
 45ebc74: f9404a60     	ldr	x0, [x19, #0x90]
 45ebc78: 4ea81d00     	mov.16b	v0, v8
 45ebc7c: 95fffbe3     	bl	0xc5eac08 <_ChromeMain+0xc5e596c>
 45ebc80: f9404660     	ldr	x0, [x19, #0x88]
 45ebc84: 4ea81d00     	mov.16b	v0, v8
 45ebc88: 95fffbe0     	bl	0xc5eac08 <_ChromeMain+0xc5e596c>
 45ebc8c: 9102c3e1     	add	x1, sp, #0xb0
 45ebc90: aa1803e0     	mov	x0, x24
 45ebc94: 9760af61     	bl	0x1e17a18 <_ChromeMain+0x1e1277c>
 45ebc98: f9404268     	ldr	x8, [x19, #0x80]
 45ebc9c: b4000108     	cbz	x8, 0x45ebcbc <_ChromeMain+0x45e6a20>
 45ebca0: f9401a69     	ldr	x9, [x19, #0x30]
 45ebca4: b40000c9     	cbz	x9, 0x45ebcbc <_ChromeMain+0x45e6a20>
 45ebca8: f940c50a     	ldr	x10, [x8, #0x188]
 45ebcac: eb09015f     	cmp	x10, x9
 45ebcb0: 54000061     	b.ne	0x45ebcbc <_ChromeMain+0x45e6a20>
 45ebcb4: 39472108     	ldrb	w8, [x8, #0x1c8]
 45ebcb8: 35000cc8     	cbnz	w8, 0x45ebe50 <_ChromeMain+0x45e6bb4>
 45ebcbc: aa1803e0     	mov	x0, x24
 45ebcc0: 52800001     	mov	w1, #0x0                ; =0
 45ebcc4: 95fffbd4     	bl	0xc5eac14 <_ChromeMain+0xc5e5978>
 45ebcc8: 17fffba8     	b	0x45eab68 <_ChromeMain+0x45e58cc>
 45ebccc: f9403e68     	ldr	x8, [x19, #0x78]
 45ebcd0: f9001be8     	str	x8, [sp, #0x30]
 45ebcd4: 52800028     	mov	w8, #0x1                ; =1
 45ebcd8: 3900e3e8     	strb	w8, [sp, #0x38]
 45ebcdc: a976a7a8     	ldp	x8, x9, [x29, #-0x98]
 45ebce0: eb09011f     	cmp	x8, x9
 45ebce4: 54003581     	b.ne	0x45ec394 <_ChromeMain+0x45e70f8>
 45ebce8: d10283a0     	sub	x0, x29, #0xa0
 45ebcec: 9100c3e1     	add	x1, sp, #0x30
 45ebcf0: 97daf0cf     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45ebcf4: f85603a1     	ldur	x1, [x29, #-0xa0]
 45ebcf8: eb010009     	subs	x9, x0, x1
 45ebcfc: 9344fd28     	asr	x8, x9, #4
 45ebd00: f81683a8     	stur	x8, [x29, #-0x98]
 45ebd04: 54001dc0     	b.eq	0x45ec0bc <_ChromeMain+0x45e6e20>
 45ebd08: fd4036c0     	ldr	d0, [x22, #0x68]
 45ebd0c: 1e602008     	fcmp	d0, #0.0
 45ebd10: 5400040d     	b.le	0x45ebd90 <_ChromeMain+0x45e6af4>
 45ebd14: f9404a6a     	ldr	x10, [x19, #0x90]
 45ebd18: f9001bea     	str	x10, [sp, #0x30]
 45ebd1c: 5280002a     	mov	w10, #0x1               ; =1
 45ebd20: 3900e3ea     	strb	w10, [sp, #0x38]
 45ebd24: f85703aa     	ldur	x10, [x29, #-0x90]
 45ebd28: eb0a011f     	cmp	x8, x10
 45ebd2c: 54003661     	b.ne	0x45ec3f8 <_ChromeMain+0x45e715c>
 45ebd30: d10283a0     	sub	x0, x29, #0xa0
 45ebd34: 9100c3e1     	add	x1, sp, #0x30
 45ebd38: 97daf0bd     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45ebd3c: f85603a8     	ldur	x8, [x29, #-0xa0]
 45ebd40: eb080008     	subs	x8, x0, x8
 45ebd44: 9344fd08     	asr	x8, x8, #4
 45ebd48: f81683a8     	stur	x8, [x29, #-0x98]
 45ebd4c: 54001b80     	b.eq	0x45ec0bc <_ChromeMain+0x45e6e20>
 45ebd50: f9404a68     	ldr	x8, [x19, #0x90]
 45ebd54: f9001be8     	str	x8, [sp, #0x30]
 45ebd58: 52800028     	mov	w8, #0x1                ; =1
 45ebd5c: 3900e3e8     	strb	w8, [sp, #0x38]
 45ebd60: a94ba7e8     	ldp	x8, x9, [sp, #0xb8]
 45ebd64: eb09011f     	cmp	x8, x9
 45ebd68: 54003621     	b.ne	0x45ec42c <_ChromeMain+0x45e7190>
 45ebd6c: 9102c3e0     	add	x0, sp, #0xb0
 45ebd70: 9100c3e1     	add	x1, sp, #0x30
 45ebd74: 97daf0ae     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45ebd78: f9405be8     	ldr	x8, [sp, #0xb0]
 45ebd7c: eb080008     	subs	x8, x0, x8
 45ebd80: 9344fd08     	asr	x8, x8, #4
 45ebd84: f9005fe8     	str	x8, [sp, #0xb8]
 45ebd88: 540019a0     	b.eq	0x45ec0bc <_ChromeMain+0x45e6e20>
 45ebd8c: a97623a1     	ldp	x1, x8, [x29, #-0xa0]
 45ebd90: 9340ed03     	sbfx	x3, x8, #0, #60
 45ebd94: 8b081022     	add	x2, x1, x8, lsl #4
 45ebd98: d102e3a0     	sub	x0, x29, #0xb8
 45ebd9c: 95fffba1     	bl	0xc5eac20 <_ChromeMain+0xc5e5984>
 45ebda0: fd403ac0     	ldr	d0, [x22, #0x70]
 45ebda4: 1e602008     	fcmp	d0, #0.0
 45ebda8: 54fff58d     	b.le	0x45ebc58 <_ChromeMain+0x45e69bc>
 45ebdac: f9404668     	ldr	x8, [x19, #0x88]
 45ebdb0: f9001be8     	str	x8, [sp, #0x30]
 45ebdb4: 52800028     	mov	w8, #0x1                ; =1
 45ebdb8: 3900e3e8     	strb	w8, [sp, #0x38]
 45ebdbc: a97527a8     	ldp	x8, x9, [x29, #-0xb0]
 45ebdc0: eb09011f     	cmp	x8, x9
 45ebdc4: 54003501     	b.ne	0x45ec464 <_ChromeMain+0x45e71c8>
 45ebdc8: d102e3a0     	sub	x0, x29, #0xb8
 45ebdcc: 9100c3e1     	add	x1, sp, #0x30
 45ebdd0: 97daf097     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45ebdd4: f85483a8     	ldur	x8, [x29, #-0xb8]
 45ebdd8: eb080008     	subs	x8, x0, x8
 45ebddc: 9344fd08     	asr	x8, x8, #4
 45ebde0: f81503a8     	stur	x8, [x29, #-0xb0]
 45ebde4: 540016c0     	b.eq	0x45ec0bc <_ChromeMain+0x45e6e20>
 45ebde8: f9404668     	ldr	x8, [x19, #0x88]
 45ebdec: f9001be8     	str	x8, [sp, #0x30]
 45ebdf0: 52800028     	mov	w8, #0x1                ; =1
 45ebdf4: 3900e3e8     	strb	w8, [sp, #0x38]
 45ebdf8: a94ba7e8     	ldp	x8, x9, [sp, #0xb8]
 45ebdfc: eb09011f     	cmp	x8, x9
 45ebe00: 540034e1     	b.ne	0x45ec49c <_ChromeMain+0x45e7200>
 45ebe04: 9102c3e0     	add	x0, sp, #0xb0
 45ebe08: 9100c3e1     	add	x1, sp, #0x30
 45ebe0c: 97daf088     	bl	0x3ca802c <_ChromeMain+0x3ca2d90>
 45ebe10: f9405be8     	ldr	x8, [sp, #0xb0]
 45ebe14: eb080008     	subs	x8, x0, x8
 45ebe18: 9344fd08     	asr	x8, x8, #4
 45ebe1c: f9005fe8     	str	x8, [sp, #0xb8]
 45ebe20: 54fff1c1     	b.ne	0x45ebc58 <_ChromeMain+0x45e69bc>
 45ebe24: 140000a6     	b	0x45ec0bc <_ChromeMain+0x45e6e20>
 45ebe28: b9802ae8     	ldrsw	x8, [x23, #0x28]
 45ebe2c: 35002428     	cbnz	w8, 0x45ec2b0 <_ChromeMain+0x45e7014>
 45ebe30: 3940b2e8     	ldrb	w8, [x23, #0x2c]
 45ebe34: 37002668     	tbnz	w8, #0x0, 0x45ec300 <_ChromeMain+0x45e7064>
 45ebe38: f9400af9     	ldr	x25, [x23, #0x10]
 45ebe3c: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ebe40: b5002719     	cbnz	x25, 0x45ec320 <_ChromeMain+0x45e7084>
 45ebe44: aa1703e0     	mov	x0, x23
 45ebe48: 96e8a208     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ebe4c: 17ffff37     	b	0x45ebb28 <_ChromeMain+0x45e688c>
 45ebe50: f94012a8     	ldr	x8, [x21, #0x20]
 45ebe54: b50001c8     	cbnz	x8, 0x45ebe8c <_ChromeMain+0x45e6bf0>
 45ebe58: aa1503e0     	mov	x0, x21
 45ebe5c: 52800021     	mov	w1, #0x1                ; =1
 45ebe60: 9758a68b     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 45ebe64: f94012a8     	ldr	x8, [x21, #0x20]
 45ebe68: b9400909     	ldr	w9, [x8, #0x8]
 45ebe6c: 7100093f     	cmp	w9, #0x2
 45ebe70: 54003460     	b.eq	0x45ec4fc <_ChromeMain+0x45e7260>
 45ebe74: 39422909     	ldrb	w9, [x8, #0x8a]
 45ebe78: 340000a9     	cbz	w9, 0x45ebe8c <_ChromeMain+0x45e6bf0>
 45ebe7c: 3902291f     	strb	wzr, [x8, #0x8a]
 45ebe80: f940b500     	ldr	x0, [x8, #0x168]
 45ebe84: 52800001     	mov	w1, #0x0                ; =0
 45ebe88: 971f872e     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 45ebe8c: aa1803e0     	mov	x0, x24
 45ebe90: 52800021     	mov	w1, #0x1                ; =1
 45ebe94: 95fffb60     	bl	0xc5eac14 <_ChromeMain+0xc5e5978>
 45ebe98: fd4042c0     	ldr	d0, [x22, #0x80]
 45ebe9c: a9478261     	ldp	x1, x0, [x19, #0x78]
 45ebea0: 1e624000     	fcvt	s0, d0
 45ebea4: 95fffb62     	bl	0xc5eac2c <_ChromeMain+0xc5e5990>
 45ebea8: 17fffb30     	b	0x45eab68 <_ChromeMain+0x45e58cc>
 45ebeac: d37ef58c     	lsl	x12, x12, #2
 45ebeb0: b4ffe06c     	cbz	x12, 0x45ebabc <_ChromeMain+0x45e6820>
 45ebeb4: bc404540     	ldr	s0, [x10], #0x4
 45ebeb8: bc404561     	ldr	s1, [x11], #0x4
 45ebebc: 1e212000     	fcmp	s0, s1
 45ebec0: 54ffe141     	b.ne	0x45ebae8 <_ChromeMain+0x45e684c>
 45ebec4: f100118c     	subs	x12, x12, #0x4
 45ebec8: 54ffff61     	b.ne	0x45ebeb4 <_ChromeMain+0x45e6c18>
 45ebecc: 17fffefc     	b	0x45ebabc <_ChromeMain+0x45e6820>
 45ebed0: 390122bf     	strb	wzr, [x21, #0x48]
 45ebed4: f94092a0     	ldr	x0, [x21, #0x120]
 45ebed8: b4001aa0     	cbz	x0, 0x45ec22c <_ChromeMain+0x45e6f90>
 45ebedc: 96fed4a8     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ebee0: 17fffbaa     	b	0x45ead88 <_ChromeMain+0x45e5aec>
 45ebee4: 52800028     	mov	w8, #0x1                ; =1
 45ebee8: 390122a8     	strb	w8, [x21, #0x48]
 45ebeec: f94092a0     	ldr	x0, [x21, #0x120]
 45ebef0: b4001a40     	cbz	x0, 0x45ec238 <_ChromeMain+0x45e6f9c>
 45ebef4: 96fed4a2     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ebef8: 17fffb2c     	b	0x45eaba8 <_ChromeMain+0x45e590c>
 45ebefc: b9802808     	ldrsw	x8, [x0, #0x28]
 45ebf00: 35002228     	cbnz	w8, 0x45ec344 <_ChromeMain+0x45e70a8>
 45ebf04: 3940b008     	ldrb	w8, [x0, #0x2c]
 45ebf08: 37002628     	tbnz	w8, #0x0, 0x45ec3cc <_ChromeMain+0x45e7130>
 45ebf0c: f9400819     	ldr	x25, [x0, #0x10]
 45ebf10: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ebf14: 72a0007b     	movk	w27, #0x3, lsl #16
 45ebf18: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ebf1c: b5002dd9     	cbnz	x25, 0x45ec4d4 <_ChromeMain+0x45e7238>
 45ebf20: 96e8a1d2     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ebf24: 17fffeaa     	b	0x45eb9cc <_ChromeMain+0x45e6730>
 45ebf28: 9104e27a     	add	x26, x19, #0x138
 45ebf2c: f9409e76     	ldr	x22, [x19, #0x138]
 45ebf30: 17fffafb     	b	0x45eab1c <_ChromeMain+0x45e5880>
 45ebf34: aa1303e0     	mov	x0, x19
 45ebf38: 17fffc8a     	b	0x45eb160 <_ChromeMain+0x45e5ec4>
 45ebf3c: aa1303e0     	mov	x0, x19
 45ebf40: 17fffcb4     	b	0x45eb210 <_ChromeMain+0x45e5f74>
 45ebf44: aa1303e0     	mov	x0, x19
 45ebf48: 17fffcd0     	b	0x45eb288 <_ChromeMain+0x45e5fec>
 45ebf4c: 52806a00     	mov	w0, #0x350              ; =848
 45ebf50: 96e88d06     	bl	0xf368 <_ChromeMain+0xa0cc>
 45ebf54: 910762a1     	add	x1, x21, #0x1d8
 45ebf58: aa1503e2     	mov	x2, x21
 45ebf5c: 977d64b8     	bl	0x254523c <_ChromeMain+0x253ffa0>
 45ebf60: f9413ea8     	ldr	x8, [x21, #0x278]
 45ebf64: f9013ea0     	str	x0, [x21, #0x278]
 45ebf68: b4000088     	cbz	x8, 0x45ebf78 <_ChromeMain+0x45e6cdc>
 45ebf6c: aa0803e0     	mov	x0, x8
 45ebf70: 977d6457     	bl	0x25450cc <_ChromeMain+0x253fe30>
 45ebf74: f9413ea0     	ldr	x0, [x21, #0x278]
 45ebf78: f94012a8     	ldr	x8, [x21, #0x20]
 45ebf7c: 9100c001     	add	x1, x0, #0x30
 45ebf80: aa0803e0     	mov	x0, x8
 45ebf84: 977d63fd     	bl	0x2544f78 <_ChromeMain+0x253fcdc>
 45ebf88: 17fffe8b     	b	0x45eb9b4 <_ChromeMain+0x45e6718>
 45ebf8c: 52806a00     	mov	w0, #0x350              ; =848
 45ebf90: 96e88cf6     	bl	0xf368 <_ChromeMain+0xa0cc>
 45ebf94: 910762a1     	add	x1, x21, #0x1d8
 45ebf98: aa1503e2     	mov	x2, x21
 45ebf9c: 977d64a8     	bl	0x254523c <_ChromeMain+0x253ffa0>
 45ebfa0: f9413ea8     	ldr	x8, [x21, #0x278]
 45ebfa4: f9013ea0     	str	x0, [x21, #0x278]
 45ebfa8: b4000088     	cbz	x8, 0x45ebfb8 <_ChromeMain+0x45e6d1c>
 45ebfac: aa0803e0     	mov	x0, x8
 45ebfb0: 977d6447     	bl	0x25450cc <_ChromeMain+0x253fe30>
 45ebfb4: f9413ea0     	ldr	x0, [x21, #0x278]
 45ebfb8: f94012a8     	ldr	x8, [x21, #0x20]
 45ebfbc: 9100c001     	add	x1, x0, #0x30
 45ebfc0: aa0803e0     	mov	x0, x8
 45ebfc4: 977d63ed     	bl	0x2544f78 <_ChromeMain+0x253fcdc>
 45ebfc8: 17fffecd     	b	0x45ebafc <_ChromeMain+0x45e6860>
 45ebfcc: aa1703e0     	mov	x0, x23
 45ebfd0: 17fffba6     	b	0x45eae68 <_ChromeMain+0x45e5bcc>
 45ebfd4: aa1703e0     	mov	x0, x23
 45ebfd8: 17fffbca     	b	0x45eaf00 <_ChromeMain+0x45e5c64>
 45ebfdc: 9745f3e2     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45ebfe0: aa0003e8     	mov	x8, x0
 45ebfe4: 39402009     	ldrb	w9, [x0, #0x8]
 45ebfe8: 7100053f     	cmp	w9, #0x1
 45ebfec: 54000521     	b.ne	0x45ec090 <_ChromeMain+0x45e6df4>
 45ebff0: 91005d00     	add	x0, x8, #0x17
 45ebff4: 96ecbc43     	bl	0x11b100 <_ChromeMain+0x115e64>
 45ebff8: b907ab00     	str	w0, [x24, #0x7a8]
 45ebffc: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec000: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec004: f9400ff5     	ldr	x21, [sp, #0x18]
 45ec008: 17fffe46     	b	0x45eb920 <_ChromeMain+0x45e6684>
 45ec00c: 9745f3d6     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45ec010: aa0003e8     	mov	x8, x0
 45ec014: 39402009     	ldrb	w9, [x0, #0x8]
 45ec018: 7100053f     	cmp	w9, #0x1
 45ec01c: 54000881     	b.ne	0x45ec12c <_ChromeMain+0x45e6e90>
 45ec020: 91005d00     	add	x0, x8, #0x17
 45ec024: 96ecbc37     	bl	0x11b100 <_ChromeMain+0x115e64>
 45ec028: b907aaa0     	str	w0, [x21, #0x7a8]
 45ec02c: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec030: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec034: 17fffdef     	b	0x45eb7f0 <_ChromeMain+0x45e6554>
 45ec038: d4200000     	brk	#0
 45ec03c: d4400000     	hlt	#0
 45ec040: d4200020     	brk	#0x1
 45ec044: d4200000     	brk	#0
 45ec048: d4400000     	hlt	#0
 45ec04c: d4200020     	brk	#0x1
 45ec050: d4200000     	brk	#0
 45ec054: d4400000     	hlt	#0
 45ec058: d4200020     	brk	#0x1
 45ec05c: f9400008     	ldr	x8, [x0]
 45ec060: f9400908     	ldr	x8, [x8, #0x10]
 45ec064: d63f0100     	blr	x8
 45ec068: 910022b5     	add	x21, x21, #0x8
 45ec06c: eb1802bf     	cmp	x21, x24
 45ec070: 54ffee02     	b.hs	0x45ebe30 <_ChromeMain+0x45e6b94>
 45ec074: f94002a0     	ldr	x0, [x21]
 45ec078: b4ffff80     	cbz	x0, 0x45ec068 <_ChromeMain+0x45e6dcc>
 45ec07c: 91002008     	add	x8, x0, #0x8
 45ec080: b8f90108     	ldaddal	w25, w8, [x8]
 45ec084: 7100051f     	cmp	w8, #0x1
 45ec088: 54ffff01     	b.ne	0x45ec068 <_ChromeMain+0x45e6dcc>
 45ec08c: 17fffff4     	b	0x45ec05c <_ChromeMain+0x45e6dc0>
 45ec090: b0048fc0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45ec094: 91299000     	add	x0, x0, #0xa64
 45ec098: 7100093f     	cmp	w9, #0x2
 45ec09c: 540023a1     	b.ne	0x45ec510 <_ChromeMain+0x45e7274>
 45ec0a0: f9401108     	ldr	x8, [x8, #0x20]
 45ec0a4: f9400508     	ldr	x8, [x8, #0x8]
 45ec0a8: f100011f     	cmp	x8, #0x0
 45ec0ac: 9a880000     	csel	x0, x0, x8, eq
 45ec0b0: 17ffffd1     	b	0x45ebff4 <_ChromeMain+0x45e6d58>
 45ec0b4: d4200000     	brk	#0
 45ec0b8: d4400000     	hlt	#0
 45ec0bc: d4200020     	brk	#0x1
 45ec0c0: f85603a9     	ldur	x9, [x29, #-0xa0]
 45ec0c4: 8b081137     	add	x23, x9, x8, lsl #4
 45ec0c8: b4ffffb7     	cbz	x23, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec0cc: 390002ff     	strb	wzr, [x23]
 45ec0d0: 52801fe8     	mov	w8, #0xff               ; =255
 45ec0d4: 390022e8     	strb	w8, [x23, #0x8]
 45ec0d8: 9100c3e1     	add	x1, sp, #0x30
 45ec0dc: aa1703e0     	mov	x0, x23
 45ec0e0: 94000160     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec0e4: 910042e0     	add	x0, x23, #0x10
 45ec0e8: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec0ec: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec0f0: 17fffba6     	b	0x45eaf88 <_ChromeMain+0x45e5cec>
 45ec0f4: f9400008     	ldr	x8, [x0]
 45ec0f8: f9400908     	ldr	x8, [x8, #0x10]
 45ec0fc: d63f0100     	blr	x8
 45ec100: 910022b5     	add	x21, x21, #0x8
 45ec104: eb1802bf     	cmp	x21, x24
 45ec108: aa1903e0     	mov	x0, x25
 45ec10c: 54ffefc2     	b.hs	0x45ebf04 <_ChromeMain+0x45e6c68>
 45ec110: f94002a0     	ldr	x0, [x21]
 45ec114: b4ffff60     	cbz	x0, 0x45ec100 <_ChromeMain+0x45e6e64>
 45ec118: 91002008     	add	x8, x0, #0x8
 45ec11c: b8fb0108     	ldaddal	w27, w8, [x8]
 45ec120: 7100051f     	cmp	w8, #0x1
 45ec124: 54fffee1     	b.ne	0x45ec100 <_ChromeMain+0x45e6e64>
 45ec128: 17fffff3     	b	0x45ec0f4 <_ChromeMain+0x45e6e58>
 45ec12c: b0048fc0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 45ec130: 91299000     	add	x0, x0, #0xa64
 45ec134: 7100093f     	cmp	w9, #0x2
 45ec138: 54001e81     	b.ne	0x45ec508 <_ChromeMain+0x45e726c>
 45ec13c: f9401108     	ldr	x8, [x8, #0x20]
 45ec140: f9400508     	ldr	x8, [x8, #0x8]
 45ec144: f100011f     	cmp	x8, #0x0
 45ec148: 9a880000     	csel	x0, x0, x8, eq
 45ec14c: 17ffffb6     	b	0x45ec024 <_ChromeMain+0x45e6d88>
 45ec150: 52800008     	mov	w8, #0x0                ; =0
 45ec154: 17fffac9     	b	0x45eac78 <_ChromeMain+0x45e59dc>
 45ec158: d4200000     	brk	#0
 45ec15c: d4400000     	hlt	#0
 45ec160: d4200020     	brk	#0x1
 45ec164: d4200000     	brk	#0
 45ec168: d4400000     	hlt	#0
 45ec16c: d4200020     	brk	#0x1
 45ec170: 52800008     	mov	w8, #0x0                ; =0
 45ec174: 36075888     	tbz	w8, #0x0, 0x45eac84 <_ChromeMain+0x45e59e8>
 45ec178: 17fffb04     	b	0x45ead88 <_ChromeMain+0x45e5aec>
 45ec17c: f9400728     	ldr	x8, [x25, #0x8]
 45ec180: b4001cc8     	cbz	x8, 0x45ec518 <_ChromeMain+0x45e727c>
 45ec184: f9429d08     	ldr	x8, [x8, #0x538]
 45ec188: f9404500     	ldr	x0, [x8, #0x88]
 45ec18c: 52800001     	mov	w1, #0x0                ; =0
 45ec190: 94dd997c     	bl	0x7d52780 <_ChromeMain+0x7d4d4e4>
 45ec194: 17fffab7     	b	0x45eac70 <_ChromeMain+0x45e59d4>
 45ec198: d4200000     	brk	#0
 45ec19c: d4400000     	hlt	#0
 45ec1a0: d4200020     	brk	#0x1
 45ec1a4: d4200000     	brk	#0
 45ec1a8: d4400000     	hlt	#0
 45ec1ac: d4200020     	brk	#0x1
 45ec1b0: d4200000     	brk	#0
 45ec1b4: d4400000     	hlt	#0
 45ec1b8: d4200020     	brk	#0x1
 45ec1bc: d4200000     	brk	#0
 45ec1c0: d4400000     	hlt	#0
 45ec1c4: d4200020     	brk	#0x1
 45ec1c8: d4200000     	brk	#0
 45ec1cc: d4400000     	hlt	#0
 45ec1d0: d4200020     	brk	#0x1
 45ec1d4: f9400688     	ldr	x8, [x20, #0x8]
 45ec1d8: b4001a68     	cbz	x8, 0x45ec524 <_ChromeMain+0x45e7288>
 45ec1dc: f9429d08     	ldr	x8, [x8, #0x538]
 45ec1e0: f9404500     	ldr	x0, [x8, #0x88]
 45ec1e4: 52800001     	mov	w1, #0x0                ; =0
 45ec1e8: 94dd9966     	bl	0x7d52780 <_ChromeMain+0x7d4d4e4>
 45ec1ec: 36078920     	tbz	w0, #0x0, 0x45eb310 <_ChromeMain+0x45e6074>
 45ec1f0: 17fffc4a     	b	0x45eb318 <_ChromeMain+0x45e607c>
 45ec1f4: aa0103f5     	mov	x21, x1
 45ec1f8: f9400d08     	ldr	x8, [x8, #0x18]
 45ec1fc: f9409100     	ldr	x0, [x8, #0x120]
 45ec200: b4000040     	cbz	x0, 0x45ec208 <_ChromeMain+0x45e6f6c>
 45ec204: 95715a81     	bl	0xa242c08 <_ChromeMain+0xa23d96c>
 45ec208: 1e624120     	fcvt	s0, d9
 45ec20c: 9754222c     	bl	0x1af4abc <_ChromeMain+0x1aef820>
 45ec210: aa1703e0     	mov	x0, x23
 45ec214: 96fed3da     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ec218: aa1503e1     	mov	x1, x21
 45ec21c: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec220: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec224: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec228: 17fffe74     	b	0x45ebbf8 <_ChromeMain+0x45e695c>
 45ec22c: d4200000     	brk	#0
 45ec230: d4400000     	hlt	#0
 45ec234: d4200020     	brk	#0x1
 45ec238: d4200000     	brk	#0
 45ec23c: d4400000     	hlt	#0
 45ec240: d4200020     	brk	#0x1
 45ec244: aa0903e8     	mov	x8, x9
 45ec248: b9033ae9     	str	w9, [x23, #0x338]
 45ec24c: f941aae0     	ldr	x0, [x23, #0x350]
 45ec250: b4ffcc80     	cbz	x0, 0x45ebbe0 <_ChromeMain+0x45e6944>
 45ec254: aa0103f5     	mov	x21, x1
 45ec258: aa0803e1     	mov	x1, x8
 45ec25c: 9583c6c6     	bl	0xa6ddd74 <_ChromeMain+0xa6d8ad8>
 45ec260: aa1703e0     	mov	x0, x23
 45ec264: 96fed3c6     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ec268: aa1503e1     	mov	x1, x21
 45ec26c: f9400ff5     	ldr	x21, [sp, #0x18]
 45ec270: 17fffe5c     	b	0x45ebbe0 <_ChromeMain+0x45e6944>
 45ec274: 972a3809     	bl	0x107a298 <_ChromeMain+0x1074ffc>
 45ec278: aa0003e1     	mov	x1, x0
 45ec27c: aa1703e0     	mov	x0, x23
 45ec280: 97323fdf     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 45ec284: f940b2e0     	ldr	x0, [x23, #0x160]
 45ec288: 17fffd14     	b	0x45eb6d8 <_ChromeMain+0x45e643c>
 45ec28c: d4200000     	brk	#0
 45ec290: d4400000     	hlt	#0
 45ec294: d4200020     	brk	#0x1
 45ec298: 972a3800     	bl	0x107a298 <_ChromeMain+0x1074ffc>
 45ec29c: aa0003e1     	mov	x1, x0
 45ec2a0: aa1703e0     	mov	x0, x23
 45ec2a4: 97323fd6     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 45ec2a8: f940b2e0     	ldr	x0, [x23, #0x160]
 45ec2ac: 17fffd2d     	b	0x45eb760 <_ChromeMain+0x45e64c4>
 45ec2b0: f94012f5     	ldr	x21, [x23, #0x20]
 45ec2b4: d37df118     	lsl	x24, x8, #3
 45ec2b8: f94002a8     	ldr	x8, [x21]
 45ec2bc: 1940c108     	ldapurb	w8, [x8, #0xc]
 45ec2c0: 370000a8     	tbnz	w8, #0x0, 0x45ec2d4 <_ChromeMain+0x45e7038>
 45ec2c4: f94002a0     	ldr	x0, [x21]
 45ec2c8: f9400008     	ldr	x8, [x0]
 45ec2cc: f9400d08     	ldr	x8, [x8, #0x18]
 45ec2d0: d63f0100     	blr	x8
 45ec2d4: 910022b5     	add	x21, x21, #0x8
 45ec2d8: f1002318     	subs	x24, x24, #0x8
 45ec2dc: 54fffee1     	b.ne	0x45ec2b8 <_ChromeMain+0x45e701c>
 45ec2e0: b9802ae8     	ldrsw	x8, [x23, #0x28]
 45ec2e4: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec2e8: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec2ec: 34ffda28     	cbz	w8, 0x45ebe30 <_ChromeMain+0x45e6b94>
 45ec2f0: f94012f5     	ldr	x21, [x23, #0x20]
 45ec2f4: 8b080eb8     	add	x24, x21, x8, lsl #3
 45ec2f8: 12800019     	mov	w25, #-0x1              ; =-1
 45ec2fc: 17ffff5e     	b	0x45ec074 <_ChromeMain+0x45e6dd8>
 45ec300: f94012e0     	ldr	x0, [x23, #0x20]
 45ec304: b4ffd9a0     	cbz	x0, 0x45ebe38 <_ChromeMain+0x45e6b9c>
 45ec308: d0052e88     	adrp	x8, 0xebbe000 <dyld_stub_binder+0xebbe000>
 45ec30c: f9410108     	ldr	x8, [x8, #0x200]
 45ec310: f9401d08     	ldr	x8, [x8, #0x38]
 45ec314: d2800001     	mov	x1, #0x0                ; =0
 45ec318: d63f0100     	blr	x8
 45ec31c: 17fffec7     	b	0x45ebe38 <_ChromeMain+0x45e6b9c>
 45ec320: f9400320     	ldr	x0, [x25]
 45ec324: 94e900a7     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 45ec328: aa1903e0     	mov	x0, x25
 45ec32c: 52800101     	mov	w1, #0x8                ; =8
 45ec330: 96e872e2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45ec334: 17fffec4     	b	0x45ebe44 <_ChromeMain+0x45e6ba8>
 45ec338: d4200000     	brk	#0
 45ec33c: d4400000     	hlt	#0
 45ec340: d4200020     	brk	#0x1
 45ec344: aa0003f9     	mov	x25, x0
 45ec348: f9401015     	ldr	x21, [x0, #0x20]
 45ec34c: d37df118     	lsl	x24, x8, #3
 45ec350: f94002a8     	ldr	x8, [x21]
 45ec354: 1940c108     	ldapurb	w8, [x8, #0xc]
 45ec358: 370000a8     	tbnz	w8, #0x0, 0x45ec36c <_ChromeMain+0x45e70d0>
 45ec35c: f94002a0     	ldr	x0, [x21]
 45ec360: f9400008     	ldr	x8, [x0]
 45ec364: f9400d08     	ldr	x8, [x8, #0x18]
 45ec368: d63f0100     	blr	x8
 45ec36c: 910022b5     	add	x21, x21, #0x8
 45ec370: f1002318     	subs	x24, x24, #0x8
 45ec374: 54fffee1     	b.ne	0x45ec350 <_ChromeMain+0x45e70b4>
 45ec378: aa1903e0     	mov	x0, x25
 45ec37c: b9802b28     	ldrsw	x8, [x25, #0x28]
 45ec380: 34ffdc28     	cbz	w8, 0x45ebf04 <_ChromeMain+0x45e6c68>
 45ec384: f9401015     	ldr	x21, [x0, #0x20]
 45ec388: 8b080eb8     	add	x24, x21, x8, lsl #3
 45ec38c: 1280001b     	mov	w27, #-0x1              ; =-1
 45ec390: 17ffff60     	b	0x45ec110 <_ChromeMain+0x45e6e74>
 45ec394: f85603a9     	ldur	x9, [x29, #-0xa0]
 45ec398: 8b081137     	add	x23, x9, x8, lsl #4
 45ec39c: b4ffe917     	cbz	x23, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec3a0: 390002ff     	strb	wzr, [x23]
 45ec3a4: 52801fe8     	mov	w8, #0xff               ; =255
 45ec3a8: 390022e8     	strb	w8, [x23, #0x8]
 45ec3ac: 9100c3e1     	add	x1, sp, #0x30
 45ec3b0: aa1703e0     	mov	x0, x23
 45ec3b4: 940000ab     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec3b8: 910042e0     	add	x0, x23, #0x10
 45ec3bc: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec3c0: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec3c4: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec3c8: 17fffe4b     	b	0x45ebcf4 <_ChromeMain+0x45e6a58>
 45ec3cc: f9401008     	ldr	x8, [x0, #0x20]
 45ec3d0: b4ffd9e8     	cbz	x8, 0x45ebf0c <_ChromeMain+0x45e6c70>
 45ec3d4: d0052e89     	adrp	x9, 0xebbe000 <dyld_stub_binder+0xebbe000>
 45ec3d8: f9410129     	ldr	x9, [x9, #0x200]
 45ec3dc: f9401d29     	ldr	x9, [x9, #0x38]
 45ec3e0: aa0003f5     	mov	x21, x0
 45ec3e4: aa0803e0     	mov	x0, x8
 45ec3e8: d2800001     	mov	x1, #0x0                ; =0
 45ec3ec: d63f0120     	blr	x9
 45ec3f0: aa1503e0     	mov	x0, x21
 45ec3f4: 17fffec6     	b	0x45ebf0c <_ChromeMain+0x45e6c70>
 45ec3f8: b4ffe620     	cbz	x0, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec3fc: 8b090037     	add	x23, x1, x9
 45ec400: 390002ff     	strb	wzr, [x23]
 45ec404: 52801fe8     	mov	w8, #0xff               ; =255
 45ec408: 390022e8     	strb	w8, [x23, #0x8]
 45ec40c: 9100c3e1     	add	x1, sp, #0x30
 45ec410: aa1703e0     	mov	x0, x23
 45ec414: 94000093     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec418: 910042e0     	add	x0, x23, #0x10
 45ec41c: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec420: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec424: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec428: 17fffe45     	b	0x45ebd3c <_ChromeMain+0x45e6aa0>
 45ec42c: f9405be9     	ldr	x9, [sp, #0xb0]
 45ec430: 8b081137     	add	x23, x9, x8, lsl #4
 45ec434: b4ffe457     	cbz	x23, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec438: 390002ff     	strb	wzr, [x23]
 45ec43c: 52801fe8     	mov	w8, #0xff               ; =255
 45ec440: 390022e8     	strb	w8, [x23, #0x8]
 45ec444: 9100c3e1     	add	x1, sp, #0x30
 45ec448: aa1703e0     	mov	x0, x23
 45ec44c: 94000085     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec450: 910042e0     	add	x0, x23, #0x10
 45ec454: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec458: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec45c: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec460: 17fffe46     	b	0x45ebd78 <_ChromeMain+0x45e6adc>
 45ec464: f85483a9     	ldur	x9, [x29, #-0xb8]
 45ec468: 8b081137     	add	x23, x9, x8, lsl #4
 45ec46c: b4ffe297     	cbz	x23, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec470: 390002ff     	strb	wzr, [x23]
 45ec474: 52801fe8     	mov	w8, #0xff               ; =255
 45ec478: 390022e8     	strb	w8, [x23, #0x8]
 45ec47c: 9100c3e1     	add	x1, sp, #0x30
 45ec480: aa1703e0     	mov	x0, x23
 45ec484: 94000077     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec488: 910042e0     	add	x0, x23, #0x10
 45ec48c: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec490: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec494: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec498: 17fffe4f     	b	0x45ebdd4 <_ChromeMain+0x45e6b38>
 45ec49c: f9405be9     	ldr	x9, [sp, #0xb0]
 45ec4a0: 8b081137     	add	x23, x9, x8, lsl #4
 45ec4a4: b4ffe0d7     	cbz	x23, 0x45ec0bc <_ChromeMain+0x45e6e20>
 45ec4a8: 390002ff     	strb	wzr, [x23]
 45ec4ac: 52801fe8     	mov	w8, #0xff               ; =255
 45ec4b0: 390022e8     	strb	w8, [x23, #0x8]
 45ec4b4: 9100c3e1     	add	x1, sp, #0x30
 45ec4b8: aa1703e0     	mov	x0, x23
 45ec4bc: 94000069     	bl	0x45ec660 <_ChromeMain+0x45e73c4>
 45ec4c0: 910042e0     	add	x0, x23, #0x10
 45ec4c4: 529ef3fb     	mov	w27, #0xf79f            ; =63391
 45ec4c8: 72a0007b     	movk	w27, #0x3, lsl #16
 45ec4cc: a941e3f5     	ldp	x21, x24, [sp, #0x18]
 45ec4d0: 17fffe50     	b	0x45ebe10 <_ChromeMain+0x45e6b74>
 45ec4d4: f9400328     	ldr	x8, [x25]
 45ec4d8: aa0003f5     	mov	x21, x0
 45ec4dc: aa0803e0     	mov	x0, x8
 45ec4e0: 94e90038     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 45ec4e4: aa1903e0     	mov	x0, x25
 45ec4e8: 52800101     	mov	w1, #0x8                ; =8
 45ec4ec: 96e87273     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45ec4f0: aa1503e0     	mov	x0, x21
 45ec4f4: f9400ff5     	ldr	x21, [sp, #0x18]
 45ec4f8: 17fffe8a     	b	0x45ebf20 <_ChromeMain+0x45e6c84>
 45ec4fc: d4200000     	brk	#0
 45ec500: d4400000     	hlt	#0
 45ec504: d4200020     	brk	#0x1
 45ec508: 34ffd8e9     	cbz	w9, 0x45ec024 <_ChromeMain+0x45e6d88>
 45ec50c: 14000002     	b	0x45ec514 <_ChromeMain+0x45e7278>
 45ec510: 34ffd729     	cbz	w9, 0x45ebff4 <_ChromeMain+0x45e6d58>
 45ec514: 94e9a64c     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
 45ec518: d4200000     	brk	#0
 45ec51c: d4400000     	hlt	#0
 45ec520: d4200020     	brk	#0x1
 45ec524: d4200000     	brk	#0
 45ec528: d4400000     	hlt	#0
 45ec52c: d4200020     	brk	#0x1
 45ec530: b4000221     	cbz	x1, 0x45ec574 <_ChromeMain+0x45e72d8>
 45ec534: d10143ff     	sub	sp, sp, #0x50
 45ec538: a9034ff4     	stp	x20, x19, [sp, #0x30]
 45ec53c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 45ec540: 910103fd     	add	x29, sp, #0x40
 45ec544: f9400008     	ldr	x8, [x0]
 45ec548: f9401909     	ldr	x9, [x8, #0x30]
 45ec54c: b40000e9     	cbz	x9, 0x45ec568 <_ChromeMain+0x45e72cc>
 45ec550: aa0103f3     	mov	x19, x1
 45ec554: f940c42a     	ldr	x10, [x1, #0x188]
 45ec558: eb09015f     	cmp	x10, x9
 45ec55c: 54000061     	b.ne	0x45ec568 <_ChromeMain+0x45e72cc>
 45ec560: 39472269     	ldrb	w9, [x19, #0x1c8]
 45ec564: 350000a9     	cbnz	w9, 0x45ec578 <_ChromeMain+0x45e72dc>
 45ec568: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 45ec56c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 45ec570: 910143ff     	add	sp, sp, #0x50
 45ec574: d65f03c0     	ret
 45ec578: f9400409     	ldr	x9, [x0, #0x8]
 45ec57c: b9400129     	ldr	w9, [x9]
 45ec580: b941ba6a     	ldr	w10, [x19, #0x1b8]
 45ec584: 4b0a0134     	sub	w20, w9, w10
 45ec588: b941c269     	ldr	w9, [x19, #0x1c0]
 45ec58c: f9409d08     	ldr	x8, [x8, #0x138]
 45ec590: b940010b     	ldr	w11, [x8]
 45ec594: b9400908     	ldr	w8, [x8, #0x8]
 45ec598: 0b0a0129     	add	w9, w9, w10
 45ec59c: 0b080168     	add	w8, w11, w8
 45ec5a0: 4b080128     	sub	w8, w9, w8
 45ec5a4: 7100029f     	cmp	w20, #0x0
 45ec5a8: 7a41d900     	ccmp	w8, #0x1, #0x0, le
 45ec5ac: 5400010a     	b.ge	0x45ec5cc <_ChromeMain+0x45e7330>
 45ec5b0: 390003ff     	strb	wzr, [sp]
 45ec5b4: 390043ff     	strb	wzr, [sp, #0x10]
 45ec5b8: 910003e1     	mov	x1, sp
 45ec5bc: aa1303e0     	mov	x0, x19
 45ec5c0: 52800042     	mov	w2, #0x2                ; =2
 45ec5c4: 94c417c8     	bl	0x76f24e4 <_ChromeMain+0x76ed248>
 45ec5c8: 17ffffe8     	b	0x45ec568 <_ChromeMain+0x45e72cc>
 45ec5cc: 0ab47e89     	bic	w9, w20, w20, asr #31
 45ec5d0: 0aa87d08     	bic	w8, w8, w8, asr #31
 45ec5d4: f940e26a     	ldr	x10, [x19, #0x1c0]
 45ec5d8: a9022bff     	stp	xzr, x10, [sp, #0x20]
 45ec5dc: 2b080128     	adds	w8, w9, w8
 45ec5e0: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 45ec5e4: 1a886148     	csel	w8, w10, w8, vs
 45ec5e8: 4b090108     	sub	w8, w8, w9
 45ec5ec: d3607d08     	lsl	x8, x8, #32
 45ec5f0: d3607d29     	lsl	x9, x9, #32
 45ec5f4: a90023e9     	stp	x9, x8, [sp]
 45ec5f8: 910083e0     	add	x0, sp, #0x20
 45ec5fc: 910003e1     	mov	x1, sp
 45ec600: 96f782ae     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45ec604: b9402be8     	ldr	w8, [sp, #0x28]
 45ec608: 34000068     	cbz	w8, 0x45ec614 <_ChromeMain+0x45e7378>
 45ec60c: b9402fe8     	ldr	w8, [sp, #0x2c]
 45ec610: 35000188     	cbnz	w8, 0x45ec640 <_ChromeMain+0x45e73a4>
 45ec614: 7100069f     	cmp	w20, #0x1
 45ec618: 5400008b     	b.lt	0x45ec628 <_ChromeMain+0x45e738c>
 45ec61c: d004ca68     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45ec620: 3dc37900     	ldr	q0, [x8, #0xde0]
 45ec624: 14000003     	b	0x45ec630 <_ChromeMain+0x45e7394>
 45ec628: d004ca68     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45ec62c: 3dc39d00     	ldr	q0, [x8, #0xe70]
 45ec630: 3d8003e0     	str	q0, [sp]
 45ec634: 910083e0     	add	x0, sp, #0x20
 45ec638: 910003e1     	mov	x1, sp
 45ec63c: 96f7829f     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45ec640: 3dc00be0     	ldr	q0, [sp, #0x20]
 45ec644: 3d8003e0     	str	q0, [sp]
 45ec648: 52800028     	mov	w8, #0x1                ; =1
 45ec64c: 390043e8     	strb	w8, [sp, #0x10]
 45ec650: 17ffffda     	b	0x45ec5b8 <_ChromeMain+0x45e731c>
		...
 45ec660: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 45ec664: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45ec668: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45ec66c: 910083fd     	add	x29, sp, #0x20
 45ec670: aa0003f3     	mov	x19, x0
 45ec674: 39402009     	ldrb	w9, [x0, #0x8]
 45ec678: d0052e28     	adrp	x8, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45ec67c: 340002c9     	cbz	w9, 0x45ec6d4 <_ChromeMain+0x45e7438>
 45ec680: 52801fe9     	mov	w9, #0xff               ; =255
 45ec684: 39002269     	strb	w9, [x19, #0x8]
 45ec688: 39402035     	ldrb	w21, [x1, #0x8]
 45ec68c: 350001d5     	cbnz	w21, 0x45ec6c4 <_ChromeMain+0x45e7428>
 45ec690: f9400034     	ldr	x20, [x1]
 45ec694: 925e7689     	and	x9, x20, #0xfffffffc00000000
 45ec698: f9404508     	ldr	x8, [x8, #0x88]
 45ec69c: eb08013f     	cmp	x9, x8
 45ec6a0: 54000061     	b.ne	0x45ec6ac <_ChromeMain+0x45e7410>
 45ec6a4: aa1403e0     	mov	x0, x20
 45ec6a8: 96e89f15     	bl	0x142fc <_ChromeMain+0xf060>
 45ec6ac: f9000274     	str	x20, [x19]
 45ec6b0: 39002275     	strb	w21, [x19, #0x8]
 45ec6b4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45ec6b8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45ec6bc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45ec6c0: d65f03c0     	ret
 45ec6c4: 7103febf     	cmp	w21, #0xff
 45ec6c8: 54ffff60     	b.eq	0x45ec6b4 <_ChromeMain+0x45e7418>
 45ec6cc: f9400034     	ldr	x20, [x1]
 45ec6d0: 17fffff7     	b	0x45ec6ac <_ChromeMain+0x45e7410>
 45ec6d4: aa0103f4     	mov	x20, x1
 45ec6d8: f9400260     	ldr	x0, [x19]
 45ec6dc: 925e7409     	and	x9, x0, #0xfffffffc00000000
 45ec6e0: aa0803f5     	mov	x21, x8
 45ec6e4: f9404508     	ldr	x8, [x8, #0x88]
 45ec6e8: eb08013f     	cmp	x9, x8
 45ec6ec: 54000041     	b.ne	0x45ec6f4 <_ChromeMain+0x45e7458>
 45ec6f0: 96e8d8d3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45ec6f4: f900027f     	str	xzr, [x19]
 45ec6f8: aa1403e1     	mov	x1, x20
 45ec6fc: aa1503e8     	mov	x8, x21
 45ec700: 17ffffe0     	b	0x45ec680 <_ChromeMain+0x45e73e4>
		...
 45ec720: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 45ec724: a90157f6     	stp	x22, x21, [sp, #0x10]
 45ec728: a9024ff4     	stp	x20, x19, [sp, #0x20]
 45ec72c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 45ec730: 9100c3fd     	add	x29, sp, #0x30
 45ec734: aa0103f4     	mov	x20, x1
 45ec738: aa0003f3     	mov	x19, x0
 45ec73c: a9402408     	ldp	x8, x9, [x0]
 45ec740: 8b091109     	add	x9, x8, x9, lsl #4
 45ec744: eb09003f     	cmp	x1, x9
 45ec748: 54000260     	b.eq	0x45ec794 <_ChromeMain+0x45e74f8>
 45ec74c: d1004135     	sub	x21, x9, #0x10
 45ec750: d0052e36     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45ec754: 52801ff7     	mov	w23, #0xff              ; =255
 45ec758: b40002f5     	cbz	x21, 0x45ec7b4 <_ChromeMain+0x45e7518>
 45ec75c: 394022a8     	ldrb	w8, [x21, #0x8]
 45ec760: 35000108     	cbnz	w8, 0x45ec780 <_ChromeMain+0x45e74e4>
 45ec764: f94002a0     	ldr	x0, [x21]
 45ec768: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45ec76c: f94046c9     	ldr	x9, [x22, #0x88]
 45ec770: eb09011f     	cmp	x8, x9
 45ec774: 54000041     	b.ne	0x45ec77c <_ChromeMain+0x45e74e0>
 45ec778: 96e8d8b1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45ec77c: f90002bf     	str	xzr, [x21]
 45ec780: 390022b7     	strb	w23, [x21, #0x8]
 45ec784: eb1402bf     	cmp	x21, x20
 45ec788: d10042b5     	sub	x21, x21, #0x10
 45ec78c: 54fffe61     	b.ne	0x45ec758 <_ChromeMain+0x45e74bc>
 45ec790: f9400268     	ldr	x8, [x19]
 45ec794: cb080288     	sub	x8, x20, x8
 45ec798: 9344fd08     	asr	x8, x8, #4
 45ec79c: f9000668     	str	x8, [x19, #0x8]
 45ec7a0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45ec7a4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45ec7a8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45ec7ac: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 45ec7b0: d65f03c0     	ret
 45ec7b4: d4200020     	brk	#0x1
 45ec7b8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 45ec7bc: a90157f6     	stp	x22, x21, [sp, #0x10]
 45ec7c0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 45ec7c4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 45ec7c8: 9100c3fd     	add	x29, sp, #0x30
 45ec7cc: aa0003f3     	mov	x19, x0
 45ec7d0: f0050948     	adrp	x8, 0xe717000 <dyld_stub_binder+0xe717000>
 45ec7d4: 912dc108     	add	x8, x8, #0xb70
 45ec7d8: 910fa109     	add	x9, x8, #0x3e8
 45ec7dc: a9002408     	stp	x8, x9, [x0]
 45ec7e0: 91104109     	add	x9, x8, #0x410
 45ec7e4: f9000809     	str	x9, [x0, #0x10]
 45ec7e8: 91112109     	add	x9, x8, #0x448
 45ec7ec: 9111e10a     	add	x10, x8, #0x478
 45ec7f0: a906a809     	stp	x9, x10, [x0, #0x68]
 45ec7f4: 91132109     	add	x9, x8, #0x4c8
 45ec7f8: f9005809     	str	x9, [x0, #0xb0]
 45ec7fc: 9114a109     	add	x9, x8, #0x528
 45ec800: f9006c09     	str	x9, [x0, #0xd8]
 45ec804: 91156108     	add	x8, x8, #0x558
 45ec808: f9007c08     	str	x8, [x0, #0xf8]
 45ec80c: f941c000     	ldr	x0, [x0, #0x380]
 45ec810: b40000a0     	cbz	x0, 0x45ec824 <_ChromeMain+0x45e7588>
 45ec814: 12800008     	mov	w8, #-0x1               ; =-1
 45ec818: b8e80008     	ldaddal	w8, w8, [x0]
 45ec81c: 7100051f     	cmp	w8, #0x1
 45ec820: 540002a0     	b.eq	0x45ec874 <_ChromeMain+0x45e75d8>
 45ec824: f9419a60     	ldr	x0, [x19, #0x330]
 45ec828: b40000a0     	cbz	x0, 0x45ec83c <_ChromeMain+0x45e75a0>
 45ec82c: 12800008     	mov	w8, #-0x1               ; =-1
 45ec830: b8e80008     	ldaddal	w8, w8, [x0]
 45ec834: 7100051f     	cmp	w8, #0x1
 45ec838: 540002e0     	b.eq	0x45ec894 <_ChromeMain+0x45e75f8>
 45ec83c: f9418a60     	ldr	x0, [x19, #0x310]
 45ec840: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45ec844: d0052e29     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45ec848: f9404529     	ldr	x9, [x9, #0x88]
 45ec84c: eb09011f     	cmp	x8, x9
 45ec850: 54000041     	b.ne	0x45ec858 <_ChromeMain+0x45e75bc>
 45ec854: 96e8d87a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45ec858: f9018a7f     	str	xzr, [x19, #0x310]
 45ec85c: aa1303e0     	mov	x0, x19
 45ec860: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45ec864: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45ec868: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45ec86c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 45ec870: 17360c07     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45ec874: b9802808     	ldrsw	x8, [x0, #0x28]
 45ec878: 350001e8     	cbnz	w8, 0x45ec8b4 <_ChromeMain+0x45e7618>
 45ec87c: 3940b008     	ldrb	w8, [x0, #0x2c]
 45ec880: 37000a28     	tbnz	w8, #0x0, 0x45ec9c4 <_ChromeMain+0x45e7728>
 45ec884: f9400814     	ldr	x20, [x0, #0x10]
 45ec888: b5000b74     	cbnz	x20, 0x45ec9f4 <_ChromeMain+0x45e7758>
 45ec88c: 96e89f77     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ec890: 17ffffe5     	b	0x45ec824 <_ChromeMain+0x45e7588>
 45ec894: b9802808     	ldrsw	x8, [x0, #0x28]
 45ec898: 35000528     	cbnz	w8, 0x45ec93c <_ChromeMain+0x45e76a0>
 45ec89c: 3940b008     	ldrb	w8, [x0, #0x2c]
 45ec8a0: 370009e8     	tbnz	w8, #0x0, 0x45ec9dc <_ChromeMain+0x45e7740>
 45ec8a4: f9400814     	ldr	x20, [x0, #0x10]
 45ec8a8: b5000b94     	cbnz	x20, 0x45eca18 <_ChromeMain+0x45e777c>
 45ec8ac: 96e89f6f     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ec8b0: 17ffffe3     	b	0x45ec83c <_ChromeMain+0x45e75a0>
 45ec8b4: aa0003f4     	mov	x20, x0
 45ec8b8: f9401015     	ldr	x21, [x0, #0x20]
 45ec8bc: d37df116     	lsl	x22, x8, #3
 45ec8c0: f94002a8     	ldr	x8, [x21]
 45ec8c4: 1940c108     	ldapurb	w8, [x8, #0xc]
 45ec8c8: 370000a8     	tbnz	w8, #0x0, 0x45ec8dc <_ChromeMain+0x45e7640>
 45ec8cc: f94002a0     	ldr	x0, [x21]
 45ec8d0: f9400008     	ldr	x8, [x0]
 45ec8d4: f9400d08     	ldr	x8, [x8, #0x18]
 45ec8d8: d63f0100     	blr	x8
 45ec8dc: 910022b5     	add	x21, x21, #0x8
 45ec8e0: f10022d6     	subs	x22, x22, #0x8
 45ec8e4: 54fffee1     	b.ne	0x45ec8c0 <_ChromeMain+0x45e7624>
 45ec8e8: aa1403e0     	mov	x0, x20
 45ec8ec: b9802a88     	ldrsw	x8, [x20, #0x28]
 45ec8f0: 34fffc68     	cbz	w8, 0x45ec87c <_ChromeMain+0x45e75e0>
 45ec8f4: f9401015     	ldr	x21, [x0, #0x20]
 45ec8f8: 8b080eb6     	add	x22, x21, x8, lsl #3
 45ec8fc: 12800017     	mov	w23, #-0x1              ; =-1
 45ec900: 14000008     	b	0x45ec920 <_ChromeMain+0x45e7684>
 45ec904: f9400008     	ldr	x8, [x0]
 45ec908: f9400908     	ldr	x8, [x8, #0x10]
 45ec90c: d63f0100     	blr	x8
 45ec910: 910022b5     	add	x21, x21, #0x8
 45ec914: eb1602bf     	cmp	x21, x22
 45ec918: aa1403e0     	mov	x0, x20
 45ec91c: 54fffb02     	b.hs	0x45ec87c <_ChromeMain+0x45e75e0>
 45ec920: f94002a0     	ldr	x0, [x21]
 45ec924: b4ffff60     	cbz	x0, 0x45ec910 <_ChromeMain+0x45e7674>
 45ec928: 91002008     	add	x8, x0, #0x8
 45ec92c: b8f70108     	ldaddal	w23, w8, [x8]
 45ec930: 7100051f     	cmp	w8, #0x1
 45ec934: 54fffee1     	b.ne	0x45ec910 <_ChromeMain+0x45e7674>
 45ec938: 17fffff3     	b	0x45ec904 <_ChromeMain+0x45e7668>
 45ec93c: aa0003f4     	mov	x20, x0
 45ec940: f9401015     	ldr	x21, [x0, #0x20]
 45ec944: d37df116     	lsl	x22, x8, #3
 45ec948: f94002a8     	ldr	x8, [x21]
 45ec94c: 1940c108     	ldapurb	w8, [x8, #0xc]
 45ec950: 370000a8     	tbnz	w8, #0x0, 0x45ec964 <_ChromeMain+0x45e76c8>
 45ec954: f94002a0     	ldr	x0, [x21]
 45ec958: f9400008     	ldr	x8, [x0]
 45ec95c: f9400d08     	ldr	x8, [x8, #0x18]
 45ec960: d63f0100     	blr	x8
 45ec964: 910022b5     	add	x21, x21, #0x8
 45ec968: f10022d6     	subs	x22, x22, #0x8
 45ec96c: 54fffee1     	b.ne	0x45ec948 <_ChromeMain+0x45e76ac>
 45ec970: aa1403e0     	mov	x0, x20
 45ec974: b9802a88     	ldrsw	x8, [x20, #0x28]
 45ec978: 34fff928     	cbz	w8, 0x45ec89c <_ChromeMain+0x45e7600>
 45ec97c: f9401015     	ldr	x21, [x0, #0x20]
 45ec980: 8b080eb6     	add	x22, x21, x8, lsl #3
 45ec984: 12800017     	mov	w23, #-0x1              ; =-1
 45ec988: 14000008     	b	0x45ec9a8 <_ChromeMain+0x45e770c>
 45ec98c: f9400008     	ldr	x8, [x0]
 45ec990: f9400908     	ldr	x8, [x8, #0x10]
 45ec994: d63f0100     	blr	x8
 45ec998: 910022b5     	add	x21, x21, #0x8
 45ec99c: eb1602bf     	cmp	x21, x22
 45ec9a0: aa1403e0     	mov	x0, x20
 45ec9a4: 54fff7c2     	b.hs	0x45ec89c <_ChromeMain+0x45e7600>
 45ec9a8: f94002a0     	ldr	x0, [x21]
 45ec9ac: b4ffff60     	cbz	x0, 0x45ec998 <_ChromeMain+0x45e76fc>
 45ec9b0: 91002008     	add	x8, x0, #0x8
 45ec9b4: b8f70108     	ldaddal	w23, w8, [x8]
 45ec9b8: 7100051f     	cmp	w8, #0x1
 45ec9bc: 54fffee1     	b.ne	0x45ec998 <_ChromeMain+0x45e76fc>
 45ec9c0: 17fffff3     	b	0x45ec98c <_ChromeMain+0x45e76f0>
 45ec9c4: f9401008     	ldr	x8, [x0, #0x20]
 45ec9c8: aa0003f4     	mov	x20, x0
 45ec9cc: aa0803e0     	mov	x0, x8
 45ec9d0: 96ead789     	bl	0xa27f4 <_ChromeMain+0x9d558>
 45ec9d4: aa1403e0     	mov	x0, x20
 45ec9d8: 17ffffab     	b	0x45ec884 <_ChromeMain+0x45e75e8>
 45ec9dc: f9401008     	ldr	x8, [x0, #0x20]
 45ec9e0: aa0003f4     	mov	x20, x0
 45ec9e4: aa0803e0     	mov	x0, x8
 45ec9e8: 96ead783     	bl	0xa27f4 <_ChromeMain+0x9d558>
 45ec9ec: aa1403e0     	mov	x0, x20
 45ec9f0: 17ffffad     	b	0x45ec8a4 <_ChromeMain+0x45e7608>
 45ec9f4: f9400288     	ldr	x8, [x20]
 45ec9f8: aa0003f5     	mov	x21, x0
 45ec9fc: aa0803e0     	mov	x0, x8
 45eca00: 94e8fef0     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 45eca04: aa1403e0     	mov	x0, x20
 45eca08: 52800101     	mov	w1, #0x8                ; =8
 45eca0c: 96e8712b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eca10: aa1503e0     	mov	x0, x21
 45eca14: 17ffff9e     	b	0x45ec88c <_ChromeMain+0x45e75f0>
 45eca18: f9400288     	ldr	x8, [x20]
 45eca1c: aa0003f5     	mov	x21, x0
 45eca20: aa0803e0     	mov	x0, x8
 45eca24: 94e8fee7     	bl	0x802c5c0 <_ChromeMain+0x8027324>
 45eca28: aa1403e0     	mov	x0, x20
 45eca2c: 52800101     	mov	w1, #0x8                ; =8
 45eca30: 96e87122     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45eca34: aa1503e0     	mov	x0, x21
 45eca38: 17ffff9d     	b	0x45ec8ac <_ChromeMain+0x45e7610>
 45eca3c: d10683ff     	sub	sp, sp, #0x1a0
 45eca40: 6d1323e9     	stp	d9, d8, [sp, #0x130]
 45eca44: a9146ffc     	stp	x28, x27, [sp, #0x140]
 45eca48: a91567fa     	stp	x26, x25, [sp, #0x150]
 45eca4c: a9165ff8     	stp	x24, x23, [sp, #0x160]
 45eca50: a91757f6     	stp	x22, x21, [sp, #0x170]
 45eca54: a9184ff4     	stp	x20, x19, [sp, #0x180]
 45eca58: a9197bfd     	stp	x29, x30, [sp, #0x190]
 45eca5c: 910643fd     	add	x29, sp, #0x190
 45eca60: aa0403fa     	mov	x26, x4
 45eca64: aa0303f8     	mov	x24, x3
 45eca68: aa0203f9     	mov	x25, x2
 45eca6c: aa0103f7     	mov	x23, x1
 45eca70: aa0003f4     	mov	x20, x0
 45eca74: 9004d1e8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 45eca78: f940f908     	ldr	x8, [x8, #0x1f0]
 45eca7c: f9400108     	ldr	x8, [x8]
 45eca80: f81903a8     	stur	x8, [x29, #-0x70]
 45eca84: 910c701b     	add	x27, x0, #0x31c
 45eca88: 39404028     	ldrb	w8, [x1, #0x10]
 45eca8c: 34000068     	cbz	w8, 0x45eca98 <_ChromeMain+0x45e77fc>
 45eca90: 3dc002e0     	ldr	q0, [x23]
 45eca94: 3d800360     	str	q0, [x27]
 45eca98: b9400b68     	ldr	w8, [x27, #0x8]
 45eca9c: 34002628     	cbz	w8, 0x45ecf60 <_ChromeMain+0x45e7cc4>
 45ecaa0: b9432a88     	ldr	w8, [x20, #0x328]
 45ecaa4: 340025e8     	cbz	w8, 0x45ecf60 <_ChromeMain+0x45e7cc4>
 45ecaa8: b941ba9c     	ldr	w28, [x20, #0x1b8]
 45ecaac: b941be96     	ldr	w22, [x20, #0x1bc]
 45ecab0: b941c289     	ldr	w9, [x20, #0x1c0]
 45ecab4: b941c688     	ldr	w8, [x20, #0x1c4]
 45ecab8: 290327e8     	stp	w8, w9, [sp, #0x18]
 45ecabc: f9419a93     	ldr	x19, [x20, #0x330]
 45ecac0: b4000073     	cbz	x19, 0x45ecacc <_ChromeMain+0x45e7830>
 45ecac4: 52800028     	mov	w8, #0x1                ; =1
 45ecac8: b8280268     	ldadd	w8, w8, [x19]
 45ecacc: 79467288     	ldrh	w8, [x20, #0x338]
 45ecad0: b90017e8     	str	w8, [sp, #0x14]
 45ecad4: 910e0295     	add	x21, x20, #0x380
 45ecad8: 910e0280     	add	x0, x20, #0x380
 45ecadc: 97340c6e     	bl	0x12efc94 <_ChromeMain+0x12ea9f8>
 45ecae0: 2d2807a0     	stp	s0, s1, [x29, #-0xc0]
 45ecae4: 2d290fa2     	stp	s2, s3, [x29, #-0xb8]
 45ecae8: d10303a0     	sub	x0, x29, #0xc0
 45ecaec: 96e87555     	bl	0xa040 <_ChromeMain+0x4da4>
 45ecaf0: 2d0e07e0     	stp	s0, s1, [sp, #0x70]
 45ecaf4: 2d0f0fe2     	stp	s2, s3, [sp, #0x78]
 45ecaf8: 9101c3e0     	add	x0, sp, #0x70
 45ecafc: 96f7c4e1     	bl	0x3dde80 <_ChromeMain+0x3d8be4>
 45ecb00: a90003e1     	stp	x1, x0, [sp]
 45ecb04: 3dc00360     	ldr	q0, [x27]
 45ecb08: 3d8033e0     	str	q0, [sp, #0xc0]
 45ecb0c: aa1903e0     	mov	x0, x25
 45ecb10: 97340c61     	bl	0x12efc94 <_ChromeMain+0x12ea9f8>
 45ecb14: 2d2807a0     	stp	s0, s1, [x29, #-0xc0]
 45ecb18: 2d290fa2     	stp	s2, s3, [x29, #-0xb8]
 45ecb1c: d10303a0     	sub	x0, x29, #0xc0
 45ecb20: 96e87548     	bl	0xa040 <_ChromeMain+0x4da4>
 45ecb24: 2d0e07e0     	stp	s0, s1, [sp, #0x70]
 45ecb28: 2d0f0fe2     	stp	s2, s3, [sp, #0x78]
 45ecb2c: 9101c3e0     	add	x0, sp, #0x70
 45ecb30: 96f7c4d4     	bl	0x3dde80 <_ChromeMain+0x3d8be4>
 45ecb34: a90b07e0     	stp	x0, x1, [sp, #0xb0]
 45ecb38: 39426308     	ldrb	w8, [x24, #0x98]
 45ecb3c: 34000168     	cbz	w8, 0x45ecb68 <_ChromeMain+0x45e78cc>
 45ecb40: aa1803e0     	mov	x0, x24
 45ecb44: 96e8753f     	bl	0xa040 <_ChromeMain+0x4da4>
 45ecb48: 2d2807a0     	stp	s0, s1, [x29, #-0xc0]
 45ecb4c: 2d290fa2     	stp	s2, s3, [x29, #-0xb8]
 45ecb50: d10303a0     	sub	x0, x29, #0xc0
 45ecb54: 96f7c4cb     	bl	0x3dde80 <_ChromeMain+0x3d8be4>
 45ecb58: a90707e0     	stp	x0, x1, [sp, #0x70]
 45ecb5c: 9102c3e0     	add	x0, sp, #0xb0
 45ecb60: 9101c3e1     	add	x1, sp, #0x70
 45ecb64: 970790c7     	bl	0x7d0e80 <_ChromeMain+0x7cbbe4>
 45ecb68: 910303e0     	add	x0, sp, #0xc0
 45ecb6c: 9102c3e1     	add	x1, sp, #0xb0
 45ecb70: 970ec244     	bl	0x99d480 <_ChromeMain+0x9981e4>
 45ecb74: 6f07e7e0     	movi.2d	v0, #0xffffffffffffffff
 45ecb78: 3d801fe0     	str	q0, [sp, #0x70]
 45ecb7c: 910303e0     	add	x0, sp, #0xc0
 45ecb80: 9101c3e1     	add	x1, sp, #0x70
 45ecb84: 96f7814d     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45ecb88: fd4063e1     	ldr	d1, [sp, #0xc0]
 45ecb8c: 6f00e400     	movi.2d	v0, #0000000000000000
 45ecb90: 2ea0b821     	neg.2s	v1, v1
 45ecb94: 6d400f62     	ldp	d2, d3, [x27]
 45ecb98: 0ea10c41     	sqadd.2s	v1, v2, v1
 45ecb9c: 0ea30c22     	sqadd.2s	v2, v1, v3
 45ecba0: 0ea12c42     	sqsub.2s	v2, v2, v1
 45ecba4: 0ea06448     	smax.2s	v8, v2, v0
 45ecba8: 39404348     	ldrb	w8, [x26, #0x10]
 45ecbac: 4f01f663     	fmov.4s	v3, #19.00000000
 45ecbb0: 4f01f662     	fmov.4s	v2, #19.00000000
 45ecbb4: 34000088     	cbz	w8, 0x45ecbc4 <_ChromeMain+0x45e7928>
 45ecbb8: 6d400b43     	ldp	d3, d2, [x26]
 45ecbbc: 4e823842     	zip1.4s	v2, v2, v2
 45ecbc0: 4e833863     	zip1.4s	v3, v3, v3
 45ecbc4: ad010be3     	stp	q3, q2, [sp, #0x20]
 45ecbc8: ad3b8ba3     	stp	q3, q2, [x29, #-0x90]
 45ecbcc: b900a3ff     	str	wzr, [sp, #0xa0]
 45ecbd0: ad0403e0     	stp	q0, q0, [sp, #0x80]
 45ecbd4: 3d801fe0     	str	q0, [sp, #0x70]
 45ecbd8: 0e21d829     	scvtf.2s	v9, v1
 45ecbdc: 0ea18500     	add.2s	v0, v8, v1
 45ecbe0: 0e21d800     	scvtf.2s	v0, v0
 45ecbe4: 6d3403a9     	stp	d9, d0, [x29, #-0xc0]
 45ecbe8: 9101c3e0     	add	x0, sp, #0x70
 45ecbec: d10303a1     	sub	x1, x29, #0xc0
 45ecbf0: d10243a2     	sub	x2, x29, #0x90
 45ecbf4: 96f59c73     	bl	0x353dc0 <_ChromeMain+0x34eb24>
 45ecbf8: 97621296     	bl	0x1e71650 <_ChromeMain+0x1e6c3b4>
 45ecbfc: 52800008     	mov	w8, #0x0                ; =0
 45ecc00: 5283d609     	mov	w9, #0x1eb0             ; =7856
 45ecc04: 72a00089     	movk	w9, #0x4, lsl #16
 45ecc08: 6b09001f     	cmp	w0, w9
 45ecc0c: 5400004b     	b.lt	0x45ecc14 <_ChromeMain+0x45e7978>
 45ecc10: 39404348     	ldrb	w8, [x26, #0x10]
 45ecc14: 1200011a     	and	w26, w8, #0x1
 45ecc18: 910d029b     	add	x27, x20, #0x340
 45ecc1c: 394dd288     	ldrb	w8, [x20, #0x374]
 45ecc20: 350001a8     	cbnz	w8, 0x45ecc54 <_ChromeMain+0x45e79b8>
 45ecc24: 394dd288     	ldrb	w8, [x20, #0x374]
 45ecc28: 35000268     	cbnz	w8, 0x45ecc74 <_ChromeMain+0x45e79d8>
 45ecc2c: b400229b     	cbz	x27, 0x45ed07c <_ChromeMain+0x45e7de0>
 45ecc30: ad4387e0     	ldp	q0, q1, [sp, #0x70]
 45ecc34: ad000760     	stp	q0, q1, [x27]
 45ecc38: 3dc027e0     	ldr	q0, [sp, #0x90]
 45ecc3c: 3d800b60     	str	q0, [x27, #0x20]
 45ecc40: b940a3e8     	ldr	w8, [sp, #0xa0]
 45ecc44: b9003368     	str	w8, [x27, #0x30]
 45ecc48: 52800028     	mov	w8, #0x1                ; =1
 45ecc4c: 390dd288     	strb	w8, [x20, #0x374]
 45ecc50: 1400000f     	b	0x45ecc8c <_ChromeMain+0x45e79f0>
 45ecc54: 910d0280     	add	x0, x20, #0x340
 45ecc58: 9101c3e1     	add	x1, sp, #0x70
 45ecc5c: 951423c9     	bl	0x8af5b80 <_ChromeMain+0x8af08e4>
 45ecc60: 3707fe20     	tbnz	w0, #0x0, 0x45ecc24 <_ChromeMain+0x45e7988>
 45ecc64: 394de288     	ldrb	w8, [x20, #0x378]
 45ecc68: 6b1a011f     	cmp	w8, w26
 45ecc6c: 54fffdc1     	b.ne	0x45ecc24 <_ChromeMain+0x45e7988>
 45ecc70: 14000033     	b	0x45ecd3c <_ChromeMain+0x45e7aa0>
 45ecc74: ad4387e0     	ldp	q0, q1, [sp, #0x70]
 45ecc78: ad000760     	stp	q0, q1, [x27]
 45ecc7c: 3dc027e0     	ldr	q0, [sp, #0x90]
 45ecc80: 3d800b60     	str	q0, [x27, #0x20]
 45ecc84: b940a3e8     	ldr	w8, [sp, #0xa0]
 45ecc88: b9003368     	str	w8, [x27, #0x30]
 45ecc8c: 390de29a     	strb	w26, [x20, #0x378]
 45ecc90: 350001fa     	cbnz	w26, 0x45ecccc <_ChromeMain+0x45e7a30>
 45ecc94: 910183e8     	add	x8, sp, #0x60
 45ecc98: 9101c3e0     	add	x0, sp, #0x70
 45ecc9c: 52800001     	mov	w1, #0x0                ; =0
 45ecca0: 970b460c     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 45ecca4: 14000015     	b	0x45eccf8 <_ChromeMain+0x45e7a5c>
 45ecca8: b9802b48     	ldrsw	x8, [x26, #0x28]
 45eccac: 35002988     	cbnz	w8, 0x45ed1dc <_ChromeMain+0x45e7f40>
 45eccb0: 3940b348     	ldrb	w8, [x26, #0x2c]
 45eccb4: 37003748     	tbnz	w8, #0x0, 0x45ed39c <_ChromeMain+0x45e8100>
 45eccb8: f9400b5b     	ldr	x27, [x26, #0x10]
 45eccbc: b50038fb     	cbnz	x27, 0x45ed3d8 <_ChromeMain+0x45e813c>
 45eccc0: aa1a03e0     	mov	x0, x26
 45eccc4: 96e89e69     	bl	0x14668 <_ChromeMain+0xf3cc>
 45eccc8: 1400001d     	b	0x45ecd3c <_ChromeMain+0x45e7aa0>
 45ecccc: 2e21d900     	ucvtf.2s	v0, v8
 45eccd0: 6d0503e9     	stp	d9, d0, [sp, #0x50]
 45eccd4: ad4107e0     	ldp	q0, q1, [sp, #0x20]
 45eccd8: 4e802800     	trn1.4s	v0, v0, v0
 45eccdc: 4e812821     	trn1.4s	v1, v1, v1
 45ecce0: ad3a07a0     	stp	q0, q1, [x29, #-0xc0]
 45ecce4: 910183e8     	add	x8, sp, #0x60
 45ecce8: 910143e0     	add	x0, sp, #0x50
 45eccec: d10303a1     	sub	x1, x29, #0xc0
 45eccf0: 6f00e400     	movi.2d	v0, #0000000000000000
 45eccf4: 97ff8e33     	bl	0x45d05c0 <_ChromeMain+0x45cb324>
 45eccf8: f94033e8     	ldr	x8, [sp, #0x60]
 45eccfc: f90033ff     	str	xzr, [sp, #0x60]
 45ecd00: f9419a9a     	ldr	x26, [x20, #0x330]
 45ecd04: f9019a88     	str	x8, [x20, #0x330]
 45ecd08: b4001e9a     	cbz	x26, 0x45ed0d8 <_ChromeMain+0x45e7e3c>
 45ecd0c: 12800008     	mov	w8, #-0x1               ; =-1
 45ecd10: b8e80348     	ldaddal	w8, w8, [x26]
 45ecd14: 7100051f     	cmp	w8, #0x1
 45ecd18: 54001c60     	b.eq	0x45ed0a4 <_ChromeMain+0x45e7e08>
 45ecd1c: f94033fa     	ldr	x26, [sp, #0x60]
 45ecd20: 7940d3e8     	ldrh	w8, [sp, #0x68]
 45ecd24: 79067288     	strh	w8, [x20, #0x338]
 45ecd28: b40000ba     	cbz	x26, 0x45ecd3c <_ChromeMain+0x45e7aa0>
 45ecd2c: 12800008     	mov	w8, #-0x1               ; =-1
 45ecd30: b8e80348     	ldaddal	w8, w8, [x26]
 45ecd34: 7100051f     	cmp	w8, #0x1
 45ecd38: 54fffb80     	b.eq	0x45ecca8 <_ChromeMain+0x45e7a0c>
 45ecd3c: 295827e8     	ldp	w8, w9, [sp, #0xc0]
 45ecd40: 4b0803ea     	neg	w10, w8
 45ecd44: 1e220140     	scvtf	s0, w10
 45ecd48: 4b0903ea     	neg	w10, w9
 45ecd4c: 1e220141     	scvtf	s1, w10
 45ecd50: 2a080128     	orr	w8, w9, w8
 45ecd54: 7100011f     	cmp	w8, #0x0
 45ecd58: 52800208     	mov	w8, #0x10               ; =16
 45ecd5c: 1a880508     	cinc	w8, w8, ne
 45ecd60: 52a7f009     	mov	w9, #0x3f800000         ; =1065353216
 45ecd64: f81403a9     	stur	x9, [x29, #-0xc0]
 45ecd68: bc1483a0     	stur	s0, [x29, #-0xb8]
 45ecd6c: d2e7f00a     	mov	x10, #0x3f80000000000000 ; =4575657221408423936
 45ecd70: f814c3aa     	stur	x10, [x29, #-0xb4]
 45ecd74: bc1543a1     	stur	s1, [x29, #-0xac]
 45ecd78: f81583bf     	stur	xzr, [x29, #-0xa8]
 45ecd7c: 292c23a9     	stp	w9, w8, [x29, #-0xa0]
 45ecd80: 910183e8     	add	x8, sp, #0x60
 45ecd84: d10303a1     	sub	x1, x29, #0xc0
 45ecd88: aa1903e0     	mov	x0, x25
 45ecd8c: 970df3ed     	bl	0x969d40 <_ChromeMain+0x964aa4>
 45ecd90: f94033e8     	ldr	x8, [sp, #0x60]
 45ecd94: f90033ff     	str	xzr, [sp, #0x60]
 45ecd98: f94002b9     	ldr	x25, [x21]
 45ecd9c: f90002a8     	str	x8, [x21]
 45ecda0: b4001979     	cbz	x25, 0x45ed0cc <_ChromeMain+0x45e7e30>
 45ecda4: 12800008     	mov	w8, #-0x1               ; =-1
 45ecda8: b8e80328     	ldaddal	w8, w8, [x25]
 45ecdac: 7100051f     	cmp	w8, #0x1
 45ecdb0: 54001680     	b.eq	0x45ed080 <_ChromeMain+0x45e7de4>
 45ecdb4: f94033f9     	ldr	x25, [sp, #0x60]
 45ecdb8: 7940d3e8     	ldrh	w8, [sp, #0x68]
 45ecdbc: 79071288     	strh	w8, [x20, #0x388]
 45ecdc0: b40000b9     	cbz	x25, 0x45ecdd4 <_ChromeMain+0x45e7b38>
 45ecdc4: 12800008     	mov	w8, #-0x1               ; =-1
 45ecdc8: b8e80328     	ldaddal	w8, w8, [x25]
 45ecdcc: 7100051f     	cmp	w8, #0x1
 45ecdd0: 540000a0     	b.eq	0x45ecde4 <_ChromeMain+0x45e7b48>
 45ecdd4: 39426308     	ldrb	w8, [x24, #0x98]
 45ecdd8: 35000188     	cbnz	w8, 0x45ece08 <_ChromeMain+0x45e7b6c>
 45ecddc: 52800009     	mov	w9, #0x0                ; =0
 45ecde0: 14000013     	b	0x45ece2c <_ChromeMain+0x45e7b90>
 45ecde4: b9802b28     	ldrsw	x8, [x25, #0x28]
 45ecde8: 35001bc8     	cbnz	w8, 0x45ed160 <_ChromeMain+0x45e7ec4>
 45ecdec: 3940b328     	ldrb	w8, [x25, #0x2c]
 45ecdf0: 37002d08     	tbnz	w8, #0x0, 0x45ed390 <_ChromeMain+0x45e80f4>
 45ecdf4: f9400b3a     	ldr	x26, [x25, #0x10]
 45ecdf8: b5002e5a     	cbnz	x26, 0x45ed3c0 <_ChromeMain+0x45e8124>
 45ecdfc: aa1903e0     	mov	x0, x25
 45ece00: 96e89e1a     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ece04: 17fffff4     	b	0x45ecdd4 <_ChromeMain+0x45e7b38>
 45ece08: 0f03f600     	fmov.2s	v0, #1.00000000
 45ece0c: fd4063e1     	ldr	d1, [sp, #0xc0]
 45ece10: 2ea0b821     	neg.2s	v1, v1
 45ece14: 0e21d821     	scvtf.2s	v1, v1
 45ece18: 6d3407a0     	stp	d0, d1, [x29, #-0xc0]
 45ece1c: d10303a1     	sub	x1, x29, #0xc0
 45ece20: aa1803e0     	mov	x0, x24
 45ece24: 971b6075     	bl	0xcc4ff8 <_ChromeMain+0xcbfd5c>
 45ece28: 39426309     	ldrb	w9, [x24, #0x98]
 45ece2c: 910e4288     	add	x8, x20, #0x390
 45ece30: 3950a28a     	ldrb	w10, [x20, #0x428]
 45ece34: 6b09015f     	cmp	w10, w9
 45ece38: 540021a1     	b.ne	0x45ed26c <_ChromeMain+0x45e7fd0>
 45ece3c: 3500254a     	cbnz	w10, 0x45ed2e4 <_ChromeMain+0x45e8048>
 45ece40: 910303e1     	add	x1, sp, #0xc0
 45ece44: aa1403e0     	mov	x0, x20
 45ece48: 970adf52     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 45ece4c: 394042e8     	ldrb	w8, [x23, #0x10]
 45ece50: 370007a8     	tbnz	w8, #0x0, 0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece54: b940c3e8     	ldr	w8, [sp, #0xc0]
 45ece58: 6b08039f     	cmp	w28, w8
 45ece5c: 54000741     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece60: b940c7e8     	ldr	w8, [sp, #0xc4]
 45ece64: 6b0802df     	cmp	w22, w8
 45ece68: 540006e1     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece6c: b940cbe8     	ldr	w8, [sp, #0xc8]
 45ece70: b9401fe9     	ldr	w9, [sp, #0x1c]
 45ece74: 6b08013f     	cmp	w9, w8
 45ece78: 54000661     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece7c: b940cfe8     	ldr	w8, [sp, #0xcc]
 45ece80: b9401be9     	ldr	w9, [sp, #0x18]
 45ece84: 6b08013f     	cmp	w9, w8
 45ece88: 540005e1     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece8c: 394ce288     	ldrb	w8, [x20, #0x338]
 45ece90: b94017e9     	ldr	w9, [sp, #0x14]
 45ece94: 6b29011f     	cmp	w8, w9, uxtb
 45ece98: 54000561     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ece9c: f9419a88     	ldr	x8, [x20, #0x330]
 45ecea0: eb08027f     	cmp	x19, x8
 45ecea4: 540008e0     	b.eq	0x45ecfc0 <_ChromeMain+0x45e7d24>
 45ecea8: f9401e6b     	ldr	x11, [x19, #0x38]
 45eceac: f9401d09     	ldr	x9, [x8, #0x38]
 45eceb0: eb09017f     	cmp	x11, x9
 45eceb4: 54000481     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45eceb8: b40001eb     	cbz	x11, 0x45ecef4 <_ChromeMain+0x45e7c58>
 45ecebc: f9401a69     	ldr	x9, [x19, #0x30]
 45ecec0: f940190a     	ldr	x10, [x8, #0x30]
 45ecec4: eb0a013f     	cmp	x9, x10
 45ecec8: 54000160     	b.eq	0x45ecef4 <_ChromeMain+0x45e7c58>
 45ececc: d37df16c     	lsl	x12, x11, #3
 45eced0: b400012c     	cbz	x12, 0x45ecef4 <_ChromeMain+0x45e7c58>
 45eced4: 8b0b0d2b     	add	x11, x9, x11, lsl #3
 45eced8: 2cc10520     	ldp	s0, s1, [x9], #0x8
 45ecedc: 2cc10d42     	ldp	s2, s3, [x10], #0x8
 45ecee0: 1e222000     	fcmp	s0, s2
 45ecee4: 1e230420     	fccmp	s1, s3, #0x0, eq
 45ecee8: 540002e1     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45eceec: eb0b013f     	cmp	x9, x11
 45ecef0: 54ffff41     	b.ne	0x45eced8 <_ChromeMain+0x45e7c3c>
 45ecef4: f940266b     	ldr	x11, [x19, #0x48]
 45ecef8: f9402509     	ldr	x9, [x8, #0x48]
 45ecefc: eb09017f     	cmp	x11, x9
 45ecf00: 54000221     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ecf04: b40000ab     	cbz	x11, 0x45ecf18 <_ChromeMain+0x45e7c7c>
 45ecf08: f9402269     	ldr	x9, [x19, #0x40]
 45ecf0c: f940210a     	ldr	x10, [x8, #0x40]
 45ecf10: eb0a013f     	cmp	x9, x10
 45ecf14: 54000a21     	b.ne	0x45ed058 <_ChromeMain+0x45e7dbc>
 45ecf18: f9402e62     	ldr	x2, [x19, #0x58]
 45ecf1c: f9402d09     	ldr	x9, [x8, #0x58]
 45ecf20: eb09005f     	cmp	x2, x9
 45ecf24: 54000101     	b.ne	0x45ecf44 <_ChromeMain+0x45e7ca8>
 45ecf28: b40004c2     	cbz	x2, 0x45ecfc0 <_ChromeMain+0x45e7d24>
 45ecf2c: f9402a60     	ldr	x0, [x19, #0x50]
 45ecf30: f9402901     	ldr	x1, [x8, #0x50]
 45ecf34: eb01001f     	cmp	x0, x1
 45ecf38: 54000440     	b.eq	0x45ecfc0 <_ChromeMain+0x45e7d24>
 45ecf3c: 94e87249     	bl	0x8009860 <_ChromeMain+0x80045c4>
 45ecf40: 34000400     	cbz	w0, 0x45ecfc0 <_ChromeMain+0x45e7d24>
 45ecf44: aa1403e0     	mov	x0, x20
 45ecf48: 96fed08d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 45ecf4c: b40000b3     	cbz	x19, 0x45ecf60 <_ChromeMain+0x45e7cc4>
 45ecf50: 12800008     	mov	w8, #-0x1               ; =-1
 45ecf54: b8e80268     	ldaddal	w8, w8, [x19]
 45ecf58: 7100051f     	cmp	w8, #0x1
 45ecf5c: 54000200     	b.eq	0x45ecf9c <_ChromeMain+0x45e7d00>
 45ecf60: f85903a8     	ldur	x8, [x29, #-0x70]
 45ecf64: 9004d1e9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 45ecf68: f940f929     	ldr	x9, [x9, #0x1f0]
 45ecf6c: f9400129     	ldr	x9, [x9]
 45ecf70: eb08013f     	cmp	x9, x8
 45ecf74: 54000aa1     	b.ne	0x45ed0c8 <_ChromeMain+0x45e7e2c>
 45ecf78: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 45ecf7c: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 45ecf80: a95757f6     	ldp	x22, x21, [sp, #0x170]
 45ecf84: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 45ecf88: a95567fa     	ldp	x26, x25, [sp, #0x150]
 45ecf8c: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 45ecf90: 6d5323e9     	ldp	d9, d8, [sp, #0x130]
 45ecf94: 910683ff     	add	sp, sp, #0x1a0
 45ecf98: d65f03c0     	ret
 45ecf9c: b9802a68     	ldrsw	x8, [x19, #0x28]
 45ecfa0: 35000a28     	cbnz	w8, 0x45ed0e4 <_ChromeMain+0x45e7e48>
 45ecfa4: 3940b268     	ldrb	w8, [x19, #0x2c]
 45ecfa8: 37001ee8     	tbnz	w8, #0x0, 0x45ed384 <_ChromeMain+0x45e80e8>
 45ecfac: f9400a74     	ldr	x20, [x19, #0x10]
 45ecfb0: b5001fd4     	cbnz	x20, 0x45ed3a8 <_ChromeMain+0x45e810c>
 45ecfb4: aa1303e0     	mov	x0, x19
 45ecfb8: 96e89dac     	bl	0x14668 <_ChromeMain+0xf3cc>
 45ecfbc: 17ffffe9     	b	0x45ecf60 <_ChromeMain+0x45e7cc4>
 45ecfc0: a94027e8     	ldp	x8, x9, [sp]
 45ecfc4: a90623e9     	stp	x9, x8, [sp, #0x60]
 45ecfc8: 910e0280     	add	x0, x20, #0x380
 45ecfcc: 97340b32     	bl	0x12efc94 <_ChromeMain+0x12ea9f8>
 45ecfd0: 2d0807e0     	stp	s0, s1, [sp, #0x40]
 45ecfd4: 2d090fe2     	stp	s2, s3, [sp, #0x48]
 45ecfd8: 910103e0     	add	x0, sp, #0x40
 45ecfdc: 96e87419     	bl	0xa040 <_ChromeMain+0x4da4>
 45ecfe0: 2d0a07e0     	stp	s0, s1, [sp, #0x50]
 45ecfe4: 2d0b0fe2     	stp	s2, s3, [sp, #0x58]
 45ecfe8: 910143e0     	add	x0, sp, #0x50
 45ecfec: 96f7c3a5     	bl	0x3dde80 <_ChromeMain+0x3d8be4>
 45ecff0: a93407a0     	stp	x0, x1, [x29, #-0xc0]
 45ecff4: 910183e0     	add	x0, sp, #0x60
 45ecff8: d10303a1     	sub	x1, x29, #0xc0
 45ecffc: 970ec121     	bl	0x99d480 <_ChromeMain+0x9981e4>
