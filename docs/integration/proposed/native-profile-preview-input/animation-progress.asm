
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4649b30: fd46e668     	ldr	d8, [x19, #0xdc8]
 4649b34: bd4a2660     	ldr	s0, [x19, #0xa24]
 4649b38: bd4a2a61     	ldr	s1, [x19, #0xa28]
 4649b3c: 1e22c002     	fcvt	d2, s0
 4649b40: 1e203820     	fsub	s0, s1, s0
 4649b44: 1e22c000     	fcvt	d0, s0
 4649b48: 1e600900     	fmul	d0, d8, d0
 4649b4c: 1e622800     	fadd	d0, d0, d2
 4649b50: 1e624000     	fcvt	s0, d0
 4649b54: aa1303e0     	mov	x0, x19
 4649b58: 9400008a     	bl	0x4649d80 <_ChromeMain+0x4644ae4>
 4649b5c: 39692268     	ldrb	w8, [x19, #0xa48]
 4649b60: 34fffd88     	cbz	w8, 0x4649b10 <_ChromeMain+0x4644874>
 4649b64: 39686a68     	ldrb	w8, [x19, #0xa1a]
 4649b68: 3707fd48     	tbnz	w8, #0x0, 0x4649b10 <_ChromeMain+0x4644874>
 4649b6c: f9422e68     	ldr	x8, [x19, #0x458]
 4649b70: b4fffd08     	cbz	x8, 0x4649b10 <_ChromeMain+0x4644874>
 4649b74: f9432508     	ldr	x8, [x8, #0x648]
 4649b78: b4fffcc8     	cbz	x8, 0x4649b10 <_ChromeMain+0x4644874>
 4649b7c: f941d909     	ldr	x9, [x8, #0x3b0]
 4649b80: d37df133     	lsl	x19, x9, #3
 4649b84: b4fffc73     	cbz	x19, 0x4649b10 <_ChromeMain+0x4644874>
 4649b88: 1e6e1000     	fmov	d0, #1.00000000
 4649b8c: 1e683800     	fsub	d0, d0, d8
 4649b90: 1e624008     	fcvt	s8, d0
 4649b94: f941d514     	ldr	x20, [x8, #0x3a8]
 4649b98: 14000010     	b	0x4649bd8 <_ChromeMain+0x464493c>
 4649b9c: 4ea81d00     	mov.16b	v0, v8
 4649ba0: 97fe15a8     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 4649ba4: 91002273     	add	x19, x19, #0x8
 4649ba8: f1002294     	subs	x20, x20, #0x8
 4649bac: 54fffb20     	b.eq	0x4649b10 <_ChromeMain+0x4644874>
 4649bb0: f9400268     	ldr	x8, [x19]
 4649bb4: b4ffff88     	cbz	x8, 0x4649ba4 <_ChromeMain+0x4644908>
 4649bb8: f941b900     	ldr	x0, [x8, #0x370]
 4649bbc: b4ffff40     	cbz	x0, 0x4649ba4 <_ChromeMain+0x4644908>
 4649bc0: 17fffff7     	b	0x4649b9c <_ChromeMain+0x4644900>
 4649bc4: 4ea81d00     	mov.16b	v0, v8
 4649bc8: 97fe159e     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 4649bcc: 91002294     	add	x20, x20, #0x8
 4649bd0: f1002273     	subs	x19, x19, #0x8
 4649bd4: 54fff9e0     	b.eq	0x4649b10 <_ChromeMain+0x4644874>
 4649bd8: f9400288     	ldr	x8, [x20]
 4649bdc: b4ffff88     	cbz	x8, 0x4649bcc <_ChromeMain+0x4644930>
 4649be0: f941b900     	ldr	x0, [x8, #0x370]
 4649be4: b4ffff40     	cbz	x0, 0x4649bcc <_ChromeMain+0x4644930>
