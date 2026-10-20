Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e6d40: d102c3ff     	sub	sp, sp, #0xb0
 35e6d44: a9056ffc     	stp	x28, x27, [sp, #0x50]
 35e6d48: a90667fa     	stp	x26, x25, [sp, #0x60]
 35e6d4c: a9075ff8     	stp	x24, x23, [sp, #0x70]
 35e6d50: a90857f6     	stp	x22, x21, [sp, #0x80]
 35e6d54: a9094ff4     	stp	x20, x19, [sp, #0x90]
 35e6d58: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 35e6d5c: 910283fd     	add	x29, sp, #0xa0
 35e6d60: aa0103f4     	mov	x20, x1
 35e6d64: aa0003f3     	mov	x19, x0
 35e6d68: 529f5f57     	mov	w23, #0xfafa            ; =64250
 35e6d6c: 72a29f57     	movk	w23, #0x14fa, lsl #16
 35e6d70: 7100003f     	cmp	w1, #0x0
 35e6d74: 5a9f12f5     	csinv	w21, w23, wzr, ne
 35e6d78: 52800036     	mov	w22, #0x1               ; =1
 35e6d7c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e6d80: 52800500     	mov	w0, #0x28               ; =40
 35e6d84: 9728a179     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6d88: b9000016     	str	w22, [x0]
 35e6d8c: d0ff7419     	adrp	x25, 0x2468000 <_ChromeMain+0x2462d64>
 35e6d90: 911d0339     	add	x25, x25, #0x740
 35e6d94: b0fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6d98: 91180108     	add	x8, x8, #0x600
 35e6d9c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e6da0: f0ff7bba     	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 35e6da4: 912c035a     	add	x26, x26, #0xb00
 35e6da8: f9000c1a     	str	x26, [x0, #0x18]
 35e6dac: b9002415     	str	w21, [x0, #0x24]
 35e6db0: f90017e0     	str	x0, [sp, #0x28]
 35e6db4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e6db8: f9001fff     	str	xzr, [sp, #0x38]
 35e6dbc: 52800200     	mov	w0, #0x10               ; =16
 35e6dc0: 9728a16a     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6dc4: b4040aa0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6dc8: aa0003f5     	mov	x21, x0
 35e6dcc: 9100a3e1     	add	x1, sp, #0x28
 35e6dd0: 972c1a60     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6dd4: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e6dd8: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e6ddc: d37cef98     	lsl	x24, x28, #4
 35e6de0: b5031bb8     	cbnz	x24, 0x35ed154 <_ChromeMain+0x35e7eb8>
 35e6de4: cb1c13e8     	neg	x8, x28, lsl #4
 35e6de8: 52800209     	mov	w9, #0x10               ; =16
 35e6dec: cb080128     	sub	x8, x9, x8
 35e6df0: 9344fd08     	asr	x8, x8, #4
 35e6df4: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e6df8: f94027e8     	ldr	x8, [sp, #0x48]
 35e6dfc: 52800029     	mov	w9, #0x1                ; =1
 35e6e00: f90027e9     	str	x9, [sp, #0x48]
 35e6e04: b503cfd6     	cbnz	x22, 0x35ee7fc <_ChromeMain+0x35e9560>
 35e6e08: 910042a8     	add	x8, x21, #0x10
 35e6e0c: eb1b0108     	subs	x8, x8, x27
 35e6e10: 9344fd08     	asr	x8, x8, #4
 35e6e14: f90023e8     	str	x8, [sp, #0x40]
 35e6e18: 54040800     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6e1c: aa1303e0     	mov	x0, x19
 35e6e20: 52801ac1     	mov	w1, #0xd6               ; =214
 35e6e24: 97353712     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6e28: 9100e3e1     	add	x1, sp, #0x38
 35e6e2c: 972e2479     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6e30: 9100e3e0     	add	x0, sp, #0x38
 35e6e34: 972cc778     	bl	0x118c14 <_ChromeMain+0x113978>
 35e6e38: f94017e0     	ldr	x0, [sp, #0x28]
 35e6e3c: b5024440     	cbnz	x0, 0x35eb6c4 <_ChromeMain+0x35e6428>
 35e6e40: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e6e44: 72a4df49     	movk	w9, #0x26fa, lsl #16
 35e6e48: 52814148     	mov	w8, #0xa0a              ; =2570
 35e6e4c: 72a34148     	movk	w8, #0x1a0a, lsl #16
 35e6e50: 7100029f     	cmp	w20, #0x0
 35e6e54: 1a881136     	csel	w22, w9, w8, ne
 35e6e58: 52800035     	mov	w21, #0x1               ; =1
 35e6e5c: 3900c3f5     	strb	w21, [sp, #0x30]
 35e6e60: 52800500     	mov	w0, #0x28               ; =40
 35e6e64: 9728a141     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6e68: b9000015     	str	w21, [x0]
 35e6e6c: b0fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6e70: 91180108     	add	x8, x8, #0x600
 35e6e74: a900a019     	stp	x25, x8, [x0, #0x8]
 35e6e78: f9000c1a     	str	x26, [x0, #0x18]
 35e6e7c: b90023f6     	str	w22, [sp, #0x20]
 35e6e80: b9002416     	str	w22, [x0, #0x24]
 35e6e84: f90017e0     	str	x0, [sp, #0x28]
 35e6e88: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e6e8c: f9001fff     	str	xzr, [sp, #0x38]
 35e6e90: 52800200     	mov	w0, #0x10               ; =16
 35e6e94: 9728a135     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6e98: b4040400     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6e9c: aa0003f5     	mov	x21, x0
 35e6ea0: 9100a3e1     	add	x1, sp, #0x28
 35e6ea4: 972c1a2b     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6ea8: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e6eac: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e6eb0: d37cef98     	lsl	x24, x28, #4
 35e6eb4: b50318b8     	cbnz	x24, 0x35ed1c8 <_ChromeMain+0x35e7f2c>
 35e6eb8: cb1c13e8     	neg	x8, x28, lsl #4
 35e6ebc: 52800209     	mov	w9, #0x10               ; =16
 35e6ec0: cb080128     	sub	x8, x9, x8
 35e6ec4: 9344fd08     	asr	x8, x8, #4
 35e6ec8: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e6ecc: f94027e8     	ldr	x8, [sp, #0x48]
 35e6ed0: 52800029     	mov	w9, #0x1                ; =1
 35e6ed4: f90027e9     	str	x9, [sp, #0x48]
 35e6ed8: b503c9d6     	cbnz	x22, 0x35ee810 <_ChromeMain+0x35e9574>
 35e6edc: 910042a8     	add	x8, x21, #0x10
 35e6ee0: eb1b0108     	subs	x8, x8, x27
 35e6ee4: 9344fd08     	asr	x8, x8, #4
 35e6ee8: f90023e8     	str	x8, [sp, #0x40]
 35e6eec: 54040160     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6ef0: aa1303e0     	mov	x0, x19
 35e6ef4: 52801ae1     	mov	w1, #0xd7               ; =215
 35e6ef8: 973536dd     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6efc: 9100e3e1     	add	x1, sp, #0x38
 35e6f00: 972e2444     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6f04: 9100e3e0     	add	x0, sp, #0x38
 35e6f08: 972cc743     	bl	0x118c14 <_ChromeMain+0x113978>
 35e6f0c: f94017e0     	ldr	x0, [sp, #0x28]
 35e6f10: b5023e80     	cbnz	x0, 0x35eb6e0 <_ChromeMain+0x35e6444>
 35e6f14: 52814149     	mov	w9, #0xa0a              ; =2570
 35e6f18: 72a4c149     	movk	w9, #0x260a, lsl #16
 35e6f1c: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e6f20: 72a67f48     	movk	w8, #0x33fa, lsl #16
 35e6f24: 7100029f     	cmp	w20, #0x0
 35e6f28: 1a891115     	csel	w21, w8, w9, ne
 35e6f2c: 52800036     	mov	w22, #0x1               ; =1
 35e6f30: 3900c3f6     	strb	w22, [sp, #0x30]
 35e6f34: 52800500     	mov	w0, #0x28               ; =40
 35e6f38: 9728a10c     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6f3c: b9000016     	str	w22, [x0]
 35e6f40: b0fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6f44: 91180108     	add	x8, x8, #0x600
 35e6f48: a900a019     	stp	x25, x8, [x0, #0x8]
 35e6f4c: f9000c1a     	str	x26, [x0, #0x18]
 35e6f50: b9002415     	str	w21, [x0, #0x24]
 35e6f54: f90017e0     	str	x0, [sp, #0x28]
 35e6f58: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e6f5c: f9001fff     	str	xzr, [sp, #0x38]
 35e6f60: 52800200     	mov	w0, #0x10               ; =16
 35e6f64: 9728a101     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6f68: b403fd80     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6f6c: aa0003f5     	mov	x21, x0
 35e6f70: 9100a3e1     	add	x1, sp, #0x28
 35e6f74: 972c19f7     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6f78: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e6f7c: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e6f80: d37cef98     	lsl	x24, x28, #4
 35e6f84: b50315d8     	cbnz	x24, 0x35ed23c <_ChromeMain+0x35e7fa0>
 35e6f88: cb1c13e8     	neg	x8, x28, lsl #4
 35e6f8c: 52800209     	mov	w9, #0x10               ; =16
 35e6f90: cb080128     	sub	x8, x9, x8
 35e6f94: 9344fd08     	asr	x8, x8, #4
 35e6f98: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e6f9c: f94027e8     	ldr	x8, [sp, #0x48]
 35e6fa0: 52800029     	mov	w9, #0x1                ; =1
 35e6fa4: f90027e9     	str	x9, [sp, #0x48]
 35e6fa8: b503c3f6     	cbnz	x22, 0x35ee824 <_ChromeMain+0x35e9588>
 35e6fac: 910042a8     	add	x8, x21, #0x10
 35e6fb0: eb1b0108     	subs	x8, x8, x27
 35e6fb4: 9344fd08     	asr	x8, x8, #4
 35e6fb8: f90023e8     	str	x8, [sp, #0x40]
 35e6fbc: 5403fae0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6fc0: 52801b15     	mov	w21, #0xd8              ; =216
 35e6fc4: aa1303e0     	mov	x0, x19
 35e6fc8: 52801b01     	mov	w1, #0xd8               ; =216
 35e6fcc: 973536a8     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6fd0: 9100e3e1     	add	x1, sp, #0x38
 35e6fd4: 972e240f     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6fd8: 9100e3e0     	add	x0, sp, #0x38
 35e6fdc: 972cc70e     	bl	0x118c14 <_ChromeMain+0x113978>
 35e6fe0: f94017e0     	ldr	x0, [sp, #0x28]
 35e6fe4: b50238c0     	cbnz	x0, 0x35eb6fc <_ChromeMain+0x35e6460>
 35e6fe8: 52800036     	mov	w22, #0x1               ; =1
 35e6fec: 3900c3f6     	strb	w22, [sp, #0x30]
 35e6ff0: 52800500     	mov	w0, #0x28               ; =40
 35e6ff4: 9728a0dd     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6ff8: b9000016     	str	w22, [x0]
 35e6ffc: b0002528     	adrp	x8, 0x3a8b000 <_ChromeMain+0x3a85d64>
 35e7000: 912a6108     	add	x8, x8, #0xa98
 35e7004: 90fed1c9     	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 35e7008: 91180129     	add	x9, x9, #0x600
 35e700c: a900a408     	stp	x8, x9, [x0, #0x8]
 35e7010: f9000c1a     	str	x26, [x0, #0x18]
 35e7014: b9002415     	str	w21, [x0, #0x24]
 35e7018: f90017e0     	str	x0, [sp, #0x28]
 35e701c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7020: f9001fff     	str	xzr, [sp, #0x38]
 35e7024: 52800200     	mov	w0, #0x10               ; =16
 35e7028: 9728a0d0     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e702c: b403f760     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7030: aa0003f5     	mov	x21, x0
 35e7034: 9100a3e1     	add	x1, sp, #0x28
 35e7038: 972c19c6     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e703c: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e7040: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e7044: d37cef98     	lsl	x24, x28, #4
 35e7048: b5031358     	cbnz	x24, 0x35ed2b0 <_ChromeMain+0x35e8014>
 35e704c: cb1c13e8     	neg	x8, x28, lsl #4
 35e7050: 52800209     	mov	w9, #0x10               ; =16
 35e7054: cb080128     	sub	x8, x9, x8
 35e7058: 9344fd08     	asr	x8, x8, #4
 35e705c: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e7060: f94027e8     	ldr	x8, [sp, #0x48]
 35e7064: 52800029     	mov	w9, #0x1                ; =1
 35e7068: f90027e9     	str	x9, [sp, #0x48]
 35e706c: b503be76     	cbnz	x22, 0x35ee838 <_ChromeMain+0x35e959c>
 35e7070: 910042a8     	add	x8, x21, #0x10
 35e7074: eb1b0108     	subs	x8, x8, x27
 35e7078: 9344fd08     	asr	x8, x8, #4
 35e707c: f90023e8     	str	x8, [sp, #0x40]
 35e7080: 5403f4c0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7084: aa1303e0     	mov	x0, x19
 35e7088: 52801b21     	mov	w1, #0xd9               ; =217
 35e708c: 97353678     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7090: 9100e3e1     	add	x1, sp, #0x38
 35e7094: 972e23df     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7098: 9100e3e0     	add	x0, sp, #0x38
 35e709c: 972cc6de     	bl	0x118c14 <_ChromeMain+0x113978>
 35e70a0: f94017e0     	ldr	x0, [sp, #0x28]
 35e70a4: b50233a0     	cbnz	x0, 0x35eb718 <_ChromeMain+0x35e647c>
 35e70a8: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e70ac: 72a1ff49     	movk	w9, #0xffa, lsl #16
 35e70b0: 12a4c008     	mov	w8, #-0x26000001        ; =-637534209
 35e70b4: 7100029f     	cmp	w20, #0x0
 35e70b8: 1a881135     	csel	w21, w9, w8, ne
 35e70bc: 52800036     	mov	w22, #0x1               ; =1
 35e70c0: 3900c3f6     	strb	w22, [sp, #0x30]
 35e70c4: 52800500     	mov	w0, #0x28               ; =40
 35e70c8: 9728a0a8     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e70cc: b9000016     	str	w22, [x0]
 35e70d0: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e70d4: 91180108     	add	x8, x8, #0x600
 35e70d8: a900a019     	stp	x25, x8, [x0, #0x8]
 35e70dc: f9000c1a     	str	x26, [x0, #0x18]
 35e70e0: b9002415     	str	w21, [x0, #0x24]
 35e70e4: f90017e0     	str	x0, [sp, #0x28]
 35e70e8: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e70ec: f9001fff     	str	xzr, [sp, #0x38]
 35e70f0: 52800200     	mov	w0, #0x10               ; =16
 35e70f4: 9728a09d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e70f8: b403f100     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e70fc: aa0003f5     	mov	x21, x0
 35e7100: 9100a3e1     	add	x1, sp, #0x28
 35e7104: 972c1993     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7108: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e710c: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e7110: d37cef98     	lsl	x24, x28, #4
 35e7114: b5031098     	cbnz	x24, 0x35ed324 <_ChromeMain+0x35e8088>
 35e7118: cb1c13e8     	neg	x8, x28, lsl #4
 35e711c: 52800209     	mov	w9, #0x10               ; =16
 35e7120: cb080128     	sub	x8, x9, x8
 35e7124: 9344fd08     	asr	x8, x8, #4
 35e7128: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e712c: f94027e8     	ldr	x8, [sp, #0x48]
 35e7130: 52800029     	mov	w9, #0x1                ; =1
 35e7134: f90027e9     	str	x9, [sp, #0x48]
 35e7138: b503b8b6     	cbnz	x22, 0x35ee84c <_ChromeMain+0x35e95b0>
 35e713c: 910042a8     	add	x8, x21, #0x10
 35e7140: eb1b0108     	subs	x8, x8, x27
 35e7144: 9344fd08     	asr	x8, x8, #4
 35e7148: f90023e8     	str	x8, [sp, #0x40]
 35e714c: 5403ee60     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7150: aa1303e0     	mov	x0, x19
 35e7154: 52801b41     	mov	w1, #0xda               ; =218
 35e7158: 97353645     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e715c: 9100e3e1     	add	x1, sp, #0x38
 35e7160: 972e23ac     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7164: 9100e3e0     	add	x0, sp, #0x38
 35e7168: 972cc6ab     	bl	0x118c14 <_ChromeMain+0x113978>
 35e716c: f94017e0     	ldr	x0, [sp, #0x28]
 35e7170: b5022e20     	cbnz	x0, 0x35eb734 <_ChromeMain+0x35e6498>
 35e7174: 12ae6008     	mov	w8, #-0x73000001        ; =-1929379841
 35e7178: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e717c: 72a15f49     	movk	w9, #0xafa, lsl #16
 35e7180: 7100029f     	cmp	w20, #0x0
 35e7184: 1a881135     	csel	w21, w9, w8, ne
 35e7188: 52800036     	mov	w22, #0x1               ; =1
 35e718c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e7190: 52800500     	mov	w0, #0x28               ; =40
 35e7194: 9728a075     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7198: b9000016     	str	w22, [x0]
 35e719c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e71a0: 91180108     	add	x8, x8, #0x600
 35e71a4: a900a019     	stp	x25, x8, [x0, #0x8]
 35e71a8: f9000c1a     	str	x26, [x0, #0x18]
 35e71ac: b9002415     	str	w21, [x0, #0x24]
 35e71b0: f90017e0     	str	x0, [sp, #0x28]
 35e71b4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e71b8: f9001fff     	str	xzr, [sp, #0x38]
 35e71bc: 52800200     	mov	w0, #0x10               ; =16
 35e71c0: 9728a06a     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e71c4: b403eaa0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e71c8: aa0003f5     	mov	x21, x0
 35e71cc: 9100a3e1     	add	x1, sp, #0x28
 35e71d0: 972c1960     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e71d4: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e71d8: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e71dc: d37cef98     	lsl	x24, x28, #4
 35e71e0: b5030dd8     	cbnz	x24, 0x35ed398 <_ChromeMain+0x35e80fc>
 35e71e4: cb1c13e8     	neg	x8, x28, lsl #4
 35e71e8: 52800209     	mov	w9, #0x10               ; =16
 35e71ec: cb080128     	sub	x8, x9, x8
 35e71f0: 9344fd08     	asr	x8, x8, #4
 35e71f4: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e71f8: f94027e8     	ldr	x8, [sp, #0x48]
 35e71fc: 52800029     	mov	w9, #0x1                ; =1
 35e7200: f90027e9     	str	x9, [sp, #0x48]
 35e7204: b503b2f6     	cbnz	x22, 0x35ee860 <_ChromeMain+0x35e95c4>
 35e7208: 910042a8     	add	x8, x21, #0x10
 35e720c: eb1b0108     	subs	x8, x8, x27
 35e7210: 9344fd08     	asr	x8, x8, #4
 35e7214: f90023e8     	str	x8, [sp, #0x40]
 35e7218: 5403e800     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e721c: aa1303e0     	mov	x0, x19
 35e7220: 52801b61     	mov	w1, #0xdb               ; =219
 35e7224: 97353612     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7228: 9100e3e1     	add	x1, sp, #0x38
 35e722c: 972e2379     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7230: 9100e3e0     	add	x0, sp, #0x38
 35e7234: 972cc678     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7238: f94017e0     	ldr	x0, [sp, #0x28]
 35e723c: b50228a0     	cbnz	x0, 0x35eb750 <_ChromeMain+0x35e64b4>
 35e7240: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7244: 72a28148     	movk	w8, #0x140a, lsl #16
 35e7248: 7100029f     	cmp	w20, #0x0
 35e724c: 1a8812f6     	csel	w22, w23, w8, ne
 35e7250: 52800035     	mov	w21, #0x1               ; =1
 35e7254: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7258: 52800500     	mov	w0, #0x28               ; =40
 35e725c: 9728a043     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7260: b9000015     	str	w21, [x0]
 35e7264: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7268: 91180108     	add	x8, x8, #0x600
 35e726c: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7270: f9000c1a     	str	x26, [x0, #0x18]
 35e7274: b90013f6     	str	w22, [sp, #0x10]
 35e7278: b9002416     	str	w22, [x0, #0x24]
 35e727c: f90017e0     	str	x0, [sp, #0x28]
 35e7280: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7284: f9001fff     	str	xzr, [sp, #0x38]
 35e7288: 52800200     	mov	w0, #0x10               ; =16
 35e728c: 9728a037     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7290: b403e440     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7294: aa0003f5     	mov	x21, x0
 35e7298: 9100a3e1     	add	x1, sp, #0x28
 35e729c: 972c192d     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e72a0: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e72a4: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e72a8: d37cef98     	lsl	x24, x28, #4
 35e72ac: b50285f8     	cbnz	x24, 0x35ec368 <_ChromeMain+0x35e70cc>
 35e72b0: cb1c13e8     	neg	x8, x28, lsl #4
 35e72b4: 52800209     	mov	w9, #0x10               ; =16
 35e72b8: cb080128     	sub	x8, x9, x8
 35e72bc: 9344fd08     	asr	x8, x8, #4
 35e72c0: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e72c4: f94027e8     	ldr	x8, [sp, #0x48]
 35e72c8: 52800029     	mov	w9, #0x1                ; =1
 35e72cc: f90027e9     	str	x9, [sp, #0x48]
 35e72d0: b503ad36     	cbnz	x22, 0x35ee874 <_ChromeMain+0x35e95d8>
 35e72d4: 910042a8     	add	x8, x21, #0x10
 35e72d8: eb1b0108     	subs	x8, x8, x27
 35e72dc: 9344fd08     	asr	x8, x8, #4
 35e72e0: f90023e8     	str	x8, [sp, #0x40]
 35e72e4: 5403e1a0     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e72e8: aa1303e0     	mov	x0, x19
 35e72ec: 52801b81     	mov	w1, #0xdc               ; =220
 35e72f0: 973535df     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e72f4: 9100e3e1     	add	x1, sp, #0x38
 35e72f8: 972e2346     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e72fc: 9100e3e0     	add	x0, sp, #0x38
 35e7300: 972cc645     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7304: f94017e0     	ldr	x0, [sp, #0x28]
 35e7308: b5022320     	cbnz	x0, 0x35eb76c <_ChromeMain+0x35e64d0>
 35e730c: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e7310: 72bb3f48     	movk	w8, #0xd9fa, lsl #16
 35e7314: 52814149     	mov	w9, #0xa0a              ; =2570
 35e7318: 72bb2149     	movk	w9, #0xd90a, lsl #16
 35e731c: 7100029f     	cmp	w20, #0x0
 35e7320: 1a891116     	csel	w22, w8, w9, ne
 35e7324: 52800035     	mov	w21, #0x1               ; =1
 35e7328: 3900c3f5     	strb	w21, [sp, #0x30]
 35e732c: 52800500     	mov	w0, #0x28               ; =40
 35e7330: 9728a00e     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7334: b9000015     	str	w21, [x0]
 35e7338: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e733c: 91180108     	add	x8, x8, #0x600
 35e7340: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7344: f9000c1a     	str	x26, [x0, #0x18]
 35e7348: b9001bf6     	str	w22, [sp, #0x18]
 35e734c: b9002416     	str	w22, [x0, #0x24]
 35e7350: f90017e0     	str	x0, [sp, #0x28]
 35e7354: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7358: f9001fff     	str	xzr, [sp, #0x38]
 35e735c: 52800200     	mov	w0, #0x10               ; =16
 35e7360: 9728a002     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7364: b403dda0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7368: aa0003f5     	mov	x21, x0
 35e736c: 9100a3e1     	add	x1, sp, #0x28
 35e7370: 972c18f8     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7374: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e7378: cb1c101b     	sub	x27, x0, x28, lsl #4
 35e737c: d37cef98     	lsl	x24, x28, #4
 35e7380: b50282b8     	cbnz	x24, 0x35ec3d4 <_ChromeMain+0x35e7138>
 35e7384: cb1c13e8     	neg	x8, x28, lsl #4
 35e7388: 52800209     	mov	w9, #0x10               ; =16
 35e738c: cb080128     	sub	x8, x9, x8
 35e7390: 9344fd08     	asr	x8, x8, #4
 35e7394: a903a3fb     	stp	x27, x8, [sp, #0x38]
 35e7398: f94027e8     	ldr	x8, [sp, #0x48]
 35e739c: 52800029     	mov	w9, #0x1                ; =1
 35e73a0: f90027e9     	str	x9, [sp, #0x48]
 35e73a4: b503a736     	cbnz	x22, 0x35ee888 <_ChromeMain+0x35e95ec>
 35e73a8: 910042a8     	add	x8, x21, #0x10
 35e73ac: eb1b0108     	subs	x8, x8, x27
 35e73b0: 9344fd08     	asr	x8, x8, #4
 35e73b4: f90023e8     	str	x8, [sp, #0x40]
 35e73b8: 5403db00     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e73bc: aa1303e0     	mov	x0, x19
 35e73c0: 52801ba1     	mov	w1, #0xdd               ; =221
 35e73c4: 973535aa     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e73c8: 9100e3e1     	add	x1, sp, #0x38
 35e73cc: 972e2311     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e73d0: 9100e3e0     	add	x0, sp, #0x38
 35e73d4: 972cc610     	bl	0x118c14 <_ChromeMain+0x113978>
 35e73d8: f94017e0     	ldr	x0, [sp, #0x28]
 35e73dc: b5021d60     	cbnz	x0, 0x35eb788 <_ChromeMain+0x35e64ec>
 35e73e0: 52814148     	mov	w8, #0xa0a              ; =2570
 35e73e4: 72b18148     	movk	w8, #0x8c0a, lsl #16
 35e73e8: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e73ec: 72b19f49     	movk	w9, #0x8cfa, lsl #16
 35e73f0: 7100029f     	cmp	w20, #0x0
 35e73f4: 1a88113b     	csel	w27, w9, w8, ne
 35e73f8: 52800035     	mov	w21, #0x1               ; =1
 35e73fc: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7400: 52800500     	mov	w0, #0x28               ; =40
 35e7404: 97289fd9     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7408: b9000015     	str	w21, [x0]
 35e740c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7410: 91180108     	add	x8, x8, #0x600
 35e7414: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7418: f9000c1a     	str	x26, [x0, #0x18]
 35e741c: b900241b     	str	w27, [x0, #0x24]
 35e7420: f90017e0     	str	x0, [sp, #0x28]
 35e7424: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7428: f9001fff     	str	xzr, [sp, #0x38]
 35e742c: 52800200     	mov	w0, #0x10               ; =16
 35e7430: 97289fce     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7434: b403d720     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7438: aa0003f5     	mov	x21, x0
 35e743c: 9100a3e1     	add	x1, sp, #0x28
 35e7440: 972c18c4     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7444: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e7448: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e744c: d37cef98     	lsl	x24, x28, #4
 35e7450: b502fdf8     	cbnz	x24, 0x35ed40c <_ChromeMain+0x35e8170>
 35e7454: cb1c13e8     	neg	x8, x28, lsl #4
 35e7458: 52800209     	mov	w9, #0x10               ; =16
 35e745c: cb080128     	sub	x8, x9, x8
 35e7460: 9344fd08     	asr	x8, x8, #4
 35e7464: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e7468: f94027e8     	ldr	x8, [sp, #0x48]
 35e746c: 52800029     	mov	w9, #0x1                ; =1
 35e7470: f90027e9     	str	x9, [sp, #0x48]
 35e7474: b503a156     	cbnz	x22, 0x35ee89c <_ChromeMain+0x35e9600>
 35e7478: 910042a8     	add	x8, x21, #0x10
 35e747c: eb170108     	subs	x8, x8, x23
 35e7480: 9344fd08     	asr	x8, x8, #4
 35e7484: f90023e8     	str	x8, [sp, #0x40]
 35e7488: 5403d480     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e748c: aa1303e0     	mov	x0, x19
 35e7490: 52801bc1     	mov	w1, #0xde               ; =222
 35e7494: 97353576     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7498: 9100e3e1     	add	x1, sp, #0x38
 35e749c: 972e22dd     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e74a0: 9100e3e0     	add	x0, sp, #0x38
 35e74a4: 972cc5dc     	bl	0x118c14 <_ChromeMain+0x113978>
 35e74a8: f94017e0     	ldr	x0, [sp, #0x28]
 35e74ac: b50217c0     	cbnz	x0, 0x35eb7a4 <_ChromeMain+0x35e6508>
 35e74b0: 52814148     	mov	w8, #0xa0a              ; =2570
 35e74b4: 72a80148     	movk	w8, #0x400a, lsl #16
 35e74b8: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e74bc: 72a81f49     	movk	w9, #0x40fa, lsl #16
 35e74c0: 7100029f     	cmp	w20, #0x0
 35e74c4: 1a881135     	csel	w21, w9, w8, ne
 35e74c8: 52800036     	mov	w22, #0x1               ; =1
 35e74cc: 3900c3f6     	strb	w22, [sp, #0x30]
 35e74d0: 52800500     	mov	w0, #0x28               ; =40
 35e74d4: 97289fa5     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e74d8: b9000016     	str	w22, [x0]
 35e74dc: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e74e0: 91180108     	add	x8, x8, #0x600
 35e74e4: a900a019     	stp	x25, x8, [x0, #0x8]
 35e74e8: f9000c1a     	str	x26, [x0, #0x18]
 35e74ec: b9002415     	str	w21, [x0, #0x24]
 35e74f0: f90017e0     	str	x0, [sp, #0x28]
 35e74f4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e74f8: f9001fff     	str	xzr, [sp, #0x38]
 35e74fc: 52800200     	mov	w0, #0x10               ; =16
 35e7500: 97289f9a     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7504: b403d0a0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7508: aa0003f5     	mov	x21, x0
 35e750c: 9100a3e1     	add	x1, sp, #0x28
 35e7510: 972c1890     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7514: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e7518: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e751c: d37cef98     	lsl	x24, x28, #4
 35e7520: b502fb18     	cbnz	x24, 0x35ed480 <_ChromeMain+0x35e81e4>
 35e7524: cb1c13e8     	neg	x8, x28, lsl #4
 35e7528: 52800209     	mov	w9, #0x10               ; =16
 35e752c: cb080128     	sub	x8, x9, x8
 35e7530: 9344fd08     	asr	x8, x8, #4
 35e7534: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e7538: f94027e8     	ldr	x8, [sp, #0x48]
 35e753c: 52800029     	mov	w9, #0x1                ; =1
 35e7540: f90027e9     	str	x9, [sp, #0x48]
 35e7544: b5039b76     	cbnz	x22, 0x35ee8b0 <_ChromeMain+0x35e9614>
 35e7548: 910042a8     	add	x8, x21, #0x10
 35e754c: eb170108     	subs	x8, x8, x23
 35e7550: 9344fd08     	asr	x8, x8, #4
 35e7554: f90023e8     	str	x8, [sp, #0x40]
 35e7558: 5403ce00     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e755c: aa1303e0     	mov	x0, x19
 35e7560: 52801be1     	mov	w1, #0xdf               ; =223
 35e7564: 97353542     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7568: 9100e3e1     	add	x1, sp, #0x38
 35e756c: 972e22a9     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7570: 9100e3e0     	add	x0, sp, #0x38
 35e7574: 972cc5a8     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7578: f94017e0     	ldr	x0, [sp, #0x28]
 35e757c: b5021220     	cbnz	x0, 0x35eb7c0 <_ChromeMain+0x35e6524>
 35e7580: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7584: 72b7e148     	movk	w8, #0xbf0a, lsl #16
 35e7588: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e758c: 72b7ff49     	movk	w9, #0xbffa, lsl #16
 35e7590: 7100029f     	cmp	w20, #0x0
 35e7594: 1a881135     	csel	w21, w9, w8, ne
 35e7598: 52800036     	mov	w22, #0x1               ; =1
 35e759c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e75a0: 52800500     	mov	w0, #0x28               ; =40
 35e75a4: 97289f71     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e75a8: b9000016     	str	w22, [x0]
 35e75ac: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e75b0: 91180108     	add	x8, x8, #0x600
 35e75b4: a900a019     	stp	x25, x8, [x0, #0x8]
 35e75b8: f9000c1a     	str	x26, [x0, #0x18]
 35e75bc: b9002415     	str	w21, [x0, #0x24]
 35e75c0: f90017e0     	str	x0, [sp, #0x28]
 35e75c4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e75c8: f9001fff     	str	xzr, [sp, #0x38]
 35e75cc: 52800200     	mov	w0, #0x10               ; =16
 35e75d0: 97289f66     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e75d4: b403ca20     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e75d8: aa0003f5     	mov	x21, x0
 35e75dc: 9100a3e1     	add	x1, sp, #0x28
 35e75e0: 972c185c     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e75e4: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e75e8: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e75ec: d37cef98     	lsl	x24, x28, #4
 35e75f0: b502f838     	cbnz	x24, 0x35ed4f4 <_ChromeMain+0x35e8258>
 35e75f4: cb1c13e8     	neg	x8, x28, lsl #4
 35e75f8: 52800209     	mov	w9, #0x10               ; =16
 35e75fc: cb080128     	sub	x8, x9, x8
 35e7600: 9344fd08     	asr	x8, x8, #4
 35e7604: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e7608: f94027e8     	ldr	x8, [sp, #0x48]
 35e760c: 52800029     	mov	w9, #0x1                ; =1
 35e7610: f90027e9     	str	x9, [sp, #0x48]
 35e7614: b5039596     	cbnz	x22, 0x35ee8c4 <_ChromeMain+0x35e9628>
 35e7618: 910042a8     	add	x8, x21, #0x10
 35e761c: eb170108     	subs	x8, x8, x23
 35e7620: 9344fd08     	asr	x8, x8, #4
 35e7624: f90023e8     	str	x8, [sp, #0x40]
 35e7628: 5403c780     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e762c: aa1303e0     	mov	x0, x19
 35e7630: 52801c01     	mov	w1, #0xe0               ; =224
 35e7634: 9735350e     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7638: 9100e3e1     	add	x1, sp, #0x38
 35e763c: 972e2275     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7640: 9100e3e0     	add	x0, sp, #0x38
 35e7644: 972cc574     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7648: f94017e0     	ldr	x0, [sp, #0x28]
 35e764c: b5020c80     	cbnz	x0, 0x35eb7dc <_ChromeMain+0x35e6540>
 35e7650: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7654: 72b70148     	movk	w8, #0xb80a, lsl #16
 35e7658: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e765c: 72b4df49     	movk	w9, #0xa6fa, lsl #16
 35e7660: 7100029f     	cmp	w20, #0x0
 35e7664: 1a881135     	csel	w21, w9, w8, ne
 35e7668: 52800036     	mov	w22, #0x1               ; =1
 35e766c: 3900c3f6     	strb	w22, [sp, #0x30]
 35e7670: 52800500     	mov	w0, #0x28               ; =40
 35e7674: 97289f3d     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7678: b9000016     	str	w22, [x0]
 35e767c: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7680: 91180108     	add	x8, x8, #0x600
 35e7684: a900a019     	stp	x25, x8, [x0, #0x8]
 35e7688: f9000c1a     	str	x26, [x0, #0x18]
 35e768c: b9002415     	str	w21, [x0, #0x24]
 35e7690: f90017e0     	str	x0, [sp, #0x28]
 35e7694: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e7698: f9001fff     	str	xzr, [sp, #0x38]
 35e769c: 52800200     	mov	w0, #0x10               ; =16
 35e76a0: 97289f32     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e76a4: b403c3a0     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e76a8: aa0003f5     	mov	x21, x0
 35e76ac: 9100a3e1     	add	x1, sp, #0x28
 35e76b0: 972c1828     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e76b4: a943f3f6     	ldp	x22, x28, [sp, #0x38]
 35e76b8: cb1c1017     	sub	x23, x0, x28, lsl #4
 35e76bc: d37cef98     	lsl	x24, x28, #4
 35e76c0: b502f558     	cbnz	x24, 0x35ed568 <_ChromeMain+0x35e82cc>
 35e76c4: cb1c13e8     	neg	x8, x28, lsl #4
 35e76c8: 52800209     	mov	w9, #0x10               ; =16
 35e76cc: cb080128     	sub	x8, x9, x8
 35e76d0: 9344fd08     	asr	x8, x8, #4
 35e76d4: a903a3f7     	stp	x23, x8, [sp, #0x38]
 35e76d8: f94027e8     	ldr	x8, [sp, #0x48]
 35e76dc: 52800029     	mov	w9, #0x1                ; =1
 35e76e0: f90027e9     	str	x9, [sp, #0x48]
 35e76e4: b5038fb6     	cbnz	x22, 0x35ee8d8 <_ChromeMain+0x35e963c>
 35e76e8: 910042a8     	add	x8, x21, #0x10
 35e76ec: eb170108     	subs	x8, x8, x23
 35e76f0: 9344fd08     	asr	x8, x8, #4
 35e76f4: f90023e8     	str	x8, [sp, #0x40]
 35e76f8: 5403c100     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e76fc: aa1303e0     	mov	x0, x19
 35e7700: 52801c21     	mov	w1, #0xe1               ; =225
 35e7704: 973534da     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7708: 9100e3e1     	add	x1, sp, #0x38
 35e770c: 972e2241     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7710: 9100e3e0     	add	x0, sp, #0x38
 35e7714: 972cc540     	bl	0x118c14 <_ChromeMain+0x113978>
 35e7718: f94017e0     	ldr	x0, [sp, #0x28]
 35e771c: b50206e0     	cbnz	x0, 0x35eb7f8 <_ChromeMain+0x35e655c>
 35e7720: b9000bfb     	str	w27, [sp, #0x8]
 35e7724: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7728: 72ae6148     	movk	w8, #0x730a, lsl #16
 35e772c: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e7730: 72ae7f49     	movk	w9, #0x73fa, lsl #16
 35e7734: 7100029f     	cmp	w20, #0x0
 35e7738: 1a881137     	csel	w23, w9, w8, ne
 35e773c: 52800035     	mov	w21, #0x1               ; =1
 35e7740: 3900c3f5     	strb	w21, [sp, #0x30]
 35e7744: 52800500     	mov	w0, #0x28               ; =40
 35e7748: 97289f08     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e774c: b9000015     	str	w21, [x0]
 35e7750: 90fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e7754: 91180108     	add	x8, x8, #0x600
 35e7758: a900a019     	stp	x25, x8, [x0, #0x8]
 35e775c: f9000c1a     	str	x26, [x0, #0x18]
 35e7760: b9002417     	str	w23, [x0, #0x24]
 35e7764: f90017e0     	str	x0, [sp, #0x28]
 35e7768: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 35e776c: f9001fff     	str	xzr, [sp, #0x38]
 35e7770: 52800200     	mov	w0, #0x10               ; =16
 35e7774: 97289efd     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e7778: b403bd00     	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e777c: aa0003f5     	mov	x21, x0
 35e7780: 9100a3e1     	add	x1, sp, #0x28
 35e7784: 972c17f3     	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7788: a943eff6     	ldp	x22, x27, [sp, #0x38]
 35e778c: cb1b101c     	sub	x28, x0, x27, lsl #4
 35e7790: d37cef78     	lsl	x24, x27, #4
 35e7794: b502f258     	cbnz	x24, 0x35ed5dc <_ChromeMain+0x35e8340>
 35e7798: cb1b13e8     	neg	x8, x27, lsl #4
 35e779c: 52800209     	mov	w9, #0x10               ; =16
 35e77a0: cb080128     	sub	x8, x9, x8
 35e77a4: 9344fd08     	asr	x8, x8, #4
 35e77a8: a903a3fc     	stp	x28, x8, [sp, #0x38]
 35e77ac: f94027e8     	ldr	x8, [sp, #0x48]
 35e77b0: 52800029     	mov	w9, #0x1                ; =1
 35e77b4: f90027e9     	str	x9, [sp, #0x48]
 35e77b8: b50389b6     	cbnz	x22, 0x35ee8ec <_ChromeMain+0x35e9650>
 35e77bc: 910042a8     	add	x8, x21, #0x10
 35e77c0: eb1c0108     	subs	x8, x8, x28
 35e77c4: 9344fd08     	asr	x8, x8, #4
 35e77c8: f90023e8     	str	x8, [sp, #0x40]
 35e77cc: 5403ba60     	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e77d0: aa1303e0     	mov	x0, x19
 35e77d4: 52801c41     	mov	w1, #0xe2               ; =226
 35e77d8: 973534a5     	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e77dc: 9100e3e1     	add	x1, sp, #0x38
 35e77e0: 972e220c     	bl	0x170010 <_ChromeMain+0x16ad74>
 35e77e4: 9100e3e0     	add	x0, sp, #0x38
 35e77e8: 972cc50b     	bl	0x118c14 <_ChromeMain+0x113978>
 35e77ec: f94017e0     	ldr	x0, [sp, #0x28]
 35e77f0: b5020120     	cbnz	x0, 0x35eb814 <_ChromeMain+0x35e6578>
