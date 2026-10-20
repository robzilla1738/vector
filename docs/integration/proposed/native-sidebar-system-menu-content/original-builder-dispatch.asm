
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7836ac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 c7836b0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 c7836b4: 910043fd     	add	x29, sp, #0x10
 c7836b8: aa0003f3     	mov	x19, x0
 c7836bc: 52800800     	mov	w0, #0x40               ; =64
 c7836c0: 940ffc5f     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 c7836c4: aa0003f4     	mov	x20, x0
 c7836c8: aa1303e1     	mov	x1, x19
 c7836cc: 9410a606     	bl	0xcbacee4 <_ChromeMain+0xcba7c48>
 c7836d0: f9401260     	ldr	x0, [x19, #0x20]
 c7836d4: f9001274     	str	x20, [x19, #0x20]
 c7836d8: b4000080     	cbz	x0, 0xc7836e8 <_ChromeMain+0xc77e44c>
 c7836dc: f9400008     	ldr	x8, [x0]
 c7836e0: f9400508     	ldr	x8, [x8, #0x8]
 c7836e4: d63f0100     	blr	x8
 c7836e8: aa1303e0     	mov	x0, x19
 c7836ec: aa1403e1     	mov	x1, x20
 c7836f0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 c7836f4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 c7836f8: 14000001     	b	0xc7836fc <_ChromeMain+0xc77e460>
 c7836fc: f9400c08     	ldr	x8, [x0, #0x18]
 c783700: b9403908     	ldr	w8, [x8, #0x38]
 c783704: 35000048     	cbnz	w8, 0xc78370c <_ChromeMain+0xc77e470>
 c783708: 1410b14c     	b	0xcbafc38 <_ChromeMain+0xcbaa99c>
 c78370c: 14000001     	b	0xc783710 <_ChromeMain+0xc77e474>
