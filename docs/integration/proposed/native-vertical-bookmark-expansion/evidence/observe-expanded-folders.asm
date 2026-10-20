
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46101b0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46101b4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46101b8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46101bc: 910083fd     	add	x29, sp, #0x20
 46101c0: aa0003f3     	mov	x19, x0
 46101c4: 9118c000     	add	x0, x0, #0x630
 46101c8: 96fa3f1b     	bl	0x49fe34 <_ChromeMain+0x49ab98>
 46101cc: f9432e60     	ldr	x0, [x19, #0x658]
 46101d0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46101d4: d0052d15     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46101d8: f94046a9     	ldr	x9, [x21, #0x88]
 46101dc: eb09011f     	cmp	x8, x9
 46101e0: 54000041     	b.ne	0x46101e8 <_ChromeMain+0x460af4c>
 46101e4: 96e85a18     	bl	0x26a44 <_ChromeMain+0x217a8>
 46101e8: f9032e7f     	str	xzr, [x19, #0x658]
 46101ec: f9428e68     	ldr	x8, [x19, #0x518]
 46101f0: b4000828     	cbz	x8, 0x46102f4 <_ChromeMain+0x460b058>
 46101f4: f9402100     	ldr	x0, [x8, #0x40]
 46101f8: b40007e0     	cbz	x0, 0x46102f4 <_ChromeMain+0x460b058>
 46101fc: f9400008     	ldr	x8, [x0]
 4610200: f940a508     	ldr	x8, [x8, #0x148]
 4610204: d63f0100     	blr	x8
 4610208: f9400008     	ldr	x8, [x0]
 461020c: f940b508     	ldr	x8, [x8, #0x168]
 4610210: d63f0100     	blr	x8
 4610214: b4000700     	cbz	x0, 0x46102f4 <_ChromeMain+0x460b058>
 4610218: aa0003f4     	mov	x20, x0
 461021c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4610220: f94046a9     	ldr	x9, [x21, #0x88]
 4610224: eb09011f     	cmp	x8, x9
 4610228: 54000061     	b.ne	0x4610234 <_ChromeMain+0x460af98>
 461022c: aa1403e0     	mov	x0, x20
 4610230: 96e81033     	bl	0x142fc <_ChromeMain+0xf060>
 4610234: f9432e60     	ldr	x0, [x19, #0x658]
 4610238: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461023c: f94046a9     	ldr	x9, [x21, #0x88]
 4610240: eb09011f     	cmp	x8, x9
 4610244: 54000600     	b.eq	0x4610304 <_ChromeMain+0x460b068>
 4610248: f9032e74     	str	x20, [x19, #0x658]
 461024c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4610250: f94046a9     	ldr	x9, [x21, #0x88]
 4610254: eb09011f     	cmp	x8, x9
 4610258: 54000061     	b.ne	0x4610264 <_ChromeMain+0x460afc8>
 461025c: aa1303e0     	mov	x0, x19
 4610260: 96e81027     	bl	0x142fc <_ChromeMain+0xf060>
 4610264: 52800700     	mov	w0, #0x38               ; =56
 4610268: 96e7fc40     	bl	0xf368 <_ChromeMain+0xa0cc>
 461026c: 52800035     	mov	w21, #0x1               ; =1
 4610270: b9000015     	str	w21, [x0]
 4610274: 90ffcae8     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4610278: 91270108     	add	x8, x8, #0x9c0
 461027c: 90fea5a9     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4610280: 91180129     	add	x9, x9, #0x600
 4610284: a900a408     	stp	x8, x9, [x0, #0x8]
 4610288: b0fefa76     	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 461028c: 912c02d6     	add	x22, x22, #0xb00
 4610290: 1006d3e8     	adr	x8, 0x461dd0c <_ChromeMain+0x4618a70>
 4610294: d503201f     	nop
 4610298: a901a016     	stp	x22, x8, [x0, #0x18]
 461029c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 46102a0: b4000360     	cbz	x0, 0x461030c <_ChromeMain+0x460b070>
 46102a4: aa0003f4     	mov	x20, x0
 46102a8: 52800600     	mov	w0, #0x30               ; =48
 46102ac: 96e7fc2f     	bl	0xf368 <_ChromeMain+0xa0cc>
 46102b0: aa0003e3     	mov	x3, x0
 46102b4: b9000015     	str	w21, [x0]
 46102b8: 90fef7a8     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 46102bc: 91117108     	add	x8, x8, #0x45c
 46102c0: 90ff9449     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 46102c4: 91070129     	add	x9, x9, #0x1c0
 46102c8: a900a408     	stp	x8, x9, [x0, #0x8]
 46102cc: f9000c16     	str	x22, [x0, #0x18]
 46102d0: f9001414     	str	x20, [x0, #0x28]
 46102d4: d00446c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 46102d8: 91191c21     	add	x1, x1, #0x647
 46102dc: 9118c260     	add	x0, x19, #0x630
 46102e0: 52800602     	mov	w2, #0x30               ; =48
 46102e4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46102e8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46102ec: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46102f0: 172b6a50     	b	0x10eac30 <_ChromeMain+0x10e5994>
 46102f4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46102f8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46102fc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4610300: d65f03c0     	ret
 4610304: 96e859d0     	bl	0x26a44 <_ChromeMain+0x217a8>
 4610308: 17ffffd0     	b	0x4610248 <_ChromeMain+0x460afac>
 461030c: d2800003     	mov	x3, #0x0                ; =0
 4610310: 17fffff1     	b	0x46102d4 <_ChromeMain+0x460b038>
