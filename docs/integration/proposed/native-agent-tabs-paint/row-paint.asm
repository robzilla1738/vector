
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4689690: d10303ff     	sub	sp, sp, #0xc0
 4689694: a90957f6     	stp	x22, x21, [sp, #0x90]
 4689698: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 468969c: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 46896a0: 9102c3fd     	add	x29, sp, #0xb0
 46896a4: aa0103f4     	mov	x20, x1
 46896a8: aa0003f3     	mov	x19, x0
 46896ac: 96fc5e51     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46896b0: b4000da0     	cbz	x0, 0x4689864 <_ChromeMain+0x46845c8>
 46896b4: aa1303e0     	mov	x0, x19
 46896b8: 9749078e     	bl	0x18cb4f0 <_ChromeMain+0x18c6254>
 46896bc: 37000760     	tbnz	w0, #0x0, 0x46897a8 <_ChromeMain+0x468450c>
 46896c0: f9400268     	ldr	x8, [x19]
 46896c4: f9403508     	ldr	x8, [x8, #0x68]
 46896c8: aa1303e0     	mov	x0, x19
 46896cc: d63f0100     	blr	x8
 46896d0: aa1303f5     	mov	x21, x19
 46896d4: f84e8ea8     	ldr	x8, [x21, #0xe8]!
 46896d8: 90051bf6     	adrp	x22, 0xea05000 <dyld_stub_binder+0xea05000>
 46896dc: 911922d6     	add	x22, x22, #0x648
 46896e0: b4000328     	cbz	x8, 0x4689744 <_ChromeMain+0x46844a8>
 46896e4: f9401109     	ldr	x9, [x8, #0x20]
 46896e8: eb16013f     	cmp	x9, x22
 46896ec: 540000a8     	b.hi	0x4689700 <_ChromeMain+0x4684464>
 46896f0: 54000222     	b.hs	0x4689734 <_ChromeMain+0x4684498>
 46896f4: f9400508     	ldr	x8, [x8, #0x8]
 46896f8: b5ffff68     	cbnz	x8, 0x46896e4 <_ChromeMain+0x4684448>
 46896fc: 14000012     	b	0x4689744 <_ChromeMain+0x46844a8>
 4689700: f9400108     	ldr	x8, [x8]
 4689704: b5ffff08     	cbnz	x8, 0x46896e4 <_ChromeMain+0x4684448>
 4689708: 1400000f     	b	0x4689744 <_ChromeMain+0x46844a8>
 468970c: eb15011f     	cmp	x8, x21
 4689710: 54000380     	b.eq	0x4689780 <_ChromeMain+0x46844e4>
 4689714: f9401908     	ldr	x8, [x8, #0x30]
 4689718: b5001208     	cbnz	x8, 0x4689958 <_ChromeMain+0x46846bc>
 468971c: b5000340     	cbnz	x0, 0x4689784 <_ChromeMain+0x46844e8>
 4689720: d2800008     	mov	x8, #0x0                ; =0
 4689724: 1400001a     	b	0x468978c <_ChromeMain+0x46844f0>
 4689728: f9400108     	ldr	x8, [x8]
 468972c: b50001e8     	cbnz	x8, 0x4689768 <_ChromeMain+0x46844cc>
 4689730: 14000014     	b	0x4689780 <_ChromeMain+0x46844e4>
 4689734: eb15011f     	cmp	x8, x21
 4689738: 54000060     	b.eq	0x4689744 <_ChromeMain+0x46844a8>
 468973c: f9401908     	ldr	x8, [x8, #0x30]
 4689740: b5001048     	cbnz	x8, 0x4689948 <_ChromeMain+0x46846ac>
 4689744: b4000900     	cbz	x0, 0x4689864 <_ChromeMain+0x46845c8>
 4689748: 9706f862     	bl	0x8478d0 <_ChromeMain+0x842634>
 468974c: b40008c0     	cbz	x0, 0x4689864 <_ChromeMain+0x46845c8>
 4689750: f9400268     	ldr	x8, [x19]
 4689754: f9403508     	ldr	x8, [x8, #0x68]
 4689758: aa1303e0     	mov	x0, x19
 468975c: d63f0100     	blr	x8
 4689760: f9407668     	ldr	x8, [x19, #0xe8]
 4689764: b40000e8     	cbz	x8, 0x4689780 <_ChromeMain+0x46844e4>
 4689768: f9401109     	ldr	x9, [x8, #0x20]
 468976c: eb16013f     	cmp	x9, x22
 4689770: 54fffdc8     	b.hi	0x4689728 <_ChromeMain+0x468448c>
 4689774: 54fffcc2     	b.hs	0x468970c <_ChromeMain+0x4684470>
 4689778: f9400508     	ldr	x8, [x8, #0x8]
 468977c: b5ffff68     	cbnz	x8, 0x4689768 <_ChromeMain+0x46844cc>
 4689780: b4fffd00     	cbz	x0, 0x4689720 <_ChromeMain+0x4684484>
 4689784: 9706f853     	bl	0x8478d0 <_ChromeMain+0x842634>
 4689788: aa0003e8     	mov	x8, x0
 468978c: f9400d08     	ldr	x8, [x8, #0x18]
 4689790: f100011f     	cmp	x8, #0x0
 4689794: 1a9f07e9     	cset	w9, ne
 4689798: eb13011f     	cmp	x8, x19
 468979c: fa401904     	ccmp	x8, #0x0, #0x4, ne
 46897a0: 540006c1     	b.ne	0x4689878 <_ChromeMain+0x46845dc>
 46897a4: 34000609     	cbz	w9, 0x4689864 <_ChromeMain+0x46845c8>
 46897a8: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 46897ac: 6f00e400     	movi.2d	v0, #0000000000000000
 46897b0: 3c8583e0     	stur	q0, [sp, #0x58]
 46897b4: 3c8683e0     	stur	q0, [sp, #0x68]
 46897b8: f9003fff     	str	xzr, [sp, #0x78]
 46897bc: d2806029     	mov	x9, #0x301              ; =769
 46897c0: f2f7f009     	movk	x9, #0xbf80, lsl #48
 46897c4: a904a7e8     	stp	x8, x9, [sp, #0x48]
 46897c8: aa1303e0     	mov	x0, x19
 46897cc: 96fc5e09     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46897d0: 52801f01     	mov	w1, #0xf8               ; =248
 46897d4: 97227a7d     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 46897d8: 971d1564     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 46897dc: 2d0707e0     	stp	s0, s1, [sp, #0x38]
 46897e0: 2d080fe2     	stp	s2, s3, [sp, #0x40]
 46897e4: f9406294     	ldr	x20, [x20, #0xc0]
 46897e8: bd41c260     	ldr	s0, [x19, #0x1c0]
 46897ec: 5e21d800     	scvtf	s0, s0
 46897f0: bd41c661     	ldr	s1, [x19, #0x1c4]
 46897f4: 5e21d821     	scvtf	s1, s1
 46897f8: f81d03bf     	stur	xzr, [x29, #-0x30]
 46897fc: 2d3b07a0     	stp	s0, s1, [x29, #-0x28]
 4689800: 6f00e400     	movi.2d	v0, #0000000000000000
 4689804: ad0003e0     	stp	q0, q0, [sp]
 4689808: 3d800be0     	str	q0, [sp, #0x20]
 468980c: b90033ff     	str	wzr, [sp, #0x30]
 4689810: 910003e0     	mov	x0, sp
 4689814: d100c3a1     	sub	x1, x29, #0x30
 4689818: 1e241000     	fmov	s0, #8.00000000
 468981c: 1e241001     	fmov	s1, #8.00000000
 4689820: 97097e78     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 4689824: f9400288     	ldr	x8, [x20]
 4689828: f9407d08     	ldr	x8, [x8, #0xf8]
 468982c: 910003e1     	mov	x1, sp
 4689830: 9100e3e2     	add	x2, sp, #0x38
 4689834: aa1403e0     	mov	x0, x20
 4689838: d63f0100     	blr	x8
 468983c: f9403fe0     	ldr	x0, [sp, #0x78]
 4689840: b50004e0     	cbnz	x0, 0x46898dc <_ChromeMain+0x4684640>
 4689844: f9403be0     	ldr	x0, [sp, #0x70]
 4689848: b5000380     	cbnz	x0, 0x46898b8 <_ChromeMain+0x468461c>
 468984c: f94037e0     	ldr	x0, [sp, #0x68]
 4689850: b50006a0     	cbnz	x0, 0x4689924 <_ChromeMain+0x4684688>
 4689854: f94033e0     	ldr	x0, [sp, #0x60]
 4689858: b5000140     	cbnz	x0, 0x4689880 <_ChromeMain+0x46845e4>
 468985c: f9402fe0     	ldr	x0, [sp, #0x58]
 4689860: b5000500     	cbnz	x0, 0x4689900 <_ChromeMain+0x4684664>
 4689864: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4689868: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 468986c: a94957f6     	ldp	x22, x21, [sp, #0x90]
 4689870: 910303ff     	add	sp, sp, #0xc0
 4689874: d65f03c0     	ret
 4689878: f940c508     	ldr	x8, [x8, #0x188]
 468987c: 17ffffc5     	b	0x4689790 <_ChromeMain+0x46844f4>
 4689880: 91002008     	add	x8, x0, #0x8
 4689884: 12800009     	mov	w9, #-0x1               ; =-1
 4689888: b8e90108     	ldaddal	w9, w8, [x8]
 468988c: 7100051f     	cmp	w8, #0x1
 4689890: 54fffe61     	b.ne	0x468985c <_ChromeMain+0x46845c0>
 4689894: f9400009     	ldr	x9, [x0]
 4689898: f9400928     	ldr	x8, [x9, #0x10]
 468989c: 90fdccea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46898a0: 9106014a     	add	x10, x10, #0x180
 46898a4: eb0a011f     	cmp	x8, x10
 46898a8: 54000041     	b.ne	0x46898b0 <_ChromeMain+0x4684614>
 46898ac: f9400528     	ldr	x8, [x9, #0x8]
 46898b0: d63f0100     	blr	x8
 46898b4: 17ffffea     	b	0x468985c <_ChromeMain+0x46845c0>
 46898b8: 91002008     	add	x8, x0, #0x8
 46898bc: 12800009     	mov	w9, #-0x1               ; =-1
 46898c0: b8e90108     	ldaddal	w9, w8, [x8]
 46898c4: 7100051f     	cmp	w8, #0x1
 46898c8: 54fffc21     	b.ne	0x468984c <_ChromeMain+0x46845b0>
 46898cc: f9400008     	ldr	x8, [x0]
 46898d0: f9400908     	ldr	x8, [x8, #0x10]
 46898d4: d63f0100     	blr	x8
 46898d8: 17ffffdd     	b	0x468984c <_ChromeMain+0x46845b0>
 46898dc: 91002008     	add	x8, x0, #0x8
 46898e0: 12800009     	mov	w9, #-0x1               ; =-1
 46898e4: b8e90108     	ldaddal	w9, w8, [x8]
 46898e8: 7100051f     	cmp	w8, #0x1
 46898ec: 54fffac1     	b.ne	0x4689844 <_ChromeMain+0x46845a8>
 46898f0: f9400008     	ldr	x8, [x0]
 46898f4: f9400908     	ldr	x8, [x8, #0x10]
 46898f8: d63f0100     	blr	x8
 46898fc: 17ffffd2     	b	0x4689844 <_ChromeMain+0x46845a8>
 4689900: 91002008     	add	x8, x0, #0x8
 4689904: 12800009     	mov	w9, #-0x1               ; =-1
 4689908: b8e90108     	ldaddal	w9, w8, [x8]
 468990c: 7100051f     	cmp	w8, #0x1
 4689910: 54fffaa1     	b.ne	0x4689864 <_ChromeMain+0x46845c8>
 4689914: f9400008     	ldr	x8, [x0]
 4689918: f9400908     	ldr	x8, [x8, #0x10]
 468991c: d63f0100     	blr	x8
 4689920: 17ffffd1     	b	0x4689864 <_ChromeMain+0x46845c8>
 4689924: 91002008     	add	x8, x0, #0x8
 4689928: 12800009     	mov	w9, #-0x1               ; =-1
 468992c: b8e90108     	ldaddal	w9, w8, [x8]
 4689930: 7100051f     	cmp	w8, #0x1
 4689934: 54fff901     	b.ne	0x4689854 <_ChromeMain+0x46845b8>
 4689938: f9400008     	ldr	x8, [x0]
 468993c: f9400908     	ldr	x8, [x8, #0x10]
 4689940: d63f0100     	blr	x8
 4689944: 17ffffc4     	b	0x4689854 <_ChromeMain+0x46845b8>
 4689948: b4fff040     	cbz	x0, 0x4689750 <_ChromeMain+0x46844b4>
 468994c: d4200000     	brk	#0
 4689950: d4400000     	hlt	#0
 4689954: d4200020     	brk	#0x1
 4689958: b4fff1a0     	cbz	x0, 0x468978c <_ChromeMain+0x46844f0>
 468995c: d4200000     	brk	#0
 4689960: d4400000     	hlt	#0
 4689964: d4200020     	brk	#0x1
