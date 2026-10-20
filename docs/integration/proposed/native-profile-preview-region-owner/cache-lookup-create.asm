
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4657cc0: 39805ea8     	ldrsb	x8, [x21, #0x17]
 4657cc4: b6f80048     	tbz	x8, #0x3f, 0x4657ccc <_ChromeMain+0x4652a30>
 4657cc8: f94006a8     	ldr	x8, [x21, #0x8]
 4657ccc: b4fff948     	cbz	x8, 0x4657bf4 <_ChromeMain+0x4652958>
 4657cd0: aa1603e0     	mov	x0, x22
 4657cd4: aa1503e1     	mov	x1, x21
 4657cd8: 97fc1497     	bl	0x455cf34 <_ChromeMain+0x4557c98>
 4657cdc: aa0003f7     	mov	x23, x0
 4657ce0: b4000060     	cbz	x0, 0x4657cec <_ChromeMain+0x4652a50>
 4657ce4: 3943c2e8     	ldrb	w8, [x23, #0xf0]
 4657ce8: 37000248     	tbnz	w8, #0x0, 0x4657d30 <_ChromeMain+0x4652a94>
 4657cec: aa1303e0     	mov	x0, x19
 4657cf0: aa1503e1     	mov	x1, x21
 4657cf4: 97fff817     	bl	0x4655d50 <_ChromeMain+0x4650ab4>
 4657cf8: 35000340     	cbnz	w0, 0x4657d60 <_ChromeMain+0x4652ac4>
 4657cfc: f0054468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4657d00: f9467d00     	ldr	x0, [x8, #0xcf8]
 4657d04: b4000160     	cbz	x0, 0x4657d30 <_ChromeMain+0x4652a94>
 4657d08: 974f1f9c     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4657d0c: b4000120     	cbz	x0, 0x4657d30 <_ChromeMain+0x4652a94>
 4657d10: aa1503e1     	mov	x1, x21
 4657d14: 97853664     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 4657d18: b40000c0     	cbz	x0, 0x4657d30 <_ChromeMain+0x4652a94>
 4657d1c: aa0003e1     	mov	x1, x0
 4657d20: aa1603e0     	mov	x0, x22
 4657d24: 52800002     	mov	w2, #0x0                ; =0
 4657d28: 97fc14b1     	bl	0x455cfec <_ChromeMain+0x4557d50>
 4657d2c: aa0003f7     	mov	x23, x0
 4657d30: eb1602ff     	cmp	x23, x22
 4657d34: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 4657d38: 54000140     	b.eq	0x4657d60 <_ChromeMain+0x4652ac4>
 4657d3c: f9403ee8     	ldr	x8, [x23, #0x78]
 4657d40: b4000108     	cbz	x8, 0x4657d60 <_ChromeMain+0x4652ac4>
 4657d44: 9100a2e0     	add	x0, x23, #0x28
 4657d48: 9704bac4     	bl	0x786858 <_ChromeMain+0x7815bc>
 4657d4c: b40000a0     	cbz	x0, 0x4657d60 <_ChromeMain+0x4652ac4>
 4657d50: f9432c16     	ldr	x22, [x0, #0x658]
 4657d54: b4000076     	cbz	x22, 0x4657d60 <_ChromeMain+0x4652ac4>
 4657d58: eb1302df     	cmp	x22, x19
 4657d5c: 54002381     	b.ne	0x46581cc <_ChromeMain+0x4652f30>
 4657d60: aa1403e0     	mov	x0, x20
 4657d64: 52800021     	mov	w1, #0x1                ; =1
 4657d68: 940001ee     	bl	0x4658520 <_ChromeMain+0x4653284>
 4657d6c: 17ffffa2     	b	0x4657bf4 <_ChromeMain+0x4652958>
