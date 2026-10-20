
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464b2ac: f9435675     	ldr	x21, [x19, #0x6a8]
 464b2b0: b4000295     	cbz	x21, 0x464b300 <_ChromeMain+0x4646064>
 464b2b4: 395522a8     	ldrb	w8, [x21, #0x548]
 464b2b8: 6b14011f     	cmp	w8, w20
 464b2bc: 54000220     	b.eq	0x464b300 <_ChromeMain+0x4646064>
 464b2c0: 391522b4     	strb	w20, [x21, #0x548]
 464b2c4: f941b6a8     	ldr	x8, [x21, #0x368]
 464b2c8: b4000408     	cbz	x8, 0x464b348 <_ChromeMain+0x46460ac>
 464b2cc: 52800028     	mov	w8, #0x1                ; =1
 464b2d0: f94002a9     	ldr	x9, [x21]
 464b2d4: f9405129     	ldr	x9, [x9, #0xa0]
 464b2d8: 12000101     	and	w1, w8, #0x1
 464b2dc: aa1503e0     	mov	x0, x21
 464b2e0: d63f0120     	blr	x9
 464b2e4: aa1503e0     	mov	x0, x21
 464b2e8: 52800001     	mov	w1, #0x0                ; =0
 464b2ec: 96ff9462     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b2f0: f94002a8     	ldr	x8, [x21]
 464b2f4: f9418508     	ldr	x8, [x8, #0x308]
 464b2f8: aa1503e0     	mov	x0, x21
 464b2fc: d63f0100     	blr	x8
 464b300: f942ca74     	ldr	x20, [x19, #0x590]
 464b304: aa1303e0     	mov	x0, x19
 464b308: 9400167e     	bl	0x4650d00 <_ChromeMain+0x464ba64>
 464b30c: 394ee288     	ldrb	w8, [x20, #0x3b8]
 464b310: 6b00011f     	cmp	w8, w0
 464b314: 540000a0     	b.eq	0x464b328 <_ChromeMain+0x464608c>
 464b318: 390ee280     	strb	w0, [x20, #0x3b8]
 464b31c: aa1403e0     	mov	x0, x20
 464b320: 52800001     	mov	w1, #0x0                ; =0
 464b324: 96ff9454     	bl	0x630474 <_ChromeMain+0x62b1d8>
 464b328: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 464b32c: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 464b330: a94757f6     	ldp	x22, x21, [sp, #0x70]
 464b334: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 464b338: a94567fa     	ldp	x26, x25, [sp, #0x50]
 464b33c: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 464b340: 910283ff     	add	sp, sp, #0xa0
 464b344: d65f03c0     	ret
 464b348: 395552a8     	ldrb	w8, [x21, #0x554]
 464b34c: 17ffffe1     	b	0x464b2d0 <_ChromeMain+0x4646034>
 464b350: d115e000     	sub	x0, x0, #0x578
 464b354: 17fff983     	b	0x4649960 <_ChromeMain+0x46446c4>
