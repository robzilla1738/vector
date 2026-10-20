
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2a5f790: d10203ff     	sub	sp, sp, #0x80
 2a5f794: a90367fa     	stp	x26, x25, [sp, #0x30]
 2a5f798: a9045ff8     	stp	x24, x23, [sp, #0x40]
 2a5f79c: a90557f6     	stp	x22, x21, [sp, #0x50]
 2a5f7a0: a9064ff4     	stp	x20, x19, [sp, #0x60]
 2a5f7a4: a9077bfd     	stp	x29, x30, [sp, #0x70]
 2a5f7a8: 9101c3fd     	add	x29, sp, #0x70
 2a5f7ac: aa0303f3     	mov	x19, x3
 2a5f7b0: aa0203f6     	mov	x22, x2
 2a5f7b4: aa0103f4     	mov	x20, x1
 2a5f7b8: aa0003f5     	mov	x21, x0
 2a5f7bc: 52800308     	mov	w8, #0x18               ; =24
 2a5f7c0: f90003e8     	str	x8, [sp]
 2a5f7c4: d0062557     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 2a5f7c8: 395602e0     	ldrb	w0, [x23, #0x580]
 2a5f7cc: 35000b00     	cbnz	w0, 0x2a5f92c <_ChromeMain+0x2a5a690>
 2a5f7d0: 52800080     	mov	w0, #0x4                ; =4
 2a5f7d4: 9756bee5     	bl	0xf368 <_ChromeMain+0xa0cc>
 2a5f7d8: f9000fe0     	str	x0, [sp, #0x18]
 2a5f7dc: 52800038     	mov	w24, #0x1               ; =1
 2a5f7e0: b9000018     	str	w24, [x0]
 2a5f7e4: 4e080f00     	dup.2d	v0, x24
 2a5f7e8: 3c8203e0     	stur	q0, [sp, #0x20]
 2a5f7ec: 52800219     	mov	w25, #0x10              ; =16
 2a5f7f0: 910003e8     	mov	x8, sp
 2a5f7f4: 52800200     	mov	w0, #0x10               ; =16
 2a5f7f8: 97f59ccb     	bl	0x27c6b24 <_ChromeMain+0x27c1888>
 2a5f7fc: 52800700     	mov	w0, #0x38               ; =56
 2a5f800: 9756beda     	bl	0xf368 <_ChromeMain+0xa0cc>
 2a5f804: aa0003e5     	mov	x5, x0
 2a5f808: b9000018     	str	w24, [x0]
 2a5f80c: d0003aa8     	adrp	x8, 0x31b5000 <_ChromeMain+0x31afd64>
 2a5f810: 91120108     	add	x8, x8, #0x480
 2a5f814: 90008169     	adrp	x9, 0x3a8b000 <_ChromeMain+0x3a85d64>
 2a5f818: 913d3129     	add	x9, x9, #0xf4c
 2a5f81c: a900a408     	stp	x8, x9, [x0, #0x8]
 2a5f820: d0ffd7e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 2a5f824: 912c0108     	add	x8, x8, #0xb00
 2a5f828: d0003aa9     	adrp	x9, 0x31b5000 <_ChromeMain+0x31afd64>
 2a5f82c: 91126129     	add	x9, x9, #0x498
 2a5f830: a901a408     	stp	x8, x9, [x0, #0x18]
 2a5f834: f9001416     	str	x22, [x0, #0x28]
 2a5f838: b9003019     	str	w25, [x0, #0x30]
 2a5f83c: 910063e2     	add	x2, sp, #0x18
 2a5f840: 910003e3     	mov	x3, sp
 2a5f844: aa1503e0     	mov	x0, x21
 2a5f848: aa1403e1     	mov	x1, x20
 2a5f84c: 52800004     	mov	w4, #0x0                ; =0
