
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4659080: d102c3ff     	sub	sp, sp, #0xb0
 4659084: a9056ffc     	stp	x28, x27, [sp, #0x50]
 4659088: a90667fa     	stp	x26, x25, [sp, #0x60]
 465908c: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4659090: a90857f6     	stp	x22, x21, [sp, #0x80]
 4659094: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4659098: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 465909c: 910283fd     	add	x29, sp, #0xa0
 46590a0: aa0003f6     	mov	x22, x0
 46590a4: b0054468     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 46590a8: f9467d00     	ldr	x0, [x8, #0xcf8]
 46590ac: b4000a20     	cbz	x0, 0x46591f0 <_ChromeMain+0x4653f54>
 46590b0: aa0303f4     	mov	x20, x3
 46590b4: aa0203f3     	mov	x19, x2
 46590b8: aa0103f5     	mov	x21, x1
 46590bc: 974f1aaf     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 46590c0: b4000980     	cbz	x0, 0x46591f0 <_ChromeMain+0x4653f54>
 46590c4: 974f1ad3     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 46590c8: 97ea91a1     	bl	0x40fd74c <_ChromeMain+0x40f84b0>
 46590cc: f100081f     	cmp	x0, #0x2
 46590d0: 54000903     	b.lo	0x46591f0 <_ChromeMain+0x4653f54>
 46590d4: 39805ea8     	ldrsb	x8, [x21, #0x17]
 46590d8: b7f809c8     	tbnz	x8, #0x3f, 0x4659210 <_ChromeMain+0x4653f74>
 46590dc: aa0803e9     	mov	x9, x8
 46590e0: 71000e9f     	cmp	w20, #0x3
 46590e4: 5400086c     	b.gt	0x46591f0 <_ChromeMain+0x4653f54>
 46590e8: b4000849     	cbz	x9, 0x46591f0 <_ChromeMain+0x4653f54>
 46590ec: f94572db     	ldr	x27, [x22, #0xae0]
 46590f0: f94576ca     	ldr	x10, [x22, #0xae8]
 46590f4: 8b0a054b     	add	x11, x10, x10, lsl #1
 46590f8: d37df16b     	lsl	x11, x11, #3
 46590fc: b5000c8b     	cbnz	x11, 0x465928c <_ChromeMain+0x4653ff0>
 4659100: aa1b03eb     	mov	x11, x27
 4659104: 5280030c     	mov	w12, #0x18              ; =24
 4659108: 9b0c6d49     	madd	x9, x10, x12, x27
 465910c: eb09017f     	cmp	x11, x9
 4659110: 54000981     	b.ne	0x4659240 <_ChromeMain+0x4653fa4>
 4659114: 912b82c0     	add	x0, x22, #0xae0
 4659118: aa1503e1     	mov	x1, x21
 465911c: aa1503e2     	mov	x2, x21
 4659120: 94b66f71     	bl	0x73f4ee4 <_ChromeMain+0x73efc48>
 4659124: d0053540     	adrp	x0, 0xed03000 <dyld_stub_binder+0xed03000>
 4659128: 91360000     	add	x0, x0, #0xd80
 465912c: f9400008     	ldr	x8, [x0]
 4659130: d63f0100     	blr	x8
 4659134: f9400008     	ldr	x8, [x0]
 4659138: b4000788     	cbz	x8, 0x4659228 <_ChromeMain+0x4653f8c>
 465913c: f9400117     	ldr	x23, [x8]
 4659140: b4000757     	cbz	x23, 0x4659228 <_ChromeMain+0x4653f8c>
 4659144: d004c380     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4659148: 9139e000     	add	x0, x0, #0xe78
 465914c: d004c381     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4659150: 912c7821     	add	x1, x1, #0xb1e
 4659154: 9100c3e8     	add	x8, sp, #0x30
 4659158: 52876562     	mov	w2, #0x3b2b             ; =15147
 465915c: 96e7dec9     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4659160: f94a06d8     	ldr	x24, [x22, #0x1408]
 4659164: b40000d8     	cbz	x24, 0x465917c <_ChromeMain+0x4653ee0>
 4659168: 52800028     	mov	w8, #0x1                ; =1
 465916c: b8280308     	ldadd	w8, w8, [x24]
 4659170: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4659174: 6b09011f     	cmp	w8, w9
 4659178: 540005e0     	b.eq	0x4659234 <_ChromeMain+0x4653f98>
 465917c: f94a0ad9     	ldr	x25, [x22, #0x1410]
 4659180: 52800b00     	mov	w0, #0x58               ; =88
 4659184: 96e6d879     	bl	0xf368 <_ChromeMain+0xa0cc>
 4659188: aa0003f6     	mov	x22, x0
 465918c: 52800028     	mov	w8, #0x1                ; =1
 4659190: b9000008     	str	w8, [x0]
 4659194: 1013e768     	adr	x8, 0x4680e80 <_ChromeMain+0x467bbe4>
 4659198: d503201f     	nop
 465919c: 10141749     	adr	x9, 0x4681484 <_ChromeMain+0x467c1e8>
 46591a0: d503201f     	nop
 46591a4: a900a408     	stp	x8, x9, [x0, #0x8]
 46591a8: 90fef828     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 46591ac: 912c0108     	add	x8, x8, #0xb00
 46591b0: f9000c08     	str	x8, [x0, #0x18]
 46591b4: a902e418     	stp	x24, x25, [x0, #0x28]
 46591b8: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 46591bc: 37f802e8     	tbnz	w8, #0x1f, 0x4659218 <_ChromeMain+0x4653f7c>
 46591c0: 3dc002a0     	ldr	q0, [x21]
 46591c4: 3c8382c0     	stur	q0, [x22, #0x38]
 46591c8: f9400aa8     	ldr	x8, [x21, #0x10]
 46591cc: f80482c8     	stur	x8, [x22, #0x48]
 46591d0: b90052d4     	str	w20, [x22, #0x50]
 46591d4: f94002e8     	ldr	x8, [x23]
 46591d8: f9400108     	ldr	x8, [x8]
 46591dc: 9100c3e1     	add	x1, sp, #0x30
 46591e0: aa1703e0     	mov	x0, x23
 46591e4: aa1603e2     	mov	x2, x22
 46591e8: aa1303e3     	mov	x3, x19
 46591ec: d63f0100     	blr	x8
 46591f0: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 46591f4: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 46591f8: a94857f6     	ldp	x22, x21, [sp, #0x80]
 46591fc: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 4659200: a94667fa     	ldp	x26, x25, [sp, #0x60]
 4659204: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 4659208: 9102c3ff     	add	sp, sp, #0xb0
 465920c: d65f03c0     	ret
 4659210: f94006a9     	ldr	x9, [x21, #0x8]
 4659214: 17ffffb3     	b	0x46590e0 <_ChromeMain+0x4653e44>
 4659218: a9400aa1     	ldp	x1, x2, [x21]
 465921c: 9100e2c0     	add	x0, x22, #0x38
 4659220: 96e6fbfe     	bl	0x18218 <_ChromeMain+0x12f7c>
 4659224: 17ffffeb     	b	0x46591d0 <_ChromeMain+0x4653f34>
 4659228: d4200000     	brk	#0
 465922c: d4400000     	hlt	#0
 4659230: d4200020     	brk	#0x1
 4659234: d4200000     	brk	#0
 4659238: d4400000     	hlt	#0
 465923c: d4200020     	brk	#0x1
 4659240: 7100011f     	cmp	w8, #0x0
 4659244: a9402aa9     	ldp	x9, x10, [x21]
 4659248: 9a954120     	csel	x0, x9, x21, mi
 465924c: 9a884157     	csel	x23, x10, x8, mi
 4659250: 39805d68     	ldrsb	x8, [x11, #0x17]
 4659254: a9402969     	ldp	x9, x10, [x11]
 4659258: f100011f     	cmp	x8, #0x0
 465925c: 9a8b4121     	csel	x1, x9, x11, mi
 4659260: 7100011f     	cmp	w8, #0x0
 4659264: 9a884158     	csel	x24, x10, x8, mi
 4659268: eb17031f     	cmp	x24, x23
 465926c: 9a973302     	csel	x2, x24, x23, lo
 4659270: 94e6c17c     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4659274: 34000060     	cbz	w0, 0x4659280 <_ChromeMain+0x4653fe4>
 4659278: 37fff4e0     	tbnz	w0, #0x1f, 0x4659114 <_ChromeMain+0x4653e78>
 465927c: 17ffffdd     	b	0x46591f0 <_ChromeMain+0x4653f54>
 4659280: eb1802ff     	cmp	x23, x24
 4659284: 54fff483     	b.lo	0x4659114 <_ChromeMain+0x4653e78>
 4659288: 17ffffda     	b	0x46591f0 <_ChromeMain+0x4653f54>
 465928c: 9343fd6b     	asr	x11, x11, #3
 4659290: b201f3ec     	mov	x12, #-0x5555555555555556 ; =-6148914691236517206
 4659294: f295556c     	movk	x12, #0xaaab
 4659298: 9b0c7d78     	mul	x24, x11, x12
 465929c: 7100011f     	cmp	w8, #0x0
 46592a0: a94032ab     	ldp	x11, x12, [x21]
 46592a4: 9a954169     	csel	x9, x11, x21, mi
 46592a8: 9a88418b     	csel	x11, x12, x8, mi
 46592ac: a901a7eb     	stp	x11, x9, [sp, #0x18]
 46592b0: aa1b03eb     	mov	x11, x27
 46592b4: f9400ffc     	ldr	x28, [sp, #0x18]
 46592b8: f9000bea     	str	x10, [sp, #0x10]
 46592bc: f90017e8     	str	x8, [sp, #0x28]
 46592c0: d341ff0a     	lsr	x10, x24, #1
 46592c4: f90007ea     	str	x10, [sp, #0x8]
 46592c8: 52800308     	mov	w8, #0x18               ; =24
 46592cc: 9b082d59     	madd	x25, x10, x8, x11
 46592d0: 39805f2c     	ldrsb	x12, [x25, #0x17]
 46592d4: a9403b2d     	ldp	x13, x14, [x25]
 46592d8: f100019f     	cmp	x12, #0x0
 46592dc: 9a9941a0     	csel	x0, x13, x25, mi
 46592e0: 7100019f     	cmp	w12, #0x0
 46592e4: 9a8c41da     	csel	x26, x14, x12, mi
 46592e8: eb1a039f     	cmp	x28, x26
 46592ec: 9a9a3382     	csel	x2, x28, x26, lo
 46592f0: f94013e1     	ldr	x1, [sp, #0x20]
 46592f4: aa0b03f7     	mov	x23, x11
 46592f8: 94e6c15a     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46592fc: a940abef     	ldp	x15, x10, [sp, #0x8]
 4659300: f94017e8     	ldr	x8, [sp, #0x28]
 4659304: eb1c035f     	cmp	x26, x28
 4659308: 1280000c     	mov	w12, #-0x1              ; =-1
 465930c: 5a8c358c     	cneg	w12, w12, hs
 4659310: 1a8c03ec     	csel	w12, wzr, w12, eq
 4659314: 7100001f     	cmp	w0, #0x0
 4659318: 1a8c100c     	csel	w12, w0, w12, ne
 465931c: 9100632d     	add	x13, x25, #0x18
 4659320: aa2f03ee     	mvn	x14, x15
 4659324: 8b0e030e     	add	x14, x24, x14
 4659328: 7100019f     	cmp	w12, #0x0
 465932c: 9a8f41d8     	csel	x24, x14, x15, mi
 4659330: 9a9741ab     	csel	x11, x13, x23, mi
 4659334: b5fffc38     	cbnz	x24, 0x46592b8 <_ChromeMain+0x465401c>
 4659338: 17ffff73     	b	0x4659104 <_ChromeMain+0x4653e68>
