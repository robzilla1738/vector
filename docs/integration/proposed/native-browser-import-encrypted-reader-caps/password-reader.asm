
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b128: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 425b12c: a90167fa     	stp	x26, x25, [sp, #0x10]
 425b130: a9025ff8     	stp	x24, x23, [sp, #0x20]
 425b134: a90357f6     	stp	x22, x21, [sp, #0x30]
 425b138: a9044ff4     	stp	x20, x19, [sp, #0x40]
 425b13c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 425b140: 910143fd     	add	x29, sp, #0x50
 425b144: d12d83ff     	sub	sp, sp, #0xb60
 425b148: f9002fe1     	str	x1, [sp, #0x58]
 425b14c: b004ee68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 425b150: f940f908     	ldr	x8, [x8, #0x1f0]
 425b154: f9400108     	ldr	x8, [x8]
 425b158: f81a03a8     	stur	x8, [x29, #-0x60]
 425b15c: b4003142     	cbz	x2, 0x425b784 <_ChromeMain+0x42564e8>
 425b160: aa0203f5     	mov	x21, x2
 425b164: aa0003f6     	mov	x22, x0
 425b168: a9402053     	ldp	x19, x8, [x2]
 425b16c: 52810609     	mov	w9, #0x830              ; =2096
 425b170: 9b097d09     	mul	x9, x8, x9
 425b174: b4000849     	cbz	x9, 0x425b27c <_ChromeMain+0x4255fe0>
 425b178: 8b130129     	add	x9, x9, x19
 425b17c: d120c120     	sub	x0, x9, #0x830
 425b180: 928105e9     	mov	x9, #-0x830             ; =-2096
 425b184: 9b097d14     	mul	x20, x8, x9
 425b188: b40007e0     	cbz	x0, 0x425b284 <_ChromeMain+0x4255fe8>
 425b18c: 94ac3864     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 425b190: d120c000     	sub	x0, x0, #0x830
 425b194: b120c294     	adds	x20, x20, #0x830
 425b198: 54ffff81     	b.ne	0x425b188 <_ChromeMain+0x4255eec>
 425b19c: f94002a8     	ldr	x8, [x21]
 425b1a0: cb080268     	sub	x8, x19, x8
 425b1a4: 9344fd08     	asr	x8, x8, #4
 425b1a8: d289c569     	mov	x9, #0x4e2b             ; =20011
 425b1ac: f2b92909     	movk	x9, #0xc948, lsl #16
 425b1b0: f2d19669     	movk	x9, #0x8cb3, lsl #32
 425b1b4: f2e07d09     	movk	x9, #0x3e8, lsl #48
 425b1b8: 9b097d08     	mul	x8, x8, x9
 425b1bc: f9003bf5     	str	x21, [sp, #0x70]
 425b1c0: f90006a8     	str	x8, [x21, #0x8]
 425b1c4: 910263e8     	add	x8, sp, #0x98
 425b1c8: 91002108     	add	x8, x8, #0x8
 425b1cc: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 425b1d0: f9004fe8     	str	x8, [sp, #0x98]
 425b1d4: 6f00e400     	movi.2d	v0, #0000000000000000
 425b1d8: ad1803e0     	stp	q0, q0, [sp, #0x300]
 425b1dc: 3d80bfe0     	str	q0, [sp, #0x2f0]
 425b1e0: 9004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425b1e4: 910afc21     	add	x1, x1, #0x2bf
 425b1e8: 910bc3f4     	add	x20, sp, #0x2f0
 425b1ec: 910bc3e8     	add	x8, sp, #0x2f0
 425b1f0: aa1603e0     	mov	x0, x22
 425b1f4: 52800142     	mov	w2, #0xa                ; =10
 425b1f8: 9750f887     	bl	0x1699414 <_ChromeMain+0x1694178>
 425b1fc: 9004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425b200: 910b2821     	add	x1, x1, #0x2ca
 425b204: 91006288     	add	x8, x20, #0x18
 425b208: aa1603e0     	mov	x0, x22
 425b20c: 528002c2     	mov	w2, #0x16               ; =22
 425b210: 9750f881     	bl	0x1699414 <_ChromeMain+0x1694178>
 425b214: 9100c288     	add	x8, x20, #0x30
 425b218: a90623ff     	stp	xzr, x8, [sp, #0x60]
 425b21c: 910c83f5     	add	x21, sp, #0x320
 425b220: 910942a8     	add	x8, x21, #0x250
 425b224: a904ffe8     	stp	x8, xzr, [sp, #0x48]
 425b228: 9109c2a9     	add	x9, x21, #0x270
 425b22c: 910b02a8     	add	x8, x21, #0x2c0
 425b230: a903a7e8     	stp	x8, x9, [sp, #0x38]
 425b234: 910b82a9     	add	x9, x21, #0x2e0
 425b238: 9108e2aa     	add	x10, x21, #0x238
 425b23c: 9118e2a8     	add	x8, x21, #0x638
 425b240: a902abe8     	stp	x8, x10, [sp, #0x28]
 425b244: 911b42aa     	add	x10, x21, #0x6d0
 425b248: 9102c3fc     	add	x28, sp, #0xb0
 425b24c: 911ba2a8     	add	x8, x21, #0x6e8
 425b250: a901abe8     	stp	x8, x10, [sp, #0x18]
 425b254: 911de2a8     	add	x8, x21, #0x778
 425b258: f9000be8     	str	x8, [sp, #0x10]
 425b25c: 911e42a8     	add	x8, x21, #0x790
 425b260: a90023e9     	stp	x9, x8, [sp]
 425b264: 9103a3f6     	add	x22, sp, #0xe8
 425b268: d004ac77     	adrp	x23, 0xd7e9000 <dyld_stub_binder+0xd7e9000>
 425b26c: 91110ef7     	add	x23, x23, #0x443
 425b270: 9004ac79     	adrp	x25, 0xd7e7000 <dyld_stub_binder+0xd7e7000>
 425b274: 91289339     	add	x25, x25, #0xa24
 425b278: 140000d2     	b	0x425b5c0 <_ChromeMain+0x4256324>
 425b27c: aa1303e8     	mov	x8, x19
 425b280: 17ffffc8     	b	0x425b1a0 <_ChromeMain+0x4255f04>
 425b284: d4200020     	brk	#0x1
 425b288: 52800013     	mov	w19, #0x0               ; =0
 425b28c: f940cbe8     	ldr	x8, [sp, #0x190]
 425b290: f9401508     	ldr	x8, [x8, #0x28]
 425b294: b4000108     	cbz	x8, 0x425b2b4 <_ChromeMain+0x4256018>
 425b298: 394673e8     	ldrb	w8, [sp, #0x19c]
 425b29c: 360000c8     	tbz	w8, #0x0, 0x425b2b4 <_ChromeMain+0x4256018>
 425b2a0: 52800033     	mov	w19, #0x1               ; =1
 425b2a4: b9419be8     	ldr	w8, [sp, #0x198]
 425b2a8: 51019109     	sub	w9, w8, #0x64
 425b2ac: 7100093f     	cmp	w9, #0x2
 425b2b0: 54005c02     	b.hs	0x425be30 <_ChromeMain+0x4256b94>
 425b2b4: 910643e0     	add	x0, sp, #0x190
 425b2b8: 97228623     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 425b2bc: 14000099     	b	0x425b520 <_ChromeMain+0x4256284>
 425b2c0: 52800013     	mov	w19, #0x0               ; =0
 425b2c4: 17fffffc     	b	0x425b2b4 <_ChromeMain+0x4256018>
 425b2c8: 6f00e400     	movi.2d	v0, #0000000000000000
 425b2cc: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 425b2d0: 9106c3e0     	add	x0, sp, #0x1b0
 425b2d4: 9004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425b2d8: 9119e821     	add	x1, x1, #0x67a
 425b2dc: 52803b02     	mov	w2, #0x1d8              ; =472
 425b2e0: 52800003     	mov	w3, #0x0                ; =0
 425b2e4: 97228b07     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 425b2e8: f900cbe0     	str	x0, [sp, #0x190]
 425b2ec: 390663ff     	strb	wzr, [sp, #0x198]
 425b2f0: 390673ff     	strb	wzr, [sp, #0x19c]
 425b2f4: 390683ff     	strb	wzr, [sp, #0x1a0]
 425b2f8: 3906a3ff     	strb	wzr, [sp, #0x1a8]
 425b2fc: f9401408     	ldr	x8, [x0, #0x28]
 425b300: b4fffe08     	cbz	x8, 0x425b2c0 <_ChromeMain+0x4256024>
 425b304: 910643e0     	add	x0, sp, #0x190
 425b308: 9718d4ee     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425b30c: 7101901f     	cmp	w0, #0x64
 425b310: 54fffbc1     	b.ne	0x425b288 <_ChromeMain+0x4255fec>
 425b314: 910643e0     	add	x0, sp, #0x190
 425b318: 52800121     	mov	w1, #0x9                ; =9
 425b31c: 9711eb65     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425b320: aa0003fa     	mov	x26, x0
 425b324: a917ffff     	stp	xzr, xzr, [sp, #0x178]
 425b328: f900c7ff     	str	xzr, [sp, #0x188]
 425b32c: 9105e3e8     	add	x8, sp, #0x178
 425b330: 910643e0     	add	x0, sp, #0x190
 425b334: 528000a1     	mov	w1, #0x5                ; =5
 425b338: 9534d982     	bl	0x8f91940 <_ChromeMain+0x8f8c6a4>
 425b33c: a9167fff     	stp	xzr, xzr, [sp, #0x160]
 425b340: f900bbff     	str	xzr, [sp, #0x170]
 425b344: 370026fa     	tbnz	w26, #0x0, 0x425b820 <_ChromeMain+0x4256584>
 425b348: 39463fe8     	ldrb	w8, [sp, #0x18f]
 425b34c: f940c3e9     	ldr	x9, [sp, #0x180]
 425b350: 7219011f     	tst	w8, #0x80
 425b354: 9a881128     	csel	x8, x9, x8, ne
 425b358: f100011f     	cmp	x8, #0x0
 425b35c: a945a3e1     	ldp	x1, x8, [sp, #0x58]
 425b360: 9a880508     	cinc	x8, x8, ne
 425b364: f90033e8     	str	x8, [sp, #0x60]
 425b368: 9105e3e0     	add	x0, sp, #0x178
 425b36c: 910583e2     	add	x2, sp, #0x160
 425b370: 9400068c     	bl	0x425cda0 <_ChromeMain+0x4257b04>
 425b374: 35002460     	cbnz	w0, 0x425b800 <_ChromeMain+0x4256564>
 425b378: 39c5dfe8     	ldrsb	w8, [sp, #0x177]
 425b37c: 36f800a8     	tbz	w8, #0x1f, 0x425b390 <_ChromeMain+0x42560f4>
 425b380: f940b3e0     	ldr	x0, [sp, #0x160]
 425b384: f940bbe8     	ldr	x8, [sp, #0x170]
 425b388: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b38c: 96f6b6cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b390: 39c63fe8     	ldrsb	w8, [sp, #0x18f]
 425b394: 36fffb88     	tbz	w8, #0x1f, 0x425b304 <_ChromeMain+0x4256068>
 425b398: f940bfe0     	ldr	x0, [sp, #0x178]
 425b39c: f940c7e8     	ldr	x8, [sp, #0x188]
 425b3a0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b3a4: 96f6b6c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b3a8: 17ffffd7     	b	0x425b304 <_ChromeMain+0x4256068>
 425b3ac: f94193e0     	ldr	x0, [sp, #0x320]
 425b3b0: f9419be8     	ldr	x8, [sp, #0x330]
 425b3b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b3b8: 96f6b6c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b3bc: 14000046     	b	0x425b4d4 <_ChromeMain+0x4256238>
 425b3c0: f940dbe0     	ldr	x0, [sp, #0x1b0]
 425b3c4: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425b3c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b3cc: 96f6b6bb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b3d0: 1400002e     	b	0x425b488 <_ChromeMain+0x42561ec>
 425b3d4: a9400a81     	ldp	x1, x2, [x20]
 425b3d8: 910b03e0     	add	x0, sp, #0x2c0
 425b3dc: 96f6f38f     	bl	0x18218 <_ChromeMain+0x12f7c>
 425b3e0: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 425b3e4: 37f857e8     	tbnz	w8, #0x1f, 0x425bee0 <_ChromeMain+0x4256c44>
 425b3e8: 92401d08     	and	x8, x8, #0xff
 425b3ec: 1400000e     	b	0x425b424 <_ChromeMain+0x4256188>
 425b3f0: f90173ff     	str	xzr, [sp, #0x2e0]
 425b3f4: f9016fff     	str	xzr, [sp, #0x2d8]
 425b3f8: f90177ff     	str	xzr, [sp, #0x2e8]
 425b3fc: f90167ff     	str	xzr, [sp, #0x2c8]
 425b400: f90163ff     	str	xzr, [sp, #0x2c0]
 425b404: f9016bff     	str	xzr, [sp, #0x2d0]
 425b408: 39c05e88     	ldrsb	w8, [x20, #0x17]
 425b40c: 37fffe48     	tbnz	w8, #0x1f, 0x425b3d4 <_ChromeMain+0x4256138>
 425b410: d2800008     	mov	x8, #0x0                ; =0
 425b414: 3dc00280     	ldr	q0, [x20]
 425b418: 3d80b3e0     	str	q0, [sp, #0x2c0]
 425b41c: f9400a89     	ldr	x9, [x20, #0x10]
 425b420: f9016be9     	str	x9, [sp, #0x2d0]
 425b424: b5000588     	cbnz	x8, 0x425b4d4 <_ChromeMain+0x4256238>
 425b428: 910b63e2     	add	x2, sp, #0x2d8
 425b42c: f0047380     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 425b430: 91178c00     	add	x0, x0, #0x5e3
 425b434: 52800141     	mov	w1, #0xa                ; =10
 425b438: 97b8b726     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 425b43c: 340004c0     	cbz	w0, 0x425b4d4 <_ChromeMain+0x4256238>
 425b440: f90197ff     	str	xzr, [sp, #0x328]
 425b444: f90193ff     	str	xzr, [sp, #0x320]
 425b448: f9019bff     	str	xzr, [sp, #0x330]
 425b44c: 9106c3e8     	add	x8, sp, #0x1b0
 425b450: aa1403e0     	mov	x0, x20
 425b454: 97485886     	bl	0x147166c <_ChromeMain+0x146c3d0>
 425b458: 39871fe8     	ldrsb	x8, [sp, #0x1c7]
 425b45c: a95b2be9     	ldp	x9, x10, [sp, #0x1b0]
 425b460: f100011f     	cmp	x8, #0x0
 425b464: 9106c3eb     	add	x11, sp, #0x1b0
 425b468: 9a8b4121     	csel	x1, x9, x11, mi
 425b46c: 7100011f     	cmp	w8, #0x0
 425b470: 9a884142     	csel	x2, x10, x8, mi
 425b474: 910c83e8     	add	x8, sp, #0x320
 425b478: 910b63e0     	add	x0, sp, #0x2d8
 425b47c: 9750f7e6     	bl	0x1699414 <_ChromeMain+0x1694178>
 425b480: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425b484: 37fff9e8     	tbnz	w8, #0x1f, 0x425b3c0 <_ChromeMain+0x4256124>
 425b488: 910c83e1     	add	x1, sp, #0x320
 425b48c: aa1403e0     	mov	x0, x20
 425b490: 9516bd4c     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 425b494: 340001c0     	cbz	w0, 0x425b4cc <_ChromeMain+0x4256230>
 425b498: 39cb5fe9     	ldrsb	w9, [sp, #0x2d7]
 425b49c: 394cdfe8     	ldrb	w8, [sp, #0x337]
 425b4a0: 37f84cc9     	tbnz	w9, #0x1f, 0x425be38 <_ChromeMain+0x4256b9c>
 425b4a4: 373800c8     	tbnz	w8, #0x7, 0x425b4bc <_ChromeMain+0x4256220>
 425b4a8: 3dc0cbe0     	ldr	q0, [sp, #0x320]
 425b4ac: 3d80b3e0     	str	q0, [sp, #0x2c0]
 425b4b0: f9419be8     	ldr	x8, [sp, #0x330]
 425b4b4: f9016be8     	str	x8, [sp, #0x2d0]
 425b4b8: 14000007     	b	0x425b4d4 <_ChromeMain+0x4256238>
 425b4bc: f94193e1     	ldr	x1, [sp, #0x320]
 425b4c0: f94197e2     	ldr	x2, [sp, #0x328]
 425b4c4: 910b03e0     	add	x0, sp, #0x2c0
 425b4c8: 9709357b     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 425b4cc: 39ccdfe8     	ldrsb	w8, [sp, #0x337]
 425b4d0: 37fff6e8     	tbnz	w8, #0x1f, 0x425b3ac <_ChromeMain+0x4256110>
 425b4d4: 6f00e400     	movi.2d	v0, #0000000000000000
 425b4d8: ad1503e0     	stp	q0, q0, [sp, #0x2a0]
 425b4dc: ad1403e0     	stp	q0, q0, [sp, #0x280]
 425b4e0: ad1303e0     	stp	q0, q0, [sp, #0x260]
 425b4e4: ad1203e0     	stp	q0, q0, [sp, #0x240]
 425b4e8: ad1103e0     	stp	q0, q0, [sp, #0x220]
 425b4ec: ad1003e0     	stp	q0, q0, [sp, #0x200]
 425b4f0: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 425b4f4: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 425b4f8: 3d806fe0     	str	q0, [sp, #0x1b0]
 425b4fc: 9106c3e0     	add	x0, sp, #0x1b0
 425b500: b004aec1     	adrp	x1, 0xd834000 <dyld_stub_binder+0xd834000>
 425b504: 91299421     	add	x1, x1, #0xa65
 425b508: 97b6d110     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 425b50c: 9106c3e0     	add	x0, sp, #0x1b0
 425b510: 910b03e1     	add	x1, sp, #0x2c0
 425b514: 974c185c     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 425b518: 35ffed80     	cbnz	w0, 0x425b2c8 <_ChromeMain+0x425602c>
 425b51c: 52800013     	mov	w19, #0x0               ; =0
 425b520: 9106c3e0     	add	x0, sp, #0x1b0
 425b524: 97684f30     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 425b528: 39cb5fe8     	ldrsb	w8, [sp, #0x2d7]
 425b52c: 37f80288     	tbnz	w8, #0x1f, 0x425b57c <_ChromeMain+0x42562e0>
 425b530: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 425b534: 36f84968     	tbz	w8, #0x1f, 0x425be60 <_ChromeMain+0x4256bc4>
 425b538: f94173e8     	ldr	x8, [sp, #0x2e0]
 425b53c: b40002a8     	cbz	x8, 0x425b590 <_ChromeMain+0x42562f4>
 425b540: 910b63e0     	add	x0, sp, #0x2d8
 425b544: 97c04a79     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 425b548: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 425b54c: 340000c0     	cbz	w0, 0x425b564 <_ChromeMain+0x42562c8>
 425b550: 36f800c8     	tbz	w8, #0x1f, 0x425b568 <_ChromeMain+0x42562cc>
 425b554: f9416fe8     	ldr	x8, [sp, #0x2d8]
 425b558: 3900011f     	strb	wzr, [x8]
 425b55c: f90173ff     	str	xzr, [sp, #0x2e0]
 425b560: 394bbfe8     	ldrb	w8, [sp, #0x2ef]
 425b564: 37380168     	tbnz	w8, #0x7, 0x425b590 <_ChromeMain+0x42562f4>
 425b568: 35000373     	cbnz	w19, 0x425b5d4 <_ChromeMain+0x4256338>
 425b56c: f94043f3     	ldr	x19, [sp, #0x80]
 425b570: b5004c13     	cbnz	x19, 0x425bef0 <_ChromeMain+0x4256c54>
 425b574: 52800013     	mov	w19, #0x0               ; =0
 425b578: 1400008a     	b	0x425b7a0 <_ChromeMain+0x4256504>
 425b57c: f94163e0     	ldr	x0, [sp, #0x2c0]
 425b580: f9416be8     	ldr	x8, [sp, #0x2d0]
 425b584: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b588: 96f6b64c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b58c: 17ffffe9     	b	0x425b530 <_ChromeMain+0x4256294>
 425b590: f9416fe0     	ldr	x0, [sp, #0x2d8]
 425b594: f94177e8     	ldr	x8, [sp, #0x2e8]
 425b598: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b59c: 96f6b647     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b5a0: 17fffff2     	b	0x425b568 <_ChromeMain+0x42562cc>
 425b5a4: a947ebf4     	ldp	x20, x26, [sp, #0x78]
 425b5a8: 910c83f5     	add	x21, sp, #0x320
 425b5ac: b50045fa     	cbnz	x26, 0x425be68 <_ChromeMain+0x4256bcc>
 425b5b0: 91006294     	add	x20, x20, #0x18
 425b5b4: f94037e8     	ldr	x8, [sp, #0x68]
 425b5b8: eb08029f     	cmp	x20, x8
 425b5bc: 54000e80     	b.eq	0x425b78c <_ChromeMain+0x42564f0>
 425b5c0: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 425b5c4: f9004bff     	str	xzr, [sp, #0x90]
 425b5c8: aa1403e0     	mov	x0, x20
 425b5cc: 977f239d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425b5d0: 35fff100     	cbnz	w0, 0x425b3f0 <_ChromeMain+0x4256154>
 425b5d4: a94823fa     	ldp	x26, x8, [sp, #0x80]
 425b5d8: 52810609     	mov	w9, #0x830              ; =2096
 425b5dc: 9b097d1b     	mul	x27, x8, x9
 425b5e0: b4fffe7b     	cbz	x27, 0x425b5ac <_ChromeMain+0x4256310>
 425b5e4: f9003ff4     	str	x20, [sp, #0x78]
 425b5e8: d2800013     	mov	x19, #0x0               ; =0
 425b5ec: 52827d08     	mov	w8, #0x13e8             ; =5096
 425b5f0: 8b080355     	add	x21, x26, x8
 425b5f4: 528210e8     	mov	w8, #0x1087             ; =4231
 425b5f8: 8b080354     	add	x20, x26, x8
 425b5fc: 14000017     	b	0x425b658 <_ChromeMain+0x42563bc>
 425b600: 8b130341     	add	x1, x26, x19
 425b604: f9403be0     	ldr	x0, [sp, #0x70]
 425b608: 94ac449c     	bl	0x6d6c878 <_ChromeMain+0x6d675dc>
 425b60c: 1400000a     	b	0x425b634 <_ChromeMain+0x4256398>
 425b610: f94077e0     	ldr	x0, [sp, #0xe8]
 425b614: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b618: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b61c: 96f6b627     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b620: 910263e0     	add	x0, sp, #0x98
 425b624: 910263e1     	add	x1, sp, #0x98
 425b628: 9106c3e2     	add	x2, sp, #0x1b0
 425b62c: 9732cbd5     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 425b630: 3707fe81     	tbnz	w1, #0x0, 0x425b600 <_ChromeMain+0x4256364>
 425b634: 39c71fe8     	ldrsb	w8, [sp, #0x1c7]
 425b638: 36f800a8     	tbz	w8, #0x1f, 0x425b64c <_ChromeMain+0x42563b0>
 425b63c: f940dbe0     	ldr	x0, [sp, #0x1b0]
 425b640: f940e3e8     	ldr	x8, [sp, #0x1c0]
 425b644: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b648: 96f6b61c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b64c: 9120c273     	add	x19, x19, #0x830
 425b650: eb13037f     	cmp	x27, x19
 425b654: 54fffa80     	b.eq	0x425b5a4 <_ChromeMain+0x4256308>
 425b658: 8b13034b     	add	x11, x26, x19
 425b65c: 8b130288     	add	x8, x20, x19
 425b660: a91b7fff     	stp	xzr, xzr, [sp, #0x1b0]
 425b664: f900e3ff     	str	xzr, [sp, #0x1c0]
 425b668: 91004169     	add	x9, x11, #0x10
 425b66c: f9800100     	prfm	pldl1keep, [x8]
 425b670: 39809d6a     	ldrsb	x10, [x11, #0x27]
 425b674: b6f8006a     	tbz	x10, #0x3f, 0x425b680 <_ChromeMain+0x42563e4>
 425b678: f9400129     	ldr	x9, [x9]
 425b67c: f9400d6a     	ldr	x10, [x11, #0x18]
 425b680: 9109810b     	add	x11, x8, #0x260
 425b684: f90193e9     	str	x9, [sp, #0x320]
 425b688: f90197ea     	str	x10, [sp, #0x328]
 425b68c: 8b130348     	add	x8, x26, x19
 425b690: 9109c100     	add	x0, x8, #0x270
 425b694: f9800160     	prfm	pldl1keep, [x11]
 425b698: 398a1d01     	ldrsb	x1, [x8, #0x287]
 425b69c: b6f80061     	tbz	x1, #0x3f, 0x425b6a8 <_ChromeMain+0x425640c>
 425b6a0: f9400000     	ldr	x0, [x0]
 425b6a4: f9413d01     	ldr	x1, [x8, #0x278]
 425b6a8: 8b1302b8     	add	x24, x21, x19
 425b6ac: d102471c     	sub	x28, x24, #0x91
 425b6b0: 9103a3e8     	add	x8, sp, #0xe8
 425b6b4: 97351d95     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 425b6b8: 3983ffe8     	ldrsb	x8, [sp, #0xff]
 425b6bc: a94eabe9     	ldp	x9, x10, [sp, #0xe8]
 425b6c0: f100011f     	cmp	x8, #0x0
 425b6c4: 9a964129     	csel	x9, x9, x22, mi
 425b6c8: 7100011f     	cmp	w8, #0x0
 425b6cc: 9a884148     	csel	x8, x10, x8, mi
 425b6d0: f9019be9     	str	x9, [sp, #0x330]
 425b6d4: f9019fe8     	str	x8, [sp, #0x338]
 425b6d8: 8b130348     	add	x8, x26, x19
 425b6dc: 910b8100     	add	x0, x8, #0x2e0
 425b6e0: f9800380     	prfm	pldl1keep, [x28]
 425b6e4: 398bdd01     	ldrsb	x1, [x8, #0x2f7]
 425b6e8: b6f80061     	tbz	x1, #0x3f, 0x425b6f4 <_ChromeMain+0x4256458>
 425b6ec: f9400000     	ldr	x0, [x0]
 425b6f0: f9417501     	ldr	x1, [x8, #0x2e8]
 425b6f4: 9102c3fc     	add	x28, sp, #0xb0
 425b6f8: 9102c3e8     	add	x8, sp, #0xb0
 425b6fc: 97351d83     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 425b700: 39831fe8     	ldrsb	x8, [sp, #0xc7]
 425b704: a94b2be9     	ldp	x9, x10, [sp, #0xb0]
 425b708: f100011f     	cmp	x8, #0x0
 425b70c: 9a9c4129     	csel	x9, x9, x28, mi
 425b710: 7100011f     	cmp	w8, #0x0
 425b714: 9a884148     	csel	x8, x10, x8, mi
 425b718: f901a3e9     	str	x9, [sp, #0x340]
 425b71c: f901a7e8     	str	x8, [sp, #0x348]
 425b720: 8b130348     	add	x8, x26, x19
 425b724: f9800300     	prfm	pldl1keep, [x24]
 425b728: 394e2108     	ldrb	w8, [x8, #0x388]
 425b72c: 7100011f     	cmp	w8, #0x0
 425b730: b004ac68     	adrp	x8, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 425b734: 9118d108     	add	x8, x8, #0x634
 425b738: 9a8812e8     	csel	x8, x23, x8, ne
 425b73c: f901abe8     	str	x8, [sp, #0x350]
 425b740: 52800028     	mov	w8, #0x1                ; =1
 425b744: f901afe8     	str	x8, [sp, #0x358]
 425b748: 9106c3e8     	add	x8, sp, #0x1b0
 425b74c: 910c83e0     	add	x0, sp, #0x320
 425b750: 52800081     	mov	w1, #0x4                ; =4
 425b754: aa1903e2     	mov	x2, x25
 425b758: 52800023     	mov	w3, #0x1                ; =1
 425b75c: 977879b3     	bl	0x2079e28 <_ChromeMain+0x2074b8c>
 425b760: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 425b764: 36f800a8     	tbz	w8, #0x1f, 0x425b778 <_ChromeMain+0x42564dc>
 425b768: f9405be0     	ldr	x0, [sp, #0xb0]
 425b76c: f94063e8     	ldr	x8, [sp, #0xc0]
 425b770: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b774: 96f6b5d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b778: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b77c: 36fff528     	tbz	w8, #0x1f, 0x425b620 <_ChromeMain+0x4256384>
 425b780: 17ffffa4     	b	0x425b610 <_ChromeMain+0x4256374>
 425b784: 52800013     	mov	w19, #0x0               ; =0
 425b788: 1400000f     	b	0x425b7c4 <_ChromeMain+0x4256528>
 425b78c: f94033e8     	ldr	x8, [sp, #0x60]
 425b790: f100011f     	cmp	x8, #0x0
 425b794: f9402be8     	ldr	x8, [sp, #0x50]
 425b798: fa401900     	ccmp	x8, #0x0, #0x0, ne
 425b79c: 1a9f07f3     	cset	w19, ne
 425b7a0: 39cc7fe8     	ldrsb	w8, [sp, #0x31f]
 425b7a4: 37f83328     	tbnz	w8, #0x1f, 0x425be08 <_ChromeMain+0x4256b6c>
 425b7a8: 39cc1fe8     	ldrsb	w8, [sp, #0x307]
 425b7ac: 37f83388     	tbnz	w8, #0x1f, 0x425be1c <_ChromeMain+0x4256b80>
 425b7b0: f94053e1     	ldr	x1, [sp, #0xa0]
 425b7b4: 910263e8     	add	x8, sp, #0x98
 425b7b8: f90193e8     	str	x8, [sp, #0x320]
 425b7bc: 910c83e0     	add	x0, sp, #0x320
 425b7c0: 971314bb     	bl	0x720aac <_ChromeMain+0x71b810>
 425b7c4: f85a03a8     	ldur	x8, [x29, #-0x60]
 425b7c8: b004ee69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 425b7cc: f940f929     	ldr	x9, [x9, #0x1f0]
 425b7d0: f9400129     	ldr	x9, [x9]
 425b7d4: eb08013f     	cmp	x9, x8
 425b7d8: 54003421     	b.ne	0x425be5c <_ChromeMain+0x4256bc0>
 425b7dc: aa1303e0     	mov	x0, x19
 425b7e0: 912d83ff     	add	sp, sp, #0xb60
 425b7e4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 425b7e8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 425b7ec: a94357f6     	ldp	x22, x21, [sp, #0x30]
 425b7f0: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 425b7f4: a94167fa     	ldp	x26, x25, [sp, #0x10]
 425b7f8: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 425b7fc: d65f03c0     	ret
 425b800: 39463fe8     	ldrb	w8, [sp, #0x18f]
 425b804: f940c3e9     	ldr	x9, [sp, #0x180]
 425b808: 7219011f     	tst	w8, #0x80
 425b80c: 9a881128     	csel	x8, x9, x8, ne
 425b810: f100011f     	cmp	x8, #0x0
 425b814: f9402be8     	ldr	x8, [sp, #0x50]
 425b818: 9a880508     	cinc	x8, x8, ne
 425b81c: f9002be8     	str	x8, [sp, #0x50]
 425b820: 910c83e0     	add	x0, sp, #0x320
 425b824: 52810601     	mov	w1, #0x830              ; =2096
 425b828: 94f6b7fa     	bl	0x8009810 <_ChromeMain+0x8004574>
 425b82c: 910c83e0     	add	x0, sp, #0x320
 425b830: 94ac3449     	bl	0x6d68954 <_ChromeMain+0x6d636b8>
 425b834: 910643e0     	add	x0, sp, #0x190
 425b838: 52800001     	mov	w1, #0x0                ; =0
 425b83c: 9711e9e9     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b840: aa0003e2     	mov	x2, x0
 425b844: aa0103e3     	mov	x3, x1
 425b848: 9103a3e0     	add	x0, sp, #0xe8
 425b84c: aa0203e1     	mov	x1, x2
 425b850: aa0303e2     	mov	x2, x3
 425b854: 97045260     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425b858: 9100a2a0     	add	x0, x21, #0x28
 425b85c: 9103a3e1     	add	x1, sp, #0xe8
 425b860: 970e78a0     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425b864: 9101c2c0     	add	x0, x22, #0x70
 425b868: d2800001     	mov	x1, #0x0                ; =0
 425b86c: 96f73113     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425b870: 910082c0     	add	x0, x22, #0x20
 425b874: 96f73101     	bl	0x27c78 <_ChromeMain+0x229dc>
 425b878: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b87c: 36f800a8     	tbz	w8, #0x1f, 0x425b890 <_ChromeMain+0x42565f4>
 425b880: f94077e0     	ldr	x0, [sp, #0xe8]
 425b884: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b888: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b88c: 96f6b58b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b890: 910643e0     	add	x0, sp, #0x190
 425b894: 52800021     	mov	w1, #0x1                ; =1
 425b898: 9711e9d2     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b89c: aa0003e2     	mov	x2, x0
 425b8a0: aa0103e3     	mov	x3, x1
 425b8a4: 9103a3e0     	add	x0, sp, #0xe8
 425b8a8: aa0203e1     	mov	x1, x2
 425b8ac: aa0303e2     	mov	x2, x3
 425b8b0: 97045249     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425b8b4: 910282a0     	add	x0, x21, #0xa0
 425b8b8: 9103a3e1     	add	x1, sp, #0xe8
 425b8bc: 970e7889     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425b8c0: 9101c2c0     	add	x0, x22, #0x70
 425b8c4: d2800001     	mov	x1, #0x0                ; =0
 425b8c8: 96f730fc     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425b8cc: 910082c0     	add	x0, x22, #0x20
 425b8d0: 96f730ea     	bl	0x27c78 <_ChromeMain+0x229dc>
 425b8d4: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425b8d8: 36f800a8     	tbz	w8, #0x1f, 0x425b8ec <_ChromeMain+0x4256650>
 425b8dc: f94077e0     	ldr	x0, [sp, #0xe8]
 425b8e0: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b8e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b8e8: 96f6b574     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b8ec: 910643e0     	add	x0, sp, #0x190
 425b8f0: 52800041     	mov	w1, #0x2                ; =2
 425b8f4: 9711e9bb     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b8f8: 9103a3e8     	add	x8, sp, #0xe8
 425b8fc: 971a1a85     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b900: 39d61fe8     	ldrsb	w8, [sp, #0x587]
 425b904: 36f800a8     	tbz	w8, #0x1f, 0x425b918 <_ChromeMain+0x425667c>
 425b908: f942bbe0     	ldr	x0, [sp, #0x570]
 425b90c: f942c3e8     	ldr	x8, [sp, #0x580]
 425b910: d37ff901     	lsl	x1, x8, #1
 425b914: 96f6b569     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b918: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b91c: f94027e9     	ldr	x9, [sp, #0x48]
 425b920: 3d800120     	str	q0, [x9]
 425b924: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b928: f9000928     	str	x8, [x9, #0x10]
 425b92c: 910643e0     	add	x0, sp, #0x190
 425b930: 52800061     	mov	w1, #0x3                ; =3
 425b934: 9711e9ab     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b938: 9103a3e8     	add	x8, sp, #0xe8
 425b93c: 971a1a75     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b940: 39d69fe8     	ldrsb	w8, [sp, #0x5a7]
 425b944: 36f800a8     	tbz	w8, #0x1f, 0x425b958 <_ChromeMain+0x42566bc>
 425b948: f942cbe0     	ldr	x0, [sp, #0x590]
 425b94c: f942d3e8     	ldr	x8, [sp, #0x5a0]
 425b950: d37ff901     	lsl	x1, x8, #1
 425b954: 96f6b559     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b958: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b95c: f94023e9     	ldr	x9, [sp, #0x40]
 425b960: 3d800120     	str	q0, [x9]
 425b964: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b968: f9000928     	str	x8, [x9, #0x10]
 425b96c: 910643e0     	add	x0, sp, #0x190
 425b970: 52800081     	mov	w1, #0x4                ; =4
 425b974: 9711e99b     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b978: 9103a3e8     	add	x8, sp, #0xe8
 425b97c: 971a1a65     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b980: 39d7dfe8     	ldrsb	w8, [sp, #0x5f7]
 425b984: 36f800a8     	tbz	w8, #0x1f, 0x425b998 <_ChromeMain+0x42566fc>
 425b988: f942f3e0     	ldr	x0, [sp, #0x5e0]
 425b98c: f942fbe8     	ldr	x8, [sp, #0x5f0]
 425b990: d37ff901     	lsl	x1, x8, #1
 425b994: 96f6b549     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b998: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b99c: f9401fe9     	ldr	x9, [sp, #0x38]
 425b9a0: 3d800120     	str	q0, [x9]
 425b9a4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b9a8: f9000928     	str	x8, [x9, #0x10]
 425b9ac: 370002ba     	tbnz	w26, #0x0, 0x425ba00 <_ChromeMain+0x4256764>
 425b9b0: 3985dfe8     	ldrsb	x8, [sp, #0x177]
 425b9b4: a9562be9     	ldp	x9, x10, [sp, #0x160]
 425b9b8: f100011f     	cmp	x8, #0x0
 425b9bc: 910583eb     	add	x11, sp, #0x160
 425b9c0: 9a8b4120     	csel	x0, x9, x11, mi
 425b9c4: 7100011f     	cmp	w8, #0x0
 425b9c8: 9a884141     	csel	x1, x10, x8, mi
 425b9cc: 9103a3e8     	add	x8, sp, #0xe8
 425b9d0: 971a1a50     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425b9d4: 39d85fe8     	ldrsb	w8, [sp, #0x617]
 425b9d8: 36f800a8     	tbz	w8, #0x1f, 0x425b9ec <_ChromeMain+0x4256750>
 425b9dc: f94303e0     	ldr	x0, [sp, #0x600]
 425b9e0: f9430be8     	ldr	x8, [sp, #0x610]
 425b9e4: d37ff901     	lsl	x1, x8, #1
 425b9e8: 96f6b534     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b9ec: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425b9f0: f94003e9     	ldr	x9, [sp]
 425b9f4: 3d800120     	str	q0, [x9]
 425b9f8: f9407fe8     	ldr	x8, [sp, #0xf8]
 425b9fc: f9000928     	str	x8, [x9, #0x10]
 425ba00: 910643e0     	add	x0, sp, #0x190
 425ba04: 528000c1     	mov	w1, #0x6                ; =6
 425ba08: 9711e976     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425ba0c: 9103a3e8     	add	x8, sp, #0xe8
 425ba10: 971a1a40     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425ba14: 39d5bfe8     	ldrsb	w8, [sp, #0x56f]
 425ba18: 36f800a8     	tbz	w8, #0x1f, 0x425ba2c <_ChromeMain+0x4256790>
 425ba1c: f942afe0     	ldr	x0, [sp, #0x558]
 425ba20: f942b7e8     	ldr	x8, [sp, #0x568]
 425ba24: d37ff901     	lsl	x1, x8, #1
 425ba28: 96f6b524     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ba2c: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425ba30: f9401be9     	ldr	x9, [sp, #0x30]
 425ba34: 3d800120     	str	q0, [x9]
 425ba38: f9407fe8     	ldr	x8, [sp, #0xf8]
 425ba3c: f9000928     	str	x8, [x9, #0x10]
 425ba40: 9103a3e8     	add	x8, sp, #0xe8
 425ba44: 910643e0     	add	x0, sp, #0x190
 425ba48: 528000e1     	mov	w1, #0x7                ; =7
 425ba4c: 9711ea5b     	bl	0x6d63b8 <_ChromeMain+0x6d111c>
 425ba50: 39cd1fe8     	ldrsb	w8, [sp, #0x347]
 425ba54: 36f800a8     	tbz	w8, #0x1f, 0x425ba68 <_ChromeMain+0x42567cc>
 425ba58: f9419be0     	ldr	x0, [sp, #0x330]
 425ba5c: f941a3e8     	ldr	x8, [sp, #0x340]
 425ba60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425ba64: 96f6b515     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425ba68: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425ba6c: 3c8102a0     	stur	q0, [x21, #0x10]
 425ba70: f9407fe8     	ldr	x8, [sp, #0xf8]
 425ba74: f80202a8     	stur	x8, [x21, #0x20]
 425ba78: 910643e0     	add	x0, sp, #0x190
 425ba7c: 52800101     	mov	w1, #0x8                ; =8
 425ba80: 9711e86c     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ba84: f90353e0     	str	x0, [sp, #0x6a0]
 425ba88: 391aa3fa     	strb	w26, [sp, #0x6a8]
 425ba8c: 910643e0     	add	x0, sp, #0x190
 425ba90: 52800141     	mov	w1, #0xa                ; =10
 425ba94: 9711e867     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425ba98: b9032be0     	str	w0, [sp, #0x328]
 425ba9c: 910643e0     	add	x0, sp, #0x190
 425baa0: 52800161     	mov	w1, #0xb                ; =11
 425baa4: 9711e863     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425baa8: b906afe0     	str	w0, [sp, #0x6ac]
 425baac: 910643e0     	add	x0, sp, #0x190
 425bab0: 52800181     	mov	w1, #0xc                ; =12
 425bab4: 9711e85f     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bab8: b906b3e0     	str	w0, [sp, #0x6b0]
 425babc: 910643e0     	add	x0, sp, #0x190
 425bac0: 528001a1     	mov	w1, #0xd                ; =13
 425bac4: 9711e947     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bac8: 9103a3e8     	add	x8, sp, #0xe8
 425bacc: 971a1a11     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bad0: 39e5bfe8     	ldrsb	w8, [sp, #0x96f]
 425bad4: 36f800a8     	tbz	w8, #0x1f, 0x425bae8 <_ChromeMain+0x425684c>
 425bad8: f944afe0     	ldr	x0, [sp, #0x958]
 425badc: f944b7e8     	ldr	x8, [sp, #0x968]
 425bae0: d37ff901     	lsl	x1, x8, #1
 425bae4: 96f6b4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bae8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425baec: f94017e9     	ldr	x9, [sp, #0x28]
 425baf0: 3d800120     	str	q0, [x9]
 425baf4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425baf8: f9000928     	str	x8, [x9, #0x10]
 425bafc: 910643e0     	add	x0, sp, #0x190
 425bb00: 528001c1     	mov	w1, #0xe                ; =14
 425bb04: 9711e937     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bb08: aa0003e2     	mov	x2, x0
 425bb0c: aa0103e3     	mov	x3, x1
 425bb10: 9103a3e0     	add	x0, sp, #0xe8
 425bb14: aa0203e1     	mov	x1, x2
 425bb18: aa0303e2     	mov	x2, x3
 425bb1c: 970451ae     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bb20: 911942a0     	add	x0, x21, #0x650
 425bb24: 9103a3e1     	add	x1, sp, #0xe8
 425bb28: 970e77ee     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425bb2c: 9101c2c0     	add	x0, x22, #0x70
 425bb30: d2800001     	mov	x1, #0x0                ; =0
 425bb34: 96f73061     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bb38: 910082c0     	add	x0, x22, #0x20
 425bb3c: 96f7304f     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bb40: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bb44: 36f800a8     	tbz	w8, #0x1f, 0x425bb58 <_ChromeMain+0x42568bc>
 425bb48: f94077e0     	ldr	x0, [sp, #0xe8]
 425bb4c: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bb50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bb54: 96f6b4d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bb58: 910643e0     	add	x0, sp, #0x190
 425bb5c: 528001e1     	mov	w1, #0xf                ; =15
 425bb60: 9711e920     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bb64: aa0003e2     	mov	x2, x0
 425bb68: aa0103e3     	mov	x3, x1
 425bb6c: 9103a3e0     	add	x0, sp, #0xe8
 425bb70: aa0203e1     	mov	x1, x2
 425bb74: aa0303e2     	mov	x2, x3
 425bb78: 97045197     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bb7c: 9102c3e0     	add	x0, sp, #0xb0
 425bb80: 9103a3e1     	add	x1, sp, #0xe8
 425bb84: 972d6c91     	bl	0xdb6dc8 <_ChromeMain+0xdb1b2c>
 425bb88: 794163e8     	ldrh	w8, [sp, #0xb0]
 425bb8c: 7913d3e8     	strh	w8, [sp, #0x9e8]
 425bb90: 39e81fe8     	ldrsb	w8, [sp, #0xa07]
 425bb94: 36f800a8     	tbz	w8, #0x1f, 0x425bba8 <_ChromeMain+0x425690c>
 425bb98: f944fbe0     	ldr	x0, [sp, #0x9f0]
 425bb9c: f94503e8     	ldr	x8, [sp, #0xa00]
 425bba0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bba4: 96f6b4c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bba8: 3cc08380     	ldur	q0, [x28, #0x8]
 425bbac: f94013e9     	ldr	x9, [sp, #0x20]
 425bbb0: 3d800120     	str	q0, [x9]
 425bbb4: f8418388     	ldur	x8, [x28, #0x18]
 425bbb8: f9000928     	str	x8, [x9, #0x10]
 425bbbc: 39033fff     	strb	wzr, [sp, #0xcf]
 425bbc0: 3902e3ff     	strb	wzr, [sp, #0xb8]
 425bbc4: 39e87fe8     	ldrsb	w8, [sp, #0xa1f]
 425bbc8: 36f801e8     	tbz	w8, #0x1f, 0x425bc04 <_ChromeMain+0x4256968>
 425bbcc: f94507e0     	ldr	x0, [sp, #0xa08]
 425bbd0: f9450fe8     	ldr	x8, [sp, #0xa18]
 425bbd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bbd8: 96f6b4b8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bbdc: 39c33fe8     	ldrsb	w8, [sp, #0xcf]
 425bbe0: 3cc20380     	ldur	q0, [x28, #0x20]
 425bbe4: f9400fea     	ldr	x10, [sp, #0x18]
 425bbe8: 3d800140     	str	q0, [x10]
 425bbec: f8430389     	ldur	x9, [x28, #0x30]
 425bbf0: f9000949     	str	x9, [x10, #0x10]
 425bbf4: 39039fff     	strb	wzr, [sp, #0xe7]
 425bbf8: 390343ff     	strb	wzr, [sp, #0xd0]
 425bbfc: 36f80128     	tbz	w8, #0x1f, 0x425bc20 <_ChromeMain+0x4256984>
 425bc00: 140000d7     	b	0x425bf5c <_ChromeMain+0x4256cc0>
 425bc04: 3cc20380     	ldur	q0, [x28, #0x20]
 425bc08: f9400fe9     	ldr	x9, [sp, #0x18]
 425bc0c: 3d800120     	str	q0, [x9]
 425bc10: f8430388     	ldur	x8, [x28, #0x30]
 425bc14: f9000928     	str	x8, [x9, #0x10]
 425bc18: 39039fff     	strb	wzr, [sp, #0xe7]
 425bc1c: 390343ff     	strb	wzr, [sp, #0xd0]
 425bc20: 9101c2c0     	add	x0, x22, #0x70
 425bc24: d2800001     	mov	x1, #0x0                ; =0
 425bc28: 96f73024     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bc2c: 910082c0     	add	x0, x22, #0x20
 425bc30: 96f73012     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bc34: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bc38: 36f800a8     	tbz	w8, #0x1f, 0x425bc4c <_ChromeMain+0x42569b0>
 425bc3c: f94077e0     	ldr	x0, [sp, #0xe8]
 425bc40: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bc44: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bc48: 96f6b49c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bc4c: 910643e0     	add	x0, sp, #0x190
 425bc50: 52800201     	mov	w1, #0x10               ; =16
 425bc54: 9711e917     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bc58: 392883e0     	strb	w0, [sp, #0xa20]
 425bc5c: 910643e0     	add	x0, sp, #0x190
 425bc60: 52800221     	mov	w1, #0x11               ; =17
 425bc64: 9711e7f3     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc68: b90953e0     	str	w0, [sp, #0x950]
 425bc6c: 910643e0     	add	x0, sp, #0x190
 425bc70: 52800241     	mov	w1, #0x12               ; =18
 425bc74: 9711e7ef     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc78: f90347e0     	str	x0, [sp, #0x688]
 425bc7c: 910643e0     	add	x0, sp, #0x190
 425bc80: 52800261     	mov	w1, #0x13               ; =19
 425bc84: 9711e7eb     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bc88: f9034fe0     	str	x0, [sp, #0x698]
 425bc8c: 910643e0     	add	x0, sp, #0x190
 425bc90: 52800281     	mov	w1, #0x14               ; =20
 425bc94: 9711e8d3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bc98: 9103a3e8     	add	x8, sp, #0xe8
 425bc9c: 971a199d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bca0: 39eabfe8     	ldrsb	w8, [sp, #0xaaf]
 425bca4: 36f800a8     	tbz	w8, #0x1f, 0x425bcb8 <_ChromeMain+0x4256a1c>
 425bca8: f9454fe0     	ldr	x0, [sp, #0xa98]
 425bcac: f94557e8     	ldr	x8, [sp, #0xaa8]
 425bcb0: d37ff901     	lsl	x1, x8, #1
 425bcb4: 96f6b481     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bcb8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425bcbc: f9400be9     	ldr	x9, [sp, #0x10]
 425bcc0: 3d800120     	str	q0, [x9]
 425bcc4: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bcc8: f9000928     	str	x8, [x9, #0x10]
 425bccc: 910643e0     	add	x0, sp, #0x190
 425bcd0: 528002a1     	mov	w1, #0x15               ; =21
 425bcd4: 9711e8c3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bcd8: 9103a3e8     	add	x8, sp, #0xe8
 425bcdc: 971a198d     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 425bce0: 39eb1fe8     	ldrsb	w8, [sp, #0xac7]
 425bce4: 36f800a8     	tbz	w8, #0x1f, 0x425bcf8 <_ChromeMain+0x4256a5c>
 425bce8: f9455be0     	ldr	x0, [sp, #0xab0]
 425bcec: f94563e8     	ldr	x8, [sp, #0xac0]
 425bcf0: d37ff901     	lsl	x1, x8, #1
 425bcf4: 96f6b471     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bcf8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425bcfc: f94007e9     	ldr	x9, [sp, #0x8]
 425bd00: 3d800120     	str	q0, [x9]
 425bd04: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd08: f9000928     	str	x8, [x9, #0x10]
 425bd0c: 910643e0     	add	x0, sp, #0x190
 425bd10: 528002c1     	mov	w1, #0x16               ; =22
 425bd14: 9711e7c7     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd18: f905a3e0     	str	x0, [sp, #0xb40]
 425bd1c: 910643e0     	add	x0, sp, #0x190
 425bd20: 528002e1     	mov	w1, #0x17               ; =23
 425bd24: 9711e8e3     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bd28: 392d23e0     	strb	w0, [sp, #0xb48]
 425bd2c: 910643e0     	add	x0, sp, #0x190
 425bd30: 52800301     	mov	w1, #0x18               ; =24
 425bd34: 9711e8ab     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bd38: aa0003e2     	mov	x2, x0
 425bd3c: aa0103e3     	mov	x3, x1
 425bd40: 9103a3e0     	add	x0, sp, #0xe8
 425bd44: aa0203e1     	mov	x1, x2
 425bd48: aa0303e2     	mov	x2, x3
 425bd4c: 97045122     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bd50: 911ea2a0     	add	x0, x21, #0x7a8
 425bd54: 9103a3e1     	add	x1, sp, #0xe8
 425bd58: 970e7762     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425bd5c: 9101c2c0     	add	x0, x22, #0x70
 425bd60: d2800001     	mov	x1, #0x0                ; =0
 425bd64: 96f72fd5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bd68: 910082c0     	add	x0, x22, #0x20
 425bd6c: 96f72fc3     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bd70: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bd74: 36f800a8     	tbz	w8, #0x1f, 0x425bd88 <_ChromeMain+0x4256aec>
 425bd78: f94077e0     	ldr	x0, [sp, #0xe8]
 425bd7c: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bd84: 96f6b44d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bd88: 910643e0     	add	x0, sp, #0x190
 425bd8c: 52800321     	mov	w1, #0x19               ; =25
 425bd90: 9711e7a8     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd94: f9034be0     	str	x0, [sp, #0x690]
 425bd98: 910643e0     	add	x0, sp, #0x190
 425bd9c: 52800341     	mov	w1, #0x1a               ; =26
 425bda0: 9711e8c4     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bda4: 392d27e0     	strb	w0, [sp, #0xb49]
 425bda8: 395aa3e8     	ldrb	w8, [sp, #0x6a8]
 425bdac: 34000228     	cbz	w8, 0x425bdf0 <_ChromeMain+0x4256b54>
 425bdb0: 39d69fe8     	ldrsb	w8, [sp, #0x5a7]
 425bdb4: 37f80088     	tbnz	w8, #0x1f, 0x425bdc4 <_ChromeMain+0x4256b28>
 425bdb8: 790b23ff     	strh	wzr, [sp, #0x590]
 425bdbc: 39169fff     	strb	wzr, [sp, #0x5a7]
 425bdc0: 14000004     	b	0x425bdd0 <_ChromeMain+0x4256b34>
 425bdc4: f942cbe8     	ldr	x8, [sp, #0x590]
 425bdc8: 7900011f     	strh	wzr, [x8]
 425bdcc: f902cfff     	str	xzr, [sp, #0x598]
 425bdd0: 39d85fe8     	ldrsb	w8, [sp, #0x617]
 425bdd4: 37f80088     	tbnz	w8, #0x1f, 0x425bde4 <_ChromeMain+0x4256b48>
 425bdd8: 790c03ff     	strh	wzr, [sp, #0x600]
 425bddc: 39185fff     	strb	wzr, [sp, #0x617]
 425bde0: 14000004     	b	0x425bdf0 <_ChromeMain+0x4256b54>
 425bde4: f94303e8     	ldr	x8, [sp, #0x600]
 425bde8: 7900011f     	strh	wzr, [x8]
 425bdec: f90307ff     	str	xzr, [sp, #0x608]
 425bdf0: 910203e0     	add	x0, sp, #0x80
 425bdf4: 910c83e1     	add	x1, sp, #0x320
 425bdf8: 94ac42a0     	bl	0x6d6c878 <_ChromeMain+0x6d675dc>
 425bdfc: 910c83e0     	add	x0, sp, #0x320
 425be00: 94ac3547     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 425be04: 17fffd5d     	b	0x425b378 <_ChromeMain+0x42560dc>
 425be08: f94187e0     	ldr	x0, [sp, #0x308]
 425be0c: f9418fe8     	ldr	x8, [sp, #0x318]
 425be10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425be14: 96f6b429     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425be18: 17fffe64     	b	0x425b7a8 <_ChromeMain+0x425650c>
 425be1c: f9417be0     	ldr	x0, [sp, #0x2f0]
 425be20: f94183e8     	ldr	x8, [sp, #0x300]
 425be24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425be28: 96f6b424     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425be2c: 17fffe61     	b	0x425b7b0 <_ChromeMain+0x4256514>
 425be30: 34ffa428     	cbz	w8, 0x425b2b4 <_ChromeMain+0x4256018>
 425be34: 17fffd23     	b	0x425b2c0 <_ChromeMain+0x4256024>
 425be38: 13001d09     	sxtb	w9, w8
 425be3c: 7100013f     	cmp	w9, #0x0
 425be40: f94193e9     	ldr	x9, [sp, #0x320]
 425be44: f94197ea     	ldr	x10, [sp, #0x328]
 425be48: 9a954121     	csel	x1, x9, x21, mi
 425be4c: 9a884142     	csel	x2, x10, x8, mi
 425be50: 910b03e0     	add	x0, sp, #0x2c0
 425be54: 9709336b     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 425be58: 17fffd9d     	b	0x425b4cc <_ChromeMain+0x4256230>
 425be5c: 94f6a141     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 425be60: 35ffb708     	cbnz	w8, 0x425b540 <_ChromeMain+0x42562a4>
 425be64: 17fffdc1     	b	0x425b568 <_ChromeMain+0x42562cc>
 425be68: f94047e8     	ldr	x8, [sp, #0x88]
 425be6c: 52810609     	mov	w9, #0x830              ; =2096
 425be70: 9b097d09     	mul	x9, x8, x9
 425be74: aa1a03e0     	mov	x0, x26
 425be78: b4000169     	cbz	x9, 0x425bea4 <_ChromeMain+0x4256c08>
 425be7c: 8b090349     	add	x9, x26, x9
 425be80: d120c120     	sub	x0, x9, #0x830
 425be84: 928105e9     	mov	x9, #-0x830             ; =-2096
 425be88: 9b097d13     	mul	x19, x8, x9
 425be8c: b4ff9fc0     	cbz	x0, 0x425b284 <_ChromeMain+0x4255fe8>
 425be90: 94ac3523     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 425be94: d120c000     	sub	x0, x0, #0x830
 425be98: b120c273     	adds	x19, x19, #0x830
 425be9c: 54ffff81     	b.ne	0x425be8c <_ChromeMain+0x4256bf0>
 425bea0: f94043e0     	ldr	x0, [sp, #0x80]
 425bea4: cb000348     	sub	x8, x26, x0
 425bea8: 9344fd08     	asr	x8, x8, #4
 425beac: d289c569     	mov	x9, #0x4e2b             ; =20011
 425beb0: f2b92909     	movk	x9, #0xc948, lsl #16
 425beb4: f2d19669     	movk	x9, #0x8cb3, lsl #32
 425beb8: f2e07d09     	movk	x9, #0x3e8, lsl #48
 425bebc: 9b097d08     	mul	x8, x8, x9
 425bec0: f90047e8     	str	x8, [sp, #0x88]
 425bec4: f9404be8     	ldr	x8, [sp, #0x90]
 425bec8: 52810609     	mov	w9, #0x830              ; =2096
 425becc: 9b097d01     	mul	x1, x8, x9
 425bed0: 96f6b3fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bed4: 910c83f5     	add	x21, sp, #0x320
 425bed8: 9102c3fc     	add	x28, sp, #0xb0
 425bedc: 17fffdb5     	b	0x425b5b0 <_ChromeMain+0x4256314>
 425bee0: f94173e8     	ldr	x8, [sp, #0x2e0]
 425bee4: 17fffd50     	b	0x425b424 <_ChromeMain+0x4256188>
 425bee8: aa1303e0     	mov	x0, x19
 425beec: 1400000f     	b	0x425bf28 <_ChromeMain+0x4256c8c>
 425bef0: f94047e8     	ldr	x8, [sp, #0x88]
 425bef4: 52810609     	mov	w9, #0x830              ; =2096
 425bef8: 9b097d09     	mul	x9, x8, x9
 425befc: b4ffff69     	cbz	x9, 0x425bee8 <_ChromeMain+0x4256c4c>
 425bf00: 8b130129     	add	x9, x9, x19
 425bf04: d120c120     	sub	x0, x9, #0x830
 425bf08: 928105e9     	mov	x9, #-0x830             ; =-2096
 425bf0c: 9b097d14     	mul	x20, x8, x9
 425bf10: b4ff9ba0     	cbz	x0, 0x425b284 <_ChromeMain+0x4255fe8>
 425bf14: 94ac3502     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 425bf18: d120c000     	sub	x0, x0, #0x830
 425bf1c: b120c294     	adds	x20, x20, #0x830
 425bf20: 54ffff81     	b.ne	0x425bf10 <_ChromeMain+0x4256c74>
 425bf24: f94043e0     	ldr	x0, [sp, #0x80]
 425bf28: cb000268     	sub	x8, x19, x0
 425bf2c: 9344fd08     	asr	x8, x8, #4
 425bf30: d289c569     	mov	x9, #0x4e2b             ; =20011
 425bf34: f2b92909     	movk	x9, #0xc948, lsl #16
 425bf38: f2d19669     	movk	x9, #0x8cb3, lsl #32
 425bf3c: f2e07d09     	movk	x9, #0x3e8, lsl #48
 425bf40: 9b097d08     	mul	x8, x8, x9
 425bf44: f90047e8     	str	x8, [sp, #0x88]
 425bf48: f9404be8     	ldr	x8, [sp, #0x90]
 425bf4c: 52810609     	mov	w9, #0x830              ; =2096
 425bf50: 9b097d01     	mul	x1, x8, x9
 425bf54: 96f6b3d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bf58: 17fffd87     	b	0x425b574 <_ChromeMain+0x42562d8>
 425bf5c: f9405fe0     	ldr	x0, [sp, #0xb8]
 425bf60: f94067e8     	ldr	x8, [sp, #0xc8]
 425bf64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bf68: 96f6b3d4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bf6c: 17ffff2d     	b	0x425bc20 <_ChromeMain+0x4256984>
 425bf70: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 425bf74: a90157f6     	stp	x22, x21, [sp, #0x10]
 425bf78: a9024ff4     	stp	x20, x19, [sp, #0x20]
 425bf7c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 425bf80: 9100c3fd     	add	x29, sp, #0x30
 425bf84: b40007c1     	cbz	x1, 0x425c07c <_ChromeMain+0x4256de0>
 425bf88: aa0303f4     	mov	x20, x3
 425bf8c: aa0203f5     	mov	x21, x2
 425bf90: aa0103f6     	mov	x22, x1
 425bf94: aa0003f7     	mov	x23, x0
 425bf98: aa0803f3     	mov	x19, x8
 425bf9c: aa0103e0     	mov	x0, x1
 425bfa0: 94f69cff     	bl	0x800339c <_ChromeMain+0x7ffe100>
 425bfa4: aa0003e2     	mov	x2, x0
 425bfa8: aa1703e0     	mov	x0, x23
 425bfac: aa1603e1     	mov	x1, x22
 425bfb0: 97083b64     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425bfb4: b5000440     	cbnz	x0, 0x425c03c <_ChromeMain+0x4256da0>
 425bfb8: 92800208     	mov	x8, #-0x11              ; =-17
 425bfbc: f2efffe8     	movk	x8, #0x7fff, lsl #48
 425bfc0: eb08029f     	cmp	x20, x8
 425bfc4: 540005e2     	b.hs	0x425c080 <_ChromeMain+0x4256de4>
 425bfc8: f1002a9f     	cmp	x20, #0xa
 425bfcc: 54000349     	b.ls	0x425c034 <_ChromeMain+0x4256d98>
 425bfd0: 927dee96     	and	x22, x20, #0x7ffffffffffffff8
 425bfd4: d37ffac8     	lsl	x8, x22, #1
 425bfd8: 91004100     	add	x0, x8, #0x10
 425bfdc: 96f6cce3     	bl	0xf368 <_ChromeMain+0xa0cc>
 425bfe0: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 425bfe4: cb0802c8     	sub	x8, x22, x8
 425bfe8: a9005260     	stp	x0, x20, [x19]
 425bfec: f9000a68     	str	x8, [x19, #0x10]
 425bff0: aa0003f3     	mov	x19, x0
 425bff4: 8b140668     	add	x8, x19, x20, lsl #1
 425bff8: eb13011f     	cmp	x8, x19
 425bffc: 54000403     	b.lo	0x425c07c <_ChromeMain+0x4256de0>
 425c000: eb15011f     	cmp	x8, x21
 425c004: fa558262     	ccmp	x19, x21, #0x2, hi
 425c008: 540003a9     	b.ls	0x425c07c <_ChromeMain+0x4256de0>
 425c00c: d37ffa82     	lsl	x2, x20, #1
 425c010: aa1303e0     	mov	x0, x19
 425c014: aa1503e1     	mov	x1, x21
 425c018: 94f6ccad     	bl	0x800f2cc <_ChromeMain+0x800a030>
 425c01c: 78347a7f     	strh	wzr, [x19, x20, lsl #1]
 425c020: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425c024: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425c028: a94157f6     	ldp	x22, x21, [sp, #0x10]
 425c02c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 425c030: d65f03c0     	ret
 425c034: 39005e74     	strb	w20, [x19, #0x17]
 425c038: 17ffffef     	b	0x425bff4 <_ChromeMain+0x4256d58>
 425c03c: 39406008     	ldrb	w8, [x0, #0x18]
 425c040: 7100111f     	cmp	w8, #0x4
 425c044: 54fffba1     	b.ne	0x425bfb8 <_ChromeMain+0x4256d1c>
 425c048: 39805c01     	ldrsb	x1, [x0, #0x17]
 425c04c: b7f80101     	tbnz	x1, #0x3f, 0x425c06c <_ChromeMain+0x4256dd0>
 425c050: 34fffb41     	cbz	w1, 0x425bfb8 <_ChromeMain+0x4256d1c>
 425c054: aa1303e8     	mov	x8, x19
 425c058: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 425c05c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 425c060: a94157f6     	ldp	x22, x21, [sp, #0x10]
 425c064: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 425c068: 171a18aa     	b	0x8e2310 <_ChromeMain+0x8dd074>
 425c06c: f9400401     	ldr	x1, [x0, #0x8]
 425c070: b4fffa41     	cbz	x1, 0x425bfb8 <_ChromeMain+0x4256d1c>
 425c074: f9400000     	ldr	x0, [x0]
 425c078: 17fffff7     	b	0x425c054 <_ChromeMain+0x4256db8>
 425c07c: d4200020     	brk	#0x1
 425c080: 942b204a     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 425c084: 6db733ed     	stp	d13, d12, [sp, #-0x90]!
 425c088: 6d012beb     	stp	d11, d10, [sp, #0x10]
 425c08c: 6d0223e9     	stp	d9, d8, [sp, #0x20]
 425c090: a9036ffc     	stp	x28, x27, [sp, #0x30]
 425c094: a90467fa     	stp	x26, x25, [sp, #0x40]
 425c098: a9055ff8     	stp	x24, x23, [sp, #0x50]
 425c09c: a90657f6     	stp	x22, x21, [sp, #0x60]
 425c0a0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 425c0a4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 425c0a8: 910203fd     	add	x29, sp, #0x80
 425c0ac: d10783ff     	sub	sp, sp, #0x1e0
 425c0b0: f9000fe3     	str	x3, [sp, #0x18]
 425c0b4: b90017e2     	str	w2, [sp, #0x14]
 425c0b8: a9402016     	ldp	x22, x8, [x0]
 425c0bc: 8b0816d3     	add	x19, x22, x8, lsl #5
 425c0c0: eb1302df     	cmp	x22, x19
 425c0c4: 540046c8     	b.hi	0x425c99c <_ChromeMain+0x4257700>
 425c0c8: d37be908     	lsl	x8, x8, #5
 425c0cc: b40008a8     	cbz	x8, 0x425c1e0 <_ChromeMain+0x4256f44>
 425c0d0: aa0103f5     	mov	x21, x1
 425c0d4: b201f3f9     	mov	x25, #-0x5555555555555556 ; =-6148914691236517206
 425c0d8: f2e15559     	movk	x25, #0xaaa, lsl #48
 425c0dc: 9004ee68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 425c0e0: f9444908     	ldr	x8, [x8, #0x890]
 425c0e4: fd400108     	ldr	d8, [x8]
 425c0e8: 9004ac57     	adrp	x23, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 425c0ec: 911cdef7     	add	x23, x23, #0x737
 425c0f0: d2effe08     	mov	x8, #0x7ff0000000000000 ; =9218868437227405312
 425c0f4: 9e670109     	fmov	d9, x8
 425c0f8: f004e768     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 425c0fc: fd45ad0a     	ldr	d10, [x8, #0xb58]
 425c100: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 425c104: 9e67010b     	fmov	d11, x8
 425c108: 92f78408     	mov	x8, #0x43dfffffffffffff ; =4890909195324358655
 425c10c: 9e67010c     	fmov	d12, x8
 425c110: 1400005a     	b	0x425c278 <_ChromeMain+0x4256fdc>
 425c114: aa1603e0     	mov	x0, x22
 425c118: b004ad01     	adrp	x1, 0xd7fd000 <dyld_stub_binder+0xd7fd000>
 425c11c: 911c5821     	add	x1, x1, #0x716
 425c120: 52800062     	mov	w2, #0x3                ; =3
 425c124: 97773657     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 425c128: b4000940     	cbz	x0, 0x425c250 <_ChromeMain+0x4256fb4>
 425c12c: aa0003e1     	mov	x1, x0
 425c130: f9005bff     	str	xzr, [sp, #0xb0]
 425c134: 6f00e400     	movi.2d	v0, #0000000000000000
 425c138: ad0483e0     	stp	q0, q0, [sp, #0x90]
 425c13c: ad0383e0     	stp	q0, q0, [sp, #0x70]
 425c140: ad0283e0     	stp	q0, q0, [sp, #0x50]
 425c144: 3d8013e0     	str	q0, [sp, #0x40]
 425c148: 39805c02     	ldrsb	x2, [x0, #0x17]
 425c14c: b6f80042     	tbz	x2, #0x3f, 0x425c154 <_ChromeMain+0x4256eb8>
 425c150: a9400821     	ldp	x1, x2, [x1]
 425c154: 910103e0     	add	x0, sp, #0x40
 425c158: 9704501f     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425c15c: 394163e8     	ldrb	w8, [sp, #0x58]
 425c160: 34000268     	cbz	w8, 0x425c1ac <_ChromeMain+0x4256f10>
 425c164: 910103e0     	add	x0, sp, #0x40
 425c168: 9004acc1     	adrp	x1, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 425c16c: 910b4c21     	add	x1, x1, #0x2d3
 425c170: 528000c2     	mov	w2, #0x6                ; =6
 425c174: 970d1087     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c178: 370001a0     	tbnz	w0, #0x0, 0x425c1ac <_ChromeMain+0x4256f10>
 425c17c: 910103e0     	add	x0, sp, #0x40
 425c180: d004b221     	adrp	x1, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 425c184: 91144021     	add	x1, x1, #0x510
 425c188: 52800202     	mov	w2, #0x10               ; =16
 425c18c: 970d1081     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c190: 370000e0     	tbnz	w0, #0x0, 0x425c1ac <_ChromeMain+0x4256f10>
 425c194: 910103e0     	add	x0, sp, #0x40
 425c198: d004bb81     	adrp	x1, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 425c19c: 9133cc21     	add	x1, x1, #0xcf3
 425c1a0: 52800102     	mov	w2, #0x8                ; =8
 425c1a4: 970d107b     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425c1a8: 36002b80     	tbz	w0, #0x0, 0x425c718 <_ChromeMain+0x425747c>
 425c1ac: 910103f8     	add	x24, sp, #0x40
 425c1b0: 9101c300     	add	x0, x24, #0x70
 425c1b4: d2800001     	mov	x1, #0x0                ; =0
 425c1b8: 96f72ec0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425c1bc: 91008300     	add	x0, x24, #0x20
