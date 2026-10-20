
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46456e8: d63f0100     	blr	x8
 46456ec: 1e780009     	fcvtzs	w9, d0
 46456f0: b941c288     	ldr	w8, [x20, #0x1c0]
 46456f4: 17ffff9a     	b	0x464555c <_ChromeMain+0x46402c0>
 46456f8: d10243ff     	sub	sp, sp, #0x90
 46456fc: a9036ffc     	stp	x28, x27, [sp, #0x30]
 4645700: a90467fa     	stp	x26, x25, [sp, #0x40]
 4645704: a9055ff8     	stp	x24, x23, [sp, #0x50]
 4645708: a90657f6     	stp	x22, x21, [sp, #0x60]
 464570c: a9074ff4     	stp	x20, x19, [sp, #0x70]
 4645710: a9087bfd     	stp	x29, x30, [sp, #0x80]
 4645714: 910203fd     	add	x29, sp, #0x80
 4645718: aa0203f4     	mov	x20, x2
 464571c: aa0003f3     	mov	x19, x0
 4645720: 396e4008     	ldrb	w8, [x0, #0xb90]
 4645724: 35000288     	cbnz	w8, 0x4645774 <_ChromeMain+0x46404d8>
 4645728: b9400288     	ldr	w8, [x20]
 464572c: 7100051f     	cmp	w8, #0x1
 4645730: 5400058c     	b.gt	0x46457e0 <_ChromeMain+0x4640544>
 4645734: 340009a8     	cbz	w8, 0x4645868 <_ChromeMain+0x46405cc>
 4645738: 7100051f     	cmp	w8, #0x1
 464573c: 54000721     	b.ne	0x4645820 <_ChromeMain+0x4640584>
 4645740: 3940a288     	ldrb	w8, [x20, #0x28]
 4645744: 35003968     	cbnz	w8, 0x4645e70 <_ChromeMain+0x4640bd4>
 4645748: f9400a88     	ldr	x8, [x20, #0x10]
 464574c: 8b080508     	add	x8, x8, x8, lsl #1
 4645750: d37df109     	lsl	x9, x8, #3
 4645754: b4000669     	cbz	x9, 0x4645820 <_ChromeMain+0x4640584>
 4645758: f940069a     	ldr	x26, [x20, #0x8]
 464575c: 8b080f58     	add	x24, x26, x8, lsl #3
 4645760: 52820308     	mov	w8, #0x1018             ; =4120
 4645764: 8b080279     	add	x25, x19, x8
 4645768: 5282039b     	mov	w27, #0x101c            ; =4124
 464576c: 5280003c     	mov	w28, #0x1               ; =1
 4645770: 14000073     	b	0x464593c <_ChromeMain+0x46406a0>
 4645774: 52800028     	mov	w8, #0x1                ; =1
 4645778: 392e4668     	strb	w8, [x19, #0xb91]
 464577c: b9400288     	ldr	w8, [x20]
 4645780: 7100091f     	cmp	w8, #0x2
 4645784: 54000621     	b.ne	0x4645848 <_ChromeMain+0x46405ac>
 4645788: 3940a288     	ldrb	w8, [x20, #0x28]
 464578c: 7100051f     	cmp	w8, #0x1
 4645790: 54003701     	b.ne	0x4645e70 <_ChromeMain+0x4640bd4>
 4645794: f9400a88     	ldr	x8, [x20, #0x10]
 4645798: 8b080508     	add	x8, x8, x8, lsl #1
 464579c: d37ced15     	lsl	x21, x8, #4
 46457a0: b4000555     	cbz	x21, 0x4645848 <_ChromeMain+0x46405ac>
 46457a4: f9400688     	ldr	x8, [x20, #0x8]
 46457a8: 91002114     	add	x20, x8, #0x8
 46457ac: f8430681     	ldr	x1, [x20], #0x30
 46457b0: aa1303e0     	mov	x0, x19
 46457b4: 97fff5d9     	bl	0x4642f18 <_ChromeMain+0x463dc7c>
 46457b8: f100c2b5     	subs	x21, x21, #0x30
 46457bc: 54ffff81     	b.ne	0x46457ac <_ChromeMain+0x4640510>
 46457c0: 14000022     	b	0x4645848 <_ChromeMain+0x46405ac>
 46457c4: 7100111f     	cmp	w8, #0x4
 46457c8: 540002c1     	b.ne	0x4645820 <_ChromeMain+0x4640584>
 46457cc: aa1403e0     	mov	x0, x20
 46457d0: 94dc680c     	bl	0x7d5f800 <_ChromeMain+0x7d5a564>
 46457d4: f9400001     	ldr	x1, [x0]
 46457d8: b4000241     	cbz	x1, 0x4645820 <_ChromeMain+0x4640584>
 46457dc: 14000147     	b	0x4645cf8 <_ChromeMain+0x4640a5c>
 46457e0: 7100091f     	cmp	w8, #0x2
 46457e4: 54ffff01     	b.ne	0x46457c4 <_ChromeMain+0x4640528>
 46457e8: 3940a288     	ldrb	w8, [x20, #0x28]
 46457ec: 7100051f     	cmp	w8, #0x1
 46457f0: 54003401     	b.ne	0x4645e70 <_ChromeMain+0x4640bd4>
 46457f4: f9400a88     	ldr	x8, [x20, #0x10]
 46457f8: 8b080508     	add	x8, x8, x8, lsl #1
 46457fc: d37ced15     	lsl	x21, x8, #4
 4645800: b4000115     	cbz	x21, 0x4645820 <_ChromeMain+0x4640584>
 4645804: f9400688     	ldr	x8, [x20, #0x8]
 4645808: 91002116     	add	x22, x8, #0x8
 464580c: f84306c1     	ldr	x1, [x22], #0x30
 4645810: aa1303e0     	mov	x0, x19
 4645814: 97fff5c1     	bl	0x4642f18 <_ChromeMain+0x463dc7c>
 4645818: f100c2b5     	subs	x21, x21, #0x30
 464581c: 54ffff81     	b.ne	0x464580c <_ChromeMain+0x4640570>
 4645820: aa1303e0     	mov	x0, x19
 4645824: 94000666     	bl	0x46471bc <_ChromeMain+0x4641f20>
 4645828: b9400288     	ldr	w8, [x20]
 464582c: 34000068     	cbz	w8, 0x4645838 <_ChromeMain+0x464059c>
 4645830: aa1303e0     	mov	x0, x19
 4645834: 97ffee0a     	bl	0x464105c <_ChromeMain+0x463bdc0>
 4645838: aa1303e0     	mov	x0, x19
 464583c: 97ffcc45     	bl	0x4638950 <_ChromeMain+0x46336b4>
 4645840: aa1303e0     	mov	x0, x19
 4645844: 97ff9a51     	bl	0x462c188 <_ChromeMain+0x4626eec>
 4645848: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 464584c: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4645850: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4645854: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4645858: a94467fa     	ldp	x26, x25, [sp, #0x40]
 464585c: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 4645860: 910243ff     	add	sp, sp, #0x90
 4645864: d65f03c0     	ret
 4645868: aa1303e0     	mov	x0, x19
 464586c: 97ffcc39     	bl	0x4638950 <_ChromeMain+0x46336b4>
 4645870: aa1303e0     	mov	x0, x19
 4645874: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4645878: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 464587c: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4645880: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 4645884: a94467fa     	ldp	x26, x25, [sp, #0x40]
 4645888: a9436ffc     	ldp	x28, x27, [sp, #0x30]
 464588c: 910243ff     	add	sp, sp, #0x90
 4645890: 17ff9a3e     	b	0x462c188 <_ChromeMain+0x4626eec>
 4645894: f9400348     	ldr	x8, [x26]
 4645898: b9401108     	ldr	w8, [x8, #0x10]
 464589c: b90023e8     	str	w8, [sp, #0x20]
 46458a0: 913ec260     	add	x0, x19, #0xfb0
 46458a4: 910083e1     	add	x1, sp, #0x20
 46458a8: 910083e2     	add	x2, sp, #0x20
 46458ac: 9499051d     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 46458b0: 1400000d     	b	0x46458e4 <_ChromeMain+0x4640648>
 46458b4: 52800016     	mov	w22, #0x0               ; =0
 46458b8: 5280003c     	mov	w28, #0x1               ; =1
 46458bc: 14000002     	b	0x46458c4 <_ChromeMain+0x4640628>
 46458c0: 52800016     	mov	w22, #0x0               ; =0
 46458c4: aa1303e0     	mov	x0, x19
 46458c8: aa1503e1     	mov	x1, x21
 46458cc: 94000362     	bl	0x4646654 <_ChromeMain+0x46413b8>
 46458d0: 370000a0     	tbnz	w0, #0x0, 0x46458e4 <_ChromeMain+0x4640648>
 46458d4: f9435268     	ldr	x8, [x19, #0x6a0]
 46458d8: b4000068     	cbz	x8, 0x46458e4 <_ChromeMain+0x4640648>
 46458dc: f9444508     	ldr	x8, [x8, #0x888]
 46458e0: b5fffda8     	cbnz	x8, 0x4645894 <_ChromeMain+0x46405f8>
 46458e4: f9400341     	ldr	x1, [x26]
 46458e8: aa1303e0     	mov	x0, x19
 46458ec: 97ffe365     	bl	0x463e680 <_ChromeMain+0x46393e4>
 46458f0: 34000216     	cbz	w22, 0x4645930 <_ChromeMain+0x4640694>
 46458f4: f9424e61     	ldr	x1, [x19, #0x498]
 46458f8: b40001c1     	cbz	x1, 0x4645930 <_ChromeMain+0x4640694>
 46458fc: 390083ff     	strb	wzr, [sp, #0x20]
 4645900: 910083e2     	add	x2, sp, #0x20
 4645904: aa1303e0     	mov	x0, x19
 4645908: 97fff35a     	bl	0x4642670 <_ChromeMain+0x463d3d4>
 464590c: 394083e8     	ldrb	w8, [sp, #0x20]
 4645910: 34000108     	cbz	w8, 0x4645930 <_ChromeMain+0x4640694>
 4645914: f9423e60     	ldr	x0, [x19, #0x478]
 4645918: b4000060     	cbz	x0, 0x4645924 <_ChromeMain+0x4640688>
 464591c: 52800001     	mov	w1, #0x0                ; =0
 4645920: 96ffaad5     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4645924: aa1303e0     	mov	x0, x19
 4645928: 52800001     	mov	w1, #0x0                ; =0
 464592c: 96ffaad2     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4645930: 9100635a     	add	x26, x26, #0x18
 4645934: eb18035f     	cmp	x26, x24
 4645938: 54fff740     	b.eq	0x4645820 <_ChromeMain+0x4640584>
 464593c: f9400341     	ldr	x1, [x26]
 4645940: b4ffff81     	cbz	x1, 0x4645930 <_ChromeMain+0x4640694>
 4645944: aa1303e0     	mov	x0, x19
 4645948: 97ffb6a6     	bl	0x46333e0 <_ChromeMain+0x462e144>
 464594c: f9400341     	ldr	x1, [x26]
 4645950: aa1303e0     	mov	x0, x19
 4645954: 9400014f     	bl	0x4645e90 <_ChromeMain+0x4640bf4>
 4645958: f9400355     	ldr	x21, [x26]
 464595c: aa1303e0     	mov	x0, x19
 4645960: aa1503e1     	mov	x1, x21
 4645964: 94001f6d     	bl	0x464d718 <_ChromeMain+0x464847c>
 4645968: 34000120     	cbz	w0, 0x464598c <_ChromeMain+0x46406f0>
 464596c: b94012a8     	ldr	w8, [x21, #0x10]
 4645970: 387b6a69     	ldrb	w9, [x19, x27]
 4645974: 350000a9     	cbnz	w9, 0x4645988 <_ChromeMain+0x46406ec>
 4645978: b40020b9     	cbz	x25, 0x4645d8c <_ChromeMain+0x4640af0>
 464597c: b9000328     	str	w8, [x25]
 4645980: 383b6a7c     	strb	w28, [x19, x27]
 4645984: 14000002     	b	0x464598c <_ChromeMain+0x46406f0>
 4645988: b9000328     	str	w8, [x25]
 464598c: aa1303e0     	mov	x0, x19
 4645990: 940002b7     	bl	0x464646c <_ChromeMain+0x46411d0>
 4645994: f9400355     	ldr	x21, [x26]
 4645998: b4fff955     	cbz	x21, 0x46458c0 <_ChromeMain+0x4640624>
 464599c: 397fe268     	ldrb	w8, [x19, #0xff8]
 46459a0: 34fff908     	cbz	w8, 0x46458c0 <_ChromeMain+0x4640624>
 46459a4: 394186a8     	ldrb	w8, [x21, #0x61]
 46459a8: 3707f8c8     	tbnz	w8, #0x0, 0x46458c0 <_ChromeMain+0x4640624>
 46459ac: 3941e2a8     	ldrb	w8, [x21, #0x78]
 46459b0: 3707f888     	tbnz	w8, #0x0, 0x46458c0 <_ChromeMain+0x4640624>
 46459b4: 39624268     	ldrb	w8, [x19, #0x890]
 46459b8: 34fff848     	cbz	w8, 0x46458c0 <_ChromeMain+0x4640624>
 46459bc: b94012b7     	ldr	w23, [x21, #0x10]
 46459c0: f9486e68     	ldr	x8, [x19, #0x10d8]
 46459c4: f9487269     	ldr	x9, [x19, #0x10e0]
 46459c8: d37ef52a     	lsl	x10, x9, #2
 46459cc: b400070a     	cbz	x10, 0x4645aac <_ChromeMain+0x4640810>
 46459d0: 9342fd4b     	asr	x11, x10, #2
 46459d4: aa0803ea     	mov	x10, x8
 46459d8: d341fd6c     	lsr	x12, x11, #1
 46459dc: 8b0c094d     	add	x13, x10, x12, lsl #2
 46459e0: b84045ae     	ldr	w14, [x13], #0x4
 46459e4: aa6b07ef     	mvn	x15, x11, lsr #1
 46459e8: 8b0f016b     	add	x11, x11, x15
 46459ec: 6b1701df     	cmp	w14, w23
 46459f0: 9a8cb16b     	csel	x11, x11, x12, lt
 46459f4: 9a8ab1aa     	csel	x10, x13, x10, lt
 46459f8: b5ffff0b     	cbnz	x11, 0x46459d8 <_ChromeMain+0x464073c>
 46459fc: 8b090908     	add	x8, x8, x9, lsl #2
 4645a00: eb08015f     	cmp	x10, x8
 4645a04: 54000080     	b.eq	0x4645a14 <_ChromeMain+0x4640778>
 4645a08: b9400148     	ldr	w8, [x10]
 4645a0c: 6b0802ff     	cmp	w23, w8
 4645a10: 54fff58a     	b.ge	0x46458c0 <_ChromeMain+0x4640624>
 4645a14: f9484a76     	ldr	x22, [x19, #0x1090]
 4645a18: f9484e68     	ldr	x8, [x19, #0x1098]
 4645a1c: d37ef50f     	lsl	x15, x8, #2
 4645a20: aa1603e9     	mov	x9, x22
 4645a24: b400018f     	cbz	x15, 0x4645a54 <_ChromeMain+0x46407b8>
 4645a28: 9342fdea     	asr	x10, x15, #2
 4645a2c: aa1603e9     	mov	x9, x22
 4645a30: d341fd4b     	lsr	x11, x10, #1
 4645a34: 8b0b092c     	add	x12, x9, x11, lsl #2
 4645a38: b840458d     	ldr	w13, [x12], #0x4
 4645a3c: aa6a07ee     	mvn	x14, x10, lsr #1
 4645a40: 8b0e014a     	add	x10, x10, x14
 4645a44: 6b1701bf     	cmp	w13, w23
 4645a48: 9a8bb14a     	csel	x10, x10, x11, lt
 4645a4c: 9a89b189     	csel	x9, x12, x9, lt
 4645a50: b5ffff0a     	cbnz	x10, 0x4645a30 <_ChromeMain+0x4640794>
 4645a54: 8b080aca     	add	x10, x22, x8, lsl #2
 4645a58: eb0a013f     	cmp	x9, x10
 4645a5c: 54000080     	b.eq	0x4645a6c <_ChromeMain+0x46407d0>
 4645a60: b9400128     	ldr	w8, [x9]
 4645a64: 6b0802ff     	cmp	w23, w8
 4645a68: 54fff26a     	b.ge	0x46458b4 <_ChromeMain+0x4640618>
 4645a6c: f948d668     	ldr	x8, [x19, #0x11a8]
 4645a70: 52801709     	mov	w9, #0xb8               ; =184
 4645a74: 9b097d1c     	mul	x28, x8, x9
 4645a78: b4fff1fc     	cbz	x28, 0x46458b4 <_ChromeMain+0x4640618>
 4645a7c: a9002bef     	stp	x15, x10, [sp]
 4645a80: a90163f9     	stp	x25, x24, [sp, #0x10]
 4645a84: f948d27b     	ldr	x27, [x19, #0x11a0]
 4645a88: 397fde68     	ldrb	w8, [x19, #0xff7]
 4645a8c: 13001d09     	sxtb	w9, w8
 4645a90: f947f66a     	ldr	x10, [x19, #0xfe8]
 4645a94: 7100013f     	cmp	w9, #0x0
 4645a98: 9a884158     	csel	x24, x10, x8, mi
 4645a9c: f947f268     	ldr	x8, [x19, #0xfe0]
 4645aa0: 913f8269     	add	x9, x19, #0xfe0
 4645aa4: 9a894119     	csel	x25, x8, x9, mi
 4645aa8: 1400000a     	b	0x4645ad0 <_ChromeMain+0x4640834>
 4645aac: aa0803ea     	mov	x10, x8
 4645ab0: 17ffffd3     	b	0x46459fc <_ChromeMain+0x4640760>
 4645ab4: 52800016     	mov	w22, #0x0               ; =0
 4645ab8: a94163f9     	ldp	x25, x24, [sp, #0x10]
 4645abc: 5282039b     	mov	w27, #0x101c            ; =4124
 4645ac0: 17ffff7e     	b	0x46458b8 <_ChromeMain+0x464061c>
 4645ac4: 9102e37b     	add	x27, x27, #0xb8
 4645ac8: f102e39c     	subs	x28, x28, #0xb8
 4645acc: 54ffff40     	b.eq	0x4645ab4 <_ChromeMain+0x4640818>
 4645ad0: 39405f69     	ldrb	w9, [x27, #0x17]
 4645ad4: 13001d28     	sxtb	w8, w9
 4645ad8: f940076a     	ldr	x10, [x27, #0x8]
 4645adc: 7100011f     	cmp	w8, #0x0
 4645ae0: 9a894149     	csel	x9, x10, x9, mi
 4645ae4: eb18013f     	cmp	x9, x24
 4645ae8: 54fffee1     	b.ne	0x4645ac4 <_ChromeMain+0x4640828>
 4645aec: f9400369     	ldr	x9, [x27]
 4645af0: 7100011f     	cmp	w8, #0x0
 4645af4: 9a9b4120     	csel	x0, x9, x27, mi
 4645af8: aa1903e1     	mov	x1, x25
 4645afc: aa1803e2     	mov	x2, x24
 4645b00: 94e70f58     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4645b04: 35fffe00     	cbnz	w0, 0x4645ac4 <_ChromeMain+0x4640828>
 4645b08: b9002ff7     	str	w23, [sp, #0x2c]
 4645b0c: f94003e8     	ldr	x8, [sp]
 4645b10: b40001e8     	cbz	x8, 0x4645b4c <_ChromeMain+0x46408b0>
 4645b14: 9342fd08     	asr	x8, x8, #2
 4645b18: a94163f9     	ldp	x25, x24, [sp, #0x10]
 4645b1c: 5282039b     	mov	w27, #0x101c            ; =4124
 4645b20: 5280003c     	mov	w28, #0x1               ; =1
 4645b24: d341fd09     	lsr	x9, x8, #1
 4645b28: 8b090aca     	add	x10, x22, x9, lsl #2
 4645b2c: b840454b     	ldr	w11, [x10], #0x4
 4645b30: aa6807ec     	mvn	x12, x8, lsr #1
 4645b34: 8b0c0108     	add	x8, x8, x12
 4645b38: 6b17017f     	cmp	w11, w23
 4645b3c: 9a89b108     	csel	x8, x8, x9, lt
 4645b40: 9a96b156     	csel	x22, x10, x22, lt
 4645b44: b5ffff08     	cbnz	x8, 0x4645b24 <_ChromeMain+0x4640888>
 4645b48: 14000004     	b	0x4645b58 <_ChromeMain+0x46408bc>
 4645b4c: a94163f9     	ldp	x25, x24, [sp, #0x10]
 4645b50: 5282039b     	mov	w27, #0x101c            ; =4124
 4645b54: 5280003c     	mov	w28, #0x1               ; =1
 4645b58: f94007e2     	ldr	x2, [sp, #0x8]
 4645b5c: eb0202df     	cmp	x22, x2
 4645b60: 540000c0     	b.eq	0x4645b78 <_ChromeMain+0x46408dc>
 4645b64: b94002c8     	ldr	w8, [x22]
 4645b68: 6b0802ff     	cmp	w23, w8
 4645b6c: 52800088     	mov	w8, #0x4                ; =4
 4645b70: 9a88b3e8     	csel	x8, xzr, x8, lt
 4645b74: 8b0802c2     	add	x2, x22, x8
 4645b78: 52821208     	mov	w8, #0x1090             ; =4240
 4645b7c: 8b080260     	add	x0, x19, x8
 4645b80: aa1603e1     	mov	x1, x22
 4645b84: 94194f6b     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4645b88: f9480268     	ldr	x8, [x19, #0x1000]
 4645b8c: f9480669     	ldr	x9, [x19, #0x1008]
 4645b90: d37be92a     	lsl	x10, x9, #5
 4645b94: b4000f0a     	cbz	x10, 0x4645d74 <_ChromeMain+0x4640ad8>
 4645b98: 9345fd4a     	asr	x10, x10, #5
 4645b9c: aa0803e1     	mov	x1, x8
 4645ba0: d341fd4b     	lsr	x11, x10, #1
 4645ba4: 8b0b142c     	add	x12, x1, x11, lsl #5
 4645ba8: b842058d     	ldr	w13, [x12], #0x20
 4645bac: aa6a07ee     	mvn	x14, x10, lsr #1
 4645bb0: 8b0e014a     	add	x10, x10, x14
 4645bb4: 6b1701bf     	cmp	w13, w23
 4645bb8: 9a8bb14a     	csel	x10, x10, x11, lt
 4645bbc: 9a81b181     	csel	x1, x12, x1, lt
 4645bc0: b5ffff0a     	cbnz	x10, 0x4645ba0 <_ChromeMain+0x4640904>
 4645bc4: 8b091508     	add	x8, x8, x9, lsl #5
 4645bc8: eb08003f     	cmp	x1, x8
 4645bcc: 54000080     	b.eq	0x4645bdc <_ChromeMain+0x4640940>
 4645bd0: b9400028     	ldr	w8, [x1]
 4645bd4: 6b0802ff     	cmp	w23, w8
 4645bd8: 54000e0a     	b.ge	0x4645d98 <_ChromeMain+0x4640afc>
 4645bdc: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 4645be0: 9100b3e2     	add	x2, sp, #0x2c
 4645be4: 913f8263     	add	x3, x19, #0xfe0
 4645be8: 9400f164     	bl	0x4682178 <_ChromeMain+0x467cedc>
 4645bec: f947e668     	ldr	x8, [x19, #0xfc8]
 4645bf0: f947ea69     	ldr	x9, [x19, #0xfd0]
 4645bf4: d37be92a     	lsl	x10, x9, #5
 4645bf8: b4000c2a     	cbz	x10, 0x4645d7c <_ChromeMain+0x4640ae0>
 4645bfc: 9345fd4a     	asr	x10, x10, #5
 4645c00: aa0803e1     	mov	x1, x8
 4645c04: d341fd4b     	lsr	x11, x10, #1
 4645c08: 8b0b142c     	add	x12, x1, x11, lsl #5
 4645c0c: b842058d     	ldr	w13, [x12], #0x20
 4645c10: aa6a07ee     	mvn	x14, x10, lsr #1
 4645c14: 8b0e014a     	add	x10, x10, x14
 4645c18: 6b1701bf     	cmp	w13, w23
 4645c1c: 9a8bb14a     	csel	x10, x10, x11, lt
 4645c20: 9a81b181     	csel	x1, x12, x1, lt
 4645c24: b5ffff0a     	cbnz	x10, 0x4645c04 <_ChromeMain+0x4640968>
 4645c28: 8b091508     	add	x8, x8, x9, lsl #5
 4645c2c: eb08003f     	cmp	x1, x8
 4645c30: 54000080     	b.eq	0x4645c40 <_ChromeMain+0x46409a4>
 4645c34: b9400028     	ldr	w8, [x1]
 4645c38: 6b0802ff     	cmp	w23, w8
 4645c3c: 54000d2a     	b.ge	0x4645de0 <_ChromeMain+0x4640b44>
 4645c40: 913f2260     	add	x0, x19, #0xfc8
 4645c44: 9100b3e2     	add	x2, sp, #0x2c
 4645c48: 913f8263     	add	x3, x19, #0xfe0
 4645c4c: 9400f14b     	bl	0x4682178 <_ChromeMain+0x467cedc>
 4645c50: 90052b68     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4645c54: f9468d08     	ldr	x8, [x8, #0xd18]
 4645c58: d63f0100     	blr	x8
 4645c5c: f90013e0     	str	x0, [sp, #0x20]
 4645c60: f9485668     	ldr	x8, [x19, #0x10a8]
 4645c64: f9485a69     	ldr	x9, [x19, #0x10b0]
 4645c68: d37ced2a     	lsl	x10, x9, #4
 4645c6c: b40008ca     	cbz	x10, 0x4645d84 <_ChromeMain+0x4640ae8>
 4645c70: 9344fd4a     	asr	x10, x10, #4
 4645c74: aa0803e1     	mov	x1, x8
 4645c78: d341fd4b     	lsr	x11, x10, #1
 4645c7c: 8b0b102c     	add	x12, x1, x11, lsl #4
 4645c80: b841058d     	ldr	w13, [x12], #0x10
 4645c84: aa6a07ee     	mvn	x14, x10, lsr #1
 4645c88: 8b0e014a     	add	x10, x10, x14
 4645c8c: 6b1701bf     	cmp	w13, w23
 4645c90: 9a8bb14a     	csel	x10, x10, x11, lt
 4645c94: 9a81b181     	csel	x1, x12, x1, lt
 4645c98: b5ffff0a     	cbnz	x10, 0x4645c78 <_ChromeMain+0x46409dc>
 4645c9c: 8b091108     	add	x8, x8, x9, lsl #4
 4645ca0: eb08003f     	cmp	x1, x8
 4645ca4: 54000080     	b.eq	0x4645cb4 <_ChromeMain+0x4640a18>
 4645ca8: b9400028     	ldr	w8, [x1]
 4645cac: 6b0802ff     	cmp	w23, w8
 4645cb0: 5400070a     	b.ge	0x4645d90 <_ChromeMain+0x4640af4>
 4645cb4: 52821508     	mov	w8, #0x10a8             ; =4264
 4645cb8: 8b080260     	add	x0, x19, x8
 4645cbc: 9100b3e2     	add	x2, sp, #0x2c
 4645cc0: 910083e3     	add	x3, sp, #0x20
 4645cc4: 9400f211     	bl	0x4682508 <_ChromeMain+0x467d26c>
 4645cc8: 397fe268     	ldrb	w8, [x19, #0xff8]
 4645ccc: 34000108     	cbz	w8, 0x4645cec <_ChromeMain+0x4640a50>
 4645cd0: 39ffde68     	ldrsb	w8, [x19, #0xff7]
 4645cd4: 36f800a8     	tbz	w8, #0x1f, 0x4645ce8 <_ChromeMain+0x4640a4c>
 4645cd8: f947f260     	ldr	x0, [x19, #0xfe0]
 4645cdc: f947fa68     	ldr	x8, [x19, #0xff0]
 4645ce0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4645ce4: 96e70c75     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4645ce8: 393fe27f     	strb	wzr, [x19, #0xff8]
 4645cec: f9400355     	ldr	x21, [x26]
 4645cf0: 52800036     	mov	w22, #0x1               ; =1
 4645cf4: 17fffef4     	b	0x46458c4 <_ChromeMain+0x4640628>
 4645cf8: aa0003f5     	mov	x21, x0
 4645cfc: aa1303e0     	mov	x0, x19
 4645d00: 97ffb5b8     	bl	0x46333e0 <_ChromeMain+0x462e144>
 4645d04: f94002a1     	ldr	x1, [x21]
 4645d08: aa1303e0     	mov	x0, x19
 4645d0c: 94000061     	bl	0x4645e90 <_ChromeMain+0x4640bf4>
 4645d10: aa1303e0     	mov	x0, x19
 4645d14: 940001d6     	bl	0x464646c <_ChromeMain+0x46411d0>
 4645d18: f94002a1     	ldr	x1, [x21]
 4645d1c: aa1303e0     	mov	x0, x19
 4645d20: 9400024d     	bl	0x4646654 <_ChromeMain+0x46413b8>
 4645d24: 370000a0     	tbnz	w0, #0x0, 0x4645d38 <_ChromeMain+0x4640a9c>
 4645d28: f9435268     	ldr	x8, [x19, #0x6a0]
 4645d2c: b4000068     	cbz	x8, 0x4645d38 <_ChromeMain+0x4640a9c>
 4645d30: f9444508     	ldr	x8, [x8, #0x888]
 4645d34: b5000108     	cbnz	x8, 0x4645d54 <_ChromeMain+0x4640ab8>
 4645d38: f94002a1     	ldr	x1, [x21]
 4645d3c: aa1303e0     	mov	x0, x19
 4645d40: 94000486     	bl	0x4646f58 <_ChromeMain+0x4641cbc>
 4645d44: f94002a1     	ldr	x1, [x21]
 4645d48: aa1303e0     	mov	x0, x19
 4645d4c: 97ffe24d     	bl	0x463e680 <_ChromeMain+0x46393e4>
 4645d50: 17fffeb4     	b	0x4645820 <_ChromeMain+0x4640584>
 4645d54: f94002a8     	ldr	x8, [x21]
 4645d58: b9401108     	ldr	w8, [x8, #0x10]
 4645d5c: b90023e8     	str	w8, [sp, #0x20]
 4645d60: 913ec260     	add	x0, x19, #0xfb0
 4645d64: 910083e1     	add	x1, sp, #0x20
 4645d68: 910083e2     	add	x2, sp, #0x20
 4645d6c: 949903ed     	bl	0x6c86d20 <_ChromeMain+0x6c81a84>
 4645d70: 17fffff2     	b	0x4645d38 <_ChromeMain+0x4640a9c>
 4645d74: aa0803e1     	mov	x1, x8
 4645d78: 17ffff93     	b	0x4645bc4 <_ChromeMain+0x4640928>
 4645d7c: aa0803e1     	mov	x1, x8
 4645d80: 17ffffaa     	b	0x4645c28 <_ChromeMain+0x464098c>
 4645d84: aa0803e1     	mov	x1, x8
 4645d88: 17ffffc5     	b	0x4645c9c <_ChromeMain+0x4640a00>
 4645d8c: d4200020     	brk	#0x1
