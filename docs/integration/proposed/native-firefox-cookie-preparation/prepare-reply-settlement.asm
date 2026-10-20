
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4263f48: d101c3ff     	sub	sp, sp, #0x70
 4263f4c: a90267fa     	stp	x26, x25, [sp, #0x20]
 4263f50: a9035ff8     	stp	x24, x23, [sp, #0x30]
 4263f54: a90457f6     	stp	x22, x21, [sp, #0x40]
 4263f58: a9054ff4     	stp	x20, x19, [sp, #0x50]
 4263f5c: a9067bfd     	stp	x29, x30, [sp, #0x60]
 4263f60: 910183fd     	add	x29, sp, #0x60
 4263f64: aa0203f5     	mov	x21, x2
 4263f68: aa0103f6     	mov	x22, x1
 4263f6c: aa0003f4     	mov	x20, x0
 4263f70: 9004c5e0     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4263f74: 9133c800     	add	x0, x0, #0xcf2
 4263f78: 9004c5e1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4263f7c: 91342021     	add	x1, x1, #0xd08
 4263f80: 910003e8     	mov	x8, sp
 4263f84: 52802a42     	mov	w2, #0x152              ; =338
 4263f88: 96f7b33e     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4263f8c: 52800800     	mov	w0, #0x40               ; =64
 4263f90: 96f6acf6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4263f94: aa0003f3     	mov	x19, x0
 4263f98: 52800038     	mov	w24, #0x1               ; =1
 4263f9c: b9000018     	str	w24, [x0]
 4263fa0: f0fee968     	adrp	x8, 0x1f92000 <_ChromeMain+0x1f8cd64>
 4263fa4: 91220108     	add	x8, x8, #0x880
 4263fa8: d0ffeaa9     	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 4263fac: 91310129     	add	x9, x9, #0xc40
 4263fb0: a900a408     	stp	x8, x9, [x0, #0x8]
 4263fb4: d0ff17d7     	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 4263fb8: 912c02f7     	add	x23, x23, #0xb00
 4263fbc: 10fe3c28     	adr	x8, 0x4260740 <_ChromeMain+0x425b4a4>
 4263fc0: d503201f     	nop
 4263fc4: a901a017     	stp	x23, x8, [x0, #0x18]
 4263fc8: 3dc002c0     	ldr	q0, [x22]
 4263fcc: 3c828000     	stur	q0, [x0, #0x28]
 4263fd0: f9400ac8     	ldr	x8, [x22, #0x10]
 4263fd4: f9001c08     	str	x8, [x0, #0x38]
 4263fd8: a9007edf     	stp	xzr, xzr, [x22]
 4263fdc: f9000adf     	str	xzr, [x22, #0x10]
 4263fe0: f9405a96     	ldr	x22, [x20, #0xb0]
 4263fe4: b40000b6     	cbz	x22, 0x4263ff8 <_ChromeMain+0x425ed5c>
 4263fe8: b83802c8     	ldadd	w24, w8, [x22]
 4263fec: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4263ff0: 6b09011f     	cmp	w8, w9
 4263ff4: 540008a0     	b.eq	0x4264108 <_ChromeMain+0x425ee6c>
 4263ff8: f9405e99     	ldr	x25, [x20, #0xb8]
 4263ffc: 52800900     	mov	w0, #0x48               ; =72
 4264000: 96f6acda     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264004: aa0003f4     	mov	x20, x0
 4264008: b9000018     	str	w24, [x0]
 426400c: 10005ca8     	adr	x8, 0x4264ba0 <_ChromeMain+0x425f904>
 4264010: d503201f     	nop
 4264014: f0ffe869     	adrp	x9, 0x3f73000 <_ChromeMain+0x3f6dd64>
 4264018: 912e0129     	add	x9, x9, #0xb80
 426401c: a900a408     	stp	x8, x9, [x0, #0x8]
 4264020: d0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4264024: 911b0108     	add	x8, x8, #0x6c0
 4264028: 10000769     	adr	x9, 0x4264114 <_ChromeMain+0x425ee78>
 426402c: d503201f     	nop
 4264030: a901a408     	stp	x8, x9, [x0, #0x18]
 4264034: a902d81f     	stp	xzr, x22, [x0, #0x28]
 4264038: a903d419     	stp	x25, x21, [x0, #0x38]
 426403c: 52800100     	mov	w0, #0x8                ; =8
 4264040: 96f6acca     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264044: aa0003f5     	mov	x21, x0
 4264048: f900001f     	str	xzr, [x0]
 426404c: 52800700     	mov	w0, #0x38               ; =56
 4264050: 96f6acc6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264054: aa0003f6     	mov	x22, x0
 4264058: b0fea208     	adrp	x8, 0x16a5000 <_ChromeMain+0x169fd64>
 426405c: 91190108     	add	x8, x8, #0x640
 4264060: b0ffea29     	adrp	x9, 0x3fa9000 <_ChromeMain+0x3fa3d64>
 4264064: 91290129     	add	x9, x9, #0xa40
 4264068: b9000018     	str	w24, [x0]
 426406c: a900a408     	stp	x8, x9, [x0, #0x8]
 4264070: 10006bc8     	adr	x8, 0x4264de8 <_ChromeMain+0x425fb4c>
 4264074: d503201f     	nop
 4264078: a901a017     	stp	x23, x8, [x0, #0x18]
 426407c: f9001413     	str	x19, [x0, #0x28]
 4264080: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 4264084: d0054a69     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4264088: f9404529     	ldr	x9, [x9, #0x88]
 426408c: eb09011f     	cmp	x8, x9
 4264090: 54000061     	b.ne	0x426409c <_ChromeMain+0x425ee00>
 4264094: aa1503e0     	mov	x0, x21
 4264098: 96f6c099     	bl	0x142fc <_ChromeMain+0xf060>
 426409c: f9001ad5     	str	x21, [x22, #0x30]
 42640a0: 52800700     	mov	w0, #0x38               ; =56
 42640a4: 96f6acb1     	bl	0xf368 <_ChromeMain+0xa0cc>
 42640a8: aa0003e3     	mov	x3, x0
 42640ac: 52800028     	mov	w8, #0x1                ; =1
 42640b0: b9000008     	str	w8, [x0]
 42640b4: b0feab08     	adrp	x8, 0x17c5000 <_ChromeMain+0x17bfd64>
 42640b8: 91380108     	add	x8, x8, #0xe00
 42640bc: 10008b29     	adr	x9, 0x4265220 <_ChromeMain+0x425ff84>
 42640c0: d503201f     	nop
 42640c4: a900a408     	stp	x8, x9, [x0, #0x8]
 42640c8: 10007e48     	adr	x8, 0x4265090 <_ChromeMain+0x425fdf4>
 42640cc: d503201f     	nop
 42640d0: a901a017     	stp	x23, x8, [x0, #0x18]
 42640d4: a902d414     	stp	x20, x21, [x0, #0x28]
 42640d8: 90046521     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42640dc: 91057421     	add	x1, x1, #0x15d
 42640e0: 910003e0     	mov	x0, sp
 42640e4: aa1603e2     	mov	x2, x22
 42640e8: 97851b27     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 42640ec: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 42640f0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 42640f4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 42640f8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 42640fc: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4264100: 9101c3ff     	add	sp, sp, #0x70
 4264104: d65f03c0     	ret
 4264108: d4200000     	brk	#0
 426410c: d4400000     	hlt	#0
 4264110: d4200020     	brk	#0x1
 4264114: d10683ff     	sub	sp, sp, #0x1a0
 4264118: a9146ffc     	stp	x28, x27, [sp, #0x140]
 426411c: a91567fa     	stp	x26, x25, [sp, #0x150]
 4264120: a9165ff8     	stp	x24, x23, [sp, #0x160]
 4264124: a91757f6     	stp	x22, x21, [sp, #0x170]
 4264128: a9184ff4     	stp	x20, x19, [sp, #0x180]
 426412c: a9197bfd     	stp	x29, x30, [sp, #0x190]
 4264130: 910643fd     	add	x29, sp, #0x190
 4264134: aa0103f3     	mov	x19, x1
 4264138: 3940b008     	ldrb	w8, [x0, #0x2c]
 426413c: 37000288     	tbnz	w8, #0x0, 0x426418c <_ChromeMain+0x425eef0>
 4264140: b4001353     	cbz	x19, 0x42643a8 <_ChromeMain+0x425f10c>
 4264144: f9400668     	ldr	x8, [x19, #0x8]
 4264148: aa1303e0     	mov	x0, x19
 426414c: 52800001     	mov	w1, #0x0                ; =0
 4264150: d63f0100     	blr	x8
 4264154: 12800008     	mov	w8, #-0x1               ; =-1
 4264158: b8e80268     	ldaddal	w8, w8, [x19]
 426415c: 7100051f     	cmp	w8, #0x1
 4264160: 54000421     	b.ne	0x42641e4 <_ChromeMain+0x425ef48>
 4264164: f9400a61     	ldr	x1, [x19, #0x10]
 4264168: aa1303e0     	mov	x0, x19
 426416c: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 4264170: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 4264174: a95757f6     	ldp	x22, x21, [sp, #0x170]
 4264178: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 426417c: a95567fa     	ldp	x26, x25, [sp, #0x150]
 4264180: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 4264184: 910683ff     	add	sp, sp, #0x1a0
 4264188: d61f0020     	br	x1
 426418c: aa0203f5     	mov	x21, x2
 4264190: aa0003f4     	mov	x20, x0
 4264194: 39400048     	ldrb	w8, [x2]
 4264198: 37000448     	tbnz	w8, #0x0, 0x4264220 <_ChromeMain+0x425ef84>
 426419c: 52800028     	mov	w8, #0x1                ; =1
 42641a0: 7802f288     	sturh	w8, [x20, #0x2f]
 42641a4: b4001093     	cbz	x19, 0x42643b4 <_ChromeMain+0x425f118>
 42641a8: 17ffffe7     	b	0x4264144 <_ChromeMain+0x425eea8>
 42641ac: 52802028     	mov	w8, #0x101              ; =257
 42641b0: 7802f288     	sturh	w8, [x20, #0x2f]
 42641b4: b40010d3     	cbz	x19, 0x42643cc <_ChromeMain+0x425f130>
 42641b8: f9400668     	ldr	x8, [x19, #0x8]
 42641bc: aa1303e0     	mov	x0, x19
 42641c0: 52800021     	mov	w1, #0x1                ; =1
 42641c4: d63f0100     	blr	x8
 42641c8: 12800008     	mov	w8, #-0x1               ; =-1
 42641cc: b8e80268     	ldaddal	w8, w8, [x19]
 42641d0: 7100051f     	cmp	w8, #0x1
 42641d4: 54000081     	b.ne	0x42641e4 <_ChromeMain+0x425ef48>
 42641d8: f9400a68     	ldr	x8, [x19, #0x10]
 42641dc: aa1303e0     	mov	x0, x19
 42641e0: d63f0100     	blr	x8
 42641e4: a9597bfd     	ldp	x29, x30, [sp, #0x190]
 42641e8: a9584ff4     	ldp	x20, x19, [sp, #0x180]
 42641ec: a95757f6     	ldp	x22, x21, [sp, #0x170]
 42641f0: a9565ff8     	ldp	x24, x23, [sp, #0x160]
 42641f4: a95567fa     	ldp	x26, x25, [sp, #0x150]
 42641f8: a9546ffc     	ldp	x28, x27, [sp, #0x140]
 42641fc: 910683ff     	add	sp, sp, #0x1a0
 4264200: d65f03c0     	ret
 4264204: 52800028     	mov	w8, #0x1                ; =1
 4264208: 7802f288     	sturh	w8, [x20, #0x2f]
 426420c: b4000db3     	cbz	x19, 0x42643c0 <_ChromeMain+0x425f124>
 4264210: f9400668     	ldr	x8, [x19, #0x8]
 4264214: aa1303e0     	mov	x0, x19
 4264218: 52800001     	mov	w1, #0x0                ; =0
 426421c: 17ffffea     	b	0x42641c4 <_ChromeMain+0x425ef28>
 4264220: f94006a8     	ldr	x8, [x21, #0x8]
 4264224: 90056529     	adrp	x9, 0xef08000 <dyld_stub_binder+0xef08000>
 4264228: b940b129     	ldr	w9, [x9, #0xb0]
 426422c: f100011f     	cmp	x8, #0x0
 4264230: 7a411920     	ccmp	w9, #0x1, #0x0, ne
 4264234: 5400038c     	b.gt	0x42642a4 <_ChromeMain+0x425f008>
 4264238: b0054a68     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 426423c: b94b8908     	ldr	w8, [x8, #0xb88]
 4264240: 90056529     	adrp	x9, 0xef08000 <dyld_stub_binder+0xef08000>
 4264244: f9405d29     	ldr	x9, [x9, #0xb8]
 4264248: 7100011f     	cmp	w8, #0x0
 426424c: fa400920     	ccmp	x9, #0x0, #0x0, eq
 4264250: 540002a0     	b.eq	0x42642a4 <_ChromeMain+0x425f008>
 4264254: f004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4264258: 91342021     	add	x1, x1, #0xd08
 426425c: 910003f6     	mov	x22, sp
 4264260: 910003e0     	mov	x0, sp
 4264264: 52802d62     	mov	w2, #0x16b              ; =363
 4264268: 52800023     	mov	w3, #0x1                ; =1
 426426c: 970e93b8     	bl	0x60914c <_ChromeMain+0x603eb0>
 4264270: f004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4264274: 91354421     	add	x1, x1, #0xd51
 4264278: 910042c0     	add	x0, x22, #0x10
 426427c: 52800102     	mov	w2, #0x8                ; =8
 4264280: 96f7048f     	bl	0x254bc <_ChromeMain+0x20220>
 4264284: f94006a1     	ldr	x1, [x21, #0x8]
 4264288: 9783dd6d     	bl	0x235b83c <_ChromeMain+0x23565a0>
 426428c: f004c5c1     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4264290: 91356821     	add	x1, x1, #0xd5a
 4264294: 528004e2     	mov	w2, #0x27               ; =39
 4264298: 96f70489     	bl	0x254bc <_ChromeMain+0x20220>
 426429c: 910003e0     	mov	x0, sp
 42642a0: 970e9378     	bl	0x609080 <_ChromeMain+0x603de4>
 42642a4: f9400ea8     	ldr	x8, [x21, #0x18]
 42642a8: b4fff828     	cbz	x8, 0x42641ac <_ChromeMain+0x425ef10>
 42642ac: f9401280     	ldr	x0, [x20, #0x20]
 42642b0: b4fffaa0     	cbz	x0, 0x4264204 <_ChromeMain+0x425ef68>
 42642b4: 973d17a5     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 42642b8: b4fffa60     	cbz	x0, 0x4264204 <_ChromeMain+0x425ef68>
 42642bc: 97a0fd39     	bl	0x2aa37a0 <_ChromeMain+0x2a9e504>
 42642c0: b4fffa20     	cbz	x0, 0x4264204 <_ChromeMain+0x425ef68>
 42642c4: 6f00e400     	movi.2d	v0, #0000000000000000
 42642c8: ad0003e0     	stp	q0, q0, [sp]
 42642cc: 52800037     	mov	w23, #0x1               ; =1
 42642d0: 390073f7     	strb	w23, [sp, #0x1c]
 42642d4: 390003ff     	strb	wzr, [sp]
 42642d8: 0f000440     	movi.2s	v0, #0x2
 42642dc: fc0043e0     	stur	d0, [sp, #0x4]
 42642e0: f800c3ff     	stur	xzr, [sp, #0xc]
 42642e4: f80143ff     	stur	xzr, [sp, #0x14]
 42642e8: f9400ea8     	ldr	x8, [x21, #0x18]
 42642ec: f9001e88     	str	x8, [x20, #0x38]
 42642f0: 52803509     	mov	w9, #0x1a8              ; =424
 42642f4: 9b097d08     	mul	x8, x8, x9
 42642f8: b40004a8     	cbz	x8, 0x426438c <_ChromeMain+0x425f0f0>
 42642fc: aa0003f6     	mov	x22, x0
 4264300: f9400ab5     	ldr	x21, [x21, #0x10]
 4264304: 8b0802ba     	add	x26, x21, x8
 4264308: 1000069c     	adr	x28, 0x42643d8 <_ChromeMain+0x425f13c>
 426430c: d503201f     	nop
 4264310: 12b00018     	mov	w24, #0x7fffffff        ; =2147483647
 4264314: f9405a99     	ldr	x25, [x20, #0xb0]
 4264318: b4000099     	cbz	x25, 0x4264328 <_ChromeMain+0x425f08c>
 426431c: b8370328     	ldadd	w23, w8, [x25]
 4264320: 6b18011f     	cmp	w8, w24
 4264324: 540003c0     	b.eq	0x426439c <_ChromeMain+0x425f100>
 4264328: f9405e9b     	ldr	x27, [x20, #0xb8]
 426432c: 52800800     	mov	w0, #0x40               ; =64
 4264330: 96f6ac0e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4264334: aa0003e4     	mov	x4, x0
 4264338: b9000017     	str	w23, [x0]
 426433c: 100050e9     	adr	x9, 0x4264d58 <_ChromeMain+0x425fabc>
 4264340: d503201f     	nop
 4264344: 90ffe848     	adrp	x8, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4264348: 912b0108     	add	x8, x8, #0xac0
 426434c: a900a009     	stp	x9, x8, [x0, #0x8]
 4264350: d0fff248     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4264354: 911b0108     	add	x8, x8, #0x6c0
 4264358: a901f008     	stp	x8, x28, [x0, #0x18]
 426435c: a902e41f     	stp	xzr, x25, [x0, #0x28]
 4264360: f9001c1b     	str	x27, [x0, #0x38]
 4264364: f94002c8     	ldr	x8, [x22]
 4264368: f9401508     	ldr	x8, [x8, #0x28]
 426436c: 9104c2a2     	add	x2, x21, #0x130
 4264370: 910003e3     	mov	x3, sp
 4264374: aa1603e0     	mov	x0, x22
 4264378: aa1503e1     	mov	x1, x21
 426437c: d63f0100     	blr	x8
 4264380: 9106a2b5     	add	x21, x21, #0x1a8
 4264384: eb1a02bf     	cmp	x21, x26
 4264388: 54fffc61     	b.ne	0x4264314 <_ChromeMain+0x425f078>
 426438c: b5fff173     	cbnz	x19, 0x42641b8 <_ChromeMain+0x425ef1c>
 4264390: d4200000     	brk	#0
 4264394: d4400000     	hlt	#0
 4264398: d4200020     	brk	#0x1
 426439c: d4200000     	brk	#0
 42643a0: d4400000     	hlt	#0
 42643a4: d4200020     	brk	#0x1
 42643a8: d4200000     	brk	#0
 42643ac: d4400000     	hlt	#0
 42643b0: d4200020     	brk	#0x1
 42643b4: d4200000     	brk	#0
 42643b8: d4400000     	hlt	#0
 42643bc: d4200020     	brk	#0x1
 42643c0: d4200000     	brk	#0
 42643c4: d4400000     	hlt	#0
 42643c8: d4200020     	brk	#0x1
 42643cc: d4200000     	brk	#0
 42643d0: d4400000     	hlt	#0
 42643d4: d4200020     	brk	#0x1
 42643d8: 3940b008     	ldrb	w8, [x0, #0x2c]
 42643dc: 34000168     	cbz	w8, 0x4264408 <_ChromeMain+0x425f16c>
 42643e0: f9401c08     	ldr	x8, [x0, #0x38]
 42643e4: b4000128     	cbz	x8, 0x4264408 <_ChromeMain+0x425f16c>
 42643e8: b9400029     	ldr	w9, [x1]
 42643ec: 35000089     	cbnz	w9, 0x42643fc <_ChromeMain+0x425f160>
 42643f0: f9402009     	ldr	x9, [x0, #0x40]
 42643f4: 91000529     	add	x9, x9, #0x1
 42643f8: f9002009     	str	x9, [x0, #0x40]
 42643fc: f1000508     	subs	x8, x8, #0x1
 4264400: f9001c08     	str	x8, [x0, #0x38]
 4264404: 54000040     	b.eq	0x426440c <_ChromeMain+0x425f170>
 4264408: d65f03c0     	ret
 426440c: 52800028     	mov	w8, #0x1                ; =1
 4264410: 3900bc08     	strb	w8, [x0, #0x2f]
 4264414: f9402008     	ldr	x8, [x0, #0x40]
 4264418: f100011f     	cmp	x8, #0x0
 426441c: 1a9f07e9     	cset	w9, ne
 4264420: 3900c009     	strb	w9, [x0, #0x30]
 4264424: 3940b809     	ldrb	w9, [x0, #0x2e]
 4264428: 34ffff09     	cbz	w9, 0x4264408 <_ChromeMain+0x425f16c>
 426442c: 3940c809     	ldrb	w9, [x0, #0x32]
 4264430: 34fffec9     	cbz	w9, 0x4264408 <_ChromeMain+0x425f16c>
 4264434: 3940b409     	ldrb	w9, [x0, #0x2d]
 4264438: 34000089     	cbz	w9, 0x4264448 <_ChromeMain+0x425f1ac>
 426443c: b4000068     	cbz	x8, 0x4264448 <_ChromeMain+0x425f1ac>
 4264440: 3940cc08     	ldrb	w8, [x0, #0x33]
 4264444: 37000048     	tbnz	w8, #0x0, 0x426444c <_ChromeMain+0x425f1b0>
 4264448: 17fffcfe     	b	0x4263840 <_ChromeMain+0x425e5a4>
 426444c: 14000001     	b	0x4264450 <_ChromeMain+0x425f1b4>
