
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4256ecc: 39406348     	ldrb	w8, [x26, #0x18]
 4256ed0: 34000528     	cbz	w8, 0x4256f74 <_ChromeMain+0x4251cd8>
 4256ed4: a9377fbf     	stp	xzr, xzr, [x29, #-0x90]
 4256ed8: 39405f5b     	ldrb	w27, [x26, #0x17]
 4256edc: a940575c     	ldp	x28, x21, [x26]
 4256ee0: f004c920     	adrp	x0, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4256ee4: 911bfc00     	add	x0, x0, #0x6ff
 4256ee8: f004c921     	adrp	x1, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4256eec: 911c3821     	add	x1, x1, #0x70e
 4256ef0: 9105c3e8     	add	x8, sp, #0x170
 4256ef4: 52800262     	mov	w2, #0x13               ; =19
 4256ef8: 96f7e762     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4256efc: 90054b40     	adrp	x0, 0xebbe000 <dyld_stub_binder+0xebbe000>
 4256f00: 910be000     	add	x0, x0, #0x2f8
 4256f04: 103ecde1     	adr	x1, 0x42d48c0 <_ChromeMain+0x42cf624>
 4256f08: d503201f     	nop
 4256f0c: 94f9f076     	bl	0x80d30e4 <_ChromeMain+0x80cde48>
 4256f10: 350037a0     	cbnz	w0, 0x4257604 <_ChromeMain+0x4252368>
 4256f14: 13001f68     	sxtb	w8, w27
 4256f18: 7100011f     	cmp	w8, #0x0
 4256f1c: 9a9b42a1     	csel	x1, x21, x27, mi
 4256f20: 9a9a4380     	csel	x0, x28, x26, mi
 4256f24: d0046582     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4256f28: 91040842     	add	x2, x2, #0x102
 4256f2c: f00565a5     	adrp	x5, 0xef0d000 <dyld_stub_binder+0xef0d000>
 4256f30: 913de0a5     	add	x5, x5, #0xf78
 4256f34: d10243a7     	sub	x7, x29, #0x90
 4256f38: 52800123     	mov	w3, #0x9                ; =9
 4256f3c: 52807d64     	mov	w4, #0x3eb              ; =1003
 4256f40: 52800206     	mov	w6, #0x10               ; =16
 4256f44: 974981ef     	bl	0x14b7700 <_ChromeMain+0x14b2464>
 4256f48: 34003600     	cbz	w0, 0x4257608 <_ChromeMain+0x425236c>
