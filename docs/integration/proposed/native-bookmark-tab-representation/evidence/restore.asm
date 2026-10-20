
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4557a5c:      	cbnz	x0, 0x4557a64 <_ChromeMain+0x45527c8>
 4557a60:      	ret
 4557a64:      	sub	sp, sp, #0x70
 4557a68:      	stp	x26, x25, [sp, #0x20]
 4557a6c:      	stp	x24, x23, [sp, #0x30]
 4557a70:      	stp	x22, x21, [sp, #0x40]
 4557a74:      	stp	x20, x19, [sp, #0x50]
 4557a78:      	stp	x29, x30, [sp, #0x60]
 4557a7c:      	add	x29, sp, #0x60
 4557a80:      	mov	x20, x1
 4557a84:      	mov	x19, x0
 4557a88:      	mov	x22, x1
 4557a8c:      	ldr	x23, [x22, #0x8]!
 4557a90:      	cbz	x23, 0x4557b08 <_ChromeMain+0x455286c>
 4557a94:      	mov	w24, #0x23              ; =35
 4557a98:      	adrp	x21, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4557a9c:      	add	x21, x21, #0x7ac
 4557aa0:      	b	0x4557ab0 <_ChromeMain+0x4552814>
 4557aa4:      	b.hs	0x4557aec <_ChromeMain+0x4552850>
 4557aa8:      	ldr	x23, [x23, #0x8]
 4557aac:      	cbz	x23, 0x4557b08 <_ChromeMain+0x455286c>
 4557ab0:      	mov	x8, x23
 4557ab4:      	ldr	x9, [x8, #0x20]!
 4557ab8:      	ldrb	w10, [x8, #0x17]
 4557abc:      	sxtb	w11, w10
 4557ac0:      	ldr	x12, [x8, #0x8]
 4557ac4:      	cmp	w11, #0x0
 4557ac8:      	csel	x25, x12, x10, mi
 4557acc:      	csel	x0, x9, x8, mi
 4557ad0:      	cmp	x25, #0x23
 4557ad4:      	csel	x2, x25, x24, lo
 4557ad8:      	mov	x1, x21
 4557adc:      	bl	0x8009860 <_ChromeMain+0x80045c4>
 4557ae0:      	cbz	w0, 0x4557b00 <_ChromeMain+0x4552864>
 4557ae4:      	cmp	w0, #0x1
 4557ae8:      	b.lt	0x4557aa8 <_ChromeMain+0x455280c>
 4557aec:      	ldr	x23, [x23]
 4557af0:      	cbnz	x23, 0x4557ab0 <_ChromeMain+0x4552814>
 4557af4:      	b	0x4557b08 <_ChromeMain+0x455286c>
 4557af8:      	ldp	x0, x1, [x21, #0x38]
 4557afc:      	b	0x4557b5c <_ChromeMain+0x45528c0>
 4557b00:      	cmp	x25, #0x23
 4557b04:      	b.ne	0x4557aa4 <_ChromeMain+0x4552808>
 4557b08:      	cmp	x23, #0x0
 4557b0c:      	csel	x21, x22, x23, eq
 4557b10:      	adrp	x1, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4557b14:      	add	x1, x1, #0x7d0
 4557b18:      	mov	x0, x20
 4557b1c:      	bl	0x650f1d0 <_ChromeMain+0x6509f34>
 4557b20:      	ldr	x8, [x1]
 4557b24:      	cmp	x8, #0x0
 4557b28:      	csel	x20, x22, x8, eq
 4557b2c:      	cmp	x21, x22
 4557b30:      	b.eq	0x4557bfc <_ChromeMain+0x4552960>
 4557b34:      	cmp	x20, x22
 4557b38:      	b.eq	0x4557bfc <_ChromeMain+0x4552960>
 4557b3c:      	ldrsb	x8, [x20, #0x4f]
 4557b40:      	tbz	x8, #0x3f, 0x4557b48 <_ChromeMain+0x45528ac>
 4557b44:      	ldr	x8, [x20, #0x40]
 4557b48:      	cbz	x8, 0x4557bfc <_ChromeMain+0x4552960>
 4557b4c:      	str	xzr, [sp, #0x18]
 4557b50:      	ldrsb	x1, [x21, #0x4f]
 4557b54:      	tbnz	x1, #0x3f, 0x4557af8 <_ChromeMain+0x455285c>
 4557b58:      	add	x0, x21, #0x38
 4557b5c:      	add	x2, sp, #0x18
 4557b60:      	bl	0x10a11bc <_ChromeMain+0x109bf20>
 4557b64:      	ldr	x21, [sp, #0x18]
 4557b68:      	cmp	x21, #0x0
 4557b6c:      	csel	w8, wzr, w0, eq
 4557b70:      	cbz	w8, 0x4557bfc <_ChromeMain+0x4552960>
 4557b74:      	ldrsb	w8, [x20, #0x4f]
 4557b78:      	tbnz	w8, #0x1f, 0x4557c18 <_ChromeMain+0x455297c>
 4557b7c:      	ldur	q0, [x20, #0x38]
 4557b80:      	ldur	x8, [x20, #0x48]
 4557b84:      	str	x8, [sp, #0x10]
 4557b88:      	str	q0, [sp]
 4557b8c:      	ldrb	w9, [sp, #0x17]
 4557b90:      	sxtb	w8, w9
 4557b94:      	ldr	x20, [sp, #0x8]
 4557b98:      	cmp	w8, #0x0
 4557b9c:      	csel	x9, x20, x9, mi
 4557ba0:      	cbz	x9, 0x4557be8 <_ChromeMain+0x455294c>
 4557ba4:      	mov	w0, #0x28               ; =40
 4557ba8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4557bac:      	mov	x2, x0
 4557bb0:      	ldr	x8, [sp]
 4557bb4:      	ldr	x9, [sp, #0x10]
 4557bb8:      	stp	xzr, xzr, [sp]
 4557bbc:      	adrp	x10, 0xe4fa000 <dyld_stub_binder+0xe4fa000>
 4557bc0:      	add	x10, x10, #0xbe0
 4557bc4:      	str	xzr, [sp, #0x10]
 4557bc8:      	stp	x10, x21, [x0]
 4557bcc:      	stp	x8, x20, [x0, #0x10]
 4557bd0:      	str	x9, [x0, #0x20]
 4557bd4:      	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4557bd8:      	add	x1, x1, #0x9a8
 4557bdc:      	add	x0, x19, #0x8
 4557be0:      	bl	0xf67d00 <_ChromeMain+0xf62a64>
 4557be4:      	ldrb	w8, [sp, #0x17]
 4557be8:      	tbz	w8, #0x7, 0x4557bfc <_ChromeMain+0x4552960>
 4557bec:      	ldr	x0, [sp]
 4557bf0:      	ldr	x8, [sp, #0x10]
 4557bf4:      	and	x1, x8, #0x7fffffffffffffff
 4557bf8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4557bfc:      	ldp	x29, x30, [sp, #0x60]
 4557c00:      	ldp	x20, x19, [sp, #0x50]
 4557c04:      	ldp	x22, x21, [sp, #0x40]
 4557c08:      	ldp	x24, x23, [sp, #0x30]
 4557c0c:      	ldp	x26, x25, [sp, #0x20]
 4557c10:      	add	sp, sp, #0x70
 4557c14:      	ret
 4557c18:      	ldp	x1, x2, [x20, #0x38]
 4557c1c:      	mov	x0, sp
 4557c20:      	bl	0x18218 <_ChromeMain+0x12f7c>
 4557c24:      	b	0x4557b8c <_ChromeMain+0x45528f0>
