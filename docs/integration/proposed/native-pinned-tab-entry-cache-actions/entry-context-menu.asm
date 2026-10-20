
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460abe4: f941b668     	ldr	x8, [x19, #0x368]
 460abe8: eb0802df     	cmp	x22, x8
 460abec: 54001442     	b.hs	0x460ae74 <_ChromeMain+0x4605bd8>
 460abf0: f941b268     	ldr	x8, [x19, #0x360]
 460abf4: 52804d09     	mov	w9, #0x268              ; =616
 460abf8: 9b0922c8     	madd	x8, x22, x9, x8
 460abfc: 39425109     	ldrb	w9, [x8, #0x94]
 460ac00: 34000269     	cbz	w9, 0x460ac4c <_ChromeMain+0x46059b0>
 460ac04: f941ae75     	ldr	x21, [x19, #0x358]
 460ac08: b4fffaf5     	cbz	x21, 0x460ab64 <_ChromeMain+0x46058c8>
 460ac0c: f941a669     	ldr	x9, [x19, #0x348]
 460ac10: b4fffaa9     	cbz	x9, 0x460ab64 <_ChromeMain+0x46058c8>
 460ac14: b9409101     	ldr	w1, [x8, #0x90]
 460ac18: 37fffa61     	tbnz	w1, #0x1f, 0x460ab64 <_ChromeMain+0x46058c8>
 460ac1c: f9400120     	ldr	x0, [x9]
 460ac20: b9401808     	ldr	w8, [x0, #0x18]
 460ac24: 6b08003f     	cmp	w1, w8
 460ac28: 54fff9ea     	b.ge	0x460ab64 <_ChromeMain+0x46058c8>
 460ac2c: 97294db3     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 460ac30: aa0003e1     	mov	x1, x0
 460ac34: 910023e3     	add	x3, sp, #0x8
 460ac38: aa1503e0     	mov	x0, x21
 460ac3c: aa1403e2     	mov	x2, x20
 460ac40: 52800024     	mov	w4, #0x1                ; =1
 460ac44: 97ec6753     	bl	0x4124990 <_ChromeMain+0x411f6f4>
 460ac48: 17ffffc7     	b	0x460ab64 <_ChromeMain+0x46058c8>
 460ac4c: f941a268     	ldr	x8, [x19, #0x340]
 460ac50: b4fff8a8     	cbz	x8, 0x460ab64 <_ChromeMain+0x46058c8>
 460ac54: f9400268     	ldr	x8, [x19]
 460ac58: f9403508     	ldr	x8, [x8, #0x68]
 460ac5c: aa1303e0     	mov	x0, x19
 460ac60: d63f0100     	blr	x8
 460ac64: b4fff800     	cbz	x0, 0x460ab64 <_ChromeMain+0x46058c8>
 460ac68: f941b668     	ldr	x8, [x19, #0x368]
 460ac6c: eb0802df     	cmp	x22, x8
 460ac70: 54001022     	b.hs	0x460ae74 <_ChromeMain+0x4605bd8>
 460ac74: f941b268     	ldr	x8, [x19, #0x360]
 460ac78: 52804d09     	mov	w9, #0x268              ; =616
 460ac7c: 9b0922c1     	madd	x1, x22, x9, x8
 460ac80: 91124260     	add	x0, x19, #0x490
 460ac84: 96fb0322     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 460ac88: 52800800     	mov	w0, #0x40               ; =64
 460ac8c: 96e811b7     	bl	0xf368 <_ChromeMain+0xa0cc>
 460ac90: aa0003f4     	mov	x20, x0
 460ac94: 910ce268     	add	x8, x19, #0x338
 460ac98: f100027f     	cmp	x19, #0x0
 460ac9c: 9a8803f5     	csel	x21, xzr, x8, eq
 460aca0: d004e6e8     	adrp	x8, 0xe2e8000 <dyld_stub_binder+0xe2e8000>
 460aca4: 912da108     	add	x8, x8, #0xb68
 460aca8: a9007c08     	stp	x8, xzr, [x0]
 460acac: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 460acb0: f900081f     	str	xzr, [x0, #0x10]
 460acb4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 460acb8: 90052d56     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 460acbc: f94046c9     	ldr	x9, [x22, #0x88]
 460acc0: eb09011f     	cmp	x8, x9
 460acc4: 54000061     	b.ne	0x460acd0 <_ChromeMain+0x4605a34>
 460acc8: aa1503e0     	mov	x0, x21
 460accc: 96e8258c     	bl	0x142fc <_ChromeMain+0xf060>
 460acd0: f9001695     	str	x21, [x20, #0x28]
 460acd4: 52800100     	mov	w0, #0x8                ; =8
 460acd8: 96e811a4     	bl	0xf368 <_ChromeMain+0xa0cc>
 460acdc: b900001f     	str	wzr, [x0]
 460ace0: 3900101f     	strb	wzr, [x0, #0x4]
 460ace4: b40000c0     	cbz	x0, 0x460acfc <_ChromeMain+0x4605a60>
 460ace8: 52800028     	mov	w8, #0x1                ; =1
 460acec: b8280008     	ldadd	w8, w8, [x0]
 460acf0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460acf4: 6b09011f     	cmp	w8, w9
 460acf8: 54000c60     	b.eq	0x460ae84 <_ChromeMain+0x4605be8>
 460acfc: a9035280     	stp	x0, x20, [x20, #0x30]
 460ad00: f9423660     	ldr	x0, [x19, #0x468]
 460ad04: f9023674     	str	x20, [x19, #0x468]
 460ad08: b40000a0     	cbz	x0, 0x460ad1c <_ChromeMain+0x4605a80>
 460ad0c: f9400008     	ldr	x8, [x0]
 460ad10: f9400508     	ldr	x8, [x8, #0x8]
 460ad14: d63f0100     	blr	x8
 460ad18: f9423674     	ldr	x20, [x19, #0x468]
 460ad1c: b0054828     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 460ad20: f946f500     	ldr	x0, [x8, #0xde8]
 460ad24: b4000aa0     	cbz	x0, 0x460ae78 <_ChromeMain+0x4605bdc>
 460ad28: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 460ad2c: f90013ff     	str	xzr, [sp, #0x20]
 460ad30: 910043e8     	add	x8, sp, #0x10
 460ad34: 5285b801     	mov	w1, #0x2dc0             ; =11712
 460ad38: 9732a669     	bl	0x12b46dc <_ChromeMain+0x12af440>
 460ad3c: 910043e2     	add	x2, sp, #0x10
 460ad40: aa1403e0     	mov	x0, x20
 460ad44: 52800021     	mov	w1, #0x1                ; =1
 460ad48: 97466a70     	bl	0x17a5708 <_ChromeMain+0x17a046c>
 460ad4c: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 460ad50: 36f800a8     	tbz	w8, #0x1f, 0x460ad64 <_ChromeMain+0x4605ac8>
 460ad54: f9400be0     	ldr	x0, [sp, #0x10]
 460ad58: f94013e8     	ldr	x8, [sp, #0x20]
 460ad5c: d37ff901     	lsl	x1, x8, #1
 460ad60: 96e7f856     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460ad64: f9423675     	ldr	x21, [x19, #0x468]
 460ad68: 52800300     	mov	w0, #0x18               ; =24
 460ad6c: 96e8117f     	bl	0xf368 <_ChromeMain+0xa0cc>
 460ad70: aa0003f4     	mov	x20, x0
 460ad74: 52800128     	mov	w8, #0x9                ; =9
 460ad78: b9000008     	str	w8, [x0]
 460ad7c: aa1503e0     	mov	x0, x21
 460ad80: 52800121     	mov	w1, #0x9                ; =9
 460ad84: d2800002     	mov	x2, #0x0                ; =0
 460ad88: 97ae15de     	bl	0x3190500 <_ChromeMain+0x318b264>
 460ad8c: aa0003f5     	mov	x21, x0
 460ad90: 925e7408     	and	x8, x0, #0xfffffffc00000000
 460ad94: f94046c9     	ldr	x9, [x22, #0x88]
 460ad98: eb09011f     	cmp	x8, x9
 460ad9c: 54000061     	b.ne	0x460ada8 <_ChromeMain+0x4605b0c>
 460ada0: aa1503e0     	mov	x0, x21
 460ada4: 96e82556     	bl	0x142fc <_ChromeMain+0xf060>
 460ada8: a900fe95     	stp	x21, xzr, [x20, #0x8]
 460adac: f9423a60     	ldr	x0, [x19, #0x470]
 460adb0: f9023a74     	str	x20, [x19, #0x470]
 460adb4: b40000a0     	cbz	x0, 0x460adc8 <_ChromeMain+0x4605b2c>
 460adb8: 978ac059     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 460adbc: 52800301     	mov	w1, #0x18               ; =24
 460adc0: 96e7f83e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460adc4: f9423a74     	ldr	x20, [x19, #0x470]
 460adc8: f9400268     	ldr	x8, [x19]
 460adcc: f9403508     	ldr	x8, [x8, #0x68]
 460add0: aa1303e0     	mov	x0, x19
 460add4: d63f0100     	blr	x8
 460add8: aa0003f3     	mov	x19, x0
 460addc: f94007e8     	ldr	x8, [sp, #0x8]
 460ade0: a93d7fa8     	stp	x8, xzr, [x29, #-0x30]
 460ade4: 52800100     	mov	w0, #0x8                ; =8
 460ade8: 96e81160     	bl	0xf368 <_ChromeMain+0xa0cc>
 460adec: f900001f     	str	xzr, [x0]
 460adf0: f81c83a0     	stur	x0, [x29, #-0x38]
 460adf4: 3900d3ff     	strb	wzr, [sp, #0x34]
 460adf8: 390113ff     	strb	wzr, [sp, #0x44]
 460adfc: 390043ff     	strb	wzr, [sp, #0x10]
 460ae00: 3900a3ff     	strb	wzr, [sp, #0x28]
 460ae04: 910043e8     	add	x8, sp, #0x10
 460ae08: f90003e8     	str	x8, [sp]
 460ae0c: d100c3a3     	sub	x3, x29, #0x30
 460ae10: d100e3a6     	sub	x6, x29, #0x38
 460ae14: 9100d3e7     	add	x7, sp, #0x34
 460ae18: aa1403e0     	mov	x0, x20
 460ae1c: aa1303e1     	mov	x1, x19
 460ae20: d2800002     	mov	x2, #0x0                ; =0
 460ae24: 52800004     	mov	w4, #0x0                ; =0
 460ae28: 52800025     	mov	w5, #0x1                ; =1
 460ae2c: 95823dfb     	bl	0xa69a618 <_ChromeMain+0xa69537c>
 460ae30: 3940a3e8     	ldrb	w8, [sp, #0x28]
 460ae34: 340000e8     	cbz	w8, 0x460ae50 <_ChromeMain+0x4605bb4>
 460ae38: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 460ae3c: 36f800a8     	tbz	w8, #0x1f, 0x460ae50 <_ChromeMain+0x4605bb4>
 460ae40: f9400be0     	ldr	x0, [sp, #0x10]
 460ae44: f94013e8     	ldr	x8, [sp, #0x20]
 460ae48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 460ae4c: 96e7f81b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460ae50: f85c83b3     	ldur	x19, [x29, #-0x38]
 460ae54: f81c83bf     	stur	xzr, [x29, #-0x38]
 460ae58: b4ffe873     	cbz	x19, 0x460ab64 <_ChromeMain+0x46058c8>
 460ae5c: aa1303e0     	mov	x0, x19
 460ae60: 950184ae     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 460ae64: aa1303e0     	mov	x0, x19
 460ae68: 52800101     	mov	w1, #0x8                ; =8
 460ae6c: 96e7f813     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 460ae70: 17ffff3d     	b	0x460ab64 <_ChromeMain+0x46058c8>
 460ae74: d4200020     	brk	#0x1
 460ae78: d4200000     	brk	#0
 460ae7c: d4400000     	hlt	#0
 460ae80: d4200020     	brk	#0x1
 460ae84: d4200000     	brk	#0
 460ae88: d4400000     	hlt	#0
 460ae8c: d4200020     	brk	#0x1
