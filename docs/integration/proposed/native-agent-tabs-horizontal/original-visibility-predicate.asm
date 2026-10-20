
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4685bc4: d10183ff     	sub	sp, sp, #0x60
 4685bc8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4685bcc: a90357f6     	stp	x22, x21, [sp, #0x30]
 4685bd0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4685bd4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4685bd8: 910143fd     	add	x29, sp, #0x50
 4685bdc: aa0003f3     	mov	x19, x0
 4685be0: f004cd08     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4685be4: f940f908     	ldr	x8, [x8, #0x1f0]
 4685be8: f9400108     	ldr	x8, [x8]
 4685bec: f9000fe8     	str	x8, [sp, #0x18]
 4685bf0: f9428414     	ldr	x20, [x0, #0x508]
 4685bf4: b40000b4     	cbz	x20, 0x4685c08 <_ChromeMain+0x468096c>
 4685bf8: f9400688     	ldr	x8, [x20, #0x8]
 4685bfc: b4000068     	cbz	x8, 0x4685c08 <_ChromeMain+0x468096c>
 4685c00: f9401109     	ldr	x9, [x8, #0x20]
 4685c04: b5000329     	cbnz	x9, 0x4685c68 <_ChromeMain+0x46809cc>
 4685c08: 3914a27f     	strb	wzr, [x19, #0x528]
 4685c0c: 3914e27f     	strb	wzr, [x19, #0x538]
 4685c10: b905427f     	str	wzr, [x19, #0x540]
 4685c14: f942ae60     	ldr	x0, [x19, #0x558]
 4685c18: b4000060     	cbz	x0, 0x4685c24 <_ChromeMain+0x4680988>
 4685c1c: 52800001     	mov	w1, #0x0                ; =0
 4685c20: 97965dda     	bl	0x2c1d388 <_ChromeMain+0x2c180ec>
 4685c24: f9400268     	ldr	x8, [x19]
 4685c28: f9405102     	ldr	x2, [x8, #0xa0]
 4685c2c: f9400fe8     	ldr	x8, [sp, #0x18]
 4685c30: f004cd09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4685c34: f940f929     	ldr	x9, [x9, #0x1f0]
 4685c38: f9400129     	ldr	x9, [x9]
 4685c3c: eb08013f     	cmp	x9, x8
 4685c40: 54000121     	b.ne	0x4685c64 <_ChromeMain+0x46809c8>
 4685c44: aa1303e0     	mov	x0, x19
 4685c48: 52800001     	mov	w1, #0x0                ; =0
 4685c4c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4685c50: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4685c54: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4685c58: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4685c5c: 910183ff     	add	sp, sp, #0x60
 4685c60: d61f0040     	br	x2
 4685c64: 94e5f9bf     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4685c68: d37cfd2a     	lsr	x10, x9, #60
 4685c6c: b5000d8a     	cbnz	x10, 0x4685e1c <_ChromeMain+0x4680b80>
 4685c70: f9400d16     	ldr	x22, [x8, #0x18]
 4685c74: d37ced37     	lsl	x23, x9, #4
 4685c78: aa1703e0     	mov	x0, x23
 4685c7c: 96e625bb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4685c80: aa0003f5     	mov	x21, x0
 4685c84: aa1603e1     	mov	x1, x22
 4685c88: aa1703e2     	mov	x2, x23
 4685c8c: 94e6101b     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4685c90: aa1703f8     	mov	x24, x23
 4685c94: aa1503f6     	mov	x22, x21
 4685c98: f9400680     	ldr	x0, [x20, #0x8]
 4685c9c: aa1603e1     	mov	x1, x22
 4685ca0: 94db0596     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4685ca4: b40000a0     	cbz	x0, 0x4685cb8 <_ChromeMain+0x4680a1c>
 4685ca8: f9405c08     	ldr	x8, [x0, #0xb8]
 4685cac: b4000068     	cbz	x8, 0x4685cb8 <_ChromeMain+0x4680a1c>
 4685cb0: 39404508     	ldrb	w8, [x8, #0x11]
 4685cb4: 370000c8     	tbnz	w8, #0x0, 0x4685ccc <_ChromeMain+0x4680a30>
 4685cb8: 910042d6     	add	x22, x22, #0x10
 4685cbc: f1004318     	subs	x24, x24, #0x10
 4685cc0: 54fffec1     	b.ne	0x4685c98 <_ChromeMain+0x46809fc>
 4685cc4: b4fffa35     	cbz	x21, 0x4685c08 <_ChromeMain+0x468096c>
 4685cc8: 14000057     	b	0x4685e24 <_ChromeMain+0x4680b88>
 4685ccc: 394002d8     	ldrb	w24, [x22]
 4685cd0: aa1603e8     	mov	x8, x22
 4685cd4: f8401d09     	ldr	x9, [x8, #0x1]!
 4685cd8: f90003e9     	str	x9, [sp]
 4685cdc: f94006c9     	ldr	x9, [x22, #0x8]
 4685ce0: f80073e9     	stur	x9, [sp, #0x7]
 4685ce4: 52800036     	mov	w22, #0x1               ; =1
 4685ce8: b5000a35     	cbnz	x21, 0x4685e2c <_ChromeMain+0x4680b90>
 4685cec: 9114a274     	add	x20, x19, #0x528
 4685cf0: 3914a278     	strb	w24, [x19, #0x528]
 4685cf4: 9114a669     	add	x9, x19, #0x529
 4685cf8: f940010a     	ldr	x10, [x8]
 4685cfc: f900012a     	str	x10, [x9]
 4685d00: f8407108     	ldur	x8, [x8, #0x7]
 4685d04: f9029a68     	str	x8, [x19, #0x530]
 4685d08: 3914e276     	strb	w22, [x19, #0x538]
 4685d0c: f9428676     	ldr	x22, [x19, #0x508]
 4685d10: b4fff816     	cbz	x22, 0x4685c10 <_ChromeMain+0x4680974>
 4685d14: f94006d5     	ldr	x21, [x22, #0x8]
 4685d18: b4fff7d5     	cbz	x21, 0x4685c10 <_ChromeMain+0x4680974>
 4685d1c: aa1503e0     	mov	x0, x21
 4685d20: aa1403e1     	mov	x1, x20
 4685d24: 94804357     	bl	0x6696a80 <_ChromeMain+0x66917e4>
 4685d28: f9400028     	ldr	x8, [x1]
 4685d2c: 910022a9     	add	x9, x21, #0x8
 4685d30: f100011f     	cmp	x8, #0x0
 4685d34: fa491104     	ccmp	x8, x9, #0x4, ne
 4685d38: 54fff6c0     	b.eq	0x4685c10 <_ChromeMain+0x4680974>
 4685d3c: f94006c0     	ldr	x0, [x22, #0x8]
 4685d40: aa1403e1     	mov	x1, x20
 4685d44: 94db056d     	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4685d48: b4fff640     	cbz	x0, 0x4685c10 <_ChromeMain+0x4680974>
 4685d4c: 949ddaba     	bl	0x6dfc834 <_ChromeMain+0x6df7598>
 4685d50: d360fc08     	lsr	x8, x0, #32
 4685d54: 6b080008     	subs	w8, w0, w8
 4685d58: 5a888500     	cneg	w0, w8, ls
 4685d5c: b9054260     	str	w0, [x19, #0x540]
 4685d60: 3954e268     	ldrb	w8, [x19, #0x538]
 4685d64: 34fff588     	cbz	w8, 0x4685c14 <_ChromeMain+0x4680978>
 4685d68: 7100001f     	cmp	w0, #0x0
 4685d6c: 54fff54d     	b.le	0x4685c14 <_ChromeMain+0x4680978>
 4685d70: f9429274     	ldr	x20, [x19, #0x520]
 4685d74: 910003f5     	mov	x21, sp
 4685d78: 910003e8     	mov	x8, sp
 4685d7c: 9736df77     	bl	0x143db58 <_ChromeMain+0x14388bc>
 4685d80: 39805fe8     	ldrsb	x8, [sp, #0x17]
 4685d84: a9402be9     	ldp	x9, x10, [sp]
 4685d88: f100011f     	cmp	x8, #0x0
 4685d8c: 9a954121     	csel	x1, x9, x21, mi
 4685d90: 7100011f     	cmp	w8, #0x0
 4685d94: 9a884142     	csel	x2, x10, x8, mi
 4685d98: f9400288     	ldr	x8, [x20]
 4685d9c: f941f108     	ldr	x8, [x8, #0x3e0]
 4685da0: aa1403e0     	mov	x0, x20
 4685da4: d63f0100     	blr	x8
 4685da8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4685dac: 36f800a8     	tbz	w8, #0x1f, 0x4685dc0 <_ChromeMain+0x4680b24>
 4685db0: f94003e0     	ldr	x0, [sp]
 4685db4: f9400be8     	ldr	x8, [sp, #0x10]
 4685db8: d37ff901     	lsl	x1, x8, #1
 4685dbc: 96e60c3f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4685dc0: f9400268     	ldr	x8, [x19]
 4685dc4: f9405108     	ldr	x8, [x8, #0xa0]
 4685dc8: aa1303e0     	mov	x0, x19
 4685dcc: 52800021     	mov	w1, #0x1                ; =1
 4685dd0: d63f0100     	blr	x8
 4685dd4: f9400268     	ldr	x8, [x19]
 4685dd8: f9418508     	ldr	x8, [x8, #0x308]
 4685ddc: aa1303e0     	mov	x0, x19
 4685de0: d63f0100     	blr	x8
 4685de4: aa1303e0     	mov	x0, x19
 4685de8: 96fc6ce5     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4685dec: f9400fe8     	ldr	x8, [sp, #0x18]
 4685df0: f004cd09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4685df4: f940f929     	ldr	x9, [x9, #0x1f0]
 4685df8: f9400129     	ldr	x9, [x9]
 4685dfc: eb08013f     	cmp	x9, x8
 4685e00: 54fff321     	b.ne	0x4685c64 <_ChromeMain+0x46809c8>
 4685e04: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4685e08: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4685e0c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4685e10: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4685e14: 910183ff     	add	sp, sp, #0x60
 4685e18: d65f03c0     	ret
 4685e1c: 976237d9     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4685e20: d4200020     	brk	#0x1
 4685e24: 52800018     	mov	w24, #0x0               ; =0
 4685e28: 52800016     	mov	w22, #0x0               ; =0
 4685e2c: aa1703e8     	mov	x8, x23
 4685e30: 8b0802a9     	add	x9, x21, x8
 4685e34: f100413f     	cmp	x9, #0x10
 4685e38: 54ffff40     	b.eq	0x4685e20 <_ChromeMain+0x4680b84>
 4685e3c: f1004108     	subs	x8, x8, #0x10
 4685e40: 54ffff81     	b.ne	0x4685e30 <_ChromeMain+0x4680b94>
 4685e44: aa1503e0     	mov	x0, x21
 4685e48: aa1703e1     	mov	x1, x23
 4685e4c: 96e60c1b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4685e50: 3914a278     	strb	w24, [x19, #0x528]
 4685e54: 9114a668     	add	x8, x19, #0x529
 4685e58: f94003e9     	ldr	x9, [sp]
 4685e5c: f9000109     	str	x9, [x8]
 4685e60: f84073e8     	ldur	x8, [sp, #0x7]
 4685e64: f9029a68     	str	x8, [x19, #0x530]
 4685e68: 3914e276     	strb	w22, [x19, #0x538]
 4685e6c: 3607ed36     	tbz	w22, #0x0, 0x4685c10 <_ChromeMain+0x4680974>
 4685e70: 9114a274     	add	x20, x19, #0x528
 4685e74: 17ffffa6     	b	0x4685d0c <_ChromeMain+0x4680a70>
