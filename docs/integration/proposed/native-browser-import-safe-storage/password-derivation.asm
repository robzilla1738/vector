
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254a48: a9367fbf     	stp	xzr, xzr, [x29, #-0xa0]
 4254a4c: 39405ed7     	ldrb	w23, [x22, #0x17]
 4254a50: a94066d8     	ldp	x24, x25, [x22]
 4254a54: b004c940     	adrp	x0, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a58: 911bfc00     	add	x0, x0, #0x6ff
 4254a5c: b004c941     	adrp	x1, 0xdb7d000 <dyld_stub_binder+0xdb7d000>
 4254a60: 911c3821     	add	x1, x1, #0x70e
 4254a64: 910103e8     	add	x8, sp, #0x40
 4254a68: 52800262     	mov	w2, #0x13               ; =19
 4254a6c: 96f7f085     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4254a70: d0054b40     	adrp	x0, 0xebbe000 <dyld_stub_binder+0xebbe000>
 4254a74: 910be000     	add	x0, x0, #0x2f8
 4254a78: 103ff241     	adr	x1, 0x42d48c0 <_ChromeMain+0x42cf624>
 4254a7c: d503201f     	nop
 4254a80: 94f9f999     	bl	0x80d30e4 <_ChromeMain+0x80cde48>
 4254a84: 35005dc0     	cbnz	w0, 0x425563c <_ChromeMain+0x42503a0>
 4254a88: 13001ee8     	sxtb	w8, w23
 4254a8c: 7100011f     	cmp	w8, #0x0
 4254a90: 9a974321     	csel	x1, x25, x23, mi
 4254a94: 9a964300     	csel	x0, x24, x22, mi
 4254a98: 900465a2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4254a9c: 91040842     	add	x2, x2, #0x102
 4254aa0: b00565c5     	adrp	x5, 0xef0d000 <dyld_stub_binder+0xef0d000>
 4254aa4: 913de0a5     	add	x5, x5, #0xf78
 4254aa8: d10283a7     	sub	x7, x29, #0xa0
 4254aac: 52800123     	mov	w3, #0x9                ; =9
 4254ab0: 52807d64     	mov	w4, #0x3eb              ; =1003
 4254ab4: 52800206     	mov	w6, #0x10               ; =16
 4254ab8: 97498b12     	bl	0x14b7700 <_ChromeMain+0x14b2464>
 4254abc: 34005c20     	cbz	w0, 0x4255640 <_ChromeMain+0x42503a4>
 4254ac0: 970269c9     	bl	0x2ef1e4 <_ChromeMain+0x2e9f48>
