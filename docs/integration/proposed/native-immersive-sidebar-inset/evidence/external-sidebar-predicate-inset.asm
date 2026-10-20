
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45e9cc0: d102c3ff     	sub	sp, sp, #0xb0
 45e9cc4: 6d0423e9     	stp	d9, d8, [sp, #0x40]
 45e9cc8: a9056ffc     	stp	x28, x27, [sp, #0x50]
 45e9ccc: a90667fa     	stp	x26, x25, [sp, #0x60]
 45e9cd0: a9075ff8     	stp	x24, x23, [sp, #0x70]
 45e9cd4: a90857f6     	stp	x22, x21, [sp, #0x80]
 45e9cd8: a9094ff4     	stp	x20, x19, [sp, #0x90]
 45e9cdc: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 45e9ce0: 910283fd     	add	x29, sp, #0xa0
 45e9ce4: aa0303f6     	mov	x22, x3
 45e9ce8: aa0203f3     	mov	x19, x2
 45e9cec: aa0103f4     	mov	x20, x1
 45e9cf0: aa0003f5     	mov	x21, x0
 45e9cf4: b940045a     	ldr	w26, [x2, #0x4]
 45e9cf8: f9402c09     	ldr	x9, [x0, #0x58]
 45e9cfc: f9401808     	ldr	x8, [x0, #0x30]
 45e9d00: f100013f     	cmp	x9, #0x0
 45e9d04: fa401904     	ccmp	x8, #0x0, #0x4, ne
 45e9d08: 54000080     	b.eq	0x45e9d18 <_ChromeMain+0x45e4a7c>
 45e9d0c: f940c52a     	ldr	x10, [x9, #0x188]
 45e9d10: eb08015f     	cmp	x10, x8
 45e9d14: 540006e0     	b.eq	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d18: f9409eaa     	ldr	x10, [x21, #0x138]
 45e9d1c: b940354a     	ldr	w10, [x10, #0x34]
 45e9d20: 7100055f     	cmp	w10, #0x1
 45e9d24: 54000661     	b.ne	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d28: f9403ea0     	ldr	x0, [x21, #0x78]
 45e9d2c: f100011f     	cmp	x8, #0x0
 45e9d30: fa401804     	ccmp	x0, #0x0, #0x4, ne
 45e9d34: 540005e0     	b.eq	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d38: f940c40a     	ldr	x10, [x0, #0x188]
 45e9d3c: eb08015f     	cmp	x10, x8
 45e9d40: 54000581     	b.ne	0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d44: 3947200a     	ldrb	w10, [x0, #0x1c8]
 45e9d48: 3400054a     	cbz	w10, 0x45e9df0 <_ChromeMain+0x45e4b54>
 45e9d4c: f00487c1     	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 45e9d50: 9139a021     	add	x1, x1, #0xe68
 45e9d54: 9707afcb     	bl	0x7d5c80 <_ChromeMain+0x7d09e4>
 45e9d58: aa0003f7     	mov	x23, x0
 45e9d5c: f94016a8     	ldr	x8, [x21, #0x28]
 45e9d60: f9400500     	ldr	x0, [x8, #0x8]
 45e9d64: b4004e40     	cbz	x0, 0x45ea72c <_ChromeMain+0x45e5490>
 45e9d68: 952fe2ed     	bl	0x91e291c <_ChromeMain+0x91dd680>
 45e9d6c: 370002e0     	tbnz	w0, #0x0, 0x45e9dc8 <_ChromeMain+0x45e4b2c>
 45e9d70: bd401260     	ldr	s0, [x19, #0x10]
 45e9d74: bd401a61     	ldr	s1, [x19, #0x18]
 45e9d78: 1e212800     	fadd	s0, s0, s1
 45e9d7c: 1e24c001     	frintp	s1, s0
 45e9d80: 52a6b008     	mov	w8, #0x35800000         ; =897581056
 45e9d84: 1e270102     	fmov	s2, w8
 45e9d88: 6f00e403     	movi.2d	v3, #0000000000000000
 45e9d8c: 1e222000     	fcmp	s0, s2
 45e9d90: 1e23cc20     	fcsel	s0, s1, s3, gt
 45e9d94: 0f0665e1     	movi.2s	v1, #0xcf, lsl #24
 45e9d98: 12b00008     	mov	w8, #0x7fffffff         ; =2147483647
 45e9d9c: 1e212000     	fcmp	s0, s1
 45e9da0: 1e21cc01     	fcsel	s1, s0, s1, gt
 45e9da4: 1a88b3e8     	csel	w8, wzr, w8, lt
 45e9da8: 1e380029     	fcvtzs	w9, s1
 45e9dac: 12b6200a     	mov	w10, #0x4effffff        ; =1325400063
 45e9db0: 1e270141     	fmov	s1, w10
 45e9db4: 1e212000     	fcmp	s0, s1
 45e9db8: 1a889128     	csel	w8, w9, w8, ls
 45e9dbc: d503201f     	nop
 45e9dc0: 6b17011f     	cmp	w8, w23
 45e9dc4: 1a97c117     	csel	w23, w8, w23, gt
 45e9dc8: b9400a68     	ldr	w8, [x19, #0x8]
 45e9dcc: 6b17011f     	cmp	w8, w23
 45e9dd0: 1a97b108     	csel	w8, w8, w23, lt
 45e9dd4: d3607d08     	lsl	x8, x8, #32
 45e9dd8: a9037fe8     	stp	x8, xzr, [sp, #0x30]
 45e9ddc: 9100c3e1     	add	x1, sp, #0x30
 45e9de0: aa1303e0     	mov	x0, x19
 45e9de4: 96f78c71     	bl	0x3ccfa8 <_ChromeMain+0x3c7d0c>
 45e9de8: f9402ea9     	ldr	x9, [x21, #0x58]
 45e9dec: f9401aa8     	ldr	x8, [x21, #0x30]
