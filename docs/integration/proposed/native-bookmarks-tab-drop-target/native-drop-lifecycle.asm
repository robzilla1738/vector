
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461ec30: 395f2408     	ldrb	w8, [x0, #0x7c9]
 461ec34: 37000a48     	tbnz	w8, #0x0, 0x461ed7c <_ChromeMain+0x4619ae0>
 461ec38: d102c3ff     	sub	sp, sp, #0xb0
 461ec3c: a90857f6     	stp	x22, x21, [sp, #0x80]
 461ec40: a9094ff4     	stp	x20, x19, [sp, #0x90]
 461ec44: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 461ec48: 910283fd     	add	x29, sp, #0xa0
 461ec4c: aa0003f3     	mov	x19, x0
 461ec50: 391f201f     	strb	wzr, [x0, #0x7c8]
 461ec54: 910003f4     	mov	x20, sp
 461ec58: a9007fff     	stp	xzr, xzr, [sp]
 461ec5c: b80173ff     	stur	wzr, [sp, #0x17]
 461ec60: f9000bff     	str	xzr, [sp, #0x10]
 461ec64: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 461ec68: ad0103e0     	stp	q0, q0, [sp, #0x20]
 461ec6c: ad0203e0     	stp	q0, q0, [sp, #0x40]
 461ec70: 7900c3ff     	strh	wzr, [sp, #0x60]
 461ec74: a906ffff     	stp	xzr, xzr, [sp, #0x68]
 461ec78: 911f4000     	add	x0, x0, #0x7d0
 461ec7c: 910003e1     	mov	x1, sp
 461ec80: 96ff6b98     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 461ec84: 9101c280     	add	x0, x20, #0x70
 461ec88: d2800001     	mov	x1, #0x0                ; =0
 461ec8c: 96e8240b     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461ec90: 91008280     	add	x0, x20, #0x20
 461ec94: 96e823f9     	bl	0x27c78 <_ChromeMain+0x229dc>
 461ec98: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 461ec9c: 36f800a8     	tbz	w8, #0x1f, 0x461ecb0 <_ChromeMain+0x4619a14>
 461eca0: f94003e0     	ldr	x0, [sp]
 461eca4: f9400be8     	ldr	x8, [sp, #0x10]
 461eca8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461ecac: 96e7a883     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ecb0: 39e17e68     	ldrsb	w8, [x19, #0x85f]
 461ecb4: 37f80268     	tbnz	w8, #0x1f, 0x461ed00 <_ChromeMain+0x4619a64>
 461ecb8: 7910927f     	strh	wzr, [x19, #0x848]
 461ecbc: 39217e7f     	strb	wzr, [x19, #0x85f]
 461ecc0: 911ea274     	add	x20, x19, #0x7a8
 461ecc4: f943d660     	ldr	x0, [x19, #0x7a8]
 461ecc8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461eccc: 90052ca9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461ecd0: f9404529     	ldr	x9, [x9, #0x88]
 461ecd4: eb09011f     	cmp	x8, x9
 461ecd8: 54000041     	b.ne	0x461ece0 <_ChromeMain+0x4619a44>
 461ecdc: 96e80f58     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461ece0: a9007e9f     	stp	xzr, xzr, [x20]
 461ece4: 3900429f     	strb	wzr, [x20, #0x10]
 461ece8: f942ee68     	ldr	x8, [x19, #0x5d8]
 461ecec: d37ced14     	lsl	x20, x8, #4
 461ecf0: b4000214     	cbz	x20, 0x461ed30 <_ChromeMain+0x4619a94>
 461ecf4: f942ea68     	ldr	x8, [x19, #0x5d0]
 461ecf8: 91002115     	add	x21, x8, #0x8
 461ecfc: 14000009     	b	0x461ed20 <_ChromeMain+0x4619a84>
 461ed00: f9442668     	ldr	x8, [x19, #0x848]
 461ed04: 7900011f     	strh	wzr, [x8]
 461ed08: f9042a7f     	str	xzr, [x19, #0x850]
 461ed0c: 17ffffed     	b	0x461ecc0 <_ChromeMain+0x4619a24>
 461ed10: b904541f     	str	wzr, [x0, #0x454]
 461ed14: 96fe091a     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461ed18: f1004294     	subs	x20, x20, #0x10
 461ed1c: 540000a0     	b.eq	0x461ed30 <_ChromeMain+0x4619a94>
 461ed20: f84106a0     	ldr	x0, [x21], #0x10
 461ed24: b9445408     	ldr	w8, [x0, #0x454]
 461ed28: 34ffff88     	cbz	w8, 0x461ed18 <_ChromeMain+0x4619a7c>
 461ed2c: 17fffff9     	b	0x461ed10 <_ChromeMain+0x4619a74>
 461ed30: f81d83bf     	stur	xzr, [x29, #-0x28]
 461ed34: a9007fff     	stp	xzr, xzr, [sp]
 461ed38: f9000bff     	str	xzr, [sp, #0x10]
 461ed3c: d100a3a2     	sub	x2, x29, #0x28
 461ed40: 910003e3     	mov	x3, sp
 461ed44: aa1303e0     	mov	x0, x19
 461ed48: 52800001     	mov	w1, #0x0                ; =0
 461ed4c: 52800004     	mov	w4, #0x0                ; =0
 461ed50: 97fff3af     	bl	0x461bc0c <_ChromeMain+0x4616970>
 461ed54: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 461ed58: 36f800a8     	tbz	w8, #0x1f, 0x461ed6c <_ChromeMain+0x4619ad0>
 461ed5c: f94003e0     	ldr	x0, [sp]
 461ed60: f9400be8     	ldr	x8, [sp, #0x10]
 461ed64: d37ff901     	lsl	x1, x8, #1
 461ed68: 96e7a854     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ed6c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 461ed70: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 461ed74: a94857f6     	ldp	x22, x21, [sp, #0x80]
 461ed78: 9102c3ff     	add	sp, sp, #0xb0
 461ed7c: d65f03c0     	ret
 461ed80: d113e000     	sub	x0, x0, #0x4f8
 461ed84: 17ffffab     	b	0x461ec30 <_ChromeMain+0x4619994>
		...
 461edc0: d10483ff     	sub	sp, sp, #0x120
 461edc4: a90c6ffc     	stp	x28, x27, [sp, #0xc0]
 461edc8: a90d67fa     	stp	x26, x25, [sp, #0xd0]
 461edcc: a90e5ff8     	stp	x24, x23, [sp, #0xe0]
 461edd0: a90f57f6     	stp	x22, x21, [sp, #0xf0]
 461edd4: a9104ff4     	stp	x20, x19, [sp, #0x100]
 461edd8: a9117bfd     	stp	x29, x30, [sp, #0x110]
 461eddc: 910443fd     	add	x29, sp, #0x110
 461ede0: 395f2408     	ldrb	w8, [x0, #0x7c9]
 461ede4: 36000268     	tbz	w8, #0x0, 0x461ee30 <_ChromeMain+0x4619b94>
 461ede8: d2800013     	mov	x19, #0x0               ; =0
 461edec: aa1303e0     	mov	x0, x19
 461edf0: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 461edf4: a9504ff4     	ldp	x20, x19, [sp, #0x100]
 461edf8: a94f57f6     	ldp	x22, x21, [sp, #0xf0]
 461edfc: a94e5ff8     	ldp	x24, x23, [sp, #0xe0]
 461ee00: a94d67fa     	ldp	x26, x25, [sp, #0xd0]
 461ee04: a94c6ffc     	ldp	x28, x27, [sp, #0xc0]
 461ee08: 910483ff     	add	sp, sp, #0x120
 461ee0c: d65f03c0     	ret
 461ee10: f9401673     	ldr	x19, [x19, #0x28]
 461ee14: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 461ee18: 36fffea8     	tbz	w8, #0x1f, 0x461edec <_ChromeMain+0x4619b50>
 461ee1c: f94013e0     	ldr	x0, [sp, #0x20]
 461ee20: f9401be8     	ldr	x8, [sp, #0x30]
 461ee24: d37ff901     	lsl	x1, x8, #1
 461ee28: 96e7a824     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461ee2c: 17fffff0     	b	0x461edec <_ChromeMain+0x4619b50>
 461ee30: aa0203f5     	mov	x21, x2
 461ee34: aa0103f3     	mov	x19, x1
 461ee38: aa0003f4     	mov	x20, x0
 461ee3c: 910103f9     	add	x25, sp, #0x40
 461ee40: 391f201f     	strb	wzr, [x0, #0x7c8]
 461ee44: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 461ee48: b80573ff     	stur	wzr, [sp, #0x57]
 461ee4c: f9002bff     	str	xzr, [sp, #0x50]
 461ee50: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 461ee54: ad0303e0     	stp	q0, q0, [sp, #0x60]
 461ee58: 3d8023e0     	str	q0, [sp, #0x80]
 461ee5c: 3d801720     	str	q0, [x25, #0x50]
 461ee60: 790143ff     	strh	wzr, [sp, #0xa0]
 461ee64: a90affff     	stp	xzr, xzr, [sp, #0xa8]
 461ee68: 911f4000     	add	x0, x0, #0x7d0
 461ee6c: 910103e1     	add	x1, sp, #0x40
 461ee70: 96ff6b1c     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 461ee74: 9101c320     	add	x0, x25, #0x70
 461ee78: d2800001     	mov	x1, #0x0                ; =0
 461ee7c: 96e8238f     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461ee80: 91008320     	add	x0, x25, #0x20
 461ee84: 96e8237d     	bl	0x27c78 <_ChromeMain+0x229dc>
 461ee88: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 461ee8c: 36f800a8     	tbz	w8, #0x1f, 0x461eea0 <_ChromeMain+0x4619c04>
 461ee90: f94023e0     	ldr	x0, [sp, #0x40]
 461ee94: f9402be8     	ldr	x8, [sp, #0x50]
 461ee98: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461ee9c: 96e7a807     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461eea0: 39e17e88     	ldrsb	w8, [x20, #0x85f]
 461eea4: 37f80268     	tbnz	w8, #0x1f, 0x461eef0 <_ChromeMain+0x4619c54>
 461eea8: 7910929f     	strh	wzr, [x20, #0x848]
 461eeac: 39217e9f     	strb	wzr, [x20, #0x85f]
 461eeb0: 911ea297     	add	x23, x20, #0x7a8
 461eeb4: f943d680     	ldr	x0, [x20, #0x7a8]
 461eeb8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461eebc: 90052cb8     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461eec0: f9404709     	ldr	x9, [x24, #0x88]
 461eec4: eb09011f     	cmp	x8, x9
 461eec8: 54000041     	b.ne	0x461eed0 <_ChromeMain+0x4619c34>
 461eecc: 96e80edc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461eed0: a9007eff     	stp	xzr, xzr, [x23]
 461eed4: 390042ff     	strb	wzr, [x23, #0x10]
 461eed8: f942ee88     	ldr	x8, [x20, #0x5d8]
 461eedc: d37ced16     	lsl	x22, x8, #4
 461eee0: b4000216     	cbz	x22, 0x461ef20 <_ChromeMain+0x4619c84>
 461eee4: f942ea88     	ldr	x8, [x20, #0x5d0]
 461eee8: 9100211a     	add	x26, x8, #0x8
 461eeec: 14000009     	b	0x461ef10 <_ChromeMain+0x4619c74>
 461eef0: f9442688     	ldr	x8, [x20, #0x848]
 461eef4: 7900011f     	strh	wzr, [x8]
 461eef8: f9042a9f     	str	xzr, [x20, #0x850]
 461eefc: 17ffffed     	b	0x461eeb0 <_ChromeMain+0x4619c14>
 461ef00: b904541f     	str	wzr, [x0, #0x454]
 461ef04: 96fe089e     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461ef08: f10042d6     	subs	x22, x22, #0x10
 461ef0c: 540000a0     	b.eq	0x461ef20 <_ChromeMain+0x4619c84>
 461ef10: f8410740     	ldr	x0, [x26], #0x10
 461ef14: b9445408     	ldr	w8, [x0, #0x454]
 461ef18: 34ffff88     	cbz	w8, 0x461ef08 <_ChromeMain+0x4619c6c>
 461ef1c: 17fffff9     	b	0x461ef00 <_ChromeMain+0x4619c64>
 461ef20: 39472288     	ldrb	w8, [x20, #0x1c8]
 461ef24: 360004a8     	tbz	w8, #0x0, 0x461efb8 <_ChromeMain+0x4619d1c>
 461ef28: aa1403e0     	mov	x0, x20
 461ef2c: 97382192     	bl	0x1427574 <_ChromeMain+0x14222d8>
 461ef30: b94002a8     	ldr	w8, [x21]
 461ef34: 6b00011f     	cmp	w8, w0
 461ef38: 5400040b     	b.lt	0x461efb8 <_ChromeMain+0x4619d1c>
 461ef3c: 0b000029     	add	w9, w1, w0
 461ef40: 6b09011f     	cmp	w8, w9
 461ef44: 540003aa     	b.ge	0x461efb8 <_ChromeMain+0x4619d1c>
 461ef48: b94006a8     	ldr	w8, [x21, #0x4]
 461ef4c: d360fc09     	lsr	x9, x0, #32
 461ef50: 6b09011f     	cmp	w8, w9
 461ef54: 5400032b     	b.lt	0x461efb8 <_ChromeMain+0x4619d1c>
 461ef58: 8b418129     	add	x9, x9, x1, lsr #32
 461ef5c: 6b09011f     	cmp	w8, w9
 461ef60: 540002ca     	b.ge	0x461efb8 <_ChromeMain+0x4619d1c>
 461ef64: f9429a88     	ldr	x8, [x20, #0x530]
 461ef68: b4000288     	cbz	x8, 0x461efb8 <_ChromeMain+0x4619d1c>
 461ef6c: 39408508     	ldrb	w8, [x8, #0x21]
 461ef70: 34000248     	cbz	w8, 0x461efb8 <_ChromeMain+0x4619d1c>
 461ef74: f9405e68     	ldr	x8, [x19, #0xb8]
 461ef78: 8b081108     	add	x8, x8, x8, lsl #4
 461ef7c: d37df116     	lsl	x22, x8, #3
 461ef80: b40001d6     	cbz	x22, 0x461efb8 <_ChromeMain+0x4619d1c>
 461ef84: 5280001a     	mov	w26, #0x0               ; =0
 461ef88: f9405a68     	ldr	x8, [x19, #0xb0]
 461ef8c: 9100611b     	add	x27, x8, #0x18
 461ef90: f8488760     	ldr	x0, [x27], #0x88
 461ef94: f9400008     	ldr	x8, [x0]
 461ef98: f941ed08     	ldr	x8, [x8, #0x3d8]
 461ef9c: d63f0100     	blr	x8
 461efa0: 7100001f     	cmp	w0, #0x0
 461efa4: 1a9a175a     	cinc	w26, w26, eq
 461efa8: f10222d6     	subs	x22, x22, #0x88
 461efac: 54ffff21     	b.ne	0x461ef90 <_ChromeMain+0x4619cf4>
 461efb0: 7100075f     	cmp	w26, #0x1
 461efb4: 54002520     	b.eq	0x461f458 <_ChromeMain+0x461a1bc>
 461efb8: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 461efbc: f9001bff     	str	xzr, [sp, #0x30]
 461efc0: f9405e68     	ldr	x8, [x19, #0xb8]
 461efc4: 8b081108     	add	x8, x8, x8, lsl #4
 461efc8: d37df116     	lsl	x22, x8, #3
 461efcc: b4000536     	cbz	x22, 0x461f070 <_ChromeMain+0x4619dd4>
 461efd0: 5280001a     	mov	w26, #0x0               ; =0
 461efd4: f9405a68     	ldr	x8, [x19, #0xb0]
 461efd8: 9100611b     	add	x27, x8, #0x18
 461efdc: f8488760     	ldr	x0, [x27], #0x88
 461efe0: f9400008     	ldr	x8, [x0]
 461efe4: f941ed08     	ldr	x8, [x8, #0x3d8]
 461efe8: d63f0100     	blr	x8
 461efec: 7100001f     	cmp	w0, #0x0
 461eff0: 1a9a175a     	cinc	w26, w26, eq
 461eff4: f10222d6     	subs	x22, x22, #0x88
 461eff8: 54ffff21     	b.ne	0x461efdc <_ChromeMain+0x4619d40>
 461effc: 7100075f     	cmp	w26, #0x1
 461f000: 54000381     	b.ne	0x461f070 <_ChromeMain+0x4619dd4>
 461f004: f9408268     	ldr	x8, [x19, #0x100]
 461f008: f9405e69     	ldr	x9, [x19, #0xb8]
 461f00c: eb09011f     	cmp	x8, x9
 461f010: 54002102     	b.hs	0x461f430 <_ChromeMain+0x461a194>
 461f014: f9405a69     	ldr	x9, [x19, #0xb0]
 461f018: 5280110a     	mov	w10, #0x88              ; =136
 461f01c: 9b0a2508     	madd	x8, x8, x10, x9
 461f020: f9400916     	ldr	x22, [x8, #0x10]
 461f024: b4000276     	cbz	x22, 0x461f070 <_ChromeMain+0x4619dd4>
 461f028: aa1603e0     	mov	x0, x22
 461f02c: 973a252c     	bl	0x14a84dc <_ChromeMain+0x14a3240>
 461f030: 910083e8     	add	x8, sp, #0x20
 461f034: eb00011f     	cmp	x8, x0
 461f038: 54000120     	b.eq	0x461f05c <_ChromeMain+0x4619dc0>
 461f03c: 39c0dfe9     	ldrsb	w9, [sp, #0x37]
 461f040: 39405c08     	ldrb	w8, [x0, #0x17]
 461f044: 37f82c89     	tbnz	w9, #0x1f, 0x461f5d4 <_ChromeMain+0x461a338>
 461f048: 37380988     	tbnz	w8, #0x7, 0x461f178 <_ChromeMain+0x4619edc>
 461f04c: 3dc00000     	ldr	q0, [x0]
 461f050: f9400808     	ldr	x8, [x0, #0x10]
 461f054: f9001be8     	str	x8, [sp, #0x30]
 461f058: 3d800be0     	str	q0, [sp, #0x20]
 461f05c: 3940dfe8     	ldrb	w8, [sp, #0x37]
 461f060: f94017e9     	ldr	x9, [sp, #0x28]
 461f064: 7219011f     	tst	w8, #0x80
 461f068: 9a881128     	csel	x8, x9, x8, ne
 461f06c: b4000e88     	cbz	x8, 0x461f23c <_ChromeMain+0x4619fa0>
 461f070: 91212289     	add	x9, x20, #0x848
 461f074: 3940dfe8     	ldrb	w8, [sp, #0x37]
 461f078: 13001d0a     	sxtb	w10, w8
 461f07c: f94017e2     	ldr	x2, [sp, #0x28]
 461f080: 7100015f     	cmp	w10, #0x0
 461f084: 9a884048     	csel	x8, x2, x8, mi
 461f088: f100011f     	cmp	x8, #0x0
 461f08c: 910083eb     	add	x11, sp, #0x20
 461f090: fa4b1124     	ccmp	x9, x11, #0x4, ne
 461f094: 54000100     	b.eq	0x461f0b4 <_ChromeMain+0x4619e18>
 461f098: 39e17e8b     	ldrsb	w11, [x20, #0x85f]
 461f09c: 37f828cb     	tbnz	w11, #0x1f, 0x461f5b4 <_ChromeMain+0x461a318>
 461f0a0: 37f8064a     	tbnz	w10, #0x1f, 0x461f168 <_ChromeMain+0x4619ecc>
 461f0a4: 3dc00be0     	ldr	q0, [sp, #0x20]
 461f0a8: 3d800120     	str	q0, [x9]
 461f0ac: f9401be8     	ldr	x8, [sp, #0x30]
 461f0b0: f9000928     	str	x8, [x9, #0x10]
 461f0b4: 395f2288     	ldrb	w8, [x20, #0x7c8]
 461f0b8: 34000388     	cbz	w8, 0x461f128 <_ChromeMain+0x4619e8c>
 461f0bc: 3940dfe8     	ldrb	w8, [sp, #0x37]
 461f0c0: f94017e9     	ldr	x9, [sp, #0x28]
 461f0c4: 7219011f     	tst	w8, #0x80
 461f0c8: 9a881128     	csel	x8, x9, x8, ne
 461f0cc: b40002e8     	cbz	x8, 0x461f128 <_ChromeMain+0x4619e8c>
 461f0d0: 910083e3     	add	x3, sp, #0x20
 461f0d4: aa1403e0     	mov	x0, x20
 461f0d8: 52800021     	mov	w1, #0x1                ; =1
 461f0dc: aa1503e2     	mov	x2, x21
 461f0e0: 52800004     	mov	w4, #0x0                ; =0
 461f0e4: 97fff2ca     	bl	0x461bc0c <_ChromeMain+0x4616970>
 461f0e8: 395f2288     	ldrb	w8, [x20, #0x7c8]
 461f0ec: 34ffe928     	cbz	w8, 0x461ee10 <_ChromeMain+0x4619b74>
 461f0f0: f942ee88     	ldr	x8, [x20, #0x5d8]
 461f0f4: b4ffe8e8     	cbz	x8, 0x461ee10 <_ChromeMain+0x4619b74>
 461f0f8: f9429e80     	ldr	x0, [x20, #0x538]
 461f0fc: f94002a8     	ldr	x8, [x21]
 461f100: f90023e8     	str	x8, [sp, #0x40]
 461f104: 910103e1     	add	x1, sp, #0x40
 461f108: 974343f6     	bl	0x16f00e0 <_ChromeMain+0x16eae44>
 461f10c: f943068b     	ldr	x11, [x20, #0x608]
 461f110: d37df168     	lsl	x8, x11, #3
 461f114: b4ffe7e8     	cbz	x8, 0x461ee10 <_ChromeMain+0x4619b74>
 461f118: 294823e9     	ldp	w9, w8, [sp, #0x40]
 461f11c: f943028a     	ldr	x10, [x20, #0x600]
 461f120: 8b0b0d4b     	add	x11, x10, x11, lsl #3
 461f124: 14000032     	b	0x461f1ec <_ChromeMain+0x4619f50>
 461f128: f90007ff     	str	xzr, [sp, #0x8]
 461f12c: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 461f130: f9002bff     	str	xzr, [sp, #0x50]
 461f134: 910023e2     	add	x2, sp, #0x8
 461f138: 910103e3     	add	x3, sp, #0x40
 461f13c: aa1403e0     	mov	x0, x20
 461f140: 52800001     	mov	w1, #0x0                ; =0
 461f144: 52800004     	mov	w4, #0x0                ; =0
 461f148: 97fff2b1     	bl	0x461bc0c <_ChromeMain+0x4616970>
 461f14c: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 461f150: 36fffcc8     	tbz	w8, #0x1f, 0x461f0e8 <_ChromeMain+0x4619e4c>
 461f154: f94023e0     	ldr	x0, [sp, #0x40]
 461f158: f9402be8     	ldr	x8, [sp, #0x50]
 461f15c: d37ff901     	lsl	x1, x8, #1
 461f160: 96e7a756     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f164: 17ffffe1     	b	0x461f0e8 <_ChromeMain+0x4619e4c>
 461f168: f94013e1     	ldr	x1, [sp, #0x20]
 461f16c: 91212280     	add	x0, x20, #0x848
 461f170: 970abd5f     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 461f174: 17ffffd0     	b	0x461f0b4 <_ChromeMain+0x4619e18>
 461f178: a9400801     	ldp	x1, x2, [x0]
 461f17c: 910083e0     	add	x0, sp, #0x20
 461f180: 970abd5b     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 461f184: 17ffffb6     	b	0x461f05c <_ChromeMain+0x4619dc0>
 461f188: aa0c03f6     	mov	x22, x12
 461f18c: 8b0d118c     	add	x12, x12, x13, lsl #4
 461f190: eb0c02df     	cmp	x22, x12
 461f194: 54000260     	b.eq	0x461f1e0 <_ChromeMain+0x4619f44>
 461f198: f94002cc     	ldr	x12, [x22]
 461f19c: eb0c02bf     	cmp	x21, x12
 461f1a0: 54000203     	b.lo	0x461f1e0 <_ChromeMain+0x4619f44>
 461f1a4: f94006cc     	ldr	x12, [x22, #0x8]
 461f1a8: b941b98d     	ldr	w13, [x12, #0x1b8]
 461f1ac: 6b0901bf     	cmp	w13, w9
 461f1b0: 5400018c     	b.gt	0x461f1e0 <_ChromeMain+0x4619f44>
 461f1b4: b941c18e     	ldr	w14, [x12, #0x1c0]
 461f1b8: 0b0d01cd     	add	w13, w14, w13
 461f1bc: 6b0901bf     	cmp	w13, w9
 461f1c0: 5400010d     	b.le	0x461f1e0 <_ChromeMain+0x4619f44>
 461f1c4: b941bd8d     	ldr	w13, [x12, #0x1bc]
 461f1c8: 6b0801bf     	cmp	w13, w8
 461f1cc: 540000ac     	b.gt	0x461f1e0 <_ChromeMain+0x4619f44>
 461f1d0: b941c58c     	ldr	w12, [x12, #0x1c4]
 461f1d4: 0b0d018c     	add	w12, w12, w13
 461f1d8: 6b08019f     	cmp	w12, w8
 461f1dc: 54000f2c     	b.gt	0x461f3c0 <_ChromeMain+0x461a124>
 461f1e0: 9100214a     	add	x10, x10, #0x8
 461f1e4: eb0b015f     	cmp	x10, x11
 461f1e8: 54ffe140     	b.eq	0x461ee10 <_ChromeMain+0x4619b74>
 461f1ec: f9400155     	ldr	x21, [x10]
 461f1f0: b4ffff95     	cbz	x21, 0x461f1e0 <_ChromeMain+0x4619f44>
 461f1f4: b940faac     	ldr	w12, [x21, #0xf8]
 461f1f8: 34ffff4c     	cbz	w12, 0x461f1e0 <_ChromeMain+0x4619f44>
 461f1fc: f942ea8c     	ldr	x12, [x20, #0x5d0]
 461f200: f942ee8d     	ldr	x13, [x20, #0x5d8]
 461f204: d37cedae     	lsl	x14, x13, #4
 461f208: b4fffc0e     	cbz	x14, 0x461f188 <_ChromeMain+0x4619eec>
 461f20c: 9344fdce     	asr	x14, x14, #4
 461f210: aa0c03f6     	mov	x22, x12
 461f214: d341fdcf     	lsr	x15, x14, #1
 461f218: 8b0f12d0     	add	x16, x22, x15, lsl #4
 461f21c: f8410611     	ldr	x17, [x16], #0x10
 461f220: aa6e07e0     	mvn	x0, x14, lsr #1
 461f224: 8b0001ce     	add	x14, x14, x0
 461f228: eb15023f     	cmp	x17, x21
 461f22c: 9a8f31ce     	csel	x14, x14, x15, lo
 461f230: 9a963216     	csel	x22, x16, x22, lo
 461f234: b5ffff0e     	cbnz	x14, 0x461f214 <_ChromeMain+0x4619f78>
 461f238: 17ffffd5     	b	0x461f18c <_ChromeMain+0x4619ef0>
 461f23c: f9005bff     	str	xzr, [sp, #0xb0]
 461f240: 6f00e400     	movi.2d	v0, #0000000000000000
 461f244: ad028320     	stp	q0, q0, [x25, #0x50]
 461f248: ad0383e0     	stp	q0, q0, [sp, #0x70]
 461f24c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461f250: 3d8013e0     	str	q0, [sp, #0x40]
 461f254: f9414ac8     	ldr	x8, [x22, #0x290]
 461f258: b5001ce8     	cbnz	x8, 0x461f5f4 <_ChromeMain+0x461a358>
 461f25c: f94132c8     	ldr	x8, [x22, #0x260]
 461f260: f9401d09     	ldr	x9, [x8, #0x38]
 461f264: d0ffd12a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 461f268: 913c814a     	add	x10, x10, #0xf20
 461f26c: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 461f270: eb0a013f     	cmp	x9, x10
 461f274: 54000d61     	b.ne	0x461f420 <_ChromeMain+0x461a184>
 461f278: 3100051f     	cmn	w8, #0x1
 461f27c: 54002300     	b.eq	0x461f6dc <_ChromeMain+0x461a440>
 461f280: f94142c9     	ldr	x9, [x22, #0x280]
 461f284: eb08013f     	cmp	x9, x8
 461f288: 54000d49     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f28c: f9413ec9     	ldr	x9, [x22, #0x278]
 461f290: f8687928     	ldr	x8, [x9, x8, lsl #3]
 461f294: b40021e8     	cbz	x8, 0x461f6d0 <_ChromeMain+0x461a434>
 461f298: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 461f29c: b7f82129     	tbnz	x9, #0x3f, 0x461f6c0 <_ChromeMain+0x461a424>
 461f2a0: b5002149     	cbnz	x9, 0x461f6c8 <_ChromeMain+0x461a42c>
 461f2a4: f9400d08     	ldr	x8, [x8, #0x18]
 461f2a8: f9400508     	ldr	x8, [x8, #0x8]
 461f2ac: 91018101     	add	x1, x8, #0x60
 461f2b0: 910103e0     	add	x0, sp, #0x40
 461f2b4: 96ec6b38     	bl	0x139f94 <_ChromeMain+0x134cf8>
 461f2b8: 394163e8     	ldrb	w8, [sp, #0x58]
 461f2bc: 37000288     	tbnz	w8, #0x0, 0x461f30c <_ChromeMain+0x461a070>
 461f2c0: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 461f2c4: 3100051f     	cmn	w8, #0x1
 461f2c8: 54002180     	b.eq	0x461f6f8 <_ChromeMain+0x461a45c>
 461f2cc: f94142c9     	ldr	x9, [x22, #0x280]
 461f2d0: eb08013f     	cmp	x9, x8
 461f2d4: 54000ae9     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f2d8: f9413ec9     	ldr	x9, [x22, #0x278]
 461f2dc: f8687928     	ldr	x8, [x9, x8, lsl #3]
 461f2e0: b4002128     	cbz	x8, 0x461f704 <_ChromeMain+0x461a468>
 461f2e4: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 461f2e8: b7f82009     	tbnz	x9, #0x3f, 0x461f6e8 <_ChromeMain+0x461a44c>
 461f2ec: b5002029     	cbnz	x9, 0x461f6f0 <_ChromeMain+0x461a454>
 461f2f0: f9400d08     	ldr	x8, [x8, #0x18]
 461f2f4: f9400508     	ldr	x8, [x8, #0x8]
 461f2f8: 91018101     	add	x1, x8, #0x60
 461f2fc: 910103e0     	add	x0, sp, #0x40
 461f300: 96fab183     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 461f304: 394163e8     	ldrb	w8, [sp, #0x58]
 461f308: 34000428     	cbz	w8, 0x461f38c <_ChromeMain+0x461a0f0>
 461f30c: b9407fe8     	ldr	w8, [sp, #0x7c]
 461f310: 7100051f     	cmp	w8, #0x1
 461f314: 5400014b     	b.lt	0x461f33c <_ChromeMain+0x461a0a0>
 461f318: 39415fea     	ldrb	w10, [sp, #0x57]
 461f31c: 13001d49     	sxtb	w9, w10
 461f320: f94027eb     	ldr	x11, [sp, #0x48]
 461f324: 7100013f     	cmp	w9, #0x0
 461f328: 9a8a416b     	csel	x11, x11, x10, mi
 461f32c: b9807bea     	ldrsw	x10, [sp, #0x78]
 461f330: eb0a016b     	subs	x11, x11, x10
 461f334: 54001ee3     	b.lo	0x461f710 <_ChromeMain+0x461a474>
 461f338: 540012e1     	b.ne	0x461f594 <_ChromeMain+0x461a2f8>
 461f33c: 910103e0     	add	x0, sp, #0x40
 461f340: 970135d2     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 461f344: 39805c08     	ldrsb	x8, [x0, #0x17]
 461f348: a9402809     	ldp	x9, x10, [x0]
 461f34c: f100011f     	cmp	x8, #0x0
 461f350: 9a804120     	csel	x0, x9, x0, mi
 461f354: 7100011f     	cmp	w8, #0x0
 461f358: 9a884141     	csel	x1, x10, x8, mi
 461f35c: 910023e8     	add	x8, sp, #0x8
 461f360: 970b0bec     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 461f364: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 461f368: 36f800a8     	tbz	w8, #0x1f, 0x461f37c <_ChromeMain+0x461a0e0>
 461f36c: f94013e0     	ldr	x0, [sp, #0x20]
 461f370: f9401be8     	ldr	x8, [sp, #0x30]
 461f374: d37ff901     	lsl	x1, x8, #1
 461f378: 96e7a6d0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f37c: 3cc083e0     	ldur	q0, [sp, #0x8]
 461f380: 3d800be0     	str	q0, [sp, #0x20]
 461f384: f9400fe8     	ldr	x8, [sp, #0x18]
 461f388: f9001be8     	str	x8, [sp, #0x30]
 461f38c: 910103f6     	add	x22, sp, #0x40
 461f390: 9101c2c0     	add	x0, x22, #0x70
 461f394: d2800001     	mov	x1, #0x0                ; =0
 461f398: 96e82248     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461f39c: 910082c0     	add	x0, x22, #0x20
 461f3a0: 96e82236     	bl	0x27c78 <_ChromeMain+0x229dc>
 461f3a4: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 461f3a8: 36ffe648     	tbz	w8, #0x1f, 0x461f070 <_ChromeMain+0x4619dd4>
 461f3ac: f94023e0     	ldr	x0, [sp, #0x40]
 461f3b0: f9402be8     	ldr	x8, [sp, #0x50]
 461f3b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461f3b8: 96e7a6c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f3bc: 17ffff2d     	b	0x461f070 <_ChromeMain+0x4619dd4>
 461f3c0: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 461f3c4: f9404709     	ldr	x9, [x24, #0x88]
 461f3c8: eb09011f     	cmp	x8, x9
 461f3cc: 54000061     	b.ne	0x461f3d8 <_ChromeMain+0x461a13c>
 461f3d0: aa1503e0     	mov	x0, x21
 461f3d4: 96e7d3ca     	bl	0x142fc <_ChromeMain+0xf060>
 461f3d8: f94002e0     	ldr	x0, [x23]
 461f3dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461f3e0: f9404709     	ldr	x9, [x24, #0x88]
 461f3e4: eb09011f     	cmp	x8, x9
 461f3e8: 54000041     	b.ne	0x461f3f0 <_ChromeMain+0x461a154>
 461f3ec: 96e80d94     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461f3f0: f903d695     	str	x21, [x20, #0x7a8]
 461f3f4: f94026a8     	ldr	x8, [x21, #0x48]
 461f3f8: f903da88     	str	x8, [x20, #0x7b0]
 461f3fc: 52800028     	mov	w8, #0x1                ; =1
 461f400: 391ee288     	strb	w8, [x20, #0x7b8]
 461f404: f94006c0     	ldr	x0, [x22, #0x8]
 461f408: b9445409     	ldr	w9, [x0, #0x454]
 461f40c: 7100053f     	cmp	w9, #0x1
 461f410: 54ffd000     	b.eq	0x461ee10 <_ChromeMain+0x4619b74>
 461f414: b9045408     	str	w8, [x0, #0x454]
 461f418: 96fe0759     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461f41c: 17fffe7d     	b	0x461ee10 <_ChromeMain+0x4619b74>
 461f420: 3100051f     	cmn	w8, #0x1
 461f424: 54fff2e1     	b.ne	0x461f280 <_ChromeMain+0x4619fe4>
 461f428: d4200000     	brk	#0
 461f42c: d4400000     	hlt	#0
 461f430: d4200020     	brk	#0x1
 461f434: 3100051f     	cmn	w8, #0x1
 461f438: 54000441     	b.ne	0x461f4c0 <_ChromeMain+0x461a224>
 461f43c: 140000cc     	b	0x461f76c <_ChromeMain+0x461a4d0>
 461f440: b942bac9     	ldr	w9, [x22, #0x2b8]
 461f444: 3100053f     	cmn	w9, #0x1
 461f448: 54001321     	b.ne	0x461f6ac <_ChromeMain+0x461a410>
 461f44c: 394d2109     	ldrb	w9, [x8, #0x348]
 461f450: 34000449     	cbz	w9, 0x461f4d8 <_ChromeMain+0x461a23c>
 461f454: 1400007f     	b	0x461f650 <_ChromeMain+0x461a3b4>
 461f458: f9408268     	ldr	x8, [x19, #0x100]
 461f45c: f9405e69     	ldr	x9, [x19, #0xb8]
 461f460: eb09011f     	cmp	x8, x9
 461f464: 54fffe62     	b.hs	0x461f430 <_ChromeMain+0x461a194>
 461f468: f9405a69     	ldr	x9, [x19, #0xb0]
 461f46c: 5280110a     	mov	w10, #0x88              ; =136
 461f470: 9b0a2508     	madd	x8, x8, x10, x9
 461f474: f9400916     	ldr	x22, [x8, #0x10]
 461f478: b4ffda16     	cbz	x22, 0x461efb8 <_ChromeMain+0x4619d1c>
 461f47c: f9005bff     	str	xzr, [sp, #0xb0]
 461f480: 6f00e400     	movi.2d	v0, #0000000000000000
 461f484: ad028320     	stp	q0, q0, [x25, #0x50]
 461f488: ad0383e0     	stp	q0, q0, [sp, #0x70]
 461f48c: ad0283e0     	stp	q0, q0, [sp, #0x50]
 461f490: 3d8013e0     	str	q0, [sp, #0x40]
 461f494: f9414ac8     	ldr	x8, [x22, #0x290]
 461f498: b5fffd48     	cbnz	x8, 0x461f440 <_ChromeMain+0x461a1a4>
 461f49c: f94132c8     	ldr	x8, [x22, #0x260]
 461f4a0: f9401d09     	ldr	x9, [x8, #0x38]
 461f4a4: d0ffd12a     	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 461f4a8: 913c814a     	add	x10, x10, #0xf20
 461f4ac: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 461f4b0: eb0a013f     	cmp	x9, x10
 461f4b4: 54fffc01     	b.ne	0x461f434 <_ChromeMain+0x461a198>
 461f4b8: 3100051f     	cmn	w8, #0x1
 461f4bc: 540013e0     	b.eq	0x461f738 <_ChromeMain+0x461a49c>
 461f4c0: f94142c9     	ldr	x9, [x22, #0x280]
 461f4c4: eb08013f     	cmp	x9, x8
 461f4c8: 54fffb49     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f4cc: f9413ec9     	ldr	x9, [x22, #0x278]
 461f4d0: f8687928     	ldr	x8, [x9, x8, lsl #3]
 461f4d4: b40012c8     	cbz	x8, 0x461f72c <_ChromeMain+0x461a490>
 461f4d8: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 461f4dc: b7f81209     	tbnz	x9, #0x3f, 0x461f71c <_ChromeMain+0x461a480>
 461f4e0: b5001229     	cbnz	x9, 0x461f724 <_ChromeMain+0x461a488>
 461f4e4: f9400d08     	ldr	x8, [x8, #0x18]
 461f4e8: f9400508     	ldr	x8, [x8, #0x8]
 461f4ec: 91018101     	add	x1, x8, #0x60
 461f4f0: 910103e0     	add	x0, sp, #0x40
 461f4f4: 96ec6aa8     	bl	0x139f94 <_ChromeMain+0x134cf8>
 461f4f8: 394163e8     	ldrb	w8, [sp, #0x58]
 461f4fc: 37000288     	tbnz	w8, #0x0, 0x461f54c <_ChromeMain+0x461a2b0>
 461f500: b982b6c8     	ldrsw	x8, [x22, #0x2b4]
 461f504: 3100051f     	cmn	w8, #0x1
 461f508: 54001260     	b.eq	0x461f754 <_ChromeMain+0x461a4b8>
 461f50c: f94142c9     	ldr	x9, [x22, #0x280]
 461f510: eb08013f     	cmp	x9, x8
 461f514: 54fff8e9     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f518: f9413ec9     	ldr	x9, [x22, #0x278]
 461f51c: f8687928     	ldr	x8, [x9, x8, lsl #3]
 461f520: b4001208     	cbz	x8, 0x461f760 <_ChromeMain+0x461a4c4>
 461f524: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 461f528: b7f810e9     	tbnz	x9, #0x3f, 0x461f744 <_ChromeMain+0x461a4a8>
 461f52c: b5001109     	cbnz	x9, 0x461f74c <_ChromeMain+0x461a4b0>
 461f530: f9400d08     	ldr	x8, [x8, #0x18]
 461f534: f9400508     	ldr	x8, [x8, #0x8]
 461f538: 91018101     	add	x1, x8, #0x60
 461f53c: 910103e0     	add	x0, sp, #0x40
 461f540: 96fab0f3     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 461f544: 394163e8     	ldrb	w8, [sp, #0x58]
 461f548: 340000c8     	cbz	w8, 0x461f560 <_ChromeMain+0x461a2c4>
 461f54c: 52800028     	mov	w8, #0x1                ; =1
 461f550: 391f2288     	strb	w8, [x20, #0x7c8]
 461f554: 911f4280     	add	x0, x20, #0x7d0
 461f558: 910103e1     	add	x1, sp, #0x40
 461f55c: 96fab0ec     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 461f560: 910103f6     	add	x22, sp, #0x40
 461f564: 9101c2c0     	add	x0, x22, #0x70
 461f568: d2800001     	mov	x1, #0x0                ; =0
 461f56c: 96e821d3     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461f570: 910082c0     	add	x0, x22, #0x20
 461f574: 96e821c1     	bl	0x27c78 <_ChromeMain+0x229dc>
 461f578: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 461f57c: 36ffd1e8     	tbz	w8, #0x1f, 0x461efb8 <_ChromeMain+0x4619d1c>
 461f580: f94023e0     	ldr	x0, [sp, #0x40]
 461f584: f9402be8     	ldr	x8, [sp, #0x50]
 461f588: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461f58c: 96e7a64b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f590: 17fffe8a     	b	0x461efb8 <_ChromeMain+0x4619d1c>
 461f594: eb08017f     	cmp	x11, x8
 461f598: 9a883161     	csel	x1, x11, x8, lo
 461f59c: f94023e8     	ldr	x8, [sp, #0x40]
 461f5a0: 7100013f     	cmp	w9, #0x0
 461f5a4: 910103e9     	add	x9, sp, #0x40
 461f5a8: 9a894108     	csel	x8, x8, x9, mi
 461f5ac: 8b0a0100     	add	x0, x8, x10
 461f5b0: 17ffff6b     	b	0x461f35c <_ChromeMain+0x461a0c0>
 461f5b4: f94013e9     	ldr	x9, [sp, #0x20]
 461f5b8: 7100015f     	cmp	w10, #0x0
 461f5bc: 910083ea     	add	x10, sp, #0x20
 461f5c0: 9a8a4121     	csel	x1, x9, x10, mi
 461f5c4: 91212280     	add	x0, x20, #0x848
 461f5c8: aa0803e2     	mov	x2, x8
 461f5cc: 970abc9a     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 461f5d0: 17fffeb9     	b	0x461f0b4 <_ChromeMain+0x4619e18>
 461f5d4: 13001d09     	sxtb	w9, w8
 461f5d8: 7100013f     	cmp	w9, #0x0
 461f5dc: a9402809     	ldp	x9, x10, [x0]
 461f5e0: 9a804121     	csel	x1, x9, x0, mi
 461f5e4: 9a884142     	csel	x2, x10, x8, mi
 461f5e8: 910083e0     	add	x0, sp, #0x20
 461f5ec: 970abc92     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 461f5f0: 17fffe9b     	b	0x461f05c <_ChromeMain+0x4619dc0>
 461f5f4: b942bac9     	ldr	w9, [x22, #0x2b8]
 461f5f8: 3100053f     	cmn	w9, #0x1
 461f5fc: 540004e1     	b.ne	0x461f698 <_ChromeMain+0x461a3fc>
 461f600: 394d2109     	ldrb	w9, [x8, #0x348]
 461f604: 34ffe4a9     	cbz	w9, 0x461f298 <_ChromeMain+0x4619ffc>
 461f608: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 461f60c: 34ffe289     	cbz	w9, 0x461f25c <_ChromeMain+0x4619fc0>
 461f610: b982b6c9     	ldrsw	x9, [x22, #0x2b4]
 461f614: 3100053f     	cmn	w9, #0x1
 461f618: 54000b00     	b.eq	0x461f778 <_ChromeMain+0x461a4dc>
 461f61c: f94142ca     	ldr	x10, [x22, #0x280]
 461f620: eb09015f     	cmp	x10, x9
 461f624: 54fff069     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f628: f9413eca     	ldr	x10, [x22, #0x278]
 461f62c: f8697949     	ldr	x9, [x10, x9, lsl #3]
 461f630: b9443129     	ldr	w9, [x9, #0x430]
 461f634: 7100093f     	cmp	w9, #0x2
 461f638: 54ffe120     	b.eq	0x461f25c <_ChromeMain+0x4619fc0>
 461f63c: f94136c9     	ldr	x9, [x22, #0x268]
 461f640: b4000a29     	cbz	x9, 0x461f784 <_ChromeMain+0x461a4e8>
 461f644: 39458129     	ldrb	w9, [x9, #0x160]
 461f648: 3707e0a9     	tbnz	w9, #0x0, 0x461f25c <_ChromeMain+0x4619fc0>
 461f64c: 17ffff13     	b	0x461f298 <_ChromeMain+0x4619ffc>
 461f650: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 461f654: 34fff249     	cbz	w9, 0x461f49c <_ChromeMain+0x461a200>
 461f658: b982b6c9     	ldrsw	x9, [x22, #0x2b4]
 461f65c: 3100053f     	cmn	w9, #0x1
 461f660: 54000980     	b.eq	0x461f790 <_ChromeMain+0x461a4f4>
 461f664: f94142ca     	ldr	x10, [x22, #0x280]
 461f668: eb09015f     	cmp	x10, x9
 461f66c: 54ffee29     	b.ls	0x461f430 <_ChromeMain+0x461a194>
 461f670: f9413eca     	ldr	x10, [x22, #0x278]
 461f674: f8697949     	ldr	x9, [x10, x9, lsl #3]
 461f678: b9443129     	ldr	w9, [x9, #0x430]
 461f67c: 7100093f     	cmp	w9, #0x2
 461f680: 54fff0e0     	b.eq	0x461f49c <_ChromeMain+0x461a200>
 461f684: f94136c9     	ldr	x9, [x22, #0x268]
 461f688: b40008a9     	cbz	x9, 0x461f79c <_ChromeMain+0x461a500>
 461f68c: 39458129     	ldrb	w9, [x9, #0x160]
 461f690: 3707f069     	tbnz	w9, #0x0, 0x461f49c <_ChromeMain+0x461a200>
 461f694: 17ffff91     	b	0x461f4d8 <_ChromeMain+0x461a23c>
 461f698: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 461f69c: 34ffde09     	cbz	w9, 0x461f25c <_ChromeMain+0x4619fc0>
 461f6a0: 394d2109     	ldrb	w9, [x8, #0x348]
 461f6a4: 35ffddc9     	cbnz	w9, 0x461f25c <_ChromeMain+0x4619fc0>
 461f6a8: 17fffefc     	b	0x461f298 <_ChromeMain+0x4619ffc>
 461f6ac: 394ba2c9     	ldrb	w9, [x22, #0x2e8]
 461f6b0: 34ffef69     	cbz	w9, 0x461f49c <_ChromeMain+0x461a200>
 461f6b4: 394d2109     	ldrb	w9, [x8, #0x348]
 461f6b8: 35ffef29     	cbnz	w9, 0x461f49c <_ChromeMain+0x461a200>
 461f6bc: 17ffff87     	b	0x461f4d8 <_ChromeMain+0x461a23c>
 461f6c0: f9401909     	ldr	x9, [x8, #0x30]
 461f6c4: b4ffdf09     	cbz	x9, 0x461f2a4 <_ChromeMain+0x461a008>
 461f6c8: 9100a101     	add	x1, x8, #0x28
 461f6cc: 17fffef9     	b	0x461f2b0 <_ChromeMain+0x461a014>
 461f6d0: 97d12cea     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 461f6d4: aa0003e1     	mov	x1, x0
 461f6d8: 17fffef6     	b	0x461f2b0 <_ChromeMain+0x461a014>
 461f6dc: d4200000     	brk	#0
 461f6e0: d4400000     	hlt	#0
 461f6e4: d4200020     	brk	#0x1
 461f6e8: f9401909     	ldr	x9, [x8, #0x30]
 461f6ec: b4ffe029     	cbz	x9, 0x461f2f0 <_ChromeMain+0x461a054>
 461f6f0: 9100a101     	add	x1, x8, #0x28
 461f6f4: 17ffff02     	b	0x461f2fc <_ChromeMain+0x461a060>
 461f6f8: d4200000     	brk	#0
 461f6fc: d4400000     	hlt	#0
 461f700: d4200020     	brk	#0x1
 461f704: 97d12cdd     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 461f708: aa0003e1     	mov	x1, x0
 461f70c: 17fffefc     	b	0x461f2fc <_ChromeMain+0x461a060>
 461f710: b0048e20     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 461f714: 91376000     	add	x0, x0, #0xdd8
 461f718: 941782ef     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 461f71c: f9401909     	ldr	x9, [x8, #0x30]
 461f720: b4ffee29     	cbz	x9, 0x461f4e4 <_ChromeMain+0x461a248>
 461f724: 9100a101     	add	x1, x8, #0x28
 461f728: 17ffff72     	b	0x461f4f0 <_ChromeMain+0x461a254>
 461f72c: 97d12cd3     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 461f730: aa0003e1     	mov	x1, x0
 461f734: 17ffff6f     	b	0x461f4f0 <_ChromeMain+0x461a254>
 461f738: d4200000     	brk	#0
 461f73c: d4400000     	hlt	#0
 461f740: d4200020     	brk	#0x1
 461f744: f9401909     	ldr	x9, [x8, #0x30]
 461f748: b4ffef49     	cbz	x9, 0x461f530 <_ChromeMain+0x461a294>
 461f74c: 9100a101     	add	x1, x8, #0x28
 461f750: 17ffff7b     	b	0x461f53c <_ChromeMain+0x461a2a0>
 461f754: d4200000     	brk	#0
 461f758: d4400000     	hlt	#0
 461f75c: d4200020     	brk	#0x1
 461f760: 97d12cc6     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 461f764: aa0003e1     	mov	x1, x0
 461f768: 17ffff75     	b	0x461f53c <_ChromeMain+0x461a2a0>
 461f76c: d4200000     	brk	#0
 461f770: d4400000     	hlt	#0
 461f774: d4200020     	brk	#0x1
 461f778: d4200000     	brk	#0
 461f77c: d4400000     	hlt	#0
 461f780: d4200020     	brk	#0x1
 461f784: d4200000     	brk	#0
 461f788: d4400000     	hlt	#0
 461f78c: d4200020     	brk	#0x1
 461f790: d4200000     	brk	#0
 461f794: d4400000     	hlt	#0
 461f798: d4200020     	brk	#0x1
 461f79c: d4200000     	brk	#0
 461f7a0: d4400000     	hlt	#0
 461f7a4: d4200020     	brk	#0x1
 461f7a8: d113e000     	sub	x0, x0, #0x4f8
 461f7ac: 17fffd85     	b	0x461edc0 <_ChromeMain+0x4619b24>
		...
 461f7c0: 395f2408     	ldrb	w8, [x0, #0x7c9]
 461f7c4: 37000068     	tbnz	w8, #0x0, 0x461f7d0 <_ChromeMain+0x461a534>
 461f7c8: 395f2008     	ldrb	w8, [x0, #0x7c8]
 461f7cc: 14000002     	b	0x461f7d4 <_ChromeMain+0x461a538>
 461f7d0: 52800008     	mov	w8, #0x0                ; =0
 461f7d4: 12000100     	and	w0, w8, #0x1
 461f7d8: d65f03c0     	ret
 461f7dc: 394b4408     	ldrb	w8, [x0, #0x2d1]
 461f7e0: 37000068     	tbnz	w8, #0x0, 0x461f7ec <_ChromeMain+0x461a550>
 461f7e4: 394b4008     	ldrb	w8, [x0, #0x2d0]
 461f7e8: 14000002     	b	0x461f7f0 <_ChromeMain+0x461a554>
 461f7ec: 52800008     	mov	w8, #0x0                ; =0
 461f7f0: 12000100     	and	w0, w8, #0x1
 461f7f4: d65f03c0     	ret
 461f7f8: 395f2408     	ldrb	w8, [x0, #0x7c9]
 461f7fc: 370013c8     	tbnz	w8, #0x0, 0x461fa74 <_ChromeMain+0x461a7d8>
 461f800: d10683ff     	sub	sp, sp, #0x1a0
 461f804: a91567fa     	stp	x26, x25, [sp, #0x150]
 461f808: a9165ff8     	stp	x24, x23, [sp, #0x160]
 461f80c: a91757f6     	stp	x22, x21, [sp, #0x170]
 461f810: a9184ff4     	stp	x20, x19, [sp, #0x180]
 461f814: a9197bfd     	stp	x29, x30, [sp, #0x190]
 461f818: 910643fd     	add	x29, sp, #0x190
 461f81c: aa0003f3     	mov	x19, x0
 461f820: 395f2016     	ldrb	w22, [x0, #0x7c8]
 461f824: f81b03bf     	stur	xzr, [x29, #-0x50]
 461f828: 6f00e400     	movi.2d	v0, #0000000000000000
 461f82c: ad3c83a0     	stp	q0, q0, [x29, #-0x70]
 461f830: ad3b83a0     	stp	q0, q0, [x29, #-0x90]
 461f834: ad3a83a0     	stp	q0, q0, [x29, #-0xb0]
 461f838: 3c9403a0     	stur	q0, [x29, #-0xc0]
 461f83c: d10303a0     	sub	x0, x29, #0xc0
 461f840: 911f4261     	add	x1, x19, #0x7d0
 461f844: 96ec69d4     	bl	0x139f94 <_ChromeMain+0x134cf8>
 461f848: a90b7fff     	stp	xzr, xzr, [sp, #0xb0]
 461f84c: f90063ff     	str	xzr, [sp, #0xc0]
 461f850: 39e17e68     	ldrsb	w8, [x19, #0x85f]
 461f854: 37f80768     	tbnz	w8, #0x1f, 0x461f940 <_ChromeMain+0x461a6a4>
 461f858: 91212268     	add	x8, x19, #0x848
 461f85c: 3dc00100     	ldr	q0, [x8]
 461f860: 3d802fe0     	str	q0, [sp, #0xb0]
 461f864: f9400908     	ldr	x8, [x8, #0x10]
 461f868: f90063e8     	str	x8, [sp, #0xc0]
 461f86c: f943d675     	ldr	x21, [x19, #0x7a8]
 461f870: f943da74     	ldr	x20, [x19, #0x7b0]
 461f874: 395ee277     	ldrb	w23, [x19, #0x7b8]
 461f878: 391f227f     	strb	wzr, [x19, #0x7c8]
 461f87c: 9100e3f8     	add	x24, sp, #0x38
 461f880: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 461f884: b804f3ff     	stur	wzr, [sp, #0x4f]
 461f888: f90027ff     	str	xzr, [sp, #0x48]
 461f88c: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 461f890: 3c8583e0     	stur	q0, [sp, #0x58]
 461f894: 3c8683e0     	stur	q0, [sp, #0x68]
 461f898: 3c8783e0     	stur	q0, [sp, #0x78]
 461f89c: 3c8883e0     	stur	q0, [sp, #0x88]
 461f8a0: 790133ff     	strh	wzr, [sp, #0x98]
 461f8a4: a90a7fff     	stp	xzr, xzr, [sp, #0xa0]
 461f8a8: 911f4260     	add	x0, x19, #0x7d0
 461f8ac: 9100e3e1     	add	x1, sp, #0x38
 461f8b0: 96ff688c     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 461f8b4: 9101c300     	add	x0, x24, #0x70
 461f8b8: d2800001     	mov	x1, #0x0                ; =0
 461f8bc: 96e820ff     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461f8c0: 91008300     	add	x0, x24, #0x20
 461f8c4: 96e820ed     	bl	0x27c78 <_ChromeMain+0x229dc>
 461f8c8: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 461f8cc: 36f800a8     	tbz	w8, #0x1f, 0x461f8e0 <_ChromeMain+0x461a644>
 461f8d0: f9401fe0     	ldr	x0, [sp, #0x38]
 461f8d4: f94027e8     	ldr	x8, [sp, #0x48]
 461f8d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461f8dc: 96e7a577     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f8e0: 911ea278     	add	x24, x19, #0x7a8
 461f8e4: 39e17e68     	ldrsb	w8, [x19, #0x85f]
 461f8e8: 37f80248     	tbnz	w8, #0x1f, 0x461f930 <_ChromeMain+0x461a694>
 461f8ec: 7910927f     	strh	wzr, [x19, #0x848]
 461f8f0: 39217e7f     	strb	wzr, [x19, #0x85f]
 461f8f4: f9400300     	ldr	x0, [x24]
 461f8f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 461f8fc: f0052c89     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 461f900: f9404529     	ldr	x9, [x9, #0x88]
 461f904: eb09011f     	cmp	x8, x9
 461f908: 54000041     	b.ne	0x461f910 <_ChromeMain+0x461a674>
 461f90c: 96e80c4c     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 461f910: a9007f1f     	stp	xzr, xzr, [x24]
 461f914: 3900431f     	strb	wzr, [x24, #0x10]
 461f918: f942ee68     	ldr	x8, [x19, #0x5d8]
 461f91c: d37ced18     	lsl	x24, x8, #4
 461f920: b40002b8     	cbz	x24, 0x461f974 <_ChromeMain+0x461a6d8>
 461f924: f942ea68     	ldr	x8, [x19, #0x5d0]
 461f928: 91002119     	add	x25, x8, #0x8
 461f92c: 1400000e     	b	0x461f964 <_ChromeMain+0x461a6c8>
 461f930: f9442668     	ldr	x8, [x19, #0x848]
 461f934: 7900011f     	strh	wzr, [x8]
 461f938: f9042a7f     	str	xzr, [x19, #0x850]
 461f93c: 17ffffee     	b	0x461f8f4 <_ChromeMain+0x461a658>
 461f940: f9442661     	ldr	x1, [x19, #0x848]
 461f944: f9442a62     	ldr	x2, [x19, #0x850]
 461f948: 9102c3e0     	add	x0, sp, #0xb0
 461f94c: 96e89ca1     	bl	0x46bd0 <_ChromeMain+0x41934>
 461f950: 17ffffc7     	b	0x461f86c <_ChromeMain+0x461a5d0>
 461f954: b904541f     	str	wzr, [x0, #0x454]
 461f958: 96fe0609     	bl	0x5a117c <_ChromeMain+0x59bee0>
 461f95c: f1004318     	subs	x24, x24, #0x10
 461f960: 540000a0     	b.eq	0x461f974 <_ChromeMain+0x461a6d8>
 461f964: f8410720     	ldr	x0, [x25], #0x10
 461f968: b9445408     	ldr	w8, [x0, #0x454]
 461f96c: 34ffff88     	cbz	w8, 0x461f95c <_ChromeMain+0x461a6c0>
 461f970: 17fffff9     	b	0x461f954 <_ChromeMain+0x461a6b8>
 461f974: f81b83bf     	stur	xzr, [x29, #-0x48]
 461f978: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 461f97c: f90027ff     	str	xzr, [sp, #0x48]
 461f980: d10123a2     	sub	x2, x29, #0x48
 461f984: 9100e3e3     	add	x3, sp, #0x38
 461f988: aa1303e0     	mov	x0, x19
 461f98c: 52800001     	mov	w1, #0x0                ; =0
 461f990: 52800004     	mov	w4, #0x0                ; =0
 461f994: 97fff09e     	bl	0x461bc0c <_ChromeMain+0x4616970>
 461f998: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 461f99c: 36f800a8     	tbz	w8, #0x1f, 0x461f9b0 <_ChromeMain+0x461a714>
 461f9a0: f9401fe0     	ldr	x0, [sp, #0x38]
 461f9a4: f94027e8     	ldr	x8, [sp, #0x48]
 461f9a8: d37ff901     	lsl	x1, x8, #1
 461f9ac: 96e7a543     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461f9b0: 34000336     	cbz	w22, 0x461fa14 <_ChromeMain+0x461a778>
 461f9b4: 385583a8     	ldurb	w8, [x29, #-0xa8]
 461f9b8: 360002e8     	tbz	w8, #0x0, 0x461fa14 <_ChromeMain+0x461a778>
 461f9bc: b40005f5     	cbz	x21, 0x461fa78 <_ChromeMain+0x461a7dc>
 461f9c0: 340005d7     	cbz	w23, 0x461fa78 <_ChromeMain+0x461a7dc>
 461f9c4: 3dc02fe0     	ldr	q0, [sp, #0xb0]
 461f9c8: 3d800be0     	str	q0, [sp, #0x20]
 461f9cc: f94063e8     	ldr	x8, [sp, #0xc0]
 461f9d0: f9001be8     	str	x8, [sp, #0x30]
 461f9d4: a90bffff     	stp	xzr, xzr, [sp, #0xb8]
 461f9d8: f9005bff     	str	xzr, [sp, #0xb0]
 461f9dc: 910083f6     	add	x22, sp, #0x20
 461f9e0: d10303a1     	sub	x1, x29, #0xc0
 461f9e4: 910083e2     	add	x2, sp, #0x20
 461f9e8: aa1303e0     	mov	x0, x19
 461f9ec: aa1503e3     	mov	x3, x21
 461f9f0: aa1403e4     	mov	x4, x20
 461f9f4: 52800025     	mov	w5, #0x1                ; =1
 461f9f8: 97ffce57     	bl	0x4613354 <_ChromeMain+0x460e0b8>
 461f9fc: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 461fa00: 36f800a8     	tbz	w8, #0x1f, 0x461fa14 <_ChromeMain+0x461a778>
 461fa04: f94002c0     	ldr	x0, [x22]
 461fa08: f9400ac8     	ldr	x8, [x22, #0x10]
 461fa0c: d37ff901     	lsl	x1, x8, #1
 461fa10: 96e7a52a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461fa14: 39c31fe8     	ldrsb	w8, [sp, #0xc7]
 461fa18: 36f800a8     	tbz	w8, #0x1f, 0x461fa2c <_ChromeMain+0x461a790>
 461fa1c: f9405be0     	ldr	x0, [sp, #0xb0]
 461fa20: f94063e8     	ldr	x8, [sp, #0xc0]
 461fa24: d37ff901     	lsl	x1, x8, #1
 461fa28: 96e7a524     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461fa2c: d10303b3     	sub	x19, x29, #0xc0
 461fa30: 9101c260     	add	x0, x19, #0x70
 461fa34: d2800001     	mov	x1, #0x0                ; =0
 461fa38: 96e820a0     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 461fa3c: 91008260     	add	x0, x19, #0x20
 461fa40: 96e8208e     	bl	0x27c78 <_ChromeMain+0x229dc>
 461fa44: 38d573a8     	ldursb	w8, [x29, #-0xa9]
 461fa48: 36f800a8     	tbz	w8, #0x1f, 0x461fa5c <_ChromeMain+0x461a7c0>
 461fa4c: f85403a0     	ldur	x0, [x29, #-0xc0]
 461fa50: f85503a8     	ldur	x8, [x29, #-0xb0]
 461fa54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 461fa58: 96e7a518     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461fa5c: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 461fa60: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 461fa64: a95757f6     	ldp	x22, x21, [sp, #0x170]
 461fa68: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 461fa6c: a95567fa     	ldp	x26, x25, [sp, #0x150]
 461fa70: 910683ff     	add	sp, sp, #0x1a0
 461fa74: d65f03c0     	ret
 461fa78: 3dc02fe0     	ldr	q0, [sp, #0xb0]
 461fa7c: 3d8003e0     	str	q0, [sp]
 461fa80: f94063e8     	ldr	x8, [sp, #0xc0]
 461fa84: f9000be8     	str	x8, [sp, #0x10]
 461fa88: a90bffff     	stp	xzr, xzr, [sp, #0xb8]
 461fa8c: f9005bff     	str	xzr, [sp, #0xb0]
 461fa90: 910003f6     	mov	x22, sp
 461fa94: d10303a1     	sub	x1, x29, #0xc0
 461fa98: 910003e2     	mov	x2, sp
 461fa9c: aa1303e0     	mov	x0, x19
 461faa0: d2800003     	mov	x3, #0x0                ; =0
 461faa4: d2800004     	mov	x4, #0x0                ; =0
 461faa8: d2800005     	mov	x5, #0x0                ; =0
 461faac: 97ffce2a     	bl	0x4613354 <_ChromeMain+0x460e0b8>
 461fab0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 461fab4: 36fffb08     	tbz	w8, #0x1f, 0x461fa14 <_ChromeMain+0x461a778>
 461fab8: 17ffffd3     	b	0x461fa04 <_ChromeMain+0x461a768>
 461fabc: d113e000     	sub	x0, x0, #0x4f8
 461fac0: 17ffff4e     	b	0x461f7f8 <_ChromeMain+0x461a55c>
 461fac4: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461fac8: a90157f6     	stp	x22, x21, [sp, #0x10]
 461facc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461fad0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461fad4: 9100c3fd     	add	x29, sp, #0x30
 461fad8: aa0103f4     	mov	x20, x1
 461fadc: aa0803f3     	mov	x19, x8
 461fae0: 395f2408     	ldrb	w8, [x0, #0x7c9]
 461fae4: 360001c8     	tbz	w8, #0x0, 0x461fb1c <_ChromeMain+0x461a880>
 461fae8: f900027f     	str	xzr, [x19]
 461faec: b40006d4     	cbz	x20, 0x461fbc4 <_ChromeMain+0x461a928>
 461faf0: 12800008     	mov	w8, #-0x1               ; =-1
 461faf4: b8e80288     	ldaddal	w8, w8, [x20]
 461faf8: 7100051f     	cmp	w8, #0x1
 461fafc: 54000641     	b.ne	0x461fbc4 <_ChromeMain+0x461a928>
 461fb00: f9400a81     	ldr	x1, [x20, #0x10]
 461fb04: aa1403e0     	mov	x0, x20
 461fb08: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461fb0c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461fb10: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461fb14: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461fb18: d61f0020     	br	x1
 461fb1c: aa0003f5     	mov	x21, x0
 461fb20: f944f817     	ldr	x23, [x0, #0x9f0]
 461fb24: b40000d7     	cbz	x23, 0x461fb3c <_ChromeMain+0x461a8a0>
 461fb28: 52800028     	mov	w8, #0x1                ; =1
 461fb2c: b82802e8     	ldadd	w8, w8, [x23]
 461fb30: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461fb34: 6b09011f     	cmp	w8, w9
 461fb38: 54000500     	b.eq	0x461fbd8 <_ChromeMain+0x461a93c>
 461fb3c: f944feb8     	ldr	x24, [x21, #0x9f8]
 461fb40: 52800300     	mov	w0, #0x18               ; =24
 461fb44: 96e7be09     	bl	0xf368 <_ChromeMain+0xa0cc>
 461fb48: b40004c0     	cbz	x0, 0x461fbe0 <_ChromeMain+0x461a944>
 461fb4c: aa0003f6     	mov	x22, x0
 461fb50: b100401f     	cmn	x0, #0x10
 461fb54: 54000460     	b.eq	0x461fbe0 <_ChromeMain+0x461a944>
 461fb58: 912722a8     	add	x8, x21, #0x9c8
 461fb5c: f9000ad4     	str	x20, [x22, #0x10]
 461fb60: f944e6a9     	ldr	x9, [x21, #0x9c8]
 461fb64: f9000536     	str	x22, [x9, #0x8]
 461fb68: f944e6a9     	ldr	x9, [x21, #0x9c8]
 461fb6c: f904e6b6     	str	x22, [x21, #0x9c8]
 461fb70: a90022c9     	stp	x9, x8, [x22]
 461fb74: f944eea8     	ldr	x8, [x21, #0x9d8]
 461fb78: 91000508     	add	x8, x8, #0x1
 461fb7c: f904eea8     	str	x8, [x21, #0x9d8]
 461fb80: 52800900     	mov	w0, #0x48               ; =72
 461fb84: 96e7bdf9     	bl	0xf368 <_ChromeMain+0xa0cc>
 461fb88: 52800028     	mov	w8, #0x1                ; =1
 461fb8c: b9000008     	str	w8, [x0]
 461fb90: f0febb68     	adrp	x8, 0x1d8e000 <_ChromeMain+0x1d88d64>
 461fb94: 91224108     	add	x8, x8, #0x890
 461fb98: 90ff9549     	adrp	x9, 0x38c7000 <_ChromeMain+0x38c1d64>
 461fb9c: 91240129     	add	x9, x9, #0x900
 461fba0: a900a408     	stp	x8, x9, [x0, #0x8]
 461fba4: 90003fe8     	adrp	x8, 0x4e1b000 <_ChromeMain+0x4e15d64>
 461fba8: 91370108     	add	x8, x8, #0xdc0
 461fbac: f0febb69     	adrp	x9, 0x1d8e000 <_ChromeMain+0x1d88d64>
 461fbb0: 9123c129     	add	x9, x9, #0x8f0
 461fbb4: a901a408     	stp	x8, x9, [x0, #0x18]
 461fbb8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 461fbbc: a903d818     	stp	x24, x22, [x0, #0x38]
 461fbc0: f9000260     	str	x0, [x19]
 461fbc4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461fbc8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461fbcc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461fbd0: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461fbd4: d65f03c0     	ret
 461fbd8: d4200000     	brk	#0
 461fbdc: d4400000     	hlt	#0
 461fbe0: d4200020     	brk	#0x1
 461fbe4: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 461fbe8: a90157f6     	stp	x22, x21, [sp, #0x10]
 461fbec: a9024ff4     	stp	x20, x19, [sp, #0x20]
 461fbf0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461fbf4: 9100c3fd     	add	x29, sp, #0x30
 461fbf8: aa0103f4     	mov	x20, x1
 461fbfc: aa0803f3     	mov	x19, x8
 461fc00: 394b4408     	ldrb	w8, [x0, #0x2d1]
 461fc04: 360001c8     	tbz	w8, #0x0, 0x461fc3c <_ChromeMain+0x461a9a0>
 461fc08: f900027f     	str	xzr, [x19]
 461fc0c: b40006d4     	cbz	x20, 0x461fce4 <_ChromeMain+0x461aa48>
 461fc10: 12800008     	mov	w8, #-0x1               ; =-1
 461fc14: b8e80288     	ldaddal	w8, w8, [x20]
 461fc18: 7100051f     	cmp	w8, #0x1
 461fc1c: 54000641     	b.ne	0x461fce4 <_ChromeMain+0x461aa48>
 461fc20: f9400a81     	ldr	x1, [x20, #0x10]
 461fc24: aa1403e0     	mov	x0, x20
 461fc28: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461fc2c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461fc30: a94157f6     	ldp	x22, x21, [sp, #0x10]
 461fc34: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 461fc38: d61f0020     	br	x1
 461fc3c: aa0003f5     	mov	x21, x0
 461fc40: f9427c17     	ldr	x23, [x0, #0x4f8]
 461fc44: b40000d7     	cbz	x23, 0x461fc5c <_ChromeMain+0x461a9c0>
 461fc48: 52800028     	mov	w8, #0x1                ; =1
 461fc4c: b82802e8     	ldadd	w8, w8, [x23]
 461fc50: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 461fc54: 6b09011f     	cmp	w8, w9
 461fc58: 54000500     	b.eq	0x461fcf8 <_ChromeMain+0x461aa5c>
 461fc5c: f94282b8     	ldr	x24, [x21, #0x500]
 461fc60: 52800300     	mov	w0, #0x18               ; =24
 461fc64: 96e7bdc1     	bl	0xf368 <_ChromeMain+0xa0cc>
 461fc68: b40004c0     	cbz	x0, 0x461fd00 <_ChromeMain+0x461aa64>
 461fc6c: aa0003f6     	mov	x22, x0
 461fc70: b100401f     	cmn	x0, #0x10
 461fc74: 54000460     	b.eq	0x461fd00 <_ChromeMain+0x461aa64>
 461fc78: 911342a8     	add	x8, x21, #0x4d0
 461fc7c: f9000ad4     	str	x20, [x22, #0x10]
 461fc80: f9426aa9     	ldr	x9, [x21, #0x4d0]
 461fc84: f9000536     	str	x22, [x9, #0x8]
 461fc88: f9426aa9     	ldr	x9, [x21, #0x4d0]
 461fc8c: f9026ab6     	str	x22, [x21, #0x4d0]
 461fc90: a90022c9     	stp	x9, x8, [x22]
 461fc94: f94272a8     	ldr	x8, [x21, #0x4e0]
 461fc98: 91000508     	add	x8, x8, #0x1
 461fc9c: f90272a8     	str	x8, [x21, #0x4e0]
 461fca0: 52800900     	mov	w0, #0x48               ; =72
 461fca4: 96e7bdb1     	bl	0xf368 <_ChromeMain+0xa0cc>
 461fca8: 52800028     	mov	w8, #0x1                ; =1
 461fcac: b9000008     	str	w8, [x0]
 461fcb0: f0febb68     	adrp	x8, 0x1d8e000 <_ChromeMain+0x1d88d64>
 461fcb4: 91224108     	add	x8, x8, #0x890
 461fcb8: 90ff9549     	adrp	x9, 0x38c7000 <_ChromeMain+0x38c1d64>
 461fcbc: 91240129     	add	x9, x9, #0x900
 461fcc0: a900a408     	stp	x8, x9, [x0, #0x8]
 461fcc4: 90003fe8     	adrp	x8, 0x4e1b000 <_ChromeMain+0x4e15d64>
 461fcc8: 91370108     	add	x8, x8, #0xdc0
 461fccc: f0febb69     	adrp	x9, 0x1d8e000 <_ChromeMain+0x1d88d64>
 461fcd0: 9123c129     	add	x9, x9, #0x8f0
 461fcd4: a901a408     	stp	x8, x9, [x0, #0x18]
 461fcd8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 461fcdc: a903d818     	stp	x24, x22, [x0, #0x38]
 461fce0: f9000260     	str	x0, [x19]
 461fce4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 461fce8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 461fcec: a94157f6     	ldp	x22, x21, [sp, #0x10]
