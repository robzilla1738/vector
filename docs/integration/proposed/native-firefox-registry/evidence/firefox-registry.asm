
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7821194: d10683ff     	sub	sp, sp, #0x1a0
 7821198: a9146ffc     	stp	x28, x27, [sp, #0x140]
 782119c: a91567fa     	stp	x26, x25, [sp, #0x150]
 78211a0: a9165ff8     	stp	x24, x23, [sp, #0x160]
 78211a4: a91757f6     	stp	x22, x21, [sp, #0x170]
 78211a8: a9184ff4     	stp	x20, x19, [sp, #0x180]
 78211ac: a9197bfd     	stp	x29, x30, [sp, #0x190]
 78211b0: 910643fd     	add	x29, sp, #0x190
 78211b4: aa0103f3     	mov	x19, x1
 78211b8: aa0003f4     	mov	x20, x0
 78211bc: 910083f6     	add	x22, sp, #0x20
 78211c0: 6f00e400     	movi.2d	v0, #0000000000000000
 78211c4: ad0802c0     	stp	q0, q0, [x22, #0x100]
 78211c8: ad0702c0     	stp	q0, q0, [x22, #0xe0]
 78211cc: d0031380     	adrp	x0, 0xda93000 <dyld_stub_binder+0xda93000>
 78211d0: 91162c00     	add	x0, x0, #0x58b
 78211d4: d0031381     	adrp	x1, 0xda93000 <dyld_stub_binder+0xda93000>
 78211d8: 91150421     	add	x1, x1, #0x541
 78211dc: 910083e8     	add	x8, sp, #0x20
 78211e0: 52800c62     	mov	w2, #0x63               ; =99
 78211e4: 9620bea7     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 78211e8: d10243a0     	sub	x0, x29, #0x90
 78211ec: 910083e1     	add	x1, sp, #0x20
 78211f0: 52800002     	mov	w2, #0x0                ; =0
 78211f4: 9641c104     	bl	0x891604 <_ChromeMain+0x88c368>
 78211f8: a935ffbf     	stp	xzr, xzr, [x29, #-0xa8]
 78211fc: f81683bf     	stur	xzr, [x29, #-0x98]
 7821200: a9347fbf     	stp	xzr, xzr, [x29, #-0xc0]
 7821204: f81503bf     	stur	xzr, [x29, #-0xb0]
 7821208: d10303b7     	sub	x23, x29, #0xc0
 782120c: d10303a8     	sub	x8, x29, #0xc0
 7821210: d102a3a0     	sub	x0, x29, #0xa8
 7821214: 97e73ead     	bl	0x71f0cc8 <_ChromeMain+0x71eba2c>
 7821218: f85483a8     	ldur	x8, [x29, #-0xb8]
 782121c: b4000088     	cbz	x8, 0x782122c <_ChromeMain+0x781bf90>
 7821220: 8b080508     	add	x8, x8, x8, lsl #1
 7821224: d37ced18     	lsl	x24, x8, #4
 7821228: b50001d8     	cbnz	x24, 0x7821260 <_ChromeMain+0x781bfc4>
 782122c: f90013f7     	str	x23, [sp, #0x20]
 7821230: 910083e0     	add	x0, sp, #0x20
 7821234: 9400009c     	bl	0x78214a4 <_ChromeMain+0x781c208>
 7821238: d10243a0     	sub	x0, x29, #0x90
 782123c: 96493652     	bl	0xa6eb84 <_ChromeMain+0xa698e8>
 7821240: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 7821244: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 7821248: a95757f6     	ldp	x22, x21, [sp, #0x170]
 782124c: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 7821250: a95567fa     	ldp	x26, x25, [sp, #0x150]
 7821254: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 7821258: 910683ff     	add	sp, sp, #0x1a0
 782125c: d65f03c0     	ret
 7821260: f85403a8     	ldur	x8, [x29, #-0xc0]
 7821264: 910083f9     	add	x25, sp, #0x20
 7821268: 91006115     	add	x21, x8, #0x18
 782126c: 5280005a     	mov	w26, #0x2               ; =2
 7821270: 5280097b     	mov	w27, #0x4b              ; =75
 7821274: 1400003f     	b	0x7821370 <_ChromeMain+0x781c0d4>
 7821278: f90053ff     	str	xzr, [sp, #0xa0]
 782127c: 6f00e400     	movi.2d	v0, #0000000000000000
 7821280: 3d801ec0     	str	q0, [x22, #0x70]
 7821284: ad0383e0     	stp	q0, q0, [sp, #0x70]
 7821288: ad0283e0     	stp	q0, q0, [sp, #0x50]
 782128c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 7821290: 3d800be0     	str	q0, [sp, #0x20]
 7821294: 910083e0     	add	x0, sp, #0x20
 7821298: 97e7467f     	bl	0x71f2c94 <_ChromeMain+0x71ed9f8>
 782129c: 910023e8     	add	x8, sp, #0x8
 78212a0: 9102e3e0     	add	x0, sp, #0xb8
 78212a4: 97e743ca     	bl	0x71f21cc <_ChromeMain+0x71ecf30>
 78212a8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 78212ac: 36f800a8     	tbz	w8, #0x1f, 0x78212c0 <_ChromeMain+0x781c024>
 78212b0: f94013e0     	ldr	x0, [sp, #0x20]
 78212b4: f9401be8     	ldr	x8, [sp, #0x30]
 78212b8: d37ff901     	lsl	x1, x8, #1
 78212bc: 961f9eff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 78212c0: 3cc083e0     	ldur	q0, [sp, #0x8]
 78212c4: 3d800be0     	str	q0, [sp, #0x20]
 78212c8: f9400fe8     	ldr	x8, [sp, #0x18]
 78212cc: f9001be8     	str	x8, [sp, #0x30]
 78212d0: 9101c320     	add	x0, x25, #0x70
 78212d4: aa1503e1     	mov	x1, x21
 78212d8: 9642b4f1     	bl	0x8ce69c <_ChromeMain+0x8c9400>
 78212dc: b9003bfa     	str	w26, [sp, #0x38]
 78212e0: 91008320     	add	x0, x25, #0x20
 78212e4: d10062a1     	sub	x1, x21, #0x18
 78212e8: 969e95a6     	bl	0x1fc6980 <_ChromeMain+0x1fc16e4>
 78212ec: 3941bfe8     	ldrb	w8, [sp, #0x6f]
 78212f0: f94033e9     	ldr	x9, [sp, #0x60]
 78212f4: 7219011f     	tst	w8, #0x80
 78212f8: 9a881128     	csel	x8, x9, x8, ne
 78212fc: b5000088     	cbnz	x8, 0x782130c <_ChromeMain+0x781c070>
 7821300: 9100e320     	add	x0, x25, #0x38
 7821304: 9102e3e1     	add	x1, sp, #0xb8
 7821308: 969e959e     	bl	0x1fc6980 <_ChromeMain+0x1fc16e4>
 782130c: 7900e3fb     	strh	w27, [sp, #0x70]
 7821310: 91016320     	add	x0, x25, #0x58
 7821314: aa1403e1     	mov	x1, x20
 7821318: 96321dd3     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 782131c: 910083e1     	add	x1, sp, #0x20
 7821320: aa1303e0     	mov	x0, x19
 7821324: 9400008e     	bl	0x782155c <_ChromeMain+0x781c2c0>
 7821328: 910083e0     	add	x0, sp, #0x20
 782132c: 97e746bf     	bl	0x71f2e28 <_ChromeMain+0x71edb8c>
 7821330: 1400000b     	b	0x782135c <_ChromeMain+0x781c0c0>
 7821334: f85f02a8     	ldur	x8, [x21, #-0x10]
 7821338: b4000128     	cbz	x8, 0x782135c <_ChromeMain+0x781c0c0>
 782133c: b900b7ff     	str	wzr, [sp, #0xb4]
 7821340: d10062a0     	sub	x0, x21, #0x18
 7821344: 9102d3e1     	add	x1, sp, #0xb4
 7821348: 9102e3e2     	add	x2, sp, #0xb8
 782134c: 97e74062     	bl	0x71f14d4 <_ChromeMain+0x71ec238>
 7821350: b940b7e8     	ldr	w8, [sp, #0xb4]
 7821354: 7100c11f     	cmp	w8, #0x30
 7821358: 54fff90a     	b.ge	0x7821278 <_ChromeMain+0x781bfdc>
 782135c: 9102e3e0     	add	x0, sp, #0xb8
 7821360: 96e931f1     	bl	0x326db24 <_ChromeMain+0x3268888>
 7821364: 9100c2b5     	add	x21, x21, #0x30
 7821368: f100c318     	subs	x24, x24, #0x30
 782136c: 54fff600     	b.eq	0x782122c <_ChromeMain+0x781bf90>
 7821370: a90bffff     	stp	xzr, xzr, [sp, #0xb8]
 7821374: f90067ff     	str	xzr, [sp, #0xc8]
 7821378: 9102e3e0     	add	x0, sp, #0xb8
 782137c: 96728a21     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 7821380: 389ff2a8     	ldursb	x8, [x21, #-0x1]
 7821384: b7fffd88     	tbnz	x8, #0x3f, 0x7821334 <_ChromeMain+0x781c098>
 7821388: 17ffffec     	b	0x7821338 <_ChromeMain+0x781c09c>
