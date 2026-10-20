
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7b64ba0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 7b64ba4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 7b64ba8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 7b64bac: 910083fd     	add	x29, sp, #0x20
 7b64bb0: aa0203f3     	mov	x19, x2
 7b64bb4: aa0103f4     	mov	x20, x1
 7b64bb8: aa0003f5     	mov	x21, x0
 7b64bbc: aa0803f6     	mov	x22, x8
 7b64bc0: 6f00e400     	movi.2d	v0, #0000000000000000
 7b64bc4: ad068100     	stp	q0, q0, [x8, #0xd0]
 7b64bc8: ad058100     	stp	q0, q0, [x8, #0xb0]
 7b64bcc: ad048100     	stp	q0, q0, [x8, #0x90]
 7b64bd0: ad038100     	stp	q0, q0, [x8, #0x70]
 7b64bd4: ad028100     	stp	q0, q0, [x8, #0x50]
 7b64bd8: ad018100     	stp	q0, q0, [x8, #0x30]
 7b64bdc: ad008100     	stp	q0, q0, [x8, #0x10]
 7b64be0: 3d800100     	str	q0, [x8]
 7b64be4: aa0803e0     	mov	x0, x8
 7b64be8: 52800081     	mov	w1, #0x4                ; =4
 7b64bec: aa0303e2     	mov	x2, x3
 7b64bf0: aa0403e3     	mov	x3, x4
 7b64bf4: 97fffcae     	bl	0x7b63eac <_ChromeMain+0x7b5ec10>
 7b64bf8: 9100a2c0     	add	x0, x22, #0x28
 7b64bfc: aa1503e1     	mov	x1, x21
 7b64c00: 96250f99     	bl	0x4a8a64 <_ChromeMain+0x4a37c8>
 7b64c04: 390082d4     	strb	w20, [x22, #0x20]
 7b64c08: 3dc00260     	ldr	q0, [x19]
 7b64c0c: 3d8006c0     	str	q0, [x22, #0x10]
 7b64c10: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 7b64c14: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 7b64c18: a8c357f6     	ldp	x22, x21, [sp], #0x30
 7b64c1c: d65f03c0     	ret
