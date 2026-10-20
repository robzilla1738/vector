
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46434a8: aa0003f3     	mov	x19, x0
 46434ac: 91400414     	add	x20, x0, #0x1, lsl #12  ; =0x1000
 46434b0: 97ffc6c0     	bl	0x4634fb0 <_ChromeMain+0x462fd14>
 46434b4: 52800028     	mov	w8, #0x1                ; =1
 46434b8: 3907a288     	strb	w8, [x20, #0x1e8]
 46434bc: 394fe288     	ldrb	w8, [x20, #0x3f8]
 46434c0: 34000108     	cbz	w8, 0x46434e0 <_ChromeMain+0x463e244>
 46434c4: 39cf9e88     	ldrsb	w8, [x20, #0x3e7]
 46434c8: 36f800a8     	tbz	w8, #0x1f, 0x46434dc <_ChromeMain+0x463e240>
 46434cc: f949ea60     	ldr	x0, [x19, #0x13d0]
 46434d0: f949f268     	ldr	x8, [x19, #0x13e0]
 46434d4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46434d8: 96e71678     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46434dc: 390fe29f     	strb	wzr, [x20, #0x3f8]
 46434e0: f945ce68     	ldr	x8, [x19, #0xb98]
 46434e4: b5000108     	cbnz	x8, 0x4643504 <_ChromeMain+0x463e268>
 46434e8: 52800020     	mov	w0, #0x1                ; =1
 46434ec: 96e72f9f     	bl	0xf368 <_ChromeMain+0xa0cc>
 46434f0: d00545e8     	adrp	x8, 0xef01000 <dyld_stub_binder+0xef01000>
 46434f4: b946c909     	ldr	w9, [x8, #0x6c8]
 46434f8: 11000529     	add	w9, w9, #0x1
 46434fc: b906c909     	str	w9, [x8, #0x6c8]
 4643500: f905ce60     	str	x0, [x19, #0xb98]
 4643504: 52800028     	mov	w8, #0x1                ; =1
 4643508: 79172268     	strh	w8, [x19, #0xb90]
 464350c: 392e4a7f     	strb	wzr, [x19, #0xb92]
 4643510: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4643514: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4643518: d65f03c0     	ret
