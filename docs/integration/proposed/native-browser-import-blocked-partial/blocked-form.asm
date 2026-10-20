
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425bcf0: d37ff901     	lsl	x1, x8, #1
 425bcf4: 96f6b471     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bcf8: 3cce83e0     	ldur	q0, [sp, #0xe8]
 425bcfc: f94007e9     	ldr	x9, [sp, #0x8]
 425bd00: 3d800120     	str	q0, [x9]
 425bd04: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd08: f9000928     	str	x8, [x9, #0x10]
 425bd0c: 910643e0     	add	x0, sp, #0x190
 425bd10: 528002c1     	mov	w1, #0x16               ; =22
 425bd14: 9711e7c7     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd18: f905a3e0     	str	x0, [sp, #0xb40]
 425bd1c: 910643e0     	add	x0, sp, #0x190
 425bd20: 528002e1     	mov	w1, #0x17               ; =23
 425bd24: 9711e8e3     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bd28: 392d23e0     	strb	w0, [sp, #0xb48]
 425bd2c: 910643e0     	add	x0, sp, #0x190
 425bd30: 52800301     	mov	w1, #0x18               ; =24
 425bd34: 9711e8ab     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425bd38: aa0003e2     	mov	x2, x0
 425bd3c: aa0103e3     	mov	x3, x1
 425bd40: 9103a3e0     	add	x0, sp, #0xe8
 425bd44: aa0203e1     	mov	x1, x2
 425bd48: aa0303e2     	mov	x2, x3
 425bd4c: 97045122     	bl	0x3701d4 <_ChromeMain+0x36af38>
 425bd50: 911ea2a0     	add	x0, x21, #0x7a8
 425bd54: 9103a3e1     	add	x1, sp, #0xe8
 425bd58: 970e7762     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 425bd5c: 9101c2c0     	add	x0, x22, #0x70
 425bd60: d2800001     	mov	x1, #0x0                ; =0
 425bd64: 96f72fd5     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 425bd68: 910082c0     	add	x0, x22, #0x20
 425bd6c: 96f72fc3     	bl	0x27c78 <_ChromeMain+0x229dc>
 425bd70: 39c3ffe8     	ldrsb	w8, [sp, #0xff]
 425bd74: 36f800a8     	tbz	w8, #0x1f, 0x425bd88 <_ChromeMain+0x4256aec>
 425bd78: f94077e0     	ldr	x0, [sp, #0xe8]
 425bd7c: f9407fe8     	ldr	x8, [sp, #0xf8]
 425bd80: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425bd84: 96f6b44d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425bd88: 910643e0     	add	x0, sp, #0x190
 425bd8c: 52800321     	mov	w1, #0x19               ; =25
 425bd90: 9711e7a8     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 425bd94: f9034be0     	str	x0, [sp, #0x690]
 425bd98: 910643e0     	add	x0, sp, #0x190
 425bd9c: 52800341     	mov	w1, #0x1a               ; =26
 425bda0: 9711e8c4     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 425bda4: 392d27e0     	strb	w0, [sp, #0xb49]
 425bda8: 395aa3e8     	ldrb	w8, [sp, #0x6a8]
 425bdac: 34000228     	cbz	w8, 0x425bdf0 <_ChromeMain+0x4256b54>
 425bdb0: 39d69fe8     	ldrsb	w8, [sp, #0x5a7]
 425bdb4: 37f80088     	tbnz	w8, #0x1f, 0x425bdc4 <_ChromeMain+0x4256b28>
 425bdb8: 790b23ff     	strh	wzr, [sp, #0x590]
 425bdbc: 39169fff     	strb	wzr, [sp, #0x5a7]
 425bdc0: 14000004     	b	0x425bdd0 <_ChromeMain+0x4256b34>
 425bdc4: f942cbe8     	ldr	x8, [sp, #0x590]
 425bdc8: 7900011f     	strh	wzr, [x8]
 425bdcc: f902cfff     	str	xzr, [sp, #0x598]
 425bdd0: 39d85fe8     	ldrsb	w8, [sp, #0x617]
 425bdd4: 37f80088     	tbnz	w8, #0x1f, 0x425bde4 <_ChromeMain+0x4256b48>
 425bdd8: 790c03ff     	strh	wzr, [sp, #0x600]
 425bddc: 39185fff     	strb	wzr, [sp, #0x617]
 425bde0: 14000004     	b	0x425bdf0 <_ChromeMain+0x4256b54>
 425bde4: f94303e8     	ldr	x8, [sp, #0x600]
 425bde8: 7900011f     	strh	wzr, [x8]
 425bdec: f90307ff     	str	xzr, [sp, #0x608]
