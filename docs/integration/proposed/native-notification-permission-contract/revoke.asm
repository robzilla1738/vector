
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41052a8: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 41052ac: a90157f6     	stp	x22, x21, [sp, #0x10]
 41052b0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41052b4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41052b8: 9100c3fd     	add	x29, sp, #0x30
 41052bc: d10843ff     	sub	sp, sp, #0x210
 41052c0: aa0803f4     	mov	x20, x8
 41052c4: 3940c008     	ldrb	w8, [x0, #0x30]
 41052c8: 36000a28     	tbz	w8, #0x0, 0x410540c <_ChromeMain+0x4100170>
 41052cc: aa0003f3     	mov	x19, x0
 41052d0: 910303f5     	add	x21, sp, #0xc0
 41052d4: 6f00e400     	movi.2d	v0, #0000000000000000
 41052d8: ad0502a0     	stp	q0, q0, [x21, #0xa0]
 41052dc: d10383a8     	sub	x8, x29, #0xe0
 41052e0: 91006000     	add	x0, x0, #0x18
 41052e4: 940b6f25     	bl	0x43e0f78 <_ChromeMain+0x43dbcdc>
 41052e8: 385383a8     	ldurb	w8, [x29, #-0xc8]
 41052ec: 360006a8     	tbz	w8, #0x0, 0x41053c0 <_ChromeMain+0x4100124>
 41052f0: f9400a68     	ldr	x8, [x19, #0x10]
 41052f4: b4000228     	cbz	x8, 0x4105338 <_ChromeMain+0x410009c>
 41052f8: f9404916     	ldr	x22, [x8, #0x90]
 41052fc: 9100a2c0     	add	x0, x22, #0x28
 4105300: 94fc9219     	bl	0x8029b64 <_ChromeMain+0x80248c8>
 4105304: 35000860     	cbnz	w0, 0x4105410 <_ChromeMain+0x4100174>
 4105308: f94036c8     	ldr	x8, [x22, #0x68]
 410530c: f9400508     	ldr	x8, [x8, #0x8]
 4105310: b4000108     	cbz	x8, 0x4105330 <_ChromeMain+0x4100094>
 4105314: b9402109     	ldr	w9, [x8, #0x20]
 4105318: 7101b13f     	cmp	w9, #0x6c
 410531c: 5400006c     	b.gt	0x4105328 <_ChromeMain+0x410008c>
 4105320: 540007e0     	b.eq	0x410541c <_ChromeMain+0x4100180>
 4105324: 91002108     	add	x8, x8, #0x8
 4105328: f9400108     	ldr	x8, [x8]
 410532c: b5ffff48     	cbnz	x8, 0x4105314 <_ChromeMain+0x4100078>
 4105330: 9100a2c0     	add	x0, x22, #0x28
 4105334: 94fbfd74     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4105338: 52800600     	mov	w0, #0x30               ; =48
 410533c: 96fc280b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4105340: f81003a0     	stur	x0, [x29, #-0x100]
 4105344: d004f1a8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4105348: 3dc31100     	ldr	q0, [x8, #0xc40]
 410534c: 3c8882a0     	stur	q0, [x21, #0x88]
 4105350: 9100bc09     	add	x9, x0, #0x2f
 4105354: eb00013f     	cmp	x9, x0
 4105358: 540005a3     	b.lo	0x410540c <_ChromeMain+0x4100170>
 410535c: b0046f28     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 4105360: 9124b108     	add	x8, x8, #0x92c
 4105364: eb08013f     	cmp	x9, x8
 4105368: fa488002     	ccmp	x0, x8, #0x2, hi
 410536c: 54000509     	b.ls	0x410540c <_ChromeMain+0x4100170>
 4105370: ad400500     	ldp	q0, q1, [x8]
 4105374: ad000400     	stp	q0, q1, [x0]
 4105378: 3cc1f100     	ldur	q0, [x8, #0x1f]
 410537c: 3c81f000     	stur	q0, [x0, #0x1f]
 4105380: 3900bc1f     	strb	wzr, [x0, #0x2f]
 4105384: d10387a8     	sub	x8, x29, #0xe1
 4105388: d10403a1     	sub	x1, x29, #0x100
 410538c: aa1303e0     	mov	x0, x19
 4105390: 94adc7f0     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 4105394: d10387a1     	sub	x1, x29, #0xe1
 4105398: aa1403e8     	mov	x8, x20
 410539c: aa1303e0     	mov	x0, x19
 41053a0: 94adc86d     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 41053a4: 38d173a8     	ldursb	w8, [x29, #-0xe9]
 41053a8: 36f80168     	tbz	w8, #0x1f, 0x41053d4 <_ChromeMain+0x4100138>
 41053ac: f85003a0     	ldur	x0, [x29, #-0x100]
 41053b0: f85103a8     	ldur	x8, [x29, #-0xf0]
 41053b4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41053b8: 96fc0ec0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41053bc: 14000006     	b	0x41053d4 <_ChromeMain+0x4100138>
 41053c0: aa1303e0     	mov	x0, x19
 41053c4: 94adc8c2     	bl	0x6c776cc <_ChromeMain+0x6c72430>
 41053c8: aa1403e8     	mov	x8, x20
 41053cc: aa1303e0     	mov	x0, x19
 41053d0: 94adc851     	bl	0x6c77514 <_ChromeMain+0x6c72278>
 41053d4: 385383a8     	ldurb	w8, [x29, #-0xc8]
 41053d8: 340000e8     	cbz	w8, 0x41053f4 <_ChromeMain+0x4100158>
 41053dc: 38d373a8     	ldursb	w8, [x29, #-0xc9]
 41053e0: 36f800a8     	tbz	w8, #0x1f, 0x41053f4 <_ChromeMain+0x4100158>
 41053e4: f85203a0     	ldur	x0, [x29, #-0xe0]
 41053e8: f85303a8     	ldur	x8, [x29, #-0xd0]
 41053ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41053f0: 96fc0eb2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41053f4: 910843ff     	add	sp, sp, #0x210
 41053f8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41053fc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4105400: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4105404: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4105408: d65f03c0     	ret
 410540c: d4200020     	brk	#0x1
 4105410: 9100a2c0     	add	x0, x22, #0x28
 4105414: 970b20c7     	bl	0x3cd730 <_ChromeMain+0x3c8494>
 4105418: 17ffffbc     	b	0x4105308 <_ChromeMain+0x410006c>
 410541c: 9100a2c0     	add	x0, x22, #0x28
 4105420: 94fbfd39     	bl	0x8004904 <_ChromeMain+0x7fff668>
 4105424: 6f00e400     	movi.2d	v0, #0000000000000000
 4105428: ad0302a0     	stp	q0, q0, [x21, #0x60]
 410542c: ad0202a0     	stp	q0, q0, [x21, #0x40]
 4105430: ad0102a0     	stp	q0, q0, [x21, #0x20]
 4105434: ad0002a0     	stp	q0, q0, [x21]
 4105438: 385383a8     	ldurb	w8, [x29, #-0xc8]
 410543c: 3607fe88     	tbz	w8, #0x0, 0x410540c <_ChromeMain+0x4100170>
 4105440: 389373a8     	ldursb	x8, [x29, #-0xc9]
 4105444: d10383a9     	sub	x9, x29, #0xe0
 4105448: a9722faa     	ldp	x10, x11, [x29, #-0xe0]
 410544c: f100011f     	cmp	x8, #0x0
 4105450: 9a894141     	csel	x1, x10, x9, mi
 4105454: 7100011f     	cmp	w8, #0x0
 4105458: 9a884162     	csel	x2, x11, x8, mi
 410545c: 910123e0     	add	x0, sp, #0x48
 4105460: 9709ab5d     	bl	0x3701d4 <_ChromeMain+0x36af38>
 4105464: 394183e8     	ldrb	w8, [sp, #0x60]
 4105468: 34000328     	cbz	w8, 0x41054cc <_ChromeMain+0x4100230>
 410546c: 910123e0     	add	x0, sp, #0x48
 4105470: 9704d6ed     	bl	0x23b024 <_ChromeMain+0x235d88>
 4105474: 360002c0     	tbz	w0, #0x0, 0x41054cc <_ChromeMain+0x4100230>
 4105478: d102a3b5     	sub	x21, x29, #0xa8
 410547c: d102a3a8     	sub	x8, x29, #0xa8
 4105480: 910123e0     	add	x0, sp, #0x48
 4105484: 97285f08     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 4105488: 910303e0     	add	x0, sp, #0xc0
 410548c: d102a3a1     	sub	x1, x29, #0xa8
 4105490: 9703566d     	bl	0x1dae44 <_ChromeMain+0x1d5ba8>
 4105494: 52800028     	mov	w8, #0x1                ; =1
 4105498: 3904e3e8     	strb	w8, [sp, #0x138]
 410549c: 9101c2a0     	add	x0, x21, #0x70
 41054a0: d2800001     	mov	x1, #0x0                ; =0
 41054a4: 96fc8a05     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41054a8: 910082a0     	add	x0, x21, #0x20
 41054ac: 96fc89f3     	bl	0x27c78 <_ChromeMain+0x229dc>
 41054b0: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 41054b4: 36f80108     	tbz	w8, #0x1f, 0x41054d4 <_ChromeMain+0x4100238>
 41054b8: f85583a0     	ldur	x0, [x29, #-0xa8]
 41054bc: f85683a8     	ldur	x8, [x29, #-0x98]
 41054c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41054c4: 96fc0e7d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41054c8: 14000003     	b	0x41054d4 <_ChromeMain+0x4100238>
 41054cc: 390303ff     	strb	wzr, [sp, #0xc0]
 41054d0: 3904e3ff     	strb	wzr, [sp, #0x138]
 41054d4: 910123f5     	add	x21, sp, #0x48
 41054d8: 9101c2a0     	add	x0, x21, #0x70
 41054dc: d2800001     	mov	x1, #0x0                ; =0
 41054e0: 96fc89f6     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41054e4: 910082a0     	add	x0, x21, #0x20
 41054e8: 96fc89e4     	bl	0x27c78 <_ChromeMain+0x229dc>
 41054ec: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 41054f0: 36f800a8     	tbz	w8, #0x1f, 0x4105504 <_ChromeMain+0x4100268>
 41054f4: f94027e0     	ldr	x0, [sp, #0x48]
 41054f8: f9402fe8     	ldr	x8, [sp, #0x58]
 41054fc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4105500: 96fc0e6e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4105504: 3944e3e8     	ldrb	w8, [sp, #0x138]
 4105508: 37000488     	tbnz	w8, #0x0, 0x4105598 <_ChromeMain+0x41002fc>
 410550c: 52800600     	mov	w0, #0x30               ; =48
 4105510: 96fc2796     	bl	0xf368 <_ChromeMain+0xa0cc>
 4105514: f90017e0     	str	x0, [sp, #0x28]
 4105518: b004f1a8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 410551c: 3dc2e500     	ldr	q0, [x8, #0xb90]
 4105520: 3c8303e0     	stur	q0, [sp, #0x30]
 4105524: 91008c09     	add	x9, x0, #0x23
 4105528: eb00013f     	cmp	x9, x0
 410552c: 54fff703     	b.lo	0x410540c <_ChromeMain+0x4100170>
 4105530: b0046f28     	adrp	x8, 0xceea000 <dyld_stub_binder+0xceea000>
 4105534: 9126d108     	add	x8, x8, #0x9b4
 4105538: eb08013f     	cmp	x9, x8
 410553c: fa488002     	ccmp	x0, x8, #0x2, hi
 4105540: 54fff669     	b.ls	0x410540c <_ChromeMain+0x4100170>
 4105544: 528d2e69     	mov	w9, #0x6973             ; =26995
 4105548: 72adcde9     	movk	w9, #0x6e6f, lsl #16
 410554c: b801f009     	stur	w9, [x0, #0x1f]
 4105550: ad400500     	ldp	q0, q1, [x8]
 4105554: ad000400     	stp	q0, q1, [x0]
 4105558: 39008c1f     	strb	wzr, [x0, #0x23]
 410555c: 91011fe8     	add	x8, sp, #0x47
 4105560: 9100a3e1     	add	x1, sp, #0x28
 4105564: aa1303e0     	mov	x0, x19
 4105568: 94adc77a     	bl	0x6c77350 <_ChromeMain+0x6c720b4>
 410556c: 91011fe1     	add	x1, sp, #0x47
 4105570: aa1403e8     	mov	x8, x20
 4105574: aa1303e0     	mov	x0, x19
 4105578: 94adc7f7     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 410557c: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4105580: 36f80c68     	tbz	w8, #0x1f, 0x410570c <_ChromeMain+0x4100470>
 4105584: f94017e0     	ldr	x0, [sp, #0x28]
 4105588: f9401fe8     	ldr	x8, [sp, #0x38]
 410558c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4105590: 96fc0e4a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4105594: 1400005e     	b	0x410570c <_ChromeMain+0x4100470>
 4105598: f940ea75     	ldr	x21, [x19, #0x1d0]
 410559c: b5000055     	cbnz	x21, 0x41055a4 <_ChromeMain+0x4100308>
 41055a0: f940e675     	ldr	x21, [x19, #0x1c8]
 41055a4: 910303e1     	add	x1, sp, #0xc0
 41055a8: aa1503e0     	mov	x0, x21
 41055ac: 52800002     	mov	w2, #0x0                ; =0
 41055b0: 94db4bd4     	bl	0x77d8500 <_ChromeMain+0x77d3264>
 41055b4: 3944e3e8     	ldrb	w8, [sp, #0x138]
 41055b8: 3607f2a8     	tbz	w8, #0x0, 0x410540c <_ChromeMain+0x4100170>
 41055bc: f94002a8     	ldr	x8, [x21]
 41055c0: f940b508     	ldr	x8, [x8, #0x168]
 41055c4: aa1503e0     	mov	x0, x21
 41055c8: d63f0100     	blr	x8
 41055cc: aa0003f5     	mov	x21, x0
 41055d0: a904ffff     	stp	xzr, xzr, [sp, #0x48]
 41055d4: f9002fff     	str	xzr, [sp, #0x58]
 41055d8: 90046f21     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 41055dc: 9128a021     	add	x1, x1, #0xa28
 41055e0: 52800662     	mov	w2, #0x33               ; =51
 41055e4: 96fe7b49     	bl	0xa4308 <_ChromeMain+0x9f06c>
 41055e8: 910123e8     	add	x8, sp, #0x48
 41055ec: 9727344f     	bl	0xad2728 <_ChromeMain+0xacd48c>
 41055f0: d102a3b7     	sub	x23, x29, #0xa8
 41055f4: d102a3a8     	sub	x8, x29, #0xa8
 41055f8: 910303e0     	add	x0, sp, #0xc0
 41055fc: 97285eaa     	bl	0xb1d0a4 <_ChromeMain+0xb17e08>
 4105600: d102a3a0     	sub	x0, x29, #0xa8
 4105604: 97159d21     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 4105608: 39805c08     	ldrsb	x8, [x0, #0x17]
 410560c: a9402809     	ldp	x9, x10, [x0]
 4105610: f100011f     	cmp	x8, #0x0
 4105614: 9a804121     	csel	x1, x9, x0, mi
 4105618: 7100011f     	cmp	w8, #0x0
 410561c: 9a884142     	csel	x2, x10, x8, mi
 4105620: 910123e0     	add	x0, sp, #0x48
 4105624: 976778e7     	bl	0x1ae39c0 <_ChromeMain+0x1ade724>
 4105628: aa0003f6     	mov	x22, x0
 410562c: 9101c2e0     	add	x0, x23, #0x70
 4105630: d2800001     	mov	x1, #0x0                ; =0
 4105634: 96fc89a1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4105638: 910082e0     	add	x0, x23, #0x20
 410563c: 96fc898f     	bl	0x27c78 <_ChromeMain+0x229dc>
 4105640: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 4105644: 36f800a8     	tbz	w8, #0x1f, 0x4105658 <_ChromeMain+0x41003bc>
 4105648: f85583a0     	ldur	x0, [x29, #-0xa8]
 410564c: f85683a8     	ldur	x8, [x29, #-0x98]
 4105650: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4105654: 96fc0e19     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4105658: 340002f6     	cbz	w22, 0x41056b4 <_ChromeMain+0x4100418>
 410565c: f94027e8     	ldr	x8, [sp, #0x48]
 4105660: f90027ff     	str	xzr, [sp, #0x48]
 4105664: f81403bf     	stur	xzr, [x29, #-0xc0]
 4105668: f81583a8     	stur	x8, [x29, #-0xa8]
 410566c: 6f00e400     	movi.2d	v0, #0000000000000000
 4105670: 910303e8     	add	x8, sp, #0xc0
 4105674: 3c8c8100     	stur	q0, [x8, #0xc8]
 4105678: 3cc503e1     	ldur	q1, [sp, #0x50]
 410567c: 3c8503e0     	stur	q0, [sp, #0x50]
 4105680: 3c8e0101     	stur	q1, [x8, #0xe0]
 4105684: 528000c8     	mov	w8, #0x6                ; =6
 4105688: 381703a8     	sturb	w8, [x29, #-0x90]
 410568c: 90046f21     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 4105690: 9128a021     	add	x1, x1, #0xa28
 4105694: d102a3a3     	sub	x3, x29, #0xa8
 4105698: aa1503e0     	mov	x0, x21
 410569c: 52800662     	mov	w2, #0x33               ; =51
 41056a0: 97501082     	bl	0x15098a8 <_ChromeMain+0x150460c>
 41056a4: d102a3a0     	sub	x0, x29, #0xa8
 41056a8: 9754644b     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 41056ac: d10303a0     	sub	x0, x29, #0xc0
 41056b0: 97216374     	bl	0x95e480 <_ChromeMain+0x9591e4>
 41056b4: 910123e0     	add	x0, sp, #0x48
 41056b8: 97216372     	bl	0x95e480 <_ChromeMain+0x9591e4>
 41056bc: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 41056c0: f90007ff     	str	xzr, [sp, #0x8]
 41056c4: 52800035     	mov	w21, #0x1               ; =1
 41056c8: 910023e0     	add	x0, sp, #0x8
 41056cc: 52800021     	mov	w1, #0x1                ; =1
 41056d0: 975e26ac     	bl	0x188f180 <_ChromeMain+0x1889ee4>
 41056d4: 381583b5     	sturb	w21, [x29, #-0xa8]
 41056d8: 910023e0     	add	x0, sp, #0x8
 41056dc: d102a3a1     	sub	x1, x29, #0xa8
 41056e0: 951be958     	bl	0x87ffc40 <_ChromeMain+0x87fa9a4>
 41056e4: 91009fe8     	add	x8, sp, #0x27
 41056e8: 910023e1     	add	x1, sp, #0x8
 41056ec: aa1303e0     	mov	x0, x19
 41056f0: 94adc959     	bl	0x6c77c54 <_ChromeMain+0x6c729b8>
 41056f4: 91009fe1     	add	x1, sp, #0x27
 41056f8: aa1403e8     	mov	x8, x20
 41056fc: aa1303e0     	mov	x0, x19
 4105700: 94adc795     	bl	0x6c77554 <_ChromeMain+0x6c722b8>
 4105704: f94007e1     	ldr	x1, [sp, #0x8]
 4105708: b50001c1     	cbnz	x1, 0x4105740 <_ChromeMain+0x41004a4>
 410570c: 3944e3e8     	ldrb	w8, [sp, #0x138]
 4105710: 34ffe628     	cbz	w8, 0x41053d4 <_ChromeMain+0x4100138>
 4105714: 910303f3     	add	x19, sp, #0xc0
 4105718: 9101c260     	add	x0, x19, #0x70
 410571c: d2800001     	mov	x1, #0x0                ; =0
 4105720: 96fc8966     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4105724: 91008260     	add	x0, x19, #0x20
 4105728: 96fc8954     	bl	0x27c78 <_ChromeMain+0x229dc>
 410572c: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 4105730: 36ffe528     	tbz	w8, #0x1f, 0x41053d4 <_ChromeMain+0x4100138>
 4105734: f94063e0     	ldr	x0, [sp, #0xc0]
 4105738: f9406be8     	ldr	x8, [sp, #0xd0]
 410573c: 17ffff1e     	b	0x41053b4 <_ChromeMain+0x4100118>
 4105740: 910023e0     	add	x0, sp, #0x8
 4105744: 972885eb     	bl	0xb26ef0 <_ChromeMain+0xb21c54>
 4105748: f94007e0     	ldr	x0, [sp, #0x8]
 410574c: f9400fe8     	ldr	x8, [sp, #0x18]
 4105750: d37be901     	lsl	x1, x8, #5
 4105754: 17ffff8f     	b	0x4105590 <_ChromeMain+0x41002f4>
		...
