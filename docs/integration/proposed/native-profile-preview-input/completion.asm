
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467d4c8: 3928669f     	strb	wzr, [x20, #0xa19]
 467d4cc: 19404268     	ldapurb	w8, [x19, #0x4]
 467d4d0: 35001588     	cbnz	w8, 0x467d780 <_ChromeMain+0x46784e4>
 467d4d4: aa1403e0     	mov	x0, x20
 467d4d8: 52800021     	mov	w1, #0x1                ; =1
 467d4dc: 97ff6f98     	bl	0x465933c <_ChromeMain+0x46540a0>
 467d4e0: 340002f5     	cbz	w21, 0x467d53c <_ChromeMain+0x46782a0>
 467d4e4: 19404268     	ldapurb	w8, [x19, #0x4]
 467d4e8: 35001648     	cbnz	w8, 0x467d7b0 <_ChromeMain+0x4678514>
 467d4ec: f945da88     	ldr	x8, [x20, #0xbb0]
 467d4f0: 91000508     	add	x8, x8, #0x1
 467d4f4: f905da88     	str	x8, [x20, #0xbb0]
 467d4f8: 3978e288     	ldrb	w8, [x20, #0xe38]
 467d4fc: 35001288     	cbnz	w8, 0x467d74c <_ChromeMain+0x46784b0>
 467d500: f9072a9f     	str	xzr, [x20, #0xe50]
 467d504: 3977c288     	ldrb	w8, [x20, #0xdf0]
 467d508: 35000be8     	cbnz	w8, 0x467d684 <_ChromeMain+0x46783e8>
 467d50c: f9422e88     	ldr	x8, [x20, #0x458]
 467d510: b4000108     	cbz	x8, 0x467d530 <_ChromeMain+0x4678294>
 467d514: f9432508     	ldr	x8, [x8, #0x648]
 467d518: b40000c8     	cbz	x8, 0x467d530 <_ChromeMain+0x4678294>
 467d51c: f941d909     	ldr	x9, [x8, #0x3b0]
 467d520: d37df135     	lsl	x21, x9, #3
 467d524: b4000075     	cbz	x21, 0x467d530 <_ChromeMain+0x4678294>
 467d528: f941d516     	ldr	x22, [x8, #0x3a8]
 467d52c: 1400002e     	b	0x467d5e4 <_ChromeMain+0x4678348>
 467d530: 91378280     	add	x0, x20, #0xde0
 467d534: 52800001     	mov	w1, #0x0                ; =0
 467d538: 9774850b     	bl	0x239e964 <_ChromeMain+0x23996c8>
 467d53c: 19404268     	ldapurb	w8, [x19, #0x4]
 467d540: 35001268     	cbnz	w8, 0x467d78c <_ChromeMain+0x46784f0>
 467d544: aa1403e0     	mov	x0, x20
 467d548: 529a9801     	mov	w1, #0xd4c0             ; =54464
 467d54c: 72a00021     	movk	w1, #0x1, lsl #16
 467d550: 97b5e174     	bl	0x33f5b20 <_ChromeMain+0x33f0884>
 467d554: 17ffffc4     	b	0x467d464 <_ChromeMain+0x46781c8>
 467d558: 35001208     	cbnz	w8, 0x467d798 <_ChromeMain+0x46784fc>
 467d55c: 3928669f     	strb	wzr, [x20, #0xa19]
 467d560: 340002f5     	cbz	w21, 0x467d5bc <_ChromeMain+0x4678320>
 467d564: 19404268     	ldapurb	w8, [x19, #0x4]
 467d568: 350012a8     	cbnz	w8, 0x467d7bc <_ChromeMain+0x4678520>
 467d56c: f945da88     	ldr	x8, [x20, #0xbb0]
 467d570: 91000508     	add	x8, x8, #0x1
 467d574: f905da88     	str	x8, [x20, #0xbb0]
 467d578: 3978e288     	ldrb	w8, [x20, #0xe38]
 467d57c: 35000ec8     	cbnz	w8, 0x467d754 <_ChromeMain+0x46784b8>
 467d580: f9072a9f     	str	xzr, [x20, #0xe50]
 467d584: 3977c288     	ldrb	w8, [x20, #0xdf0]
 467d588: 35000b08     	cbnz	w8, 0x467d6e8 <_ChromeMain+0x467844c>
 467d58c: f9422e88     	ldr	x8, [x20, #0x458]
 467d590: b4000108     	cbz	x8, 0x467d5b0 <_ChromeMain+0x4678314>
 467d594: f9432508     	ldr	x8, [x8, #0x648]
 467d598: b40000c8     	cbz	x8, 0x467d5b0 <_ChromeMain+0x4678314>
 467d59c: f941d909     	ldr	x9, [x8, #0x3b0]
 467d5a0: d37df135     	lsl	x21, x9, #3
 467d5a4: b4000075     	cbz	x21, 0x467d5b0 <_ChromeMain+0x4678314>
 467d5a8: f941d516     	ldr	x22, [x8, #0x3a8]
 467d5ac: 14000018     	b	0x467d60c <_ChromeMain+0x4678370>
 467d5b0: 91378280     	add	x0, x20, #0xde0
 467d5b4: 52800001     	mov	w1, #0x0                ; =0
 467d5b8: 977484eb     	bl	0x239e964 <_ChromeMain+0x23996c8>
 467d5bc: 19404268     	ldapurb	w8, [x19, #0x4]
 467d5c0: 35000f28     	cbnz	w8, 0x467d7a4 <_ChromeMain+0x4678508>
 467d5c4: aa1403e0     	mov	x0, x20
 467d5c8: 97ff6826     	bl	0x4657660 <_ChromeMain+0x46523c4>
 467d5cc: 17ffffa6     	b	0x467d464 <_ChromeMain+0x46781c8>
 467d5d0: 6f00e400     	movi.2d	v0, #0000000000000000
 467d5d4: 97fd471b     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 467d5d8: 910022d6     	add	x22, x22, #0x8
 467d5dc: f10022b5     	subs	x21, x21, #0x8
 467d5e0: 54fffa80     	b.eq	0x467d530 <_ChromeMain+0x4678294>
 467d5e4: f94002c8     	ldr	x8, [x22]
 467d5e8: b4ffff88     	cbz	x8, 0x467d5d8 <_ChromeMain+0x467833c>
 467d5ec: f941b900     	ldr	x0, [x8, #0x370]
 467d5f0: b4ffff40     	cbz	x0, 0x467d5d8 <_ChromeMain+0x467833c>
 467d5f4: 17fffff7     	b	0x467d5d0 <_ChromeMain+0x4678334>
 467d5f8: 6f00e400     	movi.2d	v0, #0000000000000000
 467d5fc: 97fd4711     	bl	0x45cf240 <_ChromeMain+0x45c9fa4>
 467d600: 910022d6     	add	x22, x22, #0x8
 467d604: f10022b5     	subs	x21, x21, #0x8
 467d608: 54fffd40     	b.eq	0x467d5b0 <_ChromeMain+0x4678314>
 467d60c: f94002c8     	ldr	x8, [x22]
 467d610: b4ffff88     	cbz	x8, 0x467d600 <_ChromeMain+0x4678364>
 467d614: f941b900     	ldr	x0, [x8, #0x370]
 467d618: b4ffff40     	cbz	x0, 0x467d600 <_ChromeMain+0x4678364>
 467d61c: 17fffff7     	b	0x467d5f8 <_ChromeMain+0x467835c>
 467d620: 3935a29f     	strb	wzr, [x20, #0xd68]
 467d624: f946be80     	ldr	x0, [x20, #0xd78]
 467d628: 91356281     	add	x1, x20, #0xd58
 467d62c: 976a3035     	bl	0x2109700 <_ChromeMain+0x2104464>
 467d630: f946ae88     	ldr	x8, [x20, #0xd58]
 467d634: f9401d08     	ldr	x8, [x8, #0x38]
 467d638: 91356280     	add	x0, x20, #0xd58
 467d63c: d63f0100     	blr	x8
