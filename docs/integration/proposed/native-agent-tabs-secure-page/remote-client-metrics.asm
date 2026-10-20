
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40330d4: 528001c9     	mov	w9, #0xe                ; =14
 40330d8: 39005d09     	strb	w9, [x8, #0x17]
 40330dc: 9100390a     	add	x10, x8, #0xe
 40330e0: 9004ca29     	adrp	x9, 0xd977000 <dyld_stub_binder+0xd977000>
 40330e4: 91223d29     	add	x9, x9, #0x88f
 40330e8: eb09015f     	cmp	x10, x9
 40330ec: fa498102     	ccmp	x8, x9, #0x2, hi
 40330f0: 540000e9     	b.ls	0x403310c <_ChromeMain+0x402de70>
 40330f4: f940012a     	ldr	x10, [x9]
 40330f8: f900010a     	str	x10, [x8]
 40330fc: f8406129     	ldur	x9, [x9, #0x6]
 4033100: f8006109     	stur	x9, [x8, #0x6]
 4033104: 3900391f     	strb	wzr, [x8, #0xe]
 4033108: d65f03c0     	ret
 403310c: d4200020     	brk	#0x1
