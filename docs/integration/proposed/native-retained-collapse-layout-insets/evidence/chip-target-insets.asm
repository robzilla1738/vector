
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2394f60: d10403ff     	sub	sp, sp, #0x100
 2394f64: 6d082beb     	stp	d11, d10, [sp, #0x80]
 2394f68: 6d0923e9     	stp	d9, d8, [sp, #0x90]
 2394f6c: a90a6ffc     	stp	x28, x27, [sp, #0xa0]
 2394f70: a90b67fa     	stp	x26, x25, [sp, #0xb0]
 2394f74: a90c5ff8     	stp	x24, x23, [sp, #0xc0]
 2394f78: a90d57f6     	stp	x22, x21, [sp, #0xd0]
 2394f7c: a90e4ff4     	stp	x20, x19, [sp, #0xe0]
 2394f80: a90f7bfd     	stp	x29, x30, [sp, #0xf0]
 2394f84: 9103c3fd     	add	x29, sp, #0xf0
 2394f88: aa0003f3     	mov	x19, x0
 2394f8c: 528000c0     	mov	w0, #0x6                ; =6
 2394f90: 977612fc     	bl	0x119b80 <_ChromeMain+0x1148e4>
 2394f94: aa1303f7     	mov	x23, x19
 2394f98: f84e8ee8     	ldr	x8, [x23, #0xe8]!
 2394f9c: 911692f6     	add	x22, x23, #0x5a4
 2394fa0: 911642f5     	add	x21, x23, #0x590
 2394fa4: a90703e1     	stp	x1, x0, [sp, #0x70]
 2394fa8: 395682e9     	ldrb	w9, [x23, #0x5a0]
 2394fac: 7100013f     	cmp	w9, #0x0
 2394fb0: 9101e3f9     	add	x25, sp, #0x78
 2394fb4: 9a9912a9     	csel	x9, x21, x25, ne
 2394fb8: 911662fa     	add	x26, x23, #0x598
 2394fbc: 9101c3fb     	add	x27, sp, #0x70
 2394fc0: 9a9b134a     	csel	x10, x26, x27, ne
 2394fc4: 4d40cd20     	ld1r.2d	{ v0 }, [x9]
 2394fc8: d005dd29     	adrp	x9, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 2394fcc: 3dc01121     	ldr	q1, [x9, #0x40]
 2394fd0: 6ee14400     	ushl.2d	v0, v0, v1
 2394fd4: 0ea12800     	xtn.2s	v0, v0
 2394fd8: 6d400ec2     	ldp	d2, d3, [x22]
 2394fdc: 0ea20c02     	sqadd.2s	v2, v0, v2
 2394fe0: 4d40cd40     	ld1r.2d	{ v0 }, [x10]
 2394fe4: 6ee14400     	ushl.2d	v0, v0, v1
 2394fe8: 0ea12800     	xtn.2s	v0, v0
 2394fec: 0ea30c00     	sqadd.2s	v0, v0, v3
 2394ff0: 0ea00c40     	sqadd.2s	v0, v2, v0
 2394ff4: 3d8013e2     	str	q2, [sp, #0x40]
 2394ff8: 0ea22c00     	sqsub.2s	v0, v0, v2
 2394ffc: 3d8003e0     	str	q0, [sp]
 2395000: 90063398     	adrp	x24, 0xea05000 <dyld_stub_binder+0xea05000>
 2395004: 9112a318     	add	x24, x24, #0x4a8
 2395008: b40001c8     	cbz	x8, 0x2395040 <_ChromeMain+0x238fda4>
 239500c: f9401109     	ldr	x9, [x8, #0x20]
 2395010: eb18013f     	cmp	x9, x24
 2395014: 540000a8     	b.hi	0x2395028 <_ChromeMain+0x238fd8c>
 2395018: 540000e2     	b.hs	0x2395034 <_ChromeMain+0x238fd98>
 239501c: f9400508     	ldr	x8, [x8, #0x8]
 2395020: b5ffff68     	cbnz	x8, 0x239500c <_ChromeMain+0x238fd70>
 2395024: 14000007     	b	0x2395040 <_ChromeMain+0x238fda4>
 2395028: f9400108     	ldr	x8, [x8]
 239502c: b5ffff08     	cbnz	x8, 0x239500c <_ChromeMain+0x238fd70>
 2395030: 14000004     	b	0x2395040 <_ChromeMain+0x238fda4>
 2395034: eb17011f     	cmp	x8, x23
 2395038: 540040a0     	b.eq	0x239584c <_ChromeMain+0x23905b0>
 239503c: f9401908     	ldr	x8, [x8, #0x30]
 2395040: 91003109     	add	x9, x8, #0xc
 2395044: fd400100     	ldr	d0, [x8]
 2395048: fc404108     	ldur	d8, [x8, #0x4]
 239504c: 3d800fe0     	str	q0, [sp, #0x30]
 2395050: 0d409120     	ld1.s	{ v0 }[1], [x9]
 2395054: 3d800be0     	str	q0, [sp, #0x20]
