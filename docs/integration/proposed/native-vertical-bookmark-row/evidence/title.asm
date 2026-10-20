
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461bda0:      	sub	sp, sp, #0x40
 461bda4:      	stp	x20, x19, [sp, #0x20]
 461bda8:      	stp	x29, x30, [sp, #0x30]
 461bdac:      	add	x29, sp, #0x30
 461bdb0:      	mov	x20, x0
 461bdb4:      	mov	x19, x8
 461bdb8:      	stp	xzr, xzr, [sp]
 461bdbc:      	str	xzr, [sp, #0x10]
 461bdc0:      	ldrsb	w8, [x0, #0x1f]
 461bdc4:      	tbnz	w8, #0x1f, 0x461be0c <_ChromeMain+0x4616b70>
 461bdc8:      	ldur	q0, [x20, #0x8]
 461bdcc:      	str	q0, [sp]
 461bdd0:      	ldur	x8, [x20, #0x18]
 461bdd4:      	str	x8, [sp, #0x10]
 461bdd8:      	ldrb	w8, [sp, #0x17]
 461bddc:      	ldr	x9, [sp, #0x8]
 461bde0:      	tst	w8, #0x80
 461bde4:      	csel	x8, x9, x8, ne
 461bde8:      	cbz	x8, 0x461be1c <_ChromeMain+0x4616b80>
 461bdec:      	ldr	q0, [sp]
 461bdf0:      	str	q0, [x19]
 461bdf4:      	ldr	x8, [sp, #0x10]
 461bdf8:      	str	x8, [x19, #0x10]
 461bdfc:      	ldp	x29, x30, [sp, #0x30]
 461be00:      	ldp	x20, x19, [sp, #0x20]
 461be04:      	add	sp, sp, #0x40
 461be08:      	ret
 461be0c:      	ldp	x1, x2, [x20, #0x8]
 461be10:      	mov	x0, sp
 461be14:      	bl	0x46bd0 <_ChromeMain+0x41934>
 461be18:      	b	0x461bdd8 <_ChromeMain+0x4616b3c>
 461be1c:      	ldr	w8, [x20, #0xf8]
 461be20:      	cbz	w8, 0x461be48 <_ChromeMain+0x4616bac>
 461be24:      	stp	xzr, xzr, [x19]
 461be28:      	str	xzr, [x19, #0x10]
 461be2c:      	ldrsb	w8, [sp, #0x17]
 461be30:      	tbz	w8, #0x1f, 0x461bdfc <_ChromeMain+0x4616b60>
 461be34:      	ldr	x0, [sp]
 461be38:      	ldr	x8, [sp, #0x10]
 461be3c:      	lsl	x1, x8, #1
 461be40:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 461be44:      	b	0x461bdfc <_ChromeMain+0x4616b60>
 461be48:      	add	x0, x20, #0x80
 461be4c:      	ldr	w8, [x20, #0xbc]
 461be50:      	cmp	w8, #0x1
 461be54:      	b.lt	0x461be7c <_ChromeMain+0x4616be0>
 461be58:      	ldrb	w10, [x20, #0x97]
 461be5c:      	sxtb	w9, w10
 461be60:      	ldr	x11, [x20, #0x88]
 461be64:      	cmp	w9, #0x0
 461be68:      	csel	x11, x11, x10, mi
 461be6c:      	ldrsw	x10, [x20, #0xb8]
 461be70:      	subs	x11, x11, x10
 461be74:      	b.lo	0x461bec0 <_ChromeMain+0x4616c24>
 461be78:      	b.ne	0x461bea4 <_ChromeMain+0x4616c08>
 461be7c:      	bl	0x66ca88 <_ChromeMain+0x6677ec>
 461be80:      	ldrsb	x8, [x0, #0x17]
 461be84:      	ldp	x9, x10, [x0]
 461be88:      	cmp	x8, #0x0
 461be8c:      	csel	x0, x9, x0, mi
 461be90:      	cmp	w8, #0x0
 461be94:      	csel	x1, x10, x8, mi
 461be98:      	mov	x8, x19
 461be9c:      	bl	0x8e2310 <_ChromeMain+0x8dd074>
 461bea0:      	b	0x461be2c <_ChromeMain+0x4616b90>
 461bea4:      	cmp	x11, x8
 461bea8:      	csel	x1, x11, x8, lo
 461beac:      	ldr	x8, [x0]
 461beb0:      	cmp	w9, #0x0
 461beb4:      	csel	x8, x8, x0, mi
 461beb8:      	add	x0, x8, x10
 461bebc:      	b	0x461be98 <_ChromeMain+0x4616bfc>
 461bec0:      	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 461bec4:      	add	x0, x0, #0xdd8
 461bec8:      	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
