
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4255868: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 425586c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4255870: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4255874: a90357f6     	stp	x22, x21, [sp, #0x30]
 4255878: a9044ff4     	stp	x20, x19, [sp, #0x40]
 425587c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4255880: 910143fd     	add	x29, sp, #0x50
 4255884: d10b83ff     	sub	sp, sp, #0x2e0
 4255888: aa0403fa     	mov	x26, x4
 425588c: aa0303f9     	mov	x25, x3
 4255890: aa0203f4     	mov	x20, x2
 4255894: aa0103f5     	mov	x21, x1
 4255898: aa0003f6     	mov	x22, x0
 425589c: aa0803f3     	mov	x19, x8
 42558a0: f004ee88     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 42558a4: f940f908     	ldr	x8, [x8, #0x1f0]
 42558a8: f9400108     	ldr	x8, [x8]
 42558ac: f81983a8     	stur	x8, [x29, #-0x68]
 42558b0: 6f00e400     	movi.2d	v0, #0000000000000000
 42558b4: ad070260     	stp	q0, q0, [x19, #0xe0]
 42558b8: ad060260     	stp	q0, q0, [x19, #0xc0]
 42558bc: ad050260     	stp	q0, q0, [x19, #0xa0]
 42558c0: ad040260     	stp	q0, q0, [x19, #0x80]
 42558c4: ad030260     	stp	q0, q0, [x19, #0x60]
 42558c8: ad020260     	stp	q0, q0, [x19, #0x40]
 42558cc: ad010260     	stp	q0, q0, [x19, #0x20]
 42558d0: ad000260     	stp	q0, q0, [x19]
 42558d4: 52800400     	mov	w0, #0x20               ; =32
 42558d8: 96f6e6a4     	bl	0xf368 <_ChromeMain+0xa0cc>
 42558dc: f9000660     	str	x0, [x19, #0x8]
 42558e0: d004e728     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 42558e4: 3dc10500     	ldr	q0, [x8, #0x410]
 42558e8: 3d800660     	str	q0, [x19, #0x10]
 42558ec: 91007809     	add	x9, x0, #0x1e
 42558f0: eb00013f     	cmp	x9, x0
 42558f4: 540043c3     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42558f8: f0046588     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42558fc: 91034508     	add	x8, x8, #0xd1
 4255900: eb08013f     	cmp	x9, x8
 4255904: fa488002     	ccmp	x0, x8, #0x2, hi
 4255908: 54004329     	b.ls	0x425616c <_ChromeMain+0x4250ed0>
 425590c: 3dc00100     	ldr	q0, [x8]
 4255910: 3d800000     	str	q0, [x0]
 4255914: 3cc0e100     	ldur	q0, [x8, #0xe]
 4255918: 3c80e000     	stur	q0, [x0, #0xe]
 425591c: 3900781f     	strb	wzr, [x0, #0x1e]
 4255920: 6f00e400     	movi.2d	v0, #0000000000000000
 4255924: aa1303f7     	mov	x23, x19
 4255928: 3c820ee0     	str	q0, [x23, #0x20]!
 425592c: aa1703f8     	mov	x24, x23
 4255930: 3c830f00     	str	q0, [x24, #0x30]!
 4255934: 910062fb     	add	x27, x23, #0x18
 4255938: 390362ff     	strb	wzr, [x23, #0xd8]
 425593c: ad0082e0     	stp	q0, q0, [x23, #0x10]
 4255940: ad0202e0     	stp	q0, q0, [x23, #0x40]
 4255944: ad0302e0     	stp	q0, q0, [x23, #0x60]
 4255948: ad0402e0     	stp	q0, q0, [x23, #0x80]
 425594c: 3c8992e0     	stur	q0, [x23, #0x99]
 4255950: eb1402ff     	cmp	x23, x20
 4255954: 540000e0     	b.eq	0x4255970 <_ChromeMain+0x42506d4>
 4255958: 39c05e88     	ldrsb	w8, [x20, #0x17]
 425595c: 37f81a68     	tbnz	w8, #0x1f, 0x4255ca8 <_ChromeMain+0x4250a0c>
 4255960: 3dc00280     	ldr	q0, [x20]
 4255964: 3d8002e0     	str	q0, [x23]
 4255968: f9400a88     	ldr	x8, [x20, #0x10]
 425596c: f9000ae8     	str	x8, [x23, #0x10]
 4255970: eb19037f     	cmp	x27, x25
 4255974: 54000120     	b.eq	0x4255998 <_ChromeMain+0x42506fc>
 4255978: 39c13e69     	ldrsb	w9, [x19, #0x4f]
 425597c: 39405f28     	ldrb	w8, [x25, #0x17]
 4255980: 37f8d0c9     	tbnz	w9, #0x1f, 0x4257398 <_ChromeMain+0x42520fc>
 4255984: 37381328     	tbnz	w8, #0x7, 0x4255be8 <_ChromeMain+0x425094c>
 4255988: 3dc00320     	ldr	q0, [x25]
 425598c: 3d800360     	str	q0, [x27]
 4255990: f9400b28     	ldr	x8, [x25, #0x10]
 4255994: f9000b68     	str	x8, [x27, #0x10]
 4255998: a907ffff     	stp	xzr, xzr, [sp, #0x78]
 425599c: f90047ff     	str	xzr, [sp, #0x88]
 42559a0: 9105c3e8     	add	x8, sp, #0x170
 42559a4: aa1603e0     	mov	x0, x22
 42559a8: 940029d5     	bl	0x42600fc <_ChromeMain+0x425ae60>
 42559ac: 39805ea2     	ldrsb	x2, [x21, #0x17]
 42559b0: b7f81782     	tbnz	x2, #0x3f, 0x4255ca0 <_ChromeMain+0x4250a04>
 42559b4: aa1503e1     	mov	x1, x21
 42559b8: 9101e3e8     	add	x8, sp, #0x78
 42559bc: 9105c3e0     	add	x0, sp, #0x170
 42559c0: 97510e95     	bl	0x1699414 <_ChromeMain+0x1694178>
 42559c4: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 42559c8: 37f81068     	tbnz	w8, #0x1f, 0x4255bd4 <_ChromeMain+0x4250938>
 42559cc: 9101e3e0     	add	x0, sp, #0x78
 42559d0: 977b37fc     	bl	0x21239c0 <_ChromeMain+0x211e724>
 42559d4: 36002e40     	tbz	w0, #0x0, 0x4255f9c <_ChromeMain+0x4250d00>
 42559d8: 910243fb     	add	x27, sp, #0x90
 42559dc: 6f00e400     	movi.2d	v0, #0000000000000000
 42559e0: ad060360     	stp	q0, q0, [x27, #0xc0]
 42559e4: ad050360     	stp	q0, q0, [x27, #0xa0]
 42559e8: ad040360     	stp	q0, q0, [x27, #0x80]
 42559ec: 71000adf     	cmp	w22, #0x2
 42559f0: f90003f5     	str	x21, [sp]
 42559f4: 54000080     	b.eq	0x4255a04 <_ChromeMain+0x4250768>
 42559f8: 9101e3e0     	add	x0, sp, #0x78
 42559fc: 94000f25     	bl	0x4259690 <_ChromeMain+0x42543f4>
 4255a00: 3500a660     	cbnz	w0, 0x4256ecc <_ChromeMain+0x4251c30>
 4255a04: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 4255a08: f9003bff     	str	xzr, [sp, #0x70]
 4255a0c: 910183e8     	add	x8, sp, #0x60
 4255a10: 9101e3e0     	add	x0, sp, #0x78
 4255a14: 94001032     	bl	0x4259adc <_ChromeMain+0x4254840>
 4255a18: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 4255a1c: f9002fff     	str	xzr, [sp, #0x58]
 4255a20: 910123e8     	add	x8, sp, #0x48
 4255a24: 9101e3e0     	add	x0, sp, #0x78
 4255a28: 910183e1     	add	x1, sp, #0x60
 4255a2c: 94001131     	bl	0x4259ef0 <_ChromeMain+0x4254c54>
 4255a30: 9100c3e8     	add	x8, sp, #0x30
 4255a34: 9100211a     	add	x26, x8, #0x8
 4255a38: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 4255a3c: f9001bfa     	str	x26, [sp, #0x30]
 4255a40: f9402be8     	ldr	x8, [sp, #0x50]
 4255a44: 8b080d08     	add	x8, x8, x8, lsl #3
 4255a48: d37ced1c     	lsl	x28, x8, #4
 4255a4c: b400013c     	cbz	x28, 0x4255a70 <_ChromeMain+0x42507d4>
 4255a50: f94027fb     	ldr	x27, [sp, #0x48]
 4255a54: 9100c3e0     	add	x0, sp, #0x30
 4255a58: 9100c3e1     	add	x1, sp, #0x30
 4255a5c: aa1b03e2     	mov	x2, x27
 4255a60: 9732e2c8     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 4255a64: 9102437b     	add	x27, x27, #0x90
 4255a68: f102439c     	subs	x28, x28, #0x90
 4255a6c: 54ffff41     	b.ne	0x4255a54 <_ChromeMain+0x42507b8>
 4255a70: 910063e8     	add	x8, sp, #0x18
 4255a74: 91002115     	add	x21, x8, #0x8
 4255a78: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4255a7c: f9000ff5     	str	x21, [sp, #0x18]
 4255a80: f9403be8     	ldr	x8, [sp, #0x70]
 4255a84: b40001c8     	cbz	x8, 0x4255abc <_ChromeMain+0x4250820>
 4255a88: f94037e1     	ldr	x1, [sp, #0x68]
 4255a8c: 910063e0     	add	x0, sp, #0x18
 4255a90: 910063e2     	add	x2, sp, #0x18
 4255a94: 973969ed     	bl	0x10b0248 <_ChromeMain+0x10aafac>
 4255a98: f90013e0     	str	x0, [sp, #0x20]
 4255a9c: f9000815     	str	x21, [x0, #0x10]
 4255aa0: f94013e8     	ldr	x8, [sp, #0x20]
 4255aa4: aa0803e9     	mov	x9, x8
 4255aa8: f9400108     	ldr	x8, [x8]
 4255aac: b5ffffc8     	cbnz	x8, 0x4255aa4 <_ChromeMain+0x4250808>
 4255ab0: f9403be8     	ldr	x8, [sp, #0x70]
 4255ab4: f9000fe9     	str	x9, [sp, #0x18]
 4255ab8: f90017e8     	str	x8, [sp, #0x28]
 4255abc: f9401be1     	ldr	x1, [sp, #0x30]
 4255ac0: 910063e0     	add	x0, sp, #0x18
 4255ac4: aa1a03e2     	mov	x2, x26
 4255ac8: 97a4dfb3     	bl	0x2b8d994 <_ChromeMain+0x2b886f8>
 4255acc: aa1403e0     	mov	x0, x20
 4255ad0: 97c06116     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 4255ad4: 9101e3e0     	add	x0, sp, #0x78
 4255ad8: 9101e3e1     	add	x1, sp, #0x78
 4255adc: 910183e3     	add	x3, sp, #0x60
 4255ae0: 9100c3e4     	add	x4, sp, #0x30
 4255ae4: aa1403e2     	mov	x2, x20
 4255ae8: 94001e54     	bl	0x425d438 <_ChromeMain+0x425819c>
 4255aec: 360015e0     	tbz	w0, #0x0, 0x4255da8 <_ChromeMain+0x4250b0c>
 4255af0: f004c5e1     	adrp	x1, 0xdb14000 <dyld_stub_binder+0xdb14000>
 4255af4: 9100a421     	add	x1, x1, #0x29
 4255af8: 9105c3e8     	add	x8, sp, #0x170
 4255afc: aa1403e0     	mov	x0, x20
 4255b00: 52800162     	mov	w2, #0xb                ; =11
 4255b04: 97510e44     	bl	0x1699414 <_ChromeMain+0x1694178>
 4255b08: 9105c3e0     	add	x0, sp, #0x170
 4255b0c: 910183e3     	add	x3, sp, #0x60
 4255b10: 910063e4     	add	x4, sp, #0x18
 4255b14: aa1603e1     	mov	x1, x22
 4255b18: aa1903e2     	mov	x2, x25
 4255b1c: 940022bb     	bl	0x425e608 <_ChromeMain+0x425936c>
 4255b20: 36000ec0     	tbz	w0, #0x0, 0x4255cf8 <_ChromeMain+0x4250a5c>
 4255b24: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255b28: 91145421     	add	x1, x1, #0x515
 4255b2c: d10243a8     	sub	x8, x29, #0x90
 4255b30: aa1403e0     	mov	x0, x20
 4255b34: 52800242     	mov	w2, #0x12               ; =18
 4255b38: 97510e37     	bl	0x1699414 <_ChromeMain+0x1694178>
 4255b3c: d10243a0     	sub	x0, x29, #0x90
 4255b40: 910183e3     	add	x3, sp, #0x60
 4255b44: 910063e4     	add	x4, sp, #0x18
 4255b48: aa1603e1     	mov	x1, x22
 4255b4c: d2800002     	mov	x2, #0x0                ; =0
 4255b50: 940022ae     	bl	0x425e608 <_ChromeMain+0x425936c>
 4255b54: aa0003f9     	mov	x25, x0
 4255b58: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4255b5c: 37f80ae8     	tbnz	w8, #0x1f, 0x4255cb8 <_ChromeMain+0x4250a1c>
 4255b60: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4255b64: 910243fa     	add	x26, sp, #0x90
 4255b68: f94003f5     	ldr	x21, [sp]
 4255b6c: 37f80b08     	tbnz	w8, #0x1f, 0x4255ccc <_ChromeMain+0x4250a30>
 4255b70: 36000c99     	tbz	w25, #0x0, 0x4255d00 <_ChromeMain+0x4250a64>
 4255b74: 34003096     	cbz	w22, 0x4256184 <_ChromeMain+0x4250ee8>
 4255b78: a90dffff     	stp	xzr, xzr, [sp, #0xd8]
 4255b7c: f90077ff     	str	xzr, [sp, #0xe8]
 4255b80: b0046501     	adrp	x1, 0xcef6000 <dyld_stub_binder+0xcef6000>
 4255b84: 91169421     	add	x1, x1, #0x5a5
 4255b88: 910363e8     	add	x8, sp, #0xd8
 4255b8c: aa1403e0     	mov	x0, x20
 4255b90: 52800162     	mov	w2, #0xb                ; =11
 4255b94: 97510e20     	bl	0x1699414 <_ChromeMain+0x1694178>
 4255b98: 6f00e400     	movi.2d	v0, #0000000000000000
 4255b9c: d10243a8     	sub	x8, x29, #0x90
 4255ba0: ad000100     	stp	q0, q0, [x8]
 4255ba4: d10243bb     	sub	x27, x29, #0x90
 4255ba8: a9177fff     	stp	xzr, xzr, [sp, #0x170]
 4255bac: f900c3ff     	str	xzr, [sp, #0x180]
 4255bb0: 9105c3f5     	add	x21, sp, #0x170
 4255bb4: 910363e0     	add	x0, sp, #0xd8
 4255bb8: 9105c3e1     	add	x1, sp, #0x170
 4255bbc: 92800002     	mov	x2, #-0x1               ; =-1
 4255bc0: 9774f3f2     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4255bc4: 370001a0     	tbnz	w0, #0x0, 0x4255bf8 <_ChromeMain+0x425095c>
 4255bc8: 381703bf     	sturb	wzr, [x29, #-0x90]
 4255bcc: 381883bf     	sturb	wzr, [x29, #-0x78]
 4255bd0: 14000014     	b	0x4255c20 <_ChromeMain+0x4250984>
 4255bd4: f940bbe0     	ldr	x0, [sp, #0x170]
 4255bd8: f940c3e8     	ldr	x8, [sp, #0x180]
 4255bdc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255be0: 96f6ccb6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255be4: 17ffff7a     	b	0x42559cc <_ChromeMain+0x4250730>
 4255be8: a9400b21     	ldp	x1, x2, [x25]
 4255bec: 910062e0     	add	x0, x23, #0x18
 4255bf0: 9719e2bf     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4255bf4: 17ffff69     	b	0x4255998 <_ChromeMain+0x42506fc>
 4255bf8: 39861fe8     	ldrsb	x8, [sp, #0x187]
 4255bfc: a9572be9     	ldp	x9, x10, [sp, #0x170]
 4255c00: f100011f     	cmp	x8, #0x0
 4255c04: 9a954120     	csel	x0, x9, x21, mi
 4255c08: 7100011f     	cmp	w8, #0x0
 4255c0c: 9a884141     	csel	x1, x10, x8, mi
 4255c10: d10243a8     	sub	x8, x29, #0x90
 4255c14: 52800002     	mov	w2, #0x0                ; =0
 4255c18: 52801903     	mov	w3, #0xc8               ; =200
 4255c1c: 9765b0c8     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4255c20: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4255c24: 36f800a8     	tbz	w8, #0x1f, 0x4255c38 <_ChromeMain+0x425099c>
 4255c28: f940bbe0     	ldr	x0, [sp, #0x170]
 4255c2c: f940c3e8     	ldr	x8, [sp, #0x180]
 4255c30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255c34: 96f6cca1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255c38: 385883a8     	ldurb	w8, [x29, #-0x78]
 4255c3c: 360045a8     	tbz	w8, #0x0, 0x42564f0 <_ChromeMain+0x4251254>
 4255c40: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 4255c44: f9006bff     	str	xzr, [sp, #0xd0]
 4255c48: b0046501     	adrp	x1, 0xcef6000 <dyld_stub_binder+0xcef6000>
 4255c4c: 9116c421     	add	x1, x1, #0x5b1
 4255c50: 910303e8     	add	x8, sp, #0xc0
 4255c54: aa1403e0     	mov	x0, x20
 4255c58: 52800242     	mov	w2, #0x12               ; =18
 4255c5c: 97510dee     	bl	0x1699414 <_ChromeMain+0x1694178>
 4255c60: 910303e0     	add	x0, sp, #0xc0
 4255c64: 977f39f7     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4255c68: 340035c0     	cbz	w0, 0x4256320 <_ChromeMain+0x4251084>
 4255c6c: 6f00e400     	movi.2d	v0, #0000000000000000
 4255c70: ad070340     	stp	q0, q0, [x26, #0xe0]
 4255c74: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 4255c78: f90083ff     	str	xzr, [sp, #0x100]
 4255c7c: 9103c3f5     	add	x21, sp, #0xf0
 4255c80: 910303e0     	add	x0, sp, #0xc0
 4255c84: 9103c3e1     	add	x1, sp, #0xf0
 4255c88: 92800002     	mov	x2, #-0x1               ; =-1
 4255c8c: 9774f3bf     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4255c90: 37003b40     	tbnz	w0, #0x0, 0x42563f8 <_ChromeMain+0x425115c>
 4255c94: 3905c3ff     	strb	wzr, [sp, #0x170]
 4255c98: 390623ff     	strb	wzr, [sp, #0x188]
 4255c9c: 140001e1     	b	0x4256420 <_ChromeMain+0x4251184>
 4255ca0: a9400aa1     	ldp	x1, x2, [x21]
 4255ca4: 17ffff45     	b	0x42559b8 <_ChromeMain+0x425071c>
 4255ca8: a9400a81     	ldp	x1, x2, [x20]
 4255cac: aa1703e0     	mov	x0, x23
 4255cb0: 97094b81     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4255cb4: 17ffff2f     	b	0x4255970 <_ChromeMain+0x42506d4>
 4255cb8: f85703a0     	ldur	x0, [x29, #-0x90]
 4255cbc: f85803a8     	ldur	x8, [x29, #-0x80]
 4255cc0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255cc4: 96f6cc7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255cc8: 17ffffa6     	b	0x4255b60 <_ChromeMain+0x42508c4>
 4255ccc: f940bbe0     	ldr	x0, [sp, #0x170]
 4255cd0: f940c3e8     	ldr	x8, [sp, #0x180]
 4255cd4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255cd8: 96f6cc78     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255cdc: 3707f4d9     	tbnz	w25, #0x0, 0x4255b74 <_ChromeMain+0x42508d8>
 4255ce0: 14000008     	b	0x4255d00 <_ChromeMain+0x4250a64>
 4255ce4: f940bbe0     	ldr	x0, [sp, #0x170]
 4255ce8: f940c3e8     	ldr	x8, [sp, #0x180]
 4255cec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255cf0: 96f6cc72     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255cf4: 14000003     	b	0x4255d00 <_ChromeMain+0x4250a64>
 4255cf8: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4255cfc: 37ffff48     	tbnz	w8, #0x1f, 0x4255ce4 <_ChromeMain+0x4250a48>
 4255d00: f0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4255d04: b940b108     	ldr	w8, [x8, #0xb0]
 4255d08: 7100091f     	cmp	w8, #0x2
 4255d0c: 54000e4c     	b.gt	0x4255ed4 <_ChromeMain+0x4250c38>
 4255d10: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255d14: 91080821     	add	x1, x1, #0x202
 4255d18: 9105c3f3     	add	x19, sp, #0x170
 4255d1c: 9105c3e0     	add	x0, sp, #0x170
 4255d20: 5280efc2     	mov	w2, #0x77e              ; =1918
 4255d24: 52800043     	mov	w3, #0x2                ; =2
 4255d28: 970ecd09     	bl	0x60914c <_ChromeMain+0x603eb0>
 4255d2c: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255d30: 9121dc21     	add	x1, x1, #0x877
 4255d34: 91004260     	add	x0, x19, #0x10
 4255d38: 52800302     	mov	w2, #0x18               ; =24
 4255d3c: 96f73de0     	bl	0x254bc <_ChromeMain+0x20220>
 4255d40: aa0003f3     	mov	x19, x0
 4255d44: 9103c3f5     	add	x21, sp, #0xf0
 4255d48: 9103c3e8     	add	x8, sp, #0xf0
 4255d4c: aa1603e0     	mov	x0, x22
 4255d50: 94002850     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4255d54: 39841fe8     	ldrsb	x8, [sp, #0x107]
 4255d58: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4255d5c: f100011f     	cmp	x8, #0x0
 4255d60: 9a954120     	csel	x0, x9, x21, mi
 4255d64: 7100011f     	cmp	w8, #0x0
 4255d68: 9a884141     	csel	x1, x10, x8, mi
 4255d6c: d10243b5     	sub	x21, x29, #0x90
 4255d70: d10243a8     	sub	x8, x29, #0x90
 4255d74: 973533e5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4255d78: 389873a8     	ldursb	x8, [x29, #-0x79]
 4255d7c: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 4255d80: f100011f     	cmp	x8, #0x0
 4255d84: 9a954121     	csel	x1, x9, x21, mi
 4255d88: 7100011f     	cmp	w8, #0x0
 4255d8c: 9a884142     	csel	x2, x10, x8, mi
 4255d90: aa1303e0     	mov	x0, x19
 4255d94: 96f73dca     	bl	0x254bc <_ChromeMain+0x20220>
 4255d98: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255d9c: 91224021     	add	x1, x1, #0x890
 4255da0: 528001a2     	mov	w2, #0xd                ; =13
 4255da4: 1400003d     	b	0x4255e98 <_ChromeMain+0x4250bfc>
 4255da8: f0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4255dac: b940b108     	ldr	w8, [x8, #0xb0]
 4255db0: 7100091f     	cmp	w8, #0x2
 4255db4: 5400090c     	b.gt	0x4255ed4 <_ChromeMain+0x4250c38>
 4255db8: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255dbc: 91080821     	add	x1, x1, #0x202
 4255dc0: 9105c3f3     	add	x19, sp, #0x170
 4255dc4: 9105c3e0     	add	x0, sp, #0x170
 4255dc8: 5280ede2     	mov	w2, #0x76f              ; =1903
 4255dcc: 52800043     	mov	w3, #0x2                ; =2
 4255dd0: 970eccdf     	bl	0x60914c <_ChromeMain+0x603eb0>
 4255dd4: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255dd8: 91214c21     	add	x1, x1, #0x853
 4255ddc: 91004260     	add	x0, x19, #0x10
 4255de0: 528001e2     	mov	w2, #0xf                ; =15
 4255de4: 96f73db6     	bl	0x254bc <_ChromeMain+0x20220>
 4255de8: aa0003f3     	mov	x19, x0
 4255dec: 9103c3f5     	add	x21, sp, #0xf0
 4255df0: 9103c3e8     	add	x8, sp, #0xf0
 4255df4: aa1603e0     	mov	x0, x22
 4255df8: 94002826     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4255dfc: 39841fe8     	ldrsb	x8, [sp, #0x107]
 4255e00: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4255e04: f100011f     	cmp	x8, #0x0
 4255e08: 9a954120     	csel	x0, x9, x21, mi
 4255e0c: 7100011f     	cmp	w8, #0x0
 4255e10: 9a884141     	csel	x1, x10, x8, mi
 4255e14: d10243b5     	sub	x21, x29, #0x90
 4255e18: d10243a8     	sub	x8, x29, #0x90
 4255e1c: 973533bb     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4255e20: 389873a8     	ldursb	x8, [x29, #-0x79]
 4255e24: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 4255e28: f100011f     	cmp	x8, #0x0
 4255e2c: 9a954121     	csel	x1, x9, x21, mi
 4255e30: 7100011f     	cmp	w8, #0x0
 4255e34: 9a884142     	csel	x2, x10, x8, mi
 4255e38: aa1303e0     	mov	x0, x19
 4255e3c: 96f73da0     	bl	0x254bc <_ChromeMain+0x20220>
 4255e40: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255e44: 91218c21     	add	x1, x1, #0x863
 4255e48: 52800262     	mov	w2, #0x13               ; =19
 4255e4c: 96f73d9c     	bl	0x254bc <_ChromeMain+0x20220>
 4255e50: 39823fe8     	ldrsb	x8, [sp, #0x8f]
 4255e54: 9101e3e9     	add	x9, sp, #0x78
 4255e58: a947afea     	ldp	x10, x11, [sp, #0x78]
 4255e5c: f100011f     	cmp	x8, #0x0
 4255e60: 9a894141     	csel	x1, x10, x9, mi
 4255e64: 7100011f     	cmp	w8, #0x0
 4255e68: 9a884162     	csel	x2, x11, x8, mi
 4255e6c: 96f73d94     	bl	0x254bc <_ChromeMain+0x20220>
 4255e70: d004ad61     	adrp	x1, 0xd803000 <dyld_stub_binder+0xd803000>
 4255e74: 91258021     	add	x1, x1, #0x960
 4255e78: 52800082     	mov	w2, #0x4                ; =4
 4255e7c: 96f73d90     	bl	0x254bc <_ChromeMain+0x20220>
 4255e80: 39805e88     	ldrsb	x8, [x20, #0x17]
 4255e84: a9402a89     	ldp	x9, x10, [x20]
 4255e88: f100011f     	cmp	x8, #0x0
 4255e8c: 9a944121     	csel	x1, x9, x20, mi
 4255e90: 7100011f     	cmp	w8, #0x0
 4255e94: 9a884142     	csel	x2, x10, x8, mi
 4255e98: 96f73d89     	bl	0x254bc <_ChromeMain+0x20220>
 4255e9c: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4255ea0: 36f800a8     	tbz	w8, #0x1f, 0x4255eb4 <_ChromeMain+0x4250c18>
 4255ea4: f85703a0     	ldur	x0, [x29, #-0x90]
 4255ea8: f85803a8     	ldur	x8, [x29, #-0x80]
 4255eac: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255eb0: 96f6cc02     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255eb4: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4255eb8: 36f800a8     	tbz	w8, #0x1f, 0x4255ecc <_ChromeMain+0x4250c30>
 4255ebc: f9407be0     	ldr	x0, [sp, #0xf0]
 4255ec0: f94083e8     	ldr	x8, [sp, #0x100]
 4255ec4: d37ff901     	lsl	x1, x8, #1
 4255ec8: 96f6cbfc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255ecc: 9105c3e0     	add	x0, sp, #0x170
 4255ed0: 970ecc6c     	bl	0x609080 <_ChromeMain+0x603de4>
 4255ed4: aa1403e0     	mov	x0, x20
 4255ed8: 97c06014     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 4255edc: f94013e1     	ldr	x1, [sp, #0x20]
 4255ee0: 910063e8     	add	x8, sp, #0x18
 4255ee4: f900bbe8     	str	x8, [sp, #0x170]
 4255ee8: 9105c3e0     	add	x0, sp, #0x170
 4255eec: 97132af0     	bl	0x720aac <_ChromeMain+0x71b810>
 4255ef0: f9401fe1     	ldr	x1, [sp, #0x38]
 4255ef4: 9100c3e8     	add	x8, sp, #0x30
 4255ef8: f900bbe8     	str	x8, [sp, #0x170]
 4255efc: 9105c3e0     	add	x0, sp, #0x170
 4255f00: 97132aeb     	bl	0x720aac <_ChromeMain+0x71b810>
 4255f04: f94027f3     	ldr	x19, [sp, #0x48]
 4255f08: b4001033     	cbz	x19, 0x425610c <_ChromeMain+0x4250e70>
 4255f0c: f9402be8     	ldr	x8, [sp, #0x50]
 4255f10: 8b080d08     	add	x8, x8, x8, lsl #3
 4255f14: d37ced14     	lsl	x20, x8, #4
 4255f18: b40003f4     	cbz	x20, 0x4255f94 <_ChromeMain+0x4250cf8>
 4255f1c: d2800015     	mov	x21, #0x0               ; =0
 4255f20: aa1303f6     	mov	x22, x19
 4255f24: 14000009     	b	0x4255f48 <_ChromeMain+0x4250cac>
 4255f28: f94002e0     	ldr	x0, [x23]
 4255f2c: f8580108     	ldur	x8, [x8, #-0x80]
 4255f30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255f34: 96f6cbe1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255f38: d10242d6     	sub	x22, x22, #0x90
 4255f3c: 910242b5     	add	x21, x21, #0x90
 4255f40: eb15029f     	cmp	x20, x21
 4255f44: 54000ca0     	b.eq	0x42560d8 <_ChromeMain+0x4250e3c>
 4255f48: 8b1402d8     	add	x24, x22, x20
 4255f4c: f1024317     	subs	x23, x24, #0x90
 4255f50: 540010e0     	b.eq	0x425616c <_ChromeMain+0x4250ed0>
 4255f54: d1002300     	sub	x0, x24, #0x8
 4255f58: d2800001     	mov	x1, #0x0                ; =0
 4255f5c: 96f74757     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4255f60: d1016300     	sub	x0, x24, #0x58
 4255f64: 96f74745     	bl	0x27c78 <_ChromeMain+0x229dc>
 4255f68: 38d9f308     	ldursb	w8, [x24, #-0x61]
 4255f6c: 36f800c8     	tbz	w8, #0x1f, 0x4255f84 <_ChromeMain+0x4250ce8>
 4255f70: 8b1402c8     	add	x8, x22, x20
 4255f74: f8588100     	ldur	x0, [x8, #-0x78]
 4255f78: f8598108     	ldur	x8, [x8, #-0x68]
 4255f7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255f80: 96f6cbce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255f84: 8b1402c8     	add	x8, x22, x20
 4255f88: 38d87109     	ldursb	w9, [x8, #-0x79]
 4255f8c: 36fffd69     	tbz	w9, #0x1f, 0x4255f38 <_ChromeMain+0x4250c9c>
 4255f90: 17ffffe6     	b	0x4255f28 <_ChromeMain+0x4250c8c>
 4255f94: aa1303e0     	mov	x0, x19
 4255f98: 14000051     	b	0x42560dc <_ChromeMain+0x4250e40>
 4255f9c: f0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4255fa0: b940b108     	ldr	w8, [x8, #0xb0]
 4255fa4: 7100091f     	cmp	w8, #0x2
 4255fa8: 540006ec     	b.gt	0x4256084 <_ChromeMain+0x4250de8>
 4255fac: d004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4255fb0: 91080821     	add	x1, x1, #0x202
 4255fb4: 9105c3f3     	add	x19, sp, #0x170
 4255fb8: 9105c3e0     	add	x0, sp, #0x170
 4255fbc: 5280e842     	mov	w2, #0x742              ; =1858
 4255fc0: 52800043     	mov	w3, #0x2                ; =2
 4255fc4: 970ecc62     	bl	0x60914c <_ChromeMain+0x603eb0>
 4255fc8: d10243b4     	sub	x20, x29, #0x90
 4255fcc: d10243a8     	sub	x8, x29, #0x90
 4255fd0: aa1603e0     	mov	x0, x22
 4255fd4: 940027af     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4255fd8: 389873a8     	ldursb	x8, [x29, #-0x79]
 4255fdc: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 4255fe0: f100011f     	cmp	x8, #0x0
 4255fe4: 9a944120     	csel	x0, x9, x20, mi
 4255fe8: 7100011f     	cmp	w8, #0x0
 4255fec: 9a884141     	csel	x1, x10, x8, mi
 4255ff0: 910443f4     	add	x20, sp, #0x110
 4255ff4: 910443e8     	add	x8, sp, #0x110
 4255ff8: 97353344     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4255ffc: 39849fe8     	ldrsb	x8, [sp, #0x127]
 4256000: a9512be9     	ldp	x9, x10, [sp, #0x110]
 4256004: f100011f     	cmp	x8, #0x0
 4256008: 9a944121     	csel	x1, x9, x20, mi
 425600c: 7100011f     	cmp	w8, #0x0
 4256010: 9a884142     	csel	x2, x10, x8, mi
 4256014: 91004260     	add	x0, x19, #0x10
 4256018: 96f73d29     	bl	0x254bc <_ChromeMain+0x20220>
 425601c: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256020: 910b8421     	add	x1, x1, #0x2e1
 4256024: 52800462     	mov	w2, #0x23               ; =35
 4256028: 96f73d25     	bl	0x254bc <_ChromeMain+0x20220>
 425602c: 39823fe8     	ldrsb	x8, [sp, #0x8f]
 4256030: 9101e3e9     	add	x9, sp, #0x78
 4256034: a947afea     	ldp	x10, x11, [sp, #0x78]
 4256038: f100011f     	cmp	x8, #0x0
 425603c: 9a894141     	csel	x1, x10, x9, mi
 4256040: 7100011f     	cmp	w8, #0x0
 4256044: 9a884162     	csel	x2, x11, x8, mi
 4256048: 96f73d1d     	bl	0x254bc <_ChromeMain+0x20220>
 425604c: 39c49fe8     	ldrsb	w8, [sp, #0x127]
 4256050: 36f800a8     	tbz	w8, #0x1f, 0x4256064 <_ChromeMain+0x4250dc8>
 4256054: f9408be0     	ldr	x0, [sp, #0x110]
 4256058: f94093e8     	ldr	x8, [sp, #0x120]
 425605c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256060: 96f6cb96     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256064: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4256068: 36f800a8     	tbz	w8, #0x1f, 0x425607c <_ChromeMain+0x4250de0>
 425606c: f85703a0     	ldur	x0, [x29, #-0x90]
 4256070: f85803a8     	ldur	x8, [x29, #-0x80]
 4256074: d37ff901     	lsl	x1, x8, #1
 4256078: 96f6cb90     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425607c: 9105c3e0     	add	x0, sp, #0x170
 4256080: 970ecc00     	bl	0x609080 <_ChromeMain+0x603de4>
 4256084: 39c23fe8     	ldrsb	w8, [sp, #0x8f]
 4256088: 37f801e8     	tbnz	w8, #0x1f, 0x42560c4 <_ChromeMain+0x4250e28>
 425608c: f85983a8     	ldur	x8, [x29, #-0x68]
 4256090: d004ee89     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4256094: f940f929     	ldr	x9, [x9, #0x1f0]
 4256098: f9400129     	ldr	x9, [x9]
 425609c: eb08013f     	cmp	x9, x8
 42560a0: 5400aa21     	b.ne	0x42575e4 <_ChromeMain+0x4252348>
 42560a4: 910b83ff     	add	sp, sp, #0x2e0
 42560a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42560ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42560b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42560b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42560b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42560bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42560c0: d65f03c0     	ret
 42560c4: f9403fe0     	ldr	x0, [sp, #0x78]
 42560c8: f94047e8     	ldr	x8, [sp, #0x88]
 42560cc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42560d0: 96f6cb7a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42560d4: 17ffffee     	b	0x425608c <_ChromeMain+0x4250df0>
 42560d8: f94027e0     	ldr	x0, [sp, #0x48]
 42560dc: cb000268     	sub	x8, x19, x0
 42560e0: 9344fd08     	asr	x8, x8, #4
 42560e4: d291c729     	mov	x9, #0x8e39             ; =36409
 42560e8: f2a71c69     	movk	x9, #0x38e3, lsl #16
 42560ec: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 42560f0: f2f1c709     	movk	x9, #0x8e38, lsl #48
 42560f4: 9b097d08     	mul	x8, x8, x9
 42560f8: f9002be8     	str	x8, [sp, #0x50]
 42560fc: f9402fe8     	ldr	x8, [sp, #0x58]
 4256100: 8b080d08     	add	x8, x8, x8, lsl #3
 4256104: d37ced01     	lsl	x1, x8, #4
 4256108: 96f6cb6c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425610c: f94037e1     	ldr	x1, [sp, #0x68]
 4256110: 910183e8     	add	x8, sp, #0x60
 4256114: f900bbe8     	str	x8, [sp, #0x170]
 4256118: 9105c3e0     	add	x0, sp, #0x170
 425611c: 97132a64     	bl	0x720aac <_ChromeMain+0x71b810>
 4256120: 3945a3e8     	ldrb	w8, [sp, #0x168]
 4256124: 34fffb08     	cbz	w8, 0x4256084 <_ChromeMain+0x4250de8>
 4256128: 394583e8     	ldrb	w8, [sp, #0x160]
 425612c: 360000e8     	tbz	w8, #0x0, 0x4256148 <_ChromeMain+0x4250eac>
 4256130: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 4256134: 36f800a8     	tbz	w8, #0x1f, 0x4256148 <_ChromeMain+0x4250eac>
 4256138: f940a7e0     	ldr	x0, [sp, #0x148]
 425613c: f940afe8     	ldr	x8, [sp, #0x158]
 4256140: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256144: 96f6cb5d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256148: 394503e8     	ldrb	w8, [sp, #0x140]
 425614c: 3607f9c8     	tbz	w8, #0x0, 0x4256084 <_ChromeMain+0x4250de8>
 4256150: 39c4ffe8     	ldrsb	w8, [sp, #0x13f]
 4256154: 36fff988     	tbz	w8, #0x1f, 0x4256084 <_ChromeMain+0x4250de8>
 4256158: f94097e0     	ldr	x0, [sp, #0x128]
 425615c: f9409fe8     	ldr	x8, [sp, #0x138]
 4256160: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256164: 96f6cb55     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256168: 17ffffc7     	b	0x4256084 <_ChromeMain+0x4250de8>
 425616c: d4200020     	brk	#0x1
 4256170: f940bbe0     	ldr	x0, [sp, #0x170]
 4256174: f940c3e8     	ldr	x8, [sp, #0x180]
 4256178: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425617c: 96f6cb4f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256180: 14000012     	b	0x42561c8 <_ChromeMain+0x4250f2c>
 4256184: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4256188: f81803bf     	stur	xzr, [x29, #-0x80]
 425618c: d10243a8     	sub	x8, x29, #0x90
 4256190: aa1503e0     	mov	x0, x21
 4256194: 94000dfc     	bl	0x4259984 <_ChromeMain+0x42546e8>
 4256198: 9004b861     	adrp	x1, 0xd962000 <dyld_stub_binder+0xd962000>
 425619c: 910ca421     	add	x1, x1, #0x329
 42561a0: 9105c3e8     	add	x8, sp, #0x170
 42561a4: aa1403e0     	mov	x0, x20
 42561a8: 52800122     	mov	w2, #0x9                ; =9
 42561ac: 97510c9a     	bl	0x1699414 <_ChromeMain+0x1694178>
 42561b0: 9105c3e0     	add	x0, sp, #0x170
 42561b4: d10243a1     	sub	x1, x29, #0x90
 42561b8: 94005918     	bl	0x426c618 <_ChromeMain+0x426737c>
 42561bc: aa0003f9     	mov	x25, x0
 42561c0: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 42561c4: 37fffd68     	tbnz	w8, #0x1f, 0x4256170 <_ChromeMain+0x4250ed4>
 42561c8: d0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42561cc: b940b108     	ldr	w8, [x8, #0xb0]
 42561d0: 7100091f     	cmp	w8, #0x2
 42561d4: 1a9fd728     	csinc	w8, w25, wzr, le
 42561d8: 370001e8     	tbnz	w8, #0x0, 0x4256214 <_ChromeMain+0x4250f78>
 42561dc: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42561e0: 91080821     	add	x1, x1, #0x202
 42561e4: 9105c3f5     	add	x21, sp, #0x170
 42561e8: 9105c3e0     	add	x0, sp, #0x170
 42561ec: 5280f142     	mov	w2, #0x78a              ; =1930
 42561f0: 52800043     	mov	w3, #0x2                ; =2
 42561f4: 970ecbd6     	bl	0x60914c <_ChromeMain+0x603eb0>
 42561f8: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42561fc: 91227821     	add	x1, x1, #0x89e
 4256200: 910042a0     	add	x0, x21, #0x10
 4256204: 52800622     	mov	w2, #0x31               ; =49
 4256208: 96f73cad     	bl	0x254bc <_ChromeMain+0x20220>
 425620c: 9105c3e0     	add	x0, sp, #0x170
 4256210: 970ecb9c     	bl	0x609080 <_ChromeMain+0x603de4>
 4256214: f85703b9     	ldur	x25, [x29, #-0x90]
 4256218: b4ffcb19     	cbz	x25, 0x4255b78 <_ChromeMain+0x42508dc>
 425621c: f85783a8     	ldur	x8, [x29, #-0x88]
 4256220: 52801609     	mov	w9, #0xb0               ; =176
 4256224: 9b097d09     	mul	x9, x8, x9
 4256228: b4000309     	cbz	x9, 0x4256288 <_ChromeMain+0x4250fec>
 425622c: 8b190129     	add	x9, x9, x25
 4256230: d102c120     	sub	x0, x9, #0xb0
 4256234: 928015e9     	mov	x9, #-0xb0              ; =-176
 4256238: 9b097d15     	mul	x21, x8, x9
 425623c: b4fff980     	cbz	x0, 0x425616c <_ChromeMain+0x4250ed0>
 4256240: 94005460     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 4256244: d102c000     	sub	x0, x0, #0xb0
 4256248: b102c2b5     	adds	x21, x21, #0xb0
 425624c: 54ffff81     	b.ne	0x425623c <_ChromeMain+0x4250fa0>
 4256250: f85703a0     	ldur	x0, [x29, #-0x90]
 4256254: cb000328     	sub	x8, x25, x0
 4256258: 9344fd08     	asr	x8, x8, #4
 425625c: d2917469     	mov	x9, #0x8ba3             ; =35747
 4256260: f2b745c9     	movk	x9, #0xba2e, lsl #16
 4256264: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 4256268: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 425626c: 9b097d08     	mul	x8, x8, x9
 4256270: f81783a8     	stur	x8, [x29, #-0x88]
 4256274: f85803a8     	ldur	x8, [x29, #-0x80]
 4256278: 52801609     	mov	w9, #0xb0               ; =176
 425627c: 9b097d01     	mul	x1, x8, x9
 4256280: 96f6cb0e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256284: 17fffe3d     	b	0x4255b78 <_ChromeMain+0x42508dc>
 4256288: aa1903e0     	mov	x0, x25
 425628c: 17fffff2     	b	0x4256254 <_ChromeMain+0x4250fb8>
 4256290: 394623e8     	ldrb	w8, [sp, #0x188]
 4256294: f103fd1f     	cmp	x8, #0xff
 4256298: 54000680     	b.eq	0x4256368 <_ChromeMain+0x42510cc>
 425629c: f0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 42562a0: 9121e129     	add	x9, x9, #0x878
 42562a4: f8687928     	ldr	x8, [x9, x8, lsl #3]
 42562a8: 9103c3e0     	add	x0, sp, #0xf0
 42562ac: 9105c3e1     	add	x1, sp, #0x170
 42562b0: d63f0100     	blr	x8
 42562b4: 1400002d     	b	0x4256368 <_ChromeMain+0x42510cc>
 42562b8: 394623e8     	ldrb	w8, [sp, #0x188]
 42562bc: f103fd1f     	cmp	x8, #0xff
 42562c0: 54000440     	b.eq	0x4256348 <_ChromeMain+0x42510ac>
 42562c4: f0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 42562c8: 9121e129     	add	x9, x9, #0x878
 42562cc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 42562d0: 9103c3e0     	add	x0, sp, #0xf0
 42562d4: 9105c3e1     	add	x1, sp, #0x170
 42562d8: d63f0100     	blr	x8
 42562dc: 1400001b     	b	0x4256348 <_ChromeMain+0x42510ac>
 42562e0: 385883a8     	ldurb	w8, [x29, #-0x78]
 42562e4: 3607f448     	tbz	w8, #0x0, 0x425616c <_ChromeMain+0x4250ed0>
 42562e8: 9102a3e8     	add	x8, sp, #0xa8
 42562ec: 9105c3e0     	add	x0, sp, #0x170
 42562f0: 9721f10e     	bl	0xad2728 <_ChromeMain+0xacd48c>
 42562f4: d10243a0     	sub	x0, x29, #0x90
 42562f8: 9102a3e1     	add	x1, sp, #0xa8
 42562fc: 975e67f1     	bl	0x19f02c0 <_ChromeMain+0x19eb024>
 4256300: 9102a3e0     	add	x0, sp, #0xa8
 4256304: 971c205f     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4256308: 910303e0     	add	x0, sp, #0xc0
 425630c: 975b0d0f     	bl	0x1919748 <_ChromeMain+0x19144ac>
 4256310: 394623e8     	ldrb	w8, [sp, #0x188]
 4256314: 34000068     	cbz	w8, 0x4256320 <_ChromeMain+0x4251084>
 4256318: 9105c3e0     	add	x0, sp, #0x170
 425631c: 971c2059     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4256320: 385883a8     	ldurb	w8, [x29, #-0x78]
 4256324: 3607f248     	tbz	w8, #0x0, 0x425616c <_ChromeMain+0x4250ed0>
 4256328: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425632c: 91280421     	add	x1, x1, #0xa01
 4256330: 9105c3e8     	add	x8, sp, #0x170
 4256334: d10243a0     	sub	x0, x29, #0x90
 4256338: 528001e2     	mov	w2, #0xf                ; =15
 425633c: 9769cdf9     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 4256340: 394643e8     	ldrb	w8, [sp, #0x190]
 4256344: 35fffba8     	cbnz	w8, 0x42562b8 <_ChromeMain+0x425101c>
 4256348: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425634c: 91284421     	add	x1, x1, #0xa11
 4256350: 9105c3e8     	add	x8, sp, #0x170
 4256354: d10243a0     	sub	x0, x29, #0x90
 4256358: 52800282     	mov	w2, #0x14               ; =20
 425635c: 9769cdf1     	bl	0x1cc9b20 <_ChromeMain+0x1cc4884>
 4256360: 394643e8     	ldrb	w8, [sp, #0x190]
 4256364: 35fff968     	cbnz	w8, 0x4256290 <_ChromeMain+0x4250ff4>
 4256368: d00490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 425636c: 910ec021     	add	x1, x1, #0x3b0
 4256370: d10243a0     	sub	x0, x29, #0x90
 4256374: 528003e2     	mov	w2, #0x1f               ; =31
 4256378: 97623592     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 425637c: d00490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 4256380: 910e5021     	add	x1, x1, #0x394
 4256384: d10243a0     	sub	x0, x29, #0x90
 4256388: 52800362     	mov	w2, #0x1b               ; =27
 425638c: 9762358d     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 4256390: d00490e1     	adrp	x1, 0xd474000 <dyld_stub_binder+0xd474000>
 4256394: 910f4021     	add	x1, x1, #0x3d0
 4256398: d10243a0     	sub	x0, x29, #0x90
 425639c: 52800322     	mov	w2, #0x19               ; =25
 42563a0: 97623588     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 42563a4: 385883a8     	ldurb	w8, [x29, #-0x78]
 42563a8: 3607ee28     	tbz	w8, #0x0, 0x425616c <_ChromeMain+0x4250ed0>
 42563ac: f85703a8     	ldur	x8, [x29, #-0x90]
 42563b0: f9004be8     	str	x8, [sp, #0x90]
 42563b4: 3cc08360     	ldur	q0, [x27, #0x8]
 42563b8: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 42563bc: f81803bf     	stur	xzr, [x29, #-0x80]
 42563c0: 3c808340     	stur	q0, [x26, #0x8]
 42563c4: 910243e1     	add	x1, sp, #0x90
 42563c8: aa1403e0     	mov	x0, x20
 42563cc: d2800002     	mov	x2, #0x0                ; =0
 42563d0: 94df2331     	bl	0x7a1f094 <_ChromeMain+0x7a19df8>
 42563d4: aa0003f9     	mov	x25, x0
 42563d8: 910243e0     	add	x0, sp, #0x90
 42563dc: 971c2029     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42563e0: 14000019     	b	0x4256444 <_ChromeMain+0x42511a8>
 42563e4: f94063e0     	ldr	x0, [sp, #0xc0]
 42563e8: f9406be8     	ldr	x8, [sp, #0xd0]
 42563ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42563f0: 96f6cab2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42563f4: 14000016     	b	0x425644c <_ChromeMain+0x42511b0>
 42563f8: 39841fe8     	ldrsb	x8, [sp, #0x107]
 42563fc: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4256400: f100011f     	cmp	x8, #0x0
 4256404: 9a954120     	csel	x0, x9, x21, mi
 4256408: 7100011f     	cmp	w8, #0x0
 425640c: 9a884141     	csel	x1, x10, x8, mi
 4256410: 9105c3e8     	add	x8, sp, #0x170
 4256414: 52800002     	mov	w2, #0x0                ; =0
 4256418: 52801903     	mov	w3, #0xc8               ; =200
 425641c: 9765aec8     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4256420: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4256424: 36f800a8     	tbz	w8, #0x1f, 0x4256438 <_ChromeMain+0x425119c>
 4256428: f9407be0     	ldr	x0, [sp, #0xf0]
 425642c: f94083e8     	ldr	x8, [sp, #0x100]
 4256430: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256434: 96f6caa1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256438: 394623e8     	ldrb	w8, [sp, #0x188]
 425643c: 35fff528     	cbnz	w8, 0x42562e0 <_ChromeMain+0x4251044>
 4256440: 52800019     	mov	w25, #0x0               ; =0
 4256444: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4256448: 37fffce8     	tbnz	w8, #0x1f, 0x42563e4 <_ChromeMain+0x4251148>
 425644c: 385883a8     	ldurb	w8, [x29, #-0x78]
 4256450: 34000068     	cbz	w8, 0x425645c <_ChromeMain+0x42511c0>
 4256454: d10243a0     	sub	x0, x29, #0x90
 4256458: 971c200a     	bl	0x95e480 <_ChromeMain+0x9591e4>
 425645c: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 4256460: 37f80328     	tbnz	w8, #0x1f, 0x42564c4 <_ChromeMain+0x4251228>
 4256464: 360004b9     	tbz	w25, #0x0, 0x42564f8 <_ChromeMain+0x425125c>
 4256468: 3945a3e8     	ldrb	w8, [sp, #0x168]
 425646c: 340001a8     	cbz	w8, 0x42564a0 <_ChromeMain+0x4251204>
 4256470: 9101e3e0     	add	x0, sp, #0x78
 4256474: 910443e1     	add	x1, sp, #0x110
 4256478: aa1803e2     	mov	x2, x24
 425647c: 94000fc1     	bl	0x425a380 <_ChromeMain+0x42550e4>
 4256480: 340006c0     	cbz	w0, 0x4256558 <_ChromeMain+0x42512bc>
 4256484: 3945a3e8     	ldrb	w8, [sp, #0x168]
 4256488: 3607e728     	tbz	w8, #0x0, 0x425616c <_ChromeMain+0x4250ed0>
 425648c: 9101e3e0     	add	x0, sp, #0x78
 4256490: 910443e1     	add	x1, sp, #0x110
 4256494: 910122e2     	add	x2, x23, #0x48
 4256498: 94001324     	bl	0x425b128 <_ChromeMain+0x4255e8c>
 425649c: 360005e0     	tbz	w0, #0x0, 0x4256558 <_ChromeMain+0x42512bc>
 42564a0: f9405a77     	ldr	x23, [x19, #0xb0]
 42564a4: b4001c77     	cbz	x23, 0x4256830 <_ChromeMain+0x4251594>
 42564a8: f9405e68     	ldr	x8, [x19, #0xb8]
 42564ac: 8b080d08     	add	x8, x8, x8, lsl #3
 42564b0: d37ced18     	lsl	x24, x8, #4
 42564b4: b40019f8     	cbz	x24, 0x42567f0 <_ChromeMain+0x4251554>
 42564b8: d2800019     	mov	x25, #0x0               ; =0
 42564bc: aa1703fa     	mov	x26, x23
 42564c0: 140000b9     	b	0x42567a4 <_ChromeMain+0x4251508>
 42564c4: f9406fe0     	ldr	x0, [sp, #0xd8]
 42564c8: f94077e8     	ldr	x8, [sp, #0xe8]
 42564cc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42564d0: 96f6ca7a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42564d4: 3707fcb9     	tbnz	w25, #0x0, 0x4256468 <_ChromeMain+0x42511cc>
 42564d8: 14000008     	b	0x42564f8 <_ChromeMain+0x425125c>
 42564dc: f9406fe0     	ldr	x0, [sp, #0xd8]
 42564e0: f94077e8     	ldr	x8, [sp, #0xe8]
 42564e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42564e8: 96f6ca74     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42564ec: 14000003     	b	0x42564f8 <_ChromeMain+0x425125c>
 42564f0: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 42564f4: 37ffff48     	tbnz	w8, #0x1f, 0x42564dc <_ChromeMain+0x4251240>
 42564f8: d0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42564fc: b940b108     	ldr	w8, [x8, #0xb0]
 4256500: 7100091f     	cmp	w8, #0x2
 4256504: 54ffce8c     	b.gt	0x4255ed4 <_ChromeMain+0x4250c38>
 4256508: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425650c: 91080821     	add	x1, x1, #0x202
 4256510: 9105c3f3     	add	x19, sp, #0x170
 4256514: 9105c3e0     	add	x0, sp, #0x170
 4256518: 5280f1e2     	mov	w2, #0x78f              ; =1935
 425651c: 52800043     	mov	w3, #0x2                ; =2
 4256520: 970ecb0b     	bl	0x60914c <_ChromeMain+0x603eb0>
 4256524: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256528: 91234021     	add	x1, x1, #0x8d0
 425652c: 91004260     	add	x0, x19, #0x10
 4256530: 52800702     	mov	w2, #0x38               ; =56
 4256534: 96f73be2     	bl	0x254bc <_ChromeMain+0x20220>
 4256538: 39805e88     	ldrsb	x8, [x20, #0x17]
 425653c: a9402a89     	ldp	x9, x10, [x20]
 4256540: f100011f     	cmp	x8, #0x0
 4256544: 9a944121     	csel	x1, x9, x20, mi
 4256548: 7100011f     	cmp	w8, #0x0
 425654c: 9a884142     	csel	x2, x10, x8, mi
 4256550: 96f73bdb     	bl	0x254bc <_ChromeMain+0x20220>
 4256554: 17fffe5e     	b	0x4255ecc <_ChromeMain+0x4250c30>
 4256558: d0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 425655c: b940b108     	ldr	w8, [x8, #0xb0]
 4256560: 7100091f     	cmp	w8, #0x2
 4256564: 540006ac     	b.gt	0x4256638 <_ChromeMain+0x425139c>
 4256568: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425656c: 91080821     	add	x1, x1, #0x202
 4256570: 9105c3f5     	add	x21, sp, #0x170
 4256574: 9105c3e0     	add	x0, sp, #0x170
 4256578: 5280f342     	mov	w2, #0x79a              ; =1946
 425657c: 52800043     	mov	w3, #0x2                ; =2
 4256580: 970ecaf3     	bl	0x60914c <_ChromeMain+0x603eb0>
 4256584: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256588: 910db421     	add	x1, x1, #0x36d
 425658c: 910042a0     	add	x0, x21, #0x10
 4256590: 52800482     	mov	w2, #0x24               ; =36
 4256594: 96f73bca     	bl	0x254bc <_ChromeMain+0x20220>
 4256598: aa0003f5     	mov	x21, x0
 425659c: 9103c3f7     	add	x23, sp, #0xf0
 42565a0: 9103c3e8     	add	x8, sp, #0xf0
 42565a4: aa1603e0     	mov	x0, x22
 42565a8: 9400263a     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42565ac: 39841fe8     	ldrsb	x8, [sp, #0x107]
 42565b0: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 42565b4: f100011f     	cmp	x8, #0x0
 42565b8: 9a974120     	csel	x0, x9, x23, mi
 42565bc: 7100011f     	cmp	w8, #0x0
 42565c0: 9a884141     	csel	x1, x10, x8, mi
 42565c4: d10243b7     	sub	x23, x29, #0x90
 42565c8: d10243a8     	sub	x8, x29, #0x90
 42565cc: 973531cf     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42565d0: 389873a8     	ldursb	x8, [x29, #-0x79]
 42565d4: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 42565d8: f100011f     	cmp	x8, #0x0
 42565dc: 9a974121     	csel	x1, x9, x23, mi
 42565e0: 7100011f     	cmp	w8, #0x0
 42565e4: 9a884142     	csel	x2, x10, x8, mi
 42565e8: aa1503e0     	mov	x0, x21
 42565ec: 96f73bb4     	bl	0x254bc <_ChromeMain+0x20220>
 42565f0: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42565f4: 910e4821     	add	x1, x1, #0x392
 42565f8: 528002c2     	mov	w2, #0x16               ; =22
 42565fc: 96f73bb0     	bl	0x254bc <_ChromeMain+0x20220>
 4256600: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4256604: 36f800a8     	tbz	w8, #0x1f, 0x4256618 <_ChromeMain+0x425137c>
 4256608: f85703a0     	ldur	x0, [x29, #-0x90]
 425660c: f85803a8     	ldur	x8, [x29, #-0x80]
 4256610: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256614: 96f6ca29     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256618: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 425661c: 36f800a8     	tbz	w8, #0x1f, 0x4256630 <_ChromeMain+0x4251394>
 4256620: f9407be0     	ldr	x0, [sp, #0xf0]
 4256624: f94083e8     	ldr	x8, [sp, #0x100]
 4256628: d37ff901     	lsl	x1, x8, #1
 425662c: 96f6ca23     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256630: 9105c3e0     	add	x0, sp, #0x170
 4256634: 970eca93     	bl	0x609080 <_ChromeMain+0x603de4>
 4256638: 9103c3f5     	add	x21, sp, #0xf0
 425663c: 9103c3e8     	add	x8, sp, #0xf0
 4256640: aa1603e0     	mov	x0, x22
 4256644: 94002613     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4256648: 39841fe8     	ldrsb	x8, [sp, #0x107]
 425664c: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4256650: f100011f     	cmp	x8, #0x0
 4256654: 9a954120     	csel	x0, x9, x21, mi
 4256658: 7100011f     	cmp	w8, #0x0
 425665c: 9a884141     	csel	x1, x10, x8, mi
 4256660: d10243a8     	sub	x8, x29, #0x90
 4256664: 973531a9     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4256668: 38d873a8     	ldursb	w8, [x29, #-0x79]
 425666c: 12001d18     	and	w24, w8, #0xff
 4256670: 37f86ac8     	tbnz	w8, #0x1f, 0x42573c8 <_ChromeMain+0x425212c>
 4256674: 92401d15     	and	x21, x8, #0xff
 4256678: 51002308     	sub	w8, w24, #0x8
 425667c: 71003d1f     	cmp	w8, #0xf
 4256680: 54006dc3     	b.lo	0x4257438 <_ChromeMain+0x425219c>
 4256684: d10243b6     	sub	x22, x29, #0x90
 4256688: d004bc97     	adrp	x23, 0xd9e8000 <dyld_stub_binder+0xd9e8000>
 425668c: 911682f7     	add	x23, x23, #0x5a0
 4256690: b40001b5     	cbz	x21, 0x42566c4 <_ChromeMain+0x4251428>
 4256694: 8b1502c8     	add	x8, x22, x21
 4256698: eb16011f     	cmp	x8, x22
 425669c: 54ffd683     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42566a0: eb17011f     	cmp	x8, x23
 42566a4: fa5782c2     	ccmp	x22, x23, #0x2, hi
 42566a8: 528001e8     	mov	w8, #0xf                ; =15
 42566ac: 9a9f9108     	csel	x8, x8, xzr, ls
 42566b0: 8b0802f7     	add	x23, x23, x8
 42566b4: 91003ec0     	add	x0, x22, #0xf
 42566b8: aa1603e1     	mov	x1, x22
 42566bc: aa1503e2     	mov	x2, x21
 42566c0: 94f6e303     	bl	0x800f2cc <_ChromeMain+0x800a030>
 42566c4: f94002e8     	ldr	x8, [x23]
 42566c8: f90002c8     	str	x8, [x22]
 42566cc: f84072e8     	ldur	x8, [x23, #0x7]
 42566d0: f80072c8     	stur	x8, [x22, #0x7]
 42566d4: 91003ea8     	add	x8, x21, #0xf
 42566d8: 38d873a9     	ldursb	w9, [x29, #-0x79]
 42566dc: 37f86729     	tbnz	w9, #0x1f, 0x42573c0 <_ChromeMain+0x4252124>
 42566e0: 12001909     	and	w9, w8, #0x7f
 42566e4: 381873a9     	sturb	w9, [x29, #-0x79]
 42566e8: 38286adf     	strb	wzr, [x22, x8]
 42566ec: 3dc00360     	ldr	q0, [x27]
 42566f0: 3d803b40     	str	q0, [x26, #0xe0]
 42566f4: f85803a8     	ldur	x8, [x29, #-0x80]
 42566f8: f900c3e8     	str	x8, [sp, #0x180]
 42566fc: a937ffbf     	stp	xzr, xzr, [x29, #-0x88]
 4256700: f81703bf     	stur	xzr, [x29, #-0x90]
 4256704: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256708: 910ea421     	add	x1, x1, #0x3a9
 425670c: 9105c3e0     	add	x0, sp, #0x170
 4256710: 528002a2     	mov	w2, #0x15               ; =21
 4256714: 96f90f43     	bl	0x9a420 <_ChromeMain+0x95184>
 4256718: f9400015     	ldr	x21, [x0]
 425671c: 3cc08000     	ldur	q0, [x0, #0x8]
 4256720: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4256724: f900001f     	str	xzr, [x0]
 4256728: 39c07e68     	ldrsb	w8, [x19, #0x1f]
 425672c: 37f87148     	tbnz	w8, #0x1f, 0x4257554 <_ChromeMain+0x42522b8>
 4256730: f9000675     	str	x21, [x19, #0x8]
 4256734: 3d800660     	str	q0, [x19, #0x10]
 4256738: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 425673c: 36f800a8     	tbz	w8, #0x1f, 0x4256750 <_ChromeMain+0x42514b4>
 4256740: f940bbe0     	ldr	x0, [sp, #0x170]
 4256744: f940c3e8     	ldr	x8, [sp, #0x180]
 4256748: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425674c: 96f6c9db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256750: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4256754: 36f800a8     	tbz	w8, #0x1f, 0x4256768 <_ChromeMain+0x42514cc>
 4256758: f85703a0     	ldur	x0, [x29, #-0x90]
 425675c: f85803a8     	ldur	x8, [x29, #-0x80]
 4256760: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256764: 96f6c9d5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256768: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 425676c: 36ffbb48     	tbz	w8, #0x1f, 0x4255ed4 <_ChromeMain+0x4250c38>
 4256770: f9407be0     	ldr	x0, [sp, #0xf0]
 4256774: f94083e8     	ldr	x8, [sp, #0x100]
 4256778: d37ff901     	lsl	x1, x8, #1
 425677c: 96f6c9cf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256780: 17fffdd5     	b	0x4255ed4 <_ChromeMain+0x4250c38>
 4256784: f9400360     	ldr	x0, [x27]
 4256788: f8580108     	ldur	x8, [x8, #-0x80]
 425678c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256790: 96f6c9ca     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256794: d102435a     	sub	x26, x26, #0x90
 4256798: 91024339     	add	x25, x25, #0x90
 425679c: eb19031f     	cmp	x24, x25
 42567a0: 540002c0     	b.eq	0x42567f8 <_ChromeMain+0x425155c>
 42567a4: 8b180355     	add	x21, x26, x24
 42567a8: f10242bb     	subs	x27, x21, #0x90
 42567ac: 54ffce00     	b.eq	0x425616c <_ChromeMain+0x4250ed0>
 42567b0: d10022a0     	sub	x0, x21, #0x8
 42567b4: d2800001     	mov	x1, #0x0                ; =0
 42567b8: 96f74540     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 42567bc: d10162a0     	sub	x0, x21, #0x58
 42567c0: 96f7452e     	bl	0x27c78 <_ChromeMain+0x229dc>
 42567c4: 38d9f2a8     	ldursb	w8, [x21, #-0x61]
 42567c8: 36f800c8     	tbz	w8, #0x1f, 0x42567e0 <_ChromeMain+0x4251544>
 42567cc: 8b180348     	add	x8, x26, x24
 42567d0: f8588100     	ldur	x0, [x8, #-0x78]
 42567d4: f8598108     	ldur	x8, [x8, #-0x68]
 42567d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42567dc: 96f6c9b7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42567e0: 8b180348     	add	x8, x26, x24
 42567e4: 38d87109     	ldursb	w9, [x8, #-0x79]
 42567e8: 36fffd69     	tbz	w9, #0x1f, 0x4256794 <_ChromeMain+0x42514f8>
 42567ec: 17ffffe6     	b	0x4256784 <_ChromeMain+0x42514e8>
 42567f0: aa1703e0     	mov	x0, x23
 42567f4: 14000003     	b	0x4256800 <_ChromeMain+0x4251564>
 42567f8: f9405a60     	ldr	x0, [x19, #0xb0]
 42567fc: 910243fa     	add	x26, sp, #0x90
 4256800: cb0002e8     	sub	x8, x23, x0
 4256804: 9344fd08     	asr	x8, x8, #4
 4256808: d291c729     	mov	x9, #0x8e39             ; =36409
 425680c: f2a71c69     	movk	x9, #0x38e3, lsl #16
 4256810: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 4256814: f2f1c709     	movk	x9, #0x8e38, lsl #48
 4256818: 9b097d08     	mul	x8, x8, x9
 425681c: f9005e68     	str	x8, [x19, #0xb8]
 4256820: f9406268     	ldr	x8, [x19, #0xc0]
 4256824: 8b080d08     	add	x8, x8, x8, lsl #3
 4256828: d37ced01     	lsl	x1, x8, #4
 425682c: 96f6c9a3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256830: f94027e8     	ldr	x8, [sp, #0x48]
 4256834: f9005a68     	str	x8, [x19, #0xb0]
 4256838: 3cc503e0     	ldur	q0, [sp, #0x50]
 425683c: 3c8b8260     	stur	q0, [x19, #0xb8]
 4256840: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4256844: f90027ff     	str	xzr, [sp, #0x48]
 4256848: 71000edf     	cmp	w22, #0x3
 425684c: 54002fe1     	b.ne	0x4256e48 <_ChromeMain+0x4251bac>
 4256850: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4256854: f81803bf     	stur	xzr, [x29, #-0x80]
 4256858: 9105c3f6     	add	x22, sp, #0x170
 425685c: 9105c3e8     	add	x8, sp, #0x170
 4256860: 52800060     	mov	w0, #0x3                ; =3
 4256864: 94002626     	bl	0x42600fc <_ChromeMain+0x425ae60>
 4256868: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425686c: 91289821     	add	x1, x1, #0xa26
 4256870: d10243a8     	sub	x8, x29, #0x90
 4256874: 9105c3e0     	add	x0, sp, #0x170
 4256878: 52800162     	mov	w2, #0xb                ; =11
 425687c: 97510ae6     	bl	0x1699414 <_ChromeMain+0x1694178>
 4256880: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4256884: 37f863a8     	tbnz	w8, #0x1f, 0x42574f8 <_ChromeMain+0x425225c>
 4256888: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 425688c: f90083ff     	str	xzr, [sp, #0x100]
 4256890: b0046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4256894: 911f2021     	add	x1, x1, #0x7c8
 4256898: 9105c3e0     	add	x0, sp, #0x170
 425689c: 52800342     	mov	w2, #0x1a               ; =26
 42568a0: 97125fec     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 42568a4: 39461fe8     	ldrb	w8, [sp, #0x187]
 42568a8: 13001d09     	sxtb	w9, w8
 42568ac: a9572fea     	ldp	x10, x11, [sp, #0x170]
 42568b0: 7100013f     	cmp	w9, #0x0
 42568b4: 9a964140     	csel	x0, x10, x22, mi
 42568b8: 9a884161     	csel	x1, x11, x8, mi
 42568bc: 9737a0a8     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 42568c0: 34006ac0     	cbz	w0, 0x4257618 <_ChromeMain+0x425237c>
 42568c4: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 42568c8: 36f865c8     	tbz	w8, #0x1f, 0x4257580 <_ChromeMain+0x42522e4>
 42568cc: a9570be1     	ldp	x1, x2, [sp, #0x170]
 42568d0: 9103c3e0     	add	x0, sp, #0xf0
 42568d4: 96f70651     	bl	0x18218 <_ChromeMain+0x12f7c>
 42568d8: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 42568dc: 37f86048     	tbnz	w8, #0x1f, 0x42574e4 <_ChromeMain+0x4252248>
 42568e0: a90dffff     	stp	xzr, xzr, [sp, #0xd8]
 42568e4: f90077ff     	str	xzr, [sp, #0xe8]
 42568e8: 910363f5     	add	x21, sp, #0xd8
 42568ec: d10243a0     	sub	x0, x29, #0x90
 42568f0: 910363e1     	add	x1, sp, #0xd8
 42568f4: 92800002     	mov	x2, #-0x1               ; =-1
 42568f8: 9774f0a4     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 42568fc: 340006a0     	cbz	w0, 0x42569d0 <_ChromeMain+0x4251734>
 4256900: 6f00e400     	movi.2d	v0, #0000000000000000
 4256904: ad070340     	stp	q0, q0, [x26, #0xe0]
 4256908: 3983bfe8     	ldrsb	x8, [sp, #0xef]
 425690c: a94dabe9     	ldp	x9, x10, [sp, #0xd8]
 4256910: f100011f     	cmp	x8, #0x0
 4256914: 9a954120     	csel	x0, x9, x21, mi
 4256918: 7100011f     	cmp	w8, #0x0
 425691c: 9a884141     	csel	x1, x10, x8, mi
 4256920: 9105c3e8     	add	x8, sp, #0x170
 4256924: 52800002     	mov	w2, #0x0                ; =0
 4256928: 52801903     	mov	w3, #0xc8               ; =200
 425692c: 9765ad84     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 4256930: 394623e8     	ldrb	w8, [sp, #0x188]
 4256934: 34000468     	cbz	w8, 0x42569c0 <_ChromeMain+0x4251724>
 4256938: b0046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 425693c: 9118b421     	add	x1, x1, #0x62d
 4256940: 9105c3e0     	add	x0, sp, #0x170
 4256944: 52800242     	mov	w2, #0x12               ; =18
 4256948: 970850fe     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 425694c: b40003a0     	cbz	x0, 0x42569c0 <_ChromeMain+0x4251724>
 4256950: 39406008     	ldrb	w8, [x0, #0x18]
 4256954: 7100191f     	cmp	w8, #0x6
 4256958: 54000341     	b.ne	0x42569c0 <_ChromeMain+0x4251724>
 425695c: f94003e8     	ldr	x8, [sp]
 4256960: 39805d02     	ldrsb	x2, [x8, #0x17]
 4256964: b7f852a2     	tbnz	x2, #0x3f, 0x42573b8 <_ChromeMain+0x425211c>
 4256968: aa0803e1     	mov	x1, x8
 425696c: 971c1fb5     	bl	0x95e840 <_ChromeMain+0x9595a4>
 4256970: b4000280     	cbz	x0, 0x42569c0 <_ChromeMain+0x4251724>
 4256974: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256978: 9128c821     	add	x1, x1, #0xa32
 425697c: 528002c2     	mov	w2, #0x16               ; =22
 4256980: 97774c40     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4256984: b40001e0     	cbz	x0, 0x42569c0 <_ChromeMain+0x4251724>
 4256988: 39805c08     	ldrsb	x8, [x0, #0x17]
 425698c: b7f85c08     	tbnz	x8, #0x3f, 0x425750c <_ChromeMain+0x4252270>
 4256990: aa0803e9     	mov	x9, x8
 4256994: 9103c3ea     	add	x10, sp, #0xf0
 4256998: eb00015f     	cmp	x10, x0
 425699c: 54000120     	b.eq	0x42569c0 <_ChromeMain+0x4251724>
 42569a0: b4000109     	cbz	x9, 0x42569c0 <_ChromeMain+0x4251724>
 42569a4: 39c41fe9     	ldrsb	w9, [sp, #0x107]
 42569a8: 37f86209     	tbnz	w9, #0x1f, 0x42575e8 <_ChromeMain+0x425234c>
 42569ac: 37f85e28     	tbnz	w8, #0x1f, 0x4257570 <_ChromeMain+0x42522d4>
 42569b0: 3dc00000     	ldr	q0, [x0]
 42569b4: f9400808     	ldr	x8, [x0, #0x10]
 42569b8: f90083e8     	str	x8, [sp, #0x100]
 42569bc: 3d801b40     	str	q0, [x26, #0x60]
 42569c0: 394623e8     	ldrb	w8, [sp, #0x188]
 42569c4: 34000068     	cbz	w8, 0x42569d0 <_ChromeMain+0x4251734>
 42569c8: 9105c3e0     	add	x0, sp, #0x170
 42569cc: 971c1ead     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42569d0: 39441fe9     	ldrb	w9, [sp, #0x107]
 42569d4: 13001d28     	sxtb	w8, w9
 42569d8: f9407fea     	ldr	x10, [sp, #0xf8]
 42569dc: 7100011f     	cmp	w8, #0x0
 42569e0: 9a894141     	csel	x1, x10, x9, mi
 42569e4: b40011e1     	cbz	x1, 0x4256c20 <_ChromeMain+0x4251984>
 42569e8: a9177fff     	stp	xzr, xzr, [sp, #0x170]
 42569ec: f900c3ff     	str	xzr, [sp, #0x180]
 42569f0: f9407be9     	ldr	x9, [sp, #0xf0]
 42569f4: 7100011f     	cmp	w8, #0x0
 42569f8: 9103c3e8     	add	x8, sp, #0xf0
 42569fc: 9a884120     	csel	x0, x9, x8, mi
 4256a00: 910303f5     	add	x21, sp, #0xc0
 4256a04: 910303e8     	add	x8, sp, #0xc0
 4256a08: 97244a5c     	bl	0xb69378 <_ChromeMain+0xb640dc>
 4256a0c: 39835fe8     	ldrsb	x8, [sp, #0xd7]
 4256a10: a94c2be9     	ldp	x9, x10, [sp, #0xc0]
 4256a14: f100011f     	cmp	x8, #0x0
 4256a18: 9a954121     	csel	x1, x9, x21, mi
 4256a1c: 7100011f     	cmp	w8, #0x0
 4256a20: 9a884142     	csel	x2, x10, x8, mi
 4256a24: 9105c3e8     	add	x8, sp, #0x170
 4256a28: 9101e3e0     	add	x0, sp, #0x78
 4256a2c: 97510a7a     	bl	0x1699414 <_ChromeMain+0x1694178>
 4256a30: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4256a34: 37f85708     	tbnz	w8, #0x1f, 0x4257514 <_ChromeMain+0x4252278>
 4256a38: 9105c3e0     	add	x0, sp, #0x170
 4256a3c: 977f3681     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4256a40: f94003f5     	ldr	x21, [sp]
 4256a44: 37000840     	tbnz	w0, #0x0, 0x4256b4c <_ChromeMain+0x42518b0>
 4256a48: b0046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4256a4c: 911f2021     	add	x1, x1, #0x7c8
 4256a50: 9102a3f5     	add	x21, sp, #0xa8
 4256a54: 9102a3e0     	add	x0, sp, #0xa8
 4256a58: 52800342     	mov	w2, #0x1a               ; =26
 4256a5c: 97125f7d     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 4256a60: 3942ffe8     	ldrb	w8, [sp, #0xbf]
 4256a64: 13001d09     	sxtb	w9, w8
 4256a68: a94aafea     	ldp	x10, x11, [sp, #0xa8]
 4256a6c: 7100013f     	cmp	w9, #0x0
 4256a70: 9a954140     	csel	x0, x10, x21, mi
 4256a74: 9a884161     	csel	x1, x11, x8, mi
 4256a78: 9737a039     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 4256a7c: 34005d80     	cbz	w0, 0x425762c <_ChromeMain+0x4252390>
 4256a80: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 4256a84: 36f859c8     	tbz	w8, #0x1f, 0x42575bc <_ChromeMain+0x4252320>
 4256a88: a94a8be1     	ldp	x1, x2, [sp, #0xa8]
 4256a8c: 910303e0     	add	x0, sp, #0xc0
 4256a90: 96f705e2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4256a94: f94003f5     	ldr	x21, [sp]
 4256a98: 39441fe9     	ldrb	w9, [sp, #0x107]
 4256a9c: 13001d28     	sxtb	w8, w9
 4256aa0: f9407fea     	ldr	x10, [sp, #0xf8]
 4256aa4: 7100011f     	cmp	w8, #0x0
 4256aa8: 9a894142     	csel	x2, x10, x9, mi
 4256aac: 39435fe9     	ldrb	w9, [sp, #0xd7]
 4256ab0: 13001d36     	sxtb	w22, w9
 4256ab4: f94067ea     	ldr	x10, [sp, #0xc8]
 4256ab8: 710002df     	cmp	w22, #0x0
 4256abc: 9a894149     	csel	x9, x10, x9, mi
 4256ac0: eb09005f     	cmp	x2, x9
 4256ac4: 54000060     	b.eq	0x4256ad0 <_ChromeMain+0x4251834>
 4256ac8: 52800037     	mov	w23, #0x1               ; =1
 4256acc: 1400000c     	b	0x4256afc <_ChromeMain+0x4251860>
 4256ad0: f9407be9     	ldr	x9, [sp, #0xf0]
 4256ad4: 7100011f     	cmp	w8, #0x0
 4256ad8: 9103c3e8     	add	x8, sp, #0xf0
 4256adc: 9a884120     	csel	x0, x9, x8, mi
 4256ae0: f94063e8     	ldr	x8, [sp, #0xc0]
 4256ae4: 710002df     	cmp	w22, #0x0
 4256ae8: 910303e9     	add	x9, sp, #0xc0
 4256aec: 9a894101     	csel	x1, x8, x9, mi
 4256af0: 94f6cb5c     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4256af4: 7100001f     	cmp	w0, #0x0
 4256af8: 1a9f07f7     	cset	w23, ne
 4256afc: 36f800b6     	tbz	w22, #0x1f, 0x4256b10 <_ChromeMain+0x4251874>
 4256b00: f94063e0     	ldr	x0, [sp, #0xc0]
 4256b04: f9406be8     	ldr	x8, [sp, #0xd0]
 4256b08: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256b0c: 96f6c8eb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256b10: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 4256b14: 37f81c08     	tbnz	w8, #0x1f, 0x4256e94 <_ChromeMain+0x4251bf8>
 4256b18: 340001b7     	cbz	w23, 0x4256b4c <_ChromeMain+0x42518b0>
 4256b1c: b0046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4256b20: 911f2021     	add	x1, x1, #0x7c8
 4256b24: 910303e8     	add	x8, sp, #0xc0
 4256b28: 9101e3e0     	add	x0, sp, #0x78
 4256b2c: 52800342     	mov	w2, #0x1a               ; =26
 4256b30: 97510a39     	bl	0x1699414 <_ChromeMain+0x1694178>
 4256b34: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4256b38: 37f854c8     	tbnz	w8, #0x1f, 0x42575d0 <_ChromeMain+0x4252334>
 4256b3c: 3dc00f40     	ldr	q0, [x26, #0x30]
 4256b40: 3d803b40     	str	q0, [x26, #0xe0]
 4256b44: f9406be8     	ldr	x8, [sp, #0xd0]
 4256b48: f900c3e8     	str	x8, [sp, #0x180]
 4256b4c: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 4256b50: f9006bff     	str	xzr, [sp, #0xd0]
 4256b54: 9105c3e0     	add	x0, sp, #0x170
 4256b58: 910303e1     	add	x1, sp, #0xc0
 4256b5c: 92800002     	mov	x2, #-0x1               ; =-1
 4256b60: 9774f00a     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4256b64: 39435fe8     	ldrb	w8, [sp, #0xd7]
 4256b68: 34000620     	cbz	w0, 0x4256c2c <_ChromeMain+0x4251990>
 4256b6c: f94067f8     	ldr	x24, [sp, #0xc8]
 4256b70: 7219011f     	tst	w8, #0x80
 4256b74: 9a881309     	csel	x9, x24, x8, ne
 4256b78: b40005a9     	cbz	x9, 0x4256c2c <_ChromeMain+0x4251990>
 4256b7c: 52800600     	mov	w0, #0x30               ; =48
 4256b80: 96f6e1fa     	bl	0xf368 <_ChromeMain+0xa0cc>
 4256b84: f90057e0     	str	x0, [sp, #0xa8]
 4256b88: 9004e728     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4256b8c: 3dc2dd00     	ldr	q0, [x8, #0xb70]
 4256b90: 3c820340     	stur	q0, [x26, #0x20]
 4256b94: 91008809     	add	x9, x0, #0x22
 4256b98: eb00013f     	cmp	x9, x0
 4256b9c: 54ffae83     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 4256ba0: d0046588     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4256ba4: 91047d08     	add	x8, x8, #0x11f
 4256ba8: eb08013f     	cmp	x9, x8
 4256bac: fa488002     	ccmp	x0, x8, #0x2, hi
 4256bb0: 54ffade9     	b.ls	0x425616c <_ChromeMain+0x4250ed0>
 4256bb4: 5285e5e9     	mov	w9, #0x2f2f             ; =12079
 4256bb8: 79004009     	strh	w9, [x0, #0x20]
 4256bbc: ad400500     	ldp	q0, q1, [x8]
 4256bc0: ad000400     	stp	q0, q1, [x0]
 4256bc4: 3900881f     	strb	wzr, [x0, #0x22]
 4256bc8: 39805ea8     	ldrsb	x8, [x21, #0x17]
 4256bcc: a9402aa9     	ldp	x9, x10, [x21]
 4256bd0: f100011f     	cmp	x8, #0x0
 4256bd4: 9a954121     	csel	x1, x9, x21, mi
 4256bd8: 7100011f     	cmp	w8, #0x0
 4256bdc: 9a884142     	csel	x2, x10, x8, mi
 4256be0: 9102a3e0     	add	x0, sp, #0xa8
 4256be4: 96f90e0f     	bl	0x9a420 <_ChromeMain+0x95184>
 4256be8: a9406c15     	ldp	x21, x27, [x0]
 4256bec: f9400817     	ldr	x23, [x0, #0x10]
 4256bf0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4256bf4: f900001f     	str	xzr, [x0]
 4256bf8: f94063f6     	ldr	x22, [sp, #0xc0]
 4256bfc: f9406bf9     	ldr	x25, [sp, #0xd0]
 4256c00: 39c2ffe8     	ldrsb	w8, [sp, #0xbf]
 4256c04: 36f800a8     	tbz	w8, #0x1f, 0x4256c18 <_ChromeMain+0x425197c>
 4256c08: f94057e0     	ldr	x0, [sp, #0xa8]
 4256c0c: f9405fe8     	ldr	x8, [sp, #0xb8]
 4256c10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256c14: 96f6c8a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256c18: 5280003a     	mov	w26, #0x1               ; =1
 4256c1c: 1400000b     	b	0x4256c48 <_ChromeMain+0x42519ac>
 4256c20: d2800015     	mov	x21, #0x0               ; =0
 4256c24: 5280001a     	mov	w26, #0x0               ; =0
 4256c28: 1400000a     	b	0x4256c50 <_ChromeMain+0x42519b4>
 4256c2c: 363800a8     	tbz	w8, #0x7, 0x4256c40 <_ChromeMain+0x42519a4>
 4256c30: f94063e0     	ldr	x0, [sp, #0xc0]
 4256c34: f9406be8     	ldr	x8, [sp, #0xd0]
 4256c38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256c3c: 96f6c89f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256c40: 5280001a     	mov	w26, #0x0               ; =0
 4256c44: d2800015     	mov	x21, #0x0               ; =0
 4256c48: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4256c4c: 37f811a8     	tbnz	w8, #0x1f, 0x4256e80 <_ChromeMain+0x4251be4>
 4256c50: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 4256c54: 36f800a8     	tbz	w8, #0x1f, 0x4256c68 <_ChromeMain+0x42519cc>
 4256c58: f9406fe0     	ldr	x0, [sp, #0xd8]
 4256c5c: f94077e8     	ldr	x8, [sp, #0xe8]
 4256c60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256c64: 96f6c895     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256c68: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4256c6c: 36f800a8     	tbz	w8, #0x1f, 0x4256c80 <_ChromeMain+0x42519e4>
 4256c70: f9407be0     	ldr	x0, [sp, #0xf0]
 4256c74: f94083e8     	ldr	x8, [sp, #0x100]
 4256c78: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256c7c: 96f6c88f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256c80: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4256c84: 37f80e88     	tbnz	w8, #0x1f, 0x4256e54 <_ChromeMain+0x4251bb8>
 4256c88: 3943e268     	ldrb	w8, [x19, #0xf8]
 4256c8c: 6b1a011f     	cmp	w8, w26
 4256c90: 54000200     	b.eq	0x4256cd0 <_ChromeMain+0x4251a34>
 4256c94: 340004c8     	cbz	w8, 0x4256d2c <_ChromeMain+0x4251a90>
 4256c98: 39c3de68     	ldrsb	w8, [x19, #0xf7]
 4256c9c: 36f800a8     	tbz	w8, #0x1f, 0x4256cb0 <_ChromeMain+0x4251a14>
 4256ca0: f9407260     	ldr	x0, [x19, #0xe0]
 4256ca4: f9407a68     	ldr	x8, [x19, #0xf0]
 4256ca8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256cac: 96f6c883     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256cb0: 39c37e68     	ldrsb	w8, [x19, #0xdf]
 4256cb4: 36f800a8     	tbz	w8, #0x1f, 0x4256cc8 <_ChromeMain+0x4251a2c>
 4256cb8: f9406660     	ldr	x0, [x19, #0xc8]
 4256cbc: f9406e68     	ldr	x8, [x19, #0xd8]
 4256cc0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256cc4: 96f6c87d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256cc8: 3903e27f     	strb	wzr, [x19, #0xf8]
 4256ccc: 1400000e     	b	0x4256d04 <_ChromeMain+0x4251a68>
 4256cd0: 340001a8     	cbz	w8, 0x4256d04 <_ChromeMain+0x4251a68>
 4256cd4: 39c37e68     	ldrsb	w8, [x19, #0xdf]
 4256cd8: 37f845e8     	tbnz	w8, #0x1f, 0x4257594 <_ChromeMain+0x42522f8>
 4256cdc: a90cee75     	stp	x21, x27, [x19, #0xc8]
 4256ce0: f9006e77     	str	x23, [x19, #0xd8]
 4256ce4: 9240def7     	and	x23, x23, #0xffffffffffffff
 4256ce8: 9278deb5     	and	x21, x21, #0xffffffffffffff00
 4256cec: 39c3de68     	ldrsb	w8, [x19, #0xf7]
 4256cf0: 37f845c8     	tbnz	w8, #0x1f, 0x42575a8 <_ChromeMain+0x425230c>
 4256cf4: a90e6276     	stp	x22, x24, [x19, #0xe0]
 4256cf8: f9007a79     	str	x25, [x19, #0xf0]
 4256cfc: 9240df39     	and	x25, x25, #0xffffffffffffff
 4256d00: 9278ded6     	and	x22, x22, #0xffffffffffffff00
 4256d04: 360001fa     	tbz	w26, #0x0, 0x4256d40 <_ChromeMain+0x4251aa4>
 4256d08: b6f80099     	tbz	x25, #0x3f, 0x4256d18 <_ChromeMain+0x4251a7c>
 4256d0c: 9240fb21     	and	x1, x25, #0x7fffffffffffffff
 4256d10: aa1603e0     	mov	x0, x22
 4256d14: 96f6c869     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256d18: b6f80157     	tbz	x23, #0x3f, 0x4256d40 <_ChromeMain+0x4251aa4>
 4256d1c: 9240fae1     	and	x1, x23, #0x7fffffffffffffff
 4256d20: aa1503e0     	mov	x0, x21
 4256d24: 96f6c865     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256d28: 14000006     	b	0x4256d40 <_ChromeMain+0x4251aa4>
 4256d2c: a90cee75     	stp	x21, x27, [x19, #0xc8]
 4256d30: a90dda77     	stp	x23, x22, [x19, #0xd8]
 4256d34: a90ee678     	stp	x24, x25, [x19, #0xe8]
 4256d38: 52800028     	mov	w8, #0x1                ; =1
 4256d3c: 3903e268     	strb	w8, [x19, #0xf8]
 4256d40: 3943e268     	ldrb	w8, [x19, #0xf8]
 4256d44: 34000828     	cbz	w8, 0x4256e48 <_ChromeMain+0x4251bac>
 4256d48: 3943de68     	ldrb	w8, [x19, #0xf7]
 4256d4c: f9407669     	ldr	x9, [x19, #0xe8]
 4256d50: 7219011f     	tst	w8, #0x80
 4256d54: 9a881128     	csel	x8, x9, x8, ne
 4256d58: b4000288     	cbz	x8, 0x4256da8 <_ChromeMain+0x4251b0c>
 4256d5c: 91038275     	add	x21, x19, #0xe0
 4256d60: b0046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4256d64: 911f2021     	add	x1, x1, #0x7c8
 4256d68: 9105c3e8     	add	x8, sp, #0x170
 4256d6c: aa1403e0     	mov	x0, x20
 4256d70: 52800342     	mov	w2, #0x1a               ; =26
 4256d74: 975109a8     	bl	0x1699414 <_ChromeMain+0x1694178>
 4256d78: 3943de68     	ldrb	w8, [x19, #0xf7]
 4256d7c: 13001d09     	sxtb	w9, w8
 4256d80: a94e2e6a     	ldp	x10, x11, [x19, #0xe0]
 4256d84: 7100013f     	cmp	w9, #0x0
 4256d88: 9a954141     	csel	x1, x10, x21, mi
 4256d8c: 9a884162     	csel	x2, x11, x8, mi
 4256d90: 9105c3e0     	add	x0, sp, #0x170
 4256d94: 977cd58b     	bl	0x218c3c0 <_ChromeMain+0x2187124>
 4256d98: aa0003f5     	mov	x21, x0
 4256d9c: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4256da0: 37f80648     	tbnz	w8, #0x1f, 0x4256e68 <_ChromeMain+0x4251bcc>
 4256da4: 37000535     	tbnz	w21, #0x0, 0x4256e48 <_ChromeMain+0x4251bac>
 4256da8: d0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4256dac: b940b108     	ldr	w8, [x8, #0xb0]
 4256db0: 7100091f     	cmp	w8, #0x2
 4256db4: 540002cc     	b.gt	0x4256e0c <_ChromeMain+0x4251b70>
 4256db8: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256dbc: 91080821     	add	x1, x1, #0x202
 4256dc0: 9105c3f5     	add	x21, sp, #0x170
 4256dc4: 9105c3e0     	add	x0, sp, #0x170
 4256dc8: 5280f562     	mov	w2, #0x7ab              ; =1963
 4256dcc: 52800043     	mov	w3, #0x2                ; =2
 4256dd0: 970ec8df     	bl	0x60914c <_ChromeMain+0x603eb0>
 4256dd4: b004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4256dd8: 91242421     	add	x1, x1, #0x909
 4256ddc: 910042a0     	add	x0, x21, #0x10
 4256de0: 52800662     	mov	w2, #0x33               ; =51
 4256de4: 96f739b6     	bl	0x254bc <_ChromeMain+0x20220>
 4256de8: 39805e88     	ldrsb	x8, [x20, #0x17]
 4256dec: a9402a89     	ldp	x9, x10, [x20]
 4256df0: f100011f     	cmp	x8, #0x0
 4256df4: 9a944121     	csel	x1, x9, x20, mi
 4256df8: 7100011f     	cmp	w8, #0x0
 4256dfc: 9a884142     	csel	x2, x10, x8, mi
 4256e00: 96f739af     	bl	0x254bc <_ChromeMain+0x20220>
 4256e04: 9105c3e0     	add	x0, sp, #0x170
 4256e08: 970ec89e     	bl	0x609080 <_ChromeMain+0x603de4>
 4256e0c: 3943e268     	ldrb	w8, [x19, #0xf8]
 4256e10: 340001c8     	cbz	w8, 0x4256e48 <_ChromeMain+0x4251bac>
 4256e14: 39c3de68     	ldrsb	w8, [x19, #0xf7]
 4256e18: 36f800a8     	tbz	w8, #0x1f, 0x4256e2c <_ChromeMain+0x4251b90>
 4256e1c: f9407260     	ldr	x0, [x19, #0xe0]
 4256e20: f9407a68     	ldr	x8, [x19, #0xf0]
 4256e24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256e28: 96f6c824     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256e2c: 39c37e68     	ldrsb	w8, [x19, #0xdf]
 4256e30: 36f800a8     	tbz	w8, #0x1f, 0x4256e44 <_ChromeMain+0x4251ba8>
 4256e34: f9406660     	ldr	x0, [x19, #0xc8]
 4256e38: f9406e68     	ldr	x8, [x19, #0xd8]
 4256e3c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256e40: 96f6c81e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256e44: 3903e27f     	strb	wzr, [x19, #0xf8]
 4256e48: 52800028     	mov	w8, #0x1                ; =1
 4256e4c: 39000268     	strb	w8, [x19]
 4256e50: 17fffc23     	b	0x4255edc <_ChromeMain+0x4250c40>
 4256e54: f85703a0     	ldur	x0, [x29, #-0x90]
 4256e58: f85803a8     	ldur	x8, [x29, #-0x80]
 4256e5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256e60: 96f6c816     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256e64: 17ffff89     	b	0x4256c88 <_ChromeMain+0x42519ec>
 4256e68: f940bbe0     	ldr	x0, [sp, #0x170]
 4256e6c: f940c3e8     	ldr	x8, [sp, #0x180]
 4256e70: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256e74: 96f6c811     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256e78: 3607f995     	tbz	w21, #0x0, 0x4256da8 <_ChromeMain+0x4251b0c>
 4256e7c: 17fffff3     	b	0x4256e48 <_ChromeMain+0x4251bac>
 4256e80: f940bbe0     	ldr	x0, [sp, #0x170]
 4256e84: f940c3e8     	ldr	x8, [sp, #0x180]
 4256e88: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256e8c: 96f6c80b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256e90: 17ffff70     	b	0x4256c50 <_ChromeMain+0x42519b4>
 4256e94: f94057e0     	ldr	x0, [sp, #0xa8]
 4256e98: f9405fe8     	ldr	x8, [sp, #0xb8]
 4256e9c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256ea0: 96f6c806     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256ea4: 35ffe3d7     	cbnz	w23, 0x4256b1c <_ChromeMain+0x4251880>
 4256ea8: 17ffff29     	b	0x4256b4c <_ChromeMain+0x42518b0>
 4256eac: 39c4ffe8     	ldrsb	w8, [sp, #0x13f]
 4256eb0: 36f800a8     	tbz	w8, #0x1f, 0x4256ec4 <_ChromeMain+0x4251c28>
 4256eb4: f94097e0     	ldr	x0, [sp, #0x128]
 4256eb8: f9409fe8     	ldr	x8, [sp, #0x138]
 4256ebc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256ec0: 96f6c7fe     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256ec4: 390503ff     	strb	wzr, [sp, #0x140]
 4256ec8: 14000039     	b	0x4256fac <_ChromeMain+0x4251d10>
 4256ecc: 39406348     	ldrb	w8, [x26, #0x18]
 4256ed0: 34000528     	cbz	w8, 0x4256f74 <_ChromeMain+0x4251cd8>
 4256ed4: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4256ed8: 39405f5b     	ldrb	w27, [x26, #0x17]
 4256edc: a940575c     	ldp	x28, x21, [x26]
 4256ee0: f004c920     	adrp	x0, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4256ee4: 911bfc00     	add	x0, x0, #0x6ff
 4256ee8: f004c921     	adrp	x1, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4256eec: 911c3821     	add	x1, x1, #0x70e
 4256ef0: 9105c3e8     	add	x8, sp, #0x170
 4256ef4: 52800262     	mov	w2, #0x13               ; =19
 4256ef8: 96f7e762     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4256efc: 90054b40     	adrp	x0, 0xebbe000 <dyld_stub_binder+0xebbe000>
 4256f00: 910be000     	add	x0, x0, #0x2f8
 4256f04: 103ecde1     	adr	x1, 0x42d48c0 <_ChromeMain+0x42cf624>
 4256f08: d503201f     	nop
 4256f0c: 94f9f076     	bl	0x80d30e4 <_ChromeMain+0x80cde48>
 4256f10: 350037a0     	cbnz	w0, 0x4257604 <_ChromeMain+0x4252368>
 4256f14: 13001f68     	sxtb	w8, w27
 4256f18: 7100011f     	cmp	w8, #0x0
 4256f1c: 9a9b42a1     	csel	x1, x21, x27, mi
 4256f20: 9a9a4380     	csel	x0, x28, x26, mi
 4256f24: d0046582     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4256f28: 91040842     	add	x2, x2, #0x102
 4256f2c: f00565a5     	adrp	x5, 0xef0d000 <dyld_stub_binder+0xef0d000>
 4256f30: 913de0a5     	add	x5, x5, #0xf78
 4256f34: d10243a7     	sub	x7, x29, #0x90
 4256f38: 52800123     	mov	w3, #0x9                ; =9
 4256f3c: 52807d64     	mov	w4, #0x3eb              ; =1003
 4256f40: 52800206     	mov	w6, #0x10               ; =16
 4256f44: 974981ef     	bl	0x14b7700 <_ChromeMain+0x14b2464>
 4256f48: 34003600     	cbz	w0, 0x4257608 <_ChromeMain+0x425236c>
 4256f4c: 970260a6     	bl	0x2ef1e4 <_ChromeMain+0x2e9f48>
 4256f50: 385703a8     	ldurb	w8, [x29, #-0x90]
 4256f54: d10243a9     	sub	x9, x29, #0x90
 4256f58: f8401129     	ldur	x9, [x9, #0x1]
 4256f5c: f900bbe9     	str	x9, [sp, #0x170]
 4256f60: f85783a9     	ldur	x9, [x29, #-0x88]
 4256f64: 910243fb     	add	x27, sp, #0x90
 4256f68: f80e7369     	stur	x9, [x27, #0xe7]
 4256f6c: 52800029     	mov	w9, #0x1                ; =1
 4256f70: 14000002     	b	0x4256f78 <_ChromeMain+0x4251cdc>
 4256f74: 52800009     	mov	w9, #0x0                ; =0
 4256f78: 3945a3ea     	ldrb	w10, [sp, #0x168]
 4256f7c: 6b09015f     	cmp	w10, w9
 4256f80: 540002a1     	b.ne	0x4256fd4 <_ChromeMain+0x4251d38>
 4256f84: 34000669     	cbz	w9, 0x4257050 <_ChromeMain+0x4251db4>
 4256f88: 390443e8     	strb	w8, [sp, #0x110]
 4256f8c: f940bbe8     	ldr	x8, [sp, #0x170]
 4256f90: f8081368     	stur	x8, [x27, #0x81]
 4256f94: f84e7368     	ldur	x8, [x27, #0xe7]
 4256f98: f9008fe8     	str	x8, [sp, #0x118]
 4256f9c: 52800028     	mov	w8, #0x1                ; =1
 4256fa0: 390483e8     	strb	w8, [sp, #0x120]
 4256fa4: 394503e8     	ldrb	w8, [sp, #0x140]
 4256fa8: 35fff828     	cbnz	w8, 0x4256eac <_ChromeMain+0x4251c10>
 4256fac: 394583e8     	ldrb	w8, [sp, #0x160]
 4256fb0: 34000508     	cbz	w8, 0x4257050 <_ChromeMain+0x4251db4>
 4256fb4: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 4256fb8: 36f800a8     	tbz	w8, #0x1f, 0x4256fcc <_ChromeMain+0x4251d30>
 4256fbc: f940a7e0     	ldr	x0, [sp, #0x148]
 4256fc0: f940afe8     	ldr	x8, [sp, #0x158]
 4256fc4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4256fc8: 96f6c7bc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4256fcc: 390583ff     	strb	wzr, [sp, #0x160]
 4256fd0: 14000020     	b	0x4257050 <_ChromeMain+0x4251db4>
 4256fd4: 350001ca     	cbnz	w10, 0x425700c <_ChromeMain+0x4251d70>
 4256fd8: 390443e8     	strb	w8, [sp, #0x110]
 4256fdc: f940bbe8     	ldr	x8, [sp, #0x170]
 4256fe0: f8081368     	stur	x8, [x27, #0x81]
 4256fe4: f84e7368     	ldur	x8, [x27, #0xe7]
 4256fe8: f9008fe8     	str	x8, [sp, #0x118]
 4256fec: 52800028     	mov	w8, #0x1                ; =1
 4256ff0: 390483e8     	strb	w8, [sp, #0x120]
 4256ff4: 3904a3ff     	strb	wzr, [sp, #0x128]
 4256ff8: 390503ff     	strb	wzr, [sp, #0x140]
 4256ffc: 390523ff     	strb	wzr, [sp, #0x148]
 4257000: 390583ff     	strb	wzr, [sp, #0x160]
 4257004: 3905a3e8     	strb	w8, [sp, #0x168]
 4257008: 14000012     	b	0x4257050 <_ChromeMain+0x4251db4>
 425700c: 394583e8     	ldrb	w8, [sp, #0x160]
 4257010: 360000e8     	tbz	w8, #0x0, 0x425702c <_ChromeMain+0x4251d90>
 4257014: 39c57fe8     	ldrsb	w8, [sp, #0x15f]
 4257018: 36f800a8     	tbz	w8, #0x1f, 0x425702c <_ChromeMain+0x4251d90>
 425701c: f940a7e0     	ldr	x0, [sp, #0x148]
 4257020: f940afe8     	ldr	x8, [sp, #0x158]
 4257024: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257028: 96f6c7a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425702c: 394503e8     	ldrb	w8, [sp, #0x140]
 4257030: 360000e8     	tbz	w8, #0x0, 0x425704c <_ChromeMain+0x4251db0>
 4257034: 39c4ffe8     	ldrsb	w8, [sp, #0x13f]
 4257038: 36f800a8     	tbz	w8, #0x1f, 0x425704c <_ChromeMain+0x4251db0>
 425703c: f94097e0     	ldr	x0, [sp, #0x128]
 4257040: f9409fe8     	ldr	x8, [sp, #0x138]
 4257044: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257048: 96f6c79c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425704c: 3905a3ff     	strb	wzr, [sp, #0x168]
 4257050: 3945a3e8     	ldrb	w8, [sp, #0x168]
 4257054: 37074d88     	tbnz	w8, #0x0, 0x4255a04 <_ChromeMain+0x4250768>
 4257058: b0056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 425705c: b940b108     	ldr	w8, [x8, #0xb0]
 4257060: 7100091f     	cmp	w8, #0x2
 4257064: 540006ac     	b.gt	0x4257138 <_ChromeMain+0x4251e9c>
 4257068: 9004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425706c: 91080821     	add	x1, x1, #0x202
 4257070: 9105c3f4     	add	x20, sp, #0x170
 4257074: 9105c3e0     	add	x0, sp, #0x170
 4257078: 5280eaa2     	mov	w2, #0x755              ; =1877
 425707c: 52800043     	mov	w3, #0x2                ; =2
 4257080: 970ec833     	bl	0x60914c <_ChromeMain+0x603eb0>
 4257084: 9004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4257088: 910efc21     	add	x1, x1, #0x3bf
 425708c: 91004280     	add	x0, x20, #0x10
 4257090: 52800222     	mov	w2, #0x11               ; =17
 4257094: 96f7390a     	bl	0x254bc <_ChromeMain+0x20220>
 4257098: aa0003f4     	mov	x20, x0
 425709c: 9103c3f5     	add	x21, sp, #0xf0
 42570a0: 9103c3e8     	add	x8, sp, #0xf0
 42570a4: aa1603e0     	mov	x0, x22
 42570a8: 9400237a     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42570ac: 39841fe8     	ldrsb	x8, [sp, #0x107]
 42570b0: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 42570b4: f100011f     	cmp	x8, #0x0
 42570b8: 9a954120     	csel	x0, x9, x21, mi
 42570bc: 7100011f     	cmp	w8, #0x0
 42570c0: 9a884141     	csel	x1, x10, x8, mi
 42570c4: d10243b5     	sub	x21, x29, #0x90
 42570c8: d10243a8     	sub	x8, x29, #0x90
 42570cc: 97352f0f     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42570d0: 389873a8     	ldursb	x8, [x29, #-0x79]
 42570d4: a9772ba9     	ldp	x9, x10, [x29, #-0x90]
 42570d8: f100011f     	cmp	x8, #0x0
 42570dc: 9a954121     	csel	x1, x9, x21, mi
 42570e0: 7100011f     	cmp	w8, #0x0
 42570e4: 9a884142     	csel	x2, x10, x8, mi
 42570e8: aa1403e0     	mov	x0, x20
 42570ec: 96f738f4     	bl	0x254bc <_ChromeMain+0x20220>
 42570f0: 9004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42570f4: 910f4421     	add	x1, x1, #0x3d1
 42570f8: 528002e2     	mov	w2, #0x17               ; =23
 42570fc: 96f738f0     	bl	0x254bc <_ChromeMain+0x20220>
 4257100: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4257104: 36f800a8     	tbz	w8, #0x1f, 0x4257118 <_ChromeMain+0x4251e7c>
 4257108: f85703a0     	ldur	x0, [x29, #-0x90]
 425710c: f85803a8     	ldur	x8, [x29, #-0x80]
 4257110: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257114: 96f6c769     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257118: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 425711c: 36f800a8     	tbz	w8, #0x1f, 0x4257130 <_ChromeMain+0x4251e94>
 4257120: f9407be0     	ldr	x0, [sp, #0xf0]
 4257124: f94083e8     	ldr	x8, [sp, #0x100]
 4257128: d37ff901     	lsl	x1, x8, #1
 425712c: 96f6c763     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257130: 9105c3e0     	add	x0, sp, #0x170
 4257134: 970ec7d3     	bl	0x609080 <_ChromeMain+0x603de4>
 4257138: 9103c3f4     	add	x20, sp, #0xf0
 425713c: 9103c3e8     	add	x8, sp, #0xf0
 4257140: aa1603e0     	mov	x0, x22
 4257144: 94002353     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4257148: 39841fe8     	ldrsb	x8, [sp, #0x107]
 425714c: a94f2be9     	ldp	x9, x10, [sp, #0xf0]
 4257150: f100011f     	cmp	x8, #0x0
 4257154: 9a944120     	csel	x0, x9, x20, mi
 4257158: 7100011f     	cmp	w8, #0x0
 425715c: 9a884141     	csel	x1, x10, x8, mi
 4257160: d10243a8     	sub	x8, x29, #0x90
 4257164: 97352ee9     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4257168: 38d873a8     	ldursb	w8, [x29, #-0x79]
 425716c: 12001d17     	and	w23, w8, #0xff
 4257170: 37f80908     	tbnz	w8, #0x1f, 0x4257290 <_ChromeMain+0x4251ff4>
 4257174: 92401d14     	and	x20, x8, #0xff
 4257178: 51001ae8     	sub	w8, w23, #0x6
 425717c: 7100451f     	cmp	w8, #0x11
 4257180: 54000963     	b.lo	0x42572ac <_ChromeMain+0x4252010>
 4257184: d10243b5     	sub	x21, x29, #0x90
 4257188: 9004c656     	adrp	x22, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425718c: 910fa6d6     	add	x22, x22, #0x3e9
 4257190: b40001b4     	cbz	x20, 0x42571c4 <_ChromeMain+0x4251f28>
 4257194: 8b1402a8     	add	x8, x21, x20
 4257198: eb15011f     	cmp	x8, x21
 425719c: 54ff7e83     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42571a0: eb16011f     	cmp	x8, x22
 42571a4: fa5682a2     	ccmp	x21, x22, #0x2, hi
 42571a8: 52800228     	mov	w8, #0x11               ; =17
 42571ac: 9a9f9108     	csel	x8, x8, xzr, ls
 42571b0: 8b0802d6     	add	x22, x22, x8
 42571b4: 910046a0     	add	x0, x21, #0x11
 42571b8: aa1503e1     	mov	x1, x21
 42571bc: aa1403e2     	mov	x2, x20
 42571c0: 94f6e043     	bl	0x800f2cc <_ChromeMain+0x800a030>
 42571c4: 3dc002c0     	ldr	q0, [x22]
 42571c8: 3d8002a0     	str	q0, [x21]
 42571cc: 394042c8     	ldrb	w8, [x22, #0x10]
 42571d0: 390042a8     	strb	w8, [x21, #0x10]
 42571d4: 91004688     	add	x8, x20, #0x11
 42571d8: 38d873a9     	ldursb	w9, [x29, #-0x79]
 42571dc: 37f80569     	tbnz	w9, #0x1f, 0x4257288 <_ChromeMain+0x4251fec>
 42571e0: 12001909     	and	w9, w8, #0x7f
 42571e4: 381873a9     	sturb	w9, [x29, #-0x79]
 42571e8: 38286abf     	strb	wzr, [x21, x8]
 42571ec: d10243a8     	sub	x8, x29, #0x90
 42571f0: 3dc00100     	ldr	q0, [x8]
 42571f4: 3d803b60     	str	q0, [x27, #0xe0]
 42571f8: f85803a8     	ldur	x8, [x29, #-0x80]
 42571fc: f900c3e8     	str	x8, [sp, #0x180]
 4257200: a937ffbf     	stp	xzr, xzr, [x29, #-0x88]
 4257204: f81703bf     	stur	xzr, [x29, #-0x90]
 4257208: 9004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425720c: 910fec21     	add	x1, x1, #0x3fb
 4257210: 9105c3e0     	add	x0, sp, #0x170
 4257214: 528001e2     	mov	w2, #0xf                ; =15
 4257218: 96f90c82     	bl	0x9a420 <_ChromeMain+0x95184>
 425721c: f9400014     	ldr	x20, [x0]
 4257220: 3cc08000     	ldur	q0, [x0, #0x8]
 4257224: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4257228: f900001f     	str	xzr, [x0]
 425722c: 39c07e68     	ldrsb	w8, [x19, #0x1f]
 4257230: 37f80728     	tbnz	w8, #0x1f, 0x4257314 <_ChromeMain+0x4252078>
 4257234: f9000674     	str	x20, [x19, #0x8]
 4257238: 3d800660     	str	q0, [x19, #0x10]
 425723c: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4257240: 36f800a8     	tbz	w8, #0x1f, 0x4257254 <_ChromeMain+0x4251fb8>
 4257244: f940bbe0     	ldr	x0, [sp, #0x170]
 4257248: f940c3e8     	ldr	x8, [sp, #0x180]
 425724c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257250: 96f6c71a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257254: 38d873a8     	ldursb	w8, [x29, #-0x79]
 4257258: 36f800a8     	tbz	w8, #0x1f, 0x425726c <_ChromeMain+0x4251fd0>
 425725c: f85703a0     	ldur	x0, [x29, #-0x90]
 4257260: f85803a8     	ldur	x8, [x29, #-0x80]
 4257264: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257268: 96f6c714     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425726c: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 4257270: 36ff7588     	tbz	w8, #0x1f, 0x4256120 <_ChromeMain+0x4250e84>
 4257274: f9407be0     	ldr	x0, [sp, #0xf0]
 4257278: f94083e8     	ldr	x8, [sp, #0x100]
 425727c: d37ff901     	lsl	x1, x8, #1
 4257280: 96f6c70e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257284: 17fffba7     	b	0x4256120 <_ChromeMain+0x4250e84>
 4257288: f81783a8     	stur	x8, [x29, #-0x88]
 425728c: 17ffffd7     	b	0x42571e8 <_ChromeMain+0x4251f4c>
 4257290: a977a3b4     	ldp	x20, x8, [x29, #-0x88]
 4257294: 9240f908     	and	x8, x8, #0x7fffffffffffffff
 4257298: cb080289     	sub	x9, x20, x8
 425729c: b100493f     	cmn	x9, #0x12
 42572a0: 54000528     	b.hi	0x4257344 <_ChromeMain+0x42520a8>
 42572a4: f85703b5     	ldur	x21, [x29, #-0x90]
 42572a8: 17ffffb8     	b	0x4257188 <_ChromeMain+0x4251eec>
 42572ac: 91004698     	add	x24, x20, #0x11
 42572b0: 52800600     	mov	w0, #0x30               ; =48
 42572b4: 96f6e02d     	bl	0xf368 <_ChromeMain+0xa0cc>
 42572b8: aa0003f5     	mov	x21, x0
 42572bc: 92800228     	mov	x8, #-0x12              ; =-18
 42572c0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 42572c4: 91010916     	add	x22, x8, #0x42
 42572c8: d10243a1     	sub	x1, x29, #0x90
 42572cc: 910046a8     	add	x8, x21, #0x11
 42572d0: eb15011f     	cmp	x8, x21
 42572d4: 54ff74c3     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42572d8: 9004c649     	adrp	x9, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42572dc: 910fa529     	add	x9, x9, #0x3e9
 42572e0: eb09011f     	cmp	x8, x9
 42572e4: fa4982a2     	ccmp	x21, x9, #0x2, hi
 42572e8: 54ff7429     	b.ls	0x425616c <_ChromeMain+0x4250ed0>
 42572ec: 5280040a     	mov	w10, #0x20              ; =32
 42572f0: 390042aa     	strb	w10, [x21, #0x10]
 42572f4: 3dc00120     	ldr	q0, [x9]
 42572f8: 3d8002a0     	str	q0, [x21]
 42572fc: b5001174     	cbnz	x20, 0x4257528 <_ChromeMain+0x425228c>
 4257300: 38386abf     	strb	wzr, [x21, x24]
 4257304: 37380177     	tbnz	w23, #0x7, 0x4257330 <_ChromeMain+0x4252094>
 4257308: a93763b5     	stp	x21, x24, [x29, #-0x90]
 425730c: f81803b6     	stur	x22, [x29, #-0x80]
 4257310: 17ffffb7     	b	0x42571ec <_ChromeMain+0x4251f50>
 4257314: f9400660     	ldr	x0, [x19, #0x8]
 4257318: f9400e68     	ldr	x8, [x19, #0x18]
 425731c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257320: 3d8003e0     	str	q0, [sp]
 4257324: 96f6c6e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257328: 3dc003e0     	ldr	q0, [sp]
 425732c: 17ffffc2     	b	0x4257234 <_ChromeMain+0x4251f98>
 4257330: f85703a0     	ldur	x0, [x29, #-0x90]
 4257334: f85803a8     	ldur	x8, [x29, #-0x80]
 4257338: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425733c: 96f6c6df     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257340: 17fffff2     	b	0x4257308 <_ChromeMain+0x425206c>
 4257344: 91004698     	add	x24, x20, #0x11
 4257348: 92800229     	mov	x9, #-0x12              ; =-18
 425734c: f2efffe9     	movk	x9, #0x7fff, lsl #48
 4257350: eb09031f     	cmp	x24, x9
 4257354: 54001608     	b.hi	0x4257614 <_ChromeMain+0x4252378>
 4257358: d1000509     	sub	x9, x8, #0x1
 425735c: d37ff928     	lsl	x8, x9, #1
 4257360: eb09071f     	cmp	x24, x9, lsl #1
 4257364: 9a888308     	csel	x8, x24, x8, hi
 4257368: 9280030a     	mov	x10, #-0x19             ; =-25
 425736c: f2e7ffea     	movk	x10, #0x3fff, lsl #48
 4257370: eb0a013f     	cmp	x9, x10
 4257374: 54001588     	b.hi	0x4257624 <_ChromeMain+0x4252388>
 4257378: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 425737c: 91004116     	add	x22, x8, #0x10
 4257380: aa1603e0     	mov	x0, x22
 4257384: 96f6dff9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4257388: aa0003f5     	mov	x21, x0
 425738c: f85703a1     	ldur	x1, [x29, #-0x90]
 4257390: b24102d6     	orr	x22, x22, #0x8000000000000000
 4257394: 17ffffce     	b	0x42572cc <_ChromeMain+0x4252030>
 4257398: 13001d09     	sxtb	w9, w8
 425739c: 7100013f     	cmp	w9, #0x0
 42573a0: a9402b29     	ldp	x9, x10, [x25]
 42573a4: 9a994121     	csel	x1, x9, x25, mi
 42573a8: 9a884142     	csel	x2, x10, x8, mi
 42573ac: 910062e0     	add	x0, x23, #0x18
 42573b0: 9719dd21     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 42573b4: 17fff979     	b	0x4255998 <_ChromeMain+0x42506fc>
 42573b8: a9400901     	ldp	x1, x2, [x8]
 42573bc: 17fffd6c     	b	0x425696c <_ChromeMain+0x42516d0>
 42573c0: f81783a8     	stur	x8, [x29, #-0x88]
 42573c4: 17fffcc9     	b	0x42566e8 <_ChromeMain+0x425144c>
 42573c8: a977a3b5     	ldp	x21, x8, [x29, #-0x88]
 42573cc: 9240f908     	and	x8, x8, #0x7fffffffffffffff
 42573d0: cb0802a9     	sub	x9, x21, x8
 42573d4: b100413f     	cmn	x9, #0x10
 42573d8: 54000068     	b.hi	0x42573e4 <_ChromeMain+0x4252148>
 42573dc: f85703b6     	ldur	x22, [x29, #-0x90]
 42573e0: 17fffcaa     	b	0x4256688 <_ChromeMain+0x42513ec>
 42573e4: 91003eb9     	add	x25, x21, #0xf
 42573e8: 92800229     	mov	x9, #-0x12              ; =-18
 42573ec: f2efffe9     	movk	x9, #0x7fff, lsl #48
 42573f0: eb09033f     	cmp	x25, x9
 42573f4: 54001108     	b.hi	0x4257614 <_ChromeMain+0x4252378>
 42573f8: d1000509     	sub	x9, x8, #0x1
 42573fc: d37ff928     	lsl	x8, x9, #1
 4257400: eb09073f     	cmp	x25, x9, lsl #1
 4257404: 9a888328     	csel	x8, x25, x8, hi
 4257408: 9280030a     	mov	x10, #-0x19             ; =-25
 425740c: f2e7ffea     	movk	x10, #0x3fff, lsl #48
 4257410: eb0a013f     	cmp	x9, x10
 4257414: 54001128     	b.hi	0x4257638 <_ChromeMain+0x425239c>
 4257418: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 425741c: 91004117     	add	x23, x8, #0x10
 4257420: aa1703e0     	mov	x0, x23
 4257424: 96f6dfd1     	bl	0xf368 <_ChromeMain+0xa0cc>
 4257428: aa0003f6     	mov	x22, x0
 425742c: f85703a1     	ldur	x1, [x29, #-0x90]
 4257430: b24102f7     	orr	x23, x23, #0x8000000000000000
 4257434: 14000009     	b	0x4257458 <_ChromeMain+0x42521bc>
 4257438: 91003eb9     	add	x25, x21, #0xf
 425743c: 52800600     	mov	w0, #0x30               ; =48
 4257440: 96f6dfca     	bl	0xf368 <_ChromeMain+0xa0cc>
 4257444: aa0003f6     	mov	x22, x0
 4257448: 92800228     	mov	x8, #-0x12              ; =-18
 425744c: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4257450: 91010917     	add	x23, x8, #0x42
 4257454: d10243a1     	sub	x1, x29, #0x90
 4257458: 91003ec8     	add	x8, x22, #0xf
 425745c: eb16011f     	cmp	x8, x22
 4257460: 54ff6863     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 4257464: b004bc89     	adrp	x9, 0xd9e8000 <dyld_stub_binder+0xd9e8000>
 4257468: 91168129     	add	x9, x9, #0x5a0
 425746c: eb09011f     	cmp	x8, x9
 4257470: fa4982c2     	ccmp	x22, x9, #0x2, hi
 4257474: 54ff67c9     	b.ls	0x425616c <_ChromeMain+0x4250ed0>
 4257478: f940012a     	ldr	x10, [x9]
 425747c: f90002ca     	str	x10, [x22]
 4257480: f8407129     	ldur	x9, [x9, #0x7]
 4257484: f80072c9     	stur	x9, [x22, #0x7]
 4257488: b5000175     	cbnz	x21, 0x42574b4 <_ChromeMain+0x4252218>
 425748c: 38396adf     	strb	wzr, [x22, x25]
 4257490: 37380098     	tbnz	w24, #0x7, 0x42574a0 <_ChromeMain+0x4252204>
 4257494: a93767b6     	stp	x22, x25, [x29, #-0x90]
 4257498: f81803b7     	stur	x23, [x29, #-0x80]
 425749c: 17fffc94     	b	0x42566ec <_ChromeMain+0x4251450>
 42574a0: f85703a0     	ldur	x0, [x29, #-0x90]
 42574a4: f85803a8     	ldur	x8, [x29, #-0x80]
 42574a8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42574ac: 96f6c683     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42574b0: 17fffff9     	b	0x4257494 <_ChromeMain+0x42521f8>
 42574b4: 8b150109     	add	x9, x8, x21
 42574b8: eb08013f     	cmp	x9, x8
 42574bc: 54ff6583     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42574c0: eb08003f     	cmp	x1, x8
 42574c4: 54000063     	b.lo	0x42574d0 <_ChromeMain+0x4252234>
 42574c8: eb09003f     	cmp	x1, x9
 42574cc: 54ff6503     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 42574d0: 91003ec0     	add	x0, x22, #0xf
 42574d4: aa1503e2     	mov	x2, x21
 42574d8: 94f6df7d     	bl	0x800f2cc <_ChromeMain+0x800a030>
 42574dc: 910243fa     	add	x26, sp, #0x90
 42574e0: 17ffffeb     	b	0x425748c <_ChromeMain+0x42521f0>
 42574e4: f940bbe0     	ldr	x0, [sp, #0x170]
 42574e8: f940c3e8     	ldr	x8, [sp, #0x180]
 42574ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42574f0: 96f6c672     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42574f4: 17fffcfb     	b	0x42568e0 <_ChromeMain+0x4251644>
 42574f8: f940bbe0     	ldr	x0, [sp, #0x170]
 42574fc: f940c3e8     	ldr	x8, [sp, #0x180]
 4257500: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257504: 96f6c66d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257508: 17fffce0     	b	0x4256888 <_ChromeMain+0x42515ec>
 425750c: f9400409     	ldr	x9, [x0, #0x8]
 4257510: 17fffd21     	b	0x4256994 <_ChromeMain+0x42516f8>
 4257514: f94063e0     	ldr	x0, [sp, #0xc0]
 4257518: f9406be8     	ldr	x8, [sp, #0xd0]
 425751c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257520: 96f6c666     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257524: 17fffd45     	b	0x4256a38 <_ChromeMain+0x425179c>
 4257528: 8b140109     	add	x9, x8, x20
 425752c: eb08013f     	cmp	x9, x8
 4257530: 54ff61e3     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 4257534: eb08003f     	cmp	x1, x8
 4257538: 54000063     	b.lo	0x4257544 <_ChromeMain+0x42522a8>
 425753c: eb09003f     	cmp	x1, x9
 4257540: 54ff6163     	b.lo	0x425616c <_ChromeMain+0x4250ed0>
 4257544: 910046a0     	add	x0, x21, #0x11
 4257548: aa1403e2     	mov	x2, x20
 425754c: 94f6df60     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4257550: 17ffff6c     	b	0x4257300 <_ChromeMain+0x4252064>
 4257554: f9400660     	ldr	x0, [x19, #0x8]
 4257558: f9400e68     	ldr	x8, [x19, #0x18]
 425755c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257560: 3d8003e0     	str	q0, [sp]
 4257564: 96f6c655     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257568: 3dc003e0     	ldr	q0, [sp]
 425756c: 17fffc71     	b	0x4256730 <_ChromeMain+0x4251494>
 4257570: a9400801     	ldp	x1, x2, [x0]
 4257574: 9103c3e0     	add	x0, sp, #0xf0
 4257578: 9709454f     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 425757c: 17fffd11     	b	0x42569c0 <_ChromeMain+0x4251724>
 4257580: 3dc03b40     	ldr	q0, [x26, #0xe0]
 4257584: 3d801b40     	str	q0, [x26, #0x60]
 4257588: f940c3e8     	ldr	x8, [sp, #0x180]
 425758c: f90083e8     	str	x8, [sp, #0x100]
 4257590: 17fffcd4     	b	0x42568e0 <_ChromeMain+0x4251644>
 4257594: f9406660     	ldr	x0, [x19, #0xc8]
 4257598: f9406e68     	ldr	x8, [x19, #0xd8]
 425759c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42575a0: 96f6c646     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42575a4: 17fffdce     	b	0x4256cdc <_ChromeMain+0x4251a40>
 42575a8: f9407260     	ldr	x0, [x19, #0xe0]
 42575ac: f9407a68     	ldr	x8, [x19, #0xf0]
 42575b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42575b4: 96f6c641     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42575b8: 17fffdcf     	b	0x4256cf4 <_ChromeMain+0x4251a58>
 42575bc: 3cca83e0     	ldur	q0, [sp, #0xa8]
 42575c0: 3d800f40     	str	q0, [x26, #0x30]
 42575c4: f9405fe8     	ldr	x8, [sp, #0xb8]
 42575c8: f9006be8     	str	x8, [sp, #0xd0]
 42575cc: 17fffd32     	b	0x4256a94 <_ChromeMain+0x42517f8>
 42575d0: f940bbe0     	ldr	x0, [sp, #0x170]
 42575d4: f940c3e8     	ldr	x8, [sp, #0x180]
 42575d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42575dc: 96f6c637     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42575e0: 17fffd57     	b	0x4256b3c <_ChromeMain+0x42518a0>
 42575e4: 94f6b35f     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 42575e8: 7100011f     	cmp	w8, #0x0
 42575ec: a9402809     	ldp	x9, x10, [x0]
 42575f0: 9a804121     	csel	x1, x9, x0, mi
 42575f4: 9a884142     	csel	x2, x10, x8, mi
 42575f8: 9103c3e0     	add	x0, sp, #0xf0
 42575fc: 97094581     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4257600: 17fffcf0     	b	0x42569c0 <_ChromeMain+0x4251724>
 4257604: 94f7fa10     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
 4257608: d4200000     	brk	#0
 425760c: d4400000     	hlt	#0
 4257610: d4200020     	brk	#0x1
 4257614: 9426a35e     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 4257618: a90f7fff     	stp	xzr, xzr, [sp, #0xf0]
 425761c: f90083ff     	str	xzr, [sp, #0x100]
 4257620: 17fffcae     	b	0x42568d8 <_ChromeMain+0x425163c>
 4257624: b27cebf6     	mov	x22, #0x7ffffffffffffff0 ; =9223372036854775792
 4257628: 17ffff56     	b	0x4257380 <_ChromeMain+0x42520e4>
 425762c: a90c7fff     	stp	xzr, xzr, [sp, #0xc0]
 4257630: f9006bff     	str	xzr, [sp, #0xd0]
 4257634: 17fffd18     	b	0x4256a94 <_ChromeMain+0x42517f8>
 4257638: b27cebf7     	mov	x23, #0x7ffffffffffffff0 ; =9223372036854775792
 425763c: 17ffff79     	b	0x4257420 <_ChromeMain+0x4252184>
