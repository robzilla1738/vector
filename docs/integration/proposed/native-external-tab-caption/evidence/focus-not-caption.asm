
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41294a0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41294a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41294a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41294ac: 910083fd     	add	x29, sp, #0x20
 41294b0: aa0003f3     	mov	x19, x0
 41294b4: aa0003f4     	mov	x20, x0
 41294b8: f84d8688     	ldr	x8, [x20], #0xd8
 41294bc: f9403508     	ldr	x8, [x8, #0x68]
 41294c0: d63f0100     	blr	x8
 41294c4: aa0003f5     	mov	x21, x0
 41294c8: 900546e1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 41294cc: 91192021     	add	x1, x1, #0x648
 41294d0: aa1403e0     	mov	x0, x20
 41294d4: d2800002     	mov	x2, #0x0                ; =0
 41294d8: 52800003     	mov	w3, #0x0                ; =0
 41294dc: 97671290     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 41294e0: b5000840     	cbnz	x0, 0x41295e8 <_ChromeMain+0x412434c>
 41294e4: b4000495     	cbz	x21, 0x4129574 <_ChromeMain+0x41242d8>
 41294e8: aa1503e0     	mov	x0, x21
 41294ec: 971c78f9     	bl	0x8478d0 <_ChromeMain+0x842634>
 41294f0: b40003a0     	cbz	x0, 0x4129564 <_ChromeMain+0x41242c8>
 41294f4: f9400268     	ldr	x8, [x19]
 41294f8: f9403508     	ldr	x8, [x8, #0x68]
 41294fc: aa1303e0     	mov	x0, x19
 4129500: d63f0100     	blr	x8
 4129504: aa0003f5     	mov	x21, x0
 4129508: 900546e1     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 412950c: 91192021     	add	x1, x1, #0x648
 4129510: aa1403e0     	mov	x0, x20
 4129514: d2800002     	mov	x2, #0x0                ; =0
 4129518: 52800003     	mov	w3, #0x0                ; =0
 412951c: 97671280     	bl	0x1aedf1c <_ChromeMain+0x1ae8c80>
 4129520: b50006c0     	cbnz	x0, 0x41295f8 <_ChromeMain+0x412435c>
 4129524: b40002d5     	cbz	x21, 0x412957c <_ChromeMain+0x41242e0>
 4129528: aa1503e0     	mov	x0, x21
 412952c: 971c78e9     	bl	0x8478d0 <_ChromeMain+0x842634>
 4129530: f9400c08     	ldr	x8, [x0, #0x18]
 4129534: f100011f     	cmp	x8, #0x0
 4129538: 1a9f07e9     	cset	w9, ne
 412953c: eb13011f     	cmp	x8, x19
 4129540: fa401904     	ccmp	x8, #0x0, #0x4, ne
 4129544: 54000201     	b.ne	0x4129584 <_ChromeMain+0x41242e8>
 4129548: 370000c9     	tbnz	w9, #0x0, 0x4129560 <_ChromeMain+0x41242c4>
 412954c: b4000148     	cbz	x8, 0x4129574 <_ChromeMain+0x41242d8>
 4129550: f9419e69     	ldr	x9, [x19, #0x338]
 4129554: b4000349     	cbz	x9, 0x41295bc <_ChromeMain+0x4124320>
 4129558: eb09011f     	cmp	x8, x9
 412955c: 54000241     	b.ne	0x41295a4 <_ChromeMain+0x4124308>
 4129560: 52800020     	mov	w0, #0x1                ; =1
 4129564: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4129568: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 412956c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4129570: d65f03c0     	ret
 4129574: 52800000     	mov	w0, #0x0                ; =0
 4129578: 17fffffb     	b	0x4129564 <_ChromeMain+0x41242c8>
 412957c: d2800000     	mov	x0, #0x0                ; =0
 4129580: 17ffffec     	b	0x4129530 <_ChromeMain+0x4124294>
 4129584: aa0803ea     	mov	x10, x8
 4129588: f940c54a     	ldr	x10, [x10, #0x188]
 412958c: f100015f     	cmp	x10, #0x0
 4129590: 1a9f07e9     	cset	w9, ne
 4129594: eb13015f     	cmp	x10, x19
 4129598: fa401944     	ccmp	x10, #0x0, #0x4, ne
 412959c: 54ffff61     	b.ne	0x4129588 <_ChromeMain+0x41242ec>
 41295a0: 17ffffea     	b	0x4129548 <_ChromeMain+0x41242ac>
 41295a4: aa0803ea     	mov	x10, x8
 41295a8: f940c54a     	ldr	x10, [x10, #0x188]
 41295ac: eb09015f     	cmp	x10, x9
 41295b0: fa401944     	ccmp	x10, #0x0, #0x4, ne
 41295b4: 54ffffa1     	b.ne	0x41295a8 <_ChromeMain+0x412430c>
 41295b8: b5fffd4a     	cbnz	x10, 0x4129560 <_ChromeMain+0x41242c4>
 41295bc: f941b269     	ldr	x9, [x19, #0x360]
 41295c0: b4fffda9     	cbz	x9, 0x4129574 <_ChromeMain+0x41242d8>
 41295c4: eb09011f     	cmp	x8, x9
 41295c8: 54fffcc0     	b.eq	0x4129560 <_ChromeMain+0x41242c4>
 41295cc: f940c508     	ldr	x8, [x8, #0x188]
 41295d0: f100011f     	cmp	x8, #0x0
 41295d4: 1a9f07e0     	cset	w0, ne
 41295d8: eb09011f     	cmp	x8, x9
 41295dc: fa401904     	ccmp	x8, #0x0, #0x4, ne
 41295e0: 54ffff61     	b.ne	0x41295cc <_ChromeMain+0x4124330>
 41295e4: 17ffffe0     	b	0x4129564 <_ChromeMain+0x41242c8>
 41295e8: b4fff875     	cbz	x21, 0x41294f4 <_ChromeMain+0x4124258>
 41295ec: d4200000     	brk	#0
 41295f0: d4400000     	hlt	#0
 41295f4: d4200020     	brk	#0x1
 41295f8: b4fff9d5     	cbz	x21, 0x4129530 <_ChromeMain+0x4124294>
 41295fc: d4200000     	brk	#0
 4129600: d4400000     	hlt	#0
 4129604: d4200020     	brk	#0x1
		...
 4129620: f941b000     	ldr	x0, [x0, #0x360]
 4129624: d65f03c0     	ret
