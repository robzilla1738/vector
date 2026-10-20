
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2132a58: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 2132a5c: a90157f6     	stp	x22, x21, [sp, #0x10]
 2132a60: a9024ff4     	stp	x20, x19, [sp, #0x20]
 2132a64: a9037bfd     	stp	x29, x30, [sp, #0x30]
 2132a68: 9100c3fd     	add	x29, sp, #0x30
 2132a6c: aa0003f4     	mov	x20, x0
 2132a70: b9400008     	ldr	w8, [x0]
 2132a74: 71000d1f     	cmp	w8, #0x3
 2132a78: 54000069     	b.ls	0x2132a84 <_ChromeMain+0x212d7e8>
 2132a7c: d2800013     	mov	x19, #0x0               ; =0
 2132a80: 1400000f     	b	0x2132abc <_ChromeMain+0x212d820>
 2132a84: 90064389     	adrp	x9, 0xe9a2000 <dyld_stub_binder+0xe9a2000>
 2132a88: 910d8129     	add	x9, x9, #0x360
 2132a8c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 2132a90: f9400100     	ldr	x0, [x8]
 2132a94: 95b0b829     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 2132a98: f9400682     	ldr	x2, [x20, #0x8]
 2132a9c: 6f00e400     	movi.2d	v0, #0000000000000000
 2132aa0: 6f00e401     	movi.2d	v1, #0000000000000000
 2132aa4: 1e6e1002     	fmov	d2, #1.00000000
 2132aa8: 1e6e1003     	fmov	d3, #1.00000000
 2132aac: 52800043     	mov	w3, #0x2                ; =2
 2132ab0: 52800004     	mov	w4, #0x0                ; =0
 2132ab4: 95fffcdd     	bl	0xa131e28 <_ChromeMain+0xa12cb8c>
 2132ab8: aa0003f3     	mov	x19, x0
 2132abc: aa1303e0     	mov	x0, x19
 2132ac0: 52800002     	mov	w2, #0x0                ; =0
 2132ac4: 95fff880     	bl	0xa130cc4 <_ChromeMain+0xa12ba28>
 2132ac8: 39404288     	ldrb	w8, [x20, #0x10]
 2132acc: 34000088     	cbz	w8, 0x2132adc <_ChromeMain+0x212d840>
 2132ad0: aa1303e0     	mov	x0, x19
 2132ad4: 52800022     	mov	w2, #0x1                ; =1
 2132ad8: 95fffcd7     	bl	0xa131e34 <_ChromeMain+0xa12cb98>
 2132adc: 39404688     	ldrb	w8, [x20, #0x11]
 2132ae0: 34000088     	cbz	w8, 0x2132af0 <_ChromeMain+0x212d854>
 2132ae4: aa1303e0     	mov	x0, x19
 2132ae8: 52800022     	mov	w2, #0x1                ; =1
 2132aec: 95fffcd5     	bl	0xa131e40 <_ChromeMain+0xa12cba4>
 2132af0: 39404a88     	ldrb	w8, [x20, #0x12]
 2132af4: 34000088     	cbz	w8, 0x2132b04 <_ChromeMain+0x212d868>
 2132af8: aa1303e0     	mov	x0, x19
 2132afc: 52800062     	mov	w2, #0x3                ; =3
 2132b00: 95fffcd3     	bl	0xa131e4c <_ChromeMain+0xa12cbb0>
 2132b04: 39404e82     	ldrb	w2, [x20, #0x13]
 2132b08: aa1303e0     	mov	x0, x19
 2132b0c: 95fffcd3     	bl	0xa131e58 <_ChromeMain+0xa12cbbc>
