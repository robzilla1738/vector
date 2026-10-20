
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4253d68: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 4253d6c: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4253d70: a90257f6     	stp	x22, x21, [sp, #0x20]
 4253d74: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4253d78: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4253d7c: 910103fd     	add	x29, sp, #0x40
 4253d80: aa0303f4     	mov	x20, x3
 4253d84: aa0203f8     	mov	x24, x2
 4253d88: aa0103f3     	mov	x19, x1
 4253d8c: aa0003f5     	mov	x21, x0
 4253d90: 52800100     	mov	w0, #0x8                ; =8
 4253d94: 96f6ed75     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253d98: aa0003f6     	mov	x22, x0
 4253d9c: f900001f     	str	xzr, [x0]
 4253da0: 52800700     	mov	w0, #0x38               ; =56
 4253da4: 96f6ed71     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253da8: aa0003f7     	mov	x23, x0
 4253dac: 5280003a     	mov	w26, #0x1               ; =1
 4253db0: b900001a     	str	w26, [x0]
 4253db4: d0fea288     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 4253db8: 91190108     	add	x8, x8, #0x640
 4253dbc: d0ffeaa9     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 4253dc0: 91290129     	add	x9, x9, #0xa40
 4253dc4: a900a408     	stp	x8, x9, [x0, #0x8]
 4253dc8: d0ff1859     	adrp	x25, 0x255d000 <_ChromeMain+0x2557d64>
 4253dcc: 912c0339     	add	x25, x25, #0xb00
 4253dd0: 1005e908     	adr	x8, 0x425faf0 <_ChromeMain+0x425a854>
 4253dd4: d503201f     	nop
 4253dd8: a901a019     	stp	x25, x8, [x0, #0x18]
 4253ddc: f9001418     	str	x24, [x0, #0x28]
 4253de0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4253de4: f0054ae9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4253de8: f9404529     	ldr	x9, [x9, #0x88]
 4253dec: eb09011f     	cmp	x8, x9
 4253df0: 54000061     	b.ne	0x4253dfc <_ChromeMain+0x424eb60>
 4253df4: aa1603e0     	mov	x0, x22
 4253df8: 96f70141     	bl	0x142fc <_ChromeMain+0xf060>
 4253dfc: f9001af6     	str	x22, [x23, #0x30]
 4253e00: 52800700     	mov	w0, #0x38               ; =56
 4253e04: 96f6ed59     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253e08: aa0003e3     	mov	x3, x0
 4253e0c: b900001a     	str	w26, [x0]
 4253e10: d0feab88     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 4253e14: 91380108     	add	x8, x8, #0xe00
 4253e18: 1005ffc9     	adr	x9, 0x425fe10 <_ChromeMain+0x425ab74>
 4253e1c: d503201f     	nop
 4253e20: a900a408     	stp	x8, x9, [x0, #0x8]
 4253e24: 1005f368     	adr	x8, 0x425fc90 <_ChromeMain+0x425a9f4>
 4253e28: d503201f     	nop
 4253e2c: a901a019     	stp	x25, x8, [x0, #0x18]
 4253e30: a902d814     	stp	x20, x22, [x0, #0x28]
 4253e34: aa1503e0     	mov	x0, x21
 4253e38: aa1303e1     	mov	x1, x19
 4253e3c: aa1703e2     	mov	x2, x23
 4253e40: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4253e44: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4253e48: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4253e4c: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4253e50: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4253e54: 173cfb17     	b	0x1192ab0 <_ChromeMain+0x118d814>
