
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e4598: d0059e20     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 37e459c: 91106000     	add	x0, x0, #0x418
 37e45a0: 9724d338     	bl	0x119280 <_ChromeMain+0x113fe4>
 37e45a4: 7100001f     	cmp	w0, #0x0
 37e45a8: 529bba08     	mov	w8, #0xddd0             ; =56784
 37e45ac: 72a000c8     	movk	w8, #0x6, lsl #16
 37e45b0: 528ae609     	mov	w9, #0x5730             ; =22320
 37e45b4: 72a000a9     	movk	w9, #0x5, lsl #16
 37e45b8: 9a881135     	csel	x21, x9, x8, ne
 37e45bc: f9401af4     	ldr	x20, [x23, #0x30]
 37e45c0: d004d201     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 37e45c4: 910a4c21     	add	x1, x1, #0x293
 37e45c8: aa1403e0     	mov	x0, x20
 37e45cc: 972843ec     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 37e45d0: 370073e0     	tbnz	w0, #0x0, 0x37e544c <_ChromeMain+0x37e01b0>
 37e45d4: d004d201     	adrp	x1, 0xd226000 <dyld_stub_binder+0xd226000>
 37e45d8: 910ac021     	add	x1, x1, #0x2b0
 37e45dc: aa1403e0     	mov	x0, x20
 37e45e0: 972843e7     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 37e45e4: 370000a0     	tbnz	w0, #0x0, 0x37e45f8 <_ChromeMain+0x37df35c>
 37e45e8: 394ca728     	ldrb	w8, [x25, #0x329]
 37e45ec: 36006fe8     	tbz	w8, #0x0, 0x37e53e8 <_ChromeMain+0x37e014c>
 37e45f0: 394ca308     	ldrb	w8, [x24, #0x328]
 37e45f4: 370072c8     	tbnz	w8, #0x0, 0x37e544c <_ChromeMain+0x37e01b0>
 37e45f8: f906a675     	str	x21, [x19, #0xd48]
 37e45fc: d0059e20     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 37e4600: 91106000     	add	x0, x0, #0x418
 37e4604: 9724d31f     	bl	0x119280 <_ChromeMain+0x113fe4>
 37e4608: 52800108     	mov	w8, #0x8                ; =8
 37e460c: 528002e9     	mov	w9, #0x17               ; =23
 37e4610: 7100001f     	cmp	w0, #0x0
 37e4614: 1a881128     	csel	w8, w9, w8, ne
 37e4618: b90d2268     	str	w8, [x19, #0xd20]
 37e461c: f9442668     	ldr	x8, [x19, #0x848]
 37e4620: 39424108     	ldrb	w8, [x8, #0x90]
 37e4624: 52800029     	mov	w9, #0x1                ; =1
 37e4628: 0a280128     	bic	w8, w9, w8
 37e462c: 1e630100     	ucvtf	d0, w8
 37e4630: 3974a268     	ldrb	w8, [x19, #0xd28]
 37e4634: 35006b08     	cbnz	w8, 0x37e5394 <_ChromeMain+0x37e00f8>
 37e4638: fd06a260     	str	d0, [x19, #0xd40]
 37e463c: 39738268     	ldrb	w8, [x19, #0xce0]
