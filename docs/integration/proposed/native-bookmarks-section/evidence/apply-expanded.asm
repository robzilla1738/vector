
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46598b0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46598b4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46598b8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46598bc: 910083fd     	add	x29, sp, #0x20
 46598c0: aa0103f4     	mov	x20, x1
 46598c4: aa0003f3     	mov	x19, x0
 46598c8: 394d2008     	ldrb	w8, [x0, #0x348]
 46598cc: 350008e8     	cbnz	w8, 0x46599e8 <_ChromeMain+0x465474c>
 46598d0: 394f2268     	ldrb	w8, [x19, #0x3c8]
 46598d4: 34000048     	cbz	w8, 0x46598dc <_ChromeMain+0x4654640>
 46598d8: 390f227f     	strb	wzr, [x19, #0x3c8]
 46598dc: f9419660     	ldr	x0, [x19, #0x328]
 46598e0: 394c9008     	ldrb	w8, [x0, #0x324]
 46598e4: 34000128     	cbz	w8, 0x4659908 <_ChromeMain+0x465466c>
 46598e8: b903201f     	str	wzr, [x0, #0x320]
 46598ec: 390c901f     	strb	wzr, [x0, #0x324]
 46598f0: 394cc008     	ldrb	w8, [x0, #0x330]
 46598f4: 34000048     	cbz	w8, 0x46598fc <_ChromeMain+0x4654660>
 46598f8: 390cc01f     	strb	wzr, [x0, #0x330]
 46598fc: f9400008     	ldr	x8, [x0]
 4659900: f9418508     	ldr	x8, [x8, #0x308]
 4659904: d63f0100     	blr	x8
 4659908: 390f0274     	strb	w20, [x19, #0x3c0]
 465990c: f9418a68     	ldr	x8, [x19, #0x310]
 4659910: f9427115     	ldr	x21, [x8, #0x4e0]
 4659914: b4000175     	cbz	x21, 0x4659940 <_ChromeMain+0x46546a4>
 4659918: 395042a8     	ldrb	w8, [x21, #0x410]
 465991c: 6b14011f     	cmp	w8, w20
 4659920: 54000100     	b.eq	0x4659940 <_ChromeMain+0x46546a4>
 4659924: 391042b4     	strb	w20, [x21, #0x410]
 4659928: 910e22a0     	add	x0, x21, #0x388
 465992c: 52000281     	eor	w1, w20, #0x1
 4659930: 9775140d     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4659934: aa1503e0     	mov	x0, x21
 4659938: 96fd1e11     	bl	0x5a117c <_ChromeMain+0x59bee0>
 465993c: 394f0274     	ldrb	w20, [x19, #0x3c0]
 4659940: 7200029f     	tst	w20, #0x1
 4659944: 6f00e400     	movi.2d	v0, #0000000000000000
 4659948: 1e6e1001     	fmov	d1, #1.00000000
 465994c: 1e601c20     	fcsel	d0, d1, d0, ne
 4659950: 394e4268     	ldrb	w8, [x19, #0x390]
 4659954: 35000ae8     	cbnz	w8, 0x4659ab0 <_ChromeMain+0x4654814>
 4659958: fd01d660     	str	d0, [x19, #0x3a8]
 465995c: 394d2268     	ldrb	w8, [x19, #0x348]
 4659960: 35000768     	cbnz	w8, 0x4659a4c <_ChromeMain+0x46547b0>
 4659964: 394f0268     	ldrb	w8, [x19, #0x3c0]
 4659968: f9419660     	ldr	x0, [x19, #0x328]
 465996c: 340000e8     	cbz	w8, 0x4659988 <_ChromeMain+0x46546ec>
 4659970: 394c7008     	ldrb	w8, [x0, #0x31c]
 4659974: 35000068     	cbnz	w8, 0x4659980 <_ChromeMain+0x46546e4>
 4659978: 52800028     	mov	w8, #0x1                ; =1
 465997c: 14000012     	b	0x46599c4 <_ChromeMain+0x4654728>
 4659980: 390c701f     	strb	wzr, [x0, #0x31c]
 4659984: 14000008     	b	0x46599a4 <_ChromeMain+0x4654708>
 4659988: 394c7008     	ldrb	w8, [x0, #0x31c]
 465998c: 34000068     	cbz	w8, 0x4659998 <_ChromeMain+0x46546fc>
 4659990: b9431808     	ldr	w8, [x0, #0x318]
 4659994: 34000188     	cbz	w8, 0x46599c4 <_ChromeMain+0x4654728>
 4659998: b903181f     	str	wzr, [x0, #0x318]
 465999c: 52800028     	mov	w8, #0x1                ; =1
 46599a0: 390c7008     	strb	w8, [x0, #0x31c]
 46599a4: 394cc008     	ldrb	w8, [x0, #0x330]
 46599a8: 34000048     	cbz	w8, 0x46599b0 <_ChromeMain+0x4654714>
 46599ac: 390cc01f     	strb	wzr, [x0, #0x330]
 46599b0: f9400008     	ldr	x8, [x0]
 46599b4: f9418508     	ldr	x8, [x8, #0x308]
 46599b8: d63f0100     	blr	x8
 46599bc: f9419660     	ldr	x0, [x19, #0x328]
 46599c0: 394f0268     	ldrb	w8, [x19, #0x3c0]
 46599c4: f9400009     	ldr	x9, [x0]
 46599c8: f9405129     	ldr	x9, [x9, #0xa0]
 46599cc: 12000101     	and	w1, w8, #0x1
 46599d0: d63f0120     	blr	x9
 46599d4: aa1303e0     	mov	x0, x19
 46599d8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46599dc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46599e0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46599e4: 14002ca7     	b	0x4664c80 <_ChromeMain+0x465f9e4>
 46599e8: 390d227f     	strb	wzr, [x19, #0x348]
 46599ec: f941ae60     	ldr	x0, [x19, #0x358]
 46599f0: 910ce261     	add	x1, x19, #0x338
 46599f4: 976abf43     	bl	0x2109700 <_ChromeMain+0x2104464>
 46599f8: f9419e68     	ldr	x8, [x19, #0x338]
 46599fc: f9401d08     	ldr	x8, [x8, #0x38]
 4659a00: 910ce260     	add	x0, x19, #0x338
 4659a04: d63f0100     	blr	x8
 4659a08: f941aa68     	ldr	x8, [x19, #0x350]
 4659a0c: b4fff628     	cbz	x8, 0x46598d0 <_ChromeMain+0x4654634>
 4659a10: f9419e68     	ldr	x8, [x19, #0x338]
 4659a14: f9402108     	ldr	x8, [x8, #0x40]
 4659a18: 910ce260     	add	x0, x19, #0x338
 4659a1c: d63f0100     	blr	x8
 4659a20: f941aa68     	ldr	x8, [x19, #0x350]
 4659a24: f9400109     	ldr	x9, [x8]
 4659a28: 7100001f     	cmp	w0, #0x0
 4659a2c: 5280020a     	mov	w10, #0x10              ; =16
 4659a30: 5280040b     	mov	w11, #0x20              ; =32
 4659a34: 9a8a116a     	csel	x10, x11, x10, ne
 4659a38: f86a6929     	ldr	x9, [x9, x10]
 4659a3c: 910ce261     	add	x1, x19, #0x338
 4659a40: aa0803e0     	mov	x0, x8
 4659a44: d63f0120     	blr	x9
 4659a48: 17ffffa2     	b	0x46598d0 <_ChromeMain+0x4654634>
 4659a4c: 390d227f     	strb	wzr, [x19, #0x348]
 4659a50: f941ae60     	ldr	x0, [x19, #0x358]
 4659a54: 910ce261     	add	x1, x19, #0x338
 4659a58: 976abf2a     	bl	0x2109700 <_ChromeMain+0x2104464>
 4659a5c: f9419e68     	ldr	x8, [x19, #0x338]
 4659a60: f9401d08     	ldr	x8, [x8, #0x38]
 4659a64: 910ce260     	add	x0, x19, #0x338
 4659a68: d63f0100     	blr	x8
 4659a6c: f941aa68     	ldr	x8, [x19, #0x350]
 4659a70: b4fff7a8     	cbz	x8, 0x4659964 <_ChromeMain+0x46546c8>
 4659a74: f9419e68     	ldr	x8, [x19, #0x338]
 4659a78: f9402108     	ldr	x8, [x8, #0x40]
 4659a7c: 910ce260     	add	x0, x19, #0x338
 4659a80: d63f0100     	blr	x8
 4659a84: f941aa68     	ldr	x8, [x19, #0x350]
 4659a88: f9400109     	ldr	x9, [x8]
 4659a8c: 7100001f     	cmp	w0, #0x0
 4659a90: 5280020a     	mov	w10, #0x10              ; =16
 4659a94: 5280040b     	mov	w11, #0x20              ; =32
 4659a98: 9a8a116a     	csel	x10, x11, x10, ne
 4659a9c: f86a6929     	ldr	x9, [x9, x10]
 4659aa0: 910ce261     	add	x1, x19, #0x338
 4659aa4: aa0803e0     	mov	x0, x8
 4659aa8: d63f0120     	blr	x9
 4659aac: 17ffffae     	b	0x4659964 <_ChromeMain+0x46546c8>
 4659ab0: 390e427f     	strb	wzr, [x19, #0x390]
 4659ab4: 17ffffa9     	b	0x4659958 <_ChromeMain+0x46546bc>
