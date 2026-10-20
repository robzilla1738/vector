
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d4f20: d10203ff     	sub	sp, sp, #0x80
 41d4f24: a9026ffc     	stp	x28, x27, [sp, #0x20]
 41d4f28: a90367fa     	stp	x26, x25, [sp, #0x30]
 41d4f2c: a9045ff8     	stp	x24, x23, [sp, #0x40]
 41d4f30: a90557f6     	stp	x22, x21, [sp, #0x50]
 41d4f34: a9064ff4     	stp	x20, x19, [sp, #0x60]
 41d4f38: a9077bfd     	stp	x29, x30, [sp, #0x70]
 41d4f3c: 9101c3fd     	add	x29, sp, #0x70
 41d4f40: 39406028     	ldrb	w8, [x1, #0x18]
 41d4f44: 34000ca8     	cbz	w8, 0x41d50d8 <_ChromeMain+0x41cfe3c>
 41d4f48: aa0103f6     	mov	x22, x1
 41d4f4c: aa0003f4     	mov	x20, x0
 41d4f50: 910023e8     	add	x8, sp, #0x8
 41d4f54: 97fffdc3     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 41d4f58: a940e7f3     	ldp	x19, x25, [sp, #0x8]
 41d4f5c: 8b190f28     	add	x8, x25, x25, lsl #3
 41d4f60: d37ced1a     	lsl	x26, x8, #4
 41d4f64: b40007ba     	cbz	x26, 0x41d5058 <_ChromeMain+0x41cfdbc>
 41d4f68: d2800018     	mov	x24, #0x0               ; =0
 41d4f6c: 8b081275     	add	x21, x19, x8, lsl #4
 41d4f70: 39405ec8     	ldrb	w8, [x22, #0x17]
 41d4f74: 13001d1b     	sxtb	w27, w8
 41d4f78: f94006c9     	ldr	x9, [x22, #0x8]
 41d4f7c: 7100037f     	cmp	w27, #0x0
 41d4f80: 9a884137     	csel	x23, x9, x8, mi
 41d4f84: 14000004     	b	0x41d4f94 <_ChromeMain+0x41cfcf8>
 41d4f88: 91024318     	add	x24, x24, #0x90
 41d4f8c: eb18035f     	cmp	x26, x24
 41d4f90: 54000660     	b.eq	0x41d505c <_ChromeMain+0x41cfdc0>
 41d4f94: 8b180268     	add	x8, x19, x24
 41d4f98: 39405d0a     	ldrb	w10, [x8, #0x17]
 41d4f9c: 13001d49     	sxtb	w9, w10
 41d4fa0: f940050b     	ldr	x11, [x8, #0x8]
 41d4fa4: 7100013f     	cmp	w9, #0x0
 41d4fa8: 9a8a416a     	csel	x10, x11, x10, mi
 41d4fac: eb17015f     	cmp	x10, x23
 41d4fb0: 54fffec1     	b.ne	0x41d4f88 <_ChromeMain+0x41cfcec>
 41d4fb4: f940010a     	ldr	x10, [x8]
 41d4fb8: 7100013f     	cmp	w9, #0x0
 41d4fbc: 9a884140     	csel	x0, x10, x8, mi
 41d4fc0: f94002c8     	ldr	x8, [x22]
 41d4fc4: 7100037f     	cmp	w27, #0x0
 41d4fc8: 9a964101     	csel	x1, x8, x22, mi
 41d4fcc: aa1703e2     	mov	x2, x23
 41d4fd0: 94f8d224     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d4fd4: 35fffda0     	cbnz	w0, 0x41d4f88 <_ChromeMain+0x41cfcec>
 41d4fd8: d1024357     	sub	x23, x26, #0x90
 41d4fdc: 8b180275     	add	x21, x19, x24
 41d4fe0: eb1802ff     	cmp	x23, x24
 41d4fe4: 540003c0     	b.eq	0x41d505c <_ChromeMain+0x41cfdc0>
 41d4fe8: 1400007a     	b	0x41d51d0 <_ChromeMain+0x41cff34>
 41d4fec: 8b160268     	add	x8, x19, x22
 41d4ff0: f85e8100     	ldur	x0, [x8, #-0x18]
 41d4ff4: f85f8108     	ldur	x8, [x8, #-0x8]
 41d4ff8: d37ff901     	lsl	x1, x8, #1
 41d4ffc: 96f8cfaf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d5000: 8b160278     	add	x24, x19, x22
 41d5004: d1008300     	sub	x0, x24, #0x20
 41d5008: d2800001     	mov	x1, #0x0                ; =0
 41d500c: 96f94b2b     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d5010: d101c300     	sub	x0, x24, #0x70
 41d5014: 96f94b19     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d5018: 38d87308     	ldursb	w8, [x24, #-0x79]
 41d501c: 36f800a8     	tbz	w8, #0x1f, 0x41d5030 <_ChromeMain+0x41cfd94>
 41d5020: f94002e0     	ldr	x0, [x23]
 41d5024: f8580308     	ldur	x8, [x24, #-0x80]
 41d5028: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d502c: 96f8cfa3     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d5030: d10242d6     	sub	x22, x22, #0x90
 41d5034: 8b160268     	add	x8, x19, x22
 41d5038: eb15011f     	cmp	x8, x21
 41d503c: 54000200     	b.eq	0x41d507c <_ChromeMain+0x41cfde0>
 41d5040: 8b160268     	add	x8, x19, x22
 41d5044: f1024117     	subs	x23, x8, #0x90
 41d5048: 540008e0     	b.eq	0x41d5164 <_ChromeMain+0x41cfec8>
 41d504c: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d5050: 36fffd88     	tbz	w8, #0x1f, 0x41d5000 <_ChromeMain+0x41cfd64>
 41d5054: 17ffffe6     	b	0x41d4fec <_ChromeMain+0x41cfd50>
 41d5058: aa1303f5     	mov	x21, x19
 41d505c: 52801208     	mov	w8, #0x90               ; =144
 41d5060: 9b084f28     	madd	x8, x25, x8, x19
 41d5064: eb0802bf     	cmp	x21, x8
 41d5068: 540007e8     	b.hi	0x41d5164 <_ChromeMain+0x41cfec8>
 41d506c: 54000180     	b.eq	0x41d509c <_ChromeMain+0x41cfe00>
 41d5070: 8b190f28     	add	x8, x25, x25, lsl #3
 41d5074: d37ced16     	lsl	x22, x8, #4
 41d5078: 17fffff2     	b	0x41d5040 <_ChromeMain+0x41cfda4>
 41d507c: cb1302a8     	sub	x8, x21, x19
 41d5080: 9344fd08     	asr	x8, x8, #4
 41d5084: d291c729     	mov	x9, #0x8e39             ; =36409
 41d5088: f2a71c69     	movk	x9, #0x38e3, lsl #16
 41d508c: f2dc71c9     	movk	x9, #0xe38e, lsl #32
 41d5090: f2f1c709     	movk	x9, #0x8e38, lsl #48
 41d5094: 9b097d19     	mul	x25, x8, x9
 41d5098: f9000bf9     	str	x25, [sp, #0x10]
 41d509c: 910023e1     	add	x1, sp, #0x8
 41d50a0: aa1403e0     	mov	x0, x20
 41d50a4: 97fffe60     	bl	0x41d4a24 <_ChromeMain+0x41cf788>
 41d50a8: b4000193     	cbz	x19, 0x41d50d8 <_ChromeMain+0x41cfe3c>
 41d50ac: 8b190f28     	add	x8, x25, x25, lsl #3
 41d50b0: d37ced14     	lsl	x20, x8, #4
 41d50b4: b4000094     	cbz	x20, 0x41d50c4 <_ChromeMain+0x41cfe28>
 41d50b8: d2800015     	mov	x21, #0x0               ; =0
 41d50bc: aa1303f6     	mov	x22, x19
 41d50c0: 14000023     	b	0x41d514c <_ChromeMain+0x41cfeb0>
 41d50c4: f9400fe8     	ldr	x8, [sp, #0x18]
 41d50c8: 8b080d08     	add	x8, x8, x8, lsl #3
 41d50cc: d37ced01     	lsl	x1, x8, #4
 41d50d0: aa1303e0     	mov	x0, x19
 41d50d4: 96f8cf79     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d50d8: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 41d50dc: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 41d50e0: a94557f6     	ldp	x22, x21, [sp, #0x50]
 41d50e4: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 41d50e8: a94367fa     	ldp	x26, x25, [sp, #0x30]
 41d50ec: a9426ffc     	ldp	x28, x27, [sp, #0x20]
 41d50f0: 910203ff     	add	sp, sp, #0x80
 41d50f4: d65f03c0     	ret
 41d50f8: 8b1402c8     	add	x8, x22, x20
 41d50fc: f85e8100     	ldur	x0, [x8, #-0x18]
 41d5100: f85f8108     	ldur	x8, [x8, #-0x8]
 41d5104: d37ff901     	lsl	x1, x8, #1
 41d5108: 96f8cf6c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d510c: 8b1402d8     	add	x24, x22, x20
 41d5110: d1008300     	sub	x0, x24, #0x20
 41d5114: d2800001     	mov	x1, #0x0                ; =0
 41d5118: 96f94ae8     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d511c: d101c300     	sub	x0, x24, #0x70
 41d5120: 96f94ad6     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d5124: 38d87308     	ldursb	w8, [x24, #-0x79]
 41d5128: 36f800a8     	tbz	w8, #0x1f, 0x41d513c <_ChromeMain+0x41cfea0>
 41d512c: f94002e0     	ldr	x0, [x23]
 41d5130: f8580308     	ldur	x8, [x24, #-0x80]
 41d5134: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d5138: 96f8cf60     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d513c: d10242d6     	sub	x22, x22, #0x90
 41d5140: 910242b5     	add	x21, x21, #0x90
 41d5144: eb15029f     	cmp	x20, x21
 41d5148: 54fffbe0     	b.eq	0x41d50c4 <_ChromeMain+0x41cfe28>
 41d514c: 8b1402c8     	add	x8, x22, x20
 41d5150: f1024117     	subs	x23, x8, #0x90
 41d5154: 54000080     	b.eq	0x41d5164 <_ChromeMain+0x41cfec8>
 41d5158: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d515c: 36fffd88     	tbz	w8, #0x1f, 0x41d510c <_ChromeMain+0x41cfe70>
 41d5160: 17ffffe6     	b	0x41d50f8 <_ChromeMain+0x41cfe5c>
 41d5164: d4200020     	brk	#0x1
 41d5168: a940e7f3     	ldp	x19, x25, [sp, #0x8]
 41d516c: 17ffffbc     	b	0x41d505c <_ChromeMain+0x41cfdc0>
 41d5170: f9403ea0     	ldr	x0, [x21, #0x78]
 41d5174: f94046a8     	ldr	x8, [x21, #0x88]
 41d5178: d37ff901     	lsl	x1, x8, #1
 41d517c: 96f8cf4f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d5180: a907febf     	stp	xzr, xzr, [x21, #0x78]
 41d5184: f80882bf     	stur	xzr, [x21, #0x88]
 41d5188: 14000006     	b	0x41d51a0 <_ChromeMain+0x41cff04>
 41d518c: 91024321     	add	x1, x25, #0x90
 41d5190: aa1503e0     	mov	x0, x21
 41d5194: 97109253     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 41d5198: 39c23ea8     	ldrsb	w8, [x21, #0x8f]
 41d519c: 37fffea8     	tbnz	w8, #0x1f, 0x41d5170 <_ChromeMain+0x41cfed4>
 41d51a0: 91042328     	add	x8, x25, #0x108
 41d51a4: 8b180269     	add	x9, x19, x24
 41d51a8: 3dc00100     	ldr	q0, [x8]
 41d51ac: f940090a     	ldr	x10, [x8, #0x10]
 41d51b0: f80882aa     	stur	x10, [x21, #0x88]
 41d51b4: 3c8782a0     	stur	q0, [x21, #0x78]
 41d51b8: 39047d3f     	strb	wzr, [x9, #0x11f]
 41d51bc: 7900011f     	strh	wzr, [x8]
 41d51c0: 910242b5     	add	x21, x21, #0x90
 41d51c4: 91024318     	add	x24, x24, #0x90
 41d51c8: eb1802ff     	cmp	x23, x24
 41d51cc: 54fffce0     	b.eq	0x41d5168 <_ChromeMain+0x41cfecc>
 41d51d0: 8b180279     	add	x25, x19, x24
 41d51d4: 91024328     	add	x8, x25, #0x90
 41d51d8: 39429f2a     	ldrb	w10, [x25, #0xa7]
 41d51dc: 13001d49     	sxtb	w9, w10
 41d51e0: f9404f2b     	ldr	x11, [x25, #0x98]
 41d51e4: 7100013f     	cmp	w9, #0x0
 41d51e8: 9a8a4162     	csel	x2, x11, x10, mi
 41d51ec: 39405ecb     	ldrb	w11, [x22, #0x17]
 41d51f0: 13001d6a     	sxtb	w10, w11
 41d51f4: f94006cc     	ldr	x12, [x22, #0x8]
 41d51f8: 7100015f     	cmp	w10, #0x0
 41d51fc: 9a8b418b     	csel	x11, x12, x11, mi
 41d5200: eb0b005f     	cmp	x2, x11
 41d5204: 54fffc41     	b.ne	0x41d518c <_ChromeMain+0x41cfef0>
 41d5208: f940010b     	ldr	x11, [x8]
 41d520c: 7100013f     	cmp	w9, #0x0
 41d5210: 9a884160     	csel	x0, x11, x8, mi
 41d5214: f94002c8     	ldr	x8, [x22]
 41d5218: 7100015f     	cmp	w10, #0x0
 41d521c: 9a964101     	csel	x1, x8, x22, mi
 41d5220: 94f8d190     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d5224: 34fffd00     	cbz	w0, 0x41d51c4 <_ChromeMain+0x41cff28>
 41d5228: 17ffffd9     	b	0x41d518c <_ChromeMain+0x41cfef0>
