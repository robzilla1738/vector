
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 459577c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4595780: a90167fa     	stp	x26, x25, [sp, #0x10]
 4595784: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4595788: a90357f6     	stp	x22, x21, [sp, #0x30]
 459578c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4595790: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4595794: 910143fd     	add	x29, sp, #0x50
 4595798: d10e83ff     	sub	sp, sp, #0x3a0
 459579c: aa0003f3     	mov	x19, x0
 45957a0: f9401c00     	ldr	x0, [x0, #0x38]
 45957a4: 97443032     	bl	0x16a186c <_ChromeMain+0x169c5d0>
 45957a8: b4000420     	cbz	x0, 0x459582c <_ChromeMain+0x4590590>
 45957ac: aa0003f4     	mov	x20, x0
 45957b0: 9107c3fa     	add	x26, sp, #0x1f0
 45957b4: 52800600     	mov	w0, #0x30               ; =48
 45957b8: 96e9e6ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 45957bc: f900fbe0     	str	x0, [sp, #0x1f0]
 45957c0: d004cd28     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 45957c4: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 45957c8: 3c808340     	stur	q0, [x26, #0x8]
 45957cc: 91008008     	add	x8, x0, #0x20
 45957d0: eb00011f     	cmp	x8, x0
 45957d4: 540064a3     	b.lo	0x4596468 <_ChromeMain+0x45911cc>
 45957d8: 3d800be0     	str	q0, [sp, #0x20]
 45957dc: f004459b     	adrp	x27, 0xce48000 <dyld_stub_binder+0xce48000>
 45957e0: 9125277b     	add	x27, x27, #0x949
 45957e4: eb1b011f     	cmp	x8, x27
 45957e8: fa5b8002     	ccmp	x0, x27, #0x2, hi
 45957ec: 540063e9     	b.ls	0x4596468 <_ChromeMain+0x45911cc>
 45957f0: ad400760     	ldp	q0, q1, [x27]
 45957f4: ad0003e1     	stp	q1, q0, [sp]
 45957f8: ad000400     	stp	q0, q1, [x0]
 45957fc: 3900801f     	strb	wzr, [x0, #0x20]
 4595800: 91002280     	add	x0, x20, #0x8
 4595804: 9107c3e1     	add	x1, sp, #0x1f0
 4595808: 97199ebf     	bl	0xbfd304 <_ChromeMain+0xbf8068>
 459580c: aa0003f4     	mov	x20, x0
 4595810: 39c81fe8     	ldrsb	w8, [sp, #0x207]
 4595814: 36f800a8     	tbz	w8, #0x1f, 0x4595828 <_ChromeMain+0x459058c>
 4595818: f940fbe0     	ldr	x0, [sp, #0x1f0]
 459581c: f94103e8     	ldr	x8, [sp, #0x200]
 4595820: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4595824: 96e9cda5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4595828: b5000134     	cbnz	x20, 0x459584c <_ChromeMain+0x45905b0>
 459582c: 910e83ff     	add	sp, sp, #0x3a0
 4595830: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4595834: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4595838: a94357f6     	ldp	x22, x21, [sp, #0x30]
 459583c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4595840: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4595844: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4595848: d65f03c0     	ret
 459584c: f9402e60     	ldr	x0, [x19, #0x58]
 4595850: 90054bb7     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 4595854: b50049c0     	cbnz	x0, 0x459618c <_ChromeMain+0x4590ef0>
