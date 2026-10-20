
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4641cd4: d10303ff     	sub	sp, sp, #0xc0
 4641cd8: a90767fa     	stp	x26, x25, [sp, #0x70]
 4641cdc: a9085ff8     	stp	x24, x23, [sp, #0x80]
 4641ce0: a90957f6     	stp	x22, x21, [sp, #0x90]
 4641ce4: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 4641ce8: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 4641cec: 9102c3fd     	add	x29, sp, #0xb0
 4641cf0: aa0103f3     	mov	x19, x1
 4641cf4: aa0003f4     	mov	x20, x0
 4641cf8: f9423415     	ldr	x21, [x0, #0x468]
 4641cfc: f90033ff     	str	xzr, [sp, #0x60]
 4641d00: 6f00e400     	movi.2d	v0, #0000000000000000
 4641d04: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4641d08: f94002a1     	ldr	x1, [x21]
 4641d0c: 910103e0     	add	x0, sp, #0x40
 4641d10: 52800002     	mov	w2, #0x0                ; =0
 4641d14: 970f9391     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 4641d18: f9001bff     	str	xzr, [sp, #0x30]
 4641d1c: 6f00e400     	movi.2d	v0, #0000000000000000
 4641d20: ad0083e0     	stp	q0, q0, [sp, #0x10]
 4641d24: f94002a1     	ldr	x1, [x21]
 4641d28: 52800037     	mov	w23, #0x1               ; =1
 4641d2c: 910043e0     	add	x0, sp, #0x10
 4641d30: 52800022     	mov	w2, #0x1                ; =1
 4641d34: 970f9389     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 4641d38: f94023f5     	ldr	x21, [sp, #0x40]
 4641d3c: f9400be8     	ldr	x8, [sp, #0x10]
 4641d40: eb0802bf     	cmp	x21, x8
 4641d44: 54000080     	b.eq	0x4641d54 <_ChromeMain+0x463cab8>
 4641d48: 91400698     	add	x24, x20, #0x1, lsl #12 ; =0x1000
 4641d4c: 52804d19     	mov	w25, #0x268             ; =616
 4641d50: 1400004d     	b	0x4641e84 <_ChromeMain+0x463cbe8>
 4641d54: 910043e0     	add	x0, sp, #0x10
 4641d58: 96fd25a1     	bl	0x58b3dc <_ChromeMain+0x586140>
 4641d5c: 910103e0     	add	x0, sp, #0x40
 4641d60: 96fd259f     	bl	0x58b3dc <_ChromeMain+0x586140>
 4641d64: f942ea80     	ldr	x0, [x20, #0x5d0]
 4641d68: b4000060     	cbz	x0, 0x4641d74 <_ChromeMain+0x463cad8>
 4641d6c: aa1303e1     	mov	x1, x19
 4641d70: 97ff9ae4     	bl	0x4628900 <_ChromeMain+0x4623664>
 4641d74: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4641d78: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4641d7c: a94957f6     	ldp	x22, x21, [sp, #0x90]
 4641d80: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 4641d84: a94767fa     	ldp	x26, x25, [sp, #0x70]
 4641d88: 910303ff     	add	sp, sp, #0xc0
 4641d8c: d65f03c0     	ret
 4641d90: aa0903eb     	mov	x11, x9
 4641d94: 14000010     	b	0x4641dd4 <_ChromeMain+0x463cb38>
 4641d98: f947e689     	ldr	x9, [x20, #0xfc8]
 4641d9c: f947ea8a     	ldr	x10, [x20, #0xfd0]
 4641da0: d37be94b     	lsl	x11, x10, #5
 4641da4: b4ffff6b     	cbz	x11, 0x4641d90 <_ChromeMain+0x463caf4>
 4641da8: 9345fd6c     	asr	x12, x11, #5
 4641dac: aa0903eb     	mov	x11, x9
 4641db0: d341fd8d     	lsr	x13, x12, #1
 4641db4: 8b0d156e     	add	x14, x11, x13, lsl #5
 4641db8: b84205cf     	ldr	w15, [x14], #0x20
 4641dbc: aa6c07f0     	mvn	x16, x12, lsr #1
 4641dc0: 8b10018c     	add	x12, x12, x16
 4641dc4: 6b0801ff     	cmp	w15, w8
 4641dc8: 9a8db18c     	csel	x12, x12, x13, lt
 4641dcc: 9a8bb1cb     	csel	x11, x14, x11, lt
 4641dd0: b5ffff0c     	cbnz	x12, 0x4641db0 <_ChromeMain+0x463cb14>
 4641dd4: 8b0a1529     	add	x9, x9, x10, lsl #5
 4641dd8: eb09017f     	cmp	x11, x9
 4641ddc: 54000080     	b.eq	0x4641dec <_ChromeMain+0x463cb50>
 4641de0: b9400169     	ldr	w9, [x11]
 4641de4: 6b09011f     	cmp	w8, w9
 4641de8: 540007ca     	b.ge	0x4641ee0 <_ChromeMain+0x463cc44>
 4641dec: aa1403e0     	mov	x0, x20
 4641df0: aa1503e1     	mov	x1, x21
 4641df4: 94002e49     	bl	0x464d718 <_ChromeMain+0x464847c>
 4641df8: 370003a0     	tbnz	w0, #0x0, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641dfc: 3940b308     	ldrb	w8, [x24, #0x2c]
 4641e00: 34000708     	cbz	w8, 0x4641ee0 <_ChromeMain+0x463cc44>
 4641e04: b94012a8     	ldr	w8, [x21, #0x10]
 4641e08: b9502a89     	ldr	w9, [x20, #0x1028]
 4641e0c: 6b08013f     	cmp	w9, w8
 4641e10: 540002e0     	b.eq	0x4641e6c <_ChromeMain+0x463cbd0>
 4641e14: 14000033     	b	0x4641ee0 <_ChromeMain+0x463cc44>
 4641e18: f9424e80     	ldr	x0, [x20, #0x498]
 4641e1c: b94012a8     	ldr	w8, [x21, #0x10]
 4641e20: b9000be8     	str	w8, [sp, #0x8]
 4641e24: 390033f7     	strb	w23, [sp, #0xc]
 4641e28: 910023e1     	add	x1, sp, #0x8
 4641e2c: 94c98525     	bl	0x78a32c0 <_ChromeMain+0x789e024>
 4641e30: b40001e0     	cbz	x0, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641e34: f940a015     	ldr	x21, [x0, #0x140]
 4641e38: b40001b5     	cbz	x21, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641e3c: 394722a8     	ldrb	w8, [x21, #0x1c8]
 4641e40: 34000168     	cbz	w8, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641e44: 14000078     	b	0x4642024 <_ChromeMain+0x463cd88>
 4641e48: aa1403e0     	mov	x0, x20
 4641e4c: aa1503e1     	mov	x1, x21
 4641e50: 9400008d     	bl	0x4642084 <_ChromeMain+0x463cde8>
 4641e54: 370000c0     	tbnz	w0, #0x0, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641e58: f942ea80     	ldr	x0, [x20, #0x5d0]
 4641e5c: b4fffde0     	cbz	x0, 0x4641e18 <_ChromeMain+0x463cb7c>
 4641e60: aa1503e1     	mov	x1, x21
 4641e64: 97ff9317     	bl	0x4626ac0 <_ChromeMain+0x4621824>
 4641e68: 3607fd80     	tbz	w0, #0x0, 0x4641e18 <_ChromeMain+0x463cb7c>
 4641e6c: 910103e0     	add	x0, sp, #0x40
 4641e70: 970f9385     	bl	0xa26c84 <_ChromeMain+0xa219e8>
 4641e74: f94023f5     	ldr	x21, [sp, #0x40]
 4641e78: f9400be8     	ldr	x8, [sp, #0x10]
 4641e7c: eb0802bf     	cmp	x21, x8
 4641e80: 54fff6a0     	b.eq	0x4641d54 <_ChromeMain+0x463cab8>
 4641e84: f9435688     	ldr	x8, [x20, #0x6a8]
 4641e88: b40001e8     	cbz	x8, 0x4641ec4 <_ChromeMain+0x463cc28>
 4641e8c: b4fffdf5     	cbz	x21, 0x4641e48 <_ChromeMain+0x463cbac>
 4641e90: 394186a9     	ldrb	w9, [x21, #0x61]
 4641e94: 340001a9     	cbz	w9, 0x4641ec8 <_ChromeMain+0x463cc2c>
 4641e98: f941b509     	ldr	x9, [x8, #0x368]
 4641e9c: 9b197d3a     	mul	x26, x9, x25
 4641ea0: b400015a     	cbz	x26, 0x4641ec8 <_ChromeMain+0x463cc2c>
 4641ea4: f941b116     	ldr	x22, [x8, #0x360]
 4641ea8: aa1503e1     	mov	x1, x21
 4641eac: aa1603e2     	mov	x2, x22
 4641eb0: 97ff1198     	bl	0x4606510 <_ChromeMain+0x4601274>
 4641eb4: 3707fdc0     	tbnz	w0, #0x0, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641eb8: 9109a2d6     	add	x22, x22, #0x268
 4641ebc: f109a35a     	subs	x26, x26, #0x268
 4641ec0: 54ffff41     	b.ne	0x4641ea8 <_ChromeMain+0x463cc0c>
 4641ec4: b4fffc35     	cbz	x21, 0x4641e48 <_ChromeMain+0x463cbac>
 4641ec8: 39409308     	ldrb	w8, [x24, #0x24]
 4641ecc: 340000a8     	cbz	w8, 0x4641ee0 <_ChromeMain+0x463cc44>
 4641ed0: b94012a8     	ldr	w8, [x21, #0x10]
 4641ed4: b9502289     	ldr	w9, [x20, #0x1020]
 4641ed8: 6b09011f     	cmp	w8, w9
 4641edc: 54fff5e0     	b.eq	0x4641d98 <_ChromeMain+0x463cafc>
 4641ee0: aa1403e0     	mov	x0, x20
 4641ee4: aa1503e1     	mov	x1, x21
 4641ee8: 94000067     	bl	0x4642084 <_ChromeMain+0x463cde8>
 4641eec: 3707fc00     	tbnz	w0, #0x0, 0x4641e6c <_ChromeMain+0x463cbd0>
 4641ef0: 394186a8     	ldrb	w8, [x21, #0x61]
 4641ef4: 3707fb28     	tbnz	w8, #0x0, 0x4641e58 <_ChromeMain+0x463cbbc>
 4641ef8: 3941e2a8     	ldrb	w8, [x21, #0x78]
 4641efc: 3707fae8     	tbnz	w8, #0x0, 0x4641e58 <_ChromeMain+0x463cbbc>
 4641f00: 39624288     	ldrb	w8, [x20, #0x890]
 4641f04: 34fffaa8     	cbz	w8, 0x4641e58 <_ChromeMain+0x463cbbc>
 4641f08: b94012a8     	ldr	w8, [x21, #0x10]
 4641f0c: f9486e89     	ldr	x9, [x20, #0x10d8]
 4641f10: f948728a     	ldr	x10, [x20, #0x10e0]
 4641f14: d37ef54b     	lsl	x11, x10, #2
 4641f18: b40007ab     	cbz	x11, 0x464200c <_ChromeMain+0x463cd70>
 4641f1c: 9342fd6c     	asr	x12, x11, #2
 4641f20: aa0903eb     	mov	x11, x9
 4641f24: d341fd8d     	lsr	x13, x12, #1
 4641f28: 8b0d096e     	add	x14, x11, x13, lsl #2
 4641f2c: b84045cf     	ldr	w15, [x14], #0x4
 4641f30: aa6c07f0     	mvn	x16, x12, lsr #1
 4641f34: 8b10018c     	add	x12, x12, x16
 4641f38: 6b0801ff     	cmp	w15, w8
 4641f3c: 9a8db18c     	csel	x12, x12, x13, lt
 4641f40: 9a8bb1cb     	csel	x11, x14, x11, lt
 4641f44: b5ffff0c     	cbnz	x12, 0x4641f24 <_ChromeMain+0x463cc88>
 4641f48: 8b0a0929     	add	x9, x9, x10, lsl #2
 4641f4c: eb09017f     	cmp	x11, x9
 4641f50: 54000080     	b.eq	0x4641f60 <_ChromeMain+0x463ccc4>
 4641f54: b9400169     	ldr	w9, [x11]
 4641f58: 6b09011f     	cmp	w8, w9
 4641f5c: 54fff7ea     	b.ge	0x4641e58 <_ChromeMain+0x463cbbc>
 4641f60: f9484a89     	ldr	x9, [x20, #0x1090]
 4641f64: f9484e8a     	ldr	x10, [x20, #0x1098]
 4641f68: d37ef54b     	lsl	x11, x10, #2
 4641f6c: b400054b     	cbz	x11, 0x4642014 <_ChromeMain+0x463cd78>
 4641f70: 9342fd6c     	asr	x12, x11, #2
 4641f74: aa0903eb     	mov	x11, x9
 4641f78: d341fd8d     	lsr	x13, x12, #1
 4641f7c: 8b0d096e     	add	x14, x11, x13, lsl #2
 4641f80: b84045cf     	ldr	w15, [x14], #0x4
 4641f84: aa6c07f0     	mvn	x16, x12, lsr #1
 4641f88: 8b10018c     	add	x12, x12, x16
 4641f8c: 6b0801ff     	cmp	w15, w8
 4641f90: 9a8db18c     	csel	x12, x12, x13, lt
 4641f94: 9a8bb1cb     	csel	x11, x14, x11, lt
 4641f98: b5ffff0c     	cbnz	x12, 0x4641f78 <_ChromeMain+0x463ccdc>
 4641f9c: 8b0a0929     	add	x9, x9, x10, lsl #2
 4641fa0: eb09017f     	cmp	x11, x9
 4641fa4: 54000080     	b.eq	0x4641fb4 <_ChromeMain+0x463cd18>
 4641fa8: b9400169     	ldr	w9, [x11]
 4641fac: 6b09011f     	cmp	w8, w9
 4641fb0: 54fff54a     	b.ge	0x4641e58 <_ChromeMain+0x463cbbc>
 4641fb4: f947e689     	ldr	x9, [x20, #0xfc8]
 4641fb8: f947ea8a     	ldr	x10, [x20, #0xfd0]
 4641fbc: d37be94b     	lsl	x11, x10, #5
 4641fc0: b40002eb     	cbz	x11, 0x464201c <_ChromeMain+0x463cd80>
 4641fc4: 9345fd6c     	asr	x12, x11, #5
 4641fc8: aa0903eb     	mov	x11, x9
 4641fcc: d341fd8d     	lsr	x13, x12, #1
 4641fd0: 8b0d156e     	add	x14, x11, x13, lsl #5
 4641fd4: b84205cf     	ldr	w15, [x14], #0x20
 4641fd8: aa6c07f0     	mvn	x16, x12, lsr #1
 4641fdc: 8b10018c     	add	x12, x12, x16
 4641fe0: 6b0801ff     	cmp	w15, w8
 4641fe4: 9a8db18c     	csel	x12, x12, x13, lt
 4641fe8: 9a8bb1cb     	csel	x11, x14, x11, lt
 4641fec: b5ffff0c     	cbnz	x12, 0x4641fcc <_ChromeMain+0x463cd30>
 4641ff0: 8b0a1529     	add	x9, x9, x10, lsl #5
 4641ff4: eb09017f     	cmp	x11, x9
 4641ff8: 54fff300     	b.eq	0x4641e58 <_ChromeMain+0x463cbbc>
 4641ffc: b9400169     	ldr	w9, [x11]
 4642000: 6b09011f     	cmp	w8, w9
 4642004: 54fff34a     	b.ge	0x4641e6c <_ChromeMain+0x463cbd0>
 4642008: 17ffff94     	b	0x4641e58 <_ChromeMain+0x463cbbc>
 464200c: aa0903eb     	mov	x11, x9
 4642010: 17ffffce     	b	0x4641f48 <_ChromeMain+0x463ccac>
 4642014: aa0903eb     	mov	x11, x9
 4642018: 17ffffe1     	b	0x4641f9c <_ChromeMain+0x463cd00>
 464201c: aa0903eb     	mov	x11, x9
 4642020: 17fffff4     	b	0x4641ff0 <_ChromeMain+0x463cd54>
 4642024: f94002a8     	ldr	x8, [x21]
 4642028: f9402d08     	ldr	x8, [x8, #0x58]
 464202c: aa1503e0     	mov	x0, x21
 4642030: d63f0100     	blr	x8
 4642034: aa0003f6     	mov	x22, x0
 4642038: 94c9ad95     	bl	0x78ad68c <_ChromeMain+0x78a83f0>
 464203c: f10002df     	cmp	x22, #0x0
 4642040: 1a9f07e8     	cset	w8, ne
 4642044: eb0002df     	cmp	x22, x0
 4642048: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 464204c: 540000c0     	b.eq	0x4642064 <_ChromeMain+0x463cdc8>
 4642050: f94026d6     	ldr	x22, [x22, #0x48]
 4642054: f10002df     	cmp	x22, #0x0
 4642058: 1a9f07e8     	cset	w8, ne
 464205c: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4642060: 54ffff81     	b.ne	0x4642050 <_ChromeMain+0x463cdb4>
 4642064: 360000a8     	tbz	w8, #0x0, 0x4642078 <_ChromeMain+0x463cddc>
 4642068: f94212a0     	ldr	x0, [x21, #0x420]
 464206c: aa1303e1     	mov	x1, x19
 4642070: 94d1d8ac     	bl	0x7ab8320 <_ChromeMain+0x7ab3084>
 4642074: 17ffff7e     	b	0x4641e6c <_ChromeMain+0x463cbd0>
 4642078: d4200000     	brk	#0
 464207c: d4400000     	hlt	#0
 4642080: d4200020     	brk	#0x1
