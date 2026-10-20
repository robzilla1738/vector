
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e015c: 912f2268     	add	x8, x19, #0xbc8
 37e0160: ad000100     	stp	q0, q0, [x8]
 37e0164: 90056948     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 37e0168: 9136c108     	add	x8, x8, #0xdb0
 37e016c: f905e268     	str	x8, [x19, #0xbc0]
 37e0170: 925e7668     	and	x8, x19, #0xfffffffc00000000
 37e0174: f9404789     	ldr	x9, [x28, #0x88]
 37e0178: eb09011f     	cmp	x8, x9
 37e017c: 54000061     	b.ne	0x37e0188 <_ChromeMain+0x37daeec>
 37e0180: aa1303e0     	mov	x0, x19
 37e0184: 9720d05e     	bl	0x142fc <_ChromeMain+0xf060>
 37e0188: f905f673     	str	x19, [x19, #0xbe8]
 37e018c: 392fc27f     	strb	wzr, [x19, #0xbf0]
