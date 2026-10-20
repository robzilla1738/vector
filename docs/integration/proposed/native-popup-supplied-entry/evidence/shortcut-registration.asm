
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4599e90: d10603ff     	sub	sp, sp, #0x180
 4599e94: a91557f6     	stp	x22, x21, [sp, #0x150]
 4599e98: a9164ff4     	stp	x20, x19, [sp, #0x160]
 4599e9c: a9177bfd     	stp	x29, x30, [sp, #0x170]
 4599ea0: 9105c3fd     	add	x29, sp, #0x170
 4599ea4: b0054a75     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4599ea8: f9467ea8     	ldr	x8, [x21, #0xcf8]
 4599eac: b4000168     	cbz	x8, 0x4599ed8 <_ChromeMain+0x4594c3c>
 4599eb0: aa0003f3     	mov	x19, x0
 4599eb4: f9401d00     	ldr	x0, [x8, #0x38]
 4599eb8: b4000100     	cbz	x0, 0x4599ed8 <_ChromeMain+0x4594c3c>
 4599ebc: f0044ac1     	adrp	x1, 0xcef4000 <dyld_stub_binder+0xcef4000>
 4599ec0: 9135ac21     	add	x1, x1, #0xd6b
 4599ec4: 52800302     	mov	w2, #0x18               ; =24
 4599ec8: 96f5b18e     	bl	0x306500 <_ChromeMain+0x301264>
 4599ecc: 34000060     	cbz	w0, 0x4599ed8 <_ChromeMain+0x4594c3c>
 4599ed0: 39408268     	ldrb	w8, [x19, #0x20]
 4599ed4: 360000c8     	tbz	w8, #0x0, 0x4599eec <_ChromeMain+0x4594c50>
 4599ed8: a9577bfd     	ldp	x29, x30, [sp, #0x170]
 4599edc: a9564ff4     	ldp	x20, x19, [sp, #0x160]
 4599ee0: a95557f6     	ldp	x22, x21, [sp, #0x150]
 4599ee4: 910603ff     	add	sp, sp, #0x180
 4599ee8: d65f03c0     	ret
 4599eec: 979f0840     	bl	0x2d5bfec <_ChromeMain+0x2d56d50>
 4599ef0: aa0003f4     	mov	x20, x0
 4599ef4: 6f00e400     	movi.2d	v0, #0000000000000000
 4599ef8: ad3e03a0     	stp	q0, q0, [x29, #-0x40]
 4599efc: f9467ea8     	ldr	x8, [x21, #0xcf8]
 4599f00: b4000228     	cbz	x8, 0x4599f44 <_ChromeMain+0x4594ca8>
 4599f04: f9401d00     	ldr	x0, [x8, #0x38]
 4599f08: b40001e0     	cbz	x0, 0x4599f44 <_ChromeMain+0x4594ca8>
 4599f0c: f0044ac1     	adrp	x1, 0xcef4000 <dyld_stub_binder+0xcef4000>
 4599f10: 91354421     	add	x1, x1, #0xd51
 4599f14: 52800322     	mov	w2, #0x19               ; =25
 4599f18: 9723ae51     	bl	0xe8585c <_ChromeMain+0xe805c0>
 4599f1c: 39805c08     	ldrsb	x8, [x0, #0x17]
 4599f20: a9402809     	ldp	x9, x10, [x0]
 4599f24: f100011f     	cmp	x8, #0x0
 4599f28: 9a804120     	csel	x0, x9, x0, mi
 4599f2c: 7100011f     	cmp	w8, #0x0
 4599f30: 9a884141     	csel	x1, x10, x8, mi
 4599f34: d10103a8     	sub	x8, x29, #0x40
 4599f38: 97b7f6a4     	bl	0x33979c8 <_ChromeMain+0x339272c>
 4599f3c: b50000b4     	cbnz	x20, 0x4599f50 <_ChromeMain+0x4594cb4>
 4599f40: 14000008     	b	0x4599f60 <_ChromeMain+0x4594cc4>
 4599f44: 12800008     	mov	w8, #-0x1               ; =-1
 4599f48: b81dc3a8     	stur	w8, [x29, #-0x24]
 4599f4c: b40000b4     	cbz	x20, 0x4599f60 <_ChromeMain+0x4594cc4>
 4599f50: 785c03a8     	ldurh	w8, [x29, #-0x40]
 4599f54: 350003e8     	cbnz	w8, 0x4599fd0 <_ChromeMain+0x4594d34>
 4599f58: b85c83a8     	ldur	w8, [x29, #-0x38]
 4599f5c: 350003a8     	cbnz	w8, 0x4599fd0 <_ChromeMain+0x4594d34>
 4599f60: 3900827f     	strb	wzr, [x19, #0x20]
 4599f64: f0054b68     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4599f68: b940b108     	ldr	w8, [x8, #0xb0]
 4599f6c: 7100051f     	cmp	w8, #0x1
 4599f70: 54fffb4c     	b.gt	0x4599ed8 <_ChromeMain+0x4594c3c>
 4599f74: 900530c8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4599f78: b94b8908     	ldr	w8, [x8, #0xb88]
 4599f7c: 35000088     	cbnz	w8, 0x4599f8c <_ChromeMain+0x4594cf0>
 4599f80: f0054b68     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4599f84: f9405d08     	ldr	x8, [x8, #0xb8]
 4599f88: b4fffa88     	cbz	x8, 0x4599ed8 <_ChromeMain+0x4594c3c>
 4599f8c: 39408268     	ldrb	w8, [x19, #0x20]
 4599f90: 3707fa48     	tbnz	w8, #0x0, 0x4599ed8 <_ChromeMain+0x4594c3c>
 4599f94: 9004c981     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4599f98: 91163421     	add	x1, x1, #0x58d
 4599f9c: 910003f3     	mov	x19, sp
 4599fa0: 910003e0     	mov	x0, sp
 4599fa4: 528054e2     	mov	w2, #0x2a7              ; =679
 4599fa8: 52800023     	mov	w3, #0x1                ; =1
 4599fac: 9701bc68     	bl	0x60914c <_ChromeMain+0x603eb0>
 4599fb0: 9004c981     	adrp	x1, 0xdec9000 <dyld_stub_binder+0xdec9000>
 4599fb4: 911a9821     	add	x1, x1, #0x6a6
 4599fb8: 91004260     	add	x0, x19, #0x10
 4599fbc: 52800582     	mov	w2, #0x2c               ; =44
 4599fc0: 96ea2d3f     	bl	0x254bc <_ChromeMain+0x20220>
 4599fc4: 910003e0     	mov	x0, sp
 4599fc8: 9701bc2e     	bl	0x609080 <_ChromeMain+0x603de4>
 4599fcc: 17ffffc3     	b	0x4599ed8 <_ChromeMain+0x4594c3c>
 4599fd0: d10103a1     	sub	x1, x29, #0x40
 4599fd4: aa1403e0     	mov	x0, x20
 4599fd8: aa1303e2     	mov	x2, x19
 4599fdc: 94b38c3e     	bl	0x727d0d4 <_ChromeMain+0x7277e38>
 4599fe0: 39008260     	strb	w0, [x19, #0x20]
 4599fe4: 34fffc00     	cbz	w0, 0x4599f64 <_ChromeMain+0x4594cc8>
 4599fe8: ad7e07a0     	ldp	q0, q1, [x29, #-0x40]
 4599fec: 3c828260     	stur	q0, [x19, #0x28]
 4599ff0: 3c838261     	stur	q1, [x19, #0x38]
 4599ff4: f9402a68     	ldr	x8, [x19, #0x50]
 4599ff8: b5fffb68     	cbnz	x8, 0x4599f64 <_ChromeMain+0x4594cc8>
 4599ffc: 52800100     	mov	w0, #0x8                ; =8
 459a000: 96e9d4da     	bl	0xf368 <_ChromeMain+0xa0cc>
 459a004: aa0003f5     	mov	x21, x0
 459a008: d2800328     	mov	x8, #0x19               ; =25
 459a00c: f2c00028     	movk	x8, #0x1, lsl #32
 459a010: f9000008     	str	x8, [x0]
 459a014: 978a4d1b     	bl	0x282d480 <_ChromeMain+0x28281e4>
 459a018: 52800321     	mov	w1, #0x19               ; =25
 459a01c: 52800022     	mov	w2, #0x1                ; =1
 459a020: 978a4d58     	bl	0x282d580 <_ChromeMain+0x28282e4>
 459a024: f9402a74     	ldr	x20, [x19, #0x50]
 459a028: f9002a75     	str	x21, [x19, #0x50]
 459a02c: b4fff9d4     	cbz	x20, 0x4599f64 <_ChromeMain+0x4594cc8>
 459a030: 978a4d14     	bl	0x282d480 <_ChromeMain+0x28281e4>
 459a034: 29400a81     	ldp	w1, w2, [x20]
 459a038: 978f9e72     	bl	0x2981a00 <_ChromeMain+0x297c764>
 459a03c: aa1403e0     	mov	x0, x20
 459a040: 52800101     	mov	w1, #0x8                ; =8
 459a044: 96e9bb9d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 459a048: 17ffffc7     	b	0x4599f64 <_ChromeMain+0x4594cc8>
