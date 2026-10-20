
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f12bc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 41f12c0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 41f12c4: 910043fd     	add	x29, sp, #0x10
 41f12c8: b11b601f     	cmn	x0, #0x6d8
 41f12cc: 54000220     	b.eq	0x41f1310 <_ChromeMain+0x41ec074>
 41f12d0: aa0003f3     	mov	x19, x0
 41f12d4: f9036c01     	str	x1, [x0, #0x6d8]
 41f12d8: f9037002     	str	x2, [x0, #0x6e0]
 41f12dc: 52800028     	mov	w8, #0x1                ; =1
 41f12e0: 391ba008     	strb	w8, [x0, #0x6e8]
 41f12e4: f9400008     	ldr	x8, [x0]
 41f12e8: f9403108     	ldr	x8, [x8, #0x60]
 41f12ec: d63f0100     	blr	x8
 41f12f0: b40000a0     	cbz	x0, 0x41f1304 <_ChromeMain+0x41ec068>
 41f12f4: f9400008     	ldr	x8, [x0]
 41f12f8: f940d508     	ldr	x8, [x8, #0x1a8]
 41f12fc: d63f0100     	blr	x8
 41f1300: b50000a0     	cbnz	x0, 0x41f1314 <_ChromeMain+0x41ec078>
 41f1304: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41f1308: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41f130c: d65f03c0     	ret
 41f1310: d4200020     	brk	#0x1
 41f1314: f9400268     	ldr	x8, [x19]
 41f1318: f9426501     	ldr	x1, [x8, #0x4c8]
 41f131c: aa1303e0     	mov	x0, x19
 41f1320: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 41f1324: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 41f1328: d61f0020     	br	x1
