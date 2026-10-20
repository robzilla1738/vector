
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
