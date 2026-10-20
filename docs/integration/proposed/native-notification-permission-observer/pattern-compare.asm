
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  e7a640: d101c3ff     	sub	sp, sp, #0x70
  e7a644: a90267fa     	stp	x26, x25, [sp, #0x20]
  e7a648: a9035ff8     	stp	x24, x23, [sp, #0x30]
  e7a64c: a90457f6     	stp	x22, x21, [sp, #0x40]
  e7a650: a9054ff4     	stp	x20, x19, [sp, #0x50]
  e7a654: a9067bfd     	stp	x29, x30, [sp, #0x60]
  e7a658: 910183fd     	add	x29, sp, #0x60
  e7a65c: eb01001f     	cmp	x0, x1
  e7a660: 54001b00     	b.eq	0xe7a9c0 <_ChromeMain+0xe75724>
  e7a664: aa0103f3     	mov	x19, x1
  e7a668: aa0003f4     	mov	x20, x0
  e7a66c: 39420009     	ldrb	w9, [x0, #0x80]
  e7a670: 39420028     	ldrb	w8, [x1, #0x80]
  e7a674: 37000049     	tbnz	w9, #0x0, 0xe7a67c <_ChromeMain+0xe753e0>
  e7a678: 34001a48     	cbz	w8, 0xe7a9c0 <_ChromeMain+0xe75724>
  e7a67c: 52000129     	eor	w9, w9, #0x1
  e7a680: 0a08012a     	and	w10, w9, w8
  e7a684: 37001a8a     	tbnz	w10, #0x0, 0xe7a9d4 <_ChromeMain+0xe75738>
  e7a688: 2a080128     	orr	w8, w9, w8
  e7a68c: 36001a88     	tbz	w8, #0x0, 0xe7a9dc <_ChromeMain+0xe75740>
  e7a690: 3940e289     	ldrb	w9, [x20, #0x38]
  e7a694: 3940e268     	ldrb	w8, [x19, #0x38]
  e7a698: 37000049     	tbnz	w9, #0x0, 0xe7a6a0 <_ChromeMain+0xe75404>
  e7a69c: 360010a8     	tbz	w8, #0x0, 0xe7a8b0 <_ChromeMain+0xe75614>
  e7a6a0: 5200012a     	eor	w10, w9, #0x1
  e7a6a4: 2a08014b     	orr	w11, w10, w8
  e7a6a8: 36001fcb     	tbz	w11, #0x0, 0xe7aaa0 <_ChromeMain+0xe75804>
  e7a6ac: 6a08015f     	tst	w10, w8
  e7a6b0: 54000d61     	b.ne	0xe7a85c <_ChromeMain+0xe755c0>
  e7a6b4: 340018a9     	cbz	w9, 0xe7a9c8 <_ChromeMain+0xe7572c>
  e7a6b8: 34001888     	cbz	w8, 0xe7a9c8 <_ChromeMain+0xe7572c>
  e7a6bc: 91008295     	add	x21, x20, #0x20
  e7a6c0: 91008268     	add	x8, x19, #0x20
  e7a6c4: 3940de83     	ldrb	w3, [x20, #0x37]
  e7a6c8: f9401697     	ldr	x23, [x20, #0x28]
  e7a6cc: 7219007f     	tst	w3, #0x80
  e7a6d0: 9a8312e2     	csel	x2, x23, x3, ne
  e7a6d4: 3940de76     	ldrb	w22, [x19, #0x37]
  e7a6d8: f9401678     	ldr	x24, [x19, #0x28]
  e7a6dc: 721902df     	tst	w22, #0x80
  e7a6e0: 9a961309     	csel	x9, x24, x22, ne
  e7a6e4: eb09005f     	cmp	x2, x9
  e7a6e8: 540019e1     	b.ne	0xe7aa24 <_ChromeMain+0xe75788>
  e7a6ec: b5001882     	cbnz	x2, 0xe7a9fc <_ChromeMain+0xe75760>
  e7a6f0: 52800015     	mov	w21, #0x0               ; =0
  e7a6f4: 52800036     	mov	w22, #0x1               ; =1
  e7a6f8: 39416288     	ldrb	w8, [x20, #0x58]
  e7a6fc: 52000108     	eor	w8, w8, #0x1
  e7a700: 39416269     	ldrb	w9, [x19, #0x58]
  e7a704: 2a09010a     	orr	w10, w8, w9
  e7a708: 360016ea     	tbz	w10, #0x0, 0xe7a9e4 <_ChromeMain+0xe75748>
  e7a70c: 0a090108     	and	w8, w8, w9
  e7a710: 370009a8     	tbnz	w8, #0x0, 0xe7a844 <_ChromeMain+0xe755a8>
  e7a714: aa1303e8     	mov	x8, x19
  e7a718: f8440d09     	ldr	x9, [x8, #0x40]!
  e7a71c: 39405d0a     	ldrb	w10, [x8, #0x17]
  e7a720: f940050b     	ldr	x11, [x8, #0x8]
  e7a724: 39815e97     	ldrsb	x23, [x20, #0x57]
  e7a728: b7f80bd7     	tbnz	x23, #0x3f, 0xe7a8a0 <_ChromeMain+0xe75604>
  e7a72c: 91010280     	add	x0, x20, #0x40
  e7a730: 13001d4c     	sxtb	w12, w10
  e7a734: 7100019f     	cmp	w12, #0x0
  e7a738: 9a8a4178     	csel	x24, x11, x10, mi
  e7a73c: 9a884121     	csel	x1, x9, x8, mi
  e7a740: eb17031f     	cmp	x24, x23
  e7a744: 9a973302     	csel	x2, x24, x23, lo
  e7a748: 95c63c46     	bl	0x8009860 <_ChromeMain+0x80045c4>
  e7a74c: eb1802ff     	cmp	x23, x24
  e7a750: 1a9f97e8     	cset	w8, hi
  e7a754: 5a9f2108     	csinv	w8, w8, wzr, hs
  e7a758: 7100001f     	cmp	w0, #0x0
  e7a75c: 1a800109     	csel	w9, w8, w0, eq
  e7a760: 7100013f     	cmp	w9, #0x0
  e7a764: 52800048     	mov	w8, #0x2                ; =2
  e7a768: 5a88c508     	cneg	w8, w8, le
  e7a76c: 35001269     	cbnz	w9, 0xe7a9b8 <_ChromeMain+0xe7571c>
  e7a770: 52800017     	mov	w23, #0x0               ; =0
  e7a774: 52800038     	mov	w24, #0x1               ; =1
  e7a778: 39406288     	ldrb	w8, [x20, #0x18]
  e7a77c: 52000108     	eor	w8, w8, #0x1
  e7a780: 39406269     	ldrb	w9, [x19, #0x18]
  e7a784: 2a09010a     	orr	w10, w8, w9
  e7a788: 3600134a     	tbz	w10, #0x0, 0xe7a9f0 <_ChromeMain+0xe75754>
  e7a78c: 0a090108     	and	w8, w8, w9
  e7a790: 37000608     	tbnz	w8, #0x0, 0xe7a850 <_ChromeMain+0xe755b4>
  e7a794: 39405e68     	ldrb	w8, [x19, #0x17]
  e7a798: a9402a69     	ldp	x9, x10, [x19]
  e7a79c: aa1403e0     	mov	x0, x20
  e7a7a0: 39805e99     	ldrsb	x25, [x20, #0x17]
  e7a7a4: b7f80839     	tbnz	x25, #0x3f, 0xe7a8a8 <_ChromeMain+0xe7560c>
  e7a7a8: 13001d0b     	sxtb	w11, w8
  e7a7ac: 7100017f     	cmp	w11, #0x0
  e7a7b0: 9a88415a     	csel	x26, x10, x8, mi
  e7a7b4: 9a934121     	csel	x1, x9, x19, mi
  e7a7b8: eb19035f     	cmp	x26, x25
  e7a7bc: 9a993342     	csel	x2, x26, x25, lo
  e7a7c0: 95c63c28     	bl	0x8009860 <_ChromeMain+0x80045c4>
  e7a7c4: eb1a033f     	cmp	x25, x26
  e7a7c8: 1a9f97e8     	cset	w8, hi
  e7a7cc: 5a9f2108     	csinv	w8, w8, wzr, hs
  e7a7d0: 7100001f     	cmp	w0, #0x0
  e7a7d4: 1a800109     	csel	w9, w8, w0, eq
  e7a7d8: 7100013f     	cmp	w9, #0x0
  e7a7dc: 52800048     	mov	w8, #0x2                ; =2
  e7a7e0: 5a88c508     	cneg	w8, w8, le
  e7a7e4: 35000ea9     	cbnz	w9, 0xe7a9b8 <_ChromeMain+0xe7571c>
  e7a7e8: 52800008     	mov	w8, #0x0                ; =0
  e7a7ec: 52800029     	mov	w9, #0x1                ; =1
  e7a7f0: 39405e8b     	ldrb	w11, [x20, #0x17]
  e7a7f4: 13001d6a     	sxtb	w10, w11
  e7a7f8: f940068c     	ldr	x12, [x20, #0x8]
  e7a7fc: 7100015f     	cmp	w10, #0x0
  e7a800: 9a8b418b     	csel	x11, x12, x11, mi
  e7a804: f100117f     	cmp	x11, #0x4
  e7a808: 54000800     	b.eq	0xe7a908 <_ChromeMain+0xe7566c>
  e7a80c: 5280000a     	mov	w10, #0x0               ; =0
  e7a810: 340000b6     	cbz	w22, 0xe7a824 <_ChromeMain+0xe75588>
  e7a814: 7100013f     	cmp	w9, #0x0
  e7a818: 1a881148     	csel	w8, w10, w8, ne
  e7a81c: 7100031f     	cmp	w24, #0x0
  e7a820: 1a971115     	csel	w21, w8, w23, ne
  e7a824: aa1503e0     	mov	x0, x21
  e7a828: a9467bfd     	ldp	x29, x30, [sp, #0x60]
  e7a82c: a9454ff4     	ldp	x20, x19, [sp, #0x50]
  e7a830: a94457f6     	ldp	x22, x21, [sp, #0x40]
  e7a834: a9435ff8     	ldp	x24, x23, [sp, #0x30]
  e7a838: a94267fa     	ldp	x26, x25, [sp, #0x20]
  e7a83c: 9101c3ff     	add	sp, sp, #0x70
  e7a840: d65f03c0     	ret
  e7a844: 52800018     	mov	w24, #0x0               ; =0
  e7a848: 52800037     	mov	w23, #0x1               ; =1
  e7a84c: 17ffffcb     	b	0xe7a778 <_ChromeMain+0xe754dc>
  e7a850: 52800009     	mov	w9, #0x0                ; =0
  e7a854: 52800028     	mov	w8, #0x1                ; =1
  e7a858: 17ffffe6     	b	0xe7a7f0 <_ChromeMain+0xe75554>
  e7a85c: aa1403f5     	mov	x21, x20
  e7a860: f8420ea8     	ldr	x8, [x21, #0x20]!
  e7a864: 39805eb7     	ldrsb	x23, [x21, #0x17]
  e7a868: f10002ff     	cmp	x23, #0x0
  e7a86c: 9a954109     	csel	x9, x8, x21, mi
  e7a870: f94006a8     	ldr	x8, [x21, #0x8]
  e7a874: 710002ff     	cmp	w23, #0x0
  e7a878: 9a97410a     	csel	x10, x8, x23, mi
  e7a87c: aa1303e8     	mov	x8, x19
  e7a880: f8420d0b     	ldr	x11, [x8, #0x20]!
  e7a884: 39805d16     	ldrsb	x22, [x8, #0x17]
  e7a888: 710002df     	cmp	w22, #0x0
  e7a88c: 9a88416b     	csel	x11, x11, x8, mi
  e7a890: b7f815b6     	tbnz	x22, #0x3f, 0xe7ab44 <_ChromeMain+0xe758a8>
  e7a894: b50015d6     	cbnz	x22, 0xe7ab4c <_ChromeMain+0xe758b0>
  e7a898: 52800035     	mov	w21, #0x1               ; =1
  e7a89c: 17ffff97     	b	0xe7a6f8 <_ChromeMain+0xe7545c>
  e7a8a0: a9445e80     	ldp	x0, x23, [x20, #0x40]
  e7a8a4: 17ffffa3     	b	0xe7a730 <_ChromeMain+0xe75494>
  e7a8a8: a9406680     	ldp	x0, x25, [x20]
  e7a8ac: 17ffffbf     	b	0xe7a7a8 <_ChromeMain+0xe7550c>
  e7a8b0: aa1403e8     	mov	x8, x20
  e7a8b4: f8420d09     	ldr	x9, [x8, #0x20]!
  e7a8b8: 39805d0a     	ldrsb	x10, [x8, #0x17]
  e7a8bc: f100015f     	cmp	x10, #0x0
  e7a8c0: 9a884120     	csel	x0, x9, x8, mi
  e7a8c4: f9400508     	ldr	x8, [x8, #0x8]
  e7a8c8: 7100015f     	cmp	w10, #0x0
  e7a8cc: 9a8a4101     	csel	x1, x8, x10, mi
  e7a8d0: aa1303e8     	mov	x8, x19
  e7a8d4: f8420d09     	ldr	x9, [x8, #0x20]!
  e7a8d8: 39805d0a     	ldrsb	x10, [x8, #0x17]
  e7a8dc: f100015f     	cmp	x10, #0x0
  e7a8e0: 9a884122     	csel	x2, x9, x8, mi
  e7a8e4: f9400508     	ldr	x8, [x8, #0x8]
  e7a8e8: 7100015f     	cmp	w10, #0x0
  e7a8ec: 9a8a4103     	csel	x3, x8, x10, mi
  e7a8f0: 943f7560     	bl	0x1e57e70 <_ChromeMain+0x1e52bd4>
  e7a8f4: 7100001f     	cmp	w0, #0x0
  e7a8f8: 52800048     	mov	w8, #0x2                ; =2
  e7a8fc: 5a884515     	cneg	w21, w8, pl
  e7a900: 34ffef80     	cbz	w0, 0xe7a6f0 <_ChromeMain+0xe75454>
  e7a904: 17ffffc8     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7a908: f940028b     	ldr	x11, [x20]
  e7a90c: 7100015f     	cmp	w10, #0x0
  e7a910: 9a94416a     	csel	x10, x11, x20, mi
  e7a914: b940014b     	ldr	w11, [x10]
  e7a918: d005ed2a     	adrp	x10, 0xcc20000 <dyld_stub_binder+0xcc20000>
  e7a91c: d503201f     	nop
  e7a920: b940514a     	ldr	w10, [x10, #0x50]
  e7a924: 6b0a017f     	cmp	w11, w10
  e7a928: 54fff721     	b.ne	0xe7a80c <_ChromeMain+0xe75570>
  e7a92c: b9001be9     	str	w9, [sp, #0x18]
  e7a930: b90013e8     	str	w8, [sp, #0x10]
  e7a934: 39405e69     	ldrb	w9, [x19, #0x17]
  e7a938: 13001d28     	sxtb	w8, w9
  e7a93c: f940066b     	ldr	x11, [x19, #0x8]
  e7a940: 7100011f     	cmp	w8, #0x0
  e7a944: 9a894169     	csel	x9, x11, x9, mi
  e7a948: f100113f     	cmp	x9, #0x4
  e7a94c: 540000e1     	b.ne	0xe7a968 <_ChromeMain+0xe756cc>
  e7a950: f9400269     	ldr	x9, [x19]
  e7a954: 7100011f     	cmp	w8, #0x0
  e7a958: 9a934128     	csel	x8, x9, x19, mi
  e7a95c: b9400108     	ldr	w8, [x8]
  e7a960: 6b0a011f     	cmp	w8, w10
  e7a964: 540000a0     	b.eq	0xe7a978 <_ChromeMain+0xe756dc>
  e7a968: 5280000a     	mov	w10, #0x0               ; =0
  e7a96c: b94013e8     	ldr	w8, [sp, #0x10]
  e7a970: b9401be9     	ldr	w9, [sp, #0x18]
  e7a974: 17ffffa7     	b	0xe7a810 <_ChromeMain+0xe75574>
  e7a978: 3941e289     	ldrb	w9, [x20, #0x78]
  e7a97c: 3941e268     	ldrb	w8, [x19, #0x78]
  e7a980: 34000089     	cbz	w9, 0xe7a990 <_ChromeMain+0xe756f4>
  e7a984: 370000c8     	tbnz	w8, #0x0, 0xe7a99c <_ChromeMain+0xe75700>
  e7a988: 1280000a     	mov	w10, #-0x1              ; =-1
  e7a98c: 17fffff8     	b	0xe7a96c <_ChromeMain+0xe756d0>
  e7a990: 36000068     	tbz	w8, #0x0, 0xe7a99c <_ChromeMain+0xe75700>
  e7a994: 5280002a     	mov	w10, #0x1               ; =1
  e7a998: 17fffff5     	b	0xe7a96c <_ChromeMain+0xe756d0>
  e7a99c: 91018280     	add	x0, x20, #0x60
  e7a9a0: 91018261     	add	x1, x19, #0x60
  e7a9a4: 94c4e267     	bl	0x3fb3340 <_ChromeMain+0x3fae0a4>
  e7a9a8: 7100001f     	cmp	w0, #0x0
  e7a9ac: 52800048     	mov	w8, #0x2                ; =2
  e7a9b0: 5a88c508     	cneg	w8, w8, le
  e7a9b4: 34fffda0     	cbz	w0, 0xe7a968 <_ChromeMain+0xe756cc>
  e7a9b8: aa0803f5     	mov	x21, x8
  e7a9bc: 17ffff9a     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7a9c0: 52800015     	mov	w21, #0x0               ; =0
  e7a9c4: 17ffff98     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7a9c8: d4200000     	brk	#0
  e7a9cc: d4400000     	hlt	#0
  e7a9d0: d4200020     	brk	#0x1
  e7a9d4: 12800035     	mov	w21, #-0x2              ; =-2
  e7a9d8: 17ffff93     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7a9dc: 52800055     	mov	w21, #0x2               ; =2
  e7a9e0: 17ffff91     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7a9e4: 52800018     	mov	w24, #0x0               ; =0
  e7a9e8: 12800017     	mov	w23, #-0x1              ; =-1
  e7a9ec: 17ffff63     	b	0xe7a778 <_ChromeMain+0xe754dc>
  e7a9f0: 52800009     	mov	w9, #0x0                ; =0
  e7a9f4: 12800008     	mov	w8, #-0x1               ; =-1
  e7a9f8: 17ffff7e     	b	0xe7a7f0 <_ChromeMain+0xe75554>
  e7a9fc: f9400109     	ldr	x9, [x8]
  e7aa00: 721902df     	tst	w22, #0x80
  e7aa04: 9a881121     	csel	x1, x9, x8, ne
  e7aa08: f94002a8     	ldr	x8, [x21]
  e7aa0c: 7219007f     	tst	w3, #0x80
  e7aa10: 9a951100     	csel	x0, x8, x21, ne
  e7aa14: aa0303f9     	mov	x25, x3
  e7aa18: 95c63b92     	bl	0x8009860 <_ChromeMain+0x80045c4>
  e7aa1c: aa1903e3     	mov	x3, x25
  e7aa20: 34ffe680     	cbz	w0, 0xe7a6f0 <_ChromeMain+0xe75454>
  e7aa24: 91008268     	add	x8, x19, #0x20
  e7aa28: f9000fe8     	str	x8, [sp, #0x18]
  e7aa2c: 91008260     	add	x0, x19, #0x20
  e7aa30: 36380096     	tbz	w22, #0x7, 0xe7aa40 <_ChromeMain+0xe757a4>
  e7aa34: 91008268     	add	x8, x19, #0x20
  e7aa38: f9400100     	ldr	x0, [x8]
  e7aa3c: aa1803f6     	mov	x22, x24
  e7aa40: 91008282     	add	x2, x20, #0x20
  e7aa44: 36380063     	tbz	w3, #0x7, 0xe7aa50 <_ChromeMain+0xe757b4>
  e7aa48: f94002a2     	ldr	x2, [x21]
  e7aa4c: aa1703e3     	mov	x3, x23
  e7aa50: aa1603e1     	mov	x1, x22
  e7aa54: 94d38cef     	bl	0x435de10 <_ChromeMain+0x4358b74>
  e7aa58: 360000c0     	tbz	w0, #0x0, 0xe7aa70 <_ChromeMain+0xe757d4>
  e7aa5c: 52800016     	mov	w22, #0x0               ; =0
  e7aa60: 12800015     	mov	w21, #-0x1              ; =-1
  e7aa64: 17ffff25     	b	0xe7a6f8 <_ChromeMain+0xe7545c>
  e7aa68: a9420680     	ldp	x0, x1, [x20, #0x20]
  e7aa6c: 14000004     	b	0xe7aa7c <_ChromeMain+0xe757e0>
  e7aa70: 3980de81     	ldrsb	x1, [x20, #0x37]
  e7aa74: b7ffffa1     	tbnz	x1, #0x3f, 0xe7aa68 <_ChromeMain+0xe757cc>
  e7aa78: 91008280     	add	x0, x20, #0x20
  e7aa7c: 3980de63     	ldrsb	x3, [x19, #0x37]
  e7aa80: b7f800c3     	tbnz	x3, #0x3f, 0xe7aa98 <_ChromeMain+0xe757fc>
  e7aa84: 91008262     	add	x2, x19, #0x20
  e7aa88: 94d38ce2     	bl	0x435de10 <_ChromeMain+0x4358b74>
  e7aa8c: 36000480     	tbz	w0, #0x0, 0xe7ab1c <_ChromeMain+0xe75880>
  e7aa90: 52800016     	mov	w22, #0x0               ; =0
  e7aa94: 17ffff81     	b	0xe7a898 <_ChromeMain+0xe755fc>
  e7aa98: a9420e62     	ldp	x2, x3, [x19, #0x20]
  e7aa9c: 17fffffb     	b	0xe7aa88 <_ChromeMain+0xe757ec>
  e7aaa0: aa1303f5     	mov	x21, x19
  e7aaa4: f8420ea8     	ldr	x8, [x21, #0x20]!
  e7aaa8: 39805ea9     	ldrsb	x9, [x21, #0x17]
  e7aaac: f100013f     	cmp	x9, #0x0
  e7aab0: 9a954100     	csel	x0, x8, x21, mi
  e7aab4: f94006a8     	ldr	x8, [x21, #0x8]
  e7aab8: 7100013f     	cmp	w9, #0x0
  e7aabc: 9a894101     	csel	x1, x8, x9, mi
  e7aac0: aa1403f6     	mov	x22, x20
  e7aac4: f8420ec8     	ldr	x8, [x22, #0x20]!
  e7aac8: 39805ec9     	ldrsb	x9, [x22, #0x17]
  e7aacc: f100013f     	cmp	x9, #0x0
  e7aad0: 9a964102     	csel	x2, x8, x22, mi
  e7aad4: f94006c8     	ldr	x8, [x22, #0x8]
  e7aad8: 7100013f     	cmp	w9, #0x0
  e7aadc: 9a894103     	csel	x3, x8, x9, mi
  e7aae0: 94d38ccc     	bl	0x435de10 <_ChromeMain+0x4358b74>
  e7aae4: 3707fbc0     	tbnz	w0, #0x0, 0xe7aa5c <_ChromeMain+0xe757c0>
  e7aae8: 3980de81     	ldrsb	x1, [x20, #0x37]
  e7aaec: b6f80041     	tbz	x1, #0x3f, 0xe7aaf4 <_ChromeMain+0xe75858>
  e7aaf0: a9420696     	ldp	x22, x1, [x20, #0x20]
  e7aaf4: 3980de63     	ldrsb	x3, [x19, #0x37]
  e7aaf8: b6f80043     	tbz	x3, #0x3f, 0xe7ab00 <_ChromeMain+0xe75864>
  e7aafc: a9420e75     	ldp	x21, x3, [x19, #0x20]
  e7ab00: aa1603e0     	mov	x0, x22
  e7ab04: aa1503e2     	mov	x2, x21
  e7ab08: 943f74da     	bl	0x1e57e70 <_ChromeMain+0x1e52bd4>
  e7ab0c: 7100001f     	cmp	w0, #0x0
  e7ab10: 52800048     	mov	w8, #0x2                ; =2
  e7ab14: 5a884515     	cneg	w21, w8, pl
  e7ab18: 17ffff43     	b	0xe7a824 <_ChromeMain+0xe75588>
  e7ab1c: 3980de81     	ldrsb	x1, [x20, #0x37]
  e7ab20: b6f80041     	tbz	x1, #0x3f, 0xe7ab28 <_ChromeMain+0xe7588c>
  e7ab24: a9420695     	ldp	x21, x1, [x20, #0x20]
  e7ab28: 3980de63     	ldrsb	x3, [x19, #0x37]
  e7ab2c: b6f80063     	tbz	x3, #0x3f, 0xe7ab38 <_ChromeMain+0xe7589c>
  e7ab30: a9420e68     	ldp	x8, x3, [x19, #0x20]
  e7ab34: f9000fe8     	str	x8, [sp, #0x18]
  e7ab38: aa1503e0     	mov	x0, x21
  e7ab3c: f9400fe2     	ldr	x2, [sp, #0x18]
