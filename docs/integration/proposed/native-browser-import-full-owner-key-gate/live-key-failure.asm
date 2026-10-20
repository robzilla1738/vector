
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254ce8: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254cec: b940b108     	ldr	w8, [x8, #0xb0]
 4254cf0: 7100091f     	cmp	w8, #0x2
 4254cf4: 540006ac     	b.gt	0x4254dc8 <_ChromeMain+0x424fb2c>
 4254cf8: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254cfc: 91080821     	add	x1, x1, #0x202
 4254d00: 910103f5     	add	x21, sp, #0x40
 4254d04: 910103e0     	add	x0, sp, #0x40
 4254d08: 5280fe42     	mov	w2, #0x7f2              ; =2034
 4254d0c: 52800043     	mov	w3, #0x2                ; =2
 4254d10: 970ed10f     	bl	0x60914c <_ChromeMain+0x603eb0>
 4254d14: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254d18: 910efc21     	add	x1, x1, #0x3bf
 4254d1c: 910042a0     	add	x0, x21, #0x10
 4254d20: 52800222     	mov	w2, #0x11               ; =17
 4254d24: 96f741e6     	bl	0x254bc <_ChromeMain+0x20220>
 4254d28: aa0003f5     	mov	x21, x0
 4254d2c: d10203b6     	sub	x22, x29, #0x80
 4254d30: d10203a8     	sub	x8, x29, #0x80
 4254d34: aa1403e0     	mov	x0, x20
 4254d38: 94002c56     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254d3c: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254d40: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254d44: f100011f     	cmp	x8, #0x0
 4254d48: 9a964120     	csel	x0, x9, x22, mi
 4254d4c: 7100011f     	cmp	w8, #0x0
 4254d50: 9a884141     	csel	x1, x10, x8, mi
 4254d54: d10283b6     	sub	x22, x29, #0xa0
 4254d58: d10283a8     	sub	x8, x29, #0xa0
 4254d5c: 973537eb     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254d60: 389773a8     	ldursb	x8, [x29, #-0x89]
 4254d64: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4254d68: f100011f     	cmp	x8, #0x0
 4254d6c: 9a964121     	csel	x1, x9, x22, mi
 4254d70: 7100011f     	cmp	w8, #0x0
 4254d74: 9a884142     	csel	x2, x10, x8, mi
 4254d78: aa1503e0     	mov	x0, x21
 4254d7c: 96f741d0     	bl	0x254bc <_ChromeMain+0x20220>
 4254d80: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254d84: 910f4421     	add	x1, x1, #0x3d1
 4254d88: 528002e2     	mov	w2, #0x17               ; =23
 4254d8c: 96f741cc     	bl	0x254bc <_ChromeMain+0x20220>
 4254d90: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254d94: 36f800a8     	tbz	w8, #0x1f, 0x4254da8 <_ChromeMain+0x424fb0c>
 4254d98: f85603a0     	ldur	x0, [x29, #-0xa0]
 4254d9c: f85703a8     	ldur	x8, [x29, #-0x90]
 4254da0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254da4: 96f6d045     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254da8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254dac: 36f800a8     	tbz	w8, #0x1f, 0x4254dc0 <_ChromeMain+0x424fb24>
 4254db0: f85803a0     	ldur	x0, [x29, #-0x80]
 4254db4: f85903a8     	ldur	x8, [x29, #-0x70]
 4254db8: d37ff901     	lsl	x1, x8, #1
 4254dbc: 96f6d03f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254dc0: 910103e0     	add	x0, sp, #0x40
 4254dc4: 970ed0af     	bl	0x609080 <_ChromeMain+0x603de4>
 4254dc8: d10203b5     	sub	x21, x29, #0x80
 4254dcc: d10203a8     	sub	x8, x29, #0x80
 4254dd0: aa1403e0     	mov	x0, x20
 4254dd4: 94002c2f     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254dd8: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254ddc: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254de0: f100011f     	cmp	x8, #0x0
 4254de4: 9a954120     	csel	x0, x9, x21, mi
 4254de8: 7100011f     	cmp	w8, #0x0
 4254dec: 9a884141     	csel	x1, x10, x8, mi
 4254df0: d10283a8     	sub	x8, x29, #0xa0
 4254df4: 973537c5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254df8: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254dfc: 12001d17     	and	w23, w8, #0xff
 4254e00: 37f83368     	tbnz	w8, #0x1f, 0x425546c <_ChromeMain+0x42501d0>
 4254e04: 92401d14     	and	x20, x8, #0xff
 4254e08: 51001ae8     	sub	w8, w23, #0x6
 4254e0c: 7100451f     	cmp	w8, #0x11
 4254e10: 54000a63     	b.lo	0x4254f5c <_ChromeMain+0x424fcc0>
 4254e14: d10283b5     	sub	x21, x29, #0xa0
 4254e18: f004c656     	adrp	x22, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254e1c: 910fa6d6     	add	x22, x22, #0x3e9
 4254e20: b40001b4     	cbz	x20, 0x4254e54 <_ChromeMain+0x424fbb8>
 4254e24: 8b1402a8     	add	x8, x21, x20
 4254e28: eb15011f     	cmp	x8, x21
 4254e2c: 54002103     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 4254e30: eb16011f     	cmp	x8, x22
 4254e34: fa5682a2     	ccmp	x21, x22, #0x2, hi
 4254e38: 52800228     	mov	w8, #0x11               ; =17
 4254e3c: 9a9f9108     	csel	x8, x8, xzr, ls
 4254e40: 8b0802d6     	add	x22, x22, x8
 4254e44: 910046a0     	add	x0, x21, #0x11
 4254e48: aa1503e1     	mov	x1, x21
 4254e4c: aa1403e2     	mov	x2, x20
 4254e50: 94f6e91f     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4254e54: 3dc002c0     	ldr	q0, [x22]
 4254e58: 3d8002a0     	str	q0, [x21]
 4254e5c: 394042c8     	ldrb	w8, [x22, #0x10]
 4254e60: 390042a8     	strb	w8, [x21, #0x10]
 4254e64: 91004688     	add	x8, x20, #0x11
 4254e68: 38d773a9     	ldursb	w9, [x29, #-0x89]
 4254e6c: 37f826c9     	tbnz	w9, #0x1f, 0x4255344 <_ChromeMain+0x42500a8>
 4254e70: 12001909     	and	w9, w8, #0x7f
 4254e74: 381773a9     	sturb	w9, [x29, #-0x89]
 4254e78: 38286abf     	strb	wzr, [x21, x8]
 4254e7c: 3cd603a0     	ldur	q0, [x29, #-0xa0]
 4254e80: 3d8013e0     	str	q0, [sp, #0x40]
 4254e84: f85703a8     	ldur	x8, [x29, #-0x90]
 4254e88: f9002be8     	str	x8, [sp, #0x50]
 4254e8c: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4254e90: f81603bf     	stur	xzr, [x29, #-0xa0]
 4254e94: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254e98: 910fec21     	add	x1, x1, #0x3fb
 4254e9c: 910103e0     	add	x0, sp, #0x40
 4254ea0: 528001e2     	mov	w2, #0xf                ; =15
 4254ea4: 96f9155f     	bl	0x9a420 <_ChromeMain+0x95184>
 4254ea8: f9400014     	ldr	x20, [x0]
 4254eac: 3cc08000     	ldur	q0, [x0, #0x8]
 4254eb0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4254eb4: f900001f     	str	xzr, [x0]
 4254eb8: 39c07e68     	ldrsb	w8, [x19, #0x1f]
 4254ebc: 37f831a8     	tbnz	w8, #0x1f, 0x42554f0 <_ChromeMain+0x4250254>
 4254ec0: f9000674     	str	x20, [x19, #0x8]
 4254ec4: 3d800660     	str	q0, [x19, #0x10]
 4254ec8: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4254ecc: 36f800a8     	tbz	w8, #0x1f, 0x4254ee0 <_ChromeMain+0x424fc44>
