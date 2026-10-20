
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4667274: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4667278: a9014ff4     	stp	x20, x19, [sp, #0x10]
 466727c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4667280: 910083fd     	add	x29, sp, #0x20
 4667284: 900543b5     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4667288: f94436b3     	ldr	x19, [x21, #0x868]
 466728c: b5000473     	cbnz	x19, 0x4667318 <_ChromeMain+0x466207c>
 4667290: 52800d00     	mov	w0, #0x68               ; =104
 4667294: 96e6a035     	bl	0xf368 <_ChromeMain+0xa0cc>
 4667298: aa0003f3     	mov	x19, x0
 466729c: 9004c321     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 46672a0: 912c7821     	add	x1, x1, #0xb1e
 46672a4: 528008a2     	mov	w2, #0x45               ; =69
 46672a8: 5280daa3     	mov	w3, #0x6d5              ; =1749
 46672ac: 96fb00b3     	bl	0x527578 <_ChromeMain+0x5222dc>
 46672b0: d004f508     	adrp	x8, 0xe509000 <dyld_stub_binder+0xe509000>
 46672b4: 91008108     	add	x8, x8, #0x20
 46672b8: b004c329     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 46672bc: 9100b529     	add	x9, x9, #0x2d
 46672c0: a9002408     	stp	x8, x9, [x0]
 46672c4: 52800268     	mov	w8, #0x13               ; =19
 46672c8: f9000808     	str	x8, [x0, #0x10]
 46672cc: 90054a56     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 46672d0: f94062d4     	ldr	x20, [x22, #0xc0]
 46672d4: b40002d4     	cbz	x20, 0x466732c <_ChromeMain+0x4662090>
 46672d8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 46672dc: f0052a56     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46672e0: f94046c9     	ldr	x9, [x22, #0x88]
 46672e4: eb09011f     	cmp	x8, x9
 46672e8: 54000061     	b.ne	0x46672f4 <_ChromeMain+0x4662058>
 46672ec: aa1403e0     	mov	x0, x20
 46672f0: 96e6b403     	bl	0x142fc <_ChromeMain+0xf060>
 46672f4: f9402660     	ldr	x0, [x19, #0x48]
 46672f8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46672fc: f94046c9     	ldr	x9, [x22, #0x88]
 4667300: eb09011f     	cmp	x8, x9
 4667304: 54000340     	b.eq	0x466736c <_ChromeMain+0x46620d0>
 4667308: f9002674     	str	x20, [x19, #0x48]
 466730c: aa1303e0     	mov	x0, x19
 4667310: 9744fd35     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4667314: f90436b3     	str	x19, [x21, #0x868]
 4667318: aa1303e0     	mov	x0, x19
 466731c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4667320: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4667324: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4667328: d65f03c0     	ret
 466732c: 52800d00     	mov	w0, #0x68               ; =104
 4667330: 96e6a00e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4667334: aa0003f4     	mov	x20, x0
 4667338: d004b6e1     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 466733c: 91242c21     	add	x1, x1, #0x90b
 4667340: 528002a2     	mov	w2, #0x15               ; =21
 4667344: 528029e3     	mov	w3, #0x14f              ; =335
 4667348: 96fb008c     	bl	0x527578 <_ChromeMain+0x5222dc>
 466734c: b004e768     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4667350: 9120e108     	add	x8, x8, #0x838
 4667354: f9000008     	str	x8, [x0]
 4667358: 977439b0     	bl	0x2375a18 <_ChromeMain+0x237077c>
 466735c: aa1403e0     	mov	x0, x20
 4667360: 9744fd21     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4667364: f90062d4     	str	x20, [x22, #0xc0]
 4667368: 17ffffdc     	b	0x46672d8 <_ChromeMain+0x466203c>
 466736c: 96e6edb4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4667370: 17ffffe6     	b	0x4667308 <_ChromeMain+0x466206c>
 4667374: d10203ff     	sub	sp, sp, #0x80
 4667378: a9064ff4     	stp	x20, x19, [sp, #0x60]
 466737c: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4667380: 9101c3fd     	add	x29, sp, #0x70
 4667384: aa0103f3     	mov	x19, x1
 4667388: aa0003f4     	mov	x20, x0
 466738c: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 4667390: f9000fe8     	str	x8, [sp, #0x18]
 4667394: 52b7f008     	mov	w8, #-0x40800000        ; =-1082130432
 4667398: b90027e8     	str	w8, [sp, #0x24]
 466739c: 6f00e400     	movi.2d	v0, #0000000000000000
 46673a0: 3c8283e0     	stur	q0, [sp, #0x28]
 46673a4: 3c8383e0     	stur	q0, [sp, #0x38]
 46673a8: f90027ff     	str	xzr, [sp, #0x48]
 46673ac: 96fce711     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 46673b0: 52801ca1     	mov	w1, #0xe5               ; =229
 46673b4: 97230385     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 46673b8: 971d9e6c     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 46673bc: 2d0107e0     	stp	s0, s1, [sp, #0x8]
 46673c0: 2d020fe2     	stp	s2, s3, [sp, #0x10]
 46673c4: 52806008     	mov	w8, #0x300              ; =768
 46673c8: b90023e8     	str	w8, [sp, #0x20]
 46673cc: b941c688     	ldr	w8, [x20, #0x1c4]
 46673d0: b941c289     	ldr	w9, [x20, #0x1c0]
 46673d4: 0aa97d2a     	bic	w10, w9, w9, asr #31
 46673d8: 1e230140     	ucvtf	s0, w10
 46673dc: 0aa87d08     	bic	w8, w8, w8, asr #31
 46673e0: 1e230101     	ucvtf	s1, w8
 46673e4: 1e3c1002     	fmov	s2, #-0.50000000
 46673e8: 1e222821     	fadd	s1, s1, s2
 46673ec: 1e2c1002     	fmov	s2, #0.50000000
 46673f0: 1e220821     	fmul	s1, s1, s2
 46673f4: 6f00e403     	movi.2d	v3, #0000000000000000
 46673f8: 1e232821     	fadd	s1, s1, s3
 46673fc: 7100053f     	cmp	w9, #0x1
 4667400: 1e20bc60     	fcsel	s0, s3, s0, lt
 4667404: f9406260     	ldr	x0, [x19, #0xc0]
 4667408: 1e222822     	fadd	s2, s1, s2
 466740c: b81e03bf     	stur	wzr, [x29, #-0x20]
 4667410: 2d3c83a1     	stp	s1, s0, [x29, #-0x1c]
 4667414: bc1ec3a2     	stur	s2, [x29, #-0x14]
 4667418: f9400008     	ldr	x8, [x0]
 466741c: f9407108     	ldr	x8, [x8, #0xe0]
 4667420: d10083a1     	sub	x1, x29, #0x20
 4667424: 910023e2     	add	x2, sp, #0x8
 4667428: d63f0100     	blr	x8
 466742c: f94027e0     	ldr	x0, [sp, #0x48]
 4667430: b5000480     	cbnz	x0, 0x46674c0 <_ChromeMain+0x4662224>
 4667434: f94023e0     	ldr	x0, [sp, #0x40]
 4667438: b5000320     	cbnz	x0, 0x466749c <_ChromeMain+0x4662200>
 466743c: f9401fe0     	ldr	x0, [sp, #0x38]
 4667440: b5000640     	cbnz	x0, 0x4667508 <_ChromeMain+0x466226c>
 4667444: f9401be0     	ldr	x0, [sp, #0x30]
 4667448: b50000e0     	cbnz	x0, 0x4667464 <_ChromeMain+0x46621c8>
 466744c: f94017e0     	ldr	x0, [sp, #0x28]
 4667450: b50004a0     	cbnz	x0, 0x46674e4 <_ChromeMain+0x4662248>
 4667454: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4667458: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 466745c: 910203ff     	add	sp, sp, #0x80
 4667460: d65f03c0     	ret
 4667464: 91002008     	add	x8, x0, #0x8
 4667468: 12800009     	mov	w9, #-0x1               ; =-1
 466746c: b8e90108     	ldaddal	w9, w8, [x8]
 4667470: 7100051f     	cmp	w8, #0x1
 4667474: 54fffec1     	b.ne	0x466744c <_ChromeMain+0x46621b0>
 4667478: f9400009     	ldr	x9, [x0]
 466747c: f9400928     	ldr	x8, [x9, #0x10]
 4667480: d0fdcdea     	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 4667484: 9106014a     	add	x10, x10, #0x180
 4667488: eb0a011f     	cmp	x8, x10
 466748c: 54000041     	b.ne	0x4667494 <_ChromeMain+0x46621f8>
 4667490: f9400528     	ldr	x8, [x9, #0x8]
 4667494: d63f0100     	blr	x8
 4667498: 17ffffed     	b	0x466744c <_ChromeMain+0x46621b0>
 466749c: 91002008     	add	x8, x0, #0x8
 46674a0: 12800009     	mov	w9, #-0x1               ; =-1
 46674a4: b8e90108     	ldaddal	w9, w8, [x8]
 46674a8: 7100051f     	cmp	w8, #0x1
 46674ac: 54fffc81     	b.ne	0x466743c <_ChromeMain+0x46621a0>
 46674b0: f9400008     	ldr	x8, [x0]
 46674b4: f9400908     	ldr	x8, [x8, #0x10]
 46674b8: d63f0100     	blr	x8
 46674bc: 17ffffe0     	b	0x466743c <_ChromeMain+0x46621a0>
 46674c0: 91002008     	add	x8, x0, #0x8
 46674c4: 12800009     	mov	w9, #-0x1               ; =-1
 46674c8: b8e90108     	ldaddal	w9, w8, [x8]
 46674cc: 7100051f     	cmp	w8, #0x1
 46674d0: 54fffb21     	b.ne	0x4667434 <_ChromeMain+0x4662198>
 46674d4: f9400008     	ldr	x8, [x0]
 46674d8: f9400908     	ldr	x8, [x8, #0x10]
 46674dc: d63f0100     	blr	x8
 46674e0: 17ffffd5     	b	0x4667434 <_ChromeMain+0x4662198>
 46674e4: 91002008     	add	x8, x0, #0x8
 46674e8: 12800009     	mov	w9, #-0x1               ; =-1
 46674ec: b8e90108     	ldaddal	w9, w8, [x8]
 46674f0: 7100051f     	cmp	w8, #0x1
 46674f4: 54fffb01     	b.ne	0x4667454 <_ChromeMain+0x46621b8>
 46674f8: f9400008     	ldr	x8, [x0]
 46674fc: f9400908     	ldr	x8, [x8, #0x10]
 4667500: d63f0100     	blr	x8
 4667504: 17ffffd4     	b	0x4667454 <_ChromeMain+0x46621b8>
 4667508: 91002008     	add	x8, x0, #0x8
 466750c: 12800009     	mov	w9, #-0x1               ; =-1
 4667510: b8e90108     	ldaddal	w9, w8, [x8]
 4667514: 7100051f     	cmp	w8, #0x1
 4667518: 54fff961     	b.ne	0x4667444 <_ChromeMain+0x46621a8>
 466751c: f9400008     	ldr	x8, [x0]
 4667520: f9400908     	ldr	x8, [x8, #0x10]
 4667524: d63f0100     	blr	x8
 4667528: 17ffffc7     	b	0x4667444 <_ChromeMain+0x46621a8>
