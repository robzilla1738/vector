Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c786ea0: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 c786ea4: a90157f6     	stp	x22, x21, [sp, #0x10]
 c786ea8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 c786eac: a9037bfd     	stp	x29, x30, [sp, #0x30]
 c786eb0: 9100c3fd     	add	x29, sp, #0x30
 c786eb4: aa0203f7     	mov	x23, x2
 c786eb8: aa0103f8     	mov	x24, x1
 c786ebc: aa0003f3     	mov	x19, x0
 c786ec0: f9400021     	ldr	x1, [x1]
 c786ec4: 9612bc8f     	bl	0x4c36100 <_ChromeMain+0x4c30e64>
 c786ec8: f9400028     	ldr	x8, [x1]
 c786ecc: b50004c8     	cbnz	x8, 0xc786f64 <_ChromeMain+0xc781cc8>
 c786ed0: aa0003f6     	mov	x22, x0
 c786ed4: aa0103f4     	mov	x20, x1
 c786ed8: 52800a00     	mov	w0, #0x50               ; =80
 c786edc: 940fee58     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 c786ee0: b4000540     	cbz	x0, 0xc786f88 <_ChromeMain+0xc781cec>
 c786ee4: aa0003f5     	mov	x21, x0
 c786ee8: aa0003e9     	mov	x9, x0
 c786eec: f802053f     	str	xzr, [x9], #0x20
 c786ef0: b40004c9     	cbz	x9, 0xc786f88 <_ChromeMain+0xc781cec>
 c786ef4: f940030a     	ldr	x10, [x24]
 c786ef8: f94002e8     	ldr	x8, [x23]
 c786efc: f940094b     	ldr	x11, [x10, #0x10]
 c786f00: 3dc00140     	ldr	q0, [x10]
 c786f04: 3d800120     	str	q0, [x9]
 c786f08: f900092b     	str	x11, [x9, #0x10]
 c786f0c: a900fd5f     	stp	xzr, xzr, [x10, #0x8]
 c786f10: f900015f     	str	xzr, [x10]
 c786f14: 39c05d09     	ldrsb	w9, [x8, #0x17]
 c786f18: 37f80309     	tbnz	w9, #0x1f, 0xc786f78 <_ChromeMain+0xc781cdc>
 c786f1c: 3dc00100     	ldr	q0, [x8]
 c786f20: f9400908     	ldr	x8, [x8, #0x10]
 c786f24: f80482a8     	stur	x8, [x21, #0x48]
 c786f28: 3c8382a0     	stur	q0, [x21, #0x38]
 c786f2c: a9007ebf     	stp	xzr, xzr, [x21]
 c786f30: f9000ab6     	str	x22, [x21, #0x10]
 c786f34: f9000295     	str	x21, [x20]
 c786f38: f9400268     	ldr	x8, [x19]
 c786f3c: f9400108     	ldr	x8, [x8]
 c786f40: b4000068     	cbz	x8, 0xc786f4c <_ChromeMain+0xc781cb0>
 c786f44: f9000268     	str	x8, [x19]
 c786f48: f9400295     	ldr	x21, [x20]
 c786f4c: f9400660     	ldr	x0, [x19, #0x8]
 c786f50: aa1503e1     	mov	x1, x21
 c786f54: 940fee6a     	bl	0xcb828fc <_ChromeMain+0xcb7d660>
 c786f58: f9400a68     	ldr	x8, [x19, #0x10]
 c786f5c: 91000508     	add	x8, x8, #0x1
 c786f60: f9000a68     	str	x8, [x19, #0x10]
 c786f64: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 c786f68: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 c786f6c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 c786f70: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 c786f74: d65f03c0     	ret
 c786f78: a9400901     	ldp	x1, x2, [x8]
 c786f7c: 9100e2a0     	add	x0, x21, #0x38
 c786f80: 940fee38     	bl	0xcb82860 <_ChromeMain+0xcb7d5c4>
 c786f84: 17ffffea     	b	0xc786f2c <_ChromeMain+0xc781c90>
 c786f88: d4200020     	brk	#0x1
 c786f8c: 00000000     	udf	#0x0
