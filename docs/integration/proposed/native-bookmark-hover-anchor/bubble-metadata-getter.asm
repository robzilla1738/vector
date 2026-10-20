
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7a9660:      	stp	x20, x19, [sp, #-0x20]!
 c7a9664:      	stp	x29, x30, [sp, #0x10]
 c7a9668:      	add	x29, sp, #0x10
 c7a966c:      	adrp	x20, 0xeedb000 <dyld_stub_binder+0xeedb000>
 c7a9670:      	ldr	x19, [x20, #0xa68]
 c7a9674:      	cbz	x19, 0xc7a9688 <_ChromeMain+0xc7a43ec>
 c7a9678:      	mov	x0, x19
 c7a967c:      	ldp	x29, x30, [sp, #0x10]
 c7a9680:      	ldp	x20, x19, [sp], #0x20
 c7a9684:      	ret
 c7a9688:      	mov	w0, #0x68               ; =104
 c7a968c:      	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 c7a9690:      	mov	x19, x0
 c7a9694:      	bl	0xc7aa8d8 <_ChromeMain+0xc7a563c>
 c7a9698:      	bl	0xcb8d930 <_ChromeMain+0xcb88694>
 c7a969c:      	str	x19, [x20, #0xa68]
 c7a96a0:      	b	0xc7a9678 <_ChromeMain+0xc7a43dc>
 c7a96a4:      	b	0xc7a9660 <_ChromeMain+0xc7a43c4>
