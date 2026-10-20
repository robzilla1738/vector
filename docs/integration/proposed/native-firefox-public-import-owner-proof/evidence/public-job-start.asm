
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427acfc: d10243ff     	sub	sp, sp, #0x90
 427ad00: a9055ff8     	stp	x24, x23, [sp, #0x50]
 427ad04: a90657f6     	stp	x22, x21, [sp, #0x60]
 427ad08: a9074ff4     	stp	x20, x19, [sp, #0x70]
 427ad0c: a9087bfd     	stp	x29, x30, [sp, #0x80]
 427ad10: 910203fd     	add	x29, sp, #0x80
 427ad14: aa0003f3     	mov	x19, x0
 427ad18: f9405408     	ldr	x8, [x0, #0xa8]
 427ad1c: b40013c8     	cbz	x8, 0x427af94 <_ChromeMain+0x4275cf8>
 427ad20: 91016277     	add	x23, x19, #0x58
 427ad24: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427ad28: 37f811e8     	tbnz	w8, #0x1f, 0x427af64 <_ChromeMain+0x4275cc8>
 427ad2c: 528000e8     	mov	w8, #0x7                ; =7
 427ad30: 3901be68     	strb	w8, [x19, #0x6f]
 427ad34: 91016268     	add	x8, x19, #0x58
 427ad38: 528d2dc9     	mov	w9, #0x696e             ; =26990
 427ad3c: 72acedc9     	movk	w9, #0x676e, lsl #16
 427ad40: b8003109     	stur	w9, [x8, #0x3]
 427ad44: 528eae49     	mov	w9, #0x7572             ; =30066
 427ad48: 72adcdc9     	movk	w9, #0x6e6e, lsl #16
 427ad4c: b9000109     	str	w9, [x8]
 427ad50: 39001d1f     	strb	wzr, [x8, #0x7]
 427ad54: b201e7e8     	mov	x8, #-0x6666666666666667 ; =-7378697629483820647
 427ad58: f2933348     	movk	x8, #0x999a
 427ad5c: f2e7f728     	movk	x8, #0x3fb9, lsl #48
 427ad60: f9003a68     	str	x8, [x19, #0x70]
 427ad64: aa1303e0     	mov	x0, x19
 427ad68: 97fffad7     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427ad6c: 52801800     	mov	w0, #0xc0               ; =192
 427ad70: 96f6517e     	bl	0xf368 <_ChromeMain+0xa0cc>
 427ad74: aa0003f4     	mov	x20, x0
 427ad78: f9405675     	ldr	x21, [x19, #0xa8]
 427ad7c: 39434276     	ldrb	w22, [x19, #0xd0]
 427ad80: 3900c3ff     	strb	wzr, [sp, #0x30]
 427ad84: 390123ff     	strb	wzr, [sp, #0x48]
 427ad88: 39432268     	ldrb	w8, [x19, #0xc8]
 427ad8c: 34000128     	cbz	w8, 0x427adb0 <_ChromeMain+0x4275b14>
 427ad90: 39c31e68     	ldrsb	w8, [x19, #0xc7]
 427ad94: 37f80f08     	tbnz	w8, #0x1f, 0x427af74 <_ChromeMain+0x4275cd8>
 427ad98: 3ccb0260     	ldur	q0, [x19, #0xb0]
 427ad9c: 3d800fe0     	str	q0, [sp, #0x30]
 427ada0: f84c0268     	ldur	x8, [x19, #0xc0]
 427ada4: f90023e8     	str	x8, [sp, #0x40]
 427ada8: 52800028     	mov	w8, #0x1                ; =1
 427adac: 390123e8     	strb	w8, [sp, #0x48]
 427adb0: 9100c3e3     	add	x3, sp, #0x30
 427adb4: aa1403e0     	mov	x0, x20
 427adb8: aa1503e1     	mov	x1, x21
 427adbc: aa1603e2     	mov	x2, x22
 427adc0: 97ff9f80     	bl	0x4262bc0 <_ChromeMain+0x425d924>
 427adc4: 394123e8     	ldrb	w8, [sp, #0x48]
 427adc8: 340000e8     	cbz	w8, 0x427ade4 <_ChromeMain+0x4275b48>
 427adcc: 39c11fe8     	ldrsb	w8, [sp, #0x47]
 427add0: 36f800a8     	tbz	w8, #0x1f, 0x427ade4 <_ChromeMain+0x4275b48>
 427add4: f9401be0     	ldr	x0, [sp, #0x30]
 427add8: f94023e8     	ldr	x8, [sp, #0x40]
 427addc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427ade0: 96f63836     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ade4: f9406e60     	ldr	x0, [x19, #0xd8]
 427ade8: f9006e74     	str	x20, [x19, #0xd8]
 427adec: b40000a0     	cbz	x0, 0x427ae00 <_ChromeMain+0x4275b64>
 427adf0: 97ff9fb1     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 427adf4: 52801801     	mov	w1, #0xc0               ; =192
 427adf8: 96f63830     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427adfc: f9406e74     	ldr	x20, [x19, #0xd8]
 427ae00: 3901c29f     	strb	wzr, [x20, #0x70]
 427ae04: f9406e74     	ldr	x20, [x19, #0xd8]
 427ae08: f9407675     	ldr	x21, [x19, #0xe8]
 427ae0c: b40000d5     	cbz	x21, 0x427ae24 <_ChromeMain+0x4275b88>
 427ae10: 52800028     	mov	w8, #0x1                ; =1
 427ae14: b82802a8     	ldadd	w8, w8, [x21]
 427ae18: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 427ae1c: 6b09011f     	cmp	w8, w9
 427ae20: 54001880     	b.eq	0x427b130 <_ChromeMain+0x4275e94>
 427ae24: f9407a76     	ldr	x22, [x19, #0xf0]
 427ae28: 52800800     	mov	w0, #0x40               ; =64
 427ae2c: 96f6514f     	bl	0xf368 <_ChromeMain+0xa0cc>
 427ae30: aa0003e2     	mov	x2, x0
 427ae34: 52800028     	mov	w8, #0x1                ; =1
 427ae38: b0ffe7a9     	adrp	x9, 0x3f6f000 <_ChromeMain+0x3f69d64>
 427ae3c: 91018129     	add	x9, x9, #0x60
 427ae40: 90ffe92a     	adrp	x10, 0x3f9e000 <_ChromeMain+0x3f98d64>
 427ae44: 9111014a     	add	x10, x10, #0x440
 427ae48: b9000008     	str	w8, [x0]
 427ae4c: 90ffef88     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 427ae50: 910a0108     	add	x8, x8, #0x280
 427ae54: 100021eb     	adr	x11, 0x427b290 <_ChromeMain+0x4275ff4>
 427ae58: d503201f     	nop
 427ae5c: a900a809     	stp	x9, x10, [x0, #0x8]
 427ae60: a901ac08     	stp	x8, x11, [x0, #0x18]
 427ae64: a902d41f     	stp	xzr, x21, [x0, #0x28]
 427ae68: f9001c16     	str	x22, [x0, #0x38]
 427ae6c: aa1403e0     	mov	x0, x20
 427ae70: 52800021     	mov	w1, #0x1                ; =1
 427ae74: 97ff9ff4     	bl	0x4262e44 <_ChromeMain+0x425dba8>
 427ae78: 370011a0     	tbnz	w0, #0x0, 0x427b0ac <_ChromeMain+0x4275e10>
 427ae7c: 528000c8     	mov	w8, #0x6                ; =6
 427ae80: 39005fe8     	strb	w8, [sp, #0x17]
 427ae84: 910003e8     	mov	x8, sp
 427ae88: b27f0509     	orr	x9, x8, #0x6
 427ae8c: 9004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427ae90: 9110c14a     	add	x10, x10, #0x430
 427ae94: eb0a013f     	cmp	x9, x10
 427ae98: fa4a8102     	ccmp	x8, x10, #0x2, hi
 427ae9c: 54001489     	b.ls	0x427b12c <_ChromeMain+0x4275e90>
 427aea0: 528c8ca8     	mov	w8, #0x6465             ; =25701
 427aea4: 79000be8     	strh	w8, [sp, #0x4]
 427aea8: 528c2cc8     	mov	w8, #0x6166             ; =24934
 427aeac: 72ad8d28     	movk	w8, #0x6c69, lsl #16
 427aeb0: b90003e8     	str	w8, [sp]
 427aeb4: 39001bff     	strb	wzr, [sp, #0x6]
 427aeb8: 52800400     	mov	w0, #0x20               ; =32
 427aebc: 96f6512b     	bl	0xf368 <_ChromeMain+0xa0cc>
 427aec0: 91007809     	add	x9, x0, #0x1e
 427aec4: eb00013f     	cmp	x9, x0
 427aec8: 54001323     	b.lo	0x427b12c <_ChromeMain+0x4275e90>
 427aecc: aa0003f4     	mov	x20, x0
 427aed0: b004c548     	adrp	x8, 0xdb23000 <dyld_stub_binder+0xdb23000>
 427aed4: 91124508     	add	x8, x8, #0x491
 427aed8: eb08013f     	cmp	x9, x8
 427aedc: fa488002     	ccmp	x0, x8, #0x2, hi
 427aee0: 54001269     	b.ls	0x427b12c <_ChromeMain+0x4275e90>
 427aee4: 3dc00100     	ldr	q0, [x8]
 427aee8: 3d800280     	str	q0, [x20]
 427aeec: 3cc0e100     	ldur	q0, [x8, #0xe]
 427aef0: 3c80e280     	stur	q0, [x20, #0xe]
 427aef4: 39007a9f     	strb	wzr, [x20, #0x1e]
 427aef8: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427aefc: 37f81048     	tbnz	w8, #0x1f, 0x427b104 <_ChromeMain+0x4275e68>
 427af00: 3dc003e0     	ldr	q0, [sp]
 427af04: 3d8002e0     	str	q0, [x23]
 427af08: f9400be8     	ldr	x8, [sp, #0x10]
 427af0c: f9000ae8     	str	x8, [x23, #0x10]
 427af10: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427af14: 37f81028     	tbnz	w8, #0x1f, 0x427b118 <_ChromeMain+0x4275e7c>
 427af18: f9004a74     	str	x20, [x19, #0x90]
 427af1c: b004e608     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 427af20: 3dc10500     	ldr	q0, [x8, #0x410]
 427af24: 3c898260     	stur	q0, [x19, #0x98]
 427af28: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427af2c: 37f802c8     	tbnz	w8, #0x1f, 0x427af84 <_ChromeMain+0x4275ce8>
 427af30: 3901e27f     	strb	wzr, [x19, #0x78]
 427af34: 39023e7f     	strb	wzr, [x19, #0x8f]
 427af38: 3941be69     	ldrb	w9, [x19, #0x6f]
 427af3c: 13001d28     	sxtb	w8, w9
 427af40: f940326a     	ldr	x10, [x19, #0x60]
 427af44: 7100011f     	cmp	w8, #0x0
 427af48: 9a894149     	csel	x9, x10, x9, mi
 427af4c: f100253f     	cmp	x9, #0x9
 427af50: 54000a61     	b.ne	0x427b09c <_ChromeMain+0x4275e00>
 427af54: f94002e9     	ldr	x9, [x23]
 427af58: 7100011f     	cmp	w8, #0x0
 427af5c: 9a974128     	csel	x8, x9, x23, mi
 427af60: 14000046     	b	0x427b078 <_ChromeMain+0x4275ddc>
 427af64: 528000e8     	mov	w8, #0x7                ; =7
 427af68: f9003268     	str	x8, [x19, #0x60]
 427af6c: f9402e68     	ldr	x8, [x19, #0x58]
 427af70: 17ffff72     	b	0x427ad38 <_ChromeMain+0x4275a9c>
 427af74: a94b0a61     	ldp	x1, x2, [x19, #0xb0]
 427af78: 9100c3e0     	add	x0, sp, #0x30
 427af7c: 96f674a7     	bl	0x18218 <_ChromeMain+0x12f7c>
 427af80: 17ffff8a     	b	0x427ada8 <_ChromeMain+0x4275b0c>
 427af84: f9403e68     	ldr	x8, [x19, #0x78]
 427af88: 3900011f     	strb	wzr, [x8]
 427af8c: f900427f     	str	xzr, [x19, #0x80]
 427af90: 17ffffea     	b	0x427af38 <_ChromeMain+0x4275c9c>
 427af94: 528000c8     	mov	w8, #0x6                ; =6
 427af98: 3900bfe8     	strb	w8, [sp, #0x2f]
 427af9c: 910063e8     	add	x8, sp, #0x18
 427afa0: b27f0509     	orr	x9, x8, #0x6
 427afa4: 9004648a     	adrp	x10, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427afa8: 9110c14a     	add	x10, x10, #0x430
 427afac: eb0a013f     	cmp	x9, x10
 427afb0: fa4a8102     	ccmp	x8, x10, #0x2, hi
 427afb4: 54000bc9     	b.ls	0x427b12c <_ChromeMain+0x4275e90>
 427afb8: 528c8ca8     	mov	w8, #0x6465             ; =25701
 427afbc: 79003be8     	strh	w8, [sp, #0x1c]
 427afc0: 528c2cc8     	mov	w8, #0x6166             ; =24934
 427afc4: 72ad8d28     	movk	w8, #0x6c69, lsl #16
 427afc8: b9001be8     	str	w8, [sp, #0x18]
 427afcc: 39007bff     	strb	wzr, [sp, #0x1e]
 427afd0: 52800600     	mov	w0, #0x30               ; =48
 427afd4: 96f650e5     	bl	0xf368 <_ChromeMain+0xa0cc>
 427afd8: 91008409     	add	x9, x0, #0x21
 427afdc: eb00013f     	cmp	x9, x0
 427afe0: 54000a63     	b.lo	0x427b12c <_ChromeMain+0x4275e90>
 427afe4: aa0003f4     	mov	x20, x0
 427afe8: 90046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427afec: 910ef508     	add	x8, x8, #0x3bd
 427aff0: eb08013f     	cmp	x9, x8
 427aff4: fa488002     	ccmp	x0, x8, #0x2, hi
 427aff8: 540009a9     	b.ls	0x427b12c <_ChromeMain+0x4275e90>
 427affc: 52800ca9     	mov	w9, #0x65               ; =101
 427b000: 79004289     	strh	w9, [x20, #0x20]
 427b004: ad400500     	ldp	q0, q1, [x8]
 427b008: ad000680     	stp	q0, q1, [x20]
 427b00c: 91016275     	add	x21, x19, #0x58
 427b010: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427b014: 37f806e8     	tbnz	w8, #0x1f, 0x427b0f0 <_ChromeMain+0x4275e54>
 427b018: 3cc183e0     	ldur	q0, [sp, #0x18]
 427b01c: 3d8002a0     	str	q0, [x21]
 427b020: f94017e8     	ldr	x8, [sp, #0x28]
 427b024: f9000aa8     	str	x8, [x21, #0x10]
 427b028: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427b02c: 37f80588     	tbnz	w8, #0x1f, 0x427b0dc <_ChromeMain+0x4275e40>
 427b030: f9004a74     	str	x20, [x19, #0x90]
 427b034: f004e5e8     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 427b038: 3dc2f100     	ldr	q0, [x8, #0xbc0]
 427b03c: 3c898260     	stur	q0, [x19, #0x98]
 427b040: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427b044: 37f80448     	tbnz	w8, #0x1f, 0x427b0cc <_ChromeMain+0x4275e30>
 427b048: 3901e27f     	strb	wzr, [x19, #0x78]
 427b04c: 39023e7f     	strb	wzr, [x19, #0x8f]
 427b050: 3941be69     	ldrb	w9, [x19, #0x6f]
 427b054: 13001d28     	sxtb	w8, w9
 427b058: f940326a     	ldr	x10, [x19, #0x60]
 427b05c: 7100011f     	cmp	w8, #0x0
 427b060: 9a894149     	csel	x9, x10, x9, mi
 427b064: f100253f     	cmp	x9, #0x9
 427b068: 540001a1     	b.ne	0x427b09c <_ChromeMain+0x4275e00>
 427b06c: f94002a9     	ldr	x9, [x21]
 427b070: 7100011f     	cmp	w8, #0x0
 427b074: 9a954128     	csel	x8, x9, x21, mi
 427b078: f9400109     	ldr	x9, [x8]
 427b07c: 39402108     	ldrb	w8, [x8, #0x8]
 427b080: 7101911f     	cmp	w8, #0x64
 427b084: d28eae68     	mov	x8, #0x7573             ; =30067
 427b088: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427b08c: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427b090: f2ecac88     	movk	x8, #0x6564, lsl #48
 427b094: fa480120     	ccmp	x9, x8, #0x0, eq
 427b098: 54000160     	b.eq	0x427b0c4 <_ChromeMain+0x4275e28>
 427b09c: fd403a60     	ldr	d0, [x19, #0x70]
 427b0a0: fd003a60     	str	d0, [x19, #0x70]
 427b0a4: aa1303e0     	mov	x0, x19
 427b0a8: 97fffa07     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427b0ac: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 427b0b0: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 427b0b4: a94657f6     	ldp	x22, x21, [sp, #0x60]
 427b0b8: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 427b0bc: 910243ff     	add	sp, sp, #0x90
 427b0c0: d65f03c0     	ret
 427b0c4: 1e6e1000     	fmov	d0, #1.00000000
 427b0c8: 17fffff6     	b	0x427b0a0 <_ChromeMain+0x4275e04>
 427b0cc: f9403e68     	ldr	x8, [x19, #0x78]
 427b0d0: 3900011f     	strb	wzr, [x8]
 427b0d4: f900427f     	str	xzr, [x19, #0x80]
 427b0d8: 17ffffde     	b	0x427b050 <_ChromeMain+0x4275db4>
 427b0dc: f9404a60     	ldr	x0, [x19, #0x90]
 427b0e0: f9405268     	ldr	x8, [x19, #0xa0]
 427b0e4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b0e8: 96f63774     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b0ec: 17ffffd1     	b	0x427b030 <_ChromeMain+0x4275d94>
 427b0f0: f9402e60     	ldr	x0, [x19, #0x58]
 427b0f4: f9403668     	ldr	x8, [x19, #0x68]
 427b0f8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b0fc: 96f6376f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b100: 17ffffc6     	b	0x427b018 <_ChromeMain+0x4275d7c>
 427b104: f9402e60     	ldr	x0, [x19, #0x58]
 427b108: f9403668     	ldr	x8, [x19, #0x68]
 427b10c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b110: 96f6376a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b114: 17ffff7b     	b	0x427af00 <_ChromeMain+0x4275c64>
 427b118: f9404a60     	ldr	x0, [x19, #0x90]
 427b11c: f9405268     	ldr	x8, [x19, #0xa0]
 427b120: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427b124: 96f63765     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427b128: 17ffff7c     	b	0x427af18 <_ChromeMain+0x4275c7c>
 427b12c: d4200020     	brk	#0x1
 427b130: d4200000     	brk	#0
 427b134: d4400000     	hlt	#0
 427b138: d4200020     	brk	#0x1
