
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263c40: 394122c8     	ldrb	w8, [x22, #0x48]
 4263c44: 37000488     	tbnz	w8, #0x0, 0x4263cd4 <_ChromeMain+0x425ea38>
 4263c48: f9400edb     	ldr	x27, [x22, #0x18]
 4263c4c: f9405ad7     	ldr	x23, [x22, #0xb0]
 4263c50: b40000d7     	cbz	x23, 0x4263c68 <_ChromeMain+0x425e9cc>
 4263c54: 52800028     	mov	w8, #0x1                ; =1
 4263c58: b82802e8     	ldadd	w8, w8, [x23]
 4263c5c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4263c60: 6b09011f     	cmp	w8, w9
 4263c64: 54000b60     	b.eq	0x4263dd0 <_ChromeMain+0x425eb34>
 4263c68: f9405edc     	ldr	x28, [x22, #0xb8]
 4263c6c: 52800b00     	mov	w0, #0x58               ; =88
 4263c70: 96f6adbe     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263c74: aa0003f8     	mov	x24, x0
 4263c78: 52800028     	mov	w8, #0x1                ; =1
 4263c7c: b9000008     	str	w8, [x0]
 4263c80: 10007388     	adr	x8, 0x4264af0 <_ChromeMain+0x425f854>
 4263c84: d503201f     	nop
 4263c88: f0fff029     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 4263c8c: 913a0129     	add	x9, x9, #0xe80
 4263c90: a900a408     	stp	x8, x9, [x0, #0x8]
 4263c94: f0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4263c98: 911b0108     	add	x8, x8, #0x6c0
 4263c9c: 10001569     	adr	x9, 0x4263f48 <_ChromeMain+0x425ecac>
 4263ca0: d503201f     	nop
 4263ca4: a901a408     	stp	x8, x9, [x0, #0x18]
 4263ca8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4263cac: f9001c1c     	str	x28, [x0, #0x38]
 4263cb0: 39c0dea8     	ldrsb	w8, [x21, #0x37]
 4263cb4: 37f80488     	tbnz	w8, #0x1f, 0x4263d44 <_ChromeMain+0x425eaa8>
 4263cb8: 3cc202a0     	ldur	q0, [x21, #0x20]
 4263cbc: 3c840300     	stur	q0, [x24, #0x40]
 4263cc0: f84302a8     	ldur	x8, [x21, #0x30]
 4263cc4: f8050308     	stur	x8, [x24, #0x50]
 4263cc8: f9403777     	ldr	x23, [x27, #0x68]
 4263ccc: f9003778     	str	x24, [x27, #0x68]
 4263cd0: b5000437     	cbnz	x23, 0x4263d54 <_ChromeMain+0x425eab8>
