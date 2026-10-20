
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465fd00: 14000371     	b	0x4660ac4 <_ChromeMain+0x465b828>
 465fd04: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 465fd08: 910003fd     	mov	x29, sp
 465fd0c: 9400036e     	bl	0x4660ac4 <_ChromeMain+0x465b828>
 465fd10: 52802701     	mov	w1, #0x138              ; =312
 465fd14: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 465fd18: 16e6a468     	b	0x8eb8 <_ChromeMain+0x3c1c>
 465fd1c: 52800021     	mov	w1, #0x1                ; =1
 465fd20: 1400045b     	b	0x4660e8c <_ChromeMain+0x465bbf0>
 465fd24: d10403ff     	sub	sp, sp, #0x100
 465fd28: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 465fd2c: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 465fd30: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 465fd34: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 465fd38: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 465fd3c: 9103c3fd     	add	x29, sp, #0xf0
 465fd40: f9400408     	ldr	x8, [x0, #0x8]
 465fd44: b40008c8     	cbz	x8, 0x465fe5c <_ChromeMain+0x465abc0>
 465fd48: f9424108     	ldr	x8, [x8, #0x480]
 465fd4c: b4000888     	cbz	x8, 0x465fe5c <_ChromeMain+0x465abc0>
 465fd50: aa0103f4     	mov	x20, x1
 465fd54: aa0003f3     	mov	x19, x0
 465fd58: f9405c28     	ldr	x8, [x1, #0xb8]
 465fd5c: 8b081108     	add	x8, x8, x8, lsl #4
 465fd60: d37df116     	lsl	x22, x8, #3
 465fd64: b4000216     	cbz	x22, 0x465fda4 <_ChromeMain+0x465ab08>
 465fd68: aa0203f5     	mov	x21, x2
 465fd6c: 52800017     	mov	w23, #0x0               ; =0
 465fd70: d10163b8     	sub	x24, x29, #0x58
 465fd74: f9405a88     	ldr	x8, [x20, #0xb0]
 465fd78: 91006119     	add	x25, x8, #0x18
 465fd7c: f8488720     	ldr	x0, [x25], #0x88
 465fd80: f9400008     	ldr	x8, [x0]
 465fd84: f941ed08     	ldr	x8, [x8, #0x3d8]
 465fd88: d63f0100     	blr	x8
 465fd8c: 7100001f     	cmp	w0, #0x0
 465fd90: 1a9716f7     	cinc	w23, w23, eq
 465fd94: f10222d6     	subs	x22, x22, #0x88
 465fd98: 54ffff21     	b.ne	0x465fd7c <_ChromeMain+0x465aae0>
 465fd9c: 710006ff     	cmp	w23, #0x1
 465fda0: 54000760     	b.eq	0x465fe8c <_ChromeMain+0x465abf0>
 465fda4: 910003f4     	mov	x20, sp
 465fda8: a9007fff     	stp	xzr, xzr, [sp]
 465fdac: b80173ff     	stur	wzr, [sp, #0x17]
 465fdb0: f9000bff     	str	xzr, [sp, #0x10]
 465fdb4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 465fdb8: ad0103e0     	stp	q0, q0, [sp, #0x20]
 465fdbc: ad0203e0     	stp	q0, q0, [sp, #0x40]
 465fdc0: 7900c3ff     	strh	wzr, [sp, #0x60]
 465fdc4: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 465fdc8: 91010260     	add	x0, x19, #0x40
 465fdcc: 910003e1     	mov	x1, sp
 465fdd0: 96fe6744     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 465fdd4: 9101c280     	add	x0, x20, #0x70
 465fdd8: d2800001     	mov	x1, #0x0                ; =0
 465fddc: 96e71fb7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 465fde0: 91008280     	add	x0, x20, #0x20
 465fde4: 96e71fa5     	bl	0x27c78 <_ChromeMain+0x229dc>
 465fde8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 465fdec: 36f800a8     	tbz	w8, #0x1f, 0x465fe00 <_ChromeMain+0x465ab64>
 465fdf0: f94003e0     	ldr	x0, [sp]
 465fdf4: f9400be8     	ldr	x8, [sp, #0x10]
 465fdf8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465fdfc: 96e6a42f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fe00: 39c33e68     	ldrsb	w8, [x19, #0xcf]
 465fe04: 37f803c8     	tbnz	w8, #0x1f, 0x465fe7c <_ChromeMain+0x465abe0>
 465fe08: 7901727f     	strh	wzr, [x19, #0xb8]
 465fe0c: 39033e7f     	strb	wzr, [x19, #0xcf]
 465fe10: f9400e74     	ldr	x20, [x19, #0x18]
 465fe14: b5000bf4     	cbnz	x20, 0x465ff90 <_ChromeMain+0x465acf4>
 465fe18: f9400674     	ldr	x20, [x19, #0x8]
 465fe1c: b4000214     	cbz	x20, 0x465fe5c <_ChromeMain+0x465abc0>
 465fe20: f9435e93     	ldr	x19, [x20, #0x6b8]
 465fe24: b4000113     	cbz	x19, 0x465fe44 <_ChromeMain+0x465aba8>
 465fe28: 394ce268     	ldrb	w8, [x19, #0x338]
 465fe2c: 35002ce8     	cbnz	w8, 0x46603c8 <_ChromeMain+0x465b12c>
 465fe30: f9400268     	ldr	x8, [x19]
 465fe34: f9405108     	ldr	x8, [x8, #0xa0]
 465fe38: aa1303e0     	mov	x0, x19
 465fe3c: 52800001     	mov	w1, #0x0                ; =0
 465fe40: d63f0100     	blr	x8
 465fe44: f9465280     	ldr	x0, [x20, #0xca0]
 465fe48: f906529f     	str	xzr, [x20, #0xca0]
 465fe4c: b40000a0     	cbz	x0, 0x465fe60 <_ChromeMain+0x465abc4>
 465fe50: 94e55982     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 465fe54: 52800301     	mov	w1, #0x18               ; =24
 465fe58: 96e6a418     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465fe5c: d2800000     	mov	x0, #0x0                ; =0
 465fe60: a94f7bfd     	ldp	x29, x30, [sp, #0xf0]
 465fe64: a94e4ff4     	ldp	x20, x19, [sp, #0xe0]
 465fe68: a94d57f6     	ldp	x22, x21, [sp, #0xd0]
 465fe6c: a94c5ff8     	ldp	x24, x23, [sp, #0xc0]
 465fe70: a94b67fa     	ldp	x26, x25, [sp, #0xb0]
 465fe74: 910403ff     	add	sp, sp, #0x100
 465fe78: d65f03c0     	ret
 465fe7c: f9405e68     	ldr	x8, [x19, #0xb8]
 465fe80: 7900011f     	strh	wzr, [x8]
 465fe84: f900627f     	str	xzr, [x19, #0xc0]
 465fe88: 17ffffe2     	b	0x465fe10 <_ChromeMain+0x465ab74>
 465fe8c: f9408288     	ldr	x8, [x20, #0x100]
 465fe90: f9405e89     	ldr	x9, [x20, #0xb8]
 465fe94: eb09011f     	cmp	x8, x9
 465fe98: 54002962     	b.hs	0x46603c4 <_ChromeMain+0x465b128>
 465fe9c: f9405a89     	ldr	x9, [x20, #0xb0]
 465fea0: 5280110a     	mov	w10, #0x88              ; =136
 465fea4: 9b0a2508     	madd	x8, x8, x10, x9
 465fea8: b4000108     	cbz	x8, 0x465fec8 <_ChromeMain+0x465ac2c>
 465feac: f9400d01     	ldr	x1, [x8, #0x18]
 465feb0: b40000c1     	cbz	x1, 0x465fec8 <_ChromeMain+0x465ac2c>
 465feb4: f9400916     	ldr	x22, [x8, #0x10]
 465feb8: f9400668     	ldr	x8, [x19, #0x8]
 465febc: f9424100     	ldr	x0, [x8, #0x480]
 465fec0: 97eadd96     	bl	0x4117518 <_ChromeMain+0x411227c>
 465fec4: b5000bc0     	cbnz	x0, 0x466003c <_ChromeMain+0x465ada0>
 465fec8: 910003f4     	mov	x20, sp
 465fecc: a9007fff     	stp	xzr, xzr, [sp]
 465fed0: b80173ff     	stur	wzr, [sp, #0x17]
 465fed4: f9000bff     	str	xzr, [sp, #0x10]
 465fed8: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 465fedc: ad0103e0     	stp	q0, q0, [sp, #0x20]
 465fee0: ad0203e0     	stp	q0, q0, [sp, #0x40]
 465fee4: 7900c3ff     	strh	wzr, [sp, #0x60]
 465fee8: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 465feec: 91010260     	add	x0, x19, #0x40
 465fef0: 910003e1     	mov	x1, sp
 465fef4: 96fe66fb     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 465fef8: 9101c280     	add	x0, x20, #0x70
 465fefc: d2800001     	mov	x1, #0x0                ; =0
 465ff00: 96e71f6e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 465ff04: 91008280     	add	x0, x20, #0x20
 465ff08: 96e71f5c     	bl	0x27c78 <_ChromeMain+0x229dc>
 465ff0c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 465ff10: 36f800a8     	tbz	w8, #0x1f, 0x465ff24 <_ChromeMain+0x465ac88>
 465ff14: f94003e0     	ldr	x0, [sp]
 465ff18: f9400be8     	ldr	x8, [sp, #0x10]
 465ff1c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465ff20: 96e6a3e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465ff24: 39c33e68     	ldrsb	w8, [x19, #0xcf]
 465ff28: 37f802c8     	tbnz	w8, #0x1f, 0x465ff80 <_ChromeMain+0x465ace4>
 465ff2c: 7901727f     	strh	wzr, [x19, #0xb8]
 465ff30: 39033e7f     	strb	wzr, [x19, #0xcf]
 465ff34: f9400e74     	ldr	x20, [x19, #0x18]
 465ff38: b4fff714     	cbz	x20, 0x465fe18 <_ChromeMain+0x465ab7c>
 465ff3c: f9400288     	ldr	x8, [x20]
 465ff40: f9402d08     	ldr	x8, [x8, #0x58]
 465ff44: aa1403e0     	mov	x0, x20
 465ff48: d63f0100     	blr	x8
 465ff4c: aa0003f5     	mov	x21, x0
 465ff50: 94c935cf     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 465ff54: f10002bf     	cmp	x21, #0x0
 465ff58: 1a9f07e8     	cset	w8, ne
 465ff5c: eb0002bf     	cmp	x21, x0
 465ff60: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 465ff64: 54000360     	b.eq	0x465ffd0 <_ChromeMain+0x465ad34>
 465ff68: f94026b5     	ldr	x21, [x21, #0x48]
 465ff6c: f10002bf     	cmp	x21, #0x0
 465ff70: 1a9f07e8     	cset	w8, ne
 465ff74: fa4012a4     	ccmp	x21, x0, #0x4, ne
 465ff78: 54ffff81     	b.ne	0x465ff68 <_ChromeMain+0x465accc>
 465ff7c: 14000015     	b	0x465ffd0 <_ChromeMain+0x465ad34>
 465ff80: f9405e68     	ldr	x8, [x19, #0xb8]
 465ff84: 7900011f     	strh	wzr, [x8]
 465ff88: f900627f     	str	xzr, [x19, #0xc0]
 465ff8c: 17ffffea     	b	0x465ff34 <_ChromeMain+0x465ac98>
 465ff90: f9400288     	ldr	x8, [x20]
 465ff94: f9402d08     	ldr	x8, [x8, #0x58]
 465ff98: aa1403e0     	mov	x0, x20
 465ff9c: d63f0100     	blr	x8
 465ffa0: aa0003f5     	mov	x21, x0
 465ffa4: 94c935ba     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 465ffa8: f10002bf     	cmp	x21, #0x0
 465ffac: 1a9f07e8     	cset	w8, ne
 465ffb0: eb0002bf     	cmp	x21, x0
 465ffb4: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 465ffb8: 540000c0     	b.eq	0x465ffd0 <_ChromeMain+0x465ad34>
 465ffbc: f94026b5     	ldr	x21, [x21, #0x48]
 465ffc0: f10002bf     	cmp	x21, #0x0
 465ffc4: 1a9f07e8     	cset	w8, ne
 465ffc8: fa4012a4     	ccmp	x21, x0, #0x4, ne
 465ffcc: 54ffff81     	b.ne	0x465ffbc <_ChromeMain+0x465ad20>
 465ffd0: 34000088     	cbz	w8, 0x465ffe0 <_ChromeMain+0x465ad44>
 465ffd4: aa1403e0     	mov	x0, x20
 465ffd8: 52800001     	mov	w1, #0x0                ; =0
 465ffdc: 97eb4bad     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 465ffe0: 91004260     	add	x0, x19, #0x10
 465ffe4: d2800001     	mov	x1, #0x0                ; =0
 465ffe8: 9761fb2e     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 465ffec: 17ffff8b     	b	0x465fe18 <_ChromeMain+0x465ab7c>
 465fff0: 13001d09     	sxtb	w9, w8
 465fff4: 7100013f     	cmp	w9, #0x0
 465fff8: 910003e9     	mov	x9, sp
 465fffc: a9402fea     	ldp	x10, x11, [sp]
 4660000: 9a894141     	csel	x1, x10, x9, mi
 4660004: 9a884162     	csel	x2, x11, x8, mi
 4660008: 9102e260     	add	x0, x19, #0xb8
 466000c: 9709ba0a     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4660010: 1400006d     	b	0x46601c4 <_ChromeMain+0x465af28>
 4660014: b942bac9     	ldr	w9, [x22, #0x2b8]
 4660018: 3100053f     	cmn	w9, #0x1
 466001c: 540029a1     	b.ne	0x4660550 <_ChromeMain+0x465b2b4>
 4660020: 394d2109     	ldrb	w9, [x8, #0x348]
 4660024: 34000549     	cbz	w9, 0x46600cc <_ChromeMain+0x465ae30>
 4660028: 1400011f     	b	0x46604a4 <_ChromeMain+0x465b208>
 466002c: a9400801     	ldp	x1, x2, [x0]
 4660030: 910003e0     	mov	x0, sp
 4660034: 96e79ae7     	bl	0x46bd0 <_ChromeMain+0x41934>
 4660038: 14000057     	b	0x4660194 <_ChromeMain+0x465aef8>
 466003c: aa0003f4     	mov	x20, x0
 4660040: f9400008     	ldr	x8, [x0]
 4660044: f9402d08     	ldr	x8, [x8, #0x58]
 4660048: d63f0100     	blr	x8
 466004c: aa0003f7     	mov	x23, x0
 4660050: 94c9358f     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 4660054: f10002ff     	cmp	x23, #0x0
 4660058: 1a9f07e8     	cset	w8, ne
 466005c: eb0002ff     	cmp	x23, x0
 4660060: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 4660064: 540000c0     	b.eq	0x466007c <_ChromeMain+0x465ade0>
 4660068: f94026f7     	ldr	x23, [x23, #0x48]
 466006c: f10002ff     	cmp	x23, #0x0
 4660070: 1a9f07e8     	cset	w8, ne
 4660074: fa4012e4     	ccmp	x23, x0, #0x4, ne
 4660078: 54ffff81     	b.ne	0x4660068 <_ChromeMain+0x465adcc>
 466007c: 7100011f     	cmp	w8, #0x0
 4660080: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4660084: 54fff220     	b.eq	0x465fec8 <_ChromeMain+0x465ac2c>
 4660088: f9414ac8     	ldr	x8, [x22, #0x290]
 466008c: b5fffc48     	cbnz	x8, 0x4660014 <_ChromeMain+0x465ad78>
 4660090: f94132c8     	ldr	x8, [x22, #0x260]
 4660094: f9401d09     	ldr	x9, [x8, #0x38]
 4660098: b0ffcf2a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 466009c: 913c814a     	add	x10, x10, #0xf20
 46600a0: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 46600a4: eb0a013f     	cmp	x9, x10
 46600a8: 54001f41     	b.ne	0x4660490 <_ChromeMain+0x465b1f4>
 46600ac: 3100051f     	cmn	w8, #0x1
 46600b0: 54002680     	b.eq	0x4660580 <_ChromeMain+0x465b2e4>
 46600b4: f94142c9     	ldr	x9, [x22, #0x280]
 46600b8: eb08013f     	cmp	x9, x8
 46600bc: 54001849     	b.ls	0x46603c4 <_ChromeMain+0x465b128>
 46600c0: f9413ec9     	ldr	x9, [x22, #0x278]
 46600c4: f8687928     	ldr	x8, [x9, x8, lsl #3]
 46600c8: b4002568     	cbz	x8, 0x4660574 <_ChromeMain+0x465b2d8>
 46600cc: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 46600d0: b7f824a9     	tbnz	x9, #0x3f, 0x4660564 <_ChromeMain+0x465b2c8>
 46600d4: b50024c9     	cbnz	x9, 0x466056c <_ChromeMain+0x465b2d0>
 46600d8: f9400d08     	ldr	x8, [x8, #0x18]
 46600dc: f9400508     	ldr	x8, [x8, #0x8]
 46600e0: 91018101     	add	x1, x8, #0x60
 46600e4: 910003f7     	mov	x23, sp
 46600e8: 910003e0     	mov	x0, sp
 46600ec: 96eb67aa     	bl	0x139f94 <_ChromeMain+0x134cf8>
 46600f0: 91010260     	add	x0, x19, #0x40
 46600f4: 910003e1     	mov	x1, sp
 46600f8: 96f9ae05     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 46600fc: 9101c2e0     	add	x0, x23, #0x70
 4660100: d2800001     	mov	x1, #0x0                ; =0
 4660104: 96e71eed     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4660108: 910082e0     	add	x0, x23, #0x20
 466010c: 96e71edb     	bl	0x27c78 <_ChromeMain+0x229dc>
 4660110: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4660114: 36f800a8     	tbz	w8, #0x1f, 0x4660128 <_ChromeMain+0x465ae8c>
 4660118: f94003e0     	ldr	x0, [sp]
 466011c: f9400be8     	ldr	x8, [sp, #0x10]
 4660120: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4660124: 96e6a365     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660128: 39416268     	ldrb	w8, [x19, #0x58]
 466012c: 37000248     	tbnz	w8, #0x0, 0x4660174 <_ChromeMain+0x465aed8>
 4660130: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 4660134: 3100051f     	cmn	w8, #0x1
 4660138: 54002320     	b.eq	0x466059c <_ChromeMain+0x465b300>
 466013c: f94142c9     	ldr	x9, [x22, #0x280]
 4660140: eb08013f     	cmp	x9, x8
 4660144: 54001409     	b.ls	0x46603c4 <_ChromeMain+0x465b128>
 4660148: f9413ec9     	ldr	x9, [x22, #0x278]
 466014c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4660150: b40022c8     	cbz	x8, 0x46605a8 <_ChromeMain+0x465b30c>
 4660154: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4660158: b7f821a9     	tbnz	x9, #0x3f, 0x466058c <_ChromeMain+0x465b2f0>
 466015c: b50021c9     	cbnz	x9, 0x4660594 <_ChromeMain+0x465b2f8>
 4660160: f9400d08     	ldr	x8, [x8, #0x18]
 4660164: f9400508     	ldr	x8, [x8, #0x8]
 4660168: 91018101     	add	x1, x8, #0x60
 466016c: 91010260     	add	x0, x19, #0x40
 4660170: 96f9ade7     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4660174: aa1603e0     	mov	x0, x22
 4660178: 973920d9     	bl	0x14a84dc <_ChromeMain+0x14a3240>
 466017c: 39c05c08     	ldrsb	w8, [x0, #0x17]
 4660180: 37fff568     	tbnz	w8, #0x1f, 0x466002c <_ChromeMain+0x465ad90>
 4660184: 3dc00000     	ldr	q0, [x0]
 4660188: f9400808     	ldr	x8, [x0, #0x10]
 466018c: f9000be8     	str	x8, [sp, #0x10]
 4660190: 3d8003e0     	str	q0, [sp]
 4660194: 9102e276     	add	x22, x19, #0xb8
 4660198: 910003e8     	mov	x8, sp
 466019c: eb0802df     	cmp	x22, x8
 46601a0: 54000120     	b.eq	0x46601c4 <_ChromeMain+0x465af28>
 46601a4: 39c33e69     	ldrsb	w9, [x19, #0xcf]
 46601a8: 39405fe8     	ldrb	w8, [sp, #0x17]
 46601ac: 37fff229     	tbnz	w9, #0x1f, 0x465fff0 <_ChromeMain+0x465ad54>
 46601b0: 37380948     	tbnz	w8, #0x7, 0x46602d8 <_ChromeMain+0x465b03c>
 46601b4: 3dc003e0     	ldr	q0, [sp]
 46601b8: 3d8002c0     	str	q0, [x22]
 46601bc: f9400be8     	ldr	x8, [sp, #0x10]
 46601c0: f9000ac8     	str	x8, [x22, #0x10]
 46601c4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 46601c8: 36f800a8     	tbz	w8, #0x1f, 0x46601dc <_ChromeMain+0x465af40>
 46601cc: f94003e0     	ldr	x0, [sp]
 46601d0: f9400be8     	ldr	x8, [sp, #0x10]
 46601d4: d37ff901     	lsl	x1, x8, #1
 46601d8: 96e6a338     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46601dc: f9400660     	ldr	x0, [x19, #0x8]
 46601e0: b4000b80     	cbz	x0, 0x4660350 <_ChromeMain+0x465b0b4>
 46601e4: f9435408     	ldr	x8, [x0, #0x6a8]
 46601e8: b4000b48     	cbz	x8, 0x4660350 <_ChromeMain+0x465b0b4>
 46601ec: 39416269     	ldrb	w9, [x19, #0x58]
 46601f0: 34000b09     	cbz	w9, 0x4660350 <_ChromeMain+0x465b0b4>
 46601f4: a9007fff     	stp	xzr, xzr, [sp]
 46601f8: b90013ff     	str	wzr, [sp, #0x10]
 46601fc: 3947210a     	ldrb	w10, [x8, #0x1c8]
 4660200: 34000aea     	cbz	w10, 0x466035c <_ChromeMain+0x465b0c0>
 4660204: aa0803e0     	mov	x0, x8
 4660208: 97371cdb     	bl	0x1427574 <_ChromeMain+0x14222d8>
 466020c: f2607c3f     	tst	x1, #0xffffffff00000000
 4660210: 7a401824     	ccmp	w1, #0x0, #0x4, ne
 4660214: 1a9f07e9     	cset	w9, ne
 4660218: f9400660     	ldr	x0, [x19, #0x8]
 466021c: f9435408     	ldr	x8, [x0, #0x6a8]
 4660220: 37000649     	tbnz	w9, #0x0, 0x46602e8 <_ChromeMain+0x465b04c>
 4660224: f941b508     	ldr	x8, [x8, #0x368]
 4660228: b5000608     	cbnz	x8, 0x46602e8 <_ChromeMain+0x465b04c>
 466022c: 97ffb471     	bl	0x464d3f0 <_ChromeMain+0x4648154>
 4660230: a93a87a0     	stp	x0, x1, [x29, #-0x58]
 4660234: f004c728     	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 4660238: 3dc29500     	ldr	q0, [x8, #0xa50]
 466023c: 3c9903a0     	stur	q0, [x29, #-0x70]
 4660240: d10163a0     	sub	x0, x29, #0x58
 4660244: d101c3a1     	sub	x1, x29, #0x70
 4660248: 96f5b39c     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 466024c: 3dc00300     	ldr	q0, [x24]
 4660250: 3d8003e0     	str	q0, [sp]
 4660254: 52800028     	mov	w8, #0x1                ; =1
 4660258: 390043e8     	strb	w8, [sp, #0x10]
 466025c: b9400be8     	ldr	w8, [sp, #0x8]
 4660260: 34000568     	cbz	w8, 0x466030c <_ChromeMain+0x465b070>
 4660264: b9400fe8     	ldr	w8, [sp, #0xc]
 4660268: 34000528     	cbz	w8, 0x466030c <_ChromeMain+0x465b070>
 466026c: 91120297     	add	x23, x20, #0x480
 4660270: f9400675     	ldr	x21, [x19, #0x8]
 4660274: 39925e98     	ldrsb	x24, [x20, #0x497]
 4660278: b6f80058     	tbz	x24, #0x3f, 0x4660280 <_ChromeMain+0x465afe4>
 466027c: f9424698     	ldr	x24, [x20, #0x488]
 4660280: aa1403e0     	mov	x0, x20
 4660284: 97371cbc     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4660288: a93a87a0     	stp	x0, x1, [x29, #-0x58]
 466028c: f100031f     	cmp	x24, #0x0
 4660290: 9a9702c1     	csel	x1, x22, x23, eq
 4660294: 91128282     	add	x2, x20, #0x4a0
 4660298: d10163a3     	sub	x3, x29, #0x58
 466029c: 910003e4     	mov	x4, sp
 46602a0: aa1503e0     	mov	x0, x21
 46602a4: 52800025     	mov	w5, #0x1                ; =1
 46602a8: 97ffc3a6     	bl	0x4651140 <_ChromeMain+0x464bea4>
 46602ac: f9400e75     	ldr	x21, [x19, #0x18]
 46602b0: eb1402bf     	cmp	x21, x20
 46602b4: 540004c0     	b.eq	0x466034c <_ChromeMain+0x465b0b0>
 46602b8: b5000bb5     	cbnz	x21, 0x466042c <_ChromeMain+0x465b190>
 46602bc: 91004260     	add	x0, x19, #0x10
 46602c0: aa1403e1     	mov	x1, x20
 46602c4: 9761fa77     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 46602c8: aa1403e0     	mov	x0, x20
 46602cc: 52800021     	mov	w1, #0x1                ; =1
 46602d0: 97eb4af0     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 46602d4: 1400001e     	b	0x466034c <_ChromeMain+0x465b0b0>
 46602d8: a9400be1     	ldp	x1, x2, [sp]
 46602dc: 9102e260     	add	x0, x19, #0xb8
 46602e0: 9709b903     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 46602e4: 17ffffb8     	b	0x46601c4 <_ChromeMain+0x465af28>
 46602e8: f9435400     	ldr	x0, [x0, #0x6a8]
 46602ec: d10163a8     	sub	x8, x29, #0x58
 46602f0: aa1503e1     	mov	x1, x21
 46602f4: 97fe9993     	bl	0x4606940 <_ChromeMain+0x46016a4>
 46602f8: 385b83a8     	ldurb	w8, [x29, #-0x48]
 46602fc: 390043e8     	strb	w8, [sp, #0x10]
 4660300: 3dc00300     	ldr	q0, [x24]
 4660304: 3d8003e0     	str	q0, [sp]
 4660308: 3707faa8     	tbnz	w8, #0x0, 0x466025c <_ChromeMain+0x465afc0>
 466030c: f9400e74     	ldr	x20, [x19, #0x18]
 4660310: b50002b4     	cbnz	x20, 0x4660364 <_ChromeMain+0x465b0c8>
 4660314: f9400675     	ldr	x21, [x19, #0x8]
 4660318: b40001b5     	cbz	x21, 0x466034c <_ChromeMain+0x465b0b0>
 466031c: f9435eb4     	ldr	x20, [x21, #0x6b8]
 4660320: b4000114     	cbz	x20, 0x4660340 <_ChromeMain+0x465b0a4>
 4660324: 394ce288     	ldrb	w8, [x20, #0x338]
 4660328: 35000e28     	cbnz	w8, 0x46604ec <_ChromeMain+0x465b250>
 466032c: f9400288     	ldr	x8, [x20]
 4660330: f9405108     	ldr	x8, [x8, #0xa0]
 4660334: aa1403e0     	mov	x0, x20
 4660338: 52800001     	mov	w1, #0x0                ; =0
 466033c: d63f0100     	blr	x8
 4660340: f94652a0     	ldr	x0, [x21, #0xca0]
 4660344: f90652bf     	str	xzr, [x21, #0xca0]
 4660348: b50009c0     	cbnz	x0, 0x4660480 <_ChromeMain+0x465b1e4>
 466034c: f9400660     	ldr	x0, [x19, #0x8]
 4660350: f9424008     	ldr	x8, [x0, #0x480]
 4660354: 91002100     	add	x0, x8, #0x8
 4660358: 17fffec2     	b	0x465fe60 <_ChromeMain+0x465abc4>
 466035c: 52800009     	mov	w9, #0x0                ; =0
 4660360: 17ffffb0     	b	0x4660220 <_ChromeMain+0x465af84>
 4660364: f9400288     	ldr	x8, [x20]
 4660368: f9402d08     	ldr	x8, [x8, #0x58]
 466036c: aa1403e0     	mov	x0, x20
 4660370: d63f0100     	blr	x8
 4660374: aa0003f5     	mov	x21, x0
 4660378: 94c934c5     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 466037c: f10002bf     	cmp	x21, #0x0
 4660380: 1a9f07e8     	cset	w8, ne
 4660384: eb0002bf     	cmp	x21, x0
 4660388: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 466038c: 540000c0     	b.eq	0x46603a4 <_ChromeMain+0x465b108>
 4660390: f94026b5     	ldr	x21, [x21, #0x48]
 4660394: f10002bf     	cmp	x21, #0x0
 4660398: 1a9f07e8     	cset	w8, ne
 466039c: fa4012a4     	ccmp	x21, x0, #0x4, ne
 46603a0: 54ffff81     	b.ne	0x4660390 <_ChromeMain+0x465b0f4>
 46603a4: 34000088     	cbz	w8, 0x46603b4 <_ChromeMain+0x465b118>
 46603a8: aa1403e0     	mov	x0, x20
 46603ac: 52800001     	mov	w1, #0x0                ; =0
 46603b0: 97eb4ab8     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 46603b4: 91004260     	add	x0, x19, #0x10
 46603b8: d2800001     	mov	x1, #0x0                ; =0
 46603bc: 9761fa39     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 46603c0: 17ffffd5     	b	0x4660314 <_ChromeMain+0x465b078>
 46603c4: d4200020     	brk	#0x1
 46603c8: 390ce27f     	strb	wzr, [x19, #0x338]
 46603cc: f941a660     	ldr	x0, [x19, #0x348]
 46603d0: 910ca261     	add	x1, x19, #0x328
 46603d4: 976aa4cb     	bl	0x2109700 <_ChromeMain+0x2104464>
 46603d8: f9419668     	ldr	x8, [x19, #0x328]
 46603dc: f9401d08     	ldr	x8, [x8, #0x38]
 46603e0: 910ca260     	add	x0, x19, #0x328
 46603e4: d63f0100     	blr	x8
 46603e8: f941a268     	ldr	x8, [x19, #0x340]
 46603ec: b4ffd228     	cbz	x8, 0x465fe30 <_ChromeMain+0x465ab94>
 46603f0: f9419668     	ldr	x8, [x19, #0x328]
 46603f4: f9402108     	ldr	x8, [x8, #0x40]
 46603f8: 910ca260     	add	x0, x19, #0x328
 46603fc: d63f0100     	blr	x8
 4660400: f941a268     	ldr	x8, [x19, #0x340]
 4660404: f9400109     	ldr	x9, [x8]
 4660408: 7100001f     	cmp	w0, #0x0
 466040c: 5280020a     	mov	w10, #0x10              ; =16
 4660410: 5280040b     	mov	w11, #0x20              ; =32
 4660414: 9a8a116a     	csel	x10, x11, x10, ne
 4660418: f86a6929     	ldr	x9, [x9, x10]
 466041c: 910ca261     	add	x1, x19, #0x328
 4660420: aa0803e0     	mov	x0, x8
 4660424: d63f0120     	blr	x9
 4660428: 17fffe82     	b	0x465fe30 <_ChromeMain+0x465ab94>
 466042c: f94002a8     	ldr	x8, [x21]
 4660430: f9402d08     	ldr	x8, [x8, #0x58]
 4660434: aa1503e0     	mov	x0, x21
 4660438: d63f0100     	blr	x8
 466043c: aa0003f6     	mov	x22, x0
 4660440: 94c93493     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 4660444: f10002df     	cmp	x22, #0x0
 4660448: 1a9f07e8     	cset	w8, ne
 466044c: eb0002df     	cmp	x22, x0
 4660450: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4660454: 540000c0     	b.eq	0x466046c <_ChromeMain+0x465b1d0>
 4660458: f94026d6     	ldr	x22, [x22, #0x48]
 466045c: f10002df     	cmp	x22, #0x0
 4660460: 1a9f07e8     	cset	w8, ne
 4660464: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4660468: 54ffff81     	b.ne	0x4660458 <_ChromeMain+0x465b1bc>
 466046c: 34fff288     	cbz	w8, 0x46602bc <_ChromeMain+0x465b020>
 4660470: aa1503e0     	mov	x0, x21
 4660474: 52800001     	mov	w1, #0x0                ; =0
 4660478: 97eb4a86     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 466047c: 17ffff90     	b	0x46602bc <_ChromeMain+0x465b020>
 4660480: 94e557f6     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4660484: 52800301     	mov	w1, #0x18               ; =24
 4660488: 96e6a28c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466048c: 17ffffb0     	b	0x466034c <_ChromeMain+0x465b0b0>
 4660490: 3100051f     	cmn	w8, #0x1
 4660494: 54ffe101     	b.ne	0x46600b4 <_ChromeMain+0x465ae18>
 4660498: d4200000     	brk	#0
 466049c: d4400000     	hlt	#0
 46604a0: d4200020     	brk	#0x1
 46604a4: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 46604a8: 34ffdf49     	cbz	w9, 0x4660090 <_ChromeMain+0x465adf4>
 46604ac: b982b6c9     	ldrsw	x9, [x22, #0x2b4]
 46604b0: 3100053f     	cmn	w9, #0x1
 46604b4: 54000800     	b.eq	0x46605b4 <_ChromeMain+0x465b318>
 46604b8: f94142ca     	ldr	x10, [x22, #0x280]
 46604bc: eb09015f     	cmp	x10, x9
 46604c0: 54fff829     	b.ls	0x46603c4 <_ChromeMain+0x465b128>
 46604c4: f9413eca     	ldr	x10, [x22, #0x278]
 46604c8: f8697949     	ldr	x9, [x10, x9, lsl #3]
 46604cc: b9443129     	ldr	w9, [x9, #0x430]
 46604d0: 7100093f     	cmp	w9, #0x2
 46604d4: 54ffdde0     	b.eq	0x4660090 <_ChromeMain+0x465adf4>
 46604d8: f94136c9     	ldr	x9, [x22, #0x268]
 46604dc: b4000729     	cbz	x9, 0x46605c0 <_ChromeMain+0x465b324>
 46604e0: 39458129     	ldrb	w9, [x9, #0x160]
 46604e4: 3707dd69     	tbnz	w9, #0x0, 0x4660090 <_ChromeMain+0x465adf4>
 46604e8: 17fffef9     	b	0x46600cc <_ChromeMain+0x465ae30>
 46604ec: 390ce29f     	strb	wzr, [x20, #0x338]
 46604f0: f941a680     	ldr	x0, [x20, #0x348]
 46604f4: 910ca281     	add	x1, x20, #0x328
 46604f8: 976aa482     	bl	0x2109700 <_ChromeMain+0x2104464>
 46604fc: f9419688     	ldr	x8, [x20, #0x328]
 4660500: f9401d08     	ldr	x8, [x8, #0x38]
 4660504: 910ca280     	add	x0, x20, #0x328
 4660508: d63f0100     	blr	x8
 466050c: f941a288     	ldr	x8, [x20, #0x340]
 4660510: b4fff0e8     	cbz	x8, 0x466032c <_ChromeMain+0x465b090>
 4660514: f9419688     	ldr	x8, [x20, #0x328]
 4660518: f9402108     	ldr	x8, [x8, #0x40]
 466051c: 910ca280     	add	x0, x20, #0x328
 4660520: d63f0100     	blr	x8
 4660524: f941a288     	ldr	x8, [x20, #0x340]
 4660528: f9400109     	ldr	x9, [x8]
 466052c: 7100001f     	cmp	w0, #0x0
 4660530: 5280020a     	mov	w10, #0x10              ; =16
 4660534: 5280040b     	mov	w11, #0x20              ; =32
 4660538: 9a8a116a     	csel	x10, x11, x10, ne
 466053c: f86a6929     	ldr	x9, [x9, x10]
 4660540: 910ca281     	add	x1, x20, #0x328
 4660544: aa0803e0     	mov	x0, x8
 4660548: d63f0120     	blr	x9
 466054c: 17ffff78     	b	0x466032c <_ChromeMain+0x465b090>
 4660550: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 4660554: 34ffd9e9     	cbz	w9, 0x4660090 <_ChromeMain+0x465adf4>
 4660558: 394d2109     	ldrb	w9, [x8, #0x348]
 466055c: 35ffd9a9     	cbnz	w9, 0x4660090 <_ChromeMain+0x465adf4>
 4660560: 17fffedb     	b	0x46600cc <_ChromeMain+0x465ae30>
 4660564: f9401909     	ldr	x9, [x8, #0x30]
 4660568: b4ffdb89     	cbz	x9, 0x46600d8 <_ChromeMain+0x465ae3c>
 466056c: 9100a101     	add	x1, x8, #0x28
 4660570: 17fffedd     	b	0x46600e4 <_ChromeMain+0x465ae48>
 4660574: 97d02941     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4660578: aa0003e1     	mov	x1, x0
 466057c: 17fffeda     	b	0x46600e4 <_ChromeMain+0x465ae48>
 4660580: d4200000     	brk	#0
 4660584: d4400000     	hlt	#0
 4660588: d4200020     	brk	#0x1
 466058c: f9401909     	ldr	x9, [x8, #0x30]
 4660590: b4ffde89     	cbz	x9, 0x4660160 <_ChromeMain+0x465aec4>
 4660594: 9100a101     	add	x1, x8, #0x28
 4660598: 17fffef5     	b	0x466016c <_ChromeMain+0x465aed0>
 466059c: d4200000     	brk	#0
 46605a0: d4400000     	hlt	#0
 46605a4: d4200020     	brk	#0x1
 46605a8: 97d02934     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 46605ac: aa0003e1     	mov	x1, x0
 46605b0: 17fffeef     	b	0x466016c <_ChromeMain+0x465aed0>
 46605b4: d4200000     	brk	#0
 46605b8: d4400000     	hlt	#0
 46605bc: d4200020     	brk	#0x1
 46605c0: d4200000     	brk	#0
 46605c4: d4400000     	hlt	#0
 46605c8: d4200020     	brk	#0x1
 46605cc: d102c3ff     	sub	sp, sp, #0xb0
 46605d0: a90857f6     	stp	x22, x21, [sp, #0x80]
 46605d4: a9094ff4     	stp	x20, x19, [sp, #0x90]
 46605d8: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 46605dc: 910283fd     	add	x29, sp, #0xa0
 46605e0: aa0003f3     	mov	x19, x0
 46605e4: 910023f4     	add	x20, sp, #0x8
 46605e8: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 46605ec: b801f3ff     	stur	wzr, [sp, #0x1f]
 46605f0: f9000fff     	str	xzr, [sp, #0x18]
 46605f4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 46605f8: 3c8283e0     	stur	q0, [sp, #0x28]
 46605fc: 3c8383e0     	stur	q0, [sp, #0x38]
 4660600: 3c8483e0     	stur	q0, [sp, #0x48]
 4660604: 3c8583e0     	stur	q0, [sp, #0x58]
 4660608: 7900d3ff     	strh	wzr, [sp, #0x68]
 466060c: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4660610: 91010000     	add	x0, x0, #0x40
 4660614: 910023e1     	add	x1, sp, #0x8
 4660618: 96fe6532     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 466061c: 9101c280     	add	x0, x20, #0x70
 4660620: d2800001     	mov	x1, #0x0                ; =0
 4660624: 96e71da5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4660628: 91008280     	add	x0, x20, #0x20
 466062c: 96e71d93     	bl	0x27c78 <_ChromeMain+0x229dc>
 4660630: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4660634: 36f800a8     	tbz	w8, #0x1f, 0x4660648 <_ChromeMain+0x465b3ac>
 4660638: f94007e0     	ldr	x0, [sp, #0x8]
 466063c: f9400fe8     	ldr	x8, [sp, #0x18]
 4660640: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4660644: 96e6a21d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660648: 39c33e68     	ldrsb	w8, [x19, #0xcf]
 466064c: 37f80368     	tbnz	w8, #0x1f, 0x46606b8 <_ChromeMain+0x465b41c>
 4660650: 7901727f     	strh	wzr, [x19, #0xb8]
 4660654: 39033e7f     	strb	wzr, [x19, #0xcf]
 4660658: f9400e74     	ldr	x20, [x19, #0x18]
 466065c: b50003f4     	cbnz	x20, 0x46606d8 <_ChromeMain+0x465b43c>
 4660660: f9400675     	ldr	x21, [x19, #0x8]
 4660664: b40001b5     	cbz	x21, 0x4660698 <_ChromeMain+0x465b3fc>
 4660668: f9435eb4     	ldr	x20, [x21, #0x6b8]
 466066c: b4000114     	cbz	x20, 0x466068c <_ChromeMain+0x465b3f0>
 4660670: 394ce288     	ldrb	w8, [x20, #0x338]
 4660674: 35000628     	cbnz	w8, 0x4660738 <_ChromeMain+0x465b49c>
 4660678: f9400288     	ldr	x8, [x20]
 466067c: f9405108     	ldr	x8, [x8, #0xa0]
 4660680: aa1403e0     	mov	x0, x20
 4660684: 52800001     	mov	w1, #0x0                ; =0
 4660688: d63f0100     	blr	x8
 466068c: f94652a0     	ldr	x0, [x21, #0xca0]
 4660690: f90652bf     	str	xzr, [x21, #0xca0]
 4660694: b50001a0     	cbnz	x0, 0x46606c8 <_ChromeMain+0x465b42c>
 4660698: aa1303e0     	mov	x0, x19
 466069c: 52800001     	mov	w1, #0x0                ; =0
 46606a0: 940001fb     	bl	0x4660e8c <_ChromeMain+0x465bbf0>
 46606a4: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 46606a8: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 46606ac: a94857f6     	ldp	x22, x21, [sp, #0x80]
 46606b0: 9102c3ff     	add	sp, sp, #0xb0
 46606b4: d65f03c0     	ret
 46606b8: f9405e68     	ldr	x8, [x19, #0xb8]
 46606bc: 7900011f     	strh	wzr, [x8]
 46606c0: f900627f     	str	xzr, [x19, #0xc0]
 46606c4: 17ffffe5     	b	0x4660658 <_ChromeMain+0x465b3bc>
 46606c8: 94e55764     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 46606cc: 52800301     	mov	w1, #0x18               ; =24
 46606d0: 96e6a1fa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46606d4: 17fffff1     	b	0x4660698 <_ChromeMain+0x465b3fc>
 46606d8: f9400288     	ldr	x8, [x20]
 46606dc: f9402d08     	ldr	x8, [x8, #0x58]
 46606e0: aa1403e0     	mov	x0, x20
 46606e4: d63f0100     	blr	x8
 46606e8: aa0003f5     	mov	x21, x0
 46606ec: 94c933e8     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 46606f0: f10002bf     	cmp	x21, #0x0
 46606f4: 1a9f07e8     	cset	w8, ne
 46606f8: eb0002bf     	cmp	x21, x0
 46606fc: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4660700: 540000c0     	b.eq	0x4660718 <_ChromeMain+0x465b47c>
 4660704: f94026b5     	ldr	x21, [x21, #0x48]
 4660708: f10002bf     	cmp	x21, #0x0
 466070c: 1a9f07e8     	cset	w8, ne
 4660710: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4660714: 54ffff81     	b.ne	0x4660704 <_ChromeMain+0x465b468>
 4660718: 34000088     	cbz	w8, 0x4660728 <_ChromeMain+0x465b48c>
 466071c: aa1403e0     	mov	x0, x20
 4660720: 52800001     	mov	w1, #0x0                ; =0
 4660724: 97eb49db     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 4660728: 91004260     	add	x0, x19, #0x10
 466072c: d2800001     	mov	x1, #0x0                ; =0
 4660730: 9761f95c     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 4660734: 17ffffcb     	b	0x4660660 <_ChromeMain+0x465b3c4>
 4660738: 390ce29f     	strb	wzr, [x20, #0x338]
 466073c: f941a680     	ldr	x0, [x20, #0x348]
 4660740: 910ca281     	add	x1, x20, #0x328
 4660744: 976aa3ef     	bl	0x2109700 <_ChromeMain+0x2104464>
 4660748: f9419688     	ldr	x8, [x20, #0x328]
 466074c: f9401d08     	ldr	x8, [x8, #0x38]
 4660750: 910ca280     	add	x0, x20, #0x328
 4660754: d63f0100     	blr	x8
 4660758: f941a288     	ldr	x8, [x20, #0x340]
 466075c: b4fff8e8     	cbz	x8, 0x4660678 <_ChromeMain+0x465b3dc>
 4660760: f9419688     	ldr	x8, [x20, #0x328]
 4660764: f9402108     	ldr	x8, [x8, #0x40]
 4660768: 910ca280     	add	x0, x20, #0x328
 466076c: d63f0100     	blr	x8
 4660770: f941a288     	ldr	x8, [x20, #0x340]
 4660774: f9400109     	ldr	x9, [x8]
 4660778: 7100001f     	cmp	w0, #0x0
 466077c: 5280020a     	mov	w10, #0x10              ; =16
 4660780: 5280040b     	mov	w11, #0x20              ; =32
 4660784: 9a8a116a     	csel	x10, x11, x10, ne
 4660788: f86a6929     	ldr	x9, [x9, x10]
 466078c: 910ca281     	add	x1, x20, #0x328
 4660790: aa0803e0     	mov	x0, x8
 4660794: d63f0120     	blr	x9
 4660798: 17ffffb8     	b	0x4660678 <_ChromeMain+0x465b3dc>
 466079c: 39416008     	ldrb	w8, [x0, #0x58]
 46607a0: 35000068     	cbnz	w8, 0x46607ac <_ChromeMain+0x465b510>
 46607a4: 52800000     	mov	w0, #0x0                ; =0
 46607a8: d65f03c0     	ret
 46607ac: f9400408     	ldr	x8, [x0, #0x8]
 46607b0: b4ffffa8     	cbz	x8, 0x46607a4 <_ChromeMain+0x465b508>
 46607b4: f9435508     	ldr	x8, [x8, #0x6a8]
 46607b8: f100011f     	cmp	x8, #0x0
 46607bc: 1a9f07e0     	cset	w0, ne
 46607c0: d65f03c0     	ret
 46607c4: d102c3ff     	sub	sp, sp, #0xb0
 46607c8: a90857f6     	stp	x22, x21, [sp, #0x80]
 46607cc: a9094ff4     	stp	x20, x19, [sp, #0x90]
 46607d0: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 46607d4: 910283fd     	add	x29, sp, #0xa0
 46607d8: aa0003f3     	mov	x19, x0
 46607dc: f9400408     	ldr	x8, [x0, #0x8]
 46607e0: b4000268     	cbz	x8, 0x466082c <_ChromeMain+0x465b590>
 46607e4: f9435500     	ldr	x0, [x8, #0x6a8]
 46607e8: b4000220     	cbz	x0, 0x466082c <_ChromeMain+0x465b590>
 46607ec: 39416268     	ldrb	w8, [x19, #0x58]
 46607f0: 340001e8     	cbz	w8, 0x466082c <_ChromeMain+0x465b590>
 46607f4: 91010261     	add	x1, x19, #0x40
 46607f8: 9102e262     	add	x2, x19, #0xb8
 46607fc: 97fe9a2f     	bl	0x46070b8 <_ChromeMain+0x4601e1c>
 4660800: 34000160     	cbz	w0, 0x466082c <_ChromeMain+0x465b590>
 4660804: f9400668     	ldr	x8, [x19, #0x8]
 4660808: f9424100     	ldr	x0, [x8, #0x480]
 466080c: b4000100     	cbz	x0, 0x466082c <_ChromeMain+0x465b590>
 4660810: 52800021     	mov	w1, #0x1                ; =1
 4660814: 97ead8d1     	bl	0x4116b58 <_ChromeMain+0x41118bc>
 4660818: 340000a0     	cbz	w0, 0x466082c <_ChromeMain+0x465b590>
 466081c: f9400660     	ldr	x0, [x19, #0x8]
 4660820: 97ff92f8     	bl	0x4645400 <_ChromeMain+0x4640164>
 4660824: f9400660     	ldr	x0, [x19, #0x8]
 4660828: 97ff2e58     	bl	0x462c188 <_ChromeMain+0x4626eec>
 466082c: 910023f4     	add	x20, sp, #0x8
 4660830: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4660834: b801f3ff     	stur	wzr, [sp, #0x1f]
 4660838: f9000fff     	str	xzr, [sp, #0x18]
 466083c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4660840: 3c8283e0     	stur	q0, [sp, #0x28]
 4660844: 3c8383e0     	stur	q0, [sp, #0x38]
 4660848: 3c8483e0     	stur	q0, [sp, #0x48]
 466084c: 3c8583e0     	stur	q0, [sp, #0x58]
 4660850: 7900d3ff     	strh	wzr, [sp, #0x68]
 4660854: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4660858: 91010260     	add	x0, x19, #0x40
 466085c: 910023e1     	add	x1, sp, #0x8
 4660860: 96fe64a0     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 4660864: 9101c280     	add	x0, x20, #0x70
 4660868: d2800001     	mov	x1, #0x0                ; =0
 466086c: 96e71d13     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4660870: 91008280     	add	x0, x20, #0x20
 4660874: 96e71d01     	bl	0x27c78 <_ChromeMain+0x229dc>
 4660878: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 466087c: 36f800a8     	tbz	w8, #0x1f, 0x4660890 <_ChromeMain+0x465b5f4>
 4660880: f94007e0     	ldr	x0, [sp, #0x8]
 4660884: f9400fe8     	ldr	x8, [sp, #0x18]
 4660888: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466088c: 96e6a18b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660890: 39c33e68     	ldrsb	w8, [x19, #0xcf]
 4660894: 37f80368     	tbnz	w8, #0x1f, 0x4660900 <_ChromeMain+0x465b664>
 4660898: 7901727f     	strh	wzr, [x19, #0xb8]
 466089c: 39033e7f     	strb	wzr, [x19, #0xcf]
 46608a0: f9400e74     	ldr	x20, [x19, #0x18]
 46608a4: b50003f4     	cbnz	x20, 0x4660920 <_ChromeMain+0x465b684>
 46608a8: f9400675     	ldr	x21, [x19, #0x8]
 46608ac: b40001b5     	cbz	x21, 0x46608e0 <_ChromeMain+0x465b644>
 46608b0: f9435eb4     	ldr	x20, [x21, #0x6b8]
 46608b4: b4000114     	cbz	x20, 0x46608d4 <_ChromeMain+0x465b638>
 46608b8: 394ce288     	ldrb	w8, [x20, #0x338]
 46608bc: 35000628     	cbnz	w8, 0x4660980 <_ChromeMain+0x465b6e4>
 46608c0: f9400288     	ldr	x8, [x20]
 46608c4: f9405108     	ldr	x8, [x8, #0xa0]
 46608c8: aa1403e0     	mov	x0, x20
 46608cc: 52800001     	mov	w1, #0x0                ; =0
 46608d0: d63f0100     	blr	x8
 46608d4: f94652a0     	ldr	x0, [x21, #0xca0]
 46608d8: f90652bf     	str	xzr, [x21, #0xca0]
 46608dc: b50001a0     	cbnz	x0, 0x4660910 <_ChromeMain+0x465b674>
 46608e0: aa1303e0     	mov	x0, x19
 46608e4: 52800001     	mov	w1, #0x0                ; =0
 46608e8: 94000169     	bl	0x4660e8c <_ChromeMain+0x465bbf0>
 46608ec: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 46608f0: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 46608f4: a94857f6     	ldp	x22, x21, [sp, #0x80]
 46608f8: 9102c3ff     	add	sp, sp, #0xb0
 46608fc: d65f03c0     	ret
 4660900: f9405e68     	ldr	x8, [x19, #0xb8]
 4660904: 7900011f     	strh	wzr, [x8]
 4660908: f900627f     	str	xzr, [x19, #0xc0]
 466090c: 17ffffe5     	b	0x46608a0 <_ChromeMain+0x465b604>
 4660910: 94e556d2     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4660914: 52800301     	mov	w1, #0x18               ; =24
 4660918: 96e6a168     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466091c: 17fffff1     	b	0x46608e0 <_ChromeMain+0x465b644>
 4660920: f9400288     	ldr	x8, [x20]
 4660924: f9402d08     	ldr	x8, [x8, #0x58]
 4660928: aa1403e0     	mov	x0, x20
 466092c: d63f0100     	blr	x8
 4660930: aa0003f5     	mov	x21, x0
 4660934: 94c93356     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 4660938: f10002bf     	cmp	x21, #0x0
 466093c: 1a9f07e8     	cset	w8, ne
 4660940: eb0002bf     	cmp	x21, x0
 4660944: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4660948: 540000c0     	b.eq	0x4660960 <_ChromeMain+0x465b6c4>
 466094c: f94026b5     	ldr	x21, [x21, #0x48]
 4660950: f10002bf     	cmp	x21, #0x0
 4660954: 1a9f07e8     	cset	w8, ne
 4660958: fa4012a4     	ccmp	x21, x0, #0x4, ne
 466095c: 54ffff81     	b.ne	0x466094c <_ChromeMain+0x465b6b0>
 4660960: 34000088     	cbz	w8, 0x4660970 <_ChromeMain+0x465b6d4>
 4660964: aa1403e0     	mov	x0, x20
 4660968: 52800001     	mov	w1, #0x0                ; =0
 466096c: 97eb4949     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 4660970: 91004260     	add	x0, x19, #0x10
 4660974: d2800001     	mov	x1, #0x0                ; =0
 4660978: 9761f8ca     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 466097c: 17ffffcb     	b	0x46608a8 <_ChromeMain+0x465b60c>
 4660980: 390ce29f     	strb	wzr, [x20, #0x338]
 4660984: f941a680     	ldr	x0, [x20, #0x348]
 4660988: 910ca281     	add	x1, x20, #0x328
 466098c: 976aa35d     	bl	0x2109700 <_ChromeMain+0x2104464>
 4660990: f9419688     	ldr	x8, [x20, #0x328]
 4660994: f9401d08     	ldr	x8, [x8, #0x38]
 4660998: 910ca280     	add	x0, x20, #0x328
 466099c: d63f0100     	blr	x8
 46609a0: f941a288     	ldr	x8, [x20, #0x340]
 46609a4: b4fff8e8     	cbz	x8, 0x46608c0 <_ChromeMain+0x465b624>
 46609a8: f9419688     	ldr	x8, [x20, #0x328]
 46609ac: f9402108     	ldr	x8, [x8, #0x40]
 46609b0: 910ca280     	add	x0, x20, #0x328
 46609b4: d63f0100     	blr	x8
 46609b8: f941a288     	ldr	x8, [x20, #0x340]
 46609bc: f9400109     	ldr	x9, [x8]
 46609c0: 7100001f     	cmp	w0, #0x0
 46609c4: 5280020a     	mov	w10, #0x10              ; =16
 46609c8: 5280040b     	mov	w11, #0x20              ; =32
 46609cc: 9a8a116a     	csel	x10, x11, x10, ne
 46609d0: f86a6929     	ldr	x9, [x9, x10]
 46609d4: 910ca281     	add	x1, x20, #0x328
 46609d8: aa0803e0     	mov	x0, x8
 46609dc: d63f0120     	blr	x9
 46609e0: 17ffffb8     	b	0x46608c0 <_ChromeMain+0x465b624>
 46609e4: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 46609e8: a90157f6     	stp	x22, x21, [sp, #0x10]
 46609ec: a9024ff4     	stp	x20, x19, [sp, #0x20]
 46609f0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 46609f4: 9100c3fd     	add	x29, sp, #0x30
 46609f8: aa0103f6     	mov	x22, x1
 46609fc: aa0003f5     	mov	x21, x0
 4660a00: aa0803f3     	mov	x19, x8
 4660a04: f9407c17     	ldr	x23, [x0, #0xf8]
 4660a08: b40000d7     	cbz	x23, 0x4660a20 <_ChromeMain+0x465b784>
 4660a0c: 52800028     	mov	w8, #0x1                ; =1
 4660a10: b82802e8     	ldadd	w8, w8, [x23]
 4660a14: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4660a18: 6b09011f     	cmp	w8, w9
 4660a1c: 540004e0     	b.eq	0x4660ab8 <_ChromeMain+0x465b81c>
 4660a20: f94082b8     	ldr	x24, [x21, #0x100]
 4660a24: 52800300     	mov	w0, #0x18               ; =24
 4660a28: 96e6ba50     	bl	0xf368 <_ChromeMain+0xa0cc>
 4660a2c: b40004a0     	cbz	x0, 0x4660ac0 <_ChromeMain+0x465b824>
 4660a30: aa0003f4     	mov	x20, x0
 4660a34: b100401f     	cmn	x0, #0x10
 4660a38: 54000440     	b.eq	0x4660ac0 <_ChromeMain+0x465b824>
 4660a3c: f9000a96     	str	x22, [x20, #0x10]
 4660a40: f84d0ea8     	ldr	x8, [x21, #0xd0]!
 4660a44: f9000514     	str	x20, [x8, #0x8]
 4660a48: f94002a8     	ldr	x8, [x21]
 4660a4c: f90002b4     	str	x20, [x21]
 4660a50: a9005688     	stp	x8, x21, [x20]
 4660a54: f9400aa8     	ldr	x8, [x21, #0x10]
 4660a58: 91000508     	add	x8, x8, #0x1
 4660a5c: f9000aa8     	str	x8, [x21, #0x10]
 4660a60: 52800900     	mov	w0, #0x48               ; =72
 4660a64: 96e6ba41     	bl	0xf368 <_ChromeMain+0xa0cc>
 4660a68: 52800028     	mov	w8, #0x1                ; =1
 4660a6c: b9000008     	str	w8, [x0]
 4660a70: d0feb968     	adrp	x8, 0x1d8e000 <_ChromeMain+0x1d88d64>
 4660a74: 91224108     	add	x8, x8, #0x890
 4660a78: f0ff9329     	adrp	x9, 0x38c7000 <_ChromeMain+0x38c1d64>
 4660a7c: 91240129     	add	x9, x9, #0x900
 4660a80: a900a408     	stp	x8, x9, [x0, #0x8]
 4660a84: f0003dc8     	adrp	x8, 0x4e1b000 <_ChromeMain+0x4e15d64>
 4660a88: 91370108     	add	x8, x8, #0xdc0
 4660a8c: d0feb969     	adrp	x9, 0x1d8e000 <_ChromeMain+0x1d88d64>
 4660a90: 9123c129     	add	x9, x9, #0x8f0
 4660a94: a901a408     	stp	x8, x9, [x0, #0x18]
 4660a98: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4660a9c: a903d018     	stp	x24, x20, [x0, #0x38]
 4660aa0: f9000260     	str	x0, [x19]
 4660aa4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4660aa8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4660aac: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4660ab0: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4660ab4: d65f03c0     	ret
 4660ab8: d4200000     	brk	#0
 4660abc: d4400000     	hlt	#0
 4660ac0: d4200020     	brk	#0x1
 4660ac4: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4660ac8: a90157f6     	stp	x22, x21, [sp, #0x10]
 4660acc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4660ad0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4660ad4: 9100c3fd     	add	x29, sp, #0x30
 4660ad8: aa0003f3     	mov	x19, x0
 4660adc: 9004f548     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 4660ae0: 913d8108     	add	x8, x8, #0xf60
 4660ae4: f9000008     	str	x8, [x0]
 4660ae8: f9400c14     	ldr	x20, [x0, #0x18]
 4660aec: b5000d14     	cbnz	x20, 0x4660c8c <_ChromeMain+0x465b9f0>
 4660af0: f9400675     	ldr	x21, [x19, #0x8]
 4660af4: b40001b5     	cbz	x21, 0x4660b28 <_ChromeMain+0x465b88c>
 4660af8: f9435eb4     	ldr	x20, [x21, #0x6b8]
 4660afc: b4000114     	cbz	x20, 0x4660b1c <_ChromeMain+0x465b880>
 4660b00: 394ce288     	ldrb	w8, [x20, #0x338]
 4660b04: 350017a8     	cbnz	w8, 0x4660df8 <_ChromeMain+0x465bb5c>
 4660b08: f9400288     	ldr	x8, [x20]
 4660b0c: f9405108     	ldr	x8, [x8, #0xa0]
 4660b10: aa1403e0     	mov	x0, x20
 4660b14: 52800001     	mov	w1, #0x0                ; =0
 4660b18: d63f0100     	blr	x8
 4660b1c: f94652a0     	ldr	x0, [x21, #0xca0]
 4660b20: f90652bf     	str	xzr, [x21, #0xca0]
 4660b24: b5000ac0     	cbnz	x0, 0x4660c7c <_ChromeMain+0x465b9e0>
 4660b28: 91034275     	add	x21, x19, #0xd0
 4660b2c: 91034260     	add	x0, x19, #0xd0
 4660b30: 97802403     	bl	0x2669b3c <_ChromeMain+0x26648a0>
 4660b34: f9409260     	ldr	x0, [x19, #0x120]
 4660b38: b5000da0     	cbnz	x0, 0x4660cec <_ChromeMain+0x465ba50>
 4660b3c: f9408e68     	ldr	x8, [x19, #0x118]
 4660b40: b5001208     	cbnz	x8, 0x4660d80 <_ChromeMain+0x465bae4>
 4660b44: 3943a268     	ldrb	w8, [x19, #0xe8]
 4660b48: 350018a8     	cbnz	w8, 0x4660e5c <_ChromeMain+0x465bbc0>
 4660b4c: f900827f     	str	xzr, [x19, #0x100]
 4660b50: f9407e68     	ldr	x8, [x19, #0xf8]
 4660b54: b4000168     	cbz	x8, 0x4660b80 <_ChromeMain+0x465b8e4>
 4660b58: 52800029     	mov	w9, #0x1                ; =1
 4660b5c: 19004109     	stlurb	w9, [x8, #0x4]
 4660b60: f9407e60     	ldr	x0, [x19, #0xf8]
 4660b64: b40000e0     	cbz	x0, 0x4660b80 <_ChromeMain+0x465b8e4>
 4660b68: 12800008     	mov	w8, #-0x1               ; =-1
 4660b6c: b8e80008     	ldaddal	w8, w8, [x0]
 4660b70: 7100051f     	cmp	w8, #0x1
 4660b74: 54000061     	b.ne	0x4660b80 <_ChromeMain+0x465b8e4>
 4660b78: 52800101     	mov	w1, #0x8                ; =8
 4660b7c: 96e6a0cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660b80: f9407a60     	ldr	x0, [x19, #0xf0]
 4660b84: b5000600     	cbnz	x0, 0x4660c44 <_ChromeMain+0x465b9a8>
 4660b88: f9407268     	ldr	x8, [x19, #0xe0]
 4660b8c: b5000c08     	cbnz	x8, 0x4660d0c <_ChromeMain+0x465ba70>
 4660b90: 39c33e68     	ldrsb	w8, [x19, #0xcf]
 4660b94: 36f800a8     	tbz	w8, #0x1f, 0x4660ba8 <_ChromeMain+0x465b90c>
 4660b98: f9405e60     	ldr	x0, [x19, #0xb8]
 4660b9c: f9406668     	ldr	x8, [x19, #0xc8]
 4660ba0: d37ff901     	lsl	x1, x8, #1
 4660ba4: 96e6a0c5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660ba8: 9102c260     	add	x0, x19, #0xb0
 4660bac: d2800001     	mov	x1, #0x0                ; =0
 4660bb0: 96e71c42     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4660bb4: 91018260     	add	x0, x19, #0x60
 4660bb8: 96e71c30     	bl	0x27c78 <_ChromeMain+0x229dc>
 4660bbc: 39c15e68     	ldrsb	w8, [x19, #0x57]
 4660bc0: 36f800a8     	tbz	w8, #0x1f, 0x4660bd4 <_ChromeMain+0x465b938>
 4660bc4: f9402260     	ldr	x0, [x19, #0x40]
 4660bc8: f9402a68     	ldr	x8, [x19, #0x50]
 4660bcc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4660bd0: 96e6a0ba     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660bd4: 9004e7a8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4660bd8: 9127e108     	add	x8, x8, #0x9f8
 4660bdc: f9000a68     	str	x8, [x19, #0x10]
 4660be0: 9100c260     	add	x0, x19, #0x30
 4660be4: 973bc1a9     	bl	0x1551288 <_ChromeMain+0x154bfec>
 4660be8: f9401260     	ldr	x0, [x19, #0x20]
 4660bec: b50003a0     	cbnz	x0, 0x4660c60 <_ChromeMain+0x465b9c4>
 4660bf0: f9400e60     	ldr	x0, [x19, #0x18]
 4660bf4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4660bf8: d0052a94     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4660bfc: f9404689     	ldr	x9, [x20, #0x88]
 4660c00: eb09011f     	cmp	x8, x9
 4660c04: 54000041     	b.ne	0x4660c0c <_ChromeMain+0x465b970>
 4660c08: 96e7078d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4660c0c: f9000e7f     	str	xzr, [x19, #0x18]
 4660c10: f9400660     	ldr	x0, [x19, #0x8]
 4660c14: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4660c18: f9404689     	ldr	x9, [x20, #0x88]
 4660c1c: eb09011f     	cmp	x8, x9
 4660c20: 54000041     	b.ne	0x4660c28 <_ChromeMain+0x465b98c>
 4660c24: 96e70786     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4660c28: f900067f     	str	xzr, [x19, #0x8]
 4660c2c: aa1303e0     	mov	x0, x19
 4660c30: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4660c34: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4660c38: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4660c3c: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4660c40: d65f03c0     	ret
 4660c44: 12800008     	mov	w8, #-0x1               ; =-1
 4660c48: b8e80008     	ldaddal	w8, w8, [x0]
 4660c4c: 7100051f     	cmp	w8, #0x1
 4660c50: 54fff9c1     	b.ne	0x4660b88 <_ChromeMain+0x465b8ec>
 4660c54: f9400808     	ldr	x8, [x0, #0x10]
 4660c58: d63f0100     	blr	x8
 4660c5c: 17ffffcb     	b	0x4660b88 <_ChromeMain+0x465b8ec>
 4660c60: 12800008     	mov	w8, #-0x1               ; =-1
 4660c64: b8e80008     	ldaddal	w8, w8, [x0]
 4660c68: 7100051f     	cmp	w8, #0x1
 4660c6c: 54fffc21     	b.ne	0x4660bf0 <_ChromeMain+0x465b954>
 4660c70: f9400808     	ldr	x8, [x0, #0x10]
 4660c74: d63f0100     	blr	x8
 4660c78: 17ffffde     	b	0x4660bf0 <_ChromeMain+0x465b954>
 4660c7c: 94e555f7     	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 4660c80: 52800301     	mov	w1, #0x18               ; =24
 4660c84: 96e6a08d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660c88: 17ffffa8     	b	0x4660b28 <_ChromeMain+0x465b88c>
 4660c8c: f9400288     	ldr	x8, [x20]
 4660c90: f9402d08     	ldr	x8, [x8, #0x58]
 4660c94: aa1403e0     	mov	x0, x20
 4660c98: d63f0100     	blr	x8
 4660c9c: aa0003f5     	mov	x21, x0
 4660ca0: 94c9327b     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 4660ca4: f10002bf     	cmp	x21, #0x0
 4660ca8: 1a9f07e8     	cset	w8, ne
 4660cac: eb0002bf     	cmp	x21, x0
 4660cb0: fa401aa4     	ccmp	x21, #0x0, #0x4, ne
 4660cb4: 540000c0     	b.eq	0x4660ccc <_ChromeMain+0x465ba30>
 4660cb8: f94026b5     	ldr	x21, [x21, #0x48]
 4660cbc: f10002bf     	cmp	x21, #0x0
 4660cc0: 1a9f07e8     	cset	w8, ne
 4660cc4: fa4012a4     	ccmp	x21, x0, #0x4, ne
 4660cc8: 54ffff81     	b.ne	0x4660cb8 <_ChromeMain+0x465ba1c>
 4660ccc: 34000088     	cbz	w8, 0x4660cdc <_ChromeMain+0x465ba40>
 4660cd0: aa1403e0     	mov	x0, x20
 4660cd4: 52800001     	mov	w1, #0x0                ; =0
 4660cd8: 97eb486e     	bl	0x4132e90 <_ChromeMain+0x412dbf4>
 4660cdc: 91004260     	add	x0, x19, #0x10
 4660ce0: d2800001     	mov	x1, #0x0                ; =0
 4660ce4: 9761f7ef     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 4660ce8: 17ffff82     	b	0x4660af0 <_ChromeMain+0x465b854>
 4660cec: f9409668     	ldr	x8, [x19, #0x128]
 4660cf0: d37df109     	lsl	x9, x8, #3
 4660cf4: b5000ba9     	cbnz	x9, 0x4660e68 <_ChromeMain+0x465bbcc>
 4660cf8: f900967f     	str	xzr, [x19, #0x128]
 4660cfc: f9409a68     	ldr	x8, [x19, #0x130]
 4660d00: d37df101     	lsl	x1, x8, #3
 4660d04: 96e6a06d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660d08: 17ffff8d     	b	0x4660b3c <_ChromeMain+0x465b8a0>
 4660d0c: a94d5268     	ldp	x8, x20, [x19, #0xd0]
 4660d10: f9400508     	ldr	x8, [x8, #0x8]
 4660d14: f9400289     	ldr	x9, [x20]
 4660d18: f9000528     	str	x8, [x9, #0x8]
 4660d1c: f9400289     	ldr	x9, [x20]
 4660d20: f9000109     	str	x9, [x8]
 4660d24: f900727f     	str	xzr, [x19, #0xe0]
 4660d28: eb15029f     	cmp	x20, x21
 4660d2c: 54fff320     	b.eq	0x4660b90 <_ChromeMain+0x465b8f4>
 4660d30: 12800016     	mov	w22, #-0x1              ; =-1
 4660d34: b1004288     	adds	x8, x20, #0x10
 4660d38: 54000a80     	b.eq	0x4660e88 <_ChromeMain+0x465bbec>
 4660d3c: f9400697     	ldr	x23, [x20, #0x8]
 4660d40: f9400100     	ldr	x0, [x8]
 4660d44: b5000120     	cbnz	x0, 0x4660d68 <_ChromeMain+0x465bacc>
 4660d48: b4000a14     	cbz	x20, 0x4660e88 <_ChromeMain+0x465bbec>
 4660d4c: aa1403e0     	mov	x0, x20
 4660d50: 52800301     	mov	w1, #0x18               ; =24
 4660d54: 96e6a059     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660d58: aa1703f4     	mov	x20, x23
 4660d5c: eb1502ff     	cmp	x23, x21
 4660d60: 54fffea1     	b.ne	0x4660d34 <_ChromeMain+0x465ba98>
 4660d64: 17ffff8b     	b	0x4660b90 <_ChromeMain+0x465b8f4>
 4660d68: b8f60008     	ldaddal	w22, w8, [x0]
 4660d6c: 7100051f     	cmp	w8, #0x1
 4660d70: 54fffec1     	b.ne	0x4660d48 <_ChromeMain+0x465baac>
 4660d74: f9400808     	ldr	x8, [x0, #0x10]
 4660d78: d63f0100     	blr	x8
 4660d7c: 17fffff3     	b	0x4660d48 <_ChromeMain+0x465baac>
 4660d80: 91042276     	add	x22, x19, #0x108
 4660d84: a950d268     	ldp	x8, x20, [x19, #0x108]
 4660d88: f9400508     	ldr	x8, [x8, #0x8]
 4660d8c: f9400289     	ldr	x9, [x20]
 4660d90: f9000528     	str	x8, [x9, #0x8]
 4660d94: f9400289     	ldr	x9, [x20]
 4660d98: f9000109     	str	x9, [x8]
 4660d9c: f9008e7f     	str	xzr, [x19, #0x118]
 4660da0: eb16029f     	cmp	x20, x22
 4660da4: 54ffed00     	b.eq	0x4660b44 <_ChromeMain+0x465b8a8>
 4660da8: 12800017     	mov	w23, #-0x1              ; =-1
 4660dac: b1004288     	adds	x8, x20, #0x10
 4660db0: 540006c0     	b.eq	0x4660e88 <_ChromeMain+0x465bbec>
 4660db4: f9400698     	ldr	x24, [x20, #0x8]
 4660db8: f9400100     	ldr	x0, [x8]
 4660dbc: b5000120     	cbnz	x0, 0x4660de0 <_ChromeMain+0x465bb44>
 4660dc0: b4000654     	cbz	x20, 0x4660e88 <_ChromeMain+0x465bbec>
 4660dc4: aa1403e0     	mov	x0, x20
 4660dc8: 52800301     	mov	w1, #0x18               ; =24
 4660dcc: 96e6a03b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4660dd0: aa1803f4     	mov	x20, x24
 4660dd4: eb16031f     	cmp	x24, x22
 4660dd8: 54fffea1     	b.ne	0x4660dac <_ChromeMain+0x465bb10>
 4660ddc: 17ffff5a     	b	0x4660b44 <_ChromeMain+0x465b8a8>
 4660de0: b8f70008     	ldaddal	w23, w8, [x0]
 4660de4: 7100051f     	cmp	w8, #0x1
 4660de8: 54fffec1     	b.ne	0x4660dc0 <_ChromeMain+0x465bb24>
 4660dec: f9400808     	ldr	x8, [x0, #0x10]
 4660df0: d63f0100     	blr	x8
 4660df4: 17fffff3     	b	0x4660dc0 <_ChromeMain+0x465bb24>
 4660df8: 390ce29f     	strb	wzr, [x20, #0x338]
 4660dfc: f941a680     	ldr	x0, [x20, #0x348]
 4660e00: 910ca281     	add	x1, x20, #0x328
 4660e04: 976aa23f     	bl	0x2109700 <_ChromeMain+0x2104464>
 4660e08: f9419688     	ldr	x8, [x20, #0x328]
 4660e0c: f9401d08     	ldr	x8, [x8, #0x38]
 4660e10: 910ca280     	add	x0, x20, #0x328
 4660e14: d63f0100     	blr	x8
 4660e18: f941a288     	ldr	x8, [x20, #0x340]
 4660e1c: b4ffe768     	cbz	x8, 0x4660b08 <_ChromeMain+0x465b86c>
 4660e20: f9419688     	ldr	x8, [x20, #0x328]
 4660e24: f9402108     	ldr	x8, [x8, #0x40]
 4660e28: 910ca280     	add	x0, x20, #0x328
 4660e2c: d63f0100     	blr	x8
 4660e30: f941a288     	ldr	x8, [x20, #0x340]
 4660e34: f9400109     	ldr	x9, [x8]
 4660e38: 7100001f     	cmp	w0, #0x0
 4660e3c: 5280020a     	mov	w10, #0x10              ; =16
 4660e40: 5280040b     	mov	w11, #0x20              ; =32
 4660e44: 9a8a116a     	csel	x10, x11, x10, ne
 4660e48: f86a6929     	ldr	x9, [x9, x10]
 4660e4c: 910ca281     	add	x1, x20, #0x328
 4660e50: aa0803e0     	mov	x0, x8
 4660e54: d63f0120     	blr	x9
 4660e58: 17ffff2c     	b	0x4660b08 <_ChromeMain+0x465b86c>
 4660e5c: d4200000     	brk	#0
 4660e60: d4400000     	hlt	#0
 4660e64: d4200020     	brk	#0x1
 4660e68: cb080fe8     	neg	x8, x8, lsl #3
 4660e6c: 8b000129     	add	x9, x9, x0
 4660e70: d1002129     	sub	x9, x9, #0x8
 4660e74: b40000a9     	cbz	x9, 0x4660e88 <_ChromeMain+0x465bbec>
 4660e78: d1002129     	sub	x9, x9, #0x8
 4660e7c: 91002108     	add	x8, x8, #0x8
 4660e80: b4fff3c8     	cbz	x8, 0x4660cf8 <_ChromeMain+0x465ba5c>
 4660e84: 17fffffc     	b	0x4660e74 <_ChromeMain+0x465bbd8>
 4660e88: d4200020     	brk	#0x1
 4660e8c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4660e90: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4660e94: 910043fd     	add	x29, sp, #0x10
 4660e98: f9400408     	ldr	x8, [x0, #0x8]
 4660e9c: b4000468     	cbz	x8, 0x4660f28 <_ChromeMain+0x465bc8c>
 4660ea0: aa0003f3     	mov	x19, x0
 4660ea4: f9435500     	ldr	x0, [x8, #0x6a8]
 4660ea8: b4000400     	cbz	x0, 0x4660f28 <_ChromeMain+0x465bc8c>
 4660eac: 35000081     	cbnz	w1, 0x4660ebc <_ChromeMain+0x465bc20>
 4660eb0: d2800001     	mov	x1, #0x0                ; =0
 4660eb4: d2800002     	mov	x2, #0x0                ; =0
 4660eb8: 14000008     	b	0x4660ed8 <_ChromeMain+0x465bc3c>
 4660ebc: 39558008     	ldrb	w8, [x0, #0x560]
 4660ec0: 7100011f     	cmp	w8, #0x0
 4660ec4: 52806d08     	mov	w8, #0x368              ; =872
 4660ec8: 5280ab09     	mov	w9, #0x558              ; =1368
 4660ecc: 9a881128     	csel	x8, x9, x8, ne
 4660ed0: f8686801     	ldr	x1, [x0, x8]
 4660ed4: 52800022     	mov	w2, #0x1                ; =1
 4660ed8: 97fe9712     	bl	0x4606b20 <_ChromeMain+0x4601884>
 4660edc: f9400673     	ldr	x19, [x19, #0x8]
 4660ee0: 3960e668     	ldrb	w8, [x19, #0x839]
 4660ee4: 34000228     	cbz	w8, 0x4660f28 <_ChromeMain+0x465bc8c>
 4660ee8: 3920e67f     	strb	wzr, [x19, #0x839]
 4660eec: aa1303e0     	mov	x0, x19
 4660ef0: 97ff9144     	bl	0x4645400 <_ChromeMain+0x4640164>
 4660ef4: f942e260     	ldr	x0, [x19, #0x5c0]
 4660ef8: b40000a0     	cbz	x0, 0x4660f0c <_ChromeMain+0x465bc70>
 4660efc: 52800001     	mov	w1, #0x0                ; =0
 4660f00: 96ff3d5d     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4660f04: f942e260     	ldr	x0, [x19, #0x5c0]
 4660f08: 96fd009d     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4660f0c: aa1303e0     	mov	x0, x19
 4660f10: 52800001     	mov	w1, #0x0                ; =0
 4660f14: 96ff3d58     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4660f18: aa1303e0     	mov	x0, x19
 4660f1c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4660f20: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4660f24: 16fd0096     	b	0x5a117c <_ChromeMain+0x59bee0>
 4660f28: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4660f2c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4660f30: d65f03c0     	ret
