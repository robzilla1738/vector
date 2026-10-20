
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 415bd40:      	sub	sp, sp, #0x130
 415bd44:      	stp	x28, x27, [sp, #0xe0]
 415bd48:      	stp	x24, x23, [sp, #0xf0]
 415bd4c:      	stp	x22, x21, [sp, #0x100]
 415bd50:      	stp	x20, x19, [sp, #0x110]
 415bd54:      	stp	x29, x30, [sp, #0x120]
 415bd58:      	add	x29, sp, #0x120
 415bd5c:      	mov	x22, x5
 415bd60:      	mov	x23, x4
 415bd64:      	mov	x21, x2
 415bd68:      	mov	x19, x0
 415bd6c:      	ldr	q0, [x4]
 415bd70:      	stur	q0, [x29, #-0x60]
 415bd74:      	ldr	x8, [x4, #0x10]
 415bd78:      	stur	x8, [x29, #-0x50]
 415bd7c:      	ldr	q0, [x5]
 415bd80:      	stur	q0, [x29, #-0x80]
 415bd84:      	ldr	x8, [x5, #0x10]
 415bd88:      	stur	x8, [x29, #-0x70]
 415bd8c:      	mov	w1, w1
 415bd90:      	sub	x4, x29, #0x60
 415bd94:      	sub	x5, x29, #0x80
 415bd98:      	bl	0x14a8e80 <_ChromeMain+0x14a3be4>
 415bd9c:      	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 415bda0:      	add	x1, x1, #0xcf4
 415bda4:      	add	x0, x21, #0x8
 415bda8:      	bl	0x53170 <_ChromeMain+0x4ded4>
 415bdac:      	sub	x8, x0, #0x20
 415bdb0:      	cmp	x0, #0x0
 415bdb4:      	csel	x8, xzr, x8, eq
 415bdb8:      	ldr	w20, [x8, #0x70]
 415bdbc:      	ldrb	w8, [x21, #0xbdf]
 415bdc0:      	sxtb	w9, w8
 415bdc4:      	ldr	x2, [x21, #0xbd0]
 415bdc8:      	cmp	w9, #0x0
 415bdcc:      	csel	x8, x2, x8, mi
 415bdd0:      	cbz	x8, 0x415be78 <_ChromeMain+0x4156bdc>
 415bdd4:      	add	x8, x21, #0xbc8
 415bdd8:      	str	xzr, [sp, #0x90]
 415bddc:      	movi.2d	v0, #0000000000000000
 415bde0:      	stp	q0, q0, [sp, #0x70]
 415bde4:      	str	q0, [sp, #0x60]
 415bde8:      	add	x24, sp, #0x60
 415bdec:      	cmp	x24, x8
 415bdf0:      	b.eq	0x415be08 <_ChromeMain+0x4156b6c>
 415bdf4:      	tbnz	w9, #0x1f, 0x415bf38 <_ChromeMain+0x4156c9c>
 415bdf8:      	ldr	q0, [x8]
 415bdfc:      	str	q0, [sp, #0x60]
 415be00:      	ldr	x8, [x8, #0x10]
 415be04:      	str	x8, [sp, #0x70]
 415be08:      	add	x8, sp, #0x40
 415be0c:      	add	x0, x21, #0xbe0
 415be10:      	bl	0x309f730 <_ChromeMain+0x309a494>
 415be14:      	ldrb	w8, [sp, #0x90]
 415be18:      	ldrb	w9, [sp, #0x58]
 415be1c:      	cmp	w8, w9
 415be20:      	b.ne	0x415bfc4 <_ChromeMain+0x4156d28>
 415be24:      	tbnz	w8, #0x0, 0x415c0b4 <_ChromeMain+0x4156e18>
 415be28:      	ldrb	w8, [sp, #0x58]
 415be2c:      	cbz	w8, 0x415be48 <_ChromeMain+0x4156bac>
 415be30:      	ldrsb	w8, [sp, #0x57]
 415be34:      	tbz	w8, #0x1f, 0x415be48 <_ChromeMain+0x4156bac>
 415be38:      	ldr	x0, [sp, #0x40]
 415be3c:      	ldr	x8, [sp, #0x50]
 415be40:      	and	x1, x8, #0x7fffffffffffffff
 415be44:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 415be48:      	ldr	x24, [x19, #0x40]
 415be4c:      	add	x2, sp, #0x60
 415be50:      	mov	w0, #0x1d               ; =29
 415be54:      	mov	x1, x20
 415be58:      	bl	0x6e05cb0 <_ChromeMain+0x6e00a14>
 415be5c:      	mov	x1, x0
 415be60:      	mov	x0, x24
 415be64:      	bl	0x14a93dc <_ChromeMain+0x14a4140>
 415be68:      	ldrb	w8, [sp, #0x90]
 415be6c:      	tbnz	w8, #0x0, 0x415c084 <_ChromeMain+0x4156de8>
 415be70:      	ldrsb	w8, [sp, #0x77]
 415be74:      	tbnz	w8, #0x1f, 0x415c070 <_ChromeMain+0x4156dd4>
 415be78:      	ldrb	w8, [x23, #0x10]
 415be7c:      	cbz	w8, 0x415beac <_ChromeMain+0x4156c10>
 415be80:      	ldr	x24, [x19, #0x40]
 415be84:      	ldr	q0, [x23]
 415be88:      	str	q0, [sp, #0x20]
 415be8c:      	ldr	x8, [x23, #0x10]
 415be90:      	str	x8, [sp, #0x30]
 415be94:      	add	x1, sp, #0x20
 415be98:      	mov	x0, x20
 415be9c:      	bl	0x317ef08 <_ChromeMain+0x3179c6c>
 415bea0:      	mov	x1, x0
 415bea4:      	mov	x0, x24
 415bea8:      	bl	0x14a93dc <_ChromeMain+0x14a4140>
 415beac:      	ldrb	w8, [x22, #0x10]
 415beb0:      	cbz	w8, 0x415bee0 <_ChromeMain+0x4156c44>
 415beb4:      	ldr	x23, [x19, #0x40]
 415beb8:      	ldr	q0, [x22]
 415bebc:      	str	q0, [sp]
 415bec0:      	ldr	x8, [x22, #0x10]
 415bec4:      	str	x8, [sp, #0x10]
 415bec8:      	mov	x1, sp
 415becc:      	mov	x0, x20
 415bed0:      	bl	0x6e0a8d4 <_ChromeMain+0x6e05638>
 415bed4:      	mov	x1, x0
 415bed8:      	mov	x0, x23
 415bedc:      	bl	0x14a93dc <_ChromeMain+0x14a4140>
 415bee0:      	add	x8, sp, #0x60
 415bee4:      	stp	xzr, xzr, [sp, #0x68]
 415bee8:      	add	x22, x8, #0x8
 415beec:      	str	x22, [sp, #0x60]
 415bef0:      	add	x1, sp, #0x60
 415bef4:      	mov	x0, x21
 415bef8:      	bl	0x4557788 <_ChromeMain+0x45524ec>
 415befc:      	add	x1, sp, #0x60
 415bf00:      	mov	x0, x21
 415bf04:      	bl	0x4557d64 <_ChromeMain+0x4552ac8>
 415bf08:      	adrp	x1, 0xce52000 <dyld_stub_binder+0xce52000>
 415bf0c:      	add	x1, x1, #0x530
 415bf10:      	add	x0, x21, #0x8
 415bf14:      	bl	0x53170 <_ChromeMain+0x4ded4>
 415bf18:      	ldr	x9, [x0, #0x10]
 415bf1c:      	ldr	x8, [x9, #0x318]
 415bf20:      	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 415bf24:      	cbz	x8, 0x415bf68 <_ChromeMain+0x4156ccc>
 415bf28:      	add	x9, x9, #0x318
 415bf2c:      	adrp	x10, 0xead4000 <dyld_stub_binder+0xead4000>
 415bf30:      	add	x10, x10, #0xc48
 415bf34:      	b	0x415bf50 <_ChromeMain+0x4156cb4>
 415bf38:      	ldr	x1, [x8]
 415bf3c:      	add	x0, sp, #0x60
 415bf40:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 415bf44:      	b	0x415be08 <_ChromeMain+0x4156b6c>
 415bf48:      	ldr	x8, [x8]
 415bf4c:      	cbz	x8, 0x415bf68 <_ChromeMain+0x4156ccc>
 415bf50:      	ldr	x11, [x8, #0x20]
 415bf54:      	cmp	x11, x10
 415bf58:      	b.hi	0x415bf48 <_ChromeMain+0x4156cac>
 415bf5c:      	b.eq	0x415bf9c <_ChromeMain+0x4156d00>
 415bf60:      	ldr	x8, [x8, #0x8]
 415bf64:      	cbnz	x8, 0x415bf50 <_ChromeMain+0x4156cb4>
 415bf68:      	mov	x21, #0x0               ; =0
 415bf6c:      	and	x8, x21, #0xfffffffc00000000
 415bf70:      	ldr	x9, [x23, #0x88]
 415bf74:      	cmp	x8, x9
 415bf78:      	b.ne	0x415bf84 <_ChromeMain+0x4156ce8>
 415bf7c:      	mov	x0, x21
 415bf80:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 415bf84:      	add	x23, sp, #0x60
 415bf88:      	add	x1, sp, #0x60
 415bf8c:      	mov	x0, x21
 415bf90:      	bl	0x456abdc <_ChromeMain+0x4565940>
 415bf94:      	ldr	x24, [sp, #0x60]
 415bf98:      	b	0x415bff8 <_ChromeMain+0x4156d5c>
 415bf9c:      	cmp	x8, x9
 415bfa0:      	b.eq	0x415bf68 <_ChromeMain+0x4156ccc>
 415bfa4:      	ldr	x21, [x8, #0x28]
 415bfa8:      	and	x8, x21, #0xfffffffc00000000
 415bfac:      	ldr	x9, [x23, #0x88]
 415bfb0:      	cmp	x8, x9
 415bfb4:      	b.ne	0x415bf6c <_ChromeMain+0x4156cd0>
 415bfb8:      	mov	x0, x21
 415bfbc:      	bl	0x142fc <_ChromeMain+0xf060>
 415bfc0:      	b	0x415bf6c <_ChromeMain+0x4156cd0>
 415bfc4:      	tbnz	w8, #0x0, 0x415c0d8 <_ChromeMain+0x4156e3c>
 415bfc8:      	ldr	q0, [sp, #0x40]
 415bfcc:      	stur	q0, [x24, #0x18]
 415bfd0:      	ldr	x8, [sp, #0x50]
 415bfd4:      	stur	x8, [x24, #0x28]
 415bfd8:      	stp	xzr, xzr, [sp, #0x48]
 415bfdc:      	str	xzr, [sp, #0x40]
 415bfe0:      	mov	w8, #0x1                ; =1
 415bfe4:      	strb	w8, [sp, #0x90]
 415bfe8:      	b	0x415be28 <_ChromeMain+0x4156b8c>
 415bfec:      	mov	x24, x8
 415bff0:      	ldr	x8, [x8]
 415bff4:      	cbnz	x8, 0x415bfec <_ChromeMain+0x4156d50>
 415bff8:      	cmp	x24, x22
 415bffc:      	b.eq	0x415c044 <_ChromeMain+0x4156da8>
 415c000:      	ldr	x21, [x19, #0x40]
 415c004:      	add	x2, x24, #0x20
 415c008:      	add	x3, x24, #0x38
 415c00c:      	mov	w0, #0x21               ; =33
 415c010:      	mov	x1, x20
 415c014:      	bl	0x2998454 <_ChromeMain+0x29931b8>
 415c018:      	mov	x1, x0
 415c01c:      	mov	x0, x21
 415c020:      	bl	0x14a93dc <_ChromeMain+0x14a4140>
 415c024:      	ldr	x8, [x24, #0x8]
 415c028:      	cbnz	x8, 0x415bfec <_ChromeMain+0x4156d50>
 415c02c:      	mov	x8, x24
 415c030:      	ldr	x24, [x24, #0x10]
 415c034:      	ldr	x9, [x24]
 415c038:      	cmp	x8, x9
 415c03c:      	b.ne	0x415c02c <_ChromeMain+0x4156d90>
 415c040:      	b	0x415bff8 <_ChromeMain+0x4156d5c>
 415c044:      	ldr	x1, [sp, #0x68]
 415c048:      	str	x23, [sp, #0x40]
 415c04c:      	add	x0, sp, #0x40
 415c050:      	bl	0x3c56f4 <_ChromeMain+0x3c0458>
 415c054:      	ldp	x29, x30, [sp, #0x120]
 415c058:      	ldp	x20, x19, [sp, #0x110]
 415c05c:      	ldp	x22, x21, [sp, #0x100]
 415c060:      	ldp	x24, x23, [sp, #0xf0]
 415c064:      	ldp	x28, x27, [sp, #0xe0]
 415c068:      	add	sp, sp, #0x130
 415c06c:      	ret
