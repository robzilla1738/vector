
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41e5da0: d102c3ff     	sub	sp, sp, #0xb0
 41e5da4: a9056ffc     	stp	x28, x27, [sp, #0x50]
 41e5da8: a90667fa     	stp	x26, x25, [sp, #0x60]
 41e5dac: a9075ff8     	stp	x24, x23, [sp, #0x70]
 41e5db0: a90857f6     	stp	x22, x21, [sp, #0x80]
 41e5db4: a9094ff4     	stp	x20, x19, [sp, #0x90]
 41e5db8: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 41e5dbc: 910283fd     	add	x29, sp, #0xa0
 41e5dc0: aa0203f5     	mov	x21, x2
 41e5dc4: aa0103f7     	mov	x23, x1
 41e5dc8: aa0003f6     	mov	x22, x0
 41e5dcc: 91040013     	add	x19, x0, #0x100
 41e5dd0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41e5dd4: b0054e79     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41e5dd8: f9404729     	ldr	x9, [x25, #0x88]
 41e5ddc: eb09011f     	cmp	x8, x9
 41e5de0: 54000061     	b.ne	0x41e5dec <_ChromeMain+0x41e0b50>
 41e5de4: 910402c0     	add	x0, x22, #0x100
 41e5de8: 96f8b945     	bl	0x142fc <_ChromeMain+0xf060>
 41e5dec: 3900c3ff     	strb	wzr, [sp, #0x30]
 41e5df0: 9100c3e0     	add	x0, sp, #0x30
 41e5df4: 52800001     	mov	w1, #0x0                ; =0
 41e5df8: 12800002     	mov	w2, #-0x1               ; =-1
 41e5dfc: 9727879c     	bl	0xbc7c6c <_ChromeMain+0xbc29d0>
 41e5e00: 39400268     	ldrb	w8, [x19]
 41e5e04: 35001328     	cbnz	w8, 0x41e6068 <_ChromeMain+0x41e0dcc>
 41e5e08: 52800028     	mov	w8, #0x1                ; =1
 41e5e0c: 39000268     	strb	w8, [x19]
 41e5e10: a9406af4     	ldp	x20, x26, [x23]
 41e5e14: f9400ae8     	ldr	x8, [x23, #0x10]
 41e5e18: f90007e8     	str	x8, [sp, #0x8]
 41e5e1c: a9007eff     	stp	xzr, xzr, [x23]
 41e5e20: f9000aff     	str	xzr, [x23, #0x10]
 41e5e24: 370001f5     	tbnz	w21, #0x0, 0x41e5e60 <_ChromeMain+0x41e0bc4>
 41e5e28: d37ef749     	lsl	x9, x26, #2
 41e5e2c: 8b1a0a88     	add	x8, x20, x26, lsl #2
 41e5e30: d1001108     	sub	x8, x8, #0x4
 41e5e34: eb08029f     	cmp	x20, x8
 41e5e38: fa403924     	ccmp	x9, #0x0, #0x4, lo
 41e5e3c: 54000120     	b.eq	0x41e5e60 <_ChromeMain+0x41e0bc4>
 41e5e40: 91001289     	add	x9, x20, #0x4
 41e5e44: b85fc12a     	ldur	w10, [x9, #-0x4]
 41e5e48: b940010b     	ldr	w11, [x8]
 41e5e4c: b81fc12b     	stur	w11, [x9, #-0x4]
 41e5e50: b81fc50a     	str	w10, [x8], #-0x4
 41e5e54: eb08013f     	cmp	x9, x8
 41e5e58: 91001129     	add	x9, x9, #0x4
 41e5e5c: 54ffff43     	b.lo	0x41e5e44 <_ChromeMain+0x41e0ba8>
 41e5e60: b400023a     	cbz	x26, 0x41e5ea4 <_ChromeMain+0x41e0c08>
 41e5e64: d280001c     	mov	x28, #0x0               ; =0
 41e5e68: 14000026     	b	0x41e5f00 <_ChromeMain+0x41e0c64>
 41e5e6c: d37ef749     	lsl	x9, x26, #2
 41e5e70: b4000109     	cbz	x9, 0x41e5e90 <_ChromeMain+0x41e0bf4>
 41e5e74: cb1a0be8     	neg	x8, x26, lsl #2
 41e5e78: 8b140129     	add	x9, x9, x20
 41e5e7c: d1001129     	sub	x9, x9, #0x4
 41e5e80: b4000ec9     	cbz	x9, 0x41e6058 <_ChromeMain+0x41e0dbc>
 41e5e84: d1001129     	sub	x9, x9, #0x4
 41e5e88: 91001108     	add	x8, x8, #0x4
 41e5e8c: b5ffffa8     	cbnz	x8, 0x41e5e80 <_ChromeMain+0x41e0be4>
 41e5e90: f94007e8     	ldr	x8, [sp, #0x8]
 41e5e94: d37ef501     	lsl	x1, x8, #2
 41e5e98: aa1403e0     	mov	x0, x20
 41e5e9c: 96f88c07     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41e5ea0: 14000002     	b	0x41e5ea8 <_ChromeMain+0x41e0c0c>
 41e5ea4: b5fffe54     	cbnz	x20, 0x41e5e6c <_ChromeMain+0x41e0bd0>
 41e5ea8: 3900027f     	strb	wzr, [x19]
 41e5eac: 925e7668     	and	x8, x19, #0xfffffffc00000000
 41e5eb0: f9404729     	ldr	x9, [x25, #0x88]
 41e5eb4: eb09011f     	cmp	x8, x9
 41e5eb8: 54000061     	b.ne	0x41e5ec4 <_ChromeMain+0x41e0c28>
 41e5ebc: aa1303e0     	mov	x0, x19
 41e5ec0: 96f8f2df     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41e5ec4: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41e5ec8: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41e5ecc: a94857f6     	ldp	x22, x21, [sp, #0x80]
 41e5ed0: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 41e5ed4: a94667fa     	ldp	x26, x25, [sp, #0x60]
 41e5ed8: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 41e5edc: 9102c3ff     	add	sp, sp, #0xb0
 41e5ee0: d65f03c0     	ret
 41e5ee4: aa1603e0     	mov	x0, x22
 41e5ee8: aa1703e1     	mov	x1, x23
 41e5eec: aa1503e2     	mov	x2, x21
 41e5ef0: 94edb1b6     	bl	0x7d525c8 <_ChromeMain+0x7d4d32c>
 41e5ef4: aa1b03fc     	mov	x28, x27
 41e5ef8: eb1a037f     	cmp	x27, x26
 41e5efc: 54fffd42     	b.hs	0x41e5ea4 <_ChromeMain+0x41e0c08>
 41e5f00: b87c7a97     	ldr	w23, [x20, x28, lsl #2]
 41e5f04: 37f80ad7     	tbnz	w23, #0x1f, 0x41e605c <_ChromeMain+0x41e0dc0>
 41e5f08: f94002c0     	ldr	x0, [x22]
 41e5f0c: b9401808     	ldr	w8, [x0, #0x18]
 41e5f10: 6b0802ff     	cmp	w23, w8
 41e5f14: 54000a4a     	b.ge	0x41e605c <_ChromeMain+0x41e0dc0>
 41e5f18: 9100079b     	add	x27, x28, #0x1
 41e5f1c: f9404808     	ldr	x8, [x0, #0x90]
 41e5f20: b9401908     	ldr	w8, [x8, #0x18]
 41e5f24: 6b0802ff     	cmp	w23, w8
 41e5f28: 1a9fa7e8     	cset	w8, lt
 41e5f2c: 6b0802bf     	cmp	w21, w8
 41e5f30: 54fffe20     	b.eq	0x41e5ef4 <_ChromeMain+0x41e0c58>
 41e5f34: aa1703e1     	mov	x1, x23
 41e5f38: 9739e0f0     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 41e5f3c: 3941e008     	ldrb	w8, [x0, #0x78]
 41e5f40: 34fffd28     	cbz	w8, 0x41e5ee4 <_ChromeMain+0x41e0c48>
 41e5f44: aa0003f8     	mov	x24, x0
 41e5f48: 3cc68f00     	ldr	q0, [x24, #0x68]!
 41e5f4c: f94002c8     	ldr	x8, [x22]
 41e5f50: 3d800fe0     	str	q0, [sp, #0x30]
 41e5f54: 91032100     	add	x0, x8, #0xc8
 41e5f58: 9100c3e1     	add	x1, sp, #0x30
 41e5f5c: 94b06598     	bl	0x6dff5bc <_ChromeMain+0x6dfa320>
 41e5f60: b40002c0     	cbz	x0, 0x41e5fb8 <_ChromeMain+0x41e0d1c>
 41e5f64: f9401017     	ldr	x23, [x0, #0x20]
 41e5f68: eb1a037f     	cmp	x27, x26
 41e5f6c: 54000383     	b.lo	0x41e5fdc <_ChromeMain+0x41e0d40>
 41e5f70: f9400ee8     	ldr	x8, [x23, #0x18]
 41e5f74: 8b1c0108     	add	x8, x8, x28
 41e5f78: eb08037f     	cmp	x27, x8
 41e5f7c: 54000640     	b.eq	0x41e6044 <_ChromeMain+0x41e0da8>
 41e5f80: eb1b039f     	cmp	x28, x27
 41e5f84: 54fffb82     	b.hs	0x41e5ef4 <_ChromeMain+0x41e0c58>
 41e5f88: eb1a039f     	cmp	x28, x26
 41e5f8c: 9a9a8397     	csel	x23, x28, x26, hi
 41e5f90: eb1c02ff     	cmp	x23, x28
 41e5f94: 54000620     	b.eq	0x41e6058 <_ChromeMain+0x41e0dbc>
 41e5f98: b87c7a81     	ldr	w1, [x20, x28, lsl #2]
 41e5f9c: aa1603e0     	mov	x0, x22
 41e5fa0: aa1503e2     	mov	x2, x21
 41e5fa4: 94edb189     	bl	0x7d525c8 <_ChromeMain+0x7d4d32c>
 41e5fa8: 9100079c     	add	x28, x28, #0x1
 41e5fac: eb1c037f     	cmp	x27, x28
 41e5fb0: 54ffff01     	b.ne	0x41e5f90 <_ChromeMain+0x41e0cf4>
 41e5fb4: 17ffffd0     	b	0x41e5ef4 <_ChromeMain+0x41e0c58>
 41e5fb8: d2800017     	mov	x23, #0x0               ; =0
 41e5fbc: 17ffffeb     	b	0x41e5f68 <_ChromeMain+0x41e0ccc>
 41e5fc0: aa1a03fb     	mov	x27, x26
 41e5fc4: 17ffffeb     	b	0x41e5f70 <_ChromeMain+0x41e0cd4>
 41e5fc8: 6b08013f     	cmp	w9, w8
 41e5fcc: 54fffd21     	b.ne	0x41e5f70 <_ChromeMain+0x41e0cd4>
 41e5fd0: 9100077b     	add	x27, x27, #0x1
 41e5fd4: eb1b035f     	cmp	x26, x27
 41e5fd8: 54ffff40     	b.eq	0x41e5fc0 <_ChromeMain+0x41e0d24>
 41e5fdc: f9400ee8     	ldr	x8, [x23, #0x18]
 41e5fe0: 8b1c0108     	add	x8, x8, x28
 41e5fe4: eb08037f     	cmp	x27, x8
 41e5fe8: 54fffc42     	b.hs	0x41e5f70 <_ChromeMain+0x41e0cd4>
 41e5fec: b8bb7a81     	ldrsw	x1, [x20, x27, lsl #2]
 41e5ff0: f94002c0     	ldr	x0, [x22]
 41e5ff4: 9739e0c1     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 41e5ff8: f9403c08     	ldr	x8, [x0, #0x78]
 41e5ffc: f90023e8     	str	x8, [sp, #0x40]
 41e6000: 3cc68000     	ldur	q0, [x0, #0x68]
 41e6004: 3d800fe0     	str	q0, [sp, #0x30]
 41e6008: f9400b08     	ldr	x8, [x24, #0x10]
 41e600c: f90013e8     	str	x8, [sp, #0x20]
 41e6010: 3dc00300     	ldr	q0, [x24]
 41e6014: 3d8007e0     	str	q0, [sp, #0x10]
 41e6018: 394103e9     	ldrb	w9, [sp, #0x40]
 41e601c: 92401d08     	and	x8, x8, #0xff
 41e6020: 6a09011f     	tst	w8, w9
 41e6024: 54fffd20     	b.eq	0x41e5fc8 <_ChromeMain+0x41e0d2c>
 41e6028: 36000188     	tbz	w8, #0x0, 0x41e6058 <_ChromeMain+0x41e0dbc>
 41e602c: a94327e8     	ldp	x8, x9, [sp, #0x30]
 41e6030: a9412fea     	ldp	x10, x11, [sp, #0x10]
 41e6034: eb0a011f     	cmp	x8, x10
 41e6038: fa4b0120     	ccmp	x9, x11, #0x0, eq
 41e603c: 54fff9a1     	b.ne	0x41e5f70 <_ChromeMain+0x41e0cd4>
 41e6040: 17ffffe4     	b	0x41e5fd0 <_ChromeMain+0x41e0d34>
 41e6044: aa1603e0     	mov	x0, x22
 41e6048: aa1703e1     	mov	x1, x23
 41e604c: aa1503e2     	mov	x2, x21
 41e6050: 94edd20c     	bl	0x7d5a880 <_ChromeMain+0x7d555e4>
 41e6054: 17ffffa8     	b	0x41e5ef4 <_ChromeMain+0x41e0c58>
 41e6058: d4200020     	brk	#0x1
 41e605c: d4200000     	brk	#0
 41e6060: d4400000     	hlt	#0
 41e6064: d4200020     	brk	#0x1
 41e6068: d4200000     	brk	#0
 41e606c: d4400000     	hlt	#0
