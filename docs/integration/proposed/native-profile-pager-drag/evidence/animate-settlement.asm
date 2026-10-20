Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4649a5c: f943fe74     	ldr	x20, [x19, #0x7f8]
 4649a60: b4000594     	cbz	x20, 0x4649b10 <_ChromeMain+0x4644874>
 4649a64: fd47b268     	ldr	d8, [x19, #0xf60]
 4649a68: 6f00e400     	movi.2d	v0, #0000000000000000
 4649a6c: f90043ff     	str	xzr, [sp, #0x80]
 4649a70: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4649a74: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4649a78: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4649a7c: ad0003e0     	stp	q0, q0, [sp]
 4649a80: 0f03f600     	fmov.2s	v0, #1.00000000
 4649a84: fd0007e0     	str	d0, [sp, #0x8]
 4649a88: 6f00e409     	movi.2d	v9, #0000000000000000
 4649a8c: 6f00e40a     	movi.2d	v10, #0000000000000000
 4649a90: b9480275     	ldr	w21, [x19, #0x800]
 4649a94: 340001b5     	cbz	w21, 0x4649ac8 <_ChromeMain+0x464482c>
 4649a98: 6b1503e8     	negs	w8, w21
 4649a9c: 1e620100     	scvtf	d0, w8
 4649aa0: 1e6e1001     	fmov	d1, #1.00000000
 4649aa4: 1e7e1002     	fmov	d2, #-1.00000000
 4649aa8: 1e614c41     	fcsel	d1, d2, d1, mi
 4649aac: 1e602820     	fadd	d0, d1, d0
 4649ab0: 6f00e401     	movi.2d	v1, #0000000000000000
 4649ab4: 9539a1d9     	bl	0x94b2218 <_ChromeMain+0x94acf7c>
 4649ab8: 1e600900     	fmul	d0, d8, d0
 4649abc: 1e780008     	fcvtzs	w8, d0
 4649ac0: 0b0802a8     	add	w8, w21, w8
 4649ac4: 1e22010a     	scvtf	s10, w8
 4649ac8: b9480673     	ldr	w19, [x19, #0x804]
 4649acc: 340001b3     	cbz	w19, 0x4649b00 <_ChromeMain+0x4644864>
 4649ad0: 6b1303e8     	negs	w8, w19
 4649ad4: 1e620100     	scvtf	d0, w8
 4649ad8: 1e6e1001     	fmov	d1, #1.00000000
 4649adc: 1e7e1002     	fmov	d2, #-1.00000000
 4649ae0: 1e614c41     	fcsel	d1, d2, d1, mi
 4649ae4: 1e602820     	fadd	d0, d1, d0
 4649ae8: 6f00e401     	movi.2d	v1, #0000000000000000
 4649aec: 9539a1cb     	bl	0x94b2218 <_ChromeMain+0x94acf7c>
 4649af0: 1e600900     	fmul	d0, d8, d0
 4649af4: 1e780008     	fcvtzs	w8, d0
 4649af8: 0b080268     	add	w8, w19, w8
 4649afc: 1e220109     	scvtf	s9, w8
 4649b00: 2d0227ea     	stp	s10, s9, [sp, #0x10]
 4649b04: 910003e1     	mov	x1, sp
 4649b08: aa1403e0     	mov	x0, x20
 4649b0c: 9582417c     	bl	0xa6da0fc <_ChromeMain+0xa6d4e60>
