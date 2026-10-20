
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461003c: d10103ff     	sub	sp, sp, #0x40
 4610040: a90157f6     	stp	x22, x21, [sp, #0x10]
 4610044: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4610048: a9037bfd     	stp	x29, x30, [sp, #0x30]
 461004c: 9100c3fd     	add	x29, sp, #0x30
 4610050: aa0003f3     	mov	x19, x0
 4610054: f9431008     	ldr	x8, [x0, #0x620]
 4610058: d37df109     	lsl	x9, x8, #3
 461005c: b4000129     	cbz	x9, 0x4610080 <_ChromeMain+0x460ade4>
 4610060: f9430e6a     	ldr	x10, [x19, #0x618]
 4610064: cb080fe8     	neg	x8, x8, lsl #3
 4610068: 8b0a0129     	add	x9, x9, x10
 461006c: d1002129     	sub	x9, x9, #0x8
 4610070: b40003e9     	cbz	x9, 0x46100ec <_ChromeMain+0x460ae50>
 4610074: d1002129     	sub	x9, x9, #0x8
 4610078: 91002108     	add	x8, x8, #0x8
 461007c: b5ffffa8     	cbnz	x8, 0x4610070 <_ChromeMain+0x460add4>
 4610080: f903127f     	str	xzr, [x19, #0x620]
 4610084: f9428e68     	ldr	x8, [x19, #0x518]
 4610088: b4000288     	cbz	x8, 0x46100d8 <_ChromeMain+0x460ae3c>
 461008c: f9402100     	ldr	x0, [x8, #0x40]
 4610090: b4000240     	cbz	x0, 0x46100d8 <_ChromeMain+0x460ae3c>
 4610094: f9400008     	ldr	x8, [x0]
 4610098: f940a508     	ldr	x8, [x8, #0x148]
 461009c: d63f0100     	blr	x8
 46100a0: f9400008     	ldr	x8, [x0]
 46100a4: f940b508     	ldr	x8, [x8, #0x168]
 46100a8: d63f0100     	blr	x8
 46100ac: b4000160     	cbz	x0, 0x46100d8 <_ChromeMain+0x460ae3c>
 46100b0: d00446c1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 46100b4: 91191c21     	add	x1, x1, #0x647
 46100b8: 52800602     	mov	w2, #0x30               ; =48
 46100bc: 96f9c4d9     	bl	0x481420 <_ChromeMain+0x47c184>
 46100c0: a9402014     	ldp	x20, x8, [x0]
 46100c4: 8b081695     	add	x21, x20, x8, lsl #5
 46100c8: eb15029f     	cmp	x20, x21
 46100cc: 540006c8     	b.hi	0x46101a4 <_ChromeMain+0x460af08>
 46100d0: d37be908     	lsl	x8, x8, #5
 46100d4: b50004c8     	cbnz	x8, 0x461016c <_ChromeMain+0x460aed0>
 46100d8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 46100dc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 46100e0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 46100e4: 910103ff     	add	sp, sp, #0x40
 46100e8: d65f03c0     	ret
 46100ec: d4200020     	brk	#0x1
 46100f0: 9343fd4b     	asr	x11, x10, #3
 46100f4: f94007ea     	ldr	x10, [sp, #0x8]
 46100f8: aa0803e1     	mov	x1, x8
 46100fc: d341fd6c     	lsr	x12, x11, #1
 4610100: 8b0c0c2d     	add	x13, x1, x12, lsl #3
 4610104: f84085ae     	ldr	x14, [x13], #0x8
 4610108: aa6b07ef     	mvn	x15, x11, lsr #1
 461010c: 8b0f016b     	add	x11, x11, x15
 4610110: eb0a01df     	cmp	x14, x10
 4610114: 9a8cb16b     	csel	x11, x11, x12, lt
 4610118: 9a81b1a1     	csel	x1, x13, x1, lt
 461011c: b5ffff0b     	cbnz	x11, 0x46100fc <_ChromeMain+0x460ae60>
 4610120: 1400000a     	b	0x4610148 <_ChromeMain+0x460aeac>
 4610124: aa1403e0     	mov	x0, x20
 4610128: 910023e2     	add	x2, sp, #0x8
 461012c: 972a4424     	bl	0x10a11bc <_ChromeMain+0x109bf20>
 4610130: 34000180     	cbz	w0, 0x4610160 <_ChromeMain+0x460aec4>
 4610134: f9430e68     	ldr	x8, [x19, #0x618]
 4610138: f9431269     	ldr	x9, [x19, #0x620]
 461013c: d37df12a     	lsl	x10, x9, #3
 4610140: b5fffd8a     	cbnz	x10, 0x46100f0 <_ChromeMain+0x460ae54>
 4610144: aa0803e1     	mov	x1, x8
 4610148: 8b090d08     	add	x8, x8, x9, lsl #3
 461014c: eb08003f     	cmp	x1, x8
 4610150: 54000201     	b.ne	0x4610190 <_ChromeMain+0x460aef4>
 4610154: 91186260     	add	x0, x19, #0x618
 4610158: 910023e2     	add	x2, sp, #0x8
 461015c: 9742fade     	bl	0x16cecd4 <_ChromeMain+0x16c9a38>
 4610160: 91008294     	add	x20, x20, #0x20
 4610164: eb15029f     	cmp	x20, x21
 4610168: 54fffb80     	b.eq	0x46100d8 <_ChromeMain+0x460ae3c>
 461016c: b4ffffb4     	cbz	x20, 0x4610160 <_ChromeMain+0x460aec4>
 4610170: 39406288     	ldrb	w8, [x20, #0x18]
 4610174: 7100111f     	cmp	w8, #0x4
 4610178: 54ffff41     	b.ne	0x4610160 <_ChromeMain+0x460aec4>
 461017c: f90007ff     	str	xzr, [sp, #0x8]
 4610180: 39805e81     	ldrsb	x1, [x20, #0x17]
 4610184: b6fffd01     	tbz	x1, #0x3f, 0x4610124 <_ChromeMain+0x460ae88>
 4610188: a9400680     	ldp	x0, x1, [x20]
 461018c: 17ffffe7     	b	0x4610128 <_ChromeMain+0x460ae8c>
 4610190: f94007e8     	ldr	x8, [sp, #0x8]
 4610194: f9400029     	ldr	x9, [x1]
 4610198: eb09011f     	cmp	x8, x9
 461019c: 54fffdcb     	b.lt	0x4610154 <_ChromeMain+0x460aeb8>
 46101a0: 17fffff0     	b	0x4610160 <_ChromeMain+0x460aec4>
 46101a4: d4200000     	brk	#0
 46101a8: d4400000     	hlt	#0
 46101ac: d4200020     	brk	#0x1
