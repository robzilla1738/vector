
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4608f70: d101c3ff     	sub	sp, sp, #0x70
 4608f74: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4608f78: a90457f6     	stp	x22, x21, [sp, #0x40]
 4608f7c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4608f80: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4608f84: 910183fd     	add	x29, sp, #0x60
 4608f88: f940cc08     	ldr	x8, [x0, #0x198]
 4608f8c: d37df108     	lsl	x8, x8, #3
 4608f90: b4000328     	cbz	x8, 0x4608ff4 <_ChromeMain+0x4603d58>
 4608f94: aa0203f4     	mov	x20, x2
 4608f98: aa0003f3     	mov	x19, x0
 4608f9c: d2800009     	mov	x9, #0x0                ; =0
 4608fa0: f940c80a     	ldr	x10, [x0, #0x190]
 4608fa4: f869694b     	ldr	x11, [x10, x9]
 4608fa8: eb01017f     	cmp	x11, x1
 4608fac: 540000a0     	b.eq	0x4608fc0 <_ChromeMain+0x4603d24>
 4608fb0: 91002129     	add	x9, x9, #0x8
 4608fb4: eb09011f     	cmp	x8, x9
 4608fb8: 540001e0     	b.eq	0x4608ff4 <_ChromeMain+0x4603d58>
 4608fbc: 17fffffa     	b	0x4608fa4 <_ChromeMain+0x4603d08>
 4608fc0: 9343fd35     	asr	x21, x9, #3
 4608fc4: f941b668     	ldr	x8, [x19, #0x368]
 4608fc8: eb0802bf     	cmp	x21, x8
 4608fcc: 54000142     	b.hs	0x4608ff4 <_ChromeMain+0x4603d58>
 4608fd0: aa1303e0     	mov	x0, x19
 4608fd4: aa1503e1     	mov	x1, x21
 4608fd8: 97fffae6     	bl	0x4607b70 <_ChromeMain+0x46028d4>
 4608fdc: f9423e68     	ldr	x8, [x19, #0x478]
 4608fe0: b40000a8     	cbz	x8, 0x4608ff4 <_ChromeMain+0x4603d58>
 4608fe4: f9424269     	ldr	x9, [x19, #0x480]
 4608fe8: b4000069     	cbz	x9, 0x4608ff4 <_ChromeMain+0x4603d58>
 4608fec: f9424669     	ldr	x9, [x19, #0x488]
 4608ff0: b5000109     	cbnz	x9, 0x4609010 <_ChromeMain+0x4603d74>
 4608ff4: 52800000     	mov	w0, #0x0                ; =0
 4608ff8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4608ffc: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4609000: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4609004: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4609008: 9101c3ff     	add	sp, sp, #0x70
 460900c: d65f03c0     	ret
 4609010: f9407109     	ldr	x9, [x8, #0xe0]
 4609014: b40001c9     	cbz	x9, 0x460904c <_ChromeMain+0x4603db0>
 4609018: 19404129     	ldapurb	w9, [x9, #0x4]
 460901c: 35000189     	cbnz	w9, 0x460904c <_ChromeMain+0x4603db0>
 4609020: f9407509     	ldr	x9, [x8, #0xe8]
 4609024: b4000149     	cbz	x9, 0x460904c <_ChromeMain+0x4603db0>
 4609028: f9407109     	ldr	x9, [x8, #0xe0]
 460902c: b4001089     	cbz	x9, 0x460923c <_ChromeMain+0x4603fa0>
 4609030: 19404129     	ldapurb	w9, [x9, #0x4]
 4609034: 35001049     	cbnz	w9, 0x460923c <_ChromeMain+0x4603fa0>
 4609038: f9407508     	ldr	x8, [x8, #0xe8]
 460903c: f9402508     	ldr	x8, [x8, #0x48]
 4609040: b4000068     	cbz	x8, 0x460904c <_ChromeMain+0x4603db0>
 4609044: 3949a108     	ldrb	w8, [x8, #0x268]
 4609048: 37000088     	tbnz	w8, #0x0, 0x4609058 <_ChromeMain+0x4603dbc>
 460904c: aa1303e0     	mov	x0, x19
 4609050: aa1503e1     	mov	x1, x21
 4609054: 97ffff83     	bl	0x4608e60 <_ChromeMain+0x4603bc4>
 4609058: f9424668     	ldr	x8, [x19, #0x488]
 460905c: f941f117     	ldr	x23, [x8, #0x3e0]
 4609060: eb1502ff     	cmp	x23, x21
 4609064: 54000080     	b.eq	0x4609074 <_ChromeMain+0x4603dd8>
 4609068: f901f115     	str	x21, [x8, #0x3e0]
 460906c: f9424660     	ldr	x0, [x19, #0x488]
 4609070: 97fffa14     	bl	0x46078c0 <_ChromeMain+0x4602624>
 4609074: 3dc00280     	ldr	q0, [x20]
 4609078: 3d8007e0     	str	q0, [sp, #0x10]
 460907c: 910043e1     	add	x1, sp, #0x10
 4609080: aa1303e0     	mov	x0, x19
 4609084: 958346e1     	bl	0xa6dac08 <_ChromeMain+0xa6d596c>
 4609088: f9423e60     	ldr	x0, [x19, #0x478]
 460908c: 97f7a005     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 4609090: b94013e8     	ldr	w8, [sp, #0x10]
 4609094: 6b00011f     	cmp	w8, w0
 4609098: 54000181     	b.ne	0x46090c8 <_ChromeMain+0x4603e2c>
 460909c: d360fc08     	lsr	x8, x0, #32
 46090a0: b94017e9     	ldr	w9, [sp, #0x14]
 46090a4: 6b08013f     	cmp	w9, w8
 46090a8: 54000101     	b.ne	0x46090c8 <_ChromeMain+0x4603e2c>
 46090ac: b9401be8     	ldr	w8, [sp, #0x18]
 46090b0: 6b01011f     	cmp	w8, w1
 46090b4: 540000a1     	b.ne	0x46090c8 <_ChromeMain+0x4603e2c>
 46090b8: d360fc28     	lsr	x8, x1, #32
 46090bc: b9401fe9     	ldr	w9, [sp, #0x1c]
 46090c0: 6b08013f     	cmp	w9, w8
 46090c4: 540002a0     	b.eq	0x4609118 <_ChromeMain+0x4603e7c>
 46090c8: f9423e68     	ldr	x8, [x19, #0x478]
 46090cc: f9407109     	ldr	x9, [x8, #0xe0]
 46090d0: b4000249     	cbz	x9, 0x4609118 <_ChromeMain+0x4603e7c>
 46090d4: 19404129     	ldapurb	w9, [x9, #0x4]
 46090d8: 35000209     	cbnz	w9, 0x4609118 <_ChromeMain+0x4603e7c>
 46090dc: f9407509     	ldr	x9, [x8, #0xe8]
 46090e0: b40001c9     	cbz	x9, 0x4609118 <_ChromeMain+0x4603e7c>
 46090e4: f9407109     	ldr	x9, [x8, #0xe0]
 46090e8: b4000b09     	cbz	x9, 0x4609248 <_ChromeMain+0x4603fac>
 46090ec: 19404129     	ldapurb	w9, [x9, #0x4]
 46090f0: 35000ac9     	cbnz	w9, 0x4609248 <_ChromeMain+0x4603fac>
 46090f4: f9407500     	ldr	x0, [x8, #0xe8]
 46090f8: f9402416     	ldr	x22, [x0, #0x48]
 46090fc: b40000f6     	cbz	x22, 0x4609118 <_ChromeMain+0x4603e7c>
 4609100: 910043e1     	add	x1, sp, #0x10
 4609104: 9754be31     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 4609108: a90207e0     	stp	x0, x1, [sp, #0x20]
 460910c: 910083e1     	add	x1, sp, #0x20
 4609110: aa1603e0     	mov	x0, x22
 4609114: 9754be68     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 4609118: f9400fe8     	ldr	x8, [sp, #0x18]
 460911c: a90223ff     	stp	xzr, x8, [sp, #0x20]
 4609120: f9424260     	ldr	x0, [x19, #0x480]
 4609124: b941b809     	ldr	w9, [x0, #0x1b8]
 4609128: b941bc0a     	ldr	w10, [x0, #0x1bc]
 460912c: 2a0a0129     	orr	w9, w9, w10
 4609130: 35000109     	cbnz	w9, 0x4609150 <_ChromeMain+0x4603eb4>
 4609134: b941c009     	ldr	w9, [x0, #0x1c0]
 4609138: 6b08013f     	cmp	w9, w8
 460913c: 540000a1     	b.ne	0x4609150 <_ChromeMain+0x4603eb4>
 4609140: d360fd08     	lsr	x8, x8, #32
 4609144: b941c409     	ldr	w9, [x0, #0x1c4]
 4609148: 6b08013f     	cmp	w9, w8
 460914c: 54000060     	b.eq	0x4609158 <_ChromeMain+0x4603ebc>
 4609150: 910083e1     	add	x1, sp, #0x20
 4609154: 970a6e8f     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4609158: f90003ff     	str	xzr, [sp]
 460915c: fd400680     	ldr	d0, [x20, #0x8]
 4609160: 6f00e401     	movi.2d	v1, #0000000000000000
 4609164: 0ea16400     	smax.2s	v0, v0, v1
 4609168: fd0007e0     	str	d0, [sp, #0x8]
 460916c: f9424660     	ldr	x0, [x19, #0x488]
 4609170: b941b808     	ldr	w8, [x0, #0x1b8]
 4609174: b941bc09     	ldr	w9, [x0, #0x1bc]
 4609178: 2a090108     	orr	w8, w8, w9
 460917c: 35000188     	cbnz	w8, 0x46091ac <_ChromeMain+0x4603f10>
 4609180: b941c008     	ldr	w8, [x0, #0x1c0]
 4609184: 1e260009     	fmov	w9, s0
 4609188: 6b09011f     	cmp	w8, w9
 460918c: 54000101     	b.ne	0x46091ac <_ChromeMain+0x4603f10>
 4609190: b941c408     	ldr	w8, [x0, #0x1c4]
 4609194: 0e0c3c09     	mov.s	w9, v0[1]
 4609198: 6b09011f     	cmp	w8, w9
 460919c: 54000081     	b.ne	0x46091ac <_ChromeMain+0x4603f10>
 46091a0: eb1502ff     	cmp	x23, x21
 46091a4: 540000e1     	b.ne	0x46091c0 <_ChromeMain+0x4603f24>
 46091a8: 14000008     	b	0x46091c8 <_ChromeMain+0x4603f2c>
 46091ac: 910003e1     	mov	x1, sp
 46091b0: 970a6e78     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 46091b4: f9424660     	ldr	x0, [x19, #0x488]
 46091b8: 970a721f     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 46091bc: f9424660     	ldr	x0, [x19, #0x488]
 46091c0: 96fe5fef     	bl	0x5a117c <_ChromeMain+0x59bee0>
 46091c4: f9424660     	ldr	x0, [x19, #0x488]
 46091c8: f9401013     	ldr	x19, [x0, #0x20]
 46091cc: f940b668     	ldr	x8, [x19, #0x168]
 46091d0: f9401108     	ldr	x8, [x8, #0x20]
 46091d4: b4000128     	cbz	x8, 0x46091f8 <_ChromeMain+0x4603f5c>
 46091d8: bd401900     	ldr	s0, [x8, #0x18]
 46091dc: 1e2e1001     	fmov	s1, #1.00000000
 46091e0: 1e212000     	fcmp	s0, s1
 46091e4: 540000a0     	b.eq	0x46091f8 <_ChromeMain+0x4603f5c>
 46091e8: f940b260     	ldr	x0, [x19, #0x160]
 46091ec: b40000a0     	cbz	x0, 0x4609200 <_ChromeMain+0x4603f64>
 46091f0: 1e2e1000     	fmov	s0, #1.00000000
 46091f4: 9753ae51     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 46091f8: 52800020     	mov	w0, #0x1                ; =1
 46091fc: 17ffff7f     	b	0x4608ff8 <_ChromeMain+0x4603d5c>
 4609200: 52802400     	mov	w0, #0x120              ; =288
 4609204: 96e81859     	bl	0xf368 <_ChromeMain+0xa0cc>
 4609208: aa0003f4     	mov	x20, x0
 460920c: d2800001     	mov	x1, #0x0                ; =0
 4609210: 9729c432     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4609214: b40000a0     	cbz	x0, 0x4609228 <_ChromeMain+0x4603f8c>
 4609218: b9400a88     	ldr	w8, [x20, #0x8]
 460921c: 31000508     	adds	w8, w8, #0x1
 4609220: b9000a88     	str	w8, [x20, #0x8]
 4609224: 54000182     	b.hs	0x4609254 <_ChromeMain+0x4603fb8>
 4609228: aa1303e0     	mov	x0, x19
 460922c: aa1403e1     	mov	x1, x20
 4609230: 9731cbf3     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4609234: f940b260     	ldr	x0, [x19, #0x160]
 4609238: 17ffffee     	b	0x46091f0 <_ChromeMain+0x4603f54>
 460923c: d4200000     	brk	#0
 4609240: d4400000     	hlt	#0
 4609244: d4200020     	brk	#0x1
 4609248: d4200000     	brk	#0
 460924c: d4400000     	hlt	#0
 4609250: d4200020     	brk	#0x1
 4609254: d4200000     	brk	#0
 4609258: d4400000     	hlt	#0
 460925c: d4200020     	brk	#0x1
