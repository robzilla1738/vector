
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1561684: d10283ff     	sub	sp, sp, #0xa0
 1561688: a9065ff8     	stp	x24, x23, [sp, #0x60]
 156168c: a90757f6     	stp	x22, x21, [sp, #0x70]
 1561690: a9084ff4     	stp	x20, x19, [sp, #0x80]
 1561694: a9097bfd     	stp	x29, x30, [sp, #0x90]
 1561698: 910243fd     	add	x29, sp, #0x90
 156169c: aa0003f3     	mov	x19, x0
 15616a0: f0065628     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 15616a4: f940f908     	ldr	x8, [x8, #0x1f0]
 15616a8: f9400108     	ldr	x8, [x8]
 15616ac: f81c83a8     	stur	x8, [x29, #-0x38]
 15616b0: a9007fff     	stp	xzr, xzr, [sp]
 15616b4: f9000bff     	str	xzr, [sp, #0x10]
 15616b8: 39c05c28     	ldrsb	w8, [x1, #0x17]
 15616bc: 37f80e28     	tbnz	w8, #0x1f, 0x1561880 <_ChromeMain+0x155c5e4>
 15616c0: 3dc00020     	ldr	q0, [x1]
 15616c4: 3d8003e0     	str	q0, [sp]
 15616c8: f9400828     	ldr	x8, [x1, #0x10]
 15616cc: f9000be8     	str	x8, [sp, #0x10]
 15616d0: 52801288     	mov	w8, #0x94               ; =148
 15616d4: f9000fe8     	str	x8, [sp, #0x18]
 15616d8: 9006cd57     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 15616dc: 3957f2e0     	ldrb	w0, [x23, #0x5fc]
 15616e0: 35001320     	cbnz	w0, 0x1561944 <_ChromeMain+0x155c6a8>
 15616e4: 9006b298     	adrp	x24, 0xebb1000 <dyld_stub_binder+0xebb1000>
 15616e8: f9468f08     	ldr	x8, [x24, #0xd18]
 15616ec: d63f0100     	blr	x8
 15616f0: aa0003f4     	mov	x20, x0
 15616f4: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 15616f8: f90027ff     	str	xzr, [sp, #0x48]
 15616fc: d0063382     	adrp	x2, 0xdbd3000 <dyld_stub_binder+0xdbd3000>
 1561700: 91019442     	add	x2, x2, #0x65
 1561704: 9100e3e0     	add	x0, sp, #0x38
 1561708: aa1303e1     	mov	x1, x19
 156170c: 52800483     	mov	w3, #0x24               ; =36
 1561710: 9400009a     	bl	0x1561978 <_ChromeMain+0x155c6dc>
 1561714: 910003e1     	mov	x1, sp
 1561718: aa1303e0     	mov	x0, x19
 156171c: 9407b8d9     	bl	0x174fa80 <_ChromeMain+0x174a7e4>
 1561720: aa0003f5     	mov	x21, x0
