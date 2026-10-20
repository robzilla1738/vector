
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4604e08: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4604e0c: a90157f6     	stp	x22, x21, [sp, #0x10]
 4604e10: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4604e14: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4604e18: 9100c3fd     	add	x29, sp, #0x30
 4604e1c: aa0303f4     	mov	x20, x3
 4604e20: aa0203f5     	mov	x21, x2
 4604e24: aa0103f6     	mov	x22, x1
 4604e28: aa0003f3     	mov	x19, x0
 4604e2c: 9735a8c5     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4604e30: 910c8008     	add	x8, x0, #0x320
 4604e34: 6f00e400     	movi.2d	v0, #0000000000000000
 4604e38: 3d80c800     	str	q0, [x0, #0x320]
 4604e3c: f9018c08     	str	x8, [x0, #0x318]
 4604e40: f00508c8     	adrp	x8, 0xe71f000 <dyld_stub_binder+0xe71f000>
 4604e44: 9112c108     	add	x8, x8, #0x4b0
 4604e48: 9110e109     	add	x9, x8, #0x438
 4604e4c: a9002408     	stp	x8, x9, [x0]
 4604e50: 91118109     	add	x9, x8, #0x460
 4604e54: f9000809     	str	x9, [x0, #0x10]
 4604e58: 91126109     	add	x9, x8, #0x498
 4604e5c: 9113210a     	add	x10, x8, #0x4c8
 4604e60: a906a809     	stp	x9, x10, [x0, #0x68]
 4604e64: 91146109     	add	x9, x8, #0x518
 4604e68: f9005809     	str	x9, [x0, #0xb0]
 4604e6c: 9115e109     	add	x9, x8, #0x578
 4604e70: f9006c09     	str	x9, [x0, #0xd8]
 4604e74: 9116a109     	add	x9, x8, #0x5a8
 4604e78: f9007c09     	str	x9, [x0, #0xf8]
 4604e7c: 91174109     	add	x9, x8, #0x5d0
 4604e80: f9018809     	str	x9, [x0, #0x310]
 4604e84: 9119c109     	add	x9, x8, #0x670
 4604e88: f9019809     	str	x9, [x0, #0x330]
 4604e8c: 911ac108     	add	x8, x8, #0x6b0
 4604e90: f9019c08     	str	x8, [x0, #0x338]
 4604e94: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 4604e98: d0052d77     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4604e9c: f94046e9     	ldr	x9, [x23, #0x88]
 4604ea0: eb09011f     	cmp	x8, x9
 4604ea4: 54000061     	b.ne	0x4604eb0 <_ChromeMain+0x45ffc14>
 4604ea8: aa1603e0     	mov	x0, x22
 4604eac: 96e83d14     	bl	0x142fc <_ChromeMain+0xf060>
 4604eb0: f901a276     	str	x22, [x19, #0x340]
 4604eb4: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4604eb8: f94046e9     	ldr	x9, [x23, #0x88]
 4604ebc: eb09011f     	cmp	x8, x9
 4604ec0: 54000061     	b.ne	0x4604ecc <_ChromeMain+0x45ffc30>
 4604ec4: aa1503e0     	mov	x0, x21
 4604ec8: 96e83d0d     	bl	0x142fc <_ChromeMain+0xf060>
 4604ecc: f901a675     	str	x21, [x19, #0x348]
 4604ed0: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4604ed4: f94046e9     	ldr	x9, [x23, #0x88]
 4604ed8: eb09011f     	cmp	x8, x9
 4604edc: 54000061     	b.ne	0x4604ee8 <_ChromeMain+0x45ffc4c>
 4604ee0: aa1403e0     	mov	x0, x20
 4604ee4: 96e83d06     	bl	0x142fc <_ChromeMain+0xf060>
 4604ee8: f901aa74     	str	x20, [x19, #0x350]
 4604eec: 910d6268     	add	x8, x19, #0x358
 4604ef0: 910e0269     	add	x9, x19, #0x380
 4604ef4: 6f00e400     	movi.2d	v0, #0000000000000000
 4604ef8: ad000100     	stp	q0, q0, [x8]
 4604efc: 3d80e260     	str	q0, [x19, #0x380]
 4604f00: f901be69     	str	x9, [x19, #0x378]
 4604f04: 910e6268     	add	x8, x19, #0x398
 4604f08: 3d800100     	str	q0, [x8]
 4604f0c: f901ca68     	str	x8, [x19, #0x390]
 4604f10: 910ec268     	add	x8, x19, #0x3b0
 4604f14: 3d80ee60     	str	q0, [x19, #0x3b0]
 4604f18: f901d668     	str	x8, [x19, #0x3a8]
 4604f1c: 910f0260     	add	x0, x19, #0x3c0
 4604f20: 97479470     	bl	0x17ea0e0 <_ChromeMain+0x17e4e44>
 4604f24: f004e588     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 4604f28: 913c2108     	add	x8, x8, #0xf08
 4604f2c: f9021e68     	str	x8, [x19, #0x438]
 4604f30: 52800100     	mov	w0, #0x8                ; =8
 4604f34: 96e8290d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4604f38: b900001f     	str	wzr, [x0]
 4604f3c: 3900101f     	strb	wzr, [x0, #0x4]
 4604f40: b40000c0     	cbz	x0, 0x4604f58 <_ChromeMain+0x45ffcbc>
 4604f44: 52800028     	mov	w8, #0x1                ; =1
 4604f48: b8280008     	ldadd	w8, w8, [x0]
 4604f4c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4604f50: 6b09011f     	cmp	w8, w9
 4604f54: 54001380     	b.eq	0x46051c4 <_ChromeMain+0x45fff28>
 4604f58: 9110e268     	add	x8, x19, #0x438
 4604f5c: f9022260     	str	x0, [x19, #0x440]
 4604f60: f004e709     	adrp	x9, 0xe2e7000 <dyld_stub_binder+0xe2e7000>
 4604f64: 91124129     	add	x9, x9, #0x490
 4604f68: f9022668     	str	x8, [x19, #0x448]
 4604f6c: f9021e69     	str	x9, [x19, #0x438]
 4604f70: f9022a7f     	str	xzr, [x19, #0x450]
 4604f74: 91118275     	add	x21, x19, #0x460
 4604f78: 6f00e401     	movi.2d	v1, #0000000000000000
 4604f7c: 3d811a61     	str	q1, [x19, #0x460]
 4604f80: 3d811e61     	str	q1, [x19, #0x470]
 4604f84: 3d812261     	str	q1, [x19, #0x480]
 4604f88: 3d812661     	str	q1, [x19, #0x490]
 4604f8c: 3c83b2a1     	stur	q1, [x21, #0x3b]
 4604f90: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 4604f94: 3d812e60     	str	q0, [x19, #0x4b0]
 4604f98: 3d813260     	str	q0, [x19, #0x4c0]
 4604f9c: 3d813660     	str	q0, [x19, #0x4d0]
 4604fa0: 3d813a60     	str	q0, [x19, #0x4e0]
 4604fa4: 7909e27f     	strh	wzr, [x19, #0x4f0]
 4604fa8: 9113e268     	add	x8, x19, #0x4f8
 4604fac: 3914427f     	strb	wzr, [x19, #0x510]
 4604fb0: 3914627f     	strb	wzr, [x19, #0x518]
 4604fb4: 91148269     	add	x9, x19, #0x520
 4604fb8: 3915327f     	strb	wzr, [x19, #0x54c]
 4604fbc: 3915427f     	strb	wzr, [x19, #0x550]
 4604fc0: 3915527f     	strb	wzr, [x19, #0x554]
 4604fc4: 3915627f     	strb	wzr, [x19, #0x558]
 4604fc8: 3915827f     	strb	wzr, [x19, #0x560]
 4604fcc: 3915a27f     	strb	wzr, [x19, #0x568]
 4604fd0: 3917827f     	strb	wzr, [x19, #0x5e0]
 4604fd4: 9117a26a     	add	x10, x19, #0x5e8
 4604fd8: 3918127f     	strb	wzr, [x19, #0x604]
 4604fdc: 3c819121     	stur	q1, [x9, #0x19]
 4604fe0: 3d814e61     	str	q1, [x19, #0x530]
 4604fe4: 3d814a61     	str	q1, [x19, #0x520]
 4604fe8: f902fe7f     	str	xzr, [x19, #0x5f8]
 4604fec: 3d800141     	str	q1, [x10]
 4604ff0: 3918027f     	strb	wzr, [x19, #0x600]
 4604ff4: 3d800101     	str	q1, [x8]
 4604ff8: 3914227f     	strb	wzr, [x19, #0x508]
 4604ffc: 52800100     	mov	w0, #0x8                ; =8
 4605000: 96e828da     	bl	0xf368 <_ChromeMain+0xa0cc>
 4605004: b900001f     	str	wzr, [x0]
 4605008: 3900101f     	strb	wzr, [x0, #0x4]
 460500c: b40000c0     	cbz	x0, 0x4605024 <_ChromeMain+0x45ffd88>
 4605010: 52800028     	mov	w8, #0x1                ; =1
 4605014: b8280008     	ldadd	w8, w8, [x0]
 4605018: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 460501c: 6b09011f     	cmp	w8, w9
 4605020: 54000d80     	b.eq	0x46051d0 <_ChromeMain+0x45fff34>
 4605024: f9030660     	str	x0, [x19, #0x608]
 4605028: f9030a73     	str	x19, [x19, #0x610]
 460502c: aa1303e0     	mov	x0, x19
 4605030: 52800021     	mov	w1, #0x1                ; =1
 4605034: 97584216     	bl	0x1c1588c <_ChromeMain+0x1c105f0>
 4605038: f9401268     	ldr	x8, [x19, #0x20]
 460503c: b9400909     	ldr	w9, [x8, #0x8]
 4605040: 7100093f     	cmp	w9, #0x2
 4605044: 54000ba0     	b.eq	0x46051b8 <_ChromeMain+0x45fff1c>
 4605048: 39422909     	ldrb	w9, [x8, #0x8a]
 460504c: 340000c9     	cbz	w9, 0x4605064 <_ChromeMain+0x45ffdc8>
 4605050: 3902291f     	strb	wzr, [x8, #0x8a]
 4605054: f940b500     	ldr	x0, [x8, #0x168]
 4605058: 52800001     	mov	w1, #0x0                ; =0
 460505c: 971f22b9     	bl	0xdcdb40 <_ChromeMain+0xdc88a4>
 4605060: f9401268     	ldr	x8, [x19, #0x20]
 4605064: f940b500     	ldr	x0, [x8, #0x168]
 4605068: 52800021     	mov	w1, #0x1                ; =1
 460506c: 97704df6     	bl	0x2218844 <_ChromeMain+0x22135a8>
 4605070: f9400268     	ldr	x8, [x19]
 4605074: f9405108     	ldr	x8, [x8, #0xa0]
 4605078: aa1303e0     	mov	x0, x19
 460507c: 52800001     	mov	w1, #0x0                ; =0
 4605080: d63f0100     	blr	x8
 4605084: f941a674     	ldr	x20, [x19, #0x348]
 4605088: b40000f4     	cbz	x20, 0x46050a4 <_ChromeMain+0x45ffe08>
 460508c: 91008280     	add	x0, x20, #0x20
 4605090: 910c4261     	add	x1, x19, #0x310
 4605094: 97519f5f     	bl	0x1a6ce10 <_ChromeMain+0x1a67b74>
 4605098: 910c4260     	add	x0, x19, #0x310
 460509c: aa1403e1     	mov	x1, x20
 46050a0: 97519fac     	bl	0x1a6cf50 <_ChromeMain+0x1a67cb4>
 46050a4: f941a268     	ldr	x8, [x19, #0x340]
 46050a8: b4000748     	cbz	x8, 0x4605190 <_ChromeMain+0x45ffef4>
 46050ac: f9403500     	ldr	x0, [x8, #0x68]
 46050b0: b4000700     	cbz	x0, 0x4605190 <_ChromeMain+0x45ffef4>
 46050b4: f9400008     	ldr	x8, [x0]
 46050b8: f940b508     	ldr	x8, [x8, #0x168]
 46050bc: d63f0100     	blr	x8
 46050c0: aa0003f4     	mov	x20, x0
 46050c4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46050c8: f94046e9     	ldr	x9, [x23, #0x88]
 46050cc: eb09011f     	cmp	x8, x9
 46050d0: 54000061     	b.ne	0x46050dc <_ChromeMain+0x45ffe40>
 46050d4: aa1403e0     	mov	x0, x20
 46050d8: 96e83c89     	bl	0x142fc <_ChromeMain+0xf060>
 46050dc: f94002a0     	ldr	x0, [x21]
 46050e0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46050e4: f94046e9     	ldr	x9, [x23, #0x88]
 46050e8: eb09011f     	cmp	x8, x9
 46050ec: 54000620     	b.eq	0x46051b0 <_ChromeMain+0x45fff14>
 46050f0: f9023274     	str	x20, [x19, #0x460]
 46050f4: 925e7668     	and	x8, x19, #0xfffffffc00000000
 46050f8: f94046e9     	ldr	x9, [x23, #0x88]
 46050fc: eb09011f     	cmp	x8, x9
 4605100: 54000061     	b.ne	0x460510c <_ChromeMain+0x45ffe70>
 4605104: aa1303e0     	mov	x0, x19
 4605108: 96e83c7d     	bl	0x142fc <_ChromeMain+0xf060>
 460510c: 52800700     	mov	w0, #0x38               ; =56
 4605110: 96e82896     	bl	0xf368 <_ChromeMain+0xa0cc>
 4605114: 52800035     	mov	w21, #0x1               ; =1
 4605118: b9000015     	str	w21, [x0]
 460511c: f0ffcb28     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4605120: 91270108     	add	x8, x8, #0x9c0
 4605124: f0fea5e9     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 4605128: 91180129     	add	x9, x9, #0x600
 460512c: a900a408     	stp	x8, x9, [x0, #0x8]
 4605130: 90fefad6     	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 4605134: 912c02d6     	add	x22, x22, #0xb00
 4605138: 10000568     	adr	x8, 0x46051e4 <_ChromeMain+0x45fff48>
 460513c: d503201f     	nop
 4605140: a901a016     	stp	x22, x8, [x0, #0x18]
 4605144: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4605148: b40004a0     	cbz	x0, 0x46051dc <_ChromeMain+0x45fff40>
 460514c: aa0003f4     	mov	x20, x0
 4605150: 52800600     	mov	w0, #0x30               ; =48
 4605154: 96e82885     	bl	0xf368 <_ChromeMain+0xa0cc>
 4605158: aa0003e3     	mov	x3, x0
 460515c: b9000015     	str	w21, [x0]
 4605160: f0fef7e8     	adrp	x8, 0x2504000 <_ChromeMain+0x24fed64>
 4605164: 91117108     	add	x8, x8, #0x45c
 4605168: f0ff9489     	adrp	x9, 0x3898000 <_ChromeMain+0x3892d64>
 460516c: 91070129     	add	x9, x9, #0x1c0
 4605170: a900a408     	stp	x8, x9, [x0, #0x8]
 4605174: f9000c16     	str	x22, [x0, #0x18]
 4605178: f9001414     	str	x20, [x0, #0x28]
 460517c: f00446a1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4605180: 911ad021     	add	x1, x1, #0x6b4
 4605184: 9110e260     	add	x0, x19, #0x438
 4605188: 52800162     	mov	w2, #0xb                ; =11
 460518c: 972b96a9     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 4605190: aa1303e0     	mov	x0, x19
 4605194: 94000014     	bl	0x46051e4 <_ChromeMain+0x45fff48>
 4605198: aa1303e0     	mov	x0, x19
 460519c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46051a0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46051a4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 46051a8: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 46051ac: d65f03c0     	ret
 46051b0: 96e88625     	bl	0x26a44 <_ChromeMain+0x217a8>
 46051b4: 17ffffcf     	b	0x46050f0 <_ChromeMain+0x45ffe54>
 46051b8: d4200000     	brk	#0
 46051bc: d4400000     	hlt	#0
 46051c0: d4200020     	brk	#0x1
 46051c4: d4200000     	brk	#0
 46051c8: d4400000     	hlt	#0
 46051cc: d4200020     	brk	#0x1
 46051d0: d4200000     	brk	#0
 46051d4: d4400000     	hlt	#0
 46051d8: d4200020     	brk	#0x1
 46051dc: d2800003     	mov	x3, #0x0                ; =0
 46051e0: 17ffffe7     	b	0x460517c <_ChromeMain+0x45ffee0>
