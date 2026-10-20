
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c489ad4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 c489ad8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 c489adc: 910043fd     	add	x29, sp, #0x10
 c489ae0: aa0003f4     	mov	x20, x0
 c489ae4: aa0803f3     	mov	x19, x8
 c489ae8: a9007d1f     	stp	xzr, xzr, [x8]
 c489aec: f900091f     	str	xzr, [x8, #0x10]
 c489af0: aa0803e0     	mov	x0, x8
 c489af4: 941bf123     	bl	0xcb85f80 <_ChromeMain+0xcb80ce4>
 c489af8: 39400283     	ldrb	w3, [x20]
 c489afc: d000a7c1     	adrp	x1, 0xd983000 <dyld_stub_binder+0xd983000>
 c489b00: 911a6021     	add	x1, x1, #0x698
 c489b04: aa1303e0     	mov	x0, x19
 c489b08: 528000a2     	mov	w2, #0x5                ; =5
 c489b0c: 941bf9cf     	bl	0xcb88248 <_ChromeMain+0xcb82fac>
 c489b10: b9400688     	ldr	w8, [x20, #0x4]
 c489b14: 7100051f     	cmp	w8, #0x1
 c489b18: 540000ec     	b.gt	0xc489b34 <_ChromeMain+0xc484898>
 c489b1c: 34000288     	cbz	w8, 0xc489b6c <_ChromeMain+0xc4848d0>
 c489b20: 7100051f     	cmp	w8, #0x1
 c489b24: 54000461     	b.ne	0xc489bb0 <_ChromeMain+0xc484914>
 c489b28: f000a263     	adrp	x3, 0xd8d8000 <dyld_stub_binder+0xd8d8000>
 c489b2c: 91377063     	add	x3, x3, #0xddc
 c489b30: 1400000a     	b	0xc489b58 <_ChromeMain+0xc4848bc>
 c489b34: 71000d1f     	cmp	w8, #0x3
 c489b38: 540000c0     	b.eq	0xc489b50 <_ChromeMain+0xc4848b4>
 c489b3c: 7100091f     	cmp	w8, #0x2
 c489b40: 54000381     	b.ne	0xc489bb0 <_ChromeMain+0xc484914>
 c489b44: d000c8c3     	adrp	x3, 0xdda3000 <dyld_stub_binder+0xdda3000>
 c489b48: 910ac463     	add	x3, x3, #0x2b1
 c489b4c: 14000003     	b	0xc489b58 <_ChromeMain+0xc4848bc>
 c489b50: d000a023     	adrp	x3, 0xd88f000 <dyld_stub_binder+0xd88f000>
 c489b54: 9112a863     	add	x3, x3, #0x4aa
 c489b58: 9000a0e1     	adrp	x1, 0xd8a5000 <dyld_stub_binder+0xd8a5000>
 c489b5c: 911a6c21     	add	x1, x1, #0x69b
 c489b60: aa1303e0     	mov	x0, x19
 c489b64: 528000c2     	mov	w2, #0x6                ; =6
 c489b68: 941bf775     	bl	0xcb8793c <_ChromeMain+0xcb826a0>
 c489b6c: 39408288     	ldrb	w8, [x20, #0x20]
 c489b70: 350000c8     	cbnz	w8, 0xc489b88 <_ChromeMain+0xc4848ec>
 c489b74: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 c489b78: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 c489b7c: d65f03c0     	ret
 c489b80: a9409283     	ldp	x3, x4, [x20, #0x8]
 c489b84: 14000004     	b	0xc489b94 <_ChromeMain+0xc4848f8>
 c489b88: 39807e84     	ldrsb	x4, [x20, #0x1f]
 c489b8c: b7ffffa4     	tbnz	x4, #0x3f, 0xc489b80 <_ChromeMain+0xc4848e4>
 c489b90: 91002283     	add	x3, x20, #0x8
 c489b94: f000ac61     	adrp	x1, 0xda18000 <dyld_stub_binder+0xda18000>
 c489b98: 91374821     	add	x1, x1, #0xdd2
 c489b9c: aa1303e0     	mov	x0, x19
 c489ba0: 52800162     	mov	w2, #0xb                ; =11
 c489ba4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 c489ba8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 c489bac: 141bf767     	b	0xcb87948 <_ChromeMain+0xcb826ac>
 c489bb0: d4200000     	brk	#0
 c489bb4: d4400000     	hlt	#0
 c489bb8: d4200020     	brk	#0x1
