
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4658b68: b4000ca1     	cbz	x1, 0x4658cfc <_ChromeMain+0x4653a60>
 4658b6c: d101c3ff     	sub	sp, sp, #0x70
 4658b70: a90457f6     	stp	x22, x21, [sp, #0x40]
 4658b74: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4658b78: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4658b7c: 910183fd     	add	x29, sp, #0x60
 4658b80: aa0103f3     	mov	x19, x1
 4658b84: aa0003f5     	mov	x21, x0
 4658b88: 97ff9e9e     	bl	0x4640600 <_ChromeMain+0x463b364>
 4658b8c: a90307e0     	stp	x0, x1, [sp, #0x30]
 4658b90: b941ba68     	ldr	w8, [x19, #0x1b8]
 4658b94: b941be69     	ldr	w9, [x19, #0x1bc]
 4658b98: d360fc14     	lsr	x20, x0, #32
 4658b9c: 6b00011f     	cmp	w8, w0
 4658ba0: 7a540120     	ccmp	w9, w20, #0x0, eq
 4658ba4: 540000e1     	b.ne	0x4658bc0 <_ChromeMain+0x4653924>
 4658ba8: d360fc28     	lsr	x8, x1, #32
 4658bac: b941c269     	ldr	w9, [x19, #0x1c0]
 4658bb0: b941c66a     	ldr	w10, [x19, #0x1c4]
 4658bb4: 6b01013f     	cmp	w9, w1
 4658bb8: 7a480140     	ccmp	w10, w8, #0x0, eq
 4658bbc: 54000080     	b.eq	0x4658bcc <_ChromeMain+0x4653930>
 4658bc0: 9100c3e1     	add	x1, sp, #0x30
 4658bc4: aa1303e0     	mov	x0, x19
 4658bc8: 97092ff2     	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 4658bcc: f9400268     	ldr	x8, [x19]
 4658bd0: f9402d08     	ldr	x8, [x8, #0x58]
 4658bd4: aa1303e0     	mov	x0, x19
 4658bd8: d63f0100     	blr	x8
 4658bdc: aa0003f6     	mov	x22, x0
 4658be0: 94009590     	bl	0x467e220 <_ChromeMain+0x4678f84>
 4658be4: f10002df     	cmp	x22, #0x0
 4658be8: 1a9f07e8     	cset	w8, ne
 4658bec: eb0002df     	cmp	x22, x0
 4658bf0: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4658bf4: 540000c0     	b.eq	0x4658c0c <_ChromeMain+0x4653970>
 4658bf8: f94026d6     	ldr	x22, [x22, #0x48]
 4658bfc: f10002df     	cmp	x22, #0x0
 4658c00: 1a9f07e8     	cset	w8, ne
 4658c04: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4658c08: 54ffff81     	b.ne	0x4658bf8 <_ChromeMain+0x465395c>
 4658c0c: 34000708     	cbz	w8, 0x4658cec <_ChromeMain+0x4653a50>
 4658c10: f942cea8     	ldr	x8, [x21, #0x598]
 4658c14: b4000228     	cbz	x8, 0x4658c58 <_ChromeMain+0x46539bc>
 4658c18: 39472109     	ldrb	w9, [x8, #0x1c8]
 4658c1c: 340001e9     	cbz	w9, 0x4658c58 <_ChromeMain+0x46539bc>
 4658c20: f940c500     	ldr	x0, [x8, #0x188]
 4658c24: b40001c0     	cbz	x0, 0x4658c5c <_ChromeMain+0x46539c0>
 4658c28: eb15011f     	cmp	x8, x21
 4658c2c: 540000a1     	b.ne	0x4658c40 <_ChromeMain+0x46539a4>
 4658c30: 9106e102     	add	x2, x8, #0x1b8
 4658c34: aa1503e1     	mov	x1, x21
 4658c38: 97373743     	bl	0x1426944 <_ChromeMain+0x14216a8>
 4658c3c: 14000009     	b	0x4658c60 <_ChromeMain+0x46539c4>
 4658c40: aa0803e9     	mov	x9, x8
 4658c44: f940c529     	ldr	x9, [x9, #0x188]
 4658c48: eb15013f     	cmp	x9, x21
 4658c4c: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4658c50: 54ffffa1     	b.ne	0x4658c44 <_ChromeMain+0x46539a8>
 4658c54: b5fffee9     	cbnz	x9, 0x4658c30 <_ChromeMain+0x4653994>
 4658c58: d2800000     	mov	x0, #0x0                ; =0
 4658c5c: d2800001     	mov	x1, #0x0                ; =0
 4658c60: a90207e0     	stp	x0, x1, [sp, #0x20]
 4658c64: f942d2a8     	ldr	x8, [x21, #0x5a0]
 4658c68: b4000228     	cbz	x8, 0x4658cac <_ChromeMain+0x4653a10>
 4658c6c: 39472109     	ldrb	w9, [x8, #0x1c8]
 4658c70: 340001e9     	cbz	w9, 0x4658cac <_ChromeMain+0x4653a10>
 4658c74: f940c500     	ldr	x0, [x8, #0x188]
 4658c78: b40001c0     	cbz	x0, 0x4658cb0 <_ChromeMain+0x4653a14>
 4658c7c: eb15011f     	cmp	x8, x21
 4658c80: 540000a1     	b.ne	0x4658c94 <_ChromeMain+0x46539f8>
 4658c84: 9106e102     	add	x2, x8, #0x1b8
 4658c88: aa1503e1     	mov	x1, x21
 4658c8c: 9737372e     	bl	0x1426944 <_ChromeMain+0x14216a8>
 4658c90: 14000009     	b	0x4658cb4 <_ChromeMain+0x4653a18>
 4658c94: aa0803e9     	mov	x9, x8
 4658c98: f940c529     	ldr	x9, [x9, #0x188]
 4658c9c: eb15013f     	cmp	x9, x21
 4658ca0: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4658ca4: 54ffffa1     	b.ne	0x4658c98 <_ChromeMain+0x46539fc>
 4658ca8: b5fffee9     	cbnz	x9, 0x4658c84 <_ChromeMain+0x46539e8>
 4658cac: d2800000     	mov	x0, #0x0                ; =0
 4658cb0: d2800001     	mov	x1, #0x0                ; =0
 4658cb4: a90107e0     	stp	x0, x1, [sp, #0x10]
 4658cb8: f942daa8     	ldr	x8, [x21, #0x5b0]
 4658cbc: b4000068     	cbz	x8, 0x4658cc8 <_ChromeMain+0x4653a2c>
 4658cc0: 39472109     	ldrb	w9, [x8, #0x1c8]
 4658cc4: 350001e9     	cbnz	w9, 0x4658d00 <_ChromeMain+0x4653a64>
 4658cc8: d2800000     	mov	x0, #0x0                ; =0
 4658ccc: d2800001     	mov	x1, #0x0                ; =0
 4658cd0: a90007e0     	stp	x0, x1, [sp]
 4658cd4: 910083e1     	add	x1, sp, #0x20
 4658cd8: 910043e2     	add	x2, sp, #0x10
 4658cdc: 910003e3     	mov	x3, sp
 4658ce0: aa1303e0     	mov	x0, x19
 4658ce4: aa1403e4     	mov	x4, x20
 4658ce8: 97ff9ec4     	bl	0x46407f8 <_ChromeMain+0x463b55c>
 4658cec: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4658cf0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4658cf4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4658cf8: 9101c3ff     	add	sp, sp, #0x70
 4658cfc: d65f03c0     	ret
 4658d00: f940c500     	ldr	x0, [x8, #0x188]
 4658d04: b4fffe40     	cbz	x0, 0x4658ccc <_ChromeMain+0x4653a30>
 4658d08: eb15011f     	cmp	x8, x21
 4658d0c: 540000a1     	b.ne	0x4658d20 <_ChromeMain+0x4653a84>
 4658d10: 9106e102     	add	x2, x8, #0x1b8
 4658d14: aa1503e1     	mov	x1, x21
 4658d18: 9737370b     	bl	0x1426944 <_ChromeMain+0x14216a8>
 4658d1c: 17ffffed     	b	0x4658cd0 <_ChromeMain+0x4653a34>
 4658d20: aa0803e9     	mov	x9, x8
 4658d24: f940c529     	ldr	x9, [x9, #0x188]
 4658d28: eb15013f     	cmp	x9, x21
 4658d2c: fa401924     	ccmp	x9, #0x0, #0x4, ne
 4658d30: 54ffffa1     	b.ne	0x4658d24 <_ChromeMain+0x4653a88>
 4658d34: b5fffee9     	cbnz	x9, 0x4658d10 <_ChromeMain+0x4653a74>
 4658d38: 17ffffe4     	b	0x4658cc8 <_ChromeMain+0x4653a2c>
