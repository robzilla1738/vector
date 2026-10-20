
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465ad90:      	stp	x20, x19, [sp, #-0x20]!
 465ad94:      	stp	x29, x30, [sp, #0x10]
 465ad98:      	add	x29, sp, #0x10
 465ad9c:      	mov	x19, x0
 465ada0:      	adrp	x8, 0xe723000 <dyld_stub_binder+0xe723000>
 465ada4:      	add	x8, x8, #0x8d0
 465ada8:      	add	x9, x8, #0x400
 465adac:      	stp	x8, x9, [x0]
 465adb0:      	add	x9, x8, #0x428
 465adb4:      	str	x9, [x0, #0x10]
 465adb8:      	add	x9, x8, #0x460
 465adbc:      	add	x10, x8, #0x490
 465adc0:      	stp	x9, x10, [x0, #0x68]
 465adc4:      	add	x9, x8, #0x4e0
 465adc8:      	str	x9, [x0, #0xb0]
 465adcc:      	add	x9, x8, #0x540
 465add0:      	str	x9, [x0, #0xd8]
 465add4:      	add	x9, x8, #0x570
 465add8:      	str	x9, [x0, #0xf8]
 465addc:      	add	x8, x8, #0x598
 465ade0:      	str	x8, [x0, #0x310]
 465ade4:      	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 465ade8:      	add	x8, x8, #0x900
 465adec:      	str	x8, [x0, #0x328]
 465adf0:      	ldr	x0, [x0, #0x370]
 465adf4:      	and	x8, x0, #0xfffffffc00000000
 465adf8:      	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465adfc:      	ldr	x9, [x20, #0x88]
 465ae00:      	cmp	x8, x9
 465ae04:      	b.ne	0x465ae0c <_ChromeMain+0x4655b70>
 465ae08:      	bl	0x26a44 <_ChromeMain+0x217a8>
 465ae0c:      	str	xzr, [x19, #0x370]
 465ae10:      	add	x0, x19, #0x328
 465ae14:      	bl	0xf4234c <_ChromeMain+0xf3d0b0>
 465ae18:      	ldr	x0, [x19, #0x320]
 465ae1c:      	and	x8, x0, #0xfffffffc00000000
 465ae20:      	ldr	x9, [x20, #0x88]
 465ae24:      	cmp	x8, x9
 465ae28:      	b.ne	0x465ae30 <_ChromeMain+0x4655b94>
 465ae2c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465ae30:      	str	xzr, [x19, #0x320]
 465ae34:      	ldr	x0, [x19, #0x318]
 465ae38:      	and	x8, x0, #0xfffffffc00000000
 465ae3c:      	ldr	x9, [x20, #0x88]
 465ae40:      	cmp	x8, x9
 465ae44:      	b.ne	0x465ae4c <_ChromeMain+0x4655bb0>
 465ae48:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465ae4c:      	str	xzr, [x19, #0x318]
 465ae50:      	mov	x0, x19
 465ae54:      	ldp	x29, x30, [sp, #0x10]
 465ae58:      	ldp	x20, x19, [sp], #0x20
 465ae5c:      	b	0x136f88c <_ChromeMain+0x136a5f0>
		...
 465ae80:      	stp	x20, x19, [sp, #-0x20]!
 465ae84:      	stp	x29, x30, [sp, #0x10]
 465ae88:      	add	x29, sp, #0x10
 465ae8c:      	mov	x19, x0
 465ae90:      	adrp	x8, 0xe723000 <dyld_stub_binder+0xe723000>
 465ae94:      	add	x8, x8, #0x8d0
 465ae98:      	add	x9, x8, #0x400
 465ae9c:      	stp	x8, x9, [x0]
 465aea0:      	add	x9, x8, #0x428
 465aea4:      	str	x9, [x0, #0x10]
 465aea8:      	add	x9, x8, #0x460
 465aeac:      	add	x10, x8, #0x490
 465aeb0:      	stp	x9, x10, [x0, #0x68]
 465aeb4:      	add	x9, x8, #0x4e0
 465aeb8:      	str	x9, [x0, #0xb0]
 465aebc:      	add	x9, x8, #0x540
 465aec0:      	str	x9, [x0, #0xd8]
 465aec4:      	add	x9, x8, #0x570
 465aec8:      	str	x9, [x0, #0xf8]
 465aecc:      	add	x8, x8, #0x598
 465aed0:      	str	x8, [x0, #0x310]
 465aed4:      	adrp	x8, 0xe2e1000 <dyld_stub_binder+0xe2e1000>
 465aed8:      	add	x8, x8, #0x900
 465aedc:      	str	x8, [x0, #0x328]
 465aee0:      	ldr	x0, [x0, #0x370]
 465aee4:      	and	x8, x0, #0xfffffffc00000000
 465aee8:      	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 465aeec:      	ldr	x9, [x20, #0x88]
 465aef0:      	cmp	x8, x9
 465aef4:      	b.ne	0x465aefc <_ChromeMain+0x4655c60>
 465aef8:      	bl	0x26a44 <_ChromeMain+0x217a8>
 465aefc:      	str	xzr, [x19, #0x370]
 465af00:      	add	x0, x19, #0x328
 465af04:      	bl	0xf4234c <_ChromeMain+0xf3d0b0>
 465af08:      	ldr	x0, [x19, #0x320]
 465af0c:      	and	x8, x0, #0xfffffffc00000000
 465af10:      	ldr	x9, [x20, #0x88]
 465af14:      	cmp	x8, x9
 465af18:      	b.ne	0x465af20 <_ChromeMain+0x4655c84>
 465af1c:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465af20:      	str	xzr, [x19, #0x320]
 465af24:      	ldr	x0, [x19, #0x318]
 465af28:      	and	x8, x0, #0xfffffffc00000000
 465af2c:      	ldr	x9, [x20, #0x88]
 465af30:      	cmp	x8, x9
 465af34:      	b.ne	0x465af3c <_ChromeMain+0x4655ca0>
 465af38:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 465af3c:      	str	xzr, [x19, #0x318]
 465af40:      	mov	x0, x19
 465af44:      	bl	0x136f88c <_ChromeMain+0x136a5f0>
 465af48:      	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 465af4c:      	add	x8, x8, #0x480
 465af50:      	ldapr	x0, [x8]
 465af54:      	cbz	x0, 0x465af68 <_ChromeMain+0x4655ccc>
 465af58:      	mov	x1, x19
 465af5c:      	ldp	x29, x30, [sp, #0x10]
 465af60:      	ldp	x20, x19, [sp], #0x20
 465af64:      	b	0xf5cb20 <_ChromeMain+0xf57884>
 465af68:      	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 465af6c:      	b	0x465af58 <_ChromeMain+0x4655cbc>
 465af70:      	sub	sp, sp, #0x40
 465af74:      	stp	d9, d8, [sp, #0x10]
 465af78:      	stp	x20, x19, [sp, #0x20]
 465af7c:      	stp	x29, x30, [sp, #0x30]
 465af80:      	add	x29, sp, #0x30
 465af84:      	mov	x19, x0
 465af88:      	ldr	w8, [x0, #0x1c0]
 465af8c:      	sub	w8, w8, #0x10
 465af90:      	add	w8, w8, w8, lsr #31
 465af94:      	asr	w8, w8, #1
 465af98:      	ldr	d0, [x0, #0x3e0]
 465af9c:      	scvtf	d1, w8
 465afa0:      	fmov	d2, #8.00000000
 465afa4:      	fsub	d2, d2, d1
 465afa8:      	fmul	d0, d0, d2
 465afac:      	fadd	d0, d0, d1
 465afb0:      	fmov	d1, #0.50000000
 465afb4:      	fadd	d0, d0, d1
 465afb8:      	frintm	d0, d0
 465afbc:      	mov	x8, #-0x3e20000000000000 ; =-4476578029606273024
 465afc0:      	fmov	d1, x8
 465afc4:      	fcmp	d0, d1
 465afc8:      	mov	w20, #0x7fffffff        ; =2147483647
 465afcc:      	csel	w8, wzr, w20, lt
 465afd0:      	fmaxnm	d1, d0, d1
 465afd4:      	fcvtzs	w9, d1
 465afd8:      	adrp	x10, 0xdf4b000 <dyld_stub_binder+0xdf4b000>
 465afdc:      	ldr	d1, [x10, #0xcc8]
 465afe0:      	fcmp	d0, d1
 465afe4:      	csel	w8, w9, w8, ls
 465afe8:      	adds	w9, w8, #0x10
 465afec:      	fmov	s0, w8
 465aff0:      	ldr	x0, [x0, #0x318]
 465aff4:      	ldr	w10, [x19, #0x1c4]
 465aff8:      	sub	w10, w10, #0x10
 465affc:      	add	w10, w10, w10, lsr #31
 465b000:      	asr	w10, w10, #1
 465b004:      	stp	w8, w10, [sp]
 465b008:      	csel	w8, w20, w9, vs
 465b00c:      	fmov	s1, w8
 465b010:      	add	w8, w10, #0x10
 465b014:      	mov.s	v1[1], w8
 465b018:      	mov.s	v0[1], w10
 465b01c:      	sqsub.2s	v0, v1, v0
 465b020:      	movi.2d	v1, #0000000000000000
 465b024:      	smax.2s	v0, v0, v1
 465b028:      	str	d0, [sp, #0x8]
 465b02c:      	mov	x1, sp
 465b030:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 465b034:      	ldr	x0, [x19, #0x320]
 465b038:      	ldr	w8, [x19, #0x1c0]
 465b03c:      	sub	w8, w8, #0x28
 465b040:      	bic	w8, w8, w8, asr #31
 465b044:      	ldr	w9, [x19, #0x1c4]
 465b048:      	bic	w9, w9, w9, asr #31
 465b04c:      	mov	w10, #0x20              ; =32
 465b050:      	str	x10, [sp]
 465b054:      	adds	w8, w8, #0x20
 465b058:      	csel	w8, w20, w8, vs
 465b05c:      	sub	w8, w8, #0x20
 465b060:      	stp	w8, w9, [sp, #0x8]
 465b064:      	mov	x1, sp
 465b068:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 465b06c:      	ldr	x8, [x19, #0x320]
 465b070:      	ldr	x20, [x8, #0x20]
 465b074:      	ldr	d8, [x19, #0x3e0]
 465b078:      	ldr	x0, [x20, #0x160]
 465b07c:      	cbz	x0, 0x465b098 <_ChromeMain+0x4655dfc>
 465b080:      	fcvt	s0, d8
 465b084:      	ldp	x29, x30, [sp, #0x30]
 465b088:      	ldp	x20, x19, [sp, #0x20]
 465b08c:      	ldp	d9, d8, [sp, #0x10]
 465b090:      	add	sp, sp, #0x40
 465b094:      	b	0x1af4b38 <_ChromeMain+0x1aef89c>
 465b098:      	mov	w0, #0x120              ; =288
 465b09c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 465b0a0:      	mov	x19, x0
 465b0a4:      	mov	x1, #0x0                ; =0
 465b0a8:      	bl	0x107a2d8 <_ChromeMain+0x107503c>
 465b0ac:      	cbz	x0, 0x465b0c0 <_ChromeMain+0x4655e24>
 465b0b0:      	ldr	w8, [x19, #0x8]
 465b0b4:      	adds	w8, w8, #0x1
 465b0b8:      	str	w8, [x19, #0x8]
 465b0bc:      	b.hs	0x465b0d4 <_ChromeMain+0x4655e38>
 465b0c0:      	mov	x0, x20
 465b0c4:      	mov	x1, x19
 465b0c8:      	bl	0x127c1fc <_ChromeMain+0x1276f60>
 465b0cc:      	ldr	x0, [x20, #0x160]
 465b0d0:      	b	0x465b080 <_ChromeMain+0x4655de4>
 465b0d4:      	brk	#0
 465b0d8:      	hlt	#0
 465b0dc:      	brk	#0x1
 465b0e0:      	sub	sp, sp, #0x100
 465b0e4:      	stp	d9, d8, [sp, #0xc0]
 465b0e8:      	stp	x22, x21, [sp, #0xd0]
 465b0ec:      	stp	x20, x19, [sp, #0xe0]
 465b0f0:      	stp	x29, x30, [sp, #0xf0]
 465b0f4:      	add	x29, sp, #0xf0
 465b0f8:      	mov	x19, x1
 465b0fc:      	mov	x21, x0
 465b100:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 465b104:      	cbz	x0, 0x465b28c <_ChromeMain+0x4655ff0>
 465b108:      	mov	x20, x0
 465b10c:      	mov	x8, #0x4080000000000000 ; =4647714815446351872
 465b110:      	movi.2d	v0, #0000000000000000
 465b114:      	stur	q0, [sp, #0x88]
 465b118:      	stur	q0, [sp, #0x98]
 465b11c:      	str	xzr, [sp, #0xa8]
 465b120:      	mov	x9, #0x301              ; =769
 465b124:      	movk	x9, #0xbf80, lsl #48
 465b128:      	stp	x8, x9, [sp, #0x78]
 465b12c:      	ldr	d0, [x21, #0x3e0]
 465b130:      	fmov	d1, #0.50000000
 465b134:      	fcmp	d0, d1
 465b138:      	mov	w8, #0xda               ; =218
 465b13c:      	mov	w9, #0xd6               ; =214
 465b140:      	csel	w1, w9, w8, ge
 465b144:      	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 465b148:      	bl	0xdced68 <_ChromeMain+0xdc9acc>
 465b14c:      	stp	s0, s1, [sp, #0x68]
 465b150:      	stp	s2, s3, [sp, #0x70]
 465b154:      	add	x21, x21, #0x1c0
 465b158:      	ldr	x0, [x19, #0xc0]
 465b15c:      	ld1r.2d	{ v0 }, [x21]
 465b160:      	movi	d8, #0000000000000000
 465b164:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 465b168:      	ldr	q1, [x8, #0x40]
 465b16c:      	str	q1, [sp]
 465b170:      	ushl.2d	v0, v0, v1
 465b174:      	xtn.2s	v0, v0
 465b178:      	movi.2d	v1, #0000000000000000
 465b17c:      	smax.2s	v0, v0, v1
 465b180:      	ucvtf.2s	v0, v0
 465b184:      	stp	d8, d0, [sp, #0x20]
 465b188:      	ldr	x8, [x0]
 465b18c:      	ldr	x8, [x8, #0x108]
 465b190:      	add	x1, sp, #0x20
 465b194:      	fmov	s0, #10.00000000
 465b198:      	fmov	s1, #10.00000000
 465b19c:      	add	x2, sp, #0x68
 465b1a0:      	blr	x8
 465b1a4:      	movi.2d	v0, #0000000000000000
 465b1a8:      	stp	q0, q0, [sp, #0x40]
 465b1ac:      	str	xzr, [sp, #0x60]
 465b1b0:      	mov	x8, #0x341              ; =833
 465b1b4:      	movk	x8, #0xbf80, lsl #48
 465b1b8:      	mov	x9, #0x3f000000         ; =1056964608
 465b1bc:      	movk	x9, #0x4080, lsl #48
 465b1c0:      	stp	x9, x8, [sp, #0x30]
 465b1c4:      	mov	x0, x20
 465b1c8:      	mov	w1, #0xd8               ; =216
 465b1cc:      	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 465b1d0:      	bl	0xdced68 <_ChromeMain+0xdc9acc>
 465b1d4:      	stp	s0, s1, [sp, #0x20]
 465b1d8:      	stp	s2, s3, [sp, #0x28]
 465b1dc:      	ld1r.2d	{ v0 }, [x21]
 465b1e0:      	ldr	q1, [sp]
 465b1e4:      	ushl.2d	v0, v0, v1
 465b1e8:      	xtn.2s	v0, v0
 465b1ec:      	movi.2d	v1, #0000000000000000
 465b1f0:      	smax.2s	v0, v0, v1
 465b1f4:      	ucvtf.2s	v0, v0
 465b1f8:      	stp	d8, d0, [sp, #0x10]
 465b1fc:      	movi.4s	v0, #0x3f, lsl #24
 465b200:      	stur	q0, [x29, #-0x40]
 465b204:      	add	x0, sp, #0x10
 465b208:      	sub	x1, x29, #0x40
 465b20c:      	bl	0x1c100 <_ChromeMain+0x16e64>
 465b210:      	ldr	x0, [x19, #0xc0]
 465b214:      	ldp	d0, d1, [sp, #0x10]
 465b218:      	fadd.2s	v1, v0, v1
 465b21c:      	stp	d0, d1, [x29, #-0x40]
 465b220:      	ldr	x8, [x0]
 465b224:      	ldr	x8, [x8, #0x108]
 465b228:      	sub	x1, x29, #0x40
 465b22c:      	fmov	s0, #10.00000000
 465b230:      	fmov	s1, #10.00000000
 465b234:      	add	x2, sp, #0x20
 465b238:      	blr	x8
 465b23c:      	ldr	x0, [sp, #0x60]
 465b240:      	cbnz	x0, 0x465b35c <_ChromeMain+0x46560c0>
 465b244:      	ldr	x0, [sp, #0x58]
 465b248:      	cbnz	x0, 0x465b314 <_ChromeMain+0x4656078>
 465b24c:      	ldr	x0, [sp, #0x50]
 465b250:      	cbnz	x0, 0x465b3ec <_ChromeMain+0x4656150>
 465b254:      	ldr	x0, [sp, #0x48]
 465b258:      	cbnz	x0, 0x465b2dc <_ChromeMain+0x4656040>
 465b25c:      	ldr	x0, [sp, #0x40]
 465b260:      	cbnz	x0, 0x465b3a4 <_ChromeMain+0x4656108>
 465b264:      	ldr	x0, [sp, #0xa8]
 465b268:      	cbnz	x0, 0x465b380 <_ChromeMain+0x46560e4>
 465b26c:      	ldr	x0, [sp, #0xa0]
 465b270:      	cbnz	x0, 0x465b338 <_ChromeMain+0x465609c>
 465b274:      	ldr	x0, [sp, #0x98]
 465b278:      	cbnz	x0, 0x465b410 <_ChromeMain+0x4656174>
 465b27c:      	ldr	x0, [sp, #0x90]
 465b280:      	cbnz	x0, 0x465b2a4 <_ChromeMain+0x4656008>
 465b284:      	ldr	x0, [sp, #0x88]
 465b288:      	cbnz	x0, 0x465b3c8 <_ChromeMain+0x465612c>
 465b28c:      	ldp	x29, x30, [sp, #0xf0]
 465b290:      	ldp	x20, x19, [sp, #0xe0]
 465b294:      	ldp	x22, x21, [sp, #0xd0]
 465b298:      	ldp	d9, d8, [sp, #0xc0]
 465b29c:      	add	sp, sp, #0x100
 465b2a0:      	ret
 465b2a4:      	add	x8, x0, #0x8
 465b2a8:      	mov	w9, #-0x1               ; =-1
 465b2ac:      	ldaddal	w9, w8, [x8]
 465b2b0:      	cmp	w8, #0x1
 465b2b4:      	b.ne	0x465b284 <_ChromeMain+0x4655fe8>
 465b2b8:      	ldr	x9, [x0]
 465b2bc:      	ldr	x8, [x9, #0x10]
 465b2c0:      	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 465b2c4:      	add	x10, x10, #0x180
 465b2c8:      	cmp	x8, x10
 465b2cc:      	b.ne	0x465b2d4 <_ChromeMain+0x4656038>
 465b2d0:      	ldr	x8, [x9, #0x8]
 465b2d4:      	blr	x8
 465b2d8:      	b	0x465b284 <_ChromeMain+0x4655fe8>
 465b2dc:      	add	x8, x0, #0x8
 465b2e0:      	mov	w9, #-0x1               ; =-1
 465b2e4:      	ldaddal	w9, w8, [x8]
 465b2e8:      	cmp	w8, #0x1
 465b2ec:      	b.ne	0x465b25c <_ChromeMain+0x4655fc0>
 465b2f0:      	ldr	x9, [x0]
 465b2f4:      	ldr	x8, [x9, #0x10]
 465b2f8:      	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 465b2fc:      	add	x10, x10, #0x180
 465b300:      	cmp	x8, x10
 465b304:      	b.ne	0x465b30c <_ChromeMain+0x4656070>
 465b308:      	ldr	x8, [x9, #0x8]
 465b30c:      	blr	x8
 465b310:      	b	0x465b25c <_ChromeMain+0x4655fc0>
 465b314:      	add	x8, x0, #0x8
 465b318:      	mov	w9, #-0x1               ; =-1
 465b31c:      	ldaddal	w9, w8, [x8]
 465b320:      	cmp	w8, #0x1
 465b324:      	b.ne	0x465b24c <_ChromeMain+0x4655fb0>
 465b328:      	ldr	x8, [x0]
 465b32c:      	ldr	x8, [x8, #0x10]
 465b330:      	blr	x8
 465b334:      	b	0x465b24c <_ChromeMain+0x4655fb0>
 465b338:      	add	x8, x0, #0x8
 465b33c:      	mov	w9, #-0x1               ; =-1
 465b340:      	ldaddal	w9, w8, [x8]
 465b344:      	cmp	w8, #0x1
 465b348:      	b.ne	0x465b274 <_ChromeMain+0x4655fd8>
 465b34c:      	ldr	x8, [x0]
 465b350:      	ldr	x8, [x8, #0x10]
 465b354:      	blr	x8
 465b358:      	b	0x465b274 <_ChromeMain+0x4655fd8>
 465b35c:      	add	x8, x0, #0x8
 465b360:      	mov	w9, #-0x1               ; =-1
 465b364:      	ldaddal	w9, w8, [x8]
 465b368:      	cmp	w8, #0x1
 465b36c:      	b.ne	0x465b244 <_ChromeMain+0x4655fa8>
 465b370:      	ldr	x8, [x0]
 465b374:      	ldr	x8, [x8, #0x10]
 465b378:      	blr	x8
 465b37c:      	b	0x465b244 <_ChromeMain+0x4655fa8>
 465b380:      	add	x8, x0, #0x8
 465b384:      	mov	w9, #-0x1               ; =-1
 465b388:      	ldaddal	w9, w8, [x8]
 465b38c:      	cmp	w8, #0x1
 465b390:      	b.ne	0x465b26c <_ChromeMain+0x4655fd0>
 465b394:      	ldr	x8, [x0]
 465b398:      	ldr	x8, [x8, #0x10]
 465b39c:      	blr	x8
 465b3a0:      	b	0x465b26c <_ChromeMain+0x4655fd0>
 465b3a4:      	add	x8, x0, #0x8
 465b3a8:      	mov	w9, #-0x1               ; =-1
 465b3ac:      	ldaddal	w9, w8, [x8]
 465b3b0:      	cmp	w8, #0x1
 465b3b4:      	b.ne	0x465b264 <_ChromeMain+0x4655fc8>
 465b3b8:      	ldr	x8, [x0]
 465b3bc:      	ldr	x8, [x8, #0x10]
 465b3c0:      	blr	x8
 465b3c4:      	b	0x465b264 <_ChromeMain+0x4655fc8>
 465b3c8:      	add	x8, x0, #0x8
 465b3cc:      	mov	w9, #-0x1               ; =-1
 465b3d0:      	ldaddal	w9, w8, [x8]
 465b3d4:      	cmp	w8, #0x1
 465b3d8:      	b.ne	0x465b28c <_ChromeMain+0x4655ff0>
 465b3dc:      	ldr	x8, [x0]
 465b3e0:      	ldr	x8, [x8, #0x10]
 465b3e4:      	blr	x8
 465b3e8:      	b	0x465b28c <_ChromeMain+0x4655ff0>
 465b3ec:      	add	x8, x0, #0x8
 465b3f0:      	mov	w9, #-0x1               ; =-1
 465b3f4:      	ldaddal	w9, w8, [x8]
 465b3f8:      	cmp	w8, #0x1
 465b3fc:      	b.ne	0x465b254 <_ChromeMain+0x4655fb8>
 465b400:      	ldr	x8, [x0]
 465b404:      	ldr	x8, [x8, #0x10]
 465b408:      	blr	x8
 465b40c:      	b	0x465b254 <_ChromeMain+0x4655fb8>
 465b410:      	add	x8, x0, #0x8
 465b414:      	mov	w9, #-0x1               ; =-1
 465b418:      	ldaddal	w9, w8, [x8]
 465b41c:      	cmp	w8, #0x1
 465b420:      	b.ne	0x465b27c <_ChromeMain+0x4655fe0>
 465b424:      	ldr	x8, [x0]
 465b428:      	ldr	x8, [x8, #0x10]
 465b42c:      	blr	x8
 465b430:      	b	0x465b27c <_ChromeMain+0x4655fe0>
 465b434:      	add	x8, x0, #0x328
 465b438:      	cmp	x1, x8
 465b43c:      	b.eq	0x465b444 <_ChromeMain+0x46561a8>
 465b440:      	ret
 465b444:      	sub	sp, sp, #0x40
 465b448:      	stp	d9, d8, [sp, #0x10]
 465b44c:      	stp	x20, x19, [sp, #0x20]
 465b450:      	stp	x29, x30, [sp, #0x30]
 465b454:      	add	x29, sp, #0x30
 465b458:      	mov	x19, x0
 465b45c:      	ldr	d8, [x0, #0x398]
 465b460:      	add	x0, x0, #0x3b0
 465b464:      	add	x1, x19, #0x3c0
 465b468:      	mov.16b	v0, v8
 465b46c:      	bl	0x265d304 <_ChromeMain+0x2658068>
 465b470:      	stp	x0, x1, [sp]
 465b474:      	mov	x1, sp
 465b478:      	mov	x0, x19
 465b47c:      	bl	0x8a4b90 <_ChromeMain+0x89f8f4>
 465b480:      	ldr	d0, [x19, #0x3d0]
 465b484:      	ldr	d1, [x19, #0x3d8]
 465b488:      	fsub	d1, d1, d0
 465b48c:      	fmul	d1, d8, d1
 465b490:      	fadd	d0, d0, d1
 465b494:      	str	d0, [x19, #0x3e0]
 465b498:      	mov	x0, x19
 465b49c:      	mov	w1, #0x0                ; =0
 465b4a0:      	bl	0x630474 <_ChromeMain+0x62b1d8>
 465b4a4:      	mov	x0, x19
 465b4a8:      	ldp	x29, x30, [sp, #0x30]
 465b4ac:      	ldp	x20, x19, [sp, #0x20]
 465b4b0:      	ldp	d9, d8, [sp, #0x10]
 465b4b4:      	add	sp, sp, #0x40
 465b4b8:      	b	0x5a117c <_ChromeMain+0x59bee0>
