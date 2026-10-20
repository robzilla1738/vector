
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1c6c100: d10303ff     	sub	sp, sp, #0xc0
 1c6c104: a9066ffc     	stp	x28, x27, [sp, #0x60]
 1c6c108: a90767fa     	stp	x26, x25, [sp, #0x70]
 1c6c10c: a9085ff8     	stp	x24, x23, [sp, #0x80]
 1c6c110: a90957f6     	stp	x22, x21, [sp, #0x90]
 1c6c114: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 1c6c118: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 1c6c11c: 9102c3fd     	add	x29, sp, #0xb0
 1c6c120: aa0003f6     	mov	x22, x0
 1c6c124: aa0003f3     	mov	x19, x0
 1c6c128: f8008e7f     	str	xzr, [x19, #0x8]!
 1c6c12c: f900081f     	str	xzr, [x0, #0x10]
 1c6c130: f9000013     	str	x19, [x0]
 1c6c134: f0059455     	adrp	x21, 0xcef7000 <dyld_stub_binder+0xcef7000>
 1c6c138: 9107d2b5     	add	x21, x21, #0x1f4
 1c6c13c: 12800017     	mov	w23, #-0x1              ; =-1
 1c6c140: f0059458     	adrp	x24, 0xcef7000 <dyld_stub_binder+0xcef7000>
 1c6c144: 91134318     	add	x24, x24, #0x4d0
 1c6c148: 1400002b     	b	0x1c6c1f4 <_ChromeMain+0x1c66f58>
 1c6c14c: 91002334     	add	x20, x25, #0x8
 1c6c150: 1400000b     	b	0x1c6c17c <_ChromeMain+0x1c66ee0>
 1c6c154: 540004ad     	b.le	0x1c6c1e8 <_ChromeMain+0x1c66f4c>
 1c6c158: f9400728     	ldr	x8, [x25, #0x8]
 1c6c15c: b4ffff88     	cbz	x8, 0x1c6c14c <_ChromeMain+0x1c66eb0>
 1c6c160: aa0803f9     	mov	x25, x8
 1c6c164: b9402108     	ldr	w8, [x8, #0x20]
 1c6c168: 6b08037f     	cmp	w27, w8
 1c6c16c: 54ffff4a     	b.ge	0x1c6c154 <_ChromeMain+0x1c66eb8>
 1c6c170: f9400328     	ldr	x8, [x25]
 1c6c174: aa1903f4     	mov	x20, x25
 1c6c178: b5ffff48     	cbnz	x8, 0x1c6c160 <_ChromeMain+0x1c66ec4>
 1c6c17c: 52800900     	mov	w0, #0x48               ; =72
 1c6c180: 978e8c7a     	bl	0xf368 <_ChromeMain+0xa0cc>
 1c6c184: aa0003e1     	mov	x1, x0
 1c6c188: b40011a1     	cbz	x1, 0x1c6c3bc <_ChromeMain+0x1c67120>
 1c6c18c: b100803f     	cmn	x1, #0x20
 1c6c190: 54001160     	b.eq	0x1c6c3bc <_ChromeMain+0x1c67120>
 1c6c194: 52800fe8     	mov	w8, #0x7f               ; =127
 1c6c198: 72a00048     	movk	w8, #0x2, lsl #16
 1c6c19c: 0a080388     	and	w8, w28, w8
 1c6c1a0: b900203b     	str	w27, [x1, #0x20]
 1c6c1a4: 7900503a     	strh	w26, [x1, #0x28]
 1c6c1a8: 7900543f     	strh	wzr, [x1, #0x2a]
 1c6c1ac: 2905a03f     	stp	wzr, w8, [x1, #0x2c]
 1c6c1b0: f803c03f     	stur	xzr, [x1, #0x3c]
 1c6c1b4: f803403f     	stur	xzr, [x1, #0x34]
 1c6c1b8: b9004437     	str	w23, [x1, #0x44]
 1c6c1bc: a9007c3f     	stp	xzr, xzr, [x1]
 1c6c1c0: f9000839     	str	x25, [x1, #0x10]
 1c6c1c4: f9000281     	str	x1, [x20]
 1c6c1c8: f94002c8     	ldr	x8, [x22]
 1c6c1cc: f9400108     	ldr	x8, [x8]
 1c6c1d0: b5000208     	cbnz	x8, 0x1c6c210 <_ChromeMain+0x1c66f74>
 1c6c1d4: f94006c0     	ldr	x0, [x22, #0x8]
 1c6c1d8: 978fbe22     	bl	0x5ba60 <_ChromeMain+0x567c4>
 1c6c1dc: f9400ac8     	ldr	x8, [x22, #0x10]
 1c6c1e0: 91000508     	add	x8, x8, #0x1
 1c6c1e4: f9000ac8     	str	x8, [x22, #0x10]
 1c6c1e8: 910032b5     	add	x21, x21, #0xc
 1c6c1ec: eb1802bf     	cmp	x21, x24
 1c6c1f0: 54000160     	b.eq	0x1c6c21c <_ChromeMain+0x1c66f80>
 1c6c1f4: 794012ba     	ldrh	w26, [x21, #0x8]
 1c6c1f8: 294072bb     	ldp	w27, w28, [x21]
 1c6c1fc: aa1303f4     	mov	x20, x19
 1c6c200: aa1303f9     	mov	x25, x19
 1c6c204: f9400268     	ldr	x8, [x19]
 1c6c208: b4fffba8     	cbz	x8, 0x1c6c17c <_ChromeMain+0x1c66ee0>
 1c6c20c: 17ffffd5     	b	0x1c6c160 <_ChromeMain+0x1c66ec4>
 1c6c210: f90002c8     	str	x8, [x22]
 1c6c214: f9400281     	ldr	x1, [x20]
 1c6c218: 17ffffef     	b	0x1c6c1d4 <_ChromeMain+0x1c66f38>
