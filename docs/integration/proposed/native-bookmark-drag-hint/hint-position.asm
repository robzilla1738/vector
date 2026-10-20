
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4650ec0: d10483ff     	sub	sp, sp, #0x120
 4650ec4: 6d0d23e9     	stp	d9, d8, [sp, #0xd0]
 4650ec8: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 4650ecc: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 4650ed0: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4650ed4: a9117bfd     	stp	x29, x30, [sp, #0x110]
 4650ed8: 910443fd     	add	x29, sp, #0x110
 4650edc: aa0203f4     	mov	x20, x2
 4650ee0: aa0103f5     	mov	x21, x1
 4650ee4: aa0003f3     	mov	x19, x0
 4650ee8: 97ff8c6a     	bl	0x4634090 <_ChromeMain+0x462edf4>
 4650eec: f9436e68     	ldr	x8, [x19, #0x6d8]
 4650ef0: b4000fc8     	cbz	x8, 0x46510e8 <_ChromeMain+0x464be4c>
 4650ef4: f9437260     	ldr	x0, [x19, #0x6e0]
 4650ef8: b4000f80     	cbz	x0, 0x46510e8 <_ChromeMain+0x464be4c>
 4650efc: f941ac0b     	ldr	x11, [x0, #0x358]
 4650f00: 3980bd69     	ldrsb	x9, [x11, #0x2f]
 4650f04: b7f80249     	tbnz	x9, #0x3f, 0x4650f4c <_ChromeMain+0x464bcb0>
 4650f08: 9100616a     	add	x10, x11, #0x18
 4650f0c: 39805ea2     	ldrsb	x2, [x21, #0x17]
 4650f10: b7f801a2     	tbnz	x2, #0x3f, 0x4650f44 <_ChromeMain+0x464bca8>
 4650f14: aa1503eb     	mov	x11, x21
 4650f18: aa0203ec     	mov	x12, x2
 4650f1c: eb0c013f     	cmp	x9, x12
 4650f20: 540001a1     	b.ne	0x4650f54 <_ChromeMain+0x464bcb8>
 4650f24: b4000269     	cbz	x9, 0x4650f70 <_ChromeMain+0x464bcd4>
 4650f28: 7840254c     	ldrh	w12, [x10], #0x2
 4650f2c: 7840256d     	ldrh	w13, [x11], #0x2
 4650f30: 6b0c01bf     	cmp	w13, w12
 4650f34: 54000101     	b.ne	0x4650f54 <_ChromeMain+0x464bcb8>
 4650f38: f1000529     	subs	x9, x9, #0x1
 4650f3c: 54ffff61     	b.ne	0x4650f28 <_ChromeMain+0x464bc8c>
 4650f40: 1400000c     	b	0x4650f70 <_ChromeMain+0x464bcd4>
 4650f44: a94032ab     	ldp	x11, x12, [x21]
 4650f48: 17fffff5     	b	0x4650f1c <_ChromeMain+0x464bc80>
 4650f4c: a941a56a     	ldp	x10, x9, [x11, #0x18]
 4650f50: 17ffffef     	b	0x4650f0c <_ChromeMain+0x464bc70>
 4650f54: 36f80042     	tbz	w2, #0x1f, 0x4650f5c <_ChromeMain+0x464bcc0>
 4650f58: a9400ab5     	ldp	x21, x2, [x21]
 4650f5c: f9400008     	ldr	x8, [x0]
 4650f60: f941f108     	ldr	x8, [x8, #0x3e0]
 4650f64: aa1503e1     	mov	x1, x21
 4650f68: d63f0100     	blr	x8
 4650f6c: f9436e68     	ldr	x8, [x19, #0x6d8]
 4650f70: f940c900     	ldr	x0, [x8, #0x190]
 4650f74: 977d6ba5     	bl	0x25abe08 <_ChromeMain+0x25a6b6c>
 4650f78: b4000b80     	cbz	x0, 0x46510e8 <_ChromeMain+0x464be4c>
 4650f7c: b00484a1     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4650f80: 9103d021     	add	x1, x1, #0xf4
 4650f84: 9706133f     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4650f88: aa0003f5     	mov	x21, x0
 4650f8c: 90054608     	adrp	x8, 0xef10000 <dyld_stub_binder+0xef10000>
 4650f90: f942f500     	ldr	x0, [x8, #0x5e8]
 4650f94: b4000aa0     	cbz	x0, 0x46510e8 <_ChromeMain+0x464be4c>
 4650f98: f9400008     	ldr	x8, [x0]
 4650f9c: f9402d09     	ldr	x9, [x8, #0x58]
 4650fa0: 9100c3e8     	add	x8, sp, #0x30
 4650fa4: aa1403e1     	mov	x1, x20
 4650fa8: d63f0120     	blr	x9
 4650fac: d360feb6     	lsr	x22, x21, #32
 4650fb0: 4e080ea0     	dup.2d	v0, x21
 4650fb4: d004c748     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4650fb8: 3dc01101     	ldr	q1, [x8, #0x40]
 4650fbc: 6ee14400     	ushl.2d	v0, v0, v1
 4650fc0: 6d4593e8     	ldp	d8, d4, [sp, #0x58]
 4650fc4: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 4650fc8: 37f80ae8     	tbnz	w8, #0x1f, 0x4651124 <_ChromeMain+0x464be88>
 4650fcc: 0ea12803     	xtn.2s	v3, v0
 4650fd0: f9404fe0     	ldr	x0, [sp, #0x98]
 4650fd4: b40000a0     	cbz	x0, 0x4650fe8 <_ChromeMain+0x464bd4c>
 4650fd8: 12800008     	mov	w8, #-0x1               ; =-1
 4650fdc: b8e80008     	ldaddal	w8, w8, [x0]
 4650fe0: 7100051f     	cmp	w8, #0x1
 4650fe4: 54000900     	b.eq	0x4651104 <_ChromeMain+0x464be68>
 4650fe8: 29402688     	ldp	w8, w9, [x20]
 4650fec: 1100112a     	add	w10, w9, #0x4
 4650ff0: 4ea31c60     	mov.16b	v0, v3
 4650ff4: 6e0c2480     	mov.s	v0[1], v4[1]
 4650ff8: 2ea38501     	sub.2s	v1, v8, v3
 4650ffc: 0ea08500     	add.2s	v0, v8, v0
 4651000: 0e0c3c0b     	mov.s	w11, v0[1]
 4651004: 4b160129     	sub	w9, w9, w22
 4651008: 51001129     	sub	w9, w9, #0x4
 465100c: 0b16014c     	add	w12, w10, w22
 4651010: 6b0b019f     	cmp	w12, w11
 4651014: 1a8ac129     	csel	w9, w9, w10, gt
 4651018: 11001108     	add	w8, w8, #0x4
 465101c: 1e270102     	fmov	s2, w8
 4651020: 0ea48421     	add.2s	v1, v1, v4
 4651024: 2ea38400     	sub.2s	v0, v0, v3
 4651028: 6e0c2401     	mov.s	v1[1], v0[1]
 465102c: 0ea16500     	smax.2s	v0, v8, v1
 4651030: 4e0c1d22     	mov.s	v2[1], w9
 4651034: 0ea23501     	cmgt.2s	v1, v8, v2
 4651038: 0ea26c00     	smin.2s	v0, v0, v2
 465103c: 2ea11d00     	bit.8b	v0, v8, v1
 4651040: 0e0c3c14     	mov.s	w20, v0[1]
 4651044: 0ea30c01     	sqadd.2s	v1, v0, v3
 4651048: 0ea02c21     	sqsub.2s	v1, v1, v0
 465104c: 1e260015     	fmov	w21, s0
 4651050: 6f00e402     	movi.2d	v2, #0000000000000000
 4651054: 0ea26421     	smax.2s	v1, v1, v2
 4651058: 3d8007e1     	str	q1, [sp, #0x10]
 465105c: 6d0207e0     	stp	d0, d1, [sp, #0x20]
 4651060: f9436e60     	ldr	x0, [x19, #0x6d8]
 4651064: 97f6800f     	bl	0x43f10a0 <_ChromeMain+0x43ebe04>
 4651068: d360fc08     	lsr	x8, x0, #32
 465106c: 6b0002bf     	cmp	w21, w0
 4651070: 7a480280     	ccmp	w20, w8, #0x0, eq
 4651074: 3dc007e0     	ldr	q0, [sp, #0x10]
 4651078: 1e260008     	fmov	w8, s0
 465107c: d360fc29     	lsr	x9, x1, #32
 4651080: 0e0c3c0a     	mov.s	w10, v0[1]
 4651084: 7a410100     	ccmp	w8, w1, #0x0, eq
 4651088: 7a490140     	ccmp	w10, w9, #0x0, eq
 465108c: 540002a0     	b.eq	0x46510e0 <_ChromeMain+0x464be44>
 4651090: f9436e68     	ldr	x8, [x19, #0x6d8]
 4651094: f9407109     	ldr	x9, [x8, #0xe0]
 4651098: b4000249     	cbz	x9, 0x46510e0 <_ChromeMain+0x464be44>
 465109c: 19404129     	ldapurb	w9, [x9, #0x4]
 46510a0: 35000209     	cbnz	w9, 0x46510e0 <_ChromeMain+0x464be44>
 46510a4: f9407509     	ldr	x9, [x8, #0xe8]
 46510a8: b40001c9     	cbz	x9, 0x46510e0 <_ChromeMain+0x464be44>
 46510ac: f9407109     	ldr	x9, [x8, #0xe0]
 46510b0: b4000349     	cbz	x9, 0x4651118 <_ChromeMain+0x464be7c>
 46510b4: 19404129     	ldapurb	w9, [x9, #0x4]
 46510b8: 35000309     	cbnz	w9, 0x4651118 <_ChromeMain+0x464be7c>
 46510bc: f9407500     	ldr	x0, [x8, #0xe8]
 46510c0: f9402414     	ldr	x20, [x0, #0x48]
 46510c4: b40000f4     	cbz	x20, 0x46510e0 <_ChromeMain+0x464be44>
 46510c8: 910083e1     	add	x1, sp, #0x20
 46510cc: 97539e3f     	bl	0x1b389c8 <_ChromeMain+0x1b3372c>
 46510d0: a90307e0     	stp	x0, x1, [sp, #0x30]
 46510d4: 9100c3e1     	add	x1, sp, #0x30
 46510d8: aa1403e0     	mov	x0, x20
 46510dc: 97539e76     	bl	0x1b38ab4 <_ChromeMain+0x1b33818>
 46510e0: f9436e60     	ldr	x0, [x19, #0x6d8]
 46510e4: 958246c0     	bl	0xa6e2be4 <_ChromeMain+0xa6dd948>
 46510e8: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 46510ec: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 46510f0: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 46510f4: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 46510f8: 6d4d23e9     	ldp	d9, d8, [sp, #0xd0]
 46510fc: 910483ff     	add	sp, sp, #0x120
 4651100: d65f03c0     	ret
 4651104: 52803e81     	mov	w1, #0x1f4              ; =500
 4651108: ad0013e3     	stp	q3, q4, [sp]
 465110c: 96e6df6b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4651110: ad4013e3     	ldp	q3, q4, [sp]
 4651114: 17ffffb5     	b	0x4650fe8 <_ChromeMain+0x464bd4c>
 4651118: d4200000     	brk	#0
 465111c: d4400000     	hlt	#0
 4651120: d4200020     	brk	#0x1
 4651124: f9405be0     	ldr	x0, [sp, #0xb0]
 4651128: f94063e8     	ldr	x8, [sp, #0xc0]
 465112c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4651130: ad0013e0     	stp	q0, q4, [sp]
 4651134: 96e6df61     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4651138: ad4013e0     	ldp	q0, q4, [sp]
 465113c: 17ffffa4     	b	0x4650fcc <_ChromeMain+0x464bd30>
