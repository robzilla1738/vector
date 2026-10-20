
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460d20c: 394fe809     	ldrb	w9, [x0, #0x3fa]
 460d210: 370000a9     	tbnz	w9, #0x0, 0x460d224 <_ChromeMain+0x4607f88>
 460d214: f941e809     	ldr	x9, [x0, #0x3d0]
 460d218: b40000c9     	cbz	x9, 0x460d230 <_ChromeMain+0x4607f94>
 460d21c: 39544129     	ldrb	w9, [x9, #0x510]
 460d220: 34000089     	cbz	w9, 0x460d230 <_ChromeMain+0x4607f94>
 460d224: a9007d1f     	stp	xzr, xzr, [x8]
 460d228: f900091f     	str	xzr, [x8, #0x10]
 460d22c: d65f03c0     	ret
 460d230: 39c4bc09     	ldrsb	w9, [x0, #0x12f]
 460d234: 37f800e9     	tbnz	w9, #0x1f, 0x460d250 <_ChromeMain+0x4607fb4>
 460d238: 91046009     	add	x9, x0, #0x118
 460d23c: 3dc00120     	ldr	q0, [x9]
 460d240: 3d800100     	str	q0, [x8]
 460d244: f9400929     	ldr	x9, [x9, #0x10]
 460d248: f9000909     	str	x9, [x8, #0x10]
 460d24c: d65f03c0     	ret
 460d250: a9518801     	ldp	x1, x2, [x0, #0x118]
 460d254: aa0803e0     	mov	x0, x8
 460d258: 16e8e65e     	b	0x46bd0 <_ChromeMain+0x41934>
