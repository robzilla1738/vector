
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4253e58: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4253e5c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4253e60: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4253e64: a90357f6     	stp	x22, x21, [sp, #0x30]
 4253e68: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4253e6c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4253e70: 910143fd     	add	x29, sp, #0x50
 4253e74: d10d83ff     	sub	sp, sp, #0x360
 4253e78: aa0303f6     	mov	x22, x3
 4253e7c: aa0203f7     	mov	x23, x2
 4253e80: aa0103f8     	mov	x24, x1
 4253e84: aa0003f4     	mov	x20, x0
 4253e88: aa0803f3     	mov	x19, x8
 4253e8c: b004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4253e90: f940f908     	ldr	x8, [x8, #0x1f0]
 4253e94: f9400108     	ldr	x8, [x8]
 4253e98: f81983a8     	stur	x8, [x29, #-0x68]
 4253e9c: 6f00e400     	movi.2d	v0, #0000000000000000
 4253ea0: ad070260     	stp	q0, q0, [x19, #0xe0]
 4253ea4: ad060260     	stp	q0, q0, [x19, #0xc0]
 4253ea8: ad050260     	stp	q0, q0, [x19, #0xa0]
 4253eac: ad040260     	stp	q0, q0, [x19, #0x80]
 4253eb0: ad030260     	stp	q0, q0, [x19, #0x60]
 4253eb4: ad020260     	stp	q0, q0, [x19, #0x40]
 4253eb8: ad010260     	stp	q0, q0, [x19, #0x20]
 4253ebc: ad000260     	stp	q0, q0, [x19]
 4253ec0: 52800400     	mov	w0, #0x20               ; =32
 4253ec4: 96f6ed29     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253ec8: f9000660     	str	x0, [x19, #0x8]
 4253ecc: 9004e748     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4253ed0: 3dc10500     	ldr	q0, [x8, #0x410]
 4253ed4: 3d800660     	str	q0, [x19, #0x10]
 4253ed8: 91007809     	add	x9, x0, #0x1e
 4253edc: eb00013f     	cmp	x9, x0
 4253ee0: 54009b63     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 4253ee4: b00465a8     	adrp	x8, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4253ee8: 91034508     	add	x8, x8, #0xd1
 4253eec: eb08013f     	cmp	x9, x8
 4253ef0: fa488002     	ccmp	x0, x8, #0x2, hi
 4253ef4: 54009ac9     	b.ls	0x425524c <_ChromeMain+0x424ffb0>
 4253ef8: 3dc00100     	ldr	q0, [x8]
 4253efc: 3d800000     	str	q0, [x0]
 4253f00: 3cc0e100     	ldur	q0, [x8, #0xe]
 4253f04: 3c80e000     	stur	q0, [x0, #0xe]
 4253f08: 3900781f     	strb	wzr, [x0, #0x1e]
 4253f0c: 6f00e400     	movi.2d	v0, #0000000000000000
 4253f10: aa1303f5     	mov	x21, x19
 4253f14: 3c850ea0     	str	q0, [x21, #0x50]!
 4253f18: 3902a2bf     	strb	wzr, [x21, #0xa8]
 4253f1c: ad3e82a0     	stp	q0, q0, [x21, #-0x30]
 4253f20: 3c9f02a0     	stur	q0, [x21, #-0x10]
 4253f24: ad0082a0     	stp	q0, q0, [x21, #0x10]
 4253f28: ad0182a0     	stp	q0, q0, [x21, #0x30]
 4253f2c: ad0282a0     	stp	q0, q0, [x21, #0x50]
 4253f30: 3c8692a0     	stur	q0, [x21, #0x69]
 4253f34: a9177fff     	stp	xzr, xzr, [sp, #0x170]
 4253f38: f900c3ff     	str	xzr, [sp, #0x180]
 4253f3c: 910103e8     	add	x8, sp, #0x40
 4253f40: aa1403e0     	mov	x0, x20
 4253f44: 9400306e     	bl	0x42600fc <_ChromeMain+0x425ae60>
 4253f48: 39805f02     	ldrsb	x2, [x24, #0x17]
 4253f4c: b7f80aa2     	tbnz	x2, #0x3f, 0x42540a0 <_ChromeMain+0x424ee04>
 4253f50: aa1803e1     	mov	x1, x24
 4253f54: 9105c3e8     	add	x8, sp, #0x170
 4253f58: 910103e0     	add	x0, sp, #0x40
 4253f5c: 9751152e     	bl	0x1699414 <_ChromeMain+0x1694178>
 4253f60: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4253f64: 37f80a28     	tbnz	w8, #0x1f, 0x42540a8 <_ChromeMain+0x424ee0c>
 4253f68: 9105c3e0     	add	x0, sp, #0x170
 4253f6c: 977b3e95     	bl	0x21239c0 <_ChromeMain+0x211e724>
 4253f70: 37000b00     	tbnz	w0, #0x0, 0x42540d0 <_ChromeMain+0x424ee34>
 4253f74: b00565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4253f78: b940b108     	ldr	w8, [x8, #0xb0]
 4253f7c: 7100091f     	cmp	w8, #0x2
 4253f80: 5400070c     	b.gt	0x4254060 <_ChromeMain+0x424edc4>
 4253f84: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253f88: 91080821     	add	x1, x1, #0x202
 4253f8c: 910103f3     	add	x19, sp, #0x40
 4253f90: 910103e0     	add	x0, sp, #0x40
 4253f94: 5280f7a2     	mov	w2, #0x7bd              ; =1981
 4253f98: 52800043     	mov	w3, #0x2                ; =2
 4253f9c: 970ed46c     	bl	0x60914c <_ChromeMain+0x603eb0>
 4253fa0: 910683f5     	add	x21, sp, #0x1a0
 4253fa4: 910683e8     	add	x8, sp, #0x1a0
 4253fa8: aa1403e0     	mov	x0, x20
 4253fac: 94002fb9     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4253fb0: 3986dfe8     	ldrsb	x8, [sp, #0x1b7]
 4253fb4: a95a2be9     	ldp	x9, x10, [sp, #0x1a0]
 4253fb8: f100011f     	cmp	x8, #0x0
 4253fbc: 9a954120     	csel	x0, x9, x21, mi
 4253fc0: 7100011f     	cmp	w8, #0x0
 4253fc4: 9a884141     	csel	x1, x10, x8, mi
 4253fc8: 910943f4     	add	x20, sp, #0x250
 4253fcc: 910943e8     	add	x8, sp, #0x250
 4253fd0: 97353b4e     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4253fd4: 39899fe8     	ldrsb	x8, [sp, #0x267]
 4253fd8: f9412be9     	ldr	x9, [sp, #0x250]
 4253fdc: f9412fea     	ldr	x10, [sp, #0x258]
 4253fe0: f100011f     	cmp	x8, #0x0
 4253fe4: 9a944121     	csel	x1, x9, x20, mi
 4253fe8: 7100011f     	cmp	w8, #0x0
 4253fec: 9a884142     	csel	x2, x10, x8, mi
 4253ff0: 91004260     	add	x0, x19, #0x10
 4253ff4: 96f74532     	bl	0x254bc <_ChromeMain+0x20220>
 4253ff8: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253ffc: 910b8421     	add	x1, x1, #0x2e1
 4254000: 52800462     	mov	w2, #0x23               ; =35
 4254004: 96f7452e     	bl	0x254bc <_ChromeMain+0x20220>
 4254008: 39861fe8     	ldrsb	x8, [sp, #0x187]
 425400c: 9105c3e9     	add	x9, sp, #0x170
 4254010: a9572fea     	ldp	x10, x11, [sp, #0x170]
 4254014: f100011f     	cmp	x8, #0x0
 4254018: 9a894141     	csel	x1, x10, x9, mi
 425401c: 7100011f     	cmp	w8, #0x0
 4254020: 9a884162     	csel	x2, x11, x8, mi
 4254024: 96f74526     	bl	0x254bc <_ChromeMain+0x20220>
 4254028: 39c99fe8     	ldrsb	w8, [sp, #0x267]
 425402c: 36f800a8     	tbz	w8, #0x1f, 0x4254040 <_ChromeMain+0x424eda4>
 4254030: f9412be0     	ldr	x0, [sp, #0x250]
 4254034: f94133e8     	ldr	x8, [sp, #0x260]
 4254038: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425403c: 96f6d39f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254040: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 4254044: 36f800a8     	tbz	w8, #0x1f, 0x4254058 <_ChromeMain+0x424edbc>
 4254048: f940d3e0     	ldr	x0, [sp, #0x1a0]
 425404c: f940dbe8     	ldr	x8, [sp, #0x1b0]
 4254050: d37ff901     	lsl	x1, x8, #1
 4254054: 96f6d399     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254058: 910103e0     	add	x0, sp, #0x40
 425405c: 970ed409     	bl	0x609080 <_ChromeMain+0x603de4>
 4254060: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 4254064: 37f802c8     	tbnz	w8, #0x1f, 0x42540bc <_ChromeMain+0x424ee20>
 4254068: f85983a8     	ldur	x8, [x29, #-0x68]
 425406c: 9004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4254070: f940f929     	ldr	x9, [x9, #0x1f0]
 4254074: f9400129     	ldr	x9, [x9]
 4254078: eb08013f     	cmp	x9, x8
 425407c: 5400ac21     	b.ne	0x4255600 <_ChromeMain+0x4250364>
 4254080: 910d83ff     	add	sp, sp, #0x360
 4254084: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4254088: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 425408c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4254090: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4254094: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4254098: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 425409c: d65f03c0     	ret
 42540a0: a9400b01     	ldp	x1, x2, [x24]
 42540a4: 17ffffac     	b	0x4253f54 <_ChromeMain+0x424ecb8>
 42540a8: f94023e0     	ldr	x0, [sp, #0x40]
 42540ac: f9402be8     	ldr	x8, [sp, #0x50]
 42540b0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42540b4: 96f6d381     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42540b8: 17ffffac     	b	0x4253f68 <_ChromeMain+0x424eccc>
 42540bc: f940bbe0     	ldr	x0, [sp, #0x170]
 42540c0: f940c3e8     	ldr	x8, [sp, #0x180]
 42540c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42540c8: 96f6d37c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42540cc: 17ffffe7     	b	0x4254068 <_ChromeMain+0x424edcc>
 42540d0: 910623fa     	add	x26, sp, #0x188
 42540d4: f90123ff     	str	xzr, [sp, #0x240]
 42540d8: f9011fff     	str	xzr, [sp, #0x238]
 42540dc: f90127ff     	str	xzr, [sp, #0x248]
 42540e0: a91a7fff     	stp	xzr, xzr, [sp, #0x1a0]
 42540e4: f900dbff     	str	xzr, [sp, #0x1b0]
 42540e8: d004b861     	adrp	x1, 0xd962000 <dyld_stub_binder+0xd962000>
 42540ec: 910ca421     	add	x1, x1, #0x329
 42540f0: 910683e8     	add	x8, sp, #0x1a0
 42540f4: 9105c3e0     	add	x0, sp, #0x170
 42540f8: 52800122     	mov	w2, #0x9                ; =9
 42540fc: 975114c6     	bl	0x1699414 <_ChromeMain+0x1694178>
 4254100: 910683e0     	add	x0, sp, #0x1a0
 4254104: 977f40cf     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4254108: 34001760     	cbz	w0, 0x42543f4 <_ChromeMain+0x424f158>
 425410c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4254110: f81703bf     	stur	xzr, [x29, #-0x90]
 4254114: d10283b9     	sub	x25, x29, #0xa0
 4254118: 910683e0     	add	x0, sp, #0x1a0
 425411c: d10283a1     	sub	x1, x29, #0xa0
 4254120: 92800002     	mov	x2, #-0x1               ; =-1
 4254124: 9774fa99     	bl	0x1f92b88 <_ChromeMain+0x1f8d8ec>
 4254128: 340015a0     	cbz	w0, 0x42543dc <_ChromeMain+0x424f140>
 425412c: 6f00e400     	movi.2d	v0, #0000000000000000
 4254130: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4254134: 389773a8     	ldursb	x8, [x29, #-0x89]
 4254138: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 425413c: f100011f     	cmp	x8, #0x0
 4254140: 9a994120     	csel	x0, x9, x25, mi
 4254144: 7100011f     	cmp	w8, #0x0
 4254148: 9a884141     	csel	x1, x10, x8, mi
 425414c: 910103e8     	add	x8, sp, #0x40
 4254150: 52800002     	mov	w2, #0x0                ; =0
 4254154: 52801903     	mov	w3, #0xc8               ; =200
 4254158: 9765b779     	bl	0x1bc1f3c <_ChromeMain+0x1bbcca0>
 425415c: 394163e8     	ldrb	w8, [sp, #0x58]
 4254160: 340013e8     	cbz	w8, 0x42543dc <_ChromeMain+0x424f140>
 4254164: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254168: 91109c21     	add	x1, x1, #0x427
 425416c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254170: 91118842     	add	x2, x2, #0x462
 4254174: d10203a8     	sub	x8, x29, #0x80
 4254178: 910103e0     	add	x0, sp, #0x40
 425417c: 528001a3     	mov	w3, #0xd                ; =13
 4254180: 94001f7c     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254184: 52800300     	mov	w0, #0x18               ; =24
