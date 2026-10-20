
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45b6900: d101c3ff     	sub	sp, sp, #0x70
 45b6904: a9035ff8     	stp	x24, x23, [sp, #0x30]
 45b6908: a90457f6     	stp	x22, x21, [sp, #0x40]
 45b690c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 45b6910: a9067bfd     	stp	x29, x30, [sp, #0x60]
 45b6914: 910183fd     	add	x29, sp, #0x60
 45b6918: aa0103f4     	mov	x20, x1
 45b691c: aa0003f3     	mov	x19, x0
 45b6920: f9429c08     	ldr	x8, [x0, #0x538]
 45b6924: 9100a109     	add	x9, x8, #0x28
 45b6928: f100011f     	cmp	x8, #0x0
 45b692c: 9a8903e9     	csel	x9, xzr, x9, eq
 45b6930: f940b128     	ldr	x8, [x9, #0x160]
 45b6934: 90052ff7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45b6938: b40002e8     	cbz	x8, 0x45b6994 <_ChromeMain+0x45b16f8>
 45b693c: 91058129     	add	x9, x9, #0x160
 45b6940: d005158a     	adrp	x10, 0xe868000 <dyld_stub_binder+0xe868000>
 45b6944: 9112214a     	add	x10, x10, #0x488
 45b6948: 1400000d     	b	0x45b697c <_ChromeMain+0x45b16e0>
 45b694c: eb09011f     	cmp	x8, x9
 45b6950: 54000220     	b.eq	0x45b6994 <_ChromeMain+0x45b16f8>
 45b6954: f9401515     	ldr	x21, [x8, #0x28]
 45b6958: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b695c: f94046e9     	ldr	x9, [x23, #0x88]
 45b6960: eb09011f     	cmp	x8, x9
 45b6964: 540001a1     	b.ne	0x45b6998 <_ChromeMain+0x45b16fc>
 45b6968: aa1503e0     	mov	x0, x21
 45b696c: 96e97664     	bl	0x142fc <_ChromeMain+0xf060>
 45b6970: 1400000a     	b	0x45b6998 <_ChromeMain+0x45b16fc>
 45b6974: f9400108     	ldr	x8, [x8]
 45b6978: b40000e8     	cbz	x8, 0x45b6994 <_ChromeMain+0x45b16f8>
 45b697c: f940110b     	ldr	x11, [x8, #0x20]
 45b6980: eb0a017f     	cmp	x11, x10
 45b6984: 54ffff88     	b.hi	0x45b6974 <_ChromeMain+0x45b16d8>
 45b6988: 54fffe20     	b.eq	0x45b694c <_ChromeMain+0x45b16b0>
 45b698c: f9400508     	ldr	x8, [x8, #0x8]
 45b6990: b5ffff68     	cbnz	x8, 0x45b697c <_ChromeMain+0x45b16e0>
 45b6994: d2800015     	mov	x21, #0x0               ; =0
 45b6998: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b699c: f94046e9     	ldr	x9, [x23, #0x88]
 45b69a0: eb09011f     	cmp	x8, x9
 45b69a4: 54000061     	b.ne	0x45b69b0 <_ChromeMain+0x45b1714>
 45b69a8: aa1503e0     	mov	x0, x21
 45b69ac: 96e9b024     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b69b0: b4000f95     	cbz	x21, 0x45b6ba0 <_ChromeMain+0x45b1904>
 45b69b4: f94002a8     	ldr	x8, [x21]
 45b69b8: f9401108     	ldr	x8, [x8, #0x20]
 45b69bc: aa1503e0     	mov	x0, x21
 45b69c0: d63f0100     	blr	x8
 45b69c4: 34000ee0     	cbz	w0, 0x45b6ba0 <_ChromeMain+0x45b1904>
 45b69c8: f9400288     	ldr	x8, [x20]
 45b69cc: f9000be8     	str	x8, [sp, #0x10]
 45b69d0: 9107c260     	add	x0, x19, #0x1f0
 45b69d4: 910043e1     	add	x1, sp, #0x10
 45b69d8: 9775b3f7     	bl	0x23239b4 <_ChromeMain+0x231e718>
 45b69dc: f942fa68     	ldr	x8, [x19, #0x5f0]
 45b69e0: b40003e8     	cbz	x8, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b69e4: f9407109     	ldr	x9, [x8, #0xe0]
 45b69e8: b40003a9     	cbz	x9, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b69ec: 19404129     	ldapurb	w9, [x9, #0x4]
 45b69f0: 35000369     	cbnz	w9, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b69f4: f9407509     	ldr	x9, [x8, #0xe8]
 45b69f8: b4000329     	cbz	x9, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b69fc: f9407109     	ldr	x9, [x8, #0xe0]
 45b6a00: b40054c9     	cbz	x9, 0x45b7498 <_ChromeMain+0x45b21fc>
 45b6a04: 19404129     	ldapurb	w9, [x9, #0x4]
 45b6a08: 35005489     	cbnz	w9, 0x45b7498 <_ChromeMain+0x45b21fc>
 45b6a0c: f9407508     	ldr	x8, [x8, #0xe8]
 45b6a10: f9402508     	ldr	x8, [x8, #0x48]
 45b6a14: b4000248     	cbz	x8, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b6a18: 3949a108     	ldrb	w8, [x8, #0x268]
 45b6a1c: 34000208     	cbz	w8, 0x45b6a5c <_ChromeMain+0x45b17c0>
 45b6a20: f942fa60     	ldr	x0, [x19, #0x5f0]
 45b6a24: 97f8e99f     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45b6a28: b94013e8     	ldr	w8, [sp, #0x10]
 45b6a2c: 6b00011f     	cmp	w8, w0
 45b6a30: 5400016b     	b.lt	0x45b6a5c <_ChromeMain+0x45b17c0>
 45b6a34: 0b000029     	add	w9, w1, w0
 45b6a38: 6b09011f     	cmp	w8, w9
 45b6a3c: 5400010a     	b.ge	0x45b6a5c <_ChromeMain+0x45b17c0>
 45b6a40: b94017e8     	ldr	w8, [sp, #0x14]
 45b6a44: d360fc09     	lsr	x9, x0, #32
 45b6a48: 6b09011f     	cmp	w8, w9
 45b6a4c: 5400008b     	b.lt	0x45b6a5c <_ChromeMain+0x45b17c0>
 45b6a50: 8b418129     	add	x9, x9, x1, lsr #32
 45b6a54: 6b09011f     	cmp	w8, w9
 45b6a58: 540007ab     	b.lt	0x45b6b4c <_ChromeMain+0x45b18b0>
 45b6a5c: f942f668     	ldr	x8, [x19, #0x5e8]
 45b6a60: b4000428     	cbz	x8, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6a64: f9407109     	ldr	x9, [x8, #0xe0]
 45b6a68: b40003e9     	cbz	x9, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6a6c: 19404129     	ldapurb	w9, [x9, #0x4]
 45b6a70: 350003a9     	cbnz	w9, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6a74: f9407509     	ldr	x9, [x8, #0xe8]
 45b6a78: b4000369     	cbz	x9, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6a7c: f9407109     	ldr	x9, [x8, #0xe0]
 45b6a80: b4005129     	cbz	x9, 0x45b74a4 <_ChromeMain+0x45b2208>
 45b6a84: 19404129     	ldapurb	w9, [x9, #0x4]
 45b6a88: 350050e9     	cbnz	w9, 0x45b74a4 <_ChromeMain+0x45b2208>
 45b6a8c: f9407508     	ldr	x8, [x8, #0xe8]
 45b6a90: f9402508     	ldr	x8, [x8, #0x48]
 45b6a94: b4000288     	cbz	x8, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6a98: 3949a108     	ldrb	w8, [x8, #0x268]
 45b6a9c: 34000248     	cbz	w8, 0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6aa0: f942f660     	ldr	x0, [x19, #0x5e8]
 45b6aa4: 97f8e97f     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 45b6aa8: b94013e8     	ldr	w8, [sp, #0x10]
 45b6aac: 6b00011f     	cmp	w8, w0
 45b6ab0: 540001ab     	b.lt	0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6ab4: 0b000029     	add	w9, w1, w0
 45b6ab8: 6b09011f     	cmp	w8, w9
 45b6abc: 5400014a     	b.ge	0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6ac0: b94017e8     	ldr	w8, [sp, #0x14]
 45b6ac4: d360fc09     	lsr	x9, x0, #32
 45b6ac8: 6b09011f     	cmp	w8, w9
 45b6acc: 540000cb     	b.lt	0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6ad0: 8b418129     	add	x9, x9, x1, lsr #32
 45b6ad4: 6b09011f     	cmp	w8, w9
 45b6ad8: 5400006a     	b.ge	0x45b6ae4 <_ChromeMain+0x45b1848>
 45b6adc: 52800020     	mov	w0, #0x1                ; =1
 45b6ae0: 14000015     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6ae4: f9432e75     	ldr	x21, [x19, #0x658]
 45b6ae8: b4000075     	cbz	x21, 0x45b6af4 <_ChromeMain+0x45b1858>
 45b6aec: 394722a8     	ldrb	w8, [x21, #0x1c8]
 45b6af0: 35000368     	cbnz	w8, 0x45b6b5c <_ChromeMain+0x45b18c0>
 45b6af4: b9400288     	ldr	w8, [x20]
 45b6af8: b943aa69     	ldr	w9, [x19, #0x3a8]
 45b6afc: 6b09011f     	cmp	w8, w9
 45b6b00: 540002ab     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b6b04: b943b26a     	ldr	w10, [x19, #0x3b0]
 45b6b08: 0b090149     	add	w9, w10, w9
 45b6b0c: 6b09011f     	cmp	w8, w9
 45b6b10: 5400022a     	b.ge	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b6b14: b9400688     	ldr	w8, [x20, #0x4]
 45b6b18: b943ae69     	ldr	w9, [x19, #0x3ac]
 45b6b1c: 6b09011f     	cmp	w8, w9
 45b6b20: 540001ab     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b6b24: b943b66a     	ldr	w10, [x19, #0x3b4]
 45b6b28: 0b090149     	add	w9, w10, w9
 45b6b2c: 6b09011f     	cmp	w8, w9
 45b6b30: 1a9fa7e0     	cset	w0, lt
 45b6b34: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45b6b38: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45b6b3c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45b6b40: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45b6b44: 9101c3ff     	add	sp, sp, #0x70
 45b6b48: d65f03c0     	ret
 45b6b4c: 52800040     	mov	w0, #0x2                ; =2
 45b6b50: 17fffff9     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6b54: 52800000     	mov	w0, #0x0                ; =0
 45b6b58: 17fffff7     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6b5c: f9400288     	ldr	x8, [x20]
 45b6b60: f90003e8     	str	x8, [sp]
 45b6b64: f941be60     	ldr	x0, [x19, #0x378]
 45b6b68: 910003e2     	mov	x2, sp
 45b6b6c: aa1503e1     	mov	x1, x21
 45b6b70: 95848fb8     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6b74: 910003e1     	mov	x1, sp
 45b6b78: aa1503e0     	mov	x0, x21
 45b6b7c: 9584909c     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b6b80: 34fffba0     	cbz	w0, 0x45b6af4 <_ChromeMain+0x45b1858>
 45b6b84: f9432e60     	ldr	x0, [x19, #0x658]
 45b6b88: 910003e1     	mov	x1, sp
 45b6b8c: 95fffcbc     	bl	0xc5b5e7c <_ChromeMain+0xc5b0be0>
 45b6b90: 7100001f     	cmp	w0, #0x0
 45b6b94: 52800028     	mov	w8, #0x1                ; =1
 45b6b98: 1a880500     	cinc	w0, w8, ne
 45b6b9c: 17ffffe6     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6ba0: f9400288     	ldr	x8, [x20]
 45b6ba4: f90017e8     	str	x8, [sp, #0x28]
 45b6ba8: f941be60     	ldr	x0, [x19, #0x378]
 45b6bac: 9107c261     	add	x1, x19, #0x1f0
 45b6bb0: 9100a3e2     	add	x2, sp, #0x28
 45b6bb4: 95848fa7     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6bb8: f9429e68     	ldr	x8, [x19, #0x538]
 45b6bbc: 9100a109     	add	x9, x8, #0x28
 45b6bc0: f100011f     	cmp	x8, #0x0
 45b6bc4: 9a8903e9     	csel	x9, xzr, x9, eq
 45b6bc8: f940b128     	ldr	x8, [x9, #0x160]
 45b6bcc: b40002e8     	cbz	x8, 0x45b6c28 <_ChromeMain+0x45b198c>
 45b6bd0: 91058129     	add	x9, x9, #0x160
 45b6bd4: d00528ea     	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 45b6bd8: 912b414a     	add	x10, x10, #0xad0
 45b6bdc: 1400000d     	b	0x45b6c10 <_ChromeMain+0x45b1974>
 45b6be0: eb09011f     	cmp	x8, x9
 45b6be4: 54000220     	b.eq	0x45b6c28 <_ChromeMain+0x45b198c>
 45b6be8: f9401515     	ldr	x21, [x8, #0x28]
 45b6bec: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b6bf0: f94046e9     	ldr	x9, [x23, #0x88]
 45b6bf4: eb09011f     	cmp	x8, x9
 45b6bf8: 540001a1     	b.ne	0x45b6c2c <_ChromeMain+0x45b1990>
 45b6bfc: aa1503e0     	mov	x0, x21
 45b6c00: 96e975bf     	bl	0x142fc <_ChromeMain+0xf060>
 45b6c04: 1400000a     	b	0x45b6c2c <_ChromeMain+0x45b1990>
 45b6c08: f9400108     	ldr	x8, [x8]
 45b6c0c: b40000e8     	cbz	x8, 0x45b6c28 <_ChromeMain+0x45b198c>
 45b6c10: f940110b     	ldr	x11, [x8, #0x20]
 45b6c14: eb0a017f     	cmp	x11, x10
 45b6c18: 54ffff88     	b.hi	0x45b6c08 <_ChromeMain+0x45b196c>
 45b6c1c: 54fffe20     	b.eq	0x45b6be0 <_ChromeMain+0x45b1944>
 45b6c20: f9400508     	ldr	x8, [x8, #0x8]
 45b6c24: b5ffff68     	cbnz	x8, 0x45b6c10 <_ChromeMain+0x45b1974>
 45b6c28: d2800015     	mov	x21, #0x0               ; =0
 45b6c2c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b6c30: f94046e9     	ldr	x9, [x23, #0x88]
 45b6c34: eb09011f     	cmp	x8, x9
 45b6c38: 54000061     	b.ne	0x45b6c44 <_ChromeMain+0x45b19a8>
 45b6c3c: aa1503e0     	mov	x0, x21
 45b6c40: 96e9af7f     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b6c44: 3940fea9     	ldrb	w9, [x21, #0x3f]
 45b6c48: 13001d28     	sxtb	w8, w9
 45b6c4c: f9401aaa     	ldr	x10, [x21, #0x30]
 45b6c50: 7100011f     	cmp	w8, #0x0
 45b6c54: 9a894149     	csel	x9, x10, x9, mi
 45b6c58: f100453f     	cmp	x9, #0x11
 45b6c5c: 54000241     	b.ne	0x45b6ca4 <_ChromeMain+0x45b1a08>
 45b6c60: f8428ea9     	ldr	x9, [x21, #0x28]!
 45b6c64: 7100011f     	cmp	w8, #0x0
 45b6c68: 9a954128     	csel	x8, x9, x21, mi
 45b6c6c: 90044a69     	adrp	x9, 0xcf02000 <dyld_stub_binder+0xcf02000>
 45b6c70: 91249129     	add	x9, x9, #0x924
 45b6c74: a9402d0a     	ldp	x10, x11, [x8]
 45b6c78: a940352c     	ldp	x12, x13, [x9]
 45b6c7c: 39404108     	ldrb	w8, [x8, #0x10]
 45b6c80: 39404129     	ldrb	w9, [x9, #0x10]
 45b6c84: eb0c015f     	cmp	x10, x12
 45b6c88: fa4d0160     	ccmp	x11, x13, #0x0, eq
 45b6c8c: fa490100     	ccmp	x8, x9, #0x0, eq
 45b6c90: 1a9f07e8     	cset	w8, ne
 45b6c94: b9402fe9     	ldr	w9, [sp, #0x2c]
 45b6c98: 7100011f     	cmp	w8, #0x0
 45b6c9c: 7a5c0920     	ccmp	w9, #0x1c, #0x0, eq
 45b6ca0: 54fff56b     	b.lt	0x45b6b4c <_ChromeMain+0x45b18b0>
 45b6ca4: 9100a3e1     	add	x1, sp, #0x28
 45b6ca8: aa1303e0     	mov	x0, x19
 45b6cac: 97fff1b5     	bl	0x45b3380 <_ChromeMain+0x45ae0e4>
 45b6cb0: 350017c0     	cbnz	w0, 0x45b6fa8 <_ChromeMain+0x45b1d0c>
 45b6cb4: f942c660     	ldr	x0, [x19, #0x588]
 45b6cb8: b4000080     	cbz	x0, 0x45b6cc8 <_ChromeMain+0x45b1a2c>
 45b6cbc: aa1403e1     	mov	x1, x20
 45b6cc0: 9584df5b     	bl	0xa6eea2c <_ChromeMain+0xa6e9790>
 45b6cc4: 35fff380     	cbnz	w0, 0x45b6b34 <_ChromeMain+0x45b1898>
 45b6cc8: 395fc268     	ldrb	w8, [x19, #0x7f0]
 45b6ccc: 340004a8     	cbz	w8, 0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6cd0: f9429e68     	ldr	x8, [x19, #0x538]
 45b6cd4: f9404508     	ldr	x8, [x8, #0x88]
 45b6cd8: f9404908     	ldr	x8, [x8, #0x90]
 45b6cdc: b4000428     	cbz	x8, 0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6ce0: f9402109     	ldr	x9, [x8, #0x40]
 45b6ce4: b40003e9     	cbz	x9, 0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6ce8: f9485d28     	ldr	x8, [x9, #0x10b8]
 45b6cec: f9486129     	ldr	x9, [x9, #0x10c0]
 45b6cf0: d360fd0a     	lsr	x10, x8, #32
 45b6cf4: d360fd2b     	lsr	x11, x9, #32
 45b6cf8: 2b0b014c     	adds	w12, w10, w11
 45b6cfc: 131f7d8d     	asr	w13, w12, #31
 45b6d00: 520101ad     	eor	w13, w13, #0x80000000
 45b6d04: 1a8c61ac     	csel	w12, w13, w12, vs
 45b6d08: 6b0a018c     	subs	w12, w12, w10
 45b6d0c: 131f7d8d     	asr	w13, w12, #31
 45b6d10: 520101ad     	eor	w13, w13, #0x80000000
 45b6d14: 1a8c61ad     	csel	w13, w13, w12, vs
 45b6d18: b9402bec     	ldr	w12, [sp, #0x28]
 45b6d1c: 37f8022c     	tbnz	w12, #0x1f, 0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6d20: b943b26e     	ldr	w14, [x19, #0x3b0]
 45b6d24: 0aae7dce     	bic	w14, w14, w14, asr #31
 45b6d28: 6b0e019f     	cmp	w12, w14
 45b6d2c: 540001a2     	b.hs	0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6d30: 0aad7dae     	bic	w14, w13, w13, asr #31
 45b6d34: b9402fed     	ldr	w13, [sp, #0x2c]
 45b6d38: 8b4881ce     	add	x14, x14, x8, lsr #32
 45b6d3c: 6b0a01bf     	cmp	w13, w10
 45b6d40: 7a4ea1a0     	ccmp	w13, w14, #0x0, ge
 45b6d44: 540000ea     	b.ge	0x45b6d60 <_ChromeMain+0x45b1ac4>
 45b6d48: 0b080129     	add	w9, w9, w8
 45b6d4c: 0b0a016a     	add	w10, w11, w10
 45b6d50: 6b08019f     	cmp	w12, w8
 45b6d54: 7a49a180     	ccmp	w12, w9, #0x0, ge
 45b6d58: 7a4ab1a0     	ccmp	w13, w10, #0x0, lt
 45b6d5c: 54ffefca     	b.ge	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b6d60: f9433e75     	ldr	x21, [x19, #0x678]
 45b6d64: b4000235     	cbz	x21, 0x45b6da8 <_ChromeMain+0x45b1b0c>
 45b6d68: 394722a8     	ldrb	w8, [x21, #0x1c8]
 45b6d6c: 340001e8     	cbz	w8, 0x45b6da8 <_ChromeMain+0x45b1b0c>
 45b6d70: f9400288     	ldr	x8, [x20]
 45b6d74: f9000be8     	str	x8, [sp, #0x10]
 45b6d78: f941be60     	ldr	x0, [x19, #0x378]
 45b6d7c: 910043e2     	add	x2, sp, #0x10
 45b6d80: aa1503e1     	mov	x1, x21
 45b6d84: 95848f33     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6d88: 910043e1     	add	x1, sp, #0x10
 45b6d8c: aa1503e0     	mov	x0, x21
 45b6d90: 95849017     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b6d94: 340000a0     	cbz	w0, 0x45b6da8 <_ChromeMain+0x45b1b0c>
 45b6d98: f9433e60     	ldr	x0, [x19, #0x678]
 45b6d9c: 910043e1     	add	x1, sp, #0x10
 45b6da0: 94f63dbb     	bl	0x834648c <_ChromeMain+0x83411f0>
 45b6da4: 17ffff7b     	b	0x45b6b90 <_ChromeMain+0x45b18f4>
 45b6da8: f942da61     	ldr	x1, [x19, #0x5b0]
 45b6dac: b4000061     	cbz	x1, 0x45b6db8 <_ChromeMain+0x45b1b1c>
 45b6db0: 39472028     	ldrb	w8, [x1, #0x1c8]
 45b6db4: 35001aa8     	cbnz	w8, 0x45b7108 <_ChromeMain+0x45b1e6c>
 45b6db8: f9432e75     	ldr	x21, [x19, #0x658]
 45b6dbc: b4000255     	cbz	x21, 0x45b6e04 <_ChromeMain+0x45b1b68>
 45b6dc0: 394722a8     	ldrb	w8, [x21, #0x1c8]
 45b6dc4: 34000208     	cbz	w8, 0x45b6e04 <_ChromeMain+0x45b1b68>
 45b6dc8: f9400288     	ldr	x8, [x20]
 45b6dcc: f9000be8     	str	x8, [sp, #0x10]
 45b6dd0: f941be60     	ldr	x0, [x19, #0x378]
 45b6dd4: 910043e2     	add	x2, sp, #0x10
 45b6dd8: aa1503e1     	mov	x1, x21
 45b6ddc: 95848f1d     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6de0: 910043e1     	add	x1, sp, #0x10
 45b6de4: aa1503e0     	mov	x0, x21
 45b6de8: 95849001     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b6dec: 34003300     	cbz	w0, 0x45b744c <_ChromeMain+0x45b21b0>
 45b6df0: f9432e60     	ldr	x0, [x19, #0x658]
 45b6df4: 910043e1     	add	x1, sp, #0x10
 45b6df8: 95fffc21     	bl	0xc5b5e7c <_ChromeMain+0xc5b0be0>
 45b6dfc: 52000000     	eor	w0, w0, #0x1
 45b6e00: 17ffff4d     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6e04: aa1303e0     	mov	x0, x19
 45b6e08: 95fffce1     	bl	0xc5b618c <_ChromeMain+0xc5b0ef0>
 45b6e0c: 34000600     	cbz	w0, 0x45b6ecc <_ChromeMain+0x45b1c30>
 45b6e10: f9400288     	ldr	x8, [x20]
 45b6e14: f9000be8     	str	x8, [sp, #0x10]
 45b6e18: f941be60     	ldr	x0, [x19, #0x378]
 45b6e1c: f942ce75     	ldr	x21, [x19, #0x598]
 45b6e20: 910043e2     	add	x2, sp, #0x10
 45b6e24: aa1503e1     	mov	x1, x21
 45b6e28: 95848f0a     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6e2c: 910043e1     	add	x1, sp, #0x10
 45b6e30: aa1503e0     	mov	x0, x21
 45b6e34: 95848fee     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b6e38: 340000e0     	cbz	w0, 0x45b6e54 <_ChromeMain+0x45b1bb8>
 45b6e3c: f942ce60     	ldr	x0, [x19, #0x598]
 45b6e40: f9400008     	ldr	x8, [x0]
 45b6e44: f9423108     	ldr	x8, [x8, #0x460]
 45b6e48: 910043e1     	add	x1, sp, #0x10
 45b6e4c: d63f0100     	blr	x8
 45b6e50: 17ffff50     	b	0x45b6b90 <_ChromeMain+0x45b18f4>
 45b6e54: f940fa68     	ldr	x8, [x19, #0x1f0]
 45b6e58: f9403108     	ldr	x8, [x8, #0x60]
 45b6e5c: d0fe05a9     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 45b6e60: 91394129     	add	x9, x9, #0xe50
 45b6e64: eb09011f     	cmp	x8, x9
 45b6e68: 54002961     	b.ne	0x45b7394 <_ChromeMain+0x45b20f8>
 45b6e6c: f941ba60     	ldr	x0, [x19, #0x370]
 45b6e70: f9407008     	ldr	x8, [x0, #0xe0]
 45b6e74: b40001c8     	cbz	x8, 0x45b6eac <_ChromeMain+0x45b1c10>
 45b6e78: 19404108     	ldapurb	w8, [x8, #0x4]
 45b6e7c: 35000188     	cbnz	w8, 0x45b6eac <_ChromeMain+0x45b1c10>
 45b6e80: f9407408     	ldr	x8, [x0, #0xe8]
 45b6e84: b4000148     	cbz	x8, 0x45b6eac <_ChromeMain+0x45b1c10>
 45b6e88: f9407008     	ldr	x8, [x0, #0xe0]
 45b6e8c: b4003008     	cbz	x8, 0x45b748c <_ChromeMain+0x45b21f0>
 45b6e90: 19404108     	ldapurb	w8, [x8, #0x4]
 45b6e94: 35002fc8     	cbnz	w8, 0x45b748c <_ChromeMain+0x45b21f0>
 45b6e98: f9407408     	ldr	x8, [x0, #0xe8]
 45b6e9c: f9402508     	ldr	x8, [x8, #0x48]
 45b6ea0: b4000068     	cbz	x8, 0x45b6eac <_ChromeMain+0x45b1c10>
 45b6ea4: 3949bd08     	ldrb	w8, [x8, #0x26f]
 45b6ea8: 37000128     	tbnz	w8, #0x0, 0x45b6ecc <_ChromeMain+0x45b1c30>
 45b6eac: 9730b90d     	bl	0x11e52e0 <_ChromeMain+0x11e0044>
 45b6eb0: 370000e0     	tbnz	w0, #0x0, 0x45b6ecc <_ChromeMain+0x45b1c30>
 45b6eb4: b9402fe8     	ldr	w8, [sp, #0x2c]
 45b6eb8: f942ce69     	ldr	x9, [x19, #0x598]
 45b6ebc: b941bd29     	ldr	w9, [x9, #0x1bc]
 45b6ec0: 11000929     	add	w9, w9, #0x2
 45b6ec4: 6b09011f     	cmp	w8, w9
 45b6ec8: 54ffe46b     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b6ecc: f9429e68     	ldr	x8, [x19, #0x538]
 45b6ed0: 9100a109     	add	x9, x8, #0x28
 45b6ed4: f100011f     	cmp	x8, #0x0
 45b6ed8: 9a8903e9     	csel	x9, xzr, x9, eq
 45b6edc: f940b128     	ldr	x8, [x9, #0x160]
 45b6ee0: b40001a8     	cbz	x8, 0x45b6f14 <_ChromeMain+0x45b1c78>
 45b6ee4: 91058129     	add	x9, x9, #0x160
 45b6ee8: f00516ea     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 45b6eec: 911ec14a     	add	x10, x10, #0x7b0
 45b6ef0: 14000003     	b	0x45b6efc <_ChromeMain+0x45b1c60>
 45b6ef4: f9400108     	ldr	x8, [x8]
 45b6ef8: b40000e8     	cbz	x8, 0x45b6f14 <_ChromeMain+0x45b1c78>
 45b6efc: f940110b     	ldr	x11, [x8, #0x20]
 45b6f00: eb0a017f     	cmp	x11, x10
 45b6f04: 54ffff88     	b.hi	0x45b6ef4 <_ChromeMain+0x45b1c58>
 45b6f08: 54000ec0     	b.eq	0x45b70e0 <_ChromeMain+0x45b1e44>
 45b6f0c: f9400508     	ldr	x8, [x8, #0x8]
 45b6f10: b5ffff68     	cbnz	x8, 0x45b6efc <_ChromeMain+0x45b1c60>
 45b6f14: d2800015     	mov	x21, #0x0               ; =0
 45b6f18: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b6f1c: f94046e9     	ldr	x9, [x23, #0x88]
 45b6f20: eb09011f     	cmp	x8, x9
 45b6f24: 54000061     	b.ne	0x45b6f30 <_ChromeMain+0x45b1c94>
 45b6f28: aa1503e0     	mov	x0, x21
 45b6f2c: 96e9aec4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b6f30: 395fc268     	ldrb	w8, [x19, #0x7f0]
 45b6f34: 370000a8     	tbnz	w8, #0x0, 0x45b6f48 <_ChromeMain+0x45b1cac>
 45b6f38: 395fca68     	ldrb	w8, [x19, #0x7f2]
 45b6f3c: 34000448     	cbz	w8, 0x45b6fc4 <_ChromeMain+0x45b1d28>
 45b6f40: 395fce68     	ldrb	w8, [x19, #0x7f3]
 45b6f44: 14000002     	b	0x45b6f4c <_ChromeMain+0x45b1cb0>
 45b6f48: 52800028     	mov	w8, #0x1                ; =1
 45b6f4c: b40003d5     	cbz	x21, 0x45b6fc4 <_ChromeMain+0x45b1d28>
 45b6f50: 360003a8     	tbz	w8, #0x0, 0x45b6fc4 <_ChromeMain+0x45b1d28>
 45b6f54: 3944a2a8     	ldrb	w8, [x21, #0x128]
 45b6f58: 34000368     	cbz	w8, 0x45b6fc4 <_ChromeMain+0x45b1d28>
 45b6f5c: f94017e8     	ldr	x8, [sp, #0x28]
 45b6f60: f9000be8     	str	x8, [sp, #0x10]
 45b6f64: f9432668     	ldr	x8, [x19, #0x648]
 45b6f68: b9845109     	ldrsw	x9, [x8, #0x450]
 45b6f6c: f941d90a     	ldr	x10, [x8, #0x3b0]
 45b6f70: eb09015f     	cmp	x10, x9
 45b6f74: 54002909     	b.ls	0x45b7494 <_ChromeMain+0x45b21f8>
 45b6f78: f941d508     	ldr	x8, [x8, #0x3a8]
 45b6f7c: f8697908     	ldr	x8, [x8, x9, lsl #3]
 45b6f80: f941b901     	ldr	x1, [x8, #0x370]
 45b6f84: 9107c260     	add	x0, x19, #0x1f0
 45b6f88: 910043e2     	add	x2, sp, #0x10
 45b6f8c: 95848eb1     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b6f90: 3944a2a8     	ldrb	w8, [x21, #0x128]
 45b6f94: 36002808     	tbz	w8, #0x0, 0x45b7494 <_ChromeMain+0x45b21f8>
 45b6f98: 29420be1     	ldp	w1, w2, [sp, #0x10]
 45b6f9c: 910442a0     	add	x0, x21, #0x110
 45b6fa0: 941f23e8     	bl	0x4d7ff40 <_ChromeMain+0x4d7aca4>
 45b6fa4: 34000100     	cbz	w0, 0x45b6fc4 <_ChromeMain+0x45b1d28>
 45b6fa8: 9100a3e1     	add	x1, sp, #0x28
 45b6fac: aa1303e0     	mov	x0, x19
 45b6fb0: 95fffcde     	bl	0xc5b6328 <_ChromeMain+0xc5b108c>
 45b6fb4: 7100001f     	cmp	w0, #0x0
 45b6fb8: 52800028     	mov	w8, #0x1                ; =1
 45b6fbc: 1a881500     	cinc	w0, w8, eq
 45b6fc0: 17fffedd     	b	0x45b6b34 <_ChromeMain+0x45b1898>
 45b6fc4: f9429e68     	ldr	x8, [x19, #0x538]
 45b6fc8: 9100a109     	add	x9, x8, #0x28
 45b6fcc: f100011f     	cmp	x8, #0x0
 45b6fd0: 9a8903e9     	csel	x9, xzr, x9, eq
 45b6fd4: f940b128     	ldr	x8, [x9, #0x160]
 45b6fd8: b40001a8     	cbz	x8, 0x45b700c <_ChromeMain+0x45b1d70>
 45b6fdc: 91058129     	add	x9, x9, #0x160
 45b6fe0: 9005162a     	adrp	x10, 0xe87a000 <dyld_stub_binder+0xe87a000>
 45b6fe4: 9137a14a     	add	x10, x10, #0xde8
 45b6fe8: 14000003     	b	0x45b6ff4 <_ChromeMain+0x45b1d58>
 45b6fec: f9400108     	ldr	x8, [x8]
 45b6ff0: b40000e8     	cbz	x8, 0x45b700c <_ChromeMain+0x45b1d70>
 45b6ff4: f940110b     	ldr	x11, [x8, #0x20]
 45b6ff8: eb0a017f     	cmp	x11, x10
 45b6ffc: 54ffff88     	b.hi	0x45b6fec <_ChromeMain+0x45b1d50>
 45b7000: 540005c0     	b.eq	0x45b70b8 <_ChromeMain+0x45b1e1c>
 45b7004: f9400508     	ldr	x8, [x8, #0x8]
 45b7008: b5ffff68     	cbnz	x8, 0x45b6ff4 <_ChromeMain+0x45b1d58>
 45b700c: d2800015     	mov	x21, #0x0               ; =0
 45b7010: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b7014: f94046e9     	ldr	x9, [x23, #0x88]
 45b7018: eb09011f     	cmp	x8, x9
 45b701c: 54000061     	b.ne	0x45b7028 <_ChromeMain+0x45b1d8c>
 45b7020: aa1503e0     	mov	x0, x21
 45b7024: 96e9ae86     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b7028: b40000b5     	cbz	x21, 0x45b703c <_ChromeMain+0x45b1da0>
 45b702c: 9100a3e1     	add	x1, sp, #0x28
 45b7030: aa1503e0     	mov	x0, x21
 45b7034: 97ecac06     	bl	0x40e204c <_ChromeMain+0x40dcdb0>
 45b7038: 35fffb80     	cbnz	w0, 0x45b6fa8 <_ChromeMain+0x45b1d0c>
 45b703c: 910ea275     	add	x21, x19, #0x3a8
 45b7040: 3dc002a0     	ldr	q0, [x21]
 45b7044: 3d8007e0     	str	q0, [sp, #0x10]
 45b7048: f942da60     	ldr	x0, [x19, #0x5b0]
 45b704c: f940dc08     	ldr	x8, [x0, #0x1b8]
 45b7050: f90003e8     	str	x8, [sp]
 45b7054: 9107c261     	add	x1, x19, #0x1f0
 45b7058: 910003e2     	mov	x2, sp
 45b705c: 95848e7d     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b7060: b94007e8     	ldr	w8, [sp, #0x4]
 45b7064: a9007fe8     	stp	x8, xzr, [sp]
 45b7068: 910043e0     	add	x0, sp, #0x10
 45b706c: 910003e1     	mov	x1, sp
 45b7070: 96f85812     	bl	0x3cd0b8 <_ChromeMain+0x3c7e1c>
 45b7074: b9400288     	ldr	w8, [x20]
 45b7078: b94013e9     	ldr	w9, [sp, #0x10]
 45b707c: 6b09011f     	cmp	w8, w9
 45b7080: 5400198b     	b.lt	0x45b73b0 <_ChromeMain+0x45b2114>
 45b7084: b9401bea     	ldr	w10, [sp, #0x18]
 45b7088: 0b090149     	add	w9, w10, w9
 45b708c: 6b09011f     	cmp	w8, w9
 45b7090: 5400190a     	b.ge	0x45b73b0 <_ChromeMain+0x45b2114>
 45b7094: b9400688     	ldr	w8, [x20, #0x4]
 45b7098: b94017e9     	ldr	w9, [sp, #0x14]
 45b709c: 6b09011f     	cmp	w8, w9
 45b70a0: 5400188b     	b.lt	0x45b73b0 <_ChromeMain+0x45b2114>
 45b70a4: b9401fea     	ldr	w10, [sp, #0x1c]
 45b70a8: 0b090149     	add	w9, w10, w9
 45b70ac: 6b09011f     	cmp	w8, w9
 45b70b0: 54ffd16b     	b.lt	0x45b6adc <_ChromeMain+0x45b1840>
 45b70b4: 140000bf     	b	0x45b73b0 <_ChromeMain+0x45b2114>
 45b70b8: eb09011f     	cmp	x8, x9
 45b70bc: 54fffa80     	b.eq	0x45b700c <_ChromeMain+0x45b1d70>
 45b70c0: f9401515     	ldr	x21, [x8, #0x28]
 45b70c4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b70c8: f94046e9     	ldr	x9, [x23, #0x88]
 45b70cc: eb09011f     	cmp	x8, x9
 45b70d0: 54fffa01     	b.ne	0x45b7010 <_ChromeMain+0x45b1d74>
 45b70d4: aa1503e0     	mov	x0, x21
 45b70d8: 96e97489     	bl	0x142fc <_ChromeMain+0xf060>
 45b70dc: 17ffffcd     	b	0x45b7010 <_ChromeMain+0x45b1d74>
 45b70e0: eb09011f     	cmp	x8, x9
 45b70e4: 54fff180     	b.eq	0x45b6f14 <_ChromeMain+0x45b1c78>
 45b70e8: f9401515     	ldr	x21, [x8, #0x28]
 45b70ec: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b70f0: f94046e9     	ldr	x9, [x23, #0x88]
 45b70f4: eb09011f     	cmp	x8, x9
 45b70f8: 54fff101     	b.ne	0x45b6f18 <_ChromeMain+0x45b1c7c>
 45b70fc: aa1503e0     	mov	x0, x21
 45b7100: 96e9747f     	bl	0x142fc <_ChromeMain+0xf060>
 45b7104: 17ffff85     	b	0x45b6f18 <_ChromeMain+0x45b1c7c>
 45b7108: f94017e8     	ldr	x8, [sp, #0x28]
 45b710c: f9000be8     	str	x8, [sp, #0x10]
 45b7110: 9107c260     	add	x0, x19, #0x1f0
 45b7114: 910043e2     	add	x2, sp, #0x10
 45b7118: 95848e4e     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b711c: f9429e69     	ldr	x9, [x19, #0x538]
 45b7120: f00516f8     	adrp	x24, 0xe896000 <dyld_stub_binder+0xe896000>
 45b7124: 913ae318     	add	x24, x24, #0xeb8
 45b7128: b4001c49     	cbz	x9, 0x45b74b0 <_ChromeMain+0x45b2214>
 45b712c: f940c528     	ldr	x8, [x9, #0x188]
 45b7130: b40002a8     	cbz	x8, 0x45b7184 <_ChromeMain+0x45b1ee8>
 45b7134: 91062129     	add	x9, x9, #0x188
 45b7138: 1400000d     	b	0x45b716c <_ChromeMain+0x45b1ed0>
 45b713c: eb09011f     	cmp	x8, x9
 45b7140: 54000220     	b.eq	0x45b7184 <_ChromeMain+0x45b1ee8>
 45b7144: f9401515     	ldr	x21, [x8, #0x28]
 45b7148: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b714c: f94046e9     	ldr	x9, [x23, #0x88]
 45b7150: eb09011f     	cmp	x8, x9
 45b7154: 540001a1     	b.ne	0x45b7188 <_ChromeMain+0x45b1eec>
 45b7158: aa1503e0     	mov	x0, x21
 45b715c: 96e97468     	bl	0x142fc <_ChromeMain+0xf060>
 45b7160: 1400000a     	b	0x45b7188 <_ChromeMain+0x45b1eec>
 45b7164: f9400108     	ldr	x8, [x8]
 45b7168: b40000e8     	cbz	x8, 0x45b7184 <_ChromeMain+0x45b1ee8>
 45b716c: f940110a     	ldr	x10, [x8, #0x20]
 45b7170: eb18015f     	cmp	x10, x24
 45b7174: 54ffff88     	b.hi	0x45b7164 <_ChromeMain+0x45b1ec8>
 45b7178: 54fffe20     	b.eq	0x45b713c <_ChromeMain+0x45b1ea0>
 45b717c: f9400508     	ldr	x8, [x8, #0x8]
 45b7180: b5ffff68     	cbnz	x8, 0x45b716c <_ChromeMain+0x45b1ed0>
 45b7184: d2800015     	mov	x21, #0x0               ; =0
 45b7188: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b718c: f94046e9     	ldr	x9, [x23, #0x88]
 45b7190: eb09011f     	cmp	x8, x9
 45b7194: 54000061     	b.ne	0x45b71a0 <_ChromeMain+0x45b1f04>
 45b7198: aa1503e0     	mov	x0, x21
 45b719c: 96e9ae28     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b71a0: f9429e68     	ldr	x8, [x19, #0x538]
 45b71a4: 9100a109     	add	x9, x8, #0x28
 45b71a8: f100011f     	cmp	x8, #0x0
 45b71ac: 9a8903e9     	csel	x9, xzr, x9, eq
 45b71b0: f940b128     	ldr	x8, [x9, #0x160]
 45b71b4: b40002e8     	cbz	x8, 0x45b7210 <_ChromeMain+0x45b1f74>
 45b71b8: 91058129     	add	x9, x9, #0x160
 45b71bc: d005164a     	adrp	x10, 0xe881000 <dyld_stub_binder+0xe881000>
 45b71c0: 911fa14a     	add	x10, x10, #0x7e8
 45b71c4: 1400000d     	b	0x45b71f8 <_ChromeMain+0x45b1f5c>
 45b71c8: eb09011f     	cmp	x8, x9
 45b71cc: 54000220     	b.eq	0x45b7210 <_ChromeMain+0x45b1f74>
 45b71d0: f9401516     	ldr	x22, [x8, #0x28]
 45b71d4: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b71d8: f94046e9     	ldr	x9, [x23, #0x88]
 45b71dc: eb09011f     	cmp	x8, x9
 45b71e0: 540001a1     	b.ne	0x45b7214 <_ChromeMain+0x45b1f78>
 45b71e4: aa1603e0     	mov	x0, x22
 45b71e8: 96e97445     	bl	0x142fc <_ChromeMain+0xf060>
 45b71ec: 1400000a     	b	0x45b7214 <_ChromeMain+0x45b1f78>
 45b71f0: f9400108     	ldr	x8, [x8]
 45b71f4: b40000e8     	cbz	x8, 0x45b7210 <_ChromeMain+0x45b1f74>
 45b71f8: f940110b     	ldr	x11, [x8, #0x20]
 45b71fc: eb0a017f     	cmp	x11, x10
 45b7200: 54ffff88     	b.hi	0x45b71f0 <_ChromeMain+0x45b1f54>
 45b7204: 54fffe20     	b.eq	0x45b71c8 <_ChromeMain+0x45b1f2c>
 45b7208: f9400508     	ldr	x8, [x8, #0x8]
 45b720c: b5ffff68     	cbnz	x8, 0x45b71f8 <_ChromeMain+0x45b1f5c>
 45b7210: d2800016     	mov	x22, #0x0               ; =0
 45b7214: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45b7218: f94046e9     	ldr	x9, [x23, #0x88]
 45b721c: eb09011f     	cmp	x8, x9
 45b7220: 54000061     	b.ne	0x45b722c <_ChromeMain+0x45b1f90>
 45b7224: aa1603e0     	mov	x0, x22
 45b7228: 96e9ae05     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b722c: aa1603e0     	mov	x0, x22
 45b7230: 52800041     	mov	w1, #0x2                ; =2
 45b7234: 9730b739     	bl	0x11e4f18 <_ChromeMain+0x11dfc7c>
 45b7238: 340001c0     	cbz	w0, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b723c: b40001b5     	cbz	x21, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7240: f9432e68     	ldr	x8, [x19, #0x658]
 45b7244: b4000168     	cbz	x8, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7248: f0052f80     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 45b724c: 9118e000     	add	x0, x0, #0x638
 45b7250: 96ed880c     	bl	0x119280 <_ChromeMain+0x113fe4>
 45b7254: 370000a0     	tbnz	w0, #0x0, 0x45b7268 <_ChromeMain+0x45b1fcc>
 45b7258: f0052f80     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 45b725c: 91192000     	add	x0, x0, #0x648
 45b7260: 96ed8808     	bl	0x119280 <_ChromeMain+0x113fe4>
 45b7264: 34000060     	cbz	w0, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7268: 394782a8     	ldrb	w8, [x21, #0x1e0]
 45b726c: 35000268     	cbnz	w8, 0x45b72b8 <_ChromeMain+0x45b201c>
 45b7270: f942da60     	ldr	x0, [x19, #0x5b0]
 45b7274: 910043e1     	add	x1, sp, #0x10
 45b7278: 95848edd     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b727c: 34ffd9e0     	cbz	w0, 0x45b6db8 <_ChromeMain+0x45b1b1c>
 45b7280: f942da60     	ldr	x0, [x19, #0x5b0]
 45b7284: 910043e1     	add	x1, sp, #0x10
 45b7288: 97f10d6c     	bl	0x41fa838 <_ChromeMain+0x41f559c>
 45b728c: 17fffe41     	b	0x45b6b90 <_ChromeMain+0x45b18f4>
 45b7290: eb09011f     	cmp	x8, x9
 45b7294: 54000320     	b.eq	0x45b72f8 <_ChromeMain+0x45b205c>
 45b7298: f9401515     	ldr	x21, [x8, #0x28]
 45b729c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b72a0: f94046e9     	ldr	x9, [x23, #0x88]
 45b72a4: eb09011f     	cmp	x8, x9
 45b72a8: 540002a1     	b.ne	0x45b72fc <_ChromeMain+0x45b2060>
 45b72ac: aa1503e0     	mov	x0, x21
 45b72b0: 96e97413     	bl	0x142fc <_ChromeMain+0xf060>
 45b72b4: 14000012     	b	0x45b72fc <_ChromeMain+0x45b2060>
 45b72b8: f9429e69     	ldr	x9, [x19, #0x538]
 45b72bc: b4fffda9     	cbz	x9, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b72c0: b9406128     	ldr	w8, [x9, #0x60]
 45b72c4: 35fffd68     	cbnz	w8, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b72c8: f940c528     	ldr	x8, [x9, #0x188]
 45b72cc: b4000168     	cbz	x8, 0x45b72f8 <_ChromeMain+0x45b205c>
 45b72d0: 91062129     	add	x9, x9, #0x188
 45b72d4: 14000003     	b	0x45b72e0 <_ChromeMain+0x45b2044>
 45b72d8: f9400108     	ldr	x8, [x8]
 45b72dc: b40000e8     	cbz	x8, 0x45b72f8 <_ChromeMain+0x45b205c>
 45b72e0: f940110a     	ldr	x10, [x8, #0x20]
 45b72e4: eb18015f     	cmp	x10, x24
 45b72e8: 54ffff88     	b.hi	0x45b72d8 <_ChromeMain+0x45b203c>
 45b72ec: 54fffd20     	b.eq	0x45b7290 <_ChromeMain+0x45b1ff4>
 45b72f0: f9400508     	ldr	x8, [x8, #0x8]
 45b72f4: b5ffff68     	cbnz	x8, 0x45b72e0 <_ChromeMain+0x45b2044>
 45b72f8: d2800015     	mov	x21, #0x0               ; =0
 45b72fc: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 45b7300: f94046e9     	ldr	x9, [x23, #0x88]
 45b7304: eb09011f     	cmp	x8, x9
 45b7308: 54000061     	b.ne	0x45b7314 <_ChromeMain+0x45b2078>
 45b730c: aa1503e0     	mov	x0, x21
 45b7310: 96e9adcb     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45b7314: b4fffaf5     	cbz	x21, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7318: 394242a8     	ldrb	w8, [x21, #0x90]
 45b731c: 34fffaa8     	cbz	w8, 0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7320: f942da68     	ldr	x8, [x19, #0x5b0]
 45b7324: f940dd08     	ldr	x8, [x8, #0x1b8]
 45b7328: f90003e8     	str	x8, [sp]
 45b732c: f942b660     	ldr	x0, [x19, #0x568]
 45b7330: 9107c261     	add	x1, x19, #0x1f0
 45b7334: 910003e2     	mov	x2, sp
 45b7338: 95848dc6     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b733c: 294023ea     	ldp	w10, w8, [sp]
 45b7340: f942da69     	ldr	x9, [x19, #0x5b0]
 45b7344: b941c529     	ldr	w9, [x9, #0x1c4]
 45b7348: 2b090109     	adds	w9, w8, w9
 45b734c: 131f7d2b     	asr	w11, w9, #31
 45b7350: 5201016b     	eor	w11, w11, #0x80000000
 45b7354: 1a896169     	csel	w9, w11, w9, vs
 45b7358: 6b080129     	subs	w9, w9, w8
 45b735c: 131f7d2b     	asr	w11, w9, #31
 45b7360: 5201016b     	eor	w11, w11, #0x80000000
 45b7364: 1a896169     	csel	w9, w11, w9, vs
 45b7368: b9402beb     	ldr	w11, [sp, #0x28]
 45b736c: 6b0a017f     	cmp	w11, w10
 45b7370: 54fff80a     	b.ge	0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7374: b9402fea     	ldr	w10, [sp, #0x2c]
 45b7378: 6b08015f     	cmp	w10, w8
 45b737c: 54fff7ab     	b.lt	0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7380: 0aa97d29     	bic	w9, w9, w9, asr #31
 45b7384: 0b080128     	add	w8, w9, w8
 45b7388: 6b08015f     	cmp	w10, w8
 45b738c: 54ffbe4b     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b7390: 17ffffb8     	b	0x45b7270 <_ChromeMain+0x45b1fd4>
 45b7394: b0fe03c9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 45b7398: 9120c129     	add	x9, x9, #0x830
 45b739c: eb09011f     	cmp	x8, x9
 45b73a0: 54ffd660     	b.eq	0x45b6e6c <_ChromeMain+0x45b1bd0>
 45b73a4: 9107c260     	add	x0, x19, #0x1f0
 45b73a8: d63f0100     	blr	x8
 45b73ac: 17fffeb1     	b	0x45b6e70 <_ChromeMain+0x45b1bd4>
 45b73b0: b943aa77     	ldr	w23, [x19, #0x3a8]
 45b73b4: b943ae76     	ldr	w22, [x19, #0x3ac]
 45b73b8: b943b278     	ldr	w24, [x19, #0x3b0]
 45b73bc: f942da68     	ldr	x8, [x19, #0x5b0]
 45b73c0: f940dd08     	ldr	x8, [x8, #0x1b8]
 45b73c4: f90003e8     	str	x8, [sp]
 45b73c8: f942b660     	ldr	x0, [x19, #0x568]
 45b73cc: 9107c261     	add	x1, x19, #0x1f0
 45b73d0: 910003e2     	mov	x2, sp
 45b73d4: 95848d9f     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b73d8: b94007e8     	ldr	w8, [sp, #0x4]
 45b73dc: 2b0802c8     	adds	w8, w22, w8
 45b73e0: 131f7d09     	asr	w9, w8, #31
 45b73e4: 52010129     	eor	w9, w9, #0x80000000
 45b73e8: 1a886128     	csel	w8, w9, w8, vs
 45b73ec: 6b160108     	subs	w8, w8, w22
 45b73f0: 131f7d09     	asr	w9, w8, #31
 45b73f4: 52010129     	eor	w9, w9, #0x80000000
 45b73f8: 1a88612a     	csel	w10, w9, w8, vs
 45b73fc: 29402289     	ldp	w9, w8, [x20]
 45b7400: 6b17013f     	cmp	w9, w23
 45b7404: 5400014b     	b.lt	0x45b742c <_ChromeMain+0x45b2190>
 45b7408: 0b17030b     	add	w11, w24, w23
 45b740c: 6b0b013f     	cmp	w9, w11
 45b7410: 540000ea     	b.ge	0x45b742c <_ChromeMain+0x45b2190>
 45b7414: 6b16011f     	cmp	w8, w22
 45b7418: 540000ab     	b.lt	0x45b742c <_ChromeMain+0x45b2190>
 45b741c: 0aaa7d4a     	bic	w10, w10, w10, asr #31
 45b7420: 0b16014a     	add	w10, w10, w22
 45b7424: 6b0a011f     	cmp	w8, w10
 45b7428: 54ffb96b     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b742c: b94002aa     	ldr	w10, [x21]
 45b7430: 6b0a013f     	cmp	w9, w10
 45b7434: 54ffb90b     	b.lt	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b7438: b943b26b     	ldr	w11, [x19, #0x3b0]
 45b743c: 0b0a016a     	add	w10, w11, w10
 45b7440: 6b0a013f     	cmp	w9, w10
 45b7444: 54ffb6ab     	b.lt	0x45b6b18 <_ChromeMain+0x45b187c>
 45b7448: 17fffdc3     	b	0x45b6b54 <_ChromeMain+0x45b18b8>
 45b744c: f9400288     	ldr	x8, [x20]
 45b7450: f90003e8     	str	x8, [sp]
 45b7454: f941be60     	ldr	x0, [x19, #0x378]
 45b7458: f942b675     	ldr	x21, [x19, #0x568]
 45b745c: 910003e2     	mov	x2, sp
 45b7460: aa1503e1     	mov	x1, x21
 45b7464: 95848d7b     	bl	0xa6daa50 <_ChromeMain+0xa6d57b4>
 45b7468: 910003e1     	mov	x1, sp
 45b746c: aa1503e0     	mov	x0, x21
 45b7470: 95848e5f     	bl	0xa6dadec <_ChromeMain+0xa6d5b50>
 45b7474: 34ffd2c0     	cbz	w0, 0x45b6ecc <_ChromeMain+0x45b1c30>
 45b7478: f942b660     	ldr	x0, [x19, #0x568]
 45b747c: 910003e1     	mov	x1, sp
 45b7480: 95fffca5     	bl	0xc5b6714 <_ChromeMain+0xc5b1478>
 45b7484: 3707b680     	tbnz	w0, #0x0, 0x45b6b54 <_ChromeMain+0x45b18b8>
 45b7488: 17fffe91     	b	0x45b6ecc <_ChromeMain+0x45b1c30>
 45b748c: d4200000     	brk	#0
 45b7490: d4400000     	hlt	#0
 45b7494: d4200020     	brk	#0x1
 45b7498: d4200000     	brk	#0
 45b749c: d4400000     	hlt	#0
 45b74a0: d4200020     	brk	#0x1
