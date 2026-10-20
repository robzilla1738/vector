
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42653d0: d10603ff     	sub	sp, sp, #0x180
 42653d4: a9126ffc     	stp	x28, x27, [sp, #0x120]
 42653d8: a91367fa     	stp	x26, x25, [sp, #0x130]
 42653dc: a9145ff8     	stp	x24, x23, [sp, #0x140]
 42653e0: a91557f6     	stp	x22, x21, [sp, #0x150]
 42653e4: a9164ff4     	stp	x20, x19, [sp, #0x160]
 42653e8: a9177bfd     	stp	x29, x30, [sp, #0x170]
 42653ec: 9105c3fd     	add	x29, sp, #0x170
 42653f0: f004ee09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42653f4: f940f929     	ldr	x9, [x9, #0x1f0]
 42653f8: f9400129     	ldr	x9, [x9]
 42653fc: f81983a9     	stur	x9, [x29, #-0x68]
 4265400: d005320b     	adrp	x11, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4265404: 910c816b     	add	x11, x11, #0x320
 4265408: d0053215     	adrp	x21, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 426540c: 911102b5     	add	x21, x21, #0x440
 4265410: a9007d1f     	stp	xzr, xzr, [x8]
 4265414: f900091f     	str	xzr, [x8, #0x10]
 4265418: f90003e8     	str	x8, [sp]
 426541c: 14000028     	b	0x42654bc <_ChromeMain+0x4260220>
 4265420: f9400013     	ldr	x19, [x0]
 4265424: f9400fe1     	ldr	x1, [sp, #0x18]
 4265428: 940001a1     	bl	0x4265aac <_ChromeMain+0x4260810>
 426542c: d0053215     	adrp	x21, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4265430: 911102b5     	add	x21, x21, #0x440
 4265434: f9400feb     	ldr	x11, [sp, #0x18]
 4265438: 52800308     	mov	w8, #0x18               ; =24
 426543c: 9b084e88     	madd	x8, x20, x8, x19
 4265440: 9100610a     	add	x10, x8, #0x18
 4265444: f94003e8     	ldr	x8, [sp]
 4265448: f9400109     	ldr	x9, [x8]
 426544c: eb090149     	subs	x9, x10, x9
 4265450: 9343fd29     	asr	x9, x9, #3
 4265454: b201f3ea     	mov	x10, #-0x5555555555555556 ; =-6148914691236517206
 4265458: f295556a     	movk	x10, #0xaaab
 426545c: 9b0a7d29     	mul	x9, x9, x10
 4265460: f9000509     	str	x9, [x8, #0x8]
 4265464: 54002c00     	b.eq	0x42659e4 <_ChromeMain+0x4260748>
 4265468: 14000012     	b	0x42654b0 <_ChromeMain+0x4260214>
 426546c: aa1703e0     	mov	x0, x23
 4265470: 94f678bb     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265474: aa1703e0     	mov	x0, x23
 4265478: 94f678b9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426547c: aa1b03e0     	mov	x0, x27
 4265480: 94f678b7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265484: f94013e0     	ldr	x0, [sp, #0x20]
 4265488: 94f678b5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426548c: f94007e0     	ldr	x0, [sp, #0x8]
 4265490: 94f678b3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265494: f9400feb     	ldr	x11, [sp, #0x18]
 4265498: d0053215     	adrp	x21, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 426549c: 911102b5     	add	x21, x21, #0x440
 42654a0: 14000004     	b	0x42654b0 <_ChromeMain+0x4260214>
 42654a4: aa1403e0     	mov	x0, x20
 42654a8: 94f678ad     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42654ac: f9400feb     	ldr	x11, [sp, #0x18]
 42654b0: 9100816b     	add	x11, x11, #0x20
 42654b4: eb15017f     	cmp	x11, x21
 42654b8: 540027a0     	b.eq	0x42659ac <_ChromeMain+0x4260710>
 42654bc: f9400d62     	ldr	x2, [x11, #0x18]
 42654c0: b4ffff82     	cbz	x2, 0x42654b0 <_ChromeMain+0x4260214>
 42654c4: f9000feb     	str	x11, [sp, #0x18]
 42654c8: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42654cc: f9433500     	ldr	x0, [x8, #0x668]
 42654d0: 95801cd2     	bl	0xa26c818 <_ChromeMain+0xa26757c>
 42654d4: 94f67899     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42654d8: aa0003f4     	mov	x20, x0
 42654dc: 958859fe     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 42654e0: b4fffe20     	cbz	x0, 0x42654a4 <_ChromeMain+0x4260208>
 42654e4: aa1403e0     	mov	x0, x20
 42654e8: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 42654ec: 91236042     	add	x2, x2, #0x8d8
 42654f0: 95801cd6     	bl	0xa26c848 <_ChromeMain+0xa2675ac>
 42654f4: 35000100     	cbnz	w0, 0x4265514 <_ChromeMain+0x4260278>
 42654f8: aa1403e0     	mov	x0, x20
 42654fc: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4265500: 91236042     	add	x2, x2, #0x8d8
 4265504: 95c9797d     	bl	0xb4c3af8 <_ChromeMain+0xb4be85c>
 4265508: 94f6788c     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426550c: f90013e0     	str	x0, [sp, #0x20]
 4265510: 14000004     	b	0x4265520 <_ChromeMain+0x4260284>
 4265514: aa1403e0     	mov	x0, x20
 4265518: 94f67894     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 426551c: f90013f4     	str	x20, [sp, #0x20]
 4265520: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4265524: f9453900     	ldr	x0, [x8, #0xa70]
 4265528: 95ac88cd     	bl	0xad8785c <_ChromeMain+0xad825c0>
 426552c: 94f67883     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265530: aa0003fb     	mov	x27, x0
 4265534: d10203a8     	sub	x8, x29, #0x80
 4265538: 90054669     	adrp	x9, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426553c: 9123e129     	add	x9, x9, #0x8f8
 4265540: f9000109     	str	x9, [x8]
 4265544: 95908fc1     	bl	0xa689448 <_ChromeMain+0xa6841ac>
 4265548: 94f6787c     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426554c: aa0003f3     	mov	x19, x0
 4265550: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4265554: 91246042     	add	x2, x2, #0x918
 4265558: 95fffcc6     	bl	0xc264870 <_ChromeMain+0xc25f5d4>
 426555c: 94f67877     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265560: aa0003f5     	mov	x21, x0
 4265564: d10203a8     	sub	x8, x29, #0x80
 4265568: 90054669     	adrp	x9, 0xeb31000 <dyld_stub_binder+0xeb31000>
 426556c: 9124e129     	add	x9, x9, #0x938
 4265570: a900a500     	stp	x0, x9, [x8, #0x8]
 4265574: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4265578: f9433100     	ldr	x0, [x8, #0x660]
 426557c: d10203a2     	sub	x2, x29, #0x80
 4265580: 52800063     	mov	w3, #0x3                ; =3
 4265584: 9586e899     	bl	0xa41f7e8 <_ChromeMain+0xa41a54c>
 4265588: 94f6786c     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 426558c: aa0003f7     	mov	x23, x0
 4265590: aa1503e0     	mov	x0, x21
 4265594: 94f67872     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265598: aa1303e0     	mov	x0, x19
 426559c: 94f67870     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42655a0: 6f00e400     	movi.2d	v0, #0000000000000000
 42655a4: ad0283e0     	stp	q0, q0, [sp, #0x50]
 42655a8: ad0183e0     	stp	q0, q0, [sp, #0x30]
 42655ac: aa1703e0     	mov	x0, x23
 42655b0: 94f6786e     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 42655b4: 9100c3e2     	add	x2, sp, #0x30
 42655b8: 9101c3e3     	add	x3, sp, #0x70
 42655bc: 52800204     	mov	w4, #0x10               ; =16
 42655c0: 9523df5a     	bl	0x8b5d328 <_ChromeMain+0x8b5808c>
 42655c4: aa0003f6     	mov	x22, x0
 42655c8: f90007f4     	str	x20, [sp, #0x8]
 42655cc: b4fff500     	cbz	x0, 0x426546c <_ChromeMain+0x42601d0>
 42655d0: f94023e8     	ldr	x8, [sp, #0x40]
 42655d4: f9400114     	ldr	x20, [x8]
 42655d8: f9000bf7     	str	x23, [sp, #0x10]
 42655dc: 14000009     	b	0x4265600 <_ChromeMain+0x4260364>
 42655e0: 9100c3e2     	add	x2, sp, #0x30
 42655e4: 9101c3e3     	add	x3, sp, #0x70
 42655e8: f9400bf7     	ldr	x23, [sp, #0x10]
 42655ec: aa1703e0     	mov	x0, x23
 42655f0: 52800204     	mov	w4, #0x10               ; =16
 42655f4: 9523df4d     	bl	0x8b5d328 <_ChromeMain+0x8b5808c>
 42655f8: aa0003f6     	mov	x22, x0
 42655fc: b4fff380     	cbz	x0, 0x426546c <_ChromeMain+0x42601d0>
 4265600: d280001a     	mov	x26, #0x0               ; =0
 4265604: 1400000c     	b	0x4265634 <_ChromeMain+0x4260398>
 4265608: aa1303e0     	mov	x0, x19
 426560c: 94f67854     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265610: aa1703e0     	mov	x0, x23
 4265614: 94f67852     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265618: aa1503e0     	mov	x0, x21
 426561c: 94f67850     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265620: aa1503e0     	mov	x0, x21
 4265624: 94f6784e     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265628: 9100075a     	add	x26, x26, #0x1
 426562c: eb1a02df     	cmp	x22, x26
 4265630: 54fffd80     	b.eq	0x42655e0 <_ChromeMain+0x4260344>
 4265634: f94023e8     	ldr	x8, [sp, #0x40]
 4265638: f9400108     	ldr	x8, [x8]
 426563c: eb14011f     	cmp	x8, x20
 4265640: 54000060     	b.eq	0x426564c <_ChromeMain+0x42603b0>
 4265644: f9400be0     	ldr	x0, [sp, #0x10]
 4265648: 9523e09a     	bl	0x8b5d8b0 <_ChromeMain+0x8b58614>
 426564c: f9401fe8     	ldr	x8, [sp, #0x38]
 4265650: f87a7900     	ldr	x0, [x8, x26, lsl #3]
 4265654: f94013e2     	ldr	x2, [sp, #0x20]
 4265658: 95fffc86     	bl	0xc264870 <_ChromeMain+0xc25f5d4>
 426565c: 94f67837     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265660: aa0003f5     	mov	x21, x0
 4265664: 3900bfff     	strb	wzr, [sp, #0x2f]
 4265668: 9100bfe3     	add	x3, sp, #0x2f
 426566c: aa1b03e0     	mov	x0, x27
 4265670: aa1503e2     	mov	x2, x21
 4265674: 95fffc82     	bl	0xc26487c <_ChromeMain+0xc25f5e0>
 4265678: 3940bfe8     	ldrb	w8, [sp, #0x2f]
 426567c: 6a08001f     	tst	w0, w8
 4265680: 54fffd00     	b.eq	0x4265620 <_ChromeMain+0x4260384>
 4265684: f9400fe8     	ldr	x8, [sp, #0x18]
 4265688: f9400513     	ldr	x19, [x8, #0x8]
 426568c: b5000073     	cbnz	x19, 0x4265698 <_ChromeMain+0x42603fc>
 4265690: f9400908     	ldr	x8, [x8, #0x10]
 4265694: b4000c68     	cbz	x8, 0x4265820 <_ChromeMain+0x4260584>
 4265698: aa1503e0     	mov	x0, x21
 426569c: 94f67833     	bl	0x8003768 <_ChromeMain+0x7ffe4cc>
 42656a0: 9588598d     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 42656a4: b4fffba0     	cbz	x0, 0x4265618 <_ChromeMain+0x426037c>
 42656a8: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42656ac: f9433900     	ldr	x0, [x8, #0x670]
 42656b0: aa1503e2     	mov	x2, x21
 42656b4: 94f67824     	bl	0x8003744 <_ChromeMain+0x7ffe4a8>
 42656b8: 94f67820     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42656bc: aa0003f8     	mov	x24, x0
 42656c0: 94f67824     	bl	0x8003750 <_ChromeMain+0x7ffe4b4>
 42656c4: 94f6781d     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42656c8: aa0003f7     	mov	x23, x0
 42656cc: aa1803e0     	mov	x0, x24
 42656d0: 94f67823     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42656d4: aa1703e0     	mov	x0, x23
 42656d8: 9588597f     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 42656dc: b5000560     	cbnz	x0, 0x4265788 <_ChromeMain+0x42604ec>
 42656e0: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42656e4: f9435d18     	ldr	x24, [x8, #0x6b8]
 42656e8: aa1503e0     	mov	x0, x21
 42656ec: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 42656f0: 91256042     	add	x2, x2, #0x958
 42656f4: 95fffc5f     	bl	0xc264870 <_ChromeMain+0xc25f5d4>
 42656f8: 94f67810     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42656fc: aa0003f9     	mov	x25, x0
 4265700: aa1803e0     	mov	x0, x24
 4265704: aa1903e2     	mov	x2, x25
 4265708: 95fffcfe     	bl	0xc264b00 <_ChromeMain+0xc25f864>
 426570c: 94f6780b     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265710: aa0003f8     	mov	x24, x0
 4265714: aa1903e0     	mov	x0, x25
 4265718: 94f67811     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426571c: aa1803e0     	mov	x0, x24
 4265720: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4265724: 9125e042     	add	x2, x2, #0x978
 4265728: 9523e579     	bl	0x8b5ed0c <_ChromeMain+0x8b59a70>
 426572c: 94f67803     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265730: aa0003f9     	mov	x25, x0
 4265734: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4265738: f9433500     	ldr	x0, [x8, #0x668]
 426573c: 95123420     	bl	0x86f27bc <_ChromeMain+0x86ed520>
 4265740: aa0003e2     	mov	x2, x0
 4265744: aa1903e0     	mov	x0, x25
 4265748: 95123420     	bl	0x86f27c8 <_ChromeMain+0x86ed52c>
 426574c: aa0003fc     	mov	x28, x0
 4265750: aa1903e0     	mov	x0, x25
 4265754: 94f67802     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265758: 3400015c     	cbz	w28, 0x4265780 <_ChromeMain+0x42604e4>
 426575c: aa1803e0     	mov	x0, x24
 4265760: 90054662     	adrp	x2, 0xeb31000 <dyld_stub_binder+0xeb31000>
 4265764: 9125e042     	add	x2, x2, #0x978
 4265768: 9523e569     	bl	0x8b5ed0c <_ChromeMain+0x8b59a70>
 426576c: 94f677f3     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4265770: aa0003f9     	mov	x25, x0
 4265774: aa1703e0     	mov	x0, x23
 4265778: 94f677f9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426577c: aa1903f7     	mov	x23, x25
 4265780: aa1803e0     	mov	x0, x24
 4265784: 94f677f6     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265788: aa1703e0     	mov	x0, x23
 426578c: 95885952     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 4265790: b4fff400     	cbz	x0, 0x4265610 <_ChromeMain+0x4260374>
 4265794: b40001f3     	cbz	x19, 0x42657d0 <_ChromeMain+0x4260534>
 4265798: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 426579c: f9433500     	ldr	x0, [x8, #0x668]
 42657a0: aa1303e2     	mov	x2, x19
 42657a4: 95801c1d     	bl	0xa26c818 <_ChromeMain+0xa26757c>
 42657a8: 94f677e4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42657ac: aa0003f3     	mov	x19, x0
 42657b0: 95885949     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 42657b4: b40000a0     	cbz	x0, 0x42657c8 <_ChromeMain+0x426052c>
 42657b8: aa1703e0     	mov	x0, x23
 42657bc: aa1303e2     	mov	x2, x19
 42657c0: 959f7d7a     	bl	0xaa44da8 <_ChromeMain+0xaa3fb0c>
 42657c4: 37000220     	tbnz	w0, #0x0, 0x4265808 <_ChromeMain+0x426056c>
 42657c8: aa1303e0     	mov	x0, x19
 42657cc: 94f677e4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42657d0: f9400fe8     	ldr	x8, [sp, #0x18]
 42657d4: f9400902     	ldr	x2, [x8, #0x10]
 42657d8: b4fff1c2     	cbz	x2, 0x4265610 <_ChromeMain+0x4260374>
 42657dc: 90055448     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 42657e0: f9433500     	ldr	x0, [x8, #0x668]
 42657e4: 95801c0d     	bl	0xa26c818 <_ChromeMain+0xa26757c>
 42657e8: 94f677d4     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 42657ec: aa0003f3     	mov	x19, x0
 42657f0: 95885939     	bl	0xa47bcd4 <_ChromeMain+0xa476a38>
 42657f4: b4fff0a0     	cbz	x0, 0x4265608 <_ChromeMain+0x426036c>
 42657f8: aa1703e0     	mov	x0, x23
 42657fc: aa1303e2     	mov	x2, x19
 4265800: 959f7d6a     	bl	0xaa44da8 <_ChromeMain+0xaa3fb0c>
 4265804: 3607f020     	tbz	w0, #0x0, 0x4265608 <_ChromeMain+0x426036c>
 4265808: aa1303e0     	mov	x0, x19
 426580c: 94f677d4     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265810: aa1703e0     	mov	x0, x23
 4265814: 94f677d2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265818: aa1503e0     	mov	x0, x21
 426581c: 94f677d0     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265820: aa1503e0     	mov	x0, x21
 4265824: 94f677ce     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265828: f9400bf3     	ldr	x19, [sp, #0x10]
 426582c: aa1303e0     	mov	x0, x19
 4265830: 94f677cb     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265834: aa1303e0     	mov	x0, x19
 4265838: 94f677c9     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426583c: aa1b03e0     	mov	x0, x27
 4265840: 94f677c7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265844: f94013e0     	ldr	x0, [sp, #0x20]
 4265848: 94f677c5     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 426584c: f94007e0     	ldr	x0, [sp, #0x8]
 4265850: 94f677c3     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4265854: f94003e0     	ldr	x0, [sp]
 4265858: a940a014     	ldp	x20, x8, [x0, #0x8]
 426585c: eb08029f     	cmp	x20, x8
 4265860: 54ffde01     	b.ne	0x4265420 <_ChromeMain+0x4260184>
 4265864: 91000689     	add	x9, x20, #0x1
 4265868: b201f3eb     	mov	x11, #-0x5555555555555556 ; =-6148914691236517206
 426586c: f2e1554b     	movk	x11, #0xaaa, lsl #48
 4265870: eb0b013f     	cmp	x9, x11
 4265874: 54001028     	b.hi	0x4265a78 <_ChromeMain+0x42607dc>
 4265878: d37ff90a     	lsl	x10, x8, #1
 426587c: eb09015f     	cmp	x10, x9
 4265880: 9a898149     	csel	x9, x10, x9, hi
 4265884: b200f3ea     	mov	x10, #0x5555555555555555 ; =6148914691236517205
 4265888: f2e0aaaa     	movk	x10, #0x555, lsl #48
 426588c: eb0a011f     	cmp	x8, x10
 4265890: 9a8b3139     	csel	x25, x9, x11, lo
 4265894: b201f3e8     	mov	x8, #-0x5555555555555556 ; =-6148914691236517206
 4265898: f2e15548     	movk	x8, #0xaaa, lsl #48
 426589c: f9400fe9     	ldr	x9, [sp, #0x18]
 42658a0: b4000719     	cbz	x25, 0x4265980 <_ChromeMain+0x42606e4>
 42658a4: eb08033f     	cmp	x25, x8
 42658a8: 54000ea8     	b.hi	0x4265a7c <_ChromeMain+0x42607e0>
 42658ac: 8b190728     	add	x8, x25, x25, lsl #1
 42658b0: d37df100     	lsl	x0, x8, #3
 42658b4: 96f6a6ad     	bl	0xf368 <_ChromeMain+0xa0cc>
 42658b8: aa0003f3     	mov	x19, x0
 42658bc: f9400fe9     	ldr	x9, [sp, #0x18]
 42658c0: 52800308     	mov	w8, #0x18               ; =24
 42658c4: 9b084e9a     	madd	x26, x20, x8, x19
 42658c8: b40008fa     	cbz	x26, 0x42659e4 <_ChromeMain+0x4260748>
 42658cc: f9400135     	ldr	x21, [x9]
 42658d0: b40008b5     	cbz	x21, 0x42659e4 <_ChromeMain+0x4260748>
 42658d4: aa1503e0     	mov	x0, x21
 42658d8: 94f676b1     	bl	0x800339c <_ChromeMain+0x7ffe100>
 42658dc: 92800208     	mov	x8, #-0x11              ; =-17
 42658e0: f2efffe8     	movk	x8, #0x7fff, lsl #48
 42658e4: eb08001f     	cmp	x0, x8
 42658e8: 54000dc2     	b.hs	0x4265aa0 <_ChromeMain+0x4260804>
 42658ec: aa0003f6     	mov	x22, x0
 42658f0: f100581f     	cmp	x0, #0x16
 42658f4: 540004a8     	b.hi	0x4265988 <_ChromeMain+0x42606ec>
 42658f8: 39005f56     	strb	w22, [x26, #0x17]
 42658fc: aa1a03f7     	mov	x23, x26
 4265900: 8b1602e8     	add	x8, x23, x22
 4265904: eb17011f     	cmp	x8, x23
 4265908: 540006e3     	b.lo	0x42659e4 <_ChromeMain+0x4260748>
 426590c: eb1702bf     	cmp	x21, x23
 4265910: 54000063     	b.lo	0x426591c <_ChromeMain+0x4260680>
 4265914: eb0802bf     	cmp	x21, x8
 4265918: 54000663     	b.lo	0x42659e4 <_ChromeMain+0x4260748>
 426591c: aa1703e0     	mov	x0, x23
 4265920: aa1503e1     	mov	x1, x21
 4265924: aa1603e2     	mov	x2, x22
 4265928: 94f6a669     	bl	0x800f2cc <_ChromeMain+0x800a030>
 426592c: 38366aff     	strb	wzr, [x23, x22]
 4265930: f94003f6     	ldr	x22, [sp]
 4265934: a94022c1     	ldp	x1, x8, [x22]
 4265938: 928002e9     	mov	x9, #-0x18              ; =-24
 426593c: 9b096915     	madd	x21, x8, x9, x26
 4265940: 8b080508     	add	x8, x8, x8, lsl #1
 4265944: d37df102     	lsl	x2, x8, #3
 4265948: aa1503e0     	mov	x0, x21
 426594c: 94f690eb     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4265950: f94002c0     	ldr	x0, [x22]
 4265954: f90002d5     	str	x21, [x22]
 4265958: f9400ac8     	ldr	x8, [x22, #0x10]
 426595c: f9000ad9     	str	x25, [x22, #0x10]
 4265960: b4000080     	cbz	x0, 0x4265970 <_ChromeMain+0x42606d4>
 4265964: 8b080508     	add	x8, x8, x8, lsl #1
 4265968: d37df101     	lsl	x1, x8, #3
 426596c: 96f68d53     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265970: f9400feb     	ldr	x11, [sp, #0x18]
 4265974: d0053215     	adrp	x21, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4265978: 911102b5     	add	x21, x21, #0x440
 426597c: 17fffeaf     	b	0x4265438 <_ChromeMain+0x426019c>
 4265980: d2800013     	mov	x19, #0x0               ; =0
 4265984: 17ffffcf     	b	0x42658c0 <_ChromeMain+0x4260624>
 4265988: 927ceac8     	and	x8, x22, #0x7ffffffffffffff0
 426598c: 91004118     	add	x24, x8, #0x10
 4265990: aa1803e0     	mov	x0, x24
 4265994: 96f6a675     	bl	0xf368 <_ChromeMain+0xa0cc>
 4265998: aa0003f7     	mov	x23, x0
 426599c: b2410308     	orr	x8, x24, #0x8000000000000000
 42659a0: a9005b40     	stp	x0, x22, [x26]
 42659a4: f9000b48     	str	x8, [x26, #0x10]
 42659a8: 17ffffd6     	b	0x4265900 <_ChromeMain+0x4260664>
 42659ac: f85983a8     	ldur	x8, [x29, #-0x68]
 42659b0: f004ee09     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42659b4: f940f929     	ldr	x9, [x9, #0x1f0]
 42659b8: f9400129     	ldr	x9, [x9]
 42659bc: eb08013f     	cmp	x9, x8
 42659c0: 54000601     	b.ne	0x4265a80 <_ChromeMain+0x42607e4>
 42659c4: a9577bfd     	ldp	x29, x30, [sp, #0x170]
 42659c8: a9564ff4     	ldp	x20, x19, [sp, #0x160]
 42659cc: a95557f6     	ldp	x22, x21, [sp, #0x150]
 42659d0: a9545ff8     	ldp	x24, x23, [sp, #0x140]
 42659d4: a95367fa     	ldp	x26, x25, [sp, #0x130]
 42659d8: a9526ffc     	ldp	x28, x27, [sp, #0x120]
 42659dc: 910603ff     	add	sp, sp, #0x180
 42659e0: d65f03c0     	ret
 42659e4: d4200020     	brk	#0x1
 42659e8: 14000003     	b	0x42659f4 <_ChromeMain+0x4260758>
 42659ec: 14000002     	b	0x42659f4 <_ChromeMain+0x4260758>
 42659f0: 14000001     	b	0x42659f4 <_ChromeMain+0x4260758>
 42659f4: aa0003f4     	mov	x20, x0
 42659f8: f94003e8     	ldr	x8, [sp]
 42659fc: f9400113     	ldr	x19, [x8]
 4265a00: b5000073     	cbnz	x19, 0x4265a0c <_ChromeMain+0x4260770>
 4265a04: aa1403e0     	mov	x0, x20
 4265a08: 94f676bf     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 4265a0c: f9400508     	ldr	x8, [x8, #0x8]
 4265a10: 8b080509     	add	x9, x8, x8, lsl #1
 4265a14: d37df129     	lsl	x9, x9, #3
 4265a18: b4000169     	cbz	x9, 0x4265a44 <_ChromeMain+0x42607a8>
 4265a1c: 8b130129     	add	x9, x9, x19
 4265a20: d1006135     	sub	x21, x9, #0x18
 4265a24: d37df109     	lsl	x9, x8, #3
 4265a28: cb081536     	sub	x22, x9, x8, lsl #5
 4265a2c: b4fffdd5     	cbz	x21, 0x42659e4 <_ChromeMain+0x4260748>
 4265a30: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4265a34: 37f80188     	tbnz	w8, #0x1f, 0x4265a64 <_ChromeMain+0x42607c8>
 4265a38: d10062b5     	sub	x21, x21, #0x18
 4265a3c: b10062d6     	adds	x22, x22, #0x18
 4265a40: 54ffff61     	b.ne	0x4265a2c <_ChromeMain+0x4260790>
 4265a44: f94003e8     	ldr	x8, [sp]
 4265a48: f900051f     	str	xzr, [x8, #0x8]
 4265a4c: f9400908     	ldr	x8, [x8, #0x10]
 4265a50: 8b080508     	add	x8, x8, x8, lsl #1
 4265a54: d37df101     	lsl	x1, x8, #3
 4265a58: aa1303e0     	mov	x0, x19
 4265a5c: 96f68d17     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265a60: 17ffffe9     	b	0x4265a04 <_ChromeMain+0x4260768>
 4265a64: f94002a0     	ldr	x0, [x21]
 4265a68: f9400aa8     	ldr	x8, [x21, #0x10]
 4265a6c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4265a70: 96f68d12     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265a74: 17fffff1     	b	0x4265a38 <_ChromeMain+0x426079c>
 4265a78: 9772b8c2     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 4265a7c: 94268169     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4265a80: 94f67a38     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4265a84: aa0003f4     	mov	x20, x0
 4265a88: b4fffb93     	cbz	x19, 0x42659f8 <_ChromeMain+0x426075c>
 4265a8c: 8b190728     	add	x8, x25, x25, lsl #1
 4265a90: d37df101     	lsl	x1, x8, #3
 4265a94: aa1303e0     	mov	x0, x19
 4265a98: 96f68d08     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4265a9c: 17ffffd7     	b	0x42659f8 <_ChromeMain+0x426075c>
 4265aa0: 94266a3b     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 4265aa4: 17ffffd0     	b	0x42659e4 <_ChromeMain+0x4260748>
 4265aa8: 17fffff7     	b	0x4265a84 <_ChromeMain+0x42607e8>
