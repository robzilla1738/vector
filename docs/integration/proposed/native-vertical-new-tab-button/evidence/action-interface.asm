
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4243bbc: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4243bc0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4243bc4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4243bc8: 910083fd     	add	x29, sp, #0x20
 4243bcc: aa0003f3     	mov	x19, x0
 4243bd0: 52800500     	mov	w0, #0x28               ; =40
 4243bd4: 96f72de5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4243bd8: aa0003f4     	mov	x20, x0
 4243bdc: aa1303e1     	mov	x1, x19
 4243be0: 9793ee39     	bl	0x273f4c4 <_ChromeMain+0x273a228>
 4243be4: d0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4243be8: 910d0108     	add	x8, x8, #0x340
 4243bec: f9000008     	str	x8, [x0]
 4243bf0: 925e7676     	and	x22, x19, #0xfffffffc00000000
 4243bf4: f0054b75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4243bf8: f94046a8     	ldr	x8, [x21, #0x88]
 4243bfc: eb0802df     	cmp	x22, x8
 4243c00: 54000061     	b.ne	0x4243c0c <_ChromeMain+0x423e970>
 4243c04: aa1303e0     	mov	x0, x19
 4243c08: 96f741bd     	bl	0x142fc <_ChromeMain+0xf060>
 4243c0c: f9000a93     	str	x19, [x20, #0x10]
 4243c10: d0050848     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4243c14: 912a6108     	add	x8, x8, #0xa98
 4243c18: f9000288     	str	x8, [x20]
 4243c1c: f94046a8     	ldr	x8, [x21, #0x88]
 4243c20: eb0802df     	cmp	x22, x8
 4243c24: 54000061     	b.ne	0x4243c30 <_ChromeMain+0x423e994>
 4243c28: aa1303e0     	mov	x0, x19
 4243c2c: 96f741b4     	bl	0x142fc <_ChromeMain+0xf060>
 4243c30: f9000e93     	str	x19, [x20, #0x18]
 4243c34: 90050068     	adrp	x8, 0xe24f000 <dyld_stub_binder+0xe24f000>
 4243c38: 913c2108     	add	x8, x8, #0xf08
 4243c3c: f9000288     	str	x8, [x20]
 4243c40: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4243c44: f94046a9     	ldr	x9, [x21, #0x88]
 4243c48: eb09011f     	cmp	x8, x9
 4243c4c: 54000061     	b.ne	0x4243c58 <_ChromeMain+0x423e9bc>
 4243c50: aa1303e0     	mov	x0, x19
 4243c54: 96f741aa     	bl	0x142fc <_ChromeMain+0xf060>
 4243c58: f9001293     	str	x19, [x20, #0x20]
 4243c5c: aa1403e0     	mov	x0, x20
 4243c60: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4243c64: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4243c68: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4243c6c: d65f03c0     	ret
 4243c70: d10103ff     	sub	sp, sp, #0x40
 4243c74: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4243c78: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4243c7c: 9100c3fd     	add	x29, sp, #0x30
 4243c80: aa0003f3     	mov	x19, x0
 4243c84: 97338e8d     	bl	0xf276b8 <_ChromeMain+0xf2241c>
 4243c88: 52801d88     	mov	w8, #0xec               ; =236
 4243c8c: b90017e8     	str	w8, [sp, #0x14]
 4243c90: 390063ff     	strb	wzr, [sp, #0x18]
 4243c94: 52800028     	mov	w8, #0x1                ; =1
 4243c98: 390073e8     	strb	w8, [sp, #0x1c]
 4243c9c: f9400268     	ldr	x8, [x19]
 4243ca0: f9423508     	ldr	x8, [x8, #0x468]
 4243ca4: 910053e1     	add	x1, sp, #0x14
 4243ca8: aa1303e0     	mov	x0, x19
 4243cac: d63f0100     	blr	x8
 4243cb0: f9431e68     	ldr	x8, [x19, #0x638]
 4243cb4: b4000268     	cbz	x8, 0x4243d00 <_ChromeMain+0x423ea64>
 4243cb8: aa1303e0     	mov	x0, x19
 4243cbc: 970d74cd     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4243cc0: b4000200     	cbz	x0, 0x4243d00 <_ChromeMain+0x423ea64>
 4243cc4: f9431e74     	ldr	x20, [x19, #0x638]
 4243cc8: aa1303e0     	mov	x0, x19
 4243ccc: 970d74c9     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4243cd0: 52801c41     	mov	w1, #0xe2               ; =226
 4243cd4: 9733913d     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4243cd8: 52b32008     	mov	w8, #-0x67000000        ; =-1728053248
 4243cdc: 33005c08     	bfxil	w8, w0, #0, #24
 4243ce0: b9000fe8     	str	w8, [sp, #0xc]
 4243ce4: 52800028     	mov	w8, #0x1                ; =1
 4243ce8: 390043e8     	strb	w8, [sp, #0x10]
 4243cec: f9400288     	ldr	x8, [x20]
 4243cf0: f941f508     	ldr	x8, [x8, #0x3e8]
 4243cf4: 910033e1     	add	x1, sp, #0xc
 4243cf8: aa1403e0     	mov	x0, x20
 4243cfc: d63f0100     	blr	x8
 4243d00: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4243d04: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4243d08: 910103ff     	add	sp, sp, #0x40
 4243d0c: d65f03c0     	ret
