
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4253b3c: d10183ff     	sub	sp, sp, #0x60
 4253b40: a90357f6     	stp	x22, x21, [sp, #0x30]
 4253b44: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4253b48: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4253b4c: 910143fd     	add	x29, sp, #0x50
 4253b50: aa0003f3     	mov	x19, x0
 4253b54: b9401c08     	ldr	w8, [x0, #0x1c]
 4253b58: f0056495     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4253b5c: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4253b60: 7100011f     	cmp	w8, #0x0
 4253b64: fa400804     	ccmp	x0, #0x0, #0x4, eq
 4253b68: 54000120     	b.eq	0x4253b8c <_ChromeMain+0x424e8f0>
 4253b6c: 975f3003     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4253b70: b40000c0     	cbz	x0, 0x4253b88 <_ChromeMain+0x424e8ec>
 4253b74: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4253b78: 975f3000     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4253b7c: 975f3025     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4253b80: 91008261     	add	x1, x19, #0x20
 4253b84: 94e1e69f     	bl	0x7acd600 <_ChromeMain+0x7ac8364>
 4253b88: b9401e68     	ldr	w8, [x19, #0x1c]
 4253b8c: 350004e8     	cbnz	w8, 0x4253c28 <_ChromeMain+0x424e98c>
 4253b90: 3980de68     	ldrsb	x8, [x19, #0x37]
 4253b94: b6f80048     	tbz	x8, #0x3f, 0x4253b9c <_ChromeMain+0x424e900>
 4253b98: f9401668     	ldr	x8, [x19, #0x28]
 4253b9c: b4000468     	cbz	x8, 0x4253c28 <_ChromeMain+0x424e98c>
 4253ba0: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253ba4: 910ab400     	add	x0, x0, #0x2ad
 4253ba8: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253bac: 91080821     	add	x1, x1, #0x202
 4253bb0: 910023e8     	add	x8, sp, #0x8
 4253bb4: 528131a2     	mov	w2, #0x98d              ; =2445
 4253bb8: 96f7f432     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253bbc: 52800800     	mov	w0, #0x40               ; =64
 4253bc0: 96f6edea     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253bc4: aa0003f4     	mov	x20, x0
 4253bc8: 52800028     	mov	w8, #0x1                ; =1
 4253bcc: b9000008     	str	w8, [x0]
 4253bd0: 1005f8c8     	adr	x8, 0x425fae8 <_ChromeMain+0x425a84c>
 4253bd4: d503201f     	nop
 4253bd8: d0ffeb29     	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 4253bdc: 91310129     	add	x9, x9, #0xc40
 4253be0: a900a408     	stp	x8, x9, [x0, #0x8]
 4253be4: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4253be8: 912c0108     	add	x8, x8, #0xb00
 4253bec: f9000c08     	str	x8, [x0, #0x18]
 4253bf0: 39c0de68     	ldrsb	w8, [x19, #0x37]
 4253bf4: 37f80608     	tbnz	w8, #0x1f, 0x4253cb4 <_ChromeMain+0x424ea18>
 4253bf8: 3cc20260     	ldur	q0, [x19, #0x20]
 4253bfc: 3c828280     	stur	q0, [x20, #0x28]
 4253c00: f8430268     	ldur	x8, [x19, #0x30]
 4253c04: f8038288     	stur	x8, [x20, #0x38]
 4253c08: d00565a8     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 4253c0c: f940d500     	ldr	x0, [x8, #0x1a8]
 4253c10: b00465a2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4253c14: 9103f042     	add	x2, x2, #0xfc
 4253c18: 910023e1     	add	x1, sp, #0x8
 4253c1c: aa1403e3     	mov	x3, x20
 4253c20: d2800004     	mov	x4, #0x0                ; =0
 4253c24: 9709a8d7     	bl	0x4bdf80 <_ChromeMain+0x4b8ce4>
 4253c28: 39404e68     	ldrb	w8, [x19, #0x13]
 4253c2c: 34000108     	cbz	w8, 0x4253c4c <_ChromeMain+0x424e9b0>
 4253c30: f9400268     	ldr	x8, [x19]
 4253c34: b4000068     	cbz	x8, 0x4253c40 <_ChromeMain+0x424e9a4>
 4253c38: 19404108     	ldapurb	w8, [x8, #0x4]
 4253c3c: 34000488     	cbz	w8, 0x4253ccc <_ChromeMain+0x424ea30>
 4253c40: d2800000     	mov	x0, #0x0                ; =0
 4253c44: 52800021     	mov	w1, #0x1                ; =1
 4253c48: 940ce4d4     	bl	0x458cf98 <_ChromeMain+0x4587cfc>
 4253c4c: 3900427f     	strb	wzr, [x19, #0x10]
 4253c50: f9403660     	ldr	x0, [x19, #0x68]
 4253c54: f900367f     	str	xzr, [x19, #0x68]
 4253c58: b4000080     	cbz	x0, 0x4253c68 <_ChromeMain+0x424e9cc>
 4253c5c: 94001562     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 4253c60: 52802001     	mov	w1, #0x100              ; =256
 4253c64: 96f6d495     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253c68: f9403e74     	ldr	x20, [x19, #0x78]
 4253c6c: b40001b4     	cbz	x20, 0x4253ca0 <_ChromeMain+0x424ea04>
 4253c70: f9003e7f     	str	xzr, [x19, #0x78]
 4253c74: f9400688     	ldr	x8, [x20, #0x8]
 4253c78: aa1403e0     	mov	x0, x20
 4253c7c: 52800001     	mov	w1, #0x0                ; =0
 4253c80: d63f0100     	blr	x8
 4253c84: 12800008     	mov	w8, #-0x1               ; =-1
 4253c88: b8e80288     	ldaddal	w8, w8, [x20]
 4253c8c: 7100051f     	cmp	w8, #0x1
 4253c90: 54000081     	b.ne	0x4253ca0 <_ChromeMain+0x424ea04>
 4253c94: f9400a88     	ldr	x8, [x20, #0x10]
 4253c98: aa1403e0     	mov	x0, x20
 4253c9c: d63f0100     	blr	x8
 4253ca0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4253ca4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4253ca8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4253cac: 910183ff     	add	sp, sp, #0x60
 4253cb0: d65f03c0     	ret
 4253cb4: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253cb8: 9100a280     	add	x0, x20, #0x28
 4253cbc: 96f71157     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253cc0: 17ffffd2     	b	0x4253c08 <_ChromeMain+0x424e96c>
 4253cc4: f9400660     	ldr	x0, [x19, #0x8]
 4253cc8: 1400000b     	b	0x4253cf4 <_ChromeMain+0x424ea58>
 4253ccc: f9400668     	ldr	x8, [x19, #0x8]
 4253cd0: b4fffb88     	cbz	x8, 0x4253c40 <_ChromeMain+0x424e9a4>
 4253cd4: f9467ea8     	ldr	x8, [x21, #0xcf8]
 4253cd8: f9414908     	ldr	x8, [x8, #0x290]
 4253cdc: f9400514     	ldr	x20, [x8, #0x8]
 4253ce0: f9400268     	ldr	x8, [x19]
 4253ce4: b4000068     	cbz	x8, 0x4253cf0 <_ChromeMain+0x424ea54>
 4253ce8: 19404108     	ldapurb	w8, [x8, #0x4]
 4253cec: 34fffec8     	cbz	w8, 0x4253cc4 <_ChromeMain+0x424ea28>
 4253cf0: d2800000     	mov	x0, #0x0                ; =0
 4253cf4: 970d3200     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4253cf8: b4fffa60     	cbz	x0, 0x4253c44 <_ChromeMain+0x424e9a8>
 4253cfc: f9402808     	ldr	x8, [x0, #0x50]
 4253d00: b5000068     	cbnz	x8, 0x4253d0c <_ChromeMain+0x424ea70>
 4253d04: f9402409     	ldr	x9, [x0, #0x48]
 4253d08: b4fff9c9     	cbz	x9, 0x4253c40 <_ChromeMain+0x424e9a4>
 4253d0c: 52800a09     	mov	w9, #0x50               ; =80
 4253d10: 5280090a     	mov	w10, #0x48              ; =72
 4253d14: f100011f     	cmp	x8, #0x0
 4253d18: 9a890148     	csel	x8, x10, x9, eq
 4253d1c: f8686808     	ldr	x8, [x0, x8]
 4253d20: f9400908     	ldr	x8, [x8, #0x10]
 4253d24: f9400515     	ldr	x21, [x8, #0x8]
 4253d28: b4fff8d5     	cbz	x21, 0x4253c40 <_ChromeMain+0x424e9a4>
 4253d2c: 9100a2a8     	add	x8, x21, #0x28
 4253d30: 381df3bf     	sturb	wzr, [x29, #-0x21]
 4253d34: d10087a9     	sub	x9, x29, #0x21
 4253d38: a900a3e9     	stp	x9, x8, [sp, #0x8]
 4253d3c: d0fe5ae2     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4253d40: 912dc042     	add	x2, x2, #0xb70
 4253d44: 910023e1     	add	x1, sp, #0x8
 4253d48: aa1403e0     	mov	x0, x20
 4253d4c: 52800003     	mov	w3, #0x0                ; =0
 4253d50: 52800004     	mov	w4, #0x0                ; =0
 4253d54: 972d76c7     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4253d58: 385df3a8     	ldurb	w8, [x29, #-0x21]
 4253d5c: 7100011f     	cmp	w8, #0x0
 4253d60: 9a9f12a0     	csel	x0, x21, xzr, ne
 4253d64: 17ffffb8     	b	0x4253c44 <_ChromeMain+0x424e9a8>
