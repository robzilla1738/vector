
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d5697c: d105c3ff     	sub	sp, sp, #0x170
 7d56980: a9116ffc     	stp	x28, x27, [sp, #0x110]
 7d56984: a91267fa     	stp	x26, x25, [sp, #0x120]
 7d56988: a9135ff8     	stp	x24, x23, [sp, #0x130]
 7d5698c: a91457f6     	stp	x22, x21, [sp, #0x140]
 7d56990: a9154ff4     	stp	x20, x19, [sp, #0x150]
 7d56994: a9167bfd     	stp	x29, x30, [sp, #0x160]
 7d56998: 910583fd     	add	x29, sp, #0x160
 7d5699c: aa0303fa     	mov	x26, x3
 7d569a0: aa0203f5     	mov	x21, x2
 7d569a4: aa0103f3     	mov	x19, x1
 7d569a8: aa0003f4     	mov	x20, x0
 7d569ac: d0031688     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 7d569b0: f940f908     	ldr	x8, [x8, #0x1f0]
 7d569b4: f9400108     	ldr	x8, [x8]
 7d569b8: f81983a8     	stur	x8, [x29, #-0x68]
 7d569bc: f9400400     	ldr	x0, [x0, #0x8]
 7d569c0: 97ffc24e     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 7d569c4: aa0003fb     	mov	x27, x0
 7d569c8: f9400680     	ldr	x0, [x20, #0x8]
 7d569cc: aa1303e1     	mov	x1, x19
 7d569d0: 97ffc24a     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 7d569d4: b4003fe0     	cbz	x0, 0x7d571d0 <_ChromeMain+0x7d51f34>
 7d569d8: 910203f7     	add	x23, sp, #0x80
 7d569dc: f9405c08     	ldr	x8, [x0, #0xb8]
 7d569e0: b40017c8     	cbz	x8, 0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d569e4: f90003e8     	str	x8, [sp]
 7d569e8: f9000ffb     	str	x27, [sp, #0x18]
 7d569ec: b90027fa     	str	w26, [sp, #0x24]
 7d569f0: f9400680     	ldr	x0, [x20, #0x8]
 7d569f4: aa1303e1     	mov	x1, x19
 7d569f8: 97ffc240     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 7d569fc: b4003fe0     	cbz	x0, 0x7d571f8 <_ChromeMain+0x7d51f5c>
 7d56a00: 97c2978d     	bl	0x6dfc834 <_ChromeMain+0x6df7598>
 7d56a04: 2a0003fb     	mov	w27, w0
 7d56a08: eb40837f     	cmp	x27, x0, lsr #32
 7d56a0c: 54000a42     	b.hs	0x7d56b54 <_ChromeMain+0x7d518b8>
 7d56a10: d360fc16     	lsr	x22, x0, #32
 7d56a14: 14000011     	b	0x7d56a58 <_ChromeMain+0x7d517bc>
 7d56a18: f9400308     	ldr	x8, [x24]
 7d56a1c: f9407908     	ldr	x8, [x8, #0xf0]
 7d56a20: aa1803e0     	mov	x0, x24
 7d56a24: d63f0100     	blr	x8
 7d56a28: 37002b19     	tbnz	w25, #0x0, 0x7d56f88 <_ChromeMain+0x7d51cec>
 7d56a2c: 14000008     	b	0x7d56a4c <_ChromeMain+0x7d517b0>
 7d56a30: 52800019     	mov	w25, #0x0               ; =0
 7d56a34: b9400b09     	ldr	w9, [x24, #0x8]
 7d56a38: 51000528     	sub	w8, w9, #0x1
 7d56a3c: b9000b08     	str	w8, [x24, #0x8]
 7d56a40: 34003c29     	cbz	w9, 0x7d571c4 <_ChromeMain+0x7d51f28>
 7d56a44: 34fffea8     	cbz	w8, 0x7d56a18 <_ChromeMain+0x7d5177c>
 7d56a48: 37002a19     	tbnz	w25, #0x0, 0x7d56f88 <_ChromeMain+0x7d51cec>
 7d56a4c: 9100077b     	add	x27, x27, #0x1
 7d56a50: eb16037f     	cmp	x27, x22
 7d56a54: 54000800     	b.eq	0x7d56b54 <_ChromeMain+0x7d518b8>
 7d56a58: 37ffffbb     	tbnz	w27, #0x1f, 0x7d56a4c <_ChromeMain+0x7d517b0>
 7d56a5c: f9400280     	ldr	x0, [x20]
 7d56a60: b9401808     	ldr	w8, [x0, #0x18]
 7d56a64: 6b08037f     	cmp	w27, w8
 7d56a68: 54ffff2a     	b.ge	0x7d56a4c <_ChromeMain+0x7d517b0>
 7d56a6c: 92407b61     	and	x1, x27, #0x7fffffff
 7d56a70: 964c1e22     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 7d56a74: f9402018     	ldr	x24, [x0, #0x40]
 7d56a78: b4fffeb8     	cbz	x24, 0x7d56a4c <_ChromeMain+0x7d517b0>
 7d56a7c: b10e6319     	adds	x25, x24, #0x398
 7d56a80: 540002c0     	b.eq	0x7d56ad8 <_ChromeMain+0x7d5183c>
 7d56a84: aa1903e0     	mov	x0, x25
 7d56a88: 965f63b7     	bl	0x152f964 <_ChromeMain+0x152a6c8>
 7d56a8c: b4000260     	cbz	x0, 0x7d56ad8 <_ChromeMain+0x7d5183c>
 7d56a90: aa1903e0     	mov	x0, x25
 7d56a94: 96a30ccd     	bl	0x2619dc8 <_ChromeMain+0x2614b2c>
 7d56a98: b4000200     	cbz	x0, 0x7d56ad8 <_ChromeMain+0x7d5183c>
 7d56a9c: aa0003f9     	mov	x25, x0
 7d56aa0: f9402408     	ldr	x8, [x0, #0x48]
 7d56aa4: d37ced08     	lsl	x8, x8, #4
 7d56aa8: b50003e8     	cbnz	x8, 0x7d56b24 <_ChromeMain+0x7d51888>
 7d56aac: 5280001a     	mov	w26, #0x0               ; =0
 7d56ab0: b9400b29     	ldr	w9, [x25, #0x8]
 7d56ab4: 51000528     	sub	w8, w9, #0x1
 7d56ab8: b9000b28     	str	w8, [x25, #0x8]
 7d56abc: 34003a49     	cbz	w9, 0x7d57204 <_ChromeMain+0x7d51f68>
 7d56ac0: 350000a8     	cbnz	w8, 0x7d56ad4 <_ChromeMain+0x7d51838>
 7d56ac4: f9400328     	ldr	x8, [x25]
 7d56ac8: f9407908     	ldr	x8, [x8, #0xf0]
 7d56acc: aa1903e0     	mov	x0, x25
 7d56ad0: d63f0100     	blr	x8
 7d56ad4: 370025ba     	tbnz	w26, #0x0, 0x7d56f88 <_ChromeMain+0x7d51cec>
 7d56ad8: aa1803e0     	mov	x0, x24
 7d56adc: 97a3a089     	bl	0x663ed00 <_ChromeMain+0x6639a64>
 7d56ae0: b4fffb60     	cbz	x0, 0x7d56a4c <_ChromeMain+0x7d517b0>
 7d56ae4: aa0003f8     	mov	x24, x0
 7d56ae8: f9402408     	ldr	x8, [x0, #0x48]
 7d56aec: d37ced08     	lsl	x8, x8, #4
 7d56af0: b4fffa08     	cbz	x8, 0x7d56a30 <_ChromeMain+0x7d51794>
 7d56af4: f9402317     	ldr	x23, [x24, #0x40]
 7d56af8: d1004108     	sub	x8, x8, #0x10
 7d56afc: aa0803fa     	mov	x26, x8
 7d56b00: f84106e0     	ldr	x0, [x23], #0x10
 7d56b04: f9400008     	ldr	x8, [x0]
 7d56b08: f9402d08     	ldr	x8, [x8, #0x58]
 7d56b0c: d63f0100     	blr	x8
 7d56b10: aa0003f9     	mov	x25, x0
 7d56b14: 3707f900     	tbnz	w0, #0x0, 0x7d56a34 <_ChromeMain+0x7d51798>
 7d56b18: d1004348     	sub	x8, x26, #0x10
 7d56b1c: b5ffff1a     	cbnz	x26, 0x7d56afc <_ChromeMain+0x7d51860>
 7d56b20: 17ffffc5     	b	0x7d56a34 <_ChromeMain+0x7d51798>
 7d56b24: f9402337     	ldr	x23, [x25, #0x40]
 7d56b28: d1004108     	sub	x8, x8, #0x10
 7d56b2c: aa0803fc     	mov	x28, x8
 7d56b30: f84106e0     	ldr	x0, [x23], #0x10
 7d56b34: f9400008     	ldr	x8, [x0]
 7d56b38: f9402d08     	ldr	x8, [x8, #0x58]
 7d56b3c: d63f0100     	blr	x8
 7d56b40: aa0003fa     	mov	x26, x0
 7d56b44: 3707fb60     	tbnz	w0, #0x0, 0x7d56ab0 <_ChromeMain+0x7d51814>
 7d56b48: d1004388     	sub	x8, x28, #0x10
 7d56b4c: b5ffff1c     	cbnz	x28, 0x7d56b2c <_ChromeMain+0x7d51890>
 7d56b50: 17ffffd8     	b	0x7d56ab0 <_ChromeMain+0x7d51814>
 7d56b54: 910203e8     	add	x8, sp, #0x80
 7d56b58: 97a19130     	bl	0x65bb018 <_ChromeMain+0x65b5d7c>
 7d56b5c: a94823f6     	ldp	x22, x8, [sp, #0x80]
 7d56b60: d37df109     	lsl	x9, x8, #3
 7d56b64: b4000b29     	cbz	x9, 0x7d56cc8 <_ChromeMain+0x7d51a2c>
 7d56b68: 8b080ed9     	add	x25, x22, x8, lsl #3
 7d56b6c: d10283ba     	sub	x26, x29, #0xa0
 7d56b70: d002871b     	adrp	x27, 0xce38000 <dyld_stub_binder+0xce38000>
 7d56b74: 9117b77b     	add	x27, x27, #0x5ed
 7d56b78: 14000009     	b	0x7d56b9c <_ChromeMain+0x7d51900>
 7d56b7c: 36f800a8     	tbz	w8, #0x1f, 0x7d56b90 <_ChromeMain+0x7d518f4>
 7d56b80: f85603a0     	ldur	x0, [x29, #-0xa0]
 7d56b84: f85703a8     	ldur	x8, [x29, #-0x90]
 7d56b88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d56b8c: 960ac8cb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56b90: 910022d6     	add	x22, x22, #0x8
 7d56b94: eb1902df     	cmp	x22, x25
 7d56b98: 54000960     	b.eq	0x7d56cc4 <_ChromeMain+0x7d51a28>
 7d56b9c: f94002c0     	ldr	x0, [x22]
 7d56ba0: f9400008     	ldr	x8, [x0]
 7d56ba4: f9404509     	ldr	x9, [x8, #0x88]
 7d56ba8: d10283a8     	sub	x8, x29, #0xa0
 7d56bac: d63f0120     	blr	x9
 7d56bb0: 385773a9     	ldurb	w9, [x29, #-0x89]
 7d56bb4: 13001d28     	sxtb	w8, w9
 7d56bb8: f85683aa     	ldur	x10, [x29, #-0x98]
 7d56bbc: 7100011f     	cmp	w8, #0x0
 7d56bc0: 9a894149     	csel	x9, x10, x9, mi
 7d56bc4: f1001d3f     	cmp	x9, #0x7
 7d56bc8: 54fffda1     	b.ne	0x7d56b7c <_ChromeMain+0x7d518e0>
 7d56bcc: f85603a9     	ldur	x9, [x29, #-0xa0]
 7d56bd0: 7100011f     	cmp	w8, #0x0
 7d56bd4: 9a9a4129     	csel	x9, x9, x26, mi
 7d56bd8: b940012a     	ldr	w10, [x9]
 7d56bdc: b940036b     	ldr	w11, [x27]
 7d56be0: b8403129     	ldur	w9, [x9, #0x3]
 7d56be4: b840336c     	ldur	w12, [x27, #0x3]
 7d56be8: 6b0b015f     	cmp	w10, w11
 7d56bec: 7a4c0120     	ccmp	w9, w12, #0x0, eq
 7d56bf0: 54fffc61     	b.ne	0x7d56b7c <_ChromeMain+0x7d518e0>
 7d56bf4: f94002c9     	ldr	x9, [x22]
 7d56bf8: f940252a     	ldr	x10, [x9, #0x48]
 7d56bfc: d37ced4a     	lsl	x10, x10, #4
 7d56c00: b400028a     	cbz	x10, 0x7d56c50 <_ChromeMain+0x7d519b4>
 7d56c04: f9402137     	ldr	x23, [x9, #0x40]
 7d56c08: d1004148     	sub	x8, x10, #0x10
 7d56c0c: aa0803fc     	mov	x28, x8
 7d56c10: f84106e0     	ldr	x0, [x23], #0x10
 7d56c14: f9400008     	ldr	x8, [x0]
 7d56c18: f9402d08     	ldr	x8, [x8, #0x58]
 7d56c1c: d63f0100     	blr	x8
 7d56c20: aa0003f8     	mov	x24, x0
 7d56c24: 37000060     	tbnz	w0, #0x0, 0x7d56c30 <_ChromeMain+0x7d51994>
 7d56c28: d1004388     	sub	x8, x28, #0x10
 7d56c2c: b5ffff1c     	cbnz	x28, 0x7d56c0c <_ChromeMain+0x7d51970>
 7d56c30: 385773a8     	ldurb	w8, [x29, #-0x89]
 7d56c34: 363800a8     	tbz	w8, #0x7, 0x7d56c48 <_ChromeMain+0x7d519ac>
 7d56c38: f85603a0     	ldur	x0, [x29, #-0xa0]
 7d56c3c: f85703a8     	ldur	x8, [x29, #-0x90]
 7d56c40: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d56c44: 960ac89d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56c48: 370019d8     	tbnz	w24, #0x0, 0x7d56f80 <_ChromeMain+0x7d51ce4>
 7d56c4c: 17ffffd1     	b	0x7d56b90 <_ChromeMain+0x7d518f4>
 7d56c50: 52800018     	mov	w24, #0x0               ; =0
 7d56c54: 373fff28     	tbnz	w8, #0x7, 0x7d56c38 <_ChromeMain+0x7d5199c>
 7d56c58: 17fffffc     	b	0x7d56c48 <_ChromeMain+0x7d519ac>
 7d56c5c: f94047e8     	ldr	x8, [sp, #0x88]
 7d56c60: d37df109     	lsl	x9, x8, #3
 7d56c64: aa1603e0     	mov	x0, x22
 7d56c68: b4000209     	cbz	x9, 0x7d56ca8 <_ChromeMain+0x7d51a0c>
 7d56c6c: 8b160129     	add	x9, x9, x22
 7d56c70: d1002138     	sub	x24, x9, #0x8
 7d56c74: cb080ff9     	neg	x25, x8, lsl #3
 7d56c78: b4002ab8     	cbz	x24, 0x7d571cc <_ChromeMain+0x7d51f30>
 7d56c7c: f85f8700     	ldr	x0, [x24], #-0x8
 7d56c80: b40000c0     	cbz	x0, 0x7d56c98 <_ChromeMain+0x7d519fc>
 7d56c84: b9400809     	ldr	w9, [x0, #0x8]
 7d56c88: 51000528     	sub	w8, w9, #0x1
 7d56c8c: b9000808     	str	w8, [x0, #0x8]
 7d56c90: 34002a69     	cbz	w9, 0x7d571dc <_ChromeMain+0x7d51f40>
 7d56c94: 34002aa8     	cbz	w8, 0x7d571e8 <_ChromeMain+0x7d51f4c>
 7d56c98: b1002339     	adds	x25, x25, #0x8
 7d56c9c: 54fffee1     	b.ne	0x7d56c78 <_ChromeMain+0x7d519dc>
 7d56ca0: f94043e0     	ldr	x0, [sp, #0x80]
 7d56ca4: 910203f7     	add	x23, sp, #0x80
 7d56ca8: cb0002c8     	sub	x8, x22, x0
 7d56cac: 9343fd08     	asr	x8, x8, #3
 7d56cb0: f90047e8     	str	x8, [sp, #0x88]
 7d56cb4: f9404be8     	ldr	x8, [sp, #0x90]
 7d56cb8: d37df101     	lsl	x1, x8, #3
 7d56cbc: 960ac87f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56cc0: 14000006     	b	0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d56cc4: f94043f6     	ldr	x22, [sp, #0x80]
 7d56cc8: b94027fa     	ldr	w26, [sp, #0x24]
 7d56ccc: f9400ffb     	ldr	x27, [sp, #0x18]
 7d56cd0: 910203f7     	add	x23, sp, #0x80
 7d56cd4: b5fffc56     	cbnz	x22, 0x7d56c5c <_ChromeMain+0x7d519c0>
 7d56cd8: f9405f68     	ldr	x8, [x27, #0xb8]
 7d56cdc: 39404508     	ldrb	w8, [x8, #0x11]
 7d56ce0: 3900e2a8     	strb	w8, [x21, #0x38]
 7d56ce4: 6f00e400     	movi.2d	v0, #0000000000000000
 7d56ce8: 3d800ee0     	str	q0, [x23, #0x30]
 7d56cec: ad0483e0     	stp	q0, q0, [sp, #0x90]
 7d56cf0: 3d8023e0     	str	q0, [sp, #0x80]
 7d56cf4: f9401376     	ldr	x22, [x27, #0x20]
 7d56cf8: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 7d56cfc: 37f800c8     	tbnz	w8, #0x1f, 0x7d56d14 <_ChromeMain+0x7d51a78>
 7d56d00: 3dc002c0     	ldr	q0, [x22]
 7d56d04: f9400ac8     	ldr	x8, [x22, #0x10]
 7d56d08: f9004be8     	str	x8, [sp, #0x90]
 7d56d0c: 3d8023e0     	str	q0, [sp, #0x80]
 7d56d10: 14000004     	b	0x7d56d20 <_ChromeMain+0x7d51a84>
 7d56d14: a9400ac1     	ldp	x1, x2, [x22]
 7d56d18: 910203e0     	add	x0, sp, #0x80
 7d56d1c: 960bbfad     	bl	0x46bd0 <_ChromeMain+0x41934>
 7d56d20: b9401ac8     	ldr	w8, [x22, #0x18]
 7d56d24: 394072c9     	ldrb	w9, [x22, #0x1c]
 7d56d28: 390273e9     	strb	w9, [sp, #0x9c]
 7d56d2c: b9009be8     	str	w8, [sp, #0x98]
 7d56d30: 910203e8     	add	x8, sp, #0x80
 7d56d34: 39c0dec9     	ldrsb	w9, [x22, #0x37]
 7d56d38: 37f800c9     	tbnz	w9, #0x1f, 0x7d56d50 <_ChromeMain+0x7d51ab4>
 7d56d3c: 3cc202c0     	ldur	q0, [x22, #0x20]
 7d56d40: f84302c9     	ldur	x9, [x22, #0x30]
 7d56d44: f8030109     	stur	x9, [x8, #0x30]
 7d56d48: 3c820100     	stur	q0, [x8, #0x20]
 7d56d4c: 14000004     	b	0x7d56d5c <_ChromeMain+0x7d51ac0>
 7d56d50: a9420ac1     	ldp	x1, x2, [x22, #0x20]
 7d56d54: 91008100     	add	x0, x8, #0x20
 7d56d58: 960b0530     	bl	0x18218 <_ChromeMain+0x12f7c>
 7d56d5c: 3940e2c8     	ldrb	w8, [x22, #0x38]
 7d56d60: 3902e3e8     	strb	w8, [sp, #0xb8]
 7d56d64: f0032678     	adrp	x24, 0xe225000 <dyld_stub_binder+0xe225000>
 7d56d68: 912f4318     	add	x24, x24, #0xbd0
 7d56d6c: f81603b8     	stur	x24, [x29, #-0xa0]
 7d56d70: 910203f7     	add	x23, sp, #0x80
 7d56d74: 925e76f9     	and	x25, x23, #0xfffffffc00000000
 7d56d78: 900372f6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 7d56d7c: f94046c8     	ldr	x8, [x22, #0x88]
 7d56d80: eb08033f     	cmp	x25, x8
 7d56d84: 54000061     	b.ne	0x7d56d90 <_ChromeMain+0x7d51af4>
 7d56d88: 910203e0     	add	x0, sp, #0x80
 7d56d8c: 960af55c     	bl	0x142fc <_ChromeMain+0xf060>
 7d56d90: f81683b7     	stur	x23, [x29, #-0x98]
 7d56d94: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 7d56d98: f94046c9     	ldr	x9, [x22, #0x88]
 7d56d9c: eb09011f     	cmp	x8, x9
 7d56da0: 54000061     	b.ne	0x7d56dac <_ChromeMain+0x7d51b10>
 7d56da4: aa1503e0     	mov	x0, x21
 7d56da8: 960af555     	bl	0x142fc <_ChromeMain+0xf060>
 7d56dac: f81703b5     	stur	x21, [x29, #-0x90]
 7d56db0: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 7d56db4: 37f800c8     	tbnz	w8, #0x1f, 0x7d56dcc <_ChromeMain+0x7d51b30>
 7d56db8: 3dc002a0     	ldr	q0, [x21]
 7d56dbc: 3d8013e0     	str	q0, [sp, #0x40]
 7d56dc0: f9400aa8     	ldr	x8, [x21, #0x10]
 7d56dc4: f9002be8     	str	x8, [sp, #0x50]
 7d56dc8: 14000004     	b	0x7d56dd8 <_ChromeMain+0x7d51b3c>
 7d56dcc: a9400aa1     	ldp	x1, x2, [x21]
 7d56dd0: 910103e0     	add	x0, sp, #0x40
 7d56dd4: 960bbf7f     	bl	0x46bd0 <_ChromeMain+0x41934>
 7d56dd8: b9401aa8     	ldr	w8, [x21, #0x18]
 7d56ddc: b9005be8     	str	w8, [sp, #0x58]
 7d56de0: 394072a8     	ldrb	w8, [x21, #0x1c]
 7d56de4: 390173e8     	strb	w8, [sp, #0x5c]
 7d56de8: 910103e8     	add	x8, sp, #0x40
 7d56dec: 39c0dea9     	ldrsb	w9, [x21, #0x37]
 7d56df0: 37f800c9     	tbnz	w9, #0x1f, 0x7d56e08 <_ChromeMain+0x7d51b6c>
 7d56df4: 3cc202a0     	ldur	q0, [x21, #0x20]
 7d56df8: 3c820100     	stur	q0, [x8, #0x20]
 7d56dfc: f84302a9     	ldur	x9, [x21, #0x30]
 7d56e00: f8030109     	stur	x9, [x8, #0x30]
 7d56e04: 14000004     	b	0x7d56e14 <_ChromeMain+0x7d51b78>
 7d56e08: a9420aa1     	ldp	x1, x2, [x21, #0x20]
 7d56e0c: 91008100     	add	x0, x8, #0x20
 7d56e10: 960b0502     	bl	0x18218 <_ChromeMain+0x12f7c>
 7d56e14: 3940e2a8     	ldrb	w8, [x21, #0x38]
 7d56e18: 3901e3e8     	strb	w8, [sp, #0x78]
 7d56e1c: 910103e1     	add	x1, sp, #0x40
 7d56e20: aa1b03e0     	mov	x0, x27
 7d56e24: aa1a03e2     	mov	x2, x26
 7d56e28: 970c84c2     	bl	0x4078130 <_ChromeMain+0x4072e94>
 7d56e2c: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 7d56e30: 36f800a8     	tbz	w8, #0x1f, 0x7d56e44 <_ChromeMain+0x7d51ba8>
 7d56e34: f94033e0     	ldr	x0, [sp, #0x60]
 7d56e38: f9403be8     	ldr	x8, [sp, #0x70]
 7d56e3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d56e40: 960ac81e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56e44: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 7d56e48: 36f800a8     	tbz	w8, #0x1f, 0x7d56e5c <_ChromeMain+0x7d51bc0>
 7d56e4c: f94023e0     	ldr	x0, [sp, #0x40]
 7d56e50: f9402be8     	ldr	x8, [sp, #0x50]
 7d56e54: d37ff901     	lsl	x1, x8, #1
 7d56e58: 960ac818     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56e5c: f90017f8     	str	x24, [sp, #0x28]
 7d56e60: f94046c8     	ldr	x8, [x22, #0x88]
 7d56e64: eb08033f     	cmp	x25, x8
 7d56e68: 54000061     	b.ne	0x7d56e74 <_ChromeMain+0x7d51bd8>
 7d56e6c: 910203e0     	add	x0, sp, #0x80
 7d56e70: 960af523     	bl	0x142fc <_ChromeMain+0xf060>
 7d56e74: 910203e8     	add	x8, sp, #0x80
 7d56e78: f9001be8     	str	x8, [sp, #0x30]
 7d56e7c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 7d56e80: f94046c9     	ldr	x9, [x22, #0x88]
 7d56e84: eb09011f     	cmp	x8, x9
 7d56e88: 54000061     	b.ne	0x7d56e94 <_ChromeMain+0x7d51bf8>
 7d56e8c: aa1503e0     	mov	x0, x21
 7d56e90: 960af51b     	bl	0x142fc <_ChromeMain+0xf060>
 7d56e94: f9001ff5     	str	x21, [sp, #0x38]
 7d56e98: 9100a3e2     	add	x2, sp, #0x28
 7d56e9c: aa1403e0     	mov	x0, x20
 7d56ea0: aa1303e1     	mov	x1, x19
 7d56ea4: 940000e2     	bl	0x7d5722c <_ChromeMain+0x7d51f90>
 7d56ea8: 9100a3e0     	add	x0, sp, #0x28
 7d56eac: 940023fe     	bl	0x7d5fea4 <_ChromeMain+0x7d5ac08>
 7d56eb0: d10283a0     	sub	x0, x29, #0xa0
 7d56eb4: 940023fc     	bl	0x7d5fea4 <_ChromeMain+0x7d5ac08>
 7d56eb8: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 7d56ebc: 36f800a8     	tbz	w8, #0x1f, 0x7d56ed0 <_ChromeMain+0x7d51c34>
 7d56ec0: f94053e0     	ldr	x0, [sp, #0xa0]
 7d56ec4: f9405be8     	ldr	x8, [sp, #0xb0]
 7d56ec8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d56ecc: 960ac7fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56ed0: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 7d56ed4: 36f800a8     	tbz	w8, #0x1f, 0x7d56ee8 <_ChromeMain+0x7d51c4c>
 7d56ed8: f94043e0     	ldr	x0, [sp, #0x80]
 7d56edc: f9404be8     	ldr	x8, [sp, #0x90]
 7d56ee0: d37ff901     	lsl	x1, x8, #1
 7d56ee4: 960ac7f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56ee8: f85983a8     	ldur	x8, [x29, #-0x68]
 7d56eec: d0031689     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 7d56ef0: f940f929     	ldr	x9, [x9, #0x1f0]
 7d56ef4: f9400129     	ldr	x9, [x9]
 7d56ef8: eb08013f     	cmp	x9, x8
 7d56efc: 54001581     	b.ne	0x7d571ac <_ChromeMain+0x7d51f10>
 7d56f00: a9567bfd     	ldp	x29, x30, [sp, #0x160]
 7d56f04: a9554ff4     	ldp	x20, x19, [sp, #0x150]
 7d56f08: a95457f6     	ldp	x22, x21, [sp, #0x140]
 7d56f0c: a9535ff8     	ldp	x24, x23, [sp, #0x130]
 7d56f10: a95267fa     	ldp	x26, x25, [sp, #0x120]
 7d56f14: a9516ffc     	ldp	x28, x27, [sp, #0x110]
 7d56f18: 9105c3ff     	add	sp, sp, #0x170
 7d56f1c: d65f03c0     	ret
 7d56f20: f94047e8     	ldr	x8, [sp, #0x88]
 7d56f24: d37df109     	lsl	x9, x8, #3
 7d56f28: b4000889     	cbz	x9, 0x7d57038 <_ChromeMain+0x7d51d9c>
 7d56f2c: 8b160129     	add	x9, x9, x22
 7d56f30: d1002138     	sub	x24, x9, #0x8
 7d56f34: cb080ff9     	neg	x25, x8, lsl #3
 7d56f38: b40014b8     	cbz	x24, 0x7d571cc <_ChromeMain+0x7d51f30>
 7d56f3c: f85f8700     	ldr	x0, [x24], #-0x8
 7d56f40: b40000c0     	cbz	x0, 0x7d56f58 <_ChromeMain+0x7d51cbc>
 7d56f44: b9400809     	ldr	w9, [x0, #0x8]
 7d56f48: 51000528     	sub	w8, w9, #0x1
 7d56f4c: b9000808     	str	w8, [x0, #0x8]
 7d56f50: 34001609     	cbz	w9, 0x7d57210 <_ChromeMain+0x7d51f74>
 7d56f54: 34001648     	cbz	w8, 0x7d5721c <_ChromeMain+0x7d51f80>
 7d56f58: b1002339     	adds	x25, x25, #0x8
 7d56f5c: 54fffee1     	b.ne	0x7d56f38 <_ChromeMain+0x7d51c9c>
 7d56f60: f94043e0     	ldr	x0, [sp, #0x80]
 7d56f64: cb0002c8     	sub	x8, x22, x0
 7d56f68: 9343fd08     	asr	x8, x8, #3
 7d56f6c: f90047e8     	str	x8, [sp, #0x88]
 7d56f70: f9404be8     	ldr	x8, [sp, #0x90]
 7d56f74: d37df101     	lsl	x1, x8, #3
 7d56f78: 960ac7d0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d56f7c: 14000003     	b	0x7d56f88 <_ChromeMain+0x7d51cec>
 7d56f80: f94043f6     	ldr	x22, [sp, #0x80]
 7d56f84: b5fffcf6     	cbnz	x22, 0x7d56f20 <_ChromeMain+0x7d51c84>
 7d56f88: f94003e8     	ldr	x8, [sp]
 7d56f8c: 39404516     	ldrb	w22, [x8, #0x11]
 7d56f90: 39c05ea9     	ldrsb	w9, [x21, #0x17]
 7d56f94: 36f803c9     	tbz	w9, #0x1f, 0x7d5700c <_ChromeMain+0x7d51d70>
 7d56f98: f94006a8     	ldr	x8, [x21, #0x8]
 7d56f9c: f100291f     	cmp	x8, #0xa
 7d56fa0: b94027fa     	ldr	w26, [sp, #0x24]
 7d56fa4: f9400ffb     	ldr	x27, [sp, #0x18]
 7d56fa8: 910203f7     	add	x23, sp, #0x80
 7d56fac: 540003c1     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56fb0: f94002a8     	ldr	x8, [x21]
 7d56fb4: 79400109     	ldrh	w9, [x8]
 7d56fb8: 7101053f     	cmp	w9, #0x41
 7d56fbc: 54000341     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56fc0: 79400509     	ldrh	w9, [x8, #0x2]
 7d56fc4: 71019d3f     	cmp	w9, #0x67
 7d56fc8: 540002e1     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56fcc: 79400909     	ldrh	w9, [x8, #0x4]
 7d56fd0: 7101953f     	cmp	w9, #0x65
 7d56fd4: 54000281     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56fd8: 79400d09     	ldrh	w9, [x8, #0x6]
 7d56fdc: 7101b93f     	cmp	w9, #0x6e
 7d56fe0: 54000221     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56fe4: 79401109     	ldrh	w9, [x8, #0x8]
 7d56fe8: 7101d13f     	cmp	w9, #0x74
 7d56fec: 540001c1     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56ff0: 79401509     	ldrh	w9, [x8, #0xa]
 7d56ff4: 7100813f     	cmp	w9, #0x20
 7d56ff8: 54000161     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d56ffc: 79401909     	ldrh	w9, [x8, #0xc]
 7d57000: 7101513f     	cmp	w9, #0x54
 7d57004: 54000101     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d57008: 1400000e     	b	0x7d57040 <_ChromeMain+0x7d51da4>
 7d5700c: aa1503e8     	mov	x8, x21
 7d57010: 7100293f     	cmp	w9, #0xa
 7d57014: b94027fa     	ldr	w26, [sp, #0x24]
 7d57018: f9400ffb     	ldr	x27, [sp, #0x18]
 7d5701c: 910203f7     	add	x23, sp, #0x80
 7d57020: 54fffca0     	b.eq	0x7d56fb4 <_ChromeMain+0x7d51d18>
 7d57024: aa1403e0     	mov	x0, x20
 7d57028: aa1303e1     	mov	x1, x19
 7d5702c: 52800002     	mov	w2, #0x0                ; =0
 7d57030: 97122fd3     	bl	0x41e2f7c <_ChromeMain+0x41ddce0>
 7d57034: 17ffff29     	b	0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d57038: aa1603e0     	mov	x0, x22
 7d5703c: 17ffffca     	b	0x7d56f64 <_ChromeMain+0x7d51cc8>
 7d57040: 79401d09     	ldrh	w9, [x8, #0xe]
 7d57044: 7101853f     	cmp	w9, #0x61
 7d57048: 54fffee1     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d5704c: 79402109     	ldrh	w9, [x8, #0x10]
 7d57050: 7101893f     	cmp	w9, #0x62
 7d57054: 54fffe81     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d57058: 79402508     	ldrh	w8, [x8, #0x12]
 7d5705c: 7101cd1f     	cmp	w8, #0x73
 7d57060: 54fffe21     	b.ne	0x7d57024 <_ChromeMain+0x7d51d88>
 7d57064: aa1403e0     	mov	x0, x20
 7d57068: aa1303e1     	mov	x1, x19
 7d5706c: 52800022     	mov	w2, #0x1                ; =1
 7d57070: 97122fc3     	bl	0x41e2f7c <_ChromeMain+0x41ddce0>
 7d57074: 3707e336     	tbnz	w22, #0x0, 0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d57078: 394072a8     	ldrb	w8, [x21, #0x1c]
 7d5707c: 3707e2e8     	tbnz	w8, #0x0, 0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d57080: 910203f7     	add	x23, sp, #0x80
 7d57084: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 7d57088: 37f800c8     	tbnz	w8, #0x1f, 0x7d570a0 <_ChromeMain+0x7d51e04>
 7d5708c: 3dc002a0     	ldr	q0, [x21]
 7d57090: 3d8023e0     	str	q0, [sp, #0x80]
 7d57094: f9400aa8     	ldr	x8, [x21, #0x10]
 7d57098: f9004be8     	str	x8, [sp, #0x90]
 7d5709c: 14000004     	b	0x7d570ac <_ChromeMain+0x7d51e10>
 7d570a0: a9400aa1     	ldp	x1, x2, [x21]
 7d570a4: 910203e0     	add	x0, sp, #0x80
 7d570a8: 960bbeca     	bl	0x46bd0 <_ChromeMain+0x41934>
 7d570ac: b9401ab6     	ldr	w22, [x21, #0x18]
 7d570b0: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 7d570b4: 37f800c8     	tbnz	w8, #0x1f, 0x7d570cc <_ChromeMain+0x7d51e30>
 7d570b8: 3cc202a0     	ldur	q0, [x21, #0x20]
 7d570bc: 3d8012e0     	str	q0, [x23, #0x40]
 7d570c0: f84302a8     	ldur	x8, [x21, #0x30]
 7d570c4: f81703a8     	stur	x8, [x29, #-0x90]
 7d570c8: 14000004     	b	0x7d570d8 <_ChromeMain+0x7d51e3c>
 7d570cc: a9420aa1     	ldp	x1, x2, [x21, #0x20]
 7d570d0: d10283a0     	sub	x0, x29, #0xa0
 7d570d4: 960b0451     	bl	0x18218 <_ChromeMain+0x12f7c>
 7d570d8: f94043fa     	ldr	x26, [sp, #0x80]
 7d570dc: 3cc883e0     	ldur	q0, [sp, #0x88]
 7d570e0: 3d8003e0     	str	q0, [sp]
 7d570e4: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 7d570e8: f90043ff     	str	xzr, [sp, #0x80]
 7d570ec: 385603b8     	ldurb	w24, [x29, #-0xa0]
 7d570f0: 910203e9     	add	x9, sp, #0x80
 7d570f4: 3cc41120     	ldur	q0, [x9, #0x41]
 7d570f8: 3d801920     	str	q0, [x9, #0x60]
 7d570fc: f844f128     	ldur	x8, [x9, #0x4f]
 7d57100: f806e128     	stur	x8, [x9, #0x6e]
 7d57104: 385773b9     	ldurb	w25, [x29, #-0x89]
 7d57108: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 7d5710c: f81703bf     	stur	xzr, [x29, #-0x90]
 7d57110: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 7d57114: 37f80428     	tbnz	w8, #0x1f, 0x7d57198 <_ChromeMain+0x7d51efc>
 7d57118: f90002ba     	str	x26, [x21]
 7d5711c: 3dc003e0     	ldr	q0, [sp]
 7d57120: 3c8082a0     	stur	q0, [x21, #0x8]
 7d57124: b9001ab6     	str	w22, [x21, #0x18]
 7d57128: 52800028     	mov	w8, #0x1                ; =1
 7d5712c: 390072a8     	strb	w8, [x21, #0x1c]
 7d57130: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 7d57134: 37f803e8     	tbnz	w8, #0x1f, 0x7d571b0 <_ChromeMain+0x7d51f14>
 7d57138: 390082b8     	strb	w24, [x21, #0x20]
 7d5713c: 910203e8     	add	x8, sp, #0x80
 7d57140: 3dc01900     	ldr	q0, [x8, #0x60]
 7d57144: 3c8212a0     	stur	q0, [x21, #0x21]
 7d57148: f846e108     	ldur	x8, [x8, #0x6e]
 7d5714c: f802f2a8     	stur	x8, [x21, #0x2f]
 7d57150: 3900deb9     	strb	w25, [x21, #0x37]
 7d57154: 3900e2bf     	strb	wzr, [x21, #0x38]
 7d57158: 38d773a8     	ldursb	w8, [x29, #-0x89]
 7d5715c: 36f800a8     	tbz	w8, #0x1f, 0x7d57170 <_ChromeMain+0x7d51ed4>
 7d57160: f85603a0     	ldur	x0, [x29, #-0xa0]
 7d57164: f85703a8     	ldur	x8, [x29, #-0x90]
 7d57168: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d5716c: 960ac753     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d57170: 39c25fe8     	ldrsb	w8, [sp, #0x97]
 7d57174: 36f800a8     	tbz	w8, #0x1f, 0x7d57188 <_ChromeMain+0x7d51eec>
 7d57178: f94043e0     	ldr	x0, [sp, #0x80]
 7d5717c: f9404be8     	ldr	x8, [sp, #0x90]
 7d57180: d37ff901     	lsl	x1, x8, #1
 7d57184: 960ac74d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d57188: b94027fa     	ldr	w26, [sp, #0x24]
 7d5718c: f9400ffb     	ldr	x27, [sp, #0x18]
 7d57190: 910203f7     	add	x23, sp, #0x80
 7d57194: 17fffed1     	b	0x7d56cd8 <_ChromeMain+0x7d51a3c>
 7d57198: f94002a0     	ldr	x0, [x21]
 7d5719c: f9400aa8     	ldr	x8, [x21, #0x10]
 7d571a0: d37ff901     	lsl	x1, x8, #1
 7d571a4: 960ac745     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d571a8: 17ffffdc     	b	0x7d57118 <_ChromeMain+0x7d51e7c>
 7d571ac: 95397935     	bl	0xcbb5680 <dyld_stub_binder+0xcbb5680>
 7d571b0: f94012a0     	ldr	x0, [x21, #0x20]
 7d571b4: f9401aa8     	ldr	x8, [x21, #0x30]
 7d571b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7d571bc: 960ac73f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7d571c0: 17ffffde     	b	0x7d57138 <_ChromeMain+0x7d51e9c>
 7d571c4: d4200000     	brk	#0
 7d571c8: d4400000     	hlt	#0
 7d571cc: d4200020     	brk	#0x1
 7d571d0: d4200000     	brk	#0
 7d571d4: d4400000     	hlt	#0
 7d571d8: d4200020     	brk	#0x1
 7d571dc: d4200000     	brk	#0
 7d571e0: d4400000     	hlt	#0
 7d571e4: d4200020     	brk	#0x1
 7d571e8: f9400008     	ldr	x8, [x0]
 7d571ec: f9407908     	ldr	x8, [x8, #0xf0]
 7d571f0: d63f0100     	blr	x8
 7d571f4: 17fffea9     	b	0x7d56c98 <_ChromeMain+0x7d519fc>
 7d571f8: d4200000     	brk	#0
 7d571fc: d4400000     	hlt	#0
 7d57200: d4200020     	brk	#0x1
 7d57204: d4200000     	brk	#0
 7d57208: d4400000     	hlt	#0
 7d5720c: d4200020     	brk	#0x1
 7d57210: d4200000     	brk	#0
 7d57214: d4400000     	hlt	#0
 7d57218: d4200020     	brk	#0x1
 7d5721c: f9400008     	ldr	x8, [x0]
 7d57220: f9407908     	ldr	x8, [x8, #0xf0]
 7d57224: d63f0100     	blr	x8
 7d57228: 17ffff4c     	b	0x7d56f58 <_ChromeMain+0x7d51cbc>
