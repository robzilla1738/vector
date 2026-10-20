
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4647c80: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4647c84: a90257f6     	stp	x22, x21, [sp, #0x20]
 4647c88: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4647c8c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4647c90: 910103fd     	add	x29, sp, #0x40
 4647c94: f9423408     	ldr	x8, [x0, #0x468]
 4647c98: eb01011f     	cmp	x8, x1
 4647c9c: 540000e0     	b.eq	0x4647cb8 <_ChromeMain+0x4642a1c>
 4647ca0: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4647ca4: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4647ca8: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4647cac: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4647cb0: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4647cb4: d65f03c0     	ret
 4647cb8: aa0003f3     	mov	x19, x0
 4647cbc: 52800028     	mov	w8, #0x1                ; =1
 4647cc0: 393e4008     	strb	w8, [x0, #0xf90]
 4647cc4: 97ffb4bb     	bl	0x4634fb0 <_ChromeMain+0x462fd14>
 4647cc8: f9497a74     	ldr	x20, [x19, #0x12f0]
 4647ccc: f9497e68     	ldr	x8, [x19, #0x12f8]
 4647cd0: d37df109     	lsl	x9, x8, #3
 4647cd4: b40001e9     	cbz	x9, 0x4647d10 <_ChromeMain+0x4642a74>
 4647cd8: 8b140129     	add	x9, x9, x20
 4647cdc: d1002135     	sub	x21, x9, #0x8
 4647ce0: cb080ff6     	neg	x22, x8, lsl #3
 4647ce4: 14000006     	b	0x4647cfc <_ChromeMain+0x4642a60>
 4647ce8: 973f97ac     	bl	0x162db98 <_ChromeMain+0x16288fc>
 4647cec: 52804501     	mov	w1, #0x228              ; =552
 4647cf0: 96e70472     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4647cf4: b10022d6     	adds	x22, x22, #0x8
 4647cf8: 54000100     	b.eq	0x4647d18 <_ChromeMain+0x4642a7c>
 4647cfc: b4001295     	cbz	x21, 0x4647f4c <_ChromeMain+0x4642cb0>
 4647d00: f94002a0     	ldr	x0, [x21]
 4647d04: f81f86bf     	str	xzr, [x21], #-0x8
 4647d08: b4ffff60     	cbz	x0, 0x4647cf4 <_ChromeMain+0x4642a58>
 4647d0c: 17fffff7     	b	0x4647ce8 <_ChromeMain+0x4642a4c>
 4647d10: aa1403e8     	mov	x8, x20
 4647d14: 14000002     	b	0x4647d1c <_ChromeMain+0x4642a80>
 4647d18: f9497a68     	ldr	x8, [x19, #0x12f0]
 4647d1c: cb080288     	sub	x8, x20, x8
 4647d20: 9343fd08     	asr	x8, x8, #3
 4647d24: f9097e68     	str	x8, [x19, #0x12f8]
 4647d28: f947ce74     	ldr	x20, [x19, #0xf98]
 4647d2c: f947d268     	ldr	x8, [x19, #0xfa0]
 4647d30: 8b080909     	add	x9, x8, x8, lsl #2
 4647d34: d37df129     	lsl	x9, x9, #3
 4647d38: b4000229     	cbz	x9, 0x4647d7c <_ChromeMain+0x4642ae0>
 4647d3c: 8b140129     	add	x9, x9, x20
