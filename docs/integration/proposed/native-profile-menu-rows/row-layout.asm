
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4579ad8: 52800036     	mov	w22, #0x1               ; =1
 4579adc: 39072e76     	strb	w22, [x19, #0x1cb]
 4579ae0: b940e7e8     	ldr	w8, [sp, #0xe4]
 4579ae4: 0aa87d08     	bic	w8, w8, w8, asr #31
 4579ae8: d3607d01     	lsl	x1, x8, #32
 4579aec: aa1303e0     	mov	x0, x19
 4579af0: 52800022     	mov	w2, #0x1                ; =1
 4579af4: 97895fdb     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4579af8: 52800400     	mov	w0, #0x20               ; =32
 4579afc: 96ea561b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4579b00: aa0003e1     	mov	x1, x0
 4579b04: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4579b08: b9000808     	str	w8, [x0, #0x8]
 4579b0c: 39003016     	strb	w22, [x0, #0xc]
 4579b10: f004ee88     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4579b14: 91044108     	add	x8, x8, #0x110
 4579b18: f9000008     	str	x8, [x0]
 4579b1c: d2c00108     	mov	x8, #0x800000000        ; =34359738368
 4579b20: 4e080d00     	dup.2d	v0, x8
 4579b24: 3d800400     	str	q0, [x0, #0x10]
 4579b28: f9400268     	ldr	x8, [x19]
 4579b2c: f9408908     	ldr	x8, [x8, #0x110]
 4579b30: aa1303e0     	mov	x0, x19
 4579b34: d63f0100     	blr	x8
 4579b38: d2c00088     	mov	x8, #0x400000000        ; =17179869184
 4579b3c: 4e080d00     	dup.2d	v0, x8
 4579b40: 3c9303a0     	stur	q0, [x29, #-0xd0]
 4579b44: 90052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4579b48: 91122021     	add	x1, x1, #0x488
 4579b4c: d10343a2     	sub	x2, x29, #0xd0
 4579b50: aa1403e0     	mov	x0, x20
 4579b54: 9755d0c3     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 4579b58: 52802800     	mov	w0, #0x140              ; =320
 4579b5c: 96ea5603     	bl	0xf368 <_ChromeMain+0xa0cc>
 4579b60: aa0003f5     	mov	x21, x0
 4579b64: 97925a9b     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4579b68: aa1303e0     	mov	x0, x19
 4579b6c: aa1503e1     	mov	x1, x21
 4579b70: 97583f32     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4579b74: b940f2a8     	ldr	w8, [x21, #0xf0]
 4579b78: 35000fc8     	cbnz	w8, 0x4579d70 <_ChromeMain+0x4574ad4>
 4579b7c: b81303b6     	stur	w22, [x29, #-0xd0]
 4579b80: 90052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4579b84: 9115a021     	add	x1, x1, #0x568
 4579b88: 910462a0     	add	x0, x21, #0x118
 4579b8c: d10343a2     	sub	x2, x29, #0xd0
 4579b90: 9753ad85     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
