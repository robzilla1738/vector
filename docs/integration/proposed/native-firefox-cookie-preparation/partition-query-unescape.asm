
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 13ea5c0: d10103ff     	sub	sp, sp, #0x40
 13ea5c4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 13ea5c8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 13ea5cc: 9100c3fd     	add	x29, sp, #0x30
 13ea5d0: aa0003f3     	mov	x19, x0
 13ea5d4: b9402008     	ldr	w8, [x0, #0x20]
 13ea5d8: 7100051f     	cmp	w8, #0x1
 13ea5dc: 5400040b     	b.lt	0x13ea65c <_ChromeMain+0x13e53c0>
 13ea5e0: 3980fe68     	ldrsb	x8, [x19, #0x3f]
 13ea5e4: b7f80508     	tbnz	x8, #0x3f, 0x13ea684 <_ChromeMain+0x13e53e8>
 13ea5e8: b50003a8     	cbnz	x8, 0x13ea65c <_ChromeMain+0x13e53c0>
 13ea5ec: f9400260     	ldr	x0, [x19]
 13ea5f0: b40004e0     	cbz	x0, 0x13ea68c <_ChromeMain+0x13e53f0>
 13ea5f4: 97ca0925     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 13ea5f8: 39405c09     	ldrb	w9, [x0, #0x17]
 13ea5fc: 13001d28     	sxtb	w8, w9
 13ea600: f940040a     	ldr	x10, [x0, #0x8]
 13ea604: 7100011f     	cmp	w8, #0x0
 13ea608: 9a89414a     	csel	x10, x10, x9, mi
 13ea60c: b9801e69     	ldrsw	x9, [x19, #0x1c]
 13ea610: eb09014a     	subs	x10, x10, x9
 13ea614: 54000423     	b.lo	0x13ea698 <_ChromeMain+0x13e53fc>
 13ea618: b980226b     	ldrsw	x11, [x19, #0x20]
 13ea61c: f940000c     	ldr	x12, [x0]
 13ea620: 7100011f     	cmp	w8, #0x0
 13ea624: 9a80418c     	csel	x12, x12, x0, mi
 13ea628: eb0b015f     	cmp	x10, x11
 13ea62c: 9a8b3141     	csel	x1, x10, x11, lo
 13ea630: 910023e8     	add	x8, sp, #0x8
 13ea634: 8b090180     	add	x0, x12, x9
 13ea638: 528003c2     	mov	w2, #0x1e               ; =30
 13ea63c: d2800003     	mov	x3, #0x0                ; =0
 13ea640: 94186eb0     	bl	0x1a06100 <_ChromeMain+0x1a00e64>
 13ea644: 39c0fe68     	ldrsb	w8, [x19, #0x3f]
 13ea648: 37f80148     	tbnz	w8, #0x1f, 0x13ea670 <_ChromeMain+0x13e53d4>
 13ea64c: 3cc083e0     	ldur	q0, [sp, #0x8]
 13ea650: 3c828260     	stur	q0, [x19, #0x28]
 13ea654: f9400fe8     	ldr	x8, [sp, #0x18]
 13ea658: f8038268     	stur	x8, [x19, #0x38]
 13ea65c: 9100a260     	add	x0, x19, #0x28
 13ea660: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 13ea664: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 13ea668: 910103ff     	add	sp, sp, #0x40
 13ea66c: d65f03c0     	ret
 13ea670: f9401660     	ldr	x0, [x19, #0x28]
 13ea674: f9401e68     	ldr	x8, [x19, #0x38]
 13ea678: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 13ea67c: 97b07a0f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 13ea680: 17fffff3     	b	0x13ea64c <_ChromeMain+0x13e53b0>
 13ea684: f9401a68     	ldr	x8, [x19, #0x30]
 13ea688: 17ffffd8     	b	0x13ea5e8 <_ChromeMain+0x13e534c>
 13ea68c: d4200000     	brk	#0
 13ea690: d4400000     	hlt	#0
 13ea694: d4200020     	brk	#0x1
 13ea698: d0061fc0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 13ea69c: 91376000     	add	x0, x0, #0xdd8
 13ea6a0: 94e0570d     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
