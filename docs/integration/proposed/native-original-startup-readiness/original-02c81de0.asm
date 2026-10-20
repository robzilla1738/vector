
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2c81de0:      	stp	x20, x19, [sp, #-0x20]!
 2c81de4:      	stp	x29, x30, [sp, #0x10]
 2c81de8:      	add	x29, sp, #0x10
 2c81dec:      	mov	x20, x1
 2c81df0:      	mov	x19, x0
 2c81df4:      	mov	x8, x0
 2c81df8:      	str	xzr, [x8, #0x10]!
 2c81dfc:      	mov	x9, x0
 2c81e00:      	str	xzr, [x9, #0x28]!
 2c81e04:      	adrp	x10, 0xe109000 <dyld_stub_binder+0xe109000>
 2c81e08:      	add	x10, x10, #0x450
 2c81e0c:      	stp	x10, x8, [x0]
 2c81e10:      	stp	xzr, x9, [x0, #0x18]
 2c81e14:      	mov	x8, x0
 2c81e18:      	str	xzr, [x8, #0x40]!
 2c81e1c:      	stp	xzr, x8, [x0, #0x30]
 2c81e20:      	mov	x8, x0
 2c81e24:      	str	xzr, [x8, #0x58]!
 2c81e28:      	stp	xzr, x8, [x0, #0x48]
 2c81e2c:      	mov	x8, x0
 2c81e30:      	str	xzr, [x8, #0x70]!
 2c81e34:      	stp	xzr, x8, [x0, #0x60]
 2c81e38:      	mov	x8, x0
 2c81e3c:      	str	xzr, [x8, #0x88]!
 2c81e40:      	stp	xzr, x8, [x0, #0x78]
 2c81e44:      	add	x8, x0, #0xb0
 2c81e48:      	stp	xzr, xzr, [x0, #0x90]
 2c81e4c:      	stp	xzr, xzr, [x0, #0xa0]
 2c81e50:      	stp	x8, x8, [x0, #0xb0]
 2c81e54:      	str	xzr, [x0, #0xc0]
 2c81e58:      	str	wzr, [x0, #0xc8]
 2c81e5c:      	and	x8, x1, #0xfffffffc00000000
 2c81e60:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2c81e64:      	ldr	x9, [x9, #0x88]
 2c81e68:      	cmp	x8, x9
 2c81e6c:      	b.ne	0x2c81e78 <_ChromeMain+0x2c7cbdc>
 2c81e70:      	mov	x0, x20
 2c81e74:      	bl	0x142fc <_ChromeMain+0xf060>
 2c81e78:      	str	x20, [x19, #0xd0]
 2c81e7c:      	mov	x0, x19
 2c81e80:      	ldp	x29, x30, [sp, #0x10]
 2c81e84:      	ldp	x20, x19, [sp], #0x20
 2c81e88:      	ret
 2c81e8c:      	stp	x29, x30, [sp, #-0x10]!
