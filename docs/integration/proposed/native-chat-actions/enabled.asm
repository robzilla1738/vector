
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4639548: 91400408     	add	x8, x0, #0x1, lsl #12   ; =0x1000
 463954c: 394e8109     	ldrb	w9, [x8, #0x3a0]
 4639550: 35000069     	cbnz	w9, 0x463955c <_ChromeMain+0x46342c0>
 4639554: 52800000     	mov	w0, #0x0                ; =0
 4639558: d65f03c0     	ret
 463955c: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 4639560: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4639564: a90257f6     	stp	x22, x21, [sp, #0x20]
 4639568: a9034ff4     	stp	x20, x19, [sp, #0x30]
 463956c: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4639570: 910103fd     	add	x29, sp, #0x40
 4639574: aa0003f3     	mov	x19, x0
 4639578: 398e7d17     	ldrsb	x23, [x8, #0x39f]
 463957c: b7f801b7     	tbnz	x23, #0x3f, 0x46395b0 <_ChromeMain+0x4634314>
 4639580: aa1703e8     	mov	x8, x23
 4639584: b40001a8     	cbz	x8, 0x46395b8 <_ChromeMain+0x463431c>
 4639588: 52827108     	mov	w8, #0x1388             ; =5000
 463958c: 8b080274     	add	x20, x19, x8
 4639590: 511f3c28     	sub	w8, w1, #0x7cf
 4639594: 7100211f     	cmp	w8, #0x8
 4639598: 540001e8     	b.hi	0x46395d4 <_ChromeMain+0x4634338>
 463959c: 52803ec9     	mov	w9, #0x1f6              ; =502
 46395a0: 1ac82529     	lsr	w9, w9, w8
 46395a4: 36000329     	tbz	w9, #0x0, 0x4639608 <_ChromeMain+0x463436c>
 46395a8: 52800020     	mov	w0, #0x1                ; =1
 46395ac: 14000004     	b	0x46395bc <_ChromeMain+0x4634320>
 46395b0: f949ca68     	ldr	x8, [x19, #0x1390]
 46395b4: b5fffea8     	cbnz	x8, 0x4639588 <_ChromeMain+0x46342ec>
 46395b8: 52800000     	mov	w0, #0x0                ; =0
 46395bc: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 46395c0: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 46395c4: a94257f6     	ldp	x22, x21, [sp, #0x20]
 46395c8: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 46395cc: a8c567fa     	ldp	x26, x25, [sp], #0x50
 46395d0: d65f03c0     	ret
 46395d4: 711f383f     	cmp	w1, #0x7ce
 46395d8: 54ffff01     	b.ne	0x46395b8 <_ChromeMain+0x463431c>
 46395dc: f948d278     	ldr	x24, [x19, #0x11a0]
 46395e0: f948d668     	ldr	x8, [x19, #0x11a8]
 46395e4: 52801709     	mov	w9, #0xb8               ; =184
 46395e8: 9b097d19     	mul	x25, x8, x9
 46395ec: b40001b9     	cbz	x25, 0x4639620 <_ChromeMain+0x4634384>
 46395f0: f949ca68     	ldr	x8, [x19, #0x1390]
 46395f4: 710002ff     	cmp	w23, #0x0
 46395f8: 9a974116     	csel	x22, x8, x23, mi
 46395fc: aa1903fa     	mov	x26, x25
 4639600: aa1803f5     	mov	x21, x24
 4639604: 14000014     	b	0x4639654 <_ChromeMain+0x46343b8>
 4639608: 34000488     	cbz	w8, 0x4639698 <_ChromeMain+0x46343fc>
 463960c: aa1303e0     	mov	x0, x19
 4639610: aa1403e1     	mov	x1, x20
 4639614: 9400004c     	bl	0x4639744 <_ChromeMain+0x46344a8>
 4639618: 52000000     	eor	w0, w0, #0x1
 463961c: 17ffffe8     	b	0x46395bc <_ChromeMain+0x4634320>
 4639620: aa1803f5     	mov	x21, x24
 4639624: 8b190308     	add	x8, x24, x25
 4639628: f10002bf     	cmp	x21, #0x0
 463962c: fa4812a4     	ccmp	x21, x8, #0x4, ne
 4639630: 54fffc40     	b.eq	0x46395b8 <_ChromeMain+0x463431c>
 4639634: 3940d6a8     	ldrb	w8, [x21, #0x35]
 4639638: 34fffc08     	cbz	w8, 0x46395b8 <_ChromeMain+0x463431c>
 463963c: 3940d2a8     	ldrb	w8, [x21, #0x34]
 4639640: 36000508     	tbz	w8, #0x0, 0x46396e0 <_ChromeMain+0x4634444>
 4639644: 17ffffdd     	b	0x46395b8 <_ChromeMain+0x463431c>
 4639648: 9102e2b5     	add	x21, x21, #0xb8
 463964c: f102e35a     	subs	x26, x26, #0xb8
 4639650: 54fffb40     	b.eq	0x46395b8 <_ChromeMain+0x463431c>
 4639654: 39405ea9     	ldrb	w9, [x21, #0x17]
 4639658: 13001d28     	sxtb	w8, w9
 463965c: f94006aa     	ldr	x10, [x21, #0x8]
 4639660: 7100011f     	cmp	w8, #0x0
 4639664: 9a894149     	csel	x9, x10, x9, mi
 4639668: eb16013f     	cmp	x9, x22
 463966c: 54fffee1     	b.ne	0x4639648 <_ChromeMain+0x46343ac>
 4639670: f94002a9     	ldr	x9, [x21]
 4639674: 7100011f     	cmp	w8, #0x0
 4639678: 9a954120     	csel	x0, x9, x21, mi
 463967c: f9400288     	ldr	x8, [x20]
 4639680: 710002ff     	cmp	w23, #0x0
 4639684: 9a944101     	csel	x1, x8, x20, mi
 4639688: aa1603e2     	mov	x2, x22
 463968c: 94e74075     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4639690: 34fffca0     	cbz	w0, 0x4639624 <_ChromeMain+0x4634388>
 4639694: 17ffffed     	b	0x4639648 <_ChromeMain+0x46343ac>
 4639698: f948d278     	ldr	x24, [x19, #0x11a0]
 463969c: f948d668     	ldr	x8, [x19, #0x11a8]
 46396a0: 52801709     	mov	w9, #0xb8               ; =184
 46396a4: 9b097d19     	mul	x25, x8, x9
 46396a8: b40000f9     	cbz	x25, 0x46396c4 <_ChromeMain+0x4634428>
 46396ac: f949ca68     	ldr	x8, [x19, #0x1390]
 46396b0: 710002ff     	cmp	w23, #0x0
 46396b4: 9a974116     	csel	x22, x8, x23, mi
 46396b8: aa1903fa     	mov	x26, x25
 46396bc: aa1803f5     	mov	x21, x24
 46396c0: 14000010     	b	0x4639700 <_ChromeMain+0x4634464>
 46396c4: aa1803f5     	mov	x21, x24
 46396c8: 8b190308     	add	x8, x24, x25
 46396cc: f10002bf     	cmp	x21, #0x0
 46396d0: fa4812a4     	ccmp	x21, x8, #0x4, ne
 46396d4: 54fff720     	b.eq	0x46395b8 <_ChromeMain+0x463431c>
 46396d8: 3940d2a8     	ldrb	w8, [x21, #0x34]
 46396dc: 34fff6e8     	cbz	w8, 0x46395b8 <_ChromeMain+0x463431c>
 46396e0: 52823a08     	mov	w8, #0x11d0             ; =4560
 46396e4: 8b080260     	add	x0, x19, x8
 46396e8: aa1503e1     	mov	x1, x21
 46396ec: 973afd45     	bl	0x14f8c00 <_ChromeMain+0x14f3964>
 46396f0: 17ffffca     	b	0x4639618 <_ChromeMain+0x463437c>
 46396f4: 9102e2b5     	add	x21, x21, #0xb8
 46396f8: f102e35a     	subs	x26, x26, #0xb8
 46396fc: 54fff5e0     	b.eq	0x46395b8 <_ChromeMain+0x463431c>
 4639700: 39405ea9     	ldrb	w9, [x21, #0x17]
 4639704: 13001d28     	sxtb	w8, w9
 4639708: f94006aa     	ldr	x10, [x21, #0x8]
 463970c: 7100011f     	cmp	w8, #0x0
 4639710: 9a894149     	csel	x9, x10, x9, mi
 4639714: eb16013f     	cmp	x9, x22
 4639718: 54fffee1     	b.ne	0x46396f4 <_ChromeMain+0x4634458>
 463971c: f94002a9     	ldr	x9, [x21]
 4639720: 7100011f     	cmp	w8, #0x0
 4639724: 9a954120     	csel	x0, x9, x21, mi
 4639728: f9400288     	ldr	x8, [x20]
 463972c: 710002ff     	cmp	w23, #0x0
 4639730: 9a944101     	csel	x1, x8, x20, mi
 4639734: aa1603e2     	mov	x2, x22
 4639738: 94e7404a     	bl	0x8009860 <_ChromeMain+0x80045c4>
 463973c: 34fffc60     	cbz	w0, 0x46396c8 <_ChromeMain+0x463442c>
 4639740: 17ffffed     	b	0x46396f4 <_ChromeMain+0x4634458>
 4639744: d102c3ff     	sub	sp, sp, #0xb0
 4639748: a90857f6     	stp	x22, x21, [sp, #0x80]
 463974c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4639750: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4639754: 910283fd     	add	x29, sp, #0xa0
 4639758: f9422c08     	ldr	x8, [x0, #0x458]
 463975c: b4000148     	cbz	x8, 0x4639784 <_ChromeMain+0x46344e8>
 4639760: aa0003f4     	mov	x20, x0
 4639764: f9429d08     	ldr	x8, [x8, #0x538]
 4639768: f9403500     	ldr	x0, [x8, #0x68]
 463976c: b40000c0     	cbz	x0, 0x4639784 <_ChromeMain+0x46344e8>
 4639770: aa0103f3     	mov	x19, x1
 4639774: 97170842     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 4639778: b4000060     	cbz	x0, 0x4639784 <_ChromeMain+0x46344e8>
 463977c: 39408408     	ldrb	w8, [x0, #0x21]
 4639780: 35000188     	cbnz	w8, 0x46397b0 <_ChromeMain+0x4634514>
 4639784: 52800013     	mov	w19, #0x0               ; =0
 4639788: aa1303e0     	mov	x0, x19
 463978c: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 4639790: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 4639794: a94857f6     	ldp	x22, x21, [sp, #0x80]
 4639798: 9102c3ff     	add	sp, sp, #0xb0
 463979c: d65f03c0     	ret
 46397a0: aa1603e0     	mov	x0, x22
 46397a4: 9400dc7b     	bl	0x4670990 <_ChromeMain+0x466b6f4>
 46397a8: b4fffee0     	cbz	x0, 0x4639784 <_ChromeMain+0x46344e8>
 46397ac: 14000005     	b	0x46397c0 <_ChromeMain+0x4634524>
 46397b0: a943d808     	ldp	x8, x22, [x0, #0x38]
 46397b4: aa0803e0     	mov	x0, x8
 46397b8: 9400dc76     	bl	0x4670990 <_ChromeMain+0x466b6f4>
 46397bc: b4ffff20     	cbz	x0, 0x46397a0 <_ChromeMain+0x4634504>
 46397c0: aa0003f5     	mov	x21, x0
 46397c4: 910023f6     	add	x22, sp, #0x8
 46397c8: 910023e8     	add	x8, sp, #0x8
 46397cc: aa1403e0     	mov	x0, x20
 46397d0: aa1303e1     	mov	x1, x19
 46397d4: 97fff7ac     	bl	0x4637684 <_ChromeMain+0x46323e8>
 46397d8: 910023e1     	add	x1, sp, #0x8
 46397dc: aa1503e0     	mov	x0, x21
 46397e0: 9400092a     	bl	0x463bc88 <_ChromeMain+0x46369ec>
 46397e4: f100001f     	cmp	x0, #0x0
 46397e8: 1a9f07f3     	cset	w19, ne
 46397ec: 9101c2c0     	add	x0, x22, #0x70
 46397f0: d2800001     	mov	x1, #0x0                ; =0
 46397f4: 96e7b931     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 46397f8: 910082c0     	add	x0, x22, #0x20
 46397fc: 96e7b91f     	bl	0x27c78 <_ChromeMain+0x229dc>
 4639800: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4639804: 36fffc28     	tbz	w8, #0x1f, 0x4639788 <_ChromeMain+0x46344ec>
 4639808: f94007e0     	ldr	x0, [sp, #0x8]
 463980c: f9400fe8     	ldr	x8, [sp, #0x18]
 4639810: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4639814: 96e73da9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4639818: 17ffffdc     	b	0x4639788 <_ChromeMain+0x46344ec>
 463981c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4639820: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4639824: 910043fd     	add	x29, sp, #0x10
 4639828: aa0103f3     	mov	x19, x1
 463982c: 97ffff47     	bl	0x4639548 <_ChromeMain+0x46342ac>
 4639830: 5120d268     	sub	w8, w19, #0x834
 4639834: 71000d1f     	cmp	w8, #0x3
 4639838: 1a9f2400     	csinc	w0, w0, wzr, hs
 463983c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4639840: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4639844: d65f03c0     	ret
 4639848: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 463984c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4639850: 910043fd     	add	x29, sp, #0x10
 4639854: aa0103f3     	mov	x19, x1
 4639858: d115c000     	sub	x0, x0, #0x570
 463985c: 97ffff3b     	bl	0x4639548 <_ChromeMain+0x46342ac>
 4639860: 5120d268     	sub	w8, w19, #0x834
 4639864: 71000d1f     	cmp	w8, #0x3
 4639868: 1a9f2400     	csinc	w0, w0, wzr, hs
 463986c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4639870: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4639874: d65f03c0     	ret
 4639878: 511f3828     	sub	w8, w1, #0x7ce
 463987c: 7101a11f     	cmp	w8, #0x68
 4639880: 54000069     	b.ls	0x463988c <_ChromeMain+0x46345f0>
 4639884: 52800008     	mov	w8, #0x0                ; =0
 4639888: 14000004     	b	0x4639898 <_ChromeMain+0x46345fc>
 463988c: 90048569     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4639890: 91094129     	add	x9, x9, #0x250
 4639894: 38684928     	ldrb	w8, [x9, w8, uxtw]
 4639898: b913c808     	str	w8, [x0, #0x13c8]
 463989c: d65f03c0     	ret
 46398a0: 511f3828     	sub	w8, w1, #0x7ce
 46398a4: 7101a11f     	cmp	w8, #0x68
 46398a8: 54000069     	b.ls	0x46398b4 <_ChromeMain+0x4634618>
 46398ac: 52800008     	mov	w8, #0x0                ; =0
 46398b0: 14000004     	b	0x46398c0 <_ChromeMain+0x4634624>
 46398b4: 90048569     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 46398b8: 91094129     	add	x9, x9, #0x250
 46398bc: 38684928     	ldrb	w8, [x9, w8, uxtw]
 46398c0: b90e5808     	str	w8, [x0, #0xe58]
 46398c4: d65f03c0     	ret
