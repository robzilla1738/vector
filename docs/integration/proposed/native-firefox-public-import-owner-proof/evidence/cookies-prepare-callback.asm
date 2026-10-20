
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263f48: d101c3ff     	sub	sp, sp, #0x70
 4263f4c: a90267fa     	stp	x26, x25, [sp, #0x20]
 4263f50: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4263f54: a90457f6     	stp	x22, x21, [sp, #0x40]
 4263f58: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4263f5c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4263f60: 910183fd     	add	x29, sp, #0x60
 4263f64: aa0203f5     	mov	x21, x2
 4263f68: aa0103f6     	mov	x22, x1
 4263f6c: aa0003f4     	mov	x20, x0
 4263f70: 9004c5e0     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4263f74: 9133c800     	add	x0, x0, #0xcf2
 4263f78: 9004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4263f7c: 91342021     	add	x1, x1, #0xd08
 4263f80: 910003e8     	mov	x8, sp
 4263f84: 52802a42     	mov	w2, #0x152              ; =338
 4263f88: 96f7b33e     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4263f8c: 52800800     	mov	w0, #0x40               ; =64
 4263f90: 96f6acf6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263f94: aa0003f3     	mov	x19, x0
 4263f98: 52800038     	mov	w24, #0x1               ; =1
 4263f9c: b9000018     	str	w24, [x0]
 4263fa0: f0fee968     	adrp	x8, 0x1f92000 <_ChromeMain+0x1f8cd64>
 4263fa4: 91220108     	add	x8, x8, #0x880
 4263fa8: d0ffeaa9     	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 4263fac: 91310129     	add	x9, x9, #0xc40
 4263fb0: a900a408     	stp	x8, x9, [x0, #0x8]
 4263fb4: d0ff17d7     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 4263fb8: 912c02f7     	add	x23, x23, #0xb00
 4263fbc: 10fe3c28     	adr	x8, 0x4260740 <_ChromeMain+0x425b4a4>
 4263fc0: d503201f     	nop
 4263fc4: a901a017     	stp	x23, x8, [x0, #0x18]
 4263fc8: 3dc002c0     	ldr	q0, [x22]
 4263fcc: 3c828000     	stur	q0, [x0, #0x28]
 4263fd0: f9400ac8     	ldr	x8, [x22, #0x10]
 4263fd4: f9001c08     	str	x8, [x0, #0x38]
 4263fd8: a9007edf     	stp	xzr, xzr, [x22]
 4263fdc: f9000adf     	str	xzr, [x22, #0x10]
 4263fe0: f9405a96     	ldr	x22, [x20, #0xb0]
 4263fe4: b40000b6     	cbz	x22, 0x4263ff8 <_ChromeMain+0x425ed5c>
 4263fe8: b83802c8     	ldadd	w24, w8, [x22]
 4263fec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4263ff0: 6b09011f     	cmp	w8, w9
 4263ff4: 540008a0     	b.eq	0x4264108 <_ChromeMain+0x425ee6c>
 4263ff8: f9405e99     	ldr	x25, [x20, #0xb8]
 4263ffc: 52800900     	mov	w0, #0x48               ; =72
 4264000: 96f6acda     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264004: aa0003f4     	mov	x20, x0
 4264008: b9000018     	str	w24, [x0]
 426400c: 10005ca8     	adr	x8, 0x4264ba0 <_ChromeMain+0x425f904>
 4264010: d503201f     	nop
 4264014: f0ffe869     	adrp	x9, 0x3f73000 <_ChromeMain+0x3f6dd64>
 4264018: 912e0129     	add	x9, x9, #0xb80
 426401c: a900a408     	stp	x8, x9, [x0, #0x8]
 4264020: d0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4264024: 911b0108     	add	x8, x8, #0x6c0
 4264028: 10000769     	adr	x9, 0x4264114 <_ChromeMain+0x425ee78>
 426402c: d503201f     	nop
 4264030: a901a408     	stp	x8, x9, [x0, #0x18]
 4264034: a902d81f     	stp	xzr, x22, [x0, #0x28]
 4264038: a903d419     	stp	x25, x21, [x0, #0x38]
 426403c: 52800100     	mov	w0, #0x8                ; =8
 4264040: 96f6acca     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264044: aa0003f5     	mov	x21, x0
 4264048: f900001f     	str	xzr, [x0]
 426404c: 52800700     	mov	w0, #0x38               ; =56
 4264050: 96f6acc6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264054: aa0003f6     	mov	x22, x0
 4264058: b0fea208     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 426405c: 91190108     	add	x8, x8, #0x640
 4264060: b0ffea29     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 4264064: 91290129     	add	x9, x9, #0xa40
 4264068: b9000018     	str	w24, [x0]
 426406c: a900a408     	stp	x8, x9, [x0, #0x8]
 4264070: 10006bc8     	adr	x8, 0x4264de8 <_ChromeMain+0x425fb4c>
 4264074: d503201f     	nop
 4264078: a901a017     	stp	x23, x8, [x0, #0x18]
 426407c: f9001413     	str	x19, [x0, #0x28]
 4264080: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4264084: d0054a69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4264088: f9404529     	ldr	x9, [x9, #0x88]
 426408c: eb09011f     	cmp	x8, x9
 4264090: 54000061     	b.ne	0x426409c <_ChromeMain+0x425ee00>
 4264094: aa1503e0     	mov	x0, x21
 4264098: 96f6c099     	bl	0x142fc <_ChromeMain+0xf060>
 426409c: f9001ad5     	str	x21, [x22, #0x30]
 42640a0: 52800700     	mov	w0, #0x38               ; =56
 42640a4: 96f6acb1     	bl	0xf368 <_ChromeMain+0xa0cc>
 42640a8: aa0003e3     	mov	x3, x0
 42640ac: 52800028     	mov	w8, #0x1                ; =1
 42640b0: b9000008     	str	w8, [x0]
 42640b4: b0feab08     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 42640b8: 91380108     	add	x8, x8, #0xe00
 42640bc: 10008b29     	adr	x9, 0x4265220 <_ChromeMain+0x425ff84>
 42640c0: d503201f     	nop
 42640c4: a900a408     	stp	x8, x9, [x0, #0x8]
 42640c8: 10007e48     	adr	x8, 0x4265090 <_ChromeMain+0x425fdf4>
 42640cc: d503201f     	nop
 42640d0: a901a017     	stp	x23, x8, [x0, #0x18]
 42640d4: a902d414     	stp	x20, x21, [x0, #0x28]
 42640d8: 90046521     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42640dc: 91057421     	add	x1, x1, #0x15d
 42640e0: 910003e0     	mov	x0, sp
 42640e4: aa1603e2     	mov	x2, x22
 42640e8: 97851b27     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 42640ec: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 42640f0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 42640f4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 42640f8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 42640fc: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4264100: 9101c3ff     	add	sp, sp, #0x70
 4264104: d65f03c0     	ret
 4264108: d4200000     	brk	#0
 426410c: d4400000     	hlt	#0
 4264110: d4200020     	brk	#0x1
