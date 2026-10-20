
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45771a8: 39805ea1     	ldrsb	x1, [x21, #0x17]
 45771ac: b6f80041     	tbz	x1, #0x3f, 0x45771b4 <_ChromeMain+0x4571f18>
 45771b0: a94006b5     	ldp	x21, x1, [x21]
 45771b4: 910803e8     	add	x8, sp, #0x200
 45771b8: aa1503e0     	mov	x0, x21
 45771bc: 9717c86f     	bl	0xb69378 <_ChromeMain+0xb640dc>
 45771c0: 52801e00     	mov	w0, #0xf0               ; =240
 45771c4: 94000652     	bl	0x4578b0c <_ChromeMain+0x4573870>
 45771c8: 52800088     	mov	w8, #0x4                ; =4
 45771cc: 3908dfe8     	strb	w8, [sp, #0x237]
 45771d0: 910883e8     	add	x8, sp, #0x220
 45771d4: 91002109     	add	x9, x8, #0x8
 45771d8: 9004d08a     	adrp	x10, 0xdf87000 <dyld_stub_binder+0xdf87000>
 45771dc: 9110314a     	add	x10, x10, #0x40c
 45771e0: eb0a013f     	cmp	x9, x10
 45771e4: fa4a8102     	ccmp	x8, x10, #0x2, hi
 45771e8: 54fed669     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 45771ec: aa0003fc     	mov	x28, x0
 45771f0: d28008a8     	mov	x8, #0x45               ; =69
 45771f4: f2a00c88     	movk	x8, #0x64, lsl #16
 45771f8: f2c00d28     	movk	x8, #0x69, lsl #32
 45771fc: f2e00e88     	movk	x8, #0x74, lsl #48
 4577200: f90113e8     	str	x8, [sp, #0x220]
 4577204: 790453ff     	strh	wzr, [sp, #0x228]
 4577208: f9418e88     	ldr	x8, [x20, #0x318]
 457720c: f940c519     	ldr	x25, [x8, #0x188]
 4577210: b40000d9     	cbz	x25, 0x4577228 <_ChromeMain+0x4571f8c>
 4577214: 52800029     	mov	w9, #0x1                ; =1
 4577218: b8290329     	ldadd	w9, w9, [x25]
 457721c: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4577220: 6b0a013f     	cmp	w9, w10
 4577224: 54008640     	b.eq	0x45782ec <_ChromeMain+0x4573050>
 4577228: f940c913     	ldr	x19, [x8, #0x190]
 457722c: 52800b00     	mov	w0, #0x58               ; =88
 4577230: 96ea604e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4577234: aa0003f5     	mov	x21, x0
 4577238: 52800028     	mov	w8, #0x1                ; =1
 457723c: b9000008     	str	w8, [x0]
 4577240: 90ffcfd6     	adrp	x22, 0x3f6f000 <_ChromeMain+0x3f69d64>
 4577244: 912102d6     	add	x22, x22, #0x840
 4577248: f0ffd797     	adrp	x23, 0x406a000 <_ChromeMain+0x4064d64>
 457724c: 913a02f7     	add	x23, x23, #0xe80
 4577250: a900dc16     	stp	x22, x23, [x0, #0x8]
 4577254: f0ffd9b8     	adrp	x24, 0x40ae000 <_ChromeMain+0x40a8d64>
 4577258: 911b0318     	add	x24, x24, #0x6c0
 457725c: 10fd3a28     	adr	x8, 0x45719a0 <_ChromeMain+0x456c704>
 4577260: d503201f     	nop
 4577264: a901a018     	stp	x24, x8, [x0, #0x18]
 4577268: a902e41f     	stp	xzr, x25, [x0, #0x28]
 457726c: f9001c13     	str	x19, [x0, #0x38]
 4577270: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 4577274: 37fff908     	tbnz	w8, #0x1f, 0x4577194 <_ChromeMain+0x4571ef8>
 4577278: 3cc38360     	ldur	q0, [x27, #0x38]
 457727c: 3c8402a0     	stur	q0, [x21, #0x40]
 4577280: f9410be8     	ldr	x8, [sp, #0x210]
 4577284: f80502a8     	stur	x8, [x21, #0x50]
 4577288: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 457728c: f9009bff     	str	xzr, [sp, #0x130]
 4577290: b00522e3     	adrp	x3, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4577294: 9138e063     	add	x3, x3, #0xe38
 4577298: 910883e2     	add	x2, sp, #0x220
 457729c: 910483e5     	add	x5, sp, #0x120
 45772a0: aa1403e0     	mov	x0, x20
 45772a4: aa1c03e1     	mov	x1, x28
 45772a8: aa1503e4     	mov	x4, x21
 45772ac: 52800026     	mov	w6, #0x1                ; =1
 45772b0: 940006d4     	bl	0x4578e00 <_ChromeMain+0x4573b64>
 45772b4: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 45772b8: 36f800a8     	tbz	w8, #0x1f, 0x45772cc <_ChromeMain+0x4572030>
 45772bc: f94093e0     	ldr	x0, [sp, #0x120]
 45772c0: f9409be8     	ldr	x8, [sp, #0x130]
 45772c4: d37ff901     	lsl	x1, x8, #1
 45772c8: 96ea46fc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45772cc: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 45772d0: 36f800a8     	tbz	w8, #0x1f, 0x45772e4 <_ChromeMain+0x4572048>
 45772d4: f94113e0     	ldr	x0, [sp, #0x220]
 45772d8: f9411be8     	ldr	x8, [sp, #0x230]
 45772dc: d37ff901     	lsl	x1, x8, #1
 45772e0: 96ea46f6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45772e4: f0054b68     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45772e8: f9467d00     	ldr	x0, [x8, #0xcf8]
 45772ec: b4ffa040     	cbz	x0, 0x45766f4 <_ChromeMain+0x4571458>
 45772f0: 9752a222     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 45772f4: b4ffa000     	cbz	x0, 0x45766f4 <_ChromeMain+0x4571458>
 45772f8: 9752a246     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 45772fc: 97ee1914     	bl	0x40fd74c <_ChromeMain+0x40f84b0>
 4577300: f100081f     	cmp	x0, #0x2
 4577304: 54ff9f83     	b.lo	0x45766f4 <_ChromeMain+0x4571458>
 4577308: 528000c8     	mov	w8, #0x6                ; =6
 457730c: 39035fe8     	strb	w8, [sp, #0xd7]
 4577310: 910303e9     	add	x9, sp, #0xc0
 4577314: 9100312a     	add	x10, x9, #0xc
 4577318: f004d068     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 457731c: 913e9908     	add	x8, x8, #0xfa6
 4577320: eb08015f     	cmp	x10, x8
 4577324: fa488122     	ccmp	x9, x8, #0x2, hi
 4577328: 54fecc69     	b.ls	0x4574cb4 <_ChromeMain+0x456fa18>
 457732c: 52800e89     	mov	w9, #0x74               ; =116
 4577330: 72a00ca9     	movk	w9, #0x65, lsl #16
 4577334: b900cbe9     	str	w9, [sp, #0xc8]
 4577338: f9400108     	ldr	x8, [x8]
 457733c: f90063e8     	str	x8, [sp, #0xc0]
 4577340: 79019bff     	strh	wzr, [sp, #0xcc]
 4577344: f9418e88     	ldr	x8, [x20, #0x318]
 4577348: f940c519     	ldr	x25, [x8, #0x188]
 457734c: b40000d9     	cbz	x25, 0x4577364 <_ChromeMain+0x45720c8>
 4577350: 52800029     	mov	w9, #0x1                ; =1
 4577354: b8290329     	ldadd	w9, w9, [x25]
 4577358: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 457735c: 6b0a013f     	cmp	w9, w10
 4577360: 54008640     	b.eq	0x4578428 <_ChromeMain+0x457318c>
 4577364: f940c913     	ldr	x19, [x8, #0x190]
 4577368: 52800b00     	mov	w0, #0x58               ; =88
 457736c: 96ea5fff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4577370: aa0003f5     	mov	x21, x0
 4577374: 52800028     	mov	w8, #0x1                ; =1
 4577378: b9000008     	str	w8, [x0]
 457737c: a900dc16     	stp	x22, x23, [x0, #0x8]
 4577380: 10fd6328     	adr	x8, 0x4571fe4 <_ChromeMain+0x456cd48>
 4577384: d503201f     	nop
 4577388: a901a018     	stp	x24, x8, [x0, #0x18]
 457738c: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4577390: f9001c13     	str	x19, [x0, #0x38]
 4577394: 39c85fe8     	ldrsb	w8, [sp, #0x217]
 4577398: 37f801e8     	tbnz	w8, #0x1f, 0x45773d4 <_ChromeMain+0x4572138>
 457739c: 3cc38360     	ldur	q0, [x27, #0x38]
 45773a0: 3c8402a0     	stur	q0, [x21, #0x40]
 45773a4: f9410be8     	ldr	x8, [sp, #0x210]
 45773a8: f80502a8     	stur	x8, [x21, #0x50]
 45773ac: a918ffff     	stp	xzr, xzr, [sp, #0x188]
 45773b0: f900cfff     	str	xzr, [sp, #0x198]
 45773b4: f9418a88     	ldr	x8, [x20, #0x310]
 45773b8: f9403500     	ldr	x0, [x8, #0x68]
 45773bc: 910803e1     	add	x1, sp, #0x200
 45773c0: 97ee1f43     	bl	0x40ff0cc <_ChromeMain+0x40f9e30>
 45773c4: aa0003e6     	mov	x6, x0
 45773c8: f00515a3     	adrp	x3, 0xe82e000 <dyld_stub_binder+0xe82e000>
 45773cc: 912ba063     	add	x3, x3, #0xae8
 45773d0: 17fffcb7     	b	0x45766ac <_ChromeMain+0x4571410>
 45773d4: f94103e1     	ldr	x1, [sp, #0x200]
 45773d8: f94107e2     	ldr	x2, [sp, #0x208]
 45773dc: 910102a0     	add	x0, x21, #0x40
 45773e0: 96ea838e     	bl	0x18218 <_ChromeMain+0x12f7c>
 45773e4: 17fffff2     	b	0x45773ac <_ChromeMain+0x4572110>
