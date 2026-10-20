
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4646f58: d10283ff     	sub	sp, sp, #0xa0
 4646f5c: a90567fa     	stp	x26, x25, [sp, #0x50]
 4646f60: a9065ff8     	stp	x24, x23, [sp, #0x60]
 4646f64: a90757f6     	stp	x22, x21, [sp, #0x70]
 4646f68: a9084ff4     	stp	x20, x19, [sp, #0x80]
 4646f6c: a9097bfd     	stp	x29, x30, [sp, #0x90]
 4646f70: 910243fd     	add	x29, sp, #0x90
 4646f74: b40003e1     	cbz	x1, 0x4646ff0 <_ChromeMain+0x4641d54>
 4646f78: aa0103f4     	mov	x20, x1
 4646f7c: aa0003f3     	mov	x19, x0
 4646f80: b9401028     	ldr	w8, [x1, #0x10]
 4646f84: f947cc09     	ldr	x9, [x0, #0xf98]
 4646f88: f947d00a     	ldr	x10, [x0, #0xfa0]
 4646f8c: 8b0a094b     	add	x11, x10, x10, lsl #2
 4646f90: d37df16b     	lsl	x11, x11, #3
 4646f94: b40003cb     	cbz	x11, 0x464700c <_ChromeMain+0x4641d70>
 4646f98: 9343fd6b     	asr	x11, x11, #3
 4646f9c: b202e7ec     	mov	x12, #-0x3333333333333334 ; =-3689348814741910324
 4646fa0: f29999ac     	movk	x12, #0xcccd
 4646fa4: 9b0c7d6c     	mul	x12, x11, x12
 4646fa8: 5280050b     	mov	w11, #0x28              ; =40
 4646fac: aa0903f5     	mov	x21, x9
 4646fb0: d341fd8d     	lsr	x13, x12, #1
 4646fb4: 9b0b55ae     	madd	x14, x13, x11, x21
 4646fb8: b84285cf     	ldr	w15, [x14], #0x28
 4646fbc: aa6c07f0     	mvn	x16, x12, lsr #1
 4646fc0: 8b10018c     	add	x12, x12, x16
 4646fc4: 6b0801ff     	cmp	w15, w8
 4646fc8: 9a8db18c     	csel	x12, x12, x13, lt
 4646fcc: 9a95b1d5     	csel	x21, x14, x21, lt
 4646fd0: b5ffff0c     	cbnz	x12, 0x4646fb0 <_ChromeMain+0x4641d14>
 4646fd4: 5280050b     	mov	w11, #0x28              ; =40
 4646fd8: 9b0b2549     	madd	x9, x10, x11, x9
 4646fdc: eb0902bf     	cmp	x21, x9
 4646fe0: 54000080     	b.eq	0x4646ff0 <_ChromeMain+0x4641d54>
 4646fe4: b94002a9     	ldr	w9, [x21]
 4646fe8: 6b09011f     	cmp	w8, w9
 4646fec: 5400014a     	b.ge	0x4647014 <_ChromeMain+0x4641d78>
 4646ff0: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 4646ff4: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4646ff8: a94757f6     	ldp	x22, x21, [sp, #0x70]
 4646ffc: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 4647000: a94567fa     	ldp	x26, x25, [sp, #0x50]
 4647004: 910283ff     	add	sp, sp, #0xa0
 4647008: d65f03c0     	ret
 464700c: aa0903f5     	mov	x21, x9
 4647010: 17fffff1     	b	0x4646fd4 <_ChromeMain+0x4641d38>
 4647014: 396e4a68     	ldrb	w8, [x19, #0xb92]
 4647018: 37000148     	tbnz	w8, #0x0, 0x4647040 <_ChromeMain+0x4641da4>
 464701c: f9435260     	ldr	x0, [x19, #0x6a0]
 4647020: b4000100     	cbz	x0, 0x4647040 <_ChromeMain+0x4641da4>
 4647024: f9429808     	ldr	x8, [x0, #0x530]
 4647028: b40000c8     	cbz	x8, 0x4647040 <_ChromeMain+0x4641da4>
 464702c: 39408508     	ldrb	w8, [x8, #0x21]
 4647030: 34000088     	cbz	w8, 0x4647040 <_ChromeMain+0x4641da4>
 4647034: f94006a1     	ldr	x1, [x21, #0x8]
 4647038: 97ff3540     	bl	0x4614538 <_ChromeMain+0x460f29c>
 464703c: b4000800     	cbz	x0, 0x464713c <_ChromeMain+0x4641ea0>
 4647040: f9402296     	ldr	x22, [x20, #0x40]
 4647044: b40008f6     	cbz	x22, 0x4647160 <_ChromeMain+0x4641ec4>
 4647048: f90023ff     	str	xzr, [sp, #0x40]
 464704c: 6f00e400     	movi.2d	v0, #0000000000000000
 4647050: ad0103e0     	stp	q0, q0, [sp, #0x20]
 4647054: 910083e8     	add	x8, sp, #0x20
 4647058: aa1603e0     	mov	x0, x22
 464705c: 97fc4179     	bl	0x4557640 <_ChromeMain+0x45523a4>
 4647060: 394103e8     	ldrb	w8, [sp, #0x40]
 4647064: 37000488     	tbnz	w8, #0x0, 0x46470f4 <_ChromeMain+0x4641e58>
 4647068: f94006b7     	ldr	x23, [x21, #0x8]
 464706c: 39c09ea8     	ldrsb	w8, [x21, #0x27]
 4647070: 37f803a8     	tbnz	w8, #0x1f, 0x46470e4 <_ChromeMain+0x4641e48>
 4647074: 3cc102a0     	ldur	q0, [x21, #0x10]
 4647078: f84202a8     	ldur	x8, [x21, #0x20]
 464707c: f9000be8     	str	x8, [sp, #0x10]
 4647080: 3d8003e0     	str	q0, [sp]
 4647084: 910003e2     	mov	x2, sp
 4647088: aa1603e0     	mov	x0, x22
 464708c: aa1703e1     	mov	x1, x23
 4647090: 97fc4199     	bl	0x45576f4 <_ChromeMain+0x4552458>
 4647094: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4647098: 36f800a8     	tbz	w8, #0x1f, 0x46470ac <_ChromeMain+0x4641e10>
 464709c: f94003e0     	ldr	x0, [sp]
 46470a0: f9400be8     	ldr	x8, [sp, #0x10]
 46470a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46470a8: 96e70784     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46470ac: f94006a2     	ldr	x2, [x21, #0x8]
 46470b0: 910042a3     	add	x3, x21, #0x10
 46470b4: aa1303e0     	mov	x0, x19
 46470b8: aa1403e1     	mov	x1, x20
 46470bc: 940023bf     	bl	0x464ffb8 <_ChromeMain+0x464ad1c>
 46470c0: 3940fff8     	ldrb	w24, [sp, #0x3f]
 46470c4: 394103e8     	ldrb	w8, [sp, #0x40]
 46470c8: 3607f948     	tbz	w8, #0x0, 0x4646ff0 <_ChromeMain+0x4641d54>
 46470cc: 363ff938     	tbz	w24, #0x7, 0x4646ff0 <_ChromeMain+0x4641d54>
 46470d0: f94017e0     	ldr	x0, [sp, #0x28]
 46470d4: f9401fe8     	ldr	x8, [sp, #0x38]
 46470d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 46470dc: 96e70777     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46470e0: 17ffffc4     	b	0x4646ff0 <_ChromeMain+0x4641d54>
 46470e4: a9410aa1     	ldp	x1, x2, [x21, #0x10]
 46470e8: 910003e0     	mov	x0, sp
 46470ec: 96e7444b     	bl	0x18218 <_ChromeMain+0x12f7c>
 46470f0: 17ffffe5     	b	0x4647084 <_ChromeMain+0x4641de8>
 46470f4: f94013f9     	ldr	x25, [sp, #0x20]
 46470f8: f94006b7     	ldr	x23, [x21, #0x8]
 46470fc: eb17033f     	cmp	x25, x23
 4647100: 54fffb61     	b.ne	0x464706c <_ChromeMain+0x4641dd0>
 4647104: 3940ffe8     	ldrb	w8, [sp, #0x3f]
 4647108: 13001d18     	sxtb	w24, w8
 464710c: f9401be9     	ldr	x9, [sp, #0x30]
 4647110: 7100031f     	cmp	w24, #0x0
 4647114: 9a884122     	csel	x2, x9, x8, mi
 4647118: 39409ea9     	ldrb	w9, [x21, #0x27]
 464711c: 13001d28     	sxtb	w8, w9
 4647120: f9400eaa     	ldr	x10, [x21, #0x18]
 4647124: 7100011f     	cmp	w8, #0x0
 4647128: 9a894149     	csel	x9, x10, x9, mi
 464712c: eb09005f     	cmp	x2, x9
 4647130: 540002a0     	b.eq	0x4647184 <_ChromeMain+0x4641ee8>
 4647134: aa1903f7     	mov	x23, x25
 4647138: 17ffffcd     	b	0x464706c <_ChromeMain+0x4641dd0>
 464713c: f9402288     	ldr	x8, [x20, #0x40]
 4647140: b40000a8     	cbz	x8, 0x4647154 <_ChromeMain+0x4641eb8>
 4647144: b0052461     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4647148: 9126a021     	add	x1, x1, #0x9a8
 464714c: 91002100     	add	x0, x8, #0x8
 4647150: 97306ed3     	bl	0x1262c9c <_ChromeMain+0x125da00>
 4647154: aa1303e0     	mov	x0, x19
 4647158: aa1403e1     	mov	x1, x20
 464715c: 94001f8a     	bl	0x464ef84 <_ChromeMain+0x4649ce8>
 4647160: 913e6260     	add	x0, x19, #0xf98
 4647164: aa1503e1     	mov	x1, x21
 4647168: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 464716c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 4647170: a94757f6     	ldp	x22, x21, [sp, #0x70]
 4647174: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 4647178: a94567fa     	ldp	x26, x25, [sp, #0x50]
 464717c: 910283ff     	add	sp, sp, #0xa0
 4647180: 140023d6     	b	0x46500d8 <_ChromeMain+0x464ae3c>
 4647184: 910083e9     	add	x9, sp, #0x20
 4647188: b27d0129     	orr	x9, x9, #0x8
 464718c: f94017ea     	ldr	x10, [sp, #0x28]
 4647190: 7100031f     	cmp	w24, #0x0
 4647194: 9a894140     	csel	x0, x10, x9, mi
 4647198: aa1503e9     	mov	x9, x21
 464719c: f8410d2a     	ldr	x10, [x9, #0x10]!
 46471a0: 7100011f     	cmp	w8, #0x0
 46471a4: 9a894141     	csel	x1, x10, x9, mi
 46471a8: 94e709ae     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46471ac: aa1903f7     	mov	x23, x25
 46471b0: 35fff5e0     	cbnz	w0, 0x464706c <_ChromeMain+0x4641dd0>
 46471b4: 52800028     	mov	w8, #0x1                ; =1
 46471b8: 17ffffc4     	b	0x46470c8 <_ChromeMain+0x4641e2c>
