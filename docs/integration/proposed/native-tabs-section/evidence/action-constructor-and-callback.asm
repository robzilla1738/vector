
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 466afb0: d10343ff     	sub	sp, sp, #0xd0
 466afb4: a90867fa     	stp	x26, x25, [sp, #0x80]
 466afb8: a9095ff8     	stp	x24, x23, [sp, #0x90]
 466afbc: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 466afc0: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 466afc4: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 466afc8: 910303fd     	add	x29, sp, #0xc0
 466afcc: aa0303f4     	mov	x20, x3
 466afd0: aa0203f7     	mov	x23, x2
 466afd4: aa0103f6     	mov	x22, x1
 466afd8: aa0003f3     	mov	x19, x0
 466afdc: f00505f9     	adrp	x25, 0xe729000 <dyld_stub_binder+0xe729000>
 466afe0: 91054339     	add	x25, x25, #0x150
 466afe4: 91118328     	add	x8, x25, #0x460
 466afe8: a9002019     	stp	x25, x8, [x0]
 466afec: 91122328     	add	x8, x25, #0x488
 466aff0: f9000808     	str	x8, [x0, #0x10]
 466aff4: 91130328     	add	x8, x25, #0x4c0
 466aff8: 9113c329     	add	x9, x25, #0x4f0
 466affc: a906a408     	stp	x8, x9, [x0, #0x68]
 466b000: 91150328     	add	x8, x25, #0x540
 466b004: f9005808     	str	x8, [x0, #0xb0]
 466b008: 91168328     	add	x8, x25, #0x5a0
 466b00c: f9006c08     	str	x8, [x0, #0xd8]
 466b010: 91174328     	add	x8, x25, #0x5d0
 466b014: aa0003f5     	mov	x21, x0
 466b018: f80f8ea8     	str	x8, [x21, #0xf8]!
 466b01c: 9117e328     	add	x8, x25, #0x5f8
 466b020: f9018808     	str	x8, [x0, #0x310]
 466b024: 9119e328     	add	x8, x25, #0x678
 466b028: f9018c08     	str	x8, [x0, #0x318]
 466b02c: 911ce328     	add	x8, x25, #0x738
 466b030: f9019008     	str	x8, [x0, #0x320]
 466b034: 925e7408     	and	x8, x0, #0xfffffffc00000000
 466b038: f0052a38     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 466b03c: f9404709     	ldr	x9, [x24, #0x88]
 466b040: eb09011f     	cmp	x8, x9
 466b044: 54000061     	b.ne	0x466b050 <_ChromeMain+0x4665db4>
 466b048: aa1303e0     	mov	x0, x19
 466b04c: 96e6a4ac     	bl	0x142fc <_ChromeMain+0xf060>
 466b050: 52800700     	mov	w0, #0x38               ; =56
 466b054: 96e690c5     	bl	0xf368 <_ChromeMain+0xa0cc>
 466b058: 52800028     	mov	w8, #0x1                ; =1
 466b05c: b9000008     	str	w8, [x0]
 466b060: 90ffca48     	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 466b064: 91300108     	add	x8, x8, #0xc00
 466b068: d0ff9169     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 466b06c: 912d0129     	add	x9, x9, #0xb40
 466b070: a900a408     	stp	x8, x9, [x0, #0x8]
 466b074: d0fef788     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 466b078: 912c0108     	add	x8, x8, #0xb00
 466b07c: 10005149     	adr	x9, 0x466baa4 <_ChromeMain+0x4666808>
 466b080: d503201f     	nop
 466b084: a901a408     	stp	x8, x9, [x0, #0x18]
 466b088: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 466b08c: f9001fe0     	str	x0, [sp, #0x38]
 466b090: 52800048     	mov	w8, #0x2                ; =2
 466b094: 390103e8     	strb	w8, [sp, #0x40]
 466b098: 9100e3e1     	add	x1, sp, #0x38
 466b09c: aa1303e0     	mov	x0, x19
 466b0a0: 97340cf8     	bl	0x136e480 <_ChromeMain+0x13691e4>
 466b0a4: 394103e8     	ldrb	w8, [sp, #0x40]
 466b0a8: 7103fd1f     	cmp	w8, #0xff
 466b0ac: 54000060     	b.eq	0x466b0b8 <_ChromeMain+0x4665e1c>
 466b0b0: f9401fe0     	ldr	x0, [sp, #0x38]
 466b0b4: b5000a60     	cbnz	x0, 0x466b200 <_ChromeMain+0x4665f64>
 466b0b8: 52801fe8     	mov	w8, #0xff               ; =255
 466b0bc: 390103e8     	strb	w8, [sp, #0x40]
 466b0c0: 91118328     	add	x8, x25, #0x460
 466b0c4: a9002279     	stp	x25, x8, [x19]
 466b0c8: 91122328     	add	x8, x25, #0x488
 466b0cc: f9000a68     	str	x8, [x19, #0x10]
 466b0d0: 91130328     	add	x8, x25, #0x4c0
 466b0d4: 9113c329     	add	x9, x25, #0x4f0
 466b0d8: a906a668     	stp	x8, x9, [x19, #0x68]
 466b0dc: 91150328     	add	x8, x25, #0x540
 466b0e0: f9005a68     	str	x8, [x19, #0xb0]
 466b0e4: 91168328     	add	x8, x25, #0x5a0
 466b0e8: f9006e68     	str	x8, [x19, #0xd8]
 466b0ec: 91174328     	add	x8, x25, #0x5d0
 466b0f0: f9007e68     	str	x8, [x19, #0xf8]
 466b0f4: 9117e328     	add	x8, x25, #0x5f8
 466b0f8: f9018a68     	str	x8, [x19, #0x310]
 466b0fc: 9119e328     	add	x8, x25, #0x678
 466b100: f9018e68     	str	x8, [x19, #0x318]
 466b104: 911ce328     	add	x8, x25, #0x738
 466b108: f9019268     	str	x8, [x19, #0x320]
 466b10c: f9400ae8     	ldr	x8, [x23, #0x10]
 466b110: 3dc002e0     	ldr	q0, [x23]
 466b114: 3d812e60     	str	q0, [x19, #0x4b0]
 466b118: f9026268     	str	x8, [x19, #0x4c0]
 466b11c: a900feff     	stp	xzr, xzr, [x23, #0x8]
 466b120: f90002ff     	str	xzr, [x23]
 466b124: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 466b128: f9404709     	ldr	x9, [x24, #0x88]
 466b12c: eb09011f     	cmp	x8, x9
 466b130: 54000061     	b.ne	0x466b13c <_ChromeMain+0x4665ea0>
 466b134: aa1603e0     	mov	x0, x22
 466b138: 96e6a471     	bl	0x142fc <_ChromeMain+0xf060>
 466b13c: f9026676     	str	x22, [x19, #0x4c8]
 466b140: f9026a74     	str	x20, [x19, #0x4d0]
 466b144: 3913e27f     	strb	wzr, [x19, #0x4f8]
 466b148: f902827f     	str	xzr, [x19, #0x500]
 466b14c: f9026e7f     	str	xzr, [x19, #0x4d8]
 466b150: f902767f     	str	xzr, [x19, #0x4e8]
 466b154: f902727f     	str	xzr, [x19, #0x4e0]
 466b158: 3913c27f     	strb	wzr, [x19, #0x4f0]
 466b15c: 39518268     	ldrb	w8, [x19, #0x460]
 466b160: 340000a8     	cbz	w8, 0x466b174 <_ChromeMain+0x4665ed8>
 466b164: 3911827f     	strb	wzr, [x19, #0x460]
 466b168: 91118261     	add	x1, x19, #0x460
 466b16c: aa1503e0     	mov	x0, x21
 466b170: 9722f398     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b174: f9424268     	ldr	x8, [x19, #0x480]
 466b178: 52800036     	mov	w22, #0x1               ; =1
 466b17c: b9001916     	str	w22, [x8, #0x18]
 466b180: b9446668     	ldr	w8, [x19, #0x464]
 466b184: 7120011f     	cmp	w8, #0x800
 466b188: 540000e0     	b.eq	0x466b1a4 <_ChromeMain+0x4665f08>
 466b18c: 91119268     	add	x8, x19, #0x464
 466b190: 52810009     	mov	w9, #0x800              ; =2048
 466b194: b9000109     	str	w9, [x8]
 466b198: 91119261     	add	x1, x19, #0x464
 466b19c: aa1503e0     	mov	x0, x21
 466b1a0: 9722f38c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b1a4: 9112c274     	add	x20, x19, #0x4b0
 466b1a8: 39072e76     	strb	w22, [x19, #0x1cb]
 466b1ac: 3951a668     	ldrb	w8, [x19, #0x469]
 466b1b0: 340000a8     	cbz	w8, 0x466b1c4 <_ChromeMain+0x4665f28>
 466b1b4: 3911a67f     	strb	wzr, [x19, #0x469]
 466b1b8: 9111a661     	add	x1, x19, #0x469
 466b1bc: aa1503e0     	mov	x0, x21
 466b1c0: 9722f384     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b1c4: aa1303e0     	mov	x0, x19
 466b1c8: 52800021     	mov	w1, #0x1                ; =1
 466b1cc: 973b3184     	bl	0x15377dc <_ChromeMain+0x1532540>
 466b1d0: 9112c261     	add	x1, x19, #0x4b0
 466b1d4: aa1303e0     	mov	x0, x19
 466b1d8: 97076ddb     	bl	0x846944 <_ChromeMain+0x8416a8>
 466b1dc: f9416675     	ldr	x21, [x19, #0x2c8]
 466b1e0: b40001f5     	cbz	x21, 0x466b21c <_ChromeMain+0x4665f80>
 466b1e4: 39d31e68     	ldrsb	w8, [x19, #0x4c7]
 466b1e8: 37f80468     	tbnz	w8, #0x1f, 0x466b274 <_ChromeMain+0x4665fd8>
 466b1ec: 3dc00280     	ldr	q0, [x20]
 466b1f0: 3d800be0     	str	q0, [sp, #0x20]
 466b1f4: f9400a88     	ldr	x8, [x20, #0x10]
 466b1f8: f9001be8     	str	x8, [sp, #0x30]
 466b1fc: 14000022     	b	0x466b284 <_ChromeMain+0x4665fe8>
 466b200: 12800008     	mov	w8, #-0x1               ; =-1
 466b204: b8e80008     	ldaddal	w8, w8, [x0]
 466b208: 7100051f     	cmp	w8, #0x1
 466b20c: 54fff561     	b.ne	0x466b0b8 <_ChromeMain+0x4665e1c>
 466b210: f9400808     	ldr	x8, [x0, #0x10]
 466b214: d63f0100     	blr	x8
 466b218: 17ffffa8     	b	0x466b0b8 <_ChromeMain+0x4665e1c>
 466b21c: 9721ebb9     	bl	0xee6100 <_ChromeMain+0xee0e64>
 466b220: 35004360     	cbnz	w0, 0x466ba8c <_ChromeMain+0x46667f0>
 466b224: aa1303e0     	mov	x0, x19
 466b228: 9731cd0b     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 466b22c: aa0003f5     	mov	x21, x0
 466b230: f9416660     	ldr	x0, [x19, #0x2c8]
 466b234: f9016675     	str	x21, [x19, #0x2c8]
 466b238: b4fffd60     	cbz	x0, 0x466b1e4 <_ChromeMain+0x4665f48>
 466b23c: 1400020f     	b	0x466ba78 <_ChromeMain+0x46667dc>
 466b240: d2800048     	mov	x8, #0x2                ; =2
 466b244: f2c000c8     	movk	x8, #0x6, lsl #32
 466b248: 4e080d00     	dup.2d	v0, x8
 466b24c: 3c8f82a0     	stur	q0, [x21, #0xf8]
 466b250: aa1503e0     	mov	x0, x21
 466b254: 52800021     	mov	w1, #0x1                ; =1
 466b258: 974fe816     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 466b25c: 1400002f     	b	0x466b318 <_ChromeMain+0x466607c>
 466b260: b900f2bf     	str	wzr, [x21, #0xf0]
 466b264: aa1503e0     	mov	x0, x21
 466b268: 52800021     	mov	w1, #0x1                ; =1
 466b26c: 974fe811     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 466b270: 14000017     	b	0x466b2cc <_ChromeMain+0x4666030>
 466b274: f9425a61     	ldr	x1, [x19, #0x4b0]
 466b278: f9425e62     	ldr	x2, [x19, #0x4b8]
 466b27c: 910083e0     	add	x0, sp, #0x20
 466b280: 96e76e54     	bl	0x46bd0 <_ChromeMain+0x41934>
 466b284: 910083e1     	add	x1, sp, #0x20
 466b288: aa1503e0     	mov	x0, x21
 466b28c: 972c0993     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 466b290: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 466b294: 36f800a8     	tbz	w8, #0x1f, 0x466b2a8 <_ChromeMain+0x466600c>
 466b298: f94013e0     	ldr	x0, [sp, #0x20]
 466b29c: f9401be8     	ldr	x8, [sp, #0x30]
 466b2a0: d37ff901     	lsl	x1, x8, #1
 466b2a4: 96e67705     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466b2a8: 52802800     	mov	w0, #0x140              ; =320
 466b2ac: 96e6902f     	bl	0xf368 <_ChromeMain+0xa0cc>
 466b2b0: aa0003f5     	mov	x21, x0
 466b2b4: 978e94c7     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 466b2b8: aa1303e0     	mov	x0, x19
 466b2bc: aa1503e1     	mov	x1, x21
 466b2c0: 9754795e     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 466b2c4: b940f2a8     	ldr	w8, [x21, #0xf0]
 466b2c8: 35fffcc8     	cbnz	w8, 0x466b260 <_ChromeMain+0x4665fc4>
 466b2cc: 52800028     	mov	w8, #0x1                ; =1
 466b2d0: b90053e8     	str	w8, [sp, #0x50]
 466b2d4: d0051cc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 466b2d8: 9115a021     	add	x1, x1, #0x568
 466b2dc: 910462a0     	add	x0, x21, #0x118
 466b2e0: 910143e2     	add	x2, sp, #0x50
 466b2e4: 974fe7b0     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 466b2e8: b940faa8     	ldr	w8, [x21, #0xf8]
 466b2ec: 7100091f     	cmp	w8, #0x2
 466b2f0: 54fffa81     	b.ne	0x466b240 <_ChromeMain+0x4665fa4>
 466b2f4: b940fea8     	ldr	w8, [x21, #0xfc]
 466b2f8: 7100191f     	cmp	w8, #0x6
 466b2fc: 54fffa21     	b.ne	0x466b240 <_ChromeMain+0x4665fa4>
 466b300: b94102a8     	ldr	w8, [x21, #0x100]
 466b304: 7100091f     	cmp	w8, #0x2
 466b308: 54fff9c1     	b.ne	0x466b240 <_ChromeMain+0x4665fa4>
 466b30c: b94106a8     	ldr	w8, [x21, #0x104]
 466b310: 7100191f     	cmp	w8, #0x6
 466b314: 54fff961     	b.ne	0x466b240 <_ChromeMain+0x4665fa4>
 466b318: 3943d2a8     	ldrb	w8, [x21, #0xf4]
 466b31c: 370000c8     	tbnz	w8, #0x0, 0x466b334 <_ChromeMain+0x4666098>
 466b320: 52800028     	mov	w8, #0x1                ; =1
 466b324: 3903d2a8     	strb	w8, [x21, #0xf4]
 466b328: aa1503e0     	mov	x0, x21
 466b32c: 52800021     	mov	w1, #0x1                ; =1
 466b330: 974fe7e0     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 466b334: f00544f7     	adrp	x23, 0xef0a000 <dyld_stub_binder+0xef0a000>
 466b338: 911202f7     	add	x23, x23, #0x480
 466b33c: f8bfc2e0     	ldapr	x0, [x23]
 466b340: b4003380     	cbz	x0, 0x466b9b0 <_ChromeMain+0x4666714>
 466b344: 52807001     	mov	w1, #0x380              ; =896
 466b348: d2800002     	mov	x2, #0x0                ; =0
 466b34c: 96e90099     	bl	0xab5b0 <_ChromeMain+0xa6314>
 466b350: aa0003f5     	mov	x21, x0
 466b354: 977707b9     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 466b358: f0050228     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 466b35c: 912f4108     	add	x8, x8, #0xbd0
 466b360: 910fc109     	add	x9, x8, #0x3f0
 466b364: a9002408     	stp	x8, x9, [x0]
 466b368: 91106109     	add	x9, x8, #0x418
 466b36c: f9000809     	str	x9, [x0, #0x10]
 466b370: 91114109     	add	x9, x8, #0x450
 466b374: 9112010a     	add	x10, x8, #0x480
 466b378: a906a809     	stp	x9, x10, [x0, #0x68]
 466b37c: 91134109     	add	x9, x8, #0x4d0
 466b380: f9005809     	str	x9, [x0, #0xb0]
 466b384: 91158109     	add	x9, x8, #0x560
 466b388: aa0003f6     	mov	x22, x0
 466b38c: f80f8ec9     	str	x9, [x22, #0xf8]!
 466b390: 9114c108     	add	x8, x8, #0x530
 466b394: f9006c08     	str	x8, [x0, #0xd8]
 466b398: f901a41f     	str	xzr, [x0, #0x348]
 466b39c: 2f06e400     	movi	d0, #0xffff000000000000
 466b3a0: fd01a800     	str	d0, [x0, #0x350]
 466b3a4: 52800028     	mov	w8, #0x1                ; =1
 466b3a8: 390d6008     	strb	w8, [x0, #0x358]
 466b3ac: f901b01f     	str	xzr, [x0, #0x360]
 466b3b0: 390da01f     	strb	wzr, [x0, #0x368]
 466b3b4: f901b81f     	str	xzr, [x0, #0x370]
 466b3b8: b903781f     	str	wzr, [x0, #0x378]
 466b3bc: 390df01f     	strb	wzr, [x0, #0x37c]
 466b3c0: 3945a408     	ldrb	w8, [x0, #0x169]
 466b3c4: 35002f08     	cbnz	w8, 0x466b9a4 <_ChromeMain+0x4666708>
 466b3c8: 91136279     	add	x25, x19, #0x4d8
 466b3cc: f940ce62     	ldr	x2, [x19, #0x198]
 466b3d0: aa1303e0     	mov	x0, x19
 466b3d4: aa1503e1     	mov	x1, x21
 466b3d8: 97043809     	bl	0x7793fc <_ChromeMain+0x774160>
 466b3dc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 466b3e0: f9404709     	ldr	x9, [x24, #0x88]
 466b3e4: eb09011f     	cmp	x8, x9
 466b3e8: 54000061     	b.ne	0x466b3f4 <_ChromeMain+0x4666158>
 466b3ec: aa1503e0     	mov	x0, x21
 466b3f0: 96e6a3c3     	bl	0x142fc <_ChromeMain+0xf060>
 466b3f4: f9400320     	ldr	x0, [x25]
 466b3f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 466b3fc: f9404709     	ldr	x9, [x24, #0x88]
 466b400: eb09011f     	cmp	x8, x9
 466b404: 54000041     	b.ne	0x466b40c <_ChromeMain+0x4666170>
 466b408: 96e6dd8d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 466b40c: f9000335     	str	x21, [x25]
 466b410: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 466b414: 340000c8     	cbz	w8, 0x466b42c <_ChromeMain+0x4666190>
 466b418: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 466b41c: 9106a6a1     	add	x1, x21, #0x1a9
 466b420: aa1603e0     	mov	x0, x22
 466b424: 9722f2eb     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b428: f9400335     	ldr	x21, [x25]
 466b42c: 910c42a8     	add	x8, x21, #0x310
 466b430: 394c62a9     	ldrb	w9, [x21, #0x318]
 466b434: 35002ca9     	cbnz	w9, 0x466b9c8 <_ChromeMain+0x466672c>
 466b438: b4002ba8     	cbz	x8, 0x466b9ac <_ChromeMain+0x4666710>
 466b43c: b21e07e8     	mov	x8, #0xc0000000c        ; =51539607564
 466b440: f9018aa8     	str	x8, [x21, #0x310]
 466b444: 52800028     	mov	w8, #0x1                ; =1
 466b448: 390c62a8     	strb	w8, [x21, #0x318]
 466b44c: f940c6a0     	ldr	x0, [x21, #0x188]
 466b450: b40000a0     	cbz	x0, 0x466b464 <_ChromeMain+0x46661c8>
 466b454: f9400008     	ldr	x8, [x0]
 466b458: f9417d08     	ldr	x8, [x8, #0x2f8]
 466b45c: aa1503e1     	mov	x1, x21
 466b460: d63f0100     	blr	x8
 466b464: aa1503e0     	mov	x0, x21
 466b468: 52800001     	mov	w1, #0x0                ; =0
 466b46c: 96ff1402     	bl	0x630474 <_ChromeMain+0x62b1d8>
 466b470: f9002bf5     	str	x21, [sp, #0x50]
 466b474: 9104c2a0     	add	x0, x21, #0x130
 466b478: 910143e3     	add	x3, sp, #0x50
 466b47c: 52800301     	mov	w1, #0x18               ; =24
 466b480: 52800022     	mov	w2, #0x1                ; =1
 466b484: 9708ef53     	bl	0x8a71d0 <_ChromeMain+0x8a1f34>
 466b488: aa1503e0     	mov	x0, x21
 466b48c: 972fad97     	bl	0x1256ae8 <_ChromeMain+0x125184c>
 466b490: f9400320     	ldr	x0, [x25]
 466b494: b21e07e1     	mov	x1, #0xc0000000c        ; =51539607564
 466b498: 52800022     	mov	w2, #0x1                ; =1
 466b49c: 97859971     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 466b4a0: f9400328     	ldr	x8, [x25]
 466b4a4: b004c6a9     	adrp	x9, 0xdf40000 <dyld_stub_binder+0xdf40000>
 466b4a8: 3dc2a520     	ldr	q0, [x9, #0xa90]
 466b4ac: 3d8003e0     	str	q0, [sp]
 466b4b0: 3d8017e0     	str	q0, [sp, #0x50]
 466b4b4: d0051cc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 466b4b8: 91122021     	add	x1, x1, #0x488
 466b4bc: 91036100     	add	x0, x8, #0xd8
 466b4c0: 910143e2     	add	x2, sp, #0x50
 466b4c4: 97520a67     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 466b4c8: f8bfc2e0     	ldapr	x0, [x23]
 466b4cc: b4002760     	cbz	x0, 0x466b9b8 <_ChromeMain+0x466671c>
 466b4d0: 52807301     	mov	w1, #0x398              ; =920
 466b4d4: d2800002     	mov	x2, #0x0                ; =0
 466b4d8: 96e90036     	bl	0xab5b0 <_ChromeMain+0xa6314>
 466b4dc: aa0003f5     	mov	x21, x0
 466b4e0: 52800181     	mov	w1, #0xc                ; =12
 466b4e4: 95817216     	bl	0xa6c7d3c <_ChromeMain+0xa6c2aa0>
 466b4e8: 3945a408     	ldrb	w8, [x0, #0x169]
 466b4ec: 35002748     	cbnz	w8, 0x466b9d4 <_ChromeMain+0x4666738>
 466b4f0: f940ce62     	ldr	x2, [x19, #0x198]
 466b4f4: aa1303e0     	mov	x0, x19
 466b4f8: aa1503e1     	mov	x1, x21
 466b4fc: 970437c0     	bl	0x7793fc <_ChromeMain+0x774160>
 466b500: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 466b504: f9404709     	ldr	x9, [x24, #0x88]
 466b508: eb09011f     	cmp	x8, x9
 466b50c: 54000061     	b.ne	0x466b518 <_ChromeMain+0x466627c>
 466b510: aa1503e0     	mov	x0, x21
 466b514: 96e6a37a     	bl	0x142fc <_ChromeMain+0xf060>
 466b518: f9427660     	ldr	x0, [x19, #0x4e8]
 466b51c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 466b520: f9404709     	ldr	x9, [x24, #0x88]
 466b524: eb09011f     	cmp	x8, x9
 466b528: 54000041     	b.ne	0x466b530 <_ChromeMain+0x4666294>
 466b52c: 96e6dd44     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 466b530: f9027675     	str	x21, [x19, #0x4e8]
 466b534: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 466b538: 340000c8     	cbz	w8, 0x466b550 <_ChromeMain+0x46662b4>
 466b53c: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 466b540: 9103e2a0     	add	x0, x21, #0xf8
 466b544: 9106a6a1     	add	x1, x21, #0x1a9
 466b548: 9722f2a2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b54c: f9427675     	ldr	x21, [x19, #0x4e8]
 466b550: 52801c48     	mov	w8, #0xe2               ; =226
 466b554: b90382a8     	str	w8, [x21, #0x380]
 466b558: 52800028     	mov	w8, #0x1                ; =1
 466b55c: 390e12a8     	strb	w8, [x21, #0x384]
 466b560: f9427668     	ldr	x8, [x19, #0x4e8]
 466b564: 3dc003e0     	ldr	q0, [sp]
 466b568: 3d8017e0     	str	q0, [sp, #0x50]
 466b56c: d0051cc1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 466b570: 91122021     	add	x1, x1, #0x488
 466b574: 91036100     	add	x0, x8, #0xd8
 466b578: 910143e2     	add	x2, sp, #0x50
 466b57c: 97520a39     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 466b580: f9427660     	ldr	x0, [x19, #0x4e8]
 466b584: f9400008     	ldr	x8, [x0]
 466b588: f9405108     	ldr	x8, [x8, #0xa0]
 466b58c: 52800001     	mov	w1, #0x0                ; =0
 466b590: d63f0100     	blr	x8
 466b594: f8bfc2e0     	ldapr	x0, [x23]
 466b598: b4002140     	cbz	x0, 0x466b9c0 <_ChromeMain+0x4666724>
 466b59c: 52808c01     	mov	w1, #0x460              ; =1120
 466b5a0: d2800002     	mov	x2, #0x0                ; =0
 466b5a4: 96e90003     	bl	0xab5b0 <_ChromeMain+0xa6314>
 466b5a8: aa0003f5     	mov	x21, x0
 466b5ac: 39931e62     	ldrsb	x2, [x19, #0x4c7]
 466b5b0: b6f80062     	tbz	x2, #0x3f, 0x466b5bc <_ChromeMain+0x4666320>
 466b5b4: f9425a74     	ldr	x20, [x19, #0x4b0]
 466b5b8: f9425e62     	ldr	x2, [x19, #0x4b8]
 466b5bc: aa1503e0     	mov	x0, x21
 466b5c0: aa1403e1     	mov	x1, x20
 466b5c4: 528000a3     	mov	w3, #0x5                ; =5
 466b5c8: 52820004     	mov	w4, #0x1000             ; =4096
 466b5cc: 52800005     	mov	w5, #0x0                ; =0
 466b5d0: 97547cc4     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 466b5d4: 3945a6a8     	ldrb	w8, [x21, #0x169]
 466b5d8: 35002048     	cbnz	w8, 0x466b9e0 <_ChromeMain+0x4666744>
 466b5dc: f940ce62     	ldr	x2, [x19, #0x198]
 466b5e0: aa1303e0     	mov	x0, x19
 466b5e4: aa1503e1     	mov	x1, x21
 466b5e8: 97043785     	bl	0x7793fc <_ChromeMain+0x774160>
 466b5ec: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 466b5f0: f9404709     	ldr	x9, [x24, #0x88]
 466b5f4: eb09011f     	cmp	x8, x9
 466b5f8: 54000061     	b.ne	0x466b604 <_ChromeMain+0x4666368>
 466b5fc: aa1503e0     	mov	x0, x21
 466b600: 96e6a33f     	bl	0x142fc <_ChromeMain+0xf060>
 466b604: f9427260     	ldr	x0, [x19, #0x4e0]
 466b608: 925e7408     	and	x8, x0, #0xfffffffc00000000
 466b60c: f9404709     	ldr	x9, [x24, #0x88]
 466b610: eb09011f     	cmp	x8, x9
 466b614: 54000041     	b.ne	0x466b61c <_ChromeMain+0x4666380>
 466b618: 96e6dd09     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 466b61c: f9027275     	str	x21, [x19, #0x4e0]
 466b620: 3946a6a8     	ldrb	w8, [x21, #0x1a9]
 466b624: 340000c8     	cbz	w8, 0x466b63c <_ChromeMain+0x46663a0>
 466b628: 3906a6bf     	strb	wzr, [x21, #0x1a9]
 466b62c: 9103e2a0     	add	x0, x21, #0xf8
 466b630: 9106a6a1     	add	x1, x21, #0x1a9
 466b634: 9722f267     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b638: f9427275     	ldr	x21, [x19, #0x4e0]
 466b63c: aa1503e0     	mov	x0, x21
 466b640: 52800061     	mov	w1, #0x3                ; =3
 466b644: 975479af     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 466b648: f9427260     	ldr	x0, [x19, #0x4e0]
 466b64c: 52800081     	mov	w1, #0x4                ; =4
 466b650: 96fcd5bc     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 466b654: f9427274     	ldr	x20, [x19, #0x4e0]
 466b658: 394eda88     	ldrb	w8, [x20, #0x3b6]
 466b65c: 35000de8     	cbnz	w8, 0x466b818 <_ChromeMain+0x466657c>
 466b660: aa1403e0     	mov	x0, x20
 466b664: 52800001     	mov	w1, #0x0                ; =0
 466b668: 97834f42     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 466b66c: f9427260     	ldr	x0, [x19, #0x4e0]
 466b670: b9001bff     	str	wzr, [sp, #0x18]
 466b674: 52800028     	mov	w8, #0x1                ; =1
 466b678: 390073e8     	strb	w8, [sp, #0x1c]
 466b67c: 910063e1     	add	x1, sp, #0x18
 466b680: 9707741c     	bl	0x8486f0 <_ChromeMain+0x843454>
 466b684: f9427274     	ldr	x20, [x19, #0x4e0]
 466b688: f941ae88     	ldr	x8, [x20, #0x358]
 466b68c: f9402515     	ldr	x21, [x8, #0x48]
 466b690: b40000b5     	cbz	x21, 0x466b6a4 <_ChromeMain+0x4666408>
 466b694: b94002a8     	ldr	w8, [x21]
 466b698: 31000508     	adds	w8, w8, #0x1
 466b69c: b90002a8     	str	w8, [x21]
 466b6a0: 54001a62     	b.hs	0x466b9ec <_ChromeMain+0x4666750>
 466b6a4: b94046a8     	ldr	w8, [x21, #0x44]
 466b6a8: 3100051f     	cmn	w8, #0x1
 466b6ac: 54001ce0     	b.eq	0x466ba48 <_ChromeMain+0x46667ac>
 466b6b0: 52800189     	mov	w9, #0xc                ; =12
 466b6b4: 4b080136     	sub	w22, w9, w8
 466b6b8: b94042b7     	ldr	w23, [x21, #0x40]
 466b6bc: 310006ff     	cmn	w23, #0x1
 466b6c0: 54001620     	b.eq	0x466b984 <_ChromeMain+0x46666e8>
 466b6c4: b9404aa3     	ldr	w3, [x21, #0x48]
 466b6c8: 3100047f     	cmn	w3, #0x1
 466b6cc: 54001c60     	b.eq	0x466ba58 <_ChromeMain+0x46667bc>
 466b6d0: aa1503e0     	mov	x0, x21
 466b6d4: aa1603e1     	mov	x1, x22
 466b6d8: aa1703e2     	mov	x2, x23
 466b6dc: 9758efe9     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 466b6e0: aa0003f6     	mov	x22, x0
 466b6e4: b40000a0     	cbz	x0, 0x466b6f8 <_ChromeMain+0x466645c>
 466b6e8: b94002c8     	ldr	w8, [x22]
 466b6ec: 31000508     	adds	w8, w8, #0x1
 466b6f0: b90002c8     	str	w8, [x22]
 466b6f4: 54001822     	b.hs	0x466b9f8 <_ChromeMain+0x466675c>
 466b6f8: b94042c2     	ldr	w2, [x22, #0x40]
 466b6fc: 3100045f     	cmn	w2, #0x1
 466b700: 540014a0     	b.eq	0x466b994 <_ChromeMain+0x46666f8>
 466b704: aa1603e0     	mov	x0, x22
 466b708: 52800001     	mov	w1, #0x0                ; =0
 466b70c: 52803e83     	mov	w3, #0x1f4              ; =500
 466b710: 9758efdc     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 466b714: f9002be0     	str	x0, [sp, #0x50]
 466b718: b40000a0     	cbz	x0, 0x466b72c <_ChromeMain+0x4666490>
 466b71c: b9400008     	ldr	w8, [x0]
 466b720: 31000508     	adds	w8, w8, #0x1
 466b724: b9000008     	str	w8, [x0]
 466b728: 540016e2     	b.hs	0x466ba04 <_ChromeMain+0x4666768>
 466b72c: b40000d6     	cbz	x22, 0x466b744 <_ChromeMain+0x46664a8>
 466b730: b94002c9     	ldr	w9, [x22]
 466b734: 51000528     	sub	w8, w9, #0x1
 466b738: b90002c8     	str	w8, [x22]
 466b73c: 340016a9     	cbz	w9, 0x466ba10 <_ChromeMain+0x4666774>
 466b740: 340005a8     	cbz	w8, 0x466b7f4 <_ChromeMain+0x4666558>
 466b744: b40000d5     	cbz	x21, 0x466b75c <_ChromeMain+0x46664c0>
 466b748: b94002a9     	ldr	w9, [x21]
 466b74c: 51000528     	sub	w8, w9, #0x1
 466b750: b90002a8     	str	w8, [x21]
 466b754: 34001649     	cbz	w9, 0x466ba1c <_ChromeMain+0x4666780>
 466b758: 34000448     	cbz	w8, 0x466b7e0 <_ChromeMain+0x4666544>
 466b75c: f9400288     	ldr	x8, [x20]
 466b760: f941ed08     	ldr	x8, [x8, #0x3d8]
 466b764: 910143e1     	add	x1, sp, #0x50
 466b768: aa1403e0     	mov	x0, x20
 466b76c: d63f0100     	blr	x8
 466b770: f9402be0     	ldr	x0, [sp, #0x50]
 466b774: b40000c0     	cbz	x0, 0x466b78c <_ChromeMain+0x46664f0>
 466b778: b9400009     	ldr	w9, [x0]
 466b77c: 51000528     	sub	w8, w9, #0x1
 466b780: b9000008     	str	w8, [x0]
 466b784: 34001529     	cbz	w9, 0x466ba28 <_ChromeMain+0x466678c>
 466b788: 34000248     	cbz	w8, 0x466b7d0 <_ChromeMain+0x4666534>
 466b78c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 466b790: 910143e1     	add	x1, sp, #0x50
 466b794: aa1303e0     	mov	x0, x19
 466b798: 52800102     	mov	w2, #0x8                ; =8
 466b79c: 97ab00ef     	bl	0x312bb58 <_ChromeMain+0x31268bc>
 466b7a0: aa1303f4     	mov	x20, x19
 466b7a4: f84e8e88     	ldr	x8, [x20, #0xe8]!
 466b7a8: b40006a8     	cbz	x8, 0x466b87c <_ChromeMain+0x46665e0>
 466b7ac: b0051cc9     	adrp	x9, 0xea04000 <dyld_stub_binder+0xea04000>
 466b7b0: 91234129     	add	x9, x9, #0x8d0
 466b7b4: f940110a     	ldr	x10, [x8, #0x20]
 466b7b8: eb09015f     	cmp	x10, x9
 466b7bc: 54000288     	b.hi	0x466b80c <_ChromeMain+0x4666570>
 466b7c0: 54000582     	b.hs	0x466b870 <_ChromeMain+0x46665d4>
 466b7c4: f9400508     	ldr	x8, [x8, #0x8]
 466b7c8: b5ffff68     	cbnz	x8, 0x466b7b4 <_ChromeMain+0x4666518>
 466b7cc: 1400002c     	b	0x466b87c <_ChromeMain+0x46665e0>
 466b7d0: 972b83fd     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 466b7d4: 52800a01     	mov	w1, #0x50               ; =80
 466b7d8: 96e675b8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466b7dc: 17ffffec     	b	0x466b78c <_ChromeMain+0x46664f0>
 466b7e0: aa1503e0     	mov	x0, x21
 466b7e4: 972b83f8     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 466b7e8: 52800a01     	mov	w1, #0x50               ; =80
 466b7ec: 96e675b3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466b7f0: 17ffffdb     	b	0x466b75c <_ChromeMain+0x46664c0>
 466b7f4: aa1603e0     	mov	x0, x22
 466b7f8: 972b83f3     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 466b7fc: 52800a01     	mov	w1, #0x50               ; =80
 466b800: 96e675ae     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466b804: b5fffa35     	cbnz	x21, 0x466b748 <_ChromeMain+0x46664ac>
 466b808: 17ffffd5     	b	0x466b75c <_ChromeMain+0x46664c0>
 466b80c: f9400108     	ldr	x8, [x8]
 466b810: b5fffd28     	cbnz	x8, 0x466b7b4 <_ChromeMain+0x4666518>
 466b814: 1400001a     	b	0x466b87c <_ChromeMain+0x46665e0>
 466b818: 390eda9f     	strb	wzr, [x20, #0x3b6]
 466b81c: aa1403e0     	mov	x0, x20
 466b820: 9722f2ba     	bl	0xf28308 <_ChromeMain+0xf2306c>
 466b824: aa1403e0     	mov	x0, x20
 466b828: 52800041     	mov	w1, #0x2                ; =2
 466b82c: 9705d84e     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 466b830: 9103e280     	add	x0, x20, #0xf8
 466b834: 910eda81     	add	x1, x20, #0x3b6
 466b838: 9722f1e6     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 466b83c: f9427274     	ldr	x20, [x19, #0x4e0]
 466b840: 17ffff88     	b	0x466b660 <_ChromeMain+0x46663c4>
 466b844: f9400008     	ldr	x8, [x0]
 466b848: f9400508     	ldr	x8, [x8, #0x8]
 466b84c: d63f0100     	blr	x8
 466b850: 1400000f     	b	0x466b88c <_ChromeMain+0x46665f0>
 466b854: f9400108     	ldr	x8, [x8]
 466b858: b5000268     	cbnz	x8, 0x466b8a4 <_ChromeMain+0x4666608>
 466b85c: 14000018     	b	0x466b8bc <_ChromeMain+0x4666620>
 466b860: eb14011f     	cmp	x8, x20
 466b864: 540002c0     	b.eq	0x466b8bc <_ChromeMain+0x4666620>
 466b868: f9401914     	ldr	x20, [x8, #0x30]
 466b86c: 14000015     	b	0x466b8c0 <_ChromeMain+0x4666624>
 466b870: eb14011f     	cmp	x8, x20
 466b874: 54000e60     	b.eq	0x466ba40 <_ChromeMain+0x46667a4>
 466b878: f9401908     	ldr	x8, [x8, #0x30]
 466b87c: b900111f     	str	wzr, [x8, #0x10]
 466b880: f9401d00     	ldr	x0, [x8, #0x38]
 466b884: f9001d1f     	str	xzr, [x8, #0x38]
 466b888: b5fffde0     	cbnz	x0, 0x466b844 <_ChromeMain+0x46665a8>
 466b88c: aa1303e0     	mov	x0, x19
 466b890: 97340d6c     	bl	0x136ee40 <_ChromeMain+0x1369ba4>
 466b894: f9407668     	ldr	x8, [x19, #0xe8]
 466b898: b4000128     	cbz	x8, 0x466b8bc <_ChromeMain+0x4666620>
 466b89c: b0051cc9     	adrp	x9, 0xea04000 <dyld_stub_binder+0xea04000>
 466b8a0: 9132c129     	add	x9, x9, #0xcb0
 466b8a4: f940110a     	ldr	x10, [x8, #0x20]
 466b8a8: eb09015f     	cmp	x10, x9
 466b8ac: 54fffd48     	b.hi	0x466b854 <_ChromeMain+0x46665b8>
 466b8b0: 54fffd82     	b.hs	0x466b860 <_ChromeMain+0x46665c4>
 466b8b4: f9400508     	ldr	x8, [x8, #0x8]
 466b8b8: b5ffff68     	cbnz	x8, 0x466b8a4 <_ChromeMain+0x4666608>
 466b8bc: d2800014     	mov	x20, #0x0               ; =0
 466b8c0: 52800600     	mov	w0, #0x30               ; =48
 466b8c4: 96e68ea9     	bl	0xf368 <_ChromeMain+0xa0cc>
 466b8c8: aa0003e8     	mov	x8, x0
 466b8cc: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 466b8d0: 7900301f     	strh	wzr, [x0, #0x18]
 466b8d4: f004e709     	adrp	x9, 0xe34e000 <dyld_stub_binder+0xe34e000>
 466b8d8: 91362129     	add	x9, x9, #0xd88
 466b8dc: f9000009     	str	x9, [x0]
 466b8e0: 4f026420     	movi.4s	v0, #0x41, lsl #24
 466b8e4: 3c81c000     	stur	q0, [x0, #0x1c]
 466b8e8: f9418e80     	ldr	x0, [x20, #0x318]
 466b8ec: f9018e88     	str	x8, [x20, #0x318]
 466b8f0: b5000bc0     	cbnz	x0, 0x466ba68 <_ChromeMain+0x46667cc>
 466b8f4: aa1403e0     	mov	x0, x20
 466b8f8: 52800001     	mov	w1, #0x0                ; =0
 466b8fc: 96ff12de     	bl	0x630474 <_ChromeMain+0x62b1d8>
 466b900: aa1403e0     	mov	x0, x20
 466b904: 96fcd61e     	bl	0x5a117c <_ChromeMain+0x59bee0>
 466b908: f9426660     	ldr	x0, [x19, #0x4c8]
 466b90c: b4000940     	cbz	x0, 0x466ba34 <_ChromeMain+0x4666798>
 466b910: f9426e74     	ldr	x20, [x19, #0x4d8]
 466b914: 52801c55     	mov	w21, #0xe2              ; =226
 466b918: b9004bf5     	str	w21, [sp, #0x48]
 466b91c: 390133ff     	strb	wzr, [sp, #0x4c]
 466b920: 910143e8     	add	x8, sp, #0x50
 466b924: 910123e1     	add	x1, sp, #0x48
 466b928: 52800182     	mov	w2, #0xc                ; =12
 466b92c: d2800003     	mov	x3, #0x0                ; =0
 466b930: 971e23fc     	bl	0xdf4920 <_ChromeMain+0xdef684>
 466b934: 910143e1     	add	x1, sp, #0x50
 466b938: aa1403e0     	mov	x0, x20
 466b93c: 96fcd5d9     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 466b940: 910143e0     	add	x0, sp, #0x50
 466b944: 97076bbf     	bl	0x846840 <_ChromeMain+0x8415a4>
 466b948: f9427260     	ldr	x0, [x19, #0x4e0]
 466b94c: b90053f5     	str	w21, [sp, #0x50]
 466b950: 390153ff     	strb	wzr, [sp, #0x54]
 466b954: f9400008     	ldr	x8, [x0]
 466b958: f941f508     	ldr	x8, [x8, #0x3e8]
 466b95c: 910143e1     	add	x1, sp, #0x50
 466b960: d63f0100     	blr	x8
 466b964: aa1303e0     	mov	x0, x19
 466b968: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 466b96c: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 466b970: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 466b974: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 466b978: a94867fa     	ldp	x26, x25, [sp, #0x80]
 466b97c: 910343ff     	add	sp, sp, #0xd0
 466b980: d65f03c0     	ret
 466b984: aa1503e0     	mov	x0, x21
 466b988: 976ee9ee     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 466b98c: b94042b7     	ldr	w23, [x21, #0x40]
 466b990: 17ffff4d     	b	0x466b6c4 <_ChromeMain+0x4666428>
 466b994: aa1603e0     	mov	x0, x22
 466b998: 976ee9ea     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 466b99c: b94042c2     	ldr	w2, [x22, #0x40]
 466b9a0: 17ffff59     	b	0x466b704 <_ChromeMain+0x4666468>
 466b9a4: d4200000     	brk	#0
 466b9a8: d4400000     	hlt	#0
 466b9ac: d4200020     	brk	#0x1
 466b9b0: 97f19f52     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 466b9b4: 17fffe64     	b	0x466b344 <_ChromeMain+0x46660a8>
 466b9b8: 97f19f50     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 466b9bc: 17fffec5     	b	0x466b4d0 <_ChromeMain+0x4666234>
 466b9c0: 97f19f4e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 466b9c4: 17fffef6     	b	0x466b59c <_ChromeMain+0x4666300>
 466b9c8: b21e07e9     	mov	x9, #0xc0000000c        ; =51539607564
 466b9cc: f9000109     	str	x9, [x8]
 466b9d0: 17fffe9f     	b	0x466b44c <_ChromeMain+0x46661b0>
 466b9d4: d4200000     	brk	#0
 466b9d8: d4400000     	hlt	#0
 466b9dc: d4200020     	brk	#0x1
 466b9e0: d4200000     	brk	#0
 466b9e4: d4400000     	hlt	#0
 466b9e8: d4200020     	brk	#0x1
 466b9ec: d4200000     	brk	#0
 466b9f0: d4400000     	hlt	#0
 466b9f4: d4200020     	brk	#0x1
 466b9f8: d4200000     	brk	#0
 466b9fc: d4400000     	hlt	#0
 466ba00: d4200020     	brk	#0x1
 466ba04: d4200000     	brk	#0
 466ba08: d4400000     	hlt	#0
 466ba0c: d4200020     	brk	#0x1
 466ba10: d4200000     	brk	#0
 466ba14: d4400000     	hlt	#0
 466ba18: d4200020     	brk	#0x1
 466ba1c: d4200000     	brk	#0
 466ba20: d4400000     	hlt	#0
 466ba24: d4200020     	brk	#0x1
 466ba28: d4200000     	brk	#0
 466ba2c: d4400000     	hlt	#0
 466ba30: d4200020     	brk	#0x1
 466ba34: d4200000     	brk	#0
 466ba38: d4400000     	hlt	#0
 466ba3c: d4200020     	brk	#0x1
 466ba40: d2800008     	mov	x8, #0x0                ; =0
 466ba44: 17ffff8e     	b	0x466b87c <_ChromeMain+0x46665e0>
 466ba48: aa1503e0     	mov	x0, x21
 466ba4c: 976ee9bd     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 466ba50: b94046a8     	ldr	w8, [x21, #0x44]
 466ba54: 17ffff17     	b	0x466b6b0 <_ChromeMain+0x4666414>
 466ba58: aa1503e0     	mov	x0, x21
 466ba5c: 976ee9b9     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 466ba60: b9404aa3     	ldr	w3, [x21, #0x48]
 466ba64: 17ffff1b     	b	0x466b6d0 <_ChromeMain+0x4666434>
 466ba68: f9400008     	ldr	x8, [x0]
 466ba6c: f9400508     	ldr	x8, [x8, #0x8]
 466ba70: d63f0100     	blr	x8
 466ba74: 17ffffa0     	b	0x466b8f4 <_ChromeMain+0x4666658>
 466ba78: f9400008     	ldr	x8, [x0]
 466ba7c: f9400508     	ldr	x8, [x8, #0x8]
 466ba80: d63f0100     	blr	x8
 466ba84: f9416675     	ldr	x21, [x19, #0x2c8]
 466ba88: 17fffdd7     	b	0x466b1e4 <_ChromeMain+0x4665f48>
 466ba8c: 52803600     	mov	w0, #0x1b0              ; =432
 466ba90: 96e68e36     	bl	0xf368 <_ChromeMain+0xa0cc>
 466ba94: aa0003f5     	mov	x21, x0
 466ba98: aa1303e1     	mov	x1, x19
 466ba9c: 9721e839     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 466baa0: 17fffde4     	b	0x466b230 <_ChromeMain+0x4665f94>
 466baa4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 466baa8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 466baac: 910043fd     	add	x29, sp, #0x10
 466bab0: f9426813     	ldr	x19, [x0, #0x4d0]
 466bab4: b4000213     	cbz	x19, 0x466baf4 <_ChromeMain+0x4666858>
 466bab8: 52800028     	mov	w8, #0x1                ; =1
 466babc: b8280268     	ldadd	w8, w8, [x19]
 466bac0: 7100011f     	cmp	w8, #0x0
 466bac4: 5400028d     	b.le	0x466bb14 <_ChromeMain+0x4666878>
 466bac8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 466bacc: 6b09011f     	cmp	w8, w9
 466bad0: 54000280     	b.eq	0x466bb20 <_ChromeMain+0x4666884>
 466bad4: f9426808     	ldr	x8, [x0, #0x4d0]
 466bad8: f9400508     	ldr	x8, [x8, #0x8]
 466badc: aa1303e0     	mov	x0, x19
 466bae0: d63f0100     	blr	x8
 466bae4: 12800008     	mov	w8, #-0x1               ; =-1
 466bae8: b8e80268     	ldaddal	w8, w8, [x19]
 466baec: 7100051f     	cmp	w8, #0x1
 466baf0: 54000080     	b.eq	0x466bb00 <_ChromeMain+0x4666864>
 466baf4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 466baf8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466bafc: d65f03c0     	ret
 466bb00: f9400a61     	ldr	x1, [x19, #0x10]
 466bb04: aa1303e0     	mov	x0, x19
 466bb08: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 466bb0c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466bb10: d61f0020     	br	x1
 466bb14: d4200000     	brk	#0
 466bb18: d4400000     	hlt	#0
 466bb1c: d4200020     	brk	#0x1
 466bb20: d4200000     	brk	#0
 466bb24: d4400000     	hlt	#0
 466bb28: d4200020     	brk	#0x1
