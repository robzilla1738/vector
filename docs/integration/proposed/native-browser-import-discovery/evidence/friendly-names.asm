
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42755a0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 42755a4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 42755a8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 42755ac: 910083fd     	add	x29, sp, #0x20
 42755b0: aa0103f4     	mov	x20, x1
 42755b4: aa0003f5     	mov	x21, x0
 42755b8: aa0803f3     	mov	x19, x8
 42755bc: f100143f     	cmp	x1, #0x5
 42755c0: 54000ecc     	b.gt	0x4275798 <_ChromeMain+0x42704fc>
 42755c4: f1000e9f     	cmp	x20, #0x3
 42755c8: 54000400     	b.eq	0x4275648 <_ChromeMain+0x42703ac>
 42755cc: f100129f     	cmp	x20, #0x4
 42755d0: 540009e0     	b.eq	0x427570c <_ChromeMain+0x4270470>
 42755d4: f100169f     	cmp	x20, #0x5
 42755d8: 54000c01     	b.ne	0x4275758 <_ChromeMain+0x42704bc>
 42755dc: b94002a8     	ldr	w8, [x21]
 42755e0: 394012a9     	ldrb	w9, [x21, #0x4]
 42755e4: 7101953f     	cmp	w9, #0x65
 42755e8: 528e4c49     	mov	w9, #0x7262             ; =29282
 42755ec: 72aecc29     	movk	w9, #0x7661, lsl #16
 42755f0: 7a490100     	ccmp	w8, w9, #0x0, eq
 42755f4: 54000700     	b.eq	0x42756d4 <_ChromeMain+0x4270438>
 42755f8: b94002a8     	ldr	w8, [x21]
 42755fc: 394012a9     	ldrb	w9, [x21, #0x4]
 4275600: 7101d13f     	cmp	w9, #0x74
 4275604: 528dec69     	mov	w9, #0x6f63             ; =28515
 4275608: 72acada9     	movk	w9, #0x656d, lsl #16
 427560c: 7a490100     	ccmp	w8, w9, #0x0, eq
 4275610: 54000ea1     	b.ne	0x42757e4 <_ChromeMain+0x4270548>
 4275614: 528000a8     	mov	w8, #0x5                ; =5
 4275618: 39005e68     	strb	w8, [x19, #0x17]
 427561c: 91001668     	add	x8, x19, #0x5
 4275620: 9004c129     	adrp	x9, 0xda99000 <dyld_stub_binder+0xda99000>
 4275624: 911e9d29     	add	x9, x9, #0x7a7
 4275628: eb09011f     	cmp	x8, x9
 427562c: fa498262     	ccmp	x19, x9, #0x2, hi
 4275630: 54001bc9     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275634: 528de868     	mov	w8, #0x6f43             ; =28483
 4275638: 72acada8     	movk	w8, #0x656d, lsl #16
 427563c: b9000268     	str	w8, [x19]
 4275640: 52800e88     	mov	w8, #0x74               ; =116
 4275644: 14000030     	b	0x4275704 <_ChromeMain+0x4270468>
 4275648: 794002a8     	ldrh	w8, [x21]
 427564c: 39400aa9     	ldrb	w9, [x21, #0x2]
 4275650: 71018d3f     	cmp	w9, #0x63
 4275654: 528e4c29     	mov	w9, #0x7261             ; =29281
 4275658: 7a490100     	ccmp	w8, w9, #0x0, eq
 427565c: 54000240     	b.eq	0x42756a4 <_ChromeMain+0x4270408>
 4275660: 794002a8     	ldrh	w8, [x21]
 4275664: 39400aa9     	ldrb	w9, [x21, #0x2]
 4275668: 7101853f     	cmp	w9, #0x61
 427566c: 528d2c89     	mov	w9, #0x6964             ; =26980
 4275670: 7a490100     	ccmp	w8, w9, #0x0, eq
 4275674: 54000b81     	b.ne	0x42757e4 <_ChromeMain+0x4270548>
 4275678: 52800068     	mov	w8, #0x3                ; =3
 427567c: 39005e68     	strb	w8, [x19, #0x17]
 4275680: 91000e68     	add	x8, x19, #0x3
 4275684: d004c549     	adrp	x9, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4275688: 912a7929     	add	x9, x9, #0xa9e
 427568c: eb09011f     	cmp	x8, x9
 4275690: fa498262     	ccmp	x19, x9, #0x2, hi
 4275694: 540018a9     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275698: 528d2888     	mov	w8, #0x6944             ; =26948
 427569c: 72a00c28     	movk	w8, #0x61, lsl #16
 42756a0: 1400000b     	b	0x42756cc <_ChromeMain+0x4270430>
 42756a4: 52800068     	mov	w8, #0x3                ; =3
 42756a8: 39005e68     	strb	w8, [x19, #0x17]
 42756ac: 91000e68     	add	x8, x19, #0x3
 42756b0: f004bd89     	adrp	x9, 0xda28000 <dyld_stub_binder+0xda28000>
 42756b4: 91121929     	add	x9, x9, #0x486
 42756b8: eb09011f     	cmp	x8, x9
 42756bc: fa498262     	ccmp	x19, x9, #0x2, hi
 42756c0: 54001749     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 42756c4: 528e4828     	mov	w8, #0x7241             ; =29249
 42756c8: 72a00c68     	movk	w8, #0x63, lsl #16
 42756cc: b9000268     	str	w8, [x19]
 42756d0: 14000051     	b	0x4275814 <_ChromeMain+0x4270578>
 42756d4: 528000a8     	mov	w8, #0x5                ; =5
 42756d8: 39005e68     	strb	w8, [x19, #0x17]
 42756dc: 91001668     	add	x8, x19, #0x5
 42756e0: d004c569     	adrp	x9, 0xdb23000 <dyld_stub_binder+0xdb23000>
 42756e4: 910ffd29     	add	x9, x9, #0x3ff
 42756e8: eb09011f     	cmp	x8, x9
 42756ec: fa498262     	ccmp	x19, x9, #0x2, hi
 42756f0: 540015c9     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 42756f4: 528e4848     	mov	w8, #0x7242             ; =29250
 42756f8: 72aecc28     	movk	w8, #0x7661, lsl #16
 42756fc: b9000268     	str	w8, [x19]
 4275700: 52800ca8     	mov	w8, #0x65               ; =101
 4275704: 79000a68     	strh	w8, [x19, #0x4]
 4275708: 14000043     	b	0x4275814 <_ChromeMain+0x4270578>
 427570c: b94002a8     	ldr	w8, [x21]
 4275710: 528c8ca9     	mov	w9, #0x6465             ; =25701
 4275714: 72acace9     	movk	w9, #0x6567, lsl #16
 4275718: 6b09011f     	cmp	w8, w9
 427571c: 54000641     	b.ne	0x42757e4 <_ChromeMain+0x4270548>
 4275720: 528001c8     	mov	w8, #0xe                ; =14
 4275724: 39005e68     	strb	w8, [x19, #0x17]
 4275728: 91003a69     	add	x9, x19, #0xe
 427572c: f004c468     	adrp	x8, 0xdb04000 <dyld_stub_binder+0xdb04000>
 4275730: 91287d08     	add	x8, x8, #0xa1f
 4275734: eb08013f     	cmp	x9, x8
 4275738: fa488262     	ccmp	x19, x8, #0x2, hi
 427573c: 54001369     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275740: f9400109     	ldr	x9, [x8]
 4275744: f9000269     	str	x9, [x19]
 4275748: f8406108     	ldur	x8, [x8, #0x6]
 427574c: f8006268     	stur	x8, [x19, #0x6]
 4275750: 39003a7f     	strb	wzr, [x19, #0xe]
 4275754: 14000030     	b	0x4275814 <_ChromeMain+0x4270578>
 4275758: 92800208     	mov	x8, #-0x11              ; =-17
 427575c: f2efffe8     	movk	x8, #0x7fff, lsl #48
 4275760: eb08029f     	cmp	x20, x8
 4275764: 54000043     	b.lo	0x427576c <_ChromeMain+0x42704d0>
 4275768: 94262b09     	bl	0x4c0038c <_ChromeMain+0x4bfb0f0>
 427576c: f1005a9f     	cmp	x20, #0x16
 4275770: 540003a9     	b.ls	0x42757e4 <_ChromeMain+0x4270548>
 4275774: 927cea96     	and	x22, x20, #0x7ffffffffffffff0
 4275778: 910042c0     	add	x0, x22, #0x10
 427577c: 96f666fb     	bl	0xf368 <_ChromeMain+0xa0cc>
 4275780: b27cebe8     	mov	x8, #0x7ffffffffffffff0 ; =9223372036854775792
 4275784: cb0802c8     	sub	x8, x22, x8
 4275788: a9005260     	stp	x0, x20, [x19]
 427578c: f9000a68     	str	x8, [x19, #0x10]
 4275790: aa0003f3     	mov	x19, x0
 4275794: 14000015     	b	0x42757e8 <_ChromeMain+0x427054c>
 4275798: f1001a9f     	cmp	x20, #0x6
 427579c: 540009e0     	b.eq	0x42758d8 <_ChromeMain+0x427063c>
 42757a0: f1001e9f     	cmp	x20, #0x7
 42757a4: 54000400     	b.eq	0x4275824 <_ChromeMain+0x4270588>
 42757a8: f100369f     	cmp	x20, #0xd
 42757ac: 54fffd61     	b.ne	0x4275758 <_ChromeMain+0x42704bc>
 42757b0: f94002a8     	ldr	x8, [x21]
 42757b4: f84052a9     	ldur	x9, [x21, #0x5]
 42757b8: d28d0c6a     	mov	x10, #0x6863            ; =26723
 42757bc: f2ae8c2a     	movk	x10, #0x7461, lsl #16
 42757c0: f2ce0cea     	movk	x10, #0x7067, lsl #32
 42757c4: f2e5ae8a     	movk	x10, #0x2d74, lsl #48
 42757c8: eb0a011f     	cmp	x8, x10
 42757cc: d28e8e08     	mov	x8, #0x7470             ; =29808
 42757d0: f2ac25a8     	movk	x8, #0x612d, lsl #16
 42757d4: f2cd8e88     	movk	x8, #0x6c74, lsl #32
 42757d8: f2ee6c28     	movk	x8, #0x7361, lsl #48
 42757dc: fa480120     	ccmp	x9, x8, #0x0, eq
 42757e0: 54000540     	b.eq	0x4275888 <_ChromeMain+0x42705ec>
 42757e4: 39005e74     	strb	w20, [x19, #0x17]
 42757e8: 8b140268     	add	x8, x19, x20
 42757ec: eb13011f     	cmp	x8, x19
 42757f0: 54000dc3     	b.lo	0x42759a8 <_ChromeMain+0x427070c>
 42757f4: eb15011f     	cmp	x8, x21
 42757f8: fa558262     	ccmp	x19, x21, #0x2, hi
 42757fc: 54000d69     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275800: aa1303e0     	mov	x0, x19
 4275804: aa1503e1     	mov	x1, x21
 4275808: aa1403e2     	mov	x2, x20
 427580c: 94f666b0     	bl	0x800f2cc <_ChromeMain+0x800a030>
 4275810: 38346a7f     	strb	wzr, [x19, x20]
 4275814: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4275818: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 427581c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4275820: d65f03c0     	ret
 4275824: b94002a8     	ldr	w8, [x21]
 4275828: b84032a9     	ldur	w9, [x21, #0x3]
 427582c: 528d2cca     	mov	w10, #0x6966            ; =26982
 4275830: 72acae4a     	movk	w10, #0x6572, lsl #16
 4275834: 6b0a011f     	cmp	w8, w10
 4275838: 528ccca8     	mov	w8, #0x6665             ; =26213
 427583c: 72af0de8     	movk	w8, #0x786f, lsl #16
 4275840: 7a480120     	ccmp	w9, w8, #0x0, eq
 4275844: 54fffd01     	b.ne	0x42757e4 <_ChromeMain+0x4270548>
 4275848: 528000e8     	mov	w8, #0x7                ; =7
 427584c: 39005e68     	strb	w8, [x19, #0x17]
 4275850: 91001e68     	add	x8, x19, #0x7
 4275854: 9004bd89     	adrp	x9, 0xda25000 <dyld_stub_binder+0xda25000>
 4275858: 91196929     	add	x9, x9, #0x65a
 427585c: eb09011f     	cmp	x8, x9
 4275860: fa498262     	ccmp	x19, x9, #0x2, hi
 4275864: 54000a29     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275868: 528ccca8     	mov	w8, #0x6665             ; =26213
 427586c: 72af0de8     	movk	w8, #0x786f, lsl #16
 4275870: b8003268     	stur	w8, [x19, #0x3]
 4275874: 528d28c8     	mov	w8, #0x6946             ; =26950
 4275878: 72acae48     	movk	w8, #0x6572, lsl #16
 427587c: b9000268     	str	w8, [x19]
 4275880: 39001e7f     	strb	wzr, [x19, #0x7]
 4275884: 17ffffe4     	b	0x4275814 <_ChromeMain+0x4270578>
 4275888: 528001a8     	mov	w8, #0xd                ; =13
 427588c: 39005e68     	strb	w8, [x19, #0x17]
 4275890: 91003669     	add	x9, x19, #0xd
 4275894: d004c548     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4275898: 9137b108     	add	x8, x8, #0xdec
 427589c: 14000006     	b	0x42758b4 <_ChromeMain+0x4270618>
 42758a0: 528001a8     	mov	w8, #0xd                ; =13
 42758a4: 39005e68     	strb	w8, [x19, #0x17]
 42758a8: 91003669     	add	x9, x19, #0xd
 42758ac: d004c548     	adrp	x8, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42758b0: 91365108     	add	x8, x8, #0xd94
 42758b4: eb08013f     	cmp	x9, x8
 42758b8: fa488262     	ccmp	x19, x8, #0x2, hi
 42758bc: 54000769     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 42758c0: f9400109     	ldr	x9, [x8]
 42758c4: f9000269     	str	x9, [x19]
 42758c8: f8405108     	ldur	x8, [x8, #0x5]
 42758cc: f8005268     	stur	x8, [x19, #0x5]
 42758d0: 3900367f     	strb	wzr, [x19, #0xd]
 42758d4: 17ffffd0     	b	0x4275814 <_ChromeMain+0x4270578>
 42758d8: b94002a8     	ldr	w8, [x21]
 42758dc: 79400aa9     	ldrh	w9, [x21, #0x4]
 42758e0: 528d0c6a     	mov	w10, #0x6863            ; =26723
 42758e4: 72adee4a     	movk	w10, #0x6f72, lsl #16
 42758e8: 6b0a011f     	cmp	w8, w10
 42758ec: 528cada8     	mov	w8, #0x656d             ; =25965
 42758f0: 7a480120     	ccmp	w9, w8, #0x0, eq
 42758f4: 54fffd60     	b.eq	0x42758a0 <_ChromeMain+0x4270604>
 42758f8: b94002a8     	ldr	w8, [x21]
 42758fc: 79400aa9     	ldrh	w9, [x21, #0x4]
 4275900: 528cad0a     	mov	w10, #0x6568            ; =25960
 4275904: 72ad2d8a     	movk	w10, #0x696c, lsl #16
 4275908: 6b0a011f     	cmp	w8, w10
 427590c: 528daea8     	mov	w8, #0x6d75             ; =28021
 4275910: 7a480120     	ccmp	w9, w8, #0x0, eq
 4275914: 540002c0     	b.eq	0x427596c <_ChromeMain+0x42706d0>
 4275918: b94002a8     	ldr	w8, [x21]
 427591c: 79400aa9     	ldrh	w9, [x21, #0x4]
 4275920: 528c2e6a     	mov	w10, #0x6173            ; =24947
 4275924: 72ac2cca     	movk	w10, #0x6166, lsl #16
 4275928: 6b0a011f     	cmp	w8, w10
 427592c: 528d2e48     	mov	w8, #0x6972             ; =26994
 4275930: 7a480120     	ccmp	w9, w8, #0x0, eq
 4275934: 54fff581     	b.ne	0x42757e4 <_ChromeMain+0x4270548>
 4275938: 528000c8     	mov	w8, #0x6                ; =6
 427593c: 39005e68     	strb	w8, [x19, #0x17]
 4275940: 91001a68     	add	x8, x19, #0x6
 4275944: 9004bd89     	adrp	x9, 0xda25000 <dyld_stub_binder+0xda25000>
 4275948: 9119bd29     	add	x9, x9, #0x66f
 427594c: eb09011f     	cmp	x8, x9
 4275950: fa498262     	ccmp	x19, x9, #0x2, hi
 4275954: 540002a9     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 4275958: 528d2e48     	mov	w8, #0x6972             ; =26994
 427595c: 79000a68     	strh	w8, [x19, #0x4]
 4275960: 528c2a68     	mov	w8, #0x6153             ; =24915
 4275964: 72ac2cc8     	movk	w8, #0x6166, lsl #16
 4275968: 1400000d     	b	0x427599c <_ChromeMain+0x4270700>
 427596c: 528000c8     	mov	w8, #0x6                ; =6
 4275970: 39005e68     	strb	w8, [x19, #0x17]
 4275974: 91001a68     	add	x8, x19, #0x6
 4275978: d004c549     	adrp	x9, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 427597c: 91389529     	add	x9, x9, #0xe25
 4275980: eb09011f     	cmp	x8, x9
 4275984: fa498262     	ccmp	x19, x9, #0x2, hi
 4275988: 54000109     	b.ls	0x42759a8 <_ChromeMain+0x427070c>
 427598c: 528daea8     	mov	w8, #0x6d75             ; =28021
 4275990: 79000a68     	strh	w8, [x19, #0x4]
 4275994: 528ca908     	mov	w8, #0x6548             ; =25928
 4275998: 72ad2d88     	movk	w8, #0x696c, lsl #16
 427599c: b9000268     	str	w8, [x19]
 42759a0: 39001a7f     	strb	wzr, [x19, #0x6]
 42759a4: 17ffff9c     	b	0x4275814 <_ChromeMain+0x4270578>
 42759a8: d4200020     	brk	#0x1
 42759ac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
