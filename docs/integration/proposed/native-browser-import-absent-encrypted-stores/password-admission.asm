
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b288: 52800013     	mov	w19, #0x0               ; =0
 425b28c: f940cbe8     	ldr	x8, [sp, #0x190]
 425b290: f9401508     	ldr	x8, [x8, #0x28]
 425b294: b4000108     	cbz	x8, 0x425b2b4 <_ChromeMain+0x4256018>
 425b298: 394673e8     	ldrb	w8, [sp, #0x19c]
 425b29c: 360000c8     	tbz	w8, #0x0, 0x425b2b4 <_ChromeMain+0x4256018>
 425b2a0: 52800033     	mov	w19, #0x1               ; =1
 425b2a4: b9419be8     	ldr	w8, [sp, #0x198]
 425b2a8: 51019109     	sub	w9, w8, #0x64
 425b2ac: 7100093f     	cmp	w9, #0x2
 425b2b0: 54005c02     	b.hs	0x425be30 <_ChromeMain+0x4256b94>
 425b2b4: 910643e0     	add	x0, sp, #0x190
 425b2b8: 97228623     	bl	0xafcb44 <_ChromeMain+0xaf78a8>
 425b2bc: 14000099     	b	0x425b520 <_ChromeMain+0x4256284>
 425b2c0: 52800013     	mov	w19, #0x0               ; =0
 425b2c4: 17fffffc     	b	0x425b2b4 <_ChromeMain+0x4256018>
 425b2c8: 6f00e400     	movi.2d	v0, #0000000000000000
 425b2cc: ad0c83e0     	stp	q0, q0, [sp, #0x190]
 425b2d0: 9106c3e0     	add	x0, sp, #0x1b0
 425b2d4: 9004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425b2d8: 9119e821     	add	x1, x1, #0x67a
 425b2dc: 52803b02     	mov	w2, #0x1d8              ; =472
 425b2e0: 52800003     	mov	w3, #0x0                ; =0
 425b2e4: 97228b07     	bl	0xafdf00 <_ChromeMain+0xaf8c64>
 425b2e8: f900cbe0     	str	x0, [sp, #0x190]
 425b2ec: 390663ff     	strb	wzr, [sp, #0x198]
 425b2f0: 390673ff     	strb	wzr, [sp, #0x19c]
 425b2f4: 390683ff     	strb	wzr, [sp, #0x1a0]
 425b2f8: 3906a3ff     	strb	wzr, [sp, #0x1a8]
 425b2fc: f9401408     	ldr	x8, [x0, #0x28]
 425b300: b4fffe08     	cbz	x8, 0x425b2c0 <_ChromeMain+0x4256024>
 425b304: 910643e0     	add	x0, sp, #0x190
 425b308: 9718d4ee     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425b30c: 7101901f     	cmp	w0, #0x64
 425b310: 54fffbc1     	b.ne	0x425b288 <_ChromeMain+0x4255fec>
 425b314: 910643e0     	add	x0, sp, #0x190
