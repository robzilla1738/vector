
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
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
