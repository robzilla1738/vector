
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 71f0cc8: d10203ff     	sub	sp, sp, #0x80
 71f0ccc: a9064ff4     	stp	x20, x19, [sp, #0x60]
 71f0cd0: a9077bfd     	stp	x29, x30, [sp, #0x70]
 71f0cd4: 9101c3fd     	add	x29, sp, #0x70
 71f0cd8: aa0803f3     	mov	x19, x8
 71f0cdc: a93dffbf     	stp	xzr, xzr, [x29, #-0x28]
 71f0ce0: f81e83bf     	stur	xzr, [x29, #-0x18]
 71f0ce4: d100a3a8     	sub	x8, x29, #0x28
 71f0ce8: 9400071c     	bl	0x71f2958 <_ChromeMain+0x71ed6bc>
 71f0cec: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 71f0cf0: f90023ff     	str	xzr, [sp, #0x40]
 71f0cf4: d100a3a0     	sub	x0, x29, #0x28
 71f0cf8: 9100c3e1     	add	x1, sp, #0x30
 71f0cfc: 96b687a1     	bl	0x1f92b80 <_ChromeMain+0x1f8d8e4>
 71f0d00: f90013ff     	str	xzr, [sp, #0x20]
 71f0d04: 6f00e400     	movi.2d	v0, #0000000000000000
 71f0d08: ad0003e0     	stp	q0, q0, [sp]
 71f0d0c: 910003f4     	mov	x20, sp
 71f0d10: 910003e0     	mov	x0, sp
 71f0d14: 97fee930     	bl	0x71ab1d4 <_ChromeMain+0x71a5f38>
 71f0d18: 910003e0     	mov	x0, sp
 71f0d1c: 9100c3e1     	add	x1, sp, #0x30
 71f0d20: 97fee8b7     	bl	0x71aaffc <_ChromeMain+0x71a5d60>
 71f0d24: 91004280     	add	x0, x20, #0x10
 71f0d28: aa1303e8     	mov	x8, x19
 71f0d2c: 9400000f     	bl	0x71f0d68 <_ChromeMain+0x71ebacc>
 71f0d30: 910003e0     	mov	x0, sp
 71f0d34: 97fee935     	bl	0x71ab208 <_ChromeMain+0x71a5f6c>
 71f0d38: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 71f0d3c: 36f800a8     	tbz	w8, #0x1f, 0x71f0d50 <_ChromeMain+0x71ebab4>
 71f0d40: f9401be0     	ldr	x0, [sp, #0x30]
 71f0d44: f94023e8     	ldr	x8, [sp, #0x40]
 71f0d48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f0d4c: 9638605b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0d50: d100a3a0     	sub	x0, x29, #0x28
 71f0d54: 9701f374     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f0d58: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 71f0d5c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 71f0d60: 910203ff     	add	sp, sp, #0x80
 71f0d64: d65f03c0     	ret
 71f0d68: d10543ff     	sub	sp, sp, #0x150
 71f0d6c: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 71f0d70: a91067fa     	stp	x26, x25, [sp, #0x100]
 71f0d74: a9115ff8     	stp	x24, x23, [sp, #0x110]
 71f0d78: a91257f6     	stp	x22, x21, [sp, #0x120]
 71f0d7c: a9134ff4     	stp	x20, x19, [sp, #0x130]
 71f0d80: a9147bfd     	stp	x29, x30, [sp, #0x140]
 71f0d84: 910503fd     	add	x29, sp, #0x140
 71f0d88: aa0003f4     	mov	x20, x0
 71f0d8c: aa0803f3     	mov	x19, x8
 71f0d90: 52800017     	mov	w23, #0x0               ; =0
 71f0d94: 910283f8     	add	x24, sp, #0xa0
 71f0d98: 900371c8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 71f0d9c: f940f908     	ldr	x8, [x8, #0x1f0]
 71f0da0: f9400108     	ldr	x8, [x8]
 71f0da4: f81983a8     	stur	x8, [x29, #-0x68]
 71f0da8: 910283fc     	add	x28, sp, #0xa0
 71f0dac: b0fd71fa     	adrp	x26, 0x202d000 <_ChromeMain+0x2027d64>
 71f0db0: 9108035a     	add	x26, x26, #0x200
 71f0db4: a9007e7f     	stp	xzr, xzr, [x19]
 71f0db8: b00341b5     	adrp	x21, 0xda25000 <dyld_stub_binder+0xda25000>
 71f0dbc: 9113aab5     	add	x21, x21, #0x4ea
 71f0dc0: f9000a7f     	str	xzr, [x19, #0x10]
 71f0dc4: b00341b6     	adrp	x22, 0xda25000 <dyld_stub_binder+0xda25000>
 71f0dc8: 9113d2d6     	add	x22, x22, #0x4f4
 71f0dcc: 910083f9     	add	x25, sp, #0x20
 71f0dd0: 1400006d     	b	0x71f0f84 <_ChromeMain+0x71ebce8>
 71f0dd4: 910023e0     	add	x0, sp, #0x8
 71f0dd8: 968b4b8a     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f0ddc: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 71f0de0: 36f800a8     	tbz	w8, #0x1f, 0x71f0df4 <_ChromeMain+0x71ebb58>
 71f0de4: f94043e0     	ldr	x0, [sp, #0x80]
 71f0de8: f9404be8     	ldr	x8, [sp, #0x90]
 71f0dec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f0df0: 96386032     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0df4: 910283e0     	add	x0, sp, #0xa0
 71f0df8: 910023e1     	add	x1, sp, #0x8
 71f0dfc: 9690ef84     	bl	0x162cc0c <_ChromeMain+0x1627970>
 71f0e00: 910023e0     	add	x0, sp, #0x8
 71f0e04: 9701f348     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f0e08: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 71f0e0c: f9004bff     	str	xzr, [sp, #0x90]
 71f0e10: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 71f0e14: a9422be9     	ldp	x9, x10, [sp, #0x20]
 71f0e18: f100011f     	cmp	x8, #0x0
 71f0e1c: 9a994121     	csel	x1, x9, x25, mi
 71f0e20: 7100011f     	cmp	w8, #0x0
 71f0e24: 9a884142     	csel	x2, x10, x8, mi
 71f0e28: 9101a3e8     	add	x8, sp, #0x68
 71f0e2c: 910143e0     	add	x0, sp, #0x50
 71f0e30: b00341a3     	adrp	x3, 0xda25000 <dyld_stub_binder+0xda25000>
 71f0e34: 9113e863     	add	x3, x3, #0x4fa
 71f0e38: 528000a4     	mov	w4, #0x5                ; =5
 71f0e3c: 970b5d67     	bl	0x34c83d8 <_ChromeMain+0x34c313c>
 71f0e40: 3981ffe8     	ldrsb	x8, [sp, #0x7f]
 71f0e44: a946abe9     	ldp	x9, x10, [sp, #0x68]
 71f0e48: f100011f     	cmp	x8, #0x0
 71f0e4c: 9101a3eb     	add	x11, sp, #0x68
 71f0e50: 9a8b4121     	csel	x1, x9, x11, mi
 71f0e54: 7100011f     	cmp	w8, #0x0
 71f0e58: 9a884142     	csel	x2, x10, x8, mi
 71f0e5c: aa1403e0     	mov	x0, x20
 71f0e60: 97217bde     	bl	0x3a4fdd8 <_ChromeMain+0x3a4ab3c>
 71f0e64: aa0003fb     	mov	x27, x0
 71f0e68: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 71f0e6c: 36f800a8     	tbz	w8, #0x1f, 0x71f0e80 <_ChromeMain+0x71ebbe4>
 71f0e70: f94037e0     	ldr	x0, [sp, #0x68]
 71f0e74: f9403fe8     	ldr	x8, [sp, #0x78]
 71f0e78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f0e7c: 9638600f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0e80: b400023b     	cbz	x27, 0x71f0ec4 <_ChromeMain+0x71ebc28>
 71f0e84: 39805f61     	ldrsb	x1, [x27, #0x17]
 71f0e88: b6f80041     	tbz	x1, #0x3f, 0x71f0e90 <_ChromeMain+0x71ebbf4>
 71f0e8c: a940077b     	ldp	x27, x1, [x27]
 71f0e90: 9101a3e8     	add	x8, sp, #0x68
 71f0e94: aa1b03e0     	mov	x0, x27
 71f0e98: 965bc51e     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 71f0e9c: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 71f0ea0: 36f800a8     	tbz	w8, #0x1f, 0x71f0eb4 <_ChromeMain+0x71ebc18>
 71f0ea4: f94043e0     	ldr	x0, [sp, #0x80]
 71f0ea8: f9404be8     	ldr	x8, [sp, #0x90]
 71f0eac: d37ff901     	lsl	x1, x8, #1
 71f0eb0: 96386002     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0eb4: 3cc683e0     	ldur	q0, [sp, #0x68]
 71f0eb8: 3d8023e0     	str	q0, [sp, #0x80]
 71f0ebc: f9403fe8     	ldr	x8, [sp, #0x78]
 71f0ec0: f9004be8     	str	x8, [sp, #0x90]
 71f0ec4: 39825fe8     	ldrsb	x8, [sp, #0x97]
 71f0ec8: a9482be9     	ldp	x9, x10, [sp, #0x80]
 71f0ecc: f100011f     	cmp	x8, #0x0
 71f0ed0: 910203eb     	add	x11, sp, #0x80
 71f0ed4: 9a8b4120     	csel	x0, x9, x11, mi
 71f0ed8: 7100011f     	cmp	w8, #0x0
 71f0edc: 9a884141     	csel	x1, x10, x8, mi
 71f0ee0: 910203e6     	add	x6, sp, #0x80
 71f0ee4: 90036c42     	adrp	x2, 0xdf78000 <dyld_stub_binder+0xdf78000>
 71f0ee8: 913af842     	add	x2, x2, #0xebe
 71f0eec: 52800023     	mov	w3, #0x1                ; =1
 71f0ef0: 90036c44     	adrp	x4, 0xdf78000 <dyld_stub_binder+0xdf78000>
 71f0ef4: 913b0884     	add	x4, x4, #0xec2
 71f0ef8: 52800025     	mov	w5, #0x1                ; =1
 71f0efc: 96de446f     	bl	0x29820b8 <_ChromeMain+0x297ce1c>
 71f0f00: 91006380     	add	x0, x28, #0x18
 71f0f04: 910203e1     	add	x1, sp, #0x80
 71f0f08: 965b75e5     	bl	0x8ce69c <_ChromeMain+0x8c9400>
 71f0f0c: 910283e1     	add	x1, sp, #0xa0
 71f0f10: aa1303e0     	mov	x0, x19
 71f0f14: 94000573     	bl	0x71f24e0 <_ChromeMain+0x71ed244>
 71f0f18: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 71f0f1c: 36f800a8     	tbz	w8, #0x1f, 0x71f0f30 <_ChromeMain+0x71ebc94>
 71f0f20: f94043e0     	ldr	x0, [sp, #0x80]
 71f0f24: f9404be8     	ldr	x8, [sp, #0x90]
 71f0f28: d37ff901     	lsl	x1, x8, #1
 71f0f2c: 96385fe3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0f30: 39c33fe8     	ldrsb	w8, [sp, #0xcf]
 71f0f34: 36f800a8     	tbz	w8, #0x1f, 0x71f0f48 <_ChromeMain+0x71ebcac>
 71f0f38: f9405fe0     	ldr	x0, [sp, #0xb8]
 71f0f3c: f94067e8     	ldr	x8, [sp, #0xc8]
 71f0f40: d37ff901     	lsl	x1, x8, #1
 71f0f44: 96385fdd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0f48: 910283e0     	add	x0, sp, #0xa0
 71f0f4c: 9701f2f6     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f0f50: 14000006     	b	0x71f0f68 <_ChromeMain+0x71ebccc>
 71f0f54: f94053e0     	ldr	x0, [sp, #0xa0]
 71f0f58: f9405be8     	ldr	x8, [sp, #0xb0]
 71f0f5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f0f60: 96385fd6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0f64: b5000a7b     	cbnz	x27, 0x71f10b0 <_ChromeMain+0x71ebe14>
 71f0f68: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 71f0f6c: 36f800a8     	tbz	w8, #0x1f, 0x71f0f80 <_ChromeMain+0x71ebce4>
 71f0f70: f94013e0     	ldr	x0, [sp, #0x20]
 71f0f74: f9401be8     	ldr	x8, [sp, #0x30]
 71f0f78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f0f7c: 96385fcf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f0f80: 110006f7     	add	w23, w23, #0x1
 71f0f84: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 71f0f88: f9001bff     	str	xzr, [sp, #0x30]
 71f0f8c: 2a1703e8     	mov	w8, w23
 71f0f90: a90a6be8     	stp	x8, x26, [sp, #0xa0]
 71f0f94: 910083e8     	add	x8, sp, #0x20
 71f0f98: 910283e2     	add	x2, sp, #0xa0
 71f0f9c: aa1503e0     	mov	x0, x21
 71f0fa0: 52800121     	mov	w1, #0x9                ; =9
 71f0fa4: 52800023     	mov	w3, #0x1                ; =1
 71f0fa8: 9642ad96     	bl	0x29c600 <_ChromeMain+0x297364>
 71f0fac: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 71f0fb0: a9422be9     	ldp	x9, x10, [sp, #0x20]
 71f0fb4: f100011f     	cmp	x8, #0x0
 71f0fb8: 9a994121     	csel	x1, x9, x25, mi
 71f0fbc: 7100011f     	cmp	w8, #0x0
 71f0fc0: 9a884142     	csel	x2, x10, x8, mi
 71f0fc4: aa1403e0     	mov	x0, x20
 71f0fc8: 9675be7e     	bl	0xf609c0 <_ChromeMain+0xf5b724>
 71f0fcc: b4000300     	cbz	x0, 0x71f102c <_ChromeMain+0x71ebd90>
 71f0fd0: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 71f0fd4: a9422be9     	ldp	x9, x10, [sp, #0x20]
 71f0fd8: f100011f     	cmp	x8, #0x0
 71f0fdc: 9a994121     	csel	x1, x9, x25, mi
 71f0fe0: 7100011f     	cmp	w8, #0x0
 71f0fe4: 9a884142     	csel	x2, x10, x8, mi
 71f0fe8: 910283e8     	add	x8, sp, #0xa0
 71f0fec: 910203e0     	add	x0, sp, #0x80
 71f0ff0: aa1603e3     	mov	x3, x22
 71f0ff4: 528000a4     	mov	w4, #0x5                ; =5
 71f0ff8: 970b5cf8     	bl	0x34c83d8 <_ChromeMain+0x34c313c>
 71f0ffc: 3982dfe8     	ldrsb	x8, [sp, #0xb7]
 71f1000: a94a2be9     	ldp	x9, x10, [sp, #0xa0]
 71f1004: f100011f     	cmp	x8, #0x0
 71f1008: 9a984121     	csel	x1, x9, x24, mi
 71f100c: 7100011f     	cmp	w8, #0x0
 71f1010: 9a884142     	csel	x2, x10, x8, mi
 71f1014: aa1403e0     	mov	x0, x20
 71f1018: 9649e74a     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 71f101c: aa0003fb     	mov	x27, x0
 71f1020: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 71f1024: 36fffa08     	tbz	w8, #0x1f, 0x71f0f64 <_ChromeMain+0x71ebcc8>
 71f1028: 17ffffcb     	b	0x71f0f54 <_ChromeMain+0x71ebcb8>
 71f102c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 71f1030: 36f800a8     	tbz	w8, #0x1f, 0x71f1044 <_ChromeMain+0x71ebda8>
 71f1034: f94013e0     	ldr	x0, [sp, #0x20]
 71f1038: f9401be8     	ldr	x8, [sp, #0x30]
 71f103c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f1040: 96385f9e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f1044: f9400668     	ldr	x8, [x19, #0x8]
 71f1048: f100051f     	cmp	x8, #0x1
 71f104c: 540000c1     	b.ne	0x71f1064 <_ChromeMain+0x71ebdc8>
 71f1050: f9400273     	ldr	x19, [x19]
 71f1054: 39c0be68     	ldrsb	w8, [x19, #0x2f]
 71f1058: 37f80228     	tbnz	w8, #0x1f, 0x71f109c <_ChromeMain+0x71ebe00>
 71f105c: a901fe7f     	stp	xzr, xzr, [x19, #0x18]
 71f1060: f802827f     	stur	xzr, [x19, #0x28]
 71f1064: f85983a8     	ldur	x8, [x29, #-0x68]
 71f1068: f00371a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 71f106c: f940f929     	ldr	x9, [x9, #0x1f0]
 71f1070: f9400129     	ldr	x9, [x9]
 71f1074: eb08013f     	cmp	x9, x8
 71f1078: 54001061     	b.ne	0x71f1284 <_ChromeMain+0x71ebfe8>
 71f107c: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 71f1080: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 71f1084: a95257f6     	ldp	x22, x21, [sp, #0x120]
 71f1088: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 71f108c: a95067fa     	ldp	x26, x25, [sp, #0x100]
 71f1090: a94f6ffc     	ldp	x28, x27, [sp, #0xf0]
 71f1094: 910543ff     	add	sp, sp, #0x150
 71f1098: d65f03c0     	ret
 71f109c: f9400e60     	ldr	x0, [x19, #0x18]
 71f10a0: f9401668     	ldr	x8, [x19, #0x28]
 71f10a4: d37ff901     	lsl	x1, x8, #1
 71f10a8: 96385f84     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f10ac: 17ffffec     	b	0x71f105c <_ChromeMain+0x71ebdc0>
 71f10b0: 6f00e400     	movi.2d	v0, #0000000000000000
 71f10b4: ad008300     	stp	q0, q0, [x24, #0x10]
 71f10b8: 3d800300     	str	q0, [x24]
 71f10bc: 910283e0     	add	x0, sp, #0xa0
 71f10c0: 968b4ad0     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f10c4: a901ff9f     	stp	xzr, xzr, [x28, #0x18]
 71f10c8: f802839f     	stur	xzr, [x28, #0x28]
 71f10cc: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 71f10d0: f9004bff     	str	xzr, [sp, #0x90]
 71f10d4: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 71f10d8: a9422be9     	ldp	x9, x10, [sp, #0x20]
 71f10dc: f100011f     	cmp	x8, #0x0
 71f10e0: 9a994121     	csel	x1, x9, x25, mi
 71f10e4: 7100011f     	cmp	w8, #0x0
 71f10e8: 9a884142     	csel	x2, x10, x8, mi
 71f10ec: 9101a3e8     	add	x8, sp, #0x68
 71f10f0: 910143e0     	add	x0, sp, #0x50
 71f10f4: 900341a3     	adrp	x3, 0xda25000 <dyld_stub_binder+0xda25000>
 71f10f8: 91193863     	add	x3, x3, #0x64e
 71f10fc: 52800164     	mov	w4, #0xb                ; =11
 71f1100: 970b5cb6     	bl	0x34c83d8 <_ChromeMain+0x34c313c>
 71f1104: 3981ffe8     	ldrsb	x8, [sp, #0x7f]
 71f1108: a946abe9     	ldp	x9, x10, [sp, #0x68]
 71f110c: f100011f     	cmp	x8, #0x0
 71f1110: 9101a3eb     	add	x11, sp, #0x68
 71f1114: 9a8b4121     	csel	x1, x9, x11, mi
 71f1118: 7100011f     	cmp	w8, #0x0
 71f111c: 9a884142     	csel	x2, x10, x8, mi
 71f1120: aa1403e0     	mov	x0, x20
 71f1124: 97217b2d     	bl	0x3a4fdd8 <_ChromeMain+0x3a4ab3c>
 71f1128: aa0003fb     	mov	x27, x0
 71f112c: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 71f1130: 36f800a8     	tbz	w8, #0x1f, 0x71f1144 <_ChromeMain+0x71ebea8>
 71f1134: f94037e0     	ldr	x0, [sp, #0x68]
 71f1138: f9403fe8     	ldr	x8, [sp, #0x78]
 71f113c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f1140: 96385f5e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f1144: b4ffe49b     	cbz	x27, 0x71f0dd4 <_ChromeMain+0x71ebb38>
 71f1148: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 71f114c: a9422be9     	ldp	x9, x10, [sp, #0x20]
 71f1150: f100011f     	cmp	x8, #0x0
 71f1154: 9a994121     	csel	x1, x9, x25, mi
 71f1158: 7100011f     	cmp	w8, #0x0
 71f115c: 9a884142     	csel	x2, x10, x8, mi
 71f1160: 9101a3e8     	add	x8, sp, #0x68
 71f1164: 910143e0     	add	x0, sp, #0x50
 71f1168: aa1603e3     	mov	x3, x22
 71f116c: 528000a4     	mov	w4, #0x5                ; =5
 71f1170: 970b5c9a     	bl	0x34c83d8 <_ChromeMain+0x34c313c>
 71f1174: 3981ffe8     	ldrsb	x8, [sp, #0x7f]
 71f1178: a946abe9     	ldp	x9, x10, [sp, #0x68]
 71f117c: f100011f     	cmp	x8, #0x0
 71f1180: 9101a3eb     	add	x11, sp, #0x68
 71f1184: 9a8b4121     	csel	x1, x9, x11, mi
 71f1188: 7100011f     	cmp	w8, #0x0
 71f118c: 9a884142     	csel	x2, x10, x8, mi
 71f1190: aa1403e0     	mov	x0, x20
 71f1194: 97217b11     	bl	0x3a4fdd8 <_ChromeMain+0x3a4ab3c>
 71f1198: aa0003fc     	mov	x28, x0
 71f119c: 39c1ffe8     	ldrsb	w8, [sp, #0x7f]
 71f11a0: 36f800a8     	tbz	w8, #0x1f, 0x71f11b4 <_ChromeMain+0x71ebf18>
 71f11a4: f94037e0     	ldr	x0, [sp, #0x68]
 71f11a8: f9403fe8     	ldr	x8, [sp, #0x78]
 71f11ac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 71f11b0: 96385f42     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 71f11b4: b50000bc     	cbnz	x28, 0x71f11c8 <_ChromeMain+0x71ebf2c>
 71f11b8: 910023e0     	add	x0, sp, #0x8
 71f11bc: 968b4a91     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 71f11c0: 910283fc     	add	x28, sp, #0xa0
 71f11c4: 17ffff06     	b	0x71f0ddc <_ChromeMain+0x71ebb40>
 71f11c8: 910203e0     	add	x0, sp, #0x80
 71f11cc: aa1c03e1     	mov	x1, x28
 71f11d0: 964ade25     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 71f11d4: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 71f11d8: f90007ff     	str	xzr, [sp, #0x8]
 71f11dc: 39825fe8     	ldrsb	x8, [sp, #0x97]
 71f11e0: a9482be9     	ldp	x9, x10, [sp, #0x80]
 71f11e4: f100011f     	cmp	x8, #0x0
 71f11e8: 910203eb     	add	x11, sp, #0x80
 71f11ec: 9a8b4120     	csel	x0, x9, x11, mi
 71f11f0: 7100011f     	cmp	w8, #0x0
 71f11f4: 9a884141     	csel	x1, x10, x8, mi
 71f11f8: 910023e8     	add	x8, sp, #0x8
 71f11fc: 9665e05f     	bl	0xb69378 <_ChromeMain+0xb640dc>
 71f1200: 39405f69     	ldrb	w9, [x27, #0x17]
 71f1204: 13001d28     	sxtb	w8, w9
 71f1208: f940076a     	ldr	x10, [x27, #0x8]
 71f120c: 7100011f     	cmp	w8, #0x0
 71f1210: 9a894149     	csel	x9, x10, x9, mi
 71f1214: f100053f     	cmp	x9, #0x1
 71f1218: 910283fc     	add	x28, sp, #0xa0
 71f121c: 54ffde01     	b.ne	0x71f0ddc <_ChromeMain+0x71ebb40>
 71f1220: f9400369     	ldr	x9, [x27]
 71f1224: 7100011f     	cmp	w8, #0x0
 71f1228: 9a9b4128     	csel	x8, x9, x27, mi
 71f122c: 39400108     	ldrb	w8, [x8]
 71f1230: 7100c51f     	cmp	w8, #0x31
 71f1234: 54ffdd41     	b.ne	0x71f0ddc <_ChromeMain+0x71ebb40>
 71f1238: 9100e3e8     	add	x8, sp, #0x38
 71f123c: 940005c7     	bl	0x71f2958 <_ChromeMain+0x71ed6bc>
 71f1240: 910143e8     	add	x8, sp, #0x50
 71f1244: 9100e3e0     	add	x0, sp, #0x38
 71f1248: 967b6e97     	bl	0x10ccca4 <_ChromeMain+0x10c7a08>
 71f124c: 9101a3e8     	add	x8, sp, #0x68
 71f1250: 910143e0     	add	x0, sp, #0x50
 71f1254: 910023e1     	add	x1, sp, #0x8
 71f1258: 9692a068     	bl	0x16993f8 <_ChromeMain+0x169415c>
 71f125c: 910023e0     	add	x0, sp, #0x8
 71f1260: 9101a3e1     	add	x1, sp, #0x68
 71f1264: 9690ee6a     	bl	0x162cc0c <_ChromeMain+0x1627970>
 71f1268: 9101a3e0     	add	x0, sp, #0x68
 71f126c: 9701f22e     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f1270: 910143e0     	add	x0, sp, #0x50
 71f1274: 9701f22c     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f1278: 9100e3e0     	add	x0, sp, #0x38
 71f127c: 9701f22a     	bl	0x326db24 <_ChromeMain+0x3268888>
 71f1280: 17fffed7     	b	0x71f0ddc <_ChromeMain+0x71ebb40>
 71f1284: 956710ff     	bl	0xcbb5680 <dyld_stub_binder+0xcbb5680>
