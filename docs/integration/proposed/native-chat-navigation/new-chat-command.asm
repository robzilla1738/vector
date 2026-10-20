
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4562b1c: f9401e75     	ldr	x21, [x19, #0x38]
 4562b20: b4ff5b75     	cbz	x21, 0x456168c <_ChromeMain+0x455c3f0>
 4562b24: f94036a0     	ldr	x0, [x21, #0x68]
 4562b28: 971a6dbc     	bl	0xbfe218 <_ChromeMain+0xbf8f7c>
 4562b2c: 34ff5b00     	cbz	w0, 0x456168c <_ChromeMain+0x455c3f0>
 4562b30: f94036b3     	ldr	x19, [x21, #0x68]
 4562b34: b4000353     	cbz	x19, 0x4562b9c <_ChromeMain+0x455d900>
 4562b38: 39412268     	ldrb	w8, [x19, #0x48]
 4562b3c: 37000308     	tbnz	w8, #0x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b40: f9400268     	ldr	x8, [x19]
 4562b44: f940b508     	ldr	x8, [x8, #0x168]
 4562b48: aa1303e0     	mov	x0, x19
 4562b4c: d63f0100     	blr	x8
 4562b50: b4000260     	cbz	x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b54: aa0003f4     	mov	x20, x0
 4562b58: d0044bc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4562b5c: 91018021     	add	x1, x1, #0x60
 4562b60: 52800202     	mov	w2, #0x10               ; =16
 4562b64: 96fd683a     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 4562b68: b40001a0     	cbz	x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b6c: d0044bc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4562b70: 91018021     	add	x1, x1, #0x60
 4562b74: aa1403e0     	mov	x0, x20
 4562b78: 52800202     	mov	w2, #0x10               ; =16
 4562b7c: 96f56fab     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 4562b80: 3100041f     	cmn	w0, #0x1
 4562b84: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 4562b88: 9a9fc109     	csel	x9, x8, xzr, gt
 4562b8c: 37f80080     	tbnz	w0, #0x1f, 0x4562b9c <_ChromeMain+0x455d900>
 4562b90: 0aa07c0a     	bic	w10, w0, w0, asr #31
 4562b94: aa0a0120     	orr	x0, x9, x10
 4562b98: 14000004     	b	0x4562ba8 <_ChromeMain+0x455d90c>
 4562b9c: aa1303e0     	mov	x0, x19
 4562ba0: 97ee8288     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 4562ba4: 92600008     	and	x8, x0, #0x100000000
 4562ba8: 2a0003e9     	mov	w9, w0
 4562bac: f81c03bf     	stur	xzr, [x29, #-0x40]
 4562bb0: aa090108     	orr	x8, x8, x9
 4562bb4: 6f00e400     	movi.2d	v0, #0000000000000000
 4562bb8: ad3d03a0     	stp	q0, q0, [x29, #-0x60]
 4562bbc: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 4562bc0: eb09011f     	cmp	x8, x9
 4562bc4: 9a898102     	csel	x2, x8, x9, hi
 4562bc8: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 4562bcc: ad3b03a0     	stp	q0, q0, [x29, #-0xa0]
 4562bd0: 3c9503a0     	stur	q0, [x29, #-0xb0]
 4562bd4: f0048be0     	adrp	x0, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4562bd8: 91322000     	add	x0, x0, #0xc88
 4562bdc: f0048be3     	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4562be0: 91324863     	add	x3, x3, #0xc92
 4562be4: d102c3a8     	sub	x8, x29, #0xb0
 4562be8: 52800121     	mov	w1, #0x9                ; =9
 4562bec: 52800144     	mov	w4, #0xa                ; =10
 4562bf0: 94000944     	bl	0x4565100 <_ChromeMain+0x455fe64>
 4562bf4: 385683a8     	ldurb	w8, [x29, #-0x98]
 4562bf8: 340005e8     	cbz	w8, 0x4562cb4 <_ChromeMain+0x455da18>
 4562bfc: f94046b6     	ldr	x22, [x21, #0x88]
 4562c00: b40005b6     	cbz	x22, 0x4562cb4 <_ChromeMain+0x455da18>
 4562c04: f9404ac1     	ldr	x1, [x22, #0x90]
 4562c08: b40002a1     	cbz	x1, 0x4562c5c <_ChromeMain+0x455d9c0>
 4562c0c: f94002c0     	ldr	x0, [x22]
 4562c10: 96f89e47     	bl	0x38a52c <_ChromeMain+0x385290>
 4562c14: aa0003f3     	mov	x19, x0
 4562c18: 3100067f     	cmn	w19, #0x1
 4562c1c: 1a9f07e8     	cset	w8, ne
 4562c20: 6a08003f     	tst	w1, w8
 4562c24: 540001c0     	b.eq	0x4562c5c <_ChromeMain+0x455d9c0>
 4562c28: 37f8d6d3     	tbnz	w19, #0x1f, 0x4564700 <_ChromeMain+0x455f464>
 4562c2c: f94002c0     	ldr	x0, [x22]
 4562c30: b9401808     	ldr	w8, [x0, #0x18]
 4562c34: 6b08027f     	cmp	w19, w8
 4562c38: 5400d64a     	b.ge	0x4564700 <_ChromeMain+0x455f464>
 4562c3c: 92407a61     	and	x1, x19, #0x7fffffff
 4562c40: 972bedae     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4562c44: f9402000     	ldr	x0, [x0, #0x40]
 4562c48: d102c3a1     	sub	x1, x29, #0xb0
 4562c4c: 940007b2     	bl	0x4564b14 <_ChromeMain+0x455f878>
 4562c50: 34000080     	cbz	w0, 0x4562c60 <_ChromeMain+0x455d9c4>
 4562c54: 12185e76     	and	w22, w19, #0xffffff00
 4562c58: 14000656     	b	0x45645b0 <_ChromeMain+0x455f314>
 4562c5c: 12800013     	mov	w19, #-0x1              ; =-1
 4562c60: f94002c0     	ldr	x0, [x22]
 4562c64: b9401808     	ldr	w8, [x0, #0x18]
 4562c68: 7100051f     	cmp	w8, #0x1
 4562c6c: 5400024b     	b.lt	0x4562cb4 <_ChromeMain+0x455da18>
 4562c70: d2800014     	mov	x20, #0x0               ; =0
 4562c74: 2a1303f3     	mov	w19, w19
 4562c78: 14000006     	b	0x4562c90 <_ChromeMain+0x455d9f4>
 4562c7c: f94002c0     	ldr	x0, [x22]
 4562c80: 91000694     	add	x20, x20, #0x1
 4562c84: b9801808     	ldrsw	x8, [x0, #0x18]
 4562c88: eb08029f     	cmp	x20, x8
 4562c8c: 5400014a     	b.ge	0x4562cb4 <_ChromeMain+0x455da18>
 4562c90: eb14027f     	cmp	x19, x20
 4562c94: 54ffff60     	b.eq	0x4562c80 <_ChromeMain+0x455d9e4>
 4562c98: aa1403e1     	mov	x1, x20
 4562c9c: 972bed97     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4562ca0: f9402000     	ldr	x0, [x0, #0x40]
 4562ca4: d102c3a1     	sub	x1, x29, #0xb0
 4562ca8: 9400079b     	bl	0x4564b14 <_ChromeMain+0x455f878>
 4562cac: 3700c7e0     	tbnz	w0, #0x0, 0x45645a8 <_ChromeMain+0x455f30c>
 4562cb0: 17fffff3     	b	0x4562c7c <_ChromeMain+0x455d9e0>
 4562cb4: 910103e0     	add	x0, sp, #0x40
 4562cb8: 5280a001     	mov	w1, #0x500              ; =1280
 4562cbc: 94ea9ad5     	bl	0x8009810 <_ChromeMain+0x8004574>
 4562cc0: 910103e0     	add	x0, sp, #0x40
 4562cc4: 9100a2a1     	add	x1, x21, #0x28
 4562cc8: d102c3a2     	sub	x2, x29, #0xb0
 4562ccc: 52800003     	mov	w3, #0x0                ; =0
 4562cd0: 97b1a683     	bl	0x31cc6dc <_ChromeMain+0x31c7440>
 4562cd4: 52800068     	mov	w8, #0x3                ; =3
 4562cd8: b902b3e8     	str	w8, [sp, #0x2b0]
 4562cdc: f94046a8     	ldr	x8, [x21, #0x88]
 4562ce0: f9404908     	ldr	x8, [x8, #0x90]
 4562ce4: b40005a8     	cbz	x8, 0x4562d98 <_ChromeMain+0x455dafc>
 4562ce8: f9402113     	ldr	x19, [x8, #0x40]
 4562cec: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4562cf0: 90053294     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4562cf4: f9404689     	ldr	x9, [x20, #0x88]
 4562cf8: eb09011f     	cmp	x8, x9
 4562cfc: 54000061     	b.ne	0x4562d08 <_ChromeMain+0x455da6c>
 4562d00: aa1303e0     	mov	x0, x19
 4562d04: 96eac57e     	bl	0x142fc <_ChromeMain+0xf060>
 4562d08: f94157e0     	ldr	x0, [sp, #0x2a8]
 4562d0c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4562d10: f9404689     	ldr	x9, [x20, #0x88]
 4562d14: eb09011f     	cmp	x8, x9
 4562d18: 54000041     	b.ne	0x4562d20 <_ChromeMain+0x455da84>
 4562d1c: 96eb0f4a     	bl	0x26a44 <_ChromeMain+0x217a8>
 4562d20: f90157f3     	str	x19, [sp, #0x2a8]
 4562d24: 52800028     	mov	w8, #0x1                ; =1
 4562d28: b9030be8     	str	w8, [sp, #0x308]
 4562d2c: 910103e0     	add	x0, sp, #0x40
 4562d30: 94001bf0     	bl	0x4569cf0 <_ChromeMain+0x4564a54>
 4562d34: 381cf3bf     	sturb	wzr, [x29, #-0x31]
 4562d38: 910103e0     	add	x0, sp, #0x40
 4562d3c: d100c7a1     	sub	x1, x29, #0x31
 4562d40: 97c58800     	bl	0x36c4d40 <_ChromeMain+0x36bfaa4>
 4562d44: b50001c0     	cbnz	x0, 0x4562d7c <_ChromeMain+0x455dae0>
 4562d48: 910103e0     	add	x0, sp, #0x40
 4562d4c: 97b1a6bb     	bl	0x31cc838 <_ChromeMain+0x31c759c>
 4562d50: d102c3b3     	sub	x19, x29, #0xb0
 4562d54: 9101c260     	add	x0, x19, #0x70
 4562d58: d2800001     	mov	x1, #0x0                ; =0
 4562d5c: 96eb13d7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4562d60: 91008260     	add	x0, x19, #0x20
 4562d64: 96eb13c5     	bl	0x27c78 <_ChromeMain+0x229dc>
 4562d68: 38d673a8     	ldursb	w8, [x29, #-0x99]
 4562d6c: 36ff4908     	tbz	w8, #0x1f, 0x456168c <_ChromeMain+0x455c3f0>
 4562d70: f85503a0     	ldur	x0, [x29, #-0xb0]
 4562d74: f85603a8     	ldur	x8, [x29, #-0xa0]
 4562d78: 14000087     	b	0x4562f94 <_ChromeMain+0x455dcf8>
 4562d7c: 12800008     	mov	w8, #-0x1               ; =-1
 4562d80: b8e80008     	ldaddal	w8, w8, [x0]
 4562d84: 7100051f     	cmp	w8, #0x1
 4562d88: 54fffe01     	b.ne	0x4562d48 <_ChromeMain+0x455daac>
 4562d8c: 52800101     	mov	w1, #0x8                ; =8
 4562d90: 96ea984a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4562d94: 17ffffed     	b	0x4562d48 <_ChromeMain+0x455daac>
 4562d98: d2800013     	mov	x19, #0x0               ; =0
 4562d9c: 17ffffd4     	b	0x4562cec <_ChromeMain+0x455da50>
