
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 456ee5c: d10203ff     	sub	sp, sp, #0x80
 456ee60: a90557f6     	stp	x22, x21, [sp, #0x50]
 456ee64: a9064ff4     	stp	x20, x19, [sp, #0x60]
 456ee68: a9077bfd     	stp	x29, x30, [sp, #0x70]
 456ee6c: 9101c3fd     	add	x29, sp, #0x70
 456ee70: aa0203f5     	mov	x21, x2
 456ee74: aa0103f3     	mov	x19, x1
 456ee78: aa0003f4     	mov	x20, x0
 456ee7c: f9400808     	ldr	x8, [x0, #0x10]
 456ee80: b40000a8     	cbz	x8, 0x456ee94 <_ChromeMain+0x4569bf8>
 456ee84: f9401288     	ldr	x8, [x20, #0x20]
 456ee88: b4000068     	cbz	x8, 0x456ee94 <_ChromeMain+0x4569bf8>
 456ee8c: aa1403e0     	mov	x0, x20
 456ee90: 97fffcce     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 456ee94: 91046288     	add	x8, x20, #0x118
 456ee98: eb15011f     	cmp	x8, x21
 456ee9c: 54000120     	b.eq	0x456eec0 <_ChromeMain+0x4569c24>
 456eea0: 39c4be8a     	ldrsb	w10, [x20, #0x12f]
 456eea4: 39405ea9     	ldrb	w9, [x21, #0x17]
 456eea8: 37f804ca     	tbnz	w10, #0x1f, 0x456ef40 <_ChromeMain+0x4569ca4>
 456eeac: 37380429     	tbnz	w9, #0x7, 0x456ef30 <_ChromeMain+0x4569c94>
 456eeb0: 3dc002a0     	ldr	q0, [x21]
 456eeb4: f9400aa9     	ldr	x9, [x21, #0x10]
 456eeb8: f9000909     	str	x9, [x8, #0x10]
 456eebc: 3d800100     	str	q0, [x8]
 456eec0: 6f00e400     	movi.2d	v0, #0000000000000000
 456eec4: ad0003e0     	stp	q0, q0, [sp]
 456eec8: 3d800be0     	str	q0, [sp, #0x20]
 456eecc: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 456eed0: b9000fe8     	str	w8, [sp, #0xc]
 456eed4: 52800028     	mov	w8, #0x1                ; =1
 456eed8: 390043e8     	strb	w8, [sp, #0x10]
 456eedc: 390083ff     	strb	wzr, [sp, #0x20]
 456eee0: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 456eee4: f9001bff     	str	xzr, [sp, #0x30]
 456eee8: 910003e2     	mov	x2, sp
 456eeec: aa1403e0     	mov	x0, x20
 456eef0: aa1303e1     	mov	x1, x19
 456eef4: 528000e3     	mov	w3, #0x7                ; =7
 456eef8: 97fffde2     	bl	0x456e680 <_ChromeMain+0x45693e4>
 456eefc: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 456ef00: 36f800a8     	tbz	w8, #0x1f, 0x456ef14 <_ChromeMain+0x4569c78>
 456ef04: f9401be0     	ldr	x0, [sp, #0x30]
 456ef08: f94023e8     	ldr	x8, [sp, #0x40]
 456ef0c: d37ff901     	lsl	x1, x8, #1
 456ef10: 96ea67ea     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 456ef14: 910003e0     	mov	x0, sp
 456ef18: 970b5e4a     	bl	0x846840 <_ChromeMain+0x8415a4>
 456ef1c: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 456ef20: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 456ef24: a94557f6     	ldp	x22, x21, [sp, #0x50]
 456ef28: 910203ff     	add	sp, sp, #0x80
 456ef2c: d65f03c0     	ret
 456ef30: a9400aa1     	ldp	x1, x2, [x21]
 456ef34: 91046280     	add	x0, x20, #0x118
 456ef38: 96fce6df     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 456ef3c: 17ffffe1     	b	0x456eec0 <_ChromeMain+0x4569c24>
 456ef40: 13001d28     	sxtb	w8, w9
 456ef44: 7100011f     	cmp	w8, #0x0
 456ef48: a9402aa8     	ldp	x8, x10, [x21]
 456ef4c: 9a954101     	csel	x1, x8, x21, mi
 456ef50: 9a894142     	csel	x2, x10, x9, mi
 456ef54: 91046280     	add	x0, x20, #0x118
 456ef58: 96fce72a     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 456ef5c: 17ffffd9     	b	0x456eec0 <_ChromeMain+0x4569c24>
