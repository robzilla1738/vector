
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4259adc: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4259ae0: a90157f6     	stp	x22, x21, [sp, #0x10]
 4259ae4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4259ae8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4259aec: 9100c3fd     	add	x29, sp, #0x30
 4259af0: d108c3ff     	sub	sp, sp, #0x230
 4259af4: aa0803f3     	mov	x19, x8
 4259af8: f900091f     	str	xzr, [x8, #0x10]
 4259afc: f8008d1f     	str	xzr, [x8, #0x8]!
 4259b00: f9000268     	str	x8, [x19]
 4259b04: a93bffbf     	stp	xzr, xzr, [x29, #-0x48]
 4259b08: f81c83bf     	stur	xzr, [x29, #-0x38]
 4259b0c: d004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4259b10: 9113f021     	add	x1, x1, #0x4fc
 4259b14: d10123a8     	sub	x8, x29, #0x48
 4259b18: 52800142     	mov	w2, #0xa                ; =10
 4259b1c: 9750fe3e     	bl	0x1699414 <_ChromeMain+0x1694178>
 4259b20: 6f00e400     	movi.2d	v0, #0000000000000000
 4259b24: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 4259b28: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 4259b2c: ad3a83a0     	stp	q0, q0, [x29, #-0xb0]
 4259b30: ad3983a0     	stp	q0, q0, [x29, #-0xd0]
 4259b34: ad3883a0     	stp	q0, q0, [x29, #-0xf0]
 4259b38: 3c9003a0     	stur	q0, [x29, #-0x100]
 4259b3c: a9077fff     	stp	xzr, xzr, [sp, #0x70]
 4259b40: f90043ff     	str	xzr, [sp, #0x80]
 4259b44: 9101c3f6     	add	x22, sp, #0x70
 4259b48: d10403a0     	sub	x0, x29, #0x100
 4259b4c: d10123a1     	sub	x1, x29, #0x48
 4259b50: 9101c3e4     	add	x4, sp, #0x70
 4259b54: 52800002     	mov	w2, #0x0                ; =0
 4259b58: 52800005     	mov	w5, #0x0                ; =0
 4259b5c: 52800043     	mov	w3, #0x2                ; =2
 4259b60: 52800006     	mov	w6, #0x0                ; =0
 4259b64: 97751e67     	bl	0x1fa1500 <_ChromeMain+0x1f9c264>
 4259b68: a9147fff     	stp	xzr, xzr, [sp, #0x140]
 4259b6c: f900abff     	str	xzr, [sp, #0x150]
 4259b70: 910503e8     	add	x8, sp, #0x140
 4259b74: 9712518b     	bl	0x6ee1a0 <_ChromeMain+0x6e8f04>
 4259b78: 39455fe9     	ldrb	w9, [sp, #0x157]
 4259b7c: 13001d28     	sxtb	w8, w9
 4259b80: f940a7ea     	ldr	x10, [sp, #0x148]
 4259b84: 7100011f     	cmp	w8, #0x0
 4259b88: 9a894149     	csel	x9, x10, x9, mi
 4259b8c: b40000e9     	cbz	x9, 0x4259ba8 <_ChromeMain+0x425490c>
 4259b90: d004c634     	adrp	x20, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4259b94: 91141e94     	add	x20, x20, #0x507
 4259b98: 910083f7     	add	x23, sp, #0x20
 4259b9c: 9004be55     	adrp	x21, 0xda21000 <dyld_stub_binder+0xda21000>
 4259ba0: 912252b5     	add	x21, x21, #0x894
 4259ba4: 1400003a     	b	0x4259c8c <_ChromeMain+0x42549f0>
 4259ba8: 37f818a8     	tbnz	w8, #0x1f, 0x4259ebc <_ChromeMain+0x4254c20>
 4259bac: d10403a0     	sub	x0, x29, #0x100
 4259bb0: 97745e08     	bl	0x1f713d0 <_ChromeMain+0x1f6c134>
 4259bb4: 38dcf3a8     	ldursb	w8, [x29, #-0x31]
 4259bb8: 37f818c8     	tbnz	w8, #0x1f, 0x4259ed0 <_ChromeMain+0x4254c34>
 4259bbc: 9108c3ff     	add	sp, sp, #0x230
 4259bc0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4259bc4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4259bc8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4259bcc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4259bd0: d65f03c0     	ret
 4259bd4: f9402be0     	ldr	x0, [sp, #0x50]
 4259bd8: f94033e8     	ldr	x8, [sp, #0x60]
 4259bdc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259be0: 96f6bcb6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259be4: 14000013     	b	0x4259c30 <_ChromeMain+0x4254994>
 4259be8: 910483e2     	add	x2, sp, #0x120
 4259bec: aa1303e0     	mov	x0, x19
 4259bf0: aa1303e1     	mov	x1, x19
 4259bf4: 9732d263     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 4259bf8: 394063e8     	ldrb	w8, [sp, #0x18]
 4259bfc: 36000068     	tbz	w8, #0x0, 0x4259c08 <_ChromeMain+0x425496c>
 4259c00: 910003e0     	mov	x0, sp
 4259c04: 971c121f     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4259c08: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4259c0c: 36f800a8     	tbz	w8, #0x1f, 0x4259c20 <_ChromeMain+0x4254984>
 4259c10: f94013e0     	ldr	x0, [sp, #0x20]
 4259c14: f9401be8     	ldr	x8, [sp, #0x30]
 4259c18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259c1c: 96f6bca7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259c20: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4259c24: 37f81428     	tbnz	w8, #0x1f, 0x4259ea8 <_ChromeMain+0x4254c0c>
 4259c28: 39419fe8     	ldrb	w8, [sp, #0x67]
 4259c2c: 373ffd48     	tbnz	w8, #0x7, 0x4259bd4 <_ChromeMain+0x4254938>
 4259c30: 9101c3e0     	add	x0, sp, #0x70
 4259c34: 97745de7     	bl	0x1f713d0 <_ChromeMain+0x1f6c134>
 4259c38: 3944dfe8     	ldrb	w8, [sp, #0x137]
 4259c3c: 363800a8     	tbz	w8, #0x7, 0x4259c50 <_ChromeMain+0x42549b4>
 4259c40: f94093e0     	ldr	x0, [sp, #0x120]
 4259c44: f9409be8     	ldr	x8, [sp, #0x130]
 4259c48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259c4c: 96f6bc9b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259c50: 9101c3e8     	add	x8, sp, #0x70
 4259c54: d10403a0     	sub	x0, x29, #0x100
 4259c58: 97125152     	bl	0x6ee1a0 <_ChromeMain+0x6e8f04>
 4259c5c: 39c55fe8     	ldrsb	w8, [sp, #0x157]
 4259c60: 37f81108     	tbnz	w8, #0x1f, 0x4259e80 <_ChromeMain+0x4254be4>
 4259c64: f94043e8     	ldr	x8, [sp, #0x80]
 4259c68: f900abe8     	str	x8, [sp, #0x150]
 4259c6c: 3dc01fe0     	ldr	q0, [sp, #0x70]
 4259c70: 3d8053e0     	str	q0, [sp, #0x140]
 4259c74: d378fd09     	lsr	x9, x8, #56
 4259c78: 13001d28     	sxtb	w8, w9
 4259c7c: f940a7ea     	ldr	x10, [sp, #0x148]
 4259c80: 7100011f     	cmp	w8, #0x0
 4259c84: 9a894149     	csel	x9, x10, x9, mi
 4259c88: b4fff909     	cbz	x9, 0x4259ba8 <_ChromeMain+0x425490c>
 4259c8c: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 4259c90: f9009bff     	str	xzr, [sp, #0x130]
 4259c94: 9101c3e8     	add	x8, sp, #0x70
 4259c98: 910503e0     	add	x0, sp, #0x140
 4259c9c: 97485e74     	bl	0x147166c <_ChromeMain+0x146c3d0>
 4259ca0: 39421fe8     	ldrb	w8, [sp, #0x87]
 4259ca4: 13001d09     	sxtb	w9, w8
 4259ca8: a9472fea     	ldp	x10, x11, [sp, #0x70]
 4259cac: 7100013f     	cmp	w9, #0x0
 4259cb0: 9a964140     	csel	x0, x10, x22, mi
 4259cb4: 9a884161     	csel	x1, x11, x8, mi
 4259cb8: 973793a9     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 4259cbc: 34001140     	cbz	w0, 0x4259ee4 <_ChromeMain+0x4254c48>
 4259cc0: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4259cc4: 36f80e88     	tbz	w8, #0x1f, 0x4259e94 <_ChromeMain+0x4254bf8>
 4259cc8: a9470be1     	ldp	x1, x2, [sp, #0x70]
 4259ccc: 910483e0     	add	x0, sp, #0x120
 4259cd0: 96f6f952     	bl	0x18218 <_ChromeMain+0x12f7c>
 4259cd4: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4259cd8: 37f803c8     	tbnz	w8, #0x1f, 0x4259d50 <_ChromeMain+0x4254ab4>
 4259cdc: 3944dfe9     	ldrb	w9, [sp, #0x137]
 4259ce0: 13001d28     	sxtb	w8, w9
 4259ce4: f94097ea     	ldr	x10, [sp, #0x128]
 4259ce8: 7100011f     	cmp	w8, #0x0
 4259cec: 9a894149     	csel	x9, x10, x9, mi
 4259cf0: b4fffa69     	cbz	x9, 0x4259c3c <_ChromeMain+0x42549a0>
 4259cf4: 6f00e400     	movi.2d	v0, #0000000000000000
 4259cf8: ad0803e0     	stp	q0, q0, [sp, #0x100]
 4259cfc: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 4259d00: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 4259d04: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 4259d08: ad0403e0     	stp	q0, q0, [sp, #0x80]
 4259d0c: 3d801fe0     	str	q0, [sp, #0x70]
 4259d10: a9007fff     	stp	xzr, xzr, [sp]
 4259d14: f9000bff     	str	xzr, [sp, #0x10]
 4259d18: 9101c3e0     	add	x0, sp, #0x70
 4259d1c: 910503e1     	add	x1, sp, #0x140
 4259d20: 910003e4     	mov	x4, sp
 4259d24: 52800002     	mov	w2, #0x0                ; =0
 4259d28: 52800043     	mov	w3, #0x2                ; =2
 4259d2c: 52800005     	mov	w5, #0x0                ; =0
 4259d30: 52800006     	mov	w6, #0x0                ; =0
 4259d34: 97751df3     	bl	0x1fa1500 <_ChromeMain+0x1f9c264>
 4259d38: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4259d3c: f90033ff     	str	xzr, [sp, #0x60]
 4259d40: 910143e8     	add	x8, sp, #0x50
 4259d44: 9101c3e0     	add	x0, sp, #0x70
 4259d48: 97125116     	bl	0x6ee1a0 <_ChromeMain+0x6e8f04>
 4259d4c: 14000023     	b	0x4259dd8 <_ChromeMain+0x4254b3c>
 4259d50: f9403be0     	ldr	x0, [sp, #0x70]
 4259d54: f94043e8     	ldr	x8, [sp, #0x80]
 4259d58: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259d5c: 96f6bc57     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259d60: 17ffffdf     	b	0x4259cdc <_ChromeMain+0x4254a40>
 4259d64: f9402be0     	ldr	x0, [sp, #0x50]
 4259d68: f94033e8     	ldr	x8, [sp, #0x60]
 4259d6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259d70: 96f6bc52     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259d74: 14000015     	b	0x4259dc8 <_ChromeMain+0x4254b2c>
 4259d78: f9401fe0     	ldr	x0, [sp, #0x38]
 4259d7c: f94027e8     	ldr	x8, [sp, #0x48]
 4259d80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259d84: 96f6bc4d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259d88: 1400000b     	b	0x4259db4 <_ChromeMain+0x4254b18>
 4259d8c: 910003e0     	mov	x0, sp
 4259d90: 971c11bc     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4259d94: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4259d98: 36f800a8     	tbz	w8, #0x1f, 0x4259dac <_ChromeMain+0x4254b10>
 4259d9c: f94013e0     	ldr	x0, [sp, #0x20]
 4259da0: f9401be8     	ldr	x8, [sp, #0x30]
 4259da4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259da8: 96f6bc44     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259dac: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4259db0: 37fffe48     	tbnz	w8, #0x1f, 0x4259d78 <_ChromeMain+0x4254adc>
 4259db4: 910003e8     	mov	x8, sp
 4259db8: 9101c3e0     	add	x0, sp, #0x70
 4259dbc: 971250f9     	bl	0x6ee1a0 <_ChromeMain+0x6e8f04>
 4259dc0: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4259dc4: 37fffd08     	tbnz	w8, #0x1f, 0x4259d64 <_ChromeMain+0x4254ac8>
 4259dc8: f9400be8     	ldr	x8, [sp, #0x10]
 4259dcc: f90033e8     	str	x8, [sp, #0x60]
 4259dd0: 3dc003e0     	ldr	q0, [sp]
 4259dd4: 3d8017e0     	str	q0, [sp, #0x50]
 4259dd8: 39419fe9     	ldrb	w9, [sp, #0x67]
 4259ddc: 13001d28     	sxtb	w8, w9
 4259de0: f9402fea     	ldr	x10, [sp, #0x58]
 4259de4: 7100011f     	cmp	w8, #0x0
 4259de8: 9a894149     	csel	x9, x10, x9, mi
 4259dec: b4fff209     	cbz	x9, 0x4259c2c <_ChromeMain+0x4254990>
 4259df0: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4259df4: f90027ff     	str	xzr, [sp, #0x48]
 4259df8: 9100e3e8     	add	x8, sp, #0x38
 4259dfc: 910143e0     	add	x0, sp, #0x50
 4259e00: aa1403e1     	mov	x1, x20
 4259e04: 528001a2     	mov	w2, #0xd                ; =13
 4259e08: 9750fd83     	bl	0x1699414 <_ChromeMain+0x1694178>
 4259e0c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4259e10: f9001bff     	str	xzr, [sp, #0x30]
 4259e14: 9100e3e0     	add	x0, sp, #0x38
 4259e18: 910083e1     	add	x1, sp, #0x20
 4259e1c: 92800002     	mov	x2, #-0x1               ; =-1
 4259e20: 9774e35a     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4259e24: 34fffb80     	cbz	w0, 0x4259d94 <_ChromeMain+0x4254af8>
 4259e28: 6f00e400     	movi.2d	v0, #0000000000000000
 4259e2c: ad0003e0     	stp	q0, q0, [sp]
 4259e30: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 4259e34: a9422be9     	ldp	x9, x10, [sp, #0x20]
 4259e38: f100011f     	cmp	x8, #0x0
 4259e3c: 9a974120     	csel	x0, x9, x23, mi
 4259e40: 7100011f     	cmp	w8, #0x0
 4259e44: 9a884141     	csel	x1, x10, x8, mi
 4259e48: 910003e8     	mov	x8, sp
 4259e4c: 52800002     	mov	w2, #0x0                ; =0
 4259e50: 52801903     	mov	w3, #0xc8               ; =200
 4259e54: 9765a03a     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4259e58: 394063e8     	ldrb	w8, [sp, #0x18]
 4259e5c: 34fff9c8     	cbz	w8, 0x4259d94 <_ChromeMain+0x4254af8>
 4259e60: 910003e0     	mov	x0, sp
 4259e64: aa1503e1     	mov	x1, x21
 4259e68: 528000a2     	mov	w2, #0x5                ; =5
 4259e6c: 971c1275     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4259e70: b5ffebc0     	cbnz	x0, 0x4259be8 <_ChromeMain+0x425494c>
 4259e74: 394063e8     	ldrb	w8, [sp, #0x18]
 4259e78: 3607f8e8     	tbz	w8, #0x0, 0x4259d94 <_ChromeMain+0x4254af8>
 4259e7c: 17ffffc4     	b	0x4259d8c <_ChromeMain+0x4254af0>
 4259e80: f940a3e0     	ldr	x0, [sp, #0x140]
 4259e84: f940abe8     	ldr	x8, [sp, #0x150]
 4259e88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259e8c: 96f6bc0b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259e90: 17ffff75     	b	0x4259c64 <_ChromeMain+0x42549c8>
 4259e94: 3dc01fe0     	ldr	q0, [sp, #0x70]
 4259e98: 3d804be0     	str	q0, [sp, #0x120]
 4259e9c: f94043e8     	ldr	x8, [sp, #0x80]
 4259ea0: f9009be8     	str	x8, [sp, #0x130]
 4259ea4: 17ffff8e     	b	0x4259cdc <_ChromeMain+0x4254a40>
 4259ea8: f9401fe0     	ldr	x0, [sp, #0x38]
 4259eac: f94027e8     	ldr	x8, [sp, #0x48]
 4259eb0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259eb4: 96f6bc01     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259eb8: 17ffff5c     	b	0x4259c28 <_ChromeMain+0x425498c>
 4259ebc: f940a3e0     	ldr	x0, [sp, #0x140]
 4259ec0: f940abe8     	ldr	x8, [sp, #0x150]
 4259ec4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259ec8: 96f6bbfc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259ecc: 17ffff38     	b	0x4259bac <_ChromeMain+0x4254910>
 4259ed0: f85b83a0     	ldur	x0, [x29, #-0x48]
 4259ed4: f85c83a8     	ldur	x8, [x29, #-0x38]
 4259ed8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4259edc: 96f6bbf7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4259ee0: 17ffff37     	b	0x4259bbc <_ChromeMain+0x4254920>
 4259ee4: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 4259ee8: f9009bff     	str	xzr, [sp, #0x130]
 4259eec: 17ffff7a     	b	0x4259cd4 <_ChromeMain+0x4254a38>
