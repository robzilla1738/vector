
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463d8d0: d101c3ff     	sub	sp, sp, #0x70
 463d8d4: a90267fa     	stp	x26, x25, [sp, #0x20]
 463d8d8: a9035ff8     	stp	x24, x23, [sp, #0x30]
 463d8dc: a90457f6     	stp	x22, x21, [sp, #0x40]
 463d8e0: a9054ff4     	stp	x20, x19, [sp, #0x50]
 463d8e4: a9067bfd     	stp	x29, x30, [sp, #0x60]
 463d8e8: 910183fd     	add	x29, sp, #0x60
 463d8ec: f942e413     	ldr	x19, [x0, #0x5c8]
 463d8f0: b4000a33     	cbz	x19, 0x463da34 <_ChromeMain+0x4638798>
 463d8f4: aa0003f6     	mov	x22, x0
 463d8f8: a9007fff     	stp	xzr, xzr, [sp]
 463d8fc: f9000bff     	str	xzr, [sp, #0x10]
 463d900: f948d001     	ldr	x1, [x0, #0x11a0]
 463d904: f948d403     	ldr	x3, [x0, #0x11a8]
 463d908: 52801708     	mov	w8, #0xb8               ; =184
 463d90c: 9b080462     	madd	x2, x3, x8, x1
 463d910: 910003f4     	mov	x20, sp
 463d914: 910003e0     	mov	x0, sp
 463d918: 9400dfd3     	bl	0x4675864 <_ChromeMain+0x46705c8>
 463d91c: 910003e1     	mov	x1, sp
 463d920: aa1303e0     	mov	x0, x19
 463d924: 97fffe7c     	bl	0x463d314 <_ChromeMain+0x4638078>
 463d928: f9000ff4     	str	x20, [sp, #0x18]
 463d92c: 910063e0     	add	x0, sp, #0x18
 463d930: 9400c1f8     	bl	0x466e110 <_ChromeMain+0x4668e74>
 463d934: 52823d28     	mov	w8, #0x11e9             ; =4585
 463d938: 8b0802d4     	add	x20, x22, x8
 463d93c: 925e7697     	and	x23, x20, #0xfffffffc00000000
 463d940: b0052bb8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463d944: f9404708     	ldr	x8, [x24, #0x88]
 463d948: eb0802ff     	cmp	x23, x8
 463d94c: 54000061     	b.ne	0x463d958 <_ChromeMain+0x46386bc>
 463d950: aa1403e0     	mov	x0, x20
 463d954: 96e75a6a     	bl	0x142fc <_ChromeMain+0xf060>
 463d958: 39400299     	ldrb	w25, [x20]
 463d95c: 52800035     	mov	w21, #0x1               ; =1
 463d960: 39000295     	strb	w21, [x20]
 463d964: aa1603e0     	mov	x0, x22
 463d968: 97ffba56     	bl	0x462c2c0 <_ChromeMain+0x4627024>
 463d96c: f9422ec8     	ldr	x8, [x22, #0x458]
 463d970: b4000208     	cbz	x8, 0x463d9b0 <_ChromeMain+0x4638714>
 463d974: f9429d08     	ldr	x8, [x8, #0x538]
 463d978: f9403500     	ldr	x0, [x8, #0x68]
 463d97c: b40001a0     	cbz	x0, 0x463d9b0 <_ChromeMain+0x4638714>
 463d980: f9400008     	ldr	x8, [x0]
 463d984: f940a508     	ldr	x8, [x8, #0x148]
 463d988: d63f0100     	blr	x8
 463d98c: f9400008     	ldr	x8, [x0]
 463d990: f940b508     	ldr	x8, [x8, #0x168]
 463d994: d63f0100     	blr	x8
 463d998: b40000c0     	cbz	x0, 0x463d9b0 <_ChromeMain+0x4638714>
 463d99c: b0044561     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 463d9a0: 91187021     	add	x1, x1, #0x61c
 463d9a4: 52800542     	mov	w2, #0x2a               ; =42
 463d9a8: 96f322d6     	bl	0x306500 <_ChromeMain+0x301264>
 463d9ac: aa0003f5     	mov	x21, x0
 463d9b0: 394f0268     	ldrb	w8, [x19, #0x3c0]
 463d9b4: 350004e8     	cbnz	w8, 0x463da50 <_ChromeMain+0x46387b4>
 463d9b8: 3910e275     	strb	w21, [x19, #0x438]
 463d9bc: f9418a68     	ldr	x8, [x19, #0x310]
 463d9c0: f9427116     	ldr	x22, [x8, #0x4e0]
 463d9c4: b4000176     	cbz	x22, 0x463d9f0 <_ChromeMain+0x4638754>
 463d9c8: 395042c8     	ldrb	w8, [x22, #0x410]
 463d9cc: 6b15011f     	cmp	w8, w21
 463d9d0: 54000100     	b.eq	0x463d9f0 <_ChromeMain+0x4638754>
 463d9d4: 391042d5     	strb	w21, [x22, #0x410]
 463d9d8: 910e22c0     	add	x0, x22, #0x388
 463d9dc: 520002a1     	eor	w1, w21, #0x1
 463d9e0: 977583e1     	bl	0x239e964 <_ChromeMain+0x23996c8>
 463d9e4: aa1603e0     	mov	x0, x22
 463d9e8: 96fd8de5     	bl	0x5a117c <_ChromeMain+0x59bee0>
 463d9ec: 3950e275     	ldrb	w21, [x19, #0x438]
 463d9f0: 720002bf     	tst	w21, #0x1
 463d9f4: 6f00e400     	movi.2d	v0, #0000000000000000
 463d9f8: 1e6e1001     	fmov	d1, #1.00000000
 463d9fc: 1e601c20     	fcsel	d0, d1, d0, ne
 463da00: 39502268     	ldrb	w8, [x19, #0x408]
 463da04: 350008a8     	cbnz	w8, 0x463db18 <_ChromeMain+0x463887c>
 463da08: fd021260     	str	d0, [x19, #0x420]
 463da0c: 394f0268     	ldrb	w8, [x19, #0x3c0]
 463da10: 35000528     	cbnz	w8, 0x463dab4 <_ChromeMain+0x4638818>
 463da14: aa1303e0     	mov	x0, x19
 463da18: 9400a70a     	bl	0x4667640 <_ChromeMain+0x46623a4>
 463da1c: 39000299     	strb	w25, [x20]
 463da20: f9404708     	ldr	x8, [x24, #0x88]
 463da24: eb0802ff     	cmp	x23, x8
 463da28: 54000061     	b.ne	0x463da34 <_ChromeMain+0x4638798>
 463da2c: aa1403e0     	mov	x0, x20
 463da30: 96e79403     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 463da34: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 463da38: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 463da3c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 463da40: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 463da44: a94267fa     	ldp	x26, x25, [sp, #0x20]
 463da48: 9101c3ff     	add	sp, sp, #0x70
 463da4c: d65f03c0     	ret
