
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427b898: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 427b89c: a90167fa     	stp	x26, x25, [sp, #0x10]
 427b8a0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 427b8a4: a90357f6     	stp	x22, x21, [sp, #0x30]
 427b8a8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 427b8ac: a9057bfd     	stp	x29, x30, [sp, #0x50]
 427b8b0: 910143fd     	add	x29, sp, #0x50
 427b8b4: d106c3ff     	sub	sp, sp, #0x1b0
 427b8b8: aa0003f3     	mov	x19, x0
 427b8bc: 910283f7     	add	x23, sp, #0xa0
 427b8c0: b004ed68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 427b8c4: f940f908     	ldr	x8, [x8, #0x1f0]
 427b8c8: f9400108     	ldr	x8, [x8]
 427b8cc: f81a83a8     	stur	x8, [x29, #-0x58]
 427b8d0: f9406808     	ldr	x8, [x0, #0xd0]
 427b8d4: b4000f28     	cbz	x8, 0x427bab8 <_ChromeMain+0x427681c>
 427b8d8: aa0103f4     	mov	x20, x1
 427b8dc: f9007bff     	str	xzr, [sp, #0xf0]
 427b8e0: 6f00e400     	movi.2d	v0, #0000000000000000
 427b8e4: ad0182e0     	stp	q0, q0, [x23, #0x30]
 427b8e8: ad0082e0     	stp	q0, q0, [x23, #0x10]
 427b8ec: 3d8002e0     	str	q0, [x23]
 427b8f0: a9402035     	ldp	x21, x8, [x1]
 427b8f4: 8b080909     	add	x9, x8, x8, lsl #2
 427b8f8: d37ced38     	lsl	x24, x9, #4
 427b8fc: b4000478     	cbz	x24, 0x427b988 <_ChromeMain+0x42766ec>
 427b900: 39432269     	ldrb	w9, [x19, #0xc8]
 427b904: 34000449     	cbz	w9, 0x427b98c <_ChromeMain+0x42766f0>
 427b908: 9102c279     	add	x25, x19, #0xb0
 427b90c: 39431e68     	ldrb	w8, [x19, #0xc7]
 427b910: 13001d1a     	sxtb	w26, w8
 427b914: f9405e69     	ldr	x9, [x19, #0xb8]
 427b918: 7100035f     	cmp	w26, #0x0
 427b91c: 9a884136     	csel	x22, x9, x8, mi
 427b920: 14000004     	b	0x427b930 <_ChromeMain+0x4276694>
 427b924: 910142b5     	add	x21, x21, #0x50
 427b928: f1014318     	subs	x24, x24, #0x50
 427b92c: 54001c20     	b.eq	0x427bcb0 <_ChromeMain+0x4276a14>
 427b930: 39407ea9     	ldrb	w9, [x21, #0x1f]
 427b934: 13001d28     	sxtb	w8, w9
 427b938: f9400aaa     	ldr	x10, [x21, #0x10]
 427b93c: 7100011f     	cmp	w8, #0x0
 427b940: 9a894149     	csel	x9, x10, x9, mi
 427b944: eb16013f     	cmp	x9, x22
 427b948: 54fffee1     	b.ne	0x427b924 <_ChromeMain+0x4276688>
 427b94c: aa1503e9     	mov	x9, x21
 427b950: f8408d2a     	ldr	x10, [x9, #0x8]!
 427b954: 7100011f     	cmp	w8, #0x0
 427b958: 9a894140     	csel	x0, x10, x9, mi
 427b95c: f9400328     	ldr	x8, [x25]
 427b960: 7100035f     	cmp	w26, #0x0
 427b964: 9a994101     	csel	x1, x8, x25, mi
 427b968: aa1603e2     	mov	x2, x22
 427b96c: 94f637bd     	bl	0x8009860 <_ChromeMain+0x80045c4>
 427b970: 34000120     	cbz	w0, 0x427b994 <_ChromeMain+0x42766f8>
 427b974: 17ffffec     	b	0x427b924 <_ChromeMain+0x4276688>
 427b978: 528000e8     	mov	w8, #0x7                ; =7
 427b97c: f9003268     	str	x8, [x19, #0x60]
 427b980: f9402e68     	ldr	x8, [x19, #0x58]
 427b984: 1400000e     	b	0x427b9bc <_ChromeMain+0x4276720>
 427b988: 39432269     	ldrb	w9, [x19, #0xc8]
 427b98c: b4001928     	cbz	x8, 0x427bcb0 <_ChromeMain+0x4276a14>
 427b990: 37001909     	tbnz	w9, #0x0, 0x427bcb0 <_ChromeMain+0x4276a14>
 427b994: 910283e0     	add	x0, sp, #0xa0
 427b998: aa1503e1     	mov	x1, x21
 427b99c: 97ff494b     	bl	0x424dec8 <_ChromeMain+0x4248c2c>
 427b9a0: 52800028     	mov	w8, #0x1                ; =1
 427b9a4: 3903c3e8     	strb	w8, [sp, #0xf0]
 427b9a8: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427b9ac: 37fffe68     	tbnz	w8, #0x1f, 0x427b978 <_ChromeMain+0x42766dc>
 427b9b0: 91016268     	add	x8, x19, #0x58
 427b9b4: 528000e9     	mov	w9, #0x7                ; =7
 427b9b8: 3901be69     	strb	w9, [x19, #0x6f]
 427b9bc: 528d2dc9     	mov	w9, #0x696e             ; =26990
 427b9c0: 72acedc9     	movk	w9, #0x676e, lsl #16
 427b9c4: b8003109     	stur	w9, [x8, #0x3]
 427b9c8: 528eae49     	mov	w9, #0x7572             ; =30066
 427b9cc: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 427b9d0: b9000109     	str	w9, [x8]
 427b9d4: 39001d1f     	strb	wzr, [x8, #0x7]
 427b9d8: b201e7e8     	mov	x8, #-0x6666666666666667 ; =-7378697629483820647
 427b9dc: f2933348     	movk	x8, #0x999a
 427b9e0: f2e7f728     	movk	x8, #0x3fb9, lsl #48
 427b9e4: f9003a68     	str	x8, [x19, #0x70]
 427b9e8: aa1303e0     	mov	x0, x19
 427b9ec: 97fff7b6     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427b9f0: 52801200     	mov	w0, #0x90               ; =144
 427b9f4: 96f64e5d     	bl	0xf368 <_ChromeMain+0xa0cc>
 427b9f8: f9406a61     	ldr	x1, [x19, #0xd0]
 427b9fc: 39436262     	ldrb	w2, [x19, #0xd8]
 427ba00: 97ff5d30     	bl	0x4252ec0 <_ChromeMain+0x424dc24>
 427ba04: f9407274     	ldr	x20, [x19, #0xe0]
 427ba08: f9007260     	str	x0, [x19, #0xe0]
 427ba0c: b40000d4     	cbz	x20, 0x427ba24 <_ChromeMain+0x4276788>
 427ba10: aa1403e0     	mov	x0, x20
 427ba14: 97ff5d5c     	bl	0x4252f84 <_ChromeMain+0x424dce8>
 427ba18: 52801201     	mov	w1, #0x90               ; =144
 427ba1c: 96f63527     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ba20: f9407260     	ldr	x0, [x19, #0xe0]
 427ba24: 39004c1f     	strb	wzr, [x0, #0x13]
 427ba28: 3943c3e8     	ldrb	w8, [sp, #0xf0]
 427ba2c: 360034a8     	tbz	w8, #0x0, 0x427c0c0 <_ChromeMain+0x4276e24>
 427ba30: a94e5674     	ldp	x20, x21, [x19, #0xe0]
 427ba34: b40000d5     	cbz	x21, 0x427ba4c <_ChromeMain+0x42767b0>
 427ba38: 52800028     	mov	w8, #0x1                ; =1
 427ba3c: b82802a8     	ldadd	w8, w8, [x21]
 427ba40: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 427ba44: 6b09011f     	cmp	w8, w9
 427ba48: 54003400     	b.eq	0x427c0c8 <_ChromeMain+0x4276e2c>
 427ba4c: f9407a73     	ldr	x19, [x19, #0xf0]
 427ba50: 52800800     	mov	w0, #0x40               ; =64
 427ba54: 96f64e45     	bl	0xf368 <_ChromeMain+0xa0cc>
 427ba58: aa0003e3     	mov	x3, x0
 427ba5c: 52800028     	mov	w8, #0x1                ; =1
 427ba60: 90ffe7a9     	adrp	x9, 0x3f6f000 <_ChromeMain+0x3f69d64>
 427ba64: 91018129     	add	x9, x9, #0x60
 427ba68: f0ffe90a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 427ba6c: 9111014a     	add	x10, x10, #0x440
 427ba70: b9000008     	str	w8, [x0]
 427ba74: f0ffef68     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 427ba78: 910a0108     	add	x8, x8, #0x280
 427ba7c: 100057ab     	adr	x11, 0x427c570 <_ChromeMain+0x42772d4>
 427ba80: d503201f     	nop
 427ba84: a900a809     	stp	x9, x10, [x0, #0x8]
 427ba88: a901ac08     	stp	x8, x11, [x0, #0x18]
 427ba8c: a902d41f     	stp	xzr, x21, [x0, #0x28]
 427ba90: f9001c13     	str	x19, [x0, #0x38]
 427ba94: 910283e1     	add	x1, sp, #0xa0
 427ba98: aa1403e0     	mov	x0, x20
 427ba9c: 52800022     	mov	w2, #0x1                ; =1
 427baa0: 97ff5d88     	bl	0x42530c0 <_ChromeMain+0x424de24>
 427baa4: 3943c3e8     	ldrb	w8, [sp, #0xf0]
 427baa8: 36000948     	tbz	w8, #0x0, 0x427bbd0 <_ChromeMain+0x4276934>
 427baac: 910283e0     	add	x0, sp, #0xa0
