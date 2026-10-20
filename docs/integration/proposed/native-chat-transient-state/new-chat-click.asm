
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7859a8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 c7859ac: a9014ff4     	stp	x20, x19, [sp, #0x10]
 c7859b0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 c7859b4: 910083fd     	add	x29, sp, #0x20
 c7859b8: aa0003f3     	mov	x19, x0
 c7859bc: 91400415     	add	x21, x0, #0x1, lsl #12  ; =0x1000
 c7859c0: 394092b6     	ldrb	w22, [x21, #0x24]
 c7859c4: f9422c08     	ldr	x8, [x0, #0x458]
 c7859c8: f9429d08     	ldr	x8, [x8, #0x538]
 c7859cc: 9100a109     	add	x9, x8, #0x28
 c7859d0: f100011f     	cmp	x8, #0x0
 c7859d4: 9a8903f4     	csel	x20, xzr, x9, eq
 c7859d8: 90012168     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 c7859dc: f9468d08     	ldr	x8, [x8, #0xd18]
 c7859e0: d63f0100     	blr	x8
 c7859e4: aa0003e2     	mov	x2, x0
 c7859e8: aa1403e0     	mov	x0, x20
 c7859ec: 5290a261     	mov	w1, #0x8513             ; =34067
 c7859f0: 97fd732e     	bl	0xc6e26a8 <_ChromeMain+0xc6dd40c>
 c7859f4: f9423668     	ldr	x8, [x19, #0x468]
 c7859f8: b4000248     	cbz	x8, 0xc785a40 <_ChromeMain+0xc7807a4>
 c7859fc: 37000196     	tbnz	w22, #0x0, 0xc785a2c <_ChromeMain+0xc780790>
 c785a00: f9404914     	ldr	x20, [x8, #0x90]
 c785a04: aa1303e0     	mov	x0, x19
 c785a08: aa1403e1     	mov	x1, x20
 c785a0c: 9410a8be     	bl	0xcbafd04 <_ChromeMain+0xcbaaa68>
 c785a10: 340000e0     	cbz	w0, 0xc785a2c <_ChromeMain+0xc780790>
 c785a14: b9401288     	ldr	w8, [x20, #0x10]
 c785a18: 52820309     	mov	w9, #0x1018             ; =4120
 c785a1c: 8b090269     	add	x9, x19, x9
 c785a20: 394072aa     	ldrb	w10, [x21, #0x1c]
 c785a24: 3400016a     	cbz	w10, 0xc785a50 <_ChromeMain+0xc7807b4>
 c785a28: b9000128     	str	w8, [x9]
 c785a2c: aa1303e0     	mov	x0, x19
 c785a30: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c785a34: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c785a38: a8c357f6     	ldp	x22, x21, [sp], #0x30
 c785a3c: 1410a8b5     	b	0xcbafd10 <_ChromeMain+0xcbaaa74>
 c785a40: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 c785a44: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 c785a48: a8c357f6     	ldp	x22, x21, [sp], #0x30
 c785a4c: d65f03c0     	ret
 c785a50: b40000a9     	cbz	x9, 0xc785a64 <_ChromeMain+0xc7807c8>
 c785a54: b9000128     	str	w8, [x9]
 c785a58: 52800028     	mov	w8, #0x1                ; =1
 c785a5c: 390072a8     	strb	w8, [x21, #0x1c]
 c785a60: 17fffff3     	b	0xc785a2c <_ChromeMain+0xc780790>
 c785a64: d4200020     	brk	#0x1
