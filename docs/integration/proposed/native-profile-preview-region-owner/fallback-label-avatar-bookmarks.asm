
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465484c: 97eaa592     	bl	0x40fde94 <_ChromeMain+0x40f8bf8>
 4654850: 3940dfe9     	ldrb	w9, [sp, #0x37]
 4654854: 13001d28     	sxtb	w8, w9
 4654858: f94017ea     	ldr	x10, [sp, #0x28]
 465485c: 7100011f     	cmp	w8, #0x0
 4654860: 9a894149     	csel	x9, x10, x9, mi
 4654864: b50001e9     	cbnz	x9, 0x46548a0 <_ChromeMain+0x464f604>
 4654868: b4004c98     	cbz	x24, 0x46551f8 <_ChromeMain+0x464ff5c>
 465486c: 9101c3e8     	add	x8, sp, #0x70
 4654870: aa1803e0     	mov	x0, x24
 4654874: 976ecec3     	bl	0x2208380 <_ChromeMain+0x22030e4>
 4654878: 3940dfe8     	ldrb	w8, [sp, #0x37]
 465487c: 363800a8     	tbz	w8, #0x7, 0x4654890 <_ChromeMain+0x464f5f4>
 4654880: f94013e0     	ldr	x0, [sp, #0x20]
 4654884: f9401be8     	ldr	x8, [sp, #0x30]
 4654888: d37ff901     	lsl	x1, x8, #1
 465488c: 96e6d18b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654890: 3dc01fe0     	ldr	q0, [sp, #0x70]
 4654894: 3d800be0     	str	q0, [sp, #0x20]
 4654898: f94043e8     	ldr	x8, [sp, #0x80]
 465489c: f9001be8     	str	x8, [sp, #0x30]
 46548a0: 3dc00be0     	ldr	q0, [sp, #0x20]
 46548a4: 3d8017e0     	str	q0, [sp, #0x50]
 46548a8: f9401be8     	ldr	x8, [sp, #0x30]
 46548ac: f90033e8     	str	x8, [sp, #0x60]
 46548b0: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 46548b4: f90013ff     	str	xzr, [sp, #0x20]
 46548b8: f941aec0     	ldr	x0, [x22, #0x358]
 46548bc: f941ac0a     	ldr	x10, [x0, #0x358]
 46548c0: 3980bd48     	ldrsb	x8, [x10, #0x2f]
 46548c4: b7f84a08     	tbnz	x8, #0x3f, 0x4655204 <_ChromeMain+0x464ff68>
 46548c8: 91006149     	add	x9, x10, #0x18
 46548cc: 39419fea     	ldrb	w10, [sp, #0x67]
 46548d0: 13001d4b     	sxtb	w11, w10
 46548d4: 7100017f     	cmp	w11, #0x0
 46548d8: a9452fec     	ldp	x12, x11, [sp, #0x50]
 46548dc: 9a8a4162     	csel	x2, x11, x10, mi
 46548e0: 910143ea     	add	x10, sp, #0x50
 46548e4: 9a8a4181     	csel	x1, x12, x10, mi
 46548e8: eb02011f     	cmp	x8, x2
 46548ec: 540001c1     	b.ne	0x4654924 <_ChromeMain+0x464f688>
 46548f0: b4000468     	cbz	x8, 0x465497c <_ChromeMain+0x464f6e0>
 46548f4: aa0103ea     	mov	x10, x1
 46548f8: 7840252b     	ldrh	w11, [x9], #0x2
 46548fc: 7840254c     	ldrh	w12, [x10], #0x2
 4654900: 6b0b019f     	cmp	w12, w11
 4654904: 54000101     	b.ne	0x4654924 <_ChromeMain+0x464f688>
 4654908: f1000508     	subs	x8, x8, #0x1
 465490c: 54ffff61     	b.ne	0x46548f8 <_ChromeMain+0x464f65c>
 4654910: 1400001b     	b	0x465497c <_ChromeMain+0x464f6e0>
 4654914: a9450be1     	ldp	x1, x2, [sp, #0x50]
 4654918: 9101c3e0     	add	x0, sp, #0x70
 465491c: 96e7c8ad     	bl	0x46bd0 <_ChromeMain+0x41934>
 4654920: 1400000e     	b	0x4654958 <_ChromeMain+0x464f6bc>
 4654924: f9400008     	ldr	x8, [x0]
 4654928: f941f108     	ldr	x8, [x8, #0x3e0]
 465492c: d63f0100     	blr	x8
 4654930: f941aec0     	ldr	x0, [x22, #0x358]
 4654934: 910143e1     	add	x1, sp, #0x50
 4654938: 9707c803     	bl	0x846944 <_ChromeMain+0x8416a8>
 465493c: f941aad9     	ldr	x25, [x22, #0x350]
 4654940: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4654944: 37fffe88     	tbnz	w8, #0x1f, 0x4654914 <_ChromeMain+0x464f678>
 4654948: 3dc017e0     	ldr	q0, [sp, #0x50]
 465494c: 3d801fe0     	str	q0, [sp, #0x70]
 4654950: f94033e8     	ldr	x8, [sp, #0x60]
 4654954: f90043e8     	str	x8, [sp, #0x80]
 4654958: 9101c3e1     	add	x1, sp, #0x70
 465495c: aa1903e0     	mov	x0, x25
 4654960: 97fcce19     	bl	0x45881c4 <_ChromeMain+0x4582f28>
 4654964: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4654968: 36f800a8     	tbz	w8, #0x1f, 0x465497c <_ChromeMain+0x464f6e0>
 465496c: f9403be0     	ldr	x0, [sp, #0x70]
 4654970: f94043e8     	ldr	x8, [sp, #0x80]
 4654974: d37ff901     	lsl	x1, x8, #1
 4654978: 96e6d150     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465497c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4654980: 36f800a8     	tbz	w8, #0x1f, 0x4654994 <_ChromeMain+0x464f6f8>
 4654984: f9402be0     	ldr	x0, [sp, #0x50]
 4654988: f94033e8     	ldr	x8, [sp, #0x60]
 465498c: d37ff901     	lsl	x1, x8, #1
 4654990: 96e6d14a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654994: b4000798     	cbz	x24, 0x4654a84 <_ChromeMain+0x464f7e8>
 4654998: aa1803e0     	mov	x0, x24
 465499c: 97ec1827     	bl	0x415aa38 <_ChromeMain+0x415579c>
 46549a0: f100681f     	cmp	x0, #0x1a
 46549a4: 54000700     	b.eq	0x4654a84 <_ChromeMain+0x464f7e8>
 46549a8: f941aac0     	ldr	x0, [x22, #0x350]
 46549ac: f9400008     	ldr	x8, [x0]
 46549b0: f9405108     	ldr	x8, [x8, #0xa0]
 46549b4: 52800001     	mov	w1, #0x0                ; =0
 46549b8: d63f0100     	blr	x8
 46549bc: f941a6c0     	ldr	x0, [x22, #0x348]
 46549c0: f9400008     	ldr	x8, [x0]
 46549c4: f9405108     	ldr	x8, [x8, #0xa0]
 46549c8: 52800035     	mov	w21, #0x1               ; =1
 46549cc: 52800021     	mov	w1, #0x1                ; =1
 46549d0: d63f0100     	blr	x8
 46549d4: f941a6d9     	ldr	x25, [x22, #0x348]
 46549d8: b0048483     	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46549dc: 91090063     	add	x3, x3, #0x240
 46549e0: 9101c3e8     	add	x8, sp, #0x70
 46549e4: aa1803e0     	mov	x0, x24
 46549e8: 52800281     	mov	w1, #0x14               ; =20
 46549ec: 52800022     	mov	w2, #0x1                ; =1
 46549f0: 9783ba81     	bl	0x27433f4 <_ChromeMain+0x273e158>
 46549f4: f9403be8     	ldr	x8, [sp, #0x70]
 46549f8: f90027e8     	str	x8, [sp, #0x48]
 46549fc: d101a3a8     	sub	x8, x29, #0x68
 4654a00: 910123e0     	add	x0, sp, #0x48
 4654a04: 52800281     	mov	w1, #0x14               ; =20
 4654a08: 52800282     	mov	w2, #0x14               ; =20
 4654a0c: 52800023     	mov	w3, #0x1                ; =1
 4654a10: 97472d2c     	bl	0x181fec0 <_ChromeMain+0x181ac24>
 4654a14: f85983a8     	ldur	x8, [x29, #-0x68]
 4654a18: f9003be8     	str	x8, [sp, #0x70]
 4654a1c: b40000a8     	cbz	x8, 0x4654a30 <_ChromeMain+0x464f794>
 4654a20: b9400109     	ldr	w9, [x8]
 4654a24: 31000529     	adds	w9, w9, #0x1
 4654a28: b9000109     	str	w9, [x8]
 4654a2c: 54005aa2     	b.hs	0x4655580 <_ChromeMain+0x46502e4>
 4654a30: 390243f5     	strb	w21, [sp, #0x90]
 4654a34: 9101c3e1     	add	x1, sp, #0x70
 4654a38: aa1903e0     	mov	x0, x25
 4654a3c: 96fd3199     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4654a40: 9101c3e0     	add	x0, sp, #0x70
 4654a44: 9707c77f     	bl	0x846840 <_ChromeMain+0x8415a4>
 4654a48: f85983b8     	ldur	x24, [x29, #-0x68]
 4654a4c: b40000d8     	cbz	x24, 0x4654a64 <_ChromeMain+0x464f7c8>
 4654a50: b9400309     	ldr	w9, [x24]
 4654a54: 51000528     	sub	w8, w9, #0x1
 4654a58: b9000308     	str	w8, [x24]
 4654a5c: 34005989     	cbz	w9, 0x465558c <_ChromeMain+0x46502f0>
 4654a60: 34005008     	cbz	w8, 0x4655460 <_ChromeMain+0x46501c4>
 4654a64: f94027f8     	ldr	x24, [sp, #0x48]
 4654a68: b4000238     	cbz	x24, 0x4654aac <_ChromeMain+0x464f810>
 4654a6c: b9400309     	ldr	w9, [x24]
 4654a70: 51000528     	sub	w8, w9, #0x1
 4654a74: b9000308     	str	w8, [x24]
 4654a78: 34005729     	cbz	w9, 0x465555c <_ChromeMain+0x46502c0>
 4654a7c: 34005048     	cbz	w8, 0x4655484 <_ChromeMain+0x46501e8>
 4654a80: 1400000b     	b	0x4654aac <_ChromeMain+0x464f810>
 4654a84: f941a6c0     	ldr	x0, [x22, #0x348]
 4654a88: f9400008     	ldr	x8, [x0]
 4654a8c: f9405108     	ldr	x8, [x8, #0xa0]
 4654a90: 52800001     	mov	w1, #0x0                ; =0
 4654a94: d63f0100     	blr	x8
 4654a98: f941aac0     	ldr	x0, [x22, #0x350]
 4654a9c: f9400008     	ldr	x8, [x0]
 4654aa0: f9405108     	ldr	x8, [x8, #0xa0]
 4654aa4: 52800021     	mov	w1, #0x1                ; =1
 4654aa8: d63f0100     	blr	x8
 4654aac: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 4654ab0: 36f800a8     	tbz	w8, #0x1f, 0x4654ac4 <_ChromeMain+0x464f828>
 4654ab4: f94013e0     	ldr	x0, [sp, #0x20]
 4654ab8: f9401be8     	ldr	x8, [sp, #0x30]
 4654abc: d37ff901     	lsl	x1, x8, #1
 4654ac0: 96e6d0fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654ac4: aa1303e0     	mov	x0, x19
 4654ac8: aa1603e1     	mov	x1, x22
 4654acc: 94001027     	bl	0x4658b68 <_ChromeMain+0x46538cc>
 4654ad0: f9422e68     	ldr	x8, [x19, #0x458]
 4654ad4: b40001c8     	cbz	x8, 0x4654b0c <_ChromeMain+0x464f870>
 4654ad8: f9429d09     	ldr	x9, [x8, #0x538]
 4654adc: b4000189     	cbz	x9, 0x4654b0c <_ChromeMain+0x464f870>
 4654ae0: f9429d00     	ldr	x0, [x8, #0x538]
 4654ae4: 910083e8     	add	x8, sp, #0x20
 4654ae8: aa1403e1     	mov	x1, x20
 4654aec: 97fc1fc5     	bl	0x455ca00 <_ChromeMain+0x4557764>
 4654af0: 52800008     	mov	w8, #0x0                ; =0
 4654af4: a9426ff8     	ldp	x24, x27, [sp, #0x20]
 4654af8: f9401bf9     	ldr	x25, [sp, #0x30]
 4654afc: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4654b00: 5280003a     	mov	w26, #0x1               ; =1
 4654b04: f9001bff     	str	xzr, [sp, #0x30]
 4654b08: 14000006     	b	0x4654b20 <_ChromeMain+0x464f884>
 4654b0c: d2800019     	mov	x25, #0x0               ; =0
 4654b10: d280001b     	mov	x27, #0x0               ; =0
 4654b14: d2800018     	mov	x24, #0x0               ; =0
 4654b18: 5280001a     	mov	w26, #0x0               ; =0
 4654b1c: 52800028     	mov	w8, #0x1                ; =1
 4654b20: f941eec9     	ldr	x9, [x22, #0x3d8]
 4654b24: f941ead5     	ldr	x21, [x22, #0x3d0]
 4654b28: eb1b013f     	cmp	x9, x27
 4654b2c: 54000180     	b.eq	0x4654b5c <_ChromeMain+0x464f8c0>
 4654b30: b4000a35     	cbz	x21, 0x4654c74 <_ChromeMain+0x464f9d8>
 4654b34: d37be928     	lsl	x8, x9, #5
 4654b38: aa1503e0     	mov	x0, x21
 4654b3c: b4000908     	cbz	x8, 0x4654c5c <_ChromeMain+0x464f9c0>
 4654b40: f90007f9     	str	x25, [sp, #0x8]
 4654b44: aa1a03f9     	mov	x25, x26
 4654b48: aa1c03fa     	mov	x26, x28
 4654b4c: 8b150108     	add	x8, x8, x21
 4654b50: d1008117     	sub	x23, x8, #0x20
 4654b54: cb0917fc     	neg	x28, x9, lsl #5
 4654b58: 14000039     	b	0x4654c3c <_ChromeMain+0x464f9a0>
 4654b5c: d37beb6a     	lsl	x10, x27, #5
 4654b60: b400052a     	cbz	x10, 0x4654c04 <_ChromeMain+0x464f968>
 4654b64: 8b1b16ab     	add	x11, x21, x27, lsl #5
 4654b68: aa1503ec     	mov	x12, x21
 4654b6c: aa1803ed     	mov	x13, x24
 4654b70: 39405d8e     	ldrb	w14, [x12, #0x17]
 4654b74: 13001dd0     	sxtb	w16, w14
 4654b78: f940058f     	ldr	x15, [x12, #0x8]
 4654b7c: 7100021f     	cmp	w16, #0x0
 4654b80: 9a8e41ee     	csel	x14, x15, x14, mi
 4654b84: 39405db1     	ldrb	w17, [x13, #0x17]
 4654b88: 13001e2f     	sxtb	w15, w17
 4654b8c: f94005a0     	ldr	x0, [x13, #0x8]
 4654b90: 710001ff     	cmp	w15, #0x0
 4654b94: 9a914011     	csel	x17, x0, x17, mi
 4654b98: eb1101df     	cmp	x14, x17
 4654b9c: 54fffca1     	b.ne	0x4654b30 <_ChromeMain+0x464f894>
 4654ba0: b40001ae     	cbz	x14, 0x4654bd4 <_ChromeMain+0x464f938>
 4654ba4: f94001b1     	ldr	x17, [x13]
 4654ba8: 710001ff     	cmp	w15, #0x0
 4654bac: 9a8d422f     	csel	x15, x17, x13, mi
 4654bb0: f9400191     	ldr	x17, [x12]
 4654bb4: 7100021f     	cmp	w16, #0x0
 4654bb8: 9a8c4230     	csel	x16, x17, x12, mi
 4654bbc: 78402611     	ldrh	w17, [x16], #0x2
 4654bc0: 784025e0     	ldrh	w0, [x15], #0x2
 4654bc4: 6b11001f     	cmp	w0, w17
 4654bc8: 54fffb41     	b.ne	0x4654b30 <_ChromeMain+0x464f894>
 4654bcc: f10005ce     	subs	x14, x14, #0x1
 4654bd0: 54ffff61     	b.ne	0x4654bbc <_ChromeMain+0x464f920>
 4654bd4: 3940618e     	ldrb	w14, [x12, #0x18]
 4654bd8: 394061af     	ldrb	w15, [x13, #0x18]
 4654bdc: 6b0f01df     	cmp	w14, w15
 4654be0: 54fffa81     	b.ne	0x4654b30 <_ChromeMain+0x464f894>
 4654be4: 3940658e     	ldrb	w14, [x12, #0x19]
 4654be8: 394065af     	ldrb	w15, [x13, #0x19]
 4654bec: 6b0f01df     	cmp	w14, w15
 4654bf0: 54fffa01     	b.ne	0x4654b30 <_ChromeMain+0x464f894>
 4654bf4: 9100818c     	add	x12, x12, #0x20
 4654bf8: 910081ad     	add	x13, x13, #0x20
 4654bfc: eb0b019f     	cmp	x12, x11
 4654c00: 54fffb81     	b.ne	0x4654b70 <_ChromeMain+0x464f8d4>
 4654c04: 36000488     	tbz	w8, #0x0, 0x4654c94 <_ChromeMain+0x464f9f8>
 4654c08: b4000478     	cbz	x24, 0x4654c94 <_ChromeMain+0x464f9f8>
 4654c0c: b4002eaa     	cbz	x10, 0x46551e0 <_ChromeMain+0x464ff44>
 4654c10: 8b180148     	add	x8, x10, x24
 4654c14: d1008115     	sub	x21, x8, #0x20
 4654c18: cb1b17f7     	neg	x23, x27, lsl #5
 4654c1c: 1400016d     	b	0x46551d0 <_ChromeMain+0x464ff34>
 4654c20: f94002e0     	ldr	x0, [x23]
 4654c24: f9400ae8     	ldr	x8, [x23, #0x10]
 4654c28: d37ff901     	lsl	x1, x8, #1
 4654c2c: 96e6d0a3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654c30: d10082f7     	sub	x23, x23, #0x20
 4654c34: b100839c     	adds	x28, x28, #0x20
 4654c38: 540000a0     	b.eq	0x4654c4c <_ChromeMain+0x464f9b0>
 4654c3c: b4002bb7     	cbz	x23, 0x46551b0 <_ChromeMain+0x464ff14>
 4654c40: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4654c44: 36ffff68     	tbz	w8, #0x1f, 0x4654c30 <_ChromeMain+0x464f994>
 4654c48: 17fffff6     	b	0x4654c20 <_ChromeMain+0x464f984>
 4654c4c: f941eac0     	ldr	x0, [x22, #0x3d0]
 4654c50: aa1a03fc     	mov	x28, x26
 4654c54: aa1903fa     	mov	x26, x25
 4654c58: f94007f9     	ldr	x25, [sp, #0x8]
 4654c5c: cb0002a8     	sub	x8, x21, x0
 4654c60: 9345fd08     	asr	x8, x8, #5
 4654c64: f901eec8     	str	x8, [x22, #0x3d8]
 4654c68: f941f2c8     	ldr	x8, [x22, #0x3e0]
 4654c6c: d37be901     	lsl	x1, x8, #5
 4654c70: 96e6d092     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654c74: f901ead8     	str	x24, [x22, #0x3d0]
 4654c78: f901eedb     	str	x27, [x22, #0x3d8]
 4654c7c: f901f2d9     	str	x25, [x22, #0x3e0]
 4654c80: aa1603e0     	mov	x0, x22
 4654c84: 9400a5bf     	bl	0x467e380 <_ChromeMain+0x46790e4>
 4654c88: d2800018     	mov	x24, #0x0               ; =0
 4654c8c: d2800019     	mov	x25, #0x0               ; =0
 4654c90: d280001b     	mov	x27, #0x0               ; =0
 4654c94: 340003ba     	cbz	w26, 0x4654d08 <_ChromeMain+0x464fa6c>
 4654c98: b4000158     	cbz	x24, 0x4654cc0 <_ChromeMain+0x464fa24>
 4654c9c: d37beb68     	lsl	x8, x27, #5
 4654ca0: b40000a8     	cbz	x8, 0x4654cb4 <_ChromeMain+0x464fa18>
 4654ca4: 8b180108     	add	x8, x8, x24
 4654ca8: d1008115     	sub	x21, x8, #0x20
 4654cac: cb1b17f7     	neg	x23, x27, lsl #5
 4654cb0: 1400013c     	b	0x46551a0 <_ChromeMain+0x464ff04>
 4654cb4: d37beb21     	lsl	x1, x25, #5
 4654cb8: aa1803e0     	mov	x0, x24
 4654cbc: 96e6d07f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654cc0: f94013f5     	ldr	x21, [sp, #0x20]
 4654cc4: b4000235     	cbz	x21, 0x4654d08 <_ChromeMain+0x464fa6c>
 4654cc8: f94017e8     	ldr	x8, [sp, #0x28]
 4654ccc: d37be909     	lsl	x9, x8, #5
 4654cd0: b4002909     	cbz	x9, 0x46551f0 <_ChromeMain+0x464ff54>
 4654cd4: 8b150129     	add	x9, x9, x21
 4654cd8: d1008137     	sub	x23, x9, #0x20
 4654cdc: cb0817f8     	neg	x24, x8, lsl #5
 4654ce0: 14000125     	b	0x4655174 <_ChromeMain+0x464fed8>
 4654ce4: d2800018     	mov	x24, #0x0               ; =0
 4654ce8: 1400002b     	b	0x4654d94 <_ChromeMain+0x464faf8>
 4654cec: f94013e0     	ldr	x0, [sp, #0x20]
 4654cf0: cb0002a8     	sub	x8, x21, x0
 4654cf4: 9345fd08     	asr	x8, x8, #5
 4654cf8: f90017e8     	str	x8, [sp, #0x28]
 4654cfc: f9401be8     	ldr	x8, [sp, #0x30]
 4654d00: d37be901     	lsl	x1, x8, #5
 4654d04: 96e6d06d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4654d08: f9000ffc     	str	x28, [sp, #0x18]
 4654d0c: b4fffedc     	cbz	x28, 0x4654ce4 <_ChromeMain+0x464fa48>
 4654d10: f9400388     	ldr	x8, [x28]
 4654d14: f940a508     	ldr	x8, [x8, #0x148]
 4654d18: aa1c03e0     	mov	x0, x28
 4654d1c: d63f0100     	blr	x8
 4654d20: 97169ad7     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 4654d24: b4000340     	cbz	x0, 0x4654d8c <_ChromeMain+0x464faf0>
 4654d28: 39408408     	ldrb	w8, [x0, #0x21]
 4654d2c: 34000308     	cbz	w8, 0x4654d8c <_ChromeMain+0x464faf0>
 4654d30: f9401c08     	ldr	x8, [x0, #0x38]
 4654d34: b40002c8     	cbz	x8, 0x4654d8c <_ChromeMain+0x464faf0>
 4654d38: f9402509     	ldr	x9, [x8, #0x48]
 4654d3c: d37df12a     	lsl	x10, x9, #3
 4654d40: b400026a     	cbz	x10, 0x4654d8c <_ChromeMain+0x464faf0>
 4654d44: d2800018     	mov	x24, #0x0               ; =0
 4654d48: d280001c     	mov	x28, #0x0               ; =0
 4654d4c: d280001b     	mov	x27, #0x0               ; =0
 4654d50: f940211a     	ldr	x26, [x8, #0x40]
 4654d54: 8b090f55     	add	x21, x26, x9, lsl #3
 4654d58: 52800309     	mov	w9, #0x18               ; =24
 4654d5c: b201f3ea     	mov	x10, #-0x5555555555555556 ; =-6148914691236517206
 4654d60: f2e1554a     	movk	x10, #0xaaa, lsl #48
 4654d64: b200f3eb     	mov	x11, #0x5555555555555555 ; =6148914691236517205
 4654d68: f2e0aaab     	movk	x11, #0x555, lsl #48
 4654d6c: b201f3ec     	mov	x12, #-0x5555555555555556 ; =-6148914691236517206
 4654d70: f295556c     	movk	x12, #0xaaab
 4654d74: f9400357     	ldr	x23, [x26]
 4654d78: b5002b17     	cbnz	x23, 0x46552d8 <_ChromeMain+0x465003c>
 4654d7c: 9100235a     	add	x26, x26, #0x8
 4654d80: eb15035f     	cmp	x26, x21
 4654d84: 54ffff81     	b.ne	0x4654d74 <_ChromeMain+0x464fad8>
 4654d88: 14000004     	b	0x4654d98 <_ChromeMain+0x464fafc>
 4654d8c: d2800018     	mov	x24, #0x0               ; =0
 4654d90: d280001c     	mov	x28, #0x0               ; =0
 4654d94: d280001b     	mov	x27, #0x0               ; =0
 4654d98: f941fac8     	ldr	x8, [x22, #0x3f0]
 4654d9c: f941f6d5     	ldr	x21, [x22, #0x3e8]
 4654da0: eb1c011f     	cmp	x8, x28
 4654da4: 540008e1     	b.ne	0x4654ec0 <_ChromeMain+0x464fc24>
 4654da8: 8b080509     	add	x9, x8, x8, lsl #1
 4654dac: d37df12a     	lsl	x10, x9, #3
 4654db0: b40009aa     	cbz	x10, 0x4654ee4 <_ChromeMain+0x464fc48>
 4654db4: 8b090ea9     	add	x9, x21, x9, lsl #3
 4654db8: aa1503ea     	mov	x10, x21
 4654dbc: aa1803eb     	mov	x11, x24
 4654dc0: 14000005     	b	0x4654dd4 <_ChromeMain+0x464fb38>
 4654dc4: 9100614a     	add	x10, x10, #0x18
 4654dc8: 9100616b     	add	x11, x11, #0x18
 4654dcc: eb09015f     	cmp	x10, x9
 4654dd0: 540008a0     	b.eq	0x4654ee4 <_ChromeMain+0x464fc48>
 4654dd4: 39405d4c     	ldrb	w12, [x10, #0x17]
 4654dd8: 13001d8e     	sxtb	w14, w12
 4654ddc: f940054d     	ldr	x13, [x10, #0x8]
 4654de0: 710001df     	cmp	w14, #0x0
 4654de4: 9a8c41ac     	csel	x12, x13, x12, mi
 4654de8: 39405d6f     	ldrb	w15, [x11, #0x17]
 4654dec: 13001ded     	sxtb	w13, w15
 4654df0: f9400570     	ldr	x16, [x11, #0x8]
 4654df4: 710001bf     	cmp	w13, #0x0
 4654df8: 9a8f420f     	csel	x15, x16, x15, mi
 4654dfc: eb0f019f     	cmp	x12, x15
 4654e00: 54000601     	b.ne	0x4654ec0 <_ChromeMain+0x464fc24>
 4654e04: b4fffe0c     	cbz	x12, 0x4654dc4 <_ChromeMain+0x464fb28>
 4654e08: f940016f     	ldr	x15, [x11]
 4654e0c: 710001bf     	cmp	w13, #0x0
 4654e10: 9a8b41ed     	csel	x13, x15, x11, mi
 4654e14: f940014f     	ldr	x15, [x10]
 4654e18: 710001df     	cmp	w14, #0x0
 4654e1c: 9a8a41ee     	csel	x14, x15, x10, mi
 4654e20: 784025cf     	ldrh	w15, [x14], #0x2
 4654e24: 784025b0     	ldrh	w16, [x13], #0x2
 4654e28: 6b0f021f     	cmp	w16, w15
 4654e2c: 540004a1     	b.ne	0x4654ec0 <_ChromeMain+0x464fc24>
 4654e30: f100058c     	subs	x12, x12, #0x1
 4654e34: 54ffff61     	b.ne	0x4654e20 <_ChromeMain+0x464fb84>
 4654e38: 17ffffe3     	b	0x4654dc4 <_ChromeMain+0x464fb28>
 4654e3c: 54000223     	b.lo	0x4654e80 <_ChromeMain+0x464fbe4>
 4654e40: f94006b5     	ldr	x21, [x21, #0x8]
 4654e44: b4000235     	cbz	x21, 0x4654e88 <_ChromeMain+0x464fbec>
 4654e48: aa1503e8     	mov	x8, x21
 4654e4c: f8420d09     	ldr	x9, [x8, #0x20]!
 4654e50: 39805d0a     	ldrsb	x10, [x8, #0x17]
 4654e54: f100015f     	cmp	x10, #0x0
 4654e58: 9a884121     	csel	x1, x9, x8, mi
 4654e5c: f9400508     	ldr	x8, [x8, #0x8]
 4654e60: 7100015f     	cmp	w10, #0x0
 4654e64: 9a8a411a     	csel	x26, x8, x10, mi
 4654e68: eb19035f     	cmp	x26, x25
 4654e6c: 9a993342     	csel	x2, x26, x25, lo
 4654e70: aa1803e0     	mov	x0, x24
 4654e74: 94e6d27b     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4654e78: 34000fc0     	cbz	w0, 0x4655070 <_ChromeMain+0x464fdd4>
 4654e7c: 36fffe20     	tbz	w0, #0x1f, 0x4654e40 <_ChromeMain+0x464fba4>
 4654e80: f94002b5     	ldr	x21, [x21]
 4654e84: b5fffe35     	cbnz	x21, 0x4654e48 <_ChromeMain+0x464fbac>
 4654e88: aa1603e0     	mov	x0, x22
 4654e8c: 94000fac     	bl	0x4658d3c <_ChromeMain+0x4653aa0>
