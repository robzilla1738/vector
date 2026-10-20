
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4606940: d101c3ff     	sub	sp, sp, #0x70
 4606944: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4606948: a90457f6     	stp	x22, x21, [sp, #0x40]
 460694c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4606950: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4606954: 910183fd     	add	x29, sp, #0x60
 4606958: aa0003f4     	mov	x20, x0
 460695c: aa0803f3     	mov	x19, x8
 4606960: f9400028     	ldr	x8, [x1]
 4606964: f90017e8     	str	x8, [sp, #0x28]
 4606968: 9100a3e1     	add	x1, sp, #0x28
 460696c: 9743a5dd     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 4606970: 39558289     	ldrb	w9, [x20, #0x560]
 4606974: f941b688     	ldr	x8, [x20, #0x368]
 4606978: 360004a9     	tbz	w9, #0x0, 0x4606a0c <_ChromeMain+0x4601770>
 460697c: b100051f     	cmn	x8, #0x1
 4606980: 54000420     	b.eq	0x4606a04 <_ChromeMain+0x4601768>
 4606984: d2800015     	mov	x21, #0x0               ; =0
 4606988: d2800016     	mov	x22, #0x0               ; =0
 460698c: 91000517     	add	x23, x8, #0x1
 4606990: 9004c9a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4606994: 3dc01100     	ldr	q0, [x8, #0x40]
 4606998: 3d8003e0     	str	q0, [sp]
 460699c: 12b00018     	mov	w24, #0x7fffffff        ; =2147483647
 46069a0: aa1403e0     	mov	x0, x20
 46069a4: aa1603e1     	mov	x1, x22
 46069a8: 94000622     	bl	0x4608230 <_ChromeMain+0x4602f94>
 46069ac: 4e080c00     	dup.2d	v0, x0
 46069b0: 3dc003e2     	ldr	q2, [sp]
 46069b4: 6ee24400     	ushl.2d	v0, v0, v2
 46069b8: 0ea12800     	xtn.2s	v0, v0
 46069bc: 4e080c21     	dup.2d	v1, x1
 46069c0: 6ee24421     	ushl.2d	v1, v1, v2
 46069c4: 0ea12821     	xtn.2s	v1, v1
 46069c8: 2f211421     	usra.2s	v1, v1, #0x1f
 46069cc: 0f3f0421     	sshr.2s	v1, v1, #0x1
 46069d0: fd4017e2     	ldr	d2, [sp, #0x28]
 46069d4: 2ea08440     	sub.2s	v0, v2, v0
 46069d8: 2ea18400     	sub.2s	v0, v0, v1
 46069dc: 0ea0b800     	abs.2s	v0, v0
 46069e0: 0ea0bc00     	addp.2s	v0, v0, v0
 46069e4: 1e260008     	fmov	w8, s0
 46069e8: 6b18011f     	cmp	w8, w24
 46069ec: 1a98b118     	csel	w24, w8, w24, lt
 46069f0: 9a95b2d5     	csel	x21, x22, x21, lt
 46069f4: 910006d6     	add	x22, x22, #0x1
 46069f8: eb1602ff     	cmp	x23, x22
 46069fc: 54fffd21     	b.ne	0x46069a0 <_ChromeMain+0x4601704>
 4606a00: 1400002e     	b	0x4606ab8 <_ChromeMain+0x460181c>
 4606a04: d2800015     	mov	x21, #0x0               ; =0
 4606a08: 1400002c     	b	0x4606ab8 <_ChromeMain+0x460181c>
 4606a0c: f902ae88     	str	x8, [x20, #0x558]
 4606a10: 52800029     	mov	w9, #0x1                ; =1
 4606a14: 39158289     	strb	w9, [x20, #0x560]
 4606a18: 39155289     	strb	w9, [x20, #0x554]
 4606a1c: b100051f     	cmn	x8, #0x1
 4606a20: 54000460     	b.eq	0x4606aac <_ChromeMain+0x4601810>
 4606a24: d2800015     	mov	x21, #0x0               ; =0
 4606a28: d2800016     	mov	x22, #0x0               ; =0
 4606a2c: 91000517     	add	x23, x8, #0x1
 4606a30: 9004c9a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4606a34: 3dc01100     	ldr	q0, [x8, #0x40]
 4606a38: 3d8003e0     	str	q0, [sp]
 4606a3c: 12b00018     	mov	w24, #0x7fffffff        ; =2147483647
 4606a40: aa1403e0     	mov	x0, x20
 4606a44: aa1603e1     	mov	x1, x22
 4606a48: 940005fa     	bl	0x4608230 <_ChromeMain+0x4602f94>
 4606a4c: 4e080c00     	dup.2d	v0, x0
 4606a50: 3dc003e2     	ldr	q2, [sp]
 4606a54: 6ee24400     	ushl.2d	v0, v0, v2
 4606a58: 0ea12800     	xtn.2s	v0, v0
 4606a5c: 4e080c21     	dup.2d	v1, x1
 4606a60: 6ee24421     	ushl.2d	v1, v1, v2
 4606a64: 0ea12821     	xtn.2s	v1, v1
 4606a68: 2f211421     	usra.2s	v1, v1, #0x1f
 4606a6c: 0f3f0421     	sshr.2s	v1, v1, #0x1
 4606a70: fd4017e2     	ldr	d2, [sp, #0x28]
 4606a74: 2ea08440     	sub.2s	v0, v2, v0
 4606a78: 2ea18400     	sub.2s	v0, v0, v1
 4606a7c: 0ea0b800     	abs.2s	v0, v0
 4606a80: 0ea0bc00     	addp.2s	v0, v0, v0
 4606a84: 1e260008     	fmov	w8, s0
 4606a88: 6b18011f     	cmp	w8, w24
 4606a8c: 1a98b118     	csel	w24, w8, w24, lt
 4606a90: 9a95b2d5     	csel	x21, x22, x21, lt
 4606a94: 910006d6     	add	x22, x22, #0x1
 4606a98: eb1602ff     	cmp	x23, x22
 4606a9c: 54fffd21     	b.ne	0x4606a40 <_ChromeMain+0x46017a4>
 4606aa0: 39558288     	ldrb	w8, [x20, #0x560]
 4606aa4: 34000088     	cbz	w8, 0x4606ab4 <_ChromeMain+0x4601818>
 4606aa8: 14000002     	b	0x4606ab0 <_ChromeMain+0x4601814>
 4606aac: d2800015     	mov	x21, #0x0               ; =0
 4606ab0: 3915829f     	strb	wzr, [x20, #0x560]
 4606ab4: 3915529f     	strb	wzr, [x20, #0x554]
 4606ab8: 52800036     	mov	w22, #0x1               ; =1
 4606abc: aa1403e0     	mov	x0, x20
 4606ac0: aa1503e1     	mov	x1, x21
 4606ac4: 52800022     	mov	w2, #0x1                ; =1
 4606ac8: 94000016     	bl	0x4606b20 <_ChromeMain+0x4601884>
 4606acc: 39558288     	ldrb	w8, [x20, #0x560]
 4606ad0: 35000088     	cbnz	w8, 0x4606ae0 <_ChromeMain+0x4601844>
 4606ad4: d2800001     	mov	x1, #0x0                ; =0
 4606ad8: d2800000     	mov	x0, #0x0                ; =0
 4606adc: 14000004     	b	0x4606aec <_ChromeMain+0x4601850>
 4606ae0: f942ae81     	ldr	x1, [x20, #0x558]
 4606ae4: aa1403e0     	mov	x0, x20
 4606ae8: 940005d2     	bl	0x4608230 <_ChromeMain+0x4602f94>
 4606aec: a90187e0     	stp	x0, x1, [sp, #0x18]
 4606af0: 910063e1     	add	x1, sp, #0x18
 4606af4: aa1403e0     	mov	x0, x20
 4606af8: 95835044     	bl	0xa6dac08 <_ChromeMain+0xa6d596c>
 4606afc: 3cc183e0     	ldur	q0, [sp, #0x18]
 4606b00: 3d800260     	str	q0, [x19]
 4606b04: 39004276     	strb	w22, [x19, #0x10]
 4606b08: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4606b0c: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4606b10: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4606b14: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4606b18: 9101c3ff     	add	sp, sp, #0x70
 4606b1c: d65f03c0     	ret
