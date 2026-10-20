
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4642084: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4642088: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464208c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4642090: 910083fd     	add	x29, sp, #0x20
 4642094: aa0103f4     	mov	x20, x1
 4642098: aa0003f3     	mov	x19, x0
 464209c: f9422c08     	ldr	x8, [x0, #0x458]
 46420a0: b4000228     	cbz	x8, 0x46420e4 <_ChromeMain+0x463ce48>
 46420a4: f9429d08     	ldr	x8, [x8, #0x538]
 46420a8: f9403500     	ldr	x0, [x8, #0x68]
 46420ac: b40001c0     	cbz	x0, 0x46420e4 <_ChromeMain+0x463ce48>
 46420b0: f9400008     	ldr	x8, [x0]
 46420b4: f940a508     	ldr	x8, [x8, #0x148]
 46420b8: d63f0100     	blr	x8
 46420bc: f9400008     	ldr	x8, [x0]
 46420c0: f940b508     	ldr	x8, [x8, #0x168]
 46420c4: d63f0100     	blr	x8
 46420c8: b40000e0     	cbz	x0, 0x46420e4 <_ChromeMain+0x463ce48>
 46420cc: 90044541     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 46420d0: 9116fc21     	add	x1, x1, #0x5bf
 46420d4: 528005a2     	mov	w2, #0x2d               ; =45
 46420d8: 96f3110a     	bl	0x306500 <_ChromeMain+0x301264>
 46420dc: aa0003e8     	mov	x8, x0
 46420e0: 14000002     	b	0x46420e8 <_ChromeMain+0x463ce4c>
 46420e4: 52800028     	mov	w8, #0x1                ; =1
 46420e8: 52800000     	mov	w0, #0x0                ; =0
 46420ec: b40003b4     	cbz	x20, 0x4642160 <_ChromeMain+0x463cec4>
 46420f0: 34000388     	cbz	w8, 0x4642160 <_ChromeMain+0x463cec4>
 46420f4: 39418688     	ldrb	w8, [x20, #0x61]
 46420f8: 37000328     	tbnz	w8, #0x0, 0x464215c <_ChromeMain+0x463cec0>
 46420fc: 3941e288     	ldrb	w8, [x20, #0x78]
 4642100: 370002e8     	tbnz	w8, #0x0, 0x464215c <_ChromeMain+0x463cec0>
 4642104: b9401295     	ldr	w21, [x20, #0x10]
 4642108: f9486e68     	ldr	x8, [x19, #0x10d8]
 464210c: f9487269     	ldr	x9, [x19, #0x10e0]
 4642110: d37ef52a     	lsl	x10, x9, #2
 4642114: b40002ea     	cbz	x10, 0x4642170 <_ChromeMain+0x463ced4>
 4642118: 9342fd4b     	asr	x11, x10, #2
 464211c: aa0803ea     	mov	x10, x8
 4642120: d341fd6c     	lsr	x12, x11, #1
 4642124: 8b0c094d     	add	x13, x10, x12, lsl #2
 4642128: b84045ae     	ldr	w14, [x13], #0x4
 464212c: aa6b07ef     	mvn	x15, x11, lsr #1
 4642130: 8b0f016b     	add	x11, x11, x15
 4642134: 6b1501df     	cmp	w14, w21
 4642138: 9a8cb16b     	csel	x11, x11, x12, lt
 464213c: 9a8ab1aa     	csel	x10, x13, x10, lt
 4642140: b5ffff0b     	cbnz	x11, 0x4642120 <_ChromeMain+0x463ce84>
 4642144: 8b090908     	add	x8, x8, x9, lsl #2
 4642148: eb08015f     	cmp	x10, x8
 464214c: 540001a0     	b.eq	0x4642180 <_ChromeMain+0x463cee4>
 4642150: b9400148     	ldr	w8, [x10]
 4642154: 6b0802bf     	cmp	w21, w8
 4642158: 5400014b     	b.lt	0x4642180 <_ChromeMain+0x463cee4>
 464215c: 52800000     	mov	w0, #0x0                ; =0
 4642160: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4642164: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4642168: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464216c: d65f03c0     	ret
 4642170: aa0803ea     	mov	x10, x8
 4642174: 17fffff4     	b	0x4642144 <_ChromeMain+0x463cea8>
 4642178: aa0803ea     	mov	x10, x8
 464217c: 14000016     	b	0x46421d4 <_ChromeMain+0x463cf38>
 4642180: 91400676     	add	x22, x19, #0x1, lsl #12 ; =0x1000
 4642184: 394092c8     	ldrb	w8, [x22, #0x24]
 4642188: 34000088     	cbz	w8, 0x4642198 <_ChromeMain+0x463cefc>
 464218c: b9502268     	ldr	w8, [x19, #0x1020]
 4642190: 6b0802bf     	cmp	w21, w8
 4642194: 540006c0     	b.eq	0x464226c <_ChromeMain+0x463cfd0>
 4642198: f947e668     	ldr	x8, [x19, #0xfc8]
 464219c: f947ea69     	ldr	x9, [x19, #0xfd0]
 46421a0: d37be92a     	lsl	x10, x9, #5
 46421a4: b4fffeaa     	cbz	x10, 0x4642178 <_ChromeMain+0x463cedc>
 46421a8: 9345fd4b     	asr	x11, x10, #5
 46421ac: aa0803ea     	mov	x10, x8
 46421b0: d341fd6c     	lsr	x12, x11, #1
 46421b4: 8b0c154d     	add	x13, x10, x12, lsl #5
 46421b8: b84205ae     	ldr	w14, [x13], #0x20
 46421bc: aa6b07ef     	mvn	x15, x11, lsr #1
 46421c0: 8b0f016b     	add	x11, x11, x15
 46421c4: 6b1501df     	cmp	w14, w21
 46421c8: 9a8cb16b     	csel	x11, x11, x12, lt
 46421cc: 9a8ab1aa     	csel	x10, x13, x10, lt
 46421d0: b5ffff0b     	cbnz	x11, 0x46421b0 <_ChromeMain+0x463cf14>
 46421d4: 8b091508     	add	x8, x8, x9, lsl #5
 46421d8: eb08015f     	cmp	x10, x8
 46421dc: 54000080     	b.eq	0x46421ec <_ChromeMain+0x463cf50>
 46421e0: b9400148     	ldr	w8, [x10]
 46421e4: 6b0802bf     	cmp	w21, w8
 46421e8: 54fffbaa     	b.ge	0x464215c <_ChromeMain+0x463cec0>
 46421ec: f947ce68     	ldr	x8, [x19, #0xf98]
 46421f0: f947d269     	ldr	x9, [x19, #0xfa0]
 46421f4: 8b09092a     	add	x10, x9, x9, lsl #2
 46421f8: d37df14a     	lsl	x10, x10, #3
 46421fc: b400030a     	cbz	x10, 0x464225c <_ChromeMain+0x463cfc0>
 4642200: 9343fd4a     	asr	x10, x10, #3
 4642204: b202e7eb     	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4642208: f29999ab     	movk	x11, #0xcccd
 464220c: 9b0b7d4c     	mul	x12, x10, x11
 4642210: 5280050b     	mov	w11, #0x28              ; =40
 4642214: aa0803ea     	mov	x10, x8
 4642218: d341fd8d     	lsr	x13, x12, #1
 464221c: 9b0b29ae     	madd	x14, x13, x11, x10
 4642220: b84285cf     	ldr	w15, [x14], #0x28
 4642224: aa6c07f0     	mvn	x16, x12, lsr #1
 4642228: 8b10018c     	add	x12, x12, x16
 464222c: 6b1501ff     	cmp	w15, w21
 4642230: 9a8db18c     	csel	x12, x12, x13, lt
 4642234: 9a8ab1ca     	csel	x10, x14, x10, lt
 4642238: b5ffff0c     	cbnz	x12, 0x4642218 <_ChromeMain+0x463cf7c>
 464223c: 5280050b     	mov	w11, #0x28              ; =40
 4642240: 9b0b2128     	madd	x8, x9, x11, x8
 4642244: eb08015f     	cmp	x10, x8
 4642248: 54fff8a0     	b.eq	0x464215c <_ChromeMain+0x463cec0>
 464224c: b9400148     	ldr	w8, [x10]
 4642250: 6b0802bf     	cmp	w21, w8
 4642254: 1a9fb7e0     	cset	w0, ge
 4642258: 17ffffc2     	b	0x4642160 <_ChromeMain+0x463cec4>
 464225c: aa0803ea     	mov	x10, x8
 4642260: 17fffff7     	b	0x464223c <_ChromeMain+0x463cfa0>
 4642264: aa0803ea     	mov	x10, x8
 4642268: 14000010     	b	0x46422a8 <_ChromeMain+0x463d00c>
 464226c: f947e668     	ldr	x8, [x19, #0xfc8]
 4642270: f947ea69     	ldr	x9, [x19, #0xfd0]
 4642274: d37be92a     	lsl	x10, x9, #5
 4642278: b4ffff6a     	cbz	x10, 0x4642264 <_ChromeMain+0x463cfc8>
 464227c: 9345fd4b     	asr	x11, x10, #5
 4642280: aa0803ea     	mov	x10, x8
 4642284: d341fd6c     	lsr	x12, x11, #1
 4642288: 8b0c154d     	add	x13, x10, x12, lsl #5
 464228c: b84205ae     	ldr	w14, [x13], #0x20
 4642290: aa6b07ef     	mvn	x15, x11, lsr #1
 4642294: 8b0f016b     	add	x11, x11, x15
 4642298: 6b1501df     	cmp	w14, w21
 464229c: 9a8cb16b     	csel	x11, x11, x12, lt
 46422a0: 9a8ab1aa     	csel	x10, x13, x10, lt
 46422a4: b5ffff0b     	cbnz	x11, 0x4642284 <_ChromeMain+0x463cfe8>
 46422a8: 8b091508     	add	x8, x8, x9, lsl #5
 46422ac: eb08015f     	cmp	x10, x8
 46422b0: 54000080     	b.eq	0x46422c0 <_ChromeMain+0x463d024>
 46422b4: b9400148     	ldr	w8, [x10]
 46422b8: 6b0802bf     	cmp	w21, w8
 46422bc: 54fff6ea     	b.ge	0x4642198 <_ChromeMain+0x463cefc>
 46422c0: aa1303e0     	mov	x0, x19
 46422c4: aa1403e1     	mov	x1, x20
 46422c8: 94002d14     	bl	0x464d718 <_ChromeMain+0x464847c>
 46422cc: 3707f480     	tbnz	w0, #0x0, 0x464215c <_ChromeMain+0x463cec0>
 46422d0: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 46422d4: 34fff628     	cbz	w8, 0x4642198 <_ChromeMain+0x463cefc>
 46422d8: b9401288     	ldr	w8, [x20, #0x10]
 46422dc: b9502a69     	ldr	w9, [x19, #0x1028]
 46422e0: 6b08013f     	cmp	w9, w8
 46422e4: 54fff3c0     	b.eq	0x464215c <_ChromeMain+0x463cec0>
 46422e8: 17ffffac     	b	0x4642198 <_ChromeMain+0x463cefc>
