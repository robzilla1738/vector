
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462fb38: d102c3ff     	sub	sp, sp, #0xb0
 462fb3c: a90667fa     	stp	x26, x25, [sp, #0x60]
 462fb40: a9075ff8     	stp	x24, x23, [sp, #0x70]
 462fb44: a90857f6     	stp	x22, x21, [sp, #0x80]
 462fb48: a9094ff4     	stp	x20, x19, [sp, #0x90]
 462fb4c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 462fb50: 910283fd     	add	x29, sp, #0xa0
 462fb54: b4002481     	cbz	x1, 0x462ffe4 <_ChromeMain+0x462ad48>
 462fb58: aa0203f5     	mov	x21, x2
 462fb5c: aa0103f4     	mov	x20, x1
 462fb60: aa0003f3     	mov	x19, x0
 462fb64: f9400008     	ldr	x8, [x0]
 462fb68: f9403108     	ldr	x8, [x8, #0x60]
 462fb6c: b0fe01fa     	adrp	x26, 0x66c000 <_ChromeMain+0x666d64>
 462fb70: 9139435a     	add	x26, x26, #0xe50
 462fb74: eb1a011f     	cmp	x8, x26
 462fb78: 54002781     	b.ne	0x4630068 <_ChromeMain+0x462adcc>
 462fb7c: f940c260     	ldr	x0, [x19, #0x180]
 462fb80: b4002320     	cbz	x0, 0x462ffe4 <_ChromeMain+0x462ad48>
 462fb84: 91400678     	add	x24, x19, #0x1, lsl #12 ; =0x1000
 462fb88: 394e8308     	ldrb	w8, [x24, #0x3a0]
 462fb8c: 34000108     	cbz	w8, 0x462fbac <_ChromeMain+0x462a910>
 462fb90: 39ce7f08     	ldrsb	w8, [x24, #0x39f]
 462fb94: 36f800a8     	tbz	w8, #0x1f, 0x462fba8 <_ChromeMain+0x462a90c>
 462fb98: f949c660     	ldr	x0, [x19, #0x1388]
 462fb9c: f949ce68     	ldr	x8, [x19, #0x1398]
 462fba0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462fba4: 96e764c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462fba8: 390e831f     	strb	wzr, [x24, #0x3a0]
 462fbac: b913ca7f     	str	wzr, [x19, #0x13c8]
 462fbb0: aa1303e0     	mov	x0, x19
 462fbb4: aa1403e1     	mov	x1, x20
 462fbb8: 940025d5     	bl	0x463930c <_ChromeMain+0x4634070>
 462fbbc: 52800800     	mov	w0, #0x40               ; =64
 462fbc0: 96e77dea     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fbc4: aa0003f6     	mov	x22, x0
 462fbc8: 9115c268     	add	x8, x19, #0x570
 462fbcc: f100027f     	cmp	x19, #0x0
 462fbd0: 9a8803f7     	csel	x23, xzr, x8, eq
 462fbd4: b004e5c8     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 462fbd8: 912da108     	add	x8, x8, #0xb68
 462fbdc: a9007c08     	stp	x8, xzr, [x0]
 462fbe0: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 462fbe4: f900081f     	str	xzr, [x0, #0x10]
 462fbe8: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 462fbec: f0052c19     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 462fbf0: f9404729     	ldr	x9, [x25, #0x88]
 462fbf4: eb09011f     	cmp	x8, x9
 462fbf8: 54000061     	b.ne	0x462fc04 <_ChromeMain+0x462a968>
 462fbfc: aa1703e0     	mov	x0, x23
 462fc00: 96e791bf     	bl	0x142fc <_ChromeMain+0xf060>
 462fc04: f90016d7     	str	x23, [x22, #0x28]
 462fc08: 52800100     	mov	w0, #0x8                ; =8
 462fc0c: 96e77dd7     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fc10: b900001f     	str	wzr, [x0]
 462fc14: 3900101f     	strb	wzr, [x0, #0x4]
 462fc18: b40000c0     	cbz	x0, 0x462fc30 <_ChromeMain+0x462a994>
 462fc1c: 52800028     	mov	w8, #0x1                ; =1
 462fc20: b8280008     	ldadd	w8, w8, [x0]
 462fc24: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 462fc28: 6b09011f     	cmp	w8, w9
 462fc2c: 54002300     	b.eq	0x463008c <_ChromeMain+0x462adf0>
 462fc30: a9035ac0     	stp	x0, x22, [x22, #0x30]
 462fc34: f949be60     	ldr	x0, [x19, #0x1378]
 462fc38: f909be76     	str	x22, [x19, #0x1378]
 462fc3c: b40000a0     	cbz	x0, 0x462fc50 <_ChromeMain+0x462a9b4>
 462fc40: f9400008     	ldr	x8, [x0]
 462fc44: f9400508     	ldr	x8, [x8, #0x8]
 462fc48: d63f0100     	blr	x8
 462fc4c: f949be76     	ldr	x22, [x19, #0x1378]
 462fc50: 52800600     	mov	w0, #0x30               ; =48
 462fc54: 96e77dc5     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fc58: f90007e0     	str	x0, [sp, #0x8]
 462fc5c: b004c888     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 462fc60: 3dc00900     	ldr	q0, [x8, #0x20]
 462fc64: 3c8103e0     	stur	q0, [sp, #0x10]
 462fc68: 91008009     	add	x9, x0, #0x20
 462fc6c: eb00013f     	cmp	x9, x0
 462fc70: 540020c3     	b.lo	0x4630088 <_ChromeMain+0x462adec>
 462fc74: 9004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462fc78: 912d9108     	add	x8, x8, #0xb64
 462fc7c: eb08013f     	cmp	x9, x8
 462fc80: fa488002     	ccmp	x0, x8, #0x2, hi
 462fc84: 54002029     	b.ls	0x4630088 <_ChromeMain+0x462adec>
 462fc88: ad400500     	ldp	q0, q1, [x8]
 462fc8c: ad000400     	stp	q0, q1, [x0]
 462fc90: 7900401f     	strh	wzr, [x0, #0x20]
 462fc94: 910023e2     	add	x2, sp, #0x8
 462fc98: aa1603e0     	mov	x0, x22
 462fc9c: 52810681     	mov	w1, #0x834              ; =2100
 462fca0: 9745d69a     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462fca4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462fca8: 36f800a8     	tbz	w8, #0x1f, 0x462fcbc <_ChromeMain+0x462aa20>
 462fcac: f94007e0     	ldr	x0, [sp, #0x8]
 462fcb0: f9400fe8     	ldr	x8, [sp, #0x18]
 462fcb4: d37ff901     	lsl	x1, x8, #1
 462fcb8: 96e76480     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462fcbc: f949be76     	ldr	x22, [x19, #0x1378]
 462fcc0: 52800600     	mov	w0, #0x30               ; =48
 462fcc4: 96e77da9     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fcc8: f90007e0     	str	x0, [sp, #0x8]
 462fccc: b004c888     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 462fcd0: 3dc00d00     	ldr	q0, [x8, #0x30]
 462fcd4: 3c8103e0     	stur	q0, [sp, #0x10]
 462fcd8: 91008809     	add	x9, x0, #0x22
 462fcdc: eb00013f     	cmp	x9, x0
 462fce0: 54001d43     	b.lo	0x4630088 <_ChromeMain+0x462adec>
 462fce4: 9004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462fce8: 912e1908     	add	x8, x8, #0xb86
 462fcec: eb08013f     	cmp	x9, x8
 462fcf0: fa488002     	ccmp	x0, x8, #0x2, hi
 462fcf4: 54001ca9     	b.ls	0x4630088 <_ChromeMain+0x462adec>
 462fcf8: 52800e69     	mov	w9, #0x73               ; =115
 462fcfc: b9002009     	str	w9, [x0, #0x20]
 462fd00: ad400500     	ldp	q0, q1, [x8]
 462fd04: ad000400     	stp	q0, q1, [x0]
 462fd08: 910023e2     	add	x2, sp, #0x8
 462fd0c: aa1603e0     	mov	x0, x22
 462fd10: 528106a1     	mov	w1, #0x835              ; =2101
 462fd14: 9745d67d     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462fd18: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462fd1c: 36f800a8     	tbz	w8, #0x1f, 0x462fd30 <_ChromeMain+0x462aa94>
 462fd20: f94007e0     	ldr	x0, [sp, #0x8]
 462fd24: f9400fe8     	ldr	x8, [sp, #0x18]
 462fd28: d37ff901     	lsl	x1, x8, #1
 462fd2c: 96e76463     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462fd30: f949be60     	ldr	x0, [x19, #0x1378]
 462fd34: 52800001     	mov	w1, #0x0                ; =0
 462fd38: 979e1a1f     	bl	0x2db65b4 <_ChromeMain+0x2db1318>
 462fd3c: f949be76     	ldr	x22, [x19, #0x1378]
 462fd40: 52800400     	mov	w0, #0x20               ; =32
 462fd44: 96e77d89     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fd48: f90007e0     	str	x0, [sp, #0x8]
 462fd4c: b004c888     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 462fd50: 3dc0b900     	ldr	q0, [x8, #0x2e0]
 462fd54: 3c8103e0     	stur	q0, [sp, #0x10]
 462fd58: 91007009     	add	x9, x0, #0x1c
 462fd5c: eb00013f     	cmp	x9, x0
 462fd60: 54001943     	b.lo	0x4630088 <_ChromeMain+0x462adec>
 462fd64: 9004cac8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 462fd68: 912ea908     	add	x8, x8, #0xbaa
 462fd6c: eb08013f     	cmp	x9, x8
 462fd70: fa488002     	ccmp	x0, x8, #0x2, hi
 462fd74: 540018a9     	b.ls	0x4630088 <_ChromeMain+0x462adec>
 462fd78: 3dc00100     	ldr	q0, [x8]
 462fd7c: 3d800000     	str	q0, [x0]
 462fd80: 3cc0c100     	ldur	q0, [x8, #0xc]
 462fd84: 3c80c000     	stur	q0, [x0, #0xc]
 462fd88: 7900381f     	strh	wzr, [x0, #0x1c]
 462fd8c: 910023e2     	add	x2, sp, #0x8
 462fd90: aa1603e0     	mov	x0, x22
 462fd94: 528106c1     	mov	w1, #0x836              ; =2102
 462fd98: 9745d65c     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 462fd9c: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462fda0: 36f800a8     	tbz	w8, #0x1f, 0x462fdb4 <_ChromeMain+0x462ab18>
 462fda4: f94007e0     	ldr	x0, [sp, #0x8]
 462fda8: f9400fe8     	ldr	x8, [sp, #0x18]
 462fdac: d37ff901     	lsl	x1, x8, #1
 462fdb0: 96e76442     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462fdb4: f949be77     	ldr	x23, [x19, #0x1378]
 462fdb8: 52800300     	mov	w0, #0x18               ; =24
 462fdbc: 96e77d6b     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fdc0: aa0003f6     	mov	x22, x0
 462fdc4: 52800500     	mov	w0, #0x28               ; =40
 462fdc8: 96e77d68     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fdcc: aa0003e2     	mov	x2, x0
 462fdd0: 52800028     	mov	w8, #0x1                ; =1
 462fdd4: b9000008     	str	w8, [x0]
 462fdd8: f0fdcf08     	adrp	x8, 0x12000 <_ChromeMain+0xcd64>
 462fddc: 91370108     	add	x8, x8, #0xdc0
 462fde0: 90fe4f89     	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 462fde4: 91180129     	add	x9, x9, #0x600
 462fde8: a900a408     	stp	x8, x9, [x0, #0x8]
 462fdec: d0fef968     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 462fdf0: 912c0108     	add	x8, x8, #0xb00
 462fdf4: f9000c08     	str	x8, [x0, #0x18]
 462fdf8: 52800128     	mov	w8, #0x9                ; =9
 462fdfc: b90002c8     	str	w8, [x22]
 462fe00: aa1703e0     	mov	x0, x23
 462fe04: 52800121     	mov	w1, #0x9                ; =9
 462fe08: 97ad81be     	bl	0x3190500 <_ChromeMain+0x318b264>
 462fe0c: aa0003f7     	mov	x23, x0
 462fe10: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462fe14: f9404729     	ldr	x9, [x25, #0x88]
 462fe18: eb09011f     	cmp	x8, x9
 462fe1c: 54000061     	b.ne	0x462fe28 <_ChromeMain+0x462ab8c>
 462fe20: aa1703e0     	mov	x0, x23
 462fe24: 96e79136     	bl	0x142fc <_ChromeMain+0xf060>
 462fe28: a900fed7     	stp	x23, xzr, [x22, #0x8]
 462fe2c: f949c260     	ldr	x0, [x19, #0x1380]
 462fe30: f909c276     	str	x22, [x19, #0x1380]
 462fe34: b4000080     	cbz	x0, 0x462fe44 <_ChromeMain+0x462aba8>
 462fe38: 978a2c39     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 462fe3c: 52800301     	mov	w1, #0x18               ; =24
 462fe40: 96e7641e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462fe44: 2d5106a0     	ldp	s0, s1, [x21, #0x88]
 462fe48: 1e254000     	frintm	s0, s0
 462fe4c: 0f0665e2     	movi.2s	v2, #0xcf, lsl #24
 462fe50: 1e222000     	fcmp	s0, s2
 462fe54: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 462fe58: 1a88b3e9     	csel	w9, wzr, w8, lt
 462fe5c: 1e226803     	fmaxnm	s3, s0, s2
 462fe60: 1e38006a     	fcvtzs	w10, s3
 462fe64: 12b6200b     	mov	w11, #0x4effffff        ; =1325400063
 462fe68: 1e270163     	fmov	s3, w11
 462fe6c: 1e232000     	fcmp	s0, s3
 462fe70: 1a899149     	csel	w9, w10, w9, ls
 462fe74: 1e254020     	frintm	s0, s1
 462fe78: 1e222000     	fcmp	s0, s2
 462fe7c: 1a88b3e8     	csel	w8, wzr, w8, lt
 462fe80: 1e226801     	fmaxnm	s1, s0, s2
 462fe84: 1e38002a     	fcvtzs	w10, s1
 462fe88: 1e232000     	fcmp	s0, s3
 462fe8c: 1a889148     	csel	w8, w10, w8, ls
 462fe90: aa088128     	orr	x8, x9, x8, lsl #32
 462fe94: f81b83a8     	stur	x8, [x29, #-0x48]
 462fe98: d10123a1     	sub	x1, x29, #0x48
 462fe9c: aa1403e0     	mov	x0, x20
 462fea0: 9773cec5     	bl	0x23239b4 <_ChromeMain+0x231e718>
 462fea4: f949c274     	ldr	x20, [x19, #0x1380]
 462fea8: f9400268     	ldr	x8, [x19]
 462feac: f9403108     	ldr	x8, [x8, #0x60]
 462feb0: eb1a011f     	cmp	x8, x26
 462feb4: 54000ae1     	b.ne	0x4630010 <_ChromeMain+0x462ad74>
 462feb8: f940c275     	ldr	x21, [x19, #0x180]
 462febc: f85b83a8     	ldur	x8, [x29, #-0x48]
 462fec0: a904ffe8     	stp	x8, xzr, [sp, #0x48]
 462fec4: 52800100     	mov	w0, #0x8                ; =8
 462fec8: 96e77d28     	bl	0xf368 <_ChromeMain+0xa0cc>
 462fecc: f900001f     	str	xzr, [x0]
 462fed0: f90023e0     	str	x0, [sp, #0x40]
 462fed4: 3900b3ff     	strb	wzr, [sp, #0x2c]
 462fed8: 3900f3ff     	strb	wzr, [sp, #0x3c]
 462fedc: 390023ff     	strb	wzr, [sp, #0x8]
 462fee0: 390083ff     	strb	wzr, [sp, #0x20]
 462fee4: 910023e8     	add	x8, sp, #0x8
 462fee8: f90003e8     	str	x8, [sp]
 462feec: 910123e3     	add	x3, sp, #0x48
 462fef0: 910103e6     	add	x6, sp, #0x40
 462fef4: 9100b3e7     	add	x7, sp, #0x2c
 462fef8: aa1403e0     	mov	x0, x20
 462fefc: aa1503e1     	mov	x1, x21
 462ff00: d2800002     	mov	x2, #0x0                ; =0
 462ff04: 52800004     	mov	w4, #0x0                ; =0
 462ff08: 52800025     	mov	w5, #0x1                ; =1
 462ff0c: 9581a9c3     	bl	0xa69a618 <_ChromeMain+0xa69537c>
 462ff10: 394083e8     	ldrb	w8, [sp, #0x20]
 462ff14: 340000e8     	cbz	w8, 0x462ff30 <_ChromeMain+0x462ac94>
 462ff18: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 462ff1c: 36f800a8     	tbz	w8, #0x1f, 0x462ff30 <_ChromeMain+0x462ac94>
 462ff20: f94007e0     	ldr	x0, [sp, #0x8]
 462ff24: f9400fe8     	ldr	x8, [sp, #0x18]
 462ff28: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462ff2c: 96e763e3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ff30: f94023f4     	ldr	x20, [sp, #0x40]
 462ff34: f90023ff     	str	xzr, [sp, #0x40]
 462ff38: b40000d4     	cbz	x20, 0x462ff50 <_ChromeMain+0x462acb4>
 462ff3c: aa1403e0     	mov	x0, x20
 462ff40: 9500f076     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 462ff44: aa1403e0     	mov	x0, x20
 462ff48: 52800101     	mov	w1, #0x8                ; =8
 462ff4c: 96e763db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ff50: f949c268     	ldr	x8, [x19, #0x1380]
 462ff54: b4000488     	cbz	x8, 0x462ffe4 <_ChromeMain+0x462ad48>
 462ff58: f9400500     	ldr	x0, [x8, #0x8]
 462ff5c: f9400008     	ldr	x8, [x0]
 462ff60: f9400108     	ldr	x8, [x8]
 462ff64: d63f0100     	blr	x8
 462ff68: 370003e0     	tbnz	w0, #0x0, 0x462ffe4 <_ChromeMain+0x462ad48>
 462ff6c: f949d674     	ldr	x20, [x19, #0x13a8]
 462ff70: b40003b4     	cbz	x20, 0x462ffe4 <_ChromeMain+0x462ad48>
 462ff74: f9400680     	ldr	x0, [x20, #0x8]
 462ff78: b40000c0     	cbz	x0, 0x462ff90 <_ChromeMain+0x462acf4>
 462ff7c: 3944bc08     	ldrb	w8, [x0, #0x12f]
 462ff80: f9409009     	ldr	x9, [x0, #0x120]
 462ff84: 7219011f     	tst	w8, #0x80
 462ff88: 9a881128     	csel	x8, x9, x8, ne
 462ff8c: b4000528     	cbz	x8, 0x4630030 <_ChromeMain+0x462ad94>
 462ff90: f909d67f     	str	xzr, [x19, #0x13a8]
 462ff94: b004e928     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 462ff98: 9127e108     	add	x8, x8, #0x9f8
 462ff9c: f9000288     	str	x8, [x20]
 462ffa0: 91008280     	add	x0, x20, #0x20
 462ffa4: 973c84b9     	bl	0x1551288 <_ChromeMain+0x154bfec>
 462ffa8: f9400a80     	ldr	x0, [x20, #0x10]
 462ffac: b5000500     	cbnz	x0, 0x463004c <_ChromeMain+0x462adb0>
 462ffb0: f9400680     	ldr	x0, [x20, #0x8]
 462ffb4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 462ffb8: f9404729     	ldr	x9, [x25, #0x88]
 462ffbc: eb09011f     	cmp	x8, x9
 462ffc0: 54000041     	b.ne	0x462ffc8 <_ChromeMain+0x462ad2c>
 462ffc4: 96e7ca9e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 462ffc8: aa1403e0     	mov	x0, x20
 462ffcc: 52800601     	mov	w1, #0x30               ; =48
 462ffd0: 96e763ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 462ffd4: 39cf1f08     	ldrsb	w8, [x24, #0x3c7]
 462ffd8: 37f80148     	tbnz	w8, #0x1f, 0x4630000 <_ChromeMain+0x462ad64>
 462ffdc: 7927627f     	strh	wzr, [x19, #0x13b0]
 462ffe0: 390f1f1f     	strb	wzr, [x24, #0x3c7]
 462ffe4: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 462ffe8: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 462ffec: a94857f6     	ldp	x22, x21, [sp, #0x80]
 462fff0: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 462fff4: a94667fa     	ldp	x26, x25, [sp, #0x60]
 462fff8: 9102c3ff     	add	sp, sp, #0xb0
 462fffc: d65f03c0     	ret
 4630000: f949da68     	ldr	x8, [x19, #0x13b0]
 4630004: 7900011f     	strh	wzr, [x8]
 4630008: f909de7f     	str	xzr, [x19, #0x13b8]
 463000c: 17fffff6     	b	0x462ffe4 <_ChromeMain+0x462ad48>
 4630010: 90fe0009     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4630014: 9120c129     	add	x9, x9, #0x830
 4630018: eb09011f     	cmp	x8, x9
 463001c: 54fff4e0     	b.eq	0x462feb8 <_ChromeMain+0x462ac1c>
 4630020: aa1303e0     	mov	x0, x19
 4630024: d63f0100     	blr	x8
 4630028: aa0003f5     	mov	x21, x0
 463002c: 17ffffa4     	b	0x462febc <_ChromeMain+0x462ac20>
 4630030: 52827608     	mov	w8, #0x13b0             ; =5040
 4630034: 8b080261     	add	x1, x19, x8
 4630038: 97085a43     	bl	0x846944 <_ChromeMain+0x8416a8>
 463003c: f949d674     	ldr	x20, [x19, #0x13a8]
 4630040: f909d67f     	str	xzr, [x19, #0x13a8]
 4630044: b5fffa94     	cbnz	x20, 0x462ff94 <_ChromeMain+0x462acf8>
 4630048: 17ffffe3     	b	0x462ffd4 <_ChromeMain+0x462ad38>
 463004c: 12800008     	mov	w8, #-0x1               ; =-1
 4630050: b8e80008     	ldaddal	w8, w8, [x0]
 4630054: 7100051f     	cmp	w8, #0x1
 4630058: 54fffac1     	b.ne	0x462ffb0 <_ChromeMain+0x462ad14>
 463005c: f9400808     	ldr	x8, [x0, #0x10]
 4630060: d63f0100     	blr	x8
 4630064: 17ffffd3     	b	0x462ffb0 <_ChromeMain+0x462ad14>
 4630068: 90fe0009     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 463006c: 9120c129     	add	x9, x9, #0x830
 4630070: eb09011f     	cmp	x8, x9
 4630074: 54ffd840     	b.eq	0x462fb7c <_ChromeMain+0x462a8e0>
 4630078: aa1303e0     	mov	x0, x19
 463007c: d63f0100     	blr	x8
 4630080: b5ffd820     	cbnz	x0, 0x462fb84 <_ChromeMain+0x462a8e8>
 4630084: 17ffffd8     	b	0x462ffe4 <_ChromeMain+0x462ad48>
 4630088: d4200020     	brk	#0x1
 463008c: d4200000     	brk	#0
 4630090: d4400000     	hlt	#0
 4630094: 17fffffd     	b	0x4630088 <_ChromeMain+0x462adec>
