
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42abe9c:      	stp	x26, x25, [sp, #-0x50]!
 42abea0:      	stp	x24, x23, [sp, #0x10]
 42abea4:      	stp	x22, x21, [sp, #0x20]
 42abea8:      	stp	x20, x19, [sp, #0x30]
 42abeac:      	stp	x29, x30, [sp, #0x40]
 42abeb0:      	add	x29, sp, #0x40
 42abeb4:      	mov	x20, x0
 42abeb8:      	mov	w8, #0x2                ; =2
 42abebc:      	str	w8, [x0, #0x390]
 42abec0:      	add	x0, x0, #0x2b8
 42abec4:      	bl	0x72e718 <_ChromeMain+0x72947c>
 42abec8:      	ldr	x0, [x20, #0x190]
 42abecc:      	str	xzr, [x20, #0x190]
 42abed0:      	cbz	x0, 0x42abee0 <_ChromeMain+0x42a6c44>
 42abed4:      	bl	0x162db98 <_ChromeMain+0x16288fc>
 42abed8:      	mov	w1, #0x228              ; =552
 42abedc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42abee0:      	ldr	x8, [x20, #0x398]
 42abee4:      	cbz	x8, 0x42abef0 <_ChromeMain+0x42a6c54>
 42abee8:      	ldapurb	w8, [x8, #0x4]
 42abeec:      	cbz	w8, 0x42abf28 <_ChromeMain+0x42a6c8c>
 42abef0:      	ldr	x19, [x20, #0x3c0]
 42abef4:      	str	xzr, [x20, #0x3c0]
 42abef8:      	add	x8, x20, #0x3c8
 42abefc:      	ldr	x22, [x20, #0x3c8]
 42abf00:      	ldr	x21, [x20, #0x3d0]
 42abf04:      	movi.2d	v0, #0000000000000000
 42abf08:      	str	q0, [x8]
 42abf0c:      	lsl	x23, x22, #3
 42abf10:      	cbz	x23, 0x42abf20 <_ChromeMain+0x42a6c84>
 42abf14:      	mov	x24, #0x0               ; =0
 42abf18:      	mov	w25, #-0x1              ; =-1
 42abf1c:      	b	0x42abf90 <_ChromeMain+0x42a6cf4>
 42abf20:      	cbnz	x19, 0x42abffc <_ChromeMain+0x42a6d60>
 42abf24:      	b	0x42abfc0 <_ChromeMain+0x42a6d24>
 42abf28:      	ldr	x8, [x20, #0x3a0]
 42abf2c:      	cbz	x8, 0x42abef0 <_ChromeMain+0x42a6c54>
 42abf30:      	ldr	x19, [x20, #0x418]
 42abf34:      	cbz	x19, 0x42abf64 <_ChromeMain+0x42a6cc8>
 42abf38:      	str	xzr, [x20, #0x418]
 42abf3c:      	ldr	x1, [x20, #0x410]
 42abf40:      	add	x0, x19, #0x80
 42abf44:      	bl	0x1d79ba4 <_ChromeMain+0x1d74908>
 42abf48:      	and	x8, x19, #0xfffffffc00000000
 42abf4c:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 42abf50:      	ldr	x9, [x9, #0x88]
 42abf54:      	cmp	x8, x9
 42abf58:      	b.ne	0x42abf64 <_ChromeMain+0x42a6cc8>
 42abf5c:      	mov	x0, x19
 42abf60:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 42abf64:      	ldr	x0, [x20, #0x398]
 42abf68:      	str	xzr, [x20, #0x398]
 42abf6c:      	cbnz	x0, 0x42ac034 <_ChromeMain+0x42a6d98>
 42abf70:      	str	xzr, [x20, #0x3a0]
 42abf74:      	b	0x42abef0 <_ChromeMain+0x42a6c54>
 42abf78:      	ldr	x8, [x20, #0x10]
 42abf7c:      	mov	x0, x20
 42abf80:      	blr	x8
 42abf84:      	add	x24, x24, #0x8
 42abf88:      	cmp	x23, x24
 42abf8c:      	b.eq	0x42abfbc <_ChromeMain+0x42a6d20>
 42abf90:      	ldr	x20, [x19, x24]
 42abf94:      	cbz	x20, 0x42ac054 <_ChromeMain+0x42a6db8>
 42abf98:      	str	xzr, [x19, x24]
 42abf9c:      	ldr	x8, [x20, #0x8]
 42abfa0:      	mov	x0, x20
 42abfa4:      	mov	w1, #0x1                ; =1
 42abfa8:      	blr	x8
 42abfac:      	ldaddal	w25, w8, [x20]
 42abfb0:      	cmp	w8, #0x1
 42abfb4:      	b.ne	0x42abf84 <_ChromeMain+0x42a6ce8>
 42abfb8:      	b	0x42abf78 <_ChromeMain+0x42a6cdc>
 42abfbc:      	cbnz	x19, 0x42abfd8 <_ChromeMain+0x42a6d3c>
 42abfc0:      	ldp	x29, x30, [sp, #0x40]
 42abfc4:      	ldp	x20, x19, [sp, #0x30]
 42abfc8:      	ldp	x22, x21, [sp, #0x20]
 42abfcc:      	ldp	x24, x23, [sp, #0x10]
 42abfd0:      	ldp	x26, x25, [sp], #0x50
 42abfd4:      	ret
 42abfd8:      	add	x8, x23, x19
 42abfdc:      	sub	x20, x8, #0x8
 42abfe0:      	neg	x22, x22, lsl #3
 42abfe4:      	mov	w23, #-0x1              ; =-1
 42abfe8:      	cbz	x20, 0x42ac050 <_ChromeMain+0x42a6db4>
 42abfec:      	ldr	x0, [x20], #-0x8
 42abff0:      	cbnz	x0, 0x42ac01c <_ChromeMain+0x42a6d80>
 42abff4:      	adds	x22, x22, #0x8
 42abff8:      	b.ne	0x42abfe8 <_ChromeMain+0x42a6d4c>
 42abffc:      	lsl	x1, x21, #3
 42ac000:      	mov	x0, x19
 42ac004:      	ldp	x29, x30, [sp, #0x40]
 42ac008:      	ldp	x20, x19, [sp, #0x30]
 42ac00c:      	ldp	x22, x21, [sp, #0x20]
 42ac010:      	ldp	x24, x23, [sp, #0x10]
 42ac014:      	ldp	x26, x25, [sp], #0x50
 42ac018:      	b	0x8eb8 <_ChromeMain+0x3c1c>
 42ac01c:      	ldaddal	w23, w8, [x0]
 42ac020:      	cmp	w8, #0x1
 42ac024:      	b.ne	0x42abff4 <_ChromeMain+0x42a6d58>
 42ac028:      	ldr	x8, [x0, #0x10]
 42ac02c:      	blr	x8
 42ac030:      	b	0x42abff4 <_ChromeMain+0x42a6d58>
 42ac034:      	mov	w8, #-0x1               ; =-1
 42ac038:      	ldaddal	w8, w8, [x0]
 42ac03c:      	cmp	w8, #0x1
 42ac040:      	b.ne	0x42abf70 <_ChromeMain+0x42a6cd4>
 42ac044:      	mov	w1, #0x8                ; =8
 42ac048:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42ac04c:      	b	0x42abf70 <_ChromeMain+0x42a6cd4>
 42ac050:      	brk	#0x1
 42ac054:      	brk	#0
 42ac058:      	hlt	#0
 42ac05c:      	brk	#0x1
