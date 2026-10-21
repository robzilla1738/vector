
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f0e00: d10143ff     	sub	sp, sp, #0x50
 41f0e04: a90257f6     	stp	x22, x21, [sp, #0x20]
 41f0e08: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41f0e0c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41f0e10: 910103fd     	add	x29, sp, #0x40
 41f0e14: aa0103f4     	mov	x20, x1
 41f0e18: aa0003f3     	mov	x19, x0
 41f0e1c: f9431c08     	ldr	x8, [x0, #0x638]
 41f0e20: 39c0dd09     	ldrsb	w9, [x8, #0x37]
 41f0e24: 37f80449     	tbnz	w9, #0x1f, 0x41f0eac <_ChromeMain+0x41ebc10>
 41f0e28: 3cc20100     	ldur	q0, [x8, #0x20]
 41f0e2c: f8430108     	ldur	x8, [x8, #0x30]
 41f0e30: f9000be8     	str	x8, [sp, #0x10]
 41f0e34: 3d8003e0     	str	q0, [sp]
 41f0e38: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41f0e3c: 36f80408     	tbz	w8, #0x1f, 0x41f0ebc <_ChromeMain+0x41ebc20>
 41f0e40: f94007e9     	ldr	x9, [sp, #0x8]
 41f0e44: f100813f     	cmp	x9, #0x20
 41f0e48: 540003a1     	b.ne	0x41f0ebc <_ChromeMain+0x41ebc20>
 41f0e4c: 900462c8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 41f0e50: 91252508     	add	x8, x8, #0x949
 41f0e54: f94003e0     	ldr	x0, [sp]
 41f0e58: f9400be9     	ldr	x9, [sp, #0x10]
 41f0e5c: a9402c0a     	ldp	x10, x11, [x0]
 41f0e60: a940350c     	ldp	x12, x13, [x8]
 41f0e64: a9413c0e     	ldp	x14, x15, [x0, #0x10]
 41f0e68: eb0c015f     	cmp	x10, x12
 41f0e6c: a941210a     	ldp	x10, x8, [x8, #0x10]
 41f0e70: fa4d0160     	ccmp	x11, x13, #0x0, eq
 41f0e74: fa4a01c0     	ccmp	x14, x10, #0x0, eq
 41f0e78: fa4801e0     	ccmp	x15, x8, #0x0, eq
 41f0e7c: 1a9f07f5     	cset	w21, ne
 41f0e80: 9240f921     	and	x1, x9, #0x7fffffffffffffff
 41f0e84: 96f8600d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0e88: 35000255     	cbnz	w21, 0x41f0ed0 <_ChromeMain+0x41ebc34>
 41f0e8c: aa1303e0     	mov	x0, x19
 41f0e90: aa1403e1     	mov	x1, x20
 41f0e94: 972653bb     	bl	0xb85d80 <_ChromeMain+0xb80ae4>
 41f0e98: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 41f0e9c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 41f0ea0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 41f0ea4: 910143ff     	add	sp, sp, #0x50
 41f0ea8: d65f03c0     	ret
 41f0eac: a9420901     	ldp	x1, x2, [x8, #0x20]
 41f0eb0: 910003e0     	mov	x0, sp
 41f0eb4: 96f89cd9     	bl	0x18218 <_ChromeMain+0x12f7c>
 41f0eb8: 17ffffe0     	b	0x41f0e38 <_ChromeMain+0x41ebb9c>
 41f0ebc: 36f800a8     	tbz	w8, #0x1f, 0x41f0ed0 <_ChromeMain+0x41ebc34>
 41f0ec0: f94003e0     	ldr	x0, [sp]
 41f0ec4: f9400be8     	ldr	x8, [sp, #0x10]
 41f0ec8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41f0ecc: 96f85ffb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41f0ed0: f9432260     	ldr	x0, [x19, #0x640]
 41f0ed4: 95fffcd8     	bl	0xc1f0234 <_ChromeMain+0xc1eaf98>
 41f0ed8: 17fffff0     	b	0x41f0e98 <_ChromeMain+0x41ebbfc>
