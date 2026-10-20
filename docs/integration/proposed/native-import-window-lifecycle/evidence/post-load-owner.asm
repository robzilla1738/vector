
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 417c4ec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 417c4f0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 417c4f4: 910043fd     	add	x29, sp, #0x10
 417c4f8: aa0003f3     	mov	x19, x0
 417c4fc: d0056b48     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 417c500: f9467d08     	ldr	x8, [x8, #0xcf8]
 417c504: b40001e8     	cbz	x8, 0x417c540 <_ChromeMain+0x41772a4>
 417c508: f9401d14     	ldr	x20, [x8, #0x38]
 417c50c: b40001b4     	cbz	x20, 0x417c540 <_ChromeMain+0x41772a4>
 417c510: d0046b61     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 417c514: 911a3c21     	add	x1, x1, #0x68f
 417c518: aa1403e0     	mov	x0, x20
 417c51c: 52800342     	mov	w2, #0x1a               ; =26
 417c520: 970d01cb     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 417c524: b40000e0     	cbz	x0, 0x417c540 <_ChromeMain+0x41772a4>
 417c528: d0046b61     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 417c52c: 911a3c21     	add	x1, x1, #0x68f
 417c530: aa1403e0     	mov	x0, x20
 417c534: 52800342     	mov	w2, #0x1a               ; =26
 417c538: 970627f2     	bl	0x306500 <_ChromeMain+0x301264>
 417c53c: 37000240     	tbnz	w0, #0x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c540: 39439e68     	ldrb	w8, [x19, #0xe7]
 417c544: 37000208     	tbnz	w8, #0x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c548: f9401a60     	ldr	x0, [x19, #0x30]
 417c54c: b40001c0     	cbz	x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c550: 39412008     	ldrb	w8, [x0, #0x48]
 417c554: 37000188     	tbnz	w8, #0x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c558: f9400c08     	ldr	x8, [x0, #0x18]
 417c55c: 3940c108     	ldrb	w8, [x8, #0x30]
 417c560: 37000128     	tbnz	w8, #0x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c564: d0056c28     	adrp	x8, 0xef02000 <dyld_stub_binder+0xef02000>
 417c568: 39594108     	ldrb	w8, [x8, #0x650]
 417c56c: 370000c8     	tbnz	w8, #0x0, 0x417c584 <_ChromeMain+0x41772e8>
 417c570: d0056c28     	adrp	x8, 0xef02000 <dyld_stub_binder+0xef02000>
 417c574: b9464108     	ldr	w8, [x8, #0x640]
 417c578: 35000068     	cbnz	w8, 0x417c584 <_ChromeMain+0x41772e8>
 417c57c: 97fffb49     	bl	0x417b2a0 <_ChromeMain+0x4176004>
 417c580: 350000a0     	cbnz	w0, 0x417c594 <_ChromeMain+0x41772f8>
 417c584: 52800000     	mov	w0, #0x0                ; =0
 417c588: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 417c58c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 417c590: d65f03c0     	ret
 417c594: 52800034     	mov	w20, #0x1               ; =1
 417c598: 39037a74     	strb	w20, [x19, #0xde]
 417c59c: 7901c27f     	strh	wzr, [x19, #0xe0]
 417c5a0: 9103a260     	add	x0, x19, #0xe8
 417c5a4: 9716c85d     	bl	0x72e718 <_ChromeMain+0x72947c>
 417c5a8: 7901b274     	strh	w20, [x19, #0xd8]
 417c5ac: aa1303e0     	mov	x0, x19
 417c5b0: 97fff948     	bl	0x417aad0 <_ChromeMain+0x4175834>
 417c5b4: aa1303e0     	mov	x0, x19
 417c5b8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 417c5bc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 417c5c0: 14000001     	b	0x417c5c4 <_ChromeMain+0x4177328>
