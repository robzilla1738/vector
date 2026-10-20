
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4275b40: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4275b44: a90167fa     	stp	x26, x25, [sp, #0x10]
 4275b48: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4275b4c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4275b50: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4275b54: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4275b58: 910143fd     	add	x29, sp, #0x50
 4275b5c: d107c3ff     	sub	sp, sp, #0x1f0
 4275b60: a9007d1f     	stp	xzr, xzr, [x8]
 4275b64: f9000be8     	str	x8, [sp, #0x10]
 4275b68: f900091f     	str	xzr, [x8, #0x10]
 4275b6c: 9104e3e8     	add	x8, sp, #0x138
 4275b70: 97ffbe18     	bl	0x42653d0 <_ChromeMain+0x4260134>
 4275b74: a953a3fa     	ldp	x26, x8, [sp, #0x138]
 4275b78: 8b080508     	add	x8, x8, x8, lsl #1
 4275b7c: d37df109     	lsl	x9, x8, #3
 4275b80: b4000389     	cbz	x9, 0x4275bf0 <_ChromeMain+0x4270954>
 4275b84: 8b080f48     	add	x8, x26, x8, lsl #3
 4275b88: f90017e8     	str	x8, [sp, #0x28]
 4275b8c: 910483fc     	add	x28, sp, #0x120
 4275b90: b00464a9     	adrp	x9, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4275b94: 910fd529     	add	x9, x9, #0x3f5
 4275b98: 91003788     	add	x8, x28, #0xd
 4275b9c: eb09039f     	cmp	x28, x9
 4275ba0: fa499100     	ccmp	x8, x9, #0x0, ls
 4275ba4: 1a9f97e8     	cset	w8, hi
 4275ba8: b9000fe8     	str	w8, [sp, #0xc]
 4275bac: d103c3a8     	sub	x8, x29, #0xf0
 4275bb0: b2400909     	orr	x9, x8, #0x7
 4275bb4: 9004b12a     	adrp	x10, 0xd899000 <dyld_stub_binder+0xd899000>
 4275bb8: 9101d14a     	add	x10, x10, #0x74
 4275bbc: eb0a011f     	cmp	x8, x10
 4275bc0: fa4a9120     	ccmp	x9, x10, #0x0, ls
 4275bc4: 1a9f97e8     	cset	w8, hi
 4275bc8: b90027e8     	str	w8, [sp, #0x24]
 4275bcc: 52800093     	mov	w19, #0x4               ; =4
 4275bd0: d004abd4     	adrp	x20, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 4275bd4: 9109e694     	add	x20, x20, #0x279
 4275bd8: b004abf5     	adrp	x21, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4275bdc: 9138deb5     	add	x21, x21, #0xe37
 4275be0: 9005327b     	adrp	x27, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4275be4: 9121e37b     	add	x27, x27, #0x878
 4275be8: 14000085     	b	0x4275dfc <_ChromeMain+0x4270b60>
 4275bec: f9409ffa     	ldr	x26, [sp, #0x138]
 4275bf0: b500013a     	cbnz	x26, 0x4275c14 <_ChromeMain+0x4270978>
 4275bf4: 9107c3ff     	add	sp, sp, #0x1f0
 4275bf8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4275bfc: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4275c00: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4275c04: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4275c08: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4275c0c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4275c10: d65f03c0     	ret
 4275c14: f940a3e8     	ldr	x8, [sp, #0x140]
 4275c18: 8b080509     	add	x9, x8, x8, lsl #1
 4275c1c: d37df129     	lsl	x9, x9, #3
 4275c20: aa1a03e0     	mov	x0, x26
 4275c24: b4000189     	cbz	x9, 0x4275c54 <_ChromeMain+0x42709b8>
 4275c28: 8b1a0129     	add	x9, x9, x26
 4275c2c: d1006133     	sub	x19, x9, #0x18
 4275c30: d37df109     	lsl	x9, x8, #3
 4275c34: cb081534     	sub	x20, x9, x8, lsl #5
 4275c38: b4000253     	cbz	x19, 0x4275c80 <_ChromeMain+0x42709e4>
 4275c3c: 39c05e68     	ldrsb	w8, [x19, #0x17]
 4275c40: 37f84948     	tbnz	w8, #0x1f, 0x4276568 <_ChromeMain+0x42712cc>
 4275c44: d1006273     	sub	x19, x19, #0x18
 4275c48: b1006294     	adds	x20, x20, #0x18
 4275c4c: 54ffff61     	b.ne	0x4275c38 <_ChromeMain+0x427099c>
 4275c50: f9409fe0     	ldr	x0, [sp, #0x138]
 4275c54: cb000348     	sub	x8, x26, x0
 4275c58: 9343fd08     	asr	x8, x8, #3
 4275c5c: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 4275c60: f2955569     	movk	x9, #0xaaab
 4275c64: 9b097d08     	mul	x8, x8, x9
 4275c68: f900a3e8     	str	x8, [sp, #0x140]
 4275c6c: f940a7e8     	ldr	x8, [sp, #0x148]
 4275c70: 8b080508     	add	x8, x8, x8, lsl #1
 4275c74: d37df101     	lsl	x1, x8, #3
 4275c78: 96f64c90     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275c7c: 17ffffde     	b	0x4275bf4 <_ChromeMain+0x4270958>
 4275c80: d4200020     	brk	#0x1
 4275c84: 910123e0     	add	x0, sp, #0x48
 4275c88: 9722c49a     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4275c8c: f94027e0     	ldr	x0, [sp, #0x48]
 4275c90: f9402fe8     	ldr	x8, [sp, #0x58]
 4275c94: d37be901     	lsl	x1, x8, #5
 4275c98: 96f64c88     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275c9c: b5000737     	cbnz	x23, 0x4275d80 <_ChromeMain+0x4270ae4>
 4275ca0: 14000047     	b	0x4275dbc <_ChromeMain+0x4270b20>
 4275ca4: 9100c3e0     	add	x0, sp, #0x30
 4275ca8: 9722c492     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4275cac: f9401be0     	ldr	x0, [sp, #0x30]
 4275cb0: f94023e8     	ldr	x8, [sp, #0x40]
 4275cb4: d37be901     	lsl	x1, x8, #5
 4275cb8: 96f64c80     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275cbc: 1400002e     	b	0x4275d74 <_ChromeMain+0x4270ad8>
 4275cc0: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4275cc4: f90023ff     	str	xzr, [sp, #0x40]
 4275cc8: b004bac8     	adrp	x8, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4275ccc: 913a6508     	add	x8, x8, #0xe99
 4275cd0: f81803a8     	stur	x8, [x29, #-0x80]
 4275cd4: 9100c3e0     	add	x0, sp, #0x30
 4275cd8: d10203a1     	sub	x1, x29, #0x80
 4275cdc: 9750b0a1     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275ce0: d004bd48     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 4275ce4: 9114dd08     	add	x8, x8, #0x537
 4275ce8: f81803a8     	stur	x8, [x29, #-0x80]
 4275cec: 9100c3e0     	add	x0, sp, #0x30
 4275cf0: d10203a1     	sub	x1, x29, #0x80
 4275cf4: 9750b09b     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275cf8: d004bac8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 4275cfc: 91067d08     	add	x8, x8, #0x19f
 4275d00: f81803a8     	stur	x8, [x29, #-0x80]
 4275d04: 9100c3e0     	add	x0, sp, #0x30
 4275d08: d10203a1     	sub	x1, x29, #0x80
 4275d0c: 9750b095     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275d10: b004b7c8     	adrp	x8, 0xd96e000 <dyld_stub_binder+0xd96e000>
 4275d14: 91170108     	add	x8, x8, #0x5c0
 4275d18: f81803a8     	stur	x8, [x29, #-0x80]
 4275d1c: 9100c3e0     	add	x0, sp, #0x30
 4275d20: d10203a1     	sub	x1, x29, #0x80
 4275d24: 9750b08f     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275d28: 9004b2e8     	adrp	x8, 0xd8d1000 <dyld_stub_binder+0xd8d1000>
 4275d2c: 912cc108     	add	x8, x8, #0xb30
 4275d30: f81803a8     	stur	x8, [x29, #-0x80]
 4275d34: 9100c3e0     	add	x0, sp, #0x30
 4275d38: d10203a1     	sub	x1, x29, #0x80
 4275d3c: 9750b089     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275d40: d10203a8     	sub	x8, x29, #0x80
 4275d44: 910183e0     	add	x0, sp, #0x60
 4275d48: 910123e1     	add	x1, sp, #0x48
 4275d4c: 9100c3e2     	add	x2, sp, #0x30
 4275d50: 52800003     	mov	w3, #0x0                ; =0
 4275d54: 94000948     	bl	0x4278274 <_ChromeMain+0x4272fd8>
 4275d58: d10203a1     	sub	x1, x29, #0x80
 4275d5c: f9400be0     	ldr	x0, [sp, #0x10]
 4275d60: 971ea111     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 4275d64: d10203a0     	sub	x0, x29, #0x80
 4275d68: 971ba1c6     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4275d6c: f9401be1     	ldr	x1, [sp, #0x30]
 4275d70: b5fff9a1     	cbnz	x1, 0x4275ca4 <_ChromeMain+0x4270a08>
 4275d74: f94027e1     	ldr	x1, [sp, #0x48]
 4275d78: b5fff861     	cbnz	x1, 0x4275c84 <_ChromeMain+0x42709e8>
 4275d7c: b4000217     	cbz	x23, 0x4275dbc <_ChromeMain+0x4270b20>
 4275d80: b4000158     	cbz	x24, 0x4275da8 <_ChromeMain+0x4270b0c>
 4275d84: 8b1802e8     	add	x8, x23, x24
 4275d88: d1014100     	sub	x0, x8, #0x50
 4275d8c: 928009e8     	mov	x8, #-0x50              ; =-80
 4275d90: 9b087f36     	mul	x22, x25, x8
 4275d94: b4fff760     	cbz	x0, 0x4275c80 <_ChromeMain+0x42709e4>
 4275d98: 97ff60af     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4275d9c: d1014000     	sub	x0, x0, #0x50
 4275da0: b10142d6     	adds	x22, x22, #0x50
 4275da4: 54ffff81     	b.ne	0x4275d94 <_ChromeMain+0x4270af8>
 4275da8: f9400fe8     	ldr	x8, [sp, #0x18]
 4275dac: 8b080908     	add	x8, x8, x8, lsl #2
 4275db0: d37ced01     	lsl	x1, x8, #4
 4275db4: aa1703e0     	mov	x0, x23
 4275db8: 96f64c40     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275dbc: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 4275dc0: 36f800a8     	tbz	w8, #0x1f, 0x4275dd4 <_ChromeMain+0x4270b38>
 4275dc4: f94033e0     	ldr	x0, [sp, #0x60]
 4275dc8: f9403be8     	ldr	x8, [sp, #0x70]
 4275dcc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4275dd0: 96f64c3a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275dd4: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 4275dd8: 36f800a8     	tbz	w8, #0x1f, 0x4275dec <_ChromeMain+0x4270b50>
 4275ddc: f94093e0     	ldr	x0, [sp, #0x120]
 4275de0: f9409be8     	ldr	x8, [sp, #0x130]
 4275de4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4275de8: 96f64c34     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4275dec: 9100635a     	add	x26, x26, #0x18
 4275df0: f94017e8     	ldr	x8, [sp, #0x28]
 4275df4: eb08035f     	cmp	x26, x8
 4275df8: 54ffefa0     	b.eq	0x4275bec <_ChromeMain+0x4270950>
 4275dfc: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 4275e00: f9009bff     	str	xzr, [sp, #0x130]
 4275e04: 39805f57     	ldrsb	x23, [x26, #0x17]
 4275e08: b7f80277     	tbnz	x23, #0x3f, 0x4275e54 <_ChromeMain+0x4270bb8>
 4275e0c: aa1a03f8     	mov	x24, x26
 4275e10: f10016ff     	cmp	x23, #0x5
 4275e14: 54000460     	b.eq	0x4275ea0 <_ChromeMain+0x4270c04>
 4275e18: 92800208     	mov	x8, #-0x11              ; =-17
 4275e1c: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4275e20: eb0802ff     	cmp	x23, x8
 4275e24: 54003ac2     	b.hs	0x427657c <_ChromeMain+0x42712e0>
 4275e28: f1005aff     	cmp	x23, #0x16
 4275e2c: 54000489     	b.ls	0x4275ebc <_ChromeMain+0x4270c20>
 4275e30: 927ceaf6     	and	x22, x23, #0x7ffffffffffffff0
 4275e34: 910042c0     	add	x0, x22, #0x10
 4275e38: 96f6654c     	bl	0xf368 <_ChromeMain+0xa0cc>
 4275e3c: aa0003f9     	mov	x25, x0
 4275e40: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4275e44: cb0802c8     	sub	x8, x22, x8
 4275e48: a9125fe0     	stp	x0, x23, [sp, #0x120]
 4275e4c: f9009be8     	str	x8, [sp, #0x130]
 4275e50: 1400001d     	b	0x4275ec4 <_ChromeMain+0x4270c28>
 4275e54: a9405f58     	ldp	x24, x23, [x26]
 4275e58: 17ffffee     	b	0x4275e10 <_ChromeMain+0x4270b74>
 4275e5c: 528001a8     	mov	w8, #0xd                ; =13
 4275e60: 3904dfe8     	strb	w8, [sp, #0x137]
 4275e64: b9400fe8     	ldr	w8, [sp, #0xc]
 4275e68: 35fff0c8     	cbnz	w8, 0x4275c80 <_ChromeMain+0x42709e4>
 4275e6c: b00464a9     	adrp	x9, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 4275e70: 910fd529     	add	x9, x9, #0x3f5
 4275e74: f9400128     	ldr	x8, [x9]
 4275e78: f90093e8     	str	x8, [sp, #0x120]
 4275e7c: f8405128     	ldur	x8, [x9, #0x5]
 4275e80: f8005388     	stur	x8, [x28, #0x5]
 4275e84: 3904b7ff     	strb	wzr, [sp, #0x12d]
 4275e88: d28d0c77     	mov	x23, #0x6863            ; =26723
 4275e8c: f2ae8c37     	movk	x23, #0x7461, lsl #16
 4275e90: f2ce0cf7     	movk	x23, #0x7067, lsl #32
 4275e94: f2e5ae97     	movk	x23, #0x2d74, lsl #48
 4275e98: 528001a8     	mov	w8, #0xd                ; =13
 4275e9c: 14000017     	b	0x4275ef8 <_ChromeMain+0x4270c5c>
 4275ea0: b9400308     	ldr	w8, [x24]
 4275ea4: 39401309     	ldrb	w9, [x24, #0x4]
 4275ea8: 7101cd3f     	cmp	w9, #0x73
 4275eac: 528e8c29     	mov	w9, #0x7461             ; =29793
 4275eb0: 72ac2d89     	movk	w9, #0x616c, lsl #16
 4275eb4: 7a490100     	ccmp	w8, w9, #0x0, eq
 4275eb8: 54fffd20     	b.eq	0x4275e5c <_ChromeMain+0x4270bc0>
 4275ebc: 3904dff7     	strb	w23, [sp, #0x137]
 4275ec0: 910483f9     	add	x25, sp, #0x120
 4275ec4: 8b170328     	add	x8, x25, x23
 4275ec8: eb19011f     	cmp	x8, x25
 4275ecc: 54ffeda3     	b.lo	0x4275c80 <_ChromeMain+0x42709e4>
 4275ed0: eb18033f     	cmp	x25, x24
 4275ed4: fa589100     	ccmp	x8, x24, #0x0, ls
 4275ed8: 54ffed48     	b.hi	0x4275c80 <_ChromeMain+0x42709e4>
 4275edc: aa1903e0     	mov	x0, x25
 4275ee0: aa1803e1     	mov	x1, x24
 4275ee4: aa1703e2     	mov	x2, x23
 4275ee8: 94f664f9     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4275eec: 38376b3f     	strb	wzr, [x25, x23]
 4275ef0: 3944dfe8     	ldrb	w8, [sp, #0x137]
 4275ef4: f94093f7     	ldr	x23, [sp, #0x120]
 4275ef8: 13001d16     	sxtb	w22, w8
 4275efc: f94097f8     	ldr	x24, [sp, #0x128]
 4275f00: 710002df     	cmp	w22, #0x0
 4275f04: 9a884301     	csel	x1, x24, x8, mi
 4275f08: 9a9c42e0     	csel	x0, x23, x28, mi
 4275f0c: f1001c3f     	cmp	x1, #0x7
 4275f10: 54000800     	b.eq	0x4276010 <_ChromeMain+0x4270d74>
 4275f14: f100183f     	cmp	x1, #0x6
 4275f18: 540008e1     	b.ne	0x4276034 <_ChromeMain+0x4270d98>
 4275f1c: b9400008     	ldr	w8, [x0]
 4275f20: 79400809     	ldrh	w9, [x0, #0x4]
 4275f24: 528c2e6a     	mov	w10, #0x6173            ; =24947
 4275f28: 72ac2cca     	movk	w10, #0x6166, lsl #16
 4275f2c: 6b0a011f     	cmp	w8, w10
 4275f30: 528d2e48     	mov	w8, #0x6972             ; =26994
 4275f34: 7a480120     	ccmp	w9, w8, #0x0, eq
 4275f38: 540007e1     	b.ne	0x4276034 <_ChromeMain+0x4270d98>
 4275f3c: 37f80b36     	tbnz	w22, #0x1f, 0x42760a0 <_ChromeMain+0x4270e04>
 4275f40: 3dc04be0     	ldr	q0, [sp, #0x120]
 4275f44: 3d8043e0     	str	q0, [sp, #0x100]
 4275f48: f9409be8     	ldr	x8, [sp, #0x130]
 4275f4c: f9008be8     	str	x8, [sp, #0x110]
 4275f50: a90effff     	stp	xzr, xzr, [sp, #0xe8]
 4275f54: f9007fff     	str	xzr, [sp, #0xf8]
 4275f58: a90dffff     	stp	xzr, xzr, [sp, #0xd8]
 4275f5c: f9006bff     	str	xzr, [sp, #0xd0]
 4275f60: b004bac8     	adrp	x8, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4275f64: 913a6508     	add	x8, x8, #0xe99
 4275f68: f81803a8     	stur	x8, [x29, #-0x80]
 4275f6c: 910343e0     	add	x0, sp, #0xd0
 4275f70: d10203a1     	sub	x1, x29, #0x80
 4275f74: 9750affb     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275f78: d004bd48     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 4275f7c: 9114dd08     	add	x8, x8, #0x537
 4275f80: f81803a8     	stur	x8, [x29, #-0x80]
 4275f84: 910343e0     	add	x0, sp, #0xd0
 4275f88: d10203a1     	sub	x1, x29, #0x80
 4275f8c: 9750aff5     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275f90: d004bac8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 4275f94: 91067d08     	add	x8, x8, #0x19f
 4275f98: f81803a8     	stur	x8, [x29, #-0x80]
 4275f9c: 910343e0     	add	x0, sp, #0xd0
 4275fa0: d10203a1     	sub	x1, x29, #0x80
 4275fa4: 9750afef     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275fa8: d004c568     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 4275fac: 9110d108     	add	x8, x8, #0x434
 4275fb0: f81803a8     	stur	x8, [x29, #-0x80]
 4275fb4: 910343e0     	add	x0, sp, #0xd0
 4275fb8: d10203a1     	sub	x1, x29, #0x80
 4275fbc: 9750afe9     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4275fc0: d10203a8     	sub	x8, x29, #0x80
 4275fc4: 910403e0     	add	x0, sp, #0x100
 4275fc8: 9103a3e1     	add	x1, sp, #0xe8
 4275fcc: 910343e2     	add	x2, sp, #0xd0
 4275fd0: 52800023     	mov	w3, #0x1                ; =1
 4275fd4: 940008a8     	bl	0x4278274 <_ChromeMain+0x4272fd8>
 4275fd8: d10203a1     	sub	x1, x29, #0x80
 4275fdc: f9400be0     	ldr	x0, [sp, #0x10]
 4275fe0: 971ea071     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 4275fe4: d10203a0     	sub	x0, x29, #0x80
 4275fe8: 971ba126     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4275fec: f9406be1     	ldr	x1, [sp, #0xd0]
 4275ff0: b5000621     	cbnz	x1, 0x42760b4 <_ChromeMain+0x4270e18>
 4275ff4: f94077e1     	ldr	x1, [sp, #0xe8]
 4275ff8: b50006c1     	cbnz	x1, 0x42760d0 <_ChromeMain+0x4270e34>
 4275ffc: 39c45fe8     	ldrsb	w8, [sp, #0x117]
 4276000: 36ffeea8     	tbz	w8, #0x1f, 0x4275dd4 <_ChromeMain+0x4270b38>
 4276004: f94083e0     	ldr	x0, [sp, #0x100]
 4276008: f9408be8     	ldr	x8, [sp, #0x110]
 427600c: 17ffff70     	b	0x4275dcc <_ChromeMain+0x4270b30>
 4276010: b9400008     	ldr	w8, [x0]
 4276014: b8403009     	ldur	w9, [x0, #0x3]
 4276018: 528d2cca     	mov	w10, #0x6966            ; =26982
 427601c: 72acae4a     	movk	w10, #0x6572, lsl #16
 4276020: 6b0a011f     	cmp	w8, w10
 4276024: 528ccca8     	mov	w8, #0x6665             ; =26213
 4276028: 72af0de8     	movk	w8, #0x786f, lsl #16
 427602c: 7a480120     	ccmp	w9, w8, #0x0, eq
 4276030: 54001d60     	b.eq	0x42763dc <_ChromeMain+0x4271140>
 4276034: 97fffcfa     	bl	0x427541c <_ChromeMain+0x4270180>
 4276038: d360fc08     	lsr	x8, x0, #32
 427603c: b4ffecc8     	cbz	x8, 0x4275dd4 <_ChromeMain+0x4270b38>
 4276040: aa0003f9     	mov	x25, x0
 4276044: 37f80256     	tbnz	w22, #0x1f, 0x427608c <_ChromeMain+0x4270df0>
 4276048: 3dc04be0     	ldr	q0, [sp, #0x120]
 427604c: 3d801be0     	str	q0, [sp, #0x60]
 4276050: f9409be8     	ldr	x8, [sp, #0x130]
 4276054: f9003be8     	str	x8, [sp, #0x70]
 4276058: d10203a8     	sub	x8, x29, #0x80
 427605c: aa1903e0     	mov	x0, x25
 4276060: 97ffc380     	bl	0x4266e60 <_ChromeMain+0x4261bc4>
 4276064: a97867b7     	ldp	x23, x25, [x29, #-0x80]
 4276068: f85903a8     	ldur	x8, [x29, #-0x70]
 427606c: f9000fe8     	str	x8, [sp, #0x18]
 4276070: 8b190b28     	add	x8, x25, x25, lsl #2
 4276074: d37ced18     	lsl	x24, x8, #4
 4276078: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 427607c: f90027ff     	str	xzr, [sp, #0x48]
 4276080: b4ffe218     	cbz	x24, 0x4275cc0 <_ChromeMain+0x4270a24>
 4276084: d2800016     	mov	x22, #0x0               ; =0
 4276088: 14000023     	b	0x4276114 <_ChromeMain+0x4270e78>
 427608c: 910183e0     	add	x0, sp, #0x60
 4276090: aa1703e1     	mov	x1, x23
 4276094: aa1803e2     	mov	x2, x24
 4276098: 96f68860     	bl	0x18218 <_ChromeMain+0x12f7c>
 427609c: 17ffffef     	b	0x4276058 <_ChromeMain+0x4270dbc>
 42760a0: 910403e0     	add	x0, sp, #0x100
 42760a4: aa1703e1     	mov	x1, x23
 42760a8: aa1803e2     	mov	x2, x24
 42760ac: 96f6885b     	bl	0x18218 <_ChromeMain+0x12f7c>
 42760b0: 17ffffa8     	b	0x4275f50 <_ChromeMain+0x4270cb4>
 42760b4: 910343e0     	add	x0, sp, #0xd0
 42760b8: 9722c38e     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 42760bc: f9406be0     	ldr	x0, [sp, #0xd0]
 42760c0: f94073e8     	ldr	x8, [sp, #0xe0]
 42760c4: d37be901     	lsl	x1, x8, #5
 42760c8: 96f64b7c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42760cc: 17ffffca     	b	0x4275ff4 <_ChromeMain+0x4270d58>
 42760d0: 9103a3e0     	add	x0, sp, #0xe8
 42760d4: 9722c387     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 42760d8: f94077e0     	ldr	x0, [sp, #0xe8]
 42760dc: f9407fe8     	ldr	x8, [sp, #0xf8]
 42760e0: d37be901     	lsl	x1, x8, #5
 42760e4: 96f64b75     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42760e8: 17ffffc5     	b	0x4275ffc <_ChromeMain+0x4270d60>
 42760ec: f9402109     	ldr	x9, [x8, #0x40]
 42760f0: b5000749     	cbnz	x9, 0x42761d8 <_ChromeMain+0x4270f3c>
 42760f4: 910123e0     	add	x0, sp, #0x48
 42760f8: d10283a1     	sub	x1, x29, #0xa0
 42760fc: 971ea02a     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 4276100: d10283a0     	sub	x0, x29, #0xa0
 4276104: 971ba0df     	bl	0x95e480 <_ChromeMain+0x9591e4>
 4276108: 910142d6     	add	x22, x22, #0x50
 427610c: eb16031f     	cmp	x24, x22
 4276110: 54ffdd80     	b.eq	0x4275cc0 <_ChromeMain+0x4270a24>
 4276114: 8b1602e8     	add	x8, x23, x22
 4276118: 91002103     	add	x3, x8, #0x8
 427611c: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4276120: f81703bf     	stur	xzr, [x29, #-0x90]
 4276124: 39807d04     	ldrsb	x4, [x8, #0x1f]
 4276128: b6f80064     	tbz	x4, #0x3f, 0x4276134 <_ChromeMain+0x4270e98>
 427612c: f9400063     	ldr	x3, [x3]
 4276130: f9400904     	ldr	x4, [x8, #0x10]
 4276134: d10283a0     	sub	x0, x29, #0xa0
 4276138: aa1403e1     	mov	x1, x20
 427613c: 52800042     	mov	w2, #0x2                ; =2
 4276140: 9750a922     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 4276144: 8b1602e8     	add	x8, x23, x22
 4276148: 91008100     	add	x0, x8, #0x20
 427614c: 3980dd01     	ldrsb	x1, [x8, #0x37]
 4276150: b6f80061     	tbz	x1, #0x3f, 0x427615c <_ChromeMain+0x4270ec0>
 4276154: f9400000     	ldr	x0, [x0]
 4276158: f9401501     	ldr	x1, [x8, #0x28]
 427615c: d102e3a8     	sub	x8, x29, #0xb8
 4276160: 9734b2ea     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4276164: 3cc68380     	ldur	q0, [x28, #0x68]
 4276168: 3c9803a0     	stur	q0, [x29, #-0x80]
 427616c: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276170: f81903a8     	stur	x8, [x29, #-0x70]
 4276174: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 4276178: f81583bf     	stur	xzr, [x29, #-0xa8]
 427617c: 381983b3     	sturb	w19, [x29, #-0x68]
 4276180: d10283a0     	sub	x0, x29, #0xa0
 4276184: d10203a3     	sub	x3, x29, #0x80
 4276188: aa1503e1     	mov	x1, x21
 427618c: 52800082     	mov	w2, #0x4                ; =4
 4276190: 970b134c     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4276194: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276198: f103fd1f     	cmp	x8, #0xff
 427619c: 540000a0     	b.eq	0x42761b0 <_ChromeMain+0x4270f14>
 42761a0: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 42761a4: d10343a0     	sub	x0, x29, #0xd0
 42761a8: d10203a1     	sub	x1, x29, #0x80
 42761ac: d63f0100     	blr	x8
 42761b0: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 42761b4: 36f800a8     	tbz	w8, #0x1f, 0x42761c8 <_ChromeMain+0x4270f2c>
 42761b8: f85483a0     	ldur	x0, [x29, #-0xb8]
 42761bc: f85583a8     	ldur	x8, [x29, #-0xa8]
 42761c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42761c4: 96f64b3d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42761c8: 8b1602e8     	add	x8, x23, x22
 42761cc: 39813d09     	ldrsb	x9, [x8, #0x4f]
 42761d0: b7fff8e9     	tbnz	x9, #0x3f, 0x42760ec <_ChromeMain+0x4270e50>
 42761d4: b4fff909     	cbz	x9, 0x42760f4 <_ChromeMain+0x4270e58>
 42761d8: 9100e100     	add	x0, x8, #0x38
 42761dc: 39813d01     	ldrsb	x1, [x8, #0x4f]
 42761e0: b6f80081     	tbz	x1, #0x3f, 0x42761f0 <_ChromeMain+0x4270f54>
 42761e4: f9400000     	ldr	x0, [x0]
 42761e8: 8b1602e8     	add	x8, x23, x22
 42761ec: f9402101     	ldr	x1, [x8, #0x40]
 42761f0: d102e3a8     	sub	x8, x29, #0xb8
 42761f4: 9734b2c5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42761f8: 3cc68380     	ldur	q0, [x28, #0x68]
 42761fc: 3c9803a0     	stur	q0, [x29, #-0x80]
 4276200: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276204: f81903a8     	stur	x8, [x29, #-0x70]
 4276208: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 427620c: f81583bf     	stur	xzr, [x29, #-0xa8]
 4276210: 381983b3     	sturb	w19, [x29, #-0x68]
 4276214: d10283a0     	sub	x0, x29, #0xa0
 4276218: d10203a3     	sub	x3, x29, #0x80
 427621c: d004b7a1     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 4276220: 912a7c21     	add	x1, x1, #0xa9f
 4276224: 52800102     	mov	w2, #0x8                ; =8
 4276228: 970b1326     	bl	0x53aec0 <_ChromeMain+0x535c24>
 427622c: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276230: f103fd1f     	cmp	x8, #0xff
 4276234: 540000a0     	b.eq	0x4276248 <_ChromeMain+0x4270fac>
 4276238: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 427623c: d10343a0     	sub	x0, x29, #0xd0
 4276240: d10203a1     	sub	x1, x29, #0x80
 4276244: d63f0100     	blr	x8
 4276248: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 427624c: 36fff548     	tbz	w8, #0x1f, 0x42760f4 <_ChromeMain+0x4270e58>
 4276250: f85483a0     	ldur	x0, [x29, #-0xb8]
 4276254: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276258: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427625c: 96f64b17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276260: 17ffffa5     	b	0x42760f4 <_ChromeMain+0x4270e58>
 4276264: f94012e1     	ldr	x1, [x23, #0x20]
 4276268: b4000981     	cbz	x1, 0x4276398 <_ChromeMain+0x42710fc>
 427626c: f9400000     	ldr	x0, [x0]
 4276270: d103c3a8     	sub	x8, x29, #0xf0
 4276274: 9734b2a5     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 4276278: 3cd103a0     	ldur	q0, [x29, #-0xf0]
 427627c: 3c9803a0     	stur	q0, [x29, #-0x80]
 4276280: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276284: f81903a8     	stur	x8, [x29, #-0x70]
 4276288: a9317fbf     	stp	xzr, xzr, [x29, #-0xf0]
 427628c: f81203bf     	stur	xzr, [x29, #-0xe0]
 4276290: 381983b3     	sturb	w19, [x29, #-0x68]
 4276294: d10343a0     	sub	x0, x29, #0xd0
 4276298: d10203a3     	sub	x3, x29, #0x80
 427629c: aa1503e1     	mov	x1, x21
 42762a0: 52800082     	mov	w2, #0x4                ; =4
 42762a4: 970b1307     	bl	0x53aec0 <_ChromeMain+0x535c24>
 42762a8: 385983a8     	ldurb	w8, [x29, #-0x68]
 42762ac: f103fd1f     	cmp	x8, #0xff
 42762b0: 540000a0     	b.eq	0x42762c4 <_ChromeMain+0x4271028>
 42762b4: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 42762b8: d10207a0     	sub	x0, x29, #0x81
 42762bc: d10203a1     	sub	x1, x29, #0x80
 42762c0: d63f0100     	blr	x8
 42762c4: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 42762c8: 36f800a8     	tbz	w8, #0x1f, 0x42762dc <_ChromeMain+0x4271040>
 42762cc: f85103a0     	ldur	x0, [x29, #-0xf0]
 42762d0: f85203a8     	ldur	x8, [x29, #-0xe0]
 42762d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 42762d8: 96f64af8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42762dc: 910263e0     	add	x0, sp, #0x98
 42762e0: d10343a1     	sub	x1, x29, #0xd0
 42762e4: 971e9fb0     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 42762e8: d10343a0     	sub	x0, x29, #0xd0
 42762ec: 971ba065     	bl	0x95e480 <_ChromeMain+0x9591e4>
 42762f0: 9100c2f7     	add	x23, x23, #0x30
 42762f4: f100c2d6     	subs	x22, x22, #0x30
 42762f8: 54000a00     	b.eq	0x4276438 <_ChromeMain+0x427119c>
 42762fc: aa1703e0     	mov	x0, x23
 4276300: 977ab5b0     	bl	0x21239c0 <_ChromeMain+0x211e724>
 4276304: 34ffff60     	cbz	w0, 0x42762f0 <_ChromeMain+0x4271054>
 4276308: a9337fbf     	stp	xzr, xzr, [x29, #-0xd0]
 427630c: f81403bf     	stur	xzr, [x29, #-0xc0]
 4276310: 39c05ee8     	ldrsb	w8, [x23, #0x17]
 4276314: 36f805a8     	tbz	w8, #0x1f, 0x42763c8 <_ChromeMain+0x427112c>
 4276318: a9400ae1     	ldp	x1, x2, [x23]
 427631c: d103c3a0     	sub	x0, x29, #0xf0
 4276320: 96f687be     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276324: 3cd103a0     	ldur	q0, [x29, #-0xf0]
 4276328: 3c9803a0     	stur	q0, [x29, #-0x80]
 427632c: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276330: f81903a8     	stur	x8, [x29, #-0x70]
 4276334: a9317fbf     	stp	xzr, xzr, [x29, #-0xf0]
 4276338: f81203bf     	stur	xzr, [x29, #-0xe0]
 427633c: 381983b3     	sturb	w19, [x29, #-0x68]
 4276340: d10343a0     	sub	x0, x29, #0xd0
 4276344: d10203a3     	sub	x3, x29, #0x80
 4276348: aa1403e1     	mov	x1, x20
 427634c: 52800042     	mov	w2, #0x2                ; =2
 4276350: 970b12dc     	bl	0x53aec0 <_ChromeMain+0x535c24>
 4276354: 385983a8     	ldurb	w8, [x29, #-0x68]
 4276358: f103fd1f     	cmp	x8, #0xff
 427635c: 540000a0     	b.eq	0x4276370 <_ChromeMain+0x42710d4>
 4276360: f8687b68     	ldr	x8, [x27, x8, lsl #3]
 4276364: d10207a0     	sub	x0, x29, #0x81
 4276368: d10203a1     	sub	x1, x29, #0x80
 427636c: d63f0100     	blr	x8
 4276370: 38d273a8     	ldursb	w8, [x29, #-0xd9]
 4276374: 36f800a8     	tbz	w8, #0x1f, 0x4276388 <_ChromeMain+0x42710ec>
 4276378: f85103a0     	ldur	x0, [x29, #-0xf0]
 427637c: f85203a8     	ldur	x8, [x29, #-0xe0]
 4276380: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276384: 96f64acd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276388: 910062e0     	add	x0, x23, #0x18
 427638c: 3980bee1     	ldrsb	x1, [x23, #0x2f]
 4276390: b7fff6a1     	tbnz	x1, #0x3f, 0x4276264 <_ChromeMain+0x4270fc8>
 4276394: 35fff6e1     	cbnz	w1, 0x4276270 <_ChromeMain+0x4270fd4>
 4276398: 528000e8     	mov	w8, #0x7                ; =7
 427639c: 381273a8     	sturb	w8, [x29, #-0xd9]
 42763a0: b94027e8     	ldr	w8, [sp, #0x24]
 42763a4: 35ffc6e8     	cbnz	w8, 0x4275c80 <_ChromeMain+0x42709e4>
 42763a8: 528eac28     	mov	w8, #0x7561             ; =30049
 42763ac: 72ae8d88     	movk	w8, #0x746c, lsl #16
 42763b0: b8033388     	stur	w8, [x28, #0x33]
 42763b4: 528ca888     	mov	w8, #0x6544             ; =25924
 42763b8: 72ac2cc8     	movk	w8, #0x6166, lsl #16
 42763bc: b81103a8     	stur	w8, [x29, #-0xf0]
 42763c0: 381173bf     	sturb	wzr, [x29, #-0xe9]
 42763c4: 17ffffad     	b	0x4276278 <_ChromeMain+0x4270fdc>
 42763c8: 3dc002e0     	ldr	q0, [x23]
 42763cc: f9400ae8     	ldr	x8, [x23, #0x10]
 42763d0: f81203a8     	stur	x8, [x29, #-0xe0]
 42763d4: 3c9103a0     	stur	q0, [x29, #-0xf0]
 42763d8: 17ffffd3     	b	0x4276324 <_ChromeMain+0x4271088>
 42763dc: 37f800d6     	tbnz	w22, #0x1f, 0x42763f4 <_ChromeMain+0x4271158>
 42763e0: 3dc04be0     	ldr	q0, [sp, #0x120]
 42763e4: 3d802fe0     	str	q0, [sp, #0xb0]
 42763e8: f9409be8     	ldr	x8, [sp, #0x130]
 42763ec: f90063e8     	str	x8, [sp, #0xc0]
 42763f0: 14000005     	b	0x4276404 <_ChromeMain+0x4271168>
 42763f4: 9102c3e0     	add	x0, sp, #0xb0
 42763f8: aa1703e1     	mov	x1, x23
 42763fc: aa1803e2     	mov	x2, x24
 4276400: 96f68786     	bl	0x18218 <_ChromeMain+0x12f7c>
 4276404: a909ffff     	stp	xzr, xzr, [sp, #0x98]
 4276408: f90057ff     	str	xzr, [sp, #0xa8]
 427640c: a934ffbf     	stp	xzr, xzr, [x29, #-0xb8]
 4276410: f81583bf     	stur	xzr, [x29, #-0xa8]
 4276414: d10283a8     	sub	x8, x29, #0xa0
 4276418: d102e3a0     	sub	x0, x29, #0xb8
 427641c: 94bdea2b     	bl	0x71f0cc8 <_ChromeMain+0x71eba2c>
 4276420: f85683a8     	ldur	x8, [x29, #-0x98]
 4276424: 8b080508     	add	x8, x8, x8, lsl #1
 4276428: d37ced16     	lsl	x22, x8, #4
 427642c: b4000076     	cbz	x22, 0x4276438 <_ChromeMain+0x427119c>
 4276430: f85603b7     	ldur	x23, [x29, #-0xa0]
 4276434: 17ffffb2     	b	0x42762fc <_ChromeMain+0x4271060>
 4276438: d10283a8     	sub	x8, x29, #0xa0
 427643c: f81803a8     	stur	x8, [x29, #-0x80]
 4276440: d10203a0     	sub	x0, x29, #0x80
 4276444: 94d6ac18     	bl	0x78214a4 <_ChromeMain+0x781c208>
 4276448: 38d5f3a8     	ldursb	w8, [x29, #-0xa1]
 427644c: 36f800a8     	tbz	w8, #0x1f, 0x4276460 <_ChromeMain+0x42711c4>
 4276450: f85483a0     	ldur	x0, [x29, #-0xb8]
 4276454: f85583a8     	ldur	x8, [x29, #-0xa8]
 4276458: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427645c: 96f64a97     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276460: a908ffff     	stp	xzr, xzr, [sp, #0x88]
 4276464: f90043ff     	str	xzr, [sp, #0x80]
 4276468: 9004bac8     	adrp	x8, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 427646c: 913a6508     	add	x8, x8, #0xe99
 4276470: f81803a8     	stur	x8, [x29, #-0x80]
 4276474: 910203e0     	add	x0, sp, #0x80
 4276478: d10203a1     	sub	x1, x29, #0x80
 427647c: 9750aeb9     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4276480: b004bd48     	adrp	x8, 0xda1f000 <dyld_stub_binder+0xda1f000>
 4276484: 9114dd08     	add	x8, x8, #0x537
 4276488: f81803a8     	stur	x8, [x29, #-0x80]
 427648c: 910203e0     	add	x0, sp, #0x80
 4276490: d10203a1     	sub	x1, x29, #0x80
 4276494: 9750aeb3     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 4276498: b004bac8     	adrp	x8, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 427649c: 91067d08     	add	x8, x8, #0x19f
 42764a0: f81803a8     	stur	x8, [x29, #-0x80]
 42764a4: 910203e0     	add	x0, sp, #0x80
 42764a8: d10203a1     	sub	x1, x29, #0x80
 42764ac: 9750aead     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 42764b0: 9004b7c8     	adrp	x8, 0xd96e000 <dyld_stub_binder+0xd96e000>
 42764b4: 91170108     	add	x8, x8, #0x5c0
 42764b8: f81803a8     	stur	x8, [x29, #-0x80]
 42764bc: 910203e0     	add	x0, sp, #0x80
 42764c0: d10203a1     	sub	x1, x29, #0x80
 42764c4: 9750aea7     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 42764c8: f004b188     	adrp	x8, 0xd8a9000 <dyld_stub_binder+0xd8a9000>
 42764cc: 910da508     	add	x8, x8, #0x369
 42764d0: f81803a8     	stur	x8, [x29, #-0x80]
 42764d4: 910203e0     	add	x0, sp, #0x80
 42764d8: d10203a1     	sub	x1, x29, #0x80
 42764dc: 9750aea1     	bl	0x16a1f60 <_ChromeMain+0x169ccc4>
 42764e0: d10203a8     	sub	x8, x29, #0x80
 42764e4: 9102c3e0     	add	x0, sp, #0xb0
 42764e8: 910263e1     	add	x1, sp, #0x98
 42764ec: 910203e2     	add	x2, sp, #0x80
 42764f0: 52800003     	mov	w3, #0x0                ; =0
 42764f4: 94000760     	bl	0x4278274 <_ChromeMain+0x4272fd8>
 42764f8: d10203a1     	sub	x1, x29, #0x80
 42764fc: f9400be0     	ldr	x0, [sp, #0x10]
 4276500: 971e9f29     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 4276504: d10203a0     	sub	x0, x29, #0x80
 4276508: 971b9fde     	bl	0x95e480 <_ChromeMain+0x9591e4>
 427650c: f94043e1     	ldr	x1, [sp, #0x80]
 4276510: b50001e1     	cbnz	x1, 0x427654c <_ChromeMain+0x42712b0>
 4276514: f9404fe1     	ldr	x1, [sp, #0x98]
 4276518: b50000c1     	cbnz	x1, 0x4276530 <_ChromeMain+0x4271294>
 427651c: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 4276520: 36ffc5a8     	tbz	w8, #0x1f, 0x4275dd4 <_ChromeMain+0x4270b38>
 4276524: f9405be0     	ldr	x0, [sp, #0xb0]
 4276528: f94063e8     	ldr	x8, [sp, #0xc0]
 427652c: 17fffe28     	b	0x4275dcc <_ChromeMain+0x4270b30>
 4276530: 910263e0     	add	x0, sp, #0x98
 4276534: 9722c26f     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4276538: f9404fe0     	ldr	x0, [sp, #0x98]
 427653c: f94057e8     	ldr	x8, [sp, #0xa8]
 4276540: d37be901     	lsl	x1, x8, #5
 4276544: 96f64a5d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276548: 17fffff5     	b	0x427651c <_ChromeMain+0x4271280>
 427654c: 910203e0     	add	x0, sp, #0x80
 4276550: 9722c268     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4276554: f94043e0     	ldr	x0, [sp, #0x80]
 4276558: f9404be8     	ldr	x8, [sp, #0x90]
 427655c: d37be901     	lsl	x1, x8, #5
 4276560: 96f64a56     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276564: 17ffffec     	b	0x4276514 <_ChromeMain+0x4271278>
 4276568: f9400260     	ldr	x0, [x19]
 427656c: f9400a68     	ldr	x8, [x19, #0x10]
 4276570: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4276574: 96f64a51     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4276578: 17fffdb3     	b	0x4275c44 <_ChromeMain+0x42709a8>
 427657c: 94262784     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
