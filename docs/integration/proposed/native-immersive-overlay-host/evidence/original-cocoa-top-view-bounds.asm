
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 9c2a180: 6dbb2beb     	stp	d11, d10, [sp, #-0x50]!
 9c2a184: 6d0123e9     	stp	d9, d8, [sp, #0x10]
 9c2a188: a90257f6     	stp	x22, x21, [sp, #0x20]
 9c2a18c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 9c2a190: a9047bfd     	stp	x29, x30, [sp, #0x40]
 9c2a194: 910103fd     	add	x29, sp, #0x40
 9c2a198: aa0003f3     	mov	x19, x0
 9c2a19c: aa0103e0     	mov	x0, x1
 9c2a1a0: 969b2c43     	bl	0x42f52ac <_ChromeMain+0x42f0010>
 9c2a1a4: 4ea31c68     	mov.16b	v8, v3
 9c2a1a8: f9402a60     	ldr	x0, [x19, #0x50]
 9c2a1ac: 94be6315     	bl	0xcbc2e00 <dyld_stub_binder+0xcbc2e00>
 9c2a1b0: 94be2d76     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 9c2a1b4: aa0003f4     	mov	x20, x0
 9c2a1b8: 94be5082     	bl	0xcbbe3c0 <dyld_stub_binder+0xcbbe3c0>
 9c2a1bc: 94be2d73     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 9c2a1c0: aa0003f5     	mov	x21, x0
 9c2a1c4: 94be424f     	bl	0xcbbab00 <dyld_stub_binder+0xcbbab00>
 9c2a1c8: 4ea21c49     	mov.16b	v9, v2
 9c2a1cc: 4ea31c6a     	mov.16b	v10, v3
 9c2a1d0: aa1503e0     	mov	x0, x21
 9c2a1d4: 94be2c9e     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 9c2a1d8: 1e6a2100     	fcmp	d8, d10
 9c2a1dc: 540000a0     	b.eq	0x9c2a1f0 <_ChromeMain+0x9c24f54>
 9c2a1e0: aa1403e0     	mov	x0, x20
 9c2a1e4: 4ea91d20     	mov.16b	v0, v9
 9c2a1e8: 4ea81d01     	mov.16b	v1, v8
 9c2a1ec: 94be8a5d     	bl	0xcbccb60 <dyld_stub_binder+0xcbccb60>
 9c2a1f0: 3940c268     	ldrb	w8, [x19, #0x30]
 9c2a1f4: 340001e8     	cbz	w8, 0x9c2a230 <_ChromeMain+0x9c24f94>
 9c2a1f8: 3940b268     	ldrb	w8, [x19, #0x2c]
 9c2a1fc: b9402a69     	ldr	w9, [x19, #0x28]
 9c2a200: 7100053f     	cmp	w9, #0x1
 9c2a204: 1a8813ea     	csel	w10, wzr, w8, ne
 9c2a208: 370000ea     	tbnz	w10, #0x0, 0x9c2a224 <_ChromeMain+0x9c24f88>
 9c2a20c: 7100093f     	cmp	w9, #0x2
 9c2a210: 1a8813e8     	csel	w8, wzr, w8, ne
 9c2a214: 340000e8     	cbz	w8, 0x9c2a230 <_ChromeMain+0x9c24f94>
 9c2a218: b9401e68     	ldr	w8, [x19, #0x1c]
 9c2a21c: 7100051f     	cmp	w8, #0x1
 9c2a220: 5400008b     	b.lt	0x9c2a230 <_ChromeMain+0x9c24f94>
 9c2a224: f9402a60     	ldr	x0, [x19, #0x50]
 9c2a228: 52800022     	mov	w2, #0x1                ; =1
 9c2a22c: 94be8b9d     	bl	0xcbcd0a0 <dyld_stub_binder+0xcbcd0a0>
 9c2a230: f9400268     	ldr	x8, [x19]
 9c2a234: f9404d08     	ldr	x8, [x8, #0x98]
 9c2a238: aa1303e0     	mov	x0, x19
 9c2a23c: d63f0100     	blr	x8
 9c2a240: aa1403e0     	mov	x0, x20
 9c2a244: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 9c2a248: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 9c2a24c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 9c2a250: 6d4123e9     	ldp	d9, d8, [sp, #0x10]
 9c2a254: 6cc52beb     	ldp	d11, d10, [sp], #0x50
 9c2a258: 14be2c7d     	b	0xcbb544c <dyld_stub_binder+0xcbb544c>
