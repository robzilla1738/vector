
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7adfd94: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7adfd98: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7adfd9c: 910043fd     	add	x29, sp, #0x10
 7adfda0: aa0003f3     	mov	x19, x0
 7adfda4: 9719ed17     	bl	0x415b200 <_ChromeMain+0x4155f64>
 7adfda8: 90039329     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 7adfdac: 9118e129     	add	x9, x9, #0x638
 7adfdb0: f8408528     	ldr	x8, [x9], #0x8
 7adfdb4: eb09011f     	cmp	x8, x9
 7adfdb8: 540002c0     	b.eq	0x7adfe10 <_ChromeMain+0x7adab74>
 7adfdbc: 90039329     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 7adfdc0: 91190129     	add	x9, x9, #0x640
 7adfdc4: 14000006     	b	0x7adfddc <_ChromeMain+0x7adab40>
 7adfdc8: aa0a03e8     	mov	x8, x10
 7adfdcc: f940014a     	ldr	x10, [x10]
 7adfdd0: b5ffffca     	cbnz	x10, 0x7adfdc8 <_ChromeMain+0x7adab2c>
 7adfdd4: eb09011f     	cmp	x8, x9
 7adfdd8: 540001e0     	b.eq	0x7adfe14 <_ChromeMain+0x7adab78>
 7adfddc: f940110a     	ldr	x10, [x8, #0x20]
 7adfde0: f9400d4a     	ldr	x10, [x10, #0x18]
 7adfde4: eb13015f     	cmp	x10, x19
 7adfde8: 1a9f17e0     	cset	w0, eq
 7adfdec: 54000140     	b.eq	0x7adfe14 <_ChromeMain+0x7adab78>
 7adfdf0: f940050a     	ldr	x10, [x8, #0x8]
 7adfdf4: b5fffeaa     	cbnz	x10, 0x7adfdc8 <_ChromeMain+0x7adab2c>
 7adfdf8: aa0803ea     	mov	x10, x8
 7adfdfc: f9400908     	ldr	x8, [x8, #0x10]
 7adfe00: f940010b     	ldr	x11, [x8]
 7adfe04: eb0b015f     	cmp	x10, x11
 7adfe08: 54ffff81     	b.ne	0x7adfdf8 <_ChromeMain+0x7adab5c>
 7adfe0c: 17fffff2     	b	0x7adfdd4 <_ChromeMain+0x7adab38>
 7adfe10: 52800000     	mov	w0, #0x0                ; =0
 7adfe14: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7adfe18: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7adfe1c: d65f03c0     	ret
		...
 7adfe40: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 7adfe44: 910003fd     	mov	x29, sp
 7adfe48: 9719ecee     	bl	0x415b200 <_ChromeMain+0x4155f64>
 7adfe4c: 90039329     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 7adfe50: 9118e129     	add	x9, x9, #0x638
 7adfe54: f8408528     	ldr	x8, [x9], #0x8
 7adfe58: eb09011f     	cmp	x8, x9
 7adfe5c: 54000280     	b.eq	0x7adfeac <_ChromeMain+0x7adac10>
 7adfe60: 90039329     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 7adfe64: 91190129     	add	x9, x9, #0x640
 7adfe68: 14000006     	b	0x7adfe80 <_ChromeMain+0x7adabe4>
 7adfe6c: aa0a03e8     	mov	x8, x10
 7adfe70: f940014a     	ldr	x10, [x10]
 7adfe74: b5ffffca     	cbnz	x10, 0x7adfe6c <_ChromeMain+0x7adabd0>
 7adfe78: eb09011f     	cmp	x8, x9
 7adfe7c: 540001a0     	b.eq	0x7adfeb0 <_ChromeMain+0x7adac14>
 7adfe80: f940110a     	ldr	x10, [x8, #0x20]
 7adfe84: 3940a140     	ldrb	w0, [x10, #0x28]
 7adfe88: 37000140     	tbnz	w0, #0x0, 0x7adfeb0 <_ChromeMain+0x7adac14>
 7adfe8c: f940050a     	ldr	x10, [x8, #0x8]
 7adfe90: b5fffeea     	cbnz	x10, 0x7adfe6c <_ChromeMain+0x7adabd0>
 7adfe94: aa0803ea     	mov	x10, x8
 7adfe98: f9400908     	ldr	x8, [x8, #0x10]
 7adfe9c: f940010b     	ldr	x11, [x8]
 7adfea0: eb0b015f     	cmp	x10, x11
 7adfea4: 54ffff81     	b.ne	0x7adfe94 <_ChromeMain+0x7adabf8>
 7adfea8: 17fffff4     	b	0x7adfe78 <_ChromeMain+0x7adabdc>
 7adfeac: 52800000     	mov	w0, #0x0                ; =0
 7adfeb0: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 7adfeb4: d65f03c0     	ret
 7adfeb8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7adfebc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7adfec0: 910043fd     	add	x29, sp, #0x10
 7adfec4: aa0003f4     	mov	x20, x0
 7adfec8: aa0803f3     	mov	x19, x8
 7adfecc: 9719ece2     	bl	0x415b254 <_ChromeMain+0x4155fb8>
 7adfed0: f9400281     	ldr	x1, [x20]
 7adfed4: b50000e1     	cbnz	x1, 0x7adfef0 <_ChromeMain+0x7adac54>
 7adfed8: 90039320     	adrp	x0, 0xed43000 <dyld_stub_binder+0xed43000>
 7adfedc: 9116e000     	add	x0, x0, #0x5b8
 7adfee0: aa1303e8     	mov	x8, x19
 7adfee4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7adfee8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7adfeec: 17b97e5c     	b	0x693f85c <_ChromeMain+0x693a5c0>
 7adfef0: 52800028     	mov	w8, #0x1                ; =1
 7adfef4: b8280028     	ldadd	w8, w8, [x1]
 7adfef8: 7100011f     	cmp	w8, #0x0
 7adfefc: 540000ed     	b.le	0x7adff18 <_ChromeMain+0x7adac7c>
 7adff00: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 7adff04: 6b09011f     	cmp	w8, w9
 7adff08: 54fffe81     	b.ne	0x7adfed8 <_ChromeMain+0x7adac3c>
 7adff0c: d4200000     	brk	#0
 7adff10: d4400000     	hlt	#0
 7adff14: d4200020     	brk	#0x1
 7adff18: d4200000     	brk	#0
 7adff1c: d4400000     	hlt	#0
 7adff20: d4200020     	brk	#0x1
