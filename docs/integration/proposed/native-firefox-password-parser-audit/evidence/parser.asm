
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46bedf0: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 46bedf4: a9016ffc     	stp	x28, x27, [sp, #0x10]
 46bedf8: a90267fa     	stp	x26, x25, [sp, #0x20]
 46bedfc: a9035ff8     	stp	x24, x23, [sp, #0x30]
 46bee00: a90457f6     	stp	x22, x21, [sp, #0x40]
 46bee04: a9054ff4     	stp	x20, x19, [sp, #0x50]
 46bee08: a9067bfd     	stp	x29, x30, [sp, #0x60]
 46bee0c: 910183fd     	add	x29, sp, #0x60
 46bee10: d11483ff     	sub	sp, sp, #0x520
 46bee14: aa0203f4     	mov	x20, x2
 46bee18: aa0103e8     	mov	x8, x1
 46bee1c: f9001fe0     	str	x0, [sp, #0x38]
 46bee20: f90163ff     	str	xzr, [sp, #0x2c0]
 46bee24: f9015fff     	str	xzr, [sp, #0x2b8]
 46bee28: f90167ff     	str	xzr, [sp, #0x2c8]
 46bee2c: 910ae3f3     	add	x19, sp, #0x2b8
 46bee30: 910ae3e1     	add	x1, sp, #0x2b8
 46bee34: aa0803e0     	mov	x0, x8
 46bee38: 92800002     	mov	x2, #-0x1               ; =-1
 46bee3c: 97634f53     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 46bee40: f9015bff     	str	xzr, [sp, #0x2b0]
 46bee44: 6f00e400     	movi.2d	v0, #0000000000000000
 46bee48: ad1483e0     	stp	q0, q0, [sp, #0x290]
 46bee4c: 398b3fe8     	ldrsb	x8, [sp, #0x2cf]
 46bee50: f9415fe9     	ldr	x9, [sp, #0x2b8]
 46bee54: f94163ea     	ldr	x10, [sp, #0x2c0]
 46bee58: f100011f     	cmp	x8, #0x0
 46bee5c: 9a934120     	csel	x0, x9, x19, mi
 46bee60: 7100011f     	cmp	w8, #0x0
 46bee64: 9a884141     	csel	x1, x10, x8, mi
 46bee68: 910a43e8     	add	x8, sp, #0x290
 46bee6c: 52800682     	mov	w2, #0x34               ; =52
 46bee70: 52801903     	mov	w3, #0xc8               ; =200
 46bee74: 97540c6d     	bl	0x1bc2028 <_ChromeMain+0x1bbcd8c>
 46bee78: 394ac3e8     	ldrb	w8, [sp, #0x2b0]
 46bee7c: 394aa3e9     	ldrb	w9, [sp, #0x2a8]
 46bee80: 7100193f     	cmp	w9, #0x6
 46bee84: 1a9f17e9     	cset	w9, eq
 46bee88: 6a090108     	ands	w8, w8, w9
 46bee8c: b90017e8     	str	w8, [sp, #0x14]
 46bee90: 54000501     	b.ne	0x46bef30 <_ChromeMain+0x46b9c94>
 46bee94: 394ac3e8     	ldrb	w8, [sp, #0x2b0]
 46bee98: 360000c8     	tbz	w8, #0x0, 0x46beeb0 <_ChromeMain+0x46b9c14>
 46bee9c: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 46beea0: 7103fd1f     	cmp	w8, #0xff
 46beea4: 54000060     	b.eq	0x46beeb0 <_ChromeMain+0x46b9c14>
 46beea8: 721e791f     	tst	w8, #0xfffffffd
 46beeac: 54000221     	b.ne	0x46beef0 <_ChromeMain+0x46b9c54>
 46beeb0: 39cb3fe8     	ldrsb	w8, [sp, #0x2cf]
 46beeb4: 36f800a8     	tbz	w8, #0x1f, 0x46beec8 <_ChromeMain+0x46b9c2c>
 46beeb8: f9415fe0     	ldr	x0, [sp, #0x2b8]
 46beebc: f94167e8     	ldr	x8, [sp, #0x2c8]
 46beec0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46beec4: 96e527fd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46beec8: b94017e0     	ldr	w0, [sp, #0x14]
 46beecc: 911483ff     	add	sp, sp, #0x520
 46beed0: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 46beed4: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 46beed8: a94457f6     	ldp	x22, x21, [sp, #0x40]
 46beedc: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 46beee0: a94267fa     	ldp	x26, x25, [sp, #0x20]
 46beee4: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 46beee8: 6cc723e9     	ldp	d9, d8, [sp], #0x70
 46beeec: d65f03c0     	ret
 46beef0: 7100111f     	cmp	w8, #0x4
 46beef4: 54000100     	b.eq	0x46bef14 <_ChromeMain+0x46b9c78>
 46beef8: f0051009     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 46beefc: 9121e129     	add	x9, x9, #0x878
 46bef00: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 46bef04: 910443e0     	add	x0, sp, #0x110
 46bef08: 910a43e1     	add	x1, sp, #0x290
 46bef0c: d63f0100     	blr	x8
 46bef10: 17ffffe8     	b	0x46beeb0 <_ChromeMain+0x46b9c14>
 46bef14: 39ca9fe8     	ldrsb	w8, [sp, #0x2a7]
 46bef18: 36fffcc8     	tbz	w8, #0x1f, 0x46beeb0 <_ChromeMain+0x46b9c14>
 46bef1c: f9414be0     	ldr	x0, [sp, #0x290]
 46bef20: f94153e8     	ldr	x8, [sp, #0x2a0]
 46bef24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bef28: 96e527e4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bef2c: 17ffffe1     	b	0x46beeb0 <_ChromeMain+0x46b9c14>
 46bef30: d004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bef34: 910b7821     	add	x1, x1, #0x2de
 46bef38: 910a43e0     	add	x0, sp, #0x290
 46bef3c: 528001a2     	mov	w2, #0xd                ; =13
 46bef40: 9749b6d0     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 46bef44: b4000280     	cbz	x0, 0x46bef94 <_ChromeMain+0x46b9cf8>
 46bef48: a9402013     	ldp	x19, x8, [x0]
 46bef4c: 8b081669     	add	x9, x19, x8, lsl #5
 46bef50: eb09027f     	cmp	x19, x9
 46bef54: 54006e68     	b.hi	0x46bfd20 <_ChromeMain+0x46baa84>
 46bef58: d37be915     	lsl	x21, x8, #5
 46bef5c: b40001d5     	cbz	x21, 0x46bef94 <_ChromeMain+0x46b9cf8>
 46bef60: 910443f7     	add	x23, sp, #0x110
 46bef64: 910022f8     	add	x24, x23, #0x8
 46bef68: 910183f9     	add	x25, sp, #0x60
 46bef6c: 910f03fa     	add	x26, sp, #0x3c0
 46bef70: 1280001b     	mov	w27, #-0x1              ; =-1
 46bef74: 2f07e608     	movi	d8, #0xffffffff00000000
 46bef78: d288d9fc     	mov	x28, #0x46cf            ; =18127
 46bef7c: f2acefbc     	movk	x28, #0x677d, lsl #16
 46bef80: f2d7d47c     	movk	x28, #0xbea3, lsl #32
 46bef84: f2ea367c     	movk	x28, #0x51b3, lsl #48
 46bef88: d0042b16     	adrp	x22, 0xcc20000 <dyld_stub_binder+0xcc20000>
 46bef8c: 910112d6     	add	x22, x22, #0x44
 46bef90: 1400007b     	b	0x46bf17c <_ChromeMain+0x46b9ee0>
 46bef94: f00499c1     	adrp	x1, 0xd9f9000 <dyld_stub_binder+0xd9f9000>
 46bef98: 910cc821     	add	x1, x1, #0x332
 46bef9c: 910a43e0     	add	x0, sp, #0x290
 46befa0: 528000c2     	mov	w2, #0x6                ; =6
 46befa4: 9749b6b7     	bl	0x192ca80 <_ChromeMain+0x19277e4>
 46befa8: b4fff760     	cbz	x0, 0x46bee94 <_ChromeMain+0x46b9bf8>
 46befac: a9402016     	ldp	x22, x8, [x0]
 46befb0: 8b0816c9     	add	x9, x22, x8, lsl #5
 46befb4: eb0902df     	cmp	x22, x9
 46befb8: 54006ba8     	b.hi	0x46bfd2c <_ChromeMain+0x46baa90>
 46befbc: d37be908     	lsl	x8, x8, #5
 46befc0: b4fff6a8     	cbz	x8, 0x46bee94 <_ChromeMain+0x46b9bf8>
 46befc4: 910183f8     	add	x24, sp, #0x60
 46befc8: 9100630a     	add	x10, x24, #0x18
 46befcc: 9100c30b     	add	x11, x24, #0x30
 46befd0: 91012308     	add	x8, x24, #0x48
 46befd4: a9022fe8     	stp	x8, x11, [sp, #0x20]
 46befd8: 91018308     	add	x8, x24, #0x60
 46befdc: a904abe8     	stp	x8, x10, [sp, #0x48]
 46befe0: 9101e308     	add	x8, x24, #0x78
 46befe4: f90023e8     	str	x8, [sp, #0x40]
 46befe8: 91024308     	add	x8, x24, #0x90
 46befec: f9002fe8     	str	x8, [sp, #0x58]
 46beff0: 910f03f3     	add	x19, sp, #0x3c0
 46beff4: 910d23f5     	add	x21, sp, #0x348
 46beff8: 910443e8     	add	x8, sp, #0x110
 46beffc: 9100210a     	add	x10, x8, #0x8
 46bf000: f9000fea     	str	x10, [sp, #0x18]
 46bf004: 9104a10a     	add	x10, x8, #0x128
 46bf008: 91056108     	add	x8, x8, #0x158
 46bf00c: a9002be8     	stp	x8, x10, [sp]
 46bf010: 1280001b     	mov	w27, #-0x1              ; =-1
 46bf014: f9001be9     	str	x9, [sp, #0x30]
 46bf018: 140001b3     	b	0x46bf6e4 <_ChromeMain+0x46ba448>
 46bf01c: a9400801     	ldp	x1, x2, [x0]
 46bf020: 910022e0     	add	x0, x23, #0x8
 46bf024: 96f7a6a4     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bf028: 14000030     	b	0x46bf0e8 <_ChromeMain+0x46b9e4c>
 46bf02c: aa1303e1     	mov	x1, x19
 46bf030: 910f03e0     	add	x0, sp, #0x3c0
 46bf034: 96f2c468     	bl	0x3701d4 <_ChromeMain+0x36af38>
 46bf038: 910183e8     	add	x8, sp, #0x60
 46bf03c: 910f03e0     	add	x0, sp, #0x3c0
 46bf040: 911103e1     	add	x1, sp, #0x440
 46bf044: 97298d56     	bl	0x112259c <_ChromeMain+0x111d300>
 46bf048: 910082e0     	add	x0, x23, #0x20
 46bf04c: 910183e1     	add	x1, sp, #0x60
 46bf050: 96fceaa4     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 46bf054: 9101c320     	add	x0, x25, #0x70
 46bf058: d2800001     	mov	x1, #0x0                ; =0
 46bf05c: 96e5a317     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf060: 91008320     	add	x0, x25, #0x20
 46bf064: 96e5a305     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf068: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 46bf06c: 36f800a8     	tbz	w8, #0x1f, 0x46bf080 <_ChromeMain+0x46b9de4>
 46bf070: f94033e0     	ldr	x0, [sp, #0x60]
 46bf074: f9403be8     	ldr	x8, [sp, #0x70]
 46bf078: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf07c: 96e5278f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf080: 9101c340     	add	x0, x26, #0x70
 46bf084: d2800001     	mov	x1, #0x0                ; =0
 46bf088: 96e5a30c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf08c: 91008340     	add	x0, x26, #0x20
 46bf090: 96e5a2fa     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf094: 39cf5fe8     	ldrsb	w8, [sp, #0x3d7]
 46bf098: 36f800a8     	tbz	w8, #0x1f, 0x46bf0ac <_ChromeMain+0x46b9e10>
 46bf09c: f941e3e0     	ldr	x0, [sp, #0x3c0]
 46bf0a0: f941ebe8     	ldr	x8, [sp, #0x3d0]
 46bf0a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf0a8: 96e52784     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf0ac: 910183e8     	add	x8, sp, #0x60
 46bf0b0: 910082e0     	add	x0, x23, #0x20
 46bf0b4: 971177fc     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 46bf0b8: 910183e0     	add	x0, sp, #0x60
 46bf0bc: 96feb673     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46bf0c0: eb00031f     	cmp	x24, x0
 46bf0c4: 54000120     	b.eq	0x46bf0e8 <_ChromeMain+0x46b9e4c>
 46bf0c8: 39c4bfe9     	ldrsb	w9, [sp, #0x12f]
 46bf0cc: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf0d0: 37f86069     	tbnz	w9, #0x1f, 0x46bfcdc <_ChromeMain+0x46baa40>
 46bf0d4: 373ffa48     	tbnz	w8, #0x7, 0x46bf01c <_ChromeMain+0x46b9d80>
 46bf0d8: 3dc00000     	ldr	q0, [x0]
 46bf0dc: f9400808     	ldr	x8, [x0, #0x10]
 46bf0e0: f9000b08     	str	x8, [x24, #0x10]
 46bf0e4: 3d800300     	str	q0, [x24]
 46bf0e8: 9101c320     	add	x0, x25, #0x70
 46bf0ec: d2800001     	mov	x1, #0x0                ; =0
 46bf0f0: 96e5a2f2     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf0f4: 91008320     	add	x0, x25, #0x20
 46bf0f8: 96e5a2e0     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf0fc: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 46bf100: 36f800a8     	tbz	w8, #0x1f, 0x46bf114 <_ChromeMain+0x46b9e78>
 46bf104: f94033e0     	ldr	x0, [sp, #0x60]
 46bf108: f9403be8     	ldr	x8, [sp, #0x70]
 46bf10c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf110: 96e5276a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf114: 52800028     	mov	w8, #0x1                ; =1
 46bf118: 390a03e8     	strb	w8, [sp, #0x280]
 46bf11c: 911103e8     	add	x8, sp, #0x440
 46bf120: 91020100     	add	x0, x8, #0x80
 46bf124: 96e5a2d5     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf128: a940a688     	ldp	x8, x9, [x20, #0x8]
 46bf12c: eb09011f     	cmp	x8, x9
 46bf130: 54005ee0     	b.eq	0x46bfd0c <_ChromeMain+0x46baa70>
 46bf134: f9400289     	ldr	x9, [x20]
 46bf138: 52802f0a     	mov	w10, #0x178             ; =376
 46bf13c: 9b0a2500     	madd	x0, x8, x10, x9
 46bf140: b4000860     	cbz	x0, 0x46bf24c <_ChromeMain+0x46b9fb0>
 46bf144: 910443e1     	add	x1, sp, #0x110
 46bf148: 97e766d1     	bl	0x4098c8c <_ChromeMain+0x40939f0>
 46bf14c: 9105e000     	add	x0, x0, #0x178
 46bf150: f9400288     	ldr	x8, [x20]
 46bf154: eb080008     	subs	x8, x0, x8
 46bf158: 9343fd08     	asr	x8, x8, #3
 46bf15c: 9b1c7d08     	mul	x8, x8, x28
 46bf160: f9000688     	str	x8, [x20, #0x8]
 46bf164: 54000740     	b.eq	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bf168: 910443e0     	add	x0, sp, #0x110
 46bf16c: 94accf44     	bl	0x71f2e7c <_ChromeMain+0x71edbe0>
 46bf170: 91008273     	add	x19, x19, #0x20
 46bf174: f10082b5     	subs	x21, x21, #0x20
 46bf178: 54fff0e0     	b.eq	0x46bef94 <_ChromeMain+0x46b9cf8>
 46bf17c: 39406268     	ldrb	w8, [x19, #0x18]
 46bf180: 7100111f     	cmp	w8, #0x4
 46bf184: 54ffff61     	b.ne	0x46bf170 <_ChromeMain+0x46b9ed4>
 46bf188: 39406268     	ldrb	w8, [x19, #0x18]
 46bf18c: 7100111f     	cmp	w8, #0x4
 46bf190: 54005d41     	b.ne	0x46bfd38 <_ChromeMain+0x46baa9c>
 46bf194: 6f00e400     	movi.2d	v0, #0000000000000000
 46bf198: 3d8133e0     	str	q0, [sp, #0x4c0]
 46bf19c: 3d8137e0     	str	q0, [sp, #0x4d0]
 46bf1a0: 3d813be0     	str	q0, [sp, #0x4e0]
 46bf1a4: 3d812be0     	str	q0, [sp, #0x4a0]
 46bf1a8: 3d812fe0     	str	q0, [sp, #0x4b0]
 46bf1ac: f90283ff     	str	xzr, [sp, #0x500]
 46bf1b0: f90287ff     	str	xzr, [sp, #0x508]
 46bf1b4: 3d8127e0     	str	q0, [sp, #0x490]
 46bf1b8: 3d8123e0     	str	q0, [sp, #0x480]
 46bf1bc: 3d811fe0     	str	q0, [sp, #0x470]
 46bf1c0: 3d811be0     	str	q0, [sp, #0x460]
 46bf1c4: 3d8117e0     	str	q0, [sp, #0x450]
 46bf1c8: 3d8113e0     	str	q0, [sp, #0x440]
 46bf1cc: b904c7fb     	str	w27, [sp, #0x4c4]
 46bf1d0: fd026fe8     	str	d8, [sp, #0x4d8]
 46bf1d4: b904e7fb     	str	w27, [sp, #0x4e4]
 46bf1d8: b904effb     	str	w27, [sp, #0x4ec]
 46bf1dc: 391403ff     	strb	wzr, [sp, #0x500]
 46bf1e0: f90253f6     	str	x22, [sp, #0x4a0]
 46bf1e4: f9025bf6     	str	x22, [sp, #0x4b0]
 46bf1e8: 6f07e601     	movi.2d	v1, #0xffffffff00000000
 46bf1ec: 3d813fe1     	str	q1, [sp, #0x4f0]
 46bf1f0: f9022bf6     	str	x22, [sp, #0x450]
 46bf1f4: f90233f6     	str	x22, [sp, #0x460]
 46bf1f8: 911103e8     	add	x8, sp, #0x440
 46bf1fc: 3c888101     	stur	q1, [x8, #0x88]
 46bf200: f90143ff     	str	xzr, [sp, #0x280]
 46bf204: ad1303e0     	stp	q0, q0, [sp, #0x260]
 46bf208: ad1203e0     	stp	q0, q0, [sp, #0x240]
 46bf20c: ad1103e0     	stp	q0, q0, [sp, #0x220]
 46bf210: ad1003e0     	stp	q0, q0, [sp, #0x200]
 46bf214: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 46bf218: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 46bf21c: ad0d03e0     	stp	q0, q0, [sp, #0x1a0]
 46bf220: ad0c03e0     	stp	q0, q0, [sp, #0x180]
 46bf224: ad0b03e0     	stp	q0, q0, [sp, #0x160]
 46bf228: ad0a03e0     	stp	q0, q0, [sp, #0x140]
 46bf22c: ad0903e0     	stp	q0, q0, [sp, #0x120]
 46bf230: 3d8047e0     	str	q0, [sp, #0x110]
 46bf234: 910443e0     	add	x0, sp, #0x110
 46bf238: 94accefd     	bl	0x71f2e2c <_ChromeMain+0x71edb90>
 46bf23c: 39805e62     	ldrsb	x2, [x19, #0x17]
 46bf240: b6ffef62     	tbz	x2, #0x3f, 0x46bf02c <_ChromeMain+0x46b9d90>
 46bf244: a9400a61     	ldp	x1, x2, [x19]
 46bf248: 17ffff7a     	b	0x46bf030 <_ChromeMain+0x46b9d94>
 46bf24c: d4200020     	brk	#0x1
 46bf250: 13001d09     	sxtb	w9, w8
 46bf254: 7100013f     	cmp	w9, #0x0
 46bf258: a9492be9     	ldp	x9, x10, [sp, #0x90]
 46bf25c: f94017eb     	ldr	x11, [sp, #0x28]
 46bf260: 9a8b4121     	csel	x1, x9, x11, mi
 46bf264: 9a884142     	csel	x2, x10, x8, mi
 46bf268: 91044320     	add	x0, x25, #0x110
 46bf26c: 97083d72     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 46bf270: 14000082     	b	0x46bf478 <_ChromeMain+0x46ba1dc>
 46bf274: 13001d09     	sxtb	w9, w8
 46bf278: 7100013f     	cmp	w9, #0x0
 46bf27c: a94aabe9     	ldp	x9, x10, [sp, #0xa8]
 46bf280: f94013eb     	ldr	x11, [sp, #0x20]
 46bf284: 9a8b4121     	csel	x1, x9, x11, mi
 46bf288: 9a884142     	csel	x2, x10, x8, mi
 46bf28c: 91050320     	add	x0, x25, #0x140
 46bf290: 97083d69     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 46bf294: 1400008e     	b	0x46bf4cc <_ChromeMain+0x46ba230>
 46bf298: f9411fe0     	ldr	x0, [sp, #0x238]
 46bf29c: f94127e8     	ldr	x8, [sp, #0x248]
 46bf2a0: d37ff901     	lsl	x1, x8, #1
 46bf2a4: 96e52705     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf2a8: 1400007a     	b	0x46bf490 <_ChromeMain+0x46ba1f4>
 46bf2ac: f94137e0     	ldr	x0, [sp, #0x268]
 46bf2b0: f9413fe8     	ldr	x8, [sp, #0x278]
 46bf2b4: d37ff901     	lsl	x1, x8, #1
 46bf2b8: 96e52700     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf2bc: 1400008a     	b	0x46bf4e4 <_ChromeMain+0x46ba248>
 46bf2c0: a94a8be1     	ldp	x1, x2, [sp, #0xa8]
 46bf2c4: 91050320     	add	x0, x25, #0x140
 46bf2c8: 97083d09     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 46bf2cc: 14000080     	b	0x46bf4cc <_ChromeMain+0x46ba230>
 46bf2d0: a9490be1     	ldp	x1, x2, [sp, #0x90]
 46bf2d4: 91044320     	add	x0, x25, #0x110
 46bf2d8: 97083d05     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 46bf2dc: 14000067     	b	0x46bf478 <_ChromeMain+0x46ba1dc>
 46bf2e0: a9400801     	ldp	x1, x2, [x0]
 46bf2e4: 91002320     	add	x0, x25, #0x8
 46bf2e8: 96f7a5f3     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bf2ec: 14000041     	b	0x46bf3f0 <_ChromeMain+0x46ba154>
 46bf2f0: cb180008     	sub	x8, x0, x24
 46bf2f4: b100051f     	cmn	x8, #0x1
 46bf2f8: fa5a1004     	ccmp	x0, x26, #0x4, ne
 46bf2fc: 54003b00     	b.eq	0x46bfa5c <_ChromeMain+0x46ba7c0>
 46bf300: 13001f28     	sxtb	w8, w25
 46bf304: 7100011f     	cmp	w8, #0x0
 46bf308: 910183f8     	add	x24, sp, #0x60
 46bf30c: 9a984381     	csel	x1, x28, x24, mi
 46bf310: 9a994262     	csel	x2, x19, x25, mi
 46bf314: 910d23e0     	add	x0, sp, #0x348
 46bf318: 96f2c3af     	bl	0x3701d4 <_ChromeMain+0x36af38>
 46bf31c: 910f03e0     	add	x0, sp, #0x3c0
 46bf320: 910d23e1     	add	x1, sp, #0x348
 46bf324: 96fce9ef     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 46bf328: 9101c2a0     	add	x0, x21, #0x70
 46bf32c: d2800001     	mov	x1, #0x0                ; =0
 46bf330: 96e5a262     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf334: 910082a0     	add	x0, x21, #0x20
 46bf338: 96e5a250     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf33c: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 46bf340: 36f800a8     	tbz	w8, #0x1f, 0x46bf354 <_ChromeMain+0x46ba0b8>
 46bf344: f941a7e0     	ldr	x0, [sp, #0x348]
 46bf348: f941afe8     	ldr	x8, [sp, #0x358]
 46bf34c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf350: 96e526da     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf354: 910f03f3     	add	x19, sp, #0x3c0
 46bf358: 910443f9     	add	x25, sp, #0x110
 46bf35c: 394f63f7     	ldrb	w23, [sp, #0x3d8]
 46bf360: 340011d7     	cbz	w23, 0x46bf598 <_ChromeMain+0x46ba2fc>
 46bf364: 910d23e8     	add	x8, sp, #0x348
 46bf368: 910f03e0     	add	x0, sp, #0x3c0
 46bf36c: 911103e1     	add	x1, sp, #0x440
 46bf370: 97298c8b     	bl	0x112259c <_ChromeMain+0x111d300>
 46bf374: 91008320     	add	x0, x25, #0x20
 46bf378: 910d23e1     	add	x1, sp, #0x348
 46bf37c: 96fce9d9     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 46bf380: 9101c2a0     	add	x0, x21, #0x70
 46bf384: d2800001     	mov	x1, #0x0                ; =0
 46bf388: 96e5a24c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf38c: 910082a0     	add	x0, x21, #0x20
 46bf390: 96e5a23a     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf394: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 46bf398: 36f800a8     	tbz	w8, #0x1f, 0x46bf3ac <_ChromeMain+0x46ba110>
 46bf39c: f941a7e0     	ldr	x0, [sp, #0x348]
 46bf3a0: f941afe8     	ldr	x8, [sp, #0x358]
 46bf3a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf3a8: 96e526c4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf3ac: 910d23e8     	add	x8, sp, #0x348
 46bf3b0: 91008320     	add	x0, x25, #0x20
 46bf3b4: 9711773c     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 46bf3b8: 910d23e0     	add	x0, sp, #0x348
 46bf3bc: 96feb5b3     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 46bf3c0: f9400fe8     	ldr	x8, [sp, #0x18]
 46bf3c4: eb00011f     	cmp	x8, x0
 46bf3c8: 54000140     	b.eq	0x46bf3f0 <_ChromeMain+0x46ba154>
 46bf3cc: 39c4bfe9     	ldrsb	w9, [sp, #0x12f]
 46bf3d0: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf3d4: 37f84749     	tbnz	w9, #0x1f, 0x46bfcbc <_ChromeMain+0x46baa20>
 46bf3d8: 373ff848     	tbnz	w8, #0x7, 0x46bf2e0 <_ChromeMain+0x46ba044>
 46bf3dc: 3dc00000     	ldr	q0, [x0]
 46bf3e0: f9400808     	ldr	x8, [x0, #0x10]
 46bf3e4: f9400fe9     	ldr	x9, [sp, #0x18]
 46bf3e8: f9000928     	str	x8, [x9, #0x10]
 46bf3ec: 3d800120     	str	q0, [x9]
 46bf3f0: 9101c2a0     	add	x0, x21, #0x70
 46bf3f4: d2800001     	mov	x1, #0x0                ; =0
 46bf3f8: 96e5a230     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf3fc: 910082a0     	add	x0, x21, #0x20
 46bf400: 96e5a21e     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf404: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 46bf408: 36f800a8     	tbz	w8, #0x1f, 0x46bf41c <_ChromeMain+0x46ba180>
 46bf40c: f941a7e0     	ldr	x0, [sp, #0x348]
 46bf410: f941afe8     	ldr	x8, [sp, #0x358]
 46bf414: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf418: 96e526a8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf41c: 39423fe9     	ldrb	w9, [sp, #0x8f]
 46bf420: 13001d28     	sxtb	w8, w9
 46bf424: f94043ea     	ldr	x10, [sp, #0x80]
 46bf428: 7100011f     	cmp	w8, #0x0
 46bf42c: 9a894142     	csel	x2, x10, x9, mi
 46bf430: b4000122     	cbz	x2, 0x46bf454 <_ChromeMain+0x46ba1b8>
 46bf434: f9403fe9     	ldr	x9, [sp, #0x78]
 46bf438: 7100011f     	cmp	w8, #0x0
 46bf43c: f9402be8     	ldr	x8, [sp, #0x50]
 46bf440: 9a884121     	csel	x1, x9, x8, mi
 46bf444: 91002320     	add	x0, x25, #0x8
 46bf448: 96e76bf6     	bl	0x9a420 <_ChromeMain+0x95184>
 46bf44c: 52800028     	mov	w8, #0x1                ; =1
 46bf450: b90113e8     	str	w8, [sp, #0x110]
 46bf454: 39c8dfe9     	ldrsb	w9, [sp, #0x237]
 46bf458: 39429fe8     	ldrb	w8, [sp, #0xa7]
 46bf45c: 37ffefa9     	tbnz	w9, #0x1f, 0x46bf250 <_ChromeMain+0x46b9fb4>
 46bf460: 373ff388     	tbnz	w8, #0x7, 0x46bf2d0 <_ChromeMain+0x46ba034>
 46bf464: f94017e8     	ldr	x8, [sp, #0x28]
 46bf468: 3dc00100     	ldr	q0, [x8]
 46bf46c: 3d804720     	str	q0, [x25, #0x110]
 46bf470: f9400908     	ldr	x8, [x8, #0x10]
 46bf474: f9009328     	str	x8, [x25, #0x120]
 46bf478: 910d23e8     	add	x8, sp, #0x348
 46bf47c: 91018301     	add	x1, x24, #0x60
 46bf480: f9401fe0     	ldr	x0, [sp, #0x38]
 46bf484: 97fffdaa     	bl	0x46beb2c <_ChromeMain+0x46b9890>
 46bf488: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 46bf48c: 37fff068     	tbnz	w8, #0x1f, 0x46bf298 <_ChromeMain+0x46b9ffc>
 46bf490: 910d23e8     	add	x8, sp, #0x348
 46bf494: 3dc00100     	ldr	q0, [x8]
 46bf498: f94007e9     	ldr	x9, [sp, #0x8]
 46bf49c: 3d800120     	str	q0, [x9]
 46bf4a0: f941afe8     	ldr	x8, [sp, #0x358]
 46bf4a4: f9000928     	str	x8, [x9, #0x10]
 46bf4a8: 39c99fe9     	ldrsb	w9, [sp, #0x267]
 46bf4ac: 3942ffe8     	ldrb	w8, [sp, #0xbf]
 46bf4b0: 37ffee29     	tbnz	w9, #0x1f, 0x46bf274 <_ChromeMain+0x46b9fd8>
 46bf4b4: 373ff068     	tbnz	w8, #0x7, 0x46bf2c0 <_ChromeMain+0x46ba024>
 46bf4b8: f94013e8     	ldr	x8, [sp, #0x20]
 46bf4bc: 3dc00100     	ldr	q0, [x8]
 46bf4c0: 3d805320     	str	q0, [x25, #0x140]
 46bf4c4: f9400908     	ldr	x8, [x8, #0x10]
 46bf4c8: f900ab28     	str	x8, [x25, #0x150]
 46bf4cc: 910d23e8     	add	x8, sp, #0x348
 46bf4d0: 9101e301     	add	x1, x24, #0x78
 46bf4d4: f9401fe0     	ldr	x0, [sp, #0x38]
 46bf4d8: 97fffd95     	bl	0x46beb2c <_ChromeMain+0x46b9890>
 46bf4dc: 39c9ffe8     	ldrsb	w8, [sp, #0x27f]
 46bf4e0: 37ffee68     	tbnz	w8, #0x1f, 0x46bf2ac <_ChromeMain+0x46ba010>
 46bf4e4: 910d23e8     	add	x8, sp, #0x348
 46bf4e8: 3dc00100     	ldr	q0, [x8]
 46bf4ec: f94003e9     	ldr	x9, [sp]
 46bf4f0: 3d800120     	str	q0, [x9]
 46bf4f4: f941afe8     	ldr	x8, [sp, #0x358]
 46bf4f8: f9000928     	str	x8, [x9, #0x10]
 46bf4fc: 39441fe8     	ldrb	w8, [sp, #0x107]
 46bf500: 13001d09     	sxtb	w9, w8
 46bf504: a94f2fea     	ldp	x10, x11, [sp, #0xf0]
 46bf508: 7100013f     	cmp	w9, #0x0
 46bf50c: f9402fe9     	ldr	x9, [sp, #0x58]
 46bf510: 9a894141     	csel	x1, x10, x9, mi
 46bf514: 9a884162     	csel	x2, x11, x8, mi
 46bf518: 910b43e0     	add	x0, sp, #0x2d0
 46bf51c: 96f2c32e     	bl	0x3701d4 <_ChromeMain+0x36af38>
 46bf520: 910d23e8     	add	x8, sp, #0x348
 46bf524: 910b43e0     	add	x0, sp, #0x2d0
 46bf528: 911103e1     	add	x1, sp, #0x440
 46bf52c: 97298c1c     	bl	0x112259c <_ChromeMain+0x111d300>
 46bf530: 91026320     	add	x0, x25, #0x98
 46bf534: 910d23e1     	add	x1, sp, #0x348
 46bf538: 96fce96a     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 46bf53c: 9101c2a0     	add	x0, x21, #0x70
 46bf540: d2800001     	mov	x1, #0x0                ; =0
 46bf544: 96e5a1dd     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf548: 910082a0     	add	x0, x21, #0x20
 46bf54c: 96e5a1cb     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf550: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 46bf554: 36f800a8     	tbz	w8, #0x1f, 0x46bf568 <_ChromeMain+0x46ba2cc>
 46bf558: f941a7e0     	ldr	x0, [sp, #0x348]
 46bf55c: f941afe8     	ldr	x8, [sp, #0x358]
 46bf560: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf564: 96e52655     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf568: 910b43f9     	add	x25, sp, #0x2d0
 46bf56c: 9101c320     	add	x0, x25, #0x70
 46bf570: d2800001     	mov	x1, #0x0                ; =0
 46bf574: 96e5a1d1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf578: 91008320     	add	x0, x25, #0x20
 46bf57c: 96e5a1bf     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf580: 39cb9fe8     	ldrsb	w8, [sp, #0x2e7]
 46bf584: 36f800a8     	tbz	w8, #0x1f, 0x46bf598 <_ChromeMain+0x46ba2fc>
 46bf588: f9416be0     	ldr	x0, [sp, #0x2d0]
 46bf58c: f94173e8     	ldr	x8, [sp, #0x2e0]
 46bf590: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf594: 96e52649     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf598: 9101c260     	add	x0, x19, #0x70
 46bf59c: d2800001     	mov	x1, #0x0                ; =0
 46bf5a0: 96e5a1c6     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bf5a4: 91008260     	add	x0, x19, #0x20
 46bf5a8: 96e5a1b4     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf5ac: 39cf5fe8     	ldrsb	w8, [sp, #0x3d7]
 46bf5b0: 36f800a8     	tbz	w8, #0x1f, 0x46bf5c4 <_ChromeMain+0x46ba328>
 46bf5b4: f941e3e0     	ldr	x0, [sp, #0x3c0]
 46bf5b8: f941ebe8     	ldr	x8, [sp, #0x3d0]
 46bf5bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf5c0: 96e5263e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf5c4: 911103e8     	add	x8, sp, #0x440
 46bf5c8: 91020100     	add	x0, x8, #0x80
 46bf5cc: 96e5a1ab     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bf5d0: 340002b7     	cbz	w23, 0x46bf624 <_ChromeMain+0x46ba388>
 46bf5d4: a940a688     	ldp	x8, x9, [x20, #0x8]
 46bf5d8: eb09011f     	cmp	x8, x9
 46bf5dc: 54003900     	b.eq	0x46bfcfc <_ChromeMain+0x46baa60>
 46bf5e0: f9400289     	ldr	x9, [x20]
 46bf5e4: 52802f0a     	mov	w10, #0x178             ; =376
 46bf5e8: 9b0a2500     	madd	x0, x8, x10, x9
 46bf5ec: b4ffe300     	cbz	x0, 0x46bf24c <_ChromeMain+0x46b9fb0>
 46bf5f0: 910443e1     	add	x1, sp, #0x110
 46bf5f4: 97e7655e     	bl	0x4098b6c <_ChromeMain+0x40938d0>
 46bf5f8: 9105e000     	add	x0, x0, #0x178
 46bf5fc: f9400288     	ldr	x8, [x20]
 46bf600: eb080008     	subs	x8, x0, x8
 46bf604: 9343fd08     	asr	x8, x8, #3
 46bf608: d288d9e9     	mov	x9, #0x46cf             ; =18127
 46bf60c: f2acefa9     	movk	x9, #0x677d, lsl #16
 46bf610: f2d7d469     	movk	x9, #0xbea3, lsl #32
 46bf614: f2ea3669     	movk	x9, #0x51b3, lsl #48
 46bf618: 9b097d08     	mul	x8, x8, x9
 46bf61c: f9000688     	str	x8, [x20, #0x8]
 46bf620: 54ffe160     	b.eq	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bf624: 910443e0     	add	x0, sp, #0x110
 46bf628: 94acce15     	bl	0x71f2e7c <_ChromeMain+0x71edbe0>
 46bf62c: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 46bf630: 36f800a8     	tbz	w8, #0x1f, 0x46bf644 <_ChromeMain+0x46ba3a8>
 46bf634: f9407be0     	ldr	x0, [sp, #0xf0]
 46bf638: f94083e8     	ldr	x8, [sp, #0x100]
 46bf63c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf640: 96e5261e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf644: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 46bf648: 36f800a8     	tbz	w8, #0x1f, 0x46bf65c <_ChromeMain+0x46ba3c0>
 46bf64c: f9406fe0     	ldr	x0, [sp, #0xd8]
 46bf650: f94077e8     	ldr	x8, [sp, #0xe8]
 46bf654: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf658: 96e52618     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf65c: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 46bf660: 36f800a8     	tbz	w8, #0x1f, 0x46bf674 <_ChromeMain+0x46ba3d8>
 46bf664: f94063e0     	ldr	x0, [sp, #0xc0]
 46bf668: f9406be8     	ldr	x8, [sp, #0xd0]
 46bf66c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf670: 96e52612     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf674: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 46bf678: 36f800a8     	tbz	w8, #0x1f, 0x46bf68c <_ChromeMain+0x46ba3f0>
 46bf67c: f94057e0     	ldr	x0, [sp, #0xa8]
 46bf680: f9405fe8     	ldr	x8, [sp, #0xb8]
 46bf684: d37ff901     	lsl	x1, x8, #1
 46bf688: 96e5260c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf68c: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 46bf690: 36f800a8     	tbz	w8, #0x1f, 0x46bf6a4 <_ChromeMain+0x46ba408>
 46bf694: f9404be0     	ldr	x0, [sp, #0x90]
 46bf698: f94053e8     	ldr	x8, [sp, #0xa0]
 46bf69c: d37ff901     	lsl	x1, x8, #1
 46bf6a0: 96e52606     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf6a4: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 46bf6a8: 36f800a8     	tbz	w8, #0x1f, 0x46bf6bc <_ChromeMain+0x46ba420>
 46bf6ac: f9403fe0     	ldr	x0, [sp, #0x78]
 46bf6b0: f94047e8     	ldr	x8, [sp, #0x88]
 46bf6b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf6b8: 96e52600     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf6bc: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 46bf6c0: 36f800a8     	tbz	w8, #0x1f, 0x46bf6d4 <_ChromeMain+0x46ba438>
 46bf6c4: f94033e0     	ldr	x0, [sp, #0x60]
 46bf6c8: f9403be8     	ldr	x8, [sp, #0x70]
 46bf6cc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bf6d0: 96e525fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf6d4: f9401be9     	ldr	x9, [sp, #0x30]
 46bf6d8: 910082d6     	add	x22, x22, #0x20
 46bf6dc: eb0902df     	cmp	x22, x9
 46bf6e0: 54ffbda0     	b.eq	0x46bee94 <_ChromeMain+0x46b9bf8>
 46bf6e4: b4ffffb6     	cbz	x22, 0x46bf6d8 <_ChromeMain+0x46ba43c>
 46bf6e8: 394062c8     	ldrb	w8, [x22, #0x18]
 46bf6ec: 7100191f     	cmp	w8, #0x6
 46bf6f0: 54ffff41     	b.ne	0x46bf6d8 <_ChromeMain+0x46ba43c>
 46bf6f4: f90083ff     	str	xzr, [sp, #0x100]
 46bf6f8: 6f00e400     	movi.2d	v0, #0000000000000000
 46bf6fc: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 46bf700: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 46bf704: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 46bf708: ad0403e0     	stp	q0, q0, [sp, #0x80]
 46bf70c: ad0303e0     	stp	q0, q0, [sp, #0x60]
 46bf710: aa1603e0     	mov	x0, x22
 46bf714: f0048a61     	adrp	x1, 0xd80e000 <dyld_stub_binder+0xd80e000>
 46bf718: 9131d021     	add	x1, x1, #0xc74
 46bf71c: 52800102     	mov	w2, #0x8                ; =8
 46bf720: 9765a8d8     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf724: eb00031f     	cmp	x24, x0
 46bf728: fa401804     	ccmp	x0, #0x0, #0x4, ne
 46bf72c: 54000120     	b.eq	0x46bf750 <_ChromeMain+0x46ba4b4>
 46bf730: 39c1dfe9     	ldrsb	w9, [sp, #0x77]
 46bf734: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf738: 37f82729     	tbnz	w9, #0x1f, 0x46bfc1c <_ChromeMain+0x46ba980>
 46bf73c: 37382688     	tbnz	w8, #0x7, 0x46bfc0c <_ChromeMain+0x46ba970>
 46bf740: 3dc00000     	ldr	q0, [x0]
 46bf744: f9400808     	ldr	x8, [x0, #0x10]
 46bf748: f9003be8     	str	x8, [sp, #0x70]
 46bf74c: 3d801be0     	str	q0, [sp, #0x60]
 46bf750: aa1603e0     	mov	x0, x22
 46bf754: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf758: 910bb021     	add	x1, x1, #0x2ec
 46bf75c: 528001a2     	mov	w2, #0xd                ; =13
 46bf760: 9765a8c8     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf764: b4000220     	cbz	x0, 0x46bf7a8 <_ChromeMain+0x46ba50c>
 46bf768: 39805c01     	ldrsb	x1, [x0, #0x17]
 46bf76c: b6f80041     	tbz	x1, #0x3f, 0x46bf774 <_ChromeMain+0x46ba4d8>
 46bf770: a9400400     	ldp	x0, x1, [x0]
 46bf774: 910443e8     	add	x8, sp, #0x110
 46bf778: 97088ae6     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46bf77c: 39c29fe8     	ldrsb	w8, [sp, #0xa7]
 46bf780: 36f800a8     	tbz	w8, #0x1f, 0x46bf794 <_ChromeMain+0x46ba4f8>
 46bf784: f9404be0     	ldr	x0, [sp, #0x90]
 46bf788: f94053e8     	ldr	x8, [sp, #0xa0]
 46bf78c: d37ff901     	lsl	x1, x8, #1
 46bf790: 96e525ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf794: 3dc047e0     	ldr	q0, [sp, #0x110]
 46bf798: f94017e9     	ldr	x9, [sp, #0x28]
 46bf79c: 3d800120     	str	q0, [x9]
 46bf7a0: f94093e8     	ldr	x8, [sp, #0x120]
 46bf7a4: f9000928     	str	x8, [x9, #0x10]
 46bf7a8: aa1603e0     	mov	x0, x22
 46bf7ac: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf7b0: 910be821     	add	x1, x1, #0x2fa
 46bf7b4: 528001a2     	mov	w2, #0xd                ; =13
 46bf7b8: 9765a8b2     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf7bc: b4000220     	cbz	x0, 0x46bf800 <_ChromeMain+0x46ba564>
 46bf7c0: 39805c01     	ldrsb	x1, [x0, #0x17]
 46bf7c4: b6f80041     	tbz	x1, #0x3f, 0x46bf7cc <_ChromeMain+0x46ba530>
 46bf7c8: a9400400     	ldp	x0, x1, [x0]
 46bf7cc: 910443e8     	add	x8, sp, #0x110
 46bf7d0: 97088ad0     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 46bf7d4: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 46bf7d8: 36f800a8     	tbz	w8, #0x1f, 0x46bf7ec <_ChromeMain+0x46ba550>
 46bf7dc: f94057e0     	ldr	x0, [sp, #0xa8]
 46bf7e0: f9405fe8     	ldr	x8, [sp, #0xb8]
 46bf7e4: d37ff901     	lsl	x1, x8, #1
 46bf7e8: 96e525b4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bf7ec: 3dc047e0     	ldr	q0, [sp, #0x110]
 46bf7f0: f94013e9     	ldr	x9, [sp, #0x20]
 46bf7f4: 3d800120     	str	q0, [x9]
 46bf7f8: f94093e8     	ldr	x8, [sp, #0x120]
 46bf7fc: f9000928     	str	x8, [x9, #0x10]
 46bf800: aa1603e0     	mov	x0, x22
 46bf804: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf808: 910c2021     	add	x1, x1, #0x308
 46bf80c: 52800222     	mov	w2, #0x11               ; =17
 46bf810: 9765a89c     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf814: f94027e8     	ldr	x8, [sp, #0x48]
 46bf818: eb00011f     	cmp	x8, x0
 46bf81c: fa401804     	ccmp	x0, #0x0, #0x4, ne
 46bf820: 54000140     	b.eq	0x46bf848 <_ChromeMain+0x46ba5ac>
 46bf824: 39c35fe9     	ldrsb	w9, [sp, #0xd7]
 46bf828: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf82c: 37f82089     	tbnz	w9, #0x1f, 0x46bfc3c <_ChromeMain+0x46ba9a0>
 46bf830: 37381c08     	tbnz	w8, #0x7, 0x46bfbb0 <_ChromeMain+0x46ba914>
 46bf834: 3dc00000     	ldr	q0, [x0]
 46bf838: f9400808     	ldr	x8, [x0, #0x10]
 46bf83c: f94027e9     	ldr	x9, [sp, #0x48]
 46bf840: f9000928     	str	x8, [x9, #0x10]
 46bf844: 3d800120     	str	q0, [x9]
 46bf848: aa1603e0     	mov	x0, x22
 46bf84c: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf850: 910c6821     	add	x1, x1, #0x31a
 46bf854: 52800222     	mov	w2, #0x11               ; =17
 46bf858: 9765a88a     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf85c: f94023e8     	ldr	x8, [sp, #0x40]
 46bf860: eb00011f     	cmp	x8, x0
 46bf864: fa401804     	ccmp	x0, #0x0, #0x4, ne
 46bf868: 54000140     	b.eq	0x46bf890 <_ChromeMain+0x46ba5f4>
 46bf86c: 39c3bfe9     	ldrsb	w9, [sp, #0xef]
 46bf870: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf874: 37f81f49     	tbnz	w9, #0x1f, 0x46bfc5c <_ChromeMain+0x46ba9c0>
 46bf878: 37381a48     	tbnz	w8, #0x7, 0x46bfbc0 <_ChromeMain+0x46ba924>
 46bf87c: 3dc00000     	ldr	q0, [x0]
 46bf880: f9400808     	ldr	x8, [x0, #0x10]
 46bf884: f94023e9     	ldr	x9, [sp, #0x40]
 46bf888: f9000928     	str	x8, [x9, #0x10]
 46bf88c: 3d800120     	str	q0, [x9]
 46bf890: aa1603e0     	mov	x0, x22
 46bf894: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf898: 910cb021     	add	x1, x1, #0x32c
 46bf89c: 528001a2     	mov	w2, #0xd                ; =13
 46bf8a0: 9765a878     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf8a4: f9402fe8     	ldr	x8, [sp, #0x58]
 46bf8a8: eb00011f     	cmp	x8, x0
 46bf8ac: fa401804     	ccmp	x0, #0x0, #0x4, ne
 46bf8b0: 54000140     	b.eq	0x46bf8d8 <_ChromeMain+0x46ba63c>
 46bf8b4: 39c41fe9     	ldrsb	w9, [sp, #0x107]
 46bf8b8: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf8bc: 37f81e09     	tbnz	w9, #0x1f, 0x46bfc7c <_ChromeMain+0x46ba9e0>
 46bf8c0: 37381888     	tbnz	w8, #0x7, 0x46bfbd0 <_ChromeMain+0x46ba934>
 46bf8c4: 3dc00000     	ldr	q0, [x0]
 46bf8c8: f9400808     	ldr	x8, [x0, #0x10]
 46bf8cc: f9402fe9     	ldr	x9, [sp, #0x58]
 46bf8d0: f9000928     	str	x8, [x9, #0x10]
 46bf8d4: 3d800120     	str	q0, [x9]
 46bf8d8: aa1603e0     	mov	x0, x22
 46bf8dc: b004c181     	adrp	x1, 0xdef0000 <dyld_stub_binder+0xdef0000>
 46bf8e0: 910ce821     	add	x1, x1, #0x33a
 46bf8e4: 52800122     	mov	w2, #0x9                ; =9
 46bf8e8: 9765a866     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 46bf8ec: f9402be8     	ldr	x8, [sp, #0x50]
 46bf8f0: eb00011f     	cmp	x8, x0
 46bf8f4: fa401804     	ccmp	x0, #0x0, #0x4, ne
 46bf8f8: 54000140     	b.eq	0x46bf920 <_ChromeMain+0x46ba684>
 46bf8fc: 39c23fe9     	ldrsb	w9, [sp, #0x8f]
 46bf900: 39405c08     	ldrb	w8, [x0, #0x17]
 46bf904: 37f81cc9     	tbnz	w9, #0x1f, 0x46bfc9c <_ChromeMain+0x46baa00>
 46bf908: 373813a8     	tbnz	w8, #0x7, 0x46bfb7c <_ChromeMain+0x46ba8e0>
 46bf90c: 3dc00000     	ldr	q0, [x0]
 46bf910: f9400808     	ldr	x8, [x0, #0x10]
 46bf914: f9402be9     	ldr	x9, [sp, #0x50]
 46bf918: f9000928     	str	x8, [x9, #0x10]
 46bf91c: 3d800120     	str	q0, [x9]
 46bf920: 910183f7     	add	x23, sp, #0x60
 46bf924: f90143ff     	str	xzr, [sp, #0x280]
 46bf928: 6f00e400     	movi.2d	v0, #0000000000000000
 46bf92c: ad1303e0     	stp	q0, q0, [sp, #0x260]
 46bf930: ad1203e0     	stp	q0, q0, [sp, #0x240]
 46bf934: ad1103e0     	stp	q0, q0, [sp, #0x220]
 46bf938: ad1003e0     	stp	q0, q0, [sp, #0x200]
 46bf93c: ad0f03e0     	stp	q0, q0, [sp, #0x1e0]
 46bf940: ad0e03e0     	stp	q0, q0, [sp, #0x1c0]
 46bf944: ad0d03e0     	stp	q0, q0, [sp, #0x1a0]
 46bf948: ad0c03e0     	stp	q0, q0, [sp, #0x180]
 46bf94c: ad0b03e0     	stp	q0, q0, [sp, #0x160]
 46bf950: ad0a03e0     	stp	q0, q0, [sp, #0x140]
 46bf954: ad0903e0     	stp	q0, q0, [sp, #0x120]
 46bf958: 3d8047e0     	str	q0, [sp, #0x110]
 46bf95c: 910443e0     	add	x0, sp, #0x110
 46bf960: 94accd33     	bl	0x71f2e2c <_ChromeMain+0x71edb90>
 46bf964: 6f00e401     	movi.2d	v1, #0000000000000000
 46bf968: 3d8133e1     	str	q1, [sp, #0x4c0]
 46bf96c: 3d8137e1     	str	q1, [sp, #0x4d0]
 46bf970: 3d813be1     	str	q1, [sp, #0x4e0]
 46bf974: 3d812be1     	str	q1, [sp, #0x4a0]
 46bf978: 3d812fe1     	str	q1, [sp, #0x4b0]
 46bf97c: f90287ff     	str	xzr, [sp, #0x508]
 46bf980: f90283ff     	str	xzr, [sp, #0x500]
 46bf984: 3d8127e1     	str	q1, [sp, #0x490]
 46bf988: 3d8123e1     	str	q1, [sp, #0x480]
 46bf98c: 3d811fe1     	str	q1, [sp, #0x470]
 46bf990: 3d811be1     	str	q1, [sp, #0x460]
 46bf994: 3d8117e1     	str	q1, [sp, #0x450]
 46bf998: 3d8113e1     	str	q1, [sp, #0x440]
 46bf99c: b904c7fb     	str	w27, [sp, #0x4c4]
 46bf9a0: b904dffb     	str	w27, [sp, #0x4dc]
 46bf9a4: b904e7fb     	str	w27, [sp, #0x4e4]
 46bf9a8: b904effb     	str	w27, [sp, #0x4ec]
 46bf9ac: b0042b08     	adrp	x8, 0xcc20000 <dyld_stub_binder+0xcc20000>
 46bf9b0: 91011108     	add	x8, x8, #0x44
 46bf9b4: f90253e8     	str	x8, [sp, #0x4a0]
 46bf9b8: f9025be8     	str	x8, [sp, #0x4b0]
 46bf9bc: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 46bf9c0: 3d813fe0     	str	q0, [sp, #0x4f0]
 46bf9c4: f9022be8     	str	x8, [sp, #0x450]
 46bf9c8: f90233e8     	str	x8, [sp, #0x460]
 46bf9cc: 911103e8     	add	x8, sp, #0x440
 46bf9d0: 3c888100     	stur	q0, [x8, #0x88]
 46bf9d4: ad1f07e1     	stp	q1, q1, [sp, #0x3e0]
 46bf9d8: 3d8103e1     	str	q1, [sp, #0x400]
 46bf9dc: 3d8107e1     	str	q1, [sp, #0x410]
 46bf9e0: f90213ff     	str	xzr, [sp, #0x420]
 46bf9e4: ad1e07e1     	stp	q1, q1, [sp, #0x3c0]
 46bf9e8: b903e7fb     	str	w27, [sp, #0x3e4]
 46bf9ec: b903effb     	str	w27, [sp, #0x3ec]
 46bf9f0: b903f7fb     	str	w27, [sp, #0x3f4]
 46bf9f4: b903fffb     	str	w27, [sp, #0x3fc]
 46bf9f8: b90407fb     	str	w27, [sp, #0x404]
 46bf9fc: b9040ffb     	str	w27, [sp, #0x40c]
 46bfa00: b90417fb     	str	w27, [sp, #0x414]
 46bfa04: b9041ffb     	str	w27, [sp, #0x41c]
 46bfa08: a906fe7f     	stp	xzr, xzr, [x19, #0x68]
 46bfa0c: 39423fe8     	ldrb	w8, [sp, #0x8f]
 46bfa10: f94043e9     	ldr	x9, [sp, #0x80]
 46bfa14: 7219011f     	tst	w8, #0x80
 46bfa18: 9a881128     	csel	x8, x9, x8, ne
 46bfa1c: 3941dff9     	ldrb	w25, [sp, #0x77]
 46bfa20: a9464ffc     	ldp	x28, x19, [sp, #0x60]
 46bfa24: b4ffc6e8     	cbz	x8, 0x46bf300 <_ChromeMain+0x46ba064>
 46bfa28: 13001f28     	sxtb	w8, w25
 46bfa2c: 7100011f     	cmp	w8, #0x0
 46bfa30: 9a974398     	csel	x24, x28, x23, mi
 46bfa34: 9a994277     	csel	x23, x19, x25, mi
 46bfa38: f1000eff     	cmp	x23, #0x3
 46bfa3c: 5400010b     	b.lt	0x46bfa5c <_ChromeMain+0x46ba7c0>
 46bfa40: 8b17031a     	add	x26, x24, x23
 46bfa44: aa1703e8     	mov	x8, x23
 46bfa48: aa1803e0     	mov	x0, x24
 46bfa4c: d1000902     	sub	x2, x8, #0x2
 46bfa50: 52800741     	mov	w1, #0x3a               ; =58
 46bfa54: 94e58054     	bl	0x801fba4 <_ChromeMain+0x801a908>
 46bfa58: b5000c40     	cbnz	x0, 0x46bfbe0 <_ChromeMain+0x46ba944>
 46bfa5c: f9016fff     	str	xzr, [sp, #0x2d8]
 46bfa60: f9016bff     	str	xzr, [sp, #0x2d0]
 46bfa64: f90173ff     	str	xzr, [sp, #0x2e0]
 46bfa68: 91001ef3     	add	x19, x23, #0x7
 46bfa6c: 92800208     	mov	x8, #-0x11              ; =-17
 46bfa70: f2efffe8     	movk	x8, #0x7fff, lsl #48
 46bfa74: eb08027f     	cmp	x19, x8
 46bfa78: 54001522     	b.hs	0x46bfd1c <_ChromeMain+0x46baa80>
 46bfa7c: f1005a7f     	cmp	x19, #0x16
 46bfa80: 54000868     	b.hi	0x46bfb8c <_ChromeMain+0x46ba8f0>
 46bfa84: 390b9ff3     	strb	w19, [sp, #0x2e7]
 46bfa88: 910b43e0     	add	x0, sp, #0x2d0
 46bfa8c: 91001c19     	add	x25, x0, #0x7
 46bfa90: eb00033f     	cmp	x25, x0
 46bfa94: 54ffbdc3     	b.lo	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bfa98: d00495c8     	adrp	x8, 0xd979000 <dyld_stub_binder+0xd979000>
 46bfa9c: 91359908     	add	x8, x8, #0xd66
 46bfaa0: eb08033f     	cmp	x25, x8
 46bfaa4: fa488002     	ccmp	x0, x8, #0x2, hi
 46bfaa8: 54ffbd29     	b.ls	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bfaac: 52874e08     	mov	w8, #0x3a70             ; =14960
 46bfab0: 72a5e5e8     	movk	w8, #0x2f2f, lsl #16
 46bfab4: b8003008     	stur	w8, [x0, #0x3]
 46bfab8: 528e8d08     	mov	w8, #0x7468             ; =29800
 46bfabc: 72ae0e88     	movk	w8, #0x7074, lsl #16
 46bfac0: b9000008     	str	w8, [x0]
 46bfac4: 8b170328     	add	x8, x25, x23
 46bfac8: eb19011f     	cmp	x8, x25
 46bfacc: 54ffbc03     	b.lo	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bfad0: eb18033f     	cmp	x25, x24
 46bfad4: 54000068     	b.hi	0x46bfae0 <_ChromeMain+0x46ba844>
 46bfad8: eb18011f     	cmp	x8, x24
 46bfadc: 54ffbb88     	b.hi	0x46bf24c <_ChromeMain+0x46b9fb0>
 46bfae0: aa1903e0     	mov	x0, x25
 46bfae4: aa1803e1     	mov	x1, x24
 46bfae8: aa1703e2     	mov	x2, x23
 46bfaec: 94e53df8     	bl	0x800f2cc <_ChromeMain+0x800a030>
 46bfaf0: 38376b3f     	strb	wzr, [x25, x23]
 46bfaf4: 398b9fe8     	ldrsb	x8, [sp, #0x2e7]
 46bfaf8: f9416be9     	ldr	x9, [sp, #0x2d0]
 46bfafc: f9416fea     	ldr	x10, [sp, #0x2d8]
 46bfb00: f100011f     	cmp	x8, #0x0
 46bfb04: 910b43eb     	add	x11, sp, #0x2d0
 46bfb08: 9a8b4121     	csel	x1, x9, x11, mi
 46bfb0c: 7100011f     	cmp	w8, #0x0
 46bfb10: 9a884142     	csel	x2, x10, x8, mi
 46bfb14: 910d23e0     	add	x0, sp, #0x348
 46bfb18: 96f2c1af     	bl	0x3701d4 <_ChromeMain+0x36af38>
 46bfb1c: 910f03e0     	add	x0, sp, #0x3c0
 46bfb20: 910d23e1     	add	x1, sp, #0x348
 46bfb24: 96fce7ef     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 46bfb28: 9101c2a0     	add	x0, x21, #0x70
 46bfb2c: d2800001     	mov	x1, #0x0                ; =0
 46bfb30: 96e5a062     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46bfb34: 910082a0     	add	x0, x21, #0x20
 46bfb38: 96e5a050     	bl	0x27c78 <_ChromeMain+0x229dc>
 46bfb3c: 39cd7fe8     	ldrsb	w8, [sp, #0x35f]
 46bfb40: 36f800a8     	tbz	w8, #0x1f, 0x46bfb54 <_ChromeMain+0x46ba8b8>
 46bfb44: f941a7e0     	ldr	x0, [sp, #0x348]
 46bfb48: f941afe8     	ldr	x8, [sp, #0x358]
 46bfb4c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bfb50: 96e524da     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bfb54: 39cb9fe8     	ldrsb	w8, [sp, #0x2e7]
 46bfb58: 910183f8     	add	x24, sp, #0x60
 46bfb5c: 910f03f3     	add	x19, sp, #0x3c0
 46bfb60: 910443f9     	add	x25, sp, #0x110
 46bfb64: 36ffbfc8     	tbz	w8, #0x1f, 0x46bf35c <_ChromeMain+0x46ba0c0>
 46bfb68: f9416be0     	ldr	x0, [sp, #0x2d0]
 46bfb6c: f94173e8     	ldr	x8, [sp, #0x2e0]
 46bfb70: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46bfb74: 96e524d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46bfb78: 17fffdf9     	b	0x46bf35c <_ChromeMain+0x46ba0c0>
 46bfb7c: a9400801     	ldp	x1, x2, [x0]
 46bfb80: 91006300     	add	x0, x24, #0x18
 46bfb84: 96f7a3cc     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bfb88: 17ffff66     	b	0x46bf920 <_ChromeMain+0x46ba684>
 46bfb8c: 927cea79     	and	x25, x19, #0x7ffffffffffffff0
 46bfb90: 91004320     	add	x0, x25, #0x10
 46bfb94: 96e53df5     	bl	0xf368 <_ChromeMain+0xa0cc>
 46bfb98: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 46bfb9c: cb080328     	sub	x8, x25, x8
 46bfba0: f9016be0     	str	x0, [sp, #0x2d0]
 46bfba4: f9016ff3     	str	x19, [sp, #0x2d8]
 46bfba8: f90173e8     	str	x8, [sp, #0x2e0]
 46bfbac: 17ffffb8     	b	0x46bfa8c <_ChromeMain+0x46ba7f0>
 46bfbb0: a9400801     	ldp	x1, x2, [x0]
 46bfbb4: 91018300     	add	x0, x24, #0x60
 46bfbb8: 96f7a3bf     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bfbbc: 17ffff23     	b	0x46bf848 <_ChromeMain+0x46ba5ac>
 46bfbc0: a9400801     	ldp	x1, x2, [x0]
 46bfbc4: 9101e300     	add	x0, x24, #0x78
 46bfbc8: 96f7a3bb     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bfbcc: 17ffff31     	b	0x46bf890 <_ChromeMain+0x46ba5f4>
 46bfbd0: a9400801     	ldp	x1, x2, [x0]
 46bfbd4: 91024300     	add	x0, x24, #0x90
 46bfbd8: 96f7a3b7     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bfbdc: 17ffff3f     	b	0x46bf8d8 <_ChromeMain+0x46ba63c>
 46bfbe0: 79400008     	ldrh	w8, [x0]
 46bfbe4: 39400809     	ldrb	w9, [x0, #0x2]
 46bfbe8: 7100bd3f     	cmp	w9, #0x2f
 46bfbec: 5285e749     	mov	w9, #0x2f3a             ; =12090
 46bfbf0: 7a490100     	ccmp	w8, w9, #0x0, eq
 46bfbf4: 54ffb7e0     	b.eq	0x46bf2f0 <_ChromeMain+0x46ba054>
 46bfbf8: 91000400     	add	x0, x0, #0x1
 46bfbfc: cb000348     	sub	x8, x26, x0
 46bfc00: f1000d1f     	cmp	x8, #0x3
 46bfc04: 54fff24a     	b.ge	0x46bfa4c <_ChromeMain+0x46ba7b0>
 46bfc08: 17ffff95     	b	0x46bfa5c <_ChromeMain+0x46ba7c0>
 46bfc0c: a9400801     	ldp	x1, x2, [x0]
 46bfc10: 910183e0     	add	x0, sp, #0x60
 46bfc14: 96f7a3a8     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46bfc18: 17fffece     	b	0x46bf750 <_ChromeMain+0x46ba4b4>
 46bfc1c: 13001d09     	sxtb	w9, w8
 46bfc20: 7100013f     	cmp	w9, #0x0
 46bfc24: a9402809     	ldp	x9, x10, [x0]
 46bfc28: 9a804121     	csel	x1, x9, x0, mi
 46bfc2c: 9a884142     	csel	x2, x10, x8, mi
 46bfc30: 910183e0     	add	x0, sp, #0x60
 46bfc34: 96f7a3f3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfc38: 17fffec6     	b	0x46bf750 <_ChromeMain+0x46ba4b4>
 46bfc3c: 13001d09     	sxtb	w9, w8
 46bfc40: 7100013f     	cmp	w9, #0x0
 46bfc44: a9402809     	ldp	x9, x10, [x0]
 46bfc48: 9a804121     	csel	x1, x9, x0, mi
 46bfc4c: 9a884142     	csel	x2, x10, x8, mi
 46bfc50: 91018300     	add	x0, x24, #0x60
 46bfc54: 96f7a3eb     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfc58: 17fffefc     	b	0x46bf848 <_ChromeMain+0x46ba5ac>
 46bfc5c: 13001d09     	sxtb	w9, w8
 46bfc60: 7100013f     	cmp	w9, #0x0
 46bfc64: a9402809     	ldp	x9, x10, [x0]
 46bfc68: 9a804121     	csel	x1, x9, x0, mi
 46bfc6c: 9a884142     	csel	x2, x10, x8, mi
 46bfc70: 9101e300     	add	x0, x24, #0x78
 46bfc74: 96f7a3e3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfc78: 17ffff06     	b	0x46bf890 <_ChromeMain+0x46ba5f4>
 46bfc7c: 13001d09     	sxtb	w9, w8
 46bfc80: 7100013f     	cmp	w9, #0x0
 46bfc84: a9402809     	ldp	x9, x10, [x0]
 46bfc88: 9a804121     	csel	x1, x9, x0, mi
 46bfc8c: 9a884142     	csel	x2, x10, x8, mi
 46bfc90: 91024300     	add	x0, x24, #0x90
 46bfc94: 96f7a3db     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfc98: 17ffff10     	b	0x46bf8d8 <_ChromeMain+0x46ba63c>
 46bfc9c: 13001d09     	sxtb	w9, w8
 46bfca0: 7100013f     	cmp	w9, #0x0
 46bfca4: a9402809     	ldp	x9, x10, [x0]
 46bfca8: 9a804121     	csel	x1, x9, x0, mi
 46bfcac: 9a884142     	csel	x2, x10, x8, mi
 46bfcb0: 91006300     	add	x0, x24, #0x18
 46bfcb4: 96f7a3d3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfcb8: 17ffff1a     	b	0x46bf920 <_ChromeMain+0x46ba684>
 46bfcbc: 13001d09     	sxtb	w9, w8
 46bfcc0: 7100013f     	cmp	w9, #0x0
 46bfcc4: a9402809     	ldp	x9, x10, [x0]
 46bfcc8: 9a804121     	csel	x1, x9, x0, mi
 46bfccc: 9a884142     	csel	x2, x10, x8, mi
 46bfcd0: 91002320     	add	x0, x25, #0x8
 46bfcd4: 96f7a3cb     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfcd8: 17fffdc6     	b	0x46bf3f0 <_ChromeMain+0x46ba154>
 46bfcdc: 13001d09     	sxtb	w9, w8
 46bfce0: 7100013f     	cmp	w9, #0x0
 46bfce4: a9402809     	ldp	x9, x10, [x0]
 46bfce8: 9a804121     	csel	x1, x9, x0, mi
 46bfcec: 9a884142     	csel	x2, x10, x8, mi
 46bfcf0: 910022e0     	add	x0, x23, #0x8
 46bfcf4: 96f7a3c3     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 46bfcf8: 17fffcfc     	b	0x46bf0e8 <_ChromeMain+0x46b9e4c>
 46bfcfc: 910443e1     	add	x1, sp, #0x110
 46bfd00: aa1403e0     	mov	x0, x20
 46bfd04: 97e918c1     	bl	0x4106008 <_ChromeMain+0x4100d6c>
 46bfd08: 17fffe3d     	b	0x46bf5fc <_ChromeMain+0x46ba360>
 46bfd0c: 910443e1     	add	x1, sp, #0x110
 46bfd10: aa1403e0     	mov	x0, x20
 46bfd14: 94000011     	bl	0x46bfd58 <_ChromeMain+0x46baabc>
 46bfd18: 17fffd0e     	b	0x46bf150 <_ChromeMain+0x46b9eb4>
 46bfd1c: 9415019c     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 46bfd20: d4200000     	brk	#0
 46bfd24: d4400000     	hlt	#0
 46bfd28: d4200020     	brk	#0x1
 46bfd2c: d4200000     	brk	#0
 46bfd30: d4400000     	hlt	#0
 46bfd34: d4200020     	brk	#0x1
 46bfd38: 7103fd1f     	cmp	w8, #0xff
 46bfd3c: 54000081     	b.ne	0x46bfd4c <_ChromeMain+0x46baab0>
 46bfd40: b0048920     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 46bfd44: 913be000     	add	x0, x0, #0xef8
 46bfd48: 94159d52     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 46bfd4c: b0048920     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 46bfd50: 913c6000     	add	x0, x0, #0xf18
 46bfd54: 94159d4f     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
