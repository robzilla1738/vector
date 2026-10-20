
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4623ec0:      	sub	sp, sp, #0x50
 4623ec4:      	stp	x24, x23, [sp, #0x10]
 4623ec8:      	stp	x22, x21, [sp, #0x20]
 4623ecc:      	stp	x20, x19, [sp, #0x30]
 4623ed0:      	stp	x29, x30, [sp, #0x40]
 4623ed4:      	add	x29, sp, #0x40
 4623ed8:      	mov	x19, x0
 4623edc:      	bl	0x270cfc0 <_ChromeMain+0x2707d24>
 4623ee0:      	cbz	x0, 0x4623fc8 <_ChromeMain+0x461ed2c>
 4623ee4:      	mov	x20, x0
 4623ee8:      	ldr	x8, [x19]
 4623eec:      	ldr	x8, [x8, #0x68]
 4623ef0:      	mov	x0, x19
 4623ef4:      	blr	x8
 4623ef8:      	cbz	x0, 0x4623fc0 <_ChromeMain+0x461ed24>
 4623efc:      	ldr	x8, [x19]
 4623f00:      	ldr	x8, [x8, #0x68]
 4623f04:      	mov	x0, x19
 4623f08:      	blr	x8
 4623f0c:      	bl	0x87b6c8 <_ChromeMain+0x87642c>
 4623f10:      	mov	x21, x0
 4623f14:      	ldrb	w8, [x19, #0x440]
 4623f18:      	mov	w9, #0x2                ; =2
 4623f1c:      	cmp	w8, #0x0
 4623f20:      	csel	w22, wzr, w9, ne
 4623f24:      	ldrb	w23, [x19, #0x443]
 4623f28:      	orr	w24, w8, w23
 4623f2c:      	mov	x0, x19
 4623f30:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4623f34:      	mov	x5, x0
 4623f38:      	and	w2, w24, #0x1
 4623f3c:      	mov	x0, x20
 4623f40:      	mov	x1, x22
 4623f44:      	mov	x3, x23
 4623f48:      	mov	x4, x21
 4623f4c:      	bl	0x3a17814 <_ChromeMain+0x3a12578>
 4623f50:      	mov	x20, x0
 4623f54:      	mov	x21, x1
 4623f58:      	ldr	x0, [x19, #0x428]
 4623f5c:      	cbz	x0, 0x4623f8c <_ChromeMain+0x461ecf0>
 4623f60:      	ldrb	w8, [x19, #0x440]
 4623f64:      	mov	w9, #0xe1               ; =225
 4623f68:      	mov	w10, #0xe4              ; =228
 4623f6c:      	cmp	w8, #0x0
 4623f70:      	csel	w8, w10, w9, ne
 4623f74:      	str	w8, [sp, #0x8]
 4623f78:      	strb	wzr, [sp, #0xc]
 4623f7c:      	ldr	x8, [x0]
 4623f80:      	ldr	x8, [x8, #0x3e8]
 4623f84:      	add	x1, sp, #0x8
 4623f88:      	blr	x8
 4623f8c:      	ldr	x0, [x19, #0x438]
 4623f90:      	cbz	x0, 0x4623fa0 <_ChromeMain+0x461ed04>
 4623f94:      	mov	x1, x20
 4623f98:      	mov	x2, x21
 4623f9c:      	bl	0x2d68cd4 <_ChromeMain+0x2d63a38>
 4623fa0:      	mov	x0, x19
 4623fa4:      	bl	0x4623fe4 <_ChromeMain+0x461ed48>
 4623fa8:      	ldp	x29, x30, [sp, #0x40]
 4623fac:      	ldp	x20, x19, [sp, #0x30]
 4623fb0:      	ldp	x22, x21, [sp, #0x20]
 4623fb4:      	ldp	x24, x23, [sp, #0x10]
 4623fb8:      	add	sp, sp, #0x50
 4623fbc:      	ret
 4623fc0:      	mov	w21, #0x1               ; =1
 4623fc4:      	b	0x4623f14 <_ChromeMain+0x461ec78>
 4623fc8:      	mov	x0, x19
 4623fcc:      	ldp	x29, x30, [sp, #0x40]
 4623fd0:      	ldp	x20, x19, [sp, #0x30]
 4623fd4:      	ldp	x22, x21, [sp, #0x20]
 4623fd8:      	ldp	x24, x23, [sp, #0x10]
 4623fdc:      	add	sp, sp, #0x50
 4623fe0:      	b	0x4623fe4 <_ChromeMain+0x461ed48>
