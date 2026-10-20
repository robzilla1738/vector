
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 33555b8: d10183ff     	sub	sp, sp, #0x60
 33555bc: a9025ff8     	stp	x24, x23, [sp, #0x20]
 33555c0: a90357f6     	stp	x22, x21, [sp, #0x30]
 33555c4: a9044ff4     	stp	x20, x19, [sp, #0x40]
 33555c8: a9057bfd     	stp	x29, x30, [sp, #0x50]
 33555cc: 910143fd     	add	x29, sp, #0x50
 33555d0: aa0303f6     	mov	x22, x3
 33555d4: aa0203f4     	mov	x20, x2
 33555d8: aa0103f5     	mov	x21, x1
 33555dc: aa0003f3     	mov	x19, x0
 33555e0: f940cc0a     	ldr	x10, [x0, #0x198]
 33555e4: 9100a148     	add	x8, x10, #0x28
 33555e8: 3980fd49     	ldrsb	x9, [x10, #0x3f]
 33555ec: f940194a     	ldr	x10, [x10, #0x30]
 33555f0: b6f80249     	tbz	x9, #0x3f, 0x3355638 <_ChromeMain+0x335039c>
 33555f4: f100715f     	cmp	x10, #0x1c
 33555f8: 54000201     	b.ne	0x3355638 <_ChromeMain+0x335039c>
 33555fc: f940010a     	ldr	x10, [x8]
 3355600: d004dc0b     	adrp	x11, 0xced7000 <dyld_stub_binder+0xced7000>
 3355604: 910e656b     	add	x11, x11, #0x399
 3355608: a940354c     	ldp	x12, x13, [x10]
 335560c: a9403d6e     	ldp	x14, x15, [x11]
 3355610: f9400950     	ldr	x16, [x10, #0x10]
 3355614: f9400971     	ldr	x17, [x11, #0x10]
 3355618: b940194a     	ldr	w10, [x10, #0x18]
 335561c: b940196b     	ldr	w11, [x11, #0x18]
 3355620: eb0e019f     	cmp	x12, x14
 3355624: fa4f01a0     	ccmp	x13, x15, #0x0, eq
 3355628: fa510200     	ccmp	x16, x17, #0x0, eq
 335562c: fa4b0140     	ccmp	x10, x11, #0x0, eq
 3355630: 54000260     	b.eq	0x335567c <_ChromeMain+0x33503e0>
 3355634: 5280038a     	mov	w10, #0x1c              ; =28
 3355638: 7100013f     	cmp	w9, #0x0
 335563c: 9a89414a     	csel	x10, x10, x9, mi
 3355640: f100555f     	cmp	x10, #0x15
 3355644: 54000401     	b.ne	0x33556c4 <_ChromeMain+0x3350428>
 3355648: f940010a     	ldr	x10, [x8]
 335564c: 7100013f     	cmp	w9, #0x0
 3355650: 9a884148     	csel	x8, x10, x8, mi
 3355654: 9004dd49     	adrp	x9, 0xcefd000 <dyld_stub_binder+0xcefd000>
 3355658: 911fd929     	add	x9, x9, #0x7f6
 335565c: a9402d0a     	ldp	x10, x11, [x8]
 3355660: a940352c     	ldp	x12, x13, [x9]
 3355664: f840d108     	ldur	x8, [x8, #0xd]
 3355668: f840d129     	ldur	x9, [x9, #0xd]
 335566c: eb0c015f     	cmp	x10, x12
 3355670: fa4d0160     	ccmp	x11, x13, #0x0, eq
 3355674: fa490100     	ccmp	x8, x9, #0x0, eq
 3355678: 54000261     	b.ne	0x33556c4 <_ChromeMain+0x3350428>
 335567c: 52824b28     	mov	w8, #0x1259             ; =4697
 3355680: 38286abf     	strb	wzr, [x21, x8]
 3355684: 39003fff     	strb	wzr, [sp, #0xf]
 3355688: f0ff8c82     	adrp	x2, 0x24e8000 <_ChromeMain+0x24e2d64>
 335568c: 91145042     	add	x2, x2, #0x514
 3355690: 528004a8     	mov	w8, #0x25               ; =37
 3355694: f9000be8     	str	x8, [sp, #0x10]
 3355698: 9005ddb7     	adrp	x23, 0xef09000 <dyld_stub_binder+0xef09000>
 335569c: 395636e0     	ldrb	w0, [x23, #0x58d]
 33556a0: 35000c20     	cbnz	w0, 0x3355824 <_ChromeMain+0x3350588>
 33556a4: 9123a2a0     	add	x0, x21, #0x8e8
 33556a8: 91003fe1     	add	x1, sp, #0xf
 33556ac: d2800003     	mov	x3, #0x0                ; =0
 33556b0: 97b01062     	bl	0x1f59838 <_ChromeMain+0x1f5459c>
 33556b4: 528004a8     	mov	w8, #0x25               ; =37
 33556b8: f9000be8     	str	x8, [sp, #0x10]
 33556bc: 395636e0     	ldrb	w0, [x23, #0x58d]
 33556c0: 35000a60     	cbnz	w0, 0x335580c <_ChromeMain+0x3350570>
 33556c4: 710002df     	cmp	w22, #0x0
 33556c8: 52000288     	eor	w8, w20, #0x1
 33556cc: 1a9f0508     	csinc	w8, w8, wzr, eq
 33556d0: 37000148     	tbnz	w8, #0x0, 0x33556f8 <_ChromeMain+0x335045c>
 33556d4: f9403e60     	ldr	x0, [x19, #0x78]
 33556d8: f9400008     	ldr	x8, [x0]
 33556dc: f940a508     	ldr	x8, [x8, #0x148]
 33556e0: d63f0100     	blr	x8
 33556e4: b40000a0     	cbz	x0, 0x33556f8 <_ChromeMain+0x335045c>
 33556e8: f9400008     	ldr	x8, [x0]
 33556ec: f9401108     	ldr	x8, [x8, #0x20]
 33556f0: aa1503e1     	mov	x1, x21
 33556f4: d63f0100     	blr	x8
 33556f8: aa1503e0     	mov	x0, x21
 33556fc: d2800001     	mov	x1, #0x0                ; =0
 3355700: 97db4fca     	bl	0x2a29628 <_ChromeMain+0x2a2438c>
 3355704: b0050ba1     	adrp	x1, 0xd4ca000 <dyld_stub_binder+0xd4ca000>
 3355708: 91090021     	add	x1, x1, #0x240
 335570c: 910022a0     	add	x0, x21, #0x8
 3355710: 9733f698     	bl	0x53170 <_ChromeMain+0x4ded4>
 3355714: d100a008     	sub	x8, x0, #0x28
 3355718: f100001f     	cmp	x0, #0x0
 335571c: 9a8803e0     	csel	x0, xzr, x8, eq
 3355720: d2800001     	mov	x1, #0x0                ; =0
 3355724: 97dc2f19     	bl	0x2a61388 <_ChromeMain+0x2a5c0ec>
 3355728: f9000ff5     	str	x21, [sp, #0x18]
 335572c: 9104a260     	add	x0, x19, #0x128
 3355730: 910063e1     	add	x1, sp, #0x18
 3355734: 97d688d4     	bl	0x28f7a84 <_ChromeMain+0x28f27e8>
 3355738: f940c668     	ldr	x8, [x19, #0x188]
 335573c: b005c2f7     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 3355740: b40002e8     	cbz	x8, 0x335579c <_ChromeMain+0x3350500>
 3355744: 91062269     	add	x9, x19, #0x188
 3355748: 9005aa0a     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 335574c: 9119e14a     	add	x10, x10, #0x678
 3355750: 1400000d     	b	0x3355784 <_ChromeMain+0x33504e8>
 3355754: eb09011f     	cmp	x8, x9
 3355758: 54000220     	b.eq	0x335579c <_ChromeMain+0x3350500>
 335575c: f9401516     	ldr	x22, [x8, #0x28]
 3355760: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 3355764: f94046e9     	ldr	x9, [x23, #0x88]
 3355768: eb09011f     	cmp	x8, x9
 335576c: 540001a1     	b.ne	0x33557a0 <_ChromeMain+0x3350504>
 3355770: aa1603e0     	mov	x0, x22
 3355774: 9732fae2     	bl	0x142fc <_ChromeMain+0xf060>
 3355778: 1400000a     	b	0x33557a0 <_ChromeMain+0x3350504>
 335577c: f9400108     	ldr	x8, [x8]
 3355780: b40000e8     	cbz	x8, 0x335579c <_ChromeMain+0x3350500>
 3355784: f940110b     	ldr	x11, [x8, #0x20]
 3355788: eb0a017f     	cmp	x11, x10
 335578c: 54ffff88     	b.hi	0x335577c <_ChromeMain+0x33504e0>
 3355790: 54fffe20     	b.eq	0x3355754 <_ChromeMain+0x33504b8>
 3355794: f9400508     	ldr	x8, [x8, #0x8]
 3355798: b5ffff68     	cbnz	x8, 0x3355784 <_ChromeMain+0x33504e8>
 335579c: d2800016     	mov	x22, #0x0               ; =0
 33557a0: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 33557a4: f94046e9     	ldr	x9, [x23, #0x88]
 33557a8: eb09011f     	cmp	x8, x9
 33557ac: 54000061     	b.ne	0x33557b8 <_ChromeMain+0x335051c>
 33557b0: aa1603e0     	mov	x0, x22
 33557b4: 973334a2     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 33557b8: aa1603e0     	mov	x0, x22
 33557bc: aa1503e1     	mov	x1, x21
 33557c0: 941af3e0     	bl	0x3a12740 <_ChromeMain+0x3a0d4a4>
 33557c4: 34000194     	cbz	w20, 0x33557f4 <_ChromeMain+0x3350558>
 33557c8: f940d260     	ldr	x0, [x19, #0x1a0]
 33557cc: f9409008     	ldr	x8, [x0, #0x120]
 33557d0: b4000128     	cbz	x8, 0x33557f4 <_ChromeMain+0x3350558>
 33557d4: 95203c04     	bl	0x7b647e4 <_ChromeMain+0x7b5f548>
 33557d8: d2800001     	mov	x1, #0x0                ; =0
 33557dc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 33557e0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 33557e4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 33557e8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 33557ec: 910183ff     	add	sp, sp, #0x60
 33557f0: 152176b5     	b	0x7bb32c4 <_ChromeMain+0x7bae028>
 33557f4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 33557f8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 33557fc: a94357f6     	ldp	x22, x21, [sp, #0x30]
 3355800: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 3355804: 910183ff     	add	sp, sp, #0x60
 3355808: d65f03c0     	ret
 335580c: f9000fff     	str	xzr, [sp, #0x18]
 3355810: 910043e1     	add	x1, sp, #0x10
 3355814: 910063e2     	add	x2, sp, #0x18
 3355818: 52800043     	mov	w3, #0x2                ; =2
 335581c: 973c791b     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 3355820: 17ffffa9     	b	0x33556c4 <_ChromeMain+0x3350428>
 3355824: 900532a8     	adrp	x8, 0xd9a9000 <dyld_stub_binder+0xd9a9000>
 3355828: 913a4508     	add	x8, x8, #0xe91
 335582c: f9000fe8     	str	x8, [sp, #0x18]
 3355830: 910043e1     	add	x1, sp, #0x10
 3355834: 910063e2     	add	x2, sp, #0x18
 3355838: 52800023     	mov	w3, #0x1                ; =1
 335583c: 973c7913     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 3355840: f0ff8c82     	adrp	x2, 0x24e8000 <_ChromeMain+0x24e2d64>
 3355844: 91145042     	add	x2, x2, #0x514
 3355848: 17ffff97     	b	0x33556a4 <_ChromeMain+0x3350408>
