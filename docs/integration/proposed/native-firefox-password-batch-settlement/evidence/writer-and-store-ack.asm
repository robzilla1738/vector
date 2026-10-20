
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4106a0c: d10243ff     	sub	sp, sp, #0x90
 4106a10: a90467fa     	stp	x26, x25, [sp, #0x40]
 4106a14: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4106a18: a90657f6     	stp	x22, x21, [sp, #0x60]
 4106a1c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4106a20: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4106a24: 910203fd     	add	x29, sp, #0x80
 4106a28: aa0203f3     	mov	x19, x2
 4106a2c: f9400428     	ldr	x8, [x1, #0x8]
 4106a30: b4000568     	cbz	x8, 0x4106adc <_ChromeMain+0x4101840>
 4106a34: aa0103f4     	mov	x20, x1
 4106a38: aa0003f5     	mov	x21, x0
 4106a3c: f9400800     	ldr	x0, [x0, #0x10]
 4106a40: f9400008     	ldr	x8, [x0]
 4106a44: f940b508     	ldr	x8, [x8, #0x168]
 4106a48: d63f0100     	blr	x8
 4106a4c: aa0003f6     	mov	x22, x0
 4106a50: f0046ea1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 4106a54: 91219021     	add	x1, x1, #0x864
 4106a58: 52800342     	mov	w2, #0x1a               ; =26
 4106a5c: 9707fea9     	bl	0x306500 <_ChromeMain+0x301264>
 4106a60: 37000880     	tbnz	w0, #0x0, 0x4106b70 <_ChromeMain+0x41018d4>
 4106a64: f0046ea1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 4106a68: 91219021     	add	x1, x1, #0x864
 4106a6c: aa1603e0     	mov	x0, x22
 4106a70: 52800342     	mov	w2, #0x1a               ; =26
 4106a74: 970ed876     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 4106a78: b40007c0     	cbz	x0, 0x4106b70 <_ChromeMain+0x41018d4>
 4106a7c: aa0003e8     	mov	x8, x0
 4106a80: f9401009     	ldr	x9, [x0, #0x20]
 4106a84: b40014e9     	cbz	x9, 0x4106d20 <_ChromeMain+0x4101a84>
 4106a88: f9400929     	ldr	x9, [x9, #0x10]
 4106a8c: f9001fff     	str	xzr, [sp, #0x38]
 4106a90: f9401520     	ldr	x0, [x9, #0x28]
 4106a94: b40006e0     	cbz	x0, 0x4106b70 <_ChromeMain+0x41018d4>
 4106a98: 39805d09     	ldrsb	x9, [x8, #0x17]
 4106a9c: a9402d0a     	ldp	x10, x11, [x8]
 4106aa0: f100013f     	cmp	x9, #0x0
 4106aa4: 9a884156     	csel	x22, x10, x8, mi
 4106aa8: 7100013f     	cmp	w9, #0x0
 4106aac: 9a894177     	csel	x23, x11, x9, mi
 4106ab0: f9400008     	ldr	x8, [x0]
 4106ab4: f9401108     	ldr	x8, [x8, #0x20]
 4106ab8: d0fdfce9     	adrp	x9, 0xa4000 <_ChromeMain+0x9ed64>
 4106abc: 91177129     	add	x9, x9, #0x5dc
 4106ac0: eb09011f     	cmp	x8, x9
 4106ac4: 54000901     	b.ne	0x4106be4 <_ChromeMain+0x4101948>
 4106ac8: f9402418     	ldr	x24, [x0, #0x48]
 4106acc: b4000538     	cbz	x24, 0x4106b70 <_ChromeMain+0x41018d4>
 4106ad0: f8410f19     	ldr	x25, [x24, #0x10]!
 4106ad4: b40004f9     	cbz	x25, 0x4106b70 <_ChromeMain+0x41018d4>
 4106ad8: 14000016     	b	0x4106b30 <_ChromeMain+0x4101894>
 4106adc: b40011d3     	cbz	x19, 0x4106d14 <_ChromeMain+0x4101a78>
 4106ae0: f9400668     	ldr	x8, [x19, #0x8]
 4106ae4: aa1303e0     	mov	x0, x19
 4106ae8: 52800021     	mov	w1, #0x1                ; =1
 4106aec: d63f0100     	blr	x8
 4106af0: 12800008     	mov	w8, #-0x1               ; =-1
 4106af4: b8e80268     	ldaddal	w8, w8, [x19]
 4106af8: 7100051f     	cmp	w8, #0x1
 4106afc: 540005a1     	b.ne	0x4106bb0 <_ChromeMain+0x4101914>
 4106b00: f9400a61     	ldr	x1, [x19, #0x10]
 4106b04: aa1303e0     	mov	x0, x19
 4106b08: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4106b0c: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4106b10: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4106b14: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4106b18: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4106b1c: 910243ff     	add	sp, sp, #0x90
 4106b20: d61f0020     	br	x1
 4106b24: 54000223     	b.lo	0x4106b68 <_ChromeMain+0x41018cc>
 4106b28: f9400739     	ldr	x25, [x25, #0x8]
 4106b2c: b4000239     	cbz	x25, 0x4106b70 <_ChromeMain+0x41018d4>
 4106b30: aa1903e8     	mov	x8, x25
 4106b34: f8420d09     	ldr	x9, [x8, #0x20]!
 4106b38: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4106b3c: f100015f     	cmp	x10, #0x0
 4106b40: 9a884121     	csel	x1, x9, x8, mi
 4106b44: f9400508     	ldr	x8, [x8, #0x8]
 4106b48: 7100015f     	cmp	w10, #0x0
 4106b4c: 9a8a411a     	csel	x26, x8, x10, mi
 4106b50: eb17035f     	cmp	x26, x23
 4106b54: 9a973342     	csel	x2, x26, x23, lo
 4106b58: aa1603e0     	mov	x0, x22
 4106b5c: 94fc0b41     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4106b60: 34000360     	cbz	w0, 0x4106bcc <_ChromeMain+0x4101930>
 4106b64: 36fffe20     	tbz	w0, #0x1f, 0x4106b28 <_ChromeMain+0x410188c>
 4106b68: f9400339     	ldr	x25, [x25]
 4106b6c: b5fffe39     	cbnz	x25, 0x4106b30 <_ChromeMain+0x4101894>
 4106b70: f9400aa0     	ldr	x0, [x21, #0x10]
 4106b74: 52800001     	mov	w1, #0x0                ; =0
 4106b78: 97b9e7e9     	bl	0x2f80b1c <_ChromeMain+0x2f7b880>
 4106b7c: b5000400     	cbnz	x0, 0x4106bfc <_ChromeMain+0x4101960>
 4106b80: b4000c53     	cbz	x19, 0x4106d08 <_ChromeMain+0x4101a6c>
 4106b84: f9400668     	ldr	x8, [x19, #0x8]
 4106b88: aa1303e0     	mov	x0, x19
 4106b8c: 52800001     	mov	w1, #0x0                ; =0
 4106b90: d63f0100     	blr	x8
 4106b94: 12800008     	mov	w8, #-0x1               ; =-1
 4106b98: b8e80268     	ldaddal	w8, w8, [x19]
 4106b9c: 7100051f     	cmp	w8, #0x1
 4106ba0: 54000081     	b.ne	0x4106bb0 <_ChromeMain+0x4101914>
 4106ba4: f9400a68     	ldr	x8, [x19, #0x10]
 4106ba8: aa1303e0     	mov	x0, x19
 4106bac: d63f0100     	blr	x8
 4106bb0: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4106bb4: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4106bb8: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4106bbc: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4106bc0: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4106bc4: 910243ff     	add	sp, sp, #0x90
 4106bc8: d65f03c0     	ret
 4106bcc: eb1a02ff     	cmp	x23, x26
 4106bd0: 54fffaa1     	b.ne	0x4106b24 <_ChromeMain+0x4101888>
 4106bd4: eb18033f     	cmp	x25, x24
 4106bd8: 54fffcc0     	b.eq	0x4106b70 <_ChromeMain+0x41018d4>
 4106bdc: b5fffd53     	cbnz	x19, 0x4106b84 <_ChromeMain+0x41018e8>
 4106be0: 14000053     	b	0x4106d2c <_ChromeMain+0x4101a90>
 4106be4: 9100e3e3     	add	x3, sp, #0x38
 4106be8: aa1603e1     	mov	x1, x22
 4106bec: aa1703e2     	mov	x2, x23
 4106bf0: d63f0100     	blr	x8
 4106bf4: 3707ff40     	tbnz	w0, #0x0, 0x4106bdc <_ChromeMain+0x4101940>
 4106bf8: 17ffffde     	b	0x4106b70 <_ChromeMain+0x41018d4>
 4106bfc: aa0003f5     	mov	x21, x0
 4106c00: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 4106c04: f9000fff     	str	xzr, [sp, #0x18]
 4106c08: f9400698     	ldr	x24, [x20, #0x8]
 4106c0c: b50003b8     	cbnz	x24, 0x4106c80 <_ChromeMain+0x41019e4>
 4106c10: d2800016     	mov	x22, #0x0               ; =0
 4106c14: d2800014     	mov	x20, #0x0               ; =0
 4106c18: 910083e8     	add	x8, sp, #0x20
 4106c1c: 910023e0     	add	x0, sp, #0x8
 4106c20: 94b1966f     	bl	0x6d6c5dc <_ChromeMain+0x6d67340>
 4106c24: 52800700     	mov	w0, #0x38               ; =56
 4106c28: 96fc21d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4106c2c: aa0003e2     	mov	x2, x0
 4106c30: 52800028     	mov	w8, #0x1                ; =1
 4106c34: b9000008     	str	w8, [x0]
 4106c38: d0ff0288     	adrp	x8, 0x2158000 <_ChromeMain+0x2152d64>
 4106c3c: 91060108     	add	x8, x8, #0x180
 4106c40: 10007729     	adr	x9, 0x4107b24 <_ChromeMain+0x4102888>
 4106c44: d503201f     	nop
 4106c48: a900a408     	stp	x8, x9, [x0, #0x8]
 4106c4c: f0ff22a8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4106c50: 912c0108     	add	x8, x8, #0xb00
 4106c54: 10000ca9     	adr	x9, 0x4106de8 <_ChromeMain+0x4101b4c>
 4106c58: d503201f     	nop
 4106c5c: a901a408     	stp	x8, x9, [x0, #0x18]
 4106c60: a902cc15     	stp	x21, x19, [x0, #0x28]
 4106c64: 910083e1     	add	x1, sp, #0x20
 4106c68: aa1503e0     	mov	x0, x21
 4106c6c: 94b1afd4     	bl	0x6d72bbc <_ChromeMain+0x6d6d920>
 4106c70: f94013f3     	ldr	x19, [sp, #0x20]
 4106c74: b5000673     	cbnz	x19, 0x4106d40 <_ChromeMain+0x4101aa4>
 4106c78: b4fff9d4     	cbz	x20, 0x4106bb0 <_ChromeMain+0x4101914>
 4106c7c: 1400004c     	b	0x4106dac <_ChromeMain+0x4101b10>
 4106c80: d2884e48     	mov	x8, #0x4272             ; =17010
 4106c84: f2b3c948     	movk	x8, #0x9e4a, lsl #16
 4106c88: f2c88ca8     	movk	x8, #0x4465, lsl #32
 4106c8c: f2e003e8     	movk	x8, #0x1f, lsl #48
 4106c90: eb08031f     	cmp	x24, x8
 4106c94: 54000382     	b.hs	0x4106d04 <_ChromeMain+0x4101a68>
 4106c98: f9400296     	ldr	x22, [x20]
 4106c9c: 52810608     	mov	w8, #0x830              ; =2096
 4106ca0: 9b087f17     	mul	x23, x24, x8
 4106ca4: aa1703e0     	mov	x0, x23
 4106ca8: 96fc21b0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4106cac: aa0003f4     	mov	x20, x0
 4106cb0: f90007e0     	str	x0, [sp, #0x8]
 4106cb4: f9000ff8     	str	x24, [sp, #0x18]
 4106cb8: b4000137     	cbz	x23, 0x4106cdc <_ChromeMain+0x4101a40>
 4106cbc: aa1403e0     	mov	x0, x20
 4106cc0: b4000200     	cbz	x0, 0x4106d00 <_ChromeMain+0x4101a64>
 4106cc4: aa1603e1     	mov	x1, x22
 4106cc8: 94b18769     	bl	0x6d68a6c <_ChromeMain+0x6d637d0>
 4106ccc: 9120c2d6     	add	x22, x22, #0x830
 4106cd0: 9120c000     	add	x0, x0, #0x830
 4106cd4: f120c2f7     	subs	x23, x23, #0x830
 4106cd8: 54ffff41     	b.ne	0x4106cc0 <_ChromeMain+0x4101a24>
 4106cdc: cb140016     	sub	x22, x0, x20
 4106ce0: 9344fec8     	asr	x8, x22, #4
 4106ce4: d289c569     	mov	x9, #0x4e2b             ; =20011
 4106ce8: f2b92909     	movk	x9, #0xc948, lsl #16
 4106cec: f2d19669     	movk	x9, #0x8cb3, lsl #32
 4106cf0: f2e07d09     	movk	x9, #0x3e8, lsl #48
 4106cf4: 9b097d08     	mul	x8, x8, x9
 4106cf8: f9000be8     	str	x8, [sp, #0x10]
 4106cfc: 17ffffc7     	b	0x4106c18 <_ChromeMain+0x410197c>
 4106d00: d4200020     	brk	#0x1
 4106d04: 9778341f     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4106d08: d4200000     	brk	#0
 4106d0c: d4400000     	hlt	#0
 4106d10: d4200020     	brk	#0x1
 4106d14: d4200000     	brk	#0
 4106d18: d4400000     	hlt	#0
 4106d1c: d4200020     	brk	#0x1
 4106d20: d4200000     	brk	#0
 4106d24: d4400000     	hlt	#0
 4106d28: d4200020     	brk	#0x1
 4106d2c: d4200000     	brk	#0
 4106d30: d4400000     	hlt	#0
 4106d34: d4200020     	brk	#0x1
 4106d38: aa1303e0     	mov	x0, x19
 4106d3c: 1400000f     	b	0x4106d78 <_ChromeMain+0x4101adc>
 4106d40: f94017e8     	ldr	x8, [sp, #0x28]
 4106d44: d375d109     	lsl	x9, x8, #11
 4106d48: eb081929     	subs	x9, x9, x8, lsl #6
 4106d4c: 54ffff60     	b.eq	0x4106d38 <_ChromeMain+0x4101a9c>
 4106d50: 8b130129     	add	x9, x9, x19
 4106d54: d11f0120     	sub	x0, x9, #0x7c0
 4106d58: d37ae509     	lsl	x9, x8, #6
 4106d5c: cb082d35     	sub	x21, x9, x8, lsl #11
 4106d60: b4fffd00     	cbz	x0, 0x4106d00 <_ChromeMain+0x4101a64>
 4106d64: 94b19cc0     	bl	0x6d6e064 <_ChromeMain+0x6d68dc8>
 4106d68: d11f0000     	sub	x0, x0, #0x7c0
 4106d6c: b11f02b5     	adds	x21, x21, #0x7c0
 4106d70: 54ffff81     	b.ne	0x4106d60 <_ChromeMain+0x4101ac4>
 4106d74: f94013e0     	ldr	x0, [sp, #0x20]
 4106d78: cb000268     	sub	x8, x19, x0
 4106d7c: 9346fd08     	asr	x8, x8, #6
 4106d80: d28f7be9     	mov	x9, #0x7bdf             ; =31711
 4106d84: f2b7bde9     	movk	x9, #0xbdef, lsl #16
 4106d88: f2dbdee9     	movk	x9, #0xdef7, lsl #32
 4106d8c: f2fdef69     	movk	x9, #0xef7b, lsl #48
 4106d90: 9b097d08     	mul	x8, x8, x9
 4106d94: f90017e8     	str	x8, [sp, #0x28]
 4106d98: f9401be8     	ldr	x8, [sp, #0x30]
 4106d9c: d375d109     	lsl	x9, x8, #11
 4106da0: cb081921     	sub	x1, x9, x8, lsl #6
 4106da4: 96fc0845     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4106da8: b4fff054     	cbz	x20, 0x4106bb0 <_ChromeMain+0x4101914>
 4106dac: b4000136     	cbz	x22, 0x4106dd0 <_ChromeMain+0x4101b34>
 4106db0: 8b1402c8     	add	x8, x22, x20
 4106db4: d120c100     	sub	x0, x8, #0x830
 4106db8: b4fffa40     	cbz	x0, 0x4106d00 <_ChromeMain+0x4101a64>
 4106dbc: 94b18958     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 4106dc0: d120c000     	sub	x0, x0, #0x830
 4106dc4: f120c2d6     	subs	x22, x22, #0x830
 4106dc8: 54ffff81     	b.ne	0x4106db8 <_ChromeMain+0x4101b1c>
 4106dcc: f9400ff8     	ldr	x24, [sp, #0x18]
 4106dd0: f9000bff     	str	xzr, [sp, #0x10]
 4106dd4: 52810608     	mov	w8, #0x830              ; =2096
 4106dd8: 9b087f01     	mul	x1, x24, x8
 4106ddc: aa1403e0     	mov	x0, x20
 4106de0: 96fc0836     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4106de4: 17ffff73     	b	0x4106bb0 <_ChromeMain+0x4101914>
 4106de8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4106dec: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4106df0: 910043fd     	add	x29, sp, #0x10
 4106df4: aa0103f4     	mov	x20, x1
 4106df8: aa0003f3     	mov	x19, x0
 4106dfc: f9400c00     	ldr	x0, [x0, #0x18]
 4106e00: b4000380     	cbz	x0, 0x4106e70 <_ChromeMain+0x4101bd4>
 4106e04: 94b1e9bc     	bl	0x6d814f4 <_ChromeMain+0x6d7c258>
 4106e08: 7100001f     	cmp	w0, #0x0
 4106e0c: 1a9f17e1     	cset	w1, eq
 4106e10: b4000354     	cbz	x20, 0x4106e78 <_ChromeMain+0x4101bdc>
 4106e14: f9400688     	ldr	x8, [x20, #0x8]
 4106e18: aa1403e0     	mov	x0, x20
 4106e1c: d63f0100     	blr	x8
 4106e20: 12800008     	mov	w8, #-0x1               ; =-1
 4106e24: b8e80288     	ldaddal	w8, w8, [x20]
 4106e28: 7100051f     	cmp	w8, #0x1
 4106e2c: 54000081     	b.ne	0x4106e3c <_ChromeMain+0x4101ba0>
 4106e30: f9400a88     	ldr	x8, [x20, #0x10]
 4106e34: aa1403e0     	mov	x0, x20
 4106e38: d63f0100     	blr	x8
 4106e3c: b40000d3     	cbz	x19, 0x4106e54 <_ChromeMain+0x4101bb8>
 4106e40: 91002268     	add	x8, x19, #0x8
 4106e44: 12800009     	mov	w9, #-0x1               ; =-1
 4106e48: b8e90108     	ldaddal	w9, w8, [x8]
 4106e4c: 7100051f     	cmp	w8, #0x1
 4106e50: 54000080     	b.eq	0x4106e60 <_ChromeMain+0x4101bc4>
 4106e54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4106e58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4106e5c: d65f03c0     	ret
 4106e60: aa1303e0     	mov	x0, x19
 4106e64: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4106e68: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4106e6c: 1797853c     	b	0x26e835c <_ChromeMain+0x26e30c0>
 4106e70: 52800001     	mov	w1, #0x0                ; =0
 4106e74: b5fffd14     	cbnz	x20, 0x4106e14 <_ChromeMain+0x4101b78>
 4106e78: d4200000     	brk	#0
 4106e7c: d4400000     	hlt	#0
 4106e80: d4200020     	brk	#0x1
