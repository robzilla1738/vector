
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 27433f4: d102c3ff     	sub	sp, sp, #0xb0
 27433f8: a90667fa     	stp	x26, x25, [sp, #0x60]
 27433fc: a9075ff8     	stp	x24, x23, [sp, #0x70]
 2743400: a90857f6     	stp	x22, x21, [sp, #0x80]
 2743404: a9094ff4     	stp	x20, x19, [sp, #0x90]
 2743408: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 274340c: 910283fd     	add	x29, sp, #0xa0
 2743410: aa0303f5     	mov	x21, x3
 2743414: aa0203f7     	mov	x23, x2
 2743418: aa0103f4     	mov	x20, x1
 274341c: aa0003f6     	mov	x22, x0
 2743420: aa0803f3     	mov	x19, x8
 2743424: 94000089     	bl	0x2743648 <_ChromeMain+0x273e3ac>
 2743428: 35000de0     	cbnz	w0, 0x27435e4 <_ChromeMain+0x273e348>
 274342c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 2743430: f9001bff     	str	xzr, [sp, #0x30]
 2743434: 90053dc1     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 2743438: 911a8821     	add	x1, x1, #0x6a2
 274343c: 910083f8     	add	x24, sp, #0x20
 2743440: 910083e8     	add	x8, sp, #0x20
 2743444: aa1603e0     	mov	x0, x22
 2743448: 97cb77db     	bl	0x1a213b4 <_ChromeMain+0x1a1c118>
 274344c: 3980dfe8     	ldrsb	x8, [sp, #0x37]
 2743450: a9422be9     	ldp	x9, x10, [sp, #0x20]
 2743454: f100011f     	cmp	x8, #0x0
 2743458: 9a984138     	csel	x24, x9, x24, mi
 274345c: 7100011f     	cmp	w8, #0x0
 2743460: 9a884159     	csel	x25, x10, x8, mi
 2743464: b0059be2     	adrp	x2, 0xdac0000 <dyld_stub_binder+0xdac0000>
 2743468: 91346442     	add	x2, x2, #0xd19
 274346c: aa1803e0     	mov	x0, x24
 2743470: aa1903e1     	mov	x1, x25
 2743474: 52800443     	mov	w3, #0x22               ; =34
 2743478: 52800004     	mov	w4, #0x0                ; =0
 274347c: 97934fbb     	bl	0xc17368 <_ChromeMain+0xc120cc>
 2743480: 34000a00     	cbz	w0, 0x27435c0 <_ChromeMain+0x273e324>
 2743484: 12800008     	mov	w8, #-0x1               ; =-1
 2743488: b9000be8     	str	w8, [sp, #0x8]
 274348c: f100873f     	cmp	x25, #0x21
 2743490: 540009c9     	b.ls	0x27435c8 <_ChromeMain+0x273e32c>
 2743494: d1008b21     	sub	x1, x25, #0x22
 2743498: 91008b00     	add	x0, x24, #0x22
 274349c: 910023e2     	add	x2, sp, #0x8
 27434a0: 97c5f291     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 27434a4: b9400be8     	ldr	w8, [sp, #0x8]
 27434a8: 7100691f     	cmp	w8, #0x1a
 27434ac: 1a8013f8     	csel	w24, wzr, w0, ne
 27434b0: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 27434b4: 36f800a8     	tbz	w8, #0x1f, 0x27434c8 <_ChromeMain+0x273e22c>
 27434b8: f94013e0     	ldr	x0, [sp, #0x20]
 27434bc: f9401be8     	ldr	x8, [sp, #0x30]
 27434c0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 27434c4: 9763167d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 27434c8: 34000978     	cbz	w24, 0x27435f4 <_ChromeMain+0x273e358>
 27434cc: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 27434d0: b9001bff     	str	wzr, [sp, #0x18]
 27434d4: 910023e8     	add	x8, sp, #0x8
 27434d8: aa1603e0     	mov	x0, x22
 27434dc: 940000cf     	bl	0x2743818 <_ChromeMain+0x273e57c>
 27434e0: 394063e8     	ldrb	w8, [sp, #0x18]
 27434e4: 340003a8     	cbz	w8, 0x2743558 <_ChromeMain+0x273e2bc>
 27434e8: a94087f6     	ldp	x22, x1, [sp, #0x8]
 27434ec: 394022a8     	ldrb	w8, [x21, #0x8]
 27434f0: 35000208     	cbnz	w8, 0x2743530 <_ChromeMain+0x273e294>
 27434f4: d360fec0     	lsr	x0, x22, #32
 27434f8: 910083e8     	add	x8, sp, #0x20
 27434fc: aa1403e2     	mov	x2, x20
 2743500: aa1503e3     	mov	x3, x21
 2743504: 94000148     	bl	0x2743a24 <_ChromeMain+0x273e788>
 2743508: f94013e8     	ldr	x8, [sp, #0x20]
 274350c: f9000268     	str	x8, [x19]
 2743510: b9000a7f     	str	wzr, [x19, #0x8]
 2743514: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 2743518: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 274351c: a94857f6     	ldp	x22, x21, [sp, #0x80]
 2743520: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 2743524: a94667fa     	ldp	x26, x25, [sp, #0x60]
 2743528: 9102c3ff     	add	sp, sp, #0xb0
 274352c: d65f03c0     	ret
 2743530: 394006a8     	ldrb	w8, [x21, #0x1]
 2743534: 350007e8     	cbnz	w8, 0x2743630 <_ChromeMain+0x273e394>
 2743538: 394002a8     	ldrb	w8, [x21]
 274353c: 35000808     	cbnz	w8, 0x274363c <_ChromeMain+0x273e3a0>
 2743540: d360fc20     	lsr	x0, x1, #32
 2743544: b94006a2     	ldr	w2, [x21, #0x4]
 2743548: 910083e8     	add	x8, sp, #0x20
 274354c: aa1403e1     	mov	x1, x20
 2743550: 94000264     	bl	0x2743ee0 <_ChromeMain+0x273ec44>
 2743554: 17ffffed     	b	0x2743508 <_ChromeMain+0x273e26c>
 2743558: 97c88734     	bl	0x1965228 <_ChromeMain+0x195ff8c>
 274355c: aa0003f6     	mov	x22, x0
 2743560: 97798048     	bl	0x5a3680 <_ChromeMain+0x59e3e4>
 2743564: 910083e8     	add	x8, sp, #0x20
 2743568: d2800001     	mov	x1, #0x0                ; =0
 274356c: 52800022     	mov	w2, #0x1                ; =1
 2743570: 97c9879f     	bl	0x19a53ec <_ChromeMain+0x19a0150>
 2743574: 910083e1     	add	x1, sp, #0x20
 2743578: aa1603e0     	mov	x0, x22
 274357c: 97c88838     	bl	0x196565c <_ChromeMain+0x19603c0>
 2743580: aa0003f7     	mov	x23, x0
 2743584: 910083e0     	add	x0, sp, #0x20
 2743588: 97c5de81     	bl	0x18baf8c <_ChromeMain+0x18b5cf0>
 274358c: aa1703e0     	mov	x0, x23
 2743590: 52803341     	mov	w1, #0x19a              ; =410
 2743594: 979f930d     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 2743598: aa0003e1     	mov	x1, x0
 274359c: aa1703e0     	mov	x0, x23
 27435a0: 97f9ba0a     	bl	0x25b1dc8 <_ChromeMain+0x25acb2c>
 27435a4: aa0003f6     	mov	x22, x0
 27435a8: aa1703e0     	mov	x0, x23
 27435ac: 52800c41     	mov	w1, #0x62               ; =98
 27435b0: 979f9306     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 27435b4: aa1603e1     	mov	x1, x22
 27435b8: b3607c01     	bfi	x1, x0, #32, #32
 27435bc: 17ffffcc     	b	0x27434ec <_ChromeMain+0x273e250>
 27435c0: 52800018     	mov	w24, #0x0               ; =0
 27435c4: 17ffffbb     	b	0x27434b0 <_ChromeMain+0x273e214>
 27435c8: b0058500     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 27435cc: 91376000     	add	x0, x0, #0xdd8
 27435d0: 9492f341     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 27435d4: aa1603e0     	mov	x0, x22
 27435d8: 954e22ba     	bl	0x7acc0c0 <_ChromeMain+0x7ac6e24>
 27435dc: b40000e0     	cbz	x0, 0x27435f8 <_ChromeMain+0x273e35c>
 27435e0: 1400000e     	b	0x2743618 <_ChromeMain+0x273e37c>
 27435e4: aa1603e0     	mov	x0, x22
 27435e8: 94000056     	bl	0x2743740 <_ChromeMain+0x273e4a4>
 27435ec: b4fff200     	cbz	x0, 0x274342c <_ChromeMain+0x273e190>
 27435f0: 1400000a     	b	0x2743618 <_ChromeMain+0x273e37c>
 27435f4: 35ffff17     	cbnz	w23, 0x27435d4 <_ChromeMain+0x273e338>
 27435f8: aa1603e0     	mov	x0, x22
 27435fc: 94685d0f     	bl	0x415aa38 <_ChromeMain+0x415579c>
 2743600: 93407c00     	sxtw	x0, w0
 2743604: 954e3fa1     	bl	0x7ad3488 <_ChromeMain+0x7ace1ec>
 2743608: aa0003f4     	mov	x20, x0
 274360c: 97cc4018     	bl	0x1a5366c <_ChromeMain+0x1a4e3d0>
 2743610: aa1403e1     	mov	x1, x20
 2743614: 97d7ee05     	bl	0x1d3ee28 <_ChromeMain+0x1d39b8c>
 2743618: aa0003e1     	mov	x1, x0
 274361c: aa1303e0     	mov	x0, x19
 2743620: 946f9dc8     	bl	0x432ad40 <_ChromeMain+0x4325aa4>
 2743624: 52800028     	mov	w8, #0x1                ; =1
 2743628: b9000a68     	str	w8, [x19, #0x8]
 274362c: 17ffffba     	b	0x2743514 <_ChromeMain+0x273e278>
 2743630: d4200000     	brk	#0
 2743634: d4400000     	hlt	#0
 2743638: d4200020     	brk	#0x1
 274363c: d4200000     	brk	#0
 2743640: d4400000     	hlt	#0
 2743644: d4200020     	brk	#0x1
