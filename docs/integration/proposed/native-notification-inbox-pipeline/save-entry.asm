
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f7e38: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 40f7e3c: a90157f6     	stp	x22, x21, [sp, #0x10]
 40f7e40: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40f7e44: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40f7e48: 9100c3fd     	add	x29, sp, #0x30
 40f7e4c: d10cc3ff     	sub	sp, sp, #0x330
 40f7e50: aa0203f4     	mov	x20, x2
 40f7e54: aa0103f5     	mov	x21, x1
 40f7e58: aa0003f3     	mov	x19, x0
 40f7e5c: b004f988     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40f7e60: f940f908     	ldr	x8, [x8, #0x1f0]
 40f7e64: f9400108     	ldr	x8, [x8]
 40f7e68: f81c83a8     	stur	x8, [x29, #-0x38]
 40f7e6c: 3944a008     	ldrb	w8, [x0, #0x128]
 40f7e70: 360005c8     	tbz	w8, #0x0, 0x40f7f28 <_ChromeMain+0x40f2c8c>
 40f7e74: 6f00e400     	movi.2d	v0, #0000000000000000
 40f7e78: ad0283e0     	stp	q0, q0, [sp, #0x50]
 40f7e7c: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 40f7e80: f9006bff     	str	xzr, [sp, #0xd0]
 40f7e84: f90073f5     	str	x21, [sp, #0xe0]
 40f7e88: 528000c8     	mov	w8, #0x6                ; =6
 40f7e8c: 3903c3e8     	strb	w8, [sp, #0xf0]
 40f7e90: 910383e0     	add	x0, sp, #0xe0
 40f7e94: 910303e2     	add	x2, sp, #0xc0
 40f7e98: 52800001     	mov	w1, #0x0                ; =0
 40f7e9c: 52801903     	mov	w3, #0xc8               ; =200
 40f7ea0: 97994a40     	bl	0x274a7a0 <_ChromeMain+0x2745504>
 40f7ea4: 34002c40     	cbz	w0, 0x40f842c <_ChromeMain+0x40f3190>
 40f7ea8: 3dc033e0     	ldr	q0, [sp, #0xc0]
 40f7eac: 3d8017e0     	str	q0, [sp, #0x50]
 40f7eb0: f9406be8     	ldr	x8, [sp, #0xd0]
 40f7eb4: f90033e8     	str	x8, [sp, #0x60]
 40f7eb8: 52800028     	mov	w8, #0x1                ; =1
 40f7ebc: 3901a3e8     	strb	w8, [sp, #0x68]
 40f7ec0: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 40f7ec4: f90027ff     	str	xzr, [sp, #0x48]
 40f7ec8: 6f00e400     	movi.2d	v0, #0000000000000000
 40f7ecc: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 40f7ed0: 910303f6     	add	x22, sp, #0xc0
 40f7ed4: 910303e8     	add	x8, sp, #0xc0
 40f7ed8: 97ff8b7d     	bl	0x40daccc <_ChromeMain+0x40d5a30>
 40f7edc: 394363e8     	ldrb	w8, [sp, #0xd8]
 40f7ee0: 370005e8     	tbnz	w8, #0x0, 0x40f7f9c <_ChromeMain+0x40f2d00>
 40f7ee4: d2800014     	mov	x20, #0x0               ; =0
 40f7ee8: d2800013     	mov	x19, #0x0               ; =0
 40f7eec: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f7ef0: 36f800a8     	tbz	w8, #0x1f, 0x40f7f04 <_ChromeMain+0x40f2c68>
 40f7ef4: f9401fe0     	ldr	x0, [sp, #0x38]
 40f7ef8: f94027e8     	ldr	x8, [sp, #0x48]
 40f7efc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f7f00: 96fc43ee     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f7f04: 3941a3e8     	ldrb	w8, [sp, #0x68]
 40f7f08: 340002e8     	cbz	w8, 0x40f7f64 <_ChromeMain+0x40f2cc8>
 40f7f0c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 40f7f10: 36f802a8     	tbz	w8, #0x1f, 0x40f7f64 <_ChromeMain+0x40f2cc8>
 40f7f14: f9402be0     	ldr	x0, [sp, #0x50]
 40f7f18: f94033e8     	ldr	x8, [sp, #0x60]
 40f7f1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f7f20: 96fc43e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f7f24: 14000010     	b	0x40f7f64 <_ChromeMain+0x40f2cc8>
 40f7f28: 91006260     	add	x0, x19, #0x18
 40f7f2c: aa1303e1     	mov	x1, x19
 40f7f30: 9751a5d5     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 40f7f34: 34000140     	cbz	w0, 0x40f7f5c <_ChromeMain+0x40f2cc0>
 40f7f38: f004cca1     	adrp	x1, 0xda8e000 <dyld_stub_binder+0xda8e000>
 40f7f3c: 913d7c21     	add	x1, x1, #0xf5f
 40f7f40: 91006260     	add	x0, x19, #0x18
 40f7f44: 52801822     	mov	w2, #0xc1               ; =193
 40f7f48: 97668ec0     	bl	0x1a9ba48 <_ChromeMain+0x1a967ac>
 40f7f4c: 34000080     	cbz	w0, 0x40f7f5c <_ChromeMain+0x40f2cc0>
 40f7f50: 52800028     	mov	w8, #0x1                ; =1
 40f7f54: 3904a268     	strb	w8, [x19, #0x128]
 40f7f58: 17ffffc7     	b	0x40f7e74 <_ChromeMain+0x40f2bd8>
 40f7f5c: d2800014     	mov	x20, #0x0               ; =0
 40f7f60: d2800013     	mov	x19, #0x0               ; =0
 40f7f64: f85c83a8     	ldur	x8, [x29, #-0x38]
 40f7f68: b004f989     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 40f7f6c: f940f929     	ldr	x9, [x9, #0x1f0]
 40f7f70: f9400129     	ldr	x9, [x9]
 40f7f74: eb08013f     	cmp	x9, x8
 40f7f78: 54002581     	b.ne	0x40f8428 <_ChromeMain+0x40f318c>
 40f7f7c: aa1303e0     	mov	x0, x19
 40f7f80: aa1403e1     	mov	x1, x20
 40f7f84: 910cc3ff     	add	sp, sp, #0x330
 40f7f88: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40f7f8c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40f7f90: a94157f6     	ldp	x22, x21, [sp, #0x10]
 40f7f94: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 40f7f98: d65f03c0     	ret
 40f7f9c: 39835fe8     	ldrsb	x8, [sp, #0xd7]
 40f7fa0: a94c2be9     	ldp	x9, x10, [sp, #0xc0]
 40f7fa4: f100011f     	cmp	x8, #0x0
 40f7fa8: 9a964120     	csel	x0, x9, x22, mi
 40f7fac: 7100011f     	cmp	w8, #0x0
 40f7fb0: 9a884141     	csel	x1, x10, x8, mi
 40f7fb4: 6f00e400     	movi.2d	v0, #0000000000000000
 40f7fb8: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 40f7fbc: 910383f7     	add	x23, sp, #0xe0
 40f7fc0: 910383e2     	add	x2, sp, #0xe0
 40f7fc4: 97330cb7     	bl	0xdbb2a0 <_ChromeMain+0xdb6004>
 40f7fc8: 52800600     	mov	w0, #0x30               ; =48
 40f7fcc: 96fc5ce7     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f7fd0: 91008008     	add	x8, x0, #0x20
 40f7fd4: eb00011f     	cmp	x8, x0
 40f7fd8: 54002383     	b.lo	0x40f8448 <_ChromeMain+0x40f31ac>
 40f7fdc: aa0003f6     	mov	x22, x0
 40f7fe0: eb0802ff     	cmp	x23, x8
 40f7fe4: fa4032e0     	ccmp	x23, x0, #0x0, lo
 40f7fe8: 54002302     	b.hs	0x40f8448 <_ChromeMain+0x40f31ac>
 40f7fec: ad4707e0     	ldp	q0, q1, [sp, #0xe0]
 40f7ff0: ad0006c0     	stp	q0, q1, [x22]
 40f7ff4: 390082df     	strb	wzr, [x22, #0x20]
 40f7ff8: 910383e0     	add	x0, sp, #0xe0
 40f7ffc: 52804901     	mov	w1, #0x248              ; =584
 40f8000: 94fc4604     	bl	0x8009810 <_ChromeMain+0x8004574>
 40f8004: 910383e0     	add	x0, sp, #0xe0
 40f8008: 9407716c     	bl	0x42d45b8 <_ChromeMain+0x42cf31c>
 40f800c: 52800048     	mov	w8, #0x2                ; =2
 40f8010: b90323e8     	str	w8, [sp, #0x320]
 40f8014: 390c93ff     	strb	wzr, [sp, #0x324]
 40f8018: 910383e0     	add	x0, sp, #0xe0
 40f801c: aa1603e1     	mov	x1, x22
 40f8020: 52800402     	mov	w2, #0x20               ; =32
 40f8024: 952070f2     	bl	0x89143ec <_ChromeMain+0x890f150>
 40f8028: a90affff     	stp	xzr, xzr, [sp, #0xa8]
 40f802c: f9005fff     	str	xzr, [sp, #0xb8]
 40f8030: b94323e0     	ldr	w0, [sp, #0x320]
 40f8034: 95206fd2     	bl	0x8913f7c <_ChromeMain+0x890ece0>
 40f8038: 97fa91ab     	bl	0x3f9c6e4 <_ChromeMain+0x3f97448>
 40f803c: 9102a3f7     	add	x23, sp, #0xa8
 40f8040: 9102a3e8     	add	x8, sp, #0xa8
 40f8044: 97a56fe9     	bl	0x2a53fe8 <_ChromeMain+0x2a4ed4c>
 40f8048: 39419fe8     	ldrb	w8, [sp, #0x67]
 40f804c: 13001d09     	sxtb	w9, w8
 40f8050: a9452fea     	ldp	x10, x11, [sp, #0x50]
 40f8054: 7100013f     	cmp	w9, #0x0
 40f8058: 910143e9     	add	x9, sp, #0x50
 40f805c: 9a894141     	csel	x1, x10, x9, mi
 40f8060: 9a884162     	csel	x2, x11, x8, mi
 40f8064: 3982ffe8     	ldrsb	x8, [sp, #0xbf]
 40f8068: a94aabe9     	ldp	x9, x10, [sp, #0xa8]
 40f806c: f100011f     	cmp	x8, #0x0
 40f8070: 9a974123     	csel	x3, x9, x23, mi
 40f8074: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 40f8078: f90053ff     	str	xzr, [sp, #0xa0]
 40f807c: 7100011f     	cmp	w8, #0x0
 40f8080: 9a884144     	csel	x4, x10, x8, mi
 40f8084: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 40f8088: f90047ff     	str	xzr, [sp, #0x88]
 40f808c: 910383e0     	add	x0, sp, #0xe0
 40f8090: 9101e3e5     	add	x5, sp, #0x78
 40f8094: 910243e7     	add	x7, sp, #0x90
 40f8098: d2800006     	mov	x6, #0x0                ; =0
 40f809c: 9407a1c5     	bl	0x42e07b0 <_ChromeMain+0x42db514>
 40f80a0: aa0003f7     	mov	x23, x0
 40f80a4: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 40f80a8: 36f800a8     	tbz	w8, #0x1f, 0x40f80bc <_ChromeMain+0x40f2e20>
 40f80ac: f9403fe0     	ldr	x0, [sp, #0x78]
 40f80b0: f94047e8     	ldr	x8, [sp, #0x88]
 40f80b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f80b8: 96fc4380     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f80bc: 340003d7     	cbz	w23, 0x40f8134 <_ChromeMain+0x40f2e98>
 40f80c0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f80c4: 37f806e8     	tbnz	w8, #0x1f, 0x40f81a0 <_ChromeMain+0x40f2f04>
 40f80c8: 52800108     	mov	w8, #0x8                ; =8
 40f80cc: 39013fe8     	strb	w8, [sp, #0x4f]
 40f80d0: 9100e3e8     	add	x8, sp, #0x38
 40f80d4: d28a6829     	mov	x9, #0x5341             ; =21313
 40f80d8: f2a88929     	movk	x9, #0x4449, lsl #16
 40f80dc: f2c828a9     	movk	x9, #0x4145, lsl #32
 40f80e0: f2e62929     	movk	x9, #0x3149, lsl #48
 40f80e4: f9000109     	str	x9, [x8]
 40f80e8: 3900211f     	strb	wzr, [x8, #0x8]
 40f80ec: 3982ffe8     	ldrsb	x8, [sp, #0xbf]
 40f80f0: 9102a3e9     	add	x9, sp, #0xa8
 40f80f4: a94aafea     	ldp	x10, x11, [sp, #0xa8]
 40f80f8: f100011f     	cmp	x8, #0x0
 40f80fc: 9a894141     	csel	x1, x10, x9, mi
 40f8100: 7100011f     	cmp	w8, #0x0
 40f8104: 9a884162     	csel	x2, x11, x8, mi
 40f8108: 9100e3e0     	add	x0, sp, #0x38
 40f810c: 96fe88c5     	bl	0x9a420 <_ChromeMain+0x95184>
 40f8110: 39829fe8     	ldrsb	x8, [sp, #0xa7]
 40f8114: 910243e9     	add	x9, sp, #0x90
 40f8118: a9492fea     	ldp	x10, x11, [sp, #0x90]
 40f811c: f100011f     	cmp	x8, #0x0
 40f8120: 9a894141     	csel	x1, x10, x9, mi
 40f8124: 7100011f     	cmp	w8, #0x0
 40f8128: 9a884162     	csel	x2, x11, x8, mi
 40f812c: 9100e3e0     	add	x0, sp, #0x38
 40f8130: 96fe88bc     	bl	0x9a420 <_ChromeMain+0x95184>
 40f8134: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 40f8138: 36f800a8     	tbz	w8, #0x1f, 0x40f814c <_ChromeMain+0x40f2eb0>
 40f813c: f9404be0     	ldr	x0, [sp, #0x90]
 40f8140: f94053e8     	ldr	x8, [sp, #0xa0]
 40f8144: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8148: 96fc435c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f814c: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 40f8150: 36f800a8     	tbz	w8, #0x1f, 0x40f8164 <_ChromeMain+0x40f2ec8>
 40f8154: f94057e0     	ldr	x0, [sp, #0xa8]
 40f8158: f9405fe8     	ldr	x8, [sp, #0xb8]
 40f815c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8160: 96fc4356     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8164: 910383e0     	add	x0, sp, #0xe0
 40f8168: 97e5758a     	bl	0x3a55790 <_ChromeMain+0x3a504f4>
 40f816c: aa1603e0     	mov	x0, x22
 40f8170: 52800601     	mov	w1, #0x30               ; =48
 40f8174: 96fc4351     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8178: 394363e8     	ldrb	w8, [sp, #0xd8]
 40f817c: 340001a8     	cbz	w8, 0x40f81b0 <_ChromeMain+0x40f2f14>
 40f8180: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 40f8184: 36f80168     	tbz	w8, #0x1f, 0x40f81b0 <_ChromeMain+0x40f2f14>
 40f8188: f94063e0     	ldr	x0, [sp, #0xc0]
 40f818c: f9406be8     	ldr	x8, [sp, #0xd0]
 40f8190: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8194: 96fc4349     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8198: 3607ea77     	tbz	w23, #0x0, 0x40f7ee4 <_ChromeMain+0x40f2c48>
 40f819c: 14000006     	b	0x40f81b4 <_ChromeMain+0x40f2f18>
 40f81a0: 52800108     	mov	w8, #0x8                ; =8
 40f81a4: f90023e8     	str	x8, [sp, #0x40]
 40f81a8: f9401fe8     	ldr	x8, [sp, #0x38]
 40f81ac: 17ffffca     	b	0x40f80d4 <_ChromeMain+0x40f2e38>
 40f81b0: 34ffe9b7     	cbz	w23, 0x40f7ee4 <_ChromeMain+0x40f2c48>
 40f81b4: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 40f81b8: f004cca8     	adrp	x8, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f81bc: 91008508     	add	x8, x8, #0x21
 40f81c0: f9007fff     	str	xzr, [sp, #0xf8]
 40f81c4: 52800909     	mov	w9, #0x48               ; =72
 40f81c8: a90227e8     	stp	x8, x9, [sp, #0x20]
 40f81cc: 52801a88     	mov	w8, #0xd4               ; =212
 40f81d0: b90033e8     	str	w8, [sp, #0x30]
 40f81d4: f004cca2     	adrp	x2, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f81d8: 9101a842     	add	x2, x2, #0x6a
 40f81dc: 91006260     	add	x0, x19, #0x18
 40f81e0: 910083e1     	add	x1, sp, #0x20
 40f81e4: 52800cc3     	mov	w3, #0x66               ; =102
 40f81e8: 97281552     	bl	0xafd730 <_ChromeMain+0xaf8494>
 40f81ec: f90073e0     	str	x0, [sp, #0xe0]
 40f81f0: 3903a3ff     	strb	wzr, [sp, #0xe8]
 40f81f4: 3903b3ff     	strb	wzr, [sp, #0xec]
 40f81f8: 3903c3ff     	strb	wzr, [sp, #0xf0]
 40f81fc: 3903e3ff     	strb	wzr, [sp, #0xf8]
 40f8200: f9401408     	ldr	x8, [x0, #0x28]
 40f8204: b4000dc8     	cbz	x8, 0x40f83bc <_ChromeMain+0x40f3120>
 40f8208: b00555c8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 40f820c: f9468508     	ldr	x8, [x8, #0xd08]
 40f8210: f0000ea9     	adrp	x9, 0x42cf000 <_ChromeMain+0x42c9d64>
 40f8214: 9138c129     	add	x9, x9, #0xe30
 40f8218: eb09011f     	cmp	x8, x9
 40f821c: 54001001     	b.ne	0x40f841c <_ChromeMain+0x40f3180>
 40f8220: 94fce5dc     	bl	0x8031990 <_ChromeMain+0x802c6f4>
 40f8224: 1e602008     	fcmp	d0, #0.0
 40f8228: 54001120     	b.eq	0x40f844c <_ChromeMain+0x40f31b0>
 40f822c: 92f00002     	mov	x2, #0x7fffffffffffffff ; =9223372036854775807
 40f8230: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 40f8234: 9e670101     	fmov	d1, x8
 40f8238: 1e612000     	fcmp	d0, d1
 40f823c: 540003a0     	b.eq	0x40f82b0 <_ChromeMain+0x40f3014>
 40f8240: 9004f988     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 40f8244: f9444908     	ldr	x8, [x8, #0x890]
 40f8248: fd400101     	ldr	d1, [x8]
 40f824c: 1e612800     	fadd	d0, d0, d1
 40f8250: f004f288     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 40f8254: fd45ad01     	ldr	d1, [x8, #0xb58]
 40f8258: 1e610800     	fmul	d0, d0, d1
 40f825c: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 40f8260: 9e670101     	fmov	d1, x8
 40f8264: 1e612000     	fcmp	d0, d1
 40f8268: 9a82b3e8     	csel	x8, xzr, x2, lt
 40f826c: 1e616801     	fmaxnm	d1, d0, d1
 40f8270: 9e780029     	fcvtzs	x9, d1
 40f8274: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 40f8278: 9e670141     	fmov	d1, x10
 40f827c: 1e612000     	fcmp	d0, d1
 40f8280: 9a889122     	csel	x2, x9, x8, ls
 40f8284: b24107e8     	mov	x8, #-0x7fffffffffffffff ; =-9223372036854775807
 40f8288: 8b080048     	add	x8, x2, x8
 40f828c: f100091f     	cmp	x8, #0x2
 40f8290: 54000103     	b.lo	0x40f82b0 <_ChromeMain+0x40f3014>
 40f8294: d2880008     	mov	x8, #0x4000             ; =16384
 40f8298: f2a910c8     	movk	x8, #0x4886, lsl #16
 40f829c: f2cbd2c8     	movk	x8, #0x5e96, lsl #32
 40f82a0: f2e00528     	movk	x8, #0x29, lsl #48
 40f82a4: ab080048     	adds	x8, x2, x8
 40f82a8: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 40f82ac: 9a886122     	csel	x2, x9, x8, vs
 40f82b0: 910383e0     	add	x0, sp, #0xe0
 40f82b4: 52800001     	mov	w1, #0x0                ; =0
 40f82b8: 974e5360     	bl	0x148d038 <_ChromeMain+0x1487d9c>
 40f82bc: 9004c581     	adrp	x1, 0xd9a8000 <dyld_stub_binder+0xd9a8000>
 40f82c0: 91025421     	add	x1, x1, #0x95
 40f82c4: aa1503e0     	mov	x0, x21
 40f82c8: 52800102     	mov	w2, #0x8                ; =8
 40f82cc: 977cc5ed     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 40f82d0: b4000220     	cbz	x0, 0x40f8314 <_ChromeMain+0x40f3078>
 40f82d4: 9004c581     	adrp	x1, 0xd9a8000 <dyld_stub_binder+0xd9a8000>
 40f82d8: 91025421     	add	x1, x1, #0x95
 40f82dc: aa1503e0     	mov	x0, x21
 40f82e0: 52800102     	mov	w2, #0x8                ; =8
 40f82e4: 977cc5e7     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 40f82e8: 39c05c08     	ldrsb	w8, [x0, #0x17]
 40f82ec: 37f800c8     	tbnz	w8, #0x1f, 0x40f8304 <_ChromeMain+0x40f3068>
 40f82f0: 3dc00000     	ldr	q0, [x0]
 40f82f4: f9400808     	ldr	x8, [x0, #0x10]
 40f82f8: f9006be8     	str	x8, [sp, #0xd0]
 40f82fc: 3d8033e0     	str	q0, [sp, #0xc0]
 40f8300: 14000007     	b	0x40f831c <_ChromeMain+0x40f3080>
 40f8304: a9400801     	ldp	x1, x2, [x0]
 40f8308: 910303e0     	add	x0, sp, #0xc0
 40f830c: 96fc7fc3     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f8310: 14000003     	b	0x40f831c <_ChromeMain+0x40f3080>
 40f8314: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 40f8318: f9006bff     	str	xzr, [sp, #0xd0]
 40f831c: 39835fe8     	ldrsb	x8, [sp, #0xd7]
 40f8320: 910303e9     	add	x9, sp, #0xc0
 40f8324: a94c2fea     	ldp	x10, x11, [sp, #0xc0]
 40f8328: f100011f     	cmp	x8, #0x0
 40f832c: 9a894142     	csel	x2, x10, x9, mi
 40f8330: 7100011f     	cmp	w8, #0x0
 40f8334: 9a884163     	csel	x3, x11, x8, mi
 40f8338: 910383e0     	add	x0, sp, #0xe0
 40f833c: 52800021     	mov	w1, #0x1                ; =1
 40f8340: 9748c298     	bl	0x1328da0 <_ChromeMain+0x1323b04>
 40f8344: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 40f8348: 36f800a8     	tbz	w8, #0x1f, 0x40f835c <_ChromeMain+0x40f30c0>
 40f834c: f94063e0     	ldr	x0, [sp, #0xc0]
 40f8350: f9406be8     	ldr	x8, [sp, #0xd0]
 40f8354: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8358: 96fc42d8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f835c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f8360: 37f80388     	tbnz	w8, #0x1f, 0x40f83d0 <_ChromeMain+0x40f3134>
 40f8364: 3cc383e0     	ldur	q0, [sp, #0x38]
 40f8368: 3d8003e0     	str	q0, [sp]
 40f836c: f94027e8     	ldr	x8, [sp, #0x48]
 40f8370: f9000be8     	str	x8, [sp, #0x10]
 40f8374: 910383e0     	add	x0, sp, #0xe0
 40f8378: 910003e2     	mov	x2, sp
 40f837c: 52800041     	mov	w1, #0x2                ; =2
 40f8380: 97c31db0     	bl	0x31bfa40 <_ChromeMain+0x31ba7a4>
 40f8384: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40f8388: 36f800a8     	tbz	w8, #0x1f, 0x40f839c <_ChromeMain+0x40f3100>
 40f838c: f94003e0     	ldr	x0, [sp]
 40f8390: f9400be8     	ldr	x8, [sp, #0x10]
 40f8394: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8398: 96fc42c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f839c: 910383e0     	add	x0, sp, #0xe0
 40f83a0: 52800061     	mov	w1, #0x3                ; =3
 40f83a4: aa1403e2     	mov	x2, x20
 40f83a8: 9748bee5     	bl	0x1327f3c <_ChromeMain+0x1322ca0>
 40f83ac: 910383e0     	add	x0, sp, #0xe0
 40f83b0: 971e60c4     	bl	0x8906c0 <_ChromeMain+0x88b424>
 40f83b4: 7101941f     	cmp	w0, #0x65
 40f83b8: 54000140     	b.eq	0x40f83e0 <_ChromeMain+0x40f3144>
 40f83bc: d2800014     	mov	x20, #0x0               ; =0
 40f83c0: d2800013     	mov	x19, #0x0               ; =0
 40f83c4: 910383e0     	add	x0, sp, #0xe0
 40f83c8: 972811df     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 40f83cc: 17fffec8     	b	0x40f7eec <_ChromeMain+0x40f2c50>
 40f83d0: a9438be1     	ldp	x1, x2, [sp, #0x38]
 40f83d4: 910003e0     	mov	x0, sp
 40f83d8: 96fc7f90     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f83dc: 17ffffe6     	b	0x40f8374 <_ChromeMain+0x40f30d8>
 40f83e0: f8418273     	ldur	x19, [x19, #0x18]
 40f83e4: b4000193     	cbz	x19, 0x40f8414 <_ChromeMain+0x40f3178>
 40f83e8: f9400e60     	ldr	x0, [x19, #0x18]
 40f83ec: b4000340     	cbz	x0, 0x40f8454 <_ChromeMain+0x40f31b8>
 40f83f0: 90055668     	adrp	x8, 0xebc4000 <dyld_stub_binder+0xebc4000>
 40f83f4: f9444508     	ldr	x8, [x8, #0x888]
 40f83f8: d63f0100     	blr	x8
 40f83fc: f9400e60     	ldr	x0, [x19, #0x18]
 40f8400: f9401e73     	ldr	x19, [x19, #0x38]
 40f8404: b4000080     	cbz	x0, 0x40f8414 <_ChromeMain+0x40f3178>
 40f8408: 90055668     	adrp	x8, 0xebc4000 <dyld_stub_binder+0xebc4000>
 40f840c: f9444d08     	ldr	x8, [x8, #0x898]
 40f8410: d63f0100     	blr	x8
 40f8414: 52800034     	mov	w20, #0x1               ; =1
 40f8418: 17ffffeb     	b	0x40f83c4 <_ChromeMain+0x40f3128>
 40f841c: d63f0100     	blr	x8
 40f8420: aa0003e2     	mov	x2, x0
 40f8424: 17ffffa3     	b	0x40f82b0 <_ChromeMain+0x40f3014>
 40f8428: 94fc2fce     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 40f842c: 390143ff     	strb	wzr, [sp, #0x50]
 40f8430: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 40f8434: 3901a3ff     	strb	wzr, [sp, #0x68]
 40f8438: 37f80128     	tbnz	w8, #0x1f, 0x40f845c <_ChromeMain+0x40f31c0>
 40f843c: d2800013     	mov	x19, #0x0               ; =0
 40f8440: d2800014     	mov	x20, #0x0               ; =0
 40f8444: 17fffec8     	b	0x40f7f64 <_ChromeMain+0x40f2cc8>
 40f8448: d4200020     	brk	#0x1
 40f844c: d2800002     	mov	x2, #0x0                ; =0
 40f8450: 17ffff98     	b	0x40f82b0 <_ChromeMain+0x40f3014>
 40f8454: f9401e73     	ldr	x19, [x19, #0x38]
 40f8458: 17ffffef     	b	0x40f8414 <_ChromeMain+0x40f3178>
 40f845c: f94063e0     	ldr	x0, [sp, #0xc0]
 40f8460: f9406be8     	ldr	x8, [sp, #0xd0]
 40f8464: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8468: 96fc4294     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f846c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 40f8470: 35ffd288     	cbnz	w8, 0x40f7ec0 <_ChromeMain+0x40f2c24>
 40f8474: 17fffff2     	b	0x40f843c <_ChromeMain+0x40f31a0>
