
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46398c8: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 46398cc: a9015ff8     	stp	x24, x23, [sp, #0x10]
 46398d0: a90257f6     	stp	x22, x21, [sp, #0x20]
 46398d4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 46398d8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 46398dc: 910103fd     	add	x29, sp, #0x40
 46398e0: d11583ff     	sub	sp, sp, #0x560
 46398e4: f949bc08     	ldr	x8, [x0, #0x1378]
 46398e8: eb08003f     	cmp	x1, x8
 46398ec: 54000720     	b.eq	0x46399d0 <_ChromeMain+0x4634734>
 46398f0: 911583ff     	add	sp, sp, #0x560
 46398f4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46398f8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46398fc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4639900: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4639904: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4639908: d65f03c0     	ret
 463990c: d2800014     	mov	x20, #0x0               ; =0
 4639910: aa1403e0     	mov	x0, x20
 4639914: 97eb272b     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 4639918: 92600008     	and	x8, x0, #0x100000000
 463991c: 2a0003e9     	mov	w9, w0
 4639920: aa090108     	orr	x8, x8, x9
 4639924: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 4639928: eb09011f     	cmp	x8, x9
 463992c: 9a898102     	csel	x2, x8, x9, hi
 4639930: 90048560     	adrp	x0, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4639934: 9105b800     	add	x0, x0, #0x16e
 4639938: 90048563     	adrp	x3, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463993c: 9106a863     	add	x3, x3, #0x1aa
 4639940: 9108e3f4     	add	x20, sp, #0x238
 4639944: 9108e3e8     	add	x8, sp, #0x238
 4639948: 52800121     	mov	w1, #0x9                ; =9
 463994c: 528000c4     	mov	w4, #0x6                ; =6
 4639950: 97fcadec     	bl	0x4565100 <_ChromeMain+0x455fe64>
 4639954: f9422e68     	ldr	x8, [x19, #0x458]
 4639958: b40000a8     	cbz	x8, 0x463996c <_ChromeMain+0x46346d0>
 463995c: f9429d15     	ldr	x21, [x8, #0x538]
 4639960: b4000075     	cbz	x21, 0x463996c <_ChromeMain+0x46346d0>
 4639964: 39624268     	ldrb	w8, [x19, #0x890]
 4639968: 35008f28     	cbnz	w8, 0x463ab4c <_ChromeMain+0x46358b0>
 463996c: 9101c280     	add	x0, x20, #0x70
 4639970: d2800001     	mov	x1, #0x0                ; =0
 4639974: 96e7b8d1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4639978: 91008280     	add	x0, x20, #0x20
 463997c: 96e7b8bf     	bl	0x27c78 <_ChromeMain+0x229dc>
 4639980: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 4639984: 36f800a8     	tbz	w8, #0x1f, 0x4639998 <_ChromeMain+0x46346fc>
 4639988: f9411fe0     	ldr	x0, [sp, #0x238]
 463998c: f94127e8     	ldr	x8, [sp, #0x248]
 4639990: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4639994: 96e73d49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639998: 394623e8     	ldrb	w8, [sp, #0x188]
 463999c: 34fffaa8     	cbz	w8, 0x46398f0 <_ChromeMain+0x4634654>
 46399a0: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 46399a4: 36fffa68     	tbz	w8, #0x1f, 0x46398f0 <_ChromeMain+0x4634654>
 46399a8: f940bbe0     	ldr	x0, [sp, #0x170]
 46399ac: f940c3e8     	ldr	x8, [sp, #0x180]
 46399b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46399b4: 96e73d41     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46399b8: 17ffffce     	b	0x46398f0 <_ChromeMain+0x4634654>
 46399bc: f949c661     	ldr	x1, [x19, #0x1388]
 46399c0: f949ca62     	ldr	x2, [x19, #0x1390]
 46399c4: 9105c3e0     	add	x0, sp, #0x170
 46399c8: 96e77a14     	bl	0x18218 <_ChromeMain+0x12f7c>
 46399cc: 1400000f     	b	0x4639a08 <_ChromeMain+0x463476c>
 46399d0: aa0003f3     	mov	x19, x0
 46399d4: 91400416     	add	x22, x0, #0x1, lsl #12  ; =0x1000
 46399d8: 6f00e400     	movi.2d	v0, #0000000000000000
 46399dc: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 46399e0: 394e82c8     	ldrb	w8, [x22, #0x3a0]
 46399e4: 34000168     	cbz	w8, 0x4639a10 <_ChromeMain+0x4634774>
 46399e8: 39ce7ec8     	ldrsb	w8, [x22, #0x39f]
 46399ec: 37fffe88     	tbnz	w8, #0x1f, 0x46399bc <_ChromeMain+0x4634720>
 46399f0: 52827108     	mov	w8, #0x1388             ; =5000
 46399f4: 8b080268     	add	x8, x19, x8
 46399f8: 3dc00100     	ldr	q0, [x8]
 46399fc: 3d805fe0     	str	q0, [sp, #0x170]
 4639a00: f9400908     	ldr	x8, [x8, #0x10]
 4639a04: f900c3e8     	str	x8, [sp, #0x180]
 4639a08: 52800028     	mov	w8, #0x1                ; =1
 4639a0c: 390623e8     	strb	w8, [sp, #0x188]
 4639a10: b953ca75     	ldr	w21, [x19, #0x13c8]
 4639a14: f949c260     	ldr	x0, [x19, #0x1380]
 4639a18: f909c27f     	str	xzr, [x19, #0x1380]
 4639a1c: b4000080     	cbz	x0, 0x4639a2c <_ChromeMain+0x4634790>
 4639a20: 978a053f     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 4639a24: 52800301     	mov	w1, #0x18               ; =24
 4639a28: 96e73d24     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639a2c: f949be60     	ldr	x0, [x19, #0x1378]
 4639a30: f909be7f     	str	xzr, [x19, #0x1378]
 4639a34: b4000080     	cbz	x0, 0x4639a44 <_ChromeMain+0x46347a8>
 4639a38: f9400008     	ldr	x8, [x0]
 4639a3c: f9400508     	ldr	x8, [x8, #0x8]
 4639a40: d63f0100     	blr	x8
 4639a44: 394e82c8     	ldrb	w8, [x22, #0x3a0]
 4639a48: 34000108     	cbz	w8, 0x4639a68 <_ChromeMain+0x46347cc>
 4639a4c: 39ce7ec8     	ldrsb	w8, [x22, #0x39f]
 4639a50: 36f800a8     	tbz	w8, #0x1f, 0x4639a64 <_ChromeMain+0x46347c8>
 4639a54: f949c660     	ldr	x0, [x19, #0x1388]
 4639a58: f949ce68     	ldr	x8, [x19, #0x1398]
 4639a5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4639a60: 96e73d16     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639a64: 390e82df     	strb	wzr, [x22, #0x3a0]
 4639a68: b913ca7f     	str	wzr, [x19, #0x13c8]
 4639a6c: f949d674     	ldr	x20, [x19, #0x13a8]
 4639a70: b40003d4     	cbz	x20, 0x4639ae8 <_ChromeMain+0x463484c>
 4639a74: f9400680     	ldr	x0, [x20, #0x8]
 4639a78: b40000c0     	cbz	x0, 0x4639a90 <_ChromeMain+0x46347f4>
 4639a7c: 3944bc08     	ldrb	w8, [x0, #0x12f]
 4639a80: f9409009     	ldr	x9, [x0, #0x120]
 4639a84: 7219011f     	tst	w8, #0x80
 4639a88: 9a881128     	csel	x8, x9, x8, ne
 4639a8c: b4000808     	cbz	x8, 0x4639b8c <_ChromeMain+0x46348f0>
 4639a90: f909d67f     	str	xzr, [x19, #0x13a8]
 4639a94: f004e8c8     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4639a98: 9127e108     	add	x8, x8, #0x9f8
 4639a9c: f9000288     	str	x8, [x20]
 4639aa0: 91008280     	add	x0, x20, #0x20
 4639aa4: 973c5df9     	bl	0x1551288 <_ChromeMain+0x154bfec>
 4639aa8: f9400a80     	ldr	x0, [x20, #0x10]
 4639aac: b50007e0     	cbnz	x0, 0x4639ba8 <_ChromeMain+0x463490c>
 4639ab0: f9400680     	ldr	x0, [x20, #0x8]
 4639ab4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4639ab8: b0052bc9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4639abc: f9404529     	ldr	x9, [x9, #0x88]
 4639ac0: eb09011f     	cmp	x8, x9
 4639ac4: 54000041     	b.ne	0x4639acc <_ChromeMain+0x4634830>
 4639ac8: 96e7a3dd     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4639acc: aa1403e0     	mov	x0, x20
 4639ad0: 52800601     	mov	w1, #0x30               ; =48
 4639ad4: 96e73cf9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639ad8: 39cf1ec8     	ldrsb	w8, [x22, #0x3c7]
 4639adc: 37f80508     	tbnz	w8, #0x1f, 0x4639b7c <_ChromeMain+0x46348e0>
 4639ae0: 7927627f     	strh	wzr, [x19, #0x13b0]
 4639ae4: 390f1edf     	strb	wzr, [x22, #0x3c7]
 4639ae8: 910643f6     	add	x22, sp, #0x190
 4639aec: 71002ebf     	cmp	w21, #0xb
 4639af0: 5400090d     	b.le	0x4639c10 <_ChromeMain+0x4634974>
 4639af4: 710032bf     	cmp	w21, #0xc
 4639af8: 540011e0     	b.eq	0x4639d34 <_ChromeMain+0x4634a98>
 4639afc: 710036bf     	cmp	w21, #0xd
 4639b00: 54000621     	b.ne	0x4639bc4 <_ChromeMain+0x4634928>
 4639b04: f9422e68     	ldr	x8, [x19, #0x458]
 4639b08: b4fff028     	cbz	x8, 0x463990c <_ChromeMain+0x4634670>
 4639b0c: f9429d08     	ldr	x8, [x8, #0x538]
 4639b10: f9403514     	ldr	x20, [x8, #0x68]
 4639b14: b4ffeff4     	cbz	x20, 0x4639910 <_ChromeMain+0x4634674>
 4639b18: 39412288     	ldrb	w8, [x20, #0x48]
 4639b1c: 3707efa8     	tbnz	w8, #0x0, 0x4639910 <_ChromeMain+0x4634674>
 4639b20: f9400288     	ldr	x8, [x20]
 4639b24: f940b508     	ldr	x8, [x8, #0x168]
 4639b28: aa1403e0     	mov	x0, x20
 4639b2c: d63f0100     	blr	x8
 4639b30: b4ffef00     	cbz	x0, 0x4639910 <_ChromeMain+0x4634674>
 4639b34: aa0003f5     	mov	x21, x0
 4639b38: f0044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4639b3c: 91018021     	add	x1, x1, #0x60
 4639b40: 52800202     	mov	w2, #0x10               ; =16
 4639b44: 96fa0c42     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 4639b48: b4ffee40     	cbz	x0, 0x4639910 <_ChromeMain+0x4634674>
 4639b4c: f0044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4639b50: 91018021     	add	x1, x1, #0x60
 4639b54: aa1503e0     	mov	x0, x21
 4639b58: 52800202     	mov	w2, #0x10               ; =16
 4639b5c: 96f213b3     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 4639b60: 3100041f     	cmn	w0, #0x1
 4639b64: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 4639b68: 9a9fc109     	csel	x9, x8, xzr, gt
 4639b6c: 37ffed20     	tbnz	w0, #0x1f, 0x4639910 <_ChromeMain+0x4634674>
 4639b70: 0aa07c0a     	bic	w10, w0, w0, asr #31
 4639b74: aa0a0120     	orr	x0, x9, x10
 4639b78: 17ffff69     	b	0x463991c <_ChromeMain+0x4634680>
 4639b7c: f949da68     	ldr	x8, [x19, #0x13b0]
 4639b80: 7900011f     	strh	wzr, [x8]
 4639b84: f909de7f     	str	xzr, [x19, #0x13b8]
 4639b88: 17ffffd8     	b	0x4639ae8 <_ChromeMain+0x463484c>
 4639b8c: 52827608     	mov	w8, #0x13b0             ; =5040
 4639b90: 8b080261     	add	x1, x19, x8
 4639b94: 9708336c     	bl	0x846944 <_ChromeMain+0x8416a8>
 4639b98: f949d674     	ldr	x20, [x19, #0x13a8]
 4639b9c: f909d67f     	str	xzr, [x19, #0x13a8]
 4639ba0: b5fff7b4     	cbnz	x20, 0x4639a94 <_ChromeMain+0x46347f8>
 4639ba4: 17ffffcd     	b	0x4639ad8 <_ChromeMain+0x463483c>
 4639ba8: 12800008     	mov	w8, #-0x1               ; =-1
 4639bac: b8e80008     	ldaddal	w8, w8, [x0]
 4639bb0: 7100051f     	cmp	w8, #0x1
 4639bb4: 54fff7e1     	b.ne	0x4639ab0 <_ChromeMain+0x4634814>
 4639bb8: f9400808     	ldr	x8, [x0, #0x10]
 4639bbc: d63f0100     	blr	x8
 4639bc0: 17ffffbc     	b	0x4639ab0 <_ChromeMain+0x4634814>
 4639bc4: 394623e8     	ldrb	w8, [sp, #0x188]
 4639bc8: 34ffee88     	cbz	w8, 0x4639998 <_ChromeMain+0x46346fc>
 4639bcc: 39461fe9     	ldrb	w9, [sp, #0x187]
 4639bd0: 13001d28     	sxtb	w8, w9
 4639bd4: f940bfe2     	ldr	x2, [sp, #0x178]
 4639bd8: 7100011f     	cmp	w8, #0x0
 4639bdc: 9a894049     	csel	x9, x2, x9, mi
 4639be0: b4ffedc9     	cbz	x9, 0x4639998 <_ChromeMain+0x46346fc>
 4639be4: 510006a9     	sub	w9, w21, #0x1
 4639be8: 7100253f     	cmp	w9, #0x9
 4639bec: 54ffed68     	b.hi	0x4639998 <_ChromeMain+0x46346fc>
 4639bf0: 9004856a     	adrp	x10, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4639bf4: 9101b14a     	add	x10, x10, #0x6c
 4639bf8: 1000000b     	adr	x11, 0x4639bf8 <_ChromeMain+0x463495c>
 4639bfc: b8a9794c     	ldrsw	x12, [x10, x9, lsl #2]
 4639c00: 8b0c016b     	add	x11, x11, x12
 4639c04: d61f0160     	br	x11
 4639c08: 37f81a48     	tbnz	w8, #0x1f, 0x4639f50 <_ChromeMain+0x4634cb4>
 4639c0c: 140000d5     	b	0x4639f60 <_ChromeMain+0x4634cc4>
 4639c10: 34ffec55     	cbz	w21, 0x4639998 <_ChromeMain+0x46346fc>
 4639c14: 71002ebf     	cmp	w21, #0xb
 4639c18: 54fffd61     	b.ne	0x4639bc4 <_ChromeMain+0x4634928>
 4639c1c: 528001a8     	mov	w8, #0xd                ; =13
 4639c20: 39069fe8     	strb	w8, [sp, #0x1a7]
 4639c24: 910643e9     	add	x9, sp, #0x190
 4639c28: 9100352a     	add	x10, x9, #0xd
 4639c2c: d004c488     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4639c30: 912b2d08     	add	x8, x8, #0xacb
 4639c34: eb08015f     	cmp	x10, x8
 4639c38: fa488122     	ccmp	x9, x8, #0x2, hi
 4639c3c: 540040c9     	b.ls	0x463a454 <_ChromeMain+0x46351b8>
 4639c40: f9400109     	ldr	x9, [x8]
 4639c44: f900cbe9     	str	x9, [sp, #0x190]
 4639c48: f8405108     	ldur	x8, [x8, #0x5]
 4639c4c: f80052c8     	stur	x8, [x22, #0x5]
 4639c50: 390677ff     	strb	wzr, [sp, #0x19d]
 4639c54: 390ac3ff     	strb	wzr, [sp, #0x2b0]
 4639c58: 390b23ff     	strb	wzr, [sp, #0x2c8]
 4639c5c: f94a0674     	ldr	x20, [x19, #0x1408]
 4639c60: b40000d4     	cbz	x20, 0x4639c78 <_ChromeMain+0x46349dc>
 4639c64: 52800028     	mov	w8, #0x1                ; =1
 4639c68: b8280288     	ldadd	w8, w8, [x20]
 4639c6c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4639c70: 6b09011f     	cmp	w8, w9
 4639c74: 54009aa0     	b.eq	0x463afc8 <_ChromeMain+0x4635d2c>
 4639c78: f94a0a75     	ldr	x21, [x19, #0x1410]
 4639c7c: 52800700     	mov	w0, #0x38               ; =56
 4639c80: 96e755ba     	bl	0xf368 <_ChromeMain+0xa0cc>
 4639c84: aa0003e3     	mov	x3, x0
 4639c88: 52800028     	mov	w8, #0x1                ; =1
 4639c8c: b9000008     	str	w8, [x0]
 4639c90: 101b70e8     	adr	x8, 0x4670aac <_ChromeMain+0x466b810>
 4639c94: d503201f     	nop
 4639c98: d0ffd069     	adrp	x9, 0x4047000 <_ChromeMain+0x4041d64>
 4639c9c: 91160129     	add	x9, x9, #0x580
 4639ca0: a900a408     	stp	x8, x9, [x0, #0x8]
 4639ca4: 90fef928     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4639ca8: 912c0108     	add	x8, x8, #0xb00
 4639cac: f9000c08     	str	x8, [x0, #0x18]
 4639cb0: a902d414     	stp	x20, x21, [x0, #0x28]
 4639cb4: 910643e1     	add	x1, sp, #0x190
 4639cb8: 910ac3e2     	add	x2, sp, #0x2b0
 4639cbc: aa1303e0     	mov	x0, x19
 4639cc0: 940006e9     	bl	0x463b864 <_ChromeMain+0x46365c8>
 4639cc4: 394b23e8     	ldrb	w8, [sp, #0x2c8]
 4639cc8: 340000e8     	cbz	w8, 0x4639ce4 <_ChromeMain+0x4634a48>
 4639ccc: 39cb1fe8     	ldrsb	w8, [sp, #0x2c7]
 4639cd0: 36f800a8     	tbz	w8, #0x1f, 0x4639ce4 <_ChromeMain+0x4634a48>
 4639cd4: f9415be0     	ldr	x0, [sp, #0x2b0]
 4639cd8: f94163e8     	ldr	x8, [sp, #0x2c0]
 4639cdc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4639ce0: 96e73c76     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639ce4: 39c69fe8     	ldrsb	w8, [sp, #0x1a7]
 4639ce8: 36ffe588     	tbz	w8, #0x1f, 0x4639998 <_ChromeMain+0x46346fc>
 4639cec: f940cbe0     	ldr	x0, [sp, #0x190]
 4639cf0: f940d3e8     	ldr	x8, [sp, #0x1a0]
 4639cf4: 17ffff27     	b	0x4639990 <_ChromeMain+0x46346f4>
 4639cf8: f0fdffa9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4639cfc: 9120c129     	add	x9, x9, #0x830
 4639d00: eb09011f     	cmp	x8, x9
 4639d04: 54000300     	b.eq	0x4639d64 <_ChromeMain+0x4634ac8>
 4639d08: aa1303e0     	mov	x0, x19
 4639d0c: d63f0100     	blr	x8
 4639d10: 14000016     	b	0x4639d68 <_ChromeMain+0x4634acc>
 4639d14: f0fdffa9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4639d18: 9120c129     	add	x9, x9, #0x830
 4639d1c: eb09011f     	cmp	x8, x9
 4639d20: 54000160     	b.eq	0x4639d4c <_ChromeMain+0x4634ab0>
 4639d24: aa1303e0     	mov	x0, x19
 4639d28: d63f0100     	blr	x8
 4639d2c: b5000140     	cbnz	x0, 0x4639d54 <_ChromeMain+0x4634ab8>
 4639d30: 17ffff1a     	b	0x4639998 <_ChromeMain+0x46346fc>
 4639d34: f9400268     	ldr	x8, [x19]
 4639d38: f9403108     	ldr	x8, [x8, #0x60]
 4639d3c: f0fe0194     	adrp	x20, 0x66c000 <_ChromeMain+0x666d64>
 4639d40: 91394294     	add	x20, x20, #0xe50
 4639d44: eb14011f     	cmp	x8, x20
 4639d48: 54fffe61     	b.ne	0x4639d14 <_ChromeMain+0x4634a78>
 4639d4c: f940c260     	ldr	x0, [x19, #0x180]
 4639d50: b4ffe240     	cbz	x0, 0x4639998 <_ChromeMain+0x46346fc>
 4639d54: f9400268     	ldr	x8, [x19]
 4639d58: f9403108     	ldr	x8, [x8, #0x60]
 4639d5c: eb14011f     	cmp	x8, x20
 4639d60: 54fffcc1     	b.ne	0x4639cf8 <_ChromeMain+0x4634a5c>
 4639d64: f940c260     	ldr	x0, [x19, #0x180]
 4639d68: f9407008     	ldr	x8, [x0, #0xe0]
 4639d6c: b4004f48     	cbz	x8, 0x463a754 <_ChromeMain+0x46354b8>
 4639d70: 19404108     	ldapurb	w8, [x8, #0x4]
 4639d74: 35004f08     	cbnz	w8, 0x463a754 <_ChromeMain+0x46354b8>
 4639d78: f9407408     	ldr	x8, [x0, #0xe8]
 4639d7c: b4004ec8     	cbz	x8, 0x463a754 <_ChromeMain+0x46354b8>
 4639d80: f9407008     	ldr	x8, [x0, #0xe0]
 4639d84: b40091c8     	cbz	x8, 0x463afbc <_ChromeMain+0x4635d20>
 4639d88: 19404108     	ldapurb	w8, [x8, #0x4]
 4639d8c: 35009188     	cbnz	w8, 0x463afbc <_ChromeMain+0x4635d20>
 4639d90: f9407408     	ldr	x8, [x0, #0xe8]
 4639d94: f9402508     	ldr	x8, [x8, #0x48]
 4639d98: b4009248     	cbz	x8, 0x463afe0 <_ChromeMain+0x4635d44>
 4639d9c: f940a514     	ldr	x20, [x8, #0x148]
 4639da0: aa1403e0     	mov	x0, x20
 4639da4: 94e72671     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4639da8: 94e72670     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4639dac: 94e7266f     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4639db0: 52800100     	mov	w0, #0x8                ; =8
 4639db4: 96e7556d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4639db8: aa0003f5     	mov	x21, x0
 4639dbc: f900001f     	str	xzr, [x0]
 4639dc0: aa1403e1     	mov	x1, x20
 4639dc4: 9500c8cf     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4639dc8: aa1403e0     	mov	x0, x20
 4639dcc: 94e72664     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4639dd0: aa1403e0     	mov	x0, x20
 4639dd4: 94e72662     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4639dd8: aa1403e0     	mov	x0, x20
 4639ddc: 94e72660     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4639de0: a91953f5     	stp	x21, x20, [sp, #0x190]
 4639de4: f9015fff     	str	xzr, [sp, #0x2b8]
 4639de8: f9015bff     	str	xzr, [sp, #0x2b0]
 4639dec: f90163ff     	str	xzr, [sp, #0x2c0]
 4639df0: f94a0674     	ldr	x20, [x19, #0x1408]
 4639df4: b40000d4     	cbz	x20, 0x4639e0c <_ChromeMain+0x4634b70>
 4639df8: 52800028     	mov	w8, #0x1                ; =1
 4639dfc: b8280288     	ldadd	w8, w8, [x20]
 4639e00: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4639e04: 6b09011f     	cmp	w8, w9
 4639e08: 54008e60     	b.eq	0x463afd4 <_ChromeMain+0x4635d38>
 4639e0c: 910ac3f5     	add	x21, sp, #0x2b0
 4639e10: f94a0a73     	ldr	x19, [x19, #0x1410]
 4639e14: 52800700     	mov	w0, #0x38               ; =56
 4639e18: 96e75554     	bl	0xf368 <_ChromeMain+0xa0cc>
 4639e1c: 52800028     	mov	w8, #0x1                ; =1
 4639e20: b9000008     	str	w8, [x0]
 4639e24: 101ae7e8     	adr	x8, 0x466fb20 <_ChromeMain+0x466a884>
 4639e28: d503201f     	nop
 4639e2c: d0ffd069     	adrp	x9, 0x4047000 <_ChromeMain+0x4041d64>
 4639e30: 91160129     	add	x9, x9, #0x580
 4639e34: a900a408     	stp	x8, x9, [x0, #0x8]
 4639e38: 90fef928     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4639e3c: 912c0108     	add	x8, x8, #0xb00
 4639e40: f9000c08     	str	x8, [x0, #0x18]
 4639e44: a902cc14     	stp	x20, x19, [x0, #0x28]
 4639e48: a90183ff     	stp	xzr, x0, [sp, #0x18]
 4639e4c: 528000c8     	mov	w8, #0x6                ; =6
 4639e50: d004ca69     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4639e54: 9130d129     	add	x9, x9, #0xc34
 4639e58: a900d7e8     	stp	x8, x21, [sp, #0x8]
 4639e5c: f90003e9     	str	x9, [sp]
 4639e60: d004ca61     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4639e64: 91350021     	add	x1, x1, #0xd40
 4639e68: d004ca63     	adrp	x3, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4639e6c: 91359863     	add	x3, x3, #0xd66
 4639e70: d004ca66     	adrp	x6, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4639e74: 913258c6     	add	x6, x6, #0xc96
 4639e78: 910643e0     	add	x0, sp, #0x190
 4639e7c: 52800242     	mov	w2, #0x12               ; =18
 4639e80: 52800384     	mov	w4, #0x1c               ; =28
 4639e84: 52800025     	mov	w5, #0x1                ; =1
 4639e88: 528000e7     	mov	w7, #0x7                ; =7
 4639e8c: 97ef73dc     	bl	0x4216dfc <_ChromeMain+0x4211b60>
 4639e90: 39cb1fe8     	ldrsb	w8, [sp, #0x2c7]
 4639e94: 36f800a8     	tbz	w8, #0x1f, 0x4639ea8 <_ChromeMain+0x4634c0c>
 4639e98: f9415be0     	ldr	x0, [sp, #0x2b0]
 4639e9c: f94163e8     	ldr	x8, [sp, #0x2c0]
 4639ea0: d37ff901     	lsl	x1, x8, #1
 4639ea4: 96e73c05     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639ea8: f940cbf3     	ldr	x19, [sp, #0x190]
 4639eac: f900cbff     	str	xzr, [sp, #0x190]
 4639eb0: b4ffd753     	cbz	x19, 0x4639998 <_ChromeMain+0x46346fc>
 4639eb4: aa1303e0     	mov	x0, x19
 4639eb8: 9500c898     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4639ebc: aa1303e0     	mov	x0, x19
 4639ec0: 52800101     	mov	w1, #0x8                ; =8
 4639ec4: 17fffeb4     	b	0x4639994 <_ChromeMain+0x46346f8>
