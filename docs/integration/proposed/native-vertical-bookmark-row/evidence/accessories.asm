
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4623d40:      	sub	sp, sp, #0x40
 4623d44:      	stp	x22, x21, [sp, #0x10]
 4623d48:      	stp	x20, x19, [sp, #0x20]
 4623d4c:      	stp	x29, x30, [sp, #0x30]
 4623d50:      	add	x29, sp, #0x30
 4623d54:      	mov	x19, x0
 4623d58:      	ldr	x8, [x0, #0x3e0]
 4623d5c:      	ldr	w20, [x8, #0xf8]
 4623d60:      	ldrb	w8, [x0, #0x446]
 4623d64:      	tbnz	w8, #0x0, 0x4623d80 <_ChromeMain+0x461eae4>
 4623d68:      	ldrb	w9, [x19, #0x443]
 4623d6c:      	cmp	w9, #0x0
 4623d70:      	ccmp	w20, #0x0, #0x0, ne
 4623d74:      	b.ne	0x4623d80 <_ChromeMain+0x461eae4>
 4623d78:      	ldrb	w21, [x19, #0x441]
 4623d7c:      	b	0x4623d84 <_ChromeMain+0x461eae8>
 4623d80:      	mov	w21, #0x0               ; =0
 4623d84:      	ldr	x0, [x19, #0x430]
 4623d88:      	cbz	x0, 0x4623db0 <_ChromeMain+0x461eb14>
 4623d8c:      	eor	w8, w8, #0x1
 4623d90:      	cmp	w20, #0x0
 4623d94:      	csel	w1, wzr, w8, eq
 4623d98:      	ldrb	w8, [x0, #0x1c8]
 4623d9c:      	cmp	w1, w8
 4623da0:      	b.eq	0x4623db0 <_ChromeMain+0x461eb14>
 4623da4:      	ldr	x8, [x0]
 4623da8:      	ldr	x8, [x8, #0xa0]
 4623dac:      	blr	x8
 4623db0:      	ldr	x0, [x19, #0x438]
 4623db4:      	cbz	x0, 0x4623dd8 <_ChromeMain+0x461eb3c>
 4623db8:      	ldrb	w8, [x0, #0x1c8]
 4623dbc:      	and	w9, w21, #0x1
 4623dc0:      	cmp	w9, w8
 4623dc4:      	b.eq	0x4623dd8 <_ChromeMain+0x461eb3c>
 4623dc8:      	ldr	x8, [x0]
 4623dcc:      	ldr	x8, [x8, #0xa0]
 4623dd0:      	and	w1, w21, #0x1
 4623dd4:      	blr	x8
 4623dd8:      	ldr	x8, [x19, #0x428]
 4623ddc:      	cbz	x8, 0x4623e40 <_ChromeMain+0x461eba4>
 4623de0:      	cmp	w20, #0x0
 4623de4:      	cset	w9, ne
 4623de8:      	ldrb	w10, [x19, #0x446]
 4623dec:      	orr	w10, w10, w21
 4623df0:      	orr	w9, w9, w10
 4623df4:      	tst	w9, #0x1
 4623df8:      	mov	x9, #0x400000000        ; =17179869184
 4623dfc:      	csel	x9, xzr, x9, ne
 4623e00:      	stp	xzr, x9, [sp]
 4623e04:      	ldr	x10, [x8, #0xe8]!
 4623e08:      	cbz	x10, 0x4623e2c <_ChromeMain+0x461eb90>
 4623e0c:      	adrp	x11, 0xea05000 <dyld_stub_binder+0xea05000>
 4623e10:      	add	x11, x11, #0x488
 4623e14:      	ldr	x12, [x10, #0x20]
 4623e18:      	cmp	x12, x11
 4623e1c:      	b.hi	0x4623e54 <_ChromeMain+0x461ebb8>
 4623e20:      	b.hs	0x4623e60 <_ChromeMain+0x461ebc4>
 4623e24:      	ldr	x10, [x10, #0x8]
 4623e28:      	cbnz	x10, 0x4623e14 <_ChromeMain+0x461eb78>
 4623e2c:      	sub	x0, x8, #0x10
 4623e30:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4623e34:      	add	x1, x1, #0x488
 4623e38:      	mov	x2, sp
 4623e3c:      	bl	0x31af9c4 <_ChromeMain+0x31aa728>
 4623e40:      	ldp	x29, x30, [sp, #0x30]
 4623e44:      	ldp	x20, x19, [sp, #0x20]
 4623e48:      	ldp	x22, x21, [sp, #0x10]
 4623e4c:      	add	sp, sp, #0x40
 4623e50:      	ret
 4623e54:      	ldr	x10, [x10]
 4623e58:      	cbnz	x10, 0x4623e14 <_ChromeMain+0x461eb78>
 4623e5c:      	b	0x4623e2c <_ChromeMain+0x461eb90>
 4623e60:      	cmp	x10, x8
 4623e64:      	b.eq	0x4623e2c <_ChromeMain+0x461eb90>
 4623e68:      	ldr	x10, [x10, #0x30]
 4623e6c:      	cbz	x10, 0x4623e2c <_ChromeMain+0x461eb90>
 4623e70:      	ldr	w11, [x10]
 4623e74:      	cbnz	w11, 0x4623e2c <_ChromeMain+0x461eb90>
 4623e78:      	ldr	w11, [x10, #0x4]
 4623e7c:      	cbnz	w11, 0x4623e2c <_ChromeMain+0x461eb90>
 4623e80:      	ldr	w11, [x10, #0x8]
 4623e84:      	cbnz	w11, 0x4623e2c <_ChromeMain+0x461eb90>
 4623e88:      	lsr	x9, x9, #32
 4623e8c:      	ldr	w10, [x10, #0xc]
 4623e90:      	cmp	w10, w9
 4623e94:      	b.eq	0x4623e40 <_ChromeMain+0x461eba4>
 4623e98:      	b	0x4623e2c <_ChromeMain+0x461eb90>
 4623e9c:      	nop
 4623ea0:      	nop
 4623ea4:      	nop
 4623ea8:      	nop
 4623eac:      	nop
 4623eb0:      	nop
 4623eb4:      	nop
 4623eb8:      	nop
 4623ebc:      	nop
