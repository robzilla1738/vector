
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4251eb0: d503201f     	nop
 4251eb4: a901a408     	stp	x8, x9, [x0, #0x18]
 4251eb8: 9100c3e0     	add	x0, sp, #0x30
 4251ebc: 52800001     	mov	w1, #0x0                ; =0
 4251ec0: 52800003     	mov	w3, #0x0                ; =0
 4251ec4: 94e1e306     	bl	0x7acaadc <_ChromeMain+0x7ac5840>
 4251ec8: f9400a73     	ldr	x19, [x19, #0x10]
 4251ecc: b4fffb93     	cbz	x19, 0x4251e3c <_ChromeMain+0x424cba0>
 4251ed0: 14000017     	b	0x4251f2c <_ChromeMain+0x424cc90>
 4251ed4: f9000bf3     	str	x19, [sp, #0x10]
 4251ed8: f94013e0     	ldr	x0, [sp, #0x20]
 4251edc: 9510688c     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4251ee0: aa0003f4     	mov	x20, x0
 4251ee4: aa1303e0     	mov	x0, x19
 4251ee8: aa1403e1     	mov	x1, x20
 4251eec: 95106885     	bl	0x866c100 <_ChromeMain+0x8666e64>
 4251ef0: aa1403e0     	mov	x0, x20
 4251ef4: 94f6c61a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4251ef8: f94017e8     	ldr	x8, [sp, #0x28]
 4251efc: f9000fe8     	str	x8, [sp, #0x18]
 4251f00: b004e941     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4251f04: 910de021     	add	x1, x1, #0x378
 4251f08: 910043e0     	add	x0, sp, #0x10
 4251f0c: 9100c3e3     	add	x3, sp, #0x30
 4251f10: 528000c2     	mov	w2, #0x6                ; =6
 4251f14: 940ceda7     	bl	0x458d5b0 <_ChromeMain+0x4588314>
 4251f18: f9400bf3     	ldr	x19, [sp, #0x10]
 4251f1c: f9000bff     	str	xzr, [sp, #0x10]
 4251f20: b4fff8f3     	cbz	x19, 0x4251e3c <_ChromeMain+0x424cba0>
 4251f24: 17ffffc1     	b	0x4251e28 <_ChromeMain+0x424cb8c>
 4251f28: d4200020     	brk	#0x1
 4251f2c: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251f30: 91071c21     	add	x1, x1, #0x1c7
 4251f34: 9101a3e0     	add	x0, sp, #0x68
 4251f38: 979c7fea     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251f3c: 910223e0     	add	x0, sp, #0x88
 4251f40: 9101a3e1     	add	x1, sp, #0x68
 4251f44: 9779373b     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251f48: f00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4251f4c: 91031021     	add	x1, x1, #0xc4
 4251f50: 910123e0     	add	x0, sp, #0x48
 4251f54: 979c7fe3     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251f58: d101c3a8     	sub	x8, x29, #0x70
 4251f5c: a93b7fbf     	stp	xzr, xzr, [x29, #-0x50]
 4251f60: 3cc883e0     	ldur	q0, [sp, #0x88]
 4251f64: 3c9903a0     	stur	q0, [x29, #-0x70]
 4251f68: f9404fe9     	ldr	x9, [sp, #0x98]
 4251f6c: a93a7fa9     	stp	x9, xzr, [x29, #-0x60]
 4251f70: 91006100     	add	x0, x8, #0x18
 4251f74: 910123e1     	add	x1, sp, #0x48
 4251f78: 9779372e     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251f7c: b004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4251f80: 911e5021     	add	x1, x1, #0x794
 4251f84: d101c3a3     	sub	x3, x29, #0x70
 4251f88: aa1303e0     	mov	x0, x19
 4251f8c: 52800302     	mov	w2, #0x18               ; =24
 4251f90: 52800044     	mov	w4, #0x2                ; =2
 4251f94: 949d81f0     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 4251f98: 394183e8     	ldrb	w8, [sp, #0x60]
 4251f9c: 90053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4251fa0: 9121e273     	add	x19, x19, #0x878
 4251fa4: 7103fd1f     	cmp	w8, #0xff
 4251fa8: 54000060     	b.eq	0x4251fb4 <_ChromeMain+0x424cd18>
 4251fac: 721e791f     	tst	w8, #0xfffffffd
 4251fb0: 540001a1     	b.ne	0x4251fe4 <_ChromeMain+0x424cd48>
 4251fb4: 394203e8     	ldrb	w8, [sp, #0x80]
 4251fb8: 7103fd1f     	cmp	w8, #0xff
 4251fbc: 54fff400     	b.eq	0x4251e3c <_ChromeMain+0x424cba0>
 4251fc0: 721e791f     	tst	w8, #0xfffffffd
 4251fc4: 54fff3c0     	b.eq	0x4251e3c <_ChromeMain+0x424cba0>
 4251fc8: 7100111f     	cmp	w8, #0x4
 4251fcc: 54000280     	b.eq	0x425201c <_ChromeMain+0x424cd80>
 4251fd0: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251fd4: d101c3a0     	sub	x0, x29, #0x70
 4251fd8: 9101a3e1     	add	x1, sp, #0x68
 4251fdc: d63f0100     	blr	x8
 4251fe0: 17ffff97     	b	0x4251e3c <_ChromeMain+0x424cba0>
 4251fe4: 7100111f     	cmp	w8, #0x4
 4251fe8: 540000c0     	b.eq	0x4252000 <_ChromeMain+0x424cd64>
 4251fec: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251ff0: d101c3a0     	sub	x0, x29, #0x70
 4251ff4: 910123e1     	add	x1, sp, #0x48
 4251ff8: d63f0100     	blr	x8
 4251ffc: 17ffffee     	b	0x4251fb4 <_ChromeMain+0x424cd18>
 4252000: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 4252004: 36fffd88     	tbz	w8, #0x1f, 0x4251fb4 <_ChromeMain+0x424cd18>
 4252008: f94027e0     	ldr	x0, [sp, #0x48]
 425200c: f9402fe8     	ldr	x8, [sp, #0x58]
