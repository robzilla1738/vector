
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  6d5fe0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
  6d5fe4: a9014ff4     	stp	x20, x19, [sp, #0x10]
  6d5fe8: a9027bfd     	stp	x29, x30, [sp, #0x20]
  6d5fec: 910083fd     	add	x29, sp, #0x20
  6d5ff0: aa0003f4     	mov	x20, x0
  6d5ff4: f9400008     	ldr	x8, [x0]
  6d5ff8: f9401500     	ldr	x0, [x8, #0x28]
  6d5ffc: b4000400     	cbz	x0, 0x6d607c <_ChromeMain+0x6d0de0>
  6d6000: 39403288     	ldrb	w8, [x20, #0xc]
  6d6004: 36000428     	tbz	w8, #0x0, 0x6d6088 <_ChromeMain+0x6d0dec>
  6d6008: b9400a88     	ldr	w8, [x20, #0x8]
  6d600c: 7101911f     	cmp	w8, #0x64
  6d6010: 54000421     	b.ne	0x6d6094 <_ChromeMain+0x6d0df8>
  6d6014: aa0103f3     	mov	x19, x1
  6d6018: 37f80441     	tbnz	w1, #0x1f, 0x6d60a0 <_ChromeMain+0x6d0e04>
  6d601c: f9405008     	ldr	x8, [x0, #0xa0]
  6d6020: b4000288     	cbz	x8, 0x6d6070 <_ChromeMain+0x6d0dd4>
  6d6024: 79417008     	ldrh	w8, [x0, #0xb8]
  6d6028: 6b08027f     	cmp	w19, w8
  6d602c: 54000222     	b.hs	0x6d6070 <_ChromeMain+0x6d0dd4>
  6d6030: aa1303e1     	mov	x1, x19
  6d6034: 94000093     	bl	0x6d6280 <_ChromeMain+0x6d0fe4>
  6d6038: aa0003f5     	mov	x21, x0
  6d603c: f9400288     	ldr	x8, [x20]
  6d6040: f9401500     	ldr	x0, [x8, #0x28]
  6d6044: aa1303e1     	mov	x1, x19
  6d6048: 9400003f     	bl	0x6d6144 <_ChromeMain+0x6d0ea8>
  6d604c: 37f80160     	tbnz	w0, #0x1f, 0x6d6078 <_ChromeMain+0x6d0ddc>
  6d6050: b5000055     	cbnz	x21, 0x6d6058 <_ChromeMain+0x6d0dbc>
  6d6054: 35000120     	cbnz	w0, 0x6d6078 <_ChromeMain+0x6d0ddc>
  6d6058: 2a0003e1     	mov	w1, w0
  6d605c: aa1503e0     	mov	x0, x21
  6d6060: a9427bfd     	ldp	x29, x30, [sp, #0x20]
  6d6064: a9414ff4     	ldp	x20, x19, [sp, #0x10]
  6d6068: a8c357f6     	ldp	x22, x21, [sp], #0x30
  6d606c: d65f03c0     	ret
  6d6070: d4200000     	brk	#0
  6d6074: d4400000     	hlt	#0
  6d6078: d4200020     	brk	#0x1
  6d607c: d4200000     	brk	#0
  6d6080: d4400000     	hlt	#0
  6d6084: d4200020     	brk	#0x1
  6d6088: d4200000     	brk	#0
  6d608c: d4400000     	hlt	#0
  6d6090: d4200020     	brk	#0x1
  6d6094: d4200000     	brk	#0
  6d6098: d4400000     	hlt	#0
  6d609c: d4200020     	brk	#0x1
  6d60a0: d4200000     	brk	#0
  6d60a4: d4400000     	hlt	#0
  6d60a8: d4200020     	brk	#0x1
  6d60ac: 00000000     	udf	#0x0
