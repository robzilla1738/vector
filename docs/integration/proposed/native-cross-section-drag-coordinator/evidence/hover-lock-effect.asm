
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34f95e8: d10143ff     	sub	sp, sp, #0x50
 34f95ec: a90257f6     	stp	x22, x21, [sp, #0x20]
 34f95f0: a9034ff4     	stp	x20, x19, [sp, #0x30]
 34f95f4: a9047bfd     	stp	x29, x30, [sp, #0x40]
 34f95f8: 910103fd     	add	x29, sp, #0x40
 34f95fc: 397e4008     	ldrb	w8, [x0, #0xf90]
 34f9600: 37000288     	tbnz	w8, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9604: aa0103f4     	mov	x20, x1
 34f9608: aa0003f3     	mov	x19, x0
 34f960c: f9442415     	ldr	x21, [x0, #0x848]
 34f9610: b005b580     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9614: 9118e000     	add	x0, x0, #0x638
 34f9618: 97307f1a     	bl	0x119280 <_ChromeMain+0x113fe4>
 34f961c: 370000a0     	tbnz	w0, #0x0, 0x34f9630 <_ChromeMain+0x34f4394>
 34f9620: b005b580     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 34f9624: 91192000     	add	x0, x0, #0x648
 34f9628: 97307f16     	bl	0x119280 <_ChromeMain+0x113fe4>
 34f962c: 340000c0     	cbz	w0, 0x34f9644 <_ChromeMain+0x34f43a8>
 34f9630: 394782a8     	ldrb	w8, [x21, #0x1e0]
 34f9634: 34000088     	cbz	w8, 0x34f9644 <_ChromeMain+0x34f43a8>
 34f9638: f9442668     	ldr	x8, [x19, #0x848]
 34f963c: 39424108     	ldrb	w8, [x8, #0x90]
 34f9640: 37000128     	tbnz	w8, #0x0, 0x34f9664 <_ChromeMain+0x34f43c8>
 34f9644: aa1303e0     	mov	x0, x19
 34f9648: 97e26b9a     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f964c: 3928227f     	strb	wzr, [x19, #0xa08]
 34f9650: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f9654: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f9658: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f965c: 910143ff     	add	sp, sp, #0x50
 34f9660: d65f03c0     	ret
 34f9664: 39682668     	ldrb	w8, [x19, #0xa09]
 34f9668: 34000108     	cbz	w8, 0x34f9688 <_ChromeMain+0x34f43ec>
 34f966c: f942ca68     	ldr	x8, [x19, #0x590]
 34f9670: b40000a8     	cbz	x8, 0x34f9684 <_ChromeMain+0x34f43e8>
 34f9674: f941b100     	ldr	x0, [x8, #0x360]
 34f9678: b4000060     	cbz	x0, 0x34f9684 <_ChromeMain+0x34f43e8>
 34f967c: 978f479d     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 34f9680: 37000040     	tbnz	w0, #0x0, 0x34f9688 <_ChromeMain+0x34f43ec>
 34f9684: 3928267f     	strb	wzr, [x19, #0xa09]
 34f9688: b94c8668     	ldr	w8, [x19, #0xc84]
 34f968c: 7100051f     	cmp	w8, #0x1
 34f9690: 5400024b     	b.lt	0x34f96d8 <_ChromeMain+0x34f443c>
 34f9694: 91250260     	add	x0, x19, #0x940
 34f9698: 9748d420     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f969c: 91268260     	add	x0, x19, #0x9a0
 34f96a0: 9748d41e     	bl	0x72e718 <_ChromeMain+0x72947c>
 34f96a4: 39282a7f     	strb	wzr, [x19, #0xa0a]
 34f96a8: 3928327f     	strb	wzr, [x19, #0xa0c]
 34f96ac: aa1303e0     	mov	x0, x19
 34f96b0: 97e26b80     	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f96b4: 39682268     	ldrb	w8, [x19, #0xa08]
 34f96b8: 34000328     	cbz	w8, 0x34f971c <_ChromeMain+0x34f4480>
 34f96bc: aa1303e0     	mov	x0, x19
 34f96c0: 52800001     	mov	w1, #0x0                ; =0
 34f96c4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f96c8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f96cc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f96d0: 910143ff     	add	sp, sp, #0x50
 34f96d4: 14455ccc     	b	0x4650a04 <_ChromeMain+0x464b768>
 34f96d8: b94c8a68     	ldr	w8, [x19, #0xc88]
 34f96dc: 7100051f     	cmp	w8, #0x1
 34f96e0: 540000eb     	b.lt	0x34f96fc <_ChromeMain+0x34f4460>
 34f96e4: aa1303e0     	mov	x0, x19
 34f96e8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f96ec: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f96f0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f96f4: 910143ff     	add	sp, sp, #0x50
 34f96f8: 17e26b6e     	b	0x2d944b0 <_ChromeMain+0x2d8f214>
 34f96fc: b94c8e68     	ldr	w8, [x19, #0xc8c]
 34f9700: 7100051f     	cmp	w8, #0x1
 34f9704: 5400028b     	b.lt	0x34f9754 <_ChromeMain+0x34f44b8>
 34f9708: 39682268     	ldrb	w8, [x19, #0xa08]
 34f970c: 3707fa28     	tbnz	w8, #0x0, 0x34f9650 <_ChromeMain+0x34f43b4>
 34f9710: aa1303e0     	mov	x0, x19
 34f9714: 52800021     	mov	w1, #0x1                ; =1
 34f9718: 17ffffeb     	b	0x34f96c4 <_ChromeMain+0x34f4428>
 34f971c: aa1303e0     	mov	x0, x19
 34f9720: 52800021     	mov	w1, #0x1                ; =1
 34f9724: 94454467     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 34f9728: aa1303e0     	mov	x0, x19
 34f972c: 52800001     	mov	w1, #0x0                ; =0
 34f9730: 9744db51     	bl	0x630474 <_ChromeMain+0x62b1d8>
 34f9734: f9422e68     	ldr	x8, [x19, #0x458]
 34f9738: 9107c100     	add	x0, x8, #0x1f0
 34f973c: 52800001     	mov	w1, #0x0                ; =0
 34f9740: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 34f9744: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 34f9748: a94257f6     	ldp	x22, x21, [sp, #0x20]
 34f974c: 910143ff     	add	sp, sp, #0x50
 34f9750: 1744db49     	b	0x630474 <_ChromeMain+0x62b1d8>
