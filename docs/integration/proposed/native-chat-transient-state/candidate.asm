
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464df0c: d101c3ff     	sub	sp, sp, #0x70
 464df10: a90267fa     	stp	x26, x25, [sp, #0x20]
 464df14: a9035ff8     	stp	x24, x23, [sp, #0x30]
 464df18: a90457f6     	stp	x22, x21, [sp, #0x40]
 464df1c: a9054ff4     	stp	x20, x19, [sp, #0x50]
 464df20: a9067bfd     	stp	x29, x30, [sp, #0x60]
 464df24: 910183fd     	add	x29, sp, #0x60
 464df28: b4000321     	cbz	x1, 0x464df8c <_ChromeMain+0x4648cf0>
 464df2c: aa0103f5     	mov	x21, x1
 464df30: f9400013     	ldr	x19, [x0]
 464df34: b9401034     	ldr	w20, [x1, #0x10]
 464df38: f947e668     	ldr	x8, [x19, #0xfc8]
 464df3c: f947ea69     	ldr	x9, [x19, #0xfd0]
 464df40: d37be92a     	lsl	x10, x9, #5
 464df44: b400036a     	cbz	x10, 0x464dfb0 <_ChromeMain+0x4648d14>
 464df48: 9345fd4b     	asr	x11, x10, #5
 464df4c: aa0803ea     	mov	x10, x8
 464df50: d341fd6c     	lsr	x12, x11, #1
 464df54: 8b0c154d     	add	x13, x10, x12, lsl #5
 464df58: b84205ae     	ldr	w14, [x13], #0x20
 464df5c: aa6b07ef     	mvn	x15, x11, lsr #1
 464df60: 8b0f016b     	add	x11, x11, x15
 464df64: 6b1401df     	cmp	w14, w20
 464df68: 9a8cb16b     	csel	x11, x11, x12, lt
 464df6c: 9a8ab1aa     	csel	x10, x13, x10, lt
 464df70: b5ffff0b     	cbnz	x11, 0x464df50 <_ChromeMain+0x4648cb4>
 464df74: 8b091508     	add	x8, x8, x9, lsl #5
 464df78: eb08015f     	cmp	x10, x8
 464df7c: 540001e0     	b.eq	0x464dfb8 <_ChromeMain+0x4648d1c>
 464df80: b9400148     	ldr	w8, [x10]
 464df84: 6b08029f     	cmp	w20, w8
 464df88: 5400018b     	b.lt	0x464dfb8 <_ChromeMain+0x4648d1c>
 464df8c: 52800013     	mov	w19, #0x0               ; =0
 464df90: aa1303e0     	mov	x0, x19
 464df94: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 464df98: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 464df9c: a94457f6     	ldp	x22, x21, [sp, #0x40]
 464dfa0: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 464dfa4: a94267fa     	ldp	x26, x25, [sp, #0x20]
 464dfa8: 9101c3ff     	add	sp, sp, #0x70
 464dfac: d65f03c0     	ret
 464dfb0: aa0803ea     	mov	x10, x8
 464dfb4: 17fffff0     	b	0x464df74 <_ChromeMain+0x4648cd8>
 464dfb8: 91400676     	add	x22, x19, #0x1, lsl #12 ; =0x1000
 464dfbc: aa1303e0     	mov	x0, x19
 464dfc0: aa1503e1     	mov	x1, x21
 464dfc4: 97fffdd5     	bl	0x464d718 <_ChromeMain+0x464847c>
 464dfc8: 35000100     	cbnz	w0, 0x464dfe8 <_ChromeMain+0x4648d4c>
 464dfcc: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 464dfd0: 34000248     	cbz	w8, 0x464e018 <_ChromeMain+0x4648d7c>
 464dfd4: b9502a68     	ldr	w8, [x19, #0x1028]
 464dfd8: 6b14011f     	cmp	w8, w20
 464dfdc: 540001e1     	b.ne	0x464e018 <_ChromeMain+0x4648d7c>
 464dfe0: 52800033     	mov	w19, #0x1               ; =1
 464dfe4: 17ffffeb     	b	0x464df90 <_ChromeMain+0x4648cf4>
 464dfe8: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 464dfec: 34ffffa8     	cbz	w8, 0x464dfe0 <_ChromeMain+0x4648d44>
 464dff0: b9502a68     	ldr	w8, [x19, #0x1028]
 464dff4: 6b14011f     	cmp	w8, w20
 464dff8: 54ffff41     	b.ne	0x464dfe0 <_ChromeMain+0x4648d44>
 464dffc: 52820608     	mov	w8, #0x1030             ; =4144
 464e000: 8b080260     	add	x0, x19, x8
 464e004: 970381c5     	bl	0x72e718 <_ChromeMain+0x72947c>
 464e008: 3940b2c8     	ldrb	w8, [x22, #0x2c]
 464e00c: 34fffea8     	cbz	w8, 0x464dfe0 <_ChromeMain+0x4648d44>
 464e010: 3900b2df     	strb	wzr, [x22, #0x2c]
 464e014: 17fffff3     	b	0x464dfe0 <_ChromeMain+0x4648d44>
 464e018: 394092c8     	ldrb	w8, [x22, #0x24]
 464e01c: 34fffb88     	cbz	w8, 0x464df8c <_ChromeMain+0x4648cf0>
 464e020: b9502268     	ldr	w8, [x19, #0x1020]
 464e024: 6b14011f     	cmp	w8, w20
 464e028: 54fffb21     	b.ne	0x464df8c <_ChromeMain+0x4648cf0>
 464e02c: 6f00e400     	movi.2d	v0, #0000000000000000
 464e030: ad0003e0     	stp	q0, q0, [sp]
 464e034: f94022a1     	ldr	x1, [x21, #0x40]
 464e038: 910003e8     	mov	x8, sp
 464e03c: aa1303e0     	mov	x0, x19
 464e040: 97ffa7b8     	bl	0x4637f20 <_ChromeMain+0x4632c84>
 464e044: 394063e8     	ldrb	w8, [sp, #0x18]
 464e048: 34fffa28     	cbz	w8, 0x464df8c <_ChromeMain+0x4648cf0>
 464e04c: f948d668     	ldr	x8, [x19, #0x11a8]
 464e050: 52801709     	mov	w9, #0xb8               ; =184
 464e054: 9b097d18     	mul	x24, x8, x9
 464e058: 39405ff7     	ldrb	w23, [sp, #0x17]
 464e05c: b4000398     	cbz	x24, 0x464e0cc <_ChromeMain+0x4648e30>
 464e060: f948d279     	ldr	x25, [x19, #0x11a0]
 464e064: 13001ee8     	sxtb	w8, w23
 464e068: 7100011f     	cmp	w8, #0x0
 464e06c: a94023e9     	ldp	x9, x8, [sp]
 464e070: 9a974115     	csel	x21, x8, x23, mi
 464e074: 910003e8     	mov	x8, sp
 464e078: 9a884136     	csel	x22, x9, x8, mi
 464e07c: 14000004     	b	0x464e08c <_ChromeMain+0x4648df0>
 464e080: 9102e339     	add	x25, x25, #0xb8
 464e084: f102e318     	subs	x24, x24, #0xb8
 464e088: 54000220     	b.eq	0x464e0cc <_ChromeMain+0x4648e30>
 464e08c: 39405f29     	ldrb	w9, [x25, #0x17]
 464e090: 13001d28     	sxtb	w8, w9
 464e094: f940072a     	ldr	x10, [x25, #0x8]
 464e098: 7100011f     	cmp	w8, #0x0
 464e09c: 9a894149     	csel	x9, x10, x9, mi
 464e0a0: eb15013f     	cmp	x9, x21
 464e0a4: 54fffee1     	b.ne	0x464e080 <_ChromeMain+0x4648de4>
 464e0a8: f9400329     	ldr	x9, [x25]
 464e0ac: 7100011f     	cmp	w8, #0x0
 464e0b0: 9a994120     	csel	x0, x9, x25, mi
 464e0b4: aa1603e1     	mov	x1, x22
 464e0b8: aa1503e2     	mov	x2, x21
 464e0bc: 94e6ede9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 464e0c0: 35fffe00     	cbnz	w0, 0x464e080 <_ChromeMain+0x4648de4>
 464e0c4: 52800013     	mov	w19, #0x0               ; =0
 464e0c8: 14000005     	b	0x464e0dc <_ChromeMain+0x4648e40>
 464e0cc: aa1303e0     	mov	x0, x19
 464e0d0: aa1403e1     	mov	x1, x20
 464e0d4: 94000008     	bl	0x464e0f4 <_ChromeMain+0x4648e58>
 464e0d8: 52800033     	mov	w19, #0x1               ; =1
 464e0dc: 363ff5b7     	tbz	w23, #0x7, 0x464df90 <_ChromeMain+0x4648cf4>
 464e0e0: f94003e0     	ldr	x0, [sp]
 464e0e4: f9400be8     	ldr	x8, [sp, #0x10]
 464e0e8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 464e0ec: 96e6eb73     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464e0f0: 17ffffa8     	b	0x464df90 <_ChromeMain+0x4648cf4>
