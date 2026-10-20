
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
