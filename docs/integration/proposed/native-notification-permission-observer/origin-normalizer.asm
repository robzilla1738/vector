
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40faf40: d10443ff     	sub	sp, sp, #0x110
 40faf44: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 40faf48: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 40faf4c: a9107bfd     	stp	x29, x30, [sp, #0x100]
 40faf50: 910403fd     	add	x29, sp, #0x100
 40faf54: aa0803f3     	mov	x19, x8
 40faf58: 39406008     	ldrb	w8, [x0, #0x18]
 40faf5c: 34000088     	cbz	w8, 0x40faf6c <_ChromeMain+0x40f5cd0>
 40faf60: aa0003f4     	mov	x20, x0
 40faf64: 97050030     	bl	0x23b024 <_ChromeMain+0x235d88>
 40faf68: 37000100     	tbnz	w0, #0x0, 0x40faf88 <_ChromeMain+0x40f5cec>
 40faf6c: 3900027f     	strb	wzr, [x19]
 40faf70: 3900627f     	strb	wzr, [x19, #0x18]
 40faf74: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 40faf78: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 40faf7c: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 40faf80: 910443ff     	add	sp, sp, #0x110
 40faf84: d65f03c0     	ret
 40faf88: 910063e8     	add	x8, sp, #0x18
 40faf8c: aa1403e0     	mov	x0, x20
 40faf90: 97288845     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 40faf94: d101c3a8     	sub	x8, x29, #0x70
 40faf98: 910063e0     	add	x0, sp, #0x18
 40faf9c: 970e05db     	bl	0x47c708 <_ChromeMain+0x47746c>
 40fafa0: 910003e8     	mov	x8, sp
 40fafa4: d101c3a0     	sub	x0, x29, #0x70
 40fafa8: 971fa2ca     	bl	0x8e3ad0 <_ChromeMain+0x8de834>
 40fafac: 38dc73a8     	ldursb	w8, [x29, #-0x39]
 40fafb0: 37f802c8     	tbnz	w8, #0x1f, 0x40fb008 <_ChromeMain+0x40f5d6c>
 40fafb4: 38daf3a8     	ldursb	w8, [x29, #-0x51]
 40fafb8: 37f80328     	tbnz	w8, #0x1f, 0x40fb01c <_ChromeMain+0x40f5d80>
 40fafbc: 910063f4     	add	x20, sp, #0x18
 40fafc0: 9101c280     	add	x0, x20, #0x70
 40fafc4: d2800001     	mov	x1, #0x0                ; =0
 40fafc8: 96fcb33c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 40fafcc: 91008280     	add	x0, x20, #0x20
 40fafd0: 96fcb32a     	bl	0x27c78 <_ChromeMain+0x229dc>
 40fafd4: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 40fafd8: 36f800a8     	tbz	w8, #0x1f, 0x40fafec <_ChromeMain+0x40f5d50>
 40fafdc: f9400fe0     	ldr	x0, [sp, #0x18]
 40fafe0: f94017e8     	ldr	x8, [sp, #0x28]
 40fafe4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fafe8: 96fc37b4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fafec: 3dc003e0     	ldr	q0, [sp]
 40faff0: 3d800260     	str	q0, [x19]
 40faff4: f9400be8     	ldr	x8, [sp, #0x10]
 40faff8: f9000a68     	str	x8, [x19, #0x10]
 40faffc: 52800028     	mov	w8, #0x1                ; =1
 40fb000: 39006268     	strb	w8, [x19, #0x18]
 40fb004: 17ffffdc     	b	0x40faf74 <_ChromeMain+0x40f5cd8>
 40fb008: f85b03a0     	ldur	x0, [x29, #-0x50]
 40fb00c: f85c03a8     	ldur	x8, [x29, #-0x40]
 40fb010: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fb014: 96fc37a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fb018: 17ffffe7     	b	0x40fafb4 <_ChromeMain+0x40f5d18>
 40fb01c: f85983a0     	ldur	x0, [x29, #-0x68]
 40fb020: f85a83a8     	ldur	x8, [x29, #-0x58]
 40fb024: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40fb028: 96fc37a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fb02c: 17ffffe4     	b	0x40fafbc <_ChromeMain+0x40f5d20>
