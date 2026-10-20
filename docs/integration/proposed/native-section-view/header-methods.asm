
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4665910: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4665914: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4665918: 910043fd     	add	x29, sp, #0x10
 466591c: f9425c13     	ldr	x19, [x0, #0x4b8]
 4665920: b4000213     	cbz	x19, 0x4665960 <_ChromeMain+0x46606c4>
 4665924: 52800028     	mov	w8, #0x1                ; =1
 4665928: b8280268     	ldadd	w8, w8, [x19]
 466592c: 7100011f     	cmp	w8, #0x0
 4665930: 5400028d     	b.le	0x4665980 <_ChromeMain+0x46606e4>
 4665934: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4665938: 6b09011f     	cmp	w8, w9
 466593c: 54000280     	b.eq	0x466598c <_ChromeMain+0x46606f0>
 4665940: f9425c08     	ldr	x8, [x0, #0x4b8]
 4665944: f9400508     	ldr	x8, [x8, #0x8]
 4665948: aa1303e0     	mov	x0, x19
 466594c: d63f0100     	blr	x8
 4665950: 12800008     	mov	w8, #-0x1               ; =-1
 4665954: b8e80268     	ldaddal	w8, w8, [x19]
 4665958: 7100051f     	cmp	w8, #0x1
 466595c: 54000080     	b.eq	0x466596c <_ChromeMain+0x46606d0>
 4665960: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665964: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4665968: d65f03c0     	ret
 466596c: f9400a61     	ldr	x1, [x19, #0x10]
 4665970: aa1303e0     	mov	x0, x19
 4665974: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665978: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466597c: d61f0020     	br	x1
 4665980: d4200000     	brk	#0
 4665984: d4400000     	hlt	#0
 4665988: d4200020     	brk	#0x1
 466598c: d4200000     	brk	#0
 4665990: d4400000     	hlt	#0
 4665994: d4200020     	brk	#0x1
 4665998: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 466599c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46659a0: 910043fd     	add	x29, sp, #0x10
 46659a4: aa0003f3     	mov	x19, x0
 46659a8: 90050608     	adrp	x8, 0xe725000 <dyld_stub_binder+0xe725000>
 46659ac: 9120c108     	add	x8, x8, #0x830
 46659b0: 91118109     	add	x9, x8, #0x460
 46659b4: a9002408     	stp	x8, x9, [x0]
 46659b8: 91122109     	add	x9, x8, #0x488
 46659bc: f9000809     	str	x9, [x0, #0x10]
 46659c0: 91130109     	add	x9, x8, #0x4c0
 46659c4: 9113c10a     	add	x10, x8, #0x4f0
 46659c8: a906a809     	stp	x9, x10, [x0, #0x68]
 46659cc: 91150109     	add	x9, x8, #0x540
 46659d0: f9005809     	str	x9, [x0, #0xb0]
 46659d4: 91168109     	add	x9, x8, #0x5a0
 46659d8: f9006c09     	str	x9, [x0, #0xd8]
 46659dc: 91174109     	add	x9, x8, #0x5d0
 46659e0: f9007c09     	str	x9, [x0, #0xf8]
 46659e4: 9117e109     	add	x9, x8, #0x5f8
 46659e8: f9018809     	str	x9, [x0, #0x310]
 46659ec: 9119e109     	add	x9, x8, #0x678
 46659f0: f9018c09     	str	x9, [x0, #0x318]
 46659f4: 911ce108     	add	x8, x8, #0x738
 46659f8: f9019008     	str	x8, [x0, #0x320]
 46659fc: f9427000     	ldr	x0, [x0, #0x4e0]
 4665a00: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4665a04: b0052a74     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4665a08: f9404689     	ldr	x9, [x20, #0x88]
 4665a0c: eb09011f     	cmp	x8, x9
 4665a10: 54000041     	b.ne	0x4665a18 <_ChromeMain+0x466077c>
 4665a14: 96e6f40a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4665a18: f902727f     	str	xzr, [x19, #0x4e0]
 4665a1c: f9426e60     	ldr	x0, [x19, #0x4d8]
 4665a20: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4665a24: f9404689     	ldr	x9, [x20, #0x88]
 4665a28: eb09011f     	cmp	x8, x9
 4665a2c: 54000041     	b.ne	0x4665a34 <_ChromeMain+0x4660798>
 4665a30: 96e6f403     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4665a34: f9026e7f     	str	xzr, [x19, #0x4d8]
 4665a38: f9426a60     	ldr	x0, [x19, #0x4d0]
 4665a3c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4665a40: f9404689     	ldr	x9, [x20, #0x88]
 4665a44: eb09011f     	cmp	x8, x9
 4665a48: 54000041     	b.ne	0x4665a50 <_ChromeMain+0x46607b4>
 4665a4c: 96e6f3fc     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4665a50: f9026a7f     	str	xzr, [x19, #0x4d0]
 4665a54: f9426660     	ldr	x0, [x19, #0x4c8]
 4665a58: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4665a5c: f9404689     	ldr	x9, [x20, #0x88]
 4665a60: eb09011f     	cmp	x8, x9
 4665a64: 54000041     	b.ne	0x4665a6c <_ChromeMain+0x46607d0>
 4665a68: 96e6f3f5     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4665a6c: f902667f     	str	xzr, [x19, #0x4c8]
 4665a70: f9426260     	ldr	x0, [x19, #0x4c0]
 4665a74: b50001c0     	cbnz	x0, 0x4665aac <_ChromeMain+0x4660810>
 4665a78: f9425e60     	ldr	x0, [x19, #0x4b8]
 4665a7c: b50000a0     	cbnz	x0, 0x4665a90 <_ChromeMain+0x46607f4>
 4665a80: aa1303e0     	mov	x0, x19
 4665a84: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665a88: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4665a8c: 17616028     	b	0x1ebdb2c <_ChromeMain+0x1eb8890>
 4665a90: 12800008     	mov	w8, #-0x1               ; =-1
 4665a94: b8e80008     	ldaddal	w8, w8, [x0]
 4665a98: 7100051f     	cmp	w8, #0x1
 4665a9c: 54ffff21     	b.ne	0x4665a80 <_ChromeMain+0x46607e4>
 4665aa0: f9400808     	ldr	x8, [x0, #0x10]
 4665aa4: d63f0100     	blr	x8
 4665aa8: 17fffff6     	b	0x4665a80 <_ChromeMain+0x46607e4>
 4665aac: 12800008     	mov	w8, #-0x1               ; =-1
 4665ab0: b8e80008     	ldaddal	w8, w8, [x0]
 4665ab4: 7100051f     	cmp	w8, #0x1
 4665ab8: 54fffe01     	b.ne	0x4665a78 <_ChromeMain+0x46607dc>
 4665abc: f9400808     	ldr	x8, [x0, #0x10]
 4665ac0: d63f0100     	blr	x8
 4665ac4: 17ffffed     	b	0x4665a78 <_ChromeMain+0x46607dc>
 4665ac8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4665acc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4665ad0: 910043fd     	add	x29, sp, #0x10
 4665ad4: aa0003f3     	mov	x19, x0
 4665ad8: 97ffffb0     	bl	0x4665998 <_ChromeMain+0x46606fc>
 4665adc: b0054528     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4665ae0: 91120108     	add	x8, x8, #0x480
 4665ae4: f8bfc100     	ldapr	x0, [x8]
 4665ae8: b40000a0     	cbz	x0, 0x4665afc <_ChromeMain+0x4660860>
 4665aec: aa1303e1     	mov	x1, x19
 4665af0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665af4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4665af8: 1723dc0a     	b	0xf5cb20 <_ChromeMain+0xf57884>
 4665afc: 97f1b6ff     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 4665b00: 17fffffb     	b	0x4665aec <_ChromeMain+0x4660850>
 4665b04: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4665b08: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4665b0c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4665b10: 910083fd     	add	x29, sp, #0x20
 4665b14: d00543b5     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4665b18: f9442ab3     	ldr	x19, [x21, #0x850]
 4665b1c: b5000653     	cbnz	x19, 0x4665be4 <_ChromeMain+0x4660948>
 4665b20: 52800d00     	mov	w0, #0x68               ; =104
 4665b24: 96e6a611     	bl	0xf368 <_ChromeMain+0xa0cc>
 4665b28: aa0003f3     	mov	x19, x0
 4665b2c: d004c321     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4665b30: 912c7821     	add	x1, x1, #0xb1e
 4665b34: 528008a2     	mov	w2, #0x45               ; =69
 4665b38: 52812083     	mov	w3, #0x904              ; =2308
 4665b3c: 96fb068f     	bl	0x527578 <_ChromeMain+0x5222dc>
 4665b40: f004f508     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 4665b44: 913f0108     	add	x8, x8, #0xfc0
 4665b48: d004c329     	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4665b4c: 913fb929     	add	x9, x9, #0xfee
 4665b50: a9002408     	stp	x8, x9, [x0]
 4665b54: 52800308     	mov	w8, #0x18               ; =24
 4665b58: f9000808     	str	x8, [x0, #0x10]
 4665b5c: b0054a56     	adrp	x22, 0xefae000 <dyld_stub_binder+0xefae000>
 4665b60: f9476ad4     	ldr	x20, [x22, #0xed0]
 4665b64: b5000214     	cbnz	x20, 0x4665ba4 <_ChromeMain+0x4660908>
 4665b68: 52800d00     	mov	w0, #0x68               ; =104
 4665b6c: 96e6a5ff     	bl	0xf368 <_ChromeMain+0xa0cc>
 4665b70: aa0003f4     	mov	x20, x0
 4665b74: d004b6e1     	adrp	x1, 0xdd43000 <dyld_stub_binder+0xdd43000>
 4665b78: 91235821     	add	x1, x1, #0x8d6
 4665b7c: 528004e2     	mov	w2, #0x27               ; =39
 4665b80: 52800663     	mov	w3, #0x33               ; =51
 4665b84: 96fb067d     	bl	0x527578 <_ChromeMain+0x5222dc>
 4665b88: 9004e748     	adrp	x8, 0xe34d000 <dyld_stub_binder+0xe34d000>
 4665b8c: 9119c108     	add	x8, x8, #0x670
 4665b90: f9000008     	str	x8, [x0]
 4665b94: 97b6430b     	bl	0x33f67c0 <_ChromeMain+0x33f1524>
 4665b98: aa1403e0     	mov	x0, x20
 4665b9c: 97450312     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4665ba0: f9076ad4     	str	x20, [x22, #0xed0]
 4665ba4: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4665ba8: b0052a76     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4665bac: f94046c9     	ldr	x9, [x22, #0x88]
 4665bb0: eb09011f     	cmp	x8, x9
 4665bb4: 54000061     	b.ne	0x4665bc0 <_ChromeMain+0x4660924>
 4665bb8: aa1403e0     	mov	x0, x20
 4665bbc: 96e6b9d0     	bl	0x142fc <_ChromeMain+0xf060>
 4665bc0: f9402660     	ldr	x0, [x19, #0x48]
 4665bc4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4665bc8: f94046c9     	ldr	x9, [x22, #0x88]
 4665bcc: eb09011f     	cmp	x8, x9
 4665bd0: 54000140     	b.eq	0x4665bf8 <_ChromeMain+0x466095c>
 4665bd4: f9002674     	str	x20, [x19, #0x48]
 4665bd8: aa1303e0     	mov	x0, x19
 4665bdc: 97450302     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4665be0: f9042ab3     	str	x19, [x21, #0x850]
 4665be4: aa1303e0     	mov	x0, x19
 4665be8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4665bec: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4665bf0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4665bf4: d65f03c0     	ret
 4665bf8: 96e6f391     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4665bfc: 17fffff6     	b	0x4665bd4 <_ChromeMain+0x4660938>
 4665c00: aa0103e2     	mov	x2, x1
 4665c04: aa0003e1     	mov	x1, x0
 4665c08: b9405048     	ldr	w8, [x2, #0x50]
 4665c0c: 12151108     	and	w8, w8, #0xf800
 4665c10: 7140091f     	cmp	w8, #0x2, lsl #12       ; =0x2000
 4665c14: 54000061     	b.ne	0x4665c20 <_ChromeMain+0x4660984>
 4665c18: f9426028     	ldr	x8, [x1, #0x4c0]
 4665c1c: b50000c8     	cbnz	x8, 0x4665c34 <_ChromeMain+0x4660998>
 4665c20: f9424020     	ldr	x0, [x1, #0x480]
 4665c24: f9400008     	ldr	x8, [x0]
 4665c28: f9400903     	ldr	x3, [x8, #0x10]
 4665c2c: aa0203e1     	mov	x1, x2
 4665c30: d61f0060     	br	x3
 4665c34: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 4665c38: 910003fd     	mov	x29, sp
 4665c3c: 91130020     	add	x0, x1, #0x4c0
 4665c40: 97195150     	bl	0xcba180 <_ChromeMain+0xcb4ee4>
 4665c44: 52800020     	mov	w0, #0x1                ; =1
 4665c48: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 4665c4c: d65f03c0     	ret
 4665c50: d100c3ff     	sub	sp, sp, #0x30
 4665c54: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4665c58: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4665c5c: 910083fd     	add	x29, sp, #0x20
 4665c60: 9113a014     	add	x20, x0, #0x4e8
 4665c64: 3953c008     	ldrb	w8, [x0, #0x4f0]
 4665c68: 350002e8     	cbnz	w8, 0x4665cc4 <_ChromeMain+0x4660a28>
 4665c6c: aa0003f3     	mov	x19, x0
 4665c70: f9427c08     	ldr	x8, [x0, #0x4f8]
 4665c74: 91000508     	add	x8, x8, #0x1
 4665c78: f9027c08     	str	x8, [x0, #0x4f8]
 4665c7c: 390003ff     	strb	wzr, [sp]
 4665c80: 390013ff     	strb	wzr, [sp, #0x4]
 4665c84: 390023ff     	strb	wzr, [sp, #0x8]
 4665c88: 390033ff     	strb	wzr, [sp, #0xc]
 4665c8c: 910003e1     	mov	x1, sp
 4665c90: 97d30e52     	bl	0x3b295d8 <_ChromeMain+0x3b2433c>
 4665c94: b944b268     	ldr	w8, [x19, #0x4b0]
 4665c98: 0aa87d08     	bic	w8, w8, w8, asr #31
 4665c9c: b3607d00     	bfi	x0, x8, #32, #32
 4665ca0: 3953c268     	ldrb	w8, [x19, #0x4f0]
 4665ca4: 350000c8     	cbnz	w8, 0x4665cbc <_ChromeMain+0x4660a20>
 4665ca8: b4000194     	cbz	x20, 0x4665cd8 <_ChromeMain+0x4660a3c>
 4665cac: f9027660     	str	x0, [x19, #0x4e8]
 4665cb0: 52800028     	mov	w8, #0x1                ; =1
 4665cb4: 3913c268     	strb	w8, [x19, #0x4f0]
 4665cb8: 14000004     	b	0x4665cc8 <_ChromeMain+0x4660a2c>
 4665cbc: f9000280     	str	x0, [x20]
 4665cc0: 14000002     	b	0x4665cc8 <_ChromeMain+0x4660a2c>
 4665cc4: f9400280     	ldr	x0, [x20]
 4665cc8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4665ccc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4665cd0: 9100c3ff     	add	sp, sp, #0x30
 4665cd4: d65f03c0     	ret
 4665cd8: d4200020     	brk	#0x1
 4665cdc: 3953c008     	ldrb	w8, [x0, #0x4f0]
 4665ce0: 34000048     	cbz	w8, 0x4665ce8 <_ChromeMain+0x4660a4c>
 4665ce4: 3913c01f     	strb	wzr, [x0, #0x4f0]
 4665ce8: f9400008     	ldr	x8, [x0]
 4665cec: f9418501     	ldr	x1, [x8, #0x308]
 4665cf0: d61f0020     	br	x1
 4665cf4: f9400428     	ldr	x8, [x1, #0x8]
 4665cf8: eb00011f     	cmp	x8, x0
 4665cfc: 540000a0     	b.eq	0x4665d10 <_ChromeMain+0x4660a74>
 4665d00: f9426809     	ldr	x9, [x0, #0x4d0]
 4665d04: eb09011f     	cmp	x8, x9
 4665d08: 54000040     	b.eq	0x4665d10 <_ChromeMain+0x4660a74>
 4665d0c: d65f03c0     	ret
 4665d10: 3953c008     	ldrb	w8, [x0, #0x4f0]
 4665d14: 34000048     	cbz	w8, 0x4665d1c <_ChromeMain+0x4660a80>
 4665d18: 3913c01f     	strb	wzr, [x0, #0x4f0]
 4665d1c: f9400008     	ldr	x8, [x0]
 4665d20: f9418501     	ldr	x1, [x8, #0x308]
 4665d24: d61f0020     	br	x1
		...
 4665d40: f9425c08     	ldr	x8, [x0, #0x4b8]
 4665d44: b4000788     	cbz	x8, 0x4665e34 <_ChromeMain+0x4660b98>
 4665d48: d10243ff     	sub	sp, sp, #0x90
 4665d4c: 6d0623e9     	stp	d9, d8, [sp, #0x60]
 4665d50: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4665d54: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4665d58: 910203fd     	add	x29, sp, #0x80
 4665d5c: aa0003f4     	mov	x20, x0
 4665d60: b943bc08     	ldr	w8, [x0, #0x3bc]
 4665d64: 34000608     	cbz	w8, 0x4665e24 <_ChromeMain+0x4660b88>
 4665d68: aa0103f3     	mov	x19, x1
 4665d6c: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4665d70: 6f00e400     	movi.2d	v0, #0000000000000000
 4665d74: 3c8283e0     	stur	q0, [sp, #0x28]
 4665d78: 3c8383e0     	stur	q0, [sp, #0x38]
 4665d7c: f90027ff     	str	xzr, [sp, #0x48]
 4665d80: d2806029     	mov	x9, #0x301              ; =769
 4665d84: f2f7f009     	movk	x9, #0xbf80, lsl #48
 4665d88: a901a7e8     	stp	x8, x9, [sp, #0x18]
 4665d8c: aa1403e0     	mov	x0, x20
 4665d90: 96fcec98     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4665d94: 52801ee1     	mov	w1, #0xf7               ; =247
 4665d98: 9723090c     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4665d9c: 971da3f3     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4665da0: 2d0107e0     	stp	s0, s1, [sp, #0x8]
 4665da4: 2d020fe2     	stp	s2, s3, [sp, #0x10]
 4665da8: 91070288     	add	x8, x20, #0x1c0
 4665dac: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 4665db0: b004c6a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4665db4: 3dc01101     	ldr	q1, [x8, #0x40]
 4665db8: 6ee14400     	ushl.2d	v0, v0, v1
 4665dbc: 0ea12800     	xtn.2s	v0, v0
 4665dc0: 6f00e401     	movi.2d	v1, #0000000000000000
 4665dc4: 0ea16400     	smax.2s	v0, v0, v1
 4665dc8: 2e21d808     	ucvtf.2s	v8, v0
 4665dcc: 52800700     	mov	w0, #0x38               ; =56
 4665dd0: 96fa76bc     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 4665dd4: 1e220000     	scvtf	s0, w0
 4665dd8: f9406260     	ldr	x0, [x19, #0xc0]
 4665ddc: f81d03bf     	stur	xzr, [x29, #-0x30]
 4665de0: fc1d83a8     	stur	d8, [x29, #-0x28]
 4665de4: f9400008     	ldr	x8, [x0]
 4665de8: f9408508     	ldr	x8, [x8, #0x108]
 4665dec: d100c3a1     	sub	x1, x29, #0x30
 4665df0: 910023e2     	add	x2, sp, #0x8
 4665df4: 4ea01c01     	mov.16b	v1, v0
 4665df8: d63f0100     	blr	x8
 4665dfc: f94027e0     	ldr	x0, [sp, #0x48]
 4665e00: b50004a0     	cbnz	x0, 0x4665e94 <_ChromeMain+0x4660bf8>
 4665e04: f94023e0     	ldr	x0, [sp, #0x40]
 4665e08: b5000340     	cbnz	x0, 0x4665e70 <_ChromeMain+0x4660bd4>
 4665e0c: f9401fe0     	ldr	x0, [sp, #0x38]
 4665e10: b5000660     	cbnz	x0, 0x4665edc <_ChromeMain+0x4660c40>
 4665e14: f9401be0     	ldr	x0, [sp, #0x30]
 4665e18: b5000100     	cbnz	x0, 0x4665e38 <_ChromeMain+0x4660b9c>
 4665e1c: f94017e0     	ldr	x0, [sp, #0x28]
 4665e20: b50004c0     	cbnz	x0, 0x4665eb8 <_ChromeMain+0x4660c1c>
 4665e24: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4665e28: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4665e2c: 6d4623e9     	ldp	d9, d8, [sp, #0x60]
 4665e30: 910243ff     	add	sp, sp, #0x90
 4665e34: d65f03c0     	ret
 4665e38: 91002008     	add	x8, x0, #0x8
 4665e3c: 12800009     	mov	w9, #-0x1               ; =-1
 4665e40: b8e90108     	ldaddal	w9, w8, [x8]
 4665e44: 7100051f     	cmp	w8, #0x1
 4665e48: 54fffea1     	b.ne	0x4665e1c <_ChromeMain+0x4660b80>
 4665e4c: f9400009     	ldr	x9, [x0]
 4665e50: f9400928     	ldr	x8, [x9, #0x10]
 4665e54: 90fdce0a     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4665e58: 9106014a     	add	x10, x10, #0x180
 4665e5c: eb0a011f     	cmp	x8, x10
 4665e60: 54000041     	b.ne	0x4665e68 <_ChromeMain+0x4660bcc>
 4665e64: f9400528     	ldr	x8, [x9, #0x8]
 4665e68: d63f0100     	blr	x8
 4665e6c: 17ffffec     	b	0x4665e1c <_ChromeMain+0x4660b80>
 4665e70: 91002008     	add	x8, x0, #0x8
 4665e74: 12800009     	mov	w9, #-0x1               ; =-1
 4665e78: b8e90108     	ldaddal	w9, w8, [x8]
 4665e7c: 7100051f     	cmp	w8, #0x1
 4665e80: 54fffc61     	b.ne	0x4665e0c <_ChromeMain+0x4660b70>
 4665e84: f9400008     	ldr	x8, [x0]
 4665e88: f9400908     	ldr	x8, [x8, #0x10]
 4665e8c: d63f0100     	blr	x8
 4665e90: 17ffffdf     	b	0x4665e0c <_ChromeMain+0x4660b70>
 4665e94: 91002008     	add	x8, x0, #0x8
 4665e98: 12800009     	mov	w9, #-0x1               ; =-1
 4665e9c: b8e90108     	ldaddal	w9, w8, [x8]
 4665ea0: 7100051f     	cmp	w8, #0x1
 4665ea4: 54fffb01     	b.ne	0x4665e04 <_ChromeMain+0x4660b68>
 4665ea8: f9400008     	ldr	x8, [x0]
 4665eac: f9400908     	ldr	x8, [x8, #0x10]
 4665eb0: d63f0100     	blr	x8
 4665eb4: 17ffffd4     	b	0x4665e04 <_ChromeMain+0x4660b68>
 4665eb8: 91002008     	add	x8, x0, #0x8
 4665ebc: 12800009     	mov	w9, #-0x1               ; =-1
 4665ec0: b8e90108     	ldaddal	w9, w8, [x8]
 4665ec4: 7100051f     	cmp	w8, #0x1
 4665ec8: 54fffae1     	b.ne	0x4665e24 <_ChromeMain+0x4660b88>
 4665ecc: f9400008     	ldr	x8, [x0]
 4665ed0: f9400908     	ldr	x8, [x8, #0x10]
 4665ed4: d63f0100     	blr	x8
 4665ed8: 17ffffd3     	b	0x4665e24 <_ChromeMain+0x4660b88>
 4665edc: 91002008     	add	x8, x0, #0x8
 4665ee0: 12800009     	mov	w9, #-0x1               ; =-1
 4665ee4: b8e90108     	ldaddal	w9, w8, [x8]
 4665ee8: 7100051f     	cmp	w8, #0x1
 4665eec: 54fff941     	b.ne	0x4665e14 <_ChromeMain+0x4660b78>
 4665ef0: f9400008     	ldr	x8, [x0]
 4665ef4: f9400908     	ldr	x8, [x8, #0x10]
 4665ef8: d63f0100     	blr	x8
 4665efc: 17ffffc6     	b	0x4665e14 <_ChromeMain+0x4660b78>
 4665f00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4665f04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4665f08: 910043fd     	add	x29, sp, #0x10
 4665f0c: aa0003f3     	mov	x19, x0
 4665f10: b943bc08     	ldr	w8, [x0, #0x3bc]
 4665f14: 71000514     	subs	w20, w8, #0x1
 4665f18: 1a9f37e8     	cset	w8, hs
 4665f1c: f9426c00     	ldr	x0, [x0, #0x4d8]
 4665f20: b4000180     	cbz	x0, 0x4665f50 <_ChromeMain+0x4660cb4>
 4665f24: 3952d269     	ldrb	w9, [x19, #0x4b4]
 4665f28: 2a080128     	orr	w8, w9, w8
 4665f2c: 39472009     	ldrb	w9, [x0, #0x1c8]
 4665f30: 12000101     	and	w1, w8, #0x1
 4665f34: 6b09003f     	cmp	w1, w9
 4665f38: 540000c0     	b.eq	0x4665f50 <_ChromeMain+0x4660cb4>
 4665f3c: f9400008     	ldr	x8, [x0]
 4665f40: f9405108     	ldr	x8, [x8, #0xa0]
 4665f44: d63f0100     	blr	x8
 4665f48: 52800028     	mov	w8, #0x1                ; =1
 4665f4c: 14000002     	b	0x4665f54 <_ChromeMain+0x4660cb8>
 4665f50: 52800008     	mov	w8, #0x0                ; =0
 4665f54: f9427260     	ldr	x0, [x19, #0x4e0]
 4665f58: b4000180     	cbz	x0, 0x4665f88 <_ChromeMain+0x4660cec>
 4665f5c: 71000a9f     	cmp	w20, #0x2
 4665f60: 1a9f27e9     	cset	w9, lo
 4665f64: 3947200a     	ldrb	w10, [x0, #0x1c8]
 4665f68: 6b0a013f     	cmp	w9, w10
 4665f6c: 540000e0     	b.eq	0x4665f88 <_ChromeMain+0x4660cec>
 4665f70: 71000a9f     	cmp	w20, #0x2
 4665f74: 1a9f27e1     	cset	w1, lo
 4665f78: f9400008     	ldr	x8, [x0]
 4665f7c: f9405108     	ldr	x8, [x8, #0xa0]
 4665f80: d63f0100     	blr	x8
 4665f84: 14000002     	b	0x4665f8c <_ChromeMain+0x4660cf0>
 4665f88: 340000c8     	cbz	w8, 0x4665fa0 <_ChromeMain+0x4660d04>
 4665f8c: aa1303e0     	mov	x0, x19
 4665f90: 52800001     	mov	w1, #0x0                ; =0
 4665f94: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665f98: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4665f9c: 16ff2936     	b	0x630474 <_ChromeMain+0x62b1d8>
 4665fa0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4665fa4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4665fa8: d65f03c0     	ret
