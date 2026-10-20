
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4684ce0: aa0003f4     	mov	x20, x0
 4684ce4: f9428276     	ldr	x22, [x19, #0x500]
 4684ce8: f9428675     	ldr	x21, [x19, #0x508]
 4684cec: f9429678     	ldr	x24, [x19, #0x528]
 4684cf0: f9429a7a     	ldr	x26, [x19, #0x530]
 4684cf4: aa1303e1     	mov	x1, x19
 4684cf8: d2800002     	mov	x2, #0x0                ; =0
 4684cfc: 52800003     	mov	w3, #0x0                ; =0
 4684d00: 94d40722     	bl	0x7b86988 <_ChromeMain+0x7b816ec>
 4684d04: 6f00e400     	movi.2d	v0, #0000000000000000
 4684d08: 3d81ec00     	str	q0, [x0, #0x7b0]
 4684d0c: 911ec008     	add	x8, x0, #0x7b0
 4684d10: f903d408     	str	x8, [x0, #0x7a8]
 4684d14: f0050568     	adrp	x8, 0xe733000 <dyld_stub_binder+0xe733000>
 4684d18: 911fc108     	add	x8, x8, #0x7f0
 4684d1c: 91110109     	add	x9, x8, #0x440
 4684d20: a9002408     	stp	x8, x9, [x0]
 4684d24: 9111a109     	add	x9, x8, #0x468
 4684d28: f9000809     	str	x9, [x0, #0x10]
 4684d2c: 91128109     	add	x9, x8, #0x4a0
 4684d30: 9113410a     	add	x10, x8, #0x4d0
 4684d34: a906a809     	stp	x9, x10, [x0, #0x68]
 4684d38: 91148109     	add	x9, x8, #0x520
 4684d3c: f9005809     	str	x9, [x0, #0xb0]
 4684d40: 91160109     	add	x9, x8, #0x580
 4684d44: f9006c09     	str	x9, [x0, #0xd8]
 4684d48: 9116c109     	add	x9, x8, #0x5b0
 4684d4c: f9007c09     	str	x9, [x0, #0xf8]
 4684d50: 91176109     	add	x9, x8, #0x5d8
 4684d54: f9018809     	str	x9, [x0, #0x310]
 4684d58: 911f4109     	add	x9, x8, #0x7d0
 4684d5c: f903b009     	str	x9, [x0, #0x760]
 4684d60: 912f4108     	add	x8, x8, #0xbd0
 4684d64: f903d008     	str	x8, [x0, #0x7a0]
 4684d68: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4684d6c: d0052977     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4684d70: f94046e9     	ldr	x9, [x23, #0x88]
 4684d74: eb09011f     	cmp	x8, x9
 4684d78: 54000061     	b.ne	0x4684d84 <_ChromeMain+0x467fae8>
 4684d7c: aa1603e0     	mov	x0, x22
 4684d80: 96e63d5f     	bl	0x142fc <_ChromeMain+0xf060>
 4684d84: f903e296     	str	x22, [x20, #0x7c0]
 4684d88: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4684d8c: f94046e9     	ldr	x9, [x23, #0x88]
 4684d90: eb09011f     	cmp	x8, x9
 4684d94: 54000061     	b.ne	0x4684da0 <_ChromeMain+0x467fb04>
 4684d98: aa1503e0     	mov	x0, x21
 4684d9c: 96e63d58     	bl	0x142fc <_ChromeMain+0xf060>
 4684da0: f903e695     	str	x21, [x20, #0x7c8]
 4684da4: f903ea98     	str	x24, [x20, #0x7d0]
 4684da8: f903ee9a     	str	x26, [x20, #0x7d8]
