
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 457269c: d101c3ff     	sub	sp, sp, #0x70
 45726a0: a90267fa     	stp	x26, x25, [sp, #0x20]
 45726a4: a9035ff8     	stp	x24, x23, [sp, #0x30]
 45726a8: a90457f6     	stp	x22, x21, [sp, #0x40]
 45726ac: a9054ff4     	stp	x20, x19, [sp, #0x50]
 45726b0: a9067bfd     	stp	x29, x30, [sp, #0x60]
 45726b4: 910183fd     	add	x29, sp, #0x60
 45726b8: aa0003f4     	mov	x20, x0
 45726bc: 90054ba8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45726c0: f9467d00     	ldr	x0, [x8, #0xcf8]
 45726c4: b4000980     	cbz	x0, 0x45727f4 <_ChromeMain+0x456d558>
 45726c8: aa0203f3     	mov	x19, x2
 45726cc: aa0103f5     	mov	x21, x1
 45726d0: 9752b52a     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 45726d4: b4000900     	cbz	x0, 0x45727f4 <_ChromeMain+0x456d558>
 45726d8: aa0003f6     	mov	x22, x0
 45726dc: 39805e77     	ldrsb	x23, [x19, #0x17]
 45726e0: b7f800d7     	tbnz	x23, #0x3f, 0x45726f8 <_ChromeMain+0x456d45c>
 45726e4: aa1303f8     	mov	x24, x19
 45726e8: d0052b19     	adrp	x25, 0xead4000 <dyld_stub_binder+0xead4000>
 45726ec: 91316339     	add	x25, x25, #0xc58
 45726f0: 5280f01a     	mov	w26, #0x780             ; =1920
 45726f4: 14000006     	b	0x457270c <_ChromeMain+0x456d470>
 45726f8: a9405e78     	ldp	x24, x23, [x19]
 45726fc: 17fffffb     	b	0x45726e8 <_ChromeMain+0x456d44c>
 4572700: 9100a339     	add	x25, x25, #0x28
 4572704: f100a35a     	subs	x26, x26, #0x28
 4572708: 54000760     	b.eq	0x45727f4 <_ChromeMain+0x456d558>
 457270c: f9400728     	ldr	x8, [x25, #0x8]
 4572710: eb17011f     	cmp	x8, x23
 4572714: 54ffff61     	b.ne	0x4572700 <_ChromeMain+0x456d464>
 4572718: f9400320     	ldr	x0, [x25]
 457271c: aa1803e1     	mov	x1, x24
 4572720: aa1703e2     	mov	x2, x23
 4572724: 94ea5c4f     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4572728: 35fffec0     	cbnz	w0, 0x4572700 <_ChromeMain+0x456d464>
 457272c: b4000659     	cbz	x25, 0x45727f4 <_ChromeMain+0x456d558>
 4572730: aa1603e0     	mov	x0, x22
 4572734: 9752b537     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4572738: aa1503e1     	mov	x1, x21
 457273c: 9752b571     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4572740: b40005a0     	cbz	x0, 0x45727f4 <_ChromeMain+0x456d558>
 4572744: aa0003f5     	mov	x21, x0
 4572748: b0044c41     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 457274c: 91124821     	add	x1, x1, #0x492
 4572750: 910023f7     	add	x23, sp, #0x8
 4572754: 910023e8     	add	x8, sp, #0x8
 4572758: 9752bb17     	bl	0x1a213b4 <_ChromeMain+0x1a1c118>
 457275c: 39407fe8     	ldrb	w8, [sp, #0x1f]
 4572760: 13001d16     	sxtb	w22, w8
 4572764: f9400be9     	ldr	x9, [sp, #0x10]
 4572768: 710002df     	cmp	w22, #0x0
 457276c: 9a884122     	csel	x2, x9, x8, mi
 4572770: 39405e69     	ldrb	w9, [x19, #0x17]
 4572774: 13001d28     	sxtb	w8, w9
 4572778: f940066a     	ldr	x10, [x19, #0x8]
 457277c: 7100011f     	cmp	w8, #0x0
 4572780: 9a894149     	csel	x9, x10, x9, mi
 4572784: eb09005f     	cmp	x2, x9
 4572788: 54000060     	b.eq	0x4572794 <_ChromeMain+0x456d4f8>
 457278c: 52800017     	mov	w23, #0x0               ; =0
 4572790: 1400000a     	b	0x45727b8 <_ChromeMain+0x456d51c>
 4572794: f94007e9     	ldr	x9, [sp, #0x8]
 4572798: 710002df     	cmp	w22, #0x0
 457279c: 9a974120     	csel	x0, x9, x23, mi
 45727a0: f9400269     	ldr	x9, [x19]
 45727a4: 7100011f     	cmp	w8, #0x0
 45727a8: 9a934121     	csel	x1, x9, x19, mi
 45727ac: 94ea5c2d     	bl	0x8009860 <_ChromeMain+0x80045c4>
 45727b0: 7100001f     	cmp	w0, #0x0
 45727b4: 1a9f17f7     	cset	w23, eq
 45727b8: 36f800b6     	tbz	w22, #0x1f, 0x45727cc <_ChromeMain+0x456d530>
 45727bc: f94007e0     	ldr	x0, [sp, #0x8]
 45727c0: f9400fe8     	ldr	x8, [sp, #0x18]
 45727c4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45727c8: 96ea59bc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45727cc: aa1403e0     	mov	x0, x20
 45727d0: 97ffee7e     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 45727d4: 36000217     	tbz	w23, #0x0, 0x4572814 <_ChromeMain+0x456d578>
 45727d8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45727dc: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 45727e0: a94457f6     	ldp	x22, x21, [sp, #0x40]
 45727e4: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 45727e8: a94267fa     	ldp	x26, x25, [sp, #0x20]
 45727ec: 9101c3ff     	add	sp, sp, #0x70
 45727f0: d65f03c0     	ret
 45727f4: aa1403e0     	mov	x0, x20
 45727f8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 45727fc: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4572800: a94457f6     	ldp	x22, x21, [sp, #0x40]
 4572804: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4572808: a94267fa     	ldp	x26, x25, [sp, #0x20]
 457280c: 9101c3ff     	add	sp, sp, #0x70
 4572810: 17ffee6e     	b	0x456e1c8 <_ChromeMain+0x4568f2c>
 4572814: aa1503e0     	mov	x0, x21
 4572818: aa1303e1     	mov	x1, x19
 457281c: 94d569b7     	bl	0x7accef8 <_ChromeMain+0x7ac7c5c>
 4572820: 17ffffee     	b	0x45727d8 <_ChromeMain+0x456d53c>
