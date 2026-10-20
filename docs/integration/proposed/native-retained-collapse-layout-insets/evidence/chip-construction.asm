
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f8edc: 4f0004c0     	movi.4s	v0, #0x6
 41f8ee0: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8ee4: 5280003b     	mov	w27, #0x1               ; =1
 41f8ee8: 381803bb     	sturb	w27, [x29, #-0x80]
 41f8eec: d10243a1     	sub	x1, x29, #0x90
 41f8ef0: aa1a03e0     	mov	x0, x26
 41f8ef4: 977d4c7f     	bl	0x214c0f0 <_ChromeMain+0x2146e54>
 41f8ef8: 395a8348     	ldrb	w8, [x26, #0x6a0]
 41f8efc: 34000088     	cbz	w8, 0x41f8f0c <_ChromeMain+0x41f3c70>
 41f8f00: b9469f48     	ldr	w8, [x26, #0x69c]
 41f8f04: 7100211f     	cmp	w8, #0x8
 41f8f08: 54000100     	b.eq	0x41f8f28 <_ChromeMain+0x41f3c8c>
 41f8f0c: 52800108     	mov	w8, #0x8                ; =8
 41f8f10: b9069f48     	str	w8, [x26, #0x69c]
 41f8f14: 391a835b     	strb	w27, [x26, #0x6a0]
 41f8f18: f9400348     	ldr	x8, [x26]
 41f8f1c: f9427d08     	ldr	x8, [x8, #0x4f8]
 41f8f20: aa1a03e0     	mov	x0, x26
 41f8f24: d63f0100     	blr	x8
 41f8f28: d2c00048     	mov	x8, #0x200000000        ; =8589934592
 41f8f2c: 4e080d00     	dup.2d	v0, x8
 41f8f30: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8f34: b0054061     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41f8f38: 91122021     	add	x1, x1, #0x488
 41f8f3c: d10243a2     	sub	x2, x29, #0x90
 41f8f40: aa1503e0     	mov	x0, x21
 41f8f44: 9763d3c7     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 41f8f48: d10012c1     	sub	x1, x22, #0x4
 41f8f4c: aa1a03e0     	mov	x0, x26
 41f8f50: 97ffe094     	bl	0x41f11a0 <_ChromeMain+0x41ebf04>
 41f8f54: 4f000500     	movi.4s	v0, #0x8
 41f8f58: 3c9703a0     	stur	q0, [x29, #-0x90]
 41f8f5c: 52800028     	mov	w8, #0x1                ; =1
 41f8f60: 381803a8     	sturb	w8, [x29, #-0x80]
 41f8f64: d10243a1     	sub	x1, x29, #0x90
 41f8f68: aa1a03e0     	mov	x0, x26
 41f8f6c: 977d4c61     	bl	0x214c0f0 <_ChromeMain+0x2146e54>
 41f8f70: b21b03f5     	mov	x21, #0x2000000020      ; =137438953504
 41f8f74: aa1a03e0     	mov	x0, x26
 41f8f78: b21b03e1     	mov	x1, #0x2000000020       ; =137438953504
 41f8f7c: 52800022     	mov	w2, #0x1                ; =1
 41f8f80: 979762b8     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 41f8f84: 91177348     	add	x8, x26, #0x5dc
 41f8f88: f9400109     	ldr	x9, [x8]
 41f8f8c: eb15013f     	cmp	x9, x21
 41f8f90: 54000100     	b.eq	0x41f8fb0 <_ChromeMain+0x41f3d14>
 41f8f94: f9000115     	str	x21, [x8]
 41f8f98: aa1a03e0     	mov	x0, x26
 41f8f9c: 52800061     	mov	w1, #0x3                ; =3
 41f8fa0: 9717a271     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 41f8fa4: 91177341     	add	x1, x26, #0x5dc
 41f8fa8: aa1403e0     	mov	x0, x20
 41f8fac: 9734bc09     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 41f8fb0: 910243e1     	add	x1, sp, #0x90
 41f8fb4: aa1a03e0     	mov	x0, x26
 41f8fb8: 95920a92     	bl	0xa67ba00 <_ChromeMain+0xa676764>
