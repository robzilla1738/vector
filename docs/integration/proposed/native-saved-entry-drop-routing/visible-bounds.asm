
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  89ef60: d10703ff     	sub	sp, sp, #0x1c0
  89ef64: 6d1723e9     	stp	d9, d8, [sp, #0x170]
  89ef68: a9185ff8     	stp	x24, x23, [sp, #0x180]
  89ef6c: a91957f6     	stp	x22, x21, [sp, #0x190]
  89ef70: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
  89ef74: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
  89ef78: 9106c3fd     	add	x29, sp, #0x1b0
  89ef7c: aa0003f3     	mov	x19, x0
  89ef80: f9400008     	ldr	x8, [x0]
  89ef84: f9405508     	ldr	x8, [x8, #0xa8]
  89ef88: d63f0100     	blr	x8
  89ef8c: 340015a0     	cbz	w0, 0x89f240 <_ChromeMain+0x899fa4>
  89ef90: f940e268     	ldr	x8, [x19, #0x1c0]
  89ef94: a93b23bf     	stp	xzr, x8, [x29, #-0x50]
  89ef98: a93a7fbf     	stp	xzr, xzr, [x29, #-0x60]
  89ef9c: 6f00e400     	movi.2d	v0, #0000000000000000
  89efa0: f900a3ff     	str	xzr, [sp, #0x140]
  89efa4: ad0903e0     	stp	q0, q0, [sp, #0x120]
  89efa8: ad0803e0     	stp	q0, q0, [sp, #0x100]
  89efac: ad0703e0     	stp	q0, q0, [sp, #0xe0]
  89efb0: ad0603e0     	stp	q0, q0, [sp, #0xc0]
  89efb4: 0f03f600     	fmov.2s	v0, #1.00000000
  89efb8: d360fd09     	lsr	x9, x8, #32
  89efbc: fd0067e0     	str	d0, [sp, #0xc8]
  89efc0: b4001093     	cbz	x19, 0x89f1d0 <_ChromeMain+0x899f34>
  89efc4: 34001068     	cbz	w8, 0x89f1d0 <_ChromeMain+0x899f34>
  89efc8: b4001049     	cbz	x9, 0x89f1d0 <_ChromeMain+0x899f34>
  89efcc: 9006b4e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
  89efd0: 3dc1b500     	ldr	q0, [x8, #0x6d0]
  89efd4: 3d800be0     	str	q0, [sp, #0x20]
  89efd8: 9100c3f4     	add	x20, sp, #0x30
  89efdc: 0f03f608     	fmov.2s	v8, #1.00000000
  89efe0: 90073395     	adrp	x21, 0xef0e000 <dyld_stub_binder+0xef0e000>
  89efe4: 900656d6     	adrp	x22, 0xd376000 <dyld_stub_binder+0xd376000>
  89efe8: 912942d6     	add	x22, x22, #0xa50
  89efec: 1400001a     	b	0x89f054 <_ChromeMain+0x899db8>
  89eff0: 6e0c0420     	mov.s	v0[1], v1[0]
  89eff4: 6d438be1     	ldp	d1, d2, [sp, #0x38]
  89eff8: 2e20dc20     	fmul.2s	v0, v1, v0
  89effc: 0e22d400     	fadd.2s	v0, v0, v2
  89f000: fd0023e0     	str	d0, [sp, #0x40]
  89f004: 910303e0     	add	x0, sp, #0xc0
  89f008: 9100c3e1     	add	x1, sp, #0x30
  89f00c: 940000ed     	bl	0x89f3c0 <_ChromeMain+0x89a124>
  89f010: d10143a1     	sub	x1, x29, #0x50
  89f014: aa1303e0     	mov	x0, x19
  89f018: 9400018f     	bl	0x89f654 <_ChromeMain+0x89a3b8>
  89f01c: a93b07a0     	stp	x0, x1, [x29, #-0x50]
  89f020: f940c677     	ldr	x23, [x19, #0x188]
  89f024: b4000cb7     	cbz	x23, 0x89f1b8 <_ChromeMain+0x899f1c>
  89f028: fd40e2e0     	ldr	d0, [x23, #0x1c0]
  89f02c: 6f00e401     	movi.2d	v1, #0000000000000000
  89f030: 0ea16400     	smax.2s	v0, v0, v1
  89f034: 6d3a03a1     	stp	d1, d0, [x29, #-0x60]
  89f038: d10143a0     	sub	x0, x29, #0x50
  89f03c: d10183a1     	sub	x1, x29, #0x60
  89f040: 97fcc790     	bl	0x7d0e80 <_ChromeMain+0x7cbbe4>
  89f044: 297727a8     	ldp	w8, w9, [x29, #-0x48]
  89f048: 34000c48     	cbz	w8, 0x89f1d0 <_ChromeMain+0x899f34>
  89f04c: aa1703f3     	mov	x19, x23
  89f050: 34000c09     	cbz	w9, 0x89f1d0 <_ChromeMain+0x899f34>
  89f054: f9401260     	ldr	x0, [x19, #0x20]
  89f058: b50006a0     	cbnz	x0, 0x89f12c <_ChromeMain+0x899e90>
  89f05c: 3900c3ff     	strb	wzr, [sp, #0x30]
  89f060: 3dc00be0     	ldr	q0, [sp, #0x20]
  89f064: 3c8383e0     	stur	q0, [sp, #0x38]
  89f068: 910303e0     	add	x0, sp, #0xc0
  89f06c: 9100c3e1     	add	x1, sp, #0x30
  89f070: 940000d4     	bl	0x89f3c0 <_ChromeMain+0x89a124>
  89f074: f9005bff     	str	xzr, [sp, #0xb0]
  89f078: 6f00e400     	movi.2d	v0, #0000000000000000
  89f07c: ad0483e0     	stp	q0, q0, [sp, #0x90]
  89f080: ad0383e0     	stp	q0, q0, [sp, #0x70]
  89f084: ad0283e0     	stp	q0, q0, [sp, #0x50]
  89f088: ad0183e0     	stp	q0, q0, [sp, #0x30]
  89f08c: fd001fe8     	str	d8, [sp, #0x38]
  89f090: f940c677     	ldr	x23, [x19, #0x188]
  89f094: b40000f7     	cbz	x23, 0x89f0b0 <_ChromeMain+0x899e14>
  89f098: b947aaa0     	ldr	w0, [x21, #0x7a8]
  89f09c: 340010c0     	cbz	w0, 0x89f2b4 <_ChromeMain+0x89a018>
  89f0a0: 39490ee8     	ldrb	w8, [x23, #0x243]
  89f0a4: 35001588     	cbnz	w8, 0x89f354 <_ChromeMain+0x89a0b8>
  89f0a8: 7100041f     	cmp	w0, #0x1
  89f0ac: 54001580     	b.eq	0x89f35c <_ChromeMain+0x89a0c0>
  89f0b0: b941ba68     	ldr	w8, [x19, #0x1b8]
  89f0b4: 1e220100     	scvtf	s0, w8
  89f0b8: bd41be61     	ldr	s1, [x19, #0x1bc]
  89f0bc: 5e21d821     	scvtf	s1, s1
  89f0c0: 3940c3e8     	ldrb	w8, [sp, #0x30]
  89f0c4: 3607f968     	tbz	w8, #0x0, 0x89eff0 <_ChromeMain+0x899d54>
  89f0c8: 1e22c000     	fcvt	d0, s0
  89f0cc: 1e22c021     	fcvt	d1, s1
  89f0d0: fd401fe2     	ldr	d2, [sp, #0x38]
  89f0d4: 91004288     	add	x8, x20, #0x10
  89f0d8: 4d408502     	ld1.d	{ v2 }[1], [x8]
  89f0dc: 3cc483e3     	ldur	q3, [sp, #0x48]
  89f0e0: 4fc09042     	fmul.2d	v2, v2, v0[0]
  89f0e4: 4fc09060     	fmul.2d	v0, v3, v0[0]
  89f0e8: fd402fe3     	ldr	d3, [sp, #0x58]
  89f0ec: 9100c288     	add	x8, x20, #0x30
  89f0f0: 4d408503     	ld1.d	{ v3 }[1], [x8]
  89f0f4: 3cc683e4     	ldur	q4, [sp, #0x68]
  89f0f8: 4fc19063     	fmul.2d	v3, v3, v1[0]
  89f0fc: 4fc19081     	fmul.2d	v1, v4, v1[0]
  89f100: 4e63d442     	fadd.2d	v2, v2, v3
  89f104: fd404fe3     	ldr	d3, [sp, #0x98]
  89f108: 9101c288     	add	x8, x20, #0x70
  89f10c: 4d408503     	ld1.d	{ v3 }[1], [x8]
  89f110: 4e61d400     	fadd.2d	v0, v0, v1
  89f114: 3cca83e1     	ldur	q1, [sp, #0xa8]
  89f118: 4e63d442     	fadd.2d	v2, v2, v3
  89f11c: 4e61d400     	fadd.2d	v0, v0, v1
  89f120: 3c8983e2     	stur	q2, [sp, #0x98]
  89f124: 3c8a83e0     	stur	q0, [sp, #0xa8]
  89f128: 17ffffb7     	b	0x89f004 <_ChromeMain+0x899d68>
  89f12c: f940b408     	ldr	x8, [x0, #0x168]
  89f130: f9401108     	ldr	x8, [x8, #0x20]
  89f134: 9100c109     	add	x9, x8, #0x30
  89f138: f100011f     	cmp	x8, #0x0
  89f13c: 9a8902c8     	csel	x8, x22, x9, eq
  89f140: ad430500     	ldp	q0, q1, [x8, #0x60]
  89f144: ad420903     	ldp	q3, q2, [x8, #0x40]
  89f148: ad0487e0     	stp	q0, q1, [sp, #0x90]
  89f14c: ad038be3     	stp	q3, q2, [sp, #0x70]
  89f150: f9404109     	ldr	x9, [x8, #0x80]
  89f154: f9005be9     	str	x9, [sp, #0xb0]
  89f158: ad400500     	ldp	q0, q1, [x8]
  89f15c: ad410d02     	ldp	q2, q3, [x8, #0x20]
  89f160: ad028fe2     	stp	q2, q3, [sp, #0x50]
  89f164: ad0187e0     	stp	q0, q1, [sp, #0x30]
  89f168: 942e2363     	bl	0x1427ef4 <_ChromeMain+0x1422c58>
  89f16c: b947aaa0     	ldr	w0, [x21, #0x7a8]
  89f170: 34000b40     	cbz	w0, 0x89f2d8 <_ChromeMain+0x89a03c>
  89f174: 7100041f     	cmp	w0, #0x1
  89f178: 1a9f17e8     	cset	w8, eq
  89f17c: 39490e69     	ldrb	w9, [x19, #0x243]
  89f180: 35000fe9     	cbnz	w9, 0x89f37c <_ChromeMain+0x89a0e0>
  89f184: 1e214002     	fneg	s2, s0
  89f188: 7200011f     	tst	w8, #0x1
  89f18c: 1e221c00     	fcsel	s0, s0, s2, ne
  89f190: 3940c3e8     	ldrb	w8, [sp, #0x30]
  89f194: 370005c8     	tbnz	w8, #0x0, 0x89f24c <_ChromeMain+0x899fb0>
  89f198: 6d438be3     	ldp	d3, d2, [sp, #0x38]
  89f19c: 6e0c0420     	mov.s	v0[1], v1[0]
  89f1a0: 2e23dc00     	fmul.2s	v0, v0, v3
  89f1a4: 0e20d441     	fadd.2s	v1, v2, v0
  89f1a8: 0ea0d440     	fsub.2s	v0, v2, v0
  89f1ac: 6e0c2401     	mov.s	v1[1], v0[1]
  89f1b0: fd0023e1     	str	d1, [sp, #0x40]
  89f1b4: 17ffffad     	b	0x89f068 <_ChromeMain+0x899dcc>
  89f1b8: f9400268     	ldr	x8, [x19]
  89f1bc: f9403108     	ldr	x8, [x8, #0x60]
  89f1c0: aa1303e0     	mov	x0, x19
  89f1c4: d63f0100     	blr	x8
  89f1c8: b4000de0     	cbz	x0, 0x89f384 <_ChromeMain+0x89a0e8>
  89f1cc: 297727a8     	ldp	w8, w9, [x29, #-0x48]
  89f1d0: 34000348     	cbz	w8, 0x89f238 <_ChromeMain+0x899f9c>
  89f1d4: 34000329     	cbz	w9, 0x89f238 <_ChromeMain+0x899f9c>
  89f1d8: 9100c3f3     	add	x19, sp, #0x30
  89f1dc: d10143b4     	sub	x20, x29, #0x50
  89f1e0: 9100c3e8     	add	x8, sp, #0x30
  89f1e4: 910303e0     	add	x0, sp, #0xc0
  89f1e8: d10143a1     	sub	x1, x29, #0x50
  89f1ec: 940001c9     	bl	0x89f910 <_ChromeMain+0x89a674>
  89f1f0: 394103e8     	ldrb	w8, [sp, #0x40]
  89f1f4: 91002269     	add	x9, x19, #0x8
  89f1f8: 9100228a     	add	x10, x20, #0x8
  89f1fc: 7200011f     	tst	w8, #0x1
  89f200: 9a8a1128     	csel	x8, x9, x10, ne
  89f204: f9400101     	ldr	x1, [x8]
  89f208: 9a941268     	csel	x8, x19, x20, ne
  89f20c: f9400108     	ldr	x8, [x8]
  89f210: 92607d09     	and	x9, x8, #0xffffffff00000000
  89f214: 2a0803e8     	mov	w8, w8
  89f218: aa080120     	orr	x0, x9, x8
  89f21c: a95b7bfd     	ldp	x29, x30, [sp, #0x1b0]
  89f220: a95a4ff4     	ldp	x20, x19, [sp, #0x1a0]
  89f224: a95957f6     	ldp	x22, x21, [sp, #0x190]
  89f228: a9585ff8     	ldp	x24, x23, [sp, #0x180]
  89f22c: 6d5723e9     	ldp	d9, d8, [sp, #0x170]
  89f230: 910703ff     	add	sp, sp, #0x1c0
  89f234: d65f03c0     	ret
  89f238: a97b07a8     	ldp	x8, x1, [x29, #-0x50]
  89f23c: 17fffff5     	b	0x89f210 <_ChromeMain+0x899f74>
  89f240: d2800001     	mov	x1, #0x0                ; =0
  89f244: d2800000     	mov	x0, #0x0                ; =0
  89f248: 17fffff5     	b	0x89f21c <_ChromeMain+0x899f80>
