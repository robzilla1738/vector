
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4607b70: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 4607b74: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4607b78: a90257f6     	stp	x22, x21, [sp, #0x20]
 4607b7c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4607b80: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4607b84: 910103fd     	add	x29, sp, #0x40
 4607b88: d10883ff     	sub	sp, sp, #0x220
 4607b8c: f9423c08     	ldr	x8, [x0, #0x478]
 4607b90: b4000108     	cbz	x8, 0x4607bb0 <_ChromeMain+0x4602914>
 4607b94: 910883ff     	add	sp, sp, #0x220
 4607b98: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4607b9c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4607ba0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4607ba4: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4607ba8: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4607bac: d65f03c0     	ret
 4607bb0: aa0103f6     	mov	x22, x1
 4607bb4: aa0003f3     	mov	x19, x0
 4607bb8: f941b408     	ldr	x8, [x0, #0x368]
 4607bbc: eb08003f     	cmp	x1, x8
 4607bc0: 54fffea2     	b.hs	0x4607b94 <_ChromeMain+0x46028f8>
 4607bc4: f9400268     	ldr	x8, [x19]
 4607bc8: f9403508     	ldr	x8, [x8, #0x68]
 4607bcc: aa1303e0     	mov	x0, x19
 4607bd0: d63f0100     	blr	x8
 4607bd4: b4fffe00     	cbz	x0, 0x4607b94 <_ChromeMain+0x46028f8>
 4607bd8: aa0003f5     	mov	x21, x0
 4607bdc: f0054818     	adrp	x24, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4607be0: 91120318     	add	x24, x24, #0x480
 4607be4: f8bfc300     	ldapr	x0, [x24]
 4607be8: b4002440     	cbz	x0, 0x4608070 <_ChromeMain+0x4602dd4>
 4607bec: 52806201     	mov	w1, #0x310              ; =784
 4607bf0: d2800002     	mov	x2, #0x0                ; =0
 4607bf4: 96ea8e6f     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4607bf8: aa0003f4     	mov	x20, x0
 4607bfc: 97359d51     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4607c00: 3946a408     	ldrb	w8, [x0, #0x1a9]
 4607c04: 340000a8     	cbz	w8, 0x4607c18 <_ChromeMain+0x460297c>
 4607c08: 3906a69f     	strb	wzr, [x20, #0x1a9]
 4607c0c: 9103e280     	add	x0, x20, #0xf8
 4607c10: 9106a681     	add	x1, x20, #0x1a9
 4607c14: 972480ef     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4607c18: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4607c1c: f0052d59     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4607c20: f9404729     	ldr	x9, [x25, #0x88]
 4607c24: eb09011f     	cmp	x8, x9
 4607c28: 54000061     	b.ne	0x4607c34 <_ChromeMain+0x4602998>
 4607c2c: aa1403e0     	mov	x0, x20
 4607c30: 96e831b3     	bl	0x142fc <_ChromeMain+0xf060>
 4607c34: f9424260     	ldr	x0, [x19, #0x480]
 4607c38: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4607c3c: f9404729     	ldr	x9, [x25, #0x88]
 4607c40: eb09011f     	cmp	x8, x9
 4607c44: 54000041     	b.ne	0x4607c4c <_ChromeMain+0x46029b0>
 4607c48: 96e86b7d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4607c4c: f9024274     	str	x20, [x19, #0x480]
 4607c50: f8bfc300     	ldapr	x0, [x24]
 4607c54: b4002120     	cbz	x0, 0x4608078 <_ChromeMain+0x4602ddc>
 4607c58: 52808001     	mov	w1, #0x400              ; =1024
 4607c5c: d2800002     	mov	x2, #0x0                ; =0
 4607c60: 96ea8e54     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4607c64: aa0003f7     	mov	x23, x0
 4607c68: aa1303e1     	mov	x1, x19
 4607c6c: aa1603e2     	mov	x2, x22
 4607c70: 94001c7c     	bl	0x460ee60 <_ChromeMain+0x4609bc4>
 4607c74: 3946a408     	ldrb	w8, [x0, #0x1a9]
 4607c78: 340000a8     	cbz	w8, 0x4607c8c <_ChromeMain+0x46029f0>
 4607c7c: 3906a6ff     	strb	wzr, [x23, #0x1a9]
 4607c80: 9103e2e0     	add	x0, x23, #0xf8
 4607c84: 9106a6e1     	add	x1, x23, #0x1a9
 4607c88: 972480d2     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4607c8c: aa1703e0     	mov	x0, x23
 4607c90: 97ffff0c     	bl	0x46078c0 <_ChromeMain+0x4602624>
 4607c94: 3945a6e8     	ldrb	w8, [x23, #0x169]
 4607c98: 35001f88     	cbnz	w8, 0x4608088 <_ChromeMain+0x4602dec>
 4607c9c: f940ce82     	ldr	x2, [x20, #0x198]
 4607ca0: aa1403e0     	mov	x0, x20
 4607ca4: aa1703e1     	mov	x1, x23
 4607ca8: 9705c5d5     	bl	0x7793fc <_ChromeMain+0x774160>
 4607cac: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4607cb0: f9404729     	ldr	x9, [x25, #0x88]
 4607cb4: eb09011f     	cmp	x8, x9
 4607cb8: 54000061     	b.ne	0x4607cc4 <_ChromeMain+0x4602a28>
 4607cbc: aa1703e0     	mov	x0, x23
 4607cc0: 96e8318f     	bl	0x142fc <_ChromeMain+0xf060>
 4607cc4: f9424660     	ldr	x0, [x19, #0x488]
 4607cc8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4607ccc: f9404729     	ldr	x9, [x25, #0x88]
 4607cd0: eb09011f     	cmp	x8, x9
 4607cd4: 54000041     	b.ne	0x4607cdc <_ChromeMain+0x4602a40>
 4607cd8: 96e86b59     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4607cdc: f9024677     	str	x23, [x19, #0x488]
 4607ce0: f8bfc300     	ldapr	x0, [x24]
 4607ce4: b4001ce0     	cbz	x0, 0x4608080 <_ChromeMain+0x4602de4>
 4607ce8: 52806901     	mov	w1, #0x348              ; =840
 4607cec: d2800002     	mov	x2, #0x0                ; =0
 4607cf0: 96ea8e30     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4607cf4: aa0003f6     	mov	x22, x0
 4607cf8: 978e108a     	bl	0x298bf20 <_ChromeMain+0x2986c84>
 4607cfc: f9423e60     	ldr	x0, [x19, #0x478]
 4607d00: f9023e76     	str	x22, [x19, #0x478]
 4607d04: b4000080     	cbz	x0, 0x4607d14 <_ChromeMain+0x4602a78>
 4607d08: f9400008     	ldr	x8, [x0]
 4607d0c: f9400508     	ldr	x8, [x8, #0x8]
 4607d10: d63f0100     	blr	x8
 4607d14: f9010bff     	str	xzr, [sp, #0x210]
 4607d18: 6f00e400     	movi.2d	v0, #0000000000000000
 4607d1c: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4607d20: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 4607d24: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4607d28: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 4607d2c: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 4607d30: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 4607d34: ad0983e0     	stp	q0, q0, [sp, #0x130]
 4607d38: ad0883e0     	stp	q0, q0, [sp, #0x110]
 4607d3c: 910443e0     	add	x0, sp, #0x110
 4607d40: 52800001     	mov	w1, #0x0                ; =0
 4607d44: 528000e2     	mov	w2, #0x7                ; =7
 4607d48: 9793b6de     	bl	0x2af58c0 <_ChromeMain+0x2af0624>
 4607d4c: 390503ff     	strb	wzr, [sp, #0x140]
 4607d50: 52800048     	mov	w8, #0x2                ; =2
 4607d54: b9013fe8     	str	w8, [sp, #0x13c]
 4607d58: 52800028     	mov	w8, #0x1                ; =1
 4607d5c: 0f000440     	movi.2s	v0, #0x2
 4607d60: 910117e9     	add	x9, sp, #0x45
 4607d64: fc0ff120     	stur	d0, [x9, #0xff]
 4607d68: 390533e8     	strb	w8, [sp, #0x14c]
 4607d6c: 52800069     	mov	w9, #0x3                ; =3
 4607d70: b9015fe8     	str	w8, [sp, #0x15c]
 4607d74: b90153e9     	str	w9, [sp, #0x150]
 4607d78: f94072a8     	ldr	x8, [x21, #0xe0]
 4607d7c: b4001348     	cbz	x8, 0x4607fe4 <_ChromeMain+0x4602d48>
 4607d80: 19404108     	ldapurb	w8, [x8, #0x4]
 4607d84: 35001308     	cbnz	w8, 0x4607fe4 <_ChromeMain+0x4602d48>
 4607d88: f94076a8     	ldr	x8, [x21, #0xe8]
 4607d8c: b40012c8     	cbz	x8, 0x4607fe4 <_ChromeMain+0x4602d48>
 4607d90: f94072a8     	ldr	x8, [x21, #0xe0]
 4607d94: b40015c8     	cbz	x8, 0x460804c <_ChromeMain+0x4602db0>
 4607d98: 19404108     	ldapurb	w8, [x8, #0x4]
 4607d9c: 35001588     	cbnz	w8, 0x460804c <_ChromeMain+0x4602db0>
 4607da0: f94076a0     	ldr	x0, [x21, #0xe8]
 4607da4: 910423e8     	add	x8, sp, #0x108
 4607da8: 9742be2e     	bl	0x16b7660 <_ChromeMain+0x16b23c4>
 4607dac: f94087e0     	ldr	x0, [sp, #0x108]
 4607db0: 950190d7     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4607db4: aa0003f6     	mov	x22, x0
 4607db8: f940c7e0     	ldr	x0, [sp, #0x188]
 4607dbc: aa1603e1     	mov	x1, x22
 4607dc0: 950190d0     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4607dc4: aa1603e0     	mov	x0, x22
 4607dc8: 94e7ee65     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4607dcc: f94087f6     	ldr	x22, [sp, #0x108]
 4607dd0: f90087ff     	str	xzr, [sp, #0x108]
 4607dd4: b40000d6     	cbz	x22, 0x4607dec <_ChromeMain+0x4602b50>
 4607dd8: aa1603e0     	mov	x0, x22
 4607ddc: 950190cf     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4607de0: aa1603e0     	mov	x0, x22
 4607de4: 52800101     	mov	w1, #0x8                ; =8
 4607de8: 96e80434     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607dec: f94072a8     	ldr	x8, [x21, #0xe0]
 4607df0: b4001048     	cbz	x8, 0x4607ff8 <_ChromeMain+0x4602d5c>
 4607df4: 19404108     	ldapurb	w8, [x8, #0x4]
 4607df8: 35001008     	cbnz	w8, 0x4607ff8 <_ChromeMain+0x4602d5c>
 4607dfc: f94076a8     	ldr	x8, [x21, #0xe8]
 4607e00: b4000fc8     	cbz	x8, 0x4607ff8 <_ChromeMain+0x4602d5c>
 4607e04: f94072a8     	ldr	x8, [x21, #0xe0]
 4607e08: b4001288     	cbz	x8, 0x4608058 <_ChromeMain+0x4602dbc>
 4607e0c: 19404108     	ldapurb	w8, [x8, #0x4]
 4607e10: 35001248     	cbnz	w8, 0x4608058 <_ChromeMain+0x4602dbc>
 4607e14: f94076a8     	ldr	x8, [x21, #0xe8]
 4607e18: f9402508     	ldr	x8, [x8, #0x48]
 4607e1c: b4001448     	cbz	x8, 0x46080a4 <_ChromeMain+0x4602e08>
 4607e20: f940a516     	ldr	x22, [x8, #0x148]
 4607e24: aa1603e0     	mov	x0, x22
 4607e28: 94e7ee50     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4607e2c: 94e7ee4f     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4607e30: 94e7ee4e     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4607e34: 52800100     	mov	w0, #0x8                ; =8
 4607e38: 96e81d4c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4607e3c: aa0003f5     	mov	x21, x0
 4607e40: f900001f     	str	xzr, [x0]
 4607e44: aa1603e1     	mov	x1, x22
 4607e48: 950190ae     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4607e4c: aa1603e0     	mov	x0, x22
 4607e50: 94e7ee43     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4607e54: aa1603e0     	mov	x0, x22
 4607e58: 94e7ee41     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4607e5c: aa1603e0     	mov	x0, x22
 4607e60: 94e7ee3f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4607e64: aa1503e0     	mov	x0, x21
 4607e68: 950190a9     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4607e6c: aa0003f7     	mov	x23, x0
 4607e70: f940ebe0     	ldr	x0, [sp, #0x1d0]
 4607e74: aa1703e1     	mov	x1, x23
 4607e78: 950190a2     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4607e7c: aa1703e0     	mov	x0, x23
 4607e80: 94e7ee37     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4607e84: f900eff6     	str	x22, [sp, #0x1d8]
 4607e88: b40000d5     	cbz	x21, 0x4607ea0 <_ChromeMain+0x4602c04>
 4607e8c: aa1503e0     	mov	x0, x21
 4607e90: 950190a2     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4607e94: aa1503e0     	mov	x0, x21
 4607e98: 52800101     	mov	w1, #0x8                ; =8
 4607e9c: 96e80407     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4607ea0: 9004c9a8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4607ea4: 3dc08d00     	ldr	q0, [x8, #0x230]
 4607ea8: 3d8067e0     	str	q0, [sp, #0x190]
 4607eac: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 4607eb0: 37f80928     	tbnz	w8, #0x1f, 0x4607fd4 <_ChromeMain+0x4602d38>
 4607eb4: 910443e8     	add	x8, sp, #0x110
 4607eb8: 91004108     	add	x8, x8, #0x10
 4607ebc: 52800289     	mov	w9, #0x14               ; =20
 4607ec0: 3904dfe9     	strb	w9, [sp, #0x137]
 4607ec4: 528ded09     	mov	w9, #0x6f68             ; =28520
 4607ec8: 72ae8e69     	movk	w9, #0x7473, lsl #16
 4607ecc: b9001109     	str	w9, [x8, #0x10]
 4607ed0: 9004c629     	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4607ed4: 91175129     	add	x9, x9, #0x5d4
 4607ed8: 3dc00120     	ldr	q0, [x9]
 4607edc: 3d800100     	str	q0, [x8]
 4607ee0: 3900511f     	strb	wzr, [x8, #0x14]
 4607ee4: f9423e75     	ldr	x21, [x19, #0x478]
 4607ee8: 910003e0     	mov	x0, sp
 4607eec: 910443e1     	add	x1, sp, #0x110
 4607ef0: 9793b6f0     	bl	0x2af5ab0 <_ChromeMain+0x2af0814>
 4607ef4: 910003e1     	mov	x1, sp
 4607ef8: aa1503e0     	mov	x0, x21
 4607efc: 9793b851     	bl	0x2af6040 <_ChromeMain+0x2af0da4>
 4607f00: 910003e0     	mov	x0, sp
 4607f04: 9742bd37     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 4607f08: f9423e68     	ldr	x8, [x19, #0x478]
 4607f0c: f9407109     	ldr	x9, [x8, #0xe0]
 4607f10: b40002e9     	cbz	x9, 0x4607f6c <_ChromeMain+0x4602cd0>
 4607f14: 19404129     	ldapurb	w9, [x9, #0x4]
 4607f18: 350002a9     	cbnz	w9, 0x4607f6c <_ChromeMain+0x4602cd0>
 4607f1c: f9407509     	ldr	x9, [x8, #0xe8]
 4607f20: b4000269     	cbz	x9, 0x4607f6c <_ChromeMain+0x4602cd0>
 4607f24: f9407109     	ldr	x9, [x8, #0xe0]
 4607f28: b40009e9     	cbz	x9, 0x4608064 <_ChromeMain+0x4602dc8>
 4607f2c: 19404129     	ldapurb	w9, [x9, #0x4]
 4607f30: 350009a9     	cbnz	w9, 0x4608064 <_ChromeMain+0x4602dc8>
 4607f34: f9407508     	ldr	x8, [x8, #0xe8]
 4607f38: f9402508     	ldr	x8, [x8, #0x48]
 4607f3c: b4000188     	cbz	x8, 0x4607f6c <_ChromeMain+0x4602cd0>
 4607f40: f9408509     	ldr	x9, [x8, #0x108]
 4607f44: 5280230a     	mov	w10, #0x118             ; =280
 4607f48: 5280280b     	mov	w11, #0x140             ; =320
 4607f4c: f100013f     	cmp	x9, #0x0
 4607f50: 9a8a0169     	csel	x9, x11, x10, eq
 4607f54: f8696900     	ldr	x0, [x8, x9]
 4607f58: b40000a0     	cbz	x0, 0x4607f6c <_ChromeMain+0x4602cd0>
 4607f5c: f9400008     	ldr	x8, [x0]
 4607f60: f9405108     	ldr	x8, [x8, #0xa0]
 4607f64: 52800001     	mov	w1, #0x0                ; =0
 4607f68: d63f0100     	blr	x8
 4607f6c: f9423e76     	ldr	x22, [x19, #0x478]
 4607f70: f940cac0     	ldr	x0, [x22, #0x190]
 4607f74: 977e8fa5     	bl	0x25abe08 <_ChromeMain+0x25a6b6c>
 4607f78: eb00029f     	cmp	x20, x0
 4607f7c: 540001a0     	b.eq	0x4607fb0 <_ChromeMain+0x4602d14>
 4607f80: f940cad5     	ldr	x21, [x22, #0x190]
 4607f84: aa1503e0     	mov	x0, x21
 4607f88: 52800021     	mov	w1, #0x1                ; =1
 4607f8c: 978f3f65     	bl	0x29d7d20 <_ChromeMain+0x29d2a84>
 4607f90: f940cea8     	ldr	x8, [x21, #0x198]
 4607f94: b5000808     	cbnz	x8, 0x4608094 <_ChromeMain+0x4602df8>
 4607f98: d2800002     	mov	x2, #0x0                ; =0
 4607f9c: aa1503e0     	mov	x0, x21
 4607fa0: aa1403e1     	mov	x1, x20
 4607fa4: 9705c516     	bl	0x7793fc <_ChromeMain+0x774160>
 4607fa8: f940cac0     	ldr	x0, [x22, #0x190]
 4607fac: 970a76a2     	bl	0x8a5a34 <_ChromeMain+0x8a0798>
 4607fb0: f9424668     	ldr	x8, [x19, #0x488]
 4607fb4: f9401113     	ldr	x19, [x8, #0x20]
 4607fb8: f940b260     	ldr	x0, [x19, #0x160]
 4607fbc: b40002a0     	cbz	x0, 0x4608010 <_ChromeMain+0x4602d74>
 4607fc0: 6f00e400     	movi.2d	v0, #0000000000000000
 4607fc4: 9753b2dd     	bl	0x1af4b38 <_ChromeMain+0x1aef89c>
 4607fc8: 910443e0     	add	x0, sp, #0x110
 4607fcc: 9742bd05     	bl	0x16b73e0 <_ChromeMain+0x16b2144>
 4607fd0: 17fffef1     	b	0x4607b94 <_ChromeMain+0x46028f8>
 4607fd4: 52800288     	mov	w8, #0x14               ; =20
 4607fd8: f90097e8     	str	x8, [sp, #0x128]
 4607fdc: f94093e8     	ldr	x8, [sp, #0x120]
 4607fe0: 17ffffb9     	b	0x4607ec4 <_ChromeMain+0x4602c28>
 4607fe4: 52800100     	mov	w0, #0x8                ; =8
 4607fe8: 96e81ce0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4607fec: f900001f     	str	xzr, [x0]
 4607ff0: f90087e0     	str	x0, [sp, #0x108]
 4607ff4: 17ffff6f     	b	0x4607db0 <_ChromeMain+0x4602b14>
 4607ff8: 52800100     	mov	w0, #0x8                ; =8
 4607ffc: 96e81cdb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4608000: aa0003f5     	mov	x21, x0
 4608004: d2800016     	mov	x22, #0x0               ; =0
 4608008: f900001f     	str	xzr, [x0]
 460800c: 17ffff96     	b	0x4607e64 <_ChromeMain+0x4602bc8>
 4608010: 52802400     	mov	w0, #0x120              ; =288
 4608014: 96e81cd5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4608018: aa0003f4     	mov	x20, x0
 460801c: d2800001     	mov	x1, #0x0                ; =0
 4608020: 9729c8ae     	bl	0x107a2d8 <_ChromeMain+0x107503c>
 4608024: b40000a0     	cbz	x0, 0x4608038 <_ChromeMain+0x4602d9c>
 4608028: b9400a88     	ldr	w8, [x20, #0x8]
 460802c: 31000508     	adds	w8, w8, #0x1
 4608030: b9000a88     	str	w8, [x20, #0x8]
 4608034: 54000502     	b.hs	0x46080d4 <_ChromeMain+0x4602e38>
 4608038: aa1303e0     	mov	x0, x19
 460803c: aa1403e1     	mov	x1, x20
 4608040: 9731d06f     	bl	0x127c1fc <_ChromeMain+0x1276f60>
 4608044: f940b260     	ldr	x0, [x19, #0x160]
 4608048: 17ffffde     	b	0x4607fc0 <_ChromeMain+0x4602d24>
 460804c: d4200000     	brk	#0
 4608050: d4400000     	hlt	#0
 4608054: d4200020     	brk	#0x1
 4608058: d4200000     	brk	#0
 460805c: d4400000     	hlt	#0
 4608060: d4200020     	brk	#0x1
 4608064: d4200000     	brk	#0
 4608068: d4400000     	hlt	#0
 460806c: d4200020     	brk	#0x1
 4608070: 97f32da2     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4608074: 17fffede     	b	0x4607bec <_ChromeMain+0x4602950>
 4608078: 97f32da0     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 460807c: 17fffef7     	b	0x4607c58 <_ChromeMain+0x46029bc>
 4608080: 97f32d9e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4608084: 17ffff19     	b	0x4607ce8 <_ChromeMain+0x4602a4c>
 4608088: d4200000     	brk	#0
 460808c: d4400000     	hlt	#0
 4608090: d4200020     	brk	#0x1
 4608094: aa1503e0     	mov	x0, x21
 4608098: 97612520     	bl	0x1e51518 <_ChromeMain+0x1e4c27c>
 460809c: f940cea2     	ldr	x2, [x21, #0x198]
 46080a0: 17ffffbf     	b	0x4607f9c <_ChromeMain+0x4602d00>
 46080a4: d2800000     	mov	x0, #0x0                ; =0
 46080a8: 94e7edb0     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 46080ac: d2800000     	mov	x0, #0x0                ; =0
 46080b0: 94e7edae     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 46080b4: 52800100     	mov	w0, #0x8                ; =8
 46080b8: 96e81cac     	bl	0xf368 <_ChromeMain+0xa0cc>
 46080bc: aa0003f5     	mov	x21, x0
 46080c0: f900001f     	str	xzr, [x0]
 46080c4: d2800001     	mov	x1, #0x0                ; =0
 46080c8: 9501900e     	bl	0x866c100 <_ChromeMain+0x8666e64>
 46080cc: d2800016     	mov	x22, #0x0               ; =0
 46080d0: 17ffff61     	b	0x4607e54 <_ChromeMain+0x4602bb8>
 46080d4: d4200000     	brk	#0
 46080d8: d4400000     	hlt	#0
 46080dc: d4200020     	brk	#0x1
