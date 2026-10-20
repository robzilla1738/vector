
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4266e60: d10583ff     	sub	sp, sp, #0x160
 4266e64: a9106ffc     	stp	x28, x27, [sp, #0x100]
 4266e68: a91167fa     	stp	x26, x25, [sp, #0x110]
 4266e6c: a9125ff8     	stp	x24, x23, [sp, #0x120]
 4266e70: a91357f6     	stp	x22, x21, [sp, #0x130]
 4266e74: a9144ff4     	stp	x20, x19, [sp, #0x140]
 4266e78: a9157bfd     	stp	x29, x30, [sp, #0x150]
 4266e7c: 910543fd     	add	x29, sp, #0x150
 4266e80: aa0003f5     	mov	x21, x0
 4266e84: aa0803f4     	mov	x20, x8
 4266e88: a938ffbf     	stp	xzr, xzr, [x29, #-0x78]
 4266e8c: f81983bf     	stur	xzr, [x29, #-0x68]
 4266e90: 910063e8     	add	x8, sp, #0x18
 4266e94: 97ffe49a     	bl	0x42600fc <_ChromeMain+0x425ae60>
 4266e98: b004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4266e9c: 91289821     	add	x1, x1, #0xa26
 4266ea0: d101e3a8     	sub	x8, x29, #0x78
 4266ea4: 910063e0     	add	x0, sp, #0x18
 4266ea8: 52800162     	mov	w2, #0xb                ; =11
 4266eac: 9750c95a     	bl	0x1699414 <_ChromeMain+0x1694178>
 4266eb0: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4266eb4: 37f80548     	tbnz	w8, #0x1f, 0x4266f5c <_ChromeMain+0x4261cc0>
 4266eb8: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4266ebc: f81803bf     	stur	xzr, [x29, #-0x80]
 4266ec0: b004ac01     	adrp	x1, 0xd7e7000 <dyld_stub_binder+0xd7e7000>
 4266ec4: 91080821     	add	x1, x1, #0x202
 4266ec8: d101e3a0     	sub	x0, x29, #0x78
 4266ecc: 52800042     	mov	w2, #0x2                ; =2
 4266ed0: 9774af77     	bl	0x1f92cac <_ChromeMain+0x1f8da10>
 4266ed4: aa0003f3     	mov	x19, x0
 4266ed8: b40000e0     	cbz	x0, 0x4266ef4 <_ChromeMain+0x4261c58>
 4266edc: d10243b6     	sub	x22, x29, #0x90
 4266ee0: d10243a2     	sub	x2, x29, #0x90
 4266ee4: aa1303e0     	mov	x0, x19
 4266ee8: 92800001     	mov	x1, #-0x1               ; =-1
 4266eec: 94019b9f     	bl	0x42cdd68 <_ChromeMain+0x42c8acc>
 4266ef0: 370004a0     	tbnz	w0, #0x0, 0x4266f84 <_ChromeMain+0x4261ce8>
 4266ef4: 94f68790     	bl	0x8008d34 <_ChromeMain+0x8003a98>
 4266ef8: b9400008     	ldr	w8, [x0]
 4266efc: 7100051f     	cmp	w8, #0x1
 4266f00: 1a9f17e1     	cset	w1, eq
 4266f04: aa1403e8     	mov	x8, x20
 4266f08: aa1503e0     	mov	x0, x21
 4266f0c: 9400017f     	bl	0x4267508 <_ChromeMain+0x426226c>
 4266f10: b4000073     	cbz	x19, 0x4266f1c <_ChromeMain+0x4261c80>
 4266f14: aa1303e0     	mov	x0, x19
 4266f18: 94fed8b0     	bl	0x821d1d8 <_ChromeMain+0x8217f3c>
 4266f1c: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4266f20: 36f800a8     	tbz	w8, #0x1f, 0x4266f34 <_ChromeMain+0x4261c98>
 4266f24: f85703a0     	ldur	x0, [x29, #-0x90]
 4266f28: f85803a8     	ldur	x8, [x29, #-0x80]
 4266f2c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4266f30: 96f687e2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4266f34: 38d9f3a8     	ldursb	w8, [x29, #-0x61]
 4266f38: 37f801c8     	tbnz	w8, #0x1f, 0x4266f70 <_ChromeMain+0x4261cd4>
 4266f3c: a9557bfd     	ldp	x29, x30, [sp, #0x150]
 4266f40: a9544ff4     	ldp	x20, x19, [sp, #0x140]
 4266f44: a95357f6     	ldp	x22, x21, [sp, #0x130]
 4266f48: a9525ff8     	ldp	x24, x23, [sp, #0x120]
 4266f4c: a95167fa     	ldp	x26, x25, [sp, #0x110]
 4266f50: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 4266f54: 910583ff     	add	sp, sp, #0x160
 4266f58: d65f03c0     	ret
 4266f5c: f9400fe0     	ldr	x0, [sp, #0x18]
 4266f60: f94017e8     	ldr	x8, [sp, #0x28]
 4266f64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4266f68: 96f687d4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4266f6c: 17ffffd3     	b	0x4266eb8 <_ChromeMain+0x4261c1c>
 4266f70: f85883a0     	ldur	x0, [x29, #-0x78]
 4266f74: f85983a8     	ldur	x8, [x29, #-0x68]
 4266f78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4266f7c: 96f687cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4266f80: 17ffffef     	b	0x4266f3c <_ChromeMain+0x4261ca0>
 4266f84: 910283e8     	add	x8, sp, #0xa0
 4266f88: 6f00e400     	movi.2d	v0, #0000000000000000
 4266f8c: ad000100     	stp	q0, q0, [x8]
 4266f90: 389873a8     	ldursb	x8, [x29, #-0x79]
 4266f94: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 4266f98: f100011f     	cmp	x8, #0x0
 4266f9c: 9a964120     	csel	x0, x9, x22, mi
 4266fa0: 7100011f     	cmp	w8, #0x0
 4266fa4: 9a884141     	csel	x1, x10, x8, mi
 4266fa8: 910283e8     	add	x8, sp, #0xa0
 4266fac: 52800002     	mov	w2, #0x0                ; =0
 4266fb0: 52801903     	mov	w3, #0xc8               ; =200
 4266fb4: 97656be2     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4266fb8: 3942e3e8     	ldrb	w8, [sp, #0xb8]
 4266fbc: 370001e8     	tbnz	w8, #0x0, 0x4266ff8 <_ChromeMain+0x4261d5c>
 4266fc0: aa1403e8     	mov	x8, x20
 4266fc4: aa1503e0     	mov	x0, x21
 4266fc8: 52800001     	mov	w1, #0x0                ; =0
 4266fcc: 9400014f     	bl	0x4267508 <_ChromeMain+0x426226c>
 4266fd0: 3942e3e8     	ldrb	w8, [sp, #0xb8]
 4266fd4: 34fff9e8     	cbz	w8, 0x4266f10 <_ChromeMain+0x4261c74>
 4266fd8: 910283e0     	add	x0, sp, #0xa0
 4266fdc: 971bdd29     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4266fe0: 17ffffcc     	b	0x4266f10 <_ChromeMain+0x4261c74>
 4266fe4: aa1403e8     	mov	x8, x20
 4266fe8: aa1503e0     	mov	x0, x21
 4266fec: 52800001     	mov	w1, #0x0                ; =0
 4266ff0: 94000146     	bl	0x4267508 <_ChromeMain+0x426226c>
 4266ff4: 17fffff7     	b	0x4266fd0 <_ChromeMain+0x4261d34>
 4266ff8: b004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4266ffc: 913bc421     	add	x1, x1, #0xef1
 4267000: 910283e0     	add	x0, sp, #0xa0
 4267004: 52800242     	mov	w2, #0x12               ; =18
 4267008: 97080f4e     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 426700c: b4fffec0     	cbz	x0, 0x4266fe4 <_ChromeMain+0x4261d48>
 4267010: aa0003f6     	mov	x22, x0
 4267014: 39406008     	ldrb	w8, [x0, #0x18]
 4267018: 7100191f     	cmp	w8, #0x6
 426701c: 54fffe41     	b.ne	0x4266fe4 <_ChromeMain+0x4261d48>
 4267020: 6f00e400     	movi.2d	v0, #0000000000000000
 4267024: ad0403e0     	stp	q0, q0, [sp, #0x80]
 4267028: 9101a3e8     	add	x8, sp, #0x68
 426702c: 91002108     	add	x8, x8, #0x8
 4267030: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4267034: f9000be8     	str	x8, [sp, #0x10]
 4267038: f90037e8     	str	x8, [sp, #0x68]
 426703c: 3942e3e8     	ldrb	w8, [sp, #0xb8]
 4267040: 36001be8     	tbz	w8, #0x0, 0x42673bc <_ChromeMain+0x4262120>
 4267044: 9004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4267048: 913c1021     	add	x1, x1, #0xf04
 426704c: 910283e0     	add	x0, sp, #0xa0
 4267050: 528002c2     	mov	w2, #0x16               ; =22
 4267054: 97080f3b     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 4267058: b40001e0     	cbz	x0, 0x4267094 <_ChromeMain+0x4261df8>
 426705c: 39406008     	ldrb	w8, [x0, #0x18]
 4267060: 71001d1f     	cmp	w8, #0x7
 4267064: 54000181     	b.ne	0x4267094 <_ChromeMain+0x4261df8>
 4267068: a9402017     	ldp	x23, x8, [x0]
 426706c: 8b0816e9     	add	x9, x23, x8, lsl #5
 4267070: eb0902ff     	cmp	x23, x9
 4267074: 54002448     	b.hi	0x42674fc <_ChromeMain+0x4262260>
 4267078: d37be91b     	lsl	x27, x8, #5
 426707c: b40000db     	cbz	x27, 0x4267094 <_ChromeMain+0x4261df8>
 4267080: 910063fc     	add	x28, sp, #0x18
 4267084: 52800a19     	mov	w25, #0x50              ; =80
 4267088: b202e7fa     	mov	x26, #-0x3333333333333334 ; =-3689348814741910324
 426708c: f29999ba     	movk	x26, #0xcccd
 4267090: 14000087     	b	0x42672ac <_ChromeMain+0x4262010>
 4267094: f90007f4     	str	x20, [sp, #0x8]
 4267098: f94006c8     	ldr	x8, [x22, #0x8]
 426709c: d37be909     	lsl	x9, x8, #5
 42670a0: b40000a9     	cbz	x9, 0x42670b4 <_ChromeMain+0x4261e18>
 42670a4: f94002d6     	ldr	x22, [x22]
 42670a8: 8b0816db     	add	x27, x22, x8, lsl #5
 42670ac: 910063fc     	add	x28, sp, #0x18
 42670b0: 14000072     	b	0x4267278 <_ChromeMain+0x4261fdc>
 42670b4: f94047e8     	ldr	x8, [sp, #0x88]
 42670b8: b4000308     	cbz	x8, 0x4267118 <_ChromeMain+0x4261e7c>
 42670bc: d2800015     	mov	x21, #0x0               ; =0
 42670c0: f94043e9     	ldr	x9, [sp, #0x80]
 42670c4: f9404bea     	ldr	x10, [sp, #0x90]
 42670c8: f94007eb     	ldr	x11, [sp, #0x8]
 42670cc: a9002169     	stp	x9, x8, [x11]
 42670d0: f90043ff     	str	xzr, [sp, #0x80]
 42670d4: f9004bff     	str	xzr, [sp, #0x90]
 42670d8: f900096a     	str	x10, [x11, #0x10]
 42670dc: 394263e8     	ldrb	w8, [sp, #0x98]
 42670e0: 39006168     	strb	w8, [x11, #0x18]
 42670e4: f9403be1     	ldr	x1, [sp, #0x70]
 42670e8: 9101a3e8     	add	x8, sp, #0x68
 42670ec: f9000fe8     	str	x8, [sp, #0x18]
 42670f0: 910063e0     	add	x0, sp, #0x18
 42670f4: 9712e66e     	bl	0x720aac <_ChromeMain+0x71b810>
 42670f8: b4fff6d5     	cbz	x21, 0x4266fd0 <_ChromeMain+0x4261d34>
 42670fc: f9404be8     	ldr	x8, [sp, #0x90]
 4267100: f90047ff     	str	xzr, [sp, #0x88]
 4267104: 8b080908     	add	x8, x8, x8, lsl #2
 4267108: d37ced01     	lsl	x1, x8, #4
 426710c: aa1503e0     	mov	x0, x21
 4267110: 96f6876a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267114: 17ffffaf     	b	0x4266fd0 <_ChromeMain+0x4261d34>
 4267118: 394263e1     	ldrb	w1, [sp, #0x98]
 426711c: f94007e8     	ldr	x8, [sp, #0x8]
 4267120: aa1503e0     	mov	x0, x21
 4267124: 940000f9     	bl	0x4267508 <_ChromeMain+0x426226c>
 4267128: f94043f5     	ldr	x21, [sp, #0x80]
 426712c: 17ffffee     	b	0x42670e4 <_ChromeMain+0x4261e48>
 4267130: 54000223     	b.lo	0x4267174 <_ChromeMain+0x4261ed8>
 4267134: f940075a     	ldr	x26, [x26, #0x8]
 4267138: b40002fa     	cbz	x26, 0x4267194 <_ChromeMain+0x4261ef8>
 426713c: aa1a03e8     	mov	x8, x26
 4267140: f8420d09     	ldr	x9, [x8, #0x20]!
 4267144: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4267148: f100015f     	cmp	x10, #0x0
 426714c: 9a884121     	csel	x1, x9, x8, mi
 4267150: f9400508     	ldr	x8, [x8, #0x8]
 4267154: 7100015f     	cmp	w10, #0x0
 4267158: 9a8a4114     	csel	x20, x8, x10, mi
 426715c: eb19029f     	cmp	x20, x25
 4267160: 9a993282     	csel	x2, x20, x25, lo
 4267164: aa1803e0     	mov	x0, x24
 4267168: 94f689be     	bl	0x8009860 <_ChromeMain+0x80045c4>
 426716c: 340000a0     	cbz	w0, 0x4267180 <_ChromeMain+0x4261ee4>
 4267170: 36fffe20     	tbz	w0, #0x1f, 0x4267134 <_ChromeMain+0x4261e98>
 4267174: f940035a     	ldr	x26, [x26]
 4267178: b5fffe3a     	cbnz	x26, 0x426713c <_ChromeMain+0x4261ea0>
 426717c: 14000006     	b	0x4267194 <_ChromeMain+0x4261ef8>
 4267180: eb14033f     	cmp	x25, x20
 4267184: 54fffd61     	b.ne	0x4267130 <_ChromeMain+0x4261e94>
 4267188: f9400be8     	ldr	x8, [sp, #0x10]
 426718c: eb08035f     	cmp	x26, x8
 4267190: 540006e1     	b.ne	0x426726c <_ChromeMain+0x4261fd0>
 4267194: 394062e8     	ldrb	w8, [x23, #0x18]
 4267198: 7100191f     	cmp	w8, #0x6
 426719c: 54000681     	b.ne	0x426726c <_ChromeMain+0x4261fd0>
 42671a0: 910203e8     	add	x8, sp, #0x80
 42671a4: 91006102     	add	x2, x8, #0x18
 42671a8: aa1503e0     	mov	x0, x21
 42671ac: aa1603e1     	mov	x1, x22
 42671b0: 940001e3     	bl	0x426793c <_ChromeMain+0x42626a0>
 42671b4: 360005c0     	tbz	w0, #0x0, 0x426726c <_ChromeMain+0x4261fd0>
 42671b8: 394062e8     	ldrb	w8, [x23, #0x18]
 42671bc: 7100191f     	cmp	w8, #0x6
 42671c0: 540018e1     	b.ne	0x42674dc <_ChromeMain+0x4262240>
 42671c4: 910063e8     	add	x8, sp, #0x18
 42671c8: aa1503e0     	mov	x0, x21
 42671cc: aa1603e1     	mov	x1, x22
 42671d0: aa1703e2     	mov	x2, x23
 42671d4: 9400022d     	bl	0x4267a88 <_ChromeMain+0x42627ec>
 42671d8: a948a3e9     	ldp	x9, x8, [sp, #0x88]
 42671dc: eb08013f     	cmp	x9, x8
 42671e0: 54000f00     	b.eq	0x42673c0 <_ChromeMain+0x4262124>
 42671e4: f94043e8     	ldr	x8, [sp, #0x80]
 42671e8: 52800a0a     	mov	w10, #0x50              ; =80
 42671ec: 9b0a2129     	madd	x9, x9, x10, x8
 42671f0: b4000e69     	cbz	x9, 0x42673bc <_ChromeMain+0x4262120>
 42671f4: b9401bea     	ldr	w10, [sp, #0x18]
 42671f8: b900012a     	str	w10, [x9]
 42671fc: 3cc08380     	ldur	q0, [x28, #0x8]
 4267200: f841838a     	ldur	x10, [x28, #0x18]
 4267204: f9000d2a     	str	x10, [x9, #0x18]
 4267208: 3c808120     	stur	q0, [x9, #0x8]
 426720c: a9017f9f     	stp	xzr, xzr, [x28, #0x10]
 4267210: f800839f     	stur	xzr, [x28, #0x8]
 4267214: 3cc20380     	ldur	q0, [x28, #0x20]
 4267218: f843038a     	ldur	x10, [x28, #0x30]
 426721c: f900192a     	str	x10, [x9, #0x30]
 4267220: 3d800920     	str	q0, [x9, #0x20]
 4267224: a902ff9f     	stp	xzr, xzr, [x28, #0x28]
 4267228: f802039f     	stur	xzr, [x28, #0x20]
 426722c: 3cc38380     	ldur	q0, [x28, #0x38]
 4267230: f844838a     	ldur	x10, [x28, #0x48]
 4267234: f900252a     	str	x10, [x9, #0x48]
 4267238: 3c838120     	stur	q0, [x9, #0x38]
 426723c: a9047f9f     	stp	xzr, xzr, [x28, #0x40]
 4267240: f803839f     	stur	xzr, [x28, #0x38]
 4267244: 91014120     	add	x0, x9, #0x50
 4267248: eb080008     	subs	x8, x0, x8
 426724c: 9344fd08     	asr	x8, x8, #4
 4267250: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4267254: f29999a9     	movk	x9, #0xcccd
 4267258: 9b097d08     	mul	x8, x8, x9
 426725c: f90047e8     	str	x8, [sp, #0x88]
 4267260: 54000ae0     	b.eq	0x42673bc <_ChromeMain+0x4262120>
 4267264: 910063e0     	add	x0, sp, #0x18
 4267268: 97ff9b7b     	bl	0x424e054 <_ChromeMain+0x4248db8>
 426726c: 910082d6     	add	x22, x22, #0x20
 4267270: eb1b02df     	cmp	x22, x27
 4267274: 54fff200     	b.eq	0x42670b4 <_ChromeMain+0x4261e18>
 4267278: f9400ed7     	ldr	x23, [x22, #0x18]
 426727c: f9403bfa     	ldr	x26, [sp, #0x70]
 4267280: b4fff8ba     	cbz	x26, 0x4267194 <_ChromeMain+0x4261ef8>
 4267284: 39805ec8     	ldrsb	x8, [x22, #0x17]
 4267288: a9402ac9     	ldp	x9, x10, [x22]
 426728c: f100011f     	cmp	x8, #0x0
 4267290: 9a964138     	csel	x24, x9, x22, mi
 4267294: 7100011f     	cmp	w8, #0x0
 4267298: 9a884159     	csel	x25, x10, x8, mi
 426729c: 17ffffa8     	b	0x426713c <_ChromeMain+0x4261ea0>
 42672a0: 910082f7     	add	x23, x23, #0x20
 42672a4: f100837b     	subs	x27, x27, #0x20
 42672a8: 54ffef60     	b.eq	0x4267094 <_ChromeMain+0x4261df8>
 42672ac: 394062e8     	ldrb	w8, [x23, #0x18]
 42672b0: 7100111f     	cmp	w8, #0x4
 42672b4: 54ffff61     	b.ne	0x42672a0 <_ChromeMain+0x4262004>
 42672b8: 39805ee8     	ldrsb	x8, [x23, #0x17]
 42672bc: a9402ae9     	ldp	x9, x10, [x23]
 42672c0: f100011f     	cmp	x8, #0x0
 42672c4: 9a974121     	csel	x1, x9, x23, mi
 42672c8: 7100011f     	cmp	w8, #0x0
 42672cc: 9a884142     	csel	x2, x10, x8, mi
 42672d0: aa1603e0     	mov	x0, x22
 42672d4: 971bdd5b     	bl	0x95e840 <_ChromeMain+0x9595a4>
 42672d8: aa0003f8     	mov	x24, x0
 42672dc: b4fffe20     	cbz	x0, 0x42672a0 <_ChromeMain+0x4262004>
 42672e0: 910203e8     	add	x8, sp, #0x80
 42672e4: 91006102     	add	x2, x8, #0x18
 42672e8: aa1503e0     	mov	x0, x21
 42672ec: aa1703e1     	mov	x1, x23
 42672f0: 94000193     	bl	0x426793c <_ChromeMain+0x42626a0>
 42672f4: 3607fd60     	tbz	w0, #0x0, 0x42672a0 <_ChromeMain+0x4262004>
 42672f8: 910063e8     	add	x8, sp, #0x18
 42672fc: aa1503e0     	mov	x0, x21
 4267300: aa1703e1     	mov	x1, x23
 4267304: aa1803e2     	mov	x2, x24
 4267308: 940001e0     	bl	0x4267a88 <_ChromeMain+0x42627ec>
 426730c: a948a3e9     	ldp	x9, x8, [sp, #0x88]
 4267310: eb08013f     	cmp	x9, x8
 4267314: 54000600     	b.eq	0x42673d4 <_ChromeMain+0x4262138>
 4267318: f94043e8     	ldr	x8, [sp, #0x80]
 426731c: 9b192129     	madd	x9, x9, x25, x8
 4267320: b40004e9     	cbz	x9, 0x42673bc <_ChromeMain+0x4262120>
 4267324: b9401bea     	ldr	w10, [sp, #0x18]
 4267328: b900012a     	str	w10, [x9]
 426732c: 3cc08380     	ldur	q0, [x28, #0x8]
 4267330: f841838a     	ldur	x10, [x28, #0x18]
 4267334: f9000d2a     	str	x10, [x9, #0x18]
 4267338: 3c808120     	stur	q0, [x9, #0x8]
 426733c: a9017f9f     	stp	xzr, xzr, [x28, #0x10]
 4267340: f800839f     	stur	xzr, [x28, #0x8]
 4267344: 3cc20380     	ldur	q0, [x28, #0x20]
 4267348: f843038a     	ldur	x10, [x28, #0x30]
 426734c: f900192a     	str	x10, [x9, #0x30]
 4267350: 3d800920     	str	q0, [x9, #0x20]
 4267354: a902ff9f     	stp	xzr, xzr, [x28, #0x28]
 4267358: f802039f     	stur	xzr, [x28, #0x20]
 426735c: 3cc38380     	ldur	q0, [x28, #0x38]
 4267360: f844838a     	ldur	x10, [x28, #0x48]
 4267364: f900252a     	str	x10, [x9, #0x48]
 4267368: 3c838120     	stur	q0, [x9, #0x38]
 426736c: a9047f9f     	stp	xzr, xzr, [x28, #0x40]
 4267370: f803839f     	stur	xzr, [x28, #0x38]
 4267374: 91014120     	add	x0, x9, #0x50
 4267378: eb080008     	subs	x8, x0, x8
 426737c: 9344fd08     	asr	x8, x8, #4
 4267380: 9b1a7d08     	mul	x8, x8, x26
 4267384: f90047e8     	str	x8, [sp, #0x88]
 4267388: 540001a0     	b.eq	0x42673bc <_ChromeMain+0x4262120>
 426738c: 910063e0     	add	x0, sp, #0x18
 4267390: 97ff9b31     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4267394: 9101a3e0     	add	x0, sp, #0x68
 4267398: 9101a3e1     	add	x1, sp, #0x68
 426739c: aa1703e2     	mov	x2, x23
 42673a0: 97329c78     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 42673a4: 17ffffbf     	b	0x42672a0 <_ChromeMain+0x4262004>
 42673a8: 97ff9b2b     	bl	0x424e054 <_ChromeMain+0x4248db8>
 42673ac: d1014000     	sub	x0, x0, #0x50
 42673b0: b10142d6     	adds	x22, x22, #0x50
 42673b4: 540004a0     	b.eq	0x4267448 <_ChromeMain+0x42621ac>
 42673b8: b5ffff80     	cbnz	x0, 0x42673a8 <_ChromeMain+0x426210c>
 42673bc: d4200020     	brk	#0x1
 42673c0: 910203e0     	add	x0, sp, #0x80
 42673c4: 910063e1     	add	x1, sp, #0x18
 42673c8: 94000d8f     	bl	0x426aa04 <_ChromeMain+0x4265768>
 42673cc: f94043e8     	ldr	x8, [sp, #0x80]
 42673d0: 17ffff9e     	b	0x4267248 <_ChromeMain+0x4261fac>
 42673d4: 910203e0     	add	x0, sp, #0x80
 42673d8: 910063e1     	add	x1, sp, #0x18
 42673dc: 94000d8a     	bl	0x426aa04 <_ChromeMain+0x4265768>
 42673e0: f94043e8     	ldr	x8, [sp, #0x80]
 42673e4: 17ffffe5     	b	0x4267378 <_ChromeMain+0x42620dc>
 42673e8: 14000005     	b	0x42673fc <_ChromeMain+0x4262160>
 42673ec: 14000015     	b	0x4267440 <_ChromeMain+0x42621a4>
 42673f0: 14000003     	b	0x42673fc <_ChromeMain+0x4262160>
 42673f4: 14000002     	b	0x42673fc <_ChromeMain+0x4262160>
 42673f8: 14000001     	b	0x42673fc <_ChromeMain+0x4262160>
 42673fc: aa0003f4     	mov	x20, x0
 4267400: f9403be1     	ldr	x1, [sp, #0x70]
 4267404: 9101a3e8     	add	x8, sp, #0x68
 4267408: f9000fe8     	str	x8, [sp, #0x18]
 426740c: 910063e0     	add	x0, sp, #0x18
 4267410: 9712e5a7     	bl	0x720aac <_ChromeMain+0x71b810>
 4267414: f94043f5     	ldr	x21, [sp, #0x80]
 4267418: b4000235     	cbz	x21, 0x426745c <_ChromeMain+0x42621c0>
 426741c: f94047e8     	ldr	x8, [sp, #0x88]
 4267420: 8b080909     	add	x9, x8, x8, lsl #2
 4267424: d37ced29     	lsl	x9, x9, #4
 4267428: b4000109     	cbz	x9, 0x4267448 <_ChromeMain+0x42621ac>
 426742c: 8b150129     	add	x9, x9, x21
 4267430: d1014120     	sub	x0, x9, #0x50
 4267434: 928009e9     	mov	x9, #-0x50              ; =-80
 4267438: 9b097d16     	mul	x22, x8, x9
 426743c: 17ffffdf     	b	0x42673b8 <_ChromeMain+0x426211c>
 4267440: aa0003f4     	mov	x20, x0
 4267444: 14000006     	b	0x426745c <_ChromeMain+0x42621c0>
 4267448: f9404be8     	ldr	x8, [sp, #0x90]
 426744c: 8b080908     	add	x8, x8, x8, lsl #2
 4267450: d37ced01     	lsl	x1, x8, #4
 4267454: aa1503e0     	mov	x0, x21
 4267458: 96f68698     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426745c: 3942e3e8     	ldrb	w8, [sp, #0xb8]
 4267460: 34000108     	cbz	w8, 0x4267480 <_ChromeMain+0x42621e4>
 4267464: 910283e0     	add	x0, sp, #0xa0
 4267468: 971bdc06     	bl	0x95e480 <_ChromeMain+0x9591e4>
 426746c: 14000005     	b	0x4267480 <_ChromeMain+0x42621e4>
 4267470: 14000003     	b	0x426747c <_ChromeMain+0x42621e0>
 4267474: aa0003f4     	mov	x20, x0
 4267478: 14000005     	b	0x426748c <_ChromeMain+0x42621f0>
 426747c: aa0003f4     	mov	x20, x0
 4267480: b4000073     	cbz	x19, 0x426748c <_ChromeMain+0x42621f0>
 4267484: aa1303e0     	mov	x0, x19
 4267488: 94fed754     	bl	0x821d1d8 <_ChromeMain+0x8217f3c>
 426748c: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4267490: 36f800a8     	tbz	w8, #0x1f, 0x42674a4 <_ChromeMain+0x4262208>
 4267494: f85703a0     	ldur	x0, [x29, #-0x90]
 4267498: f85803a8     	ldur	x8, [x29, #-0x80]
 426749c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42674a0: 96f68686     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42674a4: 38d9f3a8     	ldursb	w8, [x29, #-0x61]
 42674a8: 37f80068     	tbnz	w8, #0x1f, 0x42674b4 <_ChromeMain+0x4262218>
 42674ac: aa1403e0     	mov	x0, x20
 42674b0: 94f67015     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 42674b4: f85883a0     	ldur	x0, [x29, #-0x78]
 42674b8: f85983a8     	ldur	x8, [x29, #-0x68]
 42674bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42674c0: 96f6867e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42674c4: 17fffffa     	b	0x42674ac <_ChromeMain+0x4262210>
 42674c8: 14000001     	b	0x42674cc <_ChromeMain+0x4262230>
 42674cc: aa0003f4     	mov	x20, x0
 42674d0: 910063e0     	add	x0, sp, #0x18
 42674d4: 97ff9ae0     	bl	0x424e054 <_ChromeMain+0x4248db8>
 42674d8: 17ffffca     	b	0x4267400 <_ChromeMain+0x4262164>
 42674dc: 7103fd1f     	cmp	w8, #0xff
 42674e0: 54000081     	b.ne	0x42674f0 <_ChromeMain+0x4262254>
 42674e4: b004abe0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 42674e8: 913be000     	add	x0, x0, #0xef8
 42674ec: 9426ff69     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 42674f0: b004abe0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 42674f4: 913c6000     	add	x0, x0, #0xf18
 42674f8: 9426ff66     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 42674fc: d4200000     	brk	#0
 4267500: d4400000     	hlt	#0
 4267504: d4200020     	brk	#0x1
