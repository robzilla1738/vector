
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3b229b8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 3b229bc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 3b229c0: 910043fd     	add	x29, sp, #0x10
 3b229c4: aa0003f3     	mov	x19, x0
 3b229c8: 90059f48     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 3b229cc: 91120108     	add	x8, x8, #0x480
 3b229d0: f8bfc100     	ldapr	x0, [x8]
 3b229d4: b4000560     	cbz	x0, 0x3b22a80 <_ChromeMain+0x3b1d7e4>
 3b229d8: 52807001     	mov	w1, #0x380              ; =896
 3b229dc: d2800002     	mov	x2, #0x0                ; =0
 3b229e0: 971622f4     	bl	0xab5b0 <_ChromeMain+0xa6314>
 3b229e4: aa0003f4     	mov	x20, x0
 3b229e8: 97a42a14     	bl	0x242d238 <_ChromeMain+0x2427f9c>
 3b229ec: 90055c88     	adrp	x8, 0xe6b2000 <dyld_stub_binder+0xe6b2000>
 3b229f0: 912f4108     	add	x8, x8, #0xbd0
 3b229f4: 910fc109     	add	x9, x8, #0x3f0
 3b229f8: a9002408     	stp	x8, x9, [x0]
 3b229fc: 91106109     	add	x9, x8, #0x418
 3b22a00: f9000809     	str	x9, [x0, #0x10]
 3b22a04: 91114109     	add	x9, x8, #0x450
 3b22a08: 9112010a     	add	x10, x8, #0x480
 3b22a0c: a906a809     	stp	x9, x10, [x0, #0x68]
 3b22a10: 91134109     	add	x9, x8, #0x4d0
 3b22a14: f9005809     	str	x9, [x0, #0xb0]
 3b22a18: 91158109     	add	x9, x8, #0x560
 3b22a1c: f80f8c09     	str	x9, [x0, #0xf8]!
 3b22a20: 9114c108     	add	x8, x8, #0x530
 3b22a24: f9006e88     	str	x8, [x20, #0xd8]
 3b22a28: f901a69f     	str	xzr, [x20, #0x348]
 3b22a2c: 2f06e400     	movi	d0, #0xffff000000000000
 3b22a30: fd01aa80     	str	d0, [x20, #0x350]
 3b22a34: 52800028     	mov	w8, #0x1                ; =1
 3b22a38: 390d6288     	strb	w8, [x20, #0x358]
 3b22a3c: f901b29f     	str	xzr, [x20, #0x360]
 3b22a40: 390da29f     	strb	wzr, [x20, #0x368]
 3b22a44: f901ba9f     	str	xzr, [x20, #0x370]
 3b22a48: b9037a9f     	str	wzr, [x20, #0x378]
 3b22a4c: 390df29f     	strb	wzr, [x20, #0x37c]
 3b22a50: 3946a688     	ldrb	w8, [x20, #0x1a9]
 3b22a54: 34000088     	cbz	w8, 0x3b22a64 <_ChromeMain+0x3b1d7c8>
 3b22a58: 3906a69f     	strb	wzr, [x20, #0x1a9]
 3b22a5c: 9106a681     	add	x1, x20, #0x1a9
 3b22a60: 9750155c     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 3b22a64: 91002260     	add	x0, x19, #0x8
 3b22a68: aa1403e1     	mov	x1, x20
 3b22a6c: 978ef08d     	bl	0x1edeca0 <_ChromeMain+0x1ed9a04>
 3b22a70: aa1403e0     	mov	x0, x20
 3b22a74: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 3b22a78: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 3b22a7c: d65f03c0     	ret
 3b22a80: 941ec31e     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 3b22a84: 17ffffd5     	b	0x3b229d8 <_ChromeMain+0x3b1d73c>
