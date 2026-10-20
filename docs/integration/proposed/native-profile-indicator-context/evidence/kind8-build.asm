
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45744e0: 39805ea1     	ldrsb	x1, [x21, #0x17]
 45744e4: b6f80041     	tbz	x1, #0x3f, 0x45744ec <_ChromeMain+0x456f250>
 45744e8: a94006b5     	ldp	x21, x1, [x21]
 45744ec: 910483e8     	add	x8, sp, #0x120
 45744f0: aa1503e0     	mov	x0, x21
 45744f4: 9717d3a1     	bl	0xb69378 <_ChromeMain+0xb640dc>
 45744f8: d0054b88     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 45744fc: f9467d00     	ldr	x0, [x8, #0xcf8]
 4574500: b40000c0     	cbz	x0, 0x4574518 <_ChromeMain+0x456f27c>
 4574504: 9752ad9d     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4574508: b4000080     	cbz	x0, 0x4574518 <_ChromeMain+0x456f27c>
 457450c: 9752adc1     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4574510: 910483e1     	add	x1, sp, #0x120
 4574514: 9752adfb     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4574518: f90117ff     	str	xzr, [sp, #0x228]
 457451c: f90113ff     	str	xzr, [sp, #0x220]
 4574520: f9011bff     	str	xzr, [sp, #0x230]
 4574524: 910883e8     	add	x8, sp, #0x220
 4574528: 97ffe553     	bl	0x456da74 <_ChromeMain+0x45687d8>
 457452c: f9418e88     	ldr	x8, [x20, #0x318]
 4574530: f940c513     	ldr	x19, [x8, #0x188]
 4574534: b40000d3     	cbz	x19, 0x457454c <_ChromeMain+0x456f2b0>
 4574538: 52800029     	mov	w9, #0x1                ; =1
 457453c: b8290269     	ldadd	w9, w9, [x19]
 4574540: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4574544: 6b0a013f     	cmp	w9, w10
 4574548: 5401ecc0     	b.eq	0x45782e0 <_ChromeMain+0x4573044>
 457454c: f940c915     	ldr	x21, [x8, #0x190]
 4574550: 52800b00     	mov	w0, #0x58               ; =88
 4574554: 96ea6b85     	bl	0xf368 <_ChromeMain+0xa0cc>
 4574558: aa0003f4     	mov	x20, x0
 457455c: 52800028     	mov	w8, #0x1                ; =1
 4574560: b9000008     	str	w8, [x0]
 4574564: 1006c1c8     	adr	x8, 0x4581d9c <_ChromeMain+0x457cb00>
 4574568: d503201f     	nop
 457456c: d0ffd7a9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 4574570: 913a0129     	add	x9, x9, #0xe80
 4574574: a900a408     	stp	x8, x9, [x0, #0x8]
 4574578: d0ffd9c8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 457457c: 911b0108     	add	x8, x8, #0x6c0
 4574580: 10ff08e9     	adr	x9, 0x457269c <_ChromeMain+0x456d400>
 4574584: d503201f     	nop
 4574588: a901a408     	stp	x8, x9, [x0, #0x18]
 457458c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4574590: f9001c15     	str	x21, [x0, #0x38]
 4574594: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 4574598: 37f80448     	tbnz	w8, #0x1f, 0x4574620 <_ChromeMain+0x456f384>
 457459c: 3dc01b20     	ldr	q0, [x25, #0x60]
 45745a0: 3c840280     	stur	q0, [x20, #0x40]
 45745a4: f9409be8     	ldr	x8, [sp, #0x130]
 45745a8: f8050288     	stur	x8, [x20, #0x50]
 45745ac: d0054ca8     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45745b0: 91120108     	add	x8, x8, #0x480
 45745b4: f8bfc100     	ldapr	x0, [x8]
 45745b8: b401e780     	cbz	x0, 0x45782a8 <_ChromeMain+0x457300c>
 45745bc: 52806201     	mov	w1, #0x310              ; =784
 45745c0: d2800002     	mov	x2, #0x0                ; =0
 45745c4: 96ecdbfb     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45745c8: aa0003fc     	mov	x28, x0
 45745cc: 3988dfe8     	ldrsb	x8, [sp, #0x237]
 45745d0: 910883e9     	add	x9, sp, #0x220
 45745d4: f94113ea     	ldr	x10, [sp, #0x220]
 45745d8: f94117eb     	ldr	x11, [sp, #0x228]
 45745dc: f100011f     	cmp	x8, #0x0
 45745e0: 9a894141     	csel	x1, x10, x9, mi
 45745e4: 7100011f     	cmp	w8, #0x0
 45745e8: 9a884162     	csel	x2, x11, x8, mi
 45745ec: aa1403e3     	mov	x3, x20
 45745f0: 97ffdd54     	bl	0x456bb40 <_ChromeMain+0x45668a4>
 45745f4: 39c8dfe8     	ldrsb	w8, [sp, #0x237]
 45745f8: 36f800a8     	tbz	w8, #0x1f, 0x457460c <_ChromeMain+0x456f370>
 45745fc: f94113e0     	ldr	x0, [sp, #0x220]
 4574600: f9411be8     	ldr	x8, [sp, #0x230]
 4574604: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4574608: 96ea522c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 457460c: 39c4dfe8     	ldrsb	w8, [sp, #0x137]
 4574610: 36f91688     	tbz	w8, #0x1f, 0x45768e0 <_ChromeMain+0x4571644>
 4574614: f94093e0     	ldr	x0, [sp, #0x120]
 4574618: f9409be8     	ldr	x8, [sp, #0x130]
 457461c: 1400083a     	b	0x4576704 <_ChromeMain+0x4571468>
 4574620: a9520be1     	ldp	x1, x2, [sp, #0x120]
 4574624: 91010280     	add	x0, x20, #0x40
 4574628: 96ea8efc     	bl	0x18218 <_ChromeMain+0x12f7c>
 457462c: 17ffffe0     	b	0x45745ac <_ChromeMain+0x456f310>
