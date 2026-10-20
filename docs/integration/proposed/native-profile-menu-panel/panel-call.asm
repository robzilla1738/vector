
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4573250: 52801e00     	mov	w0, #0xf0               ; =240
 4573254: 9400162e     	bl	0x4578b0c <_ChromeMain+0x4573870>
 4573258: 52800108     	mov	w8, #0x8                ; =8
 457325c: 39051fe8     	strb	w8, [sp, #0x147]
 4573260: 9104c3e9     	add	x9, sp, #0x130
 4573264: 9100412a     	add	x10, x9, #0x10
 4573268: f004d088     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 457326c: 913ed108     	add	x8, x8, #0xfb4
 4573270: eb08015f     	cmp	x10, x8
 4573274: fa488122     	ccmp	x9, x8, #0x2, hi
 4573278: 540041e9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457327c: aa0003f4     	mov	x20, x0
 4573280: 3dc00100     	ldr	q0, [x8]
 4573284: 3d804fe0     	str	q0, [sp, #0x130]
 4573288: 790283ff     	strh	wzr, [sp, #0x140]
 457328c: 9104c3e1     	add	x1, sp, #0x130
 4573290: 9400166c     	bl	0x4578c40 <_ChromeMain+0x45739a4>
