
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 458d0b4: d10243ff     	sub	sp, sp, #0x90
 458d0b8: a9055ff8     	stp	x24, x23, [sp, #0x50]
 458d0bc: a90657f6     	stp	x22, x21, [sp, #0x60]
 458d0c0: a9074ff4     	stp	x20, x19, [sp, #0x70]
 458d0c4: a9087bfd     	stp	x29, x30, [sp, #0x80]
 458d0c8: 910203fd     	add	x29, sp, #0x80
 458d0cc: aa0203f3     	mov	x19, x2
 458d0d0: aa0103f5     	mov	x21, x1
 458d0d4: aa0003f6     	mov	x22, x0
 458d0d8: f004d4c8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 458d0dc: f940f908     	ldr	x8, [x8, #0x1f0]
 458d0e0: f9400108     	ldr	x8, [x8]
 458d0e4: f81c83a8     	stur	x8, [x29, #-0x38]
 458d0e8: 90053b08     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 458d0ec: f9454d00     	ldr	x0, [x8, #0xa98]
 458d0f0: 951875b2     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 458d0f4: aa0003f4     	mov	x20, x0
 458d0f8: 52800022     	mov	w2, #0x1                ; =1
 458d0fc: 95ef1074     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 458d100: a901d7f6     	stp	x22, x21, [sp, #0x18]
 458d104: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d108: 9114c908     	add	x8, x8, #0x532
 458d10c: 528002a9     	mov	w9, #0x15               ; =21
 458d110: a902a7e8     	stp	x8, x9, [sp, #0x28]
 458d114: 910003f7     	mov	x23, sp
 458d118: 910003e8     	mov	x8, sp
 458d11c: 910063e0     	add	x0, sp, #0x18
 458d120: 52800041     	mov	w1, #0x2                ; =2
 458d124: 9731eb27     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 458d128: 39805fe8     	ldrsb	x8, [sp, #0x17]
 458d12c: a9402be9     	ldp	x9, x10, [sp]
 458d130: f100011f     	cmp	x8, #0x0
 458d134: 9a974120     	csel	x0, x9, x23, mi
 458d138: 7100011f     	cmp	w8, #0x0
 458d13c: 9a884141     	csel	x1, x10, x8, mi
 458d140: 975b7baa     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d144: 94e9d97d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d148: aa0003f7     	mov	x23, x0
 458d14c: aa1403e0     	mov	x0, x20
 458d150: aa1703e2     	mov	x2, x23
 458d154: 95ef1058     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 458d158: aa1703e0     	mov	x0, x23
 458d15c: 94e9d980     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d160: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d164: 36f800a8     	tbz	w8, #0x1f, 0x458d178 <_ChromeMain+0x4587edc>
 458d168: f94003e0     	ldr	x0, [sp]
 458d16c: f9400be8     	ldr	x8, [sp, #0x10]
 458d170: d37ff901     	lsl	x1, x8, #1
 458d174: 96e9ef51     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d178: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d17c: 91157908     	add	x8, x8, #0x55e
 458d180: 52800389     	mov	w9, #0x1c               ; =28
 458d184: a901a7e8     	stp	x8, x9, [sp, #0x18]
 458d188: a902d7f6     	stp	x22, x21, [sp, #0x28]
 458d18c: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d190: 91166108     	add	x8, x8, #0x598
 458d194: 528005e9     	mov	w9, #0x2f               ; =47
 458d198: a903a7e8     	stp	x8, x9, [sp, #0x38]
 458d19c: 910003f5     	mov	x21, sp
 458d1a0: 910003e8     	mov	x8, sp
 458d1a4: 910063e0     	add	x0, sp, #0x18
 458d1a8: 52800061     	mov	w1, #0x3                ; =3
 458d1ac: 9731eb05     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 458d1b0: 39805fe8     	ldrsb	x8, [sp, #0x17]
 458d1b4: a9402be9     	ldp	x9, x10, [sp]
 458d1b8: f100011f     	cmp	x8, #0x0
 458d1bc: 9a954120     	csel	x0, x9, x21, mi
 458d1c0: 7100011f     	cmp	w8, #0x0
 458d1c4: 9a884141     	csel	x1, x10, x8, mi
 458d1c8: 975b7b88     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d1cc: 94e9d95b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d1d0: aa0003f5     	mov	x21, x0
 458d1d4: aa1403e0     	mov	x0, x20
 458d1d8: aa1503e2     	mov	x2, x21
 458d1dc: 95ef1039     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 458d1e0: aa1503e0     	mov	x0, x21
 458d1e4: 94e9d95e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d1e8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d1ec: 36f800a8     	tbz	w8, #0x1f, 0x458d200 <_ChromeMain+0x4587f64>
 458d1f0: f94003e0     	ldr	x0, [sp]
 458d1f4: f9400be8     	ldr	x8, [sp, #0x10]
 458d1f8: d37ff901     	lsl	x1, x8, #1
 458d1fc: 96e9ef2f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d200: b0052d42     	adrp	x2, 0xeb36000 <dyld_stub_binder+0xeb36000>
 458d204: 9123e042     	add	x2, x2, #0x8f8
 458d208: aa1403e0     	mov	x0, x20
 458d20c: 95ef1033     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 458d210: aa1d03fd     	mov	x29, x29
 458d214: 95619e64     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 458d218: b0052d42     	adrp	x2, 0xeb36000 <dyld_stub_binder+0xeb36000>
 458d21c: 91246042     	add	x2, x2, #0x918
 458d220: aa1403e0     	mov	x0, x20
 458d224: 95ef102d     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 458d228: aa1d03fd     	mov	x29, x29
 458d22c: 95619e5e     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 458d230: aa1403e0     	mov	x0, x20
 458d234: 95ef101a     	bl	0xc15129c <_ChromeMain+0xc14c000>
 458d238: f10fa01f     	cmp	x0, #0x3e8
 458d23c: 54000281     	b.ne	0x458d28c <_ChromeMain+0x4587ff0>
 458d240: 52800600     	mov	w0, #0x30               ; =48
 458d244: 96ea0849     	bl	0xf368 <_ChromeMain+0xa0cc>
 458d248: aa0003e2     	mov	x2, x0
 458d24c: 52800028     	mov	w8, #0x1                ; =1
 458d250: b9000008     	str	w8, [x0]
 458d254: d0fef688     	adrp	x8, 0x245f000 <_ChromeMain+0x2459d64>
 458d258: 91050108     	add	x8, x8, #0x140
 458d25c: b0fec509     	adrp	x9, 0x1e2e000 <_ChromeMain+0x1e28d64>
 458d260: 913c0129     	add	x9, x9, #0xf00
 458d264: a900a408     	stp	x8, x9, [x0, #0x8]
 458d268: 90fefe88     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 458d26c: 912c0108     	add	x8, x8, #0xb00
 458d270: 10000409     	adr	x9, 0x458d2f0 <_ChromeMain+0x4588054>
 458d274: d503201f     	nop
 458d278: a901a408     	stp	x8, x9, [x0, #0x18]
 458d27c: aa1303e0     	mov	x0, x19
 458d280: 52800001     	mov	w1, #0x0                ; =0
 458d284: 52800003     	mov	w3, #0x0                ; =0
 458d288: 94d4f615     	bl	0x7acaadc <_ChromeMain+0x7ac5840>
 458d28c: aa1403e0     	mov	x0, x20
 458d290: 94e9d933     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d294: f85c83a8     	ldur	x8, [x29, #-0x38]
 458d298: f004d4c9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 458d29c: f940f929     	ldr	x9, [x9, #0x1f0]
 458d2a0: f9400129     	ldr	x9, [x9]
 458d2a4: eb08013f     	cmp	x9, x8
 458d2a8: 54000221     	b.ne	0x458d2ec <_ChromeMain+0x4588050>
 458d2ac: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 458d2b0: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 458d2b4: a94657f6     	ldp	x22, x21, [sp, #0x60]
 458d2b8: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 458d2bc: 910243ff     	add	sp, sp, #0x90
 458d2c0: d65f03c0     	ret
 458d2c4: 14000001     	b	0x458d2c8 <_ChromeMain+0x458802c>
 458d2c8: aa0003f3     	mov	x19, x0
 458d2cc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d2d0: 36f800a8     	tbz	w8, #0x1f, 0x458d2e4 <_ChromeMain+0x4588048>
 458d2d4: f94003e0     	ldr	x0, [sp]
 458d2d8: f9400be8     	ldr	x8, [sp, #0x10]
 458d2dc: d37ff901     	lsl	x1, x8, #1
 458d2e0: 96e9eef6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d2e4: aa1303e0     	mov	x0, x19
 458d2e8: 94e9d887     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 458d2ec: 94e9dc1d     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 458d2f0: b40001a0     	cbz	x0, 0x458d324 <_ChromeMain+0x4588088>
 458d2f4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 458d2f8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 458d2fc: 910043fd     	add	x29, sp, #0x10
 458d300: f9402013     	ldr	x19, [x0, #0x40]
 458d304: 97a3de51     	bl	0x2e84c48 <_ChromeMain+0x2e7f9ac>
 458d308: aa1303e1     	mov	x1, x19
 458d30c: 52800022     	mov	w2, #0x1                ; =1
 458d310: 96eb16a1     	bl	0x52d94 <_ChromeMain+0x4daf8>
 458d314: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 458d318: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 458d31c: b4000040     	cbz	x0, 0x458d324 <_ChromeMain+0x4588088>
 458d320: 17efbc73     	b	0x417c4ec <_ChromeMain+0x4177250>
 458d324: d65f03c0     	ret
 458d328: d10203ff     	sub	sp, sp, #0x80
 458d32c: a90557f6     	stp	x22, x21, [sp, #0x50]
 458d330: a9064ff4     	stp	x20, x19, [sp, #0x60]
 458d334: a9077bfd     	stp	x29, x30, [sp, #0x70]
 458d338: 9101c3fd     	add	x29, sp, #0x70
 458d33c: aa0103f4     	mov	x20, x1
 458d340: aa0003f5     	mov	x21, x0
 458d344: f004d4c8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 458d348: f940f908     	ldr	x8, [x8, #0x1f0]
 458d34c: f9400108     	ldr	x8, [x8]
 458d350: f81d83a8     	stur	x8, [x29, #-0x28]
 458d354: 90053b08     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 458d358: f9454d00     	ldr	x0, [x8, #0xa98]
 458d35c: 95187517     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 458d360: aa0003f3     	mov	x19, x0
 458d364: 52800022     	mov	w2, #0x1                ; =1
 458d368: 95ef0fd9     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 458d36c: a901d3f5     	stp	x21, x20, [sp, #0x18]
 458d370: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d374: 9117e108     	add	x8, x8, #0x5f8
 458d378: 52800249     	mov	w9, #0x12               ; =18
 458d37c: a902a7e8     	stp	x8, x9, [sp, #0x28]
 458d380: 910003f6     	mov	x22, sp
 458d384: 910003e8     	mov	x8, sp
 458d388: 910063e0     	add	x0, sp, #0x18
 458d38c: 52800041     	mov	w1, #0x2                ; =2
 458d390: 9731ea8c     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 458d394: 39805fe8     	ldrsb	x8, [sp, #0x17]
 458d398: a9402be9     	ldp	x9, x10, [sp]
 458d39c: f100011f     	cmp	x8, #0x0
 458d3a0: 9a964120     	csel	x0, x9, x22, mi
 458d3a4: 7100011f     	cmp	w8, #0x0
 458d3a8: 9a884141     	csel	x1, x10, x8, mi
 458d3ac: 975b7b0f     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d3b0: 94e9d8e2     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d3b4: aa0003f6     	mov	x22, x0
 458d3b8: aa1303e0     	mov	x0, x19
 458d3bc: aa1603e2     	mov	x2, x22
 458d3c0: 95ef0fbd     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 458d3c4: aa1603e0     	mov	x0, x22
 458d3c8: 94e9d8e5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d3cc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d3d0: 36f800a8     	tbz	w8, #0x1f, 0x458d3e4 <_ChromeMain+0x4588148>
 458d3d4: f94003e0     	ldr	x0, [sp]
 458d3d8: f9400be8     	ldr	x8, [sp, #0x10]
 458d3dc: d37ff901     	lsl	x1, x8, #1
 458d3e0: 96e9eeb6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d3e4: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d3e8: 91187908     	add	x8, x8, #0x61e
 458d3ec: 52800389     	mov	w9, #0x1c               ; =28
 458d3f0: a901a7e8     	stp	x8, x9, [sp, #0x18]
 458d3f4: a902d3f5     	stp	x21, x20, [sp, #0x28]
 458d3f8: d004cfc8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 458d3fc: 91196108     	add	x8, x8, #0x658
 458d400: 52800029     	mov	w9, #0x1                ; =1
 458d404: a903a7e8     	stp	x8, x9, [sp, #0x38]
 458d408: 910003f4     	mov	x20, sp
 458d40c: 910003e8     	mov	x8, sp
 458d410: 910063e0     	add	x0, sp, #0x18
 458d414: 52800061     	mov	w1, #0x3                ; =3
 458d418: 9731ea6a     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 458d41c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 458d420: a9402be9     	ldp	x9, x10, [sp]
 458d424: f100011f     	cmp	x8, #0x0
 458d428: 9a944120     	csel	x0, x9, x20, mi
 458d42c: 7100011f     	cmp	w8, #0x0
 458d430: 9a884141     	csel	x1, x10, x8, mi
 458d434: 975b7aed     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d438: 94e9d8c0     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d43c: aa0003f4     	mov	x20, x0
 458d440: aa1303e0     	mov	x0, x19
 458d444: aa1403e2     	mov	x2, x20
 458d448: 95ef0f9e     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 458d44c: aa1403e0     	mov	x0, x20
 458d450: 94e9d8c3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d454: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d458: 36f800a8     	tbz	w8, #0x1f, 0x458d46c <_ChromeMain+0x45881d0>
 458d45c: f94003e0     	ldr	x0, [sp]
 458d460: f9400be8     	ldr	x8, [sp, #0x10]
 458d464: d37ff901     	lsl	x1, x8, #1
 458d468: 96e9ee94     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d46c: b0052d42     	adrp	x2, 0xeb36000 <dyld_stub_binder+0xeb36000>
 458d470: 9124e042     	add	x2, x2, #0x938
 458d474: aa1303e0     	mov	x0, x19
 458d478: 95ef0f98     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 458d47c: aa1d03fd     	mov	x29, x29
 458d480: 95619dc9     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 458d484: aa1303e0     	mov	x0, x19
 458d488: 95ef0f85     	bl	0xc15129c <_ChromeMain+0xc14c000>
 458d48c: aa1303e0     	mov	x0, x19
 458d490: 94e9d8b3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d494: f85d83a8     	ldur	x8, [x29, #-0x28]
 458d498: f004d4c9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 458d49c: f940f929     	ldr	x9, [x9, #0x1f0]
 458d4a0: f9400129     	ldr	x9, [x9]
 458d4a4: eb08013f     	cmp	x9, x8
 458d4a8: 54000201     	b.ne	0x458d4e8 <_ChromeMain+0x458824c>
 458d4ac: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 458d4b0: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 458d4b4: a94557f6     	ldp	x22, x21, [sp, #0x50]
 458d4b8: 910203ff     	add	sp, sp, #0x80
 458d4bc: d65f03c0     	ret
 458d4c0: 14000001     	b	0x458d4c4 <_ChromeMain+0x4588228>
 458d4c4: aa0003f3     	mov	x19, x0
 458d4c8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 458d4cc: 36f800a8     	tbz	w8, #0x1f, 0x458d4e0 <_ChromeMain+0x4588244>
 458d4d0: f94003e0     	ldr	x0, [sp]
 458d4d4: f9400be8     	ldr	x8, [sp, #0x10]
 458d4d8: d37ff901     	lsl	x1, x8, #1
 458d4dc: 96e9ee77     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 458d4e0: aa1303e0     	mov	x0, x19
 458d4e4: 94e9d808     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 458d4e8: 94e9db9e     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 458d4ec: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 458d4f0: a90157f6     	stp	x22, x21, [sp, #0x10]
 458d4f4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 458d4f8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 458d4fc: 9100c3fd     	add	x29, sp, #0x30
 458d500: aa0303f3     	mov	x19, x3
 458d504: aa0203f4     	mov	x20, x2
 458d508: aa0103f5     	mov	x21, x1
 458d50c: aa0003f6     	mov	x22, x0
 458d510: 90053b08     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 458d514: f9454d00     	ldr	x0, [x8, #0xa98]
 458d518: 951874a8     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 458d51c: aa0003f7     	mov	x23, x0
 458d520: d2800002     	mov	x2, #0x0                ; =0
 458d524: 95ef0f6a     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 458d528: aa1603e0     	mov	x0, x22
 458d52c: aa1503e1     	mov	x1, x21
 458d530: 975b7aae     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d534: 94e9d881     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d538: aa0003f5     	mov	x21, x0
 458d53c: aa1703e0     	mov	x0, x23
 458d540: aa1503e2     	mov	x2, x21
 458d544: 95ef0f5c     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 458d548: aa1503e0     	mov	x0, x21
 458d54c: 94e9d884     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d550: aa1403e0     	mov	x0, x20
 458d554: aa1303e1     	mov	x1, x19
 458d558: 975b7aa4     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 458d55c: 94e9d877     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 458d560: aa0003f3     	mov	x19, x0
 458d564: aa1703e0     	mov	x0, x23
 458d568: aa1303e2     	mov	x2, x19
 458d56c: 95ef0f55     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 458d570: aa1303e0     	mov	x0, x19
 458d574: 94e9d87a     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 458d578: b0052d42     	adrp	x2, 0xeb36000 <dyld_stub_binder+0xeb36000>
 458d57c: 9124e042     	add	x2, x2, #0x938
 458d580: aa1703e0     	mov	x0, x23
 458d584: 95ef0f55     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 458d588: aa1d03fd     	mov	x29, x29
 458d58c: 95619d86     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 458d590: aa1703e0     	mov	x0, x23
 458d594: 95ef0f42     	bl	0xc15129c <_ChromeMain+0xc14c000>
 458d598: aa1703e0     	mov	x0, x23
 458d59c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 458d5a0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 458d5a4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 458d5a8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 458d5ac: 14e9d86c     	b	0x800375c <_ChromeMain+0x7ffe4c0>
