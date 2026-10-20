
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4642f18: d10103ff     	sub	sp, sp, #0x40
 4642f1c: a90157f6     	stp	x22, x21, [sp, #0x10]
 4642f20: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4642f24: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4642f28: 9100c3fd     	add	x29, sp, #0x30
 4642f2c: b50000c1     	cbnz	x1, 0x4642f44 <_ChromeMain+0x463dca8>
 4642f30: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4642f34: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4642f38: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4642f3c: 910103ff     	add	sp, sp, #0x40
 4642f40: d65f03c0     	ret
 4642f44: aa0003f3     	mov	x19, x0
 4642f48: b9401034     	ldr	w20, [x1, #0x10]
 4642f4c: f947cc08     	ldr	x8, [x0, #0xf98]
 4642f50: f947d009     	ldr	x9, [x0, #0xfa0]
 4642f54: 8b09092a     	add	x10, x9, x9, lsl #2
 4642f58: d37df14a     	lsl	x10, x10, #3
 4642f5c: b400022a     	cbz	x10, 0x4642fa0 <_ChromeMain+0x463dd04>
 4642f60: 9343fd4a     	asr	x10, x10, #3
 4642f64: b202e7eb     	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4642f68: f29999ab     	movk	x11, #0xcccd
 4642f6c: 9b0b7d4b     	mul	x11, x10, x11
 4642f70: 5280050a     	mov	w10, #0x28              ; =40
 4642f74: aa0803e1     	mov	x1, x8
 4642f78: d341fd6c     	lsr	x12, x11, #1
 4642f7c: 9b0a058d     	madd	x13, x12, x10, x1
 4642f80: b84285ae     	ldr	w14, [x13], #0x28
 4642f84: aa6b07ef     	mvn	x15, x11, lsr #1
 4642f88: 8b0f016b     	add	x11, x11, x15
 4642f8c: 6b1401df     	cmp	w14, w20
 4642f90: 9a8cb16b     	csel	x11, x11, x12, lt
 4642f94: 9a81b1a1     	csel	x1, x13, x1, lt
 4642f98: b5ffff0b     	cbnz	x11, 0x4642f78 <_ChromeMain+0x463dcdc>
 4642f9c: 14000002     	b	0x4642fa4 <_ChromeMain+0x463dd08>
 4642fa0: aa0803e1     	mov	x1, x8
 4642fa4: 5280050a     	mov	w10, #0x28              ; =40
 4642fa8: 9b0a2128     	madd	x8, x9, x10, x8
 4642fac: aa0103e2     	mov	x2, x1
 4642fb0: eb08003f     	cmp	x1, x8
 4642fb4: 540000c0     	b.eq	0x4642fcc <_ChromeMain+0x463dd30>
 4642fb8: b9400028     	ldr	w8, [x1]
 4642fbc: 6b08029f     	cmp	w20, w8
 4642fc0: 52800508     	mov	w8, #0x28               ; =40
 4642fc4: 9a88b3e8     	csel	x8, xzr, x8, lt
 4642fc8: 8b080022     	add	x2, x1, x8
 4642fcc: 913e6260     	add	x0, x19, #0xf98
 4642fd0: 9400fde3     	bl	0x468275c <_ChromeMain+0x467d4c0>
 4642fd4: f947e668     	ldr	x8, [x19, #0xfc8]
 4642fd8: f947ea69     	ldr	x9, [x19, #0xfd0]
 4642fdc: d37be92a     	lsl	x10, x9, #5
 4642fe0: b40001aa     	cbz	x10, 0x4643014 <_ChromeMain+0x463dd78>
 4642fe4: 9345fd4a     	asr	x10, x10, #5
 4642fe8: aa0803e1     	mov	x1, x8
 4642fec: d341fd4b     	lsr	x11, x10, #1
 4642ff0: 8b0b142c     	add	x12, x1, x11, lsl #5
 4642ff4: b842058d     	ldr	w13, [x12], #0x20
 4642ff8: aa6a07ee     	mvn	x14, x10, lsr #1
 4642ffc: 8b0e014a     	add	x10, x10, x14
 4643000: 6b1401bf     	cmp	w13, w20
 4643004: 9a8bb14a     	csel	x10, x10, x11, lt
 4643008: 9a81b181     	csel	x1, x12, x1, lt
 464300c: b5ffff0a     	cbnz	x10, 0x4642fec <_ChromeMain+0x463dd50>
 4643010: 14000002     	b	0x4643018 <_ChromeMain+0x463dd7c>
 4643014: aa0803e1     	mov	x1, x8
 4643018: 8b091508     	add	x8, x8, x9, lsl #5
 464301c: aa0103e2     	mov	x2, x1
 4643020: eb08003f     	cmp	x1, x8
 4643024: 540000c0     	b.eq	0x464303c <_ChromeMain+0x463dda0>
 4643028: b9400028     	ldr	w8, [x1]
 464302c: 6b08029f     	cmp	w20, w8
 4643030: 52800408     	mov	w8, #0x20               ; =32
 4643034: 9a88b3e8     	csel	x8, xzr, x8, lt
 4643038: 8b080022     	add	x2, x1, x8
 464303c: 913f2260     	add	x0, x19, #0xfc8
 4643040: 9400fc05     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 4643044: 52821208     	mov	w8, #0x1090             ; =4240
 4643048: f9484a69     	ldr	x9, [x19, #0x1090]
 464304c: f9484e6a     	ldr	x10, [x19, #0x1098]
 4643050: d37ef54b     	lsl	x11, x10, #2
 4643054: b40001ab     	cbz	x11, 0x4643088 <_ChromeMain+0x463ddec>
 4643058: 9342fd6b     	asr	x11, x11, #2
 464305c: aa0903e1     	mov	x1, x9
 4643060: d341fd6c     	lsr	x12, x11, #1
 4643064: 8b0c082d     	add	x13, x1, x12, lsl #2
 4643068: b84045ae     	ldr	w14, [x13], #0x4
 464306c: aa6b07ef     	mvn	x15, x11, lsr #1
 4643070: 8b0f016b     	add	x11, x11, x15
 4643074: 6b1401df     	cmp	w14, w20
 4643078: 9a8cb16b     	csel	x11, x11, x12, lt
 464307c: 9a81b1a1     	csel	x1, x13, x1, lt
 4643080: b5ffff0b     	cbnz	x11, 0x4643060 <_ChromeMain+0x463ddc4>
 4643084: 14000002     	b	0x464308c <_ChromeMain+0x463ddf0>
 4643088: aa0903e1     	mov	x1, x9
 464308c: 8b0a0929     	add	x9, x9, x10, lsl #2
 4643090: aa0103e2     	mov	x2, x1
 4643094: eb09003f     	cmp	x1, x9
 4643098: 540000c0     	b.eq	0x46430b0 <_ChromeMain+0x463de14>
 464309c: b9400029     	ldr	w9, [x1]
 46430a0: 6b09029f     	cmp	w20, w9
 46430a4: 52800089     	mov	w9, #0x4                ; =4
 46430a8: 9a89b3e9     	csel	x9, xzr, x9, lt
 46430ac: 8b090022     	add	x2, x1, x9
 46430b0: 8b080260     	add	x0, x19, x8
 46430b4: 94195a1f     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 46430b8: f9485668     	ldr	x8, [x19, #0x10a8]
 46430bc: f9485a6a     	ldr	x10, [x19, #0x10b0]
 46430c0: d37ced4b     	lsl	x11, x10, #4
 46430c4: aa0803e9     	mov	x9, x8
 46430c8: b400018b     	cbz	x11, 0x46430f8 <_ChromeMain+0x463de5c>
 46430cc: 9344fd6c     	asr	x12, x11, #4
 46430d0: aa0803e9     	mov	x9, x8
 46430d4: d341fd8d     	lsr	x13, x12, #1
 46430d8: 8b0d112e     	add	x14, x9, x13, lsl #4
 46430dc: b84105cf     	ldr	w15, [x14], #0x10
 46430e0: aa6c07f0     	mvn	x16, x12, lsr #1
 46430e4: 8b10018c     	add	x12, x12, x16
 46430e8: 6b1401ff     	cmp	w15, w20
 46430ec: 9a8db18c     	csel	x12, x12, x13, lt
 46430f0: 9a89b1c9     	csel	x9, x14, x9, lt
 46430f4: b5ffff0c     	cbnz	x12, 0x46430d4 <_ChromeMain+0x463de38>
 46430f8: 8b0a110c     	add	x12, x8, x10, lsl #4
 46430fc: aa0903ee     	mov	x14, x9
 4643100: eb0c013f     	cmp	x9, x12
 4643104: 540000a0     	b.eq	0x4643118 <_ChromeMain+0x463de7c>
 4643108: b940012c     	ldr	w12, [x9]
 464310c: 6b0c029f     	cmp	w20, w12
 4643110: 9100412c     	add	x12, x9, #0x10
 4643114: 9a8cb12e     	csel	x14, x9, x12, lt
 4643118: eb0e013f     	cmp	x9, x14
 464311c: 540003c8     	b.hi	0x4643194 <_ChromeMain+0x463def8>
 4643120: 54000420     	b.eq	0x46431a4 <_ChromeMain+0x463df08>
 4643124: cb0801cc     	sub	x12, x14, x8
 4643128: eb0b019f     	cmp	x12, x11
 464312c: 540002a0     	b.eq	0x4643180 <_ChromeMain+0x463dee4>
 4643130: cb0803ec     	neg	x12, x8
 4643134: 8b0e010d     	add	x13, x8, x14
 4643138: 8b09010a     	add	x10, x8, x9
 464313c: 8b0b012b     	add	x11, x9, x11
 4643140: cb0e016b     	sub	x11, x11, x14
 4643144: cb090169     	sub	x9, x11, x9
 4643148: 8b0c01ab     	add	x11, x13, x12
 464314c: 8b0c014e     	add	x14, x10, x12
 4643150: b940016f     	ldr	w15, [x11]
 4643154: b90001cf     	str	w15, [x14]
 4643158: f940056b     	ldr	x11, [x11, #0x8]
 464315c: f90005cb     	str	x11, [x14, #0x8]
 4643160: 910041ad     	add	x13, x13, #0x10
 4643164: 9100414a     	add	x10, x10, #0x10
 4643168: d1004129     	sub	x9, x9, #0x10
 464316c: eb09019f     	cmp	x12, x9
 4643170: 54fffec1     	b.ne	0x4643148 <_ChromeMain+0x463deac>
 4643174: cb080149     	sub	x9, x10, x8
 4643178: f9485668     	ldr	x8, [x19, #0x10a8]
 464317c: f9485a6a     	ldr	x10, [x19, #0x10b0]
 4643180: 8b0a110a     	add	x10, x8, x10, lsl #4
 4643184: eb09015f     	cmp	x10, x9
 4643188: 54000080     	b.eq	0x4643198 <_ChromeMain+0x463defc>
 464318c: f100414a     	subs	x10, x10, #0x10
 4643190: 54ffffa1     	b.ne	0x4643184 <_ChromeMain+0x463dee8>
 4643194: d4200020     	brk	#0x1
 4643198: cb080128     	sub	x8, x9, x8
 464319c: 9344fd08     	asr	x8, x8, #4
 46431a0: f9085a68     	str	x8, [x19, #0x10b0]
 46431a4: f9480268     	ldr	x8, [x19, #0x1000]
 46431a8: f9480669     	ldr	x9, [x19, #0x1008]
 46431ac: d37be92a     	lsl	x10, x9, #5
 46431b0: b40001aa     	cbz	x10, 0x46431e4 <_ChromeMain+0x463df48>
 46431b4: 9345fd4a     	asr	x10, x10, #5
 46431b8: aa0803e1     	mov	x1, x8
 46431bc: d341fd4b     	lsr	x11, x10, #1
 46431c0: 8b0b142c     	add	x12, x1, x11, lsl #5
 46431c4: b842058d     	ldr	w13, [x12], #0x20
 46431c8: aa6a07ee     	mvn	x14, x10, lsr #1
 46431cc: 8b0e014a     	add	x10, x10, x14
 46431d0: 6b1401bf     	cmp	w13, w20
 46431d4: 9a8bb14a     	csel	x10, x10, x11, lt
 46431d8: 9a81b181     	csel	x1, x12, x1, lt
 46431dc: b5ffff0a     	cbnz	x10, 0x46431bc <_ChromeMain+0x463df20>
 46431e0: 14000002     	b	0x46431e8 <_ChromeMain+0x463df4c>
 46431e4: aa0803e1     	mov	x1, x8
 46431e8: 91400675     	add	x21, x19, #0x1, lsl #12 ; =0x1000
 46431ec: 8b091508     	add	x8, x8, x9, lsl #5
 46431f0: aa0103e2     	mov	x2, x1
 46431f4: eb08003f     	cmp	x1, x8
 46431f8: 540000c0     	b.eq	0x4643210 <_ChromeMain+0x463df74>
 46431fc: b9400028     	ldr	w8, [x1]
 4643200: 6b08029f     	cmp	w20, w8
 4643204: 52800408     	mov	w8, #0x20               ; =32
 4643208: 9a88b3e8     	csel	x8, xzr, x8, lt
 464320c: 8b080022     	add	x2, x1, x8
 4643210: 91400660     	add	x0, x19, #0x1, lsl #12  ; =0x1000
 4643214: 9400fb90     	bl	0x4682054 <_ChromeMain+0x467cdb8>
 4643218: 394072a8     	ldrb	w8, [x21, #0x1c]
 464321c: 340000a8     	cbz	w8, 0x4643230 <_ChromeMain+0x463df94>
 4643220: b9501a68     	ldr	w8, [x19, #0x1018]
 4643224: 6b14011f     	cmp	w8, w20
 4643228: 54000041     	b.ne	0x4643230 <_ChromeMain+0x463df94>
 464322c: 390072bf     	strb	wzr, [x21, #0x1c]
 4643230: 3940b2a8     	ldrb	w8, [x21, #0x2c]
 4643234: 34000148     	cbz	w8, 0x464325c <_ChromeMain+0x463dfc0>
 4643238: b9502a68     	ldr	w8, [x19, #0x1028]
 464323c: 6b14011f     	cmp	w8, w20
 4643240: 540000e1     	b.ne	0x464325c <_ChromeMain+0x463dfc0>
 4643244: 52820608     	mov	w8, #0x1030             ; =4144
 4643248: 8b080260     	add	x0, x19, x8
 464324c: 9703ad33     	bl	0x72e718 <_ChromeMain+0x72947c>
 4643250: 3940b2a8     	ldrb	w8, [x21, #0x2c]
 4643254: 34000048     	cbz	w8, 0x464325c <_ChromeMain+0x463dfc0>
 4643258: 3900b2bf     	strb	wzr, [x21, #0x2c]
 464325c: 394092a8     	ldrb	w8, [x21, #0x24]
 4643260: 34000148     	cbz	w8, 0x4643288 <_ChromeMain+0x463dfec>
 4643264: b9502268     	ldr	w8, [x19, #0x1020]
 4643268: 6b14011f     	cmp	w8, w20
 464326c: 540000e1     	b.ne	0x4643288 <_ChromeMain+0x463dfec>
 4643270: 390092bf     	strb	wzr, [x21, #0x24]
 4643274: f942e660     	ldr	x0, [x19, #0x5c8]
 4643278: b4000080     	cbz	x0, 0x4643288 <_ChromeMain+0x463dfec>
 464327c: d2800001     	mov	x1, #0x0                ; =0
 4643280: 52800002     	mov	w2, #0x0                ; =0
 4643284: 94000043     	bl	0x4643390 <_ChromeMain+0x463e0f4>
 4643288: b9000ff4     	str	w20, [sp, #0xc]
 464328c: 52821808     	mov	w8, #0x10c0             ; =4288
 4643290: 8b080260     	add	x0, x19, x8
 4643294: 910033e1     	add	x1, sp, #0xc
 4643298: 94002c13     	bl	0x464e2e4 <_ChromeMain+0x4649048>
 464329c: f947da68     	ldr	x8, [x19, #0xfb0]
 46432a0: f947de69     	ldr	x9, [x19, #0xfb8]
 46432a4: d37ef52a     	lsl	x10, x9, #2
 46432a8: b40001aa     	cbz	x10, 0x46432dc <_ChromeMain+0x463e040>
 46432ac: 9342fd4a     	asr	x10, x10, #2
 46432b0: aa0803e1     	mov	x1, x8
 46432b4: d341fd4b     	lsr	x11, x10, #1
 46432b8: 8b0b082c     	add	x12, x1, x11, lsl #2
 46432bc: b840458d     	ldr	w13, [x12], #0x4
 46432c0: aa6a07ee     	mvn	x14, x10, lsr #1
 46432c4: 8b0e014a     	add	x10, x10, x14
 46432c8: 6b1401bf     	cmp	w13, w20
 46432cc: 9a8bb14a     	csel	x10, x10, x11, lt
 46432d0: 9a81b181     	csel	x1, x12, x1, lt
 46432d4: b5ffff0a     	cbnz	x10, 0x46432b4 <_ChromeMain+0x463e018>
 46432d8: 14000002     	b	0x46432e0 <_ChromeMain+0x463e044>
 46432dc: aa0803e1     	mov	x1, x8
 46432e0: 8b090908     	add	x8, x8, x9, lsl #2
 46432e4: aa0103e2     	mov	x2, x1
 46432e8: eb08003f     	cmp	x1, x8
 46432ec: 540000c0     	b.eq	0x4643304 <_ChromeMain+0x463e068>
 46432f0: b9400028     	ldr	w8, [x1]
 46432f4: 6b08029f     	cmp	w20, w8
 46432f8: 52800088     	mov	w8, #0x4                ; =4
 46432fc: 9a88b3e8     	csel	x8, xzr, x8, lt
 4643300: 8b080022     	add	x2, x1, x8
 4643304: 913ec260     	add	x0, x19, #0xfb0
 4643308: 9419598a     	bl	0x4c99930 <_ChromeMain+0x4c94694>
 464330c: 52821b08     	mov	w8, #0x10d8             ; =4312
 4643310: f9486e69     	ldr	x9, [x19, #0x10d8]
 4643314: f948726a     	ldr	x10, [x19, #0x10e0]
 4643318: d37ef54b     	lsl	x11, x10, #2
 464331c: b40001ab     	cbz	x11, 0x4643350 <_ChromeMain+0x463e0b4>
 4643320: 9342fd6b     	asr	x11, x11, #2
 4643324: aa0903e1     	mov	x1, x9
 4643328: d341fd6c     	lsr	x12, x11, #1
 464332c: 8b0c082d     	add	x13, x1, x12, lsl #2
 4643330: b84045ae     	ldr	w14, [x13], #0x4
 4643334: aa6b07ef     	mvn	x15, x11, lsr #1
 4643338: 8b0f016b     	add	x11, x11, x15
 464333c: 6b1401df     	cmp	w14, w20
 4643340: 9a8cb16b     	csel	x11, x11, x12, lt
 4643344: 9a81b1a1     	csel	x1, x13, x1, lt
 4643348: b5ffff0b     	cbnz	x11, 0x4643328 <_ChromeMain+0x463e08c>
 464334c: 14000002     	b	0x4643354 <_ChromeMain+0x463e0b8>
 4643350: aa0903e1     	mov	x1, x9
 4643354: 8b0a0929     	add	x9, x9, x10, lsl #2
 4643358: aa0103e2     	mov	x2, x1
 464335c: eb09003f     	cmp	x1, x9
 4643360: 540000c0     	b.eq	0x4643378 <_ChromeMain+0x463e0dc>
 4643364: b9400029     	ldr	w9, [x1]
 4643368: 6b09029f     	cmp	w20, w9
 464336c: 52800089     	mov	w9, #0x4                ; =4
 4643370: 9a89b3e9     	csel	x9, xzr, x9, lt
 4643374: 8b090022     	add	x2, x1, x9
 4643378: 8b080260     	add	x0, x19, x8
 464337c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4643380: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4643384: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4643388: 910103ff     	add	sp, sp, #0x40
 464338c: 14195969     	b	0x4c99930 <_ChromeMain+0x4c94694>
