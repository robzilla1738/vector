
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4127744:      	mov	w8, #0x0                ; =0
 4127748:      	cbz	x0, 0x41277b8 <_ChromeMain+0x412251c>
 412774c:      	sub	sp, sp, #0x40
 4127750:      	stp	x20, x19, [sp, #0x20]
 4127754:      	stp	x29, x30, [sp, #0x30]
 4127758:      	add	x29, sp, #0x30
 412775c:      	mov	x19, x1
 4127760:      	cbz	x1, 0x41277ac <_ChromeMain+0x4122510>
 4127764:      	mov	x20, x0
 4127768:      	ldr	x8, [x0, #0x40]
 412776c:      	cbz	x8, 0x412778c <_ChromeMain+0x41224f0>
 4127770:      	adrp	x1, 0xd6e4000 <dyld_stub_binder+0xd6e4000>
 4127774:      	add	x1, x1, #0xf6c
 4127778:      	add	x0, x8, #0x8
 412777c:      	bl	0x53170 <_ChromeMain+0x4ded4>
 4127780:      	cbz	x0, 0x412778c <_ChromeMain+0x41224f0>
 4127784:      	mov	w8, #0x1                ; =1
 4127788:      	b	0x41277ac <_ChromeMain+0x4122510>
 412778c:      	ldr	q0, [x20, #0x80]
 4127790:      	str	q0, [sp]
 4127794:      	ldr	x8, [x20, #0x90]
 4127798:      	str	x8, [sp, #0x10]
 412779c:      	tbz	w8, #0x0, 0x41277a8 <_ChromeMain+0x412250c>
 41277a0:      	ldr	x0, [x19, #0x8]
 41277a4:      	cbnz	x0, 0x41277c0 <_ChromeMain+0x4122524>
 41277a8:      	mov	w8, #0x0                ; =0
 41277ac:      	ldp	x29, x30, [sp, #0x30]
 41277b0:      	ldp	x20, x19, [sp, #0x20]
 41277b4:      	add	sp, sp, #0x40
 41277b8:      	and	w0, w8, #0x1
 41277bc:      	ret
 41277c0:      	mov	x1, sp
 41277c4:      	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 41277c8:      	cbz	x0, 0x41277a8 <_ChromeMain+0x412250c>
 41277cc:      	ldr	x8, [x0, #0xb8]
 41277d0:      	cbz	x8, 0x41277ac <_ChromeMain+0x4122510>
 41277d4:      	ldrb	w8, [x8, #0x11]
 41277d8:      	b	0x41277ac <_ChromeMain+0x4122510>
