
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4269a04: d102c3ff     	sub	sp, sp, #0xb0
 4269a08: a9056ffc     	stp	x28, x27, [sp, #0x50]
 4269a0c: a90667fa     	stp	x26, x25, [sp, #0x60]
 4269a10: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4269a14: a90857f6     	stp	x22, x21, [sp, #0x80]
 4269a18: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4269a1c: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4269a20: 910283fd     	add	x29, sp, #0xa0
 4269a24: aa0203f4     	mov	x20, x2
 4269a28: aa0103f3     	mov	x19, x1
 4269a2c: aa0003f5     	mov	x21, x0
 4269a30: aa0103f7     	mov	x23, x1
 4269a34: f8408ee8     	ldr	x8, [x23, #0x8]!
 4269a38: aa0003f8     	mov	x24, x0
 4269a3c: f8408f09     	ldr	x9, [x24, #0x8]!
 4269a40: 39805eea     	ldrsb	x10, [x23, #0x17]
 4269a44: f100015f     	cmp	x10, #0x0
 4269a48: 9a974116     	csel	x22, x8, x23, mi
 4269a4c: f94006e8     	ldr	x8, [x23, #0x8]
 4269a50: 7100015f     	cmp	w10, #0x0
 4269a54: 9a8a411a     	csel	x26, x8, x10, mi
 4269a58: 39805f08     	ldrsb	x8, [x24, #0x17]
 4269a5c: f100011f     	cmp	x8, #0x0
 4269a60: 9a984121     	csel	x1, x9, x24, mi
 4269a64: f9400709     	ldr	x9, [x24, #0x8]
 4269a68: 7100011f     	cmp	w8, #0x0
 4269a6c: 9a884139     	csel	x25, x9, x8, mi
 4269a70: eb1a033f     	cmp	x25, x26
 4269a74: 9a9a3322     	csel	x2, x25, x26, lo
 4269a78: aa1603e0     	mov	x0, x22
 4269a7c: 94f67f79     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4269a80: 340006e0     	cbz	w0, 0x4269b5c <_ChromeMain+0x42648c0>
 4269a84: 36f80700     	tbz	w0, #0x1f, 0x4269b64 <_ChromeMain+0x42648c8>
