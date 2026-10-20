
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42518c0: d10303ff     	sub	sp, sp, #0xc0
 42518c4: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 42518c8: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 42518cc: 9102c3fd     	add	x29, sp, #0xb0
 42518d0: f004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 42518d4: f940f908     	ldr	x8, [x8, #0x1f0]
 42518d8: f9400108     	ldr	x8, [x8]
 42518dc: f81e83a8     	stur	x8, [x29, #-0x18]
 42518e0: f9400813     	ldr	x19, [x0, #0x10]
 42518e4: b5000173     	cbnz	x19, 0x4251910 <_ChromeMain+0x424c674>
 42518e8: f85e83a8     	ldur	x8, [x29, #-0x18]
 42518ec: f004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42518f0: f940f929     	ldr	x9, [x9, #0x1f0]
 42518f4: f9400129     	ldr	x9, [x9]
 42518f8: eb08013f     	cmp	x9, x8
 42518fc: 54000921     	b.ne	0x4251a20 <_ChromeMain+0x424c784>
 4251900: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4251904: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4251908: 910303ff     	add	sp, sp, #0xc0
 425190c: d65f03c0     	ret
 4251910: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251914: 91054021     	add	x1, x1, #0x150
 4251918: 9100a3e0     	add	x0, sp, #0x28
 425191c: 979c8171     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251920: 910123e0     	add	x0, sp, #0x48
 4251924: 9100a3e1     	add	x1, sp, #0x28
 4251928: 977938c2     	bl	0x209fc30 <_ChromeMain+0x209a994>
 425192c: f00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4251930: 91031021     	add	x1, x1, #0xc4
 4251934: 910023e0     	add	x0, sp, #0x8
 4251938: 979c816a     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 425193c: d10143a8     	sub	x8, x29, #0x50
 4251940: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 4251944: 3cc483e0     	ldur	q0, [sp, #0x48]
 4251948: 3c9b03a0     	stur	q0, [x29, #-0x50]
 425194c: f9402fe9     	ldr	x9, [sp, #0x58]
 4251950: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 4251954: 91006100     	add	x0, x8, #0x18
 4251958: 910023e1     	add	x1, sp, #0x8
 425195c: 977938b5     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251960: b004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4251964: 911e5021     	add	x1, x1, #0x794
 4251968: d10143a3     	sub	x3, x29, #0x50
 425196c: aa1303e0     	mov	x0, x19
 4251970: 52800302     	mov	w2, #0x18               ; =24
 4251974: 52800044     	mov	w4, #0x2                ; =2
 4251978: 949d8377     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 425197c: 394083e8     	ldrb	w8, [sp, #0x20]
 4251980: 90053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4251984: 9121e273     	add	x19, x19, #0x878
 4251988: 7103fd1f     	cmp	w8, #0xff
 425198c: 54000060     	b.eq	0x4251998 <_ChromeMain+0x424c6fc>
 4251990: 721e791f     	tst	w8, #0xfffffffd
 4251994: 540001a1     	b.ne	0x42519c8 <_ChromeMain+0x424c72c>
 4251998: 394103e8     	ldrb	w8, [sp, #0x40]
 425199c: 7103fd1f     	cmp	w8, #0xff
 42519a0: 54fffa40     	b.eq	0x42518e8 <_ChromeMain+0x424c64c>
 42519a4: 721e791f     	tst	w8, #0xfffffffd
 42519a8: 54fffa00     	b.eq	0x42518e8 <_ChromeMain+0x424c64c>
 42519ac: 7100111f     	cmp	w8, #0x4
 42519b0: 54000200     	b.eq	0x42519f0 <_ChromeMain+0x424c754>
 42519b4: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 42519b8: d10143a0     	sub	x0, x29, #0x50
 42519bc: 9100a3e1     	add	x1, sp, #0x28
 42519c0: d63f0100     	blr	x8
 42519c4: 17ffffc9     	b	0x42518e8 <_ChromeMain+0x424c64c>
 42519c8: 7100111f     	cmp	w8, #0x4
 42519cc: 540000c0     	b.eq	0x42519e4 <_ChromeMain+0x424c748>
 42519d0: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 42519d4: d10143a0     	sub	x0, x29, #0x50
 42519d8: 910023e1     	add	x1, sp, #0x8
 42519dc: d63f0100     	blr	x8
 42519e0: 17ffffee     	b	0x4251998 <_ChromeMain+0x424c6fc>
 42519e4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 42519e8: 36fffd88     	tbz	w8, #0x1f, 0x4251998 <_ChromeMain+0x424c6fc>
 42519ec: 14000008     	b	0x4251a0c <_ChromeMain+0x424c770>
 42519f0: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 42519f4: 36fff7a8     	tbz	w8, #0x1f, 0x42518e8 <_ChromeMain+0x424c64c>
 42519f8: f94017e0     	ldr	x0, [sp, #0x28]
 42519fc: f9401fe8     	ldr	x8, [sp, #0x38]
 4251a00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251a04: 96f6dd2d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251a08: 17ffffb8     	b	0x42518e8 <_ChromeMain+0x424c64c>
 4251a0c: f94007e0     	ldr	x0, [sp, #0x8]
 4251a10: f9400fe8     	ldr	x8, [sp, #0x18]
 4251a14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251a18: 96f6dd28     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251a1c: 17ffffdf     	b	0x4251998 <_ChromeMain+0x424c6fc>
 4251a20: 94f6ca50     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
