
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458cf98: b4000800     	cbz	x0, 0x458d098 <_ChromeMain+0x4587dfc>
 458cf9c: d10103ff     	sub	sp, sp, #0x40
 458cfa0: a90157f6     	stp	x22, x21, [sp, #0x10]
 458cfa4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 458cfa8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 458cfac: 9100c3fd     	add	x29, sp, #0x30
 458cfb0: aa0103f3     	mov	x19, x1
 458cfb4: aa0003f4     	mov	x20, x0
 458cfb8: 9100a000     	add	x0, x0, #0x28
 458cfbc: 9707e627     	bl	0x786858 <_ChromeMain+0x7815bc>
 458cfc0: b40006e0     	cbz	x0, 0x458d09c <_ChromeMain+0x4587e00>
 458cfc4: f9400008     	ldr	x8, [x0]
 458cfc8: f9401109     	ldr	x9, [x8, #0x20]
 458cfcc: 910003e8     	mov	x8, sp
 458cfd0: d63f0120     	blr	x9
 458cfd4: f94003e0     	ldr	x0, [sp]
 458cfd8: 95037c4d     	bl	0x866c10c <_ChromeMain+0x8666e70>
 458cfdc: aa0003f4     	mov	x20, x0
 458cfe0: f94003f5     	ldr	x21, [sp]
 458cfe4: f90003ff     	str	xzr, [sp]
 458cfe8: b40000d5     	cbz	x21, 0x458d000 <_ChromeMain+0x4587d64>
 458cfec: aa1503e0     	mov	x0, x21
 458cff0: 95037c4a     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 458cff4: aa1503e0     	mov	x0, x21
 458cff8: 52800101     	mov	w1, #0x8                ; =8
 458cffc: 96e9efaf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d000: b4000414     	cbz	x20, 0x458d080 <_ChromeMain+0x4587de4>
 458d004: aa1403e0     	mov	x0, x20
 458d008: 94e9d9d8     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 458d00c: d2800002     	mov	x2, #0x0                ; =0
 458d010: 954c480c     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458d014: 94e9d9c9     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d018: aa0003f5     	mov	x21, x0
 458d01c: aa1303e2     	mov	x2, x19
 458d020: 954c480b     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458d024: aa1503e0     	mov	x0, x21
 458d028: 94e9d9cd     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d02c: aa1403e0     	mov	x0, x20
 458d030: 52800022     	mov	w2, #0x1                ; =1
 458d034: 954c4803     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458d038: 94e9d9c0     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d03c: aa0003f5     	mov	x21, x0
 458d040: aa1303e2     	mov	x2, x19
 458d044: 954c4802     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458d048: aa1503e0     	mov	x0, x21
 458d04c: 94e9d9c4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d050: aa1403e0     	mov	x0, x20
 458d054: 52800042     	mov	w2, #0x2                ; =2
 458d058: 954c47fa     	bl	0x989f040 <_ChromeMain+0x9899da4>
 458d05c: 94e9d9b7     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d060: aa0003f5     	mov	x21, x0
 458d064: aa1403e0     	mov	x0, x20
 458d068: 94e9d9bd     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d06c: aa1503e0     	mov	x0, x21
 458d070: aa1303e2     	mov	x2, x19
 458d074: 954c47f6     	bl	0x989f04c <_ChromeMain+0x9899db0>
 458d078: aa1503e0     	mov	x0, x21
 458d07c: 94e9d9b8     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d080: aa1403e0     	mov	x0, x20
 458d084: 94e9d9b6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d088: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 458d08c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 458d090: a94157f6     	ldp	x22, x21, [sp, #0x10]
 458d094: 910103ff     	add	sp, sp, #0x40
 458d098: d65f03c0     	ret
 458d09c: 9100a280     	add	x0, x20, #0x28
 458d0a0: 972b44cc     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 458d0a4: b5fff900     	cbnz	x0, 0x458cfc4 <_ChromeMain+0x4587d28>
 458d0a8: f9403e80     	ldr	x0, [x20, #0x78]
 458d0ac: b5fff8c0     	cbnz	x0, 0x458cfc4 <_ChromeMain+0x4587d28>
 458d0b0: 17fffff6     	b	0x458d088 <_ChromeMain+0x4587dec>
