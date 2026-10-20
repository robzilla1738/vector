
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34185f8: d10103ff     	sub	sp, sp, #0x40
 34185fc: a90157f6     	stp	x22, x21, [sp, #0x10]
 3418600: a9024ff4     	stp	x20, x19, [sp, #0x20]
 3418604: a9037bfd     	stp	x29, x30, [sp, #0x30]
 3418608: 9100c3fd     	add	x29, sp, #0x30
 341860c: aa0003f3     	mov	x19, x0
 3418610: 90056ea8     	adrp	x8, 0xe1ec000 <dyld_stub_binder+0xe1ec000>
 3418614: 91220108     	add	x8, x8, #0x880
 3418618: f9000008     	str	x8, [x0]
 341861c: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418620: 91194108     	add	x8, x8, #0x650
 3418624: 38bfc108     	ldaprb	w8, [x8]
 3418628: 37000348     	tbnz	w8, #0x0, 0x3418690 <_ChromeMain+0x34133f4>
 341862c: f005c954     	adrp	x20, 0xed43000 <dyld_stub_binder+0xed43000>
 3418630: 91194294     	add	x20, x20, #0x650
 3418634: aa1403e0     	mov	x0, x20
 3418638: 952fb0a2     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 341863c: 340002a0     	cbz	w0, 0x3418690 <_ChromeMain+0x34133f4>
 3418640: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418644: 9118e108     	add	x8, x8, #0x638
 3418648: f900091f     	str	xzr, [x8, #0x10]
 341864c: aa0803e9     	mov	x9, x8
 3418650: f8008d3f     	str	xzr, [x9, #0x8]!
 3418654: f9000109     	str	x9, [x8]
 3418658: 52800035     	mov	w21, #0x1               ; =1
 341865c: 089ffe95     	stlrb	w21, [x20]
 3418660: f005c680     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3418664: 9127c000     	add	x0, x0, #0x9f0
 3418668: 952fb099     	bl	0x80048cc <_ChromeMain+0x7fff630>
 341866c: 350018a0     	cbnz	w0, 0x3418980 <_ChromeMain+0x34136e4>
 3418670: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418674: 39594514     	ldrb	w20, [x8, #0x651]
 3418678: 39194515     	strb	w21, [x8, #0x651]
 341867c: f005c680     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 3418680: 9127c000     	add	x0, x0, #0x9f0
 3418684: 952fb0a0     	bl	0x8004904 <_ChromeMain+0x7fff668>
 3418688: 350016c0     	cbnz	w0, 0x3418960 <_ChromeMain+0x34136c4>
 341868c: 37101134     	tbnz	w20, #0x2, 0x34188b0 <_ChromeMain+0x3413614>
 3418690: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418694: f9432100     	ldr	x0, [x8, #0x640]
 3418698: b4000460     	cbz	x0, 0x3418724 <_ChromeMain+0x3413488>
 341869c: aa0003f4     	mov	x20, x0
 34186a0: f9401288     	ldr	x8, [x20, #0x20]
 34186a4: eb08027f     	cmp	x19, x8
 34186a8: 54001263     	b.lo	0x34188f4 <_ChromeMain+0x3413658>
 34186ac: eb13011f     	cmp	x8, x19
 34186b0: 54001283     	b.lo	0x3418900 <_ChromeMain+0x3413664>
 34186b4: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 34186b8: 91190108     	add	x8, x8, #0x640
 34186bc: eb08029f     	cmp	x20, x8
 34186c0: 54000320     	b.eq	0x3418724 <_ChromeMain+0x3413488>
 34186c4: 91008295     	add	x21, x20, #0x20
 34186c8: f9400689     	ldr	x9, [x20, #0x8]
 34186cc: b5001069     	cbnz	x9, 0x34188d8 <_ChromeMain+0x341363c>
 34186d0: aa1403e8     	mov	x8, x20
 34186d4: aa0803e9     	mov	x9, x8
 34186d8: f9400908     	ldr	x8, [x8, #0x10]
 34186dc: f940010a     	ldr	x10, [x8]
 34186e0: eb0a013f     	cmp	x9, x10
 34186e4: 54ffff81     	b.ne	0x34186d4 <_ChromeMain+0x3413438>
 34186e8: f005c949     	adrp	x9, 0xed43000 <dyld_stub_binder+0xed43000>
 34186ec: f9431d2a     	ldr	x10, [x9, #0x638]
 34186f0: eb14015f     	cmp	x10, x20
 34186f4: 54000041     	b.ne	0x34186fc <_ChromeMain+0x3413460>
 34186f8: f9031d28     	str	x8, [x9, #0x638]
 34186fc: f005c948     	adrp	x8, 0xed43000 <dyld_stub_binder+0xed43000>
 3418700: f9432509     	ldr	x9, [x8, #0x648]
 3418704: d1000529     	sub	x9, x9, #0x1
 3418708: f9032509     	str	x9, [x8, #0x648]
 341870c: aa1403e1     	mov	x1, x20
 3418710: 9733baef     	bl	0x1072cc <_ChromeMain+0x102030>
 3418714: b4000eb5     	cbz	x21, 0x34188e8 <_ChromeMain+0x341364c>
 3418718: aa1403e0     	mov	x0, x20
 341871c: 52800501     	mov	w1, #0x28               ; =40
 3418720: 972fc1e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418724: f9005a7f     	str	xzr, [x19, #0xb0]
 3418728: f9405668     	ldr	x8, [x19, #0xa8]
 341872c: b4000168     	cbz	x8, 0x3418758 <_ChromeMain+0x34134bc>
 3418730: 52800029     	mov	w9, #0x1                ; =1
 3418734: 19004109     	stlurb	w9, [x8, #0x4]
 3418738: f9405660     	ldr	x0, [x19, #0xa8]
 341873c: b40000e0     	cbz	x0, 0x3418758 <_ChromeMain+0x34134bc>
 3418740: 12800008     	mov	w8, #-0x1               ; =-1
 3418744: b8e80008     	ldaddal	w8, w8, [x0]
 3418748: 7100051f     	cmp	w8, #0x1
 341874c: 54000061     	b.ne	0x3418758 <_ChromeMain+0x34134bc>
 3418750: 52800101     	mov	w1, #0x8                ; =8
 3418754: 972fc1d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418758: 91022260     	add	x0, x19, #0x88
 341875c: 979c603e     	bl	0x1b30854 <_ChromeMain+0x1b2b5b8>
 3418760: f9404260     	ldr	x0, [x19, #0x80]
 3418764: f900427f     	str	xzr, [x19, #0x80]
 3418768: b4000080     	cbz	x0, 0x3418778 <_ChromeMain+0x34134dc>
 341876c: 97c47017     	bl	0x25347c8 <_ChromeMain+0x252f52c>
 3418770: 52800301     	mov	w1, #0x18               ; =24
 3418774: 972fc1d1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418778: f9403e74     	ldr	x20, [x19, #0x78]
 341877c: f9003e7f     	str	xzr, [x19, #0x78]
 3418780: b40000f4     	cbz	x20, 0x341879c <_ChromeMain+0x3413500>
 3418784: 97d0533f     	bl	0x282d480 <_ChromeMain+0x28281e4>
 3418788: 29400a81     	ldp	w1, w2, [x20]
 341878c: 97d5a49d     	bl	0x2981a00 <_ChromeMain+0x297c764>
 3418790: aa1403e0     	mov	x0, x20
 3418794: 52800101     	mov	w1, #0x8                ; =8
 3418798: 972fc1c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 341879c: f9402e75     	ldr	x21, [x19, #0x58]
 34187a0: b5000bb5     	cbnz	x21, 0x3418914 <_ChromeMain+0x3413678>
 34187a4: f9402274     	ldr	x20, [x19, #0x40]
 34187a8: b50005b4     	cbnz	x20, 0x341885c <_ChromeMain+0x34135c0>
 34187ac: f9401a60     	ldr	x0, [x19, #0x30]
 34187b0: b5000480     	cbnz	x0, 0x3418840 <_ChromeMain+0x34135a4>
 34187b4: f9401260     	ldr	x0, [x19, #0x20]
 34187b8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 34187bc: d005bcd4     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 34187c0: f9404689     	ldr	x9, [x20, #0x88]
 34187c4: eb09011f     	cmp	x8, x9
 34187c8: 54000920     	b.eq	0x34188ec <_ChromeMain+0x3413650>
 34187cc: f900127f     	str	xzr, [x19, #0x20]
 34187d0: f9400e60     	ldr	x0, [x19, #0x18]
 34187d4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 34187d8: f9404689     	ldr	x9, [x20, #0x88]
 34187dc: eb09011f     	cmp	x8, x9
 34187e0: 54000041     	b.ne	0x34187e8 <_ChromeMain+0x341354c>
 34187e4: 97302896     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 34187e8: f00574e8     	adrp	x8, 0xe2b7000 <dyld_stub_binder+0xe2b7000>
 34187ec: 913c2108     	add	x8, x8, #0xf08
 34187f0: f9000268     	str	x8, [x19]
 34187f4: a9017e7f     	stp	xzr, xzr, [x19, #0x10]
 34187f8: f9400668     	ldr	x8, [x19, #0x8]
 34187fc: b4000168     	cbz	x8, 0x3418828 <_ChromeMain+0x341358c>
 3418800: 52800029     	mov	w9, #0x1                ; =1
 3418804: 19004109     	stlurb	w9, [x8, #0x4]
 3418808: f9400660     	ldr	x0, [x19, #0x8]
 341880c: b40000e0     	cbz	x0, 0x3418828 <_ChromeMain+0x341358c>
 3418810: 12800008     	mov	w8, #-0x1               ; =-1
 3418814: b8e80008     	ldaddal	w8, w8, [x0]
 3418818: 7100051f     	cmp	w8, #0x1
 341881c: 54000061     	b.ne	0x3418828 <_ChromeMain+0x341358c>
 3418820: 52800101     	mov	w1, #0x8                ; =8
 3418824: 972fc1a5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 3418828: aa1303e0     	mov	x0, x19
 341882c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 3418830: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 3418834: a94157f6     	ldp	x22, x21, [sp, #0x10]
 3418838: 910103ff     	add	sp, sp, #0x40
 341883c: d65f03c0     	ret
 3418840: 12800008     	mov	w8, #-0x1               ; =-1
 3418844: b8e80008     	ldaddal	w8, w8, [x0]
 3418848: 7100051f     	cmp	w8, #0x1
 341884c: 54fffb41     	b.ne	0x34187b4 <_ChromeMain+0x3413518>
 3418850: f9400808     	ldr	x8, [x0, #0x10]
 3418854: d63f0100     	blr	x8
 3418858: 17ffffd7     	b	0x34187b4 <_ChromeMain+0x3413518>
 341885c: f9402668     	ldr	x8, [x19, #0x48]
 3418860: d379e109     	lsl	x9, x8, #7
 3418864: b4000229     	cbz	x9, 0x34188a8 <_ChromeMain+0x341360c>
 3418868: 8b140129     	add	x9, x9, x20
 341886c: d1020120     	sub	x0, x9, #0x80
 3418870: cb081ff5     	neg	x21, x8, lsl #7
 3418874: b40003a0     	cbz	x0, 0x34188e8 <_ChromeMain+0x341364c>
 3418878: 97f30022     	bl	0x30d8900 <_ChromeMain+0x30d3664>
 341887c: d1020000     	sub	x0, x0, #0x80
 3418880: b10202b5     	adds	x21, x21, #0x80
 3418884: 54ffff81     	b.ne	0x3418874 <_ChromeMain+0x34135d8>
 3418888: f9402260     	ldr	x0, [x19, #0x40]
 341888c: cb000288     	sub	x8, x20, x0
 3418890: 9347fd08     	asr	x8, x8, #7
 3418894: f9002668     	str	x8, [x19, #0x48]
 3418898: f9402a68     	ldr	x8, [x19, #0x50]
 341889c: d379e101     	lsl	x1, x8, #7
 34188a0: 972fc186     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34188a4: 17ffffc2     	b	0x34187ac <_ChromeMain+0x3413510>
 34188a8: aa1403e0     	mov	x0, x20
 34188ac: 17fffff8     	b	0x341888c <_ChromeMain+0x34135f0>
 34188b0: f005c680     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 34188b4: 9128c000     	add	x0, x0, #0xa30
 34188b8: 952fb016     	bl	0x8004910 <_ChromeMain+0x7fff674>
 34188bc: 34ffeea0     	cbz	w0, 0x3418690 <_ChromeMain+0x34133f4>
 34188c0: 900556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 34188c4: 911c4d08     	add	x8, x8, #0x713
 34188c8: f90003e8     	str	x8, [sp]
 34188cc: 900556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 34188d0: 911c9c00     	add	x0, x0, #0x727
 34188d4: 952fb012     	bl	0x800491c <_ChromeMain+0x7fff680>
 34188d8: aa0903e8     	mov	x8, x9
 34188dc: f9400129     	ldr	x9, [x9]
 34188e0: b5ffffc9     	cbnz	x9, 0x34188d8 <_ChromeMain+0x341363c>
 34188e4: 17ffff81     	b	0x34186e8 <_ChromeMain+0x341344c>
 34188e8: d4200020     	brk	#0x1
 34188ec: 97303856     	bl	0x26a44 <_ChromeMain+0x217a8>
 34188f0: 17ffffb7     	b	0x34187cc <_ChromeMain+0x3413530>
 34188f4: f9400294     	ldr	x20, [x20]
 34188f8: b5ffed54     	cbnz	x20, 0x34186a0 <_ChromeMain+0x3413404>
 34188fc: 17ffff8a     	b	0x3418724 <_ChromeMain+0x3413488>
 3418900: f9400694     	ldr	x20, [x20, #0x8]
 3418904: b5ffecf4     	cbnz	x20, 0x34186a0 <_ChromeMain+0x3413404>
 3418908: 17ffff87     	b	0x3418724 <_ChromeMain+0x3413488>
 341890c: aa1503e0     	mov	x0, x21
 3418910: 1400000d     	b	0x3418944 <_ChromeMain+0x34136a8>
 3418914: f9403269     	ldr	x9, [x19, #0x60]
 3418918: d37df128     	lsl	x8, x9, #3
 341891c: b4ffff88     	cbz	x8, 0x341890c <_ChromeMain+0x3413670>
 3418920: cb090ff6     	neg	x22, x9, lsl #3
 3418924: 8b150108     	add	x8, x8, x21
 3418928: d1002114     	sub	x20, x8, #0x8
 341892c: aa1403e0     	mov	x0, x20
 3418930: 94e7d5e0     	bl	0x6e0e0b0 <_ChromeMain+0x6e08e14>
 3418934: d1002294     	sub	x20, x20, #0x8
 3418938: 910022d6     	add	x22, x22, #0x8
 341893c: b5ffff96     	cbnz	x22, 0x341892c <_ChromeMain+0x3413690>
 3418940: f9402e60     	ldr	x0, [x19, #0x58]
 3418944: cb0002a8     	sub	x8, x21, x0
 3418948: 9343fd08     	asr	x8, x8, #3
 341894c: f9003268     	str	x8, [x19, #0x60]
 3418950: f9403668     	ldr	x8, [x19, #0x68]
 3418954: d37df101     	lsl	x1, x8, #3
 3418958: 972fc158     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 341895c: 17ffff92     	b	0x34187a4 <_ChromeMain+0x3413508>
 3418960: 900556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418964: 911c4d08     	add	x8, x8, #0x713
 3418968: f90003e8     	str	x8, [sp]
 341896c: 900556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418970: 911be000     	add	x0, x0, #0x6f8
 3418974: 952fafea     	bl	0x800491c <_ChromeMain+0x7fff680>
 3418978: 17ffffdc     	b	0x34188e8 <_ChromeMain+0x341364c>
 341897c: 952fb052     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 3418980: 900556e8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418984: 911c4d08     	add	x8, x8, #0x713
 3418988: f90003e8     	str	x8, [sp]
 341898c: 900556e0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 3418990: 911b7400     	add	x0, x0, #0x6dd
 3418994: 952fafe2     	bl	0x800491c <_ChromeMain+0x7fff680>
