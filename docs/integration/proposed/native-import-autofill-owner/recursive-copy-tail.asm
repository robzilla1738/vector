
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425def8: 363800b3     	tbz	w19, #0x7, 0x425df0c <_ChromeMain+0x4258c70>
 425defc: f940cbe0     	ldr	x0, [sp, #0x190]
 425df00: f940d3e8     	ldr	x8, [sp, #0x1a0]
 425df04: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425df08: 96f6abec     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425df0c: f85103b3     	ldur	x19, [x29, #-0xf0]
 425df10: b5000073     	cbnz	x19, 0x425df1c <_ChromeMain+0x4258c80>
 425df14: 3707c3b5     	tbnz	w21, #0x0, 0x425d788 <_ChromeMain+0x42584ec>
 425df18: 17fffdde     	b	0x425d690 <_ChromeMain+0x42583f4>
 425df1c: aa1603fa     	mov	x26, x22
 425df20: f85183a8     	ldur	x8, [x29, #-0xe8]
 425df24: 8b080509     	add	x9, x8, x8, lsl #1
 425df28: d37df129     	lsl	x9, x9, #3
 425df2c: b4003329     	cbz	x9, 0x425e590 <_ChromeMain+0x42592f4>
 425df30: 8b090269     	add	x9, x19, x9
 425df34: d1006136     	sub	x22, x9, #0x18
 425df38: d37df109     	lsl	x9, x8, #3
 425df3c: cb081537     	sub	x23, x9, x8, lsl #5
 425df40: b4000316     	cbz	x22, 0x425dfa0 <_ChromeMain+0x4258d04>
 425df44: 39c05ec8     	ldrsb	w8, [x22, #0x17]
 425df48: 37f80228     	tbnz	w8, #0x1f, 0x425df8c <_ChromeMain+0x4258cf0>
 425df4c: d10062d6     	sub	x22, x22, #0x18
 425df50: b10062f7     	adds	x23, x23, #0x18
 425df54: 54ffff61     	b.ne	0x425df40 <_ChromeMain+0x4258ca4>
 425df58: f85103a0     	ldur	x0, [x29, #-0xf0]
 425df5c: cb000268     	sub	x8, x19, x0
 425df60: 9343fd08     	asr	x8, x8, #3
 425df64: b201f3e9     	mov	x9, #-0x5555555555555556 ; =-6148914691236517206
 425df68: f2955569     	movk	x9, #0xaaab
 425df6c: 9b097d08     	mul	x8, x8, x9
 425df70: f81183a8     	stur	x8, [x29, #-0xe8]
 425df74: f85203a8     	ldur	x8, [x29, #-0xe0]
 425df78: 8b080508     	add	x8, x8, x8, lsl #1
 425df7c: d37df101     	lsl	x1, x8, #3
 425df80: 96f6abce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425df84: aa1a03f6     	mov	x22, x26
 425df88: 17ffffe3     	b	0x425df14 <_ChromeMain+0x4258c78>
 425df8c: f94002c0     	ldr	x0, [x22]
 425df90: f9400ac8     	ldr	x8, [x22, #0x10]
 425df94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425df98: 96f6abc8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425df9c: 17ffffec     	b	0x425df4c <_ChromeMain+0x4258cb0>
 425dfa0: d4200020     	brk	#0x1
 425dfa4: 3dc03660     	ldr	q0, [x19, #0xd0]
 425dfa8: 3d803e60     	str	q0, [x19, #0xf0]
 425dfac: f940c3e8     	ldr	x8, [sp, #0x180]
 425dfb0: f900d3e8     	str	x8, [sp, #0x1a0]
 425dfb4: 14000016     	b	0x425e00c <_ChromeMain+0x4258d70>
 425dfb8: f85103a1     	ldur	x1, [x29, #-0xf0]
 425dfbc: 39805c22     	ldrsb	x2, [x1, #0x17]
 425dfc0: b6f80042     	tbz	x2, #0x3f, 0x425dfc8 <_ChromeMain+0x4258d2c>
 425dfc4: a9400821     	ldp	x1, x2, [x1]
 425dfc8: 910283f3     	add	x19, sp, #0xa0
 425dfcc: 9105c3e0     	add	x0, sp, #0x170
 425dfd0: 97124220     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 425dfd4: 39461fe8     	ldrb	w8, [sp, #0x187]
 425dfd8: 13001d09     	sxtb	w9, w8
 425dfdc: a9572fea     	ldp	x10, x11, [sp, #0x170]
 425dfe0: 7100013f     	cmp	w9, #0x0
 425dfe4: 9105c3e9     	add	x9, sp, #0x170
 425dfe8: 9a894140     	csel	x0, x10, x9, mi
 425dfec: 9a884161     	csel	x1, x11, x8, mi
 425dff0: 973782db     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 425dff4: 34002f00     	cbz	w0, 0x425e5d4 <_ChromeMain+0x4259338>
 425dff8: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 425dffc: 36fffd48     	tbz	w8, #0x1f, 0x425dfa4 <_ChromeMain+0x4258d08>
 425e000: a9570be1     	ldp	x1, x2, [sp, #0x170]
 425e004: 910643e0     	add	x0, sp, #0x190
 425e008: 96f6e884     	bl	0x18218 <_ChromeMain+0x12f7c>
 425e00c: 39469fe9     	ldrb	w9, [sp, #0x1a7]
 425e010: f940cfea     	ldr	x10, [sp, #0x198]
 425e014: 13001d28     	sxtb	w8, w9
 425e018: 7100011f     	cmp	w8, #0x0
 425e01c: 9a894149     	csel	x9, x10, x9, mi
 425e020: f100293f     	cmp	x9, #0xa
 425e024: 54000301     	b.ne	0x425e084 <_ChromeMain+0x4258de8>
 425e028: f940cbe9     	ldr	x9, [sp, #0x190]
 425e02c: 7100011f     	cmp	w8, #0x0
 425e030: 9a9c4129     	csel	x9, x9, x28, mi
 425e034: f940012a     	ldr	x10, [x9]
 425e038: 79401129     	ldrh	w9, [x9, #0x8]
 425e03c: d28f08ab     	mov	x11, #0x7845            ; =30789
 425e040: f2acae8b     	movk	x11, #0x6574, lsl #16
 425e044: f2ce6dcb     	movk	x11, #0x736e, lsl #32
 425e048: f2eded2b     	movk	x11, #0x6f69, lsl #48
 425e04c: eb0b015f     	cmp	x10, x11
 425e050: 528e6dca     	mov	w10, #0x736e            ; =29550
 425e054: 7a4a0120     	ccmp	w9, w10, #0x0, eq
 425e058: 1a9f07f3     	cset	w19, ne
 425e05c: 37f80188     	tbnz	w8, #0x1f, 0x425e08c <_ChromeMain+0x4258df0>
 425e060: 1400000f     	b	0x425e09c <_ChromeMain+0x4258e00>
 425e064: f940bbe0     	ldr	x0, [sp, #0x170]
 425e068: f940c3e8     	ldr	x8, [sp, #0x180]
 425e06c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425e070: 96f6ab92     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425e074: 3707af53     	tbnz	w19, #0x0, 0x425d65c <_ChromeMain+0x42583c0>
 425e078: 1400000c     	b	0x425e0a8 <_ChromeMain+0x4258e0c>
 425e07c: a9418901     	ldp	x1, x2, [x8, #0x18]
 425e080: 14000014     	b	0x425e0d0 <_ChromeMain+0x4258e34>
 425e084: 52800033     	mov	w19, #0x1               ; =1
 425e088: 36f800a8     	tbz	w8, #0x1f, 0x425e09c <_ChromeMain+0x4258e00>
 425e08c: f940cbe0     	ldr	x0, [sp, #0x190]
 425e090: f940d3e8     	ldr	x8, [sp, #0x1a0]
 425e094: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425e098: 96f6ab88     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425e09c: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 425e0a0: 37fffe28     	tbnz	w8, #0x1f, 0x425e064 <_ChromeMain+0x4258dc8>
 425e0a4: 3707add3     	tbnz	w19, #0x0, 0x425d65c <_ChromeMain+0x42583c0>
 425e0a8: a9197fff     	stp	xzr, xzr, [sp, #0x190]
 425e0ac: f900d3ff     	str	xzr, [sp, #0x1a0]
 425e0b0: f85183a8     	ldur	x8, [x29, #-0xe8]
 425e0b4: f100051f     	cmp	x8, #0x1
 425e0b8: 54fff749     	b.ls	0x425dfa0 <_ChromeMain+0x4258d04>
 425e0bc: f85103a8     	ldur	x8, [x29, #-0xf0]
 425e0c0: 3980bd02     	ldrsb	x2, [x8, #0x2f]
 425e0c4: 910283f3     	add	x19, sp, #0xa0
 425e0c8: b7fffda2     	tbnz	x2, #0x3f, 0x425e07c <_ChromeMain+0x4258de0>
 425e0cc: 91006101     	add	x1, x8, #0x18
 425e0d0: 9105c3e0     	add	x0, sp, #0x170
 425e0d4: 971241df     	bl	0x6ee850 <_ChromeMain+0x6e95b4>
 425e0d8: 39461fe8     	ldrb	w8, [sp, #0x187]
 425e0dc: 13001d09     	sxtb	w9, w8
 425e0e0: a9572fea     	ldp	x10, x11, [sp, #0x170]
 425e0e4: 7100013f     	cmp	w9, #0x0
 425e0e8: 9105c3e9     	add	x9, sp, #0x170
 425e0ec: 9a894140     	csel	x0, x10, x9, mi
 425e0f0: 9a884161     	csel	x1, x11, x8, mi
 425e0f4: 9737829a     	bl	0x103eb5c <_ChromeMain+0x10398c0>
 425e0f8: 34002780     	cbz	w0, 0x425e5e8 <_ChromeMain+0x425934c>
 425e0fc: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 425e100: 36f82228     	tbz	w8, #0x1f, 0x425e544 <_ChromeMain+0x42592a8>
 425e104: a9570be1     	ldp	x1, x2, [sp, #0x170]
 425e108: 910643e0     	add	x0, sp, #0x190
 425e10c: 96f6e843     	bl	0x18218 <_ChromeMain+0x12f7c>
 425e110: aa1603fa     	mov	x26, x22
 425e114: 39c61fe8     	ldrsb	w8, [sp, #0x187]
 425e118: 37f80448     	tbnz	w8, #0x1f, 0x425e1a0 <_ChromeMain+0x4258f04>
 425e11c: 39469fe8     	ldrb	w8, [sp, #0x1a7]
 425e120: 13001d13     	sxtb	w19, w8
 425e124: f940cfe9     	ldr	x9, [sp, #0x198]
 425e128: 7100027f     	cmp	w19, #0x0
 425e12c: 9a884136     	csel	x22, x9, x8, mi
 425e130: b4000436     	cbz	x22, 0x425e1b4 <_ChromeMain+0x4258f18>
 425e134: f94007e8     	ldr	x8, [sp, #0x8]
