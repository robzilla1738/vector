
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4646f58:      	sub	sp, sp, #0xa0
 4646f5c:      	stp	x26, x25, [sp, #0x50]
 4646f60:      	stp	x24, x23, [sp, #0x60]
 4646f64:      	stp	x22, x21, [sp, #0x70]
 4646f68:      	stp	x20, x19, [sp, #0x80]
 4646f6c:      	stp	x29, x30, [sp, #0x90]
 4646f70:      	add	x29, sp, #0x90
 4646f74:      	cbz	x1, 0x4646ff0 <_ChromeMain+0x4641d54>
 4646f78:      	mov	x20, x1
 4646f7c:      	mov	x19, x0
 4646f80:      	ldr	w8, [x1, #0x10]
 4646f84:      	ldr	x9, [x0, #0xf98]
 4646f88:      	ldr	x10, [x0, #0xfa0]
 4646f8c:      	add	x11, x10, x10, lsl #2
 4646f90:      	lsl	x11, x11, #3
 4646f94:      	cbz	x11, 0x464700c <_ChromeMain+0x4641d70>
 4646f98:      	asr	x11, x11, #3
 4646f9c:      	mov	x12, #-0x3333333333333334 ; =-3689348814741910324
 4646fa0:      	movk	x12, #0xcccd
 4646fa4:      	mul	x12, x11, x12
 4646fa8:      	mov	w11, #0x28              ; =40
 4646fac:      	mov	x21, x9
 4646fb0:      	lsr	x13, x12, #1
 4646fb4:      	madd	x14, x13, x11, x21
 4646fb8:      	ldr	w15, [x14], #0x28
 4646fbc:      	mvn	x16, x12, lsr #1
 4646fc0:      	add	x12, x12, x16
 4646fc4:      	cmp	w15, w8
 4646fc8:      	csel	x12, x12, x13, lt
 4646fcc:      	csel	x21, x14, x21, lt
 4646fd0:      	cbnz	x12, 0x4646fb0 <_ChromeMain+0x4641d14>
 4646fd4:      	mov	w11, #0x28              ; =40
 4646fd8:      	madd	x9, x10, x11, x9
 4646fdc:      	cmp	x21, x9
 4646fe0:      	b.eq	0x4646ff0 <_ChromeMain+0x4641d54>
 4646fe4:      	ldr	w9, [x21]
 4646fe8:      	cmp	w8, w9
 4646fec:      	b.ge	0x4647014 <_ChromeMain+0x4641d78>
 4646ff0:      	ldp	x29, x30, [sp, #0x90]
 4646ff4:      	ldp	x20, x19, [sp, #0x80]
 4646ff8:      	ldp	x22, x21, [sp, #0x70]
 4646ffc:      	ldp	x24, x23, [sp, #0x60]
 4647000:      	ldp	x26, x25, [sp, #0x50]
 4647004:      	add	sp, sp, #0xa0
 4647008:      	ret
 464700c:      	mov	x21, x9
 4647010:      	b	0x4646fd4 <_ChromeMain+0x4641d38>
 4647014:      	ldrb	w8, [x19, #0xb92]
 4647018:      	tbnz	w8, #0x0, 0x4647040 <_ChromeMain+0x4641da4>
 464701c:      	ldr	x0, [x19, #0x6a0]
 4647020:      	cbz	x0, 0x4647040 <_ChromeMain+0x4641da4>
 4647024:      	ldr	x8, [x0, #0x530]
 4647028:      	cbz	x8, 0x4647040 <_ChromeMain+0x4641da4>
 464702c:      	ldrb	w8, [x8, #0x21]
 4647030:      	cbz	w8, 0x4647040 <_ChromeMain+0x4641da4>
 4647034:      	ldr	x1, [x21, #0x8]
 4647038:      	bl	0x4614538 <_ChromeMain+0x460f29c>
 464703c:      	cbz	x0, 0x464713c <_ChromeMain+0x4641ea0>
 4647040:      	ldr	x22, [x20, #0x40]
 4647044:      	cbz	x22, 0x4647160 <_ChromeMain+0x4641ec4>
 4647048:      	str	xzr, [sp, #0x40]
 464704c:      	movi.2d	v0, #0000000000000000
 4647050:      	stp	q0, q0, [sp, #0x20]
 4647054:      	add	x8, sp, #0x20
 4647058:      	mov	x0, x22
 464705c:      	bl	0x4557640 <_ChromeMain+0x45523a4>
 4647060:      	ldrb	w8, [sp, #0x40]
 4647064:      	tbnz	w8, #0x0, 0x46470f4 <_ChromeMain+0x4641e58>
 4647068:      	ldr	x23, [x21, #0x8]
 464706c:      	ldrsb	w8, [x21, #0x27]
 4647070:      	tbnz	w8, #0x1f, 0x46470e4 <_ChromeMain+0x4641e48>
 4647074:      	ldur	q0, [x21, #0x10]
 4647078:      	ldur	x8, [x21, #0x20]
 464707c:      	str	x8, [sp, #0x10]
 4647080:      	str	q0, [sp]
 4647084:      	mov	x2, sp
 4647088:      	mov	x0, x22
 464708c:      	mov	x1, x23
 4647090:      	bl	0x45576f4 <_ChromeMain+0x4552458>
 4647094:      	ldrsb	w8, [sp, #0x17]
 4647098:      	tbz	w8, #0x1f, 0x46470ac <_ChromeMain+0x4641e10>
 464709c:      	ldr	x0, [sp]
 46470a0:      	ldr	x8, [sp, #0x10]
 46470a4:      	and	x1, x8, #0x7fffffffffffffff
 46470a8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46470ac:      	ldr	x2, [x21, #0x8]
 46470b0:      	add	x3, x21, #0x10
 46470b4:      	mov	x0, x19
 46470b8:      	mov	x1, x20
 46470bc:      	bl	0x464ffb8 <_ChromeMain+0x464ad1c>
 46470c0:      	ldrb	w24, [sp, #0x3f]
 46470c4:      	ldrb	w8, [sp, #0x40]
 46470c8:      	tbz	w8, #0x0, 0x4646ff0 <_ChromeMain+0x4641d54>
 46470cc:      	tbz	w24, #0x7, 0x4646ff0 <_ChromeMain+0x4641d54>
 46470d0:      	ldr	x0, [sp, #0x28]
 46470d4:      	ldr	x8, [sp, #0x38]
 46470d8:      	and	x1, x8, #0x7fffffffffffffff
 46470dc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46470e0:      	b	0x4646ff0 <_ChromeMain+0x4641d54>
 46470e4:      	ldp	x1, x2, [x21, #0x10]
 46470e8:      	mov	x0, sp
 46470ec:      	bl	0x18218 <_ChromeMain+0x12f7c>
 46470f0:      	b	0x4647084 <_ChromeMain+0x4641de8>
 46470f4:      	ldr	x25, [sp, #0x20]
 46470f8:      	ldr	x23, [x21, #0x8]
 46470fc:      	cmp	x25, x23
 4647100:      	b.ne	0x464706c <_ChromeMain+0x4641dd0>
 4647104:      	ldrb	w8, [sp, #0x3f]
 4647108:      	sxtb	w24, w8
 464710c:      	ldr	x9, [sp, #0x30]
 4647110:      	cmp	w24, #0x0
 4647114:      	csel	x2, x9, x8, mi
 4647118:      	ldrb	w9, [x21, #0x27]
 464711c:      	sxtb	w8, w9
 4647120:      	ldr	x10, [x21, #0x18]
 4647124:      	cmp	w8, #0x0
 4647128:      	csel	x9, x10, x9, mi
 464712c:      	cmp	x2, x9
 4647130:      	b.eq	0x4647184 <_ChromeMain+0x4641ee8>
 4647134:      	mov	x23, x25
 4647138:      	b	0x464706c <_ChromeMain+0x4641dd0>
 464713c:      	ldr	x8, [x20, #0x40]
 4647140:      	cbz	x8, 0x4647154 <_ChromeMain+0x4641eb8>
 4647144:      	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4647148:      	add	x1, x1, #0x9a8
 464714c:      	add	x0, x8, #0x8
 4647150:      	bl	0x1262c9c <_ChromeMain+0x125da00>
 4647154:      	mov	x0, x19
 4647158:      	mov	x1, x20
 464715c:      	bl	0x464ef84 <_ChromeMain+0x4649ce8>
 4647160:      	add	x0, x19, #0xf98
 4647164:      	mov	x1, x21
 4647168:      	ldp	x29, x30, [sp, #0x90]
 464716c:      	ldp	x20, x19, [sp, #0x80]
 4647170:      	ldp	x22, x21, [sp, #0x70]
 4647174:      	ldp	x24, x23, [sp, #0x60]
 4647178:      	ldp	x26, x25, [sp, #0x50]
 464717c:      	add	sp, sp, #0xa0
 4647180:      	b	0x46500d8 <_ChromeMain+0x464ae3c>
 4647184:      	add	x9, sp, #0x20
 4647188:      	orr	x9, x9, #0x8
 464718c:      	ldr	x10, [sp, #0x28]
 4647190:      	cmp	w24, #0x0
 4647194:      	csel	x0, x10, x9, mi
 4647198:      	mov	x9, x21
 464719c:      	ldr	x10, [x9, #0x10]!
 46471a0:      	cmp	w8, #0x0
 46471a4:      	csel	x1, x10, x9, mi
 46471a8:      	bl	0x8009860 <_ChromeMain+0x80045c4>
 46471ac:      	mov	x23, x25
 46471b0:      	cbnz	w0, 0x464706c <_ChromeMain+0x4641dd0>
 46471b4:      	mov	w8, #0x1                ; =1
 46471b8:      	b	0x46470c8 <_ChromeMain+0x4641e2c>
