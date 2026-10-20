
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4578b0c: d10103ff     	sub	sp, sp, #0x40
 4578b10: a90157f6     	stp	x22, x21, [sp, #0x10]
 4578b14: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4578b18: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4578b1c: 9100c3fd     	add	x29, sp, #0x30
 4578b20: aa0003f4     	mov	x20, x0
 4578b24: d0054c88     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4578b28: 91120108     	add	x8, x8, #0x480
 4578b2c: f8bfc100     	ldapr	x0, [x8]
 4578b30: b4000840     	cbz	x0, 0x4578c38 <_ChromeMain+0x457399c>
 4578b34: 52806301     	mov	w1, #0x318              ; =792
 4578b38: d2800002     	mov	x2, #0x0                ; =0
 4578b3c: 96ecca9d     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4578b40: aa0003f3     	mov	x19, x0
 4578b44: 9737d97f     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4578b48: d0050af6     	adrp	x22, 0xe6d6000 <dyld_stub_binder+0xe6d6000>
 4578b4c: 913742d6     	add	x22, x22, #0xdd0
 4578b50: 910fa2c8     	add	x8, x22, #0x3e8
 4578b54: a9002016     	stp	x22, x8, [x0]
 4578b58: 911042c8     	add	x8, x22, #0x410
 4578b5c: f9000808     	str	x8, [x0, #0x10]
 4578b60: 911122c8     	add	x8, x22, #0x448
 4578b64: 9111e2c9     	add	x9, x22, #0x478
 4578b68: a906a408     	stp	x8, x9, [x0, #0x68]
 4578b6c: 911322c8     	add	x8, x22, #0x4c8
 4578b70: f9005808     	str	x8, [x0, #0xb0]
 4578b74: 9114a2c8     	add	x8, x22, #0x528
 4578b78: f9006c08     	str	x8, [x0, #0xd8]
 4578b7c: 911562c8     	add	x8, x22, #0x558
 4578b80: f9007c08     	str	x8, [x0, #0xf8]
 4578b84: b9031014     	str	w20, [x0, #0x310]
 4578b88: 52800400     	mov	w0, #0x20               ; =32
 4578b8c: 96ea59f7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4578b90: aa0003e1     	mov	x1, x0
 4578b94: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4578b98: b9000808     	str	w8, [x0, #0x8]
 4578b9c: 52800035     	mov	w21, #0x1               ; =1
 4578ba0: 39003015     	strb	w21, [x0, #0xc]
 4578ba4: 9004eea8     	adrp	x8, 0xe34c000 <dyld_stub_binder+0xe34c000>
 4578ba8: 91044108     	add	x8, x8, #0x110
 4578bac: f9000008     	str	x8, [x0]
 4578bb0: 52800088     	mov	w8, #0x4                ; =4
 4578bb4: 4e080d00     	dup.2d	v0, x8
 4578bb8: 3d800400     	str	q0, [x0, #0x10]
 4578bbc: f9408ac8     	ldr	x8, [x22, #0x110]
 4578bc0: aa1303e0     	mov	x0, x19
 4578bc4: d63f0100     	blr	x8
 4578bc8: 52802800     	mov	w0, #0x140              ; =320
 4578bcc: 96ea59e7     	bl	0xf368 <_ChromeMain+0xa0cc>
 4578bd0: aa0003f4     	mov	x20, x0
 4578bd4: 97925e7f     	bl	0x2a105d0 <_ChromeMain+0x2a0b334>
 4578bd8: aa1303e0     	mov	x0, x19
 4578bdc: aa1403e1     	mov	x1, x20
 4578be0: 97584316     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 4578be4: b940f288     	ldr	w8, [x20, #0xf0]
 4578be8: 7100051f     	cmp	w8, #0x1
 4578bec: 540001c1     	b.ne	0x4578c24 <_ChromeMain+0x4573988>
 4578bf0: 52800068     	mov	w8, #0x3                ; =3
 4578bf4: b9000fe8     	str	w8, [sp, #0xc]
 4578bf8: b0052461     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 4578bfc: 9115a021     	add	x1, x1, #0x568
 4578c00: 91046280     	add	x0, x20, #0x118
 4578c04: 910033e2     	add	x2, sp, #0xc
 4578c08: 9753b167     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 4578c0c: aa1303e0     	mov	x0, x19
 4578c10: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4578c14: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4578c18: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4578c1c: 910103ff     	add	sp, sp, #0x40
 4578c20: d65f03c0     	ret
 4578c24: b900f295     	str	w21, [x20, #0xf0]
 4578c28: aa1403e0     	mov	x0, x20
 4578c2c: 52800021     	mov	w1, #0x1                ; =1
 4578c30: 9753b1a0     	bl	0x1a652b0 <_ChromeMain+0x1a60014>
 4578c34: 17ffffef     	b	0x4578bf0 <_ChromeMain+0x4573954>
