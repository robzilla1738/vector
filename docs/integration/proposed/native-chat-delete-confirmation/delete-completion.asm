
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 466f8d0: d10283ff     	sub	sp, sp, #0xa0
 466f8d4: a90567fa     	stp	x26, x25, [sp, #0x50]
 466f8d8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 466f8dc: a90757f6     	stp	x22, x21, [sp, #0x70]
 466f8e0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 466f8e4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 466f8e8: 910243fd     	add	x29, sp, #0x90
 466f8ec: a942d413     	ldp	x19, x21, [x0, #0x28]
 466f8f0: f900141f     	str	xzr, [x0, #0x28]
 466f8f4: a943d814     	ldp	x20, x22, [x0, #0x38]
 466f8f8: f9402417     	ldr	x23, [x0, #0x48]
 466f8fc: a903fc1f     	stp	xzr, xzr, [x0, #0x38]
 466f900: f900241f     	str	xzr, [x0, #0x48]
 466f904: b4000133     	cbz	x19, 0x466f928 <_ChromeMain+0x466a68c>
 466f908: 19404268     	ldapurb	w8, [x19, #0x4]
 466f90c: 7100011f     	cmp	w8, #0x0
 466f910: fa400aa4     	ccmp	x21, #0x0, #0x4, eq
 466f914: 54000281     	b.ne	0x466f964 <_ChromeMain+0x466a6c8>
 466f918: 12800008     	mov	w8, #-0x1               ; =-1
 466f91c: b8e80268     	ldaddal	w8, w8, [x19]
 466f920: 7100051f     	cmp	w8, #0x1
 466f924: 54000160     	b.eq	0x466f950 <_ChromeMain+0x466a6b4>
 466f928: b6f80377     	tbz	x23, #0x3f, 0x466f994 <_ChromeMain+0x466a6f8>
 466f92c: 9240fae1     	and	x1, x23, #0x7fffffffffffffff
 466f930: aa1403e0     	mov	x0, x20
 466f934: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 466f938: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 466f93c: a94757f6     	ldp	x22, x21, [sp, #0x70]
 466f940: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 466f944: a94567fa     	ldp	x26, x25, [sp, #0x50]
 466f948: 910283ff     	add	sp, sp, #0xa0
 466f94c: 16e6655b     	b	0x8eb8 <_ChromeMain+0x3c1c>
 466f950: aa1303e0     	mov	x0, x19
 466f954: 52800101     	mov	w1, #0x8                ; =8
 466f958: 96e66558     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466f95c: b7fffe97     	tbnz	x23, #0x3f, 0x466f92c <_ChromeMain+0x466a690>
 466f960: 1400000d     	b	0x466f994 <_ChromeMain+0x466a6f8>
 466f964: 19404268     	ldapurb	w8, [x19, #0x4]
 466f968: 35000c88     	cbnz	w8, 0x466faf8 <_ChromeMain+0x466a85c>
 466f96c: 7100043f     	cmp	w1, #0x1
 466f970: 54000320     	b.eq	0x466f9d4 <_ChromeMain+0x466a738>
 466f974: b6f80097     	tbz	x23, #0x3f, 0x466f984 <_ChromeMain+0x466a6e8>
 466f978: 9240fae1     	and	x1, x23, #0x7fffffffffffffff
 466f97c: aa1403e0     	mov	x0, x20
 466f980: 96e6654e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466f984: 12800008     	mov	w8, #-0x1               ; =-1
 466f988: b8e80268     	ldaddal	w8, w8, [x19]
 466f98c: 7100051f     	cmp	w8, #0x1
 466f990: 54000100     	b.eq	0x466f9b0 <_ChromeMain+0x466a714>
 466f994: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 466f998: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 466f99c: a94757f6     	ldp	x22, x21, [sp, #0x70]
 466f9a0: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 466f9a4: a94567fa     	ldp	x26, x25, [sp, #0x50]
 466f9a8: 910283ff     	add	sp, sp, #0xa0
 466f9ac: d65f03c0     	ret
 466f9b0: aa1303e0     	mov	x0, x19
 466f9b4: 52800101     	mov	w1, #0x8                ; =8
 466f9b8: 96e66540     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466f9bc: 17fffff6     	b	0x466f994 <_ChromeMain+0x466a6f8>
 466f9c0: 9100e3e0     	add	x0, sp, #0x38
 466f9c4: aa1403e1     	mov	x1, x20
 466f9c8: aa1603e2     	mov	x2, x22
 466f9cc: 96e6a213     	bl	0x18218 <_ChromeMain+0x12f7c>
 466f9d0: 14000008     	b	0x466f9f0 <_ChromeMain+0x466a754>
 466f9d4: d378fee8     	lsr	x8, x23, #56
 466f9d8: f10002ff     	cmp	x23, #0x0
 466f9dc: 9a8842c8     	csel	x8, x22, x8, mi
 466f9e0: b4fffca8     	cbz	x8, 0x466f974 <_ChromeMain+0x466a6d8>
 466f9e4: b7fffef7     	tbnz	x23, #0x3f, 0x466f9c0 <_ChromeMain+0x466a724>
 466f9e8: a903dbf4     	stp	x20, x22, [sp, #0x38]
 466f9ec: f90027f7     	str	x23, [sp, #0x48]
 466f9f0: 528000c8     	mov	w8, #0x6                ; =6
 466f9f4: 3900dfe8     	strb	w8, [sp, #0x37]
 466f9f8: 910083e8     	add	x8, sp, #0x20
 466f9fc: b27f0509     	orr	x9, x8, #0x6
 466fa00: b0048bca     	adrp	x10, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 466fa04: 9103fd4a     	add	x10, x10, #0xff
 466fa08: eb0a013f     	cmp	x9, x10
 466fa0c: fa4a8102     	ccmp	x8, x10, #0x2, hi
 466fa10: 54000789     	b.ls	0x466fb00 <_ChromeMain+0x466a864>
 466fa14: 528cae88     	mov	w8, #0x6574             ; =25972
 466fa18: 79004be8     	strh	w8, [sp, #0x24]
 466fa1c: 528cac88     	mov	w8, #0x6564             ; =25956
 466fa20: 72acad88     	movk	w8, #0x656c, lsl #16
 466fa24: b90023e8     	str	w8, [sp, #0x20]
 466fa28: 39009bff     	strb	wzr, [sp, #0x26]
 466fa2c: 390003ff     	strb	wzr, [sp]
 466fa30: 390063ff     	strb	wzr, [sp, #0x18]
 466fa34: f94a06b8     	ldr	x24, [x21, #0x1408]
 466fa38: b40000d8     	cbz	x24, 0x466fa50 <_ChromeMain+0x466a7b4>
 466fa3c: 52800028     	mov	w8, #0x1                ; =1
 466fa40: b8280308     	ldadd	w8, w8, [x24]
 466fa44: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 466fa48: 6b09011f     	cmp	w8, w9
 466fa4c: 540005c0     	b.eq	0x466fb04 <_ChromeMain+0x466a868>
 466fa50: f94a0ab9     	ldr	x25, [x21, #0x1410]
 466fa54: 52800a00     	mov	w0, #0x50               ; =80
 466fa58: 96e67e44     	bl	0xf368 <_ChromeMain+0xa0cc>
 466fa5c: aa0003e4     	mov	x4, x0
 466fa60: 52800028     	mov	w8, #0x1                ; =1
 466fa64: b9000008     	str	w8, [x0]
 466fa68: 10002a08     	adr	x8, 0x466ffa8 <_ChromeMain+0x466ad0c>
 466fa6c: d503201f     	nop
 466fa70: 10922e09     	adr	x9, 0x4594030 <_ChromeMain+0x458ed94>
 466fa74: d503201f     	nop
 466fa78: a900a408     	stp	x8, x9, [x0, #0x8]
 466fa7c: d0fef768     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 466fa80: 912c0108     	add	x8, x8, #0xb00
 466fa84: f9000c08     	str	x8, [x0, #0x18]
 466fa88: a902e418     	stp	x24, x25, [x0, #0x28]
 466fa8c: a903d814     	stp	x20, x22, [x0, #0x38]
 466fa90: f9002417     	str	x23, [x0, #0x48]
 466fa94: 9100e3e1     	add	x1, sp, #0x38
 466fa98: 910083e2     	add	x2, sp, #0x20
 466fa9c: 910003e3     	mov	x3, sp
 466faa0: aa1503e0     	mov	x0, x21
 466faa4: 97ff2e6e     	bl	0x463b45c <_ChromeMain+0x46361c0>
 466faa8: 394063e8     	ldrb	w8, [sp, #0x18]
 466faac: 340000e8     	cbz	w8, 0x466fac8 <_ChromeMain+0x466a82c>
 466fab0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 466fab4: 36f800a8     	tbz	w8, #0x1f, 0x466fac8 <_ChromeMain+0x466a82c>
 466fab8: f94003e0     	ldr	x0, [sp]
 466fabc: f9400be8     	ldr	x8, [sp, #0x10]
 466fac0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466fac4: 96e664fd     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466fac8: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 466facc: 36f800a8     	tbz	w8, #0x1f, 0x466fae0 <_ChromeMain+0x466a844>
 466fad0: f94013e0     	ldr	x0, [sp, #0x20]
 466fad4: f9401be8     	ldr	x8, [sp, #0x30]
 466fad8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466fadc: 96e664f7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 466fae0: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 466fae4: 36fff508     	tbz	w8, #0x1f, 0x466f984 <_ChromeMain+0x466a6e8>
 466fae8: f9401fe0     	ldr	x0, [sp, #0x38]
 466faec: f94027e8     	ldr	x8, [sp, #0x48]
 466faf0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 466faf4: 17ffffa3     	b	0x466f980 <_ChromeMain+0x466a6e4>
 466faf8: d4200000     	brk	#0
 466fafc: d4400000     	hlt	#0
 466fb00: d4200020     	brk	#0x1
