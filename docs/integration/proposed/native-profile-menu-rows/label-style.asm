
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45796c0: d10183ff     	sub	sp, sp, #0x60
 45796c4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 45796c8: a90357f6     	stp	x22, x21, [sp, #0x30]
 45796cc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 45796d0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 45796d4: 910143fd     	add	x29, sp, #0x50
 45796d8: aa0403f5     	mov	x21, x4
 45796dc: aa0303f7     	mov	x23, x3
 45796e0: aa0203f6     	mov	x22, x2
 45796e4: aa0103f4     	mov	x20, x1
 45796e8: aa0003f3     	mov	x19, x0
 45796ec: 52800001     	mov	w1, #0x0                ; =0
 45796f0: 97584184     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 45796f4: aa1303e0     	mov	x0, x19
 45796f8: 52800081     	mov	w1, #0x4                ; =4
 45796fc: 97009d91     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 4579700: 394eda68     	ldrb	w8, [x19, #0x3b6]
 4579704: 350007a8     	cbnz	w8, 0x45797f8 <_ChromeMain+0x457455c>
 4579708: aa1303e0     	mov	x0, x19
 457970c: 52800001     	mov	w1, #0x0                ; =0
 4579710: 97871718     	bl	0x273f370 <_ChromeMain+0x273a0d4>
 4579714: b9001bff     	str	wzr, [sp, #0x18]
 4579718: 52800028     	mov	w8, #0x1                ; =1
 457971c: 390073e8     	strb	w8, [sp, #0x1c]
 4579720: 910063e1     	add	x1, sp, #0x18
 4579724: aa1303e0     	mov	x0, x19
 4579728: 970b3bf2     	bl	0x8486f0 <_ChromeMain+0x843454>
 457972c: f94002e8     	ldr	x8, [x23]
 4579730: f9000be8     	str	x8, [sp, #0x10]
 4579734: f9400268     	ldr	x8, [x19]
 4579738: f941f508     	ldr	x8, [x8, #0x3e8]
 457973c: 910043e1     	add	x1, sp, #0x10
 4579740: aa1303e0     	mov	x0, x19
 4579744: d63f0100     	blr	x8
 4579748: 958437d3     	bl	0xa687694 <_ChromeMain+0xa6823f8>
 457974c: f9400017     	ldr	x23, [x0]
 4579750: b94046e8     	ldr	w8, [x23, #0x44]
 4579754: 3100051f     	cmn	w8, #0x1
 4579758: 54000700     	b.eq	0x4579838 <_ChromeMain+0x457459c>
 457975c: 4b080281     	sub	w1, w20, w8
 4579760: aa1703e0     	mov	x0, x23
 4579764: aa1503e2     	mov	x2, x21
 4579768: aa1603e3     	mov	x3, x22
 457976c: 975cb7c5     	bl	0x1ca7680 <_ChromeMain+0x1ca23e4>
 4579770: f90007e0     	str	x0, [sp, #0x8]
 4579774: b40000a0     	cbz	x0, 0x4579788 <_ChromeMain+0x45744ec>
 4579778: b9400008     	ldr	w8, [x0]
 457977c: 31000508     	adds	w8, w8, #0x1
 4579780: b9000008     	str	w8, [x0]
 4579784: 540004e2     	b.hs	0x4579820 <_ChromeMain+0x4574584>
 4579788: f9400268     	ldr	x8, [x19]
 457978c: f941ed08     	ldr	x8, [x8, #0x3d8]
 4579790: 910023e1     	add	x1, sp, #0x8
 4579794: aa1303e0     	mov	x0, x19
 4579798: d63f0100     	blr	x8
 457979c: f94007e0     	ldr	x0, [sp, #0x8]
 45797a0: b40000c0     	cbz	x0, 0x45797b8 <_ChromeMain+0x457451c>
 45797a4: b9400009     	ldr	w9, [x0]
 45797a8: 51000528     	sub	w8, w9, #0x1
 45797ac: b9000008     	str	w8, [x0]
 45797b0: 340003e9     	cbz	w9, 0x457982c <_ChromeMain+0x4574590>
 45797b4: 340001a8     	cbz	w8, 0x45797e8 <_ChromeMain+0x457454c>
 45797b8: 52800288     	mov	w8, #0x14               ; =20
 45797bc: 52800209     	mov	w9, #0x10               ; =16
 45797c0: 7100329f     	cmp	w20, #0xc
 45797c4: 1a880121     	csel	w1, w9, w8, eq
 45797c8: aa1303e0     	mov	x0, x19
 45797cc: 958438f5     	bl	0xa687ba0 <_ChromeMain+0xa682904>
