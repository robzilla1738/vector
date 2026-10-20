
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 78abd18: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 78abd1c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 78abd20: 910043fd     	add	x29, sp, #0x10
 78abd24: d003b2b4     	adrp	x20, 0xef01000 <dyld_stub_binder+0xef01000>
 78abd28: f9437a93     	ldr	x19, [x20, #0x6f0]
 78abd2c: b40000b3     	cbz	x19, 0x78abd40 <_ChromeMain+0x78a6aa4>
 78abd30: aa1303e0     	mov	x0, x19
 78abd34: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 78abd38: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 78abd3c: d65f03c0     	ret
 78abd40: 52800d00     	mov	w0, #0x68               ; =104
 78abd44: 961d8d89     	bl	0xf368 <_ChromeMain+0xa0cc>
 78abd48: aa0003f3     	mov	x19, x0
 78abd4c: 9400006a     	bl	0x78abef4 <_ChromeMain+0x78a6c58>
 78abd50: 967beaa5     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 78abd54: f9037a93     	str	x19, [x20, #0x6f0]
 78abd58: 17fffff6     	b	0x78abd30 <_ChromeMain+0x78a6a94>
 78abd5c: 00000000     	udf	#0x0
