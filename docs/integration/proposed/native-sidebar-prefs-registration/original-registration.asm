
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34e3f1c:      	sub	sp, sp, #0x60
 34e3f20:      	stp	x20, x19, [sp, #0x40]
 34e3f24:      	stp	x29, x30, [sp, #0x50]
 34e3f28:      	add	x29, sp, #0x50
 34e3f2c:      	mov	x19, x0
 34e3f30:      	mov	w8, #-0x1               ; =-1
 34e3f34:      	str	w8, [sp, #0x20]
 34e3f38:      	mov	w8, #0x2                ; =2
 34e3f3c:      	strb	w8, [sp, #0x38]
 34e3f40:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3f44:      	add	x1, x1, #0x60
 34e3f48:      	add	x3, sp, #0x20
 34e3f4c:      	mov	w2, #0x10               ; =16
 34e3f50:      	mov	w4, #0x0                ; =0
 34e3f54:      	mov	w5, #0x0                ; =0
 34e3f58:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3f5c:      	add	x0, sp, #0x20
 34e3f60:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3f64:      	stp	xzr, xzr, [sp, #0x8]
 34e3f68:      	str	xzr, [sp, #0x18]
 34e3f6c:      	add	x0, sp, #0x20
 34e3f70:      	add	x1, sp, #0x8
 34e3f74:      	mov	x2, #0x0                ; =0
 34e3f78:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e3f7c:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3f80:      	add	x1, x1, #0x71
 34e3f84:      	add	x3, sp, #0x20
 34e3f88:      	mov	x0, x19
 34e3f8c:      	mov	w2, #0x15               ; =21
 34e3f90:      	mov	w4, #0x0                ; =0
 34e3f94:      	mov	w5, #0x0                ; =0
 34e3f98:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3f9c:      	add	x0, sp, #0x20
 34e3fa0:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3fa4:      	ldrsb	w8, [sp, #0x1f]
 34e3fa8:      	tbz	w8, #0x1f, 0x34e3fbc <_ChromeMain+0x34ded20>
 34e3fac:      	ldr	x0, [sp, #0x8]
 34e3fb0:      	ldr	x8, [sp, #0x18]
 34e3fb4:      	and	x1, x8, #0x7fffffffffffffff
 34e3fb8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e3fbc:      	stp	xzr, xzr, [sp, #0x8]
 34e3fc0:      	str	xzr, [sp, #0x18]
 34e3fc4:      	add	x0, sp, #0x20
 34e3fc8:      	add	x1, sp, #0x8
 34e3fcc:      	mov	x2, #0x0                ; =0
 34e3fd0:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e3fd4:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3fd8:      	add	x1, x1, #0x87
 34e3fdc:      	add	x3, sp, #0x20
 34e3fe0:      	mov	x0, x19
 34e3fe4:      	mov	w2, #0x13               ; =19
 34e3fe8:      	mov	w4, #0x0                ; =0
 34e3fec:      	mov	w5, #0x0                ; =0
 34e3ff0:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3ff4:      	add	x0, sp, #0x20
 34e3ff8:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3ffc:      	ldrsb	w8, [sp, #0x1f]
 34e4000:      	tbz	w8, #0x1f, 0x34e4014 <_ChromeMain+0x34ded78>
 34e4004:      	ldr	x0, [sp, #0x8]
 34e4008:      	ldr	x8, [sp, #0x18]
 34e400c:      	and	x1, x8, #0x7fffffffffffffff
 34e4010:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4014:      	stp	xzr, xzr, [sp, #0x8]
 34e4018:      	str	xzr, [sp, #0x18]
 34e401c:      	add	x0, sp, #0x20
 34e4020:      	add	x1, sp, #0x8
 34e4024:      	mov	x2, #0x0                ; =0
 34e4028:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e402c:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4030:      	add	x1, x1, #0x4da
 34e4034:      	add	x3, sp, #0x20
 34e4038:      	mov	x0, x19
 34e403c:      	mov	w2, #0x1a               ; =26
 34e4040:      	mov	w4, #0x0                ; =0
 34e4044:      	mov	w5, #0x0                ; =0
 34e4048:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e404c:      	add	x0, sp, #0x20
 34e4050:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4054:      	ldrsb	w8, [sp, #0x1f]
 34e4058:      	tbz	w8, #0x1f, 0x34e406c <_ChromeMain+0x34dedd0>
 34e405c:      	ldr	x0, [sp, #0x8]
 34e4060:      	ldr	x8, [sp, #0x18]
 34e4064:      	and	x1, x8, #0x7fffffffffffffff
 34e4068:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e406c:      	stp	xzr, xzr, [sp, #0x8]
 34e4070:      	str	xzr, [sp, #0x18]
 34e4074:      	add	x0, sp, #0x20
 34e4078:      	add	x1, sp, #0x8
 34e407c:      	mov	x2, #0x0                ; =0
 34e4080:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4084:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4088:      	add	x1, x1, #0x517
 34e408c:      	add	x3, sp, #0x20
 34e4090:      	mov	x0, x19
 34e4094:      	mov	w2, #0x19               ; =25
 34e4098:      	mov	w4, #0x0                ; =0
 34e409c:      	mov	w5, #0x0                ; =0
 34e40a0:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e40a4:      	add	x0, sp, #0x20
 34e40a8:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e40ac:      	ldrsb	w8, [sp, #0x1f]
 34e40b0:      	tbz	w8, #0x1f, 0x34e40c4 <_ChromeMain+0x34dee28>
 34e40b4:      	ldr	x0, [sp, #0x8]
 34e40b8:      	ldr	x8, [sp, #0x18]
 34e40bc:      	and	x1, x8, #0x7fffffffffffffff
 34e40c0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e40c4:      	strb	wzr, [sp, #0x20]
 34e40c8:      	mov	w20, #0x1               ; =1
 34e40cc:      	strb	w20, [sp, #0x38]
 34e40d0:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e40d4:      	add	x1, x1, #0x9b
 34e40d8:      	add	x3, sp, #0x20
 34e40dc:      	mov	x0, x19
 34e40e0:      	mov	w2, #0x23               ; =35
 34e40e4:      	mov	w4, #0x0                ; =0
 34e40e8:      	mov	w5, #0x0                ; =0
 34e40ec:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e40f0:      	add	x0, sp, #0x20
 34e40f4:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e40f8:      	strb	wzr, [sp, #0x20]
 34e40fc:      	strb	w20, [sp, #0x38]
 34e4100:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4104:      	add	x1, x1, #0xbf
 34e4108:      	add	x3, sp, #0x20
 34e410c:      	mov	x0, x19
 34e4110:      	mov	w2, #0x19               ; =25
 34e4114:      	mov	w4, #0x0                ; =0
 34e4118:      	mov	w5, #0x0                ; =0
 34e411c:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4120:      	add	x0, sp, #0x20
 34e4124:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4128:      	strb	wzr, [sp, #0x20]
 34e412c:      	strb	w20, [sp, #0x38]
 34e4130:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4134:      	add	x1, x1, #0xd9
 34e4138:      	add	x3, sp, #0x20
 34e413c:      	mov	x0, x19
 34e4140:      	mov	w2, #0x18               ; =24
 34e4144:      	mov	w4, #0x0                ; =0
 34e4148:      	mov	w5, #0x0                ; =0
 34e414c:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4150:      	add	x0, sp, #0x20
 34e4154:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4158:      	strb	wzr, [sp, #0x20]
 34e415c:      	strb	w20, [sp, #0x38]
 34e4160:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4164:      	add	x1, x1, #0x531
 34e4168:      	add	x3, sp, #0x20
 34e416c:      	mov	x0, x19
 34e4170:      	mov	w2, #0x28               ; =40
 34e4174:      	mov	w4, #0x0                ; =0
 34e4178:      	mov	w5, #0x0                ; =0
 34e417c:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4180:      	add	x0, sp, #0x20
 34e4184:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4188:      	strb	wzr, [sp, #0x20]
 34e418c:      	strb	w20, [sp, #0x38]
 34e4190:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4194:      	add	x1, x1, #0x55a
 34e4198:      	add	x3, sp, #0x20
 34e419c:      	mov	x0, x19
 34e41a0:      	mov	w2, #0x2a               ; =42
 34e41a4:      	mov	w4, #0x0                ; =0
 34e41a8:      	mov	w5, #0x0                ; =0
 34e41ac:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e41b0:      	add	x0, sp, #0x20
 34e41b4:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e41b8:      	stp	xzr, xzr, [sp, #0x8]
 34e41bc:      	str	xzr, [sp, #0x18]
 34e41c0:      	add	x0, sp, #0x20
 34e41c4:      	add	x1, sp, #0x8
 34e41c8:      	mov	x2, #0x0                ; =0
 34e41cc:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e41d0:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e41d4:      	add	x1, x1, #0x585
 34e41d8:      	add	x3, sp, #0x20
 34e41dc:      	mov	x0, x19
 34e41e0:      	mov	w2, #0x10               ; =16
 34e41e4:      	mov	w4, #0x0                ; =0
 34e41e8:      	mov	w5, #0x0                ; =0
 34e41ec:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e41f0:      	add	x0, sp, #0x20
 34e41f4:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e41f8:      	ldrsb	w8, [sp, #0x1f]
 34e41fc:      	tbz	w8, #0x1f, 0x34e4210 <_ChromeMain+0x34def74>
 34e4200:      	ldr	x0, [sp, #0x8]
 34e4204:      	ldr	x8, [sp, #0x18]
 34e4208:      	and	x1, x8, #0x7fffffffffffffff
 34e420c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4210:      	stp	xzr, xzr, [sp, #0x8]
 34e4214:      	str	xzr, [sp, #0x18]
 34e4218:      	add	x0, sp, #0x20
 34e421c:      	add	x1, sp, #0x8
 34e4220:      	mov	x2, #0x0                ; =0
 34e4224:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4228:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e422c:      	add	x1, x1, #0xf2
 34e4230:      	add	x3, sp, #0x20
 34e4234:      	mov	x0, x19
 34e4238:      	mov	w2, #0x22               ; =34
 34e423c:      	mov	w4, #0x0                ; =0
 34e4240:      	mov	w5, #0x0                ; =0
 34e4244:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4248:      	add	x0, sp, #0x20
 34e424c:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4250:      	ldrsb	w8, [sp, #0x1f]
 34e4254:      	tbz	w8, #0x1f, 0x34e4268 <_ChromeMain+0x34defcc>
 34e4258:      	ldr	x0, [sp, #0x8]
 34e425c:      	ldr	x8, [sp, #0x18]
 34e4260:      	and	x1, x8, #0x7fffffffffffffff
 34e4264:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4268:      	stp	xzr, xzr, [sp, #0x8]
 34e426c:      	str	xzr, [sp, #0x18]
 34e4270:      	add	x0, sp, #0x20
 34e4274:      	add	x1, sp, #0x8
 34e4278:      	mov	x2, #0x0                ; =0
 34e427c:      	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4280:      	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4284:      	add	x1, x1, #0x143
 34e4288:      	add	x3, sp, #0x20
 34e428c:      	mov	x0, x19
 34e4290:      	mov	w2, #0x28               ; =40
 34e4294:      	mov	w4, #0x0                ; =0
 34e4298:      	mov	w5, #0x0                ; =0
 34e429c:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e42a0:      	add	x0, sp, #0x20
 34e42a4:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e42a8:      	ldrsb	w8, [sp, #0x1f]
 34e42ac:      	tbz	w8, #0x1f, 0x34e42c0 <_ChromeMain+0x34df024>
 34e42b0:      	ldr	x0, [sp, #0x8]
 34e42b4:      	ldr	x8, [sp, #0x18]
 34e42b8:      	and	x1, x8, #0x7fffffffffffffff
 34e42bc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e42c0:      	strb	w20, [sp, #0x20]
 34e42c4:      	strb	w20, [sp, #0x38]
 34e42c8:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e42cc:      	add	x1, x1, #0x596
 34e42d0:      	add	x3, sp, #0x20
 34e42d4:      	mov	x0, x19
 34e42d8:      	mov	w2, #0x28               ; =40
 34e42dc:      	mov	w4, #0x0                ; =0
 34e42e0:      	mov	w5, #0x0                ; =0
 34e42e4:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e42e8:      	add	x0, sp, #0x20
 34e42ec:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e42f0:      	strb	w20, [sp, #0x20]
 34e42f4:      	strb	w20, [sp, #0x38]
 34e42f8:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e42fc:      	add	x1, x1, #0x5bf
 34e4300:      	add	x3, sp, #0x20
 34e4304:      	mov	x0, x19
 34e4308:      	mov	w2, #0x2d               ; =45
 34e430c:      	mov	w4, #0x0                ; =0
 34e4310:      	mov	w5, #0x0                ; =0
 34e4314:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4318:      	add	x0, sp, #0x20
 34e431c:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4320:      	strb	w20, [sp, #0x20]
 34e4324:      	strb	w20, [sp, #0x38]
 34e4328:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e432c:      	add	x1, x1, #0x5ed
 34e4330:      	add	x3, sp, #0x20
 34e4334:      	mov	x0, x19
 34e4338:      	mov	w2, #0x2e               ; =46
 34e433c:      	mov	w4, #0x0                ; =0
 34e4340:      	mov	w5, #0x0                ; =0
 34e4344:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4348:      	add	x0, sp, #0x20
 34e434c:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4350:      	strb	w20, [sp, #0x20]
 34e4354:      	strb	w20, [sp, #0x38]
 34e4358:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e435c:      	add	x1, x1, #0x61c
 34e4360:      	add	x3, sp, #0x20
 34e4364:      	mov	x0, x19
 34e4368:      	mov	w2, #0x2a               ; =42
 34e436c:      	mov	w4, #0x0                ; =0
 34e4370:      	mov	w5, #0x0                ; =0
 34e4374:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4378:      	add	x0, sp, #0x20
 34e437c:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4380:      	add	x0, sp, #0x20
 34e4384:      	mov	w1, #0x7                ; =7
 34e4388:      	bl	0x5cf5b0 <_ChromeMain+0x5ca314>
 34e438c:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4390:      	add	x1, x1, #0x647
 34e4394:      	add	x3, sp, #0x20
 34e4398:      	mov	x0, x19
 34e439c:      	mov	w2, #0x30               ; =48
 34e43a0:      	mov	w4, #0x0                ; =0
 34e43a4:      	mov	w5, #0x0                ; =0
 34e43a8:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e43ac:      	add	x0, sp, #0x20
 34e43b0:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e43b4:      	strb	wzr, [sp, #0x20]
 34e43b8:      	strb	w20, [sp, #0x38]
 34e43bc:      	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e43c0:      	add	x1, x1, #0x678
 34e43c4:      	add	x3, sp, #0x20
 34e43c8:      	mov	x0, x19
 34e43cc:      	mov	w2, #0x16               ; =22
 34e43d0:      	mov	w4, #0x0                ; =0
 34e43d4:      	mov	w5, #0x0                ; =0
 34e43d8:      	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e43dc:      	add	x0, sp, #0x20
 34e43e0:      	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e43e4:      	ldp	x29, x30, [sp, #0x50]
 34e43e8:      	ldp	x20, x19, [sp, #0x40]
 34e43ec:      	add	sp, sp, #0x60
 34e43f0:      	ret
