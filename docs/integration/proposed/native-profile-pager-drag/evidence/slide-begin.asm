Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 239e964: 6dbd23e9     	stp	d9, d8, [sp, #-0x30]!
 239e968: a9014ff4     	stp	x20, x19, [sp, #0x10]
 239e96c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 239e970: 910083fd     	add	x29, sp, #0x20
 239e974: 39416008     	ldrb	w8, [x0, #0x58]
 239e978: b9405409     	ldr	w9, [x0, #0x54]
 239e97c: 7100011f     	cmp	w8, #0x0
 239e980: 7a411120     	ccmp	w9, w1, #0x0, ne
 239e984: 540005a0     	b.eq	0x239ea38 <_ChromeMain+0x239979c>
 239e988: aa0003f3     	mov	x19, x0
 239e98c: b9005401     	str	w1, [x0, #0x54]
 239e990: 52800028     	mov	w8, #0x1                ; =1
 239e994: 39016008     	strb	w8, [x0, #0x58]
 239e998: fd403800     	ldr	d0, [x0, #0x70]
 239e99c: 7100003f     	cmp	w1, #0x0
 239e9a0: 6f00e401     	movi.2d	v1, #0000000000000000
 239e9a4: 1e6e1008     	fmov	d8, #1.00000000
 239e9a8: 1e610d01     	fcsel	d1, d8, d1, eq
 239e9ac: 6d060400     	stp	d0, d1, [x0, #0x60]
 239e9b0: f9403c14     	ldr	x20, [x0, #0x78]
 239e9b4: b4000614     	cbz	x20, 0x239ea74 <_ChromeMain+0x23997d8>
 239e9b8: 1e612000     	fcmp	d0, d1
 239e9bc: 540003e0     	b.eq	0x239ea38 <_ChromeMain+0x239979c>
 239e9c0: 1e603901     	fsub	d1, d8, d0
 239e9c4: 7100003f     	cmp	w1, #0x0
 239e9c8: 1e610c00     	fcsel	d0, d0, d1, eq
 239e9cc: fd404261     	ldr	d1, [x19, #0x80]
 239e9d0: 9584de09     	bl	0x84d61f4 <_ChromeMain+0x84d0f58>
 239e9d4: 1e603900     	fsub	d0, d8, d0
 239e9d8: 9e620281     	scvtf	d1, x20
 239e9dc: 1e610800     	fmul	d0, d0, d1
 239e9e0: d2f87c08     	mov	x8, #-0x3c20000000000000 ; =-4332462841530417152
 239e9e4: 9e670101     	fmov	d1, x8
 239e9e8: 1e612000     	fcmp	d0, d1
 239e9ec: 92f00008     	mov	x8, #0x7fffffffffffffff ; =9223372036854775807
 239e9f0: 9a88b3e8     	csel	x8, xzr, x8, lt
 239e9f4: 1e616801     	fmaxnm	d1, d0, d1
 239e9f8: 9e780029     	fcvtzs	x9, d1
 239e9fc: 92f7840a     	mov	x10, #0x43dfffffffffffff ; =4890909195324358655
 239ea00: 9e670141     	fmov	d1, x10
 239ea04: 1e612000     	fcmp	d0, d1
 239ea08: 9a889128     	csel	x8, x9, x8, ls
 239ea0c: f9400669     	ldr	x9, [x19, #0x8]
 239ea10: eb09011f     	cmp	x8, x9
 239ea14: 9a89c108     	csel	x8, x8, x9, gt
 239ea18: f9001a68     	str	x8, [x19, #0x30]
 239ea1c: 39404268     	ldrb	w8, [x19, #0x10]
 239ea20: 35000148     	cbnz	w8, 0x239ea48 <_ChromeMain+0x23997ac>
 239ea24: aa1303e0     	mov	x0, x19
 239ea28: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 239ea2c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 239ea30: 6cc323e9     	ldp	d9, d8, [sp], #0x30
 239ea34: 14000030     	b	0x239eaf4 <_ChromeMain+0x2399858>
 239ea38: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 239ea3c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 239ea40: 6cc323e9     	ldp	d9, d8, [sp], #0x30
