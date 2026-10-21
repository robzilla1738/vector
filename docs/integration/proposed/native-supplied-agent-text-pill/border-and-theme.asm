
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f000c: d10103ff     	sub	sp, sp, #0x40
 41f0010: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41f0014: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41f0018: 9100c3fd     	add	x29, sp, #0x30
 41f001c: aa0003f4     	mov	x20, x0
 41f0020: 52800400     	mov	w0, #0x20               ; =32
 41f0024: 96f87cd1     	bl	0xf368 <_ChromeMain+0xa0cc>
 41f0028: aa0003f3     	mov	x19, x0
 41f002c: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 41f0030: b9000808     	str	w8, [x0, #0x8]
 41f0034: 52800028     	mov	w8, #0x1                ; =1
 41f0038: b0050ae9     	adrp	x9, 0xe34d000 <dyld_stub_binder+0xe34d000>
 41f003c: 91370129     	add	x9, x9, #0xdc0
 41f0040: 39003008     	strb	w8, [x0, #0xc]
 41f0044: f9000009     	str	x9, [x0]
 41f0048: f0056de8     	adrp	x8, 0xefaf000 <dyld_stub_binder+0xefaf000>
 41f004c: f9405d00     	ldr	x0, [x8, #0xb8]
 41f0050: f9400008     	ldr	x8, [x0]
 41f0054: f9400908     	ldr	x8, [x8, #0x10]
 41f0058: 52800101     	mov	w1, #0x8                ; =8
 41f005c: d63f0100     	blr	x8
 41f0060: a9010660     	stp	x0, x1, [x19, #0x10]
 41f0064: f9431e88     	ldr	x8, [x20, #0x638]
 41f0068: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41f006c: 37f80429     	tbnz	w9, #0x1f, 0x41f00f0 <_ChromeMain+0x41eae54>
 41f0070: 3cc20100     	ldur	q0, [x8, #0x20]
 41f0074: f8430108     	ldur	x8, [x8, #0x30]
 41f0078: f9000be8     	str	x8, [sp, #0x10]
 41f007c: 3d8003e0     	str	q0, [sp]
 41f0080: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0084: 36f803e8     	tbz	w8, #0x1f, 0x41f0100 <_ChromeMain+0x41eae64>
 41f0088: f94007e9     	ldr	x9, [sp, #0x8]
 41f008c: f100813f     	cmp	x9, #0x20
 41f0090: 54000381     	b.ne	0x41f0100 <_ChromeMain+0x41eae64>
 41f0094: 900462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41f0098: 91252508     	add	x8, x8, #0x949
 41f009c: f94003e0     	ldr	x0, [sp]
 41f00a0: f9400be9     	ldr	x9, [sp, #0x10]
 41f00a4: a9402c0a     	ldp	x10, x11, [x0]
 41f00a8: a940350c     	ldp	x12, x13, [x8]
 41f00ac: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41f00b0: eb0c015f     	cmp	x10, x12
 41f00b4: a941210a     	ldp	x10, x8, [x8, #0x10]
 41f00b8: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41f00bc: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41f00c0: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41f00c4: 1a9f17f4     	cset	w20, eq
 41f00c8: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41f00cc: 96f8637b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f00d0: 0e020e80     	dup.4h	v0, w20
 41f00d4: 2f10a400     	ushll.4s	v0, v0, #0x0
 41f00d8: 4f3f5400     	shl.4s	v0, v0, #0x1f
 41f00dc: 4ea0a800     	cmlt.4s	v0, v0, #0
 41f00e0: 9004ea88     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 41f00e4: 3dc1d101     	ldr	q1, [x8, #0x740]
 41f00e8: 4e211c00     	and.16b	v0, v0, v1
 41f00ec: 1400000b     	b	0x41f0118 <_ChromeMain+0x41eae7c>
 41f00f0: a9420901     	ldp	x1, x2, [x8, #0x20]
 41f00f4: 910003e0     	mov	x0, sp
 41f00f8: 96f8a048     	bl	0x18218 <_ChromeMain+0x12f7c>
 41f00fc: 17ffffe1     	b	0x41f0080 <_ChromeMain+0x41eade4>
 41f0100: 36f800a8     	tbz	w8, #0x1f, 0x41f0114 <_ChromeMain+0x41eae78>
 41f0104: f94003e0     	ldr	x0, [sp]
 41f0108: f9400be8     	ldr	x8, [sp, #0x10]
 41f010c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41f0110: 96f8636a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0114: 6f00e400     	movi.2d	v0, #0000000000000000
 41f0118: 3d800660     	str	q0, [x19, #0x10]
 41f011c: aa1303e0     	mov	x0, x19
 41f0120: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41f0124: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41f0128: 910103ff     	add	sp, sp, #0x40
 41f012c: d65f03c0     	ret
 41f0130: d10103ff     	sub	sp, sp, #0x40
 41f0134: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41f0138: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41f013c: 9100c3fd     	add	x29, sp, #0x30
 41f0140: aa0003f3     	mov	x19, x0
 41f0144: 9734dd5d     	bl	0xf276b8 <_ChromeMain+0xf2241c>
 41f0148: f9431e68     	ldr	x8, [x19, #0x638]
 41f014c: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41f0150: 37f803a9     	tbnz	w9, #0x1f, 0x41f01c4 <_ChromeMain+0x41eaf28>
 41f0154: 3cc20100     	ldur	q0, [x8, #0x20]
 41f0158: f8430108     	ldur	x8, [x8, #0x30]
 41f015c: f9000be8     	str	x8, [sp, #0x10]
 41f0160: 3d8003e0     	str	q0, [sp]
 41f0164: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0168: 36f80368     	tbz	w8, #0x1f, 0x41f01d4 <_ChromeMain+0x41eaf38>
 41f016c: f94007e9     	ldr	x9, [sp, #0x8]
 41f0170: f100813f     	cmp	x9, #0x20
 41f0174: 54000301     	b.ne	0x41f01d4 <_ChromeMain+0x41eaf38>
 41f0178: 900462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41f017c: 91252508     	add	x8, x8, #0x949
 41f0180: f94003e0     	ldr	x0, [sp]
 41f0184: f9400be9     	ldr	x9, [sp, #0x10]
 41f0188: a9402c0a     	ldp	x10, x11, [x0]
 41f018c: a940350c     	ldp	x12, x13, [x8]
 41f0190: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41f0194: eb0c015f     	cmp	x10, x12
 41f0198: a941210a     	ldp	x10, x8, [x8, #0x10]
 41f019c: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41f01a0: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41f01a4: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41f01a8: 1a9f07f4     	cset	w20, ne
 41f01ac: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41f01b0: 96f86342     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f01b4: 350001b4     	cbnz	w20, 0x41f01e8 <_ChromeMain+0x41eaf4c>
 41f01b8: aa1303e0     	mov	x0, x19
 41f01bc: 9400000f     	bl	0x41f01f8 <_ChromeMain+0x41eaf5c>
 41f01c0: 1400000a     	b	0x41f01e8 <_ChromeMain+0x41eaf4c>
 41f01c4: a9420901     	ldp	x1, x2, [x8, #0x20]
 41f01c8: 910003e0     	mov	x0, sp
 41f01cc: 96f8a013     	bl	0x18218 <_ChromeMain+0x12f7c>
 41f01d0: 17ffffe5     	b	0x41f0164 <_ChromeMain+0x41eaec8>
 41f01d4: 36f800a8     	tbz	w8, #0x1f, 0x41f01e8 <_ChromeMain+0x41eaf4c>
 41f01d8: f94003e0     	ldr	x0, [sp]
 41f01dc: f9400be8     	ldr	x8, [sp, #0x10]
 41f01e0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41f01e4: 96f86335     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f01e8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41f01ec: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41f01f0: 910103ff     	add	sp, sp, #0x40
 41f01f4: d65f03c0     	ret
 41f01f8: d10343ff     	sub	sp, sp, #0xd0
 41f01fc: 6d0923e9     	stp	d9, d8, [sp, #0x90]
 41f0200: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 41f0204: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 41f0208: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 41f020c: 910303fd     	add	x29, sp, #0xc0
 41f0210: aa0003f3     	mov	x19, x0
 41f0214: f9400008     	ldr	x8, [x0]
 41f0218: f9423108     	ldr	x8, [x8, #0x460]
 41f021c: d0046881     	adrp	x1, 0xcf02000 <dyld_stub_binder+0xcf02000>
 41f0220: 9107d021     	add	x1, x1, #0x1f4
 41f0224: 52800122     	mov	w2, #0x9                ; =9
 41f0228: d63f0100     	blr	x8
 41f022c: f9426675     	ldr	x21, [x19, #0x4c8]
 41f0230: b9434ea9     	ldr	w9, [x21, #0x34c]
 41f0234: 52820348     	mov	w8, #0x101a             ; =4122
 41f0238: 6b08013f     	cmp	w9, w8
 41f023c: 540000a0     	b.eq	0x41f0250 <_ChromeMain+0x41eafb4>
 41f0240: b9034ea8     	str	w8, [x21, #0x34c]
 41f0244: aa1503e0     	mov	x0, x21
 41f0248: 979540be     	bl	0x2740540 <_ChromeMain+0x273b2a4>
 41f024c: f9426675     	ldr	x21, [x19, #0x4c8]
 41f0250: f941aea8     	ldr	x8, [x21, #0x358]
 41f0254: f9402514     	ldr	x20, [x8, #0x48]
 41f0258: b40000d4     	cbz	x20, 0x41f0270 <_ChromeMain+0x41eafd4>
 41f025c: b9400288     	ldr	w8, [x20]
 41f0260: 31000508     	adds	w8, w8, #0x1
 41f0264: b9000288     	str	w8, [x20]
 41f0268: 54002982     	b.hs	0x41f0798 <_ChromeMain+0x41eb4fc>
 41f026c: f9426675     	ldr	x21, [x19, #0x4c8]
 41f0270: b9404688     	ldr	w8, [x20, #0x44]
 41f0274: 3100051f     	cmn	w8, #0x1
 41f0278: 54002b40     	b.eq	0x41f07e0 <_ChromeMain+0x41eb544>
 41f027c: 528001c9     	mov	w9, #0xe                ; =14
 41f0280: 4b080136     	sub	w22, w9, w8
 41f0284: b9404282     	ldr	w2, [x20, #0x40]
 41f0288: 3100045f     	cmn	w2, #0x1
 41f028c: 54000880     	b.eq	0x41f039c <_ChromeMain+0x41eb100>
 41f0290: b9404a83     	ldr	w3, [x20, #0x48]
 41f0294: 3100047f     	cmn	w3, #0x1
 41f0298: 54002ac0     	b.eq	0x41f07f0 <_ChromeMain+0x41eb554>
 41f029c: aa1403e0     	mov	x0, x20
 41f02a0: aa1603e1     	mov	x1, x22
 41f02a4: 976adcf7     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 41f02a8: aa0003f6     	mov	x22, x0
 41f02ac: b40000a0     	cbz	x0, 0x41f02c0 <_ChromeMain+0x41eb024>
 41f02b0: b94002c8     	ldr	w8, [x22]
 41f02b4: 31000508     	adds	w8, w8, #0x1
 41f02b8: b90002c8     	str	w8, [x22]
 41f02bc: 54002742     	b.hs	0x41f07a4 <_ChromeMain+0x41eb508>
 41f02c0: b94042c2     	ldr	w2, [x22, #0x40]
 41f02c4: 3100045f     	cmn	w2, #0x1
 41f02c8: 54000720     	b.eq	0x41f03ac <_ChromeMain+0x41eb110>
 41f02cc: aa1603e0     	mov	x0, x22
 41f02d0: 52800001     	mov	w1, #0x0                ; =0
 41f02d4: 52803e83     	mov	w3, #0x1f4              ; =500
 41f02d8: 976adcea     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 41f02dc: f90023e0     	str	x0, [sp, #0x40]
 41f02e0: b40000a0     	cbz	x0, 0x41f02f4 <_ChromeMain+0x41eb058>
 41f02e4: b9400008     	ldr	w8, [x0]
 41f02e8: 31000508     	adds	w8, w8, #0x1
 41f02ec: b9000008     	str	w8, [x0]
 41f02f0: 54002602     	b.hs	0x41f07b0 <_ChromeMain+0x41eb514>
 41f02f4: f94002a8     	ldr	x8, [x21]
 41f02f8: f941ed08     	ldr	x8, [x8, #0x3d8]
 41f02fc: 910103e1     	add	x1, sp, #0x40
 41f0300: aa1503e0     	mov	x0, x21
 41f0304: d63f0100     	blr	x8
 41f0308: f94023e0     	ldr	x0, [sp, #0x40]
 41f030c: b40000c0     	cbz	x0, 0x41f0324 <_ChromeMain+0x41eb088>
 41f0310: b9400009     	ldr	w9, [x0]
 41f0314: 51000528     	sub	w8, w9, #0x1
 41f0318: b9000008     	str	w8, [x0]
 41f031c: 34002509     	cbz	w9, 0x41f07bc <_ChromeMain+0x41eb520>
 41f0320: 34000348     	cbz	w8, 0x41f0388 <_ChromeMain+0x41eb0ec>
 41f0324: b40000d6     	cbz	x22, 0x41f033c <_ChromeMain+0x41eb0a0>
 41f0328: b94002c9     	ldr	w9, [x22]
 41f032c: 51000528     	sub	w8, w9, #0x1
 41f0330: b90002c8     	str	w8, [x22]
 41f0334: 340024a9     	cbz	w9, 0x41f07c8 <_ChromeMain+0x41eb52c>
 41f0338: 340001e8     	cbz	w8, 0x41f0374 <_ChromeMain+0x41eb0d8>
 41f033c: 3959a268     	ldrb	w8, [x19, #0x668]
 41f0340: 37000428     	tbnz	w8, #0x0, 0x41f03c4 <_ChromeMain+0x41eb128>
 41f0344: aa1303e0     	mov	x0, x19
 41f0348: 94001154     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f034c: 5280cd55     	mov	w21, #0x66a             ; =1642
 41f0350: b4000360     	cbz	x0, 0x41f03bc <_ChromeMain+0x41eb120>
 41f0354: f9400008     	ldr	x8, [x0]
 41f0358: f9421508     	ldr	x8, [x8, #0x428]
 41f035c: 52800001     	mov	w1, #0x0                ; =0
 41f0360: d63f0100     	blr	x8
 41f0364: f2600008     	ands	x8, x0, #0x100000000
 41f0368: 1a8002b5     	csel	w21, w21, w0, eq
 41f036c: d360fd08     	lsr	x8, x8, #32
 41f0370: 14000017     	b	0x41f03cc <_ChromeMain+0x41eb130>
 41f0374: aa1603e0     	mov	x0, x22
 41f0378: 973d7113     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 41f037c: 52800a01     	mov	w1, #0x50               ; =80
 41f0380: 96f862ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0384: 17ffffee     	b	0x41f033c <_ChromeMain+0x41eb0a0>
 41f0388: 973d710f     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 41f038c: 52800a01     	mov	w1, #0x50               ; =80
 41f0390: 96f862ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0394: b5fffcb6     	cbnz	x22, 0x41f0328 <_ChromeMain+0x41eb08c>
 41f0398: 17ffffe9     	b	0x41f033c <_ChromeMain+0x41eb0a0>
 41f039c: aa1403e0     	mov	x0, x20
 41f03a0: 9780d768     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 41f03a4: b9404282     	ldr	w2, [x20, #0x40]
 41f03a8: 17ffffba     	b	0x41f0290 <_ChromeMain+0x41eaff4>
 41f03ac: aa1603e0     	mov	x0, x22
 41f03b0: 9780d764     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 41f03b4: b94042c2     	ldr	w2, [x22, #0x40]
 41f03b8: 17ffffc5     	b	0x41f02cc <_ChromeMain+0x41eb030>
 41f03bc: 52800008     	mov	w8, #0x0                ; =0
 41f03c0: 14000003     	b	0x41f03cc <_ChromeMain+0x41eb130>
 41f03c4: 52800008     	mov	w8, #0x0                ; =0
 41f03c8: 52801fd5     	mov	w21, #0xfe              ; =254
 41f03cc: b81c83b5     	stur	w21, [x29, #-0x38]
 41f03d0: 381cc3a8     	sturb	w8, [x29, #-0x34]
 41f03d4: d100e3a2     	sub	x2, x29, #0x38
 41f03d8: aa1303e0     	mov	x0, x19
 41f03dc: 52800001     	mov	w1, #0x0                ; =0
 41f03e0: 9772eddc     	bl	0x1eabb50 <_ChromeMain+0x1ea68b4>
 41f03e4: 3959a268     	ldrb	w8, [x19, #0x668]
 41f03e8: 370001e8     	tbnz	w8, #0x0, 0x41f0424 <_ChromeMain+0x41eb188>
 41f03ec: aa1303e0     	mov	x0, x19
 41f03f0: 9400112a     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f03f4: 5280cdb5     	mov	w21, #0x66d             ; =1645
 41f03f8: b4000120     	cbz	x0, 0x41f041c <_ChromeMain+0x41eb180>
 41f03fc: f9400008     	ldr	x8, [x0]
 41f0400: f9421508     	ldr	x8, [x8, #0x428]
 41f0404: 52800021     	mov	w1, #0x1                ; =1
 41f0408: d63f0100     	blr	x8
 41f040c: f2600008     	ands	x8, x0, #0x100000000
 41f0410: 1a8002b5     	csel	w21, w21, w0, eq
 41f0414: d360fd08     	lsr	x8, x8, #32
 41f0418: 14000005     	b	0x41f042c <_ChromeMain+0x41eb190>
 41f041c: 52800008     	mov	w8, #0x0                ; =0
 41f0420: 14000003     	b	0x41f042c <_ChromeMain+0x41eb190>
 41f0424: 52800008     	mov	w8, #0x0                ; =0
 41f0428: 52801fd5     	mov	w21, #0xfe              ; =254
 41f042c: b81c03b5     	stur	w21, [x29, #-0x40]
 41f0430: 381c43a8     	sturb	w8, [x29, #-0x3c]
 41f0434: d10103a2     	sub	x2, x29, #0x40
 41f0438: aa1303e0     	mov	x0, x19
 41f043c: 52800021     	mov	w1, #0x1                ; =1
 41f0440: 9772edc4     	bl	0x1eabb50 <_ChromeMain+0x1ea68b4>
 41f0444: 3959a268     	ldrb	w8, [x19, #0x668]
 41f0448: 37000228     	tbnz	w8, #0x0, 0x41f048c <_ChromeMain+0x41eb1f0>
 41f044c: aa1303e0     	mov	x0, x19
 41f0450: 94001112     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f0454: 5280cdf5     	mov	w21, #0x66f             ; =1647
 41f0458: b4000120     	cbz	x0, 0x41f047c <_ChromeMain+0x41eb1e0>
 41f045c: f9400008     	ldr	x8, [x0]
 41f0460: f9421508     	ldr	x8, [x8, #0x428]
 41f0464: 52800041     	mov	w1, #0x2                ; =2
 41f0468: d63f0100     	blr	x8
 41f046c: f2600008     	ands	x8, x0, #0x100000000
 41f0470: 1a8002b5     	csel	w21, w21, w0, eq
 41f0474: d360fd08     	lsr	x8, x8, #32
 41f0478: 14000007     	b	0x41f0494 <_ChromeMain+0x41eb1f8>
 41f047c: 52800008     	mov	w8, #0x0                ; =0
 41f0480: 14000005     	b	0x41f0494 <_ChromeMain+0x41eb1f8>
 41f0484: 52800008     	mov	w8, #0x0                ; =0
 41f0488: 14000014     	b	0x41f04d8 <_ChromeMain+0x41eb23c>
 41f048c: 52800008     	mov	w8, #0x0                ; =0
 41f0490: 52801fd5     	mov	w21, #0xfe              ; =254
 41f0494: b81b83b5     	stur	w21, [x29, #-0x48]
 41f0498: 381bc3a8     	sturb	w8, [x29, #-0x44]
 41f049c: d10123a2     	sub	x2, x29, #0x48
 41f04a0: aa1303e0     	mov	x0, x19
 41f04a4: 52800041     	mov	w1, #0x2                ; =2
 41f04a8: 9772edaa     	bl	0x1eabb50 <_ChromeMain+0x1ea68b4>
 41f04ac: aa1303e0     	mov	x0, x19
 41f04b0: 940010fa     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f04b4: 5280cdd5     	mov	w21, #0x66e             ; =1646
 41f04b8: b4fffe60     	cbz	x0, 0x41f0484 <_ChromeMain+0x41eb1e8>
 41f04bc: f9400008     	ldr	x8, [x0]
 41f04c0: f9421508     	ldr	x8, [x8, #0x428]
 41f04c4: 52800061     	mov	w1, #0x3                ; =3
 41f04c8: d63f0100     	blr	x8
 41f04cc: f2600008     	ands	x8, x0, #0x100000000
 41f04d0: 1a8002b5     	csel	w21, w21, w0, eq
 41f04d4: d360fd08     	lsr	x8, x8, #32
 41f04d8: b81b03b5     	stur	w21, [x29, #-0x50]
 41f04dc: 381b43a8     	sturb	w8, [x29, #-0x4c]
 41f04e0: d10143a2     	sub	x2, x29, #0x50
 41f04e4: aa1303e0     	mov	x0, x19
 41f04e8: 52800061     	mov	w1, #0x3                ; =3
 41f04ec: 9772ed99     	bl	0x1eabb50 <_ChromeMain+0x1ea68b4>
 41f04f0: f9000fff     	str	xzr, [sp, #0x18]
 41f04f4: 2f06e408     	movi	d8, #0xffff000000000000
 41f04f8: fd0013e8     	str	d8, [sp, #0x20]
 41f04fc: 52800035     	mov	w21, #0x1               ; =1
 41f0500: 3900a3f5     	strb	w21, [sp, #0x28]
 41f0504: f9001bff     	str	xzr, [sp, #0x30]
 41f0508: 3900e3ff     	strb	wzr, [sp, #0x38]
 41f050c: 390103ff     	strb	wzr, [sp, #0x40]
 41f0510: 52801ff6     	mov	w22, #0xff              ; =255
 41f0514: 390183f6     	strb	w22, [sp, #0x60]
 41f0518: 910103e0     	add	x0, sp, #0x40
 41f051c: 910063e1     	add	x1, sp, #0x18
 41f0520: 9725cb87     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 41f0524: 3901a3f5     	strb	w21, [sp, #0x68]
 41f0528: f9400268     	ldr	x8, [x19]
 41f052c: f9422d08     	ldr	x8, [x8, #0x458]
 41f0530: 910103e2     	add	x2, sp, #0x40
 41f0534: aa1303e0     	mov	x0, x19
 41f0538: 52800001     	mov	w1, #0x0                ; =0
 41f053c: d63f0100     	blr	x8
 41f0540: 3941a3e8     	ldrb	w8, [sp, #0x68]
 41f0544: 34000068     	cbz	w8, 0x41f0550 <_ChromeMain+0x41eb2b4>
 41f0548: 910103e0     	add	x0, sp, #0x40
 41f054c: 971958bd     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f0550: 910063e0     	add	x0, sp, #0x18
 41f0554: 971958bb     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f0558: f9000fff     	str	xzr, [sp, #0x18]
 41f055c: fd0013e8     	str	d8, [sp, #0x20]
 41f0560: 3900a3f5     	strb	w21, [sp, #0x28]
 41f0564: f9001bff     	str	xzr, [sp, #0x30]
 41f0568: 3900e3ff     	strb	wzr, [sp, #0x38]
 41f056c: 390103ff     	strb	wzr, [sp, #0x40]
 41f0570: 390183f6     	strb	w22, [sp, #0x60]
 41f0574: 910103e0     	add	x0, sp, #0x40
 41f0578: 910063e1     	add	x1, sp, #0x18
 41f057c: 9725cb70     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 41f0580: 3901a3f5     	strb	w21, [sp, #0x68]
 41f0584: f9400268     	ldr	x8, [x19]
 41f0588: f9422d08     	ldr	x8, [x8, #0x458]
 41f058c: 910103e2     	add	x2, sp, #0x40
 41f0590: aa1303e0     	mov	x0, x19
 41f0594: 52800021     	mov	w1, #0x1                ; =1
 41f0598: d63f0100     	blr	x8
 41f059c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 41f05a0: 34000068     	cbz	w8, 0x41f05ac <_ChromeMain+0x41eb310>
 41f05a4: 910103e0     	add	x0, sp, #0x40
 41f05a8: 971958a6     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f05ac: 910063e0     	add	x0, sp, #0x18
 41f05b0: 971958a4     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f05b4: f9000fff     	str	xzr, [sp, #0x18]
 41f05b8: fd0013e8     	str	d8, [sp, #0x20]
 41f05bc: 3900a3f5     	strb	w21, [sp, #0x28]
 41f05c0: f9001bff     	str	xzr, [sp, #0x30]
 41f05c4: 3900e3ff     	strb	wzr, [sp, #0x38]
 41f05c8: 390103ff     	strb	wzr, [sp, #0x40]
 41f05cc: 390183f6     	strb	w22, [sp, #0x60]
 41f05d0: 910103e0     	add	x0, sp, #0x40
 41f05d4: 910063e1     	add	x1, sp, #0x18
 41f05d8: 9725cb59     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 41f05dc: 3901a3f5     	strb	w21, [sp, #0x68]
 41f05e0: f9400268     	ldr	x8, [x19]
 41f05e4: f9422d08     	ldr	x8, [x8, #0x458]
 41f05e8: 910103e2     	add	x2, sp, #0x40
 41f05ec: aa1303e0     	mov	x0, x19
 41f05f0: 52800041     	mov	w1, #0x2                ; =2
 41f05f4: d63f0100     	blr	x8
 41f05f8: 3941a3e8     	ldrb	w8, [sp, #0x68]
 41f05fc: 34000068     	cbz	w8, 0x41f0608 <_ChromeMain+0x41eb36c>
 41f0600: 910103e0     	add	x0, sp, #0x40
 41f0604: 9719588f     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f0608: 910063e0     	add	x0, sp, #0x18
 41f060c: 9719588d     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f0610: f9000fff     	str	xzr, [sp, #0x18]
 41f0614: fd0013e8     	str	d8, [sp, #0x20]
 41f0618: 3900a3f5     	strb	w21, [sp, #0x28]
 41f061c: f9001bff     	str	xzr, [sp, #0x30]
 41f0620: 3900e3ff     	strb	wzr, [sp, #0x38]
 41f0624: 390103ff     	strb	wzr, [sp, #0x40]
 41f0628: 390183f6     	strb	w22, [sp, #0x60]
 41f062c: 910103e0     	add	x0, sp, #0x40
 41f0630: 910063e1     	add	x1, sp, #0x18
 41f0634: 9725cb42     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 41f0638: 3901a3f5     	strb	w21, [sp, #0x68]
 41f063c: f9400268     	ldr	x8, [x19]
 41f0640: f9422d08     	ldr	x8, [x8, #0x458]
 41f0644: 910103e2     	add	x2, sp, #0x40
 41f0648: aa1303e0     	mov	x0, x19
 41f064c: 52800061     	mov	w1, #0x3                ; =3
 41f0650: d63f0100     	blr	x8
 41f0654: 3941a3e8     	ldrb	w8, [sp, #0x68]
 41f0658: 34000068     	cbz	w8, 0x41f0664 <_ChromeMain+0x41eb3c8>
 41f065c: 910103e0     	add	x0, sp, #0x40
 41f0660: 97195878     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f0664: 910063e0     	add	x0, sp, #0x18
 41f0668: 97195876     	bl	0x846840 <_ChromeMain+0x8415a4>
 41f066c: aa1303e0     	mov	x0, x19
 41f0670: 970ec260     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 41f0674: b4000700     	cbz	x0, 0x41f0754 <_ChromeMain+0x41eb4b8>
 41f0678: 3959a268     	ldrb	w8, [x19, #0x668]
 41f067c: 35000528     	cbnz	w8, 0x41f0720 <_ChromeMain+0x41eb484>
 41f0680: aa1303e0     	mov	x0, x19
 41f0684: 94001085     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f0688: b40000c0     	cbz	x0, 0x41f06a0 <_ChromeMain+0x41eb404>
 41f068c: f9400008     	ldr	x8, [x0]
 41f0690: f9421108     	ldr	x8, [x8, #0x420]
 41f0694: d63f0100     	blr	x8
 41f0698: aa0003f5     	mov	x21, x0
 41f069c: b70000e0     	tbnz	x0, #0x20, 0x41f06b8 <_ChromeMain+0x41eb41c>
 41f06a0: aa1303e0     	mov	x0, x19
 41f06a4: 970ec253     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 41f06a8: b4000400     	cbz	x0, 0x41f0728 <_ChromeMain+0x41eb48c>
 41f06ac: 5280cca1     	mov	w1, #0x665              ; =1637
 41f06b0: 9734dec6     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 41f06b4: aa0003f5     	mov	x21, x0
 41f06b8: aa1503e0     	mov	x0, x21
 41f06bc: 975b2a81     	bl	0x18bb0c0 <_ChromeMain+0x18b5e24>
 41f06c0: 7100001f     	cmp	w0, #0x0
 41f06c4: 52bfe008     	mov	w8, #-0x1000000         ; =-16777216
 41f06c8: 5a9f0116     	csinv	w22, w8, wzr, eq
 41f06cc: aa1303e0     	mov	x0, x19
 41f06d0: 970ec248     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 41f06d4: b4000080     	cbz	x0, 0x41f06e4 <_ChromeMain+0x41eb448>
 41f06d8: 5280cd41     	mov	w1, #0x66a              ; =1642
 41f06dc: 9734debb     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 41f06e0: aa0003f6     	mov	x22, x0
 41f06e4: aa1303e0     	mov	x0, x19
 41f06e8: 9400106c     	bl	0x41f4898 <_ChromeMain+0x41ef5fc>
 41f06ec: b40000e0     	cbz	x0, 0x41f0708 <_ChromeMain+0x41eb46c>
 41f06f0: f9400008     	ldr	x8, [x0]
 41f06f4: f9421508     	ldr	x8, [x8, #0x428]
 41f06f8: 52800001     	mov	w1, #0x0                ; =0
 41f06fc: d63f0100     	blr	x8
 41f0700: f260001f     	tst	x0, #0x100000000
 41f0704: 1a8002d6     	csel	w22, w22, w0, eq
 41f0708: 9004eb08     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 41f070c: bd4c1d00     	ldr	s0, [x8, #0xc1c]
 41f0710: aa1603e0     	mov	x0, x22
 41f0714: aa1503e1     	mov	x1, x21
 41f0718: 972f794a     	bl	0xdcec40 <_ChromeMain+0xdc99a4>
 41f071c: 14000003     	b	0x41f0728 <_ChromeMain+0x41eb48c>
 41f0720: 52801fa1     	mov	w1, #0xfd               ; =253
 41f0724: 9734dea9     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 41f0728: b90013e0     	str	w0, [sp, #0x10]
 41f072c: 52800028     	mov	w8, #0x1                ; =1
 41f0730: 390053e8     	strb	w8, [sp, #0x14]
 41f0734: 9004eb08     	adrp	x8, 0xdf50000 <dyld_stub_binder+0xdf50000>
 41f0738: bd4c0d00     	ldr	s0, [x8, #0xc0c]
 41f073c: 910043e0     	add	x0, sp, #0x10
 41f0740: 52800001     	mov	w1, #0x0                ; =0
 41f0744: 9795ba5f     	bl	0x275f0c0 <_ChromeMain+0x2759e24>
 41f0748: aa0003e1     	mov	x1, x0
 41f074c: aa1303e0     	mov	x0, x19
 41f0750: 9734dcac     	bl	0xf27a00 <_ChromeMain+0xf22764>
 41f0754: b40000d4     	cbz	x20, 0x41f076c <_ChromeMain+0x41eb4d0>
 41f0758: b9400289     	ldr	w9, [x20]
 41f075c: 51000528     	sub	w8, w9, #0x1
 41f0760: b9000288     	str	w8, [x20]
 41f0764: 34000389     	cbz	w9, 0x41f07d4 <_ChromeMain+0x41eb538>
 41f0768: 340000e8     	cbz	w8, 0x41f0784 <_ChromeMain+0x41eb4e8>
 41f076c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 41f0770: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 41f0774: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 41f0778: 6d4923e9     	ldp	d9, d8, [sp, #0x90]
 41f077c: 910343ff     	add	sp, sp, #0xd0
 41f0780: d65f03c0     	ret
 41f0784: aa1403e0     	mov	x0, x20
 41f0788: 973d700f     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 41f078c: 52800a01     	mov	w1, #0x50               ; =80
 41f0790: 96f861ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0794: 17fffff6     	b	0x41f076c <_ChromeMain+0x41eb4d0>
 41f0798: d4200000     	brk	#0
 41f079c: d4400000     	hlt	#0
 41f07a0: d4200020     	brk	#0x1
 41f07a4: d4200000     	brk	#0
 41f07a8: d4400000     	hlt	#0
 41f07ac: d4200020     	brk	#0x1
 41f07b0: d4200000     	brk	#0
 41f07b4: d4400000     	hlt	#0
 41f07b8: d4200020     	brk	#0x1
 41f07bc: d4200000     	brk	#0
 41f07c0: d4400000     	hlt	#0
 41f07c4: d4200020     	brk	#0x1
 41f07c8: d4200000     	brk	#0
 41f07cc: d4400000     	hlt	#0
 41f07d0: d4200020     	brk	#0x1
 41f07d4: d4200000     	brk	#0
 41f07d8: d4400000     	hlt	#0
 41f07dc: d4200020     	brk	#0x1
 41f07e0: aa1403e0     	mov	x0, x20
 41f07e4: 9780d657     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 41f07e8: b9404688     	ldr	w8, [x20, #0x44]
 41f07ec: 17fffea4     	b	0x41f027c <_ChromeMain+0x41eafe0>
 41f07f0: aa1403e0     	mov	x0, x20
 41f07f4: b9000fe2     	str	w2, [sp, #0xc]
 41f07f8: 9780d652     	bl	0x2226140 <_ChromeMain+0x2220ea4>
 41f07fc: b9400fe2     	ldr	w2, [sp, #0xc]
 41f0800: b9404a83     	ldr	w3, [x20, #0x48]
 41f0804: 17fffea6     	b	0x41f029c <_ChromeMain+0x41eb000>
