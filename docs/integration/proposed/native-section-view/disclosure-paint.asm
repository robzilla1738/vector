
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 411af20: d10703ff     	sub	sp, sp, #0x1c0
 411af24: 6d1723e9     	stp	d9, d8, [sp, #0x170]
 411af28: a9186ffc     	stp	x28, x27, [sp, #0x180]
 411af2c: a91957f6     	stp	x22, x21, [sp, #0x190]
 411af30: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
 411af34: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
 411af38: 9106c3fd     	add	x29, sp, #0x1b0
 411af3c: aa0103f3     	mov	x19, x1
 411af40: aa0003f4     	mov	x20, x0
 411af44: 925e7428     	and	x8, x1, #0xfffffffc00000000
 411af48: 900554d6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 411af4c: f94046c9     	ldr	x9, [x22, #0x88]
 411af50: eb09011f     	cmp	x8, x9
 411af54: 540012c0     	b.eq	0x411b1ac <_ChromeMain+0x4115f10>
 411af58: b4000453     	cbz	x19, 0x411afe0 <_ChromeMain+0x4115d44>
 411af5c: f9406275     	ldr	x21, [x19, #0xc0]
 411af60: f94002a8     	ldr	x8, [x21]
 411af64: f9401508     	ldr	x8, [x8, #0x28]
 411af68: f0fe5c29     	adrp	x9, 0xca1000 <_ChromeMain+0xc9bd64>
 411af6c: 911a2129     	add	x9, x9, #0x688
 411af70: eb09011f     	cmp	x8, x9
 411af74: 54000ea1     	b.ne	0x411b148 <_ChromeMain+0x4115eac>
 411af78: 395d02a8     	ldrb	w8, [x21, #0x740]
 411af7c: 35000f28     	cbnz	w8, 0x411b160 <_ChromeMain+0x4115ec4>
 411af80: a94326aa     	ldp	x10, x9, [x21, #0x30]
 411af84: 91002128     	add	x8, x9, #0x8
 411af88: eb0a011f     	cmp	x8, x10
 411af8c: 54000f68     	b.hi	0x411b178 <_ChromeMain+0x4115edc>
 411af90: eb09014a     	subs	x10, x10, x9
 411af94: fa472940     	ccmp	x10, #0x7, #0x0, hs
 411af98: 54001049     	b.ls	0x411b1a0 <_ChromeMain+0x4115f04>
 411af9c: f94016aa     	ldr	x10, [x21, #0x28]
 411afa0: 8b090140     	add	x0, x10, x9
 411afa4: f94022a9     	ldr	x9, [x21, #0x40]
 411afa8: 91000529     	add	x9, x9, #0x1
 411afac: a903a6a8     	stp	x8, x9, [x21, #0x38]
 411afb0: 52800388     	mov	w8, #0x1c               ; =28
 411afb4: 39000008     	strb	w8, [x0]
 411afb8: b94062a8     	ldr	w8, [x21, #0x60]
 411afbc: 11000508     	add	w8, w8, #0x1
 411afc0: b90062a8     	str	w8, [x21, #0x60]
 411afc4: b946d2a8     	ldr	w8, [x21, #0x6d0]
 411afc8: 11000508     	add	w8, w8, #0x1
 411afcc: b906d2a8     	str	w8, [x21, #0x6d0]
 411afd0: f9435aa8     	ldr	x8, [x21, #0x6b0]
 411afd4: b9405909     	ldr	w9, [x8, #0x58]
 411afd8: 11000529     	add	w9, w9, #0x1
 411afdc: b9005909     	str	w9, [x8, #0x58]
 411afe0: 6f00e400     	movi.2d	v0, #0000000000000000
 411afe4: f90093ff     	str	xzr, [sp, #0x120]
 411afe8: ad0803e0     	stp	q0, q0, [sp, #0x100]
 411afec: ad0703e0     	stp	q0, q0, [sp, #0xe0]
 411aff0: ad0603e0     	stp	q0, q0, [sp, #0xc0]
 411aff4: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 411aff8: 0f03f608     	fmov.2s	v8, #1.00000000
 411affc: fd41fe80     	ldr	d0, [x20, #0x3f8]
 411b000: 9004f188     	adrp	x8, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 411b004: fd473901     	ldr	d1, [x8, #0xe70]
 411b008: 1e610800     	fmul	d0, d0, d1
 411b00c: fd0057e8     	str	d8, [sp, #0xa8]
 411b010: 910283e0     	add	x0, sp, #0xa0
 411b014: 97754f33     	bl	0x1e6ece0 <_ChromeMain+0x1e69a44>
 411b018: fd40e280     	ldr	d0, [x20, #0x1c0]
 411b01c: 6f00e401     	movi.2d	v1, #0000000000000000
 411b020: ad0087e1     	stp	q1, q1, [sp, #0x10]
 411b024: ad0187e1     	stp	q1, q1, [sp, #0x30]
 411b028: ad0287e1     	stp	q1, q1, [sp, #0x50]
 411b02c: ad0387e1     	stp	q1, q1, [sp, #0x70]
 411b030: f9004bff     	str	xzr, [sp, #0x90]
 411b034: fd000fe8     	str	d8, [sp, #0x18]
 411b038: 0f3fe400     	scvtf.2s	v0, v0, #0x1
 411b03c: 3d8003e0     	str	q0, [sp]
 411b040: 5e0c0401     	mov	s1, v0[1]
 411b044: 910043e0     	add	x0, sp, #0x10
 411b048: 97859ff6     	bl	0x2283020 <_ChromeMain+0x227dd84>
 411b04c: 910043e0     	add	x0, sp, #0x10
 411b050: 910283e1     	add	x1, sp, #0xa0
 411b054: 973681da     	bl	0xebb7bc <_ChromeMain+0xeb6520>
 411b058: 3dc003e0     	ldr	q0, [sp]
 411b05c: 2ea0f800     	fneg.2s	v0, v0
 411b060: 5e0c0401     	mov	s1, v0[1]
 411b064: 910043e0     	add	x0, sp, #0x10
 411b068: 97859fee     	bl	0x2283020 <_ChromeMain+0x227dd84>
 411b06c: f9406275     	ldr	x21, [x19, #0xc0]
 411b070: d10203a8     	sub	x8, x29, #0x80
 411b074: 910043e0     	add	x0, sp, #0x10
 411b078: 97904e14     	bl	0x252e8c8 <_ChromeMain+0x252962c>
 411b07c: f94002a8     	ldr	x8, [x21]
 411b080: f9404508     	ldr	x8, [x8, #0x88]
 411b084: d10203a1     	sub	x1, x29, #0x80
 411b088: aa1503e0     	mov	x0, x21
 411b08c: d63f0100     	blr	x8
 411b090: aa1403e0     	mov	x0, x20
 411b094: aa1303e1     	mov	x1, x19
 411b098: 9764276a     	bl	0x1a24e40 <_ChromeMain+0x1a1fba4>
 411b09c: b40003d3     	cbz	x19, 0x411b114 <_ChromeMain+0x4115e78>
 411b0a0: f9406274     	ldr	x20, [x19, #0xc0]
 411b0a4: f9400288     	ldr	x8, [x20]
 411b0a8: f9402d08     	ldr	x8, [x8, #0x58]
 411b0ac: f0fe7b89     	adrp	x9, 0x108e000 <_ChromeMain+0x1088d64>
 411b0b0: 91258129     	add	x9, x9, #0x960
 411b0b4: eb09011f     	cmp	x8, x9
 411b0b8: 540004e1     	b.ne	0x411b154 <_ChromeMain+0x4115eb8>
 411b0bc: a943268a     	ldp	x10, x9, [x20, #0x30]
 411b0c0: 91002128     	add	x8, x9, #0x8
 411b0c4: eb0a011f     	cmp	x8, x10
 411b0c8: 54000508     	b.hi	0x411b168 <_ChromeMain+0x4115ecc>
 411b0cc: eb09014a     	subs	x10, x10, x9
 411b0d0: 540005c3     	b.lo	0x411b188 <_ChromeMain+0x4115eec>
 411b0d4: f1001d5f     	cmp	x10, #0x7
 411b0d8: 54000589     	b.ls	0x411b188 <_ChromeMain+0x4115eec>
 411b0dc: f940168a     	ldr	x10, [x20, #0x28]
 411b0e0: 8b090140     	add	x0, x10, x9
 411b0e4: f9402289     	ldr	x9, [x20, #0x40]
 411b0e8: 91000529     	add	x9, x9, #0x1
 411b0ec: a903a688     	stp	x8, x9, [x20, #0x38]
 411b0f0: 52800348     	mov	w8, #0x1a               ; =26
 411b0f4: 39000008     	strb	w8, [x0]
 411b0f8: b9406288     	ldr	w8, [x20, #0x60]
 411b0fc: 51000508     	sub	w8, w8, #0x1
 411b100: b9006288     	str	w8, [x20, #0x60]
 411b104: 9101c280     	add	x0, x20, #0x70
 411b108: 96fc3883     	bl	0x29314 <_ChromeMain+0x24078>
 411b10c: 395d0288     	ldrb	w8, [x20, #0x740]
 411b110: 35000188     	cbnz	w8, 0x411b140 <_ChromeMain+0x4115ea4>
 411b114: 925e7668     	and	x8, x19, #0xfffffffc00000000
 411b118: f94046c9     	ldr	x9, [x22, #0x88]
 411b11c: eb09011f     	cmp	x8, x9
 411b120: 540003a0     	b.eq	0x411b194 <_ChromeMain+0x4115ef8>
 411b124: a95b7bfd     	ldp	x29, x30, [sp, #0x1b0]
 411b128: a95a4ff4     	ldp	x20, x19, [sp, #0x1a0]
 411b12c: a95957f6     	ldp	x22, x21, [sp, #0x190]
 411b130: a9586ffc     	ldp	x28, x27, [sp, #0x180]
 411b134: 6d5723e9     	ldp	d9, d8, [sp, #0x170]
 411b138: 910703ff     	add	sp, sp, #0x1c0
 411b13c: d65f03c0     	ret
 411b140: 391d029f     	strb	wzr, [x20, #0x740]
 411b144: 17fffff4     	b	0x411b114 <_ChromeMain+0x4115e78>
 411b148: aa1503e0     	mov	x0, x21
 411b14c: d63f0100     	blr	x8
 411b150: 17ffffa4     	b	0x411afe0 <_ChromeMain+0x4115d44>
 411b154: aa1403e0     	mov	x0, x20
 411b158: d63f0100     	blr	x8
 411b15c: 17ffffee     	b	0x411b114 <_ChromeMain+0x4115e78>
 411b160: 391d02bf     	strb	wzr, [x21, #0x740]
 411b164: 17ffff87     	b	0x411af80 <_ChromeMain+0x4115ce4>
 411b168: 91006280     	add	x0, x20, #0x18
 411b16c: 52800101     	mov	w1, #0x8                ; =8
 411b170: 96ff41f4     	bl	0xeb940 <_ChromeMain+0xe66a4>
 411b174: 17ffffdf     	b	0x411b0f0 <_ChromeMain+0x4115e54>
 411b178: 910062a0     	add	x0, x21, #0x18
 411b17c: 52800101     	mov	w1, #0x8                ; =8
 411b180: 96ff41f0     	bl	0xeb940 <_ChromeMain+0xe66a4>
 411b184: 17ffff8b     	b	0x411afb0 <_ChromeMain+0x4115d14>
 411b188: d4200000     	brk	#0
 411b18c: d4400000     	hlt	#0
 411b190: d4200020     	brk	#0x1
 411b194: aa1303e0     	mov	x0, x19
 411b198: 96fc1e29     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 411b19c: 17ffffe2     	b	0x411b124 <_ChromeMain+0x4115e88>
 411b1a0: d4200000     	brk	#0
 411b1a4: d4400000     	hlt	#0
 411b1a8: d4200020     	brk	#0x1
 411b1ac: aa1303e0     	mov	x0, x19
 411b1b0: 96fbe453     	bl	0x142fc <_ChromeMain+0xf060>
 411b1b4: b5ffed53     	cbnz	x19, 0x411af5c <_ChromeMain+0x4115cc0>
 411b1b8: 17ffff8a     	b	0x411afe0 <_ChromeMain+0x4115d44>
 411b1bc: d10e0000     	sub	x0, x0, #0x380
 411b1c0: 171217ef     	b	0x5a117c <_ChromeMain+0x59bee0>
