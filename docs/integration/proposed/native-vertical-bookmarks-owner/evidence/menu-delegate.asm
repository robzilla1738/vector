
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461fd04: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 461fd08: a9014ff4     	stp	x20, x19, [sp, #0x10]
 461fd0c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 461fd10: 910083fd     	add	x29, sp, #0x20
 461fd14: aa0103f5     	mov	x21, x1
 461fd18: aa0003f4     	mov	x20, x0
 461fd1c: 51019028     	sub	w8, w1, #0x64
 461fd20: 7100191f     	cmp	w8, #0x6
 461fd24: 540001e9     	b.ls	0x461fd60 <_ChromeMain+0x461aac4>
 461fd28: 39666288     	ldrb	w8, [x20, #0x998]
 461fd2c: 340002c8     	cbz	w8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fd30: f944ca81     	ldr	x1, [x20, #0x990]
 461fd34: aa1403e0     	mov	x0, x20
 461fd38: 97ffd200     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461fd3c: b4000260     	cbz	x0, 0x461fd88 <_ChromeMain+0x461aaec>
 461fd40: b940f808     	ldr	w8, [x0, #0xf8]
 461fd44: 34000208     	cbz	w8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fd48: 3944e008     	ldrb	w8, [x0, #0x138]
 461fd4c: 370001c8     	tbnz	w8, #0x0, 0x461fd84 <_ChromeMain+0x461aae8>
 461fd50: 510006a8     	sub	w8, w21, #0x1
 461fd54: 71000d1f     	cmp	w8, #0x3
 461fd58: 1a9f27e0     	cset	w0, lo
 461fd5c: 1400000b     	b	0x461fd88 <_ChromeMain+0x461aaec>
 461fd60: 3966a288     	ldrb	w8, [x20, #0x9a8]
 461fd64: 34000108     	cbz	w8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fd68: f944d281     	ldr	x1, [x20, #0x9a0]
 461fd6c: aa1403e0     	mov	x0, x20
 461fd70: 97ffd1f2     	bl	0x4614538 <_ChromeMain+0x460f29c>
 461fd74: b40000a0     	cbz	x0, 0x461fd88 <_ChromeMain+0x461aaec>
 461fd78: aa0003f3     	mov	x19, x0
 461fd7c: b940f808     	ldr	w8, [x0, #0xf8]
 461fd80: 340000c8     	cbz	w8, 0x461fd98 <_ChromeMain+0x461aafc>
 461fd84: 52800000     	mov	w0, #0x0                ; =0
 461fd88: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461fd8c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 461fd90: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461fd94: d65f03c0     	ret
 461fd98: 52800dc8     	mov	w8, #0x6e               ; =110
 461fd9c: 0a0802a8     	and	w8, w21, w8
 461fda0: 7101911f     	cmp	w8, #0x64
 461fda4: 54000141     	b.ne	0x461fdcc <_ChromeMain+0x461ab30>
 461fda8: 3944e268     	ldrb	w8, [x19, #0x138]
 461fdac: 3707fec8     	tbnz	w8, #0x0, 0x461fd84 <_ChromeMain+0x461aae8>
 461fdb0: f9429a88     	ldr	x8, [x20, #0x530]
 461fdb4: b4fffe88     	cbz	x8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fdb8: f9428e88     	ldr	x8, [x20, #0x518]
 461fdbc: b4fffe48     	cbz	x8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fdc0: f9402100     	ldr	x0, [x8, #0x40]
 461fdc4: b4fffe20     	cbz	x0, 0x461fd88 <_ChromeMain+0x461aaec>
 461fdc8: 14000008     	b	0x461fde8 <_ChromeMain+0x461ab4c>
 461fdcc: aa1403e0     	mov	x0, x20
 461fdd0: aa1503e1     	mov	x1, x21
 461fdd4: aa1303e2     	mov	x2, x19
 461fdd8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 461fddc: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 461fde0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 461fde4: 17fff85d     	b	0x461df58 <_ChromeMain+0x4618cbc>
 461fde8: f9400008     	ldr	x8, [x0]
 461fdec: f940b908     	ldr	x8, [x8, #0x170]
 461fdf0: d63f0100     	blr	x8
 461fdf4: f0044601     	adrp	x1, 0xcee2000 <dyld_stub_binder+0xcee2000>
 461fdf8: 910ab421     	add	x1, x1, #0x2ad
 461fdfc: 52800322     	mov	w2, #0x19               ; =25
 461fe00: 96f399c0     	bl	0x306500 <_ChromeMain+0x301264>
 461fe04: 34fffc20     	cbz	w0, 0x461fd88 <_ChromeMain+0x461aaec>
 461fe08: f9429a88     	ldr	x8, [x20, #0x530]
 461fe0c: f9405508     	ldr	x8, [x8, #0xa8]
 461fe10: b4fffba8     	cbz	x8, 0x461fd84 <_ChromeMain+0x461aae8>
 461fe14: f9404108     	ldr	x8, [x8, #0x80]
 461fe18: b4000168     	cbz	x8, 0x461fe44 <_ChromeMain+0x461aba8>
 461fe1c: f9402908     	ldr	x8, [x8, #0x50]
 461fe20: eb13011f     	cmp	x8, x19
 461fe24: 1a9f17e9     	cset	w9, eq
 461fe28: b40000a8     	cbz	x8, 0x461fe3c <_ChromeMain+0x461aba0>
 461fe2c: 54000080     	b.eq	0x461fe3c <_ChromeMain+0x461aba0>
 461fe30: f9401e73     	ldr	x19, [x19, #0x38]
 461fe34: b5ffff73     	cbnz	x19, 0x461fe20 <_ChromeMain+0x461ab84>
 461fe38: 52800009     	mov	w9, #0x0                ; =0
 461fe3c: 52000120     	eor	w0, w9, #0x1
 461fe40: 17ffffd2     	b	0x461fd88 <_ChromeMain+0x461aaec>
 461fe44: 52800020     	mov	w0, #0x1                ; =1
 461fe48: 17ffffd0     	b	0x461fd88 <_ChromeMain+0x461aaec>
 461fe4c: d1140000     	sub	x0, x0, #0x500
 461fe50: 17ffffad     	b	0x461fd04 <_ChromeMain+0x461aa68>
 461fe54: 7101943f     	cmp	w1, #0x65
 461fe58: 5400016c     	b.gt	0x461fe84 <_ChromeMain+0x461abe8>
 461fe5c: 7100083f     	cmp	w1, #0x2
 461fe60: 5400044d     	b.le	0x461fee8 <_ChromeMain+0x461ac4c>
 461fe64: 71000c3f     	cmp	w1, #0x3
 461fe68: 540004c0     	b.eq	0x461ff00 <_ChromeMain+0x461ac64>
 461fe6c: 7101903f     	cmp	w1, #0x64
 461fe70: 540002a0     	b.eq	0x461fec4 <_ChromeMain+0x461ac28>
 461fe74: 7101943f     	cmp	w1, #0x65
 461fe78: 540004e1     	b.ne	0x461ff14 <_ChromeMain+0x461ac78>
 461fe7c: 52800048     	mov	w8, #0x2                ; =2
 461fe80: 14000016     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461fe84: 71019c3f     	cmp	w1, #0x67
 461fe88: 5400012d     	b.le	0x461feac <_ChromeMain+0x461ac10>
 461fe8c: 7101a03f     	cmp	w1, #0x68
 461fe90: 54000280     	b.eq	0x461fee0 <_ChromeMain+0x461ac44>
 461fe94: 7101a43f     	cmp	w1, #0x69
 461fe98: 540001a0     	b.eq	0x461fecc <_ChromeMain+0x461ac30>
 461fe9c: 7101a83f     	cmp	w1, #0x6a
 461fea0: 540003a1     	b.ne	0x461ff14 <_ChromeMain+0x461ac78>
 461fea4: 528000e8     	mov	w8, #0x7                ; =7
 461fea8: 1400000c     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461feac: 7101983f     	cmp	w1, #0x66
 461feb0: 54000120     	b.eq	0x461fed4 <_ChromeMain+0x461ac38>
 461feb4: 71019c3f     	cmp	w1, #0x67
 461feb8: 540002e1     	b.ne	0x461ff14 <_ChromeMain+0x461ac78>
 461febc: 52800088     	mov	w8, #0x4                ; =4
 461fec0: 14000006     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461fec4: 52800028     	mov	w8, #0x1                ; =1
 461fec8: 14000004     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461fecc: 528000c8     	mov	w8, #0x6                ; =6
 461fed0: 14000002     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461fed4: 52800068     	mov	w8, #0x3                ; =3
 461fed8: b909c408     	str	w8, [x0, #0x9c4]
 461fedc: d65f03c0     	ret
 461fee0: 528000a8     	mov	w8, #0x5                ; =5
 461fee4: 17fffffd     	b	0x461fed8 <_ChromeMain+0x461ac3c>
 461fee8: 7100043f     	cmp	w1, #0x1
 461feec: 540000e0     	b.eq	0x461ff08 <_ChromeMain+0x461ac6c>
 461fef0: 7100083f     	cmp	w1, #0x2
 461fef4: 54000101     	b.ne	0x461ff14 <_ChromeMain+0x461ac78>
 461fef8: 52800048     	mov	w8, #0x2                ; =2
 461fefc: 14000004     	b	0x461ff0c <_ChromeMain+0x461ac70>
 461ff00: 52800068     	mov	w8, #0x3                ; =3
 461ff04: 14000002     	b	0x461ff0c <_ChromeMain+0x461ac70>
 461ff08: 52800028     	mov	w8, #0x1                ; =1
 461ff0c: b909c008     	str	w8, [x0, #0x9c0]
 461ff10: d65f03c0     	ret
 461ff14: 6f00e400     	movi.2d	v0, #0000000000000000
 461ff18: fd04e000     	str	d0, [x0, #0x9c0]
 461ff1c: d65f03c0     	ret
		...
 461ff40: 7101943f     	cmp	w1, #0x65
 461ff44: 5400016c     	b.gt	0x461ff70 <_ChromeMain+0x461acd4>
 461ff48: 7100083f     	cmp	w1, #0x2
 461ff4c: 5400044d     	b.le	0x461ffd4 <_ChromeMain+0x461ad38>
 461ff50: 71000c3f     	cmp	w1, #0x3
 461ff54: 540004c0     	b.eq	0x461ffec <_ChromeMain+0x461ad50>
 461ff58: 7101903f     	cmp	w1, #0x64
 461ff5c: 540002a0     	b.eq	0x461ffb0 <_ChromeMain+0x461ad14>
 461ff60: 7101943f     	cmp	w1, #0x65
 461ff64: 540004e1     	b.ne	0x4620000 <_ChromeMain+0x461ad64>
 461ff68: 52800048     	mov	w8, #0x2                ; =2
 461ff6c: 14000016     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ff70: 71019c3f     	cmp	w1, #0x67
 461ff74: 5400012d     	b.le	0x461ff98 <_ChromeMain+0x461acfc>
 461ff78: 7101a03f     	cmp	w1, #0x68
 461ff7c: 54000280     	b.eq	0x461ffcc <_ChromeMain+0x461ad30>
 461ff80: 7101a43f     	cmp	w1, #0x69
 461ff84: 540001a0     	b.eq	0x461ffb8 <_ChromeMain+0x461ad1c>
 461ff88: 7101a83f     	cmp	w1, #0x6a
 461ff8c: 540003a1     	b.ne	0x4620000 <_ChromeMain+0x461ad64>
 461ff90: 528000e8     	mov	w8, #0x7                ; =7
 461ff94: 1400000c     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ff98: 7101983f     	cmp	w1, #0x66
 461ff9c: 54000120     	b.eq	0x461ffc0 <_ChromeMain+0x461ad24>
 461ffa0: 71019c3f     	cmp	w1, #0x67
 461ffa4: 540002e1     	b.ne	0x4620000 <_ChromeMain+0x461ad64>
 461ffa8: 52800088     	mov	w8, #0x4                ; =4
 461ffac: 14000006     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ffb0: 52800028     	mov	w8, #0x1                ; =1
 461ffb4: 14000004     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ffb8: 528000c8     	mov	w8, #0x6                ; =6
 461ffbc: 14000002     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ffc0: 52800068     	mov	w8, #0x3                ; =3
 461ffc4: b904c408     	str	w8, [x0, #0x4c4]
 461ffc8: d65f03c0     	ret
 461ffcc: 528000a8     	mov	w8, #0x5                ; =5
 461ffd0: 17fffffd     	b	0x461ffc4 <_ChromeMain+0x461ad28>
 461ffd4: 7100043f     	cmp	w1, #0x1
 461ffd8: 540000e0     	b.eq	0x461fff4 <_ChromeMain+0x461ad58>
 461ffdc: 7100083f     	cmp	w1, #0x2
 461ffe0: 54000101     	b.ne	0x4620000 <_ChromeMain+0x461ad64>
 461ffe4: 52800048     	mov	w8, #0x2                ; =2
 461ffe8: 14000004     	b	0x461fff8 <_ChromeMain+0x461ad5c>
 461ffec: 52800068     	mov	w8, #0x3                ; =3
 461fff0: 14000002     	b	0x461fff8 <_ChromeMain+0x461ad5c>
 461fff4: 52800028     	mov	w8, #0x1                ; =1
 461fff8: b904c008     	str	w8, [x0, #0x4c0]
 461fffc: d65f03c0     	ret
 4620000: 6f00e400     	movi.2d	v0, #0000000000000000
 4620004: fd026000     	str	d0, [x0, #0x4c0]
 4620008: d65f03c0     	ret
 462000c: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4620010: a90157f6     	stp	x22, x21, [sp, #0x10]
 4620014: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4620018: a9037bfd     	stp	x29, x30, [sp, #0x30]
 462001c: 9100c3fd     	add	x29, sp, #0x30
 4620020: f942a008     	ldr	x8, [x0, #0x540]
 4620024: eb08003f     	cmp	x1, x8
 4620028: 540000c0     	b.eq	0x4620040 <_ChromeMain+0x461ada4>
 462002c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4620030: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4620034: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4620038: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 462003c: d65f03c0     	ret
 4620040: aa0003f3     	mov	x19, x0
 4620044: f9429c08     	ldr	x8, [x0, #0x538]
 4620048: b4ffff28     	cbz	x8, 0x462002c <_ChromeMain+0x461ad90>
 462004c: f9433275     	ldr	x21, [x19, #0x660]
 4620050: f9433668     	ldr	x8, [x19, #0x668]
 4620054: d37df116     	lsl	x22, x8, #3
 4620058: b50001f6     	cbnz	x22, 0x4620094 <_ChromeMain+0x461adf8>
 462005c: aa1503e8     	mov	x8, x21
 4620060: 14000028     	b	0x4620100 <_ChromeMain+0x461ae64>
 4620064: aa1403e1     	mov	x1, x20
 4620068: 52800022     	mov	w2, #0x1                ; =1
 462006c: 52800003     	mov	w3, #0x0                ; =0
 4620070: d2800004     	mov	x4, #0x0                ; =0
 4620074: 9760c56d     	bl	0x1e51628 <_ChromeMain+0x1e4c38c>
 4620078: f9400288     	ldr	x8, [x20]
 462007c: f9402908     	ldr	x8, [x8, #0x50]
 4620080: aa1403e0     	mov	x0, x20
 4620084: d63f0100     	blr	x8
 4620088: 910022b5     	add	x21, x21, #0x8
 462008c: f10022d6     	subs	x22, x22, #0x8
 4620090: 54000140     	b.eq	0x46200b8 <_ChromeMain+0x461ae1c>
 4620094: f94002b4     	ldr	x20, [x21]
 4620098: b4ffff94     	cbz	x20, 0x4620088 <_ChromeMain+0x461adec>
 462009c: f940c688     	ldr	x8, [x20, #0x188]
 46200a0: f9429e60     	ldr	x0, [x19, #0x538]
 46200a4: eb08001f     	cmp	x0, x8
 46200a8: 54ffff01     	b.ne	0x4620088 <_ChromeMain+0x461adec>
 46200ac: 3945a688     	ldrb	w8, [x20, #0x169]
 46200b0: 35000648     	cbnz	w8, 0x4620178 <_ChromeMain+0x461aedc>
 46200b4: 17ffffec     	b	0x4620064 <_ChromeMain+0x461adc8>
 46200b8: f9433275     	ldr	x21, [x19, #0x660]
 46200bc: f9433668     	ldr	x8, [x19, #0x668]
 46200c0: d37df114     	lsl	x20, x8, #3
 46200c4: b4fffcd4     	cbz	x20, 0x462005c <_ChromeMain+0x461adc0>
 46200c8: d10022b6     	sub	x22, x21, #0x8
 46200cc: d0052c97     	adrp	x23, 0xebb2000 <dyld_stub_binder+0xebb2000>
 46200d0: ab1402d8     	adds	x24, x22, x20
 46200d4: 54000560     	b.eq	0x4620180 <_ChromeMain+0x461aee4>
 46200d8: f9400300     	ldr	x0, [x24]
 46200dc: 925e7408     	and	x8, x0, #0xfffffffc00000000
 46200e0: f94046e9     	ldr	x9, [x23, #0x88]
 46200e4: eb09011f     	cmp	x8, x9
 46200e8: 54000041     	b.ne	0x46200f0 <_ChromeMain+0x461ae54>
 46200ec: 96e81a56     	bl	0x26a44 <_ChromeMain+0x217a8>
 46200f0: f900031f     	str	xzr, [x24]
 46200f4: d1002294     	sub	x20, x20, #0x8
 46200f8: b5fffed4     	cbnz	x20, 0x46200d0 <_ChromeMain+0x461ae34>
 46200fc: f9433268     	ldr	x8, [x19, #0x660]
 4620100: cb0802a8     	sub	x8, x21, x8
 4620104: 9343fd08     	asr	x8, x8, #3
 4620108: f9033668     	str	x8, [x19, #0x668]
 462010c: 39218a7f     	strb	wzr, [x19, #0x862]
 4620110: f9429e60     	ldr	x0, [x19, #0x538]
 4620114: b4fff8c0     	cbz	x0, 0x462002c <_ChromeMain+0x461ad90>
 4620118: 39618e68     	ldrb	w8, [x19, #0x863]
 462011c: 3707f888     	tbnz	w8, #0x0, 0x462002c <_ChromeMain+0x461ad90>
 4620120: 395d0a68     	ldrb	w8, [x19, #0x742]
 4620124: 3707f848     	tbnz	w8, #0x0, 0x462002c <_ChromeMain+0x461ad90>
 4620128: d2800001     	mov	x1, #0x0                ; =0
 462012c: d2800002     	mov	x2, #0x0                ; =0
 4620130: 9786c64c     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 4620134: 3961e268     	ldrb	w8, [x19, #0x878]
 4620138: 34000048     	cbz	w8, 0x4620140 <_ChromeMain+0x461aea4>
 462013c: 3921e27f     	strb	wzr, [x19, #0x878]
 4620140: f9429e60     	ldr	x0, [x19, #0x538]
 4620144: 52800001     	mov	w1, #0x0                ; =0
 4620148: 970040cb     	bl	0x630474 <_ChromeMain+0x62b1d8>
 462014c: aa1303e0     	mov	x0, x19
 4620150: 52800001     	mov	w1, #0x0                ; =0
 4620154: 970040c8     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4620158: f9400268     	ldr	x8, [x19]
 462015c: f9418501     	ldr	x1, [x8, #0x308]
 4620160: aa1303e0     	mov	x0, x19
 4620164: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4620168: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 462016c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4620170: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4620174: d61f0020     	br	x1
 4620178: d4200000     	brk	#0
 462017c: d4400000     	hlt	#0
 4620180: d4200020     	brk	#0x1
 4620184: d1142000     	sub	x0, x0, #0x508
 4620188: 17ffffa1     	b	0x462000c <_ChromeMain+0x461ad70>
 462018c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4620190: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4620194: 910043fd     	add	x29, sp, #0x10
 4620198: b4000181     	cbz	x1, 0x46201c8 <_ChromeMain+0x461af2c>
 462019c: aa0003f4     	mov	x20, x0
 46201a0: f9429008     	ldr	x8, [x0, #0x520]
 46201a4: b4000128     	cbz	x8, 0x46201c8 <_ChromeMain+0x461af2c>
 46201a8: aa0203f3     	mov	x19, x2
 46201ac: f9400100     	ldr	x0, [x8]
 46201b0: 96f5a8df     	bl	0x38a52c <_ChromeMain+0x385290>
 46201b4: aa0003e8     	mov	x8, x0
 46201b8: 3100051f     	cmn	w8, #0x1
 46201bc: 1a9f07e9     	cset	w9, ne
 46201c0: 6a09003f     	tst	w1, w9
 46201c4: 540000a1     	b.ne	0x46201d8 <_ChromeMain+0x461af3c>
 46201c8: 52800000     	mov	w0, #0x0                ; =0
 46201cc: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46201d0: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46201d4: d65f03c0     	ret
 46201d8: f9429280     	ldr	x0, [x20, #0x520]
 46201dc: aa0803e1     	mov	x1, x8
 46201e0: aa1303e2     	mov	x2, x19
 46201e4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46201e8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46201ec: 17ba7255     	b	0x34bcb40 <_ChromeMain+0x34b78a4>
 46201f0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46201f4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46201f8: 910043fd     	add	x29, sp, #0x10
 46201fc: b4000181     	cbz	x1, 0x462022c <_ChromeMain+0x461af90>
 4620200: aa0003f4     	mov	x20, x0
 4620204: f9400808     	ldr	x8, [x0, #0x10]
 4620208: b4000128     	cbz	x8, 0x462022c <_ChromeMain+0x461af90>
 462020c: aa0203f3     	mov	x19, x2
 4620210: f9400100     	ldr	x0, [x8]
 4620214: 96f5a8c6     	bl	0x38a52c <_ChromeMain+0x385290>
 4620218: aa0003e8     	mov	x8, x0
 462021c: 3100051f     	cmn	w8, #0x1
 4620220: 1a9f07e9     	cset	w9, ne
 4620224: 6a09003f     	tst	w1, w9
 4620228: 540000a1     	b.ne	0x462023c <_ChromeMain+0x461afa0>
 462022c: 52800000     	mov	w0, #0x0                ; =0
 4620230: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4620234: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4620238: d65f03c0     	ret
 462023c: f9400a80     	ldr	x0, [x20, #0x10]
 4620240: aa0803e1     	mov	x1, x8
 4620244: aa1303e2     	mov	x2, x19
 4620248: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 462024c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4620250: 17ba723c     	b	0x34bcb40 <_ChromeMain+0x34b78a4>
 4620254: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4620258: a9017bfd     	stp	x29, x30, [sp, #0x10]
 462025c: 910043fd     	add	x29, sp, #0x10
 4620260: b4000181     	cbz	x1, 0x4620290 <_ChromeMain+0x461aff4>
 4620264: aa0003f4     	mov	x20, x0
 4620268: f9429008     	ldr	x8, [x0, #0x520]
 462026c: b4000128     	cbz	x8, 0x4620290 <_ChromeMain+0x461aff4>
 4620270: aa0203f3     	mov	x19, x2
 4620274: f9400100     	ldr	x0, [x8]
 4620278: 96f5a8ad     	bl	0x38a52c <_ChromeMain+0x385290>
 462027c: aa0003e8     	mov	x8, x0
 4620280: 3100051f     	cmn	w8, #0x1
 4620284: 1a9f07e9     	cset	w9, ne
 4620288: 6a09003f     	tst	w1, w9
 462028c: 54000081     	b.ne	0x462029c <_ChromeMain+0x461b000>
 4620290: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4620294: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4620298: d65f03c0     	ret
 462029c: f9429280     	ldr	x0, [x20, #0x520]
 46202a0: aa0803e1     	mov	x1, x8
 46202a4: aa1303e2     	mov	x2, x19
 46202a8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46202ac: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46202b0: 17ef0dfd     	b	0x41e3aa4 <_ChromeMain+0x41de808>
 46202b4: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46202b8: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46202bc: 910043fd     	add	x29, sp, #0x10
 46202c0: b4000181     	cbz	x1, 0x46202f0 <_ChromeMain+0x461b054>
 46202c4: aa0003f4     	mov	x20, x0
 46202c8: f9400808     	ldr	x8, [x0, #0x10]
 46202cc: b4000128     	cbz	x8, 0x46202f0 <_ChromeMain+0x461b054>
 46202d0: aa0203f3     	mov	x19, x2
 46202d4: f9400100     	ldr	x0, [x8]
 46202d8: 96f5a895     	bl	0x38a52c <_ChromeMain+0x385290>
 46202dc: aa0003e8     	mov	x8, x0
 46202e0: 3100051f     	cmn	w8, #0x1
 46202e4: 1a9f07e9     	cset	w9, ne
 46202e8: 6a09003f     	tst	w1, w9
 46202ec: 54000081     	b.ne	0x46202fc <_ChromeMain+0x461b060>
 46202f0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46202f4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46202f8: d65f03c0     	ret
 46202fc: f9400a80     	ldr	x0, [x20, #0x10]
 4620300: aa0803e1     	mov	x1, x8
 4620304: aa1303e2     	mov	x2, x19
 4620308: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 462030c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4620310: 17ef0de5     	b	0x41e3aa4 <_ChromeMain+0x41de808>
 4620314: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4620318: a9014ff4     	stp	x20, x19, [sp, #0x10]
 462031c: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4620320: 910083fd     	add	x29, sp, #0x20
 4620324: aa0203f3     	mov	x19, x2
 4620328: aa0103f5     	mov	x21, x1
 462032c: aa0003f4     	mov	x20, x0
 4620330: f9400008     	ldr	x8, [x0]
 4620334: f9403508     	ldr	x8, [x8, #0x68]
 4620338: d63f0100     	blr	x8
 462033c: b4000100     	cbz	x0, 0x462035c <_ChromeMain+0x461b0c0>
 4620340: 51000aa8     	sub	w8, w21, #0x2
 4620344: 7100251f     	cmp	w8, #0x9
 4620348: 1a9f27e9     	cset	w9, lo
 462034c: 528020ea     	mov	w10, #0x107             ; =263
 4620350: 1ac8254a     	lsr	w10, w10, w8
 4620354: 6a0a013f     	tst	w9, w10
 4620358: 540000c1     	b.ne	0x4620370 <_ChromeMain+0x461b0d4>
 462035c: 52800000     	mov	w0, #0x0                ; =0
 4620360: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4620364: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4620368: a8c357f6     	ldp	x22, x21, [sp], #0x30
 462036c: d65f03c0     	ret
 4620370: b0048629     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4620374: 9100d129     	add	x9, x9, #0x34
 4620378: 78685935     	ldrh	w21, [x9, w8, uxtw #1]
 462037c: f9400288     	ldr	x8, [x20]
 4620380: f9403508     	ldr	x8, [x8, #0x68]
 4620384: aa1403e0     	mov	x0, x20
 4620388: d63f0100     	blr	x8
 462038c: f9400008     	ldr	x8, [x0]
 4620390: f940bd03     	ldr	x3, [x8, #0x178]
 4620394: aa1503e1     	mov	x1, x21
 4620398: aa1303e2     	mov	x2, x19
 462039c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 46203a0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 46203a4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 46203a8: d61f0060     	br	x3
 46203ac: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 46203b0: a9014ff4     	stp	x20, x19, [sp, #0x10]
 46203b4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 46203b8: 910083fd     	add	x29, sp, #0x20
 46203bc: aa0203f3     	mov	x19, x2
 46203c0: aa0103f5     	mov	x21, x1
 46203c4: d1144014     	sub	x20, x0, #0x510
 46203c8: f9400288     	ldr	x8, [x20]
 46203cc: f9403508     	ldr	x8, [x8, #0x68]
 46203d0: aa1403e0     	mov	x0, x20
 46203d4: d63f0100     	blr	x8
 46203d8: b4000100     	cbz	x0, 0x46203f8 <_ChromeMain+0x461b15c>
 46203dc: 51000aa8     	sub	w8, w21, #0x2
 46203e0: 7100251f     	cmp	w8, #0x9
 46203e4: 1a9f27e9     	cset	w9, lo
 46203e8: 528020ea     	mov	w10, #0x107             ; =263
 46203ec: 1ac8254a     	lsr	w10, w10, w8
 46203f0: 6a0a013f     	tst	w9, w10
 46203f4: 540000c1     	b.ne	0x462040c <_ChromeMain+0x461b170>
 46203f8: 52800000     	mov	w0, #0x0                ; =0
 46203fc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4620400: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4620404: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4620408: d65f03c0     	ret
 462040c: b0048629     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 4620410: 9100d129     	add	x9, x9, #0x34
 4620414: 78685935     	ldrh	w21, [x9, w8, uxtw #1]
 4620418: f9400288     	ldr	x8, [x20]
 462041c: f9403508     	ldr	x8, [x8, #0x68]
