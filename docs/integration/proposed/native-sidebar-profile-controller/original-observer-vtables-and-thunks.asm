
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465ee6c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 465ee70: a9014ff4     	stp	x20, x19, [sp, #0x10]
 465ee74: a9027bfd     	stp	x29, x30, [sp, #0x20]
 465ee78: 910083fd     	add	x29, sp, #0x20
 465ee7c: aa0003f3     	mov	x19, x0
 465ee80: f9406014     	ldr	x20, [x0, #0xc0]
 465ee84: 90052ab5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465ee88: b4000174     	cbz	x20, 0x465eeb4 <_ChromeMain+0x4659c18>
 465ee8c: f900627f     	str	xzr, [x19, #0xc0]
 465ee90: f9405e61     	ldr	x1, [x19, #0xb8]
 465ee94: 911f6280     	add	x0, x20, #0x7d8
 465ee98: 94e51f78     	bl	0x7fa6c78 <_ChromeMain+0x7fa19dc>
 465ee9c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465eea0: f94046a9     	ldr	x9, [x21, #0x88]
 465eea4: eb09011f     	cmp	x8, x9
 465eea8: 54000061     	b.ne	0x465eeb4 <_ChromeMain+0x4659c18>
 465eeac: aa1403e0     	mov	x0, x20
 465eeb0: 96e70ee3     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465eeb4: f9407274     	ldr	x20, [x19, #0xe0]
 465eeb8: b4000174     	cbz	x20, 0x465eee4 <_ChromeMain+0x4659c48>
 465eebc: f900727f     	str	xzr, [x19, #0xe0]
 465eec0: f9406e61     	ldr	x1, [x19, #0xd8]
 465eec4: 9104c280     	add	x0, x20, #0x130
 465eec8: 96fbc31b     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465eecc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465eed0: f94046a9     	ldr	x9, [x21, #0x88]
 465eed4: eb09011f     	cmp	x8, x9
 465eed8: 54000061     	b.ne	0x465eee4 <_ChromeMain+0x4659c48>
 465eedc: aa1403e0     	mov	x0, x20
 465eee0: 96e70ed7     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465eee4: f9402660     	ldr	x0, [x19, #0x48]
 465eee8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465eeec: f94046a9     	ldr	x9, [x21, #0x88]
 465eef0: eb09011f     	cmp	x8, x9
 465eef4: 54000041     	b.ne	0x465eefc <_ChromeMain+0x4659c60>
 465eef8: 96e70ed1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465eefc: f900267f     	str	xzr, [x19, #0x48]
 465ef00: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465ef04: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465ef08: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465ef0c: d65f03c0     	ret
 465ef10: d112c000     	sub	x0, x0, #0x4b0
 465ef14: 1400021b     	b	0x465f780 <_ChromeMain+0x465a4e4>
		...
 465ef20: d1132000     	sub	x0, x0, #0x4c8
 465ef24: 17fffc66     	b	0x465e0bc <_ChromeMain+0x4658e20>
 465ef28: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465ef2c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465ef30: 910043fd     	add	x29, sp, #0x10
 465ef34: d1132013     	sub	x19, x0, #0x4c8
 465ef38: aa1303e0     	mov	x0, x19
 465ef3c: 97fffc60     	bl	0x465e0bc <_ChromeMain+0x4658e20>
 465ef40: 90054568     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 465ef44: 91120108     	add	x8, x8, #0x480
 465ef48: f8bfc100     	ldapr	x0, [x8]
 465ef4c: b40000a0     	cbz	x0, 0x465ef60 <_ChromeMain+0x4659cc4>
 465ef50: aa1303e1     	mov	x1, x19
 465ef54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465ef58: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465ef5c: 1723f6f1     	b	0xf5cb20 <_ChromeMain+0xf57884>
 465ef60: 97f1d1e6     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465ef64: 17fffffb     	b	0x465ef50 <_ChromeMain+0x4659cb4>
 465ef68: d10103ff     	sub	sp, sp, #0x40
 465ef6c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 465ef70: a9037bfd     	stp	x29, x30, [sp, #0x30]
 465ef74: 9100c3fd     	add	x29, sp, #0x30
 465ef78: aa0003f3     	mov	x19, x0
 465ef7c: f9400408     	ldr	x8, [x0, #0x8]
 465ef80: f9429d08     	ldr	x8, [x8, #0x538]
 465ef84: f9403500     	ldr	x0, [x8, #0x68]
 465ef88: b4000240     	cbz	x0, 0x465efd0 <_ChromeMain+0x4659d34>
 465ef8c: aa0103f4     	mov	x20, x1
 465ef90: f9400008     	ldr	x8, [x0]
 465ef94: f940a508     	ldr	x8, [x8, #0x148]
 465ef98: d63f0100     	blr	x8
 465ef9c: f9400008     	ldr	x8, [x0]
 465efa0: f9401909     	ldr	x9, [x8, #0x30]
 465efa4: 910023e8     	add	x8, sp, #0x8
 465efa8: d63f0120     	blr	x9
 465efac: 910023e1     	add	x1, sp, #0x8
 465efb0: aa1403e0     	mov	x0, x20
 465efb4: 9729b454     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 465efb8: aa0003f4     	mov	x20, x0
 465efbc: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 465efc0: 37f80108     	tbnz	w8, #0x1f, 0x465efe0 <_ChromeMain+0x4659d44>
 465efc4: 34000074     	cbz	w20, 0x465efd0 <_ChromeMain+0x4659d34>
 465efc8: d1132260     	sub	x0, x19, #0x4c8
 465efcc: 94000195     	bl	0x465f620 <_ChromeMain+0x465a384>
 465efd0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 465efd4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 465efd8: 910103ff     	add	sp, sp, #0x40
 465efdc: d65f03c0     	ret
 465efe0: f94007e0     	ldr	x0, [sp, #0x8]
 465efe4: f9400fe8     	ldr	x8, [sp, #0x18]
 465efe8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465efec: 96e6a7b3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465eff0: 35fffed4     	cbnz	w20, 0x465efc8 <_ChromeMain+0x4659d2c>
 465eff4: 17fffff7     	b	0x465efd0 <_ChromeMain+0x4659d34>
 465eff8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 465effc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 465f000: a9027bfd     	stp	x29, x30, [sp, #0x20]
 465f004: 910083fd     	add	x29, sp, #0x20
 465f008: aa0003f3     	mov	x19, x0
 465f00c: 3954d808     	ldrb	w8, [x0, #0x536]
 465f010: f0052a96     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465f014: 37000308     	tbnz	w8, #0x0, 0x465f074 <_ChromeMain+0x4659dd8>
 465f018: f9426a68     	ldr	x8, [x19, #0x4d0]
 465f01c: f942d908     	ldr	x8, [x8, #0x5b0]
 465f020: b40002a8     	cbz	x8, 0x465f074 <_ChromeMain+0x4659dd8>
 465f024: f942f514     	ldr	x20, [x8, #0x5e8]
 465f028: b4000274     	cbz	x20, 0x465f074 <_ChromeMain+0x4659dd8>
 465f02c: f9400288     	ldr	x8, [x20]
 465f030: f9403508     	ldr	x8, [x8, #0x68]
 465f034: aa1403e0     	mov	x0, x20
 465f038: d63f0100     	blr	x8
 465f03c: b40001c0     	cbz	x0, 0x465f074 <_ChromeMain+0x4659dd8>
 465f040: f942ba75     	ldr	x21, [x19, #0x570]
 465f044: eb1402bf     	cmp	x21, x20
 465f048: 540005c0     	b.eq	0x465f100 <_ChromeMain+0x4659e64>
 465f04c: b40007b5     	cbz	x21, 0x465f140 <_ChromeMain+0x4659ea4>
 465f050: f902ba7f     	str	xzr, [x19, #0x570]
 465f054: f942b661     	ldr	x1, [x19, #0x568]
 465f058: 911f62a0     	add	x0, x21, #0x7d8
 465f05c: 94e51f07     	bl	0x7fa6c78 <_ChromeMain+0x7fa19dc>
 465f060: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465f064: f94046c9     	ldr	x9, [x22, #0x88]
 465f068: eb09011f     	cmp	x8, x9
 465f06c: 540006a1     	b.ne	0x465f140 <_ChromeMain+0x4659ea4>
 465f070: 14000032     	b	0x465f138 <_ChromeMain+0x4659e9c>
 465f074: f942ba74     	ldr	x20, [x19, #0x570]
 465f078: b4000174     	cbz	x20, 0x465f0a4 <_ChromeMain+0x4659e08>
 465f07c: f902ba7f     	str	xzr, [x19, #0x570]
 465f080: f942b661     	ldr	x1, [x19, #0x568]
 465f084: 911f6280     	add	x0, x20, #0x7d8
 465f088: 94e51efc     	bl	0x7fa6c78 <_ChromeMain+0x7fa19dc>
 465f08c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f090: f94046c9     	ldr	x9, [x22, #0x88]
 465f094: eb09011f     	cmp	x8, x9
 465f098: 54000061     	b.ne	0x465f0a4 <_ChromeMain+0x4659e08>
 465f09c: aa1403e0     	mov	x0, x20
 465f0a0: 96e70e67     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f0a4: f942ca74     	ldr	x20, [x19, #0x590]
 465f0a8: b4000174     	cbz	x20, 0x465f0d4 <_ChromeMain+0x4659e38>
 465f0ac: f902ca7f     	str	xzr, [x19, #0x590]
 465f0b0: f942c661     	ldr	x1, [x19, #0x588]
 465f0b4: 9104c280     	add	x0, x20, #0x130
 465f0b8: 96fbc29f     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465f0bc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f0c0: f94046c9     	ldr	x9, [x22, #0x88]
 465f0c4: eb09011f     	cmp	x8, x9
 465f0c8: 54000061     	b.ne	0x465f0d4 <_ChromeMain+0x4659e38>
 465f0cc: aa1403e0     	mov	x0, x20
 465f0d0: 96e70e5b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f0d4: f9427e60     	ldr	x0, [x19, #0x4f8]
 465f0d8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f0dc: f94046c9     	ldr	x9, [x22, #0x88]
 465f0e0: eb09011f     	cmp	x8, x9
 465f0e4: 54000041     	b.ne	0x465f0ec <_ChromeMain+0x4659e50>
 465f0e8: 96e70e55     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f0ec: f9027e7f     	str	xzr, [x19, #0x4f8]
 465f0f0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465f0f4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465f0f8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465f0fc: d65f03c0     	ret
 465f100: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f104: f94046c9     	ldr	x9, [x22, #0x88]
 465f108: eb09011f     	cmp	x8, x9
 465f10c: 54000061     	b.ne	0x465f118 <_ChromeMain+0x4659e7c>
 465f110: aa1403e0     	mov	x0, x20
 465f114: 96e6d47a     	bl	0x142fc <_ChromeMain+0xf060>
 465f118: f9427e60     	ldr	x0, [x19, #0x4f8]
 465f11c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f120: f94046c9     	ldr	x9, [x22, #0x88]
 465f124: eb09011f     	cmp	x8, x9
 465f128: 54000041     	b.ne	0x465f130 <_ChromeMain+0x4659e94>
 465f12c: 96e70e44     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f130: f9027e74     	str	x20, [x19, #0x4f8]
 465f134: 17ffffef     	b	0x465f0f0 <_ChromeMain+0x4659e54>
 465f138: aa1503e0     	mov	x0, x21
 465f13c: 96e70e40     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f140: f942ca75     	ldr	x21, [x19, #0x590]
 465f144: b4000175     	cbz	x21, 0x465f170 <_ChromeMain+0x4659ed4>
 465f148: f902ca7f     	str	xzr, [x19, #0x590]
 465f14c: f942c661     	ldr	x1, [x19, #0x588]
 465f150: 9104c2a0     	add	x0, x21, #0x130
 465f154: 96fbc278     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465f158: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465f15c: f94046c9     	ldr	x9, [x22, #0x88]
 465f160: eb09011f     	cmp	x8, x9
 465f164: 54000061     	b.ne	0x465f170 <_ChromeMain+0x4659ed4>
 465f168: aa1503e0     	mov	x0, x21
 465f16c: 96e70e34     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f170: f9427e60     	ldr	x0, [x19, #0x4f8]
 465f174: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f178: f94046c9     	ldr	x9, [x22, #0x88]
 465f17c: eb09011f     	cmp	x8, x9
 465f180: 54000041     	b.ne	0x465f188 <_ChromeMain+0x4659eec>
 465f184: 96e70e2e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f188: d2800000     	mov	x0, #0x0                ; =0
 465f18c: f9027e7f     	str	xzr, [x19, #0x4f8]
 465f190: 925e7695     	and	x21, x20, #0xfffffffc00000000
 465f194: f94046c8     	ldr	x8, [x22, #0x88]
 465f198: eb0802bf     	cmp	x21, x8
 465f19c: 54000081     	b.ne	0x465f1ac <_ChromeMain+0x4659f10>
 465f1a0: aa1403e0     	mov	x0, x20
 465f1a4: 96e6d456     	bl	0x142fc <_ChromeMain+0xf060>
 465f1a8: f9427e60     	ldr	x0, [x19, #0x4f8]
 465f1ac: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f1b0: f94046c9     	ldr	x9, [x22, #0x88]
 465f1b4: eb09011f     	cmp	x8, x9
 465f1b8: 54000041     	b.ne	0x465f1c0 <_ChromeMain+0x4659f24>
 465f1bc: 96e70e20     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f1c0: f9027e74     	str	x20, [x19, #0x4f8]
 465f1c4: f94046c8     	ldr	x8, [x22, #0x88]
 465f1c8: eb0802bf     	cmp	x21, x8
 465f1cc: 54000061     	b.ne	0x465f1d8 <_ChromeMain+0x4659f3c>
 465f1d0: aa1403e0     	mov	x0, x20
 465f1d4: 96e6d44a     	bl	0x142fc <_ChromeMain+0xf060>
 465f1d8: f942ba60     	ldr	x0, [x19, #0x570]
 465f1dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f1e0: f94046c9     	ldr	x9, [x22, #0x88]
 465f1e4: eb09011f     	cmp	x8, x9
 465f1e8: 54000041     	b.ne	0x465f1f0 <_ChromeMain+0x4659f54>
 465f1ec: 96e70e14     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f1f0: f902ba74     	str	x20, [x19, #0x570]
 465f1f4: f942b661     	ldr	x1, [x19, #0x568]
 465f1f8: 911f6280     	add	x0, x20, #0x7d8
 465f1fc: 94e51e9d     	bl	0x7fa6c70 <_ChromeMain+0x7fa19d4>
 465f200: f9427e74     	ldr	x20, [x19, #0x4f8]
 465f204: f942ca75     	ldr	x21, [x19, #0x590]
 465f208: b4000434     	cbz	x20, 0x465f28c <_ChromeMain+0x4659ff0>
 465f20c: eb1402bf     	cmp	x21, x20
 465f210: 54fff700     	b.eq	0x465f0f0 <_ChromeMain+0x4659e54>
 465f214: b4000175     	cbz	x21, 0x465f240 <_ChromeMain+0x4659fa4>
 465f218: f902ca7f     	str	xzr, [x19, #0x590]
 465f21c: f942c661     	ldr	x1, [x19, #0x588]
 465f220: 9104c2a0     	add	x0, x21, #0x130
 465f224: 96fbc244     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465f228: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465f22c: f94046c9     	ldr	x9, [x22, #0x88]
 465f230: eb09011f     	cmp	x8, x9
 465f234: 54000061     	b.ne	0x465f240 <_ChromeMain+0x4659fa4>
 465f238: aa1503e0     	mov	x0, x21
 465f23c: 96e70e00     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f240: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f244: f94046c9     	ldr	x9, [x22, #0x88]
 465f248: eb09011f     	cmp	x8, x9
 465f24c: 54000061     	b.ne	0x465f258 <_ChromeMain+0x4659fbc>
 465f250: aa1403e0     	mov	x0, x20
 465f254: 96e6d42a     	bl	0x142fc <_ChromeMain+0xf060>
 465f258: f942ca60     	ldr	x0, [x19, #0x590]
 465f25c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f260: f94046c9     	ldr	x9, [x22, #0x88]
 465f264: eb09011f     	cmp	x8, x9
 465f268: 540002e0     	b.eq	0x465f2c4 <_ChromeMain+0x465a028>
 465f26c: f902ca74     	str	x20, [x19, #0x590]
 465f270: f942c661     	ldr	x1, [x19, #0x588]
 465f274: b40002c1     	cbz	x1, 0x465f2cc <_ChromeMain+0x465a030>
 465f278: 9104c280     	add	x0, x20, #0x130
 465f27c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465f280: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465f284: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465f288: 16f8502e     	b	0x473340 <_ChromeMain+0x46e0a4>
 465f28c: b4fff335     	cbz	x21, 0x465f0f0 <_ChromeMain+0x4659e54>
 465f290: f902ca7f     	str	xzr, [x19, #0x590]
 465f294: f942c661     	ldr	x1, [x19, #0x588]
 465f298: 9104c2a0     	add	x0, x21, #0x130
 465f29c: 96fbc226     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465f2a0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 465f2a4: f94046c9     	ldr	x9, [x22, #0x88]
 465f2a8: eb09011f     	cmp	x8, x9
 465f2ac: 54fff221     	b.ne	0x465f0f0 <_ChromeMain+0x4659e54>
 465f2b0: aa1503e0     	mov	x0, x21
 465f2b4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465f2b8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465f2bc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465f2c0: 16e70ddf     	b	0x22a3c <_ChromeMain+0x1d7a0>
 465f2c4: 96e70dde     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f2c8: 17ffffe9     	b	0x465f26c <_ChromeMain+0x4659fd0>
 465f2cc: d4200000     	brk	#0
 465f2d0: d4400000     	hlt	#0
 465f2d4: d4200020     	brk	#0x1
 465f2d8: d10143ff     	sub	sp, sp, #0x50
 465f2dc: a90257f6     	stp	x22, x21, [sp, #0x20]
 465f2e0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 465f2e4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 465f2e8: 910103fd     	add	x29, sp, #0x40
 465f2ec: aa0803f3     	mov	x19, x8
 465f2f0: f9426808     	ldr	x8, [x0, #0x4d0]
 465f2f4: f9429d08     	ldr	x8, [x8, #0x538]
 465f2f8: f9403514     	ldr	x20, [x8, #0x68]
 465f2fc: b40007b4     	cbz	x20, 0x465f3f0 <_ChromeMain+0x465a154>
 465f300: aa0003f5     	mov	x21, x0
 465f304: 39412288     	ldrb	w8, [x20, #0x48]
 465f308: 370000a8     	tbnz	w8, #0x0, 0x465f31c <_ChromeMain+0x465a080>
 465f30c: aa1403e0     	mov	x0, x20
 465f310: 96fb2a45     	bl	0x529c24 <_ChromeMain+0x524988>
 465f314: 7100081f     	cmp	w0, #0x2
 465f318: 540007a1     	b.ne	0x465f40c <_ChromeMain+0x465a170>
 465f31c: f9427ea8     	ldr	x8, [x21, #0x4f8]
 465f320: b4000408     	cbz	x8, 0x465f3a0 <_ChromeMain+0x465a104>
 465f324: f9426508     	ldr	x8, [x8, #0x4c8]
 465f328: f941ad08     	ldr	x8, [x8, #0x358]
 465f32c: 91006115     	add	x21, x8, #0x18
 465f330: 3980bd16     	ldrsb	x22, [x8, #0x2f]
 465f334: b7f809d6     	tbnz	x22, #0x3f, 0x465f46c <_ChromeMain+0x465a1d0>
 465f338: 34000356     	cbz	w22, 0x465f3a0 <_ChromeMain+0x465a104>
 465f33c: f1002adf     	cmp	x22, #0xa
 465f340: 540002c9     	b.ls	0x465f398 <_ChromeMain+0x465a0fc>
 465f344: 927deed4     	and	x20, x22, #0x7ffffffffffffff8
 465f348: d37ffa88     	lsl	x8, x20, #1
 465f34c: 91004100     	add	x0, x8, #0x10
 465f350: 96e6c006     	bl	0xf368 <_ChromeMain+0xa0cc>
 465f354: b27defe8     	mov	x8, #0x7ffffffffffffff8 ; =9223372036854775800
 465f358: cb080288     	sub	x8, x20, x8
 465f35c: a9005a60     	stp	x0, x22, [x19]
 465f360: f9000a68     	str	x8, [x19, #0x10]
 465f364: aa0003f3     	mov	x19, x0
 465f368: 8b160668     	add	x8, x19, x22, lsl #1
 465f36c: eb13011f     	cmp	x8, x19
 465f370: 54000983     	b.lo	0x465f4a0 <_ChromeMain+0x465a204>
 465f374: eb15027f     	cmp	x19, x21
 465f378: fa559100     	ccmp	x8, x21, #0x0, ls
 465f37c: 54000928     	b.hi	0x465f4a0 <_ChromeMain+0x465a204>
 465f380: d37ffac2     	lsl	x2, x22, #1
 465f384: aa1303e0     	mov	x0, x19
 465f388: aa1503e1     	mov	x1, x21
 465f38c: 94e6bfd0     	bl	0x800f2cc <_ChromeMain+0x800a030>
 465f390: 78367a7f     	strh	wzr, [x19, x22, lsl #1]
 465f394: 14000019     	b	0x465f3f8 <_ChromeMain+0x465a15c>
 465f398: 39005e76     	strb	w22, [x19, #0x17]
 465f39c: 17fffff3     	b	0x465f368 <_ChromeMain+0x465a0cc>
 465f3a0: f9400288     	ldr	x8, [x20]
 465f3a4: f940a908     	ldr	x8, [x8, #0x150]
 465f3a8: aa1403e0     	mov	x0, x20
 465f3ac: d63f0100     	blr	x8
 465f3b0: f9400008     	ldr	x8, [x0]
 465f3b4: f9401909     	ldr	x9, [x8, #0x30]
 465f3b8: 910023e8     	add	x8, sp, #0x8
 465f3bc: d63f0120     	blr	x9
 465f3c0: 910023e0     	add	x0, sp, #0x8
 465f3c4: aa1303e8     	mov	x8, x19
 465f3c8: 976ea315     	bl	0x220801c <_ChromeMain+0x2202d80>
 465f3cc: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 465f3d0: 36f80148     	tbz	w8, #0x1f, 0x465f3f8 <_ChromeMain+0x465a15c>
 465f3d4: f94007e0     	ldr	x0, [sp, #0x8]
 465f3d8: f9400fe8     	ldr	x8, [sp, #0x18]
 465f3dc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465f3e0: 96e6a6b6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465f3e4: 14000005     	b	0x465f3f8 <_ChromeMain+0x465a15c>
 465f3e8: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 465f3ec: 37f80508     	tbnz	w8, #0x1f, 0x465f48c <_ChromeMain+0x465a1f0>
 465f3f0: a9007e7f     	stp	xzr, xzr, [x19]
 465f3f4: f9000a7f     	str	xzr, [x19, #0x10]
 465f3f8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 465f3fc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 465f400: a94257f6     	ldp	x22, x21, [sp, #0x20]
 465f404: 910143ff     	add	sp, sp, #0x50
 465f408: d65f03c0     	ret
 465f40c: f0054428     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 465f410: f9467d00     	ldr	x0, [x8, #0xcf8]
 465f414: b4fffee0     	cbz	x0, 0x465f3f0 <_ChromeMain+0x465a154>
 465f418: 974f01d8     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 465f41c: b4fffea0     	cbz	x0, 0x465f3f0 <_ChromeMain+0x465a154>
 465f420: aa0003f5     	mov	x21, x0
 465f424: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 465f428: f9000fff     	str	xzr, [sp, #0x18]
 465f42c: f9400288     	ldr	x8, [x20]
 465f430: f940a908     	ldr	x8, [x8, #0x150]
 465f434: aa1403e0     	mov	x0, x20
 465f438: d63f0100     	blr	x8
 465f43c: f9400008     	ldr	x8, [x0]
 465f440: f9401909     	ldr	x9, [x8, #0x30]
 465f444: 910023e8     	add	x8, sp, #0x8
 465f448: d63f0120     	blr	x9
 465f44c: aa1503e0     	mov	x0, x21
 465f450: 974f01f0     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 465f454: 910023e1     	add	x1, sp, #0x8
 465f458: 974f022a     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 465f45c: b4fffc60     	cbz	x0, 0x465f3e8 <_ChromeMain+0x465a14c>
 465f460: aa1303e8     	mov	x8, x19
 465f464: 97ebed29     	bl	0x415a908 <_ChromeMain+0x415566c>
 465f468: 17ffffd9     	b	0x465f3cc <_ChromeMain+0x465a130>
 465f46c: f9401116     	ldr	x22, [x8, #0x20]
 465f470: b4fff996     	cbz	x22, 0x465f3a0 <_ChromeMain+0x465a104>
 465f474: 92800208     	mov	x8, #-0x11              ; =-17
 465f478: f2efffe8     	movk	x8, #0x7fff, lsl #48
 465f47c: eb0802df     	cmp	x22, x8
 465f480: 54000122     	b.hs	0x465f4a4 <_ChromeMain+0x465a208>
 465f484: f94002b5     	ldr	x21, [x21]
 465f488: 17ffffad     	b	0x465f33c <_ChromeMain+0x465a0a0>
 465f48c: f94007e0     	ldr	x0, [sp, #0x8]
 465f490: f9400fe8     	ldr	x8, [sp, #0x18]
 465f494: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 465f498: 96e6a688     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 465f49c: 17ffffd5     	b	0x465f3f0 <_ChromeMain+0x465a154>
 465f4a0: d4200020     	brk	#0x1
 465f4a4: 941b1341     	bl	0x4d241a8 <_ChromeMain+0x4d1ef0c>
 465f4a8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 465f4ac: a9014ff4     	stp	x20, x19, [sp, #0x10]
 465f4b0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 465f4b4: 910083fd     	add	x29, sp, #0x20
 465f4b8: f9400413     	ldr	x19, [x0, #0x8]
 465f4bc: f9427e68     	ldr	x8, [x19, #0x4f8]
 465f4c0: eb01011f     	cmp	x8, x1
 465f4c4: 540000a0     	b.eq	0x465f4d8 <_ChromeMain+0x465a23c>
 465f4c8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465f4cc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465f4d0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465f4d4: d65f03c0     	ret
 465f4d8: f942ba74     	ldr	x20, [x19, #0x570]
 465f4dc: f0052a95     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465f4e0: b4000174     	cbz	x20, 0x465f50c <_ChromeMain+0x465a270>
 465f4e4: f902ba7f     	str	xzr, [x19, #0x570]
 465f4e8: f942b661     	ldr	x1, [x19, #0x568]
 465f4ec: 911f6280     	add	x0, x20, #0x7d8
 465f4f0: 94e51de2     	bl	0x7fa6c78 <_ChromeMain+0x7fa19dc>
 465f4f4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f4f8: f94046a9     	ldr	x9, [x21, #0x88]
 465f4fc: eb09011f     	cmp	x8, x9
 465f500: 54000061     	b.ne	0x465f50c <_ChromeMain+0x465a270>
 465f504: aa1403e0     	mov	x0, x20
 465f508: 96e70d4d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f50c: f942ca74     	ldr	x20, [x19, #0x590]
 465f510: b4000174     	cbz	x20, 0x465f53c <_ChromeMain+0x465a2a0>
 465f514: f902ca7f     	str	xzr, [x19, #0x590]
 465f518: f942c661     	ldr	x1, [x19, #0x588]
 465f51c: 9104c280     	add	x0, x20, #0x130
 465f520: 96fbc185     	bl	0x54fb34 <_ChromeMain+0x54a898>
 465f524: 925e7688     	and	x8, x20, #0xfffffffc00000000
 465f528: f94046a9     	ldr	x9, [x21, #0x88]
 465f52c: eb09011f     	cmp	x8, x9
 465f530: 54000061     	b.ne	0x465f53c <_ChromeMain+0x465a2a0>
 465f534: aa1403e0     	mov	x0, x20
 465f538: 96e70d41     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f53c: f9427e60     	ldr	x0, [x19, #0x4f8]
 465f540: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f544: f94046a9     	ldr	x9, [x21, #0x88]
 465f548: eb09011f     	cmp	x8, x9
 465f54c: 54000041     	b.ne	0x465f554 <_ChromeMain+0x465a2b8>
 465f550: 96e70d3b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f554: f9027e7f     	str	xzr, [x19, #0x4f8]
 465f558: f9400268     	ldr	x8, [x19]
 465f55c: f9403508     	ldr	x8, [x8, #0x68]
 465f560: aa1303e0     	mov	x0, x19
 465f564: d63f0100     	blr	x8
 465f568: b4fffb00     	cbz	x0, 0x465f4c8 <_ChromeMain+0x465a22c>
 465f56c: aa1303e0     	mov	x0, x19
 465f570: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 465f574: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 465f578: a8c357f6     	ldp	x22, x21, [sp], #0x30
 465f57c: 14000029     	b	0x465f620 <_ChromeMain+0x465a384>
 465f580: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465f584: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465f588: 910043fd     	add	x29, sp, #0x10
 465f58c: aa0003f3     	mov	x19, x0
 465f590: b004f548     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 465f594: 91384108     	add	x8, x8, #0xe10
 465f598: f8010408     	str	x8, [x0], #0x10
 465f59c: 973bc73b     	bl	0x1551288 <_ChromeMain+0x154bfec>
 465f5a0: f9400660     	ldr	x0, [x19, #0x8]
 465f5a4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f5a8: f0052a89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465f5ac: f9404529     	ldr	x9, [x9, #0x88]
 465f5b0: eb09011f     	cmp	x8, x9
 465f5b4: 54000041     	b.ne	0x465f5bc <_ChromeMain+0x465a320>
 465f5b8: 96e70d21     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f5bc: f900067f     	str	xzr, [x19, #0x8]
 465f5c0: aa1303e0     	mov	x0, x19
 465f5c4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465f5c8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465f5cc: d65f03c0     	ret
 465f5d0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 465f5d4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 465f5d8: 910043fd     	add	x29, sp, #0x10
 465f5dc: aa0003f3     	mov	x19, x0
 465f5e0: b004f548     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 465f5e4: 91384108     	add	x8, x8, #0xe10
 465f5e8: f8010408     	str	x8, [x0], #0x10
 465f5ec: 973bc727     	bl	0x1551288 <_ChromeMain+0x154bfec>
 465f5f0: f9400660     	ldr	x0, [x19, #0x8]
 465f5f4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 465f5f8: f0052a89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465f5fc: f9404529     	ldr	x9, [x9, #0x88]
 465f600: eb09011f     	cmp	x8, x9
 465f604: 54000041     	b.ne	0x465f60c <_ChromeMain+0x465a370>
 465f608: 96e70d0d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465f60c: aa1303e0     	mov	x0, x19
 465f610: 52800401     	mov	w1, #0x20               ; =32
 465f614: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465f618: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 465f61c: 16e6a627     	b	0x8eb8 <_ChromeMain+0x3c1c>
