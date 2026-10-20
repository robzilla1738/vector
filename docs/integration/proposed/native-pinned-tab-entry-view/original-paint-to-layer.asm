
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1c1588c: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 1c15890: a9014ff4     	stp	x20, x19, [sp, #0x10]
 1c15894: a9027bfd     	stp	x29, x30, [sp, #0x20]
 1c15898: 910083fd     	add	x29, sp, #0x20
 1c1589c: aa0103f4     	mov	x20, x1
 1c158a0: aa0003f3     	mov	x19, x0
 1c158a4: 39491008     	ldrb	w8, [x0, #0x244]
 1c158a8: 35000328     	cbnz	w8, 0x1c1590c <_ChromeMain+0x1c10670>
 1c158ac: 52800035     	mov	w21, #0x1               ; =1
 1c158b0: aa1303e0     	mov	x0, x19
 1c158b4: 52800021     	mov	w1, #0x1                ; =1
 1c158b8: 940000cb     	bl	0x1c15be4 <_ChromeMain+0x1c10948>
 1c158bc: 39091275     	strb	w21, [x19, #0x244]
 1c158c0: aa1303e0     	mov	x0, x19
 1c158c4: aa1403e1     	mov	x1, x20
 1c158c8: 9400018e     	bl	0x1c15f00 <_ChromeMain+0x1c10c64>
 1c158cc: f940ee68     	ldr	x8, [x19, #0x1d8]
 1c158d0: f9402d08     	ldr	x8, [x8, #0x58]
 1c158d4: b5000268     	cbnz	x8, 0x1c15920 <_ChromeMain+0x1c10684>
 1c158d8: f940c674     	ldr	x20, [x19, #0x188]
 1c158dc: b4000114     	cbz	x20, 0x1c158fc <_ChromeMain+0x1c10660>
 1c158e0: f9400288     	ldr	x8, [x20]
 1c158e4: f941c908     	ldr	x8, [x8, #0x390]
 1c158e8: aa1403e0     	mov	x0, x20
 1c158ec: aa1303e1     	mov	x1, x19
 1c158f0: d63f0100     	blr	x8
 1c158f4: f940c694     	ldr	x20, [x20, #0x188]
 1c158f8: b5ffff54     	cbnz	x20, 0x1c158e0 <_ChromeMain+0x1c10644>
 1c158fc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 1c15900: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 1c15904: a8c357f6     	ldp	x22, x21, [sp], #0x30
 1c15908: d65f03c0     	ret
 1c1590c: f9401268     	ldr	x8, [x19, #0x20]
 1c15910: b9400908     	ldr	w8, [x8, #0x8]
 1c15914: 6b14011f     	cmp	w8, w20
 1c15918: 54fffca1     	b.ne	0x1c158ac <_ChromeMain+0x1c10610>
 1c1591c: 17fffff8     	b	0x1c158fc <_ChromeMain+0x1c10660>
 1c15920: f9413e68     	ldr	x8, [x19, #0x278]
 1c15924: b5fffda8     	cbnz	x8, 0x1c158d8 <_ChromeMain+0x1c1063c>
 1c15928: aa1303e0     	mov	x0, x19
 1c1592c: 949f68d7     	bl	0x43efc88 <_ChromeMain+0x43ea9ec>
 1c15930: 17ffffea     	b	0x1c158d8 <_ChromeMain+0x1c1063c>
