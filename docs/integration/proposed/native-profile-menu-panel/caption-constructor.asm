
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4578c40: d101c3ff     	sub	sp, sp, #0x70
 4578c44: a90457f6     	stp	x22, x21, [sp, #0x40]
 4578c48: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4578c4c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4578c50: 910183fd     	add	x29, sp, #0x60
 4578c54: aa0003f3     	mov	x19, x0
 4578c58: 3dc00020     	ldr	q0, [x1]
 4578c5c: 3d8003e0     	str	q0, [sp]
 4578c60: f9400828     	ldr	x8, [x1, #0x10]
 4578c64: f9000be8     	str	x8, [sp, #0x10]
 4578c68: a900fc3f     	stp	xzr, xzr, [x1, #0x8]
 4578c6c: f900003f     	str	xzr, [x1]
 4578c70: d0054c88     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4578c74: 91120108     	add	x8, x8, #0x480
 4578c78: f8bfc100     	ldapr	x0, [x8]
 4578c7c: b4000ae0     	cbz	x0, 0x4578dd8 <_ChromeMain+0x4573b3c>
 4578c80: 52808c01     	mov	w1, #0x460              ; =1120
 4578c84: d2800002     	mov	x2, #0x0                ; =0
 4578c88: 96ecca4a     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4578c8c: aa0003f4     	mov	x20, x0
 4578c90: 39805fe8     	ldrsb	x8, [sp, #0x17]
 4578c94: 910003e9     	mov	x9, sp
 4578c98: a9402fea     	ldp	x10, x11, [sp]
 4578c9c: f100011f     	cmp	x8, #0x0
 4578ca0: 9a894141     	csel	x1, x10, x9, mi
 4578ca4: 7100011f     	cmp	w8, #0x0
 4578ca8: 9a884162     	csel	x2, x11, x8, mi
 4578cac: 528000a3     	mov	w3, #0x5                ; =5
 4578cb0: 52820004     	mov	w4, #0x1000             ; =4096
 4578cb4: 52800005     	mov	w5, #0x0                ; =0
 4578cb8: 9758470a     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 4578cbc: 52801c48     	mov	w8, #0xe2               ; =226
 4578cc0: b81d83a8     	stur	w8, [x29, #-0x28]
 4578cc4: 381dc3bf     	sturb	wzr, [x29, #-0x24]
 4578cc8: d100a3a3     	sub	x3, x29, #0x28
 4578ccc: 52800181     	mov	w1, #0xc                ; =12
 4578cd0: 52803e82     	mov	w2, #0x1f4              ; =500
 4578cd4: 52800004     	mov	w4, #0x0                ; =0
 4578cd8: 9400027a     	bl	0x45796c0 <_ChromeMain+0x4574424>
 4578cdc: 52800035     	mov	w21, #0x1               ; =1
 4578ce0: aa1403e0     	mov	x0, x20
 4578ce4: d2c00301     	mov	x1, #0x1800000000       ; =103079215104
 4578ce8: 52800022     	mov	w2, #0x1                ; =1
 4578cec: 9789635d     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4578cf0: 52800400     	mov	w0, #0x20               ; =32
 4578cf4: 96ea599d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4578cf8: aa0003e1     	mov	x1, x0
 4578cfc: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4578d00: b9000808     	str	w8, [x0, #0x8]
 4578d04: 39003015     	strb	w21, [x0, #0xc]
 4578d08: 9004eea8     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4578d0c: 91044108     	add	x8, x8, #0x110
 4578d10: f9000008     	str	x8, [x0]
 4578d14: d2c000c8     	mov	x8, #0x600000000        ; =25769803776
 4578d18: 4e080d00     	dup.2d	v0, x8
 4578d1c: 3d800400     	str	q0, [x0, #0x10]
 4578d20: f9400288     	ldr	x8, [x20]
 4578d24: f9408908     	ldr	x8, [x8, #0x110]
 4578d28: aa1403e0     	mov	x0, x20
 4578d2c: d63f0100     	blr	x8
 4578d30: d2c00088     	mov	x8, #0x400000000        ; =17179869184
 4578d34: 4e080d00     	dup.2d	v0, x8
 4578d38: 3d800be0     	str	q0, [sp, #0x20]
 4578d3c: b0052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4578d40: 91122021     	add	x1, x1, #0x488
 4578d44: 91036280     	add	x0, x20, #0xd8
 4578d48: 910083e2     	add	x2, sp, #0x20
 4578d4c: 9755d445     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4578d50: f9416680     	ldr	x0, [x20, #0x2c8]
 4578d54: b4000280     	cbz	x0, 0x4578da4 <_ChromeMain+0x4573b08>
 4578d58: 52800ba1     	mov	w1, #0x5d               ; =93
 4578d5c: 974455e1     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 4578d60: 3945a688     	ldrb	w8, [x20, #0x169]
 4578d64: 350003e8     	cbnz	w8, 0x4578de0 <_ChromeMain+0x4573b44>
 4578d68: f940ce62     	ldr	x2, [x19, #0x198]
 4578d6c: aa1303e0     	mov	x0, x19
 4578d70: aa1403e1     	mov	x1, x20
 4578d74: 970801a2     	bl	0x7793fc <_ChromeMain+0x774160>
