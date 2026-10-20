
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4572dec: 6db923e9     	stp	d9, d8, [sp, #-0x70]!
 4572df0: a9016ffc     	stp	x28, x27, [sp, #0x10]
 4572df4: a90267fa     	stp	x26, x25, [sp, #0x20]
 4572df8: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4572dfc: a90457f6     	stp	x22, x21, [sp, #0x40]
 4572e00: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4572e04: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4572e08: 910183fd     	add	x29, sp, #0x60
 4572e0c: d10c83ff     	sub	sp, sp, #0x320
 4572e10: aa0603f6     	mov	x22, x6
 4572e14: aa0503f4     	mov	x20, x5
 4572e18: aa0403f5     	mov	x21, x4
 4572e1c: aa0303f7     	mov	x23, x3
 4572e20: aa0203f8     	mov	x24, x2
 4572e24: aa0103f9     	mov	x25, x1
 4572e28: aa0003f3     	mov	x19, x0
 4572e2c: 9737f0c5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4572e30: 90050b28     	adrp	x8, 0xe6d6000 <dyld_stub_binder+0xe6d6000>
 4572e34: 91214108     	add	x8, x8, #0x850
 4572e38: 910fa109     	add	x9, x8, #0x3e8
 4572e3c: a9002408     	stp	x8, x9, [x0]
 4572e40: 91104109     	add	x9, x8, #0x410
 4572e44: f9000809     	str	x9, [x0, #0x10]
 4572e48: 91112109     	add	x9, x8, #0x448
 4572e4c: 9111e10a     	add	x10, x8, #0x478
 4572e50: a906a809     	stp	x9, x10, [x0, #0x68]
 4572e54: 91132109     	add	x9, x8, #0x4c8
 4572e58: f9005809     	str	x9, [x0, #0xb0]
 4572e5c: 9114a109     	add	x9, x8, #0x528
 4572e60: f9006c09     	str	x9, [x0, #0xd8]
 4572e64: 91156108     	add	x8, x8, #0x558
 4572e68: f9007c08     	str	x8, [x0, #0xf8]
 4572e6c: 925e7728     	and	x8, x25, #0xfffffffc00000000
 4572e70: 9005321a     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4572e74: f9404749     	ldr	x9, [x26, #0x88]
 4572e78: eb09011f     	cmp	x8, x9
 4572e7c: 54000061     	b.ne	0x4572e88 <_ChromeMain+0x456dbec>
 4572e80: aa1903e0     	mov	x0, x25
 4572e84: 96ea851e     	bl	0x142fc <_ChromeMain+0xf060>
 4572e88: f9018a79     	str	x25, [x19, #0x310]
 4572e8c: 925e7708     	and	x8, x24, #0xfffffffc00000000
 4572e90: f9404749     	ldr	x9, [x26, #0x88]
 4572e94: eb09011f     	cmp	x8, x9
 4572e98: 54000061     	b.ne	0x4572ea4 <_ChromeMain+0x456dc08>
 4572e9c: aa1803e0     	mov	x0, x24
 4572ea0: 96ea8517     	bl	0x142fc <_ChromeMain+0xf060>
 4572ea4: f9018e78     	str	x24, [x19, #0x318]
 4572ea8: 390c827f     	strb	wzr, [x19, #0x320]
 4572eac: 52801fe8     	mov	w8, #0xff               ; =255
 4572eb0: 390d0268     	strb	w8, [x19, #0x340]
 4572eb4: 910c8260     	add	x0, x19, #0x320
 4572eb8: aa1703e1     	mov	x1, x23
 4572ebc: 9717c120     	bl	0xb6333c <_ChromeMain+0xb5e0a0>
 4572ec0: 3940a2e8     	ldrb	w8, [x23, #0x28]
 4572ec4: 390d2268     	strb	w8, [x19, #0x348]
 4572ec8: 3dc00ee0     	ldr	q0, [x23, #0x30]
 4572ecc: f94022e8     	ldr	x8, [x23, #0x40]
 4572ed0: f901b268     	str	x8, [x19, #0x360]
 4572ed4: 3d80d660     	str	q0, [x19, #0x350]
 4572ed8: a903feff     	stp	xzr, xzr, [x23, #0x38]
 4572edc: f9001aff     	str	xzr, [x23, #0x30]
 4572ee0: b9036a75     	str	w21, [x19, #0x368]
 4572ee4: b9036e76     	str	w22, [x19, #0x36c]
