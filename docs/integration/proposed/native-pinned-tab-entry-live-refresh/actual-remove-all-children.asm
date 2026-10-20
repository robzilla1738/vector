
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1e51518: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 1e5151c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 1e51520: 910043fd     	add	x29, sp, #0x10
 1e51524: aa0003f3     	mov	x19, x0
 1e51528: f940cc08     	ldr	x8, [x0, #0x198]
 1e5152c: b4000148     	cbz	x8, 0x1e51554 <_ChromeMain+0x1e4c2b8>
 1e51530: f940ca68     	ldr	x8, [x19, #0x190]
 1e51534: f9400101     	ldr	x1, [x8]
 1e51538: aa1303e0     	mov	x0, x19
 1e5153c: 52800002     	mov	w2, #0x0                ; =0
 1e51540: 52800023     	mov	w3, #0x1                ; =1
 1e51544: d2800004     	mov	x4, #0x0                ; =0
 1e51548: 94000038     	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 1e5154c: f940ce68     	ldr	x8, [x19, #0x198]
 1e51550: b5ffff08     	cbnz	x8, 0x1e51530 <_ChromeMain+0x1e4c294>
 1e51554: f9400268     	ldr	x8, [x19]
 1e51558: f9403508     	ldr	x8, [x8, #0x68]
 1e5155c: aa1303e0     	mov	x0, x19
 1e51560: d63f0100     	blr	x8
 1e51564: b5000080     	cbnz	x0, 0x1e51574 <_ChromeMain+0x1e4c2d8>
