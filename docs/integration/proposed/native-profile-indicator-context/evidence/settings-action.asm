
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457290c: d10543ff     	sub	sp, sp, #0x150
 4572910: a9106ffc     	stp	x28, x27, [sp, #0x100]
 4572914: a9115ff8     	stp	x24, x23, [sp, #0x110]
 4572918: a91257f6     	stp	x22, x21, [sp, #0x120]
 457291c: a9134ff4     	stp	x20, x19, [sp, #0x130]
 4572920: a9147bfd     	stp	x29, x30, [sp, #0x140]
 4572924: 910503fd     	add	x29, sp, #0x140
 4572928: aa0103f3     	mov	x19, x1
 457292c: aa0003f5     	mov	x21, x0
 4572930: d004d5a8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4572934: f940f908     	ldr	x8, [x8, #0x1f0]
 4572938: f9400108     	ldr	x8, [x8]
 457293c: f81b83a8     	stur	x8, [x29, #-0x48]
 4572940: 90054ba8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4572944: f9467d00     	ldr	x0, [x8, #0xcf8]
 4572948: b40008e0     	cbz	x0, 0x4572a64 <_ChromeMain+0x456d7c8>
 457294c: 9752b48b     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4572950: b40008a0     	cbz	x0, 0x4572a64 <_ChromeMain+0x456d7c8>
 4572954: aa1303e1     	mov	x1, x19
 4572958: 9788cb53     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 457295c: b4000840     	cbz	x0, 0x4572a64 <_ChromeMain+0x456d7c8>
 4572960: aa0003f4     	mov	x20, x0
 4572964: f9400008     	ldr	x8, [x0]
 4572968: f940a508     	ldr	x8, [x8, #0x148]
 457296c: d63f0100     	blr	x8
 4572970: 9744bbbf     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 4572974: b4000400     	cbz	x0, 0x45729f4 <_ChromeMain+0x456d758>
 4572978: aa0003f6     	mov	x22, x0
 457297c: 52800600     	mov	w0, #0x30               ; =48
 4572980: 96ea727a     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572984: f9001be0     	str	x0, [sp, #0x30]
 4572988: b004ce48     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 457298c: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 4572990: 3c8383e0     	stur	q0, [sp, #0x38]
 4572994: 91008009     	add	x9, x0, #0x20
 4572998: eb00013f     	cmp	x9, x0
 457299c: 54001883     	b.lo	0x4572cac <_ChromeMain+0x456da10>
 45729a0: d00446a8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 45729a4: 91252508     	add	x8, x8, #0x949
 45729a8: eb08013f     	cmp	x9, x8
 45729ac: fa488002     	ccmp	x0, x8, #0x2, hi
 45729b0: 540017e9     	b.ls	0x4572cac <_ChromeMain+0x456da10>
 45729b4: ad400500     	ldp	q0, q1, [x8]
 45729b8: ad000400     	stp	q0, q1, [x0]
 45729bc: 3900801f     	strb	wzr, [x0, #0x20]
 45729c0: 9100c3e1     	add	x1, sp, #0x30
 45729c4: aa1603e0     	mov	x0, x22
 45729c8: 528003e2     	mov	w2, #0x1f               ; =31
 45729cc: 976d4c14     	bl	0x20c5a1c <_ChromeMain+0x20c0780>
 45729d0: f100001f     	cmp	x0, #0x0
 45729d4: 1a9f07f8     	cset	w24, ne
 45729d8: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 45729dc: 36f800e8     	tbz	w8, #0x1f, 0x45729f8 <_ChromeMain+0x456d75c>
 45729e0: f9401be0     	ldr	x0, [sp, #0x30]
 45729e4: f94023e8     	ldr	x8, [sp, #0x40]
 45729e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45729ec: 96ea5933     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45729f0: 14000002     	b	0x45729f8 <_ChromeMain+0x456d75c>
 45729f4: 52800018     	mov	w24, #0x0               ; =0
 45729f8: 39412288     	ldrb	w8, [x20, #0x48]
 45729fc: 37000368     	tbnz	w8, #0x0, 0x4572a68 <_ChromeMain+0x456d7cc>
 4572a00: f9400288     	ldr	x8, [x20]
 4572a04: f940b508     	ldr	x8, [x8, #0x168]
 4572a08: aa1403e0     	mov	x0, x20
 4572a0c: d63f0100     	blr	x8
 4572a10: b40002c0     	cbz	x0, 0x4572a68 <_ChromeMain+0x456d7cc>
 4572a14: aa0003f4     	mov	x20, x0
 4572a18: d0044b41     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4572a1c: 91018021     	add	x1, x1, #0x60
 4572a20: 52800202     	mov	w2, #0x10               ; =16
 4572a24: 96fd288a     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 4572a28: b4000200     	cbz	x0, 0x4572a68 <_ChromeMain+0x456d7cc>
 4572a2c: d0044b41     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4572a30: 91018021     	add	x1, x1, #0x60
 4572a34: aa1403e0     	mov	x0, x20
 4572a38: 52800202     	mov	w2, #0x10               ; =16
 4572a3c: 96f52ffb     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 4572a40: 0aa07c08     	bic	w8, w0, w0, asr #31
 4572a44: 3100041f     	cmn	w0, #0x1
 4572a48: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 4572a4c: 9a9fc129     	csel	x9, x9, xzr, gt
 4572a50: aa080136     	orr	x22, x9, x8
 4572a54: 14000006     	b	0x4572a6c <_ChromeMain+0x456d7d0>
 4572a58: d2800014     	mov	x20, #0x0               ; =0
 4572a5c: d2800017     	mov	x23, #0x0               ; =0
 4572a60: 14000010     	b	0x4572aa0 <_ChromeMain+0x456d804>
 4572a64: 52800018     	mov	w24, #0x0               ; =0
 4572a68: d2800016     	mov	x22, #0x0               ; =0
 4572a6c: f94002a8     	ldr	x8, [x21]
 4572a70: b4ffff48     	cbz	x8, 0x4572a58 <_ChromeMain+0x456d7bc>
 4572a74: f940d914     	ldr	x20, [x8, #0x1b0]
 4572a78: b40000d4     	cbz	x20, 0x4572a90 <_ChromeMain+0x456d7f4>
 4572a7c: 52800029     	mov	w9, #0x1                ; =1
 4572a80: b8290289     	ldadd	w9, w9, [x20]
 4572a84: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4572a88: 6b0a013f     	cmp	w9, w10
 4572a8c: 540010c0     	b.eq	0x4572ca4 <_ChromeMain+0x456da08>
 4572a90: f940dd08     	ldr	x8, [x8, #0x1b8]
 4572a94: 9100a109     	add	x9, x8, #0x28
 4572a98: f100011f     	cmp	x8, #0x0
 4572a9c: 9a8903f7     	csel	x23, xzr, x9, eq
 4572aa0: aa1503e0     	mov	x0, x21
 4572aa4: 97ffedc9     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 4572aa8: f2607edf     	tst	x22, #0xffffffff00000000
 4572aac: 1a9803e8     	csel	w8, wzr, w24, eq
 4572ab0: 34000c28     	cbz	w8, 0x4572c34 <_ChromeMain+0x456d998>
 4572ab4: f90053ff     	str	xzr, [sp, #0xa0]
 4572ab8: 6f00e400     	movi.2d	v0, #0000000000000000
 4572abc: ad0403e0     	stp	q0, q0, [sp, #0x80]
 4572ac0: ad0303e0     	stp	q0, q0, [sp, #0x60]
 4572ac4: ad0203e0     	stp	q0, q0, [sp, #0x40]
 4572ac8: 3d800fe0     	str	q0, [sp, #0x30]
 4572acc: d004a468     	adrp	x8, 0xda00000 <dyld_stub_binder+0xda00000>
 4572ad0: 91002908     	add	x8, x8, #0xa
 4572ad4: 52800269     	mov	w9, #0x13               ; =19
 4572ad8: a936a7a8     	stp	x8, x9, [x29, #-0x98]
 4572adc: d00446a8     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 4572ae0: 91252508     	add	x8, x8, #0x949
 4572ae4: 52800409     	mov	w9, #0x20               ; =32
 4572ae8: a937a7a8     	stp	x8, x9, [x29, #-0x88]
 4572aec: 9004caa8     	adrp	x8, 0xdec6000 <dyld_stub_binder+0xdec6000>
 4572af0: 910b8908     	add	x8, x8, #0x2e2
 4572af4: 52800209     	mov	w9, #0x10               ; =16
 4572af8: a938a7a8     	stp	x8, x9, [x29, #-0x78]
 4572afc: 910003f5     	mov	x21, sp
 4572b00: 910003e8     	mov	x8, sp
 4572b04: aa1603e0     	mov	x0, x22
 4572b08: 972ef9ce     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 4572b0c: 39805fe8     	ldrsb	x8, [sp, #0x17]
 4572b10: a9402be9     	ldp	x9, x10, [sp]
 4572b14: f100011f     	cmp	x8, #0x0
 4572b18: 9a954129     	csel	x9, x9, x21, mi
 4572b1c: 7100011f     	cmp	w8, #0x0
 4572b20: 9a884148     	csel	x8, x10, x8, mi
 4572b24: a939a3a9     	stp	x9, x8, [x29, #-0x68]
 4572b28: 9004caa8     	adrp	x8, 0xdec6000 <dyld_stub_binder+0xdec6000>
 4572b2c: 910bcd08     	add	x8, x8, #0x2f3
 4572b30: 52800229     	mov	w9, #0x11               ; =17
 4572b34: a93aa7a8     	stp	x8, x9, [x29, #-0x58]
 4572b38: 910063f5     	add	x21, sp, #0x18
 4572b3c: 910063e8     	add	x8, sp, #0x18
 4572b40: d10263a0     	sub	x0, x29, #0x98
 4572b44: 528000a1     	mov	w1, #0x5                ; =5
 4572b48: 9703e003     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 4572b4c: 3980bfe8     	ldrsb	x8, [sp, #0x2f]
 4572b50: a941abe9     	ldp	x9, x10, [sp, #0x18]
 4572b54: f100011f     	cmp	x8, #0x0
 4572b58: 9a954121     	csel	x1, x9, x21, mi
 4572b5c: 7100011f     	cmp	w8, #0x0
 4572b60: 9a884142     	csel	x2, x10, x8, mi
 4572b64: 9100c3e0     	add	x0, sp, #0x30
 4572b68: 96f7f59b     	bl	0x3701d4 <_ChromeMain+0x36af38>
 4572b6c: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4572b70: 36f800a8     	tbz	w8, #0x1f, 0x4572b84 <_ChromeMain+0x456d8e8>
 4572b74: f9400fe0     	ldr	x0, [sp, #0x18]
 4572b78: f94017e8     	ldr	x8, [sp, #0x28]
 4572b7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4572b80: 96ea58ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572b84: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4572b88: 36f800a8     	tbz	w8, #0x1f, 0x4572b9c <_ChromeMain+0x456d900>
 4572b8c: f94003e0     	ldr	x0, [sp]
 4572b90: f9400be8     	ldr	x8, [sp, #0x10]
 4572b94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4572b98: 96ea58c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572b9c: 394123e8     	ldrb	w8, [sp, #0x48]
 4572ba0: 340003a8     	cbz	w8, 0x4572c14 <_ChromeMain+0x456d978>
 4572ba4: d2800015     	mov	x21, #0x0               ; =0
 4572ba8: b40000f4     	cbz	x20, 0x4572bc4 <_ChromeMain+0x456d928>
 4572bac: 19404288     	ldapurb	w8, [x20, #0x4]
 4572bb0: 350000a8     	cbnz	w8, 0x4572bc4 <_ChromeMain+0x456d928>
 4572bb4: b4000097     	cbz	x23, 0x4572bc4 <_ChromeMain+0x456d928>
 4572bb8: 19404288     	ldapurb	w8, [x20, #0x4]
 4572bbc: 350007a8     	cbnz	w8, 0x4572cb0 <_ChromeMain+0x456da14>
 4572bc0: d100a2f5     	sub	x21, x23, #0x28
 4572bc4: 52801400     	mov	w0, #0xa0               ; =160
 4572bc8: 96ea71e8     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572bcc: aa0003f6     	mov	x22, x0
 4572bd0: 52800028     	mov	w8, #0x1                ; =1
 4572bd4: 10087869     	adr	x9, 0x4583ae0 <_ChromeMain+0x457e844>
 4572bd8: d503201f     	nop
 4572bdc: d0ffa16a     	adrp	x10, 0x39a0000 <_ChromeMain+0x399ad64>
 4572be0: 9114214a     	add	x10, x10, #0x508
 4572be4: b9000008     	str	w8, [x0]
 4572be8: a900a809     	stp	x9, x10, [x0, #0x8]
 4572bec: f0feff48     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4572bf0: 912c0108     	add	x8, x8, #0xb00
 4572bf4: f9000c08     	str	x8, [x0, #0x18]
 4572bf8: 9100a000     	add	x0, x0, #0x28
 4572bfc: 9100c3e1     	add	x1, sp, #0x30
 4572c00: 96ef1ce5     	bl	0x139f94 <_ChromeMain+0x134cf8>
 4572c04: aa1503e0     	mov	x0, x21
 4572c08: aa1303e1     	mov	x1, x19
 4572c0c: aa1603e2     	mov	x2, x22
 4572c10: 97ee2ee5     	bl	0x40fe7a4 <_ChromeMain+0x40f9508>
 4572c14: 9100c3f3     	add	x19, sp, #0x30
 4572c18: 9101c260     	add	x0, x19, #0x70
 4572c1c: d2800001     	mov	x1, #0x0                ; =0
 4572c20: 96ead426     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4572c24: 91008260     	add	x0, x19, #0x20
 4572c28: 96ead414     	bl	0x27c78 <_ChromeMain+0x229dc>
 4572c2c: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4572c30: 37f801e8     	tbnz	w8, #0x1f, 0x4572c6c <_ChromeMain+0x456d9d0>
 4572c34: b5000274     	cbnz	x20, 0x4572c80 <_ChromeMain+0x456d9e4>
 4572c38: f85b83a8     	ldur	x8, [x29, #-0x48]
 4572c3c: d004d5a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4572c40: f940f929     	ldr	x9, [x9, #0x1f0]
 4572c44: f9400129     	ldr	x9, [x9]
 4572c48: eb08013f     	cmp	x9, x8
 4572c4c: 540002a1     	b.ne	0x4572ca0 <_ChromeMain+0x456da04>
 4572c50: a9547bfd     	ldp	x29, x30, [sp, #0x140]
 4572c54: a9534ff4     	ldp	x20, x19, [sp, #0x130]
 4572c58: a95257f6     	ldp	x22, x21, [sp, #0x120]
 4572c5c: a9515ff8     	ldp	x24, x23, [sp, #0x110]
 4572c60: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 4572c64: 910543ff     	add	sp, sp, #0x150
 4572c68: d65f03c0     	ret
 4572c6c: f9401be0     	ldr	x0, [sp, #0x30]
 4572c70: f94023e8     	ldr	x8, [sp, #0x40]
 4572c74: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4572c78: 96ea5890     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572c7c: b4fffdf4     	cbz	x20, 0x4572c38 <_ChromeMain+0x456d99c>
 4572c80: 12800008     	mov	w8, #-0x1               ; =-1
 4572c84: b8e80288     	ldaddal	w8, w8, [x20]
 4572c88: 7100051f     	cmp	w8, #0x1
 4572c8c: 54fffd61     	b.ne	0x4572c38 <_ChromeMain+0x456d99c>
 4572c90: aa1403e0     	mov	x0, x20
 4572c94: 52800101     	mov	w1, #0x8                ; =8
 4572c98: 96ea5888     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4572c9c: 17ffffe7     	b	0x4572c38 <_ChromeMain+0x456d99c>
 4572ca0: 94ea45b0     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4572ca4: d4200000     	brk	#0
 4572ca8: d4400000     	hlt	#0
 4572cac: d4200020     	brk	#0x1
