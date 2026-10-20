
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4267a88: d10383ff     	sub	sp, sp, #0xe0
 4267a8c: a90967fa     	stp	x26, x25, [sp, #0x90]
 4267a90: a90a5ff8     	stp	x24, x23, [sp, #0xa0]
 4267a94: a90b57f6     	stp	x22, x21, [sp, #0xb0]
 4267a98: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 4267a9c: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 4267aa0: 910343fd     	add	x29, sp, #0xd0
 4267aa4: aa0203f6     	mov	x22, x2
 4267aa8: aa0103f5     	mov	x21, x1
 4267aac: aa0003f4     	mov	x20, x0
 4267ab0: aa0803f3     	mov	x19, x8
 4267ab4: a93a7fbf     	stp	xzr, xzr, [x29, #-0x60]
 4267ab8: f81b03bf     	stur	xzr, [x29, #-0x50]
 4267abc: 39c05c28     	ldrsb	w8, [x1, #0x17]
 4267ac0: 37f80ec8     	tbnz	w8, #0x1f, 0x4267c98 <_ChromeMain+0x42629fc>
 4267ac4: 3dc002a0     	ldr	q0, [x21]
 4267ac8: 3c9a03a0     	stur	q0, [x29, #-0x60]
 4267acc: f9400aa8     	ldr	x8, [x21, #0x10]
 4267ad0: f81b03a8     	stur	x8, [x29, #-0x50]
 4267ad4: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 4267ad8: f90033ff     	str	xzr, [sp, #0x60]
 4267adc: b4000536     	cbz	x22, 0x4267b80 <_ChromeMain+0x42628e4>
 4267ae0: f004ac41     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 4267ae4: 9138dc21     	add	x1, x1, #0xe37
 4267ae8: aa1603e0     	mov	x0, x22
 4267aec: 52800082     	mov	w2, #0x4                ; =4
 4267af0: 977707e4     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4267af4: b40001e0     	cbz	x0, 0x4267b30 <_ChromeMain+0x4262894>
 4267af8: 39805c08     	ldrsb	x8, [x0, #0x17]
 4267afc: b7f80ca8     	tbnz	x8, #0x3f, 0x4267c90 <_ChromeMain+0x42629f4>
 4267b00: aa0803e9     	mov	x9, x8
 4267b04: d10183aa     	sub	x10, x29, #0x60
 4267b08: eb00015f     	cmp	x10, x0
 4267b0c: 54000120     	b.eq	0x4267b30 <_ChromeMain+0x4262894>
 4267b10: b4000109     	cbz	x9, 0x4267b30 <_ChromeMain+0x4262894>
 4267b14: 38db73a9     	ldursb	w9, [x29, #-0x49]
 4267b18: 37f816e9     	tbnz	w9, #0x1f, 0x4267df4 <_ChromeMain+0x4262b58>
 4267b1c: 37f81488     	tbnz	w8, #0x1f, 0x4267dac <_ChromeMain+0x4262b10>
 4267b20: 3dc00000     	ldr	q0, [x0]
 4267b24: f9400808     	ldr	x8, [x0, #0x10]
 4267b28: f81b03a8     	stur	x8, [x29, #-0x50]
 4267b2c: 3c9a03a0     	stur	q0, [x29, #-0x60]
 4267b30: d004c1c1     	adrp	x1, 0xdaa1000 <dyld_stub_binder+0xdaa1000>
 4267b34: 9118e021     	add	x1, x1, #0x638
 4267b38: aa1603e0     	mov	x0, x22
 4267b3c: 52800122     	mov	w2, #0x9                ; =9
 4267b40: 977707d0     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4267b44: b4000be0     	cbz	x0, 0x4267cc0 <_ChromeMain+0x4262a24>
 4267b48: 39805c08     	ldrsb	x8, [x0, #0x17]
 4267b4c: b7f80b68     	tbnz	x8, #0x3f, 0x4267cb8 <_ChromeMain+0x4262a1c>
 4267b50: aa0803e9     	mov	x9, x8
 4267b54: b4000b69     	cbz	x9, 0x4267cc0 <_ChromeMain+0x4262a24>
 4267b58: 910143e9     	add	x9, sp, #0x50
 4267b5c: eb00013f     	cmp	x9, x0
 4267b60: 54000100     	b.eq	0x4267b80 <_ChromeMain+0x42628e4>
 4267b64: 39c19fe9     	ldrsb	w9, [sp, #0x67]
 4267b68: 37f81389     	tbnz	w9, #0x1f, 0x4267dd8 <_ChromeMain+0x4262b3c>
 4267b6c: 37f80d68     	tbnz	w8, #0x1f, 0x4267d18 <_ChromeMain+0x4262a7c>
 4267b70: 3dc00000     	ldr	q0, [x0]
 4267b74: f9400808     	ldr	x8, [x0, #0x10]
 4267b78: f90033e8     	str	x8, [sp, #0x60]
 4267b7c: 3d8017e0     	str	q0, [sp, #0x50]
 4267b80: 39419fe8     	ldrb	w8, [sp, #0x67]
 4267b84: 13001d18     	sxtb	w24, w8
 4267b88: f9402fe9     	ldr	x9, [sp, #0x58]
 4267b8c: 7100031f     	cmp	w24, #0x0
 4267b90: 9a884128     	csel	x8, x9, x8, mi
 4267b94: b4000ca8     	cbz	x8, 0x4267d28 <_ChromeMain+0x4262a8c>
 4267b98: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4267b9c: 37f80868     	tbnz	w8, #0x1f, 0x4267ca8 <_ChromeMain+0x4262a0c>
 4267ba0: 3dc002a0     	ldr	q0, [x21]
 4267ba4: 3d800fe0     	str	q0, [sp, #0x30]
 4267ba8: f9400aa8     	ldr	x8, [x21, #0x10]
 4267bac: f90023e8     	str	x8, [sp, #0x40]
 4267bb0: 389b73a8     	ldursb	x8, [x29, #-0x49]
 4267bb4: d10183a9     	sub	x9, x29, #0x60
 4267bb8: a97a2faa     	ldp	x10, x11, [x29, #-0x60]
 4267bbc: f100011f     	cmp	x8, #0x0
 4267bc0: 9a894140     	csel	x0, x10, x9, mi
 4267bc4: 7100011f     	cmp	w8, #0x0
 4267bc8: 9a884161     	csel	x1, x11, x8, mi
 4267bcc: 910063e8     	add	x8, sp, #0x18
 4267bd0: 9719e9d0     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 4267bd4: 39819fe8     	ldrsb	x8, [sp, #0x67]
 4267bd8: 910143e9     	add	x9, sp, #0x50
 4267bdc: a9452fea     	ldp	x10, x11, [sp, #0x50]
 4267be0: f100011f     	cmp	x8, #0x0
 4267be4: 9a894140     	csel	x0, x10, x9, mi
 4267be8: 7100011f     	cmp	w8, #0x0
 4267bec: 9a884161     	csel	x1, x11, x8, mi
 4267bf0: 910003e8     	mov	x8, sp
 4267bf4: 9719e9c7     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 4267bf8: b9000274     	str	w20, [x19]
 4267bfc: 3dc00fe0     	ldr	q0, [sp, #0x30]
 4267c00: 3c808260     	stur	q0, [x19, #0x8]
 4267c04: f94023e8     	ldr	x8, [sp, #0x40]
 4267c08: f9000e68     	str	x8, [x19, #0x18]
 4267c0c: a9037fff     	stp	xzr, xzr, [sp, #0x30]
 4267c10: f90023ff     	str	xzr, [sp, #0x40]
 4267c14: 3cc183e0     	ldur	q0, [sp, #0x18]
 4267c18: 3d800a60     	str	q0, [x19, #0x20]
 4267c1c: f94017e8     	ldr	x8, [sp, #0x28]
 4267c20: f9001a68     	str	x8, [x19, #0x30]
 4267c24: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4267c28: f90017ff     	str	xzr, [sp, #0x28]
 4267c2c: 3dc003e0     	ldr	q0, [sp]
 4267c30: 3c838260     	stur	q0, [x19, #0x38]
 4267c34: f9400be8     	ldr	x8, [sp, #0x10]
 4267c38: f9002668     	str	x8, [x19, #0x48]
 4267c3c: a9007fff     	stp	xzr, xzr, [sp]
 4267c40: f9000bff     	str	xzr, [sp, #0x10]
 4267c44: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4267c48: 36f800a8     	tbz	w8, #0x1f, 0x4267c5c <_ChromeMain+0x42629c0>
 4267c4c: f9402be0     	ldr	x0, [sp, #0x50]
 4267c50: f94033e8     	ldr	x8, [sp, #0x60]
 4267c54: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267c58: 96f68498     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267c5c: 38db73a8     	ldursb	w8, [x29, #-0x49]
 4267c60: 36f800a8     	tbz	w8, #0x1f, 0x4267c74 <_ChromeMain+0x42629d8>
 4267c64: f85a03a0     	ldur	x0, [x29, #-0x60]
 4267c68: f85b03a8     	ldur	x8, [x29, #-0x50]
 4267c6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267c70: 96f68492     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267c74: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 4267c78: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 4267c7c: a94b57f6     	ldp	x22, x21, [sp, #0xb0]
 4267c80: a94a5ff8     	ldp	x24, x23, [sp, #0xa0]
 4267c84: a94967fa     	ldp	x26, x25, [sp, #0x90]
 4267c88: 910383ff     	add	sp, sp, #0xe0
 4267c8c: d65f03c0     	ret
 4267c90: f9400409     	ldr	x9, [x0, #0x8]
 4267c94: 17ffff9c     	b	0x4267b04 <_ChromeMain+0x4262868>
 4267c98: a9400aa1     	ldp	x1, x2, [x21]
 4267c9c: d10183a0     	sub	x0, x29, #0x60
 4267ca0: 96f6c15e     	bl	0x18218 <_ChromeMain+0x12f7c>
 4267ca4: 17ffff8c     	b	0x4267ad4 <_ChromeMain+0x4262838>
 4267ca8: a9400aa1     	ldp	x1, x2, [x21]
 4267cac: 9100c3e0     	add	x0, sp, #0x30
 4267cb0: 96f6c15a     	bl	0x18218 <_ChromeMain+0x12f7c>
 4267cb4: 17ffffbf     	b	0x4267bb0 <_ChromeMain+0x4262914>
 4267cb8: f9400409     	ldr	x9, [x0, #0x8]
 4267cbc: b5fff4e9     	cbnz	x9, 0x4267b58 <_ChromeMain+0x42628bc>
 4267cc0: 9004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4267cc4: 913c8c21     	add	x1, x1, #0xf23
 4267cc8: aa1603e0     	mov	x0, x22
 4267ccc: 52800122     	mov	w2, #0x9                ; =9
 4267cd0: 9777076c     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 4267cd4: b4fff560     	cbz	x0, 0x4267b80 <_ChromeMain+0x42628e4>
 4267cd8: 39805c08     	ldrsb	x8, [x0, #0x17]
 4267cdc: b7f801a8     	tbnz	x8, #0x3f, 0x4267d10 <_ChromeMain+0x4262a74>
 4267ce0: aa0803e9     	mov	x9, x8
 4267ce4: 910143ea     	add	x10, sp, #0x50
 4267ce8: eb00015f     	cmp	x10, x0
 4267cec: 54fff4a0     	b.eq	0x4267b80 <_ChromeMain+0x42628e4>
 4267cf0: b4fff489     	cbz	x9, 0x4267b80 <_ChromeMain+0x42628e4>
 4267cf4: 39c19fe9     	ldrsb	w9, [sp, #0x67]
 4267cf8: 37f808c9     	tbnz	w9, #0x1f, 0x4267e10 <_ChromeMain+0x4262b74>
 4267cfc: 36fff3a8     	tbz	w8, #0x1f, 0x4267b70 <_ChromeMain+0x42628d4>
 4267d00: a9400801     	ldp	x1, x2, [x0]
 4267d04: 910143e0     	add	x0, sp, #0x50
 4267d08: 9709036b     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4267d0c: 17ffff9d     	b	0x4267b80 <_ChromeMain+0x42628e4>
 4267d10: f9400409     	ldr	x9, [x0, #0x8]
 4267d14: 17fffff4     	b	0x4267ce4 <_ChromeMain+0x4262a48>
 4267d18: a9400801     	ldp	x1, x2, [x0]
 4267d1c: 910143e0     	add	x0, sp, #0x50
 4267d20: 97090365     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4267d24: 17ffff97     	b	0x4267b80 <_ChromeMain+0x42628e4>
 4267d28: 385b73a9     	ldurb	w9, [x29, #-0x49]
 4267d2c: 13001d28     	sxtb	w8, w9
 4267d30: f85a83aa     	ldur	x10, [x29, #-0x58]
 4267d34: 7100011f     	cmp	w8, #0x0
 4267d38: 9a894142     	csel	x2, x10, x9, mi
 4267d3c: 39405ea9     	ldrb	w9, [x21, #0x17]
 4267d40: 13001d39     	sxtb	w25, w9
 4267d44: f94006b6     	ldr	x22, [x21, #0x8]
 4267d48: 7100033f     	cmp	w25, #0x0
 4267d4c: 9a8942d7     	csel	x23, x22, x9, mi
 4267d50: eb17005f     	cmp	x2, x23
 4267d54: 54000141     	b.ne	0x4267d7c <_ChromeMain+0x4262ae0>
 4267d58: f85a03a9     	ldur	x9, [x29, #-0x60]
 4267d5c: 7100011f     	cmp	w8, #0x0
 4267d60: d10183a8     	sub	x8, x29, #0x60
 4267d64: 9a884120     	csel	x0, x9, x8, mi
 4267d68: f94002a8     	ldr	x8, [x21]
 4267d6c: 7100033f     	cmp	w25, #0x0
 4267d70: 9a954101     	csel	x1, x8, x21, mi
 4267d74: 94f686bb     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4267d78: 34fff100     	cbz	w0, 0x4267b98 <_ChromeMain+0x42628fc>
 4267d7c: 37f80218     	tbnz	w24, #0x1f, 0x4267dbc <_ChromeMain+0x4262b20>
 4267d80: 37f800d9     	tbnz	w25, #0x1f, 0x4267d98 <_ChromeMain+0x4262afc>
 4267d84: 3dc002a0     	ldr	q0, [x21]
 4267d88: 3d8017e0     	str	q0, [sp, #0x50]
 4267d8c: f9400aa8     	ldr	x8, [x21, #0x10]
 4267d90: f90033e8     	str	x8, [sp, #0x60]
 4267d94: 17ffff81     	b	0x4267b98 <_ChromeMain+0x42628fc>
 4267d98: f94002a1     	ldr	x1, [x21]
 4267d9c: 910143e0     	add	x0, sp, #0x50
 4267da0: aa1603e2     	mov	x2, x22
 4267da4: 97090344     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4267da8: 17ffff7c     	b	0x4267b98 <_ChromeMain+0x42628fc>
 4267dac: a9400801     	ldp	x1, x2, [x0]
 4267db0: d10183a0     	sub	x0, x29, #0x60
 4267db4: 97090340     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4267db8: 17ffff5e     	b	0x4267b30 <_ChromeMain+0x4262894>
 4267dbc: f94002a8     	ldr	x8, [x21]
 4267dc0: 7100033f     	cmp	w25, #0x0
 4267dc4: 9a954101     	csel	x1, x8, x21, mi
 4267dc8: 910143e0     	add	x0, sp, #0x50
 4267dcc: aa1703e2     	mov	x2, x23
 4267dd0: 9709038c     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4267dd4: 17ffff71     	b	0x4267b98 <_ChromeMain+0x42628fc>
 4267dd8: 7100011f     	cmp	w8, #0x0
 4267ddc: a9402809     	ldp	x9, x10, [x0]
 4267de0: 9a804121     	csel	x1, x9, x0, mi
 4267de4: 9a884142     	csel	x2, x10, x8, mi
 4267de8: 910143e0     	add	x0, sp, #0x50
 4267dec: 97090385     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4267df0: 17ffff64     	b	0x4267b80 <_ChromeMain+0x42628e4>
 4267df4: 7100011f     	cmp	w8, #0x0
 4267df8: a9402809     	ldp	x9, x10, [x0]
 4267dfc: 9a804121     	csel	x1, x9, x0, mi
 4267e00: 9a884142     	csel	x2, x10, x8, mi
 4267e04: d10183a0     	sub	x0, x29, #0x60
 4267e08: 9709037e     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4267e0c: 17ffff49     	b	0x4267b30 <_ChromeMain+0x4262894>
 4267e10: 7100011f     	cmp	w8, #0x0
 4267e14: a9402809     	ldp	x9, x10, [x0]
 4267e18: 9a804121     	csel	x1, x9, x0, mi
 4267e1c: 9a884142     	csel	x2, x10, x8, mi
 4267e20: 910143e0     	add	x0, sp, #0x50
 4267e24: 97090377     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4267e28: 17ffff56     	b	0x4267b80 <_ChromeMain+0x42628e4>
 4267e2c: aa0003f3     	mov	x19, x0
 4267e30: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4267e34: 36f800e8     	tbz	w8, #0x1f, 0x4267e50 <_ChromeMain+0x4262bb4>
 4267e38: f9400fe0     	ldr	x0, [sp, #0x18]
 4267e3c: f94017e8     	ldr	x8, [sp, #0x28]
 4267e40: d37ff901     	lsl	x1, x8, #1
 4267e44: 96f6841d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267e48: 14000002     	b	0x4267e50 <_ChromeMain+0x4262bb4>
 4267e4c: aa0003f3     	mov	x19, x0
 4267e50: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 4267e54: 36f80148     	tbz	w8, #0x1f, 0x4267e7c <_ChromeMain+0x4262be0>
 4267e58: f9401be0     	ldr	x0, [sp, #0x30]
 4267e5c: f94023e8     	ldr	x8, [sp, #0x40]
 4267e60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267e64: 96f68415     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267e68: 14000005     	b	0x4267e7c <_ChromeMain+0x4262be0>
 4267e6c: 14000003     	b	0x4267e78 <_ChromeMain+0x4262bdc>
 4267e70: 14000002     	b	0x4267e78 <_ChromeMain+0x4262bdc>
 4267e74: 14000001     	b	0x4267e78 <_ChromeMain+0x4262bdc>
 4267e78: aa0003f3     	mov	x19, x0
 4267e7c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4267e80: 36f800a8     	tbz	w8, #0x1f, 0x4267e94 <_ChromeMain+0x4262bf8>
 4267e84: f9402be0     	ldr	x0, [sp, #0x50]
 4267e88: f94033e8     	ldr	x8, [sp, #0x60]
 4267e8c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267e90: 96f6840a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267e94: 38db73a8     	ldursb	w8, [x29, #-0x49]
 4267e98: 36f800a8     	tbz	w8, #0x1f, 0x4267eac <_ChromeMain+0x4262c10>
 4267e9c: f85a03a0     	ldur	x0, [x29, #-0x60]
 4267ea0: f85b03a8     	ldur	x8, [x29, #-0x50]
 4267ea4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4267ea8: 96f68404     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267eac: aa1303e0     	mov	x0, x19
 4267eb0: 94f66d95     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4267eb4: d503201f     	nop
 4267eb8: d503201f     	nop
 4267ebc: d503201f     	nop
 4267ec0: d102c3ff     	sub	sp, sp, #0xb0
 4267ec4: 6d032beb     	stp	d11, d10, [sp, #0x30]
 4267ec8: 6d0423e9     	stp	d9, d8, [sp, #0x40]
