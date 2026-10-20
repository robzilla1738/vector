
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4257878: d10203ff     	sub	sp, sp, #0x80
 425787c: a90557f6     	stp	x22, x21, [sp, #0x50]
 4257880: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4257884: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4257888: 9101c3fd     	add	x29, sp, #0x70
 425788c: aa0003f4     	mov	x20, x0
 4257890: b4000ac1     	cbz	x1, 0x42579e8 <_ChromeMain+0x425274c>
 4257894: f9403688     	ldr	x8, [x20, #0x68]
 4257898: b4000a88     	cbz	x8, 0x42579e8 <_ChromeMain+0x425274c>
 425789c: aa0103f3     	mov	x19, x1
 42578a0: f9400028     	ldr	x8, [x1]
 42578a4: f940b508     	ldr	x8, [x8, #0x168]
 42578a8: aa0103e0     	mov	x0, x1
 42578ac: d63f0100     	blr	x8
 42578b0: aa0003f5     	mov	x21, x0
 42578b4: 9100e280     	add	x0, x20, #0x38
 42578b8: 39813e81     	ldrsb	x1, [x20, #0x4f]
 42578bc: b6f80041     	tbz	x1, #0x3f, 0x42578c4 <_ChromeMain+0x4252628>
 42578c0: a9438680     	ldp	x0, x1, [x20, #0x38]
 42578c4: 910043f6     	add	x22, sp, #0x10
 42578c8: 910043e8     	add	x8, sp, #0x10
 42578cc: 97352d0f     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42578d0: 39809fe8     	ldrsb	x8, [sp, #0x27]
 42578d4: a9412be9     	ldp	x9, x10, [sp, #0x10]
 42578d8: f100011f     	cmp	x8, #0x0
 42578dc: 9a964121     	csel	x1, x9, x22, mi
 42578e0: 7100011f     	cmp	w8, #0x0
 42578e4: 9a884142     	csel	x2, x10, x8, mi
 42578e8: 9100a3e0     	add	x0, sp, #0x28
 42578ec: 972618a5     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 42578f0: b0046401     	adrp	x1, 0xced8000 <dyld_stub_binder+0xced8000>
 42578f4: 913d4021     	add	x1, x1, #0xf50
 42578f8: 9100a3e3     	add	x3, sp, #0x28
 42578fc: aa1503e0     	mov	x0, x21
 4257900: 52800182     	mov	w2, #0xc                ; =12
 4257904: 974ac7e9     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4257908: 394103e9     	ldrb	w9, [sp, #0x40]
 425790c: d0053348     	adrp	x8, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4257910: 9121e108     	add	x8, x8, #0x878
 4257914: 7103fd3f     	cmp	w9, #0xff
 4257918: 54000060     	b.eq	0x4257924 <_ChromeMain+0x4252688>
 425791c: 721e793f     	tst	w9, #0xfffffffd
 4257920: 54000701     	b.ne	0x4257a00 <_ChromeMain+0x4252764>
 4257924: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 4257928: 36f800a8     	tbz	w8, #0x1f, 0x425793c <_ChromeMain+0x42526a0>
 425792c: f9400be0     	ldr	x0, [sp, #0x10]
 4257930: f94013e8     	ldr	x8, [sp, #0x20]
 4257934: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257938: 96f6c560     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425793c: f0056468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4257940: f9467d00     	ldr	x0, [x8, #0xcf8]
 4257944: 975f208d     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4257948: 975f20b2     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 425794c: aa0003f5     	mov	x21, x0
 4257950: f9400268     	ldr	x8, [x19]
 4257954: f9401909     	ldr	x9, [x8, #0x30]
 4257958: 9100a3e8     	add	x8, sp, #0x28
 425795c: aa1303e0     	mov	x0, x19
 4257960: d63f0120     	blr	x9
 4257964: 9100a3e1     	add	x1, sp, #0x28
 4257968: aa1503e0     	mov	x0, x21
 425796c: 975f20e5     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4257970: aa0003f5     	mov	x21, x0
 4257974: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4257978: 37f80528     	tbnz	w8, #0x1f, 0x4257a1c <_ChromeMain+0x4252780>
 425797c: b50005b5     	cbnz	x21, 0x4257a30 <_ChromeMain+0x4252794>
 4257980: aa1303e0     	mov	x0, x19
 4257984: 940000fc     	bl	0x4257d74 <_ChromeMain+0x4252ad8>
 4257988: aa1303e0     	mov	x0, x19
 425798c: 973b9b1d     	bl	0x113e600 <_ChromeMain+0x1139364>
 4257990: b4000160     	cbz	x0, 0x42579bc <_ChromeMain+0x4252720>
 4257994: aa0003f5     	mov	x21, x0
 4257998: 97019da6     	bl	0x2bf030 <_ChromeMain+0x2b9d94>
 425799c: 37000100     	tbnz	w0, #0x0, 0x42579bc <_ChromeMain+0x4252720>
 42579a0: 3940a2a8     	ldrb	w8, [x21, #0x28]
 42579a4: 35001ca8     	cbnz	w8, 0x4257d38 <_ChromeMain+0x4252a9c>
 42579a8: aa1503e0     	mov	x0, x21
 42579ac: 52800021     	mov	w1, #0x1                ; =1
 42579b0: 97b67b14     	bl	0x2ff6600 <_ChromeMain+0x2ff1364>
 42579b4: aa1503e0     	mov	x0, x21
 42579b8: 97b67b54     	bl	0x2ff6708 <_ChromeMain+0x2ff146c>
 42579bc: aa1403e0     	mov	x0, x20
 42579c0: aa1303e1     	mov	x1, x19
 42579c4: 940001d1     	bl	0x4258108 <_ChromeMain+0x4252e6c>
 42579c8: aa1403e0     	mov	x0, x20
 42579cc: aa1303e1     	mov	x1, x19
 42579d0: 94000312     	bl	0x4258618 <_ChromeMain+0x425337c>
 42579d4: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 42579d8: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 42579dc: a94557f6     	ldp	x22, x21, [sp, #0x50]
 42579e0: 910203ff     	add	sp, sp, #0x80
 42579e4: d65f03c0     	ret
 42579e8: aa1403e0     	mov	x0, x20
 42579ec: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 42579f0: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 42579f4: a94557f6     	ldp	x22, x21, [sp, #0x50]
 42579f8: 910203ff     	add	sp, sp, #0x80
 42579fc: 17fff050     	b	0x4253b3c <_ChromeMain+0x424e8a0>
 4257a00: 7100113f     	cmp	w9, #0x4
 4257a04: 54000360     	b.eq	0x4257a70 <_ChromeMain+0x42527d4>
 4257a08: f8695908     	ldr	x8, [x8, w9, uxtw #3]
 4257a0c: d10087a0     	sub	x0, x29, #0x21
 4257a10: 9100a3e1     	add	x1, sp, #0x28
 4257a14: d63f0100     	blr	x8
 4257a18: 17ffffc3     	b	0x4257924 <_ChromeMain+0x4252688>
 4257a1c: f94017e0     	ldr	x0, [sp, #0x28]
 4257a20: f9401fe8     	ldr	x8, [sp, #0x38]
 4257a24: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257a28: 96f6c524     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257a2c: b4fffab5     	cbz	x21, 0x4257980 <_ChromeMain+0x42526e4>
 4257a30: 9100e281     	add	x1, x20, #0x38
 4257a34: aa1503e0     	mov	x0, x21
 4257a38: 52800002     	mov	w2, #0x0                ; =0
 4257a3c: 94e1d2ea     	bl	0x7acc5e4 <_ChromeMain+0x7ac7348>
 4257a40: aa1303e0     	mov	x0, x19
 4257a44: 940000cc     	bl	0x4257d74 <_ChromeMain+0x4252ad8>
 4257a48: f9403688     	ldr	x8, [x20, #0x68]
 4257a4c: 3943e109     	ldrb	w9, [x8, #0xf8]
 4257a50: 34fff9c9     	cbz	w9, 0x4257988 <_ChromeMain+0x42526ec>
 4257a54: f9000bff     	str	xzr, [sp, #0x10]
 4257a58: 3943dd09     	ldrb	w9, [x8, #0xf7]
 4257a5c: f940750a     	ldr	x10, [x8, #0xe8]
 4257a60: 7219013f     	tst	w9, #0x80
 4257a64: 9a891149     	csel	x9, x10, x9, ne
 4257a68: b4fff909     	cbz	x9, 0x4257988 <_ChromeMain+0x42526ec>
 4257a6c: 14000008     	b	0x4257a8c <_ChromeMain+0x42527f0>
 4257a70: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4257a74: 36fff588     	tbz	w8, #0x1f, 0x4257924 <_ChromeMain+0x4252688>
 4257a78: f94017e0     	ldr	x0, [sp, #0x28]
 4257a7c: f9401fe8     	ldr	x8, [sp, #0x38]
 4257a80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257a84: 96f6c50d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257a88: 17ffffa7     	b	0x4257924 <_ChromeMain+0x4252688>
 4257a8c: 91038100     	add	x0, x8, #0xe0
 4257a90: 94d6c27f     	bl	0x780848c <_ChromeMain+0x78031f0>
 4257a94: f90017e0     	str	x0, [sp, #0x28]
 4257a98: 910043e8     	add	x8, sp, #0x10
 4257a9c: 9100a3e0     	add	x0, sp, #0x28
 4257aa0: 9535b5d8     	bl	0x8fc5200 <_ChromeMain+0x8fbff64>
 4257aa4: f94017e0     	ldr	x0, [sp, #0x28]
 4257aa8: b4000120     	cbz	x0, 0x4257acc <_ChromeMain+0x4252830>
 4257aac: 91002008     	add	x8, x0, #0x8
 4257ab0: 12800009     	mov	w9, #-0x1               ; =-1
 4257ab4: b8e90108     	ldaddal	w9, w8, [x8]
 4257ab8: 7100051f     	cmp	w8, #0x1
 4257abc: 54000081     	b.ne	0x4257acc <_ChromeMain+0x4252830>
 4257ac0: f9400008     	ldr	x8, [x0]
 4257ac4: f9400508     	ldr	x8, [x8, #0x8]
 4257ac8: d63f0100     	blr	x8
 4257acc: f9400be8     	ldr	x8, [sp, #0x10]
 4257ad0: b4fff5c8     	cbz	x8, 0x4257988 <_ChromeMain+0x42526ec>
 4257ad4: f9400d09     	ldr	x9, [x8, #0x18]
 4257ad8: b5000209     	cbnz	x9, 0x4257b18 <_ChromeMain+0x425287c>
 4257adc: b940010a     	ldr	w10, [x8]
 4257ae0: 51000549     	sub	w9, w10, #0x1
 4257ae4: b9000109     	str	w9, [x8]
 4257ae8: 3400134a     	cbz	w10, 0x4257d50 <_ChromeMain+0x4252ab4>
 4257aec: 35fff4e9     	cbnz	w9, 0x4257988 <_ChromeMain+0x42526ec>
 4257af0: 91002109     	add	x9, x8, #0x8
 4257af4: f9400901     	ldr	x1, [x8, #0x10]
 4257af8: f90017e9     	str	x9, [sp, #0x28]
 4257afc: aa0803f5     	mov	x21, x8
 4257b00: 9100a3e0     	add	x0, sp, #0x28
 4257b04: 96f7ec87     	bl	0x52d20 <_ChromeMain+0x4da84>
 4257b08: aa1503e0     	mov	x0, x21
 4257b0c: 52800401     	mov	w1, #0x20               ; =32
 4257b10: 96f6c4ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257b14: 17ffff9d     	b	0x4257988 <_ChromeMain+0x42526ec>
 4257b18: f9403688     	ldr	x8, [x20, #0x68]
 4257b1c: 3943e109     	ldrb	w9, [x8, #0xf8]
 4257b20: 360010a9     	tbz	w9, #0x0, 0x4257d34 <_ChromeMain+0x4252a98>
 4257b24: 90046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4257b28: 9110c021     	add	x1, x1, #0x430
 4257b2c: 91032102     	add	x2, x8, #0xc8
 4257b30: aa1503e0     	mov	x0, x21
 4257b34: 94e1d35a     	bl	0x7acc89c <_ChromeMain+0x7ac7600>
 4257b38: f9403688     	ldr	x8, [x20, #0x68]
 4257b3c: 3943e109     	ldrb	w9, [x8, #0xf8]
 4257b40: 36000fa9     	tbz	w9, #0x0, 0x4257d34 <_ChromeMain+0x4252a98>
 4257b44: f9400be9     	ldr	x9, [sp, #0x10]
 4257b48: f90007e9     	str	x9, [sp, #0x8]
 4257b4c: b40000a9     	cbz	x9, 0x4257b60 <_ChromeMain+0x42528c4>
 4257b50: b940012a     	ldr	w10, [x9]
 4257b54: 3100054a     	adds	w10, w10, #0x1
 4257b58: b900012a     	str	w10, [x9]
 4257b5c: 54001002     	b.hs	0x4257d5c <_ChromeMain+0x4252ac0>
 4257b60: 91032101     	add	x1, x8, #0xc8
 4257b64: 910023e2     	add	x2, sp, #0x8
 4257b68: aa1503e0     	mov	x0, x21
 4257b6c: 94e1d3b0     	bl	0x7acca2c <_ChromeMain+0x7ac7790>
 4257b70: f94007f6     	ldr	x22, [sp, #0x8]
 4257b74: b40000d6     	cbz	x22, 0x4257b8c <_ChromeMain+0x42528f0>
 4257b78: b94002c9     	ldr	w9, [x22]
 4257b7c: 51000528     	sub	w8, w9, #0x1
 4257b80: b90002c8     	str	w8, [x22]
 4257b84: 34000f29     	cbz	w9, 0x4257d68 <_ChromeMain+0x4252acc>
 4257b88: 34000c48     	cbz	w8, 0x4257d10 <_ChromeMain+0x4252a74>
 4257b8c: 90046521     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 4257b90: 91196c21     	add	x1, x1, #0x65b
 4257b94: 52800036     	mov	w22, #0x1               ; =1
 4257b98: aa1503e0     	mov	x0, x21
 4257b9c: 52800022     	mov	w2, #0x1                ; =1
 4257ba0: 97a527a4     	bl	0x2ba1a30 <_ChromeMain+0x2b9c794>
 4257ba4: aa1503e0     	mov	x0, x21
 4257ba8: 52800021     	mov	w1, #0x1                ; =1
 4257bac: 94e1d435     	bl	0x7accc80 <_ChromeMain+0x7ac79e4>
 4257bb0: f9400268     	ldr	x8, [x19]
 4257bb4: f940b508     	ldr	x8, [x8, #0x168]
 4257bb8: aa1303e0     	mov	x0, x19
 4257bbc: d63f0100     	blr	x8
 4257bc0: 3900a3f6     	strb	w22, [sp, #0x28]
 4257bc4: 390103f6     	strb	w22, [sp, #0x40]
 4257bc8: f0046481     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4257bcc: 91056021     	add	x1, x1, #0x158
 4257bd0: 9100a3e3     	add	x3, sp, #0x28
 4257bd4: 52800382     	mov	w2, #0x1c               ; =28
 4257bd8: 974ac734     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4257bdc: 394103e8     	ldrb	w8, [sp, #0x40]
 4257be0: 7103fd1f     	cmp	w8, #0xff
 4257be4: 54000060     	b.eq	0x4257bf0 <_ChromeMain+0x4252954>
 4257be8: 721e791f     	tst	w8, #0xfffffffd
 4257bec: 54000681     	b.ne	0x4257cbc <_ChromeMain+0x4252a20>
 4257bf0: f9400268     	ldr	x8, [x19]
 4257bf4: f940b508     	ldr	x8, [x8, #0x168]
 4257bf8: aa1303e0     	mov	x0, x19
 4257bfc: d63f0100     	blr	x8
 4257c00: 3900a3f6     	strb	w22, [sp, #0x28]
 4257c04: 390103f6     	strb	w22, [sp, #0x40]
 4257c08: f0046481     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4257c0c: 9105d421     	add	x1, x1, #0x175
 4257c10: 9100a3e3     	add	x3, sp, #0x28
 4257c14: 52800322     	mov	w2, #0x19               ; =25
 4257c18: 974ac724     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4257c1c: 394103e8     	ldrb	w8, [sp, #0x40]
 4257c20: 7103fd1f     	cmp	w8, #0xff
 4257c24: 54000060     	b.eq	0x4257c30 <_ChromeMain+0x4252994>
 4257c28: 721e791f     	tst	w8, #0xfffffffd
 4257c2c: 54000361     	b.ne	0x4257c98 <_ChromeMain+0x42529fc>
 4257c30: f0056468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4257c34: f9467d08     	ldr	x8, [x8, #0xcf8]
 4257c38: f9401d08     	ldr	x8, [x8, #0x38]
 4257c3c: b40000e8     	cbz	x8, 0x4257c58 <_ChromeMain+0x42529bc>
 4257c40: f9400d00     	ldr	x0, [x8, #0x18]
 4257c44: f9400008     	ldr	x8, [x0]
 4257c48: f9404d08     	ldr	x8, [x8, #0x98]
 4257c4c: d2800001     	mov	x1, #0x0                ; =0
 4257c50: d2800002     	mov	x2, #0x0                ; =0
 4257c54: d63f0100     	blr	x8
 4257c58: f9400268     	ldr	x8, [x19]
 4257c5c: f940b508     	ldr	x8, [x8, #0x168]
 4257c60: aa1303e0     	mov	x0, x19
 4257c64: d63f0100     	blr	x8
 4257c68: f9400c00     	ldr	x0, [x0, #0x18]
 4257c6c: f9400008     	ldr	x8, [x0]
 4257c70: f9404d08     	ldr	x8, [x8, #0x98]
 4257c74: d2800001     	mov	x1, #0x0                ; =0
 4257c78: d2800002     	mov	x2, #0x0                ; =0
 4257c7c: d63f0100     	blr	x8
 4257c80: f9400be8     	ldr	x8, [sp, #0x10]
 4257c84: b4ffe828     	cbz	x8, 0x4257988 <_ChromeMain+0x42526ec>
 4257c88: 17ffff95     	b	0x4257adc <_ChromeMain+0x4252840>
 4257c8c: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4257c90: 36fffd08     	tbz	w8, #0x1f, 0x4257c30 <_ChromeMain+0x4252994>
 4257c94: 1400001a     	b	0x4257cfc <_ChromeMain+0x4252a60>
 4257c98: 7100111f     	cmp	w8, #0x4
 4257c9c: 54ffff80     	b.eq	0x4257c8c <_ChromeMain+0x42529f0>
 4257ca0: d0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4257ca4: 9121e129     	add	x9, x9, #0x878
 4257ca8: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 4257cac: d10087a0     	sub	x0, x29, #0x21
 4257cb0: 9100a3e1     	add	x1, sp, #0x28
 4257cb4: d63f0100     	blr	x8
 4257cb8: 17ffffde     	b	0x4257c30 <_ChromeMain+0x4252994>
 4257cbc: 7100111f     	cmp	w8, #0x4
 4257cc0: 54000100     	b.eq	0x4257ce0 <_ChromeMain+0x4252a44>
 4257cc4: d0053349     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4257cc8: 9121e129     	add	x9, x9, #0x878
 4257ccc: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 4257cd0: d10087a0     	sub	x0, x29, #0x21
 4257cd4: 9100a3e1     	add	x1, sp, #0x28
 4257cd8: d63f0100     	blr	x8
 4257cdc: 17ffffc5     	b	0x4257bf0 <_ChromeMain+0x4252954>
 4257ce0: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4257ce4: 36fff868     	tbz	w8, #0x1f, 0x4257bf0 <_ChromeMain+0x4252954>
 4257ce8: f94017e0     	ldr	x0, [sp, #0x28]
 4257cec: f9401fe8     	ldr	x8, [sp, #0x38]
 4257cf0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257cf4: 96f6c471     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257cf8: 17ffffbe     	b	0x4257bf0 <_ChromeMain+0x4252954>
 4257cfc: f94017e0     	ldr	x0, [sp, #0x28]
 4257d00: f9401fe8     	ldr	x8, [sp, #0x38]
 4257d04: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4257d08: 96f6c46c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257d0c: 17ffffc9     	b	0x4257c30 <_ChromeMain+0x4252994>
 4257d10: 910022c8     	add	x8, x22, #0x8
 4257d14: f9400ac1     	ldr	x1, [x22, #0x10]
 4257d18: f90017e8     	str	x8, [sp, #0x28]
 4257d1c: 9100a3e0     	add	x0, sp, #0x28
 4257d20: 96f7ec00     	bl	0x52d20 <_ChromeMain+0x4da84>
 4257d24: aa1603e0     	mov	x0, x22
 4257d28: 52800401     	mov	w1, #0x20               ; =32
 4257d2c: 96f6c463     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4257d30: 17ffff97     	b	0x4257b8c <_ChromeMain+0x42528f0>
 4257d34: d4200020     	brk	#0x1
 4257d38: b004bfc8     	adrp	x8, 0xda50000 <dyld_stub_binder+0xda50000>
 4257d3c: 9105b908     	add	x8, x8, #0x16e
 4257d40: f90017e8     	str	x8, [sp, #0x28]
 4257d44: 9100a3e0     	add	x0, sp, #0x28
 4257d48: 97625a89     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4257d4c: 17ffff17     	b	0x42579a8 <_ChromeMain+0x425270c>
 4257d50: d4200000     	brk	#0
 4257d54: d4400000     	hlt	#0
 4257d58: d4200020     	brk	#0x1
 4257d5c: d4200000     	brk	#0
 4257d60: d4400000     	hlt	#0
 4257d64: d4200020     	brk	#0x1
 4257d68: d4200000     	brk	#0
 4257d6c: d4400000     	hlt	#0
 4257d70: d4200020     	brk	#0x1
