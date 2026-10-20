
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2104368: d10103ff     	sub	sp, sp, #0x40
 210436c: a90157f6     	stp	x22, x21, [sp, #0x10]
 2104370: a9024ff4     	stp	x20, x19, [sp, #0x20]
 2104374: a9037bfd     	stp	x29, x30, [sp, #0x30]
 2104378: 9100c3fd     	add	x29, sp, #0x30
 210437c: aa0003f3     	mov	x19, x0
 2104380: d00675a8     	adrp	x8, 0xefba000 <dyld_stub_binder+0xefba000>
 2104384: 913ce108     	add	x8, x8, #0xf38
 2104388: 38bfc108     	ldaprb	w8, [x8]
 210438c: 36000148     	tbz	w8, #0x0, 0x21043b4 <_ChromeMain+0x20ff118>
 2104390: d00675a0     	adrp	x0, 0xefba000 <dyld_stub_binder+0xefba000>
 2104394: 913c0000     	add	x0, x0, #0xf00
 2104398: aa1303e1     	mov	x1, x19
 210439c: 52800022     	mov	w2, #0x1                ; =1
 21043a0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 21043a4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 21043a8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 21043ac: 910103ff     	add	sp, sp, #0x40
 21043b0: 177d3a79     	b	0x52d94 <_ChromeMain+0x4daf8>
 21043b4: d00675b4     	adrp	x20, 0xefba000 <dyld_stub_binder+0xefba000>
 21043b8: 913ce294     	add	x20, x20, #0xf38
 21043bc: aa1403e0     	mov	x0, x20
 21043c0: 957c0140     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 21043c4: 34fffe60     	cbz	w0, 0x2104390 <_ChromeMain+0x20ff0f4>
 21043c8: d00675b5     	adrp	x21, 0xefba000 <dyld_stub_binder+0xefba000>
 21043cc: 913c02b5     	add	x21, x21, #0xf00
 21043d0: 977d3ed3     	bl	0x53f1c <_ChromeMain+0x4ec80>
 21043d4: d0060fa8     	adrp	x8, 0xe2fa000 <dyld_stub_binder+0xe2fa000>
 21043d8: 91092108     	add	x8, x8, #0x248
 21043dc: d00675a9     	adrp	x9, 0xefba000 <dyld_stub_binder+0xefba000>
 21043e0: f9078128     	str	x8, [x9, #0xf00]
 21043e4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 21043e8: d0065569     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 21043ec: f9404529     	ldr	x9, [x9, #0x88]
 21043f0: eb09011f     	cmp	x8, x9
 21043f4: 540008e0     	b.eq	0x2104510 <_ChromeMain+0x20ff274>
 21043f8: b005ee08     	adrp	x8, 0xdec5000 <dyld_stub_binder+0xdec5000>
 21043fc: 91259508     	add	x8, x8, #0x965
 2104400: a900a2a0     	stp	x0, x8, [x21, #0x8]
 2104404: b9001abf     	str	wzr, [x21, #0x18]
 2104408: aa1503e1     	mov	x1, x21
 210440c: 977d3e87     	bl	0x53e28 <_ChromeMain+0x4eb8c>
 2104410: a9027ebf     	stp	xzr, xzr, [x21, #0x20]
 2104414: f9001abf     	str	xzr, [x21, #0x30]
 2104418: f0061fa8     	adrp	x8, 0xe4fb000 <dyld_stub_binder+0xe4fb000>
 210441c: 9139c108     	add	x8, x8, #0xe70
 2104420: f90002a8     	str	x8, [x21]
