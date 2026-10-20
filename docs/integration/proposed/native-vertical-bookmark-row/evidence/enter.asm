
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620d68:      	sub	sp, sp, #0x1c0
 4620d6c:      	stp	x28, x27, [sp, #0x190]
 4620d70:      	stp	x20, x19, [sp, #0x1a0]
 4620d74:      	stp	x29, x30, [sp, #0x1b0]
 4620d78:      	add	x29, sp, #0x1b0
 4620d7c:      	mov	x20, x0
 4620d80:      	mov	w8, #0x1                ; =1
 4620d84:      	strb	w8, [x0, #0x443]
 4620d88:      	bl	0x4623d40 <_ChromeMain+0x461eaa4>
 4620d8c:      	mov	x0, x20
 4620d90:      	bl	0x4623ec0 <_ChromeMain+0x461ec24>
 4620d94:      	mov	x0, x20
 4620d98:      	bl	0x5a117c <_ChromeMain+0x59bee0>
 4620d9c:      	ldr	x19, [x20, #0x3d0]
 4620da0:      	cbz	x19, 0x4620ddc <_ChromeMain+0x461bb40>
 4620da4:      	ldr	x8, [x19, #0x528]
 4620da8:      	cbz	x8, 0x4620ddc <_ChromeMain+0x461bb40>
 4620dac:      	cbz	x20, 0x4620dcc <_ChromeMain+0x461bb30>
 4620db0:      	ldrb	w8, [x20, #0x447]
 4620db4:      	tbnz	w8, #0x0, 0x4620dc8 <_ChromeMain+0x461bb2c>
 4620db8:      	ldr	x8, [x20, #0x3e0]
 4620dbc:      	cbz	x8, 0x4620dc8 <_ChromeMain+0x461bb2c>
 4620dc0:      	ldr	w9, [x8, #0xf8]
 4620dc4:      	cbz	w9, 0x4620df0 <_ChromeMain+0x461bb54>
 4620dc8:      	mov	x20, #0x0               ; =0
 4620dcc:      	ldr	x0, [x19, #0x528]
 4620dd0:      	mov	x1, x20
 4620dd4:      	mov	w2, #0x0                ; =0
 4620dd8:      	bl	0x27643c0 <_ChromeMain+0x275f124>
 4620ddc:      	ldp	x29, x30, [sp, #0x1b0]
 4620de0:      	ldp	x20, x19, [sp, #0x1a0]
 4620de4:      	ldp	x28, x27, [sp, #0x190]
 4620de8:      	add	sp, sp, #0x1c0
 4620dec:      	ret
 4620df0:      	ldr	x1, [x8, #0x60]
 4620df4:      	mov	x0, x19
 4620df8:      	bl	0x4615870 <_ChromeMain+0x46105d4>
 4620dfc:      	lsr	x8, x0, #32
 4620e00:      	cbz	x8, 0x4620dc8 <_ChromeMain+0x461bb2c>
 4620e04:      	ldr	x8, [x20, #0x3d0]
 4620e08:      	cbz	x8, 0x4620dc8 <_ChromeMain+0x461bb2c>
 4620e0c:      	movi.2d	v0, #0000000000000000
 4620e10:      	stp	q0, q0, [sp, #0x170]
 4620e14:      	stp	q0, q0, [sp, #0x150]
 4620e18:      	stp	q0, q0, [sp, #0x130]
 4620e1c:      	stp	q0, q0, [sp, #0x110]
 4620e20:      	stp	q0, q0, [sp, #0xf0]
 4620e24:      	stp	q0, q0, [sp, #0xd0]
 4620e28:      	stp	q0, q0, [sp, #0xb0]
 4620e2c:      	stp	q0, q0, [sp, #0x90]
 4620e30:      	stp	q0, q0, [sp, #0x70]
 4620e34:      	stp	q0, q0, [sp, #0x50]
 4620e38:      	stp	q0, q0, [sp, #0x30]
 4620e3c:      	stp	q0, q0, [sp, #0x10]
 4620e40:      	str	q0, [sp]
 4620e44:      	mov	x0, sp
 4620e48:      	bl	0x41d93fc <_ChromeMain+0x41d4160>
 4620e4c:      	ldr	x0, [x20, #0x3d0]
 4620e50:      	ldr	x1, [x20, #0x3e0]
 4620e54:      	mov	x2, sp
 4620e58:      	bl	0x46159fc <_ChromeMain+0x4610760>
 4620e5c:      	cbnz	w0, 0x4620e68 <_ChromeMain+0x461bbcc>
 4620e60:      	mov	x20, #0x0               ; =0
 4620e64:      	b	0x4620e78 <_ChromeMain+0x461bbdc>
 4620e68:      	add	x20, x20, #0x310
 4620e6c:      	mov	x1, sp
 4620e70:      	mov	x0, x20
 4620e74:      	bl	0x28193f8 <_ChromeMain+0x281415c>
 4620e78:      	mov	x0, sp
 4620e7c:      	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4620e80:      	b	0x4620dcc <_ChromeMain+0x461bb30>
