
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
