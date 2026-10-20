
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 14a84dc: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 14a84e0: 910003fd     	mov	x29, sp
 14a84e4: f9448c08     	ldr	x8, [x0, #0x918]
 14a84e8: b5000048     	cbnz	x8, 0x14a84f0 <_ChromeMain+0x14a3254>
 14a84ec: f9447c08     	ldr	x8, [x0, #0x8f8]
 14a84f0: f944f508     	ldr	x8, [x8, #0x9e8]
 14a84f4: b5000388     	cbnz	x8, 0x14a8564 <_ChromeMain+0x14a32c8>
 14a84f8: b982b408     	ldrsw	x8, [x0, #0x2b4]
 14a84fc: 3100051f     	cmn	w8, #0x1
 14a8500: 54001200     	b.eq	0x14a8740 <_ChromeMain+0x14a34a4>
 14a8504: f9414009     	ldr	x9, [x0, #0x280]
 14a8508: eb08013f     	cmp	x9, x8
 14a850c: 54001189     	b.ls	0x14a873c <_ChromeMain+0x14a34a0>
 14a8510: f9413c09     	ldr	x9, [x0, #0x278]
 14a8514: f8687928     	ldr	x8, [x9, x8, lsl #3]
 14a8518: 394ba009     	ldrb	w9, [x0, #0x2e8]
 14a851c: 35000089     	cbnz	w9, 0x14a852c <_ChromeMain+0x14a3290>
 14a8520: aa0803e0     	mov	x0, x8
 14a8524: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 14a8528: 140000a2     	b	0x14a87b0 <_ChromeMain+0x14a3514>
 14a852c: f9414809     	ldr	x9, [x0, #0x290]
 14a8530: b5000b49     	cbnz	x9, 0x14a8698 <_ChromeMain+0x14a33fc>
 14a8534: b4000108     	cbz	x8, 0x14a8554 <_ChromeMain+0x14a32b8>
 14a8538: b5000e89     	cbnz	x9, 0x14a8708 <_ChromeMain+0x14a346c>
 14a853c: aa0803e9     	mov	x9, x8
 14a8540: 3942fd2a     	ldrb	w10, [x9, #0xbf]
 14a8544: f9405929     	ldr	x9, [x9, #0xb0]
 14a8548: 7219015f     	tst	w10, #0x80
 14a854c: 9a8a1129     	csel	x9, x9, x10, ne
 14a8550: b50010a9     	cbnz	x9, 0x14a8764 <_ChromeMain+0x14a34c8>
 14a8554: b942b809     	ldr	w9, [x0, #0x2b8]
 14a8558: 3100053f     	cmn	w9, #0x1
 14a855c: 54fffe20     	b.eq	0x14a8520 <_ChromeMain+0x14a3284>
 14a8560: 14000081     	b	0x14a8764 <_ChromeMain+0x14a34c8>
 14a8564: f9414809     	ldr	x9, [x0, #0x290]
 14a8568: b50006a9     	cbnz	x9, 0x14a863c <_ChromeMain+0x14a33a0>
 14a856c: f9413009     	ldr	x9, [x0, #0x260]
 14a8570: f9401d2a     	ldr	x10, [x9, #0x38]
 14a8574: b0015ceb     	adrp	x11, 0x4045000 <_ChromeMain+0x403fd64>
 14a8578: 913c816b     	add	x11, x11, #0xf20
 14a857c: b982b409     	ldrsw	x9, [x0, #0x2b4]
 14a8580: eb0b015f     	cmp	x10, x11
 14a8584: 54000a81     	b.ne	0x14a86d4 <_ChromeMain+0x14a3438>
 14a8588: 3100053f     	cmn	w9, #0x1
 14a858c: 54000e00     	b.eq	0x14a874c <_ChromeMain+0x14a34b0>
 14a8590: f941400a     	ldr	x10, [x0, #0x280]
 14a8594: eb09015f     	cmp	x10, x9
 14a8598: 54000d29     	b.ls	0x14a873c <_ChromeMain+0x14a34a0>
 14a859c: f9413c0a     	ldr	x10, [x0, #0x278]
 14a85a0: f8697949     	ldr	x9, [x10, x9, lsl #3]
 14a85a4: b4000209     	cbz	x9, 0x14a85e4 <_ChromeMain+0x14a3348>
 14a85a8: b9404d2a     	ldr	w10, [x9, #0x4c]
 14a85ac: 7100055f     	cmp	w10, #0x1
 14a85b0: 540001ab     	b.lt	0x14a85e4 <_ChromeMain+0x14a3348>
 14a85b4: 3940fd2c     	ldrb	w12, [x9, #0x3f]
 14a85b8: 13001d8b     	sxtb	w11, w12
 14a85bc: f940192d     	ldr	x13, [x9, #0x30]
 14a85c0: 7100017f     	cmp	w11, #0x0
 14a85c4: 9a8c41ad     	csel	x13, x13, x12, mi
 14a85c8: b980492c     	ldrsw	x12, [x9, #0x48]
 14a85cc: eb0c01ad     	subs	x13, x13, x12
 14a85d0: 54000c43     	b.lo	0x14a8758 <_ChromeMain+0x14a34bc>
 14a85d4: eb0a01bf     	cmp	x13, x10
 14a85d8: 9a8a31aa     	csel	x10, x13, x10, lo
 14a85dc: f1002d5f     	cmp	x10, #0xb
 14a85e0: 54000120     	b.eq	0x14a8604 <_ChromeMain+0x14a3368>
 14a85e4: 3940fd09     	ldrb	w9, [x8, #0x3f]
 14a85e8: f940190a     	ldr	x10, [x8, #0x30]
 14a85ec: 7219013f     	tst	w9, #0x80
 14a85f0: 9a891149     	csel	x9, x10, x9, ne
 14a85f4: b4fff829     	cbz	x9, 0x14a84f8 <_ChromeMain+0x14a325c>
 14a85f8: 9100a100     	add	x0, x8, #0x28
 14a85fc: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 14a8600: d65f03c0     	ret
 14a8604: f8428d2a     	ldr	x10, [x9, #0x28]!
 14a8608: 7100017f     	cmp	w11, #0x0
 14a860c: 9a894149     	csel	x9, x10, x9, mi
 14a8610: 8b0c0129     	add	x9, x9, x12
 14a8614: d005cc6a     	adrp	x10, 0xce36000 <dyld_stub_binder+0xce36000>
 14a8618: 912ab14a     	add	x10, x10, #0xaac
 14a861c: f940012b     	ldr	x11, [x9]
 14a8620: f940014c     	ldr	x12, [x10]
 14a8624: f8403129     	ldur	x9, [x9, #0x3]
 14a8628: f840314a     	ldur	x10, [x10, #0x3]
 14a862c: eb0c017f     	cmp	x11, x12
 14a8630: fa4a0120     	ccmp	x9, x10, #0x0, eq
 14a8634: 54fff620     	b.eq	0x14a84f8 <_ChromeMain+0x14a325c>
 14a8638: 17ffffeb     	b	0x14a85e4 <_ChromeMain+0x14a3348>
 14a863c: b942b80a     	ldr	w10, [x0, #0x2b8]
 14a8640: 3100055f     	cmn	w10, #0x1
 14a8644: 54000721     	b.ne	0x14a8728 <_ChromeMain+0x14a348c>
 14a8648: 394d212a     	ldrb	w10, [x9, #0x348]
 14a864c: 34fffaea     	cbz	w10, 0x14a85a8 <_ChromeMain+0x14a330c>
 14a8650: 394ba00a     	ldrb	w10, [x0, #0x2e8]
 14a8654: 34fff8ca     	cbz	w10, 0x14a856c <_ChromeMain+0x14a32d0>
 14a8658: b982b40a     	ldrsw	x10, [x0, #0x2b4]
 14a865c: 3100055f     	cmn	w10, #0x1
 14a8660: 54000960     	b.eq	0x14a878c <_ChromeMain+0x14a34f0>
 14a8664: f941400b     	ldr	x11, [x0, #0x280]
 14a8668: eb0a017f     	cmp	x11, x10
 14a866c: 54000689     	b.ls	0x14a873c <_ChromeMain+0x14a34a0>
 14a8670: f9413c0b     	ldr	x11, [x0, #0x278]
 14a8674: f86a796a     	ldr	x10, [x11, x10, lsl #3]
 14a8678: b944314a     	ldr	w10, [x10, #0x430]
 14a867c: 7100095f     	cmp	w10, #0x2
 14a8680: 54fff760     	b.eq	0x14a856c <_ChromeMain+0x14a32d0>
 14a8684: f941340a     	ldr	x10, [x0, #0x268]
 14a8688: b400088a     	cbz	x10, 0x14a8798 <_ChromeMain+0x14a34fc>
 14a868c: 3945814a     	ldrb	w10, [x10, #0x160]
 14a8690: 3707f6ea     	tbnz	w10, #0x0, 0x14a856c <_ChromeMain+0x14a32d0>
 14a8694: 17ffffc5     	b	0x14a85a8 <_ChromeMain+0x14a330c>
 14a8698: b942b80b     	ldr	w11, [x0, #0x2b8]
 14a869c: 394d212a     	ldrb	w10, [x9, #0x348]
 14a86a0: 3100057f     	cmn	w11, #0x1
 14a86a4: 540003a1     	b.ne	0x14a8718 <_ChromeMain+0x14a347c>
 14a86a8: 3500020a     	cbnz	w10, 0x14a86e8 <_ChromeMain+0x14a344c>
 14a86ac: 394d212a     	ldrb	w10, [x9, #0x348]
 14a86b0: 34fff48a     	cbz	w10, 0x14a8540 <_ChromeMain+0x14a32a4>
 14a86b4: b944310a     	ldr	w10, [x8, #0x430]
 14a86b8: 7100095f     	cmp	w10, #0x2
 14a86bc: 54fff400     	b.eq	0x14a853c <_ChromeMain+0x14a32a0>
 14a86c0: f941340a     	ldr	x10, [x0, #0x268]
 14a86c4: b400058a     	cbz	x10, 0x14a8774 <_ChromeMain+0x14a34d8>
 14a86c8: 3945814a     	ldrb	w10, [x10, #0x160]
 14a86cc: 3707f38a     	tbnz	w10, #0x0, 0x14a853c <_ChromeMain+0x14a32a0>
 14a86d0: 17ffff9c     	b	0x14a8540 <_ChromeMain+0x14a32a4>
 14a86d4: 3100053f     	cmn	w9, #0x1
 14a86d8: 54fff5c1     	b.ne	0x14a8590 <_ChromeMain+0x14a32f4>
 14a86dc: d4200000     	brk	#0
 14a86e0: d4400000     	hlt	#0
 14a86e4: d4200020     	brk	#0x1
 14a86e8: b944310a     	ldr	w10, [x8, #0x430]
 14a86ec: 7100095f     	cmp	w10, #0x2
 14a86f0: 54fff220     	b.eq	0x14a8534 <_ChromeMain+0x14a3298>
 14a86f4: f941340a     	ldr	x10, [x0, #0x268]
 14a86f8: b400044a     	cbz	x10, 0x14a8780 <_ChromeMain+0x14a34e4>
 14a86fc: 3945814a     	ldrb	w10, [x10, #0x160]
 14a8700: 3707f1aa     	tbnz	w10, #0x0, 0x14a8534 <_ChromeMain+0x14a3298>
 14a8704: 17ffffea     	b	0x14a86ac <_ChromeMain+0x14a3410>
 14a8708: b942b80a     	ldr	w10, [x0, #0x2b8]
 14a870c: 3100055f     	cmn	w10, #0x1
 14a8710: 54fffce0     	b.eq	0x14a86ac <_ChromeMain+0x14a3410>
 14a8714: 14000002     	b	0x14a871c <_ChromeMain+0x14a3480>
 14a8718: 35fff0ea     	cbnz	w10, 0x14a8534 <_ChromeMain+0x14a3298>
 14a871c: 394d212a     	ldrb	w10, [x9, #0x348]
 14a8720: 35fff0ea     	cbnz	w10, 0x14a853c <_ChromeMain+0x14a32a0>
 14a8724: 17ffff87     	b	0x14a8540 <_ChromeMain+0x14a32a4>
 14a8728: 394ba00a     	ldrb	w10, [x0, #0x2e8]
 14a872c: 34fff20a     	cbz	w10, 0x14a856c <_ChromeMain+0x14a32d0>
 14a8730: 394d212a     	ldrb	w10, [x9, #0x348]
 14a8734: 35fff1ca     	cbnz	w10, 0x14a856c <_ChromeMain+0x14a32d0>
 14a8738: 17ffff9c     	b	0x14a85a8 <_ChromeMain+0x14a330c>
 14a873c: d4200020     	brk	#0x1
 14a8740: d4200000     	brk	#0
 14a8744: d4400000     	hlt	#0
 14a8748: d4200020     	brk	#0x1
 14a874c: d4200000     	brk	#0
 14a8750: d4400000     	hlt	#0
 14a8754: d4200020     	brk	#0x1
 14a8758: 900619e0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 14a875c: 91376000     	add	x0, x0, #0xdd8
 14a8760: 94dd5edd     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 14a8764: 91098000     	add	x0, x0, #0x260
 14a8768: 9455ba4c     	bl	0x2a17098 <_ChromeMain+0x2a11dfc>
 14a876c: aa0003e8     	mov	x8, x0
 14a8770: 17ffff6c     	b	0x14a8520 <_ChromeMain+0x14a3284>
 14a8774: d4200000     	brk	#0
 14a8778: d4400000     	hlt	#0
 14a877c: d4200020     	brk	#0x1
 14a8780: d4200000     	brk	#0
 14a8784: d4400000     	hlt	#0
 14a8788: d4200020     	brk	#0x1
 14a878c: d4200000     	brk	#0
 14a8790: d4400000     	hlt	#0
 14a8794: d4200020     	brk	#0x1
 14a8798: d4200000     	brk	#0
 14a879c: d4400000     	hlt	#0
 14a87a0: d4200020     	brk	#0x1
		...
