
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4688c10: d102c3ff     	sub	sp, sp, #0xb0
 4688c14: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4688c18: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4688c1c: 910283fd     	add	x29, sp, #0xa0
 4688c20: aa0103f4     	mov	x20, x1
 4688c24: aa0003f3     	mov	x19, x0
 4688c28: 96fc60f2     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4688c2c: b4000700     	cbz	x0, 0x4688d0c <_ChromeMain+0x4683a70>
 4688c30: aa1303e0     	mov	x0, x19
 4688c34: 97490a2f     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 4688c38: 370000c0     	tbnz	w0, #0x0, 0x4688c50 <_ChromeMain+0x46839b4>
 4688c3c: f9400268     	ldr	x8, [x19]
 4688c40: f9410908     	ldr	x8, [x8, #0x210]
 4688c44: aa1303e0     	mov	x0, x19
 4688c48: d63f0100     	blr	x8
 4688c4c: 34000600     	cbz	w0, 0x4688d0c <_ChromeMain+0x4683a70>
 4688c50: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4688c54: 6f00e400     	movi.2d	v0, #0000000000000000
 4688c58: 3c8583e0     	stur	q0, [sp, #0x58]
 4688c5c: 3c8683e0     	stur	q0, [sp, #0x68]
 4688c60: f9003fff     	str	xzr, [sp, #0x78]
 4688c64: d2806029     	mov	x9, #0x301              ; =769
 4688c68: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4688c6c: a904a7e8     	stp	x8, x9, [sp, #0x48]
 4688c70: aa1303e0     	mov	x0, x19
 4688c74: 96fc60df     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4688c78: 52801f01     	mov	w1, #0xf8               ; =248
 4688c7c: 97227d53     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4688c80: 971d183a     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4688c84: 2d0707e0     	stp	s0, s1, [sp, #0x38]
 4688c88: 2d080fe2     	stp	s2, s3, [sp, #0x40]
 4688c8c: f9406294     	ldr	x20, [x20, #0xc0]
 4688c90: bd41c260     	ldr	s0, [x19, #0x1c0]
 4688c94: 5e21d800     	scvtf	s0, s0
 4688c98: bd41c661     	ldr	s1, [x19, #0x1c4]
 4688c9c: 5e21d821     	scvtf	s1, s1
 4688ca0: f81e03bf     	stur	xzr, [x29, #-0x20]
 4688ca4: 2d3d07a0     	stp	s0, s1, [x29, #-0x18]
 4688ca8: 6f00e400     	movi.2d	v0, #0000000000000000
 4688cac: ad0003e0     	stp	q0, q0, [sp]
 4688cb0: 3d800be0     	str	q0, [sp, #0x20]
 4688cb4: b90033ff     	str	wzr, [sp, #0x30]
 4688cb8: 910003e0     	mov	x0, sp
 4688cbc: d10083a1     	sub	x1, x29, #0x20
 4688cc0: 1e241000     	fmov	s0, #8.00000000
 4688cc4: 1e241001     	fmov	s1, #8.00000000
 4688cc8: 9709814e     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 4688ccc: f9400288     	ldr	x8, [x20]
 4688cd0: f9407d08     	ldr	x8, [x8, #0xf8]
 4688cd4: 910003e1     	mov	x1, sp
 4688cd8: 9100e3e2     	add	x2, sp, #0x38
 4688cdc: aa1403e0     	mov	x0, x20
 4688ce0: d63f0100     	blr	x8
 4688ce4: f9403fe0     	ldr	x0, [sp, #0x78]
 4688ce8: b5000480     	cbnz	x0, 0x4688d78 <_ChromeMain+0x4683adc>
 4688cec: f9403be0     	ldr	x0, [sp, #0x70]
 4688cf0: b5000320     	cbnz	x0, 0x4688d54 <_ChromeMain+0x4683ab8>
 4688cf4: f94037e0     	ldr	x0, [sp, #0x68]
 4688cf8: b5000640     	cbnz	x0, 0x4688dc0 <_ChromeMain+0x4683b24>
 4688cfc: f94033e0     	ldr	x0, [sp, #0x60]
 4688d00: b50000e0     	cbnz	x0, 0x4688d1c <_ChromeMain+0x4683a80>
 4688d04: f9402fe0     	ldr	x0, [sp, #0x58]
 4688d08: b50004a0     	cbnz	x0, 0x4688d9c <_ChromeMain+0x4683b00>
 4688d0c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4688d10: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4688d14: 9102c3ff     	add	sp, sp, #0xb0
 4688d18: d65f03c0     	ret
 4688d1c: 91002008     	add	x8, x0, #0x8
 4688d20: 12800009     	mov	w9, #-0x1               ; =-1
 4688d24: b8e90108     	ldaddal	w9, w8, [x8]
 4688d28: 7100051f     	cmp	w8, #0x1
 4688d2c: 54fffec1     	b.ne	0x4688d04 <_ChromeMain+0x4683a68>
 4688d30: f9400009     	ldr	x9, [x0]
 4688d34: f9400928     	ldr	x8, [x9, #0x10]
 4688d38: b0fdccea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4688d3c: 9106014a     	add	x10, x10, #0x180
 4688d40: eb0a011f     	cmp	x8, x10
 4688d44: 54000041     	b.ne	0x4688d4c <_ChromeMain+0x4683ab0>
 4688d48: f9400528     	ldr	x8, [x9, #0x8]
 4688d4c: d63f0100     	blr	x8
 4688d50: 17ffffed     	b	0x4688d04 <_ChromeMain+0x4683a68>
 4688d54: 91002008     	add	x8, x0, #0x8
 4688d58: 12800009     	mov	w9, #-0x1               ; =-1
 4688d5c: b8e90108     	ldaddal	w9, w8, [x8]
 4688d60: 7100051f     	cmp	w8, #0x1
 4688d64: 54fffc81     	b.ne	0x4688cf4 <_ChromeMain+0x4683a58>
 4688d68: f9400008     	ldr	x8, [x0]
 4688d6c: f9400908     	ldr	x8, [x8, #0x10]
 4688d70: d63f0100     	blr	x8
 4688d74: 17ffffe0     	b	0x4688cf4 <_ChromeMain+0x4683a58>
 4688d78: 91002008     	add	x8, x0, #0x8
 4688d7c: 12800009     	mov	w9, #-0x1               ; =-1
 4688d80: b8e90108     	ldaddal	w9, w8, [x8]
 4688d84: 7100051f     	cmp	w8, #0x1
 4688d88: 54fffb21     	b.ne	0x4688cec <_ChromeMain+0x4683a50>
 4688d8c: f9400008     	ldr	x8, [x0]
 4688d90: f9400908     	ldr	x8, [x8, #0x10]
 4688d94: d63f0100     	blr	x8
 4688d98: 17ffffd5     	b	0x4688cec <_ChromeMain+0x4683a50>
 4688d9c: 91002008     	add	x8, x0, #0x8
 4688da0: 12800009     	mov	w9, #-0x1               ; =-1
 4688da4: b8e90108     	ldaddal	w9, w8, [x8]
 4688da8: 7100051f     	cmp	w8, #0x1
 4688dac: 54fffb01     	b.ne	0x4688d0c <_ChromeMain+0x4683a70>
 4688db0: f9400008     	ldr	x8, [x0]
 4688db4: f9400908     	ldr	x8, [x8, #0x10]
 4688db8: d63f0100     	blr	x8
 4688dbc: 17ffffd4     	b	0x4688d0c <_ChromeMain+0x4683a70>
 4688dc0: 91002008     	add	x8, x0, #0x8
 4688dc4: 12800009     	mov	w9, #-0x1               ; =-1
 4688dc8: b8e90108     	ldaddal	w9, w8, [x8]
 4688dcc: 7100051f     	cmp	w8, #0x1
 4688dd0: 54fff961     	b.ne	0x4688cfc <_ChromeMain+0x4683a60>
 4688dd4: f9400008     	ldr	x8, [x0]
 4688dd8: f9400908     	ldr	x8, [x8, #0x10]
 4688ddc: d63f0100     	blr	x8
 4688de0: 17ffffc7     	b	0x4688cfc <_ChromeMain+0x4683a60>
 4688de4: 17ffff49     	b	0x4688b08 <_ChromeMain+0x468386c>
		...
