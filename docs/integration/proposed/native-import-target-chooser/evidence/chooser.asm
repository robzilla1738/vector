
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426b100: d10243ff     	sub	sp, sp, #0x90
 426b104: a9055ff8     	stp	x24, x23, [sp, #0x50]
 426b108: a90657f6     	stp	x22, x21, [sp, #0x60]
 426b10c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 426b110: a9087bfd     	stp	x29, x30, [sp, #0x80]
 426b114: 910203fd     	add	x29, sp, #0x80
 426b118: aa0303f3     	mov	x19, x3
 426b11c: aa0203f5     	mov	x21, x2
 426b120: aa0103f6     	mov	x22, x1
 426b124: b004ede8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 426b128: f940f908     	ldr	x8, [x8, #0x1f0]
 426b12c: f9400108     	ldr	x8, [x8]
 426b130: f81c83a8     	stur	x8, [x29, #-0x38]
 426b134: d0055408     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426b138: f9454d00     	ldr	x0, [x8, #0xa98]
 426b13c: 9524fd9f     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 426b140: aa0003f4     	mov	x20, x0
 426b144: 52800022     	mov	w2, #0x1                ; =1
 426b148: 95fb9861     	bl	0xc1512cc <_ChromeMain+0xc14c030>
 426b14c: f004e868     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 426b150: 9115b908     	add	x8, x8, #0x56e
 426b154: 528000e9     	mov	w9, #0x7                ; =7
 426b158: a901a7e8     	stp	x8, x9, [sp, #0x18]
 426b15c: a902d7f6     	stp	x22, x21, [sp, #0x28]
 426b160: f004e868     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 426b164: 9115f908     	add	x8, x8, #0x57e
 426b168: 528000a9     	mov	w9, #0x5                ; =5
 426b16c: a903a7e8     	stp	x8, x9, [sp, #0x38]
 426b170: 910003f7     	mov	x23, sp
 426b174: 910003e8     	mov	x8, sp
 426b178: 910063e0     	add	x0, sp, #0x18
 426b17c: 52800061     	mov	w1, #0x3                ; =3
 426b180: 973e7310     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 426b184: 39805fe8     	ldrsb	x8, [sp, #0x17]
 426b188: a9402be9     	ldp	x9, x10, [sp]
 426b18c: f100011f     	cmp	x8, #0x0
 426b190: 9a974120     	csel	x0, x9, x23, mi
 426b194: 7100011f     	cmp	w8, #0x0
 426b198: 9a884141     	csel	x1, x10, x8, mi
 426b19c: 97680393     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 426b1a0: 94f66166     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426b1a4: aa0003f7     	mov	x23, x0
 426b1a8: aa1403e0     	mov	x0, x20
 426b1ac: aa1703e2     	mov	x2, x23
 426b1b0: 95fb9841     	bl	0xc1512b4 <_ChromeMain+0xc14c018>
 426b1b4: aa1703e0     	mov	x0, x23
 426b1b8: 94f66169     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426b1bc: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 426b1c0: 36f800a8     	tbz	w8, #0x1f, 0x426b1d4 <_ChromeMain+0x4265f38>
 426b1c4: f94003e0     	ldr	x0, [sp]
 426b1c8: f9400be8     	ldr	x8, [sp, #0x10]
 426b1cc: d37ff901     	lsl	x1, x8, #1
 426b1d0: 96f6773a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b1d4: f004e868     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 426b1d8: 91162908     	add	x8, x8, #0x58a
 426b1dc: 52800389     	mov	w9, #0x1c               ; =28
 426b1e0: a901a7e8     	stp	x8, x9, [sp, #0x18]
 426b1e4: a902d7f6     	stp	x22, x21, [sp, #0x28]
 426b1e8: f004e868     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 426b1ec: 91171108     	add	x8, x8, #0x5c4
 426b1f0: 528000c9     	mov	w9, #0x6                ; =6
 426b1f4: a903a7e8     	stp	x8, x9, [sp, #0x38]
 426b1f8: 910003f5     	mov	x21, sp
 426b1fc: 910003e8     	mov	x8, sp
 426b200: 910063e0     	add	x0, sp, #0x18
 426b204: 52800061     	mov	w1, #0x3                ; =3
 426b208: 973e72ee     	bl	0x1207dc0 <_ChromeMain+0x1202b24>
 426b20c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 426b210: a9402be9     	ldp	x9, x10, [sp]
 426b214: f100011f     	cmp	x8, #0x0
 426b218: 9a954120     	csel	x0, x9, x21, mi
 426b21c: 7100011f     	cmp	w8, #0x0
 426b220: 9a884141     	csel	x1, x10, x8, mi
 426b224: 97680371     	bl	0x1c6bfe8 <_ChromeMain+0x1c66d4c>
 426b228: 94f66144     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426b22c: aa0003f5     	mov	x21, x0
 426b230: aa1403e0     	mov	x0, x20
 426b234: aa1503e2     	mov	x2, x21
 426b238: 95fb9822     	bl	0xc1512c0 <_ChromeMain+0xc14c024>
 426b23c: aa1503e0     	mov	x0, x21
 426b240: 94f66147     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426b244: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 426b248: 36f800a8     	tbz	w8, #0x1f, 0x426b25c <_ChromeMain+0x4265fc0>
 426b24c: f94003e0     	ldr	x0, [sp]
 426b250: f9400be8     	ldr	x8, [sp, #0x10]
 426b254: d37ff901     	lsl	x1, x8, #1
 426b258: 96f67718     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 426b25c: d0054622     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426b260: 9128e042     	add	x2, x2, #0xa38
 426b264: aa1403e0     	mov	x0, x20
 426b268: 95fb981c     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 426b26c: aa1d03fd     	mov	x29, x29
 426b270: 956e264d     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 426b274: d0054622     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426b278: 91296042     	add	x2, x2, #0xa58
 426b27c: aa1403e0     	mov	x0, x20
 426b280: 95fb9816     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 426b284: aa1d03fd     	mov	x29, x29
 426b288: 956e2647     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 426b28c: d0054622     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426b290: 9129e042     	add	x2, x2, #0xa78
 426b294: aa1403e0     	mov	x0, x20
 426b298: 95fb9810     	bl	0xc1512d8 <_ChromeMain+0xc14c03c>
 426b29c: aa1d03fd     	mov	x29, x29
 426b2a0: 956e2641     	bl	0x9df4ba4 <_ChromeMain+0x9def908>
 426b2a4: aa1403e0     	mov	x0, x20
 426b2a8: 95fb97fd     	bl	0xc15129c <_ChromeMain+0xc14c000>
 426b2ac: b4000273     	cbz	x19, 0x426b2f8 <_ChromeMain+0x426605c>
 426b2b0: b20003e8     	mov	x8, #0x100000001        ; =4294967297
 426b2b4: f10fa41f     	cmp	x0, #0x3e9
 426b2b8: 9a9f0108     	csel	x8, x8, xzr, eq
 426b2bc: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 426b2c0: f10fa01f     	cmp	x0, #0x3e8
 426b2c4: 9a880128     	csel	x8, x9, x8, eq
 426b2c8: f9000fe8     	str	x8, [sp, #0x18]
 426b2cc: f9400668     	ldr	x8, [x19, #0x8]
 426b2d0: 910063e1     	add	x1, sp, #0x18
 426b2d4: aa1303e0     	mov	x0, x19
 426b2d8: d63f0100     	blr	x8
 426b2dc: 12800008     	mov	w8, #-0x1               ; =-1
 426b2e0: b8e80268     	ldaddal	w8, w8, [x19]
 426b2e4: 7100051f     	cmp	w8, #0x1
 426b2e8: 54000081     	b.ne	0x426b2f8 <_ChromeMain+0x426605c>
 426b2ec: f9400a68     	ldr	x8, [x19, #0x10]
 426b2f0: aa1303e0     	mov	x0, x19
 426b2f4: d63f0100     	blr	x8
 426b2f8: aa1403e0     	mov	x0, x20
 426b2fc: 94f66118     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426b300: f85c83a8     	ldur	x8, [x29, #-0x38]
 426b304: b004ede9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 426b308: f940f929     	ldr	x9, [x9, #0x1f0]
 426b30c: f9400129     	ldr	x9, [x9]
 426b310: eb08013f     	cmp	x9, x8
 426b314: 54000401     	b.ne	0x426b394 <_ChromeMain+0x42660f8>
 426b318: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 426b31c: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 426b320: a94657f6     	ldp	x22, x21, [sp, #0x60]
 426b324: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 426b328: 910243ff     	add	sp, sp, #0x90
 426b32c: d65f03c0     	ret
