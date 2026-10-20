
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 462c188: d10143ff     	sub	sp, sp, #0x50
 462c18c: a90257f6     	stp	x22, x21, [sp, #0x20]
 462c190: a9034ff4     	stp	x20, x19, [sp, #0x30]
 462c194: a9047bfd     	stp	x29, x30, [sp, #0x40]
 462c198: 910103fd     	add	x29, sp, #0x40
 462c19c: 397e4008     	ldrb	w8, [x0, #0xf90]
 462c1a0: 370006a8     	tbnz	w8, #0x0, 0x462c274 <_ChromeMain+0x4626fd8>
 462c1a4: aa0003f4     	mov	x20, x0
 462c1a8: 52823328     	mov	w8, #0x1199             ; =4505
 462c1ac: 38686809     	ldrb	w9, [x0, x8]
 462c1b0: 37000629     	tbnz	w9, #0x0, 0x462c274 <_ChromeMain+0x4626fd8>
 462c1b4: 52800029     	mov	w9, #0x1                ; =1
 462c1b8: 38286a89     	strb	w9, [x20, x8]
 462c1bc: f00536a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 462c1c0: 91360000     	add	x0, x0, #0xd80
 462c1c4: f9400008     	ldr	x8, [x0]
 462c1c8: d63f0100     	blr	x8
 462c1cc: f9400008     	ldr	x8, [x0]
 462c1d0: b40005c8     	cbz	x8, 0x462c288 <_ChromeMain+0x4626fec>
 462c1d4: f9400113     	ldr	x19, [x8]
 462c1d8: b4000593     	cbz	x19, 0x462c288 <_ChromeMain+0x4626fec>
 462c1dc: f004c4e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462c1e0: 91334800     	add	x0, x0, #0xcd2
 462c1e4: f004c4e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 462c1e8: 912c7821     	add	x1, x1, #0xb1e
 462c1ec: 910003e8     	mov	x8, sp
 462c1f0: 52855ce2     	mov	w2, #0x2ae7             ; =10983
 462c1f4: 96e892a3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 462c1f8: f94a0695     	ldr	x21, [x20, #0x1408]
 462c1fc: b40000d5     	cbz	x21, 0x462c214 <_ChromeMain+0x4626f78>
 462c200: 52800028     	mov	w8, #0x1                ; =1
 462c204: b82802a8     	ldadd	w8, w8, [x21]
 462c208: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 462c20c: 6b09011f     	cmp	w8, w9
 462c210: 54000420     	b.eq	0x462c294 <_ChromeMain+0x4626ff8>
 462c214: f94a0a94     	ldr	x20, [x20, #0x1410]
 462c218: 52800800     	mov	w0, #0x40               ; =64
 462c21c: 96e78c53     	bl	0xf368 <_ChromeMain+0xa0cc>
 462c220: aa0003e2     	mov	x2, x0
 462c224: 52800028     	mov	w8, #0x1                ; =1
 462c228: b9000008     	str	w8, [x0]
 462c22c: f0ffcc68     	adrp	x8, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 462c230: 911c0108     	add	x8, x8, #0x700
 462c234: d0ffcb89     	adrp	x9, 0x3f9e000 <_ChromeMain+0x3f98d64>
 462c238: 91110129     	add	x9, x9, #0x440
 462c23c: a900a408     	stp	x8, x9, [x0, #0x8]
 462c240: d0ffd1e8     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 462c244: 910a0108     	add	x8, x8, #0x280
 462c248: 1010a4c9     	adr	x9, 0x464d6e0 <_ChromeMain+0x4648444>
 462c24c: d503201f     	nop
 462c250: a901a408     	stp	x8, x9, [x0, #0x18]
 462c254: a902d41f     	stp	xzr, x21, [x0, #0x28]
 462c258: f9001c14     	str	x20, [x0, #0x38]
 462c25c: f9400268     	ldr	x8, [x19]
 462c260: f9400108     	ldr	x8, [x8]
 462c264: 910003e1     	mov	x1, sp
 462c268: aa1303e0     	mov	x0, x19
 462c26c: d2800003     	mov	x3, #0x0                ; =0
 462c270: d63f0100     	blr	x8
 462c274: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 462c278: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 462c27c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 462c280: 910143ff     	add	sp, sp, #0x50
 462c284: d65f03c0     	ret
 462c288: d4200000     	brk	#0
 462c28c: d4400000     	hlt	#0
 462c290: d4200020     	brk	#0x1
 462c294: d4200000     	brk	#0
 462c298: d4400000     	hlt	#0
 462c29c: d4200020     	brk	#0x1
 462c2a0: d503201f     	nop
 462c2a4: d503201f     	nop
 462c2a8: d503201f     	nop
 462c2ac: d503201f     	nop
 462c2b0: d503201f     	nop
 462c2b4: d503201f     	nop
 462c2b8: d503201f     	nop
 462c2bc: d503201f     	nop
