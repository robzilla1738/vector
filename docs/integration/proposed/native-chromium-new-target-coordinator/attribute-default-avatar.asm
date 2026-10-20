
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2ba1a30: d101c3ff     	sub	sp, sp, #0x70
 2ba1a34: a9035ff8     	stp	x24, x23, [sp, #0x30]
 2ba1a38: a90457f6     	stp	x22, x21, [sp, #0x40]
 2ba1a3c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 2ba1a40: a9067bfd     	stp	x29, x30, [sp, #0x60]
 2ba1a44: 910183fd     	add	x29, sp, #0x60
 2ba1a48: aa0203f5     	mov	x21, x2
 2ba1a4c: aa0103f3     	mov	x19, x1
 2ba1a50: aa0003f4     	mov	x20, x0
 2ba1a54: f9400800     	ldr	x0, [x0, #0x10]
 2ba1a58: aa0203f7     	mov	x23, x2
 2ba1a5c: b40002a0     	cbz	x0, 0x2ba1ab0 <_ChromeMain+0x2b9c814>
 2ba1a60: d0051ac1     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 2ba1a64: 9118b421     	add	x1, x1, #0x62d
 2ba1a68: 52800242     	mov	w2, #0x12               ; =18
 2ba1a6c: 97540a27     	bl	0xa4308 <_ChromeMain+0x9f06c>
 2ba1a70: 39811e82     	ldrsb	x2, [x20, #0x47]
 2ba1a74: b7f80682     	tbnz	x2, #0x3f, 0x2ba1b44 <_ChromeMain+0x2b9c8a8>
 2ba1a78: 9100c281     	add	x1, x20, #0x30
 2ba1a7c: 9776f371     	bl	0x95e840 <_ChromeMain+0x9595a4>
 2ba1a80: aa1503f7     	mov	x23, x21
 2ba1a84: b4000160     	cbz	x0, 0x2ba1ab0 <_ChromeMain+0x2b9c814>
 2ba1a88: b40005d3     	cbz	x19, 0x2ba1b40 <_ChromeMain+0x2b9c8a4>
 2ba1a8c: aa0003f6     	mov	x22, x0
 2ba1a90: aa1303e0     	mov	x0, x19
 2ba1a94: 95518642     	bl	0x800339c <_ChromeMain+0x7ffe100>
 2ba1a98: aa0003e2     	mov	x2, x0
 2ba1a9c: aa1603e0     	mov	x0, x22
 2ba1aa0: aa1303e1     	mov	x1, x19
 2ba1aa4: 978efbc7     	bl	0xf609c0 <_ChromeMain+0xf5b724>
 2ba1aa8: aa1503f7     	mov	x23, x21
 2ba1aac: b5000500     	cbnz	x0, 0x2ba1b4c <_ChromeMain+0x2b9c8b0>
 2ba1ab0: 390023f5     	strb	w21, [sp, #0x8]
 2ba1ab4: 52800028     	mov	w8, #0x1                ; =1
 2ba1ab8: 390083e8     	strb	w8, [sp, #0x20]
 2ba1abc: 910023e2     	add	x2, sp, #0x8
 2ba1ac0: aa1403e0     	mov	x0, x20
 2ba1ac4: aa1303e1     	mov	x1, x19
 2ba1ac8: 97e842a7     	bl	0x25b2564 <_ChromeMain+0x25ad2c8>
 2ba1acc: aa0003f3     	mov	x19, x0
 2ba1ad0: 394083e8     	ldrb	w8, [sp, #0x20]
 2ba1ad4: 7103fd1f     	cmp	w8, #0xff
 2ba1ad8: 54000060     	b.eq	0x2ba1ae4 <_ChromeMain+0x2b9c848>
 2ba1adc: 721e791f     	tst	w8, #0xfffffffd
 2ba1ae0: 540001e1     	b.ne	0x2ba1b1c <_ChromeMain+0x2b9c880>
 2ba1ae4: 0a1302e0     	and	w0, w23, w19
 2ba1ae8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 2ba1aec: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 2ba1af0: a94457f6     	ldp	x22, x21, [sp, #0x40]
 2ba1af4: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 2ba1af8: 9101c3ff     	add	sp, sp, #0x70
 2ba1afc: d65f03c0     	ret
 2ba1b00: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 2ba1b04: 36ffff08     	tbz	w8, #0x1f, 0x2ba1ae4 <_ChromeMain+0x2b9c848>
 2ba1b08: f94007e0     	ldr	x0, [sp, #0x8]
 2ba1b0c: f9400fe8     	ldr	x8, [sp, #0x18]
 2ba1b10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 2ba1b14: 97519ce9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2ba1b18: 17fffff3     	b	0x2ba1ae4 <_ChromeMain+0x2b9c848>
 2ba1b1c: 7100111f     	cmp	w8, #0x4
 2ba1b20: 54ffff00     	b.eq	0x2ba1b00 <_ChromeMain+0x2b9c864>
 2ba1b24: 9005e909     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 2ba1b28: 9121e129     	add	x9, x9, #0x878
 2ba1b2c: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 2ba1b30: 9100bfe0     	add	x0, sp, #0x2f
 2ba1b34: 910023e1     	add	x1, sp, #0x8
 2ba1b38: d63f0100     	blr	x8
 2ba1b3c: 17ffffea     	b	0x2ba1ae4 <_ChromeMain+0x2b9c848>
