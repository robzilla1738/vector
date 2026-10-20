
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4250e40: d10343ff     	sub	sp, sp, #0xd0
 4250e44: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4250e48: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4250e4c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4250e50: 910303fd     	add	x29, sp, #0xc0
 4250e54: 9004eec8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4250e58: f940f908     	ldr	x8, [x8, #0x1f0]
 4250e5c: f9400108     	ldr	x8, [x8]
 4250e60: f81d83a8     	stur	x8, [x29, #-0x28]
 4250e64: f9400808     	ldr	x8, [x0, #0x10]
 4250e68: b4000bc8     	cbz	x8, 0x4250fe0 <_ChromeMain+0x424bd44>
 4250e6c: aa0003f3     	mov	x19, x0
 4250e70: f9403100     	ldr	x0, [x8, #0x60]
 4250e74: b4000660     	cbz	x0, 0x4250f40 <_ChromeMain+0x424bca4>
 4250e78: d00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4250e7c: f9467d08     	ldr	x8, [x8, #0xcf8]
 4250e80: f9414908     	ldr	x8, [x8, #0x290]
 4250e84: f9400514     	ldr	x20, [x8, #0x8]
 4250e88: 970d3d9b     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4250e8c: b40005a0     	cbz	x0, 0x4250f40 <_ChromeMain+0x424bca4>
 4250e90: f9402808     	ldr	x8, [x0, #0x50]
 4250e94: b5000068     	cbnz	x8, 0x4250ea0 <_ChromeMain+0x424bc04>
 4250e98: f9402409     	ldr	x9, [x0, #0x48]
 4250e9c: b4000529     	cbz	x9, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ea0: 52800a09     	mov	w9, #0x50               ; =80
 4250ea4: 5280090a     	mov	w10, #0x48              ; =72
 4250ea8: f100011f     	cmp	x8, #0x0
 4250eac: 9a890148     	csel	x8, x10, x9, eq
 4250eb0: f8686808     	ldr	x8, [x0, x8]
 4250eb4: f9400908     	ldr	x8, [x8, #0x10]
 4250eb8: f9400515     	ldr	x21, [x8, #0x8]
 4250ebc: b4000435     	cbz	x21, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ec0: 9100a2a8     	add	x8, x21, #0x28
 4250ec4: 3900a3ff     	strb	wzr, [sp, #0x28]
 4250ec8: 9100a3e9     	add	x9, sp, #0x28
 4250ecc: a90623e9     	stp	x9, x8, [sp, #0x60]
 4250ed0: b0fe5b02     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4250ed4: 912dc042     	add	x2, x2, #0xb70
 4250ed8: 910183e1     	add	x1, sp, #0x60
 4250edc: aa1403e0     	mov	x0, x20
 4250ee0: 52800003     	mov	w3, #0x0                ; =0
 4250ee4: 52800004     	mov	w4, #0x0                ; =0
 4250ee8: 972d8262     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4250eec: 3940a3e8     	ldrb	w8, [sp, #0x28]
 4250ef0: 34000288     	cbz	w8, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ef4: f9403ea8     	ldr	x8, [x21, #0x78]
 4250ef8: b4000248     	cbz	x8, 0x4250f40 <_ChromeMain+0x424bca4>
 4250efc: f85d83a8     	ldur	x8, [x29, #-0x28]
 4250f00: 9004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4250f04: f940f929     	ldr	x9, [x9, #0x1f0]
 4250f08: f9400129     	ldr	x9, [x9]
 4250f0c: eb08013f     	cmp	x9, x8
 4250f10: 54000b81     	b.ne	0x4251080 <_ChromeMain+0x424bde4>
 4250f14: d004e940     	adrp	x0, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4250f18: 910e5800     	add	x0, x0, #0x396
 4250f1c: 900465c2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4250f20: 91011842     	add	x2, x2, #0x46
 4250f24: 528002e1     	mov	w1, #0x17               ; =23
 4250f28: 52800523     	mov	w3, #0x29               ; =41
 4250f2c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4250f30: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4250f34: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4250f38: 910343ff     	add	sp, sp, #0xd0
 4250f3c: 140cf16c     	b	0x458d4ec <_ChromeMain+0x4588250>
 4250f40: f9400a73     	ldr	x19, [x19, #0x10]
 4250f44: f004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4250f48: 91064021     	add	x1, x1, #0x190
 4250f4c: 9100a3e0     	add	x0, sp, #0x28
 4250f50: 979c83e4     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4250f54: 910123e0     	add	x0, sp, #0x48
 4250f58: 9100a3e1     	add	x1, sp, #0x28
 4250f5c: 97793b35     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4250f60: 900465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4250f64: 91026821     	add	x1, x1, #0x9a
 4250f68: 910023e0     	add	x0, sp, #0x8
 4250f6c: 979c83dd     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4250f70: 910183e8     	add	x8, sp, #0x60
 4250f74: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4250f78: 3cc483e0     	ldur	q0, [sp, #0x48]
 4250f7c: 3d801be0     	str	q0, [sp, #0x60]
 4250f80: f9402fe9     	ldr	x9, [sp, #0x58]
 4250f84: a9077fe9     	stp	x9, xzr, [sp, #0x70]
 4250f88: 91006100     	add	x0, x8, #0x18
 4250f8c: 910023e1     	add	x1, sp, #0x8
 4250f90: 97793b28     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4250f94: d004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4250f98: 911e5021     	add	x1, x1, #0x794
 4250f9c: 910183e3     	add	x3, sp, #0x60
 4250fa0: aa1303e0     	mov	x0, x19
 4250fa4: 52800302     	mov	w2, #0x18               ; =24
 4250fa8: 52800044     	mov	w4, #0x2                ; =2
 4250fac: 949d85ea     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 4250fb0: 394083e8     	ldrb	w8, [sp, #0x20]
 4250fb4: b0053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4250fb8: 9121e273     	add	x19, x19, #0x878
 4250fbc: 7103fd1f     	cmp	w8, #0xff
 4250fc0: 54000060     	b.eq	0x4250fcc <_ChromeMain+0x424bd30>
 4250fc4: 721e791f     	tst	w8, #0xfffffffd
 4250fc8: 54000361     	b.ne	0x4251034 <_ChromeMain+0x424bd98>
 4250fcc: 394103e8     	ldrb	w8, [sp, #0x40]
 4250fd0: 7103fd1f     	cmp	w8, #0xff
 4250fd4: 54000060     	b.eq	0x4250fe0 <_ChromeMain+0x424bd44>
 4250fd8: 721e791f     	tst	w8, #0xfffffffd
 4250fdc: 54000181     	b.ne	0x425100c <_ChromeMain+0x424bd70>
 4250fe0: f85d83a8     	ldur	x8, [x29, #-0x28]
 4250fe4: 9004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4250fe8: f940f929     	ldr	x9, [x9, #0x1f0]
 4250fec: f9400129     	ldr	x9, [x9]
 4250ff0: eb08013f     	cmp	x9, x8
 4250ff4: 54000461     	b.ne	0x4251080 <_ChromeMain+0x424bde4>
 4250ff8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4250ffc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4251000: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4251004: 910343ff     	add	sp, sp, #0xd0
 4251008: d65f03c0     	ret
 425100c: 7100111f     	cmp	w8, #0x4
 4251010: 540000c0     	b.eq	0x4251028 <_ChromeMain+0x424bd8c>
 4251014: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251018: 910183e0     	add	x0, sp, #0x60
 425101c: 9100a3e1     	add	x1, sp, #0x28
 4251020: d63f0100     	blr	x8
 4251024: 17ffffef     	b	0x4250fe0 <_ChromeMain+0x424bd44>
 4251028: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 425102c: 36fffda8     	tbz	w8, #0x1f, 0x4250fe0 <_ChromeMain+0x424bd44>
 4251030: 1400000f     	b	0x425106c <_ChromeMain+0x424bdd0>
 4251034: 7100111f     	cmp	w8, #0x4
 4251038: 540000c0     	b.eq	0x4251050 <_ChromeMain+0x424bdb4>
 425103c: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251040: 910183e0     	add	x0, sp, #0x60
 4251044: 910023e1     	add	x1, sp, #0x8
 4251048: d63f0100     	blr	x8
 425104c: 17ffffe0     	b	0x4250fcc <_ChromeMain+0x424bd30>
 4251050: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4251054: 36fffbc8     	tbz	w8, #0x1f, 0x4250fcc <_ChromeMain+0x424bd30>
 4251058: f94007e0     	ldr	x0, [sp, #0x8]
 425105c: f9400fe8     	ldr	x8, [sp, #0x18]
 4251060: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251064: 96f6df95     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251068: 17ffffd9     	b	0x4250fcc <_ChromeMain+0x424bd30>
 425106c: f94017e0     	ldr	x0, [sp, #0x28]
 4251070: f9401fe8     	ldr	x8, [sp, #0x38]
 4251074: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251078: 96f6df90     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425107c: 17ffffd9     	b	0x4250fe0 <_ChromeMain+0x424bd44>
 4251080: 94f6ccb8     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
