
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4655d50: d10183ff     	sub	sp, sp, #0x60
 4655d54: a90357f6     	stp	x22, x21, [sp, #0x30]
 4655d58: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4655d5c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4655d60: 910143fd     	add	x29, sp, #0x50
 4655d64: aa0003f4     	mov	x20, x0
 4655d68: 39405c28     	ldrb	w8, [x1, #0x17]
 4655d6c: f9400429     	ldr	x9, [x1, #0x8]
 4655d70: 7219011f     	tst	w8, #0x80
 4655d74: 9a881128     	csel	x8, x9, x8, ne
 4655d78: b0054495     	adrp	x21, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4655d7c: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4655d80: f100011f     	cmp	x8, #0x0
 4655d84: fa401804     	ccmp	x0, #0x0, #0x4, ne
 4655d88: 54000420     	b.eq	0x4655e0c <_ChromeMain+0x4650b70>
 4655d8c: aa0103f3     	mov	x19, x1
 4655d90: 974f277a     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4655d94: b40003c0     	cbz	x0, 0x4655e0c <_ChromeMain+0x4650b70>
 4655d98: f9467ea0     	ldr	x0, [x21, #0xcf8]
 4655d9c: 974f2777     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4655da0: aa1303e1     	mov	x1, x19
 4655da4: 97853e40     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 4655da8: b4000320     	cbz	x0, 0x4655e0c <_ChromeMain+0x4650b70>
 4655dac: f9400008     	ldr	x8, [x0]
 4655db0: f940a508     	ldr	x8, [x8, #0x148]
 4655db4: d63f0100     	blr	x8
 4655db8: b40002a0     	cbz	x0, 0x4655e0c <_ChromeMain+0x4650b70>
 4655dbc: 976ab96b     	bl	0x2104368 <_ChromeMain+0x20ff0cc>
 4655dc0: b4000260     	cbz	x0, 0x4655e0c <_ChromeMain+0x4650b70>
 4655dc4: f9422e88     	ldr	x8, [x20, #0x458]
 4655dc8: b4000048     	cbz	x8, 0x4655dd0 <_ChromeMain+0x4650b34>
 4655dcc: f9429d08     	ldr	x8, [x8, #0x538]
 4655dd0: f90017e8     	str	x8, [sp, #0x28]
 4655dd4: 39009fff     	strb	wzr, [sp, #0x27]
 4655dd8: 9100a3e8     	add	x8, sp, #0x28
 4655ddc: a900cfe8     	stp	x8, x19, [sp, #0x8]
 4655de0: 91009fe8     	add	x8, sp, #0x27
 4655de4: 1016bfa2     	adr	x2, 0x46835d8 <_ChromeMain+0x467e33c>
 4655de8: d503201f     	nop
 4655dec: f9000fe8     	str	x8, [sp, #0x18]
 4655df0: 91002000     	add	x0, x0, #0x8
 4655df4: 910023e1     	add	x1, sp, #0x8
 4655df8: 52800003     	mov	w3, #0x0                ; =0
 4655dfc: 52800004     	mov	w4, #0x0                ; =0
 4655e00: 971d6e9c     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4655e04: 39409fe8     	ldrb	w8, [sp, #0x27]
 4655e08: 14000002     	b	0x4655e10 <_ChromeMain+0x4650b74>
 4655e0c: 52800008     	mov	w8, #0x0                ; =0
 4655e10: 12000100     	and	w0, w8, #0x1
 4655e14: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4655e18: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4655e1c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4655e20: 910183ff     	add	sp, sp, #0x60
 4655e24: d65f03c0     	ret
