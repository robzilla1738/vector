
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4265bc0: d10143ff     	sub	sp, sp, #0x50
 4265bc4: a90257f6     	stp	x22, x21, [sp, #0x20]
 4265bc8: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4265bcc: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4265bd0: 910103fd     	add	x29, sp, #0x40
 4265bd4: aa0303e4     	mov	x4, x3
 4265bd8: f9400048     	ldr	x8, [x2]
 4265bdc: f90007e8     	str	x8, [sp, #0x8]
 4265be0: 3cc08040     	ldur	q0, [x2, #0x8]
 4265be4: a9007c5f     	stp	xzr, xzr, [x2]
 4265be8: f900085f     	str	xzr, [x2, #0x10]
 4265bec: 3c8103e0     	stur	q0, [sp, #0x10]
 4265bf0: b4000560     	cbz	x0, 0x4265c9c <_ChromeMain+0x4260a00>
 4265bf4: 910023e3     	add	x3, sp, #0x8
 4265bf8: 52800002     	mov	w2, #0x0                ; =0
 4265bfc: 95fffcd4     	bl	0xc264f4c <_ChromeMain+0xc25fcb0> // initWithSource:profiles:onProfileSelected:
 4265c00: aa0003f3     	mov	x19, x0
 4265c04: aa1303e0     	mov	x0, x19
 4265c08: 94f676d8     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4265c0c: f94007f4     	ldr	x20, [sp, #0x8]
 4265c10: b4000334     	cbz	x20, 0x4265c74 <_ChromeMain+0x42609d8>
 4265c14: f9400be8     	ldr	x8, [sp, #0x10]
 4265c18: 8b080909     	add	x9, x8, x8, lsl #2
 4265c1c: d37ced29     	lsl	x9, x9, #4
 4265c20: b40003a9     	cbz	x9, 0x4265c94 <_ChromeMain+0x42609f8>
 4265c24: 8b140129     	add	x9, x9, x20
 4265c28: d1014120     	sub	x0, x9, #0x50
 4265c2c: 928009e9     	mov	x9, #-0x50              ; =-80
 4265c30: 9b097d15     	mul	x21, x8, x9
 4265c34: b40004a0     	cbz	x0, 0x4265cc8 <_ChromeMain+0x4260a2c>
 4265c38: 97ffa107     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4265c3c: d1014000     	sub	x0, x0, #0x50
 4265c40: b10142b5     	adds	x21, x21, #0x50
 4265c44: 54ffff81     	b.ne	0x4265c34 <_ChromeMain+0x4260998>
 4265c48: f94007e0     	ldr	x0, [sp, #0x8]
 4265c4c: cb000288     	sub	x8, x20, x0
 4265c50: 9344fd08     	asr	x8, x8, #4
 4265c54: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4265c58: f29999a9     	movk	x9, #0xcccd
 4265c5c: 9b097d08     	mul	x8, x8, x9
 4265c60: f9000be8     	str	x8, [sp, #0x10]
 4265c64: f9400fe8     	ldr	x8, [sp, #0x18]
 4265c68: 8b080908     	add	x8, x8, x8, lsl #2
 4265c6c: d37ced01     	lsl	x1, x8, #4
 4265c70: 96f68c92     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265c74: aa1303e0     	mov	x0, x19
 4265c78: 94f676b9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265c7c: aa1303e0     	mov	x0, x19
 4265c80: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4265c84: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4265c88: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4265c8c: 910143ff     	add	sp, sp, #0x50
 4265c90: d65f03c0     	ret
 4265c94: aa1403e0     	mov	x0, x20
 4265c98: 17ffffed     	b	0x4265c4c <_ChromeMain+0x42609b0>
 4265c9c: b5000064     	cbnz	x4, 0x4265ca8 <_ChromeMain+0x4260a0c>
 4265ca0: d2800013     	mov	x19, #0x0               ; =0
 4265ca4: 17ffffd8     	b	0x4265c04 <_ChromeMain+0x4260968>
 4265ca8: 12800008     	mov	w8, #-0x1               ; =-1
 4265cac: b8e80088     	ldaddal	w8, w8, [x4]
 4265cb0: 7100051f     	cmp	w8, #0x1
 4265cb4: 54ffff61     	b.ne	0x4265ca0 <_ChromeMain+0x4260a04>
 4265cb8: f9400888     	ldr	x8, [x4, #0x10]
 4265cbc: aa0403e0     	mov	x0, x4
 4265cc0: d63f0100     	blr	x8
 4265cc4: 17fffff7     	b	0x4265ca0 <_ChromeMain+0x4260a04>
 4265cc8: d4200020     	brk	#0x1
 4265ccc: aa0003f3     	mov	x19, x0
 4265cd0: f94007f4     	ldr	x20, [sp, #0x8]
 4265cd4: b4000214     	cbz	x20, 0x4265d14 <_ChromeMain+0x4260a78>
 4265cd8: f9400be8     	ldr	x8, [sp, #0x10]
 4265cdc: 8b080909     	add	x9, x8, x8, lsl #2
 4265ce0: d37ced29     	lsl	x9, x9, #4
 4265ce4: aa1403e0     	mov	x0, x20
 4265ce8: b50001a9     	cbnz	x9, 0x4265d1c <_ChromeMain+0x4260a80>
 4265cec: cb000288     	sub	x8, x20, x0
 4265cf0: 9344fd08     	asr	x8, x8, #4
 4265cf4: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4265cf8: f29999a9     	movk	x9, #0xcccd
 4265cfc: 9b097d08     	mul	x8, x8, x9
 4265d00: f9000be8     	str	x8, [sp, #0x10]
 4265d04: f9400fe8     	ldr	x8, [sp, #0x18]
 4265d08: 8b080908     	add	x8, x8, x8, lsl #2
 4265d0c: d37ced01     	lsl	x1, x8, #4
 4265d10: 96f68c6a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265d14: aa1303e0     	mov	x0, x19
 4265d18: 94f675fb     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4265d1c: 8b140129     	add	x9, x9, x20
 4265d20: d1014120     	sub	x0, x9, #0x50
 4265d24: 928009e9     	mov	x9, #-0x50              ; =-80
 4265d28: 9b097d15     	mul	x21, x8, x9
 4265d2c: b4fffce0     	cbz	x0, 0x4265cc8 <_ChromeMain+0x4260a2c>
 4265d30: 97ffa0c9     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4265d34: d1014000     	sub	x0, x0, #0x50
 4265d38: b10142b5     	adds	x21, x21, #0x50
 4265d3c: 54ffff81     	b.ne	0x4265d2c <_ChromeMain+0x4260a90>
 4265d40: f94007e0     	ldr	x0, [sp, #0x8]
 4265d44: 17ffffea     	b	0x4265cec <_ChromeMain+0x4260a50>
 4265d48: d10143ff     	sub	sp, sp, #0x50
 4265d4c: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4265d50: a90257f6     	stp	x22, x21, [sp, #0x20]
 4265d54: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4265d58: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4265d5c: 910103fd     	add	x29, sp, #0x40
 4265d60: aa0403f4     	mov	x20, x4
 4265d64: aa0303f5     	mov	x21, x3
 4265d68: aa0203f6     	mov	x22, x2
 4265d6c: d0055508     	adrp	x8, 0xed07000 <dyld_stub_binder+0xed07000>
 4265d70: f947b508     	ldr	x8, [x8, #0xf68]
 4265d74: a90023e0     	stp	x0, x8, [sp]
 4265d78: f0055508     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 4265d7c: f943dd01     	ldr	x1, [x8, #0x7b8]
 4265d80: 910003e0     	mov	x0, sp
 4265d84: d2800002     	mov	x2, #0x0                ; =0
 4265d88: d2800003     	mov	x3, #0x0                ; =0
 4265d8c: 955dddb9     	bl	0x99dd470 <_ChromeMain+0x99d81d4>
 4265d90: aa0003f3     	mov	x19, x0
 4265d94: b40008c0     	cbz	x0, 0x4265eac <_ChromeMain+0x4260c10>
 4265d98: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265d9c: b98a8108     	ldrsw	x8, [x8, #0xa80]
 4265da0: b8286a76     	str	w22, [x19, x8]
 4265da4: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265da8: b98a8508     	ldrsw	x8, [x8, #0xa84]
 4265dac: 8b080276     	add	x22, x19, x8
 4265db0: f94002d7     	ldr	x23, [x22]
 4265db4: b4000377     	cbz	x23, 0x4265e20 <_ChromeMain+0x4260b84>
 4265db8: f94006c8     	ldr	x8, [x22, #0x8]
 4265dbc: 8b080909     	add	x9, x8, x8, lsl #2
 4265dc0: d37ced29     	lsl	x9, x9, #4
 4265dc4: b4000709     	cbz	x9, 0x4265ea4 <_ChromeMain+0x4260c08>
 4265dc8: 8b170129     	add	x9, x9, x23
 4265dcc: d1014120     	sub	x0, x9, #0x50
 4265dd0: 928009e9     	mov	x9, #-0x50              ; =-80
 4265dd4: 9b097d18     	mul	x24, x8, x9
 4265dd8: b4000ac0     	cbz	x0, 0x4265f30 <_ChromeMain+0x4260c94>
 4265ddc: 97ffa09e     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4265de0: d1014000     	sub	x0, x0, #0x50
 4265de4: b1014318     	adds	x24, x24, #0x50
 4265de8: 54ffff81     	b.ne	0x4265dd8 <_ChromeMain+0x4260b3c>
 4265dec: f94002c0     	ldr	x0, [x22]
 4265df0: cb0002e8     	sub	x8, x23, x0
 4265df4: 9344fd08     	asr	x8, x8, #4
 4265df8: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4265dfc: f29999a9     	movk	x9, #0xcccd
 4265e00: 9b097d08     	mul	x8, x8, x9
 4265e04: f90006c8     	str	x8, [x22, #0x8]
 4265e08: f9400ac8     	ldr	x8, [x22, #0x10]
 4265e0c: 8b080908     	add	x8, x8, x8, lsl #2
 4265e10: d37ced01     	lsl	x1, x8, #4
 4265e14: 96f68c29     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265e18: a9007edf     	stp	xzr, xzr, [x22]
 4265e1c: f9000adf     	str	xzr, [x22, #0x10]
 4265e20: f94002a8     	ldr	x8, [x21]
 4265e24: f90002c8     	str	x8, [x22]
 4265e28: f94006a8     	ldr	x8, [x21, #0x8]
 4265e2c: f90006c8     	str	x8, [x22, #0x8]
 4265e30: f9400aa8     	ldr	x8, [x21, #0x10]
 4265e34: f9000ac8     	str	x8, [x22, #0x10]
 4265e38: a9007ebf     	stp	xzr, xzr, [x21]
 4265e3c: f9000abf     	str	xzr, [x21, #0x10]
 4265e40: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265e44: b98a8908     	ldrsw	x8, [x8, #0xa88]
 4265e48: f8686a75     	ldr	x21, [x19, x8]
 4265e4c: f8286a74     	str	x20, [x19, x8]
 4265e50: b5000415     	cbnz	x21, 0x4265ed0 <_ChromeMain+0x4260c34>
 4265e54: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4265e58: f9431d00     	ldr	x0, [x8, #0x638]
 4265e5c: 95251257     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 4265e60: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265e64: b98a8d09     	ldrsw	x9, [x8, #0xa8c]
 4265e68: f8696a68     	ldr	x8, [x19, x9]
 4265e6c: f8296a60     	str	x0, [x19, x9]
 4265e70: aa0803e0     	mov	x0, x8
 4265e74: 94f6763a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265e78: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265e7c: b98a9108     	ldrsw	x8, [x8, #0xa90]
 4265e80: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 4265e84: f8286a69     	str	x9, [x19, x8]
 4265e88: aa1303e0     	mov	x0, x19
 4265e8c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4265e90: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4265e94: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4265e98: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4265e9c: 910143ff     	add	sp, sp, #0x50
 4265ea0: d65f03c0     	ret
 4265ea4: aa1703e0     	mov	x0, x23
 4265ea8: 17ffffd2     	b	0x4265df0 <_ChromeMain+0x4260b54>
 4265eac: b4fffef4     	cbz	x20, 0x4265e88 <_ChromeMain+0x4260bec>
 4265eb0: 12800008     	mov	w8, #-0x1               ; =-1
 4265eb4: b8e80288     	ldaddal	w8, w8, [x20]
 4265eb8: 7100051f     	cmp	w8, #0x1
 4265ebc: 54fffe61     	b.ne	0x4265e88 <_ChromeMain+0x4260bec>
 4265ec0: f9400a88     	ldr	x8, [x20, #0x10]
 4265ec4: aa1403e0     	mov	x0, x20
 4265ec8: d63f0100     	blr	x8
 4265ecc: 17ffffef     	b	0x4265e88 <_ChromeMain+0x4260bec>
 4265ed0: 12800008     	mov	w8, #-0x1               ; =-1
 4265ed4: b8e802a8     	ldaddal	w8, w8, [x21]
 4265ed8: 7100051f     	cmp	w8, #0x1
 4265edc: 54fffbc1     	b.ne	0x4265e54 <_ChromeMain+0x4260bb8>
 4265ee0: f9400aa8     	ldr	x8, [x21, #0x10]
 4265ee4: 90fe6a09     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 4265ee8: 91190129     	add	x9, x9, #0x640
 4265eec: eb09011f     	cmp	x8, x9
 4265ef0: 54000140     	b.eq	0x4265f18 <_ChromeMain+0x4260c7c>
 4265ef4: f0ffb829     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64> //  literal '`'
 4265ef8: 91180129     	add	x9, x9, #0x600
 4265efc: aa1503e0     	mov	x0, x21
 4265f00: eb09011f     	cmp	x8, x9
 4265f04: 54000060     	b.eq	0x4265f10 <_ChromeMain+0x4260c74>
 4265f08: d63f0100     	blr	x8
 4265f0c: 17ffffd2     	b	0x4265e54 <_ChromeMain+0x4260bb8>
 4265f10: 52800701     	mov	w1, #0x38               ; =56
 4265f14: 14000005     	b	0x4265f28 <_ChromeMain+0x4260c8c>
 4265f18: f9401aa0     	ldr	x0, [x21, #0x30]
 4265f1c: b50000c0     	cbnz	x0, 0x4265f34 <_ChromeMain+0x4260c98>
 4265f20: aa1503e0     	mov	x0, x21
 4265f24: 52800901     	mov	w1, #0x48               ; =72
 4265f28: 96f68be4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265f2c: 17ffffca     	b	0x4265e54 <_ChromeMain+0x4260bb8>
 4265f30: d4200020     	brk	#0x1
 4265f34: 12800008     	mov	w8, #-0x1               ; =-1
 4265f38: b8e80008     	ldaddal	w8, w8, [x0]
 4265f3c: 7100051f     	cmp	w8, #0x1
 4265f40: 54ffff01     	b.ne	0x4265f20 <_ChromeMain+0x4260c84>
 4265f44: 52800101     	mov	w1, #0x8                ; =8
 4265f48: 96f68bdc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265f4c: 17fffff5     	b	0x4265f20 <_ChromeMain+0x4260c84>
 4265f50: aa0003f3     	mov	x19, x0
 4265f54: b5000074     	cbnz	x20, 0x4265f60 <_ChromeMain+0x4260cc4>
 4265f58: aa1303e0     	mov	x0, x19
 4265f5c: 94f6756a     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4265f60: 12800008     	mov	w8, #-0x1               ; =-1
 4265f64: b8e80288     	ldaddal	w8, w8, [x20]
 4265f68: 7100051f     	cmp	w8, #0x1
 4265f6c: 54ffff61     	b.ne	0x4265f58 <_ChromeMain+0x4260cbc>
 4265f70: f9400a88     	ldr	x8, [x20, #0x10]
 4265f74: aa1403e0     	mov	x0, x20
 4265f78: d63f0100     	blr	x8
 4265f7c: 17fffff7     	b	0x4265f58 <_ChromeMain+0x4260cbc>
 4265f80: d10483ff     	sub	sp, sp, #0x120
 4265f84: 6d0b23e9     	stp	d9, d8, [sp, #0xb0]
 4265f88: a90c6ffc     	stp	x28, x27, [sp, #0xc0]
 4265f8c: a90d67fa     	stp	x26, x25, [sp, #0xd0]
 4265f90: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 4265f94: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 4265f98: a9104ff4     	stp	x20, x19, [sp, #0x100]
 4265f9c: a9117bfd     	stp	x29, x30, [sp, #0x110]
 4265fa0: 910443fd     	add	x29, sp, #0x110
 4265fa4: aa0003f3     	mov	x19, x0
 4265fa8: f004ee08     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4265fac: f940f908     	ldr	x8, [x8, #0x1f0]
 4265fb0: f9400108     	ldr	x8, [x8]
 4265fb4: f81903a8     	stur	x8, [x29, #-0x70]
 4265fb8: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4265fbc: f9447d00     	ldr	x0, [x8, #0x8f8]
 4265fc0: 952beade     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 4265fc4: d0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4265fc8: b98a8508     	ldrsw	x8, [x8, #0xa84]
 4265fcc: 8b08027b     	add	x27, x19, x8
 4265fd0: f9400768     	ldr	x8, [x27, #0x8]
 4265fd4: f100051f     	cmp	x8, #0x1
 4265fd8: 9a9f8508     	csinc	x8, x8, xzr, hi
 4265fdc: 9e630100     	ucvtf	d0, x8
 4265fe0: 1e66d001     	fmov	d1, #22.00000000
 4265fe4: 1e610800     	fmul	d0, d0, d1
 4265fe8: 9004e748     	adrp	x8, 0xdf4d000 <dyld_stub_binder+0xdf4d000>
 4265fec: fd418901     	ldr	d1, [x8, #0x310]
 4265ff0: 1e612800     	fadd	d0, d0, d1
 4265ff4: d2e80e88     	mov	x8, #0x4074000000000000 ; =4644337115725824000
 4265ff8: 9e670102     	fmov	d2, x8
 4265ffc: d503201f     	nop
 4266000: 1e622000     	fcmp	d0, d2
 4266004: 1e60cc43     	fcsel	d3, d2, d0, gt
 4266008: 6f00e400     	movi.2d	v0, #0000000000000000
 426600c: 6f00e401     	movi.2d	v1, #0000000000000000
 4266010: 95b09802     	bl	0xae8c018 <_ChromeMain+0xae86d7c> // initWithFrame:
 4266014: aa0003f7     	mov	x23, x0
 4266018: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426601c: f946d100     	ldr	x0, [x8, #0xda0]
 4266020: 952beac6     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 4266024: aa0003f4     	mov	x20, x0
 4266028: aa1703e0     	mov	x0, x23
 426602c: 95b097f8     	bl	0xae8c00c <_ChromeMain+0xae86d70> // bounds
 4266030: aa1403e0     	mov	x0, x20
 4266034: 95b097f9     	bl	0xae8c018 <_ChromeMain+0xae86d7c> // initWithFrame:
 4266038: aa0003f6     	mov	x22, x0
 426603c: 52800022     	mov	w2, #0x1                ; =1
 4266040: 95fffcf7     	bl	0xc26541c <_ChromeMain+0xc260180> // setOrientation:
 4266044: aa1603e0     	mov	x0, x22
 4266048: 528000a2     	mov	w2, #0x5                ; =5
 426604c: 95fffcf7     	bl	0xc265428 <_ChromeMain+0xc26018c> // setAlignment:
 4266050: 1e651000     	fmov	d0, #12.00000000
 4266054: aa1603e0     	mov	x0, x22
 4266058: 95fffcf7     	bl	0xc265434 <_ChromeMain+0xc260198> // setSpacing:
 426605c: 1e661000     	fmov	d0, #16.00000000
 4266060: 1e661001     	fmov	d1, #16.00000000
 4266064: 1e651002     	fmov	d2, #12.00000000
 4266068: 1e661003     	fmov	d3, #16.00000000
 426606c: aa1603e0     	mov	x0, x22
 4266070: 95fffcf4     	bl	0xc265440 <_ChromeMain+0xc2601a4> // setEdgeInsets:
 4266074: aa1603e0     	mov	x0, x22
 4266078: 52800002     	mov	w2, #0x0                ; =0
 426607c: 95fffcf4     	bl	0xc26544c <_ChromeMain+0xc2601b0> // setTranslatesAutoresizingMaskIntoConstraints:
 4266080: aa1703e0     	mov	x0, x23
 4266084: aa1603e2     	mov	x2, x22
 4266088: 95a13cf7     	bl	0xaab5464 <_ChromeMain+0xaab01c8> // addSubview:
 426608c: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266090: f946d508     	ldr	x8, [x8, #0xda8]
 4266094: f90013e8     	str	x8, [sp, #0x20]
 4266098: aa1603e0     	mov	x0, x22
 426609c: 95fffcef     	bl	0xc265458 <_ChromeMain+0xc2601bc> // leadingAnchor
 42660a0: 94f675a6     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42660a4: aa0003f4     	mov	x20, x0
 42660a8: f9002be0     	str	x0, [sp, #0x50]
 42660ac: aa1703e0     	mov	x0, x23
 42660b0: 95fffcea     	bl	0xc265458 <_ChromeMain+0xc2601bc> // leadingAnchor
 42660b4: 94f675a1     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42660b8: aa0003e2     	mov	x2, x0
 42660bc: f90023e0     	str	x0, [sp, #0x40]
 42660c0: aa1403e0     	mov	x0, x20
 42660c4: 95fffce8     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 42660c8: 94f6759c     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42660cc: f9001fe0     	str	x0, [sp, #0x38]
 42660d0: f90043e0     	str	x0, [sp, #0x80]
 42660d4: aa1603e0     	mov	x0, x22
 42660d8: 95fffce6     	bl	0xc265470 <_ChromeMain+0xc2601d4> // trailingAnchor
 42660dc: 94f67597     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42660e0: aa0003f4     	mov	x20, x0
 42660e4: f9001be0     	str	x0, [sp, #0x30]
 42660e8: aa1703e0     	mov	x0, x23
 42660ec: 95fffce1     	bl	0xc265470 <_ChromeMain+0xc2601d4> // trailingAnchor
 42660f0: 94f67592     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42660f4: aa0003e2     	mov	x2, x0
 42660f8: f90017e0     	str	x0, [sp, #0x28]
 42660fc: aa1403e0     	mov	x0, x20
 4266100: 95fffcd9     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 4266104: 94f6758d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266108: aa0003fc     	mov	x28, x0
 426610c: f90047e0     	str	x0, [sp, #0x88]
 4266110: aa1603e0     	mov	x0, x22
 4266114: 95fffcda     	bl	0xc26547c <_ChromeMain+0xc2601e0> // topAnchor
 4266118: 94f67588     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426611c: aa0003f4     	mov	x20, x0
 4266120: aa1703e0     	mov	x0, x23
 4266124: 95fffcd6     	bl	0xc26547c <_ChromeMain+0xc2601e0> // topAnchor
 4266128: 94f67584     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426612c: aa0003f5     	mov	x21, x0
 4266130: aa1403e0     	mov	x0, x20
 4266134: aa1503e2     	mov	x2, x21
 4266138: 95fffccb     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 426613c: 94f6757f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266140: aa0003fa     	mov	x26, x0
 4266144: f9004be0     	str	x0, [sp, #0x90]
 4266148: f90027f6     	str	x22, [sp, #0x48]
 426614c: aa1603e0     	mov	x0, x22
 4266150: 95fffcce     	bl	0xc265488 <_ChromeMain+0xc2601ec> // bottomAnchor
 4266154: 94f67579     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266158: aa0003f6     	mov	x22, x0
 426615c: f9000ff7     	str	x23, [sp, #0x18]
 4266160: aa1703e0     	mov	x0, x23
 4266164: 95fffcc9     	bl	0xc265488 <_ChromeMain+0xc2601ec> // bottomAnchor
 4266168: 94f67574     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426616c: aa0003f7     	mov	x23, x0
 4266170: aa1603e0     	mov	x0, x22
 4266174: aa1703e2     	mov	x2, x23
 4266178: 95fffcbb     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 426617c: 94f6756f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266180: aa0003f8     	mov	x24, x0
 4266184: f9004fe0     	str	x0, [sp, #0x98]
 4266188: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426618c: f9433100     	ldr	x0, [x8, #0x660]
 4266190: 910203e2     	add	x2, sp, #0x80
 4266194: 52800083     	mov	w3, #0x4                ; =4
 4266198: 9586e594     	bl	0xa41f7e8 <_ChromeMain+0xa41a54c> // arrayWithObjects:count:
 426619c: 94f67567     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42661a0: aa0003f9     	mov	x25, x0
 42661a4: f94013e0     	ldr	x0, [sp, #0x20]
 42661a8: aa1903e2     	mov	x2, x25
 42661ac: 95fffced     	bl	0xc265560 <_ChromeMain+0xc2602c4> // activateConstraints:
 42661b0: aa1903e0     	mov	x0, x25
 42661b4: 94f6756a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661b8: aa1803e0     	mov	x0, x24
 42661bc: 94f67568     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661c0: aa1703e0     	mov	x0, x23
 42661c4: 94f67566     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661c8: aa1603e0     	mov	x0, x22
 42661cc: 94f67564     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661d0: aa1a03e0     	mov	x0, x26
 42661d4: 94f67562     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661d8: aa1503e0     	mov	x0, x21
 42661dc: 94f67560     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661e0: aa1403e0     	mov	x0, x20
 42661e4: 94f6755e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661e8: aa1c03e0     	mov	x0, x28
 42661ec: 94f6755c     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661f0: f94017e0     	ldr	x0, [sp, #0x28]
 42661f4: 94f6755a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42661f8: f9401be0     	ldr	x0, [sp, #0x30]
 42661fc: 94f67558     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266200: f9401fe0     	ldr	x0, [sp, #0x38]
 4266204: 94f67556     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266208: f94023e0     	ldr	x0, [sp, #0x40]
 426620c: 94f67554     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266210: f9402be0     	ldr	x0, [sp, #0x50]
 4266214: 94f67552     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266218: f0055439     	adrp	x25, 0xeced000 <dyld_stub_binder+0xeced000>
 426621c: f9464b34     	ldr	x20, [x25, #0xc90]
 4266220: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266224: f9433516     	ldr	x22, [x8, #0x668]
 4266228: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 426622c: b98a811a     	ldrsw	x26, [x8, #0xa80]
 4266230: b87a6a60     	ldr	w0, [x19, x26]
 4266234: 910163f5     	add	x21, sp, #0x58
 4266238: 910163e8     	add	x8, sp, #0x58
 426623c: 97ffe715     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4266240: 3981bfe8     	ldrsb	x8, [sp, #0x6f]
 4266244: a945abe9     	ldp	x9, x10, [sp, #0x58]
 4266248: f100011f     	cmp	x8, #0x0
 426624c: 9a954120     	csel	x0, x9, x21, mi
 4266250: 7100011f     	cmp	w8, #0x0
 4266254: 9a884141     	csel	x1, x10, x8, mi
 4266258: 97681764     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 426625c: 94f67537     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266260: aa0003f5     	mov	x21, x0
 4266264: f90003e0     	str	x0, [sp]
 4266268: f0054642     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426626c: 91266042     	add	x2, x2, #0x998
 4266270: aa1603e0     	mov	x0, x22
 4266274: 95681337     	bl	0x9c6af50 <_ChromeMain+0x9c65cb4> // stringWithFormat:
 4266278: 94f67530     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426627c: aa0003f7     	mov	x23, x0
 4266280: aa1403e0     	mov	x0, x20
 4266284: aa1703e2     	mov	x2, x23
 4266288: 95fffce0     	bl	0xc265608 <_ChromeMain+0xc26036c> // labelWithString:
 426628c: 94f6752b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266290: aa0003f6     	mov	x22, x0
 4266294: aa1703e0     	mov	x0, x23
 4266298: 94f67531     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426629c: aa1503e0     	mov	x0, x21
 42662a0: 94f6752f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42662a4: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 42662a8: 36f800a8     	tbz	w8, #0x1f, 0x42662bc <_ChromeMain+0x4261020>
 42662ac: f9402fe0     	ldr	x0, [sp, #0x58]
 42662b0: f94037e8     	ldr	x8, [sp, #0x68]
 42662b4: d37ff901     	lsl	x1, x8, #1
 42662b8: 96f68b00     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42662bc: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42662c0: f9440d00     	ldr	x0, [x8, #0x818]
 42662c4: 9004ee28     	adrp	x8, 0xe02a000 <dyld_stub_binder+0xe02a000>
 42662c8: f940c908     	ldr	x8, [x8, #0x190]
 42662cc: fd400101     	ldr	d1, [x8]
 42662d0: 1e655000     	fmov	d0, #13.00000000
 42662d4: 955d7dcc     	bl	0x99c5a04 <_ChromeMain+0x99c0768> // systemFontOfSize:weight:
 42662d8: 94f67518     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42662dc: aa0003f4     	mov	x20, x0
 42662e0: aa1603e0     	mov	x0, x22
 42662e4: aa1403e2     	mov	x2, x20
 42662e8: 95fb8ca1     	bl	0xc14956c <_ChromeMain+0xc1442d0> // setFont:
 42662ec: aa1403e0     	mov	x0, x20
 42662f0: 94f6751b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42662f4: f94027fc     	ldr	x28, [sp, #0x48]
 42662f8: aa1c03e0     	mov	x0, x28
 42662fc: aa1603e2     	mov	x2, x22
 4266300: 95fffcc5     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 4266304: 1e631000     	fmov	d0, #6.00000000
 4266308: aa1c03e0     	mov	x0, x28
 426630c: aa1603e2     	mov	x2, x22
 4266310: 95fffcc4     	bl	0xc265620 <_ChromeMain+0xc260384> // setCustomSpacing:afterView:
 4266314: f9464b34     	ldr	x20, [x25, #0xc90]
 4266318: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426631c: f9433517     	ldr	x23, [x8, #0x668]
 4266320: b87a6a60     	ldr	w0, [x19, x26]
 4266324: 910163f5     	add	x21, sp, #0x58
 4266328: 910163e8     	add	x8, sp, #0x58
 426632c: 97ffe6d9     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4266330: 3981bfe8     	ldrsb	x8, [sp, #0x6f]
 4266334: a945abe9     	ldp	x9, x10, [sp, #0x58]
 4266338: f100011f     	cmp	x8, #0x0
 426633c: 9a954120     	csel	x0, x9, x21, mi
 4266340: 7100011f     	cmp	w8, #0x0
 4266344: 9a884141     	csel	x1, x10, x8, mi
 4266348: 97681728     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 426634c: 94f674fb     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266350: aa0003f5     	mov	x21, x0
 4266354: f90003e0     	str	x0, [sp]
 4266358: f0054642     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426635c: 9126e042     	add	x2, x2, #0x9b8
 4266360: aa1703e0     	mov	x0, x23
 4266364: 956812fb     	bl	0x9c6af50 <_ChromeMain+0x9c65cb4> // stringWithFormat:
 4266368: 94f674f4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426636c: aa0003f8     	mov	x24, x0
 4266370: aa1403e0     	mov	x0, x20
 4266374: aa1803e2     	mov	x2, x24
 4266378: 95fffca4     	bl	0xc265608 <_ChromeMain+0xc26036c> // labelWithString:
 426637c: 94f674ef     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266380: aa0003f7     	mov	x23, x0
 4266384: f90023f6     	str	x22, [sp, #0x40]
 4266388: aa1803e0     	mov	x0, x24
 426638c: 94f674f4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266390: aa1503e0     	mov	x0, x21
 4266394: 94f674f2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266398: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 426639c: 36f800a8     	tbz	w8, #0x1f, 0x42663b0 <_ChromeMain+0x4261114>
 42663a0: f9402fe0     	ldr	x0, [sp, #0x58]
 42663a4: f94037e8     	ldr	x8, [sp, #0x68]
 42663a8: d37ff901     	lsl	x1, x8, #1
 42663ac: 96f68ac3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42663b0: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42663b4: f9440d00     	ldr	x0, [x8, #0x818]
 42663b8: 1e651000     	fmov	d0, #12.00000000
 42663bc: 959a284d     	bl	0xa8f04f0 <_ChromeMain+0xa8eb254> // systemFontOfSize:
 42663c0: 94f674de     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42663c4: aa0003f4     	mov	x20, x0
 42663c8: aa1703e0     	mov	x0, x23
 42663cc: aa1403e2     	mov	x2, x20
 42663d0: 95fb8c67     	bl	0xc14956c <_ChromeMain+0xc1442d0> // setFont:
 42663d4: aa1403e0     	mov	x0, x20
 42663d8: 94f674e1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42663dc: f0055436     	adrp	x22, 0xeced000 <dyld_stub_binder+0xeced000>
 42663e0: f9441ec0     	ldr	x0, [x22, #0x838]
 42663e4: 95fffcf7     	bl	0xc2657c0 <_ChromeMain+0xc260524> // secondaryLabelColor
 42663e8: 94f674d4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42663ec: aa0003f4     	mov	x20, x0
 42663f0: aa1703e0     	mov	x0, x23
 42663f4: aa1403e2     	mov	x2, x20
 42663f8: 95fffcf5     	bl	0xc2657cc <_ChromeMain+0xc260530> // setTextColor:
 42663fc: aa1403e0     	mov	x0, x20
 4266400: 94f674d7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266404: aa1703e0     	mov	x0, x23
 4266408: d2800002     	mov	x2, #0x0                ; =0
 426640c: 95fb8f26     	bl	0xc14a0a4 <_ChromeMain+0xc144e08> // setLineBreakMode:
 4266410: aa1703e0     	mov	x0, x23
 4266414: 52800042     	mov	w2, #0x2                ; =2
 4266418: 95fffcf0     	bl	0xc2657d8 <_ChromeMain+0xc26053c> // setMaximumNumberOfLines:
 426641c: aa1703e0     	mov	x0, x23
 4266420: 95fbafce     	bl	0xc152358 <_ChromeMain+0xc14d0bc> // widthAnchor
 4266424: 94f674c5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266428: aa0003f4     	mov	x20, x0
 426642c: d2e80e48     	mov	x8, #0x4072000000000000 ; =4643774165772402688
 4266430: 9e670108     	fmov	d8, x8
 4266434: 4ea81d00     	mov.16b	v0, v8
 4266438: 95fffceb     	bl	0xc2657e4 <_ChromeMain+0xc260548> // constraintEqualToConstant:
 426643c: 94f674bf     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266440: aa0003f5     	mov	x21, x0
 4266444: 52800022     	mov	w2, #0x1                ; =1
 4266448: 95fbafca     	bl	0xc152370 <_ChromeMain+0xc14d0d4> // setActive:
 426644c: aa1503e0     	mov	x0, x21
 4266450: 94f674c3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266454: aa1403e0     	mov	x0, x20
 4266458: 94f674c1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426645c: aa1c03e0     	mov	x0, x28
 4266460: f9001ff7     	str	x23, [sp, #0x38]
 4266464: aa1703e2     	mov	x2, x23
 4266468: 95fffc6b     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 426646c: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266470: f946d100     	ldr	x0, [x8, #0xda0]
 4266474: 952510d1     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 4266478: aa0003f7     	mov	x23, x0
 426647c: 52800022     	mov	w2, #0x1                ; =1
 4266480: 95fffbe7     	bl	0xc26541c <_ChromeMain+0xc260180> // setOrientation:
 4266484: aa1703e0     	mov	x0, x23
 4266488: 528000a2     	mov	w2, #0x5                ; =5
 426648c: 95fffbe7     	bl	0xc265428 <_ChromeMain+0xc26018c> // setAlignment:
 4266490: 1e641000     	fmov	d0, #8.00000000
 4266494: aa1703e0     	mov	x0, x23
 4266498: 95fffbe7     	bl	0xc265434 <_ChromeMain+0xc260198> // setSpacing:
 426649c: aa1703e0     	mov	x0, x23
 42664a0: 95fbafae     	bl	0xc152358 <_ChromeMain+0xc14d0bc> // widthAnchor
 42664a4: 94f674a5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42664a8: aa0003f4     	mov	x20, x0
 42664ac: 4ea81d00     	mov.16b	v0, v8
 42664b0: 95fffccd     	bl	0xc2657e4 <_ChromeMain+0xc260548> // constraintEqualToConstant:
 42664b4: 94f674a1     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42664b8: aa0003f5     	mov	x21, x0
 42664bc: 52800022     	mov	w2, #0x1                ; =1
 42664c0: 95fbafac     	bl	0xc152370 <_ChromeMain+0xc14d0d4> // setActive:
 42664c4: aa1503e0     	mov	x0, x21
 42664c8: 94f674a5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42664cc: aa1403e0     	mov	x0, x20
 42664d0: 94f674a3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42664d4: aa1c03e0     	mov	x0, x28
 42664d8: f9002bf7     	str	x23, [sp, #0x50]
 42664dc: aa1703e2     	mov	x2, x23
 42664e0: 95fffc4d     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 42664e4: f9400768     	ldr	x8, [x27, #0x8]
 42664e8: f004ee17     	adrp	x23, 0xe029000 <dyld_stub_binder+0xe029000>
 42664ec: f9433ef7     	ldr	x23, [x23, #0x678]
 42664f0: b4000ca8     	cbz	x8, 0x4266684 <_ChromeMain+0x42613e8>
 42664f4: d2800018     	mov	x24, #0x0               ; =0
 42664f8: d2800019     	mov	x25, #0x0               ; =0
 42664fc: d0055508     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 4266500: f943e11a     	ldr	x26, [x8, #0x7c0]
 4266504: 14000043     	b	0x4266610 <_ChromeMain+0x4261374>
 4266508: f94022a1     	ldr	x1, [x21, #0x40]
 426650c: b4000261     	cbz	x1, 0x4266558 <_ChromeMain+0x42612bc>
 4266510: f9400000     	ldr	x0, [x0]
 4266514: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266518: f9433515     	ldr	x21, [x8, #0x668]
 426651c: 976816b3     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 4266520: 94f67486     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266524: aa0003f6     	mov	x22, x0
 4266528: a90003f4     	stp	x20, x0, [sp]
 426652c: aa1503e0     	mov	x0, x21
 4266530: f0054642     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4266534: 91286042     	add	x2, x2, #0xa18
 4266538: 95681286     	bl	0x9c6af50 <_ChromeMain+0x9c65cb4> // stringWithFormat:
 426653c: 94f6747f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266540: aa0003f5     	mov	x21, x0
 4266544: aa1603e0     	mov	x0, x22
 4266548: 94f67485     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426654c: aa1403e0     	mov	x0, x20
 4266550: 94f67483     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266554: aa1503f4     	mov	x20, x21
 4266558: aa1c03e0     	mov	x0, x28
 426655c: aa1403e2     	mov	x2, x20
 4266560: 95b8aab5     	bl	0xb091034 <_ChromeMain+0xb08bd98> // setTitle:
 4266564: aa1403e0     	mov	x0, x20
 4266568: 94f6747d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426656c: aa1c03e0     	mov	x0, x28
 4266570: aa1303e2     	mov	x2, x19
 4266574: 95681062     	bl	0x9c6a6fc <_ChromeMain+0x9c65460> // setTarget:
 4266578: aa1c03e0     	mov	x0, x28
 426657c: aa1a03e2     	mov	x2, x26
 4266580: 959fe1dd     	bl	0xaa5ecf4 <_ChromeMain+0xaa59a58> // setAction:
 4266584: aa1c03e0     	mov	x0, x28
 4266588: 52800062     	mov	w2, #0x3                ; =3
 426658c: 95fb8bf2     	bl	0xc149554 <_ChromeMain+0xc1442b8> // setButtonType:
 4266590: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266594: f9440d00     	ldr	x0, [x8, #0x818]
 4266598: 1e655000     	fmov	d0, #13.00000000
 426659c: 959a27d5     	bl	0xa8f04f0 <_ChromeMain+0xa8eb254> // systemFontOfSize:
 42665a0: 94f67466     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42665a4: aa0003f4     	mov	x20, x0
 42665a8: aa1c03e0     	mov	x0, x28
 42665ac: aa1403e2     	mov	x2, x20
 42665b0: 95fb8bef     	bl	0xc14956c <_ChromeMain+0xc1442d0> // setFont:
 42665b4: aa1403e0     	mov	x0, x20
 42665b8: 94f67469     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42665bc: aa1c03e0     	mov	x0, x28
 42665c0: aa1903e2     	mov	x2, x25
 42665c4: 95681051     	bl	0x9c6a708 <_ChromeMain+0x9c6546c> // setTag:
 42665c8: aa1c03e0     	mov	x0, x28
 42665cc: d2800002     	mov	x2, #0x0                ; =0
 42665d0: 95b8a8a3     	bl	0xb09085c <_ChromeMain+0xb08b5c0> // setState:
 42665d4: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 42665d8: b98a8d08     	ldrsw	x8, [x8, #0xa8c]
 42665dc: f8686a60     	ldr	x0, [x19, x8]
 42665e0: aa1c03e2     	mov	x2, x28
 42665e4: 958017c8     	bl	0xa26c504 <_ChromeMain+0xa267268> // addObject:
 42665e8: f9402be0     	ldr	x0, [sp, #0x50]
 42665ec: aa1c03e2     	mov	x2, x28
 42665f0: 95fffc09     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 42665f4: aa1c03e0     	mov	x0, x28
 42665f8: 94f67459     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42665fc: 91000739     	add	x25, x25, #0x1
 4266600: f9400768     	ldr	x8, [x27, #0x8]
 4266604: 91014318     	add	x24, x24, #0x50
 4266608: eb08033f     	cmp	x25, x8
 426660c: 54000ba2     	b.hs	0x4266780 <_ChromeMain+0x42614e4>
 4266610: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266614: f9463500     	ldr	x0, [x8, #0xc68]
 4266618: 952be948     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 426661c: 6d4006e0     	ldp	d0, d1, [x23]
 4266620: 6d410ee2     	ldp	d2, d3, [x23, #0x10]
 4266624: 95b0967d     	bl	0xae8c018 <_ChromeMain+0xae86d7c> // initWithFrame:
 4266628: f9400768     	ldr	x8, [x27, #0x8]
 426662c: eb08033f     	cmp	x25, x8
 4266630: 54000282     	b.hs	0x4266680 <_ChromeMain+0x42613e4>
 4266634: aa0003fc     	mov	x28, x0
 4266638: f9400368     	ldr	x8, [x27]
 426663c: 8b180115     	add	x21, x8, x24
 4266640: aa1503f6     	mov	x22, x21
 4266644: f8420ec8     	ldr	x8, [x22, #0x20]!
 4266648: 39805ec9     	ldrsb	x9, [x22, #0x17]
 426664c: f100013f     	cmp	x9, #0x0
 4266650: 9a964100     	csel	x0, x8, x22, mi
 4266654: f94006c8     	ldr	x8, [x22, #0x8]
 4266658: 7100013f     	cmp	w9, #0x0
 426665c: 9a894101     	csel	x1, x8, x9, mi
 4266660: 97681662     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 4266664: 94f67435     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266668: aa0003f4     	mov	x20, x0
 426666c: 910062c0     	add	x0, x22, #0x18
 4266670: 3980bec1     	ldrsb	x1, [x22, #0x2f]
 4266674: b7fff4a1     	tbnz	x1, #0x3f, 0x4266508 <_ChromeMain+0x426126c>
 4266678: 35fff4e1     	cbnz	w1, 0x4266514 <_ChromeMain+0x4261278>
 426667c: 17ffffb7     	b	0x4266558 <_ChromeMain+0x42612bc>
 4266680: d4200020     	brk	#0x1
 4266684: f9464b34     	ldr	x20, [x25, #0xc90]
 4266688: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426668c: f9433519     	ldr	x25, [x8, #0x668]
 4266690: b87a6a60     	ldr	w0, [x19, x26]
 4266694: 910163f5     	add	x21, sp, #0x58
 4266698: 910163e8     	add	x8, sp, #0x58
 426669c: 97ffe5fd     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42666a0: 3981bfe8     	ldrsb	x8, [sp, #0x6f]
 42666a4: a945abe9     	ldp	x9, x10, [sp, #0x58]
 42666a8: f100011f     	cmp	x8, #0x0
 42666ac: 9a954120     	csel	x0, x9, x21, mi
 42666b0: 7100011f     	cmp	w8, #0x0
 42666b4: 9a884141     	csel	x1, x10, x8, mi
 42666b8: 9768164c     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 42666bc: 94f6741f     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42666c0: aa0003f5     	mov	x21, x0
 42666c4: f90003e0     	str	x0, [sp]
 42666c8: f0054642     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 42666cc: 91276042     	add	x2, x2, #0x9d8
 42666d0: aa1903e0     	mov	x0, x25
 42666d4: 9568121f     	bl	0x9c6af50 <_ChromeMain+0x9c65cb4> // stringWithFormat:
 42666d8: 94f67418     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42666dc: aa0003f9     	mov	x25, x0
 42666e0: aa1403e0     	mov	x0, x20
 42666e4: aa1903e2     	mov	x2, x25
 42666e8: 95fffbc8     	bl	0xc265608 <_ChromeMain+0xc26036c> // labelWithString:
 42666ec: 94f67413     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42666f0: aa0003f4     	mov	x20, x0
 42666f4: aa1903e0     	mov	x0, x25
 42666f8: 94f67419     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42666fc: aa1503e0     	mov	x0, x21
 4266700: 94f67417     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266704: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 4266708: 36f800a8     	tbz	w8, #0x1f, 0x426671c <_ChromeMain+0x4261480>
 426670c: f9402fe0     	ldr	x0, [sp, #0x58]
 4266710: f94037e8     	ldr	x8, [sp, #0x68]
 4266714: d37ff901     	lsl	x1, x8, #1
 4266718: 96f689e8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426671c: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266720: f9440d00     	ldr	x0, [x8, #0x818]
 4266724: 1e651000     	fmov	d0, #12.00000000
 4266728: 959a2772     	bl	0xa8f04f0 <_ChromeMain+0xa8eb254> // systemFontOfSize:
 426672c: 94f67403     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266730: aa0003f5     	mov	x21, x0
 4266734: aa1403e0     	mov	x0, x20
 4266738: aa1503e2     	mov	x2, x21
 426673c: 95fb8b8c     	bl	0xc14956c <_ChromeMain+0xc1442d0> // setFont:
 4266740: aa1503e0     	mov	x0, x21
 4266744: 94f67406     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266748: f9441ec0     	ldr	x0, [x22, #0x838]
 426674c: 95fffc1d     	bl	0xc2657c0 <_ChromeMain+0xc260524> // secondaryLabelColor
 4266750: 94f673fa     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266754: aa0003f5     	mov	x21, x0
 4266758: aa1403e0     	mov	x0, x20
 426675c: aa1503e2     	mov	x2, x21
 4266760: 95fffc1b     	bl	0xc2657cc <_ChromeMain+0xc260530> // setTextColor:
 4266764: aa1503e0     	mov	x0, x21
 4266768: 94f673fd     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426676c: f9402be0     	ldr	x0, [sp, #0x50]
 4266770: aa1403e2     	mov	x2, x20
 4266774: 95fffba8     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 4266778: aa1403e0     	mov	x0, x20
 426677c: 94f673f8     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266780: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266784: f9447d00     	ldr	x0, [x8, #0x8f8]
 4266788: 952be8ec     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 426678c: 6d4006e0     	ldp	d0, d1, [x23]
 4266790: 6d410ee2     	ldp	d2, d3, [x23, #0x10]
 4266794: 95b09621     	bl	0xae8c018 <_ChromeMain+0xae86d7c> // initWithFrame:
 4266798: aa0003f9     	mov	x25, x0
 426679c: 52800002     	mov	w2, #0x0                ; =0
 42667a0: 95fffb2b     	bl	0xc26544c <_ChromeMain+0xc2601b0> // setTranslatesAutoresizingMaskIntoConstraints:
 42667a4: aa1903e0     	mov	x0, x25
 42667a8: 95fffce4     	bl	0xc265b38 <_ChromeMain+0xc26089c> // heightAnchor
 42667ac: 94f673e3     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42667b0: aa0003f4     	mov	x20, x0
 42667b4: d2e80808     	mov	x8, #0x4040000000000000 ; =4629700416936869888
 42667b8: 9e670100     	fmov	d0, x8
 42667bc: 95fffc0a     	bl	0xc2657e4 <_ChromeMain+0xc260548> // constraintEqualToConstant:
 42667c0: 94f673de     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42667c4: aa0003f5     	mov	x21, x0
 42667c8: 52800022     	mov	w2, #0x1                ; =1
 42667cc: 95fbaee9     	bl	0xc152370 <_ChromeMain+0xc14d0d4> // setActive:
 42667d0: aa1503e0     	mov	x0, x21
 42667d4: 94f673e2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42667d8: aa1403e0     	mov	x0, x20
 42667dc: 94f673e0     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42667e0: aa1903e0     	mov	x0, x25
 42667e4: 95fbaedd     	bl	0xc152358 <_ChromeMain+0xc14d0bc> // widthAnchor
 42667e8: 94f673d4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42667ec: aa0003f4     	mov	x20, x0
 42667f0: d2e80e48     	mov	x8, #0x4072000000000000 ; =4643774165772402688
 42667f4: 9e670100     	fmov	d0, x8
 42667f8: 95fffbfb     	bl	0xc2657e4 <_ChromeMain+0xc260548> // constraintEqualToConstant:
 42667fc: 94f673cf     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266800: aa0003f5     	mov	x21, x0
 4266804: 52800022     	mov	w2, #0x1                ; =1
 4266808: 95fbaeda     	bl	0xc152370 <_ChromeMain+0xc14d0d4> // setActive:
 426680c: aa1503e0     	mov	x0, x21
 4266810: 94f673d3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266814: aa1403e0     	mov	x0, x20
 4266818: 94f673d1     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426681c: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266820: f9463500     	ldr	x0, [x8, #0xc68]
 4266824: d0055508     	adrp	x8, 0xed08000 <dyld_stub_binder+0xed08000>
 4266828: f943e504     	ldr	x4, [x8, #0x7c8]
 426682c: f0054642     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4266830: 9127e042     	add	x2, x2, #0x9f8
 4266834: aa1303e3     	mov	x3, x19
 4266838: 95fffce5     	bl	0xc265bcc <_ChromeMain+0xc260930> // buttonWithTitle:target:action:
 426683c: 94f673bf     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266840: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266844: b98a9516     	ldrsw	x22, [x8, #0xa94]
 4266848: f8766a68     	ldr	x8, [x19, x22]
 426684c: f8366a60     	str	x0, [x19, x22]
 4266850: aa0803e0     	mov	x0, x8
 4266854: 94f673c2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266858: f8766a60     	ldr	x0, [x19, x22]
 426685c: 52800002     	mov	w2, #0x0                ; =0
 4266860: 9558e1fb     	bl	0x989f04c <_ChromeMain+0x9899db0> // setEnabled:
 4266864: f8766a60     	ldr	x0, [x19, x22]
 4266868: 52800022     	mov	w2, #0x1                ; =1
 426686c: 95fffcdb     	bl	0xc265bd8 <_ChromeMain+0xc26093c> // setBezelStyle:
 4266870: f8766a60     	ldr	x0, [x19, x22]
 4266874: d2800002     	mov	x2, #0x0                ; =0
 4266878: 95fffcdb     	bl	0xc265be4 <_ChromeMain+0xc260948> // setControlSize:
 426687c: f8766a60     	ldr	x0, [x19, x22]
 4266880: 52800002     	mov	w2, #0x0                ; =0
 4266884: 95fffaf2     	bl	0xc26544c <_ChromeMain+0xc2601b0> // setTranslatesAutoresizingMaskIntoConstraints:
 4266888: f8766a62     	ldr	x2, [x19, x22]
 426688c: aa1903e0     	mov	x0, x25
 4266890: 95a13af5     	bl	0xaab5464 <_ChromeMain+0xaab01c8> // addSubview:
 4266894: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266898: f946d518     	ldr	x24, [x8, #0xda8]
 426689c: f8766a60     	ldr	x0, [x19, x22]
 42668a0: 95fffaf4     	bl	0xc265470 <_ChromeMain+0xc2601d4> // trailingAnchor
 42668a4: 94f673a5     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42668a8: aa0003f4     	mov	x20, x0
 42668ac: aa1903e0     	mov	x0, x25
 42668b0: 95fffaf0     	bl	0xc265470 <_ChromeMain+0xc2601d4> // trailingAnchor
 42668b4: 94f673a1     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42668b8: aa0003f5     	mov	x21, x0
 42668bc: aa1403e0     	mov	x0, x20
 42668c0: aa1503e2     	mov	x2, x21
 42668c4: 95fffae8     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 42668c8: 94f6739c     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42668cc: aa0003fa     	mov	x26, x0
 42668d0: f9003be0     	str	x0, [sp, #0x70]
 42668d4: f8766a60     	ldr	x0, [x19, x22]
 42668d8: 95fffcf6     	bl	0xc265cb0 <_ChromeMain+0xc260a14> // centerYAnchor
 42668dc: 94f67397     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42668e0: aa0003fb     	mov	x27, x0
 42668e4: aa1903e0     	mov	x0, x25
 42668e8: 95fffcf2     	bl	0xc265cb0 <_ChromeMain+0xc260a14> // centerYAnchor
 42668ec: 94f67393     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42668f0: aa0003fc     	mov	x28, x0
 42668f4: aa1b03e0     	mov	x0, x27
 42668f8: aa1c03e2     	mov	x2, x28
 42668fc: 95fffada     	bl	0xc265464 <_ChromeMain+0xc2601c8> // constraintEqualToAnchor:
 4266900: 94f6738e     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266904: aa0003f7     	mov	x23, x0
 4266908: f9003fe0     	str	x0, [sp, #0x78]
 426690c: f0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4266910: f9433100     	ldr	x0, [x8, #0x660]
 4266914: 9101c3e2     	add	x2, sp, #0x70
 4266918: 52800043     	mov	w3, #0x2                ; =2
 426691c: 9586e3b3     	bl	0xa41f7e8 <_ChromeMain+0xa41a54c> // arrayWithObjects:count:
 4266920: 94f67386     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266924: aa0003f6     	mov	x22, x0
 4266928: aa1803e0     	mov	x0, x24
 426692c: aa1603e2     	mov	x2, x22
 4266930: 95fffb0c     	bl	0xc265560 <_ChromeMain+0xc2602c4> // activateConstraints:
 4266934: aa1603e0     	mov	x0, x22
 4266938: 94f67389     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426693c: aa1703e0     	mov	x0, x23
 4266940: 94f67387     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266944: aa1c03e0     	mov	x0, x28
 4266948: 94f67385     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426694c: aa1b03e0     	mov	x0, x27
 4266950: 94f67383     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266954: aa1a03e0     	mov	x0, x26
 4266958: 94f67381     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426695c: aa1503e0     	mov	x0, x21
 4266960: 94f6737f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266964: aa1403e0     	mov	x0, x20
 4266968: 94f6737d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426696c: f94027f4     	ldr	x20, [sp, #0x48]
 4266970: aa1403e0     	mov	x0, x20
 4266974: aa1903e2     	mov	x2, x25
 4266978: 95fffb27     	bl	0xc265614 <_ChromeMain+0xc260378> // addArrangedSubview:
 426697c: aa1303e0     	mov	x0, x19
 4266980: f9400ff3     	ldr	x19, [sp, #0x18]
 4266984: aa1303e2     	mov	x2, x19
 4266988: 95fffcf7     	bl	0xc265d64 <_ChromeMain+0xc260ac8> // setView:
 426698c: aa1903e0     	mov	x0, x25
 4266990: 94f67373     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266994: f9402be0     	ldr	x0, [sp, #0x50]
 4266998: 94f67371     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426699c: f9401fe0     	ldr	x0, [sp, #0x38]
 42669a0: 94f6736f     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42669a4: f94023e0     	ldr	x0, [sp, #0x40]
 42669a8: 94f6736d     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42669ac: aa1403e0     	mov	x0, x20
 42669b0: 94f6736b     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42669b4: aa1303e0     	mov	x0, x19
 42669b8: 94f67369     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42669bc: f85903a8     	ldur	x8, [x29, #-0x70]
 42669c0: d004ee09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42669c4: f940f929     	ldr	x9, [x9, #0x1f0]
 42669c8: f9400129     	ldr	x9, [x9]
 42669cc: eb08013f     	cmp	x9, x8
 42669d0: 540002a1     	b.ne	0x4266a24 <_ChromeMain+0x4261788>
 42669d4: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 42669d8: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 42669dc: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 42669e0: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 42669e4: a94d67fa     	ldp	x26, x25, [sp, #0xd0]
 42669e8: a94c6ffc     	ldp	x28, x27, [sp, #0xc0]
 42669ec: 6d4b23e9     	ldp	d9, d8, [sp, #0xb0]
 42669f0: 910483ff     	add	sp, sp, #0x120
 42669f4: d65f03c0     	ret
 42669f8: 14000002     	b	0x4266a00 <_ChromeMain+0x4261764>
 42669fc: 14000001     	b	0x4266a00 <_ChromeMain+0x4261764>
 4266a00: aa0003f3     	mov	x19, x0
 4266a04: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 4266a08: 36f800a8     	tbz	w8, #0x1f, 0x4266a1c <_ChromeMain+0x4261780>
 4266a0c: f9402fe0     	ldr	x0, [sp, #0x58]
 4266a10: f94037e8     	ldr	x8, [sp, #0x68]
 4266a14: d37ff901     	lsl	x1, x8, #1
 4266a18: 96f68928     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4266a1c: aa1303e0     	mov	x0, x19
 4266a20: 94f672b9     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4266a24: 94f6764f     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4266a28: d104c3ff     	sub	sp, sp, #0x130
 4266a2c: a90d6ffc     	stp	x28, x27, [sp, #0xd0]
 4266a30: a90e67fa     	stp	x26, x25, [sp, #0xe0]
 4266a34: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 4266a38: a91057f6     	stp	x22, x21, [sp, #0x100]
 4266a3c: a9114ff4     	stp	x20, x19, [sp, #0x110]
 4266a40: a9127bfd     	stp	x29, x30, [sp, #0x120]
 4266a44: 910483fd     	add	x29, sp, #0x120
 4266a48: aa0203f3     	mov	x19, x2
 4266a4c: aa0003f4     	mov	x20, x0
 4266a50: d004ee08     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4266a54: f940f908     	ldr	x8, [x8, #0x1f0]
 4266a58: f9400108     	ldr	x8, [x8]
 4266a5c: f81a83a8     	stur	x8, [x29, #-0x58]
 4266a60: aa0203e0     	mov	x0, x2
 4266a64: 94f67341     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4266a68: aa1303e0     	mov	x0, x19
 4266a6c: 95fbaa0f     	bl	0xc1512a8 <_ChromeMain+0xc14c00c> // state
 4266a70: f100041f     	cmp	x0, #0x1
 4266a74: 54000060     	b.eq	0x4266a80 <_ChromeMain+0x42617e4>
 4266a78: 92f00015     	mov	x21, #0x7fffffffffffffff ; =9223372036854775807
 4266a7c: 14000004     	b	0x4266a8c <_ChromeMain+0x42617f0>
 4266a80: aa1303e0     	mov	x0, x19
 4266a84: 95b57f0b     	bl	0xafc66b0 <_ChromeMain+0xafc1414> // tag
 4266a88: aa0003f5     	mov	x21, x0
 4266a8c: 6f00e400     	movi.2d	v0, #0000000000000000
 4266a90: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4266a94: ad0003e0     	stp	q0, q0, [sp]
 4266a98: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266a9c: b98a8d08     	ldrsw	x8, [x8, #0xa8c]
 4266aa0: f8686a96     	ldr	x22, [x20, x8]
 4266aa4: aa1603e0     	mov	x0, x22
 4266aa8: 94f67330     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4266aac: 910003e2     	mov	x2, sp
 4266ab0: 910123e3     	add	x3, sp, #0x48
 4266ab4: 52800204     	mov	w4, #0x10               ; =16
 4266ab8: 9523da1c     	bl	0x8b5d328 <_ChromeMain+0x8b5808c> // countByEnumeratingWithState:objects:count:
 4266abc: b40000c0     	cbz	x0, 0x4266ad4 <_ChromeMain+0x4261838>
 4266ac0: aa0003f7     	mov	x23, x0
 4266ac4: f9400be8     	ldr	x8, [sp, #0x10]
 4266ac8: f9400118     	ldr	x24, [x8]
 4266acc: 92f00019     	mov	x25, #0x7fffffffffffffff ; =9223372036854775807
 4266ad0: 14000034     	b	0x4266ba0 <_ChromeMain+0x4261904>
 4266ad4: aa1603e0     	mov	x0, x22
 4266ad8: 94f67321     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266adc: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266ae0: b98a9108     	ldrsw	x8, [x8, #0xa90]
 4266ae4: f8286a95     	str	x21, [x20, x8]
 4266ae8: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 4266aec: eb0802bf     	cmp	x21, x8
 4266af0: 1a9f07e2     	cset	w2, ne
 4266af4: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266af8: b98a9508     	ldrsw	x8, [x8, #0xa94]
 4266afc: f8686a80     	ldr	x0, [x20, x8]
 4266b00: 9558e153     	bl	0x989f04c <_ChromeMain+0x9899db0> // setEnabled:
 4266b04: aa1303e0     	mov	x0, x19
 4266b08: 94f67315     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266b0c: f85a83a8     	ldur	x8, [x29, #-0x58]
 4266b10: d004ee09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4266b14: f940f929     	ldr	x9, [x9, #0x1f0]
 4266b18: f9400129     	ldr	x9, [x9]
 4266b1c: eb08013f     	cmp	x9, x8
 4266b20: 54000441     	b.ne	0x4266ba8 <_ChromeMain+0x426190c>
 4266b24: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 4266b28: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 4266b2c: a95057f6     	ldp	x22, x21, [sp, #0x100]
 4266b30: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 4266b34: a94e67fa     	ldp	x26, x25, [sp, #0xe0]
 4266b38: a94d6ffc     	ldp	x28, x27, [sp, #0xd0]
 4266b3c: 9104c3ff     	add	sp, sp, #0x130
 4266b40: d65f03c0     	ret
 4266b44: aa1603e0     	mov	x0, x22
 4266b48: 9523db5a     	bl	0x8b5d8b0 <_ChromeMain+0x8b58614>
 4266b4c: eb1902bf     	cmp	x21, x25
 4266b50: f94007e8     	ldr	x8, [sp, #0x8]
 4266b54: f87a7900     	ldr	x0, [x8, x26, lsl #3]
 4266b58: fa531000     	ccmp	x0, x19, #0x0, ne
 4266b5c: 1a9f17e2     	cset	w2, eq
 4266b60: 95b8a73f     	bl	0xb09085c <_ChromeMain+0xb08b5c0> // setState:
 4266b64: 9100075a     	add	x26, x26, #0x1
 4266b68: eb1a02ff     	cmp	x23, x26
 4266b6c: 540000c0     	b.eq	0x4266b84 <_ChromeMain+0x42618e8>
 4266b70: f9400be8     	ldr	x8, [sp, #0x10]
 4266b74: f9400108     	ldr	x8, [x8]
 4266b78: eb18011f     	cmp	x8, x24
 4266b7c: 54fffe80     	b.eq	0x4266b4c <_ChromeMain+0x42618b0>
 4266b80: 17fffff1     	b	0x4266b44 <_ChromeMain+0x42618a8>
 4266b84: 910003e2     	mov	x2, sp
 4266b88: 910123e3     	add	x3, sp, #0x48
 4266b8c: aa1603e0     	mov	x0, x22
 4266b90: 52800204     	mov	w4, #0x10               ; =16
 4266b94: 9523d9e5     	bl	0x8b5d328 <_ChromeMain+0x8b5808c> // countByEnumeratingWithState:objects:count:
 4266b98: aa0003f7     	mov	x23, x0
 4266b9c: b4fff9c0     	cbz	x0, 0x4266ad4 <_ChromeMain+0x4261838>
 4266ba0: d280001a     	mov	x26, #0x0               ; =0
 4266ba4: 17fffff3     	b	0x4266b70 <_ChromeMain+0x42618d4>
 4266ba8: 94f675ee     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4266bac: d10203ff     	sub	sp, sp, #0x80
 4266bb0: a90557f6     	stp	x22, x21, [sp, #0x50]
 4266bb4: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4266bb8: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4266bbc: 9101c3fd     	add	x29, sp, #0x70
 4266bc0: aa0203f3     	mov	x19, x2
 4266bc4: aa0003f4     	mov	x20, x0
 4266bc8: aa0203e0     	mov	x0, x2
 4266bcc: 94f672e7     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 4266bd0: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266bd4: b98a9108     	ldrsw	x8, [x8, #0xa90]
 4266bd8: f8686a88     	ldr	x8, [x20, x8]
 4266bdc: 92f00009     	mov	x9, #0x7fffffffffffffff ; =9223372036854775807
 4266be0: eb09011f     	cmp	x8, x9
 4266be4: 54000400     	b.eq	0x4266c64 <_ChromeMain+0x42619c8>
 4266be8: b0055549     	adrp	x9, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266bec: b98a8936     	ldrsw	x22, [x9, #0xa88]
 4266bf0: f8766a89     	ldr	x9, [x20, x22]
 4266bf4: b4000389     	cbz	x9, 0x4266c64 <_ChromeMain+0x42619c8>
 4266bf8: b0055549     	adrp	x9, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266bfc: b98a8529     	ldrsw	x9, [x9, #0xa84]
 4266c00: 8b090289     	add	x9, x20, x9
 4266c04: f940052a     	ldr	x10, [x9, #0x8]
 4266c08: eb0a011f     	cmp	x8, x10
 4266c0c: 54000482     	b.hs	0x4266c9c <_ChromeMain+0x4261a00>
 4266c10: f9400129     	ldr	x9, [x9]
 4266c14: 52800a0a     	mov	w10, #0x50              ; =80
 4266c18: 9b0a2501     	madd	x1, x8, x10, x9
 4266c1c: 910003e0     	mov	x0, sp
 4266c20: 97ff9caa     	bl	0x424dec8 <_ChromeMain+0x4248c2c>
 4266c24: f8766a95     	ldr	x21, [x20, x22]
 4266c28: b4000555     	cbz	x21, 0x4266cd0 <_ChromeMain+0x4261a34>
 4266c2c: f8366a9f     	str	xzr, [x20, x22]
 4266c30: f94006a8     	ldr	x8, [x21, #0x8]
 4266c34: 910003e1     	mov	x1, sp
 4266c38: aa1503e0     	mov	x0, x21
 4266c3c: d63f0100     	blr	x8
 4266c40: 12800008     	mov	w8, #-0x1               ; =-1
 4266c44: b8e802a8     	ldaddal	w8, w8, [x21]
 4266c48: 7100051f     	cmp	w8, #0x1
 4266c4c: 54000081     	b.ne	0x4266c5c <_ChromeMain+0x42619c0>
 4266c50: f9400aa8     	ldr	x8, [x21, #0x10]
 4266c54: aa1503e0     	mov	x0, x21
 4266c58: d63f0100     	blr	x8
 4266c5c: 910003e0     	mov	x0, sp
 4266c60: 97ff9cfd     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4266c64: aa1403e0     	mov	x0, x20
 4266c68: 95fffcd3     	bl	0xc265fb4 <_ChromeMain+0xc260d18> // popover
 4266c6c: 94f672b3     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4266c70: aa0003f4     	mov	x20, x0
 4266c74: 95a71913     	bl	0xac2d0c0 <_ChromeMain+0xac27e24> // close
 4266c78: aa1403e0     	mov	x0, x20
 4266c7c: 94f672b8     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266c80: aa1303e0     	mov	x0, x19
 4266c84: 94f672b6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4266c88: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4266c8c: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4266c90: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4266c94: 910203ff     	add	sp, sp, #0x80
 4266c98: d65f03c0     	ret
 4266c9c: d4200020     	brk	#0x1
 4266ca0: aa0003f3     	mov	x19, x0
 4266ca4: 12800008     	mov	w8, #-0x1               ; =-1
 4266ca8: b8e802a8     	ldaddal	w8, w8, [x21]
 4266cac: 7100051f     	cmp	w8, #0x1
 4266cb0: 54000081     	b.ne	0x4266cc0 <_ChromeMain+0x4261a24>
 4266cb4: f9400aa8     	ldr	x8, [x21, #0x10]
 4266cb8: aa1503e0     	mov	x0, x21
 4266cbc: d63f0100     	blr	x8
 4266cc0: 910003e0     	mov	x0, sp
 4266cc4: 97ff9ce4     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4266cc8: aa1303e0     	mov	x0, x19
 4266ccc: 94f6720e     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4266cd0: d4200000     	brk	#0
 4266cd4: d4400000     	hlt	#0
 4266cd8: d4200020     	brk	#0x1
 4266cdc: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266ce0: b98a9908     	ldrsw	x8, [x8, #0xa98]
 4266ce4: f8686800     	ldr	x0, [x0, x8]
 4266ce8: d65f03c0     	ret
 4266cec: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266cf0: b98a9908     	ldrsw	x8, [x8, #0xa98]
 4266cf4: f8286802     	str	x2, [x0, x8]
 4266cf8: d65f03c0     	ret
 4266cfc: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4266d00: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4266d04: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4266d08: 910083fd     	add	x29, sp, #0x20
 4266d0c: aa0003f3     	mov	x19, x0
 4266d10: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266d14: b98a8908     	ldrsw	x8, [x8, #0xa88]
 4266d18: f8686800     	ldr	x0, [x0, x8]
 4266d1c: b5000620     	cbnz	x0, 0x4266de0 <_ChromeMain+0x4261b44>
 4266d20: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266d24: b98a9508     	ldrsw	x8, [x8, #0xa94]
 4266d28: 8b080260     	add	x0, x19, x8
 4266d2c: d2800001     	mov	x1, #0x0                ; =0
 4266d30: 95251745     	bl	0x8baca44 <_ChromeMain+0x8ba77a8>
 4266d34: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266d38: b98a8d08     	ldrsw	x8, [x8, #0xa8c]
 4266d3c: 8b080260     	add	x0, x19, x8
 4266d40: d2800001     	mov	x1, #0x0                ; =0
 4266d44: 95251740     	bl	0x8baca44 <_ChromeMain+0x8ba77a8>
 4266d48: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266d4c: b98a8508     	ldrsw	x8, [x8, #0xa84]
 4266d50: 8b080273     	add	x19, x19, x8
 4266d54: f9400274     	ldr	x20, [x19]
 4266d58: b40003d4     	cbz	x20, 0x4266dd0 <_ChromeMain+0x4261b34>
 4266d5c: f9400668     	ldr	x8, [x19, #0x8]
 4266d60: 8b080909     	add	x9, x8, x8, lsl #2
 4266d64: d37ced29     	lsl	x9, x9, #4
 4266d68: b4000309     	cbz	x9, 0x4266dc8 <_ChromeMain+0x4261b2c>
 4266d6c: 8b140129     	add	x9, x9, x20
 4266d70: d1014120     	sub	x0, x9, #0x50
 4266d74: 928009e9     	mov	x9, #-0x50              ; =-80
 4266d78: 9b097d15     	mul	x21, x8, x9
 4266d7c: b4000400     	cbz	x0, 0x4266dfc <_ChromeMain+0x4261b60>
 4266d80: 97ff9cb5     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4266d84: d1014000     	sub	x0, x0, #0x50
 4266d88: b10142b5     	adds	x21, x21, #0x50
 4266d8c: 54ffff81     	b.ne	0x4266d7c <_ChromeMain+0x4261ae0>
 4266d90: f9400260     	ldr	x0, [x19]
 4266d94: cb000288     	sub	x8, x20, x0
 4266d98: 9344fd08     	asr	x8, x8, #4
 4266d9c: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4266da0: f29999a9     	movk	x9, #0xcccd
 4266da4: 9b097d08     	mul	x8, x8, x9
 4266da8: f9000668     	str	x8, [x19, #0x8]
 4266dac: f9400a68     	ldr	x8, [x19, #0x10]
 4266db0: 8b080908     	add	x8, x8, x8, lsl #2
 4266db4: d37ced01     	lsl	x1, x8, #4
 4266db8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4266dbc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4266dc0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4266dc4: 16f6883d     	b	0x8eb8 <_ChromeMain+0x3c1c>
 4266dc8: aa1403e0     	mov	x0, x20
 4266dcc: 17fffff2     	b	0x4266d94 <_ChromeMain+0x4261af8>
 4266dd0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4266dd4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4266dd8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4266ddc: d65f03c0     	ret
 4266de0: 12800008     	mov	w8, #-0x1               ; =-1
 4266de4: b8e80008     	ldaddal	w8, w8, [x0]
 4266de8: 7100051f     	cmp	w8, #0x1
 4266dec: 54fff9a1     	b.ne	0x4266d20 <_ChromeMain+0x4261a84>
 4266df0: f9400808     	ldr	x8, [x0, #0x10]
 4266df4: d63f0100     	blr	x8
 4266df8: 17ffffca     	b	0x4266d20 <_ChromeMain+0x4261a84>
 4266dfc: d4200020     	brk	#0x1
 4266e00: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266e04: b98a8508     	ldrsw	x8, [x8, #0xa84]
 4266e08: 8b080008     	add	x8, x0, x8
 4266e0c: a900fd1f     	stp	xzr, xzr, [x8, #0x8]
 4266e10: f900011f     	str	xzr, [x8]
 4266e14: b0055548     	adrp	x8, 0xed0f000 <dyld_stub_binder+0xed0f000>
 4266e18: b98a8908     	ldrsw	x8, [x8, #0xa88]
 4266e1c: f828681f     	str	xzr, [x0, x8]
 4266e20: d65f03c0     	ret
 4266e24: d10103ff     	sub	sp, sp, #0x40
 4266e28: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4266e2c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4266e30: 9100c3fd     	add	x29, sp, #0x30
 4266e34: aa0803f3     	mov	x19, x8
 4266e38: 910003e8     	mov	x8, sp
 4266e3c: 94000009     	bl	0x4266e60 <_ChromeMain+0x4261bc4>
 4266e40: f94003e8     	ldr	x8, [sp]
 4266e44: f9000268     	str	x8, [x19]
 4266e48: 3cc083e0     	ldur	q0, [sp, #0x8]
 4266e4c: 3c808260     	stur	q0, [x19, #0x8]
 4266e50: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4266e54: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4266e58: 910103ff     	add	sp, sp, #0x40
 4266e5c: d65f03c0     	ret
