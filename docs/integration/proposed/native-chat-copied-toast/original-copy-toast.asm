
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463a9c8:      	tbnz	w8, #0x1f, 0x463a9b8 <_ChromeMain+0x463571c>
 463a9cc:      	ldr	q0, [sp, #0x170]
 463a9d0:      	str	q0, [sp, #0x50]
 463a9d4:      	ldr	x8, [sp, #0x180]
 463a9d8:      	str	x8, [sp, #0x60]
 463a9dc:      	ldrb	w8, [sp, #0x67]
 463a9e0:      	ldr	x9, [sp, #0x58]
 463a9e4:      	tst	w8, #0x80
 463a9e8:      	csel	x8, x9, x8, ne
 463a9ec:      	cbnz	x8, 0x463aa04 <_ChromeMain+0x4635768>
 463a9f0:      	ldrsb	w8, [sp, #0x67]
 463a9f4:      	tbz	w8, #0x1f, 0x4639998 <_ChromeMain+0x46346fc>
 463a9f8:      	ldr	x0, [sp, #0x50]
 463a9fc:      	ldr	x8, [sp, #0x60]
 463aa00:      	b	0x4639990 <_ChromeMain+0x46346f4>
 463aa04:      	add	x0, sp, #0x2b0
 463aa08:      	mov	w1, #0x0                ; =0
 463aa0c:      	mov	x2, #0x0                ; =0
 463aa10:      	bl	0x90b46a8 <_ChromeMain+0x90af40c>
 463aa14:      	ldrb	w8, [sp, #0x67]
 463aa18:      	sxtb	w9, w8
 463aa1c:      	ldp	x10, x11, [sp, #0x50]
 463aa20:      	cmp	w9, #0x0
 463aa24:      	add	x9, sp, #0x50
 463aa28:      	csel	x0, x10, x9, mi
 463aa2c:      	csel	x1, x11, x8, mi
 463aa30:      	add	x20, sp, #0x190
 463aa34:      	add	x8, sp, #0x190
 463aa38:      	bl	0x8e2310 <_ChromeMain+0x8dd074>
 463aa3c:      	ldrsb	x8, [sp, #0x1a7]
 463aa40:      	ldp	x9, x10, [sp, #0x190]
 463aa44:      	cmp	x8, #0x0
 463aa48:      	csel	x1, x9, x20, mi
 463aa4c:      	cmp	w8, #0x0
 463aa50:      	csel	x2, x10, x8, mi
 463aa54:      	add	x0, sp, #0x2b0
 463aa58:      	bl	0x90b4ce8 <_ChromeMain+0x90afa4c>
 463aa5c:      	ldrsb	w8, [sp, #0x1a7]
 463aa60:      	tbz	w8, #0x1f, 0x463aa74 <_ChromeMain+0x46357d8>
 463aa64:      	ldr	x0, [sp, #0x190]
 463aa68:      	ldr	x8, [sp, #0x1a0]
 463aa6c:      	lsl	x1, x8, #1
 463aa70:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463aa74:      	add	x0, sp, #0x2b0
 463aa78:      	bl	0x90b470c <_ChromeMain+0x90af470>
 463aa7c:      	ldr	x8, [x19, #0x458]
 463aa80:      	cbz	x8, 0x463a9f0 <_ChromeMain+0x4635754>
 463aa84:      	ldr	x8, [x8, #0x538]
 463aa88:      	cbz	x8, 0x463a9f0 <_ChromeMain+0x4635754>
 463aa8c:      	ldr	x8, [x8, #0x1a0]
 463aa90:      	ldr	x0, [x8, #0x390]
 463aa94:      	cbz	x0, 0x463a9f0 <_ChromeMain+0x4635754>
 463aa98:      	bl	0x7d62640 <_ChromeMain+0x7d5d3a4>
 463aa9c:      	cbz	x0, 0x463a9f0 <_ChromeMain+0x4635754>
 463aaa0:      	mov	x19, x0
 463aaa4:      	add	x8, sp, #0x2b0
 463aaa8:      	movi.2d	v0, #0000000000000000
 463aaac:      	stp	q0, q0, [sp, #0x2b0]
 463aab0:      	stp	q0, q0, [sp, #0x2d0]
 463aab4:      	stp	q0, q0, [sp, #0x330]
 463aab8:      	stp	q0, q0, [sp, #0x310]
 463aabc:      	stp	q0, q0, [sp, #0x2f0]
 463aac0:      	add	x20, sp, #0x2b0
 463aac4:      	mov	w9, #0x16               ; =22
 463aac8:      	str	w9, [sp, #0x2b0]
 463aacc:      	strb	wzr, [sp, #0x310]
 463aad0:      	stur	q0, [x8, #0x8]
 463aad4:      	stur	q0, [x8, #0x18]
 463aad8:      	stur	q0, [x8, #0x28]
 463aadc:      	strb	wzr, [sp, #0x2e8]
 463aae0:      	add	x0, x20, #0x98
 463aae4:      	bl	0x730580 <_ChromeMain+0x72b2e4>
 463aae8:      	ldrb	w8, [sp, #0x308]
 463aaec:      	cbz	w8, 0x463ab04 <_ChromeMain+0x4635868>
 463aaf0:      	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463aaf4:      	add	x1, x1, #0xda0
 463aaf8:      	add	x0, x20, #0x40
 463aafc:      	bl	0x12e3b44 <_ChromeMain+0x12de8a8>
 463ab00:      	b	0x463ab20 <_ChromeMain+0x4635884>
 463ab04:      	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463ab08:      	add	x1, x1, #0xda0
 463ab0c:      	add	x0, x20, #0x40
 463ab10:      	add	x2, sp, #0x190
 463ab14:      	bl	0x598e2bc <_ChromeMain+0x5989020>
 463ab18:      	mov	w8, #0x1                ; =1
 463ab1c:      	strb	w8, [sp, #0x308]
 463ab20:      	add	x0, sp, #0x190
 463ab24:      	add	x1, sp, #0x2b0
 463ab28:      	bl	0x7d623e8 <_ChromeMain+0x7d5d14c>
 463ab2c:      	add	x1, sp, #0x190
 463ab30:      	mov	x0, x19
 463ab34:      	bl	0x7d627b4 <_ChromeMain+0x7d5d518>
 463ab38:      	add	x0, sp, #0x190
 463ab3c:      	bl	0x7d625a4 <_ChromeMain+0x7d5d308>
 463ab40:      	add	x0, sp, #0x2b0
 463ab44:      	bl	0x7d625a4 <_ChromeMain+0x7d5d308>
 463ab48:      	b	0x463a9f0 <_ChromeMain+0x4635754>
