
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4267ec0: d102c3ff     	sub	sp, sp, #0xb0
 4267ec4: 6d032beb     	stp	d11, d10, [sp, #0x30]
 4267ec8: 6d0423e9     	stp	d9, d8, [sp, #0x40]
 4267ecc: a9056ffc     	stp	x28, x27, [sp, #0x50]
 4267ed0: a90667fa     	stp	x26, x25, [sp, #0x60]
 4267ed4: a9075ff8     	stp	x24, x23, [sp, #0x70]
 4267ed8: a90857f6     	stp	x22, x21, [sp, #0x80]
 4267edc: a9094ff4     	stp	x20, x19, [sp, #0x90]
 4267ee0: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 4267ee4: 910283fd     	add	x29, sp, #0xa0
 4267ee8: aa0403f5     	mov	x21, x4
 4267eec: b4001740     	cbz	x0, 0x42681d4 <_ChromeMain+0x4262f38>
 4267ef0: aa0303f4     	mov	x20, x3
 4267ef4: aa0203f6     	mov	x22, x2
 4267ef8: aa0103f7     	mov	x23, x1
 4267efc: f9407400     	ldr	x0, [x0, #0xe8]
 4267f00: f9400008     	ldr	x8, [x0]
 4267f04: f9400909     	ldr	x9, [x8, #0x10]
 4267f08: 9100a3e8     	add	x8, sp, #0x28
 4267f0c: d63f0120     	blr	x9
 4267f10: f94017e0     	ldr	x0, [sp, #0x28]
 4267f14: 9510107e     	bl	0x866c10c <_ChromeMain+0x8666e70>
 4267f18: aa0003f3     	mov	x19, x0
 4267f1c: f94017f8     	ldr	x24, [sp, #0x28]
 4267f20: f90017ff     	str	xzr, [sp, #0x28]
 4267f24: b40000d8     	cbz	x24, 0x4267f3c <_ChromeMain+0x4262ca0>
 4267f28: aa1803e0     	mov	x0, x24
 4267f2c: 9510107b     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 4267f30: aa1803e0     	mov	x0, x24
 4267f34: 52800101     	mov	w1, #0x8                ; =8
 4267f38: 96f683e0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4267f3c: b4001493     	cbz	x19, 0x42681cc <_ChromeMain+0x4262f30>
 4267f40: aa1303e0     	mov	x0, x19
 4267f44: 955e2451     	bl	0x99f1088 <_ChromeMain+0x99ebdec>
 4267f48: 94f66dfc     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4267f4c: aa0003f8     	mov	x24, x0
 4267f50: 94f66e03     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4267f54: b40013d8     	cbz	x24, 0x42681cc <_ChromeMain+0x4262f30>
 4267f58: aa1303e0     	mov	x0, x19
 4267f5c: 955e244b     	bl	0x99f1088 <_ChromeMain+0x99ebdec>
 4267f60: 94f66df6     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4267f64: aa0003f9     	mov	x25, x0
 4267f68: d0054a28     	adrp	x8, 0xebad000 <dyld_stub_binder+0xebad000>
 4267f6c: f944fd01     	ldr	x1, [x8, #0x9f8]
 4267f70: 95f7d17c     	bl	0xc05c560 <_ChromeMain+0xc0572c4>
 4267f74: 94f66df1     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4267f78: aa0003f8     	mov	x24, x0
 4267f7c: aa1903e0     	mov	x0, x25
 4267f80: 94f66df7     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4267f84: b4000078     	cbz	x24, 0x4267f90 <_ChromeMain+0x4262cf4>
 4267f88: aa1803e0     	mov	x0, x24
 4267f8c: 95a7144d     	bl	0xac2d0c0 <_ChromeMain+0xac27e24>
 4267f90: aa1803e0     	mov	x0, x24
 4267f94: 94f66df2     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4267f98: b94002e8     	ldr	w8, [x23]
 4267f9c: b9000fe8     	str	w8, [sp, #0xc]
 4267fa0: aa1303e0     	mov	x0, x19
 4267fa4: 95b0901a     	bl	0xae8c00c <_ChromeMain+0xae86d70>
 4267fa8: 4ea31c68     	mov.16b	v8, v3
 4267fac: 294126e8     	ldp	w8, w9, [x23, #0x8]
 4267fb0: 2900a3e9     	stp	w9, w8, [sp, #0x4]
 4267fb4: b94006fb     	ldr	w27, [x23, #0x4]
 4267fb8: d0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4267fbc: f946d900     	ldr	x0, [x8, #0xdb0]
 4267fc0: 952be2de     	bl	0x8d60b38 <_ChromeMain+0x8d5b89c>
 4267fc4: aa0003f8     	mov	x24, x0
 4267fc8: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 4267fcc: f90013ff     	str	xzr, [sp, #0x20]
 4267fd0: f940069c     	ldr	x28, [x20, #0x8]
 4267fd4: b40004dc     	cbz	x28, 0x426806c <_ChromeMain+0x4262dd0>
 4267fd8: b200e7e8     	mov	x8, #0x3333333333333333 ; =3689348814741910323
 4267fdc: f2e06668     	movk	x8, #0x333, lsl #48
 4267fe0: eb08039f     	cmp	x28, x8
 4267fe4: 54001928     	b.hi	0x4268308 <_ChromeMain+0x426306c>
 4267fe8: f9400299     	ldr	x25, [x20]
 4267fec: 8b1c0b88     	add	x8, x28, x28, lsl #2
 4267ff0: d37ced1a     	lsl	x26, x8, #4
 4267ff4: aa1a03e0     	mov	x0, x26
 4267ff8: 96f69cdc     	bl	0xf368 <_ChromeMain+0xa0cc>
 4267ffc: aa0003f7     	mov	x23, x0
 4268000: f9000be0     	str	x0, [sp, #0x10]
 4268004: f90013fc     	str	x28, [sp, #0x20]
 4268008: b400013a     	cbz	x26, 0x426802c <_ChromeMain+0x4262d90>
 426800c: aa1703e0     	mov	x0, x23
 4268010: b40011c0     	cbz	x0, 0x4268248 <_ChromeMain+0x4262fac>
 4268014: aa1903e1     	mov	x1, x25
 4268018: 97ff97ac     	bl	0x424dec8 <_ChromeMain+0x4248c2c>
 426801c: 91014339     	add	x25, x25, #0x50
 4268020: 91014000     	add	x0, x0, #0x50
 4268024: f101435a     	subs	x26, x26, #0x50
 4268028: 54ffff41     	b.ne	0x4268010 <_ChromeMain+0x4262d74>
 426802c: cb170008     	sub	x8, x0, x23
 4268030: 9344fd08     	asr	x8, x8, #4
 4268034: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4268038: f29999a9     	movk	x9, #0xcccd
 426803c: 9b097d08     	mul	x8, x8, x9
 4268040: f9000fe8     	str	x8, [sp, #0x18]
 4268044: b4000198     	cbz	x24, 0x4268074 <_ChromeMain+0x4262dd8>
 4268048: 910043e3     	add	x3, sp, #0x10
 426804c: aa1803e0     	mov	x0, x24
 4268050: aa1603e2     	mov	x2, x22
 4268054: aa1503e4     	mov	x4, x21
 4268058: 95fff3bd     	bl	0xc264f4c <_ChromeMain+0xc25fcb0>
 426805c: aa0003f5     	mov	x21, x0
 4268060: f9400bf7     	ldr	x23, [sp, #0x10]
 4268064: b50000d7     	cbnz	x23, 0x426807c <_ChromeMain+0x4262de0>
 4268068: 1400001e     	b	0x42680e0 <_ChromeMain+0x4262e44>
 426806c: d2800017     	mov	x23, #0x0               ; =0
 4268070: b5fffed8     	cbnz	x24, 0x4268048 <_ChromeMain+0x4262dac>
 4268074: b5000d75     	cbnz	x21, 0x4268220 <_ChromeMain+0x4262f84>
 4268078: b4000357     	cbz	x23, 0x42680e0 <_ChromeMain+0x4262e44>
 426807c: f9400fe8     	ldr	x8, [sp, #0x18]
 4268080: 8b080909     	add	x9, x8, x8, lsl #2
 4268084: d37ced29     	lsl	x9, x9, #4
 4268088: aa1703e0     	mov	x0, x23
 426808c: b4000169     	cbz	x9, 0x42680b8 <_ChromeMain+0x4262e1c>
 4268090: 8b170129     	add	x9, x9, x23
 4268094: d1014120     	sub	x0, x9, #0x50
 4268098: 928009e9     	mov	x9, #-0x50              ; =-80
 426809c: 9b097d16     	mul	x22, x8, x9
 42680a0: b4000d40     	cbz	x0, 0x4268248 <_ChromeMain+0x4262fac>
 42680a4: 97ff97ec     	bl	0x424e054 <_ChromeMain+0x4248db8>
 42680a8: d1014000     	sub	x0, x0, #0x50
 42680ac: b10142d6     	adds	x22, x22, #0x50
 42680b0: 54ffff81     	b.ne	0x42680a0 <_ChromeMain+0x4262e04>
 42680b4: f9400be0     	ldr	x0, [sp, #0x10]
 42680b8: cb0002e8     	sub	x8, x23, x0
 42680bc: 9344fd08     	asr	x8, x8, #4
 42680c0: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 42680c4: f29999a9     	movk	x9, #0xcccd
 42680c8: 9b097d08     	mul	x8, x8, x9
 42680cc: f9000fe8     	str	x8, [sp, #0x18]
 42680d0: f94013e8     	ldr	x8, [sp, #0x20]
 42680d4: 8b080908     	add	x8, x8, x8, lsl #2
 42680d8: d37ced01     	lsl	x1, x8, #4
 42680dc: 96f68377     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42680e0: b9400fe8     	ldr	w8, [sp, #0xc]
 42680e4: 1e620109     	scvtf	d9, w8
 42680e8: 1e620360     	scvtf	d0, w27
 42680ec: 2940a3e9     	ldp	w9, w8, [sp, #0x4]
 42680f0: 1e62012a     	scvtf	d10, w9
 42680f4: 1e603900     	fsub	d0, d8, d0
 42680f8: 1e6a3808     	fsub	d8, d0, d10
 42680fc: 1e62010b     	scvtf	d11, w8
 4268100: b0055428     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4268104: f9455900     	ldr	x0, [x8, #0xab0]
 4268108: 952509ac     	bl	0x8baa7b8 <_ChromeMain+0x8ba551c>
 426810c: aa0003f6     	mov	x22, x0
 4268110: 52800022     	mov	w2, #0x1                ; =1
 4268114: 95fffc36     	bl	0xc2671ec <_ChromeMain+0xc261f50>
 4268118: f9400688     	ldr	x8, [x20, #0x8]
 426811c: f100051f     	cmp	x8, #0x1
 4268120: 9a9f8508     	csinc	x8, x8, xzr, hi
 4268124: 9e630100     	ucvtf	d0, x8
 4268128: 1e66d001     	fmov	d1, #22.00000000
 426812c: 1e610800     	fmul	d0, d0, d1
 4268130: b004e728     	adrp	x8, 0xdf4d000 <dyld_stub_binder+0xdf4d000>
 4268134: fd418901     	ldr	d1, [x8, #0x310]
 4268138: 1e612801     	fadd	d1, d0, d1
 426813c: d2e80e88     	mov	x8, #0x4074000000000000 ; =4644337115725824000
 4268140: 9e670100     	fmov	d0, x8
 4268144: 1e602020     	fcmp	d1, d0
 4268148: 1e61cc01     	fcsel	d1, d0, d1, gt
 426814c: aa1603e0     	mov	x0, x22
 4268150: 95843b96     	bl	0xa376fa8 <_ChromeMain+0xa371d0c>
 4268154: aa1603e0     	mov	x0, x22
 4268158: aa1503e2     	mov	x2, x21
 426815c: 95fffc27     	bl	0xc2671f8 <_ChromeMain+0xc261f5c>
 4268160: aa1503e0     	mov	x0, x21
 4268164: aa1603e2     	mov	x2, x22
 4268168: 95fffc27     	bl	0xc267204 <_ChromeMain+0xc261f68>
 426816c: aa1303e0     	mov	x0, x19
 4268170: 955e23c6     	bl	0x99f1088 <_ChromeMain+0x99ebdec>
 4268174: 94f66d71     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4268178: aa0003f4     	mov	x20, x0
 426817c: b0054a28     	adrp	x8, 0xebad000 <dyld_stub_binder+0xebad000>
 4268180: f944fd01     	ldr	x1, [x8, #0x9f8]
 4268184: aa1603e2     	mov	x2, x22
 4268188: 52800023     	mov	w3, #0x1                ; =1
 426818c: 95f7d0fb     	bl	0xc05c578 <_ChromeMain+0xc0572dc>
 4268190: aa1403e0     	mov	x0, x20
 4268194: 94f66d72     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 4268198: aa1603e0     	mov	x0, x22
 426819c: 4ea91d20     	mov.16b	v0, v9
 42681a0: 4ea81d01     	mov.16b	v1, v8
 42681a4: 4eab1d62     	mov.16b	v2, v11
 42681a8: 4eaa1d43     	mov.16b	v3, v10
 42681ac: aa1303e2     	mov	x2, x19
 42681b0: 52800023     	mov	w3, #0x1                ; =1
 42681b4: 95fffc17     	bl	0xc267210 <_ChromeMain+0xc261f74>
 42681b8: aa1603e0     	mov	x0, x22
 42681bc: 94f66d68     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42681c0: aa1503e0     	mov	x0, x21
 42681c4: 94f66d66     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42681c8: d2800015     	mov	x21, #0x0               ; =0
 42681cc: aa1303e0     	mov	x0, x19
 42681d0: 94f66d63     	bl	0x800375c <_ChromeMain+0x7ffe4c0>
 42681d4: b5000175     	cbnz	x21, 0x4268200 <_ChromeMain+0x4262f64>
 42681d8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 42681dc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 42681e0: a94857f6     	ldp	x22, x21, [sp, #0x80]
 42681e4: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 42681e8: a94667fa     	ldp	x26, x25, [sp, #0x60]
 42681ec: a9456ffc     	ldp	x28, x27, [sp, #0x50]
 42681f0: 6d4423e9     	ldp	d9, d8, [sp, #0x40]
 42681f4: 6d432beb     	ldp	d11, d10, [sp, #0x30]
 42681f8: 9102c3ff     	add	sp, sp, #0xb0
 42681fc: d65f03c0     	ret
 4268200: 12800008     	mov	w8, #-0x1               ; =-1
 4268204: b8e802a8     	ldaddal	w8, w8, [x21]
 4268208: 7100051f     	cmp	w8, #0x1
 426820c: 54fffe61     	b.ne	0x42681d8 <_ChromeMain+0x4262f3c>
 4268210: f9400aa8     	ldr	x8, [x21, #0x10]
 4268214: aa1503e0     	mov	x0, x21
 4268218: d63f0100     	blr	x8
 426821c: 17ffffef     	b	0x42681d8 <_ChromeMain+0x4262f3c>
 4268220: 12800008     	mov	w8, #-0x1               ; =-1
 4268224: b8e802a8     	ldaddal	w8, w8, [x21]
 4268228: 7100051f     	cmp	w8, #0x1
 426822c: 54000081     	b.ne	0x426823c <_ChromeMain+0x4262fa0>
 4268230: f9400aa8     	ldr	x8, [x21, #0x10]
 4268234: aa1503e0     	mov	x0, x21
 4268238: d63f0100     	blr	x8
 426823c: d2800015     	mov	x21, #0x0               ; =0
 4268240: b5fff1f7     	cbnz	x23, 0x426807c <_ChromeMain+0x4262de0>
 4268244: 17ffffa7     	b	0x42680e0 <_ChromeMain+0x4262e44>
 4268248: d4200020     	brk	#0x1
 426824c: aa0003f3     	mov	x19, x0
 4268250: f9400bf4     	ldr	x20, [sp, #0x10]
 4268254: b4000474     	cbz	x20, 0x42682e0 <_ChromeMain+0x4263044>
 4268258: f9400fe8     	ldr	x8, [sp, #0x18]
 426825c: 8b080909     	add	x9, x8, x8, lsl #2
 4268260: d37ced29     	lsl	x9, x9, #4
 4268264: aa1403e0     	mov	x0, x20
 4268268: b4000169     	cbz	x9, 0x4268294 <_ChromeMain+0x4262ff8>
 426826c: 8b140129     	add	x9, x9, x20
 4268270: d1014120     	sub	x0, x9, #0x50
 4268274: 928009e9     	mov	x9, #-0x50              ; =-80
 4268278: 9b097d15     	mul	x21, x8, x9
 426827c: b4fffe60     	cbz	x0, 0x4268248 <_ChromeMain+0x4262fac>
 4268280: 97ff9775     	bl	0x424e054 <_ChromeMain+0x4248db8>
 4268284: d1014000     	sub	x0, x0, #0x50
 4268288: b10142b5     	adds	x21, x21, #0x50
 426828c: 54ffff81     	b.ne	0x426827c <_ChromeMain+0x4262fe0>
 4268290: 1400001f     	b	0x426830c <_ChromeMain+0x4263070>
 4268294: cb000288     	sub	x8, x20, x0
 4268298: 9344fd08     	asr	x8, x8, #4
 426829c: b202e7e9     	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 42682a0: f29999a9     	movk	x9, #0xcccd
 42682a4: 9b097d08     	mul	x8, x8, x9
 42682a8: f9000fe8     	str	x8, [sp, #0x18]
 42682ac: f94013e8     	ldr	x8, [sp, #0x20]
 42682b0: 8b080908     	add	x8, x8, x8, lsl #2
 42682b4: d37ced01     	lsl	x1, x8, #4
 42682b8: 96f68300     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42682bc: 14000009     	b	0x42682e0 <_ChromeMain+0x4263044>
 42682c0: 14000003     	b	0x42682cc <_ChromeMain+0x4263030>
 42682c4: 14000002     	b	0x42682cc <_ChromeMain+0x4263030>
 42682c8: 14000001     	b	0x42682cc <_ChromeMain+0x4263030>
 42682cc: aa0003f3     	mov	x19, x0
 42682d0: 14000003     	b	0x42682dc <_ChromeMain+0x4263040>
 42682d4: aa0003f3     	mov	x19, x0
 42682d8: f9000fff     	str	xzr, [sp, #0x18]
 42682dc: b5000075     	cbnz	x21, 0x42682e8 <_ChromeMain+0x426304c>
 42682e0: aa1303e0     	mov	x0, x19
 42682e4: 94f66c88     	bl	0x8003504 <_ChromeMain+0x7ffe268>
 42682e8: 12800008     	mov	w8, #-0x1               ; =-1
 42682ec: b8e802a8     	ldaddal	w8, w8, [x21]
 42682f0: 7100051f     	cmp	w8, #0x1
 42682f4: 54ffff61     	b.ne	0x42682e0 <_ChromeMain+0x4263044>
 42682f8: f9400aa8     	ldr	x8, [x21, #0x10]
 42682fc: aa1503e0     	mov	x0, x21
 4268300: d63f0100     	blr	x8
 4268304: 17fffff7     	b	0x42682e0 <_ChromeMain+0x4263044>
 4268308: 9425573e     	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 426830c: f9400be0     	ldr	x0, [sp, #0x10]
 4268310: 17ffffe1     	b	0x4268294 <_ChromeMain+0x4262ff8>
 4268314: d503201f     	nop
 4268318: d503201f     	nop
