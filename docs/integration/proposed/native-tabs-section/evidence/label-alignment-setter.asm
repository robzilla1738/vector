
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1b89d00: d100c3ff     	sub	sp, sp, #0x30
 1b89d04: a9014ff4     	stp	x20, x19, [sp, #0x10]
 1b89d08: a9027bfd     	stp	x29, x30, [sp, #0x20]
 1b89d0c: 910083fd     	add	x29, sp, #0x20
 1b89d10: aa0003f3     	mov	x19, x0
 1b89d14: b0069c34     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 1b89d18: b947aa80     	ldr	w0, [x20, #0x7a8]
 1b89d1c: 34000500     	cbz	w0, 0x1b89dbc <_ChromeMain+0x1b84b20>
 1b89d20: 52800048     	mov	w8, #0x2                ; =2
 1b89d24: 7100003f     	cmp	w1, #0x0
 1b89d28: 1a9f0108     	csel	w8, w8, wzr, eq
 1b89d2c: 7100041f     	cmp	w0, #0x1
 1b89d30: 121e7829     	and	w9, w1, #0xfffffffd
 1b89d34: 7a400920     	ccmp	w9, #0x0, #0x0, eq
 1b89d38: 1a810109     	csel	w9, w8, w1, eq
 1b89d3c: f941ae68     	ldr	x8, [x19, #0x358]
 1b89d40: b940310a     	ldr	w10, [x8, #0x30]
 1b89d44: 6b09015f     	cmp	w10, w9
 1b89d48: 54000200     	b.eq	0x1b89d88 <_ChromeMain+0x1b84aec>
 1b89d4c: 910d6274     	add	x20, x19, #0x358
 1b89d50: b9003109     	str	w9, [x8, #0x30]
 1b89d54: 91107109     	add	x9, x8, #0x41c
 1b89d58: f900013f     	str	xzr, [x9]
 1b89d5c: 3910a11f     	strb	wzr, [x8, #0x428]
 1b89d60: f941b260     	ldr	x0, [x19, #0x360]
 1b89d64: b50001a0     	cbnz	x0, 0x1b89d98 <_ChromeMain+0x1b84afc>
 1b89d68: aa1303e0     	mov	x0, x19
 1b89d6c: 52800041     	mov	w1, #0x2                ; =2
 1b89d70: 97b15efd     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 1b89d74: 9103e260     	add	x0, x19, #0xf8
 1b89d78: b2400681     	orr	x1, x20, #0x3
 1b89d7c: 97ce7895     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
