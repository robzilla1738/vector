
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4633e10: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4633e14: a90167fa     	stp	x26, x25, [sp, #0x10]
 4633e18: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4633e1c: a90357f6     	stp	x22, x21, [sp, #0x30]
 4633e20: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4633e24: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4633e28: 910143fd     	add	x29, sp, #0x50
 4633e2c: aa0003f3     	mov	x19, x0
 4633e30: 91182000     	add	x0, x0, #0x608
 4633e34: 96f9b000     	bl	0x49fe34 <_ChromeMain+0x49ab98>
 4633e38: f9431a60     	ldr	x0, [x19, #0x630]
 4633e3c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4633e40: f0052bf5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4633e44: f94046a9     	ldr	x9, [x21, #0x88]
 4633e48: eb09011f     	cmp	x8, x9
 4633e4c: 54000041     	b.ne	0x4633e54 <_ChromeMain+0x462ebb8>
 4633e50: 96e7cafd     	bl	0x26a44 <_ChromeMain+0x217a8>
 4633e54: f9031a7f     	str	xzr, [x19, #0x630]
 4633e58: f9422e68     	ldr	x8, [x19, #0x458]
 4633e5c: b4000fc8     	cbz	x8, 0x4634054 <_ChromeMain+0x462edb8>
 4633e60: f9429d08     	ldr	x8, [x8, #0x538]
 4633e64: f9403500     	ldr	x0, [x8, #0x68]
 4633e68: b4000f60     	cbz	x0, 0x4634054 <_ChromeMain+0x462edb8>
 4633e6c: f9400008     	ldr	x8, [x0]
 4633e70: f940a508     	ldr	x8, [x8, #0x148]
 4633e74: d63f0100     	blr	x8
 4633e78: f9400008     	ldr	x8, [x0]
 4633e7c: f940b508     	ldr	x8, [x8, #0x168]
 4633e80: d63f0100     	blr	x8
 4633e84: b4000e80     	cbz	x0, 0x4634054 <_ChromeMain+0x462edb8>
 4633e88: aa0003f4     	mov	x20, x0
 4633e8c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4633e90: f94046a9     	ldr	x9, [x21, #0x88]
 4633e94: eb09011f     	cmp	x8, x9
 4633e98: 54000061     	b.ne	0x4633ea4 <_ChromeMain+0x462ec08>
 4633e9c: aa1403e0     	mov	x0, x20
 4633ea0: 96e78117     	bl	0x142fc <_ChromeMain+0xf060>
 4633ea4: f9431a60     	ldr	x0, [x19, #0x630]
 4633ea8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4633eac: f94046a9     	ldr	x9, [x21, #0x88]
 4633eb0: eb09011f     	cmp	x8, x9
 4633eb4: 54000de0     	b.eq	0x4634070 <_ChromeMain+0x462edd4>
 4633eb8: f9031a74     	str	x20, [x19, #0x630]
 4633ebc: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4633ec0: f94046a9     	ldr	x9, [x21, #0x88]
 4633ec4: eb09011f     	cmp	x8, x9
 4633ec8: 54000061     	b.ne	0x4633ed4 <_ChromeMain+0x462ec38>
 4633ecc: aa1303e0     	mov	x0, x19
 4633ed0: 96e7810b     	bl	0x142fc <_ChromeMain+0xf060>
 4633ed4: 52800700     	mov	w0, #0x38               ; =56
 4633ed8: 96e76d24     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633edc: 5280003b     	mov	w27, #0x1               ; =1
 4633ee0: b900001b     	str	w27, [x0]
 4633ee4: d0ffc839     	adrp	x25, 0x3f39000 <_ChromeMain+0x3f33d64>
 4633ee8: 913a0339     	add	x25, x25, #0xe80
 4633eec: d0ff933a     	adrp	x26, 0x3899000 <_ChromeMain+0x3893d64>
 4633ef0: 912d035a     	add	x26, x26, #0xb40
 4633ef4: a900e819     	stp	x25, x26, [x0, #0x8]
 4633ef8: d0fef956     	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 4633efc: 912c02d6     	add	x22, x22, #0xb00
 4633f00: 1012ddc8     	adr	x8, 0x4659ab8 <_ChromeMain+0x465481c>
 4633f04: d503201f     	nop
 4633f08: a901a016     	stp	x22, x8, [x0, #0x18]
 4633f0c: b0fef697     	adrp	x23, 0x2504000 <_ChromeMain+0x24fed64>
 4633f10: 911172f7     	add	x23, x23, #0x45c
 4633f14: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4633f18: b0ff9338     	adrp	x24, 0x3898000 <_ChromeMain+0x3892d64>
 4633f1c: 91070318     	add	x24, x24, #0x1c0
 4633f20: b4000ac0     	cbz	x0, 0x4634078 <_ChromeMain+0x462eddc>
 4633f24: aa0003f4     	mov	x20, x0
 4633f28: 52800600     	mov	w0, #0x30               ; =48
 4633f2c: 96e76d0f     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633f30: aa0003e3     	mov	x3, x0
 4633f34: b900001b     	str	w27, [x0]
 4633f38: a900e017     	stp	x23, x24, [x0, #0x8]
 4633f3c: f9000c16     	str	x22, [x0, #0x18]
 4633f40: f9001414     	str	x20, [x0, #0x28]
 4633f44: f00445a1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4633f48: 9116fc21     	add	x1, x1, #0x5bf
 4633f4c: 91182260     	add	x0, x19, #0x608
 4633f50: 528005a2     	mov	w2, #0x2d               ; =45
 4633f54: 972adb37     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 4633f58: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4633f5c: f94046a9     	ldr	x9, [x21, #0x88]
 4633f60: eb09011f     	cmp	x8, x9
 4633f64: 54000061     	b.ne	0x4633f70 <_ChromeMain+0x462ecd4>
 4633f68: aa1303e0     	mov	x0, x19
 4633f6c: 96e780e4     	bl	0x142fc <_ChromeMain+0xf060>
 4633f70: 52800700     	mov	w0, #0x38               ; =56
 4633f74: 96e76cfd     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633f78: b900001b     	str	w27, [x0]
 4633f7c: a900e819     	stp	x25, x26, [x0, #0x8]
 4633f80: 1012e428     	adr	x8, 0x4659c04 <_ChromeMain+0x4654968>
 4633f84: d503201f     	nop
 4633f88: a901a016     	stp	x22, x8, [x0, #0x18]
 4633f8c: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4633f90: b4000780     	cbz	x0, 0x4634080 <_ChromeMain+0x462ede4>
 4633f94: aa0003f4     	mov	x20, x0
 4633f98: 52800600     	mov	w0, #0x30               ; =48
 4633f9c: 96e76cf3     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633fa0: aa0003e3     	mov	x3, x0
 4633fa4: b900001b     	str	w27, [x0]
 4633fa8: a900e017     	stp	x23, x24, [x0, #0x8]
 4633fac: f9000c16     	str	x22, [x0, #0x18]
 4633fb0: f9001414     	str	x20, [x0, #0x28]
 4633fb4: f00445a1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 4633fb8: 9117b421     	add	x1, x1, #0x5ed
 4633fbc: 91182260     	add	x0, x19, #0x608
 4633fc0: 528005c2     	mov	w2, #0x2e               ; =46
 4633fc4: 972adb1b     	bl	0x10eac30 <_ChromeMain+0x10e5994>
 4633fc8: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4633fcc: f94046a9     	ldr	x9, [x21, #0x88]
 4633fd0: eb09011f     	cmp	x8, x9
 4633fd4: 54000061     	b.ne	0x4633fe0 <_ChromeMain+0x462ed44>
 4633fd8: aa1303e0     	mov	x0, x19
 4633fdc: 96e780c8     	bl	0x142fc <_ChromeMain+0xf060>
 4633fe0: 52800700     	mov	w0, #0x38               ; =56
 4633fe4: 96e76ce1     	bl	0xf368 <_ChromeMain+0xa0cc>
 4633fe8: 52800035     	mov	w21, #0x1               ; =1
 4633fec: b9000015     	str	w21, [x0]
 4633ff0: a900e819     	stp	x25, x26, [x0, #0x8]
 4633ff4: 1012e888     	adr	x8, 0x4659d04 <_ChromeMain+0x4654a68>
 4633ff8: d503201f     	nop
 4633ffc: a901a016     	stp	x22, x8, [x0, #0x18]
 4634000: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4634004: b4000420     	cbz	x0, 0x4634088 <_ChromeMain+0x462edec>
 4634008: aa0003f4     	mov	x20, x0
 463400c: 52800600     	mov	w0, #0x30               ; =48
 4634010: 96e76cd6     	bl	0xf368 <_ChromeMain+0xa0cc>
 4634014: aa0003e3     	mov	x3, x0
 4634018: b9000015     	str	w21, [x0]
 463401c: a900e017     	stp	x23, x24, [x0, #0x8]
 4634020: f9000c16     	str	x22, [x0, #0x18]
 4634024: f9001414     	str	x20, [x0, #0x28]
 4634028: d00445a1     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 463402c: 91187021     	add	x1, x1, #0x61c
 4634030: 91182260     	add	x0, x19, #0x608
 4634034: 52800542     	mov	w2, #0x2a               ; =42
 4634038: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463403c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4634040: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4634044: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4634048: a94167fa     	ldp	x26, x25, [sp, #0x10]
 463404c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4634050: 172adaf8     	b	0x10eac30 <_ChromeMain+0x10e5994>
 4634054: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4634058: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463405c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4634060: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4634064: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4634068: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 463406c: d65f03c0     	ret
 4634070: 96e7ca75     	bl	0x26a44 <_ChromeMain+0x217a8>
 4634074: 17ffff91     	b	0x4633eb8 <_ChromeMain+0x462ec1c>
 4634078: d2800003     	mov	x3, #0x0                ; =0
 463407c: 17ffffb2     	b	0x4633f44 <_ChromeMain+0x462eca8>
 4634080: d2800003     	mov	x3, #0x0                ; =0
 4634084: 17ffffcc     	b	0x4633fb4 <_ChromeMain+0x462ed18>
 4634088: d2800003     	mov	x3, #0x0                ; =0
 463408c: 17ffffe7     	b	0x4634028 <_ChromeMain+0x462ed8c>
 4634090: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4634094: a90167fa     	stp	x26, x25, [sp, #0x10]
 4634098: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463409c: a90357f6     	stp	x22, x21, [sp, #0x30]
 46340a0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46340a4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46340a8: 910143fd     	add	x29, sp, #0x50
 46340ac: d10983ff     	sub	sp, sp, #0x260
 46340b0: 9004cfa8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 46340b4: f940f908     	ldr	x8, [x8, #0x1f0]
 46340b8: f9400108     	ldr	x8, [x8]
 46340bc: f81983a8     	stur	x8, [x29, #-0x68]
 46340c0: f9436c08     	ldr	x8, [x0, #0x6d8]
 46340c4: b5000148     	cbnz	x8, 0x46340ec <_ChromeMain+0x462ee50>
 46340c8: aa0003f3     	mov	x19, x0
 46340cc: f9400008     	ldr	x8, [x0]
 46340d0: f9403108     	ldr	x8, [x8, #0x60]
 46340d4: 90fe01c9     	adrp	x9, 0x66c000 <_ChromeMain+0x666d64>
 46340d8: 91394129     	add	x9, x9, #0xe50
 46340dc: eb09011f     	cmp	x8, x9
 46340e0: 540002a1     	b.ne	0x4634134 <_ChromeMain+0x462ee98>
 46340e4: f940c275     	ldr	x21, [x19, #0x180]
 46340e8: b5000375     	cbnz	x21, 0x4634154 <_ChromeMain+0x462eeb8>
 46340ec: f85983a8     	ldur	x8, [x29, #-0x68]
 46340f0: 9004cfa9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 46340f4: f940f929     	ldr	x9, [x9, #0x1f0]
 46340f8: f9400129     	ldr	x9, [x9]
 46340fc: eb08013f     	cmp	x9, x8
 4634100: 54003701     	b.ne	0x46347e0 <_ChromeMain+0x462f544>
 4634104: 910983ff     	add	sp, sp, #0x260
 4634108: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463410c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4634110: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4634114: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4634118: a94167fa     	ldp	x26, x25, [sp, #0x10]
 463411c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4634120: d65f03c0     	ret
 4634124: 972c61a8     	bl	0x114c7c4 <_ChromeMain+0x1147528>
 4634128: 52800a01     	mov	w1, #0x50               ; =80
 463412c: 96e75363     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4634130: 14000088     	b	0x4634350 <_ChromeMain+0x462f0b4>
 4634134: 90fdffe9     	adrp	x9, 0x630000 <_ChromeMain+0x62ad64>
 4634138: 9120c129     	add	x9, x9, #0x830
 463413c: eb09011f     	cmp	x8, x9
 4634140: 54fffd20     	b.eq	0x46340e4 <_ChromeMain+0x462ee48>
 4634144: aa1303e0     	mov	x0, x19
 4634148: d63f0100     	blr	x8
 463414c: aa0003f5     	mov	x21, x0
 4634150: b4fffcf5     	cbz	x21, 0x46340ec <_ChromeMain+0x462ee50>
 4634154: d00546b9     	adrp	x25, 0xef0a000 <dyld_stub_binder+0xef0a000>
 4634158: 91120339     	add	x25, x25, #0x480
 463415c: f8bfc320     	ldapr	x0, [x25]
 4634160: b4003580     	cbz	x0, 0x4634810 <_ChromeMain+0x462f574>
 4634164: 52806301     	mov	w1, #0x318              ; =792
 4634168: d2800002     	mov	x2, #0x0                ; =0
 463416c: 96e9dd11     	bl	0xab5b0 <_ChromeMain+0xa6314>
 4634170: aa0003f4     	mov	x20, x0
 4634174: 9734ebf3     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4634178: 900507c8     	adrp	x8, 0xe72c000 <dyld_stub_binder+0xe72c000>
 463417c: 911dc108     	add	x8, x8, #0x770
 4634180: 910fa109     	add	x9, x8, #0x3e8
 4634184: a9002408     	stp	x8, x9, [x0]
 4634188: 91104109     	add	x9, x8, #0x410
 463418c: f9000809     	str	x9, [x0, #0x10]
 4634190: 91112109     	add	x9, x8, #0x448
 4634194: 9111e10a     	add	x10, x8, #0x478
 4634198: a906a809     	stp	x9, x10, [x0, #0x68]
 463419c: 91132109     	add	x9, x8, #0x4c8
 46341a0: f9005809     	str	x9, [x0, #0xb0]
 46341a4: 9114a109     	add	x9, x8, #0x528
 46341a8: f9006c09     	str	x9, [x0, #0xd8]
 46341ac: 91156108     	add	x8, x8, #0x558
 46341b0: aa0003f6     	mov	x22, x0
 46341b4: f80f8ec8     	str	x8, [x22, #0xf8]!
 46341b8: f901881f     	str	xzr, [x0, #0x310]
 46341bc: f8bfc320     	ldapr	x0, [x25]
 46341c0: b40032c0     	cbz	x0, 0x4634818 <_ChromeMain+0x462f57c>
 46341c4: 52808c01     	mov	w1, #0x460              ; =1120
 46341c8: d2800002     	mov	x2, #0x0                ; =0
 46341cc: 96e9dcf9     	bl	0xab5b0 <_ChromeMain+0xa6314>
 46341d0: aa0003f7     	mov	x23, x0
 46341d4: d2800001     	mov	x1, #0x0                ; =0
 46341d8: d2800002     	mov	x2, #0x0                ; =0
 46341dc: 528000a3     	mov	w3, #0x5                ; =5
 46341e0: 52820004     	mov	w4, #0x1000             ; =4096
 46341e4: 52800005     	mov	w5, #0x0                ; =0
 46341e8: 975559be     	bl	0x1b8a8e0 <_ChromeMain+0x1b85644>
 46341ec: 3945a408     	ldrb	w8, [x0, #0x169]
 46341f0: 35002f28     	cbnz	w8, 0x46347d4 <_ChromeMain+0x462f538>
 46341f4: f940ce82     	ldr	x2, [x20, #0x198]
 46341f8: aa1403e0     	mov	x0, x20
 46341fc: aa1703e1     	mov	x1, x23
 4634200: 9705147f     	bl	0x7793fc <_ChromeMain+0x774160>
 4634204: 925e76e8     	and	x8, x23, #0xfffffffc00000000
 4634208: d0052bfa     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463420c: f9404749     	ldr	x9, [x26, #0x88]
 4634210: eb09011f     	cmp	x8, x9
 4634214: 54000061     	b.ne	0x4634220 <_ChromeMain+0x462ef84>
 4634218: aa1703e0     	mov	x0, x23
 463421c: 96e78038     	bl	0x142fc <_ChromeMain+0xf060>
 4634220: f9418a80     	ldr	x0, [x20, #0x310]
 4634224: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4634228: f9404749     	ldr	x9, [x26, #0x88]
 463422c: eb09011f     	cmp	x8, x9
 4634230: 54000041     	b.ne	0x4634238 <_ChromeMain+0x462ef9c>
 4634234: 96e7ba02     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4634238: f9018a97     	str	x23, [x20, #0x310]
 463423c: 52802028     	mov	w8, #0x101              ; =257
 4634240: b81783a8     	stur	w8, [x29, #-0x88]
 4634244: 3817c3bf     	sturb	wzr, [x29, #-0x84]
 4634248: f94002e8     	ldr	x8, [x23]
 463424c: f941f508     	ldr	x8, [x8, #0x3e8]
 4634250: d10223a1     	sub	x1, x29, #0x88
 4634254: aa1703e0     	mov	x0, x23
 4634258: d63f0100     	blr	x8
 463425c: f9418a80     	ldr	x0, [x20, #0x310]
 4634260: 52800001     	mov	w1, #0x0                ; =0
 4634264: 975556a7     	bl	0x1b89d00 <_ChromeMain+0x1b84a64>
 4634268: f9418a80     	ldr	x0, [x20, #0x310]
 463426c: 52800021     	mov	w1, #0x1                ; =1
 4634270: 95814e34     	bl	0xa687b40 <_ChromeMain+0xa6828a4>
 4634274: f9418a80     	ldr	x0, [x20, #0x310]
 4634278: 52800021     	mov	w1, #0x1                ; =1
 463427c: 95814e62     	bl	0xa687c04 <_ChromeMain+0xa682968>
 4634280: f9418a80     	ldr	x0, [x20, #0x310]
 4634284: 52800001     	mov	w1, #0x0                ; =0
 4634288: 96fdb2ae     	bl	0x5a0d40 <_ChromeMain+0x59baa4>
 463428c: f9418a80     	ldr	x0, [x20, #0x310]
 4634290: 528021c1     	mov	w1, #0x10e              ; =270
 4634294: 95814f2b     	bl	0xa687f40 <_ChromeMain+0xa682ca4>
 4634298: f9418a97     	ldr	x23, [x20, #0x310]
 463429c: 528000a8     	mov	w8, #0x5                ; =5
 46342a0: 381973a8     	sturb	w8, [x29, #-0x69]
 46342a4: d10203a9     	sub	x9, x29, #0x80
 46342a8: aa080128     	orr	x8, x9, x8
 46342ac: f004a40a     	adrp	x10, 0xdab7000 <dyld_stub_binder+0xdab7000>
 46342b0: 9131494a     	add	x10, x10, #0xc52
 46342b4: eb0a011f     	cmp	x8, x10
 46342b8: fa4a8122     	ccmp	x9, x10, #0x2, hi
 46342bc: 54002909     	b.ls	0x46347dc <_ChromeMain+0x462f540>
 46342c0: 528ca8e8     	mov	w8, #0x6547             ; =25927
 46342c4: 72ae6d28     	movk	w8, #0x7369, lsl #16
 46342c8: b81803a8     	stur	w8, [x29, #-0x80]
 46342cc: 52800e88     	mov	w8, #0x74               ; =116
 46342d0: 781843a8     	sturh	w8, [x29, #-0x7c]
 46342d4: 52800300     	mov	w0, #0x18               ; =24
 46342d8: 96e76c24     	bl	0xf368 <_ChromeMain+0xa0cc>
 46342dc: 52800028     	mov	w8, #0x1                ; =1
 46342e0: f9008be0     	str	x0, [sp, #0x110]
 46342e4: f90093e8     	str	x8, [sp, #0x120]
 46342e8: b40027a0     	cbz	x0, 0x46347dc <_ChromeMain+0x462f540>
 46342ec: 910443f8     	add	x24, sp, #0x110
 46342f0: 3dc04b00     	ldr	q0, [x24, #0x120]
 46342f4: 3d800000     	str	q0, [x0]
 46342f8: f85903a8     	ldur	x8, [x29, #-0x70]
 46342fc: f9000808     	str	x8, [x0, #0x10]
 4634300: 52800028     	mov	w8, #0x1                ; =1
 4634304: f9008fe8     	str	x8, [sp, #0x118]
 4634308: d10243a0     	sub	x0, x29, #0x90
 463430c: 910443e1     	add	x1, sp, #0x110
 4634310: 52800002     	mov	w2, #0x0                ; =0
 4634314: 52800183     	mov	w3, #0xc                ; =12
 4634318: 52803204     	mov	w4, #0x190              ; =400
 463431c: 9526421a     	bl	0x8fc4b84 <_ChromeMain+0x8fbf8e8>
 4634320: f94002e8     	ldr	x8, [x23]
 4634324: f941ed08     	ldr	x8, [x8, #0x3d8]
 4634328: d10243a1     	sub	x1, x29, #0x90
 463432c: aa1703e0     	mov	x0, x23
 4634330: d63f0100     	blr	x8
 4634334: f85703a0     	ldur	x0, [x29, #-0x90]
 4634338: b40000c0     	cbz	x0, 0x4634350 <_ChromeMain+0x462f0b4>
 463433c: b9400009     	ldr	w9, [x0]
 4634340: 51000528     	sub	w8, w9, #0x1
 4634344: b9000008     	str	w8, [x0]
 4634348: 34002709     	cbz	w9, 0x4634828 <_ChromeMain+0x462f58c>
 463434c: 34ffeec8     	cbz	w8, 0x4634124 <_ChromeMain+0x462ee88>
