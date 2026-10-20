
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42538e0: f940bbe8     	ldr	x8, [sp, #0x170]
 42538e4: f90053e8     	str	x8, [sp, #0xa0]
 42538e8: ad0407e0     	stp	q0, q1, [sp, #0x80]
 42538ec: a9167fff     	stp	xzr, xzr, [sp, #0x160]
 42538f0: 910083e8     	add	x8, sp, #0x20
 42538f4: f900bbff     	str	xzr, [sp, #0x170]
 42538f8: 91022100     	add	x0, x8, #0x88
 42538fc: 91022341     	add	x1, x26, #0x88
 4253900: 97ae1a83     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4253904: 784c0348     	ldurh	w8, [x26, #0xc0]
 4253908: 7901c3e8     	strh	w8, [sp, #0xe0]
 425390c: 384c2348     	ldurb	w8, [x26, #0xc2]
 4253910: 39038be8     	strb	w8, [sp, #0xe2]
 4253914: 910083e1     	add	x1, sp, #0x20
 4253918: aa1603e0     	mov	x0, x22
 425391c: 979aaa15     	bl	0x28fe170 <_ChromeMain+0x28f8ed4>
 4253920: 910083e0     	add	x0, sp, #0x20
 4253924: 979beef8     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253928: f9403a76     	ldr	x22, [x19, #0x70]
 425392c: 9004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253930: 91093000     	add	x0, x0, #0x24c
 4253934: 9004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4253938: 91080821     	add	x1, x1, #0x202
 425393c: 910003e8     	mov	x8, sp
 4253940: 52810f62     	mov	w2, #0x87b              ; =2171
 4253944: 96f7f4cf     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4253948: 52801300     	mov	w0, #0x98               ; =152
 425394c: 96f6ee87     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253950: aa0003f7     	mov	x23, x0
 4253954: 52800028     	mov	w8, #0x1                ; =1
 4253958: 1004cdc9     	adr	x9, 0x425d310 <_ChromeMain+0x4258074>
 425395c: d503201f     	nop
 4253960: 1004d20a     	adr	x10, 0x425d3a0 <_ChromeMain+0x4258104>
 4253964: d503201f     	nop
 4253968: b9000008     	str	w8, [x0]
 425396c: d0ff1848     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4253970: 912c0108     	add	x8, x8, #0xb00
 4253974: 1000f7ab     	adr	x11, 0x4255868 <_ChromeMain+0x42505cc>
 4253978: d503201f     	nop
 425397c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253980: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253984: b9401a68     	ldr	w8, [x19, #0x18]
 4253988: b9002808     	str	w8, [x0, #0x28]
 425398c: 39c07ea8     	ldrsb	w8, [x21, #0x1f]
 4253990: 37f807c8     	tbnz	w8, #0x1f, 0x4253a88 <_ChromeMain+0x424e7ec>
 4253994: 3cc082a0     	ldur	q0, [x21, #0x8]
 4253998: 3c8302e0     	stur	q0, [x23, #0x30]
 425399c: f84182a8     	ldur	x8, [x21, #0x18]
 42539a0: f80402e8     	stur	x8, [x23, #0x40]
 42539a4: 39c0de68     	ldrsb	w8, [x19, #0x37]
 42539a8: 37f80808     	tbnz	w8, #0x1f, 0x4253aa8 <_ChromeMain+0x424e80c>
 42539ac: 3dc00300     	ldr	q0, [x24]
 42539b0: 3c8482e0     	stur	q0, [x23, #0x48]
 42539b4: f9400b08     	ldr	x8, [x24, #0x10]
 42539b8: f80582e8     	stur	x8, [x23, #0x58]
 42539bc: 39c13e68     	ldrsb	w8, [x19, #0x4f]
 42539c0: 37f806c8     	tbnz	w8, #0x1f, 0x4253a98 <_ChromeMain+0x424e7fc>
 42539c4: 3dc00320     	ldr	q0, [x25]
 42539c8: 3c8602e0     	stur	q0, [x23, #0x60]
 42539cc: f9400b28     	ldr	x8, [x25, #0x10]
 42539d0: f80702e8     	stur	x8, [x23, #0x70]
 42539d4: aa1703e8     	mov	x8, x23
 42539d8: 38078d1f     	strb	wzr, [x8, #0x78]!
 42539dc: 3900611f     	strb	wzr, [x8, #0x18]
 42539e0: 39406289     	ldrb	w9, [x20, #0x18]
 42539e4: 34000129     	cbz	w9, 0x4253a08 <_ChromeMain+0x424e76c>
 42539e8: 3dc00280     	ldr	q0, [x20]
 42539ec: 3d800100     	str	q0, [x8]
 42539f0: f9400a89     	ldr	x9, [x20, #0x10]
 42539f4: f9000909     	str	x9, [x8, #0x10]
 42539f8: a900fe9f     	stp	xzr, xzr, [x20, #0x8]
 42539fc: f900029f     	str	xzr, [x20]
 4253a00: 52800028     	mov	w8, #0x1                ; =1
 4253a04: 390242e8     	strb	w8, [x23, #0x90]
 4253a08: f9404274     	ldr	x20, [x19, #0x80]
 4253a0c: b40000d4     	cbz	x20, 0x4253a24 <_ChromeMain+0x424e788>
 4253a10: 52800028     	mov	w8, #0x1                ; =1
 4253a14: b8280288     	ldadd	w8, w8, [x20]
 4253a18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4253a1c: 6b09011f     	cmp	w8, w9
 4253a20: 54000880     	b.eq	0x4253b30 <_ChromeMain+0x424e894>
 4253a24: f9404673     	ldr	x19, [x19, #0x88]
 4253a28: 52800800     	mov	w0, #0x40               ; =64
 4253a2c: 96f6ee4f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4253a30: aa0003e3     	mov	x3, x0
 4253a34: 52800028     	mov	w8, #0x1                ; =1
 4253a38: 1005b029     	adr	x9, 0x425f03c <_ChromeMain+0x4259da0>
 4253a3c: d503201f     	nop
 4253a40: b0ffe8ca     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4253a44: 912b014a     	add	x10, x10, #0xac0
 4253a48: b9000008     	str	w8, [x0]
 4253a4c: f0fff2c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4253a50: 911b0108     	add	x8, x8, #0x6c0
 4253a54: 1001df6b     	adr	x11, 0x4257640 <_ChromeMain+0x42523a4>
 4253a58: d503201f     	nop
 4253a5c: a900a809     	stp	x9, x10, [x0, #0x8]
 4253a60: a901ac08     	stp	x8, x11, [x0, #0x18]
 4253a64: a902d01f     	stp	xzr, x20, [x0, #0x28]
 4253a68: f9001c13     	str	x19, [x0, #0x38]
 4253a6c: 910003e1     	mov	x1, sp
 4253a70: aa1603e0     	mov	x0, x22
 4253a74: aa1703e2     	mov	x2, x23
 4253a78: 940000bc     	bl	0x4253d68 <_ChromeMain+0x424eacc>
 4253a7c: 9103c3e0     	add	x0, sp, #0xf0
 4253a80: 979beea1     	bl	0x294f504 <_ChromeMain+0x294a268>
 4253a84: 17ffff08     	b	0x42536a4 <_ChromeMain+0x424e408>
 4253a88: a9408aa1     	ldp	x1, x2, [x21, #0x8]
 4253a8c: 9100c2e0     	add	x0, x23, #0x30
 4253a90: 96f711e2     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253a94: 17ffffc4     	b	0x42539a4 <_ChromeMain+0x424e708>
 4253a98: a9438a61     	ldp	x1, x2, [x19, #0x38]
 4253a9c: 910182e0     	add	x0, x23, #0x60
 4253aa0: 96f7cc4c     	bl	0x46bd0 <_ChromeMain+0x41934>
 4253aa4: 17ffffcc     	b	0x42539d4 <_ChromeMain+0x424e738>
 4253aa8: a9420a61     	ldp	x1, x2, [x19, #0x20]
 4253aac: 910122e0     	add	x0, x23, #0x48
 4253ab0: 96f711da     	bl	0x18218 <_ChromeMain+0x12f7c>
 4253ab4: 17ffffc2     	b	0x42539bc <_ChromeMain+0x424e720>
 4253ab8: 13001d09     	sxtb	w9, w8
 4253abc: 7100013f     	cmp	w9, #0x0
 4253ac0: a943aa69     	ldp	x9, x10, [x19, #0x38]
 4253ac4: 9a994121     	csel	x1, x9, x25, mi
 4253ac8: 9a884142     	csel	x2, x10, x8, mi
 4253acc: aa1703e0     	mov	x0, x23
 4253ad0: 9719eb59     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4253ad4: 17ffff67     	b	0x4253870 <_ChromeMain+0x424e5d4>
 4253ad8: f9401260     	ldr	x0, [x19, #0x20]
 4253adc: f9401a68     	ldr	x8, [x19, #0x30]
 4253ae0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4253ae4: 96f6d4f5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4253ae8: 17ffff1e     	b	0x4253760 <_ChromeMain+0x424e4c4>
 4253aec: 13001d09     	sxtb	w9, w8
 4253af0: 7100013f     	cmp	w9, #0x0
 4253af4: a9422a69     	ldp	x9, x10, [x19, #0x20]
 4253af8: 9a984121     	csel	x1, x9, x24, mi
 4253afc: 9a884142     	csel	x2, x10, x8, mi
 4253b00: 9103c3e0     	add	x0, sp, #0xf0
 4253b04: 9709543f     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4253b08: 17ffff4e     	b	0x4253840 <_ChromeMain+0x424e5a4>
 4253b0c: d4200000     	brk	#0
 4253b10: d4400000     	hlt	#0
 4253b14: d4200020     	brk	#0x1
 4253b18: d4200000     	brk	#0
 4253b1c: d4400000     	hlt	#0
 4253b20: d4200020     	brk	#0x1
 4253b24: d4200000     	brk	#0
 4253b28: d4400000     	hlt	#0
 4253b2c: d4200020     	brk	#0x1
 4253b30: d4200000     	brk	#0
 4253b34: d4400000     	hlt	#0
 4253b38: d4200020     	brk	#0x1
