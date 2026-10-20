
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4258c80: d10203ff     	sub	sp, sp, #0x80
 4258c84: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4258c88: a90557f6     	stp	x22, x21, [sp, #0x50]
 4258c8c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4258c90: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4258c94: 9101c3fd     	add	x29, sp, #0x70
 4258c98: 39404408     	ldrb	w8, [x0, #0x11]
 4258c9c: 34000cc8     	cbz	w8, 0x4258e34 <_ChromeMain+0x4253b98>
 4258ca0: aa0003f4     	mov	x20, x0
 4258ca4: 39404808     	ldrb	w8, [x0, #0x12]
 4258ca8: 34000c68     	cbz	w8, 0x4258e34 <_ChromeMain+0x4253b98>
 4258cac: 3900429f     	strb	wzr, [x20, #0x10]
 4258cb0: f9403e93     	ldr	x19, [x20, #0x78]
 4258cb4: b40001b3     	cbz	x19, 0x4258ce8 <_ChromeMain+0x4253a4c>
 4258cb8: f9003e9f     	str	xzr, [x20, #0x78]
 4258cbc: f9400668     	ldr	x8, [x19, #0x8]
 4258cc0: aa1303e0     	mov	x0, x19
 4258cc4: 52800021     	mov	w1, #0x1                ; =1
 4258cc8: d63f0100     	blr	x8
 4258ccc: 12800008     	mov	w8, #-0x1               ; =-1
 4258cd0: b8e80268     	ldaddal	w8, w8, [x19]
 4258cd4: 7100051f     	cmp	w8, #0x1
 4258cd8: 54000081     	b.ne	0x4258ce8 <_ChromeMain+0x4253a4c>
 4258cdc: f9400a68     	ldr	x8, [x19, #0x10]
 4258ce0: aa1303e0     	mov	x0, x19
 4258ce4: d63f0100     	blr	x8
 4258ce8: 39404e88     	ldrb	w8, [x20, #0x13]
 4258cec: 34000a48     	cbz	w8, 0x4258e34 <_ChromeMain+0x4253b98>
 4258cf0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4258cf4: f9001bff     	str	xzr, [sp, #0x30]
 4258cf8: 39c0de88     	ldrsb	w8, [x20, #0x37]
 4258cfc: 37f80a88     	tbnz	w8, #0x1f, 0x4258e4c <_ChromeMain+0x4253bb0>
 4258d00: 3cc20280     	ldur	q0, [x20, #0x20]
 4258d04: 3d800be0     	str	q0, [sp, #0x20]
 4258d08: f8430288     	ldur	x8, [x20, #0x30]
 4258d0c: f9001be8     	str	x8, [sp, #0x30]
 4258d10: 52800100     	mov	w0, #0x8                ; =8
 4258d14: 96f6d995     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258d18: aa0003f3     	mov	x19, x0
 4258d1c: f900001f     	str	xzr, [x0]
 4258d20: f9400288     	ldr	x8, [x20]
 4258d24: b4000068     	cbz	x8, 0x4258d30 <_ChromeMain+0x4253a94>
 4258d28: 19404108     	ldapurb	w8, [x8, #0x4]
 4258d2c: 34001008     	cbz	w8, 0x4258f2c <_ChromeMain+0x4253c90>
 4258d30: d2800018     	mov	x24, #0x0               ; =0
 4258d34: b9401e88     	ldr	w8, [x20, #0x1c]
 4258d38: f0055540     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 4258d3c: 9135a000     	add	x0, x0, #0xd68
 4258d40: f9400009     	ldr	x9, [x0]
 4258d44: d63f0120     	blr	x9
 4258d48: f9400009     	ldr	x9, [x0]
 4258d4c: b40016a9     	cbz	x9, 0x4259020 <_ChromeMain+0x4253d84>
 4258d50: f9400135     	ldr	x21, [x9]
 4258d54: b4001675     	cbz	x21, 0x4259020 <_ChromeMain+0x4253d84>
 4258d58: f004c620     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4258d5c: 910a4800     	add	x0, x0, #0x292
 4258d60: f004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4258d64: 91080821     	add	x1, x1, #0x202
 4258d68: 7100051f     	cmp	w8, #0x1
 4258d6c: 54000821     	b.ne	0x4258e70 <_ChromeMain+0x4253bd4>
 4258d70: 910003e8     	mov	x8, sp
 4258d74: 52812f42     	mov	w2, #0x97a              ; =2426
 4258d78: 96f7dfc2     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4258d7c: 52800800     	mov	w0, #0x40               ; =64
 4258d80: 96f6d97a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258d84: aa0003f6     	mov	x22, x0
 4258d88: 52800028     	mov	w8, #0x1                ; =1
 4258d8c: b9000008     	str	w8, [x0]
 4258d90: 10035ac8     	adr	x8, 0x425f8e8 <_ChromeMain+0x425a64c>
 4258d94: d503201f     	nop
 4258d98: 10035fa9     	adr	x9, 0x425f98c <_ChromeMain+0x425a6f0>
 4258d9c: d503201f     	nop
 4258da0: a900a408     	stp	x8, x9, [x0, #0x8]
 4258da4: b0ff1828     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4258da8: 912c0108     	add	x8, x8, #0xb00
 4258dac: 10001409     	adr	x9, 0x425902c <_ChromeMain+0x4253d90>
 4258db0: d503201f     	nop
 4258db4: a901a408     	stp	x8, x9, [x0, #0x18]
 4258db8: b9401a88     	ldr	w8, [x20, #0x18]
 4258dbc: b9002808     	str	w8, [x0, #0x28]
 4258dc0: 52800100     	mov	w0, #0x8                ; =8
 4258dc4: 96f6d969     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258dc8: aa0003f4     	mov	x20, x0
 4258dcc: f900001f     	str	xzr, [x0]
 4258dd0: f9001ac0     	str	x0, [x22, #0x30]
 4258dd4: aa1303e0     	mov	x0, x19
 4258dd8: 95104ccd     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4258ddc: aa0003f7     	mov	x23, x0
 4258de0: aa1403e0     	mov	x0, x20
 4258de4: aa1703e1     	mov	x1, x23
 4258de8: 95104cc6     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4258dec: aa1703e0     	mov	x0, x23
 4258df0: 94f6aa5b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4258df4: f9001ed8     	str	x24, [x22, #0x38]
 4258df8: f94002a8     	ldr	x8, [x21]
 4258dfc: f9400108     	ldr	x8, [x8]
 4258e00: 910003e1     	mov	x1, sp
 4258e04: aa1503e0     	mov	x0, x21
 4258e08: aa1603e2     	mov	x2, x22
 4258e0c: d2800003     	mov	x3, #0x0                ; =0
 4258e10: d63f0100     	blr	x8
 4258e14: b40000d3     	cbz	x19, 0x4258e2c <_ChromeMain+0x4253b90>
 4258e18: aa1303e0     	mov	x0, x19
 4258e1c: 95104cbf     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4258e20: aa1303e0     	mov	x0, x19
 4258e24: 52800101     	mov	w1, #0x8                ; =8
 4258e28: 96f6c024     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258e2c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4258e30: 37f80168     	tbnz	w8, #0x1f, 0x4258e5c <_ChromeMain+0x4253bc0>
 4258e34: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4258e38: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4258e3c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4258e40: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4258e44: 910203ff     	add	sp, sp, #0x80
 4258e48: d65f03c0     	ret
 4258e4c: a9420a81     	ldp	x1, x2, [x20, #0x20]
 4258e50: 910083e0     	add	x0, sp, #0x20
 4258e54: 96f6fcf1     	bl	0x18218 <_ChromeMain+0x12f7c>
 4258e58: 17ffffae     	b	0x4258d10 <_ChromeMain+0x4253a74>
 4258e5c: f94013e0     	ldr	x0, [sp, #0x20]
 4258e60: f9401be8     	ldr	x8, [sp, #0x30]
 4258e64: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4258e68: 96f6c014     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258e6c: 17fffff2     	b	0x4258e34 <_ChromeMain+0x4253b98>
 4258e70: 910003e8     	mov	x8, sp
 4258e74: 52812fc2     	mov	w2, #0x97e              ; =2430
 4258e78: 96f7df82     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4258e7c: 52800b00     	mov	w0, #0x58               ; =88
 4258e80: 96f6d93a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258e84: aa0003f6     	mov	x22, x0
 4258e88: 52800028     	mov	w8, #0x1                ; =1
 4258e8c: b9000008     	str	w8, [x0]
 4258e90: 10035a48     	adr	x8, 0x425f9d8 <_ChromeMain+0x425a73c>
 4258e94: d503201f     	nop
 4258e98: 10035f49     	adr	x9, 0x425fa80 <_ChromeMain+0x425a7e4>
 4258e9c: d503201f     	nop
 4258ea0: a900a408     	stp	x8, x9, [x0, #0x8]
 4258ea4: b0ff1828     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4258ea8: 912c0108     	add	x8, x8, #0xb00
 4258eac: 100012a9     	adr	x9, 0x4259100 <_ChromeMain+0x4253e64>
 4258eb0: d503201f     	nop
 4258eb4: a901a408     	stp	x8, x9, [x0, #0x18]
 4258eb8: b9401a88     	ldr	w8, [x20, #0x18]
 4258ebc: b9002808     	str	w8, [x0, #0x28]
 4258ec0: 52800100     	mov	w0, #0x8                ; =8
 4258ec4: 96f6d929     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258ec8: aa0003f4     	mov	x20, x0
 4258ecc: f900001f     	str	xzr, [x0]
 4258ed0: f9001ac0     	str	x0, [x22, #0x30]
 4258ed4: aa1303e0     	mov	x0, x19
 4258ed8: 95104c8d     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4258edc: aa0003f7     	mov	x23, x0
 4258ee0: aa1403e0     	mov	x0, x20
 4258ee4: aa1703e1     	mov	x1, x23
 4258ee8: 95104c86     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4258eec: aa1703e0     	mov	x0, x23
 4258ef0: 94f6aa1b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4258ef4: f9001ed8     	str	x24, [x22, #0x38]
 4258ef8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4258efc: 37f800c8     	tbnz	w8, #0x1f, 0x4258f14 <_ChromeMain+0x4253c78>
 4258f00: 3dc00be0     	ldr	q0, [sp, #0x20]
 4258f04: 3c8402c0     	stur	q0, [x22, #0x40]
 4258f08: f9401be8     	ldr	x8, [sp, #0x30]
 4258f0c: f80502c8     	stur	x8, [x22, #0x50]
 4258f10: 17ffffba     	b	0x4258df8 <_ChromeMain+0x4253b5c>
 4258f14: a9420be1     	ldp	x1, x2, [sp, #0x20]
 4258f18: 910102c0     	add	x0, x22, #0x40
 4258f1c: 96f6fcbf     	bl	0x18218 <_ChromeMain+0x12f7c>
 4258f20: 17ffffb6     	b	0x4258df8 <_ChromeMain+0x4253b5c>
 4258f24: f9400680     	ldr	x0, [x20, #0x8]
 4258f28: 1400000c     	b	0x4258f58 <_ChromeMain+0x4253cbc>
 4258f2c: f9400688     	ldr	x8, [x20, #0x8]
 4258f30: b4fff008     	cbz	x8, 0x4258d30 <_ChromeMain+0x4253a94>
 4258f34: d0056468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4258f38: f9467d08     	ldr	x8, [x8, #0xcf8]
 4258f3c: f9414908     	ldr	x8, [x8, #0x290]
 4258f40: f9400515     	ldr	x21, [x8, #0x8]
 4258f44: f9400288     	ldr	x8, [x20]
 4258f48: b4000068     	cbz	x8, 0x4258f54 <_ChromeMain+0x4253cb8>
 4258f4c: 19404108     	ldapurb	w8, [x8, #0x4]
 4258f50: 34fffea8     	cbz	w8, 0x4258f24 <_ChromeMain+0x4253c88>
 4258f54: d2800000     	mov	x0, #0x0                ; =0
 4258f58: 970d1d67     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4258f5c: b4ffeea0     	cbz	x0, 0x4258d30 <_ChromeMain+0x4253a94>
 4258f60: f9402808     	ldr	x8, [x0, #0x50]
 4258f64: b5000068     	cbnz	x8, 0x4258f70 <_ChromeMain+0x4253cd4>
 4258f68: f9402409     	ldr	x9, [x0, #0x48]
 4258f6c: b4ffee29     	cbz	x9, 0x4258d30 <_ChromeMain+0x4253a94>
 4258f70: 52800a09     	mov	w9, #0x50               ; =80
 4258f74: 5280090a     	mov	w10, #0x48              ; =72
 4258f78: f100011f     	cmp	x8, #0x0
 4258f7c: 9a890148     	csel	x8, x10, x9, eq
 4258f80: f8686808     	ldr	x8, [x0, x8]
 4258f84: f9400908     	ldr	x8, [x8, #0x10]
 4258f88: f9400516     	ldr	x22, [x8, #0x8]
 4258f8c: b4ffed36     	cbz	x22, 0x4258d30 <_ChromeMain+0x4253a94>
 4258f90: 9100a2c8     	add	x8, x22, #0x28
 4258f94: 381cf3bf     	sturb	wzr, [x29, #-0x31]
 4258f98: d100c7a9     	sub	x9, x29, #0x31
 4258f9c: a90023e9     	stp	x9, x8, [sp]
 4258fa0: b0fe5ac2     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4258fa4: 912dc042     	add	x2, x2, #0xb70
 4258fa8: 910003e1     	mov	x1, sp
 4258fac: aa1503e0     	mov	x0, x21
 4258fb0: 52800003     	mov	w3, #0x0                ; =0
 4258fb4: 52800004     	mov	w4, #0x0                ; =0
 4258fb8: 972d622e     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4258fbc: 385cf3a8     	ldurb	w8, [x29, #-0x31]
 4258fc0: 34ffeb88     	cbz	w8, 0x4258d30 <_ChromeMain+0x4253a94>
 4258fc4: f9403ec0     	ldr	x0, [x22, #0x78]
 4258fc8: b4ffeb40     	cbz	x0, 0x4258d30 <_ChromeMain+0x4253a94>
 4258fcc: f9400008     	ldr	x8, [x0]
 4258fd0: f9401109     	ldr	x9, [x8, #0x20]
 4258fd4: 910003e8     	mov	x8, sp
 4258fd8: d63f0120     	blr	x9
 4258fdc: f94003e0     	ldr	x0, [sp]
 4258fe0: 95104c4b     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4258fe4: aa0003f5     	mov	x21, x0
 4258fe8: aa1303e0     	mov	x0, x19
 4258fec: aa1503e1     	mov	x1, x21
 4258ff0: 95104c44     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4258ff4: aa1503e0     	mov	x0, x21
 4258ff8: 94f6a9d9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4258ffc: a94063f5     	ldp	x21, x24, [sp]
 4259000: f90003ff     	str	xzr, [sp]
 4259004: b4ffe995     	cbz	x21, 0x4258d34 <_ChromeMain+0x4253a98>
 4259008: aa1503e0     	mov	x0, x21
 425900c: 95104c43     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4259010: aa1503e0     	mov	x0, x21
 4259014: 52800101     	mov	w1, #0x8                ; =8
 4259018: 96f6bfa8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425901c: 17ffff46     	b	0x4258d34 <_ChromeMain+0x4253a98>
 4259020: d4200000     	brk	#0
 4259024: d4400000     	hlt	#0
 4259028: d4200020     	brk	#0x1
 425902c: d10183ff     	sub	sp, sp, #0x60
 4259030: a90357f6     	stp	x22, x21, [sp, #0x30]
 4259034: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4259038: a9057bfd     	stp	x29, x30, [sp, #0x50]
 425903c: 910143fd     	add	x29, sp, #0x50
 4259040: aa0103f3     	mov	x19, x1
 4259044: aa0003f4     	mov	x20, x0
 4259048: 52800100     	mov	w0, #0x8                ; =8
 425904c: 96f6d8c7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4259050: aa0003f5     	mov	x21, x0
 4259054: f900001f     	str	xzr, [x0]
 4259058: f90013e0     	str	x0, [sp, #0x20]
 425905c: f9400260     	ldr	x0, [x19]
 4259060: 95104c2b     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4259064: aa0003f6     	mov	x22, x0
 4259068: aa1503e0     	mov	x0, x21
 425906c: aa1603e1     	mov	x1, x22
 4259070: 95104c24     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4259074: aa1603e0     	mov	x0, x22
 4259078: 94f6a9b9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 425907c: f9400668     	ldr	x8, [x19, #0x8]
 4259080: f90017e8     	str	x8, [sp, #0x28]
 4259084: 910023f3     	add	x19, sp, #0x8
 4259088: 910023e8     	add	x8, sp, #0x8
 425908c: aa1403e0     	mov	x0, x20
 4259090: 94001b80     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4259094: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 4259098: a940abe9     	ldp	x9, x10, [sp, #0x8]
 425909c: f100011f     	cmp	x8, #0x0
 42590a0: 9a934121     	csel	x1, x9, x19, mi
 42590a4: 7100011f     	cmp	w8, #0x0
 42590a8: 9a884142     	csel	x2, x10, x8, mi
 42590ac: 910083e0     	add	x0, sp, #0x20
 42590b0: 940cd19a     	bl	0x458d718 <_ChromeMain+0x458847c>
 42590b4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 42590b8: 36f800a8     	tbz	w8, #0x1f, 0x42590cc <_ChromeMain+0x4253e30>
 42590bc: f94007e0     	ldr	x0, [sp, #0x8]
 42590c0: f9400fe8     	ldr	x8, [sp, #0x18]
 42590c4: d37ff901     	lsl	x1, x8, #1
 42590c8: 96f6bf7c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42590cc: f94013f3     	ldr	x19, [sp, #0x20]
 42590d0: f90013ff     	str	xzr, [sp, #0x20]
 42590d4: b40000d3     	cbz	x19, 0x42590ec <_ChromeMain+0x4253e50>
 42590d8: aa1303e0     	mov	x0, x19
 42590dc: 95104c0f     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 42590e0: aa1303e0     	mov	x0, x19
 42590e4: 52800101     	mov	w1, #0x8                ; =8
 42590e8: 96f6bf74     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42590ec: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42590f0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42590f4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42590f8: 910183ff     	add	sp, sp, #0x60
 42590fc: d65f03c0     	ret
 4259100: d101c3ff     	sub	sp, sp, #0x70
 4259104: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4259108: a90457f6     	stp	x22, x21, [sp, #0x40]
 425910c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4259110: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4259114: 910183fd     	add	x29, sp, #0x60
 4259118: aa0203f3     	mov	x19, x2
 425911c: aa0103f4     	mov	x20, x1
 4259120: aa0003f5     	mov	x21, x0
 4259124: 52800100     	mov	w0, #0x8                ; =8
 4259128: 96f6d890     	bl	0xf368 <_ChromeMain+0xa0cc>
 425912c: aa0003f6     	mov	x22, x0
 4259130: f900001f     	str	xzr, [x0]
 4259134: f90013e0     	str	x0, [sp, #0x20]
 4259138: f9400280     	ldr	x0, [x20]
 425913c: 95104bf4     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4259140: aa0003f7     	mov	x23, x0
 4259144: aa1603e0     	mov	x0, x22
 4259148: aa1703e1     	mov	x1, x23
 425914c: 95104bed     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4259150: aa1703e0     	mov	x0, x23
 4259154: 94f6a982     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4259158: f9400688     	ldr	x8, [x20, #0x8]
 425915c: f90017e8     	str	x8, [sp, #0x28]
 4259160: 910023f4     	add	x20, sp, #0x8
 4259164: 910023e8     	add	x8, sp, #0x8
 4259168: aa1503e0     	mov	x0, x21
 425916c: 94001b49     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4259170: 39807fe8     	ldrsb	x8, [sp, #0x1f]
 4259174: a940abe9     	ldp	x9, x10, [sp, #0x8]
 4259178: f100011f     	cmp	x8, #0x0
 425917c: 9a944121     	csel	x1, x9, x20, mi
 4259180: 7100011f     	cmp	w8, #0x0
 4259184: 9a884142     	csel	x2, x10, x8, mi
 4259188: 910083e0     	add	x0, sp, #0x20
 425918c: aa1303e3     	mov	x3, x19
 4259190: 940cd108     	bl	0x458d5b0 <_ChromeMain+0x4588314>
 4259194: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4259198: 36f800a8     	tbz	w8, #0x1f, 0x42591ac <_ChromeMain+0x4253f10>
 425919c: f94007e0     	ldr	x0, [sp, #0x8]
 42591a0: f9400fe8     	ldr	x8, [sp, #0x18]
 42591a4: d37ff901     	lsl	x1, x8, #1
 42591a8: 96f6bf44     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42591ac: f94013f3     	ldr	x19, [sp, #0x20]
 42591b0: f90013ff     	str	xzr, [sp, #0x20]
 42591b4: b40000d3     	cbz	x19, 0x42591cc <_ChromeMain+0x4253f30>
 42591b8: aa1303e0     	mov	x0, x19
 42591bc: 95104bd7     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 42591c0: aa1303e0     	mov	x0, x19
 42591c4: 52800101     	mov	w1, #0x8                ; =8
 42591c8: 96f6bf3c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42591cc: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 42591d0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 42591d4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 42591d8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 42591dc: 9101c3ff     	add	sp, sp, #0x70
 42591e0: d65f03c0     	ret
