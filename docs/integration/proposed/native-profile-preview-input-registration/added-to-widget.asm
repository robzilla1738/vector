
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 33f548c: d10203ff     	sub	sp, sp, #0x80
 33f5490: a9045ff8     	stp	x24, x23, [sp, #0x40]
 33f5494: a90557f6     	stp	x22, x21, [sp, #0x50]
 33f5498: a9064ff4     	stp	x20, x19, [sp, #0x60]
 33f549c: a9077bfd     	stp	x29, x30, [sp, #0x70]
 33f54a0: 9101c3fd     	add	x29, sp, #0x70
 33f54a4: aa0003f3     	mov	x19, x0
 33f54a8: 94000176     	bl	0x33f5a80 <_ChromeMain+0x33f07e4>
 33f54ac: f9400268     	ldr	x8, [x19]
 33f54b0: f9403108     	ldr	x8, [x8, #0x60]
 33f54b4: f0fe93b7     	adrp	x23, 0x66c000 <_ChromeMain+0x666d64>
 33f54b8: 913942f7     	add	x23, x23, #0xe50
 33f54bc: eb17011f     	cmp	x8, x23
 33f54c0: 54000841     	b.ne	0x33f55c8 <_ChromeMain+0x33f032c>
 33f54c4: f940c260     	ldr	x0, [x19, #0x180]
 33f54c8: b12f0268     	adds	x8, x19, #0xbc0
 33f54cc: 540026c0     	b.eq	0x33f59a4 <_ChromeMain+0x33f0708>
 33f54d0: f940c809     	ldr	x9, [x0, #0x190]
 33f54d4: 5280004a     	mov	w10, #0x2               ; =2
 33f54d8: a9002be8     	stp	x8, x10, [sp]
 33f54dc: 9101e120     	add	x0, x9, #0x78
 33f54e0: 910003e1     	mov	x1, sp
 33f54e4: 97c2a41d     	bl	0x249e558 <_ChromeMain+0x24992bc>
