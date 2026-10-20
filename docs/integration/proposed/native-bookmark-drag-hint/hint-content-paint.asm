
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 467aeec: d104c3ff     	sub	sp, sp, #0x130
 467aef0: a90f6ffc     	stp	x28, x27, [sp, #0xf0]
 467aef4: a91057f6     	stp	x22, x21, [sp, #0x100]
 467aef8: a9114ff4     	stp	x20, x19, [sp, #0x110]
 467aefc: a9127bfd     	stp	x29, x30, [sp, #0x120]
 467af00: 910483fd     	add	x29, sp, #0x120
 467af04: aa0103f3     	mov	x19, x1
 467af08: aa0003f5     	mov	x21, x0
 467af0c: 96fc9839     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 467af10: b4001560     	cbz	x0, 0x467b1bc <_ChromeMain+0x4675f20>
 467af14: aa0003f4     	mov	x20, x0
 467af18: 910702a8     	add	x8, x21, #0x1c0
 467af1c: f81c03bf     	stur	xzr, [x29, #-0x40]
 467af20: 4d40cd00     	ld1r.2d	{ v0 }, [x8]
 467af24: 9004c608     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 467af28: 3dc01101     	ldr	q1, [x8, #0x40]
 467af2c: 6ee14400     	ushl.2d	v0, v0, v1
 467af30: 0ea12800     	xtn.2s	v0, v0
 467af34: 6f00e401     	movi.2d	v1, #0000000000000000
 467af38: 0ea16400     	smax.2s	v0, v0, v1
 467af3c: 2e21d800     	ucvtf.2s	v0, v0
 467af40: fc1c83a0     	stur	d0, [x29, #-0x38]
 467af44: 4f026420     	movi.4s	v0, #0x41, lsl #24
 467af48: 3d8023e0     	str	q0, [sp, #0x80]
 467af4c: d10103a0     	sub	x0, x29, #0x40
 467af50: 910203e1     	add	x1, sp, #0x80
 467af54: 96e6846b     	bl	0x1c100 <_ChromeMain+0x16e64>
 467af58: bc5c83a0     	ldur	s0, [x29, #-0x38]
 467af5c: 1e202008     	fcmp	s0, #0.0
 467af60: 540012e0     	b.eq	0x467b1bc <_ChromeMain+0x4675f20>
 467af64: bc5cc3a0     	ldur	s0, [x29, #-0x34]
 467af68: 1e202008     	fcmp	s0, #0.0
 467af6c: 54001280     	b.eq	0x467b1bc <_ChromeMain+0x4675f20>
 467af70: a93b7fbf     	stp	xzr, xzr, [x29, #-0x50]
 467af74: d10103a0     	sub	x0, x29, #0x40
 467af78: 97433d3f     	bl	0x174a474 <_ChromeMain+0x17451d8>
 467af7c: 2d0007e0     	stp	s0, s1, [sp]
 467af80: 2d010fe2     	stp	s2, s3, [sp, #0x8]
 467af84: 6f00e400     	movi.2d	v0, #0000000000000000
 467af88: ad0403e0     	stp	q0, q0, [sp, #0x80]
 467af8c: 3d802be0     	str	q0, [sp, #0xa0]
 467af90: b900b3ff     	str	wzr, [sp, #0xb0]
 467af94: 910203e0     	add	x0, sp, #0x80
 467af98: 910003e1     	mov	x1, sp
 467af9c: 1e241000     	fmov	s0, #8.00000000
 467afa0: 1e241001     	fmov	s1, #8.00000000
 467afa4: 9709b897     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 467afa8: d10143a8     	sub	x8, x29, #0x50
 467afac: 910203e0     	add	x0, sp, #0x80
 467afb0: 52800001     	mov	w1, #0x0                ; =0
 467afb4: 97090d47     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 467afb8: d2e81008     	mov	x8, #0x4080000000000000 ; =4647714815446351872
 467afbc: 6f00e400     	movi.2d	v0, #0000000000000000
 467afc0: ad0503e0     	stp	q0, q0, [sp, #0xa0]
 467afc4: f90063ff     	str	xzr, [sp, #0xc0]
 467afc8: d2806029     	mov	x9, #0x301              ; =769
 467afcc: f2f7f009     	movk	x9, #0xbf80, lsl #48
 467afd0: a90927e8     	stp	x8, x9, [sp, #0x90]
 467afd4: aa1403e0     	mov	x0, x20
 467afd8: 52802001     	mov	w1, #0x100              ; =256
 467afdc: 9722b47b     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 467afe0: 971d4f62     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 467afe4: 2d1007e0     	stp	s0, s1, [sp, #0x80]
 467afe8: 2d110fe2     	stp	s2, s3, [sp, #0x88]
 467afec: aa1403e0     	mov	x0, x20
 467aff0: 52801cc1     	mov	w1, #0xe6               ; =230
 467aff4: 9722b475     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 467aff8: aa0003f5     	mov	x21, x0
 467affc: 52800300     	mov	w0, #0x18               ; =24
 467b000: 96e650da     	bl	0xf368 <_ChromeMain+0xa0cc>
 467b004: f90003e0     	str	x0, [sp]
 467b008: d2c00068     	mov	x8, #0x300000000        ; =12884901888
 467b00c: d2e80309     	mov	x9, #0x4018000000000000 ; =4618441417868443648
 467b010: a9002408     	stp	x8, x9, [x0]
 467b014: b9001015     	str	w21, [x0, #0x10]
 467b018: 3900501f     	strb	wzr, [x0, #0x14]
 467b01c: 52800028     	mov	w8, #0x1                ; =1
 467b020: 4e080d00     	dup.2d	v0, x8
 467b024: 3c8083e0     	stur	q0, [sp, #0x8]
 467b028: 910003e0     	mov	x0, sp
 467b02c: 973cd6a0     	bl	0x15b0aac <_ChromeMain+0x15ab810>
 467b030: aa0003e8     	mov	x8, x0
 467b034: f9405fe0     	ldr	x0, [sp, #0xb8]
 467b038: f9005fe8     	str	x8, [sp, #0xb8]
 467b03c: b4000120     	cbz	x0, 0x467b060 <_ChromeMain+0x4675dc4>
 467b040: 91002008     	add	x8, x0, #0x8
 467b044: 12800009     	mov	w9, #-0x1               ; =-1
 467b048: b8e90108     	ldaddal	w9, w8, [x8]
 467b04c: 7100051f     	cmp	w8, #0x1
 467b050: 54000081     	b.ne	0x467b060 <_ChromeMain+0x4675dc4>
 467b054: f9400008     	ldr	x8, [x0]
 467b058: f9400908     	ldr	x8, [x8, #0x10]
 467b05c: d63f0100     	blr	x8
 467b060: f94003e0     	ldr	x0, [sp]
 467b064: b5000dc0     	cbnz	x0, 0x467b21c <_ChromeMain+0x4675f80>
 467b068: f9406260     	ldr	x0, [x19, #0xc0]
 467b06c: f9400008     	ldr	x8, [x0]
 467b070: f9408908     	ldr	x8, [x8, #0x110]
 467b074: d10143a1     	sub	x1, x29, #0x50
 467b078: 910203e2     	add	x2, sp, #0x80
 467b07c: 52800023     	mov	w3, #0x1                ; =1
 467b080: d63f0100     	blr	x8
 467b084: 3cdc03a0     	ldur	q0, [x29, #-0x40]
 467b088: 3d801fe0     	str	q0, [sp, #0x70]
 467b08c: 4f02f600     	fmov.4s	v0, #0.25000000
 467b090: 3d8003e0     	str	q0, [sp]
 467b094: 9101c3e0     	add	x0, sp, #0x70
 467b098: 910003e1     	mov	x1, sp
 467b09c: 96e68419     	bl	0x1c100 <_ChromeMain+0x16e64>
 467b0a0: a9067fff     	stp	xzr, xzr, [sp, #0x60]
 467b0a4: 9101c3e0     	add	x0, sp, #0x70
 467b0a8: 97433cf3     	bl	0x174a474 <_ChromeMain+0x17451d8>
 467b0ac: 2d0a07e0     	stp	s0, s1, [sp, #0x50]
 467b0b0: 2d0b0fe2     	stp	s2, s3, [sp, #0x58]
 467b0b4: 6f00e400     	movi.2d	v0, #0000000000000000
 467b0b8: ad0003e0     	stp	q0, q0, [sp]
 467b0bc: 3d800be0     	str	q0, [sp, #0x20]
 467b0c0: b90033ff     	str	wzr, [sp, #0x30]
 467b0c4: 910003e0     	mov	x0, sp
 467b0c8: 910143e1     	add	x1, sp, #0x50
 467b0cc: 1e241000     	fmov	s0, #8.00000000
 467b0d0: 1e241001     	fmov	s1, #8.00000000
 467b0d4: 9709b84b     	bl	0x8e9200 <_ChromeMain+0x8e3f64>
 467b0d8: 910183e8     	add	x8, sp, #0x60
 467b0dc: 910003e0     	mov	x0, sp
 467b0e0: 52800001     	mov	w1, #0x0                ; =0
 467b0e4: 97090cfb     	bl	0x8be4d0 <_ChromeMain+0x8b9234>
 467b0e8: 6f00e400     	movi.2d	v0, #0000000000000000
 467b0ec: ad0103e0     	stp	q0, q0, [sp, #0x20]
 467b0f0: f90023ff     	str	xzr, [sp, #0x40]
 467b0f4: d2806828     	mov	x8, #0x341              ; =833
 467b0f8: f2f7f008     	movk	x8, #0xbf80, lsl #48
 467b0fc: d2a7e009     	mov	x9, #0x3f000000         ; =1056964608
 467b100: f2e81009     	movk	x9, #0x4080, lsl #48
 467b104: a90123e9     	stp	x9, x8, [sp, #0x10]
 467b108: aa1403e0     	mov	x0, x20
 467b10c: 52802041     	mov	w1, #0x102              ; =258
 467b110: 9722b42e     	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 467b114: 971d4f15     	bl	0xdced68 <_ChromeMain+0xdc9acc>
 467b118: 2d0007e0     	stp	s0, s1, [sp]
 467b11c: 2d010fe2     	stp	s2, s3, [sp, #0x8]
 467b120: f9406260     	ldr	x0, [x19, #0xc0]
 467b124: f9400008     	ldr	x8, [x0]
 467b128: f9408908     	ldr	x8, [x8, #0x110]
 467b12c: 910183e1     	add	x1, sp, #0x60
 467b130: 910003e2     	mov	x2, sp
 467b134: 52800023     	mov	w3, #0x1                ; =1
 467b138: d63f0100     	blr	x8
 467b13c: f94023e0     	ldr	x0, [sp, #0x40]
 467b140: b5000ee0     	cbnz	x0, 0x467b31c <_ChromeMain+0x4676080>
 467b144: f9401fe0     	ldr	x0, [sp, #0x38]
 467b148: b5000c60     	cbnz	x0, 0x467b2d4 <_ChromeMain+0x4676038>
 467b14c: f9401be0     	ldr	x0, [sp, #0x30]
 467b150: b50012e0     	cbnz	x0, 0x467b3ac <_ChromeMain+0x4676110>
 467b154: f94017e0     	ldr	x0, [sp, #0x28]
 467b158: b5000860     	cbnz	x0, 0x467b264 <_ChromeMain+0x4675fc8>
 467b15c: f94013e0     	ldr	x0, [sp, #0x20]
 467b160: b5001020     	cbnz	x0, 0x467b364 <_ChromeMain+0x46760c8>
 467b164: f94033f3     	ldr	x19, [sp, #0x60]
 467b168: b40000b3     	cbz	x19, 0x467b17c <_ChromeMain+0x4675ee0>
 467b16c: 12800008     	mov	w8, #-0x1               ; =-1
 467b170: b8e80268     	ldaddal	w8, w8, [x19]
 467b174: 7100051f     	cmp	w8, #0x1
 467b178: 540002e0     	b.eq	0x467b1d4 <_ChromeMain+0x4675f38>
 467b17c: f94063e0     	ldr	x0, [sp, #0xc0]
 467b180: b5000e00     	cbnz	x0, 0x467b340 <_ChromeMain+0x46760a4>
 467b184: f9405fe0     	ldr	x0, [sp, #0xb8]
 467b188: b5000b80     	cbnz	x0, 0x467b2f8 <_ChromeMain+0x467605c>
 467b18c: f9405be0     	ldr	x0, [sp, #0xb0]
 467b190: b5001200     	cbnz	x0, 0x467b3d0 <_ChromeMain+0x4676134>
 467b194: f94057e0     	ldr	x0, [sp, #0xa8]
 467b198: b5000820     	cbnz	x0, 0x467b29c <_ChromeMain+0x4676000>
 467b19c: f94053e0     	ldr	x0, [sp, #0xa0]
 467b1a0: b5000f40     	cbnz	x0, 0x467b388 <_ChromeMain+0x46760ec>
 467b1a4: f85b03b3     	ldur	x19, [x29, #-0x50]
 467b1a8: b40000b3     	cbz	x19, 0x467b1bc <_ChromeMain+0x4675f20>
 467b1ac: 12800008     	mov	w8, #-0x1               ; =-1
 467b1b0: b8e80268     	ldaddal	w8, w8, [x19]
 467b1b4: 7100051f     	cmp	w8, #0x1
 467b1b8: 54000200     	b.eq	0x467b1f8 <_ChromeMain+0x4675f5c>
 467b1bc: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 467b1c0: a9514ff4     	ldp	x20, x19, [sp, #0x110]
