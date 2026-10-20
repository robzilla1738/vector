
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7aca824: d104c3ff     	sub	sp, sp, #0x130
 7aca828: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 7aca82c: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 7aca830: a91057f6     	stp	x22, x21, [sp, #0x100]
 7aca834: a9114ff4     	stp	x20, x19, [sp, #0x110]
 7aca838: a9127bfd     	stp	x29, x30, [sp, #0x120]
 7aca83c: 910483fd     	add	x29, sp, #0x120
 7aca840: aa0303f4     	mov	x20, x3
 7aca844: aa0203f5     	mov	x21, x2
 7aca848: aa0103f6     	mov	x22, x1
 7aca84c: aa0003f3     	mov	x19, x0
 7aca850: a93a03a4     	stp	x4, x0, [x29, #-0x60]
 7aca854: 52800308     	mov	w8, #0x18               ; =24
 7aca858: f81b03a8     	stur	x8, [x29, #-0x50]
 7aca85c: d10183a8     	sub	x8, x29, #0x60
 7aca860: d10143a9     	sub	x9, x29, #0x50
 7aca864: a90027e8     	stp	x8, x9, [sp]
 7aca868: 910003e8     	mov	x8, sp
 7aca86c: f81b83a8     	stur	x8, [x29, #-0x48]
 7aca870: f003a1f8     	adrp	x24, 0xef09000 <dyld_stub_binder+0xef09000>
 7aca874: 39560301     	ldrb	w1, [x24, #0x580]
 7aca878: 35000b61     	cbnz	w1, 0x7aca9e4 <_ChromeMain+0x7ac5748>
 7aca87c: aa0403e0     	mov	x0, x4
 7aca880: 96297ce9     	bl	0x529c24 <_ChromeMain+0x524988>
 7aca884: 7100081f     	cmp	w0, #0x2
 7aca888: 540002a0     	b.eq	0x7aca8dc <_ChromeMain+0x7ac5640>
 7aca88c: 9003a0e8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 7aca890: f9467d00     	ldr	x0, [x8, #0xcf8]
 7aca894: 967d54b9     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 7aca898: 967d54de     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 7aca89c: aa0003f7     	mov	x23, x0
 7aca8a0: f85a03a0     	ldur	x0, [x29, #-0x60]
 7aca8a4: f9400008     	ldr	x8, [x0]
 7aca8a8: f9401909     	ldr	x9, [x8, #0x30]
 7aca8ac: 910003e8     	mov	x8, sp
 7aca8b0: d63f0120     	blr	x9
 7aca8b4: 910003e1     	mov	x1, sp
 7aca8b8: aa1703e0     	mov	x0, x23
 7aca8bc: 967d5511     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 7aca8c0: aa0003f7     	mov	x23, x0
 7aca8c4: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 7aca8c8: 37f804c8     	tbnz	w8, #0x1f, 0x7aca960 <_ChromeMain+0x7ac56c4>
 7aca8cc: b4000097     	cbz	x23, 0x7aca8dc <_ChromeMain+0x7ac5640>
 7aca8d0: aa1703e0     	mov	x0, x23
 7aca8d4: 96aab505     	bl	0x2577ce8 <_ChromeMain+0x2572a4c>
 7aca8d8: 370004e0     	tbnz	w0, #0x0, 0x7aca974 <_ChromeMain+0x7ac56d8>
 7aca8dc: 37000696     	tbnz	w22, #0x0, 0x7aca9ac <_ChromeMain+0x7ac5710>
 7aca8e0: f85a03a0     	ldur	x0, [x29, #-0x60]
 7aca8e4: 9698e699     	bl	0x2104348 <_ChromeMain+0x20ff0ac>
 7aca8e8: 52800001     	mov	w1, #0x0                ; =0
 7aca8ec: 94026618     	bl	0x7b6414c <_ChromeMain+0x7b5eeb0>
 7aca8f0: b40005e0     	cbz	x0, 0x7aca9ac <_ChromeMain+0x7ac5710>
 7aca8f4: aa0003f6     	mov	x22, x0
 7aca8f8: f9402800     	ldr	x0, [x0, #0x50]
 7aca8fc: f9400008     	ldr	x8, [x0]
 7aca900: f9403508     	ldr	x8, [x8, #0x68]
 7aca904: d63f0100     	blr	x8
 7aca908: b4000133     	cbz	x19, 0x7aca92c <_ChromeMain+0x7ac5690>
 7aca90c: f90003f3     	str	x19, [sp]
 7aca910: f81a83bf     	stur	xzr, [x29, #-0x58]
 7aca914: f9400668     	ldr	x8, [x19, #0x8]
 7aca918: aa1303e0     	mov	x0, x19
 7aca91c: aa1603e1     	mov	x1, x22
 7aca920: d63f0100     	blr	x8
 7aca924: 910003e0     	mov	x0, sp
 7aca928: 96513ab2     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7aca92c: 52800308     	mov	w8, #0x18               ; =24
 7aca930: f81b83a8     	stur	x8, [x29, #-0x48]
 7aca934: 39560300     	ldrb	w0, [x24, #0x580]
 7aca938: 350005e0     	cbnz	w0, 0x7aca9f4 <_ChromeMain+0x7ac5758>
 7aca93c: d10163a0     	sub	x0, x29, #0x58
 7aca940: 96513aac     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7aca944: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 7aca948: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 7aca94c: a95057f6     	ldp	x22, x21, [sp, #0x100]
 7aca950: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 7aca954: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 7aca958: 9104c3ff     	add	sp, sp, #0x130
 7aca95c: d65f03c0     	ret
 7aca960: f94003e0     	ldr	x0, [sp]
 7aca964: f9400be8     	ldr	x8, [sp, #0x10]
 7aca968: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7aca96c: 9614f953     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7aca970: 17ffffd7     	b	0x7aca8cc <_ChromeMain+0x7ac5630>
 7aca974: 910003e8     	mov	x8, sp
 7aca978: 528000a0     	mov	w0, #0x5                ; =5
 7aca97c: 94040b98     	bl	0x7bcd7dc <_ChromeMain+0x7bc8540>
 7aca980: 910003e0     	mov	x0, sp
 7aca984: 9530e2ca     	bl	0xc7034ac <_ChromeMain+0xc6fe210>
 7aca988: 910003e0     	mov	x0, sp
 7aca98c: 94040b58     	bl	0x7bcd6ec <_ChromeMain+0x7bc8450>
 7aca990: b4fffcf3     	cbz	x19, 0x7aca92c <_ChromeMain+0x7ac5690>
 7aca994: f90003f3     	str	x19, [sp]
 7aca998: f81a83bf     	stur	xzr, [x29, #-0x58]
 7aca99c: f9400668     	ldr	x8, [x19, #0x8]
 7aca9a0: aa1303e0     	mov	x0, x19
 7aca9a4: d2800001     	mov	x1, #0x0                ; =0
 7aca9a8: 17ffffde     	b	0x7aca920 <_ChromeMain+0x7ac5684>
 7aca9ac: b40000f3     	cbz	x19, 0x7aca9c8 <_ChromeMain+0x7ac572c>
 7aca9b0: 52800e00     	mov	w0, #0x70               ; =112
 7aca9b4: 9615126d     	bl	0xf368 <_ChromeMain+0xa0cc>
 7aca9b8: f85a03a1     	ldur	x1, [x29, #-0x60]
 7aca9bc: f81a83bf     	stur	xzr, [x29, #-0x58]
 7aca9c0: aa1303e2     	mov	x2, x19
 7aca9c4: 940000a7     	bl	0x7acac60 <_ChromeMain+0x7ac59c4>
 7aca9c8: f85a03a0     	ldur	x0, [x29, #-0x60]
 7aca9cc: aa1503e1     	mov	x1, x21
 7aca9d0: aa1503e2     	mov	x2, x21
 7aca9d4: 52800023     	mov	w3, #0x1                ; =1
 7aca9d8: aa1403e4     	mov	x4, x20
 7aca9dc: 97fffeef     	bl	0x7aca598 <_ChromeMain+0x7ac52fc>
 7aca9e0: 17ffffd3     	b	0x7aca92c <_ChromeMain+0x7ac5690>
 7aca9e4: d10123a0     	sub	x0, x29, #0x48
 7aca9e8: 94000236     	bl	0x7acb2c0 <_ChromeMain+0x7ac6024>
 7aca9ec: f85a03a4     	ldur	x4, [x29, #-0x60]
 7aca9f0: 17ffffa3     	b	0x7aca87c <_ChromeMain+0x7ac55e0>
 7aca9f4: f90003ff     	str	xzr, [sp]
 7aca9f8: d10123a1     	sub	x1, x29, #0x48
 7aca9fc: 910003e2     	mov	x2, sp
 7acaa00: 52800043     	mov	w3, #0x2                ; =2
 7acaa04: 961ea4a1     	bl	0x273c88 <_ChromeMain+0x26e9ec>
 7acaa08: 17ffffcd     	b	0x7aca93c <_ChromeMain+0x7ac56a0>
 7acaa0c: 14000095     	b	0x7acac60 <_ChromeMain+0x7ac59c4>
 7acaa10: d10103ff     	sub	sp, sp, #0x40
 7acaa14: a90157f6     	stp	x22, x21, [sp, #0x10]
 7acaa18: a9024ff4     	stp	x20, x19, [sp, #0x20]
 7acaa1c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 7acaa20: 9100c3fd     	add	x29, sp, #0x30
 7acaa24: aa0103f3     	mov	x19, x1
 7acaa28: aa0003f4     	mov	x20, x0
 7acaa2c: 9003a0e8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 7acaa30: f9467d00     	ldr	x0, [x8, #0xcf8]
 7acaa34: 967d5451     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 7acaa38: aa0003f5     	mov	x21, x0
 7acaa3c: 52800600     	mov	w0, #0x30               ; =48
 7acaa40: 9615124a     	bl	0xf368 <_ChromeMain+0xa0cc>
 7acaa44: aa0003f6     	mov	x22, x0
 7acaa48: d0fce7e1     	adrp	x1, 0x17c8000 <_ChromeMain+0x17c2d64>
 7acaa4c: 912e0021     	add	x1, x1, #0xb80
 7acaa50: f0fe9ec2     	adrp	x2, 0x4ea5000 <_ChromeMain+0x4e9fd64>
 7acaa54: 913a0042     	add	x2, x2, #0xe80
 7acaa58: 96aab2b6     	bl	0x2577530 <_ChromeMain+0x2572294>
 7acaa5c: 10000208     	adr	x8, 0x7acaa9c <_ChromeMain+0x7ac5800>
 7acaa60: d503201f     	nop
 7acaa64: a9024c08     	stp	x8, x19, [x0, #0x20]
 7acaa68: f90007ff     	str	xzr, [sp, #0x8]
 7acaa6c: aa1503e0     	mov	x0, x21
 7acaa70: aa1403e1     	mov	x1, x20
 7acaa74: aa1603e2     	mov	x2, x22
 7acaa78: d2800003     	mov	x3, #0x0                ; =0
 7acaa7c: 97fff01c     	bl	0x7ac6aec <_ChromeMain+0x7ac1850>
 7acaa80: 910023e0     	add	x0, sp, #0x8
 7acaa84: 96513a5b     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acaa88: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 7acaa8c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 7acaa90: a94157f6     	ldp	x22, x21, [sp, #0x10]
 7acaa94: 910103ff     	add	sp, sp, #0x40
 7acaa98: d65f03c0     	ret
 7acaa9c: d10083ff     	sub	sp, sp, #0x20
 7acaaa0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7acaaa4: 910043fd     	add	x29, sp, #0x10
 7acaaa8: f90003e0     	str	x0, [sp]
 7acaaac: b40000e1     	cbz	x1, 0x7acaac8 <_ChromeMain+0x7ac582c>
 7acaab0: b40000c0     	cbz	x0, 0x7acaac8 <_ChromeMain+0x7ac582c>
 7acaab4: a90003ff     	stp	xzr, x0, [sp]
 7acaab8: f9400408     	ldr	x8, [x0, #0x8]
 7acaabc: d63f0100     	blr	x8
 7acaac0: 910023e0     	add	x0, sp, #0x8
 7acaac4: 96513a4b     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acaac8: 910003e0     	mov	x0, sp
 7acaacc: 96513a49     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acaad0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7acaad4: 910083ff     	add	sp, sp, #0x20
 7acaad8: d65f03c0     	ret
 7acaadc: d10143ff     	sub	sp, sp, #0x50
 7acaae0: a9015ff8     	stp	x24, x23, [sp, #0x10]
 7acaae4: a90257f6     	stp	x22, x21, [sp, #0x20]
 7acaae8: a9034ff4     	stp	x20, x19, [sp, #0x30]
 7acaaec: a9047bfd     	stp	x29, x30, [sp, #0x40]
 7acaaf0: 910103fd     	add	x29, sp, #0x40
 7acaaf4: aa0303f3     	mov	x19, x3
 7acaaf8: aa0203f4     	mov	x20, x2
 7acaafc: aa0103f5     	mov	x21, x1
 7acab00: aa0003f6     	mov	x22, x0
 7acab04: 52800700     	mov	w0, #0x38               ; =56
 7acab08: 96151218     	bl	0xf368 <_ChromeMain+0xa0cc>
 7acab0c: aa0003f7     	mov	x23, x0
 7acab10: 10004481     	adr	x1, 0x7acb3a0 <_ChromeMain+0x7ac6104>
 7acab14: d503201f     	nop
 7acab18: f0ffb4c2     	adrp	x2, 0x7165000 <_ChromeMain+0x715fd64>
 7acab1c: 91218042     	add	x2, x2, #0x860
 7acab20: 96aab284     	bl	0x2577530 <_ChromeMain+0x2572294>
 7acab24: 10ffe808     	adr	x8, 0x7aca824 <_ChromeMain+0x7ac5588>
 7acab28: d503201f     	nop
 7acab2c: a9025008     	stp	x8, x20, [x0, #0x20]
 7acab30: f90007ff     	str	xzr, [sp, #0x8]
 7acab34: 3900c015     	strb	w21, [x0, #0x30]
 7acab38: 3900c41f     	strb	wzr, [x0, #0x31]
 7acab3c: 3900c813     	strb	w19, [x0, #0x32]
 7acab40: 9003a0e8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 7acab44: f9467d00     	ldr	x0, [x8, #0xcf8]
 7acab48: 967d540c     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 7acab4c: aa0003f3     	mov	x19, x0
 7acab50: 52800600     	mov	w0, #0x30               ; =48
 7acab54: 96151205     	bl	0xf368 <_ChromeMain+0xa0cc>
 7acab58: aa0003f4     	mov	x20, x0
 7acab5c: d0fce7e1     	adrp	x1, 0x17c8000 <_ChromeMain+0x17c2d64>
 7acab60: 912e0021     	add	x1, x1, #0xb80
 7acab64: f0fe9ec2     	adrp	x2, 0x4ea5000 <_ChromeMain+0x4e9fd64>
 7acab68: 913a0042     	add	x2, x2, #0xe80
 7acab6c: 96aab271     	bl	0x2577530 <_ChromeMain+0x2572294>
 7acab70: 10fff968     	adr	x8, 0x7acaa9c <_ChromeMain+0x7ac5800>
 7acab74: d503201f     	nop
 7acab78: a9025c08     	stp	x8, x23, [x0, #0x20]
 7acab7c: f90003ff     	str	xzr, [sp]
 7acab80: aa1303e0     	mov	x0, x19
 7acab84: aa1603e1     	mov	x1, x22
 7acab88: aa1403e2     	mov	x2, x20
 7acab8c: d2800003     	mov	x3, #0x0                ; =0
 7acab90: 97ffefd7     	bl	0x7ac6aec <_ChromeMain+0x7ac1850>
 7acab94: 910003e0     	mov	x0, sp
 7acab98: 96513a16     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acab9c: 910023e0     	add	x0, sp, #0x8
 7acaba0: 96513a14     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acaba4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 7acaba8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 7acabac: a94257f6     	ldp	x22, x21, [sp, #0x20]
 7acabb0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 7acabb4: 910143ff     	add	sp, sp, #0x50
 7acabb8: d65f03c0     	ret
 7acabbc: d10103ff     	sub	sp, sp, #0x40
 7acabc0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 7acabc4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 7acabc8: 9100c3fd     	add	x29, sp, #0x30
 7acabcc: aa0003f3     	mov	x19, x0
 7acabd0: 910003e8     	mov	x8, sp
 7acabd4: 96fce295     	bl	0x3a03628 <_ChromeMain+0x39fe38c>
 7acabd8: f9000fff     	str	xzr, [sp, #0x18]
 7acabdc: 910003e0     	mov	x0, sp
 7acabe0: 52800001     	mov	w1, #0x0                ; =0
 7acabe4: aa1303e2     	mov	x2, x19
 7acabe8: 52800003     	mov	w3, #0x0                ; =0
 7acabec: 97ffffbc     	bl	0x7acaadc <_ChromeMain+0x7ac5840>
 7acabf0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 7acabf4: 37f800e8     	tbnz	w8, #0x1f, 0x7acac10 <_ChromeMain+0x7ac5974>
 7acabf8: 910063e0     	add	x0, sp, #0x18
 7acabfc: 965139fd     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acac00: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 7acac04: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 7acac08: 910103ff     	add	sp, sp, #0x40
 7acac0c: d65f03c0     	ret
 7acac10: f94003e0     	ldr	x0, [sp]
 7acac14: f9400be8     	ldr	x8, [sp, #0x10]
 7acac18: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 7acac1c: 9614f8a7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 7acac20: 17fffff6     	b	0x7acabf8 <_ChromeMain+0x7ac595c>
 7acac24: d10083ff     	sub	sp, sp, #0x20
 7acac28: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7acac2c: 910043fd     	add	x29, sp, #0x10
 7acac30: a9007fff     	stp	xzr, xzr, [sp]
 7acac34: 910023e2     	add	x2, sp, #0x8
 7acac38: 910003e3     	mov	x3, sp
 7acac3c: 52800001     	mov	w1, #0x0                ; =0
 7acac40: 97fbb4e8     	bl	0x79b7fe0 <_ChromeMain+0x79b2d44>
 7acac44: 910003e0     	mov	x0, sp
 7acac48: 965139ea     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acac4c: 910023e0     	add	x0, sp, #0x8
 7acac50: 965139e8     	bl	0xf193f0 <_ChromeMain+0xf14154>
 7acac54: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7acac58: 910083ff     	add	sp, sp, #0x20
 7acac5c: d65f03c0     	ret
