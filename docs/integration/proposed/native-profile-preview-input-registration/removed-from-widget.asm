
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463f920: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 463f924: a9014ff4     	stp	x20, x19, [sp, #0x10]
 463f928: a9027bfd     	stp	x29, x30, [sp, #0x20]
 463f92c: 910083fd     	add	x29, sp, #0x20
 463f930: aa0003f3     	mov	x19, x0
 463f934: f9400008     	ldr	x8, [x0]
 463f938: f9403108     	ldr	x8, [x8, #0x60]
 463f93c: b0fe0169     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 463f940: 91394129     	add	x9, x9, #0xe50
 463f944: eb09011f     	cmp	x8, x9
 463f948: 54000401     	b.ne	0x463f9c8 <_ChromeMain+0x463a72c>
 463f94c: f940c260     	ldr	x0, [x19, #0x180]
 463f950: f940c808     	ldr	x8, [x0, #0x190]
 463f954: 9101c100     	add	x0, x8, #0x70
 463f958: 912f0261     	add	x1, x19, #0xbc0
 463f95c: 97604980     	bl	0x1e51f5c <_ChromeMain+0x1e4ccc0>
