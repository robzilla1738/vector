
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4645e90:      	sub	sp, sp, #0xf0
 4645e94:      	stp	x28, x27, [sp, #0x90]
 4645e98:      	stp	x26, x25, [sp, #0xa0]
 4645e9c:      	stp	x24, x23, [sp, #0xb0]
 4645ea0:      	stp	x22, x21, [sp, #0xc0]
 4645ea4:      	stp	x20, x19, [sp, #0xd0]
 4645ea8:      	stp	x29, x30, [sp, #0xe0]
 4645eac:      	add	x29, sp, #0xe0
 4645eb0:      	cbz	x1, 0x4645f2c <_ChromeMain+0x4640c90>
 4645eb4:      	mov	x19, x1
 4645eb8:      	mov	x20, x0
 4645ebc:      	ldr	w24, [x1, #0x10]
 4645ec0:      	ldr	x8, [x0, #0xf98]
 4645ec4:      	ldr	x9, [x0, #0xfa0]
 4645ec8:      	add	x10, x9, x9, lsl #2
 4645ecc:      	lsl	x10, x10, #3
 4645ed0:      	cbz	x10, 0x4645f4c <_ChromeMain+0x4640cb0>
 4645ed4:      	asr	x10, x10, #3
 4645ed8:      	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4645edc:      	movk	x11, #0xcccd
 4645ee0:      	mul	x12, x10, x11
 4645ee4:      	mov	w11, #0x28              ; =40
 4645ee8:      	mov	x10, x8
 4645eec:      	lsr	x13, x12, #1
 4645ef0:      	madd	x14, x13, x11, x10
 4645ef4:      	ldr	w15, [x14], #0x28
 4645ef8:      	mvn	x16, x12, lsr #1
 4645efc:      	add	x12, x12, x16
 4645f00:      	cmp	w15, w24
 4645f04:      	csel	x12, x12, x13, lt
 4645f08:      	csel	x10, x14, x10, lt
 4645f0c:      	cbnz	x12, 0x4645eec <_ChromeMain+0x4640c50>
 4645f10:      	mov	w11, #0x28              ; =40
 4645f14:      	madd	x8, x9, x11, x8
 4645f18:      	cmp	x10, x8
 4645f1c:      	b.eq	0x4645fd8 <_ChromeMain+0x4640d3c>
 4645f20:      	ldr	w8, [x10]
 4645f24:      	cmp	w24, w8
 4645f28:      	b.lt	0x4645fd8 <_ChromeMain+0x4640d3c>
 4645f2c:      	ldp	x29, x30, [sp, #0xe0]
 4645f30:      	ldp	x20, x19, [sp, #0xd0]
 4645f34:      	ldp	x22, x21, [sp, #0xc0]
 4645f38:      	ldp	x24, x23, [sp, #0xb0]
 4645f3c:      	ldp	x26, x25, [sp, #0xa0]
 4645f40:      	ldp	x28, x27, [sp, #0x90]
 4645f44:      	add	sp, sp, #0xf0
 4645f48:      	ret
 4645f4c:      	mov	x10, x8
 4645f50:      	b	0x4645f10 <_ChromeMain+0x4640c74>
 4645f54:      	ldr	x0, [sp, #0x70]
 4645f58:      	cbz	x0, 0x4645f6c <_ChromeMain+0x4640cd0>
 4645f5c:      	ldr	x8, [sp, #0x88]
 4645f60:      	add	x8, x8, x8, lsl #2
 4645f64:      	lsl	x1, x8, #3
 4645f68:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4645f6c:      	ldr	x21, [sp, #0x18]
 4645f70:      	ldrb	w8, [sp, #0x60]
 4645f74:      	tbz	w8, #0x0, 0x4646420 <_ChromeMain+0x4641184>
 4645f78:      	ldr	x2, [sp, #0x40]
 4645f7c:      	mov	x0, x20
 4645f80:      	mov	x1, x19
 4645f84:      	mov	x3, x21
 4645f88:      	bl	0x464ffb8 <_ChromeMain+0x464ad1c>
 4645f8c:      	ldrsb	w8, [sp, #0x3f]
 4645f90:      	tbz	w8, #0x1f, 0x4645fa4 <_ChromeMain+0x4640d08>
 4645f94:      	ldr	x0, [sp, #0x28]
 4645f98:      	ldr	x8, [sp, #0x38]
 4645f9c:      	and	x1, x8, #0x7fffffffffffffff
 4645fa0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4645fa4:      	ldrb	w9, [sp, #0x60]
 4645fa8:      	tbz	w9, #0x0, 0x4645f2c <_ChromeMain+0x4640c90>
 4645fac:      	ldrsb	w8, [sp, #0x5f]
 4645fb0:      	tbz	w8, #0x1f, 0x4645f2c <_ChromeMain+0x4640c90>
 4645fb4:      	ldr	x0, [sp, #0x48]
 4645fb8:      	ldr	x8, [sp, #0x58]
 4645fbc:      	and	x1, x8, #0x7fffffffffffffff
 4645fc0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4645fc4:      	b	0x4645f2c <_ChromeMain+0x4640c90>
 4645fc8:      	mov	w9, #0x1                ; =1
 4645fcc:      	b	0x4645fa8 <_ChromeMain+0x4640d0c>
 4645fd0:      	mov	x22, x27
 4645fd4:      	b	0x464609c <_ChromeMain+0x4640e00>
 4645fd8:      	ldr	x0, [x19, #0x40]
 4645fdc:      	cbz	x0, 0x4645f2c <_ChromeMain+0x4640c90>
 4645fe0:      	str	xzr, [sp, #0x60]
 4645fe4:      	movi.2d	v0, #0000000000000000
 4645fe8:      	stp	q0, q0, [sp, #0x40]
 4645fec:      	add	x8, sp, #0x40
 4645ff0:      	bl	0x4557640 <_ChromeMain+0x45523a4>
 4645ff4:      	ldrb	w9, [sp, #0x60]
 4645ff8:      	tbz	w9, #0x0, 0x4645fa8 <_ChromeMain+0x4640d0c>
 4645ffc:      	ldr	x8, [sp, #0x40]
 4646000:      	cbz	x8, 0x4645fa8 <_ChromeMain+0x4640d0c>
 4646004:      	ldrb	w10, [sp, #0x5f]
 4646008:      	sxtb	w9, w10
 464600c:      	ldr	x2, [sp, #0x50]
 4646010:      	cmp	w9, #0x0
 4646014:      	csel	x10, x2, x10, mi
 4646018:      	cbz	x10, 0x4645fc8 <_ChromeMain+0x4640d2c>
 464601c:      	add	x26, x20, #0xf98
 4646020:      	add	x23, x20, #0xfa0
 4646024:      	add	x10, sp, #0x40
 4646028:      	stp	xzr, xzr, [sp, #0x30]
 464602c:      	orr	x21, x10, #0x8
 4646030:      	add	x25, sp, #0x20
 4646034:      	stp	x8, xzr, [sp, #0x20]
 4646038:      	tbnz	w9, #0x1f, 0x46460e4 <_ChromeMain+0x4640e48>
 464603c:      	ldr	q0, [x21]
 4646040:      	stur	q0, [x25, #0x8]
 4646044:      	ldr	x8, [x21, #0x10]
 4646048:      	stur	x8, [x25, #0x18]
 464604c:      	ldr	x27, [x26]
 4646050:      	ldr	x9, [x23]
 4646054:      	add	x8, x9, x9, lsl #2
 4646058:      	lsl	x8, x8, #3
 464605c:      	cbz	x8, 0x4645fd0 <_ChromeMain+0x4640d34>
 4646060:      	asr	x10, x8, #3
 4646064:      	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4646068:      	movk	x11, #0xcccd
 464606c:      	mul	x11, x10, x11
 4646070:      	mov	w10, #0x28              ; =40
 4646074:      	mov	x22, x27
 4646078:      	lsr	x12, x11, #1
 464607c:      	madd	x13, x12, x10, x22
 4646080:      	ldr	w14, [x13], #0x28
 4646084:      	mvn	x15, x11, lsr #1
 4646088:      	add	x11, x11, x15
 464608c:      	cmp	w14, w24
 4646090:      	csel	x11, x11, x12, lt
 4646094:      	csel	x22, x13, x22, lt
 4646098:      	cbnz	x11, 0x4646078 <_ChromeMain+0x4640ddc>
 464609c:      	mov	w10, #0x28              ; =40
 46460a0:      	madd	x10, x9, x10, x27
 46460a4:      	cmp	x22, x10
 46460a8:      	b.eq	0x4646140 <_ChromeMain+0x4640ea4>
 46460ac:      	ldr	w10, [x22]
 46460b0:      	cmp	w24, w10
 46460b4:      	b.lt	0x4646140 <_ChromeMain+0x4640ea4>
 46460b8:      	ldr	x8, [sp, #0x20]
 46460bc:      	str	x8, [x22, #0x8]
 46460c0:      	ldrsb	w8, [x22, #0x27]
 46460c4:      	tbnz	w8, #0x1f, 0x4646424 <_ChromeMain+0x4641188>
 46460c8:      	ldur	q0, [x25, #0x8]
 46460cc:      	ldur	x8, [x25, #0x18]
 46460d0:      	stur	x8, [x22, #0x20]
 46460d4:      	stur	q0, [x22, #0x10]
 46460d8:      	strb	wzr, [sp, #0x3f]
 46460dc:      	strb	wzr, [sp, #0x28]
 46460e0:      	b	0x4645f70 <_ChromeMain+0x4640cd4>
 46460e4:      	ldr	x1, [sp, #0x48]
 46460e8:      	add	x0, x25, #0x8
 46460ec:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 46460f0:      	b	0x464604c <_ChromeMain+0x4640db0>
 46460f4:      	cbz	x22, 0x4646420 <_ChromeMain+0x4641184>
 46460f8:      	str	w24, [x22]
 46460fc:      	ldr	x8, [sp, #0x20]
 4646100:      	str	x8, [x22, #0x8]
 4646104:      	ldur	x8, [x25, #0x18]
 4646108:      	ldur	q0, [x25, #0x8]
 464610c:      	str	q0, [x22, #0x10]
 4646110:      	str	x8, [x22, #0x20]
 4646114:      	stp	xzr, xzr, [x25, #0x10]
 4646118:      	stur	xzr, [x25, #0x8]
 464611c:      	ldr	x8, [x26]
 4646120:      	sub	x8, x22, x8
 4646124:      	add	x8, x8, #0x28
 4646128:      	asr	x8, x8, #3
 464612c:      	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646130:      	movk	x9, #0xcccd
 4646134:      	mul	x8, x8, x9
 4646138:      	str	x8, [x23]
 464613c:      	b	0x4645f70 <_ChromeMain+0x4640cd4>
 4646140:      	sub	x28, x22, x27
 4646144:      	ldr	x10, [x20, #0xfa8]
 4646148:      	cmp	x9, x10
 464614c:      	b.eq	0x4646290 <_ChromeMain+0x4640ff4>
 4646150:      	add	x9, x27, x8
 4646154:      	cmp	x22, x9
 4646158:      	b.eq	0x46460f4 <_ChromeMain+0x4640e58>
 464615c:      	add	x13, x20, #0xfa0
 4646160:      	str	x21, [sp, #0x18]
 4646164:      	ldp	x15, x14, [sp, #0x20]
 4646168:      	ldr	q1, [sp, #0x30]
 464616c:      	stp	xzr, xzr, [x25, #0x10]
 4646170:      	sub	x23, x9, #0x28
 4646174:      	stur	xzr, [x25, #0x8]
 4646178:      	cmp	x23, x9
 464617c:      	b.hs	0x46461d4 <_ChromeMain+0x4640f38>
 4646180:      	add	x10, x8, x27
 4646184:      	add	x10, x10, #0x28
 4646188:      	ldur	w11, [x10, #-0x50]
 464618c:      	mov	x12, x10
 4646190:      	str	w11, [x12, #-0x28]!
 4646194:      	ldur	x11, [x12, #-0x20]
 4646198:      	str	x11, [x12, #0x8]
 464619c:      	ldur	q0, [x12, #-0x18]
 46461a0:      	str	q0, [x12, #0x10]
 46461a4:      	ldur	x11, [x12, #-0x8]
 46461a8:      	str	x11, [x12, #0x20]
 46461ac:      	stp	xzr, xzr, [x12, #-0x18]
 46461b0:      	stur	xzr, [x12, #-0x8]
 46461b4:      	cmp	x12, x9
 46461b8:      	b.hs	0x46461cc <_ChromeMain+0x4640f30>
 46461bc:      	add	x10, x10, #0x28
 46461c0:      	cmp	x10, #0x28
 46461c4:      	b.ne	0x4646188 <_ChromeMain+0x4640eec>
 46461c8:      	b	0x4646420 <_ChromeMain+0x4641184>
 46461cc:      	ldr	x27, [x26]
 46461d0:      	b	0x46461d8 <_ChromeMain+0x4640f3c>
 46461d4:      	add	x10, x27, x8
 46461d8:      	sub	x9, x10, x27
 46461dc:      	asr	x9, x9, #3
 46461e0:      	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 46461e4:      	movk	x10, #0xcccd
 46461e8:      	mul	x9, x9, x10
 46461ec:      	str	x9, [x13]
 46461f0:      	add	x9, x28, #0x28
 46461f4:      	cmp	x8, x9
 46461f8:      	b.eq	0x4646240 <_ChromeMain+0x4640fa4>
 46461fc:      	mov	x21, x23
 4646200:      	ldr	w8, [x21, #-0x28]!
 4646204:      	str	w8, [x23]
 4646208:      	ldur	x8, [x23, #-0x20]
 464620c:      	str	x8, [x23, #0x8]
 4646210:      	ldrsb	w8, [x23, #0x27]
 4646214:      	tbnz	w8, #0x1f, 0x464625c <_ChromeMain+0x4640fc0>
 4646218:      	sub	x8, x23, #0x18
 464621c:      	ldr	q0, [x8]
 4646220:      	stur	q0, [x23, #0x10]
 4646224:      	ldr	x8, [x8, #0x10]
 4646228:      	stur	x8, [x23, #0x20]
 464622c:      	sturb	wzr, [x23, #-0x1]
 4646230:      	sturb	wzr, [x23, #-0x18]
 4646234:      	mov	x23, x21
 4646238:      	cmp	x21, x22
 464623c:      	b.ne	0x4646200 <_ChromeMain+0x4640f64>
 4646240:      	str	w24, [x22]
 4646244:      	str	x15, [x22, #0x8]
 4646248:      	ldrsb	w8, [x22, #0x27]
 464624c:      	tbnz	w8, #0x1f, 0x4646440 <_ChromeMain+0x46411a4>
 4646250:      	str	x14, [x22, #0x10]
 4646254:      	stur	q1, [x22, #0x18]
 4646258:      	b	0x4645f6c <_ChromeMain+0x4640cd0>
 464625c:      	ldr	x0, [x23, #0x10]
 4646260:      	ldr	x8, [x23, #0x20]
 4646264:      	and	x1, x8, #0x7fffffffffffffff
 4646268:      	str	q1, [sp]
 464626c:      	mov	x25, x14
 4646270:      	mov	x26, x15
 4646274:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646278:      	mov	x15, x26
 464627c:      	mov	x14, x25
 4646280:      	ldr	q1, [sp]
 4646284:      	b	0x4646218 <_ChromeMain+0x4640f7c>
 4646288:      	mov	x23, #0x0               ; =0
 464628c:      	b	0x46462e8 <_ChromeMain+0x464104c>
 4646290:      	str	x21, [sp, #0x18]
 4646294:      	mov	x8, #0x6666666666666666 ; =7378697629483820646
 4646298:      	movk	x8, #0x666, lsl #48
 464629c:      	add	x10, x9, #0x1
 46462a0:      	cmp	x10, x8
 46462a4:      	b.hi	0x4646464 <_ChromeMain+0x46411c8>
 46462a8:      	lsl	x11, x9, #1
 46462ac:      	cmp	x11, x10
 46462b0:      	csel	x10, x11, x10, hi
 46462b4:      	mov	x11, #0x3333333333333333 ; =3689348814741910323
 46462b8:      	movk	x11, #0x333, lsl #48
 46462bc:      	cmp	x9, x11
 46462c0:      	csel	x21, x10, x8, lo
 46462c4:      	str	xzr, [sp, #0x70]
 46462c8:      	cbz	x21, 0x4646288 <_ChromeMain+0x4640fec>
 46462cc:      	cmp	x21, x8
 46462d0:      	b.hi	0x4646468 <_ChromeMain+0x46411cc>
 46462d4:      	add	x8, x21, x21, lsl #2
 46462d8:      	lsl	x0, x8, #3
 46462dc:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46462e0:      	mov	x23, x0
 46462e4:      	str	x0, [sp, #0x70]
 46462e8:      	add	x26, x23, x28
 46462ec:      	str	x26, [sp, #0x78]
 46462f0:      	str	x21, [sp, #0x88]
 46462f4:      	asr	x8, x28, #3
 46462f8:      	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 46462fc:      	movk	x9, #0xcccd
 4646300:      	mul	x8, x8, x9
 4646304:      	cmp	x21, x8
 4646308:      	b.ne	0x4646328 <_ChromeMain+0x464108c>
 464630c:      	cmp	x22, x27
 4646310:      	b.eq	0x46463dc <_ChromeMain+0x4641140>
 4646314:      	add	x8, x21, #0x1
 4646318:      	lsr	x8, x8, #1
 464631c:      	mov	x9, #-0x28              ; =-40
 4646320:      	madd	x26, x8, x9, x26
 4646324:      	str	x26, [sp, #0x78]
 4646328:      	cbz	x26, 0x4646420 <_ChromeMain+0x4641184>
 464632c:      	str	w24, [x26]
 4646330:      	ldr	x8, [sp, #0x20]
 4646334:      	str	x8, [x26, #0x8]
 4646338:      	ldur	x8, [x25, #0x18]
 464633c:      	ldur	q0, [x25, #0x8]
 4646340:      	str	q0, [x26, #0x10]
 4646344:      	str	x8, [x26, #0x20]
 4646348:      	stp	xzr, xzr, [x25, #0x10]
 464634c:      	stur	xzr, [x25, #0x8]
 4646350:      	ldr	x8, [sp, #0x78]
 4646354:      	sub	x8, x26, x8
 4646358:      	add	x8, x8, #0x28
 464635c:      	asr	x8, x8, #3
 4646360:      	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646364:      	movk	x9, #0xcccd
 4646368:      	mul	x8, x8, x9
 464636c:      	str	x8, [sp, #0x80]
 4646370:      	add	x0, sp, #0x70
 4646374:      	add	x2, x20, #0xf98
 4646378:      	add	x3, x20, #0xfa0
 464637c:      	add	x4, x20, #0xfa8
 4646380:      	mov	x1, x22
 4646384:      	bl	0x468289c <_ChromeMain+0x467d600>
 4646388:      	ldr	x8, [sp, #0x80]
 464638c:      	add	x9, x8, x8, lsl #2
 4646390:      	lsl	x9, x9, #3
 4646394:      	cbz	x9, 0x4645f54 <_ChromeMain+0x4640cb8>
 4646398:      	ldr	x10, [sp, #0x78]
 464639c:      	add	x9, x9, x10
 46463a0:      	sub	x21, x9, #0x28
 46463a4:      	mov	x9, #-0x28              ; =-40
 46463a8:      	mul	x22, x8, x9
 46463ac:      	b	0x46463cc <_ChromeMain+0x4641130>
 46463b0:      	ldr	x0, [x21, #0x10]
 46463b4:      	ldr	x8, [x21, #0x20]
 46463b8:      	and	x1, x8, #0x7fffffffffffffff
 46463bc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46463c0:      	sub	x21, x21, #0x28
 46463c4:      	adds	x22, x22, #0x28
 46463c8:      	b.eq	0x4645f54 <_ChromeMain+0x4640cb8>
 46463cc:      	cbz	x21, 0x4646420 <_ChromeMain+0x4641184>
 46463d0:      	ldrsb	w8, [x21, #0x27]
 46463d4:      	tbz	w8, #0x1f, 0x46463c0 <_ChromeMain+0x4641124>
 46463d8:      	b	0x46463b0 <_ChromeMain+0x4641114>
 46463dc:      	lsl	x8, x21, #1
 46463e0:      	cmp	x8, #0x1
 46463e4:      	csinc	x27, x8, xzr, hi
 46463e8:      	lsr	x28, x27, #2
 46463ec:      	add	x8, x27, x27, lsl #2
 46463f0:      	lsl	x0, x8, #3
 46463f4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 46463f8:      	mov	w8, #0x28               ; =40
 46463fc:      	madd	x8, x28, x8, x0
 4646400:      	stp	x0, x8, [sp, #0x70]
 4646404:      	str	x27, [sp, #0x88]
 4646408:      	cbz	x23, 0x4646328 <_ChromeMain+0x464108c>
 464640c:      	add	x8, x21, x21, lsl #2
 4646410:      	lsl	x1, x8, #3
 4646414:      	mov	x0, x23
 4646418:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464641c:      	b	0x4646328 <_ChromeMain+0x464108c>
 4646420:      	brk	#0x1
 4646424:      	ldr	x0, [x22, #0x10]
 4646428:      	ldr	x8, [x22, #0x20]
 464642c:      	and	x1, x8, #0x7fffffffffffffff
 4646430:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646434:      	stp	xzr, xzr, [x22, #0x10]
 4646438:      	stur	xzr, [x22, #0x20]
 464643c:      	b	0x46460c8 <_ChromeMain+0x4640e2c>
 4646440:      	ldr	x0, [x22, #0x10]
 4646444:      	ldr	x8, [x22, #0x20]
 4646448:      	and	x1, x8, #0x7fffffffffffffff
 464644c:      	str	q1, [sp]
 4646450:      	mov	x21, x14
 4646454:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646458:      	mov	x14, x21
 464645c:      	ldr	q1, [sp]
 4646460:      	b	0x4646250 <_ChromeMain+0x4640fb4>
 4646464:      	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 4646468:      	bl	0x4c06020 <_ChromeMain+0x4c00d84>
