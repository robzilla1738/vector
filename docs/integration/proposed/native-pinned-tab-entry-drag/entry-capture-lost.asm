
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460ce54: d10143ff     	sub	sp, sp, #0x50
 460ce58: a90257f6     	stp	x22, x21, [sp, #0x20]
 460ce5c: a9034ff4     	stp	x20, x19, [sp, #0x30]
 460ce60: a9047bfd     	stp	x29, x30, [sp, #0x40]
 460ce64: 910103fd     	add	x29, sp, #0x40
 460ce68: 394fe808     	ldrb	w8, [x0, #0x3fa]
 460ce6c: 910fe409     	add	x9, x0, #0x3f9
 460ce70: 7900013f     	strh	wzr, [x9]
 460ce74: 910fa009     	add	x9, x0, #0x3e8
 460ce78: 6f00e400     	movi.2d	v0, #0000000000000000
 460ce7c: 3d800120     	str	q0, [x9]
 460ce80: f941e814     	ldr	x20, [x0, #0x3d0]
 460ce84: 350006a8     	cbnz	w8, 0x460cf58 <_ChromeMain+0x4607cbc>
 460ce88: b40005f4     	cbz	x20, 0x460cf44 <_ChromeMain+0x4607ca8>
 460ce8c: f00537a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 460ce90: 9135a000     	add	x0, x0, #0xd68
 460ce94: f9400008     	ldr	x8, [x0]
 460ce98: d63f0100     	blr	x8
 460ce9c: f9400008     	ldr	x8, [x0]
 460cea0: b4000b08     	cbz	x8, 0x460d000 <_ChromeMain+0x4607d64>
 460cea4: f9400113     	ldr	x19, [x8]
 460cea8: b4000ad3     	cbz	x19, 0x460d000 <_ChromeMain+0x4607d64>
 460ceac: f004c5e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460ceb0: 9117a400     	add	x0, x0, #0x5e9
 460ceb4: f004c5e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460ceb8: 91183021     	add	x1, x1, #0x60c
 460cebc: 910003e8     	mov	x8, sp
 460cec0: 52809a02     	mov	w2, #0x4d0              ; =1232
 460cec4: 96e90f6f     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 460cec8: f9430695     	ldr	x21, [x20, #0x608]
 460cecc: b40000d5     	cbz	x21, 0x460cee4 <_ChromeMain+0x4607c48>
 460ced0: 52800028     	mov	w8, #0x1                ; =1
 460ced4: b82802a8     	ldadd	w8, w8, [x21]
 460ced8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460cedc: 6b09011f     	cmp	w8, w9
 460cee0: 540009c0     	b.eq	0x460d018 <_ChromeMain+0x4607d7c>
 460cee4: f9430a94     	ldr	x20, [x20, #0x610]
 460cee8: 52800800     	mov	w0, #0x40               ; =64
 460ceec: 96e8091f     	bl	0xf368 <_ChromeMain+0xa0cc>
 460cef0: aa0003e2     	mov	x2, x0
 460cef4: 52800028     	mov	w8, #0x1                ; =1
 460cef8: b9000008     	str	w8, [x0]
 460cefc: d0ffcb08     	adrp	x8, 0x3f6e000 <_ChromeMain+0x3f68d64>
 460cf00: 91230108     	add	x8, x8, #0x8c0
 460cf04: 90ffcb09     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 460cf08: 912b0129     	add	x9, x9, #0xac0
 460cf0c: a900a408     	stp	x8, x9, [x0, #0x8]
 460cf10: d0ffd508     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 460cf14: 911b0108     	add	x8, x8, #0x6c0
 460cf18: 10fe1a49     	adr	x9, 0x4609260 <_ChromeMain+0x4603fc4>
 460cf1c: d503201f     	nop
 460cf20: a901a408     	stp	x8, x9, [x0, #0x18]
 460cf24: a902d41f     	stp	xzr, x21, [x0, #0x28]
 460cf28: f9001c14     	str	x20, [x0, #0x38]
 460cf2c: f9400268     	ldr	x8, [x19]
 460cf30: f9400108     	ldr	x8, [x8]
 460cf34: 910003e1     	mov	x1, sp
 460cf38: aa1303e0     	mov	x0, x19
 460cf3c: d2800003     	mov	x3, #0x0                ; =0
 460cf40: d63f0100     	blr	x8
 460cf44: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 460cf48: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 460cf4c: a94257f6     	ldp	x22, x21, [sp, #0x20]
 460cf50: 910143ff     	add	sp, sp, #0x50
 460cf54: d65f03c0     	ret
 460cf58: b4ffff74     	cbz	x20, 0x460cf44 <_ChromeMain+0x4607ca8>
 460cf5c: b4ffff40     	cbz	x0, 0x460cf44 <_ChromeMain+0x4607ca8>
 460cf60: 39544288     	ldrb	w8, [x20, #0x510]
 460cf64: 3607ff08     	tbz	w8, #0x0, 0x460cf44 <_ChromeMain+0x4607ca8>
 460cf68: f00537a0     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 460cf6c: 9135a000     	add	x0, x0, #0xd68
 460cf70: f9400008     	ldr	x8, [x0]
 460cf74: d63f0100     	blr	x8
 460cf78: f9400008     	ldr	x8, [x0]
 460cf7c: b4000488     	cbz	x8, 0x460d00c <_ChromeMain+0x4607d70>
 460cf80: f9400113     	ldr	x19, [x8]
 460cf84: b4000453     	cbz	x19, 0x460d00c <_ChromeMain+0x4607d70>
 460cf88: f004c5e0     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460cf8c: 91195000     	add	x0, x0, #0x654
 460cf90: f004c5e1     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 460cf94: 91183021     	add	x1, x1, #0x60c
 460cf98: 910003e8     	mov	x8, sp
 460cf9c: 5280d342     	mov	w2, #0x69a              ; =1690
 460cfa0: 96e90f38     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 460cfa4: f9430695     	ldr	x21, [x20, #0x608]
 460cfa8: b40000d5     	cbz	x21, 0x460cfc0 <_ChromeMain+0x4607d24>
 460cfac: 52800028     	mov	w8, #0x1                ; =1
 460cfb0: b82802a8     	ldadd	w8, w8, [x21]
 460cfb4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460cfb8: 6b09011f     	cmp	w8, w9
 460cfbc: 54000340     	b.eq	0x460d024 <_ChromeMain+0x4607d88>
 460cfc0: f9430a94     	ldr	x20, [x20, #0x610]
 460cfc4: 52800700     	mov	w0, #0x38               ; =56
 460cfc8: 96e808e8     	bl	0xf368 <_ChromeMain+0xa0cc>
 460cfcc: aa0003e2     	mov	x2, x0
 460cfd0: 52800028     	mov	w8, #0x1                ; =1
 460cfd4: 10011129     	adr	x9, 0x460f1f8 <_ChromeMain+0x4609f5c>
 460cfd8: d503201f     	nop
 460cfdc: b9000008     	str	w8, [x0]
 460cfe0: f0ffd148     	adrp	x8, 0x4037000 <_ChromeMain+0x4031d64>
 460cfe4: 91130108     	add	x8, x8, #0x4c0
 460cfe8: b0fefa8a     	adrp	x10, 0x255d000 <_ChromeMain+0x2557d64>
 460cfec: 912c014a     	add	x10, x10, #0xb00
 460cff0: a900a009     	stp	x9, x8, [x0, #0x8]
 460cff4: f9000c0a     	str	x10, [x0, #0x18]
 460cff8: a902d015     	stp	x21, x20, [x0, #0x28]
 460cffc: 17ffffcc     	b	0x460cf2c <_ChromeMain+0x4607c90>
 460d000: d4200000     	brk	#0
 460d004: d4400000     	hlt	#0
 460d008: d4200020     	brk	#0x1
 460d00c: d4200000     	brk	#0
 460d010: d4400000     	hlt	#0
 460d014: d4200020     	brk	#0x1
 460d018: d4200000     	brk	#0
 460d01c: d4400000     	hlt	#0
 460d020: d4200020     	brk	#0x1
 460d024: d4200000     	brk	#0
 460d028: d4400000     	hlt	#0
 460d02c: d4200020     	brk	#0x1
