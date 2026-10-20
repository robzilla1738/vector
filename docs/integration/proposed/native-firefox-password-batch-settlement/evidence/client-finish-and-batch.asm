
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4105824: 3945a008     	ldrb	w8, [x0, #0x168]
 4105828: 36000048     	tbz	w8, #0x0, 0x4105830 <_ChromeMain+0x4100594>
 410582c: d65f03c0     	ret
 4105830: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4105834: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4105838: 910043fd     	add	x29, sp, #0x10
 410583c: aa0003f3     	mov	x19, x0
 4105840: 52800028     	mov	w8, #0x1                ; =1
 4105844: 3905c408     	strb	w8, [x0, #0x171]
 4105848: 3905c801     	strb	w1, [x0, #0x172]
 410584c: 9105e008     	add	x8, x0, #0x178
 4105850: eb02011f     	cmp	x8, x2
 4105854: 54000120     	b.eq	0x4105878 <_ChromeMain+0x41005dc>
 4105858: 39c63e6a     	ldrsb	w10, [x19, #0x18f]
 410585c: 39405c49     	ldrb	w9, [x2, #0x17]
 4105860: 37f801ca     	tbnz	w10, #0x1f, 0x4105898 <_ChromeMain+0x41005fc>
 4105864: 37380129     	tbnz	w9, #0x7, 0x4105888 <_ChromeMain+0x41005ec>
 4105868: 3dc00040     	ldr	q0, [x2]
 410586c: f9400849     	ldr	x9, [x2, #0x10]
 4105870: f9000909     	str	x9, [x8, #0x10]
 4105874: 3d800100     	str	q0, [x8]
 4105878: aa1303e0     	mov	x0, x19
 410587c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4105880: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4105884: 1400000d     	b	0x41058b8 <_ChromeMain+0x410061c>
 4105888: a9400841     	ldp	x1, x2, [x2]
 410588c: 9105e260     	add	x0, x19, #0x178
 4105890: 970e8c89     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4105894: 17fffff9     	b	0x4105878 <_ChromeMain+0x41005dc>
 4105898: 13001d28     	sxtb	w8, w9
 410589c: 7100011f     	cmp	w8, #0x0
 41058a0: a9402848     	ldp	x8, x10, [x2]
 41058a4: 9a824101     	csel	x1, x8, x2, mi
 41058a8: 9a894142     	csel	x2, x10, x9, mi
 41058ac: 9105e260     	add	x0, x19, #0x178
 41058b0: 970e8cd4     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 41058b4: 17fffff1     	b	0x4105878 <_ChromeMain+0x41005dc>
 41058b8: 3945a008     	ldrb	w8, [x0, #0x168]
 41058bc: 37000228     	tbnz	w8, #0x0, 0x4105900 <_ChromeMain+0x4100664>
 41058c0: d10583ff     	sub	sp, sp, #0x160
 41058c4: a9136ffc     	stp	x28, x27, [sp, #0x130]
 41058c8: a9144ff4     	stp	x20, x19, [sp, #0x140]
 41058cc: a9157bfd     	stp	x29, x30, [sp, #0x150]
 41058d0: 910543fd     	add	x29, sp, #0x150
 41058d4: aa0003f3     	mov	x19, x0
 41058d8: 39464008     	ldrb	w8, [x0, #0x190]
 41058dc: 370000a8     	tbnz	w8, #0x0, 0x41058f0 <_ChromeMain+0x4100654>
 41058e0: 3945c668     	ldrb	w8, [x19, #0x171]
 41058e4: 34000068     	cbz	w8, 0x41058f0 <_ChromeMain+0x4100654>
 41058e8: 3945c268     	ldrb	w8, [x19, #0x170]
 41058ec: 360000c8     	tbz	w8, #0x0, 0x4105904 <_ChromeMain+0x4100668>
 41058f0: a9557bfd     	ldp	x29, x30, [sp, #0x150]
 41058f4: a9544ff4     	ldp	x20, x19, [sp, #0x140]
 41058f8: a9536ffc     	ldp	x28, x27, [sp, #0x130]
 41058fc: 910583ff     	add	sp, sp, #0x160
 4105900: d65f03c0     	ret
 4105904: 3945ca68     	ldrb	w8, [x19, #0x172]
 4105908: 37000168     	tbnz	w8, #0x0, 0x4105934 <_ChromeMain+0x4100698>
 410590c: f0057008     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4105910: b940b108     	ldr	w8, [x8, #0xb0]
 4105914: 7100051f     	cmp	w8, #0x1
 4105918: 540000ec     	b.gt	0x4105934 <_ChromeMain+0x4100698>
 410591c: 90055568     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4105920: b94b8908     	ldr	w8, [x8, #0xb88]
 4105924: 350000e8     	cbnz	w8, 0x4105940 <_ChromeMain+0x41006a4>
 4105928: f0057008     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 410592c: f9405d08     	ldr	x8, [x8, #0xb8]
 4105930: b5000088     	cbnz	x8, 0x4105940 <_ChromeMain+0x41006a4>
 4105934: aa1303e0     	mov	x0, x19
 4105938: 94dc6246     	bl	0x781e250 <_ChromeMain+0x7818fb4>
 410593c: 17ffffed     	b	0x41058f0 <_ChromeMain+0x4100654>
 4105940: d004cc61     	adrp	x1, 0xda93000 <dyld_stub_binder+0xda93000>
 4105944: 91122021     	add	x1, x1, #0x488
 4105948: 910003f4     	mov	x20, sp
 410594c: 910003e0     	mov	x0, sp
 4105950: 528024a2     	mov	w2, #0x125              ; =293
 4105954: 52800023     	mov	w3, #0x1                ; =1
 4105958: 97140dfd     	bl	0x60914c <_ChromeMain+0x603eb0>
 410595c: d004cc61     	adrp	x1, 0xda93000 <dyld_stub_binder+0xda93000>
 4105960: 91132821     	add	x1, x1, #0x4ca
 4105964: 91004280     	add	x0, x20, #0x10
 4105968: 528002e2     	mov	w2, #0x17               ; =23
 410596c: 96fc7ed4     	bl	0x254bc <_ChromeMain+0x20220>
 4105970: 9105e268     	add	x8, x19, #0x178
 4105974: 39863e69     	ldrsb	x9, [x19, #0x18f]
 4105978: a957ae6a     	ldp	x10, x11, [x19, #0x178]
 410597c: f100013f     	cmp	x9, #0x0
 4105980: 9a884141     	csel	x1, x10, x8, mi
 4105984: 7100013f     	cmp	w9, #0x0
 4105988: 9a894162     	csel	x2, x11, x9, mi
 410598c: 96fc7ecc     	bl	0x254bc <_ChromeMain+0x20220>
 4105990: 910003e0     	mov	x0, sp
 4105994: 97140dbb     	bl	0x609080 <_ChromeMain+0x603de4>
 4105998: 17ffffe7     	b	0x4105934 <_ChromeMain+0x4100698>
 410599c: d10143ff     	sub	sp, sp, #0x50
 41059a0: a90257f6     	stp	x22, x21, [sp, #0x20]
 41059a4: a9034ff4     	stp	x20, x19, [sp, #0x30]
 41059a8: a9047bfd     	stp	x29, x30, [sp, #0x40]
 41059ac: 910103fd     	add	x29, sp, #0x40
 41059b0: 3945a008     	ldrb	w8, [x0, #0x168]
 41059b4: 370009a8     	tbnz	w8, #0x0, 0x4105ae8 <_ChromeMain+0x410084c>
 41059b8: aa0103f4     	mov	x20, x1
 41059bc: aa0003f3     	mov	x19, x0
 41059c0: 7100203f     	cmp	w1, #0x8
 41059c4: 54000dc1     	b.ne	0x4105b7c <_ChromeMain+0x41008e0>
 41059c8: b940ea68     	ldr	w8, [x19, #0xe8]
 41059cc: 7100091f     	cmp	w8, #0x2
 41059d0: 54000d61     	b.ne	0x4105b7c <_ChromeMain+0x41008e0>
 41059d4: 3945a668     	ldrb	w8, [x19, #0x169]
 41059d8: 34000968     	cbz	w8, 0x4105b04 <_ChromeMain+0x4100868>
 41059dc: 3945aa68     	ldrb	w8, [x19, #0x16a]
 41059e0: 34000928     	cbz	w8, 0x4105b04 <_ChromeMain+0x4100868>
 41059e4: b9416e68     	ldr	w8, [x19, #0x16c]
 41059e8: f9403e69     	ldr	x9, [x19, #0x78]
 41059ec: eb08013f     	cmp	x9, x8
 41059f0: 540008a1     	b.ne	0x4105b04 <_ChromeMain+0x4100868>
 41059f4: 34000dc8     	cbz	w8, 0x4105bac <_ChromeMain+0x4100910>
 41059f8: 52800035     	mov	w21, #0x1               ; =1
 41059fc: 3905c275     	strb	w21, [x19, #0x170]
 4105a00: f940b274     	ldr	x20, [x19, #0x160]
 4105a04: f9403a69     	ldr	x9, [x19, #0x70]
 4105a08: a900a3e9     	stp	x9, x8, [sp, #0x8]
 4105a0c: f9404268     	ldr	x8, [x19, #0x80]
 4105a10: a9077e7f     	stp	xzr, xzr, [x19, #0x70]
 4105a14: f900427f     	str	xzr, [x19, #0x80]
 4105a18: f9000fe8     	str	x8, [sp, #0x18]
 4105a1c: b40000b3     	cbz	x19, 0x4105a30 <_ChromeMain+0x4100794>
 4105a20: b9400a68     	ldr	w8, [x19, #0x8]
 4105a24: 31000508     	adds	w8, w8, #0x1
 4105a28: b9000a68     	str	w8, [x19, #0x8]
 4105a2c: 54000ea2     	b.hs	0x4105c00 <_ChromeMain+0x4100964>
 4105a30: 52800700     	mov	w0, #0x38               ; =56
 4105a34: 96fc264d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4105a38: aa0003e2     	mov	x2, x0
 4105a3c: b9000015     	str	w21, [x0]
 4105a40: b0ff22c8     	adrp	x8, 0x255e000 <_ChromeMain+0x2558d64>
 4105a44: 91250108     	add	x8, x8, #0x940
 4105a48: 10002ac9     	adr	x9, 0x4105fa0 <_ChromeMain+0x4100d04>
 4105a4c: d503201f     	nop
 4105a50: a900a408     	stp	x8, x9, [x0, #0x8]
 4105a54: 90ff22c8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4105a58: 912c0108     	add	x8, x8, #0xb00
 4105a5c: 10002489     	adr	x9, 0x4105eec <_ChromeMain+0x4100c50>
 4105a60: d503201f     	nop
 4105a64: a901a408     	stp	x8, x9, [x0, #0x18]
 4105a68: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4105a6c: 910023e1     	add	x1, sp, #0x8
 4105a70: aa1403e0     	mov	x0, x20
 4105a74: 94000302     	bl	0x410667c <_ChromeMain+0x41013e0>
 4105a78: f94007f3     	ldr	x19, [sp, #0x8]
 4105a7c: b4000373     	cbz	x19, 0x4105ae8 <_ChromeMain+0x410084c>
 4105a80: f9400be8     	ldr	x8, [sp, #0x10]
 4105a84: 52802f09     	mov	w9, #0x178              ; =376
 4105a88: 9b097d09     	mul	x9, x8, x9
 4105a8c: b4000389     	cbz	x9, 0x4105afc <_ChromeMain+0x4100860>
 4105a90: 8b130129     	add	x9, x9, x19
 4105a94: d105e120     	sub	x0, x9, #0x178
 4105a98: 92802ee9     	mov	x9, #-0x178             ; =-376
 4105a9c: 9b097d14     	mul	x20, x8, x9
 4105aa0: b4000ae0     	cbz	x0, 0x4105bfc <_ChromeMain+0x4100960>
 4105aa4: 94c3b4f6     	bl	0x71f2e7c <_ChromeMain+0x71edbe0>
 4105aa8: d105e000     	sub	x0, x0, #0x178
 4105aac: b105e294     	adds	x20, x20, #0x178
 4105ab0: 54ffff81     	b.ne	0x4105aa0 <_ChromeMain+0x4100804>
 4105ab4: f94007e0     	ldr	x0, [sp, #0x8]
 4105ab8: cb000268     	sub	x8, x19, x0
 4105abc: 9343fd08     	asr	x8, x8, #3
 4105ac0: d288d9e9     	mov	x9, #0x46cf             ; =18127
 4105ac4: f2acefa9     	movk	x9, #0x677d, lsl #16
 4105ac8: f2d7d469     	movk	x9, #0xbea3, lsl #32
 4105acc: f2ea3669     	movk	x9, #0x51b3, lsl #48
 4105ad0: 9b097d08     	mul	x8, x8, x9
 4105ad4: f9000be8     	str	x8, [sp, #0x10]
 4105ad8: f9400fe8     	ldr	x8, [sp, #0x18]
 4105adc: 52802f09     	mov	w9, #0x178              ; =376
 4105ae0: 9b097d01     	mul	x1, x8, x9
 4105ae4: 96fc0cf5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4105ae8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4105aec: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4105af0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4105af4: 910143ff     	add	sp, sp, #0x50
 4105af8: d65f03c0     	ret
 4105afc: aa1303e0     	mov	x0, x19
 4105b00: 17ffffee     	b	0x4105ab8 <_ChromeMain+0x410081c>
 4105b04: f9406268     	ldr	x8, [x19, #0xc0]
 4105b08: b4000288     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b0c: 19404108     	ldapurb	w8, [x8, #0x4]
 4105b10: 35000248     	cbnz	w8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b14: f9406668     	ldr	x8, [x19, #0xc8]
 4105b18: b4000208     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b1c: f9406268     	ldr	x8, [x19, #0xc0]
 4105b20: b40006a8     	cbz	x8, 0x4105bf4 <_ChromeMain+0x4100958>
 4105b24: 19404108     	ldapurb	w8, [x8, #0x4]
 4105b28: 35000668     	cbnz	w8, 0x4105bf4 <_ChromeMain+0x4100958>
 4105b2c: f9403e69     	ldr	x9, [x19, #0x78]
 4105b30: d360fd28     	lsr	x8, x9, #32
 4105b34: b5000648     	cbnz	x8, 0x4105bfc <_ChromeMain+0x4100960>
 4105b38: f9406668     	ldr	x8, [x19, #0xc8]
 4105b3c: 9104510a     	add	x10, x8, #0x114
 4105b40: 3944710b     	ldrb	w11, [x8, #0x11c]
 4105b44: d3607d29     	lsl	x9, x9, #32
 4105b48: f9000149     	str	x9, [x10]
 4105b4c: 3700006b     	tbnz	w11, #0x0, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b50: 52800029     	mov	w9, #0x1                ; =1
 4105b54: 39047109     	strb	w9, [x8, #0x11c]
 4105b58: f940b260     	ldr	x0, [x19, #0x160]
 4105b5c: 52800101     	mov	w1, #0x8                ; =8
 4105b60: 94dc72d6     	bl	0x78226b8 <_ChromeMain+0x781d41c>
 4105b64: 91066260     	add	x0, x19, #0x198
 4105b68: 94dc6907     	bl	0x781ff84 <_ChromeMain+0x781ace8>
 4105b6c: f940e260     	ldr	x0, [x19, #0x1c0]
 4105b70: 52800101     	mov	w1, #0x8                ; =8
 4105b74: 94d90711     	bl	0x77477b8 <_ChromeMain+0x774251c>
 4105b78: 17ffffdc     	b	0x4105ae8 <_ChromeMain+0x410084c>
 4105b7c: f940b260     	ldr	x0, [x19, #0x160]
 4105b80: aa1403e1     	mov	x1, x20
 4105b84: 94dc72cd     	bl	0x78226b8 <_ChromeMain+0x781d41c>
 4105b88: 91066260     	add	x0, x19, #0x198
 4105b8c: 94dc68fe     	bl	0x781ff84 <_ChromeMain+0x781ace8>
 4105b90: f940e260     	ldr	x0, [x19, #0x1c0]
 4105b94: aa1403e1     	mov	x1, x20
 4105b98: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4105b9c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4105ba0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4105ba4: 910143ff     	add	sp, sp, #0x50
 4105ba8: 14d90704     	b	0x77477b8 <_ChromeMain+0x774251c>
 4105bac: f9406268     	ldr	x8, [x19, #0xc0]
 4105bb0: b4fffd48     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bb4: 19404108     	ldapurb	w8, [x8, #0x4]
 4105bb8: 35fffd08     	cbnz	w8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bbc: f9406668     	ldr	x8, [x19, #0xc8]
 4105bc0: b4fffcc8     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bc4: f9406268     	ldr	x8, [x19, #0xc0]
 4105bc8: b4000228     	cbz	x8, 0x4105c0c <_ChromeMain+0x4100970>
 4105bcc: 19404108     	ldapurb	w8, [x8, #0x4]
 4105bd0: 350001e8     	cbnz	w8, 0x4105c0c <_ChromeMain+0x4100970>
 4105bd4: f9406668     	ldr	x8, [x19, #0xc8]
 4105bd8: 9104510a     	add	x10, x8, #0x114
 4105bdc: 3944710b     	ldrb	w11, [x8, #0x11c]
 4105be0: 52800029     	mov	w9, #0x1                ; =1
 4105be4: f9000149     	str	x9, [x10]
 4105be8: 3707fb8b     	tbnz	w11, #0x0, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bec: 39047109     	strb	w9, [x8, #0x11c]
 4105bf0: 17ffffda     	b	0x4105b58 <_ChromeMain+0x41008bc>
 4105bf4: d4200000     	brk	#0
 4105bf8: d4400000     	hlt	#0
 4105bfc: d4200020     	brk	#0x1
 4105c00: d4200000     	brk	#0
 4105c04: d4400000     	hlt	#0
 4105c08: d4200020     	brk	#0x1
 4105c0c: d4200000     	brk	#0
 4105c10: d4400000     	hlt	#0
 4105c14: d4200020     	brk	#0x1
