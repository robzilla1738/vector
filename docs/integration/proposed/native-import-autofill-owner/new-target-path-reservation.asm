
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4253728: 14000052     	b	0x4253870 <_ChromeMain+0x424e5d4>
 425372c: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253730: 9103c3e0     	add	x0, sp, #0xf0
 4253734: 970954e0     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4253738: 14000042     	b	0x4253840 <_ChromeMain+0x424e5a4>
 425373c: aa0003f7     	mov	x23, x0
 4253740: 975f3134     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4253744: aa0003f6     	mov	x22, x0
 4253748: 9103c3e8     	add	x8, sp, #0xf0
 425374c: aa1703e0     	mov	x0, x23
 4253750: 94e1cff8     	bl	0x7ac7730 <_ChromeMain+0x7ac2494>
 4253754: 91008278     	add	x24, x19, #0x20
 4253758: 39c0de68     	ldrsb	w8, [x19, #0x37]
 425375c: 37f81be8     	tbnz	w8, #0x1f, 0x4253ad8 <_ChromeMain+0x424e83c>
 4253760: 3dc03fe0     	ldr	q0, [sp, #0xf0]
 4253764: 3d800300     	str	q0, [x24]
 4253768: f94083e8     	ldr	x8, [sp, #0x100]
 425376c: f9000b08     	str	x8, [x24, #0x10]
 4253770: b9401a60     	ldr	w0, [x19, #0x18]
 4253774: a90fffff     	stp	xzr, xzr, [sp, #0xf8]
 4253778: f9007bff     	str	xzr, [sp, #0xf0]
 425377c: 9103c3fa     	add	x26, sp, #0xf0
 4253780: 9103c3e8     	add	x8, sp, #0xf0
 4253784: 940031c3     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 4253788: f004e921     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 425378c: 91130021     	add	x1, x1, #0x4c0
 4253790: 9103c3e0     	add	x0, sp, #0xf0
 4253794: 52800062     	mov	w2, #0x3                ; =3
 4253798: 97270b14     	bl	0xc163e8 <_ChromeMain+0xc1114c>
 425379c: aa1503e8     	mov	x8, x21
 42537a0: f8420d09     	ldr	x9, [x8, #0x20]!
 42537a4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 42537a8: f100015f     	cmp	x10, #0x0
 42537ac: 9a884121     	csel	x1, x9, x8, mi
 42537b0: f9400508     	ldr	x8, [x8, #0x8]
