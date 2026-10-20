
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4661df8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4661dfc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4661e00: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4661e04: 910083fd     	add	x29, sp, #0x20
 4661e08: aa0003f3     	mov	x19, x0
 4661e0c: 394f0001     	ldrb	w1, [x0, #0x3c0]
 4661e10: 52000028     	eor	w8, w1, #0x1
 4661e14: 390f0008     	strb	w8, [x0, #0x3c0]
 4661e18: f9418809     	ldr	x9, [x0, #0x310]
 4661e1c: f9427134     	ldr	x20, [x9, #0x4e0]
 4661e20: b4000134     	cbz	x20, 0x4661e44 <_ChromeMain+0x465cba8>
 4661e24: 39504289     	ldrb	w9, [x20, #0x410]
 4661e28: 6b08013f     	cmp	w9, w8
 4661e2c: 540000c0     	b.eq	0x4661e44 <_ChromeMain+0x465cba8>
 4661e30: 39104288     	strb	w8, [x20, #0x410]
 4661e34: 910e2280     	add	x0, x20, #0x388
 4661e38: 9774f2cb     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4661e3c: aa1403e0     	mov	x0, x20
 4661e40: 96fcfccf     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4661e44: 394f2268     	ldrb	w8, [x19, #0x3c8]
 4661e48: 34000048     	cbz	w8, 0x4661e50 <_ChromeMain+0x465cbb4>
 4661e4c: 390f227f     	strb	wzr, [x19, #0x3c8]
 4661e50: f9419674     	ldr	x20, [x19, #0x328]
 4661e54: 394c9288     	ldrb	w8, [x20, #0x324]
 4661e58: 34000248     	cbz	w8, 0x4661ea0 <_ChromeMain+0x465cc04>
 4661e5c: b903229f     	str	wzr, [x20, #0x320]
 4661e60: 390c929f     	strb	wzr, [x20, #0x324]
 4661e64: 394cc288     	ldrb	w8, [x20, #0x330]
 4661e68: 34000048     	cbz	w8, 0x4661e70 <_ChromeMain+0x465cbd4>
 4661e6c: 390cc29f     	strb	wzr, [x20, #0x330]
 4661e70: f9400288     	ldr	x8, [x20]
 4661e74: f9418508     	ldr	x8, [x8, #0x308]
 4661e78: aa1403e0     	mov	x0, x20
 4661e7c: d63f0100     	blr	x8
 4661e80: f9419674     	ldr	x20, [x19, #0x328]
 4661e84: 394c9288     	ldrb	w8, [x20, #0x324]
 4661e88: 340000c8     	cbz	w8, 0x4661ea0 <_ChromeMain+0x465cc04>
 4661e8c: b9432288     	ldr	w8, [x20, #0x320]
 4661e90: 1400001a     	b	0x4661ef8 <_ChromeMain+0x465cc5c>
 4661e94: 6b09015f     	cmp	w10, w9
 4661e98: 540005e0     	b.eq	0x4661f54 <_ChromeMain+0x465ccb8>
 4661e9c: 14000024     	b	0x4661f2c <_ChromeMain+0x465cc90>
 4661ea0: 910d0295     	add	x21, x20, #0x340
 4661ea4: 394d2288     	ldrb	w8, [x20, #0x348]
 4661ea8: 35000228     	cbnz	w8, 0x4661eec <_ChromeMain+0x465cc50>
 4661eac: f941aa88     	ldr	x8, [x20, #0x350]
 4661eb0: 91000508     	add	x8, x8, #0x1
 4661eb4: f901aa88     	str	x8, [x20, #0x350]
 4661eb8: f9418a80     	ldr	x0, [x20, #0x310]
 4661ebc: 90048421     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4661ec0: 9104b021     	add	x1, x1, #0x12c
 4661ec4: 9705cf6f     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 4661ec8: 394d2288     	ldrb	w8, [x20, #0x348]
 4661ecc: 350000c8     	cbnz	w8, 0x4661ee4 <_ChromeMain+0x465cc48>
 4661ed0: b4000835     	cbz	x21, 0x4661fd4 <_ChromeMain+0x465cd38>
 4661ed4: f901a280     	str	x0, [x20, #0x340]
 4661ed8: 52800028     	mov	w8, #0x1                ; =1
 4661edc: 390d2288     	strb	w8, [x20, #0x348]
 4661ee0: 14000004     	b	0x4661ef0 <_ChromeMain+0x465cc54>
 4661ee4: f90002a0     	str	x0, [x21]
 4661ee8: 14000002     	b	0x4661ef0 <_ChromeMain+0x465cc54>
 4661eec: f94002a0     	ldr	x0, [x21]
 4661ef0: d360fc08     	lsr	x8, x0, #32
 4661ef4: f9419674     	ldr	x20, [x19, #0x328]
 4661ef8: 910f1269     	add	x9, x19, #0x3c4
 4661efc: b903c668     	str	w8, [x19, #0x3c4]
 4661f00: 52800028     	mov	w8, #0x1                ; =1
 4661f04: 390f2268     	strb	w8, [x19, #0x3c8]
 4661f08: f9400128     	ldr	x8, [x9]
 4661f0c: d3609d09     	ubfx	x9, x8, #32, #8
 4661f10: 394c928a     	ldrb	w10, [x20, #0x324]
 4661f14: 6a09015f     	tst	w10, w9
 4661f18: 54fffbe0     	b.eq	0x4661e94 <_ChromeMain+0x465cbf8>
 4661f1c: b60005c8     	tbz	x8, #0x20, 0x4661fd4 <_ChromeMain+0x465cd38>
 4661f20: b943228a     	ldr	w10, [x20, #0x320]
 4661f24: 6b08015f     	cmp	w10, w8
 4661f28: 54000160     	b.eq	0x4661f54 <_ChromeMain+0x465ccb8>
 4661f2c: b9032288     	str	w8, [x20, #0x320]
 4661f30: 390c9289     	strb	w9, [x20, #0x324]
 4661f34: 394cc288     	ldrb	w8, [x20, #0x330]
 4661f38: 34000048     	cbz	w8, 0x4661f40 <_ChromeMain+0x465cca4>
 4661f3c: 390cc29f     	strb	wzr, [x20, #0x330]
 4661f40: f9400288     	ldr	x8, [x20]
 4661f44: f9418508     	ldr	x8, [x8, #0x308]
 4661f48: aa1403e0     	mov	x0, x20
 4661f4c: d63f0100     	blr	x8
 4661f50: f9419674     	ldr	x20, [x19, #0x328]
 4661f54: f9400288     	ldr	x8, [x20]
 4661f58: f9405108     	ldr	x8, [x8, #0xa0]
 4661f5c: 52800035     	mov	w21, #0x1               ; =1
 4661f60: aa1403e0     	mov	x0, x20
 4661f64: 52800021     	mov	w1, #0x1                ; =1
 4661f68: d63f0100     	blr	x8
 4661f6c: 394f0268     	ldrb	w8, [x19, #0x3c0]
 4661f70: 910ce260     	add	x0, x19, #0x338
 4661f74: 52000101     	eor	w1, w8, #0x1
 4661f78: 9774f27b     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4661f7c: f941ea74     	ldr	x20, [x19, #0x3d0]
 4661f80: b40002d4     	cbz	x20, 0x4661fd8 <_ChromeMain+0x465cd3c>
 4661f84: 394f0261     	ldrb	w1, [x19, #0x3c0]
 4661f88: b8350288     	ldadd	w21, w8, [x20]
 4661f8c: 7100011f     	cmp	w8, #0x0
 4661f90: 540002ad     	b.le	0x4661fe4 <_ChromeMain+0x465cd48>
 4661f94: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4661f98: 6b09011f     	cmp	w8, w9
 4661f9c: 540002a0     	b.eq	0x4661ff0 <_ChromeMain+0x465cd54>
 4661fa0: f941ea68     	ldr	x8, [x19, #0x3d0]
 4661fa4: f9400508     	ldr	x8, [x8, #0x8]
 4661fa8: aa1403e0     	mov	x0, x20
 4661fac: d63f0100     	blr	x8
 4661fb0: 12800008     	mov	w8, #-0x1               ; =-1
 4661fb4: b8e80288     	ldaddal	w8, w8, [x20]
 4661fb8: 7100051f     	cmp	w8, #0x1
 4661fbc: 54000200     	b.eq	0x4661ffc <_ChromeMain+0x465cd60>
 4661fc0: aa1303e0     	mov	x0, x19
 4661fc4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4661fc8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4661fcc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4661fd0: 14000b2c     	b	0x4664c80 <_ChromeMain+0x465f9e4>
 4661fd4: d4200020     	brk	#0x1
 4661fd8: d4200000     	brk	#0
 4661fdc: d4400000     	hlt	#0
 4661fe0: d4200020     	brk	#0x1
 4661fe4: d4200000     	brk	#0
 4661fe8: d4400000     	hlt	#0
 4661fec: d4200020     	brk	#0x1
 4661ff0: d4200000     	brk	#0
 4661ff4: d4400000     	hlt	#0
 4661ff8: d4200020     	brk	#0x1
 4661ffc: f9400a88     	ldr	x8, [x20, #0x10]
 4662000: aa1403e0     	mov	x0, x20
 4662004: d63f0100     	blr	x8
 4662008: 17ffffee     	b	0x4661fc0 <_ChromeMain+0x465cd24>
 466200c: 00000000     	udf	#0x0
