
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4632a8c: d10183ff     	sub	sp, sp, #0x60
 4632a90: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4632a94: a90357f6     	stp	x22, x21, [sp, #0x30]
 4632a98: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4632a9c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4632aa0: 910143fd     	add	x29, sp, #0x50
 4632aa4: aa0003f4     	mov	x20, x0
 4632aa8: 395d6008     	ldrb	w8, [x0, #0x758]
 4632aac: 35000b88     	cbnz	w8, 0x4632c1c <_ChromeMain+0x462d980>
 4632ab0: 52800038     	mov	w24, #0x1               ; =1
 4632ab4: 391d6298     	strb	w24, [x20, #0x758]
 4632ab8: b004c4c0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4632abc: 91375000     	add	x0, x0, #0xdd4
 4632ac0: b004c4c1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4632ac4: 912c7821     	add	x1, x1, #0xb1e
 4632ac8: 910003e8     	mov	x8, sp
 4632acc: 5286a242     	mov	w2, #0x3512             ; =13586
 4632ad0: 96e8786c     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4632ad4: 52800600     	mov	w0, #0x30               ; =48
 4632ad8: 96e77224     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632adc: aa0003f3     	mov	x19, x0
 4632ae0: 90fecc68     	adrp	x8, 0x1fbe000 <_ChromeMain+0x1fb8d64>
 4632ae4: 91332108     	add	x8, x8, #0xcc8
 4632ae8: b9000018     	str	w24, [x0]
 4632aec: d0ff90a9     	adrp	x9, 0x3848000 <_ChromeMain+0x3842d64>
 4632af0: 913f0129     	add	x9, x9, #0xfc0
 4632af4: f0fef957     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 4632af8: 912c02f7     	add	x23, x23, #0xb00
 4632afc: a900a408     	stp	x8, x9, [x0, #0x8]
 4632b00: 10101f08     	adr	x8, 0x4652ee0 <_ChromeMain+0x464dc44>
 4632b04: d503201f     	nop
 4632b08: a901a017     	stp	x23, x8, [x0, #0x18]
 4632b0c: f94a0695     	ldr	x21, [x20, #0x1408]
 4632b10: b40000b5     	cbz	x21, 0x4632b24 <_ChromeMain+0x462d888>
 4632b14: b83802a8     	ldadd	w24, w8, [x21]
 4632b18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4632b1c: 6b09011f     	cmp	w8, w9
 4632b20: 540008e0     	b.eq	0x4632c3c <_ChromeMain+0x462d9a0>
 4632b24: f94a0a96     	ldr	x22, [x20, #0x1410]
 4632b28: 52800800     	mov	w0, #0x40               ; =64
 4632b2c: 96e7720f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632b30: aa0003f4     	mov	x20, x0
 4632b34: 10252208     	adr	x8, 0x467cf74 <_ChromeMain+0x4677cd8>
 4632b38: d503201f     	nop
 4632b3c: 90ffcb69     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 4632b40: 91110129     	add	x9, x9, #0x440
 4632b44: b9000018     	str	w24, [x0]
 4632b48: 90ffd1ca     	adrp	x10, 0x406a000 <_ChromeMain+0x4064d64>
 4632b4c: 910a014a     	add	x10, x10, #0x280
 4632b50: 1010314b     	adr	x11, 0x4653178 <_ChromeMain+0x464dedc>
 4632b54: d503201f     	nop
 4632b58: a900a408     	stp	x8, x9, [x0, #0x8]
 4632b5c: a901ac0a     	stp	x10, x11, [x0, #0x18]
 4632b60: a902d41f     	stp	xzr, x21, [x0, #0x28]
 4632b64: f9001c16     	str	x22, [x0, #0x38]
 4632b68: 52800100     	mov	w0, #0x8                ; =8
 4632b6c: 96e771ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632b70: aa0003f5     	mov	x21, x0
 4632b74: f900001f     	str	xzr, [x0]
 4632b78: 52800700     	mov	w0, #0x38               ; =56
 4632b7c: 96e771fb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632b80: aa0003f6     	mov	x22, x0
 4632b84: b0ff26e8     	adrp	x8, 0x2b0f000 <_ChromeMain+0x2b09d64>
 4632b88: 91290108     	add	x8, x8, #0xa40
 4632b8c: b0ffcc49     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 4632b90: 91210129     	add	x9, x9, #0x840
 4632b94: b9000018     	str	w24, [x0]
 4632b98: a900a408     	stp	x8, x9, [x0, #0x8]
 4632b9c: 10283fa8     	adr	x8, 0x4683390 <_ChromeMain+0x467e0f4>
 4632ba0: d503201f     	nop
 4632ba4: a901a017     	stp	x23, x8, [x0, #0x18]
 4632ba8: f9001413     	str	x19, [x0, #0x28]
 4632bac: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4632bb0: 90052c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4632bb4: f9404529     	ldr	x9, [x9, #0x88]
 4632bb8: eb09011f     	cmp	x8, x9
 4632bbc: 54000061     	b.ne	0x4632bc8 <_ChromeMain+0x462d92c>
 4632bc0: aa1503e0     	mov	x0, x21
 4632bc4: 96e785ce     	bl	0x142fc <_ChromeMain+0xf060>
 4632bc8: f9001ad5     	str	x21, [x22, #0x30]
 4632bcc: 52800700     	mov	w0, #0x38               ; =56
 4632bd0: 96e771e6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4632bd4: aa0003e3     	mov	x3, x0
 4632bd8: 52800028     	mov	w8, #0x1                ; =1
 4632bdc: b9000008     	str	w8, [x0]
 4632be0: b0ff3a88     	adrp	x8, 0x2d83000 <_ChromeMain+0x2d7dd64>
 4632be4: 91000108     	add	x8, x8, #0x0
 4632be8: 10284a49     	adr	x9, 0x4683530 <_ChromeMain+0x467e294>
 4632bec: d503201f     	nop
 4632bf0: a900a408     	stp	x8, x9, [x0, #0x8]
 4632bf4: 10284468     	adr	x8, 0x4683480 <_ChromeMain+0x467e1e4>
 4632bf8: d503201f     	nop
 4632bfc: a901a017     	stp	x23, x8, [x0, #0x18]
 4632c00: a902d414     	stp	x20, x21, [x0, #0x28]
 4632c04: f0048581     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4632c08: 91041021     	add	x1, x1, #0x104
 4632c0c: 910003e0     	mov	x0, sp
 4632c10: aa1603e2     	mov	x2, x22
 4632c14: 9775e05c     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 4632c18: 14000003     	b	0x4632c24 <_ChromeMain+0x462d988>
 4632c1c: 52800028     	mov	w8, #0x1                ; =1
 4632c20: 391d6688     	strb	w8, [x20, #0x759]
 4632c24: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4632c28: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4632c2c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4632c30: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4632c34: 910183ff     	add	sp, sp, #0x60
 4632c38: d65f03c0     	ret
 4632c3c: d4200000     	brk	#0
 4632c40: d4400000     	hlt	#0
 4632c44: d4200020     	brk	#0x1
 4632c48: d10283ff     	sub	sp, sp, #0xa0
 4632c4c: a9046ffc     	stp	x28, x27, [sp, #0x40]
 4632c50: a90567fa     	stp	x26, x25, [sp, #0x50]
 4632c54: a9065ff8     	stp	x24, x23, [sp, #0x60]
 4632c58: a90757f6     	stp	x22, x21, [sp, #0x70]
 4632c5c: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4632c60: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4632c64: 910243fd     	add	x29, sp, #0x90
 4632c68: aa0003f3     	mov	x19, x0
 4632c6c: 900545a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4632c70: f9467d00     	ldr	x0, [x8, #0xcf8]
 4632c74: b40002a0     	cbz	x0, 0x4632cc8 <_ChromeMain+0x462da2c>
 4632c78: 974fb3c0     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4632c7c: f100001f     	cmp	x0, #0x0
 4632c80: 1a9f07f4     	cset	w20, ne
 4632c84: f9422e68     	ldr	x8, [x19, #0x458]
 4632c88: b4000148     	cbz	x8, 0x4632cb0 <_ChromeMain+0x462da14>
 4632c8c: f9429d08     	ldr	x8, [x8, #0x538]
 4632c90: b4000108     	cbz	x8, 0x4632cb0 <_ChromeMain+0x462da14>
 4632c94: f9403500     	ldr	x0, [x8, #0x68]
 4632c98: f9400008     	ldr	x8, [x0]
 4632c9c: f940a508     	ldr	x8, [x8, #0x148]
 4632ca0: d63f0100     	blr	x8
 4632ca4: f100001f     	cmp	x0, #0x0
 4632ca8: 1a9403e8     	csel	w8, wzr, w20, eq
 4632cac: 37000128     	tbnz	w8, #0x0, 0x4632cd0 <_ChromeMain+0x462da34>
 4632cb0: aa1303e0     	mov	x0, x19
 4632cb4: d2800001     	mov	x1, #0x0                ; =0
 4632cb8: 94008195     	bl	0x465330c <_ChromeMain+0x464e070>
 4632cbc: f942fa76     	ldr	x22, [x19, #0x5f0]
 4632cc0: 9117e275     	add	x21, x19, #0x5f8
 4632cc4: 140000d3     	b	0x4633010 <_ChromeMain+0x462dd74>
 4632cc8: 52800014     	mov	w20, #0x0               ; =0
 4632ccc: 17ffffee     	b	0x4632c84 <_ChromeMain+0x462d9e8>
 4632cd0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4632cd4: f9001bff     	str	xzr, [sp, #0x30]
 4632cd8: f9400008     	ldr	x8, [x0]
 4632cdc: f9401909     	ldr	x9, [x8, #0x30]
 4632ce0: 910083e8     	add	x8, sp, #0x20
 4632ce4: d63f0120     	blr	x9
 4632ce8: aa1303e0     	mov	x0, x19
 4632cec: 94007afb     	bl	0x46518d8 <_ChromeMain+0x464c63c>
 4632cf0: aa0003f4     	mov	x20, x0
 4632cf4: a9402001     	ldp	x1, x8, [x0]
 4632cf8: 52800309     	mov	w9, #0x18               ; =24
 4632cfc: 9b090502     	madd	x2, x8, x9, x1
 4632d00: 910023e8     	add	x8, sp, #0x8
 4632d04: 91002108     	add	x8, x8, #0x8
 4632d08: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4632d0c: a90023e8     	stp	x8, x8, [sp]
 4632d10: 910023e0     	add	x0, sp, #0x8
 4632d14: 94a9d8c4     	bl	0x70a9024 <_ChromeMain+0x70a3d88>
 4632d18: f9400688     	ldr	x8, [x20, #0x8]
 4632d1c: 8b080508     	add	x8, x8, x8, lsl #1
 4632d20: d37df116     	lsl	x22, x8, #3
 4632d24: b4000316     	cbz	x22, 0x4632d84 <_ChromeMain+0x462dae8>
 4632d28: f9400294     	ldr	x20, [x20]
 4632d2c: 14000011     	b	0x4632d70 <_ChromeMain+0x462dad4>
 4632d30: aa1303e0     	mov	x0, x19
 4632d34: aa1403e1     	mov	x1, x20
 4632d38: 940081fd     	bl	0x465352c <_ChromeMain+0x464e290>
 4632d3c: aa0003f5     	mov	x21, x0
 4632d40: aa1303e0     	mov	x0, x19
 4632d44: aa1503e1     	mov	x1, x21
 4632d48: aa1403e2     	mov	x2, x20
 4632d4c: 9400867d     	bl	0x4654740 <_ChromeMain+0x464f4a4>
 4632d50: f94002a8     	ldr	x8, [x21]
 4632d54: f9405108     	ldr	x8, [x8, #0xa0]
 4632d58: aa1503e0     	mov	x0, x21
 4632d5c: 52800001     	mov	w1, #0x0                ; =0
 4632d60: d63f0100     	blr	x8
 4632d64: 91006294     	add	x20, x20, #0x18
 4632d68: f10062d6     	subs	x22, x22, #0x18
 4632d6c: 540000c0     	b.eq	0x4632d84 <_ChromeMain+0x462dae8>
 4632d70: 910083e1     	add	x1, sp, #0x20
 4632d74: aa1403e0     	mov	x0, x20
 4632d78: 972a64e3     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4632d7c: 3707ff40     	tbnz	w0, #0x0, 0x4632d64 <_ChromeMain+0x462dac8>
 4632d80: 17ffffec     	b	0x4632d30 <_ChromeMain+0x462da94>
 4632d84: f942fa74     	ldr	x20, [x19, #0x5f0]
 4632d88: 9117e278     	add	x24, x19, #0x5f8
 4632d8c: eb18029f     	cmp	x20, x24
 4632d90: 54000f60     	b.eq	0x4632f7c <_ChromeMain+0x462dce0>
 4632d94: 90052c19     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4632d98: 1400003f     	b	0x4632e94 <_ChromeMain+0x462dbf8>
 4632d9c: aa1503e8     	mov	x8, x21
 4632da0: f9400ab5     	ldr	x21, [x21, #0x10]
 4632da4: f94002a9     	ldr	x9, [x21]
 4632da8: eb09011f     	cmp	x8, x9
 4632dac: 54ffff81     	b.ne	0x4632d9c <_ChromeMain+0x462db00>
 4632db0: 1400001f     	b	0x4632e2c <_ChromeMain+0x462db90>
 4632db4: f942f668     	ldr	x8, [x19, #0x5e8]
 4632db8: eb15011f     	cmp	x8, x21
 4632dbc: 54000121     	b.ne	0x4632de0 <_ChromeMain+0x462db44>
 4632dc0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4632dc4: f9404729     	ldr	x9, [x25, #0x88]
 4632dc8: eb09011f     	cmp	x8, x9
 4632dcc: 54000061     	b.ne	0x4632dd8 <_ChromeMain+0x462db3c>
 4632dd0: aa1503e0     	mov	x0, x21
 4632dd4: 96e7bf1a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4632dd8: f902f67f     	str	xzr, [x19, #0x5e8]
 4632ddc: b90a227f     	str	wzr, [x19, #0xa20]
 4632de0: 3945a6a8     	ldrb	w8, [x21, #0x169]
 4632de4: 35001468     	cbnz	w8, 0x4633070 <_ChromeMain+0x462ddd4>
 4632de8: aa1303e0     	mov	x0, x19
 4632dec: aa1503e1     	mov	x1, x21
 4632df0: 52800022     	mov	w2, #0x1                ; =1
 4632df4: 52800003     	mov	w3, #0x0                ; =0
 4632df8: d2800004     	mov	x4, #0x0                ; =0
 4632dfc: 97607a0b     	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 4632e00: b40000b5     	cbz	x21, 0x4632e14 <_ChromeMain+0x462db78>
 4632e04: f94002a8     	ldr	x8, [x21]
 4632e08: f9402908     	ldr	x8, [x8, #0x50]
 4632e0c: aa1503e0     	mov	x0, x21
 4632e10: d63f0100     	blr	x8
 4632e14: f9400688     	ldr	x8, [x20, #0x8]
 4632e18: aa1403f5     	mov	x21, x20
 4632e1c: b4fffc08     	cbz	x8, 0x4632d9c <_ChromeMain+0x462db00>
 4632e20: aa0803f5     	mov	x21, x8
 4632e24: f9400108     	ldr	x8, [x8]
 4632e28: b5ffffc8     	cbnz	x8, 0x4632e20 <_ChromeMain+0x462db84>
 4632e2c: f942fa68     	ldr	x8, [x19, #0x5f0]
 4632e30: eb14011f     	cmp	x8, x20
 4632e34: 54000041     	b.ne	0x4632e3c <_ChromeMain+0x462dba0>
 4632e38: f902fa75     	str	x21, [x19, #0x5f0]
 4632e3c: f9430268     	ldr	x8, [x19, #0x600]
 4632e40: d1000508     	sub	x8, x8, #0x1
 4632e44: f9030268     	str	x8, [x19, #0x600]
 4632e48: f942fe60     	ldr	x0, [x19, #0x5f8]
 4632e4c: aa1403e1     	mov	x1, x20
 4632e50: 96eb511f     	bl	0x1072cc <_ChromeMain+0x102030>
 4632e54: b400113a     	cbz	x26, 0x4633078 <_ChromeMain+0x462dddc>
 4632e58: f9401e80     	ldr	x0, [x20, #0x38]
 4632e5c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4632e60: f9404729     	ldr	x9, [x25, #0x88]
 4632e64: eb09011f     	cmp	x8, x9
 4632e68: 54000041     	b.ne	0x4632e70 <_ChromeMain+0x462dbd4>
 4632e6c: 96e7bef4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4632e70: f9001e9f     	str	xzr, [x20, #0x38]
 4632e74: 39c0de88     	ldrsb	w8, [x20, #0x37]
 4632e78: 37f802c8     	tbnz	w8, #0x1f, 0x4632ed0 <_ChromeMain+0x462dc34>
 4632e7c: aa1403e0     	mov	x0, x20
 4632e80: 52800801     	mov	w1, #0x40               ; =64
 4632e84: 96e7580d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632e88: aa1503f4     	mov	x20, x21
 4632e8c: eb1802bf     	cmp	x21, x24
 4632e90: 54000760     	b.eq	0x4632f7c <_ChromeMain+0x462dce0>
 4632e94: 9100829a     	add	x26, x20, #0x20
 4632e98: f9401e95     	ldr	x21, [x20, #0x38]
 4632e9c: 91008280     	add	x0, x20, #0x20
 4632ea0: 910083e1     	add	x1, sp, #0x20
 4632ea4: 972a6498     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4632ea8: 3707f860     	tbnz	w0, #0x0, 0x4632db4 <_ChromeMain+0x462db18>
 4632eac: f9400bfb     	ldr	x27, [sp, #0x10]
 4632eb0: b4fff83b     	cbz	x27, 0x4632db4 <_ChromeMain+0x462db18>
 4632eb4: 3980de88     	ldrsb	x8, [x20, #0x37]
 4632eb8: a9422a89     	ldp	x9, x10, [x20, #0x20]
 4632ebc: f100011f     	cmp	x8, #0x0
 4632ec0: 9a9a4136     	csel	x22, x9, x26, mi
 4632ec4: 7100011f     	cmp	w8, #0x0
 4632ec8: 9a88415c     	csel	x28, x10, x8, mi
 4632ecc: 14000009     	b	0x4632ef0 <_ChromeMain+0x462dc54>
 4632ed0: f9401280     	ldr	x0, [x20, #0x20]
 4632ed4: f9401a88     	ldr	x8, [x20, #0x30]
 4632ed8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4632edc: 96e757f7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4632ee0: 17ffffe7     	b	0x4632e7c <_ChromeMain+0x462dbe0>
 4632ee4: 54000223     	b.lo	0x4632f28 <_ChromeMain+0x462dc8c>
 4632ee8: f940077b     	ldr	x27, [x27, #0x8]
 4632eec: b4fff65b     	cbz	x27, 0x4632db4 <_ChromeMain+0x462db18>
 4632ef0: aa1b03e8     	mov	x8, x27
 4632ef4: f8420d09     	ldr	x9, [x8, #0x20]!
 4632ef8: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4632efc: f100015f     	cmp	x10, #0x0
 4632f00: 9a884121     	csel	x1, x9, x8, mi
 4632f04: f9400508     	ldr	x8, [x8, #0x8]
 4632f08: 7100015f     	cmp	w10, #0x0
 4632f0c: 9a8a4117     	csel	x23, x8, x10, mi
 4632f10: eb1c02ff     	cmp	x23, x28
 4632f14: 9a9c32e2     	csel	x2, x23, x28, lo
 4632f18: aa1603e0     	mov	x0, x22
 4632f1c: 94e75a51     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4632f20: 340000a0     	cbz	w0, 0x4632f34 <_ChromeMain+0x462dc98>
 4632f24: 36fffe20     	tbz	w0, #0x1f, 0x4632ee8 <_ChromeMain+0x462dc4c>
 4632f28: f940037b     	ldr	x27, [x27]
 4632f2c: b5fffe3b     	cbnz	x27, 0x4632ef0 <_ChromeMain+0x462dc54>
 4632f30: 17ffffa1     	b	0x4632db4 <_ChromeMain+0x462db18>
 4632f34: eb17039f     	cmp	x28, x23
 4632f38: 54fffd61     	b.ne	0x4632ee4 <_ChromeMain+0x462dc48>
 4632f3c: f94003e8     	ldr	x8, [sp]
 4632f40: eb08037f     	cmp	x27, x8
 4632f44: 54fff380     	b.eq	0x4632db4 <_ChromeMain+0x462db18>
 4632f48: f9400688     	ldr	x8, [x20, #0x8]
 4632f4c: aa1403f5     	mov	x21, x20
 4632f50: b40000a8     	cbz	x8, 0x4632f64 <_ChromeMain+0x462dcc8>
 4632f54: aa0803f5     	mov	x21, x8
 4632f58: f9400108     	ldr	x8, [x8]
 4632f5c: b5ffffc8     	cbnz	x8, 0x4632f54 <_ChromeMain+0x462dcb8>
 4632f60: 17ffffca     	b	0x4632e88 <_ChromeMain+0x462dbec>
 4632f64: aa1503e8     	mov	x8, x21
 4632f68: f9400ab5     	ldr	x21, [x21, #0x10]
 4632f6c: f94002a9     	ldr	x9, [x21]
 4632f70: eb09011f     	cmp	x8, x9
 4632f74: 54ffff81     	b.ne	0x4632f64 <_ChromeMain+0x462dcc8>
 4632f78: 17ffffc4     	b	0x4632e88 <_ChromeMain+0x462dbec>
 4632f7c: f9400be1     	ldr	x1, [sp, #0x10]
 4632f80: 910023e8     	add	x8, sp, #0x8
 4632f84: f9001fe8     	str	x8, [sp, #0x38]
 4632f88: 9100e3e0     	add	x0, sp, #0x38
 4632f8c: 9746a5b8     	bl	0x17dc66c <_ChromeMain+0x17d73d0>
 4632f90: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4632f94: 36f80288     	tbz	w8, #0x1f, 0x4632fe4 <_ChromeMain+0x462dd48>
 4632f98: f94013e0     	ldr	x0, [sp, #0x20]
 4632f9c: f9401be8     	ldr	x8, [sp, #0x30]
