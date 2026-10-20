
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4557cb4: b4000560     	cbz	x0, 0x4557d60 <_ChromeMain+0x4552ac4>
 4557cb8: d102c3ff     	sub	sp, sp, #0xb0
 4557cbc: a90857f6     	stp	x22, x21, [sp, #0x80]
 4557cc0: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4557cc4: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4557cc8: 910283fd     	add	x29, sp, #0xa0
 4557ccc: aa0103f5     	mov	x21, x1
 4557cd0: 39406028     	ldrb	w8, [x1, #0x18]
 4557cd4: 360003e8     	tbz	w8, #0x0, 0x4557d50 <_ChromeMain+0x4552ab4>
 4557cd8: aa0003f3     	mov	x19, x0
 4557cdc: 52801000     	mov	w0, #0x80               ; =128
 4557ce0: 96eadda2     	bl	0xf368 <_ChromeMain+0xa0cc>
 4557ce4: aa0003f4     	mov	x20, x0
 4557ce8: 910023f6     	add	x22, sp, #0x8
 4557cec: 910023e0     	add	x0, sp, #0x8
 4557cf0: aa1503e1     	mov	x1, x21
 4557cf4: 96ef88a8     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4557cf8: f004fd08     	adrp	x8, 0xe4fa000 <dyld_stub_binder+0xe4fa000>
 4557cfc: 91302108     	add	x8, x8, #0xc08
 4557d00: aa1403e0     	mov	x0, x20
 4557d04: f8008408     	str	x8, [x0], #0x8
 4557d08: 910023e1     	add	x1, sp, #0x8
 4557d0c: 96f20c4e     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 4557d10: 9101c2c0     	add	x0, x22, #0x70
 4557d14: d2800001     	mov	x1, #0x0                ; =0
 4557d18: 96eb3fe8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4557d1c: 910082c0     	add	x0, x22, #0x20
 4557d20: 96eb3fd6     	bl	0x27c78 <_ChromeMain+0x229dc>
 4557d24: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4557d28: 36f800a8     	tbz	w8, #0x1f, 0x4557d3c <_ChromeMain+0x4552aa0>
 4557d2c: f94007e0     	ldr	x0, [sp, #0x8]
 4557d30: f9400fe8     	ldr	x8, [sp, #0x18]
 4557d34: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4557d38: 96eac460     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557d3c: b0052be1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4557d40: 9126c021     	add	x1, x1, #0x9b0
 4557d44: 91002260     	add	x0, x19, #0x8
 4557d48: aa1403e2     	mov	x2, x20
 4557d4c: 97283fed     	bl	0xf67d00 <_ChromeMain+0xf62a64>
 4557d50: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4557d54: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4557d58: a94857f6     	ldp	x22, x21, [sp, #0x80]
 4557d5c: 9102c3ff     	add	sp, sp, #0xb0
 4557d60: d65f03c0     	ret
