
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4259ef0: d107c3ff     	sub	sp, sp, #0x1f0
 4259ef4: a9196ffc     	stp	x28, x27, [sp, #0x190]
 4259ef8: a91a67fa     	stp	x26, x25, [sp, #0x1a0]
 4259efc: a91b5ff8     	stp	x24, x23, [sp, #0x1b0]
 4259f00: a91c57f6     	stp	x22, x21, [sp, #0x1c0]
 4259f04: a91d4ff4     	stp	x20, x19, [sp, #0x1d0]
 4259f08: a91e7bfd     	stp	x29, x30, [sp, #0x1e0]
 4259f0c: 910783fd     	add	x29, sp, #0x1e0
 4259f10: aa0103f4     	mov	x20, x1
 4259f14: aa0803f3     	mov	x19, x8
 4259f18: a9007d1f     	stp	xzr, xzr, [x8]
 4259f1c: f900091f     	str	xzr, [x8, #0x10]
 4259f20: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4259f24: f81803bf     	stur	xzr, [x29, #-0x80]
 4259f28: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4259f2c: 91145421     	add	x1, x1, #0x515
 4259f30: d10243a8     	sub	x8, x29, #0x90
 4259f34: 52800242     	mov	w2, #0x12               ; =18
 4259f38: 9750fd37     	bl	0x1699414 <_ChromeMain+0x1694178>
 4259f3c: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 4259f40: f81683bf     	stur	xzr, [x29, #-0x98]
 4259f44: d102a3b5     	sub	x21, x29, #0xa8
 4259f48: d10243a0     	sub	x0, x29, #0x90
 4259f4c: d102a3a1     	sub	x1, x29, #0xa8
 4259f50: 92800002     	mov	x2, #-0x1               ; =-1
 4259f54: 9774e30d     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4259f58: 34000260     	cbz	w0, 0x4259fa4 <_ChromeMain+0x4254d08>
 4259f5c: 6f00e400     	movi.2d	v0, #0000000000000000
 4259f60: ad3983a0     	stp	q0, q0, [x29, #-0xd0]
 4259f64: 3896f3a8     	ldursb	x8, [x29, #-0x91]
 4259f68: a975aba9     	ldp	x9, x10, [x29, #-0xa8]
 4259f6c: f100011f     	cmp	x8, #0x0
 4259f70: 9a954120     	csel	x0, x9, x21, mi
 4259f74: 7100011f     	cmp	w8, #0x0
 4259f78: 9a884141     	csel	x1, x10, x8, mi
 4259f7c: d10343a8     	sub	x8, x29, #0xd0
 4259f80: 52800002     	mov	w2, #0x0                ; =0
 4259f84: 52801903     	mov	w3, #0xc8               ; =200
 4259f88: 97659fed     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4259f8c: 385483a8     	ldurb	w8, [x29, #-0xb8]
 4259f90: 35000348     	cbnz	w8, 0x4259ff8 <_ChromeMain+0x4254d5c>
 4259f94: 385483a8     	ldurb	w8, [x29, #-0xb8]
 4259f98: 34000068     	cbz	w8, 0x4259fa4 <_ChromeMain+0x4254d08>
 4259f9c: d10343a0     	sub	x0, x29, #0xd0
 4259fa0: 971c1138     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4259fa4: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 4259fa8: 36f800a8     	tbz	w8, #0x1f, 0x4259fbc <_ChromeMain+0x4254d20>
 4259fac: f85583a0     	ldur	x0, [x29, #-0xa8]
 4259fb0: f85683a8     	ldur	x8, [x29, #-0x98]
 4259fb4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259fb8: 96f6bbc0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259fbc: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4259fc0: 37f80128     	tbnz	w8, #0x1f, 0x4259fe4 <_ChromeMain+0x4254d48>
 4259fc4: a95e7bfd     	ldp	x29, x30, [sp, #0x1e0]
 4259fc8: a95d4ff4     	ldp	x20, x19, [sp, #0x1d0]
 4259fcc: a95c57f6     	ldp	x22, x21, [sp, #0x1c0]
 4259fd0: a95b5ff8     	ldp	x24, x23, [sp, #0x1b0]
 4259fd4: a95a67fa     	ldp	x26, x25, [sp, #0x1a0]
 4259fd8: a9596ffc     	ldp	x28, x27, [sp, #0x190]
 4259fdc: 9107c3ff     	add	sp, sp, #0x1f0
 4259fe0: d65f03c0     	ret
 4259fe4: f85703a0     	ldur	x0, [x29, #-0x90]
 4259fe8: f85803a8     	ldur	x8, [x29, #-0x80]
 4259fec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259ff0: 96f6bbb2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259ff4: 17fffff4     	b	0x4259fc4 <_ChromeMain+0x4254d28>
 4259ff8: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4259ffc: 9114a021     	add	x1, x1, #0x528
 425a000: d10343a0     	sub	x0, x29, #0xd0
 425a004: 52800262     	mov	w2, #0x13               ; =19
 425a008: 9708434e     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425a00c: b4fffc40     	cbz	x0, 0x4259f94 <_ChromeMain+0x4254cf8>
 425a010: 39406008     	ldrb	w8, [x0, #0x18]
 425a014: 7100191f     	cmp	w8, #0x6
 425a018: 54fffbe1     	b.ne	0x4259f94 <_ChromeMain+0x4254cf8>
 425a01c: f9400408     	ldr	x8, [x0, #0x8]
 425a020: d37be909     	lsl	x9, x8, #5
 425a024: b4fffb89     	cbz	x9, 0x4259f94 <_ChromeMain+0x4254cf8>
 425a028: f940001a     	ldr	x26, [x0]
 425a02c: 8b08175b     	add	x27, x26, x8, lsl #5
 425a030: 9100229c     	add	x28, x20, #0x8
 425a034: 12800017     	mov	w23, #-0x1              ; =-1
 425a038: 1400000c     	b	0x425a068 <_ChromeMain+0x4254dcc>
 425a03c: 540004a2     	b.hs	0x425a0d0 <_ChromeMain+0x4254e34>
 425a040: f9400294     	ldr	x20, [x20]
 425a044: b50002b4     	cbnz	x20, 0x425a098 <_ChromeMain+0x4254dfc>
 425a048: 14000024     	b	0x425a0d8 <_ChromeMain+0x4254e3c>
 425a04c: eb1502df     	cmp	x22, x21
 425a050: 54ffff61     	b.ne	0x425a03c <_ChromeMain+0x4254da0>
 425a054: eb1c029f     	cmp	x20, x28
 425a058: 54000400     	b.eq	0x425a0d8 <_ChromeMain+0x4254e3c>
 425a05c: 9100835a     	add	x26, x26, #0x20
 425a060: eb1b035f     	cmp	x26, x27
 425a064: 54fff980     	b.eq	0x4259f94 <_ChromeMain+0x4254cf8>
 425a068: f9400f58     	ldr	x24, [x26, #0x18]
 425a06c: 39406308     	ldrb	w8, [x24, #0x18]
 425a070: 7100191f     	cmp	w8, #0x6
 425a074: 54ffff41     	b.ne	0x425a05c <_ChromeMain+0x4254dc0>
 425a078: f9400394     	ldr	x20, [x28]
 425a07c: b40002f4     	cbz	x20, 0x425a0d8 <_ChromeMain+0x4254e3c>
 425a080: 39805f48     	ldrsb	x8, [x26, #0x17]
 425a084: a9402b49     	ldp	x9, x10, [x26]
 425a088: f100011f     	cmp	x8, #0x0
 425a08c: 9a9a4139     	csel	x25, x9, x26, mi
 425a090: 7100011f     	cmp	w8, #0x0
 425a094: 9a884156     	csel	x22, x10, x8, mi
 425a098: aa1403e8     	mov	x8, x20
 425a09c: f8420d09     	ldr	x9, [x8, #0x20]!
 425a0a0: 39805d0a     	ldrsb	x10, [x8, #0x17]
 425a0a4: f100015f     	cmp	x10, #0x0
 425a0a8: 9a884121     	csel	x1, x9, x8, mi
 425a0ac: f9400508     	ldr	x8, [x8, #0x8]
 425a0b0: 7100015f     	cmp	w10, #0x0
 425a0b4: 9a8a4115     	csel	x21, x8, x10, mi
 425a0b8: eb1602bf     	cmp	x21, x22
 425a0bc: 9a9632a2     	csel	x2, x21, x22, lo
 425a0c0: aa1903e0     	mov	x0, x25
 425a0c4: 94f6bde7     	bl	0x8009860 <_ChromeMain+0x80045c4>
 425a0c8: 34fffc20     	cbz	w0, 0x425a04c <_ChromeMain+0x4254db0>
 425a0cc: 37fffba0     	tbnz	w0, #0x1f, 0x425a040 <_ChromeMain+0x4254da4>
 425a0d0: f9400694     	ldr	x20, [x20, #0x8]
 425a0d4: b5fffe34     	cbnz	x20, 0x425a098 <_ChromeMain+0x4254dfc>
 425a0d8: aa1803e0     	mov	x0, x24
 425a0dc: f004b321     	adrp	x1, 0xd8c1000 <dyld_stub_binder+0xd8c1000>
 425a0e0: 9139e421     	add	x1, x1, #0xe79
 425a0e4: 52800102     	mov	w2, #0x8                ; =8
 425a0e8: 971c11d6     	bl	0x95e840 <_ChromeMain+0x9595a4>
 425a0ec: b40000c0     	cbz	x0, 0x425a104 <_ChromeMain+0x4254e68>
 425a0f0: f004be21     	adrp	x1, 0xda21000 <dyld_stub_binder+0xda21000>
 425a0f4: 91225021     	add	x1, x1, #0x894
 425a0f8: 528000a2     	mov	w2, #0x5                ; =5
 425a0fc: 971c11d1     	bl	0x95e840 <_ChromeMain+0x9595a4>
 425a100: b5fffae0     	cbnz	x0, 0x425a05c <_ChromeMain+0x4254dc0>
 425a104: 6f00e400     	movi.2d	v0, #0000000000000000
 425a108: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 425a10c: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 425a110: f9007bff     	str	xzr, [sp, #0xf0]
 425a114: ad0483e0     	stp	q0, q0, [sp, #0x90]
 425a118: b900b7f7     	str	w23, [sp, #0xb4]
 425a11c: b900bff7     	str	w23, [sp, #0xbc]
 425a120: b900c7f7     	str	w23, [sp, #0xc4]
 425a124: b900cff7     	str	w23, [sp, #0xcc]
 425a128: b900d7f7     	str	w23, [sp, #0xd4]
 425a12c: b900dff7     	str	w23, [sp, #0xdc]
 425a130: b900e7f7     	str	w23, [sp, #0xe4]
 425a134: b900eff7     	str	w23, [sp, #0xec]
 425a138: 3903c7ff     	strb	wzr, [sp, #0xf1]
 425a13c: 910243e8     	add	x8, sp, #0x90
 425a140: a906fd1f     	stp	xzr, xzr, [x8, #0x68]
 425a144: aa1803e0     	mov	x0, x24
 425a148: b004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425a14c: 9114f021     	add	x1, x1, #0x53c
 425a150: 52800262     	mov	w2, #0x13               ; =19
 425a154: 970842fb     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425a158: b5000b00     	cbnz	x0, 0x425a2b8 <_ChromeMain+0x425501c>
 425a15c: aa1803e0     	mov	x0, x24
 425a160: b004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425a164: 91154021     	add	x1, x1, #0x550
 425a168: 528001a2     	mov	w2, #0xd                ; =13
 425a16c: 974a1cd5     	bl	0x14e14c0 <_ChromeMain+0x14dc224>
 425a170: 52802028     	mov	w8, #0x101              ; =257
 425a174: 6a20011f     	bics	wzr, w8, w0
 425a178: 540007e1     	b.ne	0x425a274 <_ChromeMain+0x4254fd8>
 425a17c: 39c05f48     	ldrsb	w8, [x26, #0x17]
 425a180: 37f80948     	tbnz	w8, #0x1f, 0x425a2a8 <_ChromeMain+0x425500c>
 425a184: 3dc00340     	ldr	q0, [x26]
 425a188: f9400b48     	ldr	x8, [x26, #0x10]
 425a18c: f9000be8     	str	x8, [sp, #0x10]
 425a190: 3d8003e0     	str	q0, [sp]
 425a194: 910003f4     	mov	x20, sp
 425a198: 91006280     	add	x0, x20, #0x18
 425a19c: 910243e1     	add	x1, sp, #0x90
 425a1a0: 96fe0329     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 425a1a4: a9402668     	ldp	x8, x9, [x19]
 425a1a8: 5280120a     	mov	w10, #0x90              ; =144
 425a1ac: 9b0a2128     	madd	x8, x9, x10, x8
 425a1b0: a939a3b3     	stp	x19, x8, [x29, #-0x68]
 425a1b4: f9400a6a     	ldr	x10, [x19, #0x10]
 425a1b8: d10183ab     	sub	x11, x29, #0x60
 425a1bc: a938d3ab     	stp	x11, x20, [x29, #-0x78]
 425a1c0: 910003eb     	mov	x11, sp
 425a1c4: eb0a013f     	cmp	x9, x10
 425a1c8: 54000ca0     	b.eq	0x425a35c <_ChromeMain+0x42550c0>
 425a1cc: b4000c68     	cbz	x8, 0x425a358 <_ChromeMain+0x42550bc>
 425a1d0: 3dc003e0     	ldr	q0, [sp]
 425a1d4: f9400be9     	ldr	x9, [sp, #0x10]
 425a1d8: f9000909     	str	x9, [x8, #0x10]
 425a1dc: 3d800100     	str	q0, [x8]
 425a1e0: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 425a1e4: f90003ff     	str	xzr, [sp]
 425a1e8: 91006100     	add	x0, x8, #0x18
 425a1ec: 91006161     	add	x1, x11, #0x18
 425a1f0: 96fe0315     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 425a1f4: f85a03a8     	ldur	x8, [x29, #-0x60]
 425a1f8: 91024108     	add	x8, x8, #0x90
 425a1fc: f81a03a8     	stur	x8, [x29, #-0x60]
 425a200: f85a03a8     	ldur	x8, [x29, #-0x60]
 425a204: f9400269     	ldr	x9, [x19]
 425a208: eb090108     	subs	x8, x8, x9
 425a20c: 9344fd08     	asr	x8, x8, #4
 425a210: d291c729     	mov	x9, #0x8e39             ; =36409
 425a214: f2a71c69     	movk	x9, #0x38e3, lsl #16
 425a218: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 425a21c: f2f1c709     	movk	x9, #0x8e38, lsl #48
 425a220: 9b097d08     	mul	x8, x8, x9
 425a224: f9000668     	str	x8, [x19, #0x8]
 425a228: 54000980     	b.eq	0x425a358 <_ChromeMain+0x42550bc>
 425a22c: 910003f4     	mov	x20, sp
 425a230: 91022280     	add	x0, x20, #0x88
 425a234: d2800001     	mov	x1, #0x0                ; =0
 425a238: 96f736a0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425a23c: 9100e280     	add	x0, x20, #0x38
 425a240: 96f7368e     	bl	0x27c78 <_ChromeMain+0x229dc>
 425a244: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 425a248: 36f800a8     	tbz	w8, #0x1f, 0x425a25c <_ChromeMain+0x4254fc0>
 425a24c: f9400fe0     	ldr	x0, [sp, #0x18]
 425a250: f94017e8     	ldr	x8, [sp, #0x28]
 425a254: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a258: 96f6bb18     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a25c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 425a260: 36f800a8     	tbz	w8, #0x1f, 0x425a274 <_ChromeMain+0x4254fd8>
 425a264: f94003e0     	ldr	x0, [sp]
 425a268: f9400be8     	ldr	x8, [sp, #0x10]
 425a26c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a270: 96f6bb12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a274: 910243f4     	add	x20, sp, #0x90
 425a278: 9101c280     	add	x0, x20, #0x70
 425a27c: d2800001     	mov	x1, #0x0                ; =0
 425a280: 96f7368e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425a284: 91008280     	add	x0, x20, #0x20
 425a288: 96f7367c     	bl	0x27c78 <_ChromeMain+0x229dc>
 425a28c: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 425a290: 36ffee68     	tbz	w8, #0x1f, 0x425a05c <_ChromeMain+0x4254dc0>
 425a294: f9404be0     	ldr	x0, [sp, #0x90]
 425a298: f94053e8     	ldr	x8, [sp, #0xa0]
 425a29c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a2a0: 96f6bb06     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a2a4: 17ffff6e     	b	0x425a05c <_ChromeMain+0x4254dc0>
 425a2a8: a9400b41     	ldp	x1, x2, [x26]
 425a2ac: 910003e0     	mov	x0, sp
 425a2b0: 96f6f7da     	bl	0x18218 <_ChromeMain+0x12f7c>
 425a2b4: 17ffffb8     	b	0x425a194 <_ChromeMain+0x4254ef8>
 425a2b8: aa0003e1     	mov	x1, x0
 425a2bc: 39406008     	ldrb	w8, [x0, #0x18]
 425a2c0: 7100111f     	cmp	w8, #0x4
 425a2c4: 54fff4c1     	b.ne	0x425a15c <_ChromeMain+0x4254ec0>
 425a2c8: f9003bff     	str	xzr, [sp, #0x70]
 425a2cc: 6f00e400     	movi.2d	v0, #0000000000000000
 425a2d0: ad0283e0     	stp	q0, q0, [sp, #0x50]
 425a2d4: ad0183e0     	stp	q0, q0, [sp, #0x30]
 425a2d8: ad0083e0     	stp	q0, q0, [sp, #0x10]
 425a2dc: 3d8003e0     	str	q0, [sp]
 425a2e0: 39805c22     	ldrsb	x2, [x1, #0x17]
 425a2e4: b6f80042     	tbz	x2, #0x3f, 0x425a2ec <_ChromeMain+0x4255050>
 425a2e8: a9400821     	ldp	x1, x2, [x1]
 425a2ec: 910003e0     	mov	x0, sp
 425a2f0: 970457b9     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425a2f4: 394063e8     	ldrb	w8, [sp, #0x18]
 425a2f8: 35000108     	cbnz	w8, 0x425a318 <_ChromeMain+0x425507c>
 425a2fc: 910003f4     	mov	x20, sp
 425a300: 9101c280     	add	x0, x20, #0x70
 425a304: d2800001     	mov	x1, #0x0                ; =0
 425a308: 96f7366c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425a30c: 91008280     	add	x0, x20, #0x20
 425a310: 96f7365a     	bl	0x27c78 <_ChromeMain+0x229dc>
 425a314: 17ffffd2     	b	0x425a25c <_ChromeMain+0x4254fc0>
 425a318: 910243e0     	add	x0, sp, #0x90
 425a31c: 910003e1     	mov	x1, sp
 425a320: 970e7df0     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425a324: 910003f4     	mov	x20, sp
 425a328: 9101c280     	add	x0, x20, #0x70
 425a32c: d2800001     	mov	x1, #0x0                ; =0
 425a330: 96f73662     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425a334: 91008280     	add	x0, x20, #0x20
 425a338: 96f73650     	bl	0x27c78 <_ChromeMain+0x229dc>
 425a33c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 425a340: 36fff1e8     	tbz	w8, #0x1f, 0x425a17c <_ChromeMain+0x4254ee0>
 425a344: f94003e0     	ldr	x0, [sp]
 425a348: f9400be8     	ldr	x8, [sp, #0x10]
 425a34c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425a350: 96f6bada     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425a354: 17ffff8a     	b	0x425a17c <_ChromeMain+0x4254ee0>
 425a358: d4200020     	brk	#0x1
 425a35c: d101e3a0     	sub	x0, x29, #0x78
 425a360: 940009c0     	bl	0x425ca60 <_ChromeMain+0x42577c4>
 425a364: 17ffffa7     	b	0x425a200 <_ChromeMain+0x4254f64>
 425a368: d503201f     	nop
 425a36c: d503201f     	nop
 425a370: d503201f     	nop
 425a374: d503201f     	nop
 425a378: d503201f     	nop
 425a37c: d503201f     	nop
