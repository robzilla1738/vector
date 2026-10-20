
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 15377dc: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 15377e0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 15377e4: 910043fd     	add	x29, sp, #0x10
 15377e8: aa0103f4     	mov	x20, x1
 15377ec: aa0003f3     	mov	x19, x0
 15377f0: f9400008     	ldr	x8, [x0]
 15377f4: f9410d08     	ldr	x8, [x8, #0x218]
 15377f8: d63f0100     	blr	x8
 15377fc: 6b14001f     	cmp	w0, w20
 1537800: 54000081     	b.ne	0x1537810 <_ChromeMain+0x1532574>
 1537804: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 1537808: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 153780c: d65f03c0     	ret
 1537810: b902aa74     	str	w20, [x19, #0x2a8]
 1537814: f9416660     	ldr	x0, [x19, #0x2c8]
 1537818: b5000100     	cbnz	x0, 0x1537838 <_ChromeMain+0x153259c>
 153781c: 97e6ba39     	bl	0xee6100 <_ChromeMain+0xee0e64>
 1537820: 350006c0     	cbnz	w0, 0x15378f8 <_ChromeMain+0x153265c>
 1537824: aa1303e0     	mov	x0, x19
 1537828: 97f69b8b     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 153782c: f9416668     	ldr	x8, [x19, #0x2c8]
 1537830: f9016660     	str	x0, [x19, #0x2c8]
 1537834: b5000988     	cbnz	x8, 0x1537964 <_ChromeMain+0x15326c8>
 1537838: f9400008     	ldr	x8, [x0]
 153783c: f9409108     	ldr	x8, [x8, #0x120]
 1537840: d63f0100     	blr	x8
 1537844: f9416660     	ldr	x0, [x19, #0x2c8]
 1537848: b4000620     	cbz	x0, 0x153790c <_ChromeMain+0x1532670>
 153784c: b942aa68     	ldr	w8, [x19, #0x2a8]
 1537850: 7100011f     	cmp	w8, #0x0
 1537854: 1a9f07e1     	cset	w1, ne
 1537858: 9400004c     	bl	0x1537988 <_ChromeMain+0x15326ec>
 153785c: f9416660     	ldr	x0, [x19, #0x2c8]
 1537860: b40006c0     	cbz	x0, 0x1537938 <_ChromeMain+0x153269c>
 1537864: b9402008     	ldr	w8, [x0, #0x20]
 1537868: 373002a8     	tbnz	w8, #0x6, 0x15378bc <_ChromeMain+0x1532620>
 153786c: f9400268     	ldr	x8, [x19]
 1537870: f9410908     	ldr	x8, [x8, #0x210]
 1537874: aa1303e0     	mov	x0, x19
 1537878: d63f0100     	blr	x8
 153787c: 35000340     	cbnz	w0, 0x15378e4 <_ChromeMain+0x1532648>
 1537880: f9408668     	ldr	x8, [x19, #0x108]
 1537884: b4fffc08     	cbz	x8, 0x1537804 <_ChromeMain+0x1532568>
 1537888: 910aa26a     	add	x10, x19, #0x2a8
 153788c: 91042269     	add	x9, x19, #0x108
 1537890: f940110b     	ldr	x11, [x8, #0x20]
 1537894: eb0b015f     	cmp	x10, x11
 1537898: 540000c3     	b.lo	0x15378b0 <_ChromeMain+0x1532614>
 153789c: eb0a017f     	cmp	x11, x10
 15378a0: 54000162     	b.hs	0x15378cc <_ChromeMain+0x1532630>
 15378a4: f9400508     	ldr	x8, [x8, #0x8]
 15378a8: b5ffff48     	cbnz	x8, 0x1537890 <_ChromeMain+0x15325f4>
