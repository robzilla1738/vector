
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
 4254188: 96f6ec78     	bl	0xf368 <_ChromeMain+0xa0cc>
 425418c: b4008600     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254190: aa0003f9     	mov	x25, x0
 4254194: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254198: 37f800c8     	tbnz	w8, #0x1f, 0x42541b0 <_ChromeMain+0x424ef14>
 425419c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 42541a0: 3d800320     	str	q0, [x25]
 42541a4: f85903a8     	ldur	x8, [x29, #-0x70]
 42541a8: f9000b28     	str	x8, [x25, #0x10]
 42541ac: 14000004     	b	0x42541bc <_ChromeMain+0x424ef20>
 42541b0: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 42541b4: aa1903e0     	mov	x0, x25
 42541b8: 96f7ca86     	bl	0x46bd0 <_ChromeMain+0x41934>
 42541bc: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42541c0: 91102c21     	add	x1, x1, #0x40b
 42541c4: 910103e0     	add	x0, sp, #0x40
 42541c8: 52800362     	mov	w2, #0x1b               ; =27
 42541cc: 97085add     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 42541d0: b4000180     	cbz	x0, 0x4254200 <_ChromeMain+0x424ef64>
 42541d4: 39406008     	ldrb	w8, [x0, #0x18]
 42541d8: 71001d1f     	cmp	w8, #0x7
 42541dc: 54000121     	b.ne	0x4254200 <_ChromeMain+0x424ef64>
 42541e0: f9012bf9     	str	x25, [sp, #0x250]
 42541e4: 52800028     	mov	w8, #0x1                ; =1
 42541e8: 4e080d00     	dup.2d	v0, x8
 42541ec: 3c8d0340     	stur	q0, [x26, #0xd0]
 42541f0: 910943e1     	add	x1, sp, #0x250
 42541f4: 9108e3e3     	add	x3, sp, #0x238
 42541f8: 52800022     	mov	w2, #0x1                ; =1
 42541fc: 94001fa2     	bl	0x425c084 <_ChromeMain+0x4256de8>
 4254200: 39c05f28     	ldrsb	w8, [x25, #0x17]
 4254204: 37f88428     	tbnz	w8, #0x1f, 0x4255288 <_ChromeMain+0x424ffec>
 4254208: aa1903e0     	mov	x0, x25
 425420c: 52800301     	mov	w1, #0x18               ; =24
 4254210: 96f6d32a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254214: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254218: 36f800a8     	tbz	w8, #0x1f, 0x425422c <_ChromeMain+0x424ef90>
 425421c: f85803a0     	ldur	x0, [x29, #-0x80]
 4254220: f85903a8     	ldur	x8, [x29, #-0x70]
 4254224: d37ff901     	lsl	x1, x8, #1
 4254228: 96f6d324     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425422c: 394163e8     	ldrb	w8, [sp, #0x58]
 4254230: 360080e8     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254234: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254238: 91115021     	add	x1, x1, #0x454
 425423c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254240: 9111f842     	add	x2, x2, #0x47e
 4254244: d10203a8     	sub	x8, x29, #0x80
 4254248: 910103e0     	add	x0, sp, #0x40
 425424c: 528001e3     	mov	w3, #0xf                ; =15
 4254250: 94001f48     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254254: 52800300     	mov	w0, #0x18               ; =24
 4254258: 96f6ec44     	bl	0xf368 <_ChromeMain+0xa0cc>
 425425c: b4007f80     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254260: aa0003f9     	mov	x25, x0
 4254264: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254268: 37f800c8     	tbnz	w8, #0x1f, 0x4254280 <_ChromeMain+0x424efe4>
 425426c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 4254270: 3d800320     	str	q0, [x25]
 4254274: f85903a8     	ldur	x8, [x29, #-0x70]
 4254278: f9000b28     	str	x8, [x25, #0x10]
 425427c: 14000004     	b	0x425428c <_ChromeMain+0x424eff0>
 4254280: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 4254284: aa1903e0     	mov	x0, x25
 4254288: 96f7ca52     	bl	0x46bd0 <_ChromeMain+0x41934>
 425428c: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254290: 9110fc21     	add	x1, x1, #0x43f
 4254294: 910103e0     	add	x0, sp, #0x40
 4254298: 52800282     	mov	w2, #0x14               ; =20
 425429c: 97085aa9     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 42542a0: b4000180     	cbz	x0, 0x42542d0 <_ChromeMain+0x424f034>
 42542a4: 39406008     	ldrb	w8, [x0, #0x18]
 42542a8: 71001d1f     	cmp	w8, #0x7
 42542ac: 54000121     	b.ne	0x42542d0 <_ChromeMain+0x424f034>
 42542b0: f9012bf9     	str	x25, [sp, #0x250]
 42542b4: 52800028     	mov	w8, #0x1                ; =1
 42542b8: 4e080d00     	dup.2d	v0, x8
 42542bc: 3c8d0340     	stur	q0, [x26, #0xd0]
 42542c0: 910943e1     	add	x1, sp, #0x250
 42542c4: 9108e3e3     	add	x3, sp, #0x238
 42542c8: 52800002     	mov	w2, #0x0                ; =0
 42542cc: 94001f6e     	bl	0x425c084 <_ChromeMain+0x4256de8>
 42542d0: 39c05f28     	ldrsb	w8, [x25, #0x17]
 42542d4: 37f87e48     	tbnz	w8, #0x1f, 0x425529c <_ChromeMain+0x4250000>
 42542d8: aa1903e0     	mov	x0, x25
 42542dc: 52800301     	mov	w1, #0x18               ; =24
 42542e0: 96f6d2f6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42542e4: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42542e8: 36f800a8     	tbz	w8, #0x1f, 0x42542fc <_ChromeMain+0x424f060>
 42542ec: f85803a0     	ldur	x0, [x29, #-0x80]
 42542f0: f85903a8     	ldur	x8, [x29, #-0x70]
 42542f4: d37ff901     	lsl	x1, x8, #1
 42542f8: 96f6d2f0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42542fc: 394163e8     	ldrb	w8, [sp, #0x58]
 4254300: 36007a68     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254304: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254308: 9111ec21     	add	x1, x1, #0x47b
 425430c: d004e922     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4254310: 91127842     	add	x2, x2, #0x49e
 4254314: d10203a8     	sub	x8, x29, #0x80
 4254318: 910103e0     	add	x0, sp, #0x40
 425431c: 52800203     	mov	w3, #0x10               ; =16
 4254320: 94001f14     	bl	0x425bf70 <_ChromeMain+0x4256cd4>
 4254324: 52800300     	mov	w0, #0x18               ; =24
 4254328: 96f6ec10     	bl	0xf368 <_ChromeMain+0xa0cc>
 425432c: b4007900     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254330: aa0003f9     	mov	x25, x0
 4254334: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254338: 36f800a8     	tbz	w8, #0x1f, 0x425434c <_ChromeMain+0x424f0b0>
 425433c: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 4254340: aa1903e0     	mov	x0, x25
 4254344: 96f7ca23     	bl	0x46bd0 <_ChromeMain+0x41934>
 4254348: 14000005     	b	0x425435c <_ChromeMain+0x424f0c0>
 425434c: 3cd803a0     	ldur	q0, [x29, #-0x80]
 4254350: 3d800320     	str	q0, [x25]
 4254354: f85903a8     	ldur	x8, [x29, #-0x70]
 4254358: f9000b28     	str	x8, [x25, #0x10]
 425435c: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254360: 91119421     	add	x1, x1, #0x465
 4254364: 910103e0     	add	x0, sp, #0x40
 4254368: 528002a2     	mov	w2, #0x15               ; =21
 425436c: 97085a75     	bl	0x46ad40 <_ChromeMain+0x465aa4>
 4254370: b4000180     	cbz	x0, 0x42543a0 <_ChromeMain+0x424f104>
 4254374: 39406008     	ldrb	w8, [x0, #0x18]
 4254378: 71001d1f     	cmp	w8, #0x7
 425437c: 54000121     	b.ne	0x42543a0 <_ChromeMain+0x424f104>
 4254380: f9012bf9     	str	x25, [sp, #0x250]
 4254384: 52800028     	mov	w8, #0x1                ; =1
 4254388: 4e080d00     	dup.2d	v0, x8
 425438c: 3c8d0340     	stur	q0, [x26, #0xd0]
 4254390: 910943e1     	add	x1, sp, #0x250
 4254394: 9108e3e3     	add	x3, sp, #0x238
 4254398: 52800002     	mov	w2, #0x0                ; =0
 425439c: 94001f3a     	bl	0x425c084 <_ChromeMain+0x4256de8>
 42543a0: 39c05f28     	ldrsb	w8, [x25, #0x17]
 42543a4: 37f87868     	tbnz	w8, #0x1f, 0x42552b0 <_ChromeMain+0x4250014>
 42543a8: aa1903e0     	mov	x0, x25
 42543ac: 52800301     	mov	w1, #0x18               ; =24
 42543b0: 96f6d2c2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543b4: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42543b8: 36f800a8     	tbz	w8, #0x1f, 0x42543cc <_ChromeMain+0x424f130>
 42543bc: f85803a0     	ldur	x0, [x29, #-0x80]
 42543c0: f85903a8     	ldur	x8, [x29, #-0x70]
 42543c4: d37ff901     	lsl	x1, x8, #1
 42543c8: 96f6d2bc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543cc: 394163e8     	ldrb	w8, [sp, #0x58]
 42543d0: 34000068     	cbz	w8, 0x42543dc <_ChromeMain+0x424f140>
 42543d4: 910103e0     	add	x0, sp, #0x40
 42543d8: 971c282a     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42543dc: 38d773a8     	ldursb	w8, [x29, #-0x89]
 42543e0: 36f800a8     	tbz	w8, #0x1f, 0x42543f4 <_ChromeMain+0x424f158>
 42543e4: f85603a0     	ldur	x0, [x29, #-0xa0]
 42543e8: f85703a8     	ldur	x8, [x29, #-0x90]
 42543ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42543f0: 96f6d2b2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42543f4: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 42543f8: 37f80268     	tbnz	w8, #0x1f, 0x4254444 <_ChromeMain+0x424f1a8>
 42543fc: 910122a0     	add	x0, x21, #0x48
 4254400: 94d3eb9e     	bl	0x774f278 <_ChromeMain+0x7749fdc>
 4254404: f9411fe8     	ldr	x8, [sp, #0x238]
 4254408: f9004e68     	str	x8, [x19, #0x98]
 425440c: 3ccb8340     	ldur	q0, [x26, #0xb8]
 4254410: 3d802a60     	str	q0, [x19, #0xa0]
 4254414: f90127ff     	str	xzr, [sp, #0x248]
 4254418: f90123ff     	str	xzr, [sp, #0x240]
 425441c: f9011fff     	str	xzr, [sp, #0x238]
 4254420: 9108e3e8     	add	x8, sp, #0x238
 4254424: f90023e8     	str	x8, [sp, #0x40]
 4254428: 910103e0     	add	x0, sp, #0x40
 425442c: 94d3cdf3     	bl	0x7747bf8 <_ChromeMain+0x774295c>
 4254430: 34000154     	cbz	w20, 0x4254458 <_ChromeMain+0x424f1bc>
 4254434: 34000677     	cbz	w23, 0x4254500 <_ChromeMain+0x424f264>
 4254438: 52800028     	mov	w8, #0x1                ; =1
 425443c: 39000268     	strb	w8, [x19]
 4254440: 17ffff08     	b	0x4254060 <_ChromeMain+0x424edc4>
 4254444: f940d3e0     	ldr	x0, [sp, #0x1a0]
 4254448: f940dbe8     	ldr	x8, [sp, #0x1b0]
 425444c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254450: 96f6d29a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254454: 17ffffea     	b	0x42543fc <_ChromeMain+0x424f160>
 4254458: 910103e8     	add	x8, sp, #0x40
 425445c: aa1803e0     	mov	x0, x24
 4254460: 94001549     	bl	0x4259984 <_ChromeMain+0x42546e8>
 4254464: a902ffff     	stp	xzr, xzr, [sp, #0x28]
 4254468: f9001fff     	str	xzr, [sp, #0x38]
 425446c: 910103e0     	add	x0, sp, #0x40
 4254470: 9100a3e1     	add	x1, sp, #0x28
 4254474: 910122a2     	add	x2, x21, #0x48
 4254478: 94005e7a     	bl	0x426be60 <_ChromeMain+0x4266bc4>
 425447c: f94017f8     	ldr	x24, [sp, #0x28]
 4254480: b5008518     	cbnz	x24, 0x4255520 <_ChromeMain+0x4250284>
 4254484: f94023f8     	ldr	x24, [sp, #0x40]
 4254488: b4fffd78     	cbz	x24, 0x4254434 <_ChromeMain+0x424f198>
 425448c: f94027e8     	ldr	x8, [sp, #0x48]
 4254490: 52801609     	mov	w9, #0xb0               ; =176
 4254494: 9b097d09     	mul	x9, x8, x9
 4254498: b4000309     	cbz	x9, 0x42544f8 <_ChromeMain+0x424f25c>
 425449c: 8b180129     	add	x9, x9, x24
 42544a0: d102c120     	sub	x0, x9, #0xb0
 42544a4: 928015e9     	mov	x9, #-0xb0              ; =-176
 42544a8: 9b097d19     	mul	x25, x8, x9
 42544ac: b4006d00     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 42544b0: 94005bc4     	bl	0x426b3c0 <_ChromeMain+0x4266124>
 42544b4: d102c000     	sub	x0, x0, #0xb0
 42544b8: b102c339     	adds	x25, x25, #0xb0
 42544bc: 54ffff81     	b.ne	0x42544ac <_ChromeMain+0x424f210>
 42544c0: f94023e0     	ldr	x0, [sp, #0x40]
 42544c4: cb000308     	sub	x8, x24, x0
 42544c8: 9344fd08     	asr	x8, x8, #4
 42544cc: d2917469     	mov	x9, #0x8ba3             ; =35747
 42544d0: f2b745c9     	movk	x9, #0xba2e, lsl #16
 42544d4: f2d45d09     	movk	x9, #0xa2e8, lsl #32
 42544d8: f2e5d169     	movk	x9, #0x2e8b, lsl #48
 42544dc: 9b097d08     	mul	x8, x8, x9
 42544e0: f90027e8     	str	x8, [sp, #0x48]
 42544e4: f9402be8     	ldr	x8, [sp, #0x50]
 42544e8: 52801609     	mov	w9, #0xb0               ; =176
 42544ec: 9b097d01     	mul	x1, x8, x9
 42544f0: 96f6d272     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42544f4: 17ffffd0     	b	0x4254434 <_ChromeMain+0x424f198>
 42544f8: aa1803e0     	mov	x0, x24
 42544fc: 17fffff2     	b	0x42544c4 <_ChromeMain+0x424f228>
 4254500: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4254504: f90013ff     	str	xzr, [sp, #0x20]
 4254508: a9387fbf     	stp	xzr, xzr, [x29, #-0x80]
 425450c: f81903bf     	stur	xzr, [x29, #-0x70]
 4254510: 9004bfe1     	adrp	x1, 0xda50000 <dyld_stub_binder+0xda50000>
 4254514: 9126dc21     	add	x1, x1, #0x9b7
 4254518: d10203a8     	sub	x8, x29, #0x80
 425451c: 9105c3e0     	add	x0, sp, #0x170
 4254520: 528000e2     	mov	w2, #0x7                ; =7
 4254524: 975113bc     	bl	0x1699414 <_ChromeMain+0x1694178>
 4254528: d10203a0     	sub	x0, x29, #0x80
 425452c: 977f3fc5     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 4254530: 34000ce0     	cbz	w0, 0x42546cc <_ChromeMain+0x424f430>
 4254534: f90123ff     	str	xzr, [sp, #0x240]
 4254538: f9011fff     	str	xzr, [sp, #0x238]
 425453c: f90127ff     	str	xzr, [sp, #0x248]
 4254540: f90117ff     	str	xzr, [sp, #0x228]
 4254544: f90113ff     	str	xzr, [sp, #0x220]
 4254548: f9011bff     	str	xzr, [sp, #0x230]
 425454c: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254550: 37f86ba8     	tbnz	w8, #0x1f, 0x42552c4 <_ChromeMain+0x4250028>
 4254554: 52800008     	mov	w8, #0x0                ; =0
 4254558: 3cd803a0     	ldur	q0, [x29, #-0x80]
 425455c: 3d808be0     	str	q0, [sp, #0x220]
 4254560: f85903a9     	ldur	x9, [x29, #-0x70]
 4254564: f9011be9     	str	x9, [sp, #0x230]
 4254568: 93407d08     	sxtw	x8, w8
 425456c: b50003a8     	cbnz	x8, 0x42545e0 <_ChromeMain+0x424f344>
 4254570: d00473c0     	adrp	x0, 0xd0ce000 <dyld_stub_binder+0xd0ce000>
 4254574: 91178c00     	add	x0, x0, #0x5e3
 4254578: 9108e3e2     	add	x2, sp, #0x238
 425457c: 52800141     	mov	w1, #0xa                ; =10
 4254580: 97b8d2d4     	bl	0x30890d0 <_ChromeMain+0x3083e34>
 4254584: 340002e0     	cbz	w0, 0x42545e0 <_ChromeMain+0x424f344>
 4254588: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 425458c: f9002bff     	str	xzr, [sp, #0x50]
 4254590: 9004bfe1     	adrp	x1, 0xda50000 <dyld_stub_binder+0xda50000>
 4254594: 9126dc21     	add	x1, x1, #0x9b7
 4254598: 910103e8     	add	x8, sp, #0x40
 425459c: 9108e3e0     	add	x0, sp, #0x238
 42545a0: 528000e2     	mov	w2, #0x7                ; =7
 42545a4: 9751139c     	bl	0x1699414 <_ChromeMain+0x1694178>
 42545a8: d10203a0     	sub	x0, x29, #0x80
 42545ac: 910103e1     	add	x1, sp, #0x40
 42545b0: 9516d904     	bl	0x880a9c0 <_ChromeMain+0x8805724>
 42545b4: 34000120     	cbz	w0, 0x42545d8 <_ChromeMain+0x424f33c>
 42545b8: 39c8dfe9     	ldrsb	w9, [sp, #0x237]
 42545bc: 39415fe8     	ldrb	w8, [sp, #0x57]
 42545c0: 37f87f89     	tbnz	w9, #0x1f, 0x42555b0 <_ChromeMain+0x4250314>
 42545c4: 37386468     	tbnz	w8, #0x7, 0x4255250 <_ChromeMain+0x424ffb4>
 42545c8: 3dc013e0     	ldr	q0, [sp, #0x40]
 42545cc: 3d808be0     	str	q0, [sp, #0x220]
 42545d0: f9402be8     	ldr	x8, [sp, #0x50]
 42545d4: f9011be8     	str	x8, [sp, #0x230]
 42545d8: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 42545dc: 37f86848     	tbnz	w8, #0x1f, 0x42552e4 <_ChromeMain+0x4250048>
 42545e0: 6f00e400     	movi.2d	v0, #0000000000000000
 42545e4: ad0983e0     	stp	q0, q0, [sp, #0x130]
 42545e8: ad0883e0     	stp	q0, q0, [sp, #0x110]
 42545ec: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 42545f0: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 42545f4: ad0583e0     	stp	q0, q0, [sp, #0xb0]
 42545f8: ad0483e0     	stp	q0, q0, [sp, #0x90]
 42545fc: ad0383e0     	stp	q0, q0, [sp, #0x70]
 4254600: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4254604: 3d8013e0     	str	q0, [sp, #0x40]
 4254608: 9004af01     	adrp	x1, 0xd834000 <dyld_stub_binder+0xd834000>
 425460c: 91299421     	add	x1, x1, #0xa65
 4254610: 910103e0     	add	x0, sp, #0x40
 4254614: 97b6eccd     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 4254618: 910103e0     	add	x0, sp, #0x40
 425461c: 910883e1     	add	x1, sp, #0x220
 4254620: 974c3419     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 4254624: 34000300     	cbz	w0, 0x4254684 <_ChromeMain+0x424f3e8>
 4254628: 910623fa     	add	x26, sp, #0x188
 425462c: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4254630: f81783bf     	stur	xzr, [x29, #-0x88]
 4254634: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254638: 9112b421     	add	x1, x1, #0x4ad
 425463c: 910103e0     	add	x0, sp, #0x40
 4254640: 528009c2     	mov	w2, #0x4e               ; =78
 4254644: 52800003     	mov	w3, #0x0                ; =0
 4254648: 9722a62e     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 425464c: f81603a0     	stur	x0, [x29, #-0xa0]
 4254650: 381683bf     	sturb	wzr, [x29, #-0x98]
 4254654: 3816c3bf     	sturb	wzr, [x29, #-0x94]
 4254658: 381703bf     	sturb	wzr, [x29, #-0x90]
 425465c: 381783bf     	sturb	wzr, [x29, #-0x88]
 4254660: f9401408     	ldr	x8, [x0, #0x28]
 4254664: b40000a8     	cbz	x8, 0x4254678 <_ChromeMain+0x424f3dc>
 4254668: d10283a0     	sub	x0, x29, #0xa0
 425466c: 9718f015     	bl	0x8906c0 <_ChromeMain+0x88b424>
 4254670: 7101901f     	cmp	w0, #0x64
 4254674: 54004a80     	b.eq	0x4254fc4 <_ChromeMain+0x424fd28>
 4254678: d10283a0     	sub	x0, x29, #0xa0
 425467c: 9722a132     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 4254680: 910623fa     	add	x26, sp, #0x188
 4254684: 910103e0     	add	x0, sp, #0x40
 4254688: 97686ad7     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 425468c: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 4254690: 37f85e88     	tbnz	w8, #0x1f, 0x4255260 <_ChromeMain+0x424ffc4>
 4254694: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 4254698: 36f87ca8     	tbz	w8, #0x1f, 0x425562c <_ChromeMain+0x4250390>
 425469c: f94123e8     	ldr	x8, [sp, #0x240]
 42546a0: b4005ea8     	cbz	x8, 0x4255274 <_ChromeMain+0x424ffd8>
 42546a4: 9108e3e0     	add	x0, sp, #0x238
 42546a8: 97c06620     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 42546ac: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 42546b0: 340000c0     	cbz	w0, 0x42546c8 <_ChromeMain+0x424f42c>
 42546b4: 36f87c08     	tbz	w8, #0x1f, 0x4255634 <_ChromeMain+0x4250398>
 42546b8: f9411fe8     	ldr	x8, [sp, #0x238]
 42546bc: 3900011f     	strb	wzr, [x8]
 42546c0: f90123ff     	str	xzr, [sp, #0x240]
 42546c4: 39493fe8     	ldrb	w8, [sp, #0x24f]
 42546c8: 37385d68     	tbnz	w8, #0x7, 0x4255274 <_ChromeMain+0x424ffd8>
 42546cc: 38d973a8     	ldursb	w8, [x29, #-0x69]
 42546d0: 37f85b48     	tbnz	w8, #0x1f, 0x4255238 <_ChromeMain+0x424ff9c>
 42546d4: f9404277     	ldr	x23, [x19, #0x80]
 42546d8: b40003d7     	cbz	x23, 0x4254750 <_ChromeMain+0x424f4b4>
 42546dc: f9404668     	ldr	x8, [x19, #0x88]
 42546e0: 52801709     	mov	w9, #0xb8               ; =184
 42546e4: 9b097d09     	mul	x9, x8, x9
 42546e8: b4000609     	cbz	x9, 0x42547a8 <_ChromeMain+0x424f50c>
 42546ec: 8b170129     	add	x9, x9, x23
 42546f0: d102e120     	sub	x0, x9, #0xb8
 42546f4: 928016e9     	mov	x9, #-0xb8              ; =-184
 42546f8: 9b097d18     	mul	x24, x8, x9
 42546fc: b4005a80     	cbz	x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254700: aa0003f9     	mov	x25, x0
 4254704: f8548728     	ldr	x8, [x25], #-0xb8
 4254708: f9400108     	ldr	x8, [x8]
 425470c: d63f0100     	blr	x8
 4254710: aa1903e0     	mov	x0, x25
 4254714: b102e318     	adds	x24, x24, #0xb8
 4254718: 54ffff21     	b.ne	0x42546fc <_ChromeMain+0x424f460>
 425471c: f9404260     	ldr	x0, [x19, #0x80]
 4254720: cb0002e8     	sub	x8, x23, x0
 4254724: 9343fd08     	asr	x8, x8, #3
 4254728: d286f4e9     	mov	x9, #0x37a7             ; =14247
 425472c: f2bd37a9     	movk	x9, #0xe9bd, lsl #16
 4254730: f2cde9a9     	movk	x9, #0x6f4d, lsl #32
 4254734: f2fa6f49     	movk	x9, #0xd37a, lsl #48
 4254738: 9b097d08     	mul	x8, x8, x9
 425473c: f9004668     	str	x8, [x19, #0x88]
 4254740: f9404a68     	ldr	x8, [x19, #0x90]
 4254744: 52801709     	mov	w9, #0xb8               ; =184
 4254748: 9b097d01     	mul	x1, x8, x9
 425474c: 96f6d1db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254750: f9400be8     	ldr	x8, [sp, #0x10]
 4254754: f9004268     	str	x8, [x19, #0x80]
 4254758: 3cc183e0     	ldur	q0, [sp, #0x18]
 425475c: 3c888260     	stur	q0, [x19, #0x88]
 4254760: a91a7fff     	stp	xzr, xzr, [sp, #0x1a0]
 4254764: f900dbff     	str	xzr, [sp, #0x1b0]
 4254768: 910683e8     	add	x8, sp, #0x1a0
 425476c: 9105c3e0     	add	x0, sp, #0x170
 4254770: 940014db     	bl	0x4259adc <_ChromeMain+0x4254840>
 4254774: 910103e8     	add	x8, sp, #0x40
 4254778: 9105c3e0     	add	x0, sp, #0x170
 425477c: 910683e1     	add	x1, sp, #0x1a0
 4254780: 940015dc     	bl	0x4259ef0 <_ChromeMain+0x4254c54>
 4254784: f9405a77     	ldr	x23, [x19, #0xb0]
 4254788: b40006b7     	cbz	x23, 0x425485c <_ChromeMain+0x424f5c0>
 425478c: f9405e68     	ldr	x8, [x19, #0xb8]
 4254790: 8b080d08     	add	x8, x8, x8, lsl #3
 4254794: d37ced18     	lsl	x24, x8, #4
 4254798: b4000438     	cbz	x24, 0x425481c <_ChromeMain+0x424f580>
 425479c: d2800019     	mov	x25, #0x0               ; =0
 42547a0: aa1703fb     	mov	x27, x23
 42547a4: 1400000b     	b	0x42547d0 <_ChromeMain+0x424f534>
 42547a8: aa1703e0     	mov	x0, x23
 42547ac: 17ffffdd     	b	0x4254720 <_ChromeMain+0x424f484>
 42547b0: f9400380     	ldr	x0, [x28]
 42547b4: f8580108     	ldur	x8, [x8, #-0x80]
 42547b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42547bc: 96f6d1bf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42547c0: d102437b     	sub	x27, x27, #0x90
 42547c4: 91024339     	add	x25, x25, #0x90
 42547c8: eb19031f     	cmp	x24, x25
 42547cc: 540002c0     	b.eq	0x4254824 <_ChromeMain+0x424f588>
 42547d0: 8b18037a     	add	x26, x27, x24
 42547d4: f102435c     	subs	x28, x26, #0x90
 42547d8: 540053a0     	b.eq	0x425524c <_ChromeMain+0x424ffb0>
 42547dc: d1002340     	sub	x0, x26, #0x8
 42547e0: d2800001     	mov	x1, #0x0                ; =0
 42547e4: 96f74d35     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 42547e8: d1016340     	sub	x0, x26, #0x58
 42547ec: 96f74d23     	bl	0x27c78 <_ChromeMain+0x229dc>
 42547f0: 38d9f348     	ldursb	w8, [x26, #-0x61]
 42547f4: 36f800c8     	tbz	w8, #0x1f, 0x425480c <_ChromeMain+0x424f570>
 42547f8: 8b180368     	add	x8, x27, x24
 42547fc: f8588100     	ldur	x0, [x8, #-0x78]
 4254800: f8598108     	ldur	x8, [x8, #-0x68]
 4254804: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254808: 96f6d1ac     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425480c: 8b180368     	add	x8, x27, x24
 4254810: 38d87109     	ldursb	w9, [x8, #-0x79]
 4254814: 36fffd69     	tbz	w9, #0x1f, 0x42547c0 <_ChromeMain+0x424f524>
 4254818: 17ffffe6     	b	0x42547b0 <_ChromeMain+0x424f514>
 425481c: aa1703e0     	mov	x0, x23
 4254820: 14000003     	b	0x425482c <_ChromeMain+0x424f590>
 4254824: f9405a60     	ldr	x0, [x19, #0xb0]
 4254828: 910623fa     	add	x26, sp, #0x188
 425482c: cb0002e8     	sub	x8, x23, x0
 4254830: 9344fd08     	asr	x8, x8, #4
 4254834: d291c729     	mov	x9, #0x8e39             ; =36409
 4254838: f2a71c69     	movk	x9, #0x38e3, lsl #16
 425483c: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 4254840: f2f1c709     	movk	x9, #0x8e38, lsl #48
 4254844: 9b097d08     	mul	x8, x8, x9
 4254848: f9005e68     	str	x8, [x19, #0xb8]
 425484c: f9406268     	ldr	x8, [x19, #0xc0]
 4254850: 8b080d08     	add	x8, x8, x8, lsl #3
 4254854: d37ced01     	lsl	x1, x8, #4
 4254858: 96f6d198     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425485c: f94023e8     	ldr	x8, [sp, #0x40]
 4254860: f9005a68     	str	x8, [x19, #0xb0]
 4254864: 3cc483e0     	ldur	q0, [sp, #0x48]
 4254868: 3c8b8260     	stur	q0, [x19, #0xb8]
 425486c: 71000a9f     	cmp	w20, #0x2
 4254870: 54000841     	b.ne	0x4254978 <_ChromeMain+0x424f6dc>
 4254874: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254878: b940b108     	ldr	w8, [x8, #0xb0]
 425487c: 7100011f     	cmp	w8, #0x0
 4254880: 540006cc     	b.gt	0x4254958 <_ChromeMain+0x424f6bc>
 4254884: b0054ae8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4254888: b94b8908     	ldr	w8, [x8, #0xb88]
 425488c: 35000088     	cbnz	w8, 0x425489c <_ChromeMain+0x424f600>
 4254890: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254894: f9405d08     	ldr	x8, [x8, #0xb8]
 4254898: b4000608     	cbz	x8, 0x4254958 <_ChromeMain+0x424f6bc>
 425489c: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42548a0: 91080821     	add	x1, x1, #0x202
 42548a4: 910103f4     	add	x20, sp, #0x40
 42548a8: 910103e0     	add	x0, sp, #0x40
 42548ac: 5280fba2     	mov	w2, #0x7dd              ; =2013
 42548b0: 52800003     	mov	w3, #0x0                ; =0
 42548b4: 970ed226     	bl	0x60914c <_ChromeMain+0x603eb0>
 42548b8: d10283b5     	sub	x21, x29, #0xa0
 42548bc: d10283a8     	sub	x8, x29, #0xa0
 42548c0: 52800040     	mov	w0, #0x2                ; =2
 42548c4: 94002d73     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42548c8: 389773a8     	ldursb	x8, [x29, #-0x89]
 42548cc: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42548d0: f100011f     	cmp	x8, #0x0
 42548d4: 9a954120     	csel	x0, x9, x21, mi
 42548d8: 7100011f     	cmp	w8, #0x0
 42548dc: 9a884141     	csel	x1, x10, x8, mi
 42548e0: 910943f5     	add	x21, sp, #0x250
 42548e4: 910943e8     	add	x8, sp, #0x250
 42548e8: 97353908     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42548ec: 39899fe8     	ldrsb	x8, [sp, #0x267]
 42548f0: f9412be9     	ldr	x9, [sp, #0x250]
 42548f4: f9412fea     	ldr	x10, [sp, #0x258]
 42548f8: f100011f     	cmp	x8, #0x0
 42548fc: 9a954121     	csel	x1, x9, x21, mi
 4254900: 7100011f     	cmp	w8, #0x0
 4254904: 9a884142     	csel	x2, x10, x8, mi
 4254908: 91004280     	add	x0, x20, #0x10
 425490c: 96f742ec     	bl	0x254bc <_ChromeMain+0x20220>
 4254910: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254914: 910c1421     	add	x1, x1, #0x305
 4254918: 528005a2     	mov	w2, #0x2d               ; =45
 425491c: 96f742e8     	bl	0x254bc <_ChromeMain+0x20220>
 4254920: 39c99fe8     	ldrsb	w8, [sp, #0x267]
 4254924: 36f800a8     	tbz	w8, #0x1f, 0x4254938 <_ChromeMain+0x424f69c>
 4254928: f9412be0     	ldr	x0, [sp, #0x250]
 425492c: f94133e8     	ldr	x8, [sp, #0x260]
 4254930: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254934: 96f6d161     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254938: 38d773a8     	ldursb	w8, [x29, #-0x89]
 425493c: 36f800a8     	tbz	w8, #0x1f, 0x4254950 <_ChromeMain+0x424f6b4>
 4254940: f85603a0     	ldur	x0, [x29, #-0xa0]
 4254944: f85703a8     	ldur	x8, [x29, #-0x90]
 4254948: d37ff901     	lsl	x1, x8, #1
 425494c: 96f6d15b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254950: 910103e0     	add	x0, sp, #0x40
 4254954: 970ed1cb     	bl	0x609080 <_ChromeMain+0x603de4>
 4254958: 52800028     	mov	w8, #0x1                ; =1
 425495c: 39000268     	strb	w8, [x19]
 4254960: f940d7e1     	ldr	x1, [sp, #0x1a8]
 4254964: 910683e8     	add	x8, sp, #0x1a0
 4254968: f90023e8     	str	x8, [sp, #0x40]
 425496c: 910103e0     	add	x0, sp, #0x40
 4254970: 9713304f     	bl	0x720aac <_ChromeMain+0x71b810>
 4254974: 17fffdbb     	b	0x4254060 <_ChromeMain+0x424edc4>
 4254978: 9105c3e0     	add	x0, sp, #0x170
 425497c: 94001345     	bl	0x4259690 <_ChromeMain+0x42543f4>
 4254980: 37000580     	tbnz	w0, #0x0, 0x4254a30 <_ChromeMain+0x424f794>
 4254984: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254988: b940b108     	ldr	w8, [x8, #0xb0]
 425498c: 7100011f     	cmp	w8, #0x0
 4254990: 54fffe4c     	b.gt	0x4254958 <_ChromeMain+0x424f6bc>
 4254994: b0054ae8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4254998: b94b8908     	ldr	w8, [x8, #0xb88]
 425499c: 35000088     	cbnz	w8, 0x42549ac <_ChromeMain+0x424f710>
 42549a0: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 42549a4: f9405d08     	ldr	x8, [x8, #0xb8]
 42549a8: b4fffd88     	cbz	x8, 0x4254958 <_ChromeMain+0x424f6bc>
 42549ac: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42549b0: 91080821     	add	x1, x1, #0x202
 42549b4: 910103f5     	add	x21, sp, #0x40
 42549b8: 910103e0     	add	x0, sp, #0x40
 42549bc: 5280fc02     	mov	w2, #0x7e0              ; =2016
 42549c0: 52800003     	mov	w3, #0x0                ; =0
 42549c4: 970ed1e2     	bl	0x60914c <_ChromeMain+0x603eb0>
 42549c8: d10283b6     	sub	x22, x29, #0xa0
 42549cc: d10283a8     	sub	x8, x29, #0xa0
 42549d0: aa1403e0     	mov	x0, x20
 42549d4: 94002d2f     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42549d8: 389773a8     	ldursb	x8, [x29, #-0x89]
 42549dc: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 42549e0: f100011f     	cmp	x8, #0x0
 42549e4: 9a964120     	csel	x0, x9, x22, mi
 42549e8: 7100011f     	cmp	w8, #0x0
 42549ec: 9a884141     	csel	x1, x10, x8, mi
 42549f0: 910943f4     	add	x20, sp, #0x250
 42549f4: 910943e8     	add	x8, sp, #0x250
 42549f8: 973538c4     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42549fc: 39899fe8     	ldrsb	x8, [sp, #0x267]
 4254a00: f9412be9     	ldr	x9, [sp, #0x250]
 4254a04: f9412fea     	ldr	x10, [sp, #0x258]
 4254a08: f100011f     	cmp	x8, #0x0
 4254a0c: 9a944121     	csel	x1, x9, x20, mi
 4254a10: 7100011f     	cmp	w8, #0x0
 4254a14: 9a884142     	csel	x2, x10, x8, mi
 4254a18: 910042a0     	add	x0, x21, #0x10
 4254a1c: 96f742a8     	bl	0x254bc <_ChromeMain+0x20220>
 4254a20: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254a24: 910ccc21     	add	x1, x1, #0x333
 4254a28: 52800722     	mov	w2, #0x39               ; =57
 4254a2c: 17ffffbc     	b	0x425491c <_ChromeMain+0x424f680>
 4254a30: 6f00e400     	movi.2d	v0, #0000000000000000
 4254a34: ad1483e0     	stp	q0, q0, [sp, #0x290]
 4254a38: ad1383e0     	stp	q0, q0, [sp, #0x270]
 4254a3c: ad1283e0     	stp	q0, q0, [sp, #0x250]
 4254a40: 394062c8     	ldrb	w8, [x22, #0x18]
 4254a44: 34001528     	cbz	w8, 0x4254ce8 <_ChromeMain+0x424fa4c>
 4254a48: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4254a4c: 39405ed7     	ldrb	w23, [x22, #0x17]
 4254a50: a94066d8     	ldp	x24, x25, [x22]
 4254a54: b004c940     	adrp	x0, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a58: 911bfc00     	add	x0, x0, #0x6ff
 4254a5c: b004c941     	adrp	x1, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a60: 911c3821     	add	x1, x1, #0x70e
 4254a64: 910103e8     	add	x8, sp, #0x40
 4254a68: 52800262     	mov	w2, #0x13               ; =19
 4254a6c: 96f7f085     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4254a70: d0054b40     	adrp	x0, 0xebbe000 <dyld_stub_binder+0xebbe000>
 4254a74: 910be000     	add	x0, x0, #0x2f8
 4254a78: 103ff241     	adr	x1, 0x42d48c0 <_ChromeMain+0x42cf624>
 4254a7c: d503201f     	nop
 4254a80: 94f9f999     	bl	0x80d30e4 <_ChromeMain+0x80cde48>
 4254a84: 35005dc0     	cbnz	w0, 0x425563c <_ChromeMain+0x42503a0>
 4254a88: 13001ee8     	sxtb	w8, w23
 4254a8c: 7100011f     	cmp	w8, #0x0
 4254a90: 9a974321     	csel	x1, x25, x23, mi
 4254a94: 9a964300     	csel	x0, x24, x22, mi
 4254a98: 900465a2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4254a9c: 91040842     	add	x2, x2, #0x102
 4254aa0: b00565c5     	adrp	x5, 0xef0d000 <dyld_stub_binder+0xef0d000>
 4254aa4: 913de0a5     	add	x5, x5, #0xf78
 4254aa8: d10283a7     	sub	x7, x29, #0xa0
 4254aac: 52800123     	mov	w3, #0x9                ; =9
 4254ab0: 52807d64     	mov	w4, #0x3eb              ; =1003
 4254ab4: 52800206     	mov	w6, #0x10               ; =16
 4254ab8: 97498b12     	bl	0x14b7700 <_ChromeMain+0x14b2464>
 4254abc: 34005c20     	cbz	w0, 0x4255640 <_ChromeMain+0x42503a4>
 4254ac0: 970269c9     	bl	0x2ef1e4 <_ChromeMain+0x2e9f48>
 4254ac4: 385603a8     	ldurb	w8, [x29, #-0xa0]
 4254ac8: f85613a9     	ldur	x9, [x29, #-0x9f]
 4254acc: f80c9349     	stur	x9, [x26, #0xc9]
 4254ad0: f85683a9     	ldur	x9, [x29, #-0x98]
 4254ad4: f9012fe9     	str	x9, [sp, #0x258]
 4254ad8: 52800029     	mov	w9, #0x1                ; =1
 4254adc: 390983e9     	strb	w9, [sp, #0x260]
 4254ae0: 3909a3ff     	strb	wzr, [sp, #0x268]
 4254ae4: 390a03ff     	strb	wzr, [sp, #0x280]
 4254ae8: 390a23ff     	strb	wzr, [sp, #0x288]
 4254aec: 390a83ff     	strb	wzr, [sp, #0x2a0]
 4254af0: 390943e8     	strb	w8, [sp, #0x250]
 4254af4: 390aa3e9     	strb	w9, [sp, #0x2a8]
 4254af8: 9105c3e0     	add	x0, sp, #0x170
 4254afc: 910943e1     	add	x1, sp, #0x250
 4254b00: aa1503e2     	mov	x2, x21
 4254b04: 9400161f     	bl	0x425a380 <_ChromeMain+0x42550e4>
 4254b08: 34000100     	cbz	w0, 0x4254b28 <_ChromeMain+0x424f88c>
 4254b0c: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 4254b10: 360039e8     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254b14: 9105c3e0     	add	x0, sp, #0x170
 4254b18: 910943e1     	add	x1, sp, #0x250
 4254b1c: 910062a2     	add	x2, x21, #0x18
 4254b20: 94001982     	bl	0x425b128 <_ChromeMain+0x4255e8c>
 4254b24: 37003ea0     	tbnz	w0, #0x0, 0x42552f8 <_ChromeMain+0x425005c>
 4254b28: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254b2c: b940b108     	ldr	w8, [x8, #0xb0]
 4254b30: 7100091f     	cmp	w8, #0x2
 4254b34: 540006ac     	b.gt	0x4254c08 <_ChromeMain+0x424f96c>
 4254b38: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254b3c: 91080821     	add	x1, x1, #0x202
 4254b40: 910103f5     	add	x21, sp, #0x40
 4254b44: 910103e0     	add	x0, sp, #0x40
 4254b48: 5280fd22     	mov	w2, #0x7e9              ; =2025
 4254b4c: 52800043     	mov	w3, #0x2                ; =2
 4254b50: 970ed17f     	bl	0x60914c <_ChromeMain+0x603eb0>
 4254b54: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254b58: 910db421     	add	x1, x1, #0x36d
 4254b5c: 910042a0     	add	x0, x21, #0x10
 4254b60: 52800482     	mov	w2, #0x24               ; =36
 4254b64: 96f74256     	bl	0x254bc <_ChromeMain+0x20220>
 4254b68: aa0003f5     	mov	x21, x0
 4254b6c: d10203b6     	sub	x22, x29, #0x80
 4254b70: d10203a8     	sub	x8, x29, #0x80
 4254b74: aa1403e0     	mov	x0, x20
 4254b78: 94002cc6     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254b7c: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254b80: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254b84: f100011f     	cmp	x8, #0x0
 4254b88: 9a964120     	csel	x0, x9, x22, mi
 4254b8c: 7100011f     	cmp	w8, #0x0
 4254b90: 9a884141     	csel	x1, x10, x8, mi
 4254b94: d10283b6     	sub	x22, x29, #0xa0
 4254b98: d10283a8     	sub	x8, x29, #0xa0
 4254b9c: 9735385b     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254ba0: 389773a8     	ldursb	x8, [x29, #-0x89]
 4254ba4: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4254ba8: f100011f     	cmp	x8, #0x0
 4254bac: 9a964121     	csel	x1, x9, x22, mi
 4254bb0: 7100011f     	cmp	w8, #0x0
 4254bb4: 9a884142     	csel	x2, x10, x8, mi
 4254bb8: aa1503e0     	mov	x0, x21
 4254bbc: 96f74240     	bl	0x254bc <_ChromeMain+0x20220>
 4254bc0: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254bc4: 910e4821     	add	x1, x1, #0x392
 4254bc8: 528002c2     	mov	w2, #0x16               ; =22
 4254bcc: 96f7423c     	bl	0x254bc <_ChromeMain+0x20220>
 4254bd0: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254bd4: 36f800a8     	tbz	w8, #0x1f, 0x4254be8 <_ChromeMain+0x424f94c>
 4254bd8: f85603a0     	ldur	x0, [x29, #-0xa0]
 4254bdc: f85703a8     	ldur	x8, [x29, #-0x90]
 4254be0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254be4: 96f6d0b5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254be8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254bec: 36f800a8     	tbz	w8, #0x1f, 0x4254c00 <_ChromeMain+0x424f964>
 4254bf0: f85803a0     	ldur	x0, [x29, #-0x80]
 4254bf4: f85903a8     	ldur	x8, [x29, #-0x70]
 4254bf8: d37ff901     	lsl	x1, x8, #1
 4254bfc: 96f6d0af     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254c00: 910103e0     	add	x0, sp, #0x40
 4254c04: 970ed11f     	bl	0x609080 <_ChromeMain+0x603de4>
 4254c08: d10203b5     	sub	x21, x29, #0x80
 4254c0c: d10203a8     	sub	x8, x29, #0x80
 4254c10: aa1403e0     	mov	x0, x20
 4254c14: 94002c9f     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254c18: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254c1c: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254c20: f100011f     	cmp	x8, #0x0
 4254c24: 9a954120     	csel	x0, x9, x21, mi
 4254c28: 7100011f     	cmp	w8, #0x0
 4254c2c: 9a884141     	csel	x1, x10, x8, mi
 4254c30: d10283a8     	sub	x8, x29, #0xa0
 4254c34: 97353835     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254c38: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254c3c: 12001d17     	and	w23, w8, #0xff
 4254c40: 37f838a8     	tbnz	w8, #0x1f, 0x4255354 <_ChromeMain+0x42500b8>
 4254c44: 92401d14     	and	x20, x8, #0xff
 4254c48: 510022e8     	sub	w8, w23, #0x8
 4254c4c: 71003d1f     	cmp	w8, #0xf
 4254c50: 54003ba3     	b.lo	0x42553c4 <_ChromeMain+0x4250128>
 4254c54: d10283b5     	sub	x21, x29, #0xa0
 4254c58: 9004bcb6     	adrp	x22, 0xd9e8000 <dyld_stub_binder+0xd9e8000>
 4254c5c: 911682d6     	add	x22, x22, #0x5a0
 4254c60: b40001b4     	cbz	x20, 0x4254c94 <_ChromeMain+0x424f9f8>
 4254c64: 8b1402a8     	add	x8, x21, x20
 4254c68: eb15011f     	cmp	x8, x21
 4254c6c: 54002f03     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 4254c70: eb16011f     	cmp	x8, x22
 4254c74: fa5682a2     	ccmp	x21, x22, #0x2, hi
 4254c78: 528001e8     	mov	w8, #0xf                ; =15
 4254c7c: 9a9f9108     	csel	x8, x8, xzr, ls
 4254c80: 8b0802d6     	add	x22, x22, x8
 4254c84: 91003ea0     	add	x0, x21, #0xf
 4254c88: aa1503e1     	mov	x1, x21
 4254c8c: aa1403e2     	mov	x2, x20
 4254c90: 94f6e98f     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4254c94: f94002c8     	ldr	x8, [x22]
 4254c98: f90002a8     	str	x8, [x21]
 4254c9c: f84072c8     	ldur	x8, [x22, #0x7]
 4254ca0: f80072a8     	stur	x8, [x21, #0x7]
 4254ca4: 91003e88     	add	x8, x20, #0xf
 4254ca8: 38d773a9     	ldursb	w9, [x29, #-0x89]
 4254cac: 37f83509     	tbnz	w9, #0x1f, 0x425534c <_ChromeMain+0x42500b0>
 4254cb0: 12001909     	and	w9, w8, #0x7f
 4254cb4: 381773a9     	sturb	w9, [x29, #-0x89]
 4254cb8: 38286abf     	strb	wzr, [x21, x8]
 4254cbc: 3cd603a0     	ldur	q0, [x29, #-0xa0]
 4254cc0: 3d8013e0     	str	q0, [sp, #0x40]
 4254cc4: f85703a8     	ldur	x8, [x29, #-0x90]
 4254cc8: f9002be8     	str	x8, [sp, #0x50]
 4254ccc: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4254cd0: f81603bf     	stur	xzr, [x29, #-0xa0]
 4254cd4: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254cd8: 910ea421     	add	x1, x1, #0x3a9
 4254cdc: 910103e0     	add	x0, sp, #0x40
 4254ce0: 528002a2     	mov	w2, #0x15               ; =21
 4254ce4: 14000070     	b	0x4254ea4 <_ChromeMain+0x424fc08>
 4254ce8: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254cec: b940b108     	ldr	w8, [x8, #0xb0]
 4254cf0: 7100091f     	cmp	w8, #0x2
 4254cf4: 540006ac     	b.gt	0x4254dc8 <_ChromeMain+0x424fb2c>
 4254cf8: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254cfc: 91080821     	add	x1, x1, #0x202
 4254d00: 910103f5     	add	x21, sp, #0x40
 4254d04: 910103e0     	add	x0, sp, #0x40
 4254d08: 5280fe42     	mov	w2, #0x7f2              ; =2034
 4254d0c: 52800043     	mov	w3, #0x2                ; =2
 4254d10: 970ed10f     	bl	0x60914c <_ChromeMain+0x603eb0>
 4254d14: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254d18: 910efc21     	add	x1, x1, #0x3bf
 4254d1c: 910042a0     	add	x0, x21, #0x10
 4254d20: 52800222     	mov	w2, #0x11               ; =17
 4254d24: 96f741e6     	bl	0x254bc <_ChromeMain+0x20220>
 4254d28: aa0003f5     	mov	x21, x0
 4254d2c: d10203b6     	sub	x22, x29, #0x80
 4254d30: d10203a8     	sub	x8, x29, #0x80
 4254d34: aa1403e0     	mov	x0, x20
 4254d38: 94002c56     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254d3c: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254d40: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254d44: f100011f     	cmp	x8, #0x0
 4254d48: 9a964120     	csel	x0, x9, x22, mi
 4254d4c: 7100011f     	cmp	w8, #0x0
 4254d50: 9a884141     	csel	x1, x10, x8, mi
 4254d54: d10283b6     	sub	x22, x29, #0xa0
 4254d58: d10283a8     	sub	x8, x29, #0xa0
 4254d5c: 973537eb     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254d60: 389773a8     	ldursb	x8, [x29, #-0x89]
 4254d64: a9762ba9     	ldp	x9, x10, [x29, #-0xa0]
 4254d68: f100011f     	cmp	x8, #0x0
 4254d6c: 9a964121     	csel	x1, x9, x22, mi
 4254d70: 7100011f     	cmp	w8, #0x0
 4254d74: 9a884142     	csel	x2, x10, x8, mi
 4254d78: aa1503e0     	mov	x0, x21
 4254d7c: 96f741d0     	bl	0x254bc <_ChromeMain+0x20220>
 4254d80: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254d84: 910f4421     	add	x1, x1, #0x3d1
 4254d88: 528002e2     	mov	w2, #0x17               ; =23
 4254d8c: 96f741cc     	bl	0x254bc <_ChromeMain+0x20220>
 4254d90: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254d94: 36f800a8     	tbz	w8, #0x1f, 0x4254da8 <_ChromeMain+0x424fb0c>
 4254d98: f85603a0     	ldur	x0, [x29, #-0xa0]
 4254d9c: f85703a8     	ldur	x8, [x29, #-0x90]
 4254da0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254da4: 96f6d045     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254da8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254dac: 36f800a8     	tbz	w8, #0x1f, 0x4254dc0 <_ChromeMain+0x424fb24>
 4254db0: f85803a0     	ldur	x0, [x29, #-0x80]
 4254db4: f85903a8     	ldur	x8, [x29, #-0x70]
 4254db8: d37ff901     	lsl	x1, x8, #1
 4254dbc: 96f6d03f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254dc0: 910103e0     	add	x0, sp, #0x40
 4254dc4: 970ed0af     	bl	0x609080 <_ChromeMain+0x603de4>
 4254dc8: d10203b5     	sub	x21, x29, #0x80
 4254dcc: d10203a8     	sub	x8, x29, #0x80
 4254dd0: aa1403e0     	mov	x0, x20
 4254dd4: 94002c2f     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4254dd8: 389973a8     	ldursb	x8, [x29, #-0x69]
 4254ddc: a9782ba9     	ldp	x9, x10, [x29, #-0x80]
 4254de0: f100011f     	cmp	x8, #0x0
 4254de4: 9a954120     	csel	x0, x9, x21, mi
 4254de8: 7100011f     	cmp	w8, #0x0
 4254dec: 9a884141     	csel	x1, x10, x8, mi
 4254df0: d10283a8     	sub	x8, x29, #0xa0
 4254df4: 973537c5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4254df8: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254dfc: 12001d17     	and	w23, w8, #0xff
 4254e00: 37f83368     	tbnz	w8, #0x1f, 0x425546c <_ChromeMain+0x42501d0>
 4254e04: 92401d14     	and	x20, x8, #0xff
 4254e08: 51001ae8     	sub	w8, w23, #0x6
 4254e0c: 7100451f     	cmp	w8, #0x11
 4254e10: 54000a63     	b.lo	0x4254f5c <_ChromeMain+0x424fcc0>
 4254e14: d10283b5     	sub	x21, x29, #0xa0
 4254e18: f004c656     	adrp	x22, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254e1c: 910fa6d6     	add	x22, x22, #0x3e9
 4254e20: b40001b4     	cbz	x20, 0x4254e54 <_ChromeMain+0x424fbb8>
 4254e24: 8b1402a8     	add	x8, x21, x20
 4254e28: eb15011f     	cmp	x8, x21
 4254e2c: 54002103     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 4254e30: eb16011f     	cmp	x8, x22
 4254e34: fa5682a2     	ccmp	x21, x22, #0x2, hi
 4254e38: 52800228     	mov	w8, #0x11               ; =17
 4254e3c: 9a9f9108     	csel	x8, x8, xzr, ls
 4254e40: 8b0802d6     	add	x22, x22, x8
 4254e44: 910046a0     	add	x0, x21, #0x11
 4254e48: aa1503e1     	mov	x1, x21
 4254e4c: aa1403e2     	mov	x2, x20
 4254e50: 94f6e91f     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4254e54: 3dc002c0     	ldr	q0, [x22]
 4254e58: 3d8002a0     	str	q0, [x21]
 4254e5c: 394042c8     	ldrb	w8, [x22, #0x10]
 4254e60: 390042a8     	strb	w8, [x21, #0x10]
 4254e64: 91004688     	add	x8, x20, #0x11
 4254e68: 38d773a9     	ldursb	w9, [x29, #-0x89]
 4254e6c: 37f826c9     	tbnz	w9, #0x1f, 0x4255344 <_ChromeMain+0x42500a8>
 4254e70: 12001909     	and	w9, w8, #0x7f
 4254e74: 381773a9     	sturb	w9, [x29, #-0x89]
 4254e78: 38286abf     	strb	wzr, [x21, x8]
 4254e7c: 3cd603a0     	ldur	q0, [x29, #-0xa0]
 4254e80: 3d8013e0     	str	q0, [sp, #0x40]
 4254e84: f85703a8     	ldur	x8, [x29, #-0x90]
 4254e88: f9002be8     	str	x8, [sp, #0x50]
 4254e8c: a936ffbf     	stp	xzr, xzr, [x29, #-0x98]
 4254e90: f81603bf     	stur	xzr, [x29, #-0xa0]
 4254e94: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254e98: 910fec21     	add	x1, x1, #0x3fb
 4254e9c: 910103e0     	add	x0, sp, #0x40
 4254ea0: 528001e2     	mov	w2, #0xf                ; =15
 4254ea4: 96f9155f     	bl	0x9a420 <_ChromeMain+0x95184>
 4254ea8: f9400014     	ldr	x20, [x0]
 4254eac: 3cc08000     	ldur	q0, [x0, #0x8]
 4254eb0: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 4254eb4: f900001f     	str	xzr, [x0]
 4254eb8: 39c07e68     	ldrsb	w8, [x19, #0x1f]
 4254ebc: 37f831a8     	tbnz	w8, #0x1f, 0x42554f0 <_ChromeMain+0x4250254>
 4254ec0: f9000674     	str	x20, [x19, #0x8]
 4254ec4: 3d800660     	str	q0, [x19, #0x10]
 4254ec8: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4254ecc: 36f800a8     	tbz	w8, #0x1f, 0x4254ee0 <_ChromeMain+0x424fc44>
 4254ed0: f94023e0     	ldr	x0, [sp, #0x40]
 4254ed4: f9402be8     	ldr	x8, [sp, #0x50]
 4254ed8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254edc: 96f6cff7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254ee0: 38d773a8     	ldursb	w8, [x29, #-0x89]
 4254ee4: 36f800a8     	tbz	w8, #0x1f, 0x4254ef8 <_ChromeMain+0x424fc5c>
 4254ee8: f85603a0     	ldur	x0, [x29, #-0xa0]
 4254eec: f85703a8     	ldur	x8, [x29, #-0x90]
 4254ef0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254ef4: 96f6cff1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254ef8: 38d973a8     	ldursb	w8, [x29, #-0x69]
 4254efc: 36f800a8     	tbz	w8, #0x1f, 0x4254f10 <_ChromeMain+0x424fc74>
 4254f00: f85803a0     	ldur	x0, [x29, #-0x80]
 4254f04: f85903a8     	ldur	x8, [x29, #-0x70]
 4254f08: d37ff901     	lsl	x1, x8, #1
 4254f0c: 96f6cfeb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254f10: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 4254f14: 34ffd268     	cbz	w8, 0x4254960 <_ChromeMain+0x424f6c4>
 4254f18: 394a83e8     	ldrb	w8, [sp, #0x2a0]
 4254f1c: 360000e8     	tbz	w8, #0x0, 0x4254f38 <_ChromeMain+0x424fc9c>
 4254f20: 39ca7fe8     	ldrsb	w8, [sp, #0x29f]
 4254f24: 36f800a8     	tbz	w8, #0x1f, 0x4254f38 <_ChromeMain+0x424fc9c>
 4254f28: f94147e0     	ldr	x0, [sp, #0x288]
 4254f2c: f9414fe8     	ldr	x8, [sp, #0x298]
 4254f30: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254f34: 96f6cfe1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254f38: 394a03e8     	ldrb	w8, [sp, #0x280]
 4254f3c: 3607d128     	tbz	w8, #0x0, 0x4254960 <_ChromeMain+0x424f6c4>
 4254f40: 39c9ffe8     	ldrsb	w8, [sp, #0x27f]
 4254f44: 36ffd0e8     	tbz	w8, #0x1f, 0x4254960 <_ChromeMain+0x424f6c4>
 4254f48: f94137e0     	ldr	x0, [sp, #0x268]
 4254f4c: f9413fe8     	ldr	x8, [sp, #0x278]
 4254f50: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254f54: 96f6cfd9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254f58: 17fffe82     	b	0x4254960 <_ChromeMain+0x424f6c4>
 4254f5c: 91004698     	add	x24, x20, #0x11
 4254f60: 52800600     	mov	w0, #0x30               ; =48
 4254f64: 96f6e901     	bl	0xf368 <_ChromeMain+0xa0cc>
 4254f68: aa0003f5     	mov	x21, x0
 4254f6c: 92800228     	mov	x8, #-0x12              ; =-18
 4254f70: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4254f74: 91010916     	add	x22, x8, #0x42
 4254f78: d10283a1     	sub	x1, x29, #0xa0
 4254f7c: 910046a8     	add	x8, x21, #0x11
 4254f80: eb15011f     	cmp	x8, x21
 4254f84: 54001643     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 4254f88: f004c649     	adrp	x9, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254f8c: 910fa529     	add	x9, x9, #0x3e9
 4254f90: eb09011f     	cmp	x8, x9
 4254f94: fa4982a2     	ccmp	x21, x9, #0x2, hi
 4254f98: 540015a9     	b.ls	0x425524c <_ChromeMain+0x424ffb0>
 4254f9c: 5280040a     	mov	w10, #0x20              ; =32
 4254fa0: 390042aa     	strb	w10, [x21, #0x10]
 4254fa4: 3dc00120     	ldr	q0, [x9]
 4254fa8: 3d8002a0     	str	q0, [x21]
 4254fac: b5003154     	cbnz	x20, 0x42555d4 <_ChromeMain+0x4250338>
 4254fb0: 38386abf     	strb	wzr, [x21, x24]
 4254fb4: 37382ed7     	tbnz	w23, #0x7, 0x425558c <_ChromeMain+0x42502f0>
 4254fb8: a93663b5     	stp	x21, x24, [x29, #-0xa0]
 4254fbc: f81703b6     	stur	x22, [x29, #-0x90]
 4254fc0: 17ffffaf     	b	0x4254e7c <_ChromeMain+0x424fbe0>
 4254fc4: 910943fb     	add	x27, sp, #0x250
 4254fc8: 910683fc     	add	x28, sp, #0x1a0
 4254fcc: 9004ad17     	adrp	x23, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 4254fd0: 910b4ef7     	add	x23, x23, #0x2d3
 4254fd4: d004b278     	adrp	x24, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 4254fd8: 91144318     	add	x24, x24, #0x510
 4254fdc: d004bbd9     	adrp	x25, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4254fe0: 9133cf39     	add	x25, x25, #0xcf3
 4254fe4: 14000014     	b	0x4255034 <_ChromeMain+0x424fd98>
 4254fe8: f94133e0     	ldr	x0, [sp, #0x260]
 4254fec: f9413be8     	ldr	x8, [sp, #0x270]
 4254ff0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254ff4: 96f6cfb1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254ff8: 9101c380     	add	x0, x28, #0x70
 4254ffc: d2800001     	mov	x1, #0x0                ; =0
 4255000: 96f74b2e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4255004: 91008380     	add	x0, x28, #0x20
 4255008: 96f74b1c     	bl	0x27c78 <_ChromeMain+0x229dc>
 425500c: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 4255010: 36f800a8     	tbz	w8, #0x1f, 0x4255024 <_ChromeMain+0x424fd88>
 4255014: f940d3e0     	ldr	x0, [sp, #0x1a0]
 4255018: f940dbe8     	ldr	x8, [sp, #0x1b0]
 425501c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255020: 96f6cfa6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255024: d10283a0     	sub	x0, x29, #0xa0
 4255028: 9718eda6     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425502c: 7101901f     	cmp	w0, #0x64
 4255030: 54ffb241     	b.ne	0x4254678 <_ChromeMain+0x424f3dc>
 4255034: f9010bff     	str	xzr, [sp, #0x210]
 4255038: 6f00e400     	movi.2d	v0, #0000000000000000
 425503c: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4255040: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 4255044: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4255048: 3d806be0     	str	q0, [sp, #0x1a0]
 425504c: d10283a0     	sub	x0, x29, #0xa0
 4255050: 52800001     	mov	w1, #0x0                ; =0
 4255054: 971203e3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 4255058: aa0003e2     	mov	x2, x0
 425505c: aa0103e3     	mov	x3, x1
 4255060: 910683e0     	add	x0, sp, #0x1a0
 4255064: aa0203e1     	mov	x1, x2
 4255068: aa0303e2     	mov	x2, x3
 425506c: 97046c5a     	bl	0x3701d4 <_ChromeMain+0x36af38>
 4255070: 3946e3e8     	ldrb	w8, [sp, #0x1b8]
 4255074: 34fffc28     	cbz	w8, 0x4254ff8 <_ChromeMain+0x424fd5c>
 4255078: 910683e0     	add	x0, sp, #0x1a0
 425507c: aa1703e1     	mov	x1, x23
 4255080: 528000c2     	mov	w2, #0x6                ; =6
 4255084: 970d2cc3     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 4255088: 3707fb80     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 425508c: 910683e0     	add	x0, sp, #0x1a0
 4255090: aa1803e1     	mov	x1, x24
 4255094: 52800202     	mov	w2, #0x10               ; =16
 4255098: 970d2cbe     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425509c: 3707fae0     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 42550a0: 910683e0     	add	x0, sp, #0x1a0
 42550a4: aa1903e1     	mov	x1, x25
 42550a8: 52800102     	mov	w2, #0x8                ; =8
 42550ac: 970d2cb9     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 42550b0: 3707fa40     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 42550b4: f80b037f     	stur	xzr, [x27, #0xb0]
 42550b8: 6f00e400     	movi.2d	v0, #0000000000000000
 42550bc: ad048360     	stp	q0, q0, [x27, #0x90]
 42550c0: ad038360     	stp	q0, q0, [x27, #0x70]
 42550c4: ad028360     	stp	q0, q0, [x27, #0x50]
 42550c8: ad018360     	stp	q0, q0, [x27, #0x30]
 42550cc: ad008360     	stp	q0, q0, [x27, #0x10]
 42550d0: b0050728     	adrp	x8, 0xe33a000 <dyld_stub_binder+0xe33a000>
 42550d4: 912c4108     	add	x8, x8, #0xb10
 42550d8: f9012be8     	str	x8, [sp, #0x250]
 42550dc: f9012fff     	str	xzr, [sp, #0x258]
 42550e0: 91004360     	add	x0, x27, #0x10
 42550e4: 910683e1     	add	x1, sp, #0x1a0
 42550e8: 96fb93ab     	bl	0x139f94 <_ChromeMain+0x134cf8>
 42550ec: 91022368     	add	x8, x27, #0x88
 42550f0: 6f00e400     	movi.2d	v0, #0000000000000000
 42550f4: 3c819100     	stur	q0, [x8, #0x19]
 42550f8: ad000100     	stp	q0, q0, [x8]
 42550fc: d10283a0     	sub	x0, x29, #0xa0
 4255100: 52800021     	mov	w1, #0x1                ; =1
 4255104: 971203b7     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 4255108: 910623e8     	add	x8, sp, #0x188
 425510c: 971a3481     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 4255110: 39467fe8     	ldrb	w8, [sp, #0x19f]
 4255114: 13001d09     	sxtb	w9, w8
 4255118: f940cbe2     	ldr	x2, [sp, #0x190]
 425511c: 7100013f     	cmp	w9, #0x0
 4255120: 9a884048     	csel	x8, x2, x8, mi
 4255124: 394bbfeb     	ldrb	w11, [sp, #0x2ef]
 4255128: 13001d6a     	sxtb	w10, w11
 425512c: f94173ec     	ldr	x12, [sp, #0x2e0]
 4255130: 7100015f     	cmp	w10, #0x0
 4255134: 9a8b418b     	csel	x11, x12, x11, mi
 4255138: eb0b011f     	cmp	x8, x11
 425513c: 540006e1     	b.ne	0x4255218 <_ChromeMain+0x424ff7c>
 4255140: b4000208     	cbz	x8, 0x4255180 <_ChromeMain+0x424fee4>
 4255144: f9416feb     	ldr	x11, [sp, #0x2d8]
 4255148: 7100015f     	cmp	w10, #0x0
 425514c: 9102236c     	add	x12, x27, #0x88
 4255150: 9a8c416b     	csel	x11, x11, x12, mi
 4255154: f940c7ec     	ldr	x12, [sp, #0x188]
 4255158: 7100013f     	cmp	w9, #0x0
 425515c: 910623ed     	add	x13, sp, #0x188
 4255160: 9a8d418c     	csel	x12, x12, x13, mi
 4255164: aa0803ed     	mov	x13, x8
 4255168: 7840258e     	ldrh	w14, [x12], #0x2
 425516c: 7840256f     	ldrh	w15, [x11], #0x2
 4255170: 6b0e01ff     	cmp	w15, w14
 4255174: 54000521     	b.ne	0x4255218 <_ChromeMain+0x424ff7c>
 4255178: f10005ad     	subs	x13, x13, #0x1
 425517c: 54ffff61     	b.ne	0x4255168 <_ChromeMain+0x424fecc>
 4255180: 39c67fe8     	ldrsb	w8, [sp, #0x19f]
 4255184: 36f800a8     	tbz	w8, #0x1f, 0x4255198 <_ChromeMain+0x424fefc>
 4255188: f940c7e0     	ldr	x0, [sp, #0x188]
 425518c: f940cfe8     	ldr	x8, [sp, #0x198]
 4255190: d37ff901     	lsl	x1, x8, #1
 4255194: 96f6cf49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255198: d10283a0     	sub	x0, x29, #0xa0
 425519c: 52800041     	mov	w1, #0x2                ; =2
 42551a0: 971202a4     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551a4: b902f3e0     	str	w0, [sp, #0x2f0]
 42551a8: d10283a0     	sub	x0, x29, #0xa0
 42551ac: 52800061     	mov	w1, #0x3                ; =3
 42551b0: 971202a0     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551b4: b902f7e0     	str	w0, [sp, #0x2f4]
 42551b8: d10283a0     	sub	x0, x29, #0xa0
 42551bc: 52800081     	mov	w1, #0x4                ; =4
 42551c0: 9712029c     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551c4: f9017fe0     	str	x0, [sp, #0x2f8]
 42551c8: d10283a0     	sub	x0, x29, #0xa0
 42551cc: 528000a1     	mov	w1, #0x5                ; =5
 42551d0: 971203b8     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 42551d4: 390c03e0     	strb	w0, [sp, #0x300]
 42551d8: 910043e0     	add	x0, sp, #0x10
 42551dc: 910943e1     	add	x1, sp, #0x250
 42551e0: 94f9dd72     	bl	0x80cc7a8 <_ChromeMain+0x80c750c>
 42551e4: b0050728     	adrp	x8, 0xe33a000 <dyld_stub_binder+0xe33a000>
 42551e8: 912c4108     	add	x8, x8, #0xb10
 42551ec: f9012be8     	str	x8, [sp, #0x250]
 42551f0: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 42551f4: 37f81748     	tbnz	w8, #0x1f, 0x42554dc <_ChromeMain+0x4250240>
 42551f8: 91020360     	add	x0, x27, #0x80
 42551fc: d2800001     	mov	x1, #0x0                ; =0
 4255200: 96f74aae     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4255204: 9100c360     	add	x0, x27, #0x30
 4255208: 96f74a9c     	bl	0x27c78 <_ChromeMain+0x229dc>
 425520c: 39c9dfe8     	ldrsb	w8, [sp, #0x277]
 4255210: 36ffef48     	tbz	w8, #0x1f, 0x4254ff8 <_ChromeMain+0x424fd5c>
 4255214: 17ffff75     	b	0x4254fe8 <_ChromeMain+0x424fd4c>
 4255218: 37f81f6a     	tbnz	w10, #0x1f, 0x4255604 <_ChromeMain+0x4250368>
 425521c: 37f81c29     	tbnz	w9, #0x1f, 0x42555a0 <_ChromeMain+0x4250304>
 4255220: 3dc00340     	ldr	q0, [x26]
 4255224: 91022369     	add	x9, x27, #0x88
 4255228: 3d800120     	str	q0, [x9]
 425522c: f940cfe8     	ldr	x8, [sp, #0x198]
 4255230: f9000928     	str	x8, [x9, #0x10]
 4255234: 17ffffd3     	b	0x4255180 <_ChromeMain+0x424fee4>
 4255238: f85803a0     	ldur	x0, [x29, #-0x80]
 425523c: f85903a8     	ldur	x8, [x29, #-0x70]
 4255240: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255244: 96f6cf1d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255248: 17fffd23     	b	0x42546d4 <_ChromeMain+0x424f438>
 425524c: d4200020     	brk	#0x1
 4255250: a9440be1     	ldp	x1, x2, [sp, #0x40]
 4255254: 910883e0     	add	x0, sp, #0x220
 4255258: 97094e17     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 425525c: 17fffcdf     	b	0x42545d8 <_ChromeMain+0x424f33c>
 4255260: f94113e0     	ldr	x0, [sp, #0x220]
 4255264: f9411be8     	ldr	x8, [sp, #0x230]
 4255268: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425526c: 96f6cf13     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255270: 17fffd09     	b	0x4254694 <_ChromeMain+0x424f3f8>
 4255274: f9411fe0     	ldr	x0, [sp, #0x238]
 4255278: f94127e8     	ldr	x8, [sp, #0x248]
 425527c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255280: 96f6cf0e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255284: 17fffd12     	b	0x42546cc <_ChromeMain+0x424f430>
 4255288: f9400320     	ldr	x0, [x25]
 425528c: f9400b28     	ldr	x8, [x25, #0x10]
 4255290: d37ff901     	lsl	x1, x8, #1
 4255294: 96f6cf09     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255298: 17fffbdc     	b	0x4254208 <_ChromeMain+0x424ef6c>
 425529c: f9400320     	ldr	x0, [x25]
 42552a0: f9400b28     	ldr	x8, [x25, #0x10]
 42552a4: d37ff901     	lsl	x1, x8, #1
 42552a8: 96f6cf04     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42552ac: 17fffc0b     	b	0x42542d8 <_ChromeMain+0x424f03c>
 42552b0: f9400320     	ldr	x0, [x25]
 42552b4: f9400b28     	ldr	x8, [x25, #0x10]
 42552b8: d37ff901     	lsl	x1, x8, #1
 42552bc: 96f6ceff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42552c0: 17fffc3a     	b	0x42543a8 <_ChromeMain+0x424f10c>
 42552c4: a9780ba1     	ldp	x1, x2, [x29, #-0x80]
 42552c8: 910883e0     	add	x0, sp, #0x220
 42552cc: 96f70bd3     	bl	0x18218 <_ChromeMain+0x12f7c>
 42552d0: 39c93fe8     	ldrsb	w8, [sp, #0x24f]
 42552d4: 36ff94a8     	tbz	w8, #0x1f, 0x4254568 <_ChromeMain+0x424f2cc>
 42552d8: f94123e8     	ldr	x8, [sp, #0x240]
 42552dc: b4ff94a8     	cbz	x8, 0x4254570 <_ChromeMain+0x424f2d4>
 42552e0: 17fffcc0     	b	0x42545e0 <_ChromeMain+0x424f344>
 42552e4: f94023e0     	ldr	x0, [sp, #0x40]
 42552e8: f9402be8     	ldr	x8, [sp, #0x50]
 42552ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42552f0: 96f6cef2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42552f4: 17fffcbb     	b	0x42545e0 <_ChromeMain+0x424f344>
 42552f8: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 42552fc: 34ffb2e8     	cbz	w8, 0x4254958 <_ChromeMain+0x424f6bc>
 4255300: 394a83e8     	ldrb	w8, [sp, #0x2a0]
 4255304: 360000e8     	tbz	w8, #0x0, 0x4255320 <_ChromeMain+0x4250084>
 4255308: 39ca7fe8     	ldrsb	w8, [sp, #0x29f]
 425530c: 36f800a8     	tbz	w8, #0x1f, 0x4255320 <_ChromeMain+0x4250084>
 4255310: f94147e0     	ldr	x0, [sp, #0x288]
 4255314: f9414fe8     	ldr	x8, [sp, #0x298]
 4255318: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425531c: 96f6cee7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255320: 394a03e8     	ldrb	w8, [sp, #0x280]
 4255324: 3607b1a8     	tbz	w8, #0x0, 0x4254958 <_ChromeMain+0x424f6bc>
 4255328: 39c9ffe8     	ldrsb	w8, [sp, #0x27f]
 425532c: 36ffb168     	tbz	w8, #0x1f, 0x4254958 <_ChromeMain+0x424f6bc>
 4255330: f94137e0     	ldr	x0, [sp, #0x268]
 4255334: f9413fe8     	ldr	x8, [sp, #0x278]
 4255338: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425533c: 96f6cedf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255340: 17fffd86     	b	0x4254958 <_ChromeMain+0x424f6bc>
 4255344: f81683a8     	stur	x8, [x29, #-0x98]
 4255348: 17fffecc     	b	0x4254e78 <_ChromeMain+0x424fbdc>
 425534c: f81683a8     	stur	x8, [x29, #-0x98]
 4255350: 17fffe5a     	b	0x4254cb8 <_ChromeMain+0x424fa1c>
 4255354: a976a3b4     	ldp	x20, x8, [x29, #-0x98]
 4255358: 9240f908     	and	x8, x8, #0x7fffffffffffffff
 425535c: cb080289     	sub	x9, x20, x8
 4255360: b100413f     	cmn	x9, #0x10
 4255364: 54000068     	b.hi	0x4255370 <_ChromeMain+0x42500d4>
 4255368: f85603b5     	ldur	x21, [x29, #-0xa0]
 425536c: 17fffe3b     	b	0x4254c58 <_ChromeMain+0x424f9bc>
 4255370: 91003e98     	add	x24, x20, #0xf
 4255374: 92800229     	mov	x9, #-0x12              ; =-18
 4255378: f2efffe9     	movk	x9, #0x7fff, lsl #48
 425537c: eb09031f     	cmp	x24, x9
 4255380: 54001668     	b.hi	0x425564c <_ChromeMain+0x42503b0>
 4255384: d1000509     	sub	x9, x8, #0x1
 4255388: d37ff928     	lsl	x8, x9, #1
 425538c: eb09071f     	cmp	x24, x9, lsl #1
 4255390: 9a888308     	csel	x8, x24, x8, hi
 4255394: 9280030a     	mov	x10, #-0x19             ; =-25
 4255398: f2e7ffea     	movk	x10, #0x3fff, lsl #48
 425539c: eb0a013f     	cmp	x9, x10
 42553a0: 540015c8     	b.hi	0x4255658 <_ChromeMain+0x42503bc>
 42553a4: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 42553a8: 91004116     	add	x22, x8, #0x10
 42553ac: aa1603e0     	mov	x0, x22
 42553b0: 96f6e7ee     	bl	0xf368 <_ChromeMain+0xa0cc>
 42553b4: aa0003f5     	mov	x21, x0
 42553b8: f85603a1     	ldur	x1, [x29, #-0xa0]
 42553bc: b24102d6     	orr	x22, x22, #0x8000000000000000
 42553c0: 14000009     	b	0x42553e4 <_ChromeMain+0x4250148>
 42553c4: 91003e98     	add	x24, x20, #0xf
 42553c8: 52800600     	mov	w0, #0x30               ; =48
 42553cc: 96f6e7e7     	bl	0xf368 <_ChromeMain+0xa0cc>
 42553d0: aa0003f5     	mov	x21, x0
 42553d4: 92800228     	mov	x8, #-0x12              ; =-18
 42553d8: f2efffe8     	movk	x8, #0x7fff, lsl #48
 42553dc: 91010916     	add	x22, x8, #0x42
 42553e0: d10283a1     	sub	x1, x29, #0xa0
 42553e4: 91003ea8     	add	x8, x21, #0xf
 42553e8: eb15011f     	cmp	x8, x21
 42553ec: 54fff303     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 42553f0: f004bc89     	adrp	x9, 0xd9e8000 <dyld_stub_binder+0xd9e8000>
 42553f4: 91168129     	add	x9, x9, #0x5a0
 42553f8: eb09011f     	cmp	x8, x9
 42553fc: fa4982a2     	ccmp	x21, x9, #0x2, hi
 4255400: 54fff269     	b.ls	0x425524c <_ChromeMain+0x424ffb0>
 4255404: f940012a     	ldr	x10, [x9]
 4255408: f90002aa     	str	x10, [x21]
 425540c: f8407129     	ldur	x9, [x9, #0x7]
 4255410: f80072a9     	stur	x9, [x21, #0x7]
 4255414: b5000174     	cbnz	x20, 0x4255440 <_ChromeMain+0x42501a4>
 4255418: 38386abf     	strb	wzr, [x21, x24]
 425541c: 37380097     	tbnz	w23, #0x7, 0x425542c <_ChromeMain+0x4250190>
 4255420: a93663b5     	stp	x21, x24, [x29, #-0xa0]
 4255424: f81703b6     	stur	x22, [x29, #-0x90]
 4255428: 17fffe25     	b	0x4254cbc <_ChromeMain+0x424fa20>
 425542c: f85603a0     	ldur	x0, [x29, #-0xa0]
 4255430: f85703a8     	ldur	x8, [x29, #-0x90]
 4255434: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255438: 96f6cea0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425543c: 17fffff9     	b	0x4255420 <_ChromeMain+0x4250184>
 4255440: 8b140109     	add	x9, x8, x20
 4255444: eb08013f     	cmp	x9, x8
 4255448: 54fff023     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 425544c: eb08003f     	cmp	x1, x8
 4255450: 54000063     	b.lo	0x425545c <_ChromeMain+0x42501c0>
 4255454: eb09003f     	cmp	x1, x9
 4255458: 54ffefa3     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 425545c: 91003ea0     	add	x0, x21, #0xf
 4255460: aa1403e2     	mov	x2, x20
 4255464: 94f6e79a     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4255468: 17ffffec     	b	0x4255418 <_ChromeMain+0x425017c>
 425546c: a976a3b4     	ldp	x20, x8, [x29, #-0x98]
 4255470: 9240f908     	and	x8, x8, #0x7fffffffffffffff
 4255474: cb080289     	sub	x9, x20, x8
 4255478: b100493f     	cmn	x9, #0x12
 425547c: 54000068     	b.hi	0x4255488 <_ChromeMain+0x42501ec>
 4255480: f85603b5     	ldur	x21, [x29, #-0xa0]
 4255484: 17fffe65     	b	0x4254e18 <_ChromeMain+0x424fb7c>
 4255488: 91004698     	add	x24, x20, #0x11
 425548c: 92800229     	mov	x9, #-0x12              ; =-18
 4255490: f2efffe9     	movk	x9, #0x7fff, lsl #48
 4255494: eb09031f     	cmp	x24, x9
 4255498: 54000da8     	b.hi	0x425564c <_ChromeMain+0x42503b0>
 425549c: d1000509     	sub	x9, x8, #0x1
 42554a0: d37ff928     	lsl	x8, x9, #1
 42554a4: eb09071f     	cmp	x24, x9, lsl #1
 42554a8: 9a888308     	csel	x8, x24, x8, hi
 42554ac: 9280030a     	mov	x10, #-0x19             ; =-25
 42554b0: f2e7ffea     	movk	x10, #0x3fff, lsl #48
 42554b4: eb0a013f     	cmp	x9, x10
 42554b8: 54000cc8     	b.hi	0x4255650 <_ChromeMain+0x42503b4>
 42554bc: 927ced08     	and	x8, x8, #0xfffffffffffffff0
 42554c0: 91004116     	add	x22, x8, #0x10
 42554c4: aa1603e0     	mov	x0, x22
 42554c8: 96f6e7a8     	bl	0xf368 <_ChromeMain+0xa0cc>
 42554cc: aa0003f5     	mov	x21, x0
 42554d0: f85603a1     	ldur	x1, [x29, #-0xa0]
 42554d4: b24102d6     	orr	x22, x22, #0x8000000000000000
 42554d8: 17fffea9     	b	0x4254f7c <_ChromeMain+0x424fce0>
 42554dc: f9416fe0     	ldr	x0, [sp, #0x2d8]
 42554e0: f94177e8     	ldr	x8, [sp, #0x2e8]
 42554e4: d37ff901     	lsl	x1, x8, #1
 42554e8: 96f6ce74     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42554ec: 17ffff43     	b	0x42551f8 <_ChromeMain+0x424ff5c>
 42554f0: f9400660     	ldr	x0, [x19, #0x8]
 42554f4: f9400e68     	ldr	x8, [x19, #0x18]
 42554f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42554fc: 3d8003e0     	str	q0, [sp]
 4255500: 96f6ce6e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255504: 3dc003e0     	ldr	q0, [sp]
 4255508: 17fffe6e     	b	0x4254ec0 <_ChromeMain+0x424fc24>
 425550c: f9400320     	ldr	x0, [x25]
 4255510: f9400b28     	ldr	x8, [x25, #0x10]
 4255514: d37ff901     	lsl	x1, x8, #1
 4255518: 96f6ce68     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425551c: 1400000c     	b	0x425554c <_ChromeMain+0x42502b0>
 4255520: f9401be8     	ldr	x8, [sp, #0x30]
 4255524: 8b080509     	add	x9, x8, x8, lsl #1
 4255528: d37df129     	lsl	x9, x9, #3
 425552c: b40007c9     	cbz	x9, 0x4255624 <_ChromeMain+0x4250388>
 4255530: 8b180129     	add	x9, x9, x24
 4255534: d1006139     	sub	x25, x9, #0x18
 4255538: d37df109     	lsl	x9, x8, #3
 425553c: cb08153b     	sub	x27, x9, x8, lsl #5
 4255540: b4ffe879     	cbz	x25, 0x425524c <_ChromeMain+0x424ffb0>
 4255544: 39c05f28     	ldrsb	w8, [x25, #0x17]
 4255548: 37fffe28     	tbnz	w8, #0x1f, 0x425550c <_ChromeMain+0x4250270>
 425554c: d1006339     	sub	x25, x25, #0x18
 4255550: b100637b     	adds	x27, x27, #0x18
 4255554: 54ffff61     	b.ne	0x4255540 <_ChromeMain+0x42502a4>
 4255558: f94017e0     	ldr	x0, [sp, #0x28]
 425555c: cb000308     	sub	x8, x24, x0
 4255560: 9343fd08     	asr	x8, x8, #3
 4255564: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4255568: f2955569     	movk	x9, #0xaaab
 425556c: 9b097d08     	mul	x8, x8, x9
 4255570: f9001be8     	str	x8, [sp, #0x30]
 4255574: f9401fe8     	ldr	x8, [sp, #0x38]
 4255578: 8b080508     	add	x8, x8, x8, lsl #1
 425557c: d37df101     	lsl	x1, x8, #3
 4255580: 96f6ce4e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255584: 910623fa     	add	x26, sp, #0x188
 4255588: 17fffbbf     	b	0x4254484 <_ChromeMain+0x424f1e8>
 425558c: f85603a0     	ldur	x0, [x29, #-0xa0]
 4255590: f85703a8     	ldur	x8, [x29, #-0x90]
 4255594: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255598: 96f6ce48     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425559c: 17fffe87     	b	0x4254fb8 <_ChromeMain+0x424fd1c>
 42555a0: f940c7e1     	ldr	x1, [sp, #0x188]
 42555a4: 91022360     	add	x0, x27, #0x88
 42555a8: 9719e451     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 42555ac: 17fffef5     	b	0x4255180 <_ChromeMain+0x424fee4>
 42555b0: 13001d09     	sxtb	w9, w8
 42555b4: 7100013f     	cmp	w9, #0x0
 42555b8: 910103e9     	add	x9, sp, #0x40
 42555bc: a9442fea     	ldp	x10, x11, [sp, #0x40]
 42555c0: 9a894141     	csel	x1, x10, x9, mi
 42555c4: 9a884162     	csel	x2, x11, x8, mi
 42555c8: 910883e0     	add	x0, sp, #0x220
 42555cc: 97094d8d     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 42555d0: 17fffc02     	b	0x42545d8 <_ChromeMain+0x424f33c>
 42555d4: 8b140109     	add	x9, x8, x20
 42555d8: eb08013f     	cmp	x9, x8
 42555dc: 54ffe383     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 42555e0: eb08003f     	cmp	x1, x8
 42555e4: 54000063     	b.lo	0x42555f0 <_ChromeMain+0x4250354>
 42555e8: eb09003f     	cmp	x1, x9
 42555ec: 54ffe303     	b.lo	0x425524c <_ChromeMain+0x424ffb0>
 42555f0: 910046a0     	add	x0, x21, #0x11
 42555f4: aa1403e2     	mov	x2, x20
 42555f8: 94f6e735     	bl	0x800f2cc <_ChromeMain+0x800a030>
 42555fc: 17fffe6d     	b	0x4254fb0 <_ChromeMain+0x424fd14>
 4255600: 94f6bb58     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4255604: f940c7ea     	ldr	x10, [sp, #0x188]
 4255608: 7100013f     	cmp	w9, #0x0
 425560c: 910623e9     	add	x9, sp, #0x188
 4255610: 9a894141     	csel	x1, x10, x9, mi
 4255614: 91022360     	add	x0, x27, #0x88
 4255618: aa0803e2     	mov	x2, x8
 425561c: 9719e486     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4255620: 17fffed8     	b	0x4255180 <_ChromeMain+0x424fee4>
 4255624: aa1803e0     	mov	x0, x24
 4255628: 17ffffcd     	b	0x425555c <_ChromeMain+0x42502c0>
 425562c: 35ff83c8     	cbnz	w8, 0x42546a4 <_ChromeMain+0x424f408>
 4255630: 17fffc27     	b	0x42546cc <_ChromeMain+0x424f430>
 4255634: 39093fff     	strb	wzr, [sp, #0x24f]
 4255638: 17fffc25     	b	0x42546cc <_ChromeMain+0x424f430>
 425563c: 94f80202     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
 4255640: d4200000     	brk	#0
 4255644: d4400000     	hlt	#0
 4255648: d4200020     	brk	#0x1
 425564c: 9426ab50     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 4255650: b27cebf6     	mov	x22, #0x7ffffffffffffff0 ; =9223372036854775792
 4255654: 17ffff9c     	b	0x42554c4 <_ChromeMain+0x4250228>
 4255658: b27cebf6     	mov	x22, #0x7ffffffffffffff0 ; =9223372036854775792
 425565c: 17ffff54     	b	0x42553ac <_ChromeMain+0x4250110>
