Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4652ee0: d10503ff     	sub	sp, sp, #0x140
 4652ee4: a9105ff8     	stp	x24, x23, [sp, #0x100]
 4652ee8: a91157f6     	stp	x22, x21, [sp, #0x110]
 4652eec: a9124ff4     	stp	x20, x19, [sp, #0x120]
 4652ef0: a9137bfd     	stp	x29, x30, [sp, #0x130]
 4652ef4: 9104c3fd     	add	x29, sp, #0x130
 4652ef8: aa0803f3     	mov	x19, x8
 4652efc: f900091f     	str	xzr, [x8, #0x10]
 4652f00: f8008d1f     	str	xzr, [x8, #0x8]!
 4652f04: f9000268     	str	x8, [x19]
 4652f08: 6f00e400     	movi.2d	v0, #0000000000000000
 4652f0c: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 4652f10: ad0483e0     	stp	q0, q0, [sp, #0x90]
 4652f14: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4652f18: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4652f1c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 4652f20: ad0083e0     	stp	q0, q0, [sp, #0x10]
 4652f24: 3d8003e0     	str	q0, [sp]
 4652f28: 910003e8     	mov	x8, sp
 4652f2c: 97eab717     	bl	0x4100b88 <_ChromeMain+0x40fb8ec>
 4652f30: 394323e8     	ldrb	w8, [sp, #0xc8]
 4652f34: 34000a48     	cbz	w8, 0x465307c <_ChromeMain+0x464dde0>
 4652f38: f94053e8     	ldr	x8, [sp, #0xa0]
 4652f3c: 8b080908     	add	x8, x8, x8, lsl #2
 4652f40: d37ced09     	lsl	x9, x8, #4
 4652f44: b4000849     	cbz	x9, 0x465304c <_ChromeMain+0x464ddb0>
 4652f48: f9404ff4     	ldr	x20, [sp, #0x98]
 4652f4c: 8b081295     	add	x21, x20, x8, lsl #4
 4652f50: d10163b6     	sub	x22, x29, #0x58
 4652f54: 14000017     	b	0x4652fb0 <_ChromeMain+0x464dd14>
 4652f58: 9101a017     	add	x23, x0, #0x68
 4652f5c: d10163a8     	sub	x8, x29, #0x58
 4652f60: aa0903e0     	mov	x0, x9
 4652f64: 97145905     	bl	0xb69378 <_ChromeMain+0xb640dc>
 4652f68: a93c5bb7     	stp	x23, x22, [x29, #-0x40]
 4652f6c: d100e3a1     	sub	x1, x29, #0x38
 4652f70: d10103a2     	sub	x2, x29, #0x40
 4652f74: aa1303e0     	mov	x0, x19
 4652f78: 95fffcfe     	bl	0xc652370 <_ChromeMain+0xc64d0d4>
 4652f7c: 38dbf3a8     	ldursb	w8, [x29, #-0x41]
 4652f80: 36f80128     	tbz	w8, #0x1f, 0x4652fa4 <_ChromeMain+0x464dd08>
 4652f84: 1400006a     	b	0x465312c <_ChromeMain+0x464de90>
 4652f88: a9418a81     	ldp	x1, x2, [x20, #0x18]
 4652f8c: 1400000e     	b	0x4652fc4 <_ChromeMain+0x464dd28>
 4652f90: b40000a8     	cbz	x8, 0x4652fa4 <_ChromeMain+0x464dd08>
 4652f94: 39426008     	ldrb	w8, [x0, #0x98]
 4652f98: 3707fe08     	tbnz	w8, #0x0, 0x4652f58 <_ChromeMain+0x464dcbc>
 4652f9c: 39426408     	ldrb	w8, [x0, #0x99]
 4652fa0: 35fffdc8     	cbnz	w8, 0x4652f58 <_ChromeMain+0x464dcbc>
 4652fa4: 91014294     	add	x20, x20, #0x50
 4652fa8: eb15029f     	cmp	x20, x21
 4652fac: 540004c0     	b.eq	0x4653044 <_ChromeMain+0x464dda8>
 4652fb0: 394323e8     	ldrb	w8, [sp, #0xc8]
 4652fb4: 36000ba8     	tbz	w8, #0x0, 0x4653128 <_ChromeMain+0x464de8c>
 4652fb8: 3980be82     	ldrsb	x2, [x20, #0x2f]
 4652fbc: b7fffe62     	tbnz	x2, #0x3f, 0x4652f88 <_ChromeMain+0x464dcec>
 4652fc0: 91006281     	add	x1, x20, #0x18
 4652fc4: 910003e0     	mov	x0, sp
 4652fc8: 97eab220     	bl	0x40ff848 <_ChromeMain+0x40fa5ac>
 4652fcc: b5000220     	cbnz	x0, 0x4653010 <_ChromeMain+0x464dd74>
 4652fd0: b9403288     	ldr	w8, [x20, #0x30]
 4652fd4: 37f801c8     	tbnz	w8, #0x1f, 0x465300c <_ChromeMain+0x464dd70>
 4652fd8: 394323e9     	ldrb	w9, [sp, #0xc8]
 4652fdc: 36000a69     	tbz	w9, #0x0, 0x4653128 <_ChromeMain+0x464de8c>
 4652fe0: f9403be9     	ldr	x9, [sp, #0x70]
 4652fe4: 8b090529     	add	x9, x9, x9, lsl #1
 4652fe8: d37ae529     	lsl	x9, x9, #6
 4652fec: b4000109     	cbz	x9, 0x465300c <_ChromeMain+0x464dd70>
 4652ff0: f94037e0     	ldr	x0, [sp, #0x68]
 4652ff4: b940000a     	ldr	w10, [x0]
 4652ff8: 6b08015f     	cmp	w10, w8
 4652ffc: 540000a0     	b.eq	0x4653010 <_ChromeMain+0x464dd74>
 4653000: 91030000     	add	x0, x0, #0xc0
 4653004: f1030129     	subs	x9, x9, #0xc0
 4653008: 54ffff61     	b.ne	0x4652ff4 <_ChromeMain+0x464dd58>
 465300c: d2800000     	mov	x0, #0x0                ; =0
 4653010: 39813e81     	ldrsb	x1, [x20, #0x4f]
 4653014: b7f80121     	tbnz	x1, #0x3f, 0x4653038 <_ChromeMain+0x464dd9c>
 4653018: 9100e289     	add	x9, x20, #0x38
 465301c: b4fffc40     	cbz	x0, 0x4652fa4 <_ChromeMain+0x464dd08>
 4653020: b4fffc21     	cbz	x1, 0x4652fa4 <_ChromeMain+0x464dd08>
 4653024: 3981fc08     	ldrsb	x8, [x0, #0x7f]
 4653028: b6fffb48     	tbz	x8, #0x3f, 0x4652f90 <_ChromeMain+0x464dcf4>
 465302c: f9403808     	ldr	x8, [x0, #0x70]
 4653030: b4fffba8     	cbz	x8, 0x4652fa4 <_ChromeMain+0x464dd08>
 4653034: 17ffffd8     	b	0x4652f94 <_ChromeMain+0x464dcf8>
 4653038: a9438689     	ldp	x9, x1, [x20, #0x38]
 465303c: b4fffb40     	cbz	x0, 0x4652fa4 <_ChromeMain+0x464dd08>
 4653040: 17fffff8     	b	0x4653020 <_ChromeMain+0x464dd84>
 4653044: 394323e8     	ldrb	w8, [sp, #0xc8]
 4653048: 36000708     	tbz	w8, #0x0, 0x4653128 <_ChromeMain+0x464de8c>
 465304c: f9405fe8     	ldr	x8, [sp, #0xb8]
 4653050: d37ae509     	lsl	x9, x8, #6
 4653054: eb080d28     	subs	x8, x9, x8, lsl #3
 4653058: 540000e0     	b.eq	0x4653074 <_ChromeMain+0x464ddd8>
 465305c: f9405bf4     	ldr	x20, [sp, #0xb0]
 4653060: 8b080295     	add	x21, x20, x8
 4653064: d10163b6     	sub	x22, x29, #0x58
 4653068: 1400001e     	b	0x46530e0 <_ChromeMain+0x464de44>
 465306c: 394323e8     	ldrb	w8, [sp, #0xc8]
 4653070: 34000068     	cbz	w8, 0x465307c <_ChromeMain+0x464dde0>
 4653074: 910003e0     	mov	x0, sp
 4653078: 97eab123     	bl	0x40ff504 <_ChromeMain+0x40fa268>
 465307c: a9537bfd     	ldp	x29, x30, [sp, #0x130]
 4653080: a9524ff4     	ldp	x20, x19, [sp, #0x120]
 4653084: a95157f6     	ldp	x22, x21, [sp, #0x110]
 4653088: a9505ff8     	ldp	x24, x23, [sp, #0x100]
 465308c: 910503ff     	add	sp, sp, #0x140
 4653090: d65f03c0     	ret
 4653094: 91008280     	add	x0, x20, #0x20
 4653098: 394323e8     	ldrb	w8, [sp, #0xc8]
 465309c: 36000468     	tbz	w8, #0x0, 0x4653128 <_ChromeMain+0x464de8c>
 46530a0: f9403be8     	ldr	x8, [sp, #0x70]
 46530a4: 8b080508     	add	x8, x8, x8, lsl #1
 46530a8: d37ae508     	lsl	x8, x8, #6
 46530ac: b4000148     	cbz	x8, 0x46530d4 <_ChromeMain+0x464de38>
 46530b0: b9401a89     	ldr	w9, [x20, #0x18]
 46530b4: f94037ea     	ldr	x10, [sp, #0x68]
 46530b8: 9101a157     	add	x23, x10, #0x68
 46530bc: b85982ea     	ldur	w10, [x23, #-0x68]
 46530c0: 6b09015f     	cmp	w10, w9
 46530c4: 54000160     	b.eq	0x46530f0 <_ChromeMain+0x464de54>
 46530c8: 910302f7     	add	x23, x23, #0xc0
 46530cc: f1030108     	subs	x8, x8, #0xc0
 46530d0: 54ffff61     	b.ne	0x46530bc <_ChromeMain+0x464de20>
 46530d4: 9100e294     	add	x20, x20, #0x38
 46530d8: eb15029f     	cmp	x20, x21
 46530dc: 54fffc80     	b.eq	0x465306c <_ChromeMain+0x464ddd0>
 46530e0: 3980de81     	ldrsb	x1, [x20, #0x37]
 46530e4: b6fffd81     	tbz	x1, #0x3f, 0x4653094 <_ChromeMain+0x464ddf8>
 46530e8: a9420680     	ldp	x0, x1, [x20, #0x20]
 46530ec: 17ffffeb     	b	0x4653098 <_ChromeMain+0x464ddfc>
 46530f0: b4ffff21     	cbz	x1, 0x46530d4 <_ChromeMain+0x464de38>
 46530f4: d101a2e8     	sub	x8, x23, #0x68
 46530f8: b4fffee8     	cbz	x8, 0x46530d4 <_ChromeMain+0x464de38>
 46530fc: 39805ee8     	ldrsb	x8, [x23, #0x17]
 4653100: b7f800e8     	tbnz	x8, #0x3f, 0x465311c <_ChromeMain+0x464de80>
 4653104: b4fffe88     	cbz	x8, 0x46530d4 <_ChromeMain+0x464de38>
 4653108: 3940c2e8     	ldrb	w8, [x23, #0x30]
 465310c: 370001a8     	tbnz	w8, #0x0, 0x4653140 <_ChromeMain+0x464dea4>
 4653110: 3940c6e8     	ldrb	w8, [x23, #0x31]
 4653114: 35000168     	cbnz	w8, 0x4653140 <_ChromeMain+0x464dea4>
 4653118: 17ffffef     	b	0x46530d4 <_ChromeMain+0x464de38>
 465311c: f94006e8     	ldr	x8, [x23, #0x8]
 4653120: b4fffda8     	cbz	x8, 0x46530d4 <_ChromeMain+0x464de38>
 4653124: 17fffff9     	b	0x4653108 <_ChromeMain+0x464de6c>
 4653128: d4200020     	brk	#0x1
 465312c: f85a83a0     	ldur	x0, [x29, #-0x58]
 4653130: f85b83a8     	ldur	x8, [x29, #-0x48]
 4653134: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4653138: 96e6d760     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465313c: 17ffff9a     	b	0x4652fa4 <_ChromeMain+0x464dd08>
 4653140: d10163a8     	sub	x8, x29, #0x58
 4653144: 9714588d     	bl	0xb69378 <_ChromeMain+0xb640dc>
 4653148: a93c5bb7     	stp	x23, x22, [x29, #-0x40]
 465314c: d100e3a1     	sub	x1, x29, #0x38
 4653150: d10103a2     	sub	x2, x29, #0x40
 4653154: aa1303e0     	mov	x0, x19
 4653158: 95fffc86     	bl	0xc652370 <_ChromeMain+0xc64d0d4>
 465315c: 38dbf3a8     	ldursb	w8, [x29, #-0x41]
 4653160: 36fffba8     	tbz	w8, #0x1f, 0x46530d4 <_ChromeMain+0x464de38>
 4653164: f85a83a0     	ldur	x0, [x29, #-0x58]
 4653168: f85b83a8     	ldur	x8, [x29, #-0x48]
 465316c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4653170: 96e6d752     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4653174: 17ffffd8     	b	0x46530d4 <_ChromeMain+0x464de38>
