
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e0254: 91356260     	add	x0, x19, #0xd58
 37e0258: 9115e261     	add	x1, x19, #0x578
 37e025c: 52800782     	mov	w2, #0x3c               ; =60
 37e0260: 976e3a68     	bl	0x136ec00 <_ChromeMain+0x1369964>
 37e0264: b0055808     	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 37e0268: 91240108     	add	x8, x8, #0x900
 37e026c: f906ae68     	str	x8, [x19, #0xd58]
 37e0270: f9404788     	ldr	x8, [x28, #0x88]
 37e0274: eb08031f     	cmp	x24, x8
 37e0278: 54000061     	b.ne	0x37e0284 <_ChromeMain+0x37dafe8>
 37e027c: 9115e260     	add	x0, x19, #0x578
 37e0280: 9720d01f     	bl	0x142fc <_ChromeMain+0xf060>
 37e0284: f906d275     	str	x21, [x19, #0xda0]
 37e0288: b90daa77     	str	w23, [x19, #0xda8]
 37e028c: 3936b27f     	strb	wzr, [x19, #0xdac]
 37e0290: 3936c27f     	strb	wzr, [x19, #0xdb0]
 37e0294: f906de7f     	str	xzr, [x19, #0xdb8]
 37e0298: f906e67f     	str	xzr, [x19, #0xdc8]
 37e029c: f906e27f     	str	xzr, [x19, #0xdc0]
 37e02a0: 529a9808     	mov	w8, #0xd4c0             ; =54464
 37e02a4: 72a00028     	movk	w8, #0x1, lsl #16
 37e02a8: f906ea68     	str	x8, [x19, #0xdd0]
 37e02ac: f906ee79     	str	x25, [x19, #0xdd8]
