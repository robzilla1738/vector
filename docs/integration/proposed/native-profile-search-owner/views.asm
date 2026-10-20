
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45a1f04: d10343ff     	sub	sp, sp, #0xd0
 45a1f08: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a1f0c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a1f10: 910303fd     	add	x29, sp, #0xc0
 45a1f14: f941a013     	ldr	x19, [x0, #0x340]
 45a1f18: b40005b3     	cbz	x19, 0x45a1fcc <_ChromeMain+0x459cd30>
 45a1f1c: 900529a0     	adrp	x0, 0xead5000 <dyld_stub_binder+0xead5000>
 45a1f20: 911be000     	add	x0, x0, #0x6f8
 45a1f24: d100a3b4     	sub	x20, x29, #0x28
 45a1f28: d100a3a8     	sub	x8, x29, #0x28
 45a1f2c: 528000a1     	mov	w1, #0x5                ; =5
 45a1f30: 97032309     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 45a1f34: 389ef3a8     	ldursb	x8, [x29, #-0x11]
 45a1f38: a97daba9     	ldp	x9, x10, [x29, #-0x28]
 45a1f3c: f100011f     	cmp	x8, #0x0
 45a1f40: 9a944121     	csel	x1, x9, x20, mi
 45a1f44: 7100011f     	cmp	w8, #0x0
 45a1f48: 9a884142     	csel	x2, x10, x8, mi
 45a1f4c: 910083f4     	add	x20, sp, #0x20
 45a1f50: 910083e0     	add	x0, sp, #0x20
 45a1f54: 96f738a0     	bl	0x3701d4 <_ChromeMain+0x36af38>
 45a1f58: 38def3a8     	ldursb	w8, [x29, #-0x11]
 45a1f5c: 36f800a8     	tbz	w8, #0x1f, 0x45a1f70 <_ChromeMain+0x459ccd4>
 45a1f60: f85d83a0     	ldur	x0, [x29, #-0x28]
 45a1f64: f85e83a8     	ldur	x8, [x29, #-0x18]
 45a1f68: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a1f6c: 96e99bd3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1f70: 9004c940     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a1f74: 911f2000     	add	x0, x0, #0x7c8
 45a1f78: 9004c941     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a1f7c: 911de021     	add	x1, x1, #0x778
 45a1f80: 910003e8     	mov	x8, sp
 45a1f84: 52804bc2     	mov	w2, #0x25e              ; =606
 45a1f88: 96eabb3e     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a1f8c: 910083e1     	add	x1, sp, #0x20
 45a1f90: 910003e3     	mov	x3, sp
 45a1f94: aa1303e0     	mov	x0, x19
 45a1f98: 52800022     	mov	w2, #0x1                ; =1
 45a1f9c: 97dbbd7e     	bl	0x3c91594 <_ChromeMain+0x3c8c2f8>
 45a1fa0: 9101c280     	add	x0, x20, #0x70
 45a1fa4: d2800001     	mov	x1, #0x0                ; =0
 45a1fa8: 96ea1744     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a1fac: 91008280     	add	x0, x20, #0x20
 45a1fb0: 96ea1732     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a1fb4: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 45a1fb8: 36f800a8     	tbz	w8, #0x1f, 0x45a1fcc <_ChromeMain+0x459cd30>
 45a1fbc: f94013e0     	ldr	x0, [sp, #0x20]
 45a1fc0: f9401be8     	ldr	x8, [sp, #0x30]
 45a1fc4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a1fc8: 96e99bbc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a1fcc: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a1fd0: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a1fd4: 910343ff     	add	sp, sp, #0xd0
 45a1fd8: d65f03c0     	ret
 45a1fdc: aa0003e8     	mov	x8, x0
 45a1fe0: 52800000     	mov	w0, #0x0                ; =0
 45a1fe4: b4000161     	cbz	x1, 0x45a2010 <_ChromeMain+0x459cd74>
 45a1fe8: f9401d08     	ldr	x8, [x8, #0x38]
 45a1fec: b4000128     	cbz	x8, 0x45a2010 <_ChromeMain+0x459cd74>
 45a1ff0: f9402029     	ldr	x9, [x1, #0x40]
 45a1ff4: b40000c9     	cbz	x9, 0x45a200c <_ChromeMain+0x459cd70>
 45a1ff8: f9429d08     	ldr	x8, [x8, #0x538]
 45a1ffc: f9403508     	ldr	x8, [x8, #0x68]
 45a2000: eb08013f     	cmp	x9, x8
 45a2004: 1a9f17e0     	cset	w0, eq
 45a2008: d65f03c0     	ret
 45a200c: 52800000     	mov	w0, #0x0                ; =0
 45a2010: d65f03c0     	ret
 45a2014: 39438808     	ldrb	w8, [x0, #0xe2]
 45a2018: 340000a8     	cbz	w8, 0x45a202c <_ChromeMain+0x459cd90>
 45a201c: f9403008     	ldr	x8, [x0, #0x60]
 45a2020: b4000088     	cbz	x8, 0x45a2030 <_ChromeMain+0x459cd94>
 45a2024: 3940a108     	ldrb	w8, [x8, #0x28]
 45a2028: 36000048     	tbz	w8, #0x0, 0x45a2030 <_ChromeMain+0x459cd94>
 45a202c: d65f03c0     	ret
 45a2030: a9412468     	ldp	x8, x9, [x3, #0x10]
 45a2034: eb09011f     	cmp	x8, x9
 45a2038: 54000040     	b.eq	0x45a2040 <_ChromeMain+0x459cda4>
 45a203c: 17fffd0e     	b	0x45a1474 <_ChromeMain+0x459c1d8>
 45a2040: b9400048     	ldr	w8, [x2]
 45a2044: 7100051f     	cmp	w8, #0x1
 45a2048: 54ffff21     	b.ne	0x45a202c <_ChromeMain+0x459cd90>
 45a204c: 17fffffc     	b	0x45a203c <_ChromeMain+0x459cda0>
 45a2050: 39436808     	ldrb	w8, [x0, #0xda]
 45a2054: 340000a8     	cbz	w8, 0x45a2068 <_ChromeMain+0x459cdcc>
 45a2058: f9402c08     	ldr	x8, [x0, #0x58]
 45a205c: b4000088     	cbz	x8, 0x45a206c <_ChromeMain+0x459cdd0>
 45a2060: 3940a108     	ldrb	w8, [x8, #0x28]
 45a2064: 36000048     	tbz	w8, #0x0, 0x45a206c <_ChromeMain+0x459cdd0>
 45a2068: d65f03c0     	ret
 45a206c: a9412468     	ldp	x8, x9, [x3, #0x10]
 45a2070: eb09011f     	cmp	x8, x9
 45a2074: 54000060     	b.eq	0x45a2080 <_ChromeMain+0x459cde4>
 45a2078: d1002000     	sub	x0, x0, #0x8
 45a207c: 17fffcfe     	b	0x45a1474 <_ChromeMain+0x459c1d8>
 45a2080: b9400048     	ldr	w8, [x2]
 45a2084: 7100051f     	cmp	w8, #0x1
 45a2088: 54ffff01     	b.ne	0x45a2068 <_ChromeMain+0x459cdcc>
 45a208c: 17fffffb     	b	0x45a2078 <_ChromeMain+0x459cddc>
 45a2090: 140008df     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2094: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2098: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a209c: 910043fd     	add	x29, sp, #0x10
 45a20a0: aa0003f3     	mov	x19, x0
 45a20a4: 940008da     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a20a8: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a20ac: 91120108     	add	x8, x8, #0x480
 45a20b0: f8bfc100     	ldapr	x0, [x8]
 45a20b4: b40000a0     	cbz	x0, 0x45a20c8 <_ChromeMain+0x459ce2c>
 45a20b8: aa1303e1     	mov	x1, x19
 45a20bc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a20c0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a20c4: 1726ea97     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a20c8: 97f4c58c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a20cc: 17fffffb     	b	0x45a20b8 <_ChromeMain+0x459ce1c>
 45a20d0: 17773cdb     	b	0x237143c <_ChromeMain+0x236c1a0>
 45a20d4: d10343ff     	sub	sp, sp, #0xd0
 45a20d8: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45a20dc: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a20e0: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a20e4: 910303fd     	add	x29, sp, #0xc0
 45a20e8: aa0103f4     	mov	x20, x1
 45a20ec: aa0003f3     	mov	x19, x0
 45a20f0: 9100a3f5     	add	x21, sp, #0x28
 45a20f4: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a20f8: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a20fc: f9001fff     	str	xzr, [sp, #0x38]
 45a2100: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a2104: 3c8483e0     	stur	q0, [sp, #0x48]
 45a2108: 3c8583e0     	stur	q0, [sp, #0x58]
 45a210c: 3c8683e0     	stur	q0, [sp, #0x68]
 45a2110: 3c8783e0     	stur	q0, [sp, #0x78]
 45a2114: 790113ff     	strh	wzr, [sp, #0x88]
 45a2118: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a211c: f004c920     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2120: 911f6800     	add	x0, x0, #0x7da
 45a2124: f004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2128: 911de021     	add	x1, x1, #0x778
 45a212c: 910023e8     	add	x8, sp, #0x8
 45a2130: 52802902     	mov	w2, #0x148              ; =328
 45a2134: 96eabad3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a2138: 9100a3e1     	add	x1, sp, #0x28
 45a213c: 910023e2     	add	x2, sp, #0x8
 45a2140: aa1303e0     	mov	x0, x19
 45a2144: 9792f8f0     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a2148: eb00029f     	cmp	x20, x0
 45a214c: 54000220     	b.eq	0x45a2190 <_ChromeMain+0x459cef4>
 45a2150: 9101c2a0     	add	x0, x21, #0x70
 45a2154: d2800001     	mov	x1, #0x0                ; =0
 45a2158: 96ea16d8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a215c: 910082a0     	add	x0, x21, #0x20
 45a2160: 96ea16c6     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a2164: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a2168: 36f800a8     	tbz	w8, #0x1f, 0x45a217c <_ChromeMain+0x459cee0>
 45a216c: f94017e0     	ldr	x0, [sp, #0x28]
 45a2170: f9401fe8     	ldr	x8, [sp, #0x38]
 45a2174: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a2178: 96e99b50     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a217c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a2180: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a2184: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a2188: 910343ff     	add	sp, sp, #0xd0
 45a218c: d65f03c0     	ret
 45a2190: f9428e74     	ldr	x20, [x19, #0x518]
 45a2194: 9101c2a0     	add	x0, x21, #0x70
 45a2198: d2800001     	mov	x1, #0x0                ; =0
 45a219c: 96ea16c7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a21a0: 910082a0     	add	x0, x21, #0x20
 45a21a4: 96ea16b5     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a21a8: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a21ac: 37f802e8     	tbnz	w8, #0x1f, 0x45a2208 <_ChromeMain+0x459cf6c>
 45a21b0: b4fffe74     	cbz	x20, 0x45a217c <_ChromeMain+0x459cee0>
 45a21b4: f9428e74     	ldr	x20, [x19, #0x518]
 45a21b8: b4000354     	cbz	x20, 0x45a2220 <_ChromeMain+0x459cf84>
 45a21bc: 52800028     	mov	w8, #0x1                ; =1
 45a21c0: b8280288     	ldadd	w8, w8, [x20]
 45a21c4: 7100011f     	cmp	w8, #0x0
 45a21c8: 5400032d     	b.le	0x45a222c <_ChromeMain+0x459cf90>
 45a21cc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a21d0: 6b09011f     	cmp	w8, w9
 45a21d4: 54000320     	b.eq	0x45a2238 <_ChromeMain+0x459cf9c>
 45a21d8: f9428e68     	ldr	x8, [x19, #0x518]
 45a21dc: f9400508     	ldr	x8, [x8, #0x8]
 45a21e0: aa1403e0     	mov	x0, x20
 45a21e4: d63f0100     	blr	x8
 45a21e8: 12800008     	mov	w8, #-0x1               ; =-1
 45a21ec: b8e80288     	ldaddal	w8, w8, [x20]
 45a21f0: 7100051f     	cmp	w8, #0x1
 45a21f4: 54fffc41     	b.ne	0x45a217c <_ChromeMain+0x459cee0>
 45a21f8: f9400a88     	ldr	x8, [x20, #0x10]
 45a21fc: aa1403e0     	mov	x0, x20
 45a2200: d63f0100     	blr	x8
 45a2204: 17ffffde     	b	0x45a217c <_ChromeMain+0x459cee0>
 45a2208: f94017e0     	ldr	x0, [sp, #0x28]
 45a220c: f9401fe8     	ldr	x8, [sp, #0x38]
 45a2210: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a2214: 96e99b29     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a2218: b4fffb34     	cbz	x20, 0x45a217c <_ChromeMain+0x459cee0>
 45a221c: 17ffffe6     	b	0x45a21b4 <_ChromeMain+0x459cf18>
 45a2220: d4200000     	brk	#0
 45a2224: d4400000     	hlt	#0
 45a2228: d4200020     	brk	#0x1
 45a222c: d4200000     	brk	#0
 45a2230: d4400000     	hlt	#0
 45a2234: d4200020     	brk	#0x1
 45a2238: d4200000     	brk	#0
 45a223c: d4400000     	hlt	#0
 45a2240: d4200020     	brk	#0x1
 45a2244: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a2248: 910003fd     	mov	x29, sp
 45a224c: 3948a448     	ldrb	w8, [x2, #0x229]
 45a2250: 37000108     	tbnz	w8, #0x0, 0x45a2270 <_ChromeMain+0x459cfd4>
 45a2254: f9428408     	ldr	x8, [x0, #0x508]
 45a2258: b4000108     	cbz	x8, 0x45a2278 <_ChromeMain+0x459cfdc>
 45a225c: f9400500     	ldr	x0, [x8, #0x8]
 45a2260: f9400008     	ldr	x8, [x0]
 45a2264: f9400d08     	ldr	x8, [x8, #0x18]
 45a2268: d63f0100     	blr	x8
 45a226c: 14000003     	b	0x45a2278 <_ChromeMain+0x459cfdc>
 45a2270: aa0203e1     	mov	x1, x2
 45a2274: 940008a5     	bl	0x45a4508 <_ChromeMain+0x459f26c>
 45a2278: 52800020     	mov	w0, #0x1                ; =1
 45a227c: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a2280: d65f03c0     	ret
 45a2284: d10343ff     	sub	sp, sp, #0xd0
 45a2288: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45a228c: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a2290: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a2294: 910303fd     	add	x29, sp, #0xc0
 45a2298: aa0203f4     	mov	x20, x2
 45a229c: aa0103f5     	mov	x21, x1
 45a22a0: aa0003f3     	mov	x19, x0
 45a22a4: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a22a8: 9100a3f6     	add	x22, sp, #0x28
 45a22ac: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a22b0: f9001fff     	str	xzr, [sp, #0x38]
 45a22b4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a22b8: 3c8483e0     	stur	q0, [sp, #0x48]
 45a22bc: 3c8583e0     	stur	q0, [sp, #0x58]
 45a22c0: 3c8683e0     	stur	q0, [sp, #0x68]
 45a22c4: 3c8783e0     	stur	q0, [sp, #0x78]
 45a22c8: 790113ff     	strh	wzr, [sp, #0x88]
 45a22cc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a22d0: f004c920     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a22d4: 911b4c00     	add	x0, x0, #0x6d3
 45a22d8: f004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a22dc: 911de021     	add	x1, x1, #0x778
 45a22e0: 910023e8     	add	x8, sp, #0x8
 45a22e4: 52802ba2     	mov	w2, #0x15d              ; =349
 45a22e8: 96eaba66     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a22ec: 9100a3e1     	add	x1, sp, #0x28
 45a22f0: 910023e2     	add	x2, sp, #0x8
 45a22f4: aa1303e0     	mov	x0, x19
 45a22f8: 9792f883     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a22fc: eb0002bf     	cmp	x21, x0
 45a2300: 54000240     	b.eq	0x45a2348 <_ChromeMain+0x459d0ac>
 45a2304: 9101c2c0     	add	x0, x22, #0x70
 45a2308: d2800001     	mov	x1, #0x0                ; =0
 45a230c: 96ea166b     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a2310: 910082c0     	add	x0, x22, #0x20
 45a2314: 96ea1659     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a2318: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a231c: 36f800a8     	tbz	w8, #0x1f, 0x45a2330 <_ChromeMain+0x459d094>
 45a2320: f94017e0     	ldr	x0, [sp, #0x28]
 45a2324: f9401fe8     	ldr	x8, [sp, #0x38]
 45a2328: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a232c: 96e99ae3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a2330: 52800020     	mov	w0, #0x1                ; =1
 45a2334: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a2338: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a233c: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a2340: 910343ff     	add	sp, sp, #0xd0
 45a2344: d65f03c0     	ret
 45a2348: b9402a95     	ldr	w21, [x20, #0x28]
 45a234c: 9101c2c0     	add	x0, x22, #0x70
 45a2350: d2800001     	mov	x1, #0x0                ; =0
 45a2354: 96ea1659     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a2358: 910082c0     	add	x0, x22, #0x20
 45a235c: 96ea1647     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a2360: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a2364: 36f800a8     	tbz	w8, #0x1f, 0x45a2378 <_ChromeMain+0x459d0dc>
 45a2368: f94017e0     	ldr	x0, [sp, #0x28]
 45a236c: f9401fe8     	ldr	x8, [sp, #0x38]
 45a2370: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a2374: 96e99ad1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a2378: 71001ebf     	cmp	w21, #0x7
 45a237c: 54fffda1     	b.ne	0x45a2330 <_ChromeMain+0x459d094>
 45a2380: 7940aa95     	ldrh	w21, [x20, #0x54]
 45a2384: b9403680     	ldr	w0, [x20, #0x34]
 45a2388: 94553729     	bl	0x5af002c <_ChromeMain+0x5aead90>
 45a238c: 52800248     	mov	w8, #0x12               ; =18
 45a2390: 6a20011f     	bics	wzr, w8, w0
 45a2394: 52800828     	mov	w8, #0x41               ; =65
 45a2398: 7a4802a0     	ccmp	w21, w8, #0x0, eq
 45a239c: 54fffca1     	b.ne	0x45a2330 <_ChromeMain+0x459d094>
 45a23a0: f9429274     	ldr	x20, [x19, #0x520]
 45a23a4: b4000214     	cbz	x20, 0x45a23e4 <_ChromeMain+0x459d148>
 45a23a8: 52800028     	mov	w8, #0x1                ; =1
 45a23ac: b8280288     	ldadd	w8, w8, [x20]
 45a23b0: 7100011f     	cmp	w8, #0x0
 45a23b4: 5400024d     	b.le	0x45a23fc <_ChromeMain+0x459d160>
 45a23b8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a23bc: 6b09011f     	cmp	w8, w9
 45a23c0: 54000240     	b.eq	0x45a2408 <_ChromeMain+0x459d16c>
 45a23c4: f9429268     	ldr	x8, [x19, #0x520]
 45a23c8: f9400508     	ldr	x8, [x8, #0x8]
 45a23cc: aa1403e0     	mov	x0, x20
 45a23d0: d63f0100     	blr	x8
 45a23d4: 12800008     	mov	w8, #-0x1               ; =-1
 45a23d8: b8e80288     	ldaddal	w8, w8, [x20]
 45a23dc: 7100051f     	cmp	w8, #0x1
 45a23e0: 54000060     	b.eq	0x45a23ec <_ChromeMain+0x459d150>
 45a23e4: 52800000     	mov	w0, #0x0                ; =0
 45a23e8: 17ffffd3     	b	0x45a2334 <_ChromeMain+0x459d098>
 45a23ec: f9400a88     	ldr	x8, [x20, #0x10]
 45a23f0: aa1403e0     	mov	x0, x20
 45a23f4: d63f0100     	blr	x8
 45a23f8: 17fffffb     	b	0x45a23e4 <_ChromeMain+0x459d148>
 45a23fc: d4200000     	brk	#0
 45a2400: d4400000     	hlt	#0
 45a2404: d4200020     	brk	#0x1
 45a2408: d4200000     	brk	#0
 45a240c: d4400000     	hlt	#0
 45a2410: d4200020     	brk	#0x1
 45a2414: d10383ff     	sub	sp, sp, #0xe0
 45a2418: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 45a241c: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 45a2420: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 45a2424: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 45a2428: 910343fd     	add	x29, sp, #0xd0
 45a242c: aa0203f3     	mov	x19, x2
 45a2430: aa0103f5     	mov	x21, x1
 45a2434: aa0003f4     	mov	x20, x0
 45a2438: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a243c: 9100a3f7     	add	x23, sp, #0x28
 45a2440: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a2444: f9001fff     	str	xzr, [sp, #0x38]
 45a2448: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a244c: 3c8483e0     	stur	q0, [sp, #0x48]
 45a2450: 3c8583e0     	stur	q0, [sp, #0x58]
 45a2454: 3c8683e0     	stur	q0, [sp, #0x68]
 45a2458: 3c8783e0     	stur	q0, [sp, #0x78]
 45a245c: 790113ff     	strh	wzr, [sp, #0x88]
 45a2460: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a2464: f004c920     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2468: 911ba800     	add	x0, x0, #0x6ea
 45a246c: f004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2470: 911de021     	add	x1, x1, #0x778
 45a2474: 910023e8     	add	x8, sp, #0x8
 45a2478: 52802e02     	mov	w2, #0x170              ; =368
 45a247c: 96eaba01     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a2480: 9100a3e1     	add	x1, sp, #0x28
 45a2484: 910023e2     	add	x2, sp, #0x8
 45a2488: aa1403e0     	mov	x0, x20
 45a248c: 9792f81e     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a2490: aa0003f6     	mov	x22, x0
 45a2494: 9101c2e0     	add	x0, x23, #0x70
 45a2498: d2800001     	mov	x1, #0x0                ; =0
 45a249c: 96ea1607     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a24a0: 910082e0     	add	x0, x23, #0x20
 45a24a4: 96ea15f5     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a24a8: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a24ac: 36f800a8     	tbz	w8, #0x1f, 0x45a24c0 <_ChromeMain+0x459d224>
 45a24b0: f94017e0     	ldr	x0, [sp, #0x28]
 45a24b4: f9401fe8     	ldr	x8, [sp, #0x38]
 45a24b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a24bc: 96e99a7f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a24c0: eb1602bf     	cmp	x21, x22
 45a24c4: 54000100     	b.eq	0x45a24e4 <_ChromeMain+0x459d248>
 45a24c8: 52800000     	mov	w0, #0x0                ; =0
 45a24cc: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 45a24d0: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 45a24d4: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 45a24d8: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 45a24dc: 910383ff     	add	sp, sp, #0xe0
 45a24e0: d65f03c0     	ret
 45a24e4: aa1403f6     	mov	x22, x20
 45a24e8: f84d86c8     	ldr	x8, [x22], #0xd8
 45a24ec: f9403508     	ldr	x8, [x8, #0x68]
 45a24f0: aa1403e0     	mov	x0, x20
 45a24f4: d63f0100     	blr	x8
 45a24f8: aa0003f5     	mov	x21, x0
 45a24fc: f0052301     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45a2500: 91192021     	add	x1, x1, #0x648
 45a2504: aa1603e0     	mov	x0, x22
 45a2508: d2800002     	mov	x2, #0x0                ; =0
 45a250c: 52800003     	mov	w3, #0x0                ; =0
 45a2510: 97552e83     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 45a2514: b5000160     	cbnz	x0, 0x45a2540 <_ChromeMain+0x459d2a4>
 45a2518: b4000115     	cbz	x21, 0x45a2538 <_ChromeMain+0x459d29c>
 45a251c: aa1503e0     	mov	x0, x21
 45a2520: 970a94ec     	bl	0x8478d0 <_ChromeMain+0x842634>
 45a2524: aa0003e2     	mov	x2, x0
 45a2528: 91144280     	add	x0, x20, #0x510
 45a252c: aa1303e1     	mov	x1, x19
 45a2530: 95fd71c3     	bl	0xc4fec3c <_ChromeMain+0xc4f99a0>
 45a2534: 17ffffe6     	b	0x45a24cc <_ChromeMain+0x459d230>
 45a2538: d2800002     	mov	x2, #0x0                ; =0
 45a253c: 17fffffb     	b	0x45a2528 <_ChromeMain+0x459d28c>
 45a2540: b4ffff35     	cbz	x21, 0x45a2524 <_ChromeMain+0x459d288>
 45a2544: d4200000     	brk	#0
 45a2548: d4400000     	hlt	#0
 45a254c: d4200020     	brk	#0x1
 45a2550: 52800008     	mov	w8, #0x0                ; =0
 45a2554: 71000c3f     	cmp	w1, #0x3
 45a2558: 540001ad     	b.le	0x45a258c <_ChromeMain+0x459d2f0>
 45a255c: 7100143f     	cmp	w1, #0x5
 45a2560: 5400034c     	b.gt	0x45a25c8 <_ChromeMain+0x459d32c>
 45a2564: 7100103f     	cmp	w1, #0x4
 45a2568: 540000c0     	b.eq	0x45a2580 <_ChromeMain+0x459d2e4>
 45a256c: 7100143f     	cmp	w1, #0x5
 45a2570: 54000281     	b.ne	0x45a25c0 <_ChromeMain+0x459d324>
 45a2574: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a2578: 53041108     	ubfx	w8, w8, #4, #1
 45a257c: 14000011     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a2580: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a2584: 53030d08     	ubfx	w8, w8, #3, #1
 45a2588: 1400000e     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a258c: 7100043f     	cmp	w1, #0x1
 45a2590: 54000160     	b.eq	0x45a25bc <_ChromeMain+0x459d320>
 45a2594: 7100083f     	cmp	w1, #0x2
 45a2598: 540000c0     	b.eq	0x45a25b0 <_ChromeMain+0x459d314>
 45a259c: 71000c3f     	cmp	w1, #0x3
 45a25a0: 54000101     	b.ne	0x45a25c0 <_ChromeMain+0x459d324>
 45a25a4: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a25a8: 53020908     	ubfx	w8, w8, #2, #1
 45a25ac: 14000005     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a25b0: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a25b4: 53010508     	ubfx	w8, w8, #1, #1
 45a25b8: 14000002     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a25bc: b944f808     	ldr	w8, [x0, #0x4f8]
 45a25c0: 12000100     	and	w0, w8, #0x1
 45a25c4: d65f03c0     	ret
 45a25c8: 7100183f     	cmp	w1, #0x6
 45a25cc: 540000c0     	b.eq	0x45a25e4 <_ChromeMain+0x459d348>
 45a25d0: 71001c3f     	cmp	w1, #0x7
 45a25d4: 54ffff61     	b.ne	0x45a25c0 <_ChromeMain+0x459d324>
 45a25d8: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a25dc: 53061908     	ubfx	w8, w8, #6, #1
 45a25e0: 17fffff8     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a25e4: 3953e008     	ldrb	w8, [x0, #0x4f8]
 45a25e8: 53051508     	ubfx	w8, w8, #5, #1
 45a25ec: 17fffff5     	b	0x45a25c0 <_ChromeMain+0x459d324>
 45a25f0: d10343ff     	sub	sp, sp, #0xd0
 45a25f4: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45a25f8: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a25fc: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a2600: 910303fd     	add	x29, sp, #0xc0
 45a2604: aa0103f3     	mov	x19, x1
 45a2608: aa0003f4     	mov	x20, x0
 45a260c: 9100a3f5     	add	x21, sp, #0x28
 45a2610: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a2614: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a2618: f9001fff     	str	xzr, [sp, #0x38]
 45a261c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a2620: 3c8483e0     	stur	q0, [sp, #0x48]
 45a2624: 3c8583e0     	stur	q0, [sp, #0x58]
 45a2628: 3c8683e0     	stur	q0, [sp, #0x68]
 45a262c: 3c8783e0     	stur	q0, [sp, #0x78]
 45a2630: 790113ff     	strh	wzr, [sp, #0x88]
 45a2634: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a2638: d004aa00     	adrp	x0, 0xdae4000 <dyld_stub_binder+0xdae4000>
 45a263c: 910ee000     	add	x0, x0, #0x3b8
 45a2640: f004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2644: 911de021     	add	x1, x1, #0x778
 45a2648: 910023e8     	add	x8, sp, #0x8
 45a264c: 528031a2     	mov	w2, #0x18d              ; =397
 45a2650: 96eab98c     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a2654: 9100a3e1     	add	x1, sp, #0x28
 45a2658: 910023e2     	add	x2, sp, #0x8
 45a265c: aa1403e0     	mov	x0, x20
 45a2660: 9792f7a9     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a2664: aa0003f4     	mov	x20, x0
 45a2668: 9101c2a0     	add	x0, x21, #0x70
 45a266c: d2800001     	mov	x1, #0x0                ; =0
 45a2670: 96ea1592     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a2674: 910082a0     	add	x0, x21, #0x20
 45a2678: 96ea1580     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a267c: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a2680: 36f800a8     	tbz	w8, #0x1f, 0x45a2694 <_ChromeMain+0x459d3f8>
 45a2684: f94017e0     	ldr	x0, [sp, #0x28]
 45a2688: f9401fe8     	ldr	x8, [sp, #0x38]
 45a268c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a2690: 96e99a0a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a2694: b4000174     	cbz	x20, 0x45a26c0 <_ChromeMain+0x459d424>
 45a2698: 51000668     	sub	w8, w19, #0x1
 45a269c: 7100191f     	cmp	w8, #0x6
 45a26a0: 54000108     	b.hi	0x45a26c0 <_ChromeMain+0x459d424>
 45a26a4: b0048a09     	adrp	x9, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 45a26a8: 91398129     	add	x9, x9, #0xe60
 45a26ac: 78685928     	ldrh	w8, [x9, w8, uxtw #1]
 45a26b0: f9400289     	ldr	x9, [x20]
 45a26b4: f8686928     	ldr	x8, [x9, x8]
 45a26b8: aa1403e0     	mov	x0, x20
 45a26bc: d63f0100     	blr	x8
 45a26c0: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a26c4: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a26c8: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a26cc: 910343ff     	add	sp, sp, #0xd0
 45a26d0: d65f03c0     	ret
 45a26d4: d1002000     	sub	x0, x0, #0x8
 45a26d8: 1400074d     	b	0x45a440c <_ChromeMain+0x459f170>
 45a26dc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a26e0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a26e4: 910043fd     	add	x29, sp, #0x10
 45a26e8: d1002013     	sub	x19, x0, #0x8
 45a26ec: aa1303e0     	mov	x0, x19
 45a26f0: 94000747     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a26f4: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a26f8: 91120108     	add	x8, x8, #0x480
 45a26fc: f8bfc100     	ldapr	x0, [x8]
 45a2700: b40000a0     	cbz	x0, 0x45a2714 <_ChromeMain+0x459d478>
 45a2704: aa1303e1     	mov	x1, x19
 45a2708: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a270c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2710: 1726e904     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2714: 97f4c3f9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2718: 17fffffb     	b	0x45a2704 <_ChromeMain+0x459d468>
 45a271c: d1004000     	sub	x0, x0, #0x10
 45a2720: 1400073b     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2724: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2728: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a272c: 910043fd     	add	x29, sp, #0x10
 45a2730: d1004013     	sub	x19, x0, #0x10
 45a2734: aa1303e0     	mov	x0, x19
 45a2738: 94000735     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a273c: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2740: 91120108     	add	x8, x8, #0x480
 45a2744: f8bfc100     	ldapr	x0, [x8]
 45a2748: b40000a0     	cbz	x0, 0x45a275c <_ChromeMain+0x459d4c0>
 45a274c: aa1303e1     	mov	x1, x19
 45a2750: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2754: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2758: 1726e8f2     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a275c: 97f4c3e7     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2760: 17fffffb     	b	0x45a274c <_ChromeMain+0x459d4b0>
 45a2764: d101a000     	sub	x0, x0, #0x68
 45a2768: 14000729     	b	0x45a440c <_ChromeMain+0x459f170>
 45a276c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2770: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2774: 910043fd     	add	x29, sp, #0x10
 45a2778: d101a013     	sub	x19, x0, #0x68
 45a277c: aa1303e0     	mov	x0, x19
 45a2780: 94000723     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2784: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2788: 91120108     	add	x8, x8, #0x480
 45a278c: f8bfc100     	ldapr	x0, [x8]
 45a2790: b40000a0     	cbz	x0, 0x45a27a4 <_ChromeMain+0x459d508>
 45a2794: aa1303e1     	mov	x1, x19
 45a2798: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a279c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a27a0: 1726e8e0     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a27a4: 97f4c3d5     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a27a8: 17fffffb     	b	0x45a2794 <_ChromeMain+0x459d4f8>
 45a27ac: d101c000     	sub	x0, x0, #0x70
 45a27b0: 14000717     	b	0x45a440c <_ChromeMain+0x459f170>
 45a27b4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a27b8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a27bc: 910043fd     	add	x29, sp, #0x10
 45a27c0: d101c013     	sub	x19, x0, #0x70
 45a27c4: aa1303e0     	mov	x0, x19
 45a27c8: 94000711     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a27cc: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a27d0: 91120108     	add	x8, x8, #0x480
 45a27d4: f8bfc100     	ldapr	x0, [x8]
 45a27d8: b40000a0     	cbz	x0, 0x45a27ec <_ChromeMain+0x459d550>
 45a27dc: aa1303e1     	mov	x1, x19
 45a27e0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a27e4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a27e8: 1726e8ce     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a27ec: 97f4c3c3     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a27f0: 17fffffb     	b	0x45a27dc <_ChromeMain+0x459d540>
 45a27f4: d102c000     	sub	x0, x0, #0xb0
 45a27f8: 14000705     	b	0x45a440c <_ChromeMain+0x459f170>
 45a27fc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2800: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2804: 910043fd     	add	x29, sp, #0x10
 45a2808: d102c013     	sub	x19, x0, #0xb0
 45a280c: aa1303e0     	mov	x0, x19
 45a2810: 940006ff     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2814: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2818: 91120108     	add	x8, x8, #0x480
 45a281c: f8bfc100     	ldapr	x0, [x8]
 45a2820: b40000a0     	cbz	x0, 0x45a2834 <_ChromeMain+0x459d598>
 45a2824: aa1303e1     	mov	x1, x19
 45a2828: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a282c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2830: 1726e8bc     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2834: 97f4c3b1     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2838: 17fffffb     	b	0x45a2824 <_ChromeMain+0x459d588>
 45a283c: d1036000     	sub	x0, x0, #0xd8
 45a2840: 140006f3     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2844: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2848: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a284c: 910043fd     	add	x29, sp, #0x10
 45a2850: d1036013     	sub	x19, x0, #0xd8
 45a2854: aa1303e0     	mov	x0, x19
 45a2858: 940006ed     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a285c: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2860: 91120108     	add	x8, x8, #0x480
 45a2864: f8bfc100     	ldapr	x0, [x8]
 45a2868: b40000a0     	cbz	x0, 0x45a287c <_ChromeMain+0x459d5e0>
 45a286c: aa1303e1     	mov	x1, x19
 45a2870: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2874: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2878: 1726e8aa     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a287c: 97f4c39f     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2880: 17fffffb     	b	0x45a286c <_ChromeMain+0x459d5d0>
 45a2884: d103e000     	sub	x0, x0, #0xf8
 45a2888: 140006e1     	b	0x45a440c <_ChromeMain+0x459f170>
 45a288c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2890: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2894: 910043fd     	add	x29, sp, #0x10
 45a2898: d103e013     	sub	x19, x0, #0xf8
 45a289c: aa1303e0     	mov	x0, x19
 45a28a0: 940006db     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a28a4: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a28a8: 91120108     	add	x8, x8, #0x480
 45a28ac: f8bfc100     	ldapr	x0, [x8]
 45a28b0: b40000a0     	cbz	x0, 0x45a28c4 <_ChromeMain+0x459d628>
 45a28b4: aa1303e1     	mov	x1, x19
 45a28b8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a28bc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a28c0: 1726e898     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a28c4: 97f4c38d     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a28c8: 17fffffb     	b	0x45a28b4 <_ChromeMain+0x459d618>
 45a28cc: d10c4000     	sub	x0, x0, #0x310
 45a28d0: 17fffe01     	b	0x45a20d4 <_ChromeMain+0x459ce38>
 45a28d4: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a28d8: 910003fd     	mov	x29, sp
 45a28dc: 3948a448     	ldrb	w8, [x2, #0x229]
 45a28e0: 37000108     	tbnz	w8, #0x0, 0x45a2900 <_ChromeMain+0x459d664>
 45a28e4: f940fc08     	ldr	x8, [x0, #0x1f8]
 45a28e8: b4000128     	cbz	x8, 0x45a290c <_ChromeMain+0x459d670>
 45a28ec: f9400500     	ldr	x0, [x8, #0x8]
 45a28f0: f9400008     	ldr	x8, [x0]
 45a28f4: f9400d08     	ldr	x8, [x8, #0x18]
 45a28f8: d63f0100     	blr	x8
 45a28fc: 14000004     	b	0x45a290c <_ChromeMain+0x459d670>
 45a2900: d10c4000     	sub	x0, x0, #0x310
 45a2904: aa0203e1     	mov	x1, x2
 45a2908: 94000700     	bl	0x45a4508 <_ChromeMain+0x459f26c>
 45a290c: 52800020     	mov	w0, #0x1                ; =1
 45a2910: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a2914: d65f03c0     	ret
 45a2918: d10c4000     	sub	x0, x0, #0x310
 45a291c: 17fffe5a     	b	0x45a2284 <_ChromeMain+0x459cfe8>
 45a2920: d10383ff     	sub	sp, sp, #0xe0
 45a2924: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 45a2928: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 45a292c: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 45a2930: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 45a2934: 910343fd     	add	x29, sp, #0xd0
 45a2938: aa0203f3     	mov	x19, x2
 45a293c: aa0103f5     	mov	x21, x1
 45a2940: aa0003f4     	mov	x20, x0
 45a2944: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a2948: d10c4017     	sub	x23, x0, #0x310
 45a294c: 9100a3f8     	add	x24, sp, #0x28
 45a2950: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a2954: f9001fff     	str	xzr, [sp, #0x38]
 45a2958: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a295c: 3c8483e0     	stur	q0, [sp, #0x48]
 45a2960: 3c8583e0     	stur	q0, [sp, #0x58]
 45a2964: 3c8683e0     	stur	q0, [sp, #0x68]
 45a2968: 3c8783e0     	stur	q0, [sp, #0x78]
 45a296c: 790113ff     	strh	wzr, [sp, #0x88]
 45a2970: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a2974: f004c920     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2978: 911ba800     	add	x0, x0, #0x6ea
 45a297c: f004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a2980: 911de021     	add	x1, x1, #0x778
 45a2984: 910023e8     	add	x8, sp, #0x8
 45a2988: 52802e02     	mov	w2, #0x170              ; =368
 45a298c: 96eab8bd     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a2990: d10c4280     	sub	x0, x20, #0x310
 45a2994: 9100a3e1     	add	x1, sp, #0x28
 45a2998: 910023e2     	add	x2, sp, #0x8
 45a299c: 9792f6da     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a29a0: aa0003f6     	mov	x22, x0
 45a29a4: 9101c300     	add	x0, x24, #0x70
 45a29a8: d2800001     	mov	x1, #0x0                ; =0
 45a29ac: 96ea14c3     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a29b0: 91008300     	add	x0, x24, #0x20
 45a29b4: 96ea14b1     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a29b8: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a29bc: 36f800a8     	tbz	w8, #0x1f, 0x45a29d0 <_ChromeMain+0x459d734>
 45a29c0: f94017e0     	ldr	x0, [sp, #0x28]
 45a29c4: f9401fe8     	ldr	x8, [sp, #0x38]
 45a29c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a29cc: 96e9993b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a29d0: eb1602bf     	cmp	x21, x22
 45a29d4: 54000100     	b.eq	0x45a29f4 <_ChromeMain+0x459d758>
 45a29d8: 52800000     	mov	w0, #0x0                ; =0
 45a29dc: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 45a29e0: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 45a29e4: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 45a29e8: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 45a29ec: 910383ff     	add	sp, sp, #0xe0
 45a29f0: d65f03c0     	ret
 45a29f4: f94002e8     	ldr	x8, [x23]
 45a29f8: f9403508     	ldr	x8, [x8, #0x68]
 45a29fc: d10c4280     	sub	x0, x20, #0x310
 45a2a00: d63f0100     	blr	x8
 45a2a04: aa0003f5     	mov	x21, x0
 45a2a08: f0052301     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45a2a0c: 91192021     	add	x1, x1, #0x648
 45a2a10: d108e280     	sub	x0, x20, #0x238
 45a2a14: d2800002     	mov	x2, #0x0                ; =0
 45a2a18: 52800003     	mov	w3, #0x0                ; =0
 45a2a1c: 97552d40     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 45a2a20: b5000160     	cbnz	x0, 0x45a2a4c <_ChromeMain+0x459d7b0>
 45a2a24: b4000115     	cbz	x21, 0x45a2a44 <_ChromeMain+0x459d7a8>
 45a2a28: aa1503e0     	mov	x0, x21
 45a2a2c: 970a93a9     	bl	0x8478d0 <_ChromeMain+0x842634>
 45a2a30: aa0003e2     	mov	x2, x0
 45a2a34: 91080280     	add	x0, x20, #0x200
 45a2a38: aa1303e1     	mov	x1, x19
 45a2a3c: 95fd7080     	bl	0xc4fec3c <_ChromeMain+0xc4f99a0>
 45a2a40: 17ffffe7     	b	0x45a29dc <_ChromeMain+0x459d740>
 45a2a44: d2800002     	mov	x2, #0x0                ; =0
 45a2a48: 17fffffb     	b	0x45a2a34 <_ChromeMain+0x459d798>
 45a2a4c: b4ffff35     	cbz	x21, 0x45a2a30 <_ChromeMain+0x459d794>
 45a2a50: d4200000     	brk	#0
 45a2a54: d4400000     	hlt	#0
 45a2a58: d4200020     	brk	#0x1
 45a2a5c: d10c4000     	sub	x0, x0, #0x310
 45a2a60: 1400066b     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2a64: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2a68: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2a6c: 910043fd     	add	x29, sp, #0x10
 45a2a70: d10c4013     	sub	x19, x0, #0x310
 45a2a74: aa1303e0     	mov	x0, x19
 45a2a78: 94000665     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2a7c: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2a80: 91120108     	add	x8, x8, #0x480
 45a2a84: f8bfc100     	ldapr	x0, [x8]
 45a2a88: b40000a0     	cbz	x0, 0x45a2a9c <_ChromeMain+0x459d800>
 45a2a8c: aa1303e1     	mov	x1, x19
 45a2a90: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2a94: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2a98: 1726e822     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2a9c: 97f4c317     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2aa0: 17fffffb     	b	0x45a2a8c <_ChromeMain+0x459d7f0>
 45a2aa4: d10cc000     	sub	x0, x0, #0x330
 45a2aa8: 14000659     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2aac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2ab0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2ab4: 910043fd     	add	x29, sp, #0x10
 45a2ab8: d10cc013     	sub	x19, x0, #0x330
 45a2abc: aa1303e0     	mov	x0, x19
 45a2ac0: 94000653     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2ac4: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2ac8: 91120108     	add	x8, x8, #0x480
 45a2acc: f8bfc100     	ldapr	x0, [x8]
 45a2ad0: b40000a0     	cbz	x0, 0x45a2ae4 <_ChromeMain+0x459d848>
 45a2ad4: aa1303e1     	mov	x1, x19
 45a2ad8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2adc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2ae0: 1726e810     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2ae4: 97f4c305     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2ae8: 17fffffb     	b	0x45a2ad4 <_ChromeMain+0x459d838>
 45a2aec: d10d4000     	sub	x0, x0, #0x350
 45a2af0: 14000647     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2af4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2af8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2afc: 910043fd     	add	x29, sp, #0x10
 45a2b00: d10d4013     	sub	x19, x0, #0x350
 45a2b04: aa1303e0     	mov	x0, x19
 45a2b08: 94000641     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2b0c: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2b10: 91120108     	add	x8, x8, #0x480
 45a2b14: f8bfc100     	ldapr	x0, [x8]
 45a2b18: b40000a0     	cbz	x0, 0x45a2b2c <_ChromeMain+0x459d890>
 45a2b1c: aa1303e1     	mov	x1, x19
 45a2b20: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2b24: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2b28: 1726e7fe     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2b2c: 97f4c2f3     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2b30: 17fffffb     	b	0x45a2b1c <_ChromeMain+0x459d880>
 45a2b34: d10da000     	sub	x0, x0, #0x368
 45a2b38: 14000635     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2b3c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2b40: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2b44: 910043fd     	add	x29, sp, #0x10
 45a2b48: d10da013     	sub	x19, x0, #0x368
 45a2b4c: aa1303e0     	mov	x0, x19
 45a2b50: 9400062f     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2b54: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2b58: 91120108     	add	x8, x8, #0x480
 45a2b5c: f8bfc100     	ldapr	x0, [x8]
 45a2b60: b40000a0     	cbz	x0, 0x45a2b74 <_ChromeMain+0x459d8d8>
 45a2b64: aa1303e1     	mov	x1, x19
 45a2b68: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2b6c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2b70: 1726e7ec     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2b74: 97f4c2e1     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2b78: 17fffffb     	b	0x45a2b64 <_ChromeMain+0x459d8c8>
 45a2b7c: d113c000     	sub	x0, x0, #0x4f0
 45a2b80: 14000623     	b	0x45a440c <_ChromeMain+0x459f170>
 45a2b84: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2b88: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2b8c: 910043fd     	add	x29, sp, #0x10
 45a2b90: d113c013     	sub	x19, x0, #0x4f0
 45a2b94: aa1303e0     	mov	x0, x19
 45a2b98: 9400061d     	bl	0x45a440c <_ChromeMain+0x459f170>
 45a2b9c: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2ba0: 91120108     	add	x8, x8, #0x480
 45a2ba4: f8bfc100     	ldapr	x0, [x8]
 45a2ba8: b40000a0     	cbz	x0, 0x45a2bbc <_ChromeMain+0x459d920>
 45a2bac: aa1303e1     	mov	x1, x19
 45a2bb0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2bb4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2bb8: 1726e7da     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2bbc: 97f4c2cf     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2bc0: 17fffffb     	b	0x45a2bac <_ChromeMain+0x459d910>
 45a2bc4: 52800008     	mov	w8, #0x0                ; =0
 45a2bc8: 71000c3f     	cmp	w1, #0x3
 45a2bcc: 540001ad     	b.le	0x45a2c00 <_ChromeMain+0x459d964>
 45a2bd0: 7100143f     	cmp	w1, #0x5
 45a2bd4: 5400034c     	b.gt	0x45a2c3c <_ChromeMain+0x459d9a0>
 45a2bd8: 7100103f     	cmp	w1, #0x4
 45a2bdc: 540000c0     	b.eq	0x45a2bf4 <_ChromeMain+0x459d958>
 45a2be0: 7100143f     	cmp	w1, #0x5
 45a2be4: 54000281     	b.ne	0x45a2c34 <_ChromeMain+0x459d998>
 45a2be8: 39402008     	ldrb	w8, [x0, #0x8]
 45a2bec: 53041108     	ubfx	w8, w8, #4, #1
 45a2bf0: 14000011     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2bf4: 39402008     	ldrb	w8, [x0, #0x8]
 45a2bf8: 53030d08     	ubfx	w8, w8, #3, #1
 45a2bfc: 1400000e     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c00: 7100043f     	cmp	w1, #0x1
 45a2c04: 54000160     	b.eq	0x45a2c30 <_ChromeMain+0x459d994>
 45a2c08: 7100083f     	cmp	w1, #0x2
 45a2c0c: 540000c0     	b.eq	0x45a2c24 <_ChromeMain+0x459d988>
 45a2c10: 71000c3f     	cmp	w1, #0x3
 45a2c14: 54000101     	b.ne	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c18: 39402008     	ldrb	w8, [x0, #0x8]
 45a2c1c: 53020908     	ubfx	w8, w8, #2, #1
 45a2c20: 14000005     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c24: 39402008     	ldrb	w8, [x0, #0x8]
 45a2c28: 53010508     	ubfx	w8, w8, #1, #1
 45a2c2c: 14000002     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c30: b9400808     	ldr	w8, [x0, #0x8]
 45a2c34: 12000100     	and	w0, w8, #0x1
 45a2c38: d65f03c0     	ret
 45a2c3c: 7100183f     	cmp	w1, #0x6
 45a2c40: 540000c0     	b.eq	0x45a2c58 <_ChromeMain+0x459d9bc>
 45a2c44: 71001c3f     	cmp	w1, #0x7
 45a2c48: 54ffff61     	b.ne	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c4c: 39402008     	ldrb	w8, [x0, #0x8]
 45a2c50: 53061908     	ubfx	w8, w8, #6, #1
 45a2c54: 17fffff8     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c58: 39402008     	ldrb	w8, [x0, #0x8]
 45a2c5c: 53051508     	ubfx	w8, w8, #5, #1
 45a2c60: 17fffff5     	b	0x45a2c34 <_ChromeMain+0x459d998>
 45a2c64: d113c000     	sub	x0, x0, #0x4f0
 45a2c68: 17fffe62     	b	0x45a25f0 <_ChromeMain+0x459d354>
 45a2c6c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2c70: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2c74: 910043fd     	add	x29, sp, #0x10
 45a2c78: aa0003f3     	mov	x19, x0
 45a2c7c: d0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a2c80: 9120c108     	add	x8, x8, #0x830
 45a2c84: 910fe109     	add	x9, x8, #0x3f8
 45a2c88: a9002408     	stp	x8, x9, [x0]
 45a2c8c: 91108109     	add	x9, x8, #0x420
 45a2c90: f9000809     	str	x9, [x0, #0x10]
 45a2c94: 91116109     	add	x9, x8, #0x458
 45a2c98: 9112210a     	add	x10, x8, #0x488
 45a2c9c: a906a809     	stp	x9, x10, [x0, #0x68]
 45a2ca0: 91136109     	add	x9, x8, #0x4d8
 45a2ca4: f9005809     	str	x9, [x0, #0xb0]
 45a2ca8: 9114e109     	add	x9, x8, #0x538
 45a2cac: f9006c09     	str	x9, [x0, #0xd8]
 45a2cb0: 9115a109     	add	x9, x8, #0x568
 45a2cb4: f9007c09     	str	x9, [x0, #0xf8]
 45a2cb8: 91164108     	add	x8, x8, #0x590
 45a2cbc: f9018808     	str	x8, [x0, #0x310]
 45a2cc0: f941a000     	ldr	x0, [x0, #0x340]
 45a2cc4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a2cc8: 90053089     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a2ccc: f9404529     	ldr	x9, [x9, #0x88]
 45a2cd0: eb09011f     	cmp	x8, x9
 45a2cd4: 54000041     	b.ne	0x45a2cdc <_ChromeMain+0x459da40>
 45a2cd8: 96e9ff59     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a2cdc: f901a27f     	str	xzr, [x19, #0x340]
 45a2ce0: f9419e60     	ldr	x0, [x19, #0x338]
 45a2ce4: b5000200     	cbnz	x0, 0x45a2d24 <_ChromeMain+0x459da88>
 45a2ce8: f9419a60     	ldr	x0, [x19, #0x330]
 45a2cec: b50000e0     	cbnz	x0, 0x45a2d08 <_ChromeMain+0x459da6c>
 45a2cf0: 910c4260     	add	x0, x19, #0x310
 45a2cf4: 97325b32     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a2cf8: aa1303e0     	mov	x0, x19
 45a2cfc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2d00: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2d04: 173732e2     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a2d08: 12800008     	mov	w8, #-0x1               ; =-1
 45a2d0c: b8e80008     	ldaddal	w8, w8, [x0]
 45a2d10: 7100051f     	cmp	w8, #0x1
 45a2d14: 54fffee1     	b.ne	0x45a2cf0 <_ChromeMain+0x459da54>
 45a2d18: f9400808     	ldr	x8, [x0, #0x10]
 45a2d1c: d63f0100     	blr	x8
 45a2d20: 17fffff4     	b	0x45a2cf0 <_ChromeMain+0x459da54>
 45a2d24: 12800008     	mov	w8, #-0x1               ; =-1
 45a2d28: b8e80008     	ldaddal	w8, w8, [x0]
 45a2d2c: 7100051f     	cmp	w8, #0x1
 45a2d30: 54fffdc1     	b.ne	0x45a2ce8 <_ChromeMain+0x459da4c>
 45a2d34: f9400808     	ldr	x8, [x0, #0x10]
 45a2d38: d63f0100     	blr	x8
 45a2d3c: 17ffffeb     	b	0x45a2ce8 <_ChromeMain+0x459da4c>
 45a2d40: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2d44: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2d48: 910043fd     	add	x29, sp, #0x10
 45a2d4c: aa0003f3     	mov	x19, x0
 45a2d50: d0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a2d54: 9120c108     	add	x8, x8, #0x830
 45a2d58: 910fe109     	add	x9, x8, #0x3f8
 45a2d5c: a9002408     	stp	x8, x9, [x0]
 45a2d60: 91108109     	add	x9, x8, #0x420
 45a2d64: f9000809     	str	x9, [x0, #0x10]
 45a2d68: 91116109     	add	x9, x8, #0x458
 45a2d6c: 9112210a     	add	x10, x8, #0x488
 45a2d70: a906a809     	stp	x9, x10, [x0, #0x68]
 45a2d74: 91136109     	add	x9, x8, #0x4d8
 45a2d78: f9005809     	str	x9, [x0, #0xb0]
 45a2d7c: 9114e109     	add	x9, x8, #0x538
 45a2d80: f9006c09     	str	x9, [x0, #0xd8]
 45a2d84: 9115a109     	add	x9, x8, #0x568
 45a2d88: f9007c09     	str	x9, [x0, #0xf8]
 45a2d8c: 91164108     	add	x8, x8, #0x590
 45a2d90: f9018808     	str	x8, [x0, #0x310]
 45a2d94: f941a000     	ldr	x0, [x0, #0x340]
 45a2d98: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a2d9c: 90053089     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a2da0: f9404529     	ldr	x9, [x9, #0x88]
 45a2da4: eb09011f     	cmp	x8, x9
 45a2da8: 54000041     	b.ne	0x45a2db0 <_ChromeMain+0x459db14>
 45a2dac: 96e9ff24     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a2db0: f901a27f     	str	xzr, [x19, #0x340]
 45a2db4: f9419e60     	ldr	x0, [x19, #0x338]
 45a2db8: b50001e0     	cbnz	x0, 0x45a2df4 <_ChromeMain+0x459db58>
 45a2dbc: f9419a60     	ldr	x0, [x19, #0x330]
 45a2dc0: b5000280     	cbnz	x0, 0x45a2e10 <_ChromeMain+0x459db74>
 45a2dc4: 910c4260     	add	x0, x19, #0x310
 45a2dc8: 97325afd     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a2dcc: aa1303e0     	mov	x0, x19
 45a2dd0: 973732af     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a2dd4: 90054b48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a2dd8: 91120108     	add	x8, x8, #0x480
 45a2ddc: f8bfc100     	ldapr	x0, [x8]
 45a2de0: b4000260     	cbz	x0, 0x45a2e2c <_ChromeMain+0x459db90>
 45a2de4: aa1303e1     	mov	x1, x19
 45a2de8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2dec: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2df0: 1726e74c     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a2df4: 12800008     	mov	w8, #-0x1               ; =-1
 45a2df8: b8e80008     	ldaddal	w8, w8, [x0]
 45a2dfc: 7100051f     	cmp	w8, #0x1
 45a2e00: 54fffde1     	b.ne	0x45a2dbc <_ChromeMain+0x459db20>
 45a2e04: f9400808     	ldr	x8, [x0, #0x10]
 45a2e08: d63f0100     	blr	x8
 45a2e0c: 17ffffec     	b	0x45a2dbc <_ChromeMain+0x459db20>
 45a2e10: 12800008     	mov	w8, #-0x1               ; =-1
 45a2e14: b8e80008     	ldaddal	w8, w8, [x0]
 45a2e18: 7100051f     	cmp	w8, #0x1
 45a2e1c: 54fffd41     	b.ne	0x45a2dc4 <_ChromeMain+0x459db28>
 45a2e20: f9400808     	ldr	x8, [x0, #0x10]
 45a2e24: d63f0100     	blr	x8
 45a2e28: 17ffffe7     	b	0x45a2dc4 <_ChromeMain+0x459db28>
 45a2e2c: 97f4c233     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a2e30: 17ffffed     	b	0x45a2de4 <_ChromeMain+0x459db48>
 45a2e34: 3947a408     	ldrb	w8, [x0, #0x1e9]
 45a2e38: 36000128     	tbz	w8, #0x0, 0x45a2e5c <_ChromeMain+0x459dbc0>
 45a2e3c: d10083ff     	sub	sp, sp, #0x20
 45a2e40: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2e44: 910043fd     	add	x29, sp, #0x10
 45a2e48: d10007a1     	sub	x1, x29, #0x1
 45a2e4c: 973a1642     	bl	0x1428754 <_ChromeMain+0x14234b8>
 45a2e50: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2e54: 910083ff     	add	sp, sp, #0x20
 45a2e58: d65f03c0     	ret
 45a2e5c: d4200000     	brk	#0
 45a2e60: d4400000     	hlt	#0
 45a2e64: d4200020     	brk	#0x1
 45a2e68: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2e6c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2e70: 910043fd     	add	x29, sp, #0x10
 45a2e74: aa0103f4     	mov	x20, x1
 45a2e78: aa0003f3     	mov	x19, x0
 45a2e7c: 79400028     	ldrh	w8, [x1]
 45a2e80: 71006d1f     	cmp	w8, #0x1b
 45a2e84: 540001e1     	b.ne	0x45a2ec0 <_ChromeMain+0x459dc24>
 45a2e88: f9400268     	ldr	x8, [x19]
 45a2e8c: f9403508     	ldr	x8, [x8, #0x68]
 45a2e90: aa1303e0     	mov	x0, x19
 45a2e94: d63f0100     	blr	x8
 45a2e98: b4000120     	cbz	x0, 0x45a2ebc <_ChromeMain+0x459dc20>
 45a2e9c: f9400268     	ldr	x8, [x19]
 45a2ea0: f9403508     	ldr	x8, [x8, #0x68]
 45a2ea4: aa1303e0     	mov	x0, x19
 45a2ea8: d63f0100     	blr	x8
 45a2eac: 52800001     	mov	w1, #0x0                ; =0
 45a2eb0: 9799e936     	bl	0x2c1d388 <_ChromeMain+0x2c180ec>
 45a2eb4: 52800020     	mov	w0, #0x1                ; =1
 45a2eb8: 14000009     	b	0x45a2edc <_ChromeMain+0x459dc40>
 45a2ebc: 79400288     	ldrh	w8, [x20]
 45a2ec0: 7101051f     	cmp	w8, #0x41
 45a2ec4: 540000a1     	b.ne	0x45a2ed8 <_ChromeMain+0x459dc3c>
 45a2ec8: b9400a88     	ldr	w8, [x20, #0x8]
 45a2ecc: 52800249     	mov	w9, #0x12               ; =18
 45a2ed0: 6a28013f     	bics	wzr, w9, w8
 45a2ed4: 540000a0     	b.eq	0x45a2ee8 <_ChromeMain+0x459dc4c>
 45a2ed8: 52800000     	mov	w0, #0x0                ; =0
 45a2edc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a2ee0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a2ee4: d65f03c0     	ret
 45a2ee8: f9419e74     	ldr	x20, [x19, #0x338]
 45a2eec: b4ffff74     	cbz	x20, 0x45a2ed8 <_ChromeMain+0x459dc3c>
 45a2ef0: 52800028     	mov	w8, #0x1                ; =1
 45a2ef4: b8280288     	ldadd	w8, w8, [x20]
 45a2ef8: 7100011f     	cmp	w8, #0x0
 45a2efc: 5400020d     	b.le	0x45a2f3c <_ChromeMain+0x459dca0>
 45a2f00: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a2f04: 6b09011f     	cmp	w8, w9
 45a2f08: 54000200     	b.eq	0x45a2f48 <_ChromeMain+0x459dcac>
 45a2f0c: f9419e68     	ldr	x8, [x19, #0x338]
 45a2f10: f9400508     	ldr	x8, [x8, #0x8]
 45a2f14: aa1403e0     	mov	x0, x20
 45a2f18: d63f0100     	blr	x8
 45a2f1c: 12800008     	mov	w8, #-0x1               ; =-1
 45a2f20: b8e80288     	ldaddal	w8, w8, [x20]
 45a2f24: 7100051f     	cmp	w8, #0x1
 45a2f28: 54fffc61     	b.ne	0x45a2eb4 <_ChromeMain+0x459dc18>
 45a2f2c: f9400a88     	ldr	x8, [x20, #0x10]
 45a2f30: aa1403e0     	mov	x0, x20
 45a2f34: d63f0100     	blr	x8
 45a2f38: 17ffffdf     	b	0x45a2eb4 <_ChromeMain+0x459dc18>
 45a2f3c: d4200000     	brk	#0
 45a2f40: d4400000     	hlt	#0
 45a2f44: d4200020     	brk	#0x1
 45a2f48: d4200000     	brk	#0
 45a2f4c: d4400000     	hlt	#0
 45a2f50: d4200020     	brk	#0x1
 45a2f54: 00000000     	udf	#0x0
 45a2f58: 1400042a     	b	0x45a4000 <_ChromeMain+0x459ed64>
 45a2f5c: b40001a1     	cbz	x1, 0x45a2f90 <_ChromeMain+0x459dcf4>
 45a2f60: f9400028     	ldr	x8, [x1]
 45a2f64: f940450a     	ldr	x10, [x8, #0x88]
 45a2f68: 90ffd52b     	adrp	x11, 0x4046000 <_ChromeMain+0x4040d64>
 45a2f6c: 9135016b     	add	x11, x11, #0xd40
 45a2f70: f9403c29     	ldr	x9, [x1, #0x78]
 45a2f74: f9400528     	ldr	x8, [x9, #0x8]
 45a2f78: eb0b015f     	cmp	x10, x11
 45a2f7c: 54000161     	b.ne	0x45a2fa8 <_ChromeMain+0x459dd0c>
 45a2f80: b40001c8     	cbz	x8, 0x45a2fb8 <_ChromeMain+0x459dd1c>
 45a2f84: 9105a10a     	add	x10, x8, #0x168
 45a2f88: eb09015f     	cmp	x10, x9
 45a2f8c: 54000040     	b.eq	0x45a2f94 <_ChromeMain+0x459dcf8>
 45a2f90: d65f03c0     	ret
 45a2f94: b9415908     	ldr	w8, [x8, #0x158]
 45a2f98: 7100111f     	cmp	w8, #0x4
 45a2f9c: 54000142     	b.hs	0x45a2fc4 <_ChromeMain+0x459dd28>
 45a2fa0: 35ffff88     	cbnz	w8, 0x45a2f90 <_ChromeMain+0x459dcf4>
 45a2fa4: 14000417     	b	0x45a4000 <_ChromeMain+0x459ed64>
 45a2fa8: b5fffee8     	cbnz	x8, 0x45a2f84 <_ChromeMain+0x459dce8>
 45a2fac: d4200000     	brk	#0
 45a2fb0: d4400000     	hlt	#0
 45a2fb4: d4200020     	brk	#0x1
 45a2fb8: d4200000     	brk	#0
 45a2fbc: d4400000     	hlt	#0
 45a2fc0: d4200020     	brk	#0x1
 45a2fc4: d42aa160     	brk	#0x550b
 45a2fc8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a2fcc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a2fd0: 910043fd     	add	x29, sp, #0x10
 45a2fd4: aa0003f4     	mov	x20, x0
 45a2fd8: d0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a2fdc: 9120c108     	add	x8, x8, #0x830
 45a2fe0: aa0003f3     	mov	x19, x0
 45a2fe4: f81f8e68     	str	x8, [x19, #-0x8]!
 45a2fe8: 910fe109     	add	x9, x8, #0x3f8
 45a2fec: 9110810a     	add	x10, x8, #0x420
 45a2ff0: a9002809     	stp	x9, x10, [x0]
 45a2ff4: 91116109     	add	x9, x8, #0x458
 45a2ff8: 9112210a     	add	x10, x8, #0x488
 45a2ffc: a9062809     	stp	x9, x10, [x0, #0x60]
 45a3000: 91136109     	add	x9, x8, #0x4d8
 45a3004: f9005409     	str	x9, [x0, #0xa8]
 45a3008: 9114e109     	add	x9, x8, #0x538
 45a300c: f9006809     	str	x9, [x0, #0xd0]
 45a3010: 9115a109     	add	x9, x8, #0x568
 45a3014: f9007809     	str	x9, [x0, #0xf0]
 45a3018: 91164108     	add	x8, x8, #0x590
 45a301c: f9018408     	str	x8, [x0, #0x308]
 45a3020: f9419c00     	ldr	x0, [x0, #0x338]
 45a3024: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3028: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a302c: f9404529     	ldr	x9, [x9, #0x88]
 45a3030: eb09011f     	cmp	x8, x9
 45a3034: 54000041     	b.ne	0x45a303c <_ChromeMain+0x459dda0>
 45a3038: 96e9fe81     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a303c: f9019e9f     	str	xzr, [x20, #0x338]
 45a3040: f9419a80     	ldr	x0, [x20, #0x330]
 45a3044: b5000200     	cbnz	x0, 0x45a3084 <_ChromeMain+0x459dde8>
 45a3048: f9419680     	ldr	x0, [x20, #0x328]
 45a304c: b50000e0     	cbnz	x0, 0x45a3068 <_ChromeMain+0x459ddcc>
 45a3050: 910c2280     	add	x0, x20, #0x308
 45a3054: 97325a5a     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3058: aa1303e0     	mov	x0, x19
 45a305c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3060: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3064: 1737320a     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3068: 12800008     	mov	w8, #-0x1               ; =-1
 45a306c: b8e80008     	ldaddal	w8, w8, [x0]
 45a3070: 7100051f     	cmp	w8, #0x1
 45a3074: 54fffee1     	b.ne	0x45a3050 <_ChromeMain+0x459ddb4>
 45a3078: f9400808     	ldr	x8, [x0, #0x10]
 45a307c: d63f0100     	blr	x8
 45a3080: 17fffff4     	b	0x45a3050 <_ChromeMain+0x459ddb4>
 45a3084: 12800008     	mov	w8, #-0x1               ; =-1
 45a3088: b8e80008     	ldaddal	w8, w8, [x0]
 45a308c: 7100051f     	cmp	w8, #0x1
 45a3090: 54fffdc1     	b.ne	0x45a3048 <_ChromeMain+0x459ddac>
 45a3094: f9400808     	ldr	x8, [x0, #0x10]
 45a3098: d63f0100     	blr	x8
 45a309c: 17ffffeb     	b	0x45a3048 <_ChromeMain+0x459ddac>
 45a30a0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a30a4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a30a8: 910043fd     	add	x29, sp, #0x10
 45a30ac: aa0003f4     	mov	x20, x0
 45a30b0: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a30b4: 9120c108     	add	x8, x8, #0x830
 45a30b8: aa0003f3     	mov	x19, x0
 45a30bc: f81f8e68     	str	x8, [x19, #-0x8]!
 45a30c0: 910fe109     	add	x9, x8, #0x3f8
 45a30c4: 9110810a     	add	x10, x8, #0x420
 45a30c8: a9002809     	stp	x9, x10, [x0]
 45a30cc: 91116109     	add	x9, x8, #0x458
 45a30d0: 9112210a     	add	x10, x8, #0x488
 45a30d4: a9062809     	stp	x9, x10, [x0, #0x60]
 45a30d8: 91136109     	add	x9, x8, #0x4d8
 45a30dc: f9005409     	str	x9, [x0, #0xa8]
 45a30e0: 9114e109     	add	x9, x8, #0x538
 45a30e4: f9006809     	str	x9, [x0, #0xd0]
 45a30e8: 9115a109     	add	x9, x8, #0x568
 45a30ec: f9007809     	str	x9, [x0, #0xf0]
 45a30f0: 91164108     	add	x8, x8, #0x590
 45a30f4: f9018408     	str	x8, [x0, #0x308]
 45a30f8: f9419c00     	ldr	x0, [x0, #0x338]
 45a30fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3100: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3104: f9404529     	ldr	x9, [x9, #0x88]
 45a3108: eb09011f     	cmp	x8, x9
 45a310c: 54000041     	b.ne	0x45a3114 <_ChromeMain+0x459de78>
 45a3110: 96e9fe4b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3114: f9019e9f     	str	xzr, [x20, #0x338]
 45a3118: f9419a80     	ldr	x0, [x20, #0x330]
 45a311c: b50001e0     	cbnz	x0, 0x45a3158 <_ChromeMain+0x459debc>
 45a3120: f9419680     	ldr	x0, [x20, #0x328]
 45a3124: b5000280     	cbnz	x0, 0x45a3174 <_ChromeMain+0x459ded8>
 45a3128: 910c2280     	add	x0, x20, #0x308
 45a312c: 97325a24     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3130: aa1303e0     	mov	x0, x19
 45a3134: 973731d6     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3138: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a313c: 91120108     	add	x8, x8, #0x480
 45a3140: f8bfc100     	ldapr	x0, [x8]
 45a3144: b4000260     	cbz	x0, 0x45a3190 <_ChromeMain+0x459def4>
 45a3148: aa1303e1     	mov	x1, x19
 45a314c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3150: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3154: 1726e673     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3158: 12800008     	mov	w8, #-0x1               ; =-1
 45a315c: b8e80008     	ldaddal	w8, w8, [x0]
 45a3160: 7100051f     	cmp	w8, #0x1
 45a3164: 54fffde1     	b.ne	0x45a3120 <_ChromeMain+0x459de84>
 45a3168: f9400808     	ldr	x8, [x0, #0x10]
 45a316c: d63f0100     	blr	x8
 45a3170: 17ffffec     	b	0x45a3120 <_ChromeMain+0x459de84>
 45a3174: 12800008     	mov	w8, #-0x1               ; =-1
 45a3178: b8e80008     	ldaddal	w8, w8, [x0]
 45a317c: 7100051f     	cmp	w8, #0x1
 45a3180: 54fffd41     	b.ne	0x45a3128 <_ChromeMain+0x459de8c>
 45a3184: f9400808     	ldr	x8, [x0, #0x10]
 45a3188: d63f0100     	blr	x8
 45a318c: 17ffffe7     	b	0x45a3128 <_ChromeMain+0x459de8c>
 45a3190: 97f4c15a     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a3194: 17ffffed     	b	0x45a3148 <_ChromeMain+0x459deac>
 45a3198: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a319c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a31a0: 910043fd     	add	x29, sp, #0x10
 45a31a4: aa0003f4     	mov	x20, x0
 45a31a8: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a31ac: 9120c108     	add	x8, x8, #0x830
 45a31b0: aa0003f3     	mov	x19, x0
 45a31b4: f81f0e68     	str	x8, [x19, #-0x10]!
 45a31b8: 910fe109     	add	x9, x8, #0x3f8
 45a31bc: 9110810a     	add	x10, x8, #0x420
 45a31c0: a93fa809     	stp	x9, x10, [x0, #-0x8]
 45a31c4: 91116109     	add	x9, x8, #0x458
 45a31c8: 9112210a     	add	x10, x8, #0x488
 45a31cc: a905a809     	stp	x9, x10, [x0, #0x58]
 45a31d0: 91136109     	add	x9, x8, #0x4d8
 45a31d4: f9005009     	str	x9, [x0, #0xa0]
 45a31d8: 9114e109     	add	x9, x8, #0x538
 45a31dc: f9006409     	str	x9, [x0, #0xc8]
 45a31e0: 9115a109     	add	x9, x8, #0x568
 45a31e4: f9007409     	str	x9, [x0, #0xe8]
 45a31e8: 91164108     	add	x8, x8, #0x590
 45a31ec: f9018008     	str	x8, [x0, #0x300]
 45a31f0: f9419800     	ldr	x0, [x0, #0x330]
 45a31f4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a31f8: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a31fc: f9404529     	ldr	x9, [x9, #0x88]
 45a3200: eb09011f     	cmp	x8, x9
 45a3204: 54000041     	b.ne	0x45a320c <_ChromeMain+0x459df70>
 45a3208: 96e9fe0d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a320c: f9019a9f     	str	xzr, [x20, #0x330]
 45a3210: f9419680     	ldr	x0, [x20, #0x328]
 45a3214: b5000200     	cbnz	x0, 0x45a3254 <_ChromeMain+0x459dfb8>
 45a3218: f9419280     	ldr	x0, [x20, #0x320]
 45a321c: b50000e0     	cbnz	x0, 0x45a3238 <_ChromeMain+0x459df9c>
 45a3220: 910c0280     	add	x0, x20, #0x300
 45a3224: 973259e6     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3228: aa1303e0     	mov	x0, x19
 45a322c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3230: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3234: 17373196     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3238: 12800008     	mov	w8, #-0x1               ; =-1
 45a323c: b8e80008     	ldaddal	w8, w8, [x0]
 45a3240: 7100051f     	cmp	w8, #0x1
 45a3244: 54fffee1     	b.ne	0x45a3220 <_ChromeMain+0x459df84>
 45a3248: f9400808     	ldr	x8, [x0, #0x10]
 45a324c: d63f0100     	blr	x8
 45a3250: 17fffff4     	b	0x45a3220 <_ChromeMain+0x459df84>
 45a3254: 12800008     	mov	w8, #-0x1               ; =-1
 45a3258: b8e80008     	ldaddal	w8, w8, [x0]
 45a325c: 7100051f     	cmp	w8, #0x1
 45a3260: 54fffdc1     	b.ne	0x45a3218 <_ChromeMain+0x459df7c>
 45a3264: f9400808     	ldr	x8, [x0, #0x10]
 45a3268: d63f0100     	blr	x8
 45a326c: 17ffffeb     	b	0x45a3218 <_ChromeMain+0x459df7c>
 45a3270: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3274: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3278: 910043fd     	add	x29, sp, #0x10
 45a327c: aa0003f4     	mov	x20, x0
 45a3280: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3284: 9120c108     	add	x8, x8, #0x830
 45a3288: aa0003f3     	mov	x19, x0
 45a328c: f81f0e68     	str	x8, [x19, #-0x10]!
 45a3290: 910fe109     	add	x9, x8, #0x3f8
 45a3294: 9110810a     	add	x10, x8, #0x420
 45a3298: a93fa809     	stp	x9, x10, [x0, #-0x8]
 45a329c: 91116109     	add	x9, x8, #0x458
 45a32a0: 9112210a     	add	x10, x8, #0x488
 45a32a4: a905a809     	stp	x9, x10, [x0, #0x58]
 45a32a8: 91136109     	add	x9, x8, #0x4d8
 45a32ac: f9005009     	str	x9, [x0, #0xa0]
 45a32b0: 9114e109     	add	x9, x8, #0x538
 45a32b4: f9006409     	str	x9, [x0, #0xc8]
 45a32b8: 9115a109     	add	x9, x8, #0x568
 45a32bc: f9007409     	str	x9, [x0, #0xe8]
 45a32c0: 91164108     	add	x8, x8, #0x590
 45a32c4: f9018008     	str	x8, [x0, #0x300]
 45a32c8: f9419800     	ldr	x0, [x0, #0x330]
 45a32cc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a32d0: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a32d4: f9404529     	ldr	x9, [x9, #0x88]
 45a32d8: eb09011f     	cmp	x8, x9
 45a32dc: 54000041     	b.ne	0x45a32e4 <_ChromeMain+0x459e048>
 45a32e0: 96e9fdd7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a32e4: f9019a9f     	str	xzr, [x20, #0x330]
 45a32e8: f9419680     	ldr	x0, [x20, #0x328]
 45a32ec: b50001e0     	cbnz	x0, 0x45a3328 <_ChromeMain+0x459e08c>
 45a32f0: f9419280     	ldr	x0, [x20, #0x320]
 45a32f4: b5000280     	cbnz	x0, 0x45a3344 <_ChromeMain+0x459e0a8>
 45a32f8: 910c0280     	add	x0, x20, #0x300
 45a32fc: 973259b0     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3300: aa1303e0     	mov	x0, x19
 45a3304: 97373162     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3308: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a330c: 91120108     	add	x8, x8, #0x480
 45a3310: f8bfc100     	ldapr	x0, [x8]
 45a3314: b4000260     	cbz	x0, 0x45a3360 <_ChromeMain+0x459e0c4>
 45a3318: aa1303e1     	mov	x1, x19
 45a331c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3320: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3324: 1726e5ff     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3328: 12800008     	mov	w8, #-0x1               ; =-1
 45a332c: b8e80008     	ldaddal	w8, w8, [x0]
 45a3330: 7100051f     	cmp	w8, #0x1
 45a3334: 54fffde1     	b.ne	0x45a32f0 <_ChromeMain+0x459e054>
 45a3338: f9400808     	ldr	x8, [x0, #0x10]
 45a333c: d63f0100     	blr	x8
 45a3340: 17ffffec     	b	0x45a32f0 <_ChromeMain+0x459e054>
 45a3344: 12800008     	mov	w8, #-0x1               ; =-1
 45a3348: b8e80008     	ldaddal	w8, w8, [x0]
 45a334c: 7100051f     	cmp	w8, #0x1
 45a3350: 54fffd41     	b.ne	0x45a32f8 <_ChromeMain+0x459e05c>
 45a3354: f9400808     	ldr	x8, [x0, #0x10]
 45a3358: d63f0100     	blr	x8
 45a335c: 17ffffe7     	b	0x45a32f8 <_ChromeMain+0x459e05c>
 45a3360: 97f4c0e6     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a3364: 17ffffed     	b	0x45a3318 <_ChromeMain+0x459e07c>
 45a3368: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 45a336c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45a3370: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45a3374: 910083fd     	add	x29, sp, #0x20
 45a3378: aa0103f4     	mov	x20, x1
 45a337c: aa0003f3     	mov	x19, x0
 45a3380: 79400028     	ldrh	w8, [x1]
 45a3384: 71006d1f     	cmp	w8, #0x1b
 45a3388: 54000201     	b.ne	0x45a33c8 <_ChromeMain+0x459e12c>
 45a338c: d101a275     	sub	x21, x19, #0x68
 45a3390: f94002a8     	ldr	x8, [x21]
 45a3394: f9403508     	ldr	x8, [x8, #0x68]
 45a3398: d101a260     	sub	x0, x19, #0x68
 45a339c: d63f0100     	blr	x8
 45a33a0: b4000120     	cbz	x0, 0x45a33c4 <_ChromeMain+0x459e128>
 45a33a4: f94002a8     	ldr	x8, [x21]
 45a33a8: f9403508     	ldr	x8, [x8, #0x68]
 45a33ac: aa1503e0     	mov	x0, x21
 45a33b0: d63f0100     	blr	x8
 45a33b4: 52800001     	mov	w1, #0x0                ; =0
 45a33b8: 9799e7f4     	bl	0x2c1d388 <_ChromeMain+0x2c180ec>
 45a33bc: 52800020     	mov	w0, #0x1                ; =1
 45a33c0: 14000009     	b	0x45a33e4 <_ChromeMain+0x459e148>
 45a33c4: 79400288     	ldrh	w8, [x20]
 45a33c8: 7101051f     	cmp	w8, #0x41
 45a33cc: 540000a1     	b.ne	0x45a33e0 <_ChromeMain+0x459e144>
 45a33d0: b9400a88     	ldr	w8, [x20, #0x8]
 45a33d4: 52800249     	mov	w9, #0x12               ; =18
 45a33d8: 6a28013f     	bics	wzr, w9, w8
 45a33dc: 540000c0     	b.eq	0x45a33f4 <_ChromeMain+0x459e158>
 45a33e0: 52800000     	mov	w0, #0x0                ; =0
 45a33e4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a33e8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a33ec: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45a33f0: d65f03c0     	ret
 45a33f4: f9416a74     	ldr	x20, [x19, #0x2d0]
 45a33f8: b4ffff54     	cbz	x20, 0x45a33e0 <_ChromeMain+0x459e144>
 45a33fc: 52800028     	mov	w8, #0x1                ; =1
 45a3400: b8280288     	ldadd	w8, w8, [x20]
 45a3404: 7100011f     	cmp	w8, #0x0
 45a3408: 5400020d     	b.le	0x45a3448 <_ChromeMain+0x459e1ac>
 45a340c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45a3410: 6b09011f     	cmp	w8, w9
 45a3414: 54000200     	b.eq	0x45a3454 <_ChromeMain+0x459e1b8>
 45a3418: f9416a68     	ldr	x8, [x19, #0x2d0]
 45a341c: f9400508     	ldr	x8, [x8, #0x8]
 45a3420: aa1403e0     	mov	x0, x20
 45a3424: d63f0100     	blr	x8
 45a3428: 12800008     	mov	w8, #-0x1               ; =-1
 45a342c: b8e80288     	ldaddal	w8, w8, [x20]
 45a3430: 7100051f     	cmp	w8, #0x1
 45a3434: 54fffc41     	b.ne	0x45a33bc <_ChromeMain+0x459e120>
 45a3438: f9400a88     	ldr	x8, [x20, #0x10]
 45a343c: aa1403e0     	mov	x0, x20
 45a3440: d63f0100     	blr	x8
 45a3444: 17ffffde     	b	0x45a33bc <_ChromeMain+0x459e120>
 45a3448: d4200000     	brk	#0
 45a344c: d4400000     	hlt	#0
 45a3450: d4200020     	brk	#0x1
 45a3454: d4200000     	brk	#0
 45a3458: d4400000     	hlt	#0
 45a345c: d4200020     	brk	#0x1
 45a3460: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3464: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3468: 910043fd     	add	x29, sp, #0x10
 45a346c: aa0003f4     	mov	x20, x0
 45a3470: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3474: 9120c108     	add	x8, x8, #0x830
 45a3478: aa0003f3     	mov	x19, x0
 45a347c: f8198e68     	str	x8, [x19, #-0x68]!
 45a3480: 910fe109     	add	x9, x8, #0x3f8
 45a3484: 9110810a     	add	x10, x8, #0x420
 45a3488: a93a2809     	stp	x9, x10, [x0, #-0x60]
 45a348c: 91116109     	add	x9, x8, #0x458
 45a3490: 9112210a     	add	x10, x8, #0x488
 45a3494: a9002809     	stp	x9, x10, [x0]
 45a3498: 91136109     	add	x9, x8, #0x4d8
 45a349c: f9002409     	str	x9, [x0, #0x48]
 45a34a0: 9114e109     	add	x9, x8, #0x538
 45a34a4: f9003809     	str	x9, [x0, #0x70]
 45a34a8: 9115a109     	add	x9, x8, #0x568
 45a34ac: f9004809     	str	x9, [x0, #0x90]
 45a34b0: 91164108     	add	x8, x8, #0x590
 45a34b4: f9015408     	str	x8, [x0, #0x2a8]
 45a34b8: f9416c00     	ldr	x0, [x0, #0x2d8]
 45a34bc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a34c0: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a34c4: f9404529     	ldr	x9, [x9, #0x88]
 45a34c8: eb09011f     	cmp	x8, x9
 45a34cc: 54000041     	b.ne	0x45a34d4 <_ChromeMain+0x459e238>
 45a34d0: 96e9fd5b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a34d4: f9016e9f     	str	xzr, [x20, #0x2d8]
 45a34d8: f9416a80     	ldr	x0, [x20, #0x2d0]
 45a34dc: b5000200     	cbnz	x0, 0x45a351c <_ChromeMain+0x459e280>
 45a34e0: f9416680     	ldr	x0, [x20, #0x2c8]
 45a34e4: b50000e0     	cbnz	x0, 0x45a3500 <_ChromeMain+0x459e264>
 45a34e8: 910aa280     	add	x0, x20, #0x2a8
 45a34ec: 97325934     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a34f0: aa1303e0     	mov	x0, x19
 45a34f4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a34f8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a34fc: 173730e4     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3500: 12800008     	mov	w8, #-0x1               ; =-1
 45a3504: b8e80008     	ldaddal	w8, w8, [x0]
 45a3508: 7100051f     	cmp	w8, #0x1
 45a350c: 54fffee1     	b.ne	0x45a34e8 <_ChromeMain+0x459e24c>
 45a3510: f9400808     	ldr	x8, [x0, #0x10]
 45a3514: d63f0100     	blr	x8
 45a3518: 17fffff4     	b	0x45a34e8 <_ChromeMain+0x459e24c>
 45a351c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3520: b8e80008     	ldaddal	w8, w8, [x0]
 45a3524: 7100051f     	cmp	w8, #0x1
 45a3528: 54fffdc1     	b.ne	0x45a34e0 <_ChromeMain+0x459e244>
 45a352c: f9400808     	ldr	x8, [x0, #0x10]
 45a3530: d63f0100     	blr	x8
 45a3534: 17ffffeb     	b	0x45a34e0 <_ChromeMain+0x459e244>
 45a3538: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a353c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3540: 910043fd     	add	x29, sp, #0x10
 45a3544: aa0003f4     	mov	x20, x0
 45a3548: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a354c: 9120c108     	add	x8, x8, #0x830
 45a3550: aa0003f3     	mov	x19, x0
 45a3554: f8198e68     	str	x8, [x19, #-0x68]!
 45a3558: 910fe109     	add	x9, x8, #0x3f8
 45a355c: 9110810a     	add	x10, x8, #0x420
 45a3560: a93a2809     	stp	x9, x10, [x0, #-0x60]
 45a3564: 91116109     	add	x9, x8, #0x458
 45a3568: 9112210a     	add	x10, x8, #0x488
 45a356c: a9002809     	stp	x9, x10, [x0]
 45a3570: 91136109     	add	x9, x8, #0x4d8
 45a3574: f9002409     	str	x9, [x0, #0x48]
 45a3578: 9114e109     	add	x9, x8, #0x538
 45a357c: f9003809     	str	x9, [x0, #0x70]
 45a3580: 9115a109     	add	x9, x8, #0x568
 45a3584: f9004809     	str	x9, [x0, #0x90]
 45a3588: 91164108     	add	x8, x8, #0x590
 45a358c: f9015408     	str	x8, [x0, #0x2a8]
 45a3590: f9416c00     	ldr	x0, [x0, #0x2d8]
 45a3594: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3598: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a359c: f9404529     	ldr	x9, [x9, #0x88]
 45a35a0: eb09011f     	cmp	x8, x9
 45a35a4: 54000041     	b.ne	0x45a35ac <_ChromeMain+0x459e310>
 45a35a8: 96e9fd25     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a35ac: f9016e9f     	str	xzr, [x20, #0x2d8]
 45a35b0: f9416a80     	ldr	x0, [x20, #0x2d0]
 45a35b4: b50001e0     	cbnz	x0, 0x45a35f0 <_ChromeMain+0x459e354>
 45a35b8: f9416680     	ldr	x0, [x20, #0x2c8]
 45a35bc: b5000280     	cbnz	x0, 0x45a360c <_ChromeMain+0x459e370>
 45a35c0: 910aa280     	add	x0, x20, #0x2a8
 45a35c4: 973258fe     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a35c8: aa1303e0     	mov	x0, x19
 45a35cc: 973730b0     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a35d0: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a35d4: 91120108     	add	x8, x8, #0x480
 45a35d8: f8bfc100     	ldapr	x0, [x8]
 45a35dc: b4000260     	cbz	x0, 0x45a3628 <_ChromeMain+0x459e38c>
 45a35e0: aa1303e1     	mov	x1, x19
 45a35e4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a35e8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a35ec: 1726e54d     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a35f0: 12800008     	mov	w8, #-0x1               ; =-1
 45a35f4: b8e80008     	ldaddal	w8, w8, [x0]
 45a35f8: 7100051f     	cmp	w8, #0x1
 45a35fc: 54fffde1     	b.ne	0x45a35b8 <_ChromeMain+0x459e31c>
 45a3600: f9400808     	ldr	x8, [x0, #0x10]
 45a3604: d63f0100     	blr	x8
 45a3608: 17ffffec     	b	0x45a35b8 <_ChromeMain+0x459e31c>
 45a360c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3610: b8e80008     	ldaddal	w8, w8, [x0]
 45a3614: 7100051f     	cmp	w8, #0x1
 45a3618: 54fffd41     	b.ne	0x45a35c0 <_ChromeMain+0x459e324>
 45a361c: f9400808     	ldr	x8, [x0, #0x10]
 45a3620: d63f0100     	blr	x8
 45a3624: 17ffffe7     	b	0x45a35c0 <_ChromeMain+0x459e324>
 45a3628: 97f4c034     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a362c: 17ffffed     	b	0x45a35e0 <_ChromeMain+0x459e344>
 45a3630: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3634: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3638: 910043fd     	add	x29, sp, #0x10
 45a363c: aa0003f4     	mov	x20, x0
 45a3640: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3644: 9120c108     	add	x8, x8, #0x830
 45a3648: aa0003f3     	mov	x19, x0
 45a364c: f8190e68     	str	x8, [x19, #-0x70]!
 45a3650: 910fe109     	add	x9, x8, #0x3f8
 45a3654: 9110810a     	add	x10, x8, #0x420
 45a3658: a939a809     	stp	x9, x10, [x0, #-0x68]
 45a365c: 91116109     	add	x9, x8, #0x458
 45a3660: 9112210a     	add	x10, x8, #0x488
 45a3664: a93fa809     	stp	x9, x10, [x0, #-0x8]
 45a3668: 91136109     	add	x9, x8, #0x4d8
 45a366c: f9002009     	str	x9, [x0, #0x40]
 45a3670: 9114e109     	add	x9, x8, #0x538
 45a3674: f9003409     	str	x9, [x0, #0x68]
 45a3678: 9115a109     	add	x9, x8, #0x568
 45a367c: f9004409     	str	x9, [x0, #0x88]
 45a3680: 91164108     	add	x8, x8, #0x590
 45a3684: f9015008     	str	x8, [x0, #0x2a0]
 45a3688: f9416800     	ldr	x0, [x0, #0x2d0]
 45a368c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3690: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3694: f9404529     	ldr	x9, [x9, #0x88]
 45a3698: eb09011f     	cmp	x8, x9
 45a369c: 54000041     	b.ne	0x45a36a4 <_ChromeMain+0x459e408>
 45a36a0: 96e9fce7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a36a4: f9016a9f     	str	xzr, [x20, #0x2d0]
 45a36a8: f9416680     	ldr	x0, [x20, #0x2c8]
 45a36ac: b5000200     	cbnz	x0, 0x45a36ec <_ChromeMain+0x459e450>
 45a36b0: f9416280     	ldr	x0, [x20, #0x2c0]
 45a36b4: b50000e0     	cbnz	x0, 0x45a36d0 <_ChromeMain+0x459e434>
 45a36b8: 910a8280     	add	x0, x20, #0x2a0
 45a36bc: 973258c0     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a36c0: aa1303e0     	mov	x0, x19
 45a36c4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a36c8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a36cc: 17373070     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a36d0: 12800008     	mov	w8, #-0x1               ; =-1
 45a36d4: b8e80008     	ldaddal	w8, w8, [x0]
 45a36d8: 7100051f     	cmp	w8, #0x1
 45a36dc: 54fffee1     	b.ne	0x45a36b8 <_ChromeMain+0x459e41c>
 45a36e0: f9400808     	ldr	x8, [x0, #0x10]
 45a36e4: d63f0100     	blr	x8
 45a36e8: 17fffff4     	b	0x45a36b8 <_ChromeMain+0x459e41c>
 45a36ec: 12800008     	mov	w8, #-0x1               ; =-1
 45a36f0: b8e80008     	ldaddal	w8, w8, [x0]
 45a36f4: 7100051f     	cmp	w8, #0x1
 45a36f8: 54fffdc1     	b.ne	0x45a36b0 <_ChromeMain+0x459e414>
 45a36fc: f9400808     	ldr	x8, [x0, #0x10]
 45a3700: d63f0100     	blr	x8
 45a3704: 17ffffeb     	b	0x45a36b0 <_ChromeMain+0x459e414>
 45a3708: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a370c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3710: 910043fd     	add	x29, sp, #0x10
 45a3714: aa0003f4     	mov	x20, x0
 45a3718: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a371c: 9120c108     	add	x8, x8, #0x830
 45a3720: aa0003f3     	mov	x19, x0
 45a3724: f8190e68     	str	x8, [x19, #-0x70]!
 45a3728: 910fe109     	add	x9, x8, #0x3f8
 45a372c: 9110810a     	add	x10, x8, #0x420
 45a3730: a939a809     	stp	x9, x10, [x0, #-0x68]
 45a3734: 91116109     	add	x9, x8, #0x458
 45a3738: 9112210a     	add	x10, x8, #0x488
 45a373c: a93fa809     	stp	x9, x10, [x0, #-0x8]
 45a3740: 91136109     	add	x9, x8, #0x4d8
 45a3744: f9002009     	str	x9, [x0, #0x40]
 45a3748: 9114e109     	add	x9, x8, #0x538
 45a374c: f9003409     	str	x9, [x0, #0x68]
 45a3750: 9115a109     	add	x9, x8, #0x568
 45a3754: f9004409     	str	x9, [x0, #0x88]
 45a3758: 91164108     	add	x8, x8, #0x590
 45a375c: f9015008     	str	x8, [x0, #0x2a0]
 45a3760: f9416800     	ldr	x0, [x0, #0x2d0]
 45a3764: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3768: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a376c: f9404529     	ldr	x9, [x9, #0x88]
 45a3770: eb09011f     	cmp	x8, x9
 45a3774: 54000041     	b.ne	0x45a377c <_ChromeMain+0x459e4e0>
 45a3778: 96e9fcb1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a377c: f9016a9f     	str	xzr, [x20, #0x2d0]
 45a3780: f9416680     	ldr	x0, [x20, #0x2c8]
 45a3784: b50001e0     	cbnz	x0, 0x45a37c0 <_ChromeMain+0x459e524>
 45a3788: f9416280     	ldr	x0, [x20, #0x2c0]
 45a378c: b5000280     	cbnz	x0, 0x45a37dc <_ChromeMain+0x459e540>
 45a3790: 910a8280     	add	x0, x20, #0x2a0
 45a3794: 9732588a     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3798: aa1303e0     	mov	x0, x19
 45a379c: 9737303c     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a37a0: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a37a4: 91120108     	add	x8, x8, #0x480
 45a37a8: f8bfc100     	ldapr	x0, [x8]
 45a37ac: b4000260     	cbz	x0, 0x45a37f8 <_ChromeMain+0x459e55c>
 45a37b0: aa1303e1     	mov	x1, x19
 45a37b4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a37b8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a37bc: 1726e4d9     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a37c0: 12800008     	mov	w8, #-0x1               ; =-1
 45a37c4: b8e80008     	ldaddal	w8, w8, [x0]
 45a37c8: 7100051f     	cmp	w8, #0x1
 45a37cc: 54fffde1     	b.ne	0x45a3788 <_ChromeMain+0x459e4ec>
 45a37d0: f9400808     	ldr	x8, [x0, #0x10]
 45a37d4: d63f0100     	blr	x8
 45a37d8: 17ffffec     	b	0x45a3788 <_ChromeMain+0x459e4ec>
 45a37dc: 12800008     	mov	w8, #-0x1               ; =-1
 45a37e0: b8e80008     	ldaddal	w8, w8, [x0]
 45a37e4: 7100051f     	cmp	w8, #0x1
 45a37e8: 54fffd41     	b.ne	0x45a3790 <_ChromeMain+0x459e4f4>
 45a37ec: f9400808     	ldr	x8, [x0, #0x10]
 45a37f0: d63f0100     	blr	x8
 45a37f4: 17ffffe7     	b	0x45a3790 <_ChromeMain+0x459e4f4>
 45a37f8: 97f4bfc0     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a37fc: 17ffffed     	b	0x45a37b0 <_ChromeMain+0x459e514>
 45a3800: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3804: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3808: 910043fd     	add	x29, sp, #0x10
 45a380c: aa0003f4     	mov	x20, x0
 45a3810: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3814: 9120c108     	add	x8, x8, #0x830
 45a3818: aa0003f3     	mov	x19, x0
 45a381c: f8150e68     	str	x8, [x19, #-0xb0]!
 45a3820: 910fe109     	add	x9, x8, #0x3f8
 45a3824: 9110810a     	add	x10, x8, #0x420
 45a3828: a935a809     	stp	x9, x10, [x0, #-0xa8]
 45a382c: 91116109     	add	x9, x8, #0x458
 45a3830: 9112210a     	add	x10, x8, #0x488
 45a3834: a93ba809     	stp	x9, x10, [x0, #-0x48]
 45a3838: 91136109     	add	x9, x8, #0x4d8
 45a383c: f9000009     	str	x9, [x0]
 45a3840: 9114e109     	add	x9, x8, #0x538
 45a3844: f9001409     	str	x9, [x0, #0x28]
 45a3848: 9115a109     	add	x9, x8, #0x568
 45a384c: f9002409     	str	x9, [x0, #0x48]
 45a3850: 91164108     	add	x8, x8, #0x590
 45a3854: f9013008     	str	x8, [x0, #0x260]
 45a3858: f9414800     	ldr	x0, [x0, #0x290]
 45a385c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3860: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3864: f9404529     	ldr	x9, [x9, #0x88]
 45a3868: eb09011f     	cmp	x8, x9
 45a386c: 54000041     	b.ne	0x45a3874 <_ChromeMain+0x459e5d8>
 45a3870: 96e9fc73     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3874: f9014a9f     	str	xzr, [x20, #0x290]
 45a3878: f9414680     	ldr	x0, [x20, #0x288]
 45a387c: b5000200     	cbnz	x0, 0x45a38bc <_ChromeMain+0x459e620>
 45a3880: f9414280     	ldr	x0, [x20, #0x280]
 45a3884: b50000e0     	cbnz	x0, 0x45a38a0 <_ChromeMain+0x459e604>
 45a3888: 91098280     	add	x0, x20, #0x260
 45a388c: 9732584c     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3890: aa1303e0     	mov	x0, x19
 45a3894: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3898: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a389c: 17372ffc     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a38a0: 12800008     	mov	w8, #-0x1               ; =-1
 45a38a4: b8e80008     	ldaddal	w8, w8, [x0]
 45a38a8: 7100051f     	cmp	w8, #0x1
 45a38ac: 54fffee1     	b.ne	0x45a3888 <_ChromeMain+0x459e5ec>
 45a38b0: f9400808     	ldr	x8, [x0, #0x10]
 45a38b4: d63f0100     	blr	x8
 45a38b8: 17fffff4     	b	0x45a3888 <_ChromeMain+0x459e5ec>
 45a38bc: 12800008     	mov	w8, #-0x1               ; =-1
 45a38c0: b8e80008     	ldaddal	w8, w8, [x0]
 45a38c4: 7100051f     	cmp	w8, #0x1
 45a38c8: 54fffdc1     	b.ne	0x45a3880 <_ChromeMain+0x459e5e4>
 45a38cc: f9400808     	ldr	x8, [x0, #0x10]
 45a38d0: d63f0100     	blr	x8
 45a38d4: 17ffffeb     	b	0x45a3880 <_ChromeMain+0x459e5e4>
 45a38d8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a38dc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a38e0: 910043fd     	add	x29, sp, #0x10
 45a38e4: aa0003f4     	mov	x20, x0
 45a38e8: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a38ec: 9120c108     	add	x8, x8, #0x830
 45a38f0: aa0003f3     	mov	x19, x0
 45a38f4: f8150e68     	str	x8, [x19, #-0xb0]!
 45a38f8: 910fe109     	add	x9, x8, #0x3f8
 45a38fc: 9110810a     	add	x10, x8, #0x420
 45a3900: a935a809     	stp	x9, x10, [x0, #-0xa8]
 45a3904: 91116109     	add	x9, x8, #0x458
 45a3908: 9112210a     	add	x10, x8, #0x488
 45a390c: a93ba809     	stp	x9, x10, [x0, #-0x48]
 45a3910: 91136109     	add	x9, x8, #0x4d8
 45a3914: f9000009     	str	x9, [x0]
 45a3918: 9114e109     	add	x9, x8, #0x538
 45a391c: f9001409     	str	x9, [x0, #0x28]
 45a3920: 9115a109     	add	x9, x8, #0x568
 45a3924: f9002409     	str	x9, [x0, #0x48]
 45a3928: 91164108     	add	x8, x8, #0x590
 45a392c: f9013008     	str	x8, [x0, #0x260]
 45a3930: f9414800     	ldr	x0, [x0, #0x290]
 45a3934: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3938: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a393c: f9404529     	ldr	x9, [x9, #0x88]
 45a3940: eb09011f     	cmp	x8, x9
 45a3944: 54000041     	b.ne	0x45a394c <_ChromeMain+0x459e6b0>
 45a3948: 96e9fc3d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a394c: f9014a9f     	str	xzr, [x20, #0x290]
 45a3950: f9414680     	ldr	x0, [x20, #0x288]
 45a3954: b50001e0     	cbnz	x0, 0x45a3990 <_ChromeMain+0x459e6f4>
 45a3958: f9414280     	ldr	x0, [x20, #0x280]
 45a395c: b5000280     	cbnz	x0, 0x45a39ac <_ChromeMain+0x459e710>
 45a3960: 91098280     	add	x0, x20, #0x260
 45a3964: 97325816     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3968: aa1303e0     	mov	x0, x19
 45a396c: 97372fc8     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3970: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a3974: 91120108     	add	x8, x8, #0x480
 45a3978: f8bfc100     	ldapr	x0, [x8]
 45a397c: b4000260     	cbz	x0, 0x45a39c8 <_ChromeMain+0x459e72c>
 45a3980: aa1303e1     	mov	x1, x19
 45a3984: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3988: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a398c: 1726e465     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3990: 12800008     	mov	w8, #-0x1               ; =-1
 45a3994: b8e80008     	ldaddal	w8, w8, [x0]
 45a3998: 7100051f     	cmp	w8, #0x1
 45a399c: 54fffde1     	b.ne	0x45a3958 <_ChromeMain+0x459e6bc>
 45a39a0: f9400808     	ldr	x8, [x0, #0x10]
 45a39a4: d63f0100     	blr	x8
 45a39a8: 17ffffec     	b	0x45a3958 <_ChromeMain+0x459e6bc>
 45a39ac: 12800008     	mov	w8, #-0x1               ; =-1
 45a39b0: b8e80008     	ldaddal	w8, w8, [x0]
 45a39b4: 7100051f     	cmp	w8, #0x1
 45a39b8: 54fffd41     	b.ne	0x45a3960 <_ChromeMain+0x459e6c4>
 45a39bc: f9400808     	ldr	x8, [x0, #0x10]
 45a39c0: d63f0100     	blr	x8
 45a39c4: 17ffffe7     	b	0x45a3960 <_ChromeMain+0x459e6c4>
 45a39c8: 97f4bf4c     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a39cc: 17ffffed     	b	0x45a3980 <_ChromeMain+0x459e6e4>
 45a39d0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a39d4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a39d8: 910043fd     	add	x29, sp, #0x10
 45a39dc: aa0003f4     	mov	x20, x0
 45a39e0: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a39e4: 9120c108     	add	x8, x8, #0x830
 45a39e8: aa0003f3     	mov	x19, x0
 45a39ec: f8128e68     	str	x8, [x19, #-0xd8]!
 45a39f0: 910fe109     	add	x9, x8, #0x3f8
 45a39f4: 9110810a     	add	x10, x8, #0x420
 45a39f8: a9332809     	stp	x9, x10, [x0, #-0xd0]
 45a39fc: 91116109     	add	x9, x8, #0x458
 45a3a00: 9112210a     	add	x10, x8, #0x488
 45a3a04: a9392809     	stp	x9, x10, [x0, #-0x70]
 45a3a08: 91136109     	add	x9, x8, #0x4d8
 45a3a0c: f81d8009     	stur	x9, [x0, #-0x28]
 45a3a10: 9114e109     	add	x9, x8, #0x538
 45a3a14: f9000009     	str	x9, [x0]
 45a3a18: 9115a109     	add	x9, x8, #0x568
 45a3a1c: f9001009     	str	x9, [x0, #0x20]
 45a3a20: 91164108     	add	x8, x8, #0x590
 45a3a24: f9011c08     	str	x8, [x0, #0x238]
 45a3a28: f9413400     	ldr	x0, [x0, #0x268]
 45a3a2c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3a30: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3a34: f9404529     	ldr	x9, [x9, #0x88]
 45a3a38: eb09011f     	cmp	x8, x9
 45a3a3c: 54000041     	b.ne	0x45a3a44 <_ChromeMain+0x459e7a8>
 45a3a40: 96e9fbff     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3a44: f901369f     	str	xzr, [x20, #0x268]
 45a3a48: f9413280     	ldr	x0, [x20, #0x260]
 45a3a4c: b5000200     	cbnz	x0, 0x45a3a8c <_ChromeMain+0x459e7f0>
 45a3a50: f9412e80     	ldr	x0, [x20, #0x258]
 45a3a54: b50000e0     	cbnz	x0, 0x45a3a70 <_ChromeMain+0x459e7d4>
 45a3a58: 9108e280     	add	x0, x20, #0x238
 45a3a5c: 973257d8     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3a60: aa1303e0     	mov	x0, x19
 45a3a64: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3a68: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3a6c: 17372f88     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3a70: 12800008     	mov	w8, #-0x1               ; =-1
 45a3a74: b8e80008     	ldaddal	w8, w8, [x0]
 45a3a78: 7100051f     	cmp	w8, #0x1
 45a3a7c: 54fffee1     	b.ne	0x45a3a58 <_ChromeMain+0x459e7bc>
 45a3a80: f9400808     	ldr	x8, [x0, #0x10]
 45a3a84: d63f0100     	blr	x8
 45a3a88: 17fffff4     	b	0x45a3a58 <_ChromeMain+0x459e7bc>
 45a3a8c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3a90: b8e80008     	ldaddal	w8, w8, [x0]
 45a3a94: 7100051f     	cmp	w8, #0x1
 45a3a98: 54fffdc1     	b.ne	0x45a3a50 <_ChromeMain+0x459e7b4>
 45a3a9c: f9400808     	ldr	x8, [x0, #0x10]
 45a3aa0: d63f0100     	blr	x8
 45a3aa4: 17ffffeb     	b	0x45a3a50 <_ChromeMain+0x459e7b4>
 45a3aa8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3aac: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3ab0: 910043fd     	add	x29, sp, #0x10
 45a3ab4: aa0003f4     	mov	x20, x0
 45a3ab8: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3abc: 9120c108     	add	x8, x8, #0x830
 45a3ac0: aa0003f3     	mov	x19, x0
 45a3ac4: f8128e68     	str	x8, [x19, #-0xd8]!
 45a3ac8: 910fe109     	add	x9, x8, #0x3f8
 45a3acc: 9110810a     	add	x10, x8, #0x420
 45a3ad0: a9332809     	stp	x9, x10, [x0, #-0xd0]
 45a3ad4: 91116109     	add	x9, x8, #0x458
 45a3ad8: 9112210a     	add	x10, x8, #0x488
 45a3adc: a9392809     	stp	x9, x10, [x0, #-0x70]
 45a3ae0: 91136109     	add	x9, x8, #0x4d8
 45a3ae4: f81d8009     	stur	x9, [x0, #-0x28]
 45a3ae8: 9114e109     	add	x9, x8, #0x538
 45a3aec: f9000009     	str	x9, [x0]
 45a3af0: 9115a109     	add	x9, x8, #0x568
 45a3af4: f9001009     	str	x9, [x0, #0x20]
 45a3af8: 91164108     	add	x8, x8, #0x590
 45a3afc: f9011c08     	str	x8, [x0, #0x238]
 45a3b00: f9413400     	ldr	x0, [x0, #0x268]
 45a3b04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3b08: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3b0c: f9404529     	ldr	x9, [x9, #0x88]
 45a3b10: eb09011f     	cmp	x8, x9
 45a3b14: 54000041     	b.ne	0x45a3b1c <_ChromeMain+0x459e880>
 45a3b18: 96e9fbc9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3b1c: f901369f     	str	xzr, [x20, #0x268]
 45a3b20: f9413280     	ldr	x0, [x20, #0x260]
 45a3b24: b50001e0     	cbnz	x0, 0x45a3b60 <_ChromeMain+0x459e8c4>
 45a3b28: f9412e80     	ldr	x0, [x20, #0x258]
 45a3b2c: b5000280     	cbnz	x0, 0x45a3b7c <_ChromeMain+0x459e8e0>
 45a3b30: 9108e280     	add	x0, x20, #0x238
 45a3b34: 973257a2     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3b38: aa1303e0     	mov	x0, x19
 45a3b3c: 97372f54     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3b40: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a3b44: 91120108     	add	x8, x8, #0x480
 45a3b48: f8bfc100     	ldapr	x0, [x8]
 45a3b4c: b4000260     	cbz	x0, 0x45a3b98 <_ChromeMain+0x459e8fc>
 45a3b50: aa1303e1     	mov	x1, x19
 45a3b54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3b58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3b5c: 1726e3f1     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3b60: 12800008     	mov	w8, #-0x1               ; =-1
 45a3b64: b8e80008     	ldaddal	w8, w8, [x0]
 45a3b68: 7100051f     	cmp	w8, #0x1
 45a3b6c: 54fffde1     	b.ne	0x45a3b28 <_ChromeMain+0x459e88c>
 45a3b70: f9400808     	ldr	x8, [x0, #0x10]
 45a3b74: d63f0100     	blr	x8
 45a3b78: 17ffffec     	b	0x45a3b28 <_ChromeMain+0x459e88c>
 45a3b7c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3b80: b8e80008     	ldaddal	w8, w8, [x0]
 45a3b84: 7100051f     	cmp	w8, #0x1
 45a3b88: 54fffd41     	b.ne	0x45a3b30 <_ChromeMain+0x459e894>
 45a3b8c: f9400808     	ldr	x8, [x0, #0x10]
 45a3b90: d63f0100     	blr	x8
 45a3b94: 17ffffe7     	b	0x45a3b30 <_ChromeMain+0x459e894>
 45a3b98: 97f4bed8     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a3b9c: 17ffffed     	b	0x45a3b50 <_ChromeMain+0x459e8b4>
 45a3ba0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3ba4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3ba8: 910043fd     	add	x29, sp, #0x10
 45a3bac: aa0003f4     	mov	x20, x0
 45a3bb0: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3bb4: 9120c108     	add	x8, x8, #0x830
 45a3bb8: aa0003f3     	mov	x19, x0
 45a3bbc: f8108e68     	str	x8, [x19, #-0xf8]!
 45a3bc0: 910fe109     	add	x9, x8, #0x3f8
 45a3bc4: 9110810a     	add	x10, x8, #0x420
 45a3bc8: a9312809     	stp	x9, x10, [x0, #-0xf0]
 45a3bcc: 91116109     	add	x9, x8, #0x458
 45a3bd0: 9112210a     	add	x10, x8, #0x488
 45a3bd4: a9372809     	stp	x9, x10, [x0, #-0x90]
 45a3bd8: 91136109     	add	x9, x8, #0x4d8
 45a3bdc: f81b8009     	stur	x9, [x0, #-0x48]
 45a3be0: 9114e109     	add	x9, x8, #0x538
 45a3be4: f81e0009     	stur	x9, [x0, #-0x20]
 45a3be8: 9115a109     	add	x9, x8, #0x568
 45a3bec: f9000009     	str	x9, [x0]
 45a3bf0: 91164108     	add	x8, x8, #0x590
 45a3bf4: f9010c08     	str	x8, [x0, #0x218]
 45a3bf8: f9412400     	ldr	x0, [x0, #0x248]
 45a3bfc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3c00: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3c04: f9404529     	ldr	x9, [x9, #0x88]
 45a3c08: eb09011f     	cmp	x8, x9
 45a3c0c: 54000041     	b.ne	0x45a3c14 <_ChromeMain+0x459e978>
 45a3c10: 96e9fb8b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3c14: f901269f     	str	xzr, [x20, #0x248]
 45a3c18: f9412280     	ldr	x0, [x20, #0x240]
 45a3c1c: b5000200     	cbnz	x0, 0x45a3c5c <_ChromeMain+0x459e9c0>
 45a3c20: f9411e80     	ldr	x0, [x20, #0x238]
 45a3c24: b50000e0     	cbnz	x0, 0x45a3c40 <_ChromeMain+0x459e9a4>
 45a3c28: 91086280     	add	x0, x20, #0x218
 45a3c2c: 97325764     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3c30: aa1303e0     	mov	x0, x19
 45a3c34: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3c38: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3c3c: 17372f14     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3c40: 12800008     	mov	w8, #-0x1               ; =-1
 45a3c44: b8e80008     	ldaddal	w8, w8, [x0]
 45a3c48: 7100051f     	cmp	w8, #0x1
 45a3c4c: 54fffee1     	b.ne	0x45a3c28 <_ChromeMain+0x459e98c>
 45a3c50: f9400808     	ldr	x8, [x0, #0x10]
 45a3c54: d63f0100     	blr	x8
 45a3c58: 17fffff4     	b	0x45a3c28 <_ChromeMain+0x459e98c>
 45a3c5c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3c60: b8e80008     	ldaddal	w8, w8, [x0]
 45a3c64: 7100051f     	cmp	w8, #0x1
 45a3c68: 54fffdc1     	b.ne	0x45a3c20 <_ChromeMain+0x459e984>
 45a3c6c: f9400808     	ldr	x8, [x0, #0x10]
 45a3c70: d63f0100     	blr	x8
 45a3c74: 17ffffeb     	b	0x45a3c20 <_ChromeMain+0x459e984>
 45a3c78: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3c7c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3c80: 910043fd     	add	x29, sp, #0x10
 45a3c84: aa0003f4     	mov	x20, x0
 45a3c88: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3c8c: 9120c108     	add	x8, x8, #0x830
 45a3c90: aa0003f3     	mov	x19, x0
 45a3c94: f8108e68     	str	x8, [x19, #-0xf8]!
 45a3c98: 910fe109     	add	x9, x8, #0x3f8
 45a3c9c: 9110810a     	add	x10, x8, #0x420
 45a3ca0: a9312809     	stp	x9, x10, [x0, #-0xf0]
 45a3ca4: 91116109     	add	x9, x8, #0x458
 45a3ca8: 9112210a     	add	x10, x8, #0x488
 45a3cac: a9372809     	stp	x9, x10, [x0, #-0x90]
 45a3cb0: 91136109     	add	x9, x8, #0x4d8
 45a3cb4: f81b8009     	stur	x9, [x0, #-0x48]
 45a3cb8: 9114e109     	add	x9, x8, #0x538
 45a3cbc: f81e0009     	stur	x9, [x0, #-0x20]
 45a3cc0: 9115a109     	add	x9, x8, #0x568
 45a3cc4: f9000009     	str	x9, [x0]
 45a3cc8: 91164108     	add	x8, x8, #0x590
 45a3ccc: f9010c08     	str	x8, [x0, #0x218]
 45a3cd0: f9412400     	ldr	x0, [x0, #0x248]
 45a3cd4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3cd8: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3cdc: f9404529     	ldr	x9, [x9, #0x88]
 45a3ce0: eb09011f     	cmp	x8, x9
 45a3ce4: 54000041     	b.ne	0x45a3cec <_ChromeMain+0x459ea50>
 45a3ce8: 96e9fb55     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3cec: f901269f     	str	xzr, [x20, #0x248]
 45a3cf0: f9412280     	ldr	x0, [x20, #0x240]
 45a3cf4: b50001e0     	cbnz	x0, 0x45a3d30 <_ChromeMain+0x459ea94>
 45a3cf8: f9411e80     	ldr	x0, [x20, #0x238]
 45a3cfc: b5000280     	cbnz	x0, 0x45a3d4c <_ChromeMain+0x459eab0>
 45a3d00: 91086280     	add	x0, x20, #0x218
 45a3d04: 9732572e     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3d08: aa1303e0     	mov	x0, x19
 45a3d0c: 97372ee0     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3d10: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a3d14: 91120108     	add	x8, x8, #0x480
 45a3d18: f8bfc100     	ldapr	x0, [x8]
 45a3d1c: b4000260     	cbz	x0, 0x45a3d68 <_ChromeMain+0x459eacc>
 45a3d20: aa1303e1     	mov	x1, x19
 45a3d24: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3d28: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3d2c: 1726e37d     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3d30: 12800008     	mov	w8, #-0x1               ; =-1
 45a3d34: b8e80008     	ldaddal	w8, w8, [x0]
 45a3d38: 7100051f     	cmp	w8, #0x1
 45a3d3c: 54fffde1     	b.ne	0x45a3cf8 <_ChromeMain+0x459ea5c>
 45a3d40: f9400808     	ldr	x8, [x0, #0x10]
 45a3d44: d63f0100     	blr	x8
 45a3d48: 17ffffec     	b	0x45a3cf8 <_ChromeMain+0x459ea5c>
 45a3d4c: 12800008     	mov	w8, #-0x1               ; =-1
 45a3d50: b8e80008     	ldaddal	w8, w8, [x0]
 45a3d54: 7100051f     	cmp	w8, #0x1
 45a3d58: 54fffd41     	b.ne	0x45a3d00 <_ChromeMain+0x459ea64>
 45a3d5c: f9400808     	ldr	x8, [x0, #0x10]
 45a3d60: d63f0100     	blr	x8
 45a3d64: 17ffffe7     	b	0x45a3d00 <_ChromeMain+0x459ea64>
 45a3d68: 97f4be64     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a3d6c: 17ffffed     	b	0x45a3d20 <_ChromeMain+0x459ea84>
 45a3d70: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3d74: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3d78: 910043fd     	add	x29, sp, #0x10
 45a3d7c: aa0003f4     	mov	x20, x0
 45a3d80: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3d84: 9120c108     	add	x8, x8, #0x830
 45a3d88: d10c4013     	sub	x19, x0, #0x310
 45a3d8c: f9000268     	str	x8, [x19]
 45a3d90: d10c2009     	sub	x9, x0, #0x308
 45a3d94: 910fe10a     	add	x10, x8, #0x3f8
 45a3d98: f900012a     	str	x10, [x9]
 45a3d9c: d10c0009     	sub	x9, x0, #0x300
 45a3da0: 9110810a     	add	x10, x8, #0x420
 45a3da4: f900012a     	str	x10, [x9]
 45a3da8: d10aa009     	sub	x9, x0, #0x2a8
 45a3dac: 9111610a     	add	x10, x8, #0x458
 45a3db0: f900012a     	str	x10, [x9]
 45a3db4: d10a8009     	sub	x9, x0, #0x2a0
 45a3db8: 9112210a     	add	x10, x8, #0x488
 45a3dbc: f900012a     	str	x10, [x9]
 45a3dc0: d1098009     	sub	x9, x0, #0x260
 45a3dc4: 9113610a     	add	x10, x8, #0x4d8
 45a3dc8: f900012a     	str	x10, [x9]
 45a3dcc: d108e009     	sub	x9, x0, #0x238
 45a3dd0: 9114e10a     	add	x10, x8, #0x538
 45a3dd4: f900012a     	str	x10, [x9]
 45a3dd8: d1086009     	sub	x9, x0, #0x218
 45a3ddc: 9115a10a     	add	x10, x8, #0x568
 45a3de0: f900012a     	str	x10, [x9]
 45a3de4: 91164108     	add	x8, x8, #0x590
 45a3de8: f9000008     	str	x8, [x0]
 45a3dec: f9401800     	ldr	x0, [x0, #0x30]
 45a3df0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3df4: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3df8: f9404529     	ldr	x9, [x9, #0x88]
 45a3dfc: eb09011f     	cmp	x8, x9
 45a3e00: 54000041     	b.ne	0x45a3e08 <_ChromeMain+0x459eb6c>
 45a3e04: 96e9fb0e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3e08: f9001a9f     	str	xzr, [x20, #0x30]
 45a3e0c: f9401680     	ldr	x0, [x20, #0x28]
 45a3e10: b5000200     	cbnz	x0, 0x45a3e50 <_ChromeMain+0x459ebb4>
 45a3e14: f9401280     	ldr	x0, [x20, #0x20]
 45a3e18: b50000e0     	cbnz	x0, 0x45a3e34 <_ChromeMain+0x459eb98>
 45a3e1c: aa1403e0     	mov	x0, x20
 45a3e20: 973256e7     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3e24: aa1303e0     	mov	x0, x19
 45a3e28: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3e2c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3e30: 17372e97     	b	0x136f88c <_ChromeMain+0x136a5f0>
 45a3e34: 12800008     	mov	w8, #-0x1               ; =-1
 45a3e38: b8e80008     	ldaddal	w8, w8, [x0]
 45a3e3c: 7100051f     	cmp	w8, #0x1
 45a3e40: 54fffee1     	b.ne	0x45a3e1c <_ChromeMain+0x459eb80>
 45a3e44: f9400808     	ldr	x8, [x0, #0x10]
 45a3e48: d63f0100     	blr	x8
 45a3e4c: 17fffff4     	b	0x45a3e1c <_ChromeMain+0x459eb80>
 45a3e50: 12800008     	mov	w8, #-0x1               ; =-1
 45a3e54: b8e80008     	ldaddal	w8, w8, [x0]
 45a3e58: 7100051f     	cmp	w8, #0x1
 45a3e5c: 54fffdc1     	b.ne	0x45a3e14 <_ChromeMain+0x459eb78>
 45a3e60: f9400808     	ldr	x8, [x0, #0x10]
 45a3e64: d63f0100     	blr	x8
 45a3e68: 17ffffeb     	b	0x45a3e14 <_ChromeMain+0x459eb78>
 45a3e6c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a3e70: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a3e74: 910043fd     	add	x29, sp, #0x10
 45a3e78: aa0003f4     	mov	x20, x0
 45a3e7c: b0050ae8     	adrp	x8, 0xe700000 <dyld_stub_binder+0xe700000>
 45a3e80: 9120c108     	add	x8, x8, #0x830
 45a3e84: d10c4013     	sub	x19, x0, #0x310
 45a3e88: f9000268     	str	x8, [x19]
 45a3e8c: d10c2009     	sub	x9, x0, #0x308
 45a3e90: 910fe10a     	add	x10, x8, #0x3f8
 45a3e94: f900012a     	str	x10, [x9]
 45a3e98: d10c0009     	sub	x9, x0, #0x300
 45a3e9c: 9110810a     	add	x10, x8, #0x420
 45a3ea0: f900012a     	str	x10, [x9]
 45a3ea4: d10aa009     	sub	x9, x0, #0x2a8
 45a3ea8: 9111610a     	add	x10, x8, #0x458
 45a3eac: f900012a     	str	x10, [x9]
 45a3eb0: d10a8009     	sub	x9, x0, #0x2a0
 45a3eb4: 9112210a     	add	x10, x8, #0x488
 45a3eb8: f900012a     	str	x10, [x9]
 45a3ebc: d1098009     	sub	x9, x0, #0x260
 45a3ec0: 9113610a     	add	x10, x8, #0x4d8
 45a3ec4: f900012a     	str	x10, [x9]
 45a3ec8: d108e009     	sub	x9, x0, #0x238
 45a3ecc: 9114e10a     	add	x10, x8, #0x538
 45a3ed0: f900012a     	str	x10, [x9]
 45a3ed4: d1086009     	sub	x9, x0, #0x218
 45a3ed8: 9115a10a     	add	x10, x8, #0x568
 45a3edc: f900012a     	str	x10, [x9]
 45a3ee0: 91164108     	add	x8, x8, #0x590
 45a3ee4: f9000008     	str	x8, [x0]
 45a3ee8: f9401800     	ldr	x0, [x0, #0x30]
 45a3eec: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a3ef0: f0053069     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a3ef4: f9404529     	ldr	x9, [x9, #0x88]
 45a3ef8: eb09011f     	cmp	x8, x9
 45a3efc: 54000041     	b.ne	0x45a3f04 <_ChromeMain+0x459ec68>
 45a3f00: 96e9facf     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a3f04: f9001a9f     	str	xzr, [x20, #0x30]
 45a3f08: f9401680     	ldr	x0, [x20, #0x28]
 45a3f0c: b50001e0     	cbnz	x0, 0x45a3f48 <_ChromeMain+0x459ecac>
 45a3f10: f9401280     	ldr	x0, [x20, #0x20]
 45a3f14: b5000280     	cbnz	x0, 0x45a3f64 <_ChromeMain+0x459ecc8>
 45a3f18: aa1403e0     	mov	x0, x20
 45a3f1c: 973256a8     	bl	0x12399bc <_ChromeMain+0x1234720>
 45a3f20: aa1303e0     	mov	x0, x19
 45a3f24: 97372e5a     	bl	0x136f88c <_ChromeMain+0x136a5f0>
 45a3f28: f0054b28     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45a3f2c: 91120108     	add	x8, x8, #0x480
 45a3f30: f8bfc100     	ldapr	x0, [x8]
 45a3f34: b4000260     	cbz	x0, 0x45a3f80 <_ChromeMain+0x459ece4>
 45a3f38: aa1303e1     	mov	x1, x19
 45a3f3c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a3f40: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a3f44: 1726e2f7     	b	0xf5cb20 <_ChromeMain+0xf57884>
 45a3f48: 12800008     	mov	w8, #-0x1               ; =-1
 45a3f4c: b8e80008     	ldaddal	w8, w8, [x0]
 45a3f50: 7100051f     	cmp	w8, #0x1
 45a3f54: 54fffde1     	b.ne	0x45a3f10 <_ChromeMain+0x459ec74>
 45a3f58: f9400808     	ldr	x8, [x0, #0x10]
 45a3f5c: d63f0100     	blr	x8
 45a3f60: 17ffffec     	b	0x45a3f10 <_ChromeMain+0x459ec74>
 45a3f64: 12800008     	mov	w8, #-0x1               ; =-1
 45a3f68: b8e80008     	ldaddal	w8, w8, [x0]
 45a3f6c: 7100051f     	cmp	w8, #0x1
 45a3f70: 54fffd41     	b.ne	0x45a3f18 <_ChromeMain+0x459ec7c>
 45a3f74: f9400808     	ldr	x8, [x0, #0x10]
 45a3f78: d63f0100     	blr	x8
 45a3f7c: 17ffffe7     	b	0x45a3f18 <_ChromeMain+0x459ec7c>
 45a3f80: 97f4bdde     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45a3f84: 17ffffed     	b	0x45a3f38 <_ChromeMain+0x459ec9c>
 45a3f88: d10c4000     	sub	x0, x0, #0x310
 45a3f8c: 1400001d     	b	0x45a4000 <_ChromeMain+0x459ed64>
 45a3f90: b40001a1     	cbz	x1, 0x45a3fc4 <_ChromeMain+0x459ed28>
 45a3f94: f9400028     	ldr	x8, [x1]
 45a3f98: f940450a     	ldr	x10, [x8, #0x88]
 45a3f9c: f0ffd50b     	adrp	x11, 0x4046000 <_ChromeMain+0x4040d64>
 45a3fa0: 9135016b     	add	x11, x11, #0xd40
 45a3fa4: f9403c29     	ldr	x9, [x1, #0x78]
 45a3fa8: f9400528     	ldr	x8, [x9, #0x8]
 45a3fac: eb0b015f     	cmp	x10, x11
 45a3fb0: 54000181     	b.ne	0x45a3fe0 <_ChromeMain+0x459ed44>
 45a3fb4: b40001e8     	cbz	x8, 0x45a3ff0 <_ChromeMain+0x459ed54>
 45a3fb8: 9105a10a     	add	x10, x8, #0x168
 45a3fbc: eb09015f     	cmp	x10, x9
 45a3fc0: 54000040     	b.eq	0x45a3fc8 <_ChromeMain+0x459ed2c>
 45a3fc4: d65f03c0     	ret
 45a3fc8: b9415908     	ldr	w8, [x8, #0x158]
 45a3fcc: 7100111f     	cmp	w8, #0x4
 45a3fd0: 54000162     	b.hs	0x45a3ffc <_ChromeMain+0x459ed60>
 45a3fd4: 35ffff88     	cbnz	w8, 0x45a3fc4 <_ChromeMain+0x459ed28>
 45a3fd8: d10c4000     	sub	x0, x0, #0x310
 45a3fdc: 14000009     	b	0x45a4000 <_ChromeMain+0x459ed64>
 45a3fe0: b5fffec8     	cbnz	x8, 0x45a3fb8 <_ChromeMain+0x459ed1c>
 45a3fe4: d4200000     	brk	#0
 45a3fe8: d4400000     	hlt	#0
 45a3fec: d4200020     	brk	#0x1
 45a3ff0: d4200000     	brk	#0
 45a3ff4: d4400000     	hlt	#0
 45a3ff8: d4200020     	brk	#0x1
 45a3ffc: d42aa160     	brk	#0x550b
 45a4000: d10343ff     	sub	sp, sp, #0xd0
 45a4004: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 45a4008: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 45a400c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 45a4010: 910303fd     	add	x29, sp, #0xc0
 45a4014: f941a013     	ldr	x19, [x0, #0x340]
 45a4018: b4000bd3     	cbz	x19, 0x45a4190 <_ChromeMain+0x459eef4>
 45a401c: f9401274     	ldr	x20, [x19, #0x20]
 45a4020: b4000174     	cbz	x20, 0x45a404c <_ChromeMain+0x459edb0>
 45a4024: b9400a88     	ldr	w8, [x20, #0x8]
 45a4028: 7100091f     	cmp	w8, #0x2
 45a402c: 540001c0     	b.eq	0x45a4064 <_ChromeMain+0x459edc8>
 45a4030: 39422a88     	ldrb	w8, [x20, #0x8a]
 45a4034: 34000268     	cbz	w8, 0x45a4080 <_ChromeMain+0x459ede4>
 45a4038: 39022a9f     	strb	wzr, [x20, #0x8a]
 45a403c: f940b680     	ldr	x0, [x20, #0x168]
 45a4040: 52800001     	mov	w1, #0x0                ; =0
 45a4044: 9720a6bf     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 45a4048: 1400000e     	b	0x45a4080 <_ChromeMain+0x459ede4>
 45a404c: aa1303e0     	mov	x0, x19
 45a4050: 52800021     	mov	w1, #0x1                ; =1
 45a4054: 9759c60e     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 45a4058: f9401274     	ldr	x20, [x19, #0x20]
 45a405c: b4000134     	cbz	x20, 0x45a4080 <_ChromeMain+0x459ede4>
 45a4060: 17fffff1     	b	0x45a4024 <_ChromeMain+0x459ed88>
 45a4064: f940b280     	ldr	x0, [x20, #0x160]
 45a4068: b40009e0     	cbz	x0, 0x45a41a4 <_ChromeMain+0x459ef08>
 45a406c: 6f00e400     	movi.2d	v0, #0000000000000000
 45a4070: 6f00e401     	movi.2d	v1, #0000000000000000
 45a4074: 6f00e402     	movi.2d	v2, #0000000000000000
 45a4078: 6f00e403     	movi.2d	v3, #0000000000000000
 45a407c: 9746910c     	bl	0x17484ac <_ChromeMain+0x1743210>
 45a4080: f941c668     	ldr	x8, [x19, #0x388]
 45a4084: b4000088     	cbz	x8, 0x45a4094 <_ChromeMain+0x459edf8>
 45a4088: b903251f     	str	wzr, [x8, #0x324]
 45a408c: 52800029     	mov	w9, #0x1                ; =1
 45a4090: 390ca109     	strb	w9, [x8, #0x328]
 45a4094: 9100a3f4     	add	x20, sp, #0x28
 45a4098: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 45a409c: b803f3ff     	stur	wzr, [sp, #0x3f]
 45a40a0: f9001fff     	str	xzr, [sp, #0x38]
 45a40a4: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 45a40a8: 3c8483e0     	stur	q0, [sp, #0x48]
 45a40ac: 3c8583e0     	stur	q0, [sp, #0x58]
 45a40b0: 3c8683e0     	stur	q0, [sp, #0x68]
 45a40b4: 3c8783e0     	stur	q0, [sp, #0x78]
 45a40b8: 790113ff     	strh	wzr, [sp, #0x88]
 45a40bc: a9097fff     	stp	xzr, xzr, [sp, #0x90]
 45a40c0: b004c920     	adrp	x0, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a40c4: 911c6c00     	add	x0, x0, #0x71b
 45a40c8: b004c921     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 45a40cc: 911de021     	add	x1, x1, #0x778
 45a40d0: 910023e8     	add	x8, sp, #0x8
 45a40d4: 52801d42     	mov	w2, #0xea               ; =234
 45a40d8: 96eab2ea     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 45a40dc: 9100a3e1     	add	x1, sp, #0x28
 45a40e0: 910023e2     	add	x2, sp, #0x8
 45a40e4: aa1303e0     	mov	x0, x19
 45a40e8: 9792f107     	bl	0x2a60504 <_ChromeMain+0x2a5b268>
 45a40ec: aa0003f3     	mov	x19, x0
 45a40f0: 9101c280     	add	x0, x20, #0x70
 45a40f4: d2800001     	mov	x1, #0x0                ; =0
 45a40f8: 96ea0ef0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 45a40fc: 91008280     	add	x0, x20, #0x20
 45a4100: 96ea0ede     	bl	0x27c78 <_ChromeMain+0x229dc>
 45a4104: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 45a4108: 36f800a8     	tbz	w8, #0x1f, 0x45a411c <_ChromeMain+0x459ee80>
 45a410c: f94017e0     	ldr	x0, [sp, #0x28]
 45a4110: f9401fe8     	ldr	x8, [sp, #0x38]
 45a4114: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45a4118: 96e99368     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a411c: b40003b3     	cbz	x19, 0x45a4190 <_ChromeMain+0x459eef4>
 45a4120: aa1303e0     	mov	x0, x19
 45a4124: 52800001     	mov	w1, #0x0                ; =0
 45a4128: 9792faf6     	bl	0x2a62d00 <_ChromeMain+0x2a5da64>
 45a412c: 52823088     	mov	w8, #0x1184             ; =4484
 45a4130: 38686a69     	ldrb	w9, [x19, x8]
 45a4134: 35000569     	cbnz	w9, 0x45a41e0 <_ChromeMain+0x459ef44>
 45a4138: b911827f     	str	wzr, [x19, #0x1180]
 45a413c: 52800029     	mov	w9, #0x1                ; =1
 45a4140: 38286a69     	strb	w9, [x19, x8]
 45a4144: b9002bff     	str	wzr, [sp, #0x28]
 45a4148: 3900b3e9     	strb	w9, [sp, #0x2c]
 45a414c: 90ffd5a2     	adrp	x2, 0x4058000 <_ChromeMain+0x4052d64>
 45a4150: 911e4042     	add	x2, x2, #0x790
 45a4154: 9100a3e1     	add	x1, sp, #0x28
 45a4158: aa1303e0     	mov	x0, x19
 45a415c: 97932a0d     	bl	0x2a6e990 <_ChromeMain+0x2a696f4>
 45a4160: f9447e60     	ldr	x0, [x19, #0x8f8]
 45a4164: b4000160     	cbz	x0, 0x45a4190 <_ChromeMain+0x459eef4>
 45a4168: 973c7a82     	bl	0x14c2b70 <_ChromeMain+0x14bd8d4>
 45a416c: b4000120     	cbz	x0, 0x45a4190 <_ChromeMain+0x459eef4>
 45a4170: aa0003f3     	mov	x19, x0
 45a4174: 52800001     	mov	w1, #0x0                ; =0
 45a4178: 97b41092     	bl	0x32a83c0 <_ChromeMain+0x32a3124>
 45a417c: f9400268     	ldr	x8, [x19]
 45a4180: f9405108     	ldr	x8, [x8, #0xa0]
 45a4184: aa1303e0     	mov	x0, x19
 45a4188: d2c00021     	mov	x1, #0x100000000        ; =4294967296
 45a418c: d63f0100     	blr	x8
 45a4190: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 45a4194: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 45a4198: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 45a419c: 910343ff     	add	sp, sp, #0xd0
 45a41a0: d65f03c0     	ret
 45a41a4: 52802400     	mov	w0, #0x120              ; =288
 45a41a8: 96e9ac70     	bl	0xf368 <_ChromeMain+0xa0cc>
 45a41ac: aa0003f5     	mov	x21, x0
 45a41b0: d2800001     	mov	x1, #0x0                ; =0
 45a41b4: 972b5849     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 45a41b8: b40000a0     	cbz	x0, 0x45a41cc <_ChromeMain+0x459ef30>
 45a41bc: b9400aa8     	ldr	w8, [x21, #0x8]
 45a41c0: 31000508     	adds	w8, w8, #0x1
 45a41c4: b9000aa8     	str	w8, [x21, #0x8]
 45a41c8: 54000122     	b.hs	0x45a41ec <_ChromeMain+0x459ef50>
 45a41cc: aa1403e0     	mov	x0, x20
 45a41d0: aa1503e1     	mov	x1, x21
 45a41d4: 9733600a     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 45a41d8: f940b280     	ldr	x0, [x20, #0x160]
 45a41dc: 17ffffa4     	b	0x45a406c <_ChromeMain+0x459edd0>
 45a41e0: b9518269     	ldr	w9, [x19, #0x1180]
 45a41e4: 35fffaa9     	cbnz	w9, 0x45a4138 <_ChromeMain+0x459ee9c>
 45a41e8: 17ffffde     	b	0x45a4160 <_ChromeMain+0x459eec4>
 45a41ec: d4200000     	brk	#0
 45a41f0: d4400000     	hlt	#0
 45a41f4: d4200020     	brk	#0x1
		...
 45a4200: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a4204: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a4208: 910043fd     	add	x29, sp, #0x10
 45a420c: aa0003f3     	mov	x19, x0
 45a4210: 9004fb08     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 45a4214: 912aa108     	add	x8, x8, #0xaa8
 45a4218: f9000008     	str	x8, [x0]
 45a421c: f9422c00     	ldr	x0, [x0, #0x458]
 45a4220: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a4224: d0053074     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a4228: f9404689     	ldr	x9, [x20, #0x88]
 45a422c: eb09011f     	cmp	x8, x9
 45a4230: 54000041     	b.ne	0x45a4238 <_ChromeMain+0x459ef9c>
 45a4234: 96e9fa02     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a4238: f9022e7f     	str	xzr, [x19, #0x458]
 45a423c: f9422a60     	ldr	x0, [x19, #0x450]
 45a4240: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a4244: f9404689     	ldr	x9, [x20, #0x88]
 45a4248: eb09011f     	cmp	x8, x9
 45a424c: 54000041     	b.ne	0x45a4254 <_ChromeMain+0x459efb8>
 45a4250: 96e9f9fb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a4254: f9022a7f     	str	xzr, [x19, #0x450]
 45a4258: aa1303e0     	mov	x0, x19
 45a425c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a4260: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a4264: 15830a90     	b	0xa666ca4 <_ChromeMain+0xa661a08>
 45a4268: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a426c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a4270: 910043fd     	add	x29, sp, #0x10
 45a4274: aa0003f3     	mov	x19, x0
 45a4278: 9004fb08     	adrp	x8, 0xe504000 <dyld_stub_binder+0xe504000>
 45a427c: 912aa108     	add	x8, x8, #0xaa8
 45a4280: f9000008     	str	x8, [x0]
 45a4284: f9422c00     	ldr	x0, [x0, #0x458]
 45a4288: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a428c: d0053074     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45a4290: f9404689     	ldr	x9, [x20, #0x88]
 45a4294: eb09011f     	cmp	x8, x9
 45a4298: 54000041     	b.ne	0x45a42a0 <_ChromeMain+0x459f004>
 45a429c: 96e9f9e8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a42a0: f9022e7f     	str	xzr, [x19, #0x458]
 45a42a4: f9422a60     	ldr	x0, [x19, #0x450]
 45a42a8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45a42ac: f9404689     	ldr	x9, [x20, #0x88]
 45a42b0: eb09011f     	cmp	x8, x9
 45a42b4: 54000041     	b.ne	0x45a42bc <_ChromeMain+0x459f020>
 45a42b8: 96e9f9e1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45a42bc: f9022a7f     	str	xzr, [x19, #0x450]
 45a42c0: aa1303e0     	mov	x0, x19
 45a42c4: 95830a78     	bl	0xa666ca4 <_ChromeMain+0xa661a08>
 45a42c8: 52808c01     	mov	w1, #0x460              ; =1120
 45a42cc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a42d0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a42d4: 16e992f9     	b	0x8eb8 <_ChromeMain+0x3c1c>
 45a42d8: f9422c00     	ldr	x0, [x0, #0x458]
 45a42dc: b40000a0     	cbz	x0, 0x45a42f0 <_ChromeMain+0x459f054>
 45a42e0: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 45a42e4: 910003fd     	mov	x29, sp
 45a42e8: 97fff463     	bl	0x45a1474 <_ChromeMain+0x459c1d8>
 45a42ec: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 45a42f0: 52800000     	mov	w0, #0x0                ; =0
 45a42f4: d65f03c0     	ret
 45a42f8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 45a42fc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 45a4300: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45a4304: 910083fd     	add	x29, sp, #0x20
 45a4308: d2804d93     	mov	x19, #0x26c             ; =620
 45a430c: f2c02a93     	movk	x19, #0x154, lsl #32
 45a4310: f9422814     	ldr	x20, [x0, #0x450]
 45a4314: b40005b4     	cbz	x20, 0x45a43c8 <_ChromeMain+0x459f12c>
 45a4318: f940fa88     	ldr	x8, [x20, #0x1f0]
 45a431c: f9403108     	ldr	x8, [x8, #0x60]
 45a4320: 90fe0655     	adrp	x21, 0x66c000 <_ChromeMain+0x666d64>
 45a4324: 913942b5     	add	x21, x21, #0xe50
 45a4328: eb15011f     	cmp	x8, x21
 45a432c: 54000521     	b.ne	0x45a43d0 <_ChromeMain+0x459f134>
 45a4330: f941ba80     	ldr	x0, [x20, #0x370]
 45a4334: b4000400     	cbz	x0, 0x45a43b4 <_ChromeMain+0x459f118>
 45a4338: f940fa88     	ldr	x8, [x20, #0x1f0]
 45a433c: f9403108     	ldr	x8, [x8, #0x60]
 45a4340: eb15011f     	cmp	x8, x21
 45a4344: 54000561     	b.ne	0x45a43f0 <_ChromeMain+0x459f154>
 45a4348: f941ba80     	ldr	x0, [x20, #0x370]
 45a434c: 97f93355     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45a4350: 4e080c00     	dup.2d	v0, x0
 45a4354: d004cca8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 45a4358: 3dc01101     	ldr	q1, [x8, #0x40]
 45a435c: 6ee14400     	ushl.2d	v0, v0, v1
 45a4360: 0ea12800     	xtn.2s	v0, v0
 45a4364: 4e080c22     	dup.2d	v2, x1
 45a4368: 6ee14441     	ushl.2d	v1, v2, v1
 45a436c: 0ea12821     	xtn.2s	v1, v1
 45a4370: 92804d68     	mov	x8, #-0x26c             ; =-620
 45a4374: f2dfd588     	movk	x8, #0xfeac, lsl #32
 45a4378: 9e670102     	fmov	d2, x8
 45a437c: 0ea28421     	add.2s	v1, v1, v2
 45a4380: 2f211421     	usra.2s	v1, v1, #0x1f
 45a4384: 0f3f1420     	ssra.2s	v0, v1, #0x1
 45a4388: d2804d88     	mov	x8, #0x26c              ; =620
 45a438c: f2c02a88     	movk	x8, #0x154, lsl #32
 45a4390: 9e670101     	fmov	d1, x8
 45a4394: 0ea10c01     	sqadd.2s	v1, v0, v1
 45a4398: 0ea02c21     	sqsub.2s	v1, v1, v0
 45a439c: 0e0c3c28     	mov.s	w8, v1[1]
 45a43a0: 1e260029     	fmov	w9, s1
 45a43a4: 0aa97d29     	bic	w9, w9, w9, asr #31
 45a43a8: 0aa87d08     	bic	w8, w8, w8, asr #31
 45a43ac: aa088133     	orr	x19, x9, x8, lsl #32
 45a43b0: 9e660000     	fmov	x0, d0
 45a43b4: aa1303e1     	mov	x1, x19
 45a43b8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45a43bc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 45a43c0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 45a43c4: d65f03c0     	ret
 45a43c8: d2800000     	mov	x0, #0x0                ; =0
 45a43cc: 17fffffa     	b	0x45a43b4 <_ChromeMain+0x459f118>
 45a43d0: 90fe0469     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a43d4: 9120c129     	add	x9, x9, #0x830
 45a43d8: eb09011f     	cmp	x8, x9
 45a43dc: 54fffaa0     	b.eq	0x45a4330 <_ChromeMain+0x459f094>
 45a43e0: 9107c280     	add	x0, x20, #0x1f0
 45a43e4: d63f0100     	blr	x8
 45a43e8: b5fffa80     	cbnz	x0, 0x45a4338 <_ChromeMain+0x459f09c>
 45a43ec: 17fffff2     	b	0x45a43b4 <_ChromeMain+0x459f118>
 45a43f0: 90fe0469     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45a43f4: 9120c129     	add	x9, x9, #0x830
 45a43f8: eb09011f     	cmp	x8, x9
 45a43fc: 54fffa60     	b.eq	0x45a4348 <_ChromeMain+0x459f0ac>
 45a4400: 9107c280     	add	x0, x20, #0x1f0
 45a4404: d63f0100     	blr	x8
 45a4408: 17ffffd1     	b	0x45a434c <_ChromeMain+0x459f0b0>
 45a440c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45a4410: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45a4414: 910043fd     	add	x29, sp, #0x10
 45a4418: aa0003f3     	mov	x19, x0
 45a441c: f0050ac8     	adrp	x8, 0xe6ff000 <dyld_stub_binder+0xe6ff000>
 45a4420: 91254108     	add	x8, x8, #0x950
 45a4424: 9111e109     	add	x9, x8, #0x478
 45a4428: a9002408     	stp	x8, x9, [x0]
 45a442c: 91128109     	add	x9, x8, #0x4a0
 45a4430: f9000809     	str	x9, [x0, #0x10]
 45a4434: 91136109     	add	x9, x8, #0x4d8
 45a4438: 9114210a     	add	x10, x8, #0x508
 45a443c: a906a809     	stp	x9, x10, [x0, #0x68]
 45a4440: 91156109     	add	x9, x8, #0x558
 45a4444: f9005809     	str	x9, [x0, #0xb0]
 45a4448: 9116e109     	add	x9, x8, #0x5b8
 45a444c: f9006c09     	str	x9, [x0, #0xd8]
 45a4450: 9117a109     	add	x9, x8, #0x5e8
 45a4454: f9007c09     	str	x9, [x0, #0xf8]
 45a4458: 91184109     	add	x9, x8, #0x610
 45a445c: f9018809     	str	x9, [x0, #0x310]
 45a4460: 9127c109     	add	x9, x8, #0x9f0
 45a4464: f9019809     	str	x9, [x0, #0x330]
 45a4468: 9137c109     	add	x9, x8, #0xdf0
 45a446c: f901a809     	str	x9, [x0, #0x350]
 45a4470: 91388109     	add	x9, x8, #0xe20
 45a4474: f901b409     	str	x9, [x0, #0x368]
 45a4478: 91392108     	add	x8, x8, #0xe48
 45a447c: f9027808     	str	x8, [x0, #0x4f0]
 45a4480: f9429000     	ldr	x0, [x0, #0x520]
 45a4484: b5000340     	cbnz	x0, 0x45a44ec <_ChromeMain+0x459f250>
 45a4488: f9428e60     	ldr	x0, [x19, #0x518]
 45a448c: b5000220     	cbnz	x0, 0x45a44d0 <_ChromeMain+0x459f234>
 45a4490: f9428660     	ldr	x0, [x19, #0x508]
 45a4494: f902867f     	str	xzr, [x19, #0x508]
 45a4498: b4000080     	cbz	x0, 0x45a44a8 <_ChromeMain+0x459f20c>
 45a449c: 978c5aa0     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 45a44a0: 52800301     	mov	w1, #0x18               ; =24
 45a44a4: 96e99285     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45a44a8: f9428260     	ldr	x0, [x19, #0x500]
 45a44ac: f902827f     	str	xzr, [x19, #0x500]
 45a44b0: b4000080     	cbz	x0, 0x45a44c0 <_ChromeMain+0x459f224>
 45a44b4: f9400008     	ldr	x8, [x0]
 45a44b8: f9400508     	ldr	x8, [x8, #0x8]
 45a44bc: d63f0100     	blr	x8
 45a44c0: aa1303e0     	mov	x0, x19
 45a44c4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45a44c8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45a44cc: 17819036     	b	0x26085a4 <_ChromeMain+0x2603308>
 45a44d0: 12800008     	mov	w8, #-0x1               ; =-1
 45a44d4: b8e80008     	ldaddal	w8, w8, [x0]
 45a44d8: 7100051f     	cmp	w8, #0x1
 45a44dc: 54fffda1     	b.ne	0x45a4490 <_ChromeMain+0x459f1f4>
 45a44e0: f9400808     	ldr	x8, [x0, #0x10]
 45a44e4: d63f0100     	blr	x8
 45a44e8: 17ffffea     	b	0x45a4490 <_ChromeMain+0x459f1f4>
 45a44ec: 12800008     	mov	w8, #-0x1               ; =-1
 45a44f0: b8e80008     	ldaddal	w8, w8, [x0]
 45a44f4: 7100051f     	cmp	w8, #0x1
 45a44f8: 54fffc81     	b.ne	0x45a4488 <_ChromeMain+0x459f1ec>
 45a44fc: f9400808     	ldr	x8, [x0, #0x10]
 45a4500: d63f0100     	blr	x8
 45a4504: 17ffffe1     	b	0x45a4488 <_ChromeMain+0x459f1ec>
