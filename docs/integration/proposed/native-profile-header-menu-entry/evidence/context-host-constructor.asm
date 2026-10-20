
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4572f28: f9416660     	ldr	x0, [x19, #0x2c8]
 4572f2c: b4000400     	cbz	x0, 0x4572fac <_ChromeMain+0x456dd10>
 4572f30: 52800f41     	mov	w1, #0x7a               ; =122
 4572f34: 97446d6b     	bl	0x168e4e0 <_ChromeMain+0x1689244>
 4572f38: f9416676     	ldr	x22, [x19, #0x2c8]
 4572f3c: b4009856     	cbz	x22, 0x4574244 <_ChromeMain+0x456efa8>
 4572f40: 71001ebf     	cmp	w21, #0x7
 4572f44: 5400044c     	b.gt	0x4572fcc <_ChromeMain+0x456dd30>
 4572f48: 34000ef5     	cbz	w21, 0x4573124 <_ChromeMain+0x456de88>
 4572f4c: 71000ebf     	cmp	w21, #0x3
 4572f50: 54001040     	b.eq	0x4573158 <_ChromeMain+0x456debc>
 4572f54: 71001ebf     	cmp	w21, #0x7
 4572f58: 540006c1     	b.ne	0x4573030 <_ChromeMain+0x456dd94>
 4572f5c: 52800600     	mov	w0, #0x30               ; =48
 4572f60: 96ea7102     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572f64: f90033e0     	str	x0, [sp, #0x60]
 4572f68: b004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4572f6c: 3dc18500     	ldr	q0, [x8, #0x610]
 4572f70: 3c8683e0     	stur	q0, [sp, #0x68]
 4572f74: 9100b009     	add	x9, x0, #0x2c
 4572f78: eb00013f     	cmp	x9, x0
 4572f7c: 540059c3     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4572f80: b004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4572f84: 91009908     	add	x8, x8, #0x26
 4572f88: eb08013f     	cmp	x9, x8
 4572f8c: fa488002     	ccmp	x0, x8, #0x2, hi
 4572f90: 54005929     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4572f94: ad400500     	ldp	q0, q1, [x8]
 4572f98: ad000400     	stp	q0, q1, [x0]
 4572f9c: 3cc1c100     	ldur	q0, [x8, #0x1c]
 4572fa0: 3c81c000     	stur	q0, [x0, #0x1c]
 4572fa4: 7900581f     	strh	wzr, [x0, #0x2c]
 4572fa8: 1400007b     	b	0x4573194 <_ChromeMain+0x456def8>
 4572fac: 9725cc55     	bl	0xee6100 <_ChromeMain+0xee0e64>
 4572fb0: 3500a1a0     	cbnz	w0, 0x45743e4 <_ChromeMain+0x456f148>
 4572fb4: aa1303e0     	mov	x0, x19
 4572fb8: 9735ada7     	bl	0x12de654 <_ChromeMain+0x12d93b8>
 4572fbc: f9416668     	ldr	x8, [x19, #0x2c8]
 4572fc0: f9016660     	str	x0, [x19, #0x2c8]
 4572fc4: b4fffb68     	cbz	x8, 0x4572f30 <_ChromeMain+0x456dc94>
 4572fc8: 1400050c     	b	0x45743f8 <_ChromeMain+0x456f15c>
 4572fcc: 710022bf     	cmp	w21, #0x8
 4572fd0: 54000580     	b.eq	0x4573080 <_ChromeMain+0x456dde4>
 4572fd4: 710026bf     	cmp	w21, #0x9
 4572fd8: 540007c0     	b.eq	0x45730d0 <_ChromeMain+0x456de34>
 4572fdc: 71002abf     	cmp	w21, #0xa
 4572fe0: 54000281     	b.ne	0x4573030 <_ChromeMain+0x456dd94>
 4572fe4: 52800600     	mov	w0, #0x30               ; =48
 4572fe8: 96ea70e0     	bl	0xf368 <_ChromeMain+0xa0cc>
 4572fec: f90033e0     	str	x0, [sp, #0x60]
 4572ff0: d004ce68     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4572ff4: 3dc00d00     	ldr	q0, [x8, #0x30]
 4572ff8: 3c8683e0     	stur	q0, [sp, #0x68]
 4572ffc: 91008809     	add	x9, x0, #0x22
 4573000: eb00013f     	cmp	x9, x0
 4573004: 54005583     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4573008: f004d088     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 457300c: 913fb108     	add	x8, x8, #0xfec
 4573010: eb08013f     	cmp	x9, x8
 4573014: fa488002     	ccmp	x0, x8, #0x2, hi
 4573018: 540054e9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457301c: 52800ea9     	mov	w9, #0x75               ; =117
 4573020: b9002009     	str	w9, [x0, #0x20]
 4573024: ad400500     	ldp	q0, q1, [x8]
 4573028: ad000400     	stp	q0, q1, [x0]
 457302c: 1400005a     	b	0x4573194 <_ChromeMain+0x456def8>
 4573030: 52800400     	mov	w0, #0x20               ; =32
 4573034: 96ea70cd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573038: f90033e0     	str	x0, [sp, #0x60]
 457303c: 9004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 4573040: 3dc04100     	ldr	q0, [x8, #0x100]
 4573044: 3c8683e0     	stur	q0, [sp, #0x68]
 4573048: 91007809     	add	x9, x0, #0x1e
 457304c: eb00013f     	cmp	x9, x0
 4573050: 54005323     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 4573054: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 4573058: 9101b108     	add	x8, x8, #0x6c
 457305c: eb08013f     	cmp	x9, x8
 4573060: fa488002     	ccmp	x0, x8, #0x2, hi
 4573064: 54005289     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573068: 3dc00100     	ldr	q0, [x8]
 457306c: 3d800000     	str	q0, [x0]
 4573070: 3cc0e100     	ldur	q0, [x8, #0xe]
 4573074: 3c80e000     	stur	q0, [x0, #0xe]
 4573078: 79003c1f     	strh	wzr, [x0, #0x1e]
 457307c: 14000046     	b	0x4573194 <_ChromeMain+0x456def8>
 4573080: 52800400     	mov	w0, #0x20               ; =32
 4573084: 96ea70b9     	bl	0xf368 <_ChromeMain+0xa0cc>
 4573088: f90033e0     	str	x0, [sp, #0x60]
 457308c: b004ce68     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 4573090: 3dc3b100     	ldr	q0, [x8, #0xec0]
 4573094: 3c8683e0     	stur	q0, [sp, #0x68]
 4573098: 91005809     	add	x9, x0, #0x16
 457309c: eb00013f     	cmp	x9, x0
 45730a0: 540050a3     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 45730a4: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 45730a8: 91015108     	add	x8, x8, #0x54
 45730ac: eb08013f     	cmp	x9, x8
 45730b0: fa488002     	ccmp	x0, x8, #0x2, hi
 45730b4: 54005009     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 45730b8: 3dc00100     	ldr	q0, [x8]
 45730bc: 3d800000     	str	q0, [x0]
 45730c0: f840e108     	ldur	x8, [x8, #0xe]
 45730c4: f800e008     	stur	x8, [x0, #0xe]
 45730c8: 79002c1f     	strh	wzr, [x0, #0x16]
 45730cc: 14000032     	b	0x4573194 <_ChromeMain+0x456def8>
 45730d0: 52800600     	mov	w0, #0x30               ; =48
 45730d4: 96ea70a5     	bl	0xf368 <_ChromeMain+0xa0cc>
 45730d8: f90033e0     	str	x0, [sp, #0x60]
 45730dc: 9004ce68     	adrp	x8, 0xdf3f000 <dyld_stub_binder+0xdf3f000>
 45730e0: 3dc08100     	ldr	q0, [x8, #0x200]
 45730e4: 3c8683e0     	stur	q0, [sp, #0x68]
 45730e8: 91009009     	add	x9, x0, #0x24
 45730ec: eb00013f     	cmp	x9, x0
 45730f0: 54004e23     	b.lo	0x4573ab4 <_ChromeMain+0x456e818>
 45730f4: f004d088     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 45730f8: 913f1908     	add	x8, x8, #0xfc6
 45730fc: eb08013f     	cmp	x9, x8
 4573100: fa488002     	ccmp	x0, x8, #0x2, hi
 4573104: 54004d89     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573108: 52800ce9     	mov	w9, #0x67               ; =103
 457310c: 72a00e69     	movk	w9, #0x73, lsl #16
 4573110: b9002009     	str	w9, [x0, #0x20]
 4573114: ad400500     	ldp	q0, q1, [x8]
 4573118: ad000400     	stp	q0, q1, [x0]
 457311c: 7900481f     	strh	wzr, [x0, #0x24]
 4573120: 1400001d     	b	0x4573194 <_ChromeMain+0x456def8>
 4573124: 52800108     	mov	w8, #0x8                ; =8
 4573128: 3901dfe8     	strb	w8, [sp, #0x77]
 457312c: 910183e9     	add	x9, sp, #0x60
 4573130: 9100412a     	add	x10, x9, #0x10
 4573134: f004d088     	adrp	x8, 0xdf86000 <dyld_stub_binder+0xdf86000>
 4573138: 913ed108     	add	x8, x8, #0xfb4
 457313c: eb08015f     	cmp	x10, x8
 4573140: fa488122     	ccmp	x9, x8, #0x2, hi
 4573144: 54004b89     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 4573148: 3dc00100     	ldr	q0, [x8]
 457314c: 3d801be0     	str	q0, [sp, #0x60]
 4573150: 7900e3ff     	strh	wzr, [sp, #0x70]
 4573154: 14000010     	b	0x4573194 <_ChromeMain+0x456def8>
 4573158: 52800148     	mov	w8, #0xa                ; =10
 457315c: 3901dfe8     	strb	w8, [sp, #0x77]
 4573160: 910183e9     	add	x9, sp, #0x60
 4573164: 9100512a     	add	x10, x9, #0x14
 4573168: 9004d0a8     	adrp	x8, 0xdf87000 <dyld_stub_binder+0xdf87000>
 457316c: 91004108     	add	x8, x8, #0x10
 4573170: eb08015f     	cmp	x10, x8
 4573174: fa488122     	ccmp	x9, x8, #0x2, hi
 4573178: 540049e9     	b.ls	0x4573ab4 <_ChromeMain+0x456e818>
 457317c: 52800dc9     	mov	w9, #0x6e               ; =110
 4573180: 72a00e69     	movk	w9, #0x73, lsl #16
 4573184: b90073e9     	str	w9, [sp, #0x70]
 4573188: 3dc00100     	ldr	q0, [x8]
 457318c: 3d801be0     	str	q0, [sp, #0x60]
 4573190: 7900ebff     	strh	wzr, [sp, #0x74]
 4573194: 910183e1     	add	x1, sp, #0x60
 4573198: aa1603e0     	mov	x0, x22
 457319c: 972fe9cf     	bl	0x116d8d8 <_ChromeMain+0x116863c>
 45731a0: 39c1dfe8     	ldrsb	w8, [sp, #0x77]
 45731a4: 36f800c8     	tbz	w8, #0x1f, 0x45731bc <_ChromeMain+0x456df20>
 45731a8: 910183e8     	add	x8, sp, #0x60
 45731ac: f9403be9     	ldr	x9, [sp, #0x70]
 45731b0: f9400100     	ldr	x0, [x8]
 45731b4: d37ff921     	lsl	x1, x9, #1
 45731b8: 96ea5740     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45731bc: 52801f00     	mov	w0, #0xf8               ; =248
 45731c0: 96ea706a     	bl	0xf368 <_ChromeMain+0xa0cc>
 45731c4: aa0003f6     	mov	x22, x0
 45731c8: 973c4946     	bl	0x14856e0 <_ChromeMain+0x1480444>
 45731cc: f004eee8     	adrp	x8, 0xe352000 <dyld_stub_binder+0xe352000>
 45731d0: 91366108     	add	x8, x8, #0xd98
 45731d4: f9000008     	str	x8, [x0]
 45731d8: 91036108     	add	x8, x8, #0xd8
 45731dc: f9001408     	str	x8, [x0, #0x28]
 45731e0: 52802008     	mov	w8, #0x100              ; =256
 45731e4: 7901e008     	strh	w8, [x0, #0xf0]
 45731e8: aa1303e0     	mov	x0, x19
 45731ec: aa1603e1     	mov	x1, x22
 45731f0: 97585992     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 45731f4: 340002f5     	cbz	w21, 0x4573250 <_ChromeMain+0x456dfb4>
 45731f8: b9436e63     	ldr	w3, [x19, #0x36c]
 45731fc: aa1303e0     	mov	x0, x19
 4573200: aa1503e1     	mov	x1, x21
 4573204: aa1403e2     	mov	x2, x20
 4573208: 94000488     	bl	0x4574428 <_ChromeMain+0x456f18c>
 457320c: aa0003f4     	mov	x20, x0
 4573210: 3945a688     	ldrb	w8, [x20, #0x169]
 4573214: 35008868     	cbnz	w8, 0x4574320 <_ChromeMain+0x456f084>
 4573218: f940ce62     	ldr	x2, [x19, #0x198]
 457321c: aa1303e0     	mov	x0, x19
 4573220: aa1403e1     	mov	x1, x20
 4573224: 97081876     	bl	0x7793fc <_ChromeMain+0x774160>
 4573228: aa1303e0     	mov	x0, x19
 457322c: 910c83ff     	add	sp, sp, #0x320
 4573230: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 4573234: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 4573238: a94457f6     	ldp	x22, x21, [sp, #0x40]
 457323c: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 4573240: a94267fa     	ldp	x26, x25, [sp, #0x20]
 4573244: a9416ffc     	ldp	x28, x27, [sp, #0x10]
 4573248: 6cc723e9     	ldp	d9, d8, [sp], #0x70
