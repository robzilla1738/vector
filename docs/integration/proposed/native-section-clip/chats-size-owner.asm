
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4667640: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4667644: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4667648: 910043fd     	add	x29, sp, #0x10
 466764c: aa0003f3     	mov	x19, x0
 4667650: f941c408     	ldr	x8, [x0, #0x388]
 4667654: f100011f     	cmp	x8, #0x0
 4667658: 1a880508     	cinc	w8, w8, ne
 466765c: 52800449     	mov	w9, #0x22               ; =34
 4667660: 1280000a     	mov	w10, #-0x1              ; =-1
 4667664: 1b092909     	madd	w9, w8, w9, w10
 4667668: 7100011f     	cmp	w8, #0x0
 466766c: 1a8903e8     	csel	w8, wzr, w9, eq
 4667670: 1e620100     	scvtf	d0, w8
 4667674: fd421001     	ldr	d1, [x0, #0x420]
 4667678: 1e600820     	fmul	d0, d1, d0
 466767c: 9e640014     	fcvtas	x20, d0
 4667680: f941bc00     	ldr	x0, [x0, #0x378]
 4667684: 394c9009     	ldrb	w9, [x0, #0x324]
 4667688: 34000089     	cbz	w9, 0x4667698 <_ChromeMain+0x46623fc>
 466768c: b9432009     	ldr	w9, [x0, #0x320]
 4667690: 6b08013f     	cmp	w9, w8
 4667694: 54000160     	b.eq	0x46676c0 <_ChromeMain+0x4662424>
 4667698: b9032008     	str	w8, [x0, #0x320]
 466769c: 52800028     	mov	w8, #0x1                ; =1
 46676a0: 390c9008     	strb	w8, [x0, #0x324]
 46676a4: 394cc008     	ldrb	w8, [x0, #0x330]
 46676a8: 34000048     	cbz	w8, 0x46676b0 <_ChromeMain+0x4662414>
 46676ac: 390cc01f     	strb	wzr, [x0, #0x330]
 46676b0: f9400008     	ldr	x8, [x0]
 46676b4: f9418508     	ldr	x8, [x8, #0x308]
 46676b8: d63f0100     	blr	x8
 46676bc: f941be60     	ldr	x0, [x19, #0x378]
 46676c0: 394c7008     	ldrb	w8, [x0, #0x31c]
 46676c4: 34000088     	cbz	w8, 0x46676d4 <_ChromeMain+0x4662438>
 46676c8: b9431808     	ldr	w8, [x0, #0x318]
 46676cc: 6b14011f     	cmp	w8, w20
 46676d0: 54000160     	b.eq	0x46676fc <_ChromeMain+0x4662460>
 46676d4: b9031814     	str	w20, [x0, #0x318]
 46676d8: 52800028     	mov	w8, #0x1                ; =1
 46676dc: 390c7008     	strb	w8, [x0, #0x31c]
 46676e0: 394cc008     	ldrb	w8, [x0, #0x330]
 46676e4: 34000048     	cbz	w8, 0x46676ec <_ChromeMain+0x4662450>
 46676e8: 390cc01f     	strb	wzr, [x0, #0x330]
 46676ec: f9400008     	ldr	x8, [x0]
 46676f0: f9418508     	ldr	x8, [x8, #0x308]
 46676f4: d63f0100     	blr	x8
 46676f8: f941be60     	ldr	x0, [x19, #0x378]
 46676fc: 7100029f     	cmp	w20, #0x0
 4667700: 5400010d     	b.le	0x4667720 <_ChromeMain+0x4662484>
 4667704: 52800028     	mov	w8, #0x1                ; =1
 4667708: f9400009     	ldr	x9, [x0]
 466770c: f9405122     	ldr	x2, [x9, #0xa0]
 4667710: 12000101     	and	w1, w8, #0x1
 4667714: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4667718: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 466771c: d61f0040     	br	x2
 4667720: 394f0268     	ldrb	w8, [x19, #0x3c0]
 4667724: 17fffff9     	b	0x4667708 <_ChromeMain+0x466246c>
