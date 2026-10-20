
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462e9d8: d100c3ff     	sub	sp, sp, #0x30
 462e9dc: a9027bfd     	stp	x29, x30, [sp, #0x20]
 462e9e0: 910083fd     	add	x29, sp, #0x20
 462e9e4: 3dc00020     	ldr	q0, [x1]
 462e9e8: 3d8003e0     	str	q0, [sp]
 462e9ec: f9400828     	ldr	x8, [x1, #0x10]
 462e9f0: f9000be8     	str	x8, [sp, #0x10]
 462e9f4: a900fc3f     	stp	xzr, xzr, [x1, #0x8]
 462e9f8: f900003f     	str	xzr, [x1]
 462e9fc: 910003e1     	mov	x1, sp
 462ea00: 94002810     	bl	0x4638a40 <_ChromeMain+0x46337a4>
 462ea04: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 462ea08: 37f80088     	tbnz	w8, #0x1f, 0x462ea18 <_ChromeMain+0x462977c>
 462ea0c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 462ea10: 9100c3ff     	add	sp, sp, #0x30
 462ea14: d65f03c0     	ret
 462ea18: f94003e0     	ldr	x0, [sp]
 462ea1c: f9400be8     	ldr	x8, [sp, #0x10]
 462ea20: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 462ea24: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 462ea28: 9100c3ff     	add	sp, sp, #0x30
 462ea2c: 16e76923     	b	0x8eb8 <_ChromeMain+0x3c1c>
