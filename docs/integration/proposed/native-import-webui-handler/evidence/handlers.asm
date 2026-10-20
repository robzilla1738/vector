
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424e820: d10343ff     	sub	sp, sp, #0xd0
 424e824: 6d0723e9     	stp	d9, d8, [sp, #0x70]
 424e828: a90867fa     	stp	x26, x25, [sp, #0x80]
 424e82c: a9095ff8     	stp	x24, x23, [sp, #0x90]
 424e830: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 424e834: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 424e838: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 424e83c: 910303fd     	add	x29, sp, #0xc0
 424e840: f9400429     	ldr	x9, [x1, #0x8]
 424e844: b40003c9     	cbz	x9, 0x424e8bc <_ChromeMain+0x4249620>
 424e848: f9400028     	ldr	x8, [x1]
 424e84c: 3940610a     	ldrb	w10, [x8, #0x18]
 424e850: 7100115f     	cmp	w10, #0x4
 424e854: 54000341     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e858: aa0003f3     	mov	x19, x0
 424e85c: 39805d0b     	ldrsb	x11, [x8, #0x17]
 424e860: a940310a     	ldp	x10, x12, [x8]
 424e864: f100017f     	cmp	x11, #0x0
 424e868: 9a88414a     	csel	x10, x10, x8, mi
 424e86c: 7100017f     	cmp	w11, #0x0
 424e870: 9a8b418b     	csel	x11, x12, x11, mi
 424e874: f100197f     	cmp	x11, #0x6
 424e878: 54000320     	b.eq	0x424e8dc <_ChromeMain+0x4249640>
 424e87c: f100157f     	cmp	x11, #0x5
 424e880: 54000520     	b.eq	0x424e924 <_ChromeMain+0x4249688>
 424e884: f1000d7f     	cmp	x11, #0x3
 424e888: 540001a1     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e88c: 7940014b     	ldrh	w11, [x10]
 424e890: 3940094c     	ldrb	w12, [x10, #0x2]
 424e894: 71018d9f     	cmp	w12, #0x63
 424e898: 528e4c2c     	mov	w12, #0x7261            ; =29281
 424e89c: 7a4c0160     	ccmp	w11, w12, #0x0, eq
 424e8a0: 54000740     	b.eq	0x424e988 <_ChromeMain+0x42496ec>
 424e8a4: 7940014b     	ldrh	w11, [x10]
 424e8a8: 3940094a     	ldrb	w10, [x10, #0x2]
 424e8ac: 7101855f     	cmp	w10, #0x61
 424e8b0: 528d2c8a     	mov	w10, #0x6964            ; =26980
 424e8b4: 7a4a0160     	ccmp	w11, w10, #0x0, eq
 424e8b8: 54000840     	b.eq	0x424e9c0 <_ChromeMain+0x4249724>
 424e8bc: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 424e8c0: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 424e8c4: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 424e8c8: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 424e8cc: a94867fa     	ldp	x26, x25, [sp, #0x80]
 424e8d0: 6d4723e9     	ldp	d9, d8, [sp, #0x70]
 424e8d4: 910343ff     	add	sp, sp, #0xd0
 424e8d8: d65f03c0     	ret
 424e8dc: b940014b     	ldr	w11, [x10]
 424e8e0: 7940094c     	ldrh	w12, [x10, #0x4]
 424e8e4: 528d0c6d     	mov	w13, #0x6863            ; =26723
 424e8e8: 72adee4d     	movk	w13, #0x6f72, lsl #16
 424e8ec: 6b0d017f     	cmp	w11, w13
 424e8f0: 528cadab     	mov	w11, #0x656d            ; =25965
 424e8f4: 7a4b0180     	ccmp	w12, w11, #0x0, eq
 424e8f8: 540004c0     	b.eq	0x424e990 <_ChromeMain+0x42496f4>
 424e8fc: b940014b     	ldr	w11, [x10]
 424e900: 7940094a     	ldrh	w10, [x10, #0x4]
 424e904: 528cad0c     	mov	w12, #0x6568            ; =25960
 424e908: 72ad2d8c     	movk	w12, #0x696c, lsl #16
 424e90c: 6b0c017f     	cmp	w11, w12
 424e910: 528daeab     	mov	w11, #0x6d75            ; =28021
 424e914: 7a4b0140     	ccmp	w10, w11, #0x0, eq
 424e918: 54fffd21     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e91c: 528000f6     	mov	w22, #0x7               ; =7
 424e920: 1400001f     	b	0x424e99c <_ChromeMain+0x4249700>
 424e924: b940014b     	ldr	w11, [x10]
 424e928: 3940114c     	ldrb	w12, [x10, #0x4]
 424e92c: 7101959f     	cmp	w12, #0x65
 424e930: 528e4c4c     	mov	w12, #0x7262            ; =29282
 424e934: 72aecc2c     	movk	w12, #0x7661, lsl #16
 424e938: 7a4c0160     	ccmp	w11, w12, #0x0, eq
 424e93c: 540002e0     	b.eq	0x424e998 <_ChromeMain+0x42496fc>
 424e940: b940014b     	ldr	w11, [x10]
 424e944: 3940114c     	ldrb	w12, [x10, #0x4]
 424e948: 7101cd9f     	cmp	w12, #0x73
 424e94c: 528e8c2c     	mov	w12, #0x7461            ; =29793
 424e950: 72ac2d8c     	movk	w12, #0x616c, lsl #16
 424e954: 7a4c0160     	ccmp	w11, w12, #0x0, eq
 424e958: 54000140     	b.eq	0x424e980 <_ChromeMain+0x42496e4>
 424e95c: b940014b     	ldr	w11, [x10]
 424e960: 3940114a     	ldrb	w10, [x10, #0x4]
 424e964: 7101d15f     	cmp	w10, #0x74
 424e968: 528dec6a     	mov	w10, #0x6f63            ; =28515
 424e96c: 72acadaa     	movk	w10, #0x656d, lsl #16
 424e970: 7a4a0160     	ccmp	w11, w10, #0x0, eq
 424e974: 54fffa41     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e978: 52800096     	mov	w22, #0x4               ; =4
 424e97c: 14000008     	b	0x424e99c <_ChromeMain+0x4249700>
 424e980: 52800056     	mov	w22, #0x2               ; =2
 424e984: 14000006     	b	0x424e99c <_ChromeMain+0x4249700>
 424e988: 52800016     	mov	w22, #0x0               ; =0
 424e98c: 14000004     	b	0x424e99c <_ChromeMain+0x4249700>
 424e990: 52800076     	mov	w22, #0x3               ; =3
 424e994: 14000002     	b	0x424e99c <_ChromeMain+0x4249700>
 424e998: 52800036     	mov	w22, #0x1               ; =1
 424e99c: f100153f     	cmp	x9, #0x5
 424e9a0: 54fff8e1     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e9a4: 3940e109     	ldrb	w9, [x8, #0x38]
 424e9a8: 7100093f     	cmp	w9, #0x2
 424e9ac: 540000e0     	b.eq	0x424e9c8 <_ChromeMain+0x424972c>
 424e9b0: 71000d3f     	cmp	w9, #0x3
 424e9b4: 54fff841     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e9b8: fd401100     	ldr	d0, [x8, #0x20]
 424e9bc: 14000005     	b	0x424e9d0 <_ChromeMain+0x4249734>
 424e9c0: 528000b6     	mov	w22, #0x5               ; =5
 424e9c4: 17fffff6     	b	0x424e99c <_ChromeMain+0x4249700>
 424e9c8: b9402109     	ldr	w9, [x8, #0x20]
 424e9cc: 1e620120     	scvtf	d0, w9
 424e9d0: 39416109     	ldrb	w9, [x8, #0x58]
 424e9d4: 7100093f     	cmp	w9, #0x2
 424e9d8: 540000a0     	b.eq	0x424e9ec <_ChromeMain+0x4249750>
 424e9dc: 71000d3f     	cmp	w9, #0x3
 424e9e0: 54fff6e1     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424e9e4: fd402101     	ldr	d1, [x8, #0x40]
 424e9e8: 14000003     	b	0x424e9f4 <_ChromeMain+0x4249758>
 424e9ec: b9404109     	ldr	w9, [x8, #0x40]
 424e9f0: 1e620121     	scvtf	d1, w9
 424e9f4: 3941e109     	ldrb	w9, [x8, #0x78]
 424e9f8: 7100093f     	cmp	w9, #0x2
 424e9fc: 540000a0     	b.eq	0x424ea10 <_ChromeMain+0x4249774>
 424ea00: 71000d3f     	cmp	w9, #0x3
 424ea04: 54fff5c1     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424ea08: fd403102     	ldr	d2, [x8, #0x60]
 424ea0c: 14000003     	b	0x424ea18 <_ChromeMain+0x424977c>
 424ea10: b9406109     	ldr	w9, [x8, #0x60]
 424ea14: 1e620122     	scvtf	d2, w9
 424ea18: 39426109     	ldrb	w9, [x8, #0x98]
 424ea1c: 7100093f     	cmp	w9, #0x2
 424ea20: 540000e0     	b.eq	0x424ea3c <_ChromeMain+0x42497a0>
 424ea24: 71000d3f     	cmp	w9, #0x3
 424ea28: 54fff4a1     	b.ne	0x424e8bc <_ChromeMain+0x4249620>
 424ea2c: ad0087e2     	stp	q2, q1, [sp, #0x10]
 424ea30: 3d800fe0     	str	q0, [sp, #0x30]
 424ea34: fd404100     	ldr	d0, [x8, #0x80]
 424ea38: 14000005     	b	0x424ea4c <_ChromeMain+0x42497b0>
 424ea3c: ad0087e2     	stp	q2, q1, [sp, #0x10]
 424ea40: 3d800fe0     	str	q0, [sp, #0x30]
 424ea44: b9408108     	ldr	w8, [x8, #0x80]
 424ea48: 1e620100     	scvtf	d0, w8
 424ea4c: 3d8003e0     	str	q0, [sp]
 424ea50: f9400660     	ldr	x0, [x19, #0x8]
 424ea54: 910183e8     	add	x8, sp, #0x60
 424ea58: 94000284     	bl	0x424f468 <_ChromeMain+0x424a1cc>
 424ea5c: 71000edf     	cmp	w22, #0x3
 424ea60: 540005cc     	b.gt	0x424eb18 <_ChromeMain+0x424987c>
 424ea64: 710006df     	cmp	w22, #0x1
 424ea68: 5400034d     	b.le	0x424ead0 <_ChromeMain+0x4249834>
 424ea6c: 71000adf     	cmp	w22, #0x2
 424ea70: 54000fa1     	b.ne	0x424ec64 <_ChromeMain+0x42499c8>
 424ea74: 52800400     	mov	w0, #0x20               ; =32
 424ea78: 96f7023c     	bl	0xf368 <_ChromeMain+0xa0cc>
 424ea7c: f90027e0     	str	x0, [sp, #0x48]
 424ea80: b004e788     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 424ea84: 3dc02d00     	ldr	q0, [x8, #0xb0]
 424ea88: 3c8503e0     	stur	q0, [sp, #0x50]
 424ea8c: 91006809     	add	x9, x0, #0x1a
 424ea90: eb00013f     	cmp	x9, x0
 424ea94: 54001923     	b.lo	0x424edb8 <_ChromeMain+0x4249b1c>
 424ea98: aa0003f4     	mov	x20, x0
 424ea9c: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424eaa0: 910f6908     	add	x8, x8, #0x3da
 424eaa4: eb08013f     	cmp	x9, x8
 424eaa8: fa488002     	ccmp	x0, x8, #0x2, hi
 424eaac: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424eab0: 54001849     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424eab4: 3dc00100     	ldr	q0, [x8]
 424eab8: 3d800280     	str	q0, [x20]
 424eabc: 3cc0a100     	ldur	q0, [x8, #0xa]
 424eac0: 3c80a280     	stur	q0, [x20, #0xa]
 424eac4: 7900369f     	strh	wzr, [x20, #0x1a]
 424eac8: 528001b5     	mov	w21, #0xd               ; =13
 424eacc: 14000078     	b	0x424ecac <_ChromeMain+0x4249a10>
 424ead0: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424ead4: 35000a96     	cbnz	w22, 0x424ec24 <_ChromeMain+0x4249988>
 424ead8: 52800068     	mov	w8, #0x3                ; =3
 424eadc: 39017fe8     	strb	w8, [sp, #0x5f]
 424eae0: 910123e8     	add	x8, sp, #0x48
 424eae4: b27f0509     	orr	x9, x8, #0x6
 424eae8: 9004e96a     	adrp	x10, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424eaec: 910f194a     	add	x10, x10, #0x3c6
 424eaf0: eb0a013f     	cmp	x9, x10
 424eaf4: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424eaf8: 54001609     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424eafc: d2800828     	mov	x8, #0x41               ; =65
 424eb00: f2a00e48     	movk	x8, #0x72, lsl #16
 424eb04: f2c00c68     	movk	x8, #0x63, lsl #32
 424eb08: f90027e8     	str	x8, [sp, #0x48]
 424eb0c: 910123f4     	add	x20, sp, #0x48
 424eb10: 52800075     	mov	w21, #0x3               ; =3
 424eb14: 14000066     	b	0x424ecac <_ChromeMain+0x4249a10>
 424eb18: 710016df     	cmp	w22, #0x5
 424eb1c: 5400034d     	b.le	0x424eb84 <_ChromeMain+0x42498e8>
 424eb20: 71001adf     	cmp	w22, #0x6
 424eb24: 54000661     	b.ne	0x424ebf0 <_ChromeMain+0x4249954>
 424eb28: 52800400     	mov	w0, #0x20               ; =32
 424eb2c: 96f7020f     	bl	0xf368 <_ChromeMain+0xa0cc>
 424eb30: f90027e0     	str	x0, [sp, #0x48]
 424eb34: d004e788     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 424eb38: 3dc0b900     	ldr	q0, [x8, #0x2e0]
 424eb3c: 3c8503e0     	stur	q0, [sp, #0x50]
 424eb40: 91007009     	add	x9, x0, #0x1c
 424eb44: eb00013f     	cmp	x9, x0
 424eb48: 54001383     	b.lo	0x424edb8 <_ChromeMain+0x4249b1c>
 424eb4c: aa0003f4     	mov	x20, x0
 424eb50: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424eb54: 91106108     	add	x8, x8, #0x418
 424eb58: eb08013f     	cmp	x9, x8
 424eb5c: fa488002     	ccmp	x0, x8, #0x2, hi
 424eb60: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424eb64: 540012a9     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424eb68: 3dc00100     	ldr	q0, [x8]
 424eb6c: 3d800280     	str	q0, [x20]
 424eb70: 3cc0c100     	ldur	q0, [x8, #0xc]
 424eb74: 3c80c280     	stur	q0, [x20, #0xc]
 424eb78: 79003a9f     	strh	wzr, [x20, #0x1c]
 424eb7c: 528001d5     	mov	w21, #0xe               ; =14
 424eb80: 1400004b     	b	0x424ecac <_ChromeMain+0x4249a10>
 424eb84: 710012df     	cmp	w22, #0x4
 424eb88: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424eb8c: 540001c0     	b.eq	0x424ebc4 <_ChromeMain+0x4249928>
 424eb90: 52800068     	mov	w8, #0x3                ; =3
 424eb94: 39017fe8     	strb	w8, [sp, #0x5f]
 424eb98: 910123e8     	add	x8, sp, #0x48
 424eb9c: b27f0509     	orr	x9, x8, #0x6
 424eba0: 9004e96a     	adrp	x10, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424eba4: 9110414a     	add	x10, x10, #0x410
 424eba8: eb0a013f     	cmp	x9, x10
 424ebac: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424ebb0: 54001049     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424ebb4: d2800888     	mov	x8, #0x44               ; =68
 424ebb8: f2a00d28     	movk	x8, #0x69, lsl #16
 424ebbc: f2c00c28     	movk	x8, #0x61, lsl #32
 424ebc0: 17ffffd2     	b	0x424eb08 <_ChromeMain+0x424986c>
 424ebc4: 528000a8     	mov	w8, #0x5                ; =5
 424ebc8: 39017fe8     	strb	w8, [sp, #0x5f]
 424ebcc: 910123e9     	add	x9, sp, #0x48
 424ebd0: 9100292a     	add	x10, x9, #0xa
 424ebd4: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ebd8: 91101108     	add	x8, x8, #0x404
 424ebdc: eb08015f     	cmp	x10, x8
 424ebe0: fa488122     	ccmp	x9, x8, #0x2, hi
 424ebe4: 54000ea9     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424ebe8: 52800e89     	mov	w9, #0x74               ; =116
 424ebec: 14000018     	b	0x424ec4c <_ChromeMain+0x42499b0>
 424ebf0: 528000c8     	mov	w8, #0x6                ; =6
 424ebf4: 39017fe8     	strb	w8, [sp, #0x5f]
 424ebf8: 910123e9     	add	x9, sp, #0x48
 424ebfc: 9100312a     	add	x10, x9, #0xc
 424ec00: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ec04: 9110d908     	add	x8, x8, #0x436
 424ec08: eb08015f     	cmp	x10, x8
 424ec0c: fa488122     	ccmp	x9, x8, #0x2, hi
 424ec10: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424ec14: 54000d29     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424ec18: 52800ea9     	mov	w9, #0x75               ; =117
 424ec1c: 72a00da9     	movk	w9, #0x6d, lsl #16
 424ec20: 1400001d     	b	0x424ec94 <_ChromeMain+0x42499f8>
 424ec24: 528000a8     	mov	w8, #0x5                ; =5
 424ec28: 39017fe8     	strb	w8, [sp, #0x5f]
 424ec2c: 910123e9     	add	x9, sp, #0x48
 424ec30: 9100292a     	add	x10, x9, #0xa
 424ec34: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ec38: 910f3908     	add	x8, x8, #0x3ce
 424ec3c: eb08015f     	cmp	x10, x8
 424ec40: fa488122     	ccmp	x9, x8, #0x2, hi
 424ec44: 54000ba9     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424ec48: 52800ca9     	mov	w9, #0x65               ; =101
 424ec4c: b90053e9     	str	w9, [sp, #0x50]
 424ec50: f9400108     	ldr	x8, [x8]
 424ec54: f90027e8     	str	x8, [sp, #0x48]
 424ec58: 910123f4     	add	x20, sp, #0x48
 424ec5c: 528000b5     	mov	w21, #0x5               ; =5
 424ec60: 14000013     	b	0x424ecac <_ChromeMain+0x4249a10>
 424ec64: 528000c8     	mov	w8, #0x6                ; =6
 424ec68: 39017fe8     	strb	w8, [sp, #0x5f]
 424ec6c: 910123e9     	add	x9, sp, #0x48
 424ec70: 9100312a     	add	x10, x9, #0xc
 424ec74: 9004e968     	adrp	x8, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ec78: 910fd908     	add	x8, x8, #0x3f6
 424ec7c: eb08015f     	cmp	x10, x8
 424ec80: fa488122     	ccmp	x9, x8, #0x2, hi
 424ec84: 3dc00fe2     	ldr	q2, [sp, #0x30]
 424ec88: 54000989     	b.ls	0x424edb8 <_ChromeMain+0x4249b1c>
 424ec8c: 52800da9     	mov	w9, #0x6d               ; =109
 424ec90: 72a00ca9     	movk	w9, #0x65, lsl #16
 424ec94: b90053e9     	str	w9, [sp, #0x50]
 424ec98: f9400108     	ldr	x8, [x8]
 424ec9c: f90027e8     	str	x8, [sp, #0x48]
 424eca0: 7900abff     	strh	wzr, [sp, #0x54]
 424eca4: 910123f4     	add	x20, sp, #0x48
 424eca8: 528000d5     	mov	w21, #0x6               ; =6
 424ecac: f9401a77     	ldr	x23, [x19, #0x30]
 424ecb0: b40000d7     	cbz	x23, 0x424ecc8 <_ChromeMain+0x4249a2c>
 424ecb4: 52800028     	mov	w8, #0x1                ; =1
 424ecb8: b82802e8     	ldadd	w8, w8, [x23]
 424ecbc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424ecc0: 6b09011f     	cmp	w8, w9
 424ecc4: 540007c0     	b.eq	0x424edbc <_ChromeMain+0x4249b20>
 424ecc8: 4ea21c40     	mov.16b	v0, v2
 424eccc: 3dc003e1     	ldr	q1, [sp]
 424ecd0: 6e180420     	mov.d	v0[1], v1[0]
 424ecd4: 4ee1b800     	fcvtzs.2d	v0, v0
 424ecd8: 0ea12800     	xtn.2s	v0, v0
 424ecdc: 4ea21c41     	mov.16b	v1, v2
 424ece0: 3dc00be3     	ldr	q3, [sp, #0x20]
 424ece4: 6e180461     	mov.d	v1[1], v3[0]
 424ece8: 4ee1b821     	fcvtzs.2d	v1, v1
 424ecec: 1e780058     	fcvtzs	w24, d2
 424ecf0: 0ea12821     	xtn.2s	v1, v1
 424ecf4: 3dc007e2     	ldr	q2, [sp, #0x10]
 424ecf8: 6e180462     	mov.d	v2[1], v3[0]
 424ecfc: 4ee1b842     	fcvtzs.2d	v2, v2
 424ed00: 1e780079     	fcvtzs	w25, d3
 424ed04: 0ea12842     	xtn.2s	v2, v2
 424ed08: 0ea00c40     	sqadd.2s	v0, v2, v0
 424ed0c: 0ea12c00     	sqsub.2s	v0, v0, v1
 424ed10: 6f00e401     	movi.2d	v1, #0000000000000000
 424ed14: 0ea16408     	smax.2s	v8, v0, v1
 424ed18: f9401e73     	ldr	x19, [x19, #0x38]
 424ed1c: 52800b00     	mov	w0, #0x58               ; =88
 424ed20: 96f70192     	bl	0xf368 <_ChromeMain+0xa0cc>
 424ed24: aa0003e3     	mov	x3, x0
 424ed28: 52800028     	mov	w8, #0x1                ; =1
 424ed2c: 10019d29     	adr	x9, 0x42520d0 <_ChromeMain+0x424ce34>
 424ed30: d503201f     	nop
 424ed34: b9000008     	str	w8, [x0]
 424ed38: 90ffef88     	adrp	x8, 0x403e000 <_ChromeMain+0x4038d64>
 424ed3c: 913a0108     	add	x8, x8, #0xe80
 424ed40: 90fff30a     	adrp	x10, 0x40ae000 <_ChromeMain+0x40a8d64>
 424ed44: 911b014a     	add	x10, x10, #0x6c0
 424ed48: a900a009     	stp	x9, x8, [x0, #0x8]
 424ed4c: 10004048     	adr	x8, 0x424f554 <_ChromeMain+0x424a2b8>
 424ed50: d503201f     	nop
 424ed54: a901a00a     	stp	x10, x8, [x0, #0x18]
 424ed58: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 424ed5c: f9001c13     	str	x19, [x0, #0x38]
 424ed60: 29086418     	stp	w24, w25, [x0, #0x40]
 424ed64: fd002408     	str	d8, [x0, #0x48]
 424ed68: b9005016     	str	w22, [x0, #0x50]
 424ed6c: 910183e0     	add	x0, sp, #0x60
 424ed70: aa1403e1     	mov	x1, x20
 424ed74: aa1503e2     	mov	x2, x21
 424ed78: 940070e2     	bl	0x426b100 <_ChromeMain+0x4265e64>
 424ed7c: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 424ed80: 36f800a8     	tbz	w8, #0x1f, 0x424ed94 <_ChromeMain+0x4249af8>
 424ed84: f94027e0     	ldr	x0, [sp, #0x48]
 424ed88: f9402fe8     	ldr	x8, [sp, #0x58]
 424ed8c: d37ff901     	lsl	x1, x8, #1
 424ed90: 96f6e84a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424ed94: f94033f3     	ldr	x19, [sp, #0x60]
 424ed98: f90033ff     	str	xzr, [sp, #0x60]
 424ed9c: b4ffd913     	cbz	x19, 0x424e8bc <_ChromeMain+0x4249620>
 424eda0: aa1303e0     	mov	x0, x19
 424eda4: 951074dd     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 424eda8: aa1303e0     	mov	x0, x19
 424edac: 52800101     	mov	w1, #0x8                ; =8
 424edb0: 96f6e842     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424edb4: 17fffec2     	b	0x424e8bc <_ChromeMain+0x4249620>
 424edb8: d4200020     	brk	#0x1
 424edbc: d4200000     	brk	#0
 424edc0: d4400000     	hlt	#0
 424edc4: d4200020     	brk	#0x1
 424edc8: d100c3ff     	sub	sp, sp, #0x30
 424edcc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 424edd0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 424edd4: 910083fd     	add	x29, sp, #0x20
 424edd8: f9400428     	ldr	x8, [x1, #0x8]
 424eddc: b40000a8     	cbz	x8, 0x424edf0 <_ChromeMain+0x4249b54>
 424ede0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424ede4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 424ede8: 9100c3ff     	add	sp, sp, #0x30
 424edec: d65f03c0     	ret
 424edf0: aa0003f3     	mov	x19, x0
 424edf4: f9401008     	ldr	x8, [x0, #0x20]
 424edf8: b4ffff48     	cbz	x8, 0x424ede0 <_ChromeMain+0x4249b44>
 424edfc: f9400660     	ldr	x0, [x19, #0x8]
 424ee00: 910003e8     	mov	x8, sp
 424ee04: 94000199     	bl	0x424f468 <_ChromeMain+0x424a1cc>
 424ee08: f9401a74     	ldr	x20, [x19, #0x30]
 424ee0c: b40000d4     	cbz	x20, 0x424ee24 <_ChromeMain+0x4249b88>
 424ee10: 52800028     	mov	w8, #0x1                ; =1
 424ee14: b8280288     	ldadd	w8, w8, [x20]
 424ee18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424ee1c: 6b09011f     	cmp	w8, w9
 424ee20: 540003c0     	b.eq	0x424ee98 <_ChromeMain+0x4249bfc>
 424ee24: f9401e73     	ldr	x19, [x19, #0x38]
 424ee28: 52800700     	mov	w0, #0x38               ; =56
 424ee2c: 96f7014f     	bl	0xf368 <_ChromeMain+0xa0cc>
 424ee30: aa0003e3     	mov	x3, x0
 424ee34: 52800028     	mov	w8, #0x1                ; =1
 424ee38: b9000008     	str	w8, [x0]
 424ee3c: 1001a428     	adr	x8, 0x42522c0 <_ChromeMain+0x424d024>
 424ee40: d503201f     	nop
 424ee44: 1001bf89     	adr	x9, 0x4252634 <_ChromeMain+0x424d398>
 424ee48: d503201f     	nop
 424ee4c: a900a408     	stp	x8, x9, [x0, #0x8]
 424ee50: f0ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 424ee54: 912c0108     	add	x8, x8, #0xb00
 424ee58: f9000c08     	str	x8, [x0, #0x18]
 424ee5c: a902cc14     	stp	x20, x19, [x0, #0x28]
 424ee60: 9004e961     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ee64: 910de021     	add	x1, x1, #0x378
 424ee68: 910003e0     	mov	x0, sp
 424ee6c: 528000c2     	mov	w2, #0x6                ; =6
 424ee70: 940070a4     	bl	0x426b100 <_ChromeMain+0x4265e64>
 424ee74: f94003f3     	ldr	x19, [sp]
 424ee78: f90003ff     	str	xzr, [sp]
 424ee7c: b4fffb33     	cbz	x19, 0x424ede0 <_ChromeMain+0x4249b44>
 424ee80: aa1303e0     	mov	x0, x19
 424ee84: 951074a5     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 424ee88: aa1303e0     	mov	x0, x19
 424ee8c: 52800101     	mov	w1, #0x8                ; =8
 424ee90: 96f6e80a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424ee94: 17ffffd3     	b	0x424ede0 <_ChromeMain+0x4249b44>
 424ee98: d4200000     	brk	#0
 424ee9c: d4400000     	hlt	#0
 424eea0: d4200020     	brk	#0x1
 424eea4: d100c3ff     	sub	sp, sp, #0x30
 424eea8: a9014ff4     	stp	x20, x19, [sp, #0x10]
 424eeac: a9027bfd     	stp	x29, x30, [sp, #0x20]
 424eeb0: 910083fd     	add	x29, sp, #0x20
 424eeb4: f9400428     	ldr	x8, [x1, #0x8]
 424eeb8: b5000508     	cbnz	x8, 0x424ef58 <_ChromeMain+0x4249cbc>
 424eebc: aa0003f3     	mov	x19, x0
 424eec0: f9400400     	ldr	x0, [x0, #0x8]
 424eec4: 910003e8     	mov	x8, sp
 424eec8: 94000168     	bl	0x424f468 <_ChromeMain+0x424a1cc>
 424eecc: f9401a74     	ldr	x20, [x19, #0x30]
 424eed0: b40000d4     	cbz	x20, 0x424eee8 <_ChromeMain+0x4249c4c>
 424eed4: 52800028     	mov	w8, #0x1                ; =1
 424eed8: b8280288     	ldadd	w8, w8, [x20]
 424eedc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424eee0: 6b09011f     	cmp	w8, w9
 424eee4: 54000420     	b.eq	0x424ef68 <_ChromeMain+0x4249ccc>
 424eee8: f9401e73     	ldr	x19, [x19, #0x38]
 424eeec: 52800700     	mov	w0, #0x38               ; =56
 424eef0: 96f7011e     	bl	0xf368 <_ChromeMain+0xa0cc>
 424eef4: aa0003e3     	mov	x3, x0
 424eef8: 52800028     	mov	w8, #0x1                ; =1
 424eefc: b9000008     	str	w8, [x0]
 424ef00: 1001be08     	adr	x8, 0x42526c0 <_ChromeMain+0x424d424>
 424ef04: d503201f     	nop
 424ef08: b0ffef49     	adrp	x9, 0x4037000 <_ChromeMain+0x4031d64>
 424ef0c: 91130129     	add	x9, x9, #0x4c0
 424ef10: a900a408     	stp	x8, x9, [x0, #0x8]
 424ef14: f0ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 424ef18: 912c0108     	add	x8, x8, #0xb00
 424ef1c: f9000c08     	str	x8, [x0, #0x18]
 424ef20: a902cc14     	stp	x20, x19, [x0, #0x28]
 424ef24: 9004e961     	adrp	x1, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 424ef28: 910e1821     	add	x1, x1, #0x386
 424ef2c: 910003e0     	mov	x0, sp
 424ef30: 528000e2     	mov	w2, #0x7                ; =7
 424ef34: 94007073     	bl	0x426b100 <_ChromeMain+0x4265e64>
 424ef38: f94003f3     	ldr	x19, [sp]
 424ef3c: f90003ff     	str	xzr, [sp]
 424ef40: b40000d3     	cbz	x19, 0x424ef58 <_ChromeMain+0x4249cbc>
 424ef44: aa1303e0     	mov	x0, x19
 424ef48: 95107474     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 424ef4c: aa1303e0     	mov	x0, x19
 424ef50: 52800101     	mov	w1, #0x8                ; =8
 424ef54: 96f6e7d9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424ef58: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424ef5c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 424ef60: 9100c3ff     	add	sp, sp, #0x30
 424ef64: d65f03c0     	ret
 424ef68: d4200000     	brk	#0
 424ef6c: d4400000     	hlt	#0
 424ef70: d4200020     	brk	#0x1
 424ef74: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 424ef78: a90157f6     	stp	x22, x21, [sp, #0x10]
 424ef7c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 424ef80: a9037bfd     	stp	x29, x30, [sp, #0x30]
 424ef84: 9100c3fd     	add	x29, sp, #0x30
 424ef88: 39805c08     	ldrsb	x8, [x0, #0x17]
 424ef8c: a9402809     	ldp	x9, x10, [x0]
 424ef90: f100011f     	cmp	x8, #0x0
 424ef94: 9a804133     	csel	x19, x9, x0, mi
 424ef98: 7100011f     	cmp	w8, #0x0
 424ef9c: 9a884154     	csel	x20, x10, x8, mi
 424efa0: b40002b4     	cbz	x20, 0x424eff4 <_ChromeMain+0x4249d58>
 424efa4: d2800016     	mov	x22, #0x0               ; =0
 424efa8: b0053117     	adrp	x23, 0xe86f000 <dyld_stub_binder+0xe86f000>
 424efac: 910542f7     	add	x23, x23, #0x150
 424efb0: 14000006     	b	0x424efc8 <_ChromeMain+0x4249d2c>
 424efb4: 52800000     	mov	w0, #0x0                ; =0
 424efb8: 14000010     	b	0x424eff8 <_ChromeMain+0x4249d5c>
 424efbc: 910082d6     	add	x22, x22, #0x20
 424efc0: f10602df     	cmp	x22, #0x180
 424efc4: 54ffff80     	b.eq	0x424efb4 <_ChromeMain+0x4249d18>
 424efc8: f8766af5     	ldr	x21, [x23, x22]
 424efcc: b4000215     	cbz	x21, 0x424f00c <_ChromeMain+0x4249d70>
 424efd0: aa1503e0     	mov	x0, x21
 424efd4: 94f6d0f2     	bl	0x800339c <_ChromeMain+0x7ffe100>
 424efd8: eb00029f     	cmp	x20, x0
 424efdc: 54ffff01     	b.ne	0x424efbc <_ChromeMain+0x4249d20>
 424efe0: aa1303e0     	mov	x0, x19
 424efe4: aa1503e1     	mov	x1, x21
 424efe8: aa1403e2     	mov	x2, x20
 424efec: 94f6ea1d     	bl	0x8009860 <_ChromeMain+0x80045c4>
 424eff0: 35fffe60     	cbnz	w0, 0x424efbc <_ChromeMain+0x4249d20>
 424eff4: 52800020     	mov	w0, #0x1                ; =1
 424eff8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 424effc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 424f000: a94157f6     	ldp	x22, x21, [sp, #0x10]
 424f004: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 424f008: d65f03c0     	ret
 424f00c: d4200020     	brk	#0x1
		...
 424f040: d101c3ff     	sub	sp, sp, #0x70
 424f044: a90267fa     	stp	x26, x25, [sp, #0x20]
 424f048: a9035ff8     	stp	x24, x23, [sp, #0x30]
 424f04c: a90457f6     	stp	x22, x21, [sp, #0x40]
 424f050: a9054ff4     	stp	x20, x19, [sp, #0x50]
 424f054: a9067bfd     	stp	x29, x30, [sp, #0x60]
 424f058: 910183fd     	add	x29, sp, #0x60
 424f05c: aa0203f3     	mov	x19, x2
 424f060: aa0003f4     	mov	x20, x0
 424f064: 39805c28     	ldrsb	x8, [x1, #0x17]
 424f068: a9402829     	ldp	x9, x10, [x1]
 424f06c: f100011f     	cmp	x8, #0x0
 424f070: 9a814135     	csel	x21, x9, x1, mi
 424f074: 7100011f     	cmp	w8, #0x0
 424f078: 9a884156     	csel	x22, x10, x8, mi
 424f07c: b4000596     	cbz	x22, 0x424f12c <_ChromeMain+0x4249e90>
 424f080: 90053118     	adrp	x24, 0xe86f000 <dyld_stub_binder+0xe86f000>
 424f084: 91056318     	add	x24, x24, #0x158
 424f088: 52803019     	mov	w25, #0x180             ; =384
 424f08c: 14000004     	b	0x424f09c <_ChromeMain+0x4249e00>
 424f090: 91008318     	add	x24, x24, #0x20
 424f094: f1008339     	subs	x25, x25, #0x20
 424f098: 540001c0     	b.eq	0x424f0d0 <_ChromeMain+0x4249e34>
 424f09c: f85f8317     	ldur	x23, [x24, #-0x8]
 424f0a0: b4000457     	cbz	x23, 0x424f128 <_ChromeMain+0x4249e8c>
 424f0a4: aa1703e0     	mov	x0, x23
 424f0a8: 94f6d0bd     	bl	0x800339c <_ChromeMain+0x7ffe100>
 424f0ac: eb0002df     	cmp	x22, x0
 424f0b0: 54ffff01     	b.ne	0x424f090 <_ChromeMain+0x4249df4>
 424f0b4: aa1503e0     	mov	x0, x21
 424f0b8: aa1703e1     	mov	x1, x23
 424f0bc: aa1603e2     	mov	x2, x22
 424f0c0: 94f6e9e8     	bl	0x8009860 <_ChromeMain+0x80045c4>
 424f0c4: 35fffe60     	cbnz	w0, 0x424f090 <_ChromeMain+0x4249df4>
 424f0c8: b9400316     	ldr	w22, [x24]
 424f0cc: 14000019     	b	0x424f130 <_ChromeMain+0x4249e94>
 424f0d0: f90003ff     	str	xzr, [sp]
 424f0d4: b4000993     	cbz	x19, 0x424f204 <_ChromeMain+0x4249f68>
 424f0d8: f9400668     	ldr	x8, [x19, #0x8]
 424f0dc: 910003e1     	mov	x1, sp
 424f0e0: aa1303e0     	mov	x0, x19
 424f0e4: d63f0100     	blr	x8
 424f0e8: 12800008     	mov	w8, #-0x1               ; =-1
 424f0ec: b8e80268     	ldaddal	w8, w8, [x19]
 424f0f0: 7100051f     	cmp	w8, #0x1
 424f0f4: 54000081     	b.ne	0x424f104 <_ChromeMain+0x4249e68>
 424f0f8: f9400a68     	ldr	x8, [x19, #0x10]
 424f0fc: aa1303e0     	mov	x0, x19
 424f100: d63f0100     	blr	x8
 424f104: f94003e0     	ldr	x0, [sp]
 424f108: b5000840     	cbnz	x0, 0x424f210 <_ChromeMain+0x4249f74>
 424f10c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 424f110: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 424f114: a94457f6     	ldp	x22, x21, [sp, #0x40]
 424f118: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 424f11c: a94267fa     	ldp	x26, x25, [sp, #0x20]
 424f120: 9101c3ff     	add	sp, sp, #0x70
 424f124: d65f03c0     	ret
 424f128: d4200020     	brk	#0x1
 424f12c: 52876496     	mov	w22, #0x3b24            ; =15140
 424f130: 9004c680     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f134: 9105f400     	add	x0, x0, #0x17d
 424f138: 9004c681     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f13c: 91043821     	add	x1, x1, #0x10e
 424f140: 910003e8     	mov	x8, sp
 424f144: 52802b42     	mov	w2, #0x15a              ; =346
 424f148: 96f806ce     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 424f14c: 52800900     	mov	w0, #0x48               ; =72
 424f150: 96f70086     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f154: aa0003f5     	mov	x21, x0
 424f158: 52800028     	mov	w8, #0x1                ; =1
 424f15c: b0ff6d29     	adrp	x9, 0x2ff4000 <_ChromeMain+0x2feed64>
 424f160: 91133129     	add	x9, x9, #0x4cc
 424f164: b9000008     	str	w8, [x0]
 424f168: f0ffeac8     	adrp	x8, 0x3faa000 <_ChromeMain+0x3fa4d64>
 424f16c: 91068108     	add	x8, x8, #0x1a0
 424f170: d0ff1877     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 424f174: 912c02f7     	add	x23, x23, #0xb00
 424f178: a900a009     	stp	x9, x8, [x0, #0x8]
 424f17c: 10005e28     	adr	x8, 0x424fd40 <_ChromeMain+0x424aaa4>
 424f180: d503201f     	nop
 424f184: a901a017     	stp	x23, x8, [x0, #0x18]
 424f188: 39c05e88     	ldrsb	w8, [x20, #0x17]
 424f18c: 37f80348     	tbnz	w8, #0x1f, 0x424f1f4 <_ChromeMain+0x4249f58>
 424f190: 3dc00280     	ldr	q0, [x20]
 424f194: 3c8282a0     	stur	q0, [x21, #0x28]
 424f198: f9400a88     	ldr	x8, [x20, #0x10]
 424f19c: f80382a8     	stur	x8, [x21, #0x38]
 424f1a0: b90042b6     	str	w22, [x21, #0x40]
 424f1a4: 52800600     	mov	w0, #0x30               ; =48
 424f1a8: 96f70070     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f1ac: aa0003e3     	mov	x3, x0
 424f1b0: 52800028     	mov	w8, #0x1                ; =1
 424f1b4: b9000008     	str	w8, [x0]
 424f1b8: d0ff7c68     	adrp	x8, 0x31dd000 <_ChromeMain+0x31d7d64>
 424f1bc: 910b1108     	add	x8, x8, #0x2c4
 424f1c0: f0ffe909     	adrp	x9, 0x3f72000 <_ChromeMain+0x3f6cd64>
 424f1c4: 91250129     	add	x9, x9, #0x940
 424f1c8: a900a408     	stp	x8, x9, [x0, #0x8]
 424f1cc: 100073a8     	adr	x8, 0x4250040 <_ChromeMain+0x424ada4>
 424f1d0: d503201f     	nop
 424f1d4: a901a017     	stp	x23, x8, [x0, #0x18]
 424f1d8: f9001413     	str	x19, [x0, #0x28]
 424f1dc: b00465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 424f1e0: 9100e821     	add	x1, x1, #0x3a
 424f1e4: 910003e0     	mov	x0, sp
 424f1e8: aa1503e2     	mov	x2, x21
 424f1ec: 94d593e2     	bl	0x77b4174 <_ChromeMain+0x77aeed8>
 424f1f0: 17ffffc7     	b	0x424f10c <_ChromeMain+0x4249e70>
 424f1f4: a9400a81     	ldp	x1, x2, [x20]
 424f1f8: 9100a2a0     	add	x0, x21, #0x28
 424f1fc: 96f72407     	bl	0x18218 <_ChromeMain+0x12f7c>
 424f200: 17ffffe8     	b	0x424f1a0 <_ChromeMain+0x4249f04>
 424f204: d4200000     	brk	#0
 424f208: d4400000     	hlt	#0
 424f20c: d4200020     	brk	#0x1
 424f210: 91002008     	add	x8, x0, #0x8
 424f214: 12800009     	mov	w9, #-0x1               ; =-1
 424f218: b8e90108     	ldaddal	w9, w8, [x8]
 424f21c: 7100051f     	cmp	w8, #0x1
 424f220: 54fff761     	b.ne	0x424f10c <_ChromeMain+0x4249e70>
 424f224: f9400008     	ldr	x8, [x0]
 424f228: f9400508     	ldr	x8, [x8, #0x8]
 424f22c: d63f0100     	blr	x8
 424f230: 17ffffb7     	b	0x424f10c <_ChromeMain+0x4249e70>
 424f234: 00000000     	udf	#0x0
 424f238: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 424f23c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 424f240: 910043fd     	add	x29, sp, #0x10
 424f244: aa0003f3     	mov	x19, x0
 424f248: f00500a8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 424f24c: 912f4108     	add	x8, x8, #0xbd0
 424f250: f9000008     	str	x8, [x0]
 424f254: f9001c1f     	str	xzr, [x0, #0x38]
 424f258: f9401808     	ldr	x8, [x0, #0x30]
 424f25c: b4000168     	cbz	x8, 0x424f288 <_ChromeMain+0x4249fec>
 424f260: 52800029     	mov	w9, #0x1                ; =1
 424f264: 19004109     	stlurb	w9, [x8, #0x4]
 424f268: f9401a60     	ldr	x0, [x19, #0x30]
 424f26c: b40000e0     	cbz	x0, 0x424f288 <_ChromeMain+0x4249fec>
 424f270: 12800008     	mov	w8, #-0x1               ; =-1
 424f274: b8e80008     	ldaddal	w8, w8, [x0]
 424f278: 7100051f     	cmp	w8, #0x1
 424f27c: 54000061     	b.ne	0x424f288 <_ChromeMain+0x4249fec>
 424f280: 52800101     	mov	w1, #0x8                ; =8
 424f284: 96f6e70d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f288: f9401260     	ldr	x0, [x19, #0x20]
 424f28c: f900127f     	str	xzr, [x19, #0x20]
 424f290: b4000080     	cbz	x0, 0x424f2a0 <_ChromeMain+0x424a004>
 424f294: 940009e4     	bl	0x4251a24 <_ChromeMain+0x424c788>
 424f298: 52801401     	mov	w1, #0xa0               ; =160
 424f29c: 96f6e707     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2a0: f9400e60     	ldr	x0, [x19, #0x18]
 424f2a4: f9000e7f     	str	xzr, [x19, #0x18]
 424f2a8: b4000080     	cbz	x0, 0x424f2b8 <_ChromeMain+0x424a01c>
 424f2ac: 94004e82     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 424f2b0: 52801801     	mov	w1, #0xc0               ; =192
 424f2b4: 96f6e701     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2b8: f9400a60     	ldr	x0, [x19, #0x10]
 424f2bc: f9000a7f     	str	xzr, [x19, #0x10]
 424f2c0: b4000080     	cbz	x0, 0x424f2d0 <_ChromeMain+0x424a034>
 424f2c4: 94000f30     	bl	0x4252f84 <_ChromeMain+0x424dce8>
 424f2c8: 52801201     	mov	w1, #0x90               ; =144
 424f2cc: 96f6e6fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f2d0: b004f1c8     	adrp	x8, 0xe088000 <dyld_stub_binder+0xe088000>
 424f2d4: 91100108     	add	x8, x8, #0x400
 424f2d8: f9000268     	str	x8, [x19]
 424f2dc: f9400668     	ldr	x8, [x19, #0x8]
 424f2e0: f9403509     	ldr	x9, [x8, #0x68]
 424f2e4: b4000149     	cbz	x9, 0x424f30c <_ChromeMain+0x424a070>
 424f2e8: 19404129     	ldapurb	w9, [x9, #0x4]
 424f2ec: 35000109     	cbnz	w9, 0x424f30c <_ChromeMain+0x424a070>
 424f2f0: f9403914     	ldr	x20, [x8, #0x70]
 424f2f4: b40000d4     	cbz	x20, 0x424f30c <_ChromeMain+0x424a070>
 424f2f8: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f2fc: 91050021     	add	x1, x1, #0x140
 424f300: aa1403e0     	mov	x0, x20
 424f304: 971ca843     	bl	0x979410 <_ChromeMain+0x974174>
 424f308: b50001a0     	cbnz	x0, 0x424f33c <_ChromeMain+0x424a0a0>
 424f30c: f9400660     	ldr	x0, [x19, #0x8]
 424f310: 925e7408     	and	x8, x0, #0xfffffffc00000000
 424f314: f0054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 424f318: f9404529     	ldr	x9, [x9, #0x88]
 424f31c: eb09011f     	cmp	x8, x9
 424f320: 54000041     	b.ne	0x424f328 <_ChromeMain+0x424a08c>
 424f324: 96f74dc6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 424f328: f900067f     	str	xzr, [x19, #0x8]
 424f32c: aa1303e0     	mov	x0, x19
 424f330: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 424f334: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 424f338: d65f03c0     	ret
 424f33c: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f340: 91050021     	add	x1, x1, #0x140
 424f344: aa1403e0     	mov	x0, x20
 424f348: 97da124d     	bl	0x38d3c7c <_ChromeMain+0x38ce9e0>
 424f34c: 17fffff0     	b	0x424f30c <_ChromeMain+0x424a070>
 424f350: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 424f354: a9017bfd     	stp	x29, x30, [sp, #0x10]
 424f358: 910043fd     	add	x29, sp, #0x10
 424f35c: aa0003f3     	mov	x19, x0
 424f360: f00500a8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 424f364: 912f4108     	add	x8, x8, #0xbd0
 424f368: f9000008     	str	x8, [x0]
 424f36c: f9001c1f     	str	xzr, [x0, #0x38]
 424f370: f9401808     	ldr	x8, [x0, #0x30]
 424f374: b4000168     	cbz	x8, 0x424f3a0 <_ChromeMain+0x424a104>
 424f378: 52800029     	mov	w9, #0x1                ; =1
 424f37c: 19004109     	stlurb	w9, [x8, #0x4]
 424f380: f9401a60     	ldr	x0, [x19, #0x30]
 424f384: b40000e0     	cbz	x0, 0x424f3a0 <_ChromeMain+0x424a104>
 424f388: 12800008     	mov	w8, #-0x1               ; =-1
 424f38c: b8e80008     	ldaddal	w8, w8, [x0]
 424f390: 7100051f     	cmp	w8, #0x1
 424f394: 54000061     	b.ne	0x424f3a0 <_ChromeMain+0x424a104>
 424f398: 52800101     	mov	w1, #0x8                ; =8
 424f39c: 96f6e6c7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f3a0: f9401260     	ldr	x0, [x19, #0x20]
 424f3a4: f900127f     	str	xzr, [x19, #0x20]
 424f3a8: b4000080     	cbz	x0, 0x424f3b8 <_ChromeMain+0x424a11c>
 424f3ac: 9400099e     	bl	0x4251a24 <_ChromeMain+0x424c788>
 424f3b0: 52801401     	mov	w1, #0xa0               ; =160
 424f3b4: 96f6e6c1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f3b8: f9400e60     	ldr	x0, [x19, #0x18]
 424f3bc: f9000e7f     	str	xzr, [x19, #0x18]
 424f3c0: b4000080     	cbz	x0, 0x424f3d0 <_ChromeMain+0x424a134>
 424f3c4: 94004e3c     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 424f3c8: 52801801     	mov	w1, #0xc0               ; =192
 424f3cc: 96f6e6bb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f3d0: f9400a60     	ldr	x0, [x19, #0x10]
 424f3d4: f9000a7f     	str	xzr, [x19, #0x10]
 424f3d8: b4000080     	cbz	x0, 0x424f3e8 <_ChromeMain+0x424a14c>
 424f3dc: 94000eea     	bl	0x4252f84 <_ChromeMain+0x424dce8>
 424f3e0: 52801201     	mov	w1, #0x90               ; =144
 424f3e4: 96f6e6b5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f3e8: b004f1c8     	adrp	x8, 0xe088000 <dyld_stub_binder+0xe088000>
 424f3ec: 91100108     	add	x8, x8, #0x400
 424f3f0: f9000268     	str	x8, [x19]
 424f3f4: f9400668     	ldr	x8, [x19, #0x8]
 424f3f8: f9403509     	ldr	x9, [x8, #0x68]
 424f3fc: b4000149     	cbz	x9, 0x424f424 <_ChromeMain+0x424a188>
 424f400: 19404129     	ldapurb	w9, [x9, #0x4]
 424f404: 35000109     	cbnz	w9, 0x424f424 <_ChromeMain+0x424a188>
 424f408: f9403914     	ldr	x20, [x8, #0x70]
 424f40c: b40000d4     	cbz	x20, 0x424f424 <_ChromeMain+0x424a188>
 424f410: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f414: 91050021     	add	x1, x1, #0x140
 424f418: aa1403e0     	mov	x0, x20
 424f41c: 971ca7fd     	bl	0x979410 <_ChromeMain+0x974174>
 424f420: b50001a0     	cbnz	x0, 0x424f454 <_ChromeMain+0x424a1b8>
 424f424: f9400660     	ldr	x0, [x19, #0x8]
 424f428: 925e7408     	and	x8, x0, #0xfffffffc00000000
 424f42c: f0054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 424f430: f9404529     	ldr	x9, [x9, #0x88]
 424f434: eb09011f     	cmp	x8, x9
 424f438: 54000041     	b.ne	0x424f440 <_ChromeMain+0x424a1a4>
 424f43c: 96f74d80     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 424f440: aa1303e0     	mov	x0, x19
 424f444: 52800801     	mov	w1, #0x40               ; =64
 424f448: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 424f44c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 424f450: 16f6e69a     	b	0x8eb8 <_ChromeMain+0x3c1c>
 424f454: 90045a61     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 424f458: 91050021     	add	x1, x1, #0x140
 424f45c: aa1403e0     	mov	x0, x20
 424f460: 97da1207     	bl	0x38d3c7c <_ChromeMain+0x38ce9e0>
 424f464: 17fffff0     	b	0x424f424 <_ChromeMain+0x424a188>
 424f468: d10143ff     	sub	sp, sp, #0x50
 424f46c: a90257f6     	stp	x22, x21, [sp, #0x20]
 424f470: a9034ff4     	stp	x20, x19, [sp, #0x30]
 424f474: a9047bfd     	stp	x29, x30, [sp, #0x40]
 424f478: 910103fd     	add	x29, sp, #0x40
 424f47c: aa0803f3     	mov	x19, x8
 424f480: b4000580     	cbz	x0, 0x424f530 <_ChromeMain+0x424a294>
 424f484: f9403000     	ldr	x0, [x0, #0x60]
 424f488: b4000540     	cbz	x0, 0x424f530 <_ChromeMain+0x424a294>
 424f48c: f00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 424f490: f9467d08     	ldr	x8, [x8, #0xcf8]
 424f494: f9414908     	ldr	x8, [x8, #0x290]
 424f498: f9400514     	ldr	x20, [x8, #0x8]
 424f49c: 970d4416     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 424f4a0: b4000480     	cbz	x0, 0x424f530 <_ChromeMain+0x424a294>
 424f4a4: f9402808     	ldr	x8, [x0, #0x50]
 424f4a8: b5000068     	cbnz	x8, 0x424f4b4 <_ChromeMain+0x424a218>
 424f4ac: f9402409     	ldr	x9, [x0, #0x48]
 424f4b0: b4000409     	cbz	x9, 0x424f530 <_ChromeMain+0x424a294>
 424f4b4: 52800a09     	mov	w9, #0x50               ; =80
 424f4b8: 5280090a     	mov	w10, #0x48              ; =72
 424f4bc: f100011f     	cmp	x8, #0x0
 424f4c0: 9a890148     	csel	x8, x10, x9, eq
 424f4c4: f8686808     	ldr	x8, [x0, x8]
 424f4c8: f9400908     	ldr	x8, [x8, #0x10]
 424f4cc: f9400515     	ldr	x21, [x8, #0x8]
 424f4d0: b4000315     	cbz	x21, 0x424f530 <_ChromeMain+0x424a294>
 424f4d4: 9100a2a8     	add	x8, x21, #0x28
 424f4d8: 39007fff     	strb	wzr, [sp, #0x1f]
 424f4dc: 91007fe9     	add	x9, sp, #0x1f
 424f4e0: a900a3e9     	stp	x9, x8, [sp, #0x8]
 424f4e4: d0fe5b02     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 424f4e8: 912dc042     	add	x2, x2, #0xb70
 424f4ec: 910023e1     	add	x1, sp, #0x8
 424f4f0: aa1403e0     	mov	x0, x20
 424f4f4: 52800003     	mov	w3, #0x0                ; =0
 424f4f8: 52800004     	mov	w4, #0x0                ; =0
 424f4fc: 972d88dd     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 424f500: 39407fe8     	ldrb	w8, [sp, #0x1f]
 424f504: 34000168     	cbz	w8, 0x424f530 <_ChromeMain+0x424a294>
 424f508: f9403ea0     	ldr	x0, [x21, #0x78]
 424f50c: b4000120     	cbz	x0, 0x424f530 <_ChromeMain+0x424a294>
 424f510: f9400008     	ldr	x8, [x0]
 424f514: f9401101     	ldr	x1, [x8, #0x20]
 424f518: aa1303e8     	mov	x8, x19
 424f51c: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 424f520: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 424f524: a94257f6     	ldp	x22, x21, [sp, #0x20]
 424f528: 910143ff     	add	sp, sp, #0x50
 424f52c: d61f0020     	br	x1
 424f530: 52800100     	mov	w0, #0x8                ; =8
 424f534: 96f6ff8d     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f538: f900001f     	str	xzr, [x0]
 424f53c: a9007e60     	stp	x0, xzr, [x19]
 424f540: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 424f544: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 424f548: a94257f6     	ldp	x22, x21, [sp, #0x20]
 424f54c: 910143ff     	add	sp, sp, #0x50
 424f550: d65f03c0     	ret
 424f554: d101c3ff     	sub	sp, sp, #0x70
 424f558: a90267fa     	stp	x26, x25, [sp, #0x20]
 424f55c: a9035ff8     	stp	x24, x23, [sp, #0x30]
 424f560: a90457f6     	stp	x22, x21, [sp, #0x40]
 424f564: a9054ff4     	stp	x20, x19, [sp, #0x50]
 424f568: a9067bfd     	stp	x29, x30, [sp, #0x60]
 424f56c: 910183fd     	add	x29, sp, #0x60
 424f570: b6000c43     	tbz	x3, #0x20, 0x424f6f8 <_ChromeMain+0x424a45c>
 424f574: aa0203f5     	mov	x21, x2
 424f578: aa0103f6     	mov	x22, x1
 424f57c: aa0003f4     	mov	x20, x0
 424f580: b9002803     	str	w3, [x0, #0x28]
 424f584: 9004c680     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f588: 9103bc00     	add	x0, x0, #0xef
 424f58c: 9004c681     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f590: 91043821     	add	x1, x1, #0x10e
 424f594: 910003e8     	mov	x8, sp
 424f598: 528074c2     	mov	w2, #0x3a6              ; =934
 424f59c: 96f805b9     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 424f5a0: 52800600     	mov	w0, #0x30               ; =48
 424f5a4: 96f6ff71     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f5a8: aa0003f3     	mov	x19, x0
 424f5ac: 52800038     	mov	w24, #0x1               ; =1
 424f5b0: b9000018     	str	w24, [x0]
 424f5b4: d0ffa228     	adrp	x8, 0x3695000 <_ChromeMain+0x368fd64>
 424f5b8: 912f6108     	add	x8, x8, #0xbd8
 424f5bc: f0fedee9     	adrp	x9, 0x1e2e000 <_ChromeMain+0x1e28d64>
 424f5c0: 913c0129     	add	x9, x9, #0xf00
 424f5c4: a900a408     	stp	x8, x9, [x0, #0x8]
 424f5c8: d0ff1877     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 424f5cc: 912c02f7     	add	x23, x23, #0xb00
 424f5d0: 100bc2a8     	adr	x8, 0x4266e24 <_ChromeMain+0x4261b88>
 424f5d4: d503201f     	nop
 424f5d8: a901a017     	stp	x23, x8, [x0, #0x18]
 424f5dc: b9002815     	str	w21, [x0, #0x28]
 424f5e0: f9401a99     	ldr	x25, [x20, #0x30]
 424f5e4: b40000b9     	cbz	x25, 0x424f5f8 <_ChromeMain+0x424a35c>
 424f5e8: b8380328     	ldadd	w24, w8, [x25]
 424f5ec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424f5f0: 6b09011f     	cmp	w8, w9
 424f5f4: 54000900     	b.eq	0x424f714 <_ChromeMain+0x424a478>
 424f5f8: f9401e9a     	ldr	x26, [x20, #0x38]
 424f5fc: 52800b00     	mov	w0, #0x58               ; =88
 424f600: 96f6ff5a     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f604: aa0003f4     	mov	x20, x0
 424f608: b9000018     	str	w24, [x0]
 424f60c: 100159a8     	adr	x8, 0x4252140 <_ChromeMain+0x424cea4>
 424f610: d503201f     	nop
 424f614: f0ffef69     	adrp	x9, 0x403e000 <_ChromeMain+0x4038d64>
 424f618: 913a0129     	add	x9, x9, #0xe80
 424f61c: a900a408     	stp	x8, x9, [x0, #0x8]
 424f620: 10016168     	adr	x8, 0x425224c <_ChromeMain+0x424cfb0>
 424f624: d503201f     	nop
 424f628: 100007c9     	adr	x9, 0x424f720 <_ChromeMain+0x424a484>
 424f62c: d503201f     	nop
 424f630: a901a408     	stp	x8, x9, [x0, #0x18]
 424f634: a902e41f     	stp	xzr, x25, [x0, #0x28]
 424f638: f9001c1a     	str	x26, [x0, #0x38]
 424f63c: 3dc002c0     	ldr	q0, [x22]
 424f640: 3d801000     	str	q0, [x0, #0x40]
 424f644: b9005015     	str	w21, [x0, #0x50]
 424f648: 52800100     	mov	w0, #0x8                ; =8
 424f64c: 96f6ff47     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f650: aa0003f5     	mov	x21, x0
 424f654: f900001f     	str	xzr, [x0]
 424f658: 52800700     	mov	w0, #0x38               ; =56
 424f65c: 96f6ff43     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f660: aa0003f6     	mov	x22, x0
 424f664: d0fea2a8     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 424f668: 91190108     	add	x8, x8, #0x640
 424f66c: d0ffeac9     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 424f670: 91290129     	add	x9, x9, #0xa40
 424f674: b9000018     	str	w24, [x0]
 424f678: a900a408     	stp	x8, x9, [x0, #0x8]
 424f67c: 1001a4a8     	adr	x8, 0x4252b10 <_ChromeMain+0x424d874>
 424f680: d503201f     	nop
 424f684: a901a017     	stp	x23, x8, [x0, #0x18]
 424f688: f9001413     	str	x19, [x0, #0x28]
 424f68c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 424f690: f0054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 424f694: f9404529     	ldr	x9, [x9, #0x88]
 424f698: eb09011f     	cmp	x8, x9
 424f69c: 54000061     	b.ne	0x424f6a8 <_ChromeMain+0x424a40c>
 424f6a0: aa1503e0     	mov	x0, x21
 424f6a4: 96f71316     	bl	0x142fc <_ChromeMain+0xf060>
 424f6a8: f9001ad5     	str	x21, [x22, #0x30]
 424f6ac: 52800700     	mov	w0, #0x38               ; =56
 424f6b0: 96f6ff2e     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f6b4: aa0003e3     	mov	x3, x0
 424f6b8: 52800028     	mov	w8, #0x1                ; =1
 424f6bc: b9000008     	str	w8, [x0]
 424f6c0: d0feaba8     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 424f6c4: 91380108     	add	x8, x8, #0xe00
 424f6c8: 1001b5c9     	adr	x9, 0x4252d80 <_ChromeMain+0x424dae4>
 424f6cc: d503201f     	nop
 424f6d0: a900a408     	stp	x8, x9, [x0, #0x8]
 424f6d4: 1001ae08     	adr	x8, 0x4252c94 <_ChromeMain+0x424d9f8>
 424f6d8: d503201f     	nop
 424f6dc: a901a017     	stp	x23, x8, [x0, #0x18]
 424f6e0: a902d414     	stp	x20, x21, [x0, #0x28]
 424f6e4: b00465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 424f6e8: 9100b021     	add	x1, x1, #0x2c
 424f6ec: 910003e0     	mov	x0, sp
 424f6f0: aa1603e2     	mov	x2, x22
 424f6f4: 97856da4     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 424f6f8: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 424f6fc: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 424f700: a94457f6     	ldp	x22, x21, [sp, #0x40]
 424f704: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 424f708: a94267fa     	ldp	x26, x25, [sp, #0x20]
 424f70c: 9101c3ff     	add	sp, sp, #0x70
 424f710: d65f03c0     	ret
 424f714: d4200000     	brk	#0
 424f718: d4400000     	hlt	#0
 424f71c: d4200020     	brk	#0x1
 424f720: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 424f724: a90157f6     	stp	x22, x21, [sp, #0x10]
 424f728: a9024ff4     	stp	x20, x19, [sp, #0x20]
 424f72c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 424f730: 9100c3fd     	add	x29, sp, #0x30
 424f734: f9400408     	ldr	x8, [x0, #0x8]
 424f738: f9403116     	ldr	x22, [x8, #0x60]
 424f73c: b40004d6     	cbz	x22, 0x424f7d4 <_ChromeMain+0x424a538>
 424f740: aa0303f3     	mov	x19, x3
 424f744: aa0203f4     	mov	x20, x2
 424f748: aa0103f5     	mov	x21, x1
 424f74c: f9401817     	ldr	x23, [x0, #0x30]
 424f750: b40000d7     	cbz	x23, 0x424f768 <_ChromeMain+0x424a4cc>
 424f754: 52800028     	mov	w8, #0x1                ; =1
 424f758: b82802e8     	ldadd	w8, w8, [x23]
 424f75c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424f760: 6b09011f     	cmp	w8, w9
 424f764: 54000420     	b.eq	0x424f7e8 <_ChromeMain+0x424a54c>
 424f768: f9401c18     	ldr	x24, [x0, #0x38]
 424f76c: 52800800     	mov	w0, #0x40               ; =64
 424f770: 96f6fefe     	bl	0xf368 <_ChromeMain+0xa0cc>
 424f774: aa0003e4     	mov	x4, x0
 424f778: 52800028     	mov	w8, #0x1                ; =1
 424f77c: b9000008     	str	w8, [x0]
 424f780: 10019608     	adr	x8, 0x4252a40 <_ChromeMain+0x424d7a4>
 424f784: d503201f     	nop
 424f788: b0ffe8e9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 424f78c: 912b0129     	add	x9, x9, #0xac0
 424f790: a900a408     	stp	x8, x9, [x0, #0x8]
 424f794: f0fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 424f798: 911b0108     	add	x8, x8, #0x6c0
 424f79c: b001f3e9     	adrp	x9, 0x80cc000 <_ChromeMain+0x80c6d64>
 424f7a0: 91136129     	add	x9, x9, #0x4d8
 424f7a4: a901a408     	stp	x8, x9, [x0, #0x18]
 424f7a8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 424f7ac: f9001c18     	str	x24, [x0, #0x38]
 424f7b0: aa1603e0     	mov	x0, x22
 424f7b4: aa1503e1     	mov	x1, x21
 424f7b8: aa1403e2     	mov	x2, x20
 424f7bc: aa1303e3     	mov	x3, x19
 424f7c0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 424f7c4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 424f7c8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 424f7cc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 424f7d0: 140061bc     	b	0x4267ec0 <_ChromeMain+0x4262c24>
 424f7d4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 424f7d8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 424f7dc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 424f7e0: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 424f7e4: d65f03c0     	ret
 424f7e8: d4200000     	brk	#0
 424f7ec: d4400000     	hlt	#0
 424f7f0: d4200020     	brk	#0x1
 424f7f4: d10303ff     	sub	sp, sp, #0xc0
 424f7f8: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 424f7fc: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 424f800: 9102c3fd     	add	x29, sp, #0xb0
 424f804: b004eec8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 424f808: f940f908     	ldr	x8, [x8, #0x1f0]
 424f80c: f9400108     	ldr	x8, [x8]
 424f810: f81e83a8     	stur	x8, [x29, #-0x18]
 424f814: 36000162     	tbz	w2, #0x0, 0x424f840 <_ChromeMain+0x424a5a4>
 424f818: f85e83a8     	ldur	x8, [x29, #-0x18]
 424f81c: b004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 424f820: f940f929     	ldr	x9, [x9, #0x1f0]
 424f824: f9400129     	ldr	x9, [x9]
 424f828: eb08013f     	cmp	x9, x8
 424f82c: 54000941     	b.ne	0x424f954 <_ChromeMain+0x424a6b8>
 424f830: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 424f834: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 424f838: 910303ff     	add	sp, sp, #0xc0
 424f83c: d65f03c0     	ret
 424f840: f9400413     	ldr	x19, [x0, #0x8]
 424f844: 9004c681     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f848: 91059c21     	add	x1, x1, #0x167
 424f84c: 9100a3e0     	add	x0, sp, #0x28
 424f850: 979c89a4     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 424f854: 910123e0     	add	x0, sp, #0x48
 424f858: 9100a3e1     	add	x1, sp, #0x28
 424f85c: 977940f5     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424f860: b00465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 424f864: 9100c821     	add	x1, x1, #0x32
 424f868: 910023e0     	add	x0, sp, #0x8
 424f86c: 979c899d     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 424f870: d10143a8     	sub	x8, x29, #0x50
 424f874: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 424f878: 3cc483e0     	ldur	q0, [sp, #0x48]
 424f87c: 3c9b03a0     	stur	q0, [x29, #-0x50]
 424f880: f9402fe9     	ldr	x9, [sp, #0x58]
 424f884: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 424f888: 91006100     	add	x0, x8, #0x18
 424f88c: 910023e1     	add	x1, sp, #0x8
 424f890: 977940e8     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424f894: f004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 424f898: 911e5021     	add	x1, x1, #0x794
 424f89c: d10143a3     	sub	x3, x29, #0x50
 424f8a0: aa1303e0     	mov	x0, x19
 424f8a4: 52800302     	mov	w2, #0x18               ; =24
 424f8a8: 52800044     	mov	w4, #0x2                ; =2
 424f8ac: 949d8baa     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 424f8b0: 394083e8     	ldrb	w8, [sp, #0x20]
 424f8b4: d0053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 424f8b8: 9121e273     	add	x19, x19, #0x878
 424f8bc: 7103fd1f     	cmp	w8, #0xff
 424f8c0: 54000060     	b.eq	0x424f8cc <_ChromeMain+0x424a630>
 424f8c4: 721e791f     	tst	w8, #0xfffffffd
 424f8c8: 540001a1     	b.ne	0x424f8fc <_ChromeMain+0x424a660>
 424f8cc: 394103e8     	ldrb	w8, [sp, #0x40]
 424f8d0: 7103fd1f     	cmp	w8, #0xff
 424f8d4: 54fffa20     	b.eq	0x424f818 <_ChromeMain+0x424a57c>
 424f8d8: 721e791f     	tst	w8, #0xfffffffd
 424f8dc: 54fff9e0     	b.eq	0x424f818 <_ChromeMain+0x424a57c>
 424f8e0: 7100111f     	cmp	w8, #0x4
 424f8e4: 54000200     	b.eq	0x424f924 <_ChromeMain+0x424a688>
 424f8e8: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424f8ec: d10143a0     	sub	x0, x29, #0x50
 424f8f0: 9100a3e1     	add	x1, sp, #0x28
 424f8f4: d63f0100     	blr	x8
 424f8f8: 17ffffc8     	b	0x424f818 <_ChromeMain+0x424a57c>
 424f8fc: 7100111f     	cmp	w8, #0x4
 424f900: 540000c0     	b.eq	0x424f918 <_ChromeMain+0x424a67c>
 424f904: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424f908: d10143a0     	sub	x0, x29, #0x50
 424f90c: 910023e1     	add	x1, sp, #0x8
 424f910: d63f0100     	blr	x8
 424f914: 17ffffee     	b	0x424f8cc <_ChromeMain+0x424a630>
 424f918: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 424f91c: 36fffd88     	tbz	w8, #0x1f, 0x424f8cc <_ChromeMain+0x424a630>
 424f920: 14000008     	b	0x424f940 <_ChromeMain+0x424a6a4>
 424f924: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 424f928: 36fff788     	tbz	w8, #0x1f, 0x424f818 <_ChromeMain+0x424a57c>
 424f92c: f94017e0     	ldr	x0, [sp, #0x28]
 424f930: f9401fe8     	ldr	x8, [sp, #0x38]
 424f934: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424f938: 96f6e560     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f93c: 17ffffb7     	b	0x424f818 <_ChromeMain+0x424a57c>
 424f940: f94007e0     	ldr	x0, [sp, #0x8]
 424f944: f9400fe8     	ldr	x8, [sp, #0x18]
 424f948: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424f94c: 96f6e55b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424f950: 17ffffdf     	b	0x424f8cc <_ChromeMain+0x424a630>
 424f954: 94f6d283     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 424f958: 71000c1f     	cmp	w0, #0x3
 424f95c: 5400024d     	b.le	0x424f9a4 <_ChromeMain+0x424a708>
 424f960: 7100141f     	cmp	w0, #0x5
 424f964: 540007ec     	b.gt	0x424fa60 <_ChromeMain+0x424a7c4>
 424f968: 7100101f     	cmp	w0, #0x4
 424f96c: 54000580     	b.eq	0x424fa1c <_ChromeMain+0x424a780>
 424f970: 7100141f     	cmp	w0, #0x5
 424f974: 54000701     	b.ne	0x424fa54 <_ChromeMain+0x424a7b8>
 424f978: 52800069     	mov	w9, #0x3                ; =3
 424f97c: 39005d09     	strb	w9, [x8, #0x17]
 424f980: 91000d09     	add	x9, x8, #0x3
 424f984: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f988: 9107c94a     	add	x10, x10, #0x1f2
 424f98c: eb0a013f     	cmp	x9, x10
 424f990: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424f994: 54000e29     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424f998: 528d2c89     	mov	w9, #0x6964             ; =26980
 424f99c: 72a00c29     	movk	w9, #0x61, lsl #16
 424f9a0: 1400001d     	b	0x424fa14 <_ChromeMain+0x424a778>
 424f9a4: 7100041f     	cmp	w0, #0x1
 424f9a8: 540007ec     	b.gt	0x424faa4 <_ChromeMain+0x424a808>
 424f9ac: 34000200     	cbz	w0, 0x424f9ec <_ChromeMain+0x424a750>
 424f9b0: 7100041f     	cmp	w0, #0x1
 424f9b4: 54000501     	b.ne	0x424fa54 <_ChromeMain+0x424a7b8>
 424f9b8: 528000a9     	mov	w9, #0x5                ; =5
 424f9bc: 39005d09     	strb	w9, [x8, #0x17]
 424f9c0: 91001509     	add	x9, x8, #0x5
 424f9c4: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424f9c8: 9107814a     	add	x10, x10, #0x1e0
 424f9cc: eb0a013f     	cmp	x9, x10
 424f9d0: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424f9d4: 54000c29     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424f9d8: 528e4c49     	mov	w9, #0x7262             ; =29282
 424f9dc: 72aecc29     	movk	w9, #0x7661, lsl #16
 424f9e0: b9000109     	str	w9, [x8]
 424f9e4: 52800ca9     	mov	w9, #0x65               ; =101
 424f9e8: 14000019     	b	0x424fa4c <_ChromeMain+0x424a7b0>
 424f9ec: 52800069     	mov	w9, #0x3                ; =3
 424f9f0: 39005d09     	strb	w9, [x8, #0x17]
 424f9f4: 91000d09     	add	x9, x8, #0x3
 424f9f8: b004beca     	adrp	x10, 0xda28000 <dyld_stub_binder+0xda28000>
 424f9fc: 9106f94a     	add	x10, x10, #0x1be
 424fa00: eb0a013f     	cmp	x9, x10
 424fa04: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fa08: 54000a89     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fa0c: 528e4c29     	mov	w9, #0x7261             ; =29281
 424fa10: 72a00c69     	movk	w9, #0x63, lsl #16
 424fa14: b9000109     	str	w9, [x8]
 424fa18: d65f03c0     	ret
 424fa1c: 528000a9     	mov	w9, #0x5                ; =5
 424fa20: 39005d09     	strb	w9, [x8, #0x17]
 424fa24: 91001509     	add	x9, x8, #0x5
 424fa28: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fa2c: 9107b14a     	add	x10, x10, #0x1ec
 424fa30: eb0a013f     	cmp	x9, x10
 424fa34: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fa38: 54000909     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fa3c: 528dec69     	mov	w9, #0x6f63             ; =28515
 424fa40: 72acada9     	movk	w9, #0x656d, lsl #16
 424fa44: b9000109     	str	w9, [x8]
 424fa48: 52800e89     	mov	w9, #0x74               ; =116
 424fa4c: 79000909     	strh	w9, [x8, #0x4]
 424fa50: d65f03c0     	ret
 424fa54: a9007d1f     	stp	xzr, xzr, [x8]
 424fa58: f900091f     	str	xzr, [x8, #0x10]
 424fa5c: d65f03c0     	ret
 424fa60: 7100181f     	cmp	w0, #0x6
 424fa64: 54000600     	b.eq	0x424fb24 <_ChromeMain+0x424a888>
 424fa68: 71001c1f     	cmp	w0, #0x7
 424fa6c: 54ffff41     	b.ne	0x424fa54 <_ChromeMain+0x424a7b8>
 424fa70: 528000c9     	mov	w9, #0x6                ; =6
 424fa74: 39005d09     	strb	w9, [x8, #0x17]
 424fa78: 91001909     	add	x9, x8, #0x6
 424fa7c: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fa80: 9107ed4a     	add	x10, x10, #0x1fb
 424fa84: eb0a013f     	cmp	x9, x10
 424fa88: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fa8c: 54000669     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fa90: 528daea9     	mov	w9, #0x6d75             ; =28021
 424fa94: 79000909     	strh	w9, [x8, #0x4]
 424fa98: 528cad09     	mov	w9, #0x6568             ; =25960
 424fa9c: 72ad2d89     	movk	w9, #0x696c, lsl #16
 424faa0: 14000011     	b	0x424fae4 <_ChromeMain+0x424a848>
 424faa4: 7100081f     	cmp	w0, #0x2
 424faa8: 54000240     	b.eq	0x424faf0 <_ChromeMain+0x424a854>
 424faac: 71000c1f     	cmp	w0, #0x3
 424fab0: 54fffd21     	b.ne	0x424fa54 <_ChromeMain+0x424a7b8>
 424fab4: 528000c9     	mov	w9, #0x6                ; =6
 424fab8: 39005d09     	strb	w9, [x8, #0x17]
 424fabc: 91001909     	add	x9, x8, #0x6
 424fac0: b004ad2a     	adrp	x10, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 424fac4: 910b4d4a     	add	x10, x10, #0x2d3
 424fac8: eb0a013f     	cmp	x9, x10
 424facc: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fad0: 54000449     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fad4: 528cada9     	mov	w9, #0x656d             ; =25965
 424fad8: 79000909     	strh	w9, [x8, #0x4]
 424fadc: 528d0c69     	mov	w9, #0x6863             ; =26723
 424fae0: 72adee49     	movk	w9, #0x6f72, lsl #16
 424fae4: b9000109     	str	w9, [x8]
 424fae8: 3900191f     	strb	wzr, [x8, #0x6]
 424faec: d65f03c0     	ret
 424faf0: 528000a9     	mov	w9, #0x5                ; =5
 424faf4: 39005d09     	strb	w9, [x8, #0x17]
 424faf8: 91001509     	add	x9, x8, #0x5
 424fafc: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fb00: 9107994a     	add	x10, x10, #0x1e6
 424fb04: eb0a013f     	cmp	x9, x10
 424fb08: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fb0c: 54000269     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fb10: 528e8c29     	mov	w9, #0x7461             ; =29793
 424fb14: 72ac2d89     	movk	w9, #0x616c, lsl #16
 424fb18: b9000109     	str	w9, [x8]
 424fb1c: 52800e69     	mov	w9, #0x73               ; =115
 424fb20: 17ffffcb     	b	0x424fa4c <_ChromeMain+0x424a7b0>
 424fb24: 52800089     	mov	w9, #0x4                ; =4
 424fb28: 39005d09     	strb	w9, [x8, #0x17]
 424fb2c: 91001109     	add	x9, x8, #0x4
 424fb30: 9004c68a     	adrp	x10, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fb34: 9107d94a     	add	x10, x10, #0x1f6
 424fb38: eb0a013f     	cmp	x9, x10
 424fb3c: fa4a8102     	ccmp	x8, x10, #0x2, hi
 424fb40: 540000c9     	b.ls	0x424fb58 <_ChromeMain+0x424a8bc>
 424fb44: 528c8ca9     	mov	w9, #0x6465             ; =25701
 424fb48: 72acace9     	movk	w9, #0x6567, lsl #16
 424fb4c: b9000109     	str	w9, [x8]
 424fb50: 3900111f     	strb	wzr, [x8, #0x4]
 424fb54: d65f03c0     	ret
 424fb58: d4200020     	brk	#0x1
 424fb5c: 00000000     	udf	#0x0
 424fb60: d10383ff     	sub	sp, sp, #0xe0
 424fb64: a90c4ff4     	stp	x20, x19, [sp, #0xc0]
 424fb68: a90d7bfd     	stp	x29, x30, [sp, #0xd0]
 424fb6c: 910343fd     	add	x29, sp, #0xd0
 424fb70: b004eec8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 424fb74: f940f908     	ldr	x8, [x8, #0x1f0]
 424fb78: f9400108     	ldr	x8, [x8]
 424fb7c: f81e83a8     	stur	x8, [x29, #-0x18]
 424fb80: 36000162     	tbz	w2, #0x0, 0x424fbac <_ChromeMain+0x424a910>
 424fb84: f85e83a8     	ldur	x8, [x29, #-0x18]
 424fb88: b004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 424fb8c: f940f929     	ldr	x9, [x9, #0x1f0]
 424fb90: f9400129     	ldr	x9, [x9]
 424fb94: eb08013f     	cmp	x9, x8
 424fb98: 54000a01     	b.ne	0x424fcd8 <_ChromeMain+0x424aa3c>
 424fb9c: a94d7bfd     	ldp	x29, x30, [sp, #0xd0]
 424fba0: a94c4ff4     	ldp	x20, x19, [sp, #0xc0]
 424fba4: 910383ff     	add	sp, sp, #0xe0
 424fba8: d65f03c0     	ret
 424fbac: aa0103f3     	mov	x19, x1
 424fbb0: f9400414     	ldr	x20, [x0, #0x8]
 424fbb4: 9004c681     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 424fbb8: 91059c21     	add	x1, x1, #0x167
 424fbbc: 910123e0     	add	x0, sp, #0x48
 424fbc0: 979c88c8     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 424fbc4: 9101a3e0     	add	x0, sp, #0x68
 424fbc8: 910123e1     	add	x1, sp, #0x48
 424fbcc: 97794019     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424fbd0: 910023e8     	add	x8, sp, #0x8
 424fbd4: aa1303e0     	mov	x0, x19
 424fbd8: 97ffff60     	bl	0x424f958 <_ChromeMain+0x424a6bc>
 424fbdc: 3cc083e0     	ldur	q0, [sp, #0x8]
 424fbe0: 3d800be0     	str	q0, [sp, #0x20]
 424fbe4: f9400fe8     	ldr	x8, [sp, #0x18]
 424fbe8: f9001be8     	str	x8, [sp, #0x30]
 424fbec: 52800088     	mov	w8, #0x4                ; =4
 424fbf0: 3900e3e8     	strb	w8, [sp, #0x38]
 424fbf4: d10143a8     	sub	x8, x29, #0x50
 424fbf8: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 424fbfc: 3cc683e0     	ldur	q0, [sp, #0x68]
 424fc00: 3c9b03a0     	stur	q0, [x29, #-0x50]
 424fc04: f9403fe9     	ldr	x9, [sp, #0x78]
 424fc08: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 424fc0c: 91006100     	add	x0, x8, #0x18
 424fc10: 910083e1     	add	x1, sp, #0x20
 424fc14: 97794007     	bl	0x209fc30 <_ChromeMain+0x209a994>
 424fc18: f004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 424fc1c: 911e5021     	add	x1, x1, #0x794
 424fc20: d10143a3     	sub	x3, x29, #0x50
 424fc24: aa1403e0     	mov	x0, x20
 424fc28: 52800302     	mov	w2, #0x18               ; =24
 424fc2c: 52800044     	mov	w4, #0x2                ; =2
 424fc30: 949d8ac9     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 424fc34: 3940e3e8     	ldrb	w8, [sp, #0x38]
 424fc38: d0053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 424fc3c: 9121e273     	add	x19, x19, #0x878
 424fc40: 7103fd1f     	cmp	w8, #0xff
 424fc44: 54000060     	b.eq	0x424fc50 <_ChromeMain+0x424a9b4>
 424fc48: 721e791f     	tst	w8, #0xfffffffd
 424fc4c: 540001a1     	b.ne	0x424fc80 <_ChromeMain+0x424a9e4>
 424fc50: 394183e8     	ldrb	w8, [sp, #0x60]
 424fc54: 7103fd1f     	cmp	w8, #0xff
 424fc58: 54fff960     	b.eq	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc5c: 721e791f     	tst	w8, #0xfffffffd
 424fc60: 54fff920     	b.eq	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc64: 7100111f     	cmp	w8, #0x4
 424fc68: 54000200     	b.eq	0x424fca8 <_ChromeMain+0x424aa0c>
 424fc6c: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424fc70: d10143a0     	sub	x0, x29, #0x50
 424fc74: 910123e1     	add	x1, sp, #0x48
 424fc78: d63f0100     	blr	x8
 424fc7c: 17ffffc2     	b	0x424fb84 <_ChromeMain+0x424a8e8>
 424fc80: 7100111f     	cmp	w8, #0x4
 424fc84: 540000c0     	b.eq	0x424fc9c <_ChromeMain+0x424aa00>
 424fc88: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 424fc8c: d10143a0     	sub	x0, x29, #0x50
 424fc90: 910083e1     	add	x1, sp, #0x20
 424fc94: d63f0100     	blr	x8
 424fc98: 17ffffee     	b	0x424fc50 <_ChromeMain+0x424a9b4>
 424fc9c: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 424fca0: 36fffd88     	tbz	w8, #0x1f, 0x424fc50 <_ChromeMain+0x424a9b4>
 424fca4: 14000008     	b	0x424fcc4 <_ChromeMain+0x424aa28>
 424fca8: 39c17fe8     	ldrsb	w8, [sp, #0x5f]
 424fcac: 36fff6c8     	tbz	w8, #0x1f, 0x424fb84 <_ChromeMain+0x424a8e8>
 424fcb0: f94027e0     	ldr	x0, [sp, #0x48]
 424fcb4: f9402fe8     	ldr	x8, [sp, #0x58]
 424fcb8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424fcbc: 96f6e47f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424fcc0: 17ffffb1     	b	0x424fb84 <_ChromeMain+0x424a8e8>
 424fcc4: f94013e0     	ldr	x0, [sp, #0x20]
 424fcc8: f9401be8     	ldr	x8, [sp, #0x30]
 424fccc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424fcd0: 96f6e47a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424fcd4: 17ffffdf     	b	0x424fc50 <_ChromeMain+0x424a9b4>
 424fcd8: 94f6d1a2     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
		...
 424fd00: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 424fd04: a9017bfd     	stp	x29, x30, [sp, #0x10]
 424fd08: 910043fd     	add	x29, sp, #0x10
 424fd0c: aa0103f3     	mov	x19, x1
 424fd10: 52800800     	mov	w0, #0x40               ; =64
 424fd14: 96f6fd95     	bl	0xf368 <_ChromeMain+0xa0cc>
 424fd18: aa1303e1     	mov	x1, x19
 424fd1c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 424fd20: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 424fd24: 17fff8e7     	b	0x424e0c0 <_ChromeMain+0x4248e24>
 424fd28: f9401003     	ldr	x3, [x0, #0x20]
 424fd2c: f9400048     	ldr	x8, [x2]
 424fd30: f900005f     	str	xzr, [x2]
 424fd34: 9100a000     	add	x0, x0, #0x28
 424fd38: aa0803e2     	mov	x2, x8
 424fd3c: d61f0060     	br	x3
 424fd40: d102c3ff     	sub	sp, sp, #0xb0
 424fd44: a9075ff8     	stp	x24, x23, [sp, #0x70]
 424fd48: a90857f6     	stp	x22, x21, [sp, #0x80]
 424fd4c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 424fd50: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 424fd54: 910283fd     	add	x29, sp, #0xa0
 424fd58: aa0103f3     	mov	x19, x1
 424fd5c: aa0003e1     	mov	x1, x0
 424fd60: 90050428     	adrp	x8, 0xe2d3000 <dyld_stub_binder+0xe2d3000>
 424fd64: 91116108     	add	x8, x8, #0x458
 424fd68: f9000fe8     	str	x8, [sp, #0x18]
 424fd6c: 6f00e400     	movi.2d	v0, #0000000000000000
 424fd70: ad0103e0     	stp	q0, q0, [sp, #0x20]
 424fd74: 3c8403e0     	stur	q0, [sp, #0x40]
 424fd78: 910063e0     	add	x0, sp, #0x18
 424fd7c: 977b20f9     	bl	0x2118160 <_ChromeMain+0x2112ec4>
 424fd80: 35000160     	cbnz	w0, 0x424fdac <_ChromeMain+0x424ab10>
 424fd84: d2800015     	mov	x21, #0x0               ; =0
 424fd88: 910063e0     	add	x0, sp, #0x18
 424fd8c: 952bc9ee     	bl	0x8d42544 <_ChromeMain+0x8d3d2a8>
 424fd90: aa1503e0     	mov	x0, x21
 424fd94: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 424fd98: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 424fd9c: a94857f6     	ldp	x22, x21, [sp, #0x80]
 424fda0: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 424fda4: 9102c3ff     	add	sp, sp, #0xb0
 424fda8: d65f03c0     	ret
 424fdac: a9007fff     	stp	xzr, xzr, [sp]
 424fdb0: f9000bff     	str	xzr, [sp, #0x10]
 424fdb4: 910003e8     	mov	x8, sp
 424fdb8: 910063e0     	add	x0, sp, #0x18
 424fdbc: 12003e61     	and	w1, w19, #0xffff
 424fdc0: 97419376     	bl	0x12b4b98 <_ChromeMain+0x12af8fc>
 424fdc4: d2800015     	mov	x21, #0x0               ; =0
 424fdc8: 394043e8     	ldrb	w8, [sp, #0x10]
 424fdcc: 34fffde8     	cbz	w8, 0x424fd88 <_ChromeMain+0x424aaec>
 424fdd0: a9404ff5     	ldp	x21, x19, [sp]
 424fdd4: b81c83bf     	stur	wzr, [x29, #-0x38]
 424fdd8: 381cc3bf     	sturb	wzr, [x29, #-0x34]
 424fddc: 781ce3bf     	sturh	wzr, [x29, #-0x32]
 424fde0: d100e3a0     	sub	x0, x29, #0x38
 424fde4: 910143e3     	add	x3, sp, #0x50
 424fde8: aa1503e1     	mov	x1, x21
 424fdec: aa1303e2     	mov	x2, x19
 424fdf0: 975ba377     	bl	0x1938bcc <_ChromeMain+0x1933930>
 424fdf4: 7100041f     	cmp	w0, #0x1
 424fdf8: 540001c0     	b.eq	0x424fe30 <_ChromeMain+0x424ab94>
 424fdfc: f1002276     	subs	x22, x19, #0x8
 424fe00: 540000e3     	b.lo	0x424fe1c <_ChromeMain+0x424ab80>
 424fe04: 394002a8     	ldrb	w8, [x21]
 424fe08: 7100791f     	cmp	w8, #0x1e
 424fe0c: 54000081     	b.ne	0x424fe1c <_ChromeMain+0x424ab80>
 424fe10: 394006a8     	ldrb	w8, [x21, #0x1]
 424fe14: 71026d1f     	cmp	w8, #0x9b
 424fe18: 54000520     	b.eq	0x424febc <_ChromeMain+0x424ac20>
 424fe1c: a9054ff5     	stp	x21, x19, [sp, #0x50]
 424fe20: 910143e0     	add	x0, sp, #0x50
 424fe24: 94d6ca7e     	bl	0x780281c <_ChromeMain+0x77fd580>
 424fe28: aa0003f5     	mov	x21, x0
 424fe2c: 17ffffd7     	b	0x424fd88 <_ChromeMain+0x424aaec>
 424fe30: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 424fe34: f90033ff     	str	xzr, [sp, #0x60]
 424fe38: 910143e2     	add	x2, sp, #0x50
 424fe3c: aa1503e0     	mov	x0, x21
 424fe40: aa1303e1     	mov	x1, x19
 424fe44: 9535c57c     	bl	0x8fc1434 <_ChromeMain+0x8fbc198>
 424fe48: 35000100     	cbnz	w0, 0x424fe68 <_ChromeMain+0x424abcc>
 424fe4c: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 424fe50: 36fff9a8     	tbz	w8, #0x1f, 0x424fd84 <_ChromeMain+0x424aae8>
 424fe54: f9402be0     	ldr	x0, [sp, #0x50]
 424fe58: f94033e8     	ldr	x8, [sp, #0x60]
 424fe5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 424fe60: 96f6e416     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424fe64: 17ffffc8     	b	0x424fd84 <_ChromeMain+0x424aae8>
 424fe68: 52800500     	mov	w0, #0x28               ; =40
 424fe6c: 96f6fd3f     	bl	0xf368 <_ChromeMain+0xa0cc>
 424fe70: aa0003f5     	mov	x21, x0
 424fe74: f9402be8     	ldr	x8, [sp, #0x50]
 424fe78: 3cc583e0     	ldur	q0, [sp, #0x58]
 424fe7c: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 424fe80: f90033ff     	str	xzr, [sp, #0x60]
 424fe84: b900081f     	str	wzr, [x0, #0x8]
 424fe88: f0050329     	adrp	x9, 0xe2b6000 <dyld_stub_binder+0xe2b6000>
 424fe8c: 913c2129     	add	x9, x9, #0xf08
 424fe90: f9000009     	str	x9, [x0]
 424fe94: f9000808     	str	x8, [x0, #0x10]
 424fe98: 3c818000     	stur	q0, [x0, #0x18]
 424fe9c: b4fff760     	cbz	x0, 0x424fd88 <_ChromeMain+0x424aaec>
 424fea0: 910022a8     	add	x8, x21, #0x8
 424fea4: 52800029     	mov	w9, #0x1                ; =1
 424fea8: b8290108     	ldadd	w9, w8, [x8]
 424feac: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424feb0: 6b09011f     	cmp	w8, w9
 424feb4: 54fff6a1     	b.ne	0x424fd88 <_ChromeMain+0x424aaec>
 424feb8: 14000059     	b	0x425001c <_ChromeMain+0x424ad80>
 424febc: b84022a8     	ldur	w8, [x21, #0x2]
 424fec0: 39401aa9     	ldrb	w9, [x21, #0x6]
 424fec4: aa098108     	orr	x8, x8, x9, lsl #32
 424fec8: 39401ea9     	ldrb	w9, [x21, #0x7]
 424fecc: aa09a113     	orr	x19, x8, x9, lsl #40
 424fed0: f9002bf3     	str	x19, [sp, #0x50]
 424fed4: b40009b3     	cbz	x19, 0x4250008 <_ChromeMain+0x424ad6c>
 424fed8: aa1303e0     	mov	x0, x19
 424fedc: 96f6fd23     	bl	0xf368 <_ChromeMain+0xa0cc>
 424fee0: d1000668     	sub	x8, x19, #0x1
 424fee4: cb0003e9     	neg	x9, x0
 424fee8: eb09011f     	cmp	x8, x9
 424feec: 540001e2     	b.hs	0x424ff28 <_ChromeMain+0x424ac8c>
 424fef0: aa0003f4     	mov	x20, x0
 424fef4: aa1303e1     	mov	x1, x19
 424fef8: 94f6e646     	bl	0x8009810 <_ChromeMain+0x8004574>
 424fefc: 910022a1     	add	x1, x21, #0x8
 424ff00: 910143e2     	add	x2, sp, #0x50
 424ff04: aa1603e0     	mov	x0, x22
 424ff08: aa1403e3     	mov	x3, x20
 424ff0c: 9774af1a     	bl	0x1f7bb74 <_ChromeMain+0x1f768d8>
 424ff10: 7100041f     	cmp	w0, #0x1
 424ff14: 54000180     	b.eq	0x424ff44 <_ChromeMain+0x424aca8>
 424ff18: b4fff374     	cbz	x20, 0x424fd84 <_ChromeMain+0x424aae8>
 424ff1c: cb1403e8     	neg	x8, x20
 424ff20: eb08027f     	cmp	x19, x8
 424ff24: 54000769     	b.ls	0x4250010 <_ChromeMain+0x424ad74>
 424ff28: d4200020     	brk	#0x1
 424ff2c: 540006a9     	b.ls	0x4250000 <_ChromeMain+0x424ad64>
 424ff30: 8b140268     	add	x8, x19, x20
 424ff34: d1000508     	sub	x8, x8, #0x1
 424ff38: eb08031f     	cmp	x24, x8
 424ff3c: 540003c9     	b.ls	0x424ffb4 <_ChromeMain+0x424ad18>
 424ff40: 17fffffa     	b	0x424ff28 <_ChromeMain+0x424ac8c>
 424ff44: f9402bf7     	ldr	x23, [sp, #0x50]
 424ff48: eb170278     	subs	x24, x19, x23
 424ff4c: 54ffff02     	b.hs	0x424ff2c <_ChromeMain+0x424ac90>
 424ff50: b7f806d7     	tbnz	x23, #0x3f, 0x4250028 <_ChromeMain+0x424ad8c>
 424ff54: d37ffa68     	lsl	x8, x19, #1
 424ff58: eb17011f     	cmp	x8, x23
 424ff5c: 9a978115     	csel	x21, x8, x23, hi
 424ff60: aa1503e0     	mov	x0, x21
 424ff64: 96f6fd01     	bl	0xf368 <_ChromeMain+0xa0cc>
 424ff68: 8b000268     	add	x8, x19, x0
 424ff6c: d1000508     	sub	x8, x8, #0x1
 424ff70: eb08031f     	cmp	x24, x8
 424ff74: 54fffda9     	b.ls	0x424ff28 <_ChromeMain+0x424ac8c>
 424ff78: aa0003f6     	mov	x22, x0
 424ff7c: 8b130000     	add	x0, x0, x19
 424ff80: cb1302e1     	sub	x1, x23, x19
 424ff84: 94f6e623     	bl	0x8009810 <_ChromeMain+0x8004574>
 424ff88: b40000b3     	cbz	x19, 0x424ff9c <_ChromeMain+0x424ad00>
 424ff8c: aa1603e0     	mov	x0, x22
 424ff90: aa1403e1     	mov	x1, x20
 424ff94: aa1303e2     	mov	x2, x19
 424ff98: 94f6e758     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 424ff9c: b4000094     	cbz	x20, 0x424ffac <_ChromeMain+0x424ad10>
 424ffa0: aa1403e0     	mov	x0, x20
 424ffa4: aa1303e1     	mov	x1, x19
 424ffa8: 96f6e3c4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 424ffac: aa1603f4     	mov	x20, x22
 424ffb0: aa1503f3     	mov	x19, x21
 424ffb4: 52800500     	mov	w0, #0x28               ; =40
 424ffb8: 96f6fcec     	bl	0xf368 <_ChromeMain+0xa0cc>
 424ffbc: aa0003f5     	mov	x21, x0
 424ffc0: b900081f     	str	wzr, [x0, #0x8]
 424ffc4: f0050328     	adrp	x8, 0xe2b6000 <dyld_stub_binder+0xe2b6000>
 424ffc8: 913b8108     	add	x8, x8, #0xee0
 424ffcc: f9000008     	str	x8, [x0]
 424ffd0: a9015c14     	stp	x20, x23, [x0, #0x10]
 424ffd4: f9001013     	str	x19, [x0, #0x20]
 424ffd8: b4ffed80     	cbz	x0, 0x424fd88 <_ChromeMain+0x424aaec>
 424ffdc: 910022a8     	add	x8, x21, #0x8
 424ffe0: 52800029     	mov	w9, #0x1                ; =1
 424ffe4: b8290108     	ldadd	w9, w8, [x8]
 424ffe8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 424ffec: 6b09011f     	cmp	w8, w9
 424fff0: 54ffecc1     	b.ne	0x424fd88 <_ChromeMain+0x424aaec>
 424fff4: d4200000     	brk	#0
 424fff8: d4400000     	hlt	#0
 424fffc: d4200020     	brk	#0x1
 4250000: aa1303f7     	mov	x23, x19
 4250004: 17ffffec     	b	0x424ffb4 <_ChromeMain+0x424ad18>
 4250008: d2800014     	mov	x20, #0x0               ; =0
 425000c: 17ffffbc     	b	0x424fefc <_ChromeMain+0x424ac60>
 4250010: aa1403e0     	mov	x0, x20
 4250014: aa1303e1     	mov	x1, x19
 4250018: 17ffff92     	b	0x424fe60 <_ChromeMain+0x424abc4>
 425001c: d4200000     	brk	#0
 4250020: d4400000     	hlt	#0
 4250024: d4200020     	brk	#0x1
 4250028: 97730f56     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
		...
 4250040: d100c3ff     	sub	sp, sp, #0x30
 4250044: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4250048: a9027bfd     	stp	x29, x30, [sp, #0x20]
 425004c: 910083fd     	add	x29, sp, #0x20
 4250050: f90007e1     	str	x1, [sp, #0x8]
 4250054: b4000240     	cbz	x0, 0x425009c <_ChromeMain+0x424ae00>
 4250058: aa0003f3     	mov	x19, x0
 425005c: f9400408     	ldr	x8, [x0, #0x8]
 4250060: 910023e1     	add	x1, sp, #0x8
 4250064: d63f0100     	blr	x8
 4250068: 12800008     	mov	w8, #-0x1               ; =-1
 425006c: b8e80268     	ldaddal	w8, w8, [x19]
 4250070: 7100051f     	cmp	w8, #0x1
 4250074: 54000081     	b.ne	0x4250084 <_ChromeMain+0x424ade8>
 4250078: f9400a68     	ldr	x8, [x19, #0x10]
 425007c: aa1303e0     	mov	x0, x19
 4250080: d63f0100     	blr	x8
 4250084: f94007e0     	ldr	x0, [sp, #0x8]
 4250088: b5000100     	cbnz	x0, 0x42500a8 <_ChromeMain+0x424ae0c>
 425008c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4250090: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4250094: 9100c3ff     	add	sp, sp, #0x30
 4250098: d65f03c0     	ret
 425009c: d4200000     	brk	#0
 42500a0: d4400000     	hlt	#0
 42500a4: d4200020     	brk	#0x1
 42500a8: 91002008     	add	x8, x0, #0x8
 42500ac: 12800009     	mov	w9, #-0x1               ; =-1
 42500b0: b8e90108     	ldaddal	w9, w8, [x8]
 42500b4: 7100051f     	cmp	w8, #0x1
 42500b8: 54fffea1     	b.ne	0x425008c <_ChromeMain+0x424adf0>
 42500bc: f9400008     	ldr	x8, [x0]
 42500c0: f9400508     	ldr	x8, [x8, #0x8]
 42500c4: d63f0100     	blr	x8
 42500c8: 17fffff1     	b	0x425008c <_ChromeMain+0x424adf0>
 42500cc: 00000000     	udf	#0x0
 42500d0: d10243ff     	sub	sp, sp, #0x90
 42500d4: a9055ff8     	stp	x24, x23, [sp, #0x50]
 42500d8: a90657f6     	stp	x22, x21, [sp, #0x60]
 42500dc: a9074ff4     	stp	x20, x19, [sp, #0x70]
 42500e0: a9087bfd     	stp	x29, x30, [sp, #0x80]
 42500e4: 910203fd     	add	x29, sp, #0x80
 42500e8: aa0103f3     	mov	x19, x1
 42500ec: aa0003f4     	mov	x20, x0
 42500f0: f9400c00     	ldr	x0, [x0, #0x18]
 42500f4: f9000e9f     	str	xzr, [x20, #0x18]
 42500f8: b4000120     	cbz	x0, 0x425011c <_ChromeMain+0x424ae80>
 42500fc: 91002008     	add	x8, x0, #0x8
 4250100: 12800009     	mov	w9, #-0x1               ; =-1
 4250104: b8e90108     	ldaddal	w9, w8, [x8]
 4250108: 7100051f     	cmp	w8, #0x1
 425010c: 54000081     	b.ne	0x425011c <_ChromeMain+0x424ae80>
 4250110: f9400008     	ldr	x8, [x0]
 4250114: f9400d08     	ldr	x8, [x8, #0x18]
 4250118: d63f0100     	blr	x8
 425011c: b004bac0     	adrp	x0, 0xd9a9000 <dyld_stub_binder+0xd9a9000>
 4250120: 91169c00     	add	x0, x0, #0x5a7
 4250124: f004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4250128: 91043821     	add	x1, x1, #0x10e
 425012c: 9100c3e8     	add	x8, sp, #0x30
 4250130: 52803402     	mov	w2, #0x1a0              ; =416
 4250134: 96f802d3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4250138: 910063e8     	add	x8, sp, #0x18
 425013c: aa1303e0     	mov	x0, x19
 4250140: 95674aa2     	bl	0x9c22bc8 <_ChromeMain+0x9c1d92c>
 4250144: 52800800     	mov	w0, #0x40               ; =64
 4250148: 96f6fc88     	bl	0xf368 <_ChromeMain+0xa0cc>
 425014c: aa0003f5     	mov	x21, x0
 4250150: 52800036     	mov	w22, #0x1               ; =1
 4250154: b9000016     	str	w22, [x0]
 4250158: 90fef848     	adrp	x8, 0x2158000 <_ChromeMain+0x2152d64>
 425015c: 9108c108     	add	x8, x8, #0x230
 4250160: d0ffb449     	adrp	x9, 0x38da000 <_ChromeMain+0x38d4d64>
 4250164: 91020129     	add	x9, x9, #0x80
 4250168: a900a408     	stp	x8, x9, [x0, #0x8]
 425016c: b0ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4250170: 912c0108     	add	x8, x8, #0xb00
 4250174: 10003829     	adr	x9, 0x4250878 <_ChromeMain+0x424b5dc>
 4250178: d503201f     	nop
 425017c: a901a408     	stp	x8, x9, [x0, #0x18]
 4250180: 3cc183e0     	ldur	q0, [sp, #0x18]
 4250184: 3c828000     	stur	q0, [x0, #0x28]
 4250188: f94017e8     	ldr	x8, [sp, #0x28]
 425018c: f9001c08     	str	x8, [x0, #0x38]
 4250190: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4250194: f90017ff     	str	xzr, [sp, #0x28]
 4250198: f9404a97     	ldr	x23, [x20, #0x90]
 425019c: b40000b7     	cbz	x23, 0x42501b0 <_ChromeMain+0x424af14>
 42501a0: b83602e8     	ldadd	w22, w8, [x23]
 42501a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 42501a8: 6b09011f     	cmp	w8, w9
 42501ac: 54000680     	b.eq	0x425027c <_ChromeMain+0x424afe0>
 42501b0: f9404e94     	ldr	x20, [x20, #0x98]
 42501b4: 910003e8     	mov	x8, sp
 42501b8: aa1303e0     	mov	x0, x19
 42501bc: 95674a83     	bl	0x9c22bc8 <_ChromeMain+0x9c1d92c>
 42501c0: 52800b00     	mov	w0, #0x58               ; =88
 42501c4: 96f6fc69     	bl	0xf368 <_ChromeMain+0xa0cc>
 42501c8: aa0003e3     	mov	x3, x0
 42501cc: b9000016     	str	w22, [x0]
 42501d0: f0ffeb28     	adrp	x8, 0x3fb7000 <_ChromeMain+0x3fb1d64>
 42501d4: 91300108     	add	x8, x8, #0xc00
 42501d8: d0fff0c9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 42501dc: 913a0129     	add	x9, x9, #0xe80
 42501e0: a900a408     	stp	x8, x9, [x0, #0x8]
 42501e4: d0fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 42501e8: 911b0108     	add	x8, x8, #0x6c0
 42501ec: 10004149     	adr	x9, 0x4250a14 <_ChromeMain+0x424b778>
 42501f0: d503201f     	nop
 42501f4: a901a408     	stp	x8, x9, [x0, #0x18]
 42501f8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 42501fc: f9001c14     	str	x20, [x0, #0x38]
 4250200: 3dc003e0     	ldr	q0, [sp]
 4250204: 3d801000     	str	q0, [x0, #0x40]
 4250208: f9400be8     	ldr	x8, [sp, #0x10]
 425020c: f9002808     	str	x8, [x0, #0x50]
 4250210: a9007fff     	stp	xzr, xzr, [sp]
 4250214: f9000bff     	str	xzr, [sp, #0x10]
 4250218: 900465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 425021c: 91010021     	add	x1, x1, #0x40
 4250220: 9100c3e0     	add	x0, sp, #0x30
 4250224: aa1503e2     	mov	x2, x21
 4250228: 97a8b170     	bl	0x2c7c7e8 <_ChromeMain+0x2c7754c>
 425022c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4250230: 37f801c8     	tbnz	w8, #0x1f, 0x4250268 <_ChromeMain+0x424afcc>
 4250234: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4250238: 37f800e8     	tbnz	w8, #0x1f, 0x4250254 <_ChromeMain+0x424afb8>
 425023c: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4250240: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4250244: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4250248: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 425024c: 910243ff     	add	sp, sp, #0x90
 4250250: d65f03c0     	ret
 4250254: f9400fe0     	ldr	x0, [sp, #0x18]
 4250258: f94017e8     	ldr	x8, [sp, #0x28]
 425025c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4250260: 96f6e316     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250264: 17fffff6     	b	0x425023c <_ChromeMain+0x424afa0>
 4250268: f94003e0     	ldr	x0, [sp]
 425026c: f9400be8     	ldr	x8, [sp, #0x10]
 4250270: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4250274: 96f6e311     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250278: 17ffffef     	b	0x4250234 <_ChromeMain+0x424af98>
 425027c: d4200000     	brk	#0
 4250280: d4400000     	hlt	#0
 4250284: d4200020     	brk	#0x1
 4250288: aa0003e8     	mov	x8, x0
 425028c: f9400c00     	ldr	x0, [x0, #0x18]
 4250290: f9000d1f     	str	xzr, [x8, #0x18]
 4250294: b40000c0     	cbz	x0, 0x42502ac <_ChromeMain+0x424b010>
 4250298: 91002008     	add	x8, x0, #0x8
 425029c: 12800009     	mov	w9, #-0x1               ; =-1
 42502a0: b8e90108     	ldaddal	w9, w8, [x8]
 42502a4: 7100051f     	cmp	w8, #0x1
 42502a8: 54000040     	b.eq	0x42502b0 <_ChromeMain+0x424b014>
 42502ac: d65f03c0     	ret
 42502b0: f9400008     	ldr	x8, [x0]
 42502b4: f9400d01     	ldr	x1, [x8, #0x18]
 42502b8: d61f0020     	br	x1
 42502bc: 140005da     	b	0x4251a24 <_ChromeMain+0x424c788>
 42502c0: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 42502c4: 910003fd     	mov	x29, sp
 42502c8: 940005d7     	bl	0x4251a24 <_ChromeMain+0x424c788>
 42502cc: 52801401     	mov	w1, #0xa0               ; =160
 42502d0: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 42502d4: 16f6e2f9     	b	0x8eb8 <_ChromeMain+0x3c1c>
 42502d8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 42502dc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 42502e0: 910043fd     	add	x29, sp, #0x10
 42502e4: aa0003f3     	mov	x19, x0
 42502e8: 39422014     	ldrb	w20, [x0, #0x88]
 42502ec: f9401400     	ldr	x0, [x0, #0x28]
 42502f0: f900167f     	str	xzr, [x19, #0x28]
 42502f4: b50003a0     	cbnz	x0, 0x4250368 <_ChromeMain+0x424b0cc>
 42502f8: f9401260     	ldr	x0, [x19, #0x20]
 42502fc: f900127f     	str	xzr, [x19, #0x20]
 4250300: b4000080     	cbz	x0, 0x4250310 <_ChromeMain+0x424b074>
 4250304: 97b84fc9     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4250308: 52802f01     	mov	w1, #0x178              ; =376
 425030c: 96f6e2eb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250310: 3902227f     	strb	wzr, [x19, #0x88]
 4250314: f900427f     	str	xzr, [x19, #0x80]
 4250318: f9401e68     	ldr	x8, [x19, #0x38]
 425031c: d37ef509     	lsl	x9, x8, #2
 4250320: b4000129     	cbz	x9, 0x4250344 <_ChromeMain+0x424b0a8>
 4250324: f9401a6a     	ldr	x10, [x19, #0x30]
 4250328: cb080be8     	neg	x8, x8, lsl #2
 425032c: 8b0a0129     	add	x9, x9, x10
 4250330: d1001129     	sub	x9, x9, #0x4
 4250334: b4000229     	cbz	x9, 0x4250378 <_ChromeMain+0x424b0dc>
 4250338: d1001129     	sub	x9, x9, #0x4
 425033c: 91001108     	add	x8, x8, #0x4
 4250340: b5ffffa8     	cbnz	x8, 0x4250334 <_ChromeMain+0x424b098>
 4250344: f9001e7f     	str	xzr, [x19, #0x38]
 4250348: aa1303e0     	mov	x0, x19
 425034c: 36000094     	tbz	w20, #0x0, 0x425035c <_ChromeMain+0x424b0c0>
 4250350: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4250354: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4250358: 14000432     	b	0x4251420 <_ChromeMain+0x424c184>
 425035c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4250360: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4250364: 140002b7     	b	0x4250e40 <_ChromeMain+0x424bba4>
 4250368: 94d3f5d5     	bl	0x774dabc <_ChromeMain+0x7748820>
 425036c: 52805801     	mov	w1, #0x2c0              ; =704
 4250370: 96f6e2d2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250374: 17ffffe1     	b	0x42502f8 <_ChromeMain+0x424b05c>
 4250378: d4200020     	brk	#0x1
 425037c: 52800028     	mov	w8, #0x1                ; =1
 4250380: 39020008     	strb	w8, [x0, #0x80]
 4250384: 39422008     	ldrb	w8, [x0, #0x88]
 4250388: 37000128     	tbnz	w8, #0x0, 0x42503ac <_ChromeMain+0x424b110>
 425038c: f9401408     	ldr	x8, [x0, #0x28]
 4250390: b40000e8     	cbz	x8, 0x42503ac <_ChromeMain+0x424b110>
 4250394: 39420409     	ldrb	w9, [x0, #0x81]
 4250398: 340000a9     	cbz	w9, 0x42503ac <_ChromeMain+0x424b110>
 425039c: 39420809     	ldrb	w9, [x0, #0x82]
 42503a0: 34000069     	cbz	w9, 0x42503ac <_ChromeMain+0x424b110>
 42503a4: 39420c09     	ldrb	w9, [x0, #0x83]
 42503a8: 35000049     	cbnz	w9, 0x42503b0 <_ChromeMain+0x424b114>
 42503ac: d65f03c0     	ret
 42503b0: 52800029     	mov	w9, #0x1                ; =1
 42503b4: 39022009     	strb	w9, [x0, #0x88]
 42503b8: 9100c001     	add	x1, x0, #0x30
 42503bc: aa0803e0     	mov	x0, x8
 42503c0: 17fa7c6f     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 42503c4: 52800028     	mov	w8, #0x1                ; =1
 42503c8: 39020408     	strb	w8, [x0, #0x81]
 42503cc: 39422008     	ldrb	w8, [x0, #0x88]
 42503d0: 37000128     	tbnz	w8, #0x0, 0x42503f4 <_ChromeMain+0x424b158>
 42503d4: f9401408     	ldr	x8, [x0, #0x28]
 42503d8: b40000e8     	cbz	x8, 0x42503f4 <_ChromeMain+0x424b158>
 42503dc: 39420009     	ldrb	w9, [x0, #0x80]
 42503e0: 340000a9     	cbz	w9, 0x42503f4 <_ChromeMain+0x424b158>
 42503e4: 39420809     	ldrb	w9, [x0, #0x82]
 42503e8: 34000069     	cbz	w9, 0x42503f4 <_ChromeMain+0x424b158>
 42503ec: 39420c09     	ldrb	w9, [x0, #0x83]
 42503f0: 35000049     	cbnz	w9, 0x42503f8 <_ChromeMain+0x424b15c>
 42503f4: d65f03c0     	ret
 42503f8: 52800029     	mov	w9, #0x1                ; =1
 42503fc: 39022009     	strb	w9, [x0, #0x88]
 4250400: 9100c001     	add	x1, x0, #0x30
 4250404: aa0803e0     	mov	x0, x8
 4250408: 17fa7c5d     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 425040c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4250410: a90167fa     	stp	x26, x25, [sp, #0x10]
 4250414: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4250418: a90357f6     	stp	x22, x21, [sp, #0x30]
 425041c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4250420: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4250424: 910143fd     	add	x29, sp, #0x50
 4250428: aa0003f4     	mov	x20, x0
 425042c: aa0003f3     	mov	x19, x0
 4250430: f8430e75     	ldr	x21, [x19, #0x30]!
 4250434: 52800028     	mov	w8, #0x1                ; =1
 4250438: 39014a68     	strb	w8, [x19, #0x52]
 425043c: f9400668     	ldr	x8, [x19, #0x8]
 4250440: d37ef509     	lsl	x9, x8, #2
 4250444: b4000109     	cbz	x9, 0x4250464 <_ChromeMain+0x424b1c8>
 4250448: cb080be8     	neg	x8, x8, lsl #2
 425044c: 8b150129     	add	x9, x9, x21
 4250450: d1001129     	sub	x9, x9, #0x4
 4250454: b40006e9     	cbz	x9, 0x4250530 <_ChromeMain+0x424b294>
 4250458: d1001129     	sub	x9, x9, #0x4
 425045c: 91001108     	add	x8, x8, #0x4
 4250460: b5ffffa8     	cbnz	x8, 0x4250454 <_ChromeMain+0x424b1b8>
 4250464: f9001e9f     	str	xzr, [x20, #0x38]
 4250468: 39400028     	ldrb	w8, [x1]
 425046c: 7100091f     	cmp	w8, #0x2
 4250470: 54000c02     	b.hs	0x42505f0 <_ChromeMain+0x424b354>
 4250474: 34000288     	cbz	w8, 0x42504c4 <_ChromeMain+0x424b228>
 4250478: 39422288     	ldrb	w8, [x20, #0x88]
 425047c: 37000168     	tbnz	w8, #0x0, 0x42504a8 <_ChromeMain+0x424b20c>
 4250480: f9401680     	ldr	x0, [x20, #0x28]
 4250484: b4000120     	cbz	x0, 0x42504a8 <_ChromeMain+0x424b20c>
 4250488: 39420288     	ldrb	w8, [x20, #0x80]
 425048c: 340000e8     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 4250490: 39420688     	ldrb	w8, [x20, #0x81]
 4250494: 340000a8     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 4250498: 39420a88     	ldrb	w8, [x20, #0x82]
 425049c: 34000068     	cbz	w8, 0x42504a8 <_ChromeMain+0x424b20c>
 42504a0: 39420e88     	ldrb	w8, [x20, #0x83]
 42504a4: 350008e8     	cbnz	w8, 0x42505c0 <_ChromeMain+0x424b324>
 42504a8: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42504ac: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42504b0: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42504b4: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42504b8: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42504bc: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42504c0: d65f03c0     	ret
 42504c4: f9401428     	ldr	x8, [x1, #0x28]
 42504c8: 52800b09     	mov	w9, #0x58               ; =88
 42504cc: 9b097d18     	mul	x24, x8, x9
 42504d0: b4fffd58     	cbz	x24, 0x4250478 <_ChromeMain+0x424b1dc>
 42504d4: d280001a     	mov	x26, #0x0               ; =0
 42504d8: f9401028     	ldr	x8, [x1, #0x20]
 42504dc: 91014119     	add	x25, x8, #0x50
 42504e0: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 42504e4: 92f8001c     	mov	x28, #0x3fffffffffffffff ; =4611686018427387903
 42504e8: f9402288     	ldr	x8, [x20, #0x40]
 42504ec: eb08035f     	cmp	x26, x8
 42504f0: 54000220     	b.eq	0x4250534 <_ChromeMain+0x424b298>
 42504f4: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 42504f8: b40001c8     	cbz	x8, 0x4250530 <_ChromeMain+0x424b294>
 42504fc: b9400329     	ldr	w9, [x25]
 4250500: b9000109     	str	w9, [x8]
 4250504: 8b1a0aa8     	add	x8, x21, x26, lsl #2
 4250508: 91001108     	add	x8, x8, #0x4
 425050c: f9401a95     	ldr	x21, [x20, #0x30]
 4250510: eb150108     	subs	x8, x8, x21
 4250514: 9342fd1a     	asr	x26, x8, #2
 4250518: f9001e9a     	str	x26, [x20, #0x38]
 425051c: 540000a0     	b.eq	0x4250530 <_ChromeMain+0x424b294>
 4250520: 91016339     	add	x25, x25, #0x58
 4250524: f1016318     	subs	x24, x24, #0x58
 4250528: 54fffe01     	b.ne	0x42504e8 <_ChromeMain+0x424b24c>
 425052c: 17ffffd3     	b	0x4250478 <_ChromeMain+0x424b1dc>
 4250530: d4200020     	brk	#0x1
 4250534: 91000748     	add	x8, x26, #0x1
 4250538: d37efd09     	lsr	x9, x8, #62
 425053c: b5000569     	cbnz	x9, 0x42505e8 <_ChromeMain+0x424b34c>
 4250540: d37ffb49     	lsl	x9, x26, #1
 4250544: eb08013f     	cmp	x9, x8
 4250548: 9a888128     	csel	x8, x9, x8, hi
 425054c: eb0a035f     	cmp	x26, x10
 4250550: 9a9c311b     	csel	x27, x8, x28, lo
 4250554: b400055b     	cbz	x27, 0x42505fc <_ChromeMain+0x424b360>
 4250558: d37eff68     	lsr	x8, x27, #62
 425055c: b5000488     	cbnz	x8, 0x42505ec <_ChromeMain+0x424b350>
 4250560: d37ef760     	lsl	x0, x27, #2
 4250564: 96f6fb81     	bl	0xf368 <_ChromeMain+0xa0cc>
 4250568: aa0003f5     	mov	x21, x0
 425056c: ab1a0aa8     	adds	x8, x21, x26, lsl #2
 4250570: 54fffe00     	b.eq	0x4250530 <_ChromeMain+0x424b294>
 4250574: b9400329     	ldr	w9, [x25]
 4250578: b9000109     	str	w9, [x8]
 425057c: a9432681     	ldp	x1, x9, [x20, #0x30]
 4250580: cb090916     	sub	x22, x8, x9, lsl #2
 4250584: d37ef537     	lsl	x23, x9, #2
 4250588: aa1603e0     	mov	x0, x22
 425058c: aa1703e2     	mov	x2, x23
 4250590: 94f6e5da     	bl	0x8009cf8 <_ChromeMain+0x8004a5c>
 4250594: 910012e8     	add	x8, x23, #0x4
 4250598: 9342fd08     	asr	x8, x8, #2
 425059c: f9401a80     	ldr	x0, [x20, #0x30]
 42505a0: a9032296     	stp	x22, x8, [x20, #0x30]
 42505a4: f9402288     	ldr	x8, [x20, #0x40]
 42505a8: f900229b     	str	x27, [x20, #0x40]
 42505ac: b4000060     	cbz	x0, 0x42505b8 <_ChromeMain+0x424b31c>
 42505b0: d37ef501     	lsl	x1, x8, #2
 42505b4: 96f6e241     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42505b8: 92fc000a     	mov	x10, #0x1fffffffffffffff ; =2305843009213693951
 42505bc: 17ffffd2     	b	0x4250504 <_ChromeMain+0x424b268>
 42505c0: 52800028     	mov	w8, #0x1                ; =1
 42505c4: 39022288     	strb	w8, [x20, #0x88]
 42505c8: aa1303e1     	mov	x1, x19
 42505cc: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42505d0: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42505d4: a94357f6     	ldp	x22, x21, [sp, #0x30]
 42505d8: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 42505dc: a94167fa     	ldp	x26, x25, [sp, #0x10]
 42505e0: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 42505e4: 17fa7be6     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 42505e8: 97730de6     	bl	0x1f13d80 <_ChromeMain+0x1f0eae4>
 42505ec: 9426d68d     	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 42505f0: d4200000     	brk	#0
 42505f4: d4400000     	hlt	#0
 42505f8: d4200020     	brk	#0x1
 42505fc: d2800015     	mov	x21, #0x0               ; =0
 4250600: 17ffffdb     	b	0x425056c <_ChromeMain+0x424b2d0>
 4250604: 52800028     	mov	w8, #0x1                ; =1
 4250608: 39020c08     	strb	w8, [x0, #0x83]
 425060c: 39422008     	ldrb	w8, [x0, #0x88]
 4250610: 37000128     	tbnz	w8, #0x0, 0x4250634 <_ChromeMain+0x424b398>
 4250614: f9401408     	ldr	x8, [x0, #0x28]
 4250618: b40000e8     	cbz	x8, 0x4250634 <_ChromeMain+0x424b398>
 425061c: 39420009     	ldrb	w9, [x0, #0x80]
 4250620: 340000a9     	cbz	w9, 0x4250634 <_ChromeMain+0x424b398>
 4250624: 39420409     	ldrb	w9, [x0, #0x81]
 4250628: 34000069     	cbz	w9, 0x4250634 <_ChromeMain+0x424b398>
 425062c: 39420809     	ldrb	w9, [x0, #0x82]
 4250630: 35000049     	cbnz	w9, 0x4250638 <_ChromeMain+0x424b39c>
 4250634: d65f03c0     	ret
 4250638: 52800029     	mov	w9, #0x1                ; =1
 425063c: 39022009     	strb	w9, [x0, #0x88]
 4250640: 9100c001     	add	x1, x0, #0x30
 4250644: aa0803e0     	mov	x0, x8
 4250648: 17fa7bcd     	b	0x40ef57c <_ChromeMain+0x40ea2e0>
 425064c: 52800028     	mov	w8, #0x1                ; =1
 4250650: 39021008     	strb	w8, [x0, #0x84]
 4250654: 14000550     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250658: 52800028     	mov	w8, #0x1                ; =1
 425065c: 39021408     	strb	w8, [x0, #0x85]
 4250660: 1400054d     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250664: 52800028     	mov	w8, #0x1                ; =1
 4250668: 39021808     	strb	w8, [x0, #0x86]
 425066c: 1400054a     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 4250670: 52800028     	mov	w8, #0x1                ; =1
 4250674: 39021c08     	strb	w8, [x0, #0x87]
 4250678: 14000547     	b	0x4251b94 <_ChromeMain+0x424c8f8>
 425067c: aa0003e8     	mov	x8, x0
 4250680: f9404800     	ldr	x0, [x0, #0x90]
 4250684: b40000c0     	cbz	x0, 0x425069c <_ChromeMain+0x424b400>
 4250688: 52800029     	mov	w9, #0x1                ; =1
 425068c: b8290009     	ldadd	w9, w9, [x0]
 4250690: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4250694: 6b0a013f     	cmp	w9, w10
 4250698: 540000c0     	b.eq	0x42506b0 <_ChromeMain+0x424b414>
 425069c: f9404d08     	ldr	x8, [x8, #0x98]
 42506a0: 91002109     	add	x9, x8, #0x8
 42506a4: f100011f     	cmp	x8, #0x0
 42506a8: 9a8903e1     	csel	x1, xzr, x9, eq
 42506ac: d65f03c0     	ret
 42506b0: d4200000     	brk	#0
 42506b4: d4400000     	hlt	#0
 42506b8: d4200020     	brk	#0x1
 42506bc: d1002000     	sub	x0, x0, #0x8
 42506c0: 140004d9     	b	0x4251a24 <_ChromeMain+0x424c788>
 42506c4: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 42506c8: 910003fd     	mov	x29, sp
 42506cc: d1002000     	sub	x0, x0, #0x8
 42506d0: 940004d5     	bl	0x4251a24 <_ChromeMain+0x424c788>
 42506d4: 52801401     	mov	w1, #0xa0               ; =160
 42506d8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 42506dc: 16f6e1f7     	b	0x8eb8 <_ChromeMain+0x3c1c>
		...
