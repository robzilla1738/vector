
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e9c24: 528e30bb     	mov	w27, #0x7185            ; =29061
 35e9c28: 72bfff7b     	movk	w27, #0xfffb, lsl #16
 35e9c2c: 52800035     	mov	w21, #0x1               ; =1
 35e9c30: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9c34: 52800500     	mov	w0, #0x28               ; =40
 35e9c38: 972895cc     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9c3c: b9000015     	str	w21, [x0]
 35e9c40: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9c44: 91180108     	add	x8, x8, #0x600
 35e9c48: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9c4c: f9000c1a     	str	x26, [x0, #0x18]
 35e9c50: 51005368     	sub	w8, w27, #0x14
 35e9c54: b9002408     	str	w8, [x0, #0x24]
 35e9c58: f90017e0     	str	x0, [sp, #0x28]
 35e9c5c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e9c60: f9001fff     	str	xzr, [sp, #0x38]
 35e9c64: 52800200     	mov	w0, #0x10               ; =16
 35e9c68: 972895c0     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9c6c: b4029560     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9c70: aa0003f5     	mov	x21, x0
 35e9c74: 9100a3e1     	add	x1, sp, #0x28
 35e9c78: 972c0eb6     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9c7c: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e9c80: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e9c84: d37cef98     	lsl	x24, x28, #4
 35e9c88: b5022c98     	cbnz	x24, 0x35ee218 <_ChromeMain+0x35e8f7c>
 35e9c8c: cb1c13e8     	neg	x8, x28, lsl #4
 35e9c90: 52800209     	mov	w9, #0x10               ; =16
 35e9c94: cb080128     	sub	x8, x9, x8
 35e9c98: 9344fd08     	asr	x8, x8, #4
 35e9c9c: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e9ca0: f94027e8     	ldr	x8, [sp, #0x48]
 35e9ca4: 52800029     	mov	w9, #0x1                ; =1
 35e9ca8: f90027e9     	str	x9, [sp, #0x48]
 35e9cac: b5028016     	cbnz	x22, 0x35eecac <_ChromeMain+0x35e9a10>
 35e9cb0: 910042a8     	add	x8, x21, #0x10
 35e9cb4: eb170108     	subs	x8, x8, x23
 35e9cb8: 9344fd08     	asr	x8, x8, #4
 35e9cbc: f90023e8     	str	x8, [sp, #0x40]
 35e9cc0: 540292c0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9cc4: aa1303e0     	mov	x0, x19
 35e9cc8: 52802241     	mov	w1, #0x112              ; =274
 35e9ccc: 97352b68     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9cd0: 9100e3e1     	add	x1, sp, #0x38
 35e9cd4: 972e18cf     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9cd8: 9100e3e0     	add	x0, sp, #0x38
 35e9cdc: 972cbbce     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9ce0: f94017e0     	ldr	x0, [sp, #0x28]
 35e9ce4: b5010380     	cbnz	x0, 0x35ebd54 <_ChromeMain+0x35e6ab8>
 35e9ce8: 52800035     	mov	w21, #0x1               ; =1
 35e9cec: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9cf0: 52800500     	mov	w0, #0x28               ; =40
 35e9cf4: 9728959d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9cf8: b9000015     	str	w21, [x0]
 35e9cfc: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9d00: 91180108     	add	x8, x8, #0x600
 35e9d04: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9d08: f9000c1a     	str	x26, [x0, #0x18]
 35e9d0c: 528e2e28     	mov	w8, #0x7171             ; =29041
 35e9d10: 72a67f68     	movk	w8, #0x33fb, lsl #16
 35e9d14: b9002408     	str	w8, [x0, #0x24]
 35e9d18: f90017e0     	str	x0, [sp, #0x28]
 35e9d1c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e9d20: f9001fff     	str	xzr, [sp, #0x38]
 35e9d24: 52800200     	mov	w0, #0x10               ; =16
 35e9d28: 97289590     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9d2c: b4028f60     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9d30: aa0003f5     	mov	x21, x0
 35e9d34: 9100a3e1     	add	x1, sp, #0x28
 35e9d38: 972c0e86     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9d3c: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e9d40: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e9d44: d37cef98     	lsl	x24, x28, #4
 35e9d48: b5022a38     	cbnz	x24, 0x35ee28c <_ChromeMain+0x35e8ff0>
 35e9d4c: cb1c13e8     	neg	x8, x28, lsl #4
 35e9d50: 52800209     	mov	w9, #0x10               ; =16
 35e9d54: cb080128     	sub	x8, x9, x8
 35e9d58: 9344fd08     	asr	x8, x8, #4
 35e9d5c: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e9d60: f94027e8     	ldr	x8, [sp, #0x48]
 35e9d64: 52800029     	mov	w9, #0x1                ; =1
 35e9d68: f90027e9     	str	x9, [sp, #0x48]
 35e9d6c: b5027ab6     	cbnz	x22, 0x35eecc0 <_ChromeMain+0x35e9a24>
 35e9d70: 910042a8     	add	x8, x21, #0x10
 35e9d74: eb170108     	subs	x8, x8, x23
 35e9d78: 9344fd08     	asr	x8, x8, #4
 35e9d7c: f90023e8     	str	x8, [sp, #0x40]
 35e9d80: 54028cc0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9d84: aa1303e0     	mov	x0, x19
 35e9d88: 52802261     	mov	w1, #0x113              ; =275
 35e9d8c: 97352b38     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9d90: 9100e3e1     	add	x1, sp, #0x38
 35e9d94: 972e189f     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9d98: 9100e3e0     	add	x0, sp, #0x38
 35e9d9c: 972cbb9e     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9da0: f94017e0     	ldr	x0, [sp, #0x28]
 35e9da4: b500fe60     	cbnz	x0, 0x35ebd70 <_ChromeMain+0x35e6ad4>
 35e9da8: 52800035     	mov	w21, #0x1               ; =1
 35e9dac: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9db0: 52800500     	mov	w0, #0x28               ; =40
 35e9db4: 9728956d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9db8: b9000015     	str	w21, [x0]
 35e9dbc: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9dc0: 91180108     	add	x8, x8, #0x600
 35e9dc4: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9dc8: f9000c1a     	str	x26, [x0, #0x18]
 35e9dcc: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e9dd0: 72bfff48     	movk	w8, #0xfffa, lsl #16
 35e9dd4: b9002408     	str	w8, [x0, #0x24]
 35e9dd8: f90017e0     	str	x0, [sp, #0x28]
 35e9ddc: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e9de0: f9001fff     	str	xzr, [sp, #0x38]
 35e9de4: 52800200     	mov	w0, #0x10               ; =16
 35e9de8: 97289560     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9dec: b4028960     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9df0: aa0003f5     	mov	x21, x0
 35e9df4: 9100a3e1     	add	x1, sp, #0x28
 35e9df8: 972c0e56     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9dfc: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e9e00: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e9e04: d37cef98     	lsl	x24, x28, #4
 35e9e08: b50227d8     	cbnz	x24, 0x35ee300 <_ChromeMain+0x35e9064>
 35e9e0c: cb1c13e8     	neg	x8, x28, lsl #4
 35e9e10: 52800209     	mov	w9, #0x10               ; =16
 35e9e14: cb080128     	sub	x8, x9, x8
 35e9e18: 9344fd08     	asr	x8, x8, #4
 35e9e1c: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e9e20: f94027e8     	ldr	x8, [sp, #0x48]
 35e9e24: 52800029     	mov	w9, #0x1                ; =1
 35e9e28: f90027e9     	str	x9, [sp, #0x48]
 35e9e2c: b5027556     	cbnz	x22, 0x35eecd4 <_ChromeMain+0x35e9a38>
 35e9e30: 910042a8     	add	x8, x21, #0x10
 35e9e34: eb170108     	subs	x8, x8, x23
 35e9e38: 9344fd08     	asr	x8, x8, #4
 35e9e3c: f90023e8     	str	x8, [sp, #0x40]
 35e9e40: 540286c0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9e44: aa1303e0     	mov	x0, x19
 35e9e48: 52802281     	mov	w1, #0x114              ; =276
 35e9e4c: 97352b08     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9e50: 9100e3e1     	add	x1, sp, #0x38
 35e9e54: 972e186f     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9e58: 9100e3e0     	add	x0, sp, #0x38
 35e9e5c: 972cbb6e     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9e60: f94017e0     	ldr	x0, [sp, #0x28]
 35e9e64: b500f940     	cbnz	x0, 0x35ebd8c <_ChromeMain+0x35e6af0>
 35e9e68: 52800035     	mov	w21, #0x1               ; =1
 35e9e6c: 3900c3f5     	strb	w21, [sp, #0x30]
 35e9e70: 52800500     	mov	w0, #0x28               ; =40
 35e9e74: 9728953d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9e78: b9000015     	str	w21, [x0]
 35e9e7c: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9e80: 91180108     	add	x8, x8, #0x600
 35e9e84: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9e88: f9000c1a     	str	x26, [x0, #0x18]
 35e9e8c: 52946948     	mov	w8, #0xa34a             ; =41802
 35e9e90: 72a342c8     	movk	w8, #0x1a16, lsl #16
 35e9e94: b9002408     	str	w8, [x0, #0x24]
 35e9e98: f90017e0     	str	x0, [sp, #0x28]
 35e9e9c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e9ea0: f9001fff     	str	xzr, [sp, #0x38]
 35e9ea4: 52800200     	mov	w0, #0x10               ; =16
 35e9ea8: 97289530     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9eac: b4028360     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9eb0: aa0003f5     	mov	x21, x0
 35e9eb4: 9100a3e1     	add	x1, sp, #0x28
 35e9eb8: 972c0e26     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9ebc: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e9ec0: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e9ec4: d37cef98     	lsl	x24, x28, #4
 35e9ec8: b5022578     	cbnz	x24, 0x35ee374 <_ChromeMain+0x35e90d8>
 35e9ecc: cb1c13e8     	neg	x8, x28, lsl #4
 35e9ed0: 52800209     	mov	w9, #0x10               ; =16
 35e9ed4: cb080128     	sub	x8, x9, x8
 35e9ed8: 9344fd08     	asr	x8, x8, #4
 35e9edc: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e9ee0: f94027e8     	ldr	x8, [sp, #0x48]
 35e9ee4: 52800029     	mov	w9, #0x1                ; =1
 35e9ee8: f90027e9     	str	x9, [sp, #0x48]
 35e9eec: b5026ff6     	cbnz	x22, 0x35eece8 <_ChromeMain+0x35e9a4c>
 35e9ef0: 910042a8     	add	x8, x21, #0x10
 35e9ef4: eb170108     	subs	x8, x8, x23
 35e9ef8: 9344fd08     	asr	x8, x8, #4
 35e9efc: f90023e8     	str	x8, [sp, #0x40]
 35e9f00: 52946955     	mov	w21, #0xa34a            ; =41802
 35e9f04: 72bfe2d5     	movk	w21, #0xff16, lsl #16
 35e9f08: 54028080     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9f0c: aa1303e0     	mov	x0, x19
 35e9f10: 528022a1     	mov	w1, #0x115              ; =277
 35e9f14: 97352ad6     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9f18: 9100e3e1     	add	x1, sp, #0x38
 35e9f1c: 972e183d     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9f20: 9100e3e0     	add	x0, sp, #0x38
 35e9f24: 972cbb3c     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9f28: f94017e0     	ldr	x0, [sp, #0x28]
 35e9f2c: b500f3e0     	cbnz	x0, 0x35ebda8 <_ChromeMain+0x35e6b0c>
 35e9f30: 5298abc8     	mov	w8, #0xc55e             ; =50526
 35e9f34: 72bfe448     	movk	w8, #0xff22, lsl #16
 35e9f38: 7100029f     	cmp	w20, #0x0
 35e9f3c: 1a951115     	csel	w21, w8, w21, ne
 35e9f40: 52800036     	mov	w22, #0x1               ; =1
 35e9f44: 3900c3f6     	strb	w22, [sp, #0x30]
 35e9f48: 52800500     	mov	w0, #0x28               ; =40
 35e9f4c: 97289507     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9f50: b9000016     	str	w22, [x0]
 35e9f54: d0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e9f58: 91180108     	add	x8, x8, #0x600
 35e9f5c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e9f60: f9000c1a     	str	x26, [x0, #0x18]
 35e9f64: b9002415     	str	w21, [x0, #0x24]
 35e9f68: f90017e0     	str	x0, [sp, #0x28]
 35e9f6c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e9f70: f9001fff     	str	xzr, [sp, #0x38]
 35e9f74: 52800200     	mov	w0, #0x10               ; =16
 35e9f78: 972894fc     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e9f7c: b4027ce0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9f80: aa0003f5     	mov	x21, x0
 35e9f84: 9100a3e1     	add	x1, sp, #0x28
 35e9f88: 972c0df2     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e9f8c: a943dff6     	ldp	x22, x23, [sp, #0x38]
 35e9f90: cb17101c     	sub	x28, x0, x23, lsl #4
 35e9f94: d37ceef8     	lsl	x24, x23, #4
 35e9f98: b5022298     	cbnz	x24, 0x35ee3e8 <_ChromeMain+0x35e914c>
 35e9f9c: cb1713e8     	neg	x8, x23, lsl #4
 35e9fa0: 52800209     	mov	w9, #0x10               ; =16
 35e9fa4: cb080128     	sub	x8, x9, x8
 35e9fa8: 9344fd08     	asr	x8, x8, #4
 35e9fac: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e9fb0: f94027e8     	ldr	x8, [sp, #0x48]
 35e9fb4: 52800029     	mov	w9, #0x1                ; =1
 35e9fb8: f90027e9     	str	x9, [sp, #0x48]
 35e9fbc: b5026a16     	cbnz	x22, 0x35eecfc <_ChromeMain+0x35e9a60>
 35e9fc0: 910042a8     	add	x8, x21, #0x10
 35e9fc4: eb1c0108     	subs	x8, x8, x28
 35e9fc8: 9344fd08     	asr	x8, x8, #4
 35e9fcc: f90023e8     	str	x8, [sp, #0x40]
 35e9fd0: 54027a40     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e9fd4: aa1303e0     	mov	x0, x19
 35e9fd8: 528022c1     	mov	w1, #0x116              ; =278
 35e9fdc: 97352aa4     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e9fe0: 9100e3e1     	add	x1, sp, #0x38
 35e9fe4: 972e180b     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e9fe8: 9100e3e0     	add	x0, sp, #0x38
 35e9fec: 972cbb0a     	bl	0x118c14 <_ChromeMain+0x113978>
 35e9ff0: f94017e0     	ldr	x0, [sp, #0x28]
 35e9ff4: b500ee80     	cbnz	x0, 0x35ebdc4 <_ChromeMain+0x35e6b28>
 35e9ff8: 529098e8     	mov	w8, #0x84c7             ; =33991
 35e9ffc: 72bfe048     	movk	w8, #0xff02, lsl #16
 35ea000: 7100029f     	cmp	w20, #0x0
 35ea004: 5296dec9     	mov	w9, #0xb6f6             ; =46838
 35ea008: 72bfe709     	movk	w9, #0xff38, lsl #16
 35ea00c: 1a881135     	csel	w21, w9, w8, ne
 35ea010: 52800036     	mov	w22, #0x1               ; =1
 35ea014: 3900c3f6     	strb	w22, [sp, #0x30]
 35ea018: 52800500     	mov	w0, #0x28               ; =40
 35ea01c: 972894d3     	bl	0xf368 <_ChromeMain+0xa0cc>
 35ea020: b9000016     	str	w22, [x0]
 35ea024: b0fed1a8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35ea028: 91180108     	add	x8, x8, #0x600
 35ea02c: a900a019     	stp	x25, x8, [x0, #0x8]
 35ea030: f9000c1a     	str	x26, [x0, #0x18]
 35ea034: b9002415     	str	w21, [x0, #0x24]
 35ea038: f90017e0     	str	x0, [sp, #0x28]
 35ea03c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35ea040: f9001fff     	str	xzr, [sp, #0x38]
 35ea044: 52800200     	mov	w0, #0x10               ; =16
 35ea048: 972894c8     	bl	0xf368 <_ChromeMain+0xa0cc>
 35ea04c: b4027660     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35ea050: aa0003f5     	mov	x21, x0
 35ea054: 9100a3e1     	add	x1, sp, #0x28
 35ea058: 972c0dbe     	bl	0xed750 <_ChromeMain+0xe84b4>
 35ea05c: a943dff6     	ldp	x22, x23, [sp, #0x38]
 35ea060: cb17101c     	sub	x28, x0, x23, lsl #4
 35ea064: d37ceef8     	lsl	x24, x23, #4
 35ea068: b5021fb8     	cbnz	x24, 0x35ee45c <_ChromeMain+0x35e91c0>
 35ea06c: cb1713e8     	neg	x8, x23, lsl #4
 35ea070: 52800209     	mov	w9, #0x10               ; =16
 35ea074: cb080128     	sub	x8, x9, x8
 35ea078: 9344fd08     	asr	x8, x8, #4
 35ea07c: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35ea080: f94027e8     	ldr	x8, [sp, #0x48]
 35ea084: 52800029     	mov	w9, #0x1                ; =1
 35ea088: f90027e9     	str	x9, [sp, #0x48]
 35ea08c: b5026436     	cbnz	x22, 0x35eed10 <_ChromeMain+0x35e9a74>
 35ea090: 910042a8     	add	x8, x21, #0x10
 35ea094: eb1c0108     	subs	x8, x8, x28
 35ea098: 9344fd08     	asr	x8, x8, #4
 35ea09c: f90023e8     	str	x8, [sp, #0x40]
 35ea0a0: 540273c0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35ea0a4: aa1303e0     	mov	x0, x19
 35ea0a8: 528022e1     	mov	w1, #0x117              ; =279
 35ea0ac: 97352a70     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35ea0b0: 9100e3e1     	add	x1, sp, #0x38
