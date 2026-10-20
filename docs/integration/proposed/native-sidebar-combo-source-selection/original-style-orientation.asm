
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2b67c1c: b9448808     	ldr	w8, [x0, #0x488]
 2b67c20: 6b01011f     	cmp	w8, w1
 2b67c24: 54000041     	b.ne	0x2b67c2c <_ChromeMain+0x2b62990>
 2b67c28: d65f03c0     	ret
 2b67c2c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 2b67c30: a9017bfd     	stp	x29, x30, [sp, #0x10]
 2b67c34: 910043fd     	add	x29, sp, #0x10
 2b67c38: aa0003f3     	mov	x19, x0
 2b67c3c: b9048801     	str	w1, [x0, #0x488]
 2b67c40: f941b400     	ldr	x0, [x0, #0x368]
 2b67c44: b4000120     	cbz	x0, 0x2b67c68 <_ChromeMain+0x2b629cc>
 2b67c48: b9465808     	ldr	w8, [x0, #0x658]
 2b67c4c: 6b01011f     	cmp	w8, w1
 2b67c50: 540000c0     	b.eq	0x2b67c68 <_ChromeMain+0x2b629cc>
 2b67c54: b9065801     	str	w1, [x0, #0x658]
 2b67c58: f9400008     	ldr	x8, [x0]
 2b67c5c: f9418508     	ldr	x8, [x8, #0x308]
 2b67c60: d63f0100     	blr	x8
 2b67c64: b9448a61     	ldr	w1, [x19, #0x488]
 2b67c68: f941ba60     	ldr	x0, [x19, #0x370]
 2b67c6c: b4000120     	cbz	x0, 0x2b67c90 <_ChromeMain+0x2b629f4>
 2b67c70: b9465808     	ldr	w8, [x0, #0x658]
 2b67c74: 6b01011f     	cmp	w8, w1
 2b67c78: 540000c0     	b.eq	0x2b67c90 <_ChromeMain+0x2b629f4>
 2b67c7c: b9065801     	str	w1, [x0, #0x658]
 2b67c80: f9400008     	ldr	x8, [x0]
 2b67c84: f9418508     	ldr	x8, [x8, #0x308]
 2b67c88: d63f0100     	blr	x8
 2b67c8c: b9448a61     	ldr	w1, [x19, #0x488]
 2b67c90: f9410274     	ldr	x20, [x19, #0x200]
 2b67c94: b940f288     	ldr	w8, [x20, #0xf0]
 2b67c98: 6b01011f     	cmp	w8, w1
 2b67c9c: 540000a0     	b.eq	0x2b67cb0 <_ChromeMain+0x2b62a14>
 2b67ca0: b900f281     	str	w1, [x20, #0xf0]
 2b67ca4: aa1403e0     	mov	x0, x20
 2b67ca8: 52800021     	mov	w1, #0x1                ; =1
 2b67cac: 97bbf581     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 2b67cb0: 52800860     	mov	w0, #0x43               ; =67
 2b67cb4: 97666f03     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 2b67cb8: b9010680     	str	w0, [x20, #0x104]
 2b67cbc: aa1303e0     	mov	x0, x19
 2b67cc0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 2b67cc4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 2b67cc8: 1400000e     	b	0x2b67d00 <_ChromeMain+0x2b62a64>
		...
 2b67d00: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2b67d04: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2b67d08: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2b67d0c: 910083fd     	add	x29, sp, #0x20
 2b67d10: aa0003f3     	mov	x19, x0
 2b67d14: f941b400     	ldr	x0, [x0, #0x368]
 2b67d18: b4000440     	cbz	x0, 0x2b67da0 <_ChromeMain+0x2b62b04>
 2b67d1c: 39472008     	ldrb	w8, [x0, #0x1c8]
 2b67d20: 34000b28     	cbz	w8, 0x2b67e84 <_ChromeMain+0x2b62be8>
 2b67d24: f941ba68     	ldr	x8, [x19, #0x370]
 2b67d28: b4000ae8     	cbz	x8, 0x2b67e84 <_ChromeMain+0x2b62be8>
 2b67d2c: 39472108     	ldrb	w8, [x8, #0x1c8]
 2b67d30: 52000114     	eor	w20, w8, #0x1
 2b67d34: b9448a69     	ldr	w9, [x19, #0x488]
 2b67d38: 7100053f     	cmp	w9, #0x1
 2b67d3c: 1a9f17f5     	cset	w21, eq
 2b67d40: 1a9f1689     	csinc	w9, w20, wzr, ne
 2b67d44: 5280006a     	mov	w10, #0x3               ; =3
 2b67d48: 7100011f     	cmp	w8, #0x0
 2b67d4c: 1a9f1141     	csel	w1, w10, wzr, ne
 2b67d50: 37000149     	tbnz	w9, #0x0, 0x2b67d78 <_ChromeMain+0x2b62adc>
 2b67d54: f0061d34     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 2b67d58: b947aa88     	ldr	w8, [x20, #0x7a8]
 2b67d5c: 34000528     	cbz	w8, 0x2b67e00 <_ChromeMain+0x2b62b64>
 2b67d60: 52800014     	mov	w20, #0x0               ; =0
 2b67d64: 52800015     	mov	w21, #0x0               ; =0
 2b67d68: 52800089     	mov	w9, #0x4                ; =4
 2b67d6c: 5280004a     	mov	w10, #0x2               ; =2
 2b67d70: 7100051f     	cmp	w8, #0x1
 2b67d74: 1a890141     	csel	w1, w10, w9, eq
 2b67d78: 94000052     	bl	0x2b67ec0 <_ChromeMain+0x2b62c24>
 2b67d7c: f941ba60     	ldr	x0, [x19, #0x370]
 2b67d80: b40007a0     	cbz	x0, 0x2b67e74 <_ChromeMain+0x2b62bd8>
 2b67d84: 2a150288     	orr	w8, w20, w21
 2b67d88: 36000168     	tbz	w8, #0x0, 0x2b67db4 <_ChromeMain+0x2b62b18>
 2b67d8c: 52000281     	eor	w1, w20, #0x1
 2b67d90: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2b67d94: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2b67d98: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2b67d9c: 14000049     	b	0x2b67ec0 <_ChromeMain+0x2b62c24>
 2b67da0: b9448a68     	ldr	w8, [x19, #0x488]
 2b67da4: 7100051f     	cmp	w8, #0x1
 2b67da8: 1a9f17f5     	cset	w21, eq
 2b67dac: 52800034     	mov	w20, #0x1               ; =1
 2b67db0: 17fffff3     	b	0x2b67d7c <_ChromeMain+0x2b62ae0>
 2b67db4: f0061d34     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 2b67db8: b947aa88     	ldr	w8, [x20, #0x7a8]
 2b67dbc: 340000c8     	cbz	w8, 0x2b67dd4 <_ChromeMain+0x2b62b38>
 2b67dc0: 52800049     	mov	w9, #0x2                ; =2
 2b67dc4: 5280008a     	mov	w10, #0x4               ; =4
 2b67dc8: 7100051f     	cmp	w8, #0x1
 2b67dcc: 1a890141     	csel	w1, w10, w9, eq
 2b67dd0: 17fffff0     	b	0x2b67d90 <_ChromeMain+0x2b62af4>
 2b67dd4: 97b00464     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 2b67dd8: aa0003e8     	mov	x8, x0
 2b67ddc: 39402009     	ldrb	w9, [x0, #0x8]
 2b67de0: 7100053f     	cmp	w9, #0x1
 2b67de4: 54000241     	b.ne	0x2b67e2c <_ChromeMain+0x2b62b90>
 2b67de8: 91005d00     	add	x0, x8, #0x17
 2b67dec: 9756ccc5     	bl	0x11b100 <_ChromeMain+0x115e64>
 2b67df0: aa0003e8     	mov	x8, x0
 2b67df4: b907aa80     	str	w0, [x20, #0x7a8]
 2b67df8: f941ba60     	ldr	x0, [x19, #0x370]
 2b67dfc: 17fffff1     	b	0x2b67dc0 <_ChromeMain+0x2b62b24>
 2b67e00: 97b00459     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 2b67e04: aa0003e8     	mov	x8, x0
 2b67e08: 39402009     	ldrb	w9, [x0, #0x8]
 2b67e0c: 7100053f     	cmp	w9, #0x1
 2b67e10: 54000201     	b.ne	0x2b67e50 <_ChromeMain+0x2b62bb4>
 2b67e14: 91005d00     	add	x0, x8, #0x17
 2b67e18: 9756ccba     	bl	0x11b100 <_ChromeMain+0x115e64>
 2b67e1c: aa0003e8     	mov	x8, x0
 2b67e20: b907aa80     	str	w0, [x20, #0x7a8]
 2b67e24: f941b660     	ldr	x0, [x19, #0x368]
 2b67e28: 17ffffce     	b	0x2b67d60 <_ChromeMain+0x2b62ac4>
 2b67e2c: d00563e0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 2b67e30: 91299000     	add	x0, x0, #0xa64
 2b67e34: 7100093f     	cmp	w9, #0x2
 2b67e38: 54000361     	b.ne	0x2b67ea4 <_ChromeMain+0x2b62c08>
 2b67e3c: f9401108     	ldr	x8, [x8, #0x20]
 2b67e40: f9400508     	ldr	x8, [x8, #0x8]
 2b67e44: f100011f     	cmp	x8, #0x0
 2b67e48: 9a880000     	csel	x0, x0, x8, eq
 2b67e4c: 17ffffe8     	b	0x2b67dec <_ChromeMain+0x2b62b50>
 2b67e50: d00563e0     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 2b67e54: 91299000     	add	x0, x0, #0xa64
 2b67e58: 7100093f     	cmp	w9, #0x2
 2b67e5c: 54000201     	b.ne	0x2b67e9c <_ChromeMain+0x2b62c00>
 2b67e60: f9401108     	ldr	x8, [x8, #0x20]
 2b67e64: f9400508     	ldr	x8, [x8, #0x8]
 2b67e68: f100011f     	cmp	x8, #0x0
 2b67e6c: 9a880000     	csel	x0, x0, x8, eq
 2b67e70: 17ffffea     	b	0x2b67e18 <_ChromeMain+0x2b62b7c>
 2b67e74: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2b67e78: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2b67e7c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2b67e80: d65f03c0     	ret
 2b67e84: 52800001     	mov	w1, #0x0                ; =0
 2b67e88: b9448a68     	ldr	w8, [x19, #0x488]
 2b67e8c: 7100051f     	cmp	w8, #0x1
 2b67e90: 1a9f17f5     	cset	w21, eq
 2b67e94: 52800034     	mov	w20, #0x1               ; =1
 2b67e98: 17ffffb8     	b	0x2b67d78 <_ChromeMain+0x2b62adc>
 2b67e9c: 34fffbe9     	cbz	w9, 0x2b67e18 <_ChromeMain+0x2b62b7c>
 2b67ea0: 14000002     	b	0x2b67ea8 <_ChromeMain+0x2b62c0c>
 2b67ea4: 34fffa49     	cbz	w9, 0x2b67dec <_ChromeMain+0x2b62b50>
 2b67ea8: 9553b7e7     	bl	0x8055e44 <_ChromeMain+0x8050ba8>
		...
