
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2b54c88:      	stp	x24, x23, [sp, #-0x40]!
 2b54c8c:      	stp	x22, x21, [sp, #0x10]
 2b54c90:      	stp	x20, x19, [sp, #0x20]
 2b54c94:      	stp	x29, x30, [sp, #0x30]
 2b54c98:      	add	x29, sp, #0x30
 2b54c9c:      	mov	x19, x8
 2b54ca0:      	str	xzr, [x8, #0x10]
 2b54ca4:      	str	xzr, [x8, #0x8]!
 2b54ca8:      	str	x8, [x19]
 2b54cac:      	ldr	x8, [x0, #0x10]
 2b54cb0:      	cbz	x8, 0x2b54dcc <_ChromeMain+0x2b4fb30>
 2b54cb4:      	mov	x21, x1
 2b54cb8:      	mov	x20, x0
 2b54cbc:      	tbnz	w1, #0x1f, 0x2b54dc4 <_ChromeMain+0x2b4fb28>
 2b54cc0:      	ldr	x0, [x8]
 2b54cc4:      	ldr	w8, [x0, #0x18]
 2b54cc8:      	cmp	w21, w8
 2b54ccc:      	b.ge	0x2b54dc4 <_ChromeMain+0x2b4fb28>
 2b54cd0:      	mov	w1, w21
 2b54cd4:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 2b54cd8:      	ldr	x22, [x0, #0x40]
 2b54cdc:      	mov	x0, x22
 2b54ce0:      	mov	x1, x19
 2b54ce4:      	bl	0x4557788 <_ChromeMain+0x45524ec>
 2b54ce8:      	mov	x0, x22
 2b54cec:      	mov	x1, x19
 2b54cf0:      	bl	0x4557d64 <_ChromeMain+0x4552ac8>
 2b54cf4:      	ldr	x8, [x20, #0x10]
 2b54cf8:      	cbz	x8, 0x2b54dd8 <_ChromeMain+0x2b4fb3c>
 2b54cfc:      	ldr	x0, [x8]
 2b54d00:      	sxtw	x21, w21
 2b54d04:      	mov	x1, x21
 2b54d08:      	bl	0x105e2f8 <_ChromeMain+0x105905c>
 2b54d0c:      	ldr	x8, [x0, #0x318]
