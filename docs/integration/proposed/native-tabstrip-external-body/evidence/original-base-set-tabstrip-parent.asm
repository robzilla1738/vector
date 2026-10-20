
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c75ee30:      	b	0xc75ee3c <_ChromeMain+0xc759ba0>
 c75ee34:      	add	x1, sp, #0x8
 c75ee38:      	bl	0xcb84b94 <_ChromeMain+0xcb7f8f8>
 c75ee3c:      	add	x0, sp, #0x8
 c75ee40:      	bl	0xcb8a3b4 <_ChromeMain+0xcb85118>
 c75ee44:      	ldp	x29, x30, [sp, #0x40]
 c75ee48:      	ldp	x20, x19, [sp, #0x30]
 c75ee4c:      	ldp	x22, x21, [sp, #0x20]
 c75ee50:      	ldp	x24, x23, [sp, #0x10]
 c75ee54:      	add	sp, sp, #0x50
 c75ee58:      	ret
 c75ee5c:      	brk	#0
 c75ee60:      	hlt	#0
 c75ee64:      	brk	#0x1
 c75ee68:      	brk	#0
 c75ee6c:      	hlt	#0
 c75ee70:      	brk	#0x1
 c75ee74:      	brk	#0
 c75ee78:      	hlt	#0
 c75ee7c:      	brk	#0x1
 c75ee80:      	sub	sp, sp, #0x60
 c75ee84:      	stp	x22, x21, [sp, #0x30]
 c75ee88:      	stp	x20, x19, [sp, #0x40]
 c75ee8c:      	stp	x29, x30, [sp, #0x50]
 c75ee90:      	add	x29, sp, #0x50
 c75ee94:      	cbz	x1, 0xc75f034 <_ChromeMain+0xc759d98>
 c75ee98:      	mov	x20, x1
 c75ee9c:      	mov	x19, x0
 c75eea0:      	ldr	x8, [x1]
 c75eea4:      	ldr	x8, [x8, #0x58]
 c75eea8:      	mov	x0, x1
 c75eeac:      	blr	x8
 c75eeb0:      	mov	x21, x0
 c75eeb4:      	bl	0x78abd18 <_ChromeMain+0x78a6a7c>
 c75eeb8:      	cmp	x21, #0x0
 c75eebc:      	cset	w8, ne
 c75eec0:      	cmp	x21, x0
 c75eec4:      	ccmp	x21, #0x0, #0x4, ne
 c75eec8:      	b.eq	0xc75eee0 <_ChromeMain+0xc759c44>
 c75eecc:      	ldr	x21, [x21, #0x48]
 c75eed0:      	cmp	x21, #0x0
 c75eed4:      	cset	w8, ne
 c75eed8:      	ccmp	x21, x0, #0x4, ne
 c75eedc:      	b.ne	0xc75eecc <_ChromeMain+0xc759c30>
 c75eee0:      	tbz	w8, #0x0, 0xc75f034 <_ChromeMain+0xc759d98>
 c75eee4:      	and	x8, x20, #0xfffffffc00000000
 c75eee8:      	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 c75eeec:      	ldr	x9, [x21, #0x88]
 c75eef0:      	cmp	x8, x9
 c75eef4:      	b.ne	0xc75ef00 <_ChromeMain+0xc759c64>
 c75eef8:      	mov	x0, x20
 c75eefc:      	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 c75ef00:      	ldr	x0, [x19, #0x478]
 c75ef04:      	and	x8, x0, #0xfffffffc00000000
 c75ef08:      	ldr	x9, [x21, #0x88]
 c75ef0c:      	cmp	x8, x9
 c75ef10:      	b.ne	0xc75ef18 <_ChromeMain+0xc759c7c>
 c75ef14:      	bl	0xcb82884 <_ChromeMain+0xcb7d5e8>
 c75ef18:      	str	x20, [x19, #0x478]
 c75ef1c:      	ldrb	w8, [x20, #0x169]
 c75ef20:      	cbnz	w8, 0xc75f028 <_ChromeMain+0xc759d8c>
 c75ef24:      	ldr	x2, [x19, #0x198]
 c75ef28:      	mov	x0, x19
 c75ef2c:      	mov	x1, x20
 c75ef30:      	bl	0xcb8da14 <_ChromeMain+0xcb88778>
 c75ef34:      	ldr	x20, [x19, #0x478]
 c75ef38:      	mov	x0, sp
 c75ef3c:      	mov	w1, #0x0                ; =0
 c75ef40:      	mov	w2, #0x0                ; =0
 c75ef44:      	mov	w3, #0x0                ; =0
 c75ef48:      	bl	0xcbaa9e8 <_ChromeMain+0xcba574c>
 c75ef4c:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 c75ef50:      	add	x1, x1, #0x548
 c75ef54:      	add	x0, x20, #0xd8
 c75ef58:      	mov	x2, sp
 c75ef5c:      	bl	0xcb8e0bc <_ChromeMain+0xcb88e20>
 c75ef60:      	mov	x0, sp
 c75ef64:      	bl	0xcb8e0c8 <_ChromeMain+0xcb88e2c>
 c75ef68:      	ldr	x20, [x19, #0x498]
 c75ef6c:      	and	x8, x19, #0xfffffffc00000000
 c75ef70:      	ldr	x9, [x21, #0x88]
 c75ef74:      	cmp	x8, x9
 c75ef78:      	b.ne	0xc75ef84 <_ChromeMain+0xc759ce8>
 c75ef7c:      	mov	x0, x19
 c75ef80:      	bl	0xcb82848 <_ChromeMain+0xcb7d5ac>
 c75ef84:      	mov	w0, #0x38               ; =56
 c75ef88:      	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 c75ef8c:      	mov	x21, x0
 c75ef90:      	adrp	x1, 0x3f6d000 <_ChromeMain+0x3f67d64>
 c75ef94:      	add	x1, x1, #0x140
 c75ef98:      	adrp	x2, 0x1ac4000 <_ChromeMain+0x1abed64>
 c75ef9c:      	add	x2, x2, #0x600
 c75efa0:      	bl	0xcb8cb14 <_ChromeMain+0xcb87878>
 c75efa4:      	adrp	x8, 0xdf47000 <dyld_stub_binder+0xdf47000>
 c75efa8:      	ldr	q0, [x8, #0x8f0]
 c75efac:      	str	q0, [x0, #0x20]
 c75efb0:      	str	x19, [x0, #0x30]
 c75efb4:      	mov	x8, sp
 c75efb8:      	mov	x0, x20
 c75efbc:      	mov	x1, x21
 c75efc0:      	bl	0x789e5d4 <_ChromeMain+0x7899338>
 c75efc4:      	add	x8, x19, #0x4e0
 c75efc8:      	ldrb	w9, [x19, #0x4e8]
 c75efcc:      	cbnz	w9, 0xc75efec <_ChromeMain+0xc759d50>
 c75efd0:      	cbz	x8, 0xc75f030 <_ChromeMain+0xc759d94>
 c75efd4:      	add	x0, x19, #0x4e0
 c75efd8:      	mov	x1, sp
 c75efdc:      	bl	0xcb8cb20 <_ChromeMain+0xcb87884>
 c75efe0:      	mov	w8, #0x1                ; =1
 c75efe4:      	strb	w8, [x19, #0x4e8]
 c75efe8:      	b	0xc75eff8 <_ChromeMain+0xc759d5c>
 c75efec:      	add	x0, x19, #0x4e0
 c75eff0:      	mov	x1, sp
 c75eff4:      	bl	0xcb84b94 <_ChromeMain+0xcb7f8f8>
 c75eff8:      	mov	x0, sp
 c75effc:      	bl	0xcb8a3b4 <_ChromeMain+0xcb85118>
 c75f000:      	ldr	x8, [x19]
 c75f004:      	ldr	x8, [x8, #0x4e8]
 c75f008:      	mov	x0, x19
 c75f00c:      	blr	x8
 c75f010:      	ldr	x0, [x19, #0x478]
 c75f014:      	ldp	x29, x30, [sp, #0x50]
 c75f018:      	ldp	x20, x19, [sp, #0x40]
 c75f01c:      	ldp	x22, x21, [sp, #0x30]
 c75f020:      	add	sp, sp, #0x60
 c75f024:      	ret
 c75f028:      	brk	#0
 c75f02c:      	hlt	#0
 c75f030:      	brk	#0x1
 c75f034:      	brk	#0
 c75f038:      	hlt	#0
 c75f03c:      	brk	#0x1
 c75f040:      	stp	x20, x19, [sp, #-0x20]!
 c75f044:      	stp	x29, x30, [sp, #0x10]
 c75f048:      	add	x29, sp, #0x10
 c75f04c:      	ldr	x8, [x0, #0x478]
 c75f050:      	cbz	x8, 0xc75f0c4 <_ChromeMain+0xc759e28>
 c75f054:      	cmp	x8, x1
 c75f058:      	b.ne	0xc75f0d0 <_ChromeMain+0xc759e34>
 c75f05c:      	mov	x19, x0
 c75f060:      	ldrb	w8, [x0, #0x4e8]
 c75f064:      	cbz	w8, 0xc75f074 <_ChromeMain+0xc759dd8>
 c75f068:      	add	x0, x19, #0x4e0
 c75f06c:      	bl	0xcb8a3b4 <_ChromeMain+0xcb85118>
 c75f070:      	strb	wzr, [x19, #0x4e8]
 c75f074:      	ldr	x8, [x19]
 c75f078:      	ldr	x8, [x8, #0x4f0]
 c75f07c:      	mov	x0, x19
 c75f080:      	blr	x8
 c75f084:      	ldr	x20, [x19, #0x478]
 c75f088:      	str	xzr, [x19, #0x478]
 c75f08c:      	mov	x0, x19
 c75f090:      	mov	x1, x20
 c75f094:      	bl	0x7826f00 <_ChromeMain+0x7821c64>
 c75f098:      	cbz	x20, 0xc75f0b8 <_ChromeMain+0xc759e1c>
 c75f09c:      	mov	x0, x20
 c75f0a0:      	bl	0x78aa83c <_ChromeMain+0x78a55a0>
 c75f0a4:      	mov	w1, #0xf90              ; =3984
 c75f0a8:      	movk	w1, #0x6df7, lsl #16
 c75f0ac:      	ldp	x29, x30, [sp, #0x10]
