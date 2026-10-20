
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 34e3f1c: d10183ff     	sub	sp, sp, #0x60
 34e3f20: a9044ff4     	stp	x20, x19, [sp, #0x40]
 34e3f24: a9057bfd     	stp	x29, x30, [sp, #0x50]
 34e3f28: 910143fd     	add	x29, sp, #0x50
 34e3f2c: aa0003f3     	mov	x19, x0
 34e3f30: 12800008     	mov	w8, #-0x1               ; =-1
 34e3f34: b90023e8     	str	w8, [sp, #0x20]
 34e3f38: 52800048     	mov	w8, #0x2                ; =2
 34e3f3c: 3900e3e8     	strb	w8, [sp, #0x38]
 34e3f40: b004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3f44: 91018021     	add	x1, x1, #0x60
 34e3f48: 910083e3     	add	x3, sp, #0x20
 34e3f4c: 52800202     	mov	w2, #0x10               ; =16
 34e3f50: 52800004     	mov	w4, #0x0                ; =0
 34e3f54: 52800005     	mov	w5, #0x0                ; =0
 34e3f58: 975be73e     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3f5c: 910083e0     	add	x0, sp, #0x20
 34e3f60: 9784ea1d     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3f64: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e3f68: f9000fff     	str	xzr, [sp, #0x18]
 34e3f6c: 910083e0     	add	x0, sp, #0x20
 34e3f70: 910023e1     	add	x1, sp, #0x8
 34e3f74: d2800002     	mov	x2, #0x0                ; =0
 34e3f78: 975be702     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e3f7c: b004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3f80: 9101c421     	add	x1, x1, #0x71
 34e3f84: 910083e3     	add	x3, sp, #0x20
 34e3f88: aa1303e0     	mov	x0, x19
 34e3f8c: 528002a2     	mov	w2, #0x15               ; =21
 34e3f90: 52800004     	mov	w4, #0x0                ; =0
 34e3f94: 52800005     	mov	w5, #0x0                ; =0
 34e3f98: 975be72e     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3f9c: 910083e0     	add	x0, sp, #0x20
 34e3fa0: 9784ea0d     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3fa4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e3fa8: 36f800a8     	tbz	w8, #0x1f, 0x34e3fbc <_ChromeMain+0x34ded20>
 34e3fac: f94007e0     	ldr	x0, [sp, #0x8]
 34e3fb0: f9400fe8     	ldr	x8, [sp, #0x18]
 34e3fb4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e3fb8: 972c93c0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e3fbc: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e3fc0: f9000fff     	str	xzr, [sp, #0x18]
 34e3fc4: 910083e0     	add	x0, sp, #0x20
 34e3fc8: 910023e1     	add	x1, sp, #0x8
 34e3fcc: d2800002     	mov	x2, #0x0                ; =0
 34e3fd0: 975be6ec     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e3fd4: b004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e3fd8: 91021c21     	add	x1, x1, #0x87
 34e3fdc: 910083e3     	add	x3, sp, #0x20
 34e3fe0: aa1303e0     	mov	x0, x19
 34e3fe4: 52800262     	mov	w2, #0x13               ; =19
 34e3fe8: 52800004     	mov	w4, #0x0                ; =0
 34e3fec: 52800005     	mov	w5, #0x0                ; =0
 34e3ff0: 975be718     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e3ff4: 910083e0     	add	x0, sp, #0x20
 34e3ff8: 9784e9f7     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e3ffc: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e4000: 36f800a8     	tbz	w8, #0x1f, 0x34e4014 <_ChromeMain+0x34ded78>
 34e4004: f94007e0     	ldr	x0, [sp, #0x8]
 34e4008: f9400fe8     	ldr	x8, [sp, #0x18]
 34e400c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e4010: 972c93aa     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4014: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e4018: f9000fff     	str	xzr, [sp, #0x18]
 34e401c: 910083e0     	add	x0, sp, #0x20
 34e4020: 910023e1     	add	x1, sp, #0x8
 34e4024: d2800002     	mov	x2, #0x0                ; =0
 34e4028: 975be6d6     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e402c: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4030: 91136821     	add	x1, x1, #0x4da
 34e4034: 910083e3     	add	x3, sp, #0x20
 34e4038: aa1303e0     	mov	x0, x19
 34e403c: 52800342     	mov	w2, #0x1a               ; =26
 34e4040: 52800004     	mov	w4, #0x0                ; =0
 34e4044: 52800005     	mov	w5, #0x0                ; =0
 34e4048: 975be702     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e404c: 910083e0     	add	x0, sp, #0x20
 34e4050: 9784e9e1     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4054: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e4058: 36f800a8     	tbz	w8, #0x1f, 0x34e406c <_ChromeMain+0x34dedd0>
 34e405c: f94007e0     	ldr	x0, [sp, #0x8]
 34e4060: f9400fe8     	ldr	x8, [sp, #0x18]
 34e4064: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e4068: 972c9394     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e406c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e4070: f9000fff     	str	xzr, [sp, #0x18]
 34e4074: 910083e0     	add	x0, sp, #0x20
 34e4078: 910023e1     	add	x1, sp, #0x8
 34e407c: d2800002     	mov	x2, #0x0                ; =0
 34e4080: 975be6c0     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4084: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4088: 91145c21     	add	x1, x1, #0x517
 34e408c: 910083e3     	add	x3, sp, #0x20
 34e4090: aa1303e0     	mov	x0, x19
 34e4094: 52800322     	mov	w2, #0x19               ; =25
 34e4098: 52800004     	mov	w4, #0x0                ; =0
 34e409c: 52800005     	mov	w5, #0x0                ; =0
 34e40a0: 975be6ec     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e40a4: 910083e0     	add	x0, sp, #0x20
 34e40a8: 9784e9cb     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e40ac: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e40b0: 36f800a8     	tbz	w8, #0x1f, 0x34e40c4 <_ChromeMain+0x34dee28>
 34e40b4: f94007e0     	ldr	x0, [sp, #0x8]
 34e40b8: f9400fe8     	ldr	x8, [sp, #0x18]
 34e40bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e40c0: 972c937e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e40c4: 390083ff     	strb	wzr, [sp, #0x20]
 34e40c8: 52800034     	mov	w20, #0x1               ; =1
 34e40cc: 3900e3f4     	strb	w20, [sp, #0x38]
 34e40d0: 9004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e40d4: 91026c21     	add	x1, x1, #0x9b
 34e40d8: 910083e3     	add	x3, sp, #0x20
 34e40dc: aa1303e0     	mov	x0, x19
 34e40e0: 52800462     	mov	w2, #0x23               ; =35
 34e40e4: 52800004     	mov	w4, #0x0                ; =0
 34e40e8: 52800005     	mov	w5, #0x0                ; =0
 34e40ec: 975be6d9     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e40f0: 910083e0     	add	x0, sp, #0x20
 34e40f4: 9784e9b8     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e40f8: 390083ff     	strb	wzr, [sp, #0x20]
 34e40fc: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4100: 9004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4104: 9102fc21     	add	x1, x1, #0xbf
 34e4108: 910083e3     	add	x3, sp, #0x20
 34e410c: aa1303e0     	mov	x0, x19
 34e4110: 52800322     	mov	w2, #0x19               ; =25
 34e4114: 52800004     	mov	w4, #0x0                ; =0
 34e4118: 52800005     	mov	w5, #0x0                ; =0
 34e411c: 975be6cd     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4120: 910083e0     	add	x0, sp, #0x20
 34e4124: 9784e9ac     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4128: 390083ff     	strb	wzr, [sp, #0x20]
 34e412c: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4130: 9004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4134: 91036421     	add	x1, x1, #0xd9
 34e4138: 910083e3     	add	x3, sp, #0x20
 34e413c: aa1303e0     	mov	x0, x19
 34e4140: 52800302     	mov	w2, #0x18               ; =24
 34e4144: 52800004     	mov	w4, #0x0                ; =0
 34e4148: 52800005     	mov	w5, #0x0                ; =0
 34e414c: 975be6c1     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4150: 910083e0     	add	x0, sp, #0x20
 34e4154: 9784e9a0     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4158: 390083ff     	strb	wzr, [sp, #0x20]
 34e415c: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4160: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4164: 9114c421     	add	x1, x1, #0x531
 34e4168: 910083e3     	add	x3, sp, #0x20
 34e416c: aa1303e0     	mov	x0, x19
 34e4170: 52800502     	mov	w2, #0x28               ; =40
 34e4174: 52800004     	mov	w4, #0x0                ; =0
 34e4178: 52800005     	mov	w5, #0x0                ; =0
 34e417c: 975be6b5     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4180: 910083e0     	add	x0, sp, #0x20
 34e4184: 9784e994     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4188: 390083ff     	strb	wzr, [sp, #0x20]
 34e418c: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4190: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4194: 91156821     	add	x1, x1, #0x55a
 34e4198: 910083e3     	add	x3, sp, #0x20
 34e419c: aa1303e0     	mov	x0, x19
 34e41a0: 52800542     	mov	w2, #0x2a               ; =42
 34e41a4: 52800004     	mov	w4, #0x0                ; =0
 34e41a8: 52800005     	mov	w5, #0x0                ; =0
 34e41ac: 975be6a9     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e41b0: 910083e0     	add	x0, sp, #0x20
 34e41b4: 9784e988     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e41b8: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e41bc: f9000fff     	str	xzr, [sp, #0x18]
 34e41c0: 910083e0     	add	x0, sp, #0x20
 34e41c4: 910023e1     	add	x1, sp, #0x8
 34e41c8: d2800002     	mov	x2, #0x0                ; =0
 34e41cc: 975be66d     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e41d0: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e41d4: 91161421     	add	x1, x1, #0x585
 34e41d8: 910083e3     	add	x3, sp, #0x20
 34e41dc: aa1303e0     	mov	x0, x19
 34e41e0: 52800202     	mov	w2, #0x10               ; =16
 34e41e4: 52800004     	mov	w4, #0x0                ; =0
 34e41e8: 52800005     	mov	w5, #0x0                ; =0
 34e41ec: 975be699     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e41f0: 910083e0     	add	x0, sp, #0x20
 34e41f4: 9784e978     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e41f8: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e41fc: 36f800a8     	tbz	w8, #0x1f, 0x34e4210 <_ChromeMain+0x34def74>
 34e4200: f94007e0     	ldr	x0, [sp, #0x8]
 34e4204: f9400fe8     	ldr	x8, [sp, #0x18]
 34e4208: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e420c: 972c932b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4210: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e4214: f9000fff     	str	xzr, [sp, #0x18]
 34e4218: 910083e0     	add	x0, sp, #0x20
 34e421c: 910023e1     	add	x1, sp, #0x8
 34e4220: d2800002     	mov	x2, #0x0                ; =0
 34e4224: 975be657     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4228: 9004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e422c: 9103c821     	add	x1, x1, #0xf2
 34e4230: 910083e3     	add	x3, sp, #0x20
 34e4234: aa1303e0     	mov	x0, x19
 34e4238: 52800442     	mov	w2, #0x22               ; =34
 34e423c: 52800004     	mov	w4, #0x0                ; =0
 34e4240: 52800005     	mov	w5, #0x0                ; =0
 34e4244: 975be683     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4248: 910083e0     	add	x0, sp, #0x20
 34e424c: 9784e962     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4250: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e4254: 36f800a8     	tbz	w8, #0x1f, 0x34e4268 <_ChromeMain+0x34defcc>
 34e4258: f94007e0     	ldr	x0, [sp, #0x8]
 34e425c: f9400fe8     	ldr	x8, [sp, #0x18]
 34e4260: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e4264: 972c9315     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e4268: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 34e426c: f9000fff     	str	xzr, [sp, #0x18]
 34e4270: 910083e0     	add	x0, sp, #0x20
 34e4274: 910023e1     	add	x1, sp, #0x8
 34e4278: d2800002     	mov	x2, #0x0                ; =0
 34e427c: 975be641     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 34e4280: 9004cfc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 34e4284: 91050c21     	add	x1, x1, #0x143
 34e4288: 910083e3     	add	x3, sp, #0x20
 34e428c: aa1303e0     	mov	x0, x19
 34e4290: 52800502     	mov	w2, #0x28               ; =40
 34e4294: 52800004     	mov	w4, #0x0                ; =0
 34e4298: 52800005     	mov	w5, #0x0                ; =0
 34e429c: 975be66d     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e42a0: 910083e0     	add	x0, sp, #0x20
 34e42a4: 9784e94c     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e42a8: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 34e42ac: 36f800a8     	tbz	w8, #0x1f, 0x34e42c0 <_ChromeMain+0x34df024>
 34e42b0: f94007e0     	ldr	x0, [sp, #0x8]
 34e42b4: f9400fe8     	ldr	x8, [sp, #0x18]
 34e42b8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 34e42bc: 972c92ff     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 34e42c0: 390083f4     	strb	w20, [sp, #0x20]
 34e42c4: 3900e3f4     	strb	w20, [sp, #0x38]
 34e42c8: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e42cc: 91165821     	add	x1, x1, #0x596
 34e42d0: 910083e3     	add	x3, sp, #0x20
 34e42d4: aa1303e0     	mov	x0, x19
 34e42d8: 52800502     	mov	w2, #0x28               ; =40
 34e42dc: 52800004     	mov	w4, #0x0                ; =0
 34e42e0: 52800005     	mov	w5, #0x0                ; =0
 34e42e4: 975be65b     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e42e8: 910083e0     	add	x0, sp, #0x20
 34e42ec: 9784e93a     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e42f0: 390083f4     	strb	w20, [sp, #0x20]
 34e42f4: 3900e3f4     	strb	w20, [sp, #0x38]
 34e42f8: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e42fc: 9116fc21     	add	x1, x1, #0x5bf
 34e4300: 910083e3     	add	x3, sp, #0x20
 34e4304: aa1303e0     	mov	x0, x19
 34e4308: 528005a2     	mov	w2, #0x2d               ; =45
 34e430c: 52800004     	mov	w4, #0x0                ; =0
 34e4310: 52800005     	mov	w5, #0x0                ; =0
 34e4314: 975be64f     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4318: 910083e0     	add	x0, sp, #0x20
 34e431c: 9784e92e     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4320: 390083f4     	strb	w20, [sp, #0x20]
 34e4324: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4328: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e432c: 9117b421     	add	x1, x1, #0x5ed
 34e4330: 910083e3     	add	x3, sp, #0x20
 34e4334: aa1303e0     	mov	x0, x19
 34e4338: 528005c2     	mov	w2, #0x2e               ; =46
 34e433c: 52800004     	mov	w4, #0x0                ; =0
 34e4340: 52800005     	mov	w5, #0x0                ; =0
 34e4344: 975be643     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4348: 910083e0     	add	x0, sp, #0x20
 34e434c: 9784e922     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4350: 390083f4     	strb	w20, [sp, #0x20]
 34e4354: 3900e3f4     	strb	w20, [sp, #0x38]
 34e4358: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e435c: 91187021     	add	x1, x1, #0x61c
 34e4360: 910083e3     	add	x3, sp, #0x20
 34e4364: aa1303e0     	mov	x0, x19
 34e4368: 52800542     	mov	w2, #0x2a               ; =42
 34e436c: 52800004     	mov	w4, #0x0                ; =0
 34e4370: 52800005     	mov	w5, #0x0                ; =0
 34e4374: 975be637     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e4378: 910083e0     	add	x0, sp, #0x20
 34e437c: 9784e916     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e4380: 910083e0     	add	x0, sp, #0x20
 34e4384: 528000e1     	mov	w1, #0x7                ; =7
 34e4388: 9743ac8a     	bl	0x5cf5b0 <_ChromeMain+0x5ca314>
 34e438c: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e4390: 91191c21     	add	x1, x1, #0x647
 34e4394: 910083e3     	add	x3, sp, #0x20
 34e4398: aa1303e0     	mov	x0, x19
 34e439c: 52800602     	mov	w2, #0x30               ; =48
 34e43a0: 52800004     	mov	w4, #0x0                ; =0
 34e43a4: 52800005     	mov	w5, #0x0                ; =0
 34e43a8: 975be62a     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e43ac: 910083e0     	add	x0, sp, #0x20
 34e43b0: 9784e909     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e43b4: 390083ff     	strb	wzr, [sp, #0x20]
 34e43b8: 3900e3f4     	strb	w20, [sp, #0x38]
 34e43bc: d004d021     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 34e43c0: 9119e021     	add	x1, x1, #0x678
 34e43c4: 910083e3     	add	x3, sp, #0x20
 34e43c8: aa1303e0     	mov	x0, x19
 34e43cc: 528002c2     	mov	w2, #0x16               ; =22
 34e43d0: 52800004     	mov	w4, #0x0                ; =0
 34e43d4: 52800005     	mov	w5, #0x0                ; =0
 34e43d8: 975be61e     	bl	0xbddc50 <_ChromeMain+0xbd89b4>
 34e43dc: 910083e0     	add	x0, sp, #0x20
 34e43e0: 9784e8fd     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 34e43e4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 34e43e8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 34e43ec: 910183ff     	add	sp, sp, #0x60
 34e43f0: d65f03c0     	ret
