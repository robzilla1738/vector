
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4667530: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4667534: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4667538: a9027bfd     	stp	x29, x30, [sp, #0x20]
 466753c: 910083fd     	add	x29, sp, #0x20
 4667540: aa0003f3     	mov	x19, x0
 4667544: 3950e001     	ldrb	w1, [x0, #0x438]
 4667548: 52000028     	eor	w8, w1, #0x1
 466754c: 3910e008     	strb	w8, [x0, #0x438]
 4667550: f9418809     	ldr	x9, [x0, #0x310]
 4667554: f9427134     	ldr	x20, [x9, #0x4e0]
 4667558: b4000134     	cbz	x20, 0x466757c <_ChromeMain+0x46622e0>
 466755c: 39504289     	ldrb	w9, [x20, #0x410]
 4667560: 6b08013f     	cmp	w9, w8
 4667564: 540000c0     	b.eq	0x466757c <_ChromeMain+0x46622e0>
 4667568: 39104288     	strb	w8, [x20, #0x410]
 466756c: 910e2280     	add	x0, x20, #0x388
 4667570: 9774dcfd     	bl	0x239e964 <_ChromeMain+0x23996c8>
 4667574: aa1403e0     	mov	x0, x20
 4667578: 96fce701     	bl	0x5a117c <_ChromeMain+0x59bee0>
 466757c: f941be60     	ldr	x0, [x19, #0x378]
 4667580: f9400008     	ldr	x8, [x0]
 4667584: f9405108     	ldr	x8, [x8, #0xa0]
 4667588: 52800035     	mov	w21, #0x1               ; =1
 466758c: 52800021     	mov	w1, #0x1                ; =1
 4667590: d63f0100     	blr	x8
 4667594: 3950e268     	ldrb	w8, [x19, #0x438]
 4667598: 910ec260     	add	x0, x19, #0x3b0
 466759c: 52000101     	eor	w1, w8, #0x1
 46675a0: 9774dcf1     	bl	0x239e964 <_ChromeMain+0x23996c8>
 46675a4: aa1303e0     	mov	x0, x19
 46675a8: 94000026     	bl	0x4667640 <_ChromeMain+0x46623a4>
 46675ac: f941a674     	ldr	x20, [x19, #0x348]
 46675b0: b4000214     	cbz	x20, 0x46675f0 <_ChromeMain+0x4662354>
 46675b4: 3950e261     	ldrb	w1, [x19, #0x438]
 46675b8: b8350288     	ldadd	w21, w8, [x20]
 46675bc: 7100011f     	cmp	w8, #0x0
 46675c0: 5400020d     	b.le	0x4667600 <_ChromeMain+0x4662364>
 46675c4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46675c8: 6b09011f     	cmp	w8, w9
 46675cc: 54000200     	b.eq	0x466760c <_ChromeMain+0x4662370>
 46675d0: f941a668     	ldr	x8, [x19, #0x348]
 46675d4: f9400508     	ldr	x8, [x8, #0x8]
 46675d8: aa1403e0     	mov	x0, x20
 46675dc: d63f0100     	blr	x8
 46675e0: 12800008     	mov	w8, #-0x1               ; =-1
 46675e4: b8e80288     	ldaddal	w8, w8, [x20]
 46675e8: 7100051f     	cmp	w8, #0x1
 46675ec: 54000160     	b.eq	0x4667618 <_ChromeMain+0x466237c>
 46675f0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46675f4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46675f8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46675fc: d65f03c0     	ret
 4667600: d4200000     	brk	#0
 4667604: d4400000     	hlt	#0
 4667608: d4200020     	brk	#0x1
 466760c: d4200000     	brk	#0
 4667610: d4400000     	hlt	#0
 4667614: d4200020     	brk	#0x1
 4667618: f9400a81     	ldr	x1, [x20, #0x10]
 466761c: aa1403e0     	mov	x0, x20
 4667620: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4667624: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4667628: a8c357f6     	ldp	x22, x21, [sp], #0x30
 466762c: d61f0020     	br	x1
 4667630: d503201f     	nop
 4667634: d503201f     	nop
 4667638: d503201f     	nop
 466763c: 00000000     	udf	#0x0
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
