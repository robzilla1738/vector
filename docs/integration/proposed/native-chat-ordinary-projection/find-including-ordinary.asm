
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46385cc: d102c3ff     	sub	sp, sp, #0xb0
 46385d0: a9056ffc     	stp	x28, x27, [sp, #0x50]
 46385d4: a90667fa     	stp	x26, x25, [sp, #0x60]
 46385d8: a9075ff8     	stp	x24, x23, [sp, #0x70]
 46385dc: a90857f6     	stp	x22, x21, [sp, #0x80]
 46385e0: a9094ff4     	stp	x20, x19, [sp, #0x90]
 46385e4: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 46385e8: 910283fd     	add	x29, sp, #0xa0
 46385ec: f9423408     	ldr	x8, [x0, #0x468]
 46385f0: b40004e8     	cbz	x8, 0x463868c <_ChromeMain+0x46333f0>
 46385f4: aa0103f5     	mov	x21, x1
 46385f8: 39405c29     	ldrb	w9, [x1, #0x17]
 46385fc: f940042a     	ldr	x10, [x1, #0x8]
 4638600: 7219013f     	tst	w9, #0x80
 4638604: 9a891149     	csel	x9, x10, x9, ne
 4638608: b4000409     	cbz	x9, 0x4638688 <_ChromeMain+0x46333ec>
 463860c: aa0303f3     	mov	x19, x3
 4638610: aa0203f4     	mov	x20, x2
 4638614: aa0003f6     	mov	x22, x0
 4638618: f9404901     	ldr	x1, [x8, #0x90]
 463861c: b40002a1     	cbz	x1, 0x4638670 <_ChromeMain+0x46333d4>
 4638620: f9400100     	ldr	x0, [x8]
 4638624: 96f547c2     	bl	0x38a52c <_ChromeMain+0x385290>
 4638628: f94236c8     	ldr	x8, [x22, #0x468]
 463862c: 2a0003e9     	mov	w9, w0
 4638630: 7200003f     	tst	w1, #0x1
 4638634: 1280000a     	mov	w10, #-0x1              ; =-1
 4638638: 9a8a1129     	csel	x9, x9, x10, ne
 463863c: f9000be9     	str	x9, [sp, #0x10]
 4638640: f9400100     	ldr	x0, [x8]
 4638644: b9401808     	ldr	w8, [x0, #0x18]
 4638648: 7100051f     	cmp	w8, #0x1
 463864c: 5400016b     	b.lt	0x4638678 <_ChromeMain+0x46333dc>
 4638650: d2800017     	mov	x23, #0x0               ; =0
 4638654: 52800019     	mov	w25, #0x0               ; =0
 4638658: b9000fff     	str	wzr, [sp, #0xc]
 463865c: 5280001b     	mov	w27, #0x0               ; =0
 4638660: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 4638664: b9001fff     	str	wzr, [sp, #0x1c]
 4638668: 5280001a     	mov	w26, #0x0               ; =0
 463866c: 14000039     	b	0x4638750 <_ChromeMain+0x46334b4>
 4638670: 12800009     	mov	w9, #-0x1               ; =-1
 4638674: 17fffff2     	b	0x463863c <_ChromeMain+0x46333a0>
 4638678: d2800008     	mov	x8, #0x0                ; =0
 463867c: 52800017     	mov	w23, #0x0               ; =0
 4638680: 52800019     	mov	w25, #0x0               ; =0
 4638684: 14000003     	b	0x4638690 <_ChromeMain+0x46333f4>
 4638688: d2800008     	mov	x8, #0x0                ; =0
 463868c: 52800017     	mov	w23, #0x0               ; =0
 4638690: 53185f29     	lsl	w9, w25, #8
 4638694: b3401ee9     	bfxil	x9, x23, #0, #8
 4638698: aa080120     	orr	x0, x9, x8
 463869c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 46386a0: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 46386a4: a94857f6     	ldp	x22, x21, [sp, #0x80]
 46386a8: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 46386ac: a94667fa     	ldp	x26, x25, [sp, #0x60]
 46386b0: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 46386b4: 9102c3ff     	add	sp, sp, #0xb0
 46386b8: d65f03c0     	ret
 46386bc: 2943a7e8     	ldp	w8, w9, [sp, #0x1c]
 46386c0: 2a080368     	orr	w8, w27, w8
 46386c4: 7200037f     	tst	w27, #0x1
 46386c8: b9400fea     	ldr	w10, [sp, #0xc]
 46386cc: 1a891149     	csel	w9, w10, w9, ne
 46386d0: b94027ea     	ldr	w10, [sp, #0x24]
 46386d4: 1a8a132a     	csel	w10, w25, w10, ne
 46386d8: d2c0002b     	mov	x11, #0x100000000       ; =4294967296
 46386dc: 12001f4c     	and	w12, w26, #0xff
 46386e0: d3607d8c     	lsl	x12, x12, #32
 46386e4: 7200011f     	tst	w8, #0x1
 46386e8: 9a8c1168     	csel	x8, x11, x12, ne
 46386ec: b9402beb     	ldr	w11, [sp, #0x28]
 46386f0: 1a8b1137     	csel	w23, w9, w11, ne
 46386f4: b9402fe9     	ldr	w9, [sp, #0x2c]
 46386f8: 1a891159     	csel	w25, w10, w9, ne
 46386fc: 17ffffe5     	b	0x4638690 <_ChromeMain+0x46333f4>
 4638700: 53087ef9     	lsr	w25, w23, #8
 4638704: f9400be8     	ldr	x8, [sp, #0x10]
 4638708: eb0802ff     	cmp	x23, x8
 463870c: 540011e0     	b.eq	0x4638948 <_ChromeMain+0x46336ac>
 4638710: 5280003b     	mov	w27, #0x1               ; =1
 4638714: b9000ff7     	str	w23, [sp, #0xc]
 4638718: 14000008     	b	0x4638738 <_ChromeMain+0x463349c>
 463871c: aa0903e8     	mov	x8, x9
 4638720: 14000024     	b	0x46387b0 <_ChromeMain+0x4633514>
 4638724: 36f800b8     	tbz	w24, #0x1f, 0x4638738 <_ChromeMain+0x463349c>
 4638728: f9401be0     	ldr	x0, [sp, #0x30]
 463872c: f94023e8     	ldr	x8, [sp, #0x40]
 4638730: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4638734: 96e741e1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4638738: 910006f7     	add	x23, x23, #0x1
 463873c: f94236c8     	ldr	x8, [x22, #0x468]
 4638740: f9400100     	ldr	x0, [x8]
 4638744: b9801808     	ldrsw	x8, [x0, #0x18]
 4638748: eb0802ff     	cmp	x23, x8
 463874c: 54fffb8a     	b.ge	0x46386bc <_ChromeMain+0x4633420>
 4638750: aa1703e1     	mov	x1, x23
 4638754: 972896e9     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4638758: b4ffff00     	cbz	x0, 0x4638738 <_ChromeMain+0x463349c>
 463875c: aa0003f8     	mov	x24, x0
 4638760: b940101c     	ldr	w28, [x0, #0x10]
 4638764: d360fe88     	lsr	x8, x20, #32
 4638768: b4000068     	cbz	x8, 0x4638774 <_ChromeMain+0x46334d8>
 463876c: 6b14039f     	cmp	w28, w20
 4638770: 54fffe40     	b.eq	0x4638738 <_ChromeMain+0x463349c>
 4638774: f947e6c9     	ldr	x9, [x22, #0xfc8]
 4638778: f947eaca     	ldr	x10, [x22, #0xfd0]
 463877c: d37be948     	lsl	x8, x10, #5
 4638780: b4fffce8     	cbz	x8, 0x463871c <_ChromeMain+0x4633480>
 4638784: 9345fd0b     	asr	x11, x8, #5
 4638788: aa0903e8     	mov	x8, x9
 463878c: d341fd6c     	lsr	x12, x11, #1
 4638790: 8b0c150d     	add	x13, x8, x12, lsl #5
 4638794: b84205ae     	ldr	w14, [x13], #0x20
 4638798: aa6b07ef     	mvn	x15, x11, lsr #1
 463879c: 8b0f016b     	add	x11, x11, x15
 46387a0: 6b1c01df     	cmp	w14, w28
 46387a4: 9a8cb16b     	csel	x11, x11, x12, lt
 46387a8: 9a88b1a8     	csel	x8, x13, x8, lt
 46387ac: b5ffff0b     	cbnz	x11, 0x463878c <_ChromeMain+0x46334f0>
 46387b0: 8b0a1529     	add	x9, x9, x10, lsl #5
 46387b4: eb09011f     	cmp	x8, x9
 46387b8: 54000300     	b.eq	0x4638818 <_ChromeMain+0x463357c>
 46387bc: b9400109     	ldr	w9, [x8]
 46387c0: 6b09039f     	cmp	w28, w9
 46387c4: 540002ab     	b.lt	0x4638818 <_ChromeMain+0x463357c>
 46387c8: 39407d0a     	ldrb	w10, [x8, #0x1f]
 46387cc: 13001d49     	sxtb	w9, w10
 46387d0: f940090b     	ldr	x11, [x8, #0x10]
 46387d4: 7100013f     	cmp	w9, #0x0
 46387d8: 9a8a4162     	csel	x2, x11, x10, mi
 46387dc: 39405eab     	ldrb	w11, [x21, #0x17]
 46387e0: 13001d6a     	sxtb	w10, w11
 46387e4: f94006ac     	ldr	x12, [x21, #0x8]
 46387e8: 7100015f     	cmp	w10, #0x0
 46387ec: 9a8b418b     	csel	x11, x12, x11, mi
 46387f0: eb0b005f     	cmp	x2, x11
 46387f4: 54000121     	b.ne	0x4638818 <_ChromeMain+0x463357c>
 46387f8: f8408d0b     	ldr	x11, [x8, #0x8]!
 46387fc: 7100013f     	cmp	w9, #0x0
 4638800: 9a884160     	csel	x0, x11, x8, mi
 4638804: f94002a8     	ldr	x8, [x21]
 4638808: 7100015f     	cmp	w10, #0x0
 463880c: 9a954101     	csel	x1, x8, x21, mi
 4638810: 94e74414     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4638814: 34fff760     	cbz	w0, 0x4638700 <_ChromeMain+0x4633464>
 4638818: 370002d3     	tbnz	w19, #0x0, 0x4638870 <_ChromeMain+0x46335d4>
 463881c: f9484ac8     	ldr	x8, [x22, #0x1090]
 4638820: f9484ec9     	ldr	x9, [x22, #0x1098]
 4638824: d37ef52a     	lsl	x10, x9, #2
 4638828: b400062a     	cbz	x10, 0x46388ec <_ChromeMain+0x4633650>
 463882c: 9342fd4b     	asr	x11, x10, #2
 4638830: aa0803ea     	mov	x10, x8
 4638834: d341fd6c     	lsr	x12, x11, #1
 4638838: 8b0c094d     	add	x13, x10, x12, lsl #2
 463883c: b84045ae     	ldr	w14, [x13], #0x4
 4638840: aa6b07ef     	mvn	x15, x11, lsr #1
 4638844: 8b0f016b     	add	x11, x11, x15
 4638848: 6b1c01df     	cmp	w14, w28
 463884c: 9a8cb16b     	csel	x11, x11, x12, lt
 4638850: 9a8ab1aa     	csel	x10, x13, x10, lt
 4638854: b5ffff0b     	cbnz	x11, 0x4638834 <_ChromeMain+0x4633598>
 4638858: 8b090908     	add	x8, x8, x9, lsl #2
 463885c: eb08015f     	cmp	x10, x8
 4638860: 54000080     	b.eq	0x4638870 <_ChromeMain+0x46335d4>
 4638864: b9400148     	ldr	w8, [x10]
 4638868: 6b08039f     	cmp	w28, w8
 463886c: 54fff66a     	b.ge	0x4638738 <_ChromeMain+0x463349c>
 4638870: f9402301     	ldr	x1, [x24, #0x40]
 4638874: b4fff621     	cbz	x1, 0x4638738 <_ChromeMain+0x463349c>
 4638878: 6f00e400     	movi.2d	v0, #0000000000000000
 463887c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 4638880: 9100c3e8     	add	x8, sp, #0x30
 4638884: aa1603e0     	mov	x0, x22
 4638888: 97fffda6     	bl	0x4637f20 <_ChromeMain+0x4632c84>
 463888c: 394123e8     	ldrb	w8, [sp, #0x48]
 4638890: 34fff548     	cbz	w8, 0x4638738 <_ChromeMain+0x463349c>
 4638894: 39411fe8     	ldrb	w8, [sp, #0x47]
 4638898: 13001d18     	sxtb	w24, w8
 463889c: f9401fe9     	ldr	x9, [sp, #0x38]
 46388a0: 7100031f     	cmp	w24, #0x0
 46388a4: 9a884122     	csel	x2, x9, x8, mi
 46388a8: 39405ea9     	ldrb	w9, [x21, #0x17]
 46388ac: 13001d28     	sxtb	w8, w9
 46388b0: f94006aa     	ldr	x10, [x21, #0x8]
 46388b4: 7100011f     	cmp	w8, #0x0
 46388b8: 9a894149     	csel	x9, x10, x9, mi
 46388bc: eb09005f     	cmp	x2, x9
 46388c0: 54fff321     	b.ne	0x4638724 <_ChromeMain+0x4633488>
 46388c4: f9401be9     	ldr	x9, [sp, #0x30]
 46388c8: 7100031f     	cmp	w24, #0x0
 46388cc: 9100c3ea     	add	x10, sp, #0x30
 46388d0: 9a8a4120     	csel	x0, x9, x10, mi
 46388d4: f94002a9     	ldr	x9, [x21]
 46388d8: 7100011f     	cmp	w8, #0x0
 46388dc: 9a954121     	csel	x1, x9, x21, mi
 46388e0: 94e743e0     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46388e4: 34000080     	cbz	w0, 0x46388f4 <_ChromeMain+0x4633658>
 46388e8: 17ffff8f     	b	0x4638724 <_ChromeMain+0x4633488>
 46388ec: aa0803ea     	mov	x10, x8
 46388f0: 17ffffda     	b	0x4638858 <_ChromeMain+0x46335bc>
 46388f4: f9400be8     	ldr	x8, [sp, #0x10]
 46388f8: eb0802ff     	cmp	x23, x8
 46388fc: 1a9f17e8     	cset	w8, eq
 4638900: 53087ee9     	lsr	w9, w23, #8
 4638904: b9401fea     	ldr	w10, [sp, #0x1c]
 4638908: 2a0a010a     	orr	w10, w8, w10
 463890c: b94023e8     	ldr	w8, [sp, #0x20]
 4638910: 1a8802e8     	csel	w8, w23, w8, eq
 4638914: 2903a3ea     	stp	w10, w8, [sp, #0x1c]
 4638918: b94027e8     	ldr	w8, [sp, #0x24]
 463891c: 1a88012a     	csel	w10, w9, w8, eq
 4638920: 7200035f     	tst	w26, #0x1
 4638924: b9402be8     	ldr	w8, [sp, #0x28]
 4638928: 1a971108     	csel	w8, w8, w23, ne
 463892c: 2904a3ea     	stp	w10, w8, [sp, #0x24]
 4638930: b9402fe8     	ldr	w8, [sp, #0x2c]
 4638934: 1a891108     	csel	w8, w8, w9, ne
 4638938: b9002fe8     	str	w8, [sp, #0x2c]
 463893c: 5280003a     	mov	w26, #0x1               ; =1
 4638940: 37ffef58     	tbnz	w24, #0x1f, 0x4638728 <_ChromeMain+0x463348c>
 4638944: 17ffff7d     	b	0x4638738 <_ChromeMain+0x463349c>
 4638948: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 463894c: 17ffff51     	b	0x4638690 <_ChromeMain+0x46333f4>
