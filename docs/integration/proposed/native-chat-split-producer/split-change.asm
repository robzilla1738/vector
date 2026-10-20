
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4647a28: d10143ff     	sub	sp, sp, #0x50
 4647a2c: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4647a30: a90257f6     	stp	x22, x21, [sp, #0x20]
 4647a34: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4647a38: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4647a3c: 910103fd     	add	x29, sp, #0x40
 4647a40: aa0003f3     	mov	x19, x0
 4647a44: 396e4008     	ldrb	w8, [x0, #0xb90]
 4647a48: 350001c8     	cbnz	w8, 0x4647a80 <_ChromeMain+0x46427e4>
 4647a4c: b9401828     	ldr	w8, [x1, #0x18]
 4647a50: 71000d1f     	cmp	w8, #0x3
 4647a54: 540007a0     	b.eq	0x4647b48 <_ChromeMain+0x46428ac>
 4647a58: 7100091f     	cmp	w8, #0x2
 4647a5c: 54000280     	b.eq	0x4647aac <_ChromeMain+0x4642810>
 4647a60: 35000168     	cbnz	w8, 0x4647a8c <_ChromeMain+0x46427f0>
 4647a64: f9401028     	ldr	x8, [x1, #0x20]
 4647a68: f9400909     	ldr	x9, [x8, #0x10]
 4647a6c: d37ced34     	lsl	x20, x9, #4
 4647a70: b40000f4     	cbz	x20, 0x4647a8c <_ChromeMain+0x46427f0>
 4647a74: f9400515     	ldr	x21, [x8, #0x8]
 4647a78: 52821b16     	mov	w22, #0x10d8            ; =4312
 4647a7c: 14000030     	b	0x4647b3c <_ChromeMain+0x46428a0>
 4647a80: 52800028     	mov	w8, #0x1                ; =1
 4647a84: 392e4668     	strb	w8, [x19, #0xb91]
 4647a88: 14000003     	b	0x4647a94 <_ChromeMain+0x46427f8>
 4647a8c: aa1303e0     	mov	x0, x19
 4647a90: 97ff91be     	bl	0x462c188 <_ChromeMain+0x4626eec>
 4647a94: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4647a98: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4647a9c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4647aa0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4647aa4: 910143ff     	add	sp, sp, #0x50
 4647aa8: d65f03c0     	ret
 4647aac: f9401034     	ldr	x20, [x1, #0x20]
 4647ab0: f9400a88     	ldr	x8, [x20, #0x10]
 4647ab4: d37ced09     	lsl	x9, x8, #4
 4647ab8: b40000c9     	cbz	x9, 0x4647ad0 <_ChromeMain+0x4642834>
 4647abc: f9400695     	ldr	x21, [x20, #0x8]
 4647ac0: 8b0812b6     	add	x22, x21, x8, lsl #4
 4647ac4: 52821b17     	mov	w23, #0x10d8            ; =4312
 4647ac8: 52800098     	mov	w24, #0x4               ; =4
 4647acc: 14000036     	b	0x4647ba4 <_ChromeMain+0x4642908>
 4647ad0: f9401688     	ldr	x8, [x20, #0x28]
 4647ad4: d37ced15     	lsl	x21, x8, #4
 4647ad8: b4fffdb5     	cbz	x21, 0x4647a8c <_ChromeMain+0x46427f0>
 4647adc: f9401294     	ldr	x20, [x20, #0x20]
 4647ae0: 52821b16     	mov	w22, #0x10d8            ; =4312
 4647ae4: 1400000a     	b	0x4647b0c <_ChromeMain+0x4642870>
 4647ae8: b9401108     	ldr	w8, [x8, #0x10]
 4647aec: b9000be8     	str	w8, [sp, #0x8]
 4647af0: 8b160260     	add	x0, x19, x22
 4647af4: 910023e1     	add	x1, sp, #0x8
 4647af8: 910023e2     	add	x2, sp, #0x8
 4647afc: 9498fc89     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 4647b00: 91004294     	add	x20, x20, #0x10
 4647b04: f10042b5     	subs	x21, x21, #0x10
 4647b08: 54fffc20     	b.eq	0x4647a8c <_ChromeMain+0x46427f0>
 4647b0c: f9400288     	ldr	x8, [x20]
 4647b10: b5fffec8     	cbnz	x8, 0x4647ae8 <_ChromeMain+0x464284c>
 4647b14: 17fffffb     	b	0x4647b00 <_ChromeMain+0x4642864>
 4647b18: b9401108     	ldr	w8, [x8, #0x10]
 4647b1c: b9000fe8     	str	w8, [sp, #0xc]
 4647b20: 8b160260     	add	x0, x19, x22
 4647b24: 910033e1     	add	x1, sp, #0xc
 4647b28: 910033e2     	add	x2, sp, #0xc
 4647b2c: 9498fc7d     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 4647b30: 910042b5     	add	x21, x21, #0x10
 4647b34: f1004294     	subs	x20, x20, #0x10
 4647b38: 54fffaa0     	b.eq	0x4647a8c <_ChromeMain+0x46427f0>
 4647b3c: f94002a8     	ldr	x8, [x21]
 4647b40: b5fffec8     	cbnz	x8, 0x4647b18 <_ChromeMain+0x464287c>
 4647b44: 17fffffb     	b	0x4647b30 <_ChromeMain+0x4642894>
 4647b48: f9401029     	ldr	x9, [x1, #0x20]
 4647b4c: f9400928     	ldr	x8, [x9, #0x10]
 4647b50: d37ced0a     	lsl	x10, x8, #4
 4647b54: b4fff9ca     	cbz	x10, 0x4647a8c <_ChromeMain+0x46427f0>
 4647b58: f9400534     	ldr	x20, [x9, #0x8]
 4647b5c: 8b081295     	add	x21, x20, x8, lsl #4
 4647b60: 52821b16     	mov	w22, #0x10d8            ; =4312
 4647b64: 52800097     	mov	w23, #0x4               ; =4
 4647b68: 14000030     	b	0x4647c28 <_ChromeMain+0x464298c>
 4647b6c: aa0903e1     	mov	x1, x9
 4647b70: 8b0a0929     	add	x9, x9, x10, lsl #2
 4647b74: aa0103e2     	mov	x2, x1
 4647b78: eb09003f     	cmp	x1, x9
 4647b7c: 540000a0     	b.eq	0x4647b90 <_ChromeMain+0x46428f4>
 4647b80: b9400029     	ldr	w9, [x1]
 4647b84: 6b09011f     	cmp	w8, w9
 4647b88: 9a98b3e8     	csel	x8, xzr, x24, lt
 4647b8c: 8b080022     	add	x2, x1, x8
 4647b90: 8b170260     	add	x0, x19, x23
 4647b94: 94194767     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4647b98: 910042b5     	add	x21, x21, #0x10
 4647b9c: eb1602bf     	cmp	x21, x22
 4647ba0: 54fff980     	b.eq	0x4647ad0 <_ChromeMain+0x4642834>
 4647ba4: f94002a8     	ldr	x8, [x21]
 4647ba8: b4ffff88     	cbz	x8, 0x4647b98 <_ChromeMain+0x46428fc>
 4647bac: b9401108     	ldr	w8, [x8, #0x10]
 4647bb0: f9486e69     	ldr	x9, [x19, #0x10d8]
 4647bb4: f948726a     	ldr	x10, [x19, #0x10e0]
 4647bb8: d37ef54b     	lsl	x11, x10, #2
 4647bbc: b4fffd8b     	cbz	x11, 0x4647b6c <_ChromeMain+0x46428d0>
 4647bc0: 9342fd6b     	asr	x11, x11, #2
 4647bc4: aa0903e1     	mov	x1, x9
 4647bc8: d341fd6c     	lsr	x12, x11, #1
 4647bcc: 8b0c082d     	add	x13, x1, x12, lsl #2
 4647bd0: b84045ae     	ldr	w14, [x13], #0x4
 4647bd4: aa6b07ef     	mvn	x15, x11, lsr #1
 4647bd8: 8b0f016b     	add	x11, x11, x15
 4647bdc: 6b0801df     	cmp	w14, w8
 4647be0: 9a8cb16b     	csel	x11, x11, x12, lt
 4647be4: 9a81b1a1     	csel	x1, x13, x1, lt
 4647be8: b5ffff0b     	cbnz	x11, 0x4647bc8 <_ChromeMain+0x464292c>
 4647bec: 17ffffe1     	b	0x4647b70 <_ChromeMain+0x46428d4>
 4647bf0: aa0903e1     	mov	x1, x9
 4647bf4: 8b0a0929     	add	x9, x9, x10, lsl #2
 4647bf8: aa0103e2     	mov	x2, x1
 4647bfc: eb09003f     	cmp	x1, x9
 4647c00: 540000a0     	b.eq	0x4647c14 <_ChromeMain+0x4642978>
 4647c04: b9400029     	ldr	w9, [x1]
 4647c08: 6b09011f     	cmp	w8, w9
 4647c0c: 9a97b3e8     	csel	x8, xzr, x23, lt
 4647c10: 8b080022     	add	x2, x1, x8
 4647c14: 8b160260     	add	x0, x19, x22
 4647c18: 94194746     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4647c1c: 91004294     	add	x20, x20, #0x10
 4647c20: eb15029f     	cmp	x20, x21
 4647c24: 54fff340     	b.eq	0x4647a8c <_ChromeMain+0x46427f0>
 4647c28: f9400288     	ldr	x8, [x20]
 4647c2c: b4ffff88     	cbz	x8, 0x4647c1c <_ChromeMain+0x4642980>
 4647c30: b9401108     	ldr	w8, [x8, #0x10]
 4647c34: f9486e69     	ldr	x9, [x19, #0x10d8]
 4647c38: f948726a     	ldr	x10, [x19, #0x10e0]
 4647c3c: d37ef54b     	lsl	x11, x10, #2
 4647c40: b4fffd8b     	cbz	x11, 0x4647bf0 <_ChromeMain+0x4642954>
 4647c44: 9342fd6b     	asr	x11, x11, #2
 4647c48: aa0903e1     	mov	x1, x9
 4647c4c: d341fd6c     	lsr	x12, x11, #1
 4647c50: 8b0c082d     	add	x13, x1, x12, lsl #2
 4647c54: b84045ae     	ldr	w14, [x13], #0x4
 4647c58: aa6b07ef     	mvn	x15, x11, lsr #1
 4647c5c: 8b0f016b     	add	x11, x11, x15
 4647c60: 6b0801df     	cmp	w14, w8
 4647c64: 9a8cb16b     	csel	x11, x11, x12, lt
 4647c68: 9a81b1a1     	csel	x1, x13, x1, lt
 4647c6c: b5ffff0b     	cbnz	x11, 0x4647c4c <_ChromeMain+0x46429b0>
 4647c70: 17ffffe1     	b	0x4647bf4 <_ChromeMain+0x4642958>
 4647c74: d1150000     	sub	x0, x0, #0x540
 4647c78: 17ffff6c     	b	0x4647a28 <_ChromeMain+0x464278c>
