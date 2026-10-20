
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 411f0c0: d10443ff     	sub	sp, sp, #0x110
 411f0c4: a90d5ff8     	stp	x24, x23, [sp, #0xd0]
 411f0c8: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 411f0cc: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 411f0d0: a9107bfd     	stp	x29, x30, [sp, #0x100]
 411f0d4: 910403fd     	add	x29, sp, #0x100
 411f0d8: aa0403f5     	mov	x21, x4
 411f0dc: aa0303f6     	mov	x22, x3
 411f0e0: aa0203f7     	mov	x23, x2
 411f0e4: aa0103f4     	mov	x20, x1
 411f0e8: aa0003f3     	mov	x19, x0
 411f0ec: 91108008     	add	x8, x0, #0x420
 411f0f0: eb01011f     	cmp	x8, x1
 411f0f4: 54000120     	b.eq	0x411f118 <_ChromeMain+0x4119e7c>
 411f0f8: 39d0de6a     	ldrsb	w10, [x19, #0x437]
 411f0fc: 39405e89     	ldrb	w9, [x20, #0x17]
 411f100: 37f8064a     	tbnz	w10, #0x1f, 0x411f1c8 <_ChromeMain+0x4119f2c>
 411f104: 373805a9     	tbnz	w9, #0x7, 0x411f1b8 <_ChromeMain+0x4119f1c>
 411f108: 3dc00280     	ldr	q0, [x20]
 411f10c: f9400a89     	ldr	x9, [x20, #0x10]
 411f110: f9000909     	str	x9, [x8, #0x10]
 411f114: 3d800100     	str	q0, [x8]
 411f118: b9401a88     	ldr	w8, [x20, #0x18]
 411f11c: 39407289     	ldrb	w9, [x20, #0x1c]
 411f120: 3910f269     	strb	w9, [x19, #0x43c]
 411f124: b9043a68     	str	w8, [x19, #0x438]
 411f128: 91110269     	add	x9, x19, #0x440
 411f12c: 91008288     	add	x8, x20, #0x20
 411f130: eb08013f     	cmp	x9, x8
 411f134: 54000120     	b.eq	0x411f158 <_ChromeMain+0x4119ebc>
 411f138: 39d15e6b     	ldrsb	w11, [x19, #0x457]
 411f13c: 3940de8a     	ldrb	w10, [x20, #0x37]
 411f140: 37f84fab     	tbnz	w11, #0x1f, 0x411fb34 <_ChromeMain+0x411a898>
 411f144: 3738032a     	tbnz	w10, #0x7, 0x411f1a8 <_ChromeMain+0x4119f0c>
 411f148: 3dc00100     	ldr	q0, [x8]
 411f14c: f9400908     	ldr	x8, [x8, #0x10]
 411f150: f9000928     	str	x8, [x9, #0x10]
 411f154: 3d800120     	str	q0, [x9]
 411f158: 3940e288     	ldrb	w8, [x20, #0x38]
 411f15c: 39116268     	strb	w8, [x19, #0x458]
 411f160: 39118277     	strb	w23, [x19, #0x460]
 411f164: 39118676     	strb	w22, [x19, #0x461]
 411f168: 39131275     	strb	w21, [x19, #0x4c4]
 411f16c: 39805e88     	ldrsb	x8, [x20, #0x17]
 411f170: b6f80048     	tbz	x8, #0x3f, 0x411f178 <_ChromeMain+0x4119edc>
 411f174: f9400688     	ldr	x8, [x20, #0x8]
 411f178: f100011f     	cmp	x8, #0x0
 411f17c: 1a9f07e8     	cset	w8, ne
 411f180: 39131668     	strb	w8, [x19, #0x4c5]
 411f184: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 411f188: f9001bff     	str	xzr, [sp, #0x30]
 411f18c: 39c05e88     	ldrsb	w8, [x20, #0x17]
 411f190: 37f802c8     	tbnz	w8, #0x1f, 0x411f1e8 <_ChromeMain+0x4119f4c>
 411f194: 3dc00280     	ldr	q0, [x20]
 411f198: 3d800be0     	str	q0, [sp, #0x20]
 411f19c: f9400a88     	ldr	x8, [x20, #0x10]
 411f1a0: f9001be8     	str	x8, [sp, #0x30]
 411f1a4: 14000014     	b	0x411f1f4 <_ChromeMain+0x4119f58>
 411f1a8: a9420a81     	ldp	x1, x2, [x20, #0x20]
 411f1ac: 91110260     	add	x0, x19, #0x440
 411f1b0: 970e2641     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 411f1b4: 17ffffe9     	b	0x411f158 <_ChromeMain+0x4119ebc>
 411f1b8: a9400a81     	ldp	x1, x2, [x20]
 411f1bc: 91108260     	add	x0, x19, #0x420
 411f1c0: 971ebd4b     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 411f1c4: 17ffffd5     	b	0x411f118 <_ChromeMain+0x4119e7c>
 411f1c8: 13001d28     	sxtb	w8, w9
 411f1cc: 7100011f     	cmp	w8, #0x0
 411f1d0: a9402a88     	ldp	x8, x10, [x20]
 411f1d4: 9a944101     	csel	x1, x8, x20, mi
 411f1d8: 9a894142     	csel	x2, x10, x9, mi
 411f1dc: 91108260     	add	x0, x19, #0x420
 411f1e0: 971ebd95     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 411f1e4: 17ffffcd     	b	0x411f118 <_ChromeMain+0x4119e7c>
 411f1e8: a9400a81     	ldp	x1, x2, [x20]
 411f1ec: 910083e0     	add	x0, sp, #0x20
 411f1f0: 96fc9e78     	bl	0x46bd0 <_ChromeMain+0x41934>
 411f1f4: b944c268     	ldr	w8, [x19, #0x4c0]
 411f1f8: 7100051f     	cmp	w8, #0x1
 411f1fc: 540002a1     	b.ne	0x411f250 <_ChromeMain+0x4119fb4>
 411f200: 39531668     	ldrb	w8, [x19, #0x4c5]
 411f204: 37000268     	tbnz	w8, #0x0, 0x411f250 <_ChromeMain+0x4119fb4>
 411f208: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f20c: 37000228     	tbnz	w8, #0x0, 0x411f250 <_ChromeMain+0x4119fb4>
 411f210: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f214: b4004da0     	cbz	x0, 0x411fbc8 <_ChromeMain+0x411a92c>
 411f218: f9400008     	ldr	x8, [x0]
 411f21c: f9401109     	ldr	x9, [x8, #0x20]
 411f220: 910103e8     	add	x8, sp, #0x40
 411f224: d63f0120     	blr	x9
 411f228: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 411f22c: 36f800a8     	tbz	w8, #0x1f, 0x411f240 <_ChromeMain+0x4119fa4>
 411f230: f94013e0     	ldr	x0, [sp, #0x20]
 411f234: f9401be8     	ldr	x8, [sp, #0x30]
 411f238: d37ff901     	lsl	x1, x8, #1
 411f23c: 96fba71f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411f240: 3dc013e0     	ldr	q0, [sp, #0x40]
 411f244: 3d800be0     	str	q0, [sp, #0x20]
 411f248: f9402be8     	ldr	x8, [sp, #0x50]
 411f24c: f9001be8     	str	x8, [sp, #0x30]
 411f250: f9423e60     	ldr	x0, [x19, #0x478]
 411f254: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 411f258: 910083e9     	add	x9, sp, #0x20
 411f25c: a9422fea     	ldp	x10, x11, [sp, #0x20]
 411f260: f100011f     	cmp	x8, #0x0
 411f264: 9a894141     	csel	x1, x10, x9, mi
 411f268: 7100011f     	cmp	w8, #0x0
 411f26c: 9a884162     	csel	x2, x11, x8, mi
 411f270: f9400008     	ldr	x8, [x0]
 411f274: f941f108     	ldr	x8, [x8, #0x3e0]
 411f278: d63f0100     	blr	x8
 411f27c: f9423e75     	ldr	x21, [x19, #0x478]
 411f280: f9400268     	ldr	x8, [x19]
 411f284: f9403108     	ldr	x8, [x8, #0x60]
 411f288: aa1303e0     	mov	x0, x19
 411f28c: d63f0100     	blr	x8
 411f290: b4000100     	cbz	x0, 0x411f2b0 <_ChromeMain+0x411a014>
 411f294: f9400268     	ldr	x8, [x19]
 411f298: f9403108     	ldr	x8, [x8, #0x60]
 411f29c: aa1303e0     	mov	x0, x19
 411f2a0: d63f0100     	blr	x8
 411f2a4: 971d7109     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 411f2a8: aa0003e1     	mov	x1, x0
 411f2ac: 14000002     	b	0x411f2b4 <_ChromeMain+0x411a018>
 411f2b0: 52800021     	mov	w1, #0x1                ; =1
 411f2b4: b9443a60     	ldr	w0, [x19, #0x438]
 411f2b8: 9402ecde     	bl	0x41da630 <_ChromeMain+0x41d5394>
 411f2bc: d360fc08     	lsr	x8, x0, #32
 411f2c0: b9001be8     	str	w8, [sp, #0x18]
 411f2c4: 390073ff     	strb	wzr, [sp, #0x1c]
 411f2c8: f94002a8     	ldr	x8, [x21]
 411f2cc: f941f508     	ldr	x8, [x8, #0x3e8]
 411f2d0: 910063e1     	add	x1, sp, #0x18
 411f2d4: aa1503e0     	mov	x0, x21
 411f2d8: d63f0100     	blr	x8
 411f2dc: f9424275     	ldr	x21, [x19, #0x480]
 411f2e0: f9400268     	ldr	x8, [x19]
 411f2e4: f9403108     	ldr	x8, [x8, #0x60]
 411f2e8: aa1303e0     	mov	x0, x19
 411f2ec: d63f0100     	blr	x8
 411f2f0: b4000100     	cbz	x0, 0x411f310 <_ChromeMain+0x411a074>
 411f2f4: f9400268     	ldr	x8, [x19]
 411f2f8: f9403108     	ldr	x8, [x8, #0x60]
 411f2fc: aa1303e0     	mov	x0, x19
 411f300: d63f0100     	blr	x8
 411f304: 971d70f1     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 411f308: aa0003e1     	mov	x1, x0
 411f30c: 14000002     	b	0x411f314 <_ChromeMain+0x411a078>
 411f310: 52800021     	mov	w1, #0x1                ; =1
 411f314: 9110e277     	add	x23, x19, #0x438
 411f318: b9443a60     	ldr	w0, [x19, #0x438]
 411f31c: 9402ecc5     	bl	0x41da630 <_ChromeMain+0x41d5394>
 411f320: d2c00021     	mov	x1, #0x100000000        ; =4294967296
 411f324: b360fc01     	bfxil	x1, x0, #32, #32
 411f328: aa1503e0     	mov	x0, x21
 411f32c: 95967a55     	bl	0xa6bdc80 <_ChromeMain+0xa6b89e4>
 411f330: aa1303e0     	mov	x0, x19
 411f334: 9400022f     	bl	0x411fbf0 <_ChromeMain+0x411a954>
 411f338: f9423a60     	ldr	x0, [x19, #0x470]
 411f33c: 39531261     	ldrb	w1, [x19, #0x4c4]
 411f340: f9400008     	ldr	x8, [x0]
 411f344: f9405108     	ldr	x8, [x8, #0xa0]
 411f348: d63f0100     	blr	x8
 411f34c: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f350: 34000268     	cbz	w8, 0x411f39c <_ChromeMain+0x411a100>
 411f354: f9423a75     	ldr	x21, [x19, #0x470]
 411f358: 52801bc8     	mov	w8, #0xde               ; =222
 411f35c: b90013e8     	str	w8, [sp, #0x10]
 411f360: 390053ff     	strb	wzr, [sp, #0x14]
 411f364: d00545a0     	adrp	x0, 0xe9d5000 <dyld_stub_binder+0xe9d5000>
 411f368: 91212000     	add	x0, x0, #0x848
 411f36c: 910103e8     	add	x8, sp, #0x40
 411f370: 910043e1     	add	x1, sp, #0x10
 411f374: 52800202     	mov	w2, #0x10               ; =16
 411f378: d2800003     	mov	x3, #0x0                ; =0
 411f37c: 97335569     	bl	0xdf4920 <_ChromeMain+0xdef684>
 411f380: 910103e1     	add	x1, sp, #0x40
 411f384: aa1503e0     	mov	x0, x21
 411f388: 97120746     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 411f38c: 910103e0     	add	x0, sp, #0x40
 411f390: 971c9d2c     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f394: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f398: 37000528     	tbnz	w8, #0x0, 0x411f43c <_ChromeMain+0x411a1a0>
 411f39c: 39407288     	ldrb	w8, [x20, #0x1c]
 411f3a0: 340004e8     	cbz	w8, 0x411f43c <_ChromeMain+0x411a1a0>
 411f3a4: 39518268     	ldrb	w8, [x19, #0x460]
 411f3a8: 340004a8     	cbz	w8, 0x411f43c <_ChromeMain+0x411a1a0>
 411f3ac: f9424660     	ldr	x0, [x19, #0x488]
 411f3b0: f9400008     	ldr	x8, [x0]
 411f3b4: f9405108     	ldr	x8, [x8, #0xa0]
 411f3b8: 52800036     	mov	w22, #0x1               ; =1
 411f3bc: 52800021     	mov	w1, #0x1                ; =1
 411f3c0: d63f0100     	blr	x8
 411f3c4: f9424675     	ldr	x21, [x19, #0x488]
 411f3c8: f9400268     	ldr	x8, [x19]
 411f3cc: f9403108     	ldr	x8, [x8, #0x60]
 411f3d0: aa1303e0     	mov	x0, x19
 411f3d4: d63f0100     	blr	x8
 411f3d8: b40000e0     	cbz	x0, 0x411f3f4 <_ChromeMain+0x411a158>
 411f3dc: f9400268     	ldr	x8, [x19]
 411f3e0: f9403108     	ldr	x8, [x8, #0x60]
 411f3e4: aa1303e0     	mov	x0, x19
 411f3e8: d63f0100     	blr	x8
 411f3ec: 971d70b7     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 411f3f0: aa0003f6     	mov	x22, x0
 411f3f4: b94002e0     	ldr	w0, [x23]
 411f3f8: aa1603e1     	mov	x1, x22
 411f3fc: 9402ec8d     	bl	0x41da630 <_ChromeMain+0x41d5394>
 411f400: b9000be0     	str	w0, [sp, #0x8]
 411f404: 390033ff     	strb	wzr, [sp, #0xc]
 411f408: b0053860     	adrp	x0, 0xe82c000 <dyld_stub_binder+0xe82c000>
 411f40c: 91234000     	add	x0, x0, #0x8d0
 411f410: 910103e8     	add	x8, sp, #0x40
 411f414: 910023e1     	add	x1, sp, #0x8
 411f418: 52800102     	mov	w2, #0x8                ; =8
 411f41c: d2800003     	mov	x3, #0x0                ; =0
 411f420: 97335540     	bl	0xdf4920 <_ChromeMain+0xdef684>
 411f424: 910103e1     	add	x1, sp, #0x40
 411f428: aa1503e0     	mov	x0, x21
 411f42c: 9712071d     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 411f430: 910103e0     	add	x0, sp, #0x40
 411f434: 971c9d03     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f438: 14000006     	b	0x411f450 <_ChromeMain+0x411a1b4>
 411f43c: f9424660     	ldr	x0, [x19, #0x488]
 411f440: f9400008     	ldr	x8, [x0]
 411f444: f9405108     	ldr	x8, [x8, #0xa0]
 411f448: 52800001     	mov	w1, #0x0                ; =0
 411f44c: d63f0100     	blr	x8
 411f450: b944c268     	ldr	w8, [x19, #0x4c0]
 411f454: 7100051f     	cmp	w8, #0x1
 411f458: 540000e0     	b.eq	0x411f474 <_ChromeMain+0x411a1d8>
 411f45c: 35000228     	cbnz	w8, 0x411f4a0 <_ChromeMain+0x411a204>
 411f460: 39407288     	ldrb	w8, [x20, #0x1c]
 411f464: 34000248     	cbz	w8, 0x411f4ac <_ChromeMain+0x411a210>
 411f468: 52800008     	mov	w8, #0x0                ; =0
 411f46c: 39531676     	ldrb	w22, [x19, #0x4c5]
 411f470: 14000010     	b	0x411f4b0 <_ChromeMain+0x411a214>
 411f474: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f478: 340001a8     	cbz	w8, 0x411f4ac <_ChromeMain+0x411a210>
 411f47c: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f480: b40039e0     	cbz	x0, 0x411fbbc <_ChromeMain+0x411a920>
 411f484: f9400008     	ldr	x8, [x0]
 411f488: f9403508     	ldr	x8, [x8, #0x68]
 411f48c: d63f0100     	blr	x8
 411f490: 52800016     	mov	w22, #0x0               ; =0
 411f494: f100001f     	cmp	x0, #0x0
 411f498: 1a9f17e8     	cset	w8, eq
 411f49c: 14000005     	b	0x411f4b0 <_ChromeMain+0x411a214>
 411f4a0: 52800016     	mov	w22, #0x0               ; =0
 411f4a4: 52800008     	mov	w8, #0x0                ; =0
 411f4a8: 14000002     	b	0x411f4b0 <_ChromeMain+0x411a214>
 411f4ac: 52800016     	mov	w22, #0x0               ; =0
 411f4b0: f940ce69     	ldr	x9, [x19, #0x198]
 411f4b4: d37df129     	lsl	x9, x9, #3
 411f4b8: b4003509     	cbz	x9, 0x411fb58 <_ChromeMain+0x411a8bc>
 411f4bc: d280000a     	mov	x10, #0x0               ; =0
 411f4c0: f9424a60     	ldr	x0, [x19, #0x490]
 411f4c4: f940ca6b     	ldr	x11, [x19, #0x190]
 411f4c8: f86a696c     	ldr	x12, [x11, x10]
 411f4cc: eb00019f     	cmp	x12, x0
 411f4d0: 540000a0     	b.eq	0x411f4e4 <_ChromeMain+0x411a248>
 411f4d4: 9100214a     	add	x10, x10, #0x8
 411f4d8: eb0a013f     	cmp	x9, x10
 411f4dc: 54ffff61     	b.ne	0x411f4c8 <_ChromeMain+0x411a22c>
 411f4e0: 1400019e     	b	0x411fb58 <_ChromeMain+0x411a8bc>
 411f4e4: d280000c     	mov	x12, #0x0               ; =0
 411f4e8: 9343fd42     	asr	x2, x10, #3
 411f4ec: f9425261     	ldr	x1, [x19, #0x4a0]
 411f4f0: f86c696d     	ldr	x13, [x11, x12]
 411f4f4: eb0101bf     	cmp	x13, x1
 411f4f8: 540000a0     	b.eq	0x411f50c <_ChromeMain+0x411a270>
 411f4fc: 9100218c     	add	x12, x12, #0x8
 411f500: eb0c013f     	cmp	x9, x12
 411f504: 54ffff61     	b.ne	0x411f4f0 <_ChromeMain+0x411a254>
 411f508: 14000194     	b	0x411fb58 <_ChromeMain+0x411a8bc>
 411f50c: eb0a019f     	cmp	x12, x10
 411f510: 1a9f27e9     	cset	w9, lo
 411f514: 6b09011f     	cmp	w8, w9
 411f518: 54000080     	b.eq	0x411f528 <_ChromeMain+0x411a28c>
 411f51c: aa1303e0     	mov	x0, x19
 411f520: 97d4c016     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 411f524: f9424a60     	ldr	x0, [x19, #0x490]
 411f528: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f52c: 2a160108     	orr	w8, w8, w22
 411f530: f9400009     	ldr	x9, [x0]
 411f534: f9405129     	ldr	x9, [x9, #0xa0]
 411f538: 12000101     	and	w1, w8, #0x1
 411f53c: d63f0120     	blr	x9
 411f540: f9424e75     	ldr	x21, [x19, #0x498]
 411f544: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f548: 2a160108     	orr	w8, w8, w22
 411f54c: 36000168     	tbz	w8, #0x0, 0x411f578 <_ChromeMain+0x411a2dc>
 411f550: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f554: b4003100     	cbz	x0, 0x411fb74 <_ChromeMain+0x411a8d8>
 411f558: f9400008     	ldr	x8, [x0]
 411f55c: f9401508     	ldr	x8, [x8, #0x28]
 411f560: d63f0100     	blr	x8
 411f564: 910103e8     	add	x8, sp, #0x40
 411f568: 974c797c     	bl	0x143db58 <_ChromeMain+0x14388bc>
 411f56c: 39415fe9     	ldrb	w9, [sp, #0x57]
 411f570: a94423ea     	ldp	x10, x8, [sp, #0x40]
 411f574: 14000006     	b	0x411f58c <_ChromeMain+0x411a2f0>
 411f578: d2800008     	mov	x8, #0x0                ; =0
 411f57c: d280000a     	mov	x10, #0x0               ; =0
 411f580: 52800009     	mov	w9, #0x0                ; =0
 411f584: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 411f588: f9002bff     	str	xzr, [sp, #0x50]
 411f58c: 13001d2b     	sxtb	w11, w9
 411f590: 7100017f     	cmp	w11, #0x0
 411f594: 910103eb     	add	x11, sp, #0x40
 411f598: 9a8b4141     	csel	x1, x10, x11, mi
 411f59c: 2a0903e9     	mov	w9, w9
 411f5a0: 9a894102     	csel	x2, x8, x9, mi
 411f5a4: f94002a8     	ldr	x8, [x21]
 411f5a8: f941f108     	ldr	x8, [x8, #0x3e0]
 411f5ac: aa1503e0     	mov	x0, x21
 411f5b0: d63f0100     	blr	x8
 411f5b4: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 411f5b8: 36f800a8     	tbz	w8, #0x1f, 0x411f5cc <_ChromeMain+0x411a330>
 411f5bc: f94023e0     	ldr	x0, [sp, #0x40]
 411f5c0: f9402be8     	ldr	x8, [sp, #0x50]
 411f5c4: d37ff901     	lsl	x1, x8, #1
 411f5c8: 96fba63c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411f5cc: 360004d6     	tbz	w22, #0x0, 0x411f664 <_ChromeMain+0x411a3c8>
 411f5d0: f9424e75     	ldr	x21, [x19, #0x498]
 411f5d4: aa1303e0     	mov	x0, x19
 411f5d8: 97120686     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 411f5dc: b4000320     	cbz	x0, 0x411f640 <_ChromeMain+0x411a3a4>
 411f5e0: aa1303e0     	mov	x0, x19
 411f5e4: 97120683     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 411f5e8: aa0003f6     	mov	x22, x0
 411f5ec: f9400268     	ldr	x8, [x19]
 411f5f0: f9403108     	ldr	x8, [x8, #0x60]
 411f5f4: aa1303e0     	mov	x0, x19
 411f5f8: d63f0100     	blr	x8
 411f5fc: b4000100     	cbz	x0, 0x411f61c <_ChromeMain+0x411a380>
 411f600: f9400268     	ldr	x8, [x19]
 411f604: f9403108     	ldr	x8, [x8, #0x60]
 411f608: aa1303e0     	mov	x0, x19
 411f60c: d63f0100     	blr	x8
 411f610: 971d702e     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 411f614: aa0003e1     	mov	x1, x0
 411f618: 14000002     	b	0x411f620 <_ChromeMain+0x411a384>
 411f61c: 52800021     	mov	w1, #0x1                ; =1
 411f620: b94002e0     	ldr	w0, [x23]
 411f624: 9402ec03     	bl	0x41da630 <_ChromeMain+0x41d5394>
 411f628: aa0003e1     	mov	x1, x0
 411f62c: aa1603e0     	mov	x0, x22
 411f630: 973822e6     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 411f634: 52b00008     	mov	w8, #-0x80000000        ; =-2147483648
 411f638: 33005c08     	bfxil	w8, w0, #0, #24
 411f63c: 14000002     	b	0x411f644 <_ChromeMain+0x411a3a8>
 411f640: 52b00008     	mov	w8, #-0x80000000        ; =-2147483648
 411f644: b90003e8     	str	w8, [sp]
 411f648: 52800028     	mov	w8, #0x1                ; =1
 411f64c: 390013e8     	strb	w8, [sp, #0x4]
 411f650: f94002a8     	ldr	x8, [x21]
 411f654: f941f508     	ldr	x8, [x8, #0x3e8]
 411f658: 910003e1     	mov	x1, sp
 411f65c: aa1503e0     	mov	x0, x21
 411f660: d63f0100     	blr	x8
 411f664: f9425a75     	ldr	x21, [x19, #0x4b0]
 411f668: b4000a15     	cbz	x21, 0x411f7a8 <_ChromeMain+0x411a50c>
 411f66c: f9400268     	ldr	x8, [x19]
 411f670: f9403108     	ldr	x8, [x8, #0x60]
 411f674: aa1303e0     	mov	x0, x19
 411f678: d63f0100     	blr	x8
 411f67c: 52800036     	mov	w22, #0x1               ; =1
 411f680: 52800021     	mov	w1, #0x1                ; =1
 411f684: b40000e0     	cbz	x0, 0x411f6a0 <_ChromeMain+0x411a404>
 411f688: f9400268     	ldr	x8, [x19]
 411f68c: f9403108     	ldr	x8, [x8, #0x60]
 411f690: aa1303e0     	mov	x0, x19
 411f694: d63f0100     	blr	x8
 411f698: 971d700c     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 411f69c: aa0003e1     	mov	x1, x0
 411f6a0: b94002e0     	ldr	w0, [x23]
 411f6a4: 9402ebe3     	bl	0x41da630 <_ChromeMain+0x41d5394>
 411f6a8: f9004bff     	str	xzr, [sp, #0x90]
 411f6ac: 6f00e400     	movi.2d	v0, #0000000000000000
 411f6b0: ad0383e0     	stp	q0, q0, [sp, #0x70]
 411f6b4: b81b83a0     	stur	w0, [x29, #-0x48]
 411f6b8: 381bc3bf     	sturb	wzr, [x29, #-0x44]
 411f6bc: b00545a0     	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 411f6c0: 9132a000     	add	x0, x0, #0xca8
 411f6c4: 9101c3e8     	add	x8, sp, #0x70
 411f6c8: d10123a1     	sub	x1, x29, #0x48
 411f6cc: 52800202     	mov	w2, #0x10               ; =16
 411f6d0: d2800003     	mov	x3, #0x0                ; =0
 411f6d4: 97335493     	bl	0xdf4920 <_ChromeMain+0xdef684>
 411f6d8: 390103ff     	strb	wzr, [sp, #0x40]
 411f6dc: 52801ff7     	mov	w23, #0xff              ; =255
 411f6e0: 390183f7     	strb	w23, [sp, #0x60]
 411f6e4: 910103e0     	add	x0, sp, #0x40
 411f6e8: 9101c3e1     	add	x1, sp, #0x70
 411f6ec: 97167da8     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 411f6f0: 3901a3f6     	strb	w22, [sp, #0x68]
 411f6f4: f94002a8     	ldr	x8, [x21]
 411f6f8: f9422d08     	ldr	x8, [x8, #0x458]
 411f6fc: 910103e2     	add	x2, sp, #0x40
 411f700: aa1503e0     	mov	x0, x21
 411f704: 52800001     	mov	w1, #0x0                ; =0
 411f708: d63f0100     	blr	x8
 411f70c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 411f710: 34000068     	cbz	w8, 0x411f71c <_ChromeMain+0x411a480>
 411f714: 910103e0     	add	x0, sp, #0x40
 411f718: 971c9c4a     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f71c: 390103ff     	strb	wzr, [sp, #0x40]
 411f720: 390183f7     	strb	w23, [sp, #0x60]
 411f724: 910103e0     	add	x0, sp, #0x40
 411f728: 9101c3e1     	add	x1, sp, #0x70
 411f72c: 97167d98     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 411f730: 3901a3f6     	strb	w22, [sp, #0x68]
 411f734: f94002a8     	ldr	x8, [x21]
 411f738: f9422d08     	ldr	x8, [x8, #0x458]
 411f73c: 910103e2     	add	x2, sp, #0x40
 411f740: aa1503e0     	mov	x0, x21
 411f744: 52800021     	mov	w1, #0x1                ; =1
 411f748: d63f0100     	blr	x8
 411f74c: 3941a3e8     	ldrb	w8, [sp, #0x68]
 411f750: 34000068     	cbz	w8, 0x411f75c <_ChromeMain+0x411a4c0>
 411f754: 910103e0     	add	x0, sp, #0x40
 411f758: 971c9c3a     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f75c: 390103ff     	strb	wzr, [sp, #0x40]
 411f760: 52801fe8     	mov	w8, #0xff               ; =255
 411f764: 390183e8     	strb	w8, [sp, #0x60]
 411f768: 910103e0     	add	x0, sp, #0x40
 411f76c: 9101c3e1     	add	x1, sp, #0x70
 411f770: 97167d87     	bl	0x6bed8c <_ChromeMain+0x6b9af0>
 411f774: 3901a3f6     	strb	w22, [sp, #0x68]
 411f778: f94002a8     	ldr	x8, [x21]
 411f77c: f9422d08     	ldr	x8, [x8, #0x458]
 411f780: 910103e2     	add	x2, sp, #0x40
 411f784: aa1503e0     	mov	x0, x21
 411f788: 52800041     	mov	w1, #0x2                ; =2
 411f78c: d63f0100     	blr	x8
 411f790: 3941a3e8     	ldrb	w8, [sp, #0x68]
 411f794: 34000068     	cbz	w8, 0x411f7a0 <_ChromeMain+0x411a504>
 411f798: 910103e0     	add	x0, sp, #0x40
 411f79c: 971c9c29     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f7a0: 9101c3e0     	add	x0, sp, #0x70
 411f7a4: 971c9c27     	bl	0x846840 <_ChromeMain+0x8415a4>
 411f7a8: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f7ac: b4001d80     	cbz	x0, 0x411fb5c <_ChromeMain+0x411a8c0>
 411f7b0: b944c276     	ldr	w22, [x19, #0x4c0]
 411f7b4: f9425275     	ldr	x21, [x19, #0x4a0]
 411f7b8: f9400008     	ldr	x8, [x0]
 411f7bc: f9405908     	ldr	x8, [x8, #0xb0]
 411f7c0: d63f0100     	blr	x8
 411f7c4: 710002df     	cmp	w22, #0x0
 411f7c8: 1a9f0408     	csinc	w8, w0, wzr, eq
 411f7cc: 37000148     	tbnz	w8, #0x0, 0x411f7f4 <_ChromeMain+0x411a558>
 411f7d0: 39407288     	ldrb	w8, [x20, #0x1c]
 411f7d4: 35000068     	cbnz	w8, 0x411f7e0 <_ChromeMain+0x411a544>
 411f7d8: 52800001     	mov	w1, #0x0                ; =0
 411f7dc: 14000007     	b	0x411f7f8 <_ChromeMain+0x411a55c>
 411f7e0: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f7e4: b4001da0     	cbz	x0, 0x411fb98 <_ChromeMain+0x411a8fc>
 411f7e8: f9400008     	ldr	x8, [x0]
 411f7ec: f9401908     	ldr	x8, [x8, #0x30]
 411f7f0: d63f0100     	blr	x8
 411f7f4: 52000001     	eor	w1, w0, #0x1
 411f7f8: f94002a8     	ldr	x8, [x21]
 411f7fc: f9405108     	ldr	x8, [x8, #0xa0]
 411f800: aa1503e0     	mov	x0, x21
 411f804: d63f0100     	blr	x8
 411f808: aa1303e0     	mov	x0, x19
 411f80c: 940001b7     	bl	0x411fee8 <_ChromeMain+0x411ac4c>
 411f810: f9425275     	ldr	x21, [x19, #0x4a0]
 411f814: 35000076     	cbnz	w22, 0x411f820 <_ChromeMain+0x411a584>
 411f818: 52800008     	mov	w8, #0x0                ; =0
 411f81c: 14000003     	b	0x411f828 <_ChromeMain+0x411a58c>
 411f820: 39407288     	ldrb	w8, [x20, #0x1c]
 411f824: 52000108     	eor	w8, w8, #0x1
 411f828: 395042a9     	ldrb	w9, [x21, #0x410]
 411f82c: 12000108     	and	w8, w8, #0x1
 411f830: 6b08013f     	cmp	w9, w8
 411f834: 540000e0     	b.eq	0x411f850 <_ChromeMain+0x411a5b4>
 411f838: 391042a8     	strb	w8, [x21, #0x410]
 411f83c: 910e22a0     	add	x0, x21, #0x388
 411f840: 52000101     	eor	w1, w8, #0x1
 411f844: 9789fc48     	bl	0x239e964 <_ChromeMain+0x23996c8>
 411f848: aa1503e0     	mov	x0, x21
 411f84c: 9712064c     	bl	0x5a117c <_ChromeMain+0x59bee0>
 411f850: aa1303e0     	mov	x0, x19
 411f854: 975eaf27     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 411f858: aa0003e1     	mov	x1, x0
 411f85c: aa1303e0     	mov	x0, x19
 411f860: 97fffc87     	bl	0x411ea7c <_ChromeMain+0x41197e0>
 411f864: aa1303e0     	mov	x0, x19
 411f868: 94de1bab     	bl	0x78a6714 <_ChromeMain+0x78a1478>
 411f86c: f9416674     	ldr	x20, [x19, #0x2c8]
 411f870: b4001494     	cbz	x20, 0x411fb00 <_ChromeMain+0x411a864>
 411f874: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f878: b4001780     	cbz	x0, 0x411fb68 <_ChromeMain+0x411a8cc>
 411f87c: f9400008     	ldr	x8, [x0]
 411f880: f9402508     	ldr	x8, [x8, #0x48]
 411f884: d63f0100     	blr	x8
 411f888: 34000260     	cbz	w0, 0x411f8d4 <_ChromeMain+0x411a638>
 411f88c: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f890: b4001780     	cbz	x0, 0x411fb80 <_ChromeMain+0x411a8e4>
 411f894: f9400008     	ldr	x8, [x0]
 411f898: f9403508     	ldr	x8, [x8, #0x68]
 411f89c: d63f0100     	blr	x8
 411f8a0: f100001f     	cmp	x0, #0x0
 411f8a4: 1a9f07e1     	cset	w1, ne
 411f8a8: 1400000c     	b	0x411f8d8 <_ChromeMain+0x411a63c>
 411f8ac: f9401116     	ldr	x22, [x8, #0x20]
 411f8b0: 92800209     	mov	x9, #-0x11              ; =-17
 411f8b4: f2efffe9     	movk	x9, #0x7fff, lsl #48
 411f8b8: eb0902df     	cmp	x22, x9
 411f8bc: 540018c2     	b.hs	0x411fbd4 <_ChromeMain+0x411a938>
 411f8c0: f9400d14     	ldr	x20, [x8, #0x18]
 411f8c4: 1400001a     	b	0x411f92c <_ChromeMain+0x411a690>
 411f8c8: 381cf3b6     	sturb	w22, [x29, #-0x31]
 411f8cc: d10123b5     	sub	x21, x29, #0x48
 411f8d0: 14000022     	b	0x411f958 <_ChromeMain+0x411a6bc>
 411f8d4: 52800001     	mov	w1, #0x0                ; =0
 411f8d8: aa1403e0     	mov	x0, x20
 411f8dc: 97c02d39     	bl	0x312adc0 <_ChromeMain+0x3125b24>
 411f8e0: aa1303e0     	mov	x0, x19
 411f8e4: 94de1b98     	bl	0x78a6744 <_ChromeMain+0x78a14a8>
 411f8e8: f0055440     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 411f8ec: 910ee000     	add	x0, x0, #0x3b8
 411f8f0: 96ffe664     	bl	0x119280 <_ChromeMain+0x113fe4>
 411f8f4: 34000060     	cbz	w0, 0x411f900 <_ChromeMain+0x411a664>
 411f8f8: aa1303e0     	mov	x0, x19
 411f8fc: 97fffca8     	bl	0x411eb9c <_ChromeMain+0x4119900>
 411f900: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 411f904: f9002bff     	str	xzr, [sp, #0x50]
 411f908: 39531268     	ldrb	w8, [x19, #0x4c4]
 411f90c: 35000a28     	cbnz	w8, 0x411fa50 <_ChromeMain+0x411a7b4>
 411f910: 39531668     	ldrb	w8, [x19, #0x4c5]
 411f914: 36000708     	tbz	w8, #0x0, 0x411f9f4 <_ChromeMain+0x411a758>
 411f918: f9423e68     	ldr	x8, [x19, #0x478]
 411f91c: f941ad08     	ldr	x8, [x8, #0x358]
 411f920: 3980bd16     	ldrsb	x22, [x8, #0x2f]
 411f924: b7fffc56     	tbnz	x22, #0x3f, 0x411f8ac <_ChromeMain+0x411a610>
 411f928: 91006114     	add	x20, x8, #0x18
 411f92c: f1002adf     	cmp	x22, #0xa
 411f930: 54fffcc9     	b.ls	0x411f8c8 <_ChromeMain+0x411a62c>
 411f934: 927deed7     	and	x23, x22, #0x7ffffffffffffff8
 411f938: d37ffae8     	lsl	x8, x23, #1
 411f93c: 91004100     	add	x0, x8, #0x10
 411f940: 96fbbe8a     	bl	0xf368 <_ChromeMain+0xa0cc>
 411f944: aa0003f5     	mov	x21, x0
 411f948: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 411f94c: cb0802e8     	sub	x8, x23, x8
 411f950: a93bdba0     	stp	x0, x22, [x29, #-0x48]
 411f954: f81c83a8     	stur	x8, [x29, #-0x38]
 411f958: 8b1606a8     	add	x8, x21, x22, lsl #1
 411f95c: eb15011f     	cmp	x8, x21
 411f960: 54000fa3     	b.lo	0x411fb54 <_ChromeMain+0x411a8b8>
 411f964: eb1402bf     	cmp	x21, x20
 411f968: 54000068     	b.hi	0x411f974 <_ChromeMain+0x411a6d8>
 411f96c: eb14011f     	cmp	x8, x20
 411f970: 54000f28     	b.hi	0x411fb54 <_ChromeMain+0x411a8b8>
 411f974: d37ffac2     	lsl	x2, x22, #1
 411f978: aa1503e0     	mov	x0, x21
 411f97c: aa1403e1     	mov	x1, x20
 411f980: 94fbbe53     	bl	0x800f2cc <_ChromeMain+0x800a030>
 411f984: 78367abf     	strh	wzr, [x21, x22, lsl #1]
 411f988: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f98c: b4001120     	cbz	x0, 0x411fbb0 <_ChromeMain+0x411a914>
 411f990: f9400008     	ldr	x8, [x0]
 411f994: f9401109     	ldr	x9, [x8, #0x20]
 411f998: d10183a8     	sub	x8, x29, #0x60
 411f99c: d63f0120     	blr	x9
 411f9a0: 9101c3e8     	add	x8, sp, #0x70
 411f9a4: d10123a1     	sub	x1, x29, #0x48
 411f9a8: d10183a2     	sub	x2, x29, #0x60
 411f9ac: 528599e0     	mov	w0, #0x2ccf             ; =11471
 411f9b0: d2800003     	mov	x3, #0x0                ; =0
 411f9b4: 97995ef3     	bl	0x2777580 <_ChromeMain+0x27722e4>
 411f9b8: 38db73a8     	ldursb	w8, [x29, #-0x49]
 411f9bc: 3dc01fe0     	ldr	q0, [sp, #0x70]
 411f9c0: 3d8013e0     	str	q0, [sp, #0x40]
 411f9c4: f94043e9     	ldr	x9, [sp, #0x80]
 411f9c8: f9002be9     	str	x9, [sp, #0x50]
 411f9cc: 39021fff     	strb	wzr, [sp, #0x87]
 411f9d0: 7900e3ff     	strh	wzr, [sp, #0x70]
 411f9d4: 36f800a8     	tbz	w8, #0x1f, 0x411f9e8 <_ChromeMain+0x411a74c>
 411f9d8: f85a03a0     	ldur	x0, [x29, #-0x60]
 411f9dc: f85b03a8     	ldur	x8, [x29, #-0x50]
 411f9e0: d37ff901     	lsl	x1, x8, #1
 411f9e4: 96fba535     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411f9e8: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 411f9ec: 37f80288     	tbnz	w8, #0x1f, 0x411fa3c <_ChromeMain+0x411a7a0>
 411f9f0: 14000024     	b	0x411fa80 <_ChromeMain+0x411a7e4>
 411f9f4: f9425e60     	ldr	x0, [x19, #0x4b8]
 411f9f8: b4000d60     	cbz	x0, 0x411fba4 <_ChromeMain+0x411a908>
 411f9fc: f9400008     	ldr	x8, [x0]
 411fa00: f9401109     	ldr	x9, [x8, #0x20]
 411fa04: d10123a8     	sub	x8, x29, #0x48
 411fa08: d63f0120     	blr	x9
 411fa0c: 9101c3e8     	add	x8, sp, #0x70
 411fa10: d10123a1     	sub	x1, x29, #0x48
 411fa14: 528599c0     	mov	w0, #0x2cce             ; =11470
 411fa18: 971ca447     	bl	0x848b34 <_ChromeMain+0x843898>
 411fa1c: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 411fa20: 3dc01fe0     	ldr	q0, [sp, #0x70]
 411fa24: 3d8013e0     	str	q0, [sp, #0x40]
 411fa28: f94043e9     	ldr	x9, [sp, #0x80]
 411fa2c: f9002be9     	str	x9, [sp, #0x50]
 411fa30: 39021fff     	strb	wzr, [sp, #0x87]
 411fa34: 7900e3ff     	strh	wzr, [sp, #0x70]
 411fa38: 36f80248     	tbz	w8, #0x1f, 0x411fa80 <_ChromeMain+0x411a7e4>
 411fa3c: f85b83a0     	ldur	x0, [x29, #-0x48]
 411fa40: f85c83a8     	ldur	x8, [x29, #-0x38]
 411fa44: d37ff901     	lsl	x1, x8, #1
 411fa48: 96fba51c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411fa4c: 1400000d     	b	0x411fa80 <_ChromeMain+0x411a7e4>
 411fa50: 90056f88     	adrp	x8, 0xef0f000 <dyld_stub_binder+0xef0f000>
 411fa54: f946f500     	ldr	x0, [x8, #0xde8]
 411fa58: b40009a0     	cbz	x0, 0x411fb8c <_ChromeMain+0x411a8f0>
 411fa5c: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 411fa60: f90043ff     	str	xzr, [sp, #0x80]
 411fa64: 9101c3e8     	add	x8, sp, #0x70
 411fa68: 52858341     	mov	w1, #0x2c1a             ; =11290
 411fa6c: 9746531c     	bl	0x12b46dc <_ChromeMain+0x12af440>
 411fa70: 3dc01fe0     	ldr	q0, [sp, #0x70]
 411fa74: 3d8013e0     	str	q0, [sp, #0x40]
 411fa78: f94043e8     	ldr	x8, [sp, #0x80]
 411fa7c: f9002be8     	str	x8, [sp, #0x50]
 411fa80: 910103f4     	add	x20, sp, #0x40
 411fa84: 910103e1     	add	x1, sp, #0x40
 411fa88: aa1303e0     	mov	x0, x19
 411fa8c: 971c9bae     	bl	0x846944 <_ChromeMain+0x8416a8>
 411fa90: f9423e60     	ldr	x0, [x19, #0x478]
 411fa94: 39815fe8     	ldrsb	x8, [sp, #0x57]
 411fa98: a9442be9     	ldp	x9, x10, [sp, #0x40]
 411fa9c: f100011f     	cmp	x8, #0x0
 411faa0: 9a944121     	csel	x1, x9, x20, mi
 411faa4: 7100011f     	cmp	w8, #0x0
 411faa8: 9a884142     	csel	x2, x10, x8, mi
 411faac: 97120407     	bl	0x5a0ac8 <_ChromeMain+0x59b82c>
 411fab0: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 411fab4: 36f800a8     	tbz	w8, #0x1f, 0x411fac8 <_ChromeMain+0x411a82c>
 411fab8: f94023e0     	ldr	x0, [sp, #0x40]
 411fabc: f9402be8     	ldr	x8, [sp, #0x50]
 411fac0: d37ff901     	lsl	x1, x8, #1
 411fac4: 96fba4fd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411fac8: aa1303e0     	mov	x0, x19
 411facc: 971205ac     	bl	0x5a117c <_ChromeMain+0x59bee0>
 411fad0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 411fad4: 36f800a8     	tbz	w8, #0x1f, 0x411fae8 <_ChromeMain+0x411a84c>
 411fad8: f94013e0     	ldr	x0, [sp, #0x20]
 411fadc: f9401be8     	ldr	x8, [sp, #0x30]
 411fae0: d37ff901     	lsl	x1, x8, #1
 411fae4: 96fba4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 411fae8: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 411faec: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 411faf0: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 411faf4: a94d5ff8     	ldp	x24, x23, [sp, #0xd0]
 411faf8: 910443ff     	add	sp, sp, #0x110
 411fafc: d65f03c0     	ret
 411fb00: 97371980     	bl	0xee6100 <_ChromeMain+0xee0e64>
 411fb04: 350006a0     	cbnz	w0, 0x411fbd8 <_ChromeMain+0x411a93c>
 411fb08: aa1303e0     	mov	x0, x19
 411fb0c: 9746fad2     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 411fb10: aa0003f4     	mov	x20, x0
 411fb14: f9416660     	ldr	x0, [x19, #0x2c8]
 411fb18: f9016674     	str	x20, [x19, #0x2c8]
 411fb1c: b4ffeac0     	cbz	x0, 0x411f874 <_ChromeMain+0x411a5d8>
 411fb20: f9400008     	ldr	x8, [x0]
 411fb24: f9400508     	ldr	x8, [x8, #0x8]
 411fb28: d63f0100     	blr	x8
 411fb2c: f9416674     	ldr	x20, [x19, #0x2c8]
 411fb30: 17ffff51     	b	0x411f874 <_ChromeMain+0x411a5d8>
 411fb34: 13001d49     	sxtb	w9, w10
 411fb38: 7100013f     	cmp	w9, #0x0
 411fb3c: a9422e89     	ldp	x9, x11, [x20, #0x20]
 411fb40: 9a884121     	csel	x1, x9, x8, mi
 411fb44: 9a8a4162     	csel	x2, x11, x10, mi
 411fb48: 91110260     	add	x0, x19, #0x440
 411fb4c: 970e242d     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 411fb50: 17fffd82     	b	0x411f158 <_ChromeMain+0x4119ebc>
 411fb54: d4200020     	brk	#0x1
 411fb58: 942b81f1     	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 411fb5c: d4200000     	brk	#0
 411fb60: d4400000     	hlt	#0
 411fb64: d4200020     	brk	#0x1
 411fb68: d4200000     	brk	#0
 411fb6c: d4400000     	hlt	#0
 411fb70: d4200020     	brk	#0x1
 411fb74: d4200000     	brk	#0
 411fb78: d4400000     	hlt	#0
 411fb7c: d4200020     	brk	#0x1
 411fb80: d4200000     	brk	#0
 411fb84: d4400000     	hlt	#0
 411fb88: d4200020     	brk	#0x1
 411fb8c: d4200000     	brk	#0
 411fb90: d4400000     	hlt	#0
 411fb94: d4200020     	brk	#0x1
 411fb98: d4200000     	brk	#0
 411fb9c: d4400000     	hlt	#0
 411fba0: d4200020     	brk	#0x1
 411fba4: d4200000     	brk	#0
 411fba8: d4400000     	hlt	#0
 411fbac: d4200020     	brk	#0x1
 411fbb0: d4200000     	brk	#0
 411fbb4: d4400000     	hlt	#0
 411fbb8: d4200020     	brk	#0x1
 411fbbc: d4200000     	brk	#0
 411fbc0: d4400000     	hlt	#0
 411fbc4: d4200020     	brk	#0x1
 411fbc8: d4200000     	brk	#0
 411fbcc: d4400000     	hlt	#0
 411fbd0: d4200020     	brk	#0x1
 411fbd4: 94301175     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 411fbd8: 52803600     	mov	w0, #0x1b0              ; =432
 411fbdc: 96fbbde3     	bl	0xf368 <_ChromeMain+0xa0cc>
 411fbe0: aa0003f4     	mov	x20, x0
 411fbe4: aa1303e1     	mov	x1, x19
 411fbe8: 973717e6     	bl	0xee5b80 <_ChromeMain+0xee08e4>
 411fbec: 17ffffca     	b	0x411fb14 <_ChromeMain+0x411a878>
