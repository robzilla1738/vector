
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4104d10: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4104d14: a90157f6     	stp	x22, x21, [sp, #0x10]
 4104d18: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4104d1c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4104d20: 9100c3fd     	add	x29, sp, #0x30
 4104d24: d10703ff     	sub	sp, sp, #0x1c0
 4104d28: aa0803f4     	mov	x20, x8
 4104d2c: 3940c008     	ldrb	w8, [x0, #0x30]
 4104d30: 36000a68     	tbz	w8, #0x0, 0x4104e7c <_ChromeMain+0x40ffbe0>
 4104d34: aa0003f3     	mov	x19, x0
 4104d38: f9401008     	ldr	x8, [x0, #0x20]
 4104d3c: f100051f     	cmp	x8, #0x1
 4104d40: 540000a1     	b.ne	0x4104d54 <_ChromeMain+0x40ffab8>
 4104d44: f9400e68     	ldr	x8, [x19, #0x18]
 4104d48: 39406109     	ldrb	w9, [x8, #0x18]
 4104d4c: 7100093f     	cmp	w9, #0x2
 4104d50: 54000160     	b.eq	0x4104d7c <_ChromeMain+0x40ffae0>
 4104d54: aa1303e0     	mov	x0, x19
 4104d58: 94adca5d     	bl	0x6c776cc <_ChromeMain+0x6c72430>
 4104d5c: aa1403e8     	mov	x8, x20
 4104d60: aa1303e0     	mov	x0, x19
 4104d64: 910703ff     	add	sp, sp, #0x1c0
 4104d68: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4104d6c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4104d70: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4104d74: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4104d78: 14adc9e7     	b	0x6c77514 <_ChromeMain+0x6c72278>
 4104d7c: 9103e3f6     	add	x22, sp, #0xf8
 4104d80: f9400a69     	ldr	x9, [x19, #0x10]
 4104d84: b4000249     	cbz	x9, 0x4104dcc <_ChromeMain+0x40ffb30>
 4104d88: b9400115     	ldr	w21, [x8]
 4104d8c: f9404937     	ldr	x23, [x9, #0x90]
 4104d90: 9100a2e0     	add	x0, x23, #0x28
 4104d94: 94fc9374     	bl	0x8029b64 <_ChromeMain+0x80248c8>
 4104d98: 35000740     	cbnz	w0, 0x4104e80 <_ChromeMain+0x40ffbe4>
 4104d9c: f94036e8     	ldr	x8, [x23, #0x68]
 4104da0: f9400508     	ldr	x8, [x8, #0x8]
 4104da4: b4000108     	cbz	x8, 0x4104dc4 <_ChromeMain+0x40ffb28>
 4104da8: b9402109     	ldr	w9, [x8, #0x20]
 4104dac: 7101b13f     	cmp	w9, #0x6c
 4104db0: 5400006c     	b.gt	0x4104dbc <_ChromeMain+0x40ffb20>
 4104db4: 540006c0     	b.eq	0x4104e8c <_ChromeMain+0x40ffbf0>
 4104db8: 91002108     	add	x8, x8, #0x8
 4104dbc: f9400108     	ldr	x8, [x8]
 4104dc0: b5ffff48     	cbnz	x8, 0x4104da8 <_ChromeMain+0x40ffb0c>
 4104dc4: 9100a2e0     	add	x0, x23, #0x28
 4104dc8: 94fbfecf     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4104dcc: 52800600     	mov	w0, #0x30               ; =48
 4104dd0: 96fc2966     	bl	0xf368 <_ChromeMain+0xa0cc>
 4104dd4: f81303a0     	stur	x0, [x29, #-0xd0]
 4104dd8: f004f1a8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4104ddc: 3dc31100     	ldr	q0, [x8, #0xc40]
 4104de0: 3c8302c0     	stur	q0, [x22, #0x30]
 4104de4: 9100bc09     	add	x9, x0, #0x2f
 4104de8: eb00013f     	cmp	x9, x0
 4104dec: 54000483     	b.lo	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104df0: d0046f28     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 4104df4: 9124b108     	add	x8, x8, #0x92c
 4104df8: eb08013f     	cmp	x9, x8
 4104dfc: fa488002     	ccmp	x0, x8, #0x2, hi
 4104e00: 540003e9     	b.ls	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104e04: ad400500     	ldp	q0, q1, [x8]
 4104e08: ad000400     	stp	q0, q1, [x0]
 4104e0c: 3cc1f100     	ldur	q0, [x8, #0x1f]
 4104e10: 3c81f000     	stur	q0, [x0, #0x1f]
 4104e14: 3900bc1f     	strb	wzr, [x0, #0x2f]
 4104e18: d102c7a8     	sub	x8, x29, #0xb1
 4104e1c: d10343a1     	sub	x1, x29, #0xd0
 4104e20: aa1303e0     	mov	x0, x19
 4104e24: 94adc94b     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4104e28: d102c7a1     	sub	x1, x29, #0xb1
 4104e2c: aa1403e8     	mov	x8, x20
 4104e30: aa1303e0     	mov	x0, x19
 4104e34: 94adc9c8     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 4104e38: 38d473a8     	ldursb	w8, [x29, #-0xb9]
 4104e3c: 37f800e8     	tbnz	w8, #0x1f, 0x4104e58 <_ChromeMain+0x40ffbbc>
 4104e40: 910703ff     	add	sp, sp, #0x1c0
 4104e44: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4104e48: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4104e4c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4104e50: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4104e54: d65f03c0     	ret
 4104e58: f85303a0     	ldur	x0, [x29, #-0xd0]
 4104e5c: f85403a8     	ldur	x8, [x29, #-0xc0]
 4104e60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4104e64: 910703ff     	add	sp, sp, #0x1c0
 4104e68: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4104e6c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4104e70: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4104e74: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4104e78: 16fc1010     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4104e7c: d4200020     	brk	#0x1
 4104e80: 9100a2e0     	add	x0, x23, #0x28
 4104e84: 970b222b     	bl	0x3cd730 <_ChromeMain+0x3c8494>
 4104e88: 17ffffc5     	b	0x4104d9c <_ChromeMain+0x40ffb00>
 4104e8c: 9100a2e0     	add	x0, x23, #0x28
 4104e90: 94fbfe9d     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4104e94: f81283bf     	stur	xzr, [x29, #-0xd8]
 4104e98: f940ea61     	ldr	x1, [x19, #0x1d0]
 4104e9c: b5000041     	cbnz	x1, 0x4104ea4 <_ChromeMain+0x40ffc08>
 4104ea0: f940e661     	ldr	x1, [x19, #0x1c8]
 4104ea4: 3944e662     	ldrb	w2, [x19, #0x139]
 4104ea8: d10363a4     	sub	x4, x29, #0xd8
 4104eac: aa1503e0     	mov	x0, x21
 4104eb0: d2800003     	mov	x3, #0x0                ; =0
 4104eb4: d2800005     	mov	x5, #0x0                ; =0
 4104eb8: 970db142     	bl	0x4713c0 <_ChromeMain+0x46c124>
 4104ebc: f85283a8     	ldur	x8, [x29, #-0xd8]
 4104ec0: f100011f     	cmp	x8, #0x0
 4104ec4: 1a8003e9     	csel	w9, wzr, w0, eq
 4104ec8: 37000489     	tbnz	w9, #0x0, 0x4104f58 <_ChromeMain+0x40ffcbc>
 4104ecc: 52800600     	mov	w0, #0x30               ; =48
 4104ed0: 96fc2926     	bl	0xf368 <_ChromeMain+0xa0cc>
 4104ed4: f9007fe0     	str	x0, [sp, #0xf8]
 4104ed8: d004f1a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4104edc: 3dc2e500     	ldr	q0, [x8, #0xb90]
 4104ee0: 3c8082c0     	stur	q0, [x22, #0x8]
 4104ee4: 91008c09     	add	x9, x0, #0x23
 4104ee8: eb00013f     	cmp	x9, x0
 4104eec: 54fffc83     	b.lo	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104ef0: d0046f28     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 4104ef4: 91257108     	add	x8, x8, #0x95c
 4104ef8: eb08013f     	cmp	x9, x8
 4104efc: fa488002     	ccmp	x0, x8, #0x2, hi
 4104f00: 54fffbe9     	b.ls	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104f04: 528d2e69     	mov	w9, #0x6973             ; =26995
 4104f08: 72adcde9     	movk	w9, #0x6e6f, lsl #16
 4104f0c: b801f009     	stur	w9, [x0, #0x1f]
 4104f10: ad400500     	ldp	q0, q1, [x8]
 4104f14: ad000400     	stp	q0, q1, [x0]
 4104f18: 39008c1f     	strb	wzr, [x0, #0x23]
 4104f1c: d10367a8     	sub	x8, x29, #0xd9
 4104f20: 9103e3e1     	add	x1, sp, #0xf8
 4104f24: aa1303e0     	mov	x0, x19
 4104f28: 94adc90a     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4104f2c: d10367a1     	sub	x1, x29, #0xd9
 4104f30: aa1403e8     	mov	x8, x20
 4104f34: aa1303e0     	mov	x0, x19
 4104f38: 94adc987     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 4104f3c: 39c43fe8     	ldrsb	w8, [sp, #0x10f]
 4104f40: 36fff808     	tbz	w8, #0x1f, 0x4104e40 <_ChromeMain+0x40ffba4>
 4104f44: f9407fe0     	ldr	x0, [sp, #0xf8]
 4104f48: f94087e8     	ldr	x8, [sp, #0x108]
 4104f4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4104f50: 96fc0fda     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4104f54: 17ffffbb     	b	0x4104e40 <_ChromeMain+0x40ffba4>
 4104f58: 6f00e400     	movi.2d	v0, #0000000000000000
 4104f5c: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4104f60: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4104f64: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4104f68: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4104f6c: b982b509     	ldrsw	x9, [x8, #0x2b4]
 4104f70: 3100053f     	cmn	w9, #0x1
 4104f74: 540018c0     	b.eq	0x410528c <_ChromeMain+0x40ffff0>
 4104f78: f941410a     	ldr	x10, [x8, #0x280]
 4104f7c: eb09015f     	cmp	x10, x9
 4104f80: 54fff7e9     	b.ls	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104f84: f9413d08     	ldr	x8, [x8, #0x278]
 4104f88: f8697908     	ldr	x8, [x8, x9, lsl #3]
 4104f8c: b4001868     	cbz	x8, 0x4105298 <_ChromeMain+0x40ffffc>
 4104f90: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4104f94: b7f81749     	tbnz	x9, #0x3f, 0x410527c <_ChromeMain+0x40fffe0>
 4104f98: b5001769     	cbnz	x9, 0x4105284 <_ChromeMain+0x40fffe8>
 4104f9c: f9400d08     	ldr	x8, [x8, #0x18]
 4104fa0: f9400508     	ldr	x8, [x8, #0x8]
 4104fa4: 91018115     	add	x21, x8, #0x60
 4104fa8: 394062a8     	ldrb	w8, [x21, #0x18]
 4104fac: 34000088     	cbz	w8, 0x4104fbc <_ChromeMain+0x40ffd20>
 4104fb0: aa1503e0     	mov	x0, x21
 4104fb4: 9704d81c     	bl	0x23b024 <_ChromeMain+0x235d88>
 4104fb8: 37000680     	tbnz	w0, #0x0, 0x4105088 <_ChromeMain+0x40ffdec>
 4104fbc: 3901c3ff     	strb	wzr, [sp, #0x70]
 4104fc0: 3903a3ff     	strb	wzr, [sp, #0xe8]
 4104fc4: 52800800     	mov	w0, #0x40               ; =64
 4104fc8: 96fc28e8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4104fcc: f9002be0     	str	x0, [sp, #0x50]
 4104fd0: f004f1a8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4104fd4: 3dc10d00     	ldr	q0, [x8, #0x430]
 4104fd8: 3c8583e0     	stur	q0, [sp, #0x58]
 4104fdc: 9100cc09     	add	x9, x0, #0x33
 4104fe0: eb00013f     	cmp	x9, x0
 4104fe4: 54fff4c3     	b.lo	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104fe8: d0046f28     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 4104fec: 91260108     	add	x8, x8, #0x980
 4104ff0: eb08013f     	cmp	x9, x8
 4104ff4: fa488002     	ccmp	x0, x8, #0x2, hi
 4104ff8: 54fff429     	b.ls	0x4104e7c <_ChromeMain+0x40ffbe0>
 4104ffc: 528d2e69     	mov	w9, #0x6973             ; =26995
 4105000: 72adcde9     	movk	w9, #0x6e6f, lsl #16
 4105004: b802f009     	stur	w9, [x0, #0x2f]
 4105008: ad400500     	ldp	q0, q1, [x8]
 410500c: ad000400     	stp	q0, q1, [x0]
 4105010: 3dc00900     	ldr	q0, [x8, #0x20]
 4105014: 3d800800     	str	q0, [x0, #0x20]
 4105018: 3900cc1f     	strb	wzr, [x0, #0x33]
 410501c: 9101bfe8     	add	x8, sp, #0x6f
 4105020: 910143e1     	add	x1, sp, #0x50
 4105024: aa1303e0     	mov	x0, x19
 4105028: 94adc8ca     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 410502c: 9101bfe1     	add	x1, sp, #0x6f
 4105030: aa1403e8     	mov	x8, x20
 4105034: aa1303e0     	mov	x0, x19
 4105038: 94adc947     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 410503c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4105040: 36f800a8     	tbz	w8, #0x1f, 0x4105054 <_ChromeMain+0x40ffdb8>
 4105044: f9402be0     	ldr	x0, [sp, #0x50]
 4105048: f94033e8     	ldr	x8, [sp, #0x60]
 410504c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4105050: 96fc0f9a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4105054: 3943a3e8     	ldrb	w8, [sp, #0xe8]
 4105058: 34ffef48     	cbz	w8, 0x4104e40 <_ChromeMain+0x40ffba4>
 410505c: 9101c3f3     	add	x19, sp, #0x70
 4105060: 9101c260     	add	x0, x19, #0x70
 4105064: d2800001     	mov	x1, #0x0                ; =0
 4105068: 96fc8b14     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 410506c: 91008260     	add	x0, x19, #0x20
 4105070: 96fc8b02     	bl	0x27c78 <_ChromeMain+0x229dc>
 4105074: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4105078: 36ffee48     	tbz	w8, #0x1f, 0x4104e40 <_ChromeMain+0x40ffba4>
 410507c: f9403be0     	ldr	x0, [sp, #0x70]
 4105080: f94043e8     	ldr	x8, [sp, #0x80]
 4105084: 17ffffb2     	b	0x4104f4c <_ChromeMain+0x40ffcb0>
 4105088: d102c3b7     	sub	x23, x29, #0xb0
 410508c: d102c3a8     	sub	x8, x29, #0xb0
 4105090: aa1503e0     	mov	x0, x21
 4105094: 97286004     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 4105098: 9101c3e0     	add	x0, sp, #0x70
 410509c: d102c3a1     	sub	x1, x29, #0xb0
 41050a0: 97035769     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 41050a4: 52800028     	mov	w8, #0x1                ; =1
 41050a8: 3903a3e8     	strb	w8, [sp, #0xe8]
 41050ac: 9101c2e0     	add	x0, x23, #0x70
 41050b0: d2800001     	mov	x1, #0x0                ; =0
 41050b4: 96fc8b01     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41050b8: 910082e0     	add	x0, x23, #0x20
 41050bc: 96fc8aef     	bl	0x27c78 <_ChromeMain+0x229dc>
 41050c0: 38d673a8     	ldursb	w8, [x29, #-0x99]
 41050c4: 36f800a8     	tbz	w8, #0x1f, 0x41050d8 <_ChromeMain+0x40ffe3c>
 41050c8: f85503a0     	ldur	x0, [x29, #-0xb0]
 41050cc: f85603a8     	ldur	x8, [x29, #-0xa0]
 41050d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41050d4: 96fc0f79     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41050d8: 3943a3e8     	ldrb	w8, [sp, #0xe8]
 41050dc: 3607f748     	tbz	w8, #0x0, 0x4104fc4 <_ChromeMain+0x40ffd28>
 41050e0: f940ea60     	ldr	x0, [x19, #0x1d0]
 41050e4: b5000040     	cbnz	x0, 0x41050ec <_ChromeMain+0x40ffe50>
 41050e8: f940e660     	ldr	x0, [x19, #0x1c8]
 41050ec: f9400008     	ldr	x8, [x0]
 41050f0: f940b508     	ldr	x8, [x8, #0x168]
 41050f4: d63f0100     	blr	x8
 41050f8: aa0003f5     	mov	x21, x0
 41050fc: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4105100: f90027ff     	str	xzr, [sp, #0x48]
 4105104: 90046f21     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 4105108: 9128a021     	add	x1, x1, #0xa28
 410510c: 52800662     	mov	w2, #0x33               ; =51
 4105110: 96fe7c7e     	bl	0xa4308 <_ChromeMain+0x9f06c>
 4105114: 9100e3e8     	add	x8, sp, #0x38
 4105118: 97273584     	bl	0xad2728 <_ChromeMain+0xacd48c>
 410511c: 3943a3e8     	ldrb	w8, [sp, #0xe8]
 4105120: 3607eae8     	tbz	w8, #0x0, 0x4104e7c <_ChromeMain+0x40ffbe0>
 4105124: 9101c3e0     	add	x0, sp, #0x70
 4105128: 97159e58     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 410512c: 39805c08     	ldrsb	x8, [x0, #0x17]
 4105130: a9402809     	ldp	x9, x10, [x0]
 4105134: f100011f     	cmp	x8, #0x0
 4105138: 9a804121     	csel	x1, x9, x0, mi
 410513c: 7100011f     	cmp	w8, #0x0
 4105140: 9a884142     	csel	x2, x10, x8, mi
 4105144: 52800028     	mov	w8, #0x1                ; =1
 4105148: b81503a8     	stur	w8, [x29, #-0xb0]
 410514c: 52800048     	mov	w8, #0x2                ; =2
 4105150: 381683a8     	sturb	w8, [x29, #-0x98]
 4105154: 9100e3e0     	add	x0, sp, #0x38
 4105158: d102c3a3     	sub	x3, x29, #0xb0
 410515c: 9710d759     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4105160: 385683a8     	ldurb	w8, [x29, #-0x98]
 4105164: 7103fd1f     	cmp	w8, #0xff
 4105168: 54000060     	b.eq	0x4105174 <_ChromeMain+0x40ffed8>
 410516c: 7100091f     	cmp	w8, #0x2
 4105170: 54000781     	b.ne	0x4105260 <_ChromeMain+0x40fffc4>
 4105174: f9401fe8     	ldr	x8, [sp, #0x38]
 4105178: f9001fff     	str	xzr, [sp, #0x38]
 410517c: f90013ff     	str	xzr, [sp, #0x20]
 4105180: f81503a8     	stur	x8, [x29, #-0xb0]
 4105184: 6f00e400     	movi.2d	v0, #0000000000000000
 4105188: 3c8283e0     	stur	q0, [sp, #0x28]
 410518c: 3cc403e1     	ldur	q1, [sp, #0x40]
 4105190: 3c8403e0     	stur	q0, [sp, #0x40]
 4105194: 3c8502c1     	stur	q1, [x22, #0x50]
 4105198: 528000c8     	mov	w8, #0x6                ; =6
 410519c: 381683a8     	sturb	w8, [x29, #-0x98]
 41051a0: 90046f21     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 41051a4: 9128a021     	add	x1, x1, #0xa28
 41051a8: d102c3a3     	sub	x3, x29, #0xb0
 41051ac: aa1503e0     	mov	x0, x21
 41051b0: 52800662     	mov	w2, #0x33               ; =51
 41051b4: 975011bd     	bl	0x15098a8 <_ChromeMain+0x150460c>
 41051b8: d102c3a0     	sub	x0, x29, #0xb0
 41051bc: 97546586     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 41051c0: 910083e0     	add	x0, sp, #0x20
 41051c4: 972164af     	bl	0x95e480 <_ChromeMain+0x9591e4>
 41051c8: 3943a3e8     	ldrb	w8, [sp, #0xe8]
 41051cc: 3607e588     	tbz	w8, #0x0, 0x4104e7c <_ChromeMain+0x40ffbe0>
 41051d0: f940ea60     	ldr	x0, [x19, #0x1d0]
 41051d4: b5000040     	cbnz	x0, 0x41051dc <_ChromeMain+0x40fff40>
 41051d8: f940e660     	ldr	x0, [x19, #0x1c8]
 41051dc: 52800035     	mov	w21, #0x1               ; =1
 41051e0: 9101c3e1     	add	x1, sp, #0x70
 41051e4: 52800022     	mov	w2, #0x1                ; =1
 41051e8: 94db4cc6     	bl	0x77d8500 <_ChromeMain+0x77d3264>
 41051ec: a9007fff     	stp	xzr, xzr, [sp]
 41051f0: f9000bff     	str	xzr, [sp, #0x10]
 41051f4: 910003e0     	mov	x0, sp
 41051f8: 52800021     	mov	w1, #0x1                ; =1
 41051fc: 975e27e1     	bl	0x188f180 <_ChromeMain+0x1889ee4>
 4105200: 381503b5     	sturb	w21, [x29, #-0xb0]
 4105204: 910003e0     	mov	x0, sp
 4105208: d102c3a1     	sub	x1, x29, #0xb0
 410520c: 951bea8d     	bl	0x87ffc40 <_ChromeMain+0x87fa9a4>
 4105210: 91007fe8     	add	x8, sp, #0x1f
 4105214: 910003e1     	mov	x1, sp
 4105218: aa1303e0     	mov	x0, x19
 410521c: 94adca8e     	bl	0x6c77c54 <_ChromeMain+0x6c729b8>
 4105220: 91007fe1     	add	x1, sp, #0x1f
 4105224: aa1403e8     	mov	x8, x20
 4105228: aa1303e0     	mov	x0, x19
 410522c: 94adc8ca     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 4105230: f94003e1     	ldr	x1, [sp]
 4105234: b5000081     	cbnz	x1, 0x4105244 <_ChromeMain+0x40fffa8>
 4105238: 9100e3e0     	add	x0, sp, #0x38
 410523c: 97216491     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4105240: 17ffff85     	b	0x4105054 <_ChromeMain+0x40ffdb8>
 4105244: 910003e0     	mov	x0, sp
 4105248: 9728872a     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 410524c: f94003e0     	ldr	x0, [sp]
 4105250: f9400be8     	ldr	x8, [sp, #0x10]
 4105254: d37be901     	lsl	x1, x8, #5
 4105258: 96fc0f18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 410525c: 17fffff7     	b	0x4105238 <_ChromeMain+0x40fff9c>
 4105260: 90053de9     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4105264: 9121e129     	add	x9, x9, #0x878
 4105268: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 410526c: d100c7a0     	sub	x0, x29, #0x31
 4105270: d102c3a1     	sub	x1, x29, #0xb0
 4105274: d63f0100     	blr	x8
 4105278: 17ffffbf     	b	0x4105174 <_ChromeMain+0x40ffed8>
 410527c: f9401909     	ldr	x9, [x8, #0x30]
 4105280: b4ffe8e9     	cbz	x9, 0x4104f9c <_ChromeMain+0x40ffd00>
 4105284: 9100a115     	add	x21, x8, #0x28
 4105288: 17ffff48     	b	0x4104fa8 <_ChromeMain+0x40ffd0c>
 410528c: d4200000     	brk	#0
 4105290: d4400000     	hlt	#0
 4105294: d4200020     	brk	#0x1
 4105298: 97e595f8     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 410529c: aa0003f5     	mov	x21, x0
 41052a0: 17ffff42     	b	0x4104fa8 <_ChromeMain+0x40ffd0c>
 41052a4: 00000000     	udf	#0x0
