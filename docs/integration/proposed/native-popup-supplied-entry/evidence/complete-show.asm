
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 459577c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4595780: a90167fa     	stp	x26, x25, [sp, #0x10]
 4595784: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4595788: a90357f6     	stp	x22, x21, [sp, #0x30]
 459578c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4595790: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4595794: 910143fd     	add	x29, sp, #0x50
 4595798: d10e83ff     	sub	sp, sp, #0x3a0
 459579c: aa0003f3     	mov	x19, x0
 45957a0: f9401c00     	ldr	x0, [x0, #0x38]
 45957a4: 97443032     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 45957a8: b4000420     	cbz	x0, 0x459582c <_ChromeMain+0x4590590>
 45957ac: aa0003f4     	mov	x20, x0
 45957b0: 9107c3fa     	add	x26, sp, #0x1f0
 45957b4: 52800600     	mov	w0, #0x30               ; =48
 45957b8: 96e9e6ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 45957bc: f900fbe0     	str	x0, [sp, #0x1f0]
 45957c0: d004cd28     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 45957c4: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 45957c8: 3c808340     	stur	q0, [x26, #0x8]
 45957cc: 91008008     	add	x8, x0, #0x20
 45957d0: eb00011f     	cmp	x8, x0
 45957d4: 540064a3     	b.lo	0x4596468 <_ChromeMain+0x45911cc>
 45957d8: 3d800be0     	str	q0, [sp, #0x20]
 45957dc: f004459b     	adrp	x27, 0xce48000 <dyld_stub_binder+0xce48000>
 45957e0: 9125277b     	add	x27, x27, #0x949
 45957e4: eb1b011f     	cmp	x8, x27
 45957e8: fa5b8002     	ccmp	x0, x27, #0x2, hi
 45957ec: 540063e9     	b.ls	0x4596468 <_ChromeMain+0x45911cc>
 45957f0: ad400760     	ldp	q0, q1, [x27]
 45957f4: ad0003e1     	stp	q1, q0, [sp]
 45957f8: ad000400     	stp	q0, q1, [x0]
 45957fc: 3900801f     	strb	wzr, [x0, #0x20]
 4595800: 91002280     	add	x0, x20, #0x8
 4595804: 9107c3e1     	add	x1, sp, #0x1f0
 4595808: 97199ebf     	bl	0xbfd304 <_ChromeMain+0xbf8068>
 459580c: aa0003f4     	mov	x20, x0
 4595810: 39c81fe8     	ldrsb	w8, [sp, #0x207]
 4595814: 36f800a8     	tbz	w8, #0x1f, 0x4595828 <_ChromeMain+0x459058c>
 4595818: f940fbe0     	ldr	x0, [sp, #0x1f0]
 459581c: f94103e8     	ldr	x8, [sp, #0x200]
 4595820: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4595824: 96e9cda5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4595828: b5000134     	cbnz	x20, 0x459584c <_ChromeMain+0x45905b0>
 459582c: 910e83ff     	add	sp, sp, #0x3a0
 4595830: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4595834: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4595838: a94357f6     	ldp	x22, x21, [sp, #0x30]
 459583c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4595840: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4595844: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4595848: d65f03c0     	ret
 459584c: f9402e60     	ldr	x0, [x19, #0x58]
 4595850: 90054bb7     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 4595854: b50049c0     	cbnz	x0, 0x459618c <_ChromeMain+0x4590ef0>
 4595858: 925e7668     	and	x8, x19, #0xfffffffc00000000
 459585c: b00530e9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4595860: f9404529     	ldr	x9, [x9, #0x88]
 4595864: eb09011f     	cmp	x8, x9
 4595868: 54000061     	b.ne	0x4595874 <_ChromeMain+0x45905d8>
 459586c: aa1303e0     	mov	x0, x19
 4595870: 96e9faa3     	bl	0x142fc <_ChromeMain+0xf060>
 4595874: 52800700     	mov	w0, #0x38               ; =56
 4595878: 96e9e6bc     	bl	0xf368 <_ChromeMain+0xa0cc>
 459587c: aa0003f4     	mov	x20, x0
 4595880: 52800037     	mov	w23, #0x1               ; =1
 4595884: 1003e4a8     	adr	x8, 0x459d518 <_ChromeMain+0x459827c>
 4595888: d503201f     	nop
 459588c: 90ff9829     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 4595890: 912d0129     	add	x9, x9, #0xb40
 4595894: b9000017     	str	w23, [x0]
 4595898: 90fefe4b     	adrp	x11, 0x255d000 <_ChromeMain+0x2557d64>
 459589c: 912c016b     	add	x11, x11, #0xb00
 45958a0: 1001770a     	adr	x10, 0x4598780 <_ChromeMain+0x45934e4>
 45958a4: d503201f     	nop
 45958a8: a900a408     	stp	x8, x9, [x0, #0x8]
 45958ac: a901a80b     	stp	x11, x10, [x0, #0x18]
 45958b0: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 45958b4: f9406e78     	ldr	x24, [x19, #0xd8]
 45958b8: b40000b8     	cbz	x24, 0x45958cc <_ChromeMain+0x4590630>
 45958bc: b8370308     	ldadd	w23, w8, [x24]
 45958c0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45958c4: 6b09011f     	cmp	w8, w9
 45958c8: 54005e60     	b.eq	0x4596494 <_ChromeMain+0x45911f8>
 45958cc: f9407276     	ldr	x22, [x19, #0xe0]
 45958d0: 52800800     	mov	w0, #0x40               ; =64
 45958d4: 96e9e6a5     	bl	0xf368 <_ChromeMain+0xa0cc>
 45958d8: aa0003f5     	mov	x21, x0
 45958dc: b9000017     	str	w23, [x0]
 45958e0: d0ffd128     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 45958e4: 911c0108     	add	x8, x8, #0x700
 45958e8: b0ffd059     	adrp	x25, 0x3f9e000 <_ChromeMain+0x3f98d64>
 45958ec: 91110339     	add	x25, x25, #0x440
 45958f0: a900e408     	stp	x8, x25, [x0, #0x8]
 45958f4: b0ffd6a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 45958f8: 910a0108     	add	x8, x8, #0x280
 45958fc: 10015729     	adr	x9, 0x45983e0 <_ChromeMain+0x4593144>
 4595900: d503201f     	nop
 4595904: a901a408     	stp	x8, x9, [x0, #0x18]
 4595908: a902e01f     	stp	xzr, x24, [x0, #0x28]
 459590c: f9001c16     	str	x22, [x0, #0x38]
 4595910: f9406e78     	ldr	x24, [x19, #0xd8]
 4595914: b40000f8     	cbz	x24, 0x4595930 <_ChromeMain+0x4590694>
 4595918: 52800028     	mov	w8, #0x1                ; =1
 459591c: b8280308     	ldadd	w8, w8, [x24]
 4595920: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4595924: 6b09011f     	cmp	w8, w9
 4595928: 54005bc0     	b.eq	0x45964a0 <_ChromeMain+0x4591204>
 459592c: f9407276     	ldr	x22, [x19, #0xe0]
 4595930: 52800800     	mov	w0, #0x40               ; =64
 4595934: 96e9e68d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595938: aa0003f7     	mov	x23, x0
 459593c: 5280003c     	mov	w28, #0x1               ; =1
 4595940: b900001c     	str	w28, [x0]
 4595944: d0ffd128     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4595948: 911c0108     	add	x8, x8, #0x700
 459594c: a900e408     	stp	x8, x25, [x0, #0x8]
 4595950: 10ffeb08     	adr	x8, 0x45956b0 <_ChromeMain+0x4590414>
 4595954: d503201f     	nop
 4595958: b0ffd6a9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 459595c: 910a0129     	add	x9, x9, #0x280
 4595960: a901a009     	stp	x9, x8, [x0, #0x18]
 4595964: a902e01f     	stp	xzr, x24, [x0, #0x28]
 4595968: f9001c16     	str	x22, [x0, #0x38]
 459596c: f9406e79     	ldr	x25, [x19, #0xd8]
 4595970: b40000d9     	cbz	x25, 0x4595988 <_ChromeMain+0x45906ec>
 4595974: b83c0328     	ldadd	w28, w8, [x25]
 4595978: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 459597c: 6b09011f     	cmp	w8, w9
 4595980: 54005960     	b.eq	0x45964ac <_ChromeMain+0x4591210>
 4595984: f9407276     	ldr	x22, [x19, #0xe0]
 4595988: 52800800     	mov	w0, #0x40               ; =64
 459598c: 96e9e677     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595990: aa0003f8     	mov	x24, x0
 4595994: b900001c     	str	w28, [x0]
 4595998: d0ffd128     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 459599c: 911c0109     	add	x9, x8, #0x700
 45959a0: b0ffd048     	adrp	x8, 0x3f9e000 <_ChromeMain+0x3f98d64>
 45959a4: 91110108     	add	x8, x8, #0x440
 45959a8: a900a009     	stp	x9, x8, [x0, #0x8]
 45959ac: 10ffd909     	adr	x9, 0x45954cc <_ChromeMain+0x4590230>
 45959b0: d503201f     	nop
 45959b4: b0ffd6a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 45959b8: 910a0108     	add	x8, x8, #0x280
 45959bc: a901a408     	stp	x8, x9, [x0, #0x18]
 45959c0: a902e41f     	stp	xzr, x25, [x0, #0x28]
 45959c4: f9001c16     	str	x22, [x0, #0x38]
 45959c8: b0054bbc     	adrp	x28, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45959cc: 9112039c     	add	x28, x28, #0x480
 45959d0: f8bfc380     	ldapr	x0, [x28]
 45959d4: b4005580     	cbz	x0, 0x4596484 <_ChromeMain+0x45911e8>
 45959d8: 5280a701     	mov	w1, #0x538              ; =1336
 45959dc: d2800002     	mov	x2, #0x0                ; =0
 45959e0: 96ec56f4     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45959e4: aa0003f6     	mov	x22, x0
 45959e8: f9401e61     	ldr	x1, [x19, #0x38]
 45959ec: 978c036f     	bl	0x28967a8 <_ChromeMain+0x289150c>
 45959f0: 90050b48     	adrp	x8, 0xe6fd000 <dyld_stub_binder+0xe6fd000>
 45959f4: 91324108     	add	x8, x8, #0xc90
 45959f8: 91124109     	add	x9, x8, #0x490
 45959fc: a9002408     	stp	x8, x9, [x0]
 4595a00: 9112e109     	add	x9, x8, #0x4b8
 4595a04: f9000809     	str	x9, [x0, #0x10]
 4595a08: 9113c109     	add	x9, x8, #0x4f0
 4595a0c: 9114810a     	add	x10, x8, #0x520
 4595a10: a906a809     	stp	x9, x10, [x0, #0x68]
 4595a14: 9115c109     	add	x9, x8, #0x570
 4595a18: f9005809     	str	x9, [x0, #0xb0]
 4595a1c: 91174109     	add	x9, x8, #0x5d0
 4595a20: f9006c09     	str	x9, [x0, #0xd8]
 4595a24: 91180109     	add	x9, x8, #0x600
 4595a28: f9007c09     	str	x9, [x0, #0xf8]
 4595a2c: 9118a109     	add	x9, x8, #0x628
 4595a30: f9018809     	str	x9, [x0, #0x310]
 4595a34: 91282109     	add	x9, x8, #0xa08
 4595a38: f9019809     	str	x9, [x0, #0x330]
 4595a3c: 91382109     	add	x9, x8, #0xe08
 4595a40: f901a809     	str	x9, [x0, #0x350]
 4595a44: 9138e108     	add	x8, x8, #0xe38
 4595a48: f901b408     	str	x8, [x0, #0x368]
 4595a4c: f9027814     	str	x20, [x0, #0x4f0]
 4595a50: f9027c15     	str	x21, [x0, #0x4f8]
 4595a54: f9028017     	str	x23, [x0, #0x500]
 4595a58: f9028418     	str	x24, [x0, #0x508]
 4595a5c: 3914401f     	strb	wzr, [x0, #0x510]
 4595a60: 91146008     	add	x8, x0, #0x518
 4595a64: 6f00e400     	movi.2d	v0, #0000000000000000
 4595a68: 3d800100     	str	q0, [x8]
 4595a6c: 92800008     	mov	x8, #-0x1               ; =-1
 4595a70: f9029408     	str	x8, [x0, #0x528]
 4595a74: d2803708     	mov	x8, #0x1b8              ; =440
 4595a78: f2c00b88     	movk	x8, #0x5c, lsl #32
 4595a7c: f9029808     	str	x8, [x0, #0x530]
 4595a80: 52803100     	mov	w0, #0x188              ; =392
 4595a84: 96e9e639     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595a88: aa0003f4     	mov	x20, x0
 4595a8c: 9795885f     	bl	0x2af7c08 <_ChromeMain+0x2af296c>
 4595a90: f004fb68     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 4595a94: 911d8108     	add	x8, x8, #0x760
 4595a98: f9000008     	str	x8, [x0]
 4595a9c: 3940cc15     	ldrb	w21, [x0, #0x33]
 4595aa0: 52800029     	mov	w9, #0x1                ; =1
 4595aa4: 3900cc09     	strb	w9, [x0, #0x33]
 4595aa8: f9408508     	ldr	x8, [x8, #0x108]
 4595aac: d63f0100     	blr	x8
 4595ab0: b5005320     	cbnz	x0, 0x4596514 <_ChromeMain+0x4591278>
 4595ab4: f9402a60     	ldr	x0, [x19, #0x50]
 4595ab8: f9002a74     	str	x20, [x19, #0x50]
 4595abc: b0ffd059     	adrp	x25, 0x3f9e000 <_ChromeMain+0x3f98d64>
 4595ac0: 91110339     	add	x25, x25, #0x440
 4595ac4: b40000a0     	cbz	x0, 0x4595ad8 <_ChromeMain+0x459083c>
 4595ac8: f9400008     	ldr	x8, [x0]
 4595acc: f9400508     	ldr	x8, [x8, #0x8]
 4595ad0: d63f0100     	blr	x8
 4595ad4: f9402a74     	ldr	x20, [x19, #0x50]
 4595ad8: aa1403e0     	mov	x0, x20
 4595adc: aa1603e1     	mov	x1, x22
 4595ae0: 958545cd     	bl	0xa6e7214 <_ChromeMain+0xa6e1f78>
 4595ae4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4595ae8: b00530f5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4595aec: f94046a9     	ldr	x9, [x21, #0x88]
 4595af0: eb09011f     	cmp	x8, x9
 4595af4: 54000061     	b.ne	0x4595b00 <_ChromeMain+0x4590864>
 4595af8: aa1603e0     	mov	x0, x22
 4595afc: 96e9fa00     	bl	0x142fc <_ChromeMain+0xf060>
 4595b00: f9402660     	ldr	x0, [x19, #0x48]
 4595b04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4595b08: f94046a9     	ldr	x9, [x21, #0x88]
 4595b0c: eb09011f     	cmp	x8, x9
 4595b10: 54000041     	b.ne	0x4595b18 <_ChromeMain+0x459087c>
 4595b14: 96ea33ca     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4595b18: f9002676     	str	x22, [x19, #0x48]
 4595b1c: f9017bff     	str	xzr, [sp, #0x2f0]
 4595b20: 6f00e400     	movi.2d	v0, #0000000000000000
 4595b24: ad1683e0     	stp	q0, q0, [sp, #0x2d0]
 4595b28: ad1583e0     	stp	q0, q0, [sp, #0x2b0]
 4595b2c: ad1483e0     	stp	q0, q0, [sp, #0x290]
 4595b30: ad1383e0     	stp	q0, q0, [sp, #0x270]
 4595b34: ad1283e0     	stp	q0, q0, [sp, #0x250]
 4595b38: ad1183e0     	stp	q0, q0, [sp, #0x230]
 4595b3c: ad1083e0     	stp	q0, q0, [sp, #0x210]
 4595b40: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4595b44: 9107c3e0     	add	x0, sp, #0x1f0
 4595b48: 52800001     	mov	w1, #0x0                ; =0
 4595b4c: 52800002     	mov	w2, #0x0                ; =0
 4595b50: 97957f5c     	bl	0x2af58c0 <_ChromeMain+0x2af0624>
 4595b54: f9402a74     	ldr	x20, [x19, #0x50]
 4595b58: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4595b5c: f94046a9     	ldr	x9, [x21, #0x88]
 4595b60: eb09011f     	cmp	x8, x9
 4595b64: 54000061     	b.ne	0x4595b70 <_ChromeMain+0x45908d4>
 4595b68: aa1403e0     	mov	x0, x20
 4595b6c: 96e9f9e4     	bl	0x142fc <_ChromeMain+0xf060>
 4595b70: f940ffe0     	ldr	x0, [sp, #0x1f8]
 4595b74: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4595b78: f94046a9     	ldr	x9, [x21, #0x88]
 4595b7c: eb09011f     	cmp	x8, x9
 4595b80: 54000041     	b.ne	0x4595b88 <_ChromeMain+0x45908ec>
 4595b84: 96ea33ae     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4595b88: f900fff4     	str	x20, [sp, #0x1f8]
 4595b8c: 9107c3e8     	add	x8, sp, #0x1f0
 4595b90: d0048a61     	adrp	x1, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 4595b94: 9137f021     	add	x1, x1, #0xdfc
 4595b98: 91004100     	add	x0, x8, #0x10
 4595b9c: 973987ea     	bl	0x13f7b44 <_ChromeMain+0x13f28a8>
 4595ba0: aa1303e0     	mov	x0, x19
 4595ba4: 940009a7     	bl	0x4598240 <_ChromeMain+0x4592fa4>
 4595ba8: f9013be0     	str	x0, [sp, #0x270]
 4595bac: f9013fe1     	str	x1, [sp, #0x278]
 4595bb0: 52800028     	mov	w8, #0x1                ; =1
 4595bb4: 390973e8     	strb	w8, [sp, #0x25c]
 4595bb8: 394963e9     	ldrb	w9, [sp, #0x258]
 4595bbc: 37000049     	tbnz	w9, #0x0, 0x4595bc4 <_ChromeMain+0x4590928>
 4595bc0: 390963e8     	strb	w8, [sp, #0x258]
 4595bc4: 4f01f600     	fmov.4s	v0, #16.00000000
 4595bc8: 3c858340     	stur	q0, [x26, #0x58]
 4595bcc: 52800049     	mov	w9, #0x2                ; =2
 4595bd0: 3908d3e8     	strb	w8, [sp, #0x234]
 4595bd4: b9021fe9     	str	w9, [sp, #0x21c]
 4595bd8: b9022be8     	str	w8, [sp, #0x228]
 4595bdc: 3908b3e8     	strb	w8, [sp, #0x22c]
 4595be0: f8bfc380     	ldapr	x0, [x28]
 4595be4: b4004540     	cbz	x0, 0x459648c <_ChromeMain+0x45911f0>
 4595be8: 52806901     	mov	w1, #0x348              ; =840
 4595bec: d2800002     	mov	x2, #0x0                ; =0
 4595bf0: 96ec5670     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4595bf4: aa0003f4     	mov	x20, x0
 4595bf8: 978fd8ca     	bl	0x298bf20 <_ChromeMain+0x2986c84>
 4595bfc: f9402e60     	ldr	x0, [x19, #0x58]
 4595c00: f9002e74     	str	x20, [x19, #0x58]
 4595c04: b40000a0     	cbz	x0, 0x4595c18 <_ChromeMain+0x459097c>
 4595c08: f9400008     	ldr	x8, [x0]
 4595c0c: f9400508     	ldr	x8, [x8, #0x8]
 4595c10: d63f0100     	blr	x8
 4595c14: f9402e74     	ldr	x20, [x19, #0x58]
 4595c18: 9103a3e0     	add	x0, sp, #0xe8
 4595c1c: 9107c3e1     	add	x1, sp, #0x1f0
 4595c20: 97957fa4     	bl	0x2af5ab0 <_ChromeMain+0x2af0814>
 4595c24: 9103a3e1     	add	x1, sp, #0xe8
 4595c28: aa1403e0     	mov	x0, x20
 4595c2c: 97958105     	bl	0x2af6040 <_ChromeMain+0x2af0da4>
 4595c30: 9103a3e0     	add	x0, sp, #0xe8
 4595c34: 974485eb     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 4595c38: f9402a68     	ldr	x8, [x19, #0x50]
 4595c3c: 3903851f     	strb	wzr, [x8, #0xe1]
 4595c40: f9402e68     	ldr	x8, [x19, #0x58]
 4595c44: b40006e8     	cbz	x8, 0x4595d20 <_ChromeMain+0x4590a84>
 4595c48: f9401e60     	ldr	x0, [x19, #0x38]
 4595c4c: 9700364d     	bl	0x5a3580 <_ChromeMain+0x59e2e4>
 4595c50: 7100081f     	cmp	w0, #0x2
 4595c54: 540000c0     	b.eq	0x4595c6c <_ChromeMain+0x45909d0>
 4595c58: 7100041f     	cmp	w0, #0x1
 4595c5c: 540003e0     	b.eq	0x4595cd8 <_ChromeMain+0x4590a3c>
 4595c60: 52800008     	mov	w8, #0x0                ; =0
 4595c64: 52800009     	mov	w9, #0x0                ; =0
 4595c68: 1400001e     	b	0x4595ce0 <_ChromeMain+0x4590a44>
 4595c6c: 52800028     	mov	w8, #0x1                ; =1
 4595c70: 52800029     	mov	w9, #0x1                ; =1
 4595c74: 1400001b     	b	0x4595ce0 <_ChromeMain+0x4590a44>
 4595c78: 12800008     	mov	w8, #-0x1               ; =-1
 4595c7c: b8e80288     	ldaddal	w8, w8, [x20]
 4595c80: 7100051f     	cmp	w8, #0x1
 4595c84: 54000aa1     	b.ne	0x4595dd8 <_ChromeMain+0x4590b3c>
 4595c88: f9400a88     	ldr	x8, [x20, #0x10]
 4595c8c: 90fe5089     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4595c90: 91190129     	add	x9, x9, #0x640
 4595c94: eb09011f     	cmp	x8, x9
 4595c98: 54000140     	b.eq	0x4595cc0 <_ChromeMain+0x4590a24>
 4595c9c: f0ff9ea9     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 4595ca0: 91180129     	add	x9, x9, #0x600
 4595ca4: aa1403e0     	mov	x0, x20
 4595ca8: eb09011f     	cmp	x8, x9
 4595cac: 54000060     	b.eq	0x4595cb8 <_ChromeMain+0x4590a1c>
 4595cb0: d63f0100     	blr	x8
 4595cb4: 14000049     	b	0x4595dd8 <_ChromeMain+0x4590b3c>
 4595cb8: 52800701     	mov	w1, #0x38               ; =56
 4595cbc: 14000005     	b	0x4595cd0 <_ChromeMain+0x4590a34>
 4595cc0: f9401a80     	ldr	x0, [x20, #0x30]
 4595cc4: b5003c40     	cbnz	x0, 0x459644c <_ChromeMain+0x45911b0>
 4595cc8: aa1403e0     	mov	x0, x20
 4595ccc: 52800901     	mov	w1, #0x48               ; =72
 4595cd0: 96e9cc7a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4595cd4: 14000041     	b	0x4595dd8 <_ChromeMain+0x4590b3c>
 4595cd8: 52800009     	mov	w9, #0x0                ; =0
 4595cdc: 52800028     	mov	w8, #0x1                ; =1
 4595ce0: f9402e60     	ldr	x0, [x19, #0x58]
 4595ce4: 9106f00a     	add	x10, x0, #0x1bc
 4595ce8: f940014a     	ldr	x10, [x10]
 4595cec: d360fd4b     	lsr	x11, x10, #32
 4595cf0: 6a0b011f     	tst	w8, w11
 4595cf4: 540000a1     	b.ne	0x4595d08 <_ChromeMain+0x4590a6c>
 4595cf8: 6b2b011f     	cmp	w8, w11, uxtb
 4595cfc: 540000c1     	b.ne	0x4595d14 <_ChromeMain+0x4590a78>
 4595d00: 9790fc9a     	bl	0x29d4f68 <_ChromeMain+0x29cfccc>
 4595d04: 14000007     	b	0x4595d20 <_ChromeMain+0x4590a84>
 4595d08: 36003b08     	tbz	w8, #0x0, 0x4596468 <_ChromeMain+0x45911cc>
 4595d0c: 6b0a013f     	cmp	w9, w10
 4595d10: 54ffff80     	b.eq	0x4595d00 <_ChromeMain+0x4590a64>
 4595d14: 2a0903e9     	mov	w9, w9
 4595d18: aa088121     	orr	x1, x9, x8, lsl #32
 4595d1c: 95853d69     	bl	0xa6e52c0 <_ChromeMain+0xa6e0024>
 4595d20: b4003d93     	cbz	x19, 0x45964d0 <_ChromeMain+0x4591234>
 4595d24: f9402e68     	ldr	x8, [x19, #0x58]
 4595d28: 9103e100     	add	x0, x8, #0xf8
 4595d2c: aa1303e1     	mov	x1, x19
 4595d30: 96ff9a16     	bl	0x57c588 <_ChromeMain+0x5772ec>
 4595d34: f9402e75     	ldr	x21, [x19, #0x58]
 4595d38: f9406e76     	ldr	x22, [x19, #0xd8]
 4595d3c: b40000d6     	cbz	x22, 0x4595d54 <_ChromeMain+0x4590ab8>
 4595d40: 52800028     	mov	w8, #0x1                ; =1
 4595d44: b82802c8     	ldadd	w8, w8, [x22]
 4595d48: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4595d4c: 6b09011f     	cmp	w8, w9
 4595d50: 54003c60     	b.eq	0x45964dc <_ChromeMain+0x4591240>
 4595d54: f9407278     	ldr	x24, [x19, #0xe0]
 4595d58: 52800800     	mov	w0, #0x40               ; =64
 4595d5c: 96e9e583     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595d60: aa0003f4     	mov	x20, x0
 4595d64: d2800000     	mov	x0, #0x0                ; =0
 4595d68: 52800037     	mov	w23, #0x1               ; =1
 4595d6c: b9000297     	str	w23, [x20]
 4595d70: d0ffd128     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4595d74: 911c0108     	add	x8, x8, #0x700
 4595d78: a900e688     	stp	x8, x25, [x20, #0x8]
 4595d7c: b0ffd6a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4595d80: 910a0109     	add	x9, x8, #0x280
 4595d84: 10ffba48     	adr	x8, 0x45954cc <_ChromeMain+0x4590230>
 4595d88: d503201f     	nop
 4595d8c: a901a289     	stp	x9, x8, [x20, #0x18]
 4595d90: a902da9f     	stp	xzr, x22, [x20, #0x28]
 4595d94: f9001e98     	str	x24, [x20, #0x38]
 4595d98: b40001b4     	cbz	x20, 0x4595dcc <_ChromeMain+0x4590b30>
 4595d9c: 52800600     	mov	w0, #0x30               ; =48
 4595da0: 96e9e572     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595da4: b9000017     	str	w23, [x0]
 4595da8: b0fec128     	adrp	x8, 0x1dba000 <_ChromeMain+0x1db4d64>
 4595dac: 912fe108     	add	x8, x8, #0xbf8
 4595db0: b0ffd049     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 4595db4: 91130129     	add	x9, x9, #0x4c0
 4595db8: a900a408     	stp	x8, x9, [x0, #0x8]
 4595dbc: 90fefe48     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4595dc0: 912c0108     	add	x8, x8, #0xb00
 4595dc4: f9000c08     	str	x8, [x0, #0x18]
 4595dc8: f9001414     	str	x20, [x0, #0x28]
 4595dcc: f94146b4     	ldr	x20, [x21, #0x288]
 4595dd0: f90146a0     	str	x0, [x21, #0x288]
 4595dd4: b5fff534     	cbnz	x20, 0x4595c78 <_ChromeMain+0x45909dc>
 4595dd8: f9402e60     	ldr	x0, [x19, #0x58]
 4595ddc: 52800034     	mov	w20, #0x1               ; =1
 4595de0: 52800021     	mov	w1, #0x1                ; =1
 4595de4: 958533ff     	bl	0xa6e2de0 <_ChromeMain+0xa6ddb44>
 4595de8: f9402e60     	ldr	x0, [x19, #0x58]
 4595dec: 52800021     	mov	w1, #0x1                ; =1
 4595df0: 958534c4     	bl	0xa6e3100 <_ChromeMain+0xa6dde64>
 4595df4: f9402e76     	ldr	x22, [x19, #0x58]
 4595df8: f9406e77     	ldr	x23, [x19, #0xd8]
 4595dfc: b40000b7     	cbz	x23, 0x4595e10 <_ChromeMain+0x4590b74>
 4595e00: b83402e8     	ldadd	w20, w8, [x23]
 4595e04: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4595e08: 6b09011f     	cmp	w8, w9
 4595e0c: 540036e0     	b.eq	0x45964e8 <_ChromeMain+0x459124c>
 4595e10: f9407278     	ldr	x24, [x19, #0xe0]
 4595e14: 52800800     	mov	w0, #0x40               ; =64
 4595e18: 96e9e554     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595e1c: aa0003f5     	mov	x21, x0
 4595e20: b9000014     	str	w20, [x0]
 4595e24: d0ffd128     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4595e28: 911c0108     	add	x8, x8, #0x700
 4595e2c: a900e408     	stp	x8, x25, [x0, #0x8]
 4595e30: b0ffd6a8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 4595e34: 910a0109     	add	x9, x8, #0x280
 4595e38: 10012d48     	adr	x8, 0x45983e0 <_ChromeMain+0x4593144>
 4595e3c: d503201f     	nop
 4595e40: a901a009     	stp	x9, x8, [x0, #0x18]
 4595e44: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4595e48: f9001c18     	str	x24, [x0, #0x38]
 4595e4c: 52800300     	mov	w0, #0x18               ; =24
 4595e50: 96e9e546     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595e54: aa0003f4     	mov	x20, x0
 4595e58: f004fb77     	adrp	x23, 0xe504000 <dyld_stub_binder+0xe504000>
 4595e5c: 912342f7     	add	x23, x23, #0x8d0
 4595e60: a9005417     	stp	x23, x21, [x0]
 4595e64: f94072c8     	ldr	x8, [x22, #0xe0]
 4595e68: b4002e68     	cbz	x8, 0x4596434 <_ChromeMain+0x4591198>
 4595e6c: 19404108     	ldapurb	w8, [x8, #0x4]
 4595e70: 35002e28     	cbnz	w8, 0x4596434 <_ChromeMain+0x4591198>
 4595e74: f94076c8     	ldr	x8, [x22, #0xe8]
 4595e78: b4002de8     	cbz	x8, 0x4596434 <_ChromeMain+0x4591198>
 4595e7c: f94072c8     	ldr	x8, [x22, #0xe0]
 4595e80: b4002fc8     	cbz	x8, 0x4596478 <_ChromeMain+0x45911dc>
 4595e84: 19404108     	ldapurb	w8, [x8, #0x4]
 4595e88: 35002f88     	cbnz	w8, 0x4596478 <_ChromeMain+0x45911dc>
 4595e8c: f94076c8     	ldr	x8, [x22, #0xe8]
 4595e90: f9402508     	ldr	x8, [x8, #0x48]
 4595e94: b40036e8     	cbz	x8, 0x4596570 <_ChromeMain+0x45912d4>
 4595e98: f940a515     	ldr	x21, [x8, #0x148]
 4595e9c: aa1503e0     	mov	x0, x21
 4595ea0: 94e9b632     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4595ea4: 94e9b631     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4595ea8: 94e9b630     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4595eac: 52800100     	mov	w0, #0x8                ; =8
 4595eb0: 96e9e52e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595eb4: aa0003f6     	mov	x22, x0
 4595eb8: f900001f     	str	xzr, [x0]
 4595ebc: aa1503e1     	mov	x1, x21
 4595ec0: 95035890     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4595ec4: aa1503e0     	mov	x0, x21
 4595ec8: 94e9b625     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4595ecc: aa1503e0     	mov	x0, x21
 4595ed0: 94e9b623     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4595ed4: aa1503e0     	mov	x0, x21
 4595ed8: 94e9b621     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4595edc: a90557f6     	stp	x22, x21, [sp, #0x50]
 4595ee0: 52800400     	mov	w0, #0x20               ; =32
 4595ee4: 96e9e521     	bl	0xf368 <_ChromeMain+0xa0cc>
 4595ee8: b4002c00     	cbz	x0, 0x4596468 <_ChromeMain+0x45911cc>
 4595eec: 52800028     	mov	w8, #0x1                ; =1
 4595ef0: b9001c08     	str	w8, [x0, #0x1c]
 4595ef4: d10363b5     	sub	x21, x29, #0xd8
 4595ef8: 910022a9     	add	x9, x21, #0x8
 4595efc: a9007c1f     	stp	xzr, xzr, [x0]
 4595f00: f9000809     	str	x9, [x0, #0x10]
 4595f04: a93283a0     	stp	x0, x0, [x29, #-0xd8]
 4595f08: 39006008     	strb	w8, [x0, #0x18]
 4595f0c: f81383a8     	stur	x8, [x29, #-0xc8]
 4595f10: 910143e1     	add	x1, sp, #0x50
 4595f14: d10363a2     	sub	x2, x29, #0xd8
 4595f18: aa1403e0     	mov	x0, x20
 4595f1c: 979d21ba     	bl	0x2cde604 <_ChromeMain+0x2cd9368>
 4595f20: f9000a80     	str	x0, [x20, #0x10]
 4595f24: f85303a1     	ldur	x1, [x29, #-0xd0]
 4595f28: f90067f5     	str	x21, [sp, #0xc8]
 4595f2c: 910323e0     	add	x0, sp, #0xc8
 4595f30: 97077904     	bl	0x774340 <_ChromeMain+0x76f0a4>
 4595f34: f9402bf5     	ldr	x21, [sp, #0x50]
 4595f38: f9002bff     	str	xzr, [sp, #0x50]
 4595f3c: b40000d5     	cbz	x21, 0x4595f54 <_ChromeMain+0x4590cb8>
 4595f40: aa1503e0     	mov	x0, x21
 4595f44: 95035875     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4595f48: aa1503e0     	mov	x0, x21
 4595f4c: 52800101     	mov	w1, #0x8                ; =8
 4595f50: 96e9cbda     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4595f54: d103c3b6     	sub	x22, x29, #0xf0
 4595f58: f9405675     	ldr	x21, [x19, #0xa8]
 4595f5c: f9005674     	str	x20, [x19, #0xa8]
 4595f60: b40001b5     	cbz	x21, 0x4595f94 <_ChromeMain+0x4590cf8>
 4595f64: f90002b7     	str	x23, [x21]
 4595f68: f9400aa0     	ldr	x0, [x21, #0x10]
 4595f6c: f9000abf     	str	xzr, [x21, #0x10]
 4595f70: b4000080     	cbz	x0, 0x4595f80 <_ChromeMain+0x4590ce4>
 4595f74: f9400008     	ldr	x8, [x0]
 4595f78: f9400508     	ldr	x8, [x8, #0x8]
 4595f7c: d63f0100     	blr	x8
 4595f80: f94006a0     	ldr	x0, [x21, #0x8]
 4595f84: b50023c0     	cbnz	x0, 0x45963fc <_ChromeMain+0x4591160>
 4595f88: aa1503e0     	mov	x0, x21
 4595f8c: 52800301     	mov	w1, #0x18               ; =24
 4595f90: 96e9cbca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4595f94: f9402674     	ldr	x20, [x19, #0x48]
 4595f98: d10363b5     	sub	x21, x29, #0xd8
 4595f9c: a932ffbf     	stp	xzr, xzr, [x29, #-0xd8]
 4595fa0: b802f2df     	stur	wzr, [x22, #0x2f]
 4595fa4: f81383bf     	stur	xzr, [x29, #-0xc8]
 4595fa8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4595fac: 3c8382c0     	stur	q0, [x22, #0x38]
 4595fb0: 3c8482c0     	stur	q0, [x22, #0x48]
 4595fb4: 3c8582c0     	stur	q0, [x22, #0x58]
 4595fb8: 3c8682c0     	stur	q0, [x22, #0x68]
 4595fbc: 781883bf     	sturh	wzr, [x29, #-0x78]
 4595fc0: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 4595fc4: 9004c9a0     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4595fc8: 91186c00     	add	x0, x0, #0x61b
 4595fcc: 9004c9a1     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4595fd0: 91163421     	add	x1, x1, #0x58d
 4595fd4: 910323e8     	add	x8, sp, #0xc8
 4595fd8: 52809d42     	mov	w2, #0x4ea              ; =1258
 4595fdc: 96eaeb29     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4595fe0: d10363a1     	sub	x1, x29, #0xd8
 4595fe4: 910323e2     	add	x2, sp, #0xc8
 4595fe8: aa1403e0     	mov	x0, x20
 4595fec: 97932946     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 4595ff0: aa0003f4     	mov	x20, x0
 4595ff4: 9101c2a0     	add	x0, x21, #0x70
 4595ff8: d2800001     	mov	x1, #0x0                ; =0
 4595ffc: 96ea472f     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4596000: 910082a0     	add	x0, x21, #0x20
 4596004: 96ea471d     	bl	0x27c78 <_ChromeMain+0x229dc>
 4596008: 38d3f3a8     	ldursb	w8, [x29, #-0xc1]
 459600c: 36f800a8     	tbz	w8, #0x1f, 0x4596020 <_ChromeMain+0x4590d84>
 4596010: f85283a0     	ldur	x0, [x29, #-0xd8]
 4596014: f85383a8     	ldur	x8, [x29, #-0xc8]
 4596018: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 459601c: 96e9cba7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4596020: 52824b28     	mov	w8, #0x1259             ; =4697
 4596024: 52800029     	mov	w9, #0x1                ; =1
 4596028: 38286a89     	strb	w9, [x20, x8]
 459602c: 381103a9     	sturb	w9, [x29, #-0xf0]
 4596030: d0fefa95     	adrp	x21, 0x24e8000 <_ChromeMain+0x24e2d64>
 4596034: 911452b5     	add	x21, x21, #0x514
 4596038: 528004a8     	mov	w8, #0x25               ; =37
 459603c: f9002be8     	str	x8, [sp, #0x50]
 4596040: f0054b97     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 4596044: 395636e0     	ldrb	w0, [x23, #0x58d]
 4596048: 35002840     	cbnz	w0, 0x4596550 <_ChromeMain+0x45912b4>
 459604c: 9123a280     	add	x0, x20, #0x8e8
 4596050: d103c3a1     	sub	x1, x29, #0xf0
 4596054: aa1503e2     	mov	x2, x21
 4596058: d2800003     	mov	x3, #0x0                ; =0
 459605c: 97670df7     	bl	0x1f59838 <_ChromeMain+0x1f5459c>
 4596060: 528004a8     	mov	w8, #0x25               ; =37
 4596064: f9002be8     	str	x8, [sp, #0x50]
 4596068: 395636e0     	ldrb	w0, [x23, #0x58d]
 459606c: 35002660     	cbnz	w0, 0x4596538 <_ChromeMain+0x459129c>
 4596070: f9402660     	ldr	x0, [x19, #0x48]
 4596074: 94000bd6     	bl	0x4598fcc <_ChromeMain+0x4593d30>
 4596078: f9402674     	ldr	x20, [x19, #0x48]
 459607c: 52800600     	mov	w0, #0x30               ; =48
 4596080: 96e9e4ba     	bl	0xf368 <_ChromeMain+0xa0cc>
 4596084: f81103a0     	stur	x0, [x29, #-0xf0]
 4596088: 3dc00be0     	ldr	q0, [sp, #0x20]
 459608c: 3c8082c0     	stur	q0, [x22, #0x8]
 4596090: 91008008     	add	x8, x0, #0x20
 4596094: eb00011f     	cmp	x8, x0
 4596098: 54001e83     	b.lo	0x4596468 <_ChromeMain+0x45911cc>
 459609c: eb1b011f     	cmp	x8, x27
 45960a0: fa5b8002     	ccmp	x0, x27, #0x2, hi
 45960a4: 54001e29     	b.ls	0x4596468 <_ChromeMain+0x45911cc>
 45960a8: ad4007e0     	ldp	q0, q1, [sp]
 45960ac: ad000001     	stp	q1, q0, [x0]
 45960b0: 3900801f     	strb	wzr, [x0, #0x20]
 45960b4: d10363b5     	sub	x21, x29, #0xd8
 45960b8: d10363a8     	sub	x8, x29, #0xd8
 45960bc: d103c3a0     	sub	x0, x29, #0xf0
 45960c0: 978dd762     	bl	0x290be48 <_ChromeMain+0x2906bac>
 45960c4: f004c981     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45960c8: 9115c821     	add	x1, x1, #0x572
 45960cc: 910143e8     	add	x8, sp, #0x50
 45960d0: d10363a0     	sub	x0, x29, #0xd8
 45960d4: 528001c2     	mov	w2, #0xe                ; =14
 45960d8: 975d2e52     	bl	0x1ce1a20 <_ChromeMain+0x1cdc784>
 45960dc: 9101c2a0     	add	x0, x21, #0x70
 45960e0: d2800001     	mov	x1, #0x0                ; =0
 45960e4: 96ea46f5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45960e8: 910082a0     	add	x0, x21, #0x20
 45960ec: 96ea46e3     	bl	0x27c78 <_ChromeMain+0x229dc>
 45960f0: 38d3f3a8     	ldursb	w8, [x29, #-0xc1]
 45960f4: 36f800a8     	tbz	w8, #0x1f, 0x4596108 <_ChromeMain+0x4590e6c>
 45960f8: f85283a0     	ldur	x0, [x29, #-0xd8]
 45960fc: f85383a8     	ldur	x8, [x29, #-0xc8]
 4596100: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4596104: 96e9cb6d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4596108: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 459610c: 36f800a8     	tbz	w8, #0x1f, 0x4596120 <_ChromeMain+0x4590e84>
 4596110: f85103a0     	ldur	x0, [x29, #-0xf0]
 4596114: f85203a8     	ldur	x8, [x29, #-0xe0]
 4596118: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 459611c: 96e9cb67     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4596120: f004c980     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4596124: 91186c00     	add	x0, x0, #0x61b
 4596128: f004c981     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 459612c: 91163421     	add	x1, x1, #0x58d
 4596130: d10363a8     	sub	x8, x29, #0xd8
 4596134: 52809e22     	mov	w2, #0x4f1              ; =1265
 4596138: 96eaead2     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 459613c: 910143f5     	add	x21, sp, #0x50
 4596140: 910143e1     	add	x1, sp, #0x50
 4596144: d10363a3     	sub	x3, x29, #0xd8
 4596148: aa1403e0     	mov	x0, x20
 459614c: 52800022     	mov	w2, #0x1                ; =1
 4596150: 97dbed11     	bl	0x3c91594 <_ChromeMain+0x3c8c2f8>
 4596154: 9101c2a0     	add	x0, x21, #0x70
 4596158: d2800001     	mov	x1, #0x0                ; =0
 459615c: 96ea46d7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4596160: 910082a0     	add	x0, x21, #0x20
 4596164: 96ea46c5     	bl	0x27c78 <_ChromeMain+0x229dc>
 4596168: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 459616c: 36f800a8     	tbz	w8, #0x1f, 0x4596180 <_ChromeMain+0x4590ee4>
 4596170: f9402be0     	ldr	x0, [sp, #0x50]
 4596174: f94033e8     	ldr	x8, [sp, #0x60]
 4596178: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 459617c: 96e9cb4f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4596180: 9107c3e0     	add	x0, sp, #0x1f0
 4596184: 97448497     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 4596188: f9402e60     	ldr	x0, [x19, #0x58]
 459618c: 97f96bc5     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 4596190: a93287a0     	stp	x0, x1, [x29, #-0xd8]
 4596194: d0054bc8     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4596198: f942f500     	ldr	x0, [x8, #0x5e8]
 459619c: f9400008     	ldr	x8, [x0]
 45961a0: f9402108     	ldr	x8, [x8, #0x40]
 45961a4: d63f0100     	blr	x8
 45961a8: a9402408     	ldp	x8, x9, [x0]
 45961ac: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 45961b0: 9280000a     	mov	x10, #-0x1              ; =-1
 45961b4: f9007fea     	str	x10, [sp, #0xf8]
 45961b8: 8b090929     	add	x9, x9, x9, lsl #2
 45961bc: d37be935     	lsl	x21, x9, #5
 45961c0: b40004b5     	cbz	x21, 0x4596254 <_ChromeMain+0x4590fb8>
 45961c4: 9100a114     	add	x20, x8, #0x28
 45961c8: f004cd08     	adrp	x8, 0xdf39000 <dyld_stub_binder+0xdf39000>
 45961cc: 3dc3f101     	ldr	q1, [x8, #0xfc0]
 45961d0: b26187e8     	mov	x8, #-0x7fffffff        ; =-2147483647
 45961d4: 4e080d00     	dup.2d	v0, x8
 45961d8: ad0087e0     	stp	q0, q1, [sp, #0x10]
 45961dc: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45961e0: 4e080d00     	dup.2d	v0, x8
 45961e4: 3d8003e0     	str	q0, [sp]
 45961e8: d10363a0     	sub	x0, x29, #0xd8
 45961ec: aa1403e1     	mov	x1, x20
 45961f0: 96f91fd4     	bl	0x3de140 <_ChromeMain+0x3d8ea4>
 45961f4: 4e080c00     	dup.2d	v0, x0
 45961f8: ad408fe2     	ldp	q2, q3, [sp, #0x10]
 45961fc: 6ee34400     	ushl.2d	v0, v0, v3
 4596200: 4e080c21     	dup.2d	v1, x1
 4596204: 6ee34421     	ushl.2d	v1, v1, v3
 4596208: 4f600400     	sshr.2d	v0, v0, #0x20
 459620c: 4f601420     	ssra.2d	v0, v1, #0x20
 4596210: 4ee23401     	cmgt.2d	v1, v0, v2
 4596214: 6ee11c40     	bif.16b	v0, v2, v1
 4596218: 3dc003e2     	ldr	q2, [sp]
 459621c: 4ee03441     	cmgt.2d	v1, v2, v0
 4596220: 6ee11c40     	bif.16b	v0, v2, v1
 4596224: 4e183c08     	mov.d	x8, v0[1]
 4596228: 9e660009     	fmov	x9, d0
 459622c: b3607d09     	bfi	x9, x8, #32, #32
 4596230: a91f27e0     	stp	x0, x9, [sp, #0x1f0]
 4596234: 9103a3e0     	add	x0, sp, #0xe8
 4596238: 9103a3e1     	add	x1, sp, #0xe8
 459623c: 9107c3e2     	add	x2, sp, #0x1f0
 4596240: 52800043     	mov	w3, #0x2                ; =2
 4596244: 96e9cf8f     	bl	0xa080 <_ChromeMain+0x4de4>
 4596248: 91028294     	add	x20, x20, #0xa0
 459624c: f10282b5     	subs	x21, x21, #0xa0
 4596250: 54fffcc1     	b.ne	0x45961e8 <_ChromeMain+0x4590f4c>
 4596254: f9010bff     	str	xzr, [sp, #0x210]
 4596258: 6f00e400     	movi.2d	v0, #0000000000000000
 459625c: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4596260: 9107c3e0     	add	x0, sp, #0x1f0
 4596264: 9103a3e1     	add	x1, sp, #0xe8
 4596268: 96fb8a4c     	bl	0x478b98 <_ChromeMain+0x4738fc>
 459626c: d2800014     	mov	x20, #0x0               ; =0
 4596270: 394843e8     	ldrb	w8, [sp, #0x210]
 4596274: 37000188     	tbnz	w8, #0x0, 0x45962a4 <_ChromeMain+0x4591008>
 4596278: d2800014     	mov	x20, #0x0               ; =0
 459627c: fd4107e0     	ldr	d0, [sp, #0x208]
 4596280: fd4103e1     	ldr	d1, [sp, #0x200]
 4596284: 2ea18400     	sub.2s	v0, v0, v1
 4596288: 0e0c3c08     	mov.s	w8, v0[1]
 459628c: 1e260009     	fmov	w9, s0
 4596290: 9b295114     	smaddl	x20, w8, w9, x20
 4596294: 9107c3e0     	add	x0, sp, #0x1f0
 4596298: 96efc242     	bl	0x186ba0 <_ChromeMain+0x181904>
 459629c: 394843e8     	ldrb	w8, [sp, #0x210]
 45962a0: 3607fee8     	tbz	w8, #0x0, 0x459627c <_ChromeMain+0x4590fe0>
 45962a4: 69665bb5     	ldpsw	x21, x22, [x29, #-0xd0]
 45962a8: f9407fe8     	ldr	x8, [sp, #0xf8]
 45962ac: d1000509     	sub	x9, x8, #0x1
 45962b0: b1000d3f     	cmn	x9, #0x3
 45962b4: 54000b29     	b.ls	0x4596418 <_ChromeMain+0x459117c>
 45962b8: 9b357ec8     	smull	x8, w22, w21
 45962bc: 8b48fd08     	add	x8, x8, x8, lsr #63
 45962c0: eb88069f     	cmp	x20, x8, asr #1
 45962c4: 5400030c     	b.gt	0x4596324 <_ChromeMain+0x4591088>
 45962c8: f9402e74     	ldr	x20, [x19, #0x58]
 45962cc: aa1303e0     	mov	x0, x19
 45962d0: 940007dc     	bl	0x4598240 <_ChromeMain+0x4592fa4>
 45962d4: a90e87e0     	stp	x0, x1, [sp, #0xe8]
 45962d8: f9407288     	ldr	x8, [x20, #0xe0]
 45962dc: b4000248     	cbz	x8, 0x4596324 <_ChromeMain+0x4591088>
 45962e0: 19404108     	ldapurb	w8, [x8, #0x4]
 45962e4: 35000208     	cbnz	w8, 0x4596324 <_ChromeMain+0x4591088>
 45962e8: f9407688     	ldr	x8, [x20, #0xe8]
 45962ec: b40001c8     	cbz	x8, 0x4596324 <_ChromeMain+0x4591088>
 45962f0: f9407288     	ldr	x8, [x20, #0xe0]
 45962f4: b4000bc8     	cbz	x8, 0x459646c <_ChromeMain+0x45911d0>
 45962f8: 19404108     	ldapurb	w8, [x8, #0x4]
 45962fc: 35000b88     	cbnz	w8, 0x459646c <_ChromeMain+0x45911d0>
 4596300: f9407680     	ldr	x0, [x20, #0xe8]
 4596304: f9402414     	ldr	x20, [x0, #0x48]
 4596308: b40000f4     	cbz	x20, 0x4596324 <_ChromeMain+0x4591088>
 459630c: 9103a3e1     	add	x1, sp, #0xe8
 4596310: 975689ae     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 4596314: a91f07e0     	stp	x0, x1, [sp, #0x1f0]
 4596318: 9107c3e1     	add	x1, sp, #0x1f0
 459631c: aa1403e0     	mov	x0, x20
 4596320: 975689e5     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 4596324: f9402e60     	ldr	x0, [x19, #0x58]
 4596328: 97b8aea2     	bl	0x33c1db0 <_ChromeMain+0x33bcb14>
 459632c: f9402e60     	ldr	x0, [x19, #0x58]
 4596330: 958532f6     	bl	0xa6e2f08 <_ChromeMain+0xa6ddc6c>
 4596334: f9402674     	ldr	x20, [x19, #0x48]
 4596338: 9107c3f5     	add	x21, sp, #0x1f0
 459633c: a91f7fff     	stp	xzr, xzr, [sp, #0x1f0]
 4596340: b801735f     	stur	wzr, [x26, #0x17]
 4596344: f90103ff     	str	xzr, [sp, #0x200]
 4596348: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 459634c: ad1083e0     	stp	q0, q0, [sp, #0x210]
 4596350: ad1183e0     	stp	q0, q0, [sp, #0x230]
 4596354: 7904a3ff     	strh	wzr, [sp, #0x250]
 4596358: f90133ff     	str	xzr, [sp, #0x260]
 459635c: f9012fff     	str	xzr, [sp, #0x258]
 4596360: b004a980     	adrp	x0, 0xdac7000 <dyld_stub_binder+0xdac7000>
 4596364: 9129d800     	add	x0, x0, #0xa76
 4596368: f004c981     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 459636c: 91163421     	add	x1, x1, #0x58d
 4596370: 9100c3e8     	add	x8, sp, #0x30
 4596374: 52809222     	mov	w2, #0x491              ; =1169
 4596378: 96eaea42     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 459637c: 9107c3e1     	add	x1, sp, #0x1f0
 4596380: 9100c3e2     	add	x2, sp, #0x30
 4596384: aa1403e0     	mov	x0, x20
 4596388: 9793285f     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 459638c: aa0003f4     	mov	x20, x0
 4596390: 528004a8     	mov	w8, #0x25               ; =37
 4596394: f81283a8     	stur	x8, [x29, #-0xd8]
 4596398: 395636e0     	ldrb	w0, [x23, #0x58d]
 459639c: 35000ac0     	cbnz	w0, 0x45964f4 <_ChromeMain+0x4591258>
 45963a0: aa1403e0     	mov	x0, x20
 45963a4: 52800041     	mov	w1, #0x2                ; =2
 45963a8: 52800022     	mov	w2, #0x1                ; =1
 45963ac: 978011f8     	bl	0x259ab8c <_ChromeMain+0x25958f0>
 45963b0: 528004a8     	mov	w8, #0x25               ; =37
 45963b4: f81283a8     	stur	x8, [x29, #-0xd8]
 45963b8: 395636e0     	ldrb	w0, [x23, #0x58d]
 45963bc: 350007e0     	cbnz	w0, 0x45964b8 <_ChromeMain+0x459121c>
 45963c0: 9107c3e8     	add	x8, sp, #0x1f0
 45963c4: 9101c100     	add	x0, x8, #0x70
 45963c8: d2800001     	mov	x1, #0x0                ; =0
 45963cc: 96ea463b     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45963d0: 910082a0     	add	x0, x21, #0x20
 45963d4: 96ea4629     	bl	0x27c78 <_ChromeMain+0x229dc>
 45963d8: 39c81fe8     	ldrsb	w8, [sp, #0x207]
 45963dc: 36f800a8     	tbz	w8, #0x1f, 0x45963f0 <_ChromeMain+0x4591154>
 45963e0: f940fbe0     	ldr	x0, [sp, #0x1f0]
 45963e4: f94103e8     	ldr	x8, [sp, #0x200]
 45963e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45963ec: 96e9cab3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45963f0: aa1303e0     	mov	x0, x19
 45963f4: 940007fb     	bl	0x45983e0 <_ChromeMain+0x4593144>
 45963f8: 17fffd0d     	b	0x459582c <_ChromeMain+0x4590590>
 45963fc: 12800008     	mov	w8, #-0x1               ; =-1
 4596400: b8e80008     	ldaddal	w8, w8, [x0]
 4596404: 7100051f     	cmp	w8, #0x1
 4596408: 54ffdc01     	b.ne	0x4595f88 <_ChromeMain+0x4590cec>
 459640c: f9400808     	ldr	x8, [x0, #0x10]
 4596410: d63f0100     	blr	x8
 4596414: 17fffedd     	b	0x4595f88 <_ChromeMain+0x4590cec>
 4596418: 12800009     	mov	w9, #-0x1               ; =-1
 459641c: b8e90108     	ldaddal	w9, w8, [x8]
 4596420: 7100051f     	cmp	w8, #0x1
 4596424: 54fff4a1     	b.ne	0x45962b8 <_ChromeMain+0x459101c>
 4596428: f9407fe0     	ldr	x0, [sp, #0xf8]
 459642c: 96ec30f2     	bl	0xa27f4 <_ChromeMain+0x9d558>
 4596430: 17ffffa2     	b	0x45962b8 <_ChromeMain+0x459101c>
 4596434: 52800100     	mov	w0, #0x8                ; =8
 4596438: 96e9e3cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 459643c: aa0003f6     	mov	x22, x0
 4596440: d2800015     	mov	x21, #0x0               ; =0
 4596444: f900001f     	str	xzr, [x0]
 4596448: 17fffea5     	b	0x4595edc <_ChromeMain+0x4590c40>
 459644c: 12800008     	mov	w8, #-0x1               ; =-1
 4596450: b8e80008     	ldaddal	w8, w8, [x0]
 4596454: 7100051f     	cmp	w8, #0x1
 4596458: 54ffc381     	b.ne	0x4595cc8 <_ChromeMain+0x4590a2c>
 459645c: 52800101     	mov	w1, #0x8                ; =8
 4596460: 96e9ca96     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4596464: 17fffe19     	b	0x4595cc8 <_ChromeMain+0x4590a2c>
 4596468: d4200020     	brk	#0x1
 459646c: d4200000     	brk	#0
 4596470: d4400000     	hlt	#0
 4596474: d4200020     	brk	#0x1
 4596478: d4200000     	brk	#0
 459647c: d4400000     	hlt	#0
 4596480: d4200020     	brk	#0x1
 4596484: 97f4f49d     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4596488: 17fffd54     	b	0x45959d8 <_ChromeMain+0x459073c>
 459648c: 97f4f49b     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4596490: 17fffdd6     	b	0x4595be8 <_ChromeMain+0x459094c>
 4596494: d4200000     	brk	#0
 4596498: d4400000     	hlt	#0
 459649c: d4200020     	brk	#0x1
 45964a0: d4200000     	brk	#0
 45964a4: d4400000     	hlt	#0
 45964a8: d4200020     	brk	#0x1
 45964ac: d4200000     	brk	#0
 45964b0: d4400000     	hlt	#0
 45964b4: d4200020     	brk	#0x1
 45964b8: f90077ff     	str	xzr, [sp, #0xe8]
 45964bc: d10363a1     	sub	x1, x29, #0xd8
 45964c0: 9103a3e2     	add	x2, sp, #0xe8
 45964c4: 52800043     	mov	w3, #0x2                ; =2
 45964c8: 96f375f0     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 45964cc: 17ffffbd     	b	0x45963c0 <_ChromeMain+0x4591124>
 45964d0: d4200000     	brk	#0
 45964d4: d4400000     	hlt	#0
 45964d8: d4200020     	brk	#0x1
 45964dc: d4200000     	brk	#0
 45964e0: d4400000     	hlt	#0
 45964e4: d4200020     	brk	#0x1
 45964e8: d4200000     	brk	#0
 45964ec: d4400000     	hlt	#0
 45964f0: d4200020     	brk	#0x1
 45964f4: 9004a0a8     	adrp	x8, 0xd9aa000 <dyld_stub_binder+0xd9aa000>
 45964f8: 9109fd08     	add	x8, x8, #0x27f
 45964fc: f90077e8     	str	x8, [sp, #0xe8]
 4596500: d10363a1     	sub	x1, x29, #0xd8
 4596504: 9103a3e2     	add	x2, sp, #0xe8
 4596508: 52800023     	mov	w3, #0x1                ; =1
 459650c: 96f375df     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 4596510: 17ffffa4     	b	0x45963a0 <_ChromeMain+0x4591104>
 4596514: 3940ce88     	ldrb	w8, [x20, #0x33]
 4596518: 6b15011f     	cmp	w8, w21
 459651c: 54ffacc0     	b.eq	0x4595ab4 <_ChromeMain+0x4590818>
 4596520: f9400288     	ldr	x8, [x20]
 4596524: f9408508     	ldr	x8, [x8, #0x108]
 4596528: aa1403e0     	mov	x0, x20
 459652c: d63f0100     	blr	x8
 4596530: 9748ce83     	bl	0x17c9f3c <_ChromeMain+0x17c4ca0>
 4596534: 17fffd60     	b	0x4595ab4 <_ChromeMain+0x4590818>
 4596538: f81283bf     	stur	xzr, [x29, #-0xd8]
 459653c: 910143e1     	add	x1, sp, #0x50
 4596540: d10363a2     	sub	x2, x29, #0xd8
 4596544: 52800043     	mov	w3, #0x2                ; =2
 4596548: 96f375d0     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 459654c: 17fffec9     	b	0x4596070 <_ChromeMain+0x4590dd4>
 4596550: f004a088     	adrp	x8, 0xd9a9000 <dyld_stub_binder+0xd9a9000>
 4596554: 913a4508     	add	x8, x8, #0xe91
 4596558: f81283a8     	stur	x8, [x29, #-0xd8]
 459655c: 910143e1     	add	x1, sp, #0x50
