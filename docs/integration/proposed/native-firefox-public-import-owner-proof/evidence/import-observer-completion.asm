
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42648b0: 52800028     	mov	w8, #0x1                ; =1
 42648b4: 3900b408     	strb	w8, [x0, #0x2d]
 42648b8: 7100203f     	cmp	w1, #0x8
 42648bc: 54000161     	b.ne	0x42648e8 <_ChromeMain+0x425f64c>
 42648c0: 3900c808     	strb	w8, [x0, #0x32]
 42648c4: f9400c08     	ldr	x8, [x0, #0x18]
 42648c8: b40000c8     	cbz	x8, 0x42648e0 <_ChromeMain+0x425f644>
 42648cc: 39447109     	ldrb	w9, [x8, #0x11c]
 42648d0: 35000069     	cbnz	w9, 0x42648dc <_ChromeMain+0x425f640>
 42648d4: 52800008     	mov	w8, #0x0                ; =0
 42648d8: 14000002     	b	0x42648e0 <_ChromeMain+0x425f644>
 42648dc: 39445108     	ldrb	w8, [x8, #0x114]
 42648e0: 12000108     	and	w8, w8, #0x1
 42648e4: 3900cc08     	strb	w8, [x0, #0x33]
 42648e8: d65f03c0     	ret
 42648ec: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 42648f0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 42648f4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42648f8: 910083fd     	add	x29, sp, #0x20
 42648fc: aa0003f3     	mov	x19, x0
 4264900: 3940c408     	ldrb	w8, [x0, #0x31]
 4264904: 340000a8     	cbz	w8, 0x4264918 <_ChromeMain+0x425f67c>
 4264908: 3940ca68     	ldrb	w8, [x19, #0x32]
 426490c: 37000068     	tbnz	w8, #0x0, 0x4264918 <_ChromeMain+0x425f67c>
 4264910: 52800028     	mov	w8, #0x1                ; =1
 4264914: 79006668     	strh	w8, [x19, #0x32]
 4264918: f9400e74     	ldr	x20, [x19, #0x18]
 426491c: b4000214     	cbz	x20, 0x426495c <_ChromeMain+0x425f6c0>
 4264920: f9401a80     	ldr	x0, [x20, #0x30]
 4264924: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4264928: d0054a75     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 426492c: f94046a9     	ldr	x9, [x21, #0x88]
 4264930: eb09011f     	cmp	x8, x9
 4264934: 54000041     	b.ne	0x426493c <_ChromeMain+0x425f6a0>
 4264938: 96f70843     	bl	0x26a44 <_ChromeMain+0x217a8>
 426493c: f9001a9f     	str	xzr, [x20, #0x30]
 4264940: f9400e60     	ldr	x0, [x19, #0x18]
 4264944: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4264948: f94046a9     	ldr	x9, [x21, #0x88]
 426494c: eb09011f     	cmp	x8, x9
 4264950: 54000041     	b.ne	0x4264958 <_ChromeMain+0x425f6bc>
 4264954: 96f7083c     	bl	0x26a44 <_ChromeMain+0x217a8>
 4264958: f9000e7f     	str	xzr, [x19, #0x18]
 426495c: 3940be68     	ldrb	w8, [x19, #0x2f]
 4264960: 37000168     	tbnz	w8, #0x0, 0x426498c <_ChromeMain+0x425f6f0>
 4264964: f9401e68     	ldr	x8, [x19, #0x38]
 4264968: b40000e8     	cbz	x8, 0x4264984 <_ChromeMain+0x425f6e8>
 426496c: 52800028     	mov	w8, #0x1                ; =1
 4264970: 3900ba68     	strb	w8, [x19, #0x2e]
 4264974: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4264978: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 426497c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4264980: d65f03c0     	ret
 4264984: 52800028     	mov	w8, #0x1                ; =1
 4264988: 7802f268     	sturh	w8, [x19, #0x2f]
 426498c: 52800028     	mov	w8, #0x1                ; =1
 4264990: 3900ba68     	strb	w8, [x19, #0x2e]
 4264994: 3940b268     	ldrb	w8, [x19, #0x2c]
 4264998: 3607fee8     	tbz	w8, #0x0, 0x4264974 <_ChromeMain+0x425f6d8>
 426499c: 3940ca68     	ldrb	w8, [x19, #0x32]
 42649a0: 34fffea8     	cbz	w8, 0x4264974 <_ChromeMain+0x425f6d8>
 42649a4: 3940b668     	ldrb	w8, [x19, #0x2d]
 42649a8: 340000a8     	cbz	w8, 0x42649bc <_ChromeMain+0x425f720>
 42649ac: 3940c268     	ldrb	w8, [x19, #0x30]
 42649b0: 34000068     	cbz	w8, 0x42649bc <_ChromeMain+0x425f720>
 42649b4: 3940ce68     	ldrb	w8, [x19, #0x33]
 42649b8: 370000c8     	tbnz	w8, #0x0, 0x42649d0 <_ChromeMain+0x425f734>
 42649bc: aa1303e0     	mov	x0, x19
 42649c0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42649c4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42649c8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 42649cc: 17fffb9d     	b	0x4263840 <_ChromeMain+0x425e5a4>
 42649d0: aa1303e0     	mov	x0, x19
 42649d4: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 42649d8: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 42649dc: a8c357f6     	ldp	x22, x21, [sp], #0x30
 42649e0: 17fffe9c     	b	0x4264450 <_ChromeMain+0x425f1b4>
