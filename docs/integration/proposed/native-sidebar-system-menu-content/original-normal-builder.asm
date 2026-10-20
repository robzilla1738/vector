
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4600df4: d101c3ff     	sub	sp, sp, #0x70
 4600df8: a90267fa     	stp	x26, x25, [sp, #0x20]
 4600dfc: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4600e00: a90457f6     	stp	x22, x21, [sp, #0x40]
 4600e04: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4600e08: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4600e0c: 910183fd     	add	x29, sp, #0x60
 4600e10: aa0003f4     	mov	x20, x0
 4600e14: f0054878     	adrp	x24, 0xef0f000 <dyld_stub_binder+0xef0f000>
 4600e18: f946f700     	ldr	x0, [x24, #0xde8]
 4600e1c: b4003040     	cbz	x0, 0x4601424 <_ChromeMain+0x45fc188>
 4600e20: aa0103f3     	mov	x19, x1
 4600e24: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4600e28: f9000fff     	str	xzr, [sp, #0x18]
 4600e2c: 910023e8     	add	x8, sp, #0x8
 4600e30: 528022a1     	mov	w1, #0x115              ; =277
 4600e34: 9732ce2a     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4600e38: 910023e2     	add	x2, sp, #0x8
 4600e3c: aa1303e0     	mov	x0, x19
 4600e40: 52909bc1     	mov	w1, #0x84de             ; =34014
 4600e44: 97469231     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4600e48: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4600e4c: 36f800a8     	tbz	w8, #0x1f, 0x4600e60 <_ChromeMain+0x45fbbc4>
 4600e50: f94007e0     	ldr	x0, [sp, #0x8]
 4600e54: f9400fe8     	ldr	x8, [sp, #0x18]
 4600e58: d37ff901     	lsl	x1, x8, #1
 4600e5c: 96e82017     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4600e60: f9400e68     	ldr	x8, [x19, #0x18]
 4600e64: 8b080d09     	add	x9, x8, x8, lsl #3
 4600e68: d37be92b     	lsl	x11, x9, #5
 4600e6c: b4002dab     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 4600e70: d2800009     	mov	x9, #0x0                ; =0
 4600e74: f9400a6a     	ldr	x10, [x19, #0x10]
 4600e78: 52909bcc     	mov	w12, #0x84de            ; =34014
 4600e7c: b869694d     	ldr	w13, [x10, x9]
 4600e80: 6b0c01bf     	cmp	w13, w12
 4600e84: 540000a0     	b.eq	0x4600e98 <_ChromeMain+0x45fbbfc>
 4600e88: 91048129     	add	x9, x9, #0x120
 4600e8c: eb09017f     	cmp	x11, x9
 4600e90: 54ffff61     	b.ne	0x4600e7c <_ChromeMain+0x45fbbe0>
 4600e94: 14000163     	b	0x4601420 <_ChromeMain+0x45fc184>
 4600e98: 9345fd2b     	asr	x11, x9, #5
 4600e9c: d291c739     	mov	x25, #0x8e39            ; =36409
 4600ea0: f2a71c79     	movk	x25, #0x38e3, lsl #16
 4600ea4: f2dc71d9     	movk	x25, #0xe38e, lsl #32
 4600ea8: f2f1c719     	movk	x25, #0x8e38, lsl #48
 4600eac: 9b197d6b     	mul	x11, x11, x25
 4600eb0: eb08017f     	cmp	x11, x8
 4600eb4: 54002be2     	b.hs	0x4601430 <_ChromeMain+0x45fc194>
 4600eb8: 8b090148     	add	x8, x10, x9
 4600ebc: f0052689     	adrp	x9, 0xead3000 <dyld_stub_binder+0xead3000>
 4600ec0: 91104129     	add	x9, x9, #0x410
 4600ec4: f9008909     	str	x9, [x8, #0x110]
 4600ec8: f946f700     	ldr	x0, [x24, #0xde8]
 4600ecc: b4002b80     	cbz	x0, 0x460143c <_ChromeMain+0x45fc1a0>
 4600ed0: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4600ed4: f9000fff     	str	xzr, [sp, #0x18]
 4600ed8: 910023e8     	add	x8, sp, #0x8
 4600edc: 52846681     	mov	w1, #0x2334             ; =9012
 4600ee0: 9732cdff     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4600ee4: 910023e2     	add	x2, sp, #0x8
 4600ee8: aa1303e0     	mov	x0, x19
 4600eec: 52909d81     	mov	w1, #0x84ec             ; =34028
 4600ef0: 97469206     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4600ef4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4600ef8: 36f800a8     	tbz	w8, #0x1f, 0x4600f0c <_ChromeMain+0x45fbc70>
 4600efc: f94007e0     	ldr	x0, [sp, #0x8]
 4600f00: f9400fe8     	ldr	x8, [sp, #0x18]
 4600f04: d37ff901     	lsl	x1, x8, #1
 4600f08: 96e81fec     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4600f0c: f9400e68     	ldr	x8, [x19, #0x18]
 4600f10: 8b080d09     	add	x9, x8, x8, lsl #3
 4600f14: d37be92b     	lsl	x11, x9, #5
 4600f18: b400284b     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 4600f1c: d2800009     	mov	x9, #0x0                ; =0
 4600f20: f9400a6a     	ldr	x10, [x19, #0x10]
 4600f24: 52909d8c     	mov	w12, #0x84ec            ; =34028
 4600f28: b869694d     	ldr	w13, [x10, x9]
 4600f2c: 6b0c01bf     	cmp	w13, w12
 4600f30: 540000a0     	b.eq	0x4600f44 <_ChromeMain+0x45fbca8>
 4600f34: 91048129     	add	x9, x9, #0x120
 4600f38: eb09017f     	cmp	x11, x9
 4600f3c: 54002720     	b.eq	0x4601420 <_ChromeMain+0x45fc184>
 4600f40: 17fffffa     	b	0x4600f28 <_ChromeMain+0x45fbc8c>
 4600f44: 9345fd2b     	asr	x11, x9, #5
 4600f48: 9b197d6b     	mul	x11, x11, x25
 4600f4c: eb08017f     	cmp	x11, x8
 4600f50: 540027c2     	b.hs	0x4601448 <_ChromeMain+0x45fc1ac>
 4600f54: 8b090148     	add	x8, x10, x9
 4600f58: f0052689     	adrp	x9, 0xead3000 <dyld_stub_binder+0xead3000>
 4600f5c: 91106129     	add	x9, x9, #0x418
 4600f60: f9008909     	str	x9, [x8, #0x110]
 4600f64: f946f700     	ldr	x0, [x24, #0xde8]
 4600f68: b4002760     	cbz	x0, 0x4601454 <_ChromeMain+0x45fc1b8>
 4600f6c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4600f70: f9000fff     	str	xzr, [sp, #0x18]
 4600f74: 910023e8     	add	x8, sp, #0x8
 4600f78: 52801601     	mov	w1, #0xb0               ; =176
 4600f7c: 9732cdd8     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4600f80: 910023e2     	add	x2, sp, #0x8
 4600f84: aa1303e0     	mov	x0, x19
 4600f88: 52911721     	mov	w1, #0x88b9             ; =35001
 4600f8c: 974691df     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4600f90: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4600f94: 36f800a8     	tbz	w8, #0x1f, 0x4600fa8 <_ChromeMain+0x45fbd0c>
 4600f98: f94007e0     	ldr	x0, [sp, #0x8]
 4600f9c: f9400fe8     	ldr	x8, [sp, #0x18]
 4600fa0: d37ff901     	lsl	x1, x8, #1
 4600fa4: 96e81fc5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4600fa8: f946f700     	ldr	x0, [x24, #0xde8]
 4600fac: b40025a0     	cbz	x0, 0x4601460 <_ChromeMain+0x45fc1c4>
 4600fb0: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4600fb4: f9000fff     	str	xzr, [sp, #0x18]
 4600fb8: 910023e8     	add	x8, sp, #0x8
 4600fbc: 52846741     	mov	w1, #0x233a             ; =9018
 4600fc0: 9732cdc7     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4600fc4: 910023e2     	add	x2, sp, #0x8
 4600fc8: aa1303e0     	mov	x0, x19
 4600fcc: 5290a021     	mov	w1, #0x8501             ; =34049
 4600fd0: 974691ce     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4600fd4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4600fd8: 36f800a8     	tbz	w8, #0x1f, 0x4600fec <_ChromeMain+0x45fbd50>
 4600fdc: f94007e0     	ldr	x0, [sp, #0x8]
 4600fe0: f9400fe8     	ldr	x8, [sp, #0x18]
 4600fe4: d37ff901     	lsl	x1, x8, #1
 4600fe8: 96e81fb4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4600fec: aa1303e0     	mov	x0, x19
 4600ff0: 52800001     	mov	w1, #0x0                ; =0
 4600ff4: 979ed570     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 4600ff8: f946f700     	ldr	x0, [x24, #0xde8]
 4600ffc: b4002380     	cbz	x0, 0x460146c <_ChromeMain+0x45fc1d0>
 4601000: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4601004: f9000fff     	str	xzr, [sp, #0x18]
 4601008: 910023e8     	add	x8, sp, #0x8
 460100c: 52810fa1     	mov	w1, #0x87d              ; =2173
 4601010: 9732cdb3     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4601014: 910023e2     	add	x2, sp, #0x8
 4601018: aa1303e0     	mov	x0, x19
 460101c: 529a0901     	mov	w1, #0xd048             ; =53320
 4601020: 974691ba     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4601024: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4601028: 36f800a8     	tbz	w8, #0x1f, 0x460103c <_ChromeMain+0x45fbda0>
 460102c: f94007e0     	ldr	x0, [sp, #0x8]
 4601030: f9400fe8     	ldr	x8, [sp, #0x18]
 4601034: d37ff901     	lsl	x1, x8, #1
 4601038: 96e81fa0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460103c: f9400e88     	ldr	x8, [x20, #0x18]
 4601040: b4001ba8     	cbz	x8, 0x46013b4 <_ChromeMain+0x45fc118>
 4601044: b00514a1     	adrp	x1, 0xe896000 <dyld_stub_binder+0xe896000>
 4601048: 913ae021     	add	x1, x1, #0xeb8
 460104c: 91056100     	add	x0, x8, #0x158
 4601050: 96ec4d97     	bl	0x1146ac <_ChromeMain+0x10f410>
 4601054: b4001b00     	cbz	x0, 0x46013b4 <_ChromeMain+0x45fc118>
 4601058: aa0003f5     	mov	x21, x0
 460105c: aa1303e0     	mov	x0, x19
 4601060: 52800001     	mov	w1, #0x0                ; =0
 4601064: 979ed554     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 4601068: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 460106c: 9118e000     	add	x0, x0, #0x638
 4601070: 96ec6084     	bl	0x119280 <_ChromeMain+0x113fe4>
 4601074: 370000a0     	tbnz	w0, #0x0, 0x4601088 <_ChromeMain+0x45fbdec>
 4601078: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 460107c: 91192000     	add	x0, x0, #0x648
 4601080: 96ec6080     	bl	0x119280 <_ChromeMain+0x113fe4>
 4601084: 340007e0     	cbz	w0, 0x4601180 <_ChromeMain+0x45fbee4>
 4601088: 394782a8     	ldrb	w8, [x21, #0x1e0]
 460108c: 340007a8     	cbz	w8, 0x4601180 <_ChromeMain+0x45fbee4>
 4601090: f946f700     	ldr	x0, [x24, #0xde8]
 4601094: b4001fe0     	cbz	x0, 0x4601490 <_ChromeMain+0x45fc1f4>
 4601098: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 460109c: f9000fff     	str	xzr, [sp, #0x18]
 46010a0: 910023e8     	add	x8, sp, #0x8
 46010a4: 528583a1     	mov	w1, #0x2c1d             ; =11293
 46010a8: 9732cd8d     	bl	0x12b46dc <_ChromeMain+0x12af440>
 46010ac: 910023e2     	add	x2, sp, #0x8
 46010b0: aa1303e0     	mov	x0, x19
 46010b4: 5290a141     	mov	w1, #0x850a             ; =34058
 46010b8: 97469194     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 46010bc: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 46010c0: 36f800a8     	tbz	w8, #0x1f, 0x46010d4 <_ChromeMain+0x45fbe38>
 46010c4: f94007e0     	ldr	x0, [sp, #0x8]
 46010c8: f9400fe8     	ldr	x8, [sp, #0x18]
 46010cc: d37ff901     	lsl	x1, x8, #1
 46010d0: 96e81f7a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46010d4: f946f700     	ldr	x0, [x24, #0xde8]
 46010d8: b4001e20     	cbz	x0, 0x460149c <_ChromeMain+0x45fc200>
 46010dc: 394242a8     	ldrb	w8, [x21, #0x90]
 46010e0: 7100011f     	cmp	w8, #0x0
 46010e4: 528583c8     	mov	w8, #0x2c1e             ; =11294
 46010e8: 1a880501     	cinc	w1, w8, ne
 46010ec: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 46010f0: f9000fff     	str	xzr, [sp, #0x18]
 46010f4: 910023e8     	add	x8, sp, #0x8
 46010f8: 9732cd79     	bl	0x12b46dc <_ChromeMain+0x12af440>
 46010fc: 910023e2     	add	x2, sp, #0x8
 4601100: aa1303e0     	mov	x0, x19
 4601104: 5290a1a1     	mov	w1, #0x850d             ; =34061
 4601108: 97469180     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 460110c: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4601110: 36f800a8     	tbz	w8, #0x1f, 0x4601124 <_ChromeMain+0x45fbe88>
 4601114: f94007e0     	ldr	x0, [sp, #0x8]
 4601118: f9400fe8     	ldr	x8, [sp, #0x18]
 460111c: d37ff901     	lsl	x1, x8, #1
 4601120: 96e81f66     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4601124: f9400e68     	ldr	x8, [x19, #0x18]
 4601128: 8b080d09     	add	x9, x8, x8, lsl #3
 460112c: d37be92b     	lsl	x11, x9, #5
 4601130: b400178b     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 4601134: d2800009     	mov	x9, #0x0                ; =0
 4601138: f9400a6a     	ldr	x10, [x19, #0x10]
 460113c: 5290a1ac     	mov	w12, #0x850d            ; =34061
 4601140: b869694d     	ldr	w13, [x10, x9]
 4601144: 6b0c01bf     	cmp	w13, w12
 4601148: 540000a0     	b.eq	0x460115c <_ChromeMain+0x45fbec0>
 460114c: 91048129     	add	x9, x9, #0x120
 4601150: eb09017f     	cmp	x11, x9
 4601154: 54001660     	b.eq	0x4601420 <_ChromeMain+0x45fc184>
 4601158: 17fffffa     	b	0x4601140 <_ChromeMain+0x45fbea4>
 460115c: 9345fd2b     	asr	x11, x9, #5
 4601160: 9b197d6b     	mul	x11, x11, x25
 4601164: eb08017f     	cmp	x11, x8
 4601168: 54001ac2     	b.hs	0x46014c0 <_ChromeMain+0x45fc224>
 460116c: 8b090148     	add	x8, x10, x9
 4601170: 900526a9     	adrp	x9, 0xead5000 <dyld_stub_binder+0xead5000>
 4601174: 911f6129     	add	x9, x9, #0x7d8
 4601178: f9008909     	str	x9, [x8, #0x110]
 460117c: 14000038     	b	0x460125c <_ChromeMain+0x45fbfc0>
 4601180: f946f700     	ldr	x0, [x24, #0xde8]
 4601184: b4001920     	cbz	x0, 0x46014a8 <_ChromeMain+0x45fc20c>
 4601188: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 460118c: f9000fff     	str	xzr, [sp, #0x18]
 4601190: 910023e8     	add	x8, sp, #0x8
 4601194: 52858381     	mov	w1, #0x2c1c             ; =11292
 4601198: 9732cd51     	bl	0x12b46dc <_ChromeMain+0x12af440>
 460119c: 910023e2     	add	x2, sp, #0x8
 46011a0: aa1303e0     	mov	x0, x19
 46011a4: 5290a141     	mov	w1, #0x850a             ; =34058
 46011a8: 97469158     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 46011ac: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 46011b0: 36f800a8     	tbz	w8, #0x1f, 0x46011c4 <_ChromeMain+0x45fbf28>
 46011b4: f94007e0     	ldr	x0, [sp, #0x8]
 46011b8: f9400fe8     	ldr	x8, [sp, #0x18]
 46011bc: d37ff901     	lsl	x1, x8, #1
 46011c0: 96e81f3e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46011c4: b0052d57     	adrp	x23, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46011c8: 911962f7     	add	x23, x23, #0x658
 46011cc: aa1703e0     	mov	x0, x23
 46011d0: 96ec602c     	bl	0x119280 <_ChromeMain+0x113fe4>
 46011d4: aa0003f6     	mov	x22, x0
 46011d8: f9400e88     	ldr	x8, [x20, #0x18]
 46011dc: f9402100     	ldr	x0, [x8, #0x40]
 46011e0: b0052d48     	adrp	x8, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46011e4: 9119a108     	add	x8, x8, #0x668
 46011e8: 710002df     	cmp	w22, #0x0
 46011ec: 9a8812e1     	csel	x1, x23, x8, ne
 46011f0: 94baf5db     	bl	0x74be95c <_ChromeMain+0x74b96c0>
 46011f4: f9400e6a     	ldr	x10, [x19, #0x18]
 46011f8: 8b0a0d48     	add	x8, x10, x10, lsl #3
 46011fc: d37be90b     	lsl	x11, x8, #5
 4601200: b400110b     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 4601204: d2800008     	mov	x8, #0x0                ; =0
 4601208: f9400a69     	ldr	x9, [x19, #0x10]
 460120c: 5290a14c     	mov	w12, #0x850a            ; =34058
 4601210: b868692d     	ldr	w13, [x9, x8]
 4601214: 6b0c01bf     	cmp	w13, w12
 4601218: 540000a0     	b.eq	0x460122c <_ChromeMain+0x45fbf90>
 460121c: 91048108     	add	x8, x8, #0x120
 4601220: eb08017f     	cmp	x11, x8
 4601224: 54000fe0     	b.eq	0x4601420 <_ChromeMain+0x45fc184>
 4601228: 17fffffa     	b	0x4601210 <_ChromeMain+0x45fbf74>
 460122c: 9345fd0b     	asr	x11, x8, #5
 4601230: 9b197d6b     	mul	x11, x11, x25
 4601234: eb0a017f     	cmp	x11, x10
 4601238: 540013e2     	b.hs	0x46014b4 <_ChromeMain+0x45fc218>
 460123c: 2a1603ea     	mov	w10, w22
 4601240: b260014a     	orr	x10, x10, #0x100000000
 4601244: 7200001f     	tst	w0, #0x1
 4601248: 9a9f114a     	csel	x10, x10, xzr, ne
 460124c: 8b080128     	add	x8, x9, x8
 4601250: b900e90a     	str	w10, [x8, #0xe8]
 4601254: d360fd49     	lsr	x9, x10, #32
 4601258: 3903b109     	strb	w9, [x8, #0xec]
 460125c: f9400e68     	ldr	x8, [x19, #0x18]
 4601260: 8b080d09     	add	x9, x8, x8, lsl #3
 4601264: d37be92b     	lsl	x11, x9, #5
 4601268: b4000dcb     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 460126c: d2800009     	mov	x9, #0x0                ; =0
 4601270: f9400a6a     	ldr	x10, [x19, #0x10]
 4601274: 5290a14c     	mov	w12, #0x850a            ; =34058
 4601278: b869694d     	ldr	w13, [x10, x9]
 460127c: 6b0c01bf     	cmp	w13, w12
 4601280: 540000a0     	b.eq	0x4601294 <_ChromeMain+0x45fbff8>
 4601284: 91048129     	add	x9, x9, #0x120
 4601288: eb09017f     	cmp	x11, x9
 460128c: 54000ca0     	b.eq	0x4601420 <_ChromeMain+0x45fc184>
 4601290: 17fffffa     	b	0x4601278 <_ChromeMain+0x45fbfdc>
 4601294: 9345fd2b     	asr	x11, x9, #5
 4601298: 9b197d6b     	mul	x11, x11, x25
 460129c: eb08017f     	cmp	x11, x8
 46012a0: 54000f22     	b.hs	0x4601484 <_ChromeMain+0x45fc1e8>
 46012a4: 8b090148     	add	x8, x10, x9
 46012a8: 900526a9     	adrp	x9, 0xead5000 <dyld_stub_binder+0xead5000>
 46012ac: 911f4129     	add	x9, x9, #0x7d0
 46012b0: f9008909     	str	x9, [x8, #0x110]
 46012b4: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46012b8: 9118e000     	add	x0, x0, #0x638
 46012bc: 96ec5ff1     	bl	0x119280 <_ChromeMain+0x113fe4>
 46012c0: 370000a0     	tbnz	w0, #0x0, 0x46012d4 <_ChromeMain+0x45fc038>
 46012c4: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46012c8: 91192000     	add	x0, x0, #0x648
 46012cc: 96ec5fed     	bl	0x119280 <_ChromeMain+0x113fe4>
 46012d0: 34000720     	cbz	w0, 0x46013b4 <_ChromeMain+0x45fc118>
 46012d4: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46012d8: 9119e000     	add	x0, x0, #0x678
 46012dc: 96ec5fe9     	bl	0x119280 <_ChromeMain+0x113fe4>
 46012e0: 340006a0     	cbz	w0, 0x46013b4 <_ChromeMain+0x45fc118>
 46012e4: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46012e8: 9118e000     	add	x0, x0, #0x638
 46012ec: 96ec5fe5     	bl	0x119280 <_ChromeMain+0x113fe4>
 46012f0: 370000a0     	tbnz	w0, #0x0, 0x4601304 <_ChromeMain+0x45fc068>
 46012f4: b0052d40     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 46012f8: 91192000     	add	x0, x0, #0x648
 46012fc: 96ec5fe1     	bl	0x119280 <_ChromeMain+0x113fe4>
 4601300: 340005a0     	cbz	w0, 0x46013b4 <_ChromeMain+0x45fc118>
 4601304: 394782a8     	ldrb	w8, [x21, #0x1e0]
 4601308: 34000568     	cbz	w8, 0x46013b4 <_ChromeMain+0x45fc118>
 460130c: f946f700     	ldr	x0, [x24, #0xde8]
 4601310: b4000de0     	cbz	x0, 0x46014cc <_ChromeMain+0x45fc230>
 4601314: 3947a2a8     	ldrb	w8, [x21, #0x1e8]
 4601318: 7100011f     	cmp	w8, #0x0
 460131c: 52858488     	mov	w8, #0x2c24             ; =11300
 4601320: 1a880501     	cinc	w1, w8, ne
 4601324: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4601328: f9000fff     	str	xzr, [sp, #0x18]
 460132c: 910023e8     	add	x8, sp, #0x8
 4601330: 9732cceb     	bl	0x12b46dc <_ChromeMain+0x12af440>
 4601334: 910023e2     	add	x2, sp, #0x8
 4601338: aa1303e0     	mov	x0, x19
 460133c: 5290a181     	mov	w1, #0x850c             ; =34060
 4601340: 974690f2     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 4601344: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4601348: 36f800a8     	tbz	w8, #0x1f, 0x460135c <_ChromeMain+0x45fc0c0>
 460134c: f94007e0     	ldr	x0, [sp, #0x8]
 4601350: f9400fe8     	ldr	x8, [sp, #0x18]
 4601354: d37ff901     	lsl	x1, x8, #1
 4601358: 96e81ed8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460135c: f9400e68     	ldr	x8, [x19, #0x18]
 4601360: 8b080d09     	add	x9, x8, x8, lsl #3
 4601364: d37be92b     	lsl	x11, x9, #5
 4601368: b40005cb     	cbz	x11, 0x4601420 <_ChromeMain+0x45fc184>
 460136c: d2800009     	mov	x9, #0x0                ; =0
 4601370: f9400a6a     	ldr	x10, [x19, #0x10]
 4601374: 5290a18c     	mov	w12, #0x850c            ; =34060
 4601378: b869694d     	ldr	w13, [x10, x9]
 460137c: 6b0c01bf     	cmp	w13, w12
 4601380: 540000a0     	b.eq	0x4601394 <_ChromeMain+0x45fc0f8>
 4601384: 91048129     	add	x9, x9, #0x120
 4601388: eb09017f     	cmp	x11, x9
 460138c: 54ffff61     	b.ne	0x4601378 <_ChromeMain+0x45fc0dc>
 4601390: 14000024     	b	0x4601420 <_ChromeMain+0x45fc184>
 4601394: 9345fd2b     	asr	x11, x9, #5
 4601398: 9b197d6b     	mul	x11, x11, x25
 460139c: eb08017f     	cmp	x11, x8
 46013a0: 540009c2     	b.hs	0x46014d8 <_ChromeMain+0x45fc23c>
 46013a4: 8b090148     	add	x8, x10, x9
 46013a8: 900526a9     	adrp	x9, 0xead5000 <dyld_stub_binder+0xead5000>
 46013ac: 911f8129     	add	x9, x9, #0x7e0
 46013b0: f9008909     	str	x9, [x8, #0x110]
 46013b4: aa1303e0     	mov	x0, x19
 46013b8: 52800001     	mov	w1, #0x0                ; =0
 46013bc: 979ed47e     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 46013c0: f946f700     	ldr	x0, [x24, #0xde8]
 46013c4: b40005a0     	cbz	x0, 0x4601478 <_ChromeMain+0x45fc1dc>
 46013c8: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 46013cc: f9000fff     	str	xzr, [sp, #0x18]
 46013d0: 910023e8     	add	x8, sp, #0x8
 46013d4: 528024c1     	mov	w1, #0x126              ; =294
 46013d8: 9732ccc1     	bl	0x12b46dc <_ChromeMain+0x12af440>
 46013dc: 910023e2     	add	x2, sp, #0x8
 46013e0: aa1303e0     	mov	x0, x19
 46013e4: 5293abe1     	mov	w1, #0x9d5f             ; =40287
 46013e8: 974690c8     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 46013ec: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 46013f0: 36f800a8     	tbz	w8, #0x1f, 0x4601404 <_ChromeMain+0x45fc168>
 46013f4: f94007e0     	ldr	x0, [sp, #0x8]
 46013f8: f9400fe8     	ldr	x8, [sp, #0x18]
 46013fc: d37ff901     	lsl	x1, x8, #1
 4601400: 96e81eae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4601404: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4601408: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 460140c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4601410: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4601414: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4601418: 9101c3ff     	add	sp, sp, #0x70
 460141c: d65f03c0     	ret
 4601420: 9417fbbf     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4601424: d4200000     	brk	#0
 4601428: d4400000     	hlt	#0
 460142c: d4200020     	brk	#0x1
 4601430: d4200000     	brk	#0
 4601434: d4400000     	hlt	#0
 4601438: d4200020     	brk	#0x1
 460143c: d4200000     	brk	#0
 4601440: d4400000     	hlt	#0
 4601444: d4200020     	brk	#0x1
 4601448: d4200000     	brk	#0
 460144c: d4400000     	hlt	#0
 4601450: d4200020     	brk	#0x1
 4601454: d4200000     	brk	#0
 4601458: d4400000     	hlt	#0
 460145c: d4200020     	brk	#0x1
 4601460: d4200000     	brk	#0
 4601464: d4400000     	hlt	#0
 4601468: d4200020     	brk	#0x1
 460146c: d4200000     	brk	#0
 4601470: d4400000     	hlt	#0
 4601474: d4200020     	brk	#0x1
 4601478: d4200000     	brk	#0
 460147c: d4400000     	hlt	#0
 4601480: d4200020     	brk	#0x1
 4601484: d4200000     	brk	#0
 4601488: d4400000     	hlt	#0
 460148c: d4200020     	brk	#0x1
 4601490: d4200000     	brk	#0
 4601494: d4400000     	hlt	#0
 4601498: d4200020     	brk	#0x1
 460149c: d4200000     	brk	#0
 46014a0: d4400000     	hlt	#0
 46014a4: d4200020     	brk	#0x1
 46014a8: d4200000     	brk	#0
 46014ac: d4400000     	hlt	#0
 46014b0: d4200020     	brk	#0x1
 46014b4: d4200000     	brk	#0
 46014b8: d4400000     	hlt	#0
 46014bc: d4200020     	brk	#0x1
 46014c0: d4200000     	brk	#0
 46014c4: d4400000     	hlt	#0
 46014c8: d4200020     	brk	#0x1
 46014cc: d4200000     	brk	#0
 46014d0: d4400000     	hlt	#0
 46014d4: d4200020     	brk	#0x1
 46014d8: d4200000     	brk	#0
 46014dc: d4400000     	hlt	#0
 46014e0: d4200020     	brk	#0x1
