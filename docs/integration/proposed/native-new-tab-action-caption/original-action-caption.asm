
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3785cd0: d2800161     	mov	x1, #0xb                ; =11
 3785cd4: f2c00021     	movk	x1, #0x1, lsl #32
 3785cd8: 97967ce5     	bl	0x1d2506c <_ChromeMain+0x1d1fdd0>
 3785cdc: f946f740     	ldr	x0, [x26, #0xde8]
 3785ce0: b4012900     	cbz	x0, 0x3788200 <_ChromeMain+0x3782f64>
 3785ce4: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 3785ce8: f9000b9f     	str	xzr, [x28, #0x10]
 3785cec: 910223e8     	add	x8, sp, #0x88
 3785cf0: 528022a1     	mov	w1, #0x115              ; =277
 3785cf4: 976cba7a     	bl	0x12b46dc <_ChromeMain+0x12af440>
 3785cf8: 3cc883e0     	ldur	q0, [sp, #0x88]
 3785cfc: 3c828380     	stur	q0, [x28, #0x28]
 3785d00: f9400b88     	ldr	x8, [x28, #0x10]
 3785d04: f9001f88     	str	x8, [x28, #0x38]
 3785d08: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 3785d0c: f9000b9f     	str	xzr, [x28, #0x10]
 3785d10: d102a3b9     	sub	x25, x29, #0xa8
 3785d14: d102a3a8     	sub	x8, x29, #0xa8
 3785d18: 9102c3e0     	add	x0, sp, #0xb0
 3785d1c: 97967e21     	bl	0x1d255a0 <_ChromeMain+0x1d20304>
 3785d20: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 3785d24: 36f800a8     	tbz	w8, #0x1f, 0x3785d38 <_ChromeMain+0x3780a9c>
 3785d28: f9401780     	ldr	x0, [x28, #0x28]
 3785d2c: f9401f88     	ldr	x8, [x28, #0x38]
 3785d30: d37ff901     	lsl	x1, x8, #1
 3785d34: 97220c61     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3785d38: 3896f3a8     	ldursb	x8, [x29, #-0x91]
 3785d3c: a9452b89     	ldp	x9, x10, [x28, #0x50]
 3785d40: f100011f     	cmp	x8, #0x0
 3785d44: 9a994121     	csel	x1, x9, x25, mi
 3785d48: 7100011f     	cmp	w8, #0x0
 3785d4c: 9a884142     	csel	x2, x10, x8, mi
 3785d50: f9403780     	ldr	x0, [x28, #0x68]
 3785d54: 97967dad     	bl	0x1d25408 <_ChromeMain+0x1d2016c>
 3785d58: f946f740     	ldr	x0, [x26, #0xde8]
 3785d5c: b4012580     	cbz	x0, 0x378820c <_ChromeMain+0x3782f70>
 3785d60: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 3785d64: f90037ff     	str	xzr, [sp, #0x68]
 3785d68: 910163e8     	add	x8, sp, #0x58
 3785d6c: 528022a1     	mov	w1, #0x115              ; =277
 3785d70: 976cba5b     	bl	0x12b46dc <_ChromeMain+0x12af440>
 3785d74: 3cc583e0     	ldur	q0, [sp, #0x58]
 3785d78: 3c828380     	stur	q0, [x28, #0x28]
 3785d7c: f94037e8     	ldr	x8, [sp, #0x68]
 3785d80: f9001f88     	str	x8, [x28, #0x38]
 3785d84: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 3785d88: f90037ff     	str	xzr, [sp, #0x68]
 3785d8c: 9101c3f9     	add	x25, sp, #0x70
 3785d90: 9101c3e8     	add	x8, sp, #0x70
 3785d94: 9102c3e0     	add	x0, sp, #0xb0
 3785d98: 97967e02     	bl	0x1d255a0 <_ChromeMain+0x1d20304>
 3785d9c: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 3785da0: 36f800a8     	tbz	w8, #0x1f, 0x3785db4 <_ChromeMain+0x3780b18>
 3785da4: f9401780     	ldr	x0, [x28, #0x28]
 3785da8: f9401f88     	ldr	x8, [x28, #0x38]
 3785dac: d37ff901     	lsl	x1, x8, #1
 3785db0: 97220c42     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3785db4: 39821fe8     	ldrsb	x8, [sp, #0x87]
 3785db8: a9472be9     	ldp	x9, x10, [sp, #0x70]
 3785dbc: f100011f     	cmp	x8, #0x0
 3785dc0: 9a994121     	csel	x1, x9, x25, mi
 3785dc4: 7100011f     	cmp	w8, #0x0
 3785dc8: 9a884142     	csel	x2, x10, x8, mi
 3785dcc: f9403780     	ldr	x0, [x28, #0x68]
 3785dd0: 97967d28     	bl	0x1d25270 <_ChromeMain+0x1d1ffd4>
