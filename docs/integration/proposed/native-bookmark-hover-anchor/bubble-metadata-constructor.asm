
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7aa8d8:      	stp	x20, x19, [sp, #-0x20]!
 c7aa8dc:      	stp	x29, x30, [sp, #0x10]
 c7aa8e0:      	add	x29, sp, #0x10
 c7aa8e4:      	mov	x19, x0
 c7aa8e8:      	adrp	x1, 0xdecd000 <dyld_stub_binder+0xdecd000>
 c7aa8ec:      	add	x1, x1, #0x890
 c7aa8f0:      	mov	w2, #0x49               ; =73
 c7aa8f4:      	mov	w3, #0x2a               ; =42
 c7aa8f8:      	bl	0xcb85a64 <_ChromeMain+0xcb807c8>
 c7aa8fc:      	adrp	x8, 0xe50b000 <dyld_stub_binder+0xe50b000>
 c7aa900:      	add	x8, x8, #0xdb0
 c7aa904:      	str	x8, [x0]
 c7aa908:      	adrp	x1, 0xdecd000 <dyld_stub_binder+0xdecd000>
 c7aa90c:      	add	x1, x1, #0x820
 c7aa910:      	mov	w2, #0x16               ; =22
 c7aa914:      	bl	0xcbaa874 <_ChromeMain+0xcba55d8>
 c7aa918:      	bl	0xa668dc8 <_ChromeMain+0xa663b2c>
 c7aa91c:      	mov	x1, x0
 c7aa920:      	mov	x0, x19
 c7aa924:      	bl	0xcbaa880 <_ChromeMain+0xcba55e4>
 c7aa928:      	mov	x0, x19
 c7aa92c:      	ldp	x29, x30, [sp, #0x10]
 c7aa930:      	ldp	x20, x19, [sp], #0x20
 c7aa934:      	ret
