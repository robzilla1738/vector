
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d5e6c: d10143ff     	sub	sp, sp, #0x50
 41d5e70: a90257f6     	stp	x22, x21, [sp, #0x20]
 41d5e74: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41d5e78: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41d5e7c: 910103fd     	add	x29, sp, #0x40
 41d5e80: 39430008     	ldrb	w8, [x0, #0xc0]
 41d5e84: 37000648     	tbnz	w8, #0x0, 0x41d5f4c <_ChromeMain+0x41d0cb0>
 41d5e88: aa0003f4     	mov	x20, x0
 41d5e8c: 52800028     	mov	w8, #0x1                ; =1
 41d5e90: 39030008     	strb	w8, [x0, #0xc0]
 41d5e94: d0055960     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 41d5e98: 9135a000     	add	x0, x0, #0xd68
 41d5e9c: f9400008     	ldr	x8, [x0]
 41d5ea0: d63f0100     	blr	x8
 41d5ea4: f9400008     	ldr	x8, [x0]
 41d5ea8: b40005c8     	cbz	x8, 0x41d5f60 <_ChromeMain+0x41d0cc4>
 41d5eac: f9400113     	ldr	x19, [x8]
 41d5eb0: b4000593     	cbz	x19, 0x41d5f60 <_ChromeMain+0x41d0cc4>
 41d5eb4: b004c880     	adrp	x0, 0xdae6000 <dyld_stub_binder+0xdae6000>
 41d5eb8: 913cb800     	add	x0, x0, #0xf2e
 41d5ebc: b004c881     	adrp	x1, 0xdae6000 <dyld_stub_binder+0xdae6000>
 41d5ec0: 913d3c21     	add	x1, x1, #0xf4f
 41d5ec4: 910003e8     	mov	x8, sp
 41d5ec8: 52803be2     	mov	w2, #0x1df              ; =479
 41d5ecc: 96f9eb6d     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 41d5ed0: f9406695     	ldr	x21, [x20, #0xc8]
 41d5ed4: b40000d5     	cbz	x21, 0x41d5eec <_ChromeMain+0x41d0c50>
 41d5ed8: 52800028     	mov	w8, #0x1                ; =1
 41d5edc: b82802a8     	ldadd	w8, w8, [x21]
 41d5ee0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41d5ee4: 6b09011f     	cmp	w8, w9
 41d5ee8: 54000420     	b.eq	0x41d5f6c <_ChromeMain+0x41d0cd0>
 41d5eec: f9406a94     	ldr	x20, [x20, #0xd0]
 41d5ef0: 52800800     	mov	w0, #0x40               ; =64
 41d5ef4: 96f8e51d     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d5ef8: aa0003e2     	mov	x2, x0
 41d5efc: 52800028     	mov	w8, #0x1                ; =1
 41d5f00: b9000008     	str	w8, [x0]
 41d5f04: b0ffecc8     	adrp	x8, 0x3f6e000 <_ChromeMain+0x3f68d64>
 41d5f08: 91230108     	add	x8, x8, #0x8c0
 41d5f0c: f0ffeca9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 41d5f10: 912b0129     	add	x9, x9, #0xac0
 41d5f14: a900a408     	stp	x8, x9, [x0, #0x8]
 41d5f18: b0fff6c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 41d5f1c: 911b0108     	add	x8, x8, #0x6c0
 41d5f20: 10011fc9     	adr	x9, 0x41d8318 <_ChromeMain+0x41d307c>
 41d5f24: d503201f     	nop
 41d5f28: a901a408     	stp	x8, x9, [x0, #0x18]
 41d5f2c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 41d5f30: f9001c14     	str	x20, [x0, #0x38]
 41d5f34: f9400268     	ldr	x8, [x19]
 41d5f38: f9400108     	ldr	x8, [x8]
 41d5f3c: 910003e1     	mov	x1, sp
 41d5f40: aa1303e0     	mov	x0, x19
 41d5f44: d2800003     	mov	x3, #0x0                ; =0
 41d5f48: d63f0100     	blr	x8
 41d5f4c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 41d5f50: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 41d5f54: a94257f6     	ldp	x22, x21, [sp, #0x20]
 41d5f58: 910143ff     	add	sp, sp, #0x50
 41d5f5c: d65f03c0     	ret
 41d5f60: d4200000     	brk	#0
 41d5f64: d4400000     	hlt	#0
 41d5f68: d4200020     	brk	#0x1
 41d5f6c: d4200000     	brk	#0
 41d5f70: d4400000     	hlt	#0
 41d5f74: d4200020     	brk	#0x1
 41d5f78: f9402008     	ldr	x8, [x0, #0x40]
 41d5f7c: eb01011f     	cmp	x8, x1
 41d5f80: 54000040     	b.eq	0x41d5f88 <_ChromeMain+0x41d0cec>
 41d5f84: d65f03c0     	ret
 41d5f88: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41d5f8c: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41d5f90: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41d5f94: 910083fd     	add	x29, sp, #0x20
 41d5f98: aa0003f3     	mov	x19, x0
 41d5f9c: f9402808     	ldr	x8, [x0, #0x50]
 41d5fa0: d37df114     	lsl	x20, x8, #3
 41d5fa4: b40000f4     	cbz	x20, 0x41d5fc0 <_ChromeMain+0x41d0d24>
 41d5fa8: f9402675     	ldr	x21, [x19, #0x48]
 41d5fac: f84086a1     	ldr	x1, [x21], #0x8
 41d5fb0: aa1303e0     	mov	x0, x19
 41d5fb4: 94000147     	bl	0x41d64d0 <_ChromeMain+0x41d1234>
 41d5fb8: f1002294     	subs	x20, x20, #0x8
 41d5fbc: 54ffff81     	b.ne	0x41d5fac <_ChromeMain+0x41d0d10>
 41d5fc0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41d5fc4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41d5fc8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41d5fcc: d65f03c0     	ret
 41d5fd0: 14000001     	b	0x41d5fd4 <_ChromeMain+0x41d0d38>
 41d5fd4: d10303ff     	sub	sp, sp, #0xc0
 41d5fd8: a9066ffc     	stp	x28, x27, [sp, #0x60]
 41d5fdc: a90767fa     	stp	x26, x25, [sp, #0x70]
 41d5fe0: a9085ff8     	stp	x24, x23, [sp, #0x80]
 41d5fe4: a90957f6     	stp	x22, x21, [sp, #0x90]
 41d5fe8: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 41d5fec: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 41d5ff0: 9102c3fd     	add	x29, sp, #0xb0
 41d5ff4: f9402028     	ldr	x8, [x1, #0x40]
 41d5ff8: f9402009     	ldr	x9, [x0, #0x40]
 41d5ffc: eb08013f     	cmp	x9, x8
 41d6000: 54000160     	b.eq	0x41d602c <_ChromeMain+0x41d0d90>
 41d6004: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 41d6008: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 41d600c: a94957f6     	ldp	x22, x21, [sp, #0x90]
 41d6010: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 41d6014: a94767fa     	ldp	x26, x25, [sp, #0x70]
 41d6018: a9466ffc     	ldp	x28, x27, [sp, #0x60]
 41d601c: 910303ff     	add	sp, sp, #0xc0
 41d6020: d65f03c0     	ret
 41d6024: aa1903f7     	mov	x23, x25
 41d6028: 1400001a     	b	0x41d6090 <_ChromeMain+0x41d0df4>
 41d602c: b9403828     	ldr	w8, [x1, #0x38]
 41d6030: 35fffea8     	cbnz	w8, 0x41d6004 <_ChromeMain+0x41d0d68>
 41d6034: aa0003f3     	mov	x19, x0
 41d6038: f9403034     	ldr	x20, [x1, #0x60]
 41d603c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 41d6040: 90054ef6     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41d6044: f94046c9     	ldr	x9, [x22, #0x88]
 41d6048: eb09011f     	cmp	x8, x9
 41d604c: 54000061     	b.ne	0x41d6058 <_ChromeMain+0x41d0dbc>
 41d6050: aa1403e0     	mov	x0, x20
 41d6054: 96f8f8aa     	bl	0x142fc <_ChromeMain+0xf060>
 41d6058: a944a679     	ldp	x25, x9, [x19, #0x48]
 41d605c: d37df128     	lsl	x8, x9, #3
 41d6060: b4fffe28     	cbz	x8, 0x41d6024 <_ChromeMain+0x41d0d88>
 41d6064: 9343fd0a     	asr	x10, x8, #3
 41d6068: aa1903f7     	mov	x23, x25
 41d606c: d341fd4b     	lsr	x11, x10, #1
 41d6070: 8b0b0eec     	add	x12, x23, x11, lsl #3
 41d6074: f840858d     	ldr	x13, [x12], #0x8
 41d6078: aa6a07ee     	mvn	x14, x10, lsr #1
 41d607c: 8b0e014a     	add	x10, x10, x14
 41d6080: eb1401bf     	cmp	x13, x20
 41d6084: 9a8b314a     	csel	x10, x10, x11, lo
 41d6088: 9a973197     	csel	x23, x12, x23, lo
 41d608c: b5ffff0a     	cbnz	x10, 0x41d606c <_ChromeMain+0x41d0dd0>
 41d6090: 8b090f2a     	add	x10, x25, x9, lsl #3
 41d6094: eb0a02ff     	cmp	x23, x10
 41d6098: 54000a00     	b.eq	0x41d61d8 <_ChromeMain+0x41d0f3c>
 41d609c: f94002ea     	ldr	x10, [x23]
 41d60a0: eb0a029f     	cmp	x20, x10
 41d60a4: 540009a3     	b.lo	0x41d61d8 <_ChromeMain+0x41d0f3c>
 41d60a8: 52800015     	mov	w21, #0x0               ; =0
 41d60ac: aa1403e0     	mov	x0, x20
 41d60b0: 1400000e     	b	0x41d60e8 <_ChromeMain+0x41d0e4c>
 41d60b4: a944a275     	ldp	x21, x8, [x19, #0x48]
 41d60b8: 9343ff29     	asr	x9, x25, #3
 41d60bc: 8b9b0d29     	add	x9, x9, x27, asr #3
 41d60c0: 8b080128     	add	x8, x9, x8
 41d60c4: a904a27a     	stp	x26, x8, [x19, #0x48]
 41d60c8: f9402e68     	ldr	x8, [x19, #0x58]
 41d60cc: f9002e78     	str	x24, [x19, #0x58]
 41d60d0: b4000095     	cbz	x21, 0x41d60e0 <_ChromeMain+0x41d0e44>
 41d60d4: d37df101     	lsl	x1, x8, #3
 41d60d8: aa1503e0     	mov	x0, x21
 41d60dc: 96f8cb77     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d60e0: d2800000     	mov	x0, #0x0                ; =0
 41d60e4: 52800035     	mov	w21, #0x1               ; =1
 41d60e8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d60ec: f94046c9     	ldr	x9, [x22, #0x88]
 41d60f0: eb09011f     	cmp	x8, x9
 41d60f4: 54000041     	b.ne	0x41d60fc <_ChromeMain+0x41d0e60>
 41d60f8: 96f93251     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d60fc: 34fff855     	cbz	w21, 0x41d6004 <_ChromeMain+0x41d0d68>
 41d6100: 91008280     	add	x0, x20, #0x20
 41d6104: 91006261     	add	x1, x19, #0x18
 41d6108: 97625b42     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 41d610c: 91006260     	add	x0, x19, #0x18
 41d6110: aa1403e1     	mov	x1, x20
 41d6114: 97625b8f     	bl	0x1a6cf50 <_ChromeMain+0x1a67cb4>
 41d6118: b4000414     	cbz	x20, 0x41d6198 <_ChromeMain+0x41d0efc>
 41d611c: f9002bff     	str	xzr, [sp, #0x50]
 41d6120: 6f00e400     	movi.2d	v0, #0000000000000000
 41d6124: ad0183e0     	stp	q0, q0, [sp, #0x30]
 41d6128: f9400281     	ldr	x1, [x20]
 41d612c: 9100c3e0     	add	x0, sp, #0x30
 41d6130: 52800002     	mov	w2, #0x0                ; =0
 41d6134: 97214289     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 41d6138: f90013ff     	str	xzr, [sp, #0x20]
 41d613c: 6f00e400     	movi.2d	v0, #0000000000000000
 41d6140: ad0003e0     	stp	q0, q0, [sp]
 41d6144: f9400281     	ldr	x1, [x20]
 41d6148: 910003e0     	mov	x0, sp
 41d614c: 52800022     	mov	w2, #0x1                ; =1
 41d6150: 97214282     	bl	0xa26b58 <_ChromeMain+0xa218bc>
 41d6154: 14000005     	b	0x41d6168 <_ChromeMain+0x41d0ecc>
 41d6158: aa1303e0     	mov	x0, x19
 41d615c: 94000506     	bl	0x41d7574 <_ChromeMain+0x41d22d8>
 41d6160: 9100c3e0     	add	x0, sp, #0x30
 41d6164: 972142c8     	bl	0xa26c84 <_ChromeMain+0xa219e8>
 41d6168: f9401be1     	ldr	x1, [sp, #0x30]
 41d616c: f94003e8     	ldr	x8, [sp]
 41d6170: eb08003f     	cmp	x1, x8
 41d6174: 540000a0     	b.eq	0x41d6188 <_ChromeMain+0x41d0eec>
 41d6178: b4ffff41     	cbz	x1, 0x41d6160 <_ChromeMain+0x41d0ec4>
 41d617c: 39418428     	ldrb	w8, [x1, #0x61]
 41d6180: 34ffff08     	cbz	w8, 0x41d6160 <_ChromeMain+0x41d0ec4>
 41d6184: 17fffff5     	b	0x41d6158 <_ChromeMain+0x41d0ebc>
 41d6188: 910003e0     	mov	x0, sp
 41d618c: 970ed494     	bl	0x58b3dc <_ChromeMain+0x586140>
 41d6190: 9100c3e0     	add	x0, sp, #0x30
 41d6194: 970ed492     	bl	0x58b3dc <_ChromeMain+0x586140>
 41d6198: f9402260     	ldr	x0, [x19, #0x40]
 41d619c: 94e426fe     	bl	0x7adfd94 <_ChromeMain+0x7adaaf8>
 41d61a0: 3707f320     	tbnz	w0, #0x0, 0x41d6004 <_ChromeMain+0x41d0d68>
 41d61a4: aa1303e0     	mov	x0, x19
 41d61a8: aa1403e1     	mov	x1, x20
 41d61ac: 940000c9     	bl	0x41d64d0 <_ChromeMain+0x41d1234>
 41d61b0: 17ffff95     	b	0x41d6004 <_ChromeMain+0x41d0d68>
 41d61b4: b40012f7     	cbz	x23, 0x41d6410 <_ChromeMain+0x41d1174>
 41d61b8: d2800000     	mov	x0, #0x0                ; =0
 41d61bc: f90002f4     	str	x20, [x23]
 41d61c0: f9402668     	ldr	x8, [x19, #0x48]
 41d61c4: cb0802e8     	sub	x8, x23, x8
 41d61c8: 91002108     	add	x8, x8, #0x8
 41d61cc: 9343fd08     	asr	x8, x8, #3
 41d61d0: f9002a68     	str	x8, [x19, #0x50]
 41d61d4: 17ffffc4     	b	0x41d60e4 <_ChromeMain+0x41d0e48>
 41d61d8: cb1902fa     	sub	x26, x23, x25
 41d61dc: f9402e6a     	ldr	x10, [x19, #0x58]
 41d61e0: eb0a013f     	cmp	x9, x10
 41d61e4: 54000500     	b.eq	0x41d6284 <_ChromeMain+0x41d0fe8>
 41d61e8: 8b080329     	add	x9, x25, x8
 41d61ec: eb0902ff     	cmp	x23, x9
 41d61f0: 54fffe20     	b.eq	0x41d61b4 <_ChromeMain+0x41d0f18>
 41d61f4: d1002135     	sub	x21, x9, #0x8
 41d61f8: eb0902bf     	cmp	x21, x9
 41d61fc: 540000a2     	b.hs	0x41d6210 <_ChromeMain+0x41d0f74>
 41d6200: f85f812a     	ldur	x10, [x9, #-0x8]
 41d6204: a93fa93f     	stp	xzr, x10, [x9, #-0x8]
 41d6208: 91002129     	add	x9, x9, #0x8
 41d620c: f9402679     	ldr	x25, [x19, #0x48]
 41d6210: cb190129     	sub	x9, x9, x25
 41d6214: 9343fd29     	asr	x9, x9, #3
 41d6218: f9002a69     	str	x9, [x19, #0x50]
 41d621c: 91002349     	add	x9, x26, #0x8
 41d6220: eb09011f     	cmp	x8, x9
 41d6224: 54000060     	b.eq	0x41d6230 <_ChromeMain+0x41d0f94>
 41d6228: aa1503f8     	mov	x24, x21
 41d622c: 14000010     	b	0x41d626c <_ChromeMain+0x41d0fd0>
 41d6230: f94002e0     	ldr	x0, [x23]
 41d6234: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d6238: f94046c9     	ldr	x9, [x22, #0x88]
 41d623c: eb09011f     	cmp	x8, x9
 41d6240: 54000041     	b.ne	0x41d6248 <_ChromeMain+0x41d0fac>
 41d6244: 96f931fe     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d6248: d2800000     	mov	x0, #0x0                ; =0
 41d624c: f90002f4     	str	x20, [x23]
 41d6250: 17ffffa5     	b	0x41d60e4 <_ChromeMain+0x41d0e48>
 41d6254: 96f931fa     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d6258: f85f82a8     	ldur	x8, [x21, #-0x8]
 41d625c: a93fa2bf     	stp	xzr, x8, [x21, #-0x8]
 41d6260: aa1803f5     	mov	x21, x24
 41d6264: eb17031f     	cmp	x24, x23
 41d6268: 54fffe40     	b.eq	0x41d6230 <_ChromeMain+0x41d0f94>
 41d626c: f85f8700     	ldr	x0, [x24], #-0x8
 41d6270: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d6274: f94046c9     	ldr	x9, [x22, #0x88]
 41d6278: eb09011f     	cmp	x8, x9
 41d627c: 54fffee1     	b.ne	0x41d6258 <_ChromeMain+0x41d0fbc>
 41d6280: 17fffff5     	b	0x41d6254 <_ChromeMain+0x41d0fb8>
 41d6284: 91000528     	add	x8, x9, #0x1
 41d6288: d37dfd0a     	lsr	x10, x8, #61
 41d628c: b5000c4a     	cbnz	x10, 0x41d6414 <_ChromeMain+0x41d1178>
 41d6290: d37ff92a     	lsl	x10, x9, #1
 41d6294: eb08015f     	cmp	x10, x8
 41d6298: 9a888158     	csel	x24, x10, x8, hi
 41d629c: 92fe0008     	mov	x8, #0xfffffffffffffff  ; =1152921504606846975
 41d62a0: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 41d62a4: eb08013f     	cmp	x9, x8
 41d62a8: 9a8a331c     	csel	x28, x24, x10, lo
 41d62ac: b400023c     	cbz	x28, 0x41d62f0 <_ChromeMain+0x41d1054>
 41d62b0: d37dff88     	lsr	x8, x28, #61
 41d62b4: b5000b28     	cbnz	x8, 0x41d6418 <_ChromeMain+0x41d117c>
 41d62b8: d37df380     	lsl	x0, x28, #3
 41d62bc: 96f8e42b     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d62c0: aa0003f5     	mov	x21, x0
 41d62c4: 8b1a02bb     	add	x27, x21, x26
 41d62c8: eb9a0f9f     	cmp	x28, x26, asr #3
 41d62cc: 540002e1     	b.ne	0x41d6328 <_ChromeMain+0x41d108c>
 41d62d0: eb1902ff     	cmp	x23, x25
 41d62d4: 54000120     	b.eq	0x41d62f8 <_ChromeMain+0x41d105c>
 41d62d8: d37ef788     	lsl	x8, x28, #2
 41d62dc: 91001108     	add	x8, x8, #0x4
 41d62e0: 927df108     	and	x8, x8, #0xfffffffffffffff8
 41d62e4: cb08037a     	sub	x26, x27, x8
 41d62e8: aa1a03fb     	mov	x27, x26
 41d62ec: 14000011     	b	0x41d6330 <_ChromeMain+0x41d1094>
 41d62f0: d2800015     	mov	x21, #0x0               ; =0
 41d62f4: 17fffff4     	b	0x41d62c4 <_ChromeMain+0x41d1028>
 41d62f8: d37ffb88     	lsl	x8, x28, #1
 41d62fc: f100051f     	cmp	x8, #0x1
 41d6300: 9a9f8518     	csinc	x24, x8, xzr, hi
 41d6304: d37df300     	lsl	x0, x24, #3
 41d6308: 96f8e418     	bl	0xf368 <_ChromeMain+0xa0cc>
 41d630c: d342ff08     	lsr	x8, x24, #2
 41d6310: 8b080c1a     	add	x26, x0, x8, lsl #3
 41d6314: b40000f5     	cbz	x21, 0x41d6330 <_ChromeMain+0x41d1094>
 41d6318: d37df381     	lsl	x1, x28, #3
 41d631c: aa1503e0     	mov	x0, x21
 41d6320: 96f8cae6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d6324: 14000003     	b	0x41d6330 <_ChromeMain+0x41d1094>
 41d6328: aa1c03f8     	mov	x24, x28
 41d632c: aa1b03fa     	mov	x26, x27
 41d6330: b400071b     	cbz	x27, 0x41d6410 <_ChromeMain+0x41d1174>
 41d6334: f9000374     	str	x20, [x27]
 41d6338: cb1a0368     	sub	x8, x27, x26
 41d633c: 91002119     	add	x25, x8, #0x8
 41d6340: a944a275     	ldp	x21, x8, [x19, #0x48]
 41d6344: 8b080ebb     	add	x27, x21, x8, lsl #3
 41d6348: eb1b02ff     	cmp	x23, x27
 41d634c: 540002e0     	b.eq	0x41d63a8 <_ChromeMain+0x41d110c>
 41d6350: 8b190348     	add	x8, x26, x25
 41d6354: aa1703e9     	mov	x9, x23
 41d6358: b40005c8     	cbz	x8, 0x41d6410 <_ChromeMain+0x41d1174>
 41d635c: f940012a     	ldr	x10, [x9]
 41d6360: f800850a     	str	x10, [x8], #0x8
 41d6364: f800853f     	str	xzr, [x9], #0x8
 41d6368: eb1b013f     	cmp	x9, x27
 41d636c: 54ffff61     	b.ne	0x41d6358 <_ChromeMain+0x41d10bc>
 41d6370: aa1703f5     	mov	x21, x23
 41d6374: 14000005     	b	0x41d6388 <_ChromeMain+0x41d10ec>
 41d6378: 96f931b1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d637c: f80086bf     	str	xzr, [x21], #0x8
 41d6380: eb1b02bf     	cmp	x21, x27
 41d6384: 54000100     	b.eq	0x41d63a4 <_ChromeMain+0x41d1108>
 41d6388: b4000455     	cbz	x21, 0x41d6410 <_ChromeMain+0x41d1174>
 41d638c: f94002a0     	ldr	x0, [x21]
 41d6390: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d6394: f94046c9     	ldr	x9, [x22, #0x88]
 41d6398: eb09011f     	cmp	x8, x9
 41d639c: 54ffff01     	b.ne	0x41d637c <_ChromeMain+0x41d10e0>
 41d63a0: 17fffff6     	b	0x41d6378 <_ChromeMain+0x41d10dc>
 41d63a4: a944a275     	ldp	x21, x8, [x19, #0x48]
 41d63a8: cb17037b     	sub	x27, x27, x23
 41d63ac: cb9b0d08     	sub	x8, x8, x27, asr #3
 41d63b0: f9002a68     	str	x8, [x19, #0x50]
 41d63b4: cb080f5a     	sub	x26, x26, x8, lsl #3
 41d63b8: eb1702bf     	cmp	x21, x23
 41d63bc: 54ffe7e0     	b.eq	0x41d60b8 <_ChromeMain+0x41d0e1c>
 41d63c0: aa1503e8     	mov	x8, x21
 41d63c4: aa1a03e9     	mov	x9, x26
 41d63c8: b4000249     	cbz	x9, 0x41d6410 <_ChromeMain+0x41d1174>
 41d63cc: f940010a     	ldr	x10, [x8]
 41d63d0: f800852a     	str	x10, [x9], #0x8
 41d63d4: f800851f     	str	xzr, [x8], #0x8
 41d63d8: eb17011f     	cmp	x8, x23
 41d63dc: 54ffff61     	b.ne	0x41d63c8 <_ChromeMain+0x41d112c>
 41d63e0: 14000005     	b	0x41d63f4 <_ChromeMain+0x41d1158>
 41d63e4: 96f93196     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41d63e8: f80086bf     	str	xzr, [x21], #0x8
 41d63ec: eb1702bf     	cmp	x21, x23
 41d63f0: 54ffe620     	b.eq	0x41d60b4 <_ChromeMain+0x41d0e18>
 41d63f4: b40000f5     	cbz	x21, 0x41d6410 <_ChromeMain+0x41d1174>
 41d63f8: f94002a0     	ldr	x0, [x21]
 41d63fc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41d6400: f94046c9     	ldr	x9, [x22, #0x88]
 41d6404: eb09011f     	cmp	x8, x9
 41d6408: 54ffff01     	b.ne	0x41d63e8 <_ChromeMain+0x41d114c>
 41d640c: 17fffff6     	b	0x41d63e4 <_ChromeMain+0x41d1148>
 41d6410: d4200020     	brk	#0x1
 41d6414: 9774f65b     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 41d6418: 9428bf02     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 41d641c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41d6420: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41d6424: 910043fd     	add	x29, sp, #0x10
 41d6428: b40000c1     	cbz	x1, 0x41d6440 <_ChromeMain+0x41d11a4>
 41d642c: aa0003f3     	mov	x19, x0
 41d6430: f9402028     	ldr	x8, [x1, #0x40]
 41d6434: f9402009     	ldr	x9, [x0, #0x40]
 41d6438: eb08013f     	cmp	x9, x8
 41d643c: 54000080     	b.eq	0x41d644c <_ChromeMain+0x41d11b0>
 41d6440: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41d6444: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41d6448: d65f03c0     	ret
 41d644c: b9403828     	ldr	w8, [x1, #0x38]
 41d6450: 35ffff88     	cbnz	w8, 0x41d6440 <_ChromeMain+0x41d11a4>
 41d6454: f9403034     	ldr	x20, [x1, #0x60]
 41d6458: aa1303e0     	mov	x0, x19
 41d645c: a9c4a408     	ldp	x8, x9, [x0, #0x48]!
 41d6460: d37df12a     	lsl	x10, x9, #3
 41d6464: b400032a     	cbz	x10, 0x41d64c8 <_ChromeMain+0x41d122c>
 41d6468: 9343fd4a     	asr	x10, x10, #3
 41d646c: aa0803e1     	mov	x1, x8
 41d6470: d341fd4b     	lsr	x11, x10, #1
 41d6474: 8b0b0c2c     	add	x12, x1, x11, lsl #3
 41d6478: f840858d     	ldr	x13, [x12], #0x8
 41d647c: aa6a07ee     	mvn	x14, x10, lsr #1
 41d6480: 8b0e014a     	add	x10, x10, x14
 41d6484: eb1401bf     	cmp	x13, x20
 41d6488: 9a8b314a     	csel	x10, x10, x11, lo
 41d648c: 9a813181     	csel	x1, x12, x1, lo
 41d6490: b5ffff0a     	cbnz	x10, 0x41d6470 <_ChromeMain+0x41d11d4>
 41d6494: 8b090d08     	add	x8, x8, x9, lsl #3
 41d6498: eb08003f     	cmp	x1, x8
 41d649c: 54fffd20     	b.eq	0x41d6440 <_ChromeMain+0x41d11a4>
 41d64a0: f9400028     	ldr	x8, [x1]
 41d64a4: eb08029f     	cmp	x20, x8
 41d64a8: 54fffcc3     	b.lo	0x41d6440 <_ChromeMain+0x41d11a4>
 41d64ac: 91002022     	add	x2, x1, #0x8
 41d64b0: 94000927     	bl	0x41d894c <_ChromeMain+0x41d36b0>
 41d64b4: 91006261     	add	x1, x19, #0x18
 41d64b8: aa1403e0     	mov	x0, x20
 41d64bc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41d64c0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41d64c4: 176cb807     	b	0x1d044e0 <_ChromeMain+0x1cff244>
 41d64c8: aa0803e1     	mov	x1, x8
 41d64cc: 17fffff2     	b	0x41d6494 <_ChromeMain+0x41d11f8>
